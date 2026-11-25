/* ======================= l'état du combat ======================= */
let etatJeu='regles',enPause=false,dur=false,choixOuvert=false,tourne=false,invincible=false;
let hitstop=0,sec=0,flashR=0,flashB=0,flashV=0,defaiteDans=0,finDans=0,loupT=0,dernierChien=-9;
const P={up:{}};
let G=[],fleches=[],javs=[],obus=[],ondes=[],feux=[],loups=[],items=[],parts=[],leurres=[],champJ=null,champJT=-9;
let vague=0,phase='',phaseT=0,groupeI=0,dernierGroupe=0,file=[],stats={},vus={},bandeau=null,tVague=0;
/* la garde : 'calme' (elle ne sait pas où est le Pisteur), 'alerte' (elle le voit), 'recherche' (elle vient de le perdre) */
let garde='calme',nVus=0,tSansVue=0,tRecherche=0,tCacheCumul=0,CX=13,CY=14;
const dernVu={x:13,y:14};
/* Grosbec le stratège : ses ordres, son regard */
const DIR={patrouille:false,groupes:false,debusque:false,assaut:false,nAss:0,ordreTxt:'',ordreT:-9,fouille:{x:13,y:10},fouilleT:0,fils:[],seulT:0,
  oeil:{a:0.4,sens:1,boost:1,sur:0,aveugle:0,larg:0.08,poly:null,polyT:-9}};
const GBE={colere:0,sonne:0,bulle:'',bulleT:-9};
function gbGeste(nom,sd){if(typeof Gros!=='undefined')Gros.jouer(nom,tReel,sd||1);}
function gbDire(t){GBE.bulle=t;GBE.bulleT=tReel;}
function resetP(garder){
  const up=garder?P.up:{};
  Object.assign(P,{x:13,y:16.4,z:0,fa:-Math.PI/2,etat:'libre',t:0,combo:0,comboT:-9,dernier:false,coeurs:6,max:6,invul:0,charges:1,chgT:0,arcCD:0,javelots:0,
    bx:0,by:0,ax:0,ay:0,dur:0.19,kx:0,ky:0,coupFait:false,saute:false,traverses:[],cache:true,invisible:0,rapide:0,bondGratuit:false,charge:0,cibleA:null,chaineVers:null,
    capeGaze:2,ombreCD:0,assCD:0,leurreVague:false,leurreT:0,vivT:0,ombreProt:true,danse2:0,nFleches:0,slash:null,pas:0,lx:13,ly:16.4,court:false,cibleVise:null});
  if(!garder){P.kills=0;P.dernierPasFait=false;}
  P.up=up;if(up.coeur)P.max=8;if(up.deuxBonds)P.charges=2;P.coeurs=P.max;
}

/* ======================= le conteur ======================= */
const conteurEl=$('conteur'),conteurTxt=$('conteurTxt');
let msgQ=[],msgT=0,msgCur=null;
function dire(cle,txt,force){
  if(cle){if(vus[cle])return false;vus[cle]=1;}
  if(force){msgQ=[];afficherMsg(txt);}else if(!msgCur)afficherMsg(txt);else if(msgQ.length<2)msgQ.push(txt);
  return true;
}
function afficherMsg(t){msgCur=t;msgT=tReel;conteurTxt.textContent=t;conteurEl.classList.add('on');}
function majMsg(){if(msgCur&&tReel-msgT>5){if(msgQ.length)afficherMsg(msgQ.shift());else{msgCur=null;conteurEl.classList.remove('on');}}}
function cacherMsg(){msgCur=null;msgQ=[];conteurEl.classList.remove('on');}

/* ======================= le Pisteur ======================= */
const inp={mx:0,my:0,dague:false,arc:false};
const clav={h:0,b:0,g:0,d:0,dague:false,arc:false};
const joy={id:null,bx:0,by:0,x:0,y:0,mx:0,my:0,vx:0,vy:0};
const robot={mx:0,my:0,dague:false,arc:false};
const boutons={dague:false,arc:false};
const doigtsDague=new Set();
let bondDemande=false;
function lireEntrees(){
  let mx=joy.mx+(clav.d-clav.g)+robot.mx,my=joy.my+(clav.b-clav.h)+robot.my;const n=hyp(mx,my);if(n>1){mx/=n;my/=n;}
  inp.mx=mx;inp.my=my;inp.dague=boutons.dague||clav.dague||robot.dague||doigtsDague.size>0;inp.arc=boutons.arc||clav.arc||robot.arc;
}
const vivant=g=>g.etat!=='mort'&&g.etat!=='entre';
function vitesseP(){return 5.4*(P.up.leger?1.2:1)*(P.rapide>0?1.3:1);}
function deplacer(f,dt){
  const v=vitesseP()*f;P.x+=inp.mx*v*dt;P.y+=inp.my*v*dt;
  pousserHors(P,0.33,false);
  for(const g of G){if(!vivant(g)||g.etat==='saut')continue;const dx=P.x-g.x,dy=P.y-g.y,d=hyp(dx,dy),m=g.r+0.3;if(d<m&&d>1e-4){P.x=g.x+dx/d*m;P.y=g.y+dy/d*m;}}
  pousserHors(P,0.33,false);
}
function viser(cone,portee,obstacles){
  let best=null,bs=1e9;
  for(const g of G){
    if(!vivant(g))continue;
    const dx=g.x-P.x,dy=g.y-P.y,d=hyp(dx,dy);if(d>portee)continue;
    const a=Math.abs(ang(Math.atan2(dy,dx)-P.fa));if(a>cone)continue;
    if(obstacles&&!vue(P.x,P.y,g.x,g.y))continue;
    const s=d+a*3;if(s<bs){bs=s;best=g;}
  }
  return best;
}
/* où se poser dans le dos d'un golem */
function dos(g){
  for(const da of [0,0.8,-0.8,1.6,-1.6,2.4,-2.4,Math.PI]){
    const a=g.fa+Math.PI+da,x=g.x+Math.cos(a)*(g.r+0.55),y=g.y+Math.sin(a)*(g.r+0.55);
    if(!horsSalle(x,y,0.33)&&!obsEn(x,y,0.3,false))return {x,y};
  }
  return {x:P.x,y:P.y};
}
function cibleAssassin(){
  let best=null,bd=1e9;
  for(const g of G){if(!vivant(g))continue;const d=hyp(g.x-P.x,g.y-P.y)-g.r;if(d<2.5&&d<bd&&vue(P.x,P.y,g.x,g.y)){bd=d;best=g;}}
  return best;
}
function cibleOmbre(R){
  let best=null,bd=1e9;
  for(const g of G){if(!vivant(g))continue;const d=hyp(g.x-P.x,g.y-P.y);if(d<R&&d>1.5&&d<bd){bd=d;best=g;}}
  return best;
}
function temoinsDe(g){
  if(dansNuage(P.x,P.y))return [];
  return G.filter(o=>o!==g&&vivant(o)&&tReel>=o.sonneJ&&o.etat!=='sonne'&&hyp(o.x-P.x,o.y-P.y)<11&&!dansNuage(o.x,o.y)&&vue(o.x,o.y,P.x,P.y));
}
/* ---- la dague ---- */
function debutDague(){
  if(P.cache){const g=cibleAssassin();if(g){if(P.assCD<=0)debutAssassin(g);return;}}
  const cible=viser(1.6,2.8,false);if(cible)P.fa=Math.atan2(cible.y-P.y,cible.x-P.x);
  const nmax=P.up.enchainement?5:3;
  P.combo=(tReel-P.comboT<0.42&&P.combo<nmax)?P.combo+1:1;
  P.dernier=P.combo===nmax;P.etat='coup';P.t=0;P.coupFait=false;P.dur=P.dernier?0.3:0.19;son('swish');
}
function frapperDague(deux){
  const der=P.dernier,tour=der&&(P.up.tourbillon||P.up.danse),k=P.up.longue?1.3:1,portee=(der?1.7:1.4)*k,dmg=(der?2:1)+(P.up.affutee?1:0);
  const recul=der?(P.up.lourd||P.up.danse?3.2:1.4):0.3;
  let touche=false;
  for(const g of G){
    if(!vivant(g))continue;
    const dx=g.x-P.x,dy=g.y-P.y,d=hyp(dx,dy)-g.r;if(d>(tour?2.1*k:portee))continue;
    if(!tour&&Math.abs(ang(Math.atan2(dy,dx)-P.fa))>1.15)continue;
    if(blesserG(g,dmg,P.x,P.y,'dague',recul))touche=true;
  }
  if(touche&&der)secousse(3.5);
  P.slash={t:tReel,a:P.fa,tour,der,n:P.combo};
  if(der&&P.up.danse&&!deux)P.danse2=tReel+0.14;
}
function debutAssassin(g){
  const s=dos(g);
  Object.assign(P,{etat:'assassin',t:0,cibleA:g,ax:P.x,ay:P.y,bx:s.x,by:s.y,coupFait:false,chaineVers:null});
  P.invisible=Math.max(P.invisible,0.6);P.fa=Math.atan2(g.y-s.y,g.x-s.x);son('ombre');
}
function effetAssassin(g){
  if(!vivant(g))return;
  if(g.type==='chien'||g.type==='javelot'||g.type==='mortier')blesserG(g,999,P.x,P.y,'assassin',0);
  else{
    const dmg=g.T.armure?g.max/(P.up.briseur?2:3)+0.01:Math.ceil(g.max*(P.up.assassin?0.5:0.4));
    blesserG(g,dmg,P.x,P.y,'assassin',0);
    if(vivant(g)){sonner(g,2);g.ouvert=tReel+4;if(P.up.saignee)g.saigne=[4,4,4];if(g.T.armure)texte(g.x,g.y,g.T.h+0.5,g.hp>g.max*0.4?'Encore deux !':'Encore un !','#c8b6ff');}
  }
  eclatOmbre(g.x,g.y,g.T.h*0.5);
}
function frapperAssassin(g){
  if(!vivant(g))return;
  const gros=!(g.type==='chien'||g.type==='javelot'||g.type==='mortier');
  effetAssassin(g);
  if(P.up.danse){for(const o of G)if(o!==g&&vivant(o)&&hyp(o.x-P.x,o.y-P.y)<2.5+o.r)effetAssassin(o);P.slash={t:tReel,a:P.fa,tour:true,der:true,n:3};}
  secousse(6);hitstop=Math.max(hitstop,0.09);flashV=0.5;son('assassin');stats.assassinats++;P.assCD=1.4;
  /* le bruit : les golems d'à côté viennent voir */
  for(const o of G)if(o!==g&&vivant(o)&&hyp(o.x-P.x,o.y-P.y)<6.5&&!o.enquete)o.enquete={x:P.x,y:P.y};
  texte(P.x,P.y,1.9,gros?"Coup d'assassin !":'Assassinat !','#c8b6ff');
  if(P.up.fumee)nuages.push({x:P.x,y:P.y,r:2.3,t:4,max:4});
  if(P.up.meute)lacherLoup(true);
  const tem=temoinsDe(g);
  if(tem.length)alerter(tem[0]);
  else{texte(P.x,P.y,2.4,'Ni vu ni connu','#9fe6c0');dire('discret1',"Ni vu ni connu. Mais chaque assassinat énerve Grosbec : son regard va plus vite.");}
  directeurAssassinat(g,!tem.length);
  if(P.up.chaine&&g.etat==='mort'&&garde!=='alerte'){P.chaineVers=cibleOmbre(7);if(P.chaineVers)P.assCD=0.3;}
}
/* ---- l'arc ---- */
function debutArc(){
  if(P.javelots>0){lancerJavelot();return;}
  if(P.arcCD>0)return;
  if(P.cache){P.etat='vise';P.t=0;P.charge=0;son('bande');dire('vise1',"Caché, le Pisteur prend son temps : garde le doigt sur l'arc, puis lâche. La flèche ne fait pas de bruit.");}
  else tirer();
}
function dureeVise(){return 0.75*(P.up.mainSure?0.5:1);}
function tirer(){
  const c=viser(0.55,13,!P.up.cloche),a=c?Math.atan2(c.y-P.y,c.x-P.x):P.fa;P.fa=a;
  P.nFleches++;const ray=P.up.rayon&&P.nFleches%5===0;
  for(const b of P.up.triple?[a-0.2,a,a+0.2]:[a])fleches.push({x:P.x,y:P.y,a:b,v:ray?26:17,L:0,touches:[],perce:ray?99:(P.up.perfo?3:1),dmg:ray?2:1,rayon:ray,haut:!!P.up.cloche});
  P.arcCD=P.up.rafale?0.19:0.32;P.etat='tir';P.t=0;P.tirT=tReel;son(ray?'tirVise':'arc');
}
function lacherVise(){
  const plein=P.charge>=1,c=P.cibleVise&&vivant(P.cibleVise)?P.cibleVise:null,a=c?Math.atan2(c.y-P.y,c.x-P.x):P.fa;P.fa=a;
  if(plein){
    const dmg=4+(P.up.pointFaible?2:0)+(P.up.cloche?2:0);
    fleches.push({x:P.x,y:P.y,a,v:34,L:0,touches:[],perce:P.up.rayon?99:(P.up.perfo?3:1),dmg,vise:true,silence:true,rayon:!!P.up.rayon,cloche:!!P.up.cloche,pin:P.up.clou?3:2});
    P.arcCD=2.2;son('tirVise');stats.tirsVises++;
  }else{fleches.push({x:P.x,y:P.y,a,v:17,L:0,touches:[],perce:1,dmg:1,silence:true});P.arcCD=0.45;son('arc');}
  P.etat='tir';P.t=0;P.tirT=tReel;P.charge=0;P.cibleVise=null;
}
function lancerJavelot(){
  const c=viser(0.5,14,true),a=c?Math.atan2(c.y-P.y,c.x-P.x):P.fa;P.fa=a;
  javs.push({x:P.x,y:P.y,a,v:20,L:0,joueur:true,ombre:P.cache});P.javelots--;vus.javLance=1;majBoutonArc();son('jav');P.etat='tir';P.t=0;P.tirT=tReel;P.arcCD=0.3;
}
/* ---- le bond ---- */
function demanderBond(){
  if(etatJeu!=='jeu'||enPause||choixOuvert)return;
  if(P.etat==='bond'||P.etat==='touche'||P.etat==='aterre'||P.etat==='assassin'||P.etat==='ombre')return;
  if(P.cache&&P.ombreCD<=0){const g=cibleOmbre(P.up.sautLong?10:5);if(g){sautOmbre(g);return;}}
  if(P.charges<=0&&!P.bondGratuit)return;
  if(P.bondGratuit)P.bondGratuit=false;else{P.charges--;P.chgT=0;}
  const n=hyp(inp.mx,inp.my),a=n>0.2?Math.atan2(inp.my,inp.mx):P.fa,L=3.7*(P.up.bondLong?1.4:1);P.fa=a;
  P.dur=0.19*(P.up.bondLong?1.2:1);P.etat='bond';P.t=0;P.bx=Math.cos(a)*L/P.dur;P.by=Math.sin(a)*L/P.dur;P.saute=false;P.traverses=[];P.charge=0;
  if(P.up.pasOmbre&&P.cache)P.invisible=Math.max(P.invisible,P.dur+0.45);
  if(P.up.fumee&&!P.cache)nuages.push({x:P.x,y:P.y,r:2.2,t:3.5,max:3.5});
  son('saut');bBond.classList.remove('anneau');
}
function sautOmbre(g){
  const s=dos(g);
  Object.assign(P,{etat:'ombre',t:0,cibleA:g,ax:P.x,ay:P.y,bx:s.x,by:s.y,coupFait:false,charge:0});
  P.invisible=Math.max(P.invisible,0.7);P.ombreCD=4;son('ombre');stats.sauts++;eclatOmbre(P.x,P.y,0.6);
  dire('ombre1',"Un saut d'ombre : le Pisteur ressort dans le dos du golem le plus proche. Et maintenant, la dague…");
}
function disparaitre(d){
  P.invisible=Math.max(P.invisible,d);eclatOmbre(P.x,P.y,0.6);texte(P.x,P.y,2.2,'Disparu !','#c8b6ff');
  if(garde==='alerte'&&!DIR.assaut)perdre();
}
function finBond(){
  const ux=Math.cos(P.fa),uy=Math.sin(P.fa);
  let k=0;while(obsEn(P.x,P.y,0.33,false)&&k<26){P.x+=ux*0.1;P.y+=uy*0.1;k++;}
  pousserHors(P,0.33,false);
  if(P.saute)dire('saute1',"Hop, par-dessus ! Les golems, eux, doivent faire le tour.");
  if(P.up.atterrissage){
    for(const g of G){if(!vivant(g)||g.type==='colosse')continue;const dx=g.x-P.x,dy=g.y-P.y,d=hyp(dx,dy);if(d<2.1+g.r){pousser(g,dx/(d||1),dy/(d||1),2.4);}}
    parts.push({k:'onde',x:P.x,y:P.y,z:0,ox:0,oy:0,vie:.3,max:.3,s:1.6});son('impact');
  }
  if(P.up.roulade&&P.traverses.length&&garde==='alerte')P.bondGratuit=true;
  if(P.up.pasOmbre&&garde==='alerte'&&obsEn(P.x,P.y,0.85,false))disparaitre(1.4);
  P.etat='libre';P.t=0;P.z=0;
}
function pousser(g,ux,uy,force){
  if(g.type==='colosse'||g.etat==='charge')return;
  g.kx=ux*force*6;g.ky=uy*force*6;g.pousse=true;
  if(garde!=='alerte'&&!P.up.boulets)alerter(g);
}
function majJoueur(dt){
  P.t+=dt;P.arcCD=Math.max(0,P.arcCD-dt);P.ombreCD=Math.max(0,P.ombreCD-dt);P.assCD=Math.max(0,P.assCD-dt);P.invisible=Math.max(0,P.invisible-dt);P.rapide=Math.max(0,P.rapide-dt);
  const maxC=P.up.deuxBonds?2:1;if(P.charges<maxC){P.chgT+=dt;if(P.chgT>=0.55){P.charges++;P.chgT=0;}}
  const n=hyp(inp.mx,inp.my);
  if(n>0.2&&(P.etat==='libre'||P.etat==='tir'||P.etat==='vise'))P.fa=Math.atan2(inp.my,inp.mx);
  if(bondDemande){bondDemande=false;demanderBond();}
  if(P.danse2&&tReel>=P.danse2){P.danse2=0;frapperDague(true);}
  switch(P.etat){
    case 'libre':deplacer(1,dt);if(inp.dague)debutDague();else if(inp.arc)debutArc();break;
    case 'coup':{
      deplacer(0.3,dt);
      if(P.t<0.08){P.x+=Math.cos(P.fa)*3.5*dt;P.y+=Math.sin(P.fa)*3.5*dt;pousserHors(P,0.33,false);}
      if(!P.coupFait&&P.t>=0.07){P.coupFait=true;frapperDague();}
      if(P.t>=P.dur){P.comboT=tReel;if(inp.dague)debutDague();else{P.etat='libre';P.t=0;}}
      break;}
    case 'tir':deplacer(0.55,dt);if(P.t>=0.14){P.etat='libre';P.t=0;}break;
    case 'vise':{
      P.charge=Math.min(1,P.charge+dt/dureeVise());
      P.cibleVise=viser(0.42,16,!(P.up.cloche||P.up.rayon));
      if(!inp.arc)lacherVise();
      break;}
    case 'bond':{
      const k=Math.min(1,P.t/P.dur);P.x+=P.bx*dt;P.y+=P.by*dt;P.z=Math.sin(Math.PI*k)*0.75;
      if(obsEn(P.x,P.y,0.2,false)&&!obsEn(P.x,P.y,0.2,true))P.saute=true;
      pousserHors(P,0.33,true);
      if(Math.random()<0.8)parts.push({k:'fant',x:P.x,y:P.y,z:P.z,vie:0.2,max:0.2});
      for(const g of G){
        if(!vivant(g)||P.traverses.indexOf(g)>=0||hyp(g.x-P.x,g.y-P.y)>g.r+0.6)continue;
        P.traverses.push(g);
        if(P.up.epaule){const v=hyp(P.bx,P.by)||1;pousser(g,P.bx/v,P.by/v,2.6);}
        if(P.up.roulade)sonner(g,2);
      }
      if(k>=1)finBond();
      break;}
    case 'assassin':{
      const k=clamp(P.t/0.14,0,1);P.x=lerp(P.ax,P.bx,k);P.y=lerp(P.ay,P.by,k);P.z=Math.sin(Math.PI*k)*0.55;
      if(Math.random()<0.8)parts.push({k:'fant',x:P.x,y:P.y,z:P.z,vie:0.22,max:0.22,v:1});
      if(!P.coupFait&&P.t>=0.17){P.coupFait=true;frapperAssassin(P.cibleA);}
      if(P.t>=0.38){P.etat='libre';P.t=0;P.z=0;const o=P.chaineVers;P.chaineVers=null;if(o&&vivant(o)&&garde!=='alerte')sautOmbre(o);}
      break;}
    case 'ombre':{
      if(!P.coupFait&&P.t>=0.1){P.coupFait=true;P.x=P.bx;P.y=P.by;const g=P.cibleA;if(g)P.fa=Math.atan2(g.y-P.y,g.x-P.x);eclatOmbre(P.x,P.y,0.6);}
      if(P.t>=0.24){P.etat='libre';P.t=0;P.rapide=3;P.bondGratuit=true;}
      break;}
    case 'touche':{const k=Math.max(0,1-P.t/0.25);P.x+=P.kx*dt*k;P.y+=P.ky*dt*k;pousserHors(P,0.33,false);if(P.t>=0.35){P.etat='libre';P.t=0;}break;}
  }
  for(let i=items.length-1;i>=0;i--){const it=items[i];if(hyp(it.x-P.x,it.y-P.y)<0.75&&P.etat!=='aterre'){
    items.splice(i,1);P.javelots+=P.up.volees?3:1;majBoutonArc();son('ramasse');texte(P.x,P.y,1.9,'Javelot !','#ffcf9a');stats.ramasses++;
    dire('ramasse1',"Le javelot est à toi ! Le bouton de l'arc le lance. Sur une dalle, ça fait mal.",true);if(it.owner&&vivant(it.owner)&&it.owner.etat==='desarme'){it.owner.etat='nu';it.owner.t=0;}}}
}
function toucherP(dmg,sx,sy,pousse){
  if(P.etat==='bond'||P.etat==='ombre'||P.etat==='assassin'){
    if(P.etat==='bond'){stats.esquives++;texte(P.x,P.y,1.9,'Esquivé !','#cfe8ff');dire('esquive1',"Esquivé ! Pendant le bond, rien ne te touche.");if(P.up.vivante&&garde==='alerte')disparaitre(1.1);}
    return false;
  }
  if(invincible||tReel<P.invul||etatJeu!=='jeu'||P.etat==='aterre')return false;
  if(P.cache&&P.up.protectrice&&P.ombreProt){P.ombreProt=false;P.invul=tReel+0.6;texte(P.x,P.y,1.9,'Ombre protectrice','#c8b6ff');return false;}
  if(P.coeurs-dmg<=0&&P.up.leurre&&!P.leurreVague){P.leurreVague=true;P.invul=tReel+1.2;leurres.push({x:P.x,y:P.y,t:3});texte(P.x,P.y,1.9,'Le leurre !','#c8b6ff');disparaitre(2);return false;}
  P.coeurs=Math.max(0,P.coeurs-dmg);P.invul=tReel+0.9;P.etat='touche';P.t=0;P.charge=0;
  const dx=P.x-sx,dy=P.y-sy,d=hyp(dx,dy)||1,p=pousse||1;P.kx=dx/d*p/0.2;P.ky=dy/d*p/0.2;
  secousse(7);flashR=0.6;son('aie');texte(P.x,P.y,1.9,'−'+dmg+' ♥','#ff5566');stats.recus+=dmg;
  dire('aie1',"Aïe. Le rouge au sol prévient toujours. Un bond, et on passe au travers.");
  if(P.coeurs<=0){
    if(P.up.dernierPas&&!P.dernierPasFait){P.dernierPasFait=true;P.coeurs=3;P.invul=tReel+2;flashB=0.5;texte(P.x,P.y,2.4,'Le dernier pas !','#ffe08a');P.etat='libre';disparaitre(3);}
    else{defaiteDans=1.2;P.etat='aterre';P.t=0;son('chute');}
  }
  return true;
}
