/* ======================= la grande salle de Grosbec : peinte une fois =======================
   Le sol, les murs, l'estrade, les ombres et la lumière (les torches, la lune, la lueur rouge de Grosbec) sont cuits dans une seule
   image ; les obstacles sont cuits à part (ils passent devant ou derrière les personnages). Mêmes matières que les golems. */
const Salle=(()=>{
  const {lin,rad,poly,ell,alea,toile,sprite}=Ou,{plaque,roc,BRONZE,FER,ROC}=Golems.O_;
  const HM=4.6,BOIS=['#a87840','#7a5228','#3e2610'];
  const TORCHES=[{x:2.4,z:2.5},{x:23.6,z:2.5},{x:9.85,z:2.9},{x:16.15,z:2.9}];
  const LAMPES=[{x:-0.45,y:6.2,z:2.25},{x:26.45,y:12.4,z:2.25}];
  let fond=null,fondA=null,SA=1,SB=1,lumX=null,sprites=new Map(),copies=new Map(),multiplie=true;
  const rr=(g,x,y,w,h,r)=>{g.beginPath();if(g.roundRect)g.roundRect(x,y,w,h,r);else g.rect(x,y,w,h);};
  /* une pierre taillée : sa teinte, son biseau, son grain, parfois une fissure ou une tache */
  function pierre(g,R,X,Y,W,H,ton,chaud,rel){
    rel=rel==null?1:rel;
    const t=ton+(R()-0.5)*30,c=chaud?[t+6,t-4,t-20]:[t-14,t-8,t+10];
    rr(g,X,Y,W,H,2.5);g.fillStyle=`rgb(${c[0]|0},${c[1]|0},${c[2]|0})`;g.fill();
    g.fillStyle=lin(g,X,Y,X+W*0.6,Y+H,[`rgba(255,255,255,${0.1*rel})`,`rgba(0,0,0,${0.14*rel})`]);g.fill();
    g.fillStyle=`rgba(255,255,255,${0.2*rel})`;g.fillRect(X+1,Y,W-2,1.4);g.fillRect(X,Y+1,1.3,H-2);
    g.fillStyle=`rgba(0,0,0,${0.34*rel})`;g.fillRect(X+1,Y+H-1.6,W-2,1.6);g.fillRect(X+W-1.4,Y+1,1.4,H-2);
    for(let i=0,n=Math.min(26,W*H/240);i<n;i++){g.fillStyle=R()<0.5?'rgba(0,0,0,.13)':'rgba(255,255,255,.09)';g.fillRect(X+2+R()*(W-5),Y+2+R()*(H-5),1+R()*2.2,1+R()*1.4);}
    if(R()<0.2){let a=X+R()*W,b=Y+R()*H;g.beginPath();g.moveTo(a,b);for(let k=0;k<4;k++){a=clamp(a+(R()-0.5)*W*0.5,X+1,X+W-1);b=clamp(b+(R()-0.3)*H*0.5,Y+1,Y+H-1);g.lineTo(a,b);}g.strokeStyle='rgba(14,16,24,.6)';g.lineWidth=1.2;g.stroke();g.translate(1,1);g.strokeStyle='rgba(255,255,255,.10)';g.lineWidth=0.8;g.stroke();g.translate(-1,-1);}
    if(R()<0.16){const a=X+R()*W,b=Y+R()*H,r0=8+R()*18;g.save();rr(g,X,Y,W,H,2.5);g.clip();g.fillStyle=rad(g,a,b,0,r0,['rgba(10,12,20,.3)','rgba(10,12,20,0)']);g.fillRect(a-r0,b-r0,r0*2,r0*2);g.restore();}
  }
  /* un mur de blocs : (X, Y, W, H), des rangs de hauteur rh */
  function blocs(g,R,X,Y,W,H,ton,rh,lmin,lmax){
    g.fillStyle='#14161d';g.fillRect(X,Y,W,H);
    for(let r=0,y=Y+H;y>Y+0.5;r++){const y1=Math.max(Y,y-rh);let x=X-(r%2)*lmin*0.5-R()*8;
      while(x<X+W){const w=lmin+R()*(lmax-lmin),a=Math.max(X,x),b=Math.min(X+W,x+w);if(b-a>5)pierre(g,R,a+0.6,y1+0.6,b-a-1.2,y-y1-1.2,ton,R()<0.12);x+=w;}
      y=y1;}
  }
  function ombrePortee(g,dessin){g.save();g.shadowColor='rgba(0,0,0,.62)';g.shadowBlur=16*SB;g.shadowOffsetX=4000*SB;g.shadowOffsetY=0;g.translate(-4000,0);g.fillStyle='#000';dessin();g.fill();g.restore();}
  function sol(g){
    const R=alea(7),rows=8,rh=(RD-Y0)/rows;
    g.fillStyle='#12141b';g.fillRect(px(0)-2,py(Y0)-2,RW*T+4,(RD-Y0)*T*K+4);
    for(let j=0;j<rows;j++){const y=Y0+j*rh;let x=-(j%2)*1.1-R()*0.5;
      while(x<RW){const w=2.0+R()*1.2,a=Math.max(x,0),b=Math.min(x+w,RW);if(b-a>0.25)pierre(g,R,px(a)+0.7,py(y)+0.7,(b-a)*T-1.4,rh*T*K-1.4,158,R()<0.22,0.42);x+=w;}}
    /* le grand tapis */
    const tx0=px(11.5),tx1=px(14.5),ty0=py(3.2),ty1=py(RD-0.25);
    g.fillStyle=lin(g,tx0,0,tx1,0,['#5a1317','#84201f','#6c191b','#84201f','#5a1317']);g.fillRect(tx0,ty0,tx1-tx0,ty1-ty0);
    for(let y=ty0+8;y<ty1;y+=23+R()*9){g.fillStyle='rgba(0,0,0,.10)';g.fillRect(tx0,y,tx1-tx0,4+R()*4);g.fillStyle='rgba(255,220,180,.05)';g.fillRect(tx0,y-3,tx1-tx0,2);}
    for(let i=0;i<260;i++){g.fillStyle=R()<0.5?'rgba(0,0,0,.14)':'rgba(255,200,160,.08)';g.fillRect(tx0+R()*(tx1-tx0),ty0+R()*(ty1-ty0),1.5,1.5);}
    for(const [x,w,c] of [[tx0+3,5,'#d4aa52'],[tx1-8,5,'#d4aa52'],[tx0+10,1.5,'#8a6524'],[tx1-11.5,1.5,'#8a6524']]){g.fillStyle=c;g.fillRect(x,ty0,w,ty1-ty0);}
    g.strokeStyle='rgba(226,186,98,.55)';g.lineWidth=1.6;
    for(let y=4.6;y<RD-1;y+=1.9){if(Math.abs(y-10.4)<2.9)continue;g.beginPath();g.moveTo(px(13),py(y));g.lineTo(px(13.75),py(y+0.62));g.lineTo(px(13),py(y+1.24));g.lineTo(px(12.25),py(y+0.62));g.closePath();g.fillStyle='rgba(60,10,14,.55)';g.fill();g.stroke();}
    for(let x=tx0+2;x<tx1;x+=5){g.fillStyle='#d4aa52';g.fillRect(x,ty1,2,7);}
    /* la rosace au bec, incrustée dans le sol */
    const RX=px(13),RY=py(10.4),rx=2.55*T,ry=rx*K;
    g.save();g.translate(RX,RY);g.scale(1,K);
    g.fillStyle=rad(g,-rx*0.3,-rx*0.3,rx*0.1,rx*1.1,['#4a3a2a','#2a2019','#17110d']);g.beginPath();g.arc(0,0,rx,0,TAU);g.fill();
    g.lineWidth=7;g.strokeStyle=lin(g,-rx,-rx,rx,rx,['#f0cf80','#9a7434','#5d4420']);g.stroke();
    g.lineWidth=1.6;g.strokeStyle='rgba(240,207,128,.6)';g.beginPath();g.arc(0,0,rx*0.8,0,TAU);g.stroke();g.beginPath();g.arc(0,0,rx*0.42,0,TAU);g.stroke();
    for(let i=0;i<16;i++){const a=i/16*TAU;g.beginPath();g.moveTo(Math.cos(a)*rx*0.44,Math.sin(a)*rx*0.44);g.lineTo(Math.cos(a)*rx*0.78,Math.sin(a)*rx*0.78);g.stroke();
      if(i%2===0){const b=a+TAU/32;g.fillStyle='rgba(212,170,82,.35)';g.beginPath();g.moveTo(Math.cos(b)*rx*0.5,Math.sin(b)*rx*0.5);g.lineTo(Math.cos(b+0.1)*rx*0.74,Math.sin(b+0.1)*rx*0.74);g.lineTo(Math.cos(b-0.1)*rx*0.74,Math.sin(b-0.1)*rx*0.74);g.closePath();g.fill();}}
    g.fillStyle=rad(g,-6,-8,2,rx*0.4,['#9a7434','#5d4420','#3a2a14']);g.beginPath();g.arc(0,0,rx*0.38,0,TAU);g.fill();
    poly(g,[[-rx*0.2,-rx*0.14],[rx*0.26,0.02*rx],[-rx*0.2,rx*0.17],[-rx*0.1,0]]);g.fillStyle=lin(g,0,-rx*0.15,0,rx*0.17,['#ffe6a0','#d4aa52','#8a6524']);g.fill();g.strokeStyle='#2a1c0a';g.lineWidth=1.5;g.stroke();
    ell(g,-rx*0.1,-rx*0.03,rx*0.035,rx*0.035,'#2a1c0a');
    g.restore();
    /* l'usure : des taches, des rayures */
    for(let i=0;i<46;i++){const x=px(R()*RW),y=py(Y0+R()*(RD-Y0)),r0=14+R()*40;g.save();g.translate(x,y);g.scale(1,K);g.fillStyle=rad(g,0,0,0,r0,['rgba(8,10,18,.2)','rgba(8,10,18,0)']);g.fillRect(-r0,-r0,r0*2,r0*2);g.restore();}
    for(let i=0;i<30;i++){const x=px(R()*RW),y=py(Y0+R()*(RD-Y0));g.strokeStyle='rgba(255,255,255,.07)';g.lineWidth=0.8;g.beginPath();g.moveTo(x,y);g.lineTo(x+(R()-0.5)*50,y+(R()-0.5)*14);g.stroke();}
    /* les ombres : au pied des murs, sous l'estrade, derrière chaque obstacle */
    let gr=lin(g,0,py(Y0),0,py(Y0+1.7),['rgba(0,0,0,.6)','rgba(0,0,0,0)']);g.fillStyle=gr;g.fillRect(px(0),py(Y0),RW*T,1.7*T*K);
    gr=lin(g,px(0),0,px(1.1),0,['rgba(0,0,0,.55)','rgba(0,0,0,0)']);g.fillStyle=gr;g.fillRect(px(0),py(Y0),1.1*T,(RD-Y0)*T*K);
    gr=lin(g,px(RW),0,px(RW-1.1),0,['rgba(0,0,0,.55)','rgba(0,0,0,0)']);g.fillStyle=gr;g.fillRect(px(RW-1.1),py(Y0),1.1*T,(RD-Y0)*T*K);
    gr=lin(g,0,py(RD-1),0,py(RD),['rgba(0,0,0,0)','rgba(0,0,0,.5)']);g.fillStyle=gr;g.fillRect(px(0),py(RD-1),RW*T,T*K);
    for(const o of OBS0){
      const dx=o.h*0.42*T,dy=o.h*0.2*T*K;
      if(o.c)ombrePortee(g,()=>{g.beginPath();g.ellipse(px(o.x)+dx*0.5,py(o.y)+dy*0.5,o.r*T+dx*0.6,o.r*T*K+dy*0.8+3,0.18,0,TAU);});
      else{const x0=px(o.x-o.w/2),x1=px(o.x+o.w/2),y0=py(o.y-o.d/2),y1=py(o.y+o.d/2);ombrePortee(g,()=>poly(g,[[x0,y0],[x1,y0],[x1+dx,y0+dy],[x1+dx,y1+dy],[x0+dx,y1+dy+3],[x0,y1+3]]));}
    }
  }
  function murs(g){
    const R=alea(23),yb=py(Y0),yt=py(Y0,HM),X0=px(-1.05),X1=px(RW+1.05);
    g.fillStyle='#05060a';g.fillRect(0,0,SW,yt);
    blocs(g,R,X0,yt,X1-X0,yb-yt,128,23.5,52,94);
    g.fillStyle=lin(g,0,yt,0,yb,['rgba(4,5,10,.5)','rgba(4,5,10,.12)']);g.fillRect(X0,yt,X1-X0,yb-yt);
    for(let i=0;i<34;i++){const x=X0+R()*(X1-X0),w=20+R()*50;g.fillStyle=rad(g,x,yb,0,w,['rgba(60,90,50,.22)','rgba(60,90,50,0)']);g.fillRect(x-w,yb-w*0.7,w*2,w*0.7);}
    g.fillStyle=lin(g,0,yb-13,0,yb,['#3a3f4c','#1c1f27']);g.fillRect(X0,yb-13,X1-X0,13);g.fillStyle='rgba(255,255,255,.14)';g.fillRect(X0,yb-13,X1-X0,1.4);
    const cy=py(Y0,3.35);plaque(g,[[X0,cy-3.5],[X1,cy-3.5],[X1,cy+3.5],[X0,cy+3.5]],BRONZE);for(let x=X0+20;x<X1;x+=58)ell(g,x,cy,1.7,1.7,'#f4d27c');
    plaque(g,[[X0,yt-9],[X1,yt-9],[X1,yt+6],[X0,yt+6]],BRONZE);g.fillStyle='#f4d27c';g.fillRect(X0,yt+4.5,X1-X0,1.4);
    g.fillStyle='#2a2e3a';g.fillRect(X0,yt-21,X1-X0,12);g.fillStyle='rgba(255,255,255,.06)';g.fillRect(X0,yt-21,X1-X0,1.5);
    /* la grande arche : la ville la nuit, floue, et deux rideaux */
    { const x0=px(10.5),x1=px(15.5),ybas=py(Y0,0.9),ytA=py(Y0,4.25),ra=(x1-x0)/2,cx0=(x0+x1)/2;
      const forme=()=>{g.beginPath();g.moveTo(x0,ybas);g.lineTo(x0,ytA+ra);g.arc(cx0,ytA+ra,ra,Math.PI,0);g.lineTo(x1,ybas);g.closePath();};
      g.save();forme();g.clip();
      g.fillStyle=lin(g,0,ytA,0,ybas,['#070b22','#16224e','#3b3562','#5a3f58']);g.fillRect(x0,ytA,x1-x0,ybas-ytA);
      ell(g,cx0+46,ytA+50,17,17,'rgba(230,236,255,.85)');ell(g,cx0+40,ytA+46,16,16,'#16224e');
      g.fillStyle='#0a0d1e';for(let x=x0;x<x1;x+=14+R()*16){const hh=18+R()*46,w=12+R()*14;g.fillRect(x,ybas-hh,w,hh);if(R()<0.4)poly(g,[[x,ybas-hh],[x+w/2,ybas-hh-10-R()*10],[x+w,ybas-hh]]),g.fill();}
      g.shadowBlur=7*SB;for(let i=0;i<60;i++){const c=R()<0.7?'255,196,110':'255,120,70';g.shadowColor=`rgba(${c},1)`;g.fillStyle=`rgba(${c},${0.5+R()*0.5})`;g.fillRect(x0+R()*(x1-x0),ybas-6-R()*56,2.4,2.4);}g.shadowBlur=0;
      for(const s of [0,1]){const a=s?x1-ra*0.5:x0,w=ra*0.5;g.fillStyle=lin(g,a,0,a+w,0,['#3a0a0e','#7c1a1c','#4a0e12','#8a2020','#42090d','#6c1618']);
        g.beginPath();if(s){g.moveTo(x1,ytA);g.lineTo(x1,ybas);g.lineTo(x1-w*0.5,ybas);g.quadraticCurveTo(x1-w*1.1,(ytA+ybas)/2,x1-w*1.5,ytA);}else{g.moveTo(x0,ytA);g.lineTo(x0,ybas);g.lineTo(x0+w*0.5,ybas);g.quadraticCurveTo(x0+w*1.1,(ytA+ybas)/2,x0+w*1.5,ytA);}g.closePath();g.fill();}
      g.restore();
      forme();g.lineWidth=11;g.strokeStyle=lin(g,x0,ytA,x1,ybas,['#c9a56a','#6a5236','#2a1f14']);g.stroke();g.lineWidth=1.6;g.strokeStyle='#f4d27c';g.stroke(); }
    /* les deux portes de bronze (leurs battants sont dessinés à chaque image) */
    for(const dx of [8,18]){const x0=px(dx-1.3),x1=px(dx+1.3),ytD=py(Y0,3.0),c=(x0+x1)/2;
      const forme=(m)=>{g.beginPath();g.moveTo(x0-m,yb);g.lineTo(x0-m,ytD+26);g.quadraticCurveTo(c,ytD-22-m,x1+m,ytD+26);g.lineTo(x1+m,yb);g.closePath();};
      forme(9);g.fillStyle=lin(g,x0,ytD,x1,yb,['#c9a56a','#6a5236','#2a1f14']);g.fill();g.strokeStyle='#0a0806';g.lineWidth=1.5;g.stroke();
      forme(0);g.fillStyle='#050305';g.fill();g.fillStyle=rad(g,c,yb,0,70,['rgba(255,70,30,.35)','rgba(255,70,30,0)']);g.fill();
      for(let k=0;k<6;k++){ell(g,x0-4.5,yb-12-k*22,2,2,'#f4d27c');ell(g,x1+4.5,yb-12-k*22,2,2,'#f4d27c');}}
    /* les bannières au bec */
    for(const bx of [5.2,20.8]){const X=px(bx),y1=py(Y0,4.2),y2=py(Y0,1.75);
      poly(g,[[X-27,y1],[X+27,y1],[X+27,y2],[X,y2+17],[X-27,y2]]);g.fillStyle=lin(g,X-27,0,X+27,0,['#4c0f12','#8a2020','#64161a','#8a2020','#4c0f12']);g.fill();g.strokeStyle='#d4aa52';g.lineWidth=2;g.stroke();
      g.fillStyle='rgba(0,0,0,.18)';for(let y=y1+14;y<y2;y+=20)g.fillRect(X-27,y,54,5);
      ell(g,X,y1+44,15,15,'#d4aa52');ell(g,X,y1+44,11.5,11.5,'#5a1317');poly(g,[[X-7,y1+37],[X+10,y1+44],[X-7,y1+52],[X-3,y1+44]]);g.fillStyle='#f4d27c';g.fill();
      plaque(g,[[X-32,y1-5],[X+32,y1-5],[X+32,y1+2],[X-32,y1+2]],BRONZE);}
    /* les torchères du mur */
    for(const t of TORCHES){const X=px(t.x),Y=py(Y0,t.z);g.fillStyle='#16110b';g.fillRect(X-2.5,Y+2,5,22);plaque(g,[[X-10,Y],[X+10,Y],[X+6,Y+9],[X-6,Y+9]],BRONZE);}
    /* l'estrade de Grosbec et ses marches */
    { const x0=px(10.6),x1=px(15.4),yT0=py(Y0,0.9),yT1=py(3.2,0.9),yF=py(3.2,0);
      blocs(g,R,x0,yT0,x1-x0,yT1-yT0,168,15,40,70);
      g.fillStyle=lin(g,px(11.5),0,px(14.5),0,['#5a1317','#84201f','#6c191b','#84201f','#5a1317']);g.fillRect(px(11.5),yT0,3*T,yT1-yT0);g.fillStyle='#d4aa52';g.fillRect(px(11.5)+3,yT0,4,yT1-yT0);g.fillRect(px(14.5)-7,yT0,4,yT1-yT0);
      blocs(g,R,x0,yT1,x1-x0,yF-yT1,104,14,34,60);g.fillStyle=lin(g,0,yT1,0,yF,['rgba(0,0,0,0)','rgba(0,0,0,.4)']);g.fillRect(x0,yT1,x1-x0,yF-yT1);
      plaque(g,[[x0-3,yT1-3],[x1+3,yT1-3],[x1+3,yT1+5],[x0-3,yT1+5]],BRONZE);for(let x=x0+10;x<x1;x+=26)ell(g,x,yT1+1,1.6,1.6,'#f4d27c');
      for(const [ya,ybm,z] of [[3.2,3.55,0.6],[3.55,3.9,0.3]]){const a=px(11.35),b=px(14.65),t0=py(ya,z),t1=py(ybm,z),f1=py(ybm,z-0.3);
        g.fillStyle='#8088a0';g.fillRect(a,t0,b-a,t1-t0);g.fillStyle=lin(g,0,t1,0,f1,['#4d5364','#2a2e3a']);g.fillRect(a,t1,b-a,f1-t1);
        g.fillStyle='#7c1d1e';g.fillRect(px(11.5),t0,3*T,t1-t0);g.fillStyle='#55131a';g.fillRect(px(11.5),t1,3*T,f1-t1);g.fillStyle='#d4aa52';g.fillRect(px(11.5)+3,t0,4,f1-t0);g.fillRect(px(14.5)-7,t0,4,f1-t0);
        g.fillStyle='rgba(255,255,255,.16)';g.fillRect(a,t0,b-a,1.3);g.fillStyle='rgba(0,0,0,.4)';g.fillRect(a,f1-1.5,b-a,1.5);} }
    /* les murs des côtés (on ne voit que leur dessus) et le garde-corps du bas */
    for(const s of [0,1]){const xa=px(s?RW:-1.05),xb=px(s?RW+1.05:0),ya=py(Y0,1.7),ybm=py(RD,1.7);
      blocs(g,R,xa,ya,xb-xa,ybm-ya,138,30,30,48);g.fillStyle=lin(g,0,ybm,0,py(RD,0),['#343846','#12141a']);g.fillRect(xa,ybm,xb-xa,py(RD,0)-ybm);
      g.fillStyle='#8a6a3a';g.fillRect(s?xa:xb-3,ya,3,ybm-ya);g.fillStyle='rgba(0,0,0,.5)';g.fillRect(s?xa-5:xb,ya,5,py(RD)-ya);}
    for(const l of LAMPES){const X=px(l.x),Y=py(l.y,l.z);plaque(g,[[X-9,Y],[X+9,Y],[X+5,Y+8],[X-5,Y+8]],BRONZE);g.fillStyle='#16110b';g.fillRect(X-2,Y+8,4,22);}
    { const ya=py(RD,0.55),ybm=py(RD+0.45,0.55);blocs(g,R,px(-1.05),ya,(RW+2.1)*T,ybm-ya,120,ybm-ya,36,60);g.fillStyle=lin(g,0,ybm,0,SH,['#1a1c24','#030406']);g.fillRect(0,ybm,SW,SH-ybm);g.fillStyle='#8a6a3a';g.fillRect(px(-1.05),ya,(RW+2.1)*T,2.5); }
    g.fillStyle='#030406';g.fillRect(0,0,px(-1.05),SH);g.fillRect(px(RW+1.05),0,SW-px(RW+1.05),SH);
  }
  function lumiere(){
    const c=toile(SW/2,SH/2),g=c.getContext('2d');g.scale(0.5,0.5);
    g.fillStyle='rgb(70,72,100)';g.fillRect(0,0,SW,SH);g.globalCompositeOperation='lighter';
    const halo=(X,Y,rx,ry,col,a)=>{g.save();g.translate(X,Y);g.scale(1,ry/rx);g.fillStyle=rad(g,0,0,0,rx,[[0,`rgba(${col},${a})`],[0.45,`rgba(${col},${a*0.5})`],[1,`rgba(${col},0)`]]);g.fillRect(-rx,-rx,rx*2,rx*2);g.restore();};
    for(const t of TORCHES){halo(px(t.x),py(Y0,t.z),170,170,'255,150,70',0.8);halo(px(t.x),py(Y0+1.8),4.4*T,4.4*T*K,'255,160,84',0.5);}
    for(const l of LAMPES)halo(px(l.x<0?0.6:RW-0.6),py(l.y),5.2*T,5.2*T*K,'255,160,84',0.62);
    halo(px(13),py(3.3),4.4*T,4.4*T*K,'255,64,36',0.5);halo(px(13),py(Y0,2.6),190,170,'120,140,255',0.42);
    halo(px(13),py(10.4),7*T,7*T*K,'70,66,70',0.6);
    for(const o of OBS0)if(o.k==='pilier'){halo(px(o.x),py(o.y+0.5),4.4*T,4.4*T*K,'255,168,92',0.62);halo(px(o.x),py(o.y,o.h*0.6),120,150,'255,160,84',0.4);}
    /* la lune par les hautes fenêtres : deux nappes bleues en travers du sol */
    for(const [pts,a,b] of [[[[0,10.4],[0,13.2],[10.5,16.8],[10.5,14]],px(0),px(10.5)],[[[RW,4.4],[RW,6.9],[16.5,9.9],[16.5,7.4]],px(RW),px(16.5)]]){
      poly(g,pts.map(q=>[px(q[0]),py(q[1])]));g.fillStyle=lin(g,a,0,b,0,['rgba(96,130,226,.5)','rgba(96,130,226,0)']);g.fill();}
    return c;
  }
  function preparer(S0){
    SB=Math.min(S0,2.2);
    if(fond)fond.width=fond.height=0;
    fond=toile(SW*SB,SH*SB);const g=fond.getContext('2d');g.setTransform(SB,0,0,SB,0,0);
    const avant=OBS;OBS=OBS0;
    g.fillStyle='#030406';g.fillRect(0,0,SW,SH);sol(g);murs(g);
    OBS=avant;
    const L=lumiere();lumX=L.getContext('2d');
    g.globalCompositeOperation='multiply';multiplie=g.globalCompositeOperation==='multiply';
    if(multiplie)g.drawImage(L,0,0,SW,SH);else{g.globalCompositeOperation='source-over';g.globalAlpha=0.3;g.fillStyle='#000';g.fillRect(0,0,SW,SH);g.globalAlpha=1;}
    g.globalCompositeOperation='source-over';
    for(const v of sprites.values())v.c.width=v.c.height=0;sprites.clear();
    fondA=fond;SA=SB;adapter(S0);
  }
  /* quand la finesse baisse : des copies plus petites, recopiées telles quelles (rien n'est repeint) */
  function adapter(S1){
    for(const v of copies.values())v.c.width=v.c.height=0;copies.clear();
    if(fondA&&fondA!==fond)fondA.width=fondA.height=0;
    if(Math.abs(S1-SB)<1e-3){fondA=fond;SA=SB;return;}
    SA=S1;fondA=toile(SW*S1,SH*S1);fondA.getContext('2d').drawImage(fond,0,0,fondA.width,fondA.height);
  }
  function spriteA(o){
    const s=sprite0(o);if(fondA===fond)return s;
    const cle=o.k+'/'+o.x+'/'+o.y+'/'+o.w+'/'+o.d;let c=copies.get(cle);
    if(!c){const cc=toile(s.w*SA,s.h*SA);cc.getContext('2d').drawImage(s.c,0,0,cc.width,cc.height);c={c:cc,w:s.w,h:s.h,ox:s.ox,oy:s.oy};copies.set(cle,c);}
    return c;
  }
  /* la lumière qui tombe à un endroit du sol (pour teinter les obstacles comme le sol autour) */
  function lumEn(x,y){
    if(!lumX||!multiplie)return [178,178,178];
    const d=lumX.getImageData(clamp(Math.round(px(x)/2),0,SW/2-1),clamp(Math.round(py(y)/2),0,SH/2-1),1,1).data;
    return [Math.min(255,d[0]*0.62+108),Math.min(255,d[1]*0.62+104),Math.min(255,d[2]*0.62+100)];
  }
  /* ---- les obstacles ---- */
  function boite(g,R,o,ton,rh,dessus){
    const a=-o.w/2*T,b=o.w/2*T,yf=o.d/2*T*K,yb=-o.d/2*T*K,H=o.h*ZH;
    blocs(g,R,a,yf-H,b-a,H,ton,rh,22,44);g.fillStyle=lin(g,0,yf-H,0,yf,['rgba(0,0,0,0)','rgba(0,0,0,.38)']);g.fillRect(a,yf-H,b-a,H);
    blocs(g,R,a,yb-H,b-a,yf-yb,dessus||ton+46,Math.max(10,(yf-yb)/2),24,46);
    g.fillStyle='rgba(255,255,255,.2)';g.fillRect(a,yf-H-0.8,b-a,1.6);g.strokeStyle='#0c0d12';g.lineWidth=1.4;g.strokeRect(a,yb-H,b-a,yf-yb+H);
    return {a,b,yf,yb,H};
  }
  const PEINTRES={
    pilier(g,o){
      const rx=o.r*T,ry=rx*K,H=o.h*ZH,R=alea(Math.round(o.x*31+o.y*7));
      ell(g,0,0,rx+8,ry+6,'#1c1e27');g.fillStyle=lin(g,-rx-8,0,rx+8,0,['#3c4250','#6d7486','#3a3f4c','#1a1c24']);g.fillRect(-rx-8,-13,2*rx+16,13);ell(g,0,-13,rx+8,ry+6,'#596072');
      g.fillStyle=lin(g,-rx,0,rx,0,[[0,'#39404e'],[0.2,'#a4acbe'],[0.48,'#727a8c'],[0.84,'#2a2e39'],[1,'#3d4762']]);g.fillRect(-rx,-H+12,2*rx,H-24);
      for(let i=-3;i<=3;i++){const x=i*rx/3.7;g.fillStyle='rgba(0,0,0,.2)';g.fillRect(x-1.6,-H+18,3.2,H-38);g.fillStyle='rgba(255,255,255,.08)';g.fillRect(x+1.6,-H+18,1.2,H-38);}
      for(let y=-52;y>-H+30;y-=47){g.fillStyle='rgba(0,0,0,.3)';g.fillRect(-rx,y,2*rx,1.8);g.fillStyle='rgba(255,255,255,.1)';g.fillRect(-rx,y+1.8,2*rx,1);}
      for(let i=0;i<5;i++){let a=(R()-0.5)*rx*1.6,b=-30-R()*(H-70);g.beginPath();g.moveTo(a,b);for(let k=0;k<3;k++){a+=(R()-0.5)*14;b+=6+R()*12;g.lineTo(a,b);}g.strokeStyle='rgba(12,14,20,.55)';g.lineWidth=1.1;g.stroke();}
      g.fillStyle=rad(g,-rx*0.2,-18,0,rx*1.3,['rgba(70,100,58,.3)','rgba(70,100,58,0)']);g.fillRect(-rx,-60,2*rx,48);
      for(const y of [-24,-H+30]){plaque(g,[[-rx-2.5,y-5],[rx+2.5,y-5],[rx+2.5,y+5],[-rx-2.5,y+5]],BRONZE);for(const k of [-0.62,0,0.62])ell(g,rx*k,y,1.7,1.7,'#f4d27c');}
      poly(g,[[-rx,-H+13],[-rx-9,-H+3],[rx+9,-H+3],[rx,-H+13]]);g.fillStyle=lin(g,-rx-9,0,rx+9,0,['#444b5a','#98a0b2','#5a6172','#22252e']);g.fill();
      ell(g,0,-H+3,rx+9,ry+6,'#7f8799');ell(g,0,-H+2,rx+4,ry+3,'#8b93a6');
      g.strokeStyle='rgba(8,9,12,.8)';g.lineWidth=1.2;g.beginPath();g.ellipse(0,-H+3,rx+9,ry+6,0,0,TAU);g.stroke();
      /* la vasque */
      ell(g,0,-H-2,rx*0.72,ry*0.7,'#0a0806');poly(g,[[-rx*0.75,-H-14],[rx*0.75,-H-14],[rx*0.5,-H-1],[-rx*0.5,-H-1]]);g.fillStyle=lin(g,-rx,0,rx,0,['#6a5236','#d8b46a','#8a6a3a','#2a1f14']);g.fill();g.strokeStyle='#0a0806';g.lineWidth=1.3;g.stroke();
      ell(g,0,-H-14,rx*0.75,ry*0.62,'#3a2a14');ell(g,0,-H-14,rx*0.6,ry*0.48,rad(g,0,-H-14,2,rx*0.6,['#fff0b0','#ff9a30','#7a2a0a']));
      g.strokeStyle='#f4d27c';g.lineWidth=1.2;g.beginPath();g.ellipse(0,-H-14,rx*0.75,ry*0.62,0,0,TAU);g.stroke();
    },
    pan(g,o){   /* un grand pan de mur en ruine : on ne saute pas par-dessus */
      const R=alea(Math.round(o.x*17+o.y*5)),a=-o.w/2*T,b=o.w/2*T,yf=o.d/2*T*K,ep=o.d*T*K,H=o.h*ZH,rh=21,n=6,cw=(b-a)/n;
      const hs=[];for(let i=0;i<n;i++)hs.push(H-rh*Math.floor(R()*2.6));hs[0]=H-rh*2;hs[n-1]=H-rh*3;
      const profil=[[a,yf]];for(let i=0;i<n;i++){profil.push([a+i*cw,yf-hs[i]],[a+(i+1)*cw,yf-hs[i]]);}profil.push([b,yf]);
      g.save();poly(g,profil);g.clip();blocs(g,R,a,yf-H,b-a,H,124,rh,26,50);
      g.fillStyle=lin(g,0,yf-H,0,yf,['rgba(0,0,0,0)','rgba(0,0,0,.42)']);g.fillRect(a,yf-H,b-a,H);
      for(let i=0;i<5;i++){const x=a+R()*(b-a),w=14+R()*26;g.fillStyle=rad(g,x,yf,0,w,['rgba(66,96,54,.34)','rgba(66,96,54,0)']);g.fillRect(x-w,yf-w,w*2,w);}
      g.restore();
      for(let i=0;i<n;i++){const x=a+i*cw,y=yf-hs[i];g.fillStyle=lin(g,0,y-ep,0,y,['#a2aabd','#7c8496']);g.fillRect(x,y-ep,cw,ep);g.fillStyle='rgba(255,255,255,.16)';g.fillRect(x,y-ep,cw,1.5);
        for(let k=0;k<3;k++){g.fillStyle='rgba(0,0,0,.14)';g.fillRect(x+3+R()*(cw-8),y-ep+3+R()*(ep-7),2+R()*5,1.5);}
        g.strokeStyle='#0c0d12';g.lineWidth=1.3;g.strokeRect(x,y-ep,cw,ep);
        if(i<n-1&&hs[i+1]<hs[i]){g.fillStyle='#4a5060';g.fillRect(x+cw-0.5,y-ep,1.5,hs[i]-hs[i+1]);}}
      g.strokeStyle='#0c0d12';g.lineWidth=1.4;poly(g,profil);g.stroke();
      plaque(g,[[a+10,yf-H*0.42],[a+34,yf-H*0.42],[a+34,yf-H*0.42+12],[a+10,yf-H*0.42+12]],BRONZE,{riv:[[a+14,yf-H*0.42+6],[a+30,yf-H*0.42+6]]});
    },
    muret(g,o){const R=alea(Math.round(o.x*13+o.y*3));const B=boite(g,R,o,118,15);g.fillStyle=rad(g,B.a+12,B.yf,0,26,['rgba(66,96,54,.3)','rgba(66,96,54,0)']);g.fillRect(B.a,B.yf-22,40,22);},
    dalle(g,o){
      const R=alea(5),B=boite(g,R,o,132,o.h*ZH+2,176),c=(B.a+B.b)/2,m=B.yf-B.H/2;
      if(o.w>o.d){plaque(g,[[B.a+5,B.yf-B.H+5],[B.b-5,B.yf-B.H+5],[B.b-5,B.yf-B.H+11],[B.a+5,B.yf-B.H+11]],BRONZE);
        g.strokeStyle='#ffe08a';g.lineWidth=2.4;g.shadowColor='#ffcf6e';g.shadowBlur=5;g.beginPath();g.moveTo(c,m+14);g.lineTo(c,m-12);g.moveTo(c-8,m-3);g.lineTo(c,m-12);g.lineTo(c+8,m-3);g.moveTo(c-7,m+6);g.lineTo(c+7,m+6);g.stroke();g.shadowBlur=0;
        g.strokeStyle='#0c0d12';g.lineWidth=1.6;g.beginPath();g.moveTo(c+14,B.yf-B.H);g.lineTo(c+9,m-6);g.lineTo(c+17,m+8);g.lineTo(c+12,B.yf);g.stroke();}
    },
    statue(g,o){   /* une statue de Grosbec, tombée de son socle */
      const R=alea(41);const p={x:o.x,y:o.y,w:o.w,d:o.d,h:0.42};const B=boite(g,R,p,112,10);const y=B.yb-B.H+ (B.yf-B.yb)/2;
      g.save();g.translate(0,y-9);
      plaque(g,[[-52,-12],[18,-15],[30,-2],[20,11],[-52,9]],BRONZE,{riv:[[-40,-2],[-18,-3],[4,-3]]});
      plaque(g,[[-66,-7],[-50,-10],[-50,8],[-66,5]],FER);plaque(g,[[-8,9],[26,12],[30,20],[-4,18]],BRONZE);
      ell(g,42,-4,15,13,'#0a0806');ell(g,42,-4,13.5,11.5,lin(g,30,-14,54,8,['#d8b46a','#7a5c36','#2a1f14']));
      poly(g,[[50,-11],[78,-2],[50,5],[56,-3]]);g.fillStyle=lin(g,50,-11,70,5,['#ffe6a0','#d4aa52','#7a5a20']);g.fill();g.strokeStyle='#0a0806';g.lineWidth=1.3;g.stroke();
      poly(g,[[34,-15],[38,-27],[43,-16],[47,-25],[50,-13]]);g.fillStyle='#b3925c';g.fill();g.stroke();ell(g,44,-6,2.6,2,'#0a0806');
      g.strokeStyle='rgba(8,8,10,.7)';g.lineWidth=1.3;g.beginPath();g.moveTo(-20,-13);g.lineTo(-14,-2);g.lineTo(-22,9);g.stroke();
      g.restore();roc(g,B.a+16,B.yf-4,10,7,77,ROC,7);roc(g,B.b-12,B.yf-2,8,6,78,ROC,7);
    },
    gravats(g,o){
      const R=alea(Math.round(o.x*97+o.y*13)),rx=o.r*T;
      for(let i=0;i<11;i++){const a=R()*TAU,d=Math.sqrt(R())*rx*0.8,s=9+R()*11;roc(g,Math.cos(a)*d,Math.sin(a)*d*K-(1-d/rx)*o.h*ZH*0.75,s,s*0.72,Math.floor(R()*999),ROC,6+Math.floor(R()*4));}
      plaque(g,[[-12,-o.h*ZH-2],[10,-o.h*ZH-6],[13,-o.h*ZH+3],[-9,-o.h*ZH+6]],BRONZE,{riv:[[-5,-o.h*ZH],[6,-o.h*ZH-1]]});
    },
    caisse(g,o){
      const a=-o.w/2*T,b=o.w/2*T,yf=o.d/2*T*K,yb=-o.d/2*T*K,H=o.h*ZH,bois=(X,Y,W,Hh,v)=>{g.fillStyle=lin(g,X,Y,X+(v?W:0),Y+(v?0:Hh),[BOIS[0],BOIS[1],BOIS[1],BOIS[2]]);g.fillRect(X,Y,W,Hh);g.strokeStyle='#1a0f06';g.lineWidth=1;g.strokeRect(X,Y,W,Hh);g.fillStyle='rgba(255,230,180,.14)';g.fillRect(X+1,Y+1,W-2,1.2);};
      for(let i=0;i<4;i++)bois(a,yf-H+i*H/4,b-a,H/4,0);g.fillStyle=lin(g,0,yf-H,0,yf,['rgba(0,0,0,0)','rgba(0,0,0,.35)']);g.fillRect(a,yf-H,b-a,H);
      g.strokeStyle='#2a1808';g.lineWidth=7;g.beginPath();g.moveTo(a+5,yf-H+5);g.lineTo(b-5,yf-5);g.stroke();g.strokeStyle='#8a6030';g.lineWidth=4.5;g.stroke();
      for(let i=0;i<4;i++){const w=(b-a)/4;g.fillStyle=lin(g,0,yb-H,0,yf-H,['#c08e52','#946a38']);g.fillRect(a+i*w,yb-H,w,yf-yb);g.strokeStyle='#1a0f06';g.lineWidth=1;g.strokeRect(a+i*w,yb-H,w,yf-yb);}
      for(const [x,y] of [[a,yf-H],[b-9,yf-H],[a,yf-9],[b-9,yf-9]])plaque(g,[[x,y],[x+9,y],[x+9,y+9],[x,y+9]],FER,{riv:[[x+4.5,y+4.5]]});
      g.strokeStyle='#0c0806';g.lineWidth=1.4;g.strokeRect(a,yb-H,b-a,yf-yb+H);
    },
    chariot(g,o){
      const a=-o.w/2*T,b=o.w/2*T,yf=o.d/2*T*K,yb=-o.d/2*T*K,H=o.h*ZH,R=alea(9);
      for(const x of [a+16,b-16]){ell(g,x,yf-9,13,13,'#0c0806');ell(g,x,yf-9,10.5,10.5,'#5a3a1c');ell(g,x,yf-9,3.4,3.4,'#b3925c');g.strokeStyle='#2a1808';g.lineWidth=2;for(let i=0;i<4;i++){const an=i*Math.PI/4;g.beginPath();g.moveTo(x-Math.cos(an)*10,yf-9-Math.sin(an)*10);g.lineTo(x+Math.cos(an)*10,yf-9+Math.sin(an)*10);g.stroke();}}
      for(let i=0;i<3;i++){g.fillStyle=lin(g,0,yf-H+i*(H-16)/3,0,yf-H+(i+1)*(H-16)/3,[BOIS[0],BOIS[1],BOIS[2]]);g.fillRect(a,yf-H+i*(H-16)/3,b-a,(H-16)/3);g.strokeStyle='#1a0f06';g.lineWidth=1;g.strokeRect(a,yf-H+i*(H-16)/3,b-a,(H-16)/3);}
      for(const x of [a+2,(a+b)/2-3,b-8])plaque(g,[[x,yf-H-2],[x+6,yf-H-2],[x+6,yf-14],[x,yf-14]],FER);
      g.fillStyle='#3a2410';g.fillRect(a,yb-H,b-a,yf-yb);g.strokeStyle='#0c0806';g.lineWidth=1.4;g.strokeRect(a,yb-H,b-a,yf-yb+H-16);
      for(let i=0;i<9;i++){const x=a+12+R()*(b-a-24),y=yb-H+4+R()*(yf-yb-6);roc(g,x,y-4,8+R()*6,6+R()*4,Math.floor(R()*999),ROC,6);if(R()<0.5){g.shadowColor='#ff5a10';g.shadowBlur=6;ell(g,x+3,y-5,1.8,1.4,'#ffb060');g.shadowBlur=0;}}
    }
  };
  function sprite0(o){
    const cle=o.k+'/'+o.x+'/'+o.y+'/'+o.w+'/'+o.d;let s=sprites.get(cle);if(s)return s;
    const lw=(o.c?o.r*2:o.w)*T+40,pr=(o.c?o.r*2:o.d)*T*K,H=o.h*ZH,w=lw+(o.k==='statue'?44:0),hh=pr+H+44,ox=lw/2,oy=pr/2+H+26;
    const brut=sprite(w,hh,ox,oy,SB,g=>PEINTRES[o.k](g,o));
    if(multiplie){   /* la même lumière que le sol à cet endroit */
      const c=toile(brut.c.width,brut.c.height),x=c.getContext('2d'),L=lumEn(o.x,o.y+(o.c?o.r:o.d/2));
      x.drawImage(brut.c,0,0);x.globalCompositeOperation='multiply';x.fillStyle=`rgb(${L[0]|0},${L[1]|0},${L[2]|0})`;x.fillRect(0,0,c.width,c.height);
      x.globalCompositeOperation='destination-in';x.drawImage(brut.c,0,0);brut.c.width=brut.c.height=0;brut.c=c;
    }
    sprites.set(cle,brut);return brut;
  }
  function dessinerObstacle(c,o,a){
    if(o.fond)return;const s=spriteA(o);
    if(a<1)c.globalAlpha=a;c.drawImage(s.c,px(o.x)-s.ox,py(o.y)-s.oy,s.w,s.h);if(a<1)c.globalAlpha=1;
  }
  return {preparer,adapter,dessinerObstacle,sprite0,TORCHES,LAMPES,HM,get fond(){return fondA;},get SB(){return SA;}};
})();
