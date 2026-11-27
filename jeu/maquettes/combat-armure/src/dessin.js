/* ======================= dessiner une image du combat =======================
   1. le fond rendu en volume (decor3d/), recopié tel quel ; 2. le sol qui vit (les annonces des coups : fissures, ombres, feu, givre,
   lignes d'énergie, anneaux, crevasses) ; 3. tout ce qui est debout, du fond vers nous (rochers, lanternes, armure, réparateurs,
   le héros) ; 4. ce qui vole et brille (les sorts, le rayon, les étincelles) ; 5. les barres et le pouce, par-dessus. */
const Decor=(()=>{
  const D=window.DECOR;let fondImg=null,fond=null,fondS=0,atlas=null,portes=[],pret=false;
  const img=src=>new Promise(r=>{const i=new Image();i.onload=()=>r(i);i.onerror=()=>r(null);i.src=src;});
  async function preparer(cb){
    const L=await Promise.all([img(D.fond),img(D.atlas),img(D.masque)].concat(D.portes.map(q=>img(q.img))));
    fondImg=L[0];const a=L[1],m=L[2];portes=L.slice(3);
    atlas=document.createElement('canvas');atlas.width=a.width;atlas.height=a.height;const x=atlas.getContext('2d');x.drawImage(m,0,0);x.globalCompositeOperation='source-in';x.drawImage(a,0,0);
    adapter(Sc);pret=true;if(cb)cb();
  }
  /* le fond, mis une fois à la taille de l'écran (sur une vieille tablette, une copie 1 pour 1 coûte bien moins cher) */
  function adapter(s){if(!fondImg)return;fond=document.createElement('canvas');fond.width=Math.ceil(SW*s);fond.height=Math.ceil(SH*s);const x=fond.getContext('2d');x.imageSmoothingQuality='high';x.drawImage(fondImg,0,0,fond.width,fond.height);fondS=s;}
  function poserFond(ox,oy){
    if(Math.abs(fondS-Sc)>1e-3)adapter(Sc);
    const sx=clamp(-ox,0,fond.width),sy=clamp(-oy,0,fond.height),sw=Math.min(fond.width-sx,can.width),sh=Math.min(fond.height-sy,can.height);
    if(sw>0&&sh>0)cx.drawImage(fond,sx,sy,sw,sh,ox+sx,oy+sy,sw,sh);
  }
  function lanterne(c,i){const o=D.obs[i];if(o)c.drawImage(atlas,o.ax,o.ay,o.aw,o.ah,o.px,o.py,o.w,o.h);}
  function roc(c,i,x,y,z,a){const o=D.rocs[i%D.rocs.length];if(!o)return;if(a!=null&&a<1)c.globalAlpha=a;c.drawImage(atlas,o.ax,o.ay,o.aw,o.ah,px(x)+o.dx,py(y,z)+o.dy,o.w,o.h);c.globalAlpha=1;}
  function porte(c,i,a){const p=D.portes[i],im=portes[i];if(!p||!im||a<=0.01)return;c.globalAlpha=a;c.drawImage(im,p.x,p.y,p.w,p.h);c.globalAlpha=1;}
  return {preparer,adapter,poserFond,lanterne,roc,porte,get pret(){return pret;},D};
})();

const Dessin=(()=>{
  const A=REG.armure,L=REG.salle,LT=REG.lanternes,D=window.DECOR;
  let shx=0,shy=0;
  const sol=()=>cx.setTransform(Sc*T,0,0,Sc*T*K,Sc*(OX-camX)+shx,Sc*(OY-camY)+shy);   // dessiner en pas, à plat sur le sol
  const monde=()=>cx.setTransform(Sc,0,0,Sc,-camX*Sc+shx,-camY*Sc+shy);              // dessiner en points du jeu
  const ecran=()=>cx.setTransform(Sc,0,0,Sc,0,0);                                     // les barres, le pouce
  /* ---------- un petit hasard qui ne bouge pas (les fissures, les bords des crevasses) ---------- */
  function hasard(s){return()=>(s=(s*16807)%2147483647)/2147483647;}
  /* les fissures dorées de chaque moitié (les crépitements) */
  const FISS={g:[],d:[]};
  (function(){const r=hasard(97);for(const cote of ['g','d'])for(let i=0;i<26;i++){
    let x=cote==='g'?r()*8.7:9.3+r()*8.7,y=1.2+r()*9,a=r()*TAU;const pts=[[x,y]];
    for(let k=0;k<9+r()*8;k++){a+=(r()-0.5)*1.6;x+=Math.cos(a)*0.32;y+=Math.sin(a)*0.32;if(cote==='g'?x>8.95:x<9.05)break;if(!P2.libreEn({colonnes:[],crevasses:[]},x,y,0.05))break;pts.push([x,y]);}
    if(pts.length>2)FISS[cote].push(pts);}})();
  /* la toile du feu (la vague), à demi-taille */
  let feuC=null,feuX=null,texFeu=null;
  function textureFeu(){if(texFeu)return texFeu;const c=document.createElement('canvas');c.width=c.height=128;const x=c.getContext('2d'),r=hasard(31);
    x.fillStyle='#6a0e02';x.fillRect(0,0,128,128);
    for(let i=0;i<90;i++){const X=r()*128,Y=r()*128,R0=6+r()*22,G=x.createRadialGradient(X,Y,0,X,Y,R0),c2=r();G.addColorStop(0,c2<0.3?'rgba(255,230,140,.9)':c2<0.7?'rgba(255,140,30,.8)':'rgba(220,50,10,.8)');G.addColorStop(1,'rgba(200,40,0,0)');
      for(const dx of [-128,0,128])for(const dy of [-128,0,128]){x.fillStyle=G;x.save();x.translate(dx,dy);x.fillRect(X-R0,Y-R0,R0*2,R0*2);x.restore();}}
    return texFeu=c;}
  const KF=1/3;function toileFeu(){const w=Math.ceil(can.width*KF),h=Math.ceil(can.height*KF);if(!feuC||feuC.width!==w||feuC.height!==h){feuC=document.createElement('canvas');feuC.width=w;feuC.height=h;feuX=feuC.getContext('2d');}}
  /* les bords des crevasses, tirés une fois */
  const bords=new WeakMap();
  function bord(k){let b=bords.get(k);if(b)return b;const r=hasard(Math.floor(k.ax*1000+k.by*77)+5),n=14,l=hyp(k.bx-k.ax,k.by-k.ay),ux=(k.bx-k.ax)/l,uy=(k.by-k.ay)/l,a=[],c=[];
    for(let i=0;i<=n;i++){const u=i/n,w=(REG.crevasse.large/2)*(0.55+0.45*Math.sin(u*Math.PI))*(0.8+r()*0.35),x=k.ax+ux*l*u+(r()-0.5)*0.1,y=k.ay+uy*l*u+(r()-0.5)*0.1;a.push([x-uy*w,y+ux*w]);c.push([x+uy*w,y-ux*w]);}
    b={a,c};bords.set(k,b);return b;}
  function chemin(pts){cx.beginPath();cx.moveTo(pts[0][0],pts[0][1]);for(let i=1;i<pts.length;i++)cx.lineTo(pts[i][0],pts[i][1]);}
  /* la forme de l'abri derrière un rocher (la même que dansAbri des règles) */
  function formeAbri(ab){const r=REG.colonnes.r,pts=[],n=8,ux=ab.ux,uy=ab.uy,vx=-uy,vy=ux;
    for(let i=0;i<=n;i++){const le=r*2.7*i/n,w=le<r?r:r*(1-0.5*(le-r)/(r*1.7));pts.push([ab.x+ux*le+vx*w,ab.y+uy*le+vy*w]);}
    for(let i=n;i>=0;i--){const le=r*2.7*i/n,w=le<r?r:r*(1-0.5*(le-r)/(r*1.7));pts.push([ab.x+ux*le-vx*w,ab.y+uy*le-vy*w]);}
    return pts;}
  const variante=c=>Math.abs(Math.floor(c.x*7.31+c.y*3.17))%6;

  /* ====================== 2. le sol qui vit ====================== */
  function solVivant(S,now){
    const t=tReel;
    /* les rigoles d'or et de rouge : elles battent doucement ; elles brillent fort quand leur lanterne tire son rayon */
    monde();cx.globalCompositeOperation='lighter';
    for(const nom of ['or','rouge']){const l=LT[nom],sx=nom==='or'?1:-1,fort=(S.rayon&&S.rayon.couleur===nom?1:0)+(S.orbe&&S.orbe.porte&&S.orbe.couleur===nom?0.5:0);
      const ax=A.x-sx*2.38*0.83,ay=A.y+2.38*0.56,pts=[[l[0]+sx*0.6,l[1]],[l[0]+sx*2.3,l[1]],[l[0]+sx*3.9,l[1]-1.6],[ax-sx*0.9,ay+0.3],[ax,ay]];
      const a=0.12+0.06*Math.sin(t*2+sx)+fort*0.5,g=FX.lueur(nom==='or'?'#ffc040':'#ff3a20');
      for(let i=0;i<pts.length-1;i++){const [x0,y0]=pts[i],[x1,y1]=pts[i+1],n=Math.ceil(hyp(x1-x0,y1-y0)/0.5);
        for(let k=0;k<n;k++){const u=(k+((t*(1+fort*2))%1))/n,x=lerp(x0,x1,u),y=lerp(y0,y1,u),s=16+fort*14;cx.globalAlpha=a;cx.drawImage(g,px(x)-s/2,py(y,0)-s*K/2,s,s*K);}}}
    cx.globalAlpha=1;
    /* les yeux des portes : rouges quand un réparateur arrive */
    for(let i=0;i<2;i++){const e=D.yeux[i],o=S.__porte?S.__porte[i]:0;if(o>0.01){const s=30+20*o,g=FX.lueur('#ff3018');cx.globalAlpha=Math.min(1,o*1.4);cx.drawImage(g,px(e.x)-s/2,py(e.y,e.z)-s/2,s,s);cx.globalAlpha=1;}}
    cx.globalCompositeOperation='source-over';
    /* les portes ouvertes */
    if(S.__porte)for(let i=0;i<2;i++)Decor.porte(cx,i,S.__porte[i]);
    /* le givre ou la pierre brûlante (deuxième tiers) : sous tout le reste, un peu transparents */
    if(S.main&&S.main.cx!==null){const m=S.main,R=P2.rayonMain(m);if(R>0.05){sol();const givre=m.type==='givre';
      cx.save();cx.beginPath();cx.rect(0,0,L.L,L.P);cx.clip();
      const G=cx.createRadialGradient(m.cx,m.cy,0,m.cx,m.cy,R);
      if(givre){G.addColorStop(0,'rgba(200,240,255,.42)');G.addColorStop(0.85,'rgba(150,215,255,.34)');G.addColorStop(1,'rgba(235,250,255,.75)');}
      else{const p=0.5+0.5*Math.sin(t*6);G.addColorStop(0,`rgba(255,${120+40*p},40,.34)`);G.addColorStop(0.85,'rgba(255,70,20,.3)');G.addColorStop(1,'rgba(255,200,90,.8)');}
      cx.fillStyle=G;cx.beginPath();cx.arc(m.cx,m.cy,R,0,TAU);cx.fill();
      /* les dessins du givre (des fougères de glace) ou les fentes rouges de la pierre */
      const r=hasard(givre?11:23);cx.lineWidth=0.035;cx.strokeStyle=givre?'rgba(255,255,255,.55)':'rgba(70,10,0,.55)';
      for(let i=0;i<46;i++){const a=r()*TAU,d=r()*R,x=m.cx+Math.cos(a)*d,y=m.cy+Math.sin(a)*d,b=r()*TAU;cx.beginPath();cx.moveTo(x,y);
        for(let k=0;k<4;k++){const l=0.18+r()*0.25;cx.lineTo(x+Math.cos(b+k*(givre?0.9:0.4))*l*(k+1)*0.5,y+Math.sin(b+k*(givre?0.9:0.4))*l*(k+1)*0.5);}cx.stroke();}
      cx.restore();}}
    /* les crépitements : les fissures dorées s'allument ; puis l'explosion */
    if(S.crepite){const c=S.crepite,k=clamp(c.t/REG.crepite.annonce,0,1);sol();cx.globalCompositeOperation='lighter';
      cx.lineCap='round';cx.lineJoin='round';const x0=c.cote==='g'?0:L.L/2;
      /* toute la moitié se teinte d'or, et la frontière brille : on voit tout de suite où est l'autre moitié */
      cx.fillStyle=`rgba(255,190,70,${0.08+0.22*k*k})`;cx.fillRect(x0,0,L.L/2,L.P);
      cx.strokeStyle=`rgba(255,220,130,${0.25+0.5*k})`;cx.lineWidth=0.06;cx.setLineDash([0.3,0.18]);cx.lineDashOffset=-t*2;cx.beginPath();cx.moveTo(L.L/2,0);cx.lineTo(L.L/2,L.P);cx.stroke();cx.setLineDash([]);
      /* les fissures : un trait sombre dans la pierre, et l'or qui monte dedans */
      cx.globalCompositeOperation='source-over';cx.strokeStyle='rgba(12,6,0,.8)';cx.lineWidth=0.1;
      for(const f of FISS[c.cote]){const n=Math.max(2,Math.ceil(f.length*Math.min(1,k*1.8)));chemin(f.slice(0,n));cx.stroke();}
      cx.globalCompositeOperation='lighter';
      for(const [w,al] of [[0.2,0.2],[0.07,0.65],[0.032,1]]){cx.lineWidth=w*(0.7+k*0.6);cx.strokeStyle=`rgba(255,${180+50*k},${70+90*(w<0.03?1:0)},${al*(0.2+0.8*k)*(0.75+0.25*Math.sin(t*25+w*9))})`;
        for(const f of FISS[c.cote]){const n=Math.max(2,Math.ceil(f.length*Math.min(1,k*1.8)));chemin(f.slice(0,n));cx.stroke();}}
      cx.globalCompositeOperation='source-over';
      if(Math.random()<0.6){const f=FISS[c.cote][Math.floor(Math.random()*FISS[c.cote].length)],p=f[Math.floor(Math.random()*f.length)];FX.etincelles(p[0],p[1],0.02,1,'#ffd27a',1.2+2*k,0.7);}}
    /* les lignes d'énergie des doigts (troisième tiers) */
    for(const dg of S.doigts){const a0=REG.doigts.annonce,k=clamp(dg.t/a0,0,1),boum=dg.t>=a0,f=boum?1-(dg.t-a0)/0.45:k;sol();cx.globalCompositeOperation='lighter';
      cx.save();cx.beginPath();cx.rect(0,0,L.L,L.P);cx.clip();
      for(const a of dg.lignes){cx.save();cx.translate(A.x,A.y);cx.rotate(a);const w=REG.doigts.demi;
        if(boum){cx.fillStyle=`rgba(255,240,200,${0.85*f})`;cx.fillRect(A.r*0.6,-w,22,2*w);cx.fillStyle=`rgba(255,120,40,${0.5*f})`;cx.fillRect(A.r*0.6,-w*1.6,22,3.2*w);}
        else{const fl=0.75+0.25*Math.sin(t*30+a*7);cx.fillStyle=`rgba(255,${90+100*k},40,${(0.1+0.35*k)*fl})`;cx.fillRect(A.r*0.6,-w,22,2*w);
          cx.fillStyle=`rgba(255,230,150,${(0.3+0.6*k)*fl})`;cx.fillRect(A.r*0.6,-0.045,22*Math.min(1,k*2.5),0.09);
          cx.strokeStyle=`rgba(255,170,70,${0.4+0.5*k})`;cx.lineWidth=0.04;cx.strokeRect(A.r*0.6,-w,22,2*w);}
        cx.restore();}
      cx.restore();cx.globalCompositeOperation='source-over';
      if(boum&&!dg.__fx){dg.__fx=1;for(const a of dg.lignes)for(let d=2;d<12;d+=1.3){const x=A.x+Math.cos(a)*d,y=A.y+Math.sin(a)*d;if(x>0&&x<L.L&&y>0&&y<L.P)FX.etincelles(x,y,0.05,3,'#ffcf6a',3,0.8);}}}
    /* la trace du rayon au sol : là où il faut se mettre pour le couper */
    if(S.rayon){const ry=S.rayon,l=LT[ry.couleur],act=ry.t>=REG.rayon.grace,c=ry.couleur==='or'?'255,200,80':'255,70,40';sol();cx.globalCompositeOperation='lighter';
      cx.lineCap='round';cx.strokeStyle=`rgba(${c},${act?0.22:0.12+0.08*Math.sin(t*12)})`;cx.lineWidth=REG.rayon.demi*2;cx.beginPath();cx.moveTo(l[0],l[1]);cx.lineTo(A.x,A.y);cx.stroke();
      cx.strokeStyle=`rgba(${c},.5)`;cx.lineWidth=0.05;cx.setLineDash([0.25,0.2]);cx.lineDashOffset=-t*1.5;cx.stroke();cx.setLineDash([]);cx.globalCompositeOperation='source-over';}
    /* les anneaux de la danse */
    if(S.danse){const dz=S.danse,DZ=REG.danse,Tp=DZ.dure/dz.motif.length,u=dz.st/Tp,sur=dz.motif[dz.k],al=u<DZ.alerte;sol();
      cx.save();cx.beginPath();cx.rect(0,0,L.L,L.P);cx.clip();
      for(let i=0;i<DZ.n;i++){const r0=i===0?A.r:DZ.r0+i*DZ.w,r1=i===DZ.n-1?30:DZ.r0+(i+1)*DZ.w;cx.beginPath();cx.arc(A.x,A.y,r1,0,TAU);cx.arc(A.x,A.y,r0,0,TAU,true);
        if(i===sur){cx.fillStyle='rgba(20,40,70,.32)';cx.fill();cx.globalCompositeOperation='lighter';cx.fillStyle=`rgba(120,200,255,${0.12+0.05*Math.sin(t*6)})`;cx.fill();cx.globalCompositeOperation='source-over';continue;}
        if(al){const k=u/DZ.alerte;cx.globalCompositeOperation='lighter';cx.fillStyle=`rgba(255,${90+90*k},30,${0.14+0.4*k*k})`;cx.fill();cx.globalCompositeOperation='source-over';}
        else{const k=1-(u-DZ.alerte)/(1-DZ.alerte);cx.globalCompositeOperation='lighter';cx.fillStyle=`rgba(255,240,180,${0.75*k*k+0.1})`;cx.fill();cx.globalCompositeOperation='source-over';}}
      /* les bords des anneaux, toujours visibles ; l'anneau sûr bien cerné de bleu */
      cx.strokeStyle='rgba(255,210,120,.55)';cx.lineWidth=0.06;for(let i=1;i<DZ.n;i++){cx.beginPath();cx.arc(A.x,A.y,DZ.r0+i*DZ.w,0,TAU);cx.stroke();}
      {const r0=sur===0?A.r:DZ.r0+sur*DZ.w,r1=sur===DZ.n-1?30:DZ.r0+(sur+1)*DZ.w;cx.strokeStyle='rgba(170,225,255,.9)';cx.lineWidth=0.08;cx.beginPath();cx.arc(A.x,A.y,r0+0.05,0,TAU);cx.stroke();if(r1<29){cx.beginPath();cx.arc(A.x,A.y,r1-0.05,0,TAU);cx.stroke();}}
      cx.restore();
      if(!al&&dz.__k!==dz.k){dz.__k=dz.k;for(let i=0;i<40;i++){const a=rnd(0.05,Math.PI-0.05),ri=Math.floor(rnd(0,DZ.n));if(ri===sur)continue;const d=ri===0?rnd(A.r,DZ.r0+DZ.w):rnd(DZ.r0+ri*DZ.w,DZ.r0+(ri+1)*DZ.w),x=A.x+Math.cos(a)*d,y=A.y+Math.sin(a)*d;if(x>0.3&&x<L.L-0.3&&y<L.P)FX.lueurs(x,y,0.1,1,'#ffd27a',26,0.6,0.3);}}}
    /* les crevasses, et les fentes qui s'annoncent */
    sol();
    for(const k of S.crevasses){const b=bord(k),poly=b.a.concat(b.c.slice().reverse()),loin=b.a[Math.floor(b.a.length/2)][1]<b.c[Math.floor(b.c.length/2)][1]?b.a:b.c;
      cx.fillStyle='#07060a';chemin(poly);cx.closePath();cx.fill();
      /* la paroi qu'on voit (le bord du fond, éclairé) et l'or tout au fond */
      cx.save();chemin(poly);cx.closePath();cx.clip();cx.fillStyle='rgba(92,78,66,.95)';chemin(loin.concat(loin.slice().reverse().map(p=>[p[0],p[1]+0.32])));cx.closePath();cx.fill();
      cx.globalCompositeOperation='lighter';cx.strokeStyle=`rgba(255,120,30,${0.35+0.15*Math.sin(t*3)})`;cx.lineWidth=0.3;chemin(b.a.map((p,i)=>[(p[0]+b.c[i][0])/2,(p[1]+b.c[i][1])/2+0.12]));cx.stroke();cx.restore();
      cx.globalCompositeOperation='lighter';cx.strokeStyle='rgba(255,150,50,.35)';cx.lineWidth=0.06;cx.stroke();
      cx.strokeStyle=`rgba(255,190,80,${0.25+0.1*Math.sin(t*3)})`;cx.lineWidth=0.12;chemin(b.a.map((p,i)=>[(p[0]+b.c[i][0])/2,(p[1]+b.c[i][1])/2]));cx.stroke();cx.globalCompositeOperation='source-over';
      cx.strokeStyle='rgba(20,14,10,.85)';cx.lineWidth=0.05;chemin(b.a);cx.stroke();chemin(b.c);cx.stroke();}
    for(const k of S.fentes){const u=clamp(k.t/REG.crevasse.annonce,0,1);cx.globalCompositeOperation='lighter';cx.lineCap='round';
      cx.strokeStyle=`rgba(255,210,120,${0.3+0.6*u})`;cx.lineWidth=0.04+0.25*u;cx.beginPath();cx.moveTo(k.ax,k.ay);cx.lineTo(k.ax+(k.bx-k.ax)*Math.min(1,u*1.5),k.ay+(k.by-k.ay)*Math.min(1,u*1.5));cx.stroke();cx.globalCompositeOperation='source-over';
      if(Math.random()<0.5){const v=Math.random()*Math.min(1,u*1.5);FX.etincelles(lerp(k.ax,k.bx,v),lerp(k.ay,k.by,v),0.02,1,'#ffd27a',1.5,0.6);}}
    /* l'orbe par terre : sa flaque de lumière */
    if(S.orbe&&!S.orbe.porte&&S.orbe.t>REG.orbe.chute){const o=S.orbe,g=FX.nappe(o.couleur==='or'?'#ffc040':'#ff3a20'),s=90+30*Math.sin(t*6);monde();cx.globalCompositeOperation='lighter';cx.drawImage(g,px(o.x)-s/2,py(o.y,0)-s*K/2,s,s*K);cx.globalCompositeOperation='source-over';}
    /* les ombres des rochers qui tombent : elles grandissent en 2 s, bien sombres, par-dessus le givre et le feu */
    monde();
    for(const o of S.ombres){const k=clamp(o.t/REG.colonnes.ombre,0,1),r=REG.colonnes.r*(0.35+0.85*k);
      cx.fillStyle=`rgba(0,0,0,${0.25+0.45*k})`;cx.beginPath();cx.ellipse(px(o.x),py(o.y,0),r*T*1.05,r*T*K*1.05,0,0,TAU);cx.fill();
      cx.strokeStyle=`rgba(255,120,60,${0.25+0.5*k})`;cx.lineWidth=1.5;cx.beginPath();cx.ellipse(px(o.x),py(o.y,0),REG.colonnes.r*T*1.1,REG.colonnes.r*T*K*1.1,0,0,TAU*k);cx.stroke();
      if(Math.random()<0.25)FX.emet({x:o.x+rnd(-0.4,0.4),y:o.y+rnd(-0.2,0.2),z:7,vz:-rnd(5,8),vie:1.1,s:rnd(1.5,3),coul:'#8a8078',eclat:true,vr:rnd(-5,5),fin:u=>u<0.8?1:0});}
    /* les ombres au pied de ce qui est debout */
    cx.fillStyle='rgba(0,0,0,.38)';
    for(const c of S.colonnes){cx.beginPath();cx.ellipse(px(c.x),py(c.y,0)+2,REG.colonnes.r*T*1.15,REG.colonnes.r*T*K*1.0,0,0,TAU);cx.fill();}
    for(const r of S.reps){cx.beginPath();cx.ellipse(px(r.x),py(r.y,0)+1,15,6,0,0,TAU);cx.fill();}
    const h=S.h;if(h.mort<=0){const z=h.__z||0;cx.fillStyle=`rgba(0,0,0,${0.4-z*0.15})`;cx.beginPath();cx.ellipse(px(h.x),py(h.y,0)+1,13-z*3,5.5-z,0,0,TAU);cx.fill();}
    /* la cible : un cercle sous le réparateur visé */
    if(S.cible&&S.reps.indexOf(S.cible)>=0){const r=S.cible;cx.strokeStyle='rgba(255,220,90,.95)';cx.lineWidth=2.2;cx.setLineDash([6,4]);cx.lineDashOffset=-t*20;cx.beginPath();cx.ellipse(px(r.x),py(r.y,0),24,10,0,0,TAU);cx.stroke();cx.setLineDash([]);}
    FX.dessiner(cx,'sol');
  }

  /* ====================== la vague de flammes (une toile à part, puis ajoutée) ====================== */
  function vague(S){
    const v=S.vague;if(!v)return;const V=REG.vague,t=v.t;
    /* l'annonce : de petites flammes rouges courent aux pieds de l'armure */
    if(t<V.annonce){const k=t/V.annonce;if(Math.random()<0.5+k){const a=rnd(0.1,Math.PI-0.1),d=A.r+rnd(0,0.6+k);FX.flammes(A.x+Math.cos(a)*d,A.y+Math.sin(a)*d,0.02,1,16+10*k,0.8,0.1);}
      /* les abris se montrent (un liseré bleu) : on voit tout de suite où se cacher */
      monde();sol();cx.strokeStyle=`rgba(150,210,255,${0.25+0.45*k})`;cx.lineWidth=0.05;cx.setLineDash([0.18,0.12]);for(const ab of v.abris){chemin(formeAbri(ab));cx.closePath();cx.stroke();}cx.setLineDash([]);return;}
    const rM=v.rMax,f=A.r+(t-V.annonce)/V.traverse*(rM-A.r),q=A.r+(t-V.annonce-V.flammes)/V.traverse*(rM-A.r),r1=Math.min(rM+0.5,f),r0=Math.max(A.r*0.7,q);
    if(r1<=r0)return;
    toileFeu();const x=feuX,k=KF;x.setTransform(1,0,0,1,0,0);x.clearRect(0,0,feuC.width,feuC.height);
    x.setTransform(Sc*T*k,0,0,Sc*T*K*k,(Sc*(OX-camX)+shx)*k,(Sc*(OY-camY)+shy)*k);
    x.save();x.beginPath();x.moveTo(L.coin,0);x.lineTo(L.L-L.coin,0);x.lineTo(L.L,L.coin);x.lineTo(L.L,L.P);x.lineTo(0,L.P);x.lineTo(0,L.coin);x.closePath();x.clip();
    /* la matière du feu : la texture, qui file vers l'extérieur et qui monte */
    const pat=x.createPattern(textureFeu(),'repeat'),tt=tReel;
    if(pat.setTransform)pat.setTransform(new DOMMatrix().scaleSelf(1/40,1/40/K*0.8).translateSelf(-tt*60,tt*110));
    x.fillStyle=pat;x.beginPath();x.arc(A.x,A.y,r1,0,TAU);x.arc(A.x,A.y,r0,0,TAU,true);x.fill();
    /* la forme : très clair au front, de plus en plus sombre derrière, qui s'éteint à la fin */
    const G=x.createRadialGradient(A.x,A.y,Math.max(0,r0),A.x,A.y,r1+0.01),fl=0.85+0.15*Math.sin(tReel*20);
    G.addColorStop(0,'rgba(0,0,0,0)');G.addColorStop(0.3,`rgba(0,0,0,${0.55*fl})`);G.addColorStop(0.75,'rgba(0,0,0,.95)');G.addColorStop(1,'rgba(0,0,0,1)');
    x.globalCompositeOperation='destination-in';x.fillStyle=G;x.fillRect(-2,-2,L.L+4,L.P+4);
    x.globalCompositeOperation='lighter';const G2=x.createRadialGradient(A.x,A.y,Math.max(0,r1-0.9),A.x,A.y,r1+0.01);G2.addColorStop(0,'rgba(255,200,80,0)');G2.addColorStop(0.7,'rgba(255,220,120,.55)');G2.addColorStop(1,'rgba(255,250,210,.85)');
    x.fillStyle=G2;x.beginPath();x.arc(A.x,A.y,r1,0,TAU);x.arc(A.x,A.y,Math.max(r0,r1-0.9),0,TAU,true);x.fill();x.globalCompositeOperation='source-over';
    /* derrière chaque rocher, le feu se referme : l'abri reste noir */
    x.globalCompositeOperation='destination-out';for(const ab of v.abris){const p=formeAbri(ab);x.beginPath();x.moveTo(p[0][0],p[0][1]);for(const q2 of p)x.lineTo(q2[0],q2[1]);x.closePath();x.fill();}
    x.restore();x.globalCompositeOperation='source-over';
    cx.setTransform(1,0,0,1,0,0);cx.globalAlpha=0.95;cx.globalCompositeOperation='lighter';cx.drawImage(feuC,0,0,can.width,can.height);cx.globalAlpha=1;cx.globalCompositeOperation='source-over';
    /* le front : de hautes flammes ; dans le feu : des flammes plus petites */
    const n=Math.min(finesse>=2?9:14,Math.round(5+7*(r1-r0)));
    for(let i=0;i<n;i++){const a=rnd(0.02,Math.PI-0.02),front=i<n*0.6,d=front?r1-rnd(0,0.4):rnd(r0,r1),xx=A.x+Math.cos(a)*d,yy=A.y+Math.sin(a)*d;
      if(xx<0.2||xx>L.L-0.2||yy>L.P-0.1||yy<0.1)continue;if(v.abris.some(ab=>P2.dansAbri(ab,xx,yy,0)))continue;
      FX.flammes(xx,yy,0.02,1,front?46:24,front?1:0.7,0.1);}
    /* les abris, avec leur liseré bleu */
    monde();sol();for(const ab of v.abris){chemin(formeAbri(ab));cx.closePath();cx.fillStyle='rgba(40,80,140,.22)';cx.fill();cx.strokeStyle='rgba(170,225,255,.8)';cx.lineWidth=0.06;cx.stroke();}
  }

  /* ====================== 3. ce qui est debout ====================== */
  function debout(S,now,dt){
    const L2=[],h=S.h;
    for(const c of S.colonnes)L2.push([c.y,'roc',c]);
    L2.push([LT.or[1],'lan',0],[LT.rouge[1],'lan',1]);
    for(const r of S.reps)L2.push([r.y,'rep',r]);
    L2.push([h.y,'heros',h]);
    L2.push([A.y,'armure',null]);
    for(const o of S.ombres)if(o.t>REG.colonnes.ombre-0.42)L2.push([o.y,'chute',o]);
    if(S.orbe&&!S.orbe.porte)L2.push([S.orbe.y,'orbe',S.orbe]);
    L2.sort((a,b)=>a[0]-b[0]);
    monde();
    for(const [y,k,o] of L2){
      if(k==='roc'){const nee=S.reel-(o.nee||-9),tasse=nee<0.18?(1-nee/0.18)*0.12:0;Decor.roc(cx,variante(o),o.x,o.y,-tasse);
        /* le givre ou le feu collés dessus (un sort arrêté par la pierre) */
        for(const ta of S.taches)if(ta.col===o){const age=S.reel-ta.t,a=1-age/2.5;if(a<=0)continue;const X=px(o.x),Y=py(o.y,0.55);
          if(ta.quoi==='feu'){cx.globalCompositeOperation='lighter';const g=FX.lueur('#ff8a30');cx.globalAlpha=a*0.8;cx.drawImage(g,X-24,Y-24,48,48);cx.globalAlpha=1;cx.globalCompositeOperation='source-over';if(Math.random()<0.35)FX.flammes(o.x+rnd(-0.3,0.3),o.y+0.45,0.5+rnd(0,0.4),1,16*a,0.7,0.05);}
          else{cx.globalAlpha=a;cx.fillStyle='rgba(220,248,255,.75)';for(let i=0;i<7;i++){const an=i/7*TAU;cx.beginPath();cx.ellipse(X+Math.cos(an)*9,Y+Math.sin(an)*6,5,3,an,0,TAU);cx.fill();}cx.globalAlpha=1;}}}
      else if(k==='chute'){const u=clamp((o.t-(REG.colonnes.ombre-0.42))/0.42,0,1),z=(1-u*u)*7;Decor.roc(cx,variante(o),o.x,o.y,z,0.4+0.6*u);}
      else if(k==='lan'){Decor.lanterne(cx,o);lumiereLanterne(S,o===0?'or':'rouge');}
      else if(k==='rep')reparateur(S,o,dt);
      else if(k==='heros')heros(S,dt);
      else if(k==='armure')armure(S,now);
      else if(k==='orbe')orbe(S,o);
    }
    /* le héros caché par un rocher : sa silhouette, à travers */
    if(h.mort<=0&&S.colonnes.some(c=>c.y>h.y&&c.y-h.y<1.7&&Math.abs(c.x-h.x)<0.95)){cx.globalAlpha=0.38;heros(S,0,true);cx.globalAlpha=1;}
    /* les réparateurs cachés : leur silhouette, et un petit œil rouge au-dessus d'eux, toujours visible */
    for(const r of S.reps){if(S.colonnes.some(c=>c.y>r.y&&c.y-r.y<1.6&&Math.abs(c.x-r.x)<0.95)){cx.globalAlpha=0.42;reparateur(S,r,0,true);cx.globalAlpha=1;}
      const X=px(r.x),Y=py(r.y,1.55);cx.globalCompositeOperation='lighter';cx.drawImage(FX.lueur('#ff3a20'),X-9,Y-9,18,18);cx.globalCompositeOperation='source-over';}
  }
  function lumiereLanterne(S,nom){const l=D.lanternes[nom],X=px(l.x),Y=py(l.y,l.z),rr=S.rayon&&S.rayon.couleur===nom,p=0.85+0.15*Math.sin(tReel*3+(nom==='or'?0:2));
    cx.globalCompositeOperation='lighter';const g=FX.lueur(nom==='or'?'#ffc650':'#ff4028'),s=(rr?110:64)*p;cx.globalAlpha=rr?1:0.75;cx.drawImage(g,X-s/2,Y-s/2,s,s);cx.globalAlpha=1;cx.globalCompositeOperation='source-over';}

  /* ---------- le héros ---------- */
  const vh={fa:-Math.PI/2,pas:0,lanceT:-9,coupT:-9,x:0,y:0};
  function heros(S,dt,silhouette){
    const h=S.h;let nom='garde',z=0,a=1;
    if(!silhouette){const dx=h.x-vh.x,dy=h.y-vh.y,d=hyp(dx,dy);vh.x=h.x;vh.y=h.y;if(d>0.002&&d<1){vh.pas+=d;if(!h.lance)vh.fa=Math.atan2(dy,dx);}
      if(h.lance&&h.lance.quoi!=='soin'){const c=S.cible&&S.reps.indexOf(S.cible)>=0?S.cible:A;vh.fa=Math.atan2(c.y-h.y,c.x-h.x);}}
    let d=dir8(vh.fa);
    if(h.mort>0){nom='sol';d=Math.cos(vh.fa)>=0?2:6;a=h.mort<1?h.mort:1;}
    else if(h.saut){const u=clamp(h.saut.t/REG.saut.dur,0,1);z=Math.sin(u*Math.PI)*0.55;nom='saut';}
    else if(h.lance){if(h.lance.quoi==='soin')nom='soin';else nom='i'+(Math.floor(tReel*7)%3);}
    else if(tReel-vh.lanceT<0.32)nom='lance';
    else if(tReel-vh.coupT<0.3)nom='coup';
    else if(h.bouge)nom='c'+(Math.floor(vh.pas/2.6*8)%8);
    else if(h.orbe)nom='porte';
    if(h.orbe&&!h.lance&&!h.bouge&&nom==='garde')nom='porte';
    h.__z=z;
    if(h.intouchable>0&&!silhouette&&Math.floor(tReel*8)%2)a*=0.55;
    const X=px(h.x),Y=py(h.y,z);
    if(!HS.dessiner(cx,nom,d,X,Y,a)){cx.fillStyle='#c0507a';cx.fillRect(X-8,Y-46,16,46);}
    if(silhouette)return;
    vh.d=d;vh.nom=nom;
    /* le bonus de l'orbe : une aura de sa couleur */
    if(h.bonus>0){cx.globalCompositeOperation='lighter';const g=FX.nappe(h.couleurBonus==='rouge'?'#ff4a2a':'#ffc040'),s=70+8*Math.sin(tReel*6);cx.globalAlpha=Math.min(1,h.bonus/2)*0.7;cx.drawImage(g,X-s/2,Y-28-s/2,s,s);cx.globalAlpha=1;cx.globalCompositeOperation='source-over';}
  }
  /* d'où partent les sorts, en points du jeu (le luth, le cristal, la main) */
  function boutHeros(S){const h=S.h,b=HS.bout(vh.nom&&vh.nom[0]==='i'?vh.nom:'i0',vh.d||0);return [px(h.x)+b.sx,py(h.y,h.__z||0)+b.sy];}

  /* ---------- un réparateur (le golem du combat du Pisteur) ---------- */
  const SCR=0.6*T/46;
  function reparateur(S,r,dt,silhouette){
    if(!silhouette){const dx=r.x-(r.__x==null?r.x:r.__x),dy=r.y-(r.__y==null?r.y:r.__y);r.__m=(r.__m||0)+hyp(dx,dy);if(hyp(dx,dy)>0.001)r.__fa=Math.atan2(dy,dx);r.__x=r.x;r.__y=r.y;}
    const fa=r.__fa==null?-Math.PI/2:r.__fa,c=Math.cos(fa);let yaw=c>0.38?1:c<-0.38?-1:(Math.sin(fa)>=0?0:(r.__yaw||1));r.__yaw=yaw;
    const i=Math.floor(((r.__m||0)/0.95%1)*8),pose={yaw,etat:'marche',k:[0,2,3,4][i%4],pied:i<4?0:1};
    const sp=GS.image('reparateur',SCR,pose),X=px(r.x),Y=py(r.y,0);
    if(r.rouge>0&&!silhouette){cx.drawImage(sp.c,X-sp.ox*SCR,Y-sp.oy*SCR,sp.w*SCR,sp.h*SCR);cx.globalCompositeOperation='lighter';cx.globalAlpha=0.6*r.rouge;cx.drawImage(GS.rouge(sp),X-sp.ox*SCR,Y-sp.oy*SCR,sp.w*SCR,sp.h*SCR);cx.globalAlpha=1;cx.globalCompositeOperation='source-over';}
    else cx.drawImage(sp.c,X-sp.ox*SCR,Y-sp.oy*SCR,sp.w*SCR,sp.h*SCR);
  }

  /* ---------- l'armure, et tout ce qui lui colle : le ventre ouvert, l'énergie, la coque, la bulle ---------- */
  function armure(S,now){
    const ti=S.tiers,X=Armure.X(),Y=Armure.Y(),C=Armure.point('coeur');
    /* derrière elle : l'aura du troisième tiers */
    if(ti===3&&S.phase!=='fini'){cx.globalCompositeOperation='lighter';const f=0.8+0.2*Math.sin(now*9)+0.1*Math.sin(now*23);
      cx.globalAlpha=0.6*f;cx.drawImage(FX.nappe('#ff3a1a'),X-120,Y-220,240,240);cx.globalAlpha=0.45*f;cx.drawImage(FX.nappe('#ffc040'),X-80,Y-190,160,170);cx.globalAlpha=1;cx.globalCompositeOperation='source-over';}
    Armure.dessiner(cx);
    cx.globalCompositeOperation='lighter';
    /* la vague qui se prépare : la poitrine rougit de plus en plus fort */
    if(S.vague&&S.vague.t<REG.vague.annonce+0.4){const k=clamp(S.vague.t/REG.vague.annonce,0,1),s=40+90*k;cx.globalAlpha=0.3+0.7*k;cx.drawImage(FX.lueur('#ff2a10'),C.x-s/2,C.y-s/2,s,s);cx.globalAlpha=1;}
    /* le ventre ouvert (deuxième tiers) : les tuyaux du drainage qui brillent */
    if(ti===2&&S.phase!=='fini'){cx.globalCompositeOperation='source-over';const bx=C.x,by=C.y+30;cx.fillStyle='rgba(8,6,10,.92)';cx.beginPath();cx.ellipse(bx,by,17,13,0,0,TAU);cx.fill();
      cx.strokeStyle='#6a4a20';cx.lineWidth=2;cx.stroke();
      for(let i=0;i<4;i++){const xx=bx-10+i*6.6,p=0.5+0.5*Math.sin(now*5+i*1.7);cx.strokeStyle=i%2?`rgba(255,${80+60*p},40,1)`:`rgba(255,${200+40*p},90,1)`;cx.lineWidth=2.6;cx.beginPath();cx.moveTo(xx,by-11);cx.lineTo(xx+(i-1.5)*1.5,by+11);cx.stroke();}
      cx.globalCompositeOperation='lighter';cx.globalAlpha=0.7;cx.drawImage(FX.lueur('#ffb040'),bx-30,by-26,60,52);cx.globalAlpha=1;
      if(Math.random()<0.15)FX.etincelles(A.x+rnd(-0.2,0.2),A.y+0.3,2.0,1,Math.random()<0.5?'#ffd27a':'#ff5a3a',1.5,0.8);}
    /* les mains (deuxième tiers) : la main levée brille de son danger */
    if(S.main){const m=S.main,P=Armure.point(m.type==='givre'?'mainG':'mainD'),c=m.type==='givre'?'#8fe4ff':'#ff6a1a',s=56+10*Math.sin(now*8);cx.drawImage(FX.lueur(c),P.x-s/2,P.y-s/2,s,s);
      if(Math.random()<0.5)FX.emet({x:A.x+(P.x-X)/T,y:A.y+0.4,z:(Y-P.y)/ZH,vx:rnd(-0.3,0.3),vz:m.type==='givre'?-0.4:1,vie:0.7,s:m.type==='givre'?3:16,img:m.type==='givre'?null:FX.flamme(),coul:'#eafaff',eclat:m.type==='givre',add:true});}
    /* la main d'énergie (troisième tiers) */
    if(ti===3&&S.phase!=='fini')mainEnergie(S,now);
    /* la coque d'énergie */
    if(S.coque){const k=S.coque.t/REG.coque.dure,pv=S.coque.pv/REG.coque.pv,r=96+6*Math.sin(now*6),cy=C.y-6;
      cx.globalAlpha=0.25+0.4*k;cx.drawImage(FX.nappe(k>0.7&&Math.floor(now*10)%2?'#ffffff':'#ff7a30'),X-r*1.3,cy-r*1.3,r*2.6,r*2.6);cx.globalAlpha=1;
      cx.strokeStyle=`rgba(255,${160+60*k},80,${0.5+0.4*pv})`;cx.lineWidth=2.5+3*k;cx.beginPath();cx.ellipse(X,cy,r,r*0.95,0,0,TAU);cx.stroke();
      cx.strokeStyle='rgba(255,230,160,.35)';cx.lineWidth=1;for(let i=0;i<6;i++){const a=now*0.6+i*TAU/6;cx.beginPath();cx.ellipse(X,cy,r*Math.abs(Math.cos(a)),r*0.95,0,0,TAU);cx.stroke();}
      if(pv<1){cx.strokeStyle='rgba(20,10,10,.8)';cx.lineWidth=1.8;const rr=hasard(7);for(let i=0;i<Math.ceil((1-pv)*8);i++){const a=rr()*TAU;cx.beginPath();cx.moveTo(X+Math.cos(a)*r,cy+Math.sin(a)*r);cx.lineTo(X+Math.cos(a+0.2)*r*0.7,cy+Math.sin(a+0.2)*r*0.7);cx.stroke();}}}
    /* la bulle (le méga bouclier) : un dôme d'or, et son symbole au-dessus */
    if(S.phase==='bulle'){const r=150,cy=Y-92,f=0.85+0.15*Math.sin(now*3);
      cx.globalAlpha=0.35*f;cx.drawImage(FX.nappe('#ffd060'),X-r*1.15,cy-r*1.15,r*2.3,r*2.3);cx.globalAlpha=1;
      cx.strokeStyle=`rgba(255,226,140,${0.75*f})`;cx.lineWidth=3;cx.beginPath();cx.ellipse(X,cy,r,r*0.82,0,0,TAU);cx.stroke();
      cx.strokeStyle='rgba(255,240,190,.22)';cx.lineWidth=1.2;for(let i=-3;i<=3;i++){cx.beginPath();cx.ellipse(X,cy,r*Math.cos(i*0.4),r*0.82,0,0,TAU);cx.stroke();cx.beginPath();cx.ellipse(X,cy+i*r*0.24,r*Math.sqrt(Math.max(0,1-(i*0.29)**2)),6,0,0,TAU);cx.stroke();}}
    cx.globalCompositeOperation='source-over';
  }
  function mainEnergie(S,now){
    const P=Armure.point('mainD');let a=Math.PI/2,ec=0.25,k=0.35;
    if(S.doigts.length){const dg=S.doigts[S.doigts.length-1];a=(dg.lignes[0]+dg.lignes[dg.lignes.length-1])/2;ec=(dg.lignes[1]-dg.lignes[0]);k=dg.t>=REG.doigts.annonce?1:0.5+0.5*dg.t/REG.doigts.annonce;}
    const sa=Math.atan2(Math.sin(a)*K,Math.cos(a)),f=0.8+0.2*Math.sin(now*14),E=1.5;
    /* le bras brisé : des éclats au coude, puis l'avant-bras d'énergie jusqu'à la paume */
    const ex=P.x-Math.cos(sa)*30,ey=P.y-Math.sin(sa)*30-8,x=P.x+Math.cos(sa)*10,y=P.y+Math.sin(sa)*10;
    cx.globalAlpha=0.85*f;cx.drawImage(FX.lueur('#ff6a28'),x-60,y-60,120,120);cx.globalAlpha=0.5*f;cx.drawImage(FX.nappe('#ffc040'),x-90,y-90,180,180);cx.globalAlpha=1;
    cx.lineCap='round';cx.lineJoin='round';
    const doigt=i=>{const b=sa+(i-2)*ec*1.05,l=(i===0?20:i===4?24:32)*E*(0.75+0.45*k),o=Math.sin(now*7+i)*3;return [x+Math.cos(b)*l*0.5+o,y+Math.sin(b)*l*0.5,x+Math.cos(b)*l,y+Math.sin(b)*l];};
    for(const [w,col] of [[16,'rgba(255,50,20,.22)'],[9,'rgba(255,120,40,.5)'],[5,'rgba(255,200,90,.85)'],[2,'rgba(255,250,220,1)']]){cx.strokeStyle=col;cx.lineWidth=w;
      cx.beginPath();cx.moveTo(ex,ey);cx.quadraticCurveTo((ex+x)/2+Math.sin(now*5)*3,(ey+y)/2-4,x,y);cx.stroke();
      for(let i=0;i<5;i++){const [qx,qy,tx,ty]=doigt(i);cx.beginPath();cx.moveTo(x,y);cx.quadraticCurveTo(qx,qy,tx,ty);cx.stroke();}
      cx.beginPath();cx.ellipse(x,y,13,10,sa,0,TAU);cx.stroke();}
    cx.fillStyle=`rgba(255,180,80,${0.35*f})`;cx.beginPath();cx.ellipse(x,y,13,10,sa,0,TAU);cx.fill();
    if(Math.random()<0.5){const [,,tx,ty]=doigt(Math.floor(Math.random()*5));FX.etincelles(A.x+(tx-px(A.x))/T,A.y+0.6,(py(A.y,0)-ty)/ZH+0.4,1,Math.random()<0.5?'#ffd27a':'#ff5a3a',1.2,0.5);}
  }
  /* ---------- l'orbe ---------- */
  function orbe(S,o,X,Y){
    const ch=REG.orbe.chute,u=clamp(o.t/ch,0,1),meche=clamp((o.t-ch)/REG.orbe.meche,0,1),col=o.couleur==='or'?'#ffc040':'#ff3a20';
    let x,y;
    if(X!=null){x=X;y=Y;}
    else if(u<1){const C=Armure.point('coeur');x=lerp(C.x,px(o.x),u);y=lerp(C.y+30,py(o.y,0.35),u)-Math.sin(u*Math.PI)*30;}
    else{x=px(o.x);y=py(o.y,0.35+0.06*Math.sin(tReel*3));}
    const vite=4+14*meche*meche,p=0.5+0.5*Math.sin(tReel*vite),s=26+16*meche+8*p;
    cx.globalCompositeOperation='lighter';cx.drawImage(FX.lueur(col),x-s,y-s,s*2,s*2);cx.globalAlpha=0.5+0.5*meche;cx.drawImage(FX.nappe(col),x-s*1.6,y-s*1.6,s*3.2,s*3.2);cx.globalAlpha=1;cx.globalCompositeOperation='source-over';
    cx.fillStyle=o.couleur==='or'?'#fff3c0':'#ffd0c0';cx.beginPath();cx.arc(x,y,6+2*p,0,TAU);cx.fill();
    if(meche>0.6&&Math.random()<meche)FX.etincelles((x-OX)/T,(y-OY)/(T*K),0,1,col,2,0.5);
  }

  /* ====================== 4. ce qui vole et brille ====================== */
  function airs(S,dt,now){
    monde();
    /* le rayon de la lanterne : il part de la lanterne, il va au cœur de Grosbec ; coupé, il s'arrête sur le héros */
    if(S.rayon){const ry=S.rayon,l=D.lanternes[ry.couleur],X0=px(l.x),Y0=py(l.y,l.z),C=Armure.point('coeur'),act=ry.t>=REG.rayon.grace,force=act?P2.forceRayon(ry):0,h=S.h;
      let X1=C.x,Y1=C.y;if(ry.coupe){X1=px(h.x);Y1=py(h.y,0.95);}
      const col=ry.couleur==='or'?[255,200,80]:[255,70,40],w=act?3+force/REG.rayon.soigneMax*9:1.2+0.8*Math.sin(now*20);
      cx.globalCompositeOperation='lighter';cx.lineCap='round';
      for(const [k,a] of [[3.2,0.18],[1.8,0.35],[1,0.9],[0.35,1]]){cx.strokeStyle=k<0.5?'rgba(255,255,240,1)':`rgba(${col},${a*(0.8+0.2*Math.sin(now*30))})`;cx.lineWidth=w*k;cx.beginPath();cx.moveTo(X0,Y0);cx.lineTo(X1,Y1);cx.stroke();}
      if(act){const n=Math.ceil(2+force/8);for(let i=0;i<n;i++){const u=((now*(1+force/25)+i/n)%1),xx=lerp(X0,X1,u),yy=lerp(Y0,Y1,u),s=10+force/3;cx.drawImage(FX.lueur(ry.couleur==='or'?'#ffe090':'#ff6040'),xx-s/2,yy-s/2,s,s);}}
      if(ry.coupe){cx.drawImage(FX.lueur(ry.couleur==='or'?'#ffd060':'#ff5030'),X1-30,Y1-30,60,60);if(Math.random()<0.6)FX.etincelles(h.x,h.y,0.95,1,'#ffd27a',2.5,0.6);}
      else if(act){cx.drawImage(FX.lueur('#ffe0a0'),C.x-20-force,C.y-20-force,40+force*2,40+force*2);}
      cx.globalCompositeOperation='source-over';}
    /* les flammes des quatre brasiers */
    cx.globalCompositeOperation='lighter';
    for(const b of D.brasiers){const X=px(b.x),Y=py(b.y,b.z),f=0.85+0.15*Math.sin(now*11+b.x)+0.08*Math.sin(now*27+b.y);cx.globalAlpha=0.55*f;cx.drawImage(FX.nappe('#ff9a3a'),X-40,Y-46,80,80);cx.globalAlpha=1;
      const fl=FX.flamme();for(let i=0;i<3;i++){const w=(14-i*3)*f,hh=w*1.6,dx=Math.sin(now*7+i*2.1+b.x)*2.2;cx.drawImage(fl,X-w/2+dx+(i-1)*3,Y-hh+2,w,hh);}}
    cx.globalCompositeOperation='source-over';
    /* l'orbe portée au-dessus de la tête */
    if(S.orbe&&S.orbe.porte){const h=S.h;orbe(S,S.orbe,px(h.x),py(h.y,(h.__z||0)+1.75));}
    /* le sort qu'on prépare */
    const h=S.h,role=HS.role;
    if(h.lance&&h.mort<=0){const [bx,by]=boutHeros(S),u=h.lance.t/h.lance.dur,q=h.lance.quoi;cx.globalCompositeOperation='lighter';
      if(q==='soin'){const s=50+20*u;cx.globalAlpha=0.5+0.4*u;cx.drawImage(FX.nappe('#7dff9a'),px(h.x)-s/2,py(h.y,0.5)-s/2,s,s);cx.globalAlpha=1;
        if(Math.random()<0.6)FX.emet({x:h.x+rnd(-0.35,0.35),y:h.y+rnd(-0.1,0.1),z:rnd(0,0.4),vz:rnd(0.8,1.5),vie:0.8,s:rnd(5,9),s1:2,img:FX.lueur(Math.random()<0.5?'#9dff7a':'#fff6a0'),add:true});
        cx.strokeStyle=`rgba(140,255,160,${0.6*(1-u)+0.2})`;cx.lineWidth=2;cx.beginPath();cx.ellipse(px(h.x),py(h.y,0),16+12*u,(16+12*u)*K,0,0,TAU);cx.stroke();}
      else if(q==='feu'&&role==='sage'){/* la rune de feu se dessine petit à petit : elle sert de barre de chargement */
        const R=34,ra=FX.tinte(FX.rune(),'#ff8a2a'),X=bx,Y=by-10;cx.save();cx.beginPath();cx.moveTo(X,Y);cx.arc(X,Y,R*1.3,-Math.PI/2,-Math.PI/2+TAU*u);cx.closePath();cx.clip();cx.drawImage(ra,X-R,Y-R,R*2,R*2);cx.restore();
        cx.globalAlpha=0.5+0.5*u;cx.drawImage(FX.lueur('#ff7a20'),X-R,Y-R,R*2,R*2);cx.globalAlpha=1;if(Math.random()<0.4)FX.flammes((X-OX)/T,h.y,(py(h.y,0)-Y)/ZH,1,10,0.6,0.15);}
      else{const feu=q==='feu',col=feu?'#ff8a2a':'#8fe4ff',s=(feu?26:18)+(feu?26:14)*u;cx.globalAlpha=0.55+0.45*u;cx.drawImage(FX.lueur(col),bx-s/2,by-s/2,s,s);cx.globalAlpha=1;
        if(role==='barde'&&Math.random()<(feu?0.3:0.2))FX.notes(h.x+(bx-px(h.x))/T,h.y,(py(h.y,0)-by)/ZH,1,feu?'#ffb04a':'#bff0ff');
        else if(Math.random()<0.5){const a=rnd(0,TAU),r=rnd(0.3,0.6);FX.emet({x:h.x+(bx-px(h.x))/T+Math.cos(a)*r,y:h.y+Math.sin(a)*r*0.4,z:(py(h.y,0)-by)/ZH+rnd(-0.2,0.3),vx:-Math.cos(a)*r*2,vy:-Math.sin(a)*r*0.8,vie:0.45,s:feu?14:3,img:feu?FX.flamme():null,coul:'#eaffff',eclat:!feu,add:true});}}
      cx.globalCompositeOperation='source-over';}
    /* les sorts en vol */
    for(const s of S.tirs)FX.dessinerTir(cx,s,role,dt);
    FX.dessiner(cx,'air');
  }

  /* ====================== 5. les barres ====================== */
  const ROLES={barde:{c:'#ff8fb3',ic:'🎵'},sage:{c:'#6cb6ff',ic:'📖'},alchimiste:{c:'#b48cff',ic:'⚗️'}};
  function barre(x,y,w,h,v,max,coul,fond){cx.fillStyle=fond||'rgba(6,8,16,.78)';rond(x-2,y-2,w+4,h+4,(h+4)/2);cx.fill();const k=clamp(v/max,0,1);if(k>0){cx.fillStyle=coul;rond(x,y,w*k,h,h/2);cx.fill();cx.fillStyle='rgba(255,255,255,.22)';rond(x,y,w*k,h*0.45,h*0.22);cx.fill();}}
  function rond(x,y,w,h,r){r=Math.min(r,w/2,h/2);cx.beginPath();cx.moveTo(x+r,y);cx.arcTo(x+w,y,x+w,y+h,r);cx.arcTo(x+w,y+h,x,y+h,r);cx.arcTo(x,y+h,x,y,r);cx.arcTo(x,y,x+w,y,r);cx.closePath();}
  function texte(t,x,y,taille,coul,al){cx.font=`900 ${taille}px Nunito,system-ui,sans-serif`;cx.textAlign=al||'center';cx.textBaseline='middle';cx.lineWidth=3.5;cx.strokeStyle='rgba(0,0,0,.8)';cx.strokeText(t,x,y);cx.fillStyle=coul;cx.fillText(t,x,y);}
  function hud(S,joy){
    ecran();const h=S.h,g=8;
    /* l'armure : en haut, au milieu ; les trois tiers */
    const w=Math.min(320,Ws*0.36),x=Ws/2-w/2,y=8;
    barre(x,y,w,13,S.phase==='bulle'?0:S.vie,S.vieMax,'#e9b949');
    texte(S.phase==='bulle'?'':Math.ceil(S.vie)+'',Ws/2,y+6.5,12,'#fff');
    for(let i=1;i<=3;i++){const xx=x-12-(3-i)*18,on=i===S.tiers;cx.fillStyle=i<S.tiers?'#5a4a20':on?'#ffd23a':'rgba(10,12,22,.8)';cx.beginPath();cx.arc(xx,y+6.5,7,0,TAU);cx.fill();cx.strokeStyle='rgba(255,226,140,.8)';cx.lineWidth=1.4;cx.stroke();}
    if(S.coque){const k=S.coque.pv/REG.coque.pv;barre(x+w*0.25,y+19,w*0.5,6,S.coque.pv,REG.coque.pv,'#ff7a30');}
    /* le héros : en haut à gauche */
    const R=ROLES[HS.role]||ROLES.barde,hx=10,hy=10;
    cx.fillStyle=R.c;cx.beginPath();cx.arc(hx+14,hy+14,14,0,TAU);cx.fill();cx.strokeStyle='#fff';cx.lineWidth=2;cx.stroke();texte(R.ic,hx+14,hy+15,14,'#fff');
    const coul=h.pv>70?'#4fd16a':h.pv>60?'#ff9a2a':'#ff3b30';
    barre(hx+34,hy+8,130,12,Math.max(0,h.pv),REG.heros.pv,coul);texte(Math.max(0,Math.ceil(h.pv))+'',hx+34+65,hy+14,11,'#fff');
    if(h.bonus>0){const c=h.couleurBonus==='rouge'?'#ff4a2a':'#ffc040';cx.strokeStyle=c;cx.lineWidth=3;cx.beginPath();cx.arc(hx+178,hy+14,9,-Math.PI/2,-Math.PI/2+TAU*h.bonus/REG.orbe.bonus);cx.stroke();texte('×2',hx+178,hy+15,9,c);}
    /* le cri du Pisteur (le code qu'il voit dans sa salle) */
    if(S.cri){const bx=10,by=48;cx.fillStyle='rgba(10,30,18,.88)';rond(bx,by,126,34,10);cx.fill();cx.strokeStyle='#5fcf86';cx.lineWidth=2;cx.stroke();texte('🏹',bx+16,by+17,16,'#fff');S.cri.forEach((s,i)=>texte(s,bx+48+i*28,by+17,19,'#fff'));}
    /* son symbole, sous la bulle */
    if(S.phase==='bulle'&&S.symbole){const X=Ws/2,Y=y+28;cx.fillStyle='rgba(30,22,6,.85)';cx.beginPath();cx.arc(X,Y,22,0,TAU);cx.fill();cx.strokeStyle='#ffd23a';cx.lineWidth=3;cx.stroke();texte(S.symbole,X,Y+1,24,'#fff');}
    /* mort : le compte à rebours, en cercle */
    if(h.mort>0){const [X,Y]=[px(h.x)-camX,py(h.y,0)-camY-30];cx.strokeStyle='rgba(255,255,255,.8)';cx.lineWidth=4;cx.beginPath();cx.arc(X,Y,18,-Math.PI/2,-Math.PI/2+TAU*(1-h.mort/REG.mort.attente));cx.stroke();texte(Math.ceil(h.mort)+'',X,Y+1,15,'#fff');}
    /* le pouce gauche */
    if(joy.id!==null){const R0=joy.R*Hs/innerHeight,bx=joy.bx*Ws/innerWidth,by=joy.by*Hs/innerHeight;cx.strokeStyle='rgba(243,212,138,.4)';cx.lineWidth=2;cx.beginPath();cx.arc(bx,by,R0,0,TAU);cx.stroke();
      cx.fillStyle='rgba(255,255,255,.3)';cx.beginPath();cx.arc(bx+joy.vx*R0,by+joy.vy*R0,R0*0.45,0,TAU);cx.fill();}
    else if(!joy.vu){const R0=44,bx=70,by=Hs-70,p=tReel%1;cx.strokeStyle='rgba(243,212,138,.25)';cx.lineWidth=2;cx.beginPath();cx.arc(bx,by,R0,0,TAU);cx.stroke();cx.strokeStyle=`rgba(255,210,58,${0.9*(1-p)})`;cx.lineWidth=3;cx.beginPath();cx.arc(bx,by,R0*0.42+p*16,0,TAU);cx.stroke();}
    /* le rouge du coup reçu ; la barre rouge qui bat */
    const rouge=Math.max(etat.aie,h.pv<=60&&h.mort<=0?0.12+0.1*Math.sin(tReel*5):0);
    if(rouge>0.01){const G=cx.createRadialGradient(Ws/2,Hs/2,Hs*0.35,Ws/2,Hs/2,Ws*0.62);G.addColorStop(0,'rgba(255,0,0,0)');G.addColorStop(1,`rgba(220,10,10,${rouge})`);cx.fillStyle=G;cx.fillRect(0,0,Ws,Hs);}
    if(etat.flash>0.01){cx.fillStyle=`rgba(255,240,210,${etat.flash})`;cx.fillRect(0,0,Ws,Hs);}
    if(S.code.ouvert){cx.fillStyle='rgba(40,70,160,.14)';cx.fillRect(0,0,Ws,Hs);}
  }

  /* ====================== les événements : ce qui fait un éclat, une secousse ====================== */
  const etat={aie:0,flash:0,vu:0};
  function evenements(S,now){
    for(const e of S.evts){if(e.__vu)continue;e.__vu=1;
      Armure.evenement(e,S,now);SON.evt(e,S);
      const h=S.h;
      switch(e.type){
        case 'aie':etat.aie=0.55;secousse=Math.max(secousse,5);vh.coupT=tReel;break;
        case 'brule':etat.aie=Math.max(etat.aie,0.18);break;
        case 'tir':vh.lanceT=tReel;break;
        case 'touche':{const fort=false,C=Armure.point('coeur');FX.impact(A.x+(C.x-px(A.x))/T*0.6,A.y+0.5,(py(A.y,0)-C.y)/ZH,e.quoi,HS.role,fort);if(e.quoi==='feu')secousse=Math.max(secousse,2.5);break;}
        case 'surColonne':FX.impact(e.x,e.y+0.4,0.6,e.quoi,HS.role);break;
        case 'surBulle':case 'surCoque':{const C=Armure.point('coeur');FX.lueurs(A.x,A.y+1.6,(py(A.y,0)-C.y)/ZH,3,'#ffe090',40,0.8,0.5);break;}
        case 'repCasse':FX.eclats(e.x,e.y,0.6,14,'#6a6470',3,3.4);FX.etincelles(e.x,e.y,0.7,14,'#ff8a40',3);FX.poussieres(e.x,e.y,5,26,1.5);break;
        case 'repEcrase':FX.eclats(e.x,e.y,0.4,10,'#6a6470',2,3);break;
        case 'repare':{const C=Armure.point('coeur');FX.lueurs(A.x,A.y+0.6,1.2,6,'#ffe090',30,1,0.8);FX.etincelles(e.x,e.y,0.8,10,'#ffd27a',2);break;}
        case 'colonneTombe':FX.poussieres(e.x,e.y,9,40,2.6);FX.eclats(e.x,e.y,0.3,8,'#8a8078',2.5,3.5);FX.anneau(e.x,e.y,0.4,1.6,'rgba(220,200,170,.6)',0.5,3);secousse=Math.max(secousse,6);break;
        case 'colonnesDetruites':for(const c of (S.__dernieresColonnes||[])){FX.eclats(c.x,c.y,0.6,10,'#8a8078',2.6,3.6);FX.poussieres(c.x,c.y,6,34,1.8);}secousse=Math.max(secousse,4);break;
        case 'crepiteBoum':{const g=e.cote==='g';for(let i=0;i<60;i++)FX.etincelles(g?rnd(0.5,8.8):rnd(9.2,17.5),rnd(1.5,10.2),0.05,1,'#ffd27a',5,1);for(let i=0;i<10;i++)FX.lueurs(g?rnd(1,8.5):rnd(9.5,17),rnd(2,10),0.1,1,'#ffc040',60,0.8,0.2);secousse=Math.max(secousse,8);etat.flash=Math.max(etat.flash,0.12);break;}
        case 'doigtsBoum':secousse=Math.max(secousse,6);break;
        case 'anneauxBoum':secousse=Math.max(secousse,4);break;
        case 'coqueExplose':{const C=Armure.point('coeur');FX.anneau(A.x,A.y,1,14,'rgba(255,170,80,.8)',0.7,6);etat.flash=0.35;secousse=10;break;}
        case 'coqueCassee':{FX.lueurs(A.x,A.y+1,2.2,10,'#ffb060',50,1.2,1.5);FX.etincelles(A.x,A.y+1,2.2,30,'#ffd27a',5);break;}
        case 'orbeExplose':FX.anneau(e.x,e.y,0.2,3,'rgba(255,200,120,.9)',0.5,4);FX.lueurs(e.x,e.y,1,6,'#ffc040',60,1,1);etat.flash=Math.max(etat.flash,0.2);break;
        case 'orbeBonne':{const l=LT[e.couleur];h.couleurBonus=e.couleur;FX.lueurs(l[0],l[1],1.9,10,e.couleur==='or'?'#ffd060':'#ff5030',60,1.3,1);FX.anneau(l[0],l[1],0.3,2.6,e.couleur==='or'?'rgba(255,210,90,.9)':'rgba(255,90,60,.9)',0.6,4);break;}
        case 'contre':{const P=Armure.point(e.main==='givre'?'mainG':'mainD');FX.lueurs(A.x+(P.x-px(A.x))/T,A.y+0.4,(py(A.y,0)-P.y)/ZH,8,e.main==='givre'?'#ffb060':'#bfefff',50,1,1);break;}
        case 'mort':FX.lueurs(h.x,h.y,0.6,8,'#ff5a5a',40,1,0.6);break;
        case 'releve':FX.anneau(h.x,h.y,0.2,1.6,'rgba(200,240,255,.9)',0.6,3);FX.lueurs(h.x,h.y,0.8,8,'#d0f4ff',40,1,0.6);break;
        case 'saut':FX.poussieres(h.x,h.y,4,18,1.2);break;
        case 'soigne':FX.lueurs(h.x,h.y,0.9,10,'#9dff7a',30,1,0.7);break;
        case 'tiers':case 'codeBon':etat.flash=0.5;secousse=12;{const C=Armure.point('coeur');for(let i=0;i<4;i++)FX.lueurs(A.x,A.y+0.5,2,3,'#ffd27a',80,1.4,1.5);FX.eclats(A.x,A.y+0.4,2.4,40,'#3d4a5a',5,5);FX.etincelles(A.x,A.y+0.4,2.4,60,'#ffd27a',6);}break;
        case 'explose':etat.flash=0.8;secousse=16;FX.eclats(A.x,A.y+0.4,2.4,70,'#3d4a5a',6,6);for(let i=0;i<8;i++)FX.lueurs(A.x+rnd(-1,1),A.y+0.5,rnd(1,4),2,'#ffd27a',120,1.8,2);break;
        case 'symbole':etat.flash=0.25;break;
      }
    }
    if(S.colonnes.length)S.__dernieresColonnes=S.colonnes.slice();
  }

  /* ====================== une image ====================== */
  function image(S,dt,joy){
    const now=tReel;
    evenements(S,now);
    /* les portes : ouvertes un moment quand un réparateur arrive (l'œil s'allume avant) */
    if(!S.__porte)S.__porte=[0,0];
    for(let i=0;i<2;i++){const q=REG.rep.portes[i],pres=S.reps.some(r=>hyp(r.x-q[0],r.y-q[1])<1.3);S.__porte[i]=clamp(S.__porte[i]+(pres?dt*4:-dt*1.2),0,1);}
    for(const r of S.reps)r.rouge=Math.max(0,(r.rouge||0)-dt*0.5);
    etat.aie=Math.max(0,etat.aie-dt*1.6);etat.flash=Math.max(0,etat.flash-dt*1.8);
    majCamera(dt,S.h);secousse=Math.max(0,secousse-dt*22);
    shx=Math.round((Math.random()-0.5)*secousse*Sc);shy=Math.round((Math.random()-0.5)*secousse*Sc);
    Armure.maj(S,now);FX.maj(dt);
    cx.setTransform(1,0,0,1,0,0);
    const ox=Math.round(-camX*Sc)+shx,oy=Math.round(-camY*Sc)+shy;
    if(SW<Ws+2||SH<Hs+2||secousse>0||camY<0){cx.fillStyle='#030406';cx.fillRect(0,0,can.width,can.height);}
    Decor.poserFond(ox,oy);
    solVivant(S,now);
    vague(S);
    debout(S,now,dt);
    airs(S,dt,now);
    hud(S,joy);
  }
  return {image,ROLES,etat,vh};
})();
