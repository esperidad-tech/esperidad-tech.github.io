/* ======================= les poses du golem ======================= */
const ease=e=>e<0.5?2*e*e:1-2*(1-e)*(1-e);
function poseBase(){return {dx:0,dy:Math.sin(tReel*2.2)*2,zoom:1,rot:0,b:[[0.55,-0.75],[0.55,-0.75]],jaw:0.08,genou:0,alpha:1,glow:null,glowK:0,tete:0,gratte:0,coince:false,dalleHaut:false};}
function melange(p,q,m){
  const r=Object.assign({},q);
  for(const k of ['dx','dy','zoom','rot','jaw','tete','glowK'])r[k]=lerp(p[k],q[k],m);
  r.b=[[lerp(p.b[0][0],q.b[0][0],m),lerp(p.b[0][1],q.b[0][1],m)],[lerp(p.b[1][0],q.b[1][0],m),lerp(p.b[1][1],q.b[1][1],m)]];
  return r;
}
function poseArme(g,a,k){
  const p=poseBase(),rig=g.T.rig;p.glow=a.sorte;p.glowK=k;
  if(rig==='humain'){
    if(a.de==='h'){p.b=[[lerp(.55,2.9,k),lerp(-.75,3.1,k)],[lerp(.55,2.9,k),lerp(-.75,3.1,k)]];p.dy-=14*k;p.dalleHaut=g.T.arme==='dalle';}
    else{const i=a.de==='g'?0:1,s=a.de==='g'?-1:1;
      p.b[i]=a.sorte==='or'?[lerp(.55,1.75,k),lerp(-.75,1.95,k)]:[lerp(.55,2.5,k),lerp(-.75,3.0,k)];
      p.rot=s*(a.sorte==='or'?0.18:0.12)*k;p.dx=s*12*k;}
  }else if(rig==='rodeur'){const s=a.de==='g'?-1:1;p.dx=s*55*k;p.rot=s*0.28*k;p.jaw=0.08+0.9*k;}
  else{
    if(a.charge){
      const t=g.t,ar=a.arme,rush=0.35;
      if(t<ar-rush){p.gratte=1;p.dy+=6;p.tete=0.15*Math.sin(t*5);}
      else{const r=Math.min(1,(t-(ar-rush))/rush),r2=r*r;p.zoom=lerp(1,2.3,r2);p.dy=lerp(0,(HY-GY)*0.55,r2);p.gratte=0;}
    }else{const s=a.de==='g'?-1:1;p.dx=s*40*k;p.rot=s*0.3*k;p.tete=s*k;}
  }
  return p;
}
function poseFrappe(g,a,k){
  const p=poseBase(),rig=g.T.rig;
  if(rig==='humain'){
    if(a.de==='h'){p.b=[[lerp(2.9,0.2,k),lerp(3.1,0.05,k)],[lerp(2.9,0.2,k),lerp(3.1,0.05,k)]];p.dy=lerp(-14,14,k);p.zoom=1+0.1*k;p.dalleHaut=g.T.arme==='dalle'&&k<0.6;}
    else{const i=a.de==='g'?0:1,s=a.de==='g'?-1:1;
      p.b[i]=a.sorte==='or'?[lerp(1.75,-1.35,k),lerp(1.95,-1.6,k)]:[lerp(2.5,-0.9,k),lerp(3.0,-1.5,k)];
      p.rot=lerp(s*0.12,-s*0.12,k);p.zoom=1+0.08*k;p.dx=lerp(s*12,-s*14,k);}
  }else if(rig==='rodeur'){const s=a.de==='g'?-1:1;p.dx=lerp(s*55,-s*35,k);p.rot=lerp(s*.28,-s*.2,k);p.jaw=lerp(1,0,k);p.zoom=1+0.15*k;}
  else{
    if(a.charge){const m=Math.min(1,g.t/0.5);p.zoom=lerp(2.3,1,m);p.dy=lerp((HY-GY)*0.55,0,m);}
    else{const s=a.de==='g'?-1:1;p.dx=lerp(s*40,-s*30,k);p.rot=lerp(s*.3,-s*.25,k);p.tete=lerp(s,-s,k);p.zoom=1+0.08*k;}
  }
  return p;
}
function poseOuvert(g){
  const p=poseBase();p.b=[[1.2,1.55],[1.2,1.55]];p.rot=-0.05+0.05*Math.sin(g.t*14)*(g.etat==='sonne'?1.6:1);p.dy=-5;p.jaw=0.45;
  if(g.coince){p.b=[[0.12,0],[0.12,0]];p.dy=16;p.rot=0;p.coince=true;}
  return p;
}
function poseGolem(g){
  const a=g.att;
  switch(g.etat){
    case 'entree':{const e=ease(Math.min(1,g.t/1.8)),p=poseBase();p.dx=lerp(g.cote*103,0,e);p.dy=lerp((FT+10)-GY,0,e)-Math.abs(Math.sin(g.t*7))*4;p.zoom=lerp(0.38,1,e);return p;}
    case 'arme':return poseArme(g,a,ease(Math.min(1,g.t/a.arme)));
    case 'frappe':return poseFrappe(g,a,Math.min(1,g.t/0.12));
    case 'recup':return melange(poseFrappe(g,a,1),poseBase(),Math.min(1,g.t/0.3));
    case 'ouvert':case 'sonne':return poseOuvert(g);
    case 'passe':{const e=Math.min(1,g.t/0.3),p=poseBase();p.zoom=lerp(2.3,3.4,e);p.dy=(HY-GY)*0.55;p.dx=g.passeCote*lerp(0,280,e);p.alpha=1-e;return p;}
    case 'retour':{const e=Math.min(1,g.t/0.8),p=poseBase();p.zoom=lerp(0.5,1,ease(e));p.dy=lerp((FT+10)-GY,0,ease(e));p.rot=Math.sin(g.t*18)*0.12;return p;}
    case 'genou':case 'mort':{const p=poseBase();p.genou=1;p.b=[[0.25,0.1],[0.25,0.1]];p.jaw=0.85;p.tete=0;if(g.etat==='mort')p.alpha=Math.max(0,1-g.t/0.5);return p;}
    default:return poseBase();
  }
}
function hautRig(g){return (g.T.rig==='humain'?128:g.T.rig==='rodeur'?82:88)*g.T.taille;}
function centreGolem(){if(!G)return [225,GY-150];const p=poseGolem(G);return [225+p.dx,GY+p.dy-hautRig(G)*p.zoom];}
function pointParade(de){const [x,y]=centreGolem(),k=G?G.T.taille:1;return de==='g'?[x-70*k,y-20*k]:de==='d'?[x+70*k,y-20*k]:[x,y-100*k];}

/* ======================= le golem, dessin ======================= */
function jambeG(hx,hy,kx,ky,fx,fy,ep){
  ep=ep||1;cx.lineCap='round';
  cx.strokeStyle=col(BRZ);cx.lineWidth=17*ep;ligne(hx,hy,kx,ky);
  cx.strokeStyle=col(FER);cx.lineWidth=14*ep;ligne(kx,ky,fx,fy);
  cx.fillStyle=col(ORr);circ(kx,ky,6.5*ep);cx.fillStyle='#ff6a2a';circ(kx,ky,2*ep);
}
function piedG(x,y,ep){ep=ep||1;poly([[x-15*ep,y],[x-10*ep,y-9*ep],[x+10*ep,y-9*ep],[x+15*ep,y]],col(FER2));cx.fillStyle='#1c1e22';for(const o of [-12,0,12]){cx.beginPath();cx.moveTo(x+o*ep-3,y);cx.lineTo(x+o*ep,y+5*ep);cx.lineTo(x+o*ep+3,y);cx.fill();}}
function fissure(pts){cx.lineCap='round';cx.strokeStyle='rgba(255,60,20,.35)';cx.lineWidth=4;cx.beginPath();cx.moveTo(pts[0][0],pts[0][1]);for(const q of pts)cx.lineTo(q[0],q[1]);cx.stroke();cx.strokeStyle='#ff7a3a';cx.lineWidth=1.4;cx.stroke();}
function yeuxG(y,ec){
  glow('rgba(255,80,30,.9)',-ec-5,y+2,13,0.6);glow('rgba(255,80,30,.9)',ec+5,y+2,13,0.6);
  poly([[-ec-11,y],[-ec,y+3],[-ec,y+6.5],[-ec-11,y+3.5]],'#ff7a30');poly([[ec+11,y],[ec,y+3],[ec,y+6.5],[ec+11,y+3.5]],'#ff7a30');
}
function grilleG(x,y,w,h,ouvert){
  const pul=0.6+0.4*Math.sin(tReel*8);
  if(!ouvert){
    glow('rgba(255,70,30,.9)',x,y,w*1.2,0.5*pul);
    cx.fillStyle='#5a140a';cx.fillRect(x-w/2,y-h/2,w,h);
    cx.fillStyle=`rgba(255,${80+pul*50|0},30,.9)`;cx.fillRect(x-w/2+2,y-h/2+2,w-4,h-4);
    cx.strokeStyle=col(FER2);cx.lineWidth=3;for(let i=1;i<4;i++)ligne(x-w/2+i*w/4,y-h/2,x-w/2+i*w/4,y+h/2);
    cx.strokeStyle=col(BRZ);cx.lineWidth=2.5;cx.strokeRect(x-w/2,y-h/2,w,h);
  }else{
    glow('rgba(255,90,40,1)',x,y,w*2.2,0.8);
    cx.fillStyle='#2a0805';cx.fillRect(x-w/2,y-h/2,w,h);
    cx.fillStyle=col(FER2);cx.save();cx.translate(x-w/2,y-h/2);cx.rotate(-1.0);cx.fillRect(-w/2,0,w/2,h);cx.restore();
    cx.save();cx.translate(x+w/2,y-h/2);cx.rotate(1.0);cx.fillRect(0,0,w/2,h);cx.restore();
    eclat(x,y,w*0.5*(1+0.18*pul));
  }
}
function eclat(x,y,s){cx.fillStyle='#ff4a2a';losange(x,y,s*0.75,s*1.15);cx.fillStyle='#fff3e0';losange(x,y,s*0.36,s*0.58);}
function faille(sens){
  const pul=0.7+0.3*Math.sin(tReel*10);
  const pts=sens==='h'?[[-40,-132],[-24,-126],[-10,-134],[6,-125],[22,-133],[40,-127]]:[[2,-166],[-6,-150],[4,-136],[-5,-120],[3,-104],[-2,-94]];
  cx.lineCap='round';cx.lineJoin='round';
  cx.strokeStyle=`rgba(150,245,255,${0.35*pul})`;cx.lineWidth=11;cx.beginPath();cx.moveTo(pts[0][0],pts[0][1]);for(const q of pts)cx.lineTo(q[0],q[1]);cx.stroke();
  cx.strokeStyle='#effeff';cx.lineWidth=3;cx.stroke();
}
function corneG(s,x,y,taille){cx.strokeStyle=col([206,194,170]);cx.lineWidth=6*taille;cx.lineCap='round';cx.beginPath();cx.moveTo(s*x,y);cx.quadraticCurveTo(s*(x+20*taille),y-6*taille,s*(x+16*taille),y-30*taille);cx.stroke();}
function teteG(type,genou){
  cx.save();cx.translate(0,-170+(genou?6:0));
  if(type==='crete'){
    for(let i=-2;i<=2;i++)poly([[i*6-3,-30],[i*8,-54+Math.abs(i)*5],[i*6+3,-30]],col(BRZ),'#3a2810');
    poly([[-17,2],[17,2],[15,-30],[-15,-30]],col(FER),'#121418');
    cx.fillStyle='#050505';cx.fillRect(-13,-19,26,7);yeuxG(-19,1);
  }else if(type==='cornes'){
    corneG(-1,16,-24,1);corneG(1,16,-24,1);
    poly([[-19,2],[19,2],[18,-32],[-18,-32]],col(FER),'#121418');
    cx.fillStyle='#050505';cx.fillRect(-14,-20,28,7);yeuxG(-20,1);
    cx.fillStyle=col(BRZ);cx.fillRect(-19,-6,38,4);
  }else{
    corneG(-1,22,-20,1.5);corneG(1,22,-20,1.5);
    poly([[-25,4],[25,4],[23,-30],[0,-40],[-23,-30]],col(FER),'#121418');
    yeuxG(-22,3);
    cx.fillStyle='#d9dde3';for(let i=0;i<6;i++){const x=-15+i*6;cx.beginPath();cx.moveTo(x,-4);cx.lineTo(x+3,2);cx.lineTo(x+6,-4);cx.fill();}
  }
  cx.restore();
}
function brasCalc(s,a1,a2){const sx=s*52,sy=-158,ex=sx+s*Math.sin(a1)*44,ey=sy+Math.cos(a1)*44,hx=ex+s*Math.sin(a2)*42,hy=ey+Math.cos(a2)*42;return {sx,sy,ex,ey,hx,hy};}
function dalleObj(x,y,ang){
  cx.save();cx.translate(x,y);cx.rotate(ang);
  poly([[-30,-46],[30,-46],[32,44],[-32,44]],col([72,76,86]),'#121418');
  cx.strokeStyle=col(BRZ);cx.lineWidth=4;cx.strokeRect(-26,-42,52,82);
  cx.strokeStyle=col(ORr);cx.lineWidth=3;cx.beginPath();cx.arc(0,-2,11,0,7);cx.stroke();ligne(-6,-6,0,4);ligne(0,4,6,-6);
  for(let i=0;i<4;i++)poly([[-34,-36+i*22],[-44,-30+i*22],[-34,-24+i*22]],col(FER)),poly([[34,-36+i*22],[44,-30+i*22],[34,-24+i*22]],col(FER));
  cx.restore();
}
function fauxObj(hx,hy,ang,s){
  const ux=s*Math.sin(ang),uy=Math.cos(ang),bx=hx+ux*62,by=hy+uy*62;
  cx.strokeStyle=col([110,80,44]);cx.lineWidth=7;cx.lineCap='round';ligne(hx-ux*22,hy-uy*22,bx,by);
  const nx=-uy*s,ny=ux*s;
  cx.beginPath();cx.moveTo(bx,by);cx.quadraticCurveTo(bx+nx*30+ux*18,by+ny*30+uy*18,bx+nx*58+ux*-4,by+ny*58+uy*-4);cx.quadraticCurveTo(bx+nx*28+ux*6,by+ny*28+uy*6,bx,by);
  cx.fillStyle=col([170,178,190]);cx.fill();cx.strokeStyle='#e8eef6';cx.lineWidth=2;cx.stroke();
}
function glowBras(r,c,k,ouv){
  const pul=ouv?(0.75+0.25*Math.sin(tReel*30)):1;
  for(let i=0;i<=4;i++){const t=i/4;glow(c,lerp(r.ex,r.hx,t),lerp(r.ey,r.hy,t),26+i*4,0.35*k*pul);}
  glow(c,r.hx,r.hy,44,0.6*k*pul);
}
function humain(g,po){
  const T=g.T,gen=po.genou,arme=T.arme,a=g.att;
  for(const s of [-1,1]){
    if(!gen){jambeG(s*20,-78,s*29,-40,s*27,0);piedG(s*27,0);}
    else{jambeG(s*20,-34,s*36,-6,s*16,-2);}
  }
  cx.translate(0,gen?44:0);
  if(arme==='dalle'&&po.coince)dalleObj(0,-30,1.45);
  const fen=g.etat==='arme'&&a&&a.arme-g.t<=FEN;
  const r0=brasCalc(-1,po.b[0][0],po.b[0][1]),r1=brasCalc(1,po.b[1][0],po.b[1][1]);
  const dessBras=(r,s)=>{cx.lineCap='round';cx.strokeStyle=col(BRZ);cx.lineWidth=19;ligne(r.sx,r.sy,r.ex,r.ey);cx.strokeStyle=col(FER);cx.lineWidth=16;ligne(r.ex,r.ey,r.hx,r.hy);cx.fillStyle=col(ORr);circ(r.ex,r.ey,6);};
  const derriere=po.b[0][0]<0.3&&po.b[1][0]<0.3;
  if(derriere){dessBras(r0,-1);dessBras(r1,1);}
  poly([[-30,-92],[30,-92],[25,-70],[-25,-70]],col(FER),'#121418');
  cx.fillStyle=col(BRZ);cx.fillRect(-28,-86,56,4);
  poly([[-50,-168],[50,-168],[44,-112],[32,-90],[-32,-90],[-44,-112]],col(ROC),'#15171b');
  poly([[-44,-164],[-6,-166],[-14,-130],[-40,-118]],col(ROCH));
  poly([[44,-112],[32,-90],[10,-92],[26,-118]],col([38,40,47]));
  cx.fillStyle=col(BRZ);cx.fillRect(-50,-170,100,7);
  cx.fillStyle=col(ORr);for(const x of [-40,-20,0,20,40])circ(x,-166.5,2);
  fissure([[-36,-106],[-28,-117],[-32,-130]]);fissure([[30,-152],[22,-141],[27,-128]]);
  grilleG(0,-128,34,26,g.etat==='genou'||g.etat==='mort');
  if(g.etat==='ouvert'||g.etat==='sonne')faille(g.faille);
  if(T.tete==='masque'){for(const s of [-1,1]){cx.fillStyle=col([60,62,70]);cx.fillRect(s*48-9,-206,18,40);cx.fillStyle=col(BRZ);cx.fillRect(s*48-11,-208,22,6);
    for(let i=0;i<3;i++){const tt=(tReel*0.7+i/3)%1;cx.globalAlpha=0.35*(1-tt)*po.alpha;cx.fillStyle='#9aa0aa';circ(s*48+Math.sin(tt*6+i)*6,-212-tt*50,6+tt*10);}cx.globalAlpha=po.alpha;}}
  teteG(T.tete,gen);
  if(!derriere){dessBras(r0,-1);dessBras(r1,1);}
  for(const s of [-1,1]){cx.fillStyle=col(BRZ);circ(s*52,-160,17);cx.strokeStyle=col(ORr);cx.lineWidth=2.5;cx.beginPath();cx.arc(s*52,-160,17,0,7);cx.stroke();}
  const actif=[];if(g.etat==='arme'||g.etat==='frappe'){if(a.de==='g'||a.de==='h')actif.push(0);if(a.de==='d'||a.de==='h')actif.push(1);}
  if(po.glow){for(const i of actif)glowBras(i?r1:r0,COUL[po.glow],po.glowK,fen);}
  if(arme==='faux'){const i=actif.length===1?actif[0]:0,r=i?r1:r0,s=i?1:-1,ang=Math.atan2(s*(r.hx-r.ex),(r.hy-r.ey));fauxObj(r.hx,r.hy,ang,s);}
  if(arme==='dalle'&&!po.coince){if(po.dalleHaut)dalleObj((r0.hx+r1.hx)/2,(r0.hy+r1.hy)/2-30,0);else dalleObj(r1.hx+6,r1.hy-10,0.08);}
  const poing=arme==='poings'?17:11;
  for(const r of [r0,r1]){if(arme==='dalle'&&!po.coince&&r===r1&&!po.dalleHaut)continue;cx.fillStyle=col(FER2);circ(r.hx,r.hy,poing);if(arme==='poings'){cx.fillStyle=col(FER);for(let i=0;i<4;i++){const an=i*1.57+0.6;poly([[r.hx+Math.cos(an)*14,r.hy+Math.sin(an)*14],[r.hx+Math.cos(an)*24,r.hy+Math.sin(an)*24],[r.hx+Math.cos(an+0.4)*14,r.hy+Math.sin(an+0.4)*14]],col(FER));}}}
  if(po.glow){for(const i of actif){const r=i?r1:r0;glow(COUL[po.glow],r.hx,r.hy,34,0.5*po.glowK);}}
}
function rodeurFace(g,po){
  const gen=po.genou,j=po.jaw;
  for(const s of [-1,1]){jambeG(s*24,-44,s*33,-22,s*30,0,0.8);piedG(s*30,0,0.8);}
  cx.translate(0,gen?22:0);
  poly([[-60,-58],[-54,-96],[-26,-118],[26,-118],[54,-96],[60,-58],[42,-42],[-42,-42]],col(ROC),'#15171b');
  poly([[-50,-94],[-24,-114],[-4,-114],[-20,-96]],col(ROCH));
  for(const x of [-36,-12,12,36])poly([[x-8,-104+Math.abs(x)*0.25],[x,-130+Math.abs(x)*0.35],[x+8,-104+Math.abs(x)*0.25]],col(FER));
  yeuxG(-100,3);
  fissure([[-44,-62],[-36,-72],[-40,-84]]);
  const up=-82-16*j,lo=-58+12*j;
  poly([[-46,up+4],[46,up+4],[42,lo],[-42,lo]],'#1a0705');
  glow('rgba(255,80,30,1)',0,(up+lo)/2,30+20*j,0.4+0.4*j);
  if(gen||g.etat==='mort')eclat(0,(up+lo)/2+2,16*(1+0.15*Math.sin(tReel*8)));
  poly([[-54,up-9],[54,up-9],[50,up+4],[-50,up+4]],col(BRZ),'#3a2810');
  poly([[-46,lo],[46,lo],[40,lo+12],[-40,lo+12]],col(BRZ),'#3a2810');
  cx.fillStyle='#d9dde3';
  for(let i=0;i<8;i++){const x=-42+i*12;cx.beginPath();cx.moveTo(x,up+4);cx.lineTo(x+6,up+13);cx.lineTo(x+12,up+4);cx.fill();cx.beginPath();cx.moveTo(x+2,lo);cx.lineTo(x+7,lo-8);cx.lineTo(x+12,lo);cx.fill();}
  if(po.glow){const fen=g.etat==='arme'&&g.att.arme-g.t<=FEN,pul=fen?0.75+0.25*Math.sin(tReel*30):1;glow(COUL[po.glow],-40,(up+lo)/2,40,0.5*po.glowK*pul);glow(COUL[po.glow],40,(up+lo)/2,40,0.5*po.glowK*pul);glow(COUL[po.glow],0,up,50,0.4*po.glowK*pul);}
}
function belierFace(g,po){
  const gen=po.genou;
  poly([[-66,-56],[-60,-104],[-30,-122],[30,-122],[60,-104],[66,-56]],col([40,42,49]),'#15171b');
  for(let i=0;i<5;i++){const x=-28+i*14;poly([[x-5,-118],[x,-138+Math.abs(i-2)*4],[x+5,-118]],col(FER));}
  const gr=po.gratte?Math.sin(tReel*16)*10:0;
  for(const s of [-1,1]){if(!gen){jambeG(s*30,-52,s*38,-26,s*34+(s<0?gr:0),s<0&&gr>0?-gr*0.6:0,0.9);piedG(s*34+(s<0?gr:0),0,0.9);}else jambeG(s*30,-20,s*42,-4,s*20,-2,0.9);}
  cx.translate(0,gen?30:0);
  cx.save();cx.translate(0,po.gratte?8:0);cx.rotate(po.tete*0.3);
  poly([[-26,-114],[26,-114],[22,-62],[12,-50],[-12,-50],[-22,-62]],col(FER),'#121418');
  poly([[-20,-110],[20,-110],[16,-92],[-16,-92]],col(BRZ));
  grilleG(0,-80,22,16,gen||g.etat==='mort');
  yeuxG(-100,10);
  for(const s of [-1,1]){
    cx.strokeStyle=col([206,194,170]);cx.lineWidth=9;cx.lineCap='round';cx.beginPath();cx.arc(s*36,-98,18,s<0?-0.3:Math.PI+0.3,s<0?Math.PI*1.6:-Math.PI*0.6,s>0);cx.stroke();
    cx.lineWidth=5;cx.beginPath();cx.arc(s*36,-98,8,0,Math.PI*1.4);cx.stroke();
  }
  if(po.glow){const fen=g.etat==='arme'&&g.att.arme-g.t<=FEN,pul=fen?0.75+0.25*Math.sin(tReel*30):1;glow(COUL[po.glow],-36,-98,46,0.55*po.glowK*pul);glow(COUL[po.glow],36,-98,46,0.55*po.glowK*pul);}
  cx.restore();
}
function etoiles(x,y){
  cx.fillStyle='#ffe066';
  for(let i=0;i<3;i++){const a=tReel*4+i*2.09,px=x+Math.cos(a)*22,py=y+Math.sin(a)*7;cx.beginPath();cx.moveTo(px,py-6);cx.lineTo(px+1.8,py-1.8);cx.lineTo(px+6,py);cx.lineTo(px+1.8,py+1.8);cx.lineTo(px,py+6);cx.lineTo(px-1.8,py+1.8);cx.lineTo(px-6,py);cx.lineTo(px-1.8,py-1.8);cx.closePath();cx.fill();}
}
function dessinerGolem(){
  const g=G;if(!g)return;
  const po=poseGolem(g),T=g.T,k=T.taille*po.zoom,x=225+po.dx,y=GY+po.dy;
  cx.globalAlpha=po.alpha;
  cx.fillStyle='rgba(0,0,0,.45)';ell(x,y,64*k,14*k);
  FL=g.flash;cx.save();cx.translate(x,y);cx.scale(k,k);cx.rotate(po.rot);
  if(T.rig==='humain')humain(g,po);else if(T.rig==='rodeur')rodeurFace(g,po);else belierFace(g,po);
  cx.restore();FL=0;cx.globalAlpha=1;
  if(g.etat==='sonne'||g.etat==='retour')etoiles(x,y-(T.rig==='humain'?222:140)*k);
}

/* ======================= le Pisteur, de dos ======================= */
function dessinerPisteur(){
  const e=P.etat,t=P.t;let x=225,y=HY,rot=0,sc=1.05;
  if(e==='esquive'){const k=t<0.12?t/0.12:t<0.36?1:Math.max(0,1-(t-0.36)/0.19);x+=P.dir*128*k;rot=P.dir*0.2*k;y+=6*k;}
  if(e==='touche'){const k=1-t/0.5;y+=16*k;rot=0.09*Math.sin(t*40)*k;}
  if(e==='acheve'){const k=t<0.3?ease(t/0.3):t<0.55?1:Math.max(0,1-(t-0.55)/0.25);y-=(HY-GY)*0.58*k;sc*=1-0.42*k;}
  cx.fillStyle='rgba(0,0,0,.4)';ell(x,y-6,60*sc,12*sc);
  cx.save();cx.translate(x,y);cx.rotate(rot);cx.scale(sc,sc);
  const br=Math.sin(tReel*3)*1.5;
  let mD=[46,-126+br],mG=[-42,-124+br],dag=-1.35,flash=0;
  if(e==='coup'){const u=P.coupU,k=Math.min(1,t/0.14);mD=[34+u[0]*lerp(-60,60,k),-150+u[1]*lerp(-60,60,k)];dag=Math.atan2(u[1],u[0]);}
  if(e==='parade'){mD=P.pDir==='g'?[-72,-176]:P.pDir==='d'?[86,-182]:[24,-236];dag=P.pDir==='g'?-2.6:P.pDir==='d'?-0.5:-1.57;flash=Math.max(0,1-t/0.3);}
  if(e==='acheve'){const k=Math.min(1,t/0.32);mD=[lerp(30,8,k),lerp(-236,-150,k)];mG=[lerp(-20,-4,k),lerp(-230,-152,k)];dag=lerp(-1.57,1.57,k);}
  if(e==='siffle'){mG=[-8,-198];mD=[60,-150];}
  if(e==='touche'){mD=[64,-150];mG=[-62,-148];}
  if(e==='esquive'){mD=[52,-140];mG=[-50,-138];}
  for(const s of [-1,1]){cx.strokeStyle='#4a3524';cx.lineWidth=17;cx.lineCap='round';ligne(s*14,-92,s*19,-18);cx.fillStyle='#22170e';ell(s*20,-8,12,10);}
  const sway=Math.sin(tReel*2.2)*3-(e==='esquive'?P.dir*14:0);
  cx.fillStyle='#1d3a25';cx.beginPath();cx.moveTo(-38,-168);cx.quadraticCurveTo(-50,-118,-62+sway,-26);cx.lineTo(62+sway,-26);cx.quadraticCurveTo(50,-118,38,-168);cx.closePath();cx.fill();
  cx.strokeStyle='rgba(0,0,0,.25)';cx.lineWidth=2;for(const o of [-26,-8,10,28]){cx.beginPath();cx.moveTo(o*0.6,-160);cx.quadraticCurveTo(o*0.9,-100,o*1.2+sway*0.6,-30);cx.stroke();}
  cx.strokeStyle='#7a5530';cx.lineWidth=4.5;cx.beginPath();cx.moveTo(-34,-188);cx.quadraticCurveTo(-58,-128,26,-92);cx.stroke();
  cx.strokeStyle='rgba(235,235,235,.6)';cx.lineWidth=1;ligne(-34,-188,26,-92);
  cx.save();cx.translate(16,-150);cx.rotate(0.32);cx.fillStyle='#6a4524';cx.fillRect(-7,-42,14,72);cx.fillStyle='#4a2e14';cx.fillRect(-7,-42,14,5);
  for(const o of [-4,0,4]){cx.strokeStyle='#d9c9a0';cx.lineWidth=1.5;ligne(o,-42,o,-52);cx.fillStyle='#c03a2a';poly([[o-2.5,-58],[o+2.5,-58],[o+2,-50],[o-2,-50]],'#c03a2a');}
  cx.restore();
  cx.fillStyle='#3c6b3d';ell(0,-166,40,13);
  const bras=(s,m)=>{cx.strokeStyle='#2f5634';cx.lineWidth=13;cx.lineCap='round';const sx=s*34,sy=-160,ex=(sx+m[0])/2+s*8,ey=(sy+m[1])/2+8;cx.beginPath();cx.moveTo(sx,sy);cx.lineTo(ex,ey);cx.lineTo(m[0],m[1]);cx.stroke();cx.fillStyle='#e2b08a';circ(m[0],m[1],6);};
  bras(-1,mG);bras(1,mD);
  const bx=Math.cos(dag),by=Math.sin(dag);
  cx.strokeStyle='#5be0e6';cx.lineWidth=8;cx.lineCap='round';ligne(mD[0],mD[1],mD[0]+bx*30,mD[1]+by*30);
  cx.strokeStyle='#effbfd';cx.lineWidth=3.5;ligne(mD[0],mD[1],mD[0]+bx*30,mD[1]+by*30);
  cx.strokeStyle='#5b3b1f';cx.lineWidth=6;ligne(mD[0]-bx*3,mD[1]-by*3,mD[0]-bx*10,mD[1]-by*10);
  cx.fillStyle='#33603a';cx.beginPath();cx.moveTo(-22,-174);cx.quadraticCurveTo(-25,-206,0,-222);cx.quadraticCurveTo(25,-206,22,-174);cx.quadraticCurveTo(0,-166,-22,-174);cx.fill();
  cx.strokeStyle='rgba(0,0,0,.25)';cx.lineWidth=2;cx.beginPath();cx.moveTo(0,-220);cx.quadraticCurveTo(-4,-196,0,-172);cx.stroke();
  if(e==='siffle'){cx.strokeStyle='rgba(255,255,255,.7)';cx.lineWidth=2;for(let i=0;i<3;i++){cx.beginPath();cx.arc(-8,-206,10+i*9+((tReel*30)%9),-2.6,-0.5);cx.stroke();}}
  if(flash>0)glow('rgba(255,215,90,1)',mD[0]+bx*20,mD[1]+by*20,50*flash+14,flash);
  cx.restore();
}

/* ======================= les bêtes, les traces, les repères ======================= */
function dessinerBete(b){
  if(b.t<0)return;const s=Math.sin(b.pas),c2=Math.cos(b.pas);
  cx.fillStyle='rgba(0,0,0,.35)';ell(b.x,b.y,40,9);
  cx.save();cx.translate(b.x,b.y);cx.scale(b.dir*2.1,2.1);
  cx.strokeStyle='#18202c';cx.lineWidth=4.5;cx.lineCap='round';ligne(-12,-16,-14+s*8,0);ligne(12,-16,13-s*8,0);
  cx.fillStyle='#2b3648';ell(0,-20+c2*1.5,20,9);
  cx.strokeStyle='#2b3648';cx.lineWidth=4;cx.beginPath();cx.moveTo(-18,-22);cx.quadraticCurveTo(-30,-30+s*3,-34,-22);cx.stroke();
  ell(20,-27,8.5,6.5);poly([[24,-29],[34,-25],[25,-22]],'#2b3648');poly([[15,-31],[17,-40],[21,-32]],'#222b3a');
  cx.strokeStyle='#18202c';cx.lineWidth=4.5;ligne(-8,-16,-6-s*8,0);ligne(8,-16,10+s*8,0);
  glow('rgba(110,243,238,1)',25,-29,7,0.8);cx.fillStyle='#bffffb';circ(25,-29,1.6);
  cx.strokeStyle='rgba(110,243,238,.7)';cx.lineWidth=1.4;cx.beginPath();cx.moveTo(-12,-25);cx.quadraticCurveTo(0,-30,12,-25);cx.stroke();
  cx.restore();
}
function dessinerTraces(){
  const now=performance.now()/1000;
  for(const tr of traces){
    const age=tr.fin<0?0:now-tr.fin,a=Math.max(0,1-age/0.3);if(a<=0||tr.pts.length<2)continue;
    cx.lineCap='round';cx.lineJoin='round';
    cx.strokeStyle=`rgba(90,230,240,${0.4*a})`;cx.lineWidth=16;cx.beginPath();cx.moveTo(tr.pts[0][0],tr.pts[0][1]);for(const q of tr.pts)cx.lineTo(q[0],q[1]);cx.stroke();
    cx.strokeStyle=`rgba(240,253,255,${0.95*a})`;cx.lineWidth=5;cx.stroke();
  }
  for(let i=traces.length-1;i>=0;i--)if(traces[i].fin>0&&now-traces[i].fin>0.35)traces.splice(i,1);
}
function dessinerAlerte(){
  const g=G;if(!g||g.etat!=='arme')return;
  const a=g.att,k=Math.min(1,g.t/a.arme),fen=a.arme-g.t<=FEN,pul=fen?0.5+0.5*Math.sin(tReel*28):0;
  const c=a.sorte==='rouge'?'255,59,48':a.sorte==='or'?'255,210,58':'255,255,255';
  const al=0.12+0.3*k+0.18*pul;
  if(a.de==='g'||a.de==='d'){const x0=a.de==='g'?0:W,gr=cx.createLinearGradient(x0,0,a.de==='g'?90:W-90,0);gr.addColorStop(0,`rgba(${c},${al})`);gr.addColorStop(1,`rgba(${c},0)`);cx.fillStyle=gr;cx.fillRect(a.de==='g'?0:W-90,FT-40,90,H-FT+40);}
  else if(a.de==='h'){const [x,y]=centreGolem();glow(`rgba(${c},1)`,x,y-120*g.T.taille,110,al);}
  else{cx.strokeStyle=`rgba(${c},${al})`;cx.lineWidth=26;cx.strokeRect(0,0,W,H);}
  if(indiceParade&&fen&&a.sorte!=='rouge'&&!a.charge){
    const [x,y]=centreGolem(),t=[x,y+70],e=a.de==='g'?[70,y-40]:a.de==='d'?[W-70,y-40]:[x,y-170];
    cx.strokeStyle=`rgba(255,210,58,${0.7+0.3*pul})`;cx.lineWidth=5;cx.setLineDash([10,8]);ligne(t[0],t[1],e[0],e[1]);cx.setLineDash([]);
    cx.fillStyle='#ffd23a';circ(e[0],e[1],9);
  }
}
function dessinerIndiceEclat(){
  if(!indiceEclat||!G||G.etat!=='genou')return;
  const po=poseGolem(G),k=G.T.taille,x=225+po.dx,yy=GY+po.dy+(G.T.rig==='humain'?(44-128):G.T.rig==='rodeur'?(22-70):(30-80))*k;
  const p=0.5+0.5*Math.sin(tReel*7);cx.strokeStyle=`rgba(255,210,58,${0.6+0.4*p})`;cx.lineWidth=5;cx.beginPath();cx.arc(x,yy,(34+10*p)*k,0,7);cx.stroke();
}
function dessinerParts(sol){
  for(const q of parts){
    const a=Math.max(0,q.vie/q.max);
    if(q.k==='tas'){if(!sol)continue;cx.globalAlpha=Math.min(1,a*2);cx.fillStyle='#2b2d33';ell(q.x,q.y,52*q.s,13*q.s);cx.fillStyle='#3a3d45';ell(q.x-16*q.s,q.y-5*q.s,20*q.s,9*q.s);ell(q.x+18*q.s,q.y-3*q.s,16*q.s,7*q.s);cx.globalAlpha=1;continue;}
    if(sol)continue;
    if(q.k==='c'){cx.globalAlpha=Math.min(1,a*2);cx.fillStyle=q.c;cx.save();cx.translate(q.x,q.y);cx.rotate(q.r);cx.fillRect(-q.s/2,-q.s/2,q.s,q.s*0.8);cx.restore();}
    else if(q.k==='e'){cx.globalAlpha=a;cx.strokeStyle=q.c;cx.lineWidth=2.5;ligne(q.x,q.y,q.x-q.vx*0.03,q.y-q.vy*0.03);}
    else if(q.k==='cr'){cx.globalAlpha=a;cx.fillStyle=a>0.5?'#fff3e0':'#ff5030';losange(q.x,q.y,q.s*0.6,q.s);}
    else if(q.k==='onde'){cx.globalAlpha=a;cx.strokeStyle='#ffb070';cx.lineWidth=4;cx.beginPath();cx.arc(q.x,q.y,(1-a)*110+8,0,7);cx.stroke();}
    else if(q.k==='p'){cx.globalAlpha=a*0.5;cx.fillStyle='#8a8f9c';circ(q.x,q.y,q.s*(1.5-a*0.5));}
    else if(q.k==='t'){cx.globalAlpha=Math.min(1,a*2.5);cx.font='900 20px Nunito,sans-serif';cx.textAlign='center';cx.textBaseline='middle';cx.lineWidth=4;cx.strokeStyle='rgba(0,0,0,.75)';cx.strokeText(q.t,q.x,q.y);cx.fillStyle=q.c;cx.fillText(q.t,q.x,q.y);}
  }
  cx.globalAlpha=1;
  for(const f of glowFlash)glow('rgba(255,220,120,1)',f.x,f.y,40+60*(1-f.v),f.v);
}
function coeur(x,y,s,plein){
  cx.beginPath();cx.moveTo(x,y+s*0.35);cx.bezierCurveTo(x,y,x-s*0.5,y,x-s*0.5,y+s*0.35);cx.bezierCurveTo(x-s*0.5,y+s*0.65,x,y+s*0.8,x,y+s);cx.bezierCurveTo(x,y+s*0.8,x+s*0.5,y+s*0.65,x+s*0.5,y+s*0.35);cx.bezierCurveTo(x+s*0.5,y,x,y,x,y+s*0.35);
  if(plein){cx.fillStyle='#e8364a';cx.fill();}cx.strokeStyle=plein?'#ffb3bd':'rgba(255,180,190,.45)';cx.lineWidth=1.4;cx.stroke();
}
function dessinerHUD(){
  for(let i=0;i<5;i++)coeur(22+i*22,12,18,i<P.coeurs);
  cx.textAlign='left';cx.textBaseline='alphabetic';
  if(combo>=2){cx.font='700 22px Cinzel,Georgia,serif';cx.fillStyle='#f3d48a';cx.fillText('×'+combo,12,56);}
  if(etatJeu==='jeu'){cx.font='800 11px Nunito,sans-serif';cx.fillStyle='rgba(241,231,208,.65)';cx.fillText(`Golem ${duelI+1} / ${DUELS.length}`,13,74);}
  if(G&&G.etat!=='mort'){
    cx.fillStyle='rgba(5,8,16,.72)';cx.beginPath();cx.roundRect?cx.roundRect(150,4,150,36,8):cx.rect(150,4,150,36);cx.fill();
    cx.textAlign='center';cx.font='700 14px Cinzel,Georgia,serif';cx.fillStyle='#f3d48a';cx.fillText(G.T.nom,225,20);
    cx.fillStyle='rgba(255,255,255,.14)';cx.fillRect(160,27,130,6);cx.fillStyle='#ff6a3a';cx.fillRect(160,27,130*G.pv/G.pvMax,6);
  }
  const r=rang(),i=RANGS.indexOf(r),nx=RANGS[i+1],pr=nx?(note-r[1])/(nx[1]-r[1]):1,pop=1+rangPop*0.4,x=414,y=78;
  if(r[0]==='S')glow('rgba(255,210,58,1)',x,y-14,34,0.45+0.2*Math.sin(tReel*8));
  cx.save();cx.translate(x,y);cx.scale(pop,pop);cx.font='700 40px Cinzel,Georgia,serif';cx.textAlign='center';cx.lineWidth=4;cx.strokeStyle='rgba(0,0,0,.6)';cx.strokeText(r[0],0,0);cx.fillStyle=r[2];cx.fillText(r[0],0,0);cx.restore();
  cx.fillStyle='rgba(255,255,255,.12)';cx.fillRect(386,86,56,5);cx.fillStyle=r[2];cx.fillRect(386,86,56*clamp(pr,0,1),5);
  if(bandeau){const t=tReel-bandeau.t;if(t>2.2)bandeau=null;else{
    const a=Math.min(1,t*4,(2.2-t)*3),by=Math.round(H*0.3);cx.globalAlpha=a;
    cx.fillStyle='rgba(5,8,16,.7)';cx.fillRect(0,by,W,84);cx.strokeStyle='rgba(214,170,80,.6)';cx.lineWidth=1.5;ligne(0,by,W,by);ligne(0,by+84,W,by+84);
    cx.textAlign='center';cx.fillStyle='#f3d48a';cx.font='700 30px Cinzel,Georgia,serif';cx.fillText(bandeau.b,225,by+46);
    cx.font='800 14px Nunito,sans-serif';cx.fillStyle='rgba(241,231,208,.8)';cx.fillText(bandeau.a,225,by+70);cx.globalAlpha=1;}}
}
function dessiner(){
  let ox=0,oy=0;if(sec>0.2){ox=(Math.random()*2-1)*sec;oy=(Math.random()*2-1)*sec;cx.setTransform(1,0,0,1,0,0);cx.fillStyle='#04060b';cx.fillRect(0,0,cv.width,cv.height);}
  cx.setTransform(S,0,0,S,ox*S,oy*S);
  cx.drawImage(fond,0,0,W,H);
  dessinerPortes();grosbecCache();
  dessinerParts(true);
  const betesDerriere=betes.filter(b=>b.y<GY),betesDevant=betes.filter(b=>b.y>=GY);
  for(const b of betesDerriere)dessinerBete(b);
  dessinerGolem();
  for(const b of betesDevant)dessinerBete(b);
  dessinerIndiceEclat();
  dessinerAlerte();
  dessinerPisteur();
  dessinerParts(false);
  dessinerTraces();
  const vm=vitesseMonde();
  if(vm<0.99){const k=(1-vm)/0.7;cx.fillStyle=`rgba(70,50,170,${0.22*k})`;cx.fillRect(-10,-10,W+20,H+20);cx.strokeStyle=`rgba(200,182,255,${0.5*k})`;cx.lineWidth=16;cx.strokeRect(-4,-4,W+8,H+8);}
  if(flashBlanc>0){cx.fillStyle=`rgba(255,240,220,${flashBlanc*0.5})`;cx.fillRect(-10,-10,W+20,H+20);}
  if(flashRouge>0){cx.fillStyle=`rgba(255,30,40,${flashRouge*0.35})`;cx.fillRect(-10,-10,W+20,H+20);}
  cx.setTransform(S,0,0,S,0,0);
  dessinerHUD();
}

/* ======================= la boucle ======================= */
let dernier=performance.now(),fpsN=0,fpsT=0,fps=60,fpsMin=60;
function boucle(now){
  let dt=Math.min(0.05,(now-dernier)/1000);dernier=now;
  fpsN++;fpsT+=dt;if(fpsT>=1){fps=fpsN/fpsT;if(etatJeu==='jeu'&&!enPause&&tReel>3){fpsMin=Math.min(fpsMin,fps);if(fps<38){lentT++;if(lentT>=2&&finesse>0.56){finesse*=0.8;lentT=0;try{localStorage.setItem('duelFinesse',finesse);}catch(e){}ajuster();}}else lentT=0;}fpsN=0;fpsT=0;}
  if(etatJeu==='jeu'&&!enPause){
    if(hitstop>0)hitstop-=dt;
    else{
      tReel+=dt;majPisteur(dt);
      const wdt=dt*vitesseMonde();tMonde+=wdt;
      majGolem(wdt);majDuels(wdt);majBetes(dt);majParts(wdt);majNote(dt);majMsg();GB.t+=dt;
      for(let i=0;i<2;i++)porte[i]=Math.max(0,porte[i]-wdt*0.6);
      if(defaiteDans>0){defaiteDans-=dt;if(defaiteDans<=0)defaite();}
      if(finDans>0){finDans-=dt;if(finDans<=0)montrerVictoire();}
    }
    sec=Math.max(0,sec-dt*30);flashBlanc=Math.max(0,flashBlanc-dt*3);flashRouge=Math.max(0,flashRouge-dt*2);
  }
  dessiner();
  requestAnimationFrame(boucle);
}

/* ======================= les écrans ======================= */
const regles=$('regles'),pauseEl=$('pause'),finEl=$('fin'),finCarte=$('finCarte'),btnPause=$('btnPause'),esqG=$('esqG'),esqD=$('esqD');
function boutonsJeu(on){for(const b of [btnPause,esqG,esqD])b.classList.toggle('on',on);if(!on)btnSiff.classList.remove('on');}
function demarrer(i){
  parts=[];betes=[];traces=[];glowFlash.length=0;
  resetP();note=0;derniers=[];combo=0;hitstop=0;ralentiJusqu=-9;defaiteDans=0;finDans=0;
  if(!i){stats={coups:0,parades:0,esquives:0,parfaites:0,failles:0,eclats:0,sifflets:0,recus:0,sonnes:0,bang:0,debut:tReel};comboMax=0;noteMax=0;}
  btnSiff.classList.remove('on','anneau');finIndiceEsq();
  etatJeu='jeu';enPause=false;
  regles.classList.remove('on');pauseEl.classList.remove('on');finEl.classList.remove('on');boutonsJeu(true);
  GB.geste='repos';GB.bulleT=-9;
  lancerDuel(i||0);
}
function ouvrirPause(){
  if(etatJeu!=='jeu')return;enPause=true;pauseEl.classList.add('on');
  $('pSon').textContent='Son : '+(sonOn?'oui':'non');$('pDur').textContent='Golems : '+(dur?'costauds':'normaux');
  $('pMesures').textContent=`Si ça rame, lis-moi ça : ${Math.round(fps)} images par seconde (la pire seconde : ${Math.round(fpsMin)}) · finesse ${Math.round(finesse*100)} % · écran ${cv.width}×${cv.height}`;
}
function fermerPause(){enPause=false;pauseEl.classList.remove('on');dernier=performance.now();}
function duree(){const s=Math.round(tReel-stats.debut);return `${Math.floor(s/60)} min ${String(s%60).padStart(2,'0')}`;}
function victoire(){phaseD='fini';finDans=1.8;gbGeste('colere');gbDire('ASSEZ !');son('victoire');cacherMsg();}
function montrerVictoire(){
  etatJeu='fin';boutonsJeu(false);cacherMsg();
  const best=RANGS.filter(r=>noteMax>=r[1]).pop()[0];
  finCarte.innerHTML=`<h1>La garde est en miettes !</h1>
  <div class="texte"><p>Grosbec trépigne sous son casque. Le Pisteur a gagné son combat. Il ne reste qu'à prévenir le Sage.</p><button class="hp" data-lire>🔊</button></div>
  <div class="code">🔥 🌙 ⭐</div><p class="petit">le feu · la lune · l'étoile — crie-le au Sage !</p>
  <div class="stats"><span>Durée</span><b>${duree()}</b><span>Plus long enchaînement</span><b>×${comboMax}</b><span>Parades</span><b>${stats.parades}</b><span>Esquives parfaites</span><b>${stats.parfaites}</b><span>Coups dans la faille</span><b>${stats.failles}</b><span>Éclats brisés</span><b>${stats.eclats}</b><span>Coups de sifflet</span><b>${stats.sifflets}</b><span>Coups reçus</span><b>${stats.recus}</b><span>Meilleure note</span><b>${best}</b></div>
  <div class="bas"><button class="jaune" id="fRejouer">Rejouer</button></div>`;
  finEl.classList.add('on');$('fRejouer').onclick=()=>demarrer(0);
}
function defaite(){
  etatJeu='fin';boutonsJeu(false);cacherMsg();finIndiceEsq();
  finCarte.innerHTML=`<h1>Le Pisteur est à terre…</h1>
  <div class="texte"><p>Grosbec ricane sous son casque. Mais un golem, ça se lit : on regarde son bras, et on recommence.</p><button class="hp" data-lire>🔊</button></div>
  <div class="menu" style="margin-top:1em"><button class="jaune" id="fReprendre">Reprendre contre ${G?G.T.nom.toLowerCase():'ce golem'}</button><button class="gris" id="fDebut">Recommencer du début</button></div>`;
  finEl.classList.add('on');$('fReprendre').onclick=()=>demarrer(duelI);$('fDebut').onclick=()=>demarrer(0);
}

/* ======================= le doigt ======================= */
const doigts={};
function local(e){const r=cv.getBoundingClientRect();return [(e.clientX-r.left)/r.width*W,(e.clientY-r.top)/r.height*H];}
function sensDe(dx,dy){return Math.abs(dx)>Math.abs(dy)?(dx<0?'g':'d'):(dy<0?'h':'b');}
cv.addEventListener('pointerdown',e=>{
  e.preventDefault();if(etatJeu!=='jeu'||enPause)return;initSon();
  const [x,y]=local(e),tr={pts:[[x,y]],fin:-1};traces.push(tr);
  doigts[e.pointerId]={x,y,fait:false,tr};
  try{cv.setPointerCapture(e.pointerId);}catch(_){}
});
cv.addEventListener('pointermove',e=>{
  const d=doigts[e.pointerId];if(!d)return;const [x,y]=local(e);d.tr.pts.push([x,y]);if(d.tr.pts.length>40)d.tr.pts.shift();
  if(!d.fait&&etatJeu==='jeu'&&!enPause){const dx=x-d.x,dy=y-d.y,n=Math.hypot(dx,dy);if(n>30){d.fait=true;glisser(sensDe(dx,dy),[dx/n,dy/n]);}}
});
function lever(e){
  const d=doigts[e.pointerId];delete doigts[e.pointerId];if(!d)return;d.tr.fin=performance.now()/1000;
  if(!d.fait&&etatJeu==='jeu'&&!enPause){const [x,y]=local(e);if(Math.hypot(x-d.x,y-d.y)<=30&&G&&G.etat==='genou')achever();}
}
cv.addEventListener('pointerup',lever);cv.addEventListener('pointercancel',lever);
cv.addEventListener('contextmenu',e=>e.preventDefault());
for(const [b,dir] of [[esqG,-1],[esqD,1]]){
  b.addEventListener('pointerdown',e=>{e.preventDefault();initSon();esquiver(dir);b.classList.add('appui');});
  b.addEventListener('pointerup',()=>b.classList.remove('appui'));b.addEventListener('pointerleave',()=>b.classList.remove('appui'));
}

/* ======================= les boutons ======================= */
$('btnGo').onclick=()=>{initSon();$('btnGo').classList.remove('anneau');if(etatJeu==='regles'||etatJeu==='fin')demarrer(0);else{regles.classList.remove('on');fermerPause();}};
btnSiff.onclick=()=>{btnSiff.classList.remove('anneau');siffler();};
btnPause.onclick=()=>ouvrirPause();
$('pReprendre').onclick=()=>fermerPause();
$('pSuivant').onclick=()=>{fermerPause();G=null;finDuel();};
$('pNoteS').onclick=()=>{note=225;noteMax=Math.max(noteMax,note);if(!P.pret){P.pret=true;montrerSifflet();}fermerPause();};
$('pRegles').onclick=()=>{pauseEl.classList.remove('on');regles.classList.add('on');$('btnGo').textContent='Reprendre';};
$('pDur').onclick=()=>{dur=!dur;$('pDur').textContent='Golems : '+(dur?'costauds':'normaux');};
$('pSon').onclick=()=>{sonOn=!sonOn;$('pSon').textContent='Son : '+(sonOn?'oui':'non');};
$('pRecommencer').onclick=()=>demarrer(0);
$('conteurHp').onclick=()=>{if(msgCur)lire(msgCur);};
document.addEventListener('click',e=>{const b=e.target.closest('[data-lire]');if(!b)return;const p=b.parentElement.querySelector('p');if(p)lire(p.textContent);});
document.addEventListener('keydown',e=>{
  if(e.key==='Escape'){if(enPause)fermerPause();else ouvrirPause();return;}
  if(etatJeu!=='jeu'||enPause)return;
  const k=e.key.toLowerCase();
  if(k==='arrowleft'||k==='q'||k==='a')esquiver(-1);
  else if(k==='arrowright'||k==='d')esquiver(1);
  else if(k===' '||k==='s'){if(P.pret)siffler();else if(G&&G.etat==='genou')achever();}
});
document.addEventListener('visibilitychange',()=>{if(document.hidden&&etatJeu==='jeu'&&!enPause)ouvrirPause();});
window.addEventListener('resize',ajuster);
function ajuster(){
  const vw=window.innerWidth,vh=window.innerHeight;H=Math.round(clamp(W*vh/Math.max(1,vw),720,980));FB=H-28;DY=(FB-FT)/330.6;GY=Math.round(FT+(FB-FT)*0.5);HY=H+26;
  const s=Math.min(vw/W,vh/H),w=Math.round(W*s),h=Math.round(H*s);
  cadre.style.width=w+'px';cadre.style.height=h+'px';cadre.style.fontSize=(16*s)+'px';
  DPR=Math.min(2,window.devicePixelRatio||1,Math.sqrt(1.5e6/(w*h)))*finesse;DPR=Math.max(DPR,Math.min(1,window.devicePixelRatio||1)*0.75);
  cv.width=Math.round(w*DPR);cv.height=Math.round(h*DPR);S=cv.width/W;
  peindreFond();
}
ajuster();
requestAnimationFrame(boucle);
window.__pt={etat:()=>({G,P,note,stats,etatJeu,rang:rang()[0],duelI,FEN,lent:vitesseMonde()<0.99,fps,fpsMin,tReel}),glisser,esquiver,achever,siffler,demarrer};
}
