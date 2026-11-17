#!/usr/bin/env python3
"""LES PASSAGES OBLIGATOIRES (Romain, 17 novembre, 7 h 10 : « les codes où il n'y a qu'une seule passerelle […] il faut les mettre avec un rond
jaune pour éviter qu'un des quatre personnages oublie. […] montre-le explicitement sur la carte, de façon gratuite. C'est valable pour les
quatre personnages. »)
Pour chaque rôle : le rond jaune de la carte apparaît là où attend une étape obligatoire (M.obligesCarte, carte.js), seulement quand elle est
faisable, et s'en va quand elle est faite ; les codes obligatoires portent l'anneau jaune (M.codeHTML) ; les autres, non.
  BRUMEVAL_DIST=<dossier construit> python3 tools/e3-obliges.py"""
import os, sys
from playwright.sync_api import sync_playwright
ICI = os.path.dirname(os.path.abspath(__file__))
tete = open(os.path.join(ICI, 'e3-secret.py'), encoding='utf-8').read().split("with sync_playwright() as p:")[0]
erreurs, echecs = [], []
exec(tete)
OUT = os.path.join(ICI, '..', 'test', 'e3-obliges'); os.makedirs(OUT, exist_ok=True)

def ob(pg):
    return pg.evaluate("() => { var o = M.obligesCarte(); return {lieux:o.lieux.slice().sort(), maisons:o.maisons.slice().sort()}; }")
def carte(pg):
    pg.evaluate("() => { M.UI.modal = null; M.P().onglet = 'carte'; M.render(); }"); pg.wait_for_timeout(900)
def moment(pg, n):
    pg.evaluate("(n) => { M.UI.modal = null; M.P().moment = n; M.sauver(); M.render(); }", n); pg.wait_for_timeout(300)
def ronds(pg):
    """les ronds jaunes dessinés sur la carte : ceux des lieux (ca-actif) et ceux des maisons (ca-oblige)"""
    return pg.evaluate("""() => ({lieux:[].map.call(document.querySelectorAll('#carte-ici .ca-lieu.ca-actif, .ca-carte .ca-lieu.ca-actif'), function(g){ return g.dataset.lieu; }).filter(function(x, i, l){ return l.indexOf(x) === i; }).sort(),
      maisons:document.querySelectorAll('.ca-oblige').length})""")
def recu(pg, c):
    pg.evaluate("(c) => { M.P().recus[c] = true; M.sauver(); M.render(); }", c); pg.wait_for_timeout(200)
def vu(pg, k, v='ok'):
    pg.evaluate("([k, v]) => { M.P().vus[k] = v; M.sauver(); M.render(); }", [k, v]); pg.wait_for_timeout(200)

with sync_playwright() as p:
    b = p.chromium.launch()

    print('— Le Pisteur')
    pg = debut(b, 'pisteur', TAB)
    carte(pg)
    verifier(ob(pg) == {'lieux': [], 'maisons': []} and ronds(pg) == {'lieux': [], 'maisons': 0}, f'le matin : rien d\'obligatoire, aucun rond jaune ({ob(pg)}, {ronds(pg)})')
    moment(pg, 1); carte(pg)
    verifier(ob(pg) == {'lieux': [], 'maisons': ['L2']} and ronds(pg)['maisons'] == 1, f'l\'après-midi : le rond jaune sur la maison d\'Odette (les traces de Moustache) ({ob(pg)}, {ronds(pg)})')
    shot(pg, 'pisteur-apresmidi')
    vu(pg, 'pisteur:L2:traces'); carte(pg)
    verifier(ob(pg)['maisons'] == [] and ronds(pg)['maisons'] == 0, 'les traces suivies : le rond jaune s\'en va')
    h = pg.evaluate("() => M.codeHTML(M.code('info:crypte_fermee'))")
    verifier('b-code-oblige' in h, 'son code « Odette est sous l\'église » porte l\'anneau jaune')
    verifier('b-code-oblige' not in pg.evaluate("() => M.codeHTML(M.code('obj:vieux_plan'))") and 'b-code-oblige' not in pg.evaluate("() => M.codeHTML(M.code('moment:1'))"), 'un code qui n\'est pas obligatoire (le vieux plan, l\'heure) : pas d\'anneau')
    moment(pg, 2); carte(pg)
    verifier(ob(pg) == {'lieux': [], 'maisons': []}, f'la nuit, sans le code du Barde : rien à faire au clocher, pas de rond ({ob(pg)})')
    recu(pg, 'info:cle_clou'); carte(pg)
    verifier(ob(pg)['lieux'] == ['clocher'] and 'clocher' in ronds(pg)['lieux'], f'avec « La Grosse Marie sonne » : le rond jaune sur le clocher (la clé d\'Anselme) ({ob(pg)}, {ronds(pg)})')
    shot(pg, 'pisteur-nuit-clocher')
    vu(pg, 'pisteur:clocher:cle'); carte(pg)
    verifier(ob(pg)['lieux'] == ['clocher'], f'la clé prise : le clocher garde son rond (la grille de la crypte) ({ob(pg)})')
    vu(pg, 'pisteur:clocher:crypte'); carte(pg)
    verifier(ob(pg)['lieux'] == ['clocher'], 'devant la grille : encore le clocher (tirer, pousser ou soulever : un des trois)')
    vu(pg, 'pisteur:clocher:soulever'); carte(pg)
    verifier(ob(pg)['lieux'] == ['clocher'], 'la grille soulevée : encore le clocher (descendre)')
    vu(pg, 'pisteur:clocher:descendre'); carte(pg)
    verifier(ob(pg)['lieux'] == [], 'descendu : plus de rond')
    verifier('b-code-oblige' in pg.evaluate("() => M.codeHTML(M.code('info:on_descend'))"), 'le code du départ, « On descend » : l\'anneau jaune')
    pg.context.close()
    # la clé ratée : les traces jusqu'au puits, puis le puits
    pg = debut(b, 'pisteur', TAB); moment(pg, 2); recu(pg, 'info:cle_clou'); vu(pg, 'pisteur:clocher:cle', 'rate'); carte(pg)
    verifier(ob(pg)['lieux'] == ['clocher'], f'la clé ratée : le clocher garde son rond (les traces de Moustache vers le puits) ({ob(pg)})')
    vu(pg, 'pisteur:clocher:traces_puits'); carte(pg)
    verifier(ob(pg)['lieux'] == ['puits'] and 'puits' in ronds(pg)['lieux'], f'les traces suivies : le rond jaune passe au vieux puits ({ob(pg)}, {ronds(pg)})')
    shot(pg, 'pisteur-nuit-puits')
    pg.context.close()

    print('— Le Barde')
    pg = debut(b, 'barde', TAB)
    moment(pg, 0); carte(pg)
    verifier(ob(pg) == {'lieux': [], 'maisons': ['L2']} and ronds(pg)['maisons'] == 1, f'le matin : le rond jaune sur la maison d\'Odette (poser sa canne) ({ob(pg)}, {ronds(pg)})')
    shot(pg, 'barde-matin')
    vu(pg, 'barde:voisin:0'); carte(pg)
    verifier(ob(pg) == {'lieux': [], 'maisons': []} and ronds(pg)['maisons'] == 0, f'la canne posée : le rond jaune s\'en va ({ob(pg)}, {ronds(pg)})')
    moment(pg, 1); carte(pg)
    verifier(ob(pg) == {'lieux': [], 'maisons': []}, f'l\'après-midi : rien d\'obligatoire pour lui ({ob(pg)})')
    moment(pg, 2); carte(pg)
    verifier(ob(pg) == {'lieux': [], 'maisons': []}, f'la nuit, sans le code du Pisteur : pas de rond ({ob(pg)})')
    recu(pg, 'info:crypte_fermee'); carte(pg)
    o = ob(pg)
    verifier(sorted(o['lieux']) == ['clocher', 'place'] and 'place' in ronds(pg)['lieux'], f'avec « Odette est sous l\'église », mais sans l\'aveu de Mélusine et sans avoir tout demandé à Anselme : le rond jaune chez ceux qu\'il faut voir d\'abord (la fête, le clocher) ({o}, {ronds(pg)})')
    shot(pg, 'barde-nuit-avant')
    pg.evaluate("() => { var P = M.P(), E = M.E(); P.vus['fete:filet:melusine'] = 1; (E.pnj.anselme.questions || []).forEach(function(q, i){ if(!q.grand) P.vus['barde:anselme:' + i] = 1; }); M.sauver(); M.render(); }"); carte(pg)
    o = ob(pg)
    verifier(o['lieux'] == ['clocher'] and 'clocher' in ronds(pg)['lieux'], f'Mélusine a avoué, Anselme a tout dit : le rond jaune sur le clocher seul (aider Anselme à sonner) ({o}, {ronds(pg)})')
    shot(pg, 'barde-nuit')
    pg.evaluate("() => { var P = M.P(); P.grands = P.grands || {}; P.grands.cle = {e:9, vus:{}, r:'', fini:'ok', essais:1, ok:1}; M.sauver(); M.render(); }"); carte(pg)
    verifier(ob(pg)['lieux'] == [], 'la Grosse Marie a sonné : le rond s\'en va')
    verifier('b-code-oblige' in pg.evaluate("() => M.codeHTML(M.code('info:cle_clou'))") and 'b-code-oblige' in pg.evaluate("() => M.codeHTML(M.code('info:vieux_puits'))"), 'ses deux codes pour le Pisteur (la cloche, ou le vieux puits) : l\'anneau jaune')
    verifier('b-code-oblige' not in pg.evaluate("() => M.codeHTML(M.code('info:plan_nuit'))") and 'b-code-oblige' not in pg.evaluate("() => M.codeHTML(M.code('obj:herbier'))"), 'le plan et l\'herbier (des aides, pas des verrous) : pas d\'anneau')
    pg.context.close()

    print('— L\'Alchimiste')
    pg = debut(b, 'alchimiste', TAB); carte(pg)
    verifier(ob(pg) == {'lieux': [], 'maisons': []}, f'le matin : rien d\'obligatoire ({ob(pg)})')
    moment(pg, 1); carte(pg)
    verifier(ob(pg)['lieux'] == ['clocher'] and 'clocher' in ronds(pg)['lieux'], f'l\'après-midi : le rond jaune sur le clocher (monter voir Anselme : sans Bertille, la brume reste) ({ob(pg)}, {ronds(pg)})')
    shot(pg, 'alchimiste-apresmidi')
    vu(pg, 'alchimiste:clocher:bertille', 1); carte(pg)
    verifier(ob(pg)['lieux'] == [], 'Bertille a sonné : le rond s\'en va (les sept plantes restent l\'énigme de l\'herbier : pas de rond dessus)')
    verifier(pg.evaluate("() => M.codeOblige(M.code(M.allureCode()))") is True, 'son code d\'allure (le sac de potions pour le Pisteur) : l\'anneau jaune')
    pg.context.close()

    print('— Le Sage (téléphone tenu droit)')
    pg = debut(b, 'sage', TEL)
    for n in (0, 1, 2):
        moment(pg, n)
        verifier(ob(pg) == {'lieux': [], 'maisons': []}, f'moment {n} : rien sur sa carte')
    verifier(pg.evaluate("() => M.codeOblige(M.code(M.allureCode()))") is True, 'son code d\'allure pour le Pisteur : l\'anneau jaune')
    recu(pg, 'info:on_descend')
    pg.evaluate("() => { M.P().onglet = 'role'; M.UI.modal = null; M.render(); M.livreAller('tenue', true); }"); pg.wait_for_timeout(600)
    n = pg.locator('#livre-ici .lv-page.on .b-code.b-code-oblige').count()
    verifier(n >= 1, f'sur sa page « Ma tenue de combat » : son code est entouré de l\'anneau jaune ({n})')
    shot(pg, 'sage-tenue')
    pg.context.close()
    b.close()

print('\nErreurs de page :', erreurs if erreurs else 'aucune')
print('Vérifications ratées :', echecs if echecs else 'aucune')
sys.exit(1 if (erreurs or echecs) else 0)
