"""L'écran du héros, le menu ☰ et ses pages (Playwright).
Usage : BRUMEVAL_DIST=/chemin python3 tools/heros.py

Vérifie :
  1. l'écran du héros aux 5 tailles (360×740, 390×844, 844×390, 800×1280, 1280×800) : pas de défilement, tout est visible,
     cibles ≥ 48 px ; on l'ouvre par le portrait ET par le nom du bandeau ; « Niveau N », « x / y points d'expérience » ;
  2. la bourse 👛 → boutique → achat → la case d'équipement se remplit, l'objet est dessiné sur le héros, ← Retour ;
  3. l'arbre des talents (10 boîtes, niveaux, états), et prendre un talent depuis l'arbre ;
  4. le menu ☰ (seulement ses boutons), les « ← Retour » au même endroit et les titres centrés, Comment jouer sans bouton en bas ;
  5. les Réglages (le son ; les voix seulement quand elles sont possibles) ;
  6. Sauvegarder (fichier Brumeval-<prénom>-<date>.json, feuille de partage) puis Charger (aller-retour), et un fichier abîmé ;
  7. Supprimer le personnage → Livre des Légendes → création avec « Reprendre la même apparence » ;
  8. le Livre des Légendes : portrait exact (tenue de la garde-robe et couleurs), vieilles légendes ;
  9. plus de mode enfant (création, vieille sauvegarde « enfant ») ;
 10. 📲 Installer le jeu (invitation du navigateur, guide iPhone), ⛶ Plein écran ;
 11. 📥 Jouer sans internet, sur un petit serveur local (service worker) : ✅, puis hors ligne, rechargement, 📴."""
import os, sys, json, re, socket, shutil, subprocess, time
from playwright.sync_api import sync_playwright
ICI = os.path.dirname(os.path.abspath(__file__))
DIST = os.path.abspath(os.environ.get('BRUMEVAL_DIST') or os.path.join(ICI, '..', 'dist'))
URL = 'file://' + os.path.join(DIST, 'index.html')
OUT = os.path.join(ICI, '..', 'test', 'heros')
os.makedirs(OUT, exist_ok=True)
TAILLES = [(360, 740), (390, 844), (844, 390), (800, 1280), (1280, 800)]
IPHONE = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Mobile/15E148 Safari/604.1'
erreurs, echecs = [], []
non_testes = []

def verif(cond, msg):
    print(('  OK  ' if cond else '  ÉCHEC ') + msg)
    if not cond: echecs.append(msg)

def ecouter(pg, nom):
    def con(m):
        t = m.text
        if m.type == 'error' and 'ERR_TUNNEL' not in t and 'fonts' not in t and 'ERR_INTERNET_DISCONNECTED' not in t and 'Failed to load resource' not in t:
            erreurs.append(f'[{nom}] {t}')
    pg.on('console', con)
    pg.on('pageerror', lambda e: erreurs.append(f'[{nom}] PAGEERROR {e}'))

def nouvelle(b, W, H, nom, ua=None, init=None, url=URL):
    ctx = b.new_context(viewport={'width': W, 'height': H}, accept_downloads=True, **({'user_agent': ua} if ua else {}))
    if init: ctx.add_init_script(init)
    ctx.add_init_script('window.BRUMEVAL_SANS_TUTO = true')   # ce banc teste l'écran du héros et le menu : l'enquête 1 sans le tutoriel guidé (qui bloque le portrait ; tools/tuto.py le teste)
    pg = ctx.new_page()
    pg.set_default_timeout(30000)
    ecouter(pg, nom)
    pg.goto(url, wait_until='domcontentloaded')
    pg.wait_for_selector('#app main, #app .b-jeu', timeout=30000)
    return pg

def ev(pg, js, arg=None):
    return pg.evaluate(js, arg) if arg is not None else pg.evaluate(js)

def creer(pg, role, nom):
    pg.click('[data-act=creer]'); pg.click(f'[data-act=crea-role][data-r={role}]'); pg.click('[data-act=crea-suite]')
    verif(pg.locator('[data-act=crea-joueur]').count() == 0 and 'Qui joue ce héros' not in pg.inner_text('#app'), f'Création ({role}) : plus de question « Qui joue ce héros ? »')
    pg.fill('#nom', nom); pg.click('[data-act=crea-fin]')

def entrer(pg):
    pg.click('[data-act=nouvelle-enquete]'); pg.click('[data-act=commencer]')
    pg.wait_for_selector('.b-entete')

def fermer(pg):
    pg.evaluate('() => { if(M.UI.modal) M.fermer(); }'); pg.wait_for_timeout(80)

def boite(pg, sel):
    return pg.evaluate("(s) => { var e = document.querySelector(s); if(!e) return null; var r = e.getBoundingClientRect(); return {x:r.left, y:r.top, r:r.right, b:r.bottom, w:r.width, h:r.height}; }", sel)

def dedans(r, W, H, tol=1):
    return r is not None and r['x'] >= -tol and r['y'] >= -tol and r['r'] <= W + tol and r['b'] <= H + tol

def sans_defilement(pg):
    return pg.evaluate("() => { var d = document.scrollingElement; return d.scrollHeight <= innerHeight + 1 && d.scrollWidth <= innerWidth + 1; }")

with sync_playwright() as p:
    b = p.chromium.launch()

    # ================= 1. L'écran du héros aux 5 tailles =================
    print('1. Écran du héros')
    pg = nouvelle(b, 390, 844, 'pisteur')
    creer(pg, 'pisteur', 'Naïm')
    entrer(pg)
    pg.click('.b-et-heros'); pg.wait_for_timeout(300)
    verif(ev(pg, '() => M.UI.ecran') == 'heros', 'Toucher le portrait du bandeau ouvre l\'écran du héros')
    txt = pg.inner_text('.hr-bas')
    verif('Niveau 1' in txt and '0 / 120 points d\'expérience' in txt, f'À ses pieds : « Niveau 1 » et « 0 / 120 points d\'expérience » ({txt!r})')
    verif(pg.locator('.hr-bas .b-lire').count() == 1, 'La barre d\'expérience a son 🔊')
    pg.click('[data-act=retour]'); pg.wait_for_timeout(200)
    verif(ev(pg, '() => M.UI.ecran') == 'enquete', '« ← Retour » revient à l\'enquête')
    pg.click('.b-entete .b-et-info'); pg.wait_for_timeout(300)
    verif(ev(pg, '() => M.UI.ecran') == 'heros', 'Toucher le nom et le rôle du bandeau ouvre aussi l\'écran du héros')
    # une tenue de la garde-robe et de l'équipement, niveau 3
    ev(pg, """() => { var G = M.etatGarde(); ['bandeau_simple','tunique_lin','bottes_cuir'].forEach(function(id){ if(!G.a[id]) G.a[id] = {c:Garde.ITEMS[id].c}; }); G.p.tete = 'bandeau_simple'; G.a.bandeau_simple.c = 'bleu'; G.p.corps = 'tunique_lin'; G.p.pieds = 'bottes_cuir';
      M.S.xp = 260; M.S.or = 300; M.S.equip = ['gants_pisteur', 'bottes_vent', 'lanterne_sourde']; M.sauver(); M.render(); }""")
    pg.wait_for_timeout(300)
    t2 = pg.inner_text('.hr-bas')
    verif('Niveau 3' in t2 and '260 / 380 points d\'expérience' in t2, f'Niveau 3 : « 260 / 380 points d\'expérience » ({t2!r})')
    verif(abs(ev(pg, "() => parseFloat(document.querySelector('.hr-barre i').style.width)") - round((260 - 250) * 100 / 130)) <= 1, 'La barre est remplie en proportion (10/130)')
    verif('👛' in pg.inner_text('.hr-bourse') and '300' in pg.inner_text('.hr-bourse') and '🛒' not in pg.inner_text('.hr-bourse'), 'La bourse 👛 montre les pièces (pas de chariot)')
    verif(pg.locator('.hr-btn-arbre .hr-badge').count() == 0, 'Pisteur : pas de ⭐ sur le bouton de l\'arbre (ses talents sont à refaire, 11 novembre)')
    verif(pg.locator('.hr-case.pleine').count() == 3 and pg.locator('.hr-case').count() == 8, f'Équipement : 3 cases pleines sur 8 ({pg.locator(".hr-case.pleine").count()}/{pg.locator(".hr-case").count()})')
    verif(pg.inner_text('.hr-equip-titre') == 'Équipement', '« Équipement » écrit à côté des cases')
    mots = ev(pg, "() => document.querySelector('.hr-ecran').innerText.replace(/\\s+/g, ' ').trim()")
    verif(len(mots) < 90, f'Très peu de texte sur l\'écran du héros ({mots!r})')
    for (W, H) in TAILLES:
        pg.set_viewport_size({'width': W, 'height': H}); pg.wait_for_timeout(450)
        ok = sans_defilement(pg)
        verif(ok, f'{W}×{H} : aucun défilement')
        sels = ['.b-retour', '.hr-niv', '.hr-barre', '.hr-bas .b-lire', '.hr-bourse', '.hr-btn-arbre', '.hr-equip-titre', '.hr-heros .pj-souffle']
        hors = [s for s in sels if not dedans(boite(pg, s), W, H, 2)]
        cases = ev(pg, "() => Array.from(document.querySelectorAll('.hr-case')).map(function(e){ var r = e.getBoundingClientRect(); return [r.left, r.top, r.right, r.bottom, r.width, r.height]; })")
        hors += ['case %d' % i for i, c in enumerate(cases) if c[0] < 0 or c[1] < 0 or c[2] > W or c[3] > H]
        verif(not hors, f'{W}×{H} : tout est visible ({hors or "héros, cases, barre, bourse, arbre, Retour"})')
        petits = [s for s in ['.b-retour', '.hr-bourse', '.hr-btn-arbre', '.hr-bas .b-lire', '.hr-case.pleine'] if (lambda r: r is None or r['w'] < 48 or r['h'] < 48)(boite(pg, s))]
        verif(not petits and all(c[4] >= 48 and c[5] >= 48 for c in cases), f'{W}×{H} : cibles d\'au moins 48 px ({petits})')
        g, d, h, bar = boite(pg, '.hr-g'), boite(pg, '.hr-d'), boite(pg, '.hr-heros'), boite(pg, '.hr-bas')
        cx = h['x'] + h['w'] / 2
        verif(abs(cx - W / 2) < 2 and g['r'] < cx and d['x'] > cx and g['b'] <= bar['y'] + 1 and d['b'] <= bar['y'] + 1, f'{W}×{H} : le héros au centre, les cases à gauche et à droite, la barre à ses pieds')
        corps = boite(pg, '.hr-heros .pj-souffle')
        verif(corps['b'] <= bar['y'] + 0.06 * h['h'] and corps['b'] >= bar['y'] - 0.12 * h['h'], f'{W}×{H} : les pieds du héros juste au-dessus de la barre d\'expérience')
        pg.screenshot(path=f'{OUT}/heros-{W}x{H}.png')
        # l'arbre des talents (celui du Barde : le seul fait, 11 novembre)
        ev(pg, "() => { M.S.heros.role = 'barde'; M.render(); }")
        pg.click('[data-act=hr-arbre]'); pg.wait_for_timeout(450)
        n = pg.locator('.hr-talent').count()
        tb = ev(pg, "() => Array.from(document.querySelectorAll('.hr-talent, .hr-niv-t')).map(function(e){ var r = e.getBoundingClientRect(); return [r.left, r.top, r.right, r.bottom, r.height, e.className]; })")
        bar2 = boite(pg, '.hr-bas'); ret = boite(pg, '.b-retour')
        hors2 = [x[5] for x in tb if x[0] < 0 or x[1] < 0 or x[2] > W or x[3] > H or x[3] > bar2['y'] + 1]
        chevauche = [x[5] for x in tb if x[0] < ret['r'] and x[2] > ret['x'] and x[1] < ret['b'] and x[3] > ret['y']]
        verif(n == 10 and not hors2 and not chevauche and sans_defilement(pg), f'{W}×{H} : l\'arbre des talents tient sur l\'écran, 10 boîtes ({n}, dehors : {hors2}, sur Retour : {chevauche})')
        verif(all(x[4] >= 48 for x in tb if 'hr-talent' in x[5]), f'{W}×{H} : boîtes de talent d\'au moins 48 px de haut')
        verif(not pg.is_visible('.hr-heros svg') and not pg.is_visible('.hr-case'), f'{W}×{H} : le héros et les cases s\'effacent derrière l\'arbre')
        pg.screenshot(path=f'{OUT}/arbre-{W}x{H}.png')
        pg.click('[data-act=hr-arbre]'); pg.wait_for_timeout(200)
        ev(pg, "() => { M.S.heros.role = 'pisteur'; M.render(); }")
    pg.set_viewport_size({'width': 390, 'height': 844}); pg.wait_for_timeout(300)

    # ================= 2. Bourse → boutique ; un objet acheté remplit une case et se voit sur le héros =================
    print('2. Bourse, boutique, équipement')
    ev(pg, "() => { M.S.equip = []; M.S.or = 200; M.S.xp = 0; M.sauver(); M.render(); }"); pg.wait_for_timeout(200)
    verif(pg.locator('.hr-case.pleine').count() == 0 and pg.locator('.hr-case.vide').count() == 8, 'Sans équipement : 8 cases vides')
    pg.click('.hr-bourse'); pg.wait_for_timeout(300)
    verif(ev(pg, '() => M.UI.ecran') == 'boutique', 'La bourse ouvre la boutique')
    verif(pg.locator('.b-boutique .b-barre-c [data-act=retour]').count() == 1, 'La boutique a le même « ← Retour »')
    pg.click('[data-act=acheter][data-id=gants_pisteur]'); pg.wait_for_timeout(200); fermer(pg)
    pg.click('[data-act=retour]'); pg.wait_for_timeout(300)
    verif(ev(pg, '() => M.UI.ecran') == 'heros', '« ← Retour » de la boutique revient à l\'écran du héros')
    verif(pg.locator('.hr-case.pleine[data-id=gants_pisteur]').count() == 1 and '165' in pg.inner_text('.hr-bourse'), f'Les gants achetés (35 pièces) remplissent une case ; la bourse a 165 pièces ({pg.inner_text(".hr-bourse")!r})')
    dessine = ev(pg, """() => { var h = M.heroObj(); var a = Persos.heros(h, {id:'t', anime:false, fond:false}); h.equip = []; var z = Persos.heros(h, {id:'t', anime:false, fond:false}); return a !== z; }""")
    verif(dessine, 'Les gants sont dessinés sur le héros (avec sa tenue de la garde-robe)')
    pg.click('.hr-case.pleine[data-id=gants_pisteur]'); pg.wait_for_timeout(200)
    verif('Gants de pisteur' in pg.inner_text('#voile') and pg.locator('#voile .b-lire').count() >= 1, 'Toucher une case : le nom de l\'objet, ce qu\'il fait, avec 🔊')
    pg.screenshot(path=f'{OUT}/objet-390x844.png'); fermer(pg)
    vus = ev(pg, """() => { var r = {}; ['bottes_vent'].forEach(function(id){ var o = DONNEES.OBJETS[id], h = Object.assign(Persos.defaut(o.role, 'f'), {niveau:5, equip:[id]});
      if(id === 'bottes_vent') h.garde = {pieds:{id:'bottes_cuir', c:'marron'}};
      var a = Persos.heros(h, {id:'t', anime:false}); h.equip = []; r[id] = a !== Persos.heros(h, {id:'t', anime:false}); }); return r; }""")
    verif(all(vus.values()), f'Dessin sur le héros : ailes des bottes de vent sur les bottes de la garde-robe ({vus})')

    # ================= 3. L'arbre des talents : prendre un talent =================
    print('3. Arbre des talents')
    ev(pg, "() => { M.S.xp = 250; M.sauver(); M.render(); }")
    # (11 novembre : les talents du Pisteur, de l'Alchimiste et du Sage sont à refaire ; leur arbre montre un message)
    pg.click('[data-act=hr-arbre]'); pg.wait_for_timeout(300)
    verif(pg.locator('.hr-talent').count() == 0 and pg.is_visible('.hr-arbre-msg') and pg.locator('.hr-arbre-msg .b-lire').count() == 1
          and ev(pg, '() => M.talentsEnAttente().length') == 0 and pg.locator('.hr-btn-arbre .hr-badge').count() == 0,
          'Pisteur : pas de talent pour l\'instant, un message avec 🔊 dans l\'arbre, pas de ⭐')
    pg.screenshot(path=f'{OUT}/arbre-vide-390x844.png')
    # l'arbre du Barde, le seul fait : on prend un talent
    ev(pg, "() => { M.S.heros.role = 'barde'; M.S.talents = []; M.S.equip = []; M.sauver(); M.render(); }")
    pg.wait_for_timeout(300)
    if not pg.is_visible('.hr-talent'): pg.click('[data-act=hr-arbre]'); pg.wait_for_timeout(300)
    et = ev(pg, "() => Array.from(document.querySelectorAll('.hr-talent')).map(function(e){ return [e.dataset.id, e.dataset.etat, e.closest('.hr-etage').dataset.niv]; })")
    dispo = [x[0] for x in et if x[1] == 'dispo']; ferme = [x for x in et if x[1] == 'ferme']
    verif(sorted(dispo) == ['exiger', 'tendre'] and len(ferme) == 8 and all(x[2] != '2' for x in ferme), f'Niveau 3 : les talents du niveau 2 à choisir, les autres verrouillés ({et})')
    verif(pg.locator('.hr-niv-t').all_inner_texts() == ['Niv. 10', 'Niv. 8', 'Niv. 6', 'Niv. 4', 'Niv. 2'], 'Chaque étage montre le niveau où il s\'ouvre')
    longs = [t for t in pg.locator('.hr-t-txt').all_inner_texts() if len(t.split()) > 3]
    longs += ev(pg, "() => Object.keys(DONNEES.TALENTS).map(function(id){ return M.talentCourt(id); }).filter(function(t){ return t.split(/\\s+/).length > 3 || t.length > 24; })")
    verif(not longs, f'Textes des talents très courts (3 mots au plus) {longs}')
    pg.click('.hr-talent[data-id=tendre]'); pg.wait_for_timeout(200)
    verif(pg.is_visible('#voile [data-act=talent][data-id=tendre]') and pg.locator('#voile .b-lire').count() >= 1, 'Toucher un talent à choisir : sa description avec 🔊 et « Je prends ce talent »')
    pg.screenshot(path=f'{OUT}/talent-390x844.png')
    pg.click('#voile [data-act=talent][data-id=tendre]'); pg.wait_for_timeout(200); fermer(pg)
    et2 = dict((x[0], x[1]) for x in ev(pg, "() => Array.from(document.querySelectorAll('.hr-talent')).map(function(e){ return [e.dataset.id, e.dataset.etat]; })"))
    verif(ev(pg, "() => M.S.talents.indexOf('tendre') >= 0") and et2.get('tendre') == 'pris' and et2.get('exiger') == 'non' and pg.locator('.hr-btn-arbre .hr-badge').count() == 0, f'Talent pris depuis l\'arbre : ✔, l\'autre s\'éteint, plus de ⭐ ({et2.get("tendre")}, {et2.get("exiger")})')
    pg.click('.hr-talent[data-id=exiger]'); pg.wait_for_timeout(150)
    verif(pg.locator('#voile [data-act=talent]').count() == 0, 'L\'autre talent de l\'étage ne se prend plus'); fermer(pg)
    pg.click('[data-act=retour]'); pg.wait_for_timeout(150)
    verif(ev(pg, '() => M.UI.ecran') == 'heros' and not ev(pg, '() => !!M.UI.arbre'), '« ← Retour » referme d\'abord l\'arbre')
    pg.click('[data-act=retour]'); pg.wait_for_timeout(200)
    ev(pg, "() => { M.S.heros.role = 'pisteur'; M.S.talents = []; M.sauver(); M.render(); }")   # (on redevient Pisteur pour la suite)

    # ================= 4. Le menu ☰ et les « ← Retour » =================
    print('4. Menu')
    pg.click('[data-act=menu-enquete]'); pg.wait_for_timeout(300)
    verif(ev(pg, '() => M.UI.ecran') == 'menu', '☰ ouvre la page du menu')
    lab = [re.sub(r'^\W+\s*', '', t).strip() for t in pg.locator('.hr-menu-l > .btn').all_inner_texts()]
    attendus = ['Comment jouer', 'Réglages', 'Changer de joueur', 'Plein écran', 'Sauvegarder', 'Charger', 'Livre des Légendes', 'Supprimer le personnage']
    verif(lab == attendus, f'Le menu n\'a que ses boutons, dans l\'ordre ({lab})')
    page_txt = pg.inner_text('#app')
    verif(not any(x in page_txt for x in ['Mon héros', 'Boutique', 'Relire la lettre', 'Retour au village', 'Abandonner', 'Jouer sans internet', 'Installer']), 'Plus de « Mon héros », « Boutique », « Lettre du maire », « Retour au village », « Abandonner » ; pas de « Jouer sans internet » ni « Installer » ici (fichier local)')
    W = 390
    places = {}
    for nom, aller in [('Menu', None), ('Comment jouer', '[data-act=aide]'), ('Réglages', '.hr-menu-l [data-act=ecran][data-e=reglages]'), ('Changer de joueur', '.hr-menu-l [data-act=changer-joueur]'), ('Livre des Légendes', '.hr-menu-l [data-act=ecran][data-e=legendes]')]:
        if aller:
            pg.click(aller)
        pg.wait_for_timeout(700)   # la page finit d'apparaître (animation b-apparait)
        r = boite(pg, '.b-retour'); h2 = boite(pg, '.b-barre-c h2')
        places[nom] = (round(r['x']), round(r['y']), round(r['w']), round(r['h']))
        verif(pg.inner_text('.b-barre-c h2').replace('\n', ' ') == nom and abs(h2['x'] + h2['w'] / 2 - W / 2) < 2 and h2['x'] >= r['r'], f'« {nom} » : titre au centre, sans passer sous « ← Retour »')
        if nom == 'Comment jouer':
            verif(pg.locator('.b-aide-carte').count() == 7 and pg.locator('#app .btn').count() == 1 and 'compris' not in pg.inner_text('#app'), 'Comment jouer : le même contenu, plus de bouton en bas')
            pg.screenshot(path=f'{OUT}/aide-390x844.png')
        if nom == 'Changer de joueur':
            verif(pg.locator('.b-qui-h').count() >= 2, 'Changer de joueur : les héros de la tablette et « Nouveau héros »')
        if aller:
            pg.click('[data-act=retour]'); pg.wait_for_timeout(250)
            verif(ev(pg, '() => M.UI.ecran') == 'menu', f'« ← Retour » de « {nom} » revient au menu')
    verif(len(set(places.values())) == 1 and places['Menu'][3] >= 48, f'Le même « ← Retour » au même endroit partout ({places})')
    pg.screenshot(path=f'{OUT}/menu-390x844.png')
    for (W2, H2) in [(844, 390), (1280, 800)]:
        pg.set_viewport_size({'width': W2, 'height': H2}); pg.wait_for_timeout(250); pg.screenshot(path=f'{OUT}/menu-{W2}x{H2}.png')
    pg.set_viewport_size({'width': 390, 'height': 844}); pg.wait_for_timeout(150)
    pg.click('[data-act=retour]'); pg.wait_for_timeout(250)
    verif(ev(pg, '() => M.UI.ecran') == 'enquete', '« ← Retour » du menu revient à l\'enquête')
    # ce qui était dans le menu se trouve encore : la lettre du maire (Carnet)
    pg.click('[data-act=onglet][data-o=carnet]'); pg.wait_for_timeout(200)
    verif(pg.is_visible('[data-act=relire-lettre]'), 'La lettre du maire se relit depuis le Carnet')
    pg.click('[data-act=relire-lettre]'); pg.wait_for_timeout(150)
    verif('lettre du maire' in pg.inner_text('#voile').lower() and pg.locator('#voile .b-lire').count() >= 1, 'La lettre s\'ouvre, avec 🔊'); fermer(pg)
    pg.click('[data-act=onglet][data-o=role]'); pg.wait_for_timeout(200)

    # ================= 5. Réglages =================
    print('5. Réglages')
    pg.click('[data-act=menu-enquete]'); pg.click('.hr-menu-l [data-act=ecran][data-e=reglages]'); pg.wait_for_timeout(200)
    verif(pg.locator('.b-mode-test').count() == 1, 'Fichier local (bancs d\'essai) : le Mode test reste là pour les outils')
    ev(pg, "() => { window.__modeDev = M.modeDev; M.modeDev = function(){ return false; }; M.render(); }")
    t = pg.inner_text('#app')
    rien = [x for x in ['Mode test', 'Le joueur', 'Enfant', 'Adulte', 'Sauvegarde de secours', 'Vitesse', 'Voix de lecture', 'Voix naturelles', 'Android', 'Effacer ce héros', 'Copier'] if x in t]
    verif(not rien and pg.locator('#app select, #app input[type=range], #app textarea').count() == 0, f'Réglages : plus de choix de voix, de vitesse, d\'enfant/adulte, de sauvegarde de secours ({rien})')
    verif(pg.locator('#app input[data-k=son]').count() == 1 and 'voix' not in t.lower(), 'Hors de la version GitHub : seulement le son, rien sur les voix')
    pg.screenshot(path=f'{OUT}/reglages-sans-voix-390x844.png')
    ev(pg, "() => { Voix.possible = true; Voix.pret = false; M.render(); }")
    verif(pg.is_visible('[data-act=voix-telecharger]') and pg.locator('#voix-prog progress').count() == 1 and not pg.is_visible('#voix-prog') and 'Son et voix' in pg.inner_text('#app'), 'Version GitHub, voix absentes : « ⬇ Télécharger les voix » (et sa barre, cachée)')
    pg.screenshot(path=f'{OUT}/reglages-telecharger-390x844.png')
    ev(pg, "() => { Voix.pret = true; M.render(); }")
    verif('Voix installées' in pg.inner_text('#app') and pg.is_visible('[data-act=test-voix]') and not pg.is_visible('[data-act=voix-telecharger]'), 'Voix installées : une ligne d\'état et « 🔊 Essayer la voix »')
    pg.screenshot(path=f'{OUT}/reglages-voix-390x844.png')
    ev(pg, "() => { Voix.pret = false; Voix.possible = false; M.modeDev = window.__modeDev; M.render(); }")
    verif(ev(pg, "() => { M.S.options.voixNaturelles = false; M.S.options.vitesse = 0.7; var vu = null; var old = Voix.lire; Voix.pret = true; Voix.lire = function(t, q, v){ vu = v; return true; }; M.lire('Bonjour'); Voix.lire = old; Voix.pret = false; M.stop(); return vu; }") == 1, 'Les voix naturelles servent toutes seules (vieille case décochée ou vitesse ignorées)')
    pg.click('[data-act=retour]'); pg.wait_for_timeout(150)

    # ================= 6. Sauvegarder / Charger =================
    print('6. Sauvegarder, Charger')
    ev(pg, "() => { M.S.or = 777; M.S.xp = 400; M.sauver(); }")
    with pg.expect_download() as dl:
        pg.click('[data-act=sauvegarder]')
    d = dl.value
    nomf = d.suggested_filename
    verif(re.match(r'^Brumeval-Naim-\d{4}-\d{2}-\d{2}\.json$', nomf) is not None, f'Sauvegarder télécharge « {nomf} »')
    chemin = os.path.join(OUT, nomf); d.save_as(chemin)
    o = json.load(open(chemin, encoding='utf-8'))
    verif(o.get('jeu') == 'brumeval' and o['etat']['heros']['nom'] == 'Naïm' and o['etat']['or'] == 777 and o['etat']['e'] is not None, 'Le fichier contient le héros et la partie en cours')
    verif(os.path.getsize(chemin) < 400000, f'Un petit fichier ({os.path.getsize(chemin)} octets)')
    partage = ev(pg, """async () => { var vu = null; navigator.canShare = function(d){ return !!(d && d.files && d.files.length); }; navigator.share = function(d){ vu = [d.files[0].name, d.files[0].type, d.files[0].size]; return Promise.resolve(); };
      M.A.sauvegarder(); await new Promise(function(r){ setTimeout(r, 200); }); delete navigator.share; delete navigator.canShare; return vu; }""")
    verif(partage and partage[0] == nomf and partage[2] > 100, f'Avec la feuille de partage (iPhone, Android) : le fichier est partagé ({partage})')
    # (prochaine = 2 : un héros qui n'a encore fini aucune enquête a un village réduit au strict nécessaire, sans « ☰ Menu », Romain 4 novembre)
    ev(pg, "() => { M.S.or = 1; M.S.xp = 0; M.S.e = null; M.S.prochaine = 2; M.sauver(); M.aller('accueil'); }"); pg.wait_for_timeout(200)
    pg.click('.b-pied [data-act=menu]'); pg.wait_for_timeout(200)
    verif(ev(pg, '() => M.UI.ecran') == 'menu', 'Au village : « ☰ Menu » ouvre le même menu')
    pg.set_input_files('#import', chemin); pg.wait_for_timeout(500)
    tc = pg.inner_text('#voile') if pg.is_visible('#voile') else ''
    verif('Remplacer la partie de cette tablette ?' in tc and 'Naïm' in tc and pg.locator('#voile .b-lire').count() >= 1, f'Charger : on demande avant de remplacer, avec 🔊 ({tc[:80]!r})')
    pg.screenshot(path=f'{OUT}/charger-390x844.png')
    pg.click('#voile [data-act=hr-charger-oui]'); pg.wait_for_timeout(400)
    st = ev(pg, "() => [M.S.or, M.S.xp, !!M.S.e, M.UI.ecran, JSON.parse(localStorage.getItem('brumeval-v2-' + M.emplacement())).or]")
    verif(st == [777, 400, True, 'accueil', 777], f'La partie du fichier est revenue, et gardée dans la tablette ({st})')
    # un mauvais fichier
    faux = os.path.join(OUT, 'pas-une-sauvegarde.json')
    open(faux, 'w').write('{"bonjour": tru')
    ev(pg, "() => M.aller('menu')"); pg.wait_for_timeout(200)
    pg.set_input_files('#import', faux); pg.wait_for_timeout(400)
    verif('ne marche pas' in pg.inner_text('#voile') and pg.locator('#voile .b-lire').count() >= 1 and ev(pg, '() => M.S.or') == 777, 'Un fichier abîmé : un message gentil, rien n\'est remplacé')
    fermer(pg)
    open(faux, 'w').write(json.dumps({'jeu': 'brumeval', 'etat': {'heros': {'nom': 'X', 'role': 'dragon'}}}))
    pg.set_input_files('#import', faux); pg.wait_for_timeout(400)
    verif('ne marche pas' in pg.inner_text('#voile'), 'Un fichier au mauvais contenu est refusé aussi'); fermer(pg)

    # ================= 7. Supprimer le personnage =================
    print('7. Supprimer le personnage')
    ev(pg, "() => { M.S.legendes = [{nom:'Ancien', role:'barde', sexe:'m', niveau:2, e:1, date:'2026-10-30'}]; M.sauver(); M.aller('menu'); }"); pg.wait_for_timeout(200)
    look = ev(pg, "() => M.lookGarde()")
    verif(look and look.get('tete', {}).get('id') == 'bandeau_simple' and look['tete']['c'] == 'bleu', f'La Pisteuse porte un bandeau bleu de sa garde-robe ({look})')
    pg.click('[data-act=supprimer]'); pg.wait_for_timeout(200)
    tv = pg.inner_text('#voile')
    verif('Supprimer Naïm' in tv and 'Livre des Légendes' in tv and 'revenir en arrière' in tv and pg.locator('#voile .b-lire').count() >= 1, 'Supprimer : un avertissement clair, avec 🔊')
    pg.screenshot(path=f'{OUT}/supprimer-390x844.png')
    pg.click('#voile [data-act=confirmer-oui]'); pg.wait_for_timeout(400)
    st = ev(pg, "() => { var L = M.S.legendes; var x = L[L.length - 1]; return [M.S.heros, M.UI.ecran, L.length, x.nom, x.fin, x.niveau, x.e, !!x.look, x.look && x.look.garde && x.look.garde.tete && x.look.garde.tete.c, x.look && x.look.equip.join(','), M.S.or, !!M.S.ancien]; }")
    verif(st[0] is None and st[1] == 'creation' and st[2] == 2 and st[3] == 'Naïm' and st[4] == 'supprime' and st[5] == 4 and st[7] and st[8] == 'bleu' and st[10] == 0 and st[11], f'Le héros part dans le Livre des Légendes (avec son apparence), tout recommence à la création ({st})')
    verif(pg.is_visible('[data-act=crea-meme]'), 'Création : « Reprendre la même apparence »')

    # ================= 8. Le Livre des Légendes =================
    print('8. Livre des Légendes')
    pg.click('[data-act=crea-retour]'); pg.wait_for_timeout(200)
    # (Romain, 4 novembre, 4 h 19 : l'accueil sans héros n'a plus de boutons en bas, seulement « 👥 Changer de joueur » s'il y a d'autres héros ;
    #  le Livre des Légendes s'ouvre donc ici directement, comme depuis le menu ☰)
    verif(pg.locator('.b-pied [data-e=legendes], .b-pied .hr-charger, .b-pied [data-act=aide], .b-pied [data-e=reglages]').count() == 0, 'Sans héros : plus de boutons en bas au village (Romain, 4 novembre)')
    ev(pg, "() => M.aller('legendes')"); pg.wait_for_timeout(300)
    cartes = pg.locator('.hr-leg')
    verif(cartes.count() == 2, f'Deux légendes ({cartes.count()})')
    c0 = cartes.nth(0).inner_text(); c1 = cartes.nth(1).inner_text()
    verif('Naïm' in c0 and 'Pisteuse' in c0 and 'Enquête 1' in c0 and 'Niveau 4' in c0 and 'Supprimée' in c0 and 'novembre' in c0, f'La dernière légende : nom, rôle, enquête, niveau, date, fin ({c0!r})')
    verif('Ancien' in c1 and 'Barde' in c1 and 'Perdu dans la brume' in c1 and '30 octobre 2026' in c1, f'Une vieille légende (sans apparence gardée) marche encore ({c1!r})')
    svg0 = ev(pg, "() => document.querySelectorAll('.hr-leg-img svg')[0].outerHTML")
    verif('data-gs="tete"' in svg0 and '#2f6ed0' in svg0.lower(), 'Le portrait de la légende porte exactement sa tenue (bandeau bleu de la garde-robe)')
    verif(pg.locator('.hr-leg .b-lire').count() == 2, 'Chaque légende a son 🔊')
    pg.screenshot(path=f'{OUT}/legendes-390x844.png')
    pg.set_viewport_size({'width': 1280, 'height': 800}); pg.wait_for_timeout(250); pg.screenshot(path=f'{OUT}/legendes-1280x800.png')
    pg.set_viewport_size({'width': 390, 'height': 844}); pg.wait_for_timeout(150)
    pg.click('[data-act=retour]'); pg.wait_for_timeout(200)
    verif(ev(pg, '() => M.UI.ecran') in ('accueil', 'creation') and pg.is_visible('[data-act=creer]'), '« ← Retour » du Livre revient au village')
    pg.context.close()

    # ================= 9. Enfant ou adulte (revenu le 4 novembre) =================
    print('9. Enfant ou adulte')
    pg = nouvelle(b, 390, 844, 'enfant')
    creer(pg, 'barde', 'Alicia')
    st = ev(pg, "() => [M.S.heros.joueur, window.MJ_JOUEUR, MJ.reglages('tir', 1, {}).niveauEffectif, MJ.reglages('cachette', 1, {}).niveauEffectif, MJ.reglages('tir', 2, {}).niveauEffectif]")
    verif(st == ['adulte', 'adulte', 1, 3, 5], f'Par défaut, un adulte : niveau 1 au tutoriel (« Se cacher » 3), niveau 5 à l\'enquête 2 ({st})')
    ev(pg, "() => { M.UI.ecran = 'reglages'; M.render(); }"); pg.wait_for_timeout(200)
    verif(pg.is_visible('[data-act=joueur][data-v=enfant]') and pg.is_visible('[data-act=joueur][data-v=adulte]'), 'Réglages : « Qui joue ce héros ? » enfant / adulte')
    pg.click('[data-act=joueur][data-v=enfant]'); pg.wait_for_timeout(200)
    st = ev(pg, "() => [M.S.heros.joueur, window.MJ_JOUEUR, MJ.reglages('tir', 1, {}).niveauEffectif, MJ.reglages('cachette', 1, {}).niveauEffectif, MJ.reglages('tir', 3, {}).niveauEffectif]")
    verif(st == ['enfant', 'enfant', 1, 3, 3], f'Enfant : niveau 1 à l\'enquête 1 (« Se cacher » : 3), +1 par enquête ({st})')
    pg.reload(wait_until='domcontentloaded'); pg.wait_for_selector('#app main')
    verif(ev(pg, "() => M.S.heros.joueur") == 'enfant', 'Le choix est gardé après un rechargement')
    pg.context.close()
    # la courbe des adultes : 5 à l'enquête 1, 10 à l'enquête 10
    pg = nouvelle(b, 390, 844, 'courbe')
    c = ev(pg, "() => [1,2,3,4,5,6,7,8,9,10].map(function(e){ return [MJ.niveauPour('tir', e, 'adulte'), MJ.niveauPour('tir', e, 'enfant'), MJ.niveauPour('cachette', e, 'enfant')]; })")
    verif([x[0] for x in c] == [1, 5, 6, 6, 7, 8, 8, 9, 9, 10] and [x[1] for x in c] == list(range(1, 11)) and [x[2] for x in c] == [3, 4, 5, 6, 7, 8, 9, 10, 10, 10], f'Courbes : adulte (tutoriel au niveau 1) {[x[0] for x in c]}, enfant {[x[1] for x in c]}, se cacher enfant {[x[2] for x in c]}')
    pg.context.close()

    # ================= 10. Installer, Plein écran =================
    print('10. Installer le jeu, Plein écran')
    pg = nouvelle(b, 390, 844, 'installer')
    creer(pg, 'sage', 'Lia')
    ev(pg, "() => M.aller('menu')"); pg.wait_for_timeout(200)
    verif(pg.locator('[data-act=installer]').count() == 0, 'Sans invitation du navigateur : pas de bouton « Installer »')
    ev(pg, "() => { var e = new Event('beforeinstallprompt', {cancelable:true}); e.prompt = function(){ window.__invite = (window.__invite || 0) + 1; return Promise.resolve(); }; e.userChoice = Promise.resolve({outcome:'accepted'}); window.dispatchEvent(e); }")
    pg.wait_for_timeout(200)
    lab = [re.sub(r'^\W+\s*', '', t).strip() for t in pg.locator('.hr-menu-l > .btn').all_inner_texts()]
    verif(lab[:6] == ['Comment jouer', 'Réglages', 'Changer de joueur', 'Installer le jeu', 'Plein écran', 'Sauvegarder'], f'Android / Chrome : « 📲 Installer le jeu » et « ⛶ Plein écran » après « Changer de joueur », avant « Sauvegarder » ({lab})')
    pg.click('[data-act=installer]'); pg.wait_for_timeout(300)
    verif(ev(pg, '() => window.__invite') == 1 and pg.locator('[data-act=installer]').count() == 0, 'Un toucher ouvre l\'installation du navigateur')
    pg.click('[data-act=plein-ecran]'); pg.wait_for_timeout(500)
    plein = ev(pg, '() => !!document.fullscreenElement')
    if plein:
        verif('Quitter le plein écran' in pg.inner_text('.hr-menu-l'), 'Plein écran : le bouton devient « Quitter le plein écran »')
        pg.click('[data-act=plein-ecran]'); pg.wait_for_timeout(500)
        verif(not ev(pg, '() => !!document.fullscreenElement') and 'Quitter' not in pg.inner_text('.hr-menu-l'), 'Quitter le plein écran')
    else:
        non_testes.append('plein écran réel (refusé par Chromium sans écran)')
        print('  (Chromium sans écran refuse le plein écran : vérifié seulement que le bouton existe)')
    pg.context.close()
    # iPhone, dans Safari : le guide en images ; pas de plein écran (Safari iPhone n'a pas l'API)
    sans_fs = "Object.defineProperty(Document.prototype, 'fullscreenEnabled', {get: function(){ return false; }}); Object.defineProperty(Document.prototype, 'webkitFullscreenEnabled', {get: function(){ return false; }});"
    pg = nouvelle(b, 390, 844, 'iphone', ua=IPHONE, init=sans_fs)
    creer(pg, 'alchimiste', 'Siham')
    ev(pg, "() => M.aller('menu')"); pg.wait_for_timeout(200)
    lab = [re.sub(r'^\W+\s*', '', t).strip() for t in pg.locator('.hr-menu-l > .btn').all_inner_texts()]
    verif('Installer le jeu' in lab and 'Plein écran' not in lab, f'iPhone : « Installer le jeu », pas de « Plein écran » ({lab})')
    pg.click('[data-act=installer]'); pg.wait_for_timeout(300)
    g = pg.inner_text('#voile')
    verif(pg.locator('#voile .hr-etapes li').count() == 4 and 'Partager' in g and 'Sur l\'écran d\'accueil' in g and 'Ajouter' in g and pg.locator('#voile .b-lire').count() >= 1 and pg.locator('#voile .hr-ic-partage svg').count() == 1,
          'iPhone : le guide en images (Partager ⬆️ → Sur l\'écran d\'accueil → Ajouter), avec 🔊')
    pg.screenshot(path=f'{OUT}/installer-iphone-390x844.png')
    pg.context.close()
    seul = "Object.defineProperty(Navigator.prototype, 'standalone', {get: function(){ return true; }});"
    pg = nouvelle(b, 390, 844, 'installe', ua=IPHONE, init=seul)
    creer(pg, 'pisteur', 'Romain')
    ev(pg, "() => M.aller('menu')"); pg.wait_for_timeout(200)
    verif(pg.locator('[data-act=installer]').count() == 0 and pg.locator('[data-act=plein-ecran]').count() == 0, 'Déjà installé (écran d\'accueil) : ni « Installer » ni « Plein écran »')
    pg.context.close()

    # ================= 11. Jouer sans internet (petit serveur local, service worker) =================
    print('11. Jouer sans internet')
    modele = os.path.join(ICI, '..', '..', 'deploy', 'sw-modele.js')
    if not os.path.exists(modele):
        non_testes.append('Jouer sans internet (sw-modele.js introuvable)')
    else:
        racine = os.path.join(OUT, 'serveur'); site = os.path.join(racine, 'brumeval')
        shutil.rmtree(racine, ignore_errors=True); os.makedirs(site)
        shutil.copy(os.path.join(DIST, 'index.html'), os.path.join(site, 'index.html'))
        shutil.copy(os.path.join(DIST, 'salle-mini-jeux.html'), os.path.join(site, 'salle.html'))
        for f in ['manifest.webmanifest', 'favicon.svg', 'icon-192.png', 'icon-512.png', 'apple-touch-icon.png']:
            shutil.copy(os.path.join(ICI, '..', 'dist', f), os.path.join(site, f))
        open(os.path.join(site, 'sw.js'), 'w', encoding='utf-8').write(open(modele, encoding='utf-8').read().replace('__VERSION__', 'essai'))
        s = socket.socket(); s.bind(('127.0.0.1', 0)); port = s.getsockname()[1]; s.close()
        # comme GitHub Pages : les pages en UTF-8
        code = ('import http.server, functools, sys\n'
                'H = http.server.SimpleHTTPRequestHandler\n'
                'H.extensions_map.update({".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".webmanifest": "application/manifest+json"})\n'
                'http.server.ThreadingHTTPServer(("127.0.0.1", int(sys.argv[1])), functools.partial(H, directory=sys.argv[2])).serve_forever()\n')
        serveur = subprocess.Popen([sys.executable, '-c', code, str(port), racine], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        time.sleep(1.2)
        try:
            adr = f'http://127.0.0.1:{port}/brumeval/'
            pg = nouvelle(b, 390, 844, 'sans-internet', url=adr)
            try:
                pg.wait_for_function('() => navigator.serviceWorker && navigator.serviceWorker.controller', timeout=20000)
            except Exception:
                ev(pg, '() => navigator.serviceWorker.ready.then(function(){ return 1; })'); pg.reload(wait_until='domcontentloaded'); pg.wait_for_selector('#app main')
            verif(ev(pg, '() => !!navigator.serviceWorker.controller'), 'Le service worker garde la page')
            creer(pg, 'barde', 'Naïm')
            ev(pg, "() => M.aller('menu')"); pg.wait_for_timeout(300)
            verif(pg.is_visible('[data-act=hors-ligne]') and 'Jouer sans internet' in pg.inner_text('[data-act=hors-ligne]'), 'Version en ligne : « 📥 Jouer sans internet » dans le menu')
            pg.click('[data-act=hors-ligne]')
            vu_barre = False
            for i in range(240):
                if pg.locator('#hl-barre').count(): vu_barre = True
                if pg.locator('#voile .hr-hl-ok, #voile .hr-hl-ko').count(): break
                pg.wait_for_timeout(250)
            ok = pg.locator('#voile .hr-hl-ok').count() == 1
            verif(vu_barre, 'Une barre de progression pendant que le jeu se garde')
            etat = ev(pg, "() => JSON.parse(localStorage.getItem('brumeval-sans-internet') || 'null')")
            verif(ok and 'novembre' in pg.inner_text('#voile') or ok and re.search(r'\d{4}', pg.inner_text('#voile')), f'« ✅ Prêt à jouer sans internet », avec la date ({pg.inner_text("#voile")[:120]!r})')
            if etat:
                ext = [u for u in etat.get('echecs', [])]
                print('    gardés :', len(etat.get('urls', [])), 'fichiers en plus du jeu ; pas pu (internet bloqué ici) :', ext)
                if ext: non_testes.append('polices Google / moteur des voix hors ligne (adresses externes bloquées ici : ' + ', '.join(sorted(set(re.sub(r'^(https://[^/]+/).*$', r'\1', u) for u in ext))) + ')')
            verif(pg.locator('#voile [data-act=hors-ligne-maj]').count() == 1, 'Une fois prêt : « 🔄 Mettre à jour »')
            pg.screenshot(path=f'{OUT}/sans-internet-390x844.png')
            fermer(pg); pg.wait_for_timeout(200)
            verif('Prêt sans internet' in pg.inner_text('[data-act=hors-ligne]'), 'Le bouton du menu montre directement ✅')
            ev(pg, "() => M.aller('accueil')")
            pg.context.set_offline(True); pg.wait_for_timeout(300)
            verif(pg.is_visible('#hr-reseau'), 'Hors ligne : le petit 📴 apparaît')
            pg.reload(wait_until='domcontentloaded'); pg.wait_for_selector('#app main', timeout=30000)
            verif('Naïm' in pg.inner_text('#app') and pg.is_visible('[data-act=nouvelle-enquete]'), 'Hors ligne, après rechargement : le jeu s\'ouvre, le héros est là')
            pg.click('[data-act=nouvelle-enquete]'); pg.click('[data-act=commencer]'); pg.wait_for_selector('.b-entete')
            pg.click('.b-et-heros'); pg.wait_for_timeout(300)
            verif(ev(pg, '() => M.UI.ecran') == 'heros' and pg.is_visible('#hr-reseau'), 'Hors ligne : on joue (enquête, écran du héros), 📴 reste discret')
            pg.screenshot(path=f'{OUT}/hors-ligne-heros-390x844.png')
            p2 = pg.context.new_page(); ecouter(p2, 'salle')
            r = p2.goto(adr + 'salle.html', wait_until='domcontentloaded')
            verif(r is not None and r.ok and p2.locator('#salle').count() == 1, 'Hors ligne : la salle des mini-jeux s\'ouvre aussi')
            pg.context.set_offline(False); pg.wait_for_timeout(300)
            verif(not pg.is_visible('#hr-reseau'), 'De retour en ligne : 📴 disparaît')
            pg.context.close()
            # le fichier local et l'aperçu : pas de bouton
        finally:
            serveur.terminate()
            shutil.rmtree(racine, ignore_errors=True)   # la copie du site ne sert qu'à l'essai

    print('Non testé ici :', non_testes)
    print('ERREURS :', erreurs)
    print('ÉCHECS :', echecs)
    b.close()
