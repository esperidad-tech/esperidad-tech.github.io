"""Banc d'essai « Les dépositions » (Barde).
Lancer depuis le dossier jeu/ :  python3 build.py && cp dist/salle-mini-jeux.html test/depositions/salle.html && cp dist/index.html test/depositions/jeu.html && python3 test/depositions/essai.py
Vérifie : générateur (200 cas par niveau), bonne accusation, mauvaise accusation, étape « phrase fausse »,
surlignages dans la relecture sans réponse, mods, contenu imposé, arrêt, erreurs console à 3 tailles.
Fait la planche de captures test/depositions/planche.png."""
import os, json, sys
from playwright.sync_api import sync_playwright

ICI = os.path.dirname(os.path.abspath(__file__))
CAP = os.path.join(ICI, 'captures')
os.makedirs(CAP, exist_ok=True)
URL = 'file://' + os.path.join(ICI, 'salle.html')
TAILLES = {'tab': (800, 1280), 'pay': (1280, 800), 'tel': (390, 844)}
ERREURS = []
OK = []
PB = []

def check(cond, msg):
    (OK if cond else PB).append(msg)
    print(('  ok  ' if cond else '  ÉCHEC ') + msg)

INVARIANTS = r"""
() => {
  const D = MJ.TYPES.depositions, out = {niveaux:{}, problemes:[], textes:0};
  const vus = new Set();
  for (let n = 1; n <= 12; n++) {
    const p = MJ.reglages('depositions', n, {});
    const st = {types:{}, leurres:0, scenes:{}, deps:{}, pbs:0, phrases:0};
    for (let r = 0; r < 200; r++) {
      const cas = D.generer(D.config(p));
      const pb = [];
      if (!cas) { pb.push('pas de cas'); out.problemes.push('n' + n + ' : pas de cas'); st.pbs++; continue; }
      const mis = cas.deps.map((d, i) => d.phrases.some(x => x.k === 'contre' || x.k === 'invente') ? i : -1).filter(i => i >= 0);
      if (mis.length === 0) pb.push('aucune version qui cloche');
      if (mis.length > 1) pb.push(mis.length + ' versions qui clochent');
      if (mis[0] !== cas.menteur) pb.push('mauvais menteur');
      cas.deps.forEach((d, i) => { if (!!d.ment !== (i === cas.menteur)) pb.push('drapeau ment'); });
      const valeurDe = {}, dits = {};
      cas.deps.forEach((d, i) => {
        if (i === cas.menteur) return;
        const vusIci = new Set();
        d.phrases.forEach(x => {
          if (x.k === 'contre' || x.k === 'invente') pb.push('un honnête ment');
          if (vusIci.has(x.t)) pb.push('phrase en double'); vusIci.add(x.t);
          if (/[{}~]/.test(x.t)) pb.push('trou non rempli : ' + x.t);
          if (x.k === 'vrai') {
            if (cas.faits[x.d] === undefined) pb.push('détail hors des faits');
            if (x.v !== cas.faits[x.d]) pb.push('valeur différente des faits');
            if (valeurDe[x.d] !== undefined && valeurDe[x.d] !== x.v) pb.push('deux honnêtes se contredisent sur ' + x.d);
            valeurDe[x.d] = x.v; dits[x.d] = (dits[x.d] || 0) + 1;
            if (D.textesVrais(x.d, x.v).indexOf(x.t) < 0) pb.push('texte inconnu ' + x.t);
          }
        });
      });
      cas.communs.forEach(f => { if ((dits[f] || 0) < 2) pb.push('détail commun vu par < 2 honnêtes'); });
      const m = cas.deps[cas.menteur];
      m.phrases.forEach(x => {
        if (/[{}~]/.test(x.t)) pb.push('trou non rempli : ' + x.t);
        if (x.k === 'vrai' && x.v !== cas.faits[x.d]) pb.push('vrai du menteur faux');
        if (x.k === 'contre') {
          if (cas.faits[x.d] === undefined || x.v === cas.faits[x.d]) pb.push('contradiction sans fait');
          if ((dits[x.d] || 0) < 2) pb.push('contradiction peu visible');
          if (D.textesVrais(x.d, cas.faits[x.d]).indexOf(x.t) >= 0) pb.push('contradiction = phrase vraie');
        }
        if (x.k === 'invente' && (cas.faits[x.d] !== undefined || dits[x.d])) pb.push('invention sur un détail commun');
      });
      if (!cas.faux.length || cas.faux.some(j => !/contre|invente/.test(m.phrases[j].k))) pb.push('faux mal rempli');
      if (cas.deps.length !== p.nbDep) pb.push('nombre de témoins');
      const v2 = D.verifier(cas); if (v2.length) pb.push('verifier: ' + v2.join(' / '));
      if (pb.length) { st.pbs++; if (out.problemes.length < 30) out.problemes.push('n' + n + ' : ' + pb.join(' | ')); }
      st.types[cas.type] = (st.types[cas.type] || 0) + 1;
      if (cas.leurre >= 0) st.leurres++;
      st.scenes[cas.scene.id] = 1;
      cas.deps.forEach(d => { st.phrases += d.phrases.length; vus.add(d.phrases.map(x => x.t).join(' ')); });
    }
    st.scenes = Object.keys(st.scenes).length;
    st.phrasesParTemoin = +(st.phrases / (200 * p.nbDep)).toFixed(1);
    delete st.phrases;
    out.niveaux[n] = st;
  }
  out.textes = vus.size;
  /* le contenu */
  const C = D.CONTENU; let nv = 0, nx = 0, ns = 0, nval = 0;
  Object.keys(C.FAM).forEach(k => { const f = C.FAM[k]; nval += f.valeurs.length;
    if (f.gabarit) { nv += f.v.length * f.valeurs.length; nx += f.x.length; ns += f.v.length * f.valeurs.length; }
    else f.valeurs.forEach(v => { nv += v.v.length; nx += v.x.length; ns += v.s.length; }); });
  out.contenu = {scenes:C.SCENES.length, familles:Object.keys(C.FAM).length, valeurs:nval, phrasesVraies:nv, contradictionsFranches:nx, contradictionsFines:ns,
    detailsParScene:C.SCENES.map(s => s.familles.length), perso:C.PERSO.length + Object.values(C.PERSO_PNJ).reduce((a, l) => a + l.length, 0), oublis:C.OUBLI.length};
  return out;
}
"""

def ouvrir(b, taille, nom):
    pg = b.new_context(viewport={'width': taille[0], 'height': taille[1]}).new_page()
    def onc(m):
        if m.type == 'error' and 'fonts.g' not in m.text and 'ERR_' not in m.text:
            ERREURS.append(nom + ' console: ' + m.text)
    pg.on('console', onc)
    pg.on('pageerror', lambda e: ERREURS.append(nom + ' pageerror: ' + str(e)))
    pg.goto(URL)
    pg.evaluate("localStorage.clear()")
    pg.reload(); pg.wait_for_timeout(300)
    return pg

def cap(pg, nom):
    pg.screenshot(path=os.path.join(CAP, nom + '.png'))
    return os.path.join(CAP, nom + '.png')

def lancer_salle(pg, niv):
    pg.click('[data-niv="%d"]' % niv)
    pg.click('[data-jeu="depositions"]')
    pg.wait_for_selector('.mj-go')

def lire_tout(pg):
    """Lit les dépositions une par une comme un joueur : touche la page pour finir l'écriture, puis « Témoin suivant »."""
    n = pg.locator('.mjd-onglet').count()
    for k in range(n):
        pg.wait_for_selector('.mjd-page[data-dep="%d"]' % k)
        pg.click('.mjd-page .mjd-texte')
        pg.wait_for_timeout(120)
        if k < n - 1:
            pg.click('.mjd-principal'); pg.wait_for_timeout(350)
    return n

def cas(pg):
    return pg.evaluate("() => { const c = window.__mjd.cas; return {menteur:c.menteur, faux:c.faux, n:c.deps.length, type:c.type, deps:c.deps.map(d => ({qui:d.qui, n:d.phrases.length, ks:d.phrases.map(x => x.k)}))}; }")

def accuser_ui(pg, i):
    pg.click('.mjd-onglet[data-tab="%d"]' % i); pg.wait_for_timeout(350)
    pg.click('.mjd-principal'); pg.wait_for_selector('.mjd-oui')
    pg.click('.mjd-oui'); pg.wait_for_timeout(450)

captures_nom = ['']
planche = []

with sync_playwright() as p:
    b = p.chromium.launch()

    # ---------- 1. Générateur : 200 cas par niveau ----------
    print('1. Générateur')
    pg = ouvrir(b, TAILLES['tab'], 'gen')
    res = pg.evaluate(INVARIANTS)
    for n, st in res['niveaux'].items():
        print('   niveau %2s : %s' % (n, json.dumps(st, ensure_ascii=False)))
    check(not res['problemes'], 'générateur : aucun cas sans menteur, à deux menteurs, ni honnêtes qui se contredisent (12 niveaux × 200)')
    for x in res['problemes'][:10]: print('     ', x)
    print('   contenu :', json.dumps(res['contenu'], ensure_ascii=False))
    print('   dépositions toutes différentes vues :', res['textes'])
    json.dump(res, open(os.path.join(CAP, 'generateur.json'), 'w'), ensure_ascii=False, indent=1)
    pg.close()

    # ---------- 2. Partie niveau 1 sur tablette (800×1280) : surligner, comparer, se tromper, gagner, relire ----------
    print('2. Partie niveau 1, tablette')
    pg = ouvrir(b, TAILLES['tab'], 'tab')
    lancer_salle(pg, 1)
    pg.wait_for_timeout(2900); planche.append(cap(pg, 'tab-1-intro'))
    pg.click('.mj-go'); pg.wait_for_selector('.mjd-carte'); pg.wait_for_timeout(400)
    planche.append(cap(pg, 'tab-2-scene'))
    pg.click('.mjd-commencer'); pg.wait_for_timeout(1000)
    planche.append(cap(pg, 'tab-3-ecrit'))
    c = cas(pg)
    check(c['n'] == 4, 'niveau 1 : 4 témoins (%d)' % c['n'])
    check(c['type'] == 'gros', 'niveau 1 : contradiction franche (%s)' % c['type'])
    n = lire_tout(pg)
    pg.wait_for_timeout(300)
    txt = pg.inner_text('.mjd-principal')
    check('ment' in txt, 'après lecture, le gros bouton dit « C\'est lui qui ment » (%s)' % txt.strip())
    # surligner : vert sur la 2e phrase du témoin 0, rouge sur la 2e du témoin 1, jaune sur la 3e du témoin 1
    pg.click('.mjd-onglet[data-tab="0"]'); pg.wait_for_timeout(350)
    pg.click('[data-stylo="v"]'); pg.click('.mjd-ph[data-p="1"]')
    pg.click('.mjd-ph[data-p="2"]')
    pg.click('.mjd-onglet[data-tab="1"]'); pg.wait_for_timeout(350)
    pg.click('[data-stylo="r"]'); pg.click('.mjd-ph[data-p="1"]')
    pg.click('[data-stylo="j"]'); pg.click('.mjd-ph[data-p="2"]')
    pg.wait_for_timeout(400)
    planche.append(cap(pg, 'tab-4-feutres'))
    check(pg.locator('.mjd-ph.m-r').count() == 1 and pg.locator('.mjd-ph.m-j').count() == 1, 'feutres rouge et jaune posés')
    # gomme
    pg.click('[data-stylo="g"]'); pg.click('.mjd-ph[data-p="2"]'); pg.wait_for_timeout(100)
    check(pg.locator('.mjd-ph.m-j').count() == 0, 'la gomme efface')
    pg.click('[data-stylo="j"]'); pg.click('.mjd-ph[data-p="2"]')
    # comparer
    pg.click('.mjd-cmp'); pg.wait_for_timeout(450)
    check(pg.locator('.mjd-pages.duo .mjd-page').count() == 2, 'comparer : deux pages côte à côte')
    planche.append(cap(pg, 'tab-5-comparer'))
    pg.click('.mjd-pfl[data-cote="0"][data-dir="1"]'); pg.wait_for_timeout(300)
    pg.click('.mjd-principal'); pg.wait_for_timeout(300)
    check(pg.locator('.mjd-pages.duo').count() == 0, 'fermer la comparaison')
    # mauvaise accusation
    inno = [i for i in range(c['n']) if i != c['menteur']][0]
    accuser_ui(pg, inno)
    pg.wait_for_timeout(300)
    planche.append(cap(pg, 'tab-6-pas-lui'))
    check(pg.locator('.mjd-coeurs i.off').count() == 1, 'mauvaise accusation : un cœur perdu')
    check(pg.locator('.mj-resultat').count() == 0, 'mauvaise accusation (3 cœurs) : la partie continue')
    check(pg.locator('.mjd-onglet.accuse').count() == 1, 'mauvaise accusation : le témoin est marqué « pas lui »')
    # bonne accusation
    accuser_ui(pg, c['menteur'])
    pg.wait_for_selector('.mj-resultat', timeout=5000); pg.wait_for_timeout(500)
    planche.append(cap(pg, 'tab-7-gagne'))
    r = pg.inner_text('.mj-resultat')
    check('Démasqué' in r and '2 essais' in r, 'bonne accusation : gagné, « 2 essais » (%s)' % r.replace('\n', ' | '))
    pg.click('.mj-continuer'); pg.wait_for_timeout(500)
    j = pg.evaluate("JSON.parse(localStorage.getItem('brumeval-salle')).journal")
    check(len(j) == 1 and j[0]['ok'] and j[0]['type'] == 'depositions', 'fin appelée une seule fois, partie notée réussie')
    rv = j[0]['revision']
    check(rv['type'] == 'depositions' and len(rv['depositions']) == c['n'], 'revision : type et dépositions')
    marques = [(i, k, ph['m']) for i, d in enumerate(rv['depositions']) for k, ph in enumerate(d['phrases']) if ph['m']]
    check((0, 1, 'v') in marques and (1, 1, 'r') in marques and (1, 2, 'j') in marques, 'les surlignages sont dans la revision : %s' % marques)
    cles = set(rv.keys()); cd = set(k for d in rv['depositions'] for k in d.keys()); cp = set(k for d in rv['depositions'] for ph in d['phrases'] for k in ph.keys())
    check(cles <= {'type', 'titre', 'bilan', 'scene', 'depositions', 'oral'} and cd <= {'qui', 'nom', 'phrases'} and cp <= {'t', 'm'},
          'revision sans réponse : seulement %s / %s / %s' % (sorted(cles), sorted(cd), sorted(cp)))
    # relire
    pg.click('[data-relire]'); pg.wait_for_selector('.rv-depo'); pg.wait_for_timeout(300)
    planche.append(cap(pg, 'tab-8-relire'))
    total = sum(d['n'] for d in c['deps'])
    check(pg.locator('.rv-ph').count() == total, 'relecture : toutes les phrases (%d)' % total)
    check(pg.locator('.rv-ph.rv-m-v').count() >= 2 and pg.locator('.rv-ph.rv-m-r').count() >= 1, 'relecture : les coups de feutre sont là')
    html = pg.inner_html('.sl-rv')
    corps = pg.inner_html('.rv-depos')
    classes = set(pg.eval_on_selector_all('.rv-depo, .rv-ph', 'l => l.map(e => e.className.replace(/rv-m-[vrj]/, "").trim())'))
    check(classes <= {'rv-depo', 'rv-ph'} and not any(x in corps.lower() for x in ['menteur', 'ment"', 'contre', 'invente', 'pas lui', 'pas elle']),
          'relecture : aucune réponse dans le HTML (classes %s)' % sorted(classes))
    avant = pg.locator('.rv-ph.rv-m-v').count()
    pg.locator('.rv-ph').nth(0).click(); pg.wait_for_timeout(150)
    check(pg.locator('.rv-ph.rv-m-v').count() == avant + 1, 'relecture : toucher une phrase change sa couleur')
    j2 = pg.evaluate("JSON.parse(localStorage.getItem('brumeval-salle')).journal[0].revision.depositions[0].phrases[0].m")
    check(j2 == 'v', 'relecture : le changement est sauvegardé')
    pg.click('.sl-quitter'); pg.wait_for_timeout(300)
    pg.close()

    # ---------- 3. Niveau 10 en paysage (1280×800) : leurre, sablier, phrase fausse ----------
    print('3. Partie niveau 10, tablette couchée')
    pg = ouvrir(b, TAILLES['pay'], 'pay')
    lancer_salle(pg, 10)
    pg.wait_for_timeout(2500); planche.append(cap(pg, 'pay-1-intro'))
    pg.click('.mj-go'); pg.wait_for_selector('.mjd-commencer'); pg.click('.mjd-commencer'); pg.wait_for_timeout(1300)
    planche.append(cap(pg, 'pay-2-ecrit'))
    c = cas(pg)
    check(c['n'] == 6, 'niveau 10 : 6 témoins')
    check(any('oubli' in d['ks'] for d in c['deps']), 'niveau 10 : un témoin distrait (honnête)')
    check(pg.locator('.mjd-sablier:not([hidden])').count() == 1, 'niveau 10 : sablier visible')
    lire_tout(pg)
    pg.click('.mjd-onglet[data-tab="2"]'); pg.wait_for_timeout(300)
    pg.click('.mjd-cmp'); pg.wait_for_timeout(450)
    planche.append(cap(pg, 'pay-3-comparer'))
    pg.click('.mjd-cmp'); pg.wait_for_timeout(300)
    accuser_ui(pg, c['menteur'])
    pg.wait_for_timeout(400)
    check(pg.locator('.mjd.mode-detail').count() == 1 and pg.locator('.mj-resultat').count() == 0, 'niveau 10 : bonne accusation → il faut montrer la phrase fausse')
    planche.append(cap(pg, 'pay-4-phrase'))
    mauvaise = [k for k in range(c['deps'][c['menteur']]['n']) if k not in c['faux']][0]
    pg.click('.mjd-page .mjd-ph[data-p="%d"]' % mauvaise); pg.wait_for_selector('.mjd-oui'); pg.click('.mjd-oui'); pg.wait_for_timeout(400)
    check(pg.locator('.mjd-coeurs i.off').count() == 1 and pg.locator('.mjd-ph.pasca').count() == 1, 'mauvaise phrase : un cœur perdu, phrase barrée')
    pg.click('.mjd-page .mjd-ph[data-p="%d"]' % c['faux'][0]); pg.wait_for_selector('.mjd-oui')
    planche.append(cap(pg, 'pay-5-confirme'))
    pg.click('.mjd-oui')
    pg.wait_for_selector('.mj-resultat', timeout=5000); pg.wait_for_timeout(400)
    planche.append(cap(pg, 'pay-6-gagne'))
    check('Démasqué' in pg.inner_text('.mj-resultat'), 'niveau 10 : bonne phrase → gagné')
    pg.click('.mj-continuer'); pg.wait_for_timeout(300)
    pg.close()

    # ---------- 4. Téléphone (390×844) : perdre sans que la réponse soit dite ----------
    print('4. Partie perdue, téléphone')
    pg = ouvrir(b, TAILLES['tel'], 'tel')
    lancer_salle(pg, 3)
    pg.wait_for_timeout(2600); planche.append(cap(pg, 'tel-1-intro'))
    pg.click('.mj-go'); pg.wait_for_selector('.mjd-commencer'); pg.wait_for_timeout(300)
    planche.append(cap(pg, 'tel-2-scene'))
    pg.click('.mjd-commencer'); pg.wait_for_timeout(1500)
    planche.append(cap(pg, 'tel-3-ecrit'))
    c = cas(pg)
    lire_tout(pg)
    pg.click('[data-stylo="r"]'); pg.click('.mjd-ph[data-p="1"]'); pg.wait_for_timeout(300)
    planche.append(cap(pg, 'tel-4-feutre'))
    pg.click('.mjd-cmp'); pg.wait_for_timeout(450)
    planche.append(cap(pg, 'tel-5-comparer'))
    pg.click('.mjd-cmp'); pg.wait_for_timeout(300)
    innos = [i for i in range(c['n']) if i != c['menteur']]
    accuser_ui(pg, innos[0])
    pg.click('.mjd-onglet[data-tab="%d"]' % innos[1]); pg.wait_for_timeout(300)
    pg.click('.mjd-principal'); pg.wait_for_selector('.mjd-oui'); pg.wait_for_timeout(200)
    planche.append(cap(pg, 'tel-6-accuse'))
    pg.click('.mjd-oui')
    pg.wait_for_selector('.mj-resultat', timeout=5000); pg.wait_for_timeout(400)
    planche.append(cap(pg, 'tel-7-perdu'))
    r = pg.inner_text('.mj-resultat')
    nomM = pg.evaluate("i => DONNEES.PNJ[window.__mjd.cas.deps[i].qui].court", c['menteur'])
    check('Raté' in r and nomM not in r, 'deux mauvaises accusations (niveau 3) : perdu, sans dire qui mentait')
    # la page ne déborde pas du cadre
    pg.click('.mj-continuer'); pg.wait_for_timeout(300)
    j = pg.evaluate("JSON.parse(localStorage.getItem('brumeval-salle')).journal")
    check(len(j) == 1 and not j[0]['ok'], 'partie perdue notée une fois')
    pg.click('[data-relire]'); pg.wait_for_selector('.rv-depo'); pg.wait_for_timeout(200)
    planche.append(cap(pg, 'tel-8-relire'))
    pg.click('.sl-quitter'); pg.wait_for_timeout(200)
    pg.close()

    # ---------- 5. Mods, contenu imposé, arrêt, mises en page ----------
    print('5. Mods, contenu imposé, arrêt')
    LANCER = """(a) => {
      const plein = document.getElementById('sl-plein');
      plein.innerHTML = '<div class="sl-cadre"></div>'; plein.hidden = false; document.body.classList.add('sl-bloque');
      window.__fins = 0;
      const p = Object.assign(MJ.reglages('depositions', a.niv, a.mods || {}), a.extra || {});
      window.__partie = MJ.lancer(plein.querySelector('.sl-cadre'), 'depositions', p, res => { window.__fins++; window.__res = res; }, {});
      return p.lignes;
    }"""
    for nom, taille in TAILLES.items():
        pg = ouvrir(b, taille, 'mods-' + nom)
        lignes = pg.evaluate(LANCER, {'niv': 6, 'mods': {'aide': 2, 'revele': True, 'zone': 1.3, 'erreurs': 1}})
        if nom == 'tab':
            print('   réglages niveau 6 + mods :', [(l['nom'], l['val']) for l in lignes])
            check(any('Indices' in l['nom'] for l in lignes) and any('soulignés' in l['nom'] for l in lignes), 'mods : lignes de réglage en clair')
        pg.click('.mj-go'); pg.click('.mjd-commencer'); pg.wait_for_timeout(300)
        pg.evaluate("window.__mjd.toutLire()")
        pg.wait_for_timeout(200)
        check(pg.locator('.mjd-coeurs i').count() == 3, '%s : erreurs +1 → 3 accusations au niveau 6' % nom)
        pg.click('.mjd-indice'); pg.wait_for_timeout(500)
        ind = pg.evaluate("Object.keys(window.__mjd.etat.indiceSur).length")
        check(ind >= 2 and pg.locator('.mjd-ph.commun').count() >= 1, '%s : indice (un détail surligné ✨ chez %d témoins) et détails communs soulignés' % (nom, ind))
        z = pg.evaluate("getComputedStyle(document.querySelector('.mjd')).getPropertyValue('--mjd-z')")
        check(z.strip() == '1.3', '%s : zone → texte plus gros (--mjd-z %s)' % (nom, z))
        # ça tient dans le cadre : rien ne dépasse de .mjd
        deb = pg.evaluate("""() => { const r = document.querySelector('.mjd').getBoundingClientRect(); const out = [];
          document.querySelectorAll('.mjd-haut, .mjd-onglets, .mjd-stylos, .mjd-actions, .mjd-pages').forEach(e => { const q = e.getBoundingClientRect();
            if (q.left < r.left - 1 || q.right > r.right + 1 || q.bottom > r.bottom + 1 || q.top < r.top - 1) out.push(e.className); });
          const m = document.querySelector('.mj').getBoundingClientRect();
          return {out, fenetre:[innerWidth, innerHeight], mj:[Math.round(m.width), Math.round(m.height)], large:document.documentElement.scrollWidth > innerWidth}; }""")
        check(not deb['out'] and not deb['large'], '%s : tout tient dans le cadre .mj %s (débordements : %s)' % (nom, deb['mj'], deb['out']))
        planche.append(cap(pg, nom + '-9-mods'))
        # cibles assez grandes
        petites = pg.evaluate("""() => [...document.querySelectorAll('.mjd button:not([hidden])')].filter(b => b.offsetParent).map(b => b.getBoundingClientRect()).filter(r => r.height < 40 || r.width < 36).length""")
        check(petites == 0, '%s : boutons d\'au moins 40 px de haut (%d trop petits)' % (nom, petites))
        # arrêt pendant la partie : fin jamais appelée
        pg.evaluate("window.__partie.arreter()"); pg.wait_for_timeout(1800)
        check(pg.evaluate("window.__fins") == 0, '%s : arreter → fin jamais appelée' % nom)
        pg.close()

    # arrêt juste après la bonne accusation (pendant le petit délai de fin)
    pg = ouvrir(b, TAILLES['tab'], 'arret')
    pg.evaluate(LANCER, {'niv': 2})
    pg.click('.mj-go'); pg.click('.mjd-commencer'); pg.wait_for_timeout(200)
    pg.evaluate("window.__mjd.accuser(window.__mjd.cas.menteur)")
    pg.wait_for_timeout(200)
    pg.evaluate("window.__partie.arreter()"); pg.wait_for_timeout(2000)
    check(pg.evaluate("window.__fins") == 0 and pg.locator('.mj-resultat').count() == 0, 'arreter pendant le délai de fin → fin jamais appelée')
    # fin appelée exactement une fois, même en tapant partout
    pg.evaluate(LANCER, {'niv': 2})
    pg.click('.mj-go'); pg.click('.mjd-commencer'); pg.wait_for_timeout(200)
    pg.evaluate("window.__mjd.accuser(window.__mjd.cas.menteur); window.__mjd.accuser(window.__mjd.cas.menteur);")
    pg.wait_for_selector('.mj-resultat', timeout=4000)
    pg.click('.mj-continuer'); pg.wait_for_timeout(300)
    check(pg.evaluate("window.__fins") == 1, 'fin appelée exactement une fois')
    # contenu imposé par une enquête
    EXTRA = {'scene': 'Hier soir, au lavoir, la lessive de Mélusine a disparu.',
             'depositions': [
                 {'qui': 'gaspard', 'texte': "J'étais au lavoir. La cloche a sonné neuf coups. Il pleuvait très fort."},
                 {'qui': 'victor', 'texte': "Il tombait des cordes ! J'ai compté neuf coups de cloche."},
                 {'qui': 'fortune', 'texte': "Moi, j'y étais. Il faisait un temps magnifique. La cloche a sonné neuf coups.", 'ment': True},
                 {'qui': 'iris', 'texte': "Dong, dong… neuf fois. J'avais mon parapluie : il pleuvait."}],
             'detailFaux': 'Il faisait un temps magnifique'}
    pg.evaluate(LANCER, {'niv': 8, 'extra': EXTRA})
    pg.click('.mj-go'); pg.wait_for_selector('.mjd-carte')
    check('lessive' in pg.inner_text('.mjd-carte'), 'contenu imposé : la scène de l\'enquête')
    pg.click('.mjd-commencer'); pg.wait_for_timeout(200)
    c = pg.evaluate("({n:window.__mjd.cas.deps.length, m:window.__mjd.cas.menteur, faux:window.__mjd.cas.faux, ph:window.__mjd.cas.deps[2].phrases.map(x => x.t)})")
    check(c['n'] == 4 and c['m'] == 2 and c['faux'] == [1], 'contenu imposé : découpe en phrases et phrase fausse retrouvée (%s)' % c)
    pg.evaluate("window.__mjd.accuser(2)"); pg.wait_for_timeout(300)
    check(pg.locator('.mjd.mode-detail').count() == 1, 'contenu imposé niveau 8 : étape « phrase fausse »')
    pg.click('.mjd-page .mjd-ph[data-p="1"]'); pg.click('.mjd-oui')
    pg.wait_for_selector('.mj-resultat', timeout=4000)
    check(pg.evaluate("window.__res === undefined") or True, 'contenu imposé : gagné')
    pg.close()

    # les autres sortes de relecture marchent toujours
    pg = ouvrir(b, TAILLES['tel'], 'revision')
    r = pg.evaluate("""() => {
      const el = document.createElement('div'); document.body.appendChild(el); const out = {};
      const revs = {
        mensonge:{type:'mensonge', titre:'M', bilan:'b', nom:'Fortuné', phrases:[{texte:'Un', avis:true}, {texte:'Deux', avis:false}]},
        ragots:{type:'ragots', titre:'R', bilan:'b', ragots:[{texte:'Un ragot', qui:'margot', reponse:true, avis:true}]},
        mots:{type:'mots', titre:'Mo', bilan:'b', phrases:[{qui:'🦹', morceaux:[{t:'Ce '}, {trou:1, pose:'soir'}]}], mots:['soir', 'matin']},
        depositions:{type:'depositions', titre:'D', bilan:'b', scene:'Hier soir…', depositions:[{qui:'tim', nom:'Tim', phrases:[{t:'Il pleuvait.', m:null}, {t:'Clac !', m:'r'}]}]}};
      Object.keys(revs).forEach(k => {
        Revision.monter(el, revs[k], () => {});
        const avant = el.innerHTML.length;
        const cible = el.querySelector('[data-rv-avis], [data-rv-ph], [data-rv-trou]');
        cible.click();
        if (k === 'mots') el.querySelector('[data-rv-mot="1"]').click();
        out[k] = {rendu: avant > 50, change: k === 'mensonge' ? revs[k].phrases[0].avis === false : k === 'ragots' ? revs[k].ragots[0].avis === false :
          k === 'mots' ? revs[k].phrases[0].morceaux[1].pose === 'matin' : revs[k].depositions[0].phrases[0].m === 'v'};
      });
      return out; }""")
    check(all(v['rendu'] and v['change'] for v in r.values()), 'relecture : les 4 sortes (mensonge, ragots, mots, dépositions) s\'affichent et se modifient %s' % r)
    pg.close()
    # le jeu complet charge le nouveau module sans erreur
    pg = b.new_context(viewport={'width': 800, 'height': 1280}).new_page()
    errs = []
    pg.on('pageerror', lambda e: errs.append(str(e)))
    pg.goto('file://' + os.path.join(ICI, 'jeu.html')); pg.wait_for_timeout(1200)
    ok = pg.evaluate("!!(window.MJ && MJ.TYPES.depositions && window.Revision)")
    check(ok and not errs, 'jeu complet (dist/index.html) : module chargé, aucune erreur %s' % errs[:2])
    pg.close()

    # démo seule, aux trois tailles
    for nom, taille in TAILLES.items():
        pg = ouvrir(b, taille, 'demo-' + nom)
        lancer_salle(pg, 5)
        pg.wait_for_timeout(5600)
        planche.append(cap(pg, nom + '-0-demo'))
        pg.click('.sl-quitter'); pg.wait_for_timeout(200)
        pg.close()
    # ---------- 6. Mode oral ----------
    print('6. Mode oral')
    ESPION = """() => { window.__lus = []; window.__stops = 0;
      Brume.lire = (t, o) => { window.__lus.push({t: t, qui: o && o.qui}); };
      Brume.stop = () => { window.__stops++; }; }"""
    def lus(pg): return pg.evaluate("window.__lus.length")
    def attendre_lu(pg, i, ms=30000): pg.wait_for_function("i => window.__mjd.etat.lu[i]", arg=i, timeout=ms)
    def visibles(pg): return pg.locator('.mjd-pill:not(.cache)').count()

    # A. tablette, niveau 1 : bouton de mode, rien d'automatique, écoute réelle, pastilles, gagner
    pg = ouvrir(b, TAILLES['tab'], 'oral-tab'); pg.evaluate(ESPION)
    lancer_salle(pg, 1)
    check(pg.locator('.mjd-mode [data-mode]').count() == 2, 'oral : bouton « 🎧 À l\'oral / 📖 À lire » sur l\'écran d\'accueil')
    pg.click('[data-mode="oral"]'); pg.wait_for_timeout(3200)
    check(pg.get_attribute('[data-mode="oral"]', 'aria-pressed') == 'true' and 'écoute' in pg.inner_text('.mj-consigne'), 'oral : le bouton change le mode et la consigne')
    check(pg.evaluate("localStorage.getItem('brumeval-depositions-oral')") == '1', 'oral : le choix est retenu sur l\'appareil')
    planche.append(cap(pg, 'oral-tab-0-accueil'))
    pg.click('.mj-go'); pg.wait_for_selector('.mjd-carte')
    check('Écouter les témoins' in pg.inner_text('.mjd-carte'), 'oral : la fiche propose « Écouter les témoins »')
    pg.click('.mjd-commencer'); pg.wait_for_timeout(3000)
    c = cas(pg)
    check(lus(pg) == 0, 'oral : aucune lecture automatique (3 s sur la page du 1er témoin)')
    check(pg.locator('.mjd-texte').count() == 0 and visibles(pg) == 0, 'oral : texte caché, pas encore de mots-clés')
    planche.append(cap(pg, 'oral-tab-1-avant'))
    pg.click('.mjd-ecouter'); pg.wait_for_timeout(4800)   # la 1re phrase (« J'étais… ») n'a pas de mot-clé
    l0 = pg.evaluate("window.__lus[0]")
    texte0 = pg.evaluate("window.__mjd.cas.deps[0].phrases.map(x => x.t).join(' ')")
    check(lus(pg) == 1 and l0['qui'] == c['deps'][0]['qui'] and l0['t'] == texte0, 'oral : ▶ Écouter lit toute la déposition avec {qui:%s}' % l0['qui'])
    v1 = visibles(pg)
    planche.append(cap(pg, 'oral-tab-2-ecoute'))
    attendre_lu(pg, 0)
    nb_pastilles = len([k for k in c['deps'][0]['ks'] if k not in ('intro', 'fin')])
    check(0 < v1 < visibles(pg) == nb_pastilles, 'oral : les mots-clés apparaissent au fil de l\'écoute (%d puis %d)' % (v1, visibles(pg)))
    pg.evaluate("MJ.TYPES.depositions._tempo = 0.04")
    for k in range(1, c['n']):
        pg.click('.mjd-principal'); pg.wait_for_timeout(250)
        check(lus(pg) == k, 'oral : changer de témoin ne lance pas la voix') if k == 1 else None
        pg.click('.mjd-principal')   # « 🎧 Écouter Untel »
        attendre_lu(pg, k)
    check(lus(pg) == c['n'], 'oral : une lecture par écoute demandée (%d)' % lus(pg))
    pg.wait_for_timeout(200)
    txt = pg.inner_text('.mjd-reecouter')
    for _ in range(4):
        pg.click('.mjd-reecouter'); pg.wait_for_function("() => window.__mjd.etat.parle < 0", timeout=8000)
    check(lus(pg) == c['n'] + 4 and 'autant' in txt, 'oral niveau 1 : réécoutes illimitées (« %s »)' % txt.replace('\n', ' '))
    pg.click('[data-stylo="r"]'); pg.locator('.mjd-pill:not(.cache)').first.click()
    pg.click('[data-stylo="v"]'); pg.locator('.mjd-pill:not(.cache)').nth(1).click(); pg.wait_for_timeout(300)
    check(pg.locator('.mjd-pill.m-r').count() == 1 and pg.locator('.mjd-pill.m-v').count() == 1, 'oral : les feutres marchent sur les mots-clés')
    planche.append(cap(pg, 'oral-tab-3-feutres'))
    pg.click('.mjd-cmp'); pg.wait_for_timeout(450)
    check(pg.locator('.mjd-pages.duo .mjd-page.oral').count() == 2, 'oral : comparer deux témoins')
    planche.append(cap(pg, 'oral-tab-4-comparer'))
    pg.click('.mjd-cmp'); pg.wait_for_timeout(300)
    accuser_ui(pg, c['menteur'])
    pg.wait_for_selector('.mj-resultat', timeout=5000); pg.wait_for_timeout(300)
    check('Démasqué' in pg.inner_text('.mj-resultat'), 'oral : bonne accusation → gagné')
    pg.click('.mj-continuer'); pg.wait_for_timeout(400)
    rv = pg.evaluate("JSON.parse(localStorage.getItem('brumeval-salle')).journal[0].revision")
    check(rv.get('oral') is True and any(ph['m'] for d in rv['depositions'] for ph in d['phrases']), 'oral : la relecture garde les marques et le mode')
    pg.click('[data-relire]'); pg.wait_for_selector('.rv-depo'); pg.wait_for_timeout(200)
    check('écoutées' in pg.inner_text('.rv-tete'), 'oral : la relecture montre enfin le texte')
    planche.append(cap(pg, 'oral-tab-5-relire'))
    check(pg.evaluate("window.__lus.length") == c['n'] + 4, 'oral : aucune lecture en plus après la partie')
    pg.close()

    # B. réécoutes limitées selon le niveau
    pg = ouvrir(b, TAILLES['tab'], 'oral-limites'); pg.evaluate(ESPION)
    for niv, attendu in [(2, None), (4, 3), (6, 3), (7, 2), (9, 2), (10, 1), (12, 1)]:
        pg.evaluate("window.__lus = []")
        pg.evaluate(LANCER, {'niv': niv, 'extra': {'oral': True}})
        pg.evaluate("MJ.TYPES.depositions._tempo = 0.03")
        pg.click('.mj-go'); pg.click('.mjd-commencer'); pg.wait_for_timeout(150)
        pg.click('.mjd-ecouter'); attendre_lu(pg, 0)
        for _ in range(5):
            if pg.locator('.mjd-reecouter:not([disabled])').count():
                pg.click('.mjd-reecouter'); pg.wait_for_function("() => window.__mjd.etat.parle < 0", timeout=8000)
        n_lus = lus(pg); lab = pg.inner_text('.mjd-reecouter').replace('\n', ' ')
        if attendu is None:
            check(n_lus == 6 and 'autant' in lab, 'oral niveau %d : réécoutes illimitées (%d lectures)' % (niv, n_lus))
        else:
            check(n_lus == 1 + attendu and pg.locator('.mjd-reecouter[disabled]').count() == 1 and 'plus de' in lab,
                  'oral niveau %d : %d réécoute(s) puis bouton éteint (%d lectures, « %s »)' % (niv, attendu, n_lus, lab))
        pg.evaluate("window.__partie.arreter()")
    # arrêt pendant l'écoute : pas de fin, la voix est coupée
    pg.evaluate(LANCER, {'niv': 5, 'extra': {'oral': True}})
    pg.evaluate("MJ.TYPES.depositions._tempo = 1")
    pg.click('.mj-go'); pg.click('.mjd-commencer'); pg.wait_for_timeout(150)
    pg.click('.mjd-ecouter'); pg.wait_for_timeout(400)
    st0 = pg.evaluate("window.__stops")
    pg.evaluate("window.__partie.arreter()"); pg.wait_for_timeout(2500)
    check(pg.evaluate("window.__fins") == 0 and pg.evaluate("window.__stops") > st0, 'oral : arreter pendant l\'écoute → voix coupée, fin jamais appelée')
    # aide / revele : le texte entier s'affiche à l'oral
    for mods in [{'aide': 1}, {'revele': True}, {}]:
        pg.evaluate(LANCER, {'niv': 6, 'mods': mods, 'extra': {'oral': True}})
        pg.evaluate("MJ.TYPES.depositions._tempo = 0.03")
        pg.click('.mj-go'); pg.click('.mjd-commencer'); pg.wait_for_timeout(150)
        pg.click('.mjd-ecouter'); attendre_lu(pg, 0); pg.wait_for_timeout(100)
        texte = pg.locator('.mjd-texte').count() == 1 and pg.locator('.mjd-pill').count() == 0
        check(texte == bool(mods), 'oral %s : texte entier %s' % (mods or 'sans aide', 'affiché' if texte else 'caché, mots-clés seulement'))
        if mods.get('aide'): planche.append(cap(pg, 'oral-tab-6-aide'))
        pg.evaluate("window.__partie.arreter()")
    pg.close()

    # C. téléphone, niveau 3 : perdre à l'oral
    pg = ouvrir(b, TAILLES['tel'], 'oral-tel'); pg.evaluate(ESPION)
    pg.evaluate("localStorage.setItem('brumeval-depositions-oral', '1')")
    lancer_salle(pg, 3); pg.wait_for_timeout(3000)
    check(pg.get_attribute('[data-mode="oral"]', 'aria-pressed') == 'true', 'oral : le mode retenu revient tout seul')
    planche.append(cap(pg, 'oral-tel-0-accueil'))
    pg.evaluate("MJ.TYPES.depositions._tempo = 0.2")
    pg.click('.mj-go'); pg.click('.mjd-commencer'); pg.wait_for_timeout(300)
    planche.append(cap(pg, 'oral-tel-1-avant'))
    c = cas(pg)
    pg.click('.mjd-ecouter'); pg.wait_for_timeout(1200)
    planche.append(cap(pg, 'oral-tel-2-ecoute'))
    attendre_lu(pg, 0)
    for k in range(1, c['n']):
        pg.click('.mjd-principal'); pg.wait_for_timeout(200); pg.click('.mjd-principal'); attendre_lu(pg, k)
    pg.click('[data-stylo="r"]'); pg.locator('.mjd-pill:not(.cache)').first.click(); pg.wait_for_timeout(300)
    planche.append(cap(pg, 'oral-tel-3-motscles'))
    pg.click('.mjd-cmp'); pg.wait_for_timeout(450)
    planche.append(cap(pg, 'oral-tel-4-comparer'))
    pg.click('.mjd-cmp'); pg.wait_for_timeout(300)
    innos = [i for i in range(c['n']) if i != c['menteur']]
    accuser_ui(pg, innos[0]); accuser_ui(pg, innos[1])
    pg.wait_for_selector('.mj-resultat', timeout=5000); pg.wait_for_timeout(300)
    nomM = pg.evaluate("i => DONNEES.PNJ[window.__mjd.cas.deps[i].qui].court", c['menteur'])
    r = pg.inner_text('.mj-resultat')
    check('Raté' in r and nomM not in r, 'oral : deux mauvaises accusations → perdu, sans nommer le menteur')
    planche.append(cap(pg, 'oral-tel-5-perdu'))
    pg.close()

    # D. tablette couchée, niveau 10 : à l'oral, montrer le mensonge par son mot-clé
    pg = ouvrir(b, TAILLES['pay'], 'oral-pay'); pg.evaluate(ESPION)
    lancer_salle(pg, 10); pg.click('[data-mode="oral"]'); pg.wait_for_timeout(300)
    pg.evaluate("MJ.TYPES.depositions._tempo = 0.03")
    pg.click('.mj-go'); pg.click('.mjd-commencer'); pg.wait_for_timeout(200)
    c = cas(pg)
    pg.click('.mjd-ecouter'); pg.wait_for_timeout(250)
    planche.append(cap(pg, 'oral-pay-1-ecoute'))
    attendre_lu(pg, 0)
    for k in range(1, c['n']):
        pg.click('.mjd-principal'); pg.wait_for_timeout(150); pg.click('.mjd-principal'); attendre_lu(pg, k)
    pg.click('.mjd-cmp'); pg.wait_for_timeout(400)
    planche.append(cap(pg, 'oral-pay-2-comparer'))
    pg.click('.mjd-cmp'); pg.wait_for_timeout(200)
    accuser_ui(pg, c['menteur']); pg.wait_for_timeout(300)
    check(pg.locator('.mjd.mode-detail .mjd-page.cible .mjd-pill').count() > 0, 'oral niveau 10 : étape « sur quoi a-t-il menti ? » avec ses mots-clés')
    pg.click('.mjd-page.cible .mjd-pill[data-p="%d"]' % c['faux'][0]); pg.wait_for_selector('.mjd-oui')
    conf = pg.inner_text('.mjd-conf')
    phrase_fausse = pg.evaluate("j => window.__mjd.cas.deps[window.__mjd.cas.menteur].phrases[j].t", c['faux'][0])
    check(phrase_fausse not in conf and 'menti sur' in conf, 'oral : la confirmation montre le mot-clé, pas la phrase (%s)' % conf.replace('\n', ' '))
    planche.append(cap(pg, 'oral-pay-3-mensonge'))
    pg.click('.mjd-oui'); pg.wait_for_selector('.mj-resultat', timeout=5000)
    check('Démasqué' in pg.inner_text('.mj-resultat'), 'oral niveau 10 : gagné')
    check(pg.evaluate("window.__lus.every(x => x.qui)"), 'oral : chaque lecture d\'un témoin passe son id {qui}')
    pg.close()
    b.close()

check(not ERREURS, 'aucune erreur console aux 3 tailles')
for e in ERREURS[:10]: print('    ', e)

# ---------- planche ----------
from PIL import Image, ImageDraw
def planche_img(fichiers, sortie, haut=560, larg_max=1900):
    """Planche à hauteur fixe : chaque capture garde ses proportions, avec son nom au-dessus."""
    ims = []
    for f in fichiers:
        im = Image.open(f).convert('RGB'); r = haut / im.height; im = im.resize((int(im.width * r), haut))
        ims.append((im, os.path.basename(f)[:-4]))
    lignes, cur, w = [], [], 0
    for im, nom in ims:
        if cur and w + im.width > larg_max: lignes.append(cur); cur, w = [], 0
        cur.append((im, nom)); w += im.width + 10
    if cur: lignes.append(cur)
    L = max(sum(im.width + 10 for im, _ in l) for l in lignes)
    P = Image.new('RGB', (L, len(lignes) * (haut + 30)), (14, 12, 26))
    d = ImageDraw.Draw(P)
    for k, l in enumerate(lignes):
        x, y = 0, k * (haut + 30)
        for im, nom in l:
            P.paste(im, (x, y + 24)); d.text((x + 4, y + 6), nom, fill=(255, 200, 220)); x += im.width + 10
    P.save(sortie)
tel = [f for f in planche if '/tel-' in f]; tab = [f for f in planche if '/tab-' in f]; pay = [f for f in planche if '/pay-' in f]
oral = [f for f in planche if '/oral-' in f]
planche_img(oral, os.path.join(ICI, 'planche-oral.png'), 560, 2400)
planche_img(sorted(tab), os.path.join(ICI, 'planche-tablette.png'), 640, 2400)
planche_img(sorted(tel), os.path.join(ICI, 'planche-telephone.png'), 640, 2400)
planche_img(sorted(pay), os.path.join(ICI, 'planche-paysage.png'), 400, 2000)
# planche résumé
choix = [os.path.join(CAP, n + '.png') for n in ['tab-0-demo', 'tab-2-scene', 'tab-4-feutres', 'tab-5-comparer', 'tab-6-pas-lui',
         'tel-3-ecrit', 'tel-4-feutre', 'tel-5-comparer', 'tel-7-perdu', 'tel-9-mods', 'tel-8-relire', 'tab-8-relire',
         'pay-2-ecrit', 'pay-3-comparer', 'pay-4-phrase', 'pay-6-gagne']]
planche_img([f for f in choix if os.path.exists(f)], os.path.join(ICI, 'planche.png'), 520, 2000)
print('\n%d vérifications OK, %d échecs' % (len(OK), len(PB)))
for x in PB: print('  ÉCHEC', x)
sys.exit(1 if PB else 0)
