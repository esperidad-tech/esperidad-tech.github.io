#!/usr/bin/env python3
"""Rend les sons de l'atelier hors ligne (Chromium + OfflineAudioContext), les écrit en WAV,
mesure leur niveau (sonie « à la tablette » : sans les graves que le haut-parleur ne rend pas)
et dessine des spectrogrammes pour les regarder.

  python3 verifier.py                 -> tous les bruitages
  python3 verifier.py arcA volB       -> seulement ceux-là
  python3 verifier.py --musiques      -> les musiques (40 s chacune)
  python3 verifier.py --page FICHIER  -> utilise la page construite au lieu des sources
  --sans-planche                      -> seulement les mesures (plus rapide), sans dessiner les spectrogrammes
"""
import sys, os, json, base64, wave, math
import numpy as np
from scipy import signal
from playwright.sync_api import sync_playwright

ICI = os.path.dirname(os.path.abspath(__file__))
SORTIE = os.path.join(ICI, 'rendus')
os.makedirs(SORTIE, exist_ok=True)

def page_banc():
    p = os.path.join(SORTIE, '_banc.html')
    scripts = ''.join('<script src="file://%s"></script>' % os.path.join(ICI, f) for f in ['moteur.js', 'bruitages.js', 'musiques.js', 'bestiaire.js', 'donjon.js', 'musiques-donjon.js', 'banc.js'])
    open(p, 'w').write('<!doctype html><meta charset="utf-8"><body>' + scripts)
    return 'file://' + p

def ecrire_wav(nom, data, sr):
    with wave.open(os.path.join(SORTIE, nom + '.wav'), 'wb') as w:
        w.setnchannels(2); w.setsampwidth(2); w.setframerate(sr); w.writeframes(data)

def sonie(x, sr, centile=None):
    """sonie momentanée maximale (fenêtres de 400 ms), avec un filtre « tablette » :
    coupe sous 250 Hz (le haut-parleur ne les rend pas) et +4 dB au-dessus de 1,5 kHz (l'oreille y est sensible)."""
    b1, a1 = signal.butter(2, 250 / (sr / 2), 'highpass')
    y = signal.lfilter(b1, a1, x, axis=0)
    # plateau aigu +4 dB (filtre en plateau approché)
    b2, a2 = signal.butter(1, 1500 / (sr / 2), 'highpass')
    y = y + (10 ** (4 / 20) - 1) * signal.lfilter(b2, a2, y, axis=0)
    n = int(.4 * sr); pas = int(.1 * sr)
    ms = [np.mean(np.sum(y[i:i + n] ** 2, axis=1)) for i in range(0, max(1, len(y) - n), pas)]
    m = max(ms) if ms else 1e-12
    if centile: m = float(np.percentile(ms, centile)) if ms else 1e-12
    return -0.691 + 10 * math.log10(max(m, 1e-12))

def analyse(nom, r):
    raw = base64.b64decode(r['b64'])
    sr = r['sr']
    ecrire_wav(nom.replace(':', '_'), raw, sr)
    x = np.frombuffer(raw, dtype=np.int16).reshape(-1, 2).astype(np.float64) / 32767 * r['echelle']
    env = np.max(np.abs(x), axis=1)
    seuil = 10 ** (-50 / 20)
    actifs = np.where(env > seuil)[0]
    debut = actifs[0] / sr if len(actifs) else None
    fin = actifs[-1] / sr if len(actifs) else None
    rms = math.sqrt(np.mean(x ** 2)) if len(x) else 0
    # un clic : un saut énorme d'un échantillon au suivant
    saut = float(np.max(np.abs(np.diff(x, axis=0)))) if len(x) > 1 else 0
    dc = float(np.mean(x))
    return {'nom': nom, 'pic': r['pic'], 'nan': r['nan'], 'debut': debut, 'fin': fin, 'rms_db': 20 * math.log10(max(rms, 1e-9)),
            'sonie': sonie(x, sr), 'sonie90': sonie(x, sr, 90), 'saut': saut, 'dc': dc, 'duree_annoncee': r.get('duree'), 'moment': r.get('moment'),
            'prep_ms': r['prep'], 'rendu_ms': r['rendu'], 'simult': r.get('simult'), 'nsources': r.get('nsources'), 'x': x, 'sr': sr}

def planche(res, fichier, fmax=12000):
    import matplotlib
    matplotlib.use('Agg')
    import matplotlib.pyplot as plt
    n = len(res); cols = 2; rows = (n + 1) // 2
    fig, axs = plt.subplots(rows, cols, figsize=(14, 2.3 * rows), squeeze=False)
    for k, r in enumerate(res):
        ax = axs[k // cols][k % cols]
        x = r['x'][:, 0] + r['x'][:, 1]
        f, t, S = signal.spectrogram(x, r['sr'], nperseg=512, noverlap=448)
        S = 10 * np.log10(S + 1e-12)
        mx = S.max()
        ax.pcolormesh(t, f, S, vmin=mx - 70, vmax=mx, shading='auto', cmap='magma')
        ax.set_ylim(0, fmax)
        if r['fin']: ax.set_xlim(0, max(.6, r['fin'] + .1))
        # l'enveloppe en dB par-dessus
        sr = r['sr']; hop = int(sr * .01)
        e = [20 * math.log10(max(1e-6, np.max(np.abs(x[i:i + hop])))) for i in range(0, len(x) - hop, hop)]
        ax2 = ax.twinx(); ax2.plot(np.arange(len(e)) * .01, e, color='cyan', lw=.7); ax2.set_ylim(-70, 6); ax2.set_yticks([])
        if r['fin']: ax2.set_xlim(0, max(.6, r['fin'] + .1))
        ax.set_title('%s  pic %.2f  sonie %.1f  %s→%s s' % (r['nom'], r['pic'], r['sonie'], r['debut'] and round(r['debut'], 2), r['fin'] and round(r['fin'], 2)), fontsize=9)
        ax.tick_params(labelsize=7)
    for k in range(n, rows * cols): axs[k // cols][k % cols].axis('off')
    fig.tight_layout(); fig.savefig(fichier, dpi=70); plt.close(fig)

def main():
    args = [a for a in sys.argv[1:]]
    musiques = '--musiques' in args
    dessiner = '--sans-planche' not in args
    url = None
    duree_mus = 40
    if '--duree' in args:
        i = args.index('--duree'); duree_mus = float(args[i + 1]); del args[i:i + 2]
    if '--page' in args:
        i = args.index('--page'); url = 'file://' + os.path.abspath(args[i + 1]); del args[i:i + 2]
    args = [a for a in args if not a.startswith('--')]
    with sync_playwright() as p:
        nav = p.chromium.launch()
        pg = nav.new_page()
        erreurs = []
        pg.on('pageerror', lambda e: erreurs.append(str(e)))
        pg.on('console', lambda m: m.type in ('error', 'warning') and erreurs.append(m.text))
        pg.goto(url or page_banc())
        pg.wait_for_function('!!(window.BRUITAGES && window.MUSIQUES && window.ATELIER_RENDRE)')
        if musiques:
            noms = args or ['M:' + k for k in pg.evaluate('Object.keys(MUSIQUES)')]
        else:
            noms = args or pg.evaluate("Object.keys(BRUITAGES).filter(k => typeof BRUITAGES[k] === 'function')")
        res = []
        for nom in noms:
            if nom.startswith('M:'):
                r = pg.evaluate('([n, d]) => ATELIER_RENDRE(n, d, {sr: 32000, niveau: (window.NIVEAUX || {})[n.slice(2)] || 1})', [nom, duree_mus])
            else:
                r = pg.evaluate('([n, d]) => ATELIER_RENDRE(n, d, {niveau: (window.NIVEAUX || {})[n] || 1})', [nom, 6])
            a = analyse(nom, r)
            res.append(a)
            print('%-16s pic %.3f  sonie %6.1f  rms %6.1f  %s→%s  annoncé %s  saut %.2f  dc %.4f  nan %d  prépa %d ms  rendu %d ms  simultanés %s / %s' % (
                nom, a['pic'], a['sonie'], a['rms_db'], a['debut'] and round(a['debut'], 2), a['fin'] and round(a['fin'], 2),
                a['duree_annoncee'], a['saut'], a['dc'], a['nan'], a['prep_ms'], a['rendu_ms'], a['simult'], a['nsources']), flush=True)
        for e in erreurs: print('ERREUR JS :', e)
        nav.close()
    # les planches
    k = 0
    for i in (range(0, len(res), 8) if dessiner else []):
        planche(res[i:i + 8], os.path.join(SORTIE, 'planche-%s%d.png' % ('mus-' if musiques else '', k)), fmax=8000 if musiques else 12000); k += 1
    fj = os.path.join(SORTIE, 'mesures-%s.json' % ('musiques' if musiques else 'bruitages'))
    tout = json.load(open(fj)) if os.path.exists(fj) and url is None else {}
    tout.update({r['nom']: {'sonie': r['sonie'], 'sonie90': r['sonie90'], 'pic': r['pic'], 'fin': r['fin']} for r in res})
    if url is None: json.dump(tout, open(fj, 'w'), indent=1)

if __name__ == '__main__':
    main()
