# Les vrais gestes au doigt (la vraie boucle), version 8 : l'extrait et le bouton jaune, le pouce gauche, les quatre boutons,
# les refus sans un mot (le bouton tremble, celui qui débloque clignote), les trois cartes dorées en simple appui, le bandage,
# la pause, « à terre » (on choisit sa vague, on y retrouve sa vie), la victoire.
# Et la règle du 25 novembre, 23 h : rien à lire. On relève tout ce qui est écrit à l'écran : jamais plus de trois mots d'affilée.
import time, json, sys
from playwright.sync_api import sync_playwright
from commun import ouvrir, SORTIE
def E(pg, s): return pg.evaluate(s)
ECRIT = """(()=>{const T=[];const w=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);let n;
  while(n=w.nextNode()){const t=n.textContent.trim(),el=n.parentElement;if(!t||!el||el.closest('script,style,.mesures'))continue;
    const r=el.getBoundingClientRect(),cs=getComputedStyle(el);if(!r.width||!r.height||cs.visibility==='hidden'||cs.display==='none')continue;
    let v=el,cache=false;while(v&&v!==document.body){const c=getComputedStyle(v);if(c.display==='none'||+c.opacity===0){cache=true;break;}v=v.parentElement;}
    if(!cache)T.push(t);}
  return T;})()"""
def mots(pg):
    T = E(pg, ECRIT); return max([len([m for m in t.split() if any(c.isalpha() for c in m)]) for t in T] or [0]), T      # (les chiffres et les signes ne se lisent pas)
with sync_playwright() as p:
    b, pg, errs, tc = ouvrir(p)
    ok = []
    def note(nom, v): ok.append((nom, bool(v))); print(('OK   ' if v else 'NON  ') + nom, flush=True)
    box = lambda sel: pg.locator(sel).bounding_box()
    cl = lambda i, c: E(pg, "document.getElementById('%s').classList.contains('%s')" % (i, c))
    # ---- avant de jouer : l'extrait, sans un mot
    time.sleep(1.0)
    note("avant de jouer : pas d'extrait (version 15), juste le bouton jaune à l'écran", E(pg, "__pt.etat().extrait") < 0 and box('#btnGo')['y'] + box('#btnGo')['height'] <= 390 and not E(pg, "document.getElementById('btnGo').disabled"))
    n, T = mots(pg); note("avant de jouer : rien à lire (le plus long texte à l'écran : %d mots) %s" % (n, T), n <= 3)
    note("plus de conteur, plus de bouton 🔊, plus de page d'explication", E(pg, "!document.getElementById('conteur')&&!document.querySelector('.hp,[data-lire],#regles p,#pRegles')"))
    pg.screenshot(path=SORTIE + '/t-extrait.png')
    pg.tap('#btnGo', force=True); time.sleep(0.5)
    note("le bouton jaune lance le combat : plus d'extrait, vague 1", E(pg, "__pt.etat().extrait") == -1 and E(pg, "__pt.etat().phase") == 'vague')
    # ---- une scène calme : deux rôdeurs loin, qui tournent le dos
    E(pg, "__pt.scene([13,15.5,-1.57],[{t:'chien',x:13,y:6,fa:-1.57,immobile:1},{t:'chien',x:14,y:6,fa:-1.57,immobile:1}]);__pt.figer(false)")
    time.sleep(0.4)
    cdp = pg.context.new_cdp_session(pg)
    def touch(kind, pts): cdp.send('Input.dispatchTouchEvent', {'type': kind, 'touchPoints': [{'x': x, 'y': y, 'id': i} for (x, y, i) in pts]})
    y0 = E(pg, "__pt.etat().P.y")
    touch('touchStart', [(150, 250, 1)]); time.sleep(0.05); touch('touchMove', [(150, 190, 1)]); time.sleep(0.6)
    y1 = E(pg, "__pt.etat().P.y"); note('le pouce gauche fait courir le Pisteur', y1 < y0 - 1)
    touch('touchEnd', []); time.sleep(0.2)
    def tap(sel):
        q = box(sel); touch('touchStart', [(q['x'] + q['width'] / 2, q['y'] + q['height'] / 2, 5)]); time.sleep(0.06); touch('touchEnd', [])
    n, T = mots(pg); note("en jeu : rien à lire (le plus long texte à l'écran : %d mots)" % n, n <= 3)
    tap('#b3'); time.sleep(0.12); note('le bouton 3 fait sauter', E(pg, "__pt.etat().P.etat") == 'saut'); time.sleep(0.5)
    tap('#b2'); time.sleep(0.1)
    note("à découvert, le bouton 2 (assommer) est gris : il tremble, et c'est le bouton d'ombre qui clignote", E(pg, "__pt.etat().P.etat") == 'libre' and cl('b2', 'vide') and cl('b2', 'non') and cl('b4', 'appel'))
    time.sleep(1.2); note('le tremblement et le clignotement s\'arrêtent tout seuls', not cl('b2', 'non') and not cl('b4', 'appel'))
    tap('#cCape'); time.sleep(0.1)
    note("à découvert, une carte dorée n'est pas dépensée : elle tremble, le bouton d'ombre clignote", E(pg, "__pt.etat().P.cartes.cape") == 1 and E(pg, "__pt.etat().P.capeT") == 0 and cl('cCape', 'non') and cl('b4', 'appel'))
    time.sleep(1.2)
    tap('#b1'); time.sleep(0.1); note('le bouton 1 donne un coup de dague', E(pg, "__pt.etat().P.etat") == 'dague'); time.sleep(0.8)
    note("le bouton d'ombre est allumé (personne ne le voit)", cl('b4', 'pret'))
    tap('#b4'); time.sleep(0.5); note("le bouton 4 fait entrer dans l'ombre", E(pg, "__pt.etat().P.ombre"))
    note("dans l'ombre, les quatre boutons ont changé (le 2 se rallume : assommer)", E(pg, "['b1','b2','b3','b4'].every(i=>document.getElementById(i).classList.contains('ombre'))&&document.getElementById('l1').textContent==='embuscade'&&document.getElementById('l2').textContent==='assommer'&&!document.getElementById('b2').classList.contains('vide')"))
    time.sleep(0.3); note('pas blessé : le bouton du bandage est gris', cl('b4', 'eteint'))
    tap('#b4'); time.sleep(0.1); note('pas blessé : le bandage ne part pas, le bouton tremble', E(pg, "__pt.etat().P.bandages") == 5 and cl('b4', 'non'))
    # ---- les cartes dorées : un simple appui, la marque dorée sur le golem visé
    E(pg, "__pt.ev('P.fa=-Math.PI/2')"); time.sleep(0.3)
    note("dans l'ombre, face aux rôdeurs : la flèche et le sifflet sont prêts, une marque dorée sur un rôdeur", cl('cFleche', 'pret') and cl('cSifflet', 'pret') and cl('cCape', 'pret') and E(pg, "__pt.etat().P.cibles.fleche") >= 0)
    pg.screenshot(path=SORTIE + '/t-cartes.png')
    tap('#cFleche'); time.sleep(0.3)
    note('un appui sur la flèche : un rôdeur dort, la carte est éteinte, on est toujours dans l\'ombre', E(pg, "__pt.etat().G.filter(g=>g.dort).length") == 1 and cl('cFleche', 'use') and E(pg, "__pt.etat().P.cartes.fleche") == 0 and E(pg, "__pt.etat().P.ombre"))
    tap('#cFleche'); time.sleep(0.2); note('une carte jouée ne rejoue pas', E(pg, "__pt.etat().G.filter(g=>g.dort).length") == 1)
    tap('#cSifflet'); time.sleep(0.3)
    note("un appui sur le sifflet : l'autre rôdeur part voir (celui qui dort reste)", E(pg, "__pt.etat().leurres.length") == 1 and E(pg, "__pt.etat().G.filter(g=>g.leurre).length") == 1 and cl('cSifflet', 'use'))
    tap('#cCape'); time.sleep(0.3)
    note("un appui sur la cape : dix secondes, la carte brille", 9 < E(pg, "__pt.etat().P.capeT") <= 10 and cl('cCape', 'active') and E(pg, "__pt.etat().P.cartes.cape") == 0)
    pg.screenshot(path=SORTIE + '/t-cape.png')
    time.sleep(2.6); note("l'ombre ne s'arrête plus toute seule (quatre secondes après, toujours dedans)", E(pg, "__pt.etat().P.ombre"))
    # ---- le bandage
    E(pg, "__pt.ev('P.hp=50')"); time.sleep(0.3)
    note('blessé : le bouton du bandage se rallume, avec le compteur à 5', E(pg, "!document.getElementById('b4').classList.contains('eteint')&&document.getElementById('nb4').textContent==='5'&&getComputedStyle(document.getElementById('nb4')).display!=='none'"))
    tap('#b4'); time.sleep(0.3); note("le bouton 4, dans l'ombre, pose un bandage", E(pg, "__pt.etat().P.etat") == 'bandage' and E(pg, "__pt.etat().P.bandages") == 4)
    x0 = E(pg, "__pt.etat().P.x"); touch('touchStart', [(150, 250, 1)]); time.sleep(0.05); touch('touchMove', [(210, 250, 1)]); time.sleep(1.2)
    note('pendant le bandage, le pouce gauche ne le fait pas bouger', abs(E(pg, "__pt.etat().P.x") - x0) < 0.01); pg.screenshot(path=SORTIE + '/t-bandage.png')
    touch('touchEnd', []); time.sleep(1.9)
    note('trois secondes plus tard : vingt points de plus, le compteur à 4', E(pg, "__pt.etat().P.hp") == 70 and E(pg, "document.getElementById('nb4').textContent") == '4')
    tap('#b1'); time.sleep(0.1); note("trop loin : l'embuscade ne part pas, on reste dans l'ombre, le bouton tremble", E(pg, "__pt.etat().P.ombre") and cl('b1', 'non'))
    # ---- la pause
    pg.tap('#bPause', force=True); time.sleep(0.3); note("la pause s'ouvre (sans « Revoir l'explication »)", E(pg, "__pt.etat().enPause") and E(pg, "!document.getElementById('pRegles')&&!!document.getElementById('pVague')")); pg.screenshot(path=SORTIE + '/t-pause.png')
    pg.tap('#pReprendre'); time.sleep(0.2); note('on reprend', not E(pg, "__pt.etat().enPause"))
    # ---- à terre : on choisit sa vague, on y retrouve la vie, les bandages et les cartes qu'on avait en la commençant
    E(pg, "__pt.demarrer(0)"); time.sleep(1.5); E(pg, "__pt.ev('P.hp=64;P.bandages=3;P.cartes.cape=0')"); E(pg, "__pt.suivant()"); time.sleep(6.5)
    note('la vague 2 a commencé avec 64 points de vie', E(pg, "__pt.etat().vague") == 1 and E(pg, "__pt.etat().sauves.length") == 2)
    E(pg, "__pt.ev('P.hp=1;blesserP(5,{nom:\"essai\"})')"); time.sleep(1.8)
    tuiles = E(pg, "Array.from(document.querySelectorAll('#finCarte [data-vague]')).map(b=>[b.textContent,b.classList.contains('anneau')])")
    note("à terre : deux tuiles jaunes (vague 1, vague 2), le rond jaune sur la vague 2, la vie et les bandages affichés %s" % tuiles, len(tuiles) == 2 and tuiles[1][1] and not tuiles[0][1] and '64' in tuiles[1][0] and '100' in tuiles[0][0] and E(pg, "!!document.querySelector('#fDebut')"))
    n, T = mots(pg); note("à terre : rien à lire (le plus long texte à l'écran : %d mots)" % n, n <= 3)
    pg.screenshot(path=SORTIE + '/t-defaite.png')
    pg.tap('#finCarte [data-vague="1"]', force=True); time.sleep(0.6)
    note('la tuile « Vague 2 » : on repart de la vague 2 avec 64 points, 3 bandages, sans la cape', E(pg, "__pt.etat().P.hp") == 64 and E(pg, "__pt.etat().etatJeu") == 'jeu' and E(pg, "__pt.etat().vague") == 1 and E(pg, "__pt.etat().P.bandages") == 3 and E(pg, "__pt.etat().P.cartes.cape") == 0 and E(pg, "__pt.etat().P.cartes.fleche") == 1)
    # ---- la pause : repartir d'une vague, sans être tombé
    pg.tap('#bPause', force=True); time.sleep(0.3); pg.tap('#pVague'); time.sleep(0.3)
    note('pause, « Repartir d\'une vague » : les mêmes tuiles, et un bouton « Retour »', E(pg, "document.querySelectorAll('#finCarte [data-vague]').length") == 2 and E(pg, "!!document.querySelector('#fRetour')"))
    pg.tap('#fRetour'); time.sleep(0.2); pg.tap('#pReprendre'); time.sleep(0.2)
    E(pg, "__pt.ev('P.hp=1;blesserP(5,{nom:\"essai\"})')"); time.sleep(1.8)
    pg.tap('#fDebut'); time.sleep(0.6); note('« Tout recommencer » : vague 1, la barre pleine, cinq bandages, trois cartes', E(pg, "__pt.etat().P.hp") == 100 and E(pg, "__pt.etat().vague") == 0 and E(pg, "__pt.etat().P.bandages") == 5 and E(pg, "__pt.etat().P.cartes.cape") == 1 and E(pg, "__pt.etat().sauves.length") == 1)
    # ---- la victoire
    E(pg, "__pt.demarrer(7)"); time.sleep(1.6); E(pg, "__pt.suivant()"); time.sleep(6.5)
    note("la dernière vague finie : l'écran de victoire, sans code (Romain a abandonné les codes entre les combats, Bible §15.9)", E(pg, "!!document.querySelector('#fRejouer')&&!document.querySelector('#finCarte .code')&&!document.querySelector('#finCarte p')")); pg.screenshot(path=SORTIE + '/t-victoire.png')
    print('ERREURS', errs[:8]); print('BILAN', sum(1 for _, v in ok if v), '/', len(ok))
    b.close()
