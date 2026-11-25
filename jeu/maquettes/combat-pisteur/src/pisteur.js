/* ======================= les réglages : tous les chiffres du combat (Bible §17.12 à §17.16) =======================
   (R) = fixé par Romain le 25 novembre ; (C) = point de départ de Claude, à régler à l'essai. Les durées sont en secondes,
   les distances en pas, les vitesses en pas par seconde. */
const REG={
  vie:100,                                        /* (R) une barre de 100 pour TOUT le combat : elle ne remonte plus entre les vagues ; à terre, on recommence tout */
  bandage:{nb:5,soin:20,dur:3},                   /* (R) cinq bandages pour tout le combat ; 20 points chacun ; trois secondes sans bouger, dans l'ombre ; coupé = perdu */
  vit:3.6,vitOmbre:2.8,                           /* (C) */
  dague:{dmg:[10,10,20],dur:[0.6,0.6,0.8],frappe:0.08,portee:1.5,oubli:2},   /* (R) 10, 10, 20 en 2 s ; (C) retour au rang 1 après 2 s */
  saut:{L:3,dur:0.32,cd:3},                       /* (C) 3 pas ; recharge 3 s */
  ombre:{cd:3,portee:3,cone:0.7,hesite:0.5},      /* (R) on y reste tant qu'on veut ; elle revient après 3 s D'AFFILÉE sans être vu : le compte repart de zéro dès qu'un golem
                                                     revoit le Pisteur (25 novembre, 22 h) ; (C) éventail de 3 pas, une demi-seconde d'hésitation */
  vue:{portee:10,voir:0.35,marge:30},             /* (R) à découvert, le regard porte loin devant le golem, jamais dans son dos, jamais plus loin que l'écran du joueur ;
                                                     (C) 10 pas, 0,35 s pour remarquer, le golem doit être à 30 points du bord de l'écran */
  embuscade:{dmg:30,portee:2.2,dur:0.42,frappe:0.16},   /* (R) 30 : la tête de mort à 30 de vie ou moins */
  assomme:{sonne:2,dur:0.42,frappe:0.16},         /* (R) 0 dégât, 2 s, pareil pour tous */
  sautOmbre:{portee:6,cd:5},                      /* (C) */
  saigne:{dmg:2,fois:4},                          /* (R) 2 par seconde pendant 4 s */
  cri:6,                                          /* (C) jusqu'où porte le cri d'un golem blessé */
  regard:3.14,                                    /* (R) un quart de tour en une demi-seconde */
  /* LES COLÈRES (25 novembre au soir). Un groupe frappé par le Pisteur, et qui le sait, se met en colère jusqu'à sa mort : chaque
     sorte de golem a la sienne. « lien » : s'ils voient le Pisteur moins de 4 s après qu'un des leurs a été frappé, ils ont compris. */
  colere:{lien:4},                                /* (C) */
  ruee:2.5,                                       /* (R) un golem blessé sans être tué : tout son groupe se rue sur le Pisteur (les autres groupes ne bougent pas) ; (C) pendant 2,5 s */
  chien:{morsure:3,ramasse:0.5,cdMorsure:1.6,plaqT:1.1,plaqFige:0.4,plaqDur:1.5,plaqL:4.2,cdPlaq:8,entrePlaq:3.5,
    flair:3.6,nez:1.2},                           /* (R) en colère, la meute flaire la piste, même dans l'ombre ; (R, 25 novembre, 22 h) sur la piste elle va aussi vite que la course
                                                     du Pisteur à découvert (3,6) : on ne la sème plus en marchant, il faut sauter un mur ; (C) elle le trouve à 1,2 pas */
  javelot:{lancer:40,sonne:0.5,armeT:1.0,figeT:0.5,v:12,cdLancer:5,recul:3,cdRecul:6,pique:5},
  dalle:{porteeCharge:6.5,vCharge:11,lent:0.5,cdCharge:7,leveT:1.2,rayon:2.2,dmg:10,sonne:2,cdLeve:5,patte:5},
                                                  /* (R) en colère, le garde se colle au dos de son javelot blessé : il faut d'abord l'assommer */
  faucheur:{faux:8,fauche:30,faucheT:1.0,figeT:0.5,rayon:3,cdFauche:4,cdVolte:5,recup:0.9,
    fenetre:5,vFantome:1.5},                      /* (R) frappé sans être fini, il devient un fantôme qu'on voit mais qu'on ne peut pas toucher ; dès qu'on se montre il surgit et fauche, puis reste 5 s visible */
  mortier:{obus:30,obusT:1.5,rayon:1.15,cd:2.8,
    aveugle:0.9,aveugleR:[2.4,7]},                /* (R, 25 novembre, 22 h) dès qu'il VOIT le Pisteur de ses yeux, il se déchaîne, et il ne s'arrête plus jamais : il vise quand lui
                                                     ou son groupe voit le Pisteur, sinon il bombarde à l'aveugle tout autour de lui. Il n'est plus lié à la colère de son groupe.
                                                     Ses obus blessent tout le monde, mais les golems sortent toujours du rouge, sauf celui qui est assommé ou endormi.
                                                     (C) un obus visé toutes les 3,3 s, un obus à l'aveugle toutes les 1,4 s, de 2,4 à 7 pas */
  repare:{soin:30,T:3,portee:0.9},                /* (R) le réparateur : fragile, aucun dégât, il répare lentement les blessés de son groupe ; (C) 30 points toutes les 3 s, penché sur le blessé */
  /* LES TROIS CARTES DORÉES (25 novembre, 22 h) : une seule fois chacune pour tout le combat, dans l'ombre seulement. Ce sont des clés pour
     les nœuds trop serrés, pas des sorties de secours. */
  cartes:{fleche:{portee:14},          /* (R) la flèche qui endort : n'importe quel golem sauf le colosse ; il dort pour de bon, il se réveille si on le frappe */
    sifflet:{portee:16,loin:8,duree:16},              /* (R) le sifflet : un bruit ailleurs dans la salle, un groupe part voir ; (C) à 8 pas au moins, pendant 16 s */
    cape:{dur:10}},                               /* (R) la cape d'ombre : dix secondes où rien ne sort le Pisteur de l'ombre, ni un regard ni son propre coup */
  belier:{tete:8,teteT:0.38,envoi:4.5,cdTete:1.4,charge:40,gratteT:1.0,figeT:0.4,vCharge:12,L:11,cdCharge:6,
    fou:1.25,cdChargeFou:3.5},                    /* (R) en colère, il devient fou : il court dans toute la salle et charge dès qu'il voit le Pisteur */
  cuirasse:{coup:10,coupT:0.8,
    boule:30,vRoule:5,ramasseT:1.0,chocCD:1.0,penchant:0.2},   /* (R) frappé une fois, il se met en boule et ne s'arrête plus de rouler ; il rebondit, il va plus vite que le Pisteur, 30 points au passage,
                                                     il ne blesse pas les autres golems ; (C) 5 pas par seconde, une seconde pour se ramasser, un rebond sur cinq penche vers le Pisteur quand il est à découvert */
  colosse:{onde:40,ondeT:1.7,figeT:0.6,rayon:5.5, /* (R) insensible au coup qui assomme ; plus de coup de poing : que des attaques de zone, larges, qui s'enchaînent */
    pilon:{r:3,T:1.3,dmg:30},anneau:{r0:2.6,r1:5.8,T:1.5,dmg:30},croix:{l:2,L:6.5,T:1.5,dmg:30},entre:0.6,portee:5.2,
    perimetre:6.5,chaineT:[0.3,0.45]}             /* (R) blessé, on ne peut plus le quitter : sa chaîne ramène le Pisteur au contact, sans dégât, et une zone rouge repart aussitôt */
};

/* ======================= l'état du combat ======================= */
let etatJeu='regles',enPause=false,tourne=false,invincible=false;
let hitstop=0,sec=0,flashR=0,flashB=0,flashV=0,defaiteDans=0,finDans=0;
const P={};
let G=[],javs=[],obus=[],parts=[];
let vague=0,phase='',phaseT=0,file=[],stats={},bandeau=null,tVague=0,nVoient=0,dernierPlaquage=-9,grpVoit={};
let grpColere={},grpFrappe={},piste=[],pisteBase=0,nFlair=0;      /* les groupes en colère ; la piste que laisse le Pisteur */
let sauves=[];                                                    /* au début de chaque vague : la vie, les bandages et les cartes (pour repartir de cette vague-là) */
const CARTES=['fleche','sifflet','cape'];
let demo=null,demoPose=false;                      /* l'extrait d'avant le jeu (voir les écrans) */
const GBE={colere:0,sonne:0,bulle:'',bulleT:-9};
function gbGeste(nom,sd){if(typeof Gros!=='undefined')Gros.jouer(nom,tReel,sd||1);}
function gbDire(t){GBE.bulle=t;GBE.bulleT=tReel;}
function resetP(){
  Object.assign(P,{x:13,y:16.4,z:0,fa:-Math.PI/2,etat:'libre',t:0,dur:0,hp:REG.vie,max:REG.vie,saigne:[],
    cartes:{fleche:1,sifflet:1,cape:1},capeT:0,cibles:{fleche:null,sifflet:null},tirT:-9,
    bandages:REG.bandage.nb,rang:1,rangT:-9,rangCoup:1,sautCD:0,ombre:false,ombreCD:0,sautOmbreCD:0,tampon:0,lentT:0,
    coupFait:false,cible:null,ax:0,ay:0,bx:0,by:0,vx:0,vy:0,saute:false,slash:null,pas:0,lx:13,ly:16.4,court:false,fondu:0,
    aPortee:null,cibleSO:null,touchT:-9});
}

/* (25 novembre, 23 h) Plus de conteur, plus aucun texte d'aide : Romain veut qu'on apprenne en jouant. Ce qui était dit est montré :
   un bouton refusé tremble, et le bouton qui débloque la situation clignote. */

/* ======================= les doigts : ce que le joueur demande ======================= */
const inp={mx:0,my:0};
const clav={h:0,b:0,g:0,d:0};
const joy={id:null,bx:0,by:0,x:0,y:0,mx:0,my:0,vx:0,vy:0};
const robot={mx:0,my:0};
const tenu=[false,false,false,false,false];        /* les boutons 1 à 4 gardés sous le doigt */
let sautDemande=false;
function lireEntrees(){
  let mx=joy.mx+(clav.d-clav.g)+robot.mx,my=joy.my+(clav.b-clav.h)+robot.my;const n=hyp(mx,my);if(n>1){mx/=n;my/=n;}
  inp.mx=mx;inp.my=my;
}
const vivant=g=>g.etat!=='mort'&&g.etat!=='entre';
const GESTES={dague:1,embuscade:1,assomme:1};                      /* un seul geste d'attaque à la fois */
const BLOQUE={plaque:1,sonne:1,vol:1,aterre:1,chaine:1};           /* là, le Pisteur ne peut rien faire */
function pPeutBouger(){return !BLOQUE[P.etat]&&P.lentT<=0;}
/* Un bouton vient d'être touché. Pendant un geste, le jeu garde cet appui en mémoire (un seul, le dernier) et le joue juste après.
   Le saut, lui, passe devant tout. */
function appui(n){
  if(etatJeu!=='jeu'||enPause)return;
  if(n===3){sautDemande=true;return;}
  if(BLOQUE[P.etat]||P.etat==='bandage')return;      /* pendant un bandage, seul le saut répond (et le bandage est perdu) */
  if(GESTES[P.etat]||P.etat==='saut'||P.etat==='sautOmbre')P.tampon=n;else lancer(n);
}
function lancer(n){
  if(P.ombre){if(n===1)return debutEmbuscade();if(n===2)return debutAssomme();if(n===4)return debutBandage();}
  else{if(n===1)return debutDague();if(n===4)return entrerOmbre();
    if(n===2){son('refus');refuser(2,4);}}        /* (le bouton 2 ne sert que dans l'ombre : assommer) */
  return false;
}
function finGeste(){
  P.etat='libre';P.t=0;P.z=0;
  if(P.tampon){const n=P.tampon;P.tampon=0;lancer(n);}
  else if(tenu[1]&&!P.ombre)lancer(1);
}

/* ======================= se déplacer ======================= */
function vitesseP(){return (P.ombre?REG.vitOmbre:REG.vit)*(P.lentT>0?0.1:1);}
function deplacer(f,dt){
  const v=vitesseP()*f;P.x+=inp.mx*v*dt;P.y+=inp.my*v*dt;
  pousserHors(P,0.33,false);
  for(const g of G){if(!vivant(g)||g.z>0.2||g.fantome||g.etat==='roule')continue;const dx=P.x-g.x,dy=P.y-g.y,d=hyp(dx,dy),m=g.r+0.3;if(d<m&&d>1e-4){P.x=g.x+dx/d*m;P.y=g.y+dy/d*m;}}
  pousserHors(P,0.33,false);
}
function libererDesMurs(a){
  const ux=Math.cos(a),uy=Math.sin(a);
  let k=0;while(obsEn(P.x,P.y,0.33,false)&&k<30){P.x+=ux*0.1;P.y+=uy*0.1;k++;}
  pousserHors(P,0.33,false);
}

/* ======================= l'ombre ======================= */
function entrerOmbre(){
  if(P.ombre)return false;
  if(nVoient>0){son('refus');refuser(4);for(const g of G)if(g.voit)g.excl=tReel+0.7;return false;}      /* (le « ! » se rallume sur ceux qui le voient) */
  if(P.ombreCD>0){son('refus');refuser(4);return false;}
  P.ombre=true;P.rang=1;P.tampon=0;flashV=0.55;son('ombre');eclatOmbre(P.x,P.y,0.6);stats.ombres++;
  for(const g of G){g.hes=0;g.rem=0;}
  majBoutons();
  return true;
}
function sortirOmbre(pourquoi){
  if(!P.ombre)return;
  if(P.capeT>0&&pourquoi!=='fin')return;             /* la cape d'ombre : dix secondes où rien ne l'en sort, ni un regard, ni un coup, ni sa propre lame */
  P.ombre=false;P.ombreCD=REG.ombre.cd;P.rang=1;
  eclatOmbre(P.x,P.y,0.6);majBoutons();
  if(pourquoi==='vu'){texte(P.x,P.y,2.2,'Repéré !','#ff7a6a');son('alerte');stats.reperages++;}
  else if(pourquoi==='flaire'){texte(P.x,P.y,2.2,'Flairé !','#ffb070');son('alerte');stats.flaires++;}
}

/* ======================= le bouton 1 : la dague (à découvert), l'embuscade (dans l'ombre) ======================= */
/* le golem que la lame peut atteindre : le plus proche, plutôt devant */
function cibleDague(marge){
  let best=null,bs=1e9;
  for(const g of G){
    if(!vivant(g)||g.fantome)continue;
    const dx=g.x-P.x,dy=g.y-P.y,d=hyp(dx,dy)-g.r;if(d>REG.dague.portee+(marge||0))continue;
    const a=Math.abs(ang(Math.atan2(dy,dx)-P.fa));if(a>2.0)continue;
    const s=d+a*0.7;if(s<bs){bs=s;best=g;}
  }
  return best;
}
function debutDague(){
  if(tReel-P.rangT>REG.dague.oubli)P.rang=1;
  const c=cibleDague(0.7);if(c)P.fa=Math.atan2(c.y-P.y,c.x-P.x);
  P.etat='dague';P.t=0;P.coupFait=false;P.rangCoup=P.rang;P.dur=REG.dague.dur[P.rang-1];P.cible=c;son(P.rang===3?'swishG':'swish');
  return true;
}
function frapperDague(){
  const r=P.rangCoup,c=cibleDague(0);let touche=false;
  if(c&&Math.abs(ang(Math.atan2(c.y-P.y,c.x-P.x)-P.fa))<1.25){
    const res=blesserG(c,REG.dague.dmg[r-1],'dague');
    touche=res===true;
    if(touche&&r===3){secousse(4);hitstop=Math.max(hitstop,0.06);}
  }
  P.slash={t:tReel,a:P.fa,tour:false,der:r===3,n:r};
  if(touche){P.rang=r%3+1;P.rangT=tReel;stats.dagues++;}
  else P.rang=1;
  majBoutons();
}
/* dans l'ombre : le golem à portée de main (l'embuscade, le coup qui assomme) */
function cibleProche(R){
  let best=null,bd=1e9;
  for(const g of G){if(!vivant(g)||g.fantome)continue;const d=hyp(g.x-P.x,g.y-P.y)-g.r;if(d<R&&d<bd&&vue(P.x,P.y,g.x,g.y)){bd=d;best=g;}}
  /* un javelot couvert par son garde : si le garde est à portée lui aussi, c'est lui que la main trouve */
  if(best){const gd=gardeDe(best);if(gd&&hyp(gd.x-P.x,gd.y-P.y)-gd.r<R&&vue(P.x,P.y,gd.x,gd.y))best=gd;}
  return best;
}
function debutSurprise(nom){
  const g=cibleProche(REG.embuscade.portee);
  if(!g){son('refus');refuser(nom==='embuscade'?1:2);return false;}
  const dx=g.x-P.x,dy=g.y-P.y,d=hyp(dx,dy)||1,k=Math.max(0,d-(g.r+0.5));
  Object.assign(P,{etat:nom,t:0,coupFait:false,cible:g,ax:P.x,ay:P.y,bx:P.x+dx/d*k,by:P.y+dy/d*k,dur:REG[nom].dur,fa:Math.atan2(dy,dx)});
  son('ombre');return true;
}
function debutEmbuscade(){return debutSurprise('embuscade');}
function debutAssomme(){return debutSurprise('assomme');}
function frapperEmbuscade(){
  const g=P.cible;sortirOmbre('attaque');
  if(!g||!vivant(g))return;
  const mort=g.hp<=REG.embuscade.dmg,res=blesserG(g,REG.embuscade.dmg,'embuscade');
  secousse(6);hitstop=Math.max(hitstop,0.09);flashV=0.5;son('assassin');stats.embuscades++;eclatOmbre(g.x,g.y,g.T.h*0.5);
  P.slash={t:tReel,a:P.fa,tour:false,der:true,n:3,v:1};
  if(res!==true)return;                              /* parée par le garde */
  if(mort){texte(g.x,g.y,g.T.h+0.5,'Sans un bruit','#c8b6ff');}
  else{texte(g.x,g.y,g.T.h+0.5,'Embuscade !','#c8b6ff');}
}
function frapperAssomme(){
  const g=P.cible;sortirOmbre('attaque');
  if(!g||!vivant(g))return;
  if(g.type==='colosse'){
    /* le plus gros de tous : rien ne l'assomme */
    texte(g.x,g.y,g.T.h+0.5,'Insensible','#cfd8e6');son('ting');stats.insensibles++;P.slash={t:tReel,a:P.fa,tour:false,der:true,n:3,v:1};
    g.su.x=P.x;g.su.y=P.y;g.suT=tReel;g.bruit=false;if(g.mode!=='chasse'){g.mode='chasse';g.reagit=g.T.reac;g.excl=tReel+0.8;}
    return;
  }
  sonner(g,REG.assomme.sonne);g.reveil=true;g.flash=1;
  secousse(4);hitstop=Math.max(hitstop,0.06);son('bong');stats.assommes++;etincelles(g.x,g.y,g.T.h*0.9,'#ffe08a',9);
  texte(g.x,g.y,g.T.h+0.5,'Assommé !','#ffe08a');
}

/* ======================= le bouton 2 : rien à découvert (la case est réservée à une carte), le coup qui assomme dans l'ombre ======================= */

/* ======================= le bouton 3 : le saut, et le saut d'ombre ======================= */
/* où se poser dans le dos d'un golem */
function dos(g){
  for(const da of [0,0.7,-0.7,1.3,-1.3,2.0,-2.0]){
    const a=g.reg+Math.PI+da,x=g.x+Math.cos(a)*(g.r+0.7),y=g.y+Math.sin(a)*(g.r+0.7);
    if(!horsSalle(x,y,0.33)&&!obsEn(x,y,0.3,false))return {x,y};
  }
  return null;
}
function cibleSautOmbre(){
  let best=null,bd=1e9;
  for(const g of G){if(!vivant(g)||g.fantome||g.etat==='roule')continue;const d=hyp(g.x-P.x,g.y-P.y);if(d<REG.sautOmbre.portee&&d>g.r+1.2&&d<bd&&dos(g)){bd=d;best=g;}}
  return best;
}
function demanderSaut(){
  if(etatJeu!=='jeu'||enPause)return;
  if(BLOQUE[P.etat]||P.etat==='saut'||P.etat==='sautOmbre')return;
  if(P.ombre&&P.sautOmbreCD<=0){const g=cibleSautOmbre();if(g){if(P.etat==='bandage')bandagePerdu();sautOmbre(g);return;}}
  if(P.sautCD>0){son('refus');return;}
  /* le saut répond tout de suite : il coupe le coup en cours et annule le geste en attente, qui n'est pas dépensé.
     Il coupe aussi un bandage en cours, et celui-là est perdu. */
  if(P.etat==='bandage')bandagePerdu();
  P.tampon=0;
  const n=hyp(inp.mx,inp.my),a=n>0.2?Math.atan2(inp.my,inp.mx):P.fa,L=REG.saut.L*(P.lentT>0?0.1:1);P.fa=a;
  P.etat='saut';P.t=0;P.dur=REG.saut.dur;P.vx=Math.cos(a)*L/P.dur;P.vy=Math.sin(a)*L/P.dur;P.sautCD=REG.saut.cd;P.saute=false;son('saut');stats.sauts++;
  bSaut.classList.remove('anneau');
}
function sautOmbre(g){
  const s=dos(g);if(!s)return;
  P.tampon=0;
  Object.assign(P,{etat:'sautOmbre',t:0,cible:g,ax:P.x,ay:P.y,bx:s.x,by:s.y,coupFait:false});
  P.sautOmbreCD=REG.sautOmbre.cd;son('ombre');stats.sautsOmbre++;eclatOmbre(P.x,P.y,0.6);
}

/* ======================= le bouton 4 : l'ombre (à découvert), le bandage (dans l'ombre) =======================
   Cinq bandages pour tout le combat. Chacun rend 20 points, au bout de trois secondes sans bouger. Le bandage est pris
   dans le sac dès qu'on commence : un coup reçu avant la fin (ou un saut pour filer), et il est perdu. */
function debutBandage(){
  if(P.bandages<=0){son('refus');refuser(4);return false;}
  if(P.hp>=P.max){son('refus');refuser(4);return false;}
  P.bandages--;P.etat='bandage';P.t=0;P.dur=REG.bandage.dur;stats.bandagesPoses++;son('ramasse');
  return true;
}
function bandagePerdu(){
  P.etat='libre';P.t=0;stats.bandagesPerdus++;texte(P.x,P.y,2.4,'✗','#ff9a8a');son('perdu');
}
function finBandage(){
  const av=P.hp;P.hp=Math.min(P.max,P.hp+REG.bandage.soin);stats.soins+=P.hp-av;
  texte(P.x,P.y,2.2,'+'+(P.hp-av),'#9fe6c0');son('choix');
}

/* ======================= les trois cartes dorées (25 novembre, 22 h) =======================
   Trois petites icônes en haut de l'écran. Chacune ne sert qu'UNE fois dans tout le combat, et seulement dans l'ombre : ce sont des clés
   pour les nœuds trop serrés (Romain : « grâce à la carte, ça va débloquer le truc »), pas des sorties de secours quand on s'est trompé.
   (25 novembre, 23 h) Un simple appui, comme les autres boutons : rien à lire, rien à deviner.
   - la flèche qui endort : le golem qui porte la petite flèche dorée s'endort pour de bon (le colosse : jamais) ; il se réveille dès qu'on le frappe ;
   - le sifflet : le groupe du golem qui porte la petite note dorée part voir un bruit à l'autre bout de la salle ;
   - la cape d'ombre : pendant dix secondes, rien ne sort le Pisteur de l'ombre.
   La marque dorée se pose sur le golem le plus près de là où le Pisteur regarde. Sans cible, ou à découvert, la carte n'est pas dépensée. */
function jouerCarte(nom){
  if(etatJeu!=='jeu'||enPause||P.etat==='aterre'||!P.cartes[nom])return false;
  if(!P.ombre){son('refus');refuserCarte(nom,true);return false;}                /* à découvert : c'est le bouton d'ombre qui clignote */
  if(BLOQUE[P.etat]||GESTES[P.etat]||P.etat==='saut'||P.etat==='sautOmbre'||P.etat==='bandage')return false;
  if(nom==='cape'){
    if(P.capeT>0)return false;
    P.cartes.cape=0;stats.cartes++;P.capeT=REG.cartes.cape.dur;flashV=0.7;son('ombre');son('or');eclatOmbre(P.x,P.y,0.6);
    for(const g of G){g.hes=0;g.rem=0;}
    return true;
  }
  const g=cibleCarte(nom);
  if(!g){son('refus');refuserCarte(nom,false);return false;}
  P.cartes[nom]=0;stats.cartes++;P.fa=Math.atan2(g.y-P.y,g.x-P.x);P.tirT=tReel;P.cibles[nom]=null;
  if(nom==='fleche'){parts.push({k:'trait',x:P.x,y:P.y,z:1.1,x1:g.x,y1:g.y,ox:0,oy:0,vie:.3,max:.3});son('tirVise');endormir(g);}
  else siffler(g);
  return true;
}
/* le golem que la carte accroche : le plus près de là où le Pisteur regarde, parmi ceux qu'il voit */
function cibleCarte(nom){
  const C=REG.cartes[nom];let best=null,bs=1e9;
  for(const g of G){
    if(!vivant(g)||g.fantome||g.dort)continue;
    if(nom==='fleche'&&g.type==='colosse')continue;                       /* le colosse : rien ne l'endort */
    if(nom==='sifflet'&&(grpColere[g.grp]||grpVoit[g.grp]||g.leurre||g.type==='colosse'))continue;      /* un groupe en colère n'écoute plus rien */
    const dx=g.x-P.x,dy=g.y-P.y,d=hyp(dx,dy);if(d>C.portee||!vue(P.x,P.y,g.x,g.y))continue;
    const e=Math.abs(ang(Math.atan2(dy,dx)-P.fa));if(e>1.15)continue;
    const s=e*6+d*0.12;if(s<bs){bs=s;best=g;}
  }
  return best;
}

/* ======================= le Pisteur, image après image ======================= */
function majJoueur(dt){
  P.t+=dt;
  P.sautCD=Math.max(0,P.sautCD-dt);
  /* l'ombre revient après trois secondes D'AFFILÉE sans être vu : dès qu'un golem le revoit, le compte repart de zéro */
  if(nVoient>0&&!P.ombre)P.ombreCD=REG.ombre.cd;else P.ombreCD=Math.max(0,P.ombreCD-dt);
  if(P.capeT>0){P.capeT=Math.max(0,P.capeT-dt);if(P.capeT<=0){son('perdu');eclatOmbre(P.x,P.y,0.6);}}
  /* ce que les cartes dorées toucheraient, là, tout de suite : une petite marque dorée le montre sur le golem */
  P.cibles.fleche=P.ombre&&P.cartes.fleche?cibleCarte('fleche'):null;P.cibles.sifflet=P.ombre&&P.cartes.sifflet?cibleCarte('sifflet'):null;
  P.sautOmbreCD=Math.max(0,P.sautOmbreCD-dt);P.lentT=Math.max(0,P.lentT-dt);
  P.fondu=clamp(P.fondu+(P.ombre?dt:-dt)/0.22,0,1);
  /* le saignement : il dure son temps, que le chien soit vivant ou non */
  if(P.saigne.length&&P.etat!=='aterre'){
    let d=0;
    for(const s of P.saigne){s.t-=dt;if(s.t<=0){s.t+=1;s.n--;d+=REG.saigne.dmg;}}
    P.saigne=P.saigne.filter(s=>s.n>0);
    if(d){P.hp=Math.max(0,P.hp-d);stats.recus+=d;stats.saignement+=d;texte(P.x+rnd(-0.3,0.3),P.y,1.7,'−'+d,'#ff5a4a');if(P.hp<=0)tomber();}
  }
  const n=hyp(inp.mx,inp.my);
  if(n>0.2&&P.etat==='libre')P.fa=Math.atan2(inp.my,inp.mx);
  if(sautDemande){sautDemande=false;demanderSaut();}
  switch(P.etat){
    case 'libre':
      deplacer(1,dt);
      if(P.tampon){const b=P.tampon;P.tampon=0;lancer(b);}
      else if(tenu[1]&&!P.ombre)lancer(1);
      break;
    case 'dague':{
      /* la lame part dès qu'on appuie ; la lenteur est dans le retour du bras */
      deplacer(0.35,dt);
      if(P.t<REG.dague.frappe){const c=P.cible;if(c&&vivant(c)&&hyp(c.x-P.x,c.y-P.y)-c.r>0.9){P.x+=Math.cos(P.fa)*7*dt;P.y+=Math.sin(P.fa)*7*dt;pousserHors(P,0.33,false);}}
      if(!P.coupFait&&P.t>=REG.dague.frappe){P.coupFait=true;frapperDague();}
      if(P.t>=P.dur)finGeste();
      break;}
    case 'embuscade':case 'assomme':{
      const k=clamp(P.t/0.14,0,1);P.x=lerp(P.ax,P.bx,k);P.y=lerp(P.ay,P.by,k);P.z=Math.sin(Math.PI*k)*0.35;
      if(Math.random()<0.8)parts.push({k:'fant',x:P.x,y:P.y,z:P.z,vie:0.2,max:0.2});
      if(!P.coupFait&&P.t>=REG[P.etat].frappe){P.coupFait=true;if(P.etat==='embuscade')frapperEmbuscade();else frapperAssomme();}
      if(P.t>=P.dur)finGeste();
      break;}
    case 'bandage':
      /* trois secondes sans bouger : le pouce gauche ne fait rien, seul le saut répond */
      if(P.t>=P.dur){finBandage();finGeste();}
      break;
    case 'saut':{
      const k=Math.min(1,P.t/P.dur);P.x+=P.vx*dt;P.y+=P.vy*dt;P.z=Math.sin(Math.PI*k)*0.75;
      if(obsEn(P.x,P.y,0.2,false)&&!obsEn(P.x,P.y,0.2,true))P.saute=true;
      pousserHors(P,0.33,true);
      if(Math.random()<0.8)parts.push({k:'fant',x:P.x,y:P.y,z:P.z,vie:0.2,max:0.2});
      if(k>=1){
        libererDesMurs(P.fa);
        if(P.saute){stats.murs++;}
        finGeste();
      }
      break;}
    case 'sautOmbre':
      if(!P.coupFait&&P.t>=0.1){P.coupFait=true;P.x=P.bx;P.y=P.by;const g=P.cible;if(g)P.fa=Math.atan2(g.y-P.y,g.x-P.x);eclatOmbre(P.x,P.y,0.6);}
      if(P.t>=0.24)finGeste();
      break;
    case 'plaque':case 'sonne':if(P.t>=P.dur){P.etat='libre';P.t=0;}break;
    case 'chaine':{
      /* la chaîne du colosse le ramène au contact : aucun dégât, mais on ne quitte plus ce combat */
      const k=Math.min(1,P.t/P.dur);P.x=lerp(P.ax,P.bx,k);P.y=lerp(P.ay,P.by,k);P.z=Math.sin(Math.PI*k)*0.5;
      if(k>=1){P.z=0;libererDesMurs(Math.atan2(P.ay-P.by,P.ax-P.bx));P.etat='libre';P.t=0;poussiere(P.x,P.y,1);}
      break;}
    case 'vol':{
      /* envoyé valser par le bélier : il reprend la main dès qu'il retombe */
      const k=Math.min(1,P.t/P.dur);P.x+=P.vx*dt;P.y+=P.vy*dt;P.z=Math.sin(Math.PI*k)*1.1;pousserHors(P,0.33,true);
      if(k>=1){libererDesMurs(Math.atan2(P.vy,P.vx));P.etat='libre';P.t=0;P.z=0;poussiere(P.x,P.y,1);}
      break;}
  }
  if(P.ombre){P.aPortee=cibleProche(REG.embuscade.portee);P.cibleSO=P.sautOmbreCD<=0&&!P.aPortee?cibleSautOmbre():null;}else{P.aPortee=null;P.cibleSO=null;}
  /* la piste : un caillou tous les demi-pas (c'est elle que flaire une meute en colère) */
  if(P.etat!=='aterre'){
    const l=piste[piste.length-1];
    if(!l||hyp(P.x-l.x,P.y-l.y)>0.5){piste.push({x:P.x,y:P.y});if(piste.length>800){piste.splice(0,200);pisteBase+=200;}}
  }
}

/* ======================= prendre un coup ======================= */
/* opt : {sx,sy d'où vient le coup, sonne, plaque (durées), vol:{a,L}, saigne, nom} */
function blesserP(dmg,opt){
  opt=opt||{};
  if(P.etat==='saut'||P.etat==='sautOmbre'){
    if(tReel-P.touchT>0.4){P.touchT=tReel;stats.esquives++;texte(P.x,P.y,1.9,'Esquivé !','#cfe8ff');}
    return false;
  }
  if(etatJeu!=='jeu'||P.etat==='aterre')return false;
  if(invincible){dmg=0;}
  sortirOmbre('coup');
  if(P.etat==='bandage')bandagePerdu();
  if(dmg){P.hp=Math.max(0,P.hp-dmg);stats.recus+=dmg;stats.par[opt.nom||'?']=(stats.par[opt.nom||'?']||0)+dmg;texte(P.x,P.y,1.9,'−'+dmg,'#ff5566');flashR=Math.min(0.7,0.25+dmg/70);secousse(3+dmg/6);son('aie');}
  P.touchT=tReel;stats.coups++;
  if(opt.saigne){P.saigne.push({n:REG.saigne.fois,t:1});}
  if(P.hp<=0){tomber();return true;}
  const coupe=()=>{P.tampon=0;P.z=0;};
  if(opt.vol){coupe();P.etat='vol';P.t=0;P.dur=0.45;P.vx=Math.cos(opt.vol.a)*opt.vol.L/P.dur;P.vy=Math.sin(opt.vol.a)*opt.vol.L/P.dur;}
  else if(opt.plaque){coupe();P.etat='plaque';P.t=0;P.dur=opt.plaque;}
  else if(opt.sonne){coupe();P.etat='sonne';P.t=0;P.dur=opt.sonne;}
  return true;
}
function tomber(){
  P.hp=0;P.etat='aterre';P.t=0;P.z=0;P.tampon=0;P.saigne=[];P.capeT=0;defaiteDans=1.3;son('chute');stats.chutes++;
}
