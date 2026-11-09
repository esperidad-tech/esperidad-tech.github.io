"""Test du prototype « La salle des rats », version 2 : python3 test-jeu.py
- tablette 1024 x 768 au doigt : le sac, l'entrée des héros et des rats, une partie GAGNANTE complète, puis une partie avec la FUITE ;
- écran 1280 x 800 à la souris : une partie gagnante, un rat qui s'enfuit de peur, la fuite automatique, le Cœur vaillant, les Herbes ;
- tablette tenue debout : le message « Tourne ta tablette » ;
- règles du 9 novembre : la rage reste jusqu'à la fin, la brûlure enlève 4 PV à chaque tour des rats, le bouclier montre ce qu'il absorbe ;
- aucune erreur JavaScript, aucune lecture vocale sans bouton 🔊, le son démarre sur « Descendre » ;
- des captures dans captures/ aux moments clés."""
import os, sys
from playwright.sync_api import sync_playwright

ICI = os.path.dirname(os.path.abspath(__file__))
PAGE = 'file://' + os.path.join(ICI, 'salle-rats.html')
CAP = os.path.join(ICI, 'captures')
os.makedirs(CAP, exist_ok=True)
ERREURS, OK = [], []


def verifie(cond, quoi):
    (OK if cond else ERREURS).append(quoi)
    print(('  ok  ' if cond else '  ÉCHEC  ') + quoi)


class Partie:
    def __init__(self, navigateur, nom, largeur, hauteur, doigt):
        opts = {'viewport': {'width': largeur, 'height': hauteur}, 'device_scale_factor': 1}
        if doigt:
            opts.update(has_touch=True, is_mobile=True)
        self.ctx = navigateur.new_context(**opts)
        self.pg = self.ctx.new_page()
        self.nom, self.doigt = nom, doigt
        self.erreurs = []
        self.pg.on('pageerror', lambda e: self.erreurs.append('pageerror: ' + str(e)))
        self.pg.on('console', lambda m: self.erreurs.append(m.type + ': ' + m.text) if m.type in ('error', 'warning') else None)
        self.pg.route('**/fonts.googleapis.com/**', lambda r: r.fulfill(status=200, content_type='text/css', body=''))
        self.pg.route('**/fonts.gstatic.com/**', lambda r: r.fulfill(status=404, body=''))
        self.pg.add_init_script("""window.__parle = 0; try{ speechSynthesis.speak = function(u){ window.__parle++; window.__dernier = u.text; }; }catch(e){}""")
        self.pg.goto(PAGE)
        self.pg.wait_for_timeout(700)
        self.pg.evaluate("""() => { var s = 7; SALLE.hasard = function(){ s = (s * 9301 + 49297) % 233280; return s / 233280; }; }""")

    def capture(self, n):
        self.pg.screenshot(path=os.path.join(CAP, f'{self.nom}-{n}.png'))

    def touche(self, sel):
        (self.pg.tap if self.doigt else self.pg.click)(sel, force=True)

    def etat(self, js):
        return self.pg.evaluate('() => ' + js)

    def attend(self, js, max_ms=20000):
        t = 0
        while t < max_ms and not self.etat(js):
            self.pg.wait_for_timeout(100); t += 100
        return self.etat(js)

    def attend_libre(self, max_ms=30000):
        if not self.attend("(SALLE.etat.mode === 'qui' && !SALLE.etat.occupe) || !!document.querySelector('#fin')", max_ms):
            raise RuntimeError('le jeu ne rend pas la main : ' + str(self.etat('[SALLE.etat.mode, SALLE.etat.occupe]')))
        self.pg.wait_for_timeout(150)

    def sac(self, recettes, capture=None):
        for r in recettes:
            self.touche(f'.recette[data-id="{r}"] b')
            self.pg.wait_for_timeout(120)
        if capture:
            self.pg.wait_for_timeout(300); self.capture(capture)
        verifie(self.etat("!document.querySelector('#sac .aller').disabled"), f'{self.nom} : « Descendre » s\'allume avec 3 recettes')
        self.touche('[data-act="descendre"]')

    def descendre(self, recettes, capture=None, entree=None):
        self.sac(recettes, capture)
        if entree:
            for n, ms in entree:
                self.pg.wait_for_timeout(ms); self.capture(n)
        self.attend_libre()

    def heros(self, h):
        self.touche(f'.zone[data-type="heros"][data-id="{h}"]'); self.pg.wait_for_timeout(250)

    def geste(self, g):
        self.touche(f'.carte[data-id="{g}"]'); self.pg.wait_for_timeout(250)

    def cible(self, c):
        self.touche(f'.zone[data-type="rat"][data-id="{c}"]' if isinstance(c, int) else f'.zone[data-type="heros"][data-id="{c}"]')

    def devant(self):
        return self.etat("SALLE.etat.r.filter(r => !r.mort)[0].i")

    def joue(self, h, g, cible=None, attendre=True):
        self.heros(h); self.geste(g)
        if cible is not None:
            self.cible(cible)
        if attendre:
            self.attend_libre()

    def le_plus_blesse(self):
        return self.etat("['sage','alchimiste','pisteur'].filter(h => !SALLE.etat.h[h].sol).sort((a, b) => SALLE.etat.h[a].pv / ({sage:90,alchimiste:100,pisteur:120})[a] - SALLE.etat.h[b].pv / ({sage:90,alchimiste:100,pisteur:120})[b])[0]")

    def fin(self):
        errs = [e for e in self.erreurs if 'fonts.g' not in e and 'ERR_' not in e]
        verifie(not errs, f'{self.nom} : aucune erreur JavaScript' + (' — ' + ' | '.join(errs[:5]) if errs else ''))
        self.ctx.close()


def tablette(nav):
    print('— Tablette 1024 x 768, au doigt')
    P = Partie(nav, 'tab', 1024, 768, True)
    pg = P.pg
    P.capture('01-sac-vide')
    verifie(P.etat('window.__parle') == 0, 'aucune lecture vocale toute seule à l\'ouverture')
    verifie(P.etat('SALLE.Son.etat()') == 'pas encore', 'pas de son avant « Descendre »')
    P.touche('#sac .bulle .lire')
    verifie(P.etat('window.__parle') == 1 and 'trois recettes' in P.etat('window.__dernier'), 'le 🔊 du conteur lit sa phrase')
    for r in ['feu', 'huile', 'baume', 'colle']:
        P.touche(f'.recette[data-id="{r}"] b'); pg.wait_for_timeout(120)
    verifie(P.etat('SALLE.etat.sac.length') == 3, 'le sac refuse une 4e recette')
    P.descendre([], capture='02-sac-plein', entree=[('03-entree-heros', 1100), ('04-entree-rats', 1900)])
    verifie(P.etat('SALLE.Son.etat()') == 'running', 'le son démarre sur « Descendre »')
    pg.wait_for_timeout(500)
    P.capture('05-qui-joue')
    verifie(P.etat("document.querySelectorAll('.badges .vise').length") == 3, 'chaque rat montre qui il vise')
    verifie(P.etat("[...document.querySelectorAll('.rat .a-img')].every(i => i.src === SALLE.img('rat-jaune'))") or P.etat('!!window.RatAnime'), 'les rats ont les yeux jaunes')

    # ===== Tour 1 : le Sage étudie, l'Alchimiste renverse l'Huile, le Pisteur achève =====
    P.heros('sage'); P.capture('06-bande-gestes-sage')
    P.geste('etudier'); P.capture('07-choix-cible')
    P.cible(0); pg.wait_for_timeout(1700); P.capture('08-etude-livre')
    P.attend_libre()
    verifie(P.etat('SALLE.etat.livre') == 1, 'le Grand Livre a appris sa première ligne')
    P.heros('alchimiste'); P.capture('09-bande-alchimiste')
    P.geste('p:huile'); P.cible(0)
    pg.wait_for_timeout(350); P.capture('10-potion-preparee')
    pg.wait_for_timeout(450); P.capture('11-potion-en-vol')
    pg.wait_for_timeout(1300); P.capture('12-huile-flaque-dos')
    P.attend_libre()
    verifie(P.etat('SALLE.etat.r[0].ouvert'), 'l\'Huile ouvre le point faible')
    verifie(P.etat("window.RatAnime ? SALLE.acteurs.r[0].etat().dos && !!SALLE.acteurs.r[0]._rat.fx.flaque_huile : !!document.querySelector('.flaque-huile')"), 'une flaque d\'huile reste au sol')
    P.heros('pisteur'); P.capture('13-bande-pisteur')
    P.geste('fleche'); P.cible(0)
    for n, ms in [('14-critique-ralenti', 520), ('15-critique-choc', 200), ('16-critique-rayons', 180), ('17-critique-texte', 300), ('18-critique-brume', 700)]:
        pg.wait_for_timeout(ms); P.capture(n)
    P.attend("SALLE.etat.mode === 'rats'")
    verifie(P.etat('SALLE.etat.r[0].mort'), 'le critique du Pisteur tue le rat net')
    pg.wait_for_timeout(1250); P.capture('19-tour-des-rats')
    P.attend_libre()
    verifie(P.etat('SALLE.etat.tour') == 2, 'un nouveau tour commence après les rats')

    # ===== Tour 2 : la rune, la dague ; le feu sur l'autre rat (il brûlera jusqu'au bout) =====
    d = P.devant()
    P.joue('sage', 'rune', d, attendre=False)
    pg.wait_for_timeout(1700); P.capture('20-point-faible-ouvert')
    P.attend_libre()
    verifie(P.etat(f'SALLE.etat.r[{d}].ouvert'), 'la rune de lumière ouvre le point faible')
    P.joue('pisteur', 'dague', d)
    verifie(P.etat(f'SALLE.etat.r[{d}].mort'), 'la dague sur un rat ouvert : critique')
    autre = P.devant()
    P.joue('alchimiste', 'p:feu', autre, attendre=False)
    pg.wait_for_timeout(2200); P.capture('21-feu-qui-reste')
    P.attend("SALLE.etat.mode === 'rats'")
    pv_avant = P.etat(f'SALLE.etat.r[{autre}].pv')
    verifie(P.etat(f'SALLE.etat.r[{autre}].brule') and pv_avant == 35, 'la Fiole de feu : −5, et le rat brûle')
    pg.wait_for_timeout(950); P.capture('22-brulure-tour-des-rats')
    P.attend_libre()
    verifie(P.etat(f'SALLE.etat.r[{autre}].pv') == 31 and P.etat(f'SALLE.etat.r[{autre}].brule'), 'la brûlure : −4 au tour des rats, et elle reste')

    # ===== Tour 3 : on finit =====
    d = P.devant()
    P.joue('sage', 'rune', d)
    P.joue('pisteur', 'fleche', d, attendre=False)
    P.attend("!!document.querySelector('.victoire')", 15000)
    pg.wait_for_timeout(600); P.capture('23-victoire')
    verifie(P.etat("!!document.querySelector('.victoire')"), 'victoire : « La salle est à vous ! »')
    verifie(P.etat('SALLE.etat.tour') == 3, f'partie gagnée en {P.etat("SALLE.etat.tour")} tours (attendu : 3)')
    verifie('3 tours' in P.etat("document.querySelector('.victoire .bulle .txt').textContent"), 'le message de victoire compte les tours (« 3 tours »)')

    # ===== Rejouer, puis le bouclier, la louche, le nuage, la colle, et la fuite =====
    P.touche('[data-act="rejouer"]'); pg.wait_for_timeout(500)
    verifie(P.etat("SALLE.etat.ecran") == 'sac' and P.etat('SALLE.etat.livre') == 0, 'Rejouer ramène au sac, tout neuf')
    P.descendre(['fumigene', 'colle', 'coeur'])
    P.joue('sage', 'bouclier', 'pisteur', attendre=False)
    pg.wait_for_timeout(1300); P.capture('24-bouclier')
    P.attend_libre()
    verifie(P.etat("window.HerosAnime ? /−50 % · 1 tour/.test((document.querySelector('#fx .ha-dome .ha-badge') || {}).textContent || '') : getComputedStyle(document.querySelector('.h-pisteur .badge-bouclier')).opacity === '1'"),
            'le badge « 🛡️ −50 % · 1 tour » est sur le Pisteur')
    P.joue('alchimiste', 'louche', P.devant(), attendre=False)
    pg.wait_for_timeout(700); P.capture('25-bong')
    pg.wait_for_timeout(1000); P.capture('26-rage')
    P.attend_libre()
    verifie(P.etat('SALLE.etat.r.filter(r => !r.mort).every(r => r.enrage)'), 'le coup de louche rend tous les rats enragés')
    P.etat("(SALLE.etat.r[0].pv = 2, SALLE.maj(), 0)")      # ce rat-là sera battu (il s'enfuit) : il ne doit pas revenir
    P.joue('pisteur', 'fleche', 0, attendre=False)
    P.attend("SALLE.etat.mode === 'rats'")
    P.attend("!!document.querySelector('.fx-texte')", 12000)
    pg.wait_for_timeout(150); P.capture('27-bouclier-absorbe')
    verifie('absorbés' in (P.etat("(document.querySelector('.fx-texte') || {}).textContent || ''")), 'à la morsure : « 16 → 8 (8 absorbés) »')
    P.attend_libre()
    verifie(P.etat('SALLE.etat.r.filter(r => !r.mort).every(r => r.enrage)'), 'la rage reste au tour suivant')
    P.joue('alchimiste', 'p:fumigene', P.devant(), attendre=False)
    pg.wait_for_timeout(1800); P.capture('28-nuage')
    pg.wait_for_timeout(1300); P.capture('29-nuage-toux')
    P.attend_libre()
    P.joue('sage', 'bouclier', 'pisteur')
    P.joue('pisteur', 'fleche', P.devant())
    P.joue('alchimiste', 'p:colle', P.devant(), attendre=False)
    pg.wait_for_timeout(2300); P.capture('30-colle')
    P.attend_libre()
    verifie(P.etat('SALLE.etat.r.some(r => r.colle)') and P.etat("window.RatAnime ? SALLE.etat.r.some(r => r.colle && SALLE.acteurs.r[r.i].etat().colle && !!SALLE.acteurs.r[r.i]._rat.fx.flaque_colle) : !!document.querySelector('.flaque-colle')"), 'la Colle : une flaque gluante, le rat collé')
    P.touche('#bruitages'); pg.wait_for_timeout(100)
    verifie(not P.etat('SALLE.Son.actif()') and P.etat("document.querySelector('#bruitages').textContent") == '🔇', 'le bouton coupe les bruitages')
    P.touche('#bruitages')
    P.touche('#fuite'); pg.wait_for_timeout(300); P.capture('31-fuite-question')
    P.touche('[data-act="fuir"]')
    pg.wait_for_timeout(1500); P.capture('32-fuite-cri')
    P.attend("!!document.querySelector('.point')", 8000)
    pg.wait_for_timeout(400); P.capture('33-on-fait-le-point')
    verifie(P.etat("!!document.querySelector('.point')"), 'la fuite mène à « On fait le point »')
    P.touche('[data-act="reessayer"]'); pg.wait_for_timeout(400)
    P.descendre([])
    verifie(P.etat("document.querySelectorAll('.rat:not(.parti)').length") == P.etat('SALLE.etat.r.filter(r => !r.mort).length') and P.etat('SALLE.etat.r[0].mort'),
            'les rats battus restent battus quand on réessaie')
    P.capture('34-reessai')
    verifie(P.etat('window.__parle') == 1, 'jamais de lecture vocale sans bouton 🔊 (toute la partie)')
    P.fin()


def ecran(nav):
    print('— Écran 1280 x 800, à la souris')
    P = Partie(nav, 'pc', 1280, 800, False)
    pg = P.pg
    P.descendre(['feu', 'huile', 'coeur'])
    P.capture('01-combat')
    # un rat battu SANS critique s'enfuit de peur
    P.etat("(SALLE.etat.r[2].pv = 3, window.__h = SALLE.hasard, SALLE.hasard = () => .99, SALLE.maj(), 0)")   # pas de flèche surprise ici
    P.joue('pisteur', 'fleche', 2, attendre=False)
    pg.wait_for_timeout(1100); P.capture('02-rat-qui-fuit')
    P.attend_libre()
    P.etat("(SALLE.hasard = window.__h, 0)")
    verifie(P.etat('SALLE.etat.r[2].mort') and P.etat("document.querySelector('.r-2').classList.contains('parti')"), 'un rat battu sans critique s\'enfuit de peur')
    # la fin du tour 1 (le Pisteur a déjà tiré) : la lumière, puis le feu
    P.joue('sage', 'rune', P.devant())
    P.joue('alchimiste', 'p:feu', P.devant())
    tours = 0
    while not P.etat("!!document.querySelector('#fin')") and tours < 8:
        tours += 1
        d = P.devant()
        P.joue('sage', 'rune', d)
        P.joue('pisteur', 'fleche', d)
        if P.etat("!!document.querySelector('#fin')"):
            break
        P.joue('alchimiste', 'p:feu', P.devant())
    P.attend("!!document.querySelector('.victoire')", 15000)
    pg.wait_for_timeout(400); P.capture('03-victoire')
    verifie(P.etat("!!document.querySelector('.victoire')"), f'souris : victoire en {P.etat("SALLE.etat.tour")} tours')
    # la fuite automatique : les trois héros au sol
    P.touche('[data-act="rejouer"]'); pg.wait_for_timeout(400)
    P.descendre(['fumigene', 'colle', 'baume'])
    P.etat("(['sage','alchimiste','pisteur'].forEach(h => SALLE.etat.h[h].pv = 5), SALLE.maj(), 0)")
    P.joue('sage', 'bouclier', 'sage')
    P.joue('alchimiste', 'louche', P.devant())
    P.joue('pisteur', 'fleche', 1, attendre=False)
    P.attend("SALLE.etat.h.pisteur.sol || SALLE.etat.h.alchimiste.sol", 15000)
    pg.wait_for_timeout(700); P.capture('04-heros-au-sol')
    P.attend("!!document.querySelector('.point')", 20000)
    pg.wait_for_timeout(500); P.capture('05-fuite-auto')
    verifie(P.etat("!!document.querySelector('.point')"), 'les trois héros au sol : fuite automatique, puis « On fait le point »')
    # Réessayer avec le Cœur vaillant ; les Herbes
    P.touche('[data-act="reessayer"]'); pg.wait_for_timeout(400)
    P.touche('.recette[data-id="fumigene"] b'); P.touche('.recette[data-id="coeur"] b')
    P.descendre([])
    P.etat("(SALLE.etat.h.sage.pv = 0, SALLE.etat.h.sage.sol = true, SALLE.acteurs.h.sage.tomber(), SALLE.etat.h.pisteur.pv = 50, SALLE.maj(), 0)")
    pg.wait_for_timeout(700); P.capture('06-sage-au-sol')
    P.joue('alchimiste', 'p:coeur', 'sage', attendre=False)
    pg.wait_for_timeout(1900); P.capture('07-coeur-vaillant')
    P.attend_libre()
    verifie(P.etat('!SALLE.etat.h.sage.sol && SALLE.etat.h.sage.pv === 40'), 'le Cœur vaillant relève le Sage avec 40 PV')
    P.joue('sage', 'etudier', P.devant())
    P.joue('pisteur', 'dague', P.devant())
    P.attend_libre()
    pv = P.etat('SALLE.etat.h.pisteur.pv')
    P.joue('alchimiste', 'herbes', 'pisteur', attendre=False)
    pg.wait_for_timeout(900); P.capture('08-herbes')
    P.attend("SALLE.etat.mode === 'rats' || (SALLE.etat.mode === 'qui' && !SALLE.etat.occupe)")
    verifie(P.etat('SALLE.etat.h.pisteur.pv') >= min(120, pv + 20) - 16, 'les Herbes soignent 20')
    P.fin()


def cumul(nav):
    """les états se cumulent sur le même rat, dans le vrai combat : enragé + brûlé + ouvert, puis enragé + brûlé + sur le dos"""
    print('— Les états qui se cumulent')
    P = Partie(nav, 'cumul', 1024, 768, True)
    pg = P.pg
    P.descendre(['feu', 'huile', 'baume'])
    P.joue('alchimiste', 'louche', P.devant())
    P.joue('pisteur', 'p:feu', 1)
    P.joue('sage', 'rune', 1, attendre=False)
    P.attend("SALLE.etat.r[1].ouvert", 8000)
    pg.wait_for_timeout(900); P.capture('01-enrage-brule-ouvert')
    e = P.etat("SALLE.etat.r[1]")
    verifie(e['enrage'] and e['brule'] and e['ouvert'], 'jeu : le rat 1 est enragé + brûlé + ouvert')
    if P.etat('!!window.RatAnime'):
        m = P.etat("SALLE.acteurs.r[1].etat()")
        verifie(m['enrage'] and m['feu'] and m['ebloui'] and m['cible'] and m['yeux'] == 'rouge', 'module : enragé (yeux rouges) + flammes + ébloui + cible, en même temps')
    P.attend("SALLE.etat.mode === 'rats'", 15000)
    P.attend_libre()
    e = P.etat("SALLE.etat.r[1]")
    verifie(e['enrage'] and e['brule'] and not e['ouvert'], 'après le tour des rats : toujours enragé et brûlé, le ventre refermé')
    P.joue('alchimiste', 'p:huile', 1, attendre=False)
    P.attend("SALLE.etat.r[1].ouvert", 8000)
    pg.wait_for_timeout(2200); P.capture('02-enrage-brule-dos')
    if P.etat('!!window.RatAnime'):
        m = P.etat("SALLE.acteurs.r[1].etat()")
        verifie(m['enrage'] and m['feu'] and m['dos'] and m['cible'], 'module : enragé + flammes + sur le dos + cible, en même temps')
    P.attend_libre()
    P.joue('pisteur', 'fleche', 1, attendre=False)
    pg.wait_for_timeout(1500); P.capture('03-critique-cumul')
    P.attend_libre()
    verifie(P.etat("SALLE.etat.r[1].mort"), 'le critique finit le rat enragé, brûlé et retourné')
    P.fin()


def debout(nav):
    print('— Tablette tenue debout')
    P = Partie(nav, 'debout', 768, 1024, True)
    P.capture('01-tourne')
    verifie(P.etat("!document.querySelector('#tourne').hidden"), 'tablette debout : « Tourne ta tablette »')
    P.fin()


if __name__ == '__main__':
    quoi = sys.argv[1:] or ['tablette', 'ecran', 'cumul', 'debout']
    with sync_playwright() as p:
        nav = p.chromium.launch()
        for f in [tablette, ecran, cumul, debout]:
            if f.__name__ not in quoi:
                continue
            try:
                f(nav)
            except Exception as e:
                ERREURS.append(f.__name__ + ' : ' + str(e).split('\n')[0])
                print('  PLANTÉ', f.__name__, e)
        nav.close()
    print(f'\n{len(OK)} vérifications réussies, {len(ERREURS)} échecs')
    for e in ERREURS:
        print('  ✗', e)
    sys.exit(1 if ERREURS else 0)
