"""Le donjon lancé depuis l'enquête 3, par l'écran : flock /tmp/brumeval-pw.lock python3 test-enquete.py

L'enquête ouvre la page du Pisteur avec ?enquete=3&jeton=…&potions=…&entree=crypte|puits (jeu/src/descente.js). Ce test joue cette
adresse sans l'enquête (elle a son propre robot, jeu/tools/e3-descente.py, qui fait le vrai aller-retour) :
  1. une descente neuve : les potions du sac (deux fioles), l'écran du sac qui parle du sac de l'Alchimiste, l'entrée par la crypte
     (« L'escalier de la crypte descend… », la carte « Sous le clocher »), le bouton « 🏘️ L'enquête » ; la page rechargée garde tout ;
     une potion de plus avec le même jeton rejoint le sac ; un jeton nouveau recommence une partie neuve ;
  2. les deux codes du Barde sur le pavé : « La Grosse Marie » (toute la vie revient, une seule fois), « Le maire est retenu » ;
  3. avant la dernière salle, sans le code du maire : la fenêtre « Avant d'entrer » (son 🔊, taper le code ou y aller quand même) ;
     on y va quand même : Léo s'enfuit, le code « Léo s'est enfui », l'écran de fin « Léo s'est enfui… » et « Remonter au village » ;
  4. avec le code du maire : pas de fenêtre, Léo attrapé, l'écran de fin et « Remonter au village » ;
  5. le donjon tout seul (sans ?enquete) : rien de tout cela — sept potions, « Sous le puits », pas de bouton « L'enquête », pas de
     fenêtre du maire, Léo attrapé, « Recommencer la descente ».
Partout : aucune erreur JavaScript, aucune lecture vocale toute seule, chaque texte de plus de 3 mots a son 🔊."""
import os, sys
from playwright.sync_api import sync_playwright

ICI = os.path.dirname(os.path.abspath(__file__))
PAGE = 'file://' + os.path.join(ICI, 'sortie', 'index.html')
CAP = os.path.join(ICI, 'captures'); os.makedirs(CAP, exist_ok=True)
ERREURS, OK = [], []


def verifie(cond, quoi):
    (OK if cond else ERREURS).append(quoi)
    print(('  ok  ' if cond else '  ÉCHEC  ') + quoi, flush=True)


class Jeu:
    def __init__(self, nav, url, nom):
        self.ctx = nav.new_context(viewport={'width': 1024, 'height': 768}, device_scale_factor=1, has_touch=True, is_mobile=True)
        self.pg = self.ctx.new_page(); self.errs = []; self.nom = nom; self.n = 0
        self.pg.on('pageerror', lambda e: self.errs.append('pageerror: ' + str(e)))
        self.pg.on('console', lambda m: self.errs.append(m.type + ': ' + m.text[:160]) if m.type in ('error', 'warning') else None)
        self.pg.route('**/fonts.googleapis.com/**', lambda r: r.fulfill(status=200, content_type='text/css', body=''))
        self.pg.route('**/fonts.gstatic.com/**', lambda r: r.fulfill(status=404, body=''))
        self.pg.add_init_script("window.__parle = 0; try{ speechSynthesis.speak = function(u){ window.__parle++; }; }catch(e){}")
        self.va_a(url)

    def va_a(self, url):
        self.pg.goto(url); self.pg.wait_for_timeout(900)

    def js(self, code):
        return self.pg.evaluate('() => ' + code)

    def etat(self):
        return self.js('DJ.Explo.etat()')

    def partie(self):
        return self.js('DJ.Explo._X().partie')

    def attends(self, code, ms=40000):
        t = 0
        while t < ms and not self.js(code):
            self.pg.wait_for_timeout(150); t += 150
        return self.js(code)

    def carte(self):
        r = self.attends("DJ.Explo.etat().ecran === 'carte' && !DJ.Explo.etat().occupe"); self.pg.wait_for_timeout(450); return r

    def scene(self, lieu=None):
        r = self.attends("DJ.Explo.etat().ecran === 'scene' && !DJ.Explo.etat().occupe" + (" && DJ.Explo.etat().scene === '%s'" % lieu if lieu else '')); self.pg.wait_for_timeout(600); return r

    def libre(self):
        return self.attends("!DJ.Explo.etat().occupe")

    def clic(self, sel):
        self.pg.eval_on_selector(sel, 'e => e.click()'); self.pg.wait_for_timeout(300)

    def va(self, lieu):
        i = self.pg.evaluate("(v) => DJ.Explo.etat().sorties.indexOf(v)", lieu)
        if i < 0:
            verifie(False, f'pas de sortie vers {lieu} depuis {self.etat()["ici"]} (sorties : {self.etat()["sorties"]})'); return False
        self.clic('.cd-sortie[data-i="%d"]' % i); self.pg.wait_for_timeout(500); return True

    def repartir(self):
        self.libre(); self.clic('#b-repartir'); return self.carte()

    def depart(self):
        """l'écran du sac, puis le fond du puits, puis la carte"""
        self.pg.wait_for_selector('#sac [data-act=sac-pret]', timeout=20000)

    def cap(self, nom):
        self.n += 1; self.pg.screenshot(path=os.path.join(CAP, 'enquete-%s-%02d-%s.png' % (self.nom, self.n, nom)))

    def conteur(self):
        return self.js("(document.querySelector('#conteur') || {textContent:''}).textContent.replace(/🔊/g, '').trim()")

    def fenetre(self):
        return self.js("(document.querySelector('#fenetre') || {textContent:''}).textContent.replace(/🔊/g, '').replace(/\\s+/g, ' ').trim()")

    def sans_lire(self):
        return self.js("""(function(){ var pb = []; document.querySelectorAll('#conteur, #fenetre .ligne:not(.vide):not(.petit), #fin-donjon .bulle').forEach(function(e){
          var t = e.textContent.replace(/🔊/g, '').trim(); if(t.split(/\\s+/).length > 3 && !e.querySelector('.lire')) pb.push(t.slice(0, 40)); }); return pb; })()""")

    def code_montre(self):
        return self.js("[].map.call(document.querySelectorAll('#fenetre .code-gros small'), function(s){ return s.textContent; }).join('-')")

    def pave(self, id):
        """taper un code sur le pavé (« 📜 Un code »), symbole après symbole"""
        self.clic('[data-act=pave]'); self.pg.wait_for_selector('#fenetre .pave-cases', timeout=8000)
        for s in self.pg.evaluate("(id) => DONJON_CODES.code(id)", id):
            self.clic('#fenetre [data-act=symbole][data-id="%s"]' % s)
        self.pg.wait_for_timeout(1100)
        return self.fenetre()

    def au_bassin(self):
        """un raccourci pour ce test : toute l'équipe est déjà au grand bassin, Bourbe est battue (le chemin a ses propres tests)"""
        self.js("""(function(){ var p = DJ.Explo._X().partie, D = Regles.D;
          Object.keys(D.COMBATS).forEach(function(s){ p.faits['combat:' + s] = 1; });
          Object.keys(D.LIEUX).forEach(function(l){ if(l !== 'porte4' && l !== 'leo') p.vus[l] = 1; });
          p.lieu = 'bassin'; p.vus['@de'] = null; Regles.sauvegarder(p); DJ.garder(p); })()""")
        self.pg.reload(); self.pg.wait_for_timeout(900)
        return self.carte()

    def fin(self):
        errs = [x for x in self.errs if 'fonts.g' not in x and 'ERR_' not in x]
        verifie(not errs, f'{self.nom} : aucune erreur ni avertissement JavaScript' + (' — ' + ' | '.join(sorted(set(errs))[:4]) if errs else ''))
        verifie(self.js('window.__parle') == 0, f'{self.nom} : aucune lecture vocale toute seule')
        self.ctx.close()


def noms_code(pg, id):
    return pg.evaluate("(id) => DONJON_CODES.code(id).map(function(k){ return DONJON_CODES.SYM[k].n; }).join('-')", id)


def descente(nav):
    print('— 1. Une descente lancée par l\'enquête')
    Q = '?sanscombat=1&enquete=3&jeton=jeton-A&potions=feu,huile&entree=crypte'
    J = Jeu(nav, PAGE + Q, 'descente'); pg = J.pg
    J.depart()
    p = J.partie()
    verifie(p['enquete'] == 3 and p['jeton'] == 'jeton-A' and p['entree'] == 'crypte' and p['recettes'] == ['feu', 'huile'], f'une partie neuve : l\'enquête, le jeton, la crypte, deux potions ({p["recettes"]})')
    t = J.conteur()
    verifie('sac de l\'Alchimiste' in t and 'deux fioles' in t and 'Il en manque' in t and not J.sans_lire(), f'l\'écran du sac : « Dans le sac de l\'Alchimiste : deux fioles… » et son 🔊 ({t[:60]})')
    verifie(J.js("document.querySelectorAll('#sac .recette').length") == 2, 'deux potions à l\'écran')
    J.cap('sac'); J.clic('[data-act=sac-pret]'); J.scene('puits')
    t = J.conteur()
    verifie('escalier de la crypte' in t and not J.sans_lire(), f'le fond du puits, en venant de la crypte ({t[:50]})')
    J.repartir()
    verifie('Sous le clocher' in pg.inner_text('.titre-carte') and pg.locator('[data-act=enquete]').count() == 1, 'la carte : « Sous le clocher », et le bouton « 🏘️ L\'enquête »')
    J.cap('carte')
    # la page rechargée (la même adresse) : la même partie
    pg.reload(); pg.wait_for_timeout(900); J.carte()
    p = J.partie()
    verifie(p['jeton'] == 'jeton-A' and p['recettes'] == ['feu', 'huile'] and pg.locator('#sac').count() == 0, 'la page rechargée : la même partie, pas d\'écran du sac')
    # une potion de plus, le même jeton
    J.va_a(PAGE + '?sanscombat=1&enquete=3&jeton=jeton-A&potions=feu,huile,acide&entree=crypte'); J.carte()
    verifie(J.partie()['recettes'] == ['feu', 'huile', 'acide'], 'le même jeton, une potion de plus : elle rejoint le sac')
    # « ↺ Recommencer la descente » (dans 🎒 Objets) : la descente recommencée reste celle de l'enquête
    J.js("(function(){ var p = DJ.Explo._X().partie; p.recettes.push('givre'); p.or = 12; DJ.garder(p); })()")
    J.clic('[data-act=objets]'); J.clic('#fenetre [data-act=recommencer]'); J.clic('#fenetre [data-act=recommencer-oui]')
    pg.wait_for_timeout(1500); J.depart()
    p = J.partie()
    verifie(p['enquete'] == 3 and p['jeton'] == 'jeton-A' and p['entree'] == 'crypte' and p['recettes'] == ['feu', 'huile', 'acide'] and not p.get('or') and 'nouveau' not in pg.url and 'jeton=jeton-A' in pg.url,
            f'« Recommencer la descente » : une partie neuve, toujours celle de l\'enquête (son jeton, son entrée, les potions du sac, sans la recette apprise en route) ({p["recettes"]})')
    J.clic('[data-act=sac-pret]'); J.scene('puits'); J.repartir()
    # ---------- 2. les codes du Barde ----------
    print('— 2. Les codes du Barde, sur le pavé')
    J.js("(function(){ var p = DJ.Explo._X().partie; p.heros.sage.pv = 1; p.heros.alchimiste.pv = 2; })()")
    t = J.pave('grosse:marie')
    pv = J.js("['sage', 'alchimiste', 'pisteur'].every(function(h){ var H = DJ.Explo._X().partie.heros[h]; return H.pv === H.pvMax; })")
    verifie('Grosse Marie' in t and 'toute la vie' in t and pv and not J.sans_lire(), f'« La Grosse Marie » : toute la vie des trois héros revient ({t[:50]})')
    J.cap('marie'); J.clic('#fenetre [data-act=fermer]')
    J.js("(function(){ DJ.Explo._X().partie.heros.sage.pv = 1; })()")
    t = J.pave('grosse:marie')
    verifie(J.js("DJ.Explo._X().partie.heros.sage.pv") == 1, f'une seule fois : le code déjà servi ne rend plus rien ({t[:40]})')
    if pg.locator('#fenetre [data-act=fermer]').count(): J.clic('#fenetre [data-act=fermer]')
    J.js("DJ.fermer()")
    # ---------- 3. sans le code du maire ----------
    print('— 3. La dernière salle, sans le code du maire')
    J.au_bassin()
    J.va('porte4'); pg.wait_for_selector('#fenetre .code-gros', timeout=40000); pg.wait_for_timeout(300)
    verifie(J.code_montre() == noms_code(pg, 'porte:odette'), 'la porte aux quatre signes : le code pour le Sage')
    J.clic('#fenetre .aller'); J.repartir()
    J.va('leo'); pg.wait_for_timeout(700)
    t = J.fenetre()
    verifie('Avant d\'entrer' in t and 'retenu le maire' in t and J.etat()['ici'] == 'porte4', f'avant la dernière salle : « Le Barde a-t-il retenu le maire ? » ({t[:60]})')
    verifie(not J.sans_lire() and pg.locator('#fenetre [data-act=pave]').count() == 1 and pg.locator('#fenetre [data-act=maire-sans]').count() == 1, 'cette fenêtre a son 🔊 et ses deux boutons')
    J.cap('avant-entrer')
    J.clic('#fenetre [data-act=maire-sans]')
    pg.wait_for_selector('#fenetre .code-gros', timeout=40000); pg.wait_for_timeout(400)
    f = J.partie()['faits']
    verifie(f.get('code:leo:enfui') and not f.get('code:leo:attrape') and f.get('fin'), 'on y va quand même : Léo s\'enfuit')
    verifie(J.code_montre() == noms_code(pg, 'leo:enfui'), f'le code pour le Barde : « Léo s\'est enfui » ({J.code_montre()})')
    t = J.conteur()
    verifie('file dans le noir' in t, f'le conteur : « il file dans le noir » ({t[:50]})')
    J.cap('leo-enfui'); J.clic('#fenetre .aller'); pg.wait_for_selector('#fin-donjon', timeout=10000); pg.wait_for_timeout(500)
    t = pg.inner_text('#fin-donjon')
    verifie('Léo s\'est enfui' in t and 'remonter' in t and not J.sans_lire(), f'l\'écran de fin : « Léo s\'est enfui… » ({t[:50]})')
    verifie(pg.locator('#fin-donjon [data-act=enquete]').count() == 1 and pg.locator('#fin-donjon [data-act=recommencer-oui]').count() == 0, 'son bouton : « Remonter au village », pas « Recommencer »')
    J.cap('fin-enfui')
    J.fin()

    # ---------- 4. avec le code du maire ----------
    print('— 4. Un jeton nouveau, et le code du maire')
    J = Jeu(nav, PAGE + Q, 'maire'); pg = J.pg
    J.depart(); J.clic('[data-act=sac-pret]'); J.scene('puits'); J.repartir()
    J.va_a(PAGE + '?sanscombat=1&enquete=3&jeton=jeton-B&potions=feu,fumigene,huile,colle,acide,baume,coeur&entree=puits')
    J.depart()
    p = J.partie()
    verifie(p['jeton'] == 'jeton-B' and len(p['recettes']) == 7 and p['entree'] == 'puits' and not p['faits'].get('fin'), 'un jeton nouveau : une partie neuve (sept potions, par le puits)')
    verifie('Pas une ne manque' in J.conteur(), 'l\'écran du sac : sept fioles, « Pas une ne manque ! »')
    J.clic('[data-act=sac-pret]'); J.scene('puits')
    verifie('escalier de la crypte' not in J.conteur(), 'par le puits : le texte habituel du fond du puits')
    J.repartir()
    verifie('Sous le puits' in pg.inner_text('.titre-carte'), 'la carte : « Sous le puits »')
    t = J.pave('maire:retenu')
    verifie('Le maire est retenu' in t and not J.sans_lire() and J.partie()['codes'].get('maire:retenu'), f'« Le maire est retenu » : c\'est noté ({t[:50]})')
    J.cap('maire'); J.clic('#fenetre [data-act=fermer]')
    J.au_bassin()
    J.va('porte4'); pg.wait_for_selector('#fenetre .code-gros', timeout=40000); pg.wait_for_timeout(300); J.clic('#fenetre .aller'); J.repartir()
    J.va('leo')
    pg.wait_for_selector('#fenetre .code-gros', timeout=40000); pg.wait_for_timeout(400)
    f = J.partie()['faits']
    verifie(f.get('code:leo:attrape') and not f.get('code:leo:enfui') and J.code_montre() == noms_code(pg, 'leo:attrape'), 'le maire retenu : pas de fenêtre, Léo est attrapé, le code « Léo attrapé »')
    J.clic('#fenetre .aller'); pg.wait_for_selector('#fin-donjon', timeout=10000); pg.wait_for_timeout(500)
    t = pg.inner_text('#fin-donjon')
    verifie('Vous avez retrouvé Léo' in t and pg.locator('#fin-donjon [data-act=enquete]').count() == 1 and not J.sans_lire(), f'l\'écran de fin : « Vous avez retrouvé Léo ! » et « Remonter au village » ({t[:40]})')
    J.cap('fin-attrape')
    J.fin()


def tout_seul(nav):
    print('— 5. Le donjon tout seul : rien ne change')
    J = Jeu(nav, PAGE + '?sanscombat=1&nouveau=1', 'seul'); pg = J.pg
    J.depart()
    p = J.partie()
    verifie(not p.get('enquete') and len(p['recettes']) == 7, 'sans ?enquete : sept potions, pas d\'enquête')
    verifie('toutes ses potions' in J.conteur(), 'l\'écran du sac : le texte habituel')
    J.clic('[data-act=sac-pret]'); J.scene('puits'); J.repartir()
    verifie('Sous le puits' in pg.inner_text('.titre-carte') and pg.locator('[data-act=enquete]').count() == 0, 'la carte : « Sous le puits », pas de bouton « L\'enquête »')
    J.au_bassin()
    J.va('porte4'); pg.wait_for_selector('#fenetre .code-gros', timeout=40000); pg.wait_for_timeout(300); J.clic('#fenetre .aller'); J.repartir()
    J.va('leo')
    pg.wait_for_selector('#fenetre .code-gros', timeout=40000); pg.wait_for_timeout(400)
    f = J.partie()['faits']
    verifie(f.get('code:leo:attrape') and not f.get('code:leo:enfui'), 'pas de fenêtre du maire : Léo est attrapé, comme avant')
    J.clic('#fenetre .aller'); pg.wait_for_selector('#fin-donjon', timeout=10000); pg.wait_for_timeout(500)
    verifie(pg.locator('#fin-donjon [data-act=recommencer-oui]').count() == 1 and pg.locator('#fin-donjon [data-act=enquete]').count() == 0, 'l\'écran de fin : « Recommencer la descente »')
    J.fin()


with sync_playwright() as pw:
    nav = pw.chromium.launch()
    descente(nav)
    tout_seul(nav)
    nav.close()

print()
print('%d vérifications réussies, %d ratées' % (len(OK), len(ERREURS)))
for e in ERREURS: print('  ÉCHEC  ' + e)
print('TOUT EST VERT' if not ERREURS else 'À CORRIGER')
sys.exit(1 if ERREURS else 0)
