// Un joueur automatique très simple, pour vérifier que la partie va jusqu'au bout sans erreur.
// Il esquive ce qui est rouge au sol, va au corps à corps contre les petits, tire à l'arc sur les gros,
// ramasse les javelots et les lance sur les dalles.
(function(){
  if(window.__robot)clearInterval(window.__robot);
  const R={prochain:0,aveugleJusque:0,tir:0,bloque:0,lx:0,ly:0,devie:0,devieS:1,dernierBond:0,choix:0};
  window.__rs={bonds:0,choix:[]};
  function ang(a){a=(a+Math.PI)%(2*Math.PI);if(a<0)a+=2*Math.PI;return a-Math.PI;}
  function dansZone(z,x,y,marge){
    const dx=x-z.x,dy=y-z.y,d=Math.hypot(dx,dy);
    if(z.k==='cercle')return d<z.r+marge;
    if(z.k==='cone')return d<z.R+marge&&Math.abs(ang(Math.atan2(dy,dx)-z.a))<z.h+0.3;
    const u=dx*Math.cos(z.a)+dy*Math.sin(z.a),v=-dx*Math.sin(z.a)+dy*Math.cos(z.a);
    const l=(z.k==='fin'?0.4:z.l)/2+marge;
    return u>-0.4&&u<z.L+0.6&&Math.abs(v)<l;
  }
  function pas(){
    let s;try{s=__pt.etat();}catch(e){return;}
    if(s.choix){const i=window.__robotChoix!=null?window.__robotChoix:Math.floor(Math.random()*3);window.__rs.choix.push(s.choixDispo[i]);__pt.choisir(i);return;}
    if(s.etatJeu!=='jeu'||s.enPause)return;
    const P=s.P,now=performance.now()/1000;
    const cmd={mx:0,my:0,dague:false,arc:false};
    // 1. le danger (le robot maladroit a des moments d'inattention)
    if(window.__robotMal&&now>R.prochain){R.prochain=now+2.5;R.aveugleJusque=Math.random()<0.4?now+1.3:0;}
    const aveugle=window.__robotMal&&now<R.aveugleJusque;
    let fuite=null;
    for(const g of s.G){const z=g.zone;if(!z)continue;
      const p=z.p||0;if(p<0.45)continue;
      if(dansZone(z,P.x,P.y,0.35)){const a=(z.k==='cercle'||z.k==='cone')?Math.atan2(P.y-z.y,P.x-z.x):z.a+Math.PI/2*(((P.x-z.x)*-Math.sin(z.a)+(P.y-z.y)*Math.cos(z.a))>=0?1:-1);fuite={a,urg:p>0.75};break;}}
    if(!fuite)for(const o of s.obus){if(Math.hypot(P.x-o.x,P.y-o.y)<1.5&&o.t/o.dur>0.4){fuite={a:Math.atan2(P.y-o.y,P.x-o.x),urg:o.t/o.dur>0.8};break;}}
    if(!fuite)for(const w of s.ondes){const d=Math.hypot(P.x-w.x,P.y-w.y);if(d-w.r<1.1&&d-w.r>-0.2){fuite={a:Math.atan2(w.y-P.y,w.x-P.x),urg:true,bond:true};break;}}
    if(!fuite)for(const j of s.javs){const dx=P.x-j.x,dy=P.y-j.y,u=dx*Math.cos(j.a)+dy*Math.sin(j.a),v=-dx*Math.sin(j.a)+dy*Math.cos(j.a);if(u>0&&u<4&&Math.abs(v)<0.7){fuite={a:j.a+Math.PI/2*(v>=0?1:-1),urg:u<2};break;}}
    for(const g of s.G){if(g.etat==='charge'){const dx=P.x-g.x,dy=P.y-g.y,u=dx*Math.cos(g.fa)+dy*Math.sin(g.fa),v=-dx*Math.sin(g.fa)+dy*Math.cos(g.fa);if(u>0&&u<3.5&&Math.abs(v)<1.1){fuite={a:g.fa+Math.PI/2*(v>=0?1:-1),urg:true};}}
      if(g.etat==='saut'&&Math.hypot(P.x-g.x,P.y-g.y)<1.6)fuite={a:Math.atan2(P.y-g.y,P.x-g.x)+1.2,urg:true};}
    if(aveugle)fuite=null;
    if(fuite){
      cmd.mx=Math.cos(fuite.a);cmd.my=Math.sin(fuite.a);
      if(fuite.urg&&P.charges>0&&now-R.dernierBond>0.3){cmd.bond=true;R.dernierBond=now;window.__rs.bonds++;}
      __pt.cmd(cmd);return;
    }
    // 2. le javelot par terre
    const dalle=s.G.find(g=>g.type==='dalle'&&g.aDalle);
    if(!P.porte&&s.items.length){let it=s.items.reduce((a,b)=>Math.hypot(a.x-P.x,a.y-P.y)<Math.hypot(b.x-P.x,b.y-P.y)?a:b);
      if(Math.hypot(it.x-P.x,it.y-P.y)<5){aller(cmd,P,it.x,it.y,1);__pt.cmd(cmd);return;}}
    // 3. la cible
    if(!s.G.length){aller(cmd,P,13,11,0.6);__pt.cmd(cmd);return;}
    const ordre={mortier:0,javelot:1,chien:2,dalle:3,belier:4,colosse:5};
    let cible=null,bs=1e9;
    for(const g of s.G){if(g.etat==='entre')continue;const d=Math.hypot(g.x-P.x,g.y-P.y);const sc=d+ordre[g.type]*2.5;if(sc<bs){bs=sc;cible=g;}}
    if(!cible){__pt.cmd(cmd);return;}
    if(P.porte&&dalle)cible=dalle;
    const d=Math.hypot(cible.x-P.x,cible.y-P.y),a=Math.atan2(cible.y-P.y,cible.x-P.x);
    let tx=cible.x,ty=cible.y;
    if(cible.type==='dalle'&&cible.aDalle&&!P.porte){tx=cible.x-Math.cos(cible.fa)*1.6;ty=cible.y-Math.sin(cible.fa)*1.6;}
    const loin=(cible.type==='colosse'||cible.type==='belier')&&cible.etat!=='sonne';
    const portee=loin?5.5:1.25;
    if(P.porte){if(d<9){cmd.mx=Math.cos(a)*0.3;cmd.my=Math.sin(a)*0.3;cmd.arc=true;}else aller(cmd,P,tx,ty,1);}
    else if(cible.type==='dalle'&&cible.aDalle&&Math.hypot(tx-P.x,ty-P.y)>0.6){aller(cmd,P,tx,ty,1);if(d<1.5)cmd.dague=true;}
    else if(d>portee+0.3){aller(cmd,P,tx,ty,1);if(d<8&&!loin&&cible.type!=='chien'&&R.tir++%3===0)cmd.arc=false;}
    else if(loin&&d<portee-1.5){cmd.mx=-Math.cos(a);cmd.my=-Math.sin(a);}
    else{cmd.mx=Math.cos(a)*0.3;cmd.my=Math.sin(a)*0.3;if(loin)cmd.arc=true;else cmd.dague=true;}
    __pt.cmd(cmd);
  }
  function aller(cmd,P,tx,ty,v){
    let a=Math.atan2(ty-P.y,tx-P.x);
    const bouge=Math.hypot(P.x-R.lx,P.y-R.ly);R.lx=P.x;R.ly=P.y;
    if(bouge<0.02)R.bloque++;else R.bloque=Math.max(0,R.bloque-1);
    if(R.bloque>8){R.devie=14;R.devieS=Math.random()<.5?1:-1;R.bloque=0;}
    if(R.devie>0){R.devie--;a+=R.devieS*1.3;}
    cmd.mx=Math.cos(a)*v;cmd.my=Math.sin(a)*v;
  }
  window.__robot=setInterval(pas,40);
})();
