/* ======================= l'armure de Grosbec : le modèle du combat du Barde (modeles/grosbec.js), et ce qui change à chaque tiers =======================
   Chaque coup du boss a son geste (le geste EST l'annonce, comme dans World of Warcraft) :
   - les crépitements : il abat le poing sur le sol, du côté qui va exploser, et le laisse appuyé pendant que les fissures se chargent ;
   - les rochers : les deux poings au ciel, puis il frappe du pied : la voûte se détache ;
   - la vague : il se penche en arrière, la poitrine rougit de plus en plus fort (§ 18.14), puis il se jette en avant ;
   - les réparateurs : il les appelle, le bras tendu vers la porte ;
   - les mains (deuxième tiers) : il lève la main glacée (à gauche) ou la main brûlante (à droite), et la garde levée ;
   - la danse : les deux mains à plat sur le sol ;
   - au troisième tiers, l'armure est brisée : une aura d'énergie, le bras droit fini par une main d'énergie qui tend les doigts. */
const Armure=(()=>{
  const GK=0.6,X=()=>px(REG.armure.x),Y=()=>py(REG.armure.y,0);
  let pret=false,tPose=0;
  /* ses gestes à lui (en plus de ceux du combat du Barde) : [temps depuis le début, pose] */
  Object.assign(Gros.G,{
    plafond:()=>[[0,{}],[0.28,{gx:-64,gy:-158,gz:10,dx:64,dy:-158,dz:10,go:1,do_:1,penche:-0.2,hoche:-0.36,bas:3,yeux:2.3,lumC:2}],[0.62,{gx:-70,gy:-164,gz:6,dx:70,dy:-164,dz:6,go:1,do_:1,penche:-0.24,hoche:-0.4,yeux:2.5,pied:1}],
      [0.78,{gx:-40,gy:-6,gz:52,dx:40,dy:-6,dz:52,go:1,do_:1,penche:0.36,hoche:0.18,bas:18,yeux:2.2,cape:1,pied:0}],[1.5,{gx:-36,gy:4,gz:50,dx:36,dy:4,dz:50,penche:0.26,bas:12}],[2.1,{}]],
    appel:sd=>[[0,{}],[0.35,{cap:0.3*sd,tors:0.2*sd,tete:0.5*sd,['g d'.split(' ')[sd<0?0:1]+'x']:sd*150,[(sd<0?'g':'d')+'y']:-70,[(sd<0?'g':'d')+'z']:40,yeux:1.8}],[1.4,{cap:0.3*sd,tors:0.2*sd,tete:0.5*sd,[(sd<0?'g':'d')+'x']:sd*156,[(sd<0?'g':'d')+'y']:-60,[(sd<0?'g':'d')+'z']:44,yeux:1.8}],[2.0,{}]],
    aie:sd=>[[0,{penche:-0.12,tete:0.22*sd,bas:4,yeux:2.2,roulis:0.04*sd,cape:-0.4}],[0.32,{}]],
  });
  function construire(){Gros.construire(Sc,GK);pret=true;}
  /* sa pose du moment, d'après ce qui se passe */
  function pose(S){
    const o={},A=REG.armure;
    if(S.phase==='transfo'||S.phase==='explose')return {penche:0.2,bas:12,gx:-90,gy:20,gz:20,dx:90,dy:30,dz:16,go:1,do_:1,yeux:0.4};
    if(S.crepite){const sd=S.crepite.cote==='g'?-1:1,c=S.crepite.t,k=clamp((c-0.15)/0.4,0,1),h=sd<0?'g':'d';
      if(c<0.35){o[h+'x']=sd*80;o[h+'y']=-150;o[h+'z']=20;o.penche=-0.1;}else{o[h+'x']=sd*92;o[h+'y']=24;o[h+'z']=70;o.penche=0.34*k;o.bas=16*k;o.cap=0.25*sd;o.tors=0.18*sd;o[sd<0?'go':'do_']=1;}
      o.yeux=1.6;}
    if(S.vague){const v=S.vague,V=REG.vague;
      if(v.t<V.annonce){const k=v.t/V.annonce;Object.assign(o,{penche:-0.3*Math.min(1,k*2),hoche:-0.25,gx:-118,gy:-30,gz:-10,dx:118,dy:-30,dz:-10,go:0,do_:0,lumC:1+2.4*k,yeux:1.5+k,cape:-0.6});}
      else if(v.t<V.annonce+0.7)Object.assign(o,{penche:0.42,bas:12,gx:-46,gy:0,gz:96,dx:46,dy:0,dz:96,go:0,do_:0,lumC:2.4,yeux:2.2,cape:1});}
    if(S.main){const m=S.main,sd=m.type==='givre'?-1:1,h=sd<0?'g':'d',k=clamp(m.t/REG.main.leve,0,1);
      o[h+'x']=sd*lerp(60,84,k);o[h+'y']=lerp(-60,-170,k);o[h+'z']=lerp(30,8,k);o[h==='g'?'go':'do_']=0;o.tete=0.25*sd;o.yeux=1.7;o.penche=-0.06;}
    if(S.danse)Object.assign(o,{gx:-70,gy:30,gz:70,dx:70,dy:30,dz:70,go:0,do_:0,penche:0.4,bas:18,hoche:0.2,yeux:2.4,lumC:2});
    if(S.doigts.length){const dg=S.doigts[S.doigts.length-1],a=(dg.lignes[0]+dg.lignes[dg.lignes.length-1])/2,k=clamp(dg.t/0.5,0,1);
      Object.assign(o,{dx:Math.cos(a)*90*k+30*(1-k),dy:lerp(-30,40,k),dz:lerp(20,110,k),do_:0,penche:0.3*k,bas:10*k,tete:Math.cos(a)*0.3,yeux:2});}
    return o;
  }
  function maj(S,now){
    if(!pret)return;
    const tiers=S.tiers,bulle=S.phase==='bulle';
    const E0={pul:0.2+0.2*Math.sin(now*2.1),colere:tiers===3?1:bulle?0.6:0.2,fissures:tiers===1?0:tiers===2?2:5,pose:pose(S)};
    if(tiers===3){Object.assign(E0.pose,{lumG:0.15,lumD:0.15,cape:E0.pose.cape||0});E0.teinte='rgba(36,8,18,.5)';}   // (troisième tiers : l'armure éteinte, l'énergie par-dessus)
    if(S.phase==='transfo'||S.phase==='explose')E0.sonne=true;
    Gros.rafraichir(now,E0,finesse>=2?14:20);
  }
  /* les événements du jeu → ses gestes */
  function evenement(e,S,now){
    if(e.type==='attaque'){
      if(e.quoi==='colonnes')Gros.jouer('plafond',now);
      else if(e.quoi==='reparateurs'){const r=S.reps[S.reps.length-1];Gros.jouer('appel',now,r&&r.x<REG.armure.x?-1:1);}
    }else if(e.type==='touche'&&e.quoi==='feu')Gros.jouer('aie',now,Math.random()<0.5?-1:1);
    else if(e.type==='contre')Gros.jouer('aie',now,e.main==='givre'?-1:1);
  }
  function point(nom){return Gros.point(nom,X(),Y());}
  function dessiner(c){if(pret)Gros.dessiner(c,X(),Y());}
  return {construire,maj,dessiner,point,evenement,get pret(){return pret;},GK,X,Y};
})();
