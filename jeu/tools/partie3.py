"""Enquête 3, étape 8 (Bible § 13.14) : UNE PARTIE COMPLÈTE À QUATRE TABLETTES, du matin au cachot (Playwright).

Quatre tablettes dans le même navigateur (le Barde, le Pisteur, l'Alchimiste, le Sage), servies par un petit serveur avec le donjon
construit à côté (jeu/donjon/moteur/sortie → donjon/), comme en ligne. Le robot joue le chemin parfait et, surtout, il fait passer
CHAQUE CODE pour de vrai : il le lit sur la tablette de celui qui le donne, le tape sur celle de celui qui le reçoit (onglet Code),
et vérifie qu'il est reçu et qu'il ouvre bien la suite. Les mini-jeux se lancent pour de vrai, puis le robot les termine
(les mini-jeux, le labo, l'établi et le donjon ont chacun leur propre robot).

  Le matin : le Barde (Victor, Tim démasqué) → le Sage ; le Sage (le tableau, le Livre d'or, l'herbier) → l'Alchimiste ; l'Alchimiste
    (le gâteau ; l'oseille et la mélisse ; Bertille, puis le pied-de-loup, la vesse-de-loup, le gui : Bible §13.26) ;
    le Pisteur (les banderoles, l'oie) ; l'établi : les sept potions ; le Sage donne le code de l'après-midi.
  L'après-midi : le Barde (la lettre du maire, le carnet et les traces chez Odette) → le Sage, l'Alchimiste, le Pisteur ; le Sage
    (la lettre est fausse, les sept chats → le Pisteur, le plan des Fondateurs) ; le Pisteur (les traces → le Barde) ; l'Alchimiste
    (la lettre au labo → le Barde et le Sage) ; le Barde (l'aveu de Mélusine → le Sage) ; le Sage (qui a écrit la lettre ?) ;
    chacun rend sa mission au maire ; le Sage donne le code de la nuit.
  La nuit : le Barde (la clé d'Anselme → le Pisteur) ; l'Alchimiste (ses sept potions, son code → le Pisteur) ; le Pisteur (la clé,
    la crypte, la descente : le VRAI donjon s'ouvre, avec les sept potions) ; le Sage (le plan des souterrains) ; le Barde (la Grosse
    Marie, le maire retenu → tapés DANS le donjon) ; la fin du donjon (le chemin est sauté : il a ses robots) ; le Pisteur remonte :
    « Odette est derrière la porte » → le Sage, « Léo attrapé » → le Barde ; le Barde (Léo, les trois étapes → « Léo a tout dit » → le Sage) ;
    le Sage (la porte des Fondateurs, l'accusation, le Corbeau) → le code de fin → tous : la même scène finale, le cachot.
  À la fin : toutes les missions de chacun sont cochées, aucun code n'est resté sans être donné, aucune erreur de page.
   BRUMEVAL_DIST=<dossier construit> [BRUMEVAL_DONJON=<donjon construit>] python3 tools/partie3.py"""
import sys, os, json, threading, tempfile, shutil, functools
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from playwright.sync_api import sync_playwright
ICI = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, ICI)
import etabli_outils as ET
import cueillette_outils as CU
DIST = os.path.abspath(os.environ.get('BRUMEVAL_DIST') or os.path.join(ICI, '..', 'dist'))
DONJON = os.path.abspath(os.environ.get('BRUMEVAL_DONJON') or os.path.join(ICI, '..', 'donjon', 'moteur', 'sortie'))
OUT = os.path.join(ICI, '..', 'test', 'partie3'); os.makedirs(OUT, exist_ok=True)
erreurs, echecs = [], []
passes = []          # les codes passés : (de, id, pour)
NOMS = {'barde': 'Barde', 'pisteur': 'Pisteur', 'alchimiste': 'Alchi', 'sage': 'Sage'}
n = [0]

def verifier(cond, quoi):
    print('  ✓' if cond else '  ✗', quoi, flush=True)
    if not cond: echecs.append(quoi)

class Muet(SimpleHTTPRequestHandler):
    def log_message(self, *a): pass


class Tablette:
    def __init__(self, nav, role, base):
        self.role = role; self.nom = NOMS[role]; self.donnes = set()
        self.pg = pg = nav.new_context(viewport={'width': 1180, 'height': 820}, has_touch=True).new_page()
        pg.set_default_timeout(9000)
        pg.on('console', lambda m: erreurs.append(f'[{self.nom}] {m.text[:200]}') if m.type == 'error' and not any(x in m.text for x in ('net::', 'fonts', 'ERR_', 'Failed to load', 'sw.js', 'fetching the script')) else None)
        pg.on('pageerror', lambda e: erreurs.append(f'[{self.nom}] PAGEERROR {e}'))
        pg.route('**/fonts.googleapis.com/**', lambda r: r.fulfill(status=200, content_type='text/css', body=''))
        pg.route('**/fonts.gstatic.com/**', lambda r: r.fulfill(status=404, body=''))
        pg.add_init_script("window.BRUMEVAL_SANS_TUTO = true;")
        pg.goto(base + 'index.html#test')
        pg.click('[data-act=creer]'); pg.click(f'[data-act=crea-role][data-r={role}]'); pg.click('[data-act=crea-suite]'); pg.fill('#nom', self.nom); pg.click('[data-act=crea-fin]')
        pg.evaluate("() => { M.S.heros.joueur = 'adulte'; M.sauver(); M.UI.ecran = 'reglages'; M.render(); }")
        pg.click('[data-act=mode-test][data-i="3"]'); pg.click('#voile [data-act=confirmer-oui]')
        pg.click('[data-act=nouvelle-enquete]'); pg.click('[data-act=lettre-suite]'); pg.click('[data-act=commencer]'); pg.wait_for_timeout(500)
        self.preparer()

    def preparer(self):
        """(à refaire après chaque retour du donjon : la page est rechargée)"""
        self.pg.evaluate("""() => { window.__lus = []; M.lire = function(t){ window.__lus.push(String(t)); }; M.lireAuto = function(){};
          var vrai = MJ.lancer;
          MJ.lancer = function(el, type, params, fin, opt){
            var c = {type:type, params:params, fin:fin, fini:false};
            c.h = vrai.call(MJ, el, type, params, function(r){ if(!c.fini){ c.fini = true; fin(r); } }, opt);
            window.__mjCourant = c; return c.h;
          };
          window.__finir = function(ok, plus){ var c = window.__mjCourant; if(!c || c.fini) return; c.fini = true; window.__mjCourant = null;
            try{ c.h && c.h.arreter && c.h.arreter(); }catch(e){}
            c.fin(Object.assign({reussi:!!ok, score:ok ? 100 : 0, essais:1, erreurs:0, detail:''}, plus || {})); };
        }""")

    # ---------- les gestes de base ----------
    def js(self, code, arg=None):
        return self.pg.evaluate(code, arg) if arg is not None else self.pg.evaluate(code)

    def ev(self, act, data=None):
        self.pg.evaluate(f"() => {{ M.A['{act}']({{dataset:{json.dumps(data or {})}, closest:function(){{ return null; }}}}); }}"); self.pg.wait_for_timeout(150)

    def texte(self, sel='#voile'):
        return self.pg.evaluate(f"() => {{ var e = document.querySelector('{sel}'), g = document.querySelector('#gd-texte'); return e && !e.hidden ? (e.innerText + ' ' + (g ? g.getAttribute('data-t') : '')).replace(/\\s+/g, ' ') : ''; }}")

    def fermer(self):
        self.pg.evaluate("() => { if(M.etabliOuvert && M.etabliOuvert()) M.fermerEtabli(); M.UI.modal = null; M.render(); }"); self.pg.wait_for_timeout(120)

    def carte(self):
        self.pg.evaluate("() => { M.UI.modal = null; M.P().onglet = 'carte'; M.render(); }")

    def taper(self, seq, garder=False):
        """taper trois symboles dans l'onglet Code (comme un joueur) ; rend le texte de la fenêtre qui s'ouvre"""
        self.fermer()
        self.pg.evaluate("() => { M.UI.ecran = 'enquete'; M.P().onglet = 'code'; M.render(); }"); self.pg.wait_for_timeout(150)
        for s in seq: self.ev('sym', {'s': s})
        self.pg.wait_for_timeout(450)
        t = self.texte()
        if not garder: self.fermer(); self.carte()
        return t

    def lieu(self, l):
        self.carte(); self.ev('lieu', {'id': l})
        b = self.pg.locator('#voile [data-act=explorer]')
        if b.count(): b.first.click(); self.pg.wait_for_timeout(200)
        return self.pg.evaluate("() => [].map.call(document.querySelectorAll('#voile .b-point[data-act=point]'), function(b){ return b.dataset.id; })")

    def point(self, l, pid):
        pts = self.lieu(l)
        if pid not in pts:
            verifier(False, f'{self.nom} : le point « {pid} » n\'est pas à {l} ({pts})'); return False
        self.pg.locator(f'#voile .b-point[data-act=point][data-id={pid}]').first.click(); self.pg.wait_for_timeout(300)
        return True

    def jouer(self, l, pid, plus=None):
        """un point à mini-jeu : l'explication, le bouton jaune, les règles, puis le robot le termine (réussi)"""
        if not self.point(l, pid): return None
        pg = self.pg
        ok = pg.locator('#voile [data-act=mj-go]').count() == 1
        if not ok: verifier(False, f'{self.nom} : {pid}, pas d\'explication avant le mini-jeu'); return None
        pg.locator('#voile [data-act=mj-go]').click(); pg.wait_for_timeout(900)
        if pg.locator('#mj-plein .mj-go').count(): pg.locator('#mj-plein .mj-go').click(); pg.wait_for_timeout(1300)
        info = pg.evaluate("() => window.__mjCourant ? window.__mjCourant.type : null")
        pg.evaluate("(plus) => window.__finir(true, plus)", plus); pg.wait_for_timeout(600)
        return info

    def page(self, pid):
        self.pg.evaluate(f"() => {{ M.UI.ecran = 'enquete'; M.P().onglet = 'role'; M.UI.modal = null; M.render(); M.livreAller('{pid}', true); }}"); self.pg.wait_for_timeout(300)
        return self.texte('#livre-ici .lv-page.on')

    def ouvrir_page(self, pid):
        self.page(pid)
        b = self.pg.locator(f'#livre-ici .lv-page.on [data-act=ouvrir-page][data-id={pid}]')
        if not b.count(): verifier(False, f'le Sage : la page « {pid} » ne peut pas s\'ouvrir ({self.texte("#livre-ici .lv-page.on")[:80]})'); return ''
        b.click(); self.pg.wait_for_timeout(350)
        return self.texte()

    def a_donner(self):
        """les codes que cette tablette a à donner (comme la liste « 🔢 Les codes donnés » de son Carnet)"""
        # (le code d'une analyse n'est pas dans le Carnet : il est écrit sur l'ardoise du labo — on le prend dans les analyses faites)
        return self.pg.evaluate("() => { var P = M.P(), E = M.E(); var l = Object.keys(P.objets || {}).filter(function(k){ return P.objets[k]; }).map(function(k){ return k.charAt(0) === '_' ? k.slice(1) : 'obj:' + k; }); Object.keys(P.analyses || {}).forEach(function(id){ var A = (E.analyses || {})[id]; if(P.analyses[id] && A && A.donne) l.push(A.donne); }); return l.filter(function(id, i){ return l.indexOf(id) === i && /^(obj|info):/.test(id) && !!M.code(id); }); }")

    def missions(self):
        return self.pg.evaluate("() => { M.majMission && M.majMission(); return (M.etapesMission() || []).filter(function(x){ return !x.libre && !x.piste; }).map(function(x){ return [x.t, !!(x.fait && x.fait.some(M.condMission))]; }); }")

    def shot(self, nom):
        n[0] += 1; self.pg.wait_for_timeout(350); self.pg.screenshot(path=f'{OUT}/{n[0]:02d}-{self.role}-{nom}.png')


# ---------- faire passer les codes ----------
PLUS_TARD = {'info:grosse_marie'}     # (ceux-là se tapent DANS le donjon)

def livrer(T, de, seulement=None):
    """Chaque code neuf de la tablette `de` est tapé sur la tablette de ceux à qui il est destiné. Rend la liste des codes passés."""
    faits = []
    for cid in de.a_donner():
        if cid in de.donnes or cid in PLUS_TARD or (seulement and cid not in seulement): continue
        dest = de.js("(id) => M.destinataire(id)", cid)
        roles = [r for r in T if r != de.role] if dest == 'tous' else [r for r in T if r not in (de.role, 'sage')] if dest == 'tous-sauf-sage' else dest if isinstance(dest, list) else [dest]
        seq = de.js("(id) => M.code(id)", cid)
        nom = de.js("(id) => M.nomCode(id).nom", cid)
        for r in roles:
            if r == de.role or r not in T: continue
            t = T[r].taper(seq, garder=True)
            recu = T[r].js("(id) => !!M.P().recus[id]", cid)
            verifier(recu, f'{de.nom} → {T[r].nom} : « {nom} »' + ('' if recu else f' — PAS REÇU ({t[:70]})'))
            passes.append((de.role, cid, r)); T[r].fermer(); T[r].carte()
        de.donnes.add(cid); faits.append(cid)
    return faits

def tout_demander(B, ids):
    """(12 novembre au soir) le Barde pose à ces villageois toutes les questions qu'il voit (pas les grands dialogues) : un grand dialogue
    ne s'ouvre qu'une fois tout demandé ({toutDit}, barde.js)"""
    B.js("""(ids) => { ids.forEach(function(id){ (M.E().pnj[id].questions || []).forEach(function(q, i){
        if(q.grand || M.barde.cachee(id, q)) return;
        M.A.question({dataset:{p:id, i:String(i)}, closest:function(){ return null; }}); M.UI.modal = null; }); }); M.sauver(); M.render(); }""", ids)
    B.pg.wait_for_timeout(200)

def moment(T, i, nom):
    """le Sage passe au moment suivant et donne son code aux trois autres"""
    S = T['sage']
    S.js("() => { M.UI.modal = null; M.A['passer-moment'](); }"); S.pg.wait_for_timeout(400); S.fermer()
    seq = S.js("(i) => M.code('moment:' + i)", i)
    for r in ('barde', 'pisteur', 'alchimiste'): T[r].taper(seq)
    verifier(all(T[r].js("() => M.momentId()") == nom for r in T), f'le Sage donne le code du moment : tout le monde est « {nom} »')


def partie(nav, base):
    T = {r: Tablette(nav, r, base) for r in ('barde', 'pisteur', 'alchimiste', 'sage')}
    B, P, A, S = T['barde'], T['pisteur'], T['alchimiste'], T['sage']
    verifier(all(t.js("() => M.E().id === 3 && M.momentId() === 'matin'") for t in T.values()), 'quatre tablettes dans l\'enquête 3, le matin')

    # ======================================================================== LE MATIN
    print('— LE MATIN')
    # le Barde : le marché aux fleurs (rendu : dix bouquets ; il a son propre robot), puis Victor et Tim
    B.js("() => { M.A['ma-debut'](); var s = M.P().marche; s.f.fini = true; s.f.ouvert = true; s.b = 10; s.or = 0; M.UI.modal = null; M.sauver(); M.render(); }")
    B.ev('lieu', {'id': 'poste'}); B.ev('parler', {'id': 'victor'}); B.ev('question', {'p': 'victor', 'i': '0'}); B.fermer()
    B.ev('lieu', {'id': 'clocher'}); B.ev('parler', {'id': 'tim'}); B.ev('question', {'p': 'tim', 'i': '2'}); B.ev('bd-ment', {'p': 'tim', 'i': '2'}); B.fermer()
    # (12 novembre au soir) il pose toutes ses questions aux sept villageois du matin : sa mission, et ce qui ouvrira le maire
    tout_demander(B, ['levoisin', 'gaspard', 'victor', 'iris', 'margot', 'tim', 'fortune']); B.fermer()
    verifier(B.js("() => { M.render(); return !!M.P().mission.faits[1]; }"), 'le Barde a tout demandé aux sept villageois du matin : sa mission se coche')
    verifier(set(livrer(T, B)) == {'info:poste', 'info:chale'}, 'le Barde a donné au Sage : la poste, « Odette… sans sa canne »')
    # le Sage : le tableau, le Livre d'or, l'herbier, les premiers doutes
    verifier(S.jouer('mairie', 'tableau') == 'runes', 'le Sage peint le tableau d\'Odette (Assembler les runes)'); S.fermer()
    S.page('habitants')
    th = S.page('herbier'); S.pg.locator('#livre-ici .lv-page.on .b-lire').first.click(); S.pg.wait_for_timeout(200)
    verifier(S.pg.locator('#livre-ici .lv-page.on .lv-herbier > li').count() == 7 and 'bruyère' in th and 'Rond des Sorcières' not in th, 'le Sage lit l\'herbier à voix haute : sept plantes, un indice et un moment pour chacune (plus de code, plus de nom de lieu : Bible §13.28)')
    # (13 novembre) plus de page « Une drôle de lettre » : les codes du Barde sont des informations, le Sage conclut tout seul
    verifier(S.js("() => !!M.P().recus['info:poste'] && !!M.P().recus['info:chale']"), 'le Sage a reçu les deux premiers doutes du Barde (la poste, « Odette… sans sa canne »)')
    tl = S.page('livredor')
    verifier('pas encore signé' in tl and S.pg.locator('#livre-ici .lv-page.on [data-act=ouvrir-page]').count() == 0 and not list(livrer(T, S)), 'le Livre d\'or, le matin : tout le monde n\'a pas encore signé — le Sage n\'a rien à donner')
    # le Pisteur : les banderoles et l'oie
    verifier(P.jouer('place', 'banderoles') == 'visee', 'le Pisteur accroche les banderoles (le nouveau tir à l\'arc)'); P.fermer()
    verifier(P.jouer('boulangerie', 'oie') == 'poursuite', 'le Pisteur rattrape l\'oie (course-poursuite)'); P.fermer()
    # l'Alchimiste : le gâteau, les sept plantes
    verifier(A.jouer('boulangerie', 'gateau', {'gateau': {'etages': 3}}) == 'gateau', 'l\'Alchimiste fait le gâteau de la fête'); A.fermer()
    # (12 novembre, Bible §13.26 et §13.28) les plantes : des endroits cachés de la carte ; l'herbier du Sage ne donne que des indices. Le matin, au
    # village : l'oseille. Anselme veut une tisane de mélisse et sonne Bertille, la brume recule : la mélisse, le pied-de-loup, la vesse-de-loup,
    # le gui ; on rapporte de la mélisse à Anselme. Le souci et le lin : pas avant l'après-midi.
    verifier(CU.cueillir(A.pg, 'oseille') is not None, 'l\'Alchimiste cueille l\'oseille, dans le village')
    verifier(CU.cueillir(A.pg, 'souci') is None and CU.cueillir(A.pg, 'lin') is None, 'le souci et le lin : pas avant l\'après-midi')
    verifier(CU.cueillir(A.pg, 'gui') is None and CU.cueillir(A.pg, 'melisse') is None, 'le gui et la mélisse : au-delà de la brume, hors d\'atteinte')
    verifier('Bertille' in (CU.bertille(A.pg) or ''), 'l\'Alchimiste monte voir Anselme : il veut une tisane de mélisse, il sonne Bertille, la brume recule au nord et à l\'ouest')
    verifier(all(CU.cueillir(A.pg, k) for k in CU.LOIN), 'l\'Alchimiste cueille la mélisse, le pied-de-loup, la vesse-de-loup et le gui')
    verifier('CITRON' in (CU.tisane(A.pg) or ''), 'l\'Alchimiste rapporte de la mélisse à Anselme, pour sa tisane')
    verifier(livrer(T, A) == [], 'aucun code à donner pour les plantes (plus de gui du pommier pour le Pisteur)')
    # l'établi : les cinq potions du matin, geste par geste
    A.js("() => { M.UI.modal = null; M.P().onglet = 'role'; M.render(); }"); A.pg.wait_for_timeout(800)
    ET.vite(A.pg); ET.ouvrir(A.pg); ET.fermer_intro(A.pg)
    R = ET.recettes(A.pg)
    for pid in ('feu', 'fumigene', 'colle', 'acide', 'coeur'):
        if not ET.faire(A.pg, pid, R): echecs.append('l\'établi : la potion ' + pid + ' n\'est pas faite'); print('  ✗ potion', pid, ET.etat(A.pg))
        ET.continuer(A.pg)
    fi = A.js("() => Object.keys(M.P().vus).filter(function(k){ return k.indexOf('fiole:') === 0; }).length")
    verifier(fi == 5, f'l\'Alchimiste a préparé cinq potions le matin ({fi})')
    ET.quitter(A.pg); A.fermer()
    moment(T, 1, 'apresmidi')

    # ======================================================================== L'APRÈS-MIDI
    print('— L\'APRÈS-MIDI')
    # l'Alchimiste : le souci et le lin (pas avant l'après-midi), puis l'huile et le baume : les sept potions
    verifier(all(CU.cueillir(A.pg, k) for k in ('souci', 'lin')), 'l\'Alchimiste cueille le souci et le lin, l\'après-midi')
    pl = A.js("() => Object.keys(M.P().vus).filter(function(k){ return k.indexOf('plante:') === 0; }).length")
    verifier(pl == 7, f'l\'Alchimiste a cueilli ses sept plantes ({pl})')
    A.js("() => { M.UI.modal = null; M.P().onglet = 'role'; M.render(); }"); A.pg.wait_for_timeout(800)
    ET.vite(A.pg); ET.ouvrir(A.pg)
    for pid in ('huile', 'baume'):
        if not ET.faire(A.pg, pid, R): echecs.append('l\'établi : la potion ' + pid + ' n\'est pas faite'); print('  ✗ potion', pid, ET.etat(A.pg))
        ET.continuer(A.pg)
    fi = A.js("() => Object.keys(M.P().vus).filter(function(k){ return k.indexOf('fiole:') === 0; }).length")
    verifier(fi == 7, f'l\'Alchimiste a préparé ses sept potions sur l\'établi ({fi})')
    A.shot('sept-potions'); ET.quitter(A.pg); A.fermer()
    # le Barde : le maire (les bouquets, la lettre), la maison d'Odette (le carnet, les traces)
    B.carte(); B.ev('parler', {'id': 'grosbec'}); B.ev('ma-rendu')
    i = B.js("() => M.E().pnj.grosbec.questions.map(function(q){ return q.grand || ''; }).indexOf('lettre')")
    verifier(B.pg.locator('#voile .gd-q').count() == 0, 'le Barde : le grand dialogue de la lettre ne se voit pas tant qu\'il reste une question pour le maire')
    tout_demander(B, ['grosbec']); B.ev('parler', {'id': 'grosbec'})
    verifier(B.pg.locator('#voile .gd-q.gd-neuve').count() == 1 and B.js("() => M.pnjBulleCarte('grosbec')") == '🎭', 'tout demandé : le grand dialogue arrive (« 🎭 » sur le maire)')
    B.ev('question', {'p': 'grosbec', 'i': str(i)}); B.pg.wait_for_timeout(500)
    for k in (1, 2, 3): B.pg.locator(f'#voile [data-act=gd-choix][data-k="{k}"]').click(); B.pg.wait_for_timeout(280)
    verifier(B.js("() => !!M.P().objets.lettre"), 'le Barde : le maire lui prête la lettre d\'Odette'); B.fermer()
    tout_demander(B, ['melusine', 'anselme', 'silas', 'basile', 'farinel']); B.fermer()
    verifier(B.js("() => { M.render(); return !!M.P().mission.faits[3]; }"), 'le Barde a tout demandé aux villageois de l\'après-midi : sa mission se coche')
    B.carte(); B.ev('frapper', {'id': 'L2'}); B.ev('question', {'p': 'voisin', 'i': '0'}); B.fermer()
    verifier(set(livrer(T, B)) == {'obj:lettre', 'obj:carnet', 'info:traces_moustache'}, 'le Barde a donné : la lettre (Sage, Alchimiste), le carnet (Sage), les traces de Moustache (Pisteur)')
    # le Sage (13 novembre) : le Livre d'or, quand tout le monde a signé → l'Alchimiste ; la lettre et le carnet d'Odette, deux nouvelles
    # pages (aucune ne conclut à sa place) ; le plan des Fondateurs
    S.ouvrir_page('livredor'); S.fermer()
    S.page('vraielettre'); nl = S.pg.locator('#livre-ici .lv-page.on .ec-lettre').count()
    S.page('carnet'); nc = S.pg.locator('#livre-ici .lv-page.on .ec-chat').count()
    verifier(nl == 1 and nc == 7, f'le Sage : deux nouvelles pages dans son Grand Livre, la lettre et le carnet d\'Odette avec ses sept chats ({nl}, {nc})')
    S.ouvrir_page('plan')
    if S.pg.locator('#voile [data-act=mj-go]').count(): S.pg.locator('#voile [data-act=mj-go]').click(); S.pg.wait_for_timeout(900)
    if S.pg.locator('#mj-plein .mj-go').count(): S.pg.locator('#mj-plein .mj-go').click(); S.pg.wait_for_timeout(1200)
    S.js("() => window.__finir(true)"); S.pg.wait_for_timeout(400); S.fermer()
    verifier(S.js("() => !!M.P().pages.plan"), 'le Sage déchiffre le plan des Fondateurs (l\'alphabet secret)')
    verifier(list(livrer(T, S)) == ['info:ecritures'], 'le Sage a donné à l\'Alchimiste : les écritures du village (et plus de code « six doigts » : il le dit à voix haute)')
    # le Pisteur : les traces de Moustache, depuis chez Odette, jusqu'à la crypte
    verifier(P.jouer('L2', 'traces') == 'pistage', 'le Pisteur suit les pattes de Moustache, depuis chez Odette (le nouveau mini-jeu)'); P.fermer()
    verifier(livrer(T, P) == ['info:crypte_fermee'], 'le Pisteur a donné au Barde : la crypte est fermée')
    # l'Alchimiste : la lettre au labo (avec le Livre d'or du Sage)
    A.js("() => { M.UI.modal = null; M.P().onglet = 'role'; M.render(); M.ouvrirLabo(); }"); A.pg.wait_for_timeout(1800)
    f = next((x for x in A.pg.frames if x.parent_frame is not None), None)
    f.wait_for_function('() => !!window.__labo', timeout=8000)
    verifier(f.evaluate("() => window.__labo.cuirs().indexOf('lettre') >= 0") and A.js("() => !!M.P().recus['info:ecritures']"), 'l\'Alchimiste : la lettre est sur sa paillasse, et il a le Livre d\'or')
    f.evaluate("() => { window.__labo.finir('lettre'); window.__labo.quitter(); }"); A.pg.wait_for_timeout(900); A.fermer()
    verifier(set(livrer(T, A)) == {'info:ecriture'}, 'l\'Alchimiste a donné au Barde et au Sage : « Deux écritures » (Mélusine ou Margot)')
    # (13 novembre) le Barde peut poser la même accusation à Margot : elle dit vrai
    B.carte(); B.ev('lieu', {'id': 'taverne'}); B.ev('parler', {'id': 'margot'}); B.pg.wait_for_timeout(500)
    im = B.js("() => { var q = M.E().pnj.margot.questions; for(var i = 0; i < q.length; i++) if(/écrit la lettre/.test(q[i].q)) return i; return -1; }")
    B.ev('question', {'p': 'margot', 'i': str(im)}); B.pg.wait_for_timeout(2800)
    verifier(im == 4 and 'ardoises' in B.texte() and B.js("() => !M.E().pnj.margot.questions[4].ment"), 'le Barde accuse Margot : « Je n\'écris que mes ardoises » (elle dit vrai)'); B.fermer()
    # le Barde : Mélusine, devant son écriture
    iq = B.js("() => { var q = M.E().pnj.melusine.questions; for(var i = 0; i < q.length; i++) if(q[i].donneVrai === 'info:aveu' || q[i].donne === 'info:aveu') return i; return 4; }")
    B.carte(); B.ev('lieu', {'id': 'atelier'}); B.ev('parler', {'id': 'melusine'}); B.pg.wait_for_timeout(600)
    B.ev('question', {'p': 'melusine', 'i': str(iq)}); B.ev('bd-ment', {'p': 'melusine', 'i': str(iq)}); B.fermer()
    verifier(livrer(T, B) == ['info:aveu'], 'le Barde a donné au Sage : l\'aveu de Mélusine')
    verifier(S.js("() => !!M.P().recus['info:aveu'] && !!M.P().recus['info:ecriture']"), 'le Sage a reçu « Deux écritures » et l\'aveu de Mélusine (plus de page « Qui a écrit la lettre ? »)')
    # chacun rend sa mission au maire
    S.point('mairie', 'rendu'); S.fermer()
    P.point('mairie', 'mission'); P.fermer()
    A.point('mairie', 'gateau'); A.fermer()
    moment(T, 2, 'nuit')

    # ======================================================================== LA NUIT
    print('— LA NUIT')
    # le Barde : la clé d'Anselme
    idx = B.js("() => M.E().pnj.anselme.questions.map(function(q){ return q.grand || ''; })")
    verifier('gm' not in idx, 'plus de grand dialogue de la Grosse Marie')
    B.carte(); B.ev('parler', {'id': 'anselme'})
    verifier(B.pg.locator('#voile .gd-q').count() == 0, 'le Barde, chez Anselme : il reste une question (« Qu\'y a-t-il sous le clocher ? »), son grand dialogue attend')
    tout_demander(B, ['anselme']); B.ev('parler', {'id': 'anselme'})
    verifier(B.pg.locator('#voile .gd-q.gd-neuve').count() == 1, 'l\'aveu de Mélusine, la crypte fermée, tout demandé : le grand dialogue d\'Anselme arrive')
    B.ev('question', {'p': 'anselme', 'i': str(idx.index('cle'))}); B.pg.wait_for_timeout(400)
    for k in (2, 0, 3): B.pg.locator(f'#voile [data-act=gd-choix][data-k="{k}"]').click(); B.pg.wait_for_timeout(280)
    B.fermer()
    verifier(livrer(T, B) == ['info:cle_clou'], 'le Barde a donné au Pisteur : « La Grosse Marie sonne » (la clé d\'Anselme pend à sa ceinture)')
    # l'Alchimiste : ses sept potions, son code (le code d'allure : 13 novembre, plus de code du sac)
    A.js("() => { M.UI.modal = null; M.P().onglet = 'role'; M.render(); }"); A.pg.wait_for_timeout(800)
    ET.vite(A.pg); fra = ET.ouvrir(A.pg); ET.sac(A.pg)
    seqA = A.js("() => M.code(M.allureCode())")
    verifier(A.js("() => M.sacBits()") == 127 and fra.locator('#sacCode').count() == 1 and fra.locator('.carte [data-donjon]').count() == 0, 'l\'Alchimiste : les sept potions sont prêtes, son code pour le Pisteur')
    A.shot('sac'); ET.quitter(A.pg)
    # le Pisteur : la clé d'Anselme, la grille de la crypte (il la soulève), le code du départ
    verifier(P.jouer('clocher', 'cle') == 'cachette', 'le Pisteur prend la clé d\'Anselme (se cacher dans le clocher)'); P.fermer()
    P.point('clocher', 'crypte'); P.pg.locator('#voile .b-choix-point [data-id=soulever]').click(); P.pg.wait_for_timeout(300)
    verifier('sans bruit' in P.texte() and 'info:on_descend' in P.a_donner(), 'le Pisteur soulève la grille : pas un bruit, et il a le code du départ')
    P.pg.locator('#voile .b-choix-point [data-id=descendre]').click(); P.pg.wait_for_timeout(300)
    verifier('tenue de combat' in P.texte() and 'On a besoin des sept potions pour descendre' in P.texte() and P.pg.locator('#voile [data-act=ds-aller]').count() == 0, 'le Pisteur, devant l\'escalier : la tenue de combat, et les deux codes qu\'il attend')
    P.fermer()
    # « On va dans la crypte » → le Sage et l'Alchimiste : leur tenue, leur code
    seq = P.js("() => M.code('info:on_descend')")
    t = S.taper(seq, garder=True); passes.append(('pisteur', 'info:on_descend', 'sage'))
    verifier('tenue de combat' in t and 'Montre ce code au Pisteur' in t, 'le Pisteur → le Sage : « On va dans la crypte » — sa tenue, son code')
    seqS = S.js("() => M.code(M.allureCode())"); S.shot('tenue'); S.fermer()
    t = A.taper(seq, garder=True); passes.append(('pisteur', 'info:on_descend', 'alchimiste'))
    verifier('sept potions à la ceinture' in t and 'Montre ce code au Pisteur' in t, 'le Pisteur → l\'Alchimiste : sa tenue, et son code (les sept potions sont prêtes)'); A.fermer()
    P.donnes |= {'info:on_descend'}
    t = P.taper(seqS, garder=True); passes.append(('sage', 'allure', 'pisteur'))
    verifier('Le Sage est prêt' in t, 'le Sage → le Pisteur : son code d\'allure'); P.fermer()
    t = P.taper(seqA, garder=True); passes.append(('alchimiste', 'allure', 'pisteur'))
    verifier('L\'Alchimiste est prêt' in t and P.js("() => (M.P().sac || []).length") == 7, 'l\'Alchimiste → le Pisteur : son code d\'allure, et ses sept potions'); P.fermer()
    # le Sage : ses pages du donjon sont dans son Grand Livre ; son plan s'ouvre DANS le jeu
    S.page('sauvegardes')
    verifier(S.pg.locator('#livre-ici .lv-page.on .ds-blanche').count() == 2, 'le Sage : deux pages de sauvegarde dans son Grand Livre')
    S.page('donjon'); S.pg.locator('#livre-ici .lv-page.on [data-act=ds-plan]').click(); S.pg.wait_for_timeout(2500)
    plan = S.pg.frame_locator('#donjon-plan-cadre')
    verifier(S.pg.locator('#donjon-plan-cadre').count() == 1 and plan.locator('#b-fermer').is_visible(), 'le Sage ouvre le plan des souterrains, dans le jeu')
    plan.locator('#b-fermer').click(); S.pg.wait_for_timeout(500)
    verifier(S.pg.locator('#donjon-plan-cadre').count() == 0 and S.js("() => M.UI.ecran") == 'enquete', 'il le referme : il est toujours dans l\'enquête')
    # le Pisteur descend : le vrai donjon
    P.point('clocher', 'descendre'); P.pg.locator('#voile [data-act=ds-aller]').click()
    P.pg.wait_for_url('**/donjon/index.html**'); P.pg.wait_for_timeout(1500)
    X = P.pg.evaluate("() => { var p = DJ.Explo._X().partie; return {enquete:p.enquete, entree:p.entree, recettes:p.recettes.length}; }")
    verifier(X == {'enquete': 3, 'entree': 'crypte', 'recettes': 7}, f'le Pisteur descend : le donjon s\'ouvre, par la crypte, avec les sept potions ({X})')
    P.pg.eval_on_selector('[data-act=sac-pret]', 'e => e.click()')
    P.pg.wait_for_function("() => DJ.Explo.etat().ecran === 'scene' && !DJ.Explo.etat().occupe", timeout=40000); P.pg.wait_for_timeout(500)
    P.pg.eval_on_selector('#b-repartir', 'e => e.click()')
    P.pg.wait_for_function("() => DJ.Explo.etat().ecran === 'carte' && !DJ.Explo.etat().occupe", timeout=40000); P.pg.wait_for_timeout(500)
    # (13 novembre, Bible §13.33) « Retenir le maire » est retiré. Le Sage ne peut pas encore accuser : il manque l'homme en cape.
    S.js("() => { M.UI.modal = null; M.A.accuser(); }"); S.pg.wait_for_timeout(250)
    verifier('Pas encore' in S.texte() and S.pg.locator('#voile [data-act=acc-choix]').count() == 0, 'le Sage veut accuser trop tôt : « Pas encore… » (il manque l\'homme en cape)'); S.fermer()
    verifier(B.pg.evaluate("() => !M.feteAide('farinel') && !M.feteAide('iris')"), 'à la fête, Farinel et Iris n\'ont encore rien de plus à dire')
    # le Pisteur arrive devant la dernière salle (le chemin est sauté : la porte aux quatre signes, puis Léo) : son code pour le Barde
    P.pg.evaluate("() => { var p = DJ.Explo._X().partie; Regles.entrer(p, 'porte4'); DJ.garder(p); DJ.Explo.arriver('leo'); }")
    P.pg.wait_for_selector('#fenetre .code-gros', timeout=15000); P.pg.wait_for_timeout(400)
    noms = P.pg.evaluate("() => DONJON_CODES.code('leo:salle').join('-')")
    seq = B.js("() => M.code('info:leo_la')")
    verifier('pour le Barde' in P.pg.inner_text('#fenetre') and noms == '-'.join(seq), f'devant la dernière salle : le donjon montre un code pour le Barde, le même que dans l\'enquête ({noms})')
    P.pg.screenshot(path=os.path.join(OUT, 'pisteur-code-leo.png'))
    B.taper(seq, garder=True)
    verifier('homme en cape' in B.texte() and B.js("() => !!M.P().recus['info:leo_la']"), 'le Pisteur → le Barde : « L\'homme en cape est là ! »'); passes.append(('pisteur', 'info:leo_la', 'barde')); P.donnes.add('info:leo_la'); B.fermer()
    # le Barde, à la fête : Farinel et Iris ont un « ❗ » et de nouvelles questions (il lit les réponses à voix haute)
    B.carte(); B.ev('lieu', {'id': 'place'})
    verifier(B.pg.locator('.gd-fete-tete.gd-appel').count() == 2 and B.pg.locator('.gd-fete-tete.gd-appel .gd-fete-appel').count() == 2, 'à la fête : deux « ❗ » (Farinel et Iris)')
    B.ev('gd-fete', {'id': 'farinel'})
    verifier(B.pg.locator('#voile [data-act=gd-aide]').count() == 4, 'Farinel : quatre questions sur ses outils')
    for k in range(4): B.pg.locator('#voile [data-act=gd-aide]').first.click(); B.pg.wait_for_timeout(200)
    t = B.texte()
    verifier('vois des étoiles' in t and 'saigne longtemps' in t and 'perce même le cuir' in t and 'flamme près de sa farine' in t and B.pg.locator('#voile .gd-aide-rep [data-act=lire], #voile .gd-aide-rep .b-lire, #voile .gd-aide-rep button').count() >= 4, 'ses quatre réponses restent à l\'écran, chacune avec son 🔊 (pour les relire à voix haute)')
    B.shot('fete-farinel'); B.fermer()
    B.ev('gd-fete', {'id': 'iris'})
    for k in range(2): B.pg.locator('#voile [data-act=gd-aide]').first.click(); B.pg.wait_for_timeout(200)
    verifier('potion de force' in B.texte() and 'saigne' in B.texte(), 'Iris : sa potion de force volée — « sauf s\'il saigne »'); B.fermer()
    verifier(B.js("() => !!M.P().vus['fete:aide:farinel'] && !!M.P().vus['fete:aide:iris']") and B.pg.evaluate("() => !!M.feteAide('farinel')"), 'les deux sont notés dans le Carnet ; on peut toujours retourner les voir')
    # le combat contre Léo (les trois phases, en trichant sur ses points de vie ; test-leo.js et jeu/donjon/moteur/test-leo.py vérifient le combat lui-même)
    P.pg.eval_on_selector('#fenetre [data-act=leo-combat]', 'e => e.click()')
    P.pg.wait_for_function("() => window.DJ && DJ.Leo && DJ.Leo.etat() && !DJ.Leo.etat().cine", timeout=60000)
    verifier(P.pg.evaluate("() => DJ.Leo.etat().phase === 1 && document.querySelector('#leo-barre em').textContent") == 'L\'homme en cape', 'le combat commence : « L\'homme en cape », phase 1')
    for ph in (1, 2):
        P.pg.evaluate("() => { var c = DJ.Leo._E().c; c.leo.pv = c.etat().leo.plancher + 10; DJ.Leo.agir('pisteur', 'fleche', 'leo'); }")
        P.pg.wait_for_function("() => DJ.Leo.etat().cine", timeout=20000); P.pg.wait_for_timeout(600)
        P.pg.eval_on_selector('[data-act=l-passer]', 'e => e.click()')
        P.pg.wait_for_function(f"() => DJ.Leo.etat().phase === {ph + 1} && !DJ.Leo.etat().cine", timeout=30000)
        verifier(P.pg.evaluate("() => +DJ.Explo._X().partie.faits['leo:phase']") == ph + 1, f'la phase {ph} est gagnée : elle est gardée toute seule (on reprendrait à la phase {ph + 1})')
    verifier(P.pg.evaluate("() => document.querySelector('#leo-barre em').textContent") == 'Léo', 'sous la cape : Léo')
    P.pg.evaluate("() => { DJ.Leo.agir('pisteur', 'l:faux', 'leo'); }"); P.pg.wait_for_timeout(1200)
    P.pg.evaluate("() => { DJ.Leo._E().c.leo.pv = 5; }")
    P.pg.wait_for_function("() => DJ.Leo.etat().aveu === 0", timeout=40000); P.pg.wait_for_timeout(300)
    aveux = []
    for k in range(5):
        aveux.append(P.pg.inner_text('.leo-aveu .bulle')); ok_lire = P.pg.locator('.leo-aveu .bulle [data-act=lire]').count() == 1
        if k == 2: P.pg.screenshot(path=os.path.join(OUT, 'pisteur-leo-aveu.png'))
        P.pg.eval_on_selector('[data-act=l-aveu]', 'e => e.click()'); P.pg.wait_for_timeout(250)
    verifier('Vous avez gagné' in aveux[0] and 'jamais voulu être meunier' in aveux[1] and 'la rivière rouge, les fumigènes, la lettre' in aveux[2] and 'Une ville entière, sous Brumeval' in aveux[3] and 'Personne n\'y va. Jamais.' in aveux[4] and ok_lire, 'Léo, battu, dit ses cinq phrases (chacune avec son 🔊)')
    # la fin du donjon : « Bravo ! … Place aux accusations ! », le code pour le Sage, et on remonte
    P.pg.wait_for_selector('#fin-donjon', timeout=15000); P.pg.wait_for_timeout(400)
    t = P.pg.inner_text('#fin-donjon')
    noms = P.pg.evaluate("() => DONJON_CODES.code('leo:battu').join('-')")
    verifier('Bravo ! Vous avez résolu l\'enquête n° 3.' in t and 'Place aux accusations' in t and noms == '-'.join(S.js("() => M.code('info:leo_battu')")), 'la fin du donjon : « Bravo ! Vous avez résolu l\'enquête n° 3. Place aux accusations ! », et le code pour le Sage')
    P.pg.screenshot(path=os.path.join(OUT, 'pisteur-fin-donjon.png'))
    P.pg.eval_on_selector('[data-act=enquete]', 'e => e.click()'); P.pg.wait_for_url('**/brumeval/index.html**'); P.pg.wait_for_timeout(1400); P.preparer()
    t = P.texte()
    verifier('Le donjon est fini' in t and 'Place aux accusations' in t and P.pg.locator('#voile .b-donne').count() == 2, 'le Pisteur remonte : « Le donjon est fini », deux codes à donner au Sage')
    P.shot('donjon-fini'); P.fermer()
    # « Odette est derrière la porte » et « Léo a parlé » → le Sage
    l = livrer(T, P)
    verifier(sorted(l) == ['info:leo_battu', 'info:odette_porte'], f'le Pisteur a donné au Sage : Odette est derrière la porte, Léo a parlé ({l})')
    # le Sage : la porte des Fondateurs, puis les trois accusations (OÙ, QUI a écrit, QUI sous la cape)
    S.js("() => { M.UI.ecran = 'enquete'; M.P().onglet = 'carte'; M.UI.modal = null; M.render(); M.P().onglet = 'role'; M.render(); }"); S.pg.wait_for_timeout(400)
    verifier(S.pg.locator('#livre-ici .lv-page.on [data-act=ouvrir-page][data-id=porte]').count() == 1, 'le Grand Livre du Sage s\'ouvre tout seul sur « La porte des Fondateurs »')
    S.ouvrir_page('porte'); S.fermer()
    verifier('Quatre signes' in S.page('porte'), 'le Sage : la porte aux quatre signes, Odette derrière')
    S.js("() => { M.UI.modal = null; M.A.accuser(); }"); S.pg.wait_for_timeout(250)
    verifier('OÙ est Odette' in S.texte(), 'le Sage accuse : la première question, « OÙ est Odette ? »')
    S.pg.locator('#voile [data-act=acc-choix][data-k=ou][data-v=clocher]').click(); S.pg.wait_for_timeout(200)
    S.pg.locator('#voile [data-act=acc-choix][data-k=qui][data-v=melusine]').click(); S.pg.wait_for_timeout(200)
    verifier('QUI se cachait sous la cape noire' in S.texte() and S.pg.locator('#voile [data-act=acc-choix][data-k=quoi]').count() == 10, 'la troisième question : « QUI se cachait sous la cape noire ? » (dix visages)')
    S.shot('accusation-cape')
    S.pg.locator('#voile [data-act=acc-choix][data-k=quoi][data-v=leo]').click(); S.pg.wait_for_timeout(200)
    S.pg.locator('#voile [data-act=acc-valider]').click(); S.pg.wait_for_timeout(350)
    verifier('Bravo' in S.texte() and 'Corbeau' not in S.texte() and S.pg.locator('#voile [data-act=fin-sage]').count() == 1, 'le Sage accuse : sous le clocher, Mélusine, Léo — c\'est juste ; plus de question du Corbeau')
    idv = S.js("() => M.idVictoire(0)"); seq = S.js("(id) => M.code(id)", idv)
    verifier(idv == 'victoire:20', f'le code de fin du Sage, sans erreur ({idv})')
    S.pg.locator('#voile [data-act=fin-sage]').click(); S.pg.wait_for_timeout(500)
    for r in ('barde', 'pisteur', 'alchimiste'): T[r].taper(seq, garder=True); passes.append(('sage', idv, r))
    verifier(all(t.js("() => M.P().etape === 'fin' && M.P().fin.variante === 2") for t in T.values()), 'le Sage → tous : le code de fin ; les quatre tablettes sont à la fin de l\'histoire')
    # la même scène finale partout
    textes = {}; cachots = {}
    for r, t in T.items():
        l = []
        for i in range(6):
            l.append(t.pg.evaluate("() => { var a = document.querySelector('.b-fin-slide'); return a ? a.querySelector('p').textContent : ''; }"))
            if i == 1 and r == 'sage': t.shot('fin-leo')
            if i == 4:
                # (13 novembre) au cachot : chacun tape le code d'apparence de ses amis — les quatre héros apparaissent
                avant = t.pg.locator('.b-prison-ombre.connu').count()
                for r2, t2 in T.items():
                    if r2 == r or t.js("(x) => !!(M.P().allures || {})[x]", r2): continue
                    for sym in t2.js("() => M.code(M.allureCodeFin())"): t.pg.locator(f'.b-fin-slide .b-prison-codes [data-act=sym][data-s="{sym}"]').click(); t.pg.wait_for_timeout(120)
                    t.pg.wait_for_timeout(600)
                cachots[r] = (avant, t.pg.locator('.b-prison-ombre.connu').count(), t.pg.locator('.b-fin-slide .b-prison-codes').count())
                t.pg.wait_for_timeout(1200); t.shot('cachot')
            if i == 5 and r == 'sage': t.shot('fin-mot')
            t.pg.locator('[data-act=fin-suite]').click(); t.pg.wait_for_timeout(250)
        textes[r] = l
    f = textes['sage']
    verifier(all(textes[r] == f for r in T) and 'Qu\'avez-vous fait à Léo' in f[1] and 'tête de corbeau' in f[2] and 'Attrapez-les' in f[3] and 'cachot' in f[4] and 'Fin de l\'enquête 3' in f[5] and 'ce n\'est que le début' in f[5],
             'la même scène finale sur les quatre tablettes : « Qu\'avez-vous fait à Léo ? », la bague, « Gardes ! Attrapez-les ! », le cachot, « Fin de l\'enquête 3… mais ce n\'est que le début. »')
    verifier(cachots['pisteur'][0] == 2 and cachots['barde'][0] == 0 and all(c[1] == 3 and c[2] == 0 for c in cachots.values()),
             f'au cachot : le Pisteur connaît déjà le Sage et l\'Alchimiste ; les codes d\'apparence tapés, chaque tablette montre les quatre héros ({cachots})')
    verifier(all(t.js("() => M.P().fin.etape === 'recompenses' && M.S.calepin.filter(function(c){ return c.e === 3; }).length === 8") for t in T.values()), 'chacun a ses récompenses et les huit notes du calepin')
    # ---------- le bilan ----------
    print('— LE BILAN')
    for r, t in T.items():
        m = t.missions(); pas = [x[0][:40] for x in m if not x[1]]
        verifier(not pas, f'{t.nom} : ses {len(m)} missions sont toutes cochées' + (f' — PAS COCHÉES : {pas}' if pas else ''))
        reste = [c for c in t.a_donner() if c not in t.donnes]
        verifier(not reste, f'{t.nom} : aucun code oublié' + (f' — PAS DONNÉS : {reste}' if reste else ''))
    print(f'   {len(passes)} codes passés d\'une tablette à l\'autre :')
    for de in ('barde', 'pisteur', 'alchimiste', 'sage'):
        l = sorted(set(c.split(':', 1)[-1] + '→' + p[:1].upper() for d, c, p in passes if d == de))
        print(f'     {NOMS[de]:8s}: ' + ', '.join(l))
    for t in T.values(): t.pg.context.close()


if not os.path.exists(os.path.join(DONJON, 'index.html')):
    print('Pas de donjon construit dans', DONJON, ': python3 jeu/donjon/moteur/construire.py'); sys.exit(2)
rac = tempfile.mkdtemp(prefix='brumeval-p3-')
os.makedirs(os.path.join(rac, 'brumeval'))
shutil.copy(os.path.join(DIST, 'index.html'), os.path.join(rac, 'brumeval', 'index.html'))
os.symlink(DONJON, os.path.join(rac, 'brumeval', 'donjon'))
srv = ThreadingHTTPServer(('127.0.0.1', 0), functools.partial(Muet, directory=rac))
threading.Thread(target=srv.serve_forever, daemon=True).start()
try:
    with sync_playwright() as p:
        nav = p.chromium.launch()
        partie(nav, f'http://127.0.0.1:{srv.server_address[1]}/brumeval/')
        nav.close()
finally:
    srv.shutdown(); shutil.rmtree(rac, ignore_errors=True)

print()
if erreurs: print('ERREURS DE PAGE :'); [print('  ', e[:300]) for e in erreurs[:12]]
if echecs: print(f'{len(echecs)} ÉCHEC(S) :'); [print('  ✗', e) for e in echecs]
else: print('Tout est bon.')
sys.exit(1 if (echecs or erreurs) else 0)
