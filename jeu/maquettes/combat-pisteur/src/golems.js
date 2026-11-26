/* ======================= les huit golems (Bible §17.15 et §17.16) =======================
   Chacun a trois choses : une façon de bouger, un coup de base (jamais de rouge), un coup spécial (annoncé en rouge).
   reac : le temps qu'il met à réagir (plus il est gros, plus c'est long) ; tour : sa vitesse pour se tourner. */
const GT={
  chien:{nom:'rôdeur',hp:30,r:0.38,vit:3.3,tour:8,h:0.8,cone:1.0,reac:0.1,m:'trotteur',sc:0.55,pas:0.9},
  javelot:{nom:'javelot',hp:50,r:0.4,vit:3.2,tour:7,h:1.15,cone:0.9,reac:0.05,m:'danseur',sc:0.6,pas:1.0},
  dalle:{nom:'porte-dalle',hp:80,r:0.56,vit:2.4,tour:3,h:1.2,cone:0.9,reac:0.65,m:'bouclier',sc:0.6,pas:1.0},
  faucheur:{nom:'faucheur',hp:80,r:0.5,vit:2.6,tour:3.5,h:1.4,cone:0.9,reac:0.65,m:'soldat',sc:0.6,pas:1.1},
  mortier:{nom:'mortier',hp:30,r:0.5,vit:1.4,tour:2.5,h:1.15,cone:0.9,reac:0.4,m:'lanceur',sc:0.58,pas:1.0},
  belier:{nom:'bélier',hp:80,r:0.62,vit:2.6,tour:2.1,h:1.1,cone:0.9,reac:0.05,m:'fonceur',sc:0.62,pas:1.1,raide:1},
  cuirasse:{nom:'cuirassé',hp:90,r:0.5,vit:1.7,tour:2.5,h:1.45,cone:0.9,reac:0.7,m:'cuirasse',sc:0.58,pas:1.1,armure:1},
  colosse:{nom:'colosse',hp:250,r:1.05,vit:1.5,tour:1.6,h:2.6,cone:1.0,reac:1.1,m:'gros',sc:0.86,pas:1.6},
  /* le neuvième (25 novembre, 22 h) : le réparateur. Fragile (une embuscade le tue), aucun dégât : il répare les blessés de son groupe. */
  repare:{nom:'réparateur',hp:30,r:0.42,vit:2.7,tour:5,h:1.15,cone:0.9,reac:0.4,m:'reparateur',sc:0.6,pas:0.95}
};
function nouveauGolem(type,x,y,tx,ty,spec){
  const TT=GT[type];spec=spec||{};
  return {type,T:TT,x,y,z:0,r:TT.r,hp:TT.hp,max:TT.hp,vit:TT.vit,etat:'entre',t:0,fa:Math.PI/2,reg:Math.PI/2,regC:Math.PI/2,tx,ty,
    mode:'ronde',su:{x,y},suT:-99,bruit:false,voit:false,rem:0,hes:0,reagit:0,sonne:0,reveil:false,lentT:0,
    cd:rnd(0.1,0.4),cdS:rnd(1.2,2.6),cdM:rnd(0.3,1.2),zone:null,flash:0,marche:0,dirM:Math.PI/2,bouge:false,tFrappe:-9,excl:0,inter:0,id:Math.random(),
    grp:spec.grp||0,route:spec.route||null,ri:spec.ri||0,poste:spec.poste?{x:spec.poste[0],y:spec.poste[1]}:null,posteA:spec.a==null?Math.PI/2:spec.a,
    aDalle:type==='dalle',pauseT:-9,pauseD:2,ch:null,chT:-9,chX:0,chY:0,fouilleT:0,fouilleA:0,recup:0.3,va:0,vL:0,lim:null,
    sx:0,sy:0,ex:0,ey:0,tirX:null,tirY:0,aTouche:false,touches:null,parcouru:0,balai:null,vx:x,vy:y,jamaisVu:true,yaw:0,vuMaint:true,
    colere:false,pi:0,piT:0,colle:null,furie:false,fenetre:0,fantome:false,boule:false,aRoule:false,tChoc:-9,enrage:false,zk:'',sac:null,but:null,butT:0,aveugle:false,accroche:false,
    rue:-9,dechaine:false,dort:false,leurre:null,soin:null,soinT:0,penche:false};
}

/* ======================= voir et entendre : un golem sait ce qu'il a vu lui-même, et ce qu'a vu son groupe =======================
   Le regard d'un golem, c'est l'éventail dessiné au sol devant lui : c'est le dessin qui fait foi. Un mur l'arrête toujours.
   À découvert, il porte loin (10 pas), mais jamais dans le dos du golem, et jamais plus loin que l'écran du joueur : un golem
   que le joueur n'a pas sous les yeux ne voit pas le Pisteur (Romain : « sinon c'est pas juste »).
   Dans l'ombre, l'éventail reste court (3 pas), avec une demi-seconde d'hésitation. */
/* ce que le joueur a sous les yeux, là où l'image se pose quand le Pisteur est immobile : la marge autour d'un point, en points d'écran */
function margeEcran(x,y){
  const cxI=SW<Ws?(SW-Ws)/2:clamp(px(P.x)-Ws/2,0,SW-Ws),cyI=SH<Hs?(SH-Hs)/2:clamp(py(P.y,0)-34-Hs*0.54,58,SH-Hs);
  const X=px(x)-cxI,Y=py(y,0)-cyI;
  return Math.min(X,Ws-X,Y-20,Hs+16-Y);
}
function voitBrut(g){
  if(!vivant(g)||g.sonne>0||g.dort||P.etat==='aterre')return false;
  if(P.ombre&&P.capeT>0)return false;                          /* la cape d'ombre : dix secondes où aucun regard ne le trouve */
  if(g.penche)return false;                                    /* le réparateur penché sur un blessé ne regarde rien d'autre */
  if(g.etat==='roule'||g.etat==='ramasse')return false;       /* en boule, le cuirassé ne voit plus rien */
  if(g.enrage)return true;                                     /* le colosse blessé ne lâche plus le Pisteur */
  const dx=P.x-g.x,dy=P.y-g.y,d=hyp(dx,dy);
  if(P.ombre){
    if(d>REG.ombre.portee)return false;
    if(Math.abs(ang(Math.atan2(dy,dx)-g.reg))>REG.ombre.cone)return false;
  }else if(d>g.r+0.55){                                        /* (s'il lui rentre dedans, le golem le sent, même de dos) */
    if(d>REG.vue.portee)return false;
    if(Math.abs(ang(Math.atan2(dy,dx)-g.reg))>g.T.cone)return false;
    if(margeEcran(g.x,g.y)<REG.vue.marge)return false;
  }
  return vue(g.x,g.y,P.x,P.y);
}
/* un golem voit-il cet endroit (un copain qui tombe, par exemple) ? Le même regard qu'à découvert. */
function voitPoint(o,x,y){
  const dx=x-o.x,dy=y-o.y,d=hyp(dx,dy);
  return d<=REG.vue.portee&&Math.abs(ang(Math.atan2(dy,dx)-o.reg))<=o.T.cone&&vue(o.x,o.y,x,y);
}
/* jusqu'où porte un regard dans une direction : le premier mur ou le premier obstacle sur la ligne (calcul exact et rapide,
   pour dessiner les longs éventails sans peser sur la vitesse) */
function porteeRegard(x,y,a,max){
  const c=Math.cos(a),s=Math.sin(a);let L=max;
  if(c>1e-6)L=Math.min(L,(RW-0.2-x)/c);else if(c<-1e-6)L=Math.min(L,(0.2-x)/c);
  if(s>1e-6)L=Math.min(L,(RD-0.2-y)/s);else if(s<-1e-6)L=Math.min(L,(Y0-y)/s);
  for(const o of OBS){
    if(o.fond)continue;
    if(o.c){
      const dx=o.x-x,dy=o.y-y,u=dx*c+dy*s;if(u<=0)continue;
      const r=o.r+0.04,q=r*r-(dx*dx+dy*dy-u*u);if(q<=0)continue;
      const e=u-Math.sqrt(q);if(e>0&&e<L)L=e;
    }else{
      const hx=o.w/2+0.04,hy=o.d/2+0.04;let t0=0,t1=L;
      if(Math.abs(c)<1e-9){if(Math.abs(x-o.x)>hx)continue;}
      else{let a1=(o.x-hx-x)/c,a2=(o.x+hx-x)/c;if(a1>a2){const w=a1;a1=a2;a2=w;}if(a1>t0)t0=a1;if(a2<t1)t1=a2;if(t0>t1)continue;}
      if(Math.abs(s)<1e-9){if(Math.abs(y-o.y)>hy)continue;}
      else{let a1=(o.y-hy-y)/s,a2=(o.y+hy-y)/s;if(a1>a2){const w=a1;a1=a2;a2=w;}if(a1>t0)t0=a1;if(a2<t1)t1=a2;if(t0>t1)continue;}
      if(t0<L)L=t0;
    }
  }
  return Math.max(0,L);
}
let dernierVuT=-9;
function majPerception(dt){
  let n=0;const gv={};
  for(const g of G){
    const av=g.voit;
    if(!vivant(g)||g.dort){g.voit=false;g.rem=0;g.hes=0;continue;}
    const brut=voitBrut(g);
    if(P.ombre){
      /* entré dans l'éventail, le Pisteur n'est pas repéré tout de suite : une demi-seconde d'hésitation, le temps de reculer */
      g.voit=false;g.rem=0;
      if(brut){g.hes+=dt/REG.ombre.hesite;if(g.hes>=1){g.hes=0;sortirOmbre('vu');g.rem=1;g.voit=true;}}
      else g.hes=Math.max(0,g.hes-dt*2.5);
    }else{
      g.hes=0;
      if(brut){g.rem=Math.min(1,g.rem+dt/(g.mode==='chasse'?0.1:REG.vue.voir));g.voit=g.rem>=1;}
      else{g.rem=Math.max(0,g.rem-dt*3);g.voit=false;}
    }
    if(g.voit){
      /* il vient de le voir : le son qui le dit — quand plus personne ne le voyait depuis une bonne seconde, ou quand ce golem-là n'était pas déjà à ses trousses
         (pas à chaque fois qu'un bélier le perd des yeux une demi-seconde : le signal ne voudrait plus rien dire) */
      if(!av&&(tReel-dernierVuT>1.2||g.mode!=='chasse'))son('repere',g);
      n++;gv[g.grp]=1;g.su.x=P.x;g.su.y=P.y;g.suT=tReel;g.bruit=false;g.leurre=null;
      if(g.type==='mortier'&&!g.dechaine)dechainer(g);          /* le mortier qui VOIT le Pisteur ne s'arrêtera plus de tirer */
      /* ils viennent de voir tomber ou crier un des leurs, et voilà le Pisteur : ils ont compris */
      if(grpFrappe[g.grp]!=null&&tReel-grpFrappe[g.grp]<REG.colere.lien)facher(g.grp);
      if(g.mode!=='chasse'){
        g.mode='chasse';g.reagit=g.T.reac;g.excl=tReel+0.8;g.ch=null;
        stats.alerte1=1;
      }
    }
  }
  /* un groupe est soudé : ce que l'un voit, les autres du groupe le savent aussitôt et rappliquent. Les autres groupes ne savent rien. */
  for(const g of G){
    if(!gv[g.grp]||g.voit||!vivant(g)||g.sonne>0||g.dort)continue;
    g.su.x=P.x;g.su.y=P.y;g.suT=tReel;g.bruit=false;g.leurre=null;
    if(g.mode!=='chasse'){
      g.mode='chasse';g.reagit=g.T.reac;g.excl=tReel+0.8;g.ch=null;
    }
  }
  /* la meute en colère : tant qu'elle voit le Pisteur, sa piste repart de là ; et si elle le rattrape dans l'ombre, elle le trouve au flair */
  const finP=pisteBase+piste.length-1;nFlair=0;
  for(const g of G){
    if(gv[g.grp]){g.pi=finP;g.piT=tReel;}
    if(g.type!=='chien'||!g.colere||!vivant(g)||g.sonne>0||g.dort)continue;
    nFlair++;
    if(P.ombre&&P.capeT<=0&&P.etat!=='embuscade'&&P.etat!=='assomme'&&P.etat!=='sautOmbre'&&hyp(P.x-g.x,P.y-g.y)<g.r+REG.chien.nez&&vue(g.x,g.y,P.x,P.y)){
      sortirOmbre('flaire');g.rem=1;g.voit=true;g.su.x=P.x;g.su.y=P.y;g.suT=tReel;g.bruit=false;g.reagit=Math.max(g.reagit,0.3);g.excl=tReel+0.8;
    }
  }
  grpVoit=gv;
  if(nVoient>0&&n===0&&phase==='vague'&&P.etat!=='aterre'){
    stats.semes++;
  }
  nVoient=n;if(n>0)dernierVuT=tReel;
  if(phase==='vague'){if(P.ombre)stats.tOmbre+=dt;else if(n>0)stats.tVu+=dt;}
}
/* un bruit : le golem sait d'où il vient, pas où est le Pisteur ; il va voir */
function avertir(o,x,y,seul){
  if(!seul)for(const m of G)if(m!==o&&m.grp===o.grp)avertir(m,x,y,true);       /* et tout son groupe avec lui */
  if(!vivant(o)||o.sonne>0||o.voit||o.dort)return;
  if(o.mode==='chasse'&&!o.bruit&&tReel-o.suT<2)return;       /* il sait déjà mieux que ça */
  if(o.leurre&&tReel<o.leurre.t)return;                       /* il est parti voir d'où venait le coup de sifflet */
  o.su.x=x;o.su.y=y;o.suT=tReel;o.bruit=true;o.ch=null;
  if(o.mode!=='chasse'){o.mode='chasse';o.reagit=o.T.reac+0.15;o.inter=tReel+1.5;}
}
/* un golem touché qui n'est pas mort crie : ceux d'à côté sont avertis (et leur groupe), et tout son groupe à lui, même loin */
function crier(g){
  son('cri',g);
  for(const o of G){if(o===g||!vivant(o))continue;if(o.grp===g.grp||hyp(o.x-g.x,o.y-g.y)<REG.cri*(o.type==='mortier'?2:1))avertir(o,g.x,g.y);}
  parts.push({k:'cri',x:g.x,y:g.y,z:g.T.h*0.6,ox:0,oy:0,vie:.5,max:.5,s:1});
}
function sonner(g,d){
  if(!vivant(g))return;
  g.sonne=Math.max(g.sonne,d);g.zone=null;g.z=0;g.etat='normal';g.t=0;g.voit=false;g.rem=0;g.hes=0;g.lim=null;g.dort=false;g.penche=false;g.soinT=0;
}
function reveiller(g){
  g.sonne=0;
  if(!g.reveil)return;
  /* il se réveille : il sait qu'on l'a frappé, et il appelle */
  g.reveil=false;
  const pres=!P.ombre&&hyp(P.x-g.x,P.y-g.y)<4&&vue(g.x,g.y,P.x,P.y);
  g.su.x=pres?P.x:g.x;g.su.y=pres?P.y:g.y;g.suT=tReel;g.bruit=!pres;g.mode='chasse';g.reagit=g.T.reac;g.excl=tReel+0.8;
  if(pres){g.fa=Math.atan2(P.y-g.y,P.x-g.x);g.reg=g.fa;g.rem=1;}
  if(g.furie)g.fenetre=tReel+REG.faucheur.fenetre;
  facher(g.grp);crier(g);
}

/* ======================= blesser un golem ======================= */
const DU_PISTEUR={dague:1,embuscade:1};
/* rend true (touché), 'ting' (l'armure du cuirassé), 'pare' (la dalle du garde) ou false (rien : un fantôme) */
function blesserG(g,dmg,src,opt){
  if(!vivant(g)||g.fantome)return false;
  const moi=!!DU_PISTEUR[src];
  if(g.dort){g.dort=false;texte(g.x,g.y,g.T.h+0.9,'Réveillé !','#ffe08a');}          /* endormi par la flèche : le premier coup le réveille */
  if(moi){
    grpFrappe[g.grp]=tReel;
    /* le javelot couvert par son garde : la dalle pare tout ce qui vient du Pisteur */
    const gd=gardeDe(g);
    if(gd){
      son('ting',g);etincelles(g.x,g.y,g.T.h*0.6,'#e8f4ff',8);texte(g.x,g.y,g.T.h+0.5,'Paré !','#cfd8e6');stats.pares++;gd.flash=1;
      ruer(g);
      return 'pare';
    }
  }
  if(g.T.armure&&src==='dague'){
    /* le cuirassé : la lame fait « ting », sa barre de vie ne bouge pas */
    son('ting',g);etincelles(g.x,g.y,g.T.h*0.6,'#e8f4ff',6);texte(g.x,g.y,g.T.h+0.4,'Ting !','#cfd8e6');stats.tings++;
    colereDe(g);
    if(g.sonne<=0){ruer(g);facher(g.grp);}
    return 'ting';
  }
  g.hp-=dmg;g.flash=1;stats.degats+=dmg;
  if(!moi){stats.entreEux+=dmg;texte(g.x,g.y,g.T.h+0.3,'−'+dmg,'#ffb070');}
  else texte(g.x+rnd(-0.2,0.2),g.y,g.T.h+0.3,'−'+dmg,src==='embuscade'?'#d6c4ff':'#fff2c0');
  hitstop=Math.max(hitstop,src==='dague'?0.04:0.02);
  etincelles(g.x,g.y,g.T.h*0.55,src==='embuscade'?'#d6c4ff':moi?'#fff2c0':'#ff9a4a',src==='dague'?8:5);if(src!=='embuscade')son(src==='dague'?'dague'+clamp(P.rangCoup||1,1,3):'frappe',g);   /* (version 11 : un son par coup de dague ; l'embuscade a le sien) */
  if(g.hp<=0){tuer(g,src);return true;}
  if(moi){
    colereDe(g);
    if(g.sonne>0)g.reveil=true;                                 /* sonné, il ne peut pas crier */
    else{
      ruer(g);facher(g.grp);crier(g);
      /* le javelot réagit dans l'instant : un bond en arrière */
      if(g.type==='javelot'&&g.cdM<=0&&(g.etat==='normal'||g.etat==='base'||g.etat==='recup'))reculJavelot(g);
    }
  }
  return true;
}
function tuer(g,src){
  g.etat='mort';g.t=0;g.zone=null;g.z=0;g.lim=null;stats.tues++;if(!DU_PISTEUR[src])stats.tuesEntreEux++;
  son('acheve',g);secousse(g.type==='colosse'?10:4);
  eclatBrise(g.x,g.y,g.T.h*0.55,g.type==='colosse'?2:1);cailloux(g);
  if(g.type==='colosse'){flashB=0.5;}
  /* tué d'un coup, il ne prévient personne : seuls ceux qui avaient la vue sur lui s'activent et viennent chercher.
     Si c'est un des siens qui l'a vu tomber sous la lame du Pisteur, tout son groupe se met en colère. */
  for(const o of G){
    if(o===g||!vivant(o)||o.sonne>0||o.voit||o.dort||o.penche)continue;
    if(voitPoint(o,g.x,g.y)){avertir(o,g.x,g.y);if(DU_PISTEUR[src]&&o.grp===g.grp)facher(g.grp);}
  }
}

/* ======================= le rouge : il prévient, il blesse tout le monde, et les golems essaient d'en sortir ======================= */
function dansZone(z,x,y,m){
  const dx=x-z.x,dy=y-z.y,d=hyp(dx,dy);
  switch(z.k){
    case 'cercle':return d<z.r+m;
    case 'anneau':return d>z.r0-m&&d<z.r1+m;
    case 'croix':{const u=dx*Math.cos(z.a)+dy*Math.sin(z.a),v=-dx*Math.sin(z.a)+dy*Math.cos(z.a);return (Math.abs(v)<z.l/2+m&&Math.abs(u)<z.L+m)||(Math.abs(u)<z.l/2+m&&Math.abs(v)<z.L+m);}
    case 'cone':return d<z.R+m&&(d<0.4||Math.abs(ang(Math.atan2(dy,dx)-z.a))<z.h+m/Math.max(d,0.6));
    case 'demi':{
      const da=ang(Math.atan2(dy,dx)-z.a);if(Math.abs(da)>Math.PI/2+m/Math.max(d,0.6))return false;
      if(!z.lim)return d<z.R+m;
      const i=clamp(Math.round((da+Math.PI/2)/Math.PI*(z.lim.length-1)),0,z.lim.length-1);return d<z.lim[i]+m;}
    default:{const u=dx*Math.cos(z.a)+dy*Math.sin(z.a),v=-dx*Math.sin(z.a)+dy*Math.cos(z.a);return u>-0.25&&u<z.L+m&&Math.abs(v)<z.l/2+m;}
  }
}
function jeton(){let n=0;for(const g of G)if(g.zone)n++;return n<2;}
function fuirRouge(g,dt){
  let z=null,presse=0;
  for(const o of G){if(o===g||!o.zone||o.zone.p<0.12||o.zone.k==='fin')continue;if(dansZone(o.zone,g.x,g.y,g.r*0.7+0.15)){z=o.zone;break;}}
  /* les obus : un golem en sort toujours à temps (Romain, 25 novembre, 22 h) ; s'il est trop lent, il presse le pas */
  if(!z)for(const o of obus){if(o.de===g)continue;const d=hyp(g.x-o.x1,g.y-o.y1),lim=o.r+g.r*0.7+0.25;if(d<lim){z={k:'cercle',x:o.x1,y:o.y1,r:o.r};presse=Math.min(7,(lim-d)/Math.max(0.12,o.dur-o.t-0.1));break;}}
  if(!z)return false;
  let a;
  if(z.k==='cercle'||z.k==='cone'||z.k==='demi')a=Math.atan2(g.y-z.y,g.x-z.x);
  else if(z.k==='anneau'){a=Math.atan2(g.y-z.y,g.x-z.x);if(hyp(g.x-z.x,g.y-z.y)<(z.r0+z.r1)/2)a+=Math.PI;}
  else if(z.k==='croix'){const b=Math.atan2(g.y-z.y,g.x-z.x),da=ang(b-z.a),br=Math.round(da/(Math.PI/2))*(Math.PI/2);a=b+(da>=br?1:-1)*Math.PI/2;}
  else{const v=-(g.x-z.x)*Math.sin(z.a)+(g.y-z.y)*Math.cos(z.a);a=z.a+(v>=0?1:-1)*Math.PI/2;}
  const v=Math.max(g.vit*fV(g),presse);g.x+=Math.cos(a)*v*dt;g.y+=Math.sin(a)*v*dt;g.marche+=v*dt;g.dirM=a;g.fuit=tReel;
  return true;
}
/* le coup rouge tombe : tous ceux qui sont dedans le prennent, golems compris */
function frapperZone(g,z,dmg,effetP){
  let aTouche=false;
  if(dansZone(z,P.x,P.y,0.25)&&blesserP(dmg,Object.assign({sx:g.x,sy:g.y},effetP||{})))aTouche=true;
  for(const o of G){if(o===g||!vivant(o))continue;if(dansZone(z,o.x,o.y,o.r*0.5))blesserG(o,dmg,'rouge');}
  return aTouche;
}

/* ======================= bouger ======================= */
const fV=g=>1;                                            /* (le ralentissement de la dague circulaire : retirée ; la place est gardée pour une carte) */
function tourner(g,cible,dt,f){const d=ang(cible-g.fa),v=g.T.tour*(f||1);g.fa+=clamp(d,-v*dt,v*dt);}
function allerBut(g,x,y,v,dt,tol){
  if(hyp(g.x-x,g.y-y)<(tol||0.5))return true;
  if(!g.ch||tReel-g.chT>0.8||Math.abs(g.chX-x)+Math.abs(g.chY-y)>0.6){g.ch=champ(x,y);g.chT=tReel;g.chX=x;g.chY=y;}
  if(g.ch[cel(g.x,g.y)]===0)return true;                  /* il est au plus près de l'endroit visé (le but lui-même est dans un mur) */
  const [tx,ty]=pasVers(g,g.ch),avant=g.x+g.y;allerVers(g,tx,ty,v,dt);
  if(Math.abs(g.x+g.y-avant)<1e-5)return true;
  tourner(g,g.dirM,dt);return false;
}
function versLeP(g,v,dt){allerVers(g,P.x,P.y,v,dt);}
function chefDe(g){
  for(const o of G)if(o.grp===g.grp&&o.etat==='normal'&&o.mode==='ronde'&&!o.poste&&o.route&&o.sonne<=0&&!o.dort)return o;
  return g;
}
/* la ronde : un vrai trajet. Il marche, s'arrête, regarde à gauche, à droite, et repart. */
function ronde(g,dt){
  g.regC=g.fa;
  if(g.poste){
    if(allerBut(g,g.poste.x,g.poste.y,g.vit*0.6*fV(g),dt,0.35)){tourner(g,g.posteA,dt,0.5);g.regC=g.posteA+Math.sin(tReel*0.7+g.id*6)*0.95;}
    return;
  }
  if(!g.route){g.regC=g.fa+Math.sin(tReel*0.7+g.id*6)*0.9;return;}
  const chef=chefDe(g);
  if(chef!==g){
    /* les autres suivent le premier, en file serrée */
    let k=0;for(const o of G){if(o===g)break;if(o!==chef&&o.grp===g.grp&&vivant(o)&&o.mode==='ronde'&&!o.dort)k++;}
    const rg=Math.floor(k/2),a=chef.fa+Math.PI+(k%2?1:-1)*0.6,L=1.25+rg*0.9,tx=chef.x+Math.cos(a)*L,ty=chef.y+Math.sin(a)*L;
    const arret=tReel<chef.pauseT;
    if(hyp(g.x-tx,g.y-ty)>(arret?0.9:0.45)){
      const libre=!obsEn(tx,ty,0.4,false)&&!horsSalle(tx,ty,0.4);
      allerBut(g,libre?tx:chef.x,libre?ty:chef.y,g.vit*0.62*fV(g),dt,0.35);
    }else{tourner(g,chef.fa,dt,0.5);if(arret)g.regC=g.fa+Math.sin((chef.pauseT-tReel)*2.2+k*2.1)*1.1;}
    if(g.type==='javelot')g.regC=g.fa+Math.sin(tReel*0.9+g.id*5)*0.8;
    return;
  }
  const R=g.route;
  if(tReel<g.pauseT){const u=1-(g.pauseT-tReel)/g.pauseD;g.regC=g.fa+(u<0.45?-1.1:u<0.9?1.1:0);return;}
  const w=R[g.ri%R.length];
  /* celui qui marche devant règle son pas sur le plus lent du groupe (un mortier, un cuirassé) : personne ne reste en arrière */
  let vr=g.vit;for(const o of G)if(o.grp===g.grp&&o!==g&&vivant(o)&&!o.poste&&o.mode==='ronde'&&o.sonne<=0&&!o.dort&&o.vit<vr)vr=o.vit;
  if(allerBut(g,w[0],w[1],vr*0.5*fV(g),dt,0.5)){g.ri++;g.pauseD=2.0;g.pauseT=tReel+2.0;}
  /* le porte-dalle tourne la tête vers son javelot toutes les trois secondes environ */
  if(g.type==='dalle'&&((tReel+g.id*3)%3.2)<0.8){const j=G.find(o=>o.grp===g.grp&&o.type==='javelot'&&vivant(o));if(j)g.regC=Math.atan2(j.y-g.y,j.x-g.x);}
}
const DEVANT={dalle:1,cuirasse:1,belier:1,faucheur:1,colosse:1};      /* ceux qui marchent devant quand le groupe cherche */
/* il ne le voit plus : il va là où il l'a vu (ou entendu) en dernier, en contournant les murs… */
function chasseSansVue(g,dt){
  g.regC=g.fa;
  if(g.type==='mortier'){
    /* le mortier ne court pas voir : il se tourne vers l'endroit qu'on lui montre. Il ne tire que s'il a vu le Pisteur DE SES YEUX
       (alors il est déchaîné : voir mortierDechaine) ; un cri, ou ce que voit son groupe, ne le fait plus tirer. */
    tourner(g,Math.atan2(g.su.y-g.y,g.su.x-g.x),dt);
    if(tReel-g.suT>2.5)debutFouille(g);return;
  }
  /* le groupe cherche ensemble : tout le monde au pas du plus lent, et le javelot derrière son garde */
  let v=g.vit,garde=null;
  /* un des siens vient d'être frappé, ou voit le Pisteur : chacun fonce à sa vitesse. Sinon ils cherchent ensemble, au pas du plus lent. */
  const fonce=tReel<g.rue||!!grpVoit[g.grp];
  for(const o of G){
    if(o===g||o.grp!==g.grp||!vivant(o)||o.sonne>0||o.dort||o.type==='mortier'||o.mode!=='chasse'||o.voit)continue;
    if(o.vit<v&&!fonce)v=o.vit;
    if((g.type==='javelot'||g.type==='repare')&&DEVANT[o.type]&&!garde)garde=o;
  }
  v*=fV(g)*(g.bruit?0.75:1);
  if(garde&&hyp(garde.x-g.su.x,garde.y-g.su.y)>2&&tReel-g.suT<=8){
    let bx=garde.x-Math.cos(garde.dirM)*1.7,by=garde.y-Math.sin(garde.dirM)*1.7;
    if(obsEn(bx,by,0.42,false)||horsSalle(bx,by,0.42)){bx=garde.x;by=garde.y;}
    if(hyp(g.x-bx,g.y-by)>0.5)allerBut(g,bx,by,g.vit*fV(g),dt,0.4);else{tourner(g,garde.fa,dt,0.5);g.regC=g.fa+Math.sin(tReel*0.9+g.id*5)*0.8;}
    return;
  }
  /* (s'il n'y arrive pas au bout de huit secondes — un copain dans le passage — il cherche là où il est) */
  if(allerBut(g,g.su.x,g.su.y,v,dt,0.6)||tReel-g.suT>8)debutFouille(g);
}
/* …et s'il ne trouve personne, il reste là et cherche autour de lui, puis reprend sa ronde */
function debutFouille(g){son('cherche',g);g.mode='fouille';g.fouilleT=4;g.fouilleA=g.fa;g.inter=tReel+4;g.ch=null;}
function fouille(g,dt){
  g.fouilleT-=dt;
  const k=Math.min(3,Math.floor(4-g.fouilleT)),c=g.fouilleA+[-1.3,1.3,Math.PI-0.8,Math.PI+0.8][k];
  tourner(g,c,dt,0.7);g.regC=g.fa;
  if(g.fouilleT<=0){g.mode='ronde';g.ch=null;g.bruit=false;}
}

/* ======================= le coup de base : arrivé au contact, il ne frappe pas tout de suite ======================= */
function finCoup(g,recup){g.zone=null;g.etat='recup';g.recup=recup;g.t=0;g.tFrappe=tReel;}
function sautDe(g,duree,haut){
  const k=Math.min(1,g.t/duree);g.x=lerp(g.sx,g.ex,k);g.y=lerp(g.sy,g.ey,k);g.z=Math.sin(Math.PI*k)*haut;
  if(k>=1){g.z=0;pousserHors(g,g.r,false);}
  return k>=1;
}
/* jusqu'où un golem peut aller tout droit, à pied ou d'un bond : tous les obstacles comptent, l'estrade de Grosbec aussi */
function rayonSol(x,y,a,max,m){const c=Math.cos(a),s=Math.sin(a);for(let L=0.2;L<max;L+=0.2){const qx=x+c*L,qy=y+s*L;if(horsSalle(qx,qy,m)||obsEn(qx,qy,m,false))return L;}return max;}
function viseSaut(g,a,L){L=Math.max(0,Math.min(L,rayonSol(g.x,g.y,a,L+0.3,g.r)-0.2));g.sx=g.x;g.sy=g.y;g.ex=g.x+Math.cos(a)*L;g.ey=g.y+Math.sin(a)*L;}

/* ---- le chien (le rôdeur) : un petit bond pour charger, la morsure qui fait saigner, le plaquage ---- */
function iaChien(g,dt,d){
  const versP=Math.atan2(P.y-g.y,P.x-g.x),C=REG.chien;
  switch(g.etat){
    case 'normal':{
      g.regC=versP;tourner(g,versP,dt);
      if(g.cdS<=0&&d>2.2&&d<4.4&&pPeutBouger()&&P.etat!=='saut'&&tReel-dernierPlaquage>C.entrePlaq&&jeton()){
        g.etat='vise';g.t=0;g.va=versP;g.vL=C.plaqL;dernierPlaquage=tReel;son('zChien');
        break;}
      if(d<=g.r+0.72){if(g.cd<=0){g.etat='base';g.t=0;}break;}
      if(g.cdM<=0&&d>1.9&&d<3.3){g.etat='bondit';g.t=0;viseSaut(g,versP,Math.min(1.5,d-g.r-0.6)*fV(g));g.cdM=rnd(2.4,3.2);break;}
      versLeP(g,g.vit*fV(g),dt);
      break;}
    case 'bondit':if(sautDe(g,0.2,0.35)){g.etat='normal';g.t=0;}break;
    case 'base':
      /* il se ramasse une demi-seconde : juste le temps de partir */
      g.regC=versP;tourner(g,versP,dt);
      if(g.t>=C.ramasse){
        g.cd=C.cdMorsure;finCoup(g,0.25);son('swishG');
        if(d<g.r+0.98)blesserP(C.morsure,{saigne:1,sx:g.x,sy:g.y,nom:'morsure'});else texte(g.x,g.y,1.4,'Clac !','#cfd8e6');
      }
      break;
    case 'vise':{
      /* la flèche rouge dure : elle suit le Pisteur la première moitié, puis elle se fige */
      const fige=g.t>=C.plaqFige;if(!fige)g.va=versP;
      g.fa=g.va;g.regC=g.va;
      g.zone={k:'fleche',x:g.x,y:g.y,a:g.va,L:Math.min(g.vL,rayonSol(g.x,g.y,g.va,g.vL,g.r)),l:0.8,p:g.t/C.plaqT,fige};
      if(g.t>=C.plaqT){const L=g.zone.L*fV(g);g.zone=null;g.etat='plaque';g.t=0;viseSaut(g,g.va,L);g.aTouche=false;son('bond');}
      break;}
    case 'plaque':{
      const fini=sautDe(g,0.28,0.6);
      if(!g.aTouche&&hyp(g.x-P.x,g.y-P.y)<0.85){
        if(blesserP(0,{plaque:C.plaqDur,sx:g.x,sy:g.y,nom:'plaquage'})){g.aTouche=true;texte(P.x,P.y,2.2,'Plaqué !','#ff7a6a');son('bang');
          }
      }
      if(fini||g.aTouche){
        g.z=0;g.cdS=C.cdPlaq+rnd(0,1.5);
        if(g.aTouche){g.cd=0;finCoup(g,0.2);}else{g.etat='etale';g.t=0;texte(g.x,g.y,1.4,'Raté !','#cfd8e6');poussiere(g.x,g.y,0.8);}
      }
      break;}
    case 'etale':if(g.t>=1){g.etat='normal';g.t=0;}break;
    case 'recup':if(g.t>=g.recup){g.etat='normal';g.t=0;}break;
  }
}

/* ---- le javelot : un recul d'un bond, un coup de pique, le lancer ---- */
function distSeg(px0,py0,ax,ay,bx,by){const vx=bx-ax,vy=by-ay,L=vx*vx+vy*vy||1,t=clamp(((px0-ax)*vx+(py0-ay)*vy)/L,0,1);return hyp(px0-ax-vx*t,py0-ay-vy*t);}
function reculJavelot(g){
  /* trois pas en arrière, du côté où le porte-dalle n'est pas (pour ne pas lui tirer dessus) ; ralenti, il n'en fait que 60 % */
  const L=REG.javelot.recul*fV(g),base=Math.atan2(g.y-P.y,g.x-P.x),dl=G.find(o=>o.type==='dalle'&&vivant(o)&&o.grp===g.grp)||G.find(o=>o.type==='dalle'&&vivant(o));
  let best=null,bs=-1e9;
  for(const da of [0,0.45,-0.45,0.9,-0.9,1.4,-1.4]){
    const a=base+da,l=Math.min(L,rayonSol(g.x,g.y,a,L+0.3,g.r)-0.2);if(l<L*0.4)continue;
    const x=g.x+Math.cos(a)*l,y=g.y+Math.sin(a)*l;let s=l*2-Math.abs(da);
    if(dl&&distSeg(dl.x,dl.y,x,y,P.x,P.y)<1.3)s-=4;
    if(!vue(x,y,P.x,P.y))s-=3;
    if(s>bs){bs=s;best=[x,y];}
  }
  if(!best){g.cdM=1.5;return;}
  g.zone=null;g.etat='recul';g.t=0;g.sx=g.x;g.sy=g.y;g.ex=best[0];g.ey=best[1];g.cdM=REG.javelot.cdRecul;son('bond');
}
function iaJavelot(g,dt,d){
  const versP=Math.atan2(P.y-g.y,P.x-g.x),J=REG.javelot;
  switch(g.etat){
    case 'normal':{
      g.regC=versP;tourner(g,versP,dt);
      if(d<2.2&&g.cdM<=0){reculJavelot(g);if(g.etat==='recul')break;}
      if(g.cdS<=0&&d>2.3&&d<13&&pPeutBouger()&&jeton()){
        g.etat='arme';g.t=0;g.va=versP;son('zJavelot');
        break;}
      if(d<g.r+0.85){if(g.cd<=0){g.etat='base';g.t=0;}break;}
      /* son but : rester loin, sans quitter le Pisteur des yeux */
      if(d<5.2){
        const x0=g.x,y0=g.y;allerVers(g,g.x-Math.cos(versP),g.y-Math.sin(versP),g.vit*0.85*fV(g),dt);pousserHors(g,g.r,false);
        if(hyp(g.x-x0,g.y-y0)<g.vit*dt*0.3){const s=g.id>0.5?1:-1;allerVers(g,g.x-Math.sin(versP)*s,g.y+Math.cos(versP)*s,g.vit*0.85*fV(g),dt);}
      }else if(d>8.5)versLeP(g,g.vit*0.85*fV(g),dt);
      break;}
    case 'recul':
      g.fa=versP;g.regC=versP;
      if(sautDe(g,0.22,0.5)){g.etat='normal';g.t=0;if(g.cdS<1.2)g.cdS=0;}      /* et il lance aussitôt */
      break;
    case 'base':
      g.regC=versP;tourner(g,versP,dt);
      if(g.t>=0.5){g.cd=1.5;finCoup(g,0.3);son('swishG');if(d<g.r+1.1)blesserP(J.pique,{sx:g.x,sy:g.y,nom:'pique'});}
      break;
    case 'arme':{
      /* une seconde pour armer : le trait suit le Pisteur, se fige, et le javelot part pour de bon */
      const fige=g.t>=J.figeT;if(!fige)g.va=versP;
      g.fa=g.va;g.regC=g.va;
      g.zone={k:'fin',x:g.x,y:g.y,a:g.va,L:rayon(g.x,g.y,g.va,16,0.05),l:0.5,p:g.t/J.armeT,fige};
      if(g.t>=J.armeT){
        javs.push({x:g.x+Math.cos(g.va)*0.5,y:g.y+Math.sin(g.va)*0.5,a:g.va,v:J.v,L:0,de:g});
        g.cdS=J.cdLancer;finCoup(g,0.45);son('jav');stats.javelots++;
      }
      break;}
    case 'recup':if(g.t>=g.recup){g.etat='normal';g.t=0;}break;
  }
}

/* ---- le porte-dalle : une charge qui colle, un coup de patte, la dalle qui assomme ---- */
function debutLeve(g){
  g.etat='leve';g.t=0;son('zDalle');
}
function planterDalle(g){
  /* raté : la dalle reste plantée dans le sol, et lui se retrouve à mains nues */
  const cxx=g.x+Math.cos(g.fa)*(g.r+0.8),cyy=g.y+Math.sin(g.fa)*(g.r+0.8),vert=Math.abs(Math.cos(g.fa))>Math.abs(Math.sin(g.fa));
  const o={k:'dalle',x:clamp(cxx,1,RW-1),y:clamp(cyy,2.4,RD-1),w:vert?0.5:1.7,d:vert?1.7:0.5,h:1.3,plantee:true};
  g.aDalle=false;stats.dalles++;
  /* elle ne reste plantée qu'en terrain dégagé : à moins d'un pas et demi d'un mur ou d'un autre obstacle, elle ferait un couloir
     trop étroit où un golem resterait coincé ; là, elle éclate */
  const m=1.4,large=o.x-o.w/2>0.2+m&&o.x+o.w/2<RW-0.2-m&&o.y-o.d/2>Y0+m&&o.y+o.d/2<RD-0.2-m;
  let libre=large&&hyp(o.x-P.x,o.y-P.y)>0.6;
  if(libre)for(const q of OBS){
    const dx=Math.max(0,Math.abs(q.x-o.x)-o.w/2-(q.c?0:q.w/2)),dy=Math.max(0,Math.abs(q.y-o.y)-o.d/2-(q.c?0:q.d/2));
    if(hyp(dx,dy)-(q.c?q.r:0)<m){libre=false;break;}
  }
  texte(g.x,g.y,2.3,'Raté !','#ffcf9a');
  if(libre){
    OBS.push(o);majGrille();pousserHors(P,0.33,false);for(const q of G)if(vivant(q)){pousserHors(q,q.r,false);q.ch=null;}
  }else{
    eclatBrise(o.x,o.y,0.6,1);son('casse',o.x,o.y);
  }
}
function iaDalle(g,dt,d){
  const versP=Math.atan2(P.y-g.y,P.x-g.x),D=REG.dalle;
  switch(g.etat){
    case 'normal':{
      g.regC=versP;tourner(g,versP,dt);
      if(g.colle){
        /* en colère, collé au dos de son javelot : il ne le quitte pas, il cogne seulement ce qui passe à sa portée */
        if(g.aDalle&&g.cdS<=0&&d<1.9&&pPeutBouger()&&jeton()){debutLeve(g);break;}
        if(d<g.r+0.85&&g.cd<=0){g.etat='base';g.t=0;}
        break;
      }
      if(g.cdM<=0&&d>1.8&&d<D.porteeCharge&&P.etat!=='saut'&&P.etat!=='vol'){
        g.etat='charge';g.t=0;g.cdM=D.cdCharge;son('chargeDalle');
        break;}
      if(g.aDalle&&g.cdS<=0&&d<1.9&&pPeutBouger()&&jeton()){debutLeve(g);break;}
      if(d<g.r+0.85){if(g.cd<=0){g.etat='base';g.t=0;}break;}
      versLeP(g,g.vit*fV(g),dt);
      break;}
    case 'charge':{
      /* elle ne s'évite pas : c'est la distance, ou un mur, qui protège. Elle sert à coller le Pisteur, pas à le blesser. */
      g.fa=versP;g.regC=versP;
      if(d>g.r+0.72){const s=Math.min(D.vCharge*fV(g)*dt,d-(g.r+0.7));g.x+=Math.cos(versP)*s;g.y+=Math.sin(versP)*s;g.marche+=s;g.dirM=versP;}
      if(Math.random()<dt*30)poussiere(g.x,g.y,0.7);
      if(d<=g.r+0.9||g.t>0.95){
        const colle=d<=g.r+1.1&&P.etat!=='saut'&&!BLOQUE[P.etat];
        if(colle){P.lentT=D.lent;texte(P.x,P.y,2.1,'Collé !','#ffb070');son('impact');stats.colles++;}
        if(colle&&g.aDalle&&g.cdS<=0.6)debutLeve(g);else{g.etat='normal';g.t=0;}
      }
      break;}
    case 'leve':
      g.zone={k:'cercle',x:g.x,y:g.y,r:D.rayon,p:g.t/D.leveT,fige:true};
      if(g.t>=D.leveT){
        const z=g.zone;son('bang');secousse(8);poussiere(g.x,g.y,1.6);parts.push({k:'onde',x:g.x,y:g.y,z:0,ox:0,oy:0,vie:.35,max:.35,s:2});
        const touche=frapperZone(g,z,D.dmg,{sonne:D.sonne,nom:'dalle'});
        for(const o of G)if(o!==g&&vivant(o)&&dansZone(z,o.x,o.y,o.r*0.5))sonner(o,D.sonne);
        g.cdS=D.cdLeve;finCoup(g,0.8);
        if(!touche)planterDalle(g);
      }
      break;
    case 'base':
      g.regC=versP;tourner(g,versP,dt);
      if(g.t>=0.5){g.cd=1.5;finCoup(g,0.3);son('swishG');if(d<g.r+1.1)blesserP(D.patte,{sx:g.x,sy:g.y,nom:'patte'});}
      break;
    case 'recup':if(g.t>=g.recup){g.etat='normal';g.t=0;}break;
  }
}

/* ---- le faucheur : la volte, un petit coup de faux, le grand fauchage ---- */
function debutFauche(g){
  g.etat='fauche';g.t=0;g.va=g.fa;son('zFaux');
}
function debutVolte(g){
  /* un petit bond en pivotant : il retombe face au Pisteur, à deux pas */
  const base=Math.atan2(g.y-P.y,g.x-P.x);let ex=g.x,ey=g.y;
  for(const da of [0,0.5,-0.5,1,-1]){const x=P.x+Math.cos(base+da)*2,y=P.y+Math.sin(base+da)*2;if(!horsSalle(x,y,g.r)&&!obsEn(x,y,g.r,false)){ex=x;ey=y;break;}}
  g.etat='volte';g.t=0;g.sx=g.x;g.sy=g.y;g.ex=ex;g.ey=ey;g.cdM=REG.faucheur.cdVolte;son('bond');
}
function iaFaucheur(g,dt,d){
  const versP=Math.atan2(P.y-g.y,P.x-g.x),ecart=Math.abs(ang(versP-g.fa)),F=REG.faucheur;
  switch(g.etat){
    case 'normal':{
      if(ecart>1.6&&d<3&&g.cdM<=0){debutVolte(g);break;}
      g.regC=versP;tourner(g,versP,dt);
      if(g.cdS<=0&&d<2.7&&ecart<0.9&&pPeutBouger()&&jeton()){debutFauche(g);break;}
      if(d<g.r+1.4&&ecart<0.8){if(g.cd<=0){g.etat='base';g.t=0;}break;}
      if(d>1.7)versLeP(g,g.vit*fV(g),dt);
      break;}
    case 'volte':
      g.fa+=ang(Math.atan2(P.y-g.ey,P.x-g.ex)-g.fa)*Math.min(1,dt*14);g.reg=g.fa;g.regC=g.fa;
      if(sautDe(g,0.3,0.5)){g.fa=versP;g.reg=versP;if(pPeutBouger())debutFauche(g);else{g.etat='normal';g.t=0;g.cdS=0;}}
      break;
    case 'fauche':{
      /* un demi-cercle de trois pas : il suit le Pisteur la première moitié, puis il se fige */
      const fige=g.t>=F.figeT;if(!fige){tourner(g,versP,dt,0.9);g.va=g.fa;}
      g.fa=g.va;g.regC=g.va;
      g.zone={k:'cone',x:g.x,y:g.y,a:g.va,R:F.rayon,h:Math.PI/2,p:g.t/F.faucheT,fige};
      if(g.t>=F.faucheT){
        const z=g.zone;frapperZone(g,z,F.fauche,{nom:'fauchage'});
        g.balai={t:tReel,a:g.va};g.cdS=F.cdFauche;finCoup(g,F.recup);son('swishG');secousse(4);     /* il met presque une seconde à ramener sa faux */
        if(g.furie)g.fenetre=tReel+F.fenetre;
      }
      break;}
    case 'base':
      g.regC=versP;tourner(g,versP,dt,0.5);
      if(g.t>=0.5){g.cd=1.0;finCoup(g,0.2);son('swishG');if(d<g.r+1.55&&ecart<0.9)blesserP(F.faux,{sx:g.x,sy:g.y,nom:'faux'});}
      break;
    case 'recup':if(g.t>=g.recup){g.etat='normal';g.t=0;}break;
  }
}

/* ---- le mortier : il marche lentement, et il n'a qu'un coup, le tir en cloche ---- */
function iaMortier(g,dt,d){
  const versP=Math.atan2(P.y-g.y,P.x-g.x),M=REG.mortier;
  switch(g.etat){
    case 'normal':
      g.regC=versP;tourner(g,versP,dt);
      if(g.cdS<=0&&d>1.5&&pPeutBouger()){g.etat='tire';g.t=0;g.tirX=null;son('zMortier');break;}
      if(d<3.5){allerVers(g,g.x-Math.cos(versP),g.y-Math.sin(versP),g.vit*fV(g),dt);}
      break;
    case 'tire':
      if(g.t>=(g.aveugle?0.3:0.5)){
        /* le rond rouge reste là où était le Pisteur : il faut rester en mouvement, un mur ne protège pas.
           (à l'aveugle : là où le hasard l'a voulu) */
        const vise=!g.aveugle&&(g.tirX==null||g.voit),tx=vise?P.x:g.tirX,ty=vise?P.y:g.tirY;
        /* jamais un obus là où un des siens n'aurait pas le temps de sortir (il attend) */
        if(!cibleObusOk(clamp(tx,0.8,RW-0.8),clamp(ty,1.8,RD-0.6),g)){g.etat='normal';g.t=0;g.cdS=0.3;g.aveugle=false;break;}
        obus.push({x0:g.x,y0:g.y,x1:clamp(tx,0.8,RW-0.8),y1:clamp(ty,1.8,RD-0.6),t:0,dur:M.obusT,r:M.rayon,de:g});
        g.cdS=g.aveugle?M.aveugle:M.cd;finCoup(g,g.aveugle?0.2:0.5);g.aveugle=false;son('mortier');{const ob=obus[obus.length-1];son('obus',ob.x1,ob.y1);}stats.obus++;
      }
      break;
    case 'recup':if(g.t>=g.recup){g.etat='normal';g.t=0;}break;
  }
}

/* ---- le bélier : un demi-tour lent, un coup de tête qui envoie valser, la charge ---- */
function iaBelier(g,dt,d){
  const versP=Math.atan2(P.y-g.y,P.x-g.x),ecart=Math.abs(ang(versP-g.fa)),B=REG.belier;
  switch(g.etat){
    case 'normal':{
      g.regC=g.fa;tourner(g,versP,dt);                     /* derrière lui, on est tranquille le temps de son demi-tour */
      if(d<g.r+1.2&&ecart<0.6){if(g.cd<=0){g.etat='tete';g.t=0;}break;}
      if(g.cdS<=0&&d>3.2&&d<B.L-1&&ecart<0.35&&pPeutBouger()&&P.etat!=='saut'&&jeton()){
        g.etat='gratte';g.t=0;g.va=g.fa;son('zBelier');
        break;}
      if(ecart<1.0&&d>g.r+0.95)versLeP(g,g.vit*fV(g),dt);
      break;}
    case 'tete':
      if(g.t>=B.teteT){
        g.cd=B.cdTete;finCoup(g,0.35);son('swishG');
        if(d<g.r+1.4&&ecart<0.85&&blesserP(B.tete,{vol:{a:g.fa,L:B.envoi},sx:g.x,sy:g.y,nom:'tete'})){
          son('bang');texte(P.x,P.y,2.2,'Vlan !','#ffb070');
          }
      }
      break;
    case 'gratte':{
      const fige=g.t>=B.figeT;if(!fige){tourner(g,versP,dt);g.va=g.fa;}
      g.fa=g.va;
      g.zone={k:'ligne',x:g.x,y:g.y,a:g.va,L:Math.min(B.L,rayonSol(g.x,g.y,g.va,B.L,g.r*0.7)),l:1.3,p:g.t/B.gratteT,fige};
      if(Math.random()<dt*10)poussiere(g.x-Math.cos(g.fa)*0.5,g.y-Math.sin(g.fa)*0.5,0.7);
      if(g.t>=B.gratteT){g.etat='charge';g.t=0;g.zone=null;g.parcouru=0;g.aTouche=false;g.touches=[];son('chargeBelier');}
      break;}
    case 'charge':{
      const pas=B.vCharge*fV(g)*dt,n=Math.ceil(pas/0.12),ux=Math.cos(g.fa),uy=Math.sin(g.fa);
      for(let s=0;s<n;s++){
        g.x+=ux*pas/n;g.y+=uy*pas/n;g.parcouru+=pas/n;g.marche+=pas/n;
        if(!g.aTouche&&hyp(P.x-g.x,P.y-g.y)<g.r+0.4){
          if(blesserP(B.charge,{vol:{a:g.fa+(Math.random()<.5?0.9:-0.9),L:1.6},sx:g.x,sy:g.y,nom:'charge'})){g.aTouche=true;son('bang');}
        }
        for(const o of G){if(o===g||!vivant(o)||g.touches.indexOf(o)>=0)continue;if(hyp(o.x-g.x,o.y-g.y)<g.r+o.r){g.touches.push(o);blesserG(o,B.charge,'rouge');son('bang');secousse(5);stats.caram++;}}
        const h=pousserHors(g,g.r*0.8,false);
        if(h){
          if(g.aTouche){finCoup(g,0.8);}
          else{g.zone=null;g.etat='normal';g.t=0;g.sonne=2;g.voit=false;g.rem=0;g.tFrappe=tReel;texte(g.x,g.y,2,'BANG !','#ffb070');stats.bang++;
            }
          son('bang');secousse(8);poussiere(g.x,g.y,1.4);g.cdS=g.colere?B.cdChargeFou:B.cdCharge;return;
        }
        if(g.parcouru>B.L){g.cdS=g.colere?B.cdChargeFou:B.cdCharge;finCoup(g,0.6);return;}
      }
      break;}
    case 'recup':if(g.t>=g.recup){g.etat='normal';g.t=0;}break;
  }
}

/* ---- le cuirassé : il marche sur le Pisteur, sans jamais courir ; un coup lent ; son arme, c'est son armure.
        EN COLÈRE (frappé une fois) : il se met en boule et ne s'arrête plus de rouler ---- */
function debutRamasse(g){
  g.etat='ramasse';g.t=0;g.zone=null;son('zBoule');
}
function rebond(g,nx,ny){
  const vx=Math.cos(g.va),vy=Math.sin(g.va),k=vx*nx+vy*ny;if(k>=0)return;        /* il s'en éloignait déjà */
  let a=Math.atan2(vy-2*k*ny,vx-2*k*nx)+rnd(-0.18,0.18);
  /* un rebond sur cinq penche vers le Pisteur, s'il est à découvert (dans l'ombre, la boule ne sait pas où il est : elle roule au hasard) */
  if(!P.ombre&&Math.random()<REG.cuirasse.penchant&&P.etat!=='aterre')a+=ang(Math.atan2(P.y-g.y,P.x-g.x)-a)*0.6;
  if(Math.cos(a)*nx+Math.sin(a)*ny<0.12)a=Math.atan2(ny,nx)+rnd(-0.7,0.7);        /* jamais de retour dans le mur */
  g.va=a;g.fa=a;
}
function rouler(g,dt){
  const C=REG.cuirasse,pas=C.vRoule*dt,n=Math.ceil(pas/0.12);
  for(let s=0;s<n;s++){
    g.x+=Math.cos(g.va)*pas/n;g.y+=Math.sin(g.va)*pas/n;g.marche+=pas/n;
    const bx=g.x,by=g.y;
    if(pousserHors(g,g.r,false)){
      let nx=g.x-bx,ny=g.y-by;const l=hyp(nx,ny);
      if(l<1e-4){nx=-Math.cos(g.va);ny=-Math.sin(g.va);}else{nx/=l;ny/=l;}
      rebond(g,nx,ny);if(Math.random()<0.5)poussiere(g.x,g.y,0.6);
    }
    /* il rebondit sur les autres golems comme sur un mur, sans leur faire de mal */
    for(const o of G){
      if(o===g||!vivant(o)||o.fantome||o.z>0.2)continue;
      const dx=g.x-o.x,dy=g.y-o.y,dd=hyp(dx,dy),m=g.r+o.r;
      if(dd<m&&dd>1e-4){g.x=o.x+dx/dd*m;g.y=o.y+dy/dd*m;rebond(g,dx/dd,dy/dd);}
    }
    /* le Pisteur, lui, prend trente points, même dans l'ombre (en l'air, la boule passe dessous) */
    const dx=g.x-P.x,dy=g.y-P.y,dd=hyp(dx,dy);
    if(dd<g.r+0.34&&tReel-g.tChoc>C.chocCD&&P.etat!=='aterre'&&P.etat!=='chaine'){
      g.tChoc=tReel;
      if(blesserP(C.boule,{sx:g.x,sy:g.y,nom:'boule'})){son('bang');secousse(6);texte(P.x,P.y,2.3,'Bong !','#ffb070');stats.boules++;if(dd>1e-4)rebond(g,dx/dd,dy/dd);}
    }
  }
  g.regC=g.va;g.reg=g.va;
}
function iaCuirasse(g,dt,d){
  const versP=Math.atan2(P.y-g.y,P.x-g.x),ecart=Math.abs(ang(versP-g.fa));
  switch(g.etat){
    case 'normal':
      g.regC=versP;tourner(g,versP,dt);
      if(d<g.r+1.25&&ecart<0.8){if(g.cd<=0){g.etat='base';g.t=0;}break;}
      if(d>g.r+0.9)versLeP(g,g.vit*fV(g),dt);
      break;
    case 'base':
      tourner(g,versP,dt,0.4);
      if(g.t>=REG.cuirasse.coupT){g.cd=1.8;finCoup(g,0.5);son('swishG');if(d<g.r+1.45&&ecart<0.9)blesserP(REG.cuirasse.coup,{sx:g.x,sy:g.y,nom:'cuirasse'});}
      break;
    case 'recup':if(g.t>=g.recup){g.etat='normal';g.t=0;}break;
    case 'ramasse':
      /* il se ramasse (une seconde la première fois, pour qu'on le voie venir), puis il part */
      if(g.t>=REG.cuirasse.ramasseT*(g.aRoule?0.5:1)){
        g.etat='roule';g.t=0;g.aRoule=true;g.va=P.ombre?Math.atan2(g.su.y-g.y,g.su.x-g.x)+rnd(-0.5,0.5):versP;g.fa=g.va;son('zCuirasse');
      }
      break;
    case 'roule':rouler(g,dt);break;
  }
}

/* ---- le colosse : le plus gros, rien ne l'assomme. Plus de coup de poing : il ne fait que des attaques de zone, larges, qui s'enchaînent.
        Il faut se glisser entre les zones : derrière lui (l'onde), loin de lui (le pilon), contre lui ou très loin (l'anneau), en biais (la croix).
        EN COLÈRE (blessé) : on ne peut plus quitter le combat. Qui sort de son périmètre est ramené au contact par sa chaîne. ---- */
function limOnde(g){
  const n=25,lim=new Float32Array(n);
  for(let i=0;i<n;i++)lim[i]=rayon(g.x,g.y,g.va-Math.PI/2+Math.PI*i/(n-1),REG.colosse.rayon,0.05,false);
  return lim;
}
function zoneColosse(g,nom,p){
  const C=REG.colosse;
  if(nom==='onde')return {k:'demi',x:g.x,y:g.y,a:g.va,R:C.rayon,lim:g.lim,p,fige:g.t>=C.figeT};
  if(nom==='pilon')return {k:'cercle',x:g.x,y:g.y,r:C.pilon.r,p,fige:true};
  if(nom==='anneau')return {k:'anneau',x:g.x,y:g.y,r0:C.anneau.r0,r1:C.anneau.r1,p,fige:true};
  return {k:'croix',x:g.x,y:g.y,a:g.va,L:C.croix.L,l:C.croix.l,p,fige:true};
}
function debutZoneColosse(g,nom){
  /* il choisit, dans son sac de quatre coups, le premier qui menace l'endroit où se tient le Pisteur (jamais deux fois le même d'affilée) */
  if(!nom){
    if(!g.sac||!g.sac.length){g.sac=['onde','pilon','anneau','croix'].sort(()=>Math.random()-0.5);if(g.sac[0]===g.zk)g.sac.push(g.sac.shift());}
    g.va=g.fa;g.lim=null;
    let i=g.sac.findIndex(q=>dansZone(zoneColosse(g,q,0),P.x,P.y,0.25));if(i<0)i=g.sac.indexOf('onde');if(i<0)i=0;
    nom=g.sac.splice(i,1)[0];
  }
  g.zk=nom;g.etat='zone';g.t=0;g.va=g.fa;g.lim=null;son('z'+nom);
}
function iaColosse(g,dt,d){
  const versP=Math.atan2(P.y-g.y,P.x-g.x),ecart=Math.abs(ang(versP-g.fa)),C=REG.colosse;
  /* blessé, il ne laisse plus partir le Pisteur : la chaîne */
  if(g.enrage&&g.etat!=='chaine'&&d>C.perimetre&&!BLOQUE[P.etat]&&P.etat!=='saut'&&P.etat!=='sautOmbre'){
    g.zone=null;g.lim=null;g.etat='chaine';g.t=0;g.accroche=false;son('chaine');stats.chaines++;
  }
  switch(g.etat){
    case 'normal':
      g.regC=versP;tourner(g,versP,dt);
      if(g.cdS<=0&&d<C.portee&&ecart<1.2&&pPeutBouger()&&jeton()){debutZoneColosse(g);break;}
      if(d>g.r+1.3)versLeP(g,g.vit*fV(g),dt);
      break;
    case 'zone':{
      const nom=g.zk,T=nom==='onde'?C.ondeT:C[nom].T,dmg=nom==='onde'?C.onde:C[nom].dmg;
      if(nom==='onde'){
        /* un grand demi-disque devant lui, arrêté par les murs : le rouge ne se dessine pas derrière, on voit où on est à l'abri */
        if(g.t<C.figeT){tourner(g,versP,dt);g.va=g.fa;g.lim=limOnde(g);}else if(!g.lim)g.lim=limOnde(g);
        g.fa=g.va;g.regC=g.va;
      }
      g.zone=zoneColosse(g,nom,g.t/T);
      if(g.t>=T){
        const z=g.zone;son('onde');secousse(nom==='onde'?10:7);
        if(nom==='onde')parts.push({k:'souffle',x:g.x,y:g.y,z:0,ox:0,oy:0,vie:.45,max:.45,a:g.va,lim:g.lim});
        else parts.push({k:'onde',x:g.x,y:g.y,z:0,ox:0,oy:0,vie:.4,max:.4,s:nom==='pilon'?2.6:4});
        const abri=nom==='onde'&&!dansZone(z,P.x,P.y,0.25)&&dansZone({k:'demi',x:g.x,y:g.y,a:g.va,R:C.rayon,lim:null},P.x,P.y,0);
        frapperZone(g,z,dmg,{nom});
        if(abri){texte(P.x,P.y,1.9,"À l'abri !",'#9fe6c0');stats.abris++;}
        g.cdS=C.entre;g.lim=null;finCoup(g,0.45);
      }
      break;}
    case 'chaine':
      /* la chaîne part, accroche, ramène le Pisteur devant lui (aucun dégât), et l'onde démarre aussitôt : elle s'évite à pied */
      g.fa=versP;g.regC=versP;g.reg=versP;
      if(!g.accroche&&g.t>=C.chaineT[0]){
        g.accroche=true;
        if(P.etat!=='aterre'){
          sortirOmbre('coup');if(P.etat==='bandage')bandagePerdu();
          Object.assign(P,{etat:'chaine',t:0,dur:C.chaineT[1],ax:P.x,ay:P.y,bx:g.x+Math.cos(versP)*(g.r+1.15),by:g.y+Math.sin(versP)*(g.r+1.15),tampon:0,z:0});
          texte(P.x,P.y,2.3,'Enchaîné !','#ffb070');son('bang');
        }
      }
      if(g.t>=C.chaineT[0]+C.chaineT[1]+0.05)debutZoneColosse(g,'onde');
      break;
    case 'recup':if(g.t>=g.recup){g.etat='normal';g.t=0;}break;
  }
}
const IA={chien:iaChien,javelot:iaJavelot,belier:iaBelier,mortier:iaMortier,dalle:iaDalle,faucheur:iaFaucheur,cuirasse:iaCuirasse,colosse:iaColosse,repare:iaRepare};

/* ======================= les colères (Bible §17.31 et §17.32) =======================
   Un groupe frappé par le Pisteur, ET QUI LE SAIT, se met en colère jusqu'à sa mort (un golem tué d'un seul coup sans témoin : le groupe
   ne sait rien, il n'y a pas de colère). Chaque sorte de golem a la sienne ; les gros groupes les mélangent tout seuls.
   - tout le groupe est touché : la meute flaire la piste ; le garde se colle au dos de son javelot blessé ; le mortier bombarde à l'aveugle ;
     le bélier devient fou ; les autres suivent la meute s'il y en a une ;
   - il faut l'avoir frappé LUI (colereDe) : le faucheur devient un fantôme, le cuirassé une boule, le colosse sort sa chaîne. */
function facher(grp){
  if(grpColere[grp])return;
  grpColere[grp]=tReel;stats.coleres++;
  const fin=pisteBase+piste.length-1;
  for(const g of G){if(g.grp!==grp||g.etat==='mort')continue;g.colere=true;g.pi=fin;g.piT=tReel;g.excl=tReel+0.9;g.but=null;}
  sonColere(grp);
}
function colereDe(g){
  if(g.type==='faucheur'&&!g.furie){g.furie=true;g.fenetre=tReel+REG.faucheur.fenetre;}
  else if(g.type==='cuirasse')g.boule=true;
  else if(g.type==='colosse'&&!g.enrage){
    g.enrage=true;
  }
}
/* le javelot blessé que ce garde doit couvrir ; le garde qui couvre ce javelot */
function javelotACouvrir(g){
  let best=null,bd=1e9;
  for(const o of G){if(o.type!=='javelot'||o.grp!==g.grp||!vivant(o)||o.hp>=o.max||o.dort)continue;const d=hyp(o.x-g.x,o.y-g.y);if(d<bd){bd=d;best=o;}}
  return best;
}
function gardeDe(j){
  if(j.type!=='javelot')return null;
  for(const o of G)if(o.colle===j&&vivant(o)&&o.sonne<=0&&!o.dort&&hyp(o.x-j.x,o.y-j.y)<j.r+o.r+0.8)return o;
  return null;
}
function coller(g,j,dt){
  /* dos à dos : le garde se tient derrière le javelot et regarde derrière lui */
  const a=j.fa+Math.PI,L=j.r+g.r+0.12;let tx=j.x+Math.cos(a)*L,ty=j.y+Math.sin(a)*L;
  if(obsEn(tx,ty,g.r*0.8,false)||horsSalle(tx,ty,g.r)){
    for(const da of [1.2,-1.2,2.2,-2.2]){const x=j.x+Math.cos(a+da)*L,y=j.y+Math.sin(a+da)*L;if(!obsEn(x,y,g.r*0.8,false)&&!horsSalle(x,y,g.r)){tx=x;ty=y;break;}}
  }
  const d=hyp(g.x-tx,g.y-ty);
  if(d>1.6)allerBut(g,tx,ty,g.vit*1.25,dt,0.25);else if(d>0.15)allerVers(g,tx,ty,g.vit*1.25,dt);
  if(hyp(g.x-j.x,g.y-j.y)<j.r+g.r+0.7){
    g.colle=j;
    if(!g.voit){tourner(g,a,dt);g.regC=a+Math.sin(tReel*1.1+g.id*5)*0.7;}
  }
}
/* la meute en colère remonte la piste du Pisteur, le nez au sol, sans courir : dans l'ombre aussi */
function flairer(g,dt){
  const fin=pisteBase+piste.length-1;
  if(g.pi<pisteBase)g.pi=pisteBase;if(g.pi>fin)g.pi=fin;
  let c=piste[g.pi-pisteBase];
  /* il avance de caillou en caillou. Le Pisteur passe là où un golem ne passe pas (tout contre un mur, par-dessus un muret) :
     un caillou qu'il ne peut pas atteindre, ou qu'il n'atteint pas en trois secondes, il le saute et reprend la piste plus loin */
  while(g.pi<fin&&(hyp(g.x-c.x,g.y-c.y)<0.6||bloque[cel(c.x,c.y)]||tReel-g.piT>3)){g.pi++;c=piste[g.pi-pisteBase];g.piT=tReel;}
  if(hyp(g.x-c.x,g.y-c.y)>0.3)allerBut(g,c.x,c.y,REG.chien.flair*fV(g),dt,0.3);
  g.regC=g.fa+Math.sin(tReel*3+g.id*7)*0.35;
}
/* ceux qui n'ont pas de colère à eux suivent la meute qui flaire : elle les mène au Pisteur */
function suivreMeute(g,dt){
  let chef=null;
  for(const o of G)if(o.type==='chien'&&o.grp===g.grp&&o.colere&&vivant(o)&&o.sonne<=0&&!o.dort&&(!chef||o.pi>chef.pi))chef=o;
  if(!chef)return false;
  let bx=chef.x-Math.cos(chef.dirM)*1.7,by=chef.y-Math.sin(chef.dirM)*1.7;
  if(obsEn(bx,by,0.42,false)||horsSalle(bx,by,0.42)){bx=chef.x;by=chef.y;}
  if(hyp(g.x-bx,g.y-by)>0.6)allerBut(g,bx,by,Math.min(g.vit,REG.chien.flair*1.2)*fV(g),dt,0.4);else tourner(g,chef.fa,dt,0.5);
  g.regC=g.fa+Math.sin(tReel*0.9+g.id*5)*0.8;
  return true;
}
/* courir d'un coin de la salle à l'autre (le bélier fou, le fantôme qui cherche) */
function errer(g,dt,v){
  if(!g.but||tReel>g.butT||hyp(g.x-g.but.x,g.y-g.but.y)<0.9){const q=RONDES[(Math.random()*RONDES.length)|0];g.but={x:q.x,y:q.y};g.butT=tReel+9;g.ch=null;}
  allerBut(g,g.but.x,g.but.y,v,dt,0.6);
}
function mortierAveugle(g,dt){
  const M=REG.mortier;g.regC=g.fa+Math.sin(tReel*1.3+g.id*6)*1.2;
  if(g.cdS>0)return;
  /* un point au hasard autour de lui, jamais sur ses amis */
  for(let k=0;k<8;k++){
    const a=Math.random()*TAU,L=rnd(M.aveugleR[0],M.aveugleR[1]),x=g.x+Math.cos(a)*L,y=g.y+Math.sin(a)*L;
    if(horsSalle(x,y,0.6))continue;
    if(!cibleObusOk(x,y,g,0.5))continue;
    g.etat='tire';g.t=0;g.tirX=x;g.tirY=y;g.aveugle=true;
    return;
  }
  g.cdS=0.3;
}
function enColere(g,dt,d){
  switch(g.type){
    case 'chien':flairer(g,dt);return true;
    case 'mortier':return false;                              /* le mortier n'est plus lié à la colère de son groupe : il se déchaîne quand il VOIT le Pisteur (mortierDechaine) */
    case 'repare':return suivreMeute(g,dt);                   /* le réparateur n'a pas de colère : il suit */
    case 'belier':
      if(tReel-g.suT<2.5)return false;                        /* il sait où était le Pisteur à l'instant : il y va d'abord (son demi-tour lent) */
      errer(g,dt,g.vit*REG.belier.fou);tourner(g,g.dirM,dt);g.regC=g.fa;
      return true;
    default:return suivreMeute(g,dt);
  }
}
/* le faucheur frappé qu'on n'a pas fini : un fantôme. On le voit rôder, on ne peut pas le toucher. Dès que le Pisteur se montre,
   il fonce sur lui, surgit et fauche ; après son coup, il reste visible cinq secondes. */
function devenirFantome(g){
  g.fantome=true;g.zone=null;g.but=null;eclatOmbre(g.x,g.y,g.T.h*0.5);texte(g.x,g.y,g.T.h+0.5,"Il s'efface…",'#c8b6ff');son('fantome');
}
function fantome(g,dt,d){
  const F=REG.faucheur,versP=Math.atan2(P.y-g.y,P.x-g.x);
  if(!P.ombre&&P.etat!=='aterre'){
    g.regC=versP;
    if(d<2.5&&vue(g.x,g.y,P.x,P.y)){
      tourner(g,versP,dt);
      if(pPeutBouger()&&P.etat!=='saut'&&jeton()){g.fantome=false;g.fa=versP;g.reg=versP;eclatOmbre(g.x,g.y,g.T.h*0.5);son('fantome');debutFauche(g);}
      return;
    }
    allerBut(g,P.x,P.y,g.vit*F.vFantome,dt,1.2);tourner(g,g.dirM,dt);
  }else{
    errer(g,dt,g.vit*0.6);tourner(g,g.dirM,dt);g.regC=g.fa+Math.sin(tReel*0.8+g.id*5)*0.9;
  }
}

/* ======================= le 25 novembre à 22 h : la ruée, le mortier déchaîné, le réparateur, le sommeil, le sifflet ======================= */
/* Un golem frappé par le Pisteur, et pas tué : tout son groupe sait où est le Pisteur À CET INSTANT et se rue dessus (les autres groupes
   ne bougent pas). Ensuite, chacun ne sait que ce qu'il voit : si le Pisteur a déjà filé, ils ne trouvent personne… et la meute reprend sa piste. */
function ruer(g){
  const fin=pisteBase+piste.length-1;
  for(const o of G){
    if(o.grp!==g.grp||!vivant(o)||o.sonne>0||o.dort)continue;
    o.su.x=P.x;o.su.y=P.y;o.suT=tReel;o.bruit=false;o.ch=null;o.rue=tReel+REG.ruee;o.pi=fin;o.piT=tReel;o.leurre=null;
    if(o.mode!=='chasse'){o.mode='chasse';o.reagit=o.T.reac;o.excl=tReel+0.8;}
  }
}
/* LE MORTIER : dès qu'il voit le Pisteur de ses yeux, il se déchaîne, et il ne s'arrête plus jamais (même si le Pisteur disparaît).
   Il vise quand lui ou son groupe voit le Pisteur ; sinon il bombarde à l'aveugle, tout autour de lui. */
function dechainer(g){
  g.dechaine=true;g.excl=tReel+0.9;g.cdS=Math.min(g.cdS,0.2);son('dechaine');stats.dechaines++;
}
function mortierDechaine(g,dt,d){
  if(g.voit||(grpVoit[g.grp]&&tReel-g.suT<0.5)){
    const versP=Math.atan2(P.y-g.y,P.x-g.x);g.regC=versP;tourner(g,versP,dt);
    if(g.cdS<=0&&d>1.5&&pPeutBouger()){g.etat='tire';g.t=0;g.tirX=null;g.aveugle=false;son('zMortier');return;}
    if(d<3.5)allerVers(g,g.x-Math.cos(versP),g.y-Math.sin(versP),g.vit*fV(g),dt);
  }else mortierAveugle(g,dt);
}
/* Un obus blesse tout le monde, mais les golems en sortent toujours : le mortier ne tire jamais là où un des siens ne pourrait pas
   s'écarter à temps (un golem en plein geste). Celui qui est assommé ou endormi, il ne peut pas le savoir : celui-là prend l'obus. */
function cibleObusOk(x,y,de,marge){
  const M=REG.mortier;
  for(const o of G){
    if(o===de||!vivant(o)||o.fantome||o.sonne>0||o.dort)continue;
    const lim=M.rayon+o.r*0.7+0.3+(marge||0),d=hyp(o.x-x,o.y-y);
    if(d<lim&&(o.etat!=='normal'||o.z>0.1||marge))return false;
  }
  return true;
}
/* LA FLÈCHE QUI ENDORT : il dort pour de bon, jusqu'au premier coup */
function endormir(g){
  if(g.etat==='roule'||g.etat==='ramasse'){g.etat='normal';}
  g.dort=true;g.zone=null;g.z=0;g.etat='normal';g.t=0;g.voit=false;g.rem=0;g.hes=0;g.lim=null;g.sonne=0;g.reveil=false;g.mode='ronde';g.colle=null;g.leurre=null;g.rue=-9;g.bouge=false;
  texte(g.x,g.y,g.T.h+0.6,'Zzz…','#ffe08a');etincelles(g.x,g.y,g.T.h*0.8,'#ffe08a',8);stats.endormis++;
}
/* LE SIFFLET : un bruit ailleurs dans la salle. Tout le groupe du golem visé part voir, loin des autres groupes et loin du Pisteur. */
function siffler(g){
  const C=REG.cartes.sifflet;let best=null,bs=-1e9;
  let gx=0,gy=0,n=0;for(const o of G)if(o.grp===g.grp&&vivant(o)){gx+=o.x;gy+=o.y;n++;}gx/=n;gy/=n;
  for(const q of RONDES){
    const dG=hyp(q.x-gx,q.y-gy);if(dG<C.loin)continue;
    let dA=99;for(const o of G)if(vivant(o)&&o.grp!==g.grp)dA=Math.min(dA,hyp(o.x-q.x,o.y-q.y));
    const s=Math.min(dA,9)+Math.min(hyp(q.x-P.x,q.y-P.y),9)*0.8+Math.min(dG,14)*0.4;
    if(s>bs){bs=s;best=q;}
  }
  if(!best)for(const q of RONDES){const s=hyp(q.x-gx,q.y-gy);if(s>bs){bs=s;best=q;}}
  const L={x:best.x,y:best.y,t:tReel+C.duree,grp:g.grp};
  for(const o of G){
    if(o.grp!==g.grp||!vivant(o)||o.dort||o.sonne>0||o.type==='colosse')continue;
    o.leurre=L;o.mode='ronde';o.ch=null;o.bruit=false;o.reagit=o.T.reac+0.2;o.excl=0;o.fouilleT=0;o.su.x=L.x;o.su.y=L.y;
  }
  parts.push({k:'note',x:best.x,y:best.y,z:1.2,ox:0,oy:0,vie:2.2,max:2.2});son('sifflet');stats.siffles++;
  leurres.push(L);
}
let leurres=[];
function leurrer(g,dt){
  const L=g.leurre;
  if(tReel>=L.t){g.leurre=null;g.ch=null;return false;}
  if(hyp(g.x-L.x,g.y-L.y)>1.8){
    allerBut(g,L.x,L.y,g.vit*0.8*fV(g),dt,1.2);g.regC=g.fa;
  }else{
    /* arrivé : il cherche autour de lui, à gauche, à droite, derrière */
    g.fouilleT+=dt;const k=Math.floor(g.fouilleT/1.3)%4;
    tourner(g,g.id*6+[0,1.6,3.1,4.7][k],dt,0.6);g.regC=g.fa;
  }
  return true;
}
/* LE RÉPARATEUR : il ne se bat pas. Dès qu'un golem de son groupe est blessé, il va se pencher dessus : trente points rendus toutes les
   trois secondes. Penché, il ne regarde rien d'autre : c'est le moment de le cueillir. L'erreur du joueur, c'est de laisser un blessé
   derrière lui ; sa réponse, c'est de tuer le réparateur en premier. */
function patientDe(g){
  let best=null,bd=1e9;
  for(const o of G){
    if(o===g||o.grp!==g.grp||!vivant(o)||o.hp>=o.max||o.etat==='roule'||o.etat==='ramasse'||o.z>0.2)continue;
    const dd=hyp(o.x-g.x,o.y-g.y)-(g.soin===o?1.5:0);if(dd<bd){bd=dd;best=o;}
  }
  return best;
}
function reparer(g,dt){
  const R=REG.repare,o=patientDe(g);
  if(!o){g.soin=null;g.soinT=0;return false;}
  if(g.soin!==o){g.soin=o;g.soinT=0;}
  const dd=hyp(o.x-g.x,o.y-g.y),L=g.r+o.r+R.portee;
  if(dd>L){allerBut(g,o.x,o.y,g.vit*fV(g),dt,L*0.85);g.regC=g.fa;return true;}
  g.penche=true;const a=Math.atan2(o.y-g.y,o.x-g.x);tourner(g,a,dt);g.regC=a;g.soinT+=dt;
  if(g.soinT>=R.T){
    g.soinT=0;const av=o.hp;o.hp=Math.min(o.max,o.hp+R.soin);stats.repares+=o.hp-av;g.tFrappe=tReel;
    texte(o.x,o.y,o.T.h+0.4,'+'+(o.hp-av),'#9fe6c0');etincelles(o.x,o.y,o.T.h*0.5,'#9fe6c0',10);son('soin',o.x,o.y);
  }
  return true;
}
function iaRepare(g,dt,d){
  /* il voit le Pisteur : il recule, c'est tout */
  const versP=Math.atan2(P.y-g.y,P.x-g.x);g.regC=versP;tourner(g,versP,dt);
  if(g.etat==='recup'){if(g.t>=g.recup){g.etat='normal';g.t=0;}return;}
  if(d<5){const x0=g.x,y0=g.y;allerVers(g,g.x-Math.cos(versP),g.y-Math.sin(versP),g.vit*0.85*fV(g),dt);pousserHors(g,g.r,false);
    if(hyp(g.x-x0,g.y-y0)<g.vit*dt*0.3){const s=g.id>0.5?1:-1;allerVers(g,g.x-Math.sin(versP)*s,g.y+Math.cos(versP)*s,g.vit*0.85*fV(g),dt);}}
}

/* ======================= tous les golems, image après image ======================= */
function majGolems(dt){
  for(const g of G){
    sonSrc=g;                                               /* (son.js : les sons de son tour partent de lui) */
    g.t+=dt;g.cd-=dt;g.cdS-=dt;g.cdM-=dt;if(g.flash>0)g.flash=Math.max(0,g.flash-dt*6);
    if(g.etat==='mort')continue;
    g.colle=null;g.penche=false;
    if(g.etat==='entre'){
      allerVers(g,g.tx,g.ty,Math.max(2.4,g.vit),dt);g.fa=Math.atan2(g.ty-g.y,g.tx-g.x);g.reg=g.fa;g.regC=g.fa;g.bouge=true;
      if(hyp(g.x-g.tx,g.y-g.ty)<0.12){g.etat='normal';g.t=0;}
      continue;
    }
    if(g.sonne>0){g.sonne-=dt;g.bouge=false;if(g.sonne<=0)reveiller(g);continue;}       /* sonné : il ne bouge pas, ne crie pas, ne sort pas du rouge */
    if(g.dort){g.bouge=false;g.zone=null;continue;}                                   /* endormi par la flèche : il ne voit rien, n'entend rien, jusqu'au premier coup */
    if(g.furie&&!g.fantome&&g.etat==='normal'&&tReel>g.fenetre)devenirFantome(g);
    const avant=g.marche,d=hyp(P.x-g.x,P.y-g.y);let j=null;
    if(g.etat!=='normal')IA[g.type](g,dt,d);                 /* un geste commencé va jusqu'au bout */
    else if(g.boule)debutRamasse(g);                         /* le cuirassé en colère ne marche plus : il roule */
    else if(g.fantome)fantome(g,dt,d);
    else if(fuirRouge(g,dt)){}
    else if(g.type==='repare'&&reparer(g,dt)){}             /* un blessé dans son groupe : il y va, se penche dessus, et ne regarde plus rien d'autre */
    else if(g.reagit>0){
      /* plus il est gros, plus il met de temps à réagir */
      g.reagit-=dt;const a=Math.atan2(g.su.y-g.y,g.su.x-g.x);g.regC=a;if(!g.T.raide)tourner(g,a,dt,0.35);
    }
    else if(g.type==='dalle'&&g.colere&&(j=javelotACouvrir(g))){coller(g,j,dt);if(g.voit&&g.colle)iaDalle(g,dt,d);}
    else if(g.type==='mortier'&&g.dechaine)mortierDechaine(g,dt,d);        /* il a vu le Pisteur une fois : il ne s'arrête plus */
    else if(g.voit)IA[g.type](g,dt,d);
    else if(g.mode==='chasse'&&(tReel<g.rue||grpVoit[g.grp]))chasseSansVue(g,dt);      /* un des siens vient d'être frappé, ou voit le Pisteur : il fonce (avant toute colère) */
    else if(g.leurre&&leurrer(g,dt)){}                       /* le coup de sifflet : il est parti voir */
    else if(g.colere&&enColere(g,dt,d)){}
    else if(g.mode==='chasse')chasseSansVue(g,dt);
    else if(g.mode==='fouille')fouille(g,dt);
    else ronde(g,dt);
    /* le regard : il rattrape la direction voulue en douceur (le corps peut tourner d'un coup, le regard balaie) */
    { const lim=g.T.raide?0:1.25,c=g.fa+clamp(ang(g.regC-g.fa),-lim,lim),dr=ang(c-g.reg),v=REG.regard*(g.voit?2:1)*dt;g.reg=ang(g.reg+clamp(dr,-v,v)); }
    g.bouge=g.marche!==avant;
  }
  sonSrc=null;
  const libre=g=>!vivant(g)||g.z>0.1||g.etat==='charge'||g.etat==='roule'||g.fantome;
  for(let i=0;i<G.length;i++){const a=G[i];if(libre(a))continue;
    for(let j=i+1;j<G.length;j++){const b=G[j];if(libre(b))continue;
      const dx=b.x-a.x,dy=b.y-a.y,d=hyp(dx,dy),m=a.r+b.r;
      if(d<m&&d>1e-4){
        /* ils s'écartent, et glissent un peu de côté : deux golems face à face ne restent pas bloqués nez à nez */
        const k=(m-d)/2,wa=a.type==='colosse'||a.sonne>0||a.dort?0.15:1,wb=b.type==='colosse'||b.sonne>0||b.dort?0.15:1,ux=dx/d,uy=dy/d,gl=0.45;
        a.x-=(ux-uy*gl)*k*wa;a.y-=(uy+ux*gl)*k*wa;b.x+=(ux-uy*gl)*k*wb;b.y+=(uy+ux*gl)*k*wb;}
    }}
  for(const g of G){if(vivant(g)&&g.z<=0.1&&g.etat!=='charge'&&g.etat!=='roule')pousserHors(g,g.r,false);}
  G=G.filter(g=>!(g.etat==='mort'&&g.t>0.6));
}
