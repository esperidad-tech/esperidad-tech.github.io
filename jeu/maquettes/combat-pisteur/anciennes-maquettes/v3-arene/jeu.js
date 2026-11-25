/* ======================= la salle et le monde ======================= */
const RW=26,RD=18;
const OBS0=[
  {k:'pilier',c:1,x:5,y:4.6,r:0.75,h:4.4,haut:1},{k:'pilier',c:1,x:21,y:4.6,r:0.75,h:4.4,haut:1},
  {k:'pilier',c:1,x:4.6,y:13.4,r:0.75,h:4.4,haut:1},{k:'pilier',c:1,x:21.4,y:13.4,r:0.75,h:4.4,haut:1},
  {k:'statue',x:13,y:6.4,w:3.4,d:1.1,h:0.85},
  {k:'muret',x:17.6,y:10.6,w:3.6,d:0.7,h:1.0},
  {k:'muret',x:8.2,y:9.8,w:0.7,d:3.0,h:1.0},
  {k:'gravats',c:1,x:9.6,y:4.4,r:1.05,h:0.7},
  {k:'chariot',x:20.2,y:15.8,w:2.4,d:1.3,h:1.1},
  {k:'caisse',x:8.4,y:15.2,w:1.5,d:1.5,h:1.1},
  {k:'gravats',c:1,x:15.4,y:14.6,r:0.9,h:0.6}
];
let OBS=[];
function dansObs(x,y,o,m){return o.c?Math.hypot(x-o.x,y-o.y)<o.r+m:(Math.abs(x-o.x)<o.w/2+m&&Math.abs(y-o.y)<o.d/2+m);}
function horsSalle(x,y,r){return x<0.2+r||x>RW-0.2-r||y<1.3+r*0.5||y>RD-0.2-r;}
function pousserHors(e,r,seulHauts){
  let heurt=null;
  for(const o of OBS){
    if(seulHauts&&!o.haut)continue;
    if(o.c){const dx=e.x-o.x,dy=e.y-o.y,d=Math.hypot(dx,dy),m=o.r+r;if(d<m){heurt=o;if(d<1e-4){e.x+=m;continue;}e.x=o.x+dx/d*m;e.y=o.y+dy/d*m;}}
    else{
      const qx=clamp(e.x,o.x-o.w/2,o.x+o.w/2),qy=clamp(e.y,o.y-o.d/2,o.y+o.d/2),dx=e.x-qx,dy=e.y-qy,d=Math.hypot(dx,dy);
      if(d<r){heurt=o;
        if(d>1e-4){e.x=qx+dx/d*r;e.y=qy+dy/d*r;}
        else{const l=e.x-(o.x-o.w/2),ri=(o.x+o.w/2)-e.x,t=e.y-(o.y-o.d/2),b=(o.y+o.d/2)-e.y,mn=Math.min(l,ri,t,b);
          if(mn===l)e.x=o.x-o.w/2-r;else if(mn===ri)e.x=o.x+o.w/2+r;else if(mn===t)e.y=o.y-o.d/2-r;else e.y=o.y+o.d/2+r;}
      }
    }
  }
  const x0=e.x,y0=e.y;
  e.x=clamp(e.x,0.2+r,RW-0.2-r);e.y=clamp(e.y,1.3+r*0.5,RD-0.2-r);
  if(e.x!==x0||e.y!==y0)heurt=heurt||'mur';
  return heurt;
}
function obsEn(x,y,m,seulHauts){for(const o of OBS){if(seulHauts&&!o.haut)continue;if(dansObs(x,y,o,m))return o;}return null;}
function vue(ax,ay,bx,by){const d=Math.hypot(bx-ax,by-ay),n=Math.ceil(d/0.2);for(let k=1;k<n;k++){const t=k/n;if(obsEn(lerp(ax,bx,t),lerp(ay,by,t),0.05,false))return false;}return true;}
function rayon(x,y,a,max,m){const cx0=Math.cos(a),cy0=Math.sin(a);for(let L=0.3;L<max;L+=0.2){const qx=x+cx0*L,qy=y+cy0*L;if(horsSalle(qx,qy,m)||obsEn(qx,qy,m,false))return L;}return max;}

/* ---- la grille pour trouver son chemin ---- */
const CEL=0.5,GW=Math.round(RW/CEL),GH=Math.round(RD/CEL);
const bloque=new Uint8Array(GW*GH);
const DIRS=[[1,0,1],[-1,0,1],[0,1,1],[0,-1,1],[1,1,1.414],[1,-1,1.414],[-1,1,1.414],[-1,-1,1.414]];
function majGrille(){
  for(let j=0;j<GH;j++)for(let i=0;i<GW;i++){
    const x=(i+0.5)*CEL,y=(j+0.5)*CEL;let b=(y<1.5||x<0.5||x>RW-0.5||y>RD-0.4)?1:0;
    if(!b&&obsEn(x,y,0.42,false))b=1;bloque[j*GW+i]=b;
  }
}
function cel(x,y){return clamp(Math.floor(y/CEL),0,GH-1)*GW+clamp(Math.floor(x/CEL),0,GW-1);}
const tas={v:new Float32Array(GW*GH*8),n:new Int32Array(GW*GH*8),k:0};
function tasPush(c,n){let i=tas.k++;tas.v[i]=c;tas.n[i]=n;while(i>0){const p=(i-1)>>1;if(tas.v[p]<=tas.v[i])break;const tv=tas.v[p],tn=tas.n[p];tas.v[p]=tas.v[i];tas.n[p]=tas.n[i];tas.v[i]=tv;tas.n[i]=tn;i=p;}}
function tasPop(){const rv=tas.v[0],rn=tas.n[0];tas.k--;if(tas.k>0){tas.v[0]=tas.v[tas.k];tas.n[0]=tas.n[tas.k];let i=0;for(;;){const l=2*i+1,r=l+1;let m=i;if(l<tas.k&&tas.v[l]<tas.v[m])m=l;if(r<tas.k&&tas.v[r]<tas.v[m])m=r;if(m===i)break;const tv=tas.v[m],tn=tas.n[m];tas.v[m]=tas.v[i];tas.n[m]=tas.n[i];tas.v[i]=tv;tas.n[i]=tn;i=m;}}return [rv,rn];}
function champ(tx,ty,penal){
  const D=new Float32Array(GW*GH).fill(1e9),s=cel(tx,ty);D[s]=0;tas.k=0;tasPush(0,s);
  while(tas.k>0){
    const [c,n]=tasPop();if(c>D[n])continue;const i=n%GW,j=(n/GW)|0;
    for(const [di,dj,w] of DIRS){
      const ni=i+di,nj=j+dj;if(ni<0||nj<0||ni>=GW||nj>=GH)continue;const m=nj*GW+ni;if(bloque[m])continue;
      if(di&&dj&&(bloque[j*GW+ni]||bloque[nj*GW+i]))continue;
      const nc=c+w+(penal?penal(m):0);if(nc<D[m]){D[m]=nc;tasPush(nc,m);}
    }
  }
  return D;
}
function pasVers(g,D,fuir){
  const c=cel(g.x,g.y),i=c%GW,j=(c/GW)|0;let best=c,bd=fuir?(D[c]>=1e8?-1:D[c]):D[c];
  for(const [di,dj] of DIRS){
    const ni=i+di,nj=j+dj;if(ni<0||nj<0||ni>=GW||nj>=GH)continue;const n=nj*GW+ni;if(bloque[n]||D[n]>=1e8)continue;
    if(di&&dj&&(bloque[j*GW+ni]||bloque[nj*GW+i]))continue;
    if(fuir?D[n]>bd:D[n]<bd){bd=D[n];best=n;}
  }
  return [((best%GW)+0.5)*CEL,(((best/GW)|0)+0.5)*CEL];
}
function allerVers(g,tx,ty,v,dt){const dx=tx-g.x,dy=ty-g.y,d=Math.hypot(dx,dy);if(d<1e-3)return 0;const s=Math.min(v*dt,d);g.x+=dx/d*s;g.y+=dy/d*s;g.marche=(g.marche||0)+s;return s;}

/* ======================= l'état ======================= */
const GT={
  chien:{nom:'rôdeur',hp:3,r:0.38,vit:5.0,h:0.9},
  javelot:{nom:'javelot',hp:5,r:0.42,vit:3.4,h:1.7},
  belier:{nom:'bélier',hp:10,r:0.62,vit:3.0,h:1.2},
  mortier:{nom:'mortier',hp:5,r:0.52,vit:2.4,h:1.1},
  dalle:{nom:'porte-dalle',hp:10,r:0.56,vit:2.7,h:1.8},
  colosse:{nom:'colosse',hp:40,r:1.1,vit:1.7,h:3.0}
};
const VAGUES=[
  {nom:'La meute',txt:"Grosbec lâche ses rôdeurs : ils chassent en meute et cherchent ton dos.",groupes:[['chien','chien'],['chien','chien','chien']]},
  {nom:'Le javelot',txt:"Le javelot tire droit et vite. Derrière un muret, il fait chou blanc.",groupes:[['javelot','chien','chien'],['javelot','chien']]},
  {nom:'Le bélier et le mortier',txt:"Le bélier gratte le sol avant de foncer. La ligne rouge, c'est son chemin.",groupes:[['belier','chien','chien'],['mortier','chien','chien']]},
  {nom:'Le porte-dalle',txt:"Le porte-dalle protège les plus fragiles. De face, rien ne passe : prends-le à revers.",groupes:[['dalle','mortier','javelot'],['chien','chien','chien']]},
  {nom:'Toute la garde',txt:"Toute la garde à la fois. Choisis bien qui tomber en premier.",groupes:[['belier','dalle','javelot'],['mortier','chien','chien','chien']]},
  {nom:'Le colosse',txt:"Le colosse ! Quand il frappe le sol, l'onde part en cercle. Un bond au bon moment…",groupes:[['colosse','chien','chien'],['mortier','chien','chien']]}
];
const POUVOIRS=[
  {id:'perfo',ic:'🏹',nom:'Flèches perforantes',txt:"Le métal d'en bas traverse tout : chaque flèche transperce trois golems."},
  {id:'lune',ic:'🌙',nom:'Flèches de lune',txt:"Des flèches qui brillent : un point de dégât en plus, et plus rapides."},
  {id:'triple',ic:'🔱',nom:'Triple flèche',txt:"Trois flèches en éventail à chaque tir."},
  {id:'double',ic:'🗡️',nom:'Dague affûtée',txt:"Chaque coup de dague fait un point de dégât en plus."},
  {id:'tourbillon',ic:'🌀',nom:'Tourbillon',txt:"Le troisième coup de dague tourne tout autour du Pisteur."},
  {id:'feu',ic:'🔥',nom:'Bond de feu',txt:"Le bond laisse une traînée de feu qui brûle les golems."},
  {id:'eclair',ic:'⚡',nom:'Bond éclair',txt:"Les golems traversés pendant un bond prennent deux points de dégâts."},
  {id:'deuxBonds',ic:'💨',nom:'Deux bonds',txt:"Deux bonds d'affilée avant de reprendre son souffle."},
  {id:'riposte',ic:'✨',nom:'Riposte',txt:"Un coup évité d'un bond : le coup suivant fait triple dégâts."},
  {id:'coeur',ic:'❤️',nom:'Cœur de chêne',txt:"Deux cœurs de plus, et tous les cœurs reviennent."},
  {id:'sifflet',ic:'🐺',nom:"Sifflet d'Elyra",txt:"De temps en temps, une bête d'Elyra traverse la salle et bouscule les golems."},
  {id:'vitesse',ic:'👣',nom:'Pas léger',txt:"Le Pisteur court plus vite."}
];
const CRIS=['Allez, allez !','Plus vite !','Attrapez-moi ça !','Écrasez-le !','Allez, allez, allez !'];

let invincible=false,etatJeu='regles',enPause=false,dur=false,choixOuvert=false,tourne=false;
let tReel=0,hitstop=0,sec=0,flashR=0,flashB=0,defaiteDans=0,finDans=0,dernierChien=-9,loupT=0;
const P={};
let G=[],fleches=[],javs=[],obus=[],ondes=[],feux=[],loups=[],items=[],parts=[],champJ=null,champJT=-9;
let vague=0,phase='',phaseT=0,groupeI=0,dernierGroupe=0,file=[],stats={},vus={},bandeau=null;
const GB={geste:'repos',t:0,cote:1,bulle:'',bulleT:-9},porte=[0,0];
function gbGeste(g,c){GB.geste=g;GB.t=0;GB.cote=c||1;}
function gbDire(t){GB.bulle=t;GB.bulleT=tReel;}
function resetP(garde){
  const up=garde?P.up:{};
  Object.assign(P,{x:13,y:13,z:0,fa:-Math.PI/2,etat:'libre',t:0,combo:0,comboT:-9,coeurs:6,max:6,invul:0,bondCD:0,charges:1,chgT:0,arcCD:0,porte:false,riposte:false,bx:0,by:0,dur:0.19,kx:0,ky:0,coupFait:false,saute:false,feuT:0,eclaires:[]});
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
function majMsg(){if(msgCur&&tReel-msgT>4.5){if(msgQ.length)afficherMsg(msgQ.shift());else{msgCur=null;conteurEl.classList.remove('on');}}}
function cacherMsg(){msgCur=null;msgQ=[];conteurEl.classList.remove('on');}

/* ======================= le Pisteur ======================= */
const inp={mx:0,my:0,dague:false,arc:false,bond:false};
const clav={h:0,b:0,g:0,d:0,dague:false,arc:false};
const joy={id:null,bx:0,by:0,x:0,y:0,mx:0,my:0};
const robot={mx:0,my:0,dague:false,arc:false};
let bondDemande=false;
function lireEntrees(){
  let mx=joy.mx+(clav.d-clav.g)+robot.mx,my=joy.my+(clav.b-clav.h)+robot.my;const n=Math.hypot(mx,my);if(n>1){mx/=n;my/=n;}
  inp.mx=mx;inp.my=my;inp.dague=boutons.dague||clav.dague||robot.dague||doigtsDague.size>0;inp.arc=boutons.arc||clav.arc||robot.arc;
}
const boutons={dague:false,arc:false};
function vitesseP(){return 5.6*(P.up.vitesse?1.22:1);}
function deplacer(f,dt){
  const v=vitesseP()*f;P.x+=inp.mx*v*dt;P.y+=inp.my*v*dt;
  pousserHors(P,0.33,false);
  for(const g of G){if(g.etat==='mort'||g.etat==='entre'||g.etat==='saut')continue;const dx=P.x-g.x,dy=P.y-g.y,d=Math.hypot(dx,dy),m=g.r+0.3;if(d<m&&d>1e-4){P.x=g.x+dx/d*m;P.y=g.y+dy/d*m;}}
  pousserHors(P,0.33,false);
}
function viser(cone,portee,obstacles){
  let best=null,bs=1e9;
  for(const g of G){
    if(g.etat==='mort'||g.etat==='entre')continue;
    const dx=g.x-P.x,dy=g.y-P.y,d=Math.hypot(dx,dy);if(d>portee)continue;
    const a=Math.abs(ang(Math.atan2(dy,dx)-P.fa));if(a>cone)continue;
    if(obstacles&&!vue(P.x,P.y,g.x,g.y))continue;
    const s=d+a*3;if(s<bs){bs=s;best=g;}
  }
  return best;
}
function debutCoup(){
  const cible=viser(1.6,2.8,false);if(cible)P.fa=Math.atan2(cible.y-P.y,cible.x-P.x);
  P.combo=(tReel-P.comboT<0.42&&P.combo<3)?P.combo+1:1;
  P.etat='coup';P.t=0;P.coupFait=false;P.dur=P.combo===3?0.3:0.2;son('swish');
}
function frapperDague(){
  const trois=P.combo===3,tour=trois&&P.up.tourbillon,portee=trois?1.7:1.4,dmg=(trois?2:1)+(P.up.double?1:0);
  let touche=false;
  for(const g of G){
    if(g.etat==='mort'||g.etat==='entre')continue;
    const dx=g.x-P.x,dy=g.y-P.y,d=Math.hypot(dx,dy)-g.r;if(d>(tour?2.1:portee))continue;
    if(!tour&&Math.abs(ang(Math.atan2(dy,dx)-P.fa))>1.15)continue;
    if(blesserG(g,dmg,P.x,P.y,'dague',trois?1.4:0.3))touche=true;
  }
  if(touche&&trois)secousse(3);
  P.slash={t:tReel,a:P.fa,tour,trois};
}
function tirer(){
  if(P.porte){
    const c=viser(0.5,14,true);const a=c?Math.atan2(c.y-P.y,c.x-P.x):P.fa;P.fa=a;
    javs.push({x:P.x,y:P.y,a,v:20,L:0,joueur:true});P.porte=false;vus.javLance=1;majBoutonArc();son('jav');P.etat='tir';P.t=0;P.arcCD=0.3;return;
  }
  const c=viser(0.55,13,true);const a=c?Math.atan2(c.y-P.y,c.x-P.x):P.fa;P.fa=a;
  const angs=P.up.triple?[a-0.2,a,a+0.2]:[a];
  for(const b of angs)fleches.push({x:P.x,y:P.y,a:b,v:P.up.lune?20:16,L:0,touches:[],perce:P.up.perfo?3:1,dmg:1+(P.up.lune?1:0)});
  P.arcCD=0.42;P.etat='tir';P.t=0;son('arc');
}
function demanderBond(){
  if(etatJeu!=='jeu'||enPause||choixOuvert)return;
  if(P.etat==='bond'||P.etat==='touche'||P.etat==='aterre')return;
  if(P.charges<=0)return;
  P.charges--;P.chgT=0;
  const n=Math.hypot(inp.mx,inp.my),a=n>0.2?Math.atan2(inp.my,inp.mx):P.fa;P.fa=a;
  P.etat='bond';P.t=0;P.dur=0.19;P.bx=Math.cos(a)*3.7/P.dur;P.by=Math.sin(a)*3.7/P.dur;P.saute=false;P.eclaires=[];
  son('saut');bBond.classList.remove('anneau');
}
function finBond(){
  const ux=Math.cos(P.fa),uy=Math.sin(P.fa);
  let k=0;while(obsEn(P.x,P.y,0.33,false)&&k<22){P.x+=ux*0.1;P.y+=uy*0.1;k++;}
  pousserHors(P,0.33,false);
  if(P.saute)dire('saute1',"Hop, par-dessus ! Les golems, eux, doivent faire le tour.");
  P.etat='libre';P.t=0;P.z=0;
}
function majJoueur(dt){
  P.t+=dt;P.arcCD=Math.max(0,P.arcCD-dt);
  const maxC=P.up.deuxBonds?2:1;if(P.charges<maxC){P.chgT+=dt;if(P.chgT>=0.55){P.charges++;P.chgT=0;}}
  bBond.classList.toggle('recharge',P.charges<=0);bArc.classList.toggle('recharge',!P.porte&&P.arcCD>0.05);
  const n=Math.hypot(inp.mx,inp.my);
  if(n>0.2&&(P.etat==='libre'||P.etat==='tir'))P.fa=Math.atan2(inp.my,inp.mx);
  if(bondDemande){bondDemande=false;demanderBond();}
  switch(P.etat){
    case 'libre':deplacer(1,dt);if(inp.dague)debutCoup();else if(inp.arc&&(P.porte||P.arcCD<=0))tirer();break;
    case 'coup':{
      deplacer(0.3,dt);
      if(P.t<0.08){P.x+=Math.cos(P.fa)*3.5*dt;P.y+=Math.sin(P.fa)*3.5*dt;pousserHors(P,0.33,false);}
      if(!P.coupFait&&P.t>=0.07){P.coupFait=true;frapperDague();}
      if(P.t>=P.dur){P.comboT=tReel;if(inp.dague)debutCoup();else{P.etat='libre';P.t=0;}}
      break;}
    case 'tir':deplacer(0.55,dt);if(P.t>=0.16){P.etat='libre';P.t=0;}break;
    case 'bond':{
      const k=Math.min(1,P.t/P.dur);P.x+=P.bx*dt;P.y+=P.by*dt;P.z=Math.sin(Math.PI*k)*0.75;
      if(obsEn(P.x,P.y,0.2,false)&&!obsEn(P.x,P.y,0.2,true))P.saute=true;
      pousserHors(P,0.33,true);
      if(Math.random()<0.7)parts.push({k:'fant',x:P.x,y:P.y,z:P.z,fa:P.fa,vie:0.22,max:0.22});
      if(P.up.feu){P.feuT-=dt;if(P.feuT<=0){P.feuT=0.045;feux.push({x:P.x,y:P.y,t:2.2});}}
      if(P.up.eclair)for(const g of G){if(g.etat==='mort'||g.etat==='entre'||P.eclaires.indexOf(g)>=0)continue;if(Math.hypot(g.x-P.x,g.y-P.y)<g.r+0.6){P.eclaires.push(g);blesserG(g,2,P.x,P.y,'eclair',0.3);etincelles(g.x,g.y,1,'#bff6ff',10);}}
      if(k>=1)finBond();
      break;}
    case 'touche':{const k=Math.max(0,1-P.t/0.25);P.x+=P.kx*dt*k;P.y+=P.ky*dt*k;pousserHors(P,0.33,false);if(P.t>=0.35){P.etat='libre';P.t=0;}break;}
  }
  for(let i=items.length-1;i>=0;i--){const it=items[i];if(!P.porte&&Math.hypot(it.x-P.x,it.y-P.y)<0.75){items.splice(i,1);P.porte=true;majBoutonArc();son('ramasse');texte(P.x,P.y,1.6,'Javelot !','#ffcf9a');stats.ramasses++;
    dire('ramasse1',"Le javelot est à toi ! Le bouton de l'arc le lance. Sur une dalle, ça fait mal.",true);if(it.owner&&it.owner.etat!=='mort'){it.owner.etat='nu';it.owner.t=0;}}}
}
function toucherP(dmg,sx,sy,pousse){
  if(P.etat==='bond'){
    if(P.up.riposte&&!P.riposte){P.riposte=true;texte(P.x,P.y,1.8,'Riposte prête !','#c8b6ff');}
    else texte(P.x,P.y,1.8,'Esquivé !','#cfe8ff');
    stats.esquives++;dire('esquive1',"Esquivé ! Pendant le bond, rien ne te touche.");return false;
  }
  if(invincible||tReel<P.invul||etatJeu!=='jeu'||P.etat==='aterre')return false;
  P.coeurs=Math.max(0,P.coeurs-dmg);P.invul=tReel+0.9;P.etat='touche';P.t=0;
  const dx=P.x-sx,dy=P.y-sy,d=Math.hypot(dx,dy)||1,p=pousse||1;P.kx=dx/d*p/0.2;P.ky=dy/d*p/0.2;
  secousse(7);flashR=0.6;son('aie');texte(P.x,P.y,1.8,'−'+dmg+' ♥','#ff5566');stats.recus+=dmg;
  dire('aie1',"Aïe. Les zones rouges préviennent toujours. Un bond, et on passe au travers.");
  if(P.coeurs<=0){defaiteDans=1.1;P.etat='aterre';P.t=0;son('chute');}
  return true;
}

/* ======================= les golems ======================= */
const arm=()=>dur?0.8:1;
function nouveauGolem(type,x,y,tx,ty){
  const T=GT[type],hp=Math.round(T.hp*(dur?1.3:1));
  return {type,T,x,y,z:0,r:T.r,hp,max:hp,vit:T.vit,etat:'entre',t:0,fa:Math.PI/2,cd:rnd(0.8,1.6),cdOnde:2.5,flash:0,kx:0,ky:0,arme:false,zone:null,tx,ty,
    aDalle:type==='dalle',fissure:0,marche:0,attente:0,sd:0,aTouche:false,feuT:0,ch:null,chT:-9,id:Math.random()};
}
function jeton(){let n=0;for(const g of G)if(g.arme)n++;return n<(dur?3:2);}
function apparaitre(type,ou){
  let x,y,tx,ty;
  if(ou==='g'){x=-0.8;y=9.4;tx=1.6;ty=9.4+rnd(-0.6,0.6);}
  else if(ou==='d'){x=RW+0.8;y=9.4;tx=RW-1.6;ty=9.4+rnd(-0.6,0.6);}
  else{const px0=ou==='p1'?8:18;x=px0+rnd(-0.3,0.3);y=-0.6;tx=px0+rnd(-0.8,0.8);ty=2.6+rnd(0,0.6);porte[ou==='p1'?0:1]=1;}
  const g=nouveauGolem(type,x,y,tx,ty);G.push(g);son('porte');
  return g;
}
function blesserG(g,dmg,fx,fy,src,recul){
  if(g.etat==='mort'||g.etat==='entre')return false;
  if(g.type==='dalle'&&g.aDalle&&src!=='belier'&&src!=='obus'&&src!=='loup'&&src!=='feu'&&src!=='eclair'){
    const a=Math.abs(ang(Math.atan2(fy-g.y,fx-g.x)-g.fa));
    if(a<1.25){
      if(src==='javjoueur'){
        g.fissure++;son('bang');secousse(5);
        if(g.fissure>=2){g.aDalle=false;texte(g.x,g.y,2.2,'La dalle casse !','#ffcf9a');debrisDalle(g);stats.dalles++;dire('casse1',"La dalle a volé en éclats ! Le voilà à découvert.",true);}
        else{texte(g.x,g.y,2.2,'Fendue !','#ffcf9a');dire('fend1',"La dalle est fendue. Encore un javelot, et elle casse.",true);}
        return true;
      }
      son('bong');texte(g.x,g.y,2.2,'Bong !','#cfd8e6');etincelles(g.x+Math.cos(g.fa)*0.6,g.y+Math.sin(g.fa)*0.6,1,'#e8eef6',6);
      dire('bong1',"Bong ! De face, sa dalle arrête tout. Prends-le à revers, d'un bond.",true);return false;
    }
  }
  if(P.riposte&&(src==='dague'||src==='fleche')){dmg*=3;P.riposte=false;texte(g.x,g.y,2.6,'Riposte !','#c8b6ff');}
  g.hp-=dmg;g.flash=1;stats.degats+=dmg;
  if(recul&&g.type!=='colosse'&&g.etat!=='charge'){const dx=g.x-fx,dy=g.y-fy,d=Math.hypot(dx,dy)||1;g.kx=dx/d*recul*6;g.ky=dy/d*recul*6;}
  hitstop=Math.max(hitstop,src==='dague'?0.05:0.025);
  etincelles(g.x,g.y,g.T.h*0.55,src==='feu'?'#ff9a4a':'#fff2c0',src==='dague'?8:5);
  son(src==='feu'?'feu':'frappe');
  if(g.hp<=0)tuer(g);
  return true;
}
function tuer(g){
  g.etat='mort';g.t=0;g.arme=false;g.zone=null;stats.tues++;
  son('acheve');secousse(g.type==='colosse'?10:4);
  eclatBrise(g.x,g.y,g.T.h*0.55,g.type==='colosse'?2:1);cailloux(g);
  if(g.type==='colosse'){flashB=0.5;dire(null,"Le colosse s'effondre ! Il ne reste que la petite monnaie.",true);}
}
function devant(g,x,y,cone){return Math.abs(ang(Math.atan2(y-g.y,x-g.x)-g.fa))<cone;}
function dansRect(px0,py0,x,y,a,L,l){const dx=px0-x,dy=py0-y,u=dx*Math.cos(a)+dy*Math.sin(a),v=-dx*Math.sin(a)+dy*Math.cos(a);return u>=-0.3&&u<=L&&Math.abs(v)<=l/2;}
function tourner(g,cible,vit,dt){const d=ang(cible-g.fa);g.fa+=clamp(d,-vit*dt,vit*dt);}
function suivreJ(g,v,dt){const [tx,ty]=pasVers(g,champJ);allerVers(g,tx,ty,v,dt);}
function fuirJ(g,v,dt){const [tx,ty]=pasVers(g,champJ,true);allerVers(g,tx,ty,v,dt);}
function penalJ(m){const x=((m%GW)+0.5)*CEL,y=(((m/GW)|0)+0.5)*CEL,d=Math.hypot(x-P.x,y-P.y);return d<4.5?(4.5-d)*4:0;}

function iaChien(g,dt,d,vu){
  switch(g.etat){
    case 'normal':{
      const meute=G.filter(o=>o.type==='chien'&&(o.etat==='normal'||o.etat==='arme'));
      let tete=null,bt=9;for(const o of meute){const a=Math.abs(ang(Math.atan2(o.y-P.y,o.x-P.x)-P.fa));if(a<bt){bt=a;tete=o;}}
      let sa;if(g===tete)sa=P.fa;else{const autres=meute.filter(o=>o!==tete),i=autres.indexOf(g);sa=P.fa+Math.PI+(i%2?0.8:-0.8)+(i>=2?0.5:0);}
      const tx=P.x+Math.cos(sa)*2.4,ty=P.y+Math.sin(sa)*2.4;
      if(d>5.5||!vu||obsEn(tx,ty,0.3,false)||horsSalle(tx,ty,0.3))suivreJ(g,g.vit,dt);else allerVers(g,tx,ty,g.vit*0.9,dt);
      tourner(g,Math.atan2(P.y-g.y,P.x-g.x),8,dt);
      const dos=Math.abs(ang(Math.atan2(g.y-P.y,g.x-P.x)-P.fa))>1.9;
      if(g.cd<=0&&d<3.9&&vu&&jeton()&&(dos||tReel-dernierChien>3.4)){g.etat='arme';g.t=0;g.arme=true;dernierChien=tReel;g.lx=P.x;g.ly=P.y;son('grogne');
        dire('chien1',"Un rôdeur se ramasse : la flèche rouge montre son saut. Bondis au bon moment, il mordra le vide.");}
      break;}
    case 'arme':{
      if(g.t<0.36*arm()){g.lx=P.x;g.ly=P.y;}
      g.fa=Math.atan2(g.ly-g.y,g.lx-g.x);
      const L=Math.min(3.8,Math.hypot(g.lx-g.x,g.ly-g.y)+0.5);
      g.zone={k:'fleche',x:g.x,y:g.y,a:g.fa,L,l:0.7,p:g.t/(0.62*arm())};
      if(g.t>=0.62*arm()){g.etat='saut';g.t=0;g.sx=g.x;g.sy=g.y;g.ex=g.x+Math.cos(g.fa)*L;g.ey=g.y+Math.sin(g.fa)*L;g.zone=null;g.arme=false;g.aTouche=false;son('saut');}
      break;}
    case 'saut':{
      const k=Math.min(1,g.t/0.26);g.x=lerp(g.sx,g.ex,k);g.y=lerp(g.sy,g.ey,k);g.z=Math.sin(Math.PI*k)*0.8;
      if(!g.aTouche&&k>0.55&&Math.hypot(g.x-P.x,g.y-P.y)<0.85){g.aTouche=true;toucherP(1,g.x,g.y,1.0);}
      if(k>=1){g.z=0;pousserHors(g,g.r,false);g.etat='recup';g.t=0;g.cd=rnd(2.2,3.4);if(!g.aTouche)texte(g.x,g.y,1.4,'Raté !','#cfd8e6');}
      break;}
    case 'recup':if(g.t>0.95){g.etat='normal';g.t=0;}break;
  }
}
function iaJavelot(g,dt,d,vu){
  switch(g.etat){
    case 'normal':
      if(!vu||d>9)suivreJ(g,g.vit,dt);
      else if(d<4.6)fuirJ(g,g.vit,dt);
      else{const pa=Math.atan2(P.y-g.y,P.x-g.x)+Math.PI/2*(g.id>0.5?1:-1),tx=g.x+Math.cos(pa),ty=g.y+Math.sin(pa);if(!obsEn(tx,ty,0.5,false)&&!horsSalle(tx,ty,0.5))allerVers(g,tx,ty,g.vit*0.35,dt);}
      tourner(g,Math.atan2(P.y-g.y,P.x-g.x),6,dt);
      if(g.cd<=0&&vu&&d<12.5&&jeton()){g.etat='arme';g.t=0;g.arme=true;son('vise');dire('jav1',"Le javelot vise : la fine ligne rouge, c'est son tir. Un pas de côté, ou un muret.");}
      break;
    case 'arme':{
      const lock=g.t>=0.66*arm();if(!lock)g.fa=Math.atan2(P.y-g.y,P.x-g.x);
      g.zone={k:'fin',x:g.x,y:g.y,a:g.fa,L:rayon(g.x,g.y,g.fa,15,0.05),l:0.18,p:g.t/(0.92*arm()),lock};
      if(g.t>=0.92*arm()){javs.push({x:g.x+Math.cos(g.fa)*0.5,y:g.y+Math.sin(g.fa)*0.5,a:g.fa,v:17,L:0,owner:g});g.etat='desarme';g.t=0;g.arme=false;g.zone=null;g.attente=0;son('jav');}
      break;}
    case 'desarme':{
      const it=items.find(i=>i.owner===g);
      if(!it){if(!javs.some(j=>j.owner===g)){g.etat='nu';g.t=0;}else fuirJ(g,g.vit*0.5,dt);break;}
      if(!g.ch||tReel-g.chT>0.5){g.ch=champ(it.x,it.y,penalJ);g.chT=tReel;}
      const [tx,ty]=pasVers(g,g.ch);allerVers(g,tx,ty,g.vit*1.15,dt);tourner(g,Math.atan2(ty-g.y,tx-g.x),6,dt);
      if(Math.hypot(P.x-it.x,P.y-it.y)<2.6){g.attente+=dt;if(g.attente>4){g.etat='nu';g.t=0;texte(g.x,g.y,2.2,'Tant pis !','#cfd8e6');dire('renonce1',"Il renonce à son javelot et vient à mains nues.");break;}}
      if(Math.hypot(g.x-it.x,g.y-it.y)<0.6){items.splice(items.indexOf(it),1);g.etat='normal';g.t=0;g.cd=1.3;texte(g.x,g.y,2.2,'Récupéré !','#ff9a8a');}
      break;}
    case 'nu':
      suivreJ(g,g.vit*1.1,dt);tourner(g,Math.atan2(P.y-g.y,P.x-g.x),6,dt);
      if(d<1.5&&g.cd<=0&&jeton()){g.etat='poing';g.t=0;g.arme=true;}
      break;
    case 'poing':iaPoing(g,dt,d,1,0.55);break;
    case 'recup':if(g.t>0.6){g.etat=g.retour||'normal';g.t=0;}break;
  }
}
function iaPoing(g,dt,d,dmg,duree){
  tourner(g,Math.atan2(P.y-g.y,P.x-g.x),3,dt);
  g.zone={k:'cone',x:g.x,y:g.y,a:g.fa,R:g.r+1.1,h:0.8,p:g.t/(duree*arm())};
  if(g.t>=duree*arm()){g.zone=null;g.arme=false;if(Math.hypot(P.x-g.x,P.y-g.y)<g.r+1.2&&devant(g,P.x,P.y,0.85))toucherP(dmg,g.x,g.y,1.4);g.etat='recup';g.retour=g.type==='dalle'||g.type==='colosse'?'normal':'nu';g.t=0;g.cd=rnd(1.3,2.0);son('swishG');}
}
function iaBelier(g,dt,d,vu){
  switch(g.etat){
    case 'normal':
      if(d>8||!vu)suivreJ(g,g.vit,dt);else if(d<3.5)fuirJ(g,g.vit*0.7,dt);
      tourner(g,Math.atan2(P.y-g.y,P.x-g.x),4,dt);
      if(g.cd<=0&&vu&&d<11&&d>2.2&&jeton()){g.etat='gratte';g.t=0;g.arme=true;son('gratte');dire('belier1',"Il gratte le sol : la ligne rouge, c'est son chemin. Contre un pilier, il fait moins le fier.");}
      break;
    case 'gratte':{
      if(g.t<0.75*arm())g.fa=Math.atan2(P.y-g.y,P.x-g.x);
      g.zone={k:'ligne',x:g.x,y:g.y,a:g.fa,L:rayon(g.x,g.y,g.fa,13,g.r*0.7),l:1.3,p:g.t/(1.05*arm())};
      if(Math.random()<dt*10)poussiere(g.x-Math.cos(g.fa)*0.5,g.y-Math.sin(g.fa)*0.5,0.7);
      if(g.t>=1.05*arm()){g.etat='charge';g.t=0;g.arme=false;g.zone=null;g.parcouru=0;g.aTouche=false;son('rouge');}
      break;}
    case 'charge':{
      const pas=13*dt,n=Math.ceil(pas/0.12),ux=Math.cos(g.fa),uy=Math.sin(g.fa);
      for(let s=0;s<n;s++){
        g.x+=ux*pas/n;g.y+=uy*pas/n;g.parcouru+=pas/n;
        if(!g.aTouche&&Math.hypot(P.x-g.x,P.y-g.y)<g.r+0.38){g.aTouche=true;if(toucherP(2,g.x-ux,g.y-uy,2.4)){g.etat='recup';g.t=0;g.cd=rnd(2.6,3.6);return;}}
        for(const o of G){if(o===g||o.etat==='mort'||o.etat==='entre')continue;if(Math.hypot(o.x-g.x,o.y-g.y)<g.r+o.r){blesserG(o,3,g.x,g.y,'belier',1.4);g.etat='sonne';g.t=0;g.sd=2.0;g.cd=2.5;texte(g.x,g.y,2,'Carambolage !','#ffb070');son('bang');secousse(6);stats.caram++;dire('caram1',"Carambolage ! Le bélier ne fait pas la différence entre toi et ses copains.");return;}}
        const h=pousserHors(g,g.r*0.8,false);
        if(h){g.etat='sonne';g.t=0;g.sd=2.6;g.cd=2.5;texte(g.x,g.y,2,'BANG !','#ffb070');son('bang');secousse(8);stats.bang++;dire('bang1',"BANG ! Le bélier est sonné : c'est le moment.");return;}
        if(g.parcouru>13){g.etat='recup';g.t=0;g.cd=rnd(2,3);return;}
      }
      break;}
    case 'sonne':if(g.t>g.sd){g.etat='normal';g.t=0;}break;
    case 'recup':if(g.t>0.8){g.etat='normal';g.t=0;}break;
  }
}
function iaMortier(g,dt,d,vu){
  switch(g.etat){
    case 'normal':
      if(d<3.2){fuirJ(g,g.vit*1.5,dt);dire('mortier2',"De près, le mortier ne sait que fuir. Rattrape-le !");}
      else if(d<6.5)fuirJ(g,g.vit,dt);else if(d>11)suivreJ(g,g.vit,dt);
      tourner(g,Math.atan2(P.y-g.y,P.x-g.x),4,dt);
      if(g.cd<=0&&d<15&&d>2.5&&jeton()){g.etat='vise';g.t=0;g.arme=true;son('vise');}
      break;
    case 'vise':
      if(g.t>=0.55*arm()){
        g.arme=false;g.etat='normal';g.t=0;g.cd=rnd(3.2,4.2);son('mortier');
        const vx=inp.mx*vitesseP()*0.5,vy=inp.my*vitesseP()*0.5;
        const c=[[P.x+vx,P.y+vy],[P.x+rnd(-2.2,2.2),P.y+rnd(-1.8,1.8)],[P.x+rnd(-2.2,2.2),P.y+rnd(-1.8,1.8)]];
        c.forEach((q,i)=>obus.push({x0:g.x,y0:g.y,x1:clamp(q[0],0.8,RW-0.8),y1:clamp(q[1],1.6,RD-0.6),t:-i*0.12,dur:1.45}));
        dire('mortier1',"Le mortier tire par-dessus tout : les cercles rouges, c'est là que ça tombe.");
      }
      break;
  }
}
function choisirProtege(){
  let best=null;for(const o of G){if((o.type==='mortier'||o.type==='javelot')&&o.etat!=='mort'&&o.etat!=='entre'){if(!best||o.hp<best.hp)best=o;}}return best;
}
function iaDalle(g,dt,d,vu){
  const versP=Math.atan2(P.y-g.y,P.x-g.x);
  switch(g.etat){
    case 'normal':{
      tourner(g,versP,g.aDalle?2.0:5,dt);
      const al=g.aDalle?choisirProtege():null;
      if(al){
        const ux=P.x-al.x,uy=P.y-al.y,n=Math.hypot(ux,uy)||1,tx=clamp(al.x+ux/n*1.6,1,RW-1),ty=clamp(al.y+uy/n*1.6,2,RD-1);
        if(!g.ch||tReel-g.chT>0.4){g.ch=champ(tx,ty);g.chT=tReel;}
        if(Math.hypot(g.x-tx,g.y-ty)>0.35){const [ax,ay]=pasVers(g,g.ch);allerVers(g,ax,ay,g.vit,dt);}
        if(d<1.9&&devant(g,P.x,P.y,1.0)&&g.cd<=0&&jeton()){g.etat='coupDalle';g.t=0;g.arme=true;}
        if(d<9)dire('garde1',"Le porte-dalle se met entre toi et le plus fragile. De face, rien ne passe.");
      }else{
        suivreJ(g,g.vit*1.1,dt);
        if(g.aDalle&&d<2.7&&g.cd<=0&&jeton()){g.etat='marteau';g.t=0;g.arme=true;son('gratte');dire('marteau1',"Plus personne à protéger : il lève sa dalle comme un marteau. Écarte-toi de la zone rouge !",true);}
        else if(!g.aDalle&&d<1.5&&g.cd<=0&&jeton()){g.etat='poing';g.t=0;g.arme=true;}
      }
      break;}
    case 'coupDalle':
      tourner(g,versP,2,dt);g.zone={k:'rect',x:g.x,y:g.y,a:g.fa,L:g.r+1.4,l:1.7,p:g.t/(0.5*arm())};
      if(g.t>=0.5*arm()){g.zone=null;g.arme=false;if(dansRect(P.x,P.y,g.x,g.y,g.fa,g.r+1.5,1.8))toucherP(1,g.x,g.y,2.8);g.etat='recup';g.t=0;g.cd=1.6;son('swishG');}
      break;
    case 'marteau':
      if(g.t<0.5*arm())tourner(g,versP,3,dt);
      g.zone={k:'rect',x:g.x,y:g.y,a:g.fa,L:g.r+2.3,l:1.6,p:g.t/(0.95*arm())};
      if(g.t>=0.95*arm()){
        g.zone=null;g.arme=false;
        if(dansRect(P.x,P.y,g.x,g.y,g.fa,g.r+2.4,1.7))toucherP(2,g.x,g.y,1.6);
        const cxx=g.x+Math.cos(g.fa)*(g.r+0.9),cyy=g.y+Math.sin(g.fa)*(g.r+0.9),vert=Math.abs(Math.cos(g.fa))>Math.abs(Math.sin(g.fa));
        const o={k:'dalle',x:clamp(cxx,1,RW-1),y:clamp(cyy,2,RD-1),w:vert?0.45:1.7,d:vert?1.7:0.45,h:1.3,plantee:true};
        if(Math.hypot(o.x-P.x,o.y-P.y)>0.6)OBS.push(o);
        g.aDalle=false;majGrille();pousserHors(P,0.33,false);pousserHors(g,g.r,false);
        son('bang');secousse(9);poussiere(o.x,o.y,1.6);stats.plantees++;
        dire('plante1',"La dalle est plantée dans le sol : un mur de plus, et lui à mains nues.",true);
        g.etat='recup';g.t=0;g.cd=1.2;
      }
      break;
    case 'poing':iaPoing(g,dt,d,1,0.6);break;
    case 'recup':if(g.t>0.6){g.etat='normal';g.t=0;}break;
  }
}
function iaColosse(g,dt,d,vu){
  switch(g.etat){
    case 'normal':
      suivreJ(g,g.vit,dt);tourner(g,Math.atan2(P.y-g.y,P.x-g.x),2.5,dt);
      if(d<2.3&&g.cd<=0&&jeton()){g.etat='poing';g.t=0;g.arme=true;}
      else if(d<8.5&&g.cdOnde<=0&&jeton()){g.etat='onde';g.t=0;g.arme=true;son('gratte');}
      break;
    case 'onde':
      g.zone={k:'cercle',x:g.x,y:g.y,r:g.r+0.8,p:g.t/(1.25*arm())};
      if(g.t>=1.25*arm()){g.zone=null;g.arme=false;ondes.push({x:g.x,y:g.y,r:g.r+0.3,v:5.4,max:10,ep:0.8,deja:false});son('onde');secousse(9);g.etat='recup';g.t=0;g.cdOnde=rnd(4,5.5);g.cd=Math.max(g.cd,1);
        dire('onde1',"L'onde file en cercle : bondis au moment où elle passe sous tes pieds !",true);}
      break;
    case 'poing':iaPoing(g,dt,d,2,0.75);break;
    case 'recup':if(g.t>0.9){g.etat='normal';g.t=0;}break;
  }
}
function majGolems(dt){
  if(!champJ||tReel-champJT>0.25){champJ=champ(P.x,P.y);champJT=tReel;}
  for(const g of G){
    g.t+=dt;g.cd-=dt;g.cdOnde-=dt;if(g.flash>0)g.flash=Math.max(0,g.flash-dt*6);
    if(g.etat==='mort')continue;
    if(g.etat==='entre'){
      allerVers(g,g.tx,g.ty,Math.max(2.6,g.vit),dt);g.fa=Math.atan2(g.ty-g.y,g.tx-g.x);
      if(Math.hypot(g.x-g.tx,g.y-g.ty)<0.1){g.etat='normal';g.t=0;}
      continue;
    }
    if(g.kx||g.ky){g.x+=g.kx*dt;g.y+=g.ky*dt;g.kx*=Math.pow(0.002,dt);g.ky*=Math.pow(0.002,dt);if(Math.abs(g.kx)+Math.abs(g.ky)<0.05){g.kx=0;g.ky=0;}}
    const d=Math.hypot(P.x-g.x,P.y-g.y),vu=vue(g.x,g.y,P.x,P.y);
    const avant=g.marche;
    switch(g.type){case 'chien':iaChien(g,dt,d,vu);break;case 'javelot':iaJavelot(g,dt,d,vu);break;case 'belier':iaBelier(g,dt,d,vu);break;case 'mortier':iaMortier(g,dt,d,vu);break;case 'dalle':iaDalle(g,dt,d,vu);break;case 'colosse':iaColosse(g,dt,d,vu);break;}
    g.bouge=g.marche!==avant;
    if(g.feuT>0)g.feuT-=dt;
    for(const f of feux){if(g.feuT<=0&&g.etat!=='mort'&&Math.hypot(f.x-g.x,f.y-g.y)<g.r+0.5){g.feuT=0.6;blesserG(g,1,f.x,f.y,'feu',0);}}
  }
  for(let i=0;i<G.length;i++){const a=G[i];if(a.etat==='mort'||a.etat==='entre'||a.etat==='saut'||a.etat==='charge')continue;
    for(let j=i+1;j<G.length;j++){const b=G[j];if(b.etat==='mort'||b.etat==='entre'||b.etat==='saut'||b.etat==='charge')continue;
      const dx=b.x-a.x,dy=b.y-a.y,d=Math.hypot(dx,dy),m=a.r+b.r;if(d<m&&d>1e-4){const k=(m-d)/2,wa=a.type==='colosse'?0.15:1,wb=b.type==='colosse'?0.15:1;a.x-=dx/d*k*wa;a.y-=dy/d*k*wa;b.x+=dx/d*k*wb;b.y+=dy/d*k*wb;}}}
  for(const g of G){if(g.etat!=='mort'&&g.etat!=='entre'&&g.etat!=='saut')pousserHors(g,g.r,false);}
  G=G.filter(g=>!(g.etat==='mort'&&g.t>0.6));
}

/* ======================= les projectiles, les ondes, les bêtes ======================= */
function majProjectiles(dt){
  for(const f of fleches){
    const n=Math.ceil(f.v*dt/0.15);
    for(let s=0;s<n&&!f.fini;s++){
      f.x+=Math.cos(f.a)*f.v*dt/n;f.y+=Math.sin(f.a)*f.v*dt/n;f.L+=f.v*dt/n;
      if(f.L>14||horsSalle(f.x,f.y,0)||obsEn(f.x,f.y,0.05,false)){f.fini=true;etincelles(f.x,f.y,0.9,'#bff6ff',4);break;}
      for(const g of G){if(g.etat==='mort'||g.etat==='entre'||f.touches.indexOf(g)>=0)continue;
        if(Math.hypot(g.x-f.x,g.y-f.y)<g.r+0.12){f.touches.push(g);blesserG(g,f.dmg,f.x-Math.cos(f.a),f.y-Math.sin(f.a),'fleche',0.15);if(f.touches.length>=f.perce){f.fini=true;}break;}}
    }
  }
  fleches=fleches.filter(f=>!f.fini);
  for(const j of javs){
    const n=Math.ceil(j.v*dt/0.15);
    for(let s=0;s<n&&!j.fini;s++){
      const px0=j.x,py0=j.y;j.x+=Math.cos(j.a)*j.v*dt/n;j.y+=Math.sin(j.a)*j.v*dt/n;j.L+=j.v*dt/n;
      if(j.joueur){
        let tg=null;for(const g of G){if(g.etat==='mort'||g.etat==='entre')continue;if(Math.hypot(g.x-j.x,g.y-j.y)<g.r+0.25){tg=g;break;}}
        if(tg){blesserG(tg,3,px0-Math.cos(j.a),py0-Math.sin(j.a),'javjoueur',0.8);j.fini=true;eclatsBois(j.x,j.y);break;}
        if(j.L>15||horsSalle(j.x,j.y,0)||obsEn(j.x,j.y,0.05,false)){j.fini=true;eclatsBois(j.x,j.y);break;}
      }else{
        if(Math.hypot(P.x-j.x,P.y-j.y)<0.5&&!j.aTouche){j.aTouche=true;if(toucherP(1,px0,py0,1.0)){j.fini=true;planter(j,P.x+rnd(-0.4,0.4),P.y+rnd(0.2,0.5));break;}}
        if(j.L>14||horsSalle(j.x,j.y,0.2)||obsEn(j.x,j.y,0.05,false)){j.fini=true;planter(j,px0,py0);break;}
      }
    }
  }
  javs=javs.filter(j=>!j.fini);
  for(const o of obus){
    o.t+=dt;
    if(o.t>=o.dur&&!o.fini){
      o.fini=true;son('impact');secousse(3);etincelles(o.x1,o.y1,0.2,'#ff8a3a',12);poussiere(o.x1,o.y1,1.4);
      if(Math.hypot(P.x-o.x1,P.y-o.y1)<1.15)toucherP(1,o.x1,o.y1,1.2);
      for(const g of G)if(g.etat!=='mort'&&g.etat!=='entre'&&g.type!=='mortier'&&Math.hypot(g.x-o.x1,g.y-o.y1)<1.0+g.r*0.5)blesserG(g,1,o.x1,o.y1,'obus',0.6);
    }
  }
  obus=obus.filter(o=>!o.fini);
  for(const w of ondes){
    w.r+=w.v*dt;
    if(!w.deja&&Math.abs(Math.hypot(P.x-w.x,P.y-w.y)-w.r)<w.ep/2+0.32){w.deja=true;toucherP(2,w.x,w.y,1.6);}
  }
  ondes=ondes.filter(w=>w.r<w.max);
  for(const f of feux)f.t-=dt;feux=feux.filter(f=>f.t>0);
  if(P.up.sifflet&&phase==='vague'){loupT-=dt;if(loupT<=0){loupT=15;lacherLoup();}}
  for(const l of loups){
    l.x+=l.dir*12*dt;l.pas+=dt*20;
    for(const g of G){if(g.etat==='mort'||g.etat==='entre'||l.touches.indexOf(g)>=0)continue;if(Math.abs(g.x-l.x)<g.r+0.5&&Math.abs(g.y-l.y)<g.r+0.6){l.touches.push(g);blesserG(g,2,l.x-l.dir,l.y,'loup',1.0);if(g.etat!=='mort'&&g.type!=='colosse'){g.etat=g.type==='belier'?'sonne':'recup';g.t=0;g.sd=1.6;g.arme=false;g.zone=null;}}}
    if(Math.random()<dt*14)poussiere(l.x-l.dir*0.5,l.y,0.7);
  }
  loups=loups.filter(l=>l.x>-2&&l.x<RW+2);
}
function planter(j,x,y){
  x=clamp(x,0.8,RW-0.8);y=clamp(y,1.8,RD-0.6);
  for(let k=0;k<12&&obsEn(x,y,0.3,false);k++){x-=Math.cos(j.a)*0.25;y-=Math.sin(j.a)*0.25;}
  items.push({x,y,a:j.a,owner:j.owner});son('planter');
  dire('plante2',"Son javelot est planté par terre. Il va vouloir le récupérer… à moins que tu le prennes avant.");
}
function lacherLoup(){
  const vivants=G.filter(g=>g.etat!=='mort'&&g.etat!=='entre');if(!vivants.length)return;
  const c=vivants[Math.floor(Math.random()*vivants.length)],dir=Math.random()<.5?1:-1;
  loups.push({x:dir>0?-1:RW+1,y:c.y,dir,pas:0,touches:[]});son('betes');
  dire('loup1',"Une bête d'Elyra ! Elle a choisi son camp.");
}

/* ======================= les vagues et les pouvoirs ======================= */
function demarrerVague(i){
  vague=i;groupeI=0;phase='vague';phaseT=0;file=[];dernierGroupe=-99;loupT=8;
  const V=VAGUES[i];bandeau={a:`Vague ${i+1} / ${VAGUES.length}`,b:V.nom,t:tReel};dire(null,V.txt,true);son('cor');
}
let porteAlt=0;
function lancerGroupe(liste){
  dernierGroupe=phaseT;gbGeste('envoie',porteAlt%2?1:-1);gbDire(CRIS[Math.floor(Math.random()*CRIS.length)]);son('allez');
  const ou=['p1','p2','g','d'],base=porteAlt++;
  liste.forEach((ty,i)=>{let o=ou[(base+(ty==='chien'?0:i))%2];if(ty==='chien'&&Math.random()<0.4)o=Math.random()<.5?'g':'d';if(ty==='colosse')o='p1';file.push({ty,o,quand:phaseT+0.5+i*0.5});});
}
function majVagues(dt){
  phaseT+=dt;
  for(const s of file)if(!s.fait&&phaseT>=s.quand){s.fait=true;apparaitre(s.ty,s.o);}
  file=file.filter(s=>!s.fait);
  if(phase==='vague'){
    const V=VAGUES[vague],vivants=G.filter(g=>g.etat!=='mort').length+file.length;
    if(groupeI<V.groupes.length){if(phaseT>1.2&&phaseT-dernierGroupe>1.5&&(vivants<=1||(vivants<=2&&phaseT-dernierGroupe>14)))lancerGroupe(V.groupes[groupeI++]);}
    else if(vivants===0){phase='fin';phaseT=0;gbGeste('colere');gbDire(vague+1<VAGUES.length?'GRRR… Encore !':'ASSEZ !');}
  }else if(phase==='fin'&&phaseT>1.5){
    phase='';
    if(vague+1<VAGUES.length)ouvrirChoix();else victoire();
  }
}
const choixEl=$('choix'),cartesEl=$('cartes');
function ouvrirChoix(){
  const dispo=POUVOIRS.filter(p=>!P.up[p.id]);
  const pris=[];while(pris.length<3&&dispo.length){pris.push(dispo.splice(Math.floor(Math.random()*dispo.length),1)[0]);}
  cartesEl.innerHTML=pris.map((p,i)=>`<div class="pouvoir"><div class="ic">${p.ic}</div><b>${p.nom}</b><p>${p.txt}</p><div style="display:flex;gap:.5em;align-items:center"><button class="hp" data-lire>🔊</button><button class="jaune" data-i="${i}">Prendre</button></div></div>`).join('');
  choixOuvert=true;choixEl.classList.add('on');son('choix');
  for(const b of cartesEl.querySelectorAll('button.jaune'))b.onclick=()=>prendre(pris[+b.dataset.i]);
  $('choixHp').onclick=()=>lire('Choisis un pouvoir. '+pris.map(p=>p.nom+' : '+p.txt).join(' '));
  window.__choixDispo=pris;
}
function prendre(p){
  P.up[p.id]=1;stats.pouvoirs.push(p.nom);
  if(p.id==='coeur'){P.max+=2;P.coeurs=P.max;}else P.coeurs=Math.min(P.max,P.coeurs+1);
  if(p.id==='deuxBonds')P.charges=2;
  choixOuvert=false;choixEl.classList.remove('on');dernier=performance.now();
  demarrerVague(vague+1);
}

/* ======================= les particules ======================= */
function secousse(a){sec=Math.max(sec,a);}
function etincelles(x,y,z,c,n){for(let i=0;i<n;i++){const a=Math.random()*Math.PI*2,v=rnd(80,260);parts.push({k:'e',x,y,z,sx:Math.cos(a)*v,sy:Math.sin(a)*v-60,ox:0,oy:0,vie:rnd(.2,.45),max:.45,c});}}
function poussiere(x,y,s){for(let i=0;i<5;i++)parts.push({k:'p',x:x+rnd(-0.4,0.4)*s,y:y+rnd(-0.2,0.2)*s,z:0,sx:rnd(-30,30),sy:rnd(-30,-6),ox:0,oy:0,vie:rnd(.4,.8),max:.8,s:rnd(6,12)*s});}
function cailloux(g){const n=g.type==='colosse'?30:14,sz=g.type==='colosse'?1.8:1;for(let i=0;i<n;i++){const a=rnd(-Math.PI,0),v=rnd(60,220);parts.push({k:'c',x:g.x+rnd(-0.3,0.3),y:g.y+rnd(-0.2,0.2),z:g.T.h*0.5,sx:Math.cos(a)*v,sy:Math.sin(a)*v-60,ox:0,oy:0,sol:rnd(-4,8),vie:rnd(1.4,2.2),max:2.2,s:rnd(4,9)*sz,r:Math.random()*6,vr:rnd(-8,8),c:Math.random()<.25?'#6a4a20':'#3a3d45'});}parts.push({k:'tas',x:g.x,y:g.y,z:0,ox:0,oy:0,s:sz,vie:2.6,max:2.6});}
function eclatBrise(x,y,z,s){for(let i=0;i<16*s;i++){const a=Math.random()*Math.PI*2,v=rnd(100,320);parts.push({k:'cr',x,y,z,sx:Math.cos(a)*v,sy:Math.sin(a)*v,ox:0,oy:0,vie:rnd(.3,.6),max:.6,s:rnd(3,5)});}parts.push({k:'onde',x,y,z,ox:0,oy:0,vie:.35,max:.35,s});}
function eclatsBois(x,y){for(let i=0;i<8;i++){const a=Math.random()*Math.PI*2,v=rnd(60,200);parts.push({k:'c',x,y,z:0.9,sx:Math.cos(a)*v,sy:Math.sin(a)*v-50,ox:0,oy:0,sol:rnd(18,28),vie:1,max:1,s:rnd(3,6),r:Math.random()*6,vr:rnd(-10,10),c:'#8a6236'});}son('casse');}
function debrisDalle(g){for(let i=0;i<14;i++){const a=Math.random()*Math.PI*2,v=rnd(60,220);parts.push({k:'c',x:g.x+Math.cos(g.fa)*0.6,y:g.y+Math.sin(g.fa)*0.6,z:1,sx:Math.cos(a)*v,sy:Math.sin(a)*v-60,ox:0,oy:0,sol:rnd(30,44),vie:1.8,max:1.8,s:rnd(5,10),r:Math.random()*6,vr:rnd(-8,8),c:'#5a5f6c'});}}
let texteN=0,texteT=-9;
function texte(x,y,z,t,c){if(tReel-texteT>0.35)texteN=0;texteT=tReel;parts.push({k:'t',x,y,z,ox:0,oy:-(texteN++%3)*20,t,c,vie:1.1,max:1.1});}
function majParts(dt){
  for(const q of parts){
    q.vie-=dt;
    if(q.k==='c'){q.sy+=650*dt;q.ox+=q.sx*dt;q.oy+=q.sy*dt;q.r+=q.vr*dt;const sol=(q.z*ZH)+q.sol;if(q.oy>sol){q.oy=sol;q.sy*=-0.25;q.sx*=0.5;q.vr*=0.5;}}
    else if(q.k==='e'||q.k==='cr'||q.k==='p'){q.ox+=q.sx*dt;q.oy+=q.sy*dt;q.sx*=0.92;q.sy*=0.92;if(q.k==='e')q.sy+=220*dt;}
    else if(q.k==='t')q.oy-=32*dt;
  }
  parts=parts.filter(q=>q.vie>0);if(parts.length>420)parts.splice(0,parts.length-420);
}
