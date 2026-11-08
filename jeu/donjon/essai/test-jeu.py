"""Test du prototype « La salle des rats » : python3 test-jeu.py
- tablette 1024 x 768 au doigt : le sac, une partie GAGNANTE complète, puis une partie avec la FUITE (et Réessayer) ;
- écran 1280 x 800 à la souris : une partie gagnante rapide, puis la fuite automatique (les trois héros au sol) ;
- tablette tenue debout : le message « Tourne ta tablette » ;
- aucune erreur JavaScript, aucune lecture vocale sans bouton 🔊 ;
- des captures dans captures/ aux moments clés."""
import os, sys
from playwright.sync_api import sync_playwright

ICI = os.path.dirname(os.path.abspath(__file__))
PAGE = 'file://' + os.path.join(ICI, 'salle-rats.html')
CAP = os.path.join(ICI, 'captures')
os.makedirs(CAP, exist_ok=True)
ERREURS = []
OK = []


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
        self.pg.on('console', lambda m: self.erreurs.append('console: ' + m.text) if m.type == 'error' else None)
        # pas d'Internet ici : les polices Google répondent « vide » (sur la tablette, elles se chargent)
        self.pg.route('**/fonts.googleapis.com/**', lambda r: r.fulfill(status=200, content_type='text/css', body=''))
        self.pg.route('**/fonts.gstatic.com/**', lambda r: r.fulfill(status=404, body=''))
        # on compte les lectures vocales : il n'y en a que sur un bouton 🔊
        self.pg.add_init_script("""window.__parle = 0; try{ var s = speechSynthesis.speak.bind(speechSynthesis);
            speechSynthesis.speak = function(u){ window.__parle++; window.__dernier = u.text; }; }catch(e){}""")
        self.pg.goto(PAGE)
        self.pg.wait_for_timeout(700)
        # un hasard qu'on connaît (rejouable) : les rats visent, la flèche surprise
        self.pg.evaluate("""() => { var s = 7; SALLE.hasard = function(){ s = (s * 9301 + 49297) % 233280; return s / 233280; }; }""")

    def capture(self, n):
        self.pg.screenshot(path=os.path.join(CAP, f'{self.nom}-{n}.png'))

    def touche(self, sel):
        if self.doigt:
            self.pg.tap(sel, force=True)
        else:
            self.pg.click(sel, force=True)

    def etat(self, js):
        return self.pg.evaluate('() => ' + js)

    def attend_libre(self, max_ms=20000):
        """attend que ce soit aux héros de jouer (ou la fin)"""
        t = 0
        while t < max_ms:
            m = self.etat("[SALLE.etat.mode, SALLE.etat.occupe, !!document.querySelector('#fin')]")
            if (m[0] == 'qui' and not m[1]) or m[2]:
                self.pg.wait_for_timeout(150)
                return m
            self.pg.wait_for_timeout(100)
            t += 100
        raise RuntimeError('le jeu ne rend pas la main : ' + str(m))

    def sac(self, recettes, capture=None):
        for r in recettes:
            self.touche(f'.recette[data-id="{r}"] b')
            self.pg.wait_for_timeout(120)
        if capture:
            self.pg.wait_for_timeout(300)
            self.capture(capture)
        verifie(self.etat("!document.querySelector('#sac .aller').disabled"), f'{self.nom} : le bouton Descendre s\'allume avec 3 recettes')
        self.touche('[data-act="descendre"]')
        self.pg.wait_for_timeout(900)
        self.attend_libre()

    def heros(self, h):
        self.touche(f'.zone[data-type="heros"][data-id="{h}"]')
        self.pg.wait_for_timeout(250)

    def geste(self, g):
        self.touche(f'.carte[data-id="{g}"]')
        self.pg.wait_for_timeout(250)

    def cible_rat(self, i):
        self.touche(f'.zone[data-type="rat"][data-id="{i}"]')

    def cible_heros(self, h):
        self.touche(f'.zone[data-type="heros"][data-id="{h}"]')

    def devant(self):
        return self.etat("SALLE.etat.r.filter(r => !r.mort)[0].i")

    def joue(self, h, g, cible=None, attendre=True):
        self.heros(h)
        self.geste(g)
        if cible is not None:
            if isinstance(cible, int):
                self.cible_rat(cible)
            else:
                self.cible_heros(cible)
        if attendre:
            return self.attend_libre()

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
    # le 🔊 de la bulle lit la phrase du conteur
    P.touche('#sac .bulle .lire')
    verifie(P.etat('window.__parle') == 1 and 'trois recettes' in P.etat('window.__dernier'), 'le 🔊 du conteur lit sa phrase')
    # une 4e recette est refusée
    for r in ['feu', 'huile', 'baume', 'colle']:
        P.touche(f'.recette[data-id="{r}"] b')
        pg.wait_for_timeout(120)
    verifie(P.etat('SALLE.etat.sac.length') == 3, 'le sac refuse une 4e recette')
    P.touche('.recette[data-id="colle"] b')
    P.touche('.recette[data-id="baume"] b')        # on enlève le Baume…
    P.touche('.recette[data-id="baume"] b')        # … et on le remet
    pg.wait_for_timeout(300)
    P.capture('02-sac-plein')
    verifie(sorted(P.etat('SALLE.etat.sac')) == ['baume', 'feu', 'huile'], 'le sac contient Feu, Huile, Baume')
    P.touche('[data-act="descendre"]')
    pg.wait_for_timeout(900)
    P.attend_libre()
    P.capture('03-qui-joue')
    verifie(P.etat("document.querySelectorAll('.badges .vise').length") == 3, 'chaque rat montre qui il vise')

    # ===== Tour 1 : le Sage étudie, l'Alchimiste renverse l'Huile, le Pisteur achève =====
    P.heros('sage')
    P.capture('04-bande-gestes-sage')
    P.geste('etudier')
    P.capture('05-choix-cible')
    P.cible_rat(0)
    pg.wait_for_timeout(1500)
    P.capture('06-etude-livre')
    P.attend_libre()
    verifie(P.etat('SALLE.etat.livre') == 1, 'le Grand Livre a appris sa première ligne')
    P.touche('.b-livre')
    pg.wait_for_timeout(300)
    P.capture('07-grand-livre')
    P.touche('#fenetre .fermer')
    pg.wait_for_timeout(200)

    P.heros('alchimiste')
    P.capture('08-bande-alchimiste')
    P.geste('p:huile')
    P.cible_rat(0)
    pg.wait_for_timeout(250)
    P.capture('09-potion-preparee')
    pg.wait_for_timeout(500)
    P.capture('10-potion-en-vol')
    pg.wait_for_timeout(1300)
    P.capture('11-huile-sur-le-dos')
    P.attend_libre()
    verifie(P.etat('SALLE.etat.r[0].ouvert'), 'l\'Huile ouvre le point faible du rat de devant')

    P.heros('pisteur')
    P.capture('12-bande-pisteur')
    P.geste('fleche')
    P.cible_rat(0)
    for n, ms in [('13-critique-a', 330), ('14-critique-b', 150), ('15-critique-c', 200)]:
        pg.wait_for_timeout(ms)
        P.capture(n)
    # le tour des rats commence tout seul
    t = 0
    while P.etat('SALLE.etat.mode') != 'rats' and t < 60:
        pg.wait_for_timeout(100); t += 1
    verifie(P.etat('SALLE.etat.r[0].mort'), 'le critique du Pisteur tue le rat net')
    pg.wait_for_timeout(1050)
    P.capture('16-tour-des-rats')
    P.attend_libre()
    verifie(P.etat('SALLE.etat.tour') == 2, 'un nouveau tour commence après les rats')

    # ===== Tour 2 : la rune de lumière, la dague =====
    d = P.devant()
    P.joue('sage', 'rune', d, attendre=False)
    pg.wait_for_timeout(1300)
    P.capture('17-point-faible-ouvert')
    P.attend_libre()
    verifie(P.etat(f'SALLE.etat.r[{d}].ouvert'), 'la rune de lumière ouvre le point faible')
    P.joue('pisteur', 'dague', d)
    verifie(P.etat(f'SALLE.etat.r[{d}].mort'), 'la dague sur un rat ouvert : critique')
    P.joue('alchimiste', 'p:baume', P.le_plus_blesse())
    P.attend_libre()

    # ===== Tour 3 : on recommence =====
    d = P.devant()
    P.joue('sage', 'rune', d)
    P.capture('18-bande-apres-sage')
    P.joue('pisteur', 'fleche', d, attendre=False)
    pg.wait_for_timeout(3600)
    P.capture('19-victoire')
    verifie(P.etat("!!document.querySelector('.victoire')"), 'victoire : « La salle est à vous ! »')
    verifie(P.etat('SALLE.etat.tour') == 3, f'partie gagnée en {P.etat("SALLE.etat.tour")} tours (attendu : 3)')

    # ===== Rejouer, puis la fuite =====
    P.touche('[data-act="rejouer"]')
    pg.wait_for_timeout(500)
    verifie(P.etat("SALLE.etat.ecran") == 'sac' and P.etat('SALLE.etat.livre') == 0, 'Rejouer ramène au sac, tout neuf')
    P.sac(['huile', 'fumigene', 'coeur'])
    # tour 1 : on tue le rat de devant, le Sage protège le Pisteur
    P.joue('alchimiste', 'p:huile', 0)
    P.joue('pisteur', 'fleche', 0)
    P.joue('sage', 'bouclier', 'pisteur', attendre=False)
    pg.wait_for_timeout(1000)
    P.capture('20-bouclier')
    P.attend_libre()
    # tour 2 : le coup de louche affole les rats, puis le fumigène ne sert à rien
    P.joue('alchimiste', 'louche', P.devant(), attendre=False)
    pg.wait_for_timeout(450)
    P.capture('21-bong')
    P.attend_libre()
    verifie(P.etat('SALLE.etat.r.filter(r => !r.mort).every(r => r.affole)'), 'le coup de louche affole tous les rats')
    P.joue('pisteur', 'fleche', P.devant())
    P.joue('sage', 'etudier', P.devant())
    verifie(P.etat('SALLE.etat.livre') == 1, 'Étudier : 1re ligne du Grand Livre')
    P.attend_libre()
    P.joue('sage', 'etudier', P.devant())
    verifie(P.etat('SALLE.etat.livre') == 2, 'Étudier encore : 2e ligne du Grand Livre')
    P.joue('alchimiste', 'p:fumigene', P.devant(), attendre=False)
    pg.wait_for_timeout(900)
    P.capture('22-fumigene')
    P.attend_libre()
    # la fuite : le bouton, la question, la réponse
    P.touche('#fuite')
    pg.wait_for_timeout(300)
    P.capture('23-fuite-question')
    P.touche('[data-act="fuir"]')
    pg.wait_for_timeout(1200)
    P.capture('24-fuite-cri')
    pg.wait_for_timeout(1800)
    P.capture('25-on-fait-le-point')
    verifie(P.etat("!!document.querySelector('.point')"), 'la fuite mène à « On fait le point »')
    verifie(P.etat("document.querySelectorAll('.point .livre-l').length") == 2, '« On fait le point » montre ce que le Grand Livre a appris')
    P.touche('[data-act="reessayer"]')
    pg.wait_for_timeout(500)
    P.capture('26-sac-reessayer')
    verifie(sorted(P.etat('SALLE.etat.sac')) == ['coeur', 'fumigene', 'huile'], 'Réessayer : le sac garde les recettes d\'avant (on peut les changer)')
    P.touche('[data-act="descendre"]')
    pg.wait_for_timeout(900)
    P.attend_libre()
    verifie(P.etat("document.querySelectorAll('.rat:not(.mort)').length") == 2 and P.etat('SALLE.etat.r[0].mort'), 'les rats battus restent battus quand on réessaie')
    P.capture('27-reessai')
    verifie(P.etat('window.__parle') == 1, 'jamais de lecture vocale sans bouton 🔊 (toute la partie)')
    P.fin()


def ecran(nav):
    print('— Écran 1280 x 800, à la souris')
    P = Partie(nav, 'pc', 1280, 800, False)
    pg = P.pg
    P.sac(['feu', 'huile', 'coeur'])
    P.capture('01-combat')
    # une équipe qui comprend : le Sage ouvre, le Pisteur achève ; la Fiole de feu sur un rat ouvert
    tours = 0
    while not P.etat("!!document.querySelector('#fin')") and tours < 8:
        tours += 1
        d = P.devant()
        P.joue('sage', 'rune', d)
        P.joue('pisteur', 'fleche', d)
        if P.etat("!!document.querySelector('#fin')"):
            break
        d = P.devant()
        P.joue('alchimiste', 'p:huile', d)
        if tours == 1:
            P.capture('02-deux-ouverts')
        P.attend_libre()
    pg.wait_for_timeout(1500)
    P.capture('03-victoire')
    verifie(P.etat("!!document.querySelector('.victoire')"), f'souris : victoire en {P.etat("SALLE.etat.tour")} tours')
    # la fuite automatique : les trois héros au sol
    P.touche('[data-act="rejouer"]')
    pg.wait_for_timeout(400)
    P.sac(['fumigene', 'colle', 'baume'])
    P.etat("(['sage','alchimiste','pisteur'].forEach(h => SALLE.etat.h[h].pv = 5), 0)")
    P.joue('sage', 'bouclier', 'sage')
    P.joue('alchimiste', 'louche', P.devant())
    P.joue('pisteur', 'fleche', 1, attendre=False)
    pg.wait_for_timeout(2600)
    P.capture('04-tour-des-rats-affoles')
    t = 0
    while not P.etat("SALLE.etat.h.pisteur.sol || SALLE.etat.h.alchimiste.sol") and t < 80:
        pg.wait_for_timeout(100); t += 1
    pg.wait_for_timeout(700)
    P.capture('04b-heros-au-sol')
    t = 0
    while not P.etat("!!document.querySelector('.point')") and t < 120:
        pg.wait_for_timeout(100)
        t += 1
    pg.wait_for_timeout(600)
    P.capture('05-fuite-auto')
    verifie(P.etat("!!document.querySelector('.point')"), 'les trois héros au sol : fuite automatique, puis « On fait le point »')
    # Réessayer avec le Cœur vaillant : un héros au sol se relève ; les Herbes soignent
    P.touche('[data-act="reessayer"]')
    pg.wait_for_timeout(400)
    P.touche('.recette[data-id="fumigene"] b'); P.touche('.recette[data-id="coeur"] b')
    P.sac([])
    P.etat("(SALLE.etat.h.sage.pv = 0, SALLE.etat.h.sage.sol = true, SALLE.etat.h.pisteur.pv = 50, SALLE.maj(), 0)")
    pg.wait_for_timeout(500)
    P.capture('06-sage-au-sol')
    P.joue('alchimiste', 'p:coeur', 'sage', attendre=False)
    pg.wait_for_timeout(1500)
    P.capture('07-coeur-vaillant')
    P.attend_libre()
    verifie(P.etat('!SALLE.etat.h.sage.sol && SALLE.etat.h.sage.pv === 40'), 'le Cœur vaillant relève le Sage avec 40 PV')
    P.joue('sage', 'etudier', P.devant())
    P.joue('pisteur', 'dague', P.devant())
    P.attend_libre()
    pv = P.etat('SALLE.etat.h.pisteur.pv')
    P.joue('alchimiste', 'herbes', 'pisteur')
    verifie(P.etat('SALLE.etat.h.pisteur.pv') == min(120, pv + 20), 'les Herbes soignent 20')
    P.fin()


def debout(nav):
    print('— Tablette tenue debout')
    P = Partie(nav, 'debout', 768, 1024, True)
    P.capture('01-tourne')
    verifie(P.etat("!document.querySelector('#tourne').hidden"), 'tablette debout : « Tourne ta tablette »')
    P.fin()


with sync_playwright() as p:
    nav = p.chromium.launch()
    for f in [tablette, ecran, debout]:
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
