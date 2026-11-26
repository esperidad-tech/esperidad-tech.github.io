/* ======================= les doigts et les touches ======================= */
function loc(e){return [e.clientX/innerWidth*Ws,e.clientY/innerHeight*Hs];}
can.addEventListener('pointerdown',e=>{
  e.preventDefault();initSon();
  if(etatJeu!=='jeu'||enPause)return;
  const [x,y]=loc(e);
  if(e.clientX<innerWidth*0.5&&joy.id===null){joy.id=e.pointerId;joy.bx=x;joy.by=y;joy.vx=joy.vy=0;joy.mx=joy.my=0;joyVu=true;try{can.setPointerCapture(e.pointerId);}catch(_){}}
});
can.addEventListener('pointermove',e=>{
  if(e.pointerId!==joy.id)return;e.preventDefault();
  const [x,y]=loc(e),R=joyR();let dx=x-joy.bx,dy=y-joy.by,d=hyp(dx,dy);
  if(d>R*1.2){joy.bx+=dx/d*(d-R*1.2);joy.by+=dy/d*(d-R*1.2);dx=x-joy.bx;dy=y-joy.by;d=hyp(dx,dy);}
  const m=Math.min(1,d/R);joy.vx=d>0?dx/d*m:0;joy.vy=d>0?dy/d*m:0;
  if(m<0.14){joy.mx=joy.my=0;return;}
  const wx=dx,wy=dy/K,n=hyp(wx,wy)||1,f=Math.min(1,(m-0.14)/0.6);joy.mx=wx/n*f;joy.my=wy/n*f;
});
function finDoigt(e){if(e.pointerId===joy.id){joy.id=null;joy.mx=joy.my=joy.vx=joy.vy=0;}}
can.addEventListener('pointerup',finDoigt);can.addEventListener('pointercancel',finDoigt);can.addEventListener('lostpointercapture',finDoigt);
can.addEventListener('contextmenu',e=>e.preventDefault());
document.addEventListener('gesturestart',e=>e.preventDefault());
const BT=[null,$('b1'),$('b2'),$('b3'),$('b4')],bSaut=BT[3],bPause=$('bPause'),btnGo=$('btnGo');
const LBL=[null,$('l1'),$('l2'),$('l3'),$('l4')];
/* un bouton : l'appui compte au moment où le doigt se pose */
function bouton(n){
  const el=BT[n];
  el.addEventListener('pointerdown',e=>{e.preventDefault();e.stopPropagation();initSon();el.classList.add('appui');tenu[n]=true;appui(n);try{el.setPointerCapture(e.pointerId);}catch(_){}});
  const fin=()=>{el.classList.remove('appui');tenu[n]=false;};
  el.addEventListener('pointerup',fin);el.addEventListener('pointercancel',fin);el.addEventListener('lostpointercapture',fin);
  el.addEventListener('contextmenu',e=>e.preventDefault());
}
for(let n=1;n<=4;n++)bouton(n);
/* les trois cartes dorées : un simple appui, comme les autres boutons */
const CT={fleche:$('cFleche'),sifflet:$('cSifflet'),cape:$('cCape')};
for(const nom of CARTES){
  const el=CT[nom];
  el.addEventListener('pointerdown',e=>{e.preventDefault();e.stopPropagation();initSon();el.classList.add('appui');jouerCarte(nom);try{el.setPointerCapture(e.pointerId);}catch(_){}});
  const fin=()=>{el.classList.remove('appui');};
  el.addEventListener('pointerup',fin);el.addEventListener('pointercancel',fin);el.addEventListener('lostpointercapture',fin);
  el.addEventListener('contextmenu',e=>e.preventDefault());
}
/* rien à lire : un bouton refusé tremble, et le bouton qui débloque la situation clignote (le bouton d'ombre, le plus souvent) */
function animer(el,c){el.classList.remove(c);void el.offsetWidth;el.classList.add(c);}
for(const el of [...BT.slice(1),...Object.values(CT)])el.addEventListener('animationend',()=>{el.classList.remove('non');el.classList.remove('appel');});
function refuser(n,vers){animer(BT[n],'non');if(vers)animer(BT[vers],'appel');}
function refuserCarte(nom,versOmbre){animer(CT[nom],'non');if(versOmbre)animer(BT[4],'appel');}
const TOUCHES={ArrowUp:'h',KeyW:'h',KeyZ:'h',ArrowDown:'b',KeyS:'b',ArrowLeft:'g',KeyA:'g',KeyQ:'g',ArrowRight:'d',KeyD:'d'};
const TB={KeyJ:1,KeyK:2,Space:3,KeyL:4},TC={Digit1:'fleche',Digit2:'sifflet',Digit3:'cape'};
addEventListener('keydown',e=>{
  if(demo){if(e.code==='Enter'||e.code==='Space'){e.preventDefault();btnGo.click();}return;}
  if(TOUCHES[e.code]){clav[TOUCHES[e.code]]=1;joyVu=true;e.preventDefault();}
  else if(TB[e.code]){e.preventDefault();if(!e.repeat){initSon();tenu[TB[e.code]]=true;appui(TB[e.code]);}}
  else if(TC[e.code]){e.preventDefault();if(!e.repeat){initSon();jouerCarte(TC[e.code]);}}
  else if(e.code==='Escape'||e.code==='KeyP'){if(etatJeu==='jeu')enPause?reprendre():ouvrirPause();}
});
addEventListener('keyup',e=>{if(TOUCHES[e.code])clav[TOUCHES[e.code]]=0;else if(TB[e.code])tenu[TB[e.code]]=false;});
addEventListener('blur',()=>{clav.h=clav.b=clav.g=clav.d=0;for(let n=1;n<=4;n++)tenu[n]=false;});

/* ======================= les quatre boutons, leurs huit visages ======================= */
const NOMS=[null,['dague','embuscade'],['assommer','assommer'],['saut',"saut<br>d'ombre"],['ombre','bandage']];      /* le bouton 2 ne sert que dans l'ombre : à découvert il est gris */
const nb4=$('nb4');let nbVu=-1;
let etatBt='';
function majBoutons(){
  const o=P.ombre&&etatJeu==='jeu',cle=(o?'o':'d')+P.rang;
  if(cle===etatBt)return;etatBt=cle;
  for(let n=1;n<=4;n++){BT[n].classList.toggle('ombre',o);LBL[n].innerHTML=NOMS[n][o?1:0];}
  BT[2].classList.toggle('vide',!o);
  BT[1].classList.toggle('rang2',!o&&P.rang===2);BT[1].classList.toggle('rang3',!o&&P.rang===3);
}
/* les recharges (un voile qui se vide), le bouton d'ombre gris ou allumé, et le rond jaune sur le bouton qui sert maintenant */
const rcVu=[0,-1,-1,-1,-1];let btT=0,b4Etat='',anneauVu=[0,false,false,false,false];
function recharge(n,k){k=Math.round(clamp(k,0,1)*40)/40;if(k!==rcVu[n]){rcVu[n]=k;BT[n].style.setProperty('--r',k);}}
function anneau(n,on){if(anneauVu[n]!==on){anneauVu[n]=on;BT[n].classList.toggle('anneau',on);}}
const ctVu={},ctR={};
function majCartesUI(){
  for(const nom of CARTES){
    /* jouée : éteinte ; la cape en cours : elle brille ; dans l'ombre avec un golem à viser : prête ; dans l'ombre sans cible : elle attend ; à découvert : pâle */
    const el=CT[nom],o=P.ombre&&etatJeu==='jeu',e=P.capeT>0&&nom==='cape'?'c':!P.cartes[nom]?'u':o&&(nom==='cape'||P.cibles[nom])?'p':o?'t':'a';
    if(ctVu[nom]!==e){ctVu[nom]=e;el.classList.toggle('use',e==='u');el.classList.toggle('pret',e==='p');el.classList.toggle('attend',e==='t');el.classList.toggle('active',e==='c');}
    /* la cape : le voile se referme pendant ses dix secondes */
    let k=nom==='cape'&&P.capeT>0?1-P.capeT/REG.cartes.cape.dur:0;
    k=Math.round(clamp(k,0,1)*40)/40;if(ctR[nom]!==k){ctR[nom]=k;el.style.setProperty('--r',k);}
  }
}
function majRecharges(){
  majBoutons();majCartesUI();
  if(P.bandages!==nbVu){nbVu=P.bandages;nb4.textContent=nbVu;}
  if(P.ombre){
    recharge(1,0);recharge(2,0);
    recharge(3,P.cibleSO?0:Math.max(P.sautOmbreCD/REG.sautOmbre.cd,P.sautCD/REG.saut.cd));
    /* le bandage : le voile se vide pendant les trois secondes ; gris s'il n'en reste plus ou si le Pisteur n'est pas blessé */
    const soin=P.etat==='bandage',utile=P.bandages>0&&P.hp<P.max,e=soin||utile?'o':'ox';
    recharge(4,soin?1-P.t/REG.bandage.dur:0);
    if(e!==b4Etat){b4Etat=e;BT[4].classList.remove('pret');BT[4].classList.toggle('eteint',e==='ox');}
    anneau(4,utile&&!soin&&P.hp<=60&&stats.bandagesPoses<1&&!P.aPortee);anneau(1,!!P.aPortee&&stats.embuscades+stats.assommes<2);
  }else{
    recharge(1,0);recharge(2,0);recharge(3,P.sautCD/REG.saut.cd);recharge(4,P.ombreCD/REG.ombre.cd);
    /* gris tant qu'un golem le voit ; dès que plus personne ne le voit, le voile se vide en trois secondes ; puis il s'allume */
    const dispo=phase==='vague'&&nVoient===0&&P.ombreCD<=0&&!BLOQUE[P.etat],e=dispo?'p':nVoient>0||phase!=='vague'?'e':'a';
    if(e!==b4Etat){b4Etat=e;BT[4].classList.toggle('eteint',e==='e');BT[4].classList.toggle('pret',dispo);}
    anneau(4,dispo&&stats.ombres<3);anneau(1,false);
  }
}
function boutonsJeu(on){for(let n=1;n<=4;n++)BT[n].classList.toggle('on',on);for(const nom of CARTES)CT[nom].classList.toggle('on',on);bPause.classList.toggle('on',on);if(!on)for(let n=1;n<=4;n++)anneau(n,false);}

/* ======================= les écrans ======================= */
const regles=$('regles'),pauseEl=$('pause'),finEl=$('fin'),finCarte=$('finCarte');
let essai=false,fige=false;
function nettoyerMonde(){
  OBS=OBS0.map(o=>({...o}));majGrille();
  G=[];javs=[];obus=[];parts=[];file=[];leurres=[];porte[0]=porte[1]=0;alerte[0]=alerte[1]=0;alerteT[0]=alerteT[1]=0;grpVoit={};grpColere={};grpFrappe={};piste=[];pisteBase=0;nFlair=0;
  hitstop=0;sec=0;flashR=0;flashB=0;flashV=0;defaiteDans=0;finDans=0;nVoient=0;
}
function nouveauxStats(){return {cartes:0,repares:0,dechaines:0,endormis:0,siffles:0,reprises:0,tues:0,tuesEntreEux:0,degats:0,entreEux:0,recus:0,saignement:0,coups:0,esquives:0,embuscades:0,assommes:0,dagues:0,sauts:0,sautsOmbre:0,coleres:0,pares:0,flaires:0,chaines:0,boules:0,insensibles:0,
  bandagesPoses:0,bandagesPerdus:0,soins:0,ombres:0,reperages:0,semes:0,murs:0,chutes:0,tings:0,colles:0,dalles:0,javelots:0,obus:0,caram:0,bang:0,abris:0,tOmbre:0,tVu:0,par:{},vieFin:[],debut:tReel};}
function demarrer(i,garder,sauve){
  if(!demoPose){initSon();musique(true);}
  for(const el of [regles,finEl,pauseEl])el.classList.remove('on');enPause=false;essai=false;
  const st=stats;resetP();if(!garder){stats=nouveauxStats();sauves=[];}else stats=st;
  if(sauve){P.hp=sauve.hp;P.bandages=sauve.bandages;P.cartes=Object.assign({},sauve.cartes);stats.reprises++;}
  nettoyerMonde();
  etatJeu='jeu';boutonsJeu(true);etatBt='';b4Etat='';majBoutons();majCamera(10);
  dernier=performance.now();demarrerVague(i||0);
}
function ouvrirPause(){
  if(etatJeu!=='jeu')return;enPause=true;pauseEl.classList.add('on');
  $('pMesures').textContent=`Mesures (version 15) : image ${can.width} × ${can.height} · ${fpsMoy.toFixed(0)} images par seconde · pire seconde ${pire<999?pire.toFixed(0):'—'} · finesse ${finesse} · appareil ${vitesseApp} · ${GS.cuits} images de golems`;
}
function reprendre(){enPause=false;pauseEl.classList.remove('on');regles.classList.remove('on');dernier=performance.now();}
bPause.onclick=()=>enPause?reprendre():ouvrirPause();
$('pReprendre').onclick=reprendre;
$('pSuivant').onclick=()=>{reprendre();passerVague();};
$('pVague').onclick=()=>{pauseEl.classList.remove('on');choisirVague(false);};
$('pSon').onclick=()=>{sonOn=!sonOn;couperSon();$('pSon').textContent=sonOn?'Son : oui':'Son : non';};
$('pRecommencer').onclick=()=>demarrer(0,false);
/* (version 15) ouvert depuis la salle des jeux du site : un bouton pour y revenir */
if(/[?&]depuis=salle/.test(location.search)){const b=$('pSalle');b.hidden=false;b.onclick=()=>{location.href='salle.html';};}
btnGo.onclick=()=>{if(btnGo.disabled)return;finExtrait();demarrer(0,false);};
function duree(){const s=Math.round(tReel-stats.debut);return `${Math.floor(s/60)} min ${String(s%60).padStart(2,'0')}`;}
function victoire(){finDans=1.3;son('victoire');musique(false);}
function montrerVictoire(){
  etatJeu='fin';boutonsJeu(false);
  finCarte.innerHTML=`<h1>La garde est en miettes !</h1>
  <div class="stats"><span>Durée</span><b>${duree()}</b><span>Golems tombés</span><b>${stats.tues}</b><span>Tombés entre eux</span><b>${stats.tuesEntreEux}</b><span>Embuscades</span><b>${stats.embuscades}</b><span>Golems assommés</span><b>${stats.assommes}</b><span>Golems semés</span><b>${stats.semes}</b><span>Coups esquivés</span><b>${stats.esquives}</b><span>Vie perdue</span><b>${Math.round(stats.recus)}</b><span>Bandages posés</span><b>${stats.bandagesPoses-stats.bandagesPerdus} sur ${REG.bandage.nb}</b><span>Vie à la fin</span><b>${Math.ceil(P.hp)}</b></div>
  <div class="bas"><button class="jaune" id="fRejouer">Rejouer</button></div>`;
  finEl.classList.add('on');$('fRejouer').onclick=()=>demarrer(0,false);
}
/* De quelle vague repartir ? (Romain, 25 novembre, 22 h : « quand on meurt au stage 7, c'est trop frustrant de tout recommencer ».)
   Le jeu a gardé la vie, les bandages et les cartes qu'on avait en commençant chaque vague : on choisit, et on les retrouve.
   Chaque tuile les affiche, pour ne pas choisir à l'aveugle (vague 7 commencée avec 3 points de vie ? mieux vaut repartir de la 6).
   Pas un mot d'explication : le numéro de la vague, un cœur, un pansement, les cartes ; le rond jaune est sur celle où il est tombé. */
function choisirVague(aTerre){
  let t='';
  for(let i=0;i<VAGUES.length;i++){
    const s=sauves[i];if(!s)continue;
    const nc=CARTES.reduce((a,n)=>a+(s.cartes[n]?1:0),0);
    t+=`<button class="jaune tuile${i===vague?' anneau':''}" data-vague="${i}" aria-label="Repartir de la vague ${i+1} : ${Math.ceil(s.hp)} points de vie, ${s.bandages} bandages, ${nc} cartes"><b>Vague ${i+1}</b><span>❤ ${Math.ceil(s.hp)} · 🩹 ${s.bandages} · ✦ ${nc}</span></button>`;
  }
  finCarte.innerHTML=`<div class="tuiles">${t}</div>
  <div class="bas">${aTerre?'<button class="gris" id="fDebut">Tout recommencer</button>':'<button class="gris" id="fRetour">Retour</button>'}</div>`;
  finEl.classList.add('on');
  for(const b of finCarte.querySelectorAll('[data-vague]'))b.onclick=()=>{const i=+b.dataset.vague;demarrer(i,true,sauves[i]);};
  if(aTerre)$('fDebut').onclick=()=>demarrer(0,false);else $('fRetour').onclick=()=>{finEl.classList.remove('on');pauseEl.classList.add('on');};
}
function defaite(){
  musique(false);etatJeu='fin';boutonsJeu(false);
  choisirVague(true);
}

/* ======================= la boucle ======================= */
let dernier=performance.now(),fpsN=0,fpsT=0,fpsMoy=60,pire=999,essaisFps=0,rythmeD=null,chargeT0=0,prepare=0;
function chargement(){
  /* pendant que la barre avance : on cuit la salle, puis le Pisteur, puis les golems ; ensuite l'extrait démarre et le bouton jaune s'allume */
  const el=$('chargement').firstElementChild;
  if(prepare===0){prepare=1;el.style.width='6%';return;}
  if(prepare===1){preparerImages();prepare=2;chargeT0=tReel;PS.lancer(S0,()=>{});return;}
  if(prepare===2){
    if(PS.essentiel&&Salle.pret){prepare=3;btnGo.disabled=false;btnGo.classList.add('anneau');el.style.width='100%';regles.classList.add('pret');if(/[?&]extrait=oui/.test(location.search))lancerExtrait();}   /* (version 15, Romain, 26 novembre, 18 h : plus d'extrait avant de jouer, « juste un bouton démarrer » ; ?extrait=oui pour le revoir) */
    else el.style.width=Math.round(8+PS.avance*92)+'%';
  }
}
function pasDeJeu(dt){
  lireEntrees();majJoueur(dt);
  majPerception(dt);majGolems(dt);majProjectiles(dt);majVagues(dt);
}
function boucle(now){
  requestAnimationFrame(boucle);
  let dt=(now-dernier)/1000;dernier=now;if(!(dt>0))dt=0.016;dt=Math.min(dt,0.05);
  tReel+=dt;
  if(prepare<3)chargement();else if(etatJeu!=='jeu'||enPause){GS.precuire(6);}
  {const d=etatJeu==='jeu'&&!enPause;if(d!==rythmeD){rythmeD=d;PS.rythme(d);}}
  const actif=etatJeu==='jeu'&&!enPause&&!tourne&&!fige;
  if(actif){
    fpsN++;fpsT+=dt;
    if(fpsT>=1.5){fpsMoy=fpsN/fpsT;fpsN=0;fpsT=0;if(tReel-stats.debut>4)pire=Math.min(pire,fpsMoy);
      /* si l'appareil peine, l'image devient moins fine (la finesse 3 : le dernier recours, seulement sous 27 images par seconde) */
      if((fpsMoy<33&&finesse<2||fpsMoy<27&&finesse===2)&&essaisFps<5&&PS.complet&&!/[?&]finesse=/.test(location.search)){essaisFps++;finesse++;try{localStorage.setItem('pisteur5_finesse',finesse);}catch(e){}taille();}}
    if(GS.file)GS.precuire(2.5);
    if(demo)pasExtrait(dt);
    if(hitstop>0)hitstop-=dt;
    else{
      const pr=window.__prof,u0=pr?performance.now():0;
      pasDeJeu(dt);
      if(pr)pr.regles=(pr.regles||0)+performance.now()-u0;
    }
    majParts(dt);
    porte[0]=Math.max(0,porte[0]-dt*0.45);porte[1]=Math.max(0,porte[1]-dt*0.45);
    const d=hyp(P.x-P.lx,P.y-P.ly);P.court=d>0.004&&P.etat==='libre';P.pas+=d;P.lx=P.x;P.ly=P.y;
    btT-=dt;if(btT<=0){btT=0.08;majRecharges();}
    if(defaiteDans>0){defaiteDans-=dt;if(defaiteDans<=0)defaite();}
    if(finDans>0){finDans-=dt;if(finDans<=0)montrerVictoire();}
  }
  sec=Math.max(0,sec-dt*26);flashR=Math.max(0,flashR-dt*1.6);flashB=Math.max(0,flashB-dt*1.2);flashV=Math.max(0,flashV-dt*2.2);
  majSon(actif);
  dessiner(dt);
}

/* ======================= une scène posée à la main (les essais, et l'extrait) ======================= */
function poserScene(p,golems,opt){
  opt=opt||{};demarrer(0,false);G=[];file=[];essai=true;bandeau=null;
  if(opt.sansObstacles){OBS=OBS.filter(o=>o.fond);majGrille();}
  P.x=p[0];P.y=p[1];P.fa=p[2]||0;P.lx=P.x;P.ly=P.y;majCamera(10);
  for(const s of golems){const g=nouveauGolem(s.t,s.x,s.y,s.x,s.y,{grp:s.grp||1,poste:s.immobile?[s.x,s.y]:s.poste,a:s.fa,route:s.route});g.etat='normal';g.fa=g.reg=g.regC=s.fa||0;g.posteA=s.fa||0;
    g.cd=s.cd==null?0:s.cd;g.cdS=s.cdS==null?0:s.cdS;g.cdM=s.cdM==null?0:s.cdM;if(s.hp)g.hp=s.hp;if(s.vit!=null)g.vit=s.vit;G.push(g);}
  return G.length;
}

/* ======================= l'extrait =======================
   (Romain, 25 novembre, 23 h : « Enlève-moi tous les tutos, tous les textes qui expliquent. Au moment de jouer au mini-jeu, le seul truc
   que tu peux faire, c'est montrer une sorte d'extrait pour qu'on comprenne comment ça marche. Et pas de texte. »)
   Avant de jouer, le jeu se joue tout seul : trois petites scènes qui tournent en boucle, sans un mot et sans un son. Un doigt blanc
   se pose sur les boutons, la manette de gauche bouge : on voit ce qu'on touche et ce que ça fait. C'est le vrai jeu, avec ses vraies
   règles, joué par une suite de gestes écrite d'avance. Le bouton jaune est là dès le début : on n'est pas obligé de regarder.
     1. personne ne regarde : le bouton d'ombre, on arrive par-derrière, la tête de mort ;
     2. un golem te voit : le bouton d'ombre est gris ; un mur entre vous, trois secondes, il se rallume ;
     3. du rouge par terre : le saut, puis la dague, trois fois. */
const doigtEl=$('doigt');
function doigtSur(el,dur){const r=el.getBoundingClientRect();doigtEl.style.left=(r.left+r.width/2)+'px';doigtEl.style.top=(r.top+r.height/2)+'px';doigtEl.classList.add('pose');el.classList.add('appui');demo.doigt={el,t:dur||0.3};}
function doigtLeve(){if(demo&&demo.doigt){demo.doigt.el.classList.remove('appui');demo.doigt=null;}doigtEl.classList.remove('pose');}
/* les gestes d'une scène : chacun rend true quand il est fini (t : le temps passé dans ce geste) */
const EX={
  attendre:d=>t=>t>=d,
  toucher:n=>(t,D)=>{if(!D.fait){D.fait=true;doigtSur(BT[n],0.32);appui(n);}return t>=0.45;},
  tenir:(n,d)=>(t,D)=>{if(!D.fait){D.fait=true;doigtSur(BT[n],d);tenu[n]=true;appui(n);}if(t>=d){tenu[n]=false;return true;}return false;},
  /* marcher jusqu'à un point, en contournant les murs */
  aller:(x,y,v)=>(t,D)=>{
    const d=hyp(x-P.x,y-P.y);if(d<0.12||t>7){robot.mx=robot.my=0;return true;}
    if(!D.ch)D.ch=champ(x,y);
    let tx=x,ty=y;if(!vue(P.x,P.y,x,y,true)){const q=pasVers({x:P.x,y:P.y,r:0.33},D.ch);tx=q[0];ty=q[1];}
    const e=hyp(tx-P.x,ty-P.y)||1,k=(v||1)*Math.min(1,d/0.5+0.35);robot.mx=(tx-P.x)/e*k;robot.my=(ty-P.y)/e*k;return false;},
  /* le saut : le pouce gauche donne la direction, le doigt droit touche le bouton */
  sauter:(mx,my)=>(t,D)=>{robot.mx=mx;robot.my=my;if(t>=0.12&&!D.fait){D.fait=true;doigtSur(BT[3],0.3);appui(3);}if(t>=0.5){robot.mx=robot.my=0;return true;}return false;},
  quand:(f,max)=>t=>f()||t>=(max||6),
  faire:f=>()=>{f();return true;}
};
const EXTRAITS=[
  /* 1. l'ombre, puis l'embuscade par-derrière */
  {pose:()=>poserScene([12.5,13.4,-Math.PI/2],[{t:'chien',x:12.5,y:9.6,fa:-Math.PI/2,immobile:1,cd:99,cdS:99,cdM:99}]),
   gestes:()=>[EX.attendre(0.9),EX.toucher(4),EX.attendre(0.5),EX.quand(()=>(EX.aller(12.5,11.15)(0,demo.D),!!P.aPortee&&hyp(P.x-12.5,P.y-11.15)<0.25),6),
     EX.faire(()=>{robot.mx=robot.my=0;}),EX.attendre(0.7),EX.toucher(1),EX.attendre(1.5)]},
  /* 2. vu : le bouton d'ombre est gris. Un mur entre eux, trois secondes sans témoin, et il se rallume */
  {pose:()=>poserScene([17.6,9.5,Math.PI/2],[{t:'javelot',x:17.6,y:7.3,fa:Math.PI/2,immobile:1,cd:99,cdS:99,cdM:99,vit:0}]),
   gestes:()=>[EX.attendre(1.3),EX.toucher(4),EX.attendre(0.6),EX.aller(15.3,10.4),EX.aller(15.3,11.9),EX.aller(17.4,12.5),EX.quand(()=>P.ombreCD<=0&&nVoient===0,6),EX.attendre(0.5),EX.toucher(4),EX.attendre(1.3)]},
  /* 3. le rouge : la flèche du rôdeur se fige, un saut de côté, il s'étale ; puis la dague, trois fois */
  {pose:()=>poserScene([12.5,13.2,-Math.PI/2],[{t:'chien',x:12.5,y:9.7,fa:Math.PI/2,immobile:1,cd:99,cdS:0,cdM:99}]),
   gestes:()=>[EX.quand(()=>{const g=G[0];return !!g&&g.etat==='vise'&&g.t>=REG.chien.plaqFige+0.3;},5),EX.sauter(1,0),
     EX.quand(()=>{const g=G[0];return !g||g.etat==='etale'||g.etat==='mort';},3),
     EX.quand(()=>{const g=G[0];if(!g||!vivant(g))return true;return EX.aller(g.x+0.95,g.y,1)(0,demo.D)||hyp(P.x-g.x,P.y-g.y)<1.25;},4),
     EX.faire(()=>{robot.mx=robot.my=0;}),EX.tenir(1,2.3),EX.attendre(0.9)]}
];
function lancerExtrait(i){
  if(etatJeu==='jeu'&&!demo)return;                     /* une partie est en cours : on n'y touche pas */
  i=(i||0)%EXTRAITS.length;const E=EXTRAITS[i];
  if(demo)doigtLeve();
  demo={i,k:0,t:0,D:{},doigt:null,noir:0,gestes:null};
  robot.mx=robot.my=0;for(let n=1;n<=4;n++)tenu[n]=false;
  demoPose=true;E.pose();demoPose=false;invincible=true;sauves=[];demo.gestes=E.gestes();
  P.cartes={fleche:0,sifflet:0,cape:0};for(const nom of CARTES)CT[nom].classList.remove('on');bPause.classList.remove('on');      /* l'extrait ne montre que l'essentiel */
  regles.classList.add('on');regles.classList.add('extrait');regles.classList.remove('noir');
}
function pasExtrait(dt){
  const d=demo;
  if(d.doigt){d.doigt.t-=dt;if(d.doigt.t<=0)doigtLeve();}
  if(d.noir>0){d.noir-=dt;if(d.noir<=0)lancerExtrait(d.i+1);return;}              /* un fondu au noir entre deux scènes */
  d.t+=dt;
  if(d.gestes[d.k](d.t,d.D)){d.k++;d.t=0;d.D={};
    if(d.k>=d.gestes.length){d.k=d.gestes.length-1;d.gestes[d.k]=()=>false;d.noir=0.3;regles.classList.add('noir');robot.mx=robot.my=0;}}
}
function finExtrait(){
  if(!demo)return;
  doigtLeve();demo=null;invincible=false;robot.mx=robot.my=0;for(let n=1;n<=4;n++)tenu[n]=false;
  regles.classList.remove('extrait');regles.classList.remove('noir');pire=999;
}

/* ======================= pour les essais automatiques ======================= */
window.__pt={
  etat:()=>({etatJeu,phase,vague,enPause,fps:fpsMoy,pire,finesse,vitesseApp,taille:[can.width,can.height],tVague,prepare,nVoient,t:tReel,
    sauves:sauves.map(s=>s?{hp:s.hp,bandages:s.bandages,cartes:Object.assign({},s.cartes)}:null),leurres:leurres.filter(L=>tReel<L.t).map(L=>({x:L.x,y:L.y,grp:L.grp})),
    P:{x:P.x,y:P.y,z:P.z,hp:P.hp,max:P.max,bandages:P.bandages,cartes:Object.assign({},P.cartes),capeT:P.capeT,cibles:{fleche:P.cibles.fleche?G.indexOf(P.cibles.fleche):-1,sifflet:P.cibles.sifflet?G.indexOf(P.cibles.sifflet):-1},etat:P.etat,t:P.t,ombre:P.ombre,ombreCD:P.ombreCD,rang:P.rang,sautCD:P.sautCD,sautOmbreCD:P.sautOmbreCD,
      fa:P.fa,lentT:P.lentT,saigne:P.saigne.length,peutBouger:pPeutBouger(),aPortee:P.aPortee?G.indexOf(P.aPortee):-1},
    G:G.filter(g=>g.etat!=='mort').map(g=>({i:G.indexOf(g),type:g.type,x:g.x,y:g.y,hp:g.hp,max:g.max,etat:g.etat,t:g.t,fa:g.fa,reg:g.reg,r:g.r,mode:g.mode,voit:g.voit,hes:g.hes,sonne:g.sonne,lent:g.lentT,
      aDalle:g.aDalle,grp:g.grp,armure:!!g.T.armure,cone:g.T.cone,marge:margeEcran(g.x,g.y),su:{x:g.su.x,y:g.su.y},
      dort:!!g.dort,dechaine:!!g.dechaine,penche:!!g.penche,leurre:!!(g.leurre&&tReel<g.leurre.t),soin:g.soin?G.indexOf(g.soin):-1,rue:tReel<g.rue,
      colere:!!g.colere,fantome:!!g.fantome,furie:!!g.furie,boule:!!g.boule,enrage:!!g.enrage,va:g.va,pi:g.pi,colle:g.colle?G.indexOf(g.colle):-1,couvert:!!gardeDe(g),zone:g.zone?{k:g.zone.k,x:g.zone.x,y:g.zone.y,a:g.zone.a,L:g.zone.L,l:g.zone.l,R:g.zone.R,r:g.zone.r,r0:g.zone.r0,r1:g.zone.r1,h:g.zone.h,p:g.zone.p,fige:!!g.zone.fige,lim:g.zone.lim?Array.from(g.zone.lim):null}:null})),
    obus:obus.map(o=>({x:o.x1,y:o.y1,t:o.t,dur:o.dur,r:o.r})),javs:javs.map(j=>({x:j.x,y:j.y,a:j.a,v:j.v})),
    obs:OBS.map(o=>({k:o.k,x:o.x,y:o.y,c:o.c||0,r:o.r||0,w:o.w||0,d:o.d||0,haut:o.haut||0,fond:o.fond||0})),
    stats,extrait:demo?demo.i:-1,nFlair,piste:pisteBase+piste.length,coleres:Object.keys(grpColere).length}),
  cmd:o=>{for(const k of ['mx','my'])if(k in o)robot[k]=o[k];},
  appui:n=>{appui(n);},
  carte:nom=>jouerCarte(nom),
  reprendreVague:i=>{finExtrait();demarrer(i,true,sauves[i]);},
  tenir:(n,v)=>{tenu[n]=!!v;if(v)appui(n);},
  demarrer:i=>{finExtrait();demarrer(i||0,false);},
  suivant:()=>passerVague(),
  invincible:v=>{invincible=!!v;},
  vue:(a,b,c,d,h)=>vue(a,b,c,d,h),
  /* une scène d'essai : des golems posés où on veut, sans vague. golems : [{t,x,y,fa,grp,poste,route}] */
  scene:(p,golems,opt)=>{finExtrait();return poserScene(p,golems,opt);},
  extrait:i=>{lancerExtrait(i);},
  /* avancer le jeu à la main, sans attendre l'écran (pour mesurer les règles à pas fixes) */
  figer:v=>{fige=!!v;},
  pas:(n,dt)=>{
    dt=dt||1/60;
    for(let i=0;i<n;i++){
      tReel+=dt;if(etatJeu!=='jeu')return etatJeu;
      if(hitstop>0)hitstop-=dt;else pasDeJeu(dt);
      majParts(dt);
      if(defaiteDans>0){defaiteDans-=dt;if(defaiteDans<=0){etatJeu='aterre';return 'aterre';}}
      if(finDans>0){finDans-=dt;if(finDans<=0){etatJeu='gagne';return 'gagne';}}
    }
    return etatJeu;
  },
  margeEcran:(x,y)=>margeEcran(x,y),
  portee:(x,y,a,max)=>porteeRegard(x,y,a,max),
  dansZone:(z,x,y,m)=>dansZone(z,x,y,m||0),
  rayon:(x,y,a,max,m)=>rayon(x,y,a,max,m||0.05),
  obsEn:(x,y,m,h)=>obsEn(x,y,m,h),
  caches:()=>cachettes.map(c=>[c.x,c.y]),
  /* le chemin d'un point à un autre, en contournant les obstacles : le prochain point où aller */
  chemin:(()=>{let D=null,tx=-9,ty=-9;return (x,y,bx,by)=>{if(!D||Math.abs(bx-tx)+Math.abs(by-ty)>0.4){D=champ(bx,by);tx=bx;ty=by;}return pasVers({x,y},D);};})(),
  distances:(x,y)=>{const D=champ(x,y);return (a,b)=>D[cel(a,b)]*CEL;},
  reg:()=>REG,
  ev:s=>eval(s)
};

/* ======================= au départ ======================= */
resetP();stats=nouveauxStats();OBS=OBS0.map(o=>({...o}));majGrille();
mesurerAppareil();taille();camX=clamp(px(P.x)-Ws/2,0,Math.max(0,SW-Ws));camY=clamp(py(P.y)-Hs*0.6,58,Math.max(58,SH-Hs));
requestAnimationFrame(boucle);
