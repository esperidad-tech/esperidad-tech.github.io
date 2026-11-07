"""Banc d'essai « Repérer le mensonge » (v4) : captures téléphone et tablette,
règles des mimiques, hasard, partie gagnée, parties perdues.
Lancer depuis le dossier jeu/ :  python3 test/mensonge/essai.py"""
import os, json
from playwright.sync_api import sync_playwright

ICI = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(ICI, 'captures')
os.makedirs(OUT, exist_ok=True)
URL = 'file://' + ICI + '/index.html'

# Le bot « voit » le signe et marque la phrase ; à la fin il coche selon son mode puis valide.
BOT = """
(cfg) => new Promise(res => {
  const t0 = performance.now(), vus = {};
  let pendant = [];
  const it = setInterval(() => {
    const r = document.querySelector('.mjb-mensonge');
    if (document.querySelector('.mj-resultat')) { clearInterval(it); res({pendant}); return; }
    if (performance.now() - t0 > 120000) { clearInterval(it); res('TIMEOUT'); return; }
    if (!r) return;
    const v = r.querySelector('.mjb-m-verdict');
    if (v.hidden) {
      if (document.querySelector('.mjb-resultat, .mjb-m-note')) pendant.push('retour pendant la partie');
      const ph = r.dataset.phrase;
      if (cfg.mode === 'un-seul' && r.__signeActif && !vus[ph] && !Object.keys(vus).length) { vus[ph] = 1; setTimeout(() => document.querySelector('.mjb-accuse').click(), 300); }
      if (cfg.mode !== 'rate' && cfg.mode !== 'un-seul' && r.__signeActif && !vus[ph]) { vus[ph] = 1; setTimeout(() => { const b = document.querySelector('.mjb-accuse'); if (b.getAttribute('aria-pressed') !== 'true') b.click(); }, 300); }
      return;
    }
    if (!vus.fin) {
      vus.fin = 1;
      if (cfg.flair) {
        const iM = r.__rep.findIndex(x => x.ment), iV = r.__rep.findIndex(x => !x.ment);
        r.querySelector('.mjb-m-flair[data-i="' + iM + '"]').click();
        r.querySelector('.mjb-m-flair[data-i="' + iV + '"]').click();
        window.__flair = [iM, iV].map(i => r.querySelector('li[data-i="' + i + '"] .mjb-m-flair-txt').textContent);
      }
      if (cfg.mode === 'faux') {   // coche aussi une phrase vraie
        const i = r.__rep.findIndex(x => !x.ment);
        const c = r.querySelector('.mjb-m-choix[data-i="' + i + '"]');
        if (c.getAttribute('aria-pressed') !== 'true') c.click();
      }
      setTimeout(() => r.querySelector('.mjb-m-valider').click(), cfg.attente || 300);
    }
  }, 40);
})
"""

REGLES = """
() => {
  const M = MJ.TYPES.mensonge.MIMIQUES, p = window.__params;
  const out = {lies: [], problemes: []};
  for (let n = 0; n < 40; n++) {
    lancer({sansIntro: true, niv: 10});
    const r = document.querySelector('.mjb-mensonge');
    out.lies.push(r.__rep.map(x => x.ment ? 1 : 0).join(''));
    r.__scen.forEach((sc, i) => {
      const vraies = sc.ev.filter(x => !x.signe).map(x => x.id);
      const signes = sc.ev.filter(x => x.signe).map(x => x.id).concat(sc.couche ? [sc.couche.id] : []);
      if (vraies.length < 2 || vraies.length > 3) out.problemes.push('phrase ' + i + ' : ' + vraies.length + ' mimiques vraies');
      if (new Set(vraies).size !== vraies.length) out.problemes.push('mimiques en double');
      if (vraies.some(id => M[id].sorte !== 'vraie')) out.problemes.push('signe parmi les vraies');
      if (r.__rep[i].ment && signes.length !== 1) out.problemes.push('mensonge avec ' + signes.length + ' signes');
      if (!r.__rep[i].ment && signes.length !== 0) out.problemes.push('phrase vraie avec un signe');
      const tout = sc.ev.concat(sc.couche ? [sc.couche] : []);
      if (tout.some(x => x.t < 0.2 || x.t + x.actif > sc.D + 0.01)) out.problemes.push('mimique hors de la parole');
    });
  }
  out.combinaisons = [...new Set(out.lies)].length;
  out.nbVraies = Object.keys(M).filter(k => M[k].sorte === 'vraie').length;
  out.nbSignes = Object.keys(M).filter(k => M[k].sorte === 'signe').length;
  return out;
}
"""

def resultat(pg, chemin):
    pg.wait_for_selector('.mj-resultat', timeout=20000)
    pg.wait_for_timeout(700)
    pg.screenshot(path=chemin)
    txt = pg.inner_text('.mj-resultat')
    phrases = pg.evaluate("Array.from(document.querySelectorAll('.mjb-m-liste p')).map(p => p.textContent)")
    if any(ph[:18] in txt for ph in phrases): txt = 'FUITE ' + txt
    pg.click('.mj-continuer')
    pg.wait_for_timeout(100)
    return pg.evaluate('window.__fins[window.__fins.length - 1]'), txt

with sync_playwright() as p:
    b = p.chromium.launch()
    bilan = []
    for (nom, w, h, dsf) in [('tel', 390, 844, 2), ('tab', 800, 1280, 1)]:
        pg = b.new_page(viewport={'width': w, 'height': h}, device_scale_factor=dsf)
        errs = []
        pg.on('console', lambda m: errs.append(m.text) if m.type in ('error', 'warning') else None)
        pg.on('pageerror', lambda e: errs.append('PAGEERROR ' + str(e)))
        pg.goto(URL + '?niv=10&pnj=fortune')
        pg.wait_for_timeout(5000)
        pg.screenshot(path=f'{OUT}/{nom}-1-intro.png')
        pg.click('.mjb-m-aide-btn')
        pg.wait_for_timeout(2400)
        pg.screenshot(path=f'{OUT}/{nom}-2-signes.png')
        pg.click('.mjb-m-aide-ok')
        pg.click('.mj-go')
        pg.wait_for_timeout(3300)
        pg.screenshot(path=f'{OUT}/{nom}-3-parle.png')
        regles = pg.evaluate(REGLES)
        # une phrase mensongère photographiée pendant son signe (le coin, discret)
        pg.evaluate("lancer({sansIntro:true, niv:10, signes:['coin']})")
        pg.wait_for_function("() => { const r = document.querySelector('.mjb-mensonge'); return r && r.__signeActif; }", timeout=60000)
        pg.wait_for_timeout(300)
        pg.screenshot(path=f'{OUT}/{nom}-4-signe.png')
        pg.click('.mjb-accuse')
        pg.wait_for_timeout(200)
        pg.screenshot(path=f'{OUT}/{nom}-5-marquee.png')
        # partie gagnée (niveau 10, aucune erreur permise) avec une aide « Revoir »
        pg.evaluate("lancer({sansIntro:true, niv:10, mods:{aide:1}})")
        pg.wait_for_function("() => { const v = document.querySelector('.mjb-m-verdict'); return v && !v.hidden; }", timeout=90000)
        pg.wait_for_timeout(200)
        pg.screenshot(path=f'{OUT}/{nom}-6-verdict.png')
        pg.click('.mjb-m-revoir')
        pg.wait_for_timeout(1800)
        pg.screenshot(path=f'{OUT}/{nom}-6b-revoir.png')
        pg.evaluate("lancer({sansIntro:true, niv:10, mods:{indice:2}})")
        r_g = pg.evaluate(BOT, {'mode': 'gagne', 'flair': True})
        f_g, t_g = resultat(pg, f'{OUT}/{nom}-7-gagne.png')
        brut_g = pg.evaluate('window.__brut'); flair = pg.evaluate('window.__flair')
        # contenu « enquête » : 6 phrases dont 2 mensonges, le bot les marque toutes les deux
        ENQ = "[{texte:'Je suis passé à la mairie ce matin.', ment:false},{texte:'Je n\\'ai jamais vu cette lettre.', ment:true},{texte:'Il pleuvait fort hier soir.', ment:false},{texte:'Le moulin était fermé à clé.', ment:true},{texte:'Margot sert la soupe à midi.', ment:false},{texte:'J\\'aime beaucoup les chats.', ment:false}]"
        pg.evaluate("lancer({sansIntro:true, niv:10, repliques:" + ENQ + "})")
        pg.evaluate(BOT, {'mode': 'gagne'})
        f_6, t_6 = resultat(pg, f'{OUT}/{nom}-7b-gagne-6-phrases.png')
        brut_6 = pg.evaluate('window.__brut')
        # 6 phrases, 2 mensonges, on n'en marque qu'un : raté
        pg.evaluate("lancer({sansIntro:true, niv:10, repliques:" + ENQ + "})")
        pg.evaluate(BOT, {'mode': 'un-seul'})
        f_1, t_1 = resultat(pg, f'{OUT}/{nom}-7c-perdu-un-seul.png')
        # perdue : une phrase vraie cochée en plus
        pg.evaluate("lancer({sansIntro:true, niv:10})")
        pg.evaluate(BOT, {'mode': 'faux'})
        f_f, t_f = resultat(pg, f'{OUT}/{nom}-8-perdu-faux.png')
        # perdue : rien de coché
        pg.evaluate("lancer({sansIntro:true, niv:10})")
        pg.evaluate(BOT, {'mode': 'rate'})
        f_r, t_r = resultat(pg, f'{OUT}/{nom}-9-perdu-rate.png')
        fuite = [t for t in (t_g, t_f, t_r) if t.startswith('FUITE')]
        aides = pg.evaluate("""() => ({
          signes2: MJ.reglages('mensonge', 10, {signes:2}).listeSignes,
          signes6: MJ.reglages('mensonge', 10, {signes:6}).listeSignes,
          signes9: MJ.reglages('mensonge', 10, {signes:9}).listeSignes,
          phrases: (lancer({sansIntro:true, niv:10, mods:{phrases:3}}), document.querySelector('.mjb-mensonge').__rep.length),
          lignes: MJ.reglages('mensonge', 10, {signes:2, phrases:1, indice:2, aide:1, revele:true}).lignes.map(l => l.nom + ' : ' + l.val)
        })""")
        rev_ok = all(set(ph.keys()) == {'texte', 'avis'} for b in (brut_g, brut_6) for ph in b['revision']['phrases']) and brut_g['revision']['type'] == 'mensonge'
        bilan.append({'ecran': nom, 'six_phrases_gagne': f_6.get('reussi'), 'six_phrases_un_seul': f_1.get('reussi'), 'flair': flair,
                      'revision_ok': rev_ok, 'revision_exemple': brut_6['revision'], 'aides': aides, 'gagne': f_g, 'faux': f_f, 'rate': f_r, 'retour_pendant': r_g, 'fuite_phrase_dans_resultat': fuite,
                      'regles': {'problemes': regles['problemes'][:5], 'combinaisons_de_mensonges': regles['combinaisons'], 'vraies': regles['nbVraies'], 'signes': regles['nbSignes']},
                      'lectures_auto': pg.evaluate('window.__lus'), 'erreurs_console': errs})
        pg.close()
    b.close()
    for x in bilan:
        print(json.dumps(x, ensure_ascii=False)[:2400])
    ok = all(isinstance(x['gagne'], dict) and x['gagne'].get('reussi') and not x['faux'].get('reussi') and not x['rate'].get('reussi')
             and not x['lectures_auto'] and not x['erreurs_console'] and not x['regles']['problemes'] and not x['fuite_phrase_dans_resultat']
             and x['regles']['combinaisons_de_mensonges'] > 3 and x['six_phrases_gagne'] and not x['six_phrases_un_seul'] and x['revision_ok']
             and x['flair'] == ['🤷 Ton flair ne te dit rien sur celle-ci.', '👃 Celle-ci est sûrement vraie.']
             and x['aides']['phrases'] == 3 and len(x['aides']['signes9']) >= 1 and 'sueur' not in x['aides']['signes2'] for x in bilan)
    print('RÉSULTAT :', 'OK' if ok else 'ÉCHEC')
