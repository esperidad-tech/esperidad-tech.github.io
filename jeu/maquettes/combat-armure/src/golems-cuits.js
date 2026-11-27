/* ======================= les réparateurs : le golem du combat du Pisteur (modeles/golems-pisteur.js), cuit à la demande =======================
   (Repris de combat-pisteur/src/sprites.js, avec la version rouge.) */
/* ---- les golems : le bestiaire du combat du Barde (et le cuirassé de l'Alchimiste), cuits à la demande ---- */
const GS=(()=>{
  const cuits=new Map(),file=[];let dens=1.5;
  const cle=(m,o)=>m+'/'+o.yaw+'/'+o.etat+'/'+o.k+'/'+o.pied+'/'+(o.sansBouclier?'n':'');
  const normal=o=>{const etat=o.etat||'marche',mm=etat==='marche',k=o.k||0;return {yaw:o.yaw||0,etat,k:mm?(k===1?2:k):0,pied:mm&&o.pied?1:0,sansBouclier:!!o.sansBouclier};};
  function rogner(sp,K0){
    const c=sp.c,w=c.width,hh=c.height,d=c.getContext('2d').getImageData(0,0,w,hh).data;let x0=w,x1=-1,y0=hh,y1=-1;
    for(let y=0;y<hh;y+=2)for(let x=0,i=y*w*4+3;x<w;x+=2,i+=8)if(d[i]>10){if(x<x0)x0=x;if(x>x1)x1=x;if(y<y0)y0=y;if(y>y1)y1=y;}
    if(x1<0)return sp;
    x0=Math.max(0,x0-3);y0=Math.max(0,y0-3);x1=Math.min(w-1,x1+4);y1=Math.min(hh-1,y1+4);
    const c2=Ou.toile(x1-x0+1,y1-y0+1);c2.getContext('2d').drawImage(c,-x0,-y0);c.width=c.height=0;
    return {c:c2,w:c2.width/K0,h:c2.height/K0,ox:sp.ox-x0/K0,oy:sp.oy-y0/K0};
  }
  function image(m,sc,o0){
    const o=normal(o0),k=cle(m,o);let sp=cuits.get(k);if(sp)return sp;
    const [w,hh,ox,oy]=Golems.TYPES[m].boite,K0=clamp(sc*dens*1.05,0.7,1.7);
    sp=rogner(Ou.sprite(w,hh,ox,oy,K0,x=>Golems.peindre(x,m,o)),K0);cuits.set(k,sp);return sp;
  }
  function prevoir(liste){   /* [modèle, taille] : la marche sous les trois angles, puis les gestes */
    for(const yaw of [0,1,-1])for(const [m,sc,gestes] of liste){for(const pied of [0,1])for(const k of [0,2,3,4])file.push([m,sc,{yaw,etat:'marche',k,pied}]);for(const e of gestes||['arme','frappe'])file.push([m,sc,{yaw,etat:e}]);}
  }
  /* dans l'ombre : la même image, teintée en bleu-violet (faite la première fois qu'on en a besoin) */
  function ombre(sp){
    if(sp.o)return sp.o;
    const o=Ou.toile(sp.c.width,sp.c.height),x=o.getContext('2d');x.drawImage(sp.c,0,0);x.globalCompositeOperation='source-atop';x.fillStyle='rgba(40,28,112,.5)';x.fillRect(0,0,o.width,o.height);
    return sp.o=o;
  }
  function precuire(ms){const t0=performance.now();while(file.length&&performance.now()-t0<ms){const [m,sc,o]=file.shift();image(m,sc,o);}return file.length;}
  /* rouge vif (la vague de flammes les rougit sans les tuer, § 18.14) */
  function rouge(sp){
    if(sp.r)return sp.r;
    const o=Ou.toile(sp.c.width,sp.c.height),x=o.getContext('2d');x.drawImage(sp.c,0,0);x.globalCompositeOperation='source-atop';x.fillStyle='rgba(255,60,20,.9)';x.fillRect(0,0,o.width,o.height);
    return sp.r=o;
  }
  return {image,ombre,rouge,prevoir,precuire,regler(d){dens=clamp(d,1,1.8);},get cuits(){return cuits.size;},get file(){return file.length;}};
})();
