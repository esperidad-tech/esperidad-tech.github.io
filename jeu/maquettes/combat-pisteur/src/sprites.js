/* ======================= les images cuites : le Pisteur en volume, les golems =======================
   Tout est peint une fois, puis recopié (la règle des vieilles tablettes). */
const HV=window.HerosVues;
/* ---- le Pisteur : le pantin en volume du jeu (jeu/heros-vues), cuit sous huit angles ---- */
const PS=(()=>{
  const q=new URLSearchParams(location.search);
  const h={role:'pisteur',sexe:q.get('sexe')||'f',peau:q.get('peau')||'p1',cheveux:q.get('cheveux')||'roux',yeux:q.get('yeux')||'vert'};
  if(q.get('coiffure'))h.coiffure=q.get('coiffure');
  const CADRE=[-70,-10,440,460],ECH=64/384,CW=CADRE[2]*ECH,CH=CADRE[3]*ECH,AX=(150-CADRE[0])*ECH,AY=(414-CADRE[1])*ECH;
  const CAPS=[0,45,90,135,180,-135,-90,-45],COLS=6;
  const geste=(nom,u)=>()=>{const Gs=HV.DONJON[nom];return HV.gesteImage(HV.pose('combat'),Gs,u*HV.dureeGeste(Gs));};
  const accroupi=u=>()=>{const p=HV.course(u*HV.COURSE.cycle);p.bas=[p.bas[0],p.bas[1]+34,p.bas[2]];p.dos=[p.dos[0]+22,p.dos[1],p.dos[2]];p.hoche=-22;return p;};
  const POSES={garde:()=>HV.pose('combat'),furtif:()=>HV.pose('furtif'),fente:()=>HV.pose('fente'),
    d1a:geste('dague',0.224),d1b:geste('dague',0.45),saut:geste('dagueSaut',0.3),plante:geste('dagueSaut',0.45),
    t2:geste('tir',0.5),t3:geste('tir',0.72),chute:geste('chute',0.1),
    /* les poses du nouveau combat : plaqué au sol (allongée), sonné (elle encaisse) */
    sol:geste('chute',0.232),sonne:geste('coup',0.36)};
  for(let i=0;i<8;i++)POSES['c'+i]=()=>HV.course(i/8*HV.COURSE.cycle);
  for(let i=0;i<4;i++)POSES['a'+i]=accroupi(i/4);
  const ORDRE=['garde','furtif','c0','c1','c2','c3','c4','c5','c6','c7','a0','a1','a2','a3','d1b','fente','t2','t3','saut','plante','chute','d1a','sol','sonne'];
  const IDX={};ORDRE.forEach((n,i)=>IDX[n]=i);
  let res=1.5,cw=0,ch=0,planches=[],planchesO=[],brouillon=null,pret=[],file=[],fait=0,total=0,enCours=false,fini=null;
  function lancer(S0,quandFini){
    res=clamp(S0,1,1.8);cw=Math.ceil(CW*res);ch=Math.ceil(CH*res);fini=quandFini;
    const planche=()=>{const c=document.createElement('canvas');c.width=cw*COLS;c.height=ch*Math.ceil(ORDRE.length/COLS);return c;};
    planches=CAPS.map(planche);
    /* dans l'ombre, le Pisteur devient une silhouette sombre : les mêmes images, cuites une deuxième fois en violet nuit */
    planchesO=CAPS.map(planche);brouillon=document.createElement('canvas');brouillon.width=cw;brouillon.height=ch;
    pret=CAPS.map(()=>new Uint8Array(ORDRE.length));
    file=[];for(const n of ORDRE)for(let d=0;d<8;d++){if((n==='chute'||n==='sol')&&d!==2&&d!==6)continue;file.push([n,d]);}
    total=file.length;fait=0;suite();
  }
  function suite(){
    if(enCours)return;
    if(doux&&fait>=80){const t=performance.now();if(t-douxT<450){setTimeout(suite,460-(t-douxT));return;}douxT=t;}
    const job=file.shift();if(!job){if(fini){const f=fini;fini=null;f();}return;}
    enCours=true;const [n,d]=job;
    let svg;
    try{svg=HV.svg(h,Object.assign({},POSES[n](),{cap:CAPS[d]}),{cadre:CADRE.join(' '),id:'ps'});}catch(e){enCours=false;fait++;setTimeout(suite,0);return;}
    svg=svg.replace('<svg ','<svg width="'+cw+'" height="'+ch+'" ');
    const url=URL.createObjectURL(new Blob([svg],{type:'image/svg+xml'})),img=new Image();
    const fin=ok=>{if(ok){const i=IDX[n],x=planches[d].getContext('2d');x.drawImage(img,(i%COLS)*cw,Math.floor(i/COLS)*ch,cw,ch);
      const b=brouillon.getContext('2d');b.globalCompositeOperation='source-over';b.clearRect(0,0,cw,ch);b.drawImage(img,0,0,cw,ch);
      b.globalCompositeOperation='source-atop';b.fillStyle='rgba(22,12,58,.86)';b.fillRect(0,0,cw,ch);
      planchesO[d].getContext('2d').drawImage(brouillon,(i%COLS)*cw,Math.floor(i/COLS)*ch);
      pret[d][i]=1;}URL.revokeObjectURL(url);img.onload=img.onerror=null;enCours=false;fait++;setTimeout(suite,0);};
    img.onload=()=>fin(true);img.onerror=()=>fin(false);img.src=url;
  }
  /* en plein combat, on ne cuit qu'une image de temps en temps (le reste se fait pendant les écrans calmes) */
  let doux=false,douxT=0;
  function rythme(d){doux=d;if(!d&&!enCours)suite();}
  /* dessiner une pose : (x, y) ses pieds */
  function dessiner(c,nom,d,x,y,a,ombre){
    let i=IDX[nom];if(!pret[d]||!pret[d][i]){i=0;if(!pret[d]||!pret[d][0])return false;}
    if(a!=null&&a<1)c.globalAlpha=a;
    c.drawImage((ombre?planchesO:planches)[d],(i%COLS)*cw,Math.floor(i/COLS)*ch,cw,ch,x-AX,y-AY,CW,CH);
    if(a!=null&&a<1)c.globalAlpha=1;
    return true;
  }
  return {lancer,dessiner,rythme,get avance(){return total?Math.min(1,fait/80):0;},get essentiel(){return fait>=80;},get complet(){return total>0&&fait>=total;},HAUT:64};
})();

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
  return {image,ombre,prevoir,precuire,regler(d){dens=clamp(d,1,1.8);},get cuits(){return cuits.size;},get file(){return file.length;}};
})();
