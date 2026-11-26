/* ======================= l'arrière-salle : rendue en volume, une fois pour toutes =======================
   (version 9, 26 novembre.) La salle n'est plus dessinée par le jeu : elle a été construite en trois dimensions (decor3d/, Blender),
   avec de vraies lumières et de vraies ombres, puis « photographiée » exactement sous l'angle du jeu. window.DECOR (src/decor.js)
   apporte : le fond (sans les obstacles, mais avec leurs ombres), chaque obstacle détouré (il passe devant ou derrière les
   personnages, il devient transparent quand le Pisteur se cache derrière), et pour chaque porte deux images : l'œil allumé (les
   renforts arrivent), la porte ouverte. Grosbec n'est plus là : le Pisteur est passé par-derrière.
   Seule la dalle plantée par le porte-dalle est encore peinte par le jeu (elle apparaît en plein combat). */
const Salle=(()=>{
  const {lin,rad,alea,toile,sprite}=Ou,{plaque,BRONZE}=Golems.O_;
  const D=window.DECOR,HM=4.6;
  const TORCHES=D.torches,LAMPES=D.lampes;
  let fond=null,fondA=null,fondO=null,SO=1,SA=1,SB=1,pret=false,sprites=new Map(),copies=new Map(),portes=[];
  const rr=(g,x,y,w,h,r)=>{g.beginPath();if(g.roundRect)g.roundRect(x,y,w,h,r);else g.rect(x,y,w,h);};
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
  function blocs(g,R,X,Y,W,H,ton,rh,lmin,lmax){
    g.fillStyle='#14161d';g.fillRect(X,Y,W,H);
    for(let r=0,y=Y+H;y>Y+0.5;r++){const y1=Math.max(Y,y-rh);let x=X-(r%2)*lmin*0.5-R()*8;
      while(x<X+W){const w=lmin+R()*(lmax-lmin),a=Math.max(X,x),b=Math.min(X+W,x+w);if(b-a>5)pierre(g,R,a+0.6,y1+0.6,b-a-1.2,y-y1-1.2,ton,R()<0.12);x+=w;}
      y=y1;}
  }
  const charger=src=>new Promise((ok,ko)=>{const im=new Image();im.onload=()=>ok(im);im.onerror=()=>ko(new Error('image'));im.src=src;});
  /* une image de porte, fondue sur ses bords (elle se pose par-dessus le fond sans qu'on voie la couture) */
  function fondue(im,p){
    const c=toile(Math.round(p.w*SB),Math.round(p.h*SB)),g=c.getContext('2d'),w=c.width,h=c.height,m=Math.round(22*SB);
    g.imageSmoothingQuality='high';g.drawImage(im,0,0,w,h);g.globalCompositeOperation='destination-in';
    let gr=g.createLinearGradient(0,0,w,0);gr.addColorStop(0,'rgba(0,0,0,0)');gr.addColorStop(m/w,'#000');gr.addColorStop(1-m/w,'#000');gr.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=gr;g.fillRect(0,0,w,h);
    gr=g.createLinearGradient(0,0,0,h);gr.addColorStop(0,'#000');gr.addColorStop(1-m*1.6/h,'#000');gr.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=gr;g.fillRect(0,0,w,h);
    return c;
  }
  /* S0 : la finesse de l'écran. Les images sont décodées, mises à la taille de l'écran une fois, puis recopiées telles quelles. */
  function preparer(S0,fini){
    SB=Math.min(S0,2.2);
    const srcs=[D.fond,D.atlas,D.masque];for(const p of D.portes)srcs.push(p.B,p.C);
    Promise.all(srcs.map(charger)).then(ims=>{
      fond=toile(SW*SB,SH*SB);const g=fond.getContext('2d');g.imageSmoothingQuality='high';g.drawImage(ims[0],0,0,fond.width,fond.height);
      for(const s of D.obs){
        const c=toile(Math.max(1,Math.round(s.w*SB)),Math.max(1,Math.round(s.h*SB))),x=c.getContext('2d');x.imageSmoothingQuality='high';
        x.drawImage(ims[1],s.ax,s.ay,s.aw,s.ah,0,0,c.width,c.height);x.globalCompositeOperation='destination-in';x.drawImage(ims[2],s.ax,s.ay,s.aw,s.ah,0,0,c.width,c.height);
        sprites.set('i'+s.i,{c,w:s.w,h:s.h,ox:px(s.x)-s.px,oy:py(s.y)-s.py});
      }
      portes=D.portes.map((p,i)=>({x:p.x,y:p.y,w:p.w,h:p.h,B:fondue(ims[3+i*2],p),C:fondue(ims[4+i*2],p),BO:null,CO:null}));
      for(const im of ims)im.src='';
      fondA=fond;SA=SB;adapter(S0);pret=true;if(fini)fini();
    }).catch(()=>{   /* si une image ne se décode pas : un sol sombre, pour qu'on puisse jouer quand même */
      fond=toile(SW*SB,SH*SB);const g=fond.getContext('2d');g.fillStyle='#2b2a33';g.fillRect(0,0,fond.width,fond.height);
      fondA=fond;SA=SB;adapter(S0);pret=true;if(fini)fini();
    });
  }
  /* quand la finesse baisse : des copies plus petites, recopiées telles quelles (rien n'est repeint) */
  function adapter(S1){
    for(const v of copies.values()){v.c.width=v.c.height=0;if(v.o)v.o.width=v.o.height=0;}copies.clear();
    if(fondA&&fondA!==fond)fondA.width=fondA.height=0;
    if(Math.abs(S1-SB)<1e-3){fondA=fond;SA=SB;}
    else{SA=S1;fondA=toile(SW*S1,SH*S1);fondA.getContext('2d').drawImage(fond,0,0,fondA.width,fondA.height);}
    cuireOmbre();
  }
  /* le monde de l'ombre : une deuxième image de la salle, sombre et bleu-violet, cuite d'avance, à la même taille que l'autre
     (elle se recopie telle quelle : elle ne coûte rien en vitesse) */
  function teinter(g,w,h){
    g.globalCompositeOperation='multiply';
    if(g.globalCompositeOperation==='multiply'){g.fillStyle='#5a56b4';g.fillRect(0,0,w,h);g.globalCompositeOperation='source-over';g.fillStyle='rgba(30,16,84,.34)';g.fillRect(0,0,w,h);}
    else{g.globalCompositeOperation='source-over';g.fillStyle='rgba(26,16,78,.62)';g.fillRect(0,0,w,h);}
  }
  function cuireOmbre(){
    if(fondO)fondO.width=fondO.height=0;
    SO=SA;fondO=toile(fondA.width,fondA.height);const g=fondO.getContext('2d');
    g.drawImage(fondA,0,0);teinter(g,fondO.width,fondO.height);
  }
  function spriteOmbre(s){
    if(s.o)return s.o;
    const o=toile(s.c.width,s.c.height),x=o.getContext('2d');x.drawImage(s.c,0,0);x.globalCompositeOperation='source-atop';x.fillStyle='rgba(38,26,108,.56)';x.fillRect(0,0,o.width,o.height);
    return s.o=o;
  }
  function sprite0(o){
    if(o.i!=null&&sprites.has('i'+o.i))return sprites.get('i'+o.i);
    /* un obstacle né pendant le combat (la dalle plantée) : peint par le jeu */
    const cle=o.k+'/'+o.x+'/'+o.y+'/'+o.w+'/'+o.d;let s=sprites.get(cle);if(s)return s;
    const P_=PEINTRES[o.k]||PEINTRES.dalle,lw=(o.c?o.r*2:o.w)*T+40,pr=(o.c?o.r*2:o.d)*T*K,H=o.h*ZH,w=lw,hh=pr+H+44,ox=lw/2,oy=pr/2+H+26;
    s=sprite(w,hh,ox,oy,SB,g=>P_(g,o));sprites.set(cle,s);return s;
  }
  function spriteA(o){
    const s=sprite0(o);if(fondA===fond)return s;
    const cle=o.i!=null?'i'+o.i:o.k+'/'+o.x+'/'+o.y+'/'+o.w+'/'+o.d;let c=copies.get(cle);
    if(!c){const cc=toile(Math.max(1,s.w*SA),Math.max(1,s.h*SA));cc.getContext('2d').drawImage(s.c,0,0,cc.width,cc.height);c={c:cc,w:s.w,h:s.h,ox:s.ox,oy:s.oy};copies.set(cle,c);}
    return c;
  }
  /* ---- la dalle plantée ---- */
  function boite(g,R,o,ton,rh,dessus){
    const a=-o.w/2*T,b=o.w/2*T,yf=o.d/2*T*K,yb=-o.d/2*T*K,H=o.h*ZH;
    blocs(g,R,a,yf-H,b-a,H,ton,rh,22,44);g.fillStyle=lin(g,0,yf-H,0,yf,['rgba(0,0,0,0)','rgba(0,0,0,.38)']);g.fillRect(a,yf-H,b-a,H);
    blocs(g,R,a,yb-H,b-a,yf-yb,dessus||ton+46,Math.max(10,(yf-yb)/2),24,46);
    g.fillStyle='rgba(255,255,255,.2)';g.fillRect(a,yf-H-0.8,b-a,1.6);g.strokeStyle='#0c0d12';g.lineWidth=1.4;g.strokeRect(a,yb-H,b-a,yf-yb+H);
    return {a,b,yf,yb,H};
  }
  const PEINTRES={
    dalle(g,o){
      const R=alea(5),B=boite(g,R,o,132,o.h*ZH+2,176),c=(B.a+B.b)/2,m=B.yf-B.H/2;
      if(o.w>o.d){plaque(g,[[B.a+5,B.yf-B.H+5],[B.b-5,B.yf-B.H+5],[B.b-5,B.yf-B.H+11],[B.a+5,B.yf-B.H+11]],BRONZE);
        g.strokeStyle='#ffe08a';g.lineWidth=2.4;g.shadowColor='#ffcf6e';g.shadowBlur=5;g.beginPath();g.moveTo(c,m+14);g.lineTo(c,m-12);g.moveTo(c-8,m-3);g.lineTo(c,m-12);g.lineTo(c+8,m-3);g.moveTo(c-7,m+6);g.lineTo(c+7,m+6);g.stroke();g.shadowBlur=0;
        g.strokeStyle='#0c0d12';g.lineWidth=1.6;g.beginPath();g.moveTo(c+14,B.yf-B.H);g.lineTo(c+9,m-6);g.lineTo(c+17,m+8);g.lineTo(c+12,B.yf);g.stroke();}
    },
  };
  /* om : de 0 (à découvert) à 1 (dans l'ombre) */
  function dessinerObstacle(c,o,a,om){
    if(o.fond)return;const s=spriteA(o),X=px(o.x)-s.ox,Y=py(o.y)-s.oy;
    if(!(om>=1)){if(a<1)c.globalAlpha=a;c.drawImage(s.c,X,Y,s.w,s.h);}
    if(om>0){c.globalAlpha=a*Math.min(1,om);c.drawImage(spriteOmbre(s),X,Y,s.w,s.h);}
    c.globalAlpha=1;
  }
  /* une porte des renforts. allumee : l'œil rouge au-dessus de la porte (de 0 à 1) ; ouverte : les battants ouverts (de 0 à 1) */
  function dessinerPorte(c,i,allumee,ouverte,om){
    const p=portes[i];if(!p)return;
    for(const [n,a] of [['B',allumee],['C',ouverte]]){
      if(!(a>0.01))continue;
      c.globalAlpha=Math.min(1,a);c.drawImage(p[n],p.x,p.y,p.w,p.h);
      if(om>0.01){
        if(!p[n+'O']){const o=toile(p[n].width,p[n].height),g=o.getContext('2d');g.drawImage(p[n],0,0);teinter(g,o.width,o.height);g.globalCompositeOperation='destination-in';g.drawImage(p[n],0,0);p[n+'O']=o;}
        c.globalAlpha=Math.min(1,a)*Math.min(1,om);c.drawImage(p[n+'O'],p.x,p.y,p.w,p.h);
      }
    }
    c.globalAlpha=1;
  }
  return {preparer,adapter,dessinerObstacle,dessinerPorte,sprite0,TORCHES,LAMPES,HM,get pret(){return pret;},get portes(){return D.portes;},get fond(){return fondA;},get SB(){return SA;},get fondO(){return fondO;},get SO(){return SO;}};
})();
