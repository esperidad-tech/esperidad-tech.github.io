"""La VRAIE descente, par l'écran : flock /tmp/brumeval-pw.lock python3 test-descente.py [--graine 7] [--vitesse 3]

Une équipe maligne joue tout le donjon sur l'écran du Pisteur, du sac de départ jusqu'à Léo, sans aucun raccourci :
  - chaque combat pour de vrai, geste après geste, par les boutons (qui joue, quel geste, quelle cible) ; ses choix sont
    ceux de la simulation (equilibre.js, l'équipe « maligne » : elle étudie, ouvre les points faibles dans l'ordre, soigne
    quand il faut), collés dans la page ;
  - chaque salle sans combat : la sacoche, les herbes, le coffre de la réserve, la fleur de givre, le tas d'os et le crâne
    secret, les dalles claires, la page déchirée et le lutrin, la porte de la gueule (la crypte, l'amulette), la porte de
    l'œil, le feu de camp (repos, recette du Givre, sac refait) ;
  - les codes de sauvegarde avant les grandes portes ; si elle tombe, elle repart de sa sauvegarde, comme une famille.
Après chaque geste : ce que montre l'écran (vies, bêtes en vie, points faibles) doit être ce que disent les règles.
À la fin : l'écran « Vous avez retrouvé Léo », aucune erreur JavaScript, aucune lecture vocale toute seule.
Le journal de la descente (salle, essais, tours, vies) s'affiche, et des captures vont dans captures/descente-*.png."""
import os, sys, json, time
from collections import deque
from playwright.sync_api import sync_playwright

ICI = os.path.dirname(os.path.abspath(__file__))
PAGE = 'file://' + os.path.join(ICI, 'sortie', 'index.html')
CAP = os.path.join(ICI, 'captures'); os.makedirs(CAP, exist_ok=True)
args = sys.argv[1:]
GRAINE = int(args[args.index('--graine') + 1]) if '--graine' in args else 7
VITESSE = int(args[args.index('--vitesse') + 1]) if '--vitesse' in args else 3
MAX_CHUTES = 8
ERREURS, OK = [], []


def verifie(cond, quoi):
    (OK if cond else ERREURS).append(quoi)
    print(('  ok  ' if cond else '  ÉCHEC  ') + quoi, flush=True)


# ---------- l'équipe maligne de la simulation, collée dans la page ----------
_eq = open(os.path.join(ICI, 'equilibre.js'), encoding='utf-8').read()
_a = _eq.index("/* ===================================================================== ce que les joueurs voient d'un combat */")
_b = _eq.index('var EQUIPES = {')
POLITIQUE = """window.__POL = (function(){ var R = window.Regles, D = R.D, C = D.CHIFFRES, MAX_TOURS = 40;
%s
return {maligne:reflechie({livre:true, etudie:true}), hasard:auHasard}; })();
window.__MEM = {vu:{}}; window.__RND = window.Regles.alea(%d); window.__REFUS = [];""" % (_eq[_a:_b], GRAINE * 104729 + 17)

CHOIX = """() => { var E = DJ.Combat._E(), c = E.c, p = DJ.Explo._X().partie;
  if(!c.aJouer().length) return null;
  function G(a){ return c.gestes(a.heros).filter(function(x){ return x.geste === a.geste; })[0]; }
  function mauvais(a, g){
    if(!g || !g.permis) return 'pas permis';
    if(g.vise === 'salle' || g.vise === 'equipe') return null;
    var l = Array.isArray(a.cible) ? a.cible : [a.cible], m = null;
    l.forEach(function(x){ if(g.cibles.indexOf(x) < 0) m = 'cible ' + x; });
    return m;
  }
  var act = __POL.maligne(c, p, __MEM, __RND), g = G(act), m = mauvais(act, g);
  if(m){ __REFUS.push(act.heros + ' ' + act.geste + ' ' + JSON.stringify(act.cible) + ' : ' + m); act = __POL.hasard(c, p, __MEM, __RND); g = G(act); }
  return {h:act.heros, g:act.geste, vise:g.vise, max:g.max || 1, cible:act.cible == null ? null : act.cible, cibles:g.cibles || [], tour:c.tour};
}"""

ACCORD = """() => { var E = DJ.Combat._E(), ph = E.c.etat(), pb = [];
  ['sage', 'alchimiste', 'pisteur'].forEach(function(h){ var b = document.querySelector('#pv-' + h + ' b'); if(!b || +b.textContent !== ph.heros[h].pv) pb.push(h + ' ' + (b && b.textContent) + '≠' + ph.heros[h].pv); });
  ph.betes.forEach(function(b){ var e = document.querySelector('#pv-' + b.id + ' b'), z = document.querySelector('#zone-' + b.id);
    if(b.mort){ if(z) pb.push(b.id + ' morte mais encore touchable'); return; }
    if(!e || +e.textContent !== b.pv) pb.push(b.id + ' ' + (e && e.textContent) + '≠' + b.pv);
    if(!z) pb.push(b.id + ' sans zone');
    var a = E.A.b[b.id]; if(a && !a.rat && a.acteur.etatCourant){ var cur = a.acteur.etatCourant();
      Object.keys(cur).forEach(function(n){ if(cur[n] && n !== 'cible' && n !== 'ouvert' && n !== 'avale' && !(n in b.etats)) pb.push(b.id + ' montre un état en trop : ' + n); });
      if(!!cur.ouvert !== !!b.ouvert) pb.push(b.id + ' point faible : écran ' + !!cur.ouvert + ', règles ' + !!b.ouvert); }
  });
  return pb; }"""

HEROS = ('sage', 'alchimiste', 'pisteur')
# la carte, telle que l'équipe la connaît avec le plan du Sage (les portes de la salle aux trois portes : œil et gueule)
GRAPHE = {
    'puits': ['rats', 'galerie', 'aeration'], 'galerie': ['puits'], 'aeration': ['puits'],
    'rats': ['puits', 'reserve', 'canaux'], 'reserve': ['rats'],
    'canaux': ['rats', 'givre', 'toiles'], 'givre': ['canaux'],
    'toiles': ['canaux', 'J'], 'J': ['toiles', 'eboulis', 'dalles'],
    'eboulis': ['J', 'camp'], 'dalles': ['J', 'atelier'],
    'atelier': ['dalles', 'bibliotheque', 'portes'], 'bibliotheque': ['atelier'],
    'portes': ['atelier', 'crypte', 'ossuaire'], 'crypte': ['portes'], 'ossuaire': ['portes', 'camp'],
    'camp': ['ossuaire', 'bassin', 'eboulis'], 'bassin': ['camp', 'porte4'], 'porte4': ['bassin', 'leo'], 'leo': ['porte4'],
}
COMBATS = ['rats', 'canaux', 'toiles', 'atelier', 'crypte', 'ossuaire', 'bassin']
PORTES = {'crypte': 'porte-gueule', 'ossuaire': 'porte-oeil'}
SAC3, SAC4, SAC_BOSS = ['fumigene', 'acide', 'baume'], ['fumigene', 'acide', 'baume', 'feu'], ['feu', 'fumigene', 'baume', 'coeur']


class Descente:
    def __init__(self, nav):
        self.ctx = nav.new_context(viewport={'width': 1024, 'height': 768}, device_scale_factor=1, has_touch=True, is_mobile=True)
        self.pg = self.ctx.new_page(); self.errs = []; self.n = 0
        self.pg.on('pageerror', lambda e: self.errs.append('pageerror: ' + str(e)))
        self.pg.on('console', lambda m: self.errs.append(m.type + ': ' + m.text[:160]) if m.type in ('error', 'warning') else None)
        self.pg.route('**/fonts.googleapis.com/**', lambda r: r.fulfill(status=200, content_type='text/css', body=''))
        self.pg.route('**/fonts.gstatic.com/**', lambda r: r.fulfill(status=404, body=''))
        self.pg.add_init_script("window.__parle = 0; try{ speechSynthesis.speak = function(u){ window.__parle++; }; }catch(e){}")
        self.pg.goto(PAGE + '?nouveau=1&graine=%d&vitesse=%d' % (GRAINE, VITESSE)); self.pg.wait_for_timeout(800)
        self.pg.evaluate(POLITIQUE)
        self.entrees = {}; self.journal = {}; self.chutes = 0; self.gestes = 0; self.ecarts = []; self.salle = None; self.vu_fin = False

    # ----- les petits outils -----
    def js(self, code):
        return self.pg.evaluate('() => ' + code)

    def partie(self):
        return self.js('DJ.Explo._X().partie')

    def etat(self):
        return self.js('DJ.Explo.etat()')

    def a(self, sel):
        return self.js("!!document.querySelector(%s)" % json.dumps(sel))

    def attends(self, code, ms=40000):
        t = 0
        while t < ms and not self.js(code):
            self.pg.wait_for_timeout(150); t += 150
        return self.js(code)

    def libre(self, ms=40000):
        return self.attends("!DJ.Explo.etat().occupe", ms)

    def tap(self, sel):
        self.pg.tap(sel, force=True); self.pg.wait_for_timeout(250)

    def clic(self, sel):
        self.pg.eval_on_selector(sel, 'e => e.click()'); self.pg.wait_for_timeout(250)

    def objet(self, id, option=None):
        self.pg.evaluate("([id, o]) => { var S = DJ.Explo._S(), e = S.o[id]; (o == null ? e : e.options[o]).zone.click(); }", [id, option]); self.pg.wait_for_timeout(400)

    def cap(self, nom):
        self.n += 1; self.pg.screenshot(path=os.path.join(CAP, 'descente-%02d-%s.png' % (self.n, nom)))

    def fenetre_code(self, ms=20000):
        """un objet à code : la fenêtre qui montre le code, puis son bouton jaune"""
        self.pg.wait_for_selector('#fenetre .code-gros', timeout=ms); self.pg.wait_for_timeout(250)
        self.clic('#fenetre .aller'); self.libre()

    def taper_code(self, id):
        syms = self.pg.evaluate("(id) => DONJON_CODES.code(id)", id)
        self.tap('[data-act="pave"]')
        for k in syms:
            self.clic('[data-act="symbole"][data-id="%s"]' % k)
        self.pg.wait_for_timeout(900)
        ok = self.pg.evaluate("(id) => !!DJ.Explo._X().partie.codes[id]", id)
        if self.a('#fenetre .aller'):
            self.clic('#fenetre .aller')
        elif self.a('#fenetre .fermer'):
            self.clic('#fenetre .fermer')
        return ok

    # ----- le sac -----
    def sac(self):
        p = self.partie(); places = self.js("document.querySelectorAll('#sac .sac-case').length")
        if places >= 4:
            veut = SAC_BOSS if p['faits'].get('combat:ossuaire') else SAC4
        else:
            veut = SAC3
        connues = self.js("[].map.call(document.querySelectorAll('#sac .recette'), function(r){ return r.getAttribute('data-id'); })")
        veut = [r for r in veut if r in connues][:places]
        for r in connues:                                   # compléter si une recette manque
            if len(veut) < places and r not in veut:
                veut.append(r)
        pris = self.js("[].map.call(document.querySelectorAll('#sac .recette.choisie'), function(r){ return r.getAttribute('data-id'); })")
        for r in pris:
            if r not in veut:
                self.tap('.recette[data-id="%s"]' % r)
        for r in veut:
            if r not in pris:
                self.tap('.recette[data-id="%s"]' % r)
        self.tap('[data-act="sac-pret"]'); self.pg.wait_for_timeout(500)

    # ----- un geste de combat -----
    def geste(self):
        c = self.pg.evaluate(CHOIX)
        if not c:
            self.pg.wait_for_timeout(300); return
        self.tap('.b-heros[data-id="%s"]' % c['h']); self.tap('.carte[data-id="%s"]' % c['g'])
        if c['vise'] in ('salle', 'equipe'):
            self.pg.eval_on_selector('.zone[data-type="bete"]' if c['vise'] == 'salle' else '.zone[data-type="heros"]', 'e => e.click()')
        else:
            cibles = c['cible'] if isinstance(c['cible'], list) else [c['cible']]
            n = min(c['max'], len(c['cibles'])) if all(x in HEROS for x in c['cibles']) else 1
            for x in c['cibles']:                           # le bâton de chêne protège deux amis : l'écran en demande deux
                if len(cibles) < n and x not in cibles:
                    cibles.append(x)
            for x in cibles[:max(1, n)]:
                if x in HEROS:
                    self.tap('.zone[data-type="heros"][data-id="%s"]' % x)
                else:
                    self.pg.eval_on_selector('#zone-' + x, 'e => e.click()')
                self.pg.wait_for_timeout(120)
        self.gestes += 1
        self.pg.wait_for_timeout(250)
        ok = self.attends("(function(){ var e = DJ.Combat.etat(); return !e || (e.mode === 'qui' && !e.occupe) || e.mode === 'fin' || !!document.querySelector('#fin [data-act=\"combat-fin\"]'); })()", 120000)
        if not ok:
            raise RuntimeError('le combat ne rend pas la main après %s %s (tour %s)' % (c['h'], c['g'], c['tour']))
        if self.js("!!DJ.Combat.etat() && DJ.Combat.etat().mode === 'qui'"):
            self.pg.wait_for_timeout(200)
            pb = self.pg.evaluate(ACCORD)
            if pb:
                self.ecarts.append('%s, tour %s, après %s %s : %s' % (self.salle, c['tour'], c['h'], c['g'], pb))

    def fin_combat(self):
        gagne = self.a('#fin .victoire'); p = self.partie()
        j = self.journal.setdefault(self.salle, {'essais': 0, 'gagne': False})
        j['essais'] += 1
        tour = self.js("DJ.Combat.etat() ? DJ.Combat.etat().tour : 0")
        if gagne:
            j['gagne'] = True; j['tours'] = tour; j['pv'] = [p['heros'][h]['pv'] for h in HEROS]
            print('   %-9s gagné en %d tours, vies %s' % (self.salle, tour, j['pv']), flush=True)
        else:
            self.chutes += 1
            print('   %-9s perdu au tour %d (chute n° %d)' % (self.salle, tour, self.chutes), flush=True)
        self.cap(self.salle + ('-victoire' if gagne else '-point'))
        self.tap('#fin [data-act="combat-fin"]'); self.pg.wait_for_timeout(600)

    # ----- où aller -----
    def but(self, p):
        f = p['faits']; H = p['heros']

        def fait(k):
            return bool(f.get(k))
        abime = any(H[h]['pv'] < 0.7 * H[h]['pvMax'] for h in HEROS)
        if not fait('objet:sacoche') or not fait('objet:herbes'): return 'aeration'
        if not fait('combat:rats'): return 'rats'
        if not fait('coffre:reserve'): return 'reserve'
        if not fait('combat:canaux'): return 'canaux'
        if not fait('objet:fleur-givre'): return 'givre'
        if not fait('combat:toiles'): return 'toiles'
        if not fait('secret'): return 'eboulis'
        if not fait('combat:ossuaire') and not p.get('repos') and abime and not fait('combat:atelier') and not fait('piege:dalles'): return 'camp'
        if not fait('piege:dalles'): return 'dalles'
        if not fait('combat:atelier'): return 'atelier'
        if not fait('objet:page-dechiree') or not fait('coffre:bibliotheque'): return 'bibliotheque'
        if not fait('combat:crypte') or not fait('objet:amulette'): return 'crypte'
        if not fait('combat:ossuaire'): return 'ossuaire'
        if not fait('combat:bassin'):
            if not p['codes'].get('sauve:3') or not p.get('repos') or not all(r in p['sac'] for r in SAC_BOSS if r in p['recettes']): return 'camp'
            return 'bassin'
        if not fait('code:porte:odette'): return 'porte4'
        return 'leo'

    def pas_vers(self, ici, but, p):
        """le premier pas du plus court chemin, sans traverser une salle où il reste des monstres (ni les dalles pas encore passées)"""
        f = p['faits']
        ferme = set(s for s in COMBATS if not f.get('combat:' + s))
        if not f.get('piege:dalles'): ferme.add('dalles')
        vus = {ici: None}; q = deque([ici])
        while q:
            x = q.popleft()
            if x == but: break
            if x != ici and x in ferme: continue
            for y in GRAPHE.get(x, []):
                if x == 'eboulis' and y == 'camp' and not f.get('secret'): continue
                if x == 'camp' and y == 'eboulis' and not f.get('secret'): continue
                if y not in vus:
                    vus[y] = x; q.append(y)
        if but not in vus: return None
        x = but
        while vus[x] != ici:
            x = vus[x]
        return x

    def sauver_ici(self, p, ici):
        """les pages de sauvegarde, avant les grandes portes"""
        f = p['faits']; c = p['codes']
        if ici == 'dalles' and f.get('piege:dalles') and not f.get('combat:atelier') and not c.get('sauve:1'): return 'sauve:1'
        if ici == 'portes' and f.get('combat:crypte') and f.get('objet:amulette') and not f.get('combat:ossuaire') and not c.get('sauve:2'): return 'sauve:2'
        return None

    # ----- ce qu'on fait dans une salle sans combat -----
    def salle_calme(self, lieu):
        pg = self.pg; self.libre(); p = self.partie(); f = p['faits']; but = self.but(p)
        if lieu == 'aeration':
            if not f.get('objet:sacoche'): self.objet('sacoche'); pg.wait_for_timeout(1500); self.libre()
            if not f.get('objet:herbes'): self.objet('herbes'); self.fenetre_code()
        elif lieu == 'reserve' and not f.get('coffre:reserve'):
            self.objet('coffre'); pg.wait_for_timeout(2400); self.libre()
            self.objet('coffre', 1); pg.wait_for_timeout(2600); self.libre()
        elif lieu == 'givre' and not f.get('objet:fleur-givre'):
            self.objet('fleur-givre'); self.fenetre_code()
        elif lieu == 'eboulis':
            if not f.get('os'): self.objet('tas-os'); pg.wait_for_timeout(3200); self.libre()
            if (self.partie()['faits'].get('os') or 0) < 2: self.objet('tas-os'); self.fenetre_code()
            if not f.get('secret'): self.objet('crane'); pg.wait_for_timeout(3400); self.libre()
        elif lieu == 'dalles' and not f.get('piege:dalles'):
            if self.a('#fenetre [data-act="dalles-go"]'): self.clic('[data-act="dalles-go"]')
            for k in range(self.partie()['faits'].get('dalles', 0) or 0, 6):
                self.objet('dalle-%d-%d' % (6 + k, k % 2)); pg.wait_for_timeout(1200); self.libre()
        elif lieu == 'bibliotheque':
            if not f.get('objet:page-dechiree'): self.objet('page-dechiree'); self.fenetre_code()
            if not f.get('coffre:bibliotheque'): self.objet('lutrin', 1); pg.wait_for_timeout(2800); self.libre()
        elif lieu == 'portes' and but in PORTES:
            sv = self.sauver_ici(p, 'portes')                  # la page de sauvegarde, avant de pousser la grande porte
            if sv:
                verifie(self.taper_code(sv) and self.partie()['sauvegarde'].get('lieu') == 'portes', 'la page de sauvegarde %s est écrite (portes)' % sv[-1])
            self.cap('portes'); self.objet(PORTES[but]); pg.wait_for_timeout(1500); return
        elif lieu == 'crypte' and f.get('combat:crypte') and not f.get('objet:amulette'):
            self.objet('sarcophage'); pg.wait_for_timeout(2800); self.libre()
            self.objet('amulette'); pg.wait_for_selector('#fenetre [data-act="qui-porte"]', timeout=15000)
            self.clic('[data-act="qui-porte"][data-id="pisteur"]'); pg.wait_for_timeout(2600); self.libre()
        elif lieu == 'camp':
            if not p.get('repos'): self.objet('feu'); pg.wait_for_timeout(2600); self.libre()
            p = self.partie(); f = p['faits']
            if f.get('objet:fleur-givre') and not p['codes'].get('recette:givre') and f.get('combat:ossuaire'):
                verifie(self.taper_code('recette:givre') and 'givre' in self.partie()['recettes'], 'au feu de camp : le code de l\'Alchimiste apprend le Givre')
            if f.get('combat:ossuaire') and not p['codes'].get('sauve:3'):
                verifie(self.taper_code('sauve:3'), 'au feu de camp : la page de sauvegarde n° 3, avant le grand bassin')
            p = self.partie()
            veut = [r for r in (SAC_BOSS if p['faits'].get('combat:ossuaire') else SAC4) if r in p['recettes']]
            if not all(r in p['sac'] for r in veut) and self.a('[data-act="refaire-sac"]'):
                self.tap('[data-act="refaire-sac"]'); pg.wait_for_selector('#sac', timeout=10000); pg.wait_for_timeout(400)
                self.cap('sac-camp'); self.sac(); self.attends("DJ.Explo.etat().ecran === 'scene' && !DJ.Explo.etat().occupe"); return
        elif lieu in ('porte4', 'leo'):
            try:
                pg.wait_for_selector('#fenetre .code-gros', timeout=30000); pg.wait_for_timeout(300)
                self.cap(lieu); self.clic('#fenetre .aller'); pg.wait_for_timeout(600)
            except Exception:
                pass
            if lieu == 'leo': return
        # (une fenêtre restée ouverte : on la ferme)
        if self.a('#fenetre .aller'): self.clic('#fenetre .aller')
        self.libre()
        if self.js("DJ.Explo.etat().ecran") == 'scene':
            self.tap('#b-repartir'); self.attends("DJ.Explo.etat().ecran === 'carte' && !DJ.Explo.etat().occupe"); pg.wait_for_timeout(400)

    # ----- la boucle -----
    def jouer(self, max_s=3000):
        pg = self.pg; t0 = time.time(); meme = None; depuis = time.time()
        while time.time() - t0 < max_s:
            if self.a('#fin-donjon'):
                self.vu_fin = True; self.cap('fin'); return True
            if self.chutes > MAX_CHUTES:
                return False
            if self.a('#sac'):
                self.sac(); continue
            e = self.etat(); ce = self.js('DJ.Combat.etat()')
            cle = json.dumps([e['ecran'], e['ici'], e['scene'], ce and ce['tour'], ce and ce['mode'], self.gestes, self.a('#fenetre')])
            if cle != meme: meme = cle; depuis = time.time()
            elif time.time() - depuis > 150:
                self.cap('bloque'); raise RuntimeError('plus rien ne bouge depuis 150 s : ' + cle)
            if e['ecran'] == 'combat':
                self.salle = self.partie()['lieu']
                if self.a('#fin [data-act="combat-fin"]'): self.fin_combat()
                elif ce and ce['mode'] == 'qui' and not ce['occupe']:
                    if ce['tour'] == 1 and not self.journal.get(self.salle, {}).get('vu'):
                        self.journal.setdefault(self.salle, {'essais': 0, 'gagne': False})['vu'] = True; self.cap(self.salle)
                    self.geste()
                else: pg.wait_for_timeout(300)
                continue
            if e['occupe']:
                pg.wait_for_timeout(250); continue
            if e['ecran'] == 'scene':
                self.salle_calme(e['scene']); continue
            if e['ecran'] == 'carte':
                p = self.partie(); ici = e['ici']
                s = self.sauver_ici(p, ici)
                if s:
                    verifie(self.taper_code(s) and self.partie()['sauvegarde'].get('lieu') == ici, 'la page de sauvegarde %s est écrite (%s)' % (s[-1], ici)); continue
                but = self.but(p)
                if but == ici:                                   # on y est : on entre dans la salle
                    self.entrees[ici] = self.entrees.get(ici, 0) + 1
                    if self.entrees[ici] > 12: raise RuntimeError('on tourne en rond à %s (plus rien à y faire, et pourtant le but reste là)' % ici)
                    if self.a('[data-act="entrer"]'): self.tap('[data-act="entrer"]'); pg.wait_for_timeout(700); continue
                    raise RuntimeError('arrivé à %s, mais rien à y faire' % ici)
                pas = self.pas_vers(ici, but, p)
                if pas is None: raise RuntimeError('aucun chemin de %s à %s' % (ici, but))
                if pas in e['sorties']:
                    i = e['sorties'].index(pas); self.clic('.cd-sortie[data-i="%d"]' % i); pg.wait_for_timeout(700); continue
                if ici == 'portes' and pas in PORTES and self.a('[data-act="entrer"]'):
                    self.tap('[data-act="entrer"]'); pg.wait_for_timeout(700); continue
                raise RuntimeError('à %s, pas de sortie vers %s (sorties : %s)' % (ici, pas, e['sorties']))
            pg.wait_for_timeout(300)
        return False


with sync_playwright() as pw:
    nav = pw.chromium.launch()
    print('— La vraie descente (graine %d, vitesse ×%d)' % (GRAINE, VITESSE), flush=True)
    D = Descente(nav); fini = False
    try:
        fini = D.jouer()
    except Exception as ex:
        verifie(False, 'la descente s\'arrête : ' + str(ex)[:300])
        try: D.cap('arret')
        except Exception: pass
    p = D.partie() if not D.vu_fin else None
    verifie(fini, 'l\'équipe maligne va jusqu\'à Léo par l\'écran (%d gestes de combat, %d chute(s))' % (D.gestes, D.chutes))
    for s in COMBATS:
        j = D.journal.get(s, {})
        verifie(bool(j.get('gagne')), '%s : gagné%s' % (s, ' en %d tours au %de essai, vies %s' % (j.get('tours', 0), j.get('essais', 0), j.get('pv')) if j.get('gagne') else ' ? non (%d essai(s))' % j.get('essais', 0)))
    verifie(not D.ecarts, 'après chaque geste, l\'écran dit ce que disent les règles' + (' — %d écart(s) : %s' % (len(D.ecarts), ' || '.join(D.ecarts[:4])) if D.ecarts else ''))
    refus = D.pg.evaluate('() => window.__REFUS || []')
    print('   gestes de la politique refusés par les règles (remplacés par un geste permis) : %d %s' % (len(refus), refus[:5]))
    errs = [x for x in D.errs if 'fonts.g' not in x and 'ERR_' not in x]
    verifie(not errs, 'aucune erreur ni avertissement JavaScript' + (' — ' + ' | '.join(sorted(set(errs))[:5]) if errs else ''))
    verifie(D.pg.evaluate('() => window.__parle') == 0, 'aucune lecture vocale toute seule')
    D.ctx.close(); nav.close()
print(f'\n{len(OK)} vérifications réussies, {len(ERREURS)} échecs')
for x in ERREURS:
    print('  ✗', x)
sys.exit(1 if ERREURS else 0)
