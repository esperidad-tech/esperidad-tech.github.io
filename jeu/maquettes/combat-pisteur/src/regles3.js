/* ======================= les projectiles, les ondes, les bêtes ======================= */
const porte=[0,0];
function clouer(g,d){if(!vivant(g))return;sonner(g,d);g.cloueJ=tReel+d;texte(g.x,g.y,g.T.h+0.3,'Cloué !','#bff6ff');}
function majProjectiles(dt){
  for(const f of fleches){
    const n=Math.ceil(f.v*dt/0.15);
    for(let s=0;s<n&&!f.fini;s++){
      f.x+=Math.cos(f.a)*f.v*dt/n;f.y+=Math.sin(f.a)*f.v*dt/n;f.L+=f.v*dt/n;
      if(f.L>(f.vise||f.rayon?24:14)||horsSalle(f.x,f.y,0)){f.fini=true;break;}
      if(!f.rayon&&!(f.vise&&f.cloche)&&obsEn(f.x,f.y,0.05,!!f.haut)){f.fini=true;etincelles(f.x,f.y,0.9,'#bff6ff',4);break;}
      for(const g of G){
        if(!vivant(g)||f.touches.indexOf(g)>=0)continue;
        if(hyp(g.x-f.x,g.y-f.y)<g.r+0.14){
          f.touches.push(g);
          const marque=tReel<g.marque,dmg=f.dmg*(marque&&P.up.patient?1.5:1);
          const ok=blesserG(g,dmg,f.x-Math.cos(f.a),f.y-Math.sin(f.a),f.silence?'silence':'fleche',0.15,{parDessus:f.haut||f.cloche});
          if(ok&&vivant(g)){
            if(P.up.marquante)g.marque=tReel+6;
            if(marque&&P.up.clouante)clouer(g,1);
            if(f.pin)clouer(g,f.pin);
            if(P.up.clou&&!f.vise&&g.etat==='charge'){sonner(g,3);texte(g.x,g.y,g.T.h+0.3,'Arrêté net !','#bff6ff');}
            if(f.silence&&garde!=='alerte'&&!f.pin)g.enquete={x:P.x,y:P.y};
          }
          if(ok&&g.etat==='mort'&&f.vise&&P.up.aube)P.arcCD=0;
          if(f.vise&&ok)texte(g.x,g.y,g.T.h+0.6,'Point faible !','#bff6ff');
          if(!ok||f.touches.length>=f.perce)f.fini=true;
          break;
        }
      }
    }
  }
  fleches=fleches.filter(f=>!f.fini);
  for(const j of javs){
    const n=Math.ceil(j.v*dt/0.15);
    for(let s=0;s<n&&!j.fini;s++){
      const px0=j.x,py0=j.y;j.x+=Math.cos(j.a)*j.v*dt/n;j.y+=Math.sin(j.a)*j.v*dt/n;j.L+=j.v*dt/n;
      if(j.joueur){
        let tg=null;for(const g of G){if(!vivant(g))continue;if(hyp(g.x-j.x,g.y-j.y)<g.r+0.25){tg=g;break;}}
        if(tg){const muet=j.ombre&&P.up.volees;blesserG(tg,3,px0-Math.cos(j.a),py0-Math.sin(j.a),'javjoueur',0.8,{muet});if(muet)clouer(tg,3);j.fini=true;eclatsBois(j.x,j.y);break;}
        if(j.L>15||horsSalle(j.x,j.y,0)||obsEn(j.x,j.y,0.05,false)){j.fini=true;eclatsBois(j.x,j.y);break;}
      }else{
        if(hyp(P.x-j.x,P.y-j.y)<0.5&&!j.aTouche){j.aTouche=true;if(toucherP(1,px0,py0,1.0)){j.fini=true;planter(j,P.x+rnd(-0.4,0.4),P.y+rnd(0.2,0.5));break;}}
        if(j.L>14||horsSalle(j.x,j.y,0.2)||obsEn(j.x,j.y,0.05,false)){j.fini=true;planter(j,px0,py0);break;}
      }
    }
  }
  javs=javs.filter(j=>!j.fini);
  for(const o of obus){
    o.t+=dt;
    if(o.t>=o.dur&&!o.fini){
      o.fini=true;son('impact');secousse(3);etincelles(o.x1,o.y1,0.2,'#ff8a3a',12);poussiere(o.x1,o.y1,1.4);parts.push({k:'onde',x:o.x1,y:o.y1,z:0,ox:0,oy:0,vie:.3,max:.3,s:1.2});
      if(hyp(P.x-o.x1,P.y-o.y1)<1.15)toucherP(1,o.x1,o.y1,1.2);
      for(const g of G)if(vivant(g)&&g.type!=='mortier'&&hyp(g.x-o.x1,g.y-o.y1)<1.0+g.r*0.5)blesserG(g,1,o.x1,o.y1,'obus',0.6);
    }
  }
  obus=obus.filter(o=>!o.fini);
  for(const w of ondes){
    w.r+=w.v*dt;
    if(w.deja)continue;
    const dx=P.x-w.x,dy=P.y-w.y,d=hyp(dx,dy),i=Math.round(((Math.atan2(dy,dx)+TAU)%TAU)/TAU*64)&63;
    if(Math.abs(d-w.r)<w.ep/2+0.32){
      if(w.r<=w.lim[i]+0.2){
        w.deja=true;const bond=P.etat==='bond',touche=toucherP(2,w.x,w.y,1.6);
        if(!touche&&bond&&P.up.echoOnde&&w.de&&vivant(w.de)){sonner(w.de,3);blesserG(w.de,6,P.x,P.y,'pousse',0);texte(w.de.x,w.de.y,w.de.T.h+0.3,'Renvoyée !','#ffcf9a');w.max=w.r;}
      }else if(!w.abri){w.abri=true;w.deja=true;texte(P.x,P.y,1.9,"À l'abri !",'#9fe6c0');stats.abris++;}
    }
  }
  ondes=ondes.filter(w=>w.r<w.max);
  for(const f of feux)f.t-=dt;feux=feux.filter(f=>f.t>0);
  if(P.up.sifflet&&phase==='vague'){loupT-=dt;if(loupT<=0){loupT=P.up.meute?8:15;lacherLoup();}}
  for(const l of loups){
    l.x+=l.dir*12*dt;l.pas+=dt*20;
    for(const g of G){if(!vivant(g)||l.touches.indexOf(g)>=0)continue;if(Math.abs(g.x-l.x)<g.r+0.5&&Math.abs(g.y-l.y)<g.r+0.6){l.touches.push(g);blesserG(g,2,l.x-l.dir,l.y,'loup',1.0);if(vivant(g)&&g.type!=='colosse')sonner(g,1.6);}}
    if(Math.random()<dt*14)poussiere(l.x-l.dir*0.5,l.y,0.7);
  }
  loups=loups.filter(l=>l.x>-2&&l.x<RW+2);
}
function planter(j,x,y){
  x=clamp(x,0.8,RW-0.8);y=clamp(y,1.9,RD-0.6);
  for(let k=0;k<12&&obsEn(x,y,0.3,false);k++){x-=Math.cos(j.a)*0.25;y-=Math.sin(j.a)*0.25;}
  items.push({x,y,a:j.a,owner:j.owner});son('planter');
  dire('plante2',"Son javelot est planté par terre. Il va vouloir le récupérer… à moins que tu le prennes avant.");
}
function lacherLoup(tireur){
  const viv=G.filter(vivant);if(!viv.length)return;
  let c=null;
  if(tireur){let bd=-1;for(const g of viv)if(g.type==='mortier'||g.type==='javelot'){const d=hyp(g.x-P.x,g.y-P.y);if(d>bd){bd=d;c=g;}}}
  if(!c)c=viv[Math.floor(Math.random()*viv.length)];
  const dir=Math.random()<.5?1:-1;
  loups.push({x:dir>0?-1:RW+1,y:c.y,dir,pas:0,touches:[]});son('betes');
  dire('loup1',"Une bête d'Elyra ! Elle a choisi son camp.");
}

/* ======================= les vagues ======================= */
const R1=(t,meute)=>({t,role:'ronde',meute}),E1=t=>({t,role:'embuscade'}),PO=(t,role,x,y,a)=>({t,role,poste:[x,y],a:a==null?Math.PI/2:a});
const VAGUES=[
  {nom:'La meute',enrage:80,txt:"Trois rôdeurs font leur ronde. Derrière un mur, ils ne te voient pas : attends ton moment, et frappe dans un dos.",
    groupes:[[R1('chien',1),R1('chien',1),R1('chien',1)],[E1('chien'),E1('chien'),R1('chien',2)],[R1('chien',3),R1('chien',3),E1('chien')]]},
  {nom:'Le javelot et la dalle',enrage:90,txt:"Le javelot marche à l'abri derrière le porte-dalle. Pour l'atteindre, il faut d'abord contourner la dalle.",
    groupes:[[R1('dalle',3),{t:'javelot',role:'escorte'},R1('chien',4),R1('chien',4)],[PO('javelot','garde',13,5.2),E1('chien'),E1('chien')],[R1('dalle',5),{t:'javelot',role:'escorte'},R1('chien',5)]]},
  {nom:'Le bélier garde le passage',enrage:90,txt:"Un rôdeur traîne tout seul, bien en vue. Trop beau pour être vrai : le bélier attend dans l'axe.",
    groupes:[[PO('belier','garde',13,5.6),PO('chien','appat',13,11.8),E1('chien'),E1('chien')],[PO('mortier','garde',4,3.3,0.9),R1('chien',5),R1('chien',5)],[R1('chien',6),R1('chien',6),R1('chien',6),PO('javelot','garde',22,3.4,2.2)]]},
  {nom:'Le faucheur',enrage:95,txt:"Le faucheur ferme le passage du milieu. Son balai fait très mal, mais il met du temps à se relever.",
    groupes:[[PO('faucheur','barrage',13,9.6),PO('mortier','garde',21.6,3.3,2.2),R1('chien',6),R1('chien',6)],[R1('faucheur',7),R1('javelot',7),E1('chien')],[PO('mortier','garde',4,3.3,0.9),R1('dalle',8),E1('chien'),E1('chien')]]},
  {nom:'Le cuirassé',enrage:105,txt:"Un cuirassé. Ni la dague ni les flèches ne percent son armure : il faut le frapper en traître. Trois fois.",
    groupes:[[R1('cuirasse',0),R1('chien',8),R1('chien',8),R1('chien',8)],[R1('dalle',9),{t:'javelot',role:'escorte'},PO('mortier','garde',13,4.8)],[R1('cuirasse',0),R1('chien',10),R1('chien',10)]]},
  {nom:'La batterie',enrage:100,txt:"Trois mortiers, bien gardés. Sous les obus, on ne reste jamais longtemps au même endroit.",
    groupes:[[PO('mortier','garde',8,3.6),PO('mortier','garde',18,3.6),R1('dalle',10),R1('chien',11),R1('chien',11)],[PO('mortier','garde',13,4.8),R1('faucheur',0),E1('chien'),E1('chien')],[R1('belier',0),PO('javelot','garde',13,5.2),R1('chien',12),R1('chien',12)]]},
  {nom:'La grande meute',enrage:105,txt:"Deux meutes, et un bélier pour rabattre. Grosbec ne laisse plus personne seul.",
    groupes:[[R1('chien',12),R1('chien',12),R1('chien',12),PO('belier','garde',3.2,6.5,0.5)],[R1('chien',13),R1('chien',13),R1('chien',13),PO('mortier','garde',21.6,3.3,2.2)],[R1('faucheur',14),R1('cuirasse',14),R1('chien',14)]]},
  {nom:'Le colosse',enrage:120,txt:"Le colosse ! Son onde se brise sur les piliers et les grands murs. Et toute la garde fait tout pour te débusquer.",
    groupes:[[R1('colosse',0),R1('chien',15),R1('chien',15),PO('mortier','garde',21.6,3.3,2.2)],[R1('cuirasse',0),PO('javelot','garde',13,5.2),R1('dalle',16)],[R1('faucheur',17),R1('chien',17),R1('chien',17)]]}
];
const CRIS=['Allez, allez !','Trouvez-le !','Attrapez-moi ça !','Écrasez-le !','Allez, allez, allez !'];
function demarrerVague(i){
  vague=i;groupeI=0;phase='vague';phaseT=0;file=[];dernierGroupe=-99;loupT=8;tVague=0;tCacheCumul=0;
  garde='calme';nVus=0;tSansVue=0;P.cache=true;P.capeGaze=2;P.leurreVague=false;P.ombreProt=true;
  Object.assign(DIR,{patrouille:false,groupes:false,debusque:false,assaut:false,nAss:0,ordreT:-9,fils:[],seulT:0});
  /* son regard part du côté opposé au Pisteur, et laisse le temps de se mettre à l'abri (surtout à la première vague) */
  {const g=P.x<GBX;Object.assign(DIR.oeil,{a:g?0.25+Math.random()*0.3:Math.PI-0.25-Math.random()*0.3,sens:g?1:-1,boost:1,sur:0,aveugle:tReel+(i===0?12:5)});}
  if(OBS.some(o=>o.plantee)){OBS=OBS.filter(o=>!o.plantee);majGrille();}
  items=[];nuages=[];leurres=[];
  const V=VAGUES[i];bandeau={a:`Vague ${i+1} / ${VAGUES.length}`,b:V.nom,t:tReel};dire(null,V.txt,true);son('cor');majBoutons();
}
let porteAlt=0;
function lancerGroupe(liste){
  dernierGroupe=phaseT;gbGeste('envoi',porteAlt%2?1:-1);gbDire(CRIS[Math.floor(Math.random()*CRIS.length)]);son('allez');
  const base=porteAlt++;
  liste.forEach((spec,i)=>{let o=['p1','p2'][(base+(spec.meute?0:i))%2];if(spec.t==='colosse')o='p1';if(spec.poste)o=spec.poste[0]<13?'p1':'p2';file.push({spec,o,quand:phaseT+0.5+i*0.45});});
}
function majVagues(dt){
  phaseT+=dt;
  for(const s of file)if(!s.fait&&phaseT>=s.quand){s.fait=true;apparaitre(s.spec,s.o);}
  file=file.filter(s=>!s.fait);
  if(phase==='vague'){
    const V=VAGUES[vague],viv=G.filter(g=>g.etat!=='mort').length+file.length;
    if(groupeI<V.groupes.length){if(phaseT>1.0&&phaseT-dernierGroupe>1.5&&(viv<=1||(viv<=2&&phaseT-dernierGroupe>20)))lancerGroupe(V.groupes[groupeI++]);}
    else if(viv===0){phase='fin';phaseT=0;gbGeste('touche',1);gbDire(vague+1<VAGUES.length?'GRRR… Encore !':'ASSEZ !');garde='calme';P.cache=true;majBoutons();}
  }else if(phase==='fin'&&phaseT>1.6){
    phase='';
    if(vague+1<VAGUES.length)ouvrirChoix();else victoire();
  }
}
function passerVague(){for(const g of G)if(g.etat!=='mort')tuer(g);file=[];groupeI=VAGUES[vague].groupes.length;items=[];javs=[];obus=[];ondes=[];}

/* ======================= le choix d'une carte ======================= */
const choixEl=$('choix'),cartesEl=$('cartes');
let choixDispo=[];
function ouvrirChoix(){
  const pris=tirerCartes(P);choixDispo=pris;
  cartesEl.innerHTML=pris.map((c,i)=>{
    const paire=menePaire(c,P.up);
    return `<div class="pouvoir${c.doree?' doree':''}"><div class="fam">${c.doree?'★ Carte dorée':FAMILLES[c.f][0]+' '+FAMILLES[c.f][1]}</div><div class="ic">${c.ic}</div><b>${c.nom}</b>`+
      (c.doree?`<p><span class="v">Caché :</span> ${c.c}</p><p><span class="o">À découvert :</span> ${c.d}</p>`:`<p>${c.txt}</p>`)+
      (paire?`<p class="paire">${paire}</p>`:'')+
      `<div class="pied"><button class="hp" data-lire>🔊</button><button class="jaune" data-i="${i}">Prendre</button></div></div>`;}).join('');
  choixOuvert=true;choixEl.classList.add('on');son('choix');cacherMsg();
  $('choixTxt').textContent=pris.some(c=>c.doree)?"Une carte dorée ! Elle a deux effets : un quand tu es caché, un quand tu es à découvert.":"La vague est tombée. Une carte pour la suivante : tout marche tout seul, rien à appuyer de plus.";
  for(const b of cartesEl.querySelectorAll('button.jaune'))b.onclick=()=>prendre(pris[+b.dataset.i]);
}
function prendre(c){
  P.up[c.id]=1;stats.pouvoirs.push(c.nom);
  if(c.id==='coeur'){P.max+=2;P.coeurs=P.max;}else P.coeurs=Math.min(P.max,P.coeurs+1);
  if(c.id==='deuxBonds')P.charges=2;
  choixOuvert=false;choixEl.classList.remove('on');dernier=performance.now();
  demarrerVague(vague+1);
}

/* ======================= les particules ======================= */
function secousse(a){sec=Math.max(sec,a);}
function etincelles(x,y,z,c,n){for(let i=0;i<n;i++){const a=Math.random()*TAU,v=rnd(80,260);parts.push({k:'e',x,y,z,sx:Math.cos(a)*v,sy:Math.sin(a)*v-60,ox:0,oy:0,vie:rnd(.2,.45),max:.45,c});}}
function poussiere(x,y,s){for(let i=0;i<5;i++)parts.push({k:'p',x:x+rnd(-0.4,0.4)*s,y:y+rnd(-0.2,0.2)*s,z:0,sx:rnd(-30,30),sy:rnd(-30,-6),ox:0,oy:0,vie:rnd(.4,.8),max:.8,s:rnd(6,12)*s});}
function cailloux(g){const n=g.type==='colosse'?30:14,sz=g.type==='colosse'?1.8:1,acier=g.T.armure;for(let i=0;i<n;i++){const a=rnd(-Math.PI,0),v=rnd(60,220);parts.push({k:'c',x:g.x+rnd(-0.3,0.3),y:g.y+rnd(-0.2,0.2),z:g.T.h*0.5,sx:Math.cos(a)*v,sy:Math.sin(a)*v-60,ox:0,oy:0,sol:rnd(-4,8),vie:rnd(1.4,2.2),max:2.2,s:rnd(4,9)*sz,r:Math.random()*6,vr:rnd(-8,8),c:acier?(Math.random()<.5?'#aab8c6':'#5a6674'):Math.random()<.25?'#8a6a30':Math.random()<.5?'#3a3d45':'#4f545e'});}parts.push({k:'tas',x:g.x,y:g.y,z:0,ox:0,oy:0,s:sz,vie:3.5,max:3.5});}
function eclatBrise(x,y,z,s){for(let i=0;i<16*s;i++){const a=Math.random()*TAU,v=rnd(100,320);parts.push({k:'cr',x,y,z,sx:Math.cos(a)*v,sy:Math.sin(a)*v,ox:0,oy:0,vie:rnd(.3,.6),max:.6,s:rnd(3,5)});}parts.push({k:'onde',x,y,z,ox:0,oy:0,vie:.35,max:.35,s});}
function eclatOmbre(x,y,z){for(let i=0;i<12;i++){const a=Math.random()*TAU,v=rnd(40,150);parts.push({k:'o',x,y,z,sx:Math.cos(a)*v,sy:Math.sin(a)*v*0.6-30,ox:0,oy:0,vie:rnd(.3,.6),max:.6,s:rnd(5,11)});}}
function eclatsBois(x,y){for(let i=0;i<8;i++){const a=Math.random()*TAU,v=rnd(60,200);parts.push({k:'c',x,y,z:0.9,sx:Math.cos(a)*v,sy:Math.sin(a)*v-50,ox:0,oy:0,sol:rnd(18,28),vie:1,max:1,s:rnd(3,6),r:Math.random()*6,vr:rnd(-10,10),c:'#8a6236'});}son('casse');}
function debrisDalle(g){for(let i=0;i<14;i++){const a=Math.random()*TAU,v=rnd(60,220);parts.push({k:'c',x:g.x+Math.cos(g.fa)*0.6,y:g.y+Math.sin(g.fa)*0.6,z:1,sx:Math.cos(a)*v,sy:Math.sin(a)*v-60,ox:0,oy:0,sol:rnd(30,44),vie:1.8,max:1.8,s:rnd(5,10),r:Math.random()*6,vr:rnd(-8,8),c:'#5a5f6c'});}}
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
