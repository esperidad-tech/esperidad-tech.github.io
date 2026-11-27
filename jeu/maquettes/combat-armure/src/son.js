/* ======================= le son et la musique =======================
   Fabriqué par le moteur de l'Atelier des sons du jeu (jeu/donjon/essai/sons/moteur.js : window.Moteur), sans aucun fichier,
   comme le combat du Pisteur (combat-pisteur/src/son.js), et dans les mêmes goûts de Romain (26 novembre) : pas de gros sons ni de
   sons trop aigus ; « un peu sourds, un peu métalliques » ; un peu de résonance (une grande salle) ; pas un brouillard de bruit ;
   une musique d'ambiance, avec beaucoup de basses, qui se resserre quand ça chauffe.
   Chaque sort a son son, chaque coup du boss a son annonce : on doit pouvoir jouer à l'oreille (le feu qui couve, le plafond qui craque). */
let sonOn=true;
try{if(localStorage.getItem('armure_son')==='0')sonOn=false;}catch(e){}
const SON=(()=>{
  let AC=null,A=null,PR=null,PM=null;const VOL=0.8,ERR=[],JOUES={};
  const EQ={hp:60,shf:180,sh:-9,pkf:650,pk:3,lp:5000},EQM={hp:40,shf:110,sh:-4,pkf:420,pk:2,lp:3200};
  function prise(E,t,vers,o){
    const B=E.prise(t,1,vers),c=E.ctx,Q={t,base:B};
    for(const k of ['sec','cave','grotte']){const hp=c.createBiquadFilter(),sh=c.createBiquadFilter(),pk=c.createBiquadFilter(),lp=c.createBiquadFilter();
      hp.type='highpass';hp.frequency.value=o.hp;sh.type='lowshelf';sh.frequency.value=o.shf;sh.gain.value=o.sh;pk.type='peaking';pk.frequency.value=o.pkf;pk.Q.value=0.6;pk.gain.value=o.pk;lp.type='lowpass';lp.frequency.value=o.lp;
      hp.connect(sh);sh.connect(pk);pk.connect(lp);lp.connect(B[k]);Q[k]=hp;}
    return Q;
  }
  function init(){
    if(AC){if(AC.state==='suspended')AC.resume();return;}
    if(!window.Moteur)return;
    try{AC=new (window.AudioContext||window.webkitAudioContext)();A=window.Moteur(AC,{volume:sonOn?VOL:0});PR=prise(A,0,null,EQ);PM=prise(A,0,'mus',EQM);}catch(e){AC=null;A=null;}
  }
  function couper(){if(A)A.volume.gain.setTargetAtTime(sonOn?VOL:0,AC.currentTime,0.05);}
  const m2f=m=>440*Math.pow(2,(m-69)/12);
  const br=(t,o,d)=>A.bruit(t,o,d),tn=(t,o,d)=>A.ton(t,o,d);
  const coup=(t,f,dur,g,d,o)=>A.choc(t,Object.assign({f:f*1.7,f2:f*0.75,d:dur,g:g*0.8,corps:2.2,corpsF:520,blp:1300},o||{}),d);
  const metal=(t,f,dur,g,d,idx)=>A.cloche(t,f,{d:dur,rapport:2.76,indice:idx==null?1.5:idx,g},d);
  const voix=(t,o,d)=>A.cri(t,{f:o.f||90,forme:o.forme||'effort',d:o.d||0.6,rauque:o.r==null?0.7:o.r,grain:0.7,hp:o.hp||70,lp:o.lp||800,souffle:0.3,g:o.g||0.3,a:o.a||0.05},d);
  function tampon(nom,fn){const c=A._tp||(A._tp={});return c[nom]||(c[nom]=fn());}
  const crepit=(t,dur,dens,g,d,o)=>A.joue(t,tampon('cr'+dur+dens,()=>A.crepitement(dur,dens,{forme:u=>Math.sin(u*Math.PI)})),Object.assign({g,filtres:[{type:'highpass',f:400},{type:'lowpass',f:4200}],sat:3},o||{}),d);
  const grondement=(t,dur,g,d,f)=>{br(t,{coul:'brun',lp:f||220,env:[[0,0],[dur*0.3,1],[dur*0.8,0.8],[dur,0]],g},d);tn(t,{type:'sawtooth',f:38,env:[[0,0],[dur*0.3,1],[dur,0]],g:g*0.4,trem:[17,0.6],lp:160},d);};
  const souffle=(t,dur,f1,f2,g,d)=>br(t,{coul:'rose',bp:f1,bp2:f2,bpt:dur,bq:1.1,env:[[0,0],[dur*0.4,1],[dur,0]],g},d);
  const S={};
  /* ===== les sorts ===== */
  S.chargeGlace=(t,d)=>{souffle(t,1.4,900,2400,0.06,d);A.cloche(t+0.05,m2f(81),{d:1.4,rapport:3.01,indice:0.5,g:0.02},d);};
  S.chargeFeu=(t,d)=>{br(t,{coul:'brun',lp:500,env:[[0,0],[2.6,1],[3,0]],g:0.16},d);crepit(t+0.4,2.6,40,0.18,d);tn(t,{type:'sawtooth',f:55,f2:80,gl:3,env:[[0,0],[2.7,1],[3,0]],g:0.05,lp:300,trem:[9,0.4]},d);};
  S.chargeSoin=(t,d)=>{A.nappe(t,[m2f(60),m2f(64),m2f(67)],2,{g:0.025,lp:1500,a:0.4,r:0.6},d);};
  S.glace=(t,d,role)=>{
    if(role==='barde'){A.harpe(t,m2f(76),{g:0.22,t60:0.9,eclat:0.6},d);A.harpe(t+0.07,m2f(83),{g:0.16,t60:0.8},d);}
    else if(role==='alchimiste'){A.cloche(t,m2f(84),{d:0.3,rapport:2.4,indice:0.4,g:0.05},d);souffle(t,0.25,700,1800,0.09,d);}
    else{souffle(t,0.22,1200,3000,0.1,d);A.cloche(t,m2f(88),{d:0.5,rapport:3.01,indice:0.35,g:0.03},d);}};
  S.feu=(t,d,role)=>{
    if(role==='barde'){[60,64,67,72].forEach((m,i)=>A.harpe(t+i*0.03,m2f(m-12),{g:0.2,t60:1.4,eclat:0.7},d));br(t+0.08,{coul:'rose',bp:500,bp2:1400,bpt:0.4,bq:1,env:[[0,0],[0.15,1],[0.5,0]],g:0.12},d);}
    else if(role==='alchimiste'){souffle(t,0.35,400,1100,0.14,d);crepit(t,0.6,30,0.12,d);}
    else{souffle(t,0.45,300,1000,0.16,d);A.archet(t,m2f(45),0.6,{g:0.03,lp:900,a:0.05,r:0.4},d);}};
  S.toucheGlace=(t,d,role)=>{coup(t,240,0.06,0.18,d,{bruit:0.4});if(role==='alchimiste')A.modes(t,2200,[[1,1,0.15,3],[1.5,0.6,0.1],[2.3,0.4,0.08]],{g:0.05},d);else metal(t,520,0.4,0.05,d,1);};
  S.toucheFeu=(t,d,role)=>{coup(t,110,0.22,0.5,d,{sat:3});br(t,{coul:'brun',lp:900,env:A.perc(0.005,0.6),g:0.3},d);crepit(t+0.03,0.5,60,0.14,d);if(role==='alchimiste')A.modes(t,1800,[[1,1,0.1,3],[1.7,0.6,0.08],[2.4,0.5,0.06]],{g:0.07},d);metal(t,90,0.9,0.05,d,1.2);};
  S.soin=(t,d)=>{A.cloche(t,m2f(72),{d:1.2,rapport:2,indice:0.5,g:0.05},d);A.cloche(t+0.1,m2f(79),{d:1.1,rapport:2,indice:0.4,g:0.04},d);};
  S.coupe=(t,d)=>{br(t,{coul:'rose',bp:900,bp2:300,bpt:0.25,bq:1.3,env:A.perc(0.005,0.3),g:0.1},d);tn(t,{f:300,f2:150,gl:0.25,env:A.perc(0.01,0.25),g:0.05,lp:900},d);};
  S.saut=(t,d)=>{br(t,{coul:'rose',bp:420,bp2:880,bpt:0.16,bq:1,env:[[0,0],[0.03,1],[0.22,0]],g:0.17},d);};
  S.refus=(t,d)=>{coup(t,115,0.07,0.14,d,{sat:1.5,bruit:0.3,corps:0.6});};
  S.surPierre=(t,d)=>{coup(t,170,0.1,0.25,d);br(t,{coul:'rose',lp:2000,env:A.perc(0.002,0.15),g:0.15},d);};
  S.surBulle=(t,d)=>{A.cloche(t,m2f(62),{d:0.8,rapport:1.5,indice:0.8,g:0.04},d);tn(t,{f:180,f2:120,gl:0.3,env:A.perc(0.01,0.4),g:0.05,lp:700},d);};
  /* ===== le héros ===== */
  S.aie=(t,d)=>{coup(t,130,0.1,0.32,d);br(t,{coul:'brun',lp:600,env:A.perc(0.005,0.25),g:0.18},d);};
  S.mort=(t,d)=>{coup(t,90,0.3,0.45,d,{sat:3});A.archet(t+0.1,m2f(38),1.6,{g:0.03,lp:600,a:0.3,r:0.8},d);};
  S.releve=(t,d)=>{A.cloche(t,m2f(67),{d:1.4,rapport:2,indice:0.6,g:0.05},d);A.cloche(t+0.12,m2f(74),{d:1.3,rapport:2,indice:0.5,g:0.04},d);};
  /* ===== les coups du boss ===== */
  S.plafond=(t,d)=>{voix(t,{f:72,forme:'effort',d:0.7,g:0.22},d);coup(t+0.78,70,0.4,0.5,d,{sat:3});grondement(t+0.8,2.2,0.28,d,180);crepit(t+0.9,1.4,25,0.08,d,{filtres:[{type:'lowpass',f:1600}]});};
  S.chute=(t,d)=>{coup(t,80,0.32,0.55,d,{sat:3.5});br(t+0.02,{coul:'brun',lp:500,env:A.perc(0.01,0.7),g:0.3},d);A.joue(t+0.05,tampon('gravats',()=>A.crepitement(0.5,50,{forme:u=>Math.pow(1-u,2)})),{g:0.25,filtres:[{type:'lowpass',f:2000}]},d);};
  S.crepite=(t,d)=>{coup(t,100,0.2,0.4,d);crepit(t+0.2,2.8,22,0.08,d);crepit(t+1.6,1.4,70,0.12,d);tn(t+0.2,{type:'sawtooth',f:60,f2:95,gl:2.8,env:[[0,0],[2.6,1],[2.8,0]],g:0.05,lp:500,trem:[23,0.5]},d);};
  S.crepiteBoum=(t,d)=>{coup(t,70,0.45,0.6,d,{sat:4});br(t,{coul:'rose',bp:1500,bp2:500,bpt:0.4,bq:0.8,env:A.perc(0.003,0.5),g:0.25},d);grondement(t,1.2,0.22,d);};
  S.vague=(t,d)=>{voix(t,{f:62,forme:'effort',d:1.6,g:0.26,lp:600},d);br(t,{coul:'brun',lp:300,env:[[0,0],[1.9,1],[2,0]],g:0.25},d);crepit(t+0.3,1.7,35,0.08,d);};
  S.vagueFeu=(t,d)=>{br(t,{coul:'rose',bp:300,bp2:900,bpt:1.2,bq:0.7,env:[[0,0],[0.2,1],[1.6,0.7],[4.5,0]],g:0.32},d);crepit(t,4.4,90,0.2,d);grondement(t,2,0.16,d,300);};
  S.portes=(t,d)=>{A.joue(t,tampon('porte',()=>A.grincement(0.9,{f:95})),{g:0.18,lp:1400},d);coup(t+0.85,140,0.12,0.25,d);};
  S.repare=(t,d)=>{metal(t,260,0.4,0.06,d,1.4);coup(t,180,0.06,0.18,d);metal(t+0.22,262,0.35,0.05,d,1.4);};
  S.repCasse=(t,d)=>{coup(t,150,0.18,0.45,d,{sat:3});A.modes(t,900,[[1,1,0.2,3],[1.6,0.7,0.15],[2.3,0.5,0.1]],{g:0.05},d);br(t,{coul:'rose',lp:2400,env:A.perc(0.002,0.3),g:0.2},d);};
  S.mainGivre=(t,d)=>{souffle(t,2.5,400,1400,0.1,d);A.cloche(t+0.3,m2f(57),{d:2.5,rapport:3.01,indice:0.6,g:0.03},d);voix(t,{f:80,forme:'effort',d:0.5,g:0.14},d);};
  S.mainBraise=(t,d)=>{crepit(t,2.5,45,0.12,d);tn(t,{type:'sawtooth',f:48,env:[[0,0],[0.6,1],[2.5,0]],g:0.06,lp:260,trem:[11,0.5]},d);voix(t,{f:80,forme:'effort',d:0.5,g:0.14},d);};
  S.mainBoum=(t,d)=>{coup(t,75,0.4,0.55,d,{sat:3});br(t,{coul:'rose',bp:1800,bp2:700,bpt:0.3,bq:1,env:A.perc(0.002,0.4),g:0.22},d);};
  S.contre=(t,d)=>{coup(t,120,0.2,0.4,d);souffle(t,0.5,1400,400,0.14,d);voix(t+0.05,{f:110,forme:'aie',d:0.3,g:0.16},d);};
  S.orbe=(t,d)=>{tn(t,{f:m2f(55),f2:m2f(43),gl:0.5,env:A.perc(0.02,0.6),g:0.06,lp:900},d);A.cloche(t+0.4,m2f(67),{d:0.8,rapport:2.4,indice:0.6,g:0.03},d);};
  S.orbePrise=(t,d)=>{A.cloche(t,m2f(69),{d:0.8,rapport:2,indice:0.5,g:0.05},d);};
  S.orbeBonne=(t,d)=>{[69,73,76,81].forEach((m,i)=>A.cloche(t+i*0.07,m2f(m),{d:1.4,rapport:2,indice:0.6,g:0.04},d));};
  S.orbeExplose=(t,d)=>{coup(t,95,0.3,0.45,d,{sat:3});br(t,{coul:'rose',bp:1200,bp2:400,bpt:0.3,bq:1,env:A.perc(0.002,0.35),g:0.18},d);};
  S.doigts=(t,d)=>{tn(t,{type:'sawtooth',f:70,f2:140,gl:2,env:[[0,0],[1.9,1],[2,0]],g:0.05,lp:700,trem:[30,0.6]},d);crepit(t+0.6,1.4,30,0.08,d);};
  S.doigtsBoum=(t,d)=>{coup(t,85,0.35,0.5,d,{sat:3});br(t,{coul:'rose',bp:2000,bp2:600,bpt:0.3,bq:0.8,env:A.perc(0.002,0.35),g:0.2},d);};
  S.rayon=(t,d)=>{A.archet(t,m2f(50),3,{g:0.025,lp:900,a:1.5,r:0.6},d);A.cloche(t+2.9,m2f(62),{d:2,rapport:1.5,indice:0.8,g:0.035},d);};
  S.rayonBrule=(t,d)=>{crepit(t,0.6,50,0.08,d);};
  S.coque=(t,d)=>{tn(t,{f:m2f(43),f2:m2f(55),gl:8,env:[[0,0],[1,1],[7.5,1],[8,0]],g:0.05,lp:600,trem:[4,0.4]},d);};
  S.coqueCassee=(t,d)=>{A.modes(t,1300,[[1,1,0.4,3],[1.5,0.7,0.3],[2.2,0.5,0.25],[3.1,0.3,0.2]],{g:0.06},d);coup(t,140,0.15,0.3,d);};
  S.coqueExplose=(t,d)=>{coup(t,60,0.6,0.6,d,{sat:4});grondement(t,1.5,0.25,d);};
  S.danse=(t,d)=>{voix(t,{f:66,forme:'effort',d:1.2,g:0.22,lp:600},d);grondement(t,1.5,0.18,d);};
  S.anneau=(t,d)=>{coup(t,70,0.3,0.42,d,{sat:3});br(t,{coul:'rose',bp:1100,bp2:400,bpt:0.3,bq:1,env:A.perc(0.002,0.3),g:0.14},d);};
  S.crevasse=(t,d)=>{grondement(t,1.4,0.2,d,250);crepit(t,1.2,30,0.1,d,{filtres:[{type:'lowpass',f:1500}]});};
  S.bulle=(t,d)=>{A.nappe(t,[m2f(50),m2f(57),m2f(62),m2f(66)],3,{g:0.05,lp:1400,a:0.4,r:1.5},d);metal(t,m2f(38),3,0.06,d,0.8);};
  S.cri=(t,d)=>{A.cloche(t,m2f(64),{d:1,rapport:2,indice:0.5,g:0.04},d);A.cloche(t+0.12,m2f(71),{d:1,rapport:2,indice:0.5,g:0.04},d);};
  S.codeFaux=(t,d)=>{tn(t,{f:220,f2:150,gl:0.3,env:A.perc(0.01,0.35),g:0.08,lp:900},d);coup(t,110,0.08,0.18,d);};
  S.tiers=(t,d)=>{coup(t,55,0.7,0.6,d,{sat:4});metal(t,m2f(33),3,0.08,d,1.6);grondement(t,2.2,0.3,d);A.modes(t+0.1,700,[[1,1,0.6,3],[1.6,0.7,0.5],[2.4,0.5,0.4]],{g:0.06},d);};
  S.fin=(t,d)=>{S.tiers(t,d);[57,60,64,69,72].forEach((m,i)=>A.cloche(t+1.2+i*0.18,m2f(m),{d:2.5,rapport:2,indice:0.6,g:0.05},d));};
  /* qui sonne pour quel événement */
  const vus=new WeakSet();
  function evt(e,St){
    if(!A||!sonOn||vus.has(e))return;vus.add(e);const role=HS.role,q=e.quoi;
    switch(e.type){
      case 'lance':jouer(q==='glace'?'chargeGlace':q==='feu'?'chargeFeu':'chargeSoin');break;
      case 'tir':jouer(q,role);break;
      case 'touche':jouer(q==='feu'?'toucheFeu':'toucheGlace',role);break;
      case 'repCasse':jouer('repCasse');break;case 'repEcrase':jouer('repCasse');break;
      case 'soigne':jouer('soin');break;case 'sortCoupe':jouer('coupe');break;case 'saut':jouer('saut');break;
      case 'surColonne':jouer('surPierre');break;case 'surBulle':case 'surCoque':jouer('surBulle');break;
      case 'aie':jouer('aie');break;case 'mort':jouer('mort');break;case 'releve':jouer('releve');break;
      case 'attaque':
        if(q==='colonnes')jouer('plafond');else if(q==='crepite')jouer('crepite');else if(q==='vague')jouer('vague');else if(q==='reparateurs')jouer('portes');
        else if(q==='main')jouer(St.main&&St.main.type==='givre'?'mainGivre':'mainBraise');else if(q==='orbe')jouer('orbe');else if(q==='doigts')jouer('doigts');
        else if(q==='rayon')jouer('rayon');else if(q==='coque')jouer('coque');else if(q==='danse')jouer('danse');break;
      case 'colonneTombe':jouer('chute');break;
      case 'crepiteBoum':jouer('crepiteBoum');break;
      case 'repare':jouer('repare');break;
      case 'contre':jouer('contre');break;
      case 'orbePrise':jouer('orbePrise');break;case 'orbeBonne':jouer('orbeBonne');break;case 'orbeExplose':jouer('orbeExplose');break;
      case 'doigtsBoum':jouer('doigtsBoum');break;case 'anneauxBoum':jouer('anneau');break;
      case 'coqueCassee':jouer('coqueCassee');break;case 'coqueExplose':jouer('coqueExplose');break;
      case 'fente':jouer('crevasse');break;
      case 'symbole':jouer('bulle');break;case 'cri':jouer('cri');break;case 'codeFaux':jouer('codeFaux');break;
      case 'codeBon':case 'tiers':jouer('tiers');break;case 'explose':jouer('fin');break;
    }
    if(e.type==='aie'&&(e.source==='givre'||e.source==='braise'))jouer('mainBoum');
  }
  const dernier={};
  function jouer(n,arg){
    if(!A||!sonOn)return;const f=S[n];if(!f)return;const now=AC.currentTime;
    if(dernier[n]&&now-dernier[n]<0.06)return;dernier[n]=now;JOUES[n]=(JOUES[n]||0)+1;
    try{PR.t=now;f(now+0.01,A.bus(PR,{g:1,rev:0.35,grotte:0.12}),arg);}catch(e){if(ERR.length<20)ERR.push(n+' : '+e.message);}
  }
  /* ===== la musique : une nappe grave et un battement lent ; plus serrée à chaque tiers, sous la bulle, et pendant la danse ===== */
  let musT=0,pas=0,actif=false;
  function musique(St){
    if(!A||!sonOn||!St){return;}
    const now=AC.currentTime;if(!actif){actif=true;musT=now+0.2;pas=0;}
    const ti=St.tiers,tendu=St.phase==='bulle'||St.danse||St.vague?1:0,bpm=[0,64,70,78][ti]+(tendu?8:0),dt=60/bpm/2;
    while(musT<now+0.4){
      const d=A.bus(PM,{g:0.55,rev:0.3});PM.t=musT;
      try{
        const temps=pas%8,mesure=Math.floor(pas/8)%4,base=[38,36,41,33][mesure]-(ti===3?1:0);
        if(temps===0||temps===5&&ti>1){A.choc(musT,{f:62,f2:34,d:0.5,g:0.38,sat:2,corps:0.4,bruit:0.2},d);}
        if(temps===4&&ti>=2)A.choc(musT,{f:120,f2:60,d:0.12,g:0.12,corps:1.2,bruit:0.5},d);
        if(tendu&&temps%2===1)A.bruit(musT,{coul:'rose',bp:2600,bq:2,env:A.perc(0.002,0.04),g:0.035},d);
        if(pas%16===0)A.nappe(musT,[m2f(base),m2f(base+7),m2f(base+(ti===3?13:12))],dt*16,{g:0.045,lp:ti===3?900:600,lp1:250,a:1.2,r:1.5},d);
        if(pas%16===8&&ti>=2)A.archet(musT,m2f(base+24+(mesure%2?3:5)),dt*6,{g:0.012,lp:1000,a:0.6,r:0.8},d);
      }catch(e){if(ERR.length<20)ERR.push('musique : '+e.message);}
      musT+=dt;pas++;
    }
  }
  function arreter(){actif=false;}
  return {init,couper,evt,jouer,musique,arreter,ERR,JOUES,get pret(){return !!A;}};
})();
