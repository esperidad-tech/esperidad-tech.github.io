// Un joueur automatique, pour vérifier que la partie va jusqu'au bout sans erreur et mesurer sa durée.
// Caché : il s'approche d'un golem, saut d'ombre dans son dos, coup d'assassin ; de loin, un tir visé.
// Repéré : il esquive le rouge, dague contre les petits, flèches contre les gros ; contre un cuirassé, il va se cacher.
// window.__robotMal = true : il a des moments d'inattention.   window.__robotBrute = true : il ne se cache jamais exprès.
(function(){
  if(window.__robot)clearInterval(window.__robot);
  const R={prochain:0,aveugleJusque:0,bloque:0,lx:0,ly:0,devie:0,devieS:1,dernierBond:0,viseDepuis:0,abri:null,abriT:0};
  window.__rs={bonds:0,choix:[],tCache:0,tAlerte:0};
  const hyp=Math.hypot;
  function ang(a){a=(a+Math.PI)%(2*Math.PI);if(a<0)a+=2*Math.PI;return a-Math.PI;}
  function dansZone(z,x,y,marge){
    const dx=x-z.x,dy=y-z.y,d=hyp(dx,dy);
    if(z.k==='cercle')return d<z.r+marge;
    if(z.k==='cone')return d<z.R+marge&&Math.abs(ang(Math.atan2(dy,dx)-z.a))<z.h+0.3;
    const u=dx*Math.cos(z.a)+dy*Math.sin(z.a),v=-dx*Math.sin(z.a)+dy*Math.cos(z.a);
    const l=(z.k==='fin'?0.4:z.l)/2+marge;
    return u>-0.4&&u<z.L+0.6&&Math.abs(v)<l;
  }
  function aller(cmd,P,tx,ty,v){
    let a=Math.atan2(ty-P.y,tx-P.x);
    const bouge=hyp(P.x-R.lx,P.y-R.ly);R.lx=P.x;R.ly=P.y;
    if(bouge<0.02)R.bloque++;else R.bloque=Math.max(0,R.bloque-1);
    if(R.bloque>8){R.devie=16;R.devieS=Math.random()<.5?1:-1;R.bloque=0;}
    if(R.devie>0){R.devie--;a+=R.devieS*1.3;}
    cmd.mx=Math.cos(a)*v;cmd.my=Math.sin(a)*v;
  }
  function pas(){
    let s;try{s=__pt.etat();}catch(e){return;}
    if(s.choix){const i=window.__robotChoix!=null?window.__robotChoix:Math.floor(Math.random()*3);window.__rs.choix.push(s.choixDispo[i]);__pt.choisir(i);return;}
    if(s.etatJeu!=='jeu'||s.enPause)return;
    const P=s.P,now=performance.now()/1000,cmd={mx:0,my:0,dague:false,arc:false};
    if(P.cache)window.__rs.tCache+=0.04;else window.__rs.tAlerte+=0.04;
    const viv=s.G.filter(g=>g.etat!=='entre');
    // 1. le danger
    if(window.__robotMal&&now>R.prochain){R.prochain=now+2.5;R.aveugleJusque=Math.random()<0.4?now+1.3:0;}
    const aveugle=window.__robotMal&&now<R.aveugleJusque;
    let fuite=null;
    for(const g of s.G){const z=g.zone;if(!z)continue;const p=z.p||0;if(p<0.45)continue;
      if(dansZone(z,P.x,P.y,0.35)){const a=(z.k==='cercle'||z.k==='cone')?Math.atan2(P.y-z.y,P.x-z.x):z.a+Math.PI/2*(((P.x-z.x)*-Math.sin(z.a)+(P.y-z.y)*Math.cos(z.a))>=0?1:-1);fuite={a,urg:p>0.75};break;}}
    if(!fuite)for(const o of s.obus){if(hyp(P.x-o.x,P.y-o.y)<1.5&&o.t/o.dur>0.4){fuite={a:Math.atan2(P.y-o.y,P.x-o.x),urg:o.t/o.dur>0.8};break;}}
    if(!fuite)for(const w of s.ondes){const d=hyp(P.x-w.x,P.y-w.y);if(d-w.r<1.1&&d-w.r>-0.2){fuite={a:Math.atan2(w.y-P.y,w.x-P.x),urg:true};break;}}
    if(!fuite)for(const j of s.javs){const dx=P.x-j.x,dy=P.y-j.y,u=dx*Math.cos(j.a)+dy*Math.sin(j.a),v=-dx*Math.sin(j.a)+dy*Math.cos(j.a);if(u>0&&u<4&&Math.abs(v)<0.7){fuite={a:j.a+Math.PI/2*(v>=0?1:-1),urg:u<2};break;}}
    for(const g of s.G){if(g.etat==='charge'){const dx=P.x-g.x,dy=P.y-g.y,u=dx*Math.cos(g.fa)+dy*Math.sin(g.fa),v=-dx*Math.sin(g.fa)+dy*Math.cos(g.fa);if(u>0&&u<3.5&&Math.abs(v)<1.1)fuite={a:g.fa+Math.PI/2*(v>=0?1:-1),urg:true};}
      if(g.etat==='saut'&&hyp(P.x-g.x,P.y-g.y)<1.6)fuite={a:Math.atan2(P.y-g.y,P.x-g.x)+1.2,urg:true};}
    if(aveugle)fuite=null;
    if(fuite&&P.etat!=='vise'){
      cmd.mx=Math.cos(fuite.a);cmd.my=Math.sin(fuite.a);
      if(fuite.urg&&!P.cache&&P.charges>0&&now-R.dernierBond>0.3){cmd.bond=true;R.dernierBond=now;window.__rs.bonds++;}
      __pt.cmd(cmd);return;
    }
    if(!viv.length){if(hyp(P.x-13,P.y-14)>1)aller(cmd,P,13,14,0.7);__pt.cmd(cmd);return;}
    const proche=viv.reduce((a,b)=>hyp(a.x-P.x,a.y-P.y)<hyp(b.x-P.x,b.y-P.y)?a:b),dP=hyp(proche.x-P.x,proche.y-P.y);
    // 2. caché : la chasse
    if(P.cache){
      if(P.etat==='vise'){cmd.arc=P.charge<1||now-R.viseDepuis<0.3;__pt.cmd(cmd);return;}
      if(dP-proche.r<2.2){cmd.dague=true;cmd.mx=(proche.x-P.x)/dP*0.2;cmd.my=(proche.y-P.y)/dP*0.2;}
      else if(dP<5.6&&now-R.dernierBond>0.5){cmd.bond=true;R.dernierBond=now;}
      else if(dP>7&&dP<14&&P.arcCD<=0&&!proche.armure&&__pt.vue(P.x,P.y,proche.x,proche.y)&&Math.random()<0.3){
        cmd.mx=(proche.x-P.x)/dP*0.3;cmd.my=(proche.y-P.y)/dP*0.3;cmd.arc=true;R.viseDepuis=now;}
      else aller(cmd,P,proche.x,proche.y,1);
      __pt.cmd(cmd);return;
    }
    // 3. repéré : s'il ne reste que des cuirassés (ou si on le veut), aller se cacher
    const seulsArmures=viv.every(g=>g.armure);
    if(seulsArmures&&!s.dir.assaut&&!window.__robotBrute){
      if(!R.abri||now-R.abriT>2.5){let best=null,bs=1e9;for(const c of s.cachettes){if(viv.some(g=>__pt.vue(g.x,g.y,c.x,c.y)))continue;const d=hyp(c.x-P.x,c.y-P.y)-Math.min(...viv.map(g=>hyp(g.x-c.x,g.y-c.y)))*0.7;if(d<bs){bs=d;best=c;}}R.abri=best;R.abriT=now;}
      if(R.abri){aller(cmd,P,R.abri.x,R.abri.y,1);__pt.cmd(cmd);return;}
    }
    // 4. le combat à découvert
    if(P.javelots>0){const dalle=viv.find(g=>g.type==='dalle'&&g.aDalle)||proche;const d=hyp(dalle.x-P.x,dalle.y-P.y),a=Math.atan2(dalle.y-P.y,dalle.x-P.x);if(d<9){cmd.mx=Math.cos(a)*0.3;cmd.my=Math.sin(a)*0.3;cmd.arc=true;}else aller(cmd,P,dalle.x,dalle.y,1);__pt.cmd(cmd);return;}
    if(s.items.length){const it=s.items.reduce((a,b)=>hyp(a.x-P.x,a.y-P.y)<hyp(b.x-P.x,b.y-P.y)?a:b);if(hyp(it.x-P.x,it.y-P.y)<4){aller(cmd,P,it.x,it.y,1);__pt.cmd(cmd);return;}}
    const ordre={mortier:0,javelot:1,chien:2,faucheur:3,dalle:3,belier:4,colosse:5,cuirasse:9};
    let cible=null,bs=1e9;
    for(const g of viv){const d=hyp(g.x-P.x,g.y-P.y),sc=d+ordre[g.type]*2.5;if(sc<bs){bs=sc;cible=g;}}
    const d=hyp(cible.x-P.x,cible.y-P.y),a=Math.atan2(cible.y-P.y,cible.x-P.x);
    let tx=cible.x,ty=cible.y;
    if(cible.type==='dalle'&&cible.aDalle){tx=cible.x-Math.cos(cible.fa)*1.6;ty=cible.y-Math.sin(cible.fa)*1.6;}
    const loin=(cible.type==='colosse'||cible.type==='belier'||cible.type==='faucheur')&&!cible.sonne,portee=loin?5.5:1.25;
    if(cible.armure){cmd.mx=-Math.cos(a);cmd.my=-Math.sin(a);}
    else if(cible.type==='dalle'&&cible.aDalle&&hyp(tx-P.x,ty-P.y)>0.6){aller(cmd,P,tx,ty,1);if(d<1.5)cmd.dague=true;}
    else if(d>portee+0.3)aller(cmd,P,tx,ty,1);
    else if(loin&&d<portee-1.5){cmd.mx=-Math.cos(a);cmd.my=-Math.sin(a);}
    else{cmd.mx=Math.cos(a)*0.3;cmd.my=Math.sin(a)*0.3;if(loin)cmd.arc=true;else cmd.dague=true;}
    __pt.cmd(cmd);
  }
  window.__robot=setInterval(pas,40);
})();
