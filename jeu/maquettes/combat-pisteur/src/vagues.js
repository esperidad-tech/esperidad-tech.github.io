/* ======================= ce qui vole : les javelots, les obus ======================= */
const porte=[0,0],alerte=[0,0],alerteT=[0,0];   /* les deux portes : ouverte (de 1 à 0), l'œil allumé, et le temps qu'il lui reste à l'être */
function majProjectiles(dt){
  /* le javelot vole vraiment : plus on est loin, plus on a de temps. Un mur l'arrête ; il blesse le premier qu'il touche, golems compris. */
  for(const j of javs){
    const n=Math.ceil(j.v*dt/0.15);
    for(let s=0;s<n&&!j.fini;s++){
      j.x+=Math.cos(j.a)*j.v*dt/n;j.y+=Math.sin(j.a)*j.v*dt/n;j.L+=j.v*dt/n;
      if(hyp(P.x-j.x,P.y-j.y)<0.48&&!j.passe){
        if(blesserP(REG.javelot.lancer,{sonne:REG.javelot.sonne,sx:j.x-Math.cos(j.a),sy:j.y-Math.sin(j.a),nom:'javelot'})){j.fini=true;eclatsBois(j.x,j.y);
          break;}
        j.passe=true;
      }
      let tg=null;for(const g of G){if(g===j.de||!vivant(g))continue;if(hyp(g.x-j.x,g.y-j.y)<g.r+0.2){tg=g;break;}}
      if(tg){blesserG(tg,REG.javelot.lancer,'rouge');j.fini=true;eclatsBois(j.x,j.y);break;}
      if(j.L>18||horsSalle(j.x,j.y,0.15)||obsEn(j.x,j.y,0.05,false)){j.fini=true;eclatsBois(j.x,j.y);break;}
    }
  }
  javs=javs.filter(j=>!j.fini);
  for(const o of obus){
    o.t+=dt;
    if(o.t>=o.dur&&!o.fini){
      o.fini=true;son('impact',o.x1,o.y1);secousse(5);etincelles(o.x1,o.y1,0.2,'#ff8a3a',14);poussiere(o.x1,o.y1,1.4);parts.push({k:'onde',x:o.x1,y:o.y1,z:0,ox:0,oy:0,vie:.3,max:.3,s:1.3});
      /* l'obus blesse tout le monde… mais les golems en sortent toujours à temps (fuirRouge), et le mortier ne tire pas là où un des siens
         est coincé (cibleObusOk). Celui qui ne PEUT PAS sortir, parce que le Pisteur l'a assommé ou endormi, celui-là le prend. */
      { const z={k:'cercle',x:o.x1,y:o.y1,r:o.r};
        if(dansZone(z,P.x,P.y,0.25))blesserP(REG.mortier.obus,{sx:o.x0,sy:o.y0,nom:'obus'});
        for(const q of G){if(q===o.de||!vivant(q)||!(q.sonne>0||q.dort))continue;if(dansZone(z,q.x,q.y,q.r*0.5))blesserG(q,REG.mortier.obus,'rouge');} }
    }
  }
  obus=obus.filter(o=>!o.fini);
}

/* ======================= les vagues (Bible §17.36 à §17.38) : version 8, des combinaisons beaucoup plus dures, sans toucher aux points de vie =======================
   Un groupe (une ligne « m ») reste ensemble : ce que l'un voit, tous le savent ; les autres groupes ne savent rien.
   Romain, 25 novembre, 22 h : des meutes de trois rôdeurs au plus, parfois deux (quatre, c'était répétitif) ; un nouveau golem, le
   réparateur, toujours au milieu d'un groupe ; des combinaisons « vraiment très compliquées à gérer », que les trois cartes dorées
   aident à dénouer. Chaque vague dure a son nœud, et chaque nœud a sa clé… mais la vague se finit aussi sans carte.
   LES RENFORTS (Romain, 26 novembre, à la voix : « à chaque fois qu'on a tué une bande, il y a l'autre qui arrive […] pour qu'il y ait
   toujours du monde », dans toutes les vagues, dès la première) : les groupes sans « apres » entrent au début de la vague ; les groupes
   « apres » attendent en réserve, et dès qu'UNE bande est entièrement tombée, le suivant entre (avec ceux qui le suivent et portent
   « avec ») : il y a toujours autant de bandes dans la salle, tant qu'il en reste en réserve. Avant chaque bande : le cor des
   renforts, l'œil de sa porte s'allume, et elle sort deux secondes après (DELAI_RENFORT). Elle arrive comme les autres : si le
   Pisteur est caché, elle ne le voit pas.
   Dans « m », le premier de la liste marche devant. « ri » : où le groupe commence sa ronde (deux groupes sur la même route marchent
   l'un près de l'autre). */
const ROUTES={
  A:[[3,3.6],[7.2,6.2],[6.6,10.6],[3,12.2],[2.6,7]],
  B:[[23,3.6],[19,8.6],[23.6,11],[23,15.8],[18.2,13.4]],
  C:[[13,5.6],[10.6,6.6],[13,9.8],[15.4,8.6]],
  D:[[7.2,11.8],[11.6,14.6],[12,16.8],[5,16.9],[3.4,14.6]],
  E:[[16.8,16.8],[22.8,16.6],[23,12.6],[18,12.9]],
  F:[[13,9.8],[19,8.6],[23.6,11],[18,12.9],[13,12.6],[7.2,11.8],[6.6,10]]
};
const M=(...m)=>m;
const VAGUES=[
  /* 1. apprendre en jouant (plus aucun texte, 25 novembre, 23 h) : un rôdeur tout seul, puis deux. Rien d'autre : c'est ici qu'on
        découvre l'ombre, l'embuscade, la flèche rouge du plaquage et la dague */
  {nom:'Les rôdeurs',
    groupes:[{porte:'p1',route:'C',m:M('chien')},{apres:1,porte:'p2',route:'B',m:M('chien','chien')}]},
  /* 2. un groupe soudé : touche l'un sans le tuer, tous te foncent dessus. D'abord le javelot et son garde, seuls ; puis un javelot
        avec son rôdeur (l'un te court dessus pendant que l'autre vise) */
  {nom:'Le javelot et son garde',
    groupes:[{porte:'p1',route:'C',m:M('dalle','javelot')},{apres:1,porte:'p2',route:'E',m:M('chien','javelot')}]},
  /* 3. le réparateur : laisser un blessé derrière soi, c'est tout refaire */
  {nom:'Le réparateur',
    groupes:[{porte:'p1',route:'F',m:M('faucheur','chien','repare','chien')},{apres:1,porte:'p2',route:'C',m:M('dalle','javelot','repare')}]},
  /* 4. deux groupes collés l'un à l'autre (le nœud du sifflet) */
  {nom:'Deux bandes pour une',
    groupes:[{porte:'p1',route:'F',m:M('belier','javelot')},{porte:'p2',route:'F',ri:5,m:M('chien','chien','chien')}]},
  /* 5. le garde qui charge, mêlé au faucheur (le nœud de Romain : la charge te colle pendant que la faux se lève) */
  {nom:'Le garde et le faucheur',
    groupes:[{porte:'p1',route:'C',m:M('dalle','faucheur','javelot')},{porte:'p2',route:'D',m:M('chien','chien')}]},
  /* 6. la batterie (le nœud de Romain : trois mortiers, deux gardes devant) */
  {nom:'La batterie',
    groupes:[{porte:'p1',m:M({t:'mortier',poste:[11.6,5.8],a:0.6},{t:'mortier',poste:[14.2,5.6],a:2.5},{t:'mortier',poste:[12.9,7.6],a:1.57},{t:'dalle',poste:[11.3,9.9],a:1.57},{t:'belier',poste:[14.5,9.9],a:1.57})},
      {porte:'p2',route:'B',m:M('chien','chien')}]},
  /* 7. trois groupes, trois colères : deux brutes réparées, la boule et son javelot, une meute */
  {nom:'Le rouleau',
    groupes:[{porte:'p1',route:'F',m:M('belier','repare','faucheur')},{porte:'p2',route:'B',m:M('cuirasse','javelot')},{porte:'p1',route:'D',m:M('chien','chien')}]},
  /* 8. le colosse, avec son réparateur : il faut tuer le petit AVANT de toucher au gros */
  {nom:'Le colosse',
    groupes:[{porte:'p1',route:'F',m:M('belier','repare','belier')},{porte:'p2',route:'E',m:M('chien','chien','chien')},{apres:1,porte:'p1',route:'C',m:M('colosse','repare')},{apres:1,avec:1,porte:'p2',m:M({t:'mortier',poste:[22.6,3.6],a:2.2})}]}
];
const CRIS=['Allez, allez !','Trouvez-le !','Attrapez-moi ça !','Écrasez-le !','Débusquez-le !'];
let grpN=0,groupesFaits=0,renforts=[],debutFait=false;
const DELAI_RENFORT=2.0;
function apparaitre(type,ou,spec,i){
  let x,y,tx,ty;
  if(ou==='g'){x=-0.8;y=9.4;tx=1.6;ty=9.4+rnd(-0.6,0.6);}
  else if(ou==='d'){x=RW+0.8;y=9.4;tx=RW-1.6;ty=9.4+rnd(-0.6,0.6);}
  else{const px0=ou==='p1'?8:18;x=px0+rnd(-0.3,0.3);y=0.2;tx=px0+(i%3-1)*0.9;ty=3.0+Math.floor(i/3)*0.7;porte[ou==='p1'?0:1]=1;}
  const g=nouveauGolem(type,x,y,tx,ty,spec);G.push(g);son('porte',x,y);return g;
}
function lancerGroupe(gr){
  const id=++grpN,route=gr.route?ROUTES[gr.route].filter(q=>!bloque[cel(q[0],q[1])]):null;
  /* les renforts : Grosbec grogne derrière la porte (version 10 : plus de cor), l'œil de la porte s'allume ; la bande sort deux secondes après */
  const pi=gr.porte==='p1'?0:gr.porte==='p2'?1:-1;
  son('renfort',pi===0?8:pi===1?18:13,1.3);if(pi>=0){alerteT[pi]=Math.max(alerteT[pi],DELAI_RENFORT+(gr.m.length-1)*0.5+0.25);}
  gr.m.forEach((m,i)=>{
    const o=typeof m==='string'?{t:m}:m;
    file.push({quand:phaseT+DELAI_RENFORT+i*0.5,type:o.t,ou:gr.porte,i,spec:{grp:id,route:o.poste?null:route,ri:gr.ri||0,poste:o.poste,a:o.a}});
  });
  renforts.push({id,morte:false});
}
function demarrerVague(i){
  vague=i;phase='vague';phaseT=0;file=[];tVague=0;groupesFaits=0;renforts=[];debutFait=false;dernierPlaquage=-9;
  /* la vie ne remonte plus entre les vagues : une barre et cinq bandages pour tout le combat */
  P.lentT=0;if(BLOQUE[P.etat]){P.etat='libre';P.t=0;}
  if(OBS.some(o=>o.plantee)){OBS=OBS.filter(o=>!o.plantee);majGrille();}
  javs=[];obus=[];leurres=[];
  /* on garde ce qu'il a en commençant cette vague : à terre, il pourra repartir d'ici */
  sauves[i]={hp:P.hp,bandages:P.bandages,cartes:Object.assign({},P.cartes)};
  const V=VAGUES[i];bandeau={a:`Vague ${i+1} / ${VAGUES.length}`,b:V.nom,t:tReel};majBoutons();
}
function majVagues(dt){
  phaseT+=dt;
  for(let i=0;i<2;i++){alerteT[i]-=dt;alerte[i]=alerteT[i]>0?Math.min(1,alerte[i]+dt*5):Math.max(0,alerte[i]-dt*2.5);}   /* l'œil des portes */
  for(const s of file)if(!s.fait&&phaseT>=s.quand){s.fait=true;apparaitre(s.type,s.ou,s.spec,s.i);}
  file=file.filter(s=>!s.fait);
  if(essai)return;                                    /* une scène d'essai : pas de vague */
  if(phase==='vague'){
    tVague+=dt;
    const V=VAGUES[vague];
    /* au début de la vague : toutes les bandes qui ne sont pas en réserve sont annoncées ensemble */
    if(!debutFait&&phaseT>=0.5){debutFait=true;while(groupesFaits<V.groupes.length&&!V.groupes[groupesFaits].apres)lancerGroupe(V.groupes[groupesFaits++]);}
    /* dès qu'une bande est entièrement tombée, la suivante de la réserve est annoncée (et celles qui entrent « avec » elle) */
    for(const b of renforts){
      if(b.morte||G.some(g=>g.grp===b.id&&g.etat!=='mort')||file.some(s=>s.spec.grp===b.id))continue;
      b.morte=true;
      if(groupesFaits<V.groupes.length){lancerGroupe(V.groupes[groupesFaits++]);while(groupesFaits<V.groupes.length&&V.groupes[groupesFaits].avec)lancerGroupe(V.groupes[groupesFaits++]);}
    }
    if(debutFait&&groupesFaits>=V.groupes.length&&phaseT>1.5&&!file.length&&!G.some(g=>g.etat!=='mort')){
      phase='fin';phaseT=0;stats.vieFin.push(Math.ceil(P.hp));sortirOmbre('fin');majBoutons();
      texte(P.x,P.y,2.3,'Vague nettoyée !','#9fe6c0');son('choix');
    }
  }else if(phase==='fin'&&phaseT>2.4){
    phase='';
    if(vague+1<VAGUES.length)demarrerVague(vague+1);else victoire();
  }
}
function passerVague(){for(const g of G)if(g.etat!=='mort'){g.etat='mort';g.t=0;g.zone=null;}file=[];groupesFaits=VAGUES[vague].groupes.length;debutFait=true;for(const b of renforts)b.morte=true;javs=[];obus=[];}

/* ======================= les particules ======================= */
function secousse(a){sec=Math.max(sec,a);}
function etincelles(x,y,z,c,n){for(let i=0;i<n;i++){const a=Math.random()*TAU,v=rnd(80,260);parts.push({k:'e',x,y,z,sx:Math.cos(a)*v,sy:Math.sin(a)*v-60,ox:0,oy:0,vie:rnd(.2,.45),max:.45,c});}}
function poussiere(x,y,s){for(let i=0;i<5;i++)parts.push({k:'p',x:x+rnd(-0.4,0.4)*s,y:y+rnd(-0.2,0.2)*s,z:0,sx:rnd(-30,30),sy:rnd(-30,-6),ox:0,oy:0,vie:rnd(.4,.8),max:.8,s:rnd(6,12)*s});}
function cailloux(g){const n=g.type==='colosse'?30:14,sz=g.type==='colosse'?1.8:1,acier=g.T.armure;for(let i=0;i<n;i++){const a=rnd(-Math.PI,0),v=rnd(60,220);parts.push({k:'c',x:g.x+rnd(-0.3,0.3),y:g.y+rnd(-0.2,0.2),z:g.T.h*0.5,sx:Math.cos(a)*v,sy:Math.sin(a)*v-60,ox:0,oy:0,sol:rnd(-4,8),vie:rnd(1.4,2.2),max:2.2,s:rnd(4,9)*sz,r:Math.random()*6,vr:rnd(-8,8),c:acier?(Math.random()<.5?'#aab8c6':'#5a6674'):Math.random()<.25?'#8a6a30':Math.random()<.5?'#3a3d45':'#4f545e'});}parts.push({k:'tas',x:g.x,y:g.y,z:0,ox:0,oy:0,s:sz,vie:3.5,max:3.5});}
function eclatBrise(x,y,z,s){for(let i=0;i<16*s;i++){const a=Math.random()*TAU,v=rnd(100,320);parts.push({k:'cr',x,y,z,sx:Math.cos(a)*v,sy:Math.sin(a)*v,ox:0,oy:0,vie:rnd(.3,.6),max:.6,s:rnd(3,5)});}parts.push({k:'onde',x,y,z,ox:0,oy:0,vie:.35,max:.35,s});}
function eclatOmbre(x,y,z){for(let i=0;i<12;i++){const a=Math.random()*TAU,v=rnd(40,150);parts.push({k:'o',x,y,z,sx:Math.cos(a)*v,sy:Math.sin(a)*v*0.6-30,ox:0,oy:0,vie:rnd(.3,.6),max:.6,s:rnd(5,11)});}}
function eclatsBois(x,y){for(let i=0;i<8;i++){const a=Math.random()*TAU,v=rnd(60,200);parts.push({k:'c',x,y,z:0.9,sx:Math.cos(a)*v,sy:Math.sin(a)*v-50,ox:0,oy:0,sol:rnd(18,28),vie:1,max:1,s:rnd(3,6),r:Math.random()*6,vr:rnd(-10,10),c:'#8a6236'});}son('casse',x,y);}
let texteN=0,texteT=-9;
function texte(x,y,z,t,c){if(tReel-texteT>0.35)texteN=0;texteT=tReel;parts.push({k:'t',x,y,z,ox:0,oy:-(texteN++%3)*18,t,c,vie:1.15,max:1.15});}
function majParts(dt){
  for(const q of parts){
    q.vie-=dt;
    if(q.k==='c'){q.sy+=650*dt;q.ox+=q.sx*dt;q.oy+=q.sy*dt;q.r+=q.vr*dt;const sol=(q.z*ZH)+q.sol;if(q.oy>sol){q.oy=sol;q.sy*=-0.25;q.sx*=0.5;q.vr*=0.5;}}
    else if(q.k==='e'||q.k==='cr'||q.k==='p'||q.k==='o'){q.ox+=q.sx*dt;q.oy+=q.sy*dt;q.sx*=0.92;q.sy*=0.92;if(q.k==='e')q.sy+=220*dt;}
    else if(q.k==='t')q.oy-=30*dt;
  }
  parts=parts.filter(q=>q.vie>0);if(parts.length>380)parts.splice(0,parts.length-380);
}
