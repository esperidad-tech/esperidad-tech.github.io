/* ======================= les doigts et les touches ======================= */
function loc(e){return [e.clientX/innerWidth*Ws,e.clientY/innerHeight*Hs];}
can.addEventListener('pointerdown',e=>{
  e.preventDefault();initSon();
  if(etatJeu!=='jeu'||enPause||choixOuvert)return;
  const [x,y]=loc(e);
  if(e.clientX<innerWidth*0.5){if(joy.id===null){joy.id=e.pointerId;joy.bx=x;joy.by=y;joy.vx=joy.vy=0;joy.mx=joy.my=0;joyVu=true;try{can.setPointerCapture(e.pointerId);}catch(_){}}}
  else doigtsDague.add(e.pointerId);
});
can.addEventListener('pointermove',e=>{
  if(e.pointerId!==joy.id)return;e.preventDefault();
  const [x,y]=loc(e),R=joyR();let dx=x-joy.bx,dy=y-joy.by,d=hyp(dx,dy);
  if(d>R*1.2){joy.bx+=dx/d*(d-R*1.2);joy.by+=dy/d*(d-R*1.2);dx=x-joy.bx;dy=y-joy.by;d=hyp(dx,dy);}
  const m=Math.min(1,d/R);joy.vx=d>0?dx/d*m:0;joy.vy=d>0?dy/d*m:0;
  if(m<0.14){joy.mx=joy.my=0;return;}
  const wx=dx,wy=dy/K,n=hyp(wx,wy)||1,f=Math.min(1,(m-0.14)/0.6);joy.mx=wx/n*f;joy.my=wy/n*f;
});
function finDoigt(e){if(e.pointerId===joy.id){joy.id=null;joy.mx=joy.my=joy.vx=joy.vy=0;}doigtsDague.delete(e.pointerId);}
can.addEventListener('pointerup',finDoigt);can.addEventListener('pointercancel',finDoigt);can.addEventListener('lostpointercapture',finDoigt);
can.addEventListener('contextmenu',e=>e.preventDefault());
document.addEventListener('gesturestart',e=>e.preventDefault());
const bDague=$('bDague'),bArc=$('bArc'),bBond=$('bBond'),bPause=$('bPause'),btnGo=$('btnGo');
function bouton(el,bas,haut){
  el.addEventListener('pointerdown',e=>{e.preventDefault();e.stopPropagation();initSon();el.classList.add('appui');bas();try{el.setPointerCapture(e.pointerId);}catch(_){}});
  const fin=()=>{el.classList.remove('appui');if(haut)haut();};
  el.addEventListener('pointerup',fin);el.addEventListener('pointercancel',fin);el.addEventListener('lostpointercapture',fin);
  el.addEventListener('contextmenu',e=>e.preventDefault());
}
bouton(bDague,()=>boutons.dague=true,()=>boutons.dague=false);
bouton(bArc,()=>boutons.arc=true,()=>boutons.arc=false);
bouton(bBond,()=>{bondDemande=true;});
const TOUCHES={ArrowUp:'h',KeyW:'h',KeyZ:'h',ArrowDown:'b',KeyS:'b',ArrowLeft:'g',KeyA:'g',KeyQ:'g',ArrowRight:'d',KeyD:'d'};
addEventListener('keydown',e=>{
  if(TOUCHES[e.code]){clav[TOUCHES[e.code]]=1;joyVu=true;e.preventDefault();}
  else if(e.code==='KeyJ')clav.dague=true;else if(e.code==='KeyK')clav.arc=true;
  else if(e.code==='Space'){e.preventDefault();if(!e.repeat){initSon();bondDemande=true;}}
  else if(e.code==='Escape'||e.code==='KeyP'){if(etatJeu==='jeu'&&!choixOuvert)enPause?reprendre():ouvrirPause();}
});
addEventListener('keyup',e=>{if(TOUCHES[e.code])clav[TOUCHES[e.code]]=0;else if(e.code==='KeyJ')clav.dague=false;else if(e.code==='KeyK')clav.arc=false;});
addEventListener('blur',()=>{clav.h=clav.b=clav.g=clav.d=0;clav.dague=clav.arc=false;boutons.dague=boutons.arc=false;});

/* ======================= les écrans ======================= */
const regles=$('regles'),pauseEl=$('pause'),finEl=$('fin'),finCarte=$('finCarte');
const ARC_SVG=$('icArc').innerHTML,JAV_SVG='<path d="M6 34 L32 8" stroke="#c9a060" stroke-width="3.4" stroke-linecap="round"/><path d="M32 8 l6 -4 l-2 7z" fill="#cfd8e6"/><path d="M6 34 l-2 3 M9 31 l-4 1" stroke="#ffb070" stroke-width="2"/>';
const lDague=bDague.querySelector('span'),lBond=bBond.querySelector('span');
function majBoutonArc(){
  const j=P.javelots>0,c=P.cache&&phase==='vague'&&etatJeu==='jeu';
  bArc.classList.toggle('javelot',j);$('lArc').textContent=j?'javelot':c?'tir visé':'arc';$('icArc').innerHTML=j?JAV_SVG:ARC_SVG;
  bArc.classList.toggle('anneau',j&&!vus.javLance);
}
function majBoutons(){
  const c=P.cache&&phase==='vague'&&etatJeu==='jeu';
  for(const b of [bDague,bArc,bBond])b.classList.toggle('ombre',c);
  lDague.textContent=c?'assassin':'dague';lBond.textContent=c&&P.ombreCD<=0?"saut d'ombre":'bond';majBoutonArc();
}
function boutonsJeu(on){for(const b of [bDague,bArc,bBond,bPause])b.classList.toggle('on',on);if(!on)bBond.classList.remove('anneau');}
function nettoyerMonde(){
  OBS=OBS0.map(o=>({...o}));majGrille();
  G=[];fleches=[];javs=[];obus=[];ondes=[];feux=[];loups=[];items=[];parts=[];file=[];nuages=[];leurres=[];champJ=null;porte[0]=porte[1]=0;
  hitstop=0;sec=0;flashR=0;flashB=0;flashV=0;defaiteDans=0;finDans=0;P.slash=null;garde='calme';
}
function nouveauxStats(){return {tues:0,degats:0,esquives:0,recus:0,caram:0,bang:0,ramasses:0,dalles:0,plantees:0,assassinats:0,reperages:0,ordres:0,sauts:0,tirsVises:0,abris:0,pouvoirs:[],debut:tReel};}
function demarrer(i,garder){
  initSon();
  for(const el of [regles,finEl,pauseEl,choixEl])el.classList.remove('on');choixOuvert=false;enPause=false;
  if(!garder){resetP(false);stats=nouveauxStats();}else resetP(true);
  nettoyerMonde();
  etatJeu='jeu';boutonsJeu(true);btnGo.textContent='En garde !';majCamera(10);
  dernier=performance.now();demarrerVague(i||0);
}
function ouvrirPause(){
  if(etatJeu!=='jeu')return;enPause=true;pauseEl.classList.add('on');cacherMsg();
  $('pMesures').textContent=`Mesures (version 4) : image ${can.width} × ${can.height} · ${fpsMoy.toFixed(0)} images par seconde · pire seconde ${pire<999?pire.toFixed(0):'—'} · finesse ${finesse} · appareil ${vitesseApp} · ${GS.cuits} images de golems`;
}
function reprendre(){enPause=false;pauseEl.classList.remove('on');regles.classList.remove('on');dernier=performance.now();}
bPause.onclick=()=>enPause?reprendre():ouvrirPause();
$('pReprendre').onclick=reprendre;
$('pSuivant').onclick=()=>{reprendre();passerVague();};
$('pRegles').onclick=()=>{pauseEl.classList.remove('on');regles.classList.add('on');btnGo.textContent='Reprendre';};
$('pDur').onclick=()=>{dur=!dur;$('pDur').textContent=dur?'Golems : costauds':'Golems : normaux';};
$('pPages').onclick=()=>{pagesTrouvees=!pagesTrouvees;$('pPages').textContent=pagesTrouvees?'Pages des carnets : toutes trouvées':'Pages des carnets : aucune (pas de carte dorée)';};
$('pSon').onclick=()=>{sonOn=!sonOn;$('pSon').textContent=sonOn?'Son : oui':'Son : non';};
$('pRecommencer').onclick=()=>demarrer(0,false);
btnGo.onclick=()=>{if(btnGo.disabled)return;if(etatJeu==='jeu'&&enPause)reprendre();else demarrer(0,false);};
{const b=$('conteurHp');b.addEventListener('pointerdown',e=>e.stopPropagation());b.onclick=()=>lire(conteurTxt.textContent);}
$('choixHp').onclick=()=>lire($('choixTxt').textContent);
document.addEventListener('click',e=>{
  const b=e.target.closest('[data-lire]');if(!b)return;
  const c=b.closest('.pouvoir');
  if(c){lire([c.querySelector('b').textContent+'.'].concat(Array.from(c.querySelectorAll('p')).map(p=>p.textContent)).join(' '));return;}
  const p=b.parentElement.querySelector('p');if(p)lire(p.textContent);
});
function duree(){const s=Math.round(tReel-stats.debut);return `${Math.floor(s/60)} min ${String(s%60).padStart(2,'0')}`;}
function victoire(){finDans=1.3;son('victoire');cacherMsg();}
function montrerVictoire(){
  etatJeu='fin';boutonsJeu(false);cacherMsg();
  finCarte.innerHTML=`<h1>La garde est en miettes !</h1>
  <div class="texte"><p>Grosbec trépigne sur son estrade : plus un golem debout, et il n'a presque jamais su où était le Pisteur. Il ne reste qu'à prévenir le Sage.</p><button class="hp" data-lire>🔊</button></div>
  <div class="code">🔥 🌙 ⭐</div><p class="petit">le feu · la lune · l'étoile — crie-le au Sage !</p>
  <div class="stats"><span>Durée</span><b>${duree()}</b><span>Golems tombés</span><b>${stats.tues}</b><span>Coups d'assassin</span><b>${stats.assassinats}</b><span>Fois repéré</span><b>${stats.reperages}</b><span>Ordres de Grosbec</span><b>${stats.ordres}</b><span>Coups évités d'un bond</span><b>${stats.esquives}</b><span>Cœurs perdus</span><b>${stats.recus}</b></div>
  <p class="petit">Cartes : ${stats.pouvoirs.join(' · ')||'aucune'}</p>
  <div class="bas"><button class="jaune" id="fRejouer">Rejouer</button></div>`;
  finEl.classList.add('on');$('fRejouer').onclick=()=>demarrer(0,false);
}
function defaite(){
  etatJeu='fin';boutonsJeu(false);cacherMsg();
  finCarte.innerHTML=`<h1>Le Pisteur est à terre…</h1>
  <div class="texte"><p>Grosbec ricane sur son estrade. Un chasseur ne reste pas au milieu de la salle : il se cache, il frappe, il disparaît. On se relève ?</p><button class="hp" data-lire>🔊</button></div>
  <div class="menu" style="margin-top:1em"><button class="jaune" id="fReprendre">Reprendre la vague ${vague+1}</button><button class="gris" id="fDebut">Recommencer du début</button></div>`;
  finEl.classList.add('on');$('fReprendre').onclick=()=>demarrer(vague,true);$('fDebut').onclick=()=>demarrer(0,false);
}

/* ======================= la boucle ======================= */
let dernier=performance.now(),fpsN=0,fpsT=0,fpsMoy=60,pire=999,essaisFps=0,recB=null,recA=null,recD=null,recS=null,rythmeD=null,chargeT0=0,prepare=0;
function chargement(){
  /* pendant l'explication : on cuit la salle, puis le Pisteur, puis les golems */
  const el=$('chargement');
  if(prepare===0){prepare=1;el.textContent='La salle se prépare…';return;}
  if(prepare===1){preparerImages();prepare=2;chargeT0=tReel;PS.lancer(S0,()=>{});return;}
  if(prepare===2){
    const p=PS.avance;
    if(PS.essentiel){prepare=3;btnGo.disabled=false;btnGo.classList.add('anneau');el.textContent='';}
    else el.textContent='Le Pisteur se prépare… '+Math.round(p*100)+' %';
  }
}
function boucle(now){
  requestAnimationFrame(boucle);
  let dt=(now-dernier)/1000;dernier=now;if(!(dt>0))dt=0.016;dt=Math.min(dt,0.05);
  tReel+=dt;
  if(prepare<3)chargement();else if(etatJeu!=='jeu'||enPause||choixOuvert){GS.precuire(6);}
  {const d=etatJeu==='jeu'&&!enPause&&!choixOuvert;if(d!==rythmeD){rythmeD=d;PS.rythme(d);}}
  const actif=etatJeu==='jeu'&&!enPause&&!choixOuvert&&!tourne;
  if(actif){
    fpsN++;fpsT+=dt;
    if(fpsT>=1.5){fpsMoy=fpsN/fpsT;fpsN=0;fpsT=0;if(tReel-stats.debut>4)pire=Math.min(pire,fpsMoy);
      if(fpsMoy<33&&finesse<2&&essaisFps<4&&PS.complet&&!/[?&]finesse=/.test(location.search)){essaisFps++;finesse++;try{localStorage.setItem('pisteur4_finesse',finesse);}catch(e){}taille();}}
    if(GS.file)GS.precuire(2.5);
    majMsg();
    if(hitstop>0)hitstop-=dt;
    else{
      const pr=window.__prof,u0=pr?performance.now():0;
      lireEntrees();majJoueur(dt);
      const dm=dt*(P.etat==='vise'?0.45:1);
      majPerception(dm);majDirecteur(dm);majGolems(dm);majProjectiles(dm);majVagues(dm);
      if(pr)pr.regles=(pr.regles||0)+performance.now()-u0;
    }
    majParts(dt);
    porte[0]=Math.max(0,porte[0]-dt*0.45);porte[1]=Math.max(0,porte[1]-dt*0.45);
    const d=hyp(P.x-P.lx,P.y-P.ly);P.court=d>0.004&&P.etat==='libre';P.pas+=d;P.lx=P.x;P.ly=P.y;
    const rb=P.cache?P.ombreCD>0&&P.charges<=0:P.charges<=0&&!P.bondGratuit,ra=!P.javelots&&P.arcCD>0.05,rd=P.cache&&P.assCD>0;if(rd!==recD){recD=rd;bDague.classList.toggle('recharge',rd);}
    if(rb!==recB){recB=rb;bBond.classList.toggle('recharge',rb);}if(ra!==recA){recA=ra;bArc.classList.toggle('recharge',ra);}
    {const so=P.cache&&P.ombreCD<=0&&phase==='vague';if(so!==recS){recS=so;lBond.textContent=so?"saut d'ombre":'bond';}}
    if(!vus.anneauBond)for(const g of G)if(g.zone){vus.anneauBond=1;bBond.classList.add('anneau');break;}
    if(defaiteDans>0){defaiteDans-=dt;if(defaiteDans<=0)defaite();}
    if(finDans>0){finDans-=dt;if(finDans<=0)montrerVictoire();}
  }
  sec=Math.max(0,sec-dt*26);flashR=Math.max(0,flashR-dt*1.6);flashB=Math.max(0,flashB-dt*1.2);flashV=Math.max(0,flashV-dt*2.2);
  dessiner(dt);
}

/* ======================= pour les essais automatiques ======================= */
window.__pt={
  etat:()=>({etatJeu,phase,vague,groupeI,enPause,choix:choixOuvert,fps:fpsMoy,pire,finesse,vitesseApp,taille:[can.width,can.height],garde,tVague,prepare,
    dir:{patrouille:DIR.patrouille,groupes:DIR.groupes,debusque:DIR.debusque,assaut:DIR.assaut,oeil:{a:DIR.oeil.a,larg:DIR.oeil.larg}},
    P:{x:P.x,y:P.y,z:P.z,coeurs:P.coeurs,max:P.max,etat:P.etat,cache:P.cache,javelots:P.javelots,charges:P.charges,arcCD:P.arcCD,charge:P.charge,fa:P.fa,invisible:P.invisible,up:Object.keys(P.up)},
    G:G.filter(g=>g.etat!=='mort').map(g=>({type:g.type,x:g.x,y:g.y,hp:g.hp,max:g.max,etat:g.etat,fa:g.fa,r:g.r,aDalle:g.aDalle,voit:g.voit,rem:g.rem,role:g.role,sonne:tReel<g.sonneJ||g.etat==='sonne',armure:!!g.T.armure&&tReel>g.sansArmure,vue:g.T.vue,cone:g.T.cone,zone:g.zone?Object.assign({},g.zone):null})),
    obus:obus.map(o=>({x:o.x1,y:o.y1,t:o.t,dur:o.dur})),ondes:ondes.map(w=>({x:w.x,y:w.y,r:w.r,ep:w.ep})),
    javs:javs.filter(j=>!j.joueur).map(j=>({x:j.x,y:j.y,a:j.a})),items:items.map(i=>({x:i.x,y:i.y})),
    obs:OBS.map(o=>({k:o.k,x:o.x,y:o.y,c:o.c||0,r:o.r||0,w:o.w||0,d:o.d||0,haut:o.haut||0,fond:o.fond||0})),cachettes:cachettes.map(c=>({x:c.x,y:c.y})),
    stats,msg:msgCur,choixDispo:choixOuvert?choixDispo.map(p=>p.id):[]}),
  cmd:o=>{for(const k of ['mx','my','dague','arc'])if(k in o)robot[k]=o[k];if(o.bond)bondDemande=true;},
  choisir:i=>{const b=cartesEl.querySelectorAll('button.jaune')[i];if(b)b.click();},
  demarrer:i=>demarrer(i||0,false),
  suivant:()=>passerVague(),
  invincible:v=>{invincible=!!v;},
  dur:v=>{dur=!!v;},
  vue:(a,b,c,d,h)=>vue(a,b,c,d,h),
  ev:s=>eval(s)
};

/* ======================= au départ ======================= */
resetP(false);stats=nouveauxStats();OBS=OBS0.map(o=>({...o}));majGrille();
mesurerAppareil();taille();camX=clamp(px(P.x)-Ws/2,0,Math.max(0,SW-Ws));camY=clamp(py(P.y)-Hs*0.6,58,Math.max(58,SH-Hs));
requestAnimationFrame(boucle);
