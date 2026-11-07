"""Robot qui joue une enquête entière sur 4 écrans en explorant TOUT le contenu
(actions illimitées, mini-jeux court-circuités) pour débusquer les erreurs.
Usage : python3 tools/bot.py 2   (ou 1, 3 ; l'enquête 1 se joue sans le tutoriel guidé et sans points d'action)"""
import sys, os, json
from playwright.sync_api import sync_playwright
ICI = os.path.dirname(os.path.abspath(__file__))
URL = 'file://' + os.path.join(os.path.abspath(os.environ.get('BRUMEVAL_DIST') or os.path.join(ICI, '..', 'dist')), 'index.html')
N = int(sys.argv[1]) if len(sys.argv) > 1 else 1
OUT = os.path.join(ICI, '..', 'test', f'bot{N}')
os.makedirs(OUT, exist_ok=True)
erreurs = []
ROLES = ['pisteur', 'alchimiste', 'barde', 'sage']

def creer(b, role):
    pg = b.new_context(viewport={'width': 800, 'height': 1280}).new_page()
    pg.set_default_timeout(6000)
    pg.on('console', lambda m: erreurs.append(f'[{role}] {m.text}') if m.type == 'error' and 'ERR_TUNNEL' not in m.text else None)
    pg.on('pageerror', lambda e: erreurs.append(f'[{role}] PAGEERROR {e}'))
    if N == 1: pg.add_init_script('window.BRUMEVAL_SANS_TUTO = true')   # l'enquête 1 jouée librement (tools/tuto.py teste le tutoriel guidé)
    pg.goto(URL)
    pg.click('[data-act=creer]'); pg.click(f'[data-act=crea-role][data-r={role}]'); pg.click('[data-act=crea-suite]'); pg.fill('#nom', role); pg.click('[data-act=crea-fin]')
    if N > 1:
        # (l'accueil d'un héros débutant n'a plus de bouton Réglages, Romain 4 novembre : on ouvre les Réglages directement pour le Mode test)
        pg.evaluate("() => { M.UI.ecran = 'reglages'; M.render(); }"); pg.click(f'[data-act=mode-test][data-i="{N}"]'); pg.click('#voile [data-act=confirmer-oui]')
    if role == 'barde' and N > 1:
        # le nouveau Barde (barde.js) : à l'enquête 2, il a forcément un talent du niveau 2 ; les deux sont joués (pair : Tendre l'oreille, impair : Exige la vérité)
        tal = os.environ.get('BOT_TALENT_BARDE') or ('tendre' if N % 2 == 0 else 'exiger')
        pg.evaluate(f"() => {{ if(M.S.talents.indexOf('{tal}') < 0) M.S.talents.push('{tal}'); M.sauver(); }}")
    pg.click('[data-act=nouvelle-enquete]'); pg.click('[data-act=commencer]')
    pg.evaluate("""() => { MJ.lancer = function(el, type, params, fin){ window.__mj = (window.__mj||[]).concat([type]); setTimeout(function(){ fin({reussi:true, score:1, essais:1}); }, 20); return {arreter:function(){}}; }; }""")
    return pg

JS_OUTILS = """
window.__bot = {
  ev: function(act, data){ var el = {dataset:data || {}}; M.A[act](el); },
  fermer: function(){ UI = M.UI; UI.modal = null; M.render(); },
  plein: function(){ M.P().actions = 99; },
};
"""

def ev(pg, act, data):
    pg.evaluate(f"() => {{ M.A['{act}']({{dataset:{json.dumps(data)}}}); }}")
    pg.wait_for_timeout(60)

def fermer(pg):
    pg.evaluate("() => { M.UI.modal = null; M.render(); }")

def plein(pg):
    pg.evaluate("() => { M.P().actions = 99; M.sauver(); }")

def donner(pg_src, roles_pages):
    """Transmet tous les codes que ce joueur a trouvés."""
    codes = pg_src.evaluate("""() => { var P = M.P(); return Object.keys(P.objets).map(function(id){ var c = id.charAt(0) === '_' ? id.slice(1) : 'obj:' + id; var d = M.destinataire(c); return [c, Array.isArray(d) ? d[0] : d, M.code(c)]; }); }""")
    for c, dest, seq in codes:
        if dest in roles_pages:
            entrer(roles_pages[dest], seq)
        elif dest == 'tous':  # plan, chemin, passage : toute l'équipe le tape
            for pg in roles_pages.values():
                if pg != pg_src: entrer(pg, seq)

def entrer(pg, seq):
    for s in seq:
        ev(pg, 'sym', {'s': s})
    pg.wait_for_timeout(350)
    fermer(pg)

with sync_playwright() as p:
    b = p.chromium.launch()
    J = {r: creer(b, r) for r in ROLES}
    E = J['sage'].evaluate('() => ({moments:M.E().moments, sol:M.E().solution})')
    for m in range(len(E['moments'])):
        for _ in range(2):  # deux passes pour profiter des codes reçus
            for r in ROLES: plein(J[r])
            # Pisteur
            P = J['pisteur']
            lieux = P.evaluate("() => M.cle(M.E().lieux).filter(function(l){ return !M.verrouLieu(l) && M.pointsVisibles(l, 'pisteur').length; })")
            for l in lieux:
                # sous terre (souterrains.js), fouiller ne coûte aucune action au Pisteur ; ailleurs, une action ; l'enquête 1 n'a pas de points d'action (M.sansActions)
                a0, sous, sans = P.evaluate(f"() => [M.P().actions, !!(M.fouilleGratuite && M.fouilleGratuite('{l}')), M.sansActions()]")
                ev(P, 'explorer', {'id': l})
                a1 = P.evaluate("() => M.P().actions")
                if a1 != (a0 if sous or sans else a0 - 1): erreurs.append(f'[pisteur] explorer {l} : actions {a0} → {a1} (sous terre : {sous}, sans actions : {sans})')
                elif sous: print(f'  fouille sous terre sans action : {l}')
                pts = P.evaluate(f"() => M.pointsVisibles('{l}', 'pisteur').filter(function(p){{ return M.P().vus['pisteur:{l}:' + p.id] !== 'ok' && M.besoinOk(p.besoin); }}).map(function(p){{ return p.id; }})")
                for pt in pts:
                    ev(P, 'point', {'l': l, 'id': pt}); P.wait_for_timeout(120)
                    if P.evaluate("() => M.UI.modal && M.UI.modal.type === 'boire-mj'"):
                        ev(P, 'mj-potion', {'id': ''}); P.wait_for_timeout(120)
                    if P.evaluate("() => M.UI.modal && M.UI.modal.type === 'auto-mj'"):
                        ev(P, 'mj-auto', {'oui': ''}); P.wait_for_timeout(120)
                fermer(P)
            # Sage
            S = J['sage']
            lieux = S.evaluate("() => M.cle(M.E().lieux).filter(function(l){ return !M.verrouLieu(l) && M.pointsVisibles(l, 'sage').length; })")
            for l in lieux:
                ev(S, 'explorer', {'id': l})
                for pt in S.evaluate(f"() => M.pointsVisibles('{l}', 'sage').map(function(p){{ return p.id; }})"):
                    ev(S, 'point', {'l': l, 'id': pt}); S.wait_for_timeout(120)
                fermer(S)
            pages = S.evaluate("() => (M.E().pages || []).filter(function(p){ return !M.P().pages[p.id] && (p.besoin || p.action || p.mj) && M.besoinOk(p.besoin); }).map(function(p){ return p.id; })")
            for pg_id in S.evaluate("() => (M.E().pages || []).map(function(p){ return p.id; })"):
                ev(S, 'page', {'id': pg_id})
            for pg_id in pages:
                ev(S, 'ouvrir-page', {'id': pg_id}); S.wait_for_timeout(150); fermer(S)
            # Barde
            B = J['barde']
            gens = B.evaluate("() => { var E = M.E(), mid = M.momentId(); return M.cle(E.pnj).filter(function(id){ return E.pnj[id].ou && E.pnj[id].ou[mid]; }).map(function(id){ return [id, E.pnj[id].ou[mid]]; }); }")
            for pid, ou in gens:
                if ou[0] in 'LFB' and ou[1:].isdigit():
                    ev(B, 'frapper', {'id': ou})
                else:
                    ev(B, 'parler', {'id': pid})
                n = B.evaluate(f"() => M.E().pnj['{pid}'].questions.length")
                for i in range(n):
                    ok = B.evaluate(f"() => {{ var q = M.E().pnj['{pid}'].questions[{i}]; return !M.P().vus['barde:{pid}:{i}'] && M.besoinOk(q.besoin); }}")
                    if ok:
                        ev(B, 'question', {'p': pid, 'i': str(i)})
                        # le 🤥 seulement juste après la réponse (Romain, 5 novembre, 21 h 46)
                        if B.evaluate(f"() => !!M.E().pnj['{pid}'].questions[{i}].ment && M.P().vus['barde:{pid}:{i}'] === 'ok' && !M.P().vus['verite:{pid}:{i}']"):
                            ev(B, 'bd-ment', {'p': pid, 'i': str(i)})
                        fermer(B)
                # « J'exige la vérité » s'il a le talent
                if B.evaluate("() => M.fxSomme('verite') > ((M.P().usages || {}).verite || 0)"):
                    ev(B, 'bd-exiger', {'p': pid})
                fermer(B)
            # Tendre l'oreille (talent) : partout où une bribe est là, en ce moment
            for bid in B.evaluate("() => (M.E().bribes || []).filter(function(b){ return M.momentOk(b.moments) && !(M.P().trous || {})['oreille:' + b.id]; }).map(function(b){ return b.id; })"):
                if B.evaluate("() => M.barde.oreillesReste()") > 0:
                    ev(B, 'bd-oreille', {'id': bid}); fermer(B)
            B.evaluate("() => { var P = M.P(); ['invisibilite'].forEach(function(k){ if(P.potions[k] > 0 && (M.E().ecoutes || []).some(function(x){ return M.momentOk(x.moments) && !P.vus['ecoute:' + x.id]; })){ P.potions[k]--; P.bues[k] = P.moment; } }); }")
            ec = B.evaluate("() => (M.E().ecoutes || []).filter(function(x){ return M.momentOk(x.moments) && !M.P().vus['ecoute:' + x.id] && M.besoinOk(x.besoin); }).map(function(x){ return x.id; })")
            for x in ec:
                ev(B, 'ecouter', {'id': x}); B.wait_for_timeout(150)
                # dépositions : une scène dans la feuille ; le robot montre le menteur (comme il réussit les mini-jeux)
                w = B.evaluate(f"() => {{ var x = M.E().ecoutes.filter(function(e){{ return e.id === '{x}'; }})[0]; return x.mj === 'depositions' ? x.params.depositions.findIndex(function(d){{ return d.ment; }}) : -1; }}")
                if w >= 0: ev(B, 'bd-dep', {'s': x, 'w': str(w)})
                fermer(B)
            # les phrases à trous du Carnet : le robot les remplit juste (on ne lui dit jamais si c'est juste)
            B.evaluate("() => { var P = M.P(); Object.keys(P.trous || {}).forEach(function(k){ var q = k.split(':'), E = M.E(), src = q[0] === 'ecoute' ? E.ecoutes.filter(function(x){ return x.id === q[1]; })[0] : q[0] === 'oreille' ? E.bribes.filter(function(x){ return x.id === q[1]; })[0] : null; if(!src) return; var ph = (src.params || src).phrases, n = 0; ph.forEach(function(l){ (l.texte.match(/\\[([^\\]]+)\\]/g) || []).forEach(function(m){ P.trous[k].poses[n++] = m.slice(1, -1); }); }); }); M.sauver(); }")
            if B.locator('body').count(): B.evaluate("() => { M.UI.modal = null; M.P().onglet = 'carnet'; M.render(); }"); B.wait_for_timeout(100)
            # Alchimiste : cueillir partout, fabriquer lumière + invisibilité + (secrètes), analyser
            A = J['alchimiste']
            lieux = A.evaluate("() => M.cle(M.E().lieux).filter(function(l){ return !M.verrouLieu(l) && M.cueilletteIci(l).length && M.P().vus['cueilli:' + l] !== M.P().moment; })")
            for l in lieux:
                ev(A, 'cueillir', {'id': l}); fermer(A)
            for r in A.evaluate("() => M.recettesConnues()"):
                seq = A.evaluate(f"() => {{ var l = []; DONNEES.RECETTES['{r}'].ingr.forEach(function(x){{ for(var i = 0; i < x[1]; i++) l.push(x[0]); }}); return l; }}")
                # l'atelier interactif se joue au doigt : on simule une préparation réussie (ingrédients retirés, fiole, action)
                A.evaluate(f"""() => {{ var c = {{}}; {json.dumps(seq)}.forEach(function(i){{ c[i] = (c[i] || 0) + 1; }});
                  var dispo = M.ingr(), P = M.P();
                  if(!(M.S.fioles > 0 && M.peutAgir() && Object.keys(c).every(function(k){{ return (dispo[k] || 0) >= c[k]; }}) && !(M.S.potions['{r}'] > 0))) return false;
                  Object.keys(c).forEach(function(k){{ Atelier.retirer(M.S.atelier, k, c[k]); }});
                  M.depenser(); M.S.fioles--; M.S.potions['{r}'] = (M.S.potions['{r}'] || 0) + 1 + M.fxSomme('doses'); M.sauver(); M.render(); return true; }}""")
            pots = A.evaluate("() => M.cle(M.S.potions).filter(function(k){ return M.S.potions[k] > 0; })")
            for k in pots:
                dests = A.evaluate(f"() => DONNEES.POTIONS['{k}'].pour")
                seq = A.evaluate(f"() => M.code('pot:{k}')")
                for d in dests:
                    if A.evaluate(f"() => M.S.potions['{k}'] > 0"):
                        ev(A, 'potion-donnee', {'id': k}); entrer(J[d], seq)
            # échanges de codes
            for r in ROLES: donner(J[r], J)
            for o in A.evaluate("() => M.cle(M.P().recus).filter(function(k){ return k.indexOf('obj:') === 0 && !M.P().analyses[k.slice(4)]; }).map(function(k){ return k.slice(4); })"):
                ev(A, 'analyser', {'id': o}); A.wait_for_timeout(150); fermer(A)
            # boire les potions d'accès (lumière)
            for r in ROLES:
                J[r].evaluate("() => { var P = M.P(); Object.keys(P.potions).forEach(function(k){ var p = DONNEES.POTIONS[k]; if(P.potions[k] > 0 && (p.fx.acces || []).indexOf('sombre') >= 0 && !P.bues[k]){ P.potions[k]--; P.bues[k] = P.moment; } }); }")
        for r in ROLES:
            J[r].screenshot(path=f'{OUT}/m{m}-{r}.png')
        if m < len(E['moments']) - 1:
            seq = J['sage'].evaluate(f"() => M.code('moment:{m + 1}')")
            ev(J['sage'], 'passer-moment', {}); fermer(J['sage'])
            for r in ROLES[:3]: entrer(J[r], seq)
    # Bilan : quelles sources de faits ont été obtenues ?
    S = J['sage']
    manque = []
    faits = S.evaluate("() => M.E().faits")
    vus = {r: J[r].evaluate("() => { var P = M.P(); var l = Object.keys(P.vus).filter(function(k){ return P.vus[k] === 'ok' || P.vus[k] === 1; }); Object.keys(P.pages).forEach(function(k){ l.push('sage:page:' + k); }); Object.keys(P.analyses).forEach(function(k){ l.push('alchimiste:analyse:' + k); }); Object.keys(P.vus).filter(function(k){ return k.indexOf('ecoute:') === 0; }).forEach(function(k){ l.push('barde:' + k); }); (M.E().pages||[]).forEach(function(p){ if(!p.besoin && !p.action && !p.mj) l.push('sage:page:' + p.id); }); Object.keys(P.trous || {}).forEach(function(k){ if(k.indexOf('oreille:') === 0) l.push('barde:' + k); }); Object.keys(P.vus).forEach(function(k){ var q = k.split(':'); if(q[0] === 'verite') l.push('barde:' + q[1] + ':' + q[2] + ':verite'); }); return l; }") for r in ROLES}
    tous = set(sum(vus.values(), []))
    for f in faits:
        for s in f['sources']:
            alts = s if isinstance(s, list) else [s]
            if not any(a in tous for a in alts): manque.append(alts)
    print('Sources manquantes :', manque)
    # Accusation
    sol = E['sol']
    # (plus de verrou de l'accusation ni de petit matin, Romain, 5 novembre, 01 h 36 : le Sage accuse quand il veut)
    ev(S, 'accuser', {})
    for k in ['qui', 'ou', 'quoi', 'pourquoi']:
        if k in sol: ev(S, 'acc-choix', {'k': k, 'v': sol[k]})
    ev(S, 'acc-valider', {}); S.wait_for_timeout(200)
    S.screenshot(path=f'{OUT}/victoire.png')
    vic = S.evaluate("() => M.code('victoire:0')")
    ev(S, 'fin-sage', {'n': '0'})
    for r in ROLES[:3]: entrer(J[r], vic)
    for r in ROLES:
        for i in range(10):
            if J[r].evaluate("() => M.P() && M.P().fin && M.P().fin.etape === 'histoire'"): ev(J[r], 'fin-suite', {})
        J[r].screenshot(path=f'{OUT}/fin-{r}.png', full_page=True)
    print('Mini-jeux lancés :', {r: J[r].evaluate('() => window.__mj || []') for r in ROLES})
    print('XP/or/prochaine :', {r: J[r].evaluate('() => [M.S.xp, M.S.or, M.S.prochaine]') for r in ROLES})
    print('ERREURS :', erreurs)
    b.close()
