# L'extrait d'avant le jeu, regardé en vrai temps : python3 extrait.py   (captures dans /tmp/p5/extrait-*.png)
# On vérifie que les trois scènes font bien ce qu'elles montrent, et que le bouton jaune lance le vrai combat.
import sys, json, time
from playwright.sync_api import sync_playwright
from commun import ouvrir, SORTIE
with sync_playwright() as p:
    b, pg, errs, tc = ouvrir(p)
    vu = {}; t0 = time.time(); k = 0; der = -1
    lecture = "(()=>{const s=__pt.etat();return {i:s.extrait,ombre:s.P.ombre,nV:s.nVoient,cd:+s.P.ombreCD.toFixed(1),G:s.G.map(g=>[g.type,g.hp,g.etat]),P:[+s.P.x.toFixed(1),+s.P.y.toFixed(1),s.P.etat,s.P.hp],doigt:document.getElementById('doigt').classList.contains('pose'),voile:document.getElementById('regles').className,go:document.getElementById('btnGo').disabled}})()"
    journal = []
    while time.time() - t0 < float(sys.argv[1] if len(sys.argv) > 1 else 26):
        s = pg.evaluate(lecture); t = time.time() - t0
        e = vu.setdefault(s['i'], {'ombre': False, 'vu': False, 'tue': False, 'saut': False, 'coups': 0, 'hpMin': 99, 'doigts': 0, 'vie': 100})
        e['ombre'] |= s['ombre']; e['vu'] |= s['nV'] > 0; e['tue'] |= len(s['G']) == 0; e['saut'] |= s['P'][2] == 'saut'; e['vie'] = min(e['vie'], s['P'][3])
        if s['G']: e['hpMin'] = min(e['hpMin'], s['G'][0][1])
        if s['doigt']: e['doigts'] += 1
        if s['i'] != der or k % 6 == 0:
            pg.screenshot(path='%s/extrait-%02d.png' % (SORTIE, k)); journal.append((k, round(t, 1), s['i'], s['P'], s['ombre'], s['nV'], s['cd'], s['G'], s['doigt']))
        der = s['i']; k += 1; time.sleep(0.25)
    for j in journal: print(j)
    print(json.dumps(vu, ensure_ascii=False))
    ok = vu.get(0, {}).get('tue') and vu.get(0, {}).get('ombre') and vu.get(1, {}).get('vu') and vu.get(1, {}).get('ombre') and vu.get(2, {}).get('saut') and vu.get(2, {}).get('tue') and all(v['vie'] == 100 for v in vu.values())
    # le bouton jaune : le vrai combat démarre, vie pleine, vague 1, plus de doigt ni de voile
    pg.click('#btnGo', force=True); time.sleep(1.2); s = pg.evaluate("(()=>{const s=__pt.etat();return {extrait:s.extrait,phase:s.phase,vague:s.vague,hp:s.P.hp,n:s.G.length,voile:document.getElementById('regles').className,stats:s.stats.tues,cartes:s.P.cartes}})()")
    pg.screenshot(path='%s/extrait-depart.png' % SORTIE)
    print(s); ok = ok and s['extrait'] == -1 and s['phase'] == 'vague' and s['hp'] == 100 and s['voile'] == 'voile' and s['stats'] == 0
    print('ERREURS', errs[:6]); print('EXTRAIT', 'OK' if ok and not errs else 'NON')
    b.close()
