/* ==========================================================
   Brumeval — « Suivre les traces » : le Pisteur marche librement, la caméra le suit (enquête 3 : les traces de Moustache)

   CE QUE ROMAIN A DEMANDÉ (13 novembre) — il remplace, pour Moustache, l'ancien « Suivre la piste » où le sol défilait tout seul :
   · « Le Pisteur va être au centre de l'image, et quand il avance ou quand il recule, la caméra le suit. »
   · « Simplement, il doit trouver les bonnes traces et aller jusqu'à l'église. S'il suit des mauvaises traces jusqu'à un point précis,
     là, il perd. » On ne perd donc jamais par maladresse : seulement en allant AU BOUT d'une mauvaise piste.
   · « Fais en sorte que les traces ne soient pas énormes […] » ; « que même en petit, on arrive à reconnaître les traces des chats ».
   · « Tu fais démarrer le jeu depuis chez Odette. » Pas de code pour dire quelle trace suivre : le Sage a le carnet d'Odette
     (chats.js), il le dit à voix haute. Ici, rien ne dit laquelle est la bonne.

   LA REFONTE DU 15 NOVEMBRE (Romain, 12 h 56 : « je pense qu'il reviendra […] Je veux qu'il soit bien travaillé »)
   · « augmenter le niveau de détail du décor », « beaucoup, beaucoup plus travailler les textures », « un joli mini-jeu » :
     une vraie petite ville vue du ciel — des pavés un par un, des trottoirs, des toits de tuiles et d'ardoise avec leurs rangs,
     leurs cheminées, leurs lucarnes, des cours, des jardins, des potagers, des puits, des tonneaux, des étals, des lanternes,
     du linge qui sèche, des arbres touffus, des pigeons, l'église et son cimetière, la maison d'Odette et son lait renversé.
   · « des flaques d'eau qui font disparaître un peu les traces » ; « quand il passe dans la flaque, les traces changent de couleur,
     parce qu'au début c'est des traces de lait » ; « petit à petit […] elles finissent par sécher » : chaque chat a les pattes pleines
     de lait chez Odette, et ses traces pâlissent à mesure qu'il marche ; dans une flaque (ou la boue, ou la farine), on ne voit plus
     rien, puis ses traces repartent mouillées (sombres), boueuses (brunes) ou farinées (toutes blanches), bien nettes, et sèchent à
     leur tour. Elles ne disparaissent jamais tout à fait (le « plancher » de chaque niveau) : on peut toujours les suivre.
   · « un système un peu de saut » : des caisses, des tonneaux, une charrette, des sacs, du bois au milieu de la rue ; le chat saute
     par-dessus (un trou dans ses traces, deux pattes serrées à l'appel, quatre à la réception). Le Pisteur, lui, doit faire le tour.
     Parfois aussi, un chat saute par-dessus une petite flaque au lieu de marcher dedans : ses traces restent de lait.
   · « le chat passe sous une arche […] on doit passer sous l'arche, et les traces disparaissent » : des maisons construites
     par-dessus la rue (un passage couvert). Dessous, il fait sombre et il n'y a plus une trace ; le Pisteur y passe (le toit devient
     transparent au-dessus de lui) et cherche de l'autre côté laquelle ressort.
   · « tes propres traces de pas » : le Pisteur ne laisse rien… tant qu'il ne marche pas dans une flaque, la boue ou la farine ; ses
     semelles marquent alors le sol (de moins en moins fort), et ses traces sèchent toutes seules (l'eau vite, la farine moins, la boue
     lentement). Elles passent PAR-DESSUS celles des chats : plus on tourne en rond, plus on se gêne.
   · « 2 ou 3 chats qui passent […] tu les vois passer à côté de toi […] une jolie animation » : deux ou trois fois par partie, un des
     autres chats d'Odette arrive en courant derrière le Pisteur, le dépasse et file ; ses traces toutes fraîches (mouillées) s'ajoutent,
     puis sèchent. Il disparaît d'un bond sur un toit.
   · « le chat gris d'Odette […] miaule devant l'entrée de la crypte […] dès qu'il nous voit arriver, hop, il fuit » : Moustache est
     assis devant la grille et miaule (on l'entend de plus en plus fort en approchant) ; quand le Pisteur arrive, il file entre les
     barreaux et disparaît dans le noir. On ne peut pas le suivre : il reste la grille (c'est gagné, comme avant).
   · « des éclairages matin, après-midi et nuit, en fonction de quand il va voir les traces » : le moment de l'enquête (M.momentId),
     ou params.moment. Le matin : un soleil bas, de longues ombres vers l'ouest, une brume qui traîne ; l'après-midi : la lumière
     dorée, des ombres courtes ; la nuit : tout est bleu et sombre, sauf la lanterne du Pisteur, les lanternes des carrefours, les
     fenêtres allumées, celles de l'église.

   LE DEUXIÈME TOUR DU 15 NOVEMBRE (Romain, 14 h 26 à 14 h 29) — CE QUI CHANGE PAR RAPPORT À CE QUI EST ÉCRIT JUSTE AU-DESSUS :
   · « tu fais 7 sorties avec 7 chats, et il n'y en a qu'une qui est la bonne ; les autres, tu les fais sortir vers des endroits
     aléatoires de la ville » : toujours les sept chats d'Odette, Moustache et six fausses pistes (plus de nombre selon le niveau).
   · « les flaques de boue, les flaques d'eau […] tout le long de la rue, qu'on ne puisse pas les éviter » : elles barrent la rue
     d'un mur à l'autre (EN TRAVERS), et il y en a dans beaucoup de bouts de rue. Un chat qui y passe laisse ensuite des traces
     toutes fraîches, PAR-DESSUS les autres.
   · « au début on voit bien, et plus on avance, moins on voit la trace, jusqu'à un moment où on ne la voit plus du tout ; on avance
     un peu à l'aveugle jusqu'à la prochaine flaque » : PLUS DE PLANCHER. Une trace pâlit avec la distance depuis sa dernière
     flaque (ou depuis le lait), puis disparaît. Sur la piste de Moustache, jamais plus de p.ecart sans une flaque (on en ajoute).
   · « tu mets 2 fois plus de chats qui courent » ; « le passage des chats efface les traces » ; « plus on met de temps, plus ce sera
     difficile » : les chats qui passent en courant arrivent sur une horloge (un de plus toutes les p.coureurs.tous secondes, sans
     limite : plus on cherche longtemps, plus il y en a) ; sous leurs pattes, les traces s'effacent, et ils laissent les leurs (le
     morceau du décor touché est redessiné : Blocs.salir). Ce sont les six autres chats ; jamais Moustache (« il n'a qu'une trace »).
   · « tu les fais tous miauler un peu différemment » ; « quand on entend des miaulements, on a envie d'aller vers le miaulement, mais
     des fois, c'est des fausses pistes » : au bout de chaque fausse piste, son chat est assis et appelle, chacun avec sa voix (et le
     son vient du bon côté : à gauche, à droite).
   · « dès qu'on s'approche trop d'un mauvais chat […] “Désolé, tu t'es trompé, tu n'as pas suivi la bonne trace” » : c'est perdu
     quand on entre dans son impasse et qu'on arrive près de lui (plus besoin d'aller tout au bout).
   · LA FORÊT (params.decor 'foret') : « quand il ne réussit pas à attraper la clé d'Anselme, il y a des miaulements et un chat qui
     va vers le puits […] moitié ville et moitié forêt […] tu modélises les arbres […] des variétés de décors […] à la fin, il y a
     le puits ». On part du pied du clocher (une flaque sous la gouttière : tous les chats y ont marché) ; en haut, deux rangées de
     rues ; puis la forêt : des chemins de terre, des chênes, des hêtres, des bouleaux, des pins, des sapins, des buissons, des
     fougères, de la mousse, des champignons, des rochers, des souches, des arbres couchés, un ruisseau qui coupe les chemins, des
     lucioles la nuit, un hibou ; au bout, une clairière et le vieux puits. Les fausses pistes finissent surtout dans la forêt
     (une souche, un terrier, une mare, un rond de champignons, des rochers, un arbre tombé).
     « Celui-là, il ne peut pas perdre » : près d'un mauvais chat, il file dans les fougères et le conteur dit de rebrousser
     chemin ; on ne perd jamais (sinon l'enquête serait bloquée). La ville, elle, se perd toujours.

   COMMENT C'EST FAIT (pour la fluidité : jeu/donjon/RAPIDITE.md)
   · Le quartier : des rues en quadrillage, des impasses ; le monde est tiré au hasard à chaque partie. Chez Odette (une impasse en
     haut), du lait renversé ; la piste de Moustache mène à l'église, tout au bout ; chaque autre piste finit dans une impasse.
   · TOUT CE QUI NE BOUGE PAS (le sol, les maisons, les arbres, les flaques, les traces des chats) est dessiné UNE FOIS, par morceaux
     de 512 × 512 points de l'écran (Blocs), au moment où ils vont entrer dans l'écran ; ensuite, chaque image ne fait que les
     recopier. Seuls sont redessinés à chaque image : les traces du Pisteur, les chats qui courent, Moustache, les pigeons, les rides
     d'une flaque, et, sur deux toiles au-dessus du Pisteur, les toits des passages couverts, les arbres qui débordent sur la rue,
     le linge, la fumée des cheminées, puis la lumière (une toile trois fois plus petite, étirée : la nuit, la brume).
   · Les traces des chats : chats.js (une seule source avec le carnet du Sage). Le Pisteur : celui de « Se cacher », vu du dessus
     (MJ.DESSUS, mj-cachette.js). Chargé APRÈS chats.js, mj-core.js et mj-cachette.js.
   · Les sons : la fabrique sonsPistage (entre ses deux bornes) est recopiée telle quelle dans l'Atelier des sons
     (donjon/essai/construire-sons.py, donjon/essai/sons/pistage.js).
   · Pour les essais : la zone porte __pistage ({etat(), monde, aller(x, y), poser(x, y), libre(x, y), coureur(), moustache(),
     pas(), chaussures(), moment, mesures()}).
   ========================================================== */
(function(){
'use strict';
var MJ = window.MJ, CH = window.CHATS;
if(!MJ || !CH){ if(window.console) console.error('mj-pistage : mj-core.js et chats.js doivent être chargés avant.'); return; }
var U = MJ.util;
var K = '#24182e';
var RUE = 78, PASX = 318, PASY = 276, BORD = 190, IMPASSE = 118;   /* la largeur d'une rue, l'écart entre deux carrefours, la marge du monde, la longueur d'une impasse */
var VITESSE = 104;        /* le pas du Pisteur (unités du monde par seconde) */
var PAS_CHAT = 21;        /* l'écart entre deux traces d'une même piste */
var TRACE = 5.1;          /* la demi-largeur d'une trace (le Pisteur fait 26 de large : une trace est petite, mais on compte ses doigts) */
var R_FIN = 34;           /* à cette distance du bout d'une piste, on y est */
var COULOIRS = [-27, -18, -9, 0, 9, 18, 27];
var CPX = 512;            /* un morceau du décor déjà dessiné : 512 × 512 points de l'écran */
var MARGE = 340;          /* autour du quartier : des jardins, des vergers */
var PI = Math.PI, TAU = Math.PI * 2;
function esc(s){ return String(s).replace(/[&<>"']/g, function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]; }); }
function reduit(){ try{ return window.matchMedia('(prefers-reduced-motion: reduce)').matches; }catch(e){ return false; } }
function lerp(a, b, t){ return a + (b - a) * t; }
/* un hasard qui redonne toujours la même suite pour une même graine (un morceau du décor redessiné est identique) */
function graine(n){ var s = (Math.abs(Math.floor(n)) % 2147483646) + 1; return function(){ s = s * 16807 % 2147483647; return (s - 1) / 2147483646; }; }
function nouvelleGraine(){ return Math.floor(Math.random() * 2e9) + 1; }
function hex(c){ var n = parseInt(c.slice(1), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; }
function mix(a, b, t){ var A = hex(a), B = hex(b), o = '#'; for(var i = 0; i < 3; i++){ var v = Math.round(A[i] + (B[i] - A[i]) * t); o += (v < 16 ? '0' : '') + v.toString(16); } return o; }
function rgba(c, a){ var A = hex(c); return 'rgba(' + A[0] + ',' + A[1] + ',' + A[2] + ',' + a + ')'; }
function croise(a, b, m){ m = m || 0; return a.x < b.x + b.w + m && a.x + a.w > b.x - m && a.y < b.y + b.h + m && a.y + a.h > b.y - m; }
function dans(r, x, y, m){ m = m || 0; return x >= r.x - m && x <= r.x + r.w + m && y >= r.y - m && y <= r.y + r.h + m; }
function rr(x, a, b, w, h, r){ r = Math.min(r, w / 2, h / 2); x.moveTo(a + r, b); x.arcTo(a + w, b, a + w, b + h, r); x.arcTo(a + w, b + h, a, b + h, r); x.arcTo(a, b + h, a, b, r); x.arcTo(a, b, a + w, b, r); x.closePath(); }
function rond(x, cx, cy, r){ x.beginPath(); x.arc(cx, cy, r, 0, TAU); }
function ovale(x, cx, cy, rx, ry, a){ x.beginPath(); x.ellipse(cx, cy, Math.max(.01, rx), Math.max(.01, ry), a || 0, 0, TAU); }
/* l'enveloppe d'un nuage de points (pour l'ombre d'une maison : sa forme et sa forme décalée) */
function enveloppe(P){
  P = P.slice().sort(function(a, b){ return a[0] - b[0] || a[1] - b[1]; });
  function c(o, a, b){ return (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]); }
  var bas = [], haut = [], i;
  for(i = 0; i < P.length; i++){ while(bas.length >= 2 && c(bas[bas.length - 2], bas[bas.length - 1], P[i]) <= 0) bas.pop(); bas.push(P[i]); }
  for(i = P.length - 1; i >= 0; i--){ while(haut.length >= 2 && c(haut[haut.length - 2], haut[haut.length - 1], P[i]) <= 0) haut.pop(); haut.push(P[i]); }
  haut.pop(); bas.pop(); return bas.concat(haut);
}

/* ---------- les bouts des fausses pistes ---------- */
var LIEUX = {
  voisin:{nom:'chez le voisin', t:'Ces traces s\'arrêtent chez le voisin, devant six gamelles vides.'},
  boulangerie:{nom:'derrière la boulangerie', t:'Ces traces s\'arrêtent derrière la boulangerie, le nez dans la farine.'},
  lavoir:{nom:'au lavoir', t:'Ces traces s\'arrêtent au bord du lavoir.'},
  arbre:{nom:'au pied d\'un arbre', t:'Ces traces s\'arrêtent au pied d\'un arbre : ce chat-là dort tout là-haut.'},
  carriole:{nom:'sous la carriole de Fortuné', t:'Ces traces s\'arrêtent sous la carriole de Fortuné.'},
  potager:{nom:'dans le potager', t:'Ces traces s\'arrêtent dans les choux de Basile.'},
  /* dans la forêt (la piste qui mène au puits) */
  souche:{nom:'à une vieille souche', t:'Ces traces s\'arrêtent au pied d\'une vieille souche creuse.'},
  terrier:{nom:'devant un terrier', t:'Ces traces s\'arrêtent devant un terrier de renard.'},
  mare:{nom:'à la mare', t:'Ces traces s\'arrêtent au bord d\'une mare pleine de grenouilles.'},
  champignons:{nom:'dans un rond de champignons', t:'Ces traces s\'arrêtent au milieu d\'un rond de champignons.'},
  rochers:{nom:'entre deux rochers', t:'Ces traces s\'arrêtent entre deux gros rochers couverts de mousse.'},
  tronc:{nom:'à un arbre tombé', t:'Ces traces s\'arrêtent devant un grand arbre tombé, tout creux.'}
};
var LIEUX_VILLE = ['voisin', 'boulangerie', 'lavoir', 'arbre', 'carriole', 'potager'];
var LIEUX_FORET = ['souche', 'terrier', 'mare', 'champignons', 'rochers', 'tronc'];
var SEUIL = .1;           /* en dessous de cette force, une trace ne se voit plus du tout : on ne la pose pas */
/* la force d'une trace, d : la distance parcourue depuis la dernière flaque (ou le lait), V : jusqu'où chaque matière se voit
   (p.vue). Elle pâlit doucement, puis vite, puis plus rien (Romain : « jusqu'à un moment donné, on ne la voit plus du tout »). */
function force(sub, d, V){ if(!sub || sub === 'sec') return 0; var u = d / ((V && V[sub]) || 200); return u >= 1 ? 0 : Math.pow(1 - u, .75); }

/* ---------- la lumière de chaque moment ----------
   ombre : là où tombent les ombres (le soleil est de l'autre côté) ; l : leur longueur pour une hauteur de 1 ; a : leur force.
   ciel : ce que reflètent les flaques. */
var LUM = {
  matin:{ombre:{x:-1, y:-.3, l:1.5, a:.3}, ciel:'#d2dcea', cielB:'#98abc6', reflet:'rgba(255,238,224,.6)', herbe:0},
  apresmidi:{ombre:{x:.62, y:-.58, l:.85, a:.27}, ciel:'#9ccaee', cielB:'#5f90c2', reflet:'rgba(255,255,255,.62)', herbe:0},
  nuit:{ombre:{x:.3, y:-.55, l:.6, a:.18}, ciel:'#3b4d78', cielB:'#1e2a48', reflet:'rgba(200,215,255,.32)', herbe:0, nuit:true}
};
/* ce que les chats ont sous les pattes après une flaque, la boue, la farine, le ruisseau (le gué de la forêt) */
var DE_TACHE = {flaque:'eau', boue:'boue', farine:'farine', ruisseau:'eau'};
/* les semelles du Pisteur : ce qu'elles gardent d'un pas à l'autre, combien de secondes une trace met à sécher, sa force, sa couleur */
var SEMELLE = {eau:{perte:.91, vie:55, a:.62, c:'#2a221e'}, boue:{perte:.94, vie:160, a:.92, c:'#5e3f21'}, farine:{perte:.93, vie:110, a:.92, c:'#ffffff'}};
var VENT = {x:.92, y:-.38};

/* ==========================================================
   LE MONDE : le quadrillage, les impasses, les pistes, les passages couverts, les obstacles, les flaques, les traces, le décor
   ========================================================== */
function creerMonde(p){
  /* la forêt : deux rangées de rues en haut (le village, le clocher), puis trois rangées de chemins dans les bois, et le puits tout en bas */
  var FORET = p.decor === 'foret', RANGS_VILLE = 2;
  var NX = p.nx, NY = FORET ? RANGS_VILLE + 3 : p.ny, miroir = Math.random() < .5;
  function nx(i){ return BORD + (miroir ? NX - 1 - i : i) * PASX; }
  function ny(j){ return BORD + IMPASSE + j * PASY; }
  var Wm = BORD * 2 + (NX - 1) * PASX, Hm = BORD * 2 + IMPASSE + (NY - 1) * PASY + IMPASSE;
  /* là où commence la forêt (Infinity : pas de forêt) ; sa lisière ondule un peu */
  var Yf = FORET ? ny(RANGS_VILLE - 1) + RUE / 2 + 10 : Infinity;
  function estForet(y){ return y > Yf; }
  /* le ruisseau de la forêt : il coupe tous les chemins qui descendent, entre deux rangées de la forêt */
  var jR = FORET ? RANGS_VILLE + Math.floor(Math.random() * 2) : -1;
  var ruisseau = FORET ? {y:(ny(jR) + ny(jR + 1)) / 2 + U.rand(-22, 22), a1:U.rand(14, 22), a2:U.rand(6, 10), p1:U.rand(0, TAU), p2:U.rand(0, TAU), l:9.5} : null;
  function yRuisseau(x){ return ruisseau.y + ruisseau.a1 * Math.sin(x / 97 + ruisseau.p1) + ruisseau.a2 * Math.sin(x / 41 + ruisseau.p2); }
  function dansRuisseau(x, y, m){ return !!ruisseau && Math.abs(y - yRuisseau(x)) < ruisseau.l + 3 + (m || 0); }
  var rues = [], i, j, k;
  for(i = 0; i < NX; i++) rues.push({x:nx(i) - RUE / 2, y:ny(0) - RUE / 2, w:RUE, h:(NY - 1) * PASY + RUE});
  for(j = 0; j < NY; j++) rues.push({x:Math.min(nx(0), nx(NX - 1)) - RUE / 2, y:ny(j) - RUE / 2, w:(NX - 1) * PASX + RUE, h:RUE});
  /* une impasse : depuis un point d'une rue (mx, my), dans la direction (dx, dy), sur IMPASSE */
  function impasse(mx, my, dx, dy, lg){
    lg = lg || IMPASSE;
    var r = dx ? {x:dx > 0 ? mx : mx - lg, y:my - RUE / 2, w:lg, h:RUE} : {x:mx - RUE / 2, y:dy > 0 ? my : my - lg, w:RUE, h:lg};
    r.imp = true; rues.push(r);
    return {mx:mx, my:my, dx:dx, dy:dy, fx:mx + dx * (lg - 26), fy:my + dy * (lg - 26), bx:mx + dx * lg, by:my + dy * lg, rect:r};
  }
  /* le départ : chez Odette (la ville) ou le pied du clocher (la forêt) — une impasse au-dessus du premier carrefour.
     (Les noms « odette » et « eglise » restent : le départ et l'arrivée ; dans la forêt, l'arrivée est le vieux puits.) */
  var odette = impasse(nx(0), ny(0) - RUE / 2, 0, -1);
  /* l'arrivée : au bout du quartier, à l'opposé — après le dernier carrefour, vers le bas ou vers le côté (tiré au hasard) ;
     dans la forêt, toujours tout en bas (le puits, dans sa clairière) */
  var eg = FORET ? U.choix([[NX - 1, NY - 1, 'bas'], [NX - 2, NY - 1, 'bas'], [Math.floor(NX / 2), NY - 1, 'bas']]) :
    U.choix([[NX - 1, NY - 1, 'bas'], [NX - 1, NY - 1, 'cote'], [NX - 1, NY - 2, 'cote'], [NX - 2, NY - 1, 'bas']]);
  var sx = miroir ? -1 : 1;
  var eglise = eg[2] === 'bas' ? impasse(nx(eg[0]), ny(eg[1]) + RUE / 2, 0, 1, IMPASSE + 14) : impasse(nx(eg[0]) + sx * RUE / 2, ny(eg[1]), sx, 0, IMPASSE + 14);
  eglise.noeud = [eg[0], eg[1]];
  var depart = {x:odette.fx, y:odette.fy + 30};

  /* ---- les arêtes où brancher une impasse (au milieu d'un bout de rue, vers l'intérieur d'un pâté de maisons) ---- */
  var libres = [];
  for(i = 0; i < NX - 1; i++) for(j = 0; j < NY; j++){
    if(j > 0) libres.push({a:[i, j], b:[i + 1, j], mx:(nx(i) + nx(i + 1)) / 2, my:ny(j) - RUE / 2, dx:0, dy:-1});
    if(j < NY - 1) libres.push({a:[i, j], b:[i + 1, j], mx:(nx(i) + nx(i + 1)) / 2, my:ny(j) + RUE / 2, dx:0, dy:1});
  }
  for(i = 0; i < NX; i++) for(j = 0; j < NY - 1; j++){
    var g0 = Math.min(nx(0), nx(NX - 1)), d0 = Math.max(nx(0), nx(NX - 1));
    if(nx(i) > g0) libres.push({a:[i, j], b:[i, j + 1], mx:nx(i) - RUE / 2, my:(ny(j) + ny(j + 1)) / 2, dx:-1, dy:0});
    if(nx(i) < d0) libres.push({a:[i, j], b:[i, j + 1], mx:nx(i) + RUE / 2, my:(ny(j) + ny(j + 1)) / 2, dx:1, dy:0});
  }
  function dist(n){ return n[0] + n[1]; }
  libres = U.melanger(libres);
  var prises = [];
  function loin(e){
    return prises.every(function(q){ return Math.hypot(q.mx + q.dx * IMPASSE - (e.mx + e.dx * IMPASSE), q.my + q.dy * IMPASSE - (e.my + e.dy * IMPASSE)) > RUE * 1.6; }) &&
      Math.hypot(eglise.bx - (e.mx + e.dx * IMPASSE), eglise.by - (e.my + e.dy * IMPASSE)) > RUE * 2.2;
  }
  /* ---- les chats de cette partie : Moustache, et les six autres (Romain, 15 novembre, 14 h 26 : « 7 sorties avec 7 chats ») ---- */
  var autres = U.melanger(CH.liste.filter(function(c){ return c.id !== 'moustache'; })).slice(0, p.faux == null ? 6 : p.faux);
  /* le ruisseau ne passe jamais dans une impasse */
  if(FORET) libres = libres.filter(function(L){ return !((L.dy === 1 && L.a[1] === jR) || (L.dy === -1 && L.a[1] === jR + 1) || (L.dx && L.a[1] === jR)); });
  var nomsV = U.melanger(LIEUX_VILLE.filter(function(k2){ return k2 !== 'voisin'; })), nomsF = U.melanger(LIEUX_FORET.slice());
  var couloirs = U.melanger(COULOIRS.slice());
  var pistes = [], fins = [], reserves = [];
  function chemin(n){
    var l = [], q; for(q = 0; q < n[0]; q++) l.push([1, 0]); for(q = 0; q < n[1]; q++) l.push([0, 1]);
    l = U.melanger(l);
    var c = [0, 0], r = [[0, 0]]; l.forEach(function(m){ c = [c[0] + m[0], c[1] + m[1]]; r.push(c); });
    return r;
  }
  function ligne(noeuds, o, vers, fin){
    var pts = [{x:odette.fx + o, y:odette.fy}], sens = 'v', q, a, b, s2;
    for(q = 0; q < noeuds.length - 1; q++){
      a = noeuds[q]; b = noeuds[q + 1]; s2 = a[0] !== b[0] ? 'h' : 'v';
      if(s2 !== sens){ pts.push({x:nx(a[0]) + o, y:ny(a[1]) + o}); sens = s2; }
    }
    var der = noeuds[noeuds.length - 1];
    var sImp = vers.dx ? 'h' : 'v';
    if(vers.noeud){ if(sImp !== sens) pts.push({x:nx(der[0]) + o, y:ny(der[1]) + o}); }
    else {
      var sRue = vers.dx ? 'v' : 'h';
      if(sRue !== sens){ pts.push({x:nx(der[0]) + o, y:ny(der[1]) + o}); sens = sRue; }
      pts.push(sRue === 'h' ? {x:vers.mx + o, y:ny(der[1]) + o} : {x:nx(der[0]) + o, y:vers.my + o});
    }
    pts.push(sImp === 'h' ? {x:fin.fx, y:fin.fy + o * .55} : {x:fin.fx + o * .55, y:fin.fy});
    return pts;
  }
  var oM = couloirs.pop();
  pistes.push({chat:'moustache', bon:true, pts:ligne(chemin(eglise.noeud), oM, eglise, eglise)});
  autres.forEach(function(c, n){
    var e = null, q, tour;
    /* deux tours : d'abord comme on voudrait (dans la forêt, les fausses pistes partent surtout dans les bois), puis sans être difficile */
    for(tour = 0; tour < 2 && !e; tour++) for(q = 0; q < libres.length && !e; q++){
      var L = libres[q], pres = Math.min(dist(L.a), dist(L.b)), finY = L.my + L.dy * IMPASSE;
      if(!loin(L)) continue;
      if(!tour && (n === 0 ? pres > 1 : pres < 1)) continue;
      if(!tour && FORET && n >= 2 && !estForet(finY - 30)) continue;
      e = L; libres.splice(q, 1);
    }
    if(!e) return;
    prises.push(e);
    var imp = impasse(e.mx, e.my, e.dx, e.dy);
    var auBois = FORET && estForet(imp.by - e.dy * 30);
    var lieu = auBois ? (nomsF.shift() || U.choix(LIEUX_FORET)) : n === 0 && !FORET ? 'voisin' : (nomsV.shift() || U.choix(LIEUX_VILLE));
    var dep = dist(e.a) <= dist(e.b) ? e.a : e.b;
    var o = couloirs.pop();
    pistes.push({chat:c.id, bon:false, lieu:lieu, pts:ligne(chemin(dep), o, e, imp)});
    /* le chat est assis tout au fond, tourné vers la rue : il appelle (ses traces y mènent) */
    fins.push({x:imp.fx, y:imp.fy, bx:imp.bx, by:imp.by, dx:e.dx, dy:e.dy, lieu:lieu, chat:c.id, e:e, rect:imp.rect, g:nouvelleGraine(), foret:auBois,
      cx:imp.bx - e.dx * 14, cy:imp.by - e.dy * 14});
    reserves.push({x:imp.bx + e.dx * 34 - 64, y:imp.by + e.dy * 34 - 64, w:128, h:128});
  });

  /* ---- la géométrie : où sont les rues, à quel bout de rue appartient un point ---- */
  var gx = [], gy = [];
  for(i = 0; i < NX; i++) gx.push(nx(i)); gx.sort(function(a, b){ return a - b; });
  for(j = 0; j < NY; j++) gy.push(ny(j));
  function dansRue(x, y){ for(var q = 0; q < rues.length; q++){ var r = rues[q]; if(x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h) return true; } return false; }
  /* 'h:i:j' : la rue j, entre les colonnes i et i+1 ; 'v:i:j' : la colonne i, entre les rues j et j+1 ; 'c:i:j' : un carrefour */
  function segment(x, y){
    var ci = -1, rj = -1, q;
    for(q = 0; q < gx.length; q++) if(Math.abs(x - gx[q]) <= RUE / 2) ci = q;
    for(q = 0; q < gy.length; q++) if(Math.abs(y - gy[q]) <= RUE / 2) rj = q;
    if(ci >= 0 && rj >= 0) return 'c:' + ci + ':' + rj;
    if(ci >= 0){ if(y < gy[0] || y > gy[gy.length - 1]) return null; for(q = 0; q < gy.length - 1; q++) if(y > gy[q] && y < gy[q + 1]) return 'v:' + ci + ':' + q; return null; }
    if(rj >= 0){ if(x < gx[0] || x > gx[gx.length - 1]) return null; for(q = 0; q < gx.length - 1; q++) if(x > gx[q] && x < gx[q + 1]) return 'h:' + q + ':' + rj; return null; }
    return null;
  }
  function geoSeg(key){
    var a = key.split(':'), t = a[0], ii = +a[1], jj = +a[2];
    if(t === 'h') return {sens:'h', a0:gx[ii] + RUE / 2, a1:gx[ii + 1] - RUE / 2, c:gy[jj]};
    return {sens:'v', a0:gy[jj] + RUE / 2, a1:gy[jj + 1] - RUE / 2, c:gx[ii]};
  }
  pistes.forEach(function(P){ P.lisse = arrondir(P.pts, 20); P.longueur = longueur(P.lisse); });
  var usage = {}, segImp = {};
  fins.forEach(function(F){ var key = segment(F.e.mx - F.e.dx * 6, F.e.my - F.e.dy * 6); if(key) segImp[key] = 1; });
  pistes.forEach(function(P, ip){ for(var s = 0; s < P.longueur; s += 8){ var q = point(P.lisse, s), key = segment(q.x, q.y); if(key && key.charAt(0) !== 'c') (usage[key] = usage[key] || {})[ip] = 1; } });
  function nbUsage(key){ return Object.keys(usage[key] || {}).length; }

  /* ---- les passages couverts : une maison bâtie par-dessus la rue, là où passent au moins deux pistes ---- */
  var arches = [], segArche = {};
  var candA = U.melanger(Object.keys(usage).filter(function(key){ return nbUsage(key) >= 2 && !segImp[key]; }));
  candA.sort(function(a, b){ return (usage[b][0] ? 1 : 0) - (usage[a][0] ? 1 : 0); });   /* le premier sur le chemin de Moustache */
  function surRuisseau(key){ return FORET && key.charAt(0) === 'v' && +key.split(':')[2] === jR; }
  for(i = 0; i < candA.length && arches.length < (p.arches || 0); i++){
    if(surRuisseau(candA[i])) continue;
    /* (pas au milieu du bout de rue : vers un bout, pour laisser à l'autre bout la place d'une flaque) */
    var key = candA[i], g = geoSeg(key), La = U.rand(56, 70), mid = Math.random() < .5 ? g.a0 + La / 2 + 16 : g.a1 - La / 2 - 16, A;
    A = g.sens === 'h' ? {x:mid - La / 2, y:g.c - RUE / 2, w:La, h:RUE} : {x:g.c - RUE / 2, y:mid - La / 2, w:RUE, h:La};
    A.sens = g.sens; A.k = key; A.g = nouvelleGraine(); A.cx = A.x + A.w / 2; A.cy = A.y + A.h / 2;
    A.bat = g.sens === 'h' ? {x:A.x - 4, y:A.y - 34, w:A.w + 8, h:A.h + 68} : {x:A.x - 34, y:A.y - 4, w:A.w + 68, h:A.h + 8};
    /* dans la forêt, le passage couvert est une voûte de branches : un grand chêne penché par-dessus le chemin */
    A.foret = estForet(A.cy - 40);
    if(A.foret) A.bat = g.sens === 'h' ? {x:A.x - 10, y:A.y - 30, w:A.w + 20, h:A.h + 60} : {x:A.x - 30, y:A.y - 10, w:A.w + 60, h:A.h + 20};
    if(A.foret !== estForet(A.cy + 40)) continue;   /* (pas sur la lisière) */
    if(arches.some(function(B){ return Math.hypot(B.cx - A.cx, B.cy - A.cy) < 300; })) continue;
    arches.push(A); segArche[key] = 1;
  }
  function dansArche(x, y, m){ for(var q = 0; q < arches.length; q++) if(dans(arches[q], x, y, m || 0)) return arches[q]; return null; }

  /* ---- les obstacles par-dessus lesquels les chats sautent : collés à un mur, ils coupent une partie de la rue ---- */
  var obstacles = [], segOb = {};
  function latPiste(P, G, along){
    for(var s = 0; s < P.longueur; s += 2.5){ var q = point(P.lisse, s), a = G.sens === 'h' ? q.x : q.y, l = G.sens === 'h' ? q.y - G.c : q.x - G.c;
      if(Math.abs(a - along) < 2 && Math.abs(l) < RUE / 2 && segment(q.x, q.y) === G.key) return l; }
    return null;
  }
  var TYPES_OB = ['caisses', 'tonneaux', 'charrette', 'sacs', 'bois', 'paniers'], TYPES_OB_F = ['tronc', 'rochers', 'souche', 'branches'];
  var ordreP = [0].concat(U.melanger(pistes.map(function(P, ip){ return ip; }).slice(1))), io = 0;
  for(var essai = 0; essai < 80 && obstacles.length < (p.sauts || 0); essai++){
    var ip = ordreP[io++ % ordreP.length], P = pistes[ip];
    var ks = Object.keys(usage).filter(function(key2){ return usage[key2][ip] && !segArche[key2] && !segOb[key2] && !surRuisseau(key2); });
    if(!ks.length) continue;
    var k2 = U.choix(ks), g2 = geoSeg(k2), u = Math.random() < .5 ? U.rand(.2, .3) : U.rand(.7, .8), along = g2.a0 + (g2.a1 - g2.a0) * u;
    g2.key = k2;
    var lat = latPiste(P, g2, along); if(lat == null) continue;
    var Lo = U.rand(22, 30), cote = lat < -3 ? -1 : lat > 3 ? 1 : (Math.random() < .5 ? -1 : 1), a0, a1;
    if(cote < 0){ a0 = -RUE / 2; a1 = lat + U.rand(8, 11); } else { a0 = lat - U.rand(8, 11); a1 = RUE / 2; }
    if(a1 - a0 < 18){ if(cote < 0) a1 = a0 + 18; else a0 = a1 - 18; }
    if(a1 - a0 > 50) continue;
    var O = g2.sens === 'h' ? {x:along - Lo / 2, y:g2.c + a0, w:Lo, h:a1 - a0} : {x:g2.c + a0, y:along - Lo / 2, w:a1 - a0, h:Lo};
    if(Math.hypot(O.x + O.w / 2 - depart.x, O.y + O.h / 2 - depart.y) < 170) continue;
    O.sens = g2.sens; O.cote = cote; O.type = U.choix(estForet(O.y + O.h / 2) ? TYPES_OB_F : TYPES_OB); O.g = nouvelleGraine(); O.k = k2;
    O.haut = O.type === 'charrette' ? 12 : O.type === 'bois' || O.type === 'sacs' || O.type === 'branches' ? 7 : O.type === 'tronc' ? 9 : 10;
    obstacles.push(O); segOb[k2] = 1;
  }
  function dansObstacle(x, y, m){ for(var q = 0; q < obstacles.length; q++) if(dans(obstacles[q], x, y, m || 0)) return obstacles[q]; return null; }

  /* ---- les flaques, la boue, la farine : EN TRAVERS de la rue, d'un mur à l'autre (Romain, 14 h 26 : « qu'on ne puisse pas les
     éviter »), dans une bonne part des bouts de rue (p.taux) ; sur la piste de Moustache, jamais plus de p.ecart sans en croiser une ;
     dans la forêt, le ruisseau coupe chaque chemin qui descend (un gué). Une seule par bout de rue (deux pour le ruisseau). ---- */
  var taches = [], segTache = {};
  function nouvelleTache(type, cx, cy, rx, ry, rot){
    var m = [], v = 1; for(var q = 0; q < 14; q++){ v = U.borne(v + U.rand(-.14, .14), .78, 1.16); m.push(v); }
    m[13] = (m[12] + m[0]) / 2;
    var T = {type:type, x:cx, y:cy, rx:rx, ry:ry, rot:rot, m:m, g:nouvelleGraine(), travers:true, foret:estForet(cy)};
    taches.push(T); return T;
  }
  function typeTache(cy){ var r = Math.random(); return estForet(cy) ? (r < .48 ? 'boue' : 'flaque') : (r < (p.boue == null ? .32 : p.boue) ? 'boue' : 'flaque'); }
  /* une tache en travers du bout de rue « key » ; al : où, le long de la rue (sinon au hasard) */
  /* une tache de demi-longueur rx peut-elle aller en a (le long du bout de rue « key ») ? */
  function tacheIci(key, a, rx){
    var g = geoSeg(key);
    if(a < g.a0 + rx + 18 || a > g.a1 - rx - 18) return null;
    var cx = g.sens === 'h' ? a : g.c, cy = g.sens === 'h' ? g.c : a;
    var bb = g.sens === 'h' ? {x:cx - rx - 4, y:g.c - RUE / 2, w:rx * 2 + 8, h:RUE} : {x:g.c - RUE / 2, y:cy - rx - 4, w:RUE, h:rx * 2 + 8};
    if(Math.hypot(cx - depart.x, cy - depart.y) < 70) return null;
    if(arches.some(function(A2){ return croise(A2, bb, 12); }) || obstacles.some(function(O2){ return croise(O2, bb, 16); })) return null;
    if(taches.some(function(T){ return Math.hypot(T.x - cx, T.y - cy) < Math.min(T.rx, 30) + rx + 46; })) return null;
    if(dansRuisseau(cx, cy, rx + 30)) return null;
    return {g:g, cx:cx, cy:cy};
  }
  /* poser une tache en travers du bout de rue « key » ; al : où, le long de la rue (sinon au hasard) ; rxFixe : sa demi-longueur */
  function poserTacheSeg(key, type, al, rxFixe){
    var g = geoSeg(key), len = g.a1 - g.a0;
    type = type || typeTache(g.sens === 'h' ? g.c : (g.a0 + g.a1) / 2);
    var rx = rxFixe || (type === 'boue' ? U.rand(15, 21) : type === 'farine' ? U.rand(13, 16) : U.rand(15, 24));
    if(len < rx * 2 + 44) return null;
    for(var e3 = 0; e3 < (al != null ? 1 : 14); e3++){
      var ici = tacheIci(key, al != null ? al : U.rand(g.a0 + rx + 18, g.a1 - rx - 18), rx); if(!ici) continue;
      /* ry : d'un mur à l'autre, même là où le bord de la tache rentre un peu (0,78 × 0,93 × 0,76 × RUE > RUE / 2) */
      var T = nouvelleTache(type, ici.cx, ici.cy, rx, RUE * U.rand(.76, .82), (g.sens === 'h' ? 0 : PI / 2) + U.rand(-.1, .1));
      T.k = key; segTache[key] = (segTache[key] || 0) + 1;
      return T;
    }
    return null;
  }
  var segs = [];
  for(i = 0; i < NX - 1; i++) for(j = 0; j < NY; j++) segs.push('h:' + i + ':' + j);
  for(i = 0; i < NX; i++) for(j = 0; j < NY - 1; j++) segs.push('v:' + i + ':' + j);
  /* le ruisseau, d'abord : un gué sur chaque chemin qui descend */
  if(FORET) for(i = 0; i < NX; i++){
    var kR = 'v:' + i + ':' + jR, yR = yRuisseau(gx[i]), pente = ruisseau.a1 / 97 * Math.cos(gx[i] / 97 + ruisseau.p1) + ruisseau.a2 / 41 * Math.cos(gx[i] / 41 + ruisseau.p2);
    var TR = nouvelleTache('ruisseau', gx[i], yR, ruisseau.l + 2, RUE * .8, PI / 2 + Math.atan(pente));
    TR.m = TR.m.map(function(){ return 1; }); TR.k = kR; segTache[kR] = 2;
  }
  /* la farine (la ville) : devant la boulangerie, sur le dernier bout de rue de sa fausse piste */
  if(!FORET) pistes.forEach(function(P2){
    if(P2.lieu !== 'boulangerie') return;
    for(var s4 = P2.longueur - 140; s4 > 0; s4 -= 20){ var q4 = point(P2.lisse, s4), k4 = segment(q4.x, q4.y); if(k4 && k4.charAt(0) !== 'c' && !segTache[k4]){ poserTacheSeg(k4, 'farine'); break; } }
  });
  /* sur la piste de Moustache, d'abord : jamais plus de p.ecart sans une tache. On note tous les endroits de sa piste où une tache
     pourrait aller ; puis, depuis le départ (le lait), on prend chaque fois le plus lointain qui reste dans la limite (s'il n'y en a
     pas, le plus proche après). Les taches déjà là (le gué du ruisseau, la farine) comptent. */
  (function(){
    var P0 = pistes[0], E = p.ecart || 380, L0 = P0.longueur, RX = 16, possibles = [], s5, q5;
    for(s5 = 0; s5 < L0 - 140; s5 += 8){
      q5 = point(P0.lisse, s5); var k5 = segment(q5.x, q5.y); if(!k5 || k5.charAt(0) === 'c') continue;
      var g5 = geoSeg(k5), a5 = g5.sens === 'h' ? q5.x : q5.y;
      if(tacheIci(k5, a5, RX)) possibles.push({s:s5, k:k5, a:a5});
    }
    function sortie(s){ while(s < L0){ var q = point(P0.lisse, s); if(!dansTache(q.x, q.y, 0)) return s; s += 4; } return s; }
    var dern = 0, garde = 0;
    while(dern + E < L0 - 140 && garde++ < 40){
      var lim = dern + E, deja = -1;
      for(s5 = dern + 6; s5 <= lim; s5 += 5){ q5 = point(P0.lisse, s5); if(dansTache(q5.x, q5.y, 0)) deja = s5; }
      if(deja >= 0){ dern = sortie(deja); continue; }
      var choix = null;
      possibles.forEach(function(c){ if(c.s > dern + RX + 30 && c.s <= lim + RX - 6 && (!choix || c.s > choix.s) && tacheIci(c.k, c.a, RX)) choix = c; });
      if(!choix) possibles.forEach(function(c){ if(c.s > lim && (!choix || c.s < choix.s) && tacheIci(c.k, c.a, RX)) choix = c; });
      if(!choix || !poserTacheSeg(choix.k, null, choix.a, RX)) break;
      dern = sortie(choix.s);
    }
  })();
  U.melanger(segs).forEach(function(key){ if(!segTache[key] && Math.random() < (p.taux == null ? .65 : p.taux)) poserTacheSeg(key); });
  /* et dans la forêt, une flaque sous la gouttière du clocher, juste devant le départ : tous les chats y ont marché */
  if(FORET){ var Tg = nouvelleTache('flaque', odette.mx, odette.my - 30, 14, RUE * .8, PI / 2); Tg.depart = true; }
  function dansTache(x, y, m){
    m = m || 0;
    for(var q = 0; q < taches.length; q++){
      var T = taches[q], dx = x - T.x, dy = y - T.y, e = Math.max(T.rx, T.ry) * 1.2 + m;
      if(Math.abs(dx) > e || Math.abs(dy) > e) continue;
      if(dansForme(T, x, y, m)) return T;
    }
    return null;
  }

  /* ---- on doit toujours pouvoir aller au bout de chaque piste : sinon, on retire le dernier obstacle posé ---- */
  function libreM(x, y){ return dansRue(x - 9, y) && dansRue(x + 9, y) && dansRue(x, y - 9) && dansRue(x, y + 9) && !dansObstacle(x, y, 9); }
  function joignable(){
    var G = 8, cw = Math.ceil(Wm / G) + 2, chh = Math.ceil(Hm / G) + 2, vu = new Uint8Array(cw * chh), f = [];
    var a = Math.round(depart.x / G), b = Math.round(depart.y / G);
    if(!libreM(a * G, b * G)) return true;
    vu[b * cw + a] = 1; f.push(b * cw + a);
    while(f.length){
      var c = f.pop(), cx = c % cw, cy = (c - cx) / cw;
      for(var d = 0; d < 4; d++){
        var ax = cx + (d === 0 ? 1 : d === 1 ? -1 : 0), ay = cy + (d === 2 ? 1 : d === 3 ? -1 : 0);
        if(ax < 0 || ay < 0 || ax >= cw || ay >= chh) continue;
        var id = ay * cw + ax; if(vu[id]) continue;
        if(libreM(ax * G, ay * G)){ vu[id] = 1; f.push(id); }
      }
    }
    function ok(x, y){ var X = Math.round(x / G), Y = Math.round(y / G); for(var u2 = -1; u2 <= 1; u2++) for(var v2 = -1; v2 <= 1; v2++){ if(vu[(Y + v2) * cw + X + u2]) return true; } return false; }
    return fins.every(function(F){ return ok(F.x, F.y); }) && ok(eglise.fx, eglise.fy);
  }
  while(obstacles.length && !joignable()){ var Ob = obstacles.pop(); delete segOb[Ob.k]; }

  /* ==== les traces : on suit chaque ligne ; une patte à gauche, une à droite ; le lait pâlit ; une flaque, la boue, la farine
     changent ce que le chat a sous les pattes ; sous un passage couvert, rien ; par-dessus un obstacle, il saute ==== */
  var traces = [], CASE = 220, cases = {};
  function poser(t){ traces.push(t); var cle = Math.floor(t.x / CASE) + ':' + Math.floor(t.y / CASE); (cases[cle] = cases[cle] || []).push(t); }
  /* effacer : les traces sous les pattes d'un chat qui passe en courant (sauf les siennes) ; rend combien */
  function effacer(x, y, r, sauf){
    var n = 0, a0 = Math.floor((x - r) / CASE), a1 = Math.floor((x + r) / CASE), b0 = Math.floor((y - r) / CASE), b1 = Math.floor((y + r) / CASE);
    for(var a = a0; a <= a1; a++) for(var b = b0; b <= b1; b++){
      var l = cases[a + ':' + b]; if(!l) continue;
      for(var k = 0; k < l.length; k++){ var T = l[k]; if(T.ef || (sauf && T.own === sauf)) continue; if(Math.abs(T.x - x) < r && Math.abs(T.y - y) < r && Math.hypot(T.x - x, T.y - y) < r){ T.ef = 1; n++; } }
    }
    return n;
  }
  var V = p.vue || {lait:280, eau:200, boue:280, farine:240}, trouMax = p.trou || 0;
  pistes.forEach(function(P){
    /* chez Odette, les pattes pleines de lait ; au pied du clocher, encore sèches (la flaque de la gouttière est juste devant) */
    var pts = P.lisse, L = P.longueur, s = 14, nP = 0, sub = FORET ? 'sec' : 'lait', d = 0, enSaut = false;
    var pk = CH.par[P.chat].trace.k < .8 ? .8 : 1;
    function une(q, cote, ecart, dec){
      var al = force(sub, d, V); if(al < SEUIL) return;
      var x = q.x + Math.cos(q.a + PI / 2) * ecart * cote + Math.cos(q.a) * (dec || 0) + U.rand(-.9, .9);
      var y = q.y + Math.sin(q.a + PI / 2) * ecart * cote + Math.sin(q.a) * (dec || 0) + U.rand(-.9, .9);
      if(!dansRue(x, y) || dansObstacle(x, y, 3) || dansArche(x, y, 1) || dansTache(x, y, 1)) return;
      poser({x:x, y:y, a:q.a + PI / 2 + U.rand(-.12, .12), c:P.chat, sub:sub, al:al, k:U.rand(.94, 1.06), g:nouvelleGraine()});
    }
    function serrees(q, quatre){   /* l'appel (deux pattes serrées) ou la réception (quatre) d'un saut */
      une(q, -1, 2.6, 0); une(q, 1, 2.6, 0);
      if(quatre){ une(q, -1, 3.2, 8.5); une(q, 1, 3.2, 8.5); }
    }
    while(s < L - 6){
      var q = point(pts, s), cote = nP % 2 ? 1 : -1, pas = PAS_CHAT * pk * U.rand(.93, 1.07);
      if(dansArche(q.x, q.y, 3)){ s += pas; d += pas; nP++; continue; }          /* sous le passage couvert : rien */
      var ob = dansObstacle(q.x, q.y, 8);
      if(ob){
        if(!enSaut){   /* l'appel : on recule jusqu'à être devant l'obstacle, et là, deux pattes serrées */
          enSaut = true; var sb = s, qb = q;
          while(sb > 0 && dansObstacle(qb.x, qb.y, 9)){ sb -= 2; qb = point(pts, sb); }
          serrees(qb, false);
        }
        s += pas * .6; d += pas * .6; continue;
      }
      if(enSaut){ enSaut = false; serrees(q, true); s += pas * 1.4; d += pas * 1.4; nP += 2; continue; }
      var ta = dansTache(q.x, q.y, 1);
      if(ta){ sub = DE_TACHE[ta.type]; d = 0; s += pas; nP++; continue; }    /* dans la flaque, la boue, la farine : on ne voit plus rien */
      var fo = force(sub, d, V);
      if(fo >= SEUIL && Math.random() >= trouMax * (1 - fo)) une(q, cote, 3.4, 0);
      s += pas; d += pas; nP++;
    }
  });

  /* ==== le décor : les pâtés de maisons, et tout autour des bandes de jardins ==== */
  var eviteRues = rues.map(function(r){ return {x:r.x - 4, y:r.y - 4, w:r.w + 8, h:r.h + 8}; }), eviteAutres = reserves.slice();
  /* la ville : chez Odette au départ, l'église à l'arrivée ; la forêt : l'église (le clocher) au départ, la clairière du puits à l'arrivée */
  var egBoite = FORET ? boitePuits(eglise) : boiteEglise(eglise), departBoite = FORET ? boiteEglise(odette) : {x:odette.bx - 66, y:odette.by - 64, w:132, h:68};
  eviteAutres.push(departBoite); eviteAutres.push(egBoite);
  arches.forEach(function(A2){ eviteAutres.push(A2.bat); });
  /* le ruisseau : une file de petites boîtes, pour que rien ne pousse dans l'eau */
  if(FORET) for(var xr = -MARGE; xr < Wm + MARGE; xr += 14){ var yr = yRuisseau(xr); eviteAutres.push({x:xr - 7, y:yr - ruisseau.l - 3, w:14, h:ruisseau.l * 2 + 6, eau:true}); }
  /* les lanternes, au coin des carrefours (dans le village seulement) */
  var lampes = [];
  for(i = 0; i < NX; i++) for(j = 0; j < NY; j++){
    if(estForet(gy[j] - RUE)) continue;
    var coins = U.melanger([[-1, -1], [1, -1], [-1, 1], [1, 1]]).slice(0, Math.random() < .35 ? 2 : 1);
    coins.forEach(function(cn){
      var lx = gx[i] + cn[0] * (RUE / 2 + 5.5), ly = gy[j] + cn[1] * (RUE / 2 + 5.5), bb = {x:lx - 6, y:ly - 6, w:12, h:12};
      if(dansRue(lx, ly) || reserves.some(function(r){ return croise(r, bb); }) || croise(egBoite, bb) || arches.some(function(A3){ return croise(A3.bat, bb); })) return;
      lampes.push({x:lx, y:ly, lx:gx[i] + cn[0] * 30, ly:gy[j] + cn[1] * 30});
      eviteAutres.push(bb);
    });
  }
  /* les arbres qui débordent sur la rue (dessinés au-dessus du Pisteur : ils cachent les traces dessous) */
  var dessus = [], segsF = segs.filter(function(k6){ var g6 = geoSeg(k6); return estForet((g6.sens === 'h' ? g6.c : g6.a0) - 20); });
  var nDessus = (p.branches || 2) + (FORET ? 7 : 0);
  for(var e5 = 0; e5 < 90 && dessus.length < nDessus; e5++){
    var kb = FORET && dessus.length >= (p.branches || 2) && segsF.length ? U.choix(segsF) : U.choix(Object.keys(usage)); if(segArche[kb]) continue;
    var gb = geoSeg(kb), ub = U.rand(.25, .75), alb = gb.a0 + (gb.a1 - gb.a0) * ub, cb = Math.random() < .5 ? -1 : 1, rb = U.rand(22, 28);
    var tx = gb.sens === 'h' ? alb : gb.c + cb * (RUE / 2 + 9), ty = gb.sens === 'h' ? gb.c + cb * (RUE / 2 + 9) : alb;
    var bbt = {x:tx - 10, y:ty - 10, w:20, h:20}, auBois2 = estForet(ty);
    if(auBois2) rb = U.rand(25, 32);
    if(eviteAutres.some(function(r){ return croise(r, bbt); }) || rues.some(function(r){ return croise(r, {x:tx - 6, y:ty - 6, w:12, h:12}); })) continue;
    if(dessus.some(function(d){ return Math.hypot(d.x - tx, d.y - ty) < (auBois2 ? 120 : 160); }) || Math.hypot(tx - depart.x, ty - depart.y) < 150) continue;
    if(obstacles.some(function(O3){ return Math.hypot(O3.x + O3.w / 2 - tx, O3.y + O3.h / 2 - ty) < 50; })) continue;
    dessus.push({x:tx, y:ty, r:rb, g:nouvelleGraine(), sorte:auBois2 ? U.choix(['chene', 'hetre', 'chene']) : 'feuillu', haut:26});
    eviteAutres.push({x:tx - 12, y:ty - 12, w:24, h:24});
  }
  var evite = eviteRues.concat(eviteAutres);
  /* les cellules : entre les rues, et les quatre bandes du bord (coupées en morceaux) */
  var cellules = [];
  function couper(c, L2){
    var l = [], n, q;
    if(c.w >= c.h){ n = Math.max(1, Math.round(c.w / L2)); for(q = 0; q < n; q++) l.push({x:c.x + c.w * q / n, y:c.y, w:c.w / n, h:c.h, bord:true}); }
    else { n = Math.max(1, Math.round(c.h / L2)); for(q = 0; q < n; q++) l.push({x:c.x, y:c.y + c.h * q / n, w:c.w, h:c.h / n, bord:true}); }
    return l;
  }
  for(i = 0; i < NX - 1; i++) for(j = 0; j < NY - 1; j++) cellules.push({x:gx[i] + RUE / 2, y:gy[j] + RUE / 2, w:gx[i + 1] - gx[i] - RUE, h:gy[j + 1] - gy[j] - RUE});
  var hautG = gy[0] - RUE / 2, basG = gy[NY - 1] + RUE / 2, gaucheG = gx[0] - RUE / 2, droiteG = gx[NX - 1] + RUE / 2;
  /* (la forêt : les bandes des côtés sont coupées à la lisière — le haut est au village, le bas dans les bois) */
  function aLisiere(R){ if(!FORET || R.y >= Yf || R.y + R.h <= Yf) return [R]; return [{x:R.x, y:R.y, w:R.w, h:Yf - R.y}, {x:R.x, y:Yf, w:R.w, h:R.y + R.h - Yf}]; }
  [{x:-MARGE, y:-MARGE, w:Wm + 2 * MARGE, h:hautG + MARGE}, {x:-MARGE, y:basG, w:Wm + 2 * MARGE, h:Hm + MARGE - basG},
    {x:-MARGE, y:hautG, w:gaucheG + MARGE, h:basG - hautG}, {x:droiteG, y:hautG, w:Wm + MARGE - droiteG, h:basG - hautG}].forEach(function(R){
    aLisiere(R).forEach(function(R2){ couper(R2, 300).forEach(function(c){ cellules.push(c); }); });
  });
  cellules.forEach(function(c){ c.foret = estForet(c.y + c.h / 2); });
  var maisons = [], arbres = [], objets = [], sols = [], bords = [], fenetres = [];
  /* d'abord, des maisons le long des impasses (les voisins d'Odette, les maisons près de l'église, celles des fausses pistes) */
  rues.forEach(function(r){
    if(!r.imp || estForet(r.y + r.h / 2)) return;
    var vert = r.h > r.w, len = vert ? r.h : r.w;
    [-1, 1].forEach(function(cote){
      var t = 2;
      while(t < len - 18){
        var w = U.rand(26, 40), d = U.rand(30, 40);
        if(t + w > len + 6) break;
        var R1 = vert ? {x:cote < 0 ? r.x - 5.5 - d : r.x + r.w + 5.5, y:r.y + t, w:d, h:w} : {x:r.x + t, y:cote < 0 ? r.y - 5.5 - d : r.y + r.h + 5.5, w:w, h:d};
        var dv = vert ? {x:cote < 0 ? r.x + 8 : r.x + r.w - 8, y:R1.y + w / 2} : {x:R1.x + w / 2, y:cote < 0 ? r.y + 8 : r.y + r.h - 8};
        if(!evite.some(function(q){ return croise(R1, q, 1); })){ maisons.push(maisonDe(R1, vert ? 'v' : 'h', dv)); evite.push(R1); }
        t += w + U.rand(0, 2.5);
      }
    });
  });
  cellules.forEach(function(c){ if(c.foret) decorForet(c, evite, dansRue, arbres, objets, sols, estForet); else decorCellule(c, evite, dansRue, maisons, arbres, objets, sols, bords); });
  /* la lisière : une haie de buissons tout le long, côté village (là où la forêt commence) */
  if(FORET) for(var xl = -MARGE + 10; xl < Wm + MARGE; xl += U.rand(16, 26)){
    var yl = Yf + 8 + U.rand(-4, 6), bl = {x:xl - 8, y:yl - 8, w:16, h:16};
    if(evite.some(function(q){ return croise(bl, q, 1); })) continue;
    arbres.push({x:xl, y:yl, r:U.rand(8, 12), sorte:'buisson', g:nouvelleGraine(), haut:7, baies:Math.random() < .3 ? '#c8304a' : null});
  }
  /* quelques fenêtres allumées la nuit (la lumière tombe dans la rue, devant la maison) */
  maisons.forEach(function(m){ if(m.devant && Math.random() < .24) fenetres.push({x:m.devant.x, y:m.devant.y}); });
  /* deux chats endormis sur des toits (ce ne sont pas ceux d'Odette) */
  U.melanger(maisons.filter(function(m){ return m.w > 30 && m.h > 30; })).slice(0, 2).forEach(function(m){ m.chat = {u:U.rand(.25, .75), v:U.rand(.25, .75), c:U.choix(['#e0a050', '#3a3038', '#f0ece2']), a:U.rand(0, TAU)}; });
  /* du linge, tendu d'un côté de la rue à l'autre */
  var linges = [];
  for(var e6 = 0; e6 < 40 && linges.length < 3; e6++){
    var kl = U.choix(Object.keys(usage).concat(Object.keys(usage))); if(segArche[kl]) continue;
    var gl = geoSeg(kl), al2 = gl.a0 + (gl.a1 - gl.a0) * U.rand(.35, .65);
    if(estForet((gl.sens === 'h' ? gl.c : al2) - RUE)) continue;   /* (pas de linge dans les bois) */
    if(linges.some(function(Lg){ return Math.hypot(Lg.cx - (gl.sens === 'h' ? al2 : gl.c), Lg.cy - (gl.sens === 'h' ? gl.c : al2)) < 250; })) continue;
    var habits = [], nh = 3 + Math.floor(Math.random() * 3), COUL = ['#e8e2d4', '#c94b4b', '#4f7ec4', '#e3b84a', '#7ab06a', '#d87aa8', '#f4f0e6'];
    for(var q4 = 0; q4 < nh; q4++) habits.push({u:(q4 + .5) / nh + U.rand(-.04, .04), w:U.rand(6, 10), h:U.rand(7, 13), c:U.choix(COUL), f:U.choix(['drap', 'chemise', 'chaussette', 'drap']), ph:U.rand(0, TAU)});
    linges.push(gl.sens === 'h' ? {x1:al2, y1:gl.c - RUE / 2 - 4, x2:al2, y2:gl.c + RUE / 2 + 4, cx:al2, cy:gl.c, habits:habits} : {x1:gl.c - RUE / 2 - 4, y1:al2, x2:gl.c + RUE / 2 + 4, y2:al2, cx:gl.c, cy:al2, habits:habits});
  }
  /* les pigeons, par petits groupes, dans les rues */
  var pigeons = [];
  for(var e7 = 0; e7 < 40 && pigeons.length < 14; e7++){
    var rp = U.choix(rues.filter(function(r){ return !r.imp; })), pxp = U.rand(rp.x + 14, rp.x + rp.w - 14), pyp = U.rand(rp.y + 14, rp.y + rp.h - 14);
    if(Math.hypot(pxp - depart.x, pyp - depart.y) < 200 || dansTache(pxp, pyp, 10) || dansObstacle(pxp, pyp, 14) || dansArche(pxp, pyp, 10) || estForet(pyp - 30)) continue;
    if(pigeons.some(function(pp){ return Math.hypot(pp.x - pxp, pp.y - pyp) < 180; })) continue;
    var n3 = 3 + Math.floor(Math.random() * 3);
    for(var q5 = 0; q5 < n3; q5++){ var xx = pxp + U.rand(-13, 13), yy = pyp + U.rand(-10, 10); if(dansRue(xx, yy)) pigeons.push({x:xx, y:yy, x0:xx, y0:yy, a:U.rand(0, TAU), ph:U.rand(0, 10), vol:0, tv:0, vx:0, vy:0}); }
  }
  /* la nuit, dans les bois : des lucioles */
  var lucioles = [];
  if(FORET) for(var e8 = 0; e8 < 200 && lucioles.length < 70; e8++){
    var lx2 = U.rand(-MARGE + 40, Wm + MARGE - 40), ly2 = U.rand(Yf + 40, Hm + MARGE - 40);
    lucioles.push({x:lx2, y:ly2, ph:U.rand(0, TAU), v:U.rand(.6, 1.4), r:U.rand(10, 22)});
  }
  return {W:Wm, H:Hm, rues:rues, odette:odette, eglise:eglise, pistes:pistes, fins:fins, traces:traces, cases:cases, CASE:CASE, miroir:miroir,
    depart:depart, gx:gx, gy:gy, arches:arches, obstacles:obstacles, taches:taches, lampes:lampes, dessus:dessus, cellules:cellules,
    maisons:maisons, arbres:arbres, objets:objets, sols:sols, bords:bords, fenetres:fenetres, linges:linges, pigeons:pigeons,
    dansRue:dansRue, dansArche:dansArche, dansObstacle:dansObstacle, dansTache:dansTache, segment:segment, egBoite:egBoite, departBoite:departBoite,
    poser:poser, effacer:effacer, vue:V, foret:FORET, Yf:Yf, estForet:estForet, ruisseau:ruisseau, yRuisseau:FORET ? yRuisseau : null, lucioles:lucioles};
}
/* la clairière du puits (la forêt), dans le repère du monde : (0, -40) est le puits, au-delà du bout du chemin */
function boitePuits(E){
  var r = Math.atan2(E.dy, E.dx) + PI / 2, c = Math.cos(r), s = Math.sin(r), xs = [], ys = [];
  [[-96, -136], [96, -136], [96, 8], [-96, 8]].forEach(function(q){ xs.push(E.bx + q[0] * c - q[1] * s); ys.push(E.by + q[0] * s + q[1] * c); });
  var x0 = Math.min.apply(null, xs), y0 = Math.min.apply(null, ys);
  return {x:x0, y:y0, w:Math.max.apply(null, xs) - x0, h:Math.max.apply(null, ys) - y0};
}
/* la place que prend l'église (et son cimetière), dans le repère du monde */
function boiteEglise(E){
  var r = Math.atan2(E.dy, E.dx) + PI / 2, c = Math.cos(r), s = Math.sin(r), xs = [], ys = [];
  [[-118, -250], [118, -250], [118, 6], [-118, 6]].forEach(function(q){ xs.push(E.bx + q[0] * c - q[1] * s); ys.push(E.by + q[0] * s + q[1] * c); });
  var x0 = Math.min.apply(null, xs), y0 = Math.min.apply(null, ys);
  return {x:x0, y:y0, w:Math.max.apply(null, xs) - x0, h:Math.max.apply(null, ys) - y0};
}
/* la forme d'une flaque (une tache irrégulière) : est-ce qu'un point est dedans ? */
function dansForme(T, x, y, m){
  var c = Math.cos(-T.rot), s = Math.sin(-T.rot), dx = x - T.x, dy = y - T.y, lx = dx * c - dy * s, ly = dx * s + dy * c;
  var a = Math.atan2(ly / T.ry, lx / T.rx), N = T.m.length, f = ((a / TAU * N) % N + N) % N, i0 = Math.floor(f), t = f - i0;
  var r = (T.m[i0] * (1 - t) + T.m[(i0 + 1) % N] * t) * .93;
  return Math.hypot(lx / (T.rx + (m || 0)), ly / (T.ry + (m || 0))) <= r;
}
function cheminForme(x, T, gonfle){
  var N = T.m.length, P = [], g = gonfle || 0;
  for(var i = 0; i < N; i++){ var a = TAU * i / N, px = Math.cos(a) * (T.rx + g) * T.m[i], py = Math.sin(a) * (T.ry + g) * T.m[i];
    P.push([T.x + px * Math.cos(T.rot) - py * Math.sin(T.rot), T.y + px * Math.sin(T.rot) + py * Math.cos(T.rot)]); }
  x.beginPath(); x.moveTo((P[N - 1][0] + P[0][0]) / 2, (P[N - 1][1] + P[0][1]) / 2);
  for(i = 0; i < N; i++){ var b = P[(i + 1) % N]; x.quadraticCurveTo(P[i][0], P[i][1], (P[i][0] + b[0]) / 2, (P[i][1] + b[1]) / 2); }
  x.closePath();
}
/* le décor d'une cellule : des maisons serrées le long des rues, et derrière, une cour ou un jardin */
var TUILES = ['#c4583f', '#b8643a', '#a9503a', '#c86f45', '#9c4836', '#b5573f', '#cf7a4c', '#bb6646'];
var ARDOISES = ['#5d6b8c', '#66748f', '#56627c', '#6f7d96'];
function maisonDe(r, sens, devant){
  var ard = Math.random() < .24;
  var m = {x:r.x, y:r.y, w:r.w, h:r.h, sens:sens, c:U.choix(ard ? ARDOISES : TUILES), toit:ard ? 'ardoise' : 'tuile', haut:U.rand(12, 20), g:nouvelleGraine(),
    chem:[], lucarne:Math.random() < .35, fum:Math.random() < .4, devant:devant};
  var nc = Math.random() < .3 ? 2 : 1;
  for(var q = 0; q < nc; q++) m.chem.push(sens === 'h' ? {u:U.rand(.15, .85), v:Math.random() < .5 ? .3 : .7} : {u:Math.random() < .5 ? .3 : .7, v:U.rand(.15, .85)});
  return m;
}
function decorCellule(c, evite, dansRue, maisons, arbres, objets, sols, bords){
  c.sol = c.bord ? (Math.random() < .7 ? 'jardin' : 'cour') : (Math.random() < .5 ? 'jardin' : 'cour'); c.g = nouvelleGraine();
  var miennes = [];
  function libre(r, m){
    m = m == null ? 2 : m;
    if(r.x < c.x + 1 || r.y < c.y + 1 || r.x + r.w > c.x + c.w - 1 || r.y + r.h > c.y + c.h - 1) return false;
    return !evite.some(function(q){ return croise(r, q, m); }) && !miennes.some(function(q){ return croise(r, q, m); });
  }
  /* les quatre côtés : ceux qui donnent sur une rue reçoivent une rangée de maisons (et un muret ou une haie entre elles) */
  var cotes = [{h:true, y:c.y, d:-1}, {h:true, y:c.y + c.h, d:1}, {h:false, x:c.x, d:-1}, {h:false, x:c.x + c.w, d:1}];
  cotes.forEach(function(cd){
    var len = cd.h ? c.w : c.h, t = U.rand(1, 6), face = 0, essais = 0;
    while(t < len - 18 && essais++ < 60){
      var w = U.rand(26, 46), d = U.rand(30, 42);
      if(t + w > len - 2) w = len - 2 - t; if(w < 20) break;
      var r, ox, oy;
      if(cd.h){ r = {x:c.x + t, y:cd.d < 0 ? c.y + 5.5 : c.y + c.h - 5.5 - d, w:w, h:d}; ox = r.x + w / 2; oy = cd.d < 0 ? c.y - 8 : c.y + c.h + 8; }
      else { r = {x:cd.d < 0 ? c.x + 5.5 : c.x + c.w - 5.5 - d, y:c.y + t, w:d, h:w}; ox = cd.d < 0 ? c.x - 8 : c.x + c.w + 8; oy = r.y + w / 2; }
      if(dansRue(ox, oy)){
        face++;
        if(libre(r, 1)){ maisons.push(maisonDe(r, cd.h ? 'h' : 'v', {x:ox, y:oy})); miennes.push(r); }
      }
      t += w + (Math.random() < .14 ? U.rand(9, 20) : U.rand(0, 2.5));
    }
    if(face) bords.push({x1:cd.h ? c.x : cd.x, y1:cd.h ? cd.y : c.y, x2:cd.h ? c.x + c.w : cd.x, y2:cd.h ? cd.y : c.y + c.h, d:cd.d, h:cd.h, sorte:Math.random() < .5 ? 'muret' : 'haie', g:nouvelleGraine()});
  });
  /* au bord du quartier : des maisons aussi derrière, au milieu des jardins (une petite ville, pas un champ) */
  if(c.bord){
    var nM = Math.round(c.w * c.h / 16000);
    for(var e0 = 0; e0 < 50 && nM > 0; e0++){
      var hz = Math.random() < .5, mw = U.rand(30, 48), md = U.rand(30, 40), R0 = {x:U.rand(c.x + 8, c.x + c.w - (hz ? mw : md) - 8), y:U.rand(c.y + 8, c.y + c.h - (hz ? md : mw) - 8), w:hz ? mw : md, h:hz ? md : mw};
      if(!libre(R0, 9)) continue;
      maisons.push(maisonDe(R0, hz ? 'h' : 'v', null)); miennes.push(R0); nM--;
    }
  }
  /* derrière : des arbres, et quelques choses de jardin ou de cour */
  var nA = c.sol === 'jardin' ? 3 + Math.floor(Math.random() * 4) : 1 + Math.floor(Math.random() * 2);
  if(c.bord) nA += 3;
  var SORTES = c.sol === 'jardin' ? ['feuillu', 'feuillu', 'fruitier', 'fruitier', 'sapin'] : ['feuillu', 'fruitier'];
  for(var e = 0; e < 60 && nA > 0; e++){
    var ra = U.rand(12, 21), a = {x:U.rand(c.x + ra + 4, c.x + c.w - ra - 4), y:U.rand(c.y + ra + 4, c.y + c.h - ra - 4), r:ra};
    if(!libre({x:a.x - ra * .8, y:a.y - ra * .8, w:ra * 1.6, h:ra * 1.6}, 1)) continue;
    a.sorte = U.choix(SORTES); a.g = nouvelleGraine(); a.haut = ra * 1.3;
    if(a.sorte === 'fruitier') a.fruits = U.choix(['#d83b3b', '#e8a23a', '#f2e6ee']);
    arbres.push(a); miennes.push({x:a.x - ra * .7, y:a.y - ra * .7, w:ra * 1.4, h:ra * 1.4}); nA--;
  }
  var CHOSES = c.sol === 'jardin' ? ['potager', 'fleurs', 'puits', 'banc', 'meule', 'fleurs', 'ruches', 'bois'] : ['tonneaux', 'caisses', 'puits', 'bois', 'charrette', 'sacs', 'etal', 'paniers', 'linge'];
  var nO = 2 + Math.floor(Math.random() * 3);
  var TAILLES = {potager:[36, 26], fleurs:[22, 12], puits:[16, 16], banc:[18, 6], meule:[20, 20], ruches:[24, 9], bois:[22, 12], tonneaux:[18, 18], caisses:[18, 16], charrette:[30, 18], sacs:[18, 12], etal:[30, 14], paniers:[18, 10], linge:[34, 4]};
  for(e = 0; e < 60 && nO > 0; e++){
    var ty = U.choix(CHOSES), T = TAILLES[ty], tourne = Math.random() < .5, ow = tourne ? T[1] : T[0], oh = tourne ? T[0] : T[1];
    var o = {x:U.rand(c.x + 6, c.x + c.w - ow - 6), y:U.rand(c.y + 6, c.y + c.h - oh - 6), w:ow, h:oh, type:ty, g:nouvelleGraine(), sens:tourne ? 'v' : 'h', haut:ty === 'meule' ? 10 : ty === 'puits' ? 8 : 5};
    if(!libre(o, 3)) continue;
    (ty === 'potager' || ty === 'fleurs' ? sols : objets).push(o); miennes.push(o); nO--;
  }
}
/* le décor d'une cellule de la forêt (Romain : « tu modélises les arbres […] des variétés de décors ») : des arbres serrés (chênes,
   hêtres, bouleaux, pins, sapins) dont les branches débordent un peu sur le chemin ; au bord des chemins, des buissons, des fougères,
   des champignons ; par terre, de la mousse, des fleurs des bois, des feuilles mortes ; çà et là, un rocher, une souche, un arbre
   couché, un tas de branches. Rien ne pousse dans le ruisseau (evite). */
var ESSENCES = ['chene', 'chene', 'chene', 'hetre', 'hetre', 'bouleau', 'pin', 'sapin', 'sapin'];
function decorForet(c, evite, dansRue, arbres, objets, sols){
  c.sol = 'bois'; c.g = nouvelleGraine();
  var miennes = [];
  function dedans(r, m){ return r.x >= c.x - m && r.y >= c.y - m && r.x + r.w <= c.x + c.w + m && r.y + r.h <= c.y + c.h + m; }
  function libreE(r, m){ return !evite.some(function(q){ return croise(r, q, m); }); }
  function libreM(r, m){ return !miennes.some(function(q){ return croise(r, q, m); }); }
  /* 1. le bord des chemins */
  [{h:true, y:c.y, d:1}, {h:true, y:c.y + c.h, d:-1}, {h:false, x:c.x, d:1}, {h:false, x:c.x + c.w, d:-1}].forEach(function(cd){
    var ox = cd.h ? c.x + c.w / 2 : cd.x - cd.d * 12, oy = cd.h ? cd.y - cd.d * 12 : c.y + c.h / 2;
    if(!dansRue(ox, oy)) return;
    var len = cd.h ? c.w : c.h;
    for(var t = U.rand(2, 10); t < len - 4; t += U.rand(9, 19)){
      var pr = U.rand(5, 13), px = cd.h ? c.x + t : cd.x + cd.d * pr, py = cd.h ? cd.y + cd.d * pr : c.y + t, r = Math.random();
      if(r < .42){
        var rb = U.rand(7, 12), b = {x:px - rb * .6, y:py - rb * .6, w:rb * 1.2, h:rb * 1.2};
        if(libreE(b, 0) && libreM(b, -2)){ arbres.push({x:px, y:py, r:rb, sorte:'buisson', g:nouvelleGraine(), haut:6, baies:Math.random() < .22 ? U.choix(['#c8304a', '#3c2c70']) : null}); miennes.push(b); }
      } else if(r < .86){
        var rf = U.rand(7, 11), bf = {x:px - rf * .5, y:py - rf * .5, w:rf, h:rf};
        if(libreE(bf, 0)) sols.push({type:'fougere', x:px - rf, y:py - rf, w:rf * 2, h:rf * 2, cx:px, cy:py, r:rf, a:U.rand(0, TAU), g:nouvelleGraine()});
      } else {
        var bc = {x:px - 4, y:py - 4, w:8, h:8};
        if(libreE(bc, 0)) sols.push({type:'champis', x:px - 6, y:py - 6, w:12, h:12, cx:px, cy:py, g:nouvelleGraine()});
      }
    }
  });
  /* 2. les arbres : serrés, les feuillages peuvent se toucher ; ils ne mordent sur le chemin que de quelques pas */
  var nA = Math.round(c.w * c.h / 1350) + 2;
  for(var e = 0; e < nA * 5 && nA > 0; e++){
    var so = U.choix(ESSENCES), ra = so === 'bouleau' ? U.rand(11, 17) : so === 'sapin' || so === 'pin' ? U.rand(13, 21) : U.rand(16, 28);
    var x = U.rand(c.x + 6, c.x + c.w - 6), y = U.rand(c.y + 6, c.y + c.h - 6);
    var tronc = {x:x - ra * .42, y:y - ra * .42, w:ra * .84, h:ra * .84}, feuillage = {x:x - (ra - 7), y:y - (ra - 7), w:(ra - 7) * 2, h:(ra - 7) * 2};
    if(!dedans(tronc, 4) || !libreE(feuillage, 0) || !libreM(tronc, 0)) continue;
    arbres.push({x:x, y:y, r:ra, sorte:so, g:nouvelleGraine(), haut:ra * 1.4});
    miennes.push(tronc); nA--;
  }
  /* 3. les choses par terre : rochers, souches, arbres couchés, tas de branches */
  var TAILLES = {rocher:[16, 13], souche:[14, 14], tronc:[46, 11], branches:[22, 13]}, nO = 1 + Math.floor(Math.random() * 3);
  for(e = 0; e < 50 && nO > 0; e++){
    var ty = U.choix(['rocher', 'rocher', 'souche', 'tronc', 'branches']), T = TAILLES[ty], tourne = Math.random() < .5, ow = tourne ? T[1] : T[0], oh = tourne ? T[0] : T[1];
    var o = {x:U.rand(c.x + 6, c.x + c.w - ow - 6), y:U.rand(c.y + 6, c.y + c.h - oh - 6), w:ow, h:oh, type:ty, g:nouvelleGraine(), sens:tourne ? 'v' : 'h', haut:ty === 'rocher' ? 8 : ty === 'souche' ? 6 : 5};
    if(!libreE(o, 3) || !libreM(o, 2)) continue;
    objets.push(o); miennes.push(o); nO--;
  }
  /* 4. le sol : de la mousse, des fougères, des fleurs des bois, des champignons, des feuilles mortes (sous les arbres aussi) */
  var nS = Math.round(c.w * c.h / 2200);
  for(e = 0; e < nS * 3 && nS > 0; e++){
    var tS = U.choix(['mousse', 'mousse', 'fougere', 'fougere', 'fougere', 'fleursF', 'champis', 'feuilles', 'feuilles']), rs = tS === 'mousse' ? U.rand(8, 16) : tS === 'feuilles' ? U.rand(7, 12) : U.rand(6, 11);
    var sx = U.rand(c.x + rs, c.x + c.w - rs), sy = U.rand(c.y + rs, c.y + c.h - rs), bs = {x:sx - rs * .5, y:sy - rs * .5, w:rs, h:rs};
    if(!libreE(bs, 0)) continue;
    sols.push({type:tS, x:sx - rs, y:sy - rs, w:rs * 2, h:rs * 2, cx:sx, cy:sy, r:rs, a:U.rand(0, TAU), g:nouvelleGraine()}); nS--;
  }
}
function longueur(pts){ var L = 0; for(var i = 1; i < pts.length; i++) L += Math.hypot(pts[i].x - pts[i - 1].x, pts[i].y - pts[i - 1].y); return L; }
function point(pts, s){
  for(var i = 1; i < pts.length; i++){
    var d = Math.hypot(pts[i].x - pts[i - 1].x, pts[i].y - pts[i - 1].y);
    if(s <= d || i === pts.length - 1){ var u = d ? Math.min(1, s / d) : 0; return {x:pts[i - 1].x + (pts[i].x - pts[i - 1].x) * u, y:pts[i - 1].y + (pts[i].y - pts[i - 1].y) * u, a:Math.atan2(pts[i].y - pts[i - 1].y, pts[i].x - pts[i - 1].x)}; }
    s -= d;
  }
  return {x:pts[0].x, y:pts[0].y, a:0};
}
/* les coins d'une ligne brisée, arrondis (un chat ne tourne pas à angle droit) */
function arrondir(pts, r){
  if(pts.length < 3) return pts.slice();
  var out = [pts[0]];
  for(var i = 1; i < pts.length - 1; i++){
    var a = pts[i - 1], b = pts[i], c = pts[i + 1];
    var d1 = Math.hypot(b.x - a.x, b.y - a.y), d2 = Math.hypot(c.x - b.x, c.y - b.y), rr2 = Math.min(r, d1 / 2.2, d2 / 2.2);
    if(!d1 || !d2){ out.push(b); continue; }
    var p1 = {x:b.x + (a.x - b.x) * rr2 / d1, y:b.y + (a.y - b.y) * rr2 / d1}, p2 = {x:b.x + (c.x - b.x) * rr2 / d2, y:b.y + (c.y - b.y) * rr2 / d2};
    for(var k = 0; k <= 4; k++){ var u = k / 4, v = 1 - u; out.push({x:v * v * p1.x + 2 * v * u * b.x + u * u * p2.x, y:v * v * p1.y + 2 * v * u * b.y + u * u * p2.y}); }
  }
  out.push(pts[pts.length - 1]);
  return out;
}

/* ==========================================================
   LES TEXTURES : une tuile de 64 × 64 unités, dessinée une fois à la taille de l'écran, puis posée côte à côte
   ========================================================== */
function partout(px, py, m, f){ for(var dx = -64; dx <= 64; dx += 64) for(var dy = -64; dy <= 64; dy += 64){ var X = px + dx, Y = py + dy; if(X > -m && X < 64 + m && Y > -m && Y < 64 + m) f(X, Y); } }
function tuile(s, quoi){
  var T = Math.max(32, Math.round(64 * s)), c = document.createElement('canvas'); c.width = c.height = T;
  var x = c.getContext('2d'), r = graine(quoi === 'paves' ? 11 : quoi === 'herbe' ? 23 : quoi === 'humus' ? 53 : quoi === 'sentier' ? 61 : 37), k;
  x.scale(T / 64, T / 64);
  if(quoi === 'paves'){
    /* des pavés posés en rangs décalés : chacun sa teinte, un bord clair en haut à gauche, un bord sombre en bas à droite */
    x.fillStyle = '#75675a'; x.fillRect(0, 0, 64, 64);
    var TONS = ['#b6a487', '#ab997c', '#bfae91', '#a59376', '#b1a083', '#baa98c', '#a89a80', '#b3a38b'];
    for(var j = 0; j < 10; j++){
      var nb = 8, ws = [], sum = 0; for(k = 0; k < nb; k++){ var w = .7 + r() * .7; ws.push(w); sum += w; }
      var cx = r() * 64;
      for(k = 0; k < nb; k++){
        var pw = ws[k] / sum * 64, st = {t:mix(TONS[Math.floor(r() * TONS.length)], r() < .5 ? '#ffffff' : '#000000', r() * .07), d:[r(), r(), r(), r(), r(), r()], fente:r() < .06};
        (function(px, py, pw2, st2){ partout(px, py, 12, function(X, Y){ pave1(x, X, Y, pw2, 6.4, st2); }); })(cx, j * 6.4, pw, st);
        cx += pw;
      }
    }
    /* de la mousse dans quelques joints, et de la poussière */
    for(k = 0; k < 26; k++){ var mx = r() * 64, my = Math.round(r() * 10) * 6.4 + (r() - .5) * .8, mc = r() < .5 ? 'rgba(96,124,62,.5)' : 'rgba(120,140,70,.4)', ml = 1 + r() * 2.4;
      partout(mx, my, 4, function(X, Y){ x.fillStyle = mc; ovale(x, X, Y, ml, .55, 0); x.fill(); }); }
    for(k = 0; k < 10; k++){ var dx2 = r() * 64, dy2 = r() * 64, dr = 4 + r() * 7; partout(dx2, dy2, dr, function(X, Y){ var gr = x.createRadialGradient(X, Y, 0, X, Y, dr); gr.addColorStop(0, 'rgba(90,72,50,.1)'); gr.addColorStop(1, 'rgba(90,72,50,0)'); x.fillStyle = gr; x.fillRect(X - dr, Y - dr, dr * 2, dr * 2); }); }
  } else if(quoi === 'herbe'){
    x.fillStyle = '#679a50'; x.fillRect(0, 0, 64, 64);
    for(k = 0; k < 16; k++){ var tx = r() * 64, ty = r() * 64, trr = 4 + r() * 9, tc = r() < .5 ? 'rgba(130,180,96,.16)' : 'rgba(50,92,44,.18)';
      partout(tx, ty, trr, function(X, Y){ x.fillStyle = tc; rond(x, X, Y, trr); x.fill(); }); }
    var BRINS = ['#578c43', '#76ab5c', '#86b86a', '#4d7f3d', '#6ea456', '#93c072'];
    x.lineWidth = .42; x.lineCap = 'round';
    for(k = 0; k < 700; k++){
      var bx = r() * 64, by = r() * 64, ba = -PI / 2 + (r() - .5) * 1.2, bl = 1 + r() * 1.6, bc = BRINS[Math.floor(r() * BRINS.length)];
      (function(bc2, ba2, bl2){ partout(bx, by, 3, function(X, Y){ x.strokeStyle = bc2; x.beginPath(); x.moveTo(X, Y); x.lineTo(X + Math.cos(ba2) * bl2, Y + Math.sin(ba2) * bl2); x.stroke(); }); })(bc, ba, bl);
    }
    for(k = 0; k < 7; k++){ var fx = r() * 64, fy = r() * 64, fc = r() < .6 ? '#f6f1e4' : '#f2d04a';
      (function(fc2){ partout(fx, fy, 2, function(X, Y){ x.fillStyle = fc2; for(var pp = 0; pp < 5; pp++){ rond(x, X + Math.cos(pp * 1.257) * .7, Y + Math.sin(pp * 1.257) * .7, .45); x.fill(); } x.fillStyle = '#e8b030'; rond(x, X, Y, .35); x.fill(); }); })(fc); }
  } else if(quoi === 'humus'){
    /* le sol de la forêt : de la terre sombre, des aiguilles, des feuilles mortes de toutes les couleurs, des brindilles, de la mousse */
    x.fillStyle = '#3f4a2a'; x.fillRect(0, 0, 64, 64);
    for(k = 0; k < 18; k++){ var hx2 = r() * 64, hy2 = r() * 64, hr = 5 + r() * 10, hc = r() < .4 ? 'rgba(90,110,50,.22)' : r() < .7 ? 'rgba(40,30,18,.22)' : 'rgba(110,84,46,.18)';
      partout(hx2, hy2, hr, function(X, Y){ x.fillStyle = hc; rond(x, X, Y, hr); x.fill(); }); }
    var FEUILLES = ['#7a5a2a', '#9a6a2a', '#6a4a24', '#a8782e', '#5a4a26', '#8a3a20', '#b08a3a', '#4e5a2a'];
    for(k = 0; k < 150; k++){ var fx2 = r() * 64, fy2 = r() * 64, fa = r() * PI, fl = .9 + r() * 1.5, fc2 = FEUILLES[Math.floor(r() * FEUILLES.length)];
      (function(fc3, fa2, fl2){ partout(fx2, fy2, 3, function(X, Y){ x.fillStyle = fc3; ovale(x, X, Y, fl2, fl2 * .5, fa2); x.fill(); }); })(fc2, fa, fl); }
    x.lineWidth = .3; x.lineCap = 'round';
    for(k = 0; k < 90; k++){ var ax2 = r() * 64, ay2 = r() * 64, aa = r() * PI, al3 = 1.2 + r() * 1.8, ac = r() < .5 ? '#6a5430' : '#2e3a20';
      (function(ac2, aa2, al4){ partout(ax2, ay2, 3, function(X, Y){ x.strokeStyle = ac2; x.beginPath(); x.moveTo(X, Y); x.lineTo(X + Math.cos(aa2) * al4, Y + Math.sin(aa2) * al4); x.stroke(); }); })(ac, aa, al3); }
    for(k = 0; k < 40; k++){ var mx2 = r() * 64, my2 = r() * 64, mc2 = r() < .5 ? 'rgba(110,150,60,.5)' : 'rgba(80,120,48,.45)';
      partout(mx2, my2, 2, function(X, Y){ x.fillStyle = mc2; rond(x, X, Y, .5 + r() * .4); x.fill(); }); }
  } else if(quoi === 'sentier'){
    /* la terre tassée d'un chemin de forêt : plus claire, des cailloux, quelques feuilles, des petites racines */
    x.fillStyle = '#86704c'; x.fillRect(0, 0, 64, 64);
    for(k = 0; k < 22; k++){ var sx3 = r() * 64, sy3 = r() * 64, sr3 = 3 + r() * 9, sc3 = r() < .5 ? 'rgba(104,84,54,.26)' : 'rgba(160,138,100,.22)';
      partout(sx3, sy3, sr3, function(X, Y){ x.fillStyle = sc3; rond(x, X, Y, sr3); x.fill(); }); }
    var CAIL2 = ['#6e604a', '#a8967a', '#5e5240', '#9a8a70', '#b8a888'];
    for(k = 0; k < 70; k++){ var cx4 = r() * 64, cy4 = r() * 64, cr4 = .35 + r() * .8, cc4 = CAIL2[Math.floor(r() * CAIL2.length)], ca4 = r() * 3;
      partout(cx4, cy4, 2, function(X, Y){ x.fillStyle = cc4; ovale(x, X, Y, cr4, cr4 * .75, ca4); x.fill(); }); }
    for(k = 0; k < 16; k++){ var lx3 = r() * 64, ly3 = r() * 64, la3 = r() * PI, lc3 = ['#8a5a26', '#a8782e', '#6a4a24'][Math.floor(r() * 3)];
      partout(lx3, ly3, 3, function(X, Y){ x.fillStyle = lc3; ovale(x, X, Y, 1.5, .75, la3); x.fill(); }); }
    x.strokeStyle = 'rgba(70,52,32,.4)'; x.lineWidth = .6; x.lineCap = 'round';
    for(k = 0; k < 3; k++){ var rx3 = r() * 64, ry3 = r() * 64, ra3 = r() * PI;
      partout(rx3, ry3, 10, function(X, Y){ x.beginPath(); x.moveTo(X, Y); x.quadraticCurveTo(X + Math.cos(ra3) * 5 + 2, Y + Math.sin(ra3) * 5 - 1, X + Math.cos(ra3) * 9, Y + Math.sin(ra3) * 9); x.stroke(); }); }
  } else {
    /* la terre battue des cours : des cailloux, des taches */
    x.fillStyle = '#a48e6d'; x.fillRect(0, 0, 64, 64);
    for(k = 0; k < 20; k++){ var sx2 = r() * 64, sy2 = r() * 64, sr = 3 + r() * 8, scc = r() < .5 ? 'rgba(126,102,72,.2)' : 'rgba(196,176,140,.2)';
      partout(sx2, sy2, sr, function(X, Y){ x.fillStyle = scc; rond(x, X, Y, sr); x.fill(); }); }
    var CAIL = ['#8d7a5e', '#c2ad8a', '#7a6a52', '#b8a283', '#d0bea0'];
    for(k = 0; k < 110; k++){ var cx3 = r() * 64, cy3 = r() * 64, cr = .35 + r() * .9, ccl = CAIL[Math.floor(r() * CAIL.length)], ca = r() * 3;
      partout(cx3, cy3, 2, function(X, Y){ x.fillStyle = ccl; ovale(x, X, Y, cr, cr * .75, ca); x.fill(); }); }
  }
  return c;
}
function pave1(x, px, py, w, h, st){
  var i = .55, r = 1.7;
  x.fillStyle = st.t; x.beginPath(); rr(x, px + i, py + i, w - 2 * i, h - 2 * i, r); x.fill();
  x.lineWidth = .55;
  x.strokeStyle = 'rgba(255,248,230,.3)'; x.beginPath(); x.moveTo(px + i + r, py + i + .32); x.lineTo(px + w - i - r, py + i + .32); x.moveTo(px + i + .32, py + i + r); x.lineTo(px + i + .32, py + h - i - r); x.stroke();
  x.strokeStyle = 'rgba(50,38,26,.32)'; x.beginPath(); x.moveTo(px + i + r, py + h - i - .32); x.lineTo(px + w - i - r, py + h - i - .32); x.moveTo(px + w - i - .32, py + i + r); x.lineTo(px + w - i - .32, py + h - i - r); x.stroke();
  x.fillStyle = 'rgba(70,56,40,.2)';
  for(var k = 0; k < 2; k++){ rond(x, px + 1.4 + st.d[k] * (w - 2.8), py + 1.4 + st.d[k + 2] * (h - 2.8), .3 + st.d[k + 4] * .32); x.fill(); }
  if(st.fente){ x.strokeStyle = 'rgba(50,38,26,.4)'; x.lineWidth = .35; x.beginPath(); x.moveTo(px + w * .3, py + i + .4); x.lineTo(px + w * .45, py + h * .5); x.lineTo(px + w * .4, py + h - i - .4); x.stroke(); }
}
function carreler(x, t, R, Tw){
  var a0 = Math.floor(R.x / Tw), a1 = Math.floor((R.x + R.w) / Tw), b0 = Math.floor(R.y / Tw), b1 = Math.floor((R.y + R.h) / Tw);
  for(var a = a0; a <= a1; a++) for(var b = b0; b <= b1; b++) x.drawImage(t, a * Tw, b * Tw, Tw, Tw);
}

/* ==========================================================
   LE DESSIN DU DÉCOR (en unités du monde). Tout ce qui est ici est dessiné une fois dans un morceau (Blocs).
   ========================================================== */
function ombre(x, R, L, h){
  var ox = L.ombre.x * h * L.ombre.l, oy = L.ombre.y * h * L.ombre.l;
  var P = [[R.x, R.y], [R.x + R.w, R.y], [R.x + R.w, R.y + R.h], [R.x, R.y + R.h]];
  P = enveloppe(P.concat(P.map(function(q){ return [q[0] + ox, q[1] + oy]; })));
  x.fillStyle = 'rgba(16,22,40,' + L.ombre.a + ')'; x.beginPath(); x.moveTo(P[0][0], P[0][1]); for(var i = 1; i < P.length; i++) x.lineTo(P[i][0], P[i][1]); x.closePath(); x.fill();
}
function ombreRond(x, cx, cy, r, L, h){ x.fillStyle = 'rgba(16,22,40,' + L.ombre.a + ')'; ovale(x, cx + L.ombre.x * h * L.ombre.l, cy + L.ombre.y * h * L.ombre.l, r, r * .92, 0); x.fill(); }
/* l'ombre d'une chose : ronde pour ce qui est rond (tonneaux, paniers, puits, meule), un peu plus petite que sa boîte pour le reste */
function ombreObjet(x, o, L){
  var h = o.haut || 6, dx = L.ombre.x * h * L.ombre.l, dy = L.ombre.y * h * L.ombre.l, cx = o.x + o.w / 2, cy = o.y + o.h / 2, q;
  x.fillStyle = 'rgba(16,22,40,' + L.ombre.a + ')';
  if(o.type === 'tonneaux'){
    var nt = o.w * o.h > 450 ? 3 : 2, tr = Math.min(o.w, o.h) * .3;
    x.beginPath();
    for(q = 0; q < nt; q++){ var tx = o.x + tr + (o.w - 2 * tr) * (nt === 1 ? .5 : q / (nt - 1)), ty = o.y + tr + (o.h - 2 * tr) * (q % 2 ? .15 : .85);
      x.moveTo(tx + dx * .7 + tr, ty + dy * .7); x.arc(tx + dx * .7, ty + dy * .7, tr, 0, TAU); }
    x.fill(); return;
  }
  if(o.type === 'paniers'){ x.beginPath(); for(q = 0; q < 2; q++){ var pr = Math.min(o.w * .22, o.h * .46), px = o.x + o.w * (.28 + .44 * q) + dx * .6; x.moveTo(px + pr, cy + dy * .6); x.arc(px, cy + dy * .6, pr, 0, TAU); } x.fill(); return; }
  if(o.type === 'puits' || o.type === 'meule' || o.type === 'souche'){ ovale(x, cx + dx, cy + dy, o.w / 2, o.w / 2 * .94, 0); x.fill(); return; }
  if(o.type === 'rocher' || o.type === 'rochers'){ ovale(x, cx + dx * .8, cy + dy * .8, o.w * .5, o.h * .5, 0); x.fill(); return; }
  if(o.type === 'sacs' || o.type === 'bois' || o.type === 'ruches' || o.type === 'linge' || o.type === 'tronc' || o.type === 'branches'){ ovale(x, cx + dx * .6, cy + dy * .6, o.w * .48, o.h * .46, 0); x.fill(); return; }
  ombre(x, {x:o.x + 2, y:o.y + 2, w:o.w - 4, h:o.h - 4}, L, h);
}
/* un toit vu du ciel : deux pans (celui qui regarde le soleil est plus clair), les rangs de tuiles ou d'ardoises, les joints décalés,
   le faîtage, un peu de mousse, une lucarne, les cheminées */
function dessinerToit(x, m, L){
  var r = graine(m.g), H = m.sens === 'h', X0 = m.x, Y0 = m.y, W = m.w, Hh = m.h, ard = m.toit === 'ardoise';
  var base = m.c, clair = mix(base, ard ? '#e4ebf6' : '#ffe2bf', .2), sombre = mix(base, '#140a12', .24);
  var litA = H ? L.ombre.y > 0 : L.ombre.x > 0;
  var cA = litA ? clair : sombre, cB = litA ? sombre : clair, q, y, u, kk;
  x.fillStyle = cA; if(H) x.fillRect(X0, Y0, W, Hh / 2); else x.fillRect(X0, Y0, W / 2, Hh);
  x.fillStyle = cB; if(H) x.fillRect(X0, Y0 + Hh / 2, W, Hh / 2); else x.fillRect(X0 + W / 2, Y0, W / 2, Hh);
  /* quelques tuiles plus claires ou plus foncées */
  var pas = ard ? 2.6 : 3.2, lg = ard ? 3.3 : 3.9, longueurR = H ? W : Hh, largeurR = H ? Hh : W;
  for(q = 0; q < Math.round(W * Hh / 60); q++){
    var a1 = r() * (longueurR - lg), b1 = Math.floor(r() * largeurR / pas) * pas;
    x.fillStyle = r() < .5 ? 'rgba(255,240,220,.13)' : 'rgba(30,10,10,.12)';
    if(H) x.fillRect(X0 + a1, Y0 + b1, lg, pas); else x.fillRect(X0 + b1, Y0 + a1, pas, lg);
  }
  /* les rangs (parallèles au faîtage) */
  x.lineWidth = .5; x.strokeStyle = ard ? 'rgba(18,22,40,.34)' : 'rgba(64,20,10,.32)'; x.beginPath();
  for(y = pas; y < largeurR - .4; y += pas){ if(Math.abs(y - largeurR / 2) < pas * .45) continue; if(H){ x.moveTo(X0, Y0 + y); x.lineTo(X0 + W, Y0 + y); } else { x.moveTo(X0 + y, Y0); x.lineTo(X0 + y, Y0 + Hh); } }
  x.stroke();
  /* le bombé de chaque rang (un liseré clair) */
  x.strokeStyle = ard ? 'rgba(230,236,250,.12)' : 'rgba(255,226,196,.16)'; x.beginPath();
  for(y = pas - .6; y < largeurR - .4; y += pas){ if(H){ x.moveTo(X0, Y0 + y); x.lineTo(X0 + W, Y0 + y); } else { x.moveTo(X0 + y, Y0); x.lineTo(X0 + y, Y0 + Hh); } }
  x.stroke();
  /* les joints, décalés d'un rang à l'autre */
  x.lineWidth = .38; x.strokeStyle = ard ? 'rgba(18,22,40,.26)' : 'rgba(64,20,10,.24)'; x.beginPath();
  for(y = 0, kk = 0; y < largeurR - .3; y += pas, kk++){
    var dec = (kk % 2) * lg / 2 + (r() - .5) * .6;
    for(u = dec + lg; u < longueurR; u += lg){ if(H){ x.moveTo(X0 + u, Y0 + y + .3); x.lineTo(X0 + u, Y0 + Math.min(y + pas - .2, Hh)); } else { x.moveTo(X0 + y + .3, Y0 + u); x.lineTo(X0 + Math.min(y + pas - .2, W), Y0 + u); } }
  }
  x.stroke();
  /* l'usure : de la mousse, de la suie */
  for(q = 0; q < 3; q++){ x.fillStyle = r() < .55 ? 'rgba(90,116,50,.16)' : 'rgba(30,20,20,.1)'; ovale(x, X0 + r() * W, Y0 + r() * Hh, 2 + r() * 5, 1.5 + r() * 3, r() * 3); x.fill(); }
  /* le faîtage */
  x.strokeStyle = mix(base, '#140a12', .45); x.lineWidth = 1.7; x.beginPath();
  if(H){ x.moveTo(X0, Y0 + Hh / 2); x.lineTo(X0 + W, Y0 + Hh / 2); } else { x.moveTo(X0 + W / 2, Y0); x.lineTo(X0 + W / 2, Y0 + Hh); }
  x.stroke();
  x.strokeStyle = 'rgba(255,236,214,.22)'; x.lineWidth = .5; x.beginPath();
  if(H){ x.moveTo(X0, Y0 + Hh / 2 - .9); x.lineTo(X0 + W, Y0 + Hh / 2 - .9); } else { x.moveTo(X0 + W / 2 - .9, Y0); x.lineTo(X0 + W / 2 - .9, Y0 + Hh); }
  x.stroke();
  /* le bord du toit */
  x.strokeStyle = K; x.lineWidth = 1.7; x.strokeRect(X0, Y0, W, Hh);
  x.strokeStyle = 'rgba(255,255,255,.13)'; x.lineWidth = .6; x.strokeRect(X0 + 1.1, Y0 + 1.1, W - 2.2, Hh - 2.2);
  /* la lucarne : une petite fenêtre et son petit toit, sur un pan */
  if(m.lucarne){
    var lu = .25 + r() * .5, lx = H ? X0 + W * lu : X0 + (r() < .5 ? W * .12 : W * .62), ly = H ? Y0 + (r() < .5 ? Hh * .12 : Hh * .62) : Y0 + Hh * lu;
    var lw = H ? 7 : Hh * 0 + W * .26, lh = H ? Hh * .26 : 7;
    ombre(x, {x:lx, y:ly, w:lw, h:lh}, L, 3);
    x.fillStyle = ard ? '#4a5672' : mix(base, '#140a12', .1); x.fillRect(lx, ly, lw, lh); x.strokeStyle = K; x.lineWidth = 1; x.strokeRect(lx, ly, lw, lh);
    x.fillStyle = L.nuit && r() < .5 ? '#ffd879' : '#9fb4cc';
    if(H) x.fillRect(lx + 1.6, ly + (ly < Y0 + Hh / 2 ? .8 : lh - 3), lw - 3.2, 2.2); else x.fillRect(lx + (lx < X0 + W / 2 ? .8 : lw - 3), ly + 1.6, 2.2, lh - 3.2);
  }
  /* les cheminées */
  m.chem.forEach(function(c){
    var cx = X0 + W * c.u, cy = Y0 + Hh * c.v;
    ombre(x, {x:cx - 3, y:cy - 3, w:6, h:6}, L, 5);
    x.fillStyle = '#8a6a58'; x.fillRect(cx - 3, cy - 3, 6, 6);
    x.fillStyle = '#a5846c'; x.fillRect(cx - 3, cy - 3, 6, 1.5);
    x.strokeStyle = 'rgba(60,40,30,.5)'; x.lineWidth = .35; x.beginPath(); x.moveTo(cx - 3, cy); x.lineTo(cx + 3, cy); x.moveTo(cx, cy - 3); x.lineTo(cx, cy); x.moveTo(cx - 1.5, cy); x.lineTo(cx - 1.5, cy + 3); x.moveTo(cx + 1.5, cy); x.lineTo(cx + 1.5, cy + 3); x.stroke();
    x.strokeStyle = K; x.lineWidth = 1.1; x.strokeRect(cx - 3, cy - 3, 6, 6);
    x.fillStyle = '#211816'; x.fillRect(cx - 1.6, cy - 1.6, 3.2, 3.2);
    x.fillStyle = 'rgba(20,14,12,.25)'; ovale(x, cx + VENT.x * 3, cy + VENT.y * 3, 3.4, 2.2, Math.atan2(VENT.y, VENT.x)); x.fill();
  });
  if(m.chat) chatEndormi(x, X0 + W * m.chat.u, Y0 + Hh * m.chat.v, m.chat.c, m.chat.a);
}
function chatEndormi(x, cx, cy, c, a){
  x.save(); x.translate(cx, cy); x.rotate(a);
  x.fillStyle = 'rgba(10,10,20,.25)'; ovale(x, 1.2, 1.4, 6.4, 5.4, 0); x.fill();
  x.fillStyle = c; x.strokeStyle = K; x.lineWidth = 1; ovale(x, 0, 0, 6, 5, 0); x.fill(); x.stroke();
  x.strokeStyle = K; x.lineWidth = 2.6; x.lineCap = 'round'; x.beginPath(); x.arc(0, 0, 5.4, .3, 2.2); x.stroke(); x.strokeStyle = c; x.lineWidth = 1.5; x.stroke();
  x.fillStyle = c; x.strokeStyle = K; x.lineWidth = 1; rond(x, 3.4, -2.4, 2.8); x.fill(); x.stroke();
  x.beginPath(); x.moveTo(2, -4.6); x.lineTo(2.4, -6.6); x.lineTo(3.8, -5); x.closePath(); x.moveTo(4.6, -4.2); x.lineTo(6.4, -5); x.lineTo(5.6, -3.2); x.closePath(); x.fill(); x.stroke();
  x.restore();
}
/* un arbre vu du ciel : des touffes de feuilles (le contour d'abord, puis le remplissage), plus claires du côté du soleil */
/* les feuillages : le plus sombre, le moyen, le plus clair (du côté du soleil) */
var FEUILLAGES = {feuillu:['#2d6a3a', '#3f8a4a', '#62ae5e'], fruitier:['#3d6e34', '#549448', '#7cbc62'], chene:['#22492a', '#336a36', '#58944a'],
  hetre:['#386a30', '#508e3c', '#82b458'], bouleau:['#5a8a36', '#7eae4a', '#b6d874'], buisson:['#2c562c', '#427838', '#69a04e']};
/* les touffes d'un feuillage : leur nombre, leur écart au centre, leur taille, selon l'arbre */
var FORMES = {feuillu:[6, 3, .42, .16, .42, .14, .58], fruitier:[6, 3, .42, .16, .42, .14, .58], chene:[8, 3, .44, .2, .36, .16, .55],
  hetre:[7, 2, .4, .14, .44, .12, .6], bouleau:[10, 3, .5, .2, .27, .1, .45], buisson:[5, 2, .4, .14, .48, .12, .6]};
function touffes(a){
  if(a.touffes) return a.touffes;
  var r = graine(a.g), F = FORMES[a.sorte] || FORMES.feuillu, n = a.sorte === 'sapin' || a.sorte === 'pin' ? 0 : F[0] + Math.floor(r() * F[1]), T = [], q;
  for(q = 0; q < n; q++){ var an = q / n * TAU + r() * .5, d = a.r * (F[2] + r() * F[3]); T.push([a.x + Math.cos(an) * d, a.y + Math.sin(an) * d, a.r * (F[4] + r() * F[5])]); }
  T.push([a.x, a.y, a.r * (a.sorte === 'sapin' ? .95 : F[6])]);
  a.touffes = T; return T;
}
function dessinerArbre(x, a, L){
  var r = graine(a.g + 7), T = touffes(a), sx = -L.ombre.x, sy = -L.ombre.y, n = Math.hypot(sx, sy) || 1, q;
  sx /= n; sy /= n;
  if(a.sorte === 'pin'){
    /* un pin : quatre à six bouquets d'aiguilles, bleu-vert sombre, chacun en étoile ; on devine les branches entre eux */
    var nb = 4 + Math.floor(r() * 3), B = [], k2;
    for(k2 = 0; k2 < nb; k2++){ var ab = k2 / nb * TAU + r() * .6, db = a.r * (.3 + r() * .28); B.push([a.x + Math.cos(ab) * db, a.y + Math.sin(ab) * db, a.r * (.34 + r() * .14)]); }
    B.push([a.x, a.y, a.r * .42]);
    x.strokeStyle = '#4a3420'; x.lineWidth = 1.4; x.lineCap = 'round'; x.beginPath(); B.forEach(function(b){ x.moveTo(a.x, a.y); x.lineTo(b[0], b[1]); }); x.stroke();
    B.forEach(function(b){
      x.fillStyle = '#1d3b30'; x.strokeStyle = K; x.lineWidth = 1.3; x.beginPath();
      for(var k3 = 0; k3 < 18; k3++){ var a3 = k3 / 18 * TAU, rr3 = b[2] * (k3 % 2 ? .78 : 1); x.lineTo(b[0] + Math.cos(a3) * rr3, b[1] + Math.sin(a3) * rr3); }
      x.closePath(); x.fill(); x.stroke();
      x.strokeStyle = '#3a6a52'; x.lineWidth = .7; x.beginPath();
      for(k3 = 0; k3 < 14; k3++){ var a4 = k3 / 14 * TAU + r() * .2; x.moveTo(b[0] + sx * 1.2 + Math.cos(a4) * b[2] * .2, b[1] + sy * 1.2 + Math.sin(a4) * b[2] * .2); x.lineTo(b[0] + sx * 1.2 + Math.cos(a4) * b[2] * .85, b[1] + sy * 1.2 + Math.sin(a4) * b[2] * .85); }
      x.stroke();
      x.fillStyle = '#5a8a6a'; rond(x, b[0] + sx * b[2] * .3, b[1] + sy * b[2] * .3, b[2] * .18); x.fill();
    });
    return;
  }
  if(a.sorte === 'sapin'){
    /* un sapin : une étoile de branches, du plus sombre au plus clair */
    /* un sapin vu d'en haut : une boule d'aiguilles, des rayons de branches, plus clair vers le soleil et vers la pointe */
    var R = a.r * .95, an;
    x.fillStyle = '#21462f'; x.strokeStyle = K; x.lineWidth = 1.6; x.beginPath();
    for(q = 0; q < 32; q++){ an = q / 32 * TAU; var rr2 = R * (q % 2 ? .9 : 1); x.lineTo(a.x + Math.cos(an) * rr2, a.y + Math.sin(an) * rr2); }
    x.closePath(); x.fill(); x.stroke();
    [['#2c5a3c', .78, 1.2], ['#3a6e4a', .55, 2.4], ['#4f8a5a', .3, 3.4]].forEach(function(c){
      x.strokeStyle = c[0]; x.lineWidth = .9; x.lineCap = 'round'; x.beginPath();
      for(var k = 0; k < 26; k++){ var aa = k / 26 * TAU + r() * .2, r0 = R * c[1] * .35, r1 = R * c[1]; x.moveTo(a.x + sx * c[2] + Math.cos(aa) * r0, a.y + sy * c[2] + Math.sin(aa) * r0); x.lineTo(a.x + sx * c[2] + Math.cos(aa) * r1, a.y + sy * c[2] + Math.sin(aa) * r1); }
      x.stroke(); x.fillStyle = c[0]; rond(x, a.x + sx * c[2], a.y + sy * c[2], R * c[1] * .42); x.fill();
    });
    x.fillStyle = '#6aa070'; rond(x, a.x + sx * 4, a.y + sy * 4, R * .1); x.fill();
    return;
  }
  var P = FEUILLAGES[a.sorte] || FEUILLAGES.feuillu, fonce = P[0], moyen = P[1], clair = P[2], petit = a.sorte === 'buisson';
  x.strokeStyle = K; x.lineWidth = petit ? 1.5 : 2.1; T.forEach(function(t){ rond(x, t[0], t[1], t[2]); x.stroke(); });
  x.fillStyle = fonce; T.forEach(function(t){ rond(x, t[0], t[1], t[2]); x.fill(); });
  x.fillStyle = moyen; T.forEach(function(t){ rond(x, t[0] + sx * t[2] * .16, t[1] + sy * t[2] * .16, t[2] * .8); x.fill(); });
  x.fillStyle = clair; T.forEach(function(t){ rond(x, t[0] + sx * t[2] * .34, t[1] + sy * t[2] * .34, t[2] * .44); x.fill(); });
  var nd = Math.round(a.r * (petit ? .8 : .7));
  x.fillStyle = 'rgba(16,44,22,.32)'; for(q = 0; q < nd; q++){ var ar = r() * TAU, ad = r() * a.r * .85; rond(x, a.x + Math.cos(ar) * ad, a.y + Math.sin(ar) * ad, .6 + r() * .7); x.fill(); }
  x.fillStyle = 'rgba(190,232,150,.42)'; for(q = 0; q < nd * .7; q++){ ar = r() * TAU; ad = r() * a.r * .7; rond(x, a.x + sx * a.r * .3 + Math.cos(ar) * ad * .6, a.y + sy * a.r * .3 + Math.sin(ar) * ad * .6, .4 + r() * .5); x.fill(); }
  /* le chêne : des feuilles lobées qui dépassent du bord ; le bouleau : un feuillage léger, on voit le sol entre les touffes */
  if(a.sorte === 'chene'){ x.fillStyle = clair; for(q = 0; q < 10; q++){ ar = r() * TAU; ad = a.r * (.55 + r() * .3); ovale(x, a.x + Math.cos(ar) * ad, a.y + Math.sin(ar) * ad, 1.6, 1, ar); x.fill(); } }
  if(a.sorte === 'bouleau'){ x.fillStyle = 'rgba(240,236,200,.5)'; for(q = 0; q < 14; q++){ ar = r() * TAU; ad = r() * a.r * .8; rond(x, a.x + Math.cos(ar) * ad, a.y + Math.sin(ar) * ad, .45); x.fill(); } }
  if(a.fruits){ x.fillStyle = a.fruits; for(q = 0; q < 9; q++){ ar = r() * TAU; ad = r() * a.r * .8; rond(x, a.x + Math.cos(ar) * ad, a.y + Math.sin(ar) * ad, .95); x.fill(); } }
  if(a.baies){ x.fillStyle = a.baies; for(q = 0; q < 7; q++){ ar = r() * TAU; ad = r() * a.r * .75; rond(x, a.x + Math.cos(ar) * ad, a.y + Math.sin(ar) * ad, .8); x.fill(); } }
}
/* un muret ou une haie, le long d'un côté qui donne sur la rue (on le voit entre deux maisons) */
function dessinerBord(x, b){
  var r = graine(b.g), L2 = Math.hypot(b.x2 - b.x1, b.y2 - b.y1), off = b.d * -2.6, q;
  var X1 = b.x1 + (b.h ? 0 : off), Y1 = b.y1 + (b.h ? off : 0), X2 = b.x2 + (b.h ? 0 : off), Y2 = b.y2 + (b.h ? off : 0);
  if(b.sorte === 'haie'){
    x.strokeStyle = K; x.lineWidth = 6.4; x.lineCap = 'round'; x.beginPath(); x.moveTo(X1, Y1); x.lineTo(X2, Y2); x.stroke();
    x.strokeStyle = '#3a7a42'; x.lineWidth = 4.4; x.stroke();
    x.fillStyle = '#5a9e58'; for(q = 0; q < L2 / 3; q++){ var u = q * 3 / L2; rond(x, lerp(X1, X2, u) + (r() - .5), lerp(Y1, Y2, u) + (r() - .5), .9 + r() * .7); x.fill(); }
  } else {
    x.strokeStyle = '#5f5448'; x.lineWidth = 4.2; x.lineCap = 'butt'; x.beginPath(); x.moveTo(X1, Y1); x.lineTo(X2, Y2); x.stroke();
    x.strokeStyle = '#a89a86'; x.lineWidth = 3; x.stroke();
    x.strokeStyle = 'rgba(70,58,46,.55)'; x.lineWidth = .4; x.beginPath();
    for(q = 0; q < L2 / 4.4; q++){ var u2 = (q * 4.4 + r() * 1.4) / L2; var mx = lerp(X1, X2, u2), my = lerp(Y1, Y2, u2); if(b.h){ x.moveTo(mx, my - 1.4); x.lineTo(mx, my + 1.4); } else { x.moveTo(mx - 1.4, my); x.lineTo(mx + 1.4, my); } }
    x.stroke();
  }
}
/* les choses des cours, des jardins, et les obstacles de la rue */
function dessinerObjet(x, o, L){
  var r = graine(o.g), q, X = o.x, Y = o.y, W = o.w, H = o.h, cx = X + W / 2, cy = Y + H / 2, i;
  x.lineJoin = 'round';
  switch(o.type){
    case 'caisses':
      var n = W * H > 500 ? 3 : 2, cs = Math.min(W, H) * .62;
      for(q = 0; q < n; q++){
        var px = X + (W - cs) * (n === 1 ? .5 : q / (n - 1)) + (r() - .5) * 2, py = Y + (H - cs) * (q % 2 ? .1 : .9) + (r() - .5) * 2, ag = (r() - .5) * .3;
        x.save(); x.translate(px + cs / 2, py + cs / 2); x.rotate(ag);
        x.fillStyle = '#b88a52'; x.strokeStyle = K; x.lineWidth = 1.3; x.fillRect(-cs / 2, -cs / 2, cs, cs); x.strokeRect(-cs / 2, -cs / 2, cs, cs);
        x.strokeStyle = '#7a5530'; x.lineWidth = .6; x.beginPath(); for(i = 1; i < 4; i++){ x.moveTo(-cs / 2, -cs / 2 + cs * i / 4); x.lineTo(cs / 2, -cs / 2 + cs * i / 4); } x.stroke();
        x.strokeStyle = '#8f6534'; x.lineWidth = 1.6; x.beginPath(); x.moveTo(-cs / 2 + 1, -cs / 2 + 1); x.lineTo(cs / 2 - 1, cs / 2 - 1); x.stroke();
        x.fillStyle = 'rgba(255,240,210,.18)'; x.fillRect(-cs / 2, -cs / 2, cs, 1.4);
        x.restore();
      }
      break;
    case 'tonneaux':
      var nt = W * H > 450 ? 3 : 2, tr = Math.min(W, H) * .3;
      for(q = 0; q < nt; q++){
        var tx = X + tr + (W - 2 * tr) * (nt === 1 ? .5 : q / (nt - 1)), ty = Y + tr + (H - 2 * tr) * (q % 2 ? .15 : .85);
        x.fillStyle = '#8a5a30'; x.strokeStyle = K; x.lineWidth = 1.3; rond(x, tx, ty, tr); x.fill(); x.stroke();
        x.strokeStyle = '#3c3434'; x.lineWidth = 1.1; rond(x, tx, ty, tr * .78); x.stroke();
        x.fillStyle = '#a7743e'; rond(x, tx, ty, tr * .66); x.fill();
        x.strokeStyle = 'rgba(70,40,20,.5)'; x.lineWidth = .45; x.beginPath(); for(i = -2; i <= 2; i++){ x.moveTo(tx + i * tr * .22, ty - tr * .6); x.lineTo(tx + i * tr * .22, ty + tr * .6); } x.stroke();
        x.fillStyle = 'rgba(255,230,190,.2)'; ovale(x, tx - tr * .25, ty - tr * .3, tr * .3, tr * .16, -.5); x.fill();
      }
      break;
    case 'charrette':
      x.save(); x.translate(cx, cy); if(o.sens === 'v') x.rotate(PI / 2);
      var cw = o.sens === 'v' ? H : W, ch = o.sens === 'v' ? W : H;
      x.strokeStyle = K; x.lineWidth = 1.6; x.lineCap = 'round';
      x.beginPath(); x.moveTo(cw * .3, -ch * .22); x.lineTo(cw * .62, -ch * .14); x.moveTo(cw * .3, ch * .22); x.lineTo(cw * .62, ch * .14); x.stroke();   /* les brancards */
      x.fillStyle = '#3a2c20'; x.fillRect(-cw * .12, -ch / 2, cw * .2, 3); x.fillRect(-cw * .12, ch / 2 - 3, cw * .2, 3);                                   /* les roues, de côté */
      x.fillStyle = '#a77a48'; x.fillRect(-cw / 2 + 2, -ch / 2 + 3, cw * .8, ch - 6); x.strokeRect(-cw / 2 + 2, -ch / 2 + 3, cw * .8, ch - 6);
      x.strokeStyle = '#6f4d2a'; x.lineWidth = .6; x.beginPath(); for(i = 1; i < 5; i++){ var lx2 = -cw / 2 + 2 + cw * .8 * i / 5; x.moveTo(lx2, -ch / 2 + 3); x.lineTo(lx2, ch / 2 - 3); } x.stroke();
      x.fillStyle = '#e8d6a4'; ovale(x, -cw * .1, 0, cw * .2, ch * .22, 0); x.fill(); x.fillStyle = '#c9a85e'; ovale(x, cw * .1, -ch * .08, cw * .12, ch * .16, .4); x.fill();
      x.restore();
      break;
    case 'sacs':
      var ns = 3;
      for(q = 0; q < ns; q++){
        var sxp = X + W * (.2 + .3 * q) + (r() - .5) * 2, syp = cy + (r() - .5) * H * .3, sa = r() * PI;
        x.fillStyle = '#d8c69c'; x.strokeStyle = K; x.lineWidth = 1.2; ovale(x, sxp, syp, W * .2, H * .38, sa); x.fill(); x.stroke();
        x.strokeStyle = '#a08a5c'; x.lineWidth = .7; x.beginPath(); x.moveTo(sxp - Math.cos(sa) * W * .1, syp - Math.sin(sa) * W * .1); x.lineTo(sxp + Math.cos(sa) * W * .1, syp + Math.sin(sa) * W * .1); x.stroke();
        x.fillStyle = 'rgba(255,255,255,.2)'; ovale(x, sxp - 1, syp - 1, W * .08, H * .12, sa); x.fill();
      }
      break;
    case 'bois':
      /* un tas de bûches : on voit leurs bouts ronds, avec les cernes */
      var nb2 = Math.max(4, Math.round(W * H / 40));
      for(q = 0; q < nb2; q++){
        var bx = X + 2.4 + r() * (W - 4.8), by = Y + 2.4 + r() * (H - 4.8), br = 2 + r() * 1.3;
        x.fillStyle = '#7a5232'; x.strokeStyle = K; x.lineWidth = .8; rond(x, bx, by, br); x.fill(); x.stroke();
        x.fillStyle = '#d2a873'; rond(x, bx, by, br * .72); x.fill(); x.strokeStyle = 'rgba(120,80,40,.6)'; x.lineWidth = .3; rond(x, bx, by, br * .4); x.stroke();
      }
      break;
    case 'paniers':
      for(q = 0; q < 2; q++){
        var pxx = X + W * (.28 + .44 * q), pyy = cy, pr = Math.min(W * .22, H * .46);
        x.fillStyle = '#b8864a'; x.strokeStyle = K; x.lineWidth = 1.1; rond(x, pxx, pyy, pr); x.fill(); x.stroke();
        x.strokeStyle = '#8a6030'; x.lineWidth = .5; rond(x, pxx, pyy, pr * .75); x.stroke();
        var fr = U.choix ? (q ? '#d83b3b' : '#e8a23a') : '#d83b3b';
        x.fillStyle = fr; for(i = 0; i < 6; i++){ var aa = i * 1.05 + r(); rond(x, pxx + Math.cos(aa) * pr * .4, pyy + Math.sin(aa) * pr * .4, pr * .26); x.fill(); }
      }
      break;
    case 'puits':
      x.fillStyle = '#8f8a80'; x.strokeStyle = K; x.lineWidth = 1.4; rond(x, cx, cy, W / 2); x.fill(); x.stroke();
      x.strokeStyle = 'rgba(60,54,46,.6)'; x.lineWidth = .5; x.beginPath(); for(q = 0; q < 10; q++){ var a3 = q / 10 * TAU; x.moveTo(cx + Math.cos(a3) * W * .32, cy + Math.sin(a3) * W * .32); x.lineTo(cx + Math.cos(a3) * W * .5, cy + Math.sin(a3) * W * .5); } x.stroke();
      x.fillStyle = '#18202e'; rond(x, cx, cy, W * .3); x.fill(); x.fillStyle = 'rgba(120,150,200,.25)'; ovale(x, cx - 1, cy - 1, W * .12, W * .06, -.4); x.fill();
      x.strokeStyle = '#6a4a2e'; x.lineWidth = 1.8; x.beginPath(); x.moveTo(cx - W * .55, cy); x.lineTo(cx + W * .55, cy); x.stroke();
      break;
    case 'banc':
      x.fillStyle = '#9a6a3e'; x.strokeStyle = K; x.lineWidth = 1.1; x.fillRect(X, Y, W, H); x.strokeRect(X, Y, W, H);
      x.strokeStyle = '#6f4a28'; x.lineWidth = .4; x.beginPath(); if(W > H){ x.moveTo(X, cy); x.lineTo(X + W, cy); } else { x.moveTo(cx, Y); x.lineTo(cx, Y + H); } x.stroke();
      break;
    case 'meule':
      x.fillStyle = '#d6b35a'; x.strokeStyle = K; x.lineWidth = 1.4; rond(x, cx, cy, W / 2); x.fill(); x.stroke();
      x.strokeStyle = 'rgba(150,110,40,.55)'; x.lineWidth = .45; x.beginPath(); for(q = 0; q < 26; q++){ var a4 = r() * TAU, d4 = r() * W * .45; x.moveTo(cx + Math.cos(a4) * d4, cy + Math.sin(a4) * d4); x.lineTo(cx + Math.cos(a4 + .3) * (d4 + 2), cy + Math.sin(a4 + .3) * (d4 + 2)); } x.stroke();
      x.fillStyle = 'rgba(255,240,180,.3)'; rond(x, cx - W * .12, cy - W * .12, W * .2); x.fill();
      break;
    case 'ruches':
      for(q = 0; q < 3; q++){ var rx2 = X + W * (q + .5) / 3, ry2 = cy; x.fillStyle = '#e2c06a'; x.strokeStyle = K; x.lineWidth = 1; rond(x, rx2, ry2, Math.min(W / 7, H / 2)); x.fill(); x.stroke(); x.strokeStyle = '#b08a3a'; x.lineWidth = .4; rond(x, rx2, ry2, Math.min(W / 7, H / 2) * .6); x.stroke(); }
      break;
    case 'etal':
      /* un petit étal : sa toile rayée */
      x.save(); x.translate(cx, cy); if(o.sens === 'v') x.rotate(PI / 2);
      var ew = o.sens === 'v' ? H : W, eh = o.sens === 'v' ? W : H, coul = ['#c94b4b', '#4f7ec4', '#3f9a62', '#d8963a'][Math.floor(r() * 4)];   /* (r : le même dessin dans deux morceaux voisins) */
      x.fillStyle = '#f4eee0'; x.fillRect(-ew / 2, -eh / 2, ew, eh);
      x.fillStyle = coul; for(q = 0; q < 6; q += 2) x.fillRect(-ew / 2 + ew * q / 6, -eh / 2, ew / 6, eh);
      x.fillStyle = 'rgba(0,0,0,.14)'; x.fillRect(-ew / 2, 0, ew, eh / 2);
      x.strokeStyle = K; x.lineWidth = 1.2; x.strokeRect(-ew / 2, -eh / 2, ew, eh);
      x.beginPath(); x.moveTo(-ew / 2, 0); x.lineTo(ew / 2, 0); x.lineWidth = .7; x.stroke();
      x.restore();
      break;
    case 'linge':
      x.strokeStyle = '#5a4a3a'; x.lineWidth = .5; x.beginPath(); if(W > H){ x.moveTo(X, cy); x.lineTo(X + W, cy); } else { x.moveTo(cx, Y); x.lineTo(cx, Y + H); } x.stroke();
      for(q = 0; q < 4; q++){ x.fillStyle = ['#e8e2d4', '#c94b4b', '#4f7ec4', '#e3b84a'][Math.floor(r() * 4)]; var u5 = (q + .5) / 4; if(W > H) x.fillRect(X + W * u5 - 3, cy - .6, 6, 4.6); else x.fillRect(cx - .6, Y + H * u5 - 3, 4.6, 6); }
      break;
    /* ---- la forêt ---- */
    case 'tronc':
      /* un arbre couché : l'écorce en long, des nœuds, de la mousse sur le dos, un bout cassé (les cernes), des champignons */
      x.save(); x.translate(cx, cy); if(H > W) x.rotate(PI / 2);
      var tl = Math.max(W, H), te = Math.min(W, H);
      x.fillStyle = '#6a4a2e'; x.strokeStyle = K; x.lineWidth = 1.5; x.beginPath(); rr(x, -tl / 2, -te / 2, tl, te, te / 2); x.fill(); x.stroke();
      x.fillStyle = 'rgba(255,230,190,.14)'; x.beginPath(); rr(x, -tl / 2 + 2, -te / 2 + 1, tl - 4, te * .38, te * .2); x.fill();
      x.strokeStyle = 'rgba(40,24,12,.5)'; x.lineWidth = .5; x.beginPath(); for(q = 0; q < 7; q++){ var ty2 = -te / 2 + 1.5 + r() * (te - 3); x.moveTo(-tl / 2 + 3 + r() * 6, ty2); x.lineTo(tl / 2 - 4 - r() * 8, ty2 + (r() - .5) * 1.2); } x.stroke();
      x.fillStyle = 'rgba(96,140,56,.75)'; for(q = 0; q < 6; q++){ ovale(x, -tl / 2 + 6 + r() * (tl - 12), -te * .18 + (r() - .5) * 2, 2 + r() * 3.5, 1.2 + r() * 1.2, 0); x.fill(); }
      x.fillStyle = '#c8a878'; x.strokeStyle = K; x.lineWidth = 1.1; ovale(x, tl / 2 - 1, 0, 2.6, te / 2 - .4, 0); x.fill(); x.stroke();
      x.strokeStyle = '#8a6a44'; x.lineWidth = .4; ovale(x, tl / 2 - 1, 0, 1.5, te / 2 - 2, 0); x.stroke(); ovale(x, tl / 2 - 1, 0, .7, te / 4, 0); x.stroke();
      for(q = 0; q < 3; q++){ var mxp = -tl / 2 + 8 + r() * (tl - 18); x.fillStyle = '#e8d8b8'; x.strokeStyle = K; x.lineWidth = .6; ovale(x, mxp, te / 2 + .4, 1.8, 1.2, 0); x.fill(); x.stroke(); }
      x.restore();
      break;
    case 'rocher': case 'rochers':
      /* un ou deux gros rochers : la pierre grise, son côté éclairé, une fente, de la mousse sur le dessus */
      var nr = o.type === 'rochers' ? 2 : 1;
      for(q = 0; q < nr; q++){
        var rcx = nr === 1 ? cx : X + W * (.3 + .4 * q), rcy = nr === 1 ? cy : Y + H * (q ? .62 : .38), rw = nr === 1 ? W / 2 : W * .3, rh = nr === 1 ? H / 2 : H * .32;
        x.fillStyle = '#8a8a86'; x.strokeStyle = K; x.lineWidth = 1.4; x.beginPath();
        for(var k5 = 0; k5 < 9; k5++){ var ak = k5 / 9 * TAU, rk = .84 + r() * .2; x.lineTo(rcx + Math.cos(ak) * rw * rk, rcy + Math.sin(ak) * rh * rk); }
        x.closePath(); x.fill(); x.stroke();
        x.fillStyle = 'rgba(230,230,220,.3)'; ovale(x, rcx - L.ombre.x * rw * .25, rcy - L.ombre.y * rh * .25, rw * .55, rh * .45, 0); x.fill();
        x.strokeStyle = 'rgba(40,40,40,.4)'; x.lineWidth = .5; x.beginPath(); x.moveTo(rcx - rw * .3, rcy - rh * .5); x.lineTo(rcx, rcy); x.lineTo(rcx + rw * .1, rcy + rh * .5); x.stroke();
        x.fillStyle = 'rgba(86,130,52,.7)'; for(k5 = 0; k5 < 4; k5++){ ovale(x, rcx + (r() - .5) * rw, rcy - rh * .3 + (r() - .5) * rh * .5, 1.5 + r() * 2.5, 1 + r() * 1.5, r() * 3); x.fill(); }
      }
      break;
    case 'souche':
      /* une souche : les racines qui s'étalent, l'écorce, les cernes du dessus, un peu de mousse */
      x.strokeStyle = K; x.lineWidth = 3.2; x.lineCap = 'round'; x.beginPath();
      for(q = 0; q < 5; q++){ var ar2 = q / 5 * TAU + r(); x.moveTo(cx, cy); x.lineTo(cx + Math.cos(ar2) * W * .62, cy + Math.sin(ar2) * W * .62); } x.stroke();
      x.strokeStyle = '#5a3e24'; x.lineWidth = 1.8; x.stroke();
      x.fillStyle = '#5a3e24'; x.strokeStyle = K; x.lineWidth = 1.4; rond(x, cx, cy, W * .42); x.fill(); x.stroke();
      x.fillStyle = '#c8a476'; rond(x, cx, cy, W * .32); x.fill();
      x.strokeStyle = '#8a6a44'; x.lineWidth = .4; for(q = 1; q < 4; q++){ rond(x, cx + .3, cy + .2, W * .08 * q); x.stroke(); }
      x.fillStyle = 'rgba(86,130,52,.7)'; ovale(x, cx - W * .3, cy + W * .2, 2.2, 1.4, .5); x.fill();
      break;
    case 'branches':
      /* un tas de branches mortes */
      x.lineCap = 'round';
      for(q = 0; q < 7; q++){
        var b0x = X + r() * W, b0y = Y + r() * H, ba = (o.sens === 'v' ? PI / 2 : 0) + (r() - .5) * .9, bl2 = Math.max(W, H) * (.4 + r() * .4);
        x.strokeStyle = K; x.lineWidth = 2.6; x.beginPath(); x.moveTo(b0x - Math.cos(ba) * bl2 / 2, b0y - Math.sin(ba) * bl2 / 2); x.lineTo(b0x + Math.cos(ba) * bl2 / 2, b0y + Math.sin(ba) * bl2 / 2); x.stroke();
        x.strokeStyle = q % 2 ? '#7a5a36' : '#8e6a40'; x.lineWidth = 1.5; x.stroke();
        x.strokeStyle = '#6a4a2e'; x.lineWidth = .7; x.beginPath(); x.moveTo(b0x, b0y); x.lineTo(b0x + Math.cos(ba + .7) * 4, b0y + Math.sin(ba + .7) * 4); x.stroke();
      }
      break;
  }
}
function dessinerSol(x, o){
  var r = graine(o.g), q, X = o.x, Y = o.y, W = o.w, H = o.h;
  if(o.type === 'potager'){
    x.fillStyle = '#6e5236'; x.strokeStyle = 'rgba(40,26,16,.6)'; x.lineWidth = 1; x.beginPath(); rr(x, X, Y, W, H, 2); x.fill(); x.stroke();
    var rangs = Math.max(2, Math.floor((o.sens === 'h' ? H : W) / 6)), cou = ['#6fbf5a', '#8fcf64', '#e07a3a'][Math.floor(r() * 3)];
    for(q = 0; q < rangs; q++){
      var f = (q + .5) / rangs;
      x.strokeStyle = 'rgba(40,26,16,.4)'; x.lineWidth = 1.6; x.beginPath(); if(o.sens === 'h'){ x.moveTo(X + 2, Y + H * f); x.lineTo(X + W - 2, Y + H * f); } else { x.moveTo(X + W * f, Y + 2); x.lineTo(X + W * f, Y + H - 2); } x.stroke();
      for(var u = 4; u < (o.sens === 'h' ? W : H) - 3; u += 4.4){
        var px = o.sens === 'h' ? X + u : X + W * f, py = o.sens === 'h' ? Y + H * f : Y + u;
        x.fillStyle = q % 2 ? '#5aa84c' : cou; rond(x, px, py, 1.6 + r() * .5); x.fill(); x.fillStyle = 'rgba(200,240,160,.4)'; rond(x, px - .4, py - .4, .6); x.fill();
      }
    }
  } else if(o.type === 'fleurs'){
    /* un massif de fleurs */
    x.fillStyle = '#5e7a3e'; x.beginPath(); rr(x, X, Y, W, H, 3); x.fill();
    var C = ['#e84a6a', '#f2d04a', '#f6f1e4', '#b96ad8', '#f08a3a', '#6aa0e8'];
    for(q = 0; q < W * H / 9; q++){ x.fillStyle = C[Math.floor(r() * C.length)]; rond(x, X + 1.5 + r() * (W - 3), Y + 1.5 + r() * (H - 3), .9 + r() * .7); x.fill(); }
  } else if(o.type === 'fougere'){
    /* une fougère vue d'en haut : des frondes en étoile, chacune avec ses folioles */
    var nf = 5 + Math.floor(r() * 3);
    for(q = 0; q < nf; q++){
      var fa = o.a + q / nf * TAU + (r() - .5) * .4, fl = o.r * (.75 + r() * .3), ex = o.cx + Math.cos(fa) * fl, ey = o.cy + Math.sin(fa) * fl;
      x.strokeStyle = '#2a4a22'; x.lineWidth = .7; x.beginPath(); x.moveTo(o.cx, o.cy); x.lineTo(ex, ey); x.stroke();
      x.fillStyle = q % 2 ? '#4f8a3a' : '#5e9a44';
      for(var u2 = .18; u2 < .95; u2 += .14){ var px2 = o.cx + Math.cos(fa) * fl * u2, py2 = o.cy + Math.sin(fa) * fl * u2, lg2 = (1 - u2) * 3 + .8;
        ovale(x, px2 + Math.cos(fa + PI / 2) * lg2 * .8, py2 + Math.sin(fa + PI / 2) * lg2 * .8, lg2, .7, fa + PI / 2.6); x.fill();
        ovale(x, px2 - Math.cos(fa + PI / 2) * lg2 * .8, py2 - Math.sin(fa + PI / 2) * lg2 * .8, lg2, .7, fa - PI / 2.6); x.fill(); }
    }
    x.fillStyle = '#7ab45a'; rond(x, o.cx, o.cy, 1.2); x.fill();
  } else if(o.type === 'mousse'){
    var gm = x.createRadialGradient(o.cx, o.cy, 0, o.cx, o.cy, o.r); gm.addColorStop(0, 'rgba(104,150,60,.55)'); gm.addColorStop(1, 'rgba(104,150,60,0)');
    x.fillStyle = gm; rond(x, o.cx, o.cy, o.r); x.fill();
    x.fillStyle = 'rgba(150,196,90,.5)'; for(q = 0; q < o.r * 1.5; q++){ var ma = r() * TAU, md = r() * o.r * .8; rond(x, o.cx + Math.cos(ma) * md, o.cy + Math.sin(ma) * md, .5 + r() * .5); x.fill(); }
  } else if(o.type === 'champis'){
    /* trois à six champignons : des rouges à pois blancs, ou des bruns */
    var rouge = r() < .4, nc2 = 3 + Math.floor(r() * 4);
    for(q = 0; q < nc2; q++){ var ca = r() * TAU, cd2 = r() * 4.5, cr2 = 1.4 + r() * 1.3, ccx = o.cx + Math.cos(ca) * cd2, ccy = o.cy + Math.sin(ca) * cd2;
      x.fillStyle = 'rgba(16,22,40,.3)'; rond(x, ccx + .7, ccy + .8, cr2); x.fill();
      x.fillStyle = rouge ? '#c8302a' : '#9a6a3a'; x.strokeStyle = K; x.lineWidth = .6; rond(x, ccx, ccy, cr2); x.fill(); x.stroke();
      x.fillStyle = rouge ? '#fff4e8' : 'rgba(240,210,160,.6)'; rond(x, ccx - cr2 * .3, ccy - cr2 * .3, cr2 * .26); x.fill(); if(rouge){ rond(x, ccx + cr2 * .35, ccy + cr2 * .1, cr2 * .2); x.fill(); } }
  } else if(o.type === 'fleursF'){
    /* des fleurs des bois : des jacinthes bleues, des anémones blanches, quelques primevères jaunes */
    var cf = ['#7a7ae0', '#f4f0ea', '#f2d04a', '#9a6ad8'][Math.floor(r() * 4)];
    for(q = 0; q < o.r * 1.4; q++){ var fa2 = r() * TAU, fd2 = r() * o.r * .9, fx3 = o.cx + Math.cos(fa2) * fd2, fy3 = o.cy + Math.sin(fa2) * fd2;
      x.fillStyle = '#4a7a36'; ovale(x, fx3 + .6, fy3 + .6, 1.1, .5, fa2); x.fill(); x.fillStyle = cf; rond(x, fx3, fy3, .75); x.fill(); }
  } else if(o.type === 'feuilles'){
    /* un tas de feuilles mortes poussées par le vent */
    var FC = ['#9a6a2a', '#b8862e', '#8a3a20', '#c89a3a', '#6a4a24'];
    for(q = 0; q < o.r * 2.2; q++){ var la = r() * TAU, ld = Math.sqrt(r()) * o.r, lx4 = o.cx + Math.cos(la) * ld, ly4 = o.cy + Math.sin(la) * ld;
      x.fillStyle = FC[Math.floor(r() * FC.length)]; ovale(x, lx4, ly4, 1.6, .85, r() * PI); x.fill(); }
  }
}
/* une flaque, de la boue, de la farine EN TRAVERS de la rue (15 novembre, 14 h 26), ou le gué du ruisseau : dessinée dans son repère
   (lx le long de la rue, ly en travers), coupée au bord de la rue */
function contourLocal(x, T, g){
  var N = T.m.length, P = [];
  for(var i = 0; i < N; i++){ var a = TAU * i / N; P.push([Math.cos(a) * (T.rx + g) * T.m[i], Math.sin(a) * (T.ry + g) * T.m[i]]); }
  x.beginPath(); x.moveTo((P[N - 1][0] + P[0][0]) / 2, (P[N - 1][1] + P[0][1]) / 2);
  for(i = 0; i < N; i++){ var b = P[(i + 1) % N]; x.quadraticCurveTo(P[i][0], P[i][1], (P[i][0] + b[0]) / 2, (P[i][1] + b[1]) / 2); }
  x.closePath();
}
function dessinerTacheTravers(x, T, L, rues){
  var r = graine(T.g), q, rx = T.rx, ry = T.ry;
  x.save(); x.beginPath(); rues.forEach(function(R2){ if(Math.abs(R2.x + R2.w / 2 - T.x) < R2.w / 2 + ry && Math.abs(R2.y + R2.h / 2 - T.y) < R2.h / 2 + ry) x.rect(R2.x, R2.y, R2.w, R2.h); }); x.clip();
  x.translate(T.x, T.y); x.rotate(T.rot);
  if(T.type === 'flaque' || T.type === 'ruisseau'){
    var eauB = T.foret ? (T.type === 'ruisseau' ? '#4a6a7a' : '#5a5440') : null;
    /* le sol mouillé autour (plus sombre), puis l'eau : le ciel qui s'y reflète (en ville), une eau brune (dans les bois), le ruisseau bleu-vert */
    contourLocal(x, T, 7); x.fillStyle = 'rgba(30,22,16,.2)'; x.fill();
    contourLocal(x, T, 3); x.fillStyle = 'rgba(30,22,16,.22)'; x.fill();
    contourLocal(x, T, 0);
    var gr = x.createLinearGradient(-rx, -ry, rx, ry);
    if(T.type === 'ruisseau'){ gr.addColorStop(0, mix(L.ciel, '#3a6a6a', .55)); gr.addColorStop(1, mix(L.cielB, '#24464a', .5)); }
    else if(T.foret){ gr.addColorStop(0, mix(L.ciel, eauB, .6)); gr.addColorStop(1, mix(L.cielB, '#3a3424', .6)); }
    else { gr.addColorStop(0, L.ciel); gr.addColorStop(1, L.cielB); }
    x.fillStyle = gr; x.globalAlpha = .92; x.fill(); x.globalAlpha = 1;
    x.strokeStyle = 'rgba(30,26,30,.35)'; x.lineWidth = 1.1; x.stroke();
    x.save(); contourLocal(x, T, -1); x.clip();
    /* le fond qu'on devine sous l'eau : les pavés (en ville), des cailloux (dans les bois) */
    if(T.foret){ for(q = 0; q < 18; q++){ x.fillStyle = r() < .5 ? 'rgba(40,36,26,.3)' : 'rgba(150,140,110,.22)'; ovale(x, (r() - .5) * rx * 1.8, (r() - .5) * ry * 1.8, .8 + r() * 1.6, .6 + r(), r() * 3); x.fill(); } }
    else { x.strokeStyle = 'rgba(40,50,70,.18)'; x.lineWidth = .45; x.beginPath(); for(q = -10; q <= 10; q++){ x.moveTo(q * 6.4, -ry); x.lineTo(q * 6.4, ry); } x.stroke(); }
    /* des reflets du ciel (de petits traits couchés, comme le soleil sur l'eau, toujours dans le même sens à l'écran) ; le ruisseau,
       lui, coule : de petites rides */
    x.strokeStyle = L.reflet; x.lineWidth = .9; x.lineCap = 'round';
    var nR = Math.round(ry / 7);
    for(q = 0; q < nR; q++){ var py = -ry * .8 + ry * 1.6 * (q + r() * .5) / nR, px = (r() - .5) * rx * .9; x.beginPath();
      if(T.type === 'ruisseau'){ x.moveTo(px - 3, py); x.quadraticCurveTo(px, py - 1.6, px + 3, py); }
      else { var cr = Math.cos(-T.rot), sr = Math.sin(-T.rot), lg = 2.5 + r() * 5;   /* (dans le sens de l'écran : on défait la rotation) */
        x.moveTo(px - cr * lg, py - sr * lg); x.lineTo(px + cr * lg, py + sr * lg - .4); }
      x.stroke(); }
    x.restore();
    /* le gué : des pierres plates au bord de l'eau */
    if(T.type === 'ruisseau') for(q = 0; q < 6; q++){ var sy = -ry * .9 + r() * ry * 1.8, sxx = (r() < .5 ? -1 : 1) * (rx + .5 + r() * 2.5);
      x.fillStyle = '#8a867a'; x.strokeStyle = K; x.lineWidth = .7; ovale(x, sxx, sy, 2 + r() * 1.6, 1.4 + r(), r() * 3); x.fill(); x.stroke(); }
  } else if(T.type === 'boue'){
    contourLocal(x, T, 5); x.fillStyle = 'rgba(70,46,24,.28)'; x.fill();
    contourLocal(x, T, 0); x.fillStyle = T.foret ? '#5a3c20' : '#6a4826'; x.fill();
    x.save(); contourLocal(x, T, 0); x.clip();
    for(q = 0; q < ry * .5; q++){ x.fillStyle = r() < .5 ? 'rgba(40,24,10,.35)' : 'rgba(140,100,60,.3)'; ovale(x, (r() - .5) * rx * 1.7, (r() - .5) * ry * 1.7, 1.5 + r() * 4, 1 + r() * 2.6, r() * 3); x.fill(); }
    /* des ornières, des flaques d'eau dans la boue */
    x.fillStyle = 'rgba(120,130,140,.28)'; for(q = 0; q < 3; q++){ ovale(x, (r() - .5) * rx, (r() - .5) * ry * 1.2, 2 + r() * 3, 1 + r() * 1.6, r() * 3); x.fill(); }
    x.strokeStyle = 'rgba(255,240,220,.25)'; x.lineWidth = .7; x.lineCap = 'round'; for(q = 0; q < 6; q++){ var bx = (r() - .5) * rx, by = (r() - .5) * ry * 1.4; x.beginPath(); x.arc(bx, by, 2 + r() * 2, PI * 1.1, PI * 1.7); x.stroke(); }
    x.restore();
    contourLocal(x, T, 0); x.strokeStyle = 'rgba(40,24,10,.45)'; x.lineWidth = 1; x.stroke();
    x.fillStyle = T.foret ? '#5a3c20' : '#6a4826'; for(q = 0; q < 14; q++){ var ea = r() * TAU, ed = 1.05 + r() * .22; rond(x, Math.cos(ea) * rx * ed, Math.sin(ea) * ry * ed, .6 + r() * .8); x.fill(); }
  } else {
    /* de la farine renversée en travers de la rue, et le sac crevé au bord */
    contourLocal(x, T, 3); x.fillStyle = 'rgba(255,255,255,.3)'; x.fill();
    contourLocal(x, T, 0); x.fillStyle = '#f7f4ec'; x.fill();
    x.save(); contourLocal(x, T, 0); x.clip();
    for(q = 0; q < ry * 1.2; q++){ x.fillStyle = r() < .5 ? 'rgba(220,210,190,.4)' : 'rgba(255,255,255,.8)'; rond(x, (r() - .5) * rx * 2, (r() - .5) * ry * 2, .3 + r() * 1.4); x.fill(); }
    x.restore();
    x.fillStyle = 'rgba(255,255,255,.85)'; for(q = 0; q < 24; q++){ var fa = r() * TAU, fd = 1 + r() * .3; rond(x, Math.cos(fa) * rx * fd, Math.sin(fa) * ry * fd, .3 + r() * .6); x.fill(); }
    x.fillStyle = '#d8c69c'; x.strokeStyle = K; x.lineWidth = 1.1; ovale(x, rx * .5, -RUE / 2 + 7, 7, 5, .2); x.fill(); x.stroke();
    x.fillStyle = '#f7f4ec'; ovale(x, rx * .5, -RUE / 2 + 10.5, 3.4, 2.4, .2); x.fill();
  }
  x.restore();
}
/* une flaque, de la boue, de la farine (le dessin est coupé au bord de la rue) */
function dessinerTache(x, T, L, rues){
  if(T.travers){ dessinerTacheTravers(x, T, L, rues); return; }
  var r = graine(T.g), q;
  x.save(); x.beginPath(); rues.forEach(function(R2){ if(Math.abs(R2.x + R2.w / 2 - T.x) < R2.w / 2 + T.rx * 1.5 && Math.abs(R2.y + R2.h / 2 - T.y) < R2.h / 2 + T.rx * 1.5) x.rect(R2.x, R2.y, R2.w, R2.h); }); x.clip();
  if(T.type === 'flaque'){
    /* les pavés mouillés autour, puis l'eau qui reflète le ciel, ses bords plus sombres, des reflets */
    cheminForme(x, T, 5); x.fillStyle = 'rgba(40,30,22,.22)'; x.fill();
    cheminForme(x, T, 2); x.fillStyle = 'rgba(40,30,22,.2)'; x.fill();
    cheminForme(x, T, 0);
    var gr = x.createLinearGradient(T.x - T.rx, T.y - T.ry, T.x + T.rx, T.y + T.ry);
    gr.addColorStop(0, L.ciel); gr.addColorStop(1, L.cielB); x.fillStyle = gr; x.globalAlpha = .9; x.fill(); x.globalAlpha = 1;
    x.strokeStyle = 'rgba(30,26,30,.35)'; x.lineWidth = 1.1; x.stroke();
    x.save(); cheminForme(x, T, -1); x.clip();
    x.strokeStyle = L.reflet; x.lineWidth = .9; x.lineCap = 'round';
    for(q = 0; q < 4; q++){ var ry = T.y - T.ry * .5 + T.ry * q * .32, rx = T.x - T.rx * .5 + r() * T.rx * .3; x.beginPath(); x.moveTo(rx, ry); x.lineTo(rx + T.rx * (.25 + r() * .35), ry - 1.2); x.stroke(); }
    /* des pavés qu'on devine sous l'eau */
    x.strokeStyle = 'rgba(40,50,70,.18)'; x.lineWidth = .45; x.beginPath(); for(q = -4; q <= 4; q++){ x.moveTo(T.x - T.rx, T.y + q * 6.4); x.lineTo(T.x + T.rx, T.y + q * 6.4); } x.stroke();
    x.restore();
  } else if(T.type === 'boue'){
    cheminForme(x, T, 4); x.fillStyle = 'rgba(70,46,24,.28)'; x.fill();
    cheminForme(x, T, 0); x.fillStyle = '#6a4826'; x.fill();
    x.save(); cheminForme(x, T, 0); x.clip();
    for(q = 0; q < 14; q++){ x.fillStyle = r() < .5 ? 'rgba(40,24,10,.35)' : 'rgba(140,100,60,.3)'; ovale(x, T.x + (r() - .5) * T.rx * 1.6, T.y + (r() - .5) * T.ry * 1.6, 1.5 + r() * 4, 1 + r() * 2.6, r() * 3); x.fill(); }
    x.strokeStyle = 'rgba(255,240,220,.25)'; x.lineWidth = .7; x.lineCap = 'round'; for(q = 0; q < 4; q++){ var bx = T.x + (r() - .5) * T.rx, by = T.y + (r() - .5) * T.ry; x.beginPath(); x.arc(bx, by, 2 + r() * 2, PI * 1.1, PI * 1.7); x.stroke(); }
    x.restore();
    cheminForme(x, T, 0); x.strokeStyle = 'rgba(40,24,10,.45)'; x.lineWidth = 1; x.stroke();
    /* des éclaboussures tout autour */
    x.fillStyle = '#6a4826'; for(q = 0; q < 8; q++){ var ea = r() * TAU, ed = 1.05 + r() * .25; rond(x, T.x + Math.cos(ea) * T.rx * ed, T.y + Math.sin(ea) * T.ry * ed, .6 + r() * .8); x.fill(); }
  } else {
    /* de la farine renversée, avec un sac crevé au bord */
    cheminForme(x, T, 3); x.fillStyle = 'rgba(255,255,255,.3)'; x.fill();
    cheminForme(x, T, 0); x.fillStyle = '#f7f4ec'; x.fill();
    x.save(); cheminForme(x, T, 0); x.clip();
    for(q = 0; q < 30; q++){ x.fillStyle = r() < .5 ? 'rgba(220,210,190,.4)' : 'rgba(255,255,255,.8)'; rond(x, T.x + (r() - .5) * T.rx * 2, T.y + (r() - .5) * T.ry * 2, .3 + r() * 1.4); x.fill(); }
    x.restore();
    x.fillStyle = 'rgba(255,255,255,.85)'; for(q = 0; q < 16; q++){ var fa = r() * TAU, fd = 1 + r() * .4; rond(x, T.x + Math.cos(fa) * T.rx * fd, T.y + Math.sin(fa) * T.ry * fd, .3 + r() * .6); x.fill(); }
    var sa = T.rot + PI * .5, sxp = T.x + Math.cos(T.rot) * T.rx * .85, syp = T.y + Math.sin(T.rot) * T.rx * .85;
    x.fillStyle = '#d8c69c'; x.strokeStyle = K; x.lineWidth = 1.1; ovale(x, sxp, syp, 5, 7, sa); x.fill(); x.stroke();
    x.fillStyle = '#f7f4ec'; ovale(x, sxp - Math.cos(T.rot) * 3, syp - Math.sin(T.rot) * 3, 2.4, 3, sa); x.fill();
  }
  x.restore();
}
/* une trace de patte de chat, dans sa matière */
function dessinerTrace(x, T){
  var sz = TRACE * T.k;
  if(T.sub === 'lait'){
    CH.dessiner(x, T.c, T.x + .55, T.y + .65, T.a, sz, 'rgba(70,52,34,.32)', T.al);
    CH.dessiner(x, T.c, T.x, T.y, T.a, sz, '#fffdf4', T.al);
  } else if(T.sub === 'eau'){
    CH.dessiner(x, T.c, T.x, T.y, T.a, sz * 1.06, '#2a221e', T.al * .3);
    CH.dessiner(x, T.c, T.x, T.y, T.a, sz, '#2a221e', T.al * .6);
  } else if(T.sub === 'boue'){
    CH.dessiner(x, T.c, T.x + .45, T.y + .55, T.a, sz, 'rgba(30,18,8,.35)', T.al);
    CH.dessiner(x, T.c, T.x, T.y, T.a, sz, '#6b4724', T.al * .95);
  } else {
    CH.dessiner(x, T.c, T.x, T.y, T.a, sz * 1.1, '#ffffff', T.al * .35);
    CH.dessiner(x, T.c, T.x, T.y, T.a, sz, '#ffffff', T.al * .95);
    var r = graine(T.g); x.fillStyle = 'rgba(255,255,255,' + (T.al * .7).toFixed(2) + ')';
    for(var q = 0; q < 4; q++){ rond(x, T.x + (r() - .5) * sz * 2.6, T.y + (r() - .5) * sz * 2.6, .3 + r() * .4); x.fill(); }
  }
}
/* une lanterne au coin d'un carrefour */
function dessinerLampe(x, l, L){
  ombreRond(x, l.x, l.y, 2.2, L, 14);
  x.fillStyle = '#2e2a36'; x.strokeStyle = K; x.lineWidth = 1; rond(x, l.x, l.y, 2.6); x.fill(); x.stroke();
  var dx = l.lx - l.x, dy = l.ly - l.y, n = Math.hypot(dx, dy) || 1, hx = l.x + dx / n * 4.6, hy = l.y + dy / n * 4.6;
  x.strokeStyle = '#2e2a36'; x.lineWidth = 1.1; x.beginPath(); x.moveTo(l.x, l.y); x.lineTo(hx, hy); x.stroke();
  x.fillStyle = L.nuit ? '#ffe08a' : '#e9dcb0'; x.strokeStyle = K; x.lineWidth = .9; x.fillRect(hx - 2.3, hy - 2.3, 4.6, 4.6); x.strokeRect(hx - 2.3, hy - 2.3, 4.6, 4.6);
  x.fillStyle = '#2e2a36'; x.fillRect(hx - .5, hy - 2.3, 1, 4.6); x.fillRect(hx - 2.3, hy - .5, 4.6, 1);
}
/* chez Odette : sa maison au toit violet, la porte, le paillasson, la canne, le bol renversé, la flaque de lait (le lait est dessiné à part, sous les traces) */
function dessinerOdetteSol(x, O){
  x.save(); x.translate(O.bx, O.by);
  var r = graine(31);
  x.fillStyle = 'rgba(200,190,170,.35)'; ovale(x, 0, 28, 40, 19, 0); x.fill();
  x.fillStyle = '#fffdf4'; x.strokeStyle = 'rgba(200,190,160,.7)'; x.lineWidth = .8;
  x.beginPath(); x.moveTo(-34, 24);
  for(var q = 0; q <= 16; q++){ var a = PI + q / 16 * TAU, rx = 34 * (.82 + r() * .3), ry = 15 * (.82 + r() * .3); x.lineTo(Math.cos(a) * rx, 26 + Math.sin(a) * ry); }
  x.closePath(); x.fill(); x.stroke();
  ovale(x, -26, 40, 10, 6, .4); x.fill(); ovale(x, 27, 39, 8, 5, -.3); x.fill(); ovale(x, 8, 44, 5, 3, 0); x.fill();
  x.fillStyle = 'rgba(255,255,255,.9)'; ovale(x, -8, 20, 10, 3, -.1); x.fill();
  for(q = 0; q < 10; q++){ var ga = r() * TAU, gd = 1.15 + r() * .4; rond(x, Math.cos(ga) * 34 * gd, 26 + Math.sin(ga) * 15 * gd, .6 + r() * .9); x.fill(); }
  /* le bol renversé, et la bouteille couchée */
  x.fillStyle = '#c9a26a'; x.strokeStyle = K; x.lineWidth = 1.4; ovale(x, 18, 15, 7.5, 5.5, .5); x.fill(); x.stroke(); x.fillStyle = '#8a6a3a'; ovale(x, 20, 16, 4.4, 3, .5); x.fill();
  x.fillStyle = '#f4f8fb'; x.strokeStyle = K; x.lineWidth = 1.2; x.save(); x.translate(-12, 36); x.rotate(-.5); x.beginPath(); rr(x, -6, -3, 12, 6, 2.6); x.fill(); x.stroke(); x.fillStyle = '#4f7ec4'; x.fillRect(5, -1.8, 3, 3.6); x.strokeRect(5, -1.8, 3, 3.6); x.restore();
  x.restore();
}
function dessinerOdette(x, O, L){
  x.save(); x.translate(O.bx, O.by);
  var m = {x:-58, y:-56, w:116, h:54, sens:'h', c:'#8a5a8c', toit:'tuile', chem:[{u:.8, v:.3}], lucarne:true, g:4242};
  ombre(x, m, L, 16); dessinerToit(x, m, L);
  /* le seuil, le paillasson, deux pots de fleurs, la canne posée contre le mur */
  x.fillStyle = '#b4a48c'; x.strokeStyle = K; x.lineWidth = 1.3; x.fillRect(-15, -2, 30, 6); x.strokeRect(-15, -2, 30, 6);
  x.fillStyle = '#b0503a'; x.fillRect(-10, 5.5, 20, 8); x.strokeRect(-10, 5.5, 20, 8);
  x.strokeStyle = '#e0a070'; x.lineWidth = .5; x.beginPath(); for(var q = -9; q <= 9; q += 2){ x.moveTo(q, 5.5); x.lineTo(q, 13.5); } x.stroke();
  [[-24, 4], [24, 4]].forEach(function(pp, i){
    x.fillStyle = '#c4683e'; x.strokeStyle = K; x.lineWidth = 1.2; rond(x, pp[0], pp[1], 4.6); x.fill(); x.stroke();
    x.fillStyle = '#3f8a4a'; rond(x, pp[0], pp[1], 3.4); x.fill();
    x.fillStyle = i ? '#f2d04a' : '#e84a6a'; for(var k = 0; k < 5; k++){ rond(x, pp[0] + Math.cos(k * 1.26) * 2, pp[1] + Math.sin(k * 1.26) * 2, 1.1); x.fill(); }
  });
  x.strokeStyle = K; x.lineWidth = 3.4; x.lineCap = 'round'; x.beginPath(); x.moveTo(-33, -1); x.lineTo(-31, 17); x.stroke(); x.beginPath(); x.arc(-35.4, -1, 2.4, 0, PI, true); x.stroke();
  x.strokeStyle = '#b98a4a'; x.lineWidth = 1.8; x.beginPath(); x.moveTo(-33, -1); x.lineTo(-31, 17); x.stroke(); x.beginPath(); x.arc(-35.4, -1, 2.4, 0, PI, true); x.stroke();
  x.restore();
}
/* l'église : son cimetière, la nef d'ardoise, le transept, l'abside, le clocher et sa flèche, la grille de la crypte au pied du clocher */
function dessinerEglise(x, E, L){
  x.save(); x.translate(E.bx, E.by); x.rotate(Math.atan2(E.dy, E.dx) + PI / 2);
  var r = graine(77), q;
  /* le mur du cimetière, ouvert devant ; des tombes ; deux ifs */
  x.fillStyle = '#7f9a60'; x.fillRect(-112, -244, 224, 246);
  x.fillStyle = 'rgba(160,190,120,.25)'; for(q = 0; q < 30; q++){ rond(x, -108 + r() * 216, -240 + r() * 238, 2 + r() * 5); x.fill(); }
  x.strokeStyle = '#5f5448'; x.lineWidth = 5; x.lineCap = 'butt'; x.beginPath(); x.moveTo(-40, 2); x.lineTo(-112, 2); x.lineTo(-112, -244); x.lineTo(112, -244); x.lineTo(112, 2); x.lineTo(40, 2); x.stroke();
  x.strokeStyle = '#a89a86'; x.lineWidth = 3.4; x.stroke();
  /* l'allée de dalles */
  x.fillStyle = '#b3a690'; x.fillRect(-26, -30, 52, 32);
  x.strokeStyle = 'rgba(80,66,50,.4)'; x.lineWidth = .5; x.beginPath(); for(q = -24; q < 28; q += 8){ x.moveTo(q, -30); x.lineTo(q, 2); } for(q = -26; q < 2; q += 7){ x.moveTo(-26, q); x.lineTo(26, q); } x.stroke();
  for(q = 0; q < 14; q++){
    var tx = (q % 2 ? 1 : -1) * (58 + r() * 40), ty = -30 - r() * 200;
    if(Math.abs(tx) < 86 && ty < -128 && ty > -168) continue;
    ombre(x, {x:tx - 3, y:ty - 5, w:6, h:9}, L, 4);
    x.fillStyle = '#9a968c'; x.strokeStyle = K; x.lineWidth = 1; x.beginPath(); rr(x, tx - 3, ty - 5, 6, 9, 2.6); x.fill(); x.stroke();
    if(q % 3 === 0){ x.strokeStyle = '#6a665c'; x.lineWidth = 1; x.beginPath(); x.moveTo(tx, ty - 3.4); x.lineTo(tx, ty + 2.4); x.moveTo(tx - 2, ty - 1.4); x.lineTo(tx + 2, ty - 1.4); x.stroke(); }
    x.fillStyle = 'rgba(232,74,106,.8)'; if(q % 4 === 1){ rond(x, tx + 4, ty + 3, 1); x.fill(); }
  }
  [[-92, -60], [92, -210]].forEach(function(p2){ var a = {x:p2[0], y:p2[1], r:14, sorte:'sapin', g:91 + p2[0]}; ombreRond(x, a.x, a.y, a.r, L, 22); dessinerArbre(x, a, L); });
  /* la nef, le transept, l'abside (ardoise) */
  ombre(x, {x:-46, y:-206, w:92, h:126}, L, 34); ombre(x, {x:-78, y:-168, w:156, h:34}, L, 30);
  x.save(); x.fillStyle = 'rgba(16,22,40,' + L.ombre.a + ')'; ovale(x, L.ombre.x * 30, -206 + L.ombre.y * 30, 46, 40, 0); x.fill(); x.restore();
  /* l'abside : un demi-disque d'ardoise, ses rayons */
  x.fillStyle = '#56627c'; x.strokeStyle = K; x.lineWidth = 1.8; x.beginPath(); x.moveTo(-44, -204); x.arc(0, -204, 44, PI, TAU); x.closePath(); x.fill(); x.stroke();
  x.strokeStyle = 'rgba(18,22,40,.4)'; x.lineWidth = .5; x.beginPath(); for(q = 1; q < 8; q++){ var a5 = PI + q / 8 * PI; x.moveTo(0, -204); x.lineTo(Math.cos(a5) * 44, -204 + Math.sin(a5) * 44); } x.stroke();
  for(q = 1; q < 6; q++){ x.beginPath(); x.arc(0, -204, 44 * q / 6, PI, TAU); x.stroke(); }
  dessinerToit(x, {x:-46, y:-206, w:92, h:126, sens:'v', c:'#5d6b8c', toit:'ardoise', chem:[], lucarne:false, g:5151}, L);
  dessinerToit(x, {x:-78, y:-168, w:156, h:34, sens:'h', c:'#66748f', toit:'ardoise', chem:[], lucarne:false, g:5252}, L);
  /* les contreforts */
  x.fillStyle = '#9a968c'; x.strokeStyle = K; x.lineWidth = 1;
  [-192, -110, -96].forEach(function(yy){ x.fillRect(-52, yy, 6, 7); x.strokeRect(-52, yy, 6, 7); x.fillRect(46, yy, 6, 7); x.strokeRect(46, yy, 6, 7); });
  /* le clocher : un carré de pierre, sa flèche en pyramide (quatre pans), une croix d'or */
  ombre(x, {x:-30, y:-84, w:60, h:56}, L, 70);
  x.fillStyle = '#b4b0a4'; x.strokeStyle = K; x.lineWidth = 2.2; x.fillRect(-30, -84, 60, 56); x.strokeRect(-30, -84, 60, 56);
  var sun = {x:-L.ombre.x, y:-L.ombre.y}, faces = [[[-26, -80], [26, -80], 'h', -1], [[26, -80], [26, -32], 'v', 1], [[26, -32], [-26, -32], 'h', 1], [[-26, -32], [-26, -80], 'v', -1]];
  faces.forEach(function(f){
    var nrm = f[2] === 'h' ? {x:0, y:f[3]} : {x:f[3], y:0}, l = nrm.x * sun.x + nrm.y * sun.y;
    x.fillStyle = mix('#57647e', l > 0 ? '#c8d2e6' : '#10141e', Math.min(.5, Math.abs(l) * .4));
    x.beginPath(); x.moveTo(f[0][0], f[0][1]); x.lineTo(f[1][0], f[1][1]); x.lineTo(0, -56); x.closePath(); x.fill(); x.strokeStyle = K; x.lineWidth = 1.2; x.stroke();
  });
  x.strokeStyle = 'rgba(18,22,40,.3)'; x.lineWidth = .4; x.beginPath(); for(q = 1; q < 6; q++){ var t5 = q / 6; x.moveTo(-26 * (1 - t5), -80 + 24 * t5); x.lineTo(26 * (1 - t5), -80 + 24 * t5); x.lineTo(26 * (1 - t5), -32 - 24 * t5); x.lineTo(-26 * (1 - t5), -32 - 24 * t5); x.closePath(); } x.stroke();
  x.strokeStyle = '#7a5a1a'; x.lineWidth = 2.6; x.lineCap = 'round'; x.beginPath(); x.moveTo(0, -62); x.lineTo(0, -50); x.moveTo(-4, -56); x.lineTo(4, -56); x.stroke();
  x.strokeStyle = '#f2c84a'; x.lineWidth = 1.4; x.stroke();
  /* la grille de la crypte : un cadre de pierre au pied du clocher, un escalier qui s'enfonce, des barreaux */
  x.fillStyle = '#8f8a80'; x.strokeStyle = K; x.lineWidth = 2.2; x.beginPath(); rr(x, -22, -28, 44, 31, 5); x.fill(); x.stroke();
  x.strokeStyle = 'rgba(60,54,46,.55)'; x.lineWidth = .5; x.beginPath(); x.moveTo(-22, -16); x.lineTo(-17, -16); x.moveTo(17, -16); x.lineTo(22, -16); x.moveTo(-10, -28); x.lineTo(-10, -24); x.moveTo(10, -28); x.lineTo(10, -24); x.stroke();
  x.fillStyle = '#17131f'; x.beginPath(); rr(x, -16, -24, 32, 23, 3); x.fill();
  x.fillStyle = '#2c2638'; x.fillRect(-16, -8, 32, 5); x.fillStyle = '#231e2e'; x.fillRect(-16, -14, 32, 5); x.fillStyle = '#1c1826'; x.fillRect(-16, -19, 32, 4);
  x.strokeStyle = '#c9c4b8'; x.lineWidth = 2; x.lineCap = 'round';
  for(q = -2; q <= 2; q++){ x.beginPath(); x.moveTo(q * 6.2, -23); x.lineTo(q * 6.2, -2); x.stroke(); }
  x.beginPath(); x.moveTo(-15, -12.5); x.lineTo(15, -12.5); x.stroke();
  x.strokeStyle = 'rgba(60,40,30,.5)'; x.lineWidth = .9; x.beginPath(); x.moveTo(-6, -19); x.lineTo(-6, -15); x.moveTo(12, -9); x.lineTo(12, -4); x.stroke();
  x.fillStyle = '#6a5a3a'; x.strokeStyle = K; x.lineWidth = 1; x.beginPath(); rr(x, 9, -15, 5, 6, 1.5); x.fill(); x.stroke();
  x.strokeStyle = K; x.lineWidth = 1.4; x.beginPath(); rr(x, -16, -24, 32, 23, 3); x.stroke();
  /* deux lanternes, de chaque côté du clocher */
  [[-36, -26], [36, -26]].forEach(function(p3){ dessinerLampe(x, {x:p3[0], y:p3[1], lx:p3[0], ly:p3[1] + 6}, L); });
  x.restore();
}
/* le ruisseau de la forêt, entre x = a et x = b : ses berges de terre mouillée, l'eau (le ciel qui s'y reflète, en plus vert), des
   rides, des cailloux, des joncs ; là où il coupe un chemin, le gué est une tache (dessinerTacheTravers) */
function dessinerRuisseau(x, M, a, b, L){
  var R = M.ruisseau, f = M.yRuisseau, r = graine(Math.round(a) + 909), xx, q;
  function bande(dl){ x.beginPath(); for(xx = a - 2; xx <= b + 2; xx += 6) x.lineTo(xx, f(xx) - R.l - dl); for(xx = b + 2; xx >= a - 2; xx -= 6) x.lineTo(xx, f(xx) + R.l + dl); x.closePath(); }
  bande(5); x.fillStyle = 'rgba(50,36,20,.45)'; x.fill();
  bande(2); x.fillStyle = '#5a4630'; x.fill();
  bande(0);
  var g = x.createLinearGradient(0, R.y - R.l - 30, 0, R.y + R.l + 30); g.addColorStop(0, mix(L.ciel, '#3a6a6a', .5)); g.addColorStop(1, mix(L.cielB, '#24464a', .5));
  x.fillStyle = g; x.fill(); x.strokeStyle = 'rgba(30,26,30,.4)'; x.lineWidth = 1; x.stroke();
  x.strokeStyle = L.reflet; x.lineWidth = .8; x.lineCap = 'round';
  for(q = 0; q < (b - a) / 14; q++){ var rx = a + r() * (b - a), ry = f(rx) + (r() - .5) * R.l * 1.2; x.beginPath(); x.moveTo(rx - 3, ry); x.quadraticCurveTo(rx, ry - 1.4, rx + 3, ry); x.stroke(); }
  for(q = 0; q < (b - a) / 16; q++){ var sx = a + r() * (b - a), sy = f(sx) + (r() < .5 ? -1 : 1) * (R.l + 1 + r() * 3);
    x.fillStyle = '#8a867a'; x.strokeStyle = K; x.lineWidth = .6; ovale(x, sx, sy, 1.4 + r() * 1.6, 1 + r(), r() * 3); x.fill(); x.stroke(); }
  x.strokeStyle = '#5a7a30'; x.lineWidth = .9; x.beginPath();
  for(q = 0; q < (b - a) / 9; q++){ var jx = a + r() * (b - a), jy = f(jx) + (r() < .5 ? -1 : 1) * (R.l + 3 + r() * 5); x.moveTo(jx, jy); x.lineTo(jx + (r() - .5) * 3, jy - 3 - r() * 3); }
  x.stroke();
}
/* LE VIEUX PUITS (la forêt) : une clairière au bout du chemin, puis le puits — sa margelle de pierres, le noir au fond, la grille de fer
   rouillée posée dessus (Moustache passe entre les barreaux), les deux montants et le treuil, la corde, un seau renversé.
   (0, 0) : le bout du chemin, qui arrive par le bas ; le puits est en (0, -46). */
var PUITS = {x:0, y:-46, r:18};
function dessinerClairiere(x, E, L){
  x.save(); x.translate(E.bx, E.by); x.rotate(Math.atan2(E.dy, E.dx) + PI / 2);
  var r = graine(97), q;
  var g = x.createRadialGradient(0, -44, 10, 0, -44, 92); g.addColorStop(0, 'rgba(120,170,80,.9)'); g.addColorStop(.7, 'rgba(100,150,70,.6)'); g.addColorStop(1, 'rgba(100,150,70,0)');
  x.fillStyle = g; rond(x, 0, -44, 92); x.fill();
  /* l'herbe, et un sentier de terre battue jusqu'au puits */
  x.strokeStyle = 'rgba(90,140,60,.8)'; x.lineWidth = .45; x.lineCap = 'round'; x.beginPath();
  for(q = 0; q < 320; q++){ var a = r() * TAU, d = Math.sqrt(r()) * 82, bx = Math.cos(a) * d, by = -44 + Math.sin(a) * d; x.moveTo(bx, by); x.lineTo(bx + (r() - .5), by - 1.5 - r()); } x.stroke();
  x.fillStyle = 'rgba(134,112,76,.85)'; x.beginPath(); x.moveTo(-26, 4); x.quadraticCurveTo(-18, -20, -24, -44); x.lineTo(24, -44); x.quadraticCurveTo(18, -20, 26, 4); x.closePath(); x.fill();
  x.fillStyle = 'rgba(134,112,76,.8)'; rond(x, 0, -46, 30); x.fill();
  /* des pierres, des fleurs */
  for(q = 0; q < 10; q++){ var sa = r() * TAU, sd = 38 + r() * 40; x.fillStyle = '#8a867a'; x.strokeStyle = K; x.lineWidth = .7; ovale(x, Math.cos(sa) * sd, -44 + Math.sin(sa) * sd * .8, 1.6 + r() * 2.2, 1.2 + r() * 1.4, r() * 3); x.fill(); x.stroke(); }
  for(q = 0; q < 30; q++){ var fa = r() * TAU, fd = 40 + r() * 42; x.fillStyle = ['#f4f0ea', '#f2d04a', '#9a8ae0'][Math.floor(r() * 3)]; rond(x, Math.cos(fa) * fd, -44 + Math.sin(fa) * fd * .85, .8); x.fill(); }
  x.restore();
}
function dessinerPuits(x, E, L){
  x.save(); x.translate(E.bx, E.by); x.rotate(Math.atan2(E.dy, E.dx) + PI / 2); x.translate(PUITS.x, PUITS.y);
  var r = graine(131), q, R = PUITS.r;
  ombreRond(x, 0, 0, R + 1, L, 8);
  /* la margelle : un anneau de pierres jointoyées */
  x.fillStyle = '#9a958a'; x.strokeStyle = K; x.lineWidth = 2; rond(x, 0, 0, R); x.fill(); x.stroke();
  for(q = 0; q < 14; q++){ var a0 = q / 14 * TAU, a1 = (q + 1) / 14 * TAU - .05;
    x.fillStyle = mix('#a8a296', r() < .5 ? '#ffffff' : '#3a3630', r() * .18); x.beginPath(); x.arc(0, 0, R - 1, a0, a1); x.arc(0, 0, R - 6.4, a1, a0, true); x.closePath(); x.fill();
    x.strokeStyle = 'rgba(50,44,36,.5)'; x.lineWidth = .5; x.stroke(); }
  x.fillStyle = 'rgba(86,130,52,.7)'; for(q = 0; q < 5; q++){ var am = r() * TAU; ovale(x, Math.cos(am) * (R - 3.5), Math.sin(am) * (R - 3.5), 2.4, 1.3, am + PI / 2); x.fill(); }
  /* le noir, tout au fond */
  var gn = x.createRadialGradient(0, 0, 1, 0, 0, R - 6); gn.addColorStop(0, '#05040a'); gn.addColorStop(1, '#1c1824'); x.fillStyle = gn; rond(x, 0, 0, R - 6.2); x.fill();
  /* la grille de fer, rouillée */
  x.save(); rond(x, 0, 0, R - 5.6); x.clip();
  x.strokeStyle = '#4a3a30'; x.lineWidth = 2.4; x.lineCap = 'butt'; x.beginPath(); for(q = -2; q <= 2; q++){ x.moveTo(q * 4.6, -R); x.lineTo(q * 4.6, R); x.moveTo(-R, q * 4.6); x.lineTo(R, q * 4.6); } x.stroke();
  x.strokeStyle = '#9a5a32'; x.lineWidth = 1.3; x.stroke();
  x.strokeStyle = 'rgba(230,170,110,.4)'; x.lineWidth = .4; x.beginPath(); for(q = -2; q <= 2; q++){ x.moveTo(q * 4.6 - .4, -R); x.lineTo(q * 4.6 - .4, R); } x.stroke();
  x.restore();
  /* les deux montants, la traverse et le treuil, la corde qui pend */
  [[-R - 3, 0], [R + 3, 0]].forEach(function(m){ x.fillStyle = '#6a4a2e'; x.strokeStyle = K; x.lineWidth = 1.3; x.fillRect(m[0] - 2.6, m[1] - 2.6, 5.2, 5.2); x.strokeRect(m[0] - 2.6, m[1] - 2.6, 5.2, 5.2); });
  x.strokeStyle = K; x.lineWidth = 4.2; x.lineCap = 'round'; x.beginPath(); x.moveTo(-R - 3, 0); x.lineTo(R + 3, 0); x.stroke();
  x.strokeStyle = '#8a6a44'; x.lineWidth = 2.6; x.stroke();
  x.fillStyle = '#c8b08a'; x.strokeStyle = K; x.lineWidth = .8; x.beginPath(); rr(x, -5, -2.4, 10, 4.8, 2); x.fill(); x.stroke();
  x.strokeStyle = '#d8c8a0'; x.lineWidth = .5; x.beginPath(); for(q = -4; q <= 4; q += 1.4){ x.moveTo(q, -2.4); x.lineTo(q + .6, 2.4); } x.stroke();
  x.strokeStyle = '#4a3a2a'; x.lineWidth = 1.6; x.beginPath(); x.moveTo(R + 5, 0); x.lineTo(R + 9, 3); x.lineTo(R + 9, 6.4); x.stroke();
  /* le seau renversé, à côté */
  x.save(); x.translate(-R - 12, 10); x.rotate(.8); x.fillStyle = '#8a6a44'; x.strokeStyle = K; x.lineWidth = 1.1; x.beginPath(); x.moveTo(-4, -4); x.lineTo(4, -4); x.lineTo(3, 5); x.lineTo(-3, 5); x.closePath(); x.fill(); x.stroke();
  x.strokeStyle = '#3a3640'; x.lineWidth = .8; x.beginPath(); x.moveTo(-3.6, -1); x.lineTo(3.6, -1); x.moveTo(-3.2, 2.6); x.lineTo(3.2, 2.6); x.stroke(); x.restore();
  x.restore();
}
/* le bout d'une fausse piste : (0, 0) le fond de l'impasse, l'impasse arrive par le bas (on tourne le dessin) */
function dessinerLieu(x, F, L){
  x.save(); x.translate(F.bx, F.by); x.rotate(Math.atan2(F.dy, F.dx) + PI / 2);
  var r = graine(F.g), i;
  x.strokeStyle = K; x.lineWidth = 2;
  if(F.lieu === 'voisin' || F.lieu === 'boulangerie'){
    var m = {x:-54, y:-70, w:108, h:66, sens:'h', c:F.lieu === 'voisin' ? '#5d6b8c' : '#c9973a', toit:F.lieu === 'voisin' ? 'ardoise' : 'tuile', chem:[{u:.78, v:.3}], lucarne:true, g:F.g};
    ombre(x, m, L, 16); dessinerToit(x, m, L);
    x.fillStyle = '#b4a48c'; x.strokeStyle = K; x.lineWidth = 1.3; x.fillRect(-15, -4, 30, 6); x.strokeRect(-15, -4, 30, 6);
  }
  if(F.lieu === 'voisin'){
    x.fillStyle = '#4f7ec4'; x.fillRect(-11, 3, 22, 8); x.strokeRect(-11, 3, 22, 8);
    for(i = 0; i < 6; i++){ var gx = -25 + (i % 3) * 10 + (i > 2 ? 30 : 0), gy = 22 + (i % 2) * 4;
      x.fillStyle = '#5a8fc8'; x.strokeStyle = K; x.lineWidth = 1.2; rond(x, gx, gy, 4.4); x.fill(); x.stroke(); x.fillStyle = '#2f4f78'; rond(x, gx, gy, 2.6); x.fill(); x.fillStyle = 'rgba(255,255,255,.4)'; rond(x, gx - 1.4, gy - 1.4, 1); x.fill(); }
  } else if(F.lieu === 'boulangerie'){
    x.fillStyle = 'rgba(255,255,255,.85)'; ovale(x, 2, 24, 24, 12, 0); x.fill();
    for(i = 0; i < 14; i++){ rond(x, 2 + (r() - .5) * 60, 24 + (r() - .5) * 30, .5 + r()); x.fill(); }
    [[-22, 14], [20, 12], [-4, 10]].forEach(function(q){ x.fillStyle = '#f0e6d0'; x.strokeStyle = K; x.lineWidth = 1.3; ovale(x, q[0], q[1], 8, 10, .2); x.fill(); x.stroke(); x.fillStyle = '#c8b48a'; x.fillRect(q[0] - 4, q[1] - 2, 8, 2.4); });
    x.fillStyle = '#b8864a'; x.strokeStyle = K; x.lineWidth = 1.2; x.beginPath(); rr(x, 26, 22, 18, 11, 4); x.fill(); x.stroke();
    x.fillStyle = '#d89a4a'; for(i = 0; i < 3; i++){ ovale(x, 30 + i * 5, 27.5, 2.2, 4, .4); x.fill(); }
  } else if(F.lieu === 'lavoir'){
    ombre(x, {x:-34, y:-46, w:68, h:50}, L, 4);
    x.fillStyle = '#8a8478'; x.strokeStyle = K; x.lineWidth = 2; x.beginPath(); rr(x, -34, -46, 68, 50, 6); x.fill(); x.stroke();
    x.strokeStyle = 'rgba(60,54,46,.55)'; x.lineWidth = .5; x.beginPath(); for(i = -28; i < 34; i += 9){ x.moveTo(i, -46); x.lineTo(i, -40); x.moveTo(i, -2); x.lineTo(i, 4); } x.stroke();
    var gr = x.createLinearGradient(-26, -38, 26, -4); gr.addColorStop(0, L.ciel); gr.addColorStop(1, L.cielB); x.fillStyle = gr; x.beginPath(); rr(x, -27, -39, 54, 36, 4); x.fill();
    x.strokeStyle = L.reflet; x.lineWidth = 1.2; x.lineCap = 'round'; x.beginPath(); x.moveTo(-16, -26); x.quadraticCurveTo(-8, -29, 0, -26); x.quadraticCurveTo(8, -23, 16, -26); x.moveTo(-12, -14); x.quadraticCurveTo(-4, -17, 4, -14); x.stroke();
    x.fillStyle = '#c8a46a'; x.strokeStyle = K; x.lineWidth = 1.1; x.fillRect(-30, -2, 14, 7); x.strokeRect(-30, -2, 14, 7);
    x.strokeStyle = '#8a6a3a'; x.lineWidth = .5; x.beginPath(); for(i = -29; i < -16; i += 2){ x.moveTo(i, -2); x.lineTo(i, 5); } x.stroke();
    x.fillStyle = '#b8864a'; x.strokeStyle = K; x.lineWidth = 1.2; rond(x, 22, 14, 8); x.fill(); x.stroke(); x.fillStyle = '#e8e2d4'; rond(x, 22, 14, 5.6); x.fill(); x.fillStyle = '#4f7ec4'; ovale(x, 20, 13, 3, 2, .4); x.fill();
  } else if(F.lieu === 'arbre'){
    var a = {x:0, y:-10, r:34, sorte:'feuillu', g:F.g};
    ombreRond(x, a.x, a.y, a.r, L, 30); dessinerArbre(x, a, L);
    x.strokeStyle = K; x.lineWidth = 5.4; x.lineCap = 'round'; x.beginPath(); x.moveTo(14, 18); x.quadraticCurveTo(26, 28, 20, 38); x.stroke();
    x.strokeStyle = '#f4f1ea'; x.lineWidth = 3; x.beginPath(); x.moveTo(14, 18); x.quadraticCurveTo(26, 28, 20, 38); x.stroke();
    x.fillStyle = '#8a6a3a'; for(i = 0; i < 5; i++){ ovale(x, -20 + r() * 40, 16 + r() * 18, 1.4, 2.4, r() * 3); x.fill(); }
  } else if(F.lieu === 'carriole'){
    ombre(x, {x:-22, y:-4, w:44, h:42}, L, 14);
    x.strokeStyle = K; x.lineWidth = 2; x.lineCap = 'round'; x.beginPath(); x.moveTo(-10, 38); x.lineTo(-8, 54); x.moveTo(10, 38); x.lineTo(8, 54); x.stroke();
    x.fillStyle = '#3a2c20'; x.fillRect(-27, 4, 6, 26); x.fillRect(21, 4, 6, 26);
    x.fillStyle = '#d8a23c'; x.strokeStyle = K; x.lineWidth = 2; x.beginPath(); rr(x, -21, -4, 42, 42, 5); x.fill(); x.stroke();
    x.fillStyle = '#c0453a'; for(i = 0; i < 3; i++) x.fillRect(-21 + 4 + i * 13, -4, 6, 42);
    x.fillStyle = 'rgba(255,255,255,.18)'; x.fillRect(-21, -4, 42, 8);
    x.strokeStyle = K; x.lineWidth = 2; x.beginPath(); rr(x, -21, -4, 42, 42, 5); x.stroke();
    x.beginPath(); x.moveTo(0, -4); x.lineTo(0, 38); x.lineWidth = 1; x.stroke();
  } else if(F.lieu === 'souche'){
    /* une grosse souche creuse, ses racines, un trou noir dedans */
    x.strokeStyle = K; x.lineWidth = 5; x.lineCap = 'round'; x.beginPath(); for(i = 0; i < 6; i++){ var ar = i / 6 * TAU + .3; x.moveTo(0, -18); x.lineTo(Math.cos(ar) * 34, -18 + Math.sin(ar) * 30); } x.stroke();
    x.strokeStyle = '#5a3e24'; x.lineWidth = 3; x.stroke();
    x.fillStyle = '#5a3e24'; x.strokeStyle = K; x.lineWidth = 2; rond(x, 0, -18, 22); x.fill(); x.stroke();
    x.fillStyle = '#b8946a'; rond(x, 0, -18, 17); x.fill();
    x.strokeStyle = '#8a6a44'; x.lineWidth = .6; for(i = 1; i < 5; i++){ rond(x, 1, -17, i * 3.6); x.stroke(); }
    x.fillStyle = '#1a1210'; ovale(x, -3, -16, 8, 6, .3); x.fill();
    x.fillStyle = 'rgba(86,130,52,.75)'; for(i = 0; i < 6; i++){ ovale(x, -20 + r() * 40, -2 + r() * 10, 2.5 + r() * 2, 1.4, r() * 3); x.fill(); }
  } else if(F.lieu === 'terrier'){
    /* un talus de terre sous les racines d'un arbre, le trou du terrier, de la terre fraîche devant */
    var a1 = {x:0, y:-34, r:30, sorte:'chene', g:F.g}; ombreRond(x, a1.x, a1.y, a1.r, L, 26); dessinerArbre(x, a1, L);
    x.fillStyle = '#7a5a36'; x.strokeStyle = K; x.lineWidth = 1.6; ovale(x, 0, -6, 24, 12, 0); x.fill(); x.stroke();
    x.fillStyle = '#140e0c'; ovale(x, 0, -4, 10, 7, 0); x.fill();
    x.strokeStyle = '#4a3420'; x.lineWidth = 2; x.lineCap = 'round'; x.beginPath(); x.moveTo(-14, -12); x.quadraticCurveTo(-6, -2, -2, -10); x.moveTo(12, -12); x.quadraticCurveTo(6, -1, 3, -9); x.stroke();
    x.fillStyle = '#8a6a44'; for(i = 0; i < 14; i++){ ovale(x, (r() - .5) * 34, 8 + r() * 16, 1 + r() * 2, .7 + r(), r() * 3); x.fill(); }
  } else if(F.lieu === 'mare'){
    /* une petite mare : l'eau, les roseaux, des nénuphars, une grenouille sur un nénuphar */
    x.fillStyle = 'rgba(40,30,20,.25)'; ovale(x, 0, -26, 40, 28, 0); x.fill();
    var gm = x.createLinearGradient(-36, -50, 36, 0); gm.addColorStop(0, mix(L.ciel, '#3a6a5a', .5)); gm.addColorStop(1, mix(L.cielB, '#24463a', .5));
    x.fillStyle = gm; x.strokeStyle = K; x.lineWidth = 1.6; ovale(x, 0, -26, 36, 24, 0); x.fill(); x.stroke();
    x.strokeStyle = L.reflet; x.lineWidth = 1; x.beginPath(); x.moveTo(-18, -34); x.lineTo(-4, -35); x.moveTo(6, -22); x.lineTo(20, -23); x.stroke();
    [[-14, -20, 5], [10, -34, 6], [18, -16, 4]].forEach(function(n, k){ x.fillStyle = '#4f8a3a'; x.strokeStyle = K; x.lineWidth = .8; x.beginPath(); x.moveTo(n[0], n[1]); x.arc(n[0], n[1], n[2], .5, TAU - .1); x.closePath(); x.fill(); x.stroke();
      if(k === 1){ x.fillStyle = '#6aae4a'; x.strokeStyle = K; x.lineWidth = .8; ovale(x, n[0], n[1], 2.6, 3.2, 0); x.fill(); x.stroke(); x.fillStyle = '#f4f0d0'; rond(x, n[0] - 1.2, n[1] - 2.4, .9); x.fill(); rond(x, n[0] + 1.2, n[1] - 2.4, .9); x.fill(); } });
    x.strokeStyle = '#5a7a30'; x.lineWidth = 1; x.lineCap = 'round'; x.beginPath();
    for(i = 0; i < 16; i++){ var ra2 = r() * TAU, rd = 1.02 + r() * .08, bx2 = Math.cos(ra2) * 36 * rd, by2 = -26 + Math.sin(ra2) * 24 * rd; x.moveTo(bx2, by2); x.lineTo(bx2 + (r() - .5) * 3, by2 - 3 - r() * 3); } x.stroke();
    x.fillStyle = '#7a4a24'; for(i = 0; i < 4; i++){ var ra3 = r() * TAU; ovale(x, Math.cos(ra3) * 37, -26 + Math.sin(ra3) * 25, .9, 2.2, ra3); x.fill(); }
  } else if(F.lieu === 'champignons'){
    /* un rond de champignons, au milieu d'une petite clairière */
    x.fillStyle = 'rgba(120,160,80,.3)'; rond(x, 0, -22, 30); x.fill();
    for(i = 0; i < 13; i++){ var ca = i / 13 * TAU, ccx = Math.cos(ca) * 24, ccy = -22 + Math.sin(ca) * 20, cr = 2.4 + r() * 1.4;
      x.fillStyle = 'rgba(16,22,40,.3)'; rond(x, ccx + 1, ccy + 1, cr); x.fill();
      x.fillStyle = i % 3 ? '#e8dcc0' : '#c8302a'; x.strokeStyle = K; x.lineWidth = .8; rond(x, ccx, ccy, cr); x.fill(); x.stroke();
      x.fillStyle = i % 3 ? 'rgba(160,120,70,.5)' : '#fff4e8'; rond(x, ccx - cr * .3, ccy - cr * .3, cr * .3); x.fill(); }
  } else if(F.lieu === 'rochers'){
    [[-18, -24, 17, 14], [17, -30, 15, 13], [2, -46, 11, 9]].forEach(function(b){
      x.fillStyle = 'rgba(16,22,40,' + L.ombre.a + ')'; ovale(x, b[0] + L.ombre.x * 8, b[1] + L.ombre.y * 8, b[2], b[3], 0); x.fill();
      x.fillStyle = '#8a8a86'; x.strokeStyle = K; x.lineWidth = 1.8; x.beginPath(); for(var k6 = 0; k6 < 10; k6++){ var ak = k6 / 10 * TAU, rk = .85 + r() * .18; x.lineTo(b[0] + Math.cos(ak) * b[2] * rk, b[1] + Math.sin(ak) * b[3] * rk); } x.closePath(); x.fill(); x.stroke();
      x.fillStyle = 'rgba(230,230,220,.3)'; ovale(x, b[0] - L.ombre.x * b[2] * .25, b[1] - L.ombre.y * b[3] * .25, b[2] * .55, b[3] * .45, 0); x.fill();
      x.fillStyle = 'rgba(86,130,52,.75)'; for(k6 = 0; k6 < 6; k6++){ ovale(x, b[0] + (r() - .5) * b[2], b[1] - b[3] * .3 + (r() - .5) * b[3] * .6, 2 + r() * 3, 1.2 + r() * 1.6, r() * 3); x.fill(); }
    });
  } else if(F.lieu === 'tronc'){
    /* un grand arbre tombé en travers, tout creux : on voit le noir à son bout */
    x.save(); x.translate(0, -20); x.rotate(.12);
    x.fillStyle = '#6a4a2e'; x.strokeStyle = K; x.lineWidth = 2; x.beginPath(); rr(x, -52, -9, 104, 18, 9); x.fill(); x.stroke();
    x.fillStyle = 'rgba(255,230,190,.14)'; x.fillRect(-48, -7, 96, 5);
    x.strokeStyle = 'rgba(40,24,12,.5)'; x.lineWidth = .6; x.beginPath(); for(i = 0; i < 8; i++){ var ty3 = -7 + r() * 14; x.moveTo(-48 + r() * 10, ty3); x.lineTo(46 - r() * 12, ty3 + (r() - .5) * 1.4); } x.stroke();
    x.fillStyle = '#c8a878'; x.strokeStyle = K; x.lineWidth = 1.4; ovale(x, 51, 0, 4, 8.6, 0); x.fill(); x.stroke(); x.fillStyle = '#140e0c'; ovale(x, 51, 0, 2.6, 6, 0); x.fill();
    x.fillStyle = 'rgba(86,130,52,.75)'; for(i = 0; i < 7; i++){ ovale(x, -44 + r() * 86, -3 + (r() - .5) * 4, 2.5 + r() * 3, 1.3, 0); x.fill(); }
    x.restore();
  } else {
    x.fillStyle = '#6e5236'; x.strokeStyle = K; x.lineWidth = 2; x.beginPath(); rr(x, -34, -6, 68, 52, 4); x.fill(); x.stroke();
    for(i = 0; i < 12; i++){ var cx = -24 + (i % 4) * 16, cy = 4 + Math.floor(i / 4) * 15;
      x.fillStyle = '#6fbf5a'; x.strokeStyle = K; x.lineWidth = 1.3; rond(x, cx, cy, 5.6); x.fill(); x.stroke();
      x.fillStyle = '#a5dc8a'; rond(x, cx - 1.2, cy - 1.2, 2.6); x.fill(); x.strokeStyle = 'rgba(40,90,40,.6)'; x.lineWidth = .5; x.beginPath(); x.moveTo(cx, cy - 5); x.lineTo(cx, cy + 5); x.moveTo(cx - 5, cy); x.lineTo(cx + 5, cy); x.stroke(); }
    /* l'épouvantail */
    x.strokeStyle = '#7a5232'; x.lineWidth = 2; x.beginPath(); x.moveTo(26, -2); x.lineTo(42, -2); x.stroke();
    x.fillStyle = '#c94b4b'; x.strokeStyle = K; x.lineWidth = 1.2; ovale(x, 34, -2, 5, 4, 0); x.fill(); x.stroke();
    x.fillStyle = '#e3b84a'; rond(x, 34, -2, 3.4); x.fill(); x.stroke();
  }
  x.restore();
}

/* ==========================================================
   LES MORCEAUX DU DÉCOR, DESSINÉS UNE FOIS (Blocs) — tout ce qui ne bouge pas
   ========================================================== */
function Index(){
  var T = 160, g = {}, n = 0, marque = 0;
  return {
    ajouter:function(it){ it.n = n++; it.vu = 0; var a0 = Math.floor(it.x0 / T), a1 = Math.floor(it.x1 / T), b0 = Math.floor(it.y0 / T), b1 = Math.floor(it.y1 / T);
      for(var a = a0; a <= a1; a++) for(var b = b0; b <= b1; b++) (g[a + ':' + b] = g[a + ':' + b] || []).push(it); },
    chercher:function(R){
      marque++; var l = [], a0 = Math.floor(R.x / T), a1 = Math.floor((R.x + R.w) / T), b0 = Math.floor(R.y / T), b1 = Math.floor((R.y + R.h) / T);
      for(var a = a0; a <= a1; a++) for(var b = b0; b <= b1; b++){ var c = g[a + ':' + b]; if(!c) continue;
        for(var k = 0; k < c.length; k++){ var it = c[k]; if(it.vu === marque) continue; it.vu = marque; if(it.x1 < R.x || it.x0 > R.x + R.w || it.y1 < R.y || it.y0 > R.y + R.h) continue; l.push(it); } }
      l.sort(function(p, q){ return p.z - q.z || p.n - q.n; }); return l;
    }
  };
}
/* la liste de tout ce qui se dessine dans un morceau, avec sa couche (z) : 1 le sol des cours, 3 les détails de la rue, 4 le lait,
   5 les flaques, 5.5 le noir sous les passages ; [les traces des chats] ; 6 les ombres, 7 les objets, 8 les toits, 9 les arbres,
   10 les lieux, 11 les lanternes */
function preparerDecor(M, L){
  var I = Index();
  function aj(z, b, d){ I.ajouter({z:z, x0:b.x, y0:b.y, x1:b.x + b.w, y1:b.y + b.h, d:d}); }
  function boite(x0, y0, x1, y1){ return {x:x0, y:y0, w:x1 - x0, h:y1 - y0}; }
  /* de grandes taches plus claires ou plus sombres sur l'herbe, et des salissures sur les pavés : la tuile ne se voit plus se répéter */
  var rv = graine(M.W * 3 + M.H * 5);
  for(var vx = -MARGE; vx < M.W + MARGE; vx += 96) for(var vy = -MARGE; vy < M.H + MARGE; vy += 96){
    (function(cx, cy, cr, clair, sale){
      aj(.5, boite(cx - cr, cy - cr, cx + cr, cy + cr), function(x){ var g = x.createRadialGradient(cx, cy, 0, cx, cy, cr);
        g.addColorStop(0, clair ? 'rgba(150,196,104,.22)' : 'rgba(40,80,40,.2)'); g.addColorStop(1, clair ? 'rgba(150,196,104,0)' : 'rgba(40,80,40,0)'); x.fillStyle = g; x.fillRect(cx - cr, cy - cr, cr * 2, cr * 2); });
      if(sale && M.dansRue(cx, cy)) aj(2.2, boite(cx - cr * .5, cy - cr * .5, cx + cr * .5, cy + cr * .5), function(x){ var g = x.createRadialGradient(cx, cy, 0, cx, cy, cr * .5);
        g.addColorStop(0, 'rgba(84,66,46,.13)'); g.addColorStop(1, 'rgba(84,66,46,0)'); x.fillStyle = g; x.fillRect(cx - cr * .5, cy - cr * .5, cr, cr); });
    })(vx + rv() * 96, vy + rv() * 96, 40 + rv() * 60, rv() < .5, rv() < .6);
  }
  M.cellules.forEach(function(c){ if(c.sol === 'cour') aj(1, c, function(x, E){ x.save(); x.beginPath(); x.rect(c.x, c.y, c.w, c.h); x.clip(); carreler(x, E.tu.terre, E.R, E.tu.Tw); x.restore(); }); });
  /* (les choses de la forêt sont dessinées après les chemins : les fougères mordent un peu sur leur bord) */
  var SOLS_BOIS = {fougere:1, mousse:1, champis:1, fleursF:1, feuilles:1};
  M.sols.forEach(function(o){ aj(SOLS_BOIS[o.type] ? 2.4 : 1.2, o, function(x){ dessinerSol(x, o); }); });
  M.bords.forEach(function(b){ aj(1.4, boite(Math.min(b.x1, b.x2) - 6, Math.min(b.y1, b.y2) - 6, Math.max(b.x1, b.x2) + 6, Math.max(b.y1, b.y2) + 6), function(x){ dessinerBord(x, b); }); });
  /* le ruisseau de la forêt : par tronçons (chaque morceau du décor ne dessine que le sien) */
  if(M.ruisseau) for(var xs = -MARGE; xs < M.W + MARGE; xs += 120){
    (function(a, b){ var ya = M.ruisseau.y, h = M.ruisseau.a1 + M.ruisseau.a2 + M.ruisseau.l + 14;
      aj(1.1, boite(a - 4, ya - h, b + 4, ya + h), function(x){ dessinerRuisseau(x, M, a, b, L); }); })(xs, xs + 120);
  }
  /* le bord des chemins de la forêt : pas une ligne droite, de l'humus, de la mousse et des touffes d'herbe qui mordent un peu sur la
     terre (quelques pas au plus : jamais jusqu'aux traces) */
  if(M.foret) M.rues.forEach(function(R2){
    [[R2.x, R2.y, R2.x + R2.w, R2.y, 0, -1], [R2.x, R2.y + R2.h, R2.x + R2.w, R2.y + R2.h, 0, 1], [R2.x, R2.y, R2.x, R2.y + R2.h, -1, 0], [R2.x + R2.w, R2.y, R2.x + R2.w, R2.y + R2.h, 1, 0]].forEach(function(c){
      var len = Math.hypot(c[2] - c[0], c[3] - c[1]);
      for(var u = 0; u < len; u += 40) (function(a0, a1){
        var xa = c[0] + (c[2] - c[0]) * a0 / len, ya = c[1] + (c[3] - c[1]) * a0 / len, xb = c[0] + (c[2] - c[0]) * a1 / len, yb = c[1] + (c[3] - c[1]) * a1 / len;
        if(!M.estForet(Math.max(ya, yb) + 10)) return;
        aj(2.3, boite(Math.min(xa, xb) - 12, Math.min(ya, yb) - 12, Math.max(xa, xb) + 12, Math.max(ya, yb) + 12), function(x){
          var r2 = graine(Math.round(xa * 7 + ya * 13) + 5), t2;
          for(t2 = a0; t2 < a1; t2 += 3.4){
            var ex = c[0] + (c[2] - c[0]) * t2 / len, ey = c[1] + (c[3] - c[1]) * t2 / len, k1 = r2(), k2 = r2(), k3 = r2();
            if(M.dansRue(ex + c[4] * 5, ey + c[5] * 5) || !M.estForet(ey)) continue;
            var dd = -1 + k1 * 5.5, bx = ex - c[4] * dd, by = ey - c[5] * dd, rb = 2.4 + k2 * 3.6;
            x.fillStyle = k3 < .55 ? '#3f4a2a' : k3 < .8 ? '#465a2c' : '#4c3e26'; ovale(x, bx, by, rb, rb * .8, k1 * 3); x.fill();
            if(k2 > .55){ x.strokeStyle = k3 < .5 ? '#5e8a3e' : '#6f9a46'; x.lineWidth = .5; x.lineCap = 'round'; x.beginPath();
              for(var g2 = 0; g2 < 4; g2++){ var gx2 = bx + (r2() - .5) * rb, gy2 = by + (r2() - .5) * rb; x.moveTo(gx2, gy2); x.lineTo(gx2 + (r2() - .5) * 1.6 - c[4] * 2, gy2 - 2 - c[5] * 2); } x.stroke(); }
          }
        });
      })(u, Math.min(len, u + 40));
    });
  });
  /* les détails de la rue : des grilles d'égout, des feuilles mortes, de la paille ; sur les chemins de la forêt, des brindilles,
     des feuilles, des cailloux, des pommes de pin, des racines */
  var r = graine(M.W * 7 + M.H), rues = M.rues;
  rues.forEach(function(R2){
    var n = Math.round(R2.w * R2.h / 2600);
    for(var q = 0; q < n * (M.foret ? 1.6 : 1); q++){
      var d = {x:R2.x + 4 + r() * (R2.w - 8), y:R2.y + 4 + r() * (R2.h - 8), a:r() * TAU, t:r() < .55 ? 'feuille' : r() < .7 ? 'paille' : 'caillou', c:U.choix(['#c9742f', '#d8a13a', '#a8562a', '#b88a3a']), u:r()};
      if(M.estForet(d.y)) d.t = d.u < .4 ? 'feuille' : d.u < .65 ? 'brindille' : d.u < .82 ? 'caillou' : d.u < .92 ? 'pomme' : 'racine';
      (function(d2){ aj(3, boite(d2.x - 9, d2.y - 9, d2.x + 9, d2.y + 9), function(x){
        if(d2.t === 'feuille'){ x.fillStyle = d2.c; ovale(x, d2.x, d2.y, 1.9, .95, d2.a); x.fill(); x.strokeStyle = 'rgba(80,40,10,.5)'; x.lineWidth = .3; x.beginPath(); x.moveTo(d2.x - Math.cos(d2.a) * 1.9, d2.y - Math.sin(d2.a) * 1.9); x.lineTo(d2.x + Math.cos(d2.a) * 2.6, d2.y + Math.sin(d2.a) * 2.6); x.stroke(); }
        else if(d2.t === 'paille'){ x.strokeStyle = '#d8b860'; x.lineWidth = .4; x.beginPath(); for(var k = 0; k < 3; k++){ var aa = d2.a + k * .5; x.moveTo(d2.x, d2.y); x.lineTo(d2.x + Math.cos(aa) * 3, d2.y + Math.sin(aa) * 3); } x.stroke(); }
        else if(d2.t === 'brindille'){ x.strokeStyle = '#5a4026'; x.lineWidth = .6; x.lineCap = 'round'; x.beginPath(); x.moveTo(d2.x - Math.cos(d2.a) * 3.4, d2.y - Math.sin(d2.a) * 3.4); x.lineTo(d2.x + Math.cos(d2.a) * 3.4, d2.y + Math.sin(d2.a) * 3.4); x.moveTo(d2.x, d2.y); x.lineTo(d2.x + Math.cos(d2.a + .7) * 1.8, d2.y + Math.sin(d2.a + .7) * 1.8); x.stroke(); }
        else if(d2.t === 'pomme'){ x.fillStyle = '#7a4a24'; x.strokeStyle = K; x.lineWidth = .4; ovale(x, d2.x, d2.y, 1.5, 1, d2.a); x.fill(); x.stroke(); x.strokeStyle = 'rgba(200,150,90,.6)'; x.beginPath(); x.moveTo(d2.x - 1, d2.y); x.lineTo(d2.x + 1, d2.y); x.stroke(); }
        else if(d2.t === 'racine'){ x.strokeStyle = 'rgba(70,48,28,.7)'; x.lineWidth = 1.2; x.lineCap = 'round'; x.beginPath(); x.moveTo(d2.x - Math.cos(d2.a) * 8, d2.y - Math.sin(d2.a) * 8); x.quadraticCurveTo(d2.x + Math.sin(d2.a) * 2, d2.y - Math.cos(d2.a) * 2, d2.x + Math.cos(d2.a) * 8, d2.y + Math.sin(d2.a) * 8); x.stroke(); }
        else { x.fillStyle = '#8d8070'; ovale(x, d2.x, d2.y, 1.1, .8, d2.a); x.fill(); x.fillStyle = 'rgba(255,255,255,.3)'; rond(x, d2.x - .3, d2.y - .3, .35); x.fill(); }
      }); })(d);
    }
  });
  M.gx.forEach(function(gxx, i){ M.gy.forEach(function(gyy, j){
    if((i * 7 + j * 3) % 4 || M.estForet(gyy - RUE)) return;
    var dx = gxx + (j % 2 ? 24 : -24), dy = gyy + (i % 2 ? -24 : 24);
    aj(3, boite(dx - 6, dy - 6, dx + 6, dy + 6), function(x){ x.fillStyle = '#3a3640'; x.strokeStyle = K; x.lineWidth = .9; x.fillRect(dx - 4.5, dy - 3, 9, 6); x.strokeRect(dx - 4.5, dy - 3, 9, 6);
      x.strokeStyle = '#706a78'; x.lineWidth = .7; x.beginPath(); for(var k = -3; k <= 3; k += 1.5){ x.moveTo(dx + k, dy - 2.4); x.lineTo(dx + k, dy + 2.4); } x.stroke(); });
  }); });
  /* le lait devant chez Odette (sous les traces) ; dans la forêt, l'herbe de la clairière du puits */
  if(!M.foret) aj(4, boite(M.odette.bx - 50, M.odette.by - 4, M.odette.bx + 50, M.odette.by + 56), function(x){ dessinerOdetteSol(x, M.odette); });
  else aj(1.15, M.egBoite, function(x){ dessinerClairiere(x, M.eglise, L); });
  M.taches.forEach(function(T){ var e = Math.max(T.rx, T.ry) + 9; aj(5, boite(T.x - e, T.y - e, T.x + e, T.y + e), function(x){ dessinerTache(x, T, L, rues); }); });
  M.arches.forEach(function(A){
    aj(5.5, A, function(x){
      var g = A.sens === 'h' ? x.createLinearGradient(A.x, 0, A.x + A.w, 0) : x.createLinearGradient(0, A.y, 0, A.y + A.h);
      g.addColorStop(0, 'rgba(14,10,22,.25)'); g.addColorStop(.2, 'rgba(14,10,22,.5)'); g.addColorStop(.8, 'rgba(14,10,22,.5)'); g.addColorStop(1, 'rgba(14,10,22,.25)');
      x.fillStyle = g; x.fillRect(A.x, A.y, A.w, A.h);
      /* sous la voûte de la forêt, un tapis épais de feuilles mortes : on n'y voit aucune trace */
      if(A.foret){ var rf = graine(A.g + 3), FC = ['#7a5a2a', '#9a6a2a', '#6a4a24', '#8a3a20', '#5a4a26'];
        for(var q2 = 0; q2 < A.w * A.h / 14; q2++){ x.fillStyle = FC[Math.floor(rf() * FC.length)]; ovale(x, A.x + rf() * A.w, A.y + rf() * A.h, 1.7, .9, rf() * PI); x.fill(); } }
    });
    /* l'ombre de la maison du passage (ou du grand arbre), sur la rue */
    aj(6, boite(A.bat.x - 40, A.bat.y - 40, A.bat.x + A.bat.w + 40, A.bat.y + A.bat.h + 40), function(x){ if(A.foret) ombreRond(x, A.cx, A.cy, Math.max(A.bat.w, A.bat.h) * .48, L, 30); else ombre(x, A.bat, L, 22); });
  });
  /* les ombres, puis les choses, puis les toits, puis les arbres */
  M.obstacles.forEach(function(o){ var b = boite(o.x - 30, o.y - 30, o.x + o.w + 30, o.y + o.h + 30);
    aj(6, b, function(x){ ombreObjet(x, o, L); }); aj(7, b, function(x){ dessinerObjet(x, o, L); }); });
  M.objets.forEach(function(o){ var b = boite(o.x - 26, o.y - 26, o.x + o.w + 26, o.y + o.h + 26);
    aj(6, b, function(x){ ombreObjet(x, o, L); }); aj(7, b, function(x){ dessinerObjet(x, o, L); }); });
  M.maisons.forEach(function(m){ var b = boite(m.x - 36, m.y - 36, m.x + m.w + 36, m.y + m.h + 36);
    aj(6, b, function(x){ ombre(x, m, L, m.haut); }); aj(8, boite(m.x - 4, m.y - 4, m.x + m.w + 4, m.y + m.h + 4), function(x){ dessinerToit(x, m, L); }); });
  M.arbres.forEach(function(a){ var b = boite(a.x - a.r - 34, a.y - a.r - 34, a.x + a.r + 34, a.y + a.r + 34);
    aj(6, b, function(x){ ombreRond(x, a.x, a.y, a.r, L, a.haut); }); aj(9, boite(a.x - a.r - 3, a.y - a.r - 3, a.x + a.r + 3, a.y + a.r + 3), function(x){ dessinerArbre(x, a, L); }); });
  M.dessus.forEach(function(a){ var b = boite(a.x - a.r - 40, a.y - a.r - 40, a.x + a.r + 40, a.y + a.r + 40);
    aj(6, b, function(x){ ombreRond(x, a.x, a.y, a.r, L, a.haut); });
    aj(7, boite(a.x - 4, a.y - 4, a.x + 4, a.y + 4), function(x){ x.fillStyle = '#5a3e26'; x.strokeStyle = K; x.lineWidth = 1; rond(x, a.x, a.y, 3.2); x.fill(); x.stroke(); }); });
  /* les lieux : chez Odette et l'église (la ville), l'église et le puits (la forêt), les bouts des fausses pistes */
  if(!M.foret){
    aj(10, boite(M.odette.bx - 70, M.odette.by - 90, M.odette.bx + 70, M.odette.by + 20), function(x){ dessinerOdette(x, M.odette, L); });
    aj(10, M.egBoite, function(x){ dessinerEglise(x, M.eglise, L); });
  } else {
    aj(10, M.departBoite, function(x){ dessinerEglise(x, M.odette, L); });
    aj(10, M.egBoite, function(x){ dessinerPuits(x, M.eglise, L); });
  }
  M.fins.forEach(function(F){
    /* dans la forêt, une petite clairière d'herbe autour du bout de la fausse piste */
    if(F.foret) aj(1.15, boite(F.bx - 80, F.by - 80, F.bx + 80, F.by + 80), function(x){ var cx = F.bx + F.dx * 30, cy = F.by + F.dy * 30, g = x.createRadialGradient(cx, cy, 6, cx, cy, 62);
      g.addColorStop(0, 'rgba(110,156,72,.7)'); g.addColorStop(1, 'rgba(110,156,72,0)'); x.fillStyle = g; rond(x, cx, cy, 62); x.fill(); });
    aj(10, boite(F.bx - 110, F.by - 110, F.bx + 110, F.by + 110), function(x){ dessinerLieu(x, F, L); });
  });
  M.lampes.forEach(function(l){ aj(11, boite(l.x - 30, l.y - 30, l.x + 30, l.y + 30), function(x){ dessinerLampe(x, l, L); }); });
  return I;
}
function Blocs(M, I, L, s){
  var CW = CPX / s, cache = {}, nb = 0, MAX = 48, horloge = 0, pool = [];
  var tu = {paves:tuile(s, 'paves'), herbe:tuile(s, 'herbe'), terre:tuile(s, 'terre')}; tu.Tw = tu.paves.width / s;
  if(M.foret){ tu.humus = tuile(s, 'humus'); tu.sentier = tuile(s, 'sentier'); }
  var stats = {faits:0, ms:0, pire:0, coins:0, msCoins:0};
  /* zone : ne redessiner qu'un petit coin d'un morceau déjà dessiné (là où un chat qui court a effacé ou posé des traces) */
  function rendre(bx, by, zone, dans){
    var t0 = performance.now();
    var c = dans || pool.pop(); if(!c){ c = document.createElement('canvas'); c.width = c.height = CPX; }
    var x = c.getContext('2d', {alpha:false}), X0 = bx * CW, Y0 = by * CW, R = zone || {x:X0, y:Y0, w:CW, h:CW}, E = {R:R, tu:tu, L:L};   /* (opaque : se recopie plus vite) */
    x.save();
    x.setTransform(1, 0, 0, 1, 0, 0); if(!zone) x.clearRect(0, 0, CPX, CPX);
    x.setTransform(s, 0, 0, s, -X0 * s, -Y0 * s);
    if(zone){ x.beginPath(); x.rect(R.x, R.y, R.w, R.h); x.clip(); }
    x.lineCap = 'butt'; x.lineJoin = 'miter';
    /* la forêt : sous la lisière (qui ondule), l'humus au lieu de l'herbe ; les chemins de terre au lieu des pavés */
    var aBois = M.foret && R.y + R.h > M.Yf - 20, aVille = !M.foret || R.y < M.Yf + 20;
    carreler(x, tu.herbe, R, tu.Tw);
    if(aBois){ x.save(); lisiere(x, R, false); x.clip(); carreler(x, tu.humus, R, tu.Tw); x.restore(); }
    var items = I.chercher({x:R.x - 2, y:R.y - 2, w:R.w + 4, h:R.h + 4}), i = 0;
    for(; i < items.length && items[i].z < 2; i++) items[i].d(x, E);
    /* les rues : la bordure de pierre (le trottoir), les pavés, une ombre douce le long des bords */
    var rs = M.rues.filter(function(r){ return croise(r, R, 8); });
    if(rs.length && aBois){
      /* les chemins de la forêt : un bord de terre plus sombre, la terre tassée, une ombre douce le long des bords */
      x.save(); lisiere(x, R, false); x.clip();
      x.fillStyle = 'rgba(46,34,20,.5)'; rs.forEach(function(r){ x.fillRect(r.x - 3, r.y - 3, r.w + 6, r.h + 6); });
      x.beginPath(); rs.forEach(function(r){ x.rect(r.x, r.y, r.w, r.h); }); x.clip();
      carreler(x, tu.sentier, R, tu.Tw);
      x.restore();
    }
    if(rs.length && aVille){
      if(aBois){ x.save(); lisiere(x, R, true); x.clip(); }
      x.fillStyle = '#8f8270'; rs.forEach(function(r){ x.fillRect(r.x - 4.5, r.y - 4.5, r.w + 9, r.h + 9); });
      x.strokeStyle = 'rgba(60,50,40,.45)'; x.lineWidth = .5; x.beginPath();
      rs.forEach(function(r){ for(var u = r.x - 4.5; u < r.x + r.w + 4.5; u += 5.5){ if(u < R.x - 6 || u > R.x + R.w + 6) continue; x.moveTo(u, r.y - 4.5); x.lineTo(u, r.y - .5); x.moveTo(u, r.y + r.h + .5); x.lineTo(u, r.y + r.h + 4.5); }
        for(var v = r.y - 4.5; v < r.y + r.h + 4.5; v += 5.5){ if(v < R.y - 6 || v > R.y + R.h + 6) continue; x.moveTo(r.x - 4.5, v); x.lineTo(r.x - .5, v); x.moveTo(r.x + r.w + .5, v); x.lineTo(r.x + r.w + 4.5, v); } });
      x.stroke();
      x.save(); x.beginPath(); rs.forEach(function(r){ x.rect(r.x, r.y, r.w, r.h); }); x.clip();
      carreler(x, tu.paves, R, tu.Tw); x.fillStyle = 'rgba(40,30,20,.24)'; x.fillRect(R.x - 2, R.y - 2, R.w + 4, R.h + 4);
      x.restore();
      x.save(); x.beginPath(); rs.forEach(function(r){ x.rect(r.x + 2.2, r.y + 2.2, r.w - 4.4, r.h - 4.4); }); x.clip();
      carreler(x, tu.paves, R, tu.Tw);
      x.restore();
      if(aBois) x.restore();
    }
    for(; i < items.length && items[i].z < 6; i++) items[i].d(x, E);
    /* les traces des chats (sauf celles qu'un chat qui court a effacées) ; les plus récentes par-dessus */
    var cx0 = Math.floor((R.x - 10) / M.CASE), cx1 = Math.floor((R.x + R.w + 10) / M.CASE), cy0 = Math.floor((R.y - 10) / M.CASE), cy1 = Math.floor((R.y + R.h + 10) / M.CASE);
    for(var a = cx0; a <= cx1; a++) for(var b = cy0; b <= cy1; b++){
      var l = M.cases[a + ':' + b]; if(!l) continue;
      for(var k = 0; k < l.length; k++){ var T = l[k]; if(T.ef || T.x < R.x - 10 || T.x > R.x + R.w + 10 || T.y < R.y - 10 || T.y > R.y + R.h + 10) continue; dessinerTrace(x, T); }
    }
    for(; i < items.length; i++) items[i].d(x, E);
    x.restore();
    var dt = performance.now() - t0;
    if(zone){ stats.coins++; stats.msCoins += dt; } else { stats.faits++; stats.ms += dt; if(dt > stats.pire) stats.pire = dt; }
    return c;
  }
  /* la lisière de la forêt (elle ondule) : le chemin de la partie « forêt » (ville : la partie du dessus) */
  function lisiere(x, R, ville){
    x.beginPath(); var u;
    if(ville){ x.moveTo(R.x - 12, R.y - 12); x.lineTo(R.x + R.w + 12, R.y - 12); }
    else { x.moveTo(R.x - 12, R.y + R.h + 12); x.lineTo(R.x + R.w + 12, R.y + R.h + 12); }
    for(u = R.x + R.w + 12; u >= R.x - 12; u -= 6) x.lineTo(u, M.Yf + 9 * Math.sin(u / 53) + 5 * Math.sin(u / 19 + 1.7));
    x.closePath();
  }
  /* reprendre : un morceau qui a changé (un chat a effacé ou posé des traces) est redessiné — au plus « budget » par image ;
     les autres gardent un instant leur ancienne image */
  function obtenir(bx, by, forcer, budget){
    var cle = bx + ':' + by, e = cache[cle];
    if(e){
      e.h = ++horloge;
      /* les petits coins à reprendre (budget.n : combien par image, pour tous les morceaux) */
      while(e.coins && e.coins.length && budget && budget.n > 0){ budget.n--; rendre(bx, by, e.coins.shift(), e.c); }
      return e.c;
    }
    if(!forcer) return null;
    if(nb >= MAX){
      var vieux = null; for(var k in cache){ if(!vieux || cache[k].h < cache[vieux].h) vieux = k; }
      if(vieux){ pool.push(cache[vieux].c); delete cache[vieux]; nb--; }
    }
    var c = rendre(bx, by); cache[cle] = {c:c, h:++horloge, coins:[]}; nb++;
    return c;
  }
  /* un coin d'un morceau a changé : on le note (s'il touche un coin déjà noté, les deux n'en font plus qu'un) */
  function salir(x0, y0, x1, y1){
    var a0 = Math.floor(x0 / CW), a1 = Math.floor(x1 / CW), b0 = Math.floor(y0 / CW), b1 = Math.floor(y1 / CW);
    for(var a = a0; a <= a1; a++) for(var b = b0; b <= b1; b++){
      var e = cache[a + ':' + b]; if(!e) continue;
      var r = {x:Math.max(x0, a * CW), y:Math.max(y0, b * CW)}; r.w = Math.min(x1, (a + 1) * CW) - r.x; r.h = Math.min(y1, (b + 1) * CW) - r.y;
      if(r.w <= 0 || r.h <= 0) continue;
      var fus = null; for(var q = 0; q < e.coins.length; q++){ var z = e.coins[q]; if(croise(z, r, 2) && Math.max(z.x + z.w, r.x + r.w) - Math.min(z.x, r.x) < 60 && Math.max(z.y + z.h, r.y + r.h) - Math.min(z.y, r.y) < 60){ fus = z; break; } }
      if(fus){ var X1 = Math.max(fus.x + fus.w, r.x + r.w), Y1 = Math.max(fus.y + fus.h, r.y + r.h); fus.x = Math.min(fus.x, r.x); fus.y = Math.min(fus.y, r.y); fus.w = X1 - fus.x; fus.h = Y1 - fus.y; }
      else e.coins.push(r);
    }
  }
  function vider(){ for(var k in cache) pool.push(cache[k].c); cache = {}; nb = 0; }
  return {CW:CW, obtenir:obtenir, vider:vider, salir:salir, stats:stats, a:function(bx, by){ return !!cache[bx + ':' + by]; }};
}

/* ==========================================================
   CE QUI BOUGE : les chats vus du ciel (qui courent, assis), les pigeons, le linge, la fumée
   ========================================================== */
function chatCourt(x, C, px, py, ang, ph, t, al){
  var R = C.robe, g = (R.gros || 1) * (R.fine ? .92 : 1), w = R.fine ? .84 : 1, s = Math.sin(ph), c2 = Math.cos(ph);
  x.save(); x.translate(px, py); x.rotate(ang + PI / 2); x.scale(g, g); if(al != null) x.globalAlpha = al;
  x.fillStyle = 'rgba(10,14,24,.26)'; ovale(x, 1.6, 2.4, 6.2 * w, 12.4, 0); x.fill();
  /* la queue, derrière, qui ondule */
  var qx = Math.sin(t * 9) * 3.2;
  x.lineCap = 'round'; x.strokeStyle = K; x.lineWidth = 3.6; x.beginPath(); x.moveTo(0, 8); x.quadraticCurveTo(qx * .6, 14, qx, 20.5); x.stroke();
  x.strokeStyle = R.c; x.lineWidth = 2.1; x.stroke();
  /* les pattes, au galop : celles de devant ensemble, celles de derrière ensemble */
  var fy = -6.4 - s * 3.6, by = 6.4 + s * 3.6;
  x.fillStyle = R.c2; x.strokeStyle = K; x.lineWidth = .9;
  [[-2.9, fy], [2.9, fy + .8], [-3.1, by], [3.1, by - .8]].forEach(function(q){ ovale(x, q[0], q[1], 1.6, 2.4, 0); x.fill(); x.stroke(); });
  /* le corps, qui s'allonge et se ramasse */
  var L2 = 9.4 + c2 * 1;
  x.fillStyle = R.c; x.strokeStyle = K; x.lineWidth = 1.4; ovale(x, 0, 0, 5.1 * w, L2, 0); x.fill(); x.stroke();
  x.fillStyle = rgba(R.c2, .55); ovale(x, 0, -.5, 2.4 * w, L2 * .62, 0); x.fill();
  if(R.raies){ x.strokeStyle = R.raies; x.lineWidth = 1; x.beginPath(); for(var q = -2; q <= 2; q++){ x.moveTo(-4 * w, q * 3); x.quadraticCurveTo(0, q * 3 - 1.4, 4 * w, q * 3); } x.stroke(); }
  /* la tête, les oreilles, le museau */
  var hy = -L2 - 2.4;
  x.fillStyle = R.c; x.strokeStyle = K; x.lineWidth = 1.1;
  x.beginPath(); x.moveTo(-3.6, hy + .6); x.lineTo(-3.4, hy - 3.6); x.lineTo(-1, hy - 1.6); x.closePath(); x.moveTo(3.6, hy + .6); x.lineTo(3.4, hy - 3.6); x.lineTo(1, hy - 1.6); x.closePath(); x.fill(); x.stroke();
  x.fillStyle = '#f4a9b4'; x.beginPath(); x.moveTo(-3, hy - .2); x.lineTo(-3, hy - 2.6); x.lineTo(-1.6, hy - 1.4); x.closePath(); x.moveTo(3, hy - .2); x.lineTo(3, hy - 2.6); x.lineTo(1.6, hy - 1.4); x.closePath(); x.fill();
  x.fillStyle = R.c; x.strokeStyle = K; x.lineWidth = 1.2; rond(x, 0, hy, 4); x.fill(); x.stroke();
  x.fillStyle = R.c2; ovale(x, 0, hy - 2.6, 1.8, 1.3, 0); x.fill();
  x.fillStyle = '#e0788a'; rond(x, 0, hy - 3.4, .55); x.fill();
  x.restore();
}
/* Moustache, assis devant la grille : le gros gris, la queue enroulée ; quand il miaule, il lève la tête */
function chatAssis(x, C, px, py, ang, t, miaule, al){
  var R = C.robe, g = R.gros || 1;
  x.save(); x.translate(px, py); x.rotate(ang + PI / 2); x.scale(g, g); if(al != null) x.globalAlpha = al;
  x.fillStyle = 'rgba(10,14,24,.28)'; ovale(x, 1.5, 2.4, 8.6, 9.4, 0); x.fill();
  var bq = Math.sin(t * 2.2) * .8;
  x.lineCap = 'round'; x.strokeStyle = K; x.lineWidth = 3.6; x.beginPath(); x.moveTo(3, 8); x.bezierCurveTo(10.5, 8, 11 + bq, -2, 5.5 + bq, -6.4); x.stroke();
  x.strokeStyle = R.c; x.lineWidth = 2.1; x.stroke();
  x.fillStyle = R.c; x.strokeStyle = K; x.lineWidth = 1.4; ovale(x, 0, 2.4, 7.4, 8, 0); x.fill(); x.stroke();
  x.fillStyle = rgba(R.c2, .55); ovale(x, 0, 3.2, 3.8, 5, 0); x.fill();
  x.fillStyle = R.c2; x.strokeStyle = K; x.lineWidth = .9; ovale(x, -2.2, -4.6, 1.8, 2.2, 0); x.fill(); x.stroke(); ovale(x, 2.2, -4.6, 1.8, 2.2, 0); x.fill(); x.stroke();
  var lev = miaule ? 1 : 0, hy = -5.6 - lev * 1.6, hs = 1 + lev * .08;
  x.save(); x.translate(0, hy); x.scale(hs, hs);
  x.fillStyle = R.c; x.strokeStyle = K; x.lineWidth = 1.1;
  x.beginPath(); x.moveTo(-4.4, .4); x.lineTo(-4.2, -4.6); x.lineTo(-1.2, -2.2); x.closePath(); x.moveTo(4.4, .4); x.lineTo(4.2, -4.6); x.lineTo(1.2, -2.2); x.closePath(); x.fill(); x.stroke();
  x.fillStyle = '#f4a9b4'; x.beginPath(); x.moveTo(-3.6, -.4); x.lineTo(-3.6, -3.4); x.lineTo(-2, -1.8); x.closePath(); x.moveTo(3.6, -.4); x.lineTo(3.6, -3.4); x.lineTo(2, -1.8); x.closePath(); x.fill();
  x.fillStyle = R.c; x.strokeStyle = K; x.lineWidth = 1.2; rond(x, 0, 0, 5); x.fill(); x.stroke();
  x.fillStyle = R.c2; ovale(x, 0, -3.2, 2.3, 1.6, 0); x.fill();
  /* ses grandes moustaches */
  x.strokeStyle = 'rgba(36,24,46,.75)'; x.lineWidth = .4; x.beginPath(); x.moveTo(-1.6, -3.4); x.lineTo(-8.4, -4.6); x.moveTo(-1.6, -3); x.lineTo(-8.6, -2.4); x.moveTo(1.6, -3.4); x.lineTo(8.4, -4.6); x.moveTo(1.6, -3); x.lineTo(8.6, -2.4); x.stroke();
  x.fillStyle = '#e0788a'; rond(x, 0, -4.2, .7); x.fill();
  if(miaule){ x.fillStyle = '#5a1e2e'; ovale(x, 0, -4.9, 1, .7, 0); x.fill(); }
  x.restore();
  x.restore();
}
function pigeon(x, P, t){
  x.save(); x.translate(P.x, P.y); x.rotate(P.a + PI / 2);
  if(P.vol){
    var sc = 1 + Math.min(.7, P.tv * .8), f = Math.sin(t * 34 + P.ph);
    x.scale(sc, sc);
    x.fillStyle = 'rgba(10,14,24,.2)'; ovale(x, 4 + P.tv * 14, 6 + P.tv * 14, 6, 3, 0); x.fill();
    x.fillStyle = '#a7adb8'; x.strokeStyle = K; x.lineWidth = .7;
    x.beginPath(); x.ellipse(-4.6, 0, 4.6, 1.6 + Math.abs(f) * 1.2, -.2, 0, TAU); x.fill(); x.stroke();
    x.beginPath(); x.ellipse(4.6, 0, 4.6, 1.6 + Math.abs(f) * 1.2, .2, 0, TAU); x.fill(); x.stroke();
  } else {
    x.fillStyle = 'rgba(10,14,24,.22)'; ovale(x, .6, 1, 2.8, 3.8, 0); x.fill();
  }
  var pk = P.vol ? 0 : Math.max(0, Math.sin(t * 5 + P.ph)) * 1.4;
  x.fillStyle = '#5a5f6c'; x.beginPath(); x.moveTo(-1.6, 2.6); x.lineTo(0, 5.6); x.lineTo(1.6, 2.6); x.closePath(); x.fill();
  x.fillStyle = '#8d93a0'; x.strokeStyle = K; x.lineWidth = .7; ovale(x, 0, 0, 2.5, 3.7, 0); x.fill(); x.stroke();
  x.fillStyle = '#a9afbc'; ovale(x, -1.2, .6, 1, 2.2, .2); x.fill(); ovale(x, 1.2, .6, 1, 2.2, -.2); x.fill();
  x.strokeStyle = '#4a4f5c'; x.lineWidth = .4; x.beginPath(); x.moveTo(-2, 1); x.lineTo(-.6, 1.4); x.moveTo(2, 1); x.lineTo(.6, 1.4); x.stroke();
  x.fillStyle = '#5f9a86'; ovale(x, 0, -2.6, 1.5, 1, 0); x.fill();
  x.fillStyle = '#6f7686'; x.strokeStyle = K; x.lineWidth = .6; rond(x, 0, -3.8 - pk, 1.35); x.fill(); x.stroke();
  x.fillStyle = '#e0b080'; rond(x, 0, -5.1 - pk, .4); x.fill();
  x.restore();
}
function dessinerLinge(x, Ln, t, ombreL){
  var dx = Ln.x2 - Ln.x1, dy = Ln.y2 - Ln.y1, ox = ombreL ? ombreL.x : 0, oy = ombreL ? ombreL.y : 0;
  if(!ombreL){ x.strokeStyle = '#4a3a2c'; x.lineWidth = .7; x.beginPath(); x.moveTo(Ln.x1, Ln.y1); x.lineTo(Ln.x2, Ln.y2); x.stroke(); }
  else { x.strokeStyle = 'rgba(16,22,40,.16)'; x.lineWidth = .7; x.beginPath(); x.moveTo(Ln.x1 + ox, Ln.y1 + oy); x.lineTo(Ln.x2 + ox, Ln.y2 + oy); x.stroke(); }
  var a = Math.atan2(dy, dx);
  Ln.habits.forEach(function(h, i){
    var px = Ln.x1 + dx * h.u + ox, py = Ln.y1 + dy * h.u + oy, bal = Math.sin(t * 1.9 + h.ph) * .28;
    x.save(); x.translate(px, py); x.rotate(a + PI / 2 + bal);
    if(ombreL){ x.fillStyle = 'rgba(16,22,40,.16)'; x.fillRect(-h.w / 2, 0, h.w, h.h); }
    else {
      x.fillStyle = h.c; x.strokeStyle = K; x.lineWidth = .6;
      if(h.f === 'chemise'){ x.beginPath(); x.moveTo(-h.w / 2, 0); x.lineTo(h.w / 2, 0); x.lineTo(h.w / 2 + 2, 2.6); x.lineTo(h.w / 2 - 1, 3.4); x.lineTo(h.w / 2 - 1, h.h); x.lineTo(-h.w / 2 + 1, h.h); x.lineTo(-h.w / 2 + 1, 3.4); x.lineTo(-h.w / 2 - 2, 2.6); x.closePath(); x.fill(); x.stroke(); }
      else if(h.f === 'chaussette'){ x.beginPath(); rr(x, -1.6, 0, 3.2, h.h * .6, 1.4); x.fill(); x.stroke(); }
      else { x.fillRect(-h.w / 2, 0, h.w, h.h); x.strokeRect(-h.w / 2, 0, h.w, h.h); x.fillStyle = 'rgba(0,0,0,.1)'; x.fillRect(-h.w / 2, h.h * .55, h.w, h.h * .45); }
      x.fillStyle = '#c8b090'; x.fillRect(-h.w / 2 + .6, -.6, 1, 1.6); x.fillRect(h.w / 2 - 1.6, -.6, 1, 1.6);
    }
    x.restore();
  });
}
/* une bouffée de fumée : un rond flou, dessiné une fois, qu'on pose agrandi et de plus en plus transparent */
var BOUFFEE = null;
function bouffee(){
  if(BOUFFEE) return BOUFFEE;
  var c = document.createElement('canvas'); c.width = c.height = 64; var x = c.getContext('2d'), g = x.createRadialGradient(32, 32, 0, 32, 32, 32);
  g.addColorStop(0, 'rgba(236,236,240,1)'); g.addColorStop(.45, 'rgba(228,228,234,.7)'); g.addColorStop(1, 'rgba(220,220,228,0)'); x.fillStyle = g; x.fillRect(0, 0, 64, 64);
  return (BOUFFEE = c);
}
function dessinerFumee(x, c, t, fort, k){
  var B = bouffee(); k = k == null ? 1 : k;
  for(var k = 0; k < 6; k++){
    var age = (t * .3 + c.ph + k / 6) % 1, px = c.x + VENT.x * age * 64 + Math.sin(age * 6 + c.ph * 10) * 3, py = c.y + VENT.y * age * 64;
    var r2 = 3 + age * 9, a = k * (fort ? .55 : .36) * (1 - age) * Math.min(1, age * 6);
    x.globalAlpha = a; x.drawImage(B, px - r2, py - r2, r2 * 2, r2 * 2);
  }
  x.globalAlpha = 1;
}

/* ==========================================================
   LES SONS (ce bloc est recopié tel quel dans l'Atelier des sons : donjon/essai/construire-sons.py)
   ========================================================== */
/* >>> LES SONS DES TRACES (15 novembre) : les pas dans l'eau, la boue, la farine ; les miaulements de Moustache ; les chats qui
   filent ; les pigeons qui s'envolent. Les mêmes briques que le gâteau de la fête (des notes douces, des souffles, des grains). */
function sonsPistage(audio, sortie){
  function tendre(f, t0, duree, vol, glisse, att, type, filtre){
    var a = audio(); if(!a) return;
    var t = a.currentTime + t0, o = a.createOscillator(), g = a.createGain();
    o.type = type || 'sine'; o.frequency.setValueAtTime(f, t); if(glisse) o.frequency.exponentialRampToValueAtTime(glisse, t + duree);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + (att || 0.008)); g.gain.exponentialRampToValueAtTime(0.0001, t + duree);
    if(filtre){ var lp = a.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = filtre; lp.Q.value = 0.5; o.connect(lp); lp.connect(g); } else o.connect(g);
    g.connect(sortie(a)); o.start(t); o.stop(t + duree + 0.03);
  }
  function souffle(t0, duree, vol, f0, f1, q, type){
    var a = audio(); if(!a) return;
    var t = a.currentTime + t0, n = Math.floor(a.sampleRate * duree), buf = a.createBuffer(1, n, a.sampleRate), d = buf.getChannelData(0);
    for(var i = 0; i < n; i++) d[i] = Math.random() * 2 - 1;
    var s = a.createBufferSource(), f = a.createBiquadFilter(), g = a.createGain(); s.buffer = buf;
    f.type = type || 'bandpass'; f.Q.value = q || 0.8; f.frequency.setValueAtTime(f0, t); f.frequency.exponentialRampToValueAtTime(f1 || f0, t + duree);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + Math.min(.04, duree * .3)); g.gain.exponentialRampToValueAtTime(0.0001, t + duree);
    s.connect(f); f.connect(g); g.connect(sortie(a)); s.start(t); s.stop(t + duree + .02);
  }
  function grains(t0, duree, vol, nb, passeHaut){
    var a = audio(); if(!a) return;
    var t = a.currentTime + t0, sr = a.sampleRate, n = Math.floor(sr * duree), buf = a.createBuffer(1, n, sr), d = buf.getChannelData(0);
    for(var k = 0; k < nb; k++){ var c = Math.floor(n * Math.random() * .9), l = Math.floor(sr * (.001 + Math.random() * .004)), v = .4 + Math.random() * .6; for(var j = 0; j < l && c + j < n; j++) d[c + j] += (Math.random() * 2 - 1) * v * (1 - j / l); }
    var s = a.createBufferSource(), f = a.createBiquadFilter(), g = a.createGain(); s.buffer = buf; f.type = 'highpass'; f.frequency.value = passeHaut || 2400; g.gain.value = vol;
    s.connect(f); f.connect(g); g.connect(sortie(a)); s.start(t); s.stop(t + duree + .02);
  }
  /* un miaulement : une voix un peu nasillarde (dents de scie filtrées) dont la hauteur monte puis retombe ; pan : à gauche (−1) ou à
     droite (1) — d'où vient le cri ; vib : la vitesse du tremblement de la voix ; ff : la « bouche » (le filtre principal) */
  function miaule(t0, f0, f1, f2, duree, vol, pan, vib, ff, rauque){
    var a = audio(); if(!a) return;
    var t = a.currentTime + t0, o = a.createOscillator(), v = a.createOscillator(), vg = a.createGain(), b1 = a.createBiquadFilter(), b2 = a.createBiquadFilter(), g = a.createGain(), g2 = a.createGain();
    o.type = rauque ? 'square' : 'sawtooth'; o.frequency.setValueAtTime(f0, t); o.frequency.linearRampToValueAtTime(f1, t + duree * .38); o.frequency.linearRampToValueAtTime(f2, t + duree);
    v.frequency.value = vib || 6.2; vg.gain.value = f1 * (rauque ? .03 : .018); v.connect(vg); vg.connect(o.frequency);
    var F = ff || 1;
    b1.type = 'bandpass'; b1.Q.value = 3.2; b1.frequency.setValueAtTime(800 * F, t); b1.frequency.linearRampToValueAtTime(1600 * F, t + duree * .4); b1.frequency.linearRampToValueAtTime(900 * F, t + duree);
    b2.type = 'bandpass'; b2.Q.value = 5; b2.frequency.setValueAtTime(2500 * F, t);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + .06); g.gain.setValueAtTime(vol, t + duree * .7); g.gain.exponentialRampToValueAtTime(0.0001, t + duree);
    g2.gain.value = rauque ? .2 : .35;
    o.connect(b1); o.connect(b2); b2.connect(g2); g2.connect(g); b1.connect(g);
    var fin = sortie(a);
    if(pan && a.createStereoPanner){ var p = a.createStereoPanner(); p.pan.value = Math.max(-1, Math.min(1, pan)); g.connect(p); p.connect(fin); } else g.connect(fin);
    o.start(t); v.start(t); o.stop(t + duree + .05); v.stop(t + duree + .05);
  }
  function v(x){ return x == null ? 1 : Math.max(0, Math.min(1, x)); }
  /* LA VOIX DE CHACUN DES SEPT CHATS (Romain, 14 h 26 : « tu les fais tous miauler un peu différemment ») : départ, sommet, fin (Hz),
     durée (s), force, vibrato, bouche, rauque ; deux cris par chat (A, puis B une fois sur trois) */
  var VOIX = {
    moustache:[[430, 660, 380, .78, .13, 5.2, .92], [470, 700, 520, .55, .12, 5.2, .92]],      /* le gros gris : grave, long, « mraaaou » */
    biscotte:[[880, 1180, 980, .3, .1, 8, 1.3], [940, 1240, 1100, .22, .09, 8, 1.3]],           /* la toute petite : « mi ! » aigu et court */
    pompon:[[620, 860, 560, .62, .12, 6, 1.08], [600, 800, 640, .48, .11, 6, 1.08]],             /* le gros blanc : rond, doux */
    caramel:[[520, 740, 430, .58, .13, 7.5, 1, 1], [560, 760, 470, .42, .12, 7.5, 1, 1]],      /* le rouquin : éraillé */
    mistigri:[[480, 620, 780, .5, .12, 5.6, .96], [500, 600, 820, .4, .11, 5.6, .96]],           /* le noir : « mrrou ? » qui monte, comme une question */
    noisette:[[560, 820, 470, .66, .12, 6.4, 1.02], [540, 760, 500, .5, .11, 6.4, 1.02]],        /* la brune : « miaou » bien net */
    grisette:[[720, 980, 640, 1.02, .1, 4.4, 1.16], [700, 920, 600, .8, .1, 4.4, 1.16]]          /* la fine : long et plaintif */
  };
  function chat(id, k, x, pan){ var V2 = VOIX[id] || VOIX.moustache, c = V2[k] || V2[0]; miaule(0, c[0], c[1], c[2], c[3], c[4] * v(x), pan, c[5], c[6], c[7]); }
  return {
    /* un chat qui appelle : miaou(id, volume, pan) — le jeu ; les boutons de l'Atelier : m_moustache, m_biscotte… */
    miaou:function(id, x, pan){ chat(id, Math.random() < .34 ? 1 : 0, x, pan); },
    m_moustache:function(x){ chat('moustache', 0, x); }, m_biscotte:function(x){ chat('biscotte', 0, x); }, m_pompon:function(x){ chat('pompon', 0, x); },
    m_caramel:function(x){ chat('caramel', 0, x); }, m_mistigri:function(x){ chat('mistigri', 0, x); }, m_noisette:function(x){ chat('noisette', 0, x); },
    m_grisette:function(x){ chat('grisette', 0, x); },
    hibou:function(x){ x = v(x); tendre(400, 0, .34, .05 * x, 370, .05, 'sine', 900); tendre(392, .5, .2, .03 * x, 380, .03, 'sine', 900); tendre(400, .74, .62, .05 * x, 330, .06, 'sine', 900); },   /* hou… hou-houuu */
    plouf:function(x){ x = v(x); souffle(0, .2, .05 * x, 1500, 380, .7, 'lowpass'); tendre(620, .01, .12, .03 * x, 240, .005); tendre(1300, .06, .05, .012 * x, 700, .003); tendre(980, .11, .05, .01 * x, 520, .003); },   /* un pied dans la flaque */
    floc:function(x){ x = v(x); souffle(0, .16, .055 * x, 500, 160, 1.2); tendre(150, .02, .14, .05 * x, 85, .01, 'triangle', 420); tendre(240, .1, .06, .02 * x, 120, .005, 'triangle', 600); },                /* un pied dans la boue */
    pouf:function(x){ x = v(x); souffle(0, .34, .03 * x, 3200, 1100, .6); grains(.02, .22, .012 * x, 22, 3500); },                                                                                                    /* un pied dans la farine */
    fuite:function(x){ x = v(x); for(var i = 0; i < 6; i++) tendre(420 + Math.random() * 120, i * .055, .03, .025 * x, 240, .002, 'triangle', 1400); miaule(.36, 700, 520, 380, .26, .04 * x); },   /* il file entre les barreaux */
    course:function(x){ x = v(x); for(var i = 0; i < 9; i++){ tendre(320 + (i % 2) * 70, i * .07, .028, .018 * x, 200, .002, 'triangle', 1100); } souffle(0, .6, .006 * x, 1800, 900, .9); },   /* un chat qui passe en courant */
    pigeons:function(x){ x = v(x); for(var i = 0; i < 12; i++) souffle(i * .045, .04, .045 * x, 1600 + Math.random() * 500, 900, 1.4); tendre(330, .02, .2, .02 * x, 290, .03); }                       /* les pigeons s'envolent */
  };
}
/* <<< LES SONS DES TRACES */
var ctxA = null;
function audio(){
  try{ if(window.Brume && Brume.sonActif && !Brume.sonActif()) return null; }catch(e){}
  try{ if(navigator.userActivation && !navigator.userActivation.hasBeenActive) return null; }catch(e){}
  if(!ctxA){ try{ var AC = window.AudioContext || window.webkitAudioContext; ctxA = AC ? new AC() : null; }catch(e){ ctxA = null; } }
  if(ctxA && ctxA.state === 'suspended') try{ ctxA.resume(); }catch(e){}
  return ctxA;
}
var SONS = null;
function son(nom, vol){ try{ if(!SONS) SONS = sonsPistage(audio, function(a){ return a.destination; }); if(SONS[nom]) SONS[nom](vol); }catch(e){} }
function miaou(id, vol, pan){ try{ if(!SONS) SONS = sonsPistage(audio, function(a){ return a.destination; }); SONS.miaou(id, vol, pan); }catch(e){} }

/* ==========================================================
   LE JEU
   ========================================================== */
function quelMoment(p){
  if(p.moment && LUM[p.moment]) return p.moment;
  try{ if(window.M && M.P && M.P() && M.momentId){ var m = M.momentId(); if(LUM[m]) return m; } }catch(e){}
  return U.choix(['matin', 'apresmidi', 'nuit']);
}
function jouer(zone, p, fin){
  var moment = quelMoment(p), L = LUM[moment];
  var M = creerMonde(p), fini = false, arrete = false;
  zone.innerHTML = '<div class="pg pg-' + moment + '" tabindex="0"><canvas class="pg-sol"></canvas><svg class="pg-heros" viewBox="-22 -22 44 44" aria-hidden="true"><g class="pg-h"></g></svg>' +
    '<canvas class="pg-haut"></canvas><canvas class="pg-amb"></canvas><div class="pg-voile" aria-hidden="true"></div><div class="pg-dit"></div></div>';
  var racine = zone.querySelector('.pg'), cv = racine.querySelector('.pg-sol'), ctx = cv.getContext('2d', {alpha:false}), svgH = racine.querySelector('.pg-heros'), gH = racine.querySelector('.pg-h'), dit = racine.querySelector('.pg-dit');
  var cvH = racine.querySelector('.pg-haut'), hx = cvH.getContext('2d'), cvA = racine.querySelector('.pg-amb'), ax = cvA.getContext('2d');
  var anim = null;
  try{ if(MJ.DESSUS){ gH.innerHTML = MJ.DESSUS.pisteur(); anim = MJ.DESSUS.Bonhomme(gH); anim.poser({ph:0, amp:0, t:0}); } }catch(e){}
  if(!gH.firstChild) gH.innerHTML = '<circle r="11" fill="#3f8f5a" stroke="' + K + '" stroke-width="2.4"/><circle cy="-3" r="6" fill="#f1c7a0" stroke="' + K + '" stroke-width="1.8"/>';
  var I = preparerDecor(M, L), blocs = null, sprites = {};
  var W = 0, H = 0, dpr = 1, ech = 3, s = 3, hautSale = true;
  var pos = {x:M.depart.x, y:M.depart.y}, cap = Math.PI / 2, but = null, marche = 0, phase = 0, tPas = 0, aBouge = false, touches = {}, marcheTot = 0, tJeu = 0;
  var semelle = {sub:null, c:0, pas:0, cote:1}, dedansTache = null, mesPas = [], rides = [], poudre = [];
  var vus = {};   /* les phrases du conteur déjà dites */
  /* les chats qui passent en courant : sur une horloge (Romain : « plus on met de temps, plus ce sera difficile ») */
  var CR = p.coureurs && typeof p.coureurs === 'object' ? p.coureurs : {premier:7, tous:12};
  var coureurs = [], nbCoureurs = 0, tCoureur = CR.premier, nCoureur = 0;
  /* on ne perd jamais dans la forêt (Romain : « celui-là, il ne peut pas perdre ») ; la ville se perd (params.perdre pour forcer) */
  var perdre = p.perdre != null ? !!p.perdre : !M.foret;
  /* un point dans le repère d'un bout d'impasse (lx en travers, ly : négatif = au-delà du bout) */
  function repere(E, lx, ly){ var rot = Math.atan2(E.dy, E.dx) + PI / 2; return {x:E.bx + lx * Math.cos(rot) - ly * Math.sin(rot), y:E.by + lx * Math.sin(rot) + ly * Math.cos(rot)}; }
  var mou = (function(){
    var E = M.eglise;
    /* la ville : devant la grille de la crypte ; la forêt : sur la margelle du puits, il file entre les barreaux de sa grille */
    var p0 = M.foret ? repere(E, 3, PUITS.y + PUITS.r + 5) : repere(E, 4, 14), gr = M.foret ? repere(E, PUITS.x, PUITS.y) : repere(E, 0, -12);
    return {x:p0.x, y:p0.y, x0:p0.x, y0:p0.y, gx:gr.x, gy:gr.y, a:Math.atan2(-E.dy, -E.dx), etat:'assis', t:0, miaou:0, prochain:1.2, bulle:0};
  })();
  /* les six autres chats, assis au bout de leur fausse piste : ils appellent, chacun avec sa voix */
  var fauxChats = M.fins.map(function(F){ return {F:F, chat:F.chat, x:F.cx, y:F.cy, x0:F.cx, y0:F.cy, a:Math.atan2(-F.dy, -F.dx), etat:'assis', t:0, miaou:0, prochain:U.rand(1, 5)}; });
  var lumieres = [];
  M.lampes.forEach(function(l){ lumieres.push({x:l.lx, y:l.ly, r:80, f:.9, c:1}); });
  M.fenetres.forEach(function(f){ lumieres.push({x:f.x, y:f.y, r:34, f:.55, c:.6}); });
  /* l'église : ses deux lanternes et la lueur de la crypte (à l'arrivée en ville, au départ dans la forêt) */
  (function(){ var E = M.foret ? M.odette : M.eglise; [[-36, -20], [36, -20], [0, -10]].forEach(function(q, i){ var P = repere(E, q[0], q[1]); lumieres.push({x:P.x, y:P.y, r:i === 2 ? 40 : 62, f:i === 2 ? .55 : .85, c:i === 2 ? .5 : 1}); }); })();
  if(!M.foret) lumieres.push({x:M.odette.bx, y:M.odette.by + 12, r:62, f:.85, c:1});
  else { var Pp = repere(M.eglise, PUITS.x, PUITS.y); lumieres.push({x:Pp.x, y:Pp.y, r:46, f:.5, c:.35}); }
  var fumees = [];
  M.maisons.forEach(function(m){ if(m.fum && (moment !== 'apresmidi' || Math.random() < .5)) m.chem.forEach(function(c){ fumees.push({x:m.x + m.w * c.u, y:m.y + m.h * c.v, ph:Math.random()}); }); });
  M.fins.forEach(function(F){ if(F.lieu === 'boulangerie'){ var rot = Math.atan2(F.dy, F.dx) + PI / 2, lx = -54 + 108 * .78, ly = -70 + 66 * .3; fumees.push({x:F.bx + lx * Math.cos(rot) - ly * Math.sin(rot), y:F.by + lx * Math.sin(rot) + ly * Math.cos(rot), ph:.3, fort:true}); } });
  var brumes = [];
  if(moment === 'matin') for(var b = 0; b < 14; b++) brumes.push({x:U.rand(-200, M.W + 200), y:U.rand(-200, M.H + 200), r:U.rand(130, 230), v:U.rand(4, 9)});
  /* dans les bois, une brume légère traîne entre les arbres, à toute heure */
  if(M.foret) for(b = 0; b < 12; b++) brumes.push({x:U.rand(-200, M.W + 200), y:U.rand(M.Yf + 60, M.H + 200), r:U.rand(110, 190), v:U.rand(3, 6), bois:true});
  var tHibou = U.rand(6, 10);

  function mesurer(){
    var r = racine.getBoundingClientRect(); if(!r.width || !r.height) return;
    var w = r.width, h = r.height, d = Math.min(2, window.devicePixelRatio || 1), e = U.borne(Math.min(w, h) / 150, 2.5, 3.5);
    if(w === W && h === H && d === dpr && blocs) return;
    W = w; H = h; dpr = d; ech = e; s = ech * dpr;
    cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
    cvH.width = cv.width; cvH.height = cv.height; hautSale = true;
    cvA.width = Math.max(2, Math.round(W / 3)); cvA.height = Math.max(2, Math.round(H / 3));
    svgH.style.width = svgH.style.height = Math.round(44 * ech) + 'px';
    if(blocs) blocs.vider();
    blocs = Blocs(M, I, L, s); sprites = {};
  }
  var ro = window.ResizeObserver ? new ResizeObserver(mesurer) : null;
  if(ro) ro.observe(racine); else window.addEventListener('resize', mesurer);
  mesurer();
  /* la phrase du conteur (une bulle, avec 🔊) */
  var tDit = null, journal = [];
  function dire(t, ms){
    if(tDit){ clearTimeout(tDit); tDit = null; }
    if(t){ journal.push(t); if(journal.length > 12) journal.shift(); }
    if(t) t = t.replace(/ ([!?:;…])/g, ' $1');   /* (pas de « ! » tout seul en début de ligne) */
    dit.innerHTML = t ? '<p>' + esc(t) + '</p>' : ''; dit.hidden = !t;
    if(t && MJ.boutonLire && MJ.nbMots && MJ.nbMots(t) > 3) try{ dit.appendChild(MJ.boutonLire(t)); }catch(e){}
    else if(t && MJ.boutonLire && !MJ.nbMots) try{ dit.appendChild(MJ.boutonLire(t)); }catch(e){}
    if(t && ms) tDit = setTimeout(function(){ tDit = null; dit.innerHTML = ''; dit.hidden = true; }, ms);
  }
  function direUneFois(cle, t){ if(vus[cle] || fini) return; vus[cle] = 1; dire(t, 5200); }
  dire(M.foret ? (moment === 'nuit' ? 'Des miaulements, partout dans la nuit ! ' : 'Des miaulements, partout ! ') + 'Sept chats ont marché dans la flaque du clocher. Le Pisteur suit ton doigt : tant qu\'il est posé, il marche.' :
    'Du lait renversé, et des pattes partout ! Le Pisteur suit ton doigt : tant qu\'il est posé, il marche.');

  function libre(x, y){ return M.dansRue(x - 9, y) && M.dansRue(x + 9, y) && M.dansRue(x, y - 9) && M.dansRue(x, y + 9) && !M.dansObstacle(x, y, 9); }
  function viser(ev){ var r = racine.getBoundingClientRect(); but = {x:ev.clientX - r.left - W / 2, y:ev.clientY - r.top - H / 2}; }
  function bas(ev){ if(fini || (ev.target && ev.target.closest && ev.target.closest('.mj-lire-mini, .b-lire, button'))) return; ev.preventDefault(); try{ racine.setPointerCapture(ev.pointerId); }catch(e){} viser(ev); }
  function bouge(ev){ if(but && !fini){ ev.preventDefault(); viser(ev); } }
  function haut(){ but = null; }
  racine.addEventListener('pointerdown', bas); racine.addEventListener('pointermove', bouge);
  racine.addEventListener('pointerup', haut); racine.addEventListener('pointercancel', haut); racine.addEventListener('lostpointercapture', haut);
  racine.addEventListener('contextmenu', function(e){ e.preventDefault(); });
  var FL = {ArrowLeft:[-1, 0], ArrowRight:[1, 0], ArrowUp:[0, -1], ArrowDown:[0, 1]};
  function tBas(e){ if(FL[e.key]){ touches[e.key] = 1; e.preventDefault(); } }
  function tHaut(e){ if(FL[e.key]) delete touches[e.key]; }
  window.addEventListener('keydown', tBas); window.addEventListener('keyup', tHaut);

  function finir(ok, F){
    if(fini) return; fini = true; but = null;
    if(ok){ U.son('magie'); dire(M.foret ? 'Moustache s\'est glissé dans le vieux puits !' : 'Les traces passent sous la grille de la crypte !'); }
    /* (Romain, 14 h 26 : « le jeu dit : Désolé, tu t'es trompé, tu n'as pas suivi la bonne trace ») */
    else { U.son('ko'); dire('Désolé, tu t\'es trompé : tu n\'as pas suivi la bonne trace.'); }
    setTimeout(function(){
      if(arrete) return;
      if(ok && M.foret) fin({reussi:true, score:1, message:'Le vieux puits !', detail:'Les traces de Moustache mènent au vieux puits, au bout de la forêt. Il s\'est glissé entre les barreaux de la grille.'});
      else if(ok) fin({reussi:true, score:1, message:'La crypte !', detail:'Les traces de Moustache passent sous la grille, au pied du clocher.'});
      else fin({reussi:false, score:0, message:'Désolé, tu t\'es trompé…', detail:'Tu n\'as pas suivi la bonne trace. ' + LIEUX[F.lieu].t + ' C\'était ' + CH.par[F.chat].nom + ' !'});
    }, ok ? 1500 : 2100);
  }

  /* ----- un chat qui passe en courant : il arrive derrière le Pisteur, le dépasse, tourne au carrefour, et saute sur un toit ----- */
  function lancerCoureur(force){
    var gx = M.gx, gy = M.gy, ci = -1, rj = -1, k;
    for(k = 0; k < gx.length; k++) if(Math.abs(pos.x - gx[k]) < RUE / 2) ci = k;
    for(k = 0; k < gy.length; k++) if(Math.abs(pos.y - gy[k]) < RUE / 2) rj = k;
    var dir;
    if(ci >= 0 && rj >= 0) dir = Math.abs(Math.cos(cap)) > Math.abs(Math.sin(cap)) ? [Math.cos(cap) > 0 ? 1 : -1, 0] : [0, Math.sin(cap) > 0 ? 1 : -1];
    else if(ci >= 0){ dir = [0, Math.sin(cap) >= 0 ? 1 : -1]; rj = 0; for(k = 0; k < gy.length; k++) if(Math.abs(gy[k] - pos.y) < Math.abs(gy[rj] - pos.y)) rj = k; }
    else if(rj >= 0){ dir = [Math.cos(cap) >= 0 ? 1 : -1, 0]; ci = 0; for(k = 0; k < gx.length; k++) if(Math.abs(gx[k] - pos.x) < Math.abs(gx[ci] - pos.x)) ci = k; }
    else return false;
    function dansG(a, b2){ return a >= 0 && b2 >= 0 && a < gx.length && b2 < gy.length; }
    /* le carrefour devant le Pisteur, et celui deux crans derrière lui (assez loin : hors de l'écran) */
    var dev = [ci, rj];
    if(dir[0] && (gx[ci] - pos.x) * dir[0] < 0) dev = [ci + dir[0], rj];
    if(dir[1] && (gy[rj] - pos.y) * dir[1] < 0) dev = [ci, rj + dir[1]];
    if(!dansG(dev[0], dev[1])){ dir = [-dir[0], -dir[1]]; dev = [ci, rj]; if(dir[0] && (gx[ci] - pos.x) * dir[0] < 0) dev = [ci + dir[0], rj]; if(dir[1] && (gy[rj] - pos.y) * dir[1] < 0) dev = [ci, rj + dir[1]]; if(!dansG(dev[0], dev[1])) return false; }
    var der = [dev[0] - dir[0] * 2, dev[1] - dir[1] * 2];
    if(!dansG(der[0], der[1])) der = [dev[0] - dir[0], dev[1] - dir[1]];
    if(!dansG(der[0], der[1])) return false;
    var noeuds = [der], c = der.slice();
    while(c[0] !== dev[0] || c[1] !== dev[1]){ c = [c[0] + dir[0], c[1] + dir[1]]; noeuds.push(c); }
    /* après : un cran tout droit ou de côté, puis un saut sur un toit */
    var opts = [[dir[0], dir[1]], [dir[1], dir[0]], [-dir[1], -dir[0]]].filter(function(d){ return dansG(c[0] + d[0], c[1] + d[1]); });
    if(opts.length){ var d2 = U.choix(opts); noeuds.push([c[0] + d2[0], c[1] + d2[1]]); }
    var o = U.choix([-20, -12, 12, 20]);
    var pts = noeuds.map(function(n){ return {x:gx[n[0]] + o, y:gy[n[1]] + o}; });
    var a = pts[pts.length - 2], z = pts[pts.length - 1], lg = Math.hypot(z.x - a.x, z.y - a.y), ux = (z.x - a.x) / lg, uy = (z.y - a.y) / lg;
    var mi = {x:a.x + ux * lg * .55, y:a.y + uy * lg * .55}, cote = Math.random() < .5 ? -1 : 1;
    pts[pts.length - 1] = mi;
    pts.push({x:mi.x - uy * cote * 70 + ux * 14, y:mi.y + ux * cote * 70 + uy * 14});
    pts = arrondir(pts, 22);
    /* (ce sont les six autres chats d'Odette — jamais Moustache : « il n'a qu'une seule trace ») */
    var ids = CH.liste.filter(function(cc){ return cc.id !== 'moustache' && !coureurs.some(function(q){ return q.chat === cc.id; }); });
    if(!ids.length) return false;
    var ch = U.choix(ids), ss = Math.random();
    /* ses pattes : un peu mouillées ou boueuses (il vient de passer quelque part), puis la prochaine flaque les remouille */
    coureurs.push({chat:ch.id, id:'c' + (++nCoureur), pts:pts, L:longueur(pts), s:0, v:U.rand(205, 240), ph:0, dPas:0, nPas:0, pres:false, al:1,
      sub:ss < .6 ? 'eau' : 'boue', d:U.rand(.1, .45) * ((M.vue || {}).eau || 200), dedans:null});
    nbCoureurs++;
    return true;
  }
  /* LE PASSAGE D'UN CHAT QUI COURT (Romain, 14 h 26 : « le passage des chats efface les traces » ; « il met ses traces par-dessus ») :
     tous les 7,5 pas, il efface les traces sous ses pattes ; tous les 15, il pose les siennes (dans le décor, pour de bon) ; dans une
     flaque, il se remouille. Le morceau du décor touché est redessiné. */
  var effacees = 0, poseesC = 0;
  function majCoureurs(dt, t){
    for(var i = coureurs.length - 1; i >= 0; i--){
      var C = coureurs[i];
      C.s += C.v * dt; C.ph += dt * 15; C.dPas += C.v * dt;
      var q = point(C.pts, Math.min(C.s, C.L)); C.x = q.x; C.y = q.y; C.a = q.a;
      var surRue = M.dansRue(q.x, q.y);
      if(!surRue) C.al = Math.max(0, C.al - dt * 3);
      while(C.dPas > 7.5){
        C.dPas -= 7.5; C.nPas++;
        var qs = point(C.pts, Math.max(0, Math.min(C.L, C.s - C.dPas)));
        if(!surRue || M.dansArche(qs.x, qs.y)) continue;
        var ta = M.dansTache(qs.x, qs.y, 1);
        if(ta){ if(ta !== C.dedans){ C.dedans = ta; if(Math.hypot(qs.x - pos.x, qs.y - pos.y) < 160) rides.push({x:qs.x, y:qs.y, t0:t, sub:DE_TACHE[ta.type], petit:true}); }
          C.sub = DE_TACHE[ta.type]; C.d = 0; continue; }
        C.dedans = null; C.d += 7.5;
        var n = M.effacer(qs.x, qs.y, 7, C.id);
        if(n){ effacees += n; if(blocs) blocs.salir(qs.x - 14, qs.y - 14, qs.x + 14, qs.y + 14); }
        if(C.nPas % 2) continue;
        var fo = force(C.sub, C.d, M.vue); if(fo < SEUIL) continue;
        var cote = C.nPas % 4 ? 1 : -1, tx = qs.x + Math.cos(qs.a + PI / 2) * 2.6 * cote, ty = qs.y + Math.sin(qs.a + PI / 2) * 2.6 * cote;
        if(!M.dansRue(tx, ty) || M.dansObstacle(tx, ty, 3) || M.dansTache(tx, ty, 1)) continue;
        M.poser({x:tx, y:ty, a:qs.a + PI / 2 + U.rand(-.12, .12), c:C.chat, sub:C.sub, al:fo, k:U.rand(.94, 1.06), g:nouvelleGraine(), own:C.id});
        poseesC++; if(blocs) blocs.salir(tx - 12, ty - 12, tx + 12, ty + 12);
      }
      var d = Math.hypot(C.x - pos.x, C.y - pos.y);
      if(!C.pres && d < 60){ C.pres = true; son('course', .9); direUneFois('coureur', 'Un chat te file sous le nez ! Sous ses pattes, les traces s\'effacent…'); }
      if(C.s >= C.L || C.al <= 0) coureurs.splice(i, 1);
    }
  }

  /* ----- chaque image ----- */
  var mesure = {images:0, t:0, tb:0, td:0, th:0, tl:0};
  var stop = U.boucle(function(dt, t){
    if(arrete) return false;
    if(!W) mesurer();
    tJeu = t; mesure.images++;
    var vx = 0, vy = 0, f = 0;
    if(!fini){
      if(but){ var d = Math.hypot(but.x, but.y); if(d > 16){ f = Math.min(1, (d - 10) / 46); vx = but.x / d; vy = but.y / d; } }
      else { Object.keys(touches).forEach(function(k){ vx += FL[k][0]; vy += FL[k][1]; }); var dk = Math.hypot(vx, vy); if(dk){ vx /= dk; vy /= dk; f = 1; } }
    }
    var avant = {x:pos.x, y:pos.y};
    if(f > 0){
      var pas = VITESSE * f * dt, nxp = pos.x + vx * pas, nyp = pos.y + vy * pas;
      if(libre(nxp, nyp)){ pos.x = nxp; pos.y = nyp; }
      else if(libre(nxp, pos.y)){ pos.x = nxp; f *= Math.abs(vx); }
      else if(libre(pos.x, nyp)){ pos.y = nyp; f *= Math.abs(vy); }
      else f = 0;
      var vise = Math.atan2(vy, vx), da = Math.atan2(Math.sin(vise - cap), Math.cos(vise - cap)); cap += da * Math.min(1, dt * 12);
      if(!aBouge && f > 0){ aBouge = true; dire(''); }
    }
    var fait = Math.hypot(pos.x - avant.x, pos.y - avant.y);
    marcheTot += fait;
    marche += (f - marche) * Math.min(1, dt * 10);
    phase += dt * 9.5 * marche;
    if(marche > .5){ tPas += dt; if(tPas > .36){ tPas = 0; U.son('pas'); } }
    if(anim) anim.poser({ph:phase, amp:marche, t:t});
    gH.setAttribute('transform', 'rotate(' + (cap * 180 / Math.PI + 90).toFixed(1) + ')');
    /* les semelles : une flaque, la boue, la farine les salissent ; ensuite, chaque pas laisse une trace (de moins en moins forte) */
    var ta = M.dansTache(pos.x, pos.y, 2);
    if(ta && ta !== dedansTache){
      var sub = DE_TACHE[ta.type];
      son(sub === 'eau' ? 'plouf' : sub === 'boue' ? 'floc' : 'pouf');
      rides.push({x:pos.x, y:pos.y, t0:t, sub:sub});
      if(sub === 'farine') for(var q = 0; q < 10; q++) poudre.push({x:pos.x, y:pos.y, vx:U.rand(-26, 26), vy:U.rand(-26, 26), t0:t, r:U.rand(2, 4.5)});
      direUneFois('semelle-' + sub, sub === 'eau' ? 'Plouf ! Tes semelles sont mouillées : maintenant, toi aussi, tu laisses des traces.' :
        sub === 'boue' ? 'Floc ! De la boue plein les chaussures… Attention à tes propres traces !' : 'Pouf ! De la farine partout : tes pas sont tout blancs.');
    }
    if(ta){ semelle.sub = DE_TACHE[ta.type]; semelle.c = 1; semelle.pas = 0; if(fait > 0 && Math.random() < dt * 6) rides.push({x:pos.x, y:pos.y, t0:t, sub:semelle.sub, petit:true}); }
    else if(semelle.sub && semelle.c > .06){
      semelle.pas += fait;
      if(semelle.pas > 11){
        semelle.pas = 0; semelle.cote = -semelle.cote;
        var S = SEMELLE[semelle.sub];
        mesPas.push({x:pos.x + Math.cos(cap + PI / 2) * 3.4 * semelle.cote, y:pos.y + Math.sin(cap + PI / 2) * 3.4 * semelle.cote, a:cap, al:S.a * semelle.c, t0:t, vie:S.vie, sub:semelle.sub, cote:semelle.cote});
        semelle.c *= S.perte;
        if(mesPas.length > 700) mesPas.splice(0, mesPas.length - 700);
      }
    }
    dedansTache = ta;
    /* les traces qui ont séché disparaissent */
    if(mesPas.length && (mesure.images % 30 === 0)) mesPas = mesPas.filter(function(m){ return t - m.t0 < m.vie; });
    /* les chats qui passent : un de plus toutes les CR.tous secondes, sans limite (dès qu'on a commencé à marcher) */
    if(!fini && aBouge){
      tCoureur -= dt;
      if(tCoureur <= 0 && f > .2 && Math.hypot(pos.x - mou.x, pos.y - mou.y) > 380){
        tCoureur = lancerCoureur() ? CR.tous * U.rand(.8, 1.2) : 1.5;
        /* (de temps en temps, deux à la fois) */
        if(nbCoureurs > 3 && Math.random() < .3) lancerCoureur();
      }
    }
    majCoureurs(dt, t);
    /* le hibou, dans les bois, la nuit */
    if(M.foret && moment === 'nuit' && M.estForet(pos.y)){ tHibou -= dt; if(tHibou <= 0){ tHibou = U.rand(12, 22); son('hibou', .7); } }
    /* les pigeons s'envolent quand on approche */
    M.pigeons.forEach(function(P){
      if(P.vol){ P.tv += dt; P.x += P.vx * dt; P.y += P.vy * dt; return; }
      var dd = Math.hypot(P.x - pos.x, P.y - pos.y);
      if(dd < 62 || coureurs.some(function(C){ return Math.hypot(C.x - P.x, C.y - P.y) < 40; })){
        P.vol = 1; P.tv = 0; var aa = Math.atan2(P.y - pos.y, P.x - pos.x) + U.rand(-.6, .6), vv = U.rand(110, 150); P.vx = Math.cos(aa) * vv; P.vy = Math.sin(aa) * vv; P.a = aa;
        if(!vus['pig' + Math.round(P.x0 / 60)]){ vus['pig' + Math.round(P.x0 / 60)] = 1; son('pigeons', .8); }
      } else if(Math.random() < dt * .5){ P.a += U.rand(-.8, .8); }
    });
    /* Moustache, devant la grille (ou sur la margelle du puits) : il miaule ; quand on arrive, il file entre les barreaux */
    var dm = Math.hypot(pos.x - mou.x, pos.y - mou.y), vuDe = U.borne(Math.min(W, H) / 2 / ech * .75, 60, 120);
    mou.t += dt;
    if(mou.etat === 'assis'){
      mou.prochain -= dt;
      if(mou.prochain <= 0){ mou.prochain = U.rand(2.2, 3.6); mou.miaou = .9; if(dm < 480) miaou('moustache', Math.min(1, 1.15 - dm / 480), (mou.x - pos.x) / 260); }
      /* il file quand le Pisteur est tout près (assez tard pour qu'on l'ait vu miauler, même sur un petit téléphone) */
      if(dm < vuDe && !fini){ mou.etat = 'fuite'; mou.t = 0; son('fuite', 1); direUneFois('moustache', M.foret ? 'Un gros chat gris se glisse entre les barreaux du vieux puits !' : 'Un gros chat gris file entre les barreaux de la grille !'); }
    } else if(mou.etat === 'fuite'){
      var u = Math.min(1, mou.t / .6);
      mou.x = lerp(mou.x0, mou.gx, u * u); mou.y = lerp(mou.y0, mou.gy, u * u); mou.a = Math.atan2(mou.gy - mou.y0, mou.gx - mou.x0);
      if(mou.t > .75) mou.etat = 'parti';
    }
    if(mou.miaou > 0) mou.miaou -= dt;
    /* LES SIX AUTRES CHATS, au bout de leur fausse piste : ils appellent (Romain : « on a envie d'aller vers le miaulement, mais des
       fois, c'est des fausses pistes ») ; trop près de l'un d'eux, c'est perdu (la ville), ou il file dans les fougères (la forêt) */
    fauxChats.forEach(function(Fc){
      Fc.t += dt; if(Fc.miaou > 0) Fc.miaou -= dt;
      if(Fc.etat === 'assis'){
        var dc = Math.hypot(pos.x - Fc.x, pos.y - Fc.y);
        Fc.prochain -= dt;
        if(Fc.prochain <= 0){ Fc.prochain = U.rand(2.6, 5.4); Fc.miaou = .9; if(dc < 480) miaou(Fc.chat, Math.min(1, 1.15 - dc / 480), (Fc.x - pos.x) / 260); }
        if(!fini && dans(Fc.F.rect, pos.x, pos.y, 2) && dc < vuDe + 10){
          if(perdre){ Fc.etat = 'regarde'; Fc.t = 0; finir(false, Fc.F); }
          else {
            /* la forêt : il bondit au fond des bois, et le conteur dit de rebrousser chemin */
            Fc.etat = 'fuite'; Fc.t = 0; son('course', .8);
            dire('Ce n\'est pas Moustache ! ' + CH.par[Fc.chat].nom + (Fc.F.foret ? ' file entre les fougères.' : ' saute par-dessus un mur.') + ' Ce n\'était pas la bonne trace : reviens sur tes pas.', 6200);
          }
        }
      } else if(Fc.etat === 'fuite'){
        var uf = Math.min(1, Fc.t / .7), fx = Fc.x0 + Fc.F.dx * 90, fy = Fc.y0 + Fc.F.dy * 90;
        Fc.x = lerp(Fc.x0, fx, uf); Fc.y = lerp(Fc.y0, fy, uf); Fc.a = Math.atan2(Fc.F.dy, Fc.F.dx);
        if(Fc.t > .9) Fc.etat = 'parti';
      }
    });
    /* au bout de la bonne piste ? */
    if(!fini && Math.hypot(pos.x - M.eglise.fx, pos.y - M.eglise.fy) < R_FIN + 6) finir(true);
    dessiner(t, dt);
  });

  /* ----- le dessin de chaque image ----- */
  function dessiner(t, dt){
    if(!W || !blocs) return;
    var ox = Math.round(cv.width / 2 - pos.x * s), oy = Math.round(cv.height / 2 - pos.y * s);
    var x0 = pos.x - W / 2 / ech - 40, x1 = pos.x + W / 2 / ech + 40, y0 = pos.y - H / 2 / ech - 40, y1 = pos.y + H / 2 / ech + 40;
    var t0 = performance.now();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    /* les morceaux du décor déjà dessinés (ceux qui manquent sont dessinés maintenant) */
    var b0 = Math.floor(-ox / CPX), b1 = Math.floor((cv.width - ox) / CPX), c0 = Math.floor(-oy / CPX), c1 = Math.floor((cv.height - oy) / CPX), a, b;
    var budget = {n:4};   /* (au plus quatre petits coins redessinés par image, là où un chat qui court a changé les traces) */
    for(a = b0; a <= b1; a++) for(b = c0; b <= c1; b++){ var bl = blocs.obtenir(a, b, true, budget); ctx.drawImage(bl, a * CPX + ox, b * CPX + oy); }
    /* et, s'il reste du temps, un morceau d'avance, là où l'on va */
    if(performance.now() - t0 < 6){
      var avx = Math.cos(cap) > .3 ? 1 : Math.cos(cap) < -.3 ? -1 : 0, avy = Math.sin(cap) > .3 ? 1 : Math.sin(cap) < -.3 ? -1 : 0, fait = false;
      for(a = b0 - 1; a <= b1 + 1 && !fait; a++) for(b = c0 - 1; b <= c1 + 1 && !fait; b++){
        if(a >= b0 && a <= b1 && b >= c0 && b <= c1) continue;
        if((avx && (a - b0) * avx < 0 && (a - b1) * avx < 0) || (avy && (b - c0) * avy < 0 && (b - c1) * avy < 0)) continue;
        if(!blocs.a(a, b)){ blocs.obtenir(a, b, true); fait = true; }
      }
    }
    var t1 = performance.now(); mesure.tb += t1 - t0;
    ctx.setTransform(s, 0, 0, s, ox, oy);
    /* l'ombre du linge */
    var oL = {x:L.ombre.x * 14 * L.ombre.l, y:L.ombre.y * 14 * L.ombre.l};
    M.linges.forEach(function(Ln){ if(Ln.cx > x0 - 60 && Ln.cx < x1 + 60 && Ln.cy > y0 - 60 && Ln.cy < y1 + 60) dessinerLinge(ctx, Ln, t, oL); });
    /* les rides d'une flaque, la boue qui gicle, la farine qui vole */
    for(var i = rides.length - 1; i >= 0; i--){
      var R = rides[i], age = t - R.t0, du = R.petit ? .6 : 1;
      if(age > du){ rides.splice(i, 1); continue; }
      ctx.strokeStyle = R.sub === 'eau' ? 'rgba(255,255,255,' + (.6 * (1 - age / du)).toFixed(3) + ')' : R.sub === 'boue' ? 'rgba(60,36,16,' + (.5 * (1 - age / du)).toFixed(3) + ')' : 'rgba(255,255,255,' + (.5 * (1 - age / du)).toFixed(3) + ')';
      ctx.lineWidth = 1; rond(ctx, R.x, R.y, (R.petit ? 4 : 6) + age * (R.petit ? 14 : 22)); ctx.stroke();
      if(!R.petit){ rond(ctx, R.x, R.y, 3 + age * 12); ctx.stroke(); }
    }
    /* les traces du Pisteur, et celles des chats qui passent (par-dessus les autres) */
    for(i = 0; i < mesPas.length; i++){
      var m = mesPas[i]; if(m.x < x0 || m.x > x1 || m.y < y0 || m.y > y1) continue;
      var vie = (t - m.t0) / m.vie, al = m.al * (vie < .55 ? 1 : Math.max(0, 1 - (vie - .55) / .45));
      if(al <= .01) continue;
      if(m.chat){ CH.dessiner(ctx, m.chat, m.x, m.y, m.a, TRACE, '#2a221e', al * .66); continue; }
      semelleTrace(ctx, m, al);
    }
    for(i = poudre.length - 1; i >= 0; i--){ var P2 = poudre[i], ag = t - P2.t0; if(ag > .9){ poudre.splice(i, 1); continue; }
      ctx.fillStyle = 'rgba(255,255,255,' + (.7 * (1 - ag / .9)).toFixed(3) + ')'; rond(ctx, P2.x + P2.vx * ag, P2.y + P2.vy * ag, P2.r * (1 + ag)); ctx.fill(); }
    /* les pigeons au sol, les chats qui courent, Moustache */
    M.pigeons.forEach(function(P){ if(!P.vol && P.x > x0 && P.x < x1 && P.y > y0 && P.y < y1) pigeon(ctx, P, t); });
    coureurs.forEach(function(C){ if(C.x > x0 - 30 && C.x < x1 + 30 && C.y > y0 - 30 && C.y < y1 + 30) chatCourt(ctx, CH.par[C.chat], C.x, C.y, C.a, C.ph, t, C.al); });
    if(mou.etat !== 'parti' && Math.abs(mou.x - pos.x) < (x1 - x0) / 2 + 40 && Math.abs(mou.y - pos.y) < (y1 - y0) / 2 + 40){
      if(mou.etat === 'assis') chatAssis(ctx, CH.par.moustache, mou.x, mou.y, mou.a, t, mou.miaou > .35);
      else chatCourt(ctx, CH.par.moustache, mou.x, mou.y, mou.a, mou.t * 22, t, Math.max(0, 1 - Math.max(0, mou.t - .4) / .35));
    }
    /* les six autres, au bout de leur fausse piste */
    fauxChats.forEach(function(Fc){
      if(Fc.etat === 'parti' || Math.abs(Fc.x - pos.x) > (x1 - x0) / 2 + 40 || Math.abs(Fc.y - pos.y) > (y1 - y0) / 2 + 40) return;
      if(Fc.etat === 'fuite') chatCourt(ctx, CH.par[Fc.chat], Fc.x, Fc.y, Fc.a, Fc.t * 22, t, Math.max(0, 1 - Math.max(0, Fc.t - .45) / .45));
      else chatAssis(ctx, CH.par[Fc.chat], Fc.x, Fc.y, Fc.a, t, Fc.miaou > .35 || Fc.etat === 'regarde');
    });
    /* la petite lueur qui bat, tout au fond de la crypte ; au fond du puits, quand Moustache y est, deux yeux qui brillent */
    var Eg = M.eglise;
    if(Math.abs(mou.gx - pos.x) < (x1 - x0) / 2 + 40 && Math.abs(mou.gy - pos.y) < (y1 - y0) / 2 + 40){
      if(!M.foret){ ctx.fillStyle = 'rgba(255,214,110,' + (.16 + .1 * Math.sin(t * 2.2)).toFixed(3) + ')'; ovale(ctx, mou.gx, mou.gy, 11, 7, Math.atan2(Eg.dy, Eg.dx) + PI / 2); ctx.fill(); }
      else if(mou.etat === 'parti' && Math.sin(t * 1.7) > -.85){ ctx.fillStyle = '#f2d04a'; rond(ctx, mou.gx - 2.2, mou.gy + 1, .95); ctx.fill(); rond(ctx, mou.gx + 2.2, mou.gy + 1, .95); ctx.fill(); }
    }
    var t2 = performance.now(); mesure.td += t2 - t1;
    dessinerHaut(t, ox, oy, x0, x1, y0, y1);
    var t3 = performance.now(); mesure.th += t3 - t2;
    dessinerLumiere(t);
    var t4 = performance.now(); mesure.tl += t4 - t3;
    mesure.t += t4 - t0;
  }
  function semelleTrace(x, m, al){
    var S = SEMELLE[m.sub];
    x.save(); x.translate(m.x, m.y); x.rotate(m.a + PI / 2); x.globalAlpha = al;
    x.fillStyle = S.c;
    ovale(x, 0, -2.2, 2.3, 3.1, 0); x.fill();       /* l'avant de la semelle */
    ovale(x, 0, 3.4, 1.8, 2, 0); x.fill();          /* le talon */
    if(m.sub === 'boue'){ x.fillStyle = 'rgba(30,18,8,.5)'; ovale(x, 0, -2.4, 1.2, 1.8, 0); x.fill(); }
    x.restore();
  }
  function sprite(cle, bb, f){
    if(sprites[cle]) return sprites[cle];
    var c = document.createElement('canvas'), w = Math.ceil(bb.w * s) + 4, h = Math.ceil(bb.h * s) + 4;
    c.width = w; c.height = h;
    var x = c.getContext('2d'); x.setTransform(s, 0, 0, s, -bb.x * s + 2, -bb.y * s + 2); f(x);
    return (sprites[cle] = {c:c, x:bb.x - 2 / s, y:bb.y - 2 / s, w:w / s, h:h / s});
  }
  /* au-dessus du Pisteur : les toits des passages couverts, les arbres qui débordent, le linge, la fumée, les pigeons qui volent, « Miaou ! » */
  function dessinerHaut(t, ox, oy, x0, x1, y0, y1){
    var rien = true;
    function vu(bb, m){ return bb.x < x1 + m && bb.x + bb.w > x0 - m && bb.y < y1 + m && bb.y + bb.h > y0 - m; }
    hx.setTransform(1, 0, 0, 1, 0, 0);
    if(hautSale){ hx.clearRect(0, 0, cvH.width, cvH.height); hautSale = false; cvH.style.visibility = 'hidden'; }   /* (vide : le navigateur ne la pose même plus) */
    var dessinsH = [];
    M.arches.forEach(function(A, i){ if(A.foret && vu(A.bat, 40)) dessinsH.push(function(){
      /* la voûte de la forêt : un grand chêne penché par-dessus le chemin ; on le voit à travers quand on passe dessous */
      var rA = Math.max(A.bat.w, A.bat.h) * .56, bbA = {x:A.cx - rA - 4, y:A.cy - rA - 4, w:2 * rA + 8, h:2 * rA + 8};
      var spA = sprite('voute' + i, bbA, function(x){ dessinerArbre(x, {x:A.cx, y:A.cy, r:rA, sorte:'chene', g:A.g}, L); });
      hx.globalAlpha = dans(A, pos.x, pos.y, 10) ? .35 : .97; hx.drawImage(spA.c, spA.x, spA.y, spA.w, spA.h); hx.globalAlpha = 1; });
    else if(!A.foret && vu(A.bat, 30)) dessinsH.push(function(){
      var sp = sprite('arche' + i, A.bat, function(x){ dessinerToit(x, {x:A.bat.x, y:A.bat.y, w:A.bat.w, h:A.bat.h, sens:A.sens === 'h' ? 'v' : 'h', c:TUILES[i % TUILES.length], toit:'tuile', chem:[{u:A.sens === 'h' ? .5 : .2, v:A.sens === 'h' ? .2 : .5}], lucarne:true, g:A.g}, L);
        /* les arcs de pierre, de chaque côté */
        x.fillStyle = '#9a8e7a'; x.strokeStyle = K; x.lineWidth = 1.2;
        if(A.sens === 'h'){ x.fillRect(A.bat.x - 1, A.y - 2, 4, A.h + 4); x.strokeRect(A.bat.x - 1, A.y - 2, 4, A.h + 4); x.fillRect(A.bat.x + A.bat.w - 3, A.y - 2, 4, A.h + 4); x.strokeRect(A.bat.x + A.bat.w - 3, A.y - 2, 4, A.h + 4); }
        else { x.fillRect(A.x - 2, A.bat.y - 1, A.w + 4, 4); x.strokeRect(A.x - 2, A.bat.y - 1, A.w + 4, 4); x.fillRect(A.x - 2, A.bat.y + A.bat.h - 3, A.w + 4, 4); x.strokeRect(A.x - 2, A.bat.y + A.bat.h - 3, A.w + 4, 4); }
      });
      if(!dans(A, pos.x, pos.y, 8)){ hx.drawImage(sp.c, sp.x, sp.y, sp.w, sp.h); return; }
      /* le Pisteur est dessous : le toit devient transparent au-dessus de la rue seulement (les deux bouts, sur les maisons, restent) */
      hx.save(); hx.beginPath(); hx.rect(A.bat.x - 2, A.bat.y - 2, A.bat.w + 4, A.bat.h + 4); hx.rect(A.x + A.w, A.y, -A.w, A.h); hx.clip('evenodd');
      hx.drawImage(sp.c, sp.x, sp.y, sp.w, sp.h); hx.restore();
      hx.save(); hx.beginPath(); hx.rect(A.x, A.y, A.w, A.h); hx.clip(); hx.globalAlpha = .4; hx.drawImage(sp.c, sp.x, sp.y, sp.w, sp.h); hx.restore(); }); });
    M.dessus.forEach(function(a, i){ var bb = {x:a.x - a.r - 4, y:a.y - a.r - 4, w:2 * a.r + 8, h:2 * a.r + 8}; if(vu(bb, 20)) dessinsH.push(function(){
      var sp = sprite('arbre' + i, bb, function(x){ dessinerArbre(x, a, L); });
      hx.globalAlpha = Math.hypot(pos.x - a.x, pos.y - a.y) < a.r * .95 ? .4 : .96; hx.drawImage(sp.c, sp.x, sp.y, sp.w, sp.h); hx.globalAlpha = 1; }); });
    M.linges.forEach(function(Ln){ if(Ln.cx > x0 - 50 && Ln.cx < x1 + 50 && Ln.cy > y0 - 50 && Ln.cy < y1 + 50) dessinsH.push(function(){ dessinerLinge(hx, Ln, t); }); });
    M.pigeons.forEach(function(P){ if(P.vol && P.tv < 2.2 && P.x > x0 - 40 && P.x < x1 + 40 && P.y > y0 - 40 && P.y < y1 + 40) dessinsH.push(function(){ hx.globalAlpha = Math.max(0, 1 - Math.max(0, P.tv - 1.4) / .8); pigeon(hx, P, t); hx.globalAlpha = 1; }); });
    [mou].concat(fauxChats).forEach(function(cA){ if(cA.miaou > 0 && cA.etat === 'assis' && Math.abs(cA.x - pos.x) < (x1 - x0) / 2 && Math.abs(cA.y - pos.y) < (y1 - y0) / 2) dessinsH.push(function(){
      var al = Math.min(1, cA.miaou * 3), bxx = cA.x + 10, byy = cA.y - 22 - (.9 - cA.miaou) * 6;
      hx.globalAlpha = al; hx.fillStyle = '#fffdf4'; hx.strokeStyle = K; hx.lineWidth = 1.2; hx.beginPath(); rr(hx, bxx - 16, byy - 7, 32, 13, 6); hx.fill(); hx.stroke();
      hx.beginPath(); hx.moveTo(bxx - 7, byy + 6); hx.lineTo(bxx - 10, byy + 11); hx.lineTo(bxx - 2, byy + 6); hx.closePath(); hx.fill(); hx.stroke(); hx.fillStyle = '#fffdf4'; hx.fillRect(bxx - 8, byy + 4, 6, 2.4);
      hx.fillStyle = K; hx.font = '700 7.6px system-ui, sans-serif'; hx.textAlign = 'center'; hx.textBaseline = 'middle'; hx.fillText('Miaou !', bxx, byy - .4); hx.globalAlpha = 1; }); });
    if(dessinsH.length){
      hx.clearRect(0, 0, cvH.width, cvH.height); hx.setTransform(s, 0, 0, s, ox, oy); dessinsH.forEach(function(f){ f(); }); hautSale = true; rien = false;
      if(cvH.style.visibility) cvH.style.visibility = '';
    }
    return rien;
  }
  /* la lumière : la nuit (le noir, la lanterne du Pisteur, les lanternes, les fenêtres), la brume du matin, le soleil de l'après-midi */
  function dessinerLumiere(t){
    var aw = cvA.width, ah = cvA.height, sw = ech * aw / W;
    ax.setTransform(1, 0, 0, 1, 0, 0); ax.clearRect(0, 0, aw, ah);
    function A(xw, yw){ return [(xw - pos.x) * sw + aw / 2, (yw - pos.y) * sw + ah / 2]; }
    if(moment === 'nuit'){
      ax.fillStyle = 'rgba(6,10,30,.76)'; ax.fillRect(0, 0, aw, ah);
      var ls = [{x:pos.x + Math.cos(cap + .7) * 8, y:pos.y + Math.sin(cap + .7) * 8, r:132 * (1 + .03 * Math.sin(t * 9) + .02 * Math.sin(t * 23)), f:.97, c:1}].concat(lumieres);
      var vis = ls.filter(function(l){ var p2 = A(l.x, l.y), rr2 = l.r * sw; return p2[0] > -rr2 && p2[0] < aw + rr2 && p2[1] > -rr2 && p2[1] < ah + rr2; });
      ax.globalCompositeOperation = 'destination-out';
      vis.forEach(function(l){ var p2 = A(l.x, l.y), rr2 = l.r * sw, g = ax.createRadialGradient(p2[0], p2[1], 0, p2[0], p2[1], rr2);
        g.addColorStop(0, 'rgba(0,0,0,' + l.f + ')'); g.addColorStop(.5, 'rgba(0,0,0,' + (l.f * .7).toFixed(3) + ')'); g.addColorStop(1, 'rgba(0,0,0,0)'); ax.fillStyle = g; ax.fillRect(p2[0] - rr2, p2[1] - rr2, rr2 * 2, rr2 * 2); });
      ax.globalCompositeOperation = 'lighter';
      vis.forEach(function(l){ var p2 = A(l.x, l.y), rr2 = l.r * sw * .8, g = ax.createRadialGradient(p2[0], p2[1], 0, p2[0], p2[1], rr2);
        g.addColorStop(0, 'rgba(255,176,80,' + (.2 * l.c).toFixed(3) + ')'); g.addColorStop(1, 'rgba(255,176,80,0)'); ax.fillStyle = g; ax.fillRect(p2[0] - rr2, p2[1] - rr2, rr2 * 2, rr2 * 2); });
      ax.globalCompositeOperation = 'source-over';
    } else if(moment === 'matin'){
      ax.fillStyle = 'rgba(255,214,186,.08)'; ax.fillRect(0, 0, aw, ah);
      brumes.forEach(function(B){ if(B.bois) return; var bx = B.x + t * B.v, p2 = A(((bx + 400) % (M.W + 800)) - 400, B.y), rr2 = B.r * sw;
        if(p2[0] < -rr2 || p2[0] > aw + rr2 || p2[1] < -rr2 || p2[1] > ah + rr2) return;
        var g = ax.createRadialGradient(p2[0], p2[1], 0, p2[0], p2[1], rr2); g.addColorStop(0, 'rgba(240,244,252,.3)'); g.addColorStop(1, 'rgba(240,244,252,0)'); ax.fillStyle = g; ax.fillRect(p2[0] - rr2, p2[1] - rr2, rr2 * 2, rr2 * 2); });
    } else {
      var g2 = ax.createLinearGradient(0, 0, aw, ah); g2.addColorStop(0, 'rgba(255,226,150,.1)'); g2.addColorStop(1, 'rgba(255,200,120,.03)'); ax.fillStyle = g2; ax.fillRect(0, 0, aw, ah);
    }
    /* la forêt : une brume légère entre les arbres ; la nuit, les lucioles qui s'allument et s'éteignent */
    if(M.foret){
      var cb = moment === 'nuit' ? '170,190,230' : '236,240,248', ab = moment === 'nuit' ? .1 : moment === 'matin' ? .26 : .14;
      brumes.forEach(function(B){ if(!B.bois) return; var bx = B.x + t * B.v, p2 = A(((bx + 400) % (M.W + 800)) - 400, B.y), rr2 = B.r * sw;
        if(p2[0] < -rr2 || p2[0] > aw + rr2 || p2[1] < -rr2 || p2[1] > ah + rr2) return;
        var g = ax.createRadialGradient(p2[0], p2[1], 0, p2[0], p2[1], rr2); g.addColorStop(0, 'rgba(' + cb + ',' + ab + ')'); g.addColorStop(1, 'rgba(' + cb + ',0)'); ax.fillStyle = g; ax.fillRect(p2[0] - rr2, p2[1] - rr2, rr2 * 2, rr2 * 2); });
      if(moment === 'nuit'){
        ax.globalCompositeOperation = 'lighter';
        M.lucioles.forEach(function(Lc){
          var lx = Lc.x + Math.sin(t * .7 * Lc.v + Lc.ph) * Lc.r, ly = Lc.y + Math.cos(t * .5 * Lc.v + Lc.ph * 1.3) * Lc.r * .7, p2 = A(lx, ly);
          if(p2[0] < -8 || p2[0] > aw + 8 || p2[1] < -8 || p2[1] > ah + 8) return;
          var on = Math.max(0, Math.sin(t * 1.6 * Lc.v + Lc.ph * 3)); if(on < .05) return;
          var rr3 = 5 * sw, g = ax.createRadialGradient(p2[0], p2[1], 0, p2[0], p2[1], rr3);
          g.addColorStop(0, 'rgba(220,255,140,' + (.9 * on).toFixed(3) + ')'); g.addColorStop(.3, 'rgba(180,240,90,' + (.35 * on).toFixed(3) + ')'); g.addColorStop(1, 'rgba(180,240,90,0)');
          ax.fillStyle = g; ax.fillRect(p2[0] - rr3, p2[1] - rr3, rr3 * 2, rr3 * 2);
        });
        ax.globalCompositeOperation = 'source-over';
      }
    }
    /* la fumée des cheminées : floue de toute façon, elle est dessinée ici, sur la petite toile (rien à redessiner en grand) */
    var hw = W / 2 / ech, hh = H / 2 / ech;
    ax.setTransform(sw, 0, 0, sw, aw / 2 - pos.x * sw, ah / 2 - pos.y * sw);
    fumees.forEach(function(c){ if(c.x > pos.x - hw - 30 && c.x < pos.x + hw + 70 && c.y > pos.y - hh - 70 && c.y < pos.y + hh + 30) dessinerFumee(ax, c, t, c.fort || moment !== 'apresmidi', moment === 'nuit' ? .16 : .8); });
  }
  /* pour les essais */
  racine.__pistage = {monde:M, moment:moment, etat:function(){ return {x:pos.x, y:pos.y, fini:fini, ech:ech}; },
    poser:function(x, y){ pos.x = x; pos.y = y; }, aller:function(vx, vy){ but = vx == null ? null : {x:vx, y:vy}; }, libre:libre,
    coureur:function(){ return lancerCoureur(true); }, coureurs:function(){ return coureurs.map(function(C){ return {chat:C.chat, x:C.x, y:C.y}; }); },
    moustache:function(){ return {etat:mou.etat, x:mou.x, y:mou.y}; }, pas:function(){ return mesPas.filter(function(m){ return !m.chat; }).length; },
    pasChats:function(){ return poseesC; }, effacees:function(){ return effacees; }, perdre:perdre, nbCoureurs:function(){ return nbCoureurs; }, dits:function(){ return journal.slice(); },
    fauxChats:function(){ return fauxChats.map(function(F){ return {chat:F.chat, etat:F.etat, x:F.x, y:F.y, lieu:F.F.lieu}; }); },
    chaussures:function(){ return {sub:semelle.sub, c:semelle.c}; },
    mesures:function(){ return {images:mesure.images, ms:mesure.t, decor:mesure.tb, bouge:mesure.td, dessus:mesure.th, lumiere:mesure.tl, blocs:blocs ? blocs.stats : null}; }};
  return {arreter:function(){
    arrete = true; try{ stop(); }catch(e){}
    if(tDit) clearTimeout(tDit);
    if(ro) ro.disconnect(); else window.removeEventListener('resize', mesurer);
    window.removeEventListener('keydown', tBas); window.removeEventListener('keyup', tHaut);
    if(blocs) blocs.vider();
  }};
}

MJ.enregistrer('pistage', {
  nom:'Suivre les traces', ic:'🐾', role:'pisteur',
  consigne:function(pa){ return 'Les sept chats d\'Odette ont laissé leurs traces. Marche, regarde bien les pattes, et suis celles de Moustache. Les flaques les font réapparaître. ' +
    (pa && pa.decor === 'foret' ? 'Elles mènent au fond de la forêt.' : 'Trop près d\'un autre chat, c\'est perdu.'); },
  /* (15 novembre, 14 h 26) toujours les sept chats ; la difficulté : jusqu'où une trace se voit après une flaque, combien de bouts de rue
     ont une flaque, la place qu'on laisse sans flaque sur la piste de Moustache, les chats qui passent en courant */
  reglages:function(n, mods){
    var p = {}, nn = U.borne((n - 1) / 9, 0, 1), aide = mods.aide ? 1.25 : 1;
    p.faux = 6;                           /* les sept chats d'Odette : Moustache et six fausses pistes */
    p.cinq = true;                        /* (Noisette, à cinq doigts, est toujours là) */
    p.nx = n <= 5 ? 5 : 6; p.ny = 4;
    p.taux = lerp(.8, .5, nn);            /* la part des bouts de rue qui ont une flaque, de la boue (en travers) */
    p.boue = .32;
    p.vue = {lait:lerp(330, 200, nn) * aide, eau:lerp(250, 150, nn) * aide, boue:lerp(330, 210, nn) * aide, farine:lerp(300, 180, nn) * aide};
    p.ecart = lerp(280, 470, nn);         /* sur la piste de Moustache, jamais plus loin que ça sans une flaque */
    p.trou = lerp(.04, .22, nn);          /* des traces qui manquent, quand elles sont presque effacées */
    p.arches = n <= 2 ? 1 : n <= 6 ? 2 : 3;
    p.sauts = n <= 2 ? 1 : n <= 5 ? 2 : 3;
    p.coureurs = {premier:lerp(9, 5, nn), tous:lerp(15, 8, nn)};   /* les chats qui passent : le premier, puis un toutes les … secondes */
    p.branches = n <= 3 ? 2 : 3;
    p.lignes = [{nom:'Les chats', val:'7'}, {nom:'Le quartier', val:p.nx + ' rues sur ' + p.ny}, {nom:'Rues avec une flaque', val:Math.round(p.taux * 100) + ' %'},
      {nom:'Une trace se voit', val:Math.round(p.vue.eau) + ' pas'}, {nom:'Un chat passe toutes les', val:Math.round(p.coureurs.tous) + ' s'}, {nom:'Passages couverts', val:String(p.arches)}];
    return p;
  },
  jouer:jouer
});
MJ.PLEIN_ECRAN = MJ.PLEIN_ECRAN || {}; MJ.PLEIN_ECRAN.pistage = 1;
MJ.LARGE = MJ.LARGE || {}; MJ.LARGE.pistage = 1;
MJ.PHRASES = MJ.PHRASES || {}; MJ.PHRASES.pistage = 'Suis les traces de Moustache. Les flaques les font réapparaître !';

/* ==========================================================
   L'explication en images, avant de jouer (MJ.DEMOS.pistage) : le Pisteur au milieu, trois pistes de petites pattes qui se
   séparent ; celle du milieu traverse une flaque (ses traces deviennent sombres) ; un doigt se pose, il marche vers lui ; au bout,
   la grille et Moustache ; au bout des deux autres, une croix.
   ========================================================== */
MJ.DEMOS = MJ.DEMOS || {};
MJ.DEMOS.pistage = {w:340, h:190, f:function(el){
  var W = 340, H = 190;
  el.innerHTML = '<canvas width="' + W * 2 + '" height="' + H * 2 + '" style="width:' + W + 'px;height:' + H + 'px;display:block;border-radius:14px"></canvas>' +
    '<svg viewBox="-22 -22 44 44" style="position:absolute;left:0;top:0;width:58px;height:58px;pointer-events:none"><g class="pgd-h"></g></svg><div class="pgd-doigt" style="position:absolute;left:0;top:0;font-size:30px;line-height:1;pointer-events:none">👆</div>';
  el.style.position = 'relative';
  var cv = el.querySelector('canvas'), x = cv.getContext('2d'), sv = el.querySelector('svg'), g = el.querySelector('.pgd-h'), doigt = el.querySelector('.pgd-doigt'), anim = null;
  try{ if(MJ.DESSUS){ g.innerHTML = MJ.DESSUS.pisteur(); anim = MJ.DESSUS.Bonhomme(g); } }catch(e){}
  var A = [{c:'moustache', pts:[{x:40, y:96}, {x:150, y:100}, {x:300, y:100}]}, {c:'pompon', pts:[{x:40, y:88}, {x:140, y:86}, {x:150, y:30}]}, {c:'caramel', pts:[{x:40, y:106}, {x:200, y:112}, {x:210, y:168}]}];
  /* (15 novembre) deux flaques en travers de la rue : les traces de lait s'effacent avant la première, reviennent toutes sombres après,
     s'effacent encore, et celles de Moustache reviennent après la deuxième */
  var MF = [1, .95, 1.05, 1, .92, 1.08, 1, .96, 1.04, 1, .97, 1.03, 1, 1];
  var tP = null, tH = null, Lm = LUM.apresmidi, flaque = {type:'flaque', x:96, y:100, rx:11, ry:46, rot:0, m:MF, g:5, travers:true}, flaque2 = {type:'flaque', x:262, y:100, rx:10, ry:46, rot:0, m:MF, g:9, travers:true};
  function fond(){
    x.setTransform(2, 0, 0, 2, 0, 0);
    if(!tH){ try{ tP = tuile(2, 'paves'); tH = tuile(2, 'herbe'); }catch(e){} }
    if(tH) carreler(x, tH, {x:0, y:0, w:W, h:H}, tH.width / 2); else { x.fillStyle = '#6fa85a'; x.fillRect(0, 0, W, H); }
    var rues = [{x:0, y:71, w:W, h:58}, {x:125, y:0, w:50, h:72}, {x:185, y:128, w:50, h:62}];
    x.fillStyle = '#8f8270'; rues.forEach(function(r){ x.fillRect(r.x - 3, r.y - 3, r.w + 6, r.h + 6); });
    x.save(); x.beginPath(); rues.forEach(function(r){ x.rect(r.x, r.y, r.w, r.h); }); x.clip();
    if(tP) carreler(x, tP, {x:0, y:0, w:W, h:H}, tP.width / 2); else { x.fillStyle = '#b7a58a'; x.fillRect(0, 0, W, H); }
    x.restore();
    try{ dessinerTache(x, flaque, Lm, [rues[0]]); dessinerTache(x, flaque2, Lm, [rues[0]]); }catch(e){}
    A.forEach(function(P, ip){
      var pts = arrondir(P.pts, 16), L = longueur(pts), s = 8, n = 0, sub = 'lait', c = 1;
      while(s < L - 4){
        var q = point(pts, s), cc = n % 2 ? 1 : -1, px = q.x + Math.cos(q.a + 1.5708) * 3.2 * cc, py = q.y + Math.sin(q.a + 1.5708) * 3.2 * cc;
        if(dansForme(flaque, px, py, 3) || dansForme(flaque2, px, py, 3)){ sub = 'eau'; c = 1; s += 19; n++; continue; }
        if(c > .2) dessinerTrace(x, {x:px, y:py, a:q.a + 1.5708, c:P.c, sub:sub, al:c, k:1.3, g:n + 1});
        c *= sub === 'eau' ? .78 : .7;
        s += 19; n++;
      }
    });
    x.strokeStyle = '#e5484d'; x.lineWidth = 5; x.lineCap = 'round'; [[150, 18], [210, 178]].forEach(function(q){ x.beginPath(); x.moveTo(q[0] - 8, q[1] - 8); x.lineTo(q[0] + 8, q[1] + 8); x.moveTo(q[0] + 8, q[1] - 8); x.lineTo(q[0] - 8, q[1] + 8); x.stroke(); });
  }
  fond();
  var img = null; try{ img = document.createElement('canvas'); img.width = cv.width; img.height = cv.height; img.getContext('2d').drawImage(cv, 0, 0); }catch(e){ img = null; }
  var pts = arrondir(A[0].pts, 16), L = longueur(pts);
  function image(u, t){
    if(img){ x.setTransform(1, 0, 0, 1, 0, 0); x.drawImage(img, 0, 0); }
    x.setTransform(2, 0, 0, 2, 0, 0);
    /* la grille, au bout, et Moustache qui attend devant */
    x.fillStyle = '#17131f'; x.strokeStyle = K; x.lineWidth = 2.4; x.beginPath(); x.moveTo(334, 84); x.lineTo(322, 84); x.arc(322, 100, 16, -1.5708, 1.5708, true); x.lineTo(334, 116); x.closePath(); x.fill(); x.stroke();
    x.strokeStyle = '#c9c4b8'; x.lineWidth = 1.8; [90, 96, 102, 108].forEach(function(y){ x.beginPath(); x.moveTo(310, y); x.lineTo(334, y); x.stroke(); });
    if(u < .86) try{ chatAssis(x, CH.par.moustache, 300, 100, PI, t, Math.sin(t * 3) > .6); }catch(e){}
    var q = point(pts, 4 + (L - 36) * u), d = point(pts, Math.min(L, 4 + (L - 36) * u + 62));
    sv.style.transform = 'translate(' + (q.x - 29) + 'px,' + (q.y - 29) + 'px)'; g.setAttribute('transform', 'rotate(' + (q.a * 180 / Math.PI + 90).toFixed(1) + ')');
    doigt.style.transform = 'translate(' + (d.x - 12) + 'px,' + (d.y - 2) + 'px)';
    if(anim) anim.poser({ph:u * 40, amp:u > 0 && u < 1 ? 1 : 0, t:u * 5});
  }
  if(reduit()){ image(.45, 0); return {arreter:function(){}}; }
  var t0 = null, arr = false;
  (function tic(ts){ if(arr) return; if(t0 === null) t0 = ts; var tt = (ts - t0) / 1000, u = (tt % 5.4) / 4.2; image(Math.min(1, u), tt); requestAnimationFrame(tic); })(performance.now());
  return {arreter:function(){ arr = true; }};
}};
})();
