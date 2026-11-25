/* ======================= les golems ======================= */
const FEN=0.42;
const TYPES={
  rodeur:{nom:'Le rôdeur',pv:8,taille:1.3,rig:'rodeur',etourdi:2,ouvre:1.15,attaques:[
    {de:'g',sorte:'n',arme:0.8,dmg:1},{de:'d',sorte:'n',arme:0.8,dmg:1},
    {de:'g',sorte:'n',arme:0.75,dmg:1,suite:{de:'d',sorte:'n',arme:0.55,dmg:1}},
    {de:'d',sorte:'n',arme:0.75,dmg:1,suite:{de:'g',sorte:'n',arme:0.55,dmg:1}}]},
  lancier:{nom:'Le lancier',pv:12,taille:1.3,rig:'humain',arme:'faux',tete:'crete',etourdi:3,ouvre:1.3,attaques:[
    {de:'g',sorte:'n',arme:0.85,dmg:1},{de:'d',sorte:'n',arme:0.85,dmg:1},{de:'h',sorte:'n',arme:1.0,dmg:1},
    {de:'g',sorte:'or',arme:1.0,dmg:1},{de:'d',sorte:'or',arme:1.0,dmg:1},
    {de:'h',sorte:'n',arme:0.9,dmg:1,suite:{de:'g',sorte:'or',arme:0.8,dmg:1}}]},
  dalle:{nom:'Le porte-dalle',pv:11,taille:1.32,rig:'humain',arme:'dalle',tete:'cornes',etourdi:3,ouvre:1.3,faille:'v',attaques:[
    {de:'g',sorte:'n',arme:0.85,dmg:1},{de:'d',sorte:'n',arme:0.85,dmg:1},{de:'h',sorte:'rouge',arme:1.15,dmg:2,ouvre:1.9,coince:true}]},
  belier:{nom:'Le bélier',pv:13,taille:1.2,rig:'belier',etourdi:3,ouvre:1.2,attaques:[
    {de:'g',sorte:'n',arme:0.8,dmg:1},{de:'d',sorte:'n',arme:0.8,dmg:1},
    {de:'face',sorte:'rouge',arme:1.35,dmg:2,charge:true,ouvre:2.4},{de:'face',sorte:'rouge',arme:1.35,dmg:2,charge:true,ouvre:2.4}]},
  colosse:{nom:'Le colosse',pv:20,taille:1.5,rig:'humain',arme:'poings',tete:'masque',etourdi:3,ouvre:1.3,attaques:[
    {de:'g',sorte:'rouge',arme:1.05,dmg:2,ouvre:1.25},{de:'d',sorte:'rouge',arme:1.05,dmg:2,ouvre:1.25},
    {de:'h',sorte:'rouge',arme:1.25,dmg:2,ouvre:1.6},{de:'g',sorte:'or',arme:1.0,dmg:1},{de:'d',sorte:'or',arme:1.0,dmg:1}]}
};
const DUELS=['rodeur','rodeur','lancier','dalle','belier','lancier','colosse'];
const INTRO={
  rodeur:"Un rôdeur, rien qu'un. Regarde bien de quel côté part sa mâchoire…",
  lancier:"Le lancier et sa faux. Attention à ses grands balayages dorés.",
  dalle:"Le porte-dalle. Sur les côtés, sa dalle arrête tout : sa faille va de haut en bas.",
  belier:"Le bélier. Quand il gratte le sol, il va foncer droit sur toi.",
  colosse:"Le colosse. Ses poings sont rouges : ça ne se pare pas, ça s'évite."
};
const CRIS=['Allez, allez !','Écrase-le !','Plus vite !','Attrape-moi ça !','Allez, allez, allez !'];
const RANGS=[['D',0,'#9aa3b2'],['C',40,'#56c6d6'],['B',90,'#7bd66a'],['A',150,'#ff9b3d'],['S',220,'#ffd23a']];
const COUL={n:'rgba(255,255,255,1)',or:'rgba(255,210,58,1)',rouge:'rgba(255,59,48,1)'};

let etatJeu='regles',enPause=false,dur=false;
let tReel=0,tMonde=0,hitstop=0,sec=0,flashBlanc=0,flashRouge=0,ralentiJusqu=-9,defaiteDans=0,finDans=0;
let G=null,duelI=0,phaseD='',phaseT=0;
let note=0,noteMax=0,derniers=[],derniereAction=0,combo=0,comboT=0,comboMax=0,rangPop=0;
let parts=[],betes=[],traces=[];
let stats={};let bandeau=null;const vus={};
const P={};
function resetP(){Object.assign(P,{etat:'garde',t:0,dir:1,coeurs:5,pDir:'h',coupDir:'d',coupU:[1,0],coup:false,pret:false});}
resetP();

/* ======================= le conteur ======================= */
const conteurEl=$('conteur'),conteurTxt=$('conteurTxt');
let msgQ=[],msgT=0,msgCur=null;
function dire(cle,txt,force){
  if(cle){if(vus[cle])return false;vus[cle]=1;}
  if(force){msgQ=[];afficherMsg(txt);}else if(!msgCur)afficherMsg(txt);else if(msgQ.length<2)msgQ.push(txt);
  return true;
}
function afficherMsg(t){msgCur=t;msgT=tReel;conteurTxt.textContent=t;conteurEl.classList.add('on');}
function majMsg(){if(msgCur&&tReel-msgT>4.2){if(msgQ.length)afficherMsg(msgQ.shift());else{msgCur=null;conteurEl.classList.remove('on');}}}
function cacherMsg(){msgCur=null;msgQ=[];conteurEl.classList.remove('on');}

/* ======================= la note de style ======================= */
function rang(){let r=RANGS[0];for(const x of RANGS)if(note>=x[1])r=x;return r;}
function stylePts(type,pts){
  let m=1;if(derniers[0]===type)m=0.3;else if(derniers.indexOf(type)>=0)m=0.6;
  const avant=rang()[0];note=Math.min(260,note+pts*m);noteMax=Math.max(noteMax,note);
  derniers.unshift(type);if(derniers.length>3)derniers.length=3;derniereAction=tReel;
  const apres=rang()[0];if(apres!==avant)rangPop=1;
  if(apres==='S'&&!P.pret){P.pret=true;montrerSifflet();}
}
function comboPlus(){combo++;comboT=tReel;comboMax=Math.max(comboMax,combo);}
function majNote(dt){
  if(tReel-derniereAction>2.2&&G&&G.etat!=='entree')note=Math.max(0,note-8*dt);
  if(combo>0&&tReel-comboT>4)combo=0;
  rangPop=Math.max(0,rangPop-dt*3);
}
const btnSiff=$('btnSiff');
function montrerSifflet(){btnSiff.classList.add('on');if(!vus.s1)btnSiff.classList.add('anneau');dire('s1',"Note S ! Le premier pisteur savait parler aux bêtes d'Elyra. Et si tu sifflais ?",true);}
function siffler(){
  if(!jeuActif()||!P.pret||!G||G.etat==='entree'||G.etat==='genou'||G.etat==='mort')return;
  if(P.etat==='touche'||P.etat==='acheve'||P.etat==='siffle')return;
  P.pret=false;btnSiff.classList.remove('on','anneau');P.etat='siffle';P.t=0;P.coup=false;note=0;son('sifflet');
}
function jeuActif(){return etatJeu==='jeu'&&!enPause&&defaiteDans<=0;}

/* ======================= le golem : règles ======================= */
function nouveauGolem(type){
  const T=TYPES[type],pv=Math.round(T.pv*(dur?1.3:1));
  return {type,T,pv,pvMax:pv,etat:'entree',t:0,att:null,parades:0,colere:0,ouvreDur:0,faille:'h',dernierCoup:'',flash:0,attente:rnd(0.7,1.1),cote:1,coupe:false,coince:false,fenetre:false};
}
const attente=()=>rnd(0.7,1.4)*(dur?0.72:1);
function armer(g,att){
  g.att=Object.assign({},att,{arme:att.arme*(dur?0.82:1)});g.etat='arme';g.t=0;g.coupe=false;g.fenetre=false;
  son(att.sorte==='rouge'?'rouge':att.sorte==='or'?'large':'arme');
  if(att.sorte==='rouge'){
    if(!vus.rouge1){dire('rouge1',"Rouge : bien trop lourd pour parer. On esquive, du côté opposé… au dernier moment, si tu oses.",true);indiceEsquive(att);}
  }else if(att.sorte==='or'){dire('or1',"Une lueur dorée : son balayage est trop large pour l'esquiver. Il faut parer.",true);}
  else if(!vus.arme1){dire('arme1',"Il arme son coup ! Un coup de dague vers lui, juste avant qu'il tombe, et c'est la parade.",true);indiceParade=true;}
}
function choisirAttaque(g){const L=g.T.attaques;let a=L[Math.floor(Math.random()*L.length)];if(g.dernAtt===a&&L.length>2)a=L[Math.floor(Math.random()*L.length)];g.dernAtt=a;armer(g,a);}
function ouvrir(g,d,etat,coince){
  g.etat=etat;g.t=0;g.ouvreDur=d;g.faille=g.T.faille||(Math.random()<.5?'h':'v');g.coince=!!coince;g.colere=0;g.dernierCoup='';
  dire('ouvert1',"Il est ouvert ! Taille dans tous les sens. Une faille brille sur lui : un coup dans son sens fait double.");
}
function esquiveBonne(de,dir){return de==='g'?dir>0:de==='d'?dir<0:true;}
function resoudre(a){
  if(P.etat==='acheve'||P.etat==='siffle')return 'rate';
  if(P.etat==='esquive'&&P.t<0.42){
    if(a.sorte==='or'){blesser(a.dmg);dire('large',"Trop large pour l'esquiver ! Les coups dorés, ça se pare.",true);return 'touche';}
    if(esquiveBonne(a.de,P.dir)){
      if(P.t<=0.2){esquiveParfaite();return 'parfaite';}
      stylePts('esquive',4);stats.esquives++;texte('Esquivé !','#cfe8ff');return 'esquive';
    }
    blesser(a.dmg);dire('cote',"Mauvais côté ! On esquive à l'opposé du coup.",true);return 'touche';
  }
  blesser(a.dmg);return 'touche';
}
function frapper(g){
  const a=g.att;g.etat='frappe';g.t=0;
  const r=resoudre(a);
  if(r==='esquive'||r==='parfaite'){
    g.coupe=true;
    if(a.charge){g.etat='passe';g.t=0;g.passeCote=-P.dir;return;}
    const o=r==='parfaite'?(a.ouvre||0.6)+0.7:(a.sorte==='rouge'?(a.ouvre||1.0):0.5);
    ouvrir(g,o,'ouvert',a.coince);
    if(a.coince){son('bang');secousse(5);texte('Coincée !','#ffcf9a');}
  }else{
    son(a.sorte==='rouge'?'bang':'frappeG');
  }
}
function majGolem(dt){
  const g=G;if(!g)return;
  g.t+=dt;if(g.flash>0)g.flash=Math.max(0,g.flash-dt*6);
  switch(g.etat){
    case 'entree':if(g.t>=1.8){g.etat='garde';g.t=0;}break;
    case 'garde':if(g.t>=g.attente&&P.etat!=='acheve'&&P.etat!=='siffle'&&defaiteDans<=0)choisirAttaque(g);break;
    case 'arme':
      if(P.etat==='acheve'||P.etat==='siffle'){g.t-=dt;break;}
      if(!g.fenetre&&g.att.arme-g.t<=FEN){g.fenetre=true;if(g.att.sorte!=='rouge')son('fenetre');}
      if(g.t>=g.att.arme)frapper(g);
      break;
    case 'frappe':if(g.t>=(g.att.charge?0.5:0.24)){if(g.att.suite&&!g.coupe&&defaiteDans<=0)armer(g,g.att.suite);else{g.etat='recup';g.t=0;}}break;
    case 'recup':if(g.t>=0.3){g.etat='garde';g.t=0;g.attente=attente();}break;
    case 'ouvert':case 'sonne':if(g.t>=g.ouvreDur){g.etat='garde';g.t=0;g.attente=rnd(0.35,0.7);g.colere=0;g.coince=false;}break;
    case 'passe':if(g.t>=0.3){g.etat='retour';g.t=0;son('bang');secousse(10);flashBlanc=0.35;texte('BANG !','#ffb070');stats.bang++;dire('bang1',"BANG ! Dans le mur, derrière toi. Il revient tout étourdi…");}break;
    case 'retour':if(g.t>=0.8){ouvrir(g,g.att.ouvre||2.4,'sonne');texte('Sonné !','#ffe066');}break;
    case 'mort':if(g.t>=0.9){G=null;finDuel();}break;
  }
}
function parer(g){
  const a=g.att;g.coupe=true;g.parades++;stats.parades++;
  P.etat='parade';P.t=0;P.pDir=a.de;
  hitstop=Math.max(hitstop,0.09);secousse(4);son('contre');
  const [px,py]=pointParade(a.de);etincelles(px,py,'#ffd96a',16);glowFlash.push({x:px,y:py,v:1});
  texte('Paré !','#ffd23a');comboPlus();stylePts('parade',12);indiceParade=false;
  if(g.parades>=g.T.etourdi){g.parades=0;ouvrir(g,2.6,'sonne');texte('Sonné !','#ffe066');stylePts('sonne',10);son('bang');stats.sonnes++;
    dire('sonne1',"Sonné ! Trop de parades d'affilée, il ne sait plus où il habite.");}
  else ouvrir(g,g.T.ouvre,'ouvert');
  dire('parade1',"Paré ! Il est ouvert : à toi de tailler, dans tous les sens.");
}
function bong(g,dalle){
  son('bong');texte('Bong !','#cfd8e6');
  const [cxg,cyg]=centreGolem();etincelles(cxg+rnd(-30,30),cyg,'#e8eef6',6);
  if(dalle){dire('dalle1',"Bong ! Sur les côtés, la dalle arrête tout. Sa faille va de haut en bas.");return;}
  dire('bong1',"Bong. En garde, il pare tout. Attends qu'il s'ouvre.");
  if(g.etat==='garde'){g.colere++;if(g.colere>=3){g.colere=0;armer(g,{de:Math.random()<.5?'g':'d',sorte:'n',arme:0.55,dmg:1});texte('Grrr !','#ff8a6a');dire('colere1',"Trois coups dans sa garde ? Il s'énerve.",true);}}
}
function taillade(g,dir){
  if(g.T.faille==='v'&&!g.coince&&(dir==='g'||dir==='d')){bong(g,true);return;}
  const axe=(dir==='g'||dir==='d')?'h':'v';
  let dmg=1,faille=false;
  if(axe===g.faille){dmg=2;faille=true;}
  if(dir===g.dernierCoup)dmg*=0.5;
  g.dernierCoup=dir;g.pv-=dmg;g.flash=1;
  hitstop=Math.max(hitstop,faille?0.07:0.04);secousse(faille?3.5:1.8);son(faille?'faille':'frappe');
  const [cxg,cyg]=centreGolem();etincelles(cxg+rnd(-25,25),cyg+rnd(-30,30),faille?'#bff6ff':'#fff2c0',faille?12:7);
  comboPlus();stylePts('coup'+dir,3);stats.coups++;
  if(faille){stylePts('faille',7);stats.failles++;texte('Dans la faille !','#bff6ff');}
  if(g.pv<=0){g.pv=0;genou(g);}
}
function genou(g){
  g.etat='genou';g.t=0;son('bang');secousse(5);texte('À genoux !','#ffcf9a');
  if(dire('genou1',"À genoux ! Sa grille s'ouvre, l'éclat brille. Un doigt dessus…",true))indiceEclat=true;
}
function achever(){
  if(!G||G.etat!=='genou'||!jeuActif())return;
  if(P.etat==='acheve'||P.etat==='siffle')return;
  P.etat='acheve';P.t=0;P.coup=false;son('saut');
}
function briser(){
  const g=G;if(!g||g.etat!=='genou')return;
  g.etat='mort';g.t=0;indiceEclat=false;
  const [cxg,cyg]=centreGolem();
  hitstop=Math.max(hitstop,0.14);secousse(9);flashBlanc=0.5;
  eclatBrise(cxg,cyg);cailloux(cxg,cyg,g);
  son('acheve');comboPlus();stylePts('acheve',15);stats.eclats++;
  texte(['Crac !','En miettes !','Éclat brisé !'][Math.floor(Math.random()*3)],'#ff9a6a');
  gbGeste('colere');gbDire(duelI+1<DUELS.length?'GRRR… Suivant !':'ASSEZ !');
  dire('mort1',"Un tas de cailloux. Le métal d'en bas ne pardonne pas.");
}
function lacherBetes(){
  stats.sifflets++;son('betes');
  dire(null,"Les bêtes d'Elyra ont choisi leur camp !",true);
  for(let i=0;i<6;i++){const dir=i%2?-1:1;betes.push({x:dir>0?-60:W+60,y:GY+rnd(-6,46),dir,t:-i*0.09,pas:Math.random()*6,v:rnd(520,620),cogne:false});}
}
function majBetes(dt){
  for(const b of betes){
    b.t+=dt;if(b.t<0)continue;b.x+=b.dir*b.v*dt;b.pas+=dt*20;
    if(!b.cogne&&Math.abs(b.x-225)<40){b.cogne=true;if(G&&G.etat!=='genou'&&G.etat!=='mort'&&G.etat!=='entree'){G.pv=0;G.flash=1;secousse(8);son('bang');genou(G);}}
    if(Math.random()<dt*14)poussiere(b.x-b.dir*20,b.y,1.4);
  }
  betes=betes.filter(b=>b.t<0||(b.x>-120&&b.x<W+120));
}
function esquiveParfaite(){
  const deja=tReel<ralentiJusqu;ralentiJusqu=tReel+2.3;if(deja)return;
  son('parfait');comboPlus();stylePts('parfait',20);stats.parfaites++;
  texte('Esquive parfaite !','#c8b6ff');
  dire('parfait1',"Esquive parfaite ! Le temps ralentit… mais pas pour toi.");
}
function vitesseMonde(){if(tReel<ralentiJusqu){const r=ralentiJusqu-tReel;return r<0.4?lerp(1,0.3,r/0.4):0.3;}return 1;}
function blesser(dmg){
  P.coeurs=Math.max(0,P.coeurs-dmg);P.etat='touche';P.t=0;
  combo=0;note=Math.max(0,note-50);secousse(9);flashRouge=0.7;son('aie');stats.recus++;
  texte('−'+dmg+' ♥','#ff5566');
  dire('aie1',"Aïe ! Pour esquiver : les deux boutons du bas, du côté opposé au coup.");
  if(P.coeurs<=0)defaiteDans=1.0;
}

/* ======================= le Pisteur : règles ======================= */
let indiceParade=false,indiceEclat=false,indiceEsq=null;
function indiceEsquive(att){const id=att.de==='g'?'esqD':att.de==='d'?'esqG':(Math.random()<.5?'esqG':'esqD');indiceEsq=$(id);indiceEsq.classList.add('anneau');}
function finIndiceEsq(){if(indiceEsq){indiceEsq.classList.remove('anneau');indiceEsq=null;}}
function glisser(dir,u){
  if(!jeuActif())return;
  if(P.etat==='touche'||P.etat==='acheve'||P.etat==='siffle'||(P.etat==='esquive'&&P.t<0.3))return;
  const g=G;
  P.etat='coup';P.t=0;P.coupDir=dir;P.coupU=u||[dir==='g'?-1:dir==='d'?1:0,dir==='h'?-1:dir==='b'?1:0];
  son('fouet');
  if(!g||g.etat==='entree'||g.etat==='mort'||g.etat==='passe')return;
  if(g.etat==='genou'){achever();return;}
  if(g.etat==='arme'){
    const a=g.att,tti=a.arme-g.t,bonne=dir===a.de;
    if(bonne&&tti<=FEN&&a.sorte!=='rouge'&&!a.charge){parer(g);return;}
    if(bonne&&a.sorte!=='rouge'&&!a.charge)texte('Trop tôt !','#cfd8e6');
    else if(a.sorte==='rouge'&&tti<=FEN){texte('Trop lourd !','#ff8a7a');dire('lourd',"Rouge, c'est trop lourd pour parer : esquive !",true);}
    return;
  }
  if(g.etat==='ouvert'||g.etat==='sonne'){taillade(g,dir);return;}
  bong(g,false);
}
function esquiver(dir){
  if(!jeuActif())return;
  if(P.etat==='touche'||P.etat==='acheve'||P.etat==='siffle'||P.etat==='esquive')return;
  P.etat='esquive';P.t=0;P.dir=dir;son('roule');finIndiceEsq();
}
function majPisteur(dt){
  P.t+=dt;
  switch(P.etat){
    case 'coup':if(P.t>=0.17)P.etat='garde';break;
    case 'parade':if(P.t>=0.3)P.etat='garde';break;
    case 'esquive':if(P.t>=0.55)P.etat='garde';break;
    case 'touche':if(P.t>=0.5)P.etat='garde';break;
    case 'acheve':if(!P.coup&&P.t>=0.32){P.coup=true;briser();}if(P.t>=0.8)P.etat='garde';break;
    case 'siffle':if(!P.coup&&P.t>=0.35){P.coup=true;lacherBetes();}if(P.t>=0.8)P.etat='garde';break;
  }
}

/* ======================= les duels ======================= */
function bandeauMontre(a,b){bandeau={a,b,t:tReel};}
function lancerDuel(i){
  duelI=i;phaseD='duel';const type=DUELS[i];G=nouveauGolem(type);G.cote=i%2?1:-1;
  porte[G.cote>0?1:0]=1;son('porte');son('cor');gbGeste('envoie',G.cote);gbDire(CRIS[Math.floor(Math.random()*CRIS.length)]);
  bandeauMontre(`Golem ${i+1} / ${DUELS.length}`,G.T.nom);
  if(!vus['intro_'+type]){vus['intro_'+type]=1;dire(null,INTRO[type],true);}
}
function finDuel(){
  const avant=P.coeurs;P.coeurs=Math.min(5,P.coeurs+1);if(P.coeurs>avant)texte('+1 ♥','#ff7a8a',225,HY-260);
  phaseD='pause';phaseT=0;
}
function majDuels(dt){if(phaseD==='pause'){phaseT+=dt;if(phaseT>1.3){if(duelI+1<DUELS.length)lancerDuel(duelI+1);else victoire();}}}

/* ======================= les particules ======================= */
const glowFlash=[];
function secousse(a){sec=Math.max(sec,a);}
function etincelles(x,y,c,n){for(let i=0;i<n;i++){const a=Math.random()*Math.PI*2,v=rnd(80,300);parts.push({k:'e',x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v-50,vie:rnd(.2,.5),max:.5,c});}}
function cailloux(x,y,g){
  const sz=g.T.taille,sol=GY;
  for(let i=0;i<26;i++){const a=rnd(-Math.PI,0),v=rnd(60,260);parts.push({k:'c',x:x+rnd(-50,50)*sz,y:y+rnd(-60,60)*sz,vx:Math.cos(a)*v,vy:Math.sin(a)*v-80,sol:sol+rnd(-8,14),vie:rnd(1.6,2.4),max:2.4,s:rnd(6,14)*sz,r:Math.random()*6,vr:rnd(-8,8),c:Math.random()<.25?'#6a4a20':'#3a3d45'});}
  parts.push({k:'tas',x,y:sol,s:sz,vie:2.6,max:2.6});
}
function eclatBrise(x,y){for(let i=0;i<22;i++){const a=Math.random()*Math.PI*2,v=rnd(100,360);parts.push({k:'cr',x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v,vie:rnd(.3,.7),max:.7,s:rnd(3,6)});}parts.push({k:'onde',x,y,vie:.4,max:.4});}
function poussiere(x,y,s){for(let i=0;i<4;i++)parts.push({k:'p',x:x+rnd(-14,14)*s,y:y+rnd(-3,3)*s,vx:rnd(-30,30),vy:rnd(-25,-5),vie:rnd(.4,.8),max:.8,s:rnd(5,10)*s});}
let texteN=0,texteT=-9;
function texte(t,c,x,y){if(tReel-texteT>0.35)texteN=0;texteT=tReel;const [cxg,cyg]=centreGolem();parts.push({k:'t',x:x||clamp(cxg,90,W-90),y:(y||cyg-90)-(texteN++%3)*22,t,c,vie:1,max:1});}
function majParts(dt){
  for(const q of parts){
    q.vie-=dt;
    if(q.k==='c'){q.vy+=700*dt;q.x+=q.vx*dt;q.y+=q.vy*dt;q.r+=q.vr*dt;if(q.y>q.sol){q.y=q.sol;q.vy*=-0.25;q.vx*=0.5;q.vr*=0.5;}}
    else if(q.k==='e'||q.k==='cr'||q.k==='p'){q.x+=q.vx*dt;q.y+=q.vy*dt;q.vx*=0.92;q.vy*=0.92;if(q.k==='e')q.vy+=240*dt;}
    else if(q.k==='t')q.y-=34*dt;
  }
  parts=parts.filter(q=>q.vie>0);if(parts.length>400)parts.splice(0,parts.length-400);
  for(const f of glowFlash)f.v-=dt*4;
  for(let i=glowFlash.length-1;i>=0;i--)if(glowFlash[i].v<=0)glowFlash.splice(i,1);
}
