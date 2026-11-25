window.__rs={glisses:0,esquives:0,defaites:0,sifflets:0};
(function(){
  const mode=window.__robotMode||'moyen',L=mode==='lent';
  const rnd=(a,b)=>a+Math.random()*(b-a);
  let plan=null,attVu=null,prochain=0;
  const dirs=['g','d','h','b'];
  setInterval(()=>{
    const s=__pt.etat();
    if(s.etatJeu==='fin'){const b=document.querySelector('#fReprendre');if(b){__rs.defaites++;b.click();}return;}
    if(s.etatJeu!=='jeu')return;
    const G=s.G,P=s.P,now=performance.now()/1000;
    if(!G)return;
    if(G.etat==='arme'){
      const a=G.att,tti=a.arme-G.t;
      if(attVu!==a){attVu=a;
        let act;
        if(a.sorte==='rouge'||a.charge)act='esq';else if(a.sorte==='or')act='par';else act=Math.random()<0.65?'par':'esq';
        if(L&&Math.random()<0.25)act=act==='par'?'esq':'par';
        const quand=act==='par'?(L?rnd(0.0,0.6):rnd(0.06,0.38)):(L?rnd(0.0,0.6):rnd(0.06,0.4));
        let side=a.de==='g'?1:a.de==='d'?-1:(Math.random()<.5?-1:1);
        if(L&&Math.random()<0.12)side=-side;
        plan={act,quand,side,fait:false};
      }
      if(plan&&!plan.fait&&tti<=plan.quand){plan.fait=true;
        if(plan.act==='par'){__pt.glisser(a.de==='face'?'h':a.de);__rs.glisses++;}else{__pt.esquiver(plan.side);__rs.esquives++;}}
      return;
    }
    attVu=null;
    if(now<prochain)return;
    if(G.etat==='genou'){__pt.achever();prochain=now+0.3;return;}
    if(P.pret&&G.etat==='garde'&&Math.random()<0.3){__pt.siffler();__rs.sifflets++;prochain=now+0.5;return;}
    if(G.etat==='ouvert'||G.etat==='sonne'){
      let d;const fa=G.faille==='h'?['g','d']:['h','b'];
      d=Math.random()<(L?0.4:0.7)?fa[Math.floor(Math.random()*2)]:dirs[Math.floor(Math.random()*4)];
      __pt.glisser(d);__rs.glisses++;prochain=now+(L?rnd(0.2,0.35):rnd(0.13,0.22));return;
    }
    if(L&&G.etat==='garde'&&Math.random()<0.04){__pt.glisser(dirs[Math.floor(Math.random()*4)]);prochain=now+0.3;}
  },30);
})();
