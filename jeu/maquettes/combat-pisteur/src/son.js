/* ======================= le son et la musique (version 10, 26 novembre) =======================
   Romain, 26 novembre, 10 h 55 : « je veux pas que ça soit des gros sons » ; pas de cor pour les renforts : « le son sur le jeu de
   l'alchimiste, à chaque fois qu'il grogne et qu'il est pas content » ; des sons « qui font un peu peur », « à moitié humain, à moitié
   machine », « un peu sourds, un peu métalliques », « pas trop aigus », « un petit peu de résonance, on est dans une grande pièce » ;
   « plus on s'approche d'eux, plus il y a du volume » ; « pas des bruits en permanence », « pas un gros brouillard de bruit » ;
   « chacun a son bruit » ; et les sons qui comptent : « quand ils nous ont repérés », « quand ils sont en enrage », « un son pour
   chaque zone rouge », « à chaque fois qu'ils nous cherchent ». La musique : « une ambiance », « beaucoup de basses », « qui évolue
   un petit peu », « plus énergique » quand le colosse arrive.

   Tout est fabriqué par le moteur de l'Atelier des sons du jeu (jeu/donjon/essai/sons/moteur.js : window.Moteur), sans aucun fichier.
   La voix des golems est celle de Grosbec dans le combat de l'Alchimiste (grave, éraillée, étouffée), à la hauteur de chacun.
   - son(nom)            : au milieu, plein volume (les gestes du Pisteur) ;
   - son(nom, golem)     : là où est ce golem, avec sa voix ; son(nom, x, y) : à cet endroit de la salle ;
   - dans majGolems, sonSrc est le golem dont c'est le tour : son(nom) part de lui tout seul.
   Le volume d'un son baisse avec la distance au Pisteur (rayon selon la sorte de son), il part à gauche ou à droite, et il résonne.
   tests/sons.py fabrique chaque son hors ligne et mesure sa force et sa hauteur. */
let sonOn=true,sonSrc=null;
/* (tout le reste est enfermé : ses petits noms — S, A, vx… — ne gênent pas ceux du jeu) */
const SON=(()=>{
let AC=null,A=null,PR=null;
const VOL=0.8;
function initSon(){
  if(AC){if(AC.state==='suspended')AC.resume();return;}
  if(!window.Moteur)return;
  try{
    AC=new (window.AudioContext||window.webkitAudioContext)();
    A=window.Moteur(AC,{volume:sonOn?VOL:0});PR=prise(A,0,null,EQ_SONS);
  }catch(e){AC=null;A=null;}
}
/* Tout passe par là. Mesuré (tests/sons.py) : sans ça, neuf dixièmes de l'énergie des sons étaient sous 150 Hz, ce qu'un téléphone
   ne rend pas (on n'aurait presque rien entendu) et qui écrase le reste dans un casque. Donc : moins de très grave, un peu plus de
   corps (autour de 650 Hz), et rien d'aigu (coupé au-dessus de 3 600 Hz : « pas des bruits trop aigus »). */
function prise(E,t,vers,o){
  const B=E.prise(t,1,vers),c=E.ctx,Q={t:t,base:B};
  for(const k of ['sec','cave','grotte']){
    const hp=c.createBiquadFilter(),sh=c.createBiquadFilter(),pk=c.createBiquadFilter(),lp=c.createBiquadFilter();
    hp.type='highpass';hp.frequency.value=o.hp;hp.Q.value=0.7;sh.type='lowshelf';sh.frequency.value=o.shf;sh.gain.value=o.sh;
    pk.type='peaking';pk.frequency.value=o.pkf;pk.Q.value=0.6;pk.gain.value=o.pk;lp.type='lowpass';lp.frequency.value=o.lp;lp.Q.value=0.5;
    hp.connect(sh);sh.connect(pk);pk.connect(lp);lp.connect(B[k]);Q[k]=hp;(Q.lps||(Q.lps=[])).push(lp);
  }
  return Q;
}
/* (version 11 : coupé plus haut, à 5 000 Hz, pour que la dague du donjon reste claire ; dans l'ombre, tout passe sous 1 300 Hz : assourdi) */
const EQ_SONS={hp:60,shf:180,sh:-10,pkf:650,pk:4,lp:5000},LP_OMBRE=1300,EQ_MUS={hp:42,shf:110,sh:-5,pkf:420,pk:3,lp:3000};
function couperSon(){if(A)A.volume.gain.setTargetAtTime(sonOn?VOL:0,AC.currentTime,0.05);}

/* ---------- les briques ---------- */
const m2f=m=>440*Math.pow(2,(m-69)/12);
/* la voix : grave, éraillée, étouffée (celle de Grosbec dans son casque, sons-combat.js de l'Alchimiste) */
function vx(t,o,d){
  return A.cri(t,{f:o.f||125,forme:o.forme||'effort',d:o.d||0.45,rauque:o.r==null?0.6:o.r,grain:o.gr==null?0.7:o.gr,gVit:o.gv,hp:o.hp||90,lp:o.lp||950,souffle:o.s==null?0.25:o.s,g:o.g||0.3,a:o.a||0.03,trille:o.tr},d);
}
const br=(t,o,d)=>A.bruit(t,o,d),tn=(t,o,d)=>A.ton(t,o,d);
/* du métal sourd : une cloche grave, désaccordée */
const metal=(t,f,dur,g,d,idx)=>A.cloche(t,f,{d:dur,rapport:2.76,indice:idx==null?1.5:idx,g:g},d);
/* un choc sourd */
const coup=(t,f,dur,g,d,o)=>A.choc(t,Object.assign({f:f*1.7,f2:f*0.75,d:dur,g:g*0.8,corps:2.2,corpsF:520,blp:1300},o||{}),d);
/* la part de machine : un grondement qui tremble vite, comme un moteur */
const moteur=(t,f,dur,g,d,vit,lp)=>tn(t,{type:'sawtooth',f:f,env:[[0,0],[Math.min(0.05,dur*0.2),1],[dur*0.7,0.8],[dur,0]],g:g,trem:[vit||26,0.9],lp:lp||480},d);
/* des tampons calculés (grincements, cliquetis), gardés une fois par moteur */
function tampon(nom,fn){const c=A._tp||(A._tp={});return c[nom]||(c[nom]=fn());}
const grince=(t,nom,dur,o,jo,d)=>A.joue(t,tampon(nom,()=>A.grincement(dur,o)),jo,d);
const cliquetis=(t,nom,dur,vit,jo,d)=>A.joue(t,tampon(nom,()=>A.griffes(dur,vit)),jo,d);
/* la hauteur de la voix de chaque golem */
const VOIX={chien:165,javelot:150,dalle:105,faucheur:118,mortier:88,belier:96,cuirasse:84,colosse:60,repare:190};
const vde=o=>(o&&VOIX[o.type])||125,kv=o=>clamp(Math.pow(125/vde(o),0.75),0.75,1.8);

/* ---- les morceaux du donjon (jeu/donjon/essai/sons/bruitages.js : la dague, la lame dans la chair, les gros coups), recopiés tels quels ---- */
const O={
  clic:(t,f,g,d)=>br(t,{bp:f,bq:1.4,env:[[0,0],[0.0006,1],[0.008,0]],g:g},d),
  swish:(t,dd,o,d)=>{const env=[[0,0],[dd*0.62,1],[dd,0]];br(t,{filtres:[{type:'bandpass',f:o.f1||700,pts:[[dd*0.62,o.f2||3400],[dd,o.f3||1500]],q:o.q||2.5}],env:env,g:o.g||1.1},d);br(t,{hp:5000,env:env,g:(o.g||1.1)*0.12},d);},
  chantLame:(t,o,d)=>A.modes(t,o.f||2900,[[1,1,0.7,2],[1.47,0.6,0.55,3],[2.09,0.45,0.45],[2.56,0.3,0.35],[3.21,0.2,0.25]],{g:o.g||0.06,a:0.02},d),
  tchac:(t,o,d)=>{const g=o.g||1;br(t,{bp:1100,bq:1,env:A.perc(0.001,0.03),g:0.8*g},d);A.choc(t,{f:170,f2:70,d:0.11,g:0.5*g},d);
    br(t+0.01,{filtres:[{type:'lowpass',f:2000,pts:[[0.07,400]],q:5}],env:A.perc(0.003,0.07),g:0.5*g*(o.mouille==null?1:o.mouille)},d);},
  chuteGrave:(t,dd,g,d)=>{tn(t,{f:120,f2:26,gl:dd,env:[[0,0],[0.006,1],[dd*0.4,0.55],[dd,0]],g:0.85*g,sat:4,lp:900},d);tn(t,{type:'triangle',f:60,f2:24,gl:dd,env:[[0,0],[0.006,1],[dd*0.5,0.5],[dd,0]],g:0.5*g},d);},
  craque:(t,dd,g,d)=>A.joue(t,A.crepitement(dd,220,{forme:u=>Math.pow(1-u,1.6)}),{g:1.2*g,sat:6,filtres:[{type:'highpass',f:350},{type:'lowpass',f:5000}],env:[[0,1],[dd*0.8,1],[dd,0]]},d)
};
/* la lame dans le métal : un coup qui ENTRE (pas un « ting » qui rebondit) — un choc mat, une plaque qui vibre à peine, étouffée tout de suite */
const plaque=(t,f,g,d)=>{A.choc(t,{f:f*0.5,f2:f*0.2,d:0.09,g:0.5*g,sat:2.5},d);A.modes(t,f,[[1,1,0.09,4],[1.62,0.6,0.07,5],[2.31,0.4,0.05],[3.1,0.25,0.04]],{g:0.16*g},d);
  br(t,{bp:f*3,bq:1.3,env:A.perc(0.001,0.04),g:0.35*g},d);};
const S={};
/* ================= le Pisteur ================= */
S.refus=(t,d)=>{coup(t,115,0.07,0.16,d,{sat:1.5,bruit:0.3,corps:0.6});};
S.ombre=(t,d)=>{br(t,{coul:'rose',bp:520,bp2:170,bpt:0.5,bq:1.2,env:[[0,0],[0.08,1],[0.6,0]],g:0.24},d);tn(t,{f:110,f2:60,gl:0.5,env:[[0,0],[0.06,1],[0.65,0]],g:0.16,sat:1.5},d);};
S.saut=(t,d)=>{br(t,{coul:'rose',bp:420,bp2:880,bpt:0.16,bq:1,env:[[0,0],[0.03,1],[0.22,0]],g:0.17},d);};
/* (version 11) la dague du donjon : le swish part quand on appuie, son sommet tombe sur la lame (0,08 seconde après) ; puis la lame
   dans la chair du donjon (« chairD », version C, celle que Romain a choisie) et la plaque qu'elle traverse. Trois coups, trois sons ;
   le troisième (20 points) est nettement plus fort. */
S.swish1=(t,d)=>{O.swish(t,0.13,{},d);};
S.swish2=(t,d)=>{O.swish(t,0.13,{f1:600,f2:3600,f3:1400},d);};
S.swish3=(t,d)=>{br(t,{bp:4500,bq:5,env:[[0,0],[0.01,1],[0.06,0.6],[0.09,0]],g:0.4},d);O.swish(t+0.01,0.13,{f1:500,f2:3000,f3:1200,g:1.3},d);};
S.dague1=(t,d)=>{br(t,{filtres:[{type:'bandpass',f:3000,pts:[[0.05,1200]],q:2}],env:A.perc(0.002,0.05),g:0.7},d);O.tchac(t+0.01,{mouille:1.4},d);plaque(t,620,1,d);};
S.dague2=(t,d)=>{br(t,{filtres:[{type:'bandpass',f:2600,pts:[[0.05,1000]],q:2}],env:A.perc(0.002,0.05),g:0.7},d);O.tchac(t+0.01,{mouille:1.2,g:1.1},d);plaque(t,470,1.15,d);
  br(t+0.02,{bp:1800,bp2:900,bpt:0.12,bq:3,env:A.perc(0.005,0.12),g:0.18,rugueux:0.6},d);};
S.dague3=(t,d)=>{A.choc(t,{f:150,f2:45,d:0.3,g:0.8,sat:4},d);br(t,{filtres:[{type:'bandpass',f:2400,pts:[[0.06,800]],q:1.6}],env:A.perc(0.001,0.07),g:0.9},d);
  O.tchac(t+0.01,{mouille:1.5,g:1.4},d);plaque(t,330,1.6,d);O.craque(t+0.02,0.12,0.25,d);O.chuteGrave(t,0.5,0.45,d);O.chantLame(t+0.06,{f:2600,g:0.05},d);};
/* un golem touché par autre chose que la dague (le rouge d'un autre golem…) : la plaque, plus sourde */
S.frappe=(t,d)=>{coup(t,150,0.09,0.3,d);plaque(t,400,0.9,d);};
/* l'embuscade : la dague du donjon, au plus fort */
S.assassin=(t,d)=>{O.swish(t-0.02,0.1,{f1:500,f2:2800,f3:1100,g:1.2},d);O.tchac(t,{mouille:1.6,g:1.5},d);plaque(t,300,1.7,d);O.chuteGrave(t,0.6,0.5,d);coup(t,125,0.17,0.46,d,{sat:3});br(t,{bp:1200,bp2:500,bpt:0.12,bq:1.2,env:A.perc(0.002,0.12),g:0.14},d);metal(t,98,0.6,0.07,d);};
S.bong=(t,d)=>{coup(t,105,0.15,0.42,d);metal(t,110,0.9,0.09,d,1.2);};
S.ting=(t,d)=>{metal(t,330,0.5,0.1,d,1.2);coup(t,190,0.05,0.14,d,{bruit:0.3,corps:0.5});};
S.aie=(t,d)=>{vx(t,{f:205,forme:'aie',d:0.2,r:0.3,lp:1500,hp:140,g:0.22,a:0.01},d);coup(t,130,0.08,0.2,d);};
S.chute=(t,d)=>{vx(t,{f:185,forme:'plainte',d:0.5,r:0.3,lp:1300,hp:130,g:0.2},d);coup(t+0.18,95,0.24,0.5,d,{sat:3});br(t+0.18,{coul:'brun',lp:400,env:A.perc(0.01,0.6),g:0.3},d);};
S.perdu=(t,d)=>{tn(t,{f:205,f2:118,gl:0.3,env:[[0,0],[0.02,1],[0.34,0]],g:0.12,lp:900},d);};
S.ramasse=(t,d)=>{br(t,{coul:'rose',bp:850,bq:0.8,env:[[0,0],[0.12,1],[0.3,0.5],[0.5,0]],g:0.09,rugueux:0.7,rugVit:5},d);};
S.choix=(t,d)=>{A.cloche(t,m2f(62),{d:1.3,rapport:2,indice:0.6,g:0.06},d);A.cloche(t+0.14,m2f(69),{d:1.2,rapport:2,indice:0.5,g:0.045},d);};
S.or=(t,d)=>{A.cloche(t,m2f(57),{d:1.6,rapport:3.5,indice:0.8,g:0.05},d);A.cloche(t+0.09,m2f(64),{d:1.4,rapport:3.5,indice:0.7,g:0.04},d);br(t,{coul:'rose',bp:600,bp2:1200,bpt:0.5,bq:2,env:[[0,0],[0.3,1],[0.7,0]],g:0.06},d);};
S.tirVise=(t,d)=>{tn(t,{f:185,f2:92,gl:0.18,env:A.perc(0.004,0.22),g:0.16,lp:900},d);br(t+0.02,{coul:'rose',bp:700,bp2:320,bpt:0.25,bq:1.4,env:A.perc(0.01,0.28),g:0.14},d);};
S.sifflet=(t,d)=>{tn(t,{f:760,f2:700,gl:0.45,env:[[0,0],[0.05,1],[0.35,0.8],[0.5,0]],g:0.07,vib:[6,10],lp:1600},d);br(t,{bp:760,bq:8,env:[[0,0],[0.05,1],[0.5,0]],g:0.09},d);};
S.victoire=(t,d)=>{A.nappe(t,[m2f(50),m2f(57),m2f(62),m2f(66)],3.6,{lp1:300,lp:1100,a:0.8,r:2,g:0.035},d);A.cloche(t+0.1,m2f(62),{d:2.5,rapport:2,indice:0.6,g:0.06},d);};

/* ================= les coups des golems ================= */
S.swishG=(t,d)=>{br(t,{coul:'rose',bp:300,bp2:680,bpt:0.14,bq:1.1,env:[[0,0],[0.04,1],[0.2,0]],g:0.2},d);};
S.bang=(t,d)=>{coup(t,118,0.17,0.5,d,{sat:2.5});br(t,{coul:'brun',lp:410,env:A.perc(0.01,0.4),g:0.3},d);};
S.impact=(t,d)=>{coup(t,98,0.22,0.55,d,{sat:3});br(t,{coul:'brun',lp:360,env:A.perc(0.01,0.7),g:0.4},d);br(t+0.03,{coul:'rose',lp:900,env:A.perc(0.01,0.25),g:0.14,rugueux:0.8},d);};
S.casse=(t,d)=>{coup(t,140,0.12,0.4,d);br(t,{coul:'rose',bp:700,bq:0.7,env:A.perc(0.004,0.24),g:0.26,rugueux:0.9,rugVit:8},d);};
/* (version 11) le golem tué éclate : le métal qui casse, puis les morceaux qui tombent au sol et rebondissent (plus gros, plus graves,
   plus nombreux pour les gros golems) */
S.acheve=(t,d,o)=>{const f=vde(o),gros=clamp(125/f,0.7,2.1),n=Math.round(5+gros*4);
  A.choc(t,{f:140/gros,f2:50/gros,d:0.25,g:0.6,sat:3},d);O.craque(t,0.18*gros,0.35,d);br(t,{coul:'rose',bp:900,bq:0.8,env:A.perc(0.003,0.18),g:0.3},d);
  for(let k=0;k<n;k++){const u=t+0.12+Math.pow(Math.random(),0.8)*0.75*gros,fm=rnd(320,900)/Math.sqrt(gros),g=rnd(0.5,1)/(1+k*0.08);
    A.modes(u,fm,[[1,1,rnd(0.1,0.25),3],[2.4,0.5,0.12,4],[3.9,0.25,0.06]],{g:0.07*g},d);A.choc(u,{f:fm*0.4,f2:fm*0.2,d:0.05,g:0.18*g,bruit:0.4},d);
    if(Math.random()<0.5){const v=u+rnd(0.07,0.14);A.modes(v,fm*1.03,[[1,1,0.08,3],[2.4,0.4,0.05]],{g:0.035*g},d);}}
  br(t+0.1,{coul:'rose',bp:650,bq:0.9,rugueux:1,rugVit:14,env:[[0,0],[0.1,1],[0.6*gros,0.4],[0.9*gros,0]],g:0.16},d);
  if(gros>1.4)O.chuteGrave(t+0.05,0.9,0.5,d);
  vx(t,{f:f*0.9,forme:'plainte',d:0.4,r:0.8,lp:900,g:0.12*kv(o)},d);};
S.jav=(t,d)=>{vx(t,{f:150,forme:'cri',d:0.22,r:0.9,lp:1300,g:0.26,a:0.01},d);br(t,{coul:'rose',bp:300,bp2:900,bpt:0.2,bq:1.3,env:[[0,0],[0.03,1],[0.3,0]],g:0.28},d);tn(t,{f:180,f2:90,gl:0.25,env:A.perc(0.01,0.25),g:0.1,lp:700},d);};
/* le mortier tire : le coup sourd du tube ; S.obus : l'obus qui retombe (un sifflement grave qui descend, là où il va tomber) */
S.mortier=(t,d)=>{coup(t,88,0.2,0.5,d,{sat:3});br(t,{coul:'brun',lp:450,env:A.perc(0.01,0.35),g:0.3},d);};
S.obus=(t,d,o)=>{const dur=(o&&o.dur)||1.4;tn(t,{f:560,f2:230,gl:dur,env:[[0,0],[dur*0.25,0.5],[dur*0.9,1],[dur,0]],g:0.075,lp:1100,vib:[9,6]},d);br(t,{bp:520,bp2:240,bpt:dur,bq:5,env:[[0,0],[dur*0.3,0.5],[dur*0.9,1],[dur,0]],g:0.1},d);};
S.onde=(t,d)=>{coup(t,68,0.36,0.7,d,{sat:3});br(t,{coul:'brun',lp:290,env:A.perc(0.01,1.2),g:0.5},d);metal(t,55,1.6,0.09,d);};
/* (version 11) l'énorme portail de bois des renforts : il s'ouvre (deux battants qui grincent, très grave, le loquet de fer), puis il se
   referme (un grincement plus court) et claque (un coup énorme et sourd, les ferrures qui tremblent) */
S.porteOuvre=(t,d)=>{A.choc(t,{f:140,f2:70,d:0.12,g:0.12},d);metal(t,196,0.5,0.025,d,1.0);
  grince(t+0.08,'portail',1.5,{i0:0.07,i1:0.03},{g:0.3,lp:800,hp:70,vit:0.42},d);grince(t+0.3,'portail2',1.3,{i0:0.06,i1:0.028},{g:0.22,lp:700,hp:70,vit:0.38},d);
  br(t+0.1,{coul:'rose',bp:170,bq:1.2,rugueux:0.8,rugVit:3,env:[[0,0],[0.4,1],[1.5,0.5],[1.9,0]],g:0.3},d);br(t+0.6,{coul:'brun',lp:220,env:[[0,0],[0.6,1],[1.6,0]],g:0.25},d);};
S.porteFerme=(t,d)=>{grince(t,'portailF',0.8,{i0:0.06,i1:0.03},{g:0.24,lp:750,hp:70,vit:0.45},d);br(t,{coul:'rose',bp:180,bq:1.2,rugueux:0.7,rugVit:3,env:[[0,0],[0.3,1],[0.8,0]],g:0.22},d);};
S.porteClaque=(t,d)=>{A.choc(t,{f:82,f2:34,d:0.5,g:0.9,sat:3.5},d);O.chuteGrave(t,0.9,0.7,d);br(t,{coul:'brun',lp:300,env:[[0,0],[0.01,1],[1.4,0]],g:0.6},d);
  br(t,{bp:420,bq:1,env:A.perc(0.002,0.12),g:0.5},d);[0.05,0.12,0.2].forEach((k,i)=>metal(t+k,rnd(180,240),0.35,0.04/(1+i),d,1.1));};
S.fantome=(t,d)=>{br(t,{coul:'rose',bp:300,bp2:850,bpt:0.5,bq:2,env:[[0,0],[0.5,1],[0.62,0]],g:0.17},d);vx(t,{f:135,forme:'plainte',d:0.7,r:0.2,s:0.7,lp:800,g:0.1},d);};
/* un golem bondit (le plaquage du rôdeur, le recul du javelot, la volte du faucheur) ; le réparateur recolle un blessé */
S.bond=(t,d)=>{br(t,{coul:'rose',bp:360,bp2:760,bpt:0.18,bq:1.1,env:[[0,0],[0.04,1],[0.24,0]],g:0.2},d);coup(t,120,0.05,0.12,d,{bruit:0.3});};
S.soin=(t,d)=>{cliquetis(t,'outil',0.3,34,{g:0.1,lp:1800,hp:400},d);metal(t+0.28,147,0.7,0.07,d,1.1);metal(t+0.4,196,0.6,0.05,d,1.0);};
S.chaine=(t,d)=>{cliquetis(t,'chaine',0.5,26,{g:0.2,lp:1500,hp:220},d);[0,0.1,0.22].forEach(k=>metal(t+k,rnd(190,240),0.28,0.04,d));br(t,{coul:'rose',bp:350,bp2:800,bpt:0.3,bq:1.2,env:[[0,0],[0.08,1],[0.4,0]],g:0.16},d);};

/* ================= les sons qui font comprendre ================= */
/* repéré : un « HA ! » rauque, un coup de métal sourd, et un frisson grave qui reste une demi-seconde */
S.repere=(t,d,o)=>{const f=vde(o);vx(t,{f:f*1.15,forme:'cri',d:0.3,r:0.85,lp:1300,g:0.36*kv(o),a:0.01},d);metal(t,147,1.0,0.1,d);coup(t,92,0.12,0.3,d);moteur(t+0.05,73,0.6,0.11,d,14,420);};
/* il l'a perdu, il cherche : un « hmm ? » qui monte, et un grincement lent */
S.cherche=(t,d,o)=>{const f=vde(o);vx(t,{f:f*0.85,forme:'question',d:0.5,r:0.45,lp:900,g:0.22*kv(o)},d);grince(t+0.15,'cherche',0.6,{i0:0.05,i1:0.02},{vit:0.5,lp:900,hp:120,g:0.13},d);};
/* un golem blessé crie : ceux d'à côté rappliquent */
S.cri=(t,d,o)=>{const f=vde(o);vx(t,{f:f*1.3,forme:'aie',d:0.32,r:0.85,lp:1400,g:0.3*kv(o),a:0.01},d);moteur(t,f*0.5,0.3,0.08,d,38,600);};
/* la colère (l'enrage) : la même signature pour tous — un grondement qui enfle, la ferraille qui grince, un coup de métal ; puis la voix de celui qui s'énerve */
S.colere=(t,d,o)=>{const f=vde(o);
  br(t,{coul:'rose',bp:260,bq:2,rugueux:1,rugVit:9,env:[[0,0],[0.35,1],[1.25,0]],g:0.24},d);moteur(t,49,1.25,0.17,d,22,340);metal(t+0.3,110,1.5,0.09,d);
  vx(t+0.05,{f:f*0.8,forme:'effort',d:0.85,r:0.95,lp:1000,g:0.34*kv(o)},d);vx(t+0.5,{f:f,forme:'cri',d:0.7,r:1,lp:1200,g:0.3*kv(o)},d);};
/* le mortier se déchaîne : un rugissement creux, deux coups dans le tube */
S.dechaine=(t,d)=>{br(t,{coul:'rose',bp:150,bq:4,env:[[0,0],[0.3,1],[1.0,0]],g:0.4},d);vx(t,{f:86,forme:'effort',d:0.85,r:0.9,lp:700,g:0.3},d);coup(t+0.5,90,0.14,0.36,d);coup(t+0.72,84,0.14,0.36,d);};
/* les renforts : Grosbec grogne derrière la porte (sa voix du combat de l'Alchimiste, étouffée par le bois), deux fois */
S.renfort=(t,d)=>{vx(t,{f:125,forme:'effort',d:0.5,g:0.34,lp:760},d);vx(t+0.58,{f:108,forme:'effort',d:0.8,r:0.8,g:0.36,lp:760},d);br(t,{coul:'brun',lp:250,env:[[0,0],[0.4,1],[1.5,0]],g:0.22},d);};

/* ================= une zone rouge = un son (il prévient, pendant que le rouge se dessine) ================= */
const MONTE=[[0,0.7],[0.6,1],[1,1.28]];
S.zChien=(t,d)=>{vx(t,{f:150,forme:MONTE,d:0.55,r:0.95,gr:0.9,lp:1300,g:0.32},d);cliquetis(t+0.1,'crocs',0.4,30,{g:0.12,lp:1600,hp:300},d);};
/* (version 11 : « pas assez prenants ») le javelot arme : il gronde en montant, la pointe racle, le bras se tend comme un ressort */
S.zJavelot=(t,d)=>{vx(t,{f:120,forme:MONTE,d:0.85,r:0.9,gr:0.9,lp:1100,g:0.3},d);grince(t,'bande',0.75,{i0:0.06,i1:0.012},{g:0.2,lp:1700,hp:240,vit:0.8},d);
  br(t+0.05,{bp:1500,bp2:800,bpt:0.7,bq:3,rugueux:0.8,rugVit:11,env:[[0,0],[0.15,0.6],[0.7,1],[0.8,0]],g:0.12},d);
  tn(t,{type:'sawtooth',f:73,f2:110,gl:0.8,env:[[0,0],[0.1,0.6],[0.75,1],[0.85,0]],g:0.12,trem:[14,0.6],lp:520},d);};
/* le porte-dalle lève sa dalle : la pierre qui racle, la ferraille qui force, un grand effort qui monte */
S.zDalle=(t,d)=>{br(t,{coul:'rose',bp:280,bq:1.5,rugueux:0.9,rugVit:5,env:[[0,0],[0.15,1],[0.9,0.6],[1.1,0]],g:0.3},d);grince(t+0.1,'force',0.9,{i0:0.07,i1:0.02},{vit:0.5,lp:900,hp:100,g:0.16},d);
  vx(t+0.05,{f:96,forme:'effort',d:1.0,r:0.95,gr:0.9,lp:900,g:0.34},d);moteur(t,49,1.1,0.12,d,18,380);};
S.chargeDalle=(t,d)=>{[0,0.14,0.28].forEach(k=>coup(t+k,86,0.1,0.32,d));vx(t,{f:105,forme:'cri',d:0.5,r:0.95,lp:1000,g:0.3},d);br(t,{coul:'brun',lp:450,env:[[0,0],[0.25,1],[0.5,0]],g:0.25},d);metal(t+0.3,130,0.5,0.05,d);};
S.zFaux=(t,d)=>{br(t,{bp:900,bp2:1450,bpt:0.6,bq:6,env:[[0,0],[0.5,1],[0.78,0]],g:0.13},d);br(t,{coul:'rose',bp:450,bq:2,rugueux:0.7,env:[[0,0],[0.4,1],[0.8,0]],g:0.16},d);metal(t+0.05,196,1.0,0.06,d);vx(t,{f:110,forme:MONTE,d:0.6,r:0.7,s:0.5,lp:900,g:0.14},d);};
S.zMortier=(t,d)=>{coup(t,140,0.08,0.26,d);br(t+0.05,{coul:'rose',bp:180,bq:6,env:[[0,0],[0.3,1],[0.8,0]],g:0.34},d);tn(t+0.05,{f:80,f2:140,gl:0.7,env:[[0,0],[0.5,1],[0.75,0]],g:0.12,sat:2,lp:420},d);};
S.zBelier=(t,d)=>{[0,0.3].forEach(k=>br(t+k,{coul:'rose',bp:380,bq:1.2,rugueux:1,rugVit:7,env:A.perc(0.03,0.2),g:0.3},d));br(t+0.58,{coul:'rose',bp:220,bq:2,env:A.perc(0.05,0.3),g:0.28},d);vx(t+0.58,{f:82,forme:'effort',d:0.36,r:0.8,lp:620,g:0.22},d);};
S.chargeBelier=(t,d)=>{[0,0.12,0.24,0.36].forEach(k=>coup(t+k,80,0.09,0.28,d));vx(t,{f:100,forme:'cri',d:0.5,r:0.9,lp:900,g:0.24},d);};
S.zBoule=(t,d)=>{[185,152,128,108].forEach((f,i)=>{metal(t+i*0.18,f,0.36,0.075,d);coup(t+i*0.18,150,0.05,0.16,d,{bruit:0.3});});br(t,{coul:'rose',bp:300,bq:1.6,rugueux:1,rugVit:8,env:[[0,0],[0.5,0.7],[0.9,1],[1.0,0]],g:0.17},d);};
S.zCuirasse=(t,d)=>{tn(t,{type:'sawtooth',f:62,f2:92,gl:0.7,env:[[0,0],[0.15,0.7],[0.65,1],[0.78,0]],g:0.16,trem:[18,0.7],lp:400},d);grince(t,'bras',0.6,{i0:0.05,i1:0.015},{vit:0.55,lp:1000,hp:140,g:0.16},d);};
/* les quatre zones du colosse : la même grosse voix qui inspire, et un dessin de son pour chacune */
const souffleColosse=(t,d,dur)=>{vx(t,{f:66,forme:'effort',d:dur,r:0.8,lp:600,g:0.3},d);br(t,{coul:'brun',lp:270,env:[[0,0],[dur*0.8,1],[dur,0]],g:0.36},d);};
S.zonde=(t,d)=>{souffleColosse(t,d,1.3);tn(t,{f:42,f2:66,gl:1.3,env:[[0,0],[1.1,1],[1.3,0]],g:0.2,sat:2.5,lp:300},d);};
S.zpilon=(t,d)=>{souffleColosse(t,d,1.0);coup(t,76,0.15,0.42,d);coup(t+0.3,76,0.15,0.42,d);};
S.zanneau=(t,d)=>{souffleColosse(t,d,1.1);br(t,{coul:'rose',bp:200,bp2:520,bpt:1.1,bq:2.5,trem:[6,0.8],env:[[0,0],[0.9,1],[1.2,0]],g:0.26},d);};
S.zcroix=(t,d)=>{souffleColosse(t,d,1.1);metal(t,82,1.2,0.11,d);metal(t+0.26,110,1.1,0.1,d);};

/* ================= les bruits de patrouille (rares, un seul à la fois) : chacun le sien ================= */
/* le rôdeur renifle ; parfois sa mâchoire claque */
S.iChien=(t,d)=>{const n=Math.random()<0.5?2:3;for(let k=0;k<n;k++)br(t+k*0.17,{coul:'rose',bp:1050,bp2:600,bpt:0.09,bq:2.5,env:[[0,0],[0.03,1],[0.11,0]],g:0.14},d);
  if(Math.random()<0.4){coup(t+n*0.17+0.1,230,0.04,0.11,d,{bruit:0.3,corps:0.5});metal(t+n*0.17+0.1,262,0.16,0.03,d);}};
/* le rôdeur sur la piste : la gorge qui racle */
S.iChienGrogne=(t,d)=>{vx(t,{f:86,forme:'effort',d:0.75,r:0.7,gr:1,gv:3,lp:650,g:0.17},d);moteur(t,43,0.75,0.06,d,31,360);};
/* le rôdeur qui poursuit : un aboiement de monstre, rauque, avec de la ferraille dedans */
const ABOI=[[0,0.75],[0.12,1.25],[0.45,1.0],[1,0.62]];
S.aboie=(t,d)=>{const f=rnd(150,185),un=(u,k)=>{vx(u,{f:f*k,forme:ABOI,d:0.2,r:0.95,gr:0.8,lp:1500,hp:110,g:0.34,a:0.008},d);tn(u,{type:'sawtooth',f:f*k*0.5,env:A.perc(0.005,0.18),g:0.1,trem:[45,0.9],lp:700},d);};
  un(t,1);if(Math.random()<0.45)un(t+0.26,0.92);};
S.iJavelot=(t,d)=>{vx(t,{f:118,forme:'effort',d:0.45,r:0.85,s:0.4,lp:800,g:0.16},d);coup(t+0.5,180,0.05,0.14,d,{bruit:0.3,corps:0.8});coup(t+0.75,170,0.05,0.12,d,{bruit:0.3,corps:0.8});grince(t+0.85,'jav',0.35,{i0:0.04,i1:0.02},{vit:0.6,lp:1200,hp:200,g:0.1},d);};
S.iDalle=(t,d)=>{br(t,{coul:'rose',bp:240,bq:1.3,rugueux:0.9,rugVit:4,env:[[0,0],[0.25,1],[0.9,0]],g:0.22},d);vx(t+0.2,{f:88,forme:'effort',d:0.6,r:0.75,lp:700,g:0.15},d);metal(t+0.95,110,0.5,0.05,d);coup(t+0.95,120,0.06,0.14,d);};
S.iFaux=(t,d)=>{const e=[[0,0],[0.3,1],[1.2,0.7],[1.5,0]];br(t,{bp:700,bq:5,rugueux:0.6,rugVit:4,env:e,g:0.085},d);br(t,{coul:'rose',bp:380,bq:2,rugueux:0.5,env:e,g:0.11},d);};
S.iMortier=(t,d)=>{br(t,{coul:'rose',bp:150,bq:5,env:[[0,0],[0.5,1],[1.3,0]],g:0.26},d);coup(t+1.3,200,0.03,0.08,d,{bruit:0.3,corps:0.4});};
S.iBelier=(t,d)=>{[0,0.35].forEach(k=>br(t+k,{coul:'rose',bp:240,bq:2.2,env:A.perc(0.04,0.25),g:0.24},d));coup(t+0.85,130,0.06,0.14,d);};
S.iCuirasse=(t,d)=>{const n=Math.random()<0.5?2:3;for(let k=0;k<n;k++)metal(t+k*rnd(0.13,0.2),rnd(120,170),0.42,0.055,d);coup(t,95,0.07,0.13,d);};
/* (version 11) le colosse : « un bruit menaçant, vraiment un gros bruit », « un peu comme Grosbec, plusieurs bruits différents ».
   La voix de Grosbec du combat de l'Alchimiste (grave, éraillée, étouffée), plus grave encore, avec la machine dessous. */
const vColosse=(t,o,d)=>{vx(t,Object.assign({f:92,forme:'effort',d:0.6,r:0.75,gr:0.8,lp:900,g:0.34},o),d);};
S.colosseArrive=(t,d)=>{[0,0.42,0.84].forEach(k=>{O.chuteGrave(t+k,0.6,0.5,d);A.choc(t+k,{f:75,f2:38,d:0.25,g:0.42,sat:3},d);});
  vColosse(t+1.1,{f:84,forme:'cri',d:1.2,r:0.95,lp:1100,g:0.42},d);moteur(t+1.1,41,1.3,0.16,d,20,330);metal(t+1.15,55,2.2,0.08,d);br(t+1.1,{coul:'brun',lp:200,env:[[0,0],[0.3,1],[1.6,0]],g:0.4},d);};
S.gColosse1=(t,d)=>{vColosse(t,{d:0.8},d);br(t,{coul:'brun',lp:180,env:[[0,0],[0.4,1],[1.2,0]],g:0.35},d);};                       /* il grogne */
S.gColosse2=(t,d)=>{vColosse(t,{f:86,d:0.45,r:0.85},d);vColosse(t+0.5,{f:100,forme:'cri',d:0.9,r:0.95,lp:1100,g:0.38},d);};         /* il s'énerve */
S.gColosse3=(t,d)=>{moteur(t,44,1.6,0.14,d,24,380);vColosse(t+0.15,{f:78,d:1.3,r:0.55,s:0.45,g:0.28},d);};                         /* il souffle, la machine gronde */
S.gColosse4=(t,d)=>{[0,0.24,0.48].forEach((k,i)=>vColosse(t+k,{f:96-i*4,d:0.2,r:0.9,g:0.3},d));br(t,{coul:'brun',lp:200,env:[[0,0],[0.2,1],[0.9,0]],g:0.25},d);}; /* il rit, très grave */
S.gColosse5=(t,d)=>{vColosse(t,{f:110,forme:'cri',d:0.5,r:0.6,lp:1200,g:0.36},d);vColosse(t+0.6,{f:118,forme:'cri',d:0.45,r:0.6,lp:1200,g:0.32},d);A.tambour(t,{f:70,d:0.5,g:0.1},d);}; /* il hurle un ordre */
S.pasColosse=(t,d)=>{O.chuteGrave(t,0.5,0.4,d);A.choc(t,{f:72,f2:34,d:0.28,g:0.5,sat:3},d);br(t,{coul:'brun',lp:300,env:A.perc(0.01,0.4),g:0.3},d);};
S.iRepare=(t,d)=>{cliquetis(t,'outil',0.3,34,{g:0.08,lp:1800,hp:400},d);tn(t+0.32,{type:'square',f:196,env:A.perc(0.004,0.08),g:0.03,lp:900},d);};
S.iFantome=(t,d)=>{br(t,{coul:'rose',bp:600,bp2:300,bpt:1.2,bq:3,rugueux:0.5,env:[[0,0],[0.6,1],[1.4,0]],g:0.11},d);vx(t+0.1,{f:140,forme:'plainte',d:1.0,r:0.2,s:0.6,lp:800,g:0.08},d);};
const IDLE={chien:'iChien',javelot:'iJavelot',dalle:'iDalle',faucheur:'iFaux',mortier:'iMortier',belier:'iBelier',cuirasse:'iCuirasse',colosse:'iColosse',repare:'iRepare'};

/* ================= jouer un son : où, à quel volume, et pas trop à la fois ================= */
const ALIAS={alerte:'repere',grogne:'zChien',vise:'zJavelot',gratte:'zBelier',rouge:'chargeBelier',ordre:'colere',cor:'renfort',roule:'zBoule'};
/* r : jusqu'où on l'entend (en pas) ; p : le volume qu'il garde même loin (les sons qui font comprendre) ; pri : 3 ne se coupe jamais,
   1 se tait dès qu'il y a du monde ; min : pas deux fois le même en moins de … secondes ; rev, gr : la résonance de la salle */
const SORTE={
  patrouille:{r:9.5,p:0,pri:1,min:0.6,rev:0.3,gr:0.22},
  coup:{r:13,p:0,pri:2,min:0.06,rev:0.2,gr:0.1},
  zone:{r:14,p:0,pri:3,min:0.22,rev:0.24,gr:0.14},
  signal:{r:14,p:0.55,pri:3,min:0.9,rev:0.26,gr:0.2},
  moi:{r:0,p:1,pri:2,min:0.045,rev:0.14,gr:0.05}
};
const SIGNAUX={repere:1,cherche:1,colere:1,dechaine:1,renfort:1,cri:1},MOI={swish1:1,swish2:1,swish3:1,dague1:1,dague2:1,dague3:1,refus:1,ombre:1,saut:1,aie:1,chute:1,perdu:1,ramasse:1,choix:1,or:1,tirVise:1,sifflet:1,victoire:1,assassin:1,bong:1};
/* (ce qu'un signal garde de volume même loin : être repéré, la colère et les renforts s'entendent toujours ; chercher et crier, de près) */
const PLANCHER={repere:0.6,colere:0.6,renfort:0.7,dechaine:0.5,cherche:0.15,cri:0.2,porteOuvre:0.45,porteFerme:0.35,porteClaque:0.45,colosseArrive:0.6};
/* (version 11) ceux qu'on entend de plus loin que les autres de leur sorte : le colosse, le portail */
const RAYON={colosseArrive:30,gColosse1:22,gColosse2:22,gColosse3:22,gColosse4:22,gColosse5:22,pasColosse:20,porteOuvre:26,porteFerme:26,porteClaque:26};
const MINI={porteOuvre:0.8,porteFerme:0.8,porteClaque:0.6,pasColosse:0.3,gColosse1:2,gColosse2:2,gColosse3:2,gColosse4:2,gColosse5:2,cherche:1.6,colere:1.2,renfort:1.5,cri:0.5,aboie:0.5,bang:0.1,swishG:0.12,obus:0.15};
function sorteDe(n){return n==='boule'?'patrouille':SIGNAUX[n]?'signal':MOI[n]?'moi':n[0]==='z'||n==='obus'||n.slice(0,6)==='charge'?'zone':/^i[A-Z]/.test(n)||n==='aboie'?'patrouille':'coup';}
/* le volume selon la distance au Pisteur (0 à 1) et le côté (-1 à gauche, 1 à droite) */
function ecoute(x,y,r,p){
  const d=hyp(x-P.x,(y-P.y)*1.15),a=d<=2.5?1:Math.pow(clamp(1-(d-2.5)/(r-2.5),0,1),1.5);
  return [Math.max(p,a),clamp((x-P.x)/8,-0.8,0.8)];
}
/* le niveau de chaque son, réglé par la mesure (tests/sons.py regler) pour que chaque sorte ait sa place : ne pas toucher à la main */
const NIV=/*NIV*/{"refus":3.4,"ombre":1.8,"saut":2.91,"swish1":0.39,"swish2":0.39,"swish3":0.45,"dague1":0.42,"dague2":0.58,"dague3":0.36,"frappe":0.68,"assassin":0.3,"bong":1.39,"ting":0.83,"aie":0.49,"chute":0.71,"perdu":3.44,"ramasse":2.26,"choix":0.82,"or":1.03,"tirVise":4.5,"sifflet":0.51,"victoire":0.67,"swishG":2.84,"bang":1.02,"impact":0.81,"casse":0.99,"acheve":0.58,"jav":0.84,"mortier":1.1,"obus":0.84,"onde":0.84,"porteOuvre":2.47,"porteFerme":3.42,"porteClaque":0.43,"fantome":1.8,"bond":2.21,"soin":3.19,"chaine":3.11,"repere":0.83,"cherche":1.11,"cri":0.63,"colere":0.88,"dechaine":1.27,"renfort":1.15,"zChien":0.97,"zJavelot":1.07,"zDalle":1.02,"chargeDalle":0.99,"zFaux":2.32,"zMortier":2.0,"zBelier":1.62,"chargeBelier":1.08,"zBoule":1.91,"zCuirasse":2.68,"zonde":1.41,"zpilon":1.16,"zanneau":1.4,"zcroix":1.39,"iChien":5.63,"iChienGrogne":0.88,"aboie":0.89,"iJavelot":0.98,"iDalle":1.04,"iFaux":2.42,"iMortier":2.4,"iBelier":1.93,"iCuirasse":3.16,"colosseArrive":0.68,"gColosse1":1.37,"gColosse2":0.86,"gColosse3":1.49,"gColosse4":1.88,"gColosse5":0.67,"pasColosse":0.74,"iRepare":5.85,"iFantome":1.14,"boule":0.59,"musique":0.35,"musAction":0.27}/*FIN*/;
const dernierSon={},JOUES={},ERR=[];let recents=[];       /* (JOUES, ERR : pour les essais — ce qui a sonné, ce qui a raté) */
function son(n,a,b){
  if(!A||!sonOn||demo)return;                       /* l'extrait d'avant le jeu est muet */
  n=ALIAS[n]||n;const f=S[n];if(!f)return;
  const now=AC.currentTime,so=SORTE[sorteDe(n)],min=MINI[n]||so.min;
  if(dernierSon[n]&&now-dernierSon[n]<min)return;
  /* pas un brouillard : s'il y a déjà beaucoup de sons, les moins importants se taisent */
  recents=recents.filter(u=>now-u<0.8);const serre=recents.filter(u=>now-u<0.4).length;
  if(so.pri===1&&recents.length>=2||so.pri===2&&serre>=5)return;
  let src=null,x=null,y=null;
  if(typeof a==='number'){x=a;y=b;}else{src=a||sonSrc;if(src&&so!==SORTE.moi){x=src.x;y=src.y;}}
  let att=1,pan=0;
  if(x!==null&&so.r>0){[att,pan]=ecoute(x,y,RAYON[n]||so.r,PLANCHER[n]==null?so.p:PLANCHER[n]);if(att<0.02)return;}
  dernierSon[n]=now;recents.push(now);
  JOUES[n]=(JOUES[n]||0)+1;
  try{PR.t=now;f(now+0.01,A.bus(PR,{g:att*(NIV[n]||1),pan:pan,rev:so.rev,grotte:so.gr}),src||b);}catch(e){if(ERR.length<20)ERR.push(n+' : '+e.message);}
}
/* la colère d'un groupe : la signature, là où est le groupe, avec la voix du plus gros */
const GROS=['colosse','cuirasse','belier','mortier','dalle','faucheur','javelot','chien','repare'];
function sonColere(grp){
  let m=null;for(const g of G)if(g.grp===grp&&vivant(g)&&(!m||GROS.indexOf(g.type)<GROS.indexOf(m.type)))m=g;
  if(m)son('colere',m);
}

/* ---------- la boule du cuirassé : un énorme caillou qui roule ; on ne l'entend que de près ---------- */
let BOULE=null;const BOULE_R={lp:260,bp:360,g1:0.7,g2:0.45};
function majBoule(now,actif){
  let pres=null,dm=99;
  if(actif&&phase==='vague'&&sonOn&&!demo)for(const g of G)if(g.etat==='roule'&&vivant(g)){const d=hyp(g.x-P.x,g.y-P.y);if(d<dm){dm=d;pres=g;}}
  if(!pres||dm>12){if(BOULE){BOULE.v.gain.setTargetAtTime(0,now,0.12);if(now-BOULE.vu>1.2){BOULE.arret();BOULE=null;}}return;}
  if(!BOULE){
    const c=AC,v=c.createGain(),pn=c.createStereoPanner?c.createStereoPanner():null,s1=c.createBufferSource(),s2=c.createBufferSource(),lp=c.createBiquadFilter(),bp=c.createBiquadFilter(),g1=c.createGain(),g2=c.createGain(),tr=c.createGain(),lfo=c.createOscillator(),lg=c.createGain(),rv=c.createGain();
    v.gain.value=0;s1.buffer=A.brun;s1.loop=true;s2.buffer=A.rose;s2.loop=true;s2.playbackRate.value=0.6;
    lp.type='lowpass';lp.frequency.value=BOULE_R.lp;bp.type='bandpass';bp.frequency.value=BOULE_R.bp;bp.Q.value=1.4;g1.gain.value=BOULE_R.g1;g2.gain.value=BOULE_R.g2;
    tr.gain.value=0.6;lfo.frequency.value=11;lg.gain.value=0.4;lfo.connect(lg);lg.connect(tr.gain);
    s1.connect(lp);lp.connect(g1);g1.connect(tr);s2.connect(bp);bp.connect(g2);g2.connect(tr);tr.connect(v);
    if(pn){v.connect(pn);pn.connect(PR.sec);}else v.connect(PR.sec);
    rv.gain.value=0.3;v.connect(rv);rv.connect(PR.cave);
    s1.start();s2.start();lfo.start();
    BOULE={v,pn,vu:now,arret(){try{s1.stop();s2.stop();lfo.stop();v.disconnect();rv.disconnect();}catch(e){}}};
  }
  const [att,pan]=ecoute(pres.x,pres.y,11,0);
  BOULE.vu=now;BOULE.v.gain.setTargetAtTime(att*(NIV.boule||1),now,0.08);if(BOULE.pn)BOULE.pn.pan.setTargetAtTime(pan,now,0.1);
}

/* ---------- les bruits qui viennent tout seuls : la patrouille, le flair, les aboiements, les pas du colosse ----------
   (au rythme de l'horloge du son, pas de celle du jeu : quand un essai fait défiler le jeu en accéléré, rien ne s'empile) */
const amb={idle:0,aboi:0,flair:0,soin:0},PORTES_V=[0,0],COL={vus:new WeakSet(),voix:0,der:0};let ASSOURDI=false;
function procheDe(l,rayon){
  let tot=0;const w=l.map(g=>{const d=hyp(g.x-P.x,g.y-P.y),k=d<rayon?1/(1+d):0;tot+=k;return k;});
  if(tot<=0)return null;let u=Math.random()*tot;for(let i=0;i<l.length;i++){u-=w[i];if(u<=0)return l[i];}return l[l.length-1];
}
function majSon(actif){
  if(!A)return;
  const now=AC.currentTime;majBoule(now,actif);
  /* dans l'ombre, tous les bruits sont assourdis ; à découvert, ils redeviennent clairs */
  const sourd=!!(actif&&phase==='vague'&&P.ombre&&!demo);
  if(sourd!==ASSOURDI&&PR&&PR.lps){ASSOURDI=sourd;for(const f of PR.lps)f.frequency.setTargetAtTime(sourd?LP_OMBRE:EQ_SONS.lp,now,sourd?0.25:0.1);}
  if(!actif||!sonOn||demo||phase!=='vague'){amb.idle=Math.max(amb.idle,now+1.5);PORTES_V[0]=porte[0];PORTES_V[1]=porte[1];return;}
  /* le portail des renforts : il s'ouvre ; quand ses battants commencent à se refermer, il grince ; fermé, il claque */
  for(let i=0;i<2;i++){const v=porte[i],a=PORTES_V[i],x=i?18:8;
    if(v>0.9&&a<0.42)son('porteOuvre',x,0.6);else if(a>0.41&&v<=0.41)son('porteFerme',x,0.6);else if(a>0.03&&v<=0.03)son('porteClaque',x,0.6);
    PORTES_V[i]=v;}
  /* le colosse : il arrive en grondant, il gronde toutes les quatre à sept secondes (jamais deux fois le même), et chacun de ses pas sonne */
  for(const g of G){if(g.type!=='colosse'||!vivant(g))continue;
    if(!COL.vus.has(g)){COL.vus.add(g);son('colosseArrive',g);COL.voix=now+rnd(4,6);}
    const ph=Math.floor((g.marche||0)/g.T.pas*2);if(g.bouge&&g._ph!=null&&ph!==g._ph)son('pasColosse',g);g._ph=ph;
    if(now>=COL.voix&&!(g.sonne>0)){let k;do k=1+Math.floor(Math.random()*5);while(k===COL.der);COL.der=k;son('gColosse'+k,g);COL.voix=now+rnd(4,7);}}
  const libres=G.filter(g=>vivant(g)&&g.etat!=='entre'&&!(g.sonne>0)&&!g.dort);
  /* les rôdeurs qui poursuivent aboient */
  if(now>=amb.aboi){const c=procheDe(libres.filter(g=>g.type==='chien'&&g.voit&&g.etat==='normal'),12);if(c){son('aboie',c);amb.aboi=now+rnd(0.8,1.7);}else amb.aboi=now+0.2;}
  /* la meute en colère qui remonte la piste : elle renifle, la gorge racle */
  if(now>=amb.flair){const c=procheDe(libres.filter(g=>g.type==='chien'&&g.colere&&!g.voit),10);if(c){son(Math.random()<0.6?'iChien':'iChienGrogne',c);amb.flair=now+rnd(1.5,3);}else amb.flair=now+0.4;}
  /* le réparateur penché sur un blessé */
  if(now>=amb.soin){const c=libres.find(g=>g.type==='repare'&&g.penche);if(c)son('iRepare',c);amb.soin=now+1.1;}
  /* la patrouille : un seul bruit à la fois, près du Pisteur, puis du silence */
  if(now>=amb.idle){
    const c=procheDe(libres.filter(g=>!g.voit&&g.etat==='normal'&&g.type!=='colosse'&&!(g.type==='chien'&&g.colere)),9.5);
    if(c)son(c.fantome?'iFantome':IDLE[c.type],c);
    amb.idle=now+rnd(2.4,5.2)+(Math.random()<0.3?rnd(2,4.5):0);
  }
}

/* ======================= la musique (version 11) : deux visages qui se fondent l'un dans l'autre =======================
   (Version 12, Romain, 15 h 05 : le combat ne se lance que si on est repéré par un groupe en colère, hors de l'ombre ; « vraiment
   musique d'action », « pas forte », « rythmée avec un peu de tension ».)
   Romain, 26 novembre, 14 h : « trop forte : tu peux la réduire de moitié » ; « quand on est dans l'ombre, la musique, hop, elle se
   remet doucement en version mystérieuse […] dès qu'on est visible, hop, elle engage une transition vers une musique un peu
   entraînante, mais qui fait peur, une musique de combat » ; « tu restes au même volume ».
   - toujours : un bourdon très grave (ré) dont le timbre respire lentement ;
   - le MYSTÈRE (dans l'ombre) : des nappes de cordes lointaines qui changent d'accord toutes les dix-huit secondes, un cœur qui se
     serre de vague en vague, une voix lointaine, du métal très loin, un souffle ;
   - le COMBAT (à découvert) : une basse qui martèle des croches (100 à la minute), des tambours graves, deux cordes qui tremblent à
     un demi-ton l'une de l'autre, un cuivre qui gronde ; plus dense de vague en vague ;
   - le colosse : le combat au plus fort (108 à la minute, tambours de guerre) ; dans l'ombre, le mystère avec un cœur qui bat vite.
   Les deux visages suivent la même mesure ; on passe de l'un à l'autre en fondu (une seconde et demie vers le combat, avec un roulement
   de tambour grave ; trois à quatre secondes vers le mystère). Ils sont réglés au même niveau (NIV.musique, NIV.musAction). */
const ACC=[[38,45,50,53],[38,45,50,52],[34,41,46,50],[43,50,55,58],[45,52,55,58],[38,44,50,51]];
const SUITES=[[0,1,0,2],[0,2,3,1],[0,3,4,2],[0,5,3,4]];
let MUS=null,musInt=null;
function musNiveau(){return vague>=6?3:vague>=4?2:vague>=2?1:0;}
function couche(E,P0,g){return {loin:E.bus(P0,{rev:0.32,grotte:0.3,g:g}),pres:E.bus(P0,{rev:0.1,g:g}),fond:E.bus(P0,{rev:0.2,grotte:0.5,g:0.9*g})};}
function fondu(L,v,t,tc){for(const k of ['loin','pres','fond']){const n=L[k].gain;n.cancelScheduledValues(t);n.setTargetAtTime(v*(k==='fond'?0.9:1),t,tc);}}
/* (ctx, moteur, prise : pour pouvoir fabriquer la musique hors ligne dans les essais) ; nm, na : le niveau du mystère, du combat */
function musDebut(E,P0,t,nm,na){
  const c=E.ctx,M={E:E,t0:t,n:0,tAcc:t+0.2,tCoeur:t+6,tVoix:t+rnd(18,30),tLoin:t+rnd(8,16),tVent:t+rnd(14,26),tMes:t+0.4,mes:0,mode:'calme',niv:0,
    cible:'mys',tBascule:t-99,dernNappe:t,nm:nm,na:na};
  P0.t=t;M.mys=couche(E,P0,nm);M.act=couche(E,P0,0);M.base=E.bus(P0,{rev:0.1,g:nm});
  /* le bourdon : deux dents de scie sur le ré le plus grave, une à l'octave ; un filtre qui s'ouvre et se referme en quarante secondes ;
     un peu de saturation pour qu'on l'entende même sur un petit haut-parleur */
  const lp=c.createBiquadFilter(),sat=E.sature(2.2),v=c.createGain(),lfo=c.createOscillator(),lg=c.createGain(),src=[];
  lp.type='lowpass';lp.Q.value=1.1;lp.frequency.value=300;lfo.frequency.value=0.026;lg.gain.value=130;lfo.connect(lg);lg.connect(lp.frequency);
  [[36.71,-6,0.5],[36.71,7,0.5],[73.42,0,0.32],[55,3,0.14]].forEach(q=>{const o=c.createOscillator(),g=c.createGain();o.type='sawtooth';o.frequency.value=q[0];o.detune.value=q[1];g.gain.value=q[2];o.connect(g);g.connect(lp);o.start(t);src.push(o);});
  v.gain.setValueAtTime(0,t);v.gain.linearRampToValueAtTime(0.085,t+5);lp.connect(sat);sat.connect(v);v.connect(M.base);lfo.start(t);src.push(lfo);
  /* (le combat) deux cordes graves à un demi-ton l'une de l'autre, qui tremblent sans arrêt */
  const dl=c.createBiquadFilter(),dt=c.createGain(),df=c.createOscillator(),dg=c.createGain(),dv=c.createGain();
  dl.type='lowpass';dl.frequency.value=620;dt.gain.value=0.6;df.frequency.value=7;dg.gain.value=0.4;dv.gain.value=0.2;df.connect(dg);dg.connect(dt.gain);
  [146.83,155.56,73.42].forEach((f,i)=>{const o=c.createOscillator(),g=c.createGain();o.type='sawtooth';o.frequency.value=f;o.detune.value=i*4-4;g.gain.value=i===2?0.5:0.35;o.connect(g);g.connect(dl);o.start(t);src.push(o);});
  dl.connect(dt);dt.connect(dv);dv.connect(M.act.loin);df.start(t);src.push(df);
  M.bourdon=v;M.src=src;
  return M;
}
/* passer d'un visage à l'autre ('mys' ou 'act') */
function musBascule(M,cible,t){
  if(cible===M.cible)return;
  const vers=cible==='act';
  fondu(M.act,vers?M.na:0,t,vers?0.3:1.1);fondu(M.mys,vers?0:M.nm,t,vers?0.4:1.1);
  M.base.gain.cancelScheduledValues(t);M.base.gain.setTargetAtTime(M.nm*(vers?0.35:1),t,vers?0.4:1.1);   /* (le bourdon s'efface sous le combat : c'est le rythme qu'on doit entendre) */
  if(vers&&t-M.tBascule>4){                                  /* le combat revient : un roulement de tambour grave qui enfle */
    for(let k=0;k<7;k++)M.E.tambour(t+k*0.085,{f:k%2?92:78,d:0.3,g:0.06+k*0.03},M.act.pres);
    M.E.ton(t,{type:'sawtooth',f:m2f(38),env:[[0,0],[0.6,1],[1.0,0]],g:0.06,sat:1.3,lp:500},M.act.loin);
  }
  if(!vers&&t-M.dernNappe>12)M.tAcc=Math.min(M.tAcc,t+0.1);  /* le mystère revient : une nappe tout de suite */
  M.cible=cible;M.tBascule=t;
}
/* tout ce qui doit sonner d'ici « jusqua » (en secondes de l'horloge du son) ; maintenant : pour ne fabriquer que le visage qu'on entend */
function musPlanifier(M,jusqua,maintenant){
  const E=M.E,niv=M.niv,col=M.mode==='colosse',L=M.mys,K=M.act;
  const mysOn=M.cible==='mys'||maintenant-M.tBascule<4,actOn=M.cible==='act'||maintenant-M.tBascule<2.5;
  /* ---- le mystère ---- */
  while(M.tAcc<jusqua){
    if(mysOn){const s=SUITES[col?3:niv],a=ACC[s[M.n%s.length]].map(m2f),d=24;
      E.nappe(M.tAcc,a,d,{lp1:260,lp:620+niv*130,a:6,r:7,g:0.04},L.loin);
      E.ton(M.tAcc,{f:a[0]*0.5,env:[[0,0],[4,1],[d-5,0.8],[d,0]],g:0.07,sat:2,lp:240},L.pres);M.dernNappe=M.tAcc;}
    M.n++;M.tAcc+=18;
  }
  while(M.tCoeur<jusqua){
    if(mysOn&&(niv>=1||col)){const g=col?0.3:0.15+niv*0.035;E.tambour(M.tCoeur,{f:78,d:0.5,g:g},L.pres);E.tambour(M.tCoeur+0.3,{f:66,d:0.55,g:g*0.75},L.pres);}
    M.tCoeur+=col?1.15:niv>=3?1.9:niv===2?2.3:2.8;
  }
  while(M.tVoix<jusqua){
    if(mysOn&&(niv>=2||col)){const n=niv>=3&&Math.random()<0.5?[m2f(62),m2f(63)]:[m2f(Math.random()<0.5?62:57)];E.choeur(M.tVoix,n,9,{voyelle:'ou',a:3.5,r:4,g:0.011},L.fond);}
    M.tVoix+=rnd(20,34);
  }
  while(M.tLoin<jusqua){if(mysOn)E.cloche(M.tLoin,m2f([38,45,50,41][Math.floor(Math.random()*4)]),{d:5.5,rapport:2.76,indice:1.8,g:0.03,a:0.01},L.fond);M.tLoin+=rnd(13,28)-niv*2;}
  while(M.tVent<jusqua){if(mysOn)E.bruit(M.tVent,{coul:'brun',bp:170,bq:1,env:[[0,0],[3,1],[7,0]],g:0.16},L.fond);M.tVent+=rnd(22,38);}
  /* ---- le combat (version 13 : Romain, 15 h 15 : « je veux vraiment une musique d'action qui soit entraînante, qui soit prenante »).
     La mesure tourne toujours ; on ne la remplit que quand on l'entend. 138 à la minute (le colosse : 144). Quatre accords qui
     tournent (ré mineur, si bémol, sol mineur, la majeur : le la appelle le retour au ré, c'est ce qui entraîne) ; une basse qui
     galope (da-da-DOUM) ; des tambours graves façon tambours de guerre et une caisse mate sur 2 et 4 ; l'accroche : des cordes
     courtes qui tournent sur l'accord ; un cuivre qui gronde sur chaque accord ; toutes les huit mesures, un roulement et un
     frottement qui monte. Rien d'aigu (tout sous 1 500 Hz). ---- */
  const tps=60/(col?144:138),q=tps/4,fort=col?1:[0.72,0.82,0.92,1][niv];
  const GR=[{b:38,r:[62,65,69]},{b:34,r:[62,65,70]},{b:31,r:[62,67,70]},{b:33,r:[61,64,69]}];
  const GALOP=[1,0,1,1,1,0,1,1,1,0,1,1,1,0,1,1],RIFF=[0,0,1,0,2,0,1,0];
  while(M.tMes<jusqua){
    const t=M.tMes,c=GR[M.mes%4];
    if(actOn){
      /* la basse qui galope */
      for(let i=0;i<16;i++)if(GALOP[i])E.ton(t+i*q,{type:'sawtooth',f:m2f(c.b+12+(i%8===0?-12:0)),env:[[0,0],[0.004,1],[0.09,0]],g:0.075*(i%4===0?1:0.62)*fort,lp:560,lq:1.5,sat:1.8},K.pres);
      /* les tambours de guerre : 1, le « et » de 2, 3 ; la caisse mate sur 2 et 4 (en fantôme avant le 4) */
      [[0,0.34],[1.5,0.24],[2,0.3],[2.75,0.16]].forEach(b=>E.tambour(t+b[0]*tps,{f:70,d:0.4,g:b[1]*fort},K.pres));
      [[1,1],[3,1],[3.75,0.35]].forEach(b=>{E.tambour(t+b[0]*tps,{f:170,d:0.14,g:0.15*b[1]*fort},K.pres);E.bruit(t+b[0]*tps,{bp:1400,bq:0.9,env:E.perc(0.001,0.1),g:0.12*b[1]*fort},K.pres);});
      /* l'accroche : des cordes courtes qui tournent sur l'accord (deux voix, à l'octave) */
      for(let i=0;i<8;i++){const n=c.r[RIFF[i]],u=t+i*tps/2,e=[[0,0],[0.008,1],[0.14,0]],g=0.034*(i%2?0.7:1)*(0.75+0.25*fort);
        E.ton(u,{type:'sawtooth',f:m2f(n),det:-5,env:e,g:g,lp:1400,lq:1.2},K.loin);E.ton(u,{type:'sawtooth',f:m2f(n-12),det:5,env:e,g:g*0.7,lp:900},K.loin);}
      /* le cuivre qui gronde sur chaque accord */
      {const d=tps*3.6,env=[[0,0],[0.05,1],[d*0.6,0.7],[d,0]];[c.b+12,c.b+19,c.b+24].forEach((m,k)=>E.ton(t,{type:'sawtooth',f:m2f(m),det:k*6-6,env:env,g:0.04*(0.6+0.4*fort),sat:1.3,filtres:[{type:'lowpass',f:420,pts:[[0.08,1300],[d,450]],q:1.3}]},K.loin));}
      /* toutes les huit mesures : un roulement de toms qui descend, et un frottement qui monte pendant la dernière mesure */
      if(M.mes%8===7){for(let k=0;k<8;k++)E.tambour(t+(2+k/4)*tps,{f:[130,122,114,106,98,90,84,78][k],d:0.2,g:(0.1+k*0.025)*fort},K.pres);
        E.ton(t,{type:'sawtooth',f:m2f(57),f2:m2f(62),gl:tps*4,det:4,env:[[0,0],[tps*3.8,1],[tps*4,0]],g:0.03*fort,lp:900},K.loin);}
    }
    M.mes++;M.tMes+=4*tps;
  }
}
/* en direct : démarrer, suivre le jeu (la vague, le colosse, dans l'ombre ou à découvert), arrêter */
function musique(on){
  if(!A)return;
  if(!on){
    if(!MUS)return;const M=MUS,t=AC.currentTime;MUS=null;clearInterval(musInt);musInt=null;
    /* (chaque musique a sa prise à elle : on la baisse, puis on la débranche ; la suivante peut démarrer tout de suite) */
    M.prise.couper(t,0.5);
    setTimeout(()=>{M.src.forEach(o=>{try{o.stop();}catch(e){}});M.prise.lacher();},3000);return;
  }
  if(MUS)return;
  const t=AC.currentTime,pm=prise(A,t,'mus',EQ_MUS);
  MUS=musDebut(A,pm,t+0.05,NIV.musique||1,NIV.musAction||1);MUS.prise=pm.base;
  const tic=()=>{
    if(!MUS||AC.state!=='running')return;
    const M=MUS,now=AC.currentTime,jeu=etatJeu==='jeu'&&phase==='vague';
    M.mode=jeu&&G.some(g=>g.type==='colosse'&&vivant(g))?'colosse':'calme';
    M.niv=musNiveau();
    /* (version 12, Romain, 15 h 05) le combat seulement quand on s'est fait repérer par un groupe en colère (ou le colosse enragé) et
       qu'on n'est pas dans l'ombre ; une embuscade réussie ne change rien. Il tient cinq secondes après le dernier regard ; l'ombre le
       coupe tout de suite (le mystère revient doucement). */
    /* (version 13 : Romain a essayé, les chiens lui couraient après et la musique ne changeait pas : ils n'étaient pas « en colère ».
       Maintenant : dès qu'un golem le voit, hors de l'ombre.) */
    if(jeu&&!P.ombre&&(nVoient>0||G.some(g=>g.type==='colosse'&&g.enrage&&vivant(g))))M.tChaud=now;
    if(!enPause)musBascule(M,jeu&&!P.ombre&&now-(M.tChaud||-99)<5?'act':'mys',now);
    musPlanifier(M,now+1.2,now);
  };
  musInt=setInterval(tic,300);tic();
}

/* pour les essais (tests/sons.py) : fabriquer un son ou une minute de musique hors ligne, et rendre les échantillons */
window.__son={joues:JOUES,erreurs:ERR,etat:()=>({ac:AC?AC.state:null,musique:MUS?{mode:MUS.mode,niv:MUS.niv,visage:MUS.cible}:null,assourdi:ASSOURDI,boule:!!BOULE}),noms:()=>Object.keys(S).concat(['boule']),sorte:sorteDe,
  rendre(nom,dur,type,sansNiv){
    const sr=32000,c=new OfflineAudioContext(1,Math.ceil(sr*dur),sr),A0=A,P0=PR;
    A=window.Moteur(c,{volume:VOL,horsLigne:true});PR=prise(A,0,null,EQ_SONS);
    try{
      const gn=typeof sansNiv==='number'?sansNiv:sansNiv?1:(NIV[nom]||1);     /* (un nombre : ce niveau-là, pour le réglage en plusieurs passes) */
      if(nom==='boule'){const s1=c.createBufferSource(),s2=c.createBufferSource(),lp=c.createBiquadFilter(),bp=c.createBiquadFilter(),g1=c.createGain(),g2=c.createGain(),v=c.createGain();
        s1.buffer=A.brun;s1.loop=true;s2.buffer=A.rose;s2.loop=true;s2.playbackRate.value=0.6;lp.type='lowpass';lp.frequency.value=BOULE_R.lp;bp.type='bandpass';bp.frequency.value=BOULE_R.bp;bp.Q.value=1.4;
        g1.gain.value=BOULE_R.g1;g2.gain.value=BOULE_R.g2;v.gain.value=gn;s1.connect(lp);lp.connect(g1);g1.connect(v);s2.connect(bp);bp.connect(g2);g2.connect(v);v.connect(PR.sec);s1.start();s2.start();}
      else{const so=SORTE[sorteDe(nom)];S[nom](0.05,A.bus(PR,{g:gn,rev:so.rev,grotte:so.gr}),type?{type:type}:null);}
    }finally{A=A0;PR=P0;}
    return c.startRendering().then(b=>Array.from(b.getChannelData(0)));
  },
  /* mode : 'calme' (le mystère), 'action' (le combat), 'colosse' (le combat du colosse), 'colosseOmbre' (le colosse, dans l'ombre) */
  musique(mode,niv,dur,sansNiv){
    const sr=32000,c=new OfflineAudioContext(1,Math.ceil(sr*dur),sr),E=window.Moteur(c,{volume:VOL,horsLigne:true}),
      M=musDebut(E,prise(E,0,'mus',EQ_MUS),0.05,sansNiv?1:(NIV.musique||1),sansNiv?1:(NIV.musAction||1));
    const act=mode==='action'||mode==='colosse';M.mode=mode.slice(0,7)==='colosse'?'colosse':'calme';M.niv=niv;
    if(act){fondu(M.act,M.na,0,0.01);fondu(M.mys,0,0,0.01);M.base.gain.setTargetAtTime(M.nm*0.35,0,0.01);M.cible='act';}
    musPlanifier(M,dur,-99);
    return c.startRendering().then(b=>Array.from(b.getChannelData(0)));
  }};
return {initSon,son,sonColere,majSon,musique,couperSon};
})();
const initSon=SON.initSon,son=SON.son,sonColere=SON.sonColere,majSon=SON.majSon,musique=SON.musique,couperSon=SON.couperSon;
