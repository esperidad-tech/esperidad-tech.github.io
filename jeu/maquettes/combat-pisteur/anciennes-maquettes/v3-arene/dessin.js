/* ======================= l'écran ======================= */
const can=$('jeu'),ctx0=can.getContext('2d',{alpha:false});cx=ctx0;
let S=1,Ws=900,Hs=430,camX=0,camY=0,insetG=0,insetD=0;
const FIN=[1.7e6,1.05e6,0.65e6];let finesse=0;try{finesse=Math.min(2,+localStorage.getItem('pisteur3_finesse')||0);}catch(e){}
const sonde=document.createElement('div');sonde.style.cssText='position:fixed;left:0;top:0;width:1px;height:1px;visibility:hidden;padding-left:env(safe-area-inset-left);padding-right:env(safe-area-inset-right)';document.body.appendChild(sonde);
let fond=null,fondPret=false,SB=1,vign=null;
function taille(){
  const vw=innerWidth,vh=innerHeight;
  Hs=vw/vh*430<640?640*vh/vw:430;
  const dpr=Math.min(devicePixelRatio||1,2.5);let w=vw*dpr,h=vh*dpr;const k=Math.min(1,Math.sqrt(FIN[finesse]/(w*h)));
  can.width=Math.max(1,Math.round(w*k));can.height=Math.max(1,Math.round(h*k));S=can.height/Hs;Ws=can.width/S;
  const cs=getComputedStyle(sonde);insetG=(parseFloat(cs.paddingLeft)||0)*Hs/vh;insetD=(parseFloat(cs.paddingRight)||0)*Hs/vh;
  fondPret=false;vign=null;verifTourne();
}
function verifTourne(){
  const t=innerHeight>innerWidth*1.05;
  if(t!==tourne){tourne=t;$('tourne').classList.toggle('on',t);dernier=performance.now();}
}
addEventListener('resize',taille);addEventListener('orientationchange',()=>setTimeout(taille,200));

/* ======================= la salle (dessinée une fois) ======================= */
const TORCHES=[[5.6,2.5],[20.4,2.5],[10.4,2.9],[15.6,2.9]];
function preparerFond(){
  SB=Math.min(S,2.4);
  fond=document.createElement('canvas');fond.width=Math.round(SW*SB);fond.height=Math.round(SH*SB);
  const g=fond.getContext('2d'),avant=cx;cx=g;g.setTransform(SB,0,0,SB,0,0);
  dessinerSalle();cx=avant;fondPret=true;
}
function dessinerSalle(){
  const R=graine(11);
  cx.fillStyle='#05070c';cx.fillRect(0,0,SW,SH);
  /* le sol : de grandes dalles */
  const y0=1.3,td=(RD-y0)/8;
  cx.fillStyle='#16181e';cx.fillRect(px(0),py(y0),RW*T,(RD-y0)*T*K);
  for(let j=0;j<8;j++)for(let i=0;i<13;i++){
    const x=i*2,y=y0+j*td,v=(R()-0.5)*12+((i+j)%2?4:-3);
    const X0=px(x)+1.2,Y0=py(y)+1.2,w=2*T-2.4,h=td*T*K-2.4;
    cx.fillStyle=`rgb(${46+v|0},${50+v|0},${60+v|0})`;cx.fillRect(X0,Y0,w,h);
    cx.fillStyle='rgba(255,255,255,.05)';cx.fillRect(X0,Y0,w,2);
    cx.fillStyle='rgba(0,0,0,.18)';cx.fillRect(X0,Y0+h-3,w,3);
    if(R()<0.28){cx.strokeStyle='rgba(10,12,16,.55)';cx.lineWidth=1.2;cx.beginPath();let a=X0+R()*w,b=Y0+R()*h;cx.moveTo(a,b);for(let k=0;k<4;k++){a+=(R()-0.5)*40;b+=(R()-0.3)*18;cx.lineTo(clamp(a,X0,X0+w),clamp(b,Y0,Y0+h));}cx.stroke();}
  }
  /* le grand tapis de Grosbec */
  cx.fillStyle='#3a1012';cx.fillRect(px(11.6),py(y0),2.8*T,(RD-y0)*T*K);
  cx.fillStyle='rgba(0,0,0,.18)';for(let y=y0;y<RD;y+=1.2)cx.fillRect(px(11.6),py(y),2.8*T,4);
  cx.strokeStyle='#8a6224';cx.lineWidth=2.5;ligne(px(11.75),py(y0),px(11.75),py(RD));ligne(px(14.25),py(y0),px(14.25),py(RD));
  cx.strokeStyle='rgba(214,170,80,.35)';cx.lineWidth=1.5;
  for(let y=y0+1;y<RD-0.5;y+=2){cx.beginPath();cx.moveTo(px(13),py(y));cx.lineTo(px(13.7),py(y+0.6));cx.lineTo(px(13),py(y+1.2));cx.lineTo(px(12.3),py(y+0.6));cx.closePath();cx.stroke();}
  /* la rosace au bec, au milieu */
  const RX=px(13),RY=py(10.4);
  cx.fillStyle='#1d1416';cx.beginPath();cx.ellipse(RX,RY,2.3*T,2.3*T*K,0,0,Math.PI*2);cx.fill();
  cx.strokeStyle='#8a6224';cx.lineWidth=4;cx.beginPath();cx.ellipse(RX,RY,2.3*T,2.3*T*K,0,0,Math.PI*2);cx.stroke();
  cx.strokeStyle='rgba(214,170,80,.55)';cx.lineWidth=1.5;cx.beginPath();cx.ellipse(RX,RY,1.8*T,1.8*T*K,0,0,Math.PI*2);cx.stroke();
  for(let i=0;i<12;i++){const a=i/12*Math.PI*2;ligne(RX+Math.cos(a)*0.9*T,RY+Math.sin(a)*0.9*T*K,RX+Math.cos(a)*1.8*T,RY+Math.sin(a)*1.8*T*K);}
  cx.fillStyle='#6b4a1a';cx.beginPath();cx.ellipse(RX,RY,0.85*T,0.85*T*K,0,0,Math.PI*2);cx.fill();
  poly([[RX-22,RY-10],[RX+26,RY+2],[RX-22,RY+12]],'#d6aa50','#3a2810');cx.fillStyle='#3a2810';circ(RX-12,RY-2,3);
  /* l'ombre au pied des murs */
  let gr=cx.createLinearGradient(0,py(y0),0,py(y0+1.6));gr.addColorStop(0,'rgba(0,0,0,.55)');gr.addColorStop(1,'rgba(0,0,0,0)');cx.fillStyle=gr;cx.fillRect(px(0),py(y0),RW*T,1.6*T*K);
  gr=cx.createLinearGradient(px(0),0,px(0.9),0);gr.addColorStop(0,'rgba(0,0,0,.5)');gr.addColorStop(1,'rgba(0,0,0,0)');cx.fillStyle=gr;cx.fillRect(px(0),py(y0),0.9*T,(RD-y0)*T*K);
  gr=cx.createLinearGradient(px(RW),0,px(RW-0.9),0);gr.addColorStop(0,'rgba(0,0,0,.5)');gr.addColorStop(1,'rgba(0,0,0,0)');cx.fillStyle=gr;cx.fillRect(px(RW-0.9),py(y0),0.9*T,(RD-y0)*T*K);
  /* le mur du fond */
  const yH=py(y0,4.6),yB=py(y0,0);
  for(let r=0,y=yB;y>yH;r++){const hh=0.55*ZH,y1=Math.max(yH,y-hh);let x=px(-1)-(r%2)*34;
    while(x<px(RW+1)){const w=58+R()*26,v=(R()-0.5)*10;cx.fillStyle=`rgb(${36+v|0},${39+v|0},${48+v|0})`;cx.fillRect(x+1,y1+1,w-2,y-y1-2);cx.fillStyle='rgba(255,255,255,.04)';cx.fillRect(x+1,y1+1,w-2,2);x+=w;}
    y=y1;}
  cx.fillStyle='#120d08';cx.fillRect(px(-1),yH-14,(RW+2)*T,14);cx.fillStyle='#8a6224';cx.fillRect(px(-1),yH-3,(RW+2)*T,5);cx.fillRect(px(-1),py(y0,3.4),(RW+2)*T,3);
  cx.fillStyle='rgba(0,0,0,.35)';cx.fillRect(px(-1),yB-10,(RW+2)*T,10);
  gr=cx.createLinearGradient(0,0,0,yH-14);gr.addColorStop(0,'#020306');gr.addColorStop(1,'#0b0d14');cx.fillStyle=gr;cx.fillRect(0,0,SW,yH-14);
  /* bannières */
  for(const bx of [2.6,23.4]){const X=px(bx),y1=py(y0,4.3),y2=py(y0,2.0);
    poly([[X-26,y1],[X+26,y1],[X+26,y2],[X,y2-14],[X-26,y2]],'#6e1616','#2a0808');cx.fillStyle='#521010';cx.fillRect(X-26,y1,8,y2-y1);
    cx.fillStyle='#d6aa50';circ(X,y1+34,11);poly([[X-8,y1+28],[X+12,y1+34],[X-8,y1+40]],'#3a2810');}
  /* la grande arche derrière l'estrade */
  { const x0=px(10.9),x1=px(15.1),yb=py(y0,1.6),yt=py(y0,4.25),rr=(x1-x0)/2;
    cx.fillStyle='#8a6224';cx.beginPath();cx.moveTo(x0-6,yb);cx.lineTo(x0-6,yt+rr);cx.arc((x0+x1)/2,yt+rr,rr+6,Math.PI,0);cx.lineTo(x1+6,yb);cx.closePath();cx.fill();
    gr=cx.createLinearGradient(x0,0,x1,0);for(let i=0;i<=8;i++)gr.addColorStop(i/8,i%2?'#5a1212':'#3a0a0c');
    cx.fillStyle=gr;cx.beginPath();cx.moveTo(x0,yb);cx.lineTo(x0,yt+rr);cx.arc((x0+x1)/2,yt+rr,rr,Math.PI,0);cx.lineTo(x1,yb);cx.closePath();cx.fill(); }
  /* les deux portes de bronze */
  for(const dx of [8,18]){const x0=px(dx-1.25),x1=px(dx+1.25),yb=py(y0,0),yt=py(y0,2.85),rr=(x1-x0)/2;
    cx.fillStyle='#8a6224';cx.beginPath();cx.moveTo(x0-7,yb);cx.lineTo(x0-7,yt+rr*0.5);cx.quadraticCurveTo((x0+x1)/2,yt-rr*0.5-7,x1+7,yt+rr*0.5);cx.lineTo(x1+7,yb);cx.closePath();cx.fill();
    cx.fillStyle='#0a0507';cx.beginPath();cx.moveTo(x0,yb);cx.lineTo(x0,yt+rr*0.5);cx.quadraticCurveTo((x0+x1)/2,yt-rr*0.5,x1,yt+rr*0.5);cx.lineTo(x1,yb);cx.closePath();cx.fill();
    cx.fillStyle='#d6aa50';for(let k=0;k<5;k++){circ(x0-3.5,yb-10-k*20,2);circ(x1+3.5,yb-10-k*20,2);}}
  /* supports des torches */
  for(const [tx,tz] of TORCHES){const X=px(tx),Y=py(y0,tz);cx.fillStyle='#2a1c0a';cx.fillRect(X-3,Y,6,16);poly([[X-8,Y],[X+8,Y],[X+5,Y+6],[X-5,Y+6]],'#5a3f16');}
  /* l'estrade de Grosbec */
  { const x0=px(11.3),x1=px(14.7),yt=py(0.35,1.7),yf=py(y0,1.7),yb=py(y0,0);
    cx.fillStyle='#4a4f5c';cx.fillRect(x0,yt,x1-x0,yf-yt);
    cx.fillStyle='#2a2d36';cx.fillRect(x0,yf,x1-x0,yb-yf);
    for(let k=0;k<3;k++){cx.fillStyle=k%2?'#323642':'#373b47';cx.fillRect(x0+6+k*3,yf+8+k*18,x1-x0-12-k*6,16);}
    cx.fillStyle='#8a6224';cx.fillRect(x0,yf-2,x1-x0,4);cx.fillRect(x0,yb-5,x1-x0,5); }
  /* les murets des côtés, avec leurs passages */
  for(const sd of [0,1]){
    const xa=sd?RW-0.05:-1.0,xb=sd?RW+1.0:0.05,X0=px(xa),X1=px(xb);
    for(const [ya,yb] of [[y0,8.45],[10.35,RD]]){
      cx.fillStyle='#262a33';cx.fillRect(X0,py(ya,1.1),X1-X0,py(yb,1.1)-py(ya,1.1));
      cx.fillStyle='#454a57';cx.fillRect(X0,py(ya,1.1),X1-X0,py(yb,1.1)-py(ya,1.1)-3);
      cx.fillStyle='#8a6224';cx.fillRect(sd?X0:X1-4,py(ya,1.1),4,py(yb,1.1)-py(ya,1.1));
      cx.fillStyle='#1b1d24';cx.fillRect(X0,py(yb,1.1),X1-X0,py(yb,0)-py(yb,1.1));
    }
    gr=cx.createLinearGradient(sd?px(RW):px(0),0,sd?px(RW+1.1):px(-1.1),0);gr.addColorStop(0,'rgba(5,7,12,0)');gr.addColorStop(1,'#05070c');
    cx.fillStyle=gr;cx.fillRect(sd?px(RW):px(-1.1),py(8.45,0),1.1*T,py(10.35,0)-py(8.45,0));
  }
  /* le bord de devant */
  gr=cx.createLinearGradient(0,py(RD-0.8),0,py(RD));gr.addColorStop(0,'rgba(0,0,0,0)');gr.addColorStop(1,'rgba(0,0,0,.5)');cx.fillStyle=gr;cx.fillRect(px(0),py(RD-0.8),RW*T,0.8*T*K);
  cx.fillStyle='#2a2d36';cx.fillRect(px(-1),py(RD),(RW+2)*T,12);cx.fillStyle='#8a6224';cx.fillRect(px(-1),py(RD),(RW+2)*T,3);
}

/* ======================= dessins au sol ======================= */
function solPoly(pts){cx.beginPath();for(let i=0;i<pts.length;i++){const X=px(pts[i][0]),Y=py(pts[i][1],0);i?cx.lineTo(X,Y):cx.moveTo(X,Y);}cx.closePath();}
function solRect(x,y,a,u0,u1,l){const c=Math.cos(a),s=Math.sin(a),h=l/2;return [[x+c*u0+s*h,y+s*u0-c*h],[x+c*u1+s*h,y+s*u1-c*h],[x+c*u1-s*h,y+s*u1+c*h],[x+c*u0-s*h,y+s*u0+c*h]];}
function solEll(x,y,r){cx.beginPath();cx.ellipse(px(x),py(y,0),Math.max(0.1,r*T),Math.max(0.1,r*T*K),0,0,Math.PI*2);}
const RG='rgba(255,46,34,';
function zoneRemplie(fondF,dedansF){fondF();cx.fillStyle=RG+'.15)';cx.fill();cx.strokeStyle=RG+'.9)';cx.lineWidth=2;cx.stroke();dedansF();cx.fillStyle=RG+'.33)';cx.fill();}
function dessinerZone(z){
  const p=clamp(z.p,0,1);cx.lineJoin='round';
  if(z.k==='cercle'){zoneRemplie(()=>solEll(z.x,z.y,z.r),()=>solEll(z.x,z.y,z.r*p));}
  else if(z.k==='cone'){
    const sec=R=>{const pts=[[z.x,z.y]];for(let i=0;i<=10;i++){const a=z.a-z.h+2*z.h*i/10;pts.push([z.x+Math.cos(a)*R,z.y+Math.sin(a)*R]);}solPoly(pts);};
    zoneRemplie(()=>sec(z.R),()=>sec(z.R*p));
  }else if(z.k==='fin'){
    const ex=z.x+Math.cos(z.a)*z.L,ey=z.y+Math.sin(z.a)*z.L;
    cx.strokeStyle=z.lock?((((tReel*22)|0)%2)?'rgba(255,236,200,.95)':RG+'1)'):RG+(0.35+p*0.45)+')';cx.lineWidth=z.lock?3.2:1.8;
    if(!z.lock)cx.setLineDash([7,6]);ligne(px(z.x),py(z.y,0),px(ex),py(ey,0));cx.setLineDash([]);
    cx.fillStyle=RG+'.8)';circ(px(ex),py(ey,0),z.lock?5:3.5);
  }else{
    const L0=0.25;zoneRemplie(()=>solPoly(solRect(z.x,z.y,z.a,L0,z.L,z.l)),()=>solPoly(solRect(z.x,z.y,z.a,L0,L0+(z.L-L0)*p,z.l)));
    if(z.k==='fleche'){const c=Math.cos(z.a),s=Math.sin(z.a),tx=z.x+c*(z.L+0.45),ty=z.y+s*(z.L+0.45),bx=z.x+c*z.L,by=z.y+s*z.L,h=z.l*0.85;
      solPoly([[tx,ty],[bx+s*h,by-c*h],[bx-s*h,by+c*h]]);cx.fillStyle=RG+(0.4+p*0.5)+')';cx.fill();}
    if(z.k==='ligne'){cx.strokeStyle=RG+'.55)';cx.lineWidth=2;const c=Math.cos(z.a),s=Math.sin(z.a);
      for(let u=1.2;u<z.L-0.3;u+=1.3){const ux=z.x+c*u,uy=z.y+s*u,h=z.l*0.3;cx.beginPath();cx.moveTo(px(ux-c*0.35+s*h),py(uy-s*0.35-c*h,0));cx.lineTo(px(ux),py(uy,0));cx.lineTo(px(ux-c*0.35-s*h),py(uy-s*0.35+c*h,0));cx.stroke();}}
  }
}
function dessinerSol(){
  for(const q of parts)if(q.k==='tas'){const a=Math.min(1,q.vie/0.6);cx.globalAlpha=a;cx.fillStyle='#2b2e36';const X=px(q.x),Y=py(q.y,0);for(let i=0;i<6;i++){const s=q.s;ell(X+Math.cos(i*2.1)*9*s,Y+Math.sin(i*2.1)*3*s,5*s,3*s);}cx.fillStyle='rgba(255,110,40,.6)';circ(X,Y-1,2*q.s);cx.globalAlpha=1;}
  for(const f of feux){const X=px(f.x),Y=py(f.y,0),a=Math.min(1,f.t/0.6);glow('rgba(255,140,40,.9)',X,Y-4,16,0.5*a);cx.fillStyle=`rgba(255,${150+Math.random()*80|0},60,${0.8*a})`;poly([[X-5,Y],[X+5,Y],[X+rnd(-2,2),Y-10-Math.random()*8]],cx.fillStyle);}
  for(const it of items){const a=0.5+0.35*Math.sin(tReel*6);cx.strokeStyle=`rgba(255,176,112,${a})`;cx.lineWidth=2.5;solEll(it.x,it.y,0.6);cx.stroke();}
  for(const o of obus){const k=clamp(o.t/o.dur,0,1);zoneRemplie(()=>solEll(o.x1,o.y1,1.0),()=>solEll(o.x1,o.y1,1.0*k));}
  for(const w of ondes){
    const ri=Math.max(0.05,w.r-w.ep/2),ro=w.r+w.ep/2,a=Math.max(0,1-w.r/w.max)*0.6+0.25;
    cx.beginPath();cx.ellipse(px(w.x),py(w.y,0),ro*T,ro*T*K,0,0,Math.PI*2);cx.ellipse(px(w.x),py(w.y,0),ri*T,ri*T*K,0,0,Math.PI*2,true);
    cx.fillStyle=`rgba(255,110,40,${a})`;cx.fill();cx.strokeStyle=`rgba(255,220,160,${a})`;cx.lineWidth=2;solEll(w.x,w.y,ro);cx.stroke();
  }
  for(const g of G)if(g.zone)dessinerZone(g.zone);
}

/* ======================= les obstacles ======================= */
function cache(o){const X=px(o.x),hautPx=o.h*ZH,dy=hautPx/(T*K);return P.y<o.y&&P.y>o.y-dy-0.6&&Math.abs(px(P.x)-X)<(o.c?o.r:o.w/2)*T+14;}
function boite(o,cTop,cFace,cBord){
  const x0=px(o.x-o.w/2),x1=px(o.x+o.w/2),yb=py(o.y-o.d/2,o.h),yf=py(o.y+o.d/2,o.h),yg=py(o.y+o.d/2,0);
  cx.fillStyle='rgba(0,0,0,.35)';cx.fillRect(x0+5,py(o.y-o.d/2,0)+3,x1-x0+4,yg-py(o.y-o.d/2,0)+5);
  cx.fillStyle=cFace;cx.fillRect(x0,yf,x1-x0,yg-yf);
  cx.fillStyle=cTop;cx.fillRect(x0,yb,x1-x0,yf-yb);
  cx.strokeStyle=cBord;cx.lineWidth=1.5;cx.strokeRect(x0,yb,x1-x0,yf-yb);ligne(x0,yf,x0,yg);ligne(x1,yf,x1,yg);
  return [x0,x1,yb,yf,yg];
}
function dessinerObstacle(o){
  const al=o.haut&&cache(o)?0.42:1;cx.globalAlpha=al;
  if(o.k==='pilier'){
    const X=px(o.x),rx=o.r*T,ry=o.r*T*K,yt=py(o.y,o.h),yg=py(o.y,0);
    cx.fillStyle='rgba(0,0,0,.35)';ell(X+8,yg+4,rx+4,ry+3);
    cx.fillStyle='#2a2d36';ell(X,yg,rx+5,ry+4);cx.fillRect(X-rx-5,yg-14,2*rx+10,14);cx.fillStyle='#8a6224';cx.fillRect(X-rx-5,yg-14,2*rx+10,3);
    const gr=cx.createLinearGradient(X-rx,0,X+rx,0);gr.addColorStop(0,'#2a2d36');gr.addColorStop(0.45,'#5a5f6c');gr.addColorStop(1,'#1f2229');
    cx.fillStyle=gr;cx.fillRect(X-rx,yt,2*rx,yg-14-yt);
    cx.strokeStyle='rgba(0,0,0,.25)';cx.lineWidth=1.5;for(let k=-2;k<=2;k++)ligne(X+k*rx*0.38,yt+8,X+k*rx*0.38,yg-16);
    cx.fillStyle='#6b4a1a';cx.fillRect(X-rx-6,yt-6,2*rx+12,12);cx.fillStyle='#8a6224';ell(X,yt-6,rx+6,ry+3);cx.fillStyle='#5f6472';ell(X,yt-7,rx+1,ry);cx.fillStyle='rgba(255,255,255,.08)';ell(X-rx*0.3,yt-9,rx*0.5,ry*0.45);
  }else if(o.k==='gravats'){
    const R=graine(Math.round(o.x*97+o.y*13)),X=px(o.x),Y=py(o.y,0);
    cx.fillStyle='rgba(0,0,0,.35)';ell(X+5,Y+3,o.r*T+4,o.r*T*K+3);
    for(let i=0;i<12;i++){const a=R()*Math.PI*2,d=Math.sqrt(R())*o.r*0.85,s=8+R()*10,x=X+Math.cos(a)*d*T,y=Y+Math.sin(a)*d*T*K-(1-d/o.r)*o.h*ZH*0.6;
      const v=(R()-0.5)*14;poly([[x-s,y],[x-s*0.4,y-s*0.8],[x+s*0.6,y-s*0.7],[x+s,y+s*0.2],[x,y+s*0.5]],`rgb(${70+v|0},${74+v|0},${84+v|0})`,'rgba(0,0,0,.35)');}
  }else if(o.k==='statue'){
    const [x0,x1,yb,yf,yg]=boite(o,'#5a5f6c','#3a3d47','#252830');
    cx.fillStyle='#6a707e';ell(x0+20,yb+(yf-yb)/2,16,(yf-yb)/2-1);cx.fillStyle='#4a4f5c';cx.fillRect(x0+36,yb+5,x1-x0-60,yf-yb-10);
    cx.fillStyle='#8a6224';poly([[x0+6,yb+4],[x0+14,yb-8],[x0+22,yb+2],[x0+30,yb-8],[x0+34,yb+4]],'#8a6224');
    cx.fillStyle='#2a2d36';cx.fillRect(x1-22,yb+3,18,yf-yb-6);
  }else if(o.k==='muret'){
    const [x0,x1,yb,yf,yg]=boite(o,'#555a67','#373b46','#22252d');
    cx.strokeStyle='rgba(0,0,0,.35)';cx.lineWidth=1;for(let y=yf+10;y<yg;y+=10)ligne(x0,y,x1,y);
    for(let x=x0+16;x<x1;x+=22)ligne(x,yf,x,yf+10);
  }else if(o.k==='chariot'){
    const [x0,x1,yb,yf,yg]=boite(o,'#6a4a2a','#4a3218','#2a1c0e');
    cx.strokeStyle='rgba(0,0,0,.3)';cx.lineWidth=1.5;for(let x=x0+14;x<x1;x+=14)ligne(x,yb,x,yf);
    cx.fillStyle='#2a1c0e';for(const wx of [x0+14,x1-14]){circ(wx,yg-2,9);cx.fillStyle='#8a6224';circ(wx,yg-2,3);cx.fillStyle='#2a1c0e';}
    cx.fillStyle='#3a3d45';for(let i=0;i<4;i++)ell(x0+18+i*20,yb+8,8,5);
  }else if(o.k==='caisse'){
    const [x0,x1,yb,yf,yg]=boite(o,'#7a5630','#5a3c1e','#2a1c0e');
    cx.strokeStyle='#3a2810';cx.lineWidth=3;ligne(x0+3,yf+3,x1-3,yg-3);ligne(x1-3,yf+3,x0+3,yg-3);ligne(x0+3,yb+3,x1-3,yf-3);
  }else if(o.k==='dalle'){
    const [x0,x1,yb,yf,yg]=boite(o,'#6a707e','#4a4f5c','#2a2d36');
    cx.strokeStyle='rgba(20,22,28,.7)';cx.lineWidth=1.5;cx.beginPath();cx.moveTo((x0+x1)/2-4,yf);cx.lineTo((x0+x1)/2+3,yf+14);cx.lineTo((x0+x1)/2-2,yg-6);cx.stroke();
  }
  cx.globalAlpha=1;
}

/* ======================= le Pisteur ======================= */
P.pas=0;P.lx=0;P.ly=0;P.court=false;
function dessinerPisteur(){
  const X=px(P.x),Yg=py(P.y,0),Y=py(P.y,P.z),cs=Math.cos(P.fa),sn=Math.sin(P.fa),dos=sn<-0.42;
  cx.fillStyle='rgba(0,0,0,.42)';ell(X,Yg+1,14-P.z*5,6-P.z*2);
  if(P.etat==='aterre'){cx.fillStyle='#2f5a3a';ell(X,Y-6,20,8);cx.fillStyle='#3c6b3d';circ(X+16,Y-8,8);return;}
  cx.fillStyle='rgba(91,224,230,.5)';solPoly([[P.x+cs*1.05,P.y+sn*1.05],[P.x+cs*0.74-sn*0.22,P.y+sn*0.74+cs*0.22],[P.x+cs*0.74+sn*0.22,P.y+sn*0.74-cs*0.22]]);cx.fill();
  const clign=tReel<P.invul&&((tReel*14)|0)%2;cx.globalAlpha=clign?0.35:1;
  if(P.etat==='bond')glow('rgba(200,182,255,.9)',X,Y-28,34,0.5);
  const sw=P.court?Math.sin(P.pas*2.4):0;
  const cape=()=>{const bx=-cs*5;poly([[X-9,Y-39],[X+9,Y-39],[X+13+bx,Y-9+Math.abs(sw)*2],[X-13+bx,Y-9]],'#2f5a3a');cx.strokeStyle='#5b9a64';cx.lineWidth=1.2;ligne(X-13+bx,Y-9,X+13+bx,Y-9+Math.abs(sw)*2);};
  const arcDos=()=>{cx.strokeStyle='#8a5a2a';cx.lineWidth=2.6;cx.beginPath();cx.moveTo(X-11,Y-49);cx.quadraticCurveTo(X+2,Y-40,X+9,Y-17);cx.stroke();};
  const javDos=()=>{cx.strokeStyle='#8a6236';cx.lineWidth=3;ligne(X+14,Y-60,X-12,Y-4);cx.fillStyle='#cfd8e6';poly([[X+14,Y-60],[X+19,Y-68],[X+11,Y-63]],'#cfd8e6');};
  const tirAv=P.etat==='tir'||P.arcCD>0.25;
  const main=()=>{
    let a=P.fa,ext=11;
    if(P.etat==='coup'){const k=clamp(P.t/0.12,0,1),sens=P.combo%2?1:-1;a=P.fa+lerp(-1.1,1.1,k)*sens;ext=P.combo===3?16:14;}
    const hx=X+Math.cos(a)*ext,hy=Y-27+Math.sin(a)*ext*K*0.6;
    cx.strokeStyle='#5a4330';cx.lineWidth=5;cx.lineCap='round';ligne(X+cs*4,Y-33,hx,hy);
    const bl=P.etat==='coup'?15:11;cx.strokeStyle='#d8f1f4';cx.lineWidth=3;ligne(hx,hy,hx+Math.cos(a)*bl,hy+Math.sin(a)*bl*K-3);
    cx.fillStyle='#c9993f';circ(hx,hy,2.6);
  };
  const arcAv=()=>{const ax=X+cs*14,ay=Y-30+sn*5,pxp=-sn,pyp=cs*K;cx.strokeStyle='#c99a5a';cx.lineWidth=2.8;cx.beginPath();cx.moveTo(ax+pxp*14,ay+pyp*14-6);cx.quadraticCurveTo(ax+cs*8,ay+sn*4,ax-pxp*14,ay-pyp*14-6);cx.stroke();cx.strokeStyle='#eee';cx.lineWidth=0.8;ligne(ax+pxp*14,ay+pyp*14-6,ax-pxp*14,ay-pyp*14-6);};
  if(!dos){if(P.porte)javDos();else if(!tirAv)arcDos();cape();}
  if(dos)main();
  cx.lineCap='round';cx.strokeStyle='#3a2a1c';cx.lineWidth=6;
  ligne(X-4,Y-17,X-4+sw*5,Y-1-Math.max(0,sw)*2);ligne(X+4,Y-17,X+4-sw*5,Y-1-Math.max(0,-sw)*2);
  poly([[X-9,Y-38],[X+9,Y-38],[X+7,Y-15],[X-7,Y-15]],'#5a4330');
  cx.fillStyle='#2a1d12';cx.fillRect(X-7.5,Y-21,15,3);cx.fillStyle='#5be0e6';cx.fillRect(X-1.5,Y-21,3,3);
  if(dos){cape();if(P.porte)javDos();else if(!tirAv)arcDos();}
  if(!dos)main();
  if(tirAv)arcAv();
  cx.fillStyle='#3c6b3d';circ(X+cs*1.5,Y-45,8.5);
  poly([[X-6-cs*2,Y-50],[X+6-cs*2,Y-50],[X-cs*9,Y-58]],'#3c6b3d');
  if(!dos){cx.fillStyle='#e3b68a';ell(X+cs*3.2,Y-44+Math.max(0,sn)*1.5,5,4.6);cx.fillStyle='#2a1a10';circ(X+cs*3.4-2,Y-45,1.2);circ(X+cs*3.4+2,Y-45,1.2);}
  else{cx.fillStyle='#2f5a3a';circ(X,Y-44,6);}
  if(P.riposte){glow('rgba(200,182,255,.9)',X,Y-30,26,0.4+0.2*Math.sin(tReel*10));}
  cx.globalAlpha=1;
}

/* ======================= les golems ======================= */
function membre(a,b,c,d,lw,coul){cx.strokeStyle=coul;cx.lineWidth=lw;cx.lineCap='round';ligne(a,b,c,d);}
function yeux(x,y,ecart,taille,fort){
  glow('rgba(255,40,30,.95)',x-ecart,y,taille*2.2,fort?1:0.75);glow('rgba(255,40,30,.95)',x+ecart,y,taille*2.2,fort?1:0.75);
  cx.fillStyle=fort?'#fff0e0':'#ffb8a0';cx.fillRect(x-ecart-taille/2,y-taille*0.3,taille,taille*0.6);cx.fillRect(x+ecart-taille/2,y-taille*0.3,taille,taille*0.6);
}
function braise(x,y,r,a){glow('rgba(255,110,40,.9)',x,y,r*3,a);cx.fillStyle='#ffb060';circ(x,y,r*0.6);}
function etoiles(X,Y){cx.fillStyle='#ffd23a';for(let i=0;i<3;i++){const a=tReel*4+i*2.1;const x=X+Math.cos(a)*14,y=Y+Math.sin(a)*5;losange(x,y,3.5,3.5);}}
function barre(g,Yt){const w=g.type==='colosse'?84:34,X=px(g.x);cx.fillStyle='rgba(0,0,0,.65)';cx.fillRect(X-w/2-1,Yt-1,w+2,6);cx.fillStyle=g.hp/g.max>0.35?'#e0473a':'#ff8a3a';cx.fillRect(X-w/2,Yt,w*Math.max(0,g.hp/g.max),4);}
function bonhomme(g,w,h,c1,c2,o){
  o=o||{};const X=px(g.x),Y=py(g.y,g.z),cs=Math.cos(g.fa),sn=Math.sin(g.fa),dos=sn<-0.42,sw=g.bouge?Math.sin((g.marche||0)*3.2):0;
  const tremble=o.tremble?rnd(-1.5,1.5):0,Xb=X+tremble;
  const brasAr=()=>{if(o.bras)o.bras(Xb,Y,cs,sn,-1);},brasAv=()=>{if(o.bras)o.bras(Xb,Y,cs,sn,1);};
  membre(Xb-w*0.22,Y-h*0.36,Xb-w*0.22+sw*w*0.2,Y-2-Math.max(0,sw)*3,w*0.3,col(FER2));
  membre(Xb+w*0.22,Y-h*0.36,Xb+w*0.22-sw*w*0.2,Y-2-Math.max(0,-sw)*3,w*0.3,col(FER2));
  if(!dos)brasAr();else brasAv();
  poly([[Xb-w/2,Y-h*0.8],[Xb+w/2,Y-h*0.8],[Xb+w*0.36,Y-h*0.33],[Xb-w*0.36,Y-h*0.33]],col(c1),'rgba(0,0,0,.35)');
  cx.fillStyle=col(BRZ2);cx.fillRect(Xb-w*0.37,Y-h*0.42,w*0.74,h*0.07);cx.fillStyle=col(BRZ);cx.fillRect(Xb-w*0.5,Y-h*0.82,w,h*0.06);
  if(!dos)braise(Xb+cs*w*0.12,Y-h*0.6,w*0.1,o.braiseForte?0.9:0.5);
  const th=o.tete||h*0.2,hx=Xb+cs*w*0.08;
  cx.fillStyle=col(c2);cx.fillRect(hx-th*0.6,Y-h,th*1.2,th);cx.fillStyle='rgba(0,0,0,.25)';cx.fillRect(hx-th*0.6,Y-h+th*0.75,th*1.2,th*0.25);
  if(!dos)yeux(hx+cs*th*0.22,Y-h+th*0.45,th*0.24,th*0.18,o.fort);
  if(!dos)brasAv();else brasAr();
  return [X,Y];
}
function dessinerGolem(g){
  if(g.etat==='mort')return;
  let al=1;if(g.y<1.4)al=clamp((g.y-0.2)/1.1,0,1);if(g.x<0.4)al=Math.min(al,clamp((g.x+0.6)/0.9,0,1));if(g.x>RW-0.4)al=Math.min(al,clamp((RW+0.6-g.x)/0.9,0,1));
  if(al<=0)return;cx.globalAlpha=al;FL=g.flash;
  const X=px(g.x),Yg=py(g.y,0),Y=py(g.y,g.z),cs=Math.cos(g.fa),sn=Math.sin(g.fa),arme=!!g.zone||g.etat==='arme'||g.etat==='vise';
  cx.fillStyle='rgba(0,0,0,.4)';ell(X,Yg+1,g.r*T*1.05-g.z*6,g.r*T*0.42);
  let haut=g.T.h*ZH;
  switch(g.type){
    case 'chien':{
      const crouch=g.etat==='arme'?0.14:0,zb=0.48-crouch+g.z,L=0.36,ph=(g.marche||0)*5;
      const bx=g.x-cs*L,by=g.y-sn*L,fx=g.x+cs*L,fy=g.y+sn*L,pxp=-sn*0.17,pyp=cs*0.17;
      const pattes=[[fx+pxp,fy+pyp,0],[fx-pxp,fy-pyp,Math.PI],[bx+pxp,by+pyp,Math.PI],[bx-pxp,by-pyp,0]];
      for(const [lx,ly,o] of pattes){const s=g.bouge?Math.sin(ph+o)*0.12:0;membre(px(lx),py(ly,zb-0.08),px(lx+cs*s),py(ly+sn*s,0)-1,5,col(FER2));}
      membre(px(bx),py(by,zb),px(fx),py(fy,zb+0.05),17,col(ROC));
      membre(px(bx),py(by,zb+0.15),px(fx),py(fy,zb+0.2),7,col(ROCH));
      for(let k=0;k<3;k++){const t=0.2+k*0.25,sx=lerp(px(bx),px(fx),t),sy=lerp(py(by,zb+0.22),py(fy,zb+0.27),t);poly([[sx-4,sy],[sx,sy-8],[sx+4,sy]],col(BRZ));}
      membre(px(bx),py(by,zb+0.1),px(bx-cs*0.32),py(by-sn*0.32,zb+0.35),4,col(ROC));
      const hx=px(fx+cs*0.14),hy=py(fy+sn*0.14,zb+0.22);
      cx.fillStyle=col(ROCH);ell(hx,hy,10,8);cx.fillStyle=col(ROC);ell(hx+cs*7,hy+3+sn*2,6,4);
      poly([[hx-7,hy-5],[hx-4,hy-14],[hx-1,hy-6]],col(BRZ));poly([[hx+1,hy-6],[hx+4,hy-14],[hx+7,hy-5]],col(BRZ));
      if(sn>-0.6)yeux(hx+cs*4,hy-1,3.2,2.6,g.etat==='arme');
      haut=(zb+0.55)*ZH;break;}
    case 'javelot':{
      const avec=g.etat==='normal'||g.etat==='arme'||g.etat==='recup'&&g.retour!=='nu';
      bonhomme(g,24,66,ROC,ROCH,{fort:arme,bras:(Xb,Yb,c,s,cote)=>{
        const sx=Xb+cote*12*(c>=0?1:-1)*0.9,sy=Yb-50;
        if(cote===1){let hx=Xb+c*15,hy=Yb-38+s*4;if(g.etat==='arme'){hx=Xb-c*10;hy=Yb-52;}if(g.etat==='poing'){const k=clamp(g.t/0.55,0,1);hx=Xb+c*lerp(8,26,k*k);hy=Yb-40+s*6;}
          membre(sx,sy,hx,hy,6,col(ROC));cx.fillStyle=col(FER);circ(hx,hy,4.5);
          if(avec){const L=1.0,ex=Math.cos(g.fa)*L*T,ey=Math.sin(g.fa)*L*T*K;membre(hx-ex*0.55,hy-ey*0.55-(g.etat==='arme'?6:0),hx+ex,hy+ey-(g.etat==='arme'?10:0),3,'#8a6236');
            cx.fillStyle='#cfd8e6';circ(hx+ex,hy+ey-(g.etat==='arme'?10:0),3.2);}}
        else{membre(sx,sy,Xb-c*8+cote*4,Yb-34,6,col(ROC));}
      }});
      break;}
    case 'belier':{
      const ch=g.etat==='charge',gr=g.etat==='gratte',tr=gr?rnd(-1.5,1.5):0,Xb=X+tr,zb=0.62+g.z;
      for(const [ox,oy] of [[-0.35,-0.25],[0.35,-0.25],[-0.35,0.25],[0.35,0.25]]){const lx=g.x+ox,ly=g.y+oy,s=g.bouge||ch?Math.sin((g.marche||0)*4+ox*9)*4:0;membre(px(lx)+tr,py(ly,0.35),px(lx)+tr+s,py(ly,0)-1,8,col(FER2));}
      const hx=Xb+cs*24,hy=py(g.y,zb)+sn*9+4;
      const tete=()=>{cx.fillStyle=col(ROCH);cx.beginPath();cx.roundRect?cx.roundRect(hx-14,hy-14,28,24,6):cx.rect(hx-14,hy-14,28,24);cx.fill();
        cx.strokeStyle=col(BRZ);cx.lineWidth=5;for(const s of [-1,1]){cx.beginPath();cx.arc(hx+s*14,hy-6,8,s>0?-Math.PI*0.9:-Math.PI*0.1,s>0?Math.PI*0.6:Math.PI*1.4,s<0);cx.stroke();}
        if(sn>-0.5)yeux(hx+cs*3,hy-3,5,3,gr||ch);};
      if(sn<0)tete();
      cx.fillStyle=col(ROC);ell(Xb,py(g.y,zb),g.r*T*0.95,22);
      cx.fillStyle=col(ROCH);ell(Xb-4,py(g.y,zb)-9,g.r*T*0.7,12);
      cx.fillStyle=col(BRZ2);cx.fillRect(Xb-g.r*T*0.7,py(g.y,zb)+2,g.r*T*1.4,6);
      if(sn>=0)tete();
      if(ch){cx.strokeStyle='rgba(255,200,150,.5)';cx.lineWidth=2;for(let k=0;k<3;k++){const o=(k-1)*12;ligne(Xb-cs*30-sn*o*0.3,py(g.y,zb)+o*0.5,Xb-cs*60-sn*o*0.3,py(g.y,zb)+o*0.5-sn*8);}}
      haut=(zb+0.75)*ZH;break;}
    case 'mortier':{
      const v=g.etat==='vise';
      bonhomme(g,40,40,ROC,ROCH,{tete:10,fort:v,bras:(Xb,Yb,c,s,cote)=>{membre(Xb+cote*20,Yb-28,Xb+cote*24,Yb-14,6,col(ROC));}});
      const tx=X+cs*5,ty=Y-40,ex=tx+cs*8,ey=ty-24+sn*4;
      membre(tx,ty,ex,ey,15,col(FER));membre(tx,ty,ex,ey,9,col(FER2));
      cx.fillStyle=col(BRZ);cx.fillRect(tx-9,ty-3,18,5);
      glow('rgba(255,110,40,.9)',ex,ey,v?18:10,v?1:0.6);
      haut=72;break;}
    case 'dalle':{
      const cxx=g.x+cs*0.62,cyy=g.y+sn*0.62,pxp=-sn*0.85,pyp=cs*0.85;
      let lev=0;if(g.etat==='marteau')lev=g.t<0.55*arm()?clamp(g.t/0.4,0,1):Math.max(0,1-(g.t-0.55*arm())/(0.4*arm()));
      const zh=0.1+lev*1.4,ht=1.55-lev*0.7;
      const dalle=()=>{if(!g.aDalle)return;
        const A=[px(cxx+pxp),py(cyy+pyp,zh)],B=[px(cxx-pxp),py(cyy-pyp,zh)],C=[B[0],py(cyy-pyp,zh+ht)],D=[A[0],py(cyy+pyp,zh+ht)];
        const ep=[cs*0.14*T,sn*0.14*T*K];
        poly([D,C,[C[0]-ep[0],C[1]-ep[1]],[D[0]-ep[0],D[1]-ep[1]]],col([110,116,130]));
        poly([A,B,C,D],col([84,90,104]),'#2a2d36');
        cx.strokeStyle=col(BRZ);cx.lineWidth=2;ligne((A[0]+B[0])/2,A[1]-6,(C[0]+D[0])/2,D[1]+6);
        if(g.fissure){cx.strokeStyle='#14161c';cx.lineWidth=2;const mx=(A[0]+B[0])/2,my=(A[1]+D[1])/2;cx.beginPath();cx.moveTo(mx-14,D[1]+4);cx.lineTo(mx-3,my-6);cx.lineTo(mx+6,my+4);cx.lineTo(mx+2,A[1]-4);cx.stroke();cx.beginPath();cx.moveTo(mx-3,my-6);cx.lineTo(mx+16,my-14);cx.stroke();}
      };
      if(sn<0&&lev<0.3)dalle();
      bonhomme(g,34,70,ROC,ROCH,{fort:arme,bras:(Xb,Yb,c,s,cote)=>{
        if(g.aDalle&&cote===1){membre(Xb-14,Yb-52,Xb+c*16-10,Yb-38-lev*30,7,col(ROC));membre(Xb+14,Yb-52,Xb+c*16+10,Yb-38-lev*30,7,col(ROC));}
        else if(!g.aDalle){let hx=Xb+cote*20,hy=Yb-30;if(cote===1&&g.etat==='poing'){const k=clamp(g.t/0.6,0,1);hx=Xb+c*lerp(10,30,k*k);hy=Yb-42+s*6;}membre(Xb+cote*16,Yb-52,hx,hy,8,col(ROC));cx.fillStyle=col(FER);circ(hx,hy,6);}
      }});
      if(sn>=0||lev>=0.3)dalle();
      break;}
    case 'colosse':{
      const onde=g.etat==='onde',k=onde?clamp(g.t/(1.25*arm()),0,1):0;
      bonhomme(g,78,112,ROC,ROCH,{tete:22,fort:arme,tremble:onde&&k>0.6,braiseForte:true,bras:(Xb,Yb,c,s,cote)=>{
        const sx=Xb+cote*38,sy=Yb-88;let hx=Xb+cote*48,hy=Yb-44;
        if(onde){hx=Xb+cote*lerp(48,22,k);hy=Yb-lerp(44,140,Math.min(1,k*1.3));}
        if(g.etat==='poing'&&cote===1){const kk=clamp(g.t/0.75,0,1);hx=Xb+c*lerp(30,70,kk*kk);hy=Yb-60+s*10;}
        membre(sx,sy,hx,hy,18,col(ROC));cx.fillStyle=col(FER);circ(hx,hy,14);cx.fillStyle=col(BRZ);circ(hx,hy,5);
      }});
      for(const s of [-1,1])poly([[X+s*30,Y-96],[X+s*44,Y-112],[X+s*42,Y-90]],col(BRZ));
      break;}
  }
  FL=0;
  if(g.etat==='sonne')etoiles(X,Y-haut-6);
  if(g.hp<g.max||g.type==='colosse')barre(g,Y-haut-14);
  cx.globalAlpha=1;
}

/* ======================= les autres choses ======================= */
function dessinerItem(it){
  const X=px(it.x),Y=py(it.y,0),ex=px(it.x-Math.cos(it.a)*0.45),ey=py(it.y-Math.sin(it.a)*0.45,1.35);
  cx.fillStyle='rgba(0,0,0,.3)';ell(X,Y,6,3);
  membre(X,Y,ex,ey,3.5,'#8a6236');cx.fillStyle='#d8c090';poly([[ex,ey],[ex-5,ey-6],[ex+3,ey-7]],'#d8c090');
  glow('rgba(255,176,112,.9)',X,Y-6,14,0.3+0.2*Math.sin(tReel*6));
}
function dessinerLoup(l){
  const X=px(l.x),Y=py(l.y,0),d=l.dir,s=Math.sin(l.pas);
  glow('rgba(91,224,230,.9)',X,Y-20,40,0.45);cx.globalAlpha=0.85;
  membre(X-d*16,Y-20,X-d*16-s*8,Y-1,5,'#2e8a90');membre(X+d*14,Y-20,X+d*14+s*8,Y-1,5,'#2e8a90');
  cx.fillStyle='#5be0e6';ell(X,Y-24,24,10);cx.fillStyle='#8af2f5';ell(X+d*24,Y-30,10,8);
  poly([[X+d*20,Y-36],[X+d*22,Y-46],[X+d*27,Y-36]],'#8af2f5');membre(X-d*22,Y-26,X-d*36,Y-34,5,'#5be0e6');
  cx.fillStyle='#fff';circ(X+d*28,Y-31,1.8);cx.globalAlpha=1;
}
function dessinerAir(){
  for(const f of fleches){const X=px(f.x),Y=py(f.y,0.75),bx=px(f.x-Math.cos(f.a)*0.65),by=py(f.y-Math.sin(f.a)*0.65,0.75);
    cx.fillStyle='rgba(0,0,0,.25)';ell(X,py(f.y,0),4,2);membre(bx,by,X,Y,2.6,f.dmg>1?'#d9c8ff':'#d8f1f4');glow(f.dmg>1?'rgba(200,182,255,.9)':'rgba(91,224,230,.9)',X,Y,10,0.7);}
  for(const j of javs){const X=px(j.x),Y=py(j.y,0.85),bx=px(j.x-Math.cos(j.a)*1.2),by=py(j.y-Math.sin(j.a)*1.2,0.85);
    cx.fillStyle='rgba(0,0,0,.25)';ell(X,py(j.y,0),5,2);if(j.joueur)glow('rgba(255,176,112,.9)',X,Y,18,0.8);else{cx.strokeStyle='rgba(255,60,40,.35)';cx.lineWidth=6;ligne(bx,by,X,Y);}
    membre(bx,by,X,Y,3,'#8a6236');cx.fillStyle='#cfd8e6';circ(X,Y,3.2);}
  for(const o of obus){if(o.t<0)continue;const k=clamp(o.t/o.dur,0,1),x=lerp(o.x0,o.x1,k),y=lerp(o.y0,o.y1,k),z=1.2+Math.sin(Math.PI*k)*5.5-k*1.2;
    cx.fillStyle='rgba(0,0,0,.3)';ell(px(x),py(y,0),6*k+2,3*k+1);glow('rgba(255,110,40,.9)',px(x),py(y,z),16,0.8);cx.fillStyle='#2a2d36';circ(px(x),py(y,z),6);cx.fillStyle='#ffb060';circ(px(x)-1.5,py(y,z)-1.5,2);}
  const sl=P.slash;
  if(sl&&tReel-sl.t<0.17){
    const a=1-(tReel-sl.t)/0.17,r0=0.55,r1=sl.trois?1.75:1.45,a0=sl.tour?0:sl.a-1.1,a1=sl.tour?Math.PI*2:sl.a+1.1,n=sl.tour?24:12;
    cx.beginPath();for(let i=0;i<=n;i++){const t=a0+(a1-a0)*i/n,X=px(P.x+Math.cos(t)*r1),Y=py(P.y+Math.sin(t)*r1,0.55);i?cx.lineTo(X,Y):cx.moveTo(X,Y);}
    for(let i=n;i>=0;i--){const t=a0+(a1-a0)*i/n;cx.lineTo(px(P.x+Math.cos(t)*r0),py(P.y+Math.sin(t)*r0,0.55));}
    cx.closePath();cx.fillStyle=`rgba(216,241,244,${0.5*a})`;cx.fill();
    cx.strokeStyle=`rgba(255,255,255,${0.9*a})`;cx.lineWidth=sl.trois?3:2;cx.beginPath();for(let i=0;i<=n;i++){const t=a0+(a1-a0)*i/n,X=px(P.x+Math.cos(t)*r1),Y=py(P.y+Math.sin(t)*r1,0.55);i?cx.lineTo(X,Y):cx.moveTo(X,Y);}cx.stroke();
  }
}
function dessinerParts(){
  for(const q of parts){
    const a=clamp(q.vie/q.max,0,1),X=px(q.x)+(q.ox||0),Y=py(q.y,q.z||0)+(q.oy||0);
    switch(q.k){
      case 'fant':cx.fillStyle=`rgba(200,182,255,${a*0.45})`;ell(X,Y-26,9,22);break;
      case 'e':cx.globalAlpha=a;cx.fillStyle=q.c;cx.fillRect(X-1.6,Y-1.6,3.2,3.2);cx.globalAlpha=1;break;
      case 'cr':cx.globalAlpha=a;cx.fillStyle='#ff7a4a';losange(X,Y,q.s*0.6,q.s);cx.globalAlpha=1;break;
      case 'p':cx.fillStyle=`rgba(150,150,160,${a*0.35})`;circ(X,Y,q.s*(1.4-a*0.4));break;
      case 'c':cx.globalAlpha=Math.min(1,a*2);cx.save();cx.translate(X,Y);cx.rotate(q.r);cx.fillStyle=q.c;cx.fillRect(-q.s/2,-q.s/2,q.s,q.s*0.8);cx.restore();cx.globalAlpha=1;break;
      case 'onde':cx.strokeStyle=`rgba(255,240,210,${a})`;cx.lineWidth=3;ellS(X,Y,(1-a)*40*q.s+6,(1-a)*30*q.s+4);break;
      case 't':cx.globalAlpha=Math.min(1,a*2);cx.font='900 15px Nunito,sans-serif';cx.textAlign='center';cx.textBaseline='middle';cx.lineWidth=4;cx.strokeStyle='rgba(0,0,0,.75)';cx.strokeText(q.t,X,Y);cx.fillStyle=q.c;cx.fillText(q.t,X,Y);cx.globalAlpha=1;break;
    }
  }
}
function dessinerFondVivant(){
  for(const [tx,tz] of TORCHES){const X=px(tx),Y=py(1.3,tz),f=Math.sin(tReel*9+tx)*0.08;glow('rgba(255,170,70,.9)',X,Y-6,62,0.32+f);
    poly([[X-6,Y],[X+6,Y],[X+rnd(-2,2),Y-14-Math.random()*6]],'#ffb44a');poly([[X-3,Y],[X+3,Y],[X,Y-8]],'#fff0b0');}
  for(const [i,dx] of [[0,8],[1,18]]){
    const o=porte[i],x0=px(dx-1.25),x1=px(dx+1.25),yb=py(1.3,0),yt=py(1.3,2.6),w=(x1-x0)/2*(1-o*0.82);
    if(o>0)glow('rgba(255,70,30,.9)',(x0+x1)/2,yb-26,60,o*0.7);
    for(const [a,b] of [[x0,x0+w],[x1-w,x1]]){cx.fillStyle='#5a3c18';cx.fillRect(a,yt,b-a,yb-yt);cx.strokeStyle='#3a2810';cx.lineWidth=2;for(let k=a+8;k<b-2;k+=12)ligne(k,yt+4,k,yb-4);cx.fillStyle='#c9993f';if(b-a>10){circ(a+5,yt+12,2);circ(a+5,yb-12,2);}}
  }
  /* Grosbec sur son estrade */
  const gx=px(13),gy=py(0.82,1.7);
  cx.save();cx.translate(gx,gy);cx.scale(0.8,0.8);cx.translate(-225,-(FT+6));dessinerGrosbecCorps();cx.restore();
  const yf=py(1.3,1.7);cx.fillStyle='#8a6224';cx.fillRect(px(11.3),yf-16,3.4*T,4);for(let x=11.4;x<=14.6;x+=0.4)cx.fillRect(px(x)-1.5,yf-16,3,16);
  if(tReel-GB.bulleT<1.7&&GB.bulle){
    const a=Math.min(1,(1.7-(tReel-GB.bulleT))*3);cx.globalAlpha=a;cx.font='900 15px Nunito,sans-serif';
    const w=cx.measureText(GB.bulle).width+20,bx=GB.cote>0?gx+52:gx-52-w,by=gy-120;
    cx.fillStyle='rgba(30,10,8,.92)';cx.strokeStyle='#ff6a4a';cx.lineWidth=1.5;cx.beginPath();cx.roundRect?cx.roundRect(bx,by,w,28,9):cx.rect(bx,by,w,28);cx.fill();cx.stroke();
    cx.fillStyle='#ffd8c8';cx.textAlign='left';cx.textBaseline='middle';cx.fillText(GB.bulle,bx+10,by+14.5);cx.globalAlpha=1;
  }
}

/* ======================= l'interface dessinée ======================= */
function coeurF(x,y,s){cx.beginPath();cx.moveTo(x,y+s*0.3);cx.bezierCurveTo(x,y,x-s*0.5,y,x-s*0.5,y+s*0.3);cx.bezierCurveTo(x-s*0.5,y+s*0.6,x,y+s*0.8,x,y+s);cx.bezierCurveTo(x,y+s*0.8,x+s*0.5,y+s*0.6,x+s*0.5,y+s*0.3);cx.bezierCurveTo(x+s*0.5,y,x,y,x,y+s*0.3);cx.closePath();}
let joyVu=false;
function dessinerInterface(){
  const L=14+insetG;
  for(let i=0;i<P.max;i++){const x=L+10+i*22,y=12;coeurF(x,y,18);if(i<P.coeurs){cx.fillStyle='#e0473a';cx.fill();cx.strokeStyle='#ffb0a0';cx.lineWidth=1.2;cx.stroke();}else{cx.fillStyle='rgba(0,0,0,.4)';cx.fill();cx.strokeStyle='rgba(255,176,160,.5)';cx.lineWidth=1.2;cx.stroke();}}
  cx.font='800 12px Nunito,sans-serif';cx.textAlign='left';cx.textBaseline='top';cx.fillStyle='rgba(241,231,208,.85)';
  if(etatJeu==='jeu')cx.fillText(`Vague ${vague+1} / ${VAGUES.length}`,L,36);
  const ics=POUVOIRS.filter(p=>P.up[p.id]).map(p=>p.ic).join(' ');if(ics){cx.font='15px sans-serif';cx.fillText(ics,L,52);}
  if(bandeau&&tReel-bandeau.t<2.8){const t=tReel-bandeau.t,a=t<0.3?t/0.3:t>2.2?Math.max(0,(2.8-t)/0.6):1;cx.globalAlpha=a;cx.textAlign='center';cx.textBaseline='middle';
    cx.fillStyle='rgba(4,7,14,.55)';cx.fillRect(Ws/2-170,Hs*0.3-30,340,62);cx.fillStyle='#f3d48a';cx.font='700 24px Cinzel,Georgia,serif';cx.fillText(bandeau.a,Ws/2,Hs*0.3-10);
    cx.fillStyle='#f1e7d0';cx.font='800 16px Nunito,sans-serif';cx.fillText(bandeau.b,Ws/2,Hs*0.3+16);cx.globalAlpha=1;}
  /* golems hors de l'écran */
  for(const g of G){
    if(g.etat==='mort'||g.etat==='entre')continue;
    const sx=px(g.x)-camX,sy=py(g.y,g.T.h*0.5)-camY;
    if(sx>-6&&sx<Ws+6&&sy>-6&&sy<Hs+6)continue;
    const dx=sx-Ws/2,dy=sy-Hs/2,m=26,k=Math.min((Ws/2-m-insetD)/Math.abs(dx||1e-3),(Hs/2-m)/Math.abs(dy||1e-3)),ex=Ws/2+dx*k,ey=Hs/2+dy*k,a=Math.atan2(dy,dx);
    const dang=!!g.zone||g.etat==='vise',s=dang?13+3*Math.sin(tReel*14):9;
    cx.save();cx.translate(ex,ey);cx.rotate(a);if(dang)glow('rgba(255,46,34,.9)',0,0,26,0.7);
    poly([[s,0],[-s*0.7,-s*0.75],[-s*0.4,0],[-s*0.7,s*0.75]],dang?'#ff4a3a':'rgba(224,71,58,.8)','rgba(0,0,0,.5)');cx.restore();
  }
  /* le pouce gauche */
  const R=joyR();
  if(joy.id!==null){cx.fillStyle='rgba(10,16,30,.35)';circ(joy.bx,joy.by,R);cx.strokeStyle='rgba(243,212,138,.55)';cx.lineWidth=2;cx.beginPath();cx.arc(joy.bx,joy.by,R,0,Math.PI*2);cx.stroke();
    cx.fillStyle='rgba(243,212,138,.6)';circ(joy.bx+joy.vx*R,joy.by+joy.vy*R,R*0.42);}
  else if(etatJeu==='jeu'){const x=L+R+16,y=Hs-R-22;cx.strokeStyle='rgba(243,212,138,.22)';cx.lineWidth=2;cx.beginPath();cx.arc(x,y,R,0,Math.PI*2);cx.stroke();cx.fillStyle='rgba(243,212,138,.18)';circ(x,y,R*0.42);
    if(!joyVu){const p=(tReel%1);cx.strokeStyle=`rgba(255,210,58,${0.95*(1-p)})`;cx.lineWidth=3;cx.beginPath();cx.arc(x,y,R*0.42+p*18,0,Math.PI*2);cx.stroke();}}
}

/* ======================= dessiner une image ======================= */
function majCamera(dt){
  const tx=px(P.x)+inp.mx*40-Ws/2,ty=py(P.y,0)+inp.my*24-Hs*0.56;
  const cxT=SW<Ws?(SW-Ws)/2:clamp(tx,0,SW-Ws),cyT=SH<Hs?(SH-Hs)/2:clamp(ty,0,SH-Hs);
  const k=Math.min(1,dt*6);camX+=(cxT-camX)*k;camY+=(cyT-camY)*k;
}
function camSurP(){majCamera(10);}
function dessiner(dt){
  if(!fondPret)preparerFond();
  cx=ctx0;majCamera(dt);
  if(SW<Ws+2||SH<Hs+2||sec>0){cx.setTransform(1,0,0,1,0,0);cx.fillStyle='#04060b';cx.fillRect(0,0,can.width,can.height);}
  const shx=(Math.random()-.5)*sec,shy=(Math.random()-.5)*sec;
  cx.setTransform(S,0,0,S,(-camX+shx)*S,(-camY+shy)*S);
  const PR=window.__prof,t0=PR?performance.now():0;
  if(Math.abs(SB-S)<1e-6){cx.setTransform(1,0,0,1,Math.round((-camX+shx)*S),Math.round((-camY+shy)*S));cx.drawImage(fond,0,0);cx.setTransform(S,0,0,S,(-camX+shx)*S,(-camY+shy)*S);}
  else cx.drawImage(fond,0,0,SW,SH);
  const t1=PR?performance.now():0;
  dessinerFondVivant();
  const t2=PR?performance.now():0;
  dessinerSol();
  const t3=PR?performance.now():0;
  const liste=[];
  for(const o of OBS)liste.push([o.y,0,o]);
  for(const g of G)if(g.etat!=='mort')liste.push([g.y,1,g]);
  for(const it of items)liste.push([it.y,2,it]);
  for(const l of loups)liste.push([l.y,3,l]);
  liste.push([P.y,4,P]);
  liste.sort((a,b)=>a[0]-b[0]);
  for(const [_,k,o] of liste){if(k===0)dessinerObstacle(o);else if(k===1)dessinerGolem(o);else if(k===2)dessinerItem(o);else if(k===3)dessinerLoup(o);else dessinerPisteur();}
  const t4=PR?performance.now():0;
  dessinerAir();dessinerParts();
  const t5=PR?performance.now():0;
  cx.setTransform(S,0,0,S,0,0);
  if(!vign){vign=document.createElement('canvas');vign.width=4;vign.height=64;const g=vign.getContext('2d'),r=g.createLinearGradient(0,0,0,64);r.addColorStop(0,'rgba(0,0,0,.55)');r.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=r;g.fillRect(0,0,4,64);}
  cx.drawImage(vign,0,0,Ws,64);
  if(flashR>0){cx.globalAlpha=flashR*0.5;cx.fillStyle='#a01010';cx.fillRect(0,0,Ws,Hs);cx.globalAlpha=1;}
  if(flashB>0){cx.globalAlpha=flashB*0.6;cx.fillStyle='#fff6e0';cx.fillRect(0,0,Ws,Hs);cx.globalAlpha=1;}
  const t6=PR?performance.now():0;
  dessinerInterface();
  if(PR){const t7=performance.now();const d=[t1-t0,t2-t1,t3-t2,t4-t3,t5-t4,t6-t5,t7-t6];PR.n=(PR.n||0)+1;PR.s=PR.s||[0,0,0,0,0,0,0];d.forEach((v,i)=>PR.s[i]+=v);}
}

/* ======================= les doigts et les touches ======================= */
function joyR(){return Hs*0.13;}
Object.assign(joy,{vx:0,vy:0});
const doigtsDague=new Set();
function loc(e){return [e.clientX/innerWidth*Ws,e.clientY/innerHeight*Hs];}
can.addEventListener('pointerdown',e=>{
  e.preventDefault();initSon();
  if(etatJeu!=='jeu'||enPause||choixOuvert)return;
  const [x,y]=loc(e);
  if(e.clientX<innerWidth*0.5){if(joy.id===null){joy.id=e.pointerId;joy.bx=x;joy.by=y;joy.vx=joy.vy=0;joy.mx=joy.my=0;joyVu=true;try{can.setPointerCapture(e.pointerId);}catch(_){}}}
  else{doigtsDague.add(e.pointerId);}
});
can.addEventListener('pointermove',e=>{
  if(e.pointerId!==joy.id)return;e.preventDefault();
  const [x,y]=loc(e),R=joyR();let dx=x-joy.bx,dy=y-joy.by,d=Math.hypot(dx,dy);
  if(d>R*1.2){joy.bx+=dx/d*(d-R*1.2);joy.by+=dy/d*(d-R*1.2);dx=x-joy.bx;dy=y-joy.by;d=Math.hypot(dx,dy);}
  const m=Math.min(1,d/R);joy.vx=d>0?dx/d*m:0;joy.vy=d>0?dy/d*m:0;
  if(m<0.14){joy.mx=joy.my=0;return;}
  const wx=dx,wy=dy/K,n=Math.hypot(wx,wy)||1,f=Math.min(1,(m-0.14)/0.6);joy.mx=wx/n*f;joy.my=wy/n*f;
});
function finDoigt(e){if(e.pointerId===joy.id){joy.id=null;joy.mx=joy.my=joy.vx=joy.vy=0;}doigtsDague.delete(e.pointerId);}
can.addEventListener('pointerup',finDoigt);can.addEventListener('pointercancel',finDoigt);can.addEventListener('lostpointercapture',finDoigt);
can.addEventListener('contextmenu',e=>e.preventDefault());
document.addEventListener('gesturestart',e=>e.preventDefault());
const bDague=$('bDague'),bArc=$('bArc'),bBond=$('bBond'),bPause=$('bPause'),btnGo=$('btnGo');
function bouton(el,bas,haut){
  el.addEventListener('pointerdown',e=>{e.preventDefault();e.stopPropagation();initSon();el.classList.add('appui');bas();try{el.setPointerCapture(e.pointerId);}catch(_){}});
  const fin=()=>{el.classList.remove('appui');if(haut)haut();};
  el.addEventListener('pointerup',fin);el.addEventListener('pointercancel',fin);el.addEventListener('lostpointercapture',fin);
  el.addEventListener('contextmenu',e=>e.preventDefault());
}
bouton(bDague,()=>boutons.dague=true,()=>boutons.dague=false);
bouton(bArc,()=>boutons.arc=true,()=>boutons.arc=false);
bouton(bBond,()=>{bondDemande=true;});
const TOUCHES={ArrowUp:'h',KeyW:'h',KeyZ:'h',ArrowDown:'b',KeyS:'b',ArrowLeft:'g',KeyA:'g',KeyQ:'g',ArrowRight:'d',KeyD:'d'};
addEventListener('keydown',e=>{
  if(TOUCHES[e.code]){clav[TOUCHES[e.code]]=1;joyVu=true;e.preventDefault();}
  else if(e.code==='KeyJ')clav.dague=true;else if(e.code==='KeyK')clav.arc=true;
  else if(e.code==='Space'){e.preventDefault();if(!e.repeat){initSon();bondDemande=true;}}
  else if(e.code==='Escape'||e.code==='KeyP'){if(etatJeu==='jeu'&&!choixOuvert)enPause?reprendre():ouvrirPause();}
});
addEventListener('keyup',e=>{if(TOUCHES[e.code])clav[TOUCHES[e.code]]=0;else if(e.code==='KeyJ')clav.dague=false;else if(e.code==='KeyK')clav.arc=false;});
addEventListener('blur',()=>{clav.h=clav.b=clav.g=clav.d=0;clav.dague=clav.arc=false;boutons.dague=boutons.arc=false;});

/* ======================= les écrans ======================= */
const regles=$('regles'),pauseEl=$('pause'),finEl=$('fin'),finCarte=$('finCarte');
const ARC_SVG=$('icArc').innerHTML,JAV_SVG='<path d="M6 34 L32 8" stroke="#c9a060" stroke-width="3.4" stroke-linecap="round"/><path d="M32 8 l6 -4 l-2 7z" fill="#cfd8e6"/><path d="M6 34 l-2 3 M9 31 l-4 1" stroke="#ffb070" stroke-width="2"/>';
function majBoutonArc(){
  bArc.classList.toggle('javelot',P.porte);$('lArc').textContent=P.porte?'javelot':'arc';$('icArc').innerHTML=P.porte?JAV_SVG:ARC_SVG;
  bArc.classList.toggle('anneau',P.porte&&!vus.javLance);
}
function boutonsJeu(on){for(const b of [bDague,bArc,bBond,bPause])b.classList.toggle('on',on);if(!on)bBond.classList.remove('anneau');}
function nettoyerMonde(){
  OBS=OBS0.map(o=>({...o}));majGrille();
  G=[];fleches=[];javs=[];obus=[];ondes=[];feux=[];loups=[];items=[];parts=[];file=[];champJ=null;porte[0]=porte[1]=0;
  hitstop=0;sec=0;flashR=0;flashB=0;defaiteDans=0;finDans=0;P.slash=null;
}
function nouveauxStats(){return {tues:0,degats:0,esquives:0,recus:0,caram:0,bang:0,ramasses:0,dalles:0,plantees:0,pouvoirs:[],debut:tReel};}
function demarrer(i,garder){
  initSon();
  for(const el of [regles,finEl,pauseEl,choixEl])el.classList.remove('on');choixOuvert=false;enPause=false;
  if(!garder){resetP(false);stats=nouveauxStats();}else resetP(true);
  nettoyerMonde();
  etatJeu='jeu';boutonsJeu(true);majBoutonArc();btnGo.textContent='En garde !';camSurP();
  dernier=performance.now();demarrerVague(i||0);
}
function ouvrirPause(){
  if(etatJeu!=='jeu')return;enPause=true;pauseEl.classList.add('on');cacherMsg();
  $('pMesures').textContent=`Image : ${can.width} × ${can.height} · ${fpsMoy.toFixed(0)} images par seconde · finesse ${finesse}`;
}
function reprendre(){enPause=false;pauseEl.classList.remove('on');regles.classList.remove('on');dernier=performance.now();}
bPause.onclick=()=>enPause?reprendre():ouvrirPause();
$('pReprendre').onclick=reprendre;
$('pSuivant').onclick=()=>{reprendre();passerVague();};
$('pRegles').onclick=()=>{pauseEl.classList.remove('on');regles.classList.add('on');btnGo.textContent='Reprendre';};
$('pDur').onclick=()=>{dur=!dur;$('pDur').textContent=dur?'Golems : costauds':'Golems : normaux';};
$('pSon').onclick=()=>{sonOn=!sonOn;$('pSon').textContent=sonOn?'Son : oui':'Son : non';};
$('pRecommencer').onclick=()=>demarrer(0,false);
btnGo.onclick=()=>{if(etatJeu==='jeu'&&enPause)reprendre();else demarrer(0,false);};
function passerVague(){for(const g of G)if(g.etat!=='mort')tuer(g);file=[];groupeI=VAGUES[vague].groupes.length;items=[];javs=[];obus=[];ondes=[];}
{const b=$('conteurHp');b.addEventListener('pointerdown',e=>e.stopPropagation());b.onclick=()=>lire(conteurTxt.textContent);}
document.addEventListener('click',e=>{const b=e.target.closest('[data-lire]');if(!b)return;const c=b.closest('.pouvoir'),p=c?null:b.parentElement.querySelector('p');if(c){lire(c.querySelector('b').textContent+'. '+c.querySelector('p').textContent);return;}if(p)lire(p.textContent);});
function duree(){const s=Math.round(tReel-stats.debut);return `${Math.floor(s/60)} min ${String(s%60).padStart(2,'0')}`;}
function victoire(){finDans=1.2;son('victoire');cacherMsg();}
function montrerVictoire(){
  etatJeu='fin';boutonsJeu(false);cacherMsg();
  finCarte.innerHTML=`<h1>La garde est en miettes !</h1>
  <div class="texte"><p>Grosbec trépigne sur son estrade. Plus un golem debout : le Pisteur a gagné son combat. Il ne reste qu'à prévenir le Sage.</p><button class="hp" data-lire>🔊</button></div>
  <div class="code">🔥 🌙 ⭐</div><p class="petit">le feu · la lune · l'étoile — crie-le au Sage !</p>
  <div class="stats"><span>Durée</span><b>${duree()}</b><span>Golems tombés</span><b>${stats.tues}</b><span>Coups évités d'un bond</span><b>${stats.esquives}</b><span>Carambolages et BANG</span><b>${stats.caram+stats.bang}</b><span>Javelots ramassés</span><b>${stats.ramasses}</b><span>Dalles cassées</span><b>${stats.dalles}</b><span>Cœurs perdus</span><b>${stats.recus}</b></div>
  <p class="petit">Pouvoirs : ${stats.pouvoirs.join(' · ')||'aucun'}</p>
  <div class="bas"><button class="jaune" id="fRejouer">Rejouer</button></div>`;
  finEl.classList.add('on');$('fRejouer').onclick=()=>demarrer(0,false);
}
function defaite(){
  etatJeu='fin';boutonsJeu(false);cacherMsg();
  finCarte.innerHTML=`<h1>Le Pisteur est à terre…</h1>
  <div class="texte"><p>Grosbec ricane sur son estrade. Mais un golem prévient toujours avant de frapper : le rouge au sol ne ment pas. On se relève ?</p><button class="hp" data-lire>🔊</button></div>
  <div class="menu" style="margin-top:1em"><button class="jaune" id="fReprendre">Reprendre la vague ${vague+1}</button><button class="gris" id="fDebut">Recommencer du début</button></div>`;
  finEl.classList.add('on');$('fReprendre').onclick=()=>demarrer(vague,true);$('fDebut').onclick=()=>demarrer(0,false);
}

/* ======================= la boucle ======================= */
let dernier=performance.now(),fpsN=0,fpsT=0,fpsMoy=60,essaisFps=0;
function boucle(now){
  requestAnimationFrame(boucle);
  let dt=(now-dernier)/1000;dernier=now;if(!(dt>0))dt=0.016;dt=Math.min(dt,0.05);
  tReel+=dt;
  const actif=etatJeu==='jeu'&&!enPause&&!choixOuvert&&!tourne;
  if(actif){
    fpsN++;fpsT+=dt;if(fpsT>=2){fpsMoy=fpsN/fpsT;fpsN=0;fpsT=0;if(fpsMoy<38&&finesse<2&&essaisFps<4){essaisFps++;finesse++;try{localStorage.setItem('pisteur3_finesse',finesse);}catch(e){}taille();}}
    GB.t+=dt;majMsg();
    if(hitstop>0)hitstop-=dt;
    else{const q=window.__prof,u0=q?performance.now():0;lireEntrees();majJoueur(dt);majGolems(dt);majProjectiles(dt);majVagues(dt);if(q){q.regles=(q.regles||0)+performance.now()-u0;}}
    majParts(dt);
    porte[0]=Math.max(0,porte[0]-dt*0.45);porte[1]=Math.max(0,porte[1]-dt*0.45);
    const d=Math.hypot(P.x-P.lx,P.y-P.ly);P.court=d>0.004&&P.etat!=='bond';P.pas+=d;P.lx=P.x;P.ly=P.y;
    for(const g of G)if(g.zone&&!vus.anneauBond){vus.anneauBond=1;bBond.classList.add('anneau');}
    if(defaiteDans>0){defaiteDans-=dt;if(defaiteDans<=0)defaite();}
    if(finDans>0){finDans-=dt;if(finDans<=0)montrerVictoire();}
  }
  sec=Math.max(0,sec-dt*26);flashR=Math.max(0,flashR-dt*1.6);flashB=Math.max(0,flashB-dt*1.2);
  dessiner(dt);
}

/* ======================= pour les essais automatiques ======================= */
window.__pt={
  etat:()=>({etatJeu,phase,vague,groupeI,enPause,choix:choixOuvert,fps:fpsMoy,finesse,taille:[can.width,can.height],
    P:{x:P.x,y:P.y,z:P.z,coeurs:P.coeurs,max:P.max,etat:P.etat,porte:P.porte,charges:P.charges,fa:P.fa,up:Object.keys(P.up)},
    G:G.filter(g=>g.etat!=='mort').map(g=>({type:g.type,x:g.x,y:g.y,hp:g.hp,max:g.max,etat:g.etat,fa:g.fa,r:g.r,aDalle:g.aDalle,zone:g.zone?Object.assign({},g.zone):null})),
    obus:obus.map(o=>({x:o.x1,y:o.y1,t:o.t,dur:o.dur})),ondes:ondes.map(w=>({x:w.x,y:w.y,r:w.r,ep:w.ep})),
    javs:javs.filter(j=>!j.joueur).map(j=>({x:j.x,y:j.y,a:j.a})),items:items.map(i=>({x:i.x,y:i.y})),
    obs:OBS.map(o=>({k:o.k,x:o.x,y:o.y,c:o.c||0,r:o.r||0,w:o.w||0,d:o.d||0,haut:o.haut||0})),stats,msg:msgCur,choixDispo:choixOuvert?(window.__choixDispo||[]).map(p=>p.id):[]}),
  cmd:o=>{for(const k of ['mx','my','dague','arc'])if(k in o)robot[k]=o[k];if(o.bond)bondDemande=true;},
  choisir:i=>{const b=cartesEl.querySelectorAll('button.jaune')[i];if(b)b.click();},
  demarrer:i=>demarrer(i||0,false),
  suivant:()=>passerVague(),
  invincible:v=>{invincible=!!v;},
  dur:v=>{dur=!!v;},
  ev:s=>eval(s)
};

/* ======================= au départ ======================= */
resetP(false);stats=nouveauxStats();OBS=OBS0.map(o=>({...o}));majGrille();P.lx=P.x;P.ly=P.y;
taille();camSurP();requestAnimationFrame(boucle);
