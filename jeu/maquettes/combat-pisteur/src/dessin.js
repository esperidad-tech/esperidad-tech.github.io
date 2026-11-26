/* ======================= l'écran ======================= */
const can=$('jeu'),cx=can.getContext('2d',{alpha:false});
let S=1,Ws=900,Hs=410,camX=0,camY=0,insetG=0,insetD=0;
const FIN=[1.5e6,0.95e6,0.6e6,0.42e6];let finesse=-1,vitesseApp=0;try{const v=localStorage.getItem('pisteur5_finesse');if(v!=null)finesse=Math.min(3,+v||0);}catch(e){}
if(/[?&]finesse=(\d)/.test(location.search))finesse=Math.min(3,+RegExp.$1);
/* un appareil lent commence tout de suite avec une image moins fine (mesuré en comptant ce qu'il calcule en 40 ms) */
function mesurerAppareil(){const t0=performance.now();let n=0;while(performance.now()-t0<40){champ(13,10);n++;}vitesseApp=n;if(finesse<0)finesse=n<26?2:n<48?1:0;}
const sonde=document.createElement('div');sonde.style.cssText='position:fixed;left:0;top:0;width:1px;height:1px;visibility:hidden;padding-left:env(safe-area-inset-left);padding-right:env(safe-area-inset-right)';document.body.appendChild(sonde);
let fondPret=false,S0=0;
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
  Salle.preparer(S0,()=>{fondPret=true;});
  GS.regler(S0);
  GS.prevoir([['trotteur',GT.chien.sc],['danseur',GT.javelot.sc],['bouclier',GT.dalle.sc],['lanceur',GT.mortier.sc],['fonceur',GT.belier.sc,['gratte','charge','arme','frappe']],['soldat',GT.faucheur.sc],['cuirasse',GT.cuirasse.sc],['gros',GT.colosse.sc],['reparateur',GT.repare.sc]]);
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
/* une zone rouge : le contour (plus vif quand elle s'est figée), et dedans le remplissage qui dit quand le coup tombe */
function zoneRemplie(fondF,dedansF,fige){
  fondF();cx.fillStyle=RG+(fige?'.22)':'.14)');cx.fill();
  cx.strokeStyle=fige?((((tReel*14)|0)%2)?'rgba(255,226,190,.95)':RG+'1)'):RG+'.8)';cx.lineWidth=fige?2.6:1.8;cx.stroke();
  dedansF();cx.fillStyle=RG+'.36)';cx.fill();
}
function dessinerZone(z){
  const p=clamp(z.p,0,1);cx.lineJoin='round';
  if(z.k==='cercle'){zoneRemplie(()=>solEll(z.x,z.y,z.r),()=>solEll(z.x,z.y,z.r*p),z.fige);}
  else if(z.k==='cone'){
    const secteur=R=>{const pts=[[z.x,z.y]];for(let i=0;i<=16;i++){const a=z.a-z.h+2*z.h*i/16;pts.push([z.x+Math.cos(a)*R,z.y+Math.sin(a)*R]);}solPoly(pts);};
    zoneRemplie(()=>secteur(z.R),()=>secteur(z.R*p),z.fige);
  }else if(z.k==='demi'){
    /* l'onde du colosse : le rouge ne passe pas derrière les murs, on voit les poches où on est à l'abri */
    const n=z.lim?z.lim.length:25,secteur=k=>{const pts=[[z.x,z.y]];for(let i=0;i<n;i++){const a=z.a-Math.PI/2+Math.PI*i/(n-1),R=(z.lim?z.lim[i]:z.R)*k;pts.push([z.x+Math.cos(a)*R,z.y+Math.sin(a)*R]);}solPoly(pts);};
    zoneRemplie(()=>secteur(1),()=>secteur(p),z.fige);
  }else if(z.k==='anneau'){
    /* l'anneau du colosse : on est à l'abri tout contre lui, ou très loin */
    const X=px(z.x),Y=py(z.y,0),ann=(a,b)=>{cx.beginPath();cx.ellipse(X,Y,b*T,b*T*K,0,0,TAU);cx.moveTo(X+a*T,Y);cx.ellipse(X,Y,a*T,a*T*K,0,0,TAU,true);};
    zoneRemplie(()=>ann(z.r0,z.r1),()=>ann(z.r0,z.r0+(z.r1-z.r0)*p),z.fige);
  }else if(z.k==='croix'){
    /* la croix du colosse : quatre bras ; on est à l'abri en biais */
    const bras=L=>{cx.beginPath();for(const q of [0,Math.PI/2]){const r=solRect(z.x,z.y,z.a+q,-L,L,z.l);cx.moveTo(px(r[0][0]),py(r[0][1],0));for(let i=1;i<4;i++)cx.lineTo(px(r[i][0]),py(r[i][1],0));cx.closePath();}};
    zoneRemplie(()=>bras(z.L),()=>bras(Math.max(0.3,z.L*p)),z.fige);
  }else if(z.k==='fin'){
    const ex=z.x+Math.cos(z.a)*z.L,ey=z.y+Math.sin(z.a)*z.L;
    cx.strokeStyle=z.fige?((((tReel*22)|0)%2)?'rgba(255,236,200,.95)':RG+'1)'):RG+(0.4+p*0.45)+')';cx.lineWidth=z.fige?3.4:1.8;
    if(!z.fige)cx.setLineDash([7,6]);ligne(px(z.x),py(z.y,0),px(ex),py(ey,0));cx.setLineDash([]);
    cx.fillStyle=RG+'.85)';disque(px(ex),py(ey,0),z.fige?5:3.5);
  }else{
    const L0=0.25;zoneRemplie(()=>solPoly(solRect(z.x,z.y,z.a,L0,z.L,z.l)),()=>solPoly(solRect(z.x,z.y,z.a,L0,L0+(z.L-L0)*p,z.l)),z.fige);
    if(z.k==='fleche'){const c=Math.cos(z.a),s=Math.sin(z.a),tx=z.x+c*(z.L+0.45),ty=z.y+s*(z.L+0.45),bx=z.x+c*z.L,by=z.y+s*z.L,h=z.l*0.85;
      solPoly([[tx,ty],[bx+s*h,by-c*h],[bx-s*h,by+c*h]]);cx.fillStyle=RG+(0.45+p*0.5)+')';cx.fill();}
    if(z.k==='ligne'){cx.strokeStyle=RG+'.6)';cx.lineWidth=2;const c=Math.cos(z.a),s=Math.sin(z.a);
      for(let u=1.2;u<z.L-0.3;u+=1.3){const ux=z.x+c*u,uy=z.y+s*u,h=z.l*0.3;cx.beginPath();cx.moveTo(px(ux-c*0.35+s*h),py(uy-s*0.35-c*h,0));cx.lineTo(px(ux),py(uy,0));cx.lineTo(px(ux-c*0.35-s*h),py(uy-s*0.35+c*h,0));cx.stroke();}}
  }
}
/* à découvert : le regard d'un golem porte loin devant lui. Pas de trait, pas de bande : le sol est juste un peu éclairci,
   et la lueur s'efface au bout. Un mur la coupe. Elle n'est dessinée que pour un golem que le joueur a sous les yeux
   (les autres ne voient pas le Pisteur). */
function dessinerRegard(g,f){
  const m=margeEcran(g.x,g.y);if(m<=0)return;
  const k=f*Math.min(1,m/REG.vue.marge),c=g.T.cone,R=REG.vue.portee,n=22;
  cx.save();cx.translate(px(g.x),py(g.y,0));cx.scale(1,K);
  cx.beginPath();cx.moveTo(0,0);
  for(let i=0;i<=n;i++){const a=g.reg-c+2*c*i/n,L=porteeRegard(g.x,g.y,a,R)*T;cx.lineTo(Math.cos(a)*L,Math.sin(a)*L);}
  cx.closePath();
  const col=g.voit?'255,176,140':'255,240,208',al=(g.voit?0.24:0.16)*k;
  if(finesse<2){const gr=cx.createRadialGradient(0,0,g.r*T,0,0,R*T);gr.addColorStop(0,`rgba(${col},${al})`);gr.addColorStop(0.6,`rgba(${col},${al*0.55})`);gr.addColorStop(1,`rgba(${col},0)`);cx.fillStyle=gr;}
  else cx.fillStyle=`rgba(${col},${al*0.5})`;
  cx.fill();cx.restore();
}
/* ce que voit un golem quand le Pisteur est dans l'ombre : un éventail court, coupé par les murs. C'est lui qui fait foi. */
function eventail(g){
  const pts=[[g.x,g.y]],c=REG.ombre.cone,R=REG.ombre.portee;
  for(let i=0;i<=8;i++){const a=g.reg-c+2*c*i/8,L=Math.min(R,rayon(g.x,g.y,a,R,0.04));pts.push([g.x+Math.cos(a)*L,g.y+Math.sin(a)*L]);}
  return pts;
}
function dessinerSol(){
  for(const q of parts)if(q.k==='tas'){const a=Math.min(1,q.vie/0.6);cx.globalAlpha=a;cx.fillStyle='#262931';const X=px(q.x),Y=py(q.y,0);for(let i=0;i<6;i++){const s=q.s;ovale(X+Math.cos(i*2.1)*9*s,Y+Math.sin(i*2.1)*3*s,5*s,3*s);}cx.fillStyle='rgba(255,110,40,.7)';disque(X,Y-1,2*q.s);cx.globalAlpha=1;}
  /* la piste que flaire une meute en colère : les traces de pas du Pisteur, de la meute jusqu'à lui */
  if(nFlair>0&&phase==='vague'){
    let i0=1e9;for(const g of G)if(g.type==='chien'&&g.colere&&vivant(g)&&g.pi<i0)i0=g.pi;
    i0=Math.max(i0-pisteBase,piste.length-170,0);
    cx.fillStyle=P.fondu>0.5?'rgba(214,190,255,.6)':'rgba(255,196,120,.55)';
    for(let i=i0;i<piste.length;i++){const c=piste[i];ovale(px(c.x)+(i%2?3:-3),py(c.y,0),3.2,1.9);}
  }
  /* à découvert : le long regard des golems, en lueur douce */
  if(P.fondu<0.95&&phase==='vague'&&P.etat!=='aterre'){
    for(const g of G){if(vivant(g)&&g.sonne<=0&&!g.dort&&!g.penche&&g.vuMaint&&g.etat!=='roule'&&g.etat!=='ramasse'&&!g.enrage)dessinerRegard(g,1-P.fondu);}
  }
  /* dans l'ombre : les regards des golems se dessinent au sol, tout courts */
  if(P.fondu>0.05&&phase==='vague'){
    const f=P.fondu;
    for(const g of G){
      if(!vivant(g)||g.sonne>0||g.dort||g.penche||!g.vuMaint||g.etat==='roule'||g.etat==='ramasse'||g.enrage)continue;
      solPoly(eventail(g));
      if(P.capeT>0){cx.fillStyle=`rgba(255,224,138,${0.08*f})`;cx.fill();cx.strokeStyle=`rgba(255,224,138,${0.3*f})`;cx.lineWidth=1;cx.setLineDash([4,5]);cx.stroke();cx.setLineDash([]);continue;}     /* sous la cape, les regards ne peuvent rien */
      if(g.hes>0.02){cx.fillStyle=`rgba(255,150,40,${(0.2+g.hes*0.4)*f})`;cx.fill();cx.strokeStyle=`rgba(255,180,70,${(0.6+g.hes*0.4)*f})`;cx.lineWidth=2;}
      else{cx.fillStyle=`rgba(255,244,214,${0.17*f})`;cx.fill();cx.strokeStyle=`rgba(255,244,214,${0.55*f})`;cx.lineWidth=1.3;}
      cx.stroke();
    }
    /* le golem à portée de main (un cercle plein), celui que vise le saut d'ombre (des tirets) */
    const g=P.aPortee,h=P.cibleSO;
    if(g&&vivant(g)){cx.strokeStyle=`rgba(200,170,255,${0.75+0.25*Math.sin(tReel*9)})`;cx.lineWidth=3;solEll(g.x,g.y,g.r+0.32);cx.stroke();}
    if(h&&vivant(h)){cx.strokeStyle='rgba(200,170,255,.7)';cx.lineWidth=2;cx.setLineDash([6,5]);solEll(h.x,h.y,h.r+0.32);cx.stroke();cx.setLineDash([]);}
  }
  /* ce que les cartes dorées toucheraient, là, tout de suite : un fin cercle doré sous le golem (sa petite marque est dessinée au-dessus de lui) */
  for(const c of [P.cibles.fleche,P.cibles.sifflet]){if(!c||!vivant(c))continue;cx.strokeStyle='rgba(255,224,138,.55)';cx.lineWidth=1.6;cx.setLineDash([3,5]);solEll(c.x,c.y,c.r+0.46);cx.stroke();cx.setLineDash([]);}
  /* le coup de sifflet : là où le groupe est parti voir */
  for(const L of leurres){if(tReel>=L.t)continue;const p=(tReel*0.8)%1;cx.strokeStyle=`rgba(255,224,138,${0.8*(1-p)})`;cx.lineWidth=2;solEll(L.x,L.y,0.35+p*1.1);cx.stroke();
    cx.fillStyle='#ffe08a';cx.font='900 20px Nunito,sans-serif';cx.textAlign='center';cx.textBaseline='middle';cx.fillText('♪',px(L.x),py(L.y,0.5+0.15*Math.sin(tReel*5)));}
  for(const o of obus){const k=clamp(o.t/o.dur,0,1);zoneRemplie(()=>solEll(o.x1,o.y1,o.r),()=>solEll(o.x1,o.y1,o.r*k),true);}
  for(const g of G)if(g.zone)dessinerZone(g.zone);
  for(const g of G){if(g.balai&&tReel-g.balai.t<0.22&&vivant(g)){const a=1-(tReel-g.balai.t)/0.22,R=REG.faucheur.rayon,pts=[[g.x,g.y]];for(let i=0;i<=12;i++){const t=g.balai.a-Math.PI/2+Math.PI*i/12;pts.push([g.x+Math.cos(t)*R,g.y+Math.sin(t)*R]);}solPoly(pts);cx.fillStyle=`rgba(255,220,180,${0.55*a})`;cx.fill();}}
  for(const q of parts)if(q.k==='souffle'){
    const a=clamp(q.vie/q.max,0,1),n=q.lim.length,pts=[[q.x,q.y]];for(let i=0;i<n;i++){const t=q.a-Math.PI/2+Math.PI*i/(n-1);pts.push([q.x+Math.cos(t)*q.lim[i],q.y+Math.sin(t)*q.lim[i]]);}
    solPoly(pts);cx.fillStyle=`rgba(255,140,60,${0.6*a})`;cx.fill();cx.strokeStyle=`rgba(255,236,190,${a})`;cx.lineWidth=3;cx.stroke();
  }
}

/* ======================= le Pisteur ======================= */
function dirP(a){return ((Math.round((90-(a==null?P.fa:a)*180/Math.PI)/45)%8)+8)%8;}
function etoiles(X,Y,n,r){for(let i=0;i<n;i++){const a=tReel*4+i*TAU/n,x=X+Math.cos(a)*r,y=Y+Math.sin(a)*r*0.32;polyE([[x,y-4.5],[x+1.4,y-1.4],[x+4.5,y],[x+1.4,y+1.4],[x,y+4.5],[x-1.4,y+1.4],[x-4.5,y],[x-1.4,y-1.4]],'#ffd23a','#7a5a08');}}
function dessinerPisteur(){
  const X=px(P.x),Yg=py(P.y,0),Y=py(P.y,P.z),cs=Math.cos(P.fa),sn=Math.sin(P.fa),om=P.fondu>0.5;
  let d=dirP(),nom='garde',a=1;
  cx.fillStyle='rgba(0,0,0,.42)';ovale(X,Yg+1,13-P.z*5,5.5-P.z*2);
  if(P.ombre&&P.etat!=='aterre'){
    /* dans l'ombre : un halo violet (elle dure tant qu'on veut : plus d'anneau qui se vide) ; sous la cape d'ombre : un halo d'or */
    lueur(X,Y-26,P.capeT>0?74:62,P.capeT>0?'255,214,120':'170,130,255',0.8);
  }
  if(P.capeT>0&&P.etat!=='aterre'){
    /* la cape d'ombre : un anneau d'or qui se vide en dix secondes */
    const k=clamp(P.capeT/REG.cartes.cape.dur,0,1);
    cx.strokeStyle='rgba(50,34,8,.75)';cx.lineWidth=5.5;solEll(P.x,P.y,0.78);cx.stroke();
    cx.strokeStyle='#ffe08a';cx.lineWidth=3.2;cx.beginPath();cx.ellipse(X,Yg,0.78*T,0.78*T*K,0,-Math.PI/2,-Math.PI/2+TAU*k);cx.stroke();
  }
  if(P.etat==='bandage'){
    /* le bandage : un anneau vert se referme autour de ses pieds en trois secondes */
    const k=clamp(P.t/REG.bandage.dur,0,1);
    cx.strokeStyle='rgba(16,40,30,.75)';cx.lineWidth=5;solEll(P.x,P.y,0.6);cx.stroke();
    cx.strokeStyle='#9fe6c0';cx.lineWidth=3;cx.beginPath();cx.ellipse(X,Yg,0.6*T,0.6*T*K,0,-Math.PI/2,-Math.PI/2+TAU*k);cx.stroke();
  }
  switch(P.etat){
    case 'aterre':nom='chute';d=cs>=0?2:6;break;
    case 'plaque':nom='sol';d=cs>=0?2:6;break;
    case 'sonne':nom='sonne';break;
    case 'vol':case 'chaine':nom='saut';break;
    case 'saut':nom='a2';if(!om)lueur(X,Y-30,40,'200,220,255',0.4);break;
    case 'sautOmbre':nom='furtif';a=P.t<0.1?1-P.t/0.1:clamp((P.t-0.1)/0.12,0,1);break;
    case 'embuscade':case 'assomme':nom=P.t<0.15?'saut':'plante';break;
    case 'dague':{const r=P.rangCoup;nom=r===3?(P.t<0.07?'saut':P.t<0.45?'plante':'garde'):P.t<0.28?(r===1?'d1a':'d1b'):P.t<0.4?'fente':'garde';break;}
    case 'bandage':nom='furtif';break;
    default:
      if(tReel-P.tirT<0.3){nom='t3';break;}
      if(P.court){if(P.ombre)nom='a'+(Math.floor(P.pas/2.3*4)%4);else nom='c'+(Math.floor(P.pas/2.5*8)%8);}
      else nom=P.ombre?'furtif':'garde';
  }
  P.imgNom=nom;P.imgDir=d;
  if(!BLOQUE[P.etat]&&P.etat!=='sautOmbre'&&P.etat!=='bandage'){
    const c=P.ombre?'200,170,255':'91,224,230';cx.fillStyle=`rgba(${c},.6)`;
    solPoly([[P.x+cs*1.02,P.y+sn*1.02],[P.x+cs*0.72-sn*0.2,P.y+sn*0.72+cs*0.2],[P.x+cs*0.72+sn*0.2,P.y+sn*0.72-cs*0.2]]);cx.fill();
  }
  if(P.lentT>0){cx.strokeStyle='rgba(255,176,112,.9)';cx.lineWidth=2.5;cx.setLineDash([4,4]);solEll(P.x,P.y,0.5);cx.stroke();cx.setLineDash([]);}
  if(tReel-P.touchT<0.25&&((tReel*20)|0)%2)a*=0.5;
  if(!PS.dessiner(cx,nom,d,X,Y,a,om)){cx.fillStyle=om?'#1a1038':'#2f8050';ovale(X,Y-28,9,26);}
  if(om&&P.etat!=='aterre'){cx.globalCompositeOperation='lighter';PS.dessiner(cx,nom,d,X,Y,0.26+0.06*Math.sin(tReel*5),false);cx.globalCompositeOperation='source-over';}
  if(P.etat==='sonne'||P.etat==='plaque')etoiles(X,Y-(P.etat==='plaque'?30:70),3,13);
  if(P.saigne.length){cx.fillStyle='#ff3a2a';for(let i=0;i<Math.min(6,P.saigne.length);i++){const x=X-((Math.min(6,P.saigne.length)-1)*4)+i*8,y=Y-76;cx.beginPath();cx.moveTo(x,y-5);cx.quadraticCurveTo(x+4.5,y+2,x,y+4);cx.quadraticCurveTo(x-4.5,y+2,x,y-5);cx.fill();}}
}

/* ======================= les golems ======================= */
function poseGolem(g){
  let etat='marche',k=2,pied=0;const fr=tReel-g.tFrappe<0.28;
  switch(g.type){
    case 'chien':if(g.etat==='vise'||g.etat==='base')etat='arme';else if(g.etat==='plaque'||g.etat==='bondit'||fr)etat='frappe';break;
    case 'javelot':if(g.etat==='arme'||g.etat==='base')etat='arme';else if(fr)etat='frappe';break;
    case 'mortier':if(g.etat==='tire')etat='arme';else if(fr)etat='frappe';break;
    case 'belier':if(g.etat==='gratte')etat='gratte';else if(g.etat==='charge')etat='charge';else if(g.etat==='tete')etat='arme';else if(fr)etat='frappe';break;
    case 'dalle':if(g.etat==='leve'||g.etat==='base')etat='arme';else if(fr)etat='frappe';break;
    case 'faucheur':if(g.etat==='fauche'||g.etat==='base')etat='arme';else if(fr)etat='frappe';break;
    case 'cuirasse':if(g.etat==='base'||g.etat==='ramasse')etat='arme';else if(fr)etat='frappe';break;
    case 'colosse':if(g.etat==='zone')etat='arme';else if(g.etat==='chaine'||fr)etat='frappe';break;
    case 'repare':if(g.penche)etat=(Math.floor(tReel*3.2+g.id*5)%2)?'arme':'frappe';break;      /* penché sur un blessé : il tape du marteau */
  }
  if(etat==='marche'&&g.bouge){const i=Math.floor((((g.marche/g.T.pas)%1)+1)%1*8);pied=i<4?0:1;k=[0,2,3,4][i%4];}
  const c=Math.cos(g.fa);let yaw=c>0.38?1:c<-0.38?-1:(Math.sin(g.fa)>=0?0:(g.yaw||1));if(yaw)g.yaw=yaw;
  return {yaw,etat,k,pied,sansBouclier:g.type==='dalle'&&!g.aDalle};
}
/* la petite tête de mort : dans l'ombre, au-dessus de chaque golem qu'une embuscade tuerait d'un coup */
function teteDeMort(X,Y,s){
  cx.fillStyle='rgba(30,10,60,.85)';disque(X,Y,9.5*s);
  cx.fillStyle='#fff';cx.beginPath();cx.arc(X,Y-1.5*s,6.4*s,0,TAU);cx.fill();cx.fillRect(X-3.6*s,Y+2*s,7.2*s,4.6*s);
  cx.fillStyle='#2a1460';disque(X-2.5*s,Y-1.8*s,1.9*s);disque(X+2.5*s,Y-1.8*s,1.9*s);polyE([[X,Y+0.6*s],[X-1.2*s,Y+2.6*s],[X+1.2*s,Y+2.6*s]],'#2a1460');
  cx.fillRect(X-1.9*s,Y+4.2*s,0.9*s,2.4*s);cx.fillRect(X+1*s,Y+4.2*s,0.9*s,2.4*s);
}
function dessinerGolem(g){
  if(g.etat==='mort')return;
  /* le brouillard léger : derrière un pilier ou un grand mur, on ne voit plus qu'une silhouette pâle, là où on l'a vu en dernier */
  const d=hyp(g.x-P.x,g.y-P.y);
  const vu=g.etat==='entre'||d<2.6||vue(P.x,P.y,g.x,g.y,true);
  g.vuMaint=vu;
  if(vu){g.vx=g.x;g.vy=g.y;g.jamaisVu=false;}else if(g.jamaisVu)return;
  const gx=vu?g.x:g.vx,gy=vu?g.y:g.vy;
  let al=1;if(gy<Y0+0.3)al=clamp((gy-0.3)/1.2,0,1);if(al<=0)return;
  const X=px(gx),Yg=py(gy,0),Y=py(gy,vu?g.z:0),sc=g.T.sc,sp=GS.image(g.T.m,sc,poseGolem(g)),om=P.fondu;
  if(!vu){cx.globalAlpha=0.3;cx.drawImage(om>0.5?GS.ombre(sp):sp.c,X-sp.ox*sc,Y-sp.oy*sc,sp.w*sc,sp.h*sc);cx.globalAlpha=1;cx.fillStyle='rgba(200,210,255,.7)';cx.font='900 13px Nunito,sans-serif';cx.textAlign='center';cx.fillText('?',X,Y-g.T.h*ZH-6);return;}
  cx.globalAlpha=al;
  cx.fillStyle='rgba(0,0,0,.42)';ovale(X,Yg+1,g.r*T*1.05-g.z*6,g.r*T*0.4);
  const etale=g.etat==='etale'||g.dort,trem=(g.etat==='gratte'||g.etat==='tete'||g.etat==='ramasse'||(g.etat==='zone'&&g.t>0.6)||(g.etat==='base'&&g.type==='chien'))?rnd(-1.4,1.4):0;
  const dx=X-sp.ox*sc+trem,dy=etale?Y-sp.oy*sc*0.6:Y-sp.oy*sc,dw=sp.w*sc,dh=etale?sp.h*sc*0.6:sp.h*sc;
  let H=g.T.h*ZH;
  if(g.etat==='roule'){
    /* le cuirassé en boule : une bille d'acier dont les plaques tournent */
    const R=g.r*T*1.15,cy=Y-R,nuit=om>0.5;H=R*2;
    cx.fillStyle=nuit?'#5548a8':'#8d98a6';disque(X,cy,R);
    cx.save();cx.beginPath();cx.arc(X,cy,R,0,TAU);cx.clip();
    cx.fillStyle=nuit?'rgba(20,10,60,.4)':'rgba(20,26,36,.38)';ovale(X+R*0.25,cy+R*0.5,R*1.1,R*0.75);
    cx.translate(X,cy);cx.rotate(g.marche/g.r*(Math.cos(g.va)>=0?1:-1));
    cx.strokeStyle=nuit?'#221656':'#39424f';cx.lineWidth=2.4;
    for(let i=0;i<3;i++){cx.rotate(TAU/3);cx.beginPath();cx.moveTo(-R,0);cx.quadraticCurveTo(0,R*0.55,R,0);cx.stroke();}
    cx.fillStyle=nuit?'#c8b6ff':'#f3d48a';disque(0,0,R*0.16);
    cx.restore();
    cx.strokeStyle=nuit?'#1c1248':'#232a34';cx.lineWidth=2;cx.beginPath();cx.arc(X,cy,R,0,TAU);cx.stroke();
    cx.fillStyle='rgba(255,255,255,.38)';ovale(X-R*0.34,cy-R*0.4,R*0.26,R*0.14);
    if(g.flash>0.05){cx.fillStyle=`rgba(255,255,255,${g.flash*0.6})`;disque(X,cy,R);}
  }else{
    if(g.fantome)cx.globalAlpha=al*(0.3+0.08*Math.sin(tReel*5));        /* le faucheur fantôme : on le voit, on ne peut pas le toucher */
    if(om<1&&!g.fantome){cx.drawImage(sp.c,dx,dy,dw,dh);}
    if(om>0||g.fantome){if(!g.fantome)cx.globalAlpha=al*om;cx.drawImage(GS.ombre(sp),dx,dy,dw,dh);}
    cx.globalAlpha=al;
    if(g.flash>0.05){cx.globalCompositeOperation='lighter';cx.globalAlpha=al*g.flash*0.75;cx.drawImage(sp.c,dx,dy,dw,dh);cx.globalCompositeOperation='source-over';cx.globalAlpha=al;}
  }
  if(g.fantome){cx.globalAlpha=1;return;}                  /* ni barre de vie ni marque : rien à viser */
  if(g.type==='javelot'&&g.etat!=='recup'){
    const leve=g.etat==='arme'?12:0,c=Math.cos(g.fa),s=Math.sin(g.fa)*K,hx=X+c*4,hy=Y-H*0.62-leve;
    cx.lineCap='round';cx.strokeStyle='#0c0806';cx.lineWidth=4.6;ligne(hx-c*20,hy-s*20,hx+c*26,hy+s*26);cx.strokeStyle='#9a7040';cx.lineWidth=2.6;ligne(hx-c*20,hy-s*20,hx+c*26,hy+s*26);
    polyE([[hx+c*34,hy+s*34],[hx+c*24-s*4,hy+s*24+c*4],[hx+c*24+s*4,hy+s*24-c*4]],'#dfe8f2','#0c0806');
  }
  if(g.etat==='charge'){cx.strokeStyle='rgba(255,200,150,.5)';cx.lineWidth=2;const c=Math.cos(g.fa),s=Math.sin(g.fa)*K;for(let k=-1;k<=1;k++)ligne(X-c*26-s*k*10,Y-22-s*26+c*k*6,X-c*56-s*k*10,Y-22-s*56+c*k*6);}
  let yh=Y-H-8;
  if(g.sonne>0){etoiles(X,yh,3,13);yh-=12;}
  if(g.dort){
    /* endormi par la flèche : il ronfle (trois « z » qui montent) */
    H*=0.62;yh=Y-H-8;cx.textAlign='center';cx.textBaseline='middle';
    for(let i=0;i<3;i++){const u=((tReel*0.55+i/3)%1),s=9+u*9;cx.globalAlpha=al*(1-u)*0.95;cx.font='900 '+s+'px Nunito,sans-serif';cx.lineWidth=3;cx.strokeStyle='rgba(30,20,0,.8)';cx.strokeText('z',X+8+u*16,yh-u*30);cx.fillStyle='#ffe08a';cx.fillText('z',X+8+u*16,yh-u*30);}
    cx.globalAlpha=al;
  }
  /* sa barre de vie (toujours là dans l'ombre : on y lit qui est à portée d'embuscade) */
  if(g.hp<g.max||om>0.5||g.type==='colosse'){
    const w=g.type==='colosse'?84:g.max>=80?46:34,k=Math.max(0,g.hp/g.max);
    cx.fillStyle='rgba(0,0,0,.7)';cx.fillRect(X-w/2-1,yh-6,w+2,6);
    cx.fillStyle=g.T.armure?'#b9c8d8':g.hp<=REG.embuscade.dmg?'#c8a6ff':'#e0473a';cx.fillRect(X-w/2,yh-5,w*k,4);
    if(g.max>REG.embuscade.dmg){cx.fillStyle='rgba(255,255,255,.8)';cx.fillRect(X-w/2+w*REG.embuscade.dmg/g.max-0.5,yh-6,1,6);}
    yh-=10;
  }
  const couvert=gardeDe(g);
  if(couvert){
    /* le javelot couvert par son garde : un petit bouclier, pas de tête de mort */
    const s=1+0.06*Math.sin(tReel*7),y0=yh-10;
    polyE([[X-7*s,y0-8*s],[X+7*s,y0-8*s],[X+7*s,y0],[X,y0+8*s],[X-7*s,y0]],'#cfd8e6','#2a3140');cx.fillStyle='#5a6674';cx.fillRect(X-1,y0-6*s,2,10*s);yh-=22;
  }else if(P.ombre&&g.hp<=REG.embuscade.dmg){teteDeMort(X,yh-9,1+0.08*Math.sin(tReel*8));yh-=22;}
  if((g.colere||g.furie||g.boule||g.enrage||g.dechaine)&&!g.dort){
    /* en colère : une petite étoile rouge au-dessus de lui */
    const r=6+1.2*Math.sin(tReel*9+g.id*6),pts=[];for(let i=0;i<10;i++){const a=i*TAU/10-Math.PI/2,q=i%2?r*0.42:r;pts.push([X+Math.cos(a)*q,yh-8+Math.sin(a)*q]);}
    cx.lineWidth=1.4;polyE(pts,'#ff3a2a','#3a0806');yh-=17;
  }
  /* les marques dorées : le golem que la flèche et le sifflet toucheraient si on les jouait maintenant (dans l'ombre, tant que la carte est là) */
  {const mf=P.cibles.fleche===g,ms=P.cibles.sifflet===g;
    if(mf||ms){
      let x0=X-(mf&&ms?10:0);const y0=yh-12,p=1+0.07*Math.sin(tReel*6);
      for(const k of [mf?'f':'',ms?'s':'']){if(!k)continue;
        cx.fillStyle='rgba(30,22,6,.9)';disque(x0,y0,8.5*p);cx.strokeStyle='#ffd23a';cx.lineWidth=1.6;cx.beginPath();cx.arc(x0,y0,8.5*p,0,TAU);cx.stroke();
        if(k==='f'){cx.strokeStyle='#ffe08a';cx.lineWidth=1.8;cx.lineCap='round';ligne(x0-4,y0+4,x0+4,y0-4);ligne(x0+4,y0-4,x0+0.3,y0-3.6);ligne(x0+4,y0-4,x0+3.6,y0-0.3);}
        else{cx.fillStyle='#ffe08a';cx.font='900 12px Nunito,sans-serif';cx.textAlign='center';cx.textBaseline='middle';cx.fillText('♪',x0,y0+0.5);}
        x0+=20;}
      yh-=24;}}
  if(g.dort){cx.globalAlpha=1;return;}
  if(g.leurre&&tReel<g.leurre.t){cx.font='900 17px Nunito,sans-serif';cx.textAlign='center';cx.textBaseline='alphabetic';cx.lineWidth=3.5;cx.strokeStyle='#210';cx.strokeText('♪ ?',X,yh);cx.fillStyle='#ffe08a';cx.fillText('♪ ?',X,yh);cx.globalAlpha=1;return;}
  if(tReel<g.excl){const k=1-(g.excl-tReel)/0.8;cx.font='900 '+(22+8*Math.sin(Math.min(1,k*4)*Math.PI))+'px Nunito,sans-serif';cx.textAlign='center';cx.textBaseline='alphabetic';cx.lineWidth=4;cx.strokeStyle='#200';cx.strokeText('!',X,yh);cx.fillStyle='#ff4a3a';cx.fillText('!',X,yh);}
  else if(g.mode==='fouille'||(g.mode==='chasse'&&!g.voit&&g.reagit<=0)){cx.font='900 18px Nunito,sans-serif';cx.textAlign='center';cx.textBaseline='alphabetic';cx.lineWidth=3.5;cx.strokeStyle='#210';cx.strokeText('?',X,yh);cx.fillStyle='#ffd23a';cx.fillText('?',X,yh);}
  cx.globalAlpha=1;
}

/* ======================= ce qui vole, les lames, les particules ======================= */
function dessinerAir(){
  cx.lineCap='round';
  /* le réparateur penché sur un blessé : un fil d'étincelles vertes, et l'anneau qui se referme sur le blessé (trois secondes) */
  for(const g of G){
    const o=g.soin;if(!g.penche||!o||!vivant(g)||!vivant(o))continue;
    const ax=px(g.x),ay=py(g.y,0.75),bx=px(o.x),by=py(o.y,o.T.h*0.45),n=6;
    cx.strokeStyle='rgba(120,255,170,.85)';cx.lineWidth=2;cx.beginPath();cx.moveTo(ax,ay);
    for(let i=1;i<n;i++){const u=i/n,w=Math.sin(tReel*22+i*1.9+g.id*9)*5;cx.lineTo(lerp(ax,bx,u)+w*0.5,lerp(ay,by,u)+w);}
    cx.lineTo(bx,by);cx.stroke();
    const k=clamp(g.soinT/REG.repare.T,0,1);cx.strokeStyle='rgba(10,40,24,.7)';cx.lineWidth=5;solEll(o.x,o.y,o.r+0.3);cx.stroke();
    cx.strokeStyle='#7dffaf';cx.lineWidth=3;cx.beginPath();cx.ellipse(px(o.x),py(o.y,0),(o.r+0.3)*T,(o.r+0.3)*T*K,0,-Math.PI/2,-Math.PI/2+TAU*k);cx.stroke();
  }
  /* la chaîne du colosse */
  for(const g of G){
    if(g.etat!=='chaine'||!vivant(g))continue;
    const C=REG.colosse,k=g.accroche?1:clamp(g.t/C.chaineT[0],0,1),ax=px(g.x),ay=py(g.y,1.5),bx=lerp(ax,px(P.x),k),by=lerp(ay,py(P.y,0.8),k);
    cx.strokeStyle='#14100c';cx.lineWidth=6;ligne(ax,ay,bx,by);cx.strokeStyle='#b9a27a';cx.lineWidth=3;cx.setLineDash([7,5]);ligne(ax,ay,bx,by);cx.setLineDash([]);
    cx.fillStyle='#e8d9b0';disque(bx,by,4.5);
  }
  for(const j of javs){const X=px(j.x),Y=py(j.y,0.85),bx=px(j.x-Math.cos(j.a)*1.3),by=py(j.y-Math.sin(j.a)*1.3,0.85);
    cx.fillStyle='rgba(0,0,0,.25)';ovale(X,py(j.y,0),5,2);cx.strokeStyle='rgba(255,60,40,.4)';cx.lineWidth=7;ligne(bx,by,X,Y);
    cx.strokeStyle='#0c0806';cx.lineWidth=4.6;ligne(bx,by,X,Y);cx.strokeStyle='#9a7040';cx.lineWidth=2.8;ligne(bx,by,X,Y);cx.fillStyle='#dfe8f2';disque(X,Y,3.2);}
  for(const o of obus){const k=clamp(o.t/o.dur,0,1),x=lerp(o.x0,o.x1,k),y=lerp(o.y0,o.y1,k),z=1.2+Math.sin(Math.PI*k)*5.5-k*1.2;
    cx.fillStyle='rgba(0,0,0,.3)';ovale(px(x),py(y,0),6*k+2,3*k+1);lueur(px(x),py(y,z),22,'255,110,40',0.9);cx.fillStyle='#22252c';disque(px(x),py(y,z),6);cx.fillStyle='#ffb060';disque(px(x)-1.5,py(y,z)-1.5,2);}
  const sl=P.slash;
  if(sl&&tReel-sl.t<0.2){
    /* la dague : un arc de lumière ; la dague circulaire : un tour complet */
    const a=1-(tReel-sl.t)/0.2,r0=0.5,r1=sl.tour?2.1:(sl.der?1.9:1.55),sens=sl.n%2?1:-1,ouv=sl.tour?Math.PI:1.15,n=sl.tour?28:12;
    const av=Math.min(1,(tReel-sl.t)/(sl.tour?0.12:0.07)+0.3),a0=sl.a-ouv*sens,a1=sl.a-ouv*sens+2*ouv*sens*av;
    cx.beginPath();for(let i=0;i<=n;i++){const t=a0+(a1-a0)*i/n,rr=r1*(0.86+0.14*i/n);const X=px(P.x+Math.cos(t)*rr),Y=py(P.y+Math.sin(t)*rr,0.6);i?cx.lineTo(X,Y):cx.moveTo(X,Y);}
    for(let i=n;i>=0;i--){const t=a0+(a1-a0)*i/n,rr=lerp(r1*0.86,r0,0.25+0.75*(1-i/n)*0.6);cx.lineTo(px(P.x+Math.cos(t)*rr),py(P.y+Math.sin(t)*rr,0.6));}
    cx.closePath();cx.fillStyle=sl.v?`rgba(214,196,255,${0.6*a})`:sl.der&&!sl.tour?`rgba(255,236,170,${0.6*a})`:`rgba(216,246,250,${0.55*a})`;cx.fill();
    cx.strokeStyle=`rgba(255,255,255,${0.95*a})`;cx.lineWidth=sl.der?3.2:2.2;cx.beginPath();for(let i=0;i<=n;i++){const t=a0+(a1-a0)*i/n,rr=r1*(0.86+0.14*i/n);const X=px(P.x+Math.cos(t)*rr),Y=py(P.y+Math.sin(t)*rr,0.6);i?cx.lineTo(X,Y):cx.moveTo(X,Y);}cx.stroke();
  }
}
function dessinerParts(){
  for(const q of parts){
    const a=clamp(q.vie/q.max,0,1),X=px(q.x)+(q.ox||0),Y=py(q.y,q.z||0)+(q.oy||0);
    switch(q.k){
      case 'fant':if(P.imgNom)PS.dessiner(cx,P.imgNom,P.imgDir,X,Y,a*0.4,P.fondu>0.5);break;
      case 'e':cx.globalAlpha=a;cx.fillStyle=q.c;cx.fillRect(X-1.6,Y-1.6,3.2,3.2);cx.globalAlpha=1;break;
      case 'cr':cx.globalAlpha=a;polyE([[X,Y-q.s],[X+q.s*0.6,Y],[X,Y+q.s],[X-q.s*0.6,Y]],'#ff7a4a');cx.globalAlpha=1;break;
      case 'p':cx.fillStyle=`rgba(150,150,160,${a*0.35})`;disque(X,Y,q.s*(1.4-a*0.4));break;
      case 'o':cx.fillStyle=`rgba(150,110,230,${a*0.5})`;disque(X,Y,q.s*(1.5-a*0.5));break;
      case 'c':cx.globalAlpha=Math.min(1,a*2);cx.save();cx.translate(X,Y);cx.rotate(q.r);cx.fillStyle=q.c;cx.fillRect(-q.s/2,-q.s/2,q.s,q.s*0.8);cx.fillStyle='rgba(255,255,255,.18)';cx.fillRect(-q.s/2,-q.s/2,q.s,1.5);cx.restore();cx.globalAlpha=1;break;
      case 'onde':cx.strokeStyle=`rgba(255,240,210,${a})`;cx.lineWidth=3;cx.beginPath();cx.ellipse(X,Y,(1-a)*40*q.s+6,(1-a)*28*q.s+4,0,0,TAU);cx.stroke();break;
      case 'cri':{   /* un golem blessé crie : des ondes qui s'écartent, jusqu'où le cri porte */
        cx.strokeStyle=`rgba(255,210,58,${a*0.8})`;cx.lineWidth=2.2;const R=(1-a)*REG.cri;
        for(const k of [1,0.72])if(R*k>0.3){cx.beginPath();cx.ellipse(px(q.x),py(q.y,0),R*k*T,R*k*T*K,0,0,TAU);cx.stroke();}
        break;}
      case 'trait':{   /* la flèche qui endort : un trait d'or, du Pisteur au golem */
        const u=1-a,x0=lerp(px(q.x),px(q.x1),Math.max(0,u*1.6-0.6)),y0=lerp(py(q.y,q.z),py(q.y1,0.8),Math.max(0,u*1.6-0.6)),x1=lerp(px(q.x),px(q.x1),Math.min(1,u*1.6)),y1=lerp(py(q.y,q.z),py(q.y1,0.8),Math.min(1,u*1.6));
        cx.strokeStyle='rgba(60,40,0,.8)';cx.lineWidth=4.5;ligne(x0,y0,x1,y1);cx.strokeStyle='#ffe08a';cx.lineWidth=2.4;ligne(x0,y0,x1,y1);break;}
      case 'note':cx.globalAlpha=Math.min(1,a*2);cx.fillStyle='#ffe08a';cx.font='900 26px Nunito,sans-serif';cx.textAlign='center';cx.textBaseline='middle';cx.fillText('♪',X+Math.sin(tReel*6)*6,Y-(1-a)*46);cx.globalAlpha=1;break;
      case 't':cx.globalAlpha=Math.min(1,a*2);cx.font='900 15px Nunito,sans-serif';cx.textAlign='center';cx.textBaseline='middle';cx.lineWidth=4;cx.strokeStyle='rgba(0,0,0,.78)';cx.strokeText(q.t,X,Y);cx.fillStyle=q.c;cx.fillText(q.t,X,Y);cx.globalAlpha=1;break;
    }
  }
}
function visible(X,Y,m){return X>camX-m&&X<camX+Ws+m&&Y>camY-m&&Y<camY+Hs+m;}
/* une flamme : trois gouttes emboîtées qui dansent, quelques étincelles qui montent (violette quand le Pisteur est dans l'ombre) */
function flamme(X,Y,s,ph,violet){
  const t=tReel,w=Math.sin(t*9.3+ph)*0.55+Math.sin(t*15.1+ph*1.7)*0.45,h=1+0.12*Math.sin(t*6.1+ph*2.3)+0.06*w;
  const C=violet?['#3a2aa8','#7a6cff','#b9b0ff','#f0ecff']:['#b8300a','#ff7a1c','#ffb62e','#fff3c4'];
  const goutte=(k,dy)=>{const H=s*2.1*h*k,wd=s*0.62*k,dx=w*s*0.2*k;
    cx.beginPath();cx.moveTo(X-wd,Y+dy);cx.bezierCurveTo(X-wd*1.25,Y+dy-H*0.42,X+dx*0.5-wd*0.2,Y+dy-H*0.62,X+dx,Y+dy-H);
    cx.bezierCurveTo(X+dx*0.5+wd*0.35,Y+dy-H*0.6,X+wd*1.25,Y+dy-H*0.4,X+wd,Y+dy);cx.quadraticCurveTo(X,Y+dy+wd*0.55,X-wd,Y+dy);cx.closePath();};
  cx.fillStyle=C[0];goutte(1.14,1);cx.fill();cx.fillStyle=C[1];goutte(1,0);cx.fill();cx.fillStyle=C[2];goutte(0.66,0);cx.fill();cx.fillStyle=C[3];goutte(0.36,0);cx.fill();
  if(finesse<2){cx.fillStyle=C[2];for(let i=0;i<3;i++){const u=(t*0.55+i*0.37+ph*0.13)%1;cx.globalAlpha=(1-u)*0.9;cx.fillRect(X+Math.sin(t*2.3+i*2.1+ph)*s*0.7*u+w*s*0.2,Y-s*1.6-u*s*3.2,1.7,1.7);}cx.globalAlpha=1;}
}
/* la poussière qui flotte dans les deux rayons de lune (seulement quand l'image est fine, et à découvert) */
const RAYONS=[[3.2,11.6,7.6,3.4],[17.2,5.4,7.4,3.6]];
function dessinerPoussieres(){
  if(finesse||P.fondu>0.5)return;
  cx.fillStyle='#dfe8ff';
  for(let r=0;r<2;r++){const [x0,y0,w,h]=RAYONS[r];
    for(let i=0;i<16;i++){
      const s=i*12.9898+r*78.233,u=(Math.sin(s)*43758.5453)%1,v=(Math.sin(s*1.7)*24634.6345)%1,ph=i*1.31+r*2.1;
      const x=x0+((Math.abs(u)+tReel*0.012*(1+i%3))%1)*w,y=y0+Math.abs(v)*h+Math.sin(tReel*0.31+ph)*0.25,z=0.5+((i*0.37+tReel*0.035)%1)*2.2;
      const X=px(x),Y=py(y,z);if(!visible(X,Y,8))continue;
      cx.globalAlpha=0.16+0.2*(0.5+0.5*Math.sin(tReel*1.3+ph*3));cx.fillRect(X,Y,i%4?1.5:2.2,i%4?1.5:2.2);
    }}
  cx.globalAlpha=1;
}
function dessinerFondVivant(){
  const om=P.fondu,vio=om>0.5;
  /* les torches du mur : leur halo, leur flamme */
  for(const t of Salle.TORCHES){
    const X=px(t.x),Y=py(t.y,t.z);if(!visible(X,Y,90))continue;
    const f=Math.sin(tReel*11+t.x*3)*0.5+Math.sin(tReel*17+t.x)*0.5;
    if(!finesse)lueur(X,Y-10,74+f*6,vio?'150,130,255':'255,160,70',0.5+f*0.08);
    flamme(X,Y+1,7.5,t.x*3,vio);
  }
  /* les deux lanternes des murs de côté : seulement leur halo, qui tremble */
  if(!finesse)for(const t of Salle.LAMPES){
    const X=px(t.x),Y=py(t.y,t.z);if(!visible(X,Y,90))continue;
    const f=Math.sin(tReel*8+t.y*3)*0.5+Math.sin(tReel*13+t.y)*0.5;lueur(X,Y,46+f*4,vio?'150,130,255':'255,170,80',0.42+f*0.08);
  }
  /* les deux portes des renforts : l'œil s'allume (ils arrivent), puis les battants s'ouvrent */
  for(let i=0;i<2;i++){
    const al=alerte[i],ou=Math.min(1,porte[i]*2.4);if(!(al>0.01||ou>0.01))continue;
    const q=Salle.portes[i];if(!q||!visible(px(q.dx),py(Y0,1.6),260))continue;
    const bat=0.8+0.2*Math.sin(tReel*10);
    Salle.dessinerPorte(cx,i,al*bat,ou,om);
    if(!finesse&&al>0.01)lueur(px(q.dx),py(Y0,3.25),95+bat*26,'255,96,40',0.42*al*bat);
  }
}

/* ======================= l'interface dessinée ======================= */
let joyVu=false,bandes=null;
const joyR=()=>Hs*0.13;
function dessinerInterface(){
  const L=14+insetG;
  if(!bandes){bandes={};for(const [n,c] of [['v','150,110,255'],['n','0,0,0']]){const b=document.createElement('canvas');b.width=4;b.height=48;const g=b.getContext('2d'),r=g.createLinearGradient(0,0,0,48);r.addColorStop(0,`rgba(${c},${n==='v'?0.55:0.6})`);r.addColorStop(1,`rgba(${c},0)`);g.fillStyle=r;g.fillRect(0,0,4,48);bandes[n]=b;}}
  if(finesse<2)cx.drawImage(bandes.n,0,0,Ws,54);
  /* dans l'ombre : les bords de l'écran se teintent de violet */
  if(P.fondu>0&&etatJeu==='jeu'){cx.globalAlpha=P.fondu;cx.drawImage(bandes.v,0,0,Ws,34);cx.save();cx.translate(0,Hs);cx.scale(1,-1);cx.drawImage(bandes.v,0,0,Ws,34);cx.restore();cx.globalAlpha=1;}
  /* la barre de vie : cent points pour tout le combat ; à côté, les bandages qui restent */
  { const w=190,h=13,x=L,y=11,k=clamp(P.hp/P.max,0,1);
    cx.fillStyle='rgba(0,0,0,.6)';cx.fillRect(x-2,y-2,w+4,h+4);
    cx.fillStyle='#3a1210';cx.fillRect(x,y,w,h);
    cx.fillStyle=k>0.5?'#58c46a':k>0.25?'#f0b030':'#e0473a';cx.fillRect(x,y,w*k,h);
    cx.fillStyle='rgba(255,255,255,.22)';cx.fillRect(x,y,w*k,3);
    cx.strokeStyle='rgba(243,212,138,.7)';cx.lineWidth=1.2;cx.strokeRect(x-1.5,y-1.5,w+3,h+3);
    cx.font='900 11px Nunito,sans-serif';cx.textAlign='center';cx.textBaseline='middle';cx.lineWidth=3;cx.strokeStyle='rgba(0,0,0,.7)';cx.strokeText(Math.ceil(P.hp)+' / '+P.max,x+w/2,y+h/2+0.5);cx.fillStyle='#fff';cx.fillText(Math.ceil(P.hp)+' / '+P.max,x+w/2,y+h/2+0.5);
    const nbB=REG.bandage.nb;
    for(let i=0;i<nbB;i++){
      const bx=x+w+12+i*15,plein=i<P.bandages;
      cx.fillStyle=plein?'#f1e7d0':'rgba(241,231,208,.13)';cx.fillRect(bx,y,11,h);
      if(plein){cx.fillStyle='#d8473a';cx.fillRect(bx+4.5,y+2.5,2,h-5);cx.fillRect(bx+2.5,y+h/2-1,6,2);}
      else{cx.strokeStyle='rgba(241,231,208,.3)';cx.lineWidth=1;cx.strokeRect(bx+0.5,y+0.5,10,h-1);}
    }
    /* il saigne : une goutte rouge par morsure (rien à lire) */
    for(let i=0;i<P.saigne.length&&i<6;i++){const gx=x+w+22+nbB*15+i*11,gy=y+h/2+1.5;cx.fillStyle='#ff4a3a';disque(gx,gy,3.6);polyE([[gx-3.1,gy-1.6],[gx,gy-8],[gx+3.1,gy-1.6]],'#ff4a3a',null);}
  }
  cx.font='800 12px Nunito,sans-serif';cx.textAlign='left';cx.textBaseline='top';
  if(etatJeu==='jeu'&&!demo&&!essai){
    /* le numéro de la vague, et un seul signe, sans un mot : un œil rouge quand un golem le voit, un rond vert sinon, une demi-lune violette dans l'ombre */
    cx.fillStyle='rgba(241,231,208,.85)';cx.fillText(`Vague ${vague+1} / ${VAGUES.length}`,L,32);
    if(phase==='vague'){cx.font='900 15px Nunito,sans-serif';cx.fillStyle=P.ombre?'#c8b6ff':nVoient>0?'#ff7a6a':'#9fe6c0';cx.fillText(P.ombre?'◐':nVoient>0?'◉':'○',L+88,30);}
  }
  cx.textAlign='center';cx.textBaseline='middle';
  if(bandeau&&tReel-bandeau.t<2.8){const t=tReel-bandeau.t,a=t<0.3?t/0.3:t>2.2?Math.max(0,(2.8-t)/0.6):1;cx.globalAlpha=a;
    cx.fillStyle='rgba(4,7,14,.6)';cx.fillRect(Ws/2-130,Hs*0.36-24,260,48);cx.fillStyle='#f3d48a';cx.font='700 24px Cinzel,Georgia,serif';cx.fillText(bandeau.a,Ws/2,Hs*0.36);cx.globalAlpha=1;}
  /* les golems hors de l'écran */
  for(const g of G){
    if(!vivant(g)||!g.vuMaint)continue;
    const sx=px(g.x)-camX,sy=py(g.y,g.T.h*0.5)-camY;
    if(sx>-6&&sx<Ws+6&&sy>-6&&sy<Hs+6)continue;
    const dx=sx-Ws/2,dy=sy-Hs/2,m=26,k=Math.min((Ws/2-m-insetD)/Math.abs(dx||1e-3),(Hs/2-m)/Math.abs(dy||1e-3)),ex=Ws/2+dx*k,ey=Hs/2+dy*k,a=Math.atan2(dy,dx);
    const dang=!!g.zone,s=dang?13+3*Math.sin(tReel*14):9;
    cx.save();cx.translate(ex,ey);cx.rotate(a);polyE([[s,0],[-s*0.7,-s*0.75],[-s*0.4,0],[-s*0.7,s*0.75]],dang?'#ff4a3a':g.voit?'rgba(224,71,58,.9)':'rgba(255,244,214,.75)','rgba(0,0,0,.5)');cx.restore();
  }
  /* le pouce gauche */
  const R=joyR();
  if(joy.id!==null){cx.fillStyle='rgba(10,16,30,.35)';disque(joy.bx,joy.by,R);cx.strokeStyle='rgba(243,212,138,.55)';cx.lineWidth=2;cx.beginPath();cx.arc(joy.bx,joy.by,R,0,TAU);cx.stroke();
    cx.fillStyle='rgba(243,212,138,.6)';disque(joy.bx+joy.vx*R,joy.by+joy.vy*R,R*0.42);}
  else if(demo){
    /* l'extrait : la manette bouge toute seule, un doigt blanc posé dessus */
    const x=L+R+16,y=Hs-R-22,n=hyp(robot.mx,robot.my),dx=robot.mx*R*0.85,dy=robot.my*R*0.85;
    cx.fillStyle='rgba(10,16,30,.35)';disque(x,y,R);cx.strokeStyle='rgba(243,212,138,.55)';cx.lineWidth=2;cx.beginPath();cx.arc(x,y,R,0,TAU);cx.stroke();
    cx.fillStyle='rgba(243,212,138,.6)';disque(x+dx,y+dy,R*0.42);
    if(n>0.05){cx.fillStyle='rgba(255,255,255,.3)';disque(x+dx,y+dy,R*0.5);cx.strokeStyle='rgba(255,255,255,.9)';cx.lineWidth=3;cx.beginPath();cx.arc(x+dx,y+dy,R*0.5,0,TAU);cx.stroke();}
  }
  else if(etatJeu==='jeu'){const x=L+R+16,y=Hs-R-22;cx.strokeStyle='rgba(243,212,138,.22)';cx.lineWidth=2;cx.beginPath();cx.arc(x,y,R,0,TAU);cx.stroke();cx.fillStyle='rgba(243,212,138,.18)';disque(x,y,R*0.42);
    if(!joyVu){const p=(tReel%1);cx.strokeStyle=`rgba(255,210,58,${0.95*(1-p)})`;cx.lineWidth=3;cx.beginPath();cx.arc(x,y,R*0.42+p*18,0,TAU);cx.stroke();}}
}

/* ======================= dessiner une image ======================= */
function majCamera(dt){
  const tx=px(P.x)+inp.mx*46-Ws/2,ty=py(P.y,0)-34+inp.my*26-Hs*0.54;
  const cxT=SW<Ws?(SW-Ws)/2:clamp(tx,0,SW-Ws),cyT=SH<Hs?(SH-Hs)/2:clamp(ty,58,SH-Hs);
  const k=Math.min(1,dt*6);camX+=(cxT-camX)*k;camY+=(cyT-camY)*k;
}
/* le fond : on ne recopie que ce qu'on voit */
function poserFond(F,SF,ox,oy,a){
  const k=SF/S,sx=clamp(-ox*k,0,F.width),sy=clamp(-oy*k,0,F.height),sw=Math.min(F.width-sx,can.width*k),sh=Math.min(F.height-sy,can.height*k);
  if(sw>0&&sh>0){if(a<1)cx.globalAlpha=a;cx.drawImage(F,sx,sy,sw,sh,ox+sx/k,oy+sy/k,sw/k,sh/k);cx.globalAlpha=1;}
}
function dessiner(dt){
  if(!fondPret){cx.setTransform(1,0,0,1,0,0);cx.fillStyle='#04060b';cx.fillRect(0,0,can.width,can.height);return;}
  majCamera(dt);
  const shx=(Math.random()-.5)*sec,shy=(Math.random()-.5)*sec,ox=Math.round((-camX+shx)*S),oy=Math.round((-camY+shy)*S);
  const PR=window.__prof,q0=PR?performance.now():0,om=P.fondu;
  cx.setTransform(1,0,0,1,0,0);
  if(SW<Ws+2||SH<Hs+2||sec>0||camY<0){cx.fillStyle='#030406';cx.fillRect(0,0,can.width,can.height);}
  /* deux mondes qu'on ne peut pas confondre : la salle à découvert, et la même, sombre et bleu-violet, quand le Pisteur est dans l'ombre */
  if(om<1)poserFond(Salle.fond,Salle.SB,ox,oy,1);
  if(om>0)poserFond(Salle.fondO,Salle.SO,ox,oy,om);
  cx.setTransform(S,0,0,S,ox,oy);
  const q1=PR?performance.now():0;
  dessinerFondVivant();
  const q2=PR?performance.now():0;
  dessinerSol();
  const q3=PR?performance.now():0;
  const liste=[];
  for(const o of OBS)if(!o.fond)liste.push([o.y+(o.c?0:o.d/2-0.01),0,o]);
  for(const g of G)if(g.etat!=='mort')liste.push([g.y,1,g]);
  liste.push([P.y,4,P]);
  liste.sort((a,b)=>a[0]-b[0]);
  for(const [_,k,o] of liste){
    if(k===0){
      /* un grand obstacle devient transparent quand le Pisteur passe derrière */
      let a=1;if(o.haut){const dyH=o.h*ZH/(T*K),lw=(o.c?o.r:o.w/2);if(P.y<o.y&&P.y>o.y-dyH-0.4&&Math.abs(P.x-o.x)<lw+0.5)a=0.42;}
      if(visible(px(o.x),py(o.y)-o.h*ZH/2,(o.c?o.r:o.w/2)*T+o.h*ZH/2+60)){Salle.dessinerObstacle(cx,o,a,om);
        if(o.k==='pilier'){const X=px(o.x),Y=py(o.y,o.h)-10,f=Math.sin(tReel*10+o.x*3)*0.5+Math.sin(tReel*16+o.y)*0.5;if(!finesse)lueur(X,Y-14,92+f*8,om>0.5?'150,130,255':'255,160,70',(0.55+f*0.08)*a);
          if(a<1)cx.globalAlpha=Math.max(a,0.6);flamme(X,Y,20,o.x*2+o.y,om>0.5);cx.globalAlpha=1;}
      }
    }else if(k===1)dessinerGolem(o);else dessinerPisteur();
  }
  const q4=PR?performance.now():0;
  dessinerPoussieres();dessinerAir();dessinerParts();
  const q5=PR?performance.now():0;
  cx.setTransform(S,0,0,S,0,0);
  if(flashR>0){cx.globalAlpha=flashR*0.5;cx.fillStyle='#a01010';cx.fillRect(0,0,Ws,Hs);cx.globalAlpha=1;}
  if(flashB>0){cx.globalAlpha=flashB*0.6;cx.fillStyle='#fff6e0';cx.fillRect(0,0,Ws,Hs);cx.globalAlpha=1;}
  if(flashV>0){cx.globalAlpha=flashV*0.35;cx.fillStyle='#7a4fd6';cx.fillRect(0,0,Ws,Hs);cx.globalAlpha=1;}
  dessinerInterface();
  if(PR){const q6=performance.now(),d=[q1-q0,q2-q1,q3-q2,q4-q3,q5-q4,q6-q5];PR.n=(PR.n||0)+1;PR.s=PR.s||[0,0,0,0,0,0];d.forEach((v,i)=>PR.s[i]+=v);}
}
