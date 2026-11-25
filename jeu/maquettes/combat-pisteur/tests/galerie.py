# Une galerie de captures : chaque coup rouge, les états du Pisteur, l'ombre. Le jeu est avancé à pas fixes jusqu'au bon moment.
import sys, json, time
from playwright.sync_api import sync_playwright
from commun import ouvrir, ICI, SORTIE
PRE = """const pt=__pt,dt=1/60,st=()=>pt.etat();pt.figer(true);
function av(sec,f){const n=Math.round(sec/dt);for(let i=0;i<n;i++){if(f&&f(i*dt)===true)return;pt.pas(1,dt);}}
function jusqua(f,max){av(max||6,f);}
"""
VUES = [
 ('plaquage', """pt.scene([13.2,10,0],[{t:'chien',x:10,y:10,fa:0,immobile:1},{t:'chien',x:10.4,y:11.2,fa:0,immobile:1,cdS:9},{t:'chien',x:10.2,y:8.8,fa:0,immobile:1,cdS:9}]);jusqua(()=>{const g=st().G[0];return g.zone&&g.zone.fige&&g.zone.p>0.6})"""),
 ('plaque', """pt.scene([13.2,10,0],[{t:'chien',x:10,y:10,fa:0,immobile:1},{t:'chien',x:11.4,y:11.2,fa:0,immobile:1,cdS:9},{t:'chien',x:11.2,y:8.8,fa:0,immobile:1,cdS:9}]);jusqua(()=>st().P.etat==='plaque');av(0.9)"""),
 ('javelot', """pt.scene([14,10,0],[{t:'javelot',x:8,y:10,fa:0,immobile:1,cdM:99},{t:'dalle',x:9.5,y:11.5,fa:0,immobile:1,cdM:99,cdS:99}]);jusqua(()=>{const g=st().G[0];return g.zone&&g.zone.fige&&g.zone.p>0.75})"""),
 ('javelot-vole', """pt.scene([14,10,0],[{t:'javelot',x:8,y:10,fa:0,immobile:1,cdM:99}]);jusqua(()=>st().javs.length>0);av(0.2)"""),
 ('sonne', """pt.scene([14,10,0],[{t:'javelot',x:8,y:10,fa:0,immobile:1,cdM:99}]);jusqua(()=>st().P.etat==='sonne');av(0.2)"""),
 ('dalle-cercle', """pt.scene([13,10,0],[{t:'dalle',x:8,y:10,fa:0,immobile:1},{t:'javelot',x:6,y:9,fa:0,immobile:1,cdS:99,cdM:99}]);jusqua(()=>{const g=st().G[0];return g.zone&&g.zone.p>0.5})"""),
 ('dalle-plantee', """pt.scene([13,10,0],[{t:'dalle',x:8,y:10,fa:0,immobile:1}]);jusqua(()=>{const g=st().G[0];return !!g.zone});pt.cmd({mx:1,my:0.2});av(1.5);pt.cmd({mx:0,my:0});av(0.3)"""),
 ('fauchage', """pt.scene([12.2,10,0],[{t:'faucheur',x:10,y:10,fa:0,immobile:1}]);jusqua(()=>{const g=st().G[0];return g.zone&&g.zone.fige&&g.zone.p>0.7})"""),
 ('obus', """pt.scene([15,10,0],[{t:'mortier',x:9,y:10,fa:0,immobile:1},{t:'cuirasse',x:13.8,y:10.6,fa:0,immobile:1,cd:99}]);jusqua(()=>st().obus.length&&st().obus[0].t>0.9)"""),
 ('belier-bande', """pt.scene([13,10,0],[{t:'belier',x:7,y:10,fa:0,immobile:1,cd:99}]);jusqua(()=>{const g=st().G[0];return g.zone&&g.zone.fige&&g.zone.p>0.7})"""),
 ('belier-vol', """pt.scene([8.4,10,0],[{t:'belier',x:7,y:10,fa:0,immobile:1,cdS:99}]);jusqua(()=>st().P.etat==='vol');av(0.2)"""),
 ('onde', """pt.scene([10.6,9.6,0],[{t:'colosse',x:7.6,y:9.6,fa:0,immobile:1,cd:99},{t:'chien',x:9.6,y:11.4,fa:0,immobile:1,cdS:99,cd:99}]);jusqua(()=>{const g=st().G[0];return g.zone&&g.zone.fige&&g.zone.p>0.6})"""),
 ('rang3', """pt.scene([13,12,-1.57],[{t:'colosse',x:13,y:10.2,fa:-1.57,immobile:1}],{sansObstacles:1});pt.ev('G[0].sonne=999');pt.tenir(1,true);av(1.42);pt.tenir(1,false)"""),
 ('embuscade', """pt.scene([13,12,-1.57],[{t:'faucheur',x:13,y:10.3,fa:-1.57,immobile:1}],{sansObstacles:1});pt.appui(4);av(0.3);pt.appui(1);av(0.2)"""),
 ('assomme', """pt.scene([13,12.2,-1.57],[{t:'javelot',x:13,y:10.4,fa:-1.57,immobile:1},{t:'dalle',x:14.6,y:9.6,fa:-1.57,immobile:1}],{sansObstacles:1});pt.appui(4);av(0.3);pt.appui(2);av(0.6)"""),
 ('bandage', """pt.scene([14.9,15.9,-1.57],[{t:'chien',x:11,y:10.6,fa:-1.57,immobile:1},{t:'faucheur',x:16.5,y:9.2,fa:3.1,immobile:1}]);pt.ev('P.hp=45;P.bandages=3');pt.appui(4);av(0.3);pt.appui(4);av(1.9)"""),
 ('regard', """pt.scene([13,15.6,-1.57],[{t:'dalle',x:10.5,y:10.4,fa:0.3,immobile:1},{t:'javelot',x:9.2,y:11.2,fa:0.3,immobile:1},{t:'chien',x:17.5,y:11.2,fa:2.4,immobile:1,grp:2},{t:'chien',x:18.6,y:10.4,fa:2.4,immobile:1,grp:2}]);pt.ev('P.hp=64;P.bandages=4');av(0.25)"""),
 ('repere', """pt.scene([13,13.4,-1.57],[{t:'dalle',x:10.5,y:10.4,fa:0.7,immobile:1,cdM:99,cdS:99},{t:'javelot',x:9.2,y:11.2,fa:0.3,immobile:1,cdS:99,cdM:99},{t:'chien',x:17.5,y:11.2,fa:2.4,immobile:1,grp:2},{t:'chien',x:18.6,y:10.4,fa:-0.6,immobile:1,grp:2}],{sansObstacles:1});av(0.9)"""),
 ('boule', """pt.scene([13,12,-1.57],[{t:'cuirasse',x:13,y:10.3,fa:-1.57,immobile:1}],{sansObstacles:1});pt.appui(4);av(0.3);pt.appui(1);av(1.6);pt.invincible(true);pt.ev('P.x=13;P.y=13.5');jusqua(()=>{const g=st().G[0],P=st().P;return g.etat==='roule'&&Math.hypot(g.x-P.x,g.y-P.y)<3.4&&Math.hypot(g.x-P.x,g.y-P.y)>1.6},20);pt.invincible(false)"""),
 ('fantome', """pt.scene([13,12,-1.57],[{t:'faucheur',x:13,y:10.3,fa:-1.57,immobile:1}],{sansObstacles:1});pt.appui(4);av(0.3);pt.appui(1);av(0.2);pt.ev('P.x=6;P.y=15;P.ombre=true;P.ombreCD=0;P.etat="libre";G[0].fenetre=0');av(1.2);pt.ev('P.x=G[0].x+2.6;P.y=G[0].y+1.2')"""),
 ('piste', """pt.scene([13,15,-1.57],[{t:'chien',x:8,y:8,fa:-1.57,immobile:1,cdS:99},{t:'chien',x:9.2,y:8,fa:-1.57,immobile:1,cdS:99},{t:'faucheur',x:7,y:9.4,fa:-1.57,immobile:1}],{sansObstacles:1});pt.appui(4);av(0.3);pt.ev('facher(1)');av(3.2,()=>{pt.cmd({mx:1,my:0})});av(2.2,()=>{pt.cmd({mx:0,my:-1})});pt.cmd({mx:0,my:0});av(0.1)"""),
 ('garde', """pt.scene([13,12.2,-1.57],[{t:'javelot',x:13,y:10.4,fa:-1.57,immobile:1,cdS:99,cdM:99},{t:'dalle',x:15.5,y:9,fa:-1.57,immobile:1,cdS:99,cdM:99,cd:99}],{sansObstacles:1});pt.appui(4);av(0.3);pt.appui(1);av(0.3);pt.invincible(true);pt.ev('P.x=17;P.y=14.5;P.ombre=true;P.ombreCD=0');av(4);pt.ev('P.x=G[0].x+2;P.y=G[0].y+2.4');av(0.1);pt.invincible(false)"""),
 ('anneau', """pt.scene([12.4,9.6,3.14],[{t:'colosse',x:9,y:9.6,fa:0,immobile:1}],{sansObstacles:1});pt.ev("G[0].sac=['anneau']");jusqua(()=>{const g=st().G[0];return g.zone&&g.zone.p>0.6})"""),
 ('croix', """pt.scene([11.6,11.4,3.14],[{t:'colosse',x:9,y:9.6,fa:0,immobile:1}],{sansObstacles:1});pt.ev("G[0].sac=['croix']");jusqua(()=>{const g=st().G[0];return g.zone&&g.zone.p>0.6})"""),
 ('pilon', """pt.scene([11,9.6,3.14],[{t:'colosse',x:9,y:9.6,fa:0,immobile:1}],{sansObstacles:1});pt.ev("G[0].sac=['pilon']");jusqua(()=>{const g=st().G[0];return g.zone&&g.zone.p>0.6})"""),
 ('chaine', """pt.scene([13,12.8,-1.57],[{t:'colosse',x:13,y:10.3,fa:-1.57,immobile:1}],{sansObstacles:1});pt.appui(4);av(0.3);pt.appui(1);av(0.3);pt.cmd({mx:1,my:0.1});jusqua(()=>st().P.etat==='chaine');av(0.15);pt.cmd({mx:0,my:0})"""),
 ('cri', """pt.scene([13,12,-1.57],[{t:'javelot',x:13,y:10.4,fa:-1.57,immobile:1,cdM:99},{t:'chien',x:15.5,y:9,fa:-1.57,immobile:1},{t:'chien',x:10.6,y:8.6,fa:-1.57,immobile:1}],{sansObstacles:1});pt.appui(4);av(0.3);pt.appui(1);av(0.36)"""),
 ('cherche', """pt.scene([12.6,13.2,-1.57],[{t:'chien',x:12.6,y:10.4,fa:1.57,immobile:1,cdS:99},{t:'chien',x:13.6,y:10,fa:1.57,immobile:1,cdS:99}]);av(0.7);pt.cmd({mx:0.7,my:0.7});pt.appui(3);av(0.5);pt.cmd({mx:1,my:0.15});av(0.4,()=>{const s=st();if(!s.P.ombre&&s.nVoient===0&&s.P.ombreCD<=0)pt.appui(4)});av(3.2,()=>{const s=st();if(!s.P.ombre&&s.nVoient===0&&s.P.ombreCD<=0)pt.appui(4)});pt.cmd({mx:0,my:0});av(0.3)"""),
]
noms = sys.argv[1:]
with sync_playwright() as p:
    b, pg, errs, tc = ouvrir(p)
    for k in range(400):
        if pg.evaluate("__pt.ev('PS.complet')"): break
        time.sleep(0.25)
    for nom, js in VUES:
        if noms and nom not in noms: continue
        pg.evaluate("(()=>{" + PRE + js + "})()")
        pg.evaluate("__pt.ev('majRecharges()')")
        time.sleep(0.35)
        pg.screenshot(path=f"{SORTIE}/g-{nom}.png")
        print(nom, pg.evaluate("JSON.stringify({P:[__pt.etat().P.etat,__pt.etat().P.hp,__pt.etat().P.ombre],G:__pt.etat().G.map(g=>[g.type,g.etat,g.hp,g.mode])})"), flush=True)
    print('ERREURS', errs[:6])
    b.close()
