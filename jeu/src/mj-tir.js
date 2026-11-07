/* ==========================================================
   TIR À L'ARC (Pisteur) — refait le 6 novembre 2026 (Romain, 2 h 34) :
   « la charte graphique n'était pas bonne ; une version ville avec un
   clocher et, en haut du clocher, un ballon ; une deuxième version avec un
   cerf-volant ; une troisième en ville où il faut installer des banderoles :
   avec son arc, il tire des banderoles pour les attacher (trucs malins pour
   que ce soit joli) ; refais le personnage ; des petits pièges avec des
   oiseaux, des trucs qui gênent ; agréable et fluide. »

   Le moteur ne change pas (Romain : « tu prends à peu près le même moteur ») :
   on bande l'arc comme un lance-pierre, la flèche suit une courbe (gravité +
   vent), arc bandé à fond = la flèche transperce, flèches limitées (les cœurs
   = les flèches de réserve), ralenti sur les beaux tirs. Ce qui change :
   - le décor : la place de Brumeval en fin d'après-midi (ciel chaud, nuages
     qui passent, maisons à colombages, cheminées qui fument), le clocher et sa
     Grosse Marie, la girouette qui suit le vent ;
   - l'archer : un vrai personnage, de profil, qui se penche en arrière quand
     il vise haut, tire la corde jusqu'à sa joue, sourit quand il touche ;
   - params.decor = 'clocher' (par défaut, enquête 1) : le ballon rouge d'un
     enfant, coincé en haut du clocher : il faut couper sa ficelle ; il
     redescend doucement jusqu'à l'enfant. Les autres cibles : des lampions,
     des cibles de paille, des ballons de baudruche qui volent (pop !) ;
     'cerfvolant' (enquête 2) : le cerf-volant coincé au clocher (sa ficelle
     à couper, il bat au vent) ; 'banderoles' (enquête 3) : chaque flèche
     emporte une banderole de petits drapeaux ; elle s'accroche à l'anneau
     touché, puis son autre bout file en haut du mât de la fête. Transpercer
     deux anneaux d'un coup les relie par la même banderole. À la fin, tout
     s'illumine.
   - les pièges d'oiseaux : des pigeons traversent (la flèche les effleure :
     ils s'envolent, la flèche tombe) ; un pigeon vient se poser sur une cible
     ou un anneau : tant qu'il est là, on ne peut pas la toucher (attends qu'il
     reparte !) ; des drapeaux qui battent au vent devant les cibles.
   Mods : les mêmes qu'avant (erreurs, fleches, zone, lent, stable, ralenti,
   temps, aide, revele).

   Retours de Romain (6 novembre, 9 h 02) :
   - le ballon et le cerf-volant : il ne faut toucher QUE la ficelle ; une flèche
     dans le ballon le fait éclater, dans le cerf-volant le déchire : perdu ;
   - le vent change de sens toutes les 3,5 à 6 secondes (au hasard), avec une
     vraie transition : les drapeaux retombent, puis repartent de l'autre côté
     (Vent()) ; il pousse un peu moins les flèches qu'avant, et les petits
     points de visée en tiennent compte ;
   - les drapeaux : sur des mâts (sur un toit, sur le clocher), moins gênants,
     ils flottent du côté où souffle le vent ; pendant la transition, on peut
     tirer à côté ;
   - des corbeaux grognons : ils se posent sur les cibles (une flèche les
     chasse : « Croâ ! », sans jamais les blesser) ; ceux qui volent en huit
     sont des cibles à chasser (à la place des ballons de baudruche, pour ne
     pas mélanger avec le ballon qu'il ne faut pas toucher) ;
   - les oiseaux qui traversent : en courbe, ailes qui battent puis planent ;
     au niveau 9 et plus, de grosses tourterelles en plus ;
   - les banderoles : la guirlande reste accrochée à l'arc ; chaque flèche
     l'emmène jusqu'à l'anneau suivant ; quand tous les anneaux sont touchés,
     elle se détache de l'arc et file en haut du mât ; aux niveaux 5 et plus,
     des anneaux au bout des drapeaux, qui bougent avec le vent.
   ========================================================== */
(function(){
'use strict';
var MJ = window.MJ;
if(!MJ || !MJ.PA){ if(window.console) console.error('mj-tir : mj-pisteur-alchi.js doit être chargé avant.'); return; }
var U = MJ.util, A = MJ.PA, K = A.CONTOUR, DEC = A.DEC;
var dist = A.dist, svgNoeud = A.svgNoeud, fixe = A.fixe, courbe = A.courbe, entier = A.entier;
function f1(v){ return (Math.round(v * 10) / 10).toString(); }
function f0(v){ return Math.round(v).toString(); }
function R(a, b){ return a + Math.random() * (b - a); }
function st(n){ return ' stroke="' + K + '" stroke-width="' + n + '"'; }
function lisse(u){ u = fixe(u, 0, 1); return u * u * (3 - 2 * u); }

var ARC = {g:560, v:610, tire:118, x:62, y:398};
var PERCE = 0.95;
var SUPER_EXPLIQUEE = false;
var RETARD_VENT = 1.4;   /* (le décor suit le vent avec 1,4 s de retard sur les feuilles) */   /* (le bandeau de la super flèche : une fois, la première fois qu'on tire à fond) */
var SOL = 422;
var ENF = 300;   /* l'enfant qui attend son ballon (devant la porte du clocher : le seau descend maintenant jusqu'en bas) */
var MODES = {clocher:1, cerfvolant:1, banderoles:1};
/* les cibles de chaque version, à la place de celles de l'ancien jeu (mêmes mouvements, même difficulté) :
   lanterne = se balance au bout d'un fil ; pomme = presque immobile ; corbeau = vole en huit ; sac = une ficelle à couper */
var HABIT = {
  clocher:{lanterne:'lampion', pomme:'cible', corbeau:'corbeau', sac:'ballon'},
  cerfvolant:{lanterne:'lampion', pomme:'cible', corbeau:'corbeau', sac:'cerfvolant'},
  banderoles:{lanterne:'enseigne', pomme:'anneau', corbeau:'basile', sac:'crochet'}
};
var MOUV = {lampion:'pendule', enseigne:'pendule', cible:'fixe', anneau:'fixe', baudruche:'huit', corbeau:'huit', basile:'huit', ballon:'ficelle', cerfvolant:'ficelle', crochet:'point', fanion:'drapeau'};
/* les mâts à drapeaux (Romain, 6 nov. : « moins gênants, et qu'ils bougent avec le vent ») : sur la pente du toit de la
   maison à colombages, et au coin de la corniche du clocher. Le tissu s'attache en haut du mât (top) et flotte du côté
   où souffle le vent ; sans vent il pend. Aux niveaux 5 et plus des banderoles, un anneau est noué au bout du tissu. */
var DRAPEAUX = [{mx:150, base:194, top:150, L:42, H:26, coul:'#3f6aa8', bande:'#f6c23a'}, {mx:262, base:146, top:106, L:40, H:24, coul:'#e5484d', bande:'#f4ecdc'}];
/* Les places des cibles (Romain, 6 nov., 12 h 49 : « tout est concentré dans une zone ; répartis partout dans l'écran ;
   l'archer peut tirer aussi à l'horizontale ; les ballons accrochés ailleurs ») : en haut, au-dessus de l'archer, en bas
   (tir à l'horizontale), à droite. À chaque partie, on tire au sort parmi ces places, assez loin les unes des autres et
   des obstacles (choisirPlaces). Chaque place est accrochée à quelque chose : un crochet, une perche, un toit. */
/* LA ZONE DES CIBLES (Romain, 6 nov., 14 h 57, photo entourée en rouge) : tout ce qu'on doit toucher est dans le ciel et
   sur les toits, à droite d'une courbe qui descend du haut de l'écran vers la maison à colombages, et au-dessus d'une
   ligne qui va du toit de la maison à colombages jusqu'au flanc droit du clocher. Rien en haut à gauche (au-dessus de
   l'archer), rien en bas (fenêtres, lampadaire, porte du clocher). Les décors qui gênent sont entre l'archer et cette zone.
   (Mesuré sur la photo : x > 92 ; y < 232 + 0,35 × (x − 107).) */
function dansZone(x, y, marge){ marge = marge || 0; return x >= 92 + marge && y <= 232 + 0.35 * Math.max(0, x - 107) - marge; }
var SLOTS_V2 = {
  /* sup : où le lampion est accroché (un petit bras de fer) */
  lampion:[{ax:326, ay:157, L:50, sup:'corniche'}, {ax:180, ay:170, L:44, sup:'pignon'}, {ax:272, ay:157, L:46, sup:'corniche'}],
  /* base : la cible est au bout d'un poteau planté sur un toit ; sinon, pendue à un clou */
  cible:[{x:180, y:118, base:[180, 168]}, {x:300, y:254}, {x:234, y:140, base:[221, 183]}],
  corbeau:[{cx:200, cy:118, ax:62, ay:16}, {cx:240, cy:234, ax:52, ay:18}, {cx:152, cy:190, ax:40, ay:20}, {cx:296, cy:176, ax:40, ay:22}],
  /* le ballon (ou le cerf-volant) coincé LE PLUS HAUT POSSIBLE sur les toits (Romain, 14 h 30) : aux coins de la corniche
     du clocher, en haut du pignon et à la cheminée de la maison à colombages, sur le toit de la maison de droite (plus haut,
     en haut du beffroi : mesuré, presque aucun tir n'y arrive). La longueur de ficelle dépend du niveau. */
  ballon:[{ax:262, ay:152, L:84, a0:-0.62, amp:0.16, sup:'corniche'}, {ax:336, ay:150, L:80, a0:-0.3, amp:0.12, sup:'corniche'}, {ax:180, ay:168, L:80, a0:0.12, amp:0.14, sup:'pignon'}, {ax:220, ay:182, L:76, a0:0.45, amp:0.16, sup:'cheminee'}, {ax:350, ay:236, L:78, a0:-0.6, amp:0.12, sup:'toit'}],
  cerfvolant:[{ax:262, ay:152, L:92, a0:-0.7, amp:0.24, sup:'corniche'}, {ax:336, ay:150, L:86, a0:-0.42, amp:0.16, sup:'corniche'}, {ax:180, ay:168, L:88, a0:0.1, amp:0.22, sup:'pignon'}, {ax:220, ay:182, L:84, a0:0.4, amp:0.22, sup:'cheminee'}, {ax:350, ay:236, L:86, a0:-0.7, amp:0.16, sup:'toit'}]
};
/* Les banderoles (Romain, 12 h 49 : « tous les anneaux tenus par des perches, comme le monsieur à l'échelle ; ça bouge un
   petit peu ; écarte bien les choses ») : chaque anneau est au bout d'une perche tenue
   par quelqu'un. H : ses mains ; T : le bout de la perche (l'anneau), toujours dans la zone des cibles (14 h 57 : plus rien
   au-dessus de l'archer, la dame tend sa perche vers la droite). La dame est toujours là. (Rien de plus haut, surtout à droite : la flèche n'y monte pas sans tirer à fond — mesuré, 6 nov.) */
var PORTEURS = {
  dame:{H:[74, 266], T:[118, 184], pose:'fenetre', x:60, y:286, habit:'#c8574a', tete:'chignon'},
  couvreur:{H:[184, 160], T:[156, 110], pose:'assis', x:192, y:176, habit:'#3f6aa8', tete:'casquette'},
  sonneur:{H:[272, 138], T:[250, 128], pose:'fenetre', x:286, y:150, habit:'#7a5a9a', tete:'capuche'},
  basile:{H:[256, 172], T:[218, 126], pose:'basile'},
  enfant:{H:[330, 388], T:[308, 282], pose:'debout', x:338, y:422, habit:'#4fb06a', tete:'cheveux'},
  marchand:{H:[230, 334], T:[258, 250], pose:'fenetre', x:218, y:356, habit:'#b8862e', tete:'chapeau'}
};
var SLOTS = {
  lampion:[{ax:204, ay:150, L:62}, {ax:150, ay:138, L:74}, {ax:240, ay:168, L:48}],
  cible:[{x:226, y:240}, {x:318, y:262}, {x:176, y:214}],
  baudruche:[{cx:226, cy:150, ax:84, ay:46}, {cx:244, cy:236, ax:70, ay:36}, {cx:214, cy:104, ax:92, ay:30}],
  corbeau:[{cx:226, cy:176, ax:84, ay:40}, {cx:244, cy:236, ax:70, ay:30}, {cx:200, cy:206, ax:80, ay:22}],   /* (loin du ballon : le toucher fait perdre) */
  fanion:[{f:0}, {f:1}],
  /* (la ficelle est nouée à la corniche du clocher : assez bas pour qu'une flèche l'atteigne sans tirer à fond) */
  /* (un deuxième ballon, au niveau 9 : coincé à l'autre coin de la corniche, devant la flèche du clocher) */
  ballon:[{ax:262, ay:152, L:84, a0:-0.95, amp:0.18}, {ax:336, ay:150, L:80, a0:-0.22, amp:0.12}],
  cerfvolant:[{ax:264, ay:150, L:92, a0:-1.12, amp:0.28}, {ax:336, ay:150, L:86, a0:-0.3, amp:0.18}],
  enseigne:[{ax:272, ay:226, L:38}, {ax:196, ay:176, L:34}],
  /* (loin des anneaux noués au bout des drapeaux) */
  anneau:[{x:300, y:178}, {x:236, y:162}, {x:196, y:232}],
  basile:[{cx:222, cy:120, ax:22, ay:14}, {cx:206, cy:156, ax:20, ay:12}],
  crochet:[{x:332, y:212}, {x:124, y:118}]
};
var NOMS_IC = {lampion:'🏮', cible:'🎯', baudruche:'🎈', corbeau:'🐦', ballon:'🎈', cerfvolant:'🪁', enseigne:'🪧', anneau:'⭕', basile:'⭕', crochet:'🪝', fanion:'⭕'};
var MAT = {x:118, y:214};   /* le haut du mât de la fête (banderoles) */
var COUL_DRAP = ['#e5484d', '#f6c23a', '#3f8fd6', '#4fb06a', '#ef7fb0', '#f4ecdc', '#9b6fd0', '#ff9a3c'];

/* ==========================================================
   LE DÉCOR : la place de Brumeval en fin d'après-midi
   ========================================================== */
function defsTir(id){
  return '<defs><linearGradient id="' + id + 'ciel" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#5f97d0"/><stop offset=".42" stop-color="#9fc0e2"/><stop offset=".72" stop-color="#f6d2b0"/><stop offset="1" stop-color="#f3a888"/></linearGradient>' +
    '<radialGradient id="' + id + 'sol" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#fff6d8" stop-opacity=".95"/><stop offset=".35" stop-color="#ffe6a8" stop-opacity=".5"/><stop offset="1" stop-color="#ffd890" stop-opacity="0"/></radialGradient>' +
    '<linearGradient id="' + id + 'pierre" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#e6ddcc"/><stop offset=".6" stop-color="#d4c8b2"/><stop offset="1" stop-color="#b9ab94"/></linearGradient>' +
    '<pattern id="' + id + 'blocs" width="34" height="22" patternUnits="userSpaceOnUse"><rect width="34" height="22" fill="none"/><path d="M0,11 H34 M0,22 H34 M17,0 V11 M0,11 V22 M34,11 V22" stroke="#9e927c" stroke-width="1.6" opacity=".7"/></pattern>' +
    '<pattern id="' + id + 'ardoise" width="12" height="9" patternUnits="userSpaceOnUse"><rect width="12" height="9" fill="#55648a"/><path d="M0,9 C0,4 6,4 6,9 C6,4 12,4 12,9 M-6,4.5 C-6,-.5 0,-.5 0,4.5 C0,-.5 6,-.5 6,4.5 C6,-.5 12,-.5 12,4.5" fill="none" stroke="#3b4768" stroke-width="1.2"/></pattern>' +
    '<pattern id="' + id + 'tuiles" width="14" height="10" patternUnits="userSpaceOnUse"><rect width="14" height="10" fill="#c45f3a"/><path d="M0,10 C0,5 7,5 7,10 C7,5 14,5 14,10 M-7,5 C-7,0 0,0 0,5 C0,0 7,0 7,5 C7,0 14,0 14,5" fill="none" stroke="#8f3f22" stroke-width="1.3"/></pattern>' +
    '<linearGradient id="' + id + 'ombreMur" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#3a1a10" stop-opacity=".22"/></linearGradient>' +
    '<radialGradient id="' + id + 'lueur" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#ffe9a8" stop-opacity=".9"/><stop offset="1" stop-color="#ffd27a" stop-opacity="0"/></radialGradient>' +
    '<radialGradient id="' + id + 'bal" cx=".35" cy=".3" r=".7"><stop offset="0" stop-color="#ff9a9a"/><stop offset=".5" stop-color="#e5484d"/><stop offset="1" stop-color="#a8262c"/></radialGradient>' +
    '<radialGradient id="' + id + 'laiton" cx=".35" cy=".3" r=".75"><stop offset="0" stop-color="#fff0b0"/><stop offset=".5" stop-color="#e6b84a"/><stop offset="1" stop-color="#a87a1e"/></radialGradient>' +
    '<radialGradient id="' + id + 'bronze" cx=".35" cy=".3" r=".8"><stop offset="0" stop-color="#f0c27a"/><stop offset=".55" stop-color="#b8782e"/><stop offset="1" stop-color="#6e4418"/></radialGradient>' +
    '</defs>';
}
/* une maison vue de face : mur, colombages, toit, fenêtres à volets, jardinières, cheminée qui fume */
function maison(id, x, w, hMur, mur, opts){
  opts = opts || {};
  var y0 = SOL - hMur, s = '', hToit = opts.pignon ? w * 0.42 : 34, coul = opts.volets || '#3f8a6a';
  s += '<rect x="' + f0(x) + '" y="' + f0(y0) + '" width="' + f0(w) + '" height="' + f0(hMur) + '" fill="' + mur + '"' + st(3) + '/>';
  s += '<rect x="' + f0(x + w * 0.62) + '" y="' + f0(y0 + 2) + '" width="' + f0(w * 0.38 - 2) + '" height="' + f0(hMur - 4) + '" fill="url(#' + id + 'ombreMur)"/>';
  if(opts.colombages){ var cb = '#6e4a32'; s += '<path d="M' + f0(x) + ',' + f0(y0 + hMur * 0.48) + ' H' + f0(x + w) + ' M' + f0(x + w / 3) + ',' + f0(y0) + ' V' + f0(SOL) + ' M' + f0(x + 2 * w / 3) + ',' + f0(y0) + ' V' + f0(SOL) + ' M' + f0(x) + ',' + f0(y0) + ' L' + f0(x + w / 3) + ',' + f0(y0 + hMur * 0.48) + ' M' + f0(x + w) + ',' + f0(y0) + ' L' + f0(x + 2 * w / 3) + ',' + f0(y0 + hMur * 0.48) + '" stroke="' + cb + '" stroke-width="5"/>'; }
  /* les fenêtres, sur deux étages */
  var nf = Math.max(1, Math.round(w / 64));
  for(var e = 0; e < 2; e++) for(var i = 0; i < nf; i++){
    var fx = x + w * (i + 0.5) / nf - 11, fy = y0 + 16 + e * hMur * 0.42;
    if(e === 1 && Math.abs(fx + 11 - (x + w / 2)) < 16 && opts.porte !== false){ s += '<path d="M' + f0(fx - 2) + ',' + f0(SOL) + ' V' + f0(SOL - 40) + ' Q' + f0(fx + 11) + ',' + f0(SOL - 56) + ' ' + f0(fx + 24) + ',' + f0(SOL - 40) + ' V' + f0(SOL) + ' Z" fill="#7a4e2c"' + st(2.6) + '/><circle cx="' + f0(fx + 18) + '" cy="' + f0(SOL - 20) + '" r="2" fill="#ffd36a"/>'; continue; }
    s += '<rect x="' + f0(fx - 9) + '" y="' + f0(fy) + '" width="8" height="26" rx="1.5" fill="' + coul + '"' + st(2) + '/><rect x="' + f0(fx + 23) + '" y="' + f0(fy) + '" width="8" height="26" rx="1.5" fill="' + coul + '"' + st(2) + '/>';
    s += '<rect x="' + f0(fx) + '" y="' + f0(fy) + '" width="22" height="26" rx="2" fill="#f8e3a8"' + st(2.4) + '/><path d="M' + f0(fx + 11) + ',' + f0(fy) + ' V' + f0(fy + 26) + ' M' + f0(fx) + ',' + f0(fy + 12) + ' H' + f0(fx + 22) + '" stroke="' + K + '" stroke-width="1.6"/><path d="M' + f0(fx + 3) + ',' + f0(fy + 3) + ' l5,0" stroke="#fff" stroke-width="2" opacity=".7"/>';
    if((i + e) % 2 === 0){ s += '<rect x="' + f0(fx - 3) + '" y="' + f0(fy + 26) + '" width="28" height="7" rx="2" fill="#a5533a"' + st(1.8) + '/>' + [2, 8, 14, 20].map(function(d, k){ return '<circle cx="' + f0(fx + d) + '" cy="' + f0(fy + 25) + '" r="3" fill="' + ['#e5484d', '#f6d23a', '#ef7fb0', '#fff4f0'][k] + '"' + st(1) + '/>'; }).join(''); }
  }
  /* le toit */
  if(opts.pignon) s += '<path d="M' + f0(x - 8) + ',' + f0(y0 + 2) + ' L' + f0(x + w / 2) + ',' + f0(y0 - hToit) + ' L' + f0(x + w + 8) + ',' + f0(y0 + 2) + ' Z" fill="url(#' + id + 'tuiles)"' + st(3.4) + ' stroke-linejoin="round"/><path d="M' + f0(x + w / 2) + ',' + f0(y0 - hToit + 6) + ' L' + f0(x + w + 2) + ',' + f0(y0 - 1) + '" stroke="#5e2a18" stroke-width="5" opacity=".35"/>';
  else s += '<path d="M' + f0(x - 8) + ',' + f0(y0 + 2) + ' L' + f0(x + 10) + ',' + f0(y0 - hToit) + ' L' + f0(x + w - 10) + ',' + f0(y0 - hToit) + ' L' + f0(x + w + 8) + ',' + f0(y0 + 2) + ' Z" fill="url(#' + id + (opts.ardoise ? 'ardoise' : 'tuiles') + ')"' + st(3.4) + ' stroke-linejoin="round"/>';
  if(opts.cheminee !== false){ var cx = x + w * (opts.pignon ? 0.72 : 0.26), cy = y0 - (opts.pignon ? hToit * 0.45 : hToit) - 18; s += '<rect x="' + f0(cx) + '" y="' + f0(cy) + '" width="15" height="28" fill="#a85a40"' + st(2.6) + '/><rect x="' + f0(cx - 2) + '" y="' + f0(cy - 4) + '" width="19" height="6" fill="#8a4430"' + st(2.2) + '/><g class="ti-fumee" data-x="' + f0(cx + 7) + '" data-y="' + f0(cy - 6) + '"></g>'; }
  return s;
}
/* le clocher : la tour de pierre, l'horloge, la Grosse Marie dans son arche, la flèche d'ardoise, la girouette (le coq) */
function clocher(id){
  var s = '<rect x="266" y="150" width="68" height="' + (SOL - 150) + '" fill="url(#' + id + 'pierre)"' + st(3.4) + '/><rect x="266" y="150" width="68" height="' + (SOL - 150) + '" fill="url(#' + id + 'blocs)"/>';
  s += '<path d="M276,' + SOL + ' V384 Q300,364 324,384 V' + SOL + ' Z" fill="#6e4424"' + st(2.6) + '/><path d="M300,370 V' + SOL + '" stroke="' + K + '" stroke-width="2"/>';
  s += '<circle cx="300" cy="198" r="19" fill="#f8f0dc"' + st(3) + '/><circle cx="300" cy="198" r="15" fill="none" stroke="#b8a888" stroke-width="1.4"/>' + [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map(function(i){ var a = i * 0.5236; return '<path d="M' + f1(300 + Math.sin(a) * 13) + ',' + f1(198 - Math.cos(a) * 13) + ' L' + f1(300 + Math.sin(a) * 16) + ',' + f1(198 - Math.cos(a) * 16) + '" stroke="' + K + '" stroke-width="' + (i % 3 ? 1.2 : 2.2) + '"/>'; }).join('') + '<path d="M300,198 L300,187 M300,198 L307,202" stroke="' + K + '" stroke-width="2.4" stroke-linecap="round"/><circle cx="300" cy="198" r="2" fill="' + K + '"/>';
  s += '<rect x="262" y="146" width="76" height="9" rx="2" fill="#c9bca4"' + st(2.6) + '/>';
  /* le beffroi */
  s += '<rect x="268" y="96" width="64" height="52" fill="url(#' + id + 'pierre)"' + st(3.2) + '/><path d="M280,148 V118 Q300,98 320,118 V148 Z" fill="#3a2c3e"' + st(2.4) + '/>';
  s += '<g class="ti-cloche"><path d="M300,110 V116" stroke="' + K + '" stroke-width="3"/><path d="M288,138 C288,124 292,116 300,116 C308,116 312,124 312,138 L315,142 L285,142 Z" fill="url(#' + id + 'bronze)"' + st(2.4) + ' stroke-linejoin="round"/><circle cx="300" cy="143" r="3" fill="#6e4418"' + st(1.4) + '/></g>';
  s += '<rect x="264" y="92" width="72" height="8" rx="2" fill="#c9bca4"' + st(2.6) + '/><path d="M264,98 l-8,4 l4,4 l6,-3 Z" fill="#a89a84"' + st(2) + '/>';
  /* la flèche d'ardoise et la girouette */
  s += '<path d="M266,93 L300,8 L334,93 Z" fill="url(#' + id + 'ardoise)"' + st(3.4) + ' stroke-linejoin="round"/><path d="M300,10 L330,92" stroke="#2a3450" stroke-width="7" opacity=".35"/>';
  s += '<path d="M300,10 V-14" stroke="' + K + '" stroke-width="3"/><circle cx="300" cy="-2" r="2.6" fill="url(#' + id + 'laiton)"' + st(1.4) + '/>';
  s += '<g class="ti-coq" transform="translate(300,-18)"><path d="M-9,4 C-9,-4 -3,-8 2,-6 L4,-12 L6,-6 C10,-6 12,-2 10,2 L13,5 L6,4 C4,8 -6,8 -9,4 Z" fill="url(#' + id + 'laiton)"' + st(1.8) + ' stroke-linejoin="round"/><path d="M-9,4 L-15,0 L-13,6 Z" fill="#e6b84a"' + st(1.4) + '/></g>';
  return s;
}
function sceneTir(id, mode){
  var s = defsTir(id) + '<rect x="' + DEC.x + '" y="' + DEC.y + '" width="' + DEC.w + '" height="' + DEC.h + '" fill="url(#' + id + 'ciel)"/>';
  s += '<circle cx="34" cy="250" r="90" fill="url(#' + id + 'sol)"/><circle cx="34" cy="250" r="24" fill="#fff6d8"/>';
  s += '<g class="ti-nuages">' + [[-170, 60, 1], [40, 30, .8], [170, 92, 1.15], [380, 48, .9], [540, 110, 1]].map(function(n){ return '<g class="ti-nuage" data-x="' + n[0] + '" data-y="' + n[1] + '" data-s="' + n[2] + '" transform="translate(' + n[0] + ',' + n[1] + ') scale(' + n[2] + ')"><path d="M-46,10 C-50,-4 -34,-12 -24,-6 C-20,-22 4,-24 10,-10 C18,-18 36,-14 36,-2 C48,-2 52,12 40,14 L-40,14 C-50,14 -52,10 -46,10 Z" fill="#fff8ee" opacity=".92"/><path d="M-40,14 L40,14 C30,8 -30,8 -40,14 Z" fill="#f2d8c8" opacity=".8"/></g>'; }).join('') + '</g>';
  /* au loin : les collines et les toits de Brumeval, dans la brume du soir */
  s += '<path d="M' + DEC.x + ',300 C-120,268 -40,286 40,270 C120,254 200,280 300,262 C400,246 500,272 ' + (DEC.x + DEC.w) + ',258 L' + (DEC.x + DEC.w) + ',' + SOL + ' L' + DEC.x + ',' + SOL + ' Z" fill="#b9a8c8"/>';
  var d = 'M' + DEC.x + ',' + SOL; for(var x = DEC.x; x < DEC.x + DEC.w; x += 36){ var h = R(24, 54); d += ' L' + x + ',' + f0(SOL - h) + ' L' + (x + 18) + ',' + f0(SOL - h - 16) + ' L' + (x + 36) + ',' + f0(SOL - h); } s += '<path d="' + d + ' L' + (DEC.x + DEC.w) + ',' + SOL + ' Z" fill="#a08cb4" opacity=".85"/>';
  /* les maisons de la place, puis le clocher */
  s += maison(id, -236, 150, 200, '#d8e3b0', {ardoise:true, volets:'#5a6fa8'});
  s += maison(id, -80, 168, 178, '#eedcb8', {volets:'#3f8a6a', porte:false});
  s += maison(id, 104, 152, 190, '#f2bf92', {pignon:true, colombages:true, volets:'#c45f3a'});
  s += maison(id, 344, 140, 172, '#c9d6ea', {volets:'#3f6aa8'});
  s += maison(id, 486, 140, 200, '#ecc8c8', {pignon:true, volets:'#3f8a6a'});
  s += clocher(id);
  /* le sol : un trottoir, puis les pavés de la place (plus gros vers nous) */
  s += '<rect x="' + DEC.x + '" y="' + SOL + '" width="' + DEC.w + '" height="' + (DEC.y + DEC.h - SOL) + '" fill="#9a8e7c"/><rect x="' + DEC.x + '" y="' + SOL + '" width="' + DEC.w + '" height="8" fill="#cfc5b2"/><path d="M' + DEC.x + ',' + SOL + ' H' + (DEC.x + DEC.w) + '"' + st(3) + '/>';
  [[434, 9, 20], [448, 12, 26], [466, 16, 34], [490, 22, 44], [520, 28, 56]].forEach(function(r, k){ for(var x = DEC.x + (k % 2) * r[2] / 2; x < DEC.x + DEC.w; x += r[2]){ s += '<rect x="' + f0(x + 1.5) + '" y="' + r[0] + '" width="' + f0(r[2] - 3) + '" height="' + r[1] + '" rx="' + f0(r[1] / 2.4) + '" fill="' + ['#b3a793', '#aa9e8a', '#b8ac98'][((Math.floor(x / r[2]) % 3) + 3) % 3] + '"/>'; } });
  s += '<path d="M' + DEC.x + ',' + (SOL + 8) + ' H' + (DEC.x + DEC.w) + '" stroke="#7e7262" stroke-width="2"/>';
  return s;
}
/* l'enfant au pied du clocher (le ballon, le cerf-volant) : bras levés, il attend */
function enfantSVG(x){
  return '<g class="ti-enfant" transform="translate(' + (x || 244) + ',' + SOL + ')"><ellipse cx="0" cy="2" rx="13" ry="3.6" fill="#000" opacity=".25"/>' +
    '<g class="ti-enf-corps"><path d="M-4,0 V-12 M4,0 V-12"' + st(6) + ' stroke-linecap="round"/><path d="M-4,0 V-12 M4,0 V-12" stroke="#3f5aa8" stroke-width="3.4" stroke-linecap="round"/>' +
    '<path d="M-8,-12 C-8,-26 8,-26 8,-12 Z" fill="#e5484d"' + st(2.4) + '/>' +
    '<g class="ti-enf-bras"><path d="M-7,-22 L-12,-36 M7,-22 L12,-36"' + st(5.6) + ' stroke-linecap="round"/><path d="M-7,-22 L-12,-36 M7,-22 L12,-36" stroke="#e5484d" stroke-width="3" stroke-linecap="round"/><circle cx="-12" cy="-37" r="2.6" fill="#f1c7a0"' + st(1.4) + '/><circle cx="12" cy="-37" r="2.6" fill="#f1c7a0"' + st(1.4) + '/></g>' +
    '<circle cy="-33" r="9" fill="#f1c7a0"' + st(2.2) + '/><path d="M-9,-35 C-9,-44 9,-45 9,-35 C5,-39 -4,-40 -9,-35 Z" fill="#7a4a28"' + st(1.6) + '/>' +
    '<circle cx="-3" cy="-33" r="1.3" fill="' + K + '"/><circle cx="3" cy="-33" r="1.3" fill="' + K + '"/><path class="ti-enf-bouche" d="M-2.4,-28.6 Q0,-27 2.4,-28.6" stroke="' + K + '" stroke-width="1.4" fill="none" stroke-linecap="round"/></g></g>';
}
/* le mât de la fête (banderoles) */
function matSVG(id){
  return '<g class="ti-mat"><path d="M' + MAT.x + ',' + SOL + ' V' + (MAT.y + 4) + '"' + st(9) + ' stroke-linecap="round"/><path d="M' + MAT.x + ',' + SOL + ' V' + (MAT.y + 4) + '" stroke="#b07a4a" stroke-width="5" stroke-linecap="round"/><path d="M' + (MAT.x - 1.5) + ',' + (SOL - 4) + ' V' + (MAT.y + 8) + '" stroke="#d8a874" stroke-width="1.6"/>' +
    '<circle cx="' + MAT.x + '" cy="' + (MAT.y - 2) + '" r="7" fill="url(#' + id + 'laiton)"' + st(2.2) + '/><rect x="' + (MAT.x - 9) + '" y="' + (SOL - 6) + '" width="18" height="8" rx="2" fill="#8a6545"' + st(2) + '/></g>';
}
/* les porteurs de perche (banderoles) : à une fenêtre, assis sur le toit, debout sur la place ; Basile sur son échelle.
   Les bras vont jusqu'aux mains (H), la perche est dessinée à part (elle bouge). */
function porteurSVG(nom){
  var P = PORTEURS[nom]; if(!P) return '';
  if(P.pose === 'basile') return basileSVG();
  var x = P.x, y = P.y, H = P.H, c = P.habit, peau = '#f1c7a0';
  var hy = P.pose === 'fenetre' ? y - 22 : (P.pose === 'assis' ? y - 30 : y - 38), sy = hy + 12;
  var tete = '<circle cx="' + x + '" cy="' + hy + '" r="7.5" fill="' + peau + '"' + st(2) + '/><circle cx="' + (x + 2.4) + '" cy="' + (hy - 1) + '" r="1.1" fill="' + K + '"/><circle cx="' + (x - 2.6) + '" cy="' + (hy - 1) + '" r="1.1" fill="' + K + '"/><path d="M' + (x - 2.2) + ',' + (hy + 3) + ' Q' + x + ',' + (hy + 5) + ' ' + (x + 2.2) + ',' + (hy + 3) + '" stroke="' + K + '" stroke-width="1.2" fill="none" stroke-linecap="round"/>';
  if(P.tete === 'chignon') tete += '<path d="M' + (x - 7.5) + ',' + (hy - 1) + ' C' + (x - 8) + ',' + (hy - 10) + ' ' + (x + 8) + ',' + (hy - 10) + ' ' + (x + 7.5) + ',' + (hy - 1) + ' C' + (x + 4) + ',' + (hy - 5) + ' ' + (x - 4) + ',' + (hy - 5) + ' ' + (x - 7.5) + ',' + (hy - 1) + ' Z" fill="#7a4a28"' + st(1.4) + '/><circle cx="' + x + '" cy="' + (hy - 10) + '" r="3.6" fill="#7a4a28"' + st(1.4) + '/>';
  else if(P.tete === 'casquette') tete += '<path d="M' + (x - 7.5) + ',' + (hy - 2) + ' C' + (x - 7) + ',' + (hy - 11) + ' ' + (x + 7) + ',' + (hy - 11) + ' ' + (x + 7.5) + ',' + (hy - 2) + ' Z" fill="#e5484d"' + st(1.6) + '/><path d="M' + (x + 4) + ',' + (hy - 3) + ' h7" stroke="' + K + '" stroke-width="2.6" stroke-linecap="round"/>';
  else if(P.tete === 'capuche') tete = '<path d="M' + (x - 10) + ',' + (hy + 6) + ' C' + (x - 12) + ',' + (hy - 14) + ' ' + (x + 12) + ',' + (hy - 14) + ' ' + (x + 10) + ',' + (hy + 6) + ' Z" fill="' + c + '"' + st(2) + '/>' + tete;
  else if(P.tete === 'chapeau') tete += '<ellipse cx="' + x + '" cy="' + (hy - 5) + '" rx="12" ry="3" fill="#5e3e26"' + st(1.6) + '/><path d="M' + (x - 6) + ',' + (hy - 5) + ' C' + (x - 6) + ',' + (hy - 13) + ' ' + (x + 6) + ',' + (hy - 13) + ' ' + (x + 6) + ',' + (hy - 5) + ' Z" fill="#5e3e26"' + st(1.6) + '/>';
  else tete += '<path d="M' + (x - 7.5) + ',' + (hy - 1) + ' C' + (x - 7) + ',' + (hy - 10) + ' ' + (x + 7) + ',' + (hy - 10) + ' ' + (x + 7.5) + ',' + (hy - 1) + ' C' + (x + 3) + ',' + (hy - 6) + ' ' + (x - 3) + ',' + (hy - 6) + ' ' + (x - 7.5) + ',' + (hy - 1) + ' Z" fill="#e6b84a"' + st(1.4) + '/>';
  var corps = '';
  if(P.pose === 'debout') corps = '<path d="M' + (x - 3.5) + ',' + y + ' V' + (y - 14) + ' M' + (x + 3.5) + ',' + y + ' V' + (y - 14) + '"' + st(6) + ' stroke-linecap="round"/><path d="M' + (x - 3.5) + ',' + y + ' V' + (y - 14) + ' M' + (x + 3.5) + ',' + y + ' V' + (y - 14) + '" stroke="#3f5aa8" stroke-width="3.4" stroke-linecap="round"/>';
  if(P.pose === 'assis') corps = '<path d="M' + (x - 2) + ',' + (y - 8) + ' L' + (x - 12) + ',' + (y - 4) + ' L' + (x - 13) + ',' + (y + 6) + '"' + st(6) + ' stroke-linecap="round" stroke-linejoin="round" fill="none"/><path d="M' + (x - 2) + ',' + (y - 8) + ' L' + (x - 12) + ',' + (y - 4) + ' L' + (x - 13) + ',' + (y + 6) + '" stroke="#5e4430" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round" fill="none"/>';
  var by = P.pose === 'fenetre' ? y : (P.pose === 'assis' ? y - 6 : y - 13);
  corps += '<path d="M' + (x - 8) + ',' + by + ' C' + (x - 9) + ',' + (sy - 2) + ' ' + (x + 9) + ',' + (sy - 2) + ' ' + (x + 8) + ',' + by + ' Z" fill="' + c + '"' + st(2.2) + ' stroke-linejoin="round"/>';
  var bras = [[x - 5, sy + 2], [x + 5, sy + 1]].map(function(e, i){ var mx = H[0] + (i ? 0 : -4), my = H[1] + (i ? 0 : 5); return '<path d="M' + e[0] + ',' + e[1] + ' L' + f1(mx) + ',' + f1(my) + '"' + st(5.4) + ' stroke-linecap="round"/><path d="M' + e[0] + ',' + e[1] + ' L' + f1(mx) + ',' + f1(my) + '" stroke="' + c + '" stroke-width="3" stroke-linecap="round"/><circle cx="' + f1(mx) + '" cy="' + f1(my) + '" r="2.6" fill="' + peau + '"' + st(1.4) + '/>'; }).join('');
  return '<g class="ti-porteur ti-p-' + nom + '">' + corps + tete + bras + '</g>';
}
/* Basile qui marche, vu de profil (il regarde à droite ; on le retourne pour aller à gauche) : les jambes sont redessinées
   à chaque pas (jambe()), le corps monte et descend un peu ; ses mains tiennent l'échelle à hauteur d'épaule */
function basileMarcheSVG(autre){
  var ch = autre ? '#4fb06a' : '#5e8ac8', chF = autre ? '#2f7a4c' : '#3f6aa8', pant = '#6e4a32', peau = '#f1c7a0';
  return '<ellipse cx="0" cy="2" rx="14" ry="3.6" fill="#000" opacity=".22"/>' +
    '<path class="ti-mj-d" d="" stroke="#4a3426" stroke-width="5.6" fill="none" stroke-linecap="round" stroke-linejoin="round"/>' +
    '<g class="ti-mj-corps">' +
      '<path d="M-6,-22 C-8,-34 8,-36 7,-22 Z" fill="' + ch + '"' + st(2.2) + ' stroke-linejoin="round"/><path d="M-1,-33 V-22" stroke="' + chF + '" stroke-width="1.4"/>' +
      '<path d="M-6,-22 H7 L6,-17 H-5 Z" fill="' + pant + '"' + st(1.8) + '/>' +
      '<circle cx="1" cy="-44" r="7.4" fill="' + peau + '"' + st(2) + '/><circle cx="4.6" cy="-45" r="1.2" fill="' + K + '"/><path d="M7.6,-43 l2.4,1.2 l-2.4,.8" fill="' + peau + '"' + st(1.2) + '/><path d="M3,-40 Q5,-39 6.6,-40.2" stroke="' + K + '" stroke-width="1.1" fill="none" stroke-linecap="round"/>' +
      (autre ? '<path d="M-6.6,-46 C-6,-55 8,-55 8.4,-46 Z" fill="#e5484d"' + st(1.6) + '/><path d="M5,-47 h7" stroke="' + K + '" stroke-width="2.4" stroke-linecap="round"/>' :
        '<ellipse cx="1" cy="-49" rx="12" ry="3" fill="#e6c25a"' + st(1.8) + '/><path d="M-5,-49 C-5,-57 7,-57 7,-49 Z" fill="#e6c25a"' + st(1.8) + '/><path d="M-5,-50.5 H7" stroke="#e5484d" stroke-width="2"/>') +
      '<path d="M0,-31 L7,-38 M-2,-30 L2,-37" stroke="' + K + '" stroke-width="5" stroke-linecap="round"/><path d="M0,-31 L7,-38 M-2,-30 L2,-37" stroke="' + ch + '" stroke-width="2.8" stroke-linecap="round"/><circle cx="7.4" cy="-38.4" r="2.4" fill="' + peau + '"' + st(1.2) + '/>' +
    '</g>' +
    '<path class="ti-mj-g" d="" stroke="#5e4430" stroke-width="5.6" fill="none" stroke-linecap="round" stroke-linejoin="round"/>';
}
/* une jambe : g de -1 (en arrière) à 1 (en avant) ; le pied de devant se lève un peu */
function jambe(g){ var fx = g * 8, fy = -Math.max(0, g) * 2.6, kx = g * 4 + 2, ky = -10 - Math.max(0, g) * 1.5; return 'M0,-19 L' + f1(kx) + ',' + f1(ky) + ' L' + f1(fx) + ',' + f1(fy) + ' l4,0'; }
/* Basile en haut de son échelle, qui tend sa perche (banderoles) ; sa perche bouge, l'anneau au bout */
function basileSVG(){
  return '<g class="ti-basile"><path d="M232,' + SOL + ' L254,190 M252,' + SOL + ' L272,190"' + st(5) + '/><path d="M232,' + SOL + ' L254,190 M252,' + SOL + ' L272,190" stroke="#c99a5e" stroke-width="2.6"/>' +
    [0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map(function(i){ var u = (i + 0.5) / 10, x1 = 232 + 22 * (1 - u) * 0 + 22 * u, y = SOL - (SOL - 190) * u; return '<path d="M' + f1(232 + 22 * u) + ',' + f1(y) + ' L' + f1(252 + 20 * u) + ',' + f1(y) + '" stroke="#a87a4a" stroke-width="3"/>'; }).join('') +
    '<g transform="translate(262,182)"><path d="M-8,10 C-10,-6 10,-6 8,10 Z" fill="#5e8ac8"' + st(2.4) + '/><path d="M-6,-2 L6,-2 M-4,-6 V4 M4,-6 V4" stroke="#3f6aa8" stroke-width="1.6"/>' +
      '<circle cy="-13" r="8" fill="#f1c7a0"' + st(2.2) + '/><path d="M-7,-10 C-6,-3 6,-3 7,-10 C4,-6 -4,-6 -7,-10 Z" fill="#b8a888"' + st(1.4) + '/><circle cx="-3" cy="-15" r="1.2" fill="' + K + '"/><circle cx="3" cy="-15" r="1.2" fill="' + K + '"/>' +
      '<ellipse cy="-20" rx="14" ry="3.6" fill="#e6c25a"' + st(2) + '/><path d="M-7,-20 C-7,-28 7,-28 7,-20 Z" fill="#e6c25a"' + st(2) + '/><path d="M-7,-21 H7" stroke="#e5484d" stroke-width="2"/></g>' +
    '<path class="ti-perche" d="" stroke="' + K + '" stroke-width="5" stroke-linecap="round" fill="none"/><path class="ti-perche2" d="" stroke="#c99a5e" stroke-width="2.6" stroke-linecap="round" fill="none"/></g>';
}

/* ==========================================================
   L'ARCHER : de profil, il se penche selon la visée et bande l'arc
   ========================================================== */
var TA = {tun:'#3c8a58', tunS:'#2a6a42', cape:'#2f7a4c', capeS:'#1f5a38', capuche:'#3c9a62', capucheC:'#8ad8a6', peau:'#f1c7a0', cheveux:'#7a4a28', botte:'#6b4426', pant:'#4a3b52', cuir:'#8a5a33'};
function archerSVG(){
  var C = TA;
  return '<g class="ti-archer" transform="translate(' + ARC.x + ',' + ARC.y + ')">' +
    '<ellipse cx="-10" cy="27" rx="32" ry="6" fill="#000" opacity=".25"/>' +
    '<path class="ta-cape" d="" fill="' + C.cape + '"' + st(3) + ' stroke-linejoin="round"/>' +
    '<g class="ta-jambe2"><path class="ta-jc" d=""' + st(10) + ' stroke-linecap="round" fill="none"/><path class="ta-jf" d="" stroke="#3b2f44" stroke-width="6" stroke-linecap="round" fill="none"/></g>' +
    '<path class="ta-pied2" d="" fill="' + C.botte + '"' + st(2.4) + ' stroke-linejoin="round"/>' +
    '<g class="ta-bras2"><path class="ta-bc" d=""' + st(9) + ' stroke-linecap="round" stroke-linejoin="round" fill="none"/><path class="ta-bf" d="" stroke="' + C.tunS + '" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" fill="none"/></g>' +
    '<g class="ta-carquois"><path d="M-3,-15 l-2,-9 M1,-16 l0,-10 M5,-15 l2,-9"' + st(3.4) + ' stroke-linecap="round"/><path d="M-3,-15 l-2,-9 M1,-16 l0,-10 M5,-15 l2,-9" stroke="#e5484d" stroke-width="2" stroke-linecap="round"/><rect x="-6" y="-16" width="13" height="30" rx="5" fill="#7a4e2c"' + st(2.6) + '/><path d="M-6,-8 H7 M-6,8 H7" stroke="#ffd36a" stroke-width="2"/></g>' +
    '<g class="ta-jambe1"><path class="ta-jc" d=""' + st(10) + ' stroke-linecap="round" fill="none"/><path class="ta-jf" d="" stroke="' + C.pant + '" stroke-width="6" stroke-linecap="round" fill="none"/></g>' +
    '<path class="ta-pied1" d="" fill="' + C.botte + '"' + st(2.4) + ' stroke-linejoin="round"/>' +
    '<path class="ta-torse" d="" fill="' + C.tun + '"' + st(3) + ' stroke-linejoin="round"/>' +
    '<path class="ta-ceinture" d="" stroke="' + K + '" stroke-width="6" stroke-linecap="round"/><path class="ta-ceinture2" d="" stroke="' + C.cuir + '" stroke-width="3.4" stroke-linecap="round"/>' +
    '<g class="ta-tete"><path d="M-12,2 C-16,-8 -12,-18 -2,-19 C8,-20 14,-12 13,-2 C12,6 6,11 -1,11 C-8,11 -12,8 -12,2 Z" fill="' + C.capuche + '"' + st(2.6) + '/>' +
      '<path d="M-1,-9 C6,-11 12,-6 12,1 C12,7 7,10 2,10 C-2,10 -4,7 -4,3 C-4,-3 -4,-8 -1,-9 Z" fill="' + C.peau + '"' + st(2.2) + '/>' +
      '<path d="M-3,-8 C2,-12 9,-10 11,-5 C7,-7 2,-7 -2,-4 Z" fill="' + C.cheveux + '"' + st(1.6) + '/>' +
      '<path d="M11.4,-1 l3.2,2 l-3,1.2" fill="' + C.peau + '"' + st(1.6) + ' stroke-linejoin="round"/>' +
      '<g class="ta-oeil"><ellipse cx="6" cy="-2" rx="1.9" ry="2.5" fill="' + K + '"/><circle cx="6.6" cy="-2.9" r=".7" fill="#fff"/></g><path class="ta-oeil-rit" d="M4,-2 Q6,-4.6 8,-2" stroke="' + K + '" stroke-width="1.8" fill="none" stroke-linecap="round" opacity="0"/>' +
      '<path d="M3.4,-6 Q6,-7.4 8.6,-6" stroke="' + C.cheveux + '" stroke-width="1.6" fill="none" stroke-linecap="round"/>' +
      '<circle cx="4.6" cy="3.6" r="2" fill="#ef8f8f" opacity=".55"/><path class="ta-bouche" d="M8,5.4 Q9.6,6.4 10.8,5.4" stroke="' + K + '" stroke-width="1.5" fill="none" stroke-linecap="round"/>' +
      '<path d="M-9,-10 C-6,-15 0,-17 5,-16" stroke="' + C.capucheC + '" stroke-width="2" fill="none" stroke-linecap="round" opacity=".7"/>' +
      '<path d="M-12,2 C-18,4 -22,10 -24,16 C-18,14 -14,10 -11,7 Z" fill="' + C.capuche + '"' + st(2.2) + ' stroke-linejoin="round"/></g>' +
    '<g class="ta-bras1"><path class="ta-bc" d=""' + st(9) + ' stroke-linecap="round" fill="none"/><path class="ta-bf" d="" stroke="' + C.tun + '" stroke-width="5" stroke-linecap="round" fill="none"/><circle class="ta-main1" r="4" fill="' + C.peau + '"' + st(2) + '/></g>' +
    '<circle class="ta-main2" r="4" fill="' + C.peau + '"' + st(2) + '/>' +
  '</g>';
}
/* La pose du corps pour une visée a (négatif = vers le haut) : les hanches restent en place, le buste se penche en
   arrière quand on vise haut, le bras de l'arc est tendu dans l'axe de la flèche. B = la main qui tient l'arc
   (le centre de l'arc) : la flèche part de là (pointeDepart), le dessin et le tir sont donc toujours d'accord. */
function corpsArcher(a){
  var lam = 0.06 + Math.max(0, -a) * 0.3, ux = -Math.sin(lam), uy = -Math.cos(lam), px = Math.cos(lam), py = -Math.sin(lam);
  var Hx = -14, Hy = 0, T = 23, Cx = Hx + ux * T, Cy = Hy + uy * T;
  var S1x = Cx + px * 2, S1y = Cy + py * 2, dx = Math.cos(a), dy = Math.sin(a);
  return {lam:lam, ux:ux, uy:uy, px:px, py:py, Hx:Hx, Hy:Hy, Cx:Cx, Cy:Cy, S1x:S1x, S1y:S1y, S2x:Cx - px * 3, S2y:Cy - py * 3, dx:dx, dy:dy, Bx:S1x + dx * 21, By:S1y + dy * 21};
}
function Archer(g){
  var q = function(s){ return g.querySelector(s); };
  var cape = q('.ta-cape'), torse = q('.ta-torse'), ceint = q('.ta-ceinture'), ceint2 = q('.ta-ceinture2'), tete = q('.ta-tete'), carq = q('.ta-carquois');
  var J = ['.ta-jambe1', '.ta-jambe2'].map(function(s){ var n = q(s); return {c:n.querySelector('.ta-jc'), f:n.querySelector('.ta-jf')}; }), pieds = [q('.ta-pied1'), q('.ta-pied2')];
  var B1 = q('.ta-bras1'), B2 = q('.ta-bras2'), m1 = q('.ta-main1'), m2 = q('.ta-main2');
  var b1 = {c:B1.querySelector('.ta-bc'), f:B1.querySelector('.ta-bf')}, b2 = {c:B2.querySelector('.ta-bc'), f:B2.querySelector('.ta-bf')};
  var oeil = q('.ta-oeil'), rit = q('.ta-oeil-rit'), bouche = q('.ta-bouche'), humeur = '';
  function P(x, y){ return f1(x) + ',' + f1(y); }
  return {poser:function(a, puis, t, vent, hum){
    /* a : l'angle de visée (négatif = vers le haut) ; puis : 0 → 1 */
    var K0 = corpsArcher(a), dx = K0.dx, dy = K0.dy, ux = K0.ux, uy = K0.uy, nx = K0.px, ny = K0.py;
    var respire = Math.sin(t * 2.2) * 0.5;
    var Hx = K0.Hx, Hy = K0.Hy, Ex = K0.Cx, Ey = K0.Cy + respire * 0.4, Bx = K0.Bx, By = K0.By;
    /* les jambes : pieds au sol, genoux un peu pliés */
    var F = [[10, 26], [-25, 26]];
    for(var k = 0; k < 2; k++){
      var hx = Hx + (k ? -3 : 4), hy = Hy + 2, fx = F[k][0], fy = F[k][1], mx = (hx + fx) / 2 + (k ? -4 : 5), my = (hy + fy) / 2 - 1;
      var d = 'M' + P(hx, hy) + ' Q' + P(mx, my) + ' ' + P(fx, fy - 5);
      J[k].c.setAttribute('d', d); J[k].f.setAttribute('d', d);
      pieds[k].setAttribute('d', 'M' + P(fx - 6, fy - 8) + ' L' + P(fx + 4, fy - 8) + ' C' + P(fx + 10, fy - 7) + ' ' + P(fx + 12, fy + 1) + ' ' + P(fx + 10, fy + 1) + ' L' + P(fx - 7, fy + 1) + ' Z');
    }
    /* le torse : des épaules (plus larges) aux hanches */
    var top1x = Ex + nx * 9 + ux * 1, top1y = Ey + ny * 9 + uy * 1, top2x = Ex - nx * 9 + ux * 1, top2y = Ey - ny * 9 + uy * 1;
    var bas1x = Hx + nx * 8, bas1y = Hy + ny * 8, bas2x = Hx - nx * 8, bas2y = Hy - ny * 8;
    torse.setAttribute('d', 'M' + P(top1x, top1y) + ' Q' + P(Ex + ux * 6, Ey + uy * 6) + ' ' + P(top2x, top2y) + ' L' + P(bas2x, bas2y) + ' Q' + P(Hx - ux * 4, Hy - uy * 4) + ' ' + P(bas1x, bas1y) + ' Z');
    var cy1x = Hx + nx * 8 + ux * 4, cy1y = Hy + ny * 8 + uy * 4, cy2x = Hx - nx * 8 + ux * 4, cy2y = Hy - ny * 8 + uy * 4;
    ceint.setAttribute('d', 'M' + P(cy1x, cy1y) + ' L' + P(cy2x, cy2y)); ceint2.setAttribute('d', 'M' + P(cy1x, cy1y) + ' L' + P(cy2x, cy2y));
    /* le carquois dans le dos, la cape qui flotte avec le vent */
    carq.setAttribute('transform', 'translate(' + P(Ex - nx * 9 - ux * 9, Ey - ny * 9 - uy * 9) + ') rotate(' + f1(-K0.lam * 57.3 - 24) + ')');
    var v = fixe(vent / 140, -1, 1), w = Math.sin(t * 5) * 2 + Math.sin(t * 8.3) * 1.2;
    var c2x = Hx - nx * 12 - 4 + v * 8, c2y = Hy + 16 + w, c3x = Hx - nx * 6 - 26 + v * 12 + w, c3y = Hy + 8 - w;
    cape.setAttribute('d', 'M' + P(Ex + ux * 3, Ey + uy * 3) + ' C' + P(Ex - nx * 16, Ey - ny * 16 + 6) + ' ' + P(c3x, c3y - 16) + ' ' + P(c3x, c3y) + ' Q' + P((c3x + c2x) / 2, c3y + 12 + w) + ' ' + P(c2x, c2y) + ' Q' + P(Hx - nx * 2, Hy + 6) + ' ' + P(Hx - nx * 6, Hy - 6) + ' Z');
    /* la tête : au-dessus des épaules, elle regarde le long de la flèche */
    var Tx = Ex + ux * 15 + nx * 1.5, Ty = Ey + uy * 15 + ny * 1.5;
    tete.setAttribute('transform', 'translate(' + P(Tx, Ty) + ') rotate(' + f1(a * 24 - K0.lam * 10) + ')');
    /* le bras de l'arc : tendu de l'épaule à la poignée */
    var d1 = 'M' + P(K0.S1x, K0.S1y) + ' L' + P(Bx - dx * 3, By - dy * 3);
    b1.c.setAttribute('d', d1); b1.f.setAttribute('d', d1);
    m1.setAttribute('transform', 'translate(' + P(Bx, By) + ')');
    /* le bras qui tire : la main sur la corde (elle recule jusqu'à la joue), le coude derrière et un peu en haut */
    var Nx = Bx - dx * (puis * 26 + 3), Ny = By - dy * (puis * 26 + 3), hx2 = dy, hy2 = -dx;
    var Cx = Nx - dx * (9 + puis * 9) + hx2 * (4 + puis * 5), Cy = Ny - dy * (9 + puis * 9) + hy2 * (4 + puis * 5);
    var d2 = 'M' + P(K0.S2x, K0.S2y) + ' L' + P(Cx, Cy) + ' L' + P(Nx, Ny);
    b2.c.setAttribute('d', d2); b2.f.setAttribute('d', d2);
    m2.setAttribute('transform', 'translate(' + P(Nx, Ny) + ')');
    /* l'humeur : content (yeux rieurs), oups (bouche ronde) */
    if(hum !== humeur){
      humeur = hum;
      oeil.setAttribute('opacity', hum === 'content' ? 0 : 1); rit.setAttribute('opacity', hum === 'content' ? 1 : 0);
      bouche.setAttribute('d', hum === 'oups' ? 'M8.6,6.4 a1.6,1.6 0 1 0 0.1,0' : (hum === 'content' ? 'M7.4,4.8 Q9.4,7.8 11.2,4.8' : 'M8,5.4 Q9.6,6.4 10.8,5.4'));
    }
  }};
}
MJ.ARCHER = {svg:archerSVG, Archer:Archer, corps:corpsArcher};
var ARC_ART = '<path d="M0,-38 C14,-36 24,-22 24,0 C24,22 14,36 0,38"' + st(8) + ' fill="none" stroke-linecap="round"/><path d="M0,-38 C14,-36 24,-22 24,0 C24,22 14,36 0,38" stroke="#9a6235" stroke-width="5" fill="none" stroke-linecap="round"/><path d="M3,-34 C14,-31 21,-20 21,-4" stroke="#d29a62" stroke-width="1.8" fill="none" stroke-linecap="round"/>' +
  '<path d="M-2,-40 L3,-36 M-2,40 L3,36" stroke="#e6b84a" stroke-width="3" stroke-linecap="round"/><rect x="19" y="-7" width="9" height="14" rx="3" fill="#5e3a1e"' + st(1.8) + '/>';
var FLECHE_ART = '<path d="M-30,0 L4,0" stroke="' + K + '" stroke-width="5" stroke-linecap="round"/><path d="M-30,0 L4,0" stroke="#c99a5e" stroke-width="3" stroke-linecap="round"/><path d="M2,-5 L13,0 L2,5 Z" fill="#dfe6ff"' + st(2) + ' stroke-linejoin="round"/><path d="M-30,0 L-37,-6 L-26,-1 M-30,0 L-37,6 L-26,1" stroke="#e5484d" stroke-width="3" stroke-linecap="round" fill="none"/>';
var FLECHE_FORTE = '<path class="mja-fl-halo" d="M-36,0 L14,0"/>' + FLECHE_ART;

/* ----- Les cibles ----- */
function cibleArt(type, id){
  if(type === 'lampion') return '<path d="M0,-17 V-12" stroke="' + K + '" stroke-width="2"/><rect x="-6" y="-17" width="12" height="5" rx="1.5" fill="#3b2a1e"' + st(1.6) + '/><ellipse rx="13" ry="14" fill="#e5484d"' + st(2.6) + '/><path d="M-7,-12 C-11,-4 -11,4 -7,12 M0,-14 V14 M7,-12 C11,-4 11,4 7,12" stroke="#ff9a7a" stroke-width="2" fill="none"/><ellipse rx="6" ry="9" fill="#ffd36a" opacity=".55"/><rect x="-6" y="12" width="12" height="5" rx="1.5" fill="#3b2a1e"' + st(1.6) + '/><path d="M0,17 V24" stroke="#f6c23a" stroke-width="2.4"/>';
  if(type === 'cible') return '<path d="M0,-22 V-16" stroke="' + K + '" stroke-width="2"/><circle r="17" fill="#e6c25a"' + st(2.6) + '/><circle r="13" fill="#f4f1ea"' + st(1.4) + '/><circle r="9.5" fill="#e5484d"' + st(1.2) + '/><circle r="6" fill="#3f8fd6"' + st(1.2) + '/><circle r="2.8" fill="#f6c23a"' + st(1) + '/><path d="M-10,-11 C-6,-15 2,-16 7,-13" stroke="#fff" stroke-width="2" fill="none" opacity=".6" stroke-linecap="round"/>';
  if(type === 'baudruche'){ var c = U.choix(['#3f8fd6', '#f6c23a', '#4fb06a', '#ef7fb0', '#9b6fd0']); return '<path d="M0,15 C-3,20 3,22 0,28" stroke="#f4ecdc" stroke-width="1.6" fill="none"/><ellipse rx="12" ry="14.5" fill="' + c + '"' + st(2.4) + '/><path d="M-5,-9 C-3,-12 1,-12 3,-11" stroke="#fff" stroke-width="2.4" fill="none" opacity=".7" stroke-linecap="round"/><path d="M-2.4,14 L2.4,14 L0,17 Z" fill="' + c + '"' + st(1.4) + '/>'; }
  if(type === 'ballon') return '<ellipse cx="0" cy="0" rx="17" ry="20" fill="url(#' + id + 'bal)"' + st(2.8) + '/><path d="M-8,-12 C-5,-17 1,-18 5,-16" stroke="#fff" stroke-width="3" fill="none" opacity=".7" stroke-linecap="round"/><path d="M-3,19 L3,19 L0,23 Z" fill="#c03038"' + st(1.6) + '/>';
  if(type === 'cerfvolant') return '<g class="ti-kite"><path d="M0,-24 L17,-2 L0,22 L-17,-2 Z" fill="#f6c23a"' + st(2.6) + ' stroke-linejoin="round"/><path d="M0,-24 L17,-2 L0,-2 Z" fill="#e5484d"/><path d="M0,22 L-17,-2 L0,-2 Z" fill="#3f8fd6"/><path d="M0,-24 L17,-2 L0,22 L-17,-2 Z" fill="none"' + st(2.6) + ' stroke-linejoin="round"/><path d="M0,-24 V22 M-17,-2 H17" stroke="#7a4e2c" stroke-width="1.8"/>' +
    '<path class="ti-queue" d="M0,22 C-6,32 6,40 0,50 C-6,60 6,66 0,76" stroke="#f4ecdc" stroke-width="1.6" fill="none"/>' + [32, 50, 68].map(function(y, i){ return '<path d="M-5,' + (y - 3) + ' L0,' + y + ' L-5,' + (y + 3) + ' Z M5,' + (y - 3) + ' L0,' + y + ' L5,' + (y + 3) + ' Z" fill="' + ['#e5484d', '#3f8fd6', '#4fb06a'][i] + '"' + st(1.2) + '/>'; }).join('') + '</g>';
  if(type === 'corbeau') return '<g class="ti-c-cb">' + corbeauSVG() + '</g>';
  if(type === 'anneau' || type === 'basile' || type === 'fanion') return '<circle r="10" fill="none"' + st(7) + '/><circle r="10" fill="none" stroke="url(#' + id + 'laiton)" stroke-width="4"/><path d="M-6,-7 C-3,-10 2,-10 5,-8" stroke="#fff6c8" stroke-width="1.6" fill="none" stroke-linecap="round"/>';
  if(type === 'enseigne') return '<path d="M0,-16 V-10" stroke="' + K + '" stroke-width="2"/><circle r="9" fill="none"' + st(6) + '/><circle r="9" fill="none" stroke="url(#' + id + 'laiton)" stroke-width="3.4"/>';
  /* (le petit anneau, plus difficile : avant, un crochet — Romain, 6 nov., 12 h 49 : « que des anneaux, tenus par des perches ») */
  if(type === 'crochet') return '<circle r="6.5" fill="none"' + st(5.6) + '/><circle r="6.5" fill="none" stroke="url(#' + id + 'laiton)" stroke-width="3"/><path d="M-3.6,-4.4 C-1.6,-6.4 1.4,-6.4 3.2,-5" stroke="#fff6c8" stroke-width="1.3" fill="none" stroke-linecap="round"/><path d="M0,6.5 l-4,5 M0,6.5 l4,5" stroke="#e5484d" stroke-width="2.4" stroke-linecap="round"/>';
  return '';
}
/* le pigeon (vu de profil) : il traverse, ou il se pose et roucoule */
function pigeonSVG(){
  return '<g class="ti-pigeon"><g class="ti-pg-ailes"><path d="M-2,-3 C-10,-16 -20,-14 -24,-7 C-16,-7 -10,-3 -5,2 Z" fill="#8a94b4"' + st(1.8) + '/></g>' +
    '<path d="M-14,2 L-22,0 L-20,6 Z" fill="#5e6890"' + st(1.4) + '/><ellipse cx="-2" cy="1" rx="12" ry="7" fill="#a8b0cc"' + st(2) + '/>' +
    '<path d="M3,-3 C6,-6 9,-6 10,-3" stroke="#6fd0a8" stroke-width="3" fill="none" stroke-linecap="round"/><circle cx="9" cy="-5" r="4.6" fill="#a8b0cc"' + st(1.8) + '/><circle cx="10.4" cy="-6" r="1.2" fill="' + K + '"/><path d="M13,-5 L17,-4 L13,-3 Z" fill="#f6a23a"' + st(1) + '/>' +
    '<path d="M-2,8 V12 M3,8 V12" stroke="#e8746a" stroke-width="1.8" stroke-linecap="round"/></g>';
}
/* le corbeau grognon (vu de profil, il regarde à droite) : sourcils froncés, œil jaune, une petite houppe ; jamais
   méchant pour de vrai. Ses ailes (.ti-cb-aile) battent en vol (CSS si posé et chassé, JS s'il traverse). */
function corbeauSVG(){
  return '<g class="ti-corbeau"><g class="ti-cb-aile2"><path d="M-4,-3 C-8,-15 -18,-19 -24,-15 C-18,-11 -12,-5 -6,1 Z" fill="#272a44"' + st(1.8) + '/></g>' +
    '<path d="M-13,1 L-26,-3 L-24,3 L-27,9 L-13,6 Z" fill="#30344f"' + st(1.8) + ' stroke-linejoin="round"/>' +
    '<ellipse cx="-2" cy="2" rx="13" ry="8.5" fill="#3a3f62"' + st(2.2) + '/><path d="M-8,6.4 C-2,9 6,8 10,4" stroke="#5c6594" stroke-width="2" fill="none" stroke-linecap="round"/>' +
    '<path d="M-2,10 V14.5 M3,10 V14.5" stroke="#f6a23a" stroke-width="1.9" stroke-linecap="round"/>' +
    '<circle cx="9" cy="-5" r="7" fill="#3a3f62"' + st(2) + '/><path d="M5,-11 L6.6,-15.6 L8.8,-11.6 L11,-15.2 L12,-10.6" fill="#3a3f62"' + st(1.4) + ' stroke-linejoin="round"/>' +
    '<path class="ti-cb-bec" d="M14.4,-6.4 L23,-3.6 L14.4,-1.6 Z" fill="#6a6a7e"' + st(1.6) + ' stroke-linejoin="round"/>' +
    '<circle cx="11.2" cy="-5.6" r="2.4" fill="#f6d23a"' + st(1) + '/><circle cx="11.8" cy="-5.3" r="1.05" fill="' + K + '"/>' +
    '<path d="M8.4,-9.6 L14,-7.6" stroke="' + K + '" stroke-width="2.1" stroke-linecap="round"/>' +
    '<g class="ti-cb-aile"><path d="M-2,-1 C-6,-13 -16,-19 -24,-13 C-17,-10 -11,-3 -6,4 Z" fill="#474e7a"' + st(2) + '/><path d="M-8,-7 l-6,-3 M-11,-3 l-7,-2" stroke="#272a44" stroke-width="1.2"/></g></g>';
}
/* la grosse tourterelle (niveau 9 et plus) : gris rosé, collier noir, grandes ailes */
function tourterelleSVG(){
  return '<g class="ti-tour"><g class="ti-to-aile2"><path d="M-2,-2 C-10,-20 -30,-28 -42,-22 C-30,-15 -18,-6 -8,2 Z" fill="#c9bfb6"' + st(1.8) + '/></g>' +
    '<path d="M-17,1 L-34,-2 L-33,8 L-17,7 Z" fill="#b8ada2"' + st(1.8) + ' stroke-linejoin="round"/><path d="M-30,-1 L-31,7" stroke="#f4f1ea" stroke-width="2"/>' +
    '<ellipse cx="-2" cy="2" rx="18" ry="9.5" fill="#e8ded4"' + st(2.2) + '/><path d="M-10,7 C-2,10 8,9 13,4" stroke="#f6eee6" stroke-width="2" fill="none" stroke-linecap="round"/>' +
    '<circle cx="14" cy="-5" r="6.4" fill="#e8ded4"' + st(2) + '/><path d="M9.4,-1.4 C10.6,1 12.6,1.6 14.6,1" stroke="' + K + '" stroke-width="1.8" fill="none" stroke-linecap="round"/>' +
    '<path d="M19.6,-5.6 L25.4,-3.8 L19.6,-2.6 Z" fill="#7a6262"' + st(1.2) + ' stroke-linejoin="round"/>' +
    '<circle cx="15.8" cy="-6" r="1.5" fill="' + K + '"/><circle cx="16.2" cy="-6.4" r=".5" fill="#fff"/><circle cx="13" cy="-2.6" r="1.5" fill="#ef9fa8" opacity=".6"/>' +
    '<g class="ti-to-aile"><path d="M-2,-1 C-8,-20 -30,-30 -44,-22 C-32,-15 -18,-4 -8,4 Z" fill="#f4efe8"' + st(2) + '/><path d="M-20,-13 l-8,-2 M-14,-7 l-9,-1 M-27,-18 l-8,-2" stroke="#b8ada2" stroke-width="1.4"/></g></g>';
}
/* le gros goéland (Romain : « le gros goéland, tu peux le faire voler assez lentement ») : blanc, ailes grises au bout
   noir, bec jaune avec son point rouge ; mêmes classes d'ailes que la tourterelle (elles battent pareil) */
function goelandSVG(){
  return '<g class="ti-tour ti-goeland"><g class="ti-to-aile2"><path d="M-2,-2 C-10,-22 -32,-30 -46,-24 C-32,-16 -18,-6 -8,2 Z" fill="#aeb7c4"' + st(1.8) + '/></g>' +
    '<path d="M-17,1 L-34,-1 L-33,8 L-17,7 Z" fill="#f4f6f8"' + st(1.8) + ' stroke-linejoin="round"/><path d="M-31,0 L-33,7" stroke="#24182e" stroke-width="2.6"/>' +
    '<ellipse cx="-2" cy="2" rx="18" ry="9.5" fill="#fbfcfd"' + st(2.2) + '/>' +
    '<circle cx="14" cy="-5" r="6.6" fill="#fbfcfd"' + st(2) + '/>' +
    '<path d="M19.4,-6 L28,-4.4 C28,-2.6 25,-2.2 19.4,-2.4 Z" fill="#f6c23a"' + st(1.3) + ' stroke-linejoin="round"/><circle cx="25.4" cy="-3.2" r="1.1" fill="#e5484d"/>' +
    '<circle cx="15.6" cy="-6.4" r="1.6" fill="#f6d23a"' + st(.8) + '/><circle cx="15.9" cy="-6.4" r=".7" fill="' + K + '"/>' +
    '<g class="ti-to-aile"><path d="M-2,-1 C-8,-22 -32,-32 -48,-23 C-34,-15 -18,-4 -8,4 Z" fill="#c9d1db"' + st(2) + '/><path d="M-36,-26 C-42,-26 -46,-25 -48,-23 C-44,-21 -40,-19 -36,-17 Z" fill="#24182e"/><path d="M-20,-13 l-8,-2 M-14,-7 l-9,-1" stroke="#97a1ae" stroke-width="1.4"/></g></g>';
}
var PLUME = '<path d="M0,-6 C3.4,-3 3.4,3 0,6 C-3.4,3 -3.4,-3 0,-6 Z M0,-6 L0,7" fill="#3a3f62" stroke="#24182e" stroke-width="1"/>';
var PLUME_CLAIRE = '<path d="M0,-6 C3.4,-3 3.4,3 0,6 C-3.4,3 -3.4,-3 0,-6 Z M0,-6 L0,7" fill="#f4efe8" stroke="#24182e" stroke-width="1"/>';
/* un mât à drapeau : la hampe (dessinée une fois) ; le tissu est redessiné à chaque image (il ondule) */
function matDrapeauSVG(dr){
  return '<path d="M' + dr.mx + ',' + dr.base + ' V' + (dr.top - 6) + '"' + st(6) + ' stroke-linecap="round"/><path d="M' + dr.mx + ',' + dr.base + ' V' + (dr.top - 6) + '" stroke="#b07a4a" stroke-width="3" stroke-linecap="round"/>' +
    '<circle cx="' + dr.mx + '" cy="' + (dr.top - 8) + '" r="3.6" fill="#e6b84a"' + st(1.6) + '/>';
}
/* les drapeaux qui battent au vent devant les cibles (les « branches » de l'ancien jeu) */
function drapeauSVG(L){
  return '<path d="M0,0 L' + f0(L) + ',0"' + st(7) + ' stroke-linecap="round"/><path d="M0,0 L' + f0(L) + ',0" stroke="#b07a4a" stroke-width="4" stroke-linecap="round"/><circle cx="' + f0(L) + '" cy="0" r="4" fill="#e6b84a"' + st(1.6) + '/>' +
    '<path class="ti-dr-tissu" d="M' + f0(L * 0.3) + ',0 L' + f0(L * 0.95) + ',0 L' + f0(L * 0.95) + ',30 Q' + f0(L * 0.62) + ',22 ' + f0(L * 0.3) + ',30 Z" fill="#3f6aa8"' + st(2.4) + ' stroke-linejoin="round"/><path d="M' + f0(L * 0.3) + ',10 H' + f0(L * 0.95) + '" stroke="#f6c23a" stroke-width="4"/><g class="mja-br-fl"></g>';
}

/* ==========================================================
   LE JEU
   ========================================================== */
function modeDe(p){ return MODES[p && p.decor] ? p.decor : 'clocher'; }
MJ.enregistrer('tir', {
  nom:'Tir à l\'arc', role:'pisteur', ic:'🏹',
  consigne:function(p){ var m = modeDe(p), fin = ' Tirée à fond, la super flèche traverse 2 choses. Les flèches tombées par terre se ramassent ; celles coincées dans le décor ou sorties de l\'écran sont perdues.'; return (m === 'banderoles' ? 'Pose ton doigt, tire vers l\'arrière et lâche : chaque flèche emmène la banderole jusqu\'à un anneau. Touche tous les anneaux !' :
    (m === 'cerfvolant' ? 'Pose ton doigt, tire vers l\'arrière et lâche : coupe la ficelle du cerf-volant sans toucher le cerf-volant, et touche les autres cibles.' : 'Pose ton doigt, tire vers l\'arrière et lâche : coupe la ficelle du ballon sans toucher le ballon, et touche les autres cibles.')) + fin; },
  minuteur:false,
  reglages: function(n, mods){
    var p = {};
    var listes = {1:['lanterne', 'pomme'], 2:['lanterne', 'pomme', 'lanterne'], 3:['lanterne', 'corbeau', 'pomme'], 4:['lanterne', 'corbeau', 'sac'],
      5:['lanterne', 'corbeau', 'sac', 'pomme'], 6:['lanterne', 'corbeau', 'sac', 'corbeau'], 7:['sac', 'corbeau', 'lanterne', 'corbeau', 'pomme'],
      8:['sac', 'corbeau', 'lanterne', 'corbeau', 'pomme'], 9:['sac', 'corbeau', 'pomme', 'lanterne', 'sac']};
    /* (niveaux 9 et 10 : un corbeau de moins, remplacé par une cible fixe — Romain, 6 nov., 12 h 49 : « au moins un de moins ») */
    p.cibles = (listes[Math.min(9, n)] || listes[9]).slice();
    /* (niveau 10 : jusqu'à 3 ballons ou cerfs-volants — Romain, 6 nov., 14 h 30) */
    if(n >= 10) p.cibles = ['sac', 'corbeau', 'sac', 'lanterne', 'sac'];
    if(n >= 11) p.cibles.push('corbeau');
    /* (6 nov., 14 h 30 : plus de cœurs ; les flèches tombées par terre se ramassent, seules celles plantées dans le décor
       ou sorties de l'écran sont perdues — la réserve, c'est le droit à l'erreur dans le décor) */
    var reserve = Math.floor(courbe(n, {1:4, 3:3, 6:2, 9:2, 12:1}) + 0.001);
    p.fleches = p.cibles.length + reserve + (mods.erreurs || 0) + (mods.fleches || 0);
    if((mods.fleches || 0) >= 99) p.fleches = 99;
    var lent = mods.lent || 1, stable = mods.stable === undefined ? 1 : mods.stable;
    p.vitesse = courbe(n, {1:0.5, 3:0.78, 6:1.08, 9:1.42, 12:1.7}) * lent;
    p.rayon = courbe(n, {1:19, 3:15.5, 6:13, 9:11, 12:10}) * (mods.zone || 1);
    p.corde = courbe(n, {1:7, 4:5.5, 9:4.2, 12:3.6}) * (mods.zone || 1);
    /* la ficelle du ballon et du cerf-volant (la cible principale, dès le niveau 1) : un peu plus large aux petits niveaux */
    p.ficelle = Math.max(p.corde, courbe(n, {1:10, 5:8, 10:6.5, 12:6}) * (mods.zone || 1));
    /* la longueur de la ficelle : c'est elle qui fait la difficulté (Romain, 6 nov., 14 h 30 : « très longue au début, on a
       beaucoup de marge ; au niveau 10, plus courte : il faut plus de précision ») — un facteur sur la longueur de la place */
    p.longFicelle = courbe(n, {1:1.8, 4:1.45, 7:1.15, 10:0.9, 12:0.85});
    p.vent = courbe(n, {1:0, 2:0, 3:38, 6:88, 9:130, 12:165}) * stable;
    p.rafales = n >= 6;
    /* la ligne de visée : plus longue qu'avant à tous les niveaux (Romain, 6 nov., 10 h 50 : « même au niveau 10 ») */
    p.apercu = courbe(n, {1:1.25, 3:0.8, 6:0.6, 9:0.46, 12:0.4}) + 0.12 * Math.min(5, mods.temps || 0);
    /* les obstacles du décor, solides (la flèche s'y plante) : fixes, et un qui bouge à partir du niveau 6 */
    /* (6 nov., 14 h 30 : peu de décor qui gêne aux petits niveaux ; au niveau difficile, 3 dont 2 qui bougent) */
    /* (Romain, 6 nov., 16 h 14 : seulement le seau et l'échafaudage, qui montent et descendent, plus le grand arbre ;
       chacun sur le clocher OU sur la maison, jamais les deux sur le même ; au niveau 10, le seau et l'échafaudage) */
    p.decors = n >= 9 ? 3 : (n >= 4 ? 2 : 1);
    p.fixes = 0; p.mobiles = p.decors;
    p.branches = 0;
    p.niveau = n;
    p.oiseaux = n >= 5 ? courbe(n, {5:7.5, 9:5.5, 12:4.5}) : 0;   /* (moins d'oiseaux : 6 nov., 14 h 30) */
    p.grands = n >= 7;   /* le gros goéland qui passe lentement, de temps en temps (Romain, 6 nov.) */
    /* les pigeons qui se posent (dès le niveau 2) : tous les combien, combien de temps */
    p.perche = n >= 2 ? courbe(n, {2:9, 5:7, 9:6.5, 12:5.5}) : 0;   /* (un peu moins souvent aux grands niveaux : « un petit peu trop compliqué ») */
    p.percheT = courbe(n, {2:2.4, 6:3, 9:3.4});
    /* l'arc qui tremble (Romain, 6 nov., 12 h 49) : seulement tiré à fond, au bout d'une seconde et demie ; on relâche un
       peu la corde, et la visée redevient normale (avant : au bout d'un moment, à toutes les puissances) */
    p.tenue = n >= 4 ? 1.5 : 99;
    p.tremble = courbe(n, {4:2.5, 6:3.5, 9:5, 12:6}) * stable;
    p.ralenti = mods.ralenti || 0;
    p.revele = !!mods.revele;
    p.aide = mods.aide || 0;
    p.lignes = [
      {nom:'Cibles', val:String(p.cibles.length)},
      {nom:'Flèches', val:p.fleches >= 99 ? '∞' : p.fleches + ' (' + (p.fleches - p.cibles.length) + ' de réserve)'},
      {nom:'Flèches perdues', val:'dans le décor ou hors de l\'écran ; celles par terre se ramassent'},
      {nom:'Vent', val:p.vent < 5 ? 'aucun' : (p.vent < 60 ? 'léger' : (p.vent < 110 ? 'fort' : 'tempête')) + (p.rafales && p.vent >= 5 ? ', en rafales' : '')},
      {nom:'Ligne de visée', val:p.revele ? 'complète' : (p.apercu > 0.8 ? 'longue' : (p.apercu > 0.3 ? 'moyenne' : 'très courte'))},
      {nom:'Tiré à fond, l\'arc tremble après', val:p.tenue > 50 ? 'jamais' : A.txtS(p.tenue)},
      {nom:'Décors qui gênent', val:{1:'le seau ou l\'échafaudage', 2:'le seau ou l\'échafaudage, et le grand arbre', 3:'le seau, l\'échafaudage et le grand arbre'}[p.decors]},
      {nom:'Oiseaux', val:(p.perche ? 'des corbeaux se posent sur les cibles' : 'aucun') + (p.oiseaux ? ', des tourterelles passent (touchées, elles s\'en vont)' : '')},
      {nom:'Flèche tirée à fond', val:'traverse une cible (ou un oiseau) : 2 d\'un coup'}
    ];
    return p;
  },
  jouer: function(el, p, fin){
    var P = A.Partie(fin), MODE = modeDe(p), HB = HABIT[MODE], BAND = MODE === 'banderoles';
    var hud = A.creerHud(el);
    /* la liste des cibles : le ballon (ou le cerf-volant) est toujours là, dès le niveau 1 */
    var liste = p.cibles.slice();
    if(!BAND && liste.indexOf('sac') < 0) liste[0] = 'sac';
    /* (les anneaux au bout des drapeaux ont été retirés avec les drapeaux : Romain, 6 nov., 10 h 50) */
    hud.prog(0, liste.length, '🎯');
    var badge = hud.badge(''); badge.classList.add('large');
    var terrain = U.html('<div class="mja-terrain mja-tir ti-' + MODE + '"></div>');
    el.appendChild(terrain);
    var id = A.nid('ti');
    terrain.innerHTML = '<svg viewBox="0 0 360 480" preserveAspectRatio="xMidYMid meet"><g class="mja-cam">' + sceneTir(id, MODE) +
      (BAND ? matSVG(id) : enfantSVG(ENF)) + '<g class="ti-supports"></g><g class="ti-porteurs"></g>' +
      '<g class="ti-lampadaire" transform="translate(162,' + SOL + ')"><path d="M0,0 V-64"' + st(7) + '/><path d="M0,0 V-64" stroke="#3b3346" stroke-width="4"/><path d="M-7,-64 H7 L5,-78 H-5 Z" fill="#ffe9a8"' + st(2.4) + '/><path d="M-8,-79 H8 L0,-86 Z" fill="#3b3346"' + st(2) + '/>' +
        '<g class="mja-manche-g" transform="translate(0,-88)"><path d="M0,0 V-10" stroke="' + K + '" stroke-width="2"/><path class="mja-manche" d="M0,-10 L26,-6 L0,-1 Z" fill="#e5484d"' + st(2) + ' stroke-linejoin="round"/></g></g>' +
      '<g class="ti-guirlandes"></g><g class="mja-cordes"></g><g class="mja-branches"></g><g class="ti-feuilles"></g><g class="mja-cibles-g"></g><g class="ti-perches"></g><g class="mja-oiseaux"></g><g class="mja-plantees"></g>' +
      '<g class="mja-apercu"></g><path class="mja-trainee" d=""/><g class="ti-vol-band"></g><g class="mja-fl-vol" opacity="0">' + FLECHE_FORTE + '</g><g class="mja-parts"></g>' +
      archerSVG() +
      '<g class="mja-arc-g" transform="translate(' + ARC.x + ',' + (ARC.y - 22) + ')"><circle class="mja-jauge-arc" r="46"/><g class="mja-arc-rot">' + ARC_ART + '<path class="mja-corde-arc" d="M0,-38 L0,38" stroke="#f4f1ea" stroke-width="2" fill="none"/><g class="mja-fl-encoche">' + FLECHE_FORTE + '</g></g>' +
        '<text class="mja-afond" x="4" y="-58" text-anchor="middle">À fond !</text></g>' +
      /* la jauge de puissance (Romain, 6 nov., 10 h 50 : « plus clair sur la puissance de l'arc, c'est important ») : une
         barre qui se remplit du bas vers le haut (vert, jaune, orange), et devient dorée, avec l'éclair, quand c'est à fond */
      '<g class="ti-puiss" opacity="0"><rect class="ti-pu-fond" x="5" y="226" width="22" height="148" rx="11"/>' +
        '<clipPath id="' + id + 'pu"><rect x="9" y="230" width="14" height="140" rx="7"/></clipPath>' +
        '<rect class="ti-pu-rempli" x="9" y="370" width="14" height="0" clip-path="url(#' + id + 'pu)"/>' +
        '<path class="ti-pu-traits" d="M9,323 h14 M9,277 h14 M9,237 h14"/>' +
        '<g class="ti-pu-eclair" transform="translate(16,212)"><circle r="12"/><path d="M2,-8 L-5,1 L0,1 L-2,8 L5,-1 L0,-1 Z"/></g>' +
        '<text class="ti-pu-mot" x="32" y="236"></text></g>' +
    '</g></svg>' +
    '<button class="btn grand b-aller mj-go-clignote ti-ramasser" type="button" hidden>🏹 Ramasser les flèches</button>' +
    (p.ralenti ? '<div class="mja-actions"><button class="btn magie mja-ralenti" type="button">⏳ Ralentir le temps (' + p.ralenti + ' s)</button></div>' : '');
    var svg = terrain.querySelector('svg');
    /* ce qu'on voit de la scène (une flèche qui en sort est perdue : Romain, 6 nov., 14 h 30) */
    var VIS = {x0:0, y0:0, x1:360, y1:480};
    A.cadrer(P, svg, {ancre:'bas', apres:function(x, y, w, h){ VIS = {x0:x, y0:y, x1:x + w, y1:y + h}; }});
    function horsEcran(x, y){ return x < VIS.x0 - 12 || x > VIS.x1 + 12 || y < VIS.y0 - 12; }
    var cam = svg.querySelector('.mja-cam'), gCordes = svg.querySelector('.mja-cordes'), gCibles = svg.querySelector('.mja-cibles-g'), gBr = svg.querySelector('.mja-branches'), gOis = svg.querySelector('.mja-oiseaux'), gPerch = svg.querySelector('.ti-perches');
    var gPl = svg.querySelector('.mja-plantees'), gAp = svg.querySelector('.mja-apercu'), trainee = svg.querySelector('.mja-trainee'), flVol = svg.querySelector('.mja-fl-vol'), gParts = svg.querySelector('.mja-parts'), gGuir = svg.querySelector('.ti-guirlandes'), gVolB = svg.querySelector('.ti-vol-band');
    var arcRot = svg.querySelector('.mja-arc-rot'), cordeArc = svg.querySelector('.mja-corde-arc'), encoche = svg.querySelector('.mja-fl-encoche'), jaugeArc = svg.querySelector('.mja-jauge-arc'), manche = svg.querySelector('.mja-manche-g'), aFond = svg.querySelector('.mja-afond');
    var archer = Archer(svg.querySelector('.ti-archer')), humeur = '', humeurT = 0;
    var puG = svg.querySelector('.ti-puiss'), puRempli = svg.querySelector('.ti-pu-rempli'), puMot = svg.querySelector('.ti-pu-mot');
    var coq = svg.querySelector('.ti-coq'), nuages = Array.prototype.slice.call(svg.querySelectorAll('.ti-nuage')), enfant = svg.querySelector('.ti-enfant');
    nuages.forEach(function(n){ n.__x = +n.getAttribute('data-x'); n.__y = +n.getAttribute('data-y'); n.__s = +n.getAttribute('data-s'); });
    var perche = svg.querySelector('.ti-perche'), perche2 = svg.querySelector('.ti-perche2');
    /* la fumée des cheminées (penchée par le vent) */
    var fumees = Array.prototype.slice.call(svg.querySelectorAll('.ti-fumee')).map(function(g){ var x = +g.getAttribute('data-x'), y = +g.getAttribute('data-y'), bouffees = []; for(var i = 0; i < 4; i++){ bouffees.push({c:svgNoeud('circle', {fill:'#f4efe8', r:4}, g), ph:i / 4}); } return {x:x, y:y, b:bouffees}; });
    /* le vent (Romain, 6 nov., 9 h 02) : il change de sens toutes les 3,5 à 6 secondes, au hasard, avec une transition
       d'une seconde et demie (les drapeaux retombent, puis repartent de l'autre côté). Le programme est tiré au départ :
       la visée et le robot peuvent donc prévoir le vent à venir. ventSens(tt) : de -1 (vers la gauche) à 1 (vers la droite). */
    var SAUTS = [], dV = Math.random() < 0.5 ? -1 : 1, TRV = 1.5;
    SAUTS.push({t:-1e9, de:dV, a:dV});
    for(var tV = R(3.5, 6); tV < 1200; tV += R(3.5, 6)){ var nv = -Math.sign(dV) * R(0.72, 1); SAUTS.push({t:tV, de:dV, a:nv}); dV = nv; }
    var iV = 0;
    function ventSens(tt){
      if(iV >= SAUTS.length || SAUTS[iV].t > tt) iV = 0;
      while(iV < SAUTS.length - 1 && SAUTS[iV + 1].t <= tt) iV++;
      var s = SAUTS[iV], u = (tt - s.t) / TRV;
      return u >= 1 ? s.a : s.de + (s.a - s.de) * lisse(u);
    }
    var fleches = p.fleches, tirs = 0, touches = 0, utiles = 0, maxPerce = 0, fini = false, t = 0, ralentiT = 0, slow = 1, slowCible = 1;
    var camZ = 1, camX = 180, camY = 240, camZc = 1, camXc = 180, camYc = 240, tenir = 0;
    function majCarquois(){ badge.innerHTML = '<span class="mja-carquois">🏹 ' + (fleches >= 99 ? '∞' : '× ' + fleches) + '</span>'; }
    majCarquois();
    /* les flèches par terre (on les ramasse quand le carquois est vide), celles qui tombent, celles qu'on ramasse */
    var parTerre = [], chutes = [], ramassees = [], perdues = 0;

    /* ----- les drapeaux au vent (obstacles ; aux banderoles, certains portent un anneau) ----- */
    var drapeaux = [];
    for(var b = 0; b < 0; b++){   /* (plus de drapeaux : Romain, 6 nov., 10 h 50 ; le code reste au cas où) */
      var dr = Object.assign({ph:R(0, 6), k:b}, DRAPEAUX[b]);
      dr.g = svgNoeud('g', {'class':'ti-drapeau-v'}, gBr);
      dr.g.innerHTML = matDrapeauSVG(dr) + '<g class="ti-dr-t"><path class="ti-dr-tissu-v" fill="' + dr.coul + '"' + st(2.2) + ' stroke-linejoin="round"/><path class="ti-dr-bande" fill="none" stroke="' + dr.bande + '" stroke-width="5"/><circle class="ti-dr-rond" r="4.6" fill="' + dr.bande + '"' + st(1.4) + '/></g>';
      dr.t = dr.g.querySelector('.ti-dr-t'); dr.tissu = dr.g.querySelector('.ti-dr-tissu-v'); dr.bd = dr.g.querySelector('.ti-dr-bande'); dr.rond = dr.g.querySelector('.ti-dr-rond');
      drapeaux.push(dr);
    }
    /* la pose du tissu au temps tt : l'angle (0 = vers la droite, π/2 = il pend, π = vers la gauche) et sa longueur (il se
       replie un peu quand il pend) ; le tissu tourne autour du milieu de son bord attaché au mât */
    function poseDrapeau(dr, tt){
      var w = ventSens(tt), aw = Math.abs(w);
      return {phi:(Math.PI / 2) * (1 - 0.88 * w) + Math.sin(tt * 6.5 + dr.ph) * 0.05 * aw, sx:0.5 + 0.5 * aw, cx:dr.mx, cy:dr.top + dr.H / 2};
    }
    function boutDrapeau(dr, tt){ var po = poseDrapeau(dr, tt), l = dr.L * po.sx + 9; return {x:po.cx + Math.cos(po.phi) * l, y:po.cy + Math.sin(po.phi) * l}; }
    function collDrapeau(dr, x, y, tt){
      var po = poseDrapeau(dr, tt === undefined ? t : tt), dx = x - po.cx, dy = y - po.cy, ca = Math.cos(po.phi), sa = Math.sin(po.phi);
      var lx = (dx * ca + dy * sa) / po.sx, ly = -dx * sa + dy * ca;
      return (lx > 2 && lx < dr.L && Math.abs(ly) < dr.H / 2 + 2) ? {lx:lx, ly:ly} : null;
    }
    function dessinerDrapeau(dr){
      var po = poseDrapeau(dr, t), L = dr.L, H = dr.H, w = Math.abs(ventSens(t)), A0 = 2 + 3 * w, k = 6.283 / (L * 0.9), om = 9 + 5 * w;
      /* le tissu ondule : une vague qui part du mât, plus forte au bout */
      var haut = [], bas = [];
      for(var i = 0; i <= 6; i++){ var x = L * i / 6, o = A0 * (i / 6) * Math.sin(k * x - t * om + dr.ph); haut.push(f1(x) + ',' + f1(-H / 2 + o)); bas.push(f1(x) + ',' + f1(H / 2 + o)); }
      dr.tissu.setAttribute('d', 'M' + haut.join(' L') + ' L' + bas.reverse().join(' L') + ' Z');
      var mi = []; for(var j = 0; j <= 6; j++){ var x2 = L * j / 6; mi.push(f1(x2) + ',' + f1(A0 * (j / 6) * Math.sin(k * x2 - t * om + dr.ph))); }
      dr.bd.setAttribute('d', 'M' + mi.join(' L'));
      dr.rond.setAttribute('cx', f1(L * 0.62)); dr.rond.setAttribute('cy', f1(A0 * 0.62 * Math.sin(k * L * 0.62 - t * om + dr.ph)));
      dr.t.setAttribute('transform', 'translate(' + po.cx + ',' + f1(po.cy) + ') rotate(' + f1(po.phi * 57.2958) + ') scale(' + po.sx.toFixed(3) + ',1)');
    }

    /* ----- les obstacles du décor (Romain, 6 nov., 10 h 50 : « des décors solides, variés, des fixes et d'autres qui
       bougent, mais qu'on comprenne que ce sont des trucs qui gênent ; il faut pouvoir jouer quand même ») -----
       Tous en bois ou en fer, bien dessinés, avec un contour sombre ; une flèche s'y plante (« Toc ! »), même tirée à fond.
       Quand la ligne de visée les touche, elle devient rouge et l'obstacle s'entoure de rouge. */
    var obstacles = [], enfX = ENF;
    (function(){
      /* (le balcon, la pancarte, le linge, l'enseigne du forgeron et Basile à l'échelle sont retirés : Romain, 6 nov.,
         16 h 14 : « on va se contenter du seau qui monte et qui descend, et d'un échafaudage » ; leur code reste) */
      /* le seau et l'échafaudage : l'un sur le clocher, l'autre sur la maison à colombages (tirés au sort), jamais les deux
         sur le même bâtiment ; le grand arbre en plus aux niveaux 4 et plus (pas aux banderoles : il cacherait le mât) */
      var lieux = U.melanger(['clocher', 'maison']), deux = U.melanger(['seau', 'echafaudage']), lieuDe = {seau:lieux[0], echafaudage:lieux[1]}, choix;
      if(p.decors >= 3) choix = ['seau', 'echafaudage'].concat(BAND ? [] : ['platane']);
      else if(p.decors === 2) choix = [deux[0], BAND ? deux[1] : 'platane'];
      else choix = [deux[0]];
      if(p.obstaclesForces){ p.obstaclesForces.forEach(function(t){ var q = t.split('@'); obstacles.push(creerObstacle(q[0], q[1] || 'maison')); }); return; }   /* (pour les essais : 'seau@clocher') */
      choix.forEach(function(t){ obstacles.push(creerObstacle(t, lieuDe[t])); });
    })();
    /* (16 h 16 : « tu alternes entre les deux » : l'un part d'en haut, l'autre d'en bas ; ensuite chacun à ses vitesses) */
    var se = obstacles.filter(function(o){ return o.type === 'seau'; })[0], ec = obstacles.filter(function(o){ return o.type === 'echafaudage'; })[0];
    if(se && ec) programme(ec, se.prog[0].a < 0.5);
    /* (l'échafaudage du clocher descend jusque devant la porte : l'enfant attend alors son ballon plus à gauche) */
    if(obstacles.some(function(o){ return o.type === 'echafaudage' && o.lieu === 'clocher'; })){ enfX = 200; var en0 = svg.querySelector('.ti-enfant'); if(en0) en0.setAttribute('transform', 'translate(200,' + SOL + ')'); }
    function creerObstacle(type, lieu){
      var o = {type:type, lieu:lieu || 'maison', ph:R(0, 6), formes:[]}, s = '';
      var bois = '#b07a4a', boisF = '#7d5428', fer = '#3b3346';
      if(type === 'echafaudage'){
        /* le plancher du peintre, pendu à deux cordes sous le toit de la maison à colombages, avec ses pots de peinture
           (avant : un échafaudage sur poteaux ; les poteaux arrêtaient presque toutes les flèches, juste devant l'archer) */
        /* (robot, 6 nov. : les obstacles juste devant l'archer arrêtaient presque tous les tirs ; ils sont maintenant plus
           loin, vers les cibles, et chacun ne barre qu'une partie des chemins) */
        /* (6 nov., 12 h 49 : il pend maintenant sous la corniche du clocher, à droite : les cibles sont partout, il ne
           doit plus être au milieu) */
        /* (6 nov., 14 h 57 : les cibles sont toutes en haut à droite ; il pend de nouveau sous le toit de la maison à
           colombages, ENTRE l'archer et les cibles) */
        /* (Romain, 6 nov., 15 h 51 : « fais-le descendre et remonter, anime-le » : il descend jusqu'au-dessus du lampadaire
           et remonte, doucement, toujours au même rythme ; ses deux cordes s'allongent) */
        /* (Romain, 6 nov., 16 h 16 : « fais-le descendre jusqu'en bas, jusqu'à la rue, et monter le plus haut possible ») :
           il va de juste sous le toit jusqu'aux pavés, et remonte ; le plancher est dessiné en haut, il descend de « d » */
        var X0 = o.lieu === 'clocher' ? 270 : 102, LG = o.lieu === 'clocher' ? 60 : 52, Y0 = o.lieu === 'clocher' ? 224 : 226;
        o.cordes = o.lieu === 'clocher' ? [[278, 156], [322, 156]] : [[112, 226 - 6], [146, 196]];
        s = '<path class="ti-e-corde" d="" stroke="#d9c8a8" stroke-width="2"/>' + o.cordes.map(function(c){ return '<circle cx="' + c[0] + '" cy="' + c[1] + '" r="3" fill="' + fer + '"/>'; }).join('');
        o.art = '<rect x="' + X0 + '" y="' + Y0 + '" width="' + LG + '" height="11" rx="2" fill="#c99a5e"' + st(3) + '/><path d="M' + (X0 + 4) + ',' + (Y0 + 5.5) + ' H' + (X0 + LG - 4) + '" stroke="' + boisF + '" stroke-width="1.6"/>' +
          '<rect x="' + (X0 + 10) + '" y="' + (Y0 - 11) + '" width="11" height="11" rx="2" fill="#5e8ac8"' + st(2) + '/><rect x="' + (X0 + LG - 22) + '" y="' + (Y0 - 9) + '" width="9" height="9" rx="2" fill="#e5484d"' + st(2) + '/><path d="M' + (X0 + LG / 2) + ',' + Y0 + ' l4,-14" stroke="' + boisF + '" stroke-width="2.4"/><path d="M' + (X0 + LG / 2 + 3) + ',' + (Y0 - 15) + ' l3,-4" stroke="#f6d23a" stroke-width="4" stroke-linecap="round"/>';
        o.formesL = [{r:[X0 - 2, Y0 - 14, LG + 4, 27]}];
        o.mob = {ax:0, ay:0, haut:0, bas:SOL - 2 - 11 - Y0, w:0.6};
        o.bas0 = Y0 + 2;
        o.planche = true;
      } else if(type === 'enseigne'){
        /* l'enseigne du forgeron : une potence en fer et un panneau de bois (l'enclume) */
        s = '<path d="M266,176 H220 M262,176 L246,160"' + st(5) + ' stroke-linecap="round"/><path d="M266,176 H220 M262,176 L246,160" stroke="' + fer + '" stroke-width="2.6" stroke-linecap="round"/><path d="M228,176 V182 M254,176 V182" stroke="' + fer + '" stroke-width="2"/>' +
          '<rect x="222" y="182" width="38" height="28" rx="4" fill="#a8743f"' + st(3) + '/><path d="M229,203 H253 M233,203 L235,195 H247 L249,203 M237,195 C237,189 249,189 251,193" fill="none" stroke="' + fer + '" stroke-width="2.6" stroke-linejoin="round"/>';
        o.formes = [{r:[220, 180, 42, 32]}];
      } else if(type === 'platane'){
        /* le grand arbre, derrière l'archer (Romain, 6 nov., 16 h 43 : « qu'il reste en 2D, qu'il se balance du côté gauche
           ou du côté droit avec le vent ») : tout l'arbre se penche autour du pied de son tronc. Vent vers la droite : sa
           grosse branche avance au-dessus de l'archer et gêne ; vent vers la gauche : il se penche loin à gauche et ne gêne
           plus du tout. Il suit le vent avec le retard du décor (1,4 s après les feuilles). Le tronc se courbe (plus en haut
           qu'en bas) ; le feuillage (o.m) tourne d'un bloc, la flèche s'y plante. Tout est dessiné depuis le pied (30, 408). */
        var FE = [[116, -232, 14], [137, -239, 16], [126, -216, 11], [100, -222, 10]];
        s = '<path class="ti-tr-c" d=""' + st(13) + ' fill="none" stroke-linecap="round"/><path class="ti-tr-b" d="" stroke="#8a6a4a" stroke-width="8" fill="none" stroke-linecap="round"/>';
        o.art = '<path d="M16,-182 C46,-208 80,-224 116,-224"' + st(11) + ' fill="none" stroke-linecap="round"/><path d="M16,-182 C46,-208 80,-224 116,-224" stroke="#8a6a4a" stroke-width="6.5" fill="none" stroke-linecap="round"/>' +
          FE.map(function(q){ return '<circle cx="' + q[0] + '" cy="' + q[1] + '" r="' + q[2] + '" fill="#4f9a4a"' + st(3) + '/>'; }).join('') +
          [[112, -237, 5], [133, -244, 7]].map(function(q){ return '<circle cx="' + q[0] + '" cy="' + q[1] + '" r="' + q[2] + '" fill="#8fd07a" opacity=".55"/>'; }).join('');
        o.formesL = FE.map(function(q){ return {c:q}; });
        o.vent = true; o.pied = [30, SOL - 14];
      } else if(type === 'echelle'){
        /* Basile traverse la place, sa grande échelle sur l'épaule, penchée (6 nov., 14 h 30) : il entre par la droite,
           marche jusqu'au milieu, se retourne, repart, sort ; revient un peu plus tard. Toujours au même pas : on peut
           prévoir. Seule l'échelle arrête les flèches (elles passent devant Basile). */
        o.marche = {xa:180, xb:450, v:24, pause:1.3, dehors:3};
        o.marche.T1 = (o.marche.xb - o.marche.xa) / o.marche.v; o.marche.C = 2 * o.marche.T1 + o.marche.pause + o.marche.dehors;
        o.ph = R(0, o.marche.C);
        o.art = '<path d="M-30,-4.5 H142 M-30,4.5 H142"' + st(5.4) + ' stroke-linecap="round"/><path d="M-30,-4.5 H142 M-30,4.5 H142" stroke="#c99a5e" stroke-width="2.8" stroke-linecap="round"/>' +
          [-22, -8, 6, 20, 34, 48, 62, 76, 90, 104, 118, 132].map(function(x){ return '<path d="M' + x + ',-4.5 V4.5" stroke="#8a5a33" stroke-width="2.4"/>'; }).join('');
        o.formesL = [{r:[-32, -6, 176, 12]}];
        o.marcheur = basileMarcheSVG(BAND);   /* (aux banderoles, Basile est peut-être déjà sur son échelle : c'est un autre villageois qui passe) */
      }
      else if(type === 'balcon'){
        /* un balcon de pierre avec sa rambarde de fer et ses fleurs, sur la maison à colombages */
        s = '<rect x="176" y="306" width="62" height="10" rx="2" fill="#c9bca4"' + st(3) + '/><path d="M180,306 V290 M190,306 V290 M200,306 V290 M210,306 V290 M220,306 V290 M230,306 V290 M178,290 H236" stroke="' + fer + '" stroke-width="2.6"/>' +
          [184, 196, 208, 220, 232].map(function(x, i){ return '<circle cx="' + x + '" cy="287" r="4.4" fill="' + ['#e5484d', '#f6d23a', '#ef7fb0', '#fff4f0', '#e5484d'][i] + '"' + st(1.4) + '/>'; }).join('');
        o.formes = [{r:[174, 282, 66, 36]}];
      } else if(type === 'seau'){
        /* la poulie du grenier (sous le toit de la maison à colombages) : un seau qui monte et descend (ça bouge : attention) */
        /* (Romain, 6 nov., 12 h 49 : « j'aime bien le petit seau qui monte et qui descend ; fais-le descendre vraiment
           jusqu'en bas » : sa potence sort du mur du clocher ; il descend jusqu'aux pavés et s'y pose un instant) */
        if(o.lieu === 'clocher'){
          /* (sa potence sort du mur du clocher ; il descend jusqu'aux pavés) */
          /* (sa potence sort du mur du clocher juste sous la corniche : il monte jusque-là et descend jusqu'aux pavés) */
          s = '<path d="M268,162 H236 M268,182 L250,162"' + st(6) + ' stroke-linecap="round"/><path d="M268,162 H236 M268,182 L250,162" stroke="' + bois + '" stroke-width="3" stroke-linecap="round"/><circle cx="242" cy="166" r="5" fill="#9aa4b4"' + st(2) + '/>';
          o.mob = {ax:242, ay:170, bas:234, haut:8, w:0.6};
        } else if(BAND){
          /* (aux banderoles, il pend à une potence en haut du mât de la fête : l'échelle de Basile est près du clocher) */
          s = '<path d="M118,226 H146 M118,246 L134,226"' + st(6) + ' stroke-linecap="round"/><path d="M118,226 H146 M118,246 L134,226" stroke="' + bois + '" stroke-width="3" stroke-linecap="round"/><circle cx="142" cy="230" r="5" fill="#9aa4b4"' + st(2) + '/>';
          o.mob = {ax:142, ay:234, bas:170, haut:4, w:0.6};
        } else {
          /* (14 h 57 : sa potence sort du coin entre les deux maisons de gauche : il monte et descend entre l'archer et les cibles) */
          s = '<path d="M94,214 H146 M98,234 L116,214"' + st(6) + ' stroke-linecap="round"/><path d="M94,214 H146 M98,234 L116,214" stroke="' + bois + '" stroke-width="3" stroke-linecap="round"/><circle cx="142" cy="218" r="5" fill="#9aa4b4"' + st(2) + '/>';
          o.mob = {ax:142, ay:222, bas:182, haut:4, w:0.6};
        }
        o.art = '<path class="ti-o-corde" d="M0,-200 V-12" stroke="#d9c8a8" stroke-width="1.8"/><path d="M-11,-12 L11,-12 L8,12 L-8,12 Z" fill="#9aa4b4"' + st(2.6) + ' stroke-linejoin="round"/><path d="M-11,-12 C-11,-24 11,-24 11,-12" stroke="' + fer + '" stroke-width="2" fill="none"/><path d="M-9,-4 H9" stroke="#6a7484" stroke-width="2"/>';
        o.formesL = [{r:[-12, -13, 24, 26]}];
      } else if(type === 'linge'){
        /* le linge qui sèche entre deux maisons : trois draps qui bougent un peu au vent (on peut tirer entre eux) */
        /* (deux draps, bien écartés : entre la maison à colombages et le clocher ; aux banderoles, plus bas à gauche) */
        /* (aux banderoles aussi, entre la maison et le clocher : à gauche, il cachait l'anneau de la dame, au-dessus de l'archer) */
        { s ='<path d="M110,230 Q153,244 196,230" stroke="#f4ecdc" stroke-width="2" fill="none"/><circle cx="110" cy="230" r="3.4" fill="' + fer + '"/><circle cx="196" cy="230" r="3.4" fill="' + fer + '"/>'; o.draps = [[124, 237, '#f4f1ea'], [182, 237, '#9ec6ec']]; }   /* (bien écartés : réglé au robot) */   /* (14 h 57 : entre la maison de gauche et la maison à colombages, entre l'archer et les cibles) */
        o.formesL = null;
      } else if(type === 'pancarte'){
        /* une pancarte qui se balance au bout de sa chaîne, sous une potence accrochée au clocher */
        s = '<path d="M264,152 H230"' + st(5) + '/><path d="M264,152 H230" stroke="' + fer + '" stroke-width="2.6"/>';
        o.pend = {ax:236, ay:154, L:26, amp:0.45, w:1.3};
        o.art = '<path d="M0,0 V' + 14 + '" stroke="' + fer + '" stroke-width="2"/><rect x="-14" y="14" width="28" height="20" rx="3" fill="#e6c25a"' + st(2.6) + '/><path d="M-7,24 h14 M-4,19 h8" stroke="#8a5a33" stroke-width="2" stroke-linecap="round"/>';
        o.formesL = [{r:[-15, 13, 30, 22]}];
      }
      /* (un décalage par obstacle, réglé au robot : chacun barre une partie des chemins vers les cibles, pas tous) */
      var OFF = [0, 0];
      /* la place que l'obstacle prend (pour ne pas y mettre de cible) */
      o.zones = {echafaudage:[o.lieu === 'clocher' ? [268, 208, 64, 214] : [100, 210, 56, 212]], enseigne:[[220, 176, 46, 36]], seau:[o.lieu === 'clocher' ? [230, 158, 24, 264] : [130, 210, 24, 212]], linge:[[108, 226, 90, 44]], pancarte:[[220, 150, 32, 40]], balcon:[[174, 282, 66, 36]]}[type] || [];
      if(type === 'platane') o.zones = o.formesL.map(function(f){ return [30 + f.c[0] - f.c[2] - 10, SOL - 14 + f.c[1] - f.c[2] - 6, f.c[2] * 2 + 20, f.c[2] * 2 + 12]; });
      if(type === 'echelle') o.zones = [[90, 260, 380, 162]];
      o.dx = OFF[0]; o.dy = OFF[1];
      o.g = svgNoeud('g', {'class':'ti-obstacle ti-o-' + type, transform:(o.dx || o.dy) ? 'translate(' + o.dx + ',' + o.dy + ')' : null}, gBr);
      if(!(o.dx || o.dy)) o.g.removeAttribute('transform');
      o.g.innerHTML = s;
      if(o.marcheur){ o.w = svgNoeud('g', {'class':'ti-marcheur'}, o.g); o.w.innerHTML = o.marcheur; o.jg = o.w.querySelector('.ti-mj-g'); o.jd = o.w.querySelector('.ti-mj-d'); o.wc = o.w.querySelector('.ti-mj-corps'); }
      if(o.art){ o.m = svgNoeud('g', {'class':'ti-o-mob'}, o.g); o.m.innerHTML = o.art; }

      if(o.draps){ o.dr = o.draps.map(function(d){ var e = svgNoeud('g', {'class':'ti-o-mob'}, o.g); e.innerHTML = '<path d="M-9,0 H9 L10,28 Q0,24 -10,28 Z" fill="' + d[2] + '"' + st(2.4) + ' stroke-linejoin="round"/><path d="M-6,0 V-3 M6,0 V-3" stroke="#8a5a33" stroke-width="2.4"/>'; return e; }); }
      o.pl = svgNoeud('g', {}, o.g);   /* (les flèches plantées dans un obstacle fixe) */
      if(o.mob) programme(o, Math.random() < 0.5);
      return o;
    }
    /* Le seau et l'échafaudage (Romain, 6 nov., 16 h 43 : « des vitesses aléatoires : une fois il descend en je ne sais
       combien de secondes, il remonte en je ne sais combien, puis il redescend pas à la même vitesse ; toujours lent ») :
       chaque descente et chaque montée a sa durée, tirée au hasard (lente), avec un petit arrêt en haut et en bas. Le
       programme est tiré au départ (comme le vent) : la visée et le robot peuvent prévoir où il sera. 0 = en haut, 1 = en bas. */
    function programme(o, enBas){
      var L = [], tt = -R(0, 3), f = enBas ? 1 : 0, dmin = o.type === 'seau' ? 5 : 4.5, dmax = o.type === 'seau' ? 9.5 : 8.5;
      while(tt < 1500){ var pz = R(0.4, 1.5); L.push({t0:tt, d:pz, a:f, b:f}); tt += pz; var dd = R(dmin, dmax); L.push({t0:tt, d:dd, a:f, b:1 - f}); tt += dd; f = 1 - f; }
      o.prog = L; o.iP = 0;
    }
    function fracProg(o, tt){
      var L = o.prog, i = o.iP || 0;
      if(i >= L.length || L[i].t0 > tt) i = 0;
      while(i < L.length - 1 && L[i + 1].t0 <= tt) i++;
      o.iP = i;
      var g = L[i], u = fixe((tt - g.t0) / g.d, 0, 1);
      return g.a + (g.b - g.a) * lisse(u);
    }
    /* où est la partie qui bouge au temps tt ; et ses formes, dans le monde */
    function posMob(o, tt){
      if(o.mob) return {x:o.mob.ax, y:o.mob.ay + o.mob.haut + (o.mob.bas - o.mob.haut) * fracProg(o, tt), a:0};
      if(o.pend){ var a = Math.sin(tt * o.pend.w + o.ph) * o.pend.amp; return {x:o.pend.ax, y:o.pend.ay, a:a}; }
      /* l'arbre : m = 1 quand le vent souffle vers la droite (la branche avance au-dessus de l'archer et gêne), m = −1 quand
         il souffle vers la gauche (elle est retournée de l'autre côté du tronc, hors du chemin des flèches) ; entre les deux,
         pendant que le vent tourne (en retard sur les feuilles, comme le reste du décor) */
      if(o.vent){ var wv = ventDecor(tt), th = wv > 0 ? 0.05 * Math.min(1, wv / 0.7) : -0.6 * Math.min(1, -wv / 0.7);   /* (−34° : assez pour libérer le chemin des flèches, et on le voit encore sur un téléphone) */ return {x:o.pied[0], y:o.pied[1], a:th + Math.sin(tt * 1.9 + o.ph) * 0.025 + Math.sin(tt * 3.1 + o.ph) * 0.01}; }
      if(o.marche){
        /* où est Basile au temps tt : il marche vers la gauche, se retourne, repart vers la droite, attend dehors */
        var M = o.marche, u = ((tt + o.ph) % M.C + M.C) % M.C, x, th, pas = 0;
        if(u < M.T1){ x = M.xb - M.v * u; th = 2.24; pas = 1; }
        else if(u < M.T1 + M.pause){ x = M.xa; th = 2.24 - 1.34 * lisse((u - M.T1) / M.pause); }
        else if(u < 2 * M.T1 + M.pause){ x = M.xa + M.v * (u - M.T1 - M.pause); th = 0.9; pas = 1; }
        else { x = M.xb; th = 0.9 + 1.34 * lisse((u - 2 * M.T1 - M.pause) / M.dehors); }
        var dir = Math.cos(th) >= 0 ? 1 : -1, bob = pas ? Math.abs(Math.sin(x / 9)) * 2 : 0;
        return {x:x + dir * 3, y:SOL - 37 - bob, a:Math.atan2(-Math.sin(th), Math.cos(th)), bx:x, dir:dir, pas:pas, bob:bob};
      }
      return null;
    }
    function posDrap(o, i, tt){ var d = o.draps[i], w = ventDecor(tt); return {x:d[0] + w * 5 + Math.sin(tt * 2.6 + i * 1.7 + o.ph) * 2, y:d[1], a:-w * 0.22 + Math.sin(tt * 3.1 + i) * 0.05}; }
    function dansForme(f, x, y){ if(f.c) return Math.hypot(x - f.c[0], y - f.c[1]) < f.c[2]; return x > f.r[0] && x < f.r[0] + f.r[2] && y > f.r[1] && y < f.r[1] + f.r[3]; }
    function enLocal(pm, x, y){ var dx = x - pm.x, dy = y - pm.y, ca = Math.cos(-pm.a), sa = Math.sin(-pm.a); return {x:dx * ca - dy * sa, y:dx * sa + dy * ca}; }
    function collObstacle(o, x, y, tt){
      var i; x -= o.dx; y -= o.dy;
      for(i = 0; i < o.formes.length; i++) if(dansForme(o.formes[i], x, y)) return {loc:null};
      if(o.formesL){ var pm = posMob(o, tt), l = enLocal(pm, x, y); for(i = 0; i < o.formesL.length; i++) if(dansForme(o.formesL[i], l.x, l.y)) return {loc:l, mob:true}; }
      if(o.draps){ for(i = 0; i < o.draps.length; i++){ var pd = posDrap(o, i, tt), ld = enLocal(pd, x, y); if(ld.x > -10 && ld.x < 10 && ld.y > -2 && ld.y < 28) return {loc:ld, drap:i}; } }
      return null;
    }
    function dessinerObstacle(o){
      if(o.m){ var pm = posMob(o, t); o.m.setAttribute('transform', 'translate(' + f1(pm.x) + ',' + f1(pm.y) + ') rotate(' + f1(pm.a * 57.3) + ')'); var co = o.m.querySelector('.ti-o-corde'); if(co) co.setAttribute('d', 'M0,' + f1(o.mob.ay - pm.y - 4) + ' V-12'); }
      if(o.planche){ var pp = posMob(o, t), yb = f1(o.bas0 + pp.y); o.g.querySelector('.ti-e-corde').setAttribute('d', 'M' + o.cordes[0][0] + ',' + o.cordes[0][1] + ' V' + yb + ' M' + o.cordes[1][0] + ',' + o.cordes[1][1] + ' V' + yb); }
      if(o.vent){
        var pv = posMob(o, t), tourne = function(x, y, f){ var a = pv.a * f, c = Math.cos(a), sn = Math.sin(a); return f1(o.pied[0] + x * c - y * sn) + ',' + f1(o.pied[1] + x * sn + y * c); };
        var dT = 'M' + o.pied[0] + ',' + o.pied[1] + ' C' + tourne(-6, -68, 0.2) + ' ' + tourne(-2, -140, 0.6) + ' ' + tourne(16, -182, 1);
        o.g.querySelector('.ti-tr-c').setAttribute('d', dT); o.g.querySelector('.ti-tr-b').setAttribute('d', dT);
      }
      if(o.marche){
        var pw = posMob(o, t), ph2 = pw.bx / 9, g1 = pw.pas ? Math.sin(ph2) : 0;
        o.w.setAttribute('transform', 'translate(' + f1(pw.bx) + ',' + SOL + ') scale(' + pw.dir + ',1)');
        o.wc.setAttribute('transform', 'translate(0,' + f1(-pw.bob) + ')');
        o.jg.setAttribute('d', jambe(g1)); o.jd.setAttribute('d', jambe(-g1));
      }
      if(o.dr) o.dr.forEach(function(e, i){ var pd = posDrap(o, i, t); e.setAttribute('transform', 'translate(' + f1(pd.x) + ',' + f1(pd.y) + ') rotate(' + f1(pd.a * 57.3) + ')'); });
    }

    /* ----- les cibles ----- */
    /* où les mettre (6 nov., 12 h 49 : partout dans l'écran) : on tire au sort, en gardant de la place entre elles, et loin
       des obstacles ; le corbeau, bien loin du ballon (le toucher fait perdre). Le ballon d'abord, puis les autres. */
    function ronds(type, sl){
      var mv = MOUV[type];
      if(sl.sp){ var Tp = PORTEURS[sl.sp].T, rb = [{x:Tp[0], y:Tp[1] + (mv === 'pendule' ? 26 : 0), r:mv === 'huit' ? 34 : 22}]; if(sl.sp === 'basile') rb.push({x:262, y:178, r:14, hors:true}, {x:248, y:240, r:12, hors:true}, {x:240, y:320, r:12, hors:true}); else { var Pp = PORTEURS[sl.sp]; rb.push({x:Pp.x, y:Pp.y - 14, r:12, hors:true}); } return rb; }
      /* (le ballon se balance et penche avec le vent : plus la ficelle est longue, plus il prend de place) */
      if(mv === 'ficelle'){ var bx = sl.ax + Math.sin(sl.a0) * sl.L, by = sl.ay - Math.cos(sl.a0) * sl.L, bal = sl.L * (sl.amp * (type === 'cerfvolant' ? 1.3 : 1) + (type === 'cerfvolant' ? 0.42 : 0.18) * (p.vent >= 5 ? 1 : 0.4)) * 0.7; return [{x:bx, y:by, r:30 + bal, ballon:true}, {x:(bx + sl.ax) / 2, y:(by + sl.ay) / 2 + 10, r:12}, {x:sl.ax, y:sl.ay, r:10}]; }
      if(mv === 'pendule') return [{x:sl.ax, y:sl.ay + sl.L, r:24}, {x:sl.ax, y:sl.ay + sl.L * 0.5, r:8}];
      if(mv === 'huit') return [{x:sl.cx - sl.ax * 0.7, y:sl.cy, r:24}, {x:sl.cx, y:sl.cy, r:24}, {x:sl.cx + sl.ax * 0.7, y:sl.cy, r:24}];
      return [{x:sl.x, y:sl.y, r:24}];
    }
    /* peut-on encore l'atteindre ? la part des tirs (toutes forces, tous angles, sans vent) qui y arrivent sans toucher un
       obstacle fixe, la branche ou le linge (à leur place moyenne) — une cible trop cachée est refusée (réglé au robot) */
    function bloqueFixe(x, y){
      for(var i = 0; i < obstacles.length; i++){
        var o = obstacles[i], k;
        for(k = 0; k < o.formes.length; k++) if(dansForme(o.formes[k], x - o.dx, y - o.dy)) return true;
        if(o.vent) for(k = 0; k < o.formesL.length; k++) if(dansForme(o.formesL[k], x - o.pied[0], y - o.pied[1])) return true;
        if(o.draps) for(k = 0; k < o.draps.length; k++) if(Math.abs(x - o.draps[k][0]) < 10 && y > o.draps[k][1] - 2 && y < o.draps[k][1] + 28) return true;
      }
      return false;
    }
    function accessible(q){
      var ok = 0, tout = 0;
      for(var a = -1.5; a < 0.05; a += 0.05) for(var pu = 0.55; pu <= 1.001; pu += 0.075){
        var d = pointeDepart(a), x = d.x, y = d.y, vx = Math.cos(a) * pu * ARC.v, vy = Math.sin(a) * pu * ARC.v, h = 1 / 60, bl = false;
        for(var k = 0; k < 110; k++){
          vy += ARC.g * h; x += vx * h; y += vy * h;
          if(y > SOL || x > q.x + 40) break;
          if(!bl && bloqueFixe(x, y)) bl = true;
          if(Math.abs(x - q.x) < 9 && Math.abs(y - q.y) < 9){ tout++; if(!bl) ok++; break; }
        }
      }
      return tout ? ok / tout : 1;
    }
    function horsObstacle(q){ var m = 1e9; obstacles.forEach(function(o){ o.zones.forEach(function(z){ var dx = Math.max(z[0] - q.x, 0, q.x - z[0] - z[2]), dy = Math.max(z[1] - q.y, 0, q.y - z[1] - z[3]); m = Math.min(m, Math.sqrt(dx * dx + dy * dy) - q.r); }); }); return m; }
    /* les places de cette partie : la ficelle des ballons et des cerfs-volants est plus ou moins longue selon le niveau
       (le ballon reste dans l'écran) */
    var PLACES = {};
    Object.keys(SLOTS_V2).forEach(function(ty){ PLACES[ty] = SLOTS_V2[ty].map(function(sl){ if(MOUV[ty] !== 'ficelle') return sl; var L = Math.max(46, Math.min(sl.L * (p.longFicelle || 1), (sl.ay - 26) / Math.max(0.3, Math.cos(sl.a0)))); return Object.assign({}, sl, {L:L}); }); });
    function choisirPlaces(){
      var ordre = liste.map(function(s, i){ return i; }).sort(function(a, b){ return (MOUV[HB[liste[b]]] === 'ficelle' ? 1 : 0) - (MOUV[HB[liste[a]]] === 'ficelle' ? 1 : 0); });
      var places = [], pris = [], tous = [];
      ordre.forEach(function(i){
        var type = HB[liste[i]];
        var cand = BAND ? Object.keys(PORTEURS).map(function(n){ return {sp:n}; }) : PLACES[type].slice();
        cand = U.melanger(cand).filter(function(sl){ return pris.indexOf(sl) < 0 && !(sl.sp && pris.some(function(q){ return q.sp === sl.sp; })) && !(sl.min && (p.niveau || 1) < sl.min) && ronds(type, sl).every(function(q){ return q.hors || dansZone(q.x, q.y, -4); }); });
        /* (la dame à la fenêtre, au-dessus de l'archer, est toujours là : Romain le veut) */
        if(BAND && !pris.some(function(q){ return q.sp === 'dame'; })) cand.sort(function(a, b){ return (b.sp === 'dame') - (a.sp === 'dame'); });
        var best = null, bestS = -1e9;
        cand.forEach(function(sl, k){
          var rs = ronds(type, sl), sc = 150, gene = 0;
          /* (le point qu'on vise : la ficelle près du nœud, ou la cible elle-même) */
          var vq = MOUV[type] === 'ficelle' ? rs[1] : rs[0], acc = vq.hors ? 1 : accessible(vq);
          if(acc < 0.3) gene = Math.max(gene, (0.3 - acc) * 500);
          rs.forEach(function(q){
            var ho = horsObstacle(q); if(ho < 14) gene = Math.max(gene, 200 - ho * 5);   /* (trop près d'un obstacle : non) */
            tous.forEach(function(o){ var marge = (q.ballon || o.ballon) && (MOUV[type] === 'huit' || o.huit) ? 50 : 0; sc = Math.min(sc, dist(q, o) - q.r - o.r - marge); });
          });
          /* (le plus loin possible des autres, pour bien répartir — un peu de hasard pour que ça change) */
          sc = sc - gene + R(0, 30);
          if(BAND && sl.sp === 'dame' && k === 0) sc += 1000;
          if(sc > bestS){ bestS = sc; best = sl; }
        });
        places[i] = best; pris.push(best);
        ronds(type, best).forEach(function(q){ q.huit = MOUV[type] === 'huit'; tous.push(q); });
      });
      return places;
    }
    var places = choisirPlaces(), gSup = svg.querySelector('.ti-supports'), gPort = svg.querySelector('.ti-porteurs');
    var cibles = liste.map(function(sorte, i){
      var type = sorte === 'fanion' ? 'fanion' : HB[sorte];
      var sl = places[i];
      var c = {sorte:sorte, type:type, mv:MOUV[type], s:sl, ph:R(0, 6.28), w:R(0.85, 1.15), touche:false};
      /* banderoles : l'anneau est au bout d'une perche, tenue par quelqu'un (dessiné une seule fois) */
      if(sl.sp){
        c.sp = PORTEURS[sl.sp];
        var gp = svgNoeud('g', {'class':'ti-porteur-g'}, gPort); gp.innerHTML = porteurSVG(sl.sp);
        c.perche = svgNoeud('path', {'class':'ti-perche-b', d:''}, gPort); c.perche2 = svgNoeud('path', {'class':'ti-perche-b2', d:''}, gPort);
      }
      /* les crochets, bras et poteaux qui tiennent les lampions et les cibles */
      if(sl.sup === 'mur') gSup.innerHTML += '<path d="M104,' + (sl.ay - 4) + ' H' + (sl.ax + 2) + ' V' + sl.ay + '"' + st(5) + ' fill="none" stroke-linejoin="round"/><path d="M104,' + (sl.ay - 4) + ' H' + (sl.ax + 2) + ' V' + sl.ay + '" stroke="#3b3346" stroke-width="2.6" fill="none" stroke-linejoin="round"/>';
      if(sl.sup === 'corniche' && type === 'lampion') gSup.innerHTML += '<path d="M' + sl.ax + ',152 V' + sl.ay + '" stroke="#3b3346" stroke-width="3" stroke-linecap="round"/>';
      if(sl.sup === 'lampadaire' && type === 'lampion') gSup.innerHTML += '<path d="M162,' + (sl.ay - 4) + ' H' + (sl.ax + 2) + ' V' + sl.ay + '"' + st(5) + ' fill="none" stroke-linejoin="round"/><path d="M162,' + (sl.ay - 4) + ' H' + (sl.ax + 2) + ' V' + sl.ay + '" stroke="#3b3346" stroke-width="2.6" fill="none" stroke-linejoin="round"/>';
      if(sl.sup === 'pignon' && type === 'lampion') gSup.innerHTML += '<path d="M' + sl.ax + ',' + (sl.ay - 6) + ' V' + sl.ay + '" stroke="#3b3346" stroke-width="3" stroke-linecap="round"/><circle cx="' + sl.ax + '" cy="' + (sl.ay - 7) + '" r="3" fill="#e6b84a"' + st(1.4) + '/>';
      if(sl.sup === 'beffroi' && type === 'lampion') gSup.innerHTML += '<path d="M' + sl.ax + ',98 V' + sl.ay + '" stroke="#3b3346" stroke-width="3" stroke-linecap="round"/>';
      if(sl.base) c.sup = svgNoeud('path', {'class':'ti-poteau', d:''}, gSup);
      if(type === 'fanion') c.dr = drapeaux[sl.f];
      c.g = svgNoeud('g', {'class':'mja-cible ti-c-' + type}, gCibles);
      c.art = svgNoeud('g', {'class':'mja-cible-art'}, c.g);
      c.art.innerHTML = cibleArt(type, id) + '<circle class="mja-cible-halo" r="' + (c.mv === 'ficelle' ? 26 : (type === 'crochet' ? 14 : 22)) + '"/>';
      if(c.mv === 'pendule' || c.mv === 'ficelle') c.fil = svgNoeud('line', {'class':'mja-fil' + (c.mv === 'ficelle' ? ' corde ti-ficelle' : '')}, gCordes);
      /* ce qu'il faut toucher brille en doré (6 nov., 10 h 50 : « on ne comprend pas ce qu'on doit toucher ») : un rond doré
         qui tourne ; pour le ballon et le cerf-volant, c'est LA FICELLE qui brille, avec des ciseaux (pas le ballon) */
      if(c.mv === 'ficelle'){
        c.filM = svgNoeud('line', {'class':'ti-ficelle-m'}, gCordes);
        c.ciseaux = svgNoeud('g', {'class':'ti-ciseaux'}, gCordes);
        c.ciseaux.innerHTML = '<circle r="9" fill="#fff6d8" stroke="#24182e" stroke-width="1.8"/><g stroke="#24182e" stroke-width="1.6" fill="none"><circle cx="-3" cy="3.4" r="2.2"/><circle cx="3" cy="3.4" r="2.2"/><path d="M-1.6,1.6 L3.6,-5.6 M1.6,1.6 L-3.6,-5.6"/></g>';
      } else c.marque = svgNoeud('circle', {'class':'ti-marque', r:{lampion:22, cible:24, corbeau:22, anneau:20, basile:20, enseigne:19, crochet:16}[type] || 21}, c.g);
      if((type === 'cible' || type === 'anneau') && !sl.base && !sl.sp) c.clou = svgNoeud('path', {'class':'ti-support', d:'M' + sl.x + ',' + (sl.y - 30) + ' l-10,0', stroke:K, 'stroke-width':4, 'stroke-linecap':'round'}, gCordes);
      return c;
    });
    function posCible(c, tt){
      var s = c.s, v = p.vitesse * c.w, q = {};
      if(c.sp){
        /* banderoles : le bout de la perche bouge un peu (le porteur, le vent) ; l'anneau y est noué, ou pend au bout
           d'une ficelle (pendule), ou décrit un huit (le porteur agite sa perche) */
        var sw = Math.sin(tt * 1.1 * v + c.ph) * 4 + ventV(tt) * 0.025, sy = Math.sin(tt * 1.7 * v + c.ph * 1.3) * 2.5;
        var Tx = c.sp.T[0] + sw, Ty = c.sp.T[1] + sy;
        if(c.mv === 'pendule'){ var ap = Math.sin(tt * 1.5 * v + c.ph) * 0.4 + ventV(tt) * 0.001; q.x = Tx + Math.sin(ap) * 26; q.y = Ty + Math.cos(ap) * 26; q.a = ap; q.nx = Tx + Math.sin(ap) * 10; q.ny = Ty + Math.cos(ap) * 10; q.tx = Tx; q.ty = Ty; }
        else if(c.mv === 'huit'){ var uh = tt * 0.75 * v + c.ph; q.x = Tx + Math.sin(uh) * 24; q.y = Ty + Math.sin(2 * uh) * 13; q.sens = Math.cos(uh) >= 0 ? 1 : -1; q.tx = q.x; q.ty = q.y + 10; q.a = 0; }
        else { q.x = Tx; q.y = Ty; q.tx = Tx; q.ty = Ty + (c.type === 'crochet' ? 8 : 10); q.a = 0; }
        return q;
      }
      if(c.mv === 'pendule'){
        var a = Math.sin(tt * 1.5 * v + c.ph) * (c.type === 'enseigne' ? 0.4 : 0.46) + ventV(tt) * 0.001;
        q.x = s.ax + Math.sin(a) * s.L; q.y = s.ay + Math.cos(a) * s.L; q.a = a;
        q.nx = s.ax + Math.sin(a) * (s.L - 17); q.ny = s.ay + Math.cos(a) * (s.L - 17);
      } else if(c.mv === 'ficelle'){
        /* le ballon / le cerf-volant flotte AU-DESSUS de son nœud, il penche avec le vent */
        /* (il penche du côté où souffle le vent, avec le retard du décor : on voit les feuilles tourner, puis le cerf-volant
           se retourner — 6 nov., 14 h 30) */
        var b = s.a0 + Math.sin(tt * 1.2 * v + c.ph) * s.amp * (c.type === 'cerfvolant' ? 1.3 : 1) + ventDecor(tt) * (c.type === 'cerfvolant' ? 0.42 : 0.18) * (p.vent >= 5 ? 1 : 0.4);
        q.x = s.ax + Math.sin(b) * s.L; q.y = s.ay - Math.cos(b) * s.L; q.a = b;
        var bout = c.type === 'cerfvolant' ? 22 : 22;
        q.nx = s.ax + Math.sin(b) * (s.L - bout); q.ny = s.ay - Math.cos(b) * (s.L - bout);
      } else if(c.mv === 'drapeau'){
        /* l'anneau noué au bout d'un drapeau : il suit le tissu, donc le vent */
        var pf = boutDrapeau(c.dr, tt); q.x = pf.x; q.y = pf.y; q.a = 0;
      } else if(c.mv === 'fixe' || c.mv === 'point'){
        q.x = s.x + Math.sin(tt * 1.3 * v + c.ph) * (c.mv === 'point' ? 3 : 10) * Math.min(1.6, v); q.y = s.y + Math.sin(tt * 2.6 * v + c.ph) * 3; q.a = 0;
      } else {
        var u = tt * 0.75 * v + c.ph;
        q.x = s.cx + Math.sin(u) * s.ax; q.y = s.cy + Math.sin(2 * u) * s.ay; q.sens = Math.cos(u) >= 0 ? 1 : -1;
      }
      return q;
    }
    function dessinerCible(c){
      if(c.chute) return;
      var q = c.q = posCible(c, t);
      if(c.mv === 'huit' && c.type === 'baudruche') c.g.setAttribute('transform', 'translate(' + f1(q.x) + ',' + f1(q.y) + ') rotate(' + f1(Math.sin(t * 2 + c.ph) * 8) + ')');
      else if(c.type === 'corbeau'){ c.sensL = (c.sensL === undefined ? q.sens : c.sensL) + (q.sens - (c.sensL === undefined ? q.sens : c.sensL)) * 0.2; c.g.setAttribute('transform', 'translate(' + f1(q.x) + ',' + f1(q.y) + ') scale(' + c.sensL.toFixed(2) + ',1) rotate(' + f1(Math.sin(t * 2.4 + c.ph) * 6) + ')'); }
      else if(c.mv === 'ficelle') c.g.setAttribute('transform', 'translate(' + f1(q.x) + ',' + f1(q.y) + ') rotate(' + f1(q.a * 57.3 * (c.type === 'cerfvolant' ? 0.6 : 0.3)) + ')');
      else c.g.setAttribute('transform', 'translate(' + f1(q.x) + ',' + f1(q.y) + ') rotate(' + f1(-(q.a || 0) * 57.3) + ')');
      if(c.fil){
        if(c.mv === 'ficelle'){
          c.fil.setAttribute('x1', c.s.ax); c.fil.setAttribute('y1', c.s.ay); c.fil.setAttribute('x2', f1(q.nx)); c.fil.setAttribute('y2', f1(q.ny));
          if(c.filM && !c.touche){ c.filM.setAttribute('x1', c.s.ax); c.filM.setAttribute('y1', c.s.ay); c.filM.setAttribute('x2', f1(q.nx)); c.filM.setAttribute('y2', f1(q.ny)); c.ciseaux.setAttribute('transform', 'translate(' + f1(c.s.ax + (q.nx - c.s.ax) * 0.5 + 12) + ',' + f1(c.s.ay + (q.ny - c.s.ay) * 0.5 + 6) + ')'); }
        }
        else { c.fil.setAttribute('x1', f1(c.sp ? q.tx : c.s.ax)); c.fil.setAttribute('y1', f1(c.sp ? q.ty : c.s.ay)); c.fil.setAttribute('x2', f1(q.nx)); c.fil.setAttribute('y2', f1(q.ny)); }
      }
      /* la perche (banderoles) : des mains du porteur jusqu'à l'anneau, un peu courbée par son poids */
      if(c.perche){
        var H = c.sp.H, ux = q.tx - H[0], uy = q.ty - H[1], ul = Math.sqrt(ux * ux + uy * uy) || 1, x0 = H[0] - ux / ul * 14, y0 = H[1] - uy / ul * 14;
        var dP = 'M' + f1(x0) + ',' + f1(y0) + ' Q' + f1((x0 + q.tx) / 2 + uy / ul * 4) + ',' + f1((y0 + q.ty) / 2 + Math.abs(ux / ul) * 6) + ' ' + f1(q.tx) + ',' + f1(q.ty);
        c.perche.setAttribute('d', dP); c.perche2.setAttribute('d', dP);
      }
      /* le poteau planté sur le toit, qui tient la cible */
      if(c.sup) c.sup.setAttribute('d', 'M' + c.s.base[0] + ',' + c.s.base[1] + ' Q' + f1(c.s.base[0]) + ',' + f1((c.s.base[1] + q.y) / 2 + 6) + ' ' + f1(q.x) + ',' + f1(q.y + 16));
    }

    /* ----- les oiseaux qui traversent : en courbe, ailes qui battent puis planent ; les grosses tourterelles (niveau 9+) ----- */
    var oiseaux = [], prochainOiseau = p.oiseaux ? R(1.2, p.oiseaux) : 1e9, prochainGrand = p.grands ? R(5, 9) : 1e9;
    function lancerOiseau(grand){
      var dir = Math.random() < 0.5 ? 1 : -1, x0 = dir > 0 ? -270 : 630, x1 = dir > 0 ? 630 : -270;
      /* (partout dans le ciel, du haut jusqu'au-dessus des toits : 6 nov., 12 h 49) */
      var y0 = grand ? R(70, 300) : R(60, 350), y1 = fixe(y0 + R(-80, 80), 50, 360), creux = R(-70, 70);
      var o = {grand:!!grand, dir:dir, x0:x0, x1:x1, y0:y0, y1:y1, yc:(y0 + y1) / 2 + creux, t0:t, D:(grand ? R(19, 24) : R(7, 9)) / Math.max(0.7, Math.min(1.4, p.vitesse)), ph:R(0, 6), r:grand ? 20 : 14, sursaut:0};
      o.g = svgNoeud('g', {'class':'mja-oiseau ti-traverse'}, gOis);
      /* (des tourterelles blanches, sans rond doré : ce ne sont pas des cibles — 6 nov., 10 h 50) */
      o.g.innerHTML = '<g class="ti-o-s">' + (grand ? goelandSVG() : tourterelleSVG()) + '</g>';
      o.s = o.g.firstChild; o.ailes = o.g.querySelectorAll('.ti-to-aile, .ti-to-aile2');
      oiseaux.push(o); posOiseau(o, t);
    }
    /* sa position au temps tt (une courbe douce d'un bord à l'autre, qui ondule un peu) */
    function posOiseau(o, tt){
      /* (touchée, elle s'enfuit vers le haut, et ne revient pas) */
      if(o.fuit && tt >= o.fuit.t0){ var df = tt - o.fuit.t0; return {x:o.fuit.x0 + o.fuit.vx * df, y:o.fuit.y0 + o.fuit.vy * df, u:df / 1.8}; }
      var u = (tt - o.t0) / o.D, a = 1 - u;
      return {x:o.x0 + (o.x1 - o.x0) * u, y:a * a * o.y0 + 2 * a * u * o.yc + u * u * o.y1 + Math.sin(tt * 2.2 + o.ph) * (o.grand ? 6 : 9), u:u};
    }
    /* une tourterelle touchée (Romain, 6 nov., 12 h 49 : « on peut les toucher, après elles ne reviennent plus ») : elle
       perd des plumes et s'envole à tire-d'aile, pour de bon (jamais blessée) ; les suivantes attendent un peu */
    function chasserOiseau(o, x, y){
      var po = posOiseau(o, t);
      o.fuit = {t0:t, x0:po.x, y0:po.y, vx:o.dir * R(240, 300), vy:-R(200, 250)};
      for(var pl = 0; pl < 5; pl++) particule(x, y, PLUME_CLAIRE, R(-70, 70), R(-100, 0), R(1.1, 1.6), 50);
      if(o.grand) prochainGrand = Math.max(prochainGrand, 7); else prochainOiseau = Math.max(prochainOiseau, 5);
      U.son('tic');
    }
    /* ----- les pigeons qui se posent sur une cible (on ne peut pas la toucher tant qu'il est là) ----- */
    var poses = [], prochainePose = p.perche ? R(2.5, p.perche) : 1e9;
    function poserPigeon(){
      var libres = cibles.filter(function(c){ return !c.touche && !c.pigeon && (c.mv === 'fixe' || c.mv === 'point' || c.mv === 'pendule'); });
      if(!libres.length) return;
      var c = U.choix(libres), dir = Math.random() < 0.5 ? 1 : -1;
      var pg = {c:c, etat:'arrive', t:0, x:dir > 0 ? -80 : 440, y:R(40, 120), dir:dir, reste:p.percheT * R(0.85, 1.2)};
      pg.g = svgNoeud('g', {'class':'ti-pose'}, gPerch);
      pg.g.innerHTML = '<circle class="ti-marque" r="18"/><g class="ti-pose-s">' + corbeauSVG() + '</g>';   /* (un corbeau grognon, entouré d'or : on peut le chasser) */
      pg.s = pg.g.querySelector('.ti-pose-s');
      c.pigeon = pg; poses.push(pg);
    }
    function ouPose(c){ var q = c.q || posCible(c, t); return c.mv === 'pendule' ? {x:q.x, y:q.y - 18} : (c.type === 'crochet' ? {x:q.x, y:q.y - 16} : {x:q.x, y:q.y - (c.type === 'cible' ? 20 : 14)}); }
    function envolerPigeon(pg, fort){
      if(pg.etat === 'part') return;
      pg.etat = 'part'; pg.t = 0; pg.vx = (Math.random() < 0.5 ? -1 : 1) * R(150, 220); pg.vy = -R(140, 200);
      if(pg.c) pg.c.pigeon = null;
      if(fort){ for(var i = 0; i < 4; i++) particule(pg.x, pg.y, PLUME, R(-80, 80), R(-120, 0), R(1.2, 1.8), 50); }
    }
    /* ce que le vent fait à la flèche (un peu moins fort qu'avant : il change souvent de sens) ; ventV : ce qu'il fait au
       décor (drapeaux, fumées, girouette, nuages), même aux petits niveaux où il ne pousse pas les flèches */
    /* le vent du décor qui bouge (la branche, le linge, le cerf-volant) : celui d'il y a 1,4 s. Les feuilles qui volent,
       elles, montrent le vent tout de suite : on voit le vent tourner, puis le décor suivre (Romain, 6 nov., 14 h 30) */
    function ventDecor(tt){ return ventSens(tt - RETARD_VENT); }
    function ventA(tt){ return p.vent * 0.85 * ventSens(tt) * (p.rafales ? 0.85 + 0.15 * Math.sin(tt * 2.3) : 1); }
    function ventV(tt){ return ventSens(tt) * Math.max(70, p.vent); }
    /* ----- les particules ----- */
    var parts = [];
    function particule(x, y, art, vx, vy, vie, g, rot){
      var q = {x:x, y:y, vx:vx, vy:vy, vie:vie, age:0, g:g === undefined ? 300 : g, r:R(0, 360), vr:rot === undefined ? R(-300, 300) : rot};
      q.el = svgNoeud('g', {}, gParts); q.el.innerHTML = art; parts.push(q); return q;
    }
    function eclats(x, y, sorte){
      var i;
      if(sorte === 'confettis'){ for(i = 0; i < 16; i++) particule(x, y, '<rect x="-3" y="-1.6" width="6" height="3.2" fill="' + COUL_DRAP[i % COUL_DRAP.length] + '"/>', R(-160, 160), R(-220, -20), R(1, 1.6), 260); }
      else if(sorte === 'papier'){ for(i = 0; i < 9; i++) particule(x, y, '<path d="M-3,-3 L4,-1 L2,4 Z" fill="' + (i % 2 ? '#e5484d' : '#ffd36a') + '"' + st(.8) + '/>', R(-120, 120), R(-160, 0), R(0.8, 1.2), 300); for(i = 0; i < 5; i++) particule(x, y, '<circle r="2.6" fill="#ffd36a"/>', R(-50, 50), R(-110, -40), 0.6, -40, 0); }
      else if(sorte === 'paille'){ for(i = 0; i < 7; i++) particule(x, y, '<path d="M-4,0 L4,0" stroke="#e6c25a" stroke-width="1.8" stroke-linecap="round"/>', R(-90, 90), R(-130, -10), 0.8, 420); }
      else if(sorte === 'bois'){ for(i = 0; i < 6; i++) particule(x, y, '<path d="M-3,-1 L3,-1 L2,1 L-2,1 Z" fill="#c99a5e"' + st(.8) + '/>', R(-90, 90), R(-140, -20), 0.7, 500); }
      else if(sorte === 'etoiles'){ for(i = 0; i < 10; i++){ var a = i / 10 * 6.28; particule(x, y, '<path d="M0,-6 L1.6,-1.6 L6,0 L1.6,1.6 L0,6 L-1.6,1.6 L-6,0 L-1.6,-1.6 Z" fill="#ffe3a3"/>', Math.cos(a) * 170, Math.sin(a) * 170, 0.6, 0, 200); } }
      else if(sorte === 'tissu'){ for(i = 0; i < 6; i++) particule(x, y, '<path d="M-3,-2 L3,-2 L2,3 Z" fill="#3f6aa8"/>', R(-80, 80), R(-100, 10), 0.8, 300); }
      else if(sorte === 'feuilles'){ for(i = 0; i < 7; i++) particule(x, y, '<path d="M-4,0 C-2,-4 3,-4 5,0 C3,3 -2,3 -4,0 Z" fill="' + (i % 2 ? '#4f9a4a' : '#8fd07a') + '"' + st(.8) + '/>', R(-90, 90), R(-120, 0), R(0.9, 1.4), 160); }
    }

    /* ----- les banderoles ----- */
    var volBand = null;
    function drapeauxSur(g, pts, n0){
      /* place des petits drapeaux triangulaires régulièrement le long d'une ligne (pts) */
      var lg = 0, i, seg = [];
      for(i = 1; i < pts.length; i++){ var l = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); seg.push(l); lg += l; }
      var pas = 15, n = Math.max(0, Math.floor(lg / pas)), k = 0, acc = 0, out = [];
      for(var j = 1; j <= n; j++){
        var cible = j * pas;
        while(k < seg.length - 1 && acc + seg[k] < cible){ acc += seg[k]; k++; }
        var u = seg[k] ? (cible - acc) / seg[k] : 0, a = pts[k], bq = pts[k + 1] || a;
        out.push([a[0] + (bq[0] - a[0]) * u, a[1] + (bq[1] - a[1]) * u, Math.atan2(bq[1] - a[1], bq[0] - a[0])]);
      }
      return out;
    }
    function courbeEntre(a, bq, creux){
      /* une ligne qui pend entre deux points (le creux dépend de la longueur) */
      var pts = [], L = Math.hypot(bq[0] - a[0], bq[1] - a[1]), sag = creux === undefined ? 10 + L * 0.12 : creux;
      for(var i = 0; i <= 16; i++){ var u = i / 16; pts.push([a[0] + (bq[0] - a[0]) * u, a[1] + (bq[1] - a[1]) * u + sag * 4 * u * (1 - u)]); }
      return pts;
    }
    /* La guirlande (Romain, 6 nov., 9 h 02) : elle reste accrochée à l'arc. Chaque flèche emmène son bout libre jusqu'à
       l'anneau touché : elle passe d'anneau en anneau, puis revient à l'arc. Quand tous les anneaux sont touchés, elle se
       détache de l'arc et son bout file en haut du mât de la fête. */
    var chaine = null, pointArc = [ARC.x + 20, ARC.y - 22];
    function creerChaine(){
      chaine = {anneaux:[], detache:null, secoue:0, el:svgNoeud('g', {'class':'ti-guirlande'}, gGuir), drap:[]};
      chaine.fil = svgNoeud('path', {'class':'ti-g-fil'}, chaine.el);
      for(var i = 0; i < 64; i++) chaine.drap.push(svgNoeud('path', {'class':'ti-g-drap', d:'M-5,0 L5,0 L0,10 Z', fill:COUL_DRAP[i % COUL_DRAP.length], display:'none'}, chaine.el));
    }
    function posAnneau(c){ var q = c.q || posCible(c, t); return [q.x, q.y + (c.type === 'enseigne' ? 0 : 6)]; }
    function dessinerChaine(dt){
      if(!chaine) return;
      chaine.secoue = Math.max(0, chaine.secoue - dt);
      var extr = chaine.anneaux.map(posAnneau), bout = null;
      if(chaine.detache){ chaine.detache.t += dt; var u = Math.min(1, chaine.detache.t / 0.6), e = 1 - Math.pow(1 - u, 3); bout = [chaine.detache.x + (MAT.x - chaine.detache.x) * e, chaine.detache.y + (MAT.y - chaine.detache.y) * e]; }
      else if(!(volBand && !volBand.tombe)){
        bout = pointArc;   /* (pendant le vol, c'est la flèche qui emmène le bout) */
        /* flèche ratée : le bout libre revient à l'arc, comme un élastique */
        if(chaine.retour){ chaine.retour.t += dt; var ur = Math.min(1, chaine.retour.t / 0.45), er = 1 - Math.pow(1 - ur, 3); bout = [chaine.retour.x + (pointArc[0] - chaine.retour.x) * er, chaine.retour.y + (pointArc[1] - chaine.retour.y) * er]; if(ur >= 1) chaine.retour = null; }
      }
      if(bout) extr.push(bout);
      var pts = [];
      if(extr.length >= 2) for(var k = 0; k < extr.length - 1; k++){ var L = Math.hypot(extr[k + 1][0] - extr[k][0], extr[k + 1][1] - extr[k][1]), cb = courbeEntre(extr[k], extr[k + 1], (10 + L * 0.12) * (1 + 0.3 * Math.sin(t * 9) * chaine.secoue)); pts = pts.concat(k ? cb.slice(1) : cb); }
      chaine.fil.setAttribute('d', pts.length > 1 ? 'M' + pts.map(function(q){ return f1(q[0]) + ',' + f1(q[1]); }).join(' L') : '');
      var ds = pts.length > 1 ? drapeauxSur(null, pts) : [];
      for(var i = 0; i < chaine.drap.length; i++){
        var d = chaine.drap[i];
        if(i < ds.length){ var q = ds[i]; d.setAttribute('display', 'inline'); d.setAttribute('transform', 'translate(' + f1(q[0]) + ',' + f1(q[1]) + ') rotate(' + f1(q[2] * 57.3 + Math.sin(t * 6 + i * 0.9) * 10 + ventV(t) * 0.05) + ')'); }
        else if(d.getAttribute('display') !== 'none') d.setAttribute('display', 'none');
      }
    }
    function accrocher(anneaux){
      if(!chaine) creerChaine();
      anneaux.forEach(function(c){ chaine.anneaux.push(c); });
      chaine.secoue = 1;
      /* (le bout libre repart de l'anneau touché et revient à l'arc) */
      var pr0 = posAnneau(chaine.anneaux[chaine.anneaux.length - 1]); chaine.retour = {t:0, x:pr0[0], y:pr0[1]};
      if(touches >= cibles.length && !chaine.detache){ chaine.detache = {t:0, x:pointArc[0], y:pointArc[1]}; P.apres(150, function(){ texte(MAT.x, MAT.y - 30, 'Elle se détache !', 'ok'); }); }
    }
    function dessinerVolBand(){
      /* pendant le vol : la banderole se déroule derrière la flèche, depuis le dernier anneau touché */
      if(!volBand) return;
      /* (la guirlande déjà accrochée : son bout libre va tout droit du dernier anneau à la flèche, en pendant un peu) */
      var pts = !volBand.tombe && chaine && chaine.anneaux.length && !chaine.detache ? courbeEntre(posAnneau(chaine.anneaux[chaine.anneaux.length - 1]), volBand.pts[volBand.pts.length - 1], 12) : volBand.pts;
      volBand.fil.setAttribute('d', pts.length > 1 ? 'M' + pts.map(function(q){ return f1(q[0]) + ',' + f1(q[1]); }).join(' L') : '');
      var ds = drapeauxSur(null, pts);
      for(var i = 0; i < volBand.drap.length; i++){ var d = volBand.drap[i]; if(i < ds.length){ d.setAttribute('display', 'inline'); d.setAttribute('transform', 'translate(' + f1(ds[i][0]) + ',' + f1(ds[i][1]) + ') rotate(' + f1(ds[i][2] * 57.3 + Math.sin(t * 9 + i) * 14) + ')'); } else d.setAttribute('display', 'none'); }
    }
    function commencerVolBand(x, y){
      if(!BAND) return;
      gVolB.innerHTML = '';
      volBand = {pts:[[x, y]], fil:svgNoeud('path', {'class':'ti-g-fil'}, gVolB), drap:[], tombe:null};
      for(var i = 0; i < 48; i++) volBand.drap.push(svgNoeud('path', {'class':'ti-g-drap', d:'M-5,0 L5,0 L0,10 Z', fill:COUL_DRAP[i % COUL_DRAP.length], display:'none'}, gVolB));
    }
    function tomberVolBand(){
      if(!volBand) return;
      volBand.tombe = {t:0, v:volBand.pts.map(function(){ return R(-20, 20); })};
    }

    /* ----- viser ----- */
    var vise = null, enVol = null, apercuPts = [];
    for(var k = 0; k < 40; k++) apercuPts.push(svgNoeud('circle', {r:'2.6', 'class':'mja-pt', opacity:'0'}, gAp));
    function tirDepuis(v){
      var tirAng = Math.atan2(v.y, v.x), puis = Math.min(1, Math.sqrt(v.x * v.x + v.y * v.y) / ARC.tire);
      if(tenir > p.tenue && puis >= PERCE){ var amp = Math.min(1, (tenir - p.tenue) / 1) * p.tremble * Math.PI / 180; tirAng += amp * (Math.sin(t * 9) + 0.5 * Math.sin(t * 13.7)); }
      return {ang:tirAng, puis:puis, vx:Math.cos(tirAng) * puis * ARC.v, vy:Math.sin(tirAng) * puis * ARC.v};
    }
    function pointeDepart(a){ var K0 = corpsArcher(a); return {x:ARC.x + K0.Bx + Math.cos(a) * 14, y:ARC.y + K0.By + Math.sin(a) * 14}; }
    var arcG = svg.querySelector('.mja-arc-g');
    P.ecoute(svg, 'pointerdown', function(e){
      if(fini || enVol || fleches <= 0) return;
      e.preventDefault();
      var pt = A.ptSVG(svg, e);
      vise = {x0:pt.x, y0:pt.y, x:pt.x, y:pt.y, id:e.pointerId};
      tenir = 0;
      try{ svg.setPointerCapture(e.pointerId); }catch(er){}
    });
    P.ecoute(svg, 'pointermove', function(e){ if(!vise || e.pointerId !== vise.id) return; var pt = A.ptSVG(svg, e); vise.x = pt.x; vise.y = pt.y; });
    function lacher(e){
      if(!vise || (e && e.pointerId !== vise.id)) return;
      var v = {x:vise.x0 - vise.x, y:vise.y0 - vise.y};
      vise = null;
      if(Math.sqrt(v.x * v.x + v.y * v.y) < 14) return;
      tirer(tirDepuis(v));
    }
    P.ecoute(svg, 'pointerup', lacher); P.ecoute(svg, 'pointercancel', function(){ vise = null; });
    var br0 = terrain.querySelector('.mja-ralenti');
    if(br0) P.ecoute(br0, 'click', function(){ if(ralentiT > 0 || br0.disabled) return; ralentiT = p.ralenti; br0.disabled = true; U.son('magie'); terrain.classList.add('ralenti'); });
    var clav = {ang:-0.9, puis:0.75};
    P.ecoute(document, 'keydown', function(e){
      if(e.key === 'ArrowLeft') clav.ang -= 0.03; else if(e.key === 'ArrowRight') clav.ang += 0.03;
      else if(e.key === 'ArrowUp') clav.puis = Math.min(1, clav.puis + 0.03); else if(e.key === 'ArrowDown') clav.puis = Math.max(0.2, clav.puis - 0.03);
      else if(e.key === ' ' || e.key === 'Enter'){ if(!enVol && !fini && fleches > 0) tirer({ang:clav.ang, puis:clav.puis, vx:Math.cos(clav.ang) * clav.puis * ARC.v, vy:Math.sin(clav.ang) * clav.puis * ARC.v}); }
      else return;
      e.preventDefault();
    });
    terrain.mjaVol = function(){ return enVol ? {x:enVol.x, y:enVol.y, t:t} : null; };   /* (pour les robots de test) */
    terrain.mjaTirer = function(ang, puis){ if(enVol || fini || fleches <= 0) return false; tirer({ang:ang, puis:puis, vx:Math.cos(ang) * puis * ARC.v, vy:Math.sin(ang) * puis * ARC.v}); return true; };
    terrain.mjaEtat = function(){ return {t:t, vent:ventA(t), ventA:ventA, mode:MODE, cibles:cibles.map(function(c){ return c.touche ? null : {type:c.sorte, habit:c.type, q:posCible(c, t), c:c, pigeon:!!c.pigeon}; }), enVol:!!enVol, depart:pointeDepart, posCible:function(i, tt){ return posCible(cibles[i], tt); }, ARC:ARC, fleches:fleches, PERCE:PERCE, tirs:tirs, touches:touches, utiles:utiles, maxPerce:maxPerce,
      obstacle:function(x, y, tt){ for(var b = 0; b < drapeaux.length; b++) if(collDrapeau(drapeaux[b], x, y, tt)) return true; for(var ob = 0; ob < obstacles.length; ob++) if(collObstacle(obstacles[ob], x, y, tt === undefined ? t : tt)) return true; for(var o = 0; o < oiseaux.length; o++) if(!oiseaux[o].fuit && dist({x:x, y:y}, posOiseau(oiseaux[o], tt === undefined ? t : tt)) < oiseaux[o].r + 6) return true; return false; },
      /* toucher le ballon ou le cerf-volant fait perdre */
      interdit:function(x, y, tt){ for(var i = 0; i < cibles.length; i++){ var c = cibles[i]; if(c.touche || c.mv !== 'ficelle') continue; if(dist({x:x, y:y}, posCible(c, tt === undefined ? t : tt)) < (c.type === 'cerfvolant' ? 24 : 23)) return true; } return false; },
      vents:SAUTS, drapeaux:drapeaux.length, chaine:chaine ? chaine.anneaux.length : 0}; };

    function tirer(s){
      if(fleches < 99) fleches--;
      tirs++;
      majCarquois();
      U.son('fleche');
      var d = pointeDepart(s.ang), fort = s.puis >= PERCE;
      enVol = {x:d.x, y:d.y, vx:s.vx, vy:s.vy, hist:[], age:0, ralenti:false, perce:fort, nb:0, anneaux:[], depart:[d.x, d.y]};
      flVol.classList.toggle('puissante', fort); trainee.classList.toggle('puissante', fort);
      flVol.setAttribute('opacity', '1');
      cordeArc.classList.remove('vibre'); void cordeArc.getBoundingClientRect(); cordeArc.classList.add('vibre');
      encoche.setAttribute('opacity', '0');
      apercuPts.forEach(function(c){ c.setAttribute('opacity', '0'); }); cacherApercu();
      commencerVolBand(d.x, d.y);
    }
    function local(c, x, y){ var a = c.q.a || 0, dx = x - c.q.x, dy = y - c.q.y, ca = Math.cos(a), sa = Math.sin(a); return {x:dx * ca - dy * sa, y:dx * sa + dy * ca, a:a}; }
    function planter(x, y, ang, parent){
      var g = svgNoeud('g', {'class':'mja-plantee', transform:'translate(' + f1(x) + ',' + f1(y) + ') rotate(' + f1(ang * 57.3) + ')'}, parent || gPl);
      g.innerHTML = '<g transform="translate(-8,0)">' + FLECHE_ART + '</g>';
      return g;
    }
    /* ----- les flèches par terre (Romain, 6 nov., 14 h 30) -----
       Une flèche qui touche un oiseau ou un corbeau posé tombe par terre ; une flèche ratée se plante dans les pavés.
       Quand le carquois est vide, un bouton jaune les ramasse toutes. Celles du décor et celles sorties de l'écran sont
       perdues. */
    var btnRam = terrain.querySelector('.ti-ramasser');
    function faireTomber(x, y, vx, vy){
      var g = svgNoeud('g', {'class':'mja-plantee ti-tombe'}, gPl);
      g.innerHTML = '<g transform="translate(-8,0)">' + FLECHE_ART + '</g>';
      chutes.push({g:g, x:x, y:y, vx:vx, vy:vy, r:R(0, 360), vr:R(-500, 500), sol:SOL + R(3, 14)});
    }
    function majChutes(dt){
      chutes = chutes.filter(function(c){
        c.vy += 700 * dt; c.x += c.vx * dt; c.y += c.vy * dt; c.r += c.vr * dt;
        if(horsEcran(c.x, c.y)){ c.g.parentNode.removeChild(c.g); perdues++; P.apres(0, verifierFin); return false; }
        if(c.y >= c.sol){
          /* elle se pose à plat sur les pavés */
          c.y = c.sol; c.r = (c.vx >= 0 ? 0 : 180) + R(-10, 10);
          c.g.setAttribute('transform', 'translate(' + f1(c.x) + ',' + f1(c.y) + ') rotate(' + f1(c.r) + ')');
          parTerre.push({g:c.g, x:c.x, y:c.y}); U.son('tic');
          P.apres(0, verifierFin);
          return false;
        }
        c.g.setAttribute('transform', 'translate(' + f1(c.x) + ',' + f1(c.y) + ') rotate(' + f1(c.r) + ')');
        return true;
      });
      /* celles qu'on ramasse filent jusqu'au carquois */
      ramassees = ramassees.filter(function(q){
        q.t += dt; var u = fixe(q.t / 0.55, 0, 1), e = lisse(u);
        if(q.t < 0) return true;
        var x = q.x + (ARC.x - 22 - q.x) * e, y = q.y + (ARC.y - 40 - q.y) * e - Math.sin(u * Math.PI) * 70;
        q.g.setAttribute('transform', 'translate(' + f1(x) + ',' + f1(y) + ') rotate(' + f1(-90 + (1 - e) * 60) + ') scale(' + f1(1 - 0.4 * e) + ')');
        if(u >= 1){ q.g.parentNode.removeChild(q.g); if(fleches < 99){ fleches++; majCarquois(); } U.son('tic'); return false; }
        return true;
      });
    }
    /* un bandeau en haut du jeu, avec son 🔊 (jamais lu tout seul) */
    function bandeau(ic, txt, duree){
      try{
        var hote = terrain.closest('.mj-zone') || terrain.closest('.mj') || terrain;
        var vieux = hote.querySelector('.ti-bandeau'); if(vieux && vieux.parentNode) vieux.parentNode.removeChild(vieux);
        var b = U.html('<div class="mj-plus-coeur ti-bandeau" role="status"><span class="mj-pc-ic">' + ic + '</span><b></b></div>');
        b.querySelector('b').textContent = txt;
        if(MJ.boutonLire) b.appendChild(MJ.boutonLire(txt));
        hote.appendChild(b);
        try{ var hd = hote.querySelector('[class*="-hud"]'), rh = hd && hd.getBoundingClientRect(), ro = hote.getBoundingClientRect(); b.style.top = Math.max(6, Math.round(rh && rh.height ? rh.bottom - ro.top + 6 : 8)) + 'px'; }catch(e2){}
        P.apres(duree || 3600, function(){ b.classList.add('part'); P.apres(450, function(){ if(b.parentNode) b.parentNode.removeChild(b); }); });
      }catch(e){}
    }
    function montrerRamasser(){
      if(!btnRam || !btnRam.hidden) return;
      btnRam.textContent = '🏹 Ramasser les flèches (' + parTerre.length + ')';
      btnRam.hidden = false;
      bandeau('🏹', 'Le carquois est vide : ramasse les flèches tombées par terre !');
    }
    if(btnRam) P.ecoute(btnRam, 'click', function(e){
      e.stopPropagation();
      if(fini || btnRam.hidden) return;
      btnRam.hidden = true;
      U.son('gain');
      parTerre.forEach(function(q, i){ ramassees.push({g:q.g, x:q.x, y:q.y, t:-i * 0.12}); });
      parTerre = [];
    });
    /* les feuilles qui volent montrent le vent TOUT DE SUITE (le décor suit 1,4 s plus tard) : elles entrent du côté d'où
       il vient et traversent l'écran ; quand il tourne, elles ralentissent et repartent dans l'autre sens */
    var feuilles = [], prochaineFeuille = 0.2, gFeu = svg.querySelector('.ti-feuilles');
    function majFeuilles(dt){
      if(p.vent < 5) return;
      var w = ventSens(t), vise = w * (85 + p.vent * 0.7);
      prochaineFeuille -= dt;
      if(prochaineFeuille <= 0 && feuilles.length < 14){
        prochaineFeuille = R(0.3, 0.6);
        if(Math.abs(w) > 0.3){
          var f = {x:w > 0 ? VIS.x0 - 8 : VIS.x1 + 8, y:R(Math.max(VIS.y0 + 30, 20), 360), vx:vise, ph:R(0, 6), r:R(0, 360), vr:R(200, 420) * (Math.random() < 0.5 ? -1 : 1)};
          f.g = svgNoeud('g', {'class':'ti-feuille'}, gFeu);
          f.g.innerHTML = '<path d="M-6,0 C-3,-4.6 3,-4.6 7,0 C3,3.6 -3,3.6 -6,0 Z M-6,0 L7,0" fill="' + U.choix(['#6fb84a', '#a8c84a', '#e6b84a', '#d9822e']) + '" stroke="#24182e" stroke-width="1"/>';
          feuilles.push(f);
        }
      }
      feuilles = feuilles.filter(function(f){
        f.vx += (vise - f.vx) * Math.min(1, dt * 1.8);
        f.x += f.vx * dt; f.y += (Math.sin(t * 2.6 + f.ph) * 22 + 8) * dt; f.r += f.vr * dt;
        if(f.x < VIS.x0 - 30 || f.x > VIS.x1 + 30 || f.y > SOL){ f.g.parentNode.removeChild(f.g); return false; }
        f.g.setAttribute('transform', 'translate(' + f1(f.x) + ',' + f1(f.y) + ') rotate(' + f0(f.r) + ')');
        return true;
      });
    }
    function finVol(){ enVol = null; flVol.setAttribute('opacity', '0'); trainee.setAttribute('d', ''); P.apres(250, function(){ if(!enVol) encoche.setAttribute('opacity', '1'); }); verifierFin(); }
    function verifierFin(){
      if(fini) return;
      var exploit = maxPerce >= 2 ? (BAND ? 'Une banderole en a relié ' + maxPerce + ' d\'un coup ! ' : 'Une flèche en a transpercé ' + maxPerce + ' d\'un coup ! ') : '';
      if(touches >= cibles.length){
        fini = true;
        if(BAND){ terrain.classList.add('ti-fete'); A.flotter(terrain, 62, 30, 'Ça, c\'est de la décoration !', 'ok'); for(var i = 0; i < 4; i++) P.apres(i * 180, function(){ eclats(R(80, 320), R(80, 200), 'confettis'); }); U.son('victoire'); }
        P.finir({reussi:true, score:1, erreurs:perdues, transperce:maxPerce, detail:exploit + (BAND ? 'La place est toute décorée pour la fête !' : (perdues === 0 ? 'Pas une seule flèche perdue !' : 'Toutes les cibles sont tombées !'))}, BAND ? 2200 : 1300);
        return;
      }
      /* le carquois est vide : on ramasse celles qui sont par terre ; s'il n'y en a plus nulle part, c'est perdu */
      if(fleches < 99 && fleches <= 0 && !enVol && !chutes.length && !ramassees.length){
        if(parTerre.length) montrerRamasser();
        else { fini = true; P.finir({reussi:false, score:touches / cibles.length, erreurs:perdues, transperce:maxPerce, detail:'Plus une seule flèche : elles sont toutes coincées dans le décor ou sorties de l\'écran…'}, 1000); }
      }
    }
    function texte(x, y, s, cls){ var q = A.pctDans(svg, terrain, x, y); A.flotter(terrain, q.x, q.y, s, cls); }
    function content(h){ humeur = h; humeurT = 0.9; }
    function toucher(c, x, y, parfait, sansTexte){
      c.touche = true; touches++;
      hud.prog(touches, cibles.length, '🎯');
      U.son(parfait ? 'gain' : 'ok'); U.vibrer(25);
      c.g.classList.add('touchee');
      content('content');
      var msg = parfait ? 'Tir parfait !' : 'Touché !', mx = x, my = y - 30;
      if(c.type === 'ballon' || c.type === 'cerfvolant'){
        /* la ficelle coupée : il s'envole un peu… puis redescend tout doucement jusqu'à l'enfant */
        if(c.fil) c.fil.classList.add('coupee');
        if(c.filM){ c.filM.setAttribute('display', 'none'); c.ciseaux.setAttribute('display', 'none'); }
        c.chute = {mode:'libre', t:0, x0:c.q.x, y0:c.q.y, r:0};
        msg = c.type === 'ballon' ? 'La ficelle est coupée !' : 'Le cerf-volant est libre !'; mx = c.q.x; my = c.q.y - 34;
        eclats(c.q.nx || x, c.q.ny || y, 'etoiles');
      } else if(c.type === 'baudruche'){ eclats(x, y, 'confettis'); c.chute = {pop:true}; c.g.style.display = 'none'; msg = 'Pop !'; U.son('bulle'); }
      else if(c.type === 'corbeau'){
        /* le corbeau chassé : il perd une plume et s'enfuit à tire-d'aile en râlant (jamais blessé) */
        for(var pl = 0; pl < 4; pl++) particule(x, y, PLUME, R(-70, 70), R(-110, 0), R(1.2, 1.8), 45);
        var sv = c.sensL || 1; c.chute = {mode:'fuit', t:0, vx:sv * R(200, 260), vy:-R(150, 200), sens:sv};
        c.g.classList.add('ti-fuit'); msg = U.choix(['Croâ ! Ouste !', 'Croâ ! Va-t\'en !']);
      }
      else if(c.type === 'lampion'){ eclats(x, y, 'papier'); c.chute = {vx:0, vy:-40, r:0}; if(c.fil) c.fil.classList.add('vide'); }
      else if(c.type === 'cible'){ eclats(x, y, 'paille'); c.reste = true; msg = parfait ? 'Dans le mille !' : 'Touché !'; }
      else if(BAND){ c.reste = true; msg = U.choix(['Accrochée !', 'Hop !', 'Bien joué !']); }
      if(!sansTexte) texte(mx, my, msg, 'ok');
      if(parfait) eclats(x, y, 'etoiles');
    }
    /* Romain, 6 nov. : une flèche dans le ballon le fait éclater, dans le cerf-volant le déchire : la partie est perdue */
    function eclater(c, x, y){
      if(fini) return;
      fini = true;
      var q = c.q || posCible(c, t), bal = c.type === 'ballon';
      if(c.fil) c.fil.setAttribute('display', 'none');
      if(c.filM){ c.filM.setAttribute('display', 'none'); c.ciseaux.setAttribute('display', 'none'); }
      if(bal){
        c.g.style.display = 'none';
        for(var i = 0; i < 12; i++){ var a = i / 12 * 6.283; particule(q.x, q.y, '<path d="M-4,-2 C-1,-4 3,-3 4,0 C2,3 -2,3 -4,-2 Z" fill="' + (i % 3 ? '#e5484d' : '#a8262c') + '"' + st(1) + '/>', Math.cos(a) * R(90, 170), Math.sin(a) * R(90, 170) - 40, R(0.8, 1.3), 380); }
        U.son('bulle'); texte(q.x, q.y - 30, 'Pof !', 'ko');
      } else {
        c.g.classList.add('ti-dechire'); c.chute = {vx:R(-30, 30), vy:-30, r:0, vr:R(-200, 200)};
        eclats(q.x, q.y, 'tissu'); U.son('ko'); texte(q.x, q.y - 30, 'Crac !', 'ko');
      }
      A.erreurSensorielle(terrain); content('oups');
      if(enfant){ var bo = enfant.querySelector('.ti-enf-bouche'); if(bo) bo.setAttribute('d', 'M-2.6,-27.4 Q0,-29.6 2.6,-27.4'); enfant.classList.add('ti-triste'); }
      P.finir({reussi:false, score:touches / cibles.length, erreurs:tirs - utiles, detail:bal ? 'Le ballon a éclaté… Il fallait viser la ficelle, pas le ballon !' : 'Le cerf-volant s\'est déchiré… Il fallait viser la ficelle, pas le cerf-volant !'}, 1700);
    }
    function traverser(res, vol){
      vol = vol || enVol; vol.nb++;
      if(vol.nb === 1) utiles++;
      maxPerce = Math.max(maxPerce, vol.nb);
      toucher(res.c, res.x, res.y, res.parfait, vol.nb >= 2);
      if(BAND) vol.anneaux.push(res.c);
      if(!res.parfait) eclats(res.x, res.y, 'etoiles');
      if(vol.nb >= 2){
        texte(res.x, res.y - 48, (BAND ? 'Reliés ! ×' : 'Transpercé ! ×') + vol.nb, 'perce');
        U.son('magie'); U.vibrer(60);
        [784, 988, 1175, 1568, 1976].slice(0, vol.nb + 1).forEach(function(f, i){ P.apres(i * 75, function(){ A.note(f, 0.3); }); });
      }
      if(vol.ralenti){ vol.ralenti = false; P.apres(380, function(){ if(enVol && enVol.ralenti) return; slowCible = 1; camZc = 1; camXc = 180; camYc = 240; }); }
    }
    function rater(x, y, quoi){ A.erreurSensorielle(terrain); texte(x, y - 24, quoi, 'ko'); content('oups'); }
    function collision(x, y, tt, ignore){
      for(var i = 0; i < cibles.length; i++){
        var c = cibles[i]; if(c.touche || (ignore && ignore.indexOf(c) >= 0)) continue;
        var q = posCible(c, tt);
        if(c.pigeon && c.pigeon.etat === 'pose'){ var op = ouPose(c); if(dist({x:x, y:y}, op) < 13 || dist({x:x, y:y}, q) < p.rayon) return {pigeon:c.pigeon, c:c, x:x, y:y}; }
        if(c.mv === 'ficelle'){
          var seg = A.dist ? null : null, sd = distSeg({x:x, y:y}, {x:c.s.ax, y:c.s.ay}, {x:q.nx, y:q.ny});
          if(sd.d < p.ficelle && sd.t > 0.06) return {c:c, parfait:true, x:x, y:y};
          /* Romain, 6 nov. : dans le ballon, il éclate ; dans le cerf-volant, il se déchire : perdu */
          if(dist({x:x, y:y}, q) < (c.type === 'cerfvolant' ? 20 : 19)) return {rate:'eclate', c:c, x:x, y:y};
        } else {
          /* (les anneaux, les enseignes et les crochets : une zone plus grande — Romain, 6 nov. : « j'arrive pas du tout à viser les anneaux ») */
          var anneauLike = c.type === 'anneau' || c.type === 'basile' || c.type === 'enseigne' || c.type === 'fanion';
          var r = c.mv === 'point' ? Math.max(p.corde * 2.4, 13) : (anneauLike ? Math.max(p.rayon * 1.4, 17) : (c.mv === 'huit' ? p.rayon * 1.1 : p.rayon)), dd = dist({x:x, y:y}, q);
          if(dd < r) return {c:c, parfait:dd < r * 0.42, x:x, y:y};
        }
      }
      for(var b = 0; b < drapeaux.length; b++){ var h = collDrapeau(drapeaux[b], x, y, tt); if(h) return {branche:drapeaux[b], local:h, x:x, y:y}; }
      for(var ob = 0; ob < obstacles.length; ob++){ var ho = collObstacle(obstacles[ob], x, y, tt); if(ho) return {obstacle:obstacles[ob], hit:ho, x:x, y:y}; }
      for(var o = 0; o < oiseaux.length; o++){ var oi = oiseaux[o]; if(oi.fuit || (ignore && ignore.indexOf(oi) >= 0)) continue; var po = posOiseau(oi, tt); if(oi.sursaut <= 0 && dist({x:x, y:y}, po) < oi.r) return {oiseau:oi, x:x, y:y}; }
      if(y > SOL + Math.sin(x / 50) * 2) return {sol:true, x:x, y:y};
      if(horsEcran(x, y)) return {hors:true, x:x, y:y};
      return null;
    }
    function distSeg(pt, a, bq){
      var dx = bq.x - a.x, dy = bq.y - a.y, l2 = dx * dx + dy * dy, u = l2 ? fixe(((pt.x - a.x) * dx + (pt.y - a.y) * dy) / l2, 0, 1) : 0;
      var x = a.x + dx * u - pt.x, y = a.y + dy * u - pt.y;
      return {d:Math.sqrt(x * x + y * y), t:u};
    }
    function prevoir(v, tt, duree){
      var s = {x:v.x, y:v.y, vx:v.vx, vy:v.vy}, h = 1 / 90;
      for(var k = 0; k < duree / h; k++){
        s.vx += ventA(tt) * h; s.vy += ARC.g * h; s.x += s.vx * h; s.y += s.vy * h; tt += h;
        var r = collision(s.x, s.y, tt); if(r) return r;
      }
      return null;
    }
    /* La ligne de visée (Romain, 6 nov., 10 h 50 : « un repère plus prononcé, des pointillés qui vont plus loin, même au
       niveau 10 ; un petit peu d'aide à la visée ») : des points blancs bien visibles, qui tiennent compte du vent. Sur la
       longueur montrée (pas plus loin : c'est la petite aide), elle dit ce qui va arriver : DORÉE si la flèche va dans une
       cible (la cible s'entoure), ROUGE si elle va dans un obstacle, un oiseau, le ballon ou par terre (l'obstacle s'entoure
       de rouge), avec une étoile ou une croix au point d'arrivée. */
    var marqueAp = svgNoeud('g', {'class':'ti-ap-marque', opacity:0}, gAp);
    marqueAp.innerHTML = '<g class="ti-ap-bon"><path d="M0,-9 L2.6,-2.6 L9,0 L2.6,2.6 L0,9 L-2.6,2.6 L-9,0 L-2.6,-2.6 Z" fill="#ffd36a" stroke="#24182e" stroke-width="1.6"/></g><g class="ti-ap-mauvais"><path d="M-6,-6 L6,6 M6,-6 L-6,6" stroke="#24182e" stroke-width="6" stroke-linecap="round"/><path d="M-6,-6 L6,6 M6,-6 L-6,6" stroke="#ff5b5b" stroke-width="3.4" stroke-linecap="round"/></g><g class="ti-ap-deux"><circle cx="11" cy="-11" r="7.5"/><text x="11" y="-7.6" text-anchor="middle">2</text></g>';
    /* la super flèche (Romain, 6 nov., 14 h 30 : « pas sûr qu'on comprenne qu'elle peut transpercer 2 choses ») : un « 1 »
       là où elle traverse, un « 2 » là où elle s'arrête */
    var marqueUn = svgNoeud('g', {'class':'ti-ap-un', opacity:0}, gAp);
    marqueUn.innerHTML = '<circle r="8"/><text y="3.6" text-anchor="middle">1</text>';
    var bloqueAp = null;
    function apercu(v, fort){
      var complet = p.revele || tirs < p.aide;
      var duree = complet ? 2.2 : p.apercu;
      var s = {x:v.x, y:v.y, vx:v.vx, vy:v.vy}, h = 1 / 60, n = 0, tt = t, vu = null, vues = [], ptUn = null;
      for(var k = 0; k < duree / h && n < apercuPts.length; k++){
        s.vx += ventA(tt) * h;   /* (les points de visée tiennent compte du vent qui tourne : 6 nov.) */
        s.vy += ARC.g * h; s.x += s.vx * h; s.y += s.vy * h; tt += h;
        if(k % 3 === 2){ var c = apercuPts[n++]; c.setAttribute('cx', f1(s.x)); c.setAttribute('cy', f1(s.y)); c.setAttribute('opacity', complet ? '0.95' : Math.max(0.35, 1 - 0.65 * k * h / duree).toFixed(2)); }
        var r = collision(s.x, s.y, tt, vues);
        if(r && !r.perdue){ if(fort && !vues.length && ((r.c && !r.rate && !r.pigeon) || r.oiseau)){ vues.push(r.c || r.oiseau); ptUn = {x:r.x, y:r.y}; } else { vu = r; break; } }
      }
      for(; n < apercuPts.length; n++) apercuPts[n].setAttribute('opacity', '0');
      var vuesC = vues.filter(function(q){ return cibles.indexOf(q) >= 0; });
      var bon = (vu && ((vu.c && !vu.rate) || vu.pigeon)) || (!vu && vuesC.length > 0), mauvais = !!vu && !bon;
      gAp.classList.toggle('ti-ap-ok', !!bon); gAp.classList.toggle('ti-ap-ko', mauvais);
      if(vu){ marqueAp.setAttribute('opacity', 1); marqueAp.setAttribute('transform', 'translate(' + f1(vu.x) + ',' + f1(vu.y) + ')'); marqueAp.classList.toggle('ko', mauvais); }
      else marqueAp.setAttribute('opacity', 0);
      marqueAp.classList.toggle('deux', !!(ptUn && vu));
      if(ptUn){ marqueUn.setAttribute('opacity', 1); marqueUn.setAttribute('transform', 'translate(' + f1(ptUn.x) + ',' + f1(ptUn.y - 16) + ')'); }
      else marqueUn.setAttribute('opacity', 0);
      var bl = vu && vu.obstacle ? vu.obstacle.g : (vu && vu.rate === 'eclate' ? vu.c.g : null);
      if(bl !== bloqueAp){ if(bloqueAp) bloqueAp.classList.remove('ti-bloque'); if(bl) bl.classList.add('ti-bloque'); bloqueAp = bl; }
      cibles.forEach(function(c){ c.g.classList.toggle('visee', vues.indexOf(c) >= 0 || !!(vu && vu.c === c && !vu.rate && !vu.pigeon)); });
    }
    function cacherApercu(){ marqueAp.setAttribute('opacity', 0); marqueUn.setAttribute('opacity', 0); gAp.classList.remove('ti-ap-ok', 'ti-ap-ko'); if(bloqueAp){ bloqueAp.classList.remove('ti-bloque'); bloqueAp = null; } }

    P.boucle(function(dtR){
      if(ralentiT > 0){ ralentiT -= dtR; if(ralentiT <= 0) terrain.classList.remove('ralenti'); }
      slow += (slowCible - slow) * Math.min(1, dtR * 10);
      var dt = dtR * slow * (ralentiT > 0 ? 0.35 : 1);
      t += dt;
      var vent = ventV(t);   /* (le vent du décor ; celui des flèches, ventA, est plus faible aux petits niveaux) */
      camZ += (camZc - camZ) * Math.min(1, dtR * 6); camX += (camXc - camX) * Math.min(1, dtR * 6); camY += (camYc - camY) * Math.min(1, dtR * 6);
      cam.setAttribute('transform', camZ > 1.01 ? 'translate(' + f1(camX) + ',' + f1(camY) + ') scale(' + camZ.toFixed(3) + ') translate(' + f1(-camX) + ',' + f1(-camY) + ')' : '');
      /* le décor vivant : nuages, fumées, girouette, fanion du lampadaire */
      nuages.forEach(function(n, i){ n.__x += (6 + vent * 0.08 + i) * dt; if(n.__x > 640) n.__x = -280; if(n.__x < -300) n.__x = 620; n.setAttribute('transform', 'translate(' + f1(n.__x) + ',' + n.__y + ') scale(' + n.__s + ')'); });
      fumees.forEach(function(f){ f.b.forEach(function(b){ var u = ((t * 0.35 + b.ph) % 1); b.c.setAttribute('cx', f1(f.x + u * (12 + vent * 0.25) + Math.sin(t * 2 + b.ph * 6) * 2)); b.c.setAttribute('cy', f1(f.y - u * 34)); b.c.setAttribute('r', f1(3 + u * 7)); b.c.setAttribute('opacity', f1((1 - u) * 0.7)); }); });
      /* la girouette tourne doucement avec le vent (elle passe de profil pendant la transition) ; la manche à air s'allonge
         du côté où il souffle et retombe quand il tourne */
      var ws = ventSens(t);
      if(coq) coq.setAttribute('transform', 'translate(300,-18) scale(' + (-ws).toFixed(2) + ',1) rotate(' + f1(Math.sin(t * 3) * 3) + ')');
      manche.setAttribute('transform', 'translate(0,-88) scale(' + (ws >= 0 ? 1 : -1) * (0.25 + Math.abs(ws) * 0.85) + ',1) rotate(' + f1(Math.sin(t * 7) * 4 * Math.abs(ws) + (1 - Math.abs(ws)) * 50 * (ws >= 0 ? 1 : 1)) + ' 0 -6)');
      /* les cibles */
      cibles.forEach(function(c){
        if(c.reste){ dessinerCible(c); return; }
        if(c.chute){
          var ch = c.chute;
          if(ch.pop) return;
          if(ch.mode === 'libre'){
            ch.t += dt;
            /* il remonte un peu, puis plane jusqu'à l'enfant (en 2,4 s) */
            var u2 = Math.min(1, ch.t / 2.4), cxE = enfX, cyE = SOL - 52;
            var x = ch.x0 + (cxE - ch.x0) * lisse(u2) + Math.sin(ch.t * 3) * 10 * (1 - u2), y = ch.y0 - 30 * Math.sin(Math.min(1, ch.t / 0.8) * Math.PI / 2) * (1 - u2) + (cyE - ch.y0) * Math.pow(u2, 1.4);
            c.q.x = x; c.q.y = y;
            c.g.setAttribute('transform', 'translate(' + f1(x) + ',' + f1(y) + ') rotate(' + f1(Math.sin(ch.t * 4) * 10) + ') scale(' + f1(1 - 0.25 * u2) + ')');
            if(c.fil){ c.fil.setAttribute('x1', f1(x)); c.fil.setAttribute('y1', f1(y + 20)); c.fil.setAttribute('x2', f1(x + Math.sin(ch.t * 2) * 6)); c.fil.setAttribute('y2', f1(y + 60)); }
            if(u2 >= 1 && !ch.fini){ ch.fini = true; if(enfant) enfant.classList.add('ti-joie'); var bo = enfant && enfant.querySelector('.ti-enf-bouche'); if(bo) bo.setAttribute('d', 'M-3,-29.4 Q0,-25.6 3,-29.4'); texte(enfX, SOL - 90, 'Merci !', 'ok'); }
            return;
          }
          if(ch.mode === 'fuit'){
            ch.t += dt; ch.vy -= 30 * dt; c.q.x += ch.vx * dt; c.q.y += ch.vy * dt;
            if(c.q.y > -260 && c.q.x > -300 && c.q.x < 660) c.g.setAttribute('transform', 'translate(' + f1(c.q.x) + ',' + f1(c.q.y) + ') scale(' + (ch.vx > 0 ? 1 : -1) + ',1) rotate(-18)');
            else c.g.style.display = 'none';
            return;
          }
          ch.vy += 600 * dt; ch.r += (ch.vr || 120) * dt;
          c.q.x += ch.vx * dt; c.q.y += ch.vy * dt;
          if(c.q.y < 700 && c.q.y > -300) c.g.setAttribute('transform', 'translate(' + f1(c.q.x) + ',' + f1(c.q.y) + ') rotate(' + f0(ch.r) + ')');
          else c.g.style.display = 'none';
          if(c.fil && c.mv === 'pendule'){ var a = Math.sin(t * 3) * 0.2; c.fil.setAttribute('x2', f1(c.s.ax + Math.sin(a) * 26)); c.fil.setAttribute('y2', f1(c.s.ay + 26)); }
        } else dessinerCible(c);
      });
      drapeaux.forEach(dessinerDrapeau);
      obstacles.forEach(dessinerObstacle);
      if(p.oiseaux){ prochainOiseau -= dt; if(prochainOiseau <= 0){ lancerOiseau(false); prochainOiseau = p.oiseaux * R(0.7, 1.3); } }
      if(p.grands){ prochainGrand -= dt; if(prochainGrand <= 0){ lancerOiseau(true); prochainGrand = R(12, 17); } }
      oiseaux = oiseaux.filter(function(o){
        var po = posOiseau(o, t);
        if(po.u >= 1){ o.g.parentNode.removeChild(o.g); return false; }
        /* il penche dans le sens de sa courbe ; il bat des ailes, puis plane un moment (les gros planent plus) ; touché,
           il sursaute (bond, battements rapides) et continue sa route */
        var p2 = posOiseau(o, t + 0.05), pente = Math.atan2(p2.y - po.y, Math.abs(p2.x - po.x) + 0.01) * 57.3 * 0.6;
        o.sursaut = Math.max(0, o.sursaut - dt);
        var cyc = (t + o.ph) % (o.grand ? 2.6 : 1.8), plane = cyc > (o.grand ? 1.5 : 1.3) && o.sursaut <= 0 && !o.fuit;
        var bat = plane ? -6 + Math.sin(t * 3) * 3 : Math.sin(t * (o.sursaut > 0 || o.fuit ? 34 : (o.grand ? 9 : 16)) + o.ph) * (o.grand ? 30 : 34);
        var bond = o.sursaut > 0 ? -Math.sin((0.9 - o.sursaut) / 0.9 * Math.PI) * 16 : 0;
        o.g.setAttribute('transform', 'translate(' + f1(po.x) + ',' + f1(po.y + bond) + ')');
        var sc = o.grand ? 1.25 : 0.72;
        o.s.setAttribute('transform', 'scale(' + (sc * o.dir).toFixed(2) + ',' + sc + ') rotate(' + f1(pente * o.dir) + ')');
        for(var ai = 0; ai < o.ailes.length; ai++) o.ailes[ai].setAttribute('transform', 'rotate(' + f1(ai ? bat * 0.8 : bat) + ' -4 -1)');
        return true;
      });
      /* les pigeons qui se posent */
      if(p.perche && !fini){ prochainePose -= dt; if(prochainePose <= 0){ poserPigeon(); prochainePose = p.perche * R(0.8, 1.25); } }
      poses = poses.filter(function(pg){
        pg.t += dt;
        if(pg.etat === 'arrive'){
          if(!pg.c || pg.c.touche){ envolerPigeon(pg); }
          else { var cible0 = ouPose(pg.c), u = Math.min(1, pg.t / 1.1); pg.x += (cible0.x - pg.x) * Math.min(1, dt * 4); pg.y += (cible0.y - pg.y) * Math.min(1, dt * 4); if(u >= 1 && dist(pg, cible0) < 4){ pg.etat = 'pose'; pg.t = 0; U.son('tic'); } }
        } else if(pg.etat === 'pose'){
          var op = ouPose(pg.c); pg.x = op.x; pg.y = op.y;
          if(pg.t > pg.reste) envolerPigeon(pg);
        } else { pg.vy += 60 * dt; pg.x += pg.vx * dt; pg.y += pg.vy * dt; }
        var vole = pg.etat !== 'pose';
        pg.g.setAttribute('transform', 'translate(' + f1(pg.x) + ',' + f1(pg.y) + ')');
        pg.s.setAttribute('transform', 'scale(' + ((pg.etat === 'part' ? pg.vx : pg.dir) > 0 ? 1 : -1) + ',1)' + (vole ? '' : ' rotate(' + f1(Math.sin(pg.t * 8) * 4) + ')'));
        pg.g.classList.toggle('ti-vole', vole);
        if(pg.etat === 'part' && (pg.y < -260 || pg.x < -300 || pg.x > 660)){ pg.g.parentNode.removeChild(pg.g); return false; }
        return true;
      });
      /* l'arc et l'archer */
      var ang = clav.ang, puis = 0;
      if(vise){
        var v = {x:(vise.x0 - vise.x), y:(vise.y0 - vise.y)};
        /* (le temps tiré à fond ; on relâche un peu, et ça repart de zéro) */
        if(Math.sqrt(v.x * v.x + v.y * v.y) / ARC.tire >= PERCE) tenir += dtR; else tenir = 0;
        var s = tirDepuis(v); ang = s.ang; puis = s.puis;
        var d = pointeDepart(ang), fort = puis >= PERCE;
        apercu({x:d.x, y:d.y, vx:s.vx, vy:s.vy}, fort);
        jaugeArc.style.strokeDasharray = (puis * 289).toFixed(0) + ' 400';
        jaugeArc.classList.toggle('tremble', tenir > p.tenue);
        /* la barre de puissance */
        var niv = fort ? 'max' : (puis > 0.75 ? 'fort' : (puis > 0.45 ? 'moyen' : 'faible'));
        puRempli.setAttribute('y', f1(370 - 140 * puis)); puRempli.setAttribute('height', f1(140 * puis));
        if(niv !== puG._n){ puG._n = niv; puG.setAttribute('class', 'ti-puiss on ti-pu-' + niv); puMot.textContent = {faible:'Faible', moyen:'Moyen', fort:'Fort', max:'Super flèche ×2'}[niv]; jaugeArc.classList.remove('pu-faible', 'pu-moyen', 'pu-fort'); if(niv !== 'max') jaugeArc.classList.add('pu-' + niv); }
        if(fort !== !!vise.fort){ vise.fort = fort; jaugeArc.classList.toggle('fort', fort); gAp.classList.toggle('fort', fort); encoche.classList.toggle('fort', fort); aFond.classList.toggle('on', fort); if(fort){ U.son('tic'); U.vibrer(15); if(!SUPER_EXPLIQUEE){ SUPER_EXPLIQUEE = true; bandeau('⚡', 'Super flèche : elle traverse une chose, puis s\'arrête dans la suivante. 2 d\'un coup !', 4200); } } }
      } else {
        jaugeArc.style.strokeDasharray = '0 400'; tenir = 0; cibles.forEach(function(c){ c.g.classList.remove('visee'); });
        if(puG._n){ puG._n = ''; puG.setAttribute('class', 'ti-puiss'); puRempli.setAttribute('height', 0); cacherApercu(); }
        if(jaugeArc.classList.contains('fort')){ jaugeArc.classList.remove('fort'); gAp.classList.remove('fort'); encoche.classList.remove('fort'); aFond.classList.remove('on'); }
      }
      if(vise || !enVol){ arcRot.setAttribute('transform', 'rotate(' + f1(ang * 57.3) + ')'); arcRot.__a = ang; var K1 = corpsArcher(ang); arcG.setAttribute('transform', 'translate(' + f1(ARC.x + K1.Bx) + ',' + f1(ARC.y + K1.By) + ')'); pointArc = [ARC.x + K1.Bx + 4, ARC.y + K1.By]; }
      var angAff = arcRot.__a === undefined ? ang : arcRot.__a;
      cordeArc.setAttribute('d', 'M0,-38 L' + f1(-puis * 26) + ',0 L0,38');
      encoche.setAttribute('transform', 'translate(' + f1(-puis * 26 + 22) + ',0)');
      if(humeurT > 0){ humeurT -= dtR; if(humeurT <= 0) humeur = ''; }
      archer.poser(angAff, puis, t, vent, humeur);
      /* la flèche */
      if(enVol){
        var sub = 4, h = dt / sub, res = null;
        for(var k = 0; k < sub && !res; k++){
          enVol.vx += ventA(t - dt + h * (k + 1)) * h; enVol.vy += ARC.g * h; enVol.x += enVol.vx * h; enVol.y += enVol.vy * h;   /* (le vent des flèches, pas celui du décor) */
          res = collision(enVol.x, enVol.y, t - dt + h * (k + 1));
          /* tirée à fond, elle traverse UNE chose (une cible, ou une tourterelle), puis s'arrête dans la suivante : 2 au plus
             (Romain, 6 nov., 12 h 49) */
          if(res && enVol.perce && !enVol.passe && ((res.c && !res.rate && !res.pigeon) || res.oiseau)){
            enVol.passe = true;
            if(res.oiseau){ chasserOiseau(res.oiseau, res.x, res.y); texte(res.x, res.y - 24, res.oiseau.grand ? 'Kiaou !' : 'Rrouhou !', 'ok'); }
            else traverser(res);
            res = null;
          }
        }
        if(!res && enVol.nb && touches >= cibles.length){ enVol.age += dt; if(enVol.age > 0.6) res = {perdue:true, x:enVol.x, y:enVol.y}; }
        enVol.hist.push(f1(enVol.x) + ',' + f1(enVol.y)); if(enVol.hist.length > 9) enVol.hist.shift();
        trainee.setAttribute('d', 'M' + enVol.hist.join(' L'));
        if(volBand && !volBand.tombe){ volBand.pts.push([enVol.x - Math.cos(Math.atan2(enVol.vy, enVol.vx)) * 30, enVol.y - Math.sin(Math.atan2(enVol.vy, enVol.vx)) * 30]); dessinerVolBand(); }
        var aV = Math.atan2(enVol.vy, enVol.vx);
        flVol.setAttribute('transform', 'translate(' + f1(enVol.x) + ',' + f1(enVol.y) + ') rotate(' + f1(aV * 57.3) + ')');
        if(!enVol.ralenti && !res){
          var pr = prevoir(enVol, t, 0.26);
          if(pr && pr.c && !pr.rate && !pr.pigeon && (pr.parfait || touches === cibles.length - 1 || enVol.nb >= 1)){ enVol.ralenti = true; enVol.zoom = true; slowCible = 0.2; camZc = 1.55; camXc = pr.x; camYc = pr.y; }
        }
        if(res){
          var vol = enVol, deja = vol.nb > 0; enVol = null;
          var rate2 = function(x, y, quoi){ if(deja) texte(x, y - 24, quoi, 'ko'); else rater(x, y, quoi); };
          if(res.c && !res.rate && !res.pigeon){ traverser(res, vol); if(res.c.type === 'lampion' || res.c.type === 'cible'){ var lo = local(res.c, res.x, res.y); planter(lo.x, lo.y, aV + lo.a, res.c.art); } }
          else if(res.pigeon){
            /* un corbeau posé : on le chasse, et la flèche est rendue (les corbeaux, on peut toujours les chasser) */
            /* (la flèche tombe par terre : on pourra la ramasser — 6 nov., 14 h 30) */
            envolerPigeon(res.pigeon, true); U.son('ok'); faireTomber(res.x, res.y, vol.vx * 0.08, -80);
            texte(res.x, res.y - 24, 'Croâ ! Ouste !', 'ok');
          }
          else if(res.obstacle){
            /* un obstacle du décor : la flèche s'y plante, même tirée à fond */
            var ob2 = res.obstacle, hh = res.hit;
            if(!hh.loc) planter(res.x - ob2.dx, res.y - ob2.dy, aV, ob2.pl);
            else if(hh.drap !== undefined){ var pdd = posDrap(ob2, hh.drap, t); planter(hh.loc.x, hh.loc.y, aV - pdd.a, ob2.dr[hh.drap]); }
            else { var pmm = posMob(ob2, t); planter(hh.loc.x, hh.loc.y, aV - pmm.a, ob2.m); }
            ob2.g.classList.remove('ti-toc'); void ob2.g.getBoundingClientRect(); ob2.g.classList.add('ti-toc');
            eclats(res.x, res.y, hh.drap !== undefined ? 'tissu' : (ob2.type === 'platane' ? 'feuilles' : 'bois'));
            perdues++; rate2(res.x, res.y, ob2.vent ? 'Perdue dans les feuilles…' : 'Toc ! Perdue là-haut…'); if(!deja) U.son('ko');
          }
          else if(res.rate === 'eclate'){ eclater(res.c, res.x, res.y); }
          else if(res.branche){ eclats(res.x, res.y, 'tissu'); particule(res.x, res.y, FLECHE_ART, -vol.vx * 0.12, -60, 1.1, 520, 380); rate2(res.x, res.y, 'Dans le drapeau !'); if(!deja) U.son('ko'); }
          else if(res.oiseau){ chasserOiseau(res.oiseau, res.x, res.y); faireTomber(res.x, res.y, -vol.vx * 0.15, -90); rate2(res.x, res.y, res.oiseau.grand ? 'Kiaou ! Il s\'envole !' : 'Rrouhou ! Elle s\'envole !'); }
          else if(res.sol){ parTerre.push({g:planter(res.x, res.y, aV), x:res.x, y:res.y}); if(!deja) rater(res.x, res.y, 'Raté'); }
          else if(res.hors){ perdues++; rate2(fixe(res.x, VIS.x0 + 30, VIS.x1 - 30), fixe(res.y, VIS.y0 + 40, 420), 'Sortie de l\'écran : perdue !'); }
          else if(!deja){ rater(fixe(res.x, 20, 340), fixe(res.y, 40, 420), 'Raté'); }
          /* la banderole : accrochée aux anneaux touchés (elle reste accrochée à l'arc), sinon le bout emporté retombe */
          if(BAND && volBand){
            if(vol.anneaux.length){ gVolB.innerHTML = ''; volBand = null; accrocher(vol.anneaux); U.son('magie'); }
            else if(chaine && chaine.anneaux.length && !chaine.detache){ chaine.retour = {t:0, x:fixe(res.x, -200, 560), y:fixe(res.y, -100, SOL)}; gVolB.innerHTML = ''; volBand = null; }
            else tomberVolBand();
          }
          if(vol.ralenti || vol.zoom){ P.apres(380, function(){ if(enVol && enVol.ralenti) return; slowCible = 1; camZc = 1; camXc = 180; camYc = 240; }); }
          else { slowCible = 1; camZc = 1; }
          finVol();
        }
      }
      majChutes(dt);
      majFeuilles(dt);
      /* la banderole ratée qui tombe */
      if(volBand && volBand.tombe){
        volBand.tombe.t += dt;
        volBand.pts.forEach(function(q, i){ q[1] += (60 + 240 * volBand.tombe.t) * dt * Math.min(1, i / 6 + 0.2); q[1] = Math.min(q[1], SOL - 2); q[0] += volBand.tombe.v[i] * dt; });
        dessinerVolBand();
        gVolB.setAttribute('opacity', f1(Math.max(0, 1 - Math.max(0, volBand.tombe.t - 0.9) * 2)));
        if(volBand.tombe.t > 1.5){ gVolB.innerHTML = ''; gVolB.removeAttribute('opacity'); volBand = null; }
      }
      dessinerChaine(dt);
      /* le ballon qui rebondit quand la flèche le frôle */
      cibles.forEach(function(c){ if(c.boing > 0){ c.boing -= dt; c.art.setAttribute('transform', 'scale(' + f1(1 + Math.sin(c.boing * 30) * c.boing * 0.3) + ',' + f1(1 - Math.sin(c.boing * 30) * c.boing * 0.3) + ')'); if(c.boing <= 0) c.art.removeAttribute('transform'); } });
      /* les particules */
      parts = parts.filter(function(q){
        q.age += dt; q.vy += q.g * dt; q.x += q.vx * dt; q.y += q.vy * dt; q.r += q.vr * dt;
        if(q.g < 100){ q.vx *= (1 - dt * 1.5); }
        q.el.setAttribute('transform', 'translate(' + f1(q.x) + ',' + f1(q.y) + ') rotate(' + f0(q.r) + ')');
        q.el.setAttribute('opacity', Math.max(0, 1 - q.age / q.vie).toFixed(2));
        if(q.age > q.vie){ q.el.parentNode.removeChild(q.el); return false; }
        return true;
      });
    });
    archer.poser(clav.ang, 0, 0, 0, '');
    P.apres(500, function(){ texte(190, 250, 'Vise ce qui brille en doré !', 'ok'); });
    return {arreter: P.arreter};
  }
});

/* ==========================================================
   L'ÉCRAN D'ACCUEIL (mj-core : MJ.DEMOS) : la main pose le doigt, tire à fond
   (l'archer se penche, la corde va jusqu'à la joue, la ligne de visée devient
   dorée), lâche : la flèche coupe la ficelle du ballon (ou du cerf-volant), ou
   emporte une banderole jusqu'à l'anneau. Puis tout recommence.
   ========================================================== */
/* la phrase de l'écran d'accueil (mj-regles.js : MJ.PHRASES), selon la version */
MJ.PHRASES = MJ.PHRASES || {};
MJ.PHRASES.tir = function(p){ var m = modeDe(p); return m === 'banderoles' ? 'Touche tous les anneaux dorés !' : (m === 'cerfvolant' ? 'Coupe la ficelle dorée, pas le cerf-volant !' : 'Coupe la ficelle dorée, pas le ballon !'); };
if(MJ.DEMOS){
  MJ.DEMOS.tir = {w:300, h:420, f:function(el, prm){
    var MODE = modeDe(prm), BAND = MODE === 'banderoles', id = A.nid('tid');
    /* la cible (le ballon, le cerf-volant ou l'anneau), le nœud de sa ficelle, et où la flèche arrive (sur la ficelle) */
    var SL = BAND ? null : SLOTS[MODE === 'cerfvolant' ? 'cerfvolant' : 'ballon'][0];
    var CIB = BAND ? [232, 140] : [SL.ax + Math.sin(SL.a0) * SL.L, SL.ay - Math.cos(SL.a0) * SL.L];
    var NOEUD = BAND ? null : [SL.ax, SL.ay];
    var FIN = BAND ? CIB : [SL.ax + Math.sin(SL.a0) * (SL.L - 22) * 0.45, SL.ay - Math.cos(SL.a0) * (SL.L - 22) * 0.45];
    var CTRL = BAND ? [140, 60] : [150, 30], VISEE = -0.9;
    for(var it = 0; it < 4; it++){ var Kd = corpsArcher(VISEE); VISEE = Math.atan2(CTRL[1] - (ARC.y + Kd.By), CTRL[0] - (ARC.x + Kd.Bx)); }
    var Kv = corpsArcher(VISEE), Bc = [ARC.x + Kv.Bx, ARC.y + Kv.By];
    function bez(s){ var a = 1 - s; return [a * a * Bc[0] + 2 * a * s * CTRL[0] + s * s * FIN[0], a * a * Bc[1] + 2 * a * s * CTRL[1] + s * s * FIN[1]]; }
    function tang(s){ return Math.atan2(2 * (1 - s) * (CTRL[1] - Bc[1]) + 2 * s * (FIN[1] - CTRL[1]), 2 * (1 - s) * (CTRL[0] - Bc[0]) + 2 * s * (FIN[0] - CTRL[0])); }
    var pts = ''; for(var i = 1; i <= 14; i++){ var q = bez(i / 14); pts += '<circle class="rg-pt" cx="' + f1(q[0]) + '" cy="' + f1(q[1]) + '" r="3.3" stroke="#24182e" stroke-width="1.3"/>'; }
    /* (comme dans le jeu : ce qu'il faut toucher brille en doré — l'anneau, ou la ficelle du ballon) */
    var cib = BAND ? '<g class="tid-c" transform="translate(' + CIB[0] + ',' + CIB[1] + ')">' + cibleArt('anneau', id) + '<circle class="ti-marque" r="20"/></g>' :
      '<line class="tid-fil" x1="' + NOEUD[0] + '" y1="' + NOEUD[1] + '" stroke="#f4ecdc" stroke-width="2.2"/><line class="ti-ficelle-m tid-film" x1="' + NOEUD[0] + '" y1="' + NOEUD[1] + '"/><g class="tid-c">' + cibleArt(MODE === 'cerfvolant' ? 'cerfvolant' : 'ballon', id) + '</g>';
    /* la jauge de puissance, comme dans le jeu */
    var jaugeP = '<g class="ti-puiss on tid-pu" transform="translate(12,0)"><rect class="ti-pu-fond" x="5" y="226" width="22" height="148" rx="11"/><clipPath id="' + id + 'pu"><rect x="9" y="230" width="14" height="140" rx="7"/></clipPath><rect class="ti-pu-rempli" x="9" y="370" width="14" height="0" clip-path="url(#' + id + 'pu)"/><path class="ti-pu-traits" d="M9,323 h14 M9,277 h14 M9,237 h14"/><g class="ti-pu-eclair" transform="translate(16,212)"><circle r="12"/><path d="M2,-8 L-5,1 L0,1 L-2,8 L5,-1 L0,-1 Z"/></g><text class="ti-pu-mot" x="32" y="236"></text></g>';
    el.innerHTML = '<svg class="rg-demo-svg" viewBox="0 0 300 420" preserveAspectRatio="xMidYMid meet"><g transform="translate(-4,-40)">' + sceneTir(id, MODE) + (BAND ? matSVG(id) : enfantSVG()) + cib +
      '<g class="tid-guir"><path class="ti-g-fil" d=""/></g>' +
      '<g class="rg-pts">' + pts + '</g>' + archerSVG() +
      '<g transform="translate(' + Bc[0] + ',' + Bc[1] + ')"><circle class="rg-jauge" r="46" fill="none" stroke-width="6" stroke-linecap="round" transform="rotate(-90)"/><g class="tid-arc">' + ARC_ART + '<path class="tid-corde" d="M0,-38 L0,38" stroke="#f4f1ea" stroke-width="2" fill="none"/><g class="tid-enc">' + FLECHE_ART + '</g></g></g>' +
      /* (la super flèche, montrée dès l'accueil : elle traverse un corbeau, puis atteint la cible — 6 nov., 14 h 30) */
      '<g class="tid-cb"><circle class="ti-marque" r="20"/><g class="tid-cbs">' + corbeauSVG() + '</g></g><g class="tid-plumes" opacity="0">' + [0, 1, 2].map(function(i){ return '<g class="tid-pl">' + PLUME + '</g>'; }).join('') + '</g>' +
      '<g class="ti-ap-un tid-un" opacity="0"><circle r="8"/><text y="3.6" text-anchor="middle">1</text></g><g class="ti-ap-un tid-deux" opacity="0"><circle r="8"/><text y="3.6" text-anchor="middle">2</text></g>' +
      '<g class="tid-fl" opacity="0">' + FLECHE_ART + '</g>' + jaugeP + '</g>' + A.MAIN + '</svg>';
    var svg = el.firstChild, q = function(s){ return svg.querySelector(s); };
    var archer = Archer(q('.ti-archer')), arc = q('.tid-arc'), corde = q('.tid-corde'), enc = q('.tid-enc'), fl = q('.tid-fl'), c = q('.tid-c'), fil = q('.tid-fil'), jauge = q('.rg-jauge'), guir = q('.tid-guir'), gfil = guir.querySelector('path');
    var ptsG = Array.prototype.slice.call(svg.querySelectorAll('.rg-pt')), main = q('.mja-main');
    var puD = q('.tid-pu'), puDr = puD.querySelector('.ti-pu-rempli'), puDm = puD.querySelector('.ti-pu-mot'), filM = q('.tid-film');
    var cbG = q('.tid-cb'), plG = q('.tid-plumes'), pls = Array.prototype.slice.call(svg.querySelectorAll('.tid-pl')), unG = q('.tid-un'), deuxG = q('.tid-deux'), CB = bez(0.52);
    var drap = []; for(var j = 0; j < 22; j++){ var d = svgNoeud('path', {'class':'ti-g-drap', d:'M-5,0 L5,0 L0,10 Z', fill:COUL_DRAP[j % COUL_DRAP.length], display:'none'}, guir); drap.push(d); }
    main.style.transition = 'none';
    var P0 = 6.4, T_LACHE = 2.0, VOL = 0.7;
    var stop = U.boucle(function(dt, T){
      if(!svg.isConnected) return false;
      var t = T % P0, tire = t > 0.9 && t < T_LACHE ? lisse((t - 0.9) / 0.9) : 0, fort = tire > 0.97;
      var a = VISEE;
      arc.setAttribute('transform', 'rotate(' + f1(a * 57.3) + ')');
      corde.setAttribute('d', 'M0,-38 L' + f1(-tire * 26) + ',0 L0,38');
      enc.setAttribute('transform', 'translate(' + f1(-tire * 26 + 22) + ',0)');
      enc.setAttribute('opacity', t < T_LACHE || t > 4 ? 1 : 0);
      jauge.setAttribute('stroke', fort ? '#ffd36a' : (tire > 0.75 ? '#ff9a3c' : (tire > 0.45 ? '#f6d23a' : '#7cd3a0'))); jauge.setAttribute('stroke-dasharray', f1(tire * 289) + ' 400'); jauge.setAttribute('opacity', tire > 0 ? 1 : 0);
      var nivD = tire <= 0 ? '' : (fort ? 'max' : (tire > 0.75 ? 'fort' : (tire > 0.45 ? 'moyen' : 'faible')));
      if(nivD !== puD._n){ puD._n = nivD; puD.setAttribute('class', 'ti-puiss tid-pu' + (nivD ? ' on ti-pu-' + nivD : '')); puDm.textContent = nivD ? {faible:'Faible', moyen:'Moyen', fort:'Fort', max:'Super flèche ×2'}[nivD] : ''; }
      puDr.setAttribute('y', f1(370 - 140 * tire)); puDr.setAttribute('height', f1(140 * tire));
      if(filM){ var fm = fil; filM.setAttribute('x1', fm.getAttribute('x1')); filM.setAttribute('y1', fm.getAttribute('y1')); filM.setAttribute('x2', fm.getAttribute('x2')); filM.setAttribute('y2', fm.getAttribute('y2')); filM.setAttribute('opacity', t > T_LACHE + VOL ? 0 : 1); }
      ptsG.forEach(function(p, i){ p.setAttribute('opacity', tire > i / 14 ? 1 : 0); p.setAttribute('fill', fort ? '#ffd36a' : '#fffdf4'); });
      archer.poser(a, tire, T, 0, t > T_LACHE + VOL && t < 4.4 ? 'content' : '');
      /* la main : elle se pose près de l'arc, tire vers l'arrière, lâche */
      var mx = t < 0.9 ? 230 + (Bc[0] + 6 - 230) * lisse(t / 0.9) : (t < T_LACHE ? Bc[0] + 6 - Math.cos(a) * tire * 60 : Bc[0] + 6 - Math.cos(a) * 60 + (230 - Bc[0]) * lisse((t - T_LACHE) / 0.8));
      var my = t < 0.9 ? 400 + (Bc[1] + 8 - 400) * lisse(t / 0.9) : (t < T_LACHE ? Bc[1] + 8 - Math.sin(a) * tire * 60 : Bc[1] + 8 - Math.sin(a) * 60 + (400 - Bc[1]) * lisse((t - T_LACHE) / 0.8));
      main.style.transform = 'translate(' + f1(mx - 4) + 'px,' + f1(my - 40) + 'px)';
      main.classList.toggle('appuie', t > 0.9 && t < T_LACHE);
      var s = (t - T_LACHE) / VOL;
      if(s > 0 && s < 1){ var b = bez(s); fl.setAttribute('opacity', 1); fl.setAttribute('transform', 'translate(' + f1(b[0] - 20) + ',' + f1(b[1] - 40) + ') rotate(' + f1(tang(s) * 57.3) + ')'); fl.setAttribute('transform', 'translate(' + f1(b[0]) + ',' + f1(b[1]) + ') rotate(' + f1(tang(s) * 57.3) + ')'); }
      else fl.setAttribute('opacity', 0);
      /* le corbeau traversé par la super flèche : il s'envole (« 1 »), puis la flèche atteint la cible (« 2 ») */
      var tPasse = T_LACHE + VOL * 0.52, dp = t - tPasse;
      if(dp < 0 || t > 6){ cbG.setAttribute('transform', 'translate(' + f1(CB[0] + Math.sin(T * 1.7) * 6) + ',' + f1(CB[1] + Math.sin(T * 3.4) * 3) + ')'); cbG.setAttribute('opacity', t > 6 ? f1(Math.min(1, (t - 6) / 0.3)) : 1); plG.setAttribute('opacity', 0); }
      else { cbG.setAttribute('transform', 'translate(' + f1(CB[0] + dp * 150) + ',' + f1(CB[1] - dp * 190) + ') scale(-1,1)'); cbG.setAttribute('opacity', f1(Math.max(0, 1 - dp / 1.2))); plG.setAttribute('opacity', f1(Math.max(0, 1 - dp / 1.4))); pls.forEach(function(pl, i){ pl.setAttribute('transform', 'translate(' + f1(CB[0] + (i - 1) * 14 * dp) + ',' + f1(CB[1] + dp * 50 + i * 4) + ') rotate(' + f0(dp * 200 * (i - 1)) + ')'); }); }
      unG.setAttribute('opacity', dp > 0 && t < 4.6 ? 1 : 0); unG.setAttribute('transform', 'translate(' + f1(CB[0]) + ',' + f1(CB[1] - 26) + ')');
      deuxG.setAttribute('opacity', t > T_LACHE + VOL && t < 4.6 ? 1 : 0); deuxG.setAttribute('transform', 'translate(' + f1(FIN[0] + 14) + ',' + f1(FIN[1] - 22) + ')');
      /* la cible */
      var touche = t > T_LACHE + VOL;
      if(BAND){
        var lp = []; if(s > 0){ var smax = Math.min(1, s); for(var k = 0; k <= 12; k++){ var bq = bez(k / 12 * smax); lp.push(bq); } }
        if(touche){ var u = Math.min(1, (t - T_LACHE - VOL) / 0.5), e1 = 1 - Math.pow(1 - u, 3), a0 = [Bc[0] + (MAT.x - Bc[0]) * e1, Bc[1] + (MAT.y - Bc[1]) * e1]; lp = []; for(var k2 = 0; k2 <= 14; k2++){ var w = k2 / 14; lp.push([a0[0] + (CIB[0] - a0[0]) * w, a0[1] + (CIB[1] + 6 - a0[1]) * w + 22 * 4 * w * (1 - w)]); } }
        gfil.setAttribute('d', lp.length > 1 ? 'M' + lp.map(function(q){ return f1(q[0]) + ',' + f1(q[1]); }).join(' L') : '');
        var ds = []; for(var m = 1; m < lp.length && ds.length < drap.length; m++){ ds.push([(lp[m][0] + lp[m - 1][0]) / 2, (lp[m][1] + lp[m - 1][1]) / 2, Math.atan2(lp[m][1] - lp[m - 1][1], lp[m][0] - lp[m - 1][0])]); }
        drap.forEach(function(d, i){ if(i < ds.length && t < 6){ d.setAttribute('display', 'inline'); d.setAttribute('transform', 'translate(' + f1(ds[i][0]) + ',' + f1(ds[i][1]) + ') rotate(' + f1(ds[i][2] * 57.3 + Math.sin(T * 6 + i) * 10) + ')'); } else d.setAttribute('display', 'none'); });
        c.setAttribute('transform', 'translate(' + CIB[0] + ',' + f1(CIB[1] + Math.sin(T * 2) * 2) + ')');
      } else {
        var ax = NOEUD[0], ay = NOEUD[1], bx = CIB[0] + Math.sin(T * 1.6) * 4, by = CIB[1];
        if(touche){ var u3 = Math.min(1, (t - T_LACHE - VOL) / 2.2); bx = CIB[0] + (244 - CIB[0]) * lisse(u3); by = CIB[1] - 20 * Math.sin(Math.min(1, u3 * 3) * Math.PI / 2) * (1 - u3) + (SOL - 52 - CIB[1]) * Math.pow(u3, 1.4); fil.setAttribute('x1', f1(bx)); fil.setAttribute('y1', f1(by + 20)); fil.setAttribute('x2', f1(bx)); fil.setAttribute('y2', f1(by + 56)); }
        else { fil.setAttribute('x1', ax); fil.setAttribute('y1', ay); fil.setAttribute('x2', f1(bx + (ax - bx) * 0.26)); fil.setAttribute('y2', f1(by + (ay - by) * 0.26)); }
        c.setAttribute('transform', 'translate(' + f1(bx) + ',' + f1(by) + ') rotate(' + f1(Math.sin(T * 3) * 8) + ')');
      }
    });
    return {arreter:function(){ stop(); }};
  }};
}
})();
