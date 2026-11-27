/* ======================= le héros de devant : le Barde, le Sage ou l'Alchimiste, en volume =======================
   Le pantin du jeu (jeu/heros-vues), cuit une fois sous huit angles, comme le Pisteur de son combat (combat-pisteur/src/sprites.js) :
   la garde, la course, le sort qu'on prépare (trois images qui bouclent), le sort qui part, le soin, le saut, l'orbe portée au-dessus
   de la tête, le coup reçu, à terre. Le Barde garde son chapeau à plume et son luth (repris du combat du Barde, combat-barde/src/barde.js) :
   ils suivent ses os (HV.os). Pour chaque image, on retient aussi d'où partent les sorts (le luth, le cristal du bâton, la main qui lance). */
const HS=(()=>{
  const HV=window.HerosVues,q=new URLSearchParams(location.search);
  const DEF={barde:{role:'barde',sexe:'m',peau:'p2',cheveux:'chatain',yeux:'bleu',coiffure:'courts'},
             sage:{role:'sage',sexe:'f',peau:'p3',cheveux:'noir',yeux:'marron',coiffure:'tresse'},
             alchimiste:{role:'alchimiste',sexe:'m',peau:'p1',cheveux:'roux',yeux:'vert'}};
  const CADRE=[-80,-60,460,520],HAUT=60,ECH=HAUT/384,CW=CADRE[2]*ECH,CH=CADRE[3]*ECH,AX=(150-CADRE[0])*ECH,AY=(414-CADRE[1])*ECH;
  const CAPS=[0,45,90,135,180,-135,-90,-45],COLS=6;
  let role='barde',h=null;
  const combat=()=>Object.assign({},HV.pose(role==='sage'&&HV.POSES.sGarde?'sGarde':'combat'),{dague:0});
  const geste=(G,u)=>()=>HV.gesteImage(combat(),G,u*HV.dureeGeste(G));
  const avec=(f,o)=>()=>Object.assign({},f(),o);
  /* LE BARDE joue (combat-barde/src/barde.js, JOUE et le geste « gratte ») */
  const JOUE={mainD:[90,186,30],coudeD:[0.7,0.6,-0.3],poingD:0.8,mainG:[8,232,46],coudeG:[-1,0.1,-0.4],poingG:0.5,hoche:4};
  const SOIN={mainG:[-34,168,44],coudeG:[-0.8,0.3,-0.4],mainD:[34,168,44],coudeD:[0.8,0.3,-0.4],poingG:0,poingD:0,mdirG:[0.2,-1,0.3],mdirD:[-0.2,-1,0.3],hoche:-10,dos:[-4,0,0],sourcils:0.4,brasDessus:1};
  const PORTE={mainG:[-26,40,8],coudeG:[-1,0.2,-0.2],mainD:[26,40,8],coudeD:[1,0.2,-0.2],poingG:0,poingD:0,mdirG:[0.3,-1,0],mdirD:[-0.3,-1,0],hoche:-14,brasDessus:1,bas:[0,4,0]};
  function poses(){
    const P={garde:combat,saut:()=>Object.assign(HV.course(0.25*HV.COURSE.cycle),{leve:0}),sol:geste(HV.DONJON.chute,0.232),coup:geste(HV.DONJON.coup,0.36),
      porte:avec(combat,PORTE),soin:avec(combat,SOIN)};
    for(let i=0;i<8;i++)P['c'+i]=()=>HV.course(i/8*HV.COURSE.cycle);
    if(role==='barde'){
      P.i0=avec(combat,JOUE);P.i1=avec(combat,Object.assign({},JOUE,{mainG:[14,248,46],dos:[3,0,-7],hoche:9}));P.i2=avec(combat,Object.assign({},JOUE,{mainG:[-6,218,46],dos:[0,0,5]}));
      P.lance=avec(combat,Object.assign({},JOUE,{mainD:[86,140,26],mainG:[-40,184,40],dos:[-7,0,0],hoche:-9}));
    }else if(role==='sage'&&HV.SAGE){
      const G=HV.SAGE.sort,d=HV.dureeGeste(G),L=(HV.SAGE.LANCE||d*0.45)/d,Tt=(HV.SAGE.TIRE||d*0.6)/d;
      P.i0=geste(G,L*0.55);P.i1=geste(G,L*0.78);P.i2=geste(G,L*0.95);P.lance=geste(G,Math.min(0.98,Tt+0.04));
    }else if(role==='alchimiste'&&HV.ALCHI){
      const G=HV.ALCHI.preparer,L=HV.ALCHI.lancer;
      P.i0=geste(G,0.3);P.i1=geste(G,0.45);P.i2=geste(G,0.6);P.lance=geste(L,Math.min(0.95,(HV.ALCHI.LACHE||0.4)/HV.dureeGeste(L)+0.02));
    }else{P.i0=P.i1=P.i2=P.lance=combat;}
    return P;
  }
  let POSES={},ORDRE=[],IDX={};
  let res=1.5,cw=0,ch=0,planches=[],pret=[],bouts=[],file=[],fait=0,total=0,enCours=false,fini=null,ACC=null;

  /* ---------- les affaires du Barde (dessinées dans ses mesures à lui : combat-barde/src/barde.js) ---------- */
  const BOIS=['#d9a25c','#9a6430','#4f2e14'],OR='#f4d27c',NOIR='#0a0806';
  function accessoires(kk){
    const {lin,rad,ell,poly,trait,sprite}=Ou,A={};
    A.luthDos=sprite(190,80,52,40,kk,x=>{
      x.fillStyle=lin(x,30,-6,122,6,[BOIS[2],'#2c1a0c']);x.fillRect(30,-5.5,92,11);x.strokeStyle=NOIR;x.lineWidth=1.6;x.strokeRect(30,-5.5,92,11);
      poly(x,[[120,-7],[134,-13],[137,-3],[122,7]]);x.fillStyle=BOIS[2];x.fill();x.stroke();for(let i=0;i<3;i++){ell(x,124+i*4.5,-11+i*0.6,2,2,OR);ell(x,125+i*4.5,8-i*1.2,2,2,OR);}
      x.beginPath();x.moveTo(40,0);x.bezierCurveTo(30,-34,-44,-40,-46,0);x.bezierCurveTo(-44,40,30,34,40,0);x.closePath();x.fillStyle=rad(x,-14,-10,4,52,BOIS);x.fill();x.save();x.clip();
      x.strokeStyle='rgba(40,20,6,.55)';x.lineWidth=1.2;for(let i=-3;i<=3;i++){x.beginPath();x.moveTo(40,0);x.quadraticCurveTo(-4,i*13,-46,i*3);x.stroke();}x.restore();
      x.beginPath();x.moveTo(40,0);x.bezierCurveTo(30,-34,-44,-40,-46,0);x.bezierCurveTo(-44,40,30,34,40,0);x.closePath();x.strokeStyle=NOIR;x.lineWidth=1.8;x.stroke();
    });
    A.luthFace=sprite(190,80,52,40,kk,x=>{
      x.fillStyle=lin(x,30,-6,122,6,['#5a3a1c','#2c1a0c']);x.fillRect(30,-5.5,92,11);x.strokeStyle=NOIR;x.lineWidth=1.6;x.strokeRect(30,-5.5,92,11);
      x.strokeStyle='rgba(244,210,124,.7)';x.lineWidth=0.9;for(let i=0;i<7;i++){trait(x,[[44+i*11,-5],[44+i*11,5]]);x.stroke();}
      poly(x,[[120,-7],[134,-13],[137,-3],[122,7]]);x.fillStyle=BOIS[2];x.fill();x.strokeStyle=NOIR;x.lineWidth=1.6;x.stroke();for(let i=0;i<3;i++){ell(x,124+i*4.5,-11+i*0.6,2,2,OR);ell(x,125+i*4.5,8-i*1.2,2,2,OR);}
      x.beginPath();x.moveTo(40,0);x.bezierCurveTo(30,-34,-44,-40,-46,0);x.bezierCurveTo(-44,40,30,34,40,0);x.closePath();x.fillStyle=rad(x,-10,-8,4,54,['#fbe6b4','#e7bd76','#b9843e']);x.fill();x.strokeStyle=NOIR;x.lineWidth=1.8;x.stroke();
      x.strokeStyle=BOIS[1];x.lineWidth=2.4;x.beginPath();x.moveTo(38,0);x.bezierCurveTo(29,-31,-41,-37,-43,0);x.bezierCurveTo(-41,37,29,31,38,0);x.stroke();
      ell(x,2,0,10,10,'#2c1a0c');x.strokeStyle=OR;x.lineWidth=1.4;x.stroke();ell(x,2,0,6,6);x.stroke();x.fillStyle=BOIS[2];x.fillRect(-30,-9,4,18);
      x.strokeStyle='rgba(255,250,230,.85)';x.lineWidth=0.7;for(let i=-2;i<=2;i++){trait(x,[[-28,i*3.2],[122,i*1.8]]);x.stroke();}
    });
    A.chapeau=sprite(130,120,62,96,kk,x=>{
      x.save();x.rotate(-0.06);
      ell(x,0,2,45,11,'#3d1226');x.strokeStyle=NOIR;x.lineWidth=1.8;x.stroke();
      x.beginPath();x.moveTo(-29,0);x.bezierCurveTo(-33,-40,30,-44,29,-1);x.closePath();x.fillStyle=rad(x,-8,-24,3,44,['#b8325a','#7a2040','#431024']);x.fill();x.stroke();
      x.beginPath();x.moveTo(-29,0);x.quadraticCurveTo(0,9,29,-1);x.lineTo(28,-7);x.quadraticCurveTo(0,2,-29.5,-6);x.closePath();x.fillStyle=lin(x,0,-7,0,6,[OR,'#b88a2e']);x.fill();x.lineWidth=1.1;x.stroke();
      ell(x,0,3,45,11);x.fillStyle=lin(x,-45,0,45,0,['#5a1a36','#8a2648','#4a142c']);x.save();x.beginPath();x.ellipse(0,3,45,11,0,0,Math.PI);x.closePath();x.fill();x.restore();
      x.strokeStyle=NOIR;x.lineWidth=1.6;x.beginPath();x.ellipse(0,3,45,11,0,0,Math.PI);x.stroke();
      x.translate(20,-6);x.rotate(-0.25);
      x.beginPath();x.moveTo(0,0);x.bezierCurveTo(10,-40,34,-70,44,-58);x.bezierCurveTo(40,-40,22,-14,0,0);x.closePath();x.fillStyle=lin(x,0,0,44,-60,['#fffdf4','#f1ead6','#ffe9a8']);x.fill();x.strokeStyle='rgba(60,40,20,.75)';x.lineWidth=1.2;x.stroke();
      x.strokeStyle='rgba(150,120,70,.8)';x.lineWidth=1;x.beginPath();x.moveTo(0,0);x.quadraticCurveTo(16,-40,42,-58);x.stroke();
      x.restore();
    });
    return A;
  }
  /* poser une de ces images (en mesures du héros) dans la toile d'une image cuite */
  function pose2(c,sp,x,y,ang,e,miroir){c.save();c.translate((x-CADRE[0])*ECH*res,(y-CADRE[1])*ECH*res);c.rotate(ang);const k=ECH*res;c.scale(e*k*(miroir?-1:1),e*k);c.drawImage(sp.c,-sp.ox,-sp.oy,sp.w,sp.h);c.restore();}
  /* le luth et le chapeau du Barde, autour de l'image du héros : ce qui est derrière lui avant, ce qui est devant après */
  function barde(c,n,cap,o,avant){
    const joue=n[0]==='i'||n==='lance',dos=Math.abs(cap)>100;
    if(joue){
      const W1=o.poignetG,W2=o.poignetD,B=o.bassin;
      const C=[W1[0]*0.72+B[0]*0.28,W1[1]*0.8+B[1]*0.2-6],a=Math.atan2(W2[1]-C[1],W2[0]-C[0]),e=Math.max(0.55,Math.min(0.95,Math.hypot(W2[0]-C[0],W2[1]-C[1])/112));
      if(avant!==dos)pose2(c,dos?ACC.luthDos:ACC.luthFace,C[0],C[1],a,e*0.9);
    }else if(n!=='sol'){
      const B=o.bassin,E=o.epauleD,C=[B[0]*0.5+o.cou[0]*0.5,B[1]*0.55+o.cou[1]*0.45],a=Math.atan2(E[1]-60-C[1],E[0]-C[0]);
      if(avant===dos)pose2(c,ACC.luthFace,C[0],C[1],a,0.78);
    }
    if(avant&&n!=='sol')pose2(c,ACC.chapeau,o.tete[0],o.tete[1]-58,0,0.92,cap<0);
  }
  /* les os (dans les mesures du héros, x depuis son milieu, sans le tourner) → l'image (tournée de « cap ») ; [x, y, profondeur] */
  function vers(o,cap){const c=Math.cos(cap*Math.PI/180),sn=Math.sin(cap*Math.PI/180),r={};for(const n in o){const v=o[n];r[n]=[150+v[0]*c+v[2]*sn,v[1],v[2]*c-v[0]*sn];}return r;}
  /* ---------- la cuisson ---------- */
  function lancer(r,S0,quandFini){
    role=DEF[r]?r:'barde';h=Object.assign({},DEF[role],{combat:true});
    for(const k of ['sexe','peau','cheveux','yeux','coiffure'])if(q.get(k))h[k]=q.get(k);
    POSES=poses();ORDRE=Object.keys(POSES);IDX={};ORDRE.forEach((n,i)=>IDX[n]=i);
    res=clamp(S0,1,1.8);cw=Math.ceil(CW*res);ch=Math.ceil(CH*res);fini=quandFini;
    ACC=role==='barde'?accessoires(res*ECH):null;
    const planche=()=>{const c=document.createElement('canvas');c.width=cw*COLS;c.height=ch*Math.ceil(ORDRE.length/COLS);return c;};
    planches=CAPS.map(planche);pret=CAPS.map(()=>new Uint8Array(ORDRE.length));bouts=CAPS.map(()=>[]);
    /* d'abord ce qui sert tout de suite (la garde, la course, le sort), dans tous les angles ; le reste ensuite */
    const premiers=['garde','c0','c2','c4','c6','i0','lance','c1','c3','c5','c7','i1','i2','soin','saut','porte','coup','sol'];
    file=[];for(const n of premiers)for(let d=0;d<8;d++){if(n==='sol'&&d!==2&&d!==6)continue;file.push([n,d]);}
    total=file.length;fait=0;suite();
  }
  function suite(){
    if(enCours)return;
    const job=file.shift();if(!job){if(fini){const f=fini;fini=null;f();}return;}
    enCours=true;const [n,d]=job;
    let svg,P,o=null;
    try{P=Object.assign({},POSES[n](),{cap:CAPS[d]});svg=HV.svg(h,P,{cadre:CADRE.join(' '),id:'hs'});o=vers(HV.os(h,P),CAPS[d]+(P.tourne||0));}catch(e){enCours=false;fait++;setTimeout(suite,0);return;}
    svg=svg.replace('<svg ','<svg width="'+cw+'" height="'+ch+'" ');
    const url=URL.createObjectURL(new Blob([svg],{type:'image/svg+xml'})),img=new Image();
    const fin=ok=>{if(ok){const i=IDX[n],tmp=document.createElement('canvas');tmp.width=cw;tmp.height=ch;const x=tmp.getContext('2d');
        if(ACC&&o)barde(x,n,CAPS[d],o,false);
        x.drawImage(img,0,0,cw,ch);
        if(ACC&&o)barde(x,n,CAPS[d],o,true);
        planches[d].getContext('2d').drawImage(tmp,(i%COLS)*cw,Math.floor(i/COLS)*ch);
        /* d'où part le sort (en points de jeu, depuis les pieds) */
        if(o){let s;if(role==='sage')s=[o.poignetG[0],o.poignetG[1]-118];else if(role==='alchimiste')s=n==='lance'?o.poignetD:[(o.poignetG[0]+o.poignetD[0])/2,(o.poignetG[1]+o.poignetD[1])/2];else s=[o.poignetG[0]*0.72+o.bassin[0]*0.28,o.poignetG[1]*0.8+o.bassin[1]*0.2-6];
          bouts[d][i]={sx:(s[0]-150)*ECH,sy:(s[1]-414)*ECH,tx:(o.tete[0]-150)*ECH,ty:(o.tete[1]-414)*ECH};}
        pret[d][i]=1;}
      URL.revokeObjectURL(url);img.onload=img.onerror=null;enCours=false;fait++;setTimeout(suite,0);};
    img.onload=()=>fin(true);img.onerror=()=>fin(false);img.src=url;
  }
  /* dessiner une pose : (x, y) ses pieds */
  function dessiner(c,nom,d,x,y,a){
    let i=IDX[nom];if(i==null||!pret[d]||!pret[d][i]){i=0;if(!pret[d]||!pret[d][0])return false;}
    if(a!=null&&a<1)c.globalAlpha=a;
    c.drawImage(planches[d],(i%COLS)*cw,Math.floor(i/COLS)*ch,cw,ch,x-AX,y-AY,CW,CH);
    if(a!=null&&a<1)c.globalAlpha=1;
    return true;
  }
  function bout(nom,d){const i=IDX[nom];return (bouts[d]&&bouts[d][i])||{sx:0,sy:-36,tx:0,ty:-48};}
  return {lancer,dessiner,bout,get role(){return role;},get avance(){return total?fait/total:0;},get essentiel(){return fait>=8*7;},get complet(){return total>0&&fait>=total;},HAUT,CW,CH,AX,AY};
})();
/* la direction (0 … 7) d'un héros qui regarde vers l'angle a (dans la salle) : 0 = vers nous */
function dir8(a){return ((Math.round((90-a*180/Math.PI)/45)%8)+8)%8;}
