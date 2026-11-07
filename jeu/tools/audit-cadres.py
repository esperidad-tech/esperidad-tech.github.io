"""Audit des cadres jaunes du tutoriel (Romain, 5 novembre, 23 h 06) : tuto.py, plus, à chaque rond, la liste de tout ce qui est encadré
de jaune à l'écran (animé ou immobile), et si le bouton guidé bouge (.tu-respire). Les textes du bandeau, avec leur longueur.
Usage : BRUMEVAL_DIST=… python3 tools/audit-cadres.py"""
"""Le bot du tutoriel : l'enquête 1 à 4 tablettes, en suivant UNIQUEMENT ce que le jeu montre.
Chaque tablette, à son tour :
  1. « dit à voix haute » les codes que son écran affiche (« donne ce code au Barde », « pour toute l'équipe »…) ;
  2. si une fenêtre est ouverte, ou s'il n'y a pas de code à taper, elle touche le rond lumineux (et rien d'autre) ;
  3. sinon, elle tape dans 🔢 Code les codes qu'un équipier lui a dits.
Le Sage ne passe au moment suivant (et n'accuse) que quand les autres ont fini (il « demande à l'équipe »).
L'atelier de l'Alchimiste : le bot touche le rond de l'atelier (Atelier.guider) ; seul le mini-jeu du chaudron est préparé
à la main (comme les autres mini-jeux, court-circuités). Sans Atelier.guider, le repli : carton et encre à la main.
Vérifie : la bonne accusation (Tim, au Vieux Chêne) ; jamais bloqué ; jamais un « Pas maintenant » ; un seul lieu ouvert
sur chaque carte vue ; chaque rôle fait au moins une étape à chaque moment ; tous les mini-jeux au niveau 1 ;
tout le monde au niveau 2 à la fin ; au début de l'enquête 2, le talent du niveau 2 forcé, puis tout se débloque.
Usage : python3 tools/tuto.py [--rates] [--tablette]   (--rates : la course-poursuite et les runes ratées deux fois)
Termine par « ÉCHECS : [] » et « ERREURS : [] » si tout va bien."""
import os, sys, json, re
from playwright.sync_api import sync_playwright
ICI = os.path.dirname(os.path.abspath(__file__))
URL = 'file://' + os.path.join(os.path.abspath(os.environ.get('BRUMEVAL_DIST') or os.path.join(ICI, '..', 'dist')), 'index.html')
OUT = os.path.join(ICI, '..', 'test', 'audit-cadres')
os.makedirs(OUT, exist_ok=True)
RATES = '--rates' in sys.argv
TAILLE = (1180, 820) if '--tablette' in sys.argv else (390, 844)
ROLES = ['pisteur', 'alchimiste', 'barde', 'sage']
AU = {'pisteur': 'au Pisteur', 'alchimiste': "à l'Alchimiste", 'barde': 'au Barde', 'sage': 'au Sage'}
erreurs, echecs, journal = [], [], []
# (les clics forcés, force=True : le bouton que le tutoriel montre « respire » sans arrêt — tuto.css, .tu-respire —
#  et Playwright attendrait qu'il soit immobile)
def verif(ok, msg):
    print(('  OK  ' if ok else '  ✗✗ ') + msg, flush=True)
    if not ok: echecs.append(msg)

def creer(b, role):
    pg = b.new_context(viewport={'width': TAILLE[0], 'height': TAILLE[1]}).new_page()
    pg.set_default_timeout(30000)
    pg.on('console', lambda m: erreurs.append(f'[{role}] {m.text}') if m.type == 'error' and 'ERR_' not in m.text and 'fonts' not in m.text else None)
    pg.on('pageerror', lambda e: erreurs.append(f'[{role}] PAGEERROR {e}'))
    pg.goto(URL)
    pg.click('[data-act=creer]', force=True); pg.click(f'[data-act=crea-role][data-r={role}]', force=True)
    pg.click('[data-act=crea-hasard]', force=True); pg.click('[data-act=crea-suite]', force=True)
    pg.fill('#nom', role.capitalize()); pg.click('[data-act=crea-fin]', force=True)
    pg.click('[data-act=nouvelle-enquete]', force=True); pg.click('[data-act=commencer]', force=True)
    # Les mini-jeux sont court-circuités (le bot ne sait pas jouer) ; on garde le niveau demandé pour le vérifier.
    pg.evaluate("""(rates) => { window.__niveaux = []; window.__rates = rates ? {poursuite:2, runes:2} : {};
      var o = MJ.reglages; MJ.reglages = function(type, n, mods, opts){ var p = o.apply(this, arguments); if(!(opts && opts.brut)) window.__niveaux.push([type, p.niveauEffectif]); return p; };
      MJ.lancer = function(el, type, params, fin){ var r = window.__rates[type] > 0; if(r) window.__rates[type]--;
        setTimeout(function(){ fin({reussi:!r, score:r ? 0 : 1, essais:1}); }, 40); return {arreter:function(){}}; };
      window.__toasts = []; var t0 = M.toast; M.toast = function(t){ window.__toasts.push(String(t)); return t0.apply(this, arguments); }; }""", RATES)
    pg.wait_for_timeout(500)
    return pg

AUDIT_JS = r"""() => {
  function jaune(c){ var m = c && c.match(/rgba?\(([\d.]+),\s*([\d.]+),\s*([\d.]+)(?:,\s*([\d.]+))?\)/); if(!m) return false; var r = +m[1], g = +m[2], b = +m[3], a = m[4] === undefined ? 1 : +m[4]; return a > .3 && r > 215 && g > 160 && g < 245 && b < 140; }
  function infini(an){ return an.some(function(a){ var t = a.effect && a.effect.getTiming ? a.effect.getTiming() : {}; return a.playState === 'running' && t.iterations === Infinity; }); }
  function anime(el, pseudo){
    if(pseudo){ var a0 = el.getAnimations ? el.getAnimations({subtree:true}) : []; if(infini(a0.filter(function(a){ return a.effect && a.effect.pseudoElement; }))) return true; }
    for(var e = el; e && e !== document.body; e = e.parentElement){ if(infini(e.getAnimations ? e.getAnimations() : [])) return true; } return false; }
  var res = [];
  document.querySelectorAll('body *').forEach(function(el){
    var r = el.getBoundingClientRect(); if(r.width < 8 || r.height < 8 || r.bottom < 0 || r.top > innerHeight || r.right < 0 || r.left > innerWidth) return;
    if(el.closest('[hidden]') || el.closest('#mj-plein')) return;
    var cs = getComputedStyle(el); if(cs.visibility === 'hidden' || cs.display === 'none') return;
    var t = [];
    if(parseFloat(cs.borderTopWidth) >= 2 && jaune(cs.borderTopColor)) t.push(['bord', false]);
    if(el instanceof SVGElement && cs.stroke && jaune(cs.stroke) && parseFloat(cs.strokeWidth) >= 3 && el.tagName !== 'text') t.push(['trait', false]);
    if(/0px 0px 0px [2-9]/.test(cs.boxShadow) && cs.boxShadow.split('), ').some(function(x){ return /0px 0px 0px [2-9]/.test(x) && jaune(x + ')'); })) t.push(['ombre', false]);
    ['::before', '::after'].forEach(function(ps){ var c2 = getComputedStyle(el, ps); if(c2.content && c2.content !== 'none' && parseFloat(c2.borderTopWidth) >= 2 && jaune(c2.borderTopColor)) t.push(['bord' + ps, true]); });
    t.forEach(function(x){
      var cl = el.getAttribute('class') || '';
      var par = el.parentElement ? (el.parentElement.getAttribute('class') || el.parentElement.tagName) : '';
      res.push({cl:(el.tagName.toLowerCase() + '.' + String(cl).trim().split(/\s+/).join('.')).slice(0, 90), par:String(par).slice(0, 60), quoi:x[0], anime:anime(el, x[1]), act:(el.closest('[data-act]') || {dataset:{}}).dataset.act || ''});
    });
  });
  return res;
}"""
VU = {}
RESP = {'ok':0, 'non':[]}
RESP_JS = r"""() => [].filter.call(document.querySelectorAll('.tu-vise'), function(e){ return !(e instanceof SVGElement); }).map(function(e){
  var an = e.getAnimations ? e.getAnimations() : []; return {ok: an.some(function(a){ return a.animationName === 'tu-respire' && a.playState === 'running'; }), cl:(e.getAttribute('class') || '').slice(0, 80), act:e.dataset ? e.dataset.act || '' : ''}; })"""
def respire(pg, r, ou):
    try: l = pg.evaluate(RESP_JS)
    except Exception: return
    for x in l:
        if x['ok']: RESP['ok'] += 1
        elif len(RESP['non']) < 40: RESP['non'].append((r, x['cl'], x['act'], ou))
def audit(pg, r, ou):
    try: l = pg.evaluate(AUDIT_JS)
    except Exception as ex: print('audit', ex); return
    for x in l:
        k = (x['cl'], x['quoi'], x['anime'])
        if k not in VU:
            VU[k] = {'n': 0, 'roles': set(), 'par': x['par'], 'act': x['act'], 'ou': ou}
            if not x['anime']: pg.screenshot(path=f"{OUT}/statique-{len(VU):02d}-{r}.png")
        VU[k]['n'] += 1; VU[k]['roles'].add(r)

def g(pg): return pg.evaluate('() => M.tutoGuide && M.tutoGuide()')
def etat(pg): return pg.evaluate("() => { var P = M.P(); return P ? {etape:P.etape, moment:P.moment, actions:P.actions, onglet:P.onglet, modal:M.UI.modal && M.UI.modal.type, ecran:M.UI.ecran} : null; }")

def codes_affiches(pg, role):
    """Les codes que l'écran montre, avec à qui les dire"""
    return pg.evaluate("""(moi) => {
      var l = [];
      document.querySelectorAll('.b-code').forEach(function(c){
        var r = c.getBoundingClientRect(), page = c.closest('.lv-page.on');   /* une page du Grand Livre : le Sage la lit jusqu'en bas */
        if(r.width < 2 || (!page && (r.bottom < 0 || r.top > innerHeight))) return;
        if(c.closest('.b-codes-donnes')) return;   /* « les codes que tu as donnés » : un rappel, pas un nouveau code */
        var boite = c.closest('.b-donne, .b-info-modal, .b-decouverte, .b-feuille, .lv-contenu') || c.parentNode;
        var t = (boite.innerText || '').replace(/\\s+/g, ' ');
        var seq = [].map.call(c.querySelectorAll('.b-sym'), function(s){ return s.getAttribute('aria-label'); });
        if(seq.length === 3) l.push({seq:seq, t:t.slice(0, 160)});
      });
      return l; }""", role)

def pour_qui(t, role):
    if "toute l'équipe" in t or 'aux autres' in t or 'tous les joueurs' in t: return [r for r in ROLES if r != role]
    return [r for r in ROLES if AU[r] in t and r != role]

def taper(pg, seq):
    pg.click('[data-act=onglet][data-o=code]', force=True); pg.wait_for_timeout(120)
    for s in seq: pg.click(f'.b-pave [data-act=sym][aria-label="{s}"]', force=True); pg.wait_for_timeout(60)
    pg.wait_for_timeout(500)

def rond(pg):
    return pg.evaluate("""() => { var d = [].filter.call(document.querySelectorAll('.tu-rond'), function(x){ return !x.hidden; })[0]; if(!d) return null;
      var r = d.getBoundingClientRect(); var x = r.left + r.width / 2, y = r.top + r.height / 2;
      var e = document.elementFromPoint(x, y), a = e && e.closest('[data-act]');
      return {x:x, y:y, act:a ? a.dataset.act : null}; }""")

def rond_attendu(pg, ms=2500):
    """Le rond n'arrive qu'une fois sa cible posée (tuto.js, placer : après l'animation d'entrée d'un écran) : on lui laisse le temps"""
    for _ in range(ms // 100):
        pt = rond(pg)
        if pt: return pt
        pg.wait_for_timeout(100)
    return rond(pg)

def un_seul_lieu(pg, role):
    if not pg.is_visible('#carte-ici'): return
    gd = g(pg)
    if not gd or gd['etat'] in ('fini', 'bravo'): return   # la trame est finie : toute la carte est libre (voulu)
    l = pg.evaluate("() => [].map.call(document.querySelectorAll('#carte-ici g.ca-lieu.ca-clic:not(.ca-verrouille)'), function(x){ return x.dataset.lieu; })")
    if len(l) > 1: echecs.append(f'{role} : {len(l)} lieux ouverts sur la carte {l} ({etat(pg)}, {gd["etat"]}, {gd["cible"]})')

def atelier_a_la_main(pg, gd):
    """L'atelier (autre module) : ce que le rond ne sait pas encore faire faire"""
    c = gd['cible'].get('c')
    if c == 'carton':
        pg.click('[data-act=onglet][data-o=role]', force=True) if not pg.is_visible('#atelier-ici') else None
        pg.wait_for_timeout(400)
        for _ in range(3):
            if pg.evaluate('() => M.condMission({rangement:1})'): break
            if pg.locator('.at-carton').count(): pg.locator('.at-carton').first.click(force=True)
            pg.wait_for_timeout(900)
        if not pg.evaluate('() => M.condMission({rangement:1})'):
            journal.append('alchimiste : atelier installé à la main (carton)')
            pg.evaluate("() => { var S = M.S; if(window.Atelier && S.atelier){ (S.atelier.objets = S.atelier.objets || []).push({t:'caisse', x:300, y:300, cases:[]}); } M.sauver(); M.render(); }")
        return True
    if c in ('cueillette', 'rangement', 'grimoire', 'chaudron'):
        # préparer l'encre au grand chaudron : une action, les ingrédients de la recette, une fiole (comme partie1.py)
        pg.evaluate("""() => { var S = M.S, P = M.P(); if(!M.peutAgir()) return;   /* (l'enquête 1 n'a plus de points d'action : M.depenser ne fait rien) */
          ['eau', 'miel', 'baies'].forEach(function(k, i){ try{ if(window.Atelier && S.atelier && Atelier.retirer) Atelier.retirer(S.atelier, k, [2, 1, 3][i]); }catch(e){} });
          S.potions.revelatrice = (S.potions.revelatrice || 0) + 1; S.fioles = Math.max(0, S.fioles - 1); M.depenser(); M.UI.tutoGrimoire = 1; M.sauver(); M.render(); }""")
        journal.append('alchimiste : encre préparée à la main (le chaudron de l\'atelier n\'a pas encore de guidage)')
        return True
    if c == 'potion':   # ouvrir le panneau du flacon : sans le guidage de l'atelier, on donne directement
        pg.evaluate("() => M.A['donner-potion']({dataset:{id:'revelatrice'}})")
        return True
    if c == 'paillasse' and gd['cible'].get('objet'):
        o = gd['cible']['objet']
        if not pg.is_visible(f'[data-act=analyser][data-id={o}]') and pg.locator('#atelier-ici [data-at=analyses]').count():
            pg.evaluate("() => document.querySelector('#atelier-ici [data-at=analyses]').dispatchEvent(new MouseEvent('click', {bubbles:true}))")
            pg.wait_for_timeout(400)
            if not pg.is_visible(f'[data-act=analyser][data-id={o}]'):
                pg.evaluate(f"() => M.A.analyser({{dataset:{{id:'{o}'}}}})")
            return True
    return False

essais_carton = [0]
def atelier(pg, gd):
    """L'atelier : on suit SON rond (Atelier.guider) ; le chaudron ouvert, c'est le mini-jeu (préparé à la main) ; sans l'API, le repli."""
    c = gd['cible'].get('c')
    if c == 'bouton': return False   # « Analyser », « Donner » : le rond du tutoriel, comme ailleurs
    if c not in ('brasser',) and rond(pg): return False   # un panneau ouvert dans l'atelier (la cueillette, un meuble…) : le rond du tutoriel est dedans (ou sur son ✕)
    if c == 'carton':   # les cartons vident tout dans le 📦 du coin (Romain, 15 h 10) : le 📦, puis le meuble à installer, brillent eux-mêmes
        gq = pg.evaluate("() => { var l = [].slice.call(document.querySelectorAll('#atelier-ici .at-guide-q')); for(var i = 0; i < l.length; i++){ var r = l[i].getBoundingClientRect(); if(r.width > 4) return {x:r.left + r.width / 2, y:r.top + r.height / 2}; } return null; }")
        if gq:
            pg.mouse.click(gq['x'], gq['y']); pg.wait_for_timeout(600)
            journal.append('alchimiste : touche ce qui brille (le 📦, puis le meuble)')
            return True
    g = pg.evaluate("() => { var g = document.querySelector('#atelier-ici .at-guide'); if(!g || g.hidden) return null; var r = g.getBoundingClientRect(); return r.width ? {x:r.left + r.width / 2, y:r.top + r.height / 2} : null; }")
    if c == 'brasser' or (c == 'chaudron' and g is None and not pg.evaluate('() => !!(window.Atelier && Atelier.guider)')):
        atelier_a_la_main(pg, dict(gd, cible=dict(gd['cible'], c='chaudron')))
        pg.evaluate("() => { var f = document.querySelector('#atelier-ici .at-grim:not([hidden]) .at-fermer'); if(f) f.click(); }")
        return True
    if g:
        if c == 'carton':
            essais_carton[0] += 1
            if essais_carton[0] > 6:   # plus de carton utile : on installe un rangement à la main (et on le note)
                return atelier_a_la_main(pg, gd)
        sel = {'cueillette': '#atelier-ici .at-tas', 'potion': '#atelier-ici .at-flacon'}.get(c)
        pt = pg.evaluate("(s) => { var l = s ? [].slice.call(document.querySelectorAll(s)) : []; for(var i = 0; i < l.length; i++){ var r = l[i].getBoundingClientRect(); if(r.width > 4) return {x:r.left + r.width / 2, y:r.top + r.height / 2}; } return null; }", sel) if sel else None
        pt = pt or g
        pg.mouse.click(pt['x'], pt['y']); pg.wait_for_timeout(500)
        journal.append(f'alchimiste : touche le rond de l\'atelier ({c})')
        return True
    return atelier_a_la_main(pg, gd)

with sync_playwright() as p:
    b = p.chromium.launch()
    J = {r: creer(b, r) for r in ROLES}
    dits = {r: [] for r in ROLES}      # codes dits à cette tablette, pas encore tapés
    connus = {r: set() for r in ROLES} # pour ne pas redire deux fois le même code
    faits_au = {}                       # (rôle, moment) -> étapes faites pendant ce moment
    vu_avant = {r: 0 for r in ROLES}
    tours_vides, pas_total, captures = 0, 0, 0
    boucle, dernier, agit, prec = {r: 0 for r in ROLES}, {r: None for r in ROLES}, {}, [None, 0]   # agit[r] : r a touché quelque chose à son dernier tour
    textes, actions_vues = set(), []   # (rôle, état, but, but2, dire) du bandeau ; ce qui parle d'actions à l'écran
    for tour in range(700):
        agi = False
        for r in ROLES:
            if prec[0]: agit[prec[0]] = pas_total > prec[1]
            prec[0], prec[1] = r, pas_total
            pg = J[r]
            e = etat(pg)
            if not e or e['etape'] == 'fin': continue
            # 1. les codes à l'écran : on les dit à qui ils sont destinés
            for c in codes_affiches(pg, r):
                k = '-'.join(c['seq'])
                for d in pour_qui(c['t'], r):
                    if k not in connus[d]: connus[d].add(k); dits[d].append(c['seq']); journal.append(f'{r} dit un code {AU[d]} : {c["t"][:70]}')
            gd = g(pg)
            # les deux pages de toutes les enquêtes (bibliothèque des plans, objets magiques) : le tutoriel ne s'y arrête jamais
            if gd and gd.get('cible') and gd['cible'].get('k') == 'page' and gd['cible'].get('id') in ('bibliotheque', 'objets', 'fondateurs') and len(echecs) < 30:
                echecs.append(f"le tutoriel s'arrête sur la page {gd['cible']['id']} ({r})")
            # l'enquête 1 sans points d'action : ce que dit le bandeau, et rien à l'écran qui parle d'actions (pastilles, « · 1 action », page « Donner une action »)
            if gd: textes.add((r, gd['etat'], gd['but'] or '', gd.get('but2') or '', gd.get('dire') or ''))
            if e['ecran'] == 'enquete':
                vu_act = pg.evaluate(r"""() => { var t = [document.getElementById('app'), document.getElementById('voile')].map(function(x){ return x && !x.hidden ? x.innerText : ''; }).join(' ');
                  var m = t.match(/[^.\n]{0,40}(\b1 action|\bactions?\b)[^.\n]{0,30}/i);
                  return document.querySelector('.b-pips') ? 'pastilles .b-pips' : document.querySelector('.lv-page[data-id=actions]') ? 'page « Donner une action »' : m ? m[0] : null; }""")
                if vu_act and len(actions_vues) < 6: actions_vues.append(f'{r} : {vu_act}')
            # une tablette qui touche sans fin la même chose (même étape, même cible, même écran) : en boucle, on le dit
            sig = json.dumps([gd, e], ensure_ascii=False, sort_keys=True)
            boucle[r] = boucle[r] + 1 if (sig == dernier[r] and agit.get(r)) else 0; dernier[r] = sig
            if boucle[r] == 40:
                echecs.append(f'EN BOUCLE : {r} refait toujours la même chose {sig[:700]} ; sous le rond : {rond(pg)}')
                pg.screenshot(path=f'{OUT}/boucle-{r}.png')
            if boucle[r] >= 40: continue
            # le Sage « demande à l'équipe » avant de passer au moment suivant, ou d'accuser
            if r == 'sage' and gd and gd['cible'] and (gd['cible'].get('k') in ('moment', 'passer', 'accuser') or gd['cible'].get('id') in ('codes', 'accusation')) and e['modal'] is None:
                autres = [g(J[x]) for x in ROLES if x != 'sage']
                pret = all((a is None) or a['etat'] in ('moment', 'action', 'fini') or (a['etat'] == 'attend' and not a['but2']) for a in autres) and not any(dits[x] for x in ROLES if x != 'sage')
                if gd['cible'].get('k') == 'accuser' or gd['cible'].get('id') == 'accusation': pret = pret and all(a is None or a['etat'] == 'fini' for a in autres)
                if not pret: continue
            # 2. une fenêtre ouverte : on la finit d'abord ; sinon, les codes qu'on nous a dits
            if e['modal'] is None and dits[r] and e['ecran'] == 'enquete':
                seq = dits[r].pop(0); taper(pg, seq); agi = True; pas_total += 1; continue
            # l'accusation : pas de rond (on ne montre pas la réponse) ; l'équipe a trouvé Tim, au Vieux Chêne
            if e['modal'] == 'accusation':
                for sel in ['#voile [data-act=acc-choix][data-k=qui][data-v=tim]', '#voile [data-act=acc-choix][data-k=ou][data-v=chene]', '#voile [data-act=acc-valider]']:
                    if pg.is_visible(sel): pg.click(sel, force=True); pg.wait_for_timeout(250); agi = True; break
                continue
            if gd and gd['cible'] and gd['cible'].get('k') == 'atelier' and e['modal'] is None and e['onglet'] == 'role':
                if atelier(pg, gd): agi = True; pas_total += 1; pg.wait_for_timeout(200); continue
            # la chanson du Barde (phrase à trous) : le rond montre un trou, jamais le mot ; le bot choisit un mot (comme un mini-jeu)
            if gd and gd['etat'] == 'bonus' and pg.is_visible('.bd-trou.choisi') and pg.locator('.bd-mot:not([disabled])').count():
                pg.locator('.bd-mot:not([disabled])').first.click(); pg.wait_for_timeout(250); agi = True; pas_total += 1; continue
            pt = rond(pg)
            if pt:
                pg.wait_for_timeout(250); ou = json.dumps(gd['cible'] if gd else None, ensure_ascii=False)[:80] + ' | ' + str(e['onglet']) + ' ' + str(e['modal']); audit(pg, r, ou); respire(pg, r, ou)
                un_seul_lieu(pg, r)
                pg.mouse.click(pt['x'], pt['y']); pg.wait_for_timeout(260)
                agi = True; pas_total += 1
                if captures < 60 and pas_total % 3 == 0: captures += 1; pg.screenshot(path=f'{OUT}/{pas_total:03d}-{r}.png')
            # étapes faites pendant ce moment
            n = pg.evaluate("() => { var L = M.etapesMission(), Mi = (M.P() || {}).mission || {}; return L.filter(function(x, i){ return (Mi.faits || {})[i]; }).length + M.cle(M.P().bonus || {}).length; }")
            if n > vu_avant[r]:
                faits_au[(r, e['moment'])] = faits_au.get((r, e['moment']), 0) + (n - vu_avant[r]); vu_avant[r] = n
        if all((etat(J[r]) or {}).get('etape') == 'fin' for r in ROLES): break
        tours_vides = 0 if agi else tours_vides + 1
        if not agi: J['sage'].wait_for_timeout(1000)   # personne n'a rien à toucher : une fenêtre qui monte, un villageois qui parle… (machine chargée : on laisse le temps)
        if tours_vides >= 10:
            echecs.append('BLOQUÉ : plus personne ne peut avancer ' + json.dumps({r: g(J[r]) for r in ROLES}, ensure_ascii=False))
            for r in ROLES: J[r].screenshot(path=f'{OUT}/bloque-{r}.png')
            break
    print('Pas joués :', pas_total, '— tours :', tour + 1)
    for r in ROLES:   # (pour comprendre un échec : où en est chaque tablette qui n'a pas fini)
        if (etat(J[r]) or {}).get('etape') != 'fin':
            print('    pas fini,', r, ':', json.dumps(g(J[r]), ensure_ascii=False)[:500], '| écran :', etat(J[r]), '| rond :', rond(J[r])); J[r].screenshot(path=f'{OUT}/fin-{r}.png')
    for x in echecs: print('  ✗✗', x[:900])
    for l in journal[-12:]: print('   ', l)
    fins = {r: etat(J[r])['etape'] for r in ROLES}
    verif(all(v == 'fin' for v in fins.values()), f'les quatre tablettes arrivent à la fin de l\'enquête ({fins})')
    verif(J['sage'].evaluate("() => { var F = M.P().fin; return !!F && F.erreurs === 0; }"), 'le Sage a accusé juste du premier coup : Tim, au Vieux Chêne')
    pm = []
    for r in ROLES:
        t = [x for x in J[r].evaluate('() => window.__toasts') if 'Pas maintenant' in x or 'Pas encore' in x]
        if t: pm.append((r, t[:3]))
    verif(not pm, f'le bot n\'a jamais touché ce qui était hors du trajet (« Pas maintenant ») {pm}')
    # l'enquête 1 sans points d'action (Romain, 4 novembre, 14 h 13)
    att = sorted(set((t[0], t[2]) for t in textes if t[1] == 'attend'))
    # (Romain, 5 novembre, 23 h 32 : les attentes sont racontées) chacune nomme encore le rôle qui va apporter l'indice
    verif(bool(att) and all(re.search(r"Pisteur|Alchimiste|Barde|Sage", t[1]) and 'un équipier' not in t[1] for t in att), f'chaque attente nomme le rôle qui va donner le code ({len(att)} messages : {[x[1][:45] for x in att][:8]})')
    mom = sorted(set((t[0], t[2]) for t in textes if t[1] == 'moment'))
    verif(bool(mom) and all(('Le Sage a le code' in t[1]) if t[0] != 'sage' else ('Tous prêts ? Passe' in t[1]) for t in mom), f'la fin du moment, racontée : « Quelle matinée ! Le Sage a le code… » ({[x[1][:60] for x in mom][:6]})')
    verif(not any(re.search(r'\bactions?\b', ' '.join(t[2:]), re.I) for t in textes), f'aucun message du tutoriel ne parle d\'actions ({[t for t in textes if re.search(r"actions?", " ".join(t[2:]), re.I)][:3]})')
    verif(not actions_vues, f'rien à l\'écran ne parle d\'actions : ni pastilles, ni « · 1 action », ni page « Donner une action » ({actions_vues})')
    bon = [t for t in textes if t[3].startswith('✨')]
    verif(all(t[1] in ('attend', 'moment', 'fini') for t in bon), f'les missions bonus ne sont proposées que pendant une attente ({sorted(set(t[1] for t in bon))})')
    for r in ROLES:
        for m in range(3):
            verif(faits_au.get((r, m), 0) >= 1, f'{r} : au moins une étape faite pendant le moment {m} ({faits_au.get((r, m), 0)})')
    niv = {r: sorted(set(map(tuple, J[r].evaluate('() => window.__niveaux')))) for r in ROLES}
    verif(all(all(n == (3 if t == 'cachette' else 1) for t, n in niv[r]) for r in ROLES), f'tous les mini-jeux lancés au niveau 1 ({niv})')
    nv = {r: J[r].evaluate('() => M.niveau(M.S.xp).n') for r in ROLES}
    verif(all(v == 2 for v in nv.values()), f'tout le monde passe au niveau 2 ({nv})')

    # ---------- Enquête 2 : le talent du niveau 2 d'abord ----------
    S = J['sage']
    for r in ROLES:
        pg = J[r]
        for _ in range(12):
            if pg.is_visible('[data-act=fin-suite]'): pg.click('[data-act=fin-suite]', force=True); pg.wait_for_timeout(120)
    if not all(v == 'fin' for v in fins.values()):
        print('ÉCHECS :', echecs); print('ERREURS :', erreurs); b.close(); sys.exit(1)
    # Plus de code pour l'enquête suivante (Romain, 4 novembre, 20 h 41) : chacun touche le bouton « Enquête 2 » sur sa tablette
    for r in ROLES:
        pg = J[r]
        verif(pg.is_visible('[data-act=suite-sage]'), f'{r} : le bouton « Enquête 2 » à la fin (sans code)')
        verif(not pg.is_visible('.b-suite .b-pave'), f'{r} : plus de pavé de code pour l\'enquête suivante')
        pg.click('[data-act=suite-sage]', force=True); pg.wait_for_timeout(600)
    for r in ROLES:
        pg = J[r]
        if pg.is_visible('#voile .b-fermer'): pg.click('#voile .b-fermer', force=True)
        verif(pg.evaluate('() => M.P() && M.P().id') == 2, f'{r} : dans l\'enquête 2')
        if pg.is_visible('[data-act=commencer]'): pg.click('[data-act=commencer]', force=True); pg.wait_for_timeout(400)
        verif(pg.evaluate('() => M.tutoTalentForce()'), f'{r} E2 : le talent du niveau 2 est à choisir, tout est bloqué')
        pg.click('[data-act=onglet][data-o=carte]', force=True); pg.wait_for_timeout(200)
        verif(pg.evaluate("() => M.P().onglet") != 'carte' and any('Pas maintenant' in x for x in pg.evaluate('() => window.__toasts')), f'{r} E2 : l\'onglet Carte refuse (« Pas maintenant »)')
        chemin = []
        for _ in range(8):
            pt = rond_attendu(pg)
            if not pt: break
            chemin.append(pt['act'])
            pg.mouse.click(pt['x'], pt['y']); pg.wait_for_timeout(350)
            if pg.is_visible('#voile [data-act=talent]'): break
        n = pg.evaluate("() => [].filter.call(document.querySelectorAll('.tu-rond'), function(x){ return !x.hidden; }).length")
        verif(chemin[:2] == ['ecran', 'hr-arbre'], f'{r} E2 : rond sur le portrait, puis sur l\'arbre des talents ({chemin})')
        pg.click('#voile [data-act=talent]', force=True); pg.wait_for_timeout(300)
        if pg.is_visible('#voile .b-fermer'): pg.click('#voile .b-fermer', force=True)
        verif(not pg.evaluate('() => M.tutoTalentForce()') and pg.evaluate('() => M.S.talents.length') == 1, f'{r} E2 : un talent du niveau 2 choisi, tout se débloque')
        for _ in range(3):
            if pg.is_visible('#voile .b-fermer'): pg.click('#voile .b-fermer', force=True); pg.wait_for_timeout(200)
            if pg.evaluate("() => M.UI.ecran") != 'enquete' and pg.is_visible('[data-act=retour]'): pg.click('[data-act=retour]', force=True); pg.wait_for_timeout(300)
        verif(pg.evaluate("() => M.UI.ecran") == 'enquete', f'{r} E2 : « ← Retour » ramène à l\'enquête ({etat(pg)})')
        pg.click('[data-act=onglet][data-o=carte]', force=True); pg.wait_for_timeout(300)
        verif(pg.evaluate("() => M.P().onglet") == 'carte' and not pg.evaluate("() => [].some.call(document.querySelectorAll('.tu-bandeau, .tu-rond'), function(x){ return !!x.offsetParent || (!x.hidden && x.classList.contains('tu-rond')); })"), f'{r} E2 : ensuite, libre (pas de bandeau ni de rond)')
        pg.screenshot(path=f'{OUT}/e2-{r}.png')
    print('==== TEXTES du bandeau ====')
    vus_t = set()
    for t in sorted(textes):
        k = (t[2], t[3], t[4])
        if k in vus_t: continue
        vus_t.add(k); tout = ' '.join(x for x in k if x)
        print(len(tout), '|', t[0], t[1], '|', t[2], '||', t[3], '||', t[4])
    print('==== AUDIT des cadres jaunes ====')
    for k, v in sorted(VU.items(), key=lambda kv: (kv[0][2], kv[0][0])):
        print(('ANIMÉ   ' if k[2] else 'STATIQUE'), k[1], k[0], '| parent', v['par'], '| act', v['act'], '| x', v['n'], sorted(v['roles']), '| 1re fois :', v['ou'])
    print('==== BOUTONS QUI BOUGENT ====', RESP['ok'], 'oui ;', len(RESP['non']), 'non')
    for x in RESP['non']: print('  NE BOUGE PAS', x)
    print('ÉCHECS :', echecs)
    print('ERREURS :', erreurs)
    b.close()
