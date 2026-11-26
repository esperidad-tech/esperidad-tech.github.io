#!/usr/bin/env python3
"""Des captures de chaque scène (version 2), sur téléphone couché et sur tablette : python3 tests/voir.py [dossier]"""
import sys, pathlib
from playwright.sync_api import sync_playwright
ici = pathlib.Path(__file__).resolve().parent.parent
url = (ici / 'phase2-devant.html').as_uri()
out = pathlib.Path(sys.argv[1] if len(sys.argv) > 1 else '/tmp/p2v2'); out.mkdir(parents=True, exist_ok=True)
SCENES = {
 't1-crepite': "S.crepite={cote:'g',t:2.2}; S.colonnes=[{x:9,y:6,nee:-9},{x:11,y:4,nee:-9}]",
 't1-ombres': "S.ombres=[{x:3,y:4,t:1.2},{x:6,y:7,t:1.2},{x:9,y:5,t:1.2},{x:11,y:8,t:1.2},{x:4,y:8.5,t:1.2},{x:12,y:3.5,t:1.2}]",
 't1-vague-annonce': "S.colonnes=[{x:4,y:5,nee:-9},{x:9,y:6,nee:-9},{x:6,y:8,nee:-9}]; S.forcer='vague'; S.prochaine=0; P2.pas(S,0.02); S.vague.t=1.4",
 't1-vague': "S.colonnes=[{x:4,y:5,nee:-9},{x:9,y:6,nee:-9},{x:6,y:8,nee:-9}]; S.forcer='vague'; S.prochaine=0; P2.pas(S,0.02); S.vague.t=3.0; var a=S.vague.abris[1]; S.h.x=a.x; S.h.y=a.y",
 't1-reparateurs': "S.reps=[{x:2.5,y:5.5},{x:11,y:4.5}]; S.cible=S.reps[0]; S.h.lance={quoi:'glace',t:0.9,dur:1.5}; S.tirs=[{x:6,y:7,quoi:'feu'}]",
 't2-givre': "P2.aller(S,2); S.main={type:'givre',t:5,cx:7,cy:8}; S.ombres=[{x:4,y:6,t:1.0},{x:10,y:7,t:1.0}]; S.h.lance={quoi:'feu',t:1.5,dur:3}",
 't2-braise': "P2.aller(S,2); S.main={type:'braise',t:3,cx:6,cy:7}; S.colonnes=[{x:10,y:6,nee:-9}]",
 't2-orbe': "P2.aller(S,2); S.orbe={x:5,y:3.2,couleur:'rouge',t:6,porte:false}; S.colonnes=[{x:9,y:5,nee:-9},{x:3,y:7,nee:-9}]",
 't2-orbe-portee': "P2.aller(S,2); S.orbe={x:7,y:8,couleur:'or',t:4,porte:true}; S.h.orbe=S.orbe; S.h.x=3; S.h.y=6.5; S.h.bonus=0",
 't3-doigts': "P2.aller(S,3); S.doigts=[{lignes:[0.5,1.02,1.54,2.06,2.58],t:1.5}]; S.crevasses=[{ax:3,ay:6,bx:6,by:8.5}]",
 't3-rayon': "P2.aller(S,3); S.rayon={couleur:'or',t:5,coupe:false}; var L=P2.REG.lanternes.or; S.h.x=(L[0]+7)/2; S.h.y=(L[1]+0.9)/2+0.3; S.coque={pv:30,t:4}",
 't3-danse': "P2.aller(S,3); S.danse={t:3,k:2,st:1.0,motif:[0,1,2,3,4,3,2,1,0],explose:false}; S.crevasses=[{ax:9,ay:5,bx:12,by:8}]",
 'bulle-cri': "P2.symboleTout(S); S.reel+=3; P2.pisteurCrie(S)",
 'bulle-code': "P2.symboleTout(S); S.reel+=3; P2.pisteurCrie(S); P2.ouvrirCode(S); P2.taper(S,S.cri[0]); S.code.ralenti=2.5",
 'mort': "S.h.pv=0; S.h.mort=6.5; S.vie=640",
 'bas-vie': "S.h.pv=55; S.h.bonus=8",
}
APP = {'telephone': dict(viewport={'width': 844, 'height': 390}, device_scale_factor=2, is_mobile=True, has_touch=True),
       'tablette': dict(viewport={'width': 1180, 'height': 820}, device_scale_factor=1, is_mobile=True, has_touch=True)}
err = []
with sync_playwright() as p:
    b = p.chromium.launch(executable_path='/usr/bin/google-chrome', args=['--no-sandbox'])
    for nom, o in APP.items():
        ctx = b.new_context(**o); pg = ctx.new_page(); pg.on('pageerror', lambda e: err.append(str(e)))
        pg.goto(url); pg.wait_for_timeout(300); pg.screenshot(path=str(out / f'{nom}-00-debut.png'))
        pg.evaluate("__p2.demarrer()"); pg.wait_for_timeout(300); pg.screenshot(path=str(out / f'{nom}-01-depart.png'))
        for i, (sc, code) in enumerate(SCENES.items()):
            pg.evaluate("__p2.fige=false; __p2.nouvelle(); __p2.fige=true")
            pg.evaluate("(() => { const S=__p2.S, P2=__p2.P2; S.prochaine=999; S.t3={rayon:999,coque:999,danse:999,crev:999}; " + code + "; })()")
            pg.evaluate("__p2.majBoutons(); __p2.dessiner()"); pg.wait_for_timeout(80)
            pg.screenshot(path=str(out / f'{nom}-{i+2:02d}-{sc}.png'))
        pg.evaluate("__p2.fige=false; document.getElementById('bPause').click()"); pg.wait_for_timeout(150)
        pg.screenshot(path=str(out / f'{nom}-99-pause.png'))
        ctx.close()
    b.close()
print('captures :', out, '| erreurs :', err or 'aucune')
