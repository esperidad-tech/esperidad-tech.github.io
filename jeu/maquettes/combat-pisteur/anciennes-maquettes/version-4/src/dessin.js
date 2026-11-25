/* ======================= l'écran ======================= */
const can=$('jeu'),cx=can.getContext('2d',{alpha:false});
let S=1,Ws=900,Hs=410,camX=0,camY=0,insetG=0,insetD=0;
const FIN=[1.5e6,0.95e6,0.6e6];let finesse=-1,vitesseApp=0;try{const v=localStorage.getItem('pisteur4_finesse');if(v!=null)finesse=Math.min(2,+v||0);}catch(e){}
if(/[?&]finesse=(\d)/.test(location.search))finesse=Math.min(2,+RegExp.$1);
/* un appareil lent commence tout de suite avec une image moins fine (mesuré en comptant ce qu'il calcule en 40 ms) */
function mesurerAppareil(){const t0=performance.now();let n=0;while(performance.now()-t0<40){champ(13,10);n++;}vitesseApp=n;if(finesse<0)finesse=n<26?2:n<48?1:0;}
const sonde=document.createElement('div');sonde.style.cssText='position:fixed;left:0;top:0;width:1px;height:1px;visibility:hidden;padding-left:env(safe-area-inset-left);padding-right:env(safe-area-inset-right)';document.body.appendChild(sonde);
let fondPret=false,grosPret=false,S0=0;
function taille(){
  const vw=innerWidth,vh=innerHeight;
  Hs=vw/vh*410<620?620*vh/vw:410;
  const dpr=Math.min(devicePixelRatio||1,2.5);let w=vw*dpr,h=vh*dpr;const k=Math.min(1,Math.sqrt(FIN[finesse]/(w*h)));
  can.width=Math.max(1,Math.round(w*k));can.height=Math.max(1,Math.round(h*k));S=can.height/Hs;Ws=can.width/S;
  const cs=getComputedStyle(sonde);insetG=(parseFloat(cs.paddingLeft)||0)*Hs/vh;insetD=(parseFloat(cs.paddingRight)||0)*Hs/vh;
  if(!S0)S0=S;else if(fondPret&&Math.abs(Salle.SB-S)>1e-3)Salle.adapter(S);
  verifTourne();
}
function verifTourne(){const t=innerHeight>innerWidth*1.05;if(t!==tourne){tourne=t;$('tourne').classList.toggle('on',t);dernier=performance.now();}}
addEventListener('resize',taille);addEventListener('orientationchange',()=>setTimeout(taille,200));
/* tout ce qui est cuit garde sa taille quand la finesse baisse (rien n'est recuit en plein combat) */
function preparerImages(){
  Salle.preparer(S0);fondPret=true;
  Gros.construire(clamp(S0,1,2),0.36);grosPret=true;
  GS.regler(S0);
  GS.prevoir([['trotteur',GT.chien.sc],['danseur',GT.javelot.sc],['bouclier',GT.dalle.sc],['lanceur',GT.mortier.sc],['fonceur',GT.belier.sc,['gratte','charge']],['soldat',GT.faucheur.sc],['cuirasse',GT.cuirasse.sc],['gros',GT.colosse.sc]]);
}

/* ======================= le sol ======================= */
const ligne=(a,b,c,d)=>{cx.beginPath();cx.moveTo(a,b);cx.lineTo(c,d);cx.stroke();};
const disque=(x,y,r)=>{cx.beginPath();cx.arc(x,y,Math.max(0.1,r),0,TAU);cx.fill();};
const ovale=(x,y,rx,ry)=>{cx.beginPath();cx.ellipse(x,y,Math.max(0.1,rx),Math.max(0.1,ry),0,0,TAU);cx.fill();};
function polyE(pts,f,s){cx.beginPath();for(let i=0;i<pts.length;i++)i?cx.lineTo(pts[i][0],pts[i][1]):cx.moveTo(pts[i][0],pts[i][1]);cx.closePath();if(f){cx.fillStyle=f;cx.fill();}if(s){cx.strokeStyle=s;cx.stroke();}}
function solPoly(pts){cx.beginPath();for(let i=0;i<pts.length;i++){const X=px(pts[i][0]),Y=py(pts[i][1],0);i?cx.lineTo(X,Y):cx.moveTo(X,Y);}cx.closePath();}
function solRect(x,y,a,u0,u1,l){const c=Math.cos(a),s=Math.sin(a),h=l/2;return [[x+c*u0+s*h,y+s*u0-c*h],[x+c*u1+s*h,y+s*u1-c*h],[x+c*u1-s*h,y+s*u1+c*h],[x+c*u0-s*h,y+s*u0+c*h]];}
function solEll(x,y,r){cx.beginPath();cx.ellipse(px(x),py(y,0),Math.max(0.1,r*T),Math.max(0.1,r*T*K),0,0,TAU);}
const lueur=(x,y,r,rgb,a,apl)=>Ou.poser(cx,Ou.lueur(48,rgb,apl||1,0.35,1),x,y,r/48,a);
const RG='rgba(255,46,34,';
function zoneRemplie(fondF,dedansF){fondF();cx.fillStyle=RG+'.16)';cx.fill();cx.strokeStyle=RG+'.95)';cx.lineWidth=2;cx.stroke();dedansF();cx.fillStyle=RG+'.36)';cx.fill();}
function dessinerZone(z){
  const p=clamp(z.p,0,1);cx.lineJoin='round';
  if(z.k==='cercle'){zoneRemplie(()=>solEll(z.x,z.y,z.r),()=>solEll(z.x,z.y,z.r*p));}
  else if(z.k==='cone'){
    const secteur=R=>{const pts=[[z.x,z.y]];for(let i=0;i<=12;i++){const a=z.a-z.h+2*z.h*i/12;pts.push([z.x+Math.cos(a)*R,z.y+Math.sin(a)*R]);}solPoly(pts);};
    zoneRemplie(()=>secteur(z.R),()=>secteur(z.R*p));
  }else if(z.k==='fin'){
    const ex=z.x+Math.cos(z.a)*z.L,ey=z.y+Math.sin(z.a)*z.L;
    cx.strokeStyle=z.lock?((((tReel*22)|0)%2)?'rgba(255,236,200,.95)':RG+'1)'):RG+(0.4+p*0.45)+')';cx.lineWidth=z.lock?3.2:1.8;
    if(!z.lock)cx.setLineDash([7,6]);ligne(px(z.x),py(z.y,0),px(ex),py(ey,0));cx.setLineDash([]);
    cx.fillStyle=RG+'.85)';disque(px(ex),py(ey,0),z.lock?5:3.5);
  }else{
    const L0=0.25;zoneRemplie(()=>solPoly(solRect(z.x,z.y,z.a,L0,z.L,z.l)),()=>solPoly(solRect(z.x,z.y,z.a,L0,L0+(z.L-L0)*p,z.l)));
    if(z.k==='fleche'){const c=Math.cos(z.a),s=Math.sin(z.a),tx=z.x+c*(z.L+0.45),ty=z.y+s*(z.L+0.45),bx=z.x+c*z.L,by=z.y+s*z.L,h=z.l*0.85;
      solPoly([[tx,ty],[bx+s*h,by-c*h],[bx-s*h,by+c*h]]);cx.fillStyle=RG+(0.45+p*0.5)+')';cx.fill();}
    if(z.k==='ligne'){cx.strokeStyle=RG+'.6)';cx.lineWidth=2;const c=Math.cos(z.a),s=Math.sin(z.a);
      for(let u=1.2;u<z.L-0.3;u+=1.3){const ux=z.x+c*u,uy=z.y+s*u,h=z.l*0.3;cx.beginPath();cx.moveTo(px(ux-c*0.35+s*h),py(uy-s*0.35-c*h,0));cx.lineTo(px(ux),py(uy,0));cx.lineTo(px(ux-c*0.35-s*h),py(uy-s*0.35+c*h,0));cx.stroke();}}
  }
}
/* ce que voit un golem : un éventail au sol, coupé par les murs (on ne le montre que quand le Pisteur est caché) */
function coneVue(g){
  if(g.conePts&&tReel-g.coneT<0.07)return g.conePts;
  const pts=[[g.x,g.y]],c=g.T.cone,R=g.T.vue;
  for(let i=0;i<=10;i++){const a=g.fa-c+2*c*i/10,L=Math.min(R,rayon(g.x,g.y,a,R,0.04));pts.push([g.x+Math.cos(a)*L,g.y+Math.sin(a)*L]);}
  g.conePts=pts;g.coneT=tReel;return pts;
}
function regardGrosbec(){
  const O=DIR.oeil;if(O.poly&&tReel-O.polyT<0.05)return O.poly;
  const pts=[[GBX,GBY+1.0]];for(let i=0;i<=6;i++){const a=O.a-O.larg+2*O.larg*i/6,L=rayon(GBX,GBY,a,26,0.05,true);pts.push([GBX+Math.cos(a)*L,GBY+Math.sin(a)*L]);}
  O.poly=pts;O.polyT=tReel;return pts;
}
function dessinerSol(){
  for(const q of parts)if(q.k==='tas'){const a=Math.min(1,q.vie/0.6);cx.globalAlpha=a;cx.fillStyle='#262931';const X=px(q.x),Y=py(q.y,0);for(let i=0;i<6;i++){const s=q.s;ovale(X+Math.cos(i*2.1)*9*s,Y+Math.sin(i*2.1)*3*s,5*s,3*s);}cx.fillStyle='rgba(255,110,40,.7)';disque(X,Y-1,2*q.s);cx.globalAlpha=1;}
  for(const it of items){const a=0.5+0.35*Math.sin(tReel*6);cx.strokeStyle=`rgba(255,176,112,${a})`;cx.lineWidth=2.5;solEll(it.x,it.y,0.6);cx.stroke();}
  /* le regard de Grosbec */
  if(phase==='vague'&&garde!=='alerte'&&!DIR.assaut){
    const O=DIR.oeil,pts=regardGrosbec(),fort=O.sur>0?0.2:0;
    solPoly(pts);cx.fillStyle=RG+(0.13+fort)+')';cx.fill();
    cx.strokeStyle=RG+(0.5+fort)+')';cx.lineWidth=1.6;ligne(px(pts[0][0]),py(pts[0][1]),px(pts[1][0]),py(pts[1][1]));ligne(px(pts[0][0]),py(pts[0][1]),px(pts[pts.length-1][0]),py(pts[pts.length-1][1]));
    const m=pts[4];cx.strokeStyle=RG+'.22)';cx.lineWidth=5;ligne(px(pts[0][0]),py(pts[0][1]),px(m[0]),py(m[1]));
  }
  /* les champs de vision : seulement quand il est caché */
  if(P.cache&&phase==='vague'){
    for(const g of G){
      if(!vivant(g)||!g.vuMaint||tReel<g.sonneJ||g.etat==='sonne')continue;
      solPoly(coneVue(g));
      if(g.rem>0.02){cx.fillStyle=`rgba(255,150,40,${0.16+g.rem*0.3})`;cx.fill();cx.strokeStyle=`rgba(255,170,60,${0.5+g.rem*0.5})`;}
      else{cx.fillStyle='rgba(255,244,214,.09)';cx.fill();cx.strokeStyle='rgba(255,244,214,.3)';}
      cx.lineWidth=1.2;cx.stroke();
    }
  }
  for(const o of obus){const k=clamp(o.t/o.dur,0,1);zoneRemplie(()=>solEll(o.x1,o.y1,1.0),()=>solEll(o.x1,o.y1,1.0*k));}
  for(const w of ondes){
    /* l'onde : un anneau, troué derrière les piliers et les grands murs */
    const a=Math.max(0,1-w.r/w.max)*0.6+0.25,ri=Math.max(0.05,w.r-w.ep/2),ro=w.r+w.ep/2,X=px(w.x),Y=py(w.y);
    cx.fillStyle=`rgba(255,110,40,${a})`;cx.strokeStyle=`rgba(255,226,170,${a})`;cx.lineWidth=2;
    let i=0;
    while(i<64){
      if(w.r>w.lim[i]+0.2){i++;continue;}
      let j=i;while(j<64&&w.r<=w.lim[j]+0.2)j++;
      const a0=(i-0.5)/64*TAU,a1=(j-0.5)/64*TAU;
      cx.beginPath();cx.ellipse(X,Y,ro*T,ro*T*K,0,a0,a1);cx.ellipse(X,Y,ri*T,ri*T*K,0,a1,a0,true);cx.closePath();cx.fill();
      cx.beginPath();cx.ellipse(X,Y,ro*T,ro*T*K,0,a0,a1);cx.stroke();
      i=j;
    }
  }
  for(const g of G)if(g.zone)dessinerZone(g.zone);
  for(const g of G){if(g.balai&&tReel-g.balai.t<0.2&&vivant(g)){const a=1-(tReel-g.balai.t)/0.2,R=g.r+2.2,pts=[[g.x,g.y]];for(let i=0;i<=10;i++){const t=g.balai.a-1.5+3*i/10;pts.push([g.x+Math.cos(t)*R,g.y+Math.sin(t)*R]);}solPoly(pts);cx.fillStyle=`rgba(255,220,180,${0.5*a})`;cx.fill();}}
  for(const L of leurres){const X=px(L.x),Y=py(L.y);cx.fillStyle='rgba(0,0,0,.35)';ovale(X,Y,11,5);cx.strokeStyle='#5a3a1c';cx.lineWidth=3;ligne(X,Y,X,Y-44);polyE([[X-12,Y-44],[X+12,Y-44],[X+16,Y-8],[X,Y-14],[X-16,Y-8]],'#2f8050','#12301e');lueur(X,Y-26,40,'200,182,255',0.5);}
}

/* ======================= le Pisteur ======================= */
function dirP(){return ((Math.round((90-P.fa*180/Math.PI)/45)%8)+8)%8;}
function dessinerPisteur(){
  const X=px(P.x),Yg=py(P.y,0),Y=py(P.y,P.z),cs=Math.cos(P.fa),sn=Math.sin(P.fa);
  let d=dirP(),nom='garde',a=1;
  cx.fillStyle='rgba(0,0,0,.42)';ovale(X,Yg+1,13-P.z*5,5.5-P.z*2);
  if(P.cache&&P.etat!=='aterre'){cx.strokeStyle=`rgba(180,140,255,${0.45+0.2*Math.sin(tReel*5)})`;cx.lineWidth=2;solEll(P.x,P.y,0.5);cx.stroke();}
  switch(P.etat){
    case 'aterre':nom='chute';d=cs>=0?2:6;break;
    case 'bond':nom='a2';lueur(X,Y-30,40,'200,182,255',0.5);break;
    case 'assassin':nom=P.t<0.15?'saut':'plante';break;
    case 'ombre':nom='furtif';a=P.t<0.1?1-P.t/0.1:clamp((P.t-0.1)/0.12,0,1);break;
    case 'coup':{const n=P.dernier?3:(P.combo%2?1:2);nom=n===3?(P.t<0.09?'saut':'plante'):n===1?'d1b':'fente';break;}
    case 'tir':nom='t3';break;
    case 'vise':nom='t2';break;
    case 'touche':nom='garde';break;
    default:
      if(tReel-(P.tirT||-9)<0.12)nom='t3';
      else if(P.court){if(P.cache)nom='a'+(Math.floor(P.pas/2.3*4)%4);else nom='c'+(Math.floor(P.pas/2.5*8)%8);}
      else nom=P.cache?'furtif':'garde';
  }
  P.imgNom=nom;P.imgDir=d;
  if(P.etat!=='aterre'&&P.etat!=='ombre'){
    const c=P.cache?'180,140,255':'91,224,230';cx.fillStyle=`rgba(${c},.55)`;
    solPoly([[P.x+cs*1.02,P.y+sn*1.02],[P.x+cs*0.72-sn*0.2,P.y+sn*0.72+cs*0.2],[P.x+cs*0.72+sn*0.2,P.y+sn*0.72-cs*0.2]]);cx.fill();
  }
  if(tReel<P.invul&&((tReel*14)|0)%2)a*=0.4;
  if(P.invisible>0&&P.etat!=='ombre')a*=0.55;
  if(!PS.dessiner(cx,nom,d,X,Y,a)){cx.fillStyle='#2f8050';ovale(X,Y-28,9,26);}
  if(P.etat==='vise'){
    /* la jauge du tir visé, et sa ligne */
    const c=P.cibleVise,full=P.charge>=1,L=c?hyp(c.x-P.x,c.y-P.y):(P.up.cloche||P.up.rayon?16:rayon(P.x,P.y,P.fa,16,0.05)),aa=c?Math.atan2(c.y-P.y,c.x-P.x):P.fa;
    cx.strokeStyle=full?'rgba(255,255,255,.9)':'rgba(190,160,255,.6)';cx.lineWidth=full?2.4:1.5;cx.setLineDash([6,5]);ligne(X,py(P.y,0.75),px(P.x+Math.cos(aa)*L),py(P.y+Math.sin(aa)*L,0.75));cx.setLineDash([]);
    cx.strokeStyle='rgba(20,14,40,.7)';cx.lineWidth=5;cx.beginPath();cx.arc(X,Y-78,9,0,TAU);cx.stroke();
    cx.strokeStyle=full?'#fff':'#b48cff';cx.lineWidth=3.2;cx.beginPath();cx.arc(X,Y-78,9,-Math.PI/2,-Math.PI/2+TAU*P.charge);cx.stroke();
    if(c){const gx=px(c.x),gy=py(c.y,c.T.h*0.55),r=7+(full?2*Math.sin(tReel*18):0);cx.strokeStyle=full?'#fff':'#bff6ff';cx.lineWidth=2;cx.beginPath();cx.arc(gx,gy,r,0,TAU);cx.stroke();ligne(gx-r-4,gy,gx-r+3,gy);ligne(gx+r-3,gy,gx+r+4,gy);ligne(gx,gy-r-4,gx,gy-r+3);ligne(gx,gy+r-3,gx,gy+r+4);if(full)lueur(gx,gy,22,'190,246,255',0.8);}
  }
}

/* ======================= les golems ======================= */
function poseGolem(g){
  let etat='marche',k=2,pied=0;const fr=tReel-g.tFrappe<0.28;
  switch(g.type){
    case 'chien':if(g.etat==='arme')etat='arme';else if(g.etat==='saut')etat='frappe';break;
    case 'javelot':if(g.etat==='arme')etat='arme';else if(g.etat==='poing')etat=g.t>0.38?'frappe':'arme';break;
    case 'mortier':if(g.etat==='vise')etat='arme';else if(fr)etat='frappe';break;
    case 'belier':if(g.etat==='gratte')etat='gratte';else if(g.etat==='charge')etat='charge';break;
    case 'dalle':if(g.etat==='coupDalle'||g.etat==='marteau'||g.etat==='poing')etat='arme';else if(fr)etat='frappe';break;
    case 'faucheur':if(g.etat==='fauche')etat='arme';else if(fr)etat='frappe';break;
    case 'cuirasse':if(g.etat==='estoc')etat='arme';else if(fr)etat='frappe';break;
    case 'colosse':if(g.etat==='onde'||g.etat==='poing')etat='arme';else if(fr)etat='frappe';break;
  }
  if(etat==='marche'&&g.bouge){const i=Math.floor((((g.marche/g.T.pas)%1)+1)%1*8);pied=i<4?0:1;k=[0,2,3,4][i%4];}
  const c=Math.cos(g.fa);let yaw=c>0.38?1:c<-0.38?-1:(Math.sin(g.fa)>=0?0:(g.yaw||1));if(yaw)g.yaw=yaw;
  return {yaw,etat,k,pied,sansBouclier:g.type==='dalle'&&!g.aDalle};
}
function dessinerGolem(g){
  if(g.etat==='mort')return;
  /* le brouillard léger : derrière un pilier ou un grand mur, on ne voit plus qu'une silhouette pâle, là où on l'a vu en dernier */
  const d=hyp(g.x-P.x,g.y-P.y);
  const vu=g.etat==='entre'||d<2.6||tReel<g.marque||P.up.oeil||(P.up.odorat&&d<5)||vue(P.x,P.y,g.x,g.y,true);
  g.vuMaint=vu;
  if(vu){g.vx=g.x;g.vy=g.y;g.jamaisVu=false;}else if(g.jamaisVu)return;
  const gx=vu?g.x:g.vx,gy=vu?g.y:g.vy;
  let al=1;if(gy<Y0+0.3)al=clamp((gy-0.3)/1.2,0,1);if(al<=0)return;
  const X=px(gx),Yg=py(gy,0),Y=py(gy,vu?g.z:0),sc=g.T.sc,sp=GS.image(g.T.m,sc,poseGolem(g));
  if(!vu){cx.globalAlpha=0.3;cx.drawImage(sp.c,X-sp.ox*sc,Y-sp.oy*sc,sp.w*sc,sp.h*sc);cx.globalAlpha=1;cx.fillStyle='rgba(200,210,255,.7)';cx.font='900 13px Nunito,sans-serif';cx.textAlign='center';cx.fillText('?',X,Y-g.T.h*ZH-6);return;}
  cx.globalAlpha=al;
  cx.fillStyle='rgba(0,0,0,.42)';ovale(X,Yg+1,g.r*T*1.05-g.z*6,g.r*T*0.4);
  if(g.T.armure&&tReel>g.sansArmure){cx.strokeStyle='rgba(190,230,255,.35)';cx.lineWidth=1.5;solEll(gx,gy,g.r+0.18);cx.stroke();}
  if(g.type==='dalle'&&g.aDalle){   /* de quel côté sa dalle arrête tout */
    cx.strokeStyle='rgba(255,224,138,.5)';cx.lineWidth=3;cx.beginPath();cx.ellipse(X,Yg,(g.r+0.32)*T,(g.r+0.32)*T*K,0,g.fa-1.2,g.fa+1.2);cx.stroke();}
  const trem=(g.etat==='gratte'||(g.etat==='onde'&&g.t>0.7))?rnd(-1.5,1.5):0;
  cx.drawImage(sp.c,X-sp.ox*sc+trem,Y-sp.oy*sc,sp.w*sc,sp.h*sc);
  if(g.flash>0.05){cx.globalCompositeOperation='lighter';cx.globalAlpha=al*g.flash*0.75;cx.drawImage(sp.c,X-sp.ox*sc+trem,Y-sp.oy*sc,sp.w*sc,sp.h*sc);cx.globalCompositeOperation='source-over';cx.globalAlpha=al;}
  const H=g.T.h*ZH;
  if(g.type==='javelot'&&(g.etat==='normal'||g.etat==='arme'||(g.etat==='recup'&&g.retour!=='nu'))){
    const leve=g.etat==='arme'?12:0,c=Math.cos(g.fa),s=Math.sin(g.fa)*K,hx=X+c*4,hy=Y-H*0.62-leve;
    cx.lineCap='round';cx.strokeStyle='#0c0806';cx.lineWidth=4.6;ligne(hx-c*20,hy-s*20,hx+c*26,hy+s*26);cx.strokeStyle='#9a7040';cx.lineWidth=2.6;ligne(hx-c*20,hy-s*20,hx+c*26,hy+s*26);
    polyE([[hx+c*34,hy+s*34],[hx+c*24-s*4,hy+s*24+c*4],[hx+c*24+s*4,hy+s*24-c*4]],'#dfe8f2','#0c0806');
  }
  if(g.etat==='charge'){cx.strokeStyle='rgba(255,200,150,.5)';cx.lineWidth=2;const c=Math.cos(g.fa),s=Math.sin(g.fa)*K;for(let k=-1;k<=1;k++)ligne(X-c*26-s*k*10,Y-22-s*26+c*k*6,X-c*56-s*k*10,Y-22-s*56+c*k*6);}
  let yh=Y-H-8;
  if(tReel<g.sonneJ||g.etat==='sonne'){cx.fillStyle='#ffd23a';for(let i=0;i<3;i++){const a=tReel*4+i*2.1;polyE([[X+Math.cos(a)*13,yh+Math.sin(a)*4-4],[X+Math.cos(a)*13+3,yh+Math.sin(a)*4],[X+Math.cos(a)*13,yh+Math.sin(a)*4+4],[X+Math.cos(a)*13-3,yh+Math.sin(a)*4]],'#ffd23a');}yh-=10;}
  if(tReel<g.cloueJ){cx.strokeStyle='#bff6ff';cx.lineWidth=2.5;ligne(X+6,Y-H*0.55-8,X-2,Y-3);cx.fillStyle='#bff6ff';disque(X+6,Y-H*0.55-8,2.5);}
  if(tReel<g.ouvert){cx.strokeStyle=`rgba(200,160,255,${0.6+0.3*Math.sin(tReel*12)})`;cx.lineWidth=2;solEll(gx,gy,g.r+0.3);cx.stroke();}
  if(g.saigne.length){cx.fillStyle='#ff4a3a';for(let i=0;i<g.saigne.length;i++)disque(X-8+i*8,yh-2,2.6);yh-=8;}
  if(tReel<g.marque){cx.strokeStyle='#5be0e6';cx.lineWidth=1.8;cx.beginPath();cx.arc(X,yh-8,6,0,TAU);cx.stroke();ligne(X-9,yh-8,X+9,yh-8);ligne(X,yh-17,X,yh+1);yh-=18;}
  if(g.T.armure){   /* son armure : trois plaques */
    const n=Math.ceil(g.hp/(g.max/3)-0.01);for(let i=0;i<3;i++){cx.fillStyle=i<n?(tReel>g.sansArmure?'#dfeaf4':'#ffb070'):'rgba(0,0,0,.5)';cx.strokeStyle='#0c0d12';cx.lineWidth=1;cx.beginPath();cx.rect(X-17+i*12,yh-8,10,7);cx.fill();cx.stroke();}yh-=12;
  }else if(g.hp<g.max||g.type==='colosse'){const w=g.type==='colosse'?84:34;cx.fillStyle='rgba(0,0,0,.65)';cx.fillRect(X-w/2-1,yh-6,w+2,6);cx.fillStyle=g.hp/g.max>0.35?'#e0473a':'#ff8a3a';cx.fillRect(X-w/2,yh-5,w*Math.max(0,g.hp/g.max),4);yh-=10;}
  if(tReel<g.excl){const k=1-(g.excl-tReel)/0.9;cx.font='900 '+(22+8*Math.sin(Math.min(1,k*4)*Math.PI))+'px Nunito,sans-serif';cx.textAlign='center';cx.textBaseline='alphabetic';cx.lineWidth=4;cx.strokeStyle='#200';cx.strokeText('!',X,yh);cx.fillStyle='#ff4a3a';cx.fillText('!',X,yh);}
  else if(tReel<g.inter||(garde==='recherche'&&((tReel*0.8+g.id*3)%2.2)<0.8)){cx.font='900 18px Nunito,sans-serif';cx.textAlign='center';cx.textBaseline='alphabetic';cx.lineWidth=3.5;cx.strokeStyle='#210';cx.strokeText('?',X,yh);cx.fillStyle='#ffd23a';cx.fillText('?',X,yh);}
  cx.globalAlpha=1;
}

/* ======================= le reste ======================= */
function dessinerItem(it){
  const X=px(it.x),Y=py(it.y,0),ex=px(it.x-Math.cos(it.a)*0.4),ey=py(it.y-Math.sin(it.a)*0.4,1.25);
  cx.fillStyle='rgba(0,0,0,.3)';ovale(X,Y,6,3);cx.lineCap='round';
  cx.strokeStyle='#0c0806';cx.lineWidth=5;ligne(X,Y,ex,ey);cx.strokeStyle='#9a7040';cx.lineWidth=3;ligne(X,Y,ex,ey);polyE([[ex,ey],[ex-5,ey-7],[ex+3,ey-8]],'#d8c090','#0c0806');
  lueur(X,Y-8,26,'255,176,112',0.35+0.2*Math.sin(tReel*6));
}
function dessinerLoup(l){
  const X=px(l.x),Y=py(l.y,0),d=l.dir,s=Math.sin(l.pas);
  lueur(X,Y-20,60,'91,224,230',0.6);cx.globalAlpha=0.9;cx.lineCap='round';
  cx.strokeStyle='#2e8a90';cx.lineWidth=5;ligne(X-d*16,Y-20,X-d*16-s*8,Y-1);ligne(X+d*14,Y-20,X+d*14+s*8,Y-1);
  cx.fillStyle='#5be0e6';ovale(X,Y-24,24,10);cx.fillStyle='#8af2f5';ovale(X+d*24,Y-30,10,8);
  polyE([[X+d*20,Y-36],[X+d*22,Y-46],[X+d*27,Y-36]],'#8af2f5');cx.strokeStyle='#5be0e6';ligne(X-d*22,Y-26,X-d*36,Y-34);
  cx.fillStyle='#fff';disque(X+d*28,Y-31,1.8);cx.globalAlpha=1;
}
function dessinerAir(){
  cx.lineCap='round';
  for(const f of fleches){const X=px(f.x),Y=py(f.y,0.75),L=f.vise||f.rayon?1.6:0.7,bx=px(f.x-Math.cos(f.a)*L),by=py(f.y-Math.sin(f.a)*L,0.75);
    cx.fillStyle='rgba(0,0,0,.25)';ovale(X,py(f.y,0),4,2);
    if(f.vise||f.rayon){cx.strokeStyle='rgba(190,160,255,.5)';cx.lineWidth=7;ligne(bx,by,X,Y);}
    cx.strokeStyle=f.vise||f.rayon?'#f2e8ff':'#d8f1f4';cx.lineWidth=2.6;ligne(bx,by,X,Y);lueur(X,Y,f.vise?22:12,f.vise||f.rayon?'200,182,255':'91,224,230',0.8);}
  for(const j of javs){const X=px(j.x),Y=py(j.y,0.85),bx=px(j.x-Math.cos(j.a)*1.2),by=py(j.y-Math.sin(j.a)*1.2,0.85);
    cx.fillStyle='rgba(0,0,0,.25)';ovale(X,py(j.y,0),5,2);if(j.joueur)lueur(X,Y,24,'255,176,112',0.8);else{cx.strokeStyle='rgba(255,60,40,.35)';cx.lineWidth=6;ligne(bx,by,X,Y);}
    cx.strokeStyle='#0c0806';cx.lineWidth=4.6;ligne(bx,by,X,Y);cx.strokeStyle='#9a7040';cx.lineWidth=2.8;ligne(bx,by,X,Y);cx.fillStyle='#dfe8f2';disque(X,Y,3.2);}
  for(const o of obus){if(o.t<0)continue;const k=clamp(o.t/o.dur,0,1),x=lerp(o.x0,o.x1,k),y=lerp(o.y0,o.y1,k),z=1.2+Math.sin(Math.PI*k)*5.5-k*1.2;
    cx.fillStyle='rgba(0,0,0,.3)';ovale(px(x),py(y,0),6*k+2,3*k+1);lueur(px(x),py(y,z),22,'255,110,40',0.9);cx.fillStyle='#22252c';disque(px(x),py(y,z),6);cx.fillStyle='#ffb060';disque(px(x)-1.5,py(y,z)-1.5,2);}
  const sl=P.slash;
  if(sl&&tReel-sl.t<0.18){
    /* la dague : un grand arc de lumière, comme dans Hades */
    const a=1-(tReel-sl.t)/0.18,k=P.up.longue?1.3:1,r0=0.5,r1=(sl.der?1.8:1.5)*k,sens=sl.n%2?1:-1,ouv=sl.tour?Math.PI:1.15,n=sl.tour?26:12;
    const av=sl.tour?1:Math.min(1,(tReel-sl.t)/0.07+0.3),a0=sl.a-ouv*sens,a1=sl.a-ouv*sens+2*ouv*sens*av;
    cx.beginPath();for(let i=0;i<=n;i++){const t=a0+(a1-a0)*i/n,rr=r1*(0.86+0.14*i/n);const X=px(P.x+Math.cos(t)*rr),Y=py(P.y+Math.sin(t)*rr,0.6);i?cx.lineTo(X,Y):cx.moveTo(X,Y);}
    for(let i=n;i>=0;i--){const t=a0+(a1-a0)*i/n,rr=lerp(r1*0.86,r0,0.25+0.75*(1-i/n)*0.6);cx.lineTo(px(P.x+Math.cos(t)*rr),py(P.y+Math.sin(t)*rr,0.6));}
    cx.closePath();cx.fillStyle=P.cache?`rgba(214,196,255,${0.55*a})`:`rgba(216,246,250,${0.55*a})`;cx.fill();
    cx.strokeStyle=`rgba(255,255,255,${0.95*a})`;cx.lineWidth=sl.der?3.2:2.2;cx.beginPath();for(let i=0;i<=n;i++){const t=a0+(a1-a0)*i/n,rr=r1*(0.86+0.14*i/n);const X=px(P.x+Math.cos(t)*rr),Y=py(P.y+Math.sin(t)*rr,0.6);i?cx.lineTo(X,Y):cx.moveTo(X,Y);}cx.stroke();
  }
  for(const n of nuages){const a=Math.min(1,n.t/0.8)*0.75,X=px(n.x),Y=py(n.y,0.5);for(let i=0;i<7;i++){const an=i*0.9+tReel*0.3,r=n.r*T*(0.35+0.12*Math.sin(i*1.7));cx.fillStyle=`rgba(${24+i*4},${20+i*3},${40+i*5},${a*0.5})`;ovale(X+Math.cos(an)*n.r*T*0.5,Y+Math.sin(an)*n.r*T*K*0.5-i*2,r,r*0.75);}}
  /* les fils rouges de Grosbec : il pilote ses golems */
  for(const f of DIR.fils){const a=1-(tReel-f.t)/1.3,g=f.g,x0=px(GBX),y0=py(GBY,GBZ)-78,x1=px(g.x),y1=py(g.y,g.T.h);cx.strokeStyle=RG+(0.6*a)+')';cx.lineWidth=1.6;cx.beginPath();cx.moveTo(x0,y0);cx.quadraticCurveTo((x0+x1)/2,Math.min(y0,y1)-40-20*Math.sin(tReel*9+g.id*7),x1,y1);cx.stroke();lueur(x1,y1,16,'255,60,40',a);}
}
function dessinerParts(){
  for(const q of parts){
    const a=clamp(q.vie/q.max,0,1),X=px(q.x)+(q.ox||0),Y=py(q.y,q.z||0)+(q.oy||0);
    switch(q.k){
      case 'fant':if(P.imgNom)PS.dessiner(cx,P.imgNom,P.imgDir,X,Y,a*0.4);break;
      case 'e':cx.globalAlpha=a;cx.fillStyle=q.c;cx.fillRect(X-1.6,Y-1.6,3.2,3.2);cx.globalAlpha=1;break;
      case 'cr':cx.globalAlpha=a;polyE([[X,Y-q.s],[X+q.s*0.6,Y],[X,Y+q.s],[X-q.s*0.6,Y]],'#ff7a4a');cx.globalAlpha=1;break;
      case 'p':cx.fillStyle=`rgba(150,150,160,${a*0.35})`;disque(X,Y,q.s*(1.4-a*0.4));break;
      case 'o':cx.fillStyle=`rgba(150,110,230,${a*0.5})`;disque(X,Y,q.s*(1.5-a*0.5));break;
      case 'c':cx.globalAlpha=Math.min(1,a*2);cx.save();cx.translate(X,Y);cx.rotate(q.r);cx.fillStyle=q.c;cx.fillRect(-q.s/2,-q.s/2,q.s,q.s*0.8);cx.fillStyle='rgba(255,255,255,.18)';cx.fillRect(-q.s/2,-q.s/2,q.s,1.5);cx.restore();cx.globalAlpha=1;break;
      case 'onde':cx.strokeStyle=`rgba(255,240,210,${a})`;cx.lineWidth=3;cx.beginPath();cx.ellipse(X,Y,(1-a)*40*q.s+6,(1-a)*28*q.s+4,0,0,TAU);cx.stroke();break;
      case 't':cx.globalAlpha=Math.min(1,a*2);cx.font='900 15px Nunito,sans-serif';cx.textAlign='center';cx.textBaseline='middle';cx.lineWidth=4;cx.strokeStyle='rgba(0,0,0,.78)';cx.strokeText(q.t,X,Y);cx.fillStyle=q.c;cx.fillText(q.t,X,Y);cx.globalAlpha=1;break;
    }
  }
}
function visible(X,Y,m){return X>camX-m&&X<camX+Ws+m&&Y>camY-m&&Y<camY+Hs+m;}
function dessinerFondVivant(){
  /* les flammes des torches */
  for(const t of Salle.TORCHES.concat(Salle.LAMPES)){
    const X=px(t.x),Y=py(t.y==null?Y0:t.y,t.z);if(!visible(X,Y,80))continue;
    const f=Math.sin(tReel*11+t.x*3)*0.5+Math.sin(tReel*17+t.x)*0.5;
    if(!finesse)lueur(X,Y-8,70+f*6,'255,160,70',0.55+f*0.08);
    polyE([[X-6,Y],[X+6,Y],[X+f*3,Y-17-f*4]],'#ff9a30');polyE([[X-3.2,Y],[X+3.2,Y],[X-f*2,Y-10]],'#fff0b0');
  }
  /* les battants des deux portes */
  for(const [i,dx] of [[0,8],[1,18]]){
    const x0=px(dx-1.3),x1=px(dx+1.3),yb=py(Y0),yt=py(Y0,3.0),c=(x0+x1)/2;if(!visible(c,yb-70,120))continue;
    const o=porte[i],w=(x1-x0)/2*(1-o*0.86);
    cx.save();cx.beginPath();cx.moveTo(x0,yb);cx.lineTo(x0,yt+26);cx.quadraticCurveTo(c,yt-22,x1,yt+26);cx.lineTo(x1,yb);cx.closePath();cx.clip();
    if(o>0.02){cx.fillStyle=`rgba(255,80,30,${o*0.5})`;cx.fillRect(x0,yt,x1-x0,yb-yt);}
    for(const [a,b] of [[x0,x0+w],[x1-w,x1]]){cx.fillStyle='#6a5236';cx.fillRect(a,yt-10,b-a,yb-yt+10);cx.fillStyle='#8f7448';cx.fillRect(a+3,yt-10,Math.max(0,b-a-6),yb-yt+10);cx.fillStyle='#2a1f14';for(let k=a+9;k<b-3;k+=13)cx.fillRect(k,yt-10,1.6,yb-yt+10);cx.fillStyle='#f4d27c';if(b-a>12)for(let k=0;k<4;k++)disque(a+6,yt+30+k*26,2);}
    cx.restore();
  }
  /* Grosbec, debout sur son estrade */
  const gx=px(GBX),gy=py(GBY,GBZ);
  if(grosPret&&visible(gx,gy-60,150)){
    Gros.rafraichir(tReel,GBE,finesse===2?6:finesse?9:13);Gros.dessiner(cx,gx,gy);
    if(tReel-GBE.bulleT<2&&GBE.bulle){
      const a=Math.min(1,(2-(tReel-GBE.bulleT))*3);cx.globalAlpha=a;cx.font='900 14px Nunito,sans-serif';
      const w=cx.measureText(GBE.bulle).width+20,bx=gx+46,by=gy-124;
      cx.fillStyle='rgba(30,10,8,.92)';cx.strokeStyle='#ff6a4a';cx.lineWidth=1.5;cx.beginPath();if(cx.roundRect)cx.roundRect(bx,by,w,27,9);else cx.rect(bx,by,w,27);cx.fill();cx.stroke();
      cx.fillStyle='#ffd8c8';cx.textAlign='left';cx.textBaseline='middle';cx.fillText(GBE.bulle,bx+10,by+14);cx.globalAlpha=1;
    }
  }
}

/* ======================= l'interface dessinée ======================= */
function coeurF(x,y,s){cx.beginPath();cx.moveTo(x,y+s*0.3);cx.bezierCurveTo(x,y,x-s*0.5,y,x-s*0.5,y+s*0.3);cx.bezierCurveTo(x-s*0.5,y+s*0.6,x,y+s*0.8,x,y+s);cx.bezierCurveTo(x,y+s*0.8,x+s*0.5,y+s*0.6,x+s*0.5,y+s*0.3);cx.bezierCurveTo(x+s*0.5,y,x,y,x,y+s*0.3);cx.closePath();}
let joyVu=false,bandes=null;
const joyR=()=>Hs*0.13;
function dessinerInterface(){
  const L=14+insetG;
  /* caché : le bord de l'écran se teinte de violet */
  if(!bandes){bandes={};for(const [n,c] of [['v','150,110,255'],['n','0,0,0']]){const b=document.createElement('canvas');b.width=4;b.height=48;const g=b.getContext('2d'),r=g.createLinearGradient(0,0,0,48);r.addColorStop(0,`rgba(${c},${n==='v'?0.5:0.6})`);r.addColorStop(1,`rgba(${c},0)`);g.fillStyle=r;g.fillRect(0,0,4,48);bandes[n]=b;}}
  if(finesse<2)cx.drawImage(bandes.n,0,0,Ws,54);
  if(P.cache&&etatJeu==='jeu'&&phase==='vague'){cx.drawImage(bandes.v,0,0,Ws,26);cx.save();cx.translate(0,Hs);cx.scale(1,-1);cx.drawImage(bandes.v,0,0,Ws,26);cx.restore();}
  for(let i=0;i<P.max;i++){const x=L+10+i*22,y=12;coeurF(x,y,18);if(i<P.coeurs){cx.fillStyle='#e0473a';cx.fill();cx.strokeStyle='#ffb0a0';cx.lineWidth=1.2;cx.stroke();}else{cx.fillStyle='rgba(0,0,0,.45)';cx.fill();cx.strokeStyle='rgba(255,176,160,.5)';cx.lineWidth=1.2;cx.stroke();}}
  cx.font='800 12px Nunito,sans-serif';cx.textAlign='left';cx.textBaseline='top';
  if(etatJeu==='jeu'){
    cx.fillStyle='rgba(241,231,208,.85)';cx.fillText(`Vague ${vague+1} / ${VAGUES.length}`,L,36);
    if(phase==='vague'){const c=P.cache;cx.fillStyle=c?'#c8b6ff':'#ff7a6a';cx.fillText(c?(garde==='recherche'?'◐ Caché — ils te cherchent':'◐ Caché'):'◉ Repéré',L+88,36);}
  }
  const ics=Object.keys(P.up).map(id=>CARTE[id]?CARTE[id].ic:'').join(' ');if(ics){cx.font='14px sans-serif';cx.fillStyle='#fff';cx.fillText(ics,L,53);}
  if(P.javelots>1){cx.font='900 13px Nunito,sans-serif';cx.fillStyle='#ffb070';cx.textAlign='right';cx.fillText('javelots × '+P.javelots,Ws-14-insetD,Hs-18);cx.textAlign='left';}
  cx.textAlign='center';cx.textBaseline='middle';
  if(bandeau&&tReel-bandeau.t<2.8){const t=tReel-bandeau.t,a=t<0.3?t/0.3:t>2.2?Math.max(0,(2.8-t)/0.6):1;cx.globalAlpha=a;
    cx.fillStyle='rgba(4,7,14,.6)';cx.fillRect(Ws/2-180,Hs*0.3-30,360,62);cx.fillStyle='#f3d48a';cx.font='700 24px Cinzel,Georgia,serif';cx.fillText(bandeau.a,Ws/2,Hs*0.3-10);
    cx.fillStyle='#f1e7d0';cx.font='800 16px Nunito,sans-serif';cx.fillText(bandeau.b,Ws/2,Hs*0.3+16);cx.globalAlpha=1;}
  /* l'ordre de Grosbec, écrit en rouge */
  if(tReel-DIR.ordreT<2.6&&etatJeu==='jeu'){const t=tReel-DIR.ordreT,a=t<0.15?t/0.15:t>2?Math.max(0,(2.6-t)/0.6):1,sc=1+Math.max(0,0.25-t)*1.2;cx.globalAlpha=a;
    cx.save();cx.translate(Ws/2,Hs*0.44);cx.scale(sc,sc);cx.fillStyle='rgba(30,4,4,.72)';cx.fillRect(-190,-27,380,54);cx.fillStyle='#ff9a8a';cx.font='800 11px Nunito,sans-serif';cx.fillText('GROSBEC ORDONNE',0,-15);
    cx.fillStyle='#ff4a3a';cx.font='700 23px Cinzel,Georgia,serif';cx.fillText('« '+DIR.ordreTxt+' »',0,7);cx.restore();cx.globalAlpha=1;}
  /* les golems hors de l'écran */
  for(const g of G){
    if(!vivant(g)||!g.vuMaint)continue;
    const sx=px(g.x)-camX,sy=py(g.y,g.T.h*0.5)-camY;
    if(sx>-6&&sx<Ws+6&&sy>-6&&sy<Hs+6)continue;
    const dx=sx-Ws/2,dy=sy-Hs/2,m=26,k=Math.min((Ws/2-m-insetD)/Math.abs(dx||1e-3),(Hs/2-m)/Math.abs(dy||1e-3)),ex=Ws/2+dx*k,ey=Hs/2+dy*k,a=Math.atan2(dy,dx);
    const dang=!!g.zone||g.etat==='vise',s=dang?13+3*Math.sin(tReel*14):9;
    cx.save();cx.translate(ex,ey);cx.rotate(a);polyE([[s,0],[-s*0.7,-s*0.75],[-s*0.4,0],[-s*0.7,s*0.75]],dang?'#ff4a3a':P.cache?'rgba(255,244,214,.75)':'rgba(224,71,58,.85)','rgba(0,0,0,.5)');cx.restore();
  }
  /* le pouce gauche */
  const R=joyR();
  if(joy.id!==null){cx.fillStyle='rgba(10,16,30,.35)';disque(joy.bx,joy.by,R);cx.strokeStyle='rgba(243,212,138,.55)';cx.lineWidth=2;cx.beginPath();cx.arc(joy.bx,joy.by,R,0,TAU);cx.stroke();
    cx.fillStyle='rgba(243,212,138,.6)';disque(joy.bx+joy.vx*R,joy.by+joy.vy*R,R*0.42);}
  else if(etatJeu==='jeu'){const x=L+R+16,y=Hs-R-22;cx.strokeStyle='rgba(243,212,138,.22)';cx.lineWidth=2;cx.beginPath();cx.arc(x,y,R,0,TAU);cx.stroke();cx.fillStyle='rgba(243,212,138,.18)';disque(x,y,R*0.42);
    if(!joyVu){const p=(tReel%1);cx.strokeStyle=`rgba(255,210,58,${0.95*(1-p)})`;cx.lineWidth=3;cx.beginPath();cx.arc(x,y,R*0.42+p*18,0,TAU);cx.stroke();}}
}

/* ======================= dessiner une image ======================= */
function majCamera(dt){
  const tx=px(P.x)+inp.mx*46-Ws/2,ty=py(P.y,0)-34+inp.my*26-Hs*0.54;
  const cxT=SW<Ws?(SW-Ws)/2:clamp(tx,0,SW-Ws),cyT=SH<Hs?(SH-Hs)/2:clamp(ty,58,SH-Hs);
  const k=Math.min(1,dt*6);camX+=(cxT-camX)*k;camY+=(cyT-camY)*k;
}
function dessiner(dt){
  if(!fondPret){cx.setTransform(1,0,0,1,0,0);cx.fillStyle='#04060b';cx.fillRect(0,0,can.width,can.height);return;}
  majCamera(dt);
  const shx=(Math.random()-.5)*sec,shy=(Math.random()-.5)*sec,ox=Math.round((-camX+shx)*S),oy=Math.round((-camY+shy)*S);
  const PR=window.__prof,q0=PR?performance.now():0;
  cx.setTransform(1,0,0,1,0,0);
  if(SW<Ws+2||SH<Hs+2||sec>0||camY<0){cx.fillStyle='#030406';cx.fillRect(0,0,can.width,can.height);}
  /* le fond : on ne recopie que ce qu'on voit */
  { const F=Salle.fond,k=Salle.SB/S,sx=clamp(-ox*k,0,F.width),sy=clamp(-oy*k,0,F.height),sw=Math.min(F.width-sx,can.width*k),sh=Math.min(F.height-sy,can.height*k);
    if(sw>0&&sh>0)cx.drawImage(F,sx,sy,sw,sh,ox+sx/k,oy+sy/k,sw/k,sh/k); }
  cx.setTransform(S,0,0,S,ox,oy);
  const q1=PR?performance.now():0;
  dessinerFondVivant();
  const q2=PR?performance.now():0;
  dessinerSol();
  const q3=PR?performance.now():0;
  const liste=[];
  for(const o of OBS)if(!o.fond)liste.push([o.y+(o.c?0:o.d/2-0.01),0,o]);
  for(const g of G)if(g.etat!=='mort')liste.push([g.y,1,g]);
  for(const it of items)liste.push([it.y,2,it]);
  for(const l of loups)liste.push([l.y,3,l]);
  liste.push([P.y,4,P]);
  liste.sort((a,b)=>a[0]-b[0]);
  for(const [_,k,o] of liste){
    if(k===0){
      /* un grand obstacle devient transparent quand le Pisteur passe derrière */
      let a=1;if(o.haut){const dyH=o.h*ZH/(T*K),lw=(o.c?o.r:o.w/2);if(P.y<o.y&&P.y>o.y-dyH-0.4&&Math.abs(P.x-o.x)<lw+0.5)a=0.42;}
      if(visible(px(o.x),py(o.y)-o.h*ZH/2,(o.c?o.r:o.w/2)*T+o.h*ZH/2+60)){Salle.dessinerObstacle(cx,o,a);
        if(o.k==='pilier'){const X=px(o.x),Y=py(o.y,o.h)-14,f=Math.sin(tReel*10+o.x*3)*0.5+Math.sin(tReel*16+o.y)*0.5;if(!finesse)lueur(X,Y-10,84+f*7,'255,160,70',0.6+f*0.08);
          polyE([[X-13,Y],[X+13,Y],[X+6+f*3,Y-14],[X+f*5,Y-30-f*5],[X-6+f*2,Y-12]],'#ff9a30');polyE([[X-7,Y],[X+7,Y],[X-f*3,Y-17]],'#fff0b0');}
      }
    }else if(k===1)dessinerGolem(o);else if(k===2)dessinerItem(o);else if(k===3)dessinerLoup(o);else dessinerPisteur();
  }
  const q4=PR?performance.now():0;
  dessinerAir();dessinerParts();
  const q5=PR?performance.now():0;
  cx.setTransform(S,0,0,S,0,0);
  if(flashR>0){cx.globalAlpha=flashR*0.5;cx.fillStyle='#a01010';cx.fillRect(0,0,Ws,Hs);cx.globalAlpha=1;}
  if(flashB>0){cx.globalAlpha=flashB*0.6;cx.fillStyle='#fff6e0';cx.fillRect(0,0,Ws,Hs);cx.globalAlpha=1;}
  if(flashV>0){cx.globalAlpha=flashV*0.35;cx.fillStyle='#7a4fd6';cx.fillRect(0,0,Ws,Hs);cx.globalAlpha=1;}
  dessinerInterface();
  if(PR){const q6=performance.now(),d=[q1-q0,q2-q1,q3-q2,q4-q3,q5-q4,q6-q5];PR.n=(PR.n||0)+1;PR.s=PR.s||[0,0,0,0,0,0];d.forEach((v,i)=>PR.s[i]+=v);}
}
