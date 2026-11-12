"""Enquête 3, étape 8 (Bible § 13.14) : UNE PARTIE COMPLÈTE À QUATRE TABLETTES, du matin au cachot (Playwright).

Quatre tablettes dans le même navigateur (le Barde, le Pisteur, l'Alchimiste, le Sage), servies par un petit serveur avec le donjon
construit à côté (jeu/donjon/moteur/sortie → donjon/), comme en ligne. Le robot joue le chemin parfait et, surtout, il fait passer
CHAQUE CODE pour de vrai : il le lit sur la tablette de celui qui le donne, le tape sur celle de celui qui le reçoit (onglet Code),
et vérifie qu'il est reçu et qu'il ouvre bien la suite. Les mini-jeux se lancent pour de vrai, puis le robot les termine
(les mini-jeux, le labo, l'établi et le donjon ont chacun leur propre robot).

  Le matin : le Barde (Victor, Tim démasqué) → le Sage ; le Sage (le tableau, le Livre d'or, l'herbier) → l'Alchimiste ; l'Alchimiste
    (le gâteau ; l'oseille et la mélisse ; Bertille, puis le pied-de-loup, la vesse-de-loup, le gui : Bible §13.25) ;
    le Pisteur (les banderoles, l'oie) ; l'établi : les sept potions ; le Sage donne le code de l'après-midi.
  L'après-midi : le Barde (la lettre du maire, le carnet et les traces chez Odette) → le Sage, l'Alchimiste, le Pisteur ; le Sage
    (la lettre est fausse, les sept chats → le Pisteur, le plan des Fondateurs) ; le Pisteur (les traces → le Barde) ; l'Alchimiste
    (la lettre au labo → le Barde et le Sage) ; le Barde (l'aveu de Mélusine → le Sage) ; le Sage (qui a écrit la lettre ?) ;
    chacun rend sa mission au maire ; le Sage donne le code de la nuit.
  La nuit : le Barde (la clé d'Anselme → le Pisteur) ; l'Alchimiste (le sac → le Pisteur, le chaudron du donjon) ; le Pisteur (la clé,
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
PLUS_TARD = {'info:grosse_marie', 'info:maire_retenu'}     # (ceux-là se tapent DANS le donjon)

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
    B.ev('lieu', {'id': 'poste'}); B.ev('parler', {'id': 'victor'}); B.ev('question', {'p': 'victor', 'i': '1'}); B.fermer()
    B.ev('lieu', {'id': 'clocher'}); B.ev('parler', {'id': 'tim'}); B.ev('question', {'p': 'tim', 'i': '0'}); B.ev('bd-ment', {'p': 'tim', 'i': '0'}); B.fermer()
    verifier(set(livrer(T, B)) == {'info:poste', 'info:capuchon'}, 'le Barde a donné au Sage : la poste, le capuchon')
    # le Sage : le tableau, le Livre d'or, l'herbier, les premiers doutes
    verifier(S.jouer('mairie', 'tableau') == 'runes', 'le Sage peint le tableau d\'Odette (Assembler les runes)'); S.fermer()
    S.point('mairie', 'livredor'); S.fermer()
    S.page('habitants')
    th = S.page('herbier'); S.pg.locator('#livre-ici .lv-page.on .b-lire').first.click(); S.pg.wait_for_timeout(200)
    verifier(S.pg.locator('#livre-ici .lv-page.on .lv-herbier > li').count() == 7 and 'Rond des Sorcières' in th, 'le Sage lit l\'herbier à voix haute : sept plantes, où et quand (plus de code, Bible §13.25)')
    t = S.ouvrir_page('doutes'); S.fermer()
    verifier('capuchon' in S.page('doutes'), 'le Sage : « Une drôle de lettre », avec les deux codes du Barde')
    verifier(set(livrer(T, S)) == {'info:ecritures'}, 'le Sage a donné à l\'Alchimiste : les écritures du village')
    # le Pisteur : les banderoles et l'oie
    verifier(P.jouer('place', 'banderoles') == 'tir', 'le Pisteur accroche les banderoles (tir à l\'arc)'); P.fermer()
    verifier(P.jouer('boulangerie', 'oie') == 'poursuite', 'le Pisteur rattrape l\'oie (course-poursuite)'); P.fermer()
    # l'Alchimiste : le gâteau, les sept plantes
    verifier(A.jouer('boulangerie', 'gateau', {'gateau': {'etages': 3}}) == 'gateau', 'l\'Alchimiste fait le gâteau de la fête'); A.fermer()
    # (12 novembre, Bible §13.25) les plantes : sept endroits cachés de la carte, que l'herbier du Sage décrit. Le matin : l'oseille et la mélisse ;
    # Anselme sonne Bertille, la brume recule : le pied-de-loup, la vesse-de-loup, le gui. Le souci et le lin : pas avant l'après-midi.
    verifier(all(CU.cueillir(A.pg, k) for k in ('oseille', 'melisse')), 'l\'Alchimiste cueille l\'oseille et la mélisse, dans le village')
    verifier(CU.cueillir(A.pg, 'souci') is None and CU.cueillir(A.pg, 'lin') is None, 'le souci et le lin : pas avant l\'après-midi')
    verifier(CU.cueillir(A.pg, 'gui') is None, 'le gui : au-delà de la brume, hors d\'atteinte')
    verifier('Bertille' in (CU.bertille(A.pg) or ''), 'l\'Alchimiste demande à Anselme : il sonne Bertille, la brume recule au nord et à l\'ouest')
    verifier(all(CU.cueillir(A.pg, k) for k in CU.LOIN), 'l\'Alchimiste cueille le pied-de-loup, la vesse-de-loup et le gui')
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
    B.ev('question', {'p': 'grosbec', 'i': str(i)}); B.pg.wait_for_timeout(500)
    for k in (0, 2, 0): B.pg.locator(f'#voile [data-act=gd-choix][data-k="{k}"]').click(); B.pg.wait_for_timeout(280)
    verifier(B.js("() => !!M.P().objets.lettre"), 'le Barde : le maire lui prête la lettre d\'Odette'); B.fermer()
    B.carte(); B.ev('frapper', {'id': 'L2'}); B.ev('question', {'p': 'voisin', 'i': '0'}); B.fermer()
    verifier(set(livrer(T, B)) == {'obj:lettre', 'obj:carnet', 'info:traces_moustache'}, 'le Barde a donné : la lettre (Sage, Alchimiste), le carnet (Sage), les traces de Moustache (Pisteur)')
    # le Sage : la lettre est fausse, les sept chats, le plan des Fondateurs
    S.ouvrir_page('fausse'); S.fermer()
    verifier('la lettre est fausse' in S.page('fausse'), 'le Sage : la lettre et le carnet — « la lettre est fausse ! »')
    S.ouvrir_page('chats'); S.fermer()
    S.ouvrir_page('plan')
    if S.pg.locator('#voile [data-act=mj-go]').count(): S.pg.locator('#voile [data-act=mj-go]').click(); S.pg.wait_for_timeout(900)
    if S.pg.locator('#mj-plein .mj-go').count(): S.pg.locator('#mj-plein .mj-go').click(); S.pg.wait_for_timeout(1200)
    S.js("() => window.__finir(true)"); S.pg.wait_for_timeout(400); S.fermer()
    verifier(S.js("() => !!M.P().pages.plan"), 'le Sage déchiffre le plan des Fondateurs (l\'alphabet secret)')
    verifier(livrer(T, S) == ['info:six_doigts'], 'le Sage a donné au Pisteur : Moustache a six doigts')
    # le Pisteur : les traces de Moustache, jusqu'à la crypte
    verifier(P.jouer('place', 'traces') == 'traces', 'le Pisteur suit les pattes de Moustache'); P.fermer()
    verifier(livrer(T, P) == ['info:crypte_fermee'], 'le Pisteur a donné au Barde : la crypte est fermée')
    # l'Alchimiste : la lettre au labo (avec le Livre d'or du Sage)
    A.js("() => { M.UI.modal = null; M.P().onglet = 'role'; M.render(); M.ouvrirLabo(); }"); A.pg.wait_for_timeout(1800)
    f = next((x for x in A.pg.frames if x.parent_frame is not None), None)
    f.wait_for_function('() => !!window.__labo', timeout=8000)
    verifier(f.evaluate("() => window.__labo.cuirs().indexOf('lettre') >= 0") and A.js("() => !!M.P().recus['info:ecritures']"), 'l\'Alchimiste : la lettre est sur sa paillasse, et il a le Livre d\'or')
    f.evaluate("() => { window.__labo.finir('lettre'); window.__labo.quitter(); }"); A.pg.wait_for_timeout(900); A.fermer()
    verifier(set(livrer(T, A)) == {'info:ecriture'}, 'l\'Alchimiste a donné au Barde et au Sage : l\'écriture de Mélusine')
    # le Barde : Mélusine, devant son écriture
    iq = B.js("() => { var q = M.E().pnj.melusine.questions; for(var i = 0; i < q.length; i++) if(q[i].donneVrai === 'info:aveu' || q[i].donne === 'info:aveu') return i; return 4; }")
    B.carte(); B.ev('lieu', {'id': 'atelier'}); B.ev('parler', {'id': 'melusine'}); B.pg.wait_for_timeout(600)
    B.ev('question', {'p': 'melusine', 'i': str(iq)}); B.ev('bd-ment', {'p': 'melusine', 'i': str(iq)}); B.fermer()
    verifier(livrer(T, B) == ['info:aveu'], 'le Barde a donné au Sage : l\'aveu de Mélusine')
    S.ouvrir_page('qui'); S.fermer()
    verifier('sous la dictée' in S.page('qui'), 'le Sage : « Qui a écrit la lettre ? » — Mélusine, sous la dictée d\'un homme en cape')
    # chacun rend sa mission au maire
    S.point('mairie', 'rendu'); S.fermer()
    P.point('mairie', 'mission'); P.fermer()
    A.point('mairie', 'gateau'); A.fermer()
    moment(T, 2, 'nuit')

    # ======================================================================== LA NUIT
    print('— LA NUIT')
    # le Barde : la clé d'Anselme
    idx = B.js("() => M.E().pnj.anselme.questions.map(function(q){ return q.grand || ''; })")
    B.carte(); B.ev('parler', {'id': 'anselme'}); B.ev('question', {'p': 'anselme', 'i': str(idx.index('cle'))}); B.pg.wait_for_timeout(400)
    for k in (2, 2, 2): B.pg.locator(f'#voile [data-act=gd-choix][data-k="{k}"]').click(); B.pg.wait_for_timeout(280)
    B.fermer()
    verifier(livrer(T, B) == ['info:cle_clou'], 'le Barde a donné au Pisteur : la clé est au clou')
    # l'Alchimiste : le sac
    A.js("() => { M.UI.modal = null; M.P().onglet = 'role'; M.render(); }"); A.pg.wait_for_timeout(800)
    ET.vite(A.pg); fra = ET.ouvrir(A.pg); ET.sac(A.pg)
    seq = A.js("() => M.code('sac:' + M.sacBits())")
    verifier(A.js("() => M.sacBits()") == 127 and fra.locator('#sacCode').count() == 1, 'l\'Alchimiste : les sept potions sont prêtes, leur code pour le Pisteur')
    A.shot('sac')
    # le Pisteur : la clé d'Anselme, la grille de la crypte, le sac
    verifier(P.jouer('clocher', 'cle') == 'cachette', 'le Pisteur prend la clé d\'Anselme (se cacher dans le clocher)'); P.fermer()
    P.point('clocher', 'crypte'); P.pg.locator('#voile .b-choix-point [data-id=descendre]').click(); P.pg.wait_for_timeout(300)
    verifier('Il te manque le sac' in P.texte(), 'le Pisteur, devant l\'escalier : « Il te manque le sac »')
    t = P.taper(seq, garder=True)
    verifier('7 potions' in t and P.js("() => (M.P().sac || []).length") == 7, 'l\'Alchimiste → le Pisteur : le sac, sept potions'); passes.append(('alchimiste', 'sac', 'pisteur')); P.fermer()
    # l'Alchimiste et le Sage ouvrent leur page du donjon (et reviennent)
    ET.toucher(A.pg, '.carte [data-donjon]', attendre=False); A.pg.wait_for_url('**/donjon/alchimiste.html**'); A.pg.wait_for_timeout(1200)
    A.pg.eval_on_selector('#b-enquete', 'e => e.click()'); A.pg.wait_for_url('**/brumeval/index.html**'); A.pg.wait_for_timeout(900); A.preparer()
    verifier(A.js("() => M.UI.ecran") == 'enquete', 'l\'Alchimiste ouvre le chaudron du donjon, puis revient dans l\'enquête')
    S.page('donjon'); S.pg.locator('#livre-ici .lv-page.on [data-act=ds-aller]').click(); S.pg.wait_for_url('**/donjon/sage.html**'); S.pg.wait_for_timeout(1200)
    S.pg.eval_on_selector('#b-enquete', 'e => e.click()'); S.pg.wait_for_url('**/brumeval/index.html**'); S.pg.wait_for_timeout(900); S.preparer()
    verifier(S.js("() => M.UI.ecran") == 'enquete', 'le Sage ouvre le plan des souterrains, puis revient dans l\'enquête')
    # le Pisteur descend : le vrai donjon
    P.point('clocher', 'descendre'); P.pg.locator('#voile [data-act=ds-aller]').click()
    P.pg.wait_for_url('**/donjon/index.html**'); P.pg.wait_for_timeout(1500)
    X = P.pg.evaluate("() => { var p = DJ.Explo._X().partie; return {enquete:p.enquete, entree:p.entree, recettes:p.recettes.length}; }")
    verifier(X == {'enquete': 3, 'entree': 'crypte', 'recettes': 7}, f'le Pisteur descend : le donjon s\'ouvre, par la crypte, avec les sept potions ({X})')
    P.pg.eval_on_selector('[data-act=sac-pret]', 'e => e.click()')
    P.pg.wait_for_function("() => DJ.Explo.etat().ecran === 'scene' && !DJ.Explo.etat().occupe", timeout=40000); P.pg.wait_for_timeout(500)
    P.pg.eval_on_selector('#b-repartir', 'e => e.click()')
    P.pg.wait_for_function("() => DJ.Explo.etat().ecran === 'carte' && !DJ.Explo.etat().occupe", timeout=40000); P.pg.wait_for_timeout(500)
    # le Barde, pendant ce temps : la Grosse Marie, puis retenir le maire ; ses deux codes sont tapés DANS le donjon
    B.carte(); B.ev('parler', {'id': 'anselme'}); B.ev('question', {'p': 'anselme', 'i': str(idx.index('gm'))}); B.pg.wait_for_timeout(400)
    for k in (1, 1, 2): B.pg.locator(f'#voile [data-act=gd-choix][data-k="{k}"]').click(); B.pg.wait_for_timeout(280)
    B.fermer()
    B.carte(); B.ev('lieu', {'id': 'place'}); B.ev('gd-fete', {'id': 'grosbec'}); B.pg.locator('#voile [data-act=gd-ret][data-k="1"]').click(); B.pg.wait_for_timeout(250); B.ev('gd-ret-ok')
    B.ev('gd-fete', {'id': 'silas'}); B.fermer()
    B.ev('gd-fete', {'id': 'grosbec'}); B.pg.locator('#voile [data-act=gd-ret][data-k="0"]').click(); B.pg.wait_for_timeout(250); B.ev('gd-ret-ok'); B.fermer()
    verifier(set(B.a_donner()) >= {'info:grosse_marie', 'info:maire_retenu'}, 'le Barde a ses deux codes pour le donjon : la Grosse Marie, le maire est retenu')
    def pave(seq):
        P.pg.eval_on_selector('[data-act=pave]', 'e => e.click()'); P.pg.wait_for_selector('#fenetre .pave-cases', timeout=8000)
        for s in seq: P.pg.eval_on_selector(f'#fenetre [data-act=symbole][data-id="{s}"]', 'e => e.click()'); P.pg.wait_for_timeout(300)
        P.pg.wait_for_timeout(1000); t = P.pg.inner_text('#fenetre'); P.pg.eval_on_selector('#fenetre [data-act=fermer]', 'e => e.click()'); P.pg.wait_for_timeout(400); return t
    P.pg.evaluate("() => { DJ.Explo._X().partie.heros.sage.pv = 1; }")
    t = pave(B.js("() => M.code('info:grosse_marie')"))
    verifier('Grosse Marie' in t and P.pg.evaluate("() => { var H = DJ.Explo._X().partie.heros.sage; return H.pv === H.pvMax; }"), 'le Barde → le Pisteur, DANS le donjon : la Grosse Marie (toute la vie revient)'); passes.append(('barde', 'info:grosse_marie', 'pisteur'))
    t = pave(B.js("() => M.code('info:maire_retenu')"))
    verifier('Le maire est retenu' in t and P.pg.evaluate("() => !!DJ.Explo._X().partie.codes['maire:retenu']"), 'le Barde → le Pisteur, DANS le donjon : le maire est retenu'); passes.append(('barde', 'info:maire_retenu', 'pisteur'))
    B.donnes |= {'info:grosse_marie', 'info:maire_retenu'}
    # la fin du donjon (le chemin est sauté : la porte aux quatre signes, puis Léo), et on remonte
    P.pg.evaluate("() => { var p = DJ.Explo._X().partie; Regles.entrer(p, 'porte4'); Regles.entrer(p, 'leo'); DJ.garder(p); }")
    P.pg.eval_on_selector('[data-act=enquete]', 'e => e.click()'); P.pg.wait_for_url('**/brumeval/index.html**'); P.pg.wait_for_timeout(1400); P.preparer()
    t = P.texte()
    verifier('Le donjon est fini' in t and 'coincé Léo' in t and P.pg.locator('#voile .b-donne').count() == 2, 'le Pisteur remonte : « Le donjon est fini », deux codes à donner')
    P.shot('donjon-fini'); P.fermer()
    # « Odette est derrière la porte » → le Sage ; « Léo attrapé » → le Barde (son grand dialogue s'ouvre)
    verifier(livrer(T, P, {'info:odette_porte'}) == ['info:odette_porte'], 'le Pisteur a donné au Sage : Odette est derrière la porte')
    seq = P.js("() => M.code('info:leo_attrape')")
    B.taper(seq, garder=True)
    verifier(B.pg.locator('#voile [data-act=gd-leo-ment]').count() == 1, 'le Pisteur → le Barde : « Léo attrapé » — son grand dialogue s\'ouvre'); passes.append(('pisteur', 'info:leo_attrape', 'barde')); P.donnes.add('info:leo_attrape')
    B.pg.locator('#voile [data-act=gd-leo-ment]').click(); B.pg.wait_for_timeout(250); B.pg.locator('#voile [data-act=gd-leo-suite]').click(); B.pg.wait_for_timeout(250)
    for k in (2, 2, 1): B.pg.locator(f'#voile [data-act=gd-choix][data-k="{k}"]').click(); B.pg.wait_for_timeout(300)
    verifier('bague à tête de corbeau' in B.texte() and B.pg.locator('#voile [data-act=gd-leo-code]').count() == 1, 'le Barde : Léo dit tout (la porte, la trappe, la bague à tête de corbeau)')
    B.pg.locator('#voile [data-act=gd-leo-code]').click(); B.pg.wait_for_timeout(300); B.shot('leo-code'); B.fermer()
    verifier(livrer(T, B) == ['info:leo_dit3'], 'le Barde a donné au Sage : Léo a tout dit')
    # le Sage : la porte des Fondateurs, puis l'accusation
    S.js("() => { M.UI.ecran = 'enquete'; M.P().onglet = 'carte'; M.UI.modal = null; M.render(); M.P().onglet = 'role'; M.render(); }"); S.pg.wait_for_timeout(400)
    verifier(S.pg.locator('#livre-ici .lv-page.on [data-act=ouvrir-page][data-id=porte]').count() == 1, 'le Grand Livre du Sage s\'ouvre tout seul sur « La porte des Fondateurs »')
    S.ouvrir_page('porte'); S.fermer()
    verifier('Quatre signes' in S.page('porte'), 'le Sage : la porte aux quatre signes, Odette derrière')
    S.js("() => { M.UI.modal = null; M.A.accuser(); }"); S.pg.wait_for_timeout(250)
    S.pg.locator('#voile [data-act=acc-choix][data-k=qui][data-v=melusine]').click(); S.pg.wait_for_timeout(200)
    S.pg.locator('#voile [data-act=acc-choix][data-k=ou][data-v=clocher]').click(); S.pg.wait_for_timeout(200)
    S.pg.locator('#voile [data-act=acc-valider]').click(); S.pg.wait_for_timeout(350)
    verifier('QUI est le Corbeau' in S.texte(), 'le Sage accuse : Mélusine, sous le clocher — c\'est juste ; la question du Corbeau')
    S.pg.locator('#voile [data-act=corbeau-choix][data-v=grosbec]').click(); S.pg.wait_for_timeout(350)
    idv = S.js("() => M.idVictoire(0)"); seq = S.js("(id) => M.code(id)", idv)
    verifier(idv == 'victoire:20', f'le code de fin du Sage : sans erreur, « Léo a tout dit » ({idv})')
    S.pg.locator('#voile [data-act=fin-sage]').click(); S.pg.wait_for_timeout(500)
    for r in ('barde', 'pisteur', 'alchimiste'): T[r].taper(seq, garder=True); passes.append(('sage', idv, r))
    verifier(all(t.js("() => M.P().etape === 'fin' && M.P().fin.variante === 2") for t in T.values()), 'le Sage → tous : le code de fin ; les quatre tablettes sont à la fin de l\'histoire')
    # la même scène finale partout
    textes = {}
    for r, t in T.items():
        l = []
        for i in range(6):
            l.append(t.pg.evaluate("() => { var a = document.querySelector('.b-fin-slide'); return a ? a.querySelector('p').textContent : ''; }"))
            if i == 2 and r == 'sage': t.shot('fin-leo')
            if i == 5: t.pg.wait_for_timeout(1200); t.shot('cachot')
            t.pg.locator('[data-act=fin-suite]').click(); t.pg.wait_for_timeout(250)
        textes[r] = l
    verifier(all(textes[r] == textes['sage'] for r in T) and 'beaucoup trop parlé' in textes['sage'][2] and 'cachot' in textes['sage'][5], 'la même scène finale sur les quatre tablettes : « tu as beaucoup trop parlé », la bague, le cachot')
    verifier(all(t.js("() => M.P().fin.etape === 'recompenses' && M.S.calepin.filter(function(c){ return c.e === 3; }).length === 6") for t in T.values()), 'chacun a ses récompenses et les six notes du calepin')
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
