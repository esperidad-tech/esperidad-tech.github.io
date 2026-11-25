/* ======================= voir et être vu ======================= */
const GT={
  chien:{nom:'rôdeur',hp:3,r:0.38,vit:5.0,h:0.8,vue:5.5,cone:1.05,m:'trotteur',sc:0.55,pas:0.9},
  javelot:{nom:'javelot',hp:5,r:0.4,vit:3.4,h:1.15,vue:8,cone:0.9,m:'danseur',sc:0.6,pas:1.0},
  belier:{nom:'bélier',hp:11,r:0.62,vit:3.0,h:1.1,vue:6.5,cone:0.9,m:'fonceur',sc:0.62,pas:1.1},
  mortier:{nom:'mortier',hp:5,r:0.5,vit:2.4,h:1.15,vue:8,cone:0.9,m:'lanceur',sc:0.58,pas:1.0},
  dalle:{nom:'porte-dalle',hp:10,r:0.56,vit:2.7,h:1.2,vue:6,cone:0.9,m:'bouclier',sc:0.6,pas:1.0},
  faucheur:{nom:'faucheur',hp:9,r:0.5,vit:3.0,h:1.4,vue:6,cone:0.9,m:'soldat',sc:0.6,pas:1.1},
  cuirasse:{nom:'cuirassé',hp:12,r:0.5,vit:2.3,h:1.45,vue:6.5,cone:0.9,m:'cuirasse',sc:0.58,pas:1.1,armure:1},
  colosse:{nom:'colosse',hp:38,r:1.05,vit:1.8,h:2.6,vue:7,cone:1.0,m:'gros',sc:0.86,pas:1.6}
};
function voitJ(g){
  if(!vivant(g)||tReel<g.sonneJ||g.etat==='sonne')return false;
  if(P.invisible>0||P.etat==='aterre')return false;
  if(dansNuage(P.x,P.y)||dansNuage(g.x,g.y))return false;
  const dx=P.x-g.x,dy=P.y-g.y,d=hyp(dx,dy);
  if(garde==='alerte'){if(d>17)return false;}
  else{if(d>g.T.vue)return false;if(d>1.5&&Math.abs(ang(Math.atan2(dy,dx)-g.fa))>g.T.cone)return false;}
  return vue(g.x,g.y,P.x,P.y);
}
function alerter(g){
  if(garde==='alerte')return;
  garde='alerte';tSansVue=0;CX=P.x;CY=P.y;dernVu.x=P.x;dernVu.y=P.y;stats.reperages++;
  for(const o of G){o.rem=0;o.but=null;o.enquete=null;if(vivant(o)){o.excl=tReel+0.9;o.cd=Math.max(o.cd,0.35);}}
  son('alerte');majBoutons();
  dire('alerte1',"Repéré ! Toute la garde sait où tu es. Casse la ligne de vue derrière un mur, et ils te perdront.");
}
function perdre(){
  if(garde!=='alerte')return;
  garde='recherche';tRecherche=0;P.ombreProt=true;
  let ex=dernVu.x,ey=dernVu.y;
  if(P.up.echo){const a=Math.random()*TAU;ex=clamp(ex+Math.cos(a)*3,1,RW-1);ey=clamp(ey+Math.sin(a)*3,2,RD-1);}
  DIR.fouille.x=ex;DIR.fouille.y=ey;DIR.fouilleT=tReel;
  for(const o of G)if(vivant(o)){o.inter=tReel+1.6;o.but=null;o.fouilleN=0;o.arme=false;}
  son('perdu');majBoutons();
  dire('cache1',"Ils t'ont perdu ! Tes boutons sont violets : la dague assassine, l'arc vise, le bond surgit dans un dos.",true);
}
function reperer(g){
  if(P.up.vivante&&tReel>P.vivT){P.vivT=tReel+8;P.invisible=2;for(const o of G)o.rem=0;texte(P.x,P.y,2.2,'Ombre vivante','#c8b6ff');return;}
  if(P.up.leurre&&tReel>P.leurreT){P.leurreT=tReel+12;leurres.push({x:P.x,y:P.y,t:4});P.invisible=1.6;for(const o of G){o.rem=0;o.but=null;}texte(P.x,P.y,2.2,'Le leurre !','#c8b6ff');return;}
  alerter(g);
}
function majPerception(dt){
  let n=0;for(const g of G){g.voit=voitJ(g);if(g.voit)n++;}
  nVus=n;
  if(garde==='alerte'){
    if(n>0||(DIR.assaut&&P.invisible<=0)){tSansVue=0;CX=P.x;CY=P.y;dernVu.x=P.x;dernVu.y=P.y;}
    else{tSansVue+=dt;if(tSansVue>1.1&&!DIR.assaut)perdre();}
  }else{
    tCacheCumul+=dt;
    for(const g of G){
      if(g.voit){
        const d=hyp(P.x-g.x,P.y-g.y);
        if(g.role==='embuscade'&&d<3.6)g.rem=1;
        g.rem+=dt/((0.5+d*0.07)*(P.up.feutre?2:1)*(dur?0.75:1));
        if(g.rem>=1){reperer(g);if(garde==='alerte')break;}
      }else g.rem=Math.max(0,g.rem-dt*1.2);
    }
    if(garde==='recherche'){tRecherche+=dt;if(tRecherche>11){garde='calme';for(const g of G)g.but=null;}}
  }
  const c=garde!=='alerte';if(c!==P.cache){P.cache=c;majBoutons();}
  for(const n2 of nuages)n2.t-=dt;if(nuages.length)nuages=nuages.filter(q=>q.t>0);
  for(const l of leurres)l.t-=dt;if(leurres.length)leurres=leurres.filter(q=>q.t>0);
}

/* ======================= Grosbec le stratège ======================= */
const ORDRES={patrouille:'Rôdeurs ! En patrouille !',groupes:'Restez groupés !',debusque:'Débusquez-le !',assaut:'Tous sur lui !'};
function ordre(nom){
  if(DIR[nom])return;DIR[nom]=true;DIR.ordreTxt=ORDRES[nom];DIR.ordreT=tReel;
  gbGeste('envoi',Math.random()<.5?1:-1);gbDire(ORDRES[nom]);son('ordre');stats.ordres++;
  let qui=G.filter(vivant);
  if(nom==='patrouille'){qui=qui.filter(g=>g.type==='chien');for(const g of qui){g.role='ronde';g.meute=91;g.but=null;}
    dire('ordre1',"Grosbec change de plan : ses ordres s'écrivent en rouge. À toi de changer le tien.");}
  if(nom==='groupes'){for(const g of qui){if(g.role!=='escorte')g.role='ronde';g.meute=92;g.but=null;}
    dire('ordre2',"Les voilà en troupeau : plus de témoins autour de chaque golem. Il va falloir ruser.");}
  if(nom==='debusque'){dire('ordre3',"Grosbec en a assez d'attendre : ses golems fouillent chaque cachette. Bouge !");}
  if(nom==='assaut'){
    if(P.up.cape){P.invisible=Math.max(P.invisible,2);texte(P.x,P.y,2.2,"Cape d'ombre",'#c8b6ff');}
    alerter(null);dire('ordre4',"Plus moyen de se cacher : Grosbec ne te lâche plus des yeux. Il faut finir à découvert.",true);
  }
  for(const g of qui)DIR.fils.push({g,t:tReel});
}
function directeurAssassinat(g,discret){
  DIR.nAss++;
  if(discret&&!P.up.disparition)DIR.oeil.boost*=1.3;
  if(g.type==='chien'&&!DIR.patrouille&&G.some(o=>vivant(o)&&o.type==='chien'&&(o.role==='embuscade'||o.role==='appat')))ordre('patrouille');
  else if(DIR.nAss>=2&&!DIR.groupes&&vague>=2&&G.filter(vivant).length>=3)ordre('groupes');
}
function majDirecteur(dt){
  if(phase!=='vague')return;
  tVague+=dt;
  const V=VAGUES[vague],O=DIR.oeil;
  GBE.colere=Math.min(1,tVague/V.enrage)*(DIR.assaut?1:0.6);
  if(DIR.fils.length)DIR.fils=DIR.fils.filter(f=>tReel-f.t<1.3&&vivant(f.g));
  if(garde!=='alerte'&&!DIR.assaut){
    /* son regard balaie la salle, de plus en plus vite */
    const vit=(0.2+0.03*vague)*(1+tVague/45)*O.boost*(dur?1.25:1);
    O.larg=Math.min(0.3,0.07+tVague*0.0022+vague*0.004);
    O.a+=O.sens*vit*dt;if(O.a>Math.PI-0.22){O.a=Math.PI-0.22;O.sens=-1;}if(O.a<0.22){O.a=0.22;O.sens=1;}
    const da=Math.abs(ang(Math.atan2(P.y-GBY,P.x-GBX)-O.a));
    if(da<O.larg+0.5&&!vus.regard0)dire('regard0',"Le faisceau rouge, c'est le regard de Grosbec. Mets un pilier ou un grand mur entre lui et toi.",true);
    if(P.invisible<=0&&tReel>O.aveugle&&da<O.larg&&vue(GBX,GBY,P.x,P.y,true)){
      O.sur+=dt;
      if(O.sur>0.4){
        O.sur=0;
        if(P.up.cape&&P.capeGaze>0){P.capeGaze--;O.aveugle=tReel+3;texte(P.x,P.y,2.2,"Cape d'ombre",'#c8b6ff');}
        else{gbDire('Là ! Je le vois !');gbGeste('envoi',P.x<GBX?-1:1);son('ordre');alerter(null);
          dire('oeil1',"Le regard de Grosbec t'a trouvé ! Seuls les piliers et les grands murs l'arrêtent.",true);}
      }
    }else O.sur=Math.max(0,O.sur-dt*2);
    if(!DIR.debusque&&vague>=1&&tCacheCumul>17-vague)ordre('debusque');
  }
  if(DIR.debusque&&garde!=='alerte'&&tReel-DIR.fouilleT>5){
    /* Grosbec devine à peu près où il est */
    const a=Math.random()*TAU,r=rnd(1.5,4.5);DIR.fouille.x=clamp(P.x+Math.cos(a)*r,1,RW-1);DIR.fouille.y=clamp(P.y+Math.sin(a)*r,2,RD-1);DIR.fouilleT=tReel;
    for(const g of G)if(g.role!=='escorte'){g.but=null;g.fouilleN=0;}
    if(garde==='calme'){garde='recherche';}tRecherche=0;
  }
  if(!DIR.assaut){
    const viv=G.filter(g=>g.etat!=='mort');
    if(tVague>V.enrage)ordre('assaut');
    else if(viv.length===1&&!file.length&&groupeI>=V.groupes.length&&!viv[0].T.armure){DIR.seulT+=dt;if(DIR.seulT>9)ordre('assaut');}
  }
}

/* ======================= les golems ======================= */
const arm=()=>(dur?0.8:1)*(P.up.oeil&&!P.cache?1.25:1);
function nouveauGolem(type,x,y,tx,ty,spec){
  const TT=GT[type],hp=Math.round(TT.hp*(dur?1.3:1));
  return {type,T:TT,x,y,z:0,r:TT.r,hp,max:hp,vit:TT.vit,etat:'entre',t:0,fa:Math.PI/2,cd:rnd(0.8,1.6),cdOnde:2.5,flash:0,kx:0,ky:0,arme:false,zone:null,tx,ty,
    aDalle:type==='dalle',fissure:0,marche:0,attente:0,sd:0,aTouche:false,ch:null,chT:-9,chX:0,chY:0,id:Math.random(),
    role:(spec&&spec.role)||'ronde',meute:(spec&&spec.meute)||0,poste:spec&&spec.poste?{x:spec.poste[0],y:spec.poste[1]}:null,posteA:spec&&spec.a!=null?spec.a:Math.PI/2,chef:null,
    voit:false,rem:0,sonneJ:0,cloueJ:0,marque:0,saigne:[],saigneT:0,ouvert:0,sansArmure:0,excl:0,inter:0,but:null,pauseT:0,court:false,fouilleN:0,enquete:null,
    pousse:false,pousseT:0,tFrappe:-9,dirM:Math.PI/2,vx:x,vy:y,vuT:-9,jamaisVu:true,yaw:0};
}
function jeton(){let n=0;for(const g of G)if(g.arme)n++;return n<(dur?3:2);}
function apparaitre(spec,ou){
  let x,y,tx,ty;
  if(ou==='g'){x=-0.8;y=9.4;tx=1.6;ty=9.4+rnd(-0.6,0.6);}
  else if(ou==='d'){x=RW+0.8;y=9.4;tx=RW-1.6;ty=9.4+rnd(-0.6,0.6);}
  else{const px0=ou==='p1'?8:18;x=px0+rnd(-0.3,0.3);y=0.2;tx=px0+rnd(-0.8,0.8);ty=3.0+rnd(0,0.6);porte[ou==='p1'?0:1]=1;}
  const g=nouveauGolem(spec.t,x,y,tx,ty,spec);G.push(g);son('porte');
  if(g.role==='embuscade'&&!g.poste){
    let best=null,bs=-1e9;
    for(const c of cachettes){if(vue(c.x,c.y,P.x,P.y))continue;const dP=hyp(c.x-P.x,c.y-P.y);if(dP<4.5||G.some(o=>o!==g&&o.poste&&hyp(o.poste.x-c.x,o.poste.y-c.y)<1.5))continue;const s=-Math.abs(dP-8)+Math.random()*3;if(s>bs){bs=s;best=c;}}
    if(best){g.poste={x:best.x,y:best.y};g.posteA=Math.atan2(best.y-best.o.y,best.x-best.o.x)+Math.PI;}else g.role='ronde';
  }
  if(g.role==='escorte')g.chef=G.find(o=>o.type==='dalle'&&vivant(o))||G.find(o=>o.type==='dalle');
  return g;
}
function sonner(g,d){
  if(!vivant(g))return;
  g.sonneJ=Math.max(g.sonneJ,tReel+d);g.arme=false;g.zone=null;g.z=0;
  if(g.etat!=='desarme'&&g.etat!=='nu')g.etat='normal';
  g.t=0;g.cd=Math.max(g.cd,0.5);
}
function blesserG(g,dmg,fx,fy,src,recul,opt){
  if(!vivant(g))return false;
  const coup=src==='dague'||src==='fleche'||src==='silence'||src==='javjoueur';
  if(g.T.armure&&tReel>g.sansArmure&&src!=='assassin'&&!(src==='saigne'&&P.up.saignee)){
    if(coup){son('bong');texte(g.x,g.y,g.T.h+0.4,'Tching !','#cfd8e6');etincelles(g.x,g.y,g.T.h*0.6,'#e8f4ff',7);if(src==='javjoueur')sonner(g,1.5);
      dire('armure1',"Tching ! Son armure arrête tout. Un seul moyen : le frapper en traître, depuis la cachette. Trois fois.",true);
      if(garde!=='alerte'&&src!=='silence')alerter(g);}
    return false;
  }
  if(g.type==='dalle'&&g.aDalle&&coup&&!(opt&&opt.parDessus)){
    const a=Math.abs(ang(Math.atan2(fy-g.y,fx-g.x)-g.fa));
    if(a<1.25){
      if(garde!=='alerte'&&src!=='silence')alerter(g);
      if(src==='javjoueur'){
        g.fissure++;son('bang');secousse(5);
        if(g.fissure>=2){g.aDalle=false;texte(g.x,g.y,2.2,'La dalle casse !','#ffcf9a');debrisDalle(g);stats.dalles++;dire('casse1',"La dalle a volé en éclats ! Le voilà à découvert.",true);}
        else{texte(g.x,g.y,2.2,'Fendue !','#ffcf9a');dire('fend1',"La dalle est fendue. Encore un javelot, et elle casse.",true);}
        return true;
      }
      son('bong');texte(g.x,g.y,2.2,'Bong !','#cfd8e6');etincelles(g.x+Math.cos(g.fa)*0.6,g.y+Math.sin(g.fa)*0.6,1,'#e8eef6',6);
      dire('bong1',"Bong ! De face, sa dalle arrête tout. Prends-le à revers.",true);return false;
    }
  }
  if(src==='dague'){
    if(P.up.hemorragie&&g.saigne.length)dmg+=1;
    if(tReel<g.ouvert)dmg*=2;
    if(P.up.grace&&g.hp<=g.max*0.25)dmg=999;
    if(P.up.dentelee){if(g.saigne.length<3)g.saigne.push(4);else g.saigne[0]=4;}
  }
  if((coup||src==='assassin')&&P.up.dernierPas&&P.coeurs===1)dmg*=2;
  g.hp-=dmg;g.flash=1;stats.degats+=Math.min(dmg,g.max);
  if(recul&&g.type!=='colosse'&&g.etat!=='charge'){const dx=g.x-fx,dy=g.y-fy,d=hyp(dx,dy)||1;g.kx=dx/d*recul*6;g.ky=dy/d*recul*6;g.pousse=recul>=1.3;}
  hitstop=Math.max(hitstop,src==='dague'?0.05:src==='saigne'?0:0.025);
  etincelles(g.x,g.y,g.T.h*0.55,src==='feu'?'#ff9a4a':src==='saigne'?'#ff5a4a':src==='assassin'?'#d6c4ff':'#fff2c0',src==='dague'?8:5);
  if(src!=='saigne')son(src==='feu'?'feu':'frappe');
  if(g.hp<=0)tuer(g,src);
  else if(garde!=='alerte'&&(src==='dague'||src==='fleche'||src==='javjoueur')&&!(opt&&opt.muet))alerter(g);
  return true;
}
function tuer(g,src){
  const avaitJav=g.type==='javelot'&&(g.etat==='normal'||g.etat==='arme');
  g.etat='mort';g.t=0;g.arme=false;g.zone=null;stats.tues++;P.kills++;
  son('acheve');secousse(g.type==='colosse'?10:4);
  eclatBrise(g.x,g.y,g.T.h*0.55,g.type==='colosse'?2:1);cailloux(g);
  if(avaitJav)items.push({x:g.x,y:g.y,a:g.fa,owner:null});
  if(P.up.soif&&P.kills%5===0&&P.coeurs<P.max){P.coeurs++;texte(P.x,P.y,2.2,'+1 ♥','#7dffb0');}
  if(P.up.chaine&&garde==='alerte')P.charges=P.up.deuxBonds?2:1;
  if(P.up.aube&&tReel<g.marque){let b=null,bd=1e9;for(const o of G){if(o===g||!vivant(o))continue;const d=hyp(o.x-g.x,o.y-g.y);if(d<bd){bd=d;b=o;}}if(b)b.marque=tReel+6;}
  if(g.type==='colosse'){flashB=0.5;dire(null,"Le colosse s'effondre !",true);}
  if(garde!=='alerte'&&(src==='dague'||src==='fleche'||src==='javjoueur')){const tem=temoinsDe(g);if(tem.length)alerter(tem[0]);else directeurAssassinat(g,true);}
}
function devant(g,x,y,cone){return Math.abs(ang(Math.atan2(y-g.y,x-g.x)-g.fa))<cone;}
function dansRect(px0,py0,x,y,a,L,l){const dx=px0-x,dy=py0-y,u=dx*Math.cos(a)+dy*Math.sin(a),v=-dx*Math.sin(a)+dy*Math.cos(a);return u>=-0.3&&u<=L&&Math.abs(v)<=l/2;}
function tourner(g,cible,vit,dt){const d=ang(cible-g.fa);g.fa+=clamp(d,-vit*dt,vit*dt);}
function suivreJ(g,v,dt){const [tx,ty]=pasVers(g,champJ);allerVers(g,tx,ty,v,dt);}
function fuirJ(g,v,dt){const [tx,ty]=pasVers(g,champJ,true);allerVers(g,tx,ty,v,dt);}
function penalJ(m){const x=((m%GW)+0.5)*CEL,y=(((m/GW)|0)+0.5)*CEL,d=hyp(x-CX,y-CY);return d<4.5?(4.5-d)*4:0;}
/* aller vers un but, par le chemin le plus court ; rend vrai une fois arrivé */
function allerBut(g,x,y,v,dt,tol){
  if(hyp(g.x-x,g.y-y)<(tol||0.5))return true;
  if(!g.ch||tReel-g.chT>0.8||Math.abs(g.chX-x)+Math.abs(g.chY-y)>0.6){g.ch=champ(x,y);g.chT=tReel;g.chX=x;g.chY=y;}
  const [tx,ty]=pasVers(g,g.ch),avant=g.x+g.y;allerVers(g,tx,ty,v,dt);
  if(Math.abs(g.x+g.y-avant)<1e-5)return true;
  tourner(g,g.dirM,6,dt);return false;
}
/* quand la garde ne sait pas où est le Pisteur : les rondes, les embuscades, la fouille */
function iaCalme(g,dt){
  if(g.type==='mortier'&&DIR.debusque&&g.cd<=0&&garde!=='calme'){
    g.cd=rnd(3.4,4.4);g.tFrappe=tReel;son('mortier');
    const cs=cachettes.slice().sort((a,b)=>hyp(a.x-P.x,a.y-P.y)-hyp(b.x-P.x,b.y-P.y)).slice(0,2);
    const c=[[DIR.fouille.x,DIR.fouille.y]].concat(cs.map(q=>[q.x+rnd(-0.5,0.5),q.y+rnd(-0.5,0.5)]));
    c.forEach((q,i)=>obus.push({x0:g.x,y0:g.y,x1:clamp(q[0],0.8,RW-0.8),y1:clamp(q[1],1.8,RD-0.6),t:-i*0.15,dur:1.6}));
    dire('debusque1',"Le mortier tire sur les cachettes pour te faire sortir. Change d'abri !");
  }
  let role=g.role;
  if(leurres.length)role='leurre';
  else if(g.enquete)role='enquete';
  else if(garde==='recherche'&&role!=='escorte')role='fouille';
  if(tReel<g.pauseT){g.fa+=Math.sin(tReel*2.2+g.id*9)*dt*1.5;return;}
  switch(role){
    case 'leurre':{const L=leurres[0];if(allerBut(g,L.x,L.y,g.vit,dt,1.1))g.fa+=Math.sin(tReel*5)*dt;break;}
    case 'enquete':if(allerBut(g,g.enquete.x,g.enquete.y,g.vit*0.75,dt,0.8)){g.enquete=null;g.pauseT=tReel+1.4;}break;
    case 'fouille':{
      if(!g.but){
        if(g.fouilleN===0){const a=g.id*TAU;g.but={x:clamp(DIR.fouille.x+Math.cos(a)*1.2,1,RW-1),y:clamp(DIR.fouille.y+Math.sin(a)*1.2,2,RD-1)};}
        else{const cs=cachettes.slice().sort((a,b)=>hyp(a.x-DIR.fouille.x,a.y-DIR.fouille.y)-hyp(b.x-DIR.fouille.x,b.y-DIR.fouille.y)),c=cs[Math.floor(g.id*5+g.fouilleN*1.7)%Math.min(7,cs.length)]||cs[0];g.but=c?{x:c.x,y:c.y}:{x:13,y:10};}
        g.fouilleN++;
      }
      if(allerBut(g,g.but.x,g.but.y,g.vit*(g.type==='chien'?0.8:0.75),dt,0.6)){g.but=null;g.pauseT=tReel+rnd(0.5,1.1);}
      break;}
    case 'ronde':{
      const chef=g.meute?G.find(o=>vivant(o)&&o.meute===g.meute&&(o.role==='ronde')):g;
      if(chef&&chef!==g){
        const i=G.indexOf(g),a=chef.fa+Math.PI+(i%2?0.9:-0.9),tx=chef.x+Math.cos(a)*1.3,ty=chef.y+Math.sin(a)*1.3;
        if(tReel<chef.pauseT){g.fa+=Math.sin(tReel*2+g.id*7)*dt*1.6;break;}
        if(hyp(g.x-tx,g.y-ty)>0.5){const libre=!obsEn(tx,ty,0.4,false)&&!horsSalle(tx,ty,0.4);allerBut(g,libre?tx:chef.x,libre?ty:chef.y,g.vit*(chef.court?1:0.55)*1.1,dt,0.4);}
        else tourner(g,chef.fa,4,dt);
        break;
      }
      if(!g.but){let q;const doux=tVague<14;for(let k=0;k<12;k++){q=RONDES[Math.floor(Math.random()*RONDES.length)];if(hyp(q.x-g.x,q.y-g.y)>5&&!(doux&&hyp(q.x-P.x,q.y-P.y)<8))break;}g.but={x:q.x,y:q.y};g.court=g.type==='chien'&&!doux&&Math.random()<0.35;}
      if(allerBut(g,g.but.x,g.but.y,g.vit*(g.court?1:0.5),dt,0.7)){g.but=null;g.pauseT=tReel+rnd(0.8,1.8);}
      break;}
    case 'escorte':{
      const c=g.chef;if(!c||!vivant(c)){g.role='ronde';break;}
      const a=c.fa+Math.PI,tx=c.x+Math.cos(a)*1.5,ty=c.y+Math.sin(a)*1.5;
      if(hyp(g.x-tx,g.y-ty)>0.5)allerBut(g,tx,ty,g.vit,dt,0.4);else tourner(g,c.fa,4,dt);
      break;}
    default:{   /* embuscade, appât, garde, barrage : il tient son poste */
      const p=g.poste||{x:g.x,y:g.y};
      if(allerBut(g,p.x,p.y,g.vit*0.8,dt,0.35))tourner(g,g.posteA+Math.sin(tReel*0.9+g.id*6)*(g.role==='embuscade'?0.25:0.6),2.5,dt);
    }
  }
}
function iaPoing(g,dt,dmg,duree,retour){
  tourner(g,Math.atan2(CY-g.y,CX-g.x),3,dt);
  g.zone={k:'cone',x:g.x,y:g.y,a:g.fa,R:g.r+1.1,h:0.8,p:g.t/(duree*arm())};
  if(g.t>=duree*arm()){g.zone=null;g.arme=false;g.tFrappe=tReel;if(hyp(P.x-g.x,P.y-g.y)<g.r+1.2&&devant(g,P.x,P.y,0.85))toucherP(dmg,g.x,g.y,1.4);g.etat='recup';g.retour=retour||'normal';g.t=0;g.cd=rnd(1.3,2.0);son('swishG');}
}
function iaChien(g,dt,d,vu){
  switch(g.etat){
    case 'normal':{
      if(garde!=='alerte'){iaCalme(g,dt);break;}
      const meute=G.filter(o=>o.type==='chien'&&(o.etat==='normal'||o.etat==='arme')&&tReel>=o.sonneJ);
      let tete=null,bt=9;for(const o of meute){const a=Math.abs(ang(Math.atan2(o.y-CY,o.x-CX)-P.fa));if(a<bt){bt=a;tete=o;}}
      let sa;if(g===tete)sa=P.fa;else{const autres=meute.filter(o=>o!==tete),i=autres.indexOf(g);sa=P.fa+Math.PI+(i%2?0.8:-0.8)+(i>=2?0.5:0);}
      const tx=CX+Math.cos(sa)*2.4,ty=CY+Math.sin(sa)*2.4;
      if(d>5.5||!vu||obsEn(tx,ty,0.3,false)||horsSalle(tx,ty,0.3))suivreJ(g,g.vit,dt);else allerVers(g,tx,ty,g.vit*0.9,dt);
      tourner(g,Math.atan2(CY-g.y,CX-g.x),8,dt);
      const dosJ=Math.abs(ang(Math.atan2(g.y-CY,g.x-CX)-P.fa))>1.9;
      if(g.cd<=0&&d<3.9&&vu&&jeton()&&(dosJ||tReel-dernierChien>3.2)){g.etat='arme';g.t=0;g.arme=true;dernierChien=tReel;g.lx=P.x;g.ly=P.y;son('grogne');
        dire('chien1',"Un rôdeur se ramasse : la flèche rouge montre son saut. Bondis au bon moment, il mordra le vide.");}
      break;}
    case 'arme':{
      if(g.t<0.36*arm()){g.lx=P.x;g.ly=P.y;}
      g.fa=Math.atan2(g.ly-g.y,g.lx-g.x);
      const L=Math.min(3.8,hyp(g.lx-g.x,g.ly-g.y)+0.5);
      g.zone={k:'fleche',x:g.x,y:g.y,a:g.fa,L,l:0.7,p:g.t/(0.62*arm())};
      if(g.t>=0.62*arm()){g.etat='saut';g.t=0;g.sx=g.x;g.sy=g.y;g.ex=g.x+Math.cos(g.fa)*L;g.ey=g.y+Math.sin(g.fa)*L;g.zone=null;g.arme=false;g.aTouche=false;son('saut');}
      break;}
    case 'saut':{
      const k=Math.min(1,g.t/0.26);g.x=lerp(g.sx,g.ex,k);g.y=lerp(g.sy,g.ey,k);g.z=Math.sin(Math.PI*k)*0.8;
      if(!g.aTouche&&k>0.55&&hyp(g.x-P.x,g.y-P.y)<0.85){g.aTouche=true;toucherP(1,g.x,g.y,1.0);}
      if(k>=1){g.z=0;pousserHors(g,g.r,false);g.etat='recup';g.t=0;g.cd=rnd(2.2,3.4);g.tFrappe=tReel;if(!g.aTouche)texte(g.x,g.y,1.4,'Raté !','#cfd8e6');}
      break;}
    case 'recup':if(g.t>0.95){g.etat='normal';g.t=0;}break;
  }
}
function iaJavelot(g,dt,d,vu){
  switch(g.etat){
    case 'normal':
      if(garde!=='alerte'){iaCalme(g,dt);break;}
      if(!vu||d>9)suivreJ(g,g.vit,dt);
      else if(d<4.6)fuirJ(g,g.vit,dt);
      else{const pa=Math.atan2(CY-g.y,CX-g.x)+Math.PI/2*(g.id>0.5?1:-1),tx=g.x+Math.cos(pa),ty=g.y+Math.sin(pa);if(!obsEn(tx,ty,0.5,false)&&!horsSalle(tx,ty,0.5))allerVers(g,tx,ty,g.vit*0.35,dt);}
      tourner(g,Math.atan2(CY-g.y,CX-g.x),6,dt);
      if(g.cd<=0&&vu&&d<12.5&&jeton()){g.etat='arme';g.t=0;g.arme=true;son('vise');dire('jav1',"Le javelot vise : la fine ligne rouge, c'est son tir. Un pas de côté, ou un muret.");}
      break;
    case 'arme':{
      const lock=g.t>=0.66*arm();if(!lock)g.fa=Math.atan2(P.y-g.y,P.x-g.x);
      g.zone={k:'fin',x:g.x,y:g.y,a:g.fa,L:rayon(g.x,g.y,g.fa,15,0.05),l:0.18,p:g.t/(0.92*arm()),lock};
      if(g.t>=0.92*arm()){javs.push({x:g.x+Math.cos(g.fa)*0.5,y:g.y+Math.sin(g.fa)*0.5,a:g.fa,v:17,L:0,owner:g});g.etat='desarme';g.t=0;g.arme=false;g.zone=null;g.attente=0;g.tFrappe=tReel;son('jav');}
      break;}
    case 'desarme':{
      const it=items.find(i=>i.owner===g);
      if(!it){if(!javs.some(j=>j.owner===g)){g.etat='nu';g.t=0;}else if(garde==='alerte')fuirJ(g,g.vit*0.5,dt);break;}
      if(!g.ch||tReel-g.chT>0.5){g.ch=champ(it.x,it.y,garde==='alerte'?penalJ:null);g.chT=tReel;g.chX=-99;}
      const [tx,ty]=pasVers(g,g.ch);allerVers(g,tx,ty,g.vit*1.15,dt);tourner(g,g.dirM,6,dt);
      if(garde==='alerte'&&hyp(P.x-it.x,P.y-it.y)<2.6){g.attente+=dt;if(g.attente>4){g.etat='nu';g.t=0;texte(g.x,g.y,2.2,'Tant pis !','#cfd8e6');dire('renonce1',"Il renonce à son javelot et vient à mains nues.");break;}}
      if(hyp(g.x-it.x,g.y-it.y)<0.6){items.splice(items.indexOf(it),1);g.etat='normal';g.t=0;g.cd=1.3;texte(g.x,g.y,2.2,'Récupéré !','#ff9a8a');}
      break;}
    case 'nu':
      if(garde!=='alerte'){iaCalme(g,dt);break;}
      suivreJ(g,g.vit*1.1,dt);tourner(g,Math.atan2(CY-g.y,CX-g.x),6,dt);
      if(d<1.5&&g.cd<=0&&jeton()){g.etat='poing';g.t=0;g.arme=true;}
      break;
    case 'poing':iaPoing(g,dt,1,0.55,'nu');break;
    case 'recup':if(g.t>0.6){g.etat=g.retour||'normal';g.t=0;}break;
  }
}
function iaBelier(g,dt,d,vu){
  switch(g.etat){
    case 'normal':
      if(garde!=='alerte'){iaCalme(g,dt);break;}
      if(d>8||!vu)suivreJ(g,g.vit,dt);else if(d<3.5)fuirJ(g,g.vit*0.7,dt);
      tourner(g,Math.atan2(CY-g.y,CX-g.x),4,dt);
      if(g.cd<=0&&vu&&d<11&&d>2.2&&jeton()){g.etat='gratte';g.t=0;g.arme=true;son('gratte');dire('belier1',"Il gratte le sol : la bande rouge, c'est son chemin. Contre un pilier, il fait moins le fier.");}
      break;
    case 'gratte':{
      if(g.t<0.75*arm())g.fa=Math.atan2(P.y-g.y,P.x-g.x);
      g.zone={k:'ligne',x:g.x,y:g.y,a:g.fa,L:rayon(g.x,g.y,g.fa,13,g.r*0.7),l:1.3,p:g.t/(1.05*arm())};
      if(Math.random()<dt*10)poussiere(g.x-Math.cos(g.fa)*0.5,g.y-Math.sin(g.fa)*0.5,0.7);
      if(g.t>=1.05*arm()){g.etat='charge';g.t=0;g.arme=false;g.zone=null;g.parcouru=0;g.aTouche=false;son('rouge');}
      break;}
    case 'charge':{
      const pas=13*dt,n=Math.ceil(pas/0.12),ux=Math.cos(g.fa),uy=Math.sin(g.fa);
      for(let s=0;s<n;s++){
        g.x+=ux*pas/n;g.y+=uy*pas/n;g.parcouru+=pas/n;g.marche+=pas/n;
        if(!g.aTouche&&hyp(P.x-g.x,P.y-g.y)<g.r+0.38){g.aTouche=true;if(toucherP(2,g.x-ux,g.y-uy,2.4)){g.etat='recup';g.t=0;g.cd=rnd(2.6,3.6);return;}}
        for(const o of G){if(o===g||!vivant(o))continue;if(hyp(o.x-g.x,o.y-g.y)<g.r+o.r){blesserG(o,3,g.x,g.y,'belier',1.4);if(o.T.armure)sonner(o,2);g.etat='sonne';g.t=0;g.sd=2.0;g.cd=2.5;texte(g.x,g.y,2,'Carambolage !','#ffb070');son('bang');secousse(6);stats.caram++;dire('caram1',"Carambolage ! Le bélier ne fait pas la différence entre toi et ses copains.");return;}}
        const h=pousserHors(g,g.r*0.8,false);
        if(h){g.etat='sonne';g.t=0;g.sd=2.6;g.cd=2.5;texte(g.x,g.y,2,'BANG !','#ffb070');son('bang');secousse(8);stats.bang++;poussiere(g.x,g.y,1.4);dire('bang1',"BANG ! Le bélier est sonné : c'est le moment.");return;}
        if(g.parcouru>13){g.etat='recup';g.t=0;g.cd=rnd(2,3);return;}
      }
      break;}
    case 'sonne':if(g.t>g.sd){g.etat='normal';g.t=0;}break;
    case 'recup':if(g.t>0.8){g.etat='normal';g.t=0;}break;
  }
}
function iaMortier(g,dt,d,vu){
  switch(g.etat){
    case 'normal':
      if(garde!=='alerte'){iaCalme(g,dt);break;}
      if(d<3.2){fuirJ(g,g.vit*1.5,dt);dire('mortier2',"De près, le mortier ne sait que fuir. Rattrape-le !");}
      else if(d<6.5)fuirJ(g,g.vit,dt);else if(d>11)suivreJ(g,g.vit,dt);
      tourner(g,Math.atan2(CY-g.y,CX-g.x),4,dt);
      if(g.cd<=0&&d<15&&d>2.5&&jeton()){g.etat='vise';g.t=0;g.arme=true;son('vise');}
      break;
    case 'vise':
      if(g.t>=0.55*arm()){
        g.arme=false;g.etat='normal';g.t=0;g.cd=rnd(3.2,4.2);g.tFrappe=tReel;son('mortier');
        if(garde!=='alerte')break;
        const vx=inp.mx*vitesseP()*0.5,vy=inp.my*vitesseP()*0.5;
        const c=[[CX+vx,CY+vy],[CX+rnd(-2.2,2.2),CY+rnd(-1.8,1.8)],[CX+rnd(-2.2,2.2),CY+rnd(-1.8,1.8)]];
        c.forEach((q,i)=>obus.push({x0:g.x,y0:g.y,x1:clamp(q[0],0.8,RW-0.8),y1:clamp(q[1],1.8,RD-0.6),t:-i*0.12,dur:1.45}));
        dire('mortier1',"Le mortier tire par-dessus tout : les cercles rouges, c'est là que ça tombe.");
      }
      break;
  }
}
function choisirProtege(){
  let best=null;for(const o of G){if((o.type==='mortier'||o.type==='javelot')&&vivant(o)){if(!best||o.hp<best.hp)best=o;}}return best;
}
function iaDalle(g,dt,d,vu){
  const versP=Math.atan2(CY-g.y,CX-g.x);
  switch(g.etat){
    case 'normal':{
      if(garde!=='alerte'){iaCalme(g,dt);break;}
      tourner(g,versP,g.aDalle?2.0:5,dt);
      const al=g.aDalle?choisirProtege():null;
      if(al){
        const ux=CX-al.x,uy=CY-al.y,n=hyp(ux,uy)||1,tx=clamp(al.x+ux/n*1.6,1,RW-1),ty=clamp(al.y+uy/n*1.6,2,RD-1);
        if(!g.ch||tReel-g.chT>0.4){g.ch=champ(tx,ty);g.chT=tReel;g.chX=-99;}
        if(hyp(g.x-tx,g.y-ty)>0.35){const [ax,ay]=pasVers(g,g.ch);allerVers(g,ax,ay,g.vit,dt);}
        if(d<1.9&&devant(g,P.x,P.y,1.0)&&g.cd<=0&&jeton()){g.etat='coupDalle';g.t=0;g.arme=true;}
        if(d<9)dire('garde1',"Le porte-dalle se met entre toi et le plus fragile. De face, rien ne passe.");
      }else{
        suivreJ(g,g.vit*1.1,dt);
        if(g.aDalle&&d<2.7&&g.cd<=0&&jeton()){g.etat='marteau';g.t=0;g.arme=true;son('gratte');dire('marteau1',"Plus personne à protéger : il lève sa dalle comme un marteau. Écarte-toi du rouge !",true);}
        else if(!g.aDalle&&d<1.5&&g.cd<=0&&jeton()){g.etat='poing';g.t=0;g.arme=true;}
      }
      break;}
    case 'coupDalle':
      tourner(g,versP,2,dt);g.zone={k:'rect',x:g.x,y:g.y,a:g.fa,L:g.r+1.4,l:1.7,p:g.t/(0.5*arm())};
      if(g.t>=0.5*arm()){g.zone=null;g.arme=false;g.tFrappe=tReel;if(dansRect(P.x,P.y,g.x,g.y,g.fa,g.r+1.5,1.8))toucherP(1,g.x,g.y,2.8);g.etat='recup';g.t=0;g.cd=1.6;son('swishG');}
      break;
    case 'marteau':
      if(g.t<0.5*arm())tourner(g,versP,3,dt);
      g.zone={k:'rect',x:g.x,y:g.y,a:g.fa,L:g.r+2.3,l:1.6,p:g.t/(0.95*arm())};
      if(g.t>=0.95*arm()){
        g.zone=null;g.arme=false;g.tFrappe=tReel;
        if(dansRect(P.x,P.y,g.x,g.y,g.fa,g.r+2.4,1.7))toucherP(2,g.x,g.y,1.6);
        const cxx=g.x+Math.cos(g.fa)*(g.r+0.9),cyy=g.y+Math.sin(g.fa)*(g.r+0.9),vert=Math.abs(Math.cos(g.fa))>Math.abs(Math.sin(g.fa));
        const o={k:'dalle',x:clamp(cxx,1,RW-1),y:clamp(cyy,2.4,RD-1),w:vert?0.5:1.7,d:vert?1.7:0.5,h:1.3,plantee:true};
        if(hyp(o.x-P.x,o.y-P.y)>0.6&&!obsEn(o.x,o.y,0.2,false))OBS.push(o);
        g.aDalle=false;majGrille();pousserHors(P,0.33,false);pousserHors(g,g.r,false);
        son('bang');secousse(9);poussiere(o.x,o.y,1.6);stats.plantees++;
        dire('plante1',"La dalle est plantée dans le sol : un mur de plus pour se cacher, et lui à mains nues.",true);
        g.etat='recup';g.t=0;g.cd=1.2;
      }
      break;
    case 'poing':iaPoing(g,dt,1,0.6);break;
    case 'recup':if(g.t>0.6){g.etat='normal';g.t=0;}break;
  }
}
function iaFaucheur(g,dt,d,vu){
  switch(g.etat){
    case 'normal':
      if(garde!=='alerte'){iaCalme(g,dt);break;}
      if(d>1.9)suivreJ(g,g.vit,dt);
      tourner(g,Math.atan2(CY-g.y,CX-g.x),5,dt);
      if(d<2.5&&g.cd<=0&&jeton()){g.etat='fauche';g.t=0;g.arme=true;son('gratte');dire('faux1',"Le faucheur balaie tout devant lui, d'un grand demi-cercle. Recule, ou bondis dans son dos.");}
      break;
    case 'fauche':
      if(g.t<0.45*arm())tourner(g,Math.atan2(P.y-g.y,P.x-g.x),3.5,dt);
      g.zone={k:'cone',x:g.x,y:g.y,a:g.fa,R:g.r+2.2,h:1.5,p:g.t/(0.85*arm())};
      if(g.t>=0.85*arm()){g.zone=null;g.arme=false;g.tFrappe=tReel;if(hyp(P.x-g.x,P.y-g.y)<g.r+2.3&&devant(g,P.x,P.y,1.55))toucherP(2,g.x,g.y,1.8);
        g.balai={t:tReel,a:g.fa};g.etat='recup';g.t=0;g.cd=rnd(1.5,2.1);son('swishG');}
      break;
    case 'recup':if(g.t>1.0){g.etat='normal';g.t=0;}break;
  }
}
function iaCuirasse(g,dt,d,vu){
  switch(g.etat){
    case 'normal':
      if(garde!=='alerte'){iaCalme(g,dt);break;}
      if(d>1.8)suivreJ(g,g.vit,dt);
      tourner(g,Math.atan2(CY-g.y,CX-g.x),4,dt);
      if(d<2.6&&g.cd<=0&&jeton()){g.etat='estoc';g.t=0;g.arme=true;son('vise');}
      break;
    case 'estoc':
      if(g.t<0.4*arm())tourner(g,Math.atan2(P.y-g.y,P.x-g.x),4,dt);
      g.zone={k:'rect',x:g.x,y:g.y,a:g.fa,L:g.r+2.4,l:1.0,p:g.t/(0.72*arm())};
      if(g.t>=0.72*arm()){g.zone=null;g.arme=false;g.tFrappe=tReel;if(dansRect(P.x,P.y,g.x,g.y,g.fa,g.r+2.5,1.1))toucherP(2,g.x,g.y,1.6);g.etat='recup';g.t=0;g.cd=rnd(1.2,1.8);son('swishG');}
      break;
    case 'recup':if(g.t>0.9){g.etat='normal';g.t=0;}break;
  }
}
function iaColosse(g,dt,d,vu){
  switch(g.etat){
    case 'normal':
      if(garde!=='alerte'){iaCalme(g,dt);break;}
      suivreJ(g,g.vit,dt);tourner(g,Math.atan2(CY-g.y,CX-g.x),2.5,dt);
      if(d<2.3&&g.cd<=0&&jeton()){g.etat='poing';g.t=0;g.arme=true;}
      else if(d<8.5&&g.cdOnde<=0&&jeton()){g.etat='onde';g.t=0;g.arme=true;son('gratte');}
      break;
    case 'onde':
      g.zone={k:'cercle',x:g.x,y:g.y,r:g.r+0.8,p:g.t/(1.25*arm())};
      if(g.t>=1.25*arm()){
        g.zone=null;g.arme=false;g.tFrappe=tReel;
        const lim=new Float32Array(64);for(let i=0;i<64;i++)lim[i]=rayon(g.x,g.y,i/64*TAU,10,0.05,!P.up.echoOnde);
        ondes.push({x:g.x,y:g.y,r:g.r+0.3,v:5.4,max:10,ep:0.8,deja:false,lim,de:g});son('onde');secousse(9);g.etat='recup';g.t=0;g.cdOnde=rnd(4,5.5);g.cd=Math.max(g.cd,1);
        dire('onde1',"L'onde file en cercle, mais elle se brise sur les piliers et les grands murs. Abrite-toi derrière, ou bondis quand elle passe.",true);}
      break;
    case 'poing':iaPoing(g,dt,2,0.75);break;
    case 'recup':if(g.t>0.9){g.etat='normal';g.t=0;}break;
  }
}
const IA={chien:iaChien,javelot:iaJavelot,belier:iaBelier,mortier:iaMortier,dalle:iaDalle,faucheur:iaFaucheur,cuirasse:iaCuirasse,colosse:iaColosse};
function majGolems(dt){
  if(!champJ||tReel-champJT>0.25){champJ=champ(CX,CY);champJT=tReel;}
  for(const g of G){
    g.t+=dt;g.cd-=dt;g.cdOnde-=dt;if(g.flash>0)g.flash=Math.max(0,g.flash-dt*6);
    if(g.etat==='mort')continue;
    if(g.etat==='entre'){
      allerVers(g,g.tx,g.ty,Math.max(2.6,g.vit),dt);g.fa=Math.atan2(g.ty-g.y,g.tx-g.x);g.bouge=true;
      if(hyp(g.x-g.tx,g.y-g.ty)<0.1){g.etat='normal';g.t=0;}
      continue;
    }
    if(g.kx||g.ky){
      const v=hyp(g.kx,g.ky);g.x+=g.kx*dt;g.y+=g.ky*dt;g.kx*=Math.pow(0.002,dt);g.ky*=Math.pow(0.002,dt);
      const h=g.etat==='saut'?null:pousserHors(g,g.r,false);
      if(h&&g.pousse&&v>3.5){
        g.pousse=false;g.kx=g.ky=0;
        if(P.up.briseur&&g.T.armure){g.sansArmure=tReel+4;texte(g.x,g.y,g.T.h+0.4,'Armure tombée !','#ffcf9a');}
        if(P.up.mur){sonner(g,2);blesserG(g,2,g.x,g.y,'pousse',0);texte(g.x,g.y,g.T.h+0.2,'Contre le mur !','#ffb070');son('bang');poussiere(g.x,g.y,1);}
      }
      if(Math.abs(g.kx)+Math.abs(g.ky)<0.05){g.kx=0;g.ky=0;g.pousse=false;}
    }
    if(g.saigne.length){
      for(let i=g.saigne.length-1;i>=0;i--){g.saigne[i]-=dt;if(g.saigne[i]<=0)g.saigne.splice(i,1);}
      g.saigneT+=dt;if(g.saigneT>=1){g.saigneT=0;if(g.saigne.length)blesserG(g,g.saigne.length*(P.up.saignee?2:1),g.x,g.y,'saigne',0);if(g.etat==='mort')continue;}
    }
    if(tReel<g.sonneJ){g.bouge=false;continue;}
    const d=hyp(CX-g.x,CY-g.y),avant=g.marche;
    IA[g.type](g,dt,d,g.voit);
    g.bouge=g.marche!==avant;
  }
  for(let i=0;i<G.length;i++){const a=G[i];if(!vivant(a)||a.etat==='saut'||a.etat==='charge')continue;
    for(let j=i+1;j<G.length;j++){const b=G[j];if(!vivant(b)||b.etat==='saut'||b.etat==='charge')continue;
      const dx=b.x-a.x,dy=b.y-a.y,d=hyp(dx,dy),m=a.r+b.r;
      if(d<m&&d>1e-4){
        const k=(m-d)/2,wa=a.type==='colosse'?0.15:1,wb=b.type==='colosse'?0.15:1;a.x-=dx/d*k*wa;a.y-=dy/d*k*wa;b.x+=dx/d*k*wb;b.y+=dy/d*k*wb;
        if(P.up.ricochet){
          for(const [u,w] of [[a,b],[b,a]]){
            if(u.pousse&&hyp(u.kx,u.ky)>3.5&&tReel-w.pousseT>0.4&&w.type!=='colosse'){
              w.kx=u.kx*(P.up.boulets?1:0.85);w.ky=u.ky*(P.up.boulets?1:0.85);w.pousse=true;w.pousseT=tReel;u.pousseT=tReel;u.kx*=0.3;u.ky*=0.3;
              if(P.up.boulets)blesserG(w,2,u.x,u.y,'pousse',0);
              etincelles((a.x+b.x)/2,(a.y+b.y)/2,0.6,'#ffe0a0',6);son('impact');break;
            }
          }
        }
      }
    }}
  for(const g of G){if(vivant(g)&&g.etat!=='saut')pousserHors(g,g.r,false);}
  G=G.filter(g=>!(g.etat==='mort'&&g.t>0.6));
}
