
/* ============ Les règles de l'établi : ce qui se passe « pour de vrai » ============
   Les recettes viennent de plantes-donnees.js (une seule source, avec le jeu). Ici : ce que dit chaque outil quand on le touche les mains
   vides, et ce qui se passe quand on se trompe d'outil — toujours par rapport à la réalité (Romain, 12 novembre : « quand on le met dans
   le mauvais instrument, tu expliques ce qui se passe… eh ben non, là, il va se passer ça »). Des phrases courtes, racontées. */
var DN = window.PLANTES_DONNEES, ORDRE = DN.ORDRE, ORDRE_PL = DN.ORDRE_PL, PL = DN.PL, RE = DN.RE, PLD = window.PLD;
/* les outils où la matière travaille toute seule dès qu'on l'y pose (on verse, ça filtre ; on pose, ça sèche ; on met en fiole) */
var AUTO = {filtre:1, sechoir:1, fiole:1};
var QUOI = {
  planche:'La planche et le couteau. Pour hacher menu.',
  tamis:'Le tamis. Il laisse passer le fin, et retient le gros.',
  mortier:'Le mortier et son pilon. Pour écraser.',
  presse:'Le pressoir. On tourne la vis, et il serre très fort.',
  filtre:'Le bocal à filtrer. Le liquide passe à travers le tissu, les miettes restent.',
  marmite:'La marmite. Avec ou sans feu : c\'est toi qui choisis.',
  alambic:'L\'alambic. Il change l\'eau en vapeur, puis la vapeur en gouttes.',
  sechoir:'Le séchoir. Ici, on laisse le temps faire, à l\'ombre.',
  fiole:'Les fioles vides. La dernière étape de chaque potion.',
  cruche:'La cruche. De l\'eau fraîche du puits.',
  huilier:'L\'huile de lin. Elle sert à faire chauffer une plante… ou à graisser les serrures.',
  huilierVide:'Vide ! Pour la remplir, il faudra presser des graines de lin.',
  buche:'Des bûches bien sèches. Une bûche : feu doux. Deux bûches : feu fort.',
  allumette:'Les allumettes. Craac… et le feu prend, s\'il a du bois.'
};
function famille(m){ return !m ? 'solide' : m.f === 'jus' ? 'liquide' : (m.f === 'tas' || m.f === 'cristaux' || m.f === 'graines') ? 'poudre' : m.f === 'pate' ? 'pate' : 'solide'; }
/* Un geste qui n'est pas dans la recette : ce que ça donne, selon l'outil et ce qu'on y a mis */
var GEN = {
  planche:{solide:'Tchac, tchac… De tout petits morceaux. Mais ce n\'est pas ce que dit la recette.', liquide:'Hacher un liquide ? Floc, floc… Tout coule de la planche.', poudre:'C\'est déjà plus fin que ta lame !', pate:'La pâte colle à la lame. Beurk !'},
  tamis:{solide:'Trop gros ! Rien ne passe par les petits trous du tamis.', liquide:'Un liquide dans un tamis… Il traverse tout, d\'un seul coup.', poudre:'Tout passe à travers. Un tamis sépare le fin du gros : ici, tout est fin.', pate:'La pâte bouche tous les trous du tamis.'},
  mortier:{solide:'Tu piles, tu piles… Une bouillie. Ce n\'est pas ce que dit la recette.', liquide:'Splash ! Piler un liquide, ça éclabousse partout.', poudre:'Tu piles, tu piles… C\'était déjà tout fin !', pate:'C\'est déjà de la pâte. Tu piles pour rien !'},
  presse:{solide:'Tu serres la vis… À peine une goutte. Il n\'y a presque pas de jus là-dedans.', liquide:'Presser un liquide ? Il file entre les lattes.', poudre:'Ça se tasse en galette. Rien ne coule.', pate:'Splatch ! La pâte déborde de partout.'},
  filtre:{solide:'Rien ne coule. Un filtre sépare un liquide de ses miettes : ici, pas de liquide.', liquide:'Il passe tout entier : il était déjà clair.', poudre:'Tout reste sur le tissu. Rien ne passe.', pate:'La pâte bouche tous les trous du tissu.'},
  sechoir:{solide:'Ça sèche, ça sèche… Tout ratatiné. Ce n\'est pas ce que dit la recette.', liquide:'Le liquide s\'évapore tout doucement… Il ne reste presque rien au fond.', poudre:'C\'est déjà tout sec !', pate:'La pâte durcit comme un caillou.'},
  fiole:{solide:'Pas encore ! Ce n\'est pas une potion, ça.', liquide:'Pas encore ! La recette n\'est pas finie.', poudre:'Pas encore ! La recette n\'est pas finie.', pate:'Pas encore ! La recette n\'est pas finie.'}
};
var GEN_FEU = {
  marmite:{'sec+froid':'Ni eau, ni huile, ni feu : tu tournes la cuillère… et il ne se passe rien.', sec:'Sans eau ni huile, ça grille ! Une odeur de brûlé remplit l\'atelier.',
    'eau+froid':'Ça trempe dans l\'eau froide. L\'eau se trouble un peu… et c\'est tout.', eau:'Une tisane ! Ça sent bon… mais ce n\'est pas une potion.',
    'huile+froid':'Ça trempe dans l\'huile froide. Il ne se passe pas grand-chose.', huile:'Ça frit dans l\'huile ! Des beignets de plante… Ce n\'est pas la recette.',
    'jus+froid':'Sans feu, rien ne change dans la marmite.', jus:'Ça chauffe, ça fume… et ça ne donne rien de bon.'},
  alambic:{sec:'Sans eau, pas de vapeur : ça grille au fond du cuivre !', 'eau+froid':'Sans feu, l\'eau reste froide. Pas une goutte ne monte.', eau:'La vapeur monte, les gouttes tombent… De l\'eau claire, presque sans parfum.',
    huile:'L\'huile ne se change pas en vapeur : elle reste au fond, et ça sent le brûlé.', 'sec+froid':'Ni eau, ni feu : l\'alambic dort.', 'huile+froid':'De l\'huile froide dans le cuivre… L\'alambic dort.'}
};
/* Ce qu'on tient (la cruche, l'huile, une bûche, une allumette), posé là où ça ne sert à rien */
var PORTE = {
  cruche:{planche:'L\'eau coule de la planche… et goutte par terre.', tamis:'L\'eau traverse le tamis d\'un seul coup. Plouf, dans la jatte !', mortier:'Une soupe froide au fond du mortier. Ce n\'est pas ça !',
    presse:'L\'eau file entre les lattes du pressoir.', filtre:'L\'eau traverse le tissu. Elle était déjà claire !', sechoir:'De l\'eau dans le séchoir ? Elle mettrait des jours à s\'en aller.', fiole:'Une fiole d\'eau claire. Ça désaltère… mais ce n\'est pas une potion.'},
  huilier:{defaut:'L\'huile de lin est précieuse ! Elle va dans la marmite, pour y faire chauffer une plante.', alambic:'L\'huile ne se change pas en vapeur. Dans l\'alambic, il faut de l\'eau.'},
  buche:{defaut:'Une bûche ici ? Le feu, c\'est sous la marmite… ou sous l\'alambic.'},
  allumette:{defaut:'Rien à allumer ici. Et gare aux doigts !', sechoir:'Surtout pas ! Des plantes sèches, ça flambe d\'un seul coup.', presse:'Un pressoir en bois ? Surtout pas de feu ici !', planche:'Une planche en bois ? Surtout pas de feu ici !'}
};
var DIT = {
  buche1:'Une bûche : un feu doux.', buche2:'Deux bûches : un feu fort !', plein:'Le foyer est plein.', retire:'Tu retires une bûche.',
  sansBois:'Craac ! Une jolie flamme… et rien à brûler. Sans bûche, pas de feu.', dejaFeu:'Ça brûle déjà !',
  eau:'De l\'eau fraîche.', dejaEau:'Il y a déjà de l\'eau.', huile:'Un bon fond d\'huile de lin.', dejaHuile:'Il y a déjà de l\'huile.',
  melange:'L\'eau et l\'huile ne se mélangent jamais : l\'huile flotte dessus ! Il faut choisir.',
  dejaFait:'C\'est fait ! La suite est dans le grimoire.', uneChose:'Une chose à la fois ! Tu as déjà une préparation en route.',
  dejaPotion:'Déjà en fiole !', pasCueillie:'Pas encore cueillie.', pasPrete:'Pas encore prête.',
  toutes:'Sept fioles, sept couleurs : tout est prêt !', code:'Les sept potions sont prêtes. Donne ce code au Pisteur : il le tape dans son onglet Code.', pendue:'Elle sèche la tête en bas.', livreVide:'Le grimoire attend tes cueillettes. À chaque plante trouvée, une page s\'écrit toute seule.',
  feuEteint:'Le bois a brûlé : le feu s\'éteint.'
};
/* Le « cas » d'une marmite ou d'un alambic : ce qu'on y a versé, et le feu dessous */
function niveauFeu(o){ var f = S.feux[o]; return f && f.allume ? f.b : 0; }
function casDe(o){
  if(o !== 'marmite' && o !== 'alambic') return null;
  var liq = S.liq[o] || (S.m && S.m.f === 'jus' ? 'jus' : 'sec'), n = niveauFeu(o);
  return {liq:liq, feu:n === 0 ? 'froid' : n === 1 ? 'doux' : 'fort'};
}
/* L'étape attendue est-elle faite comme il faut ? */
function bonGeste(e, o){
  if(!e || e.o !== o || e.verse) return false;
  if(o === 'marmite' || o === 'alambic'){
    if(e.liq ? S.liq[o] !== e.liq : S.liq[o] === 'huile') return false;
    return niveauFeu(o) === (e.feu || 0);
  }
  return true;
}
/* La phrase d'un geste faux : celle de la recette si elle en a une pour ce geste, sinon celle de l'outil */
function phraseFaux(r, n, o, m){
  var F = r.faux || {}, c = casDe(o), k = n + ':' + o, l;
  if(c){
    l = c.liq === 'jus' ? 'sec' : c.liq;
    if(F[k + ':' + l + '+' + c.feu]) return F[k + ':' + l + '+' + c.feu];
    if(F[k + ':' + l] && !(l === 'sec')) return F[k + ':' + l];
    if(F[k + ':' + c.feu]) return F[k + ':' + c.feu];
    if(F[k]) return F[k];
    var G0 = GEN_FEU[o];
    return G0[c.liq + '+' + c.feu] || G0[c.liq] || G0.sec;
  }
  return F[k] || GEN[o][famille(m)];
}
