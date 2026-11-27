/* ======================= les effets : des particules, des lueurs, les six sorts =======================
   Tout ce qui brille est une petite image peinte UNE fois (une lueur ronde, une flamme, une fumée, une note), recopiée avec
   le mélange « lighter » (la lumière s'ajoute) : c'est rapide, même sur une vieille tablette. Les sorts, d'après le § 18.14 :
   le Barde : une note glacée, une note de feu plus grosse, chacune suivie des cinq lignes d'une portée ;
   l'Alchimiste : une petite fiole de glace, une fiole de feu avec sa flamme (un cocktail Molotov) ;
   le Sage : un petit trait bleu tracé dans l'air, et une grande rune de feu qui se dessine en 3 s puis part en roue de feu. */
const FX=(()=>{
  const COUL={glace:'#8fe4ff',feu:'#ff7a1e',soin:'#7dff9a',or:'#ffcf5a',rouge:'#ff3a26',givre:'#bfefff',braise:'#ff5a14',energie:'#ffb347',blanc:'#ffffff',sang:'#ff2a2a',vert:'#9dff7a'};
  const cache={};
  function toile(w,h){const c=document.createElement('canvas');c.width=Math.max(1,Math.ceil(w));c.height=Math.max(1,Math.ceil(h));return c;}
  function rgb(h){h=h.replace('#','');return [parseInt(h.slice(0,2),16),parseInt(h.slice(2,4),16),parseInt(h.slice(4,6),16)];}
  /* une lueur ronde : blanche au cœur, la couleur autour, rien au bord */
  function lueur(coul){const k='l'+coul;if(cache[k])return cache[k];const c=toile(64,64),x=c.getContext('2d'),[r,g,b]=rgb(coul);
    const G=x.createRadialGradient(32,32,0,32,32,32);G.addColorStop(0,'rgba(255,255,255,1)');G.addColorStop(0.18,`rgba(${r},${g},${b},.95)`);G.addColorStop(0.45,`rgba(${r},${g},${b},.38)`);G.addColorStop(1,`rgba(${r},${g},${b},0)`);
    x.fillStyle=G;x.fillRect(0,0,64,64);return cache[k]=c;}
  /* une lueur douce, sans cœur blanc (pour les grandes nappes de lumière) */
  function nappe(coul){const k='n'+coul;if(cache[k])return cache[k];const c=toile(64,64),x=c.getContext('2d'),[r,g,b]=rgb(coul);
    const G=x.createRadialGradient(32,32,0,32,32,32);G.addColorStop(0,`rgba(${r},${g},${b},.7)`);G.addColorStop(0.5,`rgba(${r},${g},${b},.28)`);G.addColorStop(1,`rgba(${r},${g},${b},0)`);
    x.fillStyle=G;x.fillRect(0,0,64,64);return cache[k]=c;}
  /* une flamme : une goutte à l'envers, jaune au pied, rouge en haut */
  function flamme(){if(cache.fl)return cache.fl;const c=toile(32,48),x=c.getContext('2d');
    x.beginPath();x.moveTo(16,2);x.bezierCurveTo(22,14,30,24,28,34);x.bezierCurveTo(26,44,6,44,4,34);x.bezierCurveTo(2,24,10,14,16,2);x.closePath();
    const G=x.createLinearGradient(0,44,0,2);G.addColorStop(0,'rgba(255,250,210,1)');G.addColorStop(0.3,'rgba(255,190,60,.95)');G.addColorStop(0.65,'rgba(255,90,20,.7)');G.addColorStop(1,'rgba(180,20,10,0)');
    x.fillStyle=G;x.fill();return cache.fl=c;}
  function fumee(){if(cache.fu)return cache.fu;const c=toile(64,64),x=c.getContext('2d');
    const G=x.createRadialGradient(32,32,0,32,32,32);G.addColorStop(0,'rgba(40,36,44,.55)');G.addColorStop(0.6,'rgba(30,28,36,.25)');G.addColorStop(1,'rgba(20,20,26,0)');x.fillStyle=G;x.fillRect(0,0,64,64);return cache.fu=c;}
  function poussiere(){if(cache.po)return cache.po;const c=toile(64,64),x=c.getContext('2d');
    const G=x.createRadialGradient(32,32,0,32,32,32);G.addColorStop(0,'rgba(170,158,140,.5)');G.addColorStop(0.6,'rgba(140,130,118,.22)');G.addColorStop(1,'rgba(120,110,100,0)');x.fillStyle=G;x.fillRect(0,0,64,64);return cache.po=c;}
  /* une note de musique (♪ ou ♫), sa couleur, un liseré sombre, un cœur clair */
  function note(coul,double){const k='m'+coul+(double?2:1);if(cache[k])return cache[k];const c=toile(48,56),x=c.getContext('2d');
    x.translate(24,30);x.lineJoin='round';x.lineCap='round';
    const dessin=(w)=>{x.beginPath();if(double){x.ellipse(-10,12,7,5,-0.4,0,TAU);x.moveTo(13,6);x.ellipse(8,6,7,5,-0.4,0,TAU);}else{x.ellipse(-2,12,8,6,-0.4,0,TAU);}};
    const tige=()=>{x.beginPath();if(double){x.moveTo(-4,11);x.lineTo(-4,-20);x.lineTo(14,-26);x.lineTo(14,5);x.moveTo(-4,-12);x.lineTo(14,-18);}else{x.moveTo(5,10);x.lineTo(5,-22);x.quadraticCurveTo(16,-14,14,-2);}};
    x.strokeStyle='rgba(10,8,20,.9)';x.lineWidth=7;tige();x.stroke();dessin();x.fillStyle='rgba(10,8,20,.9)';x.fill();x.stroke();
    x.strokeStyle=coul;x.lineWidth=4;tige();x.stroke();dessin();x.fillStyle=coul;x.fill();
    x.strokeStyle='rgba(255,255,255,.85)';x.lineWidth=1.4;tige();x.stroke();
    return cache[k]=c;}
  /* une fiole (glace : bleue ; feu : orange, avec son chiffon) */
  function fiole(feu){const k='f'+(feu?1:0);if(cache[k])return cache[k];const c=toile(28,40),x=c.getContext('2d');
    x.translate(14,24);x.lineJoin='round';
    x.beginPath();x.moveTo(-4,-14);x.lineTo(-4,-7);x.bezierCurveTo(-12,-3,-12,12,0,12);x.bezierCurveTo(12,12,12,-3,4,-7);x.lineTo(4,-14);x.closePath();
    x.fillStyle=feu?'#ff7a1e':'#7fe0ff';x.fill();x.lineWidth=2.2;x.strokeStyle='#14101c';x.stroke();
    x.fillStyle='rgba(255,255,255,.7)';x.beginPath();x.ellipse(-4,2,1.8,5,0.3,0,TAU);x.fill();
    x.fillStyle=feu?'#d8c8a0':'#a36a3a';x.fillRect(-5,-19,10,6);x.strokeRect(-5,-19,10,6);
    if(feu){x.fillStyle='#e8dcc0';x.beginPath();x.moveTo(-3,-19);x.quadraticCurveTo(-1,-24,3,-22);x.lineTo(1,-19);x.fill();}
    return cache[k]=c;}
  /* la rune de feu du Sage : un cercle, des petits signes autour, un signe au milieu (dessinée en blanc : on la teinte en l'ajoutant) */
  function rune(){if(cache.ru)return cache.ru;const c=toile(96,96),x=c.getContext('2d');x.translate(48,48);x.strokeStyle='#fff';x.lineCap='round';
    x.lineWidth=4;x.beginPath();x.arc(0,0,40,0,TAU);x.stroke();x.lineWidth=2;x.beginPath();x.arc(0,0,32,0,TAU);x.stroke();
    for(let i=0;i<8;i++){const a=i/8*TAU;x.save();x.rotate(a);x.beginPath();x.moveTo(0,-36);x.lineTo(3,-31);x.lineTo(-3,-31);x.closePath();x.stroke();x.restore();}
    x.lineWidth=3.5;x.beginPath();x.moveTo(0,-20);x.lineTo(0,20);x.moveTo(-16,-8);x.lineTo(16,8);x.moveTo(-16,8);x.lineTo(16,-8);x.moveTo(-8,-20);x.lineTo(8,-20);x.stroke();
    return cache.ru=c;}

  /* ---------- les particules ---------- */
  const P=[];const MAX=700;
  /* o : {x, y, z (le sol, en pas), vx, vy, vz, g (pesanteur), vie, t, s (taille en points), s1 (taille à la fin), img, add, a, rot, vr, sol (dessinée à plat au sol)} */
  function emet(o){if(P.length>=MAX)P.shift();o.t=0;o.a=o.a==null?1:o.a;o.rot=o.rot||0;P.push(o);return o;}
  function maj(dt){
    for(let i=P.length-1;i>=0;i--){const p=P[i];p.t+=dt;if(p.t>=p.vie){P.splice(i,1);continue;}
      p.x+=(p.vx||0)*dt;p.y+=(p.vy||0)*dt;p.z+=(p.vz||0)*dt;if(p.g)p.vz-=p.g*dt;if(p.fr){const f=Math.exp(-p.fr*dt);p.vx*=f;p.vy*=f;p.vz*=f;}
      if(p.z<0&&p.rebond){p.z=0;p.vz=-p.vz*p.rebond;p.vx*=0.6;p.vy*=0.6;}else if(p.z<0&&p.g)p.z=0;
      p.rot+=(p.vr||0)*dt;}
  }
  function dessiner(c,couche){
    let mode='';
    for(const p of P){
      if((p.couche||'air')!==couche)continue;
      const u=p.t/p.vie,a=p.a*(p.fin==null?(u<0.15&&p.fondu?u/0.15:1-u*u):p.fin(u));if(a<=0.01)continue;
      const m=p.add?'lighter':'source-over';if(m!==mode){c.globalCompositeOperation=m;mode=m;}
      const X=px(p.x),Y=py(p.y,p.z),s=lerp(p.s,p.s1==null?p.s:p.s1,u);
      c.globalAlpha=Math.min(1,a);
      if(p.ligne){const vx=(p.vx||0)*T,vy=(p.vy||0)*T*K-(p.vz||0)*ZH,l=Math.hypot(vx,vy)||1,L=Math.min(p.ligne,l*0.05);c.strokeStyle=p.coul;c.lineWidth=s;c.beginPath();c.moveTo(X,Y);c.lineTo(X-vx/l*L,Y-vy/l*L);c.stroke();}
      else if(p.img){if(p.rot){c.save();c.translate(X,Y);c.rotate(p.rot);c.drawImage(p.img,-s/2,-s/2*(p.img.height/p.img.width),s,s*(p.img.height/p.img.width));c.restore();}
        else c.drawImage(p.img,X-s/2,Y-s/2*(p.img.height/p.img.width)*(p.plat?K:1),s,s*(p.img.height/p.img.width)*(p.plat?K:1));}
      else if(p.anneau){c.strokeStyle=p.coul;c.lineWidth=p.l||2;c.beginPath();c.ellipse(X,Y,Math.max(0.1,s*T),Math.max(0.1,s*T*K),0,0,TAU);c.stroke();}
      else if(p.eclat){c.save();c.translate(X,Y);c.rotate(p.rot);c.fillStyle=p.coul;c.beginPath();c.moveTo(0,-s);c.lineTo(s*0.6,0);c.lineTo(0,s*0.8);c.lineTo(-s*0.5,0);c.closePath();c.fill();c.strokeStyle='rgba(8,8,14,.7)';c.lineWidth=0.8;c.stroke();c.restore();}
    }
    c.globalAlpha=1;c.globalCompositeOperation='source-over';
  }
  /* ---------- des bouquets tout faits ---------- */
  const R=rnd;
  function etincelles(x,y,z,n,coul,v,vie){for(let i=0;i<n;i++){const a=R(0,TAU),e=R(-0.2,1.2),sp=R(0.3,1)*v;emet({x,y,z,vx:Math.cos(a)*sp*Math.cos(e),vy:Math.sin(a)*sp*Math.cos(e),vz:Math.sin(e)*sp*1.4,g:6,fr:1.2,vie:R(0.35,0.8)*(vie||1),s:R(1.2,2.2),coul,ligne:9,add:true});}}
  function lueurs(x,y,z,n,coul,s,vie,v){for(let i=0;i<n;i++){const a=R(0,TAU),sp=R(0,v||0.6);emet({x,y,z,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp,vz:R(0,0.6),vie:R(0.25,0.6)*(vie||1),s:R(0.6,1)*s,s1:s*0.2,img:lueur(coul),add:true});}}
  function flammes(x,y,z,n,s,vie,eparpille){for(let i=0;i<n;i++)emet({x:x+R(-1,1)*(eparpille||0.15),y:y+R(-1,1)*(eparpille||0.15)*0.6,z,vx:R(-0.2,0.2),vy:R(-0.1,0.1),vz:R(0.8,1.8),vie:R(0.35,0.7)*(vie||1),s:R(0.7,1.1)*s,s1:s*0.3,img:flamme(),add:true});}
  function fumees(x,y,z,n,s,vie){for(let i=0;i<n;i++)emet({x:x+R(-0.2,0.2),y,z,vx:R(-0.3,0.3),vy:R(-0.15,0.15),vz:R(0.4,1),fr:0.8,vie:R(0.8,1.6)*(vie||1),s:s*0.6,s1:s*1.6,img:fumee(),a:0.8});}
  function poussieres(x,y,n,s,v){for(let i=0;i<n;i++){const a=R(0,TAU),sp=R(0.4,1)*(v||2);emet({x,y,z:R(0,0.2),vx:Math.cos(a)*sp,vy:Math.sin(a)*sp,vz:R(0.1,0.6),fr:2.2,vie:R(0.7,1.4),s:s*0.6,s1:s*1.5,img:poussiere(),a:0.85});}}
  function eclats(x,y,z,n,coul,v,s){for(let i=0;i<n;i++){const a=R(0,TAU),sp=R(0.4,1)*v;emet({x,y,z,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp,vz:R(1,3),g:9,rebond:0.3,vie:R(0.6,1.1),s:R(0.7,1.2)*(s||3),coul,eclat:true,vr:R(-12,12),fin:u=>u<0.75?1:(1-u)*4});}}
  function anneau(x,y,r0,r1,coul,vie,l){emet({x,y,z:0.02,vie,s:r0,s1:r1,coul,anneau:true,l:l||3,add:true,couche:'sol'});}
  function flocons(x,y,z,n,v){for(let i=0;i<n;i++){const a=R(0,TAU),sp=R(0.2,1)*(v||1);emet({x,y,z,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp,vz:R(-0.2,0.8),fr:1.5,vie:R(0.4,0.9),s:R(1.5,3),coul:'#e8fbff',eclat:true,vr:R(-6,6),add:true});}}
  function notes(x,y,z,n,coul){for(let i=0;i<n;i++)emet({x:x+R(-0.25,0.25),y,z:z+R(-0.1,0.2),vx:R(-0.4,0.4),vy:R(-0.1,0.1),vz:R(0.5,1.1),fr:0.6,vie:R(0.6,1.1),s:R(9,13),s1:6,img:note(coul,Math.random()<0.4),rot:R(-0.3,0.3),vr:R(-1.5,1.5),fondu:true});}

  /* ---------- les sorts en vol (S.tirs) : on suit chaque tir pour son arc, sa traînée, ses étincelles ---------- */
  const vols=new WeakMap();
  function vol(s,role,cibleZ){
    let v=vols.get(s);
    if(!v){const A=REG.armure,tx=s.cible?s.cible.x:A.x,ty=s.cible?s.cible.y:A.y;v={x0:s.x,y0:s.y,D:Math.max(0.5,hyp(tx-s.x,ty-s.y)-(s.cible?0:A.r)),z0:1.05,z1:cibleZ,hist:[],rot:R(0,TAU),role};vols.set(s,v);}
    return v;
  }
  function dessinerTir(c,s,role,dt){
    const A=REG.armure,feu=s.quoi==='feu',zc=s.cible?0.6:2.3,v=vol(s,role,zc);
    const u=clamp(hyp(s.x-v.x0,s.y-v.y0)/v.D,0,1),arc=(role==='alchimiste'?(feu?2.1:1.2):(role==='barde'?0.7:0.35))*Math.sin(u*Math.PI);
    const z=lerp(v.z0,v.z1,u)+arc,X=px(s.x),Y=py(s.y,z);
    v.hist.unshift([X,Y]);if(v.hist.length>14)v.hist.pop();
    v.rot+=dt*(feu?9:14);
    const coul=feu?COUL.feu:COUL.glace,fort=s.fort;
    c.globalCompositeOperation='lighter';
    const g=lueur(coul),gs=(feu?46:30)*(fort?1.35:1);c.globalAlpha=0.85;c.drawImage(g,X-gs/2,Y-gs/2,gs,gs);c.globalAlpha=1;
    if(role==='barde'){
      /* la portée : cinq lignes qui suivent la note, de plus en plus pâles */
      const h=v.hist;if(h.length>2){const n=5,e=feu?4:3;
        for(let k=0;k<n;k++){c.beginPath();for(let i=0;i<h.length;i++){const p=h[i],q=h[Math.min(h.length-1,i+1)],dx=p[0]-q[0],dy=p[1]-q[1],l=hyp(dx,dy)||1,o=(k-2)*e;const X2=p[0]-dy/l*o,Y2=p[1]+dx/l*o;if(i===0)c.moveTo(X2,Y2);else c.lineTo(X2,Y2);}
          c.strokeStyle=feu?'rgba(255,150,60,.55)':'rgba(160,230,255,.55)';c.lineWidth=1.2;c.stroke();}}
      c.globalCompositeOperation='source-over';
      const im=note(feu?'#ffb04a':'#bff0ff',feu),sz=(feu?40:28)*(fort?1.25:1);c.save();c.translate(X,Y);c.rotate(Math.sin(v.rot*0.5)*0.35);c.drawImage(im,-sz/2,-sz*0.6,sz,sz*56/48);c.restore();
      if(Math.random()<dt*(feu?30:16))(feu?flammes:flocons)(s.x,s.y,z,1,feu?12:1);
    }else if(role==='alchimiste'){
      c.globalCompositeOperation='source-over';
      const im=fiole(feu),sz=feu?28:21;c.save();c.translate(X,Y);c.rotate(v.rot);c.drawImage(im,-sz*0.5,-sz*0.85,sz,sz*40/28);c.restore();
      if(feu){c.globalCompositeOperation='lighter';const fl=flamme(),fz=14+3*Math.sin(tReel*30);c.save();c.translate(X+Math.sin(v.rot)*9,Y-Math.cos(v.rot)*9);c.drawImage(fl,-fz/2,-fz,fz,fz*1.5);c.restore();
        if(Math.random()<dt*24)fumees(s.x,s.y,z,1,10,0.6);}
      else if(Math.random()<dt*20)flocons(s.x,s.y,z,1,0.5);
    }else{
      if(feu){/* la roue de feu : la rune qui tourne */const im=rune(),sz=40*(fort?1.25:1);c.save();c.translate(X,Y);c.rotate(v.rot);
          c.globalAlpha=0.9;c.drawImage(tinte(im,'#ff8a2a'),-sz/2,-sz/2,sz,sz);c.globalAlpha=0.6;c.drawImage(tinte(im,'#fff0b0'),-sz*0.4,-sz*0.4,sz*0.8,sz*0.8);c.restore();c.globalAlpha=1;
        if(Math.random()<dt*36)flammes(s.x,s.y,z,1,14,0.8,0.3);}
      else{/* le trait bleu : une longue traînée fine */const h=v.hist;if(h.length>1){c.lineCap='round';
          for(const [w,col] of [[7,'rgba(90,190,255,.35)'],[3,'rgba(170,235,255,.9)'],[1.2,'rgba(255,255,255,1)']]){c.beginPath();c.moveTo(h[0][0],h[0][1]);for(let i=1;i<Math.min(h.length,9);i++)c.lineTo(h[i][0],h[i][1]);c.strokeStyle=col;c.lineWidth=w;c.stroke();}}
        if(Math.random()<dt*20)lueurs(s.x,s.y,z,1,'#9fe8ff',7,0.6,0.2);}
    }
    c.globalCompositeOperation='source-over';
    s.__z=z;
  }
  /* une image blanche teintée d'une couleur (gardée) */
  function tinte(im,coul){const k='t'+coul+(im.__id||(im.__id=Math.random()));if(cache[k])return cache[k];const c=toile(im.width,im.height),x=c.getContext('2d');x.drawImage(im,0,0);x.globalCompositeOperation='source-in';x.fillStyle=coul;x.fillRect(0,0,c.width,c.height);return cache[k]=c;}
  /* l'impact d'un sort sur l'armure, un réparateur, un rocher */
  function impact(x,y,z,quoi,role,fort){
    const k=fort?1.4:1;
    if(quoi==='feu'){lueurs(x,y,z,4,'#ffb040',46*k,0.9,0.4);etincelles(x,y,z,18*k,'#ffd27a',4,1);flammes(x,y,z,10*k,22*k,1,0.35);fumees(x,y,z+0.2,5,26*k,1.2);
      if(role==='alchimiste'){for(let i=0;i<10;i++)emet({x:x+R(-0.5,0.5),y:y+R(-0.1,0.2),z:z+R(-0.4,0.2),vz:R(-0.4,0.3),vie:R(0.8,1.4),s:R(14,20),s1:4,img:flamme(),add:true});}
      if(role==='barde')notes(x,y,z,4,'#ffb04a');}
    else{lueurs(x,y,z,3,'#9fe8ff',32*k,0.7,0.3);eclats(x,y,z,10*k,'#dff7ff',3,3);flocons(x,y,z,12*k,1.6);if(role==='barde')notes(x,y,z,3,'#bff0ff');}
  }
  return {emet,maj,dessiner,dessinerTir,impact,etincelles,lueurs,flammes,fumees,poussieres,eclats,anneau,flocons,notes,lueur,nappe,flamme,fumee,note,fiole,rune,tinte,COUL,get n(){return P.length;}};
})();
