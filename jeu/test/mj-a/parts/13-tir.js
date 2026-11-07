
/* ==========================================================
   TIR À L'ARC (Pisteur) — on bande l'arc comme un lance-pierre :
   poser le doigt n'importe où, tirer vers l'arrière, lâcher. La
   direction ET la puissance viennent du geste. La flèche suit une
   courbe (gravité + vent). Cibles qui bougent : lanterne qui se
   balance, corbeau qui vole en huit (il lâche ce qu'il a volé),
   corde d'un sac à couper (petit point précis), pomme sur une
   branche. Obstacles : branches qui bougent, petits oiseaux.
   Flèches limitées ; au-delà du niveau 4, l'arc tremble si on le
   tient trop longtemps. Ralenti sur les tirs parfaits.
   Flèche bien tirée (Romain, 4 nov.) : l'arc bandé à fond (puissance
   ≥ PERCE, la jauge devient dorée et « À fond ! » s'affiche). Elle ne
   s'arrête pas à la première cible : elle traverse et touche toutes les
   cibles sur sa route (« Transpercé ! ×2 »). Les obstacles (branches,
   oiseaux), le sac lui-même et le sol l'arrêtent toujours. Un tir moins
   fort s'arrête à la première cible, comme avant.
   Mods : erreurs (+N flèches), fleches (+N, 99 = carquois sans fond),
   zone (cibles plus grosses), lent (tout bouge moins vite), stable
   (vent et tremblement ×), ralenti (N s de temps ralenti, une fois),
   temps (+N : ligne de visée plus longue),
   aide (N premiers tirs : trajectoire entière, vent compris),
   revele (toujours la trajectoire entière).
   ========================================================== */
var ARC = {g:560, v:610, tire:118, x:62, y:398};
var PERCE = 0.95;   /* puissance à partir de laquelle la flèche traverse les cibles (arc bandé à fond) */
var SLOTS_TIR = {
  lanterne:[{ax:205, ay:52, L:118}, {ax:292, ay:58, L:150}, {ax:150, ay:46, L:92}],
  sac:[{ax:300, ay:58, L:178}, {ax:232, ay:50, L:126}],
  pomme:[{x:262, y:128}, {x:318, y:178}, {x:178, y:150}],
  corbeau:[{cx:232, cy:160, ax:96, ay:52}, {cx:250, cy:250, ax:78, ay:40}, {cx:220, cy:112, ax:108, ay:34}]
};
var ART_TIR = {
  lanterne:'<g class="mja-lant"><path d="M-11,-18 L11,-18 L15,13 L-15,13 Z" fill="#ffd36a" stroke="' + CONTOUR + '" stroke-width="3.5" stroke-linejoin="round"/><path d="M-13,-24 L13,-24 L11,-18 L-11,-18 Z M-15,13 L15,13 L11,19 L-11,19 Z" fill="#b8862e" stroke="' + CONTOUR + '" stroke-width="3"/><path class="mja-lant-feu" d="M0,-10 C6,-3 6,4 0,8 C-6,4 -6,-3 0,-10 Z" fill="#e8693c"/><path d="M-7,-14 L-9,9" stroke="#fff" stroke-width="2.5" opacity=".6" stroke-linecap="round"/></g>',
  sac:'<path d="M-15,-8 C-22,6 -20,22 0,23 C20,22 22,6 15,-8 C10,-14 -10,-14 -15,-8 Z" fill="#b07a3c" stroke="' + CONTOUR + '" stroke-width="3.5"/><path d="M-9,-13 L9,-13 L6,-18 L-6,-18 Z" fill="#8a5a33" stroke="' + CONTOUR + '" stroke-width="3"/><path d="M-6,4 C-2,8 4,8 8,3" stroke="#7d5428" stroke-width="2.5" fill="none" stroke-linecap="round"/><circle cx="-4" cy="10" r="3.4" fill="#ffd36a" stroke="' + CONTOUR + '" stroke-width="1.5"/>',
  pomme:'<path d="M0,-14 C-3,-19 -15,-19 -16,-8 C-18,4 -8,12 0,9 C8,12 18,4 16,-8 C15,-19 3,-19 0,-14 Z" fill="#e5484d" stroke="' + CONTOUR + '" stroke-width="3.5"/><path d="M-9,-9 C-9,-12 -7,-14 -4,-14" stroke="#fff" stroke-width="2.5" fill="none" stroke-linecap="round" opacity=".7"/><path d="M0,-14 L1,-22" stroke="#5e3a1e" stroke-width="3"/><path d="M1,-20 C6,-27 13,-24 13,-22 C8,-18 5,-18 1,-20 Z" fill="#5fcf86" stroke="' + CONTOUR + '" stroke-width="2"/>',
  corbeau:'<g class="mja-ailes"><path d="M-4,-2 C-18,-22 -34,-20 -40,-10 C-28,-10 -18,-4 -10,4 Z" fill="#2a2440" stroke="' + CONTOUR + '" stroke-width="3"/><path d="M4,-2 C18,-22 34,-20 40,-10 C28,-10 18,-4 10,4 Z" fill="#2a2440" stroke="' + CONTOUR + '" stroke-width="3"/></g><path d="M-12,2 L-22,-2 L-20,6 Z" fill="#1d1730" stroke="' + CONTOUR + '" stroke-width="2.5"/><ellipse cx="0" cy="2" rx="13" ry="10" fill="#1d1730" stroke="' + CONTOUR + '" stroke-width="3"/><circle cx="10" cy="-5" r="8" fill="#1d1730" stroke="' + CONTOUR + '" stroke-width="3"/><path d="M16,-6 L26,-3 L16,-1 Z" fill="#f6b23a" stroke="' + CONTOUR + '" stroke-width="2"/><circle cx="12" cy="-7" r="2.2" fill="#ffd36a"/><g class="mja-butin"><path d="M2,14 L2,24 M-1,22 L5,22 M2,18 L6,18" stroke="#ffd36a" stroke-width="3" stroke-linecap="round"/><circle cx="2" cy="11" r="3.5" fill="none" stroke="#ffd36a" stroke-width="2.5"/></g>'
};
var FLECHE_ART = '<path d="M-30,0 L4,0" stroke="#c99a5e" stroke-width="3.2" stroke-linecap="round"/><path d="M-30,0 L-24,0" stroke="' + CONTOUR + '" stroke-width="1" /><path d="M2,-5 L12,0 L2,5 Z" fill="#dfe6ff" stroke="' + CONTOUR + '" stroke-width="2" stroke-linejoin="round"/><path d="M-30,0 L-36,-6 L-26,-1 M-30,0 L-36,6 L-26,1" stroke="#8ff3ff" stroke-width="2.6" stroke-linecap="round" fill="none"/>';
/* la flèche en main et en vol : un halo doré s'allume quand l'arc est bandé à fond (elle transperce) */
var FLECHE_FORTE = '<path class="mja-fl-halo" d="M-36,0 L14,0"/>' + FLECHE_ART;
function plumeSVG(c){ return '<path d="M0,-9 C5,-5 5,5 0,9 C-5,5 -5,-5 0,-9 Z M0,-9 L0,10" fill="' + (c || '#2a2440') + '" stroke="' + CONTOUR + '" stroke-width="1.5"/>'; }
function distSeg(p, a, b){
  var dx = b.x - a.x, dy = b.y - a.y, l2 = dx * dx + dy * dy, t = l2 ? fixe(((p.x - a.x) * dx + (p.y - a.y) * dy) / l2, 0, 1) : 0;
  var x = a.x + dx * t - p.x, y = a.y + dy * t - p.y;
  return {d:Math.sqrt(x * x + y * y), t:t};
}
function decorTir(id){
  var s = '<defs><linearGradient id="' + id + 'c" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#121735"/><stop offset=".7" stop-color="#2d3e66"/><stop offset="1" stop-color="#4a5a86"/></linearGradient>' +
    '<radialGradient id="' + id + 'l" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#fff4d0" stop-opacity=".35"/><stop offset="1" stop-color="#fff4d0" stop-opacity="0"/></radialGradient></defs>' +
    '<rect x="' + DEC.x + '" y="' + DEC.y + '" width="' + DEC.w + '" height="' + DEC.h + '" fill="url(#' + id + 'c)"/>';
  for(var i = 0; i < 40; i++){ s += '<circle class="mja-etoile" cx="' + U.rand(-230, 590).toFixed(0) + '" cy="' + U.rand(-210, 280).toFixed(0) + '" r="' + U.rand(.8, 2).toFixed(1) + '" fill="#eef0ff" style="animation-delay:-' + U.rand(0, 3).toFixed(1) + 's"/>'; }
  s += '<circle cx="96" cy="96" r="70" fill="url(#' + id + 'l)"/><circle cx="96" cy="96" r="26" fill="#fff4d0" opacity=".92"/><circle cx="88" cy="90" r="5" fill="#e8dcb0" opacity=".7"/>';
  s += '<path d="M-260,330 C-160,300 -60,316 40,300 C140,284 240,306 340,290 C440,276 520,300 620,288 L620,720 L-260,720 Z" fill="#22324e"/>';
  s += '<path d="M-260,372 C-150,352 -40,368 70,354 C180,342 280,358 380,350 C470,342 540,356 620,350 L620,720 L-260,720 Z" fill="#1f3a30"/>';
  s += '<path d="M-260,420 C-100,404 100,410 200,416 C300,422 460,404 620,414 L620,720 L-260,720 Z" fill="#2b5038" stroke="' + CONTOUR + '" stroke-width="3"/>';
  for(var k = 0; k < 30; k++){ var x = U.rand(-240, 600), y = U.rand(426, 600); s += '<path d="M' + x.toFixed(0) + ',' + y.toFixed(0) + ' l-4,-10 M' + x.toFixed(0) + ',' + y.toFixed(0) + ' l1,-13 M' + x.toFixed(0) + ',' + y.toFixed(0) + ' l5,-9" stroke="#5fcf86" stroke-width="2.4" stroke-linecap="round" opacity=".7"/>'; }
  /* le grand arbre à droite et sa branche maîtresse */
  s += '<path d="M352,720 L346,250 C344,170 360,110 400,70 L430,90 C400,130 392,190 396,250 L402,720 Z" fill="#5e3a1e" stroke="' + CONTOUR + '" stroke-width="4"/>';
  s += '<path d="M380,96 C320,44 220,34 120,40" stroke="' + CONTOUR + '" stroke-width="18" fill="none" stroke-linecap="round"/><path d="M380,96 C320,44 220,34 120,40" stroke="#7a4e2c" stroke-width="12" fill="none" stroke-linecap="round"/><path d="M200,38 C230,34 262,36 290,44" stroke="#a06a3c" stroke-width="3" fill="none" stroke-linecap="round"/>';
  [[120,40,26],[150,26,30],[100,24,22],[400,40,54],[440,90,48],[370,16,40],[470,30,44],[430,150,40]].forEach(function(b){ s += '<circle cx="' + b[0] + '" cy="' + b[1] + '" r="' + b[2] + '" fill="#1f5a40" stroke="' + CONTOUR + '" stroke-width="4"/><circle cx="' + (b[0] + b[2] * .25) + '" cy="' + (b[1] - b[2] * .3) + '" r="' + (b[2] * .5) + '" fill="#2a7050" opacity=".8"/>'; });
  return s;
}
function archerSVG(){
  return '<g class="mja-archer" transform="translate(' + ARC.x + ',' + ARC.y + ')">' +
    '<ellipse cx="-14" cy="30" rx="30" ry="7" fill="#000" opacity=".3"/>' +
    '<path d="M-24,28 L-20,4 M-8,28 L-12,4" stroke="#3b2a3e" stroke-width="8" stroke-linecap="round"/>' +
    '<path d="M-30,6 C-32,-20 -24,-32 -14,-34 C-4,-32 2,-20 0,6 Z" fill="#2f7a4c" stroke="' + CONTOUR + '" stroke-width="4" stroke-linejoin="round"/>' +
    '<path d="M-26,-30 L-38,-4" stroke="#8a5a33" stroke-width="7" stroke-linecap="round"/><path d="M-30,-34 l-6,-8 M-27,-34 l-1,-10 M-24,-33 l4,-8" stroke="#8ff3ff" stroke-width="2.5" stroke-linecap="round"/>' +
    '<circle cx="-14" cy="-44" r="12" fill="#ffe0c2" stroke="' + CONTOUR + '" stroke-width="4"/>' +
    '<path d="M-28,-44 C-28,-62 2,-62 0,-44 C-6,-50 -20,-52 -28,-44 Z" fill="#3c9a62" stroke="' + CONTOUR + '" stroke-width="3.5"/>' +
    '<circle cx="-8" cy="-44" r="2" fill="' + CONTOUR + '"/>' +
  '</g>';
}
MJ.enregistrer('tir', {
  nom:'Tir à l\'arc', role:'pisteur', ic:'🏹',
  consigne:'Pose ton doigt, tire vers l\'arrière comme un lance-pierre et lâche : touche toutes les cibles avant d\'avoir vidé ton carquois ! Tirée à fond, la flèche transperce toutes les cibles sur sa route.',
  minuteur:false,
  reglages: function(n, mods){
    var p = {};
    var listes = {1:['lanterne', 'pomme'], 2:['lanterne', 'pomme', 'lanterne'], 3:['lanterne', 'corbeau', 'pomme'], 4:['lanterne', 'corbeau', 'sac'],
      5:['lanterne', 'corbeau', 'sac', 'pomme'], 6:['lanterne', 'corbeau', 'sac', 'corbeau'], 7:['sac', 'corbeau', 'lanterne', 'corbeau', 'pomme'],
      8:['sac', 'corbeau', 'lanterne', 'corbeau', 'pomme'], 9:['sac', 'corbeau', 'corbeau', 'lanterne', 'sac']};
    p.cibles = (listes[Math.min(9, n)] || listes[9]).slice();
    if(n >= 11) p.cibles.push('corbeau');
    /* au niveau 10 (adultes, enquête 10), encore une flèche de réserve : sans elle, une seule flèche ratée = perdu (robot : 1 partie sur 8) */
    var reserve = Math.floor(courbe(n, {1:4, 3:2, 6:2, 9:1, 10:1, 12:0}) + 0.001);
    p.fleches = p.cibles.length + reserve + (mods.erreurs || 0) + (mods.fleches || 0);
    if((mods.fleches || 0) >= 99) p.fleches = 99;
    var lent = mods.lent || 1, stable = mods.stable === undefined ? 1 : mods.stable;
    p.vitesse = courbe(n, {1:0.5, 3:0.78, 6:1.08, 9:1.42, 12:1.7}) * lent;
    p.rayon = courbe(n, {1:19, 3:15.5, 6:13, 9:11, 12:10}) * (mods.zone || 1);
    p.corde = courbe(n, {1:7, 4:5.5, 9:4.2, 12:3.6}) * (mods.zone || 1);
    p.vent = courbe(n, {1:0, 2:0, 3:38, 6:88, 9:130, 12:165}) * stable;
    p.rafales = n >= 6;
    p.apercu = courbe(n, {1:1.15, 3:0.42, 6:0.24, 9:0.13, 12:0.08}) + 0.12 * Math.min(5, mods.temps || 0);
    p.branches = entier(n, {1:0, 3:1, 7:1, 8:2});
    p.oiseaux = n >= 5 ? courbe(n, {5:4.5, 6:3.6, 9:2.1, 12:1.5}) : 0;
    p.tenue = n >= 4 ? courbe(n, {4:3.2, 6:2.4, 9:1.5, 12:1.1}) : 99;
    p.tremble = courbe(n, {4:2.5, 6:3.5, 9:5.5, 12:7}) * stable;
    p.ralenti = mods.ralenti || 0;
    p.revele = !!mods.revele;
    p.aide = mods.aide || 0;
    var noms = {lanterne:'🏮', pomme:'🍎', corbeau:'🐦‍⬛', sac:'🪢'};
    p.lignes = [
      {nom:'Cibles', val:p.cibles.map(function(c){ return noms[c] || c; }).join(' ')},
      {nom:'Flèches', val:p.fleches >= 99 ? '∞' : p.fleches + ' (' + (p.fleches - p.cibles.length) + ' de réserve)'},
      {nom:'Vent', val:p.vent < 5 ? 'aucun' : (p.vent < 60 ? 'léger' : (p.vent < 110 ? 'fort' : 'tempête')) + (p.rafales && p.vent >= 5 ? ', en rafales' : '')},
      {nom:'Ligne de visée', val:p.revele ? 'complète' : (p.apercu > 0.8 ? 'longue' : (p.apercu > 0.3 ? 'moyenne' : 'très courte'))},
      {nom:'L\'arc tremble après', val:p.tenue > 50 ? 'jamais' : txtS(p.tenue)},
      {nom:'Flèche tirée à fond', val:'transperce les cibles'}
    ];
    return p;
  },
  demo: function(el){
    el.innerHTML = '<svg class="mja-demo-svg" viewBox="0 0 300 170" preserveAspectRatio="xMidYMid meet"><rect x="-60" width="420" height="170" fill="#1f2d4a"/><rect x="-60" y="146" width="420" height="30" fill="#2b5038"/>' +
      '<path d="M300,24 C260,14 220,12 190,14" stroke="#7a4e2c" stroke-width="8" fill="none" stroke-linecap="round"/><line class="dc" x1="232" y1="14" x2="232" y2="60" stroke="#c9c2e0" stroke-width="2"/><g class="dl">' + ART_TIR.lanterne + '</g>' +
      '<g class="da" transform="translate(52,112)"><path d="M0,-30 C16,-22 16,22 0,30" stroke="#8a5a33" stroke-width="5" fill="none" stroke-linecap="round"/><path class="ds" d="M0,-30 L0,30" stroke="#eee" stroke-width="1.6" fill="none"/></g>' +
      '<g class="dp"></g><g class="df" opacity="0">' + FLECHE_ART + '</g>' + MAIN + '</svg>';
    var svg = el.querySelector('svg'), l = svg.querySelector('.dl'), corde = svg.querySelector('.dc'), a = svg.querySelector('.da'), s = svg.querySelector('.ds'), pts = svg.querySelector('.dp'), f = svg.querySelector('.df'), main = svg.querySelector('.mja-main');
    main.style.transition = 'none';
    var X0 = 52, Y0 = 112, vx = 205, vy = -140, g = 160;
    return demoBoucle(svg, function(dt, t){
      var c = t % 3.6, ang = Math.sin(t * 2.2) * 0.35, lx = 232 + Math.sin(ang) * 46, ly = 14 + Math.cos(ang) * 46;
      corde.setAttribute('x2', lx.toFixed(1)); corde.setAttribute('y2', (ly - 14).toFixed(1));
      l.setAttribute('transform', 'translate(' + lx.toFixed(1) + ',' + ly.toFixed(1) + ') scale(.8)');
      var tire = c < 0.4 ? 0 : (c < 1.5 ? (c - 0.4) / 1.1 : 0);
      var ar = Math.atan2(vy, vx) * 180 / Math.PI;
      a.setAttribute('transform', 'translate(' + X0 + ',' + Y0 + ') rotate(' + ar.toFixed(1) + ')');
      s.setAttribute('d', 'M0,-30 L' + (-tire * 24).toFixed(1) + ',0 L0,30');
      var hx = X0 - 18 - tire * 34, hy = Y0 + 4 + tire * 22;
      main.style.transform = 'translate(' + hx.toFixed(1) + 'px,' + hy.toFixed(1) + 'px)';
      main.classList.toggle('appuie', tire > 0);
      var dots = '';
      if(tire > 0.3){ for(var k = 1; k < 9; k++){ var tt = k * 0.08; dots += '<circle cx="' + (X0 + vx * tt).toFixed(1) + '" cy="' + (Y0 + vy * tt + 0.5 * g * tt * tt).toFixed(1) + '" r="2.4" fill="#8ff3ff" opacity="' + (1 - k / 10).toFixed(2) + '"/>'; } }
      pts.innerHTML = dots;
      if(c >= 1.5 && c < 2.6){
        var u = (c - 1.5) * 0.98, x = X0 + vx * u, y = Y0 + vy * u + 0.5 * g * u * u;
        f.setAttribute('opacity', '1');
        f.setAttribute('transform', 'translate(' + x.toFixed(1) + ',' + y.toFixed(1) + ') rotate(' + (Math.atan2(vy + g * u, vx) * 180 / Math.PI).toFixed(1) + ') scale(.8)');
      } else f.setAttribute('opacity', '0');
    });
  },
  jouer: function(el, p, fin){
    var P = Partie(fin);
    var hud = creerHud(el);
    hud.prog(0, p.cibles.length, '🎯');
    var badge = hud.badge(''); badge.classList.add('large');
    var terrain = U.html('<div class="mja-terrain mja-tir"></div>');
    el.appendChild(terrain);
    var id = nid('ti');
    terrain.innerHTML = '<svg viewBox="0 0 360 480" preserveAspectRatio="xMidYMid meet"><g class="mja-cam">' + decorTir(id) +
      '<g class="mja-vent-g" transform="translate(150,404)"><path d="M0,0 L0,-52" stroke="#c9c2e0" stroke-width="4" stroke-linecap="round"/><g class="mja-manche-g" transform="translate(0,-50)"><path class="mja-manche" d="M0,0 L34,4 L34,14 L0,18 Z" fill="#e8693c" stroke="' + CONTOUR + '" stroke-width="3"/><path d="M11,1.5 L11,16.5 M22,3 L22,15" stroke="#fff" stroke-width="3"/></g></g>' +
      '<g class="mja-feuilles"></g><g class="mja-cordes"></g><g class="mja-branches"></g><g class="mja-cibles-g"></g><g class="mja-oiseaux"></g><g class="mja-plantees"></g>' +
      '<g class="mja-apercu"></g><path class="mja-trainee" d=""/><g class="mja-fl-vol" opacity="0">' + FLECHE_FORTE + '</g><g class="mja-parts"></g>' +
      archerSVG() +
      '<g class="mja-arc-g" transform="translate(' + ARC.x + ',' + (ARC.y - 22) + ')"><circle class="mja-jauge-arc" r="44"/><g class="mja-arc-rot"><path d="M0,-38 C22,-28 22,28 0,38" stroke="#8a5a33" stroke-width="7" fill="none" stroke-linecap="round"/><path d="M0,-38 C22,-28 22,28 0,38" stroke="' + CONTOUR + '" stroke-width="1.6" fill="none"/><path class="mja-corde-arc" d="M0,-38 L0,38" stroke="#eee" stroke-width="2" fill="none"/><g class="mja-fl-encoche">' + FLECHE_FORTE + '</g></g>' +
        '<text class="mja-afond" x="4" y="-56" text-anchor="middle">À fond !</text></g>' +
    '</g></svg>' +
    (p.ralenti ? '<div class="mja-actions"><button class="btn magie mja-ralenti" type="button">⏳ Ralentir le temps (' + p.ralenti + ' s)</button></div>' : '');
    var svg = terrain.querySelector('svg');
    cadrer(P, svg, {ancre:'bas'});
    var cam = svg.querySelector('.mja-cam'), gCordes = svg.querySelector('.mja-cordes'), gCibles = svg.querySelector('.mja-cibles-g'), gBr = svg.querySelector('.mja-branches'), gOis = svg.querySelector('.mja-oiseaux');
    var gPl = svg.querySelector('.mja-plantees'), gAp = svg.querySelector('.mja-apercu'), trainee = svg.querySelector('.mja-trainee'), flVol = svg.querySelector('.mja-fl-vol'), gParts = svg.querySelector('.mja-parts');
    var arcRot = svg.querySelector('.mja-arc-rot'), cordeArc = svg.querySelector('.mja-corde-arc'), encoche = svg.querySelector('.mja-fl-encoche'), jaugeArc = svg.querySelector('.mja-jauge-arc'), manche = svg.querySelector('.mja-manche-g'), gFeuilles = svg.querySelector('.mja-feuilles'), aFond = svg.querySelector('.mja-afond');
    var ventBase = p.vent * (Math.random() < 0.5 ? -1 : 1);
    /* utiles : flèches qui ont touché au moins une cible ; maxPerce : le plus de cibles touchées par une seule flèche */
    var fleches = p.fleches, tirs = 0, touches = 0, utiles = 0, maxPerce = 0, fini = false, t = 0, echelle = 1, ralentiT = 0, slow = 1, slowCible = 1;
    var camZ = 1, camX = 180, camY = 240, camZc = 1, camXc = 180, camYc = 240, tenir = 0;
    function majCarquois(){ badge.innerHTML = '<span class="mja-carquois">🏹 ' + (fleches >= 99 ? '∞' : '× ' + fleches) + '</span>'; }
    majCarquois();
    /* Cibles */
    var utilises = {};
    var cibles = p.cibles.map(function(type){
      var k = utilises[type] || 0; utilises[type] = k + 1;
      var sl = SLOTS_TIR[type][k % SLOTS_TIR[type].length];
      var c = {type:type, s:sl, ph:U.rand(0, 6.28), w:U.rand(0.85, 1.15), touche:false};
      c.g = svgNoeud('g', {'class':'mja-cible t-' + type}, gCibles);
      c.art = svgNoeud('g', {'class':'mja-cible-art'}, c.g);
      c.art.innerHTML = ART_TIR[type] + '<circle class="mja-cible-halo" r="' + (type === 'sac' ? 26 : 24) + '"/>';
      if(type === 'lanterne' || type === 'sac') c.fil = svgNoeud('line', {'class':'mja-fil' + (type === 'sac' ? ' corde' : '')}, gCordes);
      if(type === 'pomme') c.tige = svgNoeud('path', {'class':'mja-tige'}, gCordes);
      return c;
    });
    function posCible(c, tt){
      var s = c.s, v = p.vitesse * c.w, q = {};
      if(c.type === 'lanterne' || c.type === 'sac'){
        var amp = c.type === 'sac' ? 0.34 : 0.46;
        var a = Math.sin(tt * 1.5 * v + c.ph) * amp;
        q.x = s.ax + Math.sin(a) * s.L; q.y = s.ay + Math.cos(a) * s.L; q.a = a;
        q.nx = s.ax + Math.sin(a) * (s.L - (c.type === 'sac' ? 19 : 25)); q.ny = s.ay + Math.cos(a) * (s.L - (c.type === 'sac' ? 19 : 25));
      } else if(c.type === 'pomme'){
        q.x = s.x + Math.sin(tt * 1.3 * v + c.ph) * 16 * Math.min(1.6, v); q.y = s.y + Math.sin(tt * 2.6 * v + c.ph) * 4; q.a = 0;
      } else {
        var u = tt * 0.75 * v + c.ph;
        q.x = s.cx + Math.sin(u) * s.ax; q.y = s.cy + Math.sin(2 * u) * s.ay; q.sens = Math.cos(u) >= 0 ? 1 : -1;
      }
      return q;
    }
    function dessinerCible(c){
      if(c.chute) return;
      var q = c.q = posCible(c, t);
      if(c.type === 'corbeau') c.g.setAttribute('transform', 'translate(' + q.x.toFixed(1) + ',' + q.y.toFixed(1) + ') scale(' + q.sens + ',1)');
      else c.g.setAttribute('transform', 'translate(' + q.x.toFixed(1) + ',' + q.y.toFixed(1) + ') rotate(' + (-(q.a || 0) * 57.3).toFixed(1) + ')');
      if(c.fil){ c.fil.setAttribute('x1', c.s.ax); c.fil.setAttribute('y1', c.s.ay); c.fil.setAttribute('x2', q.nx.toFixed(1)); c.fil.setAttribute('y2', q.ny.toFixed(1)); }
      if(c.tige) c.tige.setAttribute('d', 'M' + (c.s.x + 4) + ',' + (c.s.x > 330 ? 70 : 44) + ' Q' + (c.s.x - 6) + ',' + ((c.s.y + 40) / 2).toFixed(0) + ' ' + q.x.toFixed(1) + ',' + (q.y - 20).toFixed(1));
    }
    /* Branches mobiles (obstacles) */
    var branches = [];
    for(var b = 0; b < p.branches; b++){
      var gauche = b % 2 === 1;
      var br = {bx:gauche ? -10 : 368, by:gauche ? 250 : 318, L:gauche ? 120 : 150, a0:gauche ? -0.12 : Math.PI + 0.18, ph:U.rand(0, 6), amp:0.22 + 0.04 * b, gauche:gauche};
      br.g = svgNoeud('g', {'class':'mja-branche'}, gBr);
      br.g.innerHTML = '<path d="M0,0 C' + (br.L * 0.4) + ',-8 ' + (br.L * 0.7) + ',6 ' + br.L + ',0" stroke="' + CONTOUR + '" stroke-width="13" fill="none" stroke-linecap="round"/><path d="M0,0 C' + (br.L * 0.4) + ',-8 ' + (br.L * 0.7) + ',6 ' + br.L + ',0" stroke="#7a4e2c" stroke-width="8" fill="none" stroke-linecap="round"/>' +
        [0.45, 0.72, 0.98].map(function(f, i){ return '<g transform="translate(' + (br.L * f) + ',' + (i % 2 ? -6 : 4) + ')"><circle r="' + (17 - i * 2) + '" fill="#2a7050" stroke="' + CONTOUR + '" stroke-width="3.5"/><circle cx="4" cy="-5" r="' + (8 - i) + '" fill="#3c9a62"/></g>'; }).join('') + '<g class="mja-br-fl"></g>';
      br.fl = br.g.querySelector('.mja-br-fl');
      branches.push(br);
    }
    function angBranche(br, tt){ return br.a0 + Math.sin((tt === undefined ? t : tt) * 0.9 * p.vitesse + br.ph) * br.amp; }
    function collBranche(br, x, y, tt){
      var a = angBranche(br, tt), ca = Math.cos(a), sa = Math.sin(a);
      var lx = (x - br.bx) * ca + (y - br.by) * sa, ly = -(x - br.bx) * sa + (y - br.by) * ca;
      if(lx < br.L * 0.3 || lx > br.L + 16) return null;
      return Math.abs(ly) < 15 ? {lx:lx, ly:ly} : null;
    }
    /* Oiseaux (obstacles) */
    var oiseaux = [], prochainOiseau = p.oiseaux ? U.rand(1.2, p.oiseaux) : 1e9;
    function lancerOiseau(){
      var dir = Math.random() < 0.5 ? 1 : -1, y = U.rand(110, 330), v = U.rand(80, 150) * p.vitesse;
      var o = {x:dir > 0 ? -250 : 610, y:y, vx:dir * v, ph:U.rand(0, 6)};
      o.g = svgNoeud('g', {'class':'mja-oiseau'}, gOis);
      o.g.innerHTML = '<g transform="scale(' + (dir > 0 ? 1 : -1) + ',1)"><g class="mja-ailes"><path d="M-2,-1 C-8,-11 -15,-10 -18,-5 C-12,-5 -8,-2 -4,2 Z M2,-1 C8,-11 15,-10 18,-5 C12,-5 8,-2 4,2 Z" fill="#c9a77a" stroke="' + CONTOUR + '" stroke-width="2"/></g><ellipse rx="7" ry="5.5" fill="#d9b48a" stroke="' + CONTOUR + '" stroke-width="2"/><circle cx="6" cy="-3" r="4" fill="#d9b48a" stroke="' + CONTOUR + '" stroke-width="2"/><path d="M9,-3 L13,-2 L9,-1 Z" fill="#f6b23a"/></g>';
      oiseaux.push(o);
    }
    /* Feuilles qui montrent le vent */
    var feuilles = [];
    if(Math.abs(ventBase) > 5){
      for(var f = 0; f < 7; f++){ var fe = {x:U.rand(-240, 600), y:U.rand(60, 400), ph:U.rand(0, 6), v:U.rand(0.6, 1.2)}; fe.g = svgNoeud('path', {'class':'mja-feuille', d:'M0,0 c4,-6 11,-6 13,0 c-4,4 -9,4 -13,0 Z'}, gFeuilles); feuilles.push(fe); }
    }
    function ventA(tt){ return p.rafales ? ventBase * (0.7 + 0.45 * Math.sin(tt * 0.8) + 0.2 * Math.sin(tt * 2.3)) : ventBase; }

    /* Particules (plumes, éclats, copeaux) */
    var parts = [];
    function particule(x, y, art, vx, vy, vie, g, rot){
      var q = {x:x, y:y, vx:vx, vy:vy, vie:vie, age:0, g:g === undefined ? 300 : g, r:U.rand(0, 360), vr:rot === undefined ? U.rand(-300, 300) : rot};
      q.el = svgNoeud('g', {}, gParts); q.el.innerHTML = art; parts.push(q); return q;
    }
    function eclats(x, y, sorte){
      var i;
      if(sorte === 'plumes'){ for(i = 0; i < 12; i++) particule(x, y, plumeSVG(i % 3 ? '#2a2440' : '#4a3f6a'), U.rand(-120, 120), U.rand(-160, 40), U.rand(1.2, 2), 70); }
      else if(sorte === 'verre'){ for(i = 0; i < 10; i++) particule(x, y, '<path d="M0,-4 L4,3 L-3,2 Z" fill="' + (i % 2 ? '#ffe3a3' : '#bff9ff') + '" stroke="' + CONTOUR + '" stroke-width="1"/>', U.rand(-160, 160), U.rand(-200, 20), U.rand(0.7, 1.2), 520); for(i = 0; i < 6; i++) particule(x, y, '<circle r="3" fill="#ffd36a"/>', U.rand(-60, 60), U.rand(-120, -40), 0.6, -40, 0); }
      else if(sorte === 'bois'){ for(i = 0; i < 6; i++) particule(x, y, '<path d="M-3,-1 L3,-1 L2,1 L-2,1 Z" fill="#c99a5e" stroke="' + CONTOUR + '" stroke-width=".8"/>', U.rand(-90, 90), U.rand(-140, -20), 0.7, 500); for(i = 0; i < 4; i++) particule(x, y, '<path d="M0,0 c3,-4 7,-4 8,0 c-3,3 -6,3 -8,0 Z" fill="#3c9a62"/>', U.rand(-60, 60), U.rand(-60, 10), 1.4, 90); }
      else if(sorte === 'pomme'){ for(i = 0; i < 7; i++) particule(x, y, '<circle r="2.6" fill="' + (i % 2 ? '#ffe9c0' : '#e5484d') + '"/>', U.rand(-120, 120), U.rand(-160, 0), 0.8, 480); }
      else if(sorte === 'etoiles'){ for(i = 0; i < 10; i++){ var a = i / 10 * 6.28; particule(x, y, '<path d="M0,-6 L1.6,-1.6 L6,0 L1.6,1.6 L0,6 L-1.6,1.6 L-6,0 L-1.6,-1.6 Z" fill="#ffe3a3"/>', Math.cos(a) * 170, Math.sin(a) * 170, 0.6, 0, 200); } }
    }
    /* Viser */
    var vise = null, enVol = null, apercuPts = [];
    for(var k = 0; k < 40; k++) apercuPts.push(svgNoeud('circle', {r:'2.6', 'class':'mja-pt', opacity:'0'}, gAp));
    function tirDepuis(v){
      var tirAng = Math.atan2(v.y, v.x), puis = Math.min(1, Math.sqrt(v.x * v.x + v.y * v.y) / ARC.tire);
      if(tenir > p.tenue){ var amp = Math.min(1, (tenir - p.tenue) / 1.5) * p.tremble * Math.PI / 180; tirAng += amp * (Math.sin(t * 9) + 0.5 * Math.sin(t * 13.7)); }
      return {ang:tirAng, puis:puis, vx:Math.cos(tirAng) * puis * ARC.v, vy:Math.sin(tirAng) * puis * ARC.v};
    }
    function pointeDepart(a){ return {x:ARC.x + Math.cos(a) * 14, y:ARC.y - 22 + Math.sin(a) * 14}; }
    P.ecoute(svg, 'pointerdown', function(e){
      if(fini || enVol || fleches <= 0) return;
      e.preventDefault();
      var pt = ptSVG(svg, e);
      vise = {x0:pt.x, y0:pt.y, x:pt.x, y:pt.y, id:e.pointerId};
      tenir = 0;
      try{ svg.setPointerCapture(e.pointerId); }catch(er){}
    });
    P.ecoute(svg, 'pointermove', function(e){ if(!vise || e.pointerId !== vise.id) return; var pt = ptSVG(svg, e); vise.x = pt.x; vise.y = pt.y; });
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
    /* Clavier (et robots de test) : flèches = viser, espace = tirer */
    var clav = {ang:-0.9, puis:0.75};
    P.ecoute(document, 'keydown', function(e){
      if(e.key === 'ArrowLeft') clav.ang -= 0.03; else if(e.key === 'ArrowRight') clav.ang += 0.03;
      else if(e.key === 'ArrowUp') clav.puis = Math.min(1, clav.puis + 0.03); else if(e.key === 'ArrowDown') clav.puis = Math.max(0.2, clav.puis - 0.03);
      else if(e.key === ' ' || e.key === 'Enter'){ if(!enVol && !fini && fleches > 0) tirer({ang:clav.ang, puis:clav.puis, vx:Math.cos(clav.ang) * clav.puis * ARC.v, vy:Math.sin(clav.ang) * clav.puis * ARC.v}); }
      else return;
      e.preventDefault();
    });
    terrain.mjaTirer = function(ang, puis){ if(enVol || fini || fleches <= 0) return false; tirer({ang:ang, puis:puis, vx:Math.cos(ang) * puis * ARC.v, vy:Math.sin(ang) * puis * ARC.v}); return true; };
    terrain.mjaEtat = function(){ return {t:t, vent:ventA(t), ventA:ventA, cibles:cibles.map(function(c){ return c.touche ? null : {type:c.type, q:posCible(c, t), c:c}; }), enVol:!!enVol, posCible:function(i, tt){ return posCible(cibles[i], tt); }, ARC:ARC, fleches:fleches, PERCE:PERCE, tirs:tirs, touches:touches, utiles:utiles, maxPerce:maxPerce,
      /* pour les robots : une branche ou un oiseau sera-t-il à cet endroit au temps tt ? */
      obstacle:function(x, y, tt){ var dto = tt === undefined ? 0 : tt - t; for(var b = 0; b < branches.length; b++) if(collBranche(branches[b], x, y, tt)) return true; for(var o = 0; o < oiseaux.length; o++) if(!oiseaux[o].fuit && dist({x:x, y:y}, {x:oiseaux[o].x + oiseaux[o].vx * dto, y:oiseaux[o].y}) < 20) return true; return false; }}; };

    function tirer(s){
      if(fleches < 99) fleches--;
      tirs++;
      majCarquois();
      U.son('fleche');
      var d = pointeDepart(s.ang), fort = s.puis >= PERCE;
      /* perce : tirée à fond, elle traverse les cibles ; nb : cibles déjà traversées */
      enVol = {x:d.x, y:d.y, vx:s.vx, vy:s.vy, hist:[], age:0, ralenti:false, perce:fort, nb:0};
      flVol.classList.toggle('puissante', fort); trainee.classList.toggle('puissante', fort);
      flVol.setAttribute('opacity', '1');
      cordeArc.classList.remove('vibre'); void cordeArc.getBoundingClientRect(); cordeArc.classList.add('vibre');
      encoche.setAttribute('opacity', '0');
      apercuPts.forEach(function(c){ c.setAttribute('opacity', '0'); });
    }
    function local(c, x, y){ var a = c.q.a || 0, dx = x - c.q.x, dy = y - c.q.y, ca = Math.cos(a), sa = Math.sin(a); return {x:dx * ca - dy * sa, y:dx * sa + dy * ca, a:a}; }
    function planter(x, y, ang, parent){
      var g = svgNoeud('g', {'class':'mja-plantee', transform:'translate(' + x.toFixed(1) + ',' + y.toFixed(1) + ') rotate(' + (ang * 57.3).toFixed(1) + ')'}, parent || gPl);
      g.innerHTML = '<g transform="translate(-8,0)">' + FLECHE_ART + '</g>';
      return g;
    }
    function finVol(){ enVol = null; flVol.setAttribute('opacity', '0'); trainee.setAttribute('d', ''); P.apres(250, function(){ if(!enVol) encoche.setAttribute('opacity', '1'); }); verifierFin(); }
    function verifierFin(){
      if(fini) return;
      var perdues = tirs - utiles, exploit = maxPerce >= 2 ? 'Une flèche en a transpercé ' + maxPerce + ' d\'un coup ! ' : '';
      if(touches >= cibles.length){ fini = true; P.finir({reussi:true, score:1, erreurs:perdues, transperce:maxPerce, detail:exploit + (perdues === 0 ? 'Pas une seule flèche perdue !' : 'Toutes les cibles sont tombées !')}, 1300); return; }
      if(fleches <= 0 && !enVol){ fini = true; P.finir({reussi:false, score:touches / cibles.length, erreurs:perdues, transperce:maxPerce, detail:'Plus de flèches dans le carquois…'}, 1000); }
    }
    function texte(x, y, s, cls){ var q = pctDans(svg, terrain, x, y); flotter(terrain, q.x, q.y, s, cls); }
    /* sansTexte : la flèche qui transperce affiche « Transpercé ! ×2 » à la place */
    function toucher(c, x, y, parfait, sansTexte){
      c.touche = true; touches++;
      hud.prog(touches, cibles.length, '🎯');
      U.son(parfait ? 'gain' : 'ok'); U.vibrer(25);
      c.g.classList.add('touchee');
      var msg, mx = x, my = y - 30;
      if(c.type === 'corbeau'){ eclats(x, y, 'plumes'); c.chute = {vx:U.rand(-40, 40), vy:-160, r:0}; msg = parfait ? 'Tir parfait ! Croâ !' : 'Croâ !'; }
      else if(c.type === 'lanterne'){ eclats(x, y, 'verre'); c.chute = {vx:0, vy:-40, r:0}; c.g.classList.add('eteinte'); msg = parfait ? 'Tir parfait !' : 'Touché !'; }
      else if(c.type === 'sac'){ eclats(x, y, 'bois'); c.chute = {vx:U.rand(-30, 30), vy:0, r:0}; if(c.fil) c.fil.classList.add('coupee'); msg = 'Corde coupée !'; mx = c.q.x; my = c.q.y - 40; }
      else { eclats(x, y, 'pomme'); c.chute = {vx:0, vy:0, r:0}; msg = parfait ? 'Tir parfait !' : 'Touché !'; }
      if(!sansTexte) texte(mx, my, msg, 'ok');
      if(parfait) eclats(x, y, 'etoiles');
      if(c.fil && c.type === 'lanterne') c.fil.classList.add('vide');
    }
    /* La flèche tirée à fond traverse la cible et continue sa route */
    function traverser(res){
      var vol = enVol; vol.nb++;
      if(vol.nb === 1) utiles++;
      maxPerce = Math.max(maxPerce, vol.nb);
      toucher(res.c, res.x, res.y, res.parfait, vol.nb >= 2);
      if(!res.parfait) eclats(res.x, res.y, 'etoiles');
      if(vol.nb >= 2){
        texte(res.x, res.y - 48, 'Transpercé ! ×' + vol.nb, 'perce');
        U.son('magie'); U.vibrer(60);
        [784, 988, 1175, 1568, 1976].slice(0, vol.nb + 1).forEach(function(f, i){ P.apres(i * 75, function(){ note(f, 0.3); }); });
      }
      /* fin du ralenti sur cette cible ; il peut repartir pour la suivante */
      if(vol.ralenti){ vol.ralenti = false; P.apres(380, function(){ if(enVol && enVol.ralenti) return; slowCible = 1; camZc = 1; camXc = 180; camYc = 240; }); }
    }
    function rater(x, y, quoi){
      erreurSensorielle(terrain);
      texte(x, y - 24, quoi, 'ko');
    }
    /* Une étape de vol : renvoie ce qui est touché (ignore : cibles déjà traversées, pour l'aperçu) */
    function collision(x, y, tt, ignore){
      for(var i = 0; i < cibles.length; i++){
        var c = cibles[i]; if(c.touche || (ignore && ignore.indexOf(c) >= 0)) continue;
        var q = posCible(c, tt);
        if(c.type === 'sac'){
          var seg = distSeg({x:x, y:y}, {x:c.s.ax, y:c.s.ay}, {x:q.nx, y:q.ny});
          if(seg.d < p.corde && seg.t > 0.08) return {c:c, parfait:true, x:x, y:y};
          if(dist({x:x, y:y}, q) < 19) return {rate:'sac', c:c, x:x, y:y};
        } else {
          var r = c.type === 'corbeau' ? p.rayon * 1.05 : p.rayon, dd = dist({x:x, y:y}, q);
          if(dd < r) return {c:c, parfait:dd < r * 0.42, x:x, y:y};
        }
      }
      for(var b = 0; b < branches.length; b++){ var h = collBranche(branches[b], x, y); if(h) return {branche:branches[b], local:h, x:x, y:y}; }
      for(var o = 0; o < oiseaux.length; o++){ var oi = oiseaux[o]; if(!oi.fuit && dist({x:x, y:y}, oi) < 13) return {oiseau:oi, x:x, y:y}; }
      if(y > 422 + Math.sin(x / 50) * 4) return {sol:true, x:x, y:y};
      if(x > 640 || x < -280 || y > 720) return {perdue:true, x:x, y:y};
      return null;
    }
    /* Prévision (pour le ralenti) */
    function prevoir(v, tt, duree){
      var s = {x:v.x, y:v.y, vx:v.vx, vy:v.vy}, h = 1 / 90;
      for(var k = 0; k < duree / h; k++){
        s.vx += ventA(tt) * h; s.vy += ARC.g * h; s.x += s.vx * h; s.y += s.vy * h; tt += h;
        var r = collision(s.x, s.y, tt); if(r) return r;
      }
      return null;
    }
    /* fort : arc bandé à fond, l'aperçu complet continue à travers les cibles (toutes surlignées) */
    function apercu(v, fort){
      var complet = p.revele || tirs < p.aide;
      var duree = complet ? 2.2 : p.apercu;
      var s = {x:v.x, y:v.y, vx:v.vx, vy:v.vy}, h = 1 / 60, n = 0, tt = t, vu = null, vues = [];
      for(var k = 0; k < duree / h && n < apercuPts.length; k++){
        if(complet) s.vx += ventA(tt) * h;
        s.vy += ARC.g * h; s.x += s.vx * h; s.y += s.vy * h; tt += h;
        if(k % 3 === 2){ var c = apercuPts[n++]; c.setAttribute('cx', s.x.toFixed(1)); c.setAttribute('cy', s.y.toFixed(1)); c.setAttribute('opacity', complet ? '0.9' : (1 - k * h / duree).toFixed(2)); }
        if(complet && !vu){ var r = collision(s.x, s.y, tt, vues); if(r){ if(fort && r.c && !r.rate) vues.push(r.c); else { vu = r; break; } } }
      }
      for(; n < apercuPts.length; n++) apercuPts[n].setAttribute('opacity', '0');
      cibles.forEach(function(c){ c.g.classList.toggle('visee', vues.indexOf(c) >= 0 || !!(vu && vu.c === c && !vu.rate)); });
    }

    P.boucle(function(dtR){
      if(fini && !parts.length && slow === 1) {/* on laisse finir les animations */}
      if(ralentiT > 0){ ralentiT -= dtR; if(ralentiT <= 0) terrain.classList.remove('ralenti'); }
      slow += (slowCible - slow) * Math.min(1, dtR * 10);
      var dt = dtR * slow * (ralentiT > 0 ? 0.35 : 1);
      t += dt;
      var vent = ventA(t);
      /* caméra */
      camZ += (camZc - camZ) * Math.min(1, dtR * 6); camX += (camXc - camX) * Math.min(1, dtR * 6); camY += (camYc - camY) * Math.min(1, dtR * 6);
      cam.setAttribute('transform', camZ > 1.01 ? 'translate(' + camX.toFixed(1) + ',' + camY.toFixed(1) + ') scale(' + camZ.toFixed(3) + ') translate(' + (-camX).toFixed(1) + ',' + (-camY).toFixed(1) + ')' : '');
      /* décor vivant */
      manche.setAttribute('transform', 'translate(0,-50) rotate(' + (vent >= 0 ? 0 : 180) + ' 0 9) scale(' + (0.35 + Math.min(1, Math.abs(vent) / 120) * 0.75).toFixed(2) + ',1)');
      feuilles.forEach(function(fe){
        fe.x += (vent * 1.1 + Math.sign(vent) * 30) * dt * fe.v; fe.y += Math.sin(t * 2 + fe.ph) * 20 * dt;
        if(fe.x > 610) fe.x = -250; if(fe.x < -250) fe.x = 610;
        fe.g.setAttribute('transform', 'translate(' + fe.x.toFixed(0) + ',' + fe.y.toFixed(0) + ') rotate(' + ((t * 160 * fe.v) % 360).toFixed(0) + ')');
      });
      cibles.forEach(function(c){
        if(c.chute){
          var ch = c.chute; ch.vy += 600 * dt; ch.r += (c.type === 'corbeau' ? 400 : 120) * dt;
          if(c.type === 'corbeau'){ ch.vy = Math.min(ch.vy, 60) - 900 * dt * (ch.r > 300 ? 1 : 0); }
          c.q.x += ch.vx * dt; c.q.y += ch.vy * dt;
          if(c.q.y < 700 && c.q.y > -300) c.g.setAttribute('transform', 'translate(' + c.q.x.toFixed(1) + ',' + c.q.y.toFixed(1) + ') rotate(' + ch.r.toFixed(0) + ')');
          else c.g.style.display = 'none';
          if(c.fil && c.type === 'lanterne'){ var a = Math.sin(t * 3) * 0.2; c.fil.setAttribute('x2', (c.s.ax + Math.sin(a) * 30).toFixed(1)); c.fil.setAttribute('y2', (c.s.ay + 30).toFixed(1)); }
          if(c.fil && c.type === 'sac'){ var a2 = Math.sin(t * 3) * 0.3; c.fil.setAttribute('x2', (c.s.ax + Math.sin(a2) * 40).toFixed(1)); c.fil.setAttribute('y2', (c.s.ay + 40).toFixed(1)); }
        } else dessinerCible(c);
      });
      branches.forEach(function(br){ br.g.setAttribute('transform', 'translate(' + br.bx + ',' + br.by + ') rotate(' + (angBranche(br) * 57.3).toFixed(1) + ')'); });
      if(p.oiseaux){ prochainOiseau -= dt; if(prochainOiseau <= 0){ lancerOiseau(); prochainOiseau = p.oiseaux * U.rand(0.7, 1.3); } }
      oiseaux = oiseaux.filter(function(o){
        o.x += o.vx * dt; o.y += (o.fuit ? -140 : Math.sin(t * 3 + o.ph) * 18) * dt;
        o.g.setAttribute('transform', 'translate(' + o.x.toFixed(1) + ',' + o.y.toFixed(1) + ')');
        if(o.x < -270 || o.x > 630 || o.y < -230){ o.g.parentNode.removeChild(o.g); return false; }
        return true;
      });
      /* l'arc */
      var ang = clav.ang, puis = 0;
      if(vise){
        tenir += dtR;
        var v = {x:(vise.x0 - vise.x), y:(vise.y0 - vise.y)};
        var s = tirDepuis(v); ang = s.ang; puis = s.puis;
        var d = pointeDepart(ang), fort = puis >= PERCE;
        apercu({x:d.x, y:d.y, vx:s.vx, vy:s.vy}, fort);
        jaugeArc.style.strokeDasharray = (puis * 276).toFixed(0) + ' 400';
        jaugeArc.classList.toggle('tremble', tenir > p.tenue);
        /* bandé à fond : jauge dorée, flèche dorée, « À fond ! » */
        if(fort !== !!vise.fort){ vise.fort = fort; jaugeArc.classList.toggle('fort', fort); gAp.classList.toggle('fort', fort); encoche.classList.toggle('fort', fort); aFond.classList.toggle('on', fort); if(fort){ U.son('tic'); U.vibrer(15); } }
      } else {
        jaugeArc.style.strokeDasharray = '0 400'; tenir = 0; cibles.forEach(function(c){ c.g.classList.remove('visee'); });
        if(jaugeArc.classList.contains('fort')){ jaugeArc.classList.remove('fort'); gAp.classList.remove('fort'); encoche.classList.remove('fort'); aFond.classList.remove('on'); }
      }
      if(vise || !enVol){ arcRot.setAttribute('transform', 'rotate(' + (ang * 57.3).toFixed(1) + ')'); }
      cordeArc.setAttribute('d', 'M0,-38 L' + (-puis * 26).toFixed(1) + ',0 L0,38');
      encoche.setAttribute('transform', 'translate(' + (-puis * 26 + 22).toFixed(1) + ',0)');
      /* la flèche */
      if(enVol){
        var sub = 4, h = dt / sub, res = null;
        for(var k = 0; k < sub && !res; k++){
          enVol.vx += vent * h; enVol.vy += ARC.g * h; enVol.x += enVol.vx * h; enVol.y += enVol.vy * h;
          res = collision(enVol.x, enVol.y, t - dt + h * (k + 1));
          /* tirée à fond : elle traverse la cible et continue (les obstacles et le sac l'arrêtent toujours) */
          if(res && enVol.perce && res.c && !res.rate){ traverser(res); res = null; }
        }
        /* toutes les cibles sont tombées : la flèche qui transperce n'a plus besoin de voler longtemps */
        if(!res && enVol.nb && touches >= cibles.length){ enVol.age += dt; if(enVol.age > 0.6) res = {perdue:true, x:enVol.x, y:enVol.y}; }
        enVol.hist.push(enVol.x.toFixed(1) + ',' + enVol.y.toFixed(1)); if(enVol.hist.length > 9) enVol.hist.shift();
        trainee.setAttribute('d', 'M' + enVol.hist.join(' L'));
        var aV = Math.atan2(enVol.vy, enVol.vx);
        flVol.setAttribute('transform', 'translate(' + enVol.x.toFixed(1) + ',' + enVol.y.toFixed(1) + ') rotate(' + (aV * 57.3).toFixed(1) + ')');
        /* ralenti : tir parfait ou dernière cible */
        if(!enVol.ralenti && !res){
          var pr = prevoir(enVol, t, 0.26);
          /* ralenti : tir parfait, dernière cible, ou une flèche qui va en transpercer une deuxième */
          if(pr && pr.c && !pr.rate && (pr.parfait || touches === cibles.length - 1 || enVol.nb >= 1)){ enVol.ralenti = true; enVol.zoom = true; slowCible = 0.2; camZc = 1.55; camXc = pr.x; camYc = pr.y; }
        }
        if(res){
          /* deja : cette flèche a déjà transpercé une cible, ce n'est plus un raté */
          var vol = enVol, deja = vol.nb > 0; enVol = null;
          var rate2 = function(x, y, quoi){ if(deja) texte(x, y - 24, quoi, 'ko'); else rater(x, y, quoi); };
          if(res.c && !res.rate){ utiles++; maxPerce = Math.max(maxPerce, 1); toucher(res.c, res.x, res.y, res.parfait); if(res.c.type === 'pomme' || res.c.type === 'lanterne'){ var lo = local(res.c, res.x, res.y); planter(lo.x, lo.y, aV + lo.a, res.c.art); } }
          else if(res.rate === 'sac'){ eclats(res.x, res.y, 'bois'); rate2(res.x, res.y, 'Vise la corde !'); var lo2 = local(res.c, res.x, res.y); planter(lo2.x, lo2.y, aV + lo2.a, res.c.art); }
          else if(res.branche){ eclats(res.x, res.y, 'bois'); rate2(res.x, res.y, 'Dans la branche !'); planter(res.local.lx, res.local.ly, aV - angBranche(res.branche), res.branche.fl); if(!deja) U.son('ko'); }
          else if(res.oiseau){ res.oiseau.fuit = true; res.oiseau.vx *= -1.6; particule(res.x, res.y, FLECHE_ART, vol.vx * 0.1, -80, 1.2, 500, 500); rate2(res.x, res.y, deja ? 'Piou !' : 'Piou ! Un oiseau…'); }
          else if(res.sol){ planter(res.x, res.y, aV); if(!deja) rater(res.x, res.y, 'Raté'); }
          else if(!deja){ rater(fixe(res.x, 20, 340), fixe(res.y, 40, 420), 'Raté'); }
          if(vol.ralenti || vol.zoom){ P.apres(380, function(){ if(enVol && enVol.ralenti) return; slowCible = 1; camZc = 1; camXc = 180; camYc = 240; }); }
          else { slowCible = 1; camZc = 1; }
          finVol();
        }
      }
      /* particules */
      parts = parts.filter(function(q){
        q.age += dt; q.vy += q.g * dt; q.x += q.vx * dt; q.y += q.vy * dt; q.r += q.vr * dt;
        if(q.g < 100){ q.vx *= (1 - dt * 1.5); }
        q.el.setAttribute('transform', 'translate(' + q.x.toFixed(1) + ',' + q.y.toFixed(1) + ') rotate(' + q.r.toFixed(0) + ')');
        q.el.setAttribute('opacity', Math.max(0, 1 - q.age / q.vie).toFixed(2));
        if(q.age > q.vie){ q.el.parentNode.removeChild(q.el); return false; }
        return true;
      });
    });
    return {arreter: P.arreter};
  }
});
