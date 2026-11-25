/* ======================= les améliorations et les cartes dorées =======================
   Des noms « standards » (Romain, 25 novembre : ce moteur resservira) : le chef ennemi, les ennemis, une bête alliée. */
const FAMILLES={marque:['🏹','La marque'],saignement:['🗡️','Le saignement'],poussee:['💨','La poussée'],ombre:['🌑','L\'ombre'],tous:['❤️','Pour tous']};
const CARTES=[
  /* la marque (l'arc) */
  {id:'marquante',f:'marque',ic:'🎯',nom:'Flèche marquante',txt:"Chaque flèche marque l'ennemi 6 secondes : marqué, il reste visible derrière les murs."},
  {id:'patient',f:'marque',ic:'⏳',nom:'Chasseur patient',txt:"Moitié plus de dégâts sur un ennemi marqué."},
  {id:'rafale',f:'marque',ic:'🌬️',nom:'Rafale',txt:"À découvert, l'arc tire bien plus vite."},
  {id:'perfo',f:'marque',ic:'🏹',nom:'Flèches perforantes',txt:"Chaque flèche traverse trois ennemis."},
  {id:'triple',f:'marque',ic:'🔱',nom:'Triple flèche',txt:"Trois flèches en éventail à chaque tir."},
  {id:'mainSure',f:'marque',ic:'✋',nom:'Main sûre',txt:"Caché, l'arc se bande deux fois plus vite."},
  {id:'pointFaible',f:'marque',ic:'💠',nom:'Point faible',txt:"Caché, le tir visé frappe encore plus fort."},
  {id:'clouante',f:'marque',ic:'📌',nom:'Flèche clouante',txt:"Une flèche sur un ennemi marqué le cloue sur place une seconde."},
  /* le saignement (la dague) */
  {id:'dentelee',f:'saignement',ic:'🩸',nom:'Lame dentelée',txt:"La dague fait saigner : l'ennemi perd de la vie pendant 4 secondes."},
  {id:'hemorragie',f:'saignement',ic:'💢',nom:'Hémorragie',txt:"Un ennemi qui saigne prend un dégât de plus à chaque coup."},
  {id:'tourbillon',f:'saignement',ic:'🌀',nom:'Tourbillon',txt:"Le dernier coup de dague tourne tout autour du Pisteur."},
  {id:'longue',f:'saignement',ic:'📏',nom:'Longue lame',txt:"La dague porte plus loin."},
  {id:'affutee',f:'saignement',ic:'🗡️',nom:'Lame affûtée',txt:"Un dégât de plus à chaque coup de dague."},
  {id:'enchainement',f:'saignement',ic:'⚔️',nom:'Enchaînement',txt:"La série de dague va jusqu'à cinq coups."},
  {id:'grace',f:'saignement',ic:'☠️',nom:'Coup de grâce',txt:"Un ennemi presque à terre tombe au premier coup de dague."},
  {id:'soif',f:'saignement',ic:'💚',nom:'Soif du chasseur',txt:"Tous les cinq ennemis abattus, un cœur revient."},
  /* la poussée (le bond et les coups lourds) */
  {id:'epaule',f:'poussee',ic:'🏋️',nom:"Coup d'épaule",txt:"Le bond repousse les ennemis traversés."},
  {id:'mur',f:'poussee',ic:'🧱',nom:'Contre le mur',txt:"Un ennemi poussé contre un mur est sonné, et il a mal."},
  {id:'lourd',f:'poussee',ic:'🔨',nom:'Coup lourd',txt:"Le dernier coup de la série de dague repousse loin."},
  {id:'bondLong',f:'poussee',ic:'🦘',nom:'Bond long',txt:"Le bond va bien plus loin."},
  {id:'deuxBonds',f:'poussee',ic:'💨',nom:'Deux bonds',txt:"Deux bonds d'affilée avant de reprendre son souffle."},
  {id:'atterrissage',f:'poussee',ic:'💥',nom:'Atterrissage',txt:"À la fin du bond, une petite onde repousse les ennemis autour."},
  {id:'ricochet',f:'poussee',ic:'🎳',nom:'Ricochet',txt:"Un ennemi poussé qui en percute un autre le pousse à son tour."},
  {id:'leger',f:'poussee',ic:'👣',nom:'Pas léger',txt:"Le Pisteur court plus vite."},
  {id:'sifflet',f:'poussee',ic:'🐺',nom:'Sifflet',txt:"De temps en temps, une bête alliée traverse la salle et bouscule les ennemis."},
  /* l'ombre (la cachette) */
  {id:'feutre',f:'ombre',ic:'🤫',nom:'Pas feutré',txt:"Les ennemis mettent deux fois plus de temps à remarquer le Pisteur."},
  {id:'assassin',f:'ombre',ic:'🥷',nom:'Assassin',txt:"Le coup d'assassin enlève la moitié de la vie des gros ennemis."},
  {id:'disparition',f:'ombre',ic:'🌫️',nom:'Disparition',txt:"Un assassinat sans témoin n'excite plus le regard du chef ennemi."},
  {id:'sautLong',f:'ombre',ic:'🕳️',nom:"Saut d'ombre long",txt:"Le saut d'ombre porte deux fois plus loin."},
  {id:'echo',f:'ombre',ic:'👂',nom:'Écho trompeur',txt:"Quand le Pisteur se cache, les ennemis le cherchent au mauvais endroit."},
  {id:'protectrice',f:'ombre',ic:'🛡️',nom:'Ombre protectrice',txt:"Caché, le premier coup reçu ne fait rien."},
  {id:'odorat',f:'ombre',ic:'👃',nom:'Odorat',txt:"Les ennemis tout proches restent visibles derrière les murs."},
  /* pour tous */
  {id:'coeur',f:'tous',ic:'❤️',nom:'Cœur de chêne',txt:"Deux cœurs de plus, et tous les cœurs reviennent."}
];
/* il faut : les deux améliorations ; arme : une seule carte dorée par arme dans une partie ; c : caché ; d : à découvert */
const DOREES=[
  {id:'fumee',arme:'cape',ic:'☁️',nom:'Fumée noire',faut:['feutre','atterrissage'],c:"chaque assassinat lâche un nuage : rien de ce qui s'y passe n'est vu.",d:"chaque bond laisse un nuage : dedans, les ennemis perdent ta trace."},
  {id:'pasOmbre',arme:'bond',ic:'🌒',nom:"Pas de l'ombre",faut:['sautLong','bondLong'],c:"pendant un bond, personne ne te voit : tu changes d'abri sans te montrer.",d:"un bond qui finit contre un mur te cache aussitôt."},
  {id:'leurre',arme:'cape',ic:'🧥',nom:'Le leurre',faut:['echo','protectrice'],c:"repéré ? Ta cape reste sur place et attire tous les ennemis 4 secondes.",d:"une fois par vague, la cape prend le coup de trop à ta place, et tu disparais."},
  {id:'roulade',arme:'bond',ic:'🤸',nom:'Roulade',faut:['epaule','leger'],c:"le bond sonne 2 secondes chaque ennemi traversé.",d:"pareil, et le bond suivant ne coûte rien."},
  {id:'cloche',arme:'arc',ic:'☄️',nom:'Flèche en cloche',faut:['triple','pointFaible'],c:"le tir visé tombe du ciel, par-dessus tout, encore plus fort.",d:"les flèches passent par-dessus les boucliers et les obstacles bas."},
  {id:'oeil',arme:'arc',ic:'👁️',nom:'Œil du pisteur',faut:['marquante','odorat'],c:"tous les ennemis restent visibles à travers les murs.",d:"les zones rouges apparaissent plus tôt."},
  {id:'cape',arme:'cape',ic:'🦇',nom:"Cape d'ombre",faut:['disparition','echo'],c:"deux fois par vague, le regard du chef passe sur toi sans te voir.",d:"quand le chef ordonne l'assaut, tu disparais 2 secondes."},
  {id:'danse',arme:'dague',ic:'🌪️',nom:'Danse des lames',etoile:1,faut:['tourbillon','affutee'],c:"un assassinat frappe aussi tous les ennemis autour, avec la même force.",d:"le dernier coup de dague tourne deux fois et repousse tout le monde."},
  {id:'chaine',arme:'dague',ic:'⛓️',nom:"Chaîne d'assassin",etoile:1,faut:['assassin','grace'],c:"un assassinat qui tue te pose dans le dos de l'ennemi le plus proche, toujours caché.",d:"chaque ennemi abattu recharge le bond."},
  {id:'rayon',arme:'arc',ic:'🌙',nom:'Rayon de lune',faut:['perfo','pointFaible'],c:"le tir visé traverse toute la salle, murs compris.",d:"une flèche sur cinq devient un rayon qui traverse tout."},
  {id:'clou',arme:'arc',ic:'🔩',nom:"Clou d'acier",faut:['clouante','mur'],c:"le tir visé cloue l'ennemi 3 secondes, et il ne peut prévenir personne.",d:"une flèche dans un ennemi qui charge l'arrête net et le sonne."},
  {id:'saignee',arme:'dague',ic:'💉',nom:'Saignée',faut:['dentelee','hemorragie'],c:"l'assassinat pose trois saignements d'un coup.",d:"les saignements font double, et passent à travers les armures."},
  {id:'briseur',arme:'dague',ic:'🪓',nom:"Briseur d'armure",faut:['mur','assassin'],c:"deux coups d'assassin suffisent contre un ennemi en armure.",d:"un ennemi en armure poussé contre un mur perd son armure 4 secondes."},
  {id:'echoOnde',arme:'bond',ic:'🌊',nom:"Écho de l'onde",faut:['atterrissage','bondLong'],c:"une onde s'arrête aussi derrière les obstacles bas.",d:"sauter par-dessus une onde la renvoie à celui qui l'a lancée."},
  {id:'meute',arme:'cape',ic:'🐾',nom:'Meute',faut:['sifflet','assassin'],c:"chaque assassinat appelle une bête alliée contre le tireur le plus éloigné.",d:"une bête alliée deux fois plus souvent."},
  {id:'boulets',arme:'bond',ic:'🎱',nom:'Ricochet en chaîne',etoile:1,faut:['ricochet','epaule'],c:"un ennemi poussé depuis la cachette ne donne pas l'alerte.",d:"les ennemis poussés deviennent des boulets : chaque choc en pousse un autre."},
  {id:'volees',arme:'arc',ic:'🗃️',nom:'Armes volées',faut:['leger','rafale'],c:"une arme lancée depuis l'ombre cloue l'ennemi 3 secondes.",d:"ramasser une arme ennemie en donne trois."},
  {id:'vivante',arme:'cape',ic:'👤',nom:'Ombre vivante',etoile:1,faut:['protectrice','deuxBonds'],c:"repéré ? Deux secondes de plus pendant lesquelles les ennemis ne voient rien.",d:"après chaque coup évité d'un bond, tu redeviens caché un instant."},
  {id:'aube',arme:'arc',ic:'🌅',nom:"Tir de l'aube",faut:['mainSure','patient'],c:"un tir visé qui tue se recharge aussitôt.",d:"chaque ennemi marqué abattu marque l'ennemi le plus proche."},
  {id:'dernierPas',arme:'dague',ic:'🕯️',nom:'Le dernier pas',etoile:1,faut:['coeur','soif'],c:"une fois par partie, à zéro cœur, tu te relèves caché avec trois cœurs.",d:"tant qu'il ne te reste qu'un cœur, tes coups font double."}
];
const CARTE={};for(const c of CARTES)CARTE[c.id]=c;for(const c of DOREES){c.doree=1;CARTE[c.id]=c;}
/* les pages des carnets de l'ancêtre (enquêtes 4 à 9) : une page par carte dorée. Tant que ces enquêtes ne sont pas faites,
   toutes les pages comptent comme trouvées (réglage du menu Pause, pour essayer sans). */
let pagesTrouvees=true;
function tirerCartes(P){
  const up=P.up,libres=CARTES.filter(c=>!up[c.id]);
  const armesPrises={};for(const d of DOREES)if(up[d.id])armesPrises[d.arme]=1;
  const dorees=pagesTrouvees?DOREES.filter(d=>!up[d.id]&&!armesPrises[d.arme]&&up[d.faut[0]]&&up[d.faut[1]]):[];
  const pris=[];
  if(dorees.length)pris.push(dorees[Math.floor(Math.random()*dorees.length)]);
  /* une carte qui complète une paire, quand il y en a une (comme les cartes doubles de Hades) */
  const paires=libres.filter(c=>DOREES.some(d=>!up[d.id]&&!armesPrises[d.arme]&&d.faut.includes(c.id)&&up[d.faut[0]===c.id?d.faut[1]:d.faut[0]]));
  if(paires.length&&pris.length<3){const c=paires[Math.floor(Math.random()*paires.length)];pris.push(c);libres.splice(libres.indexOf(c),1);}
  while(pris.length<3&&libres.length){
    /* des familles variées quand c'est possible */
    let cand=libres.filter(c=>!pris.some(q=>q.f===c.f));if(!cand.length)cand=libres;
    const c=cand[Math.floor(Math.random()*cand.length)];pris.push(c);libres.splice(libres.indexOf(c),1);
  }
  return pris.sort(()=>Math.random()-0.5);
}
/* ce qu'une amélioration prépare : « avec X → la carte dorée Y » */
function menePaire(c,up){
  if(c.doree)return '';
  for(const d of DOREES){if(up[d.id]||!d.faut.includes(c.id))continue;const autre=d.faut[0]===c.id?d.faut[1]:d.faut[0];if(up[autre])return 'Avec « '+CARTE[autre].nom+' » : la carte dorée « '+d.nom+' ».';}
  return '';
}
