#!/usr/bin/env python3
"""Des captures de la maquette, sur téléphone et sur tablette : python3 tests/voir.py [dossier]
Chaque capture fige une scène (une attaque à mi-annonce, la danse, le code…) pour vérifier qu'on la comprend sans un mot."""
import sys, pathlib, json
from playwright.sync_api import sync_playwright
ici = pathlib.Path(__file__).resolve().parent.parent
page_url = (ici / 'phase2-devant.html').as_uri()
out = pathlib.Path(sys.argv[1] if len(sys.argv) > 1 else '/tmp/p2-captures'); out.mkdir(parents=True, exist_ok=True)

SCENES = {
 'f1-poing': "S.att={type:'poing',t:1.2,cote:'g',prep:1.7,fin:2.25}",
 'f1-poing-coup': "S.att={type:'poing',t:1.78,cote:'d',prep:1.7,fin:2.25}",
 'f1-souffle': "S.att={type:'souffle',t:1.3,prep:1.8,fin:3.1}",
 'f1-souffle-feu': "S.att={type:'souffle',t:2.2,prep:1.8,fin:3.1}",
 'f1-grosCoup': "S.att={type:'grosCoup',t:2.4,prep:3.5,fin:4.1}",
 'f1-reparateurs': "S.reps=[{x:L.solG+90,y:L.solBas-120,tx:L.W*0.36,ty:L.solHaut+10,ok:false},{x:L.W*0.64,y:L.solHaut+10,tx:L.W*0.64,ty:L.solHaut+10,ok:true}]",
 'f2-charge': "P2.aller(S,2); S.att={type:'charge',t:2.0,prep:0.8,fin:4.0,orGauche:true,couleur:'rouge'}; S.h.charge='rouge'",
 'f2-chaud': "P2.aller(S,2); S.att={type:'chaud',t:2.5,prep:1.2,fin:5.7}",
 'f2-froid': "P2.aller(S,2); S.att={type:'froid',t:2.0,prep:1.2,fin:5.7}",
 'f3-bouclier': "P2.aller(S,3); S.bouc.actif=3; S.tirs=[{x:210,y:400,x0:210,y0:600,tx:210,ty:L.bossTouche,k:0.3}]; S.renvois=[{x:200,y:450}]",
 'f3-poing': "P2.aller(S,3); S.att={type:'poing',t:0.9,cote:'d',prep:1.7,fin:2.25}",
 'bulle-symbole': "P2.symboleTout(S); S.reel+=0.6",
 'bulle-danse': "P2.symboleTout(S); S.reel+=3; S.danse.attente=0; S.danse.pos=2; S.danse.T=1.6; S.danse.t=0.7; S.h.x=L.solG+(L.solD-L.solG)*0.375",
 'bulle-explose': "P2.symboleTout(S); S.reel+=3; S.danse.attente=0; S.danse.pos=2; S.danse.T=1.6; S.danse.t=1.1; S.danse.explose=true; S.h.x=L.solG+(L.solD-L.solG)*0.375",
 'bulle-cri': "P2.symboleTout(S); S.reel+=3; S.danse.attente=0; S.danse.pos=0; S.danse.T=1.6; S.danse.t=0.3; P2.pisteurCrie(S); S.h.x=40",
 'bulle-code': "P2.symboleTout(S); S.reel+=3; S.danse.attente=0; S.danse.pos=0; S.danse.T=1.6; S.danse.t=0.3; P2.pisteurCrie(S); S.h.x=40; P2.ouvrirCode(S); P2.taper(S,S.cri[0]); S.code.ralenti=2.5",
 'bulle-mort': "P2.symboleTout(S); S.reel+=3; S.danse.attente=0; S.danse.pos=0; S.danse.T=1.6; S.code.bloque=7; P2.pisteurCrie(S)",
 'potion': "S.h.pv=30; P2.potion(S); S.h.potion=1.1",
 'faible': "S.reg.facon='faible'; S.pf.ouvert=true; S.pf.x=260; S.pf.t=3",
 'fin': "S.forme=3; S.phase='explose'; S.piece={forme:3,t:0.8}; S.vie=0",
}
APPAREILS = {
 'iphone': dict(viewport={'width': 390, 'height': 844}, device_scale_factor=2, is_mobile=True, has_touch=True),
 'ipad': dict(viewport={'width': 1180, 'height': 820}, device_scale_factor=1, is_mobile=True, has_touch=True),
}
erreurs = []
with sync_playwright() as p:
    b = p.chromium.launch(executable_path='/usr/bin/google-chrome', args=['--no-sandbox'])
    for nom, opts in APPAREILS.items():
        ctx = b.new_context(**opts); pg = ctx.new_page()
        pg.on('pageerror', lambda e: erreurs.append(str(e)))
        pg.goto(page_url); pg.wait_for_timeout(300)
        pg.screenshot(path=str(out / f'{nom}-00-debut.png'))
        pg.evaluate("__p2.demarrer()"); pg.wait_for_timeout(400)
        pg.screenshot(path=str(out / f'{nom}-01-depart.png'))
        for i, (sc, code) in enumerate(SCENES.items()):
            pg.evaluate("__p2.fige=false; __p2.nouvelle(); __p2.fige=true")
            pg.evaluate("(() => { const S=__p2.S, P2=__p2.P2, L=__p2.L; " + code + "; })()")
            pg.evaluate("__p2.fige=false"); pg.wait_for_timeout(40); pg.evaluate("__p2.fige=true"); pg.wait_for_timeout(60)
            pg.screenshot(path=str(out / f'{nom}-{i+2:02d}-{sc}.png'))
        pg.evaluate("__p2.fige=false; document.getElementById('bPause').click()"); pg.wait_for_timeout(150)
        pg.screenshot(path=str(out / f'{nom}-99-pause.png'), full_page=True)
        ctx.close()
    b.close()
print('captures dans', out, '| erreurs :', erreurs or 'aucune')
