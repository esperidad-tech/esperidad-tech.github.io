/* ==========================================================
   LES BANDEROLES DE LA FÊTE (Pisteur) — LE DÉCOR. Romain, 12 novembre 2026, 13 h 27 :
   « Un décor de ville en pleine journée. Tu travailles bien les textures, tu fais des belles
   textures. Et c'est un décor de ville un peu en fête. »

   La place de Brumeval vue par le Pisteur, de face : sept maisons et le clocher, le ciel de
   midi, les collines, des guirlandes, des lampions, des étals, le mât de la fête. Cinq
   villageois tiennent une perche (la dame à sa fenêtre, le couvreur sur son toit, le sonneur
   dans le clocher, Basile sur son échelle, un enfant sur un tonneau) : le jeu (mj-visee.js)
   y accroche les anneaux de bois.

   Tout est dessiné en « unités du monde » : 1 unité ≈ 1 point d'écran quand on voit toute la
   place sur une tablette ; la vue de tir regarde le même dessin quatre fois plus près, c'est
   pourquoi chaque tuile, chaque poutre et chaque volet est dessiné pour de bon.
   Le sol est à y = SOLY ; le haut du ciel à y = −760.
   Le dessin est toujours le même (un hasard à graine) : le jeu le pose deux fois (la place
   entière, puis la vue de tir), et les deux doivent se ressembler trait pour trait.
   Rien ne bouge dans ce dessin : ce qui bouge (anneaux, banderoles, confettis) est au jeu.
   MJ.VISEE_ART = {monde(id), anneau(id, r, e), PORTEURS, MAT, BORNES, SOLY, K, COULEURS}
   ========================================================== */
(function(){
'use strict';
var MJ = window.MJ; if(!MJ) return;
var K = '#24182e', SOLY = 170;
var BORNES = {x0:-660, y0:-760, x1:660, y1:600};
var MAT = {x:112, y:-252};
var COULEURS = ['#e5484d', '#f6c23a', '#3f8fd6', '#4fb06a', '#ef7fb0', '#f4ecdc', '#9b6fd0', '#ff9a3c'];
/* Les porteurs de perche : main = où ils tiennent la perche, bout = le haut de la perche (l'anneau pend juste dessous) */
var PORTEURS = [
  {id:'dame', nom:'la dame au chignon', main:[-316, -30], bout:[-262, -134]},
  {id:'couvreur', nom:'le couvreur', main:[-138, -196], bout:[-100, -306]},
  {id:'sonneur', nom:'le sonneur', main:[53, -352], bout:[122, -410]},
  {id:'basile', nom:'Basile', main:[235, -8], bout:[196, -100]},
  {id:'enfant', nom:'le petit', main:[-90, 84], bout:[-62, -14]}
];
function f(v){ return String(Math.round(v * 10) / 10); }
function P(x, y){ return f(x) + ',' + f(y); }
function ct(w){ return ' stroke="' + K + '" stroke-width="' + w + '"'; }
/* un hasard qui redonne toujours la même suite (mulberry32) */
function alea(g){ var s = g >>> 0; return function(){ s = (s + 0x6D2B79F5) | 0; var t = Math.imul(s ^ (s >>> 15), 1 | s); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }

/* ---------- Les textures peintes une fois (de petites images de grain, posées en motif sur les murs, la pierre, le bois) ---------- */
var TEX = null;
function textures(){
  if(TEX) return TEX;
  TEX = {};
  try{
    var r = alea(11);
    var toile = function(n, dessin){ var c = document.createElement('canvas'); c.width = c.height = n; var g = c.getContext('2d'); dessin(g, n); return c.toDataURL('image/png'); };
    var taches = function(g, n, nb, r0, r1, fonce, clair){
      for(var i = 0; i < nb; i++){
        var x = r() * n, y = r() * n, ra = r0 + r() * (r1 - r0), c = r() < .5 ? fonce : clair;
        for(var dx = -n; dx <= n; dx += n) for(var dy = -n; dy <= n; dy += n){
          var gr = g.createRadialGradient(x + dx, y + dy, 0, x + dx, y + dy, ra);
          gr.addColorStop(0, c); gr.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = gr; g.fillRect(x + dx - ra, y + dy - ra, ra * 2, ra * 2);
        }
      }
    };
    /* le crépi : des taches très douces, puis une pluie de tout petits grains clairs et sombres */
    TEX.crepi = toile(192, function(g, n){
      taches(g, n, 14, 16, 44, 'rgba(80,50,20,.045)', 'rgba(255,255,255,.10)');
      for(var i = 0; i < 3600; i++){ g.fillStyle = r() < .55 ? 'rgba(80,50,25,' + (.04 + r() * .11).toFixed(3) + ')' : 'rgba(255,255,255,' + (.05 + r() * .14).toFixed(3) + ')'; var t = .8 + r() * 1.6; g.fillRect(r() * n, r() * n, t, t); }
    });
    /* la pierre : des taches plus marquées, des petits trous, quelques veines */
    TEX.pierre = toile(192, function(g, n){
      taches(g, n, 22, 10, 34, 'rgba(60,50,40,.14)', 'rgba(255,255,255,.16)');
      for(var i = 0; i < 2600; i++){ g.fillStyle = r() < .6 ? 'rgba(50,40,35,' + (.05 + r() * .16).toFixed(3) + ')' : 'rgba(255,255,255,' + (.06 + r() * .14).toFixed(3) + ')'; var t = .8 + r() * 2.4; g.fillRect(r() * n, r() * n, t, t * (.6 + r() * .8)); }
      g.strokeStyle = 'rgba(60,45,35,.16)'; g.lineWidth = 1;
      for(i = 0; i < 7; i++){ var x = r() * n, y = r() * n; g.beginPath(); g.moveTo(x, y); for(var k = 0; k < 4; k++){ x += (r() - .5) * 26; y += (r() - .5) * 26; g.lineTo(x, y); } g.stroke(); }
    });
    /* le bois : de longues fibres, dans le sens de la largeur */
    TEX.bois = toile(192, function(g, n){
      for(var i = 0; i < 520; i++){
        var y = r() * n, x = r() * n, l = 20 + r() * 90;
        g.strokeStyle = r() < .6 ? 'rgba(45,25,10,' + (.05 + r() * .13).toFixed(3) + ')' : 'rgba(255,225,180,' + (.05 + r() * .12).toFixed(3) + ')'; g.lineWidth = .6 + r() * 1.3;
        for(var dx = -n; dx <= n; dx += n){ g.beginPath(); g.moveTo(x + dx, y); g.bezierCurveTo(x + dx + l * .3, y + (r() - .5) * 3, x + dx + l * .7, y + (r() - .5) * 3, x + dx + l, y + (r() - .5) * 2); g.stroke(); }
      }
    });
  }catch(e){ TEX = {}; }
  return TEX;
}

/* ---------- L'anneau de bois (autour de 0,0) : r = le rayon du trou, e = l'épaisseur du bois ---------- */
function anneau(id, r, e){
  var R = r + e, m = r + e / 2;
  return '<defs><linearGradient id="' + id + 'ab" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f0c684"/><stop offset=".45" stop-color="#cf9550"/><stop offset="1" stop-color="#93602c"/></linearGradient></defs>' +
    '<path d="M' + f(R) + ',0 A' + f(R) + ',' + f(R) + ' 0 1 0 ' + f(-R) + ',0 A' + f(R) + ',' + f(R) + ' 0 1 0 ' + f(R) + ',0 Z M' + f(r) + ',0 A' + f(r) + ',' + f(r) + ' 0 1 1 ' + f(-r) + ',0 A' + f(r) + ',' + f(r) + ' 0 1 1 ' + f(r) + ',0 Z" fill="url(#' + id + 'ab)" fill-rule="evenodd" stroke="' + K + '" stroke-width="' + f(Math.max(.7, e * .2)) + '" stroke-linejoin="round"/>' +
    /* les cernes du bois, un reflet en haut à gauche, l'ombre du bord en bas à droite */
    '<circle r="' + f(m + e * .14) + '" fill="none" stroke="#7a4a1e" stroke-width="' + f(e * .07) + '" stroke-dasharray="' + f(m * 1.1) + ' ' + f(m * .34) + ' ' + f(m * .5) + ' ' + f(m * .22) + '" opacity=".55"/>' +
    '<circle r="' + f(m - e * .16) + '" fill="none" stroke="#7a4a1e" stroke-width="' + f(e * .06) + '" stroke-dasharray="' + f(m * .6) + ' ' + f(m * .2) + ' ' + f(m * 1.3) + ' ' + f(m * .3) + '" stroke-dashoffset="' + f(m * .7) + '" opacity=".5"/>' +
    '<path d="M' + P(-(R - e * .26) * .94, -(R - e * .26) * .34) + ' A' + f(R - e * .26) + ',' + f(R - e * .26) + ' 0 0 1 ' + P(-(R - e * .26) * .34, -(R - e * .26) * .94) + '" fill="none" stroke="#fff0c8" stroke-width="' + f(e * .16) + '" stroke-linecap="round" opacity=".85"/>' +
    '<path d="M' + P((r + e * .2) * .34, (r + e * .2) * .94) + ' A' + f(r + e * .2) + ',' + f(r + e * .2) + ' 0 0 0 ' + P((r + e * .2) * .94, (r + e * .2) * .34) + '" fill="none" stroke="#5e3a16" stroke-width="' + f(e * .14) + '" stroke-linecap="round" opacity=".6"/>';
}

/* ==========================================================
   LE MONDE : tout le dessin de la place (le contenu d'un <svg>, en unités du monde)
   ========================================================== */
function monde(id){
  var R = alea(2026), T = textures(), s = '';
  function rr(a, b){ return a + R() * (b - a); }
  function U(n){ return 'url(#' + id + n + ')'; }

  /* ---------- les dégradés et les motifs ---------- */
  function ecailles(nom, w, h, fond, pal0, pal1, trait, pointe){
    var t = '<pattern id="' + id + nom + '" width="' + (2 * w) + '" height="' + (2 * h) + '" patternUnits="userSpaceOnUse"><rect width="' + (2 * w) + '" height="' + (2 * h) + '" fill="' + fond + '"/>';
    function rang(y, dec, pal){
      var q = '';
      for(var i = -1; i < 3; i++){
        var x = i * w + dec, c = pal[((i % 2) + 2) % 2], l = w - .5;
        q += '<path d="M' + f(x + .25) + ',' + f(y) + ' h' + f(l) + ' v' + f(h * .55) + (pointe ? ' l' + f(-l / 2) + ',' + f(h * .62) + ' l' + f(-l / 2) + ',' + f(-h * .62) : ' a' + f(l / 2) + ',' + f(h * .62) + ' 0 0 1 ' + f(-l) + ',0') + ' Z" fill="' + c + '" stroke="' + trait + '" stroke-width=".45"/>';
      }
      return q + '<rect x="0" y="' + f(y) + '" width="' + (2 * w) + '" height="' + f(h * .2) + '" fill="#000" opacity=".16"/>';
    }
    return t + rang(h, w / 2, pal1) + rang(0, 0, pal0) + rang(-h, w / 2, pal1) + '</pattern>';
  }
  var d = '<defs>';
  d += '<linearGradient id="' + id + 'ci" gradientUnits="userSpaceOnUse" x1="0" y1="-760" x2="0" y2="170"><stop offset="0" stop-color="#1b62c6"/><stop offset=".4" stop-color="#3f95e8"/><stop offset=".78" stop-color="#8fcdf8"/><stop offset="1" stop-color="#dcf2ff"/></linearGradient>';
  d += '<radialGradient id="' + id + 'so"><stop offset="0" stop-color="#fffdf0"/><stop offset=".22" stop-color="#fff6c0" stop-opacity=".9"/><stop offset="1" stop-color="#ffee9a" stop-opacity="0"/></radialGradient>';
  d += ecailles('tu', 7, 5, '#7c351d', ['#cf6a40', '#bd5732'], ['#c65f38', '#d97a4c'], '#7c351d');
  d += ecailles('ar', 7, 5.4, '#2c3654', ['#5f7099', '#536288'], ['#6a7ca6', '#58688f'], '#2c3654', true);
  d += '<pattern id="' + id + 'bo" width="34" height="10" patternUnits="userSpaceOnUse"><rect width="34" height="10" fill="#7b5233"/><path d="M0,2.2 C8,1.4 14,3 22,2.2 S30,1.6 34,2.2 M0,5.6 C6,6.4 16,4.8 24,5.6 S31,6.2 34,5.6 M0,8.4 C10,7.8 20,9 34,8.4" fill="none" stroke="#5a3820" stroke-width=".6" opacity=".85"/><path d="M0,3.9 C10,3.3 18,4.5 34,3.9 M0,7 C12,7.5 22,6.5 34,7" fill="none" stroke="#a0744a" stroke-width=".5" opacity=".85"/><ellipse cx="12" cy="5.6" rx="1.7" ry=".8" fill="#4c2e1c" opacity=".75"/></pattern>';
  d += '<pattern id="' + id + 'bv" href="#' + id + 'bo" patternTransform="rotate(90)"/>';
  d += '<pattern id="' + id + 'pi" width="40" height="24" patternUnits="userSpaceOnUse"><rect width="40" height="24" fill="#9c8f78"/>' +
    '<rect x=".6" y=".6" width="18.8" height="10.8" rx="1.3" fill="#ddd2bc"/><rect x="20.6" y=".6" width="18.8" height="10.8" rx="1.3" fill="#cfc3aa"/>' +
    '<rect x="-9.4" y="12.6" width="18.8" height="10.8" rx="1.3" fill="#d6cab2"/><rect x="10.6" y="12.6" width="18.8" height="10.8" rx="1.3" fill="#e4dac6"/><rect x="30.6" y="12.6" width="18.8" height="10.8" rx="1.3" fill="#d6cab2"/>' +
    '<path d="M1.6,10.6 V1.6 H18.6 M21.6,10.6 V1.6 H38.6 M11.6,22.6 V13.6 H28.6 M-8.4,13.6 H8.6 M31.6,22.6 V13.6 H40" fill="none" stroke="#fff" stroke-width=".7" opacity=".5"/>' +
    '<path d="M19.4,11.4 l-3,0 l3,-2.4 Z M10.6,12.6 l3.4,0 l-3.4,2.6 Z" fill="#9c8f78"/></pattern>';
  d += '<pattern id="' + id + 'pv" width="30" height="10" patternUnits="userSpaceOnUse"><rect width="30" height="10" fill="#6f6252"/>' +
    '<rect x=".5" y=".6" width="9" height="8.8" rx="2.6" fill="#b9ab94"/><rect x="10.5" y=".6" width="9" height="8.8" rx="2.6" fill="#a99b85"/><rect x="20.5" y=".6" width="9" height="8.8" rx="2.6" fill="#c2b59f"/>' +
    '<path d="M2,3 Q5,1.2 8,2.6 M12,3 Q15,1.2 18,2.6 M22,3 Q25,1.2 28,2.6" fill="none" stroke="#fff" stroke-width=".7" opacity=".45" stroke-linecap="round"/></pattern>';
  [['sr', '#d9413f'], ['sb', '#3f7fc4'], ['sv', '#3f9a62'], ['sj', '#e8a93a']].forEach(function(c){ d += '<pattern id="' + id + c[0] + '" width="12" height="12" patternUnits="userSpaceOnUse"><rect width="12" height="12" fill="#f8f1e2"/><rect width="6" height="12" fill="' + c[1] + '"/></pattern>'; });
  d += '<linearGradient id="' + id + 've" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#d8efff"/><stop offset=".5" stop-color="#86b8e2"/><stop offset="1" stop-color="#4f83b8"/></linearGradient>';
  d += '<linearGradient id="' + id + 'oh" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1c1024" stop-opacity=".42"/><stop offset="1" stop-color="#1c1024" stop-opacity="0"/></linearGradient>';
  d += '<linearGradient id="' + id + 'od" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#fff" stop-opacity=".1"/><stop offset=".35" stop-color="#fff" stop-opacity="0"/><stop offset=".6" stop-color="#2a1830" stop-opacity="0"/><stop offset="1" stop-color="#2a1830" stop-opacity=".24"/></linearGradient>';
  d += '<radialGradient id="' + id + 'la" cx=".35" cy=".3" r=".75"><stop offset="0" stop-color="#fff0b0"/><stop offset=".5" stop-color="#e6b84a"/><stop offset="1" stop-color="#a87a1e"/></radialGradient>';
  d += '<radialGradient id="' + id + 'br" cx=".35" cy=".3" r=".8"><stop offset="0" stop-color="#f0c27a"/><stop offset=".55" stop-color="#b8782e"/><stop offset="1" stop-color="#6e4418"/></radialGradient>';
  d += '<linearGradient id="' + id + 'brume" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#dff1ff" stop-opacity="0"/><stop offset="1" stop-color="#dff1ff" stop-opacity=".75"/></linearGradient>';
  ['crepi', 'pierre', 'bois'].forEach(function(n){ if(T[n]) d += '<pattern id="' + id + 'g' + n.charAt(0) + '" width="44" height="44" patternUnits="userSpaceOnUse"><image href="' + T[n] + '" width="44" height="44"/></pattern>'; });
  /* les pavés : la même rangée de trois pavés, de plus en plus grosse en venant vers nous */
  var RANGS = [], yy = SOLY + 9, hh = 6.5;
  while(yy < BORNES.y1){ RANGS.push([yy, hh]); yy += hh; hh *= 1.17; }
  RANGS.forEach(function(g, i){ d += '<pattern id="' + id + 'pv' + i + '" href="#' + id + 'pv" patternTransform="translate(' + f((i % 2) * g[1] * .75 + i * 3.1) + ',' + f(g[0]) + ') scale(' + (g[1] / 10).toFixed(3) + ')"/>'; });
  d += '</defs>';
  s += d;

  /* ---------- le ciel, le soleil, les nuages ---------- */
  s += '<rect x="' + BORNES.x0 + '" y="' + BORNES.y0 + '" width="' + (BORNES.x1 - BORNES.x0) + '" height="' + (SOLY - BORNES.y0) + '" fill="' + U('ci') + '"/>';
  s += '<circle cx="-470" cy="-600" r="210" fill="' + U('so') + '"/><circle cx="-470" cy="-600" r="34" fill="#fffef2"/>';
  function nuage(x, y, k, o){
    var b = [[-36, 2, 15], [-17, -9, 19], [8, -14, 22], [31, -5, 17], [2, 3, 22], [-26, 8, 13], [26, 9, 13], [48, 6, 10], [-50, 8, 9]];
    var q = '<g transform="translate(' + P(x, y) + ') scale(' + k + ')" opacity="' + (o || 1) + '">';
    q += b.map(function(c){ return '<circle cx="' + c[0] + '" cy="' + (c[1] + 5) + '" r="' + c[2] + '" fill="#b9d3ee"/>'; }).join('');
    q += b.map(function(c){ return '<circle cx="' + c[0] + '" cy="' + c[1] + '" r="' + c[2] + '" fill="#ffffff"/>'; }).join('');
    q += '<path d="M-58,14 H56 C40,22 -44,22 -58,14 Z" fill="#b9d3ee"/><circle cx="2" cy="-18" r="12" fill="#fff"/><circle cx="-20" cy="-13" r="9" fill="#fff"/>';
    return q + '</g>';
  }
  s += nuage(-250, -560, 1.7, .95) + nuage(210, -640, 1.25, .9) + nuage(430, -470, 1.9, .95) + nuage(-560, -380, 1.3, .9) + nuage(40, -480, .9, .85) + nuage(330, -300, 1.1, .9) + nuage(-380, -260, .8, .8) + nuage(600, -600, 1.2, .85);
  /* quelques ballons qui se sont envolés de la fête */
  [[-196, -420, '#e5484d'], [258, -520, '#f6c23a'], [-430, -470, '#3f8fd6'], [512, -380, '#ef7fb0']].forEach(function(b){
    s += '<g transform="translate(' + b[0] + ',' + b[1] + ')"><path d="M0,9 q-2,7 1,13 q2,5 -1,10" fill="none" stroke="#f4ecdc" stroke-width=".6"/><ellipse rx="7" ry="8.6" fill="' + b[2] + '"' + ct(.9) + '/><path d="M-1.6,8.4 h3.2 l-1.6,2.4 Z" fill="' + b[2] + '"' + ct(.6) + '/><ellipse cx="-2.6" cy="-3.4" rx="1.7" ry="2.6" fill="#fff" opacity=".7"/></g>';
  });

  /* ---------- au loin : les collines, la forêt, le moulin de Farinel, puis les toits du village dans la lumière ---------- */
  s += '<path d="M-660,-150 C-590,-250 -500,-286 -420,-240 C-350,-200 -280,-196 -200,-170 C-110,-140 -40,-150 30,-128 C110,-104 190,-160 280,-196 C370,-232 470,-262 560,-220 C610,-196 640,-170 660,-150 L660,170 L-660,170 Z" fill="#9cc7c4"/>';
  s += '<path d="M-660,-90 C-560,-150 -470,-170 -380,-140 C-300,-112 -220,-124 -140,-100 C-40,-70 60,-96 160,-120 C270,-146 360,-180 470,-150 C550,-128 610,-104 660,-80 L660,170 L-660,170 Z" fill="#86bf8c"/>';
  var foret = '';
  for(var fx = -650; fx < 660; fx += rr(9, 15)){ var fy = -92 - 40 * Math.sin((fx + 500) / 190) - 26 * Math.sin((fx + 90) / 83) + rr(-5, 5); foret += '<circle cx="' + f(fx) + '" cy="' + f(fy) + '" r="' + f(rr(7, 12)) + '" fill="' + (R() < .5 ? '#5fa56c' : '#6db377') + '"/>'; }
  s += foret;
  s += '<g transform="translate(486,-214)"><path d="M-9,34 L-6,0 H6 L9,34 Z" fill="#e9dcc2"' + ct(.8) + '/><path d="M-8,0 L0,-11 L8,0 Z" fill="#b85a34"' + ct(.8) + '/><g transform="rotate(24)"><path d="M0,0 L-3,-30 H3 Z M0,0 L3,30 H-3 Z M0,0 L30,-3 V3 Z M0,0 L-30,3 V-3 Z" fill="#f4ecdc"' + ct(.6) + '/></g><circle r="1.8" fill="' + K + '"/></g>';
  s += '<path d="M-660,-40 C-540,-80 -420,-60 -300,-76 C-180,-92 -60,-60 60,-70 C200,-82 320,-110 440,-90 C540,-74 610,-60 660,-50 L660,170 L-660,170 Z" fill="#74b27a"/>';
  /* les toits de derrière */
  [[-610, -118, 46, '#e8d8c0', '#b9603c'], [-452, -150, 40, '#d8e2ec', '#5f7099'], [-236, -160, 42, '#f0dcc0', '#c0623c'], [-70, -176, 44, '#e2e8d0', '#b9603c'], [88, -138, 34, '#f0d8d0', '#5f7099'], [300, -146, 44, '#ecdcb8', '#c0623c'], [420, -170, 50, '#dce6f0', '#b9603c'], [560, -130, 46, '#f0e0c8', '#5f7099']].forEach(function(m){
    var x = m[0], y = m[1], w = m[2];
    s += '<rect x="' + f(x - w / 2) + '" y="' + y + '" width="' + w + '" height="' + (SOLY - y) + '" fill="' + m[3] + '"/><path d="M' + P(x - w / 2 - 4, y + 1) + ' L' + P(x, y - w * .46) + ' L' + P(x + w / 2 + 4, y + 1) + ' Z" fill="' + m[4] + '"/><rect x="' + f(x - 4) + '" y="' + f(y + 8) + '" width="8" height="11" fill="#6f8fb4"/>';
  });
  s += '<rect x="' + BORNES.x0 + '" y="-300" width="' + (BORNES.x1 - BORNES.x0) + '" height="' + (SOLY + 300) + '" fill="' + U('brume') + '"/>';
  /* les ruelles sombres, entre les maisons */
  s += '<rect x="' + BORNES.x0 + '" y="-44" width="' + (BORNES.x1 - BORNES.x0) + '" height="' + (SOLY + 44) + '" fill="#4a3c58"/>';

  /* ---------- les briques des maisons ---------- */
  function mur(x, y, w, h, coul, grain){
    return '<rect x="' + f(x) + '" y="' + f(y) + '" width="' + f(w) + '" height="' + f(h) + '" fill="' + coul + '"/>' +
      (T[grain || 'crepi'] ? '<rect x="' + f(x) + '" y="' + f(y) + '" width="' + f(w) + '" height="' + f(h) + '" fill="' + U('g' + (grain || 'crepi').charAt(0)) + '"/>' : '') +
      '<rect x="' + f(x) + '" y="' + f(y) + '" width="' + f(w) + '" height="' + f(h) + '" fill="' + U('od') + '"/>';
  }
  function fleurs(x, y, w, n){
    var q = '', coul = ['#e5484d', '#ffd23f', '#ef7fb0', '#ffffff', '#ff8a3c', '#b57be0'];
    for(var i = 0; i < n * 2; i++) q += '<ellipse cx="' + f(x + rr(0, w)) + '" cy="' + f(y + rr(-1, 2.6)) + '" rx="' + f(rr(1.8, 3)) + '" ry="' + f(rr(1.3, 2.2)) + '" fill="' + (R() < .5 ? '#3f8a4a' : '#58a85c') + '"/>';
    for(i = 0; i < n; i++){ var fx = x + (i + .5) * w / n + rr(-1, 1), fy = y + rr(-3.4, -.6), c = coul[Math.floor(R() * coul.length)]; q += '<circle cx="' + f(fx) + '" cy="' + f(fy) + '" r="' + f(rr(1.5, 2.3)) + '" fill="' + c + '" stroke="' + K + '" stroke-width=".35"/><circle cx="' + f(fx) + '" cy="' + f(fy) + '" r=".6" fill="#fff6c0"/>'; }
    return q;
  }
  /* une fenêtre (cx = son milieu, y = son haut) : l'embrasure dans l'ombre, la vitre qui reflète le ciel, les rideaux,
     les croisillons, les volets ouverts, l'appui, la jardinière */
  function fenetre(cx, y, w, h, o){
    o = o || {};
    var x = cx - w / 2, q = '', vc = o.volets, cadre = o.cadre || '#f6efe0';
    if(o.pierre) q += '<rect x="' + f(x - 2.6) + '" y="' + f(y - 2.6) + '" width="' + f(w + 5.2) + '" height="' + f(h + 5.2) + '" rx="1" fill="#d9ceb8"' + ct(.7) + '/>';
    q += '<rect x="' + f(x - .8) + '" y="' + f(y - .8) + '" width="' + f(w + 1.6) + '" height="' + f(h + 1.6) + '" fill="#2e2230"/>';
    q += '<rect x="' + f(x) + '" y="' + f(y) + '" width="' + f(w) + '" height="' + f(h) + '" fill="' + U('ve') + '"/>';
    q += '<path d="M' + P(x + w * .12, y + h) + ' L' + P(x + w * .62, y) + ' H' + f(x + w * .86) + ' L' + P(x + w * .36, y + h) + ' Z" fill="#fff" opacity=".28"/>';
    if(!o.sansRideau) q += '<path d="M' + P(x, y) + ' H' + f(x + w * .42) + ' C' + P(x + w * .34, y + h * .34) + ' ' + P(x + w * .12, y + h * .52) + ' ' + P(x, y + h * .62) + ' Z M' + P(x + w, y) + ' H' + f(x + w * .58) + ' C' + P(x + w * .66, y + h * .34) + ' ' + P(x + w * .88, y + h * .52) + ' ' + P(x + w, y + h * .62) + ' Z" fill="#fffaf0" opacity=".9"/>';
    q += '<rect x="' + f(x) + '" y="' + f(y) + '" width="' + f(w) + '" height="' + f(h * .12) + '" fill="#1c1024" opacity=".3"/>';
    q += '<path d="M' + P(cx, y) + ' V' + f(y + h) + ' M' + P(x, y + h * .42) + ' H' + f(x + w) + '" stroke="' + K + '" stroke-width="2.1"/><path d="M' + P(cx, y) + ' V' + f(y + h) + ' M' + P(x, y + h * .42) + ' H' + f(x + w) + '" stroke="' + cadre + '" stroke-width="1.1"/>';
    q += '<rect x="' + f(x) + '" y="' + f(y) + '" width="' + f(w) + '" height="' + f(h) + '" fill="none" stroke="' + K + '" stroke-width="2.6"/><rect x="' + f(x) + '" y="' + f(y) + '" width="' + f(w) + '" height="' + f(h) + '" fill="none" stroke="' + cadre + '" stroke-width="1.4"/>';
    if(vc){
      var vw = w * .46;
      [x - vw - 1.4, x + w + 1.4].forEach(function(vx, k){
        q += '<rect x="' + f(vx) + '" y="' + f(y - 1) + '" width="' + f(vw) + '" height="' + f(h + 2) + '" rx=".8" fill="' + vc + '"' + ct(.9) + '/>';
        var l = ''; for(var ly = y + 2; ly < y + h - 1; ly += 3.2) l += 'M' + P(vx + 1.6, ly) + ' H' + f(vx + vw - 1.6) + ' ';
        q += '<path d="' + l + '" stroke="#000" stroke-width=".7" opacity=".28"/><path d="' + l.replace(/M([\-\d.]+),([\-\d.]+)/g, function(m, a, b){ return 'M' + a + ',' + f(+b + .8); }) + '" stroke="#fff" stroke-width=".5" opacity=".3"/>';
        q += '<rect x="' + f(k ? vx : vx + vw - 2.4) + '" y="' + f(y - 1) + '" width="2.4" height="' + f(h + 2) + '" fill="#000" opacity="' + (k ? '.0' : '.16') + '"/>';
      });
    }
    q += '<rect x="' + f(x - 3) + '" y="' + f(y + h + .6) + '" width="' + f(w + 6) + '" height="3" rx=".8" fill="' + (o.appui || '#cfc3aa') + '"' + ct(.7) + '/>';
    if(o.fleurs){ q += '<rect x="' + f(x - 1.5) + '" y="' + f(y + h - 4.4) + '" width="' + f(w + 3) + '" height="5.6" rx="1" fill="#a5543a"' + ct(.7) + '/><path d="M' + P(x - 1.5, y + h - 2.6) + ' H' + f(x + w + 1.5) + '" stroke="#7a3a26" stroke-width=".6"/>' + fleurs(x - 1, y + h - 5.4, w + 2, Math.round(w / 4)); }
    return q;
  }
  /* une porte en bois, cintrée : les planches, les ferrures, la poignée, la marche */
  function porte(cx, w, h, coul){
    var x = cx - w / 2, y = SOLY - h, q = '';
    q += '<path d="M' + P(x - 3, SOLY) + ' V' + f(y + w * .42) + ' Q' + P(x - 3, y - 3) + ' ' + P(cx, y - 3) + ' Q' + P(x + w + 3, y - 3) + ' ' + P(x + w + 3, y + w * .42) + ' V' + f(SOLY) + ' Z" fill="#d9ceb8"' + ct(.8) + '/>';
    q += '<path d="M' + P(x, SOLY) + ' V' + f(y + w * .42) + ' Q' + P(x, y) + ' ' + P(cx, y) + ' Q' + P(x + w, y) + ' ' + P(x + w, y + w * .42) + ' V' + f(SOLY) + ' Z" fill="' + coul + '"' + ct(1) + '/>';
    var pl = ''; for(var i = 1; i < 5; i++) pl += 'M' + P(x + w * i / 5, y + (i === 1 || i === 4 ? w * .2 : w * .04)) + ' V' + f(SOLY) + ' ';
    q += '<path d="' + pl + '" stroke="#000" stroke-width=".7" opacity=".35"/>';
    q += '<path d="M' + P(x + 1, y + h * .34) + ' h' + f(w * .5) + ' M' + P(x + 1, y + h * .78) + ' h' + f(w * .5) + '" stroke="' + K + '" stroke-width="2.2" stroke-linecap="round"/><path d="M' + P(x + 1, y + h * .34) + ' h' + f(w * .5) + ' M' + P(x + 1, y + h * .78) + ' h' + f(w * .5) + '" stroke="#5a5560" stroke-width="1.1" stroke-linecap="round"/>';
    q += '<circle cx="' + f(x + w * .82) + '" cy="' + f(y + h * .58) + '" r="1.7" fill="' + U('la') + '"' + ct(.5) + '/>';
    q += '<rect x="' + f(x - 6) + '" y="' + f(SOLY - 3) + '" width="' + f(w + 12) + '" height="5" rx="1" fill="#cfc3aa"' + ct(.8) + '/>';
    return q;
  }
  /* les poutres : d'abord leur contour, puis le bois (les couchées et les penchées dans un sens du fil, les debout dans l'autre) */
  function poutres(couchees, debout, ep){
    function tr(l){ return l.map(function(b){ return 'M' + P(b[0], b[1]) + ' L' + P(b[2], b[3]); }).join(' '); }
    var a = tr(couchees), b = tr(debout), q = '';
    q += '<path d="' + a + ' ' + b + '" stroke="' + K + '" stroke-width="' + f(ep + 1.5) + '" stroke-linecap="square" fill="none"/>';
    if(a) q += '<path d="' + a + '" stroke="' + U('bo') + '" stroke-width="' + f(ep) + '" stroke-linecap="square" fill="none"/>';
    if(b) q += '<path d="' + b + '" stroke="' + U('bv') + '" stroke-width="' + f(ep) + '" stroke-linecap="square" fill="none"/>';
    return q;
  }
  /* le soubassement de pierre, au pied d'une maison */
  function soubassement(x, w, h){ return '<rect x="' + f(x) + '" y="' + f(SOLY - h) + '" width="' + f(w) + '" height="' + f(h) + '" fill="' + U('pi') + '"' + ct(.9) + '/>' + (T.pierre ? '<rect x="' + f(x) + '" y="' + f(SOLY - h) + '" width="' + f(w) + '" height="' + f(h) + '" fill="' + U('gp') + '"/>' : '') + '<rect x="' + f(x) + '" y="' + f(SOLY - h) + '" width="' + f(w) + '" height="' + f(h) + '" fill="' + U('od') + '"/>'; }
  /* un toit vu de face (le faîtage en haut, la gouttière en bas), avec sa cheminée et ses lucarnes */
  function toitPlan(x, y, w, h, motif, o){
    o = o || {};
    var q = '';
    if(o.cheminee !== undefined){ var cx = x + w * o.cheminee, cy = y - h - 16; q += '<rect x="' + f(cx) + '" y="' + f(cy) + '" width="13" height="30" fill="#b46a4c"' + ct(1) + '/>' + '<path d="M' + P(cx, cy + 6) + ' h13 M' + P(cx, cy + 12) + ' h13 M' + P(cx, cy + 18) + ' h13 M' + P(cx + 6.5, cy) + ' v6 M' + P(cx + 3, cy + 6) + ' v6 M' + P(cx + 10, cy + 6) + ' v6 M' + P(cx + 6.5, cy + 12) + ' v6" stroke="#7c3f2a" stroke-width=".6"/><rect x="' + f(cx - 2) + '" y="' + f(cy - 4) + '" width="17" height="5" rx="1" fill="#8a4a34"' + ct(.9) + '/><rect x="' + f(cx + 8) + '" y="' + f(cy) + '" width="5" height="30" fill="#2a1830" opacity=".2"/>'; }
    q += '<path d="M' + P(x - 6, y + 3) + ' L' + P(x + 7, y - h) + ' H' + f(x + w - 7) + ' L' + P(x + w + 6, y + 3) + ' Z" fill="' + U(motif) + '"' + ct(1.4) + ' stroke-linejoin="round"/>';
    q += '<path d="M' + P(x - 6, y + 3) + ' L' + P(x + 7, y - h) + ' H' + f(x + w - 7) + ' L' + P(x + w + 6, y + 3) + ' Z" fill="' + U('od') + '"/>';
    q += '<path d="M' + P(x + 5, y - h) + ' H' + f(x + w - 5) + '" stroke="' + K + '" stroke-width="4.6" stroke-linecap="round"/><path d="M' + P(x + 5, y - h) + ' H' + f(x + w - 5) + '" stroke="' + (motif === 'ar' ? '#3f4c70' : '#9a4426') + '" stroke-width="2.8" stroke-linecap="round"/><path d="M' + P(x + 6, y - h - .8) + ' H' + f(x + w - 6) + '" stroke="#fff" stroke-width=".6" opacity=".35"/>';
    (o.lucarnes || []).forEach(function(u){
      var lx = x + w * u, ly = y - h * .34;
      q += '<rect x="' + f(lx - 9) + '" y="' + f(ly - 16) + '" width="18" height="18" fill="' + (o.mur || '#f1e6d0') + '"' + ct(.9) + '/>' + fenetre(lx, ly - 13, 10, 13, {sansRideau:true}) + '<path d="M' + P(lx - 12, ly - 15) + ' L' + P(lx, ly - 27) + ' L' + P(lx + 12, ly - 15) + ' Z" fill="' + U(motif) + '"' + ct(1) + ' stroke-linejoin="round"/>';
    });
    q += '<path d="M' + P(x - 7, y + 3.4) + ' H' + f(x + w + 7) + '" stroke="' + K + '" stroke-width="4.4" stroke-linecap="round"/><path d="M' + P(x - 7, y + 3.4) + ' H' + f(x + w + 7) + '" stroke="#7d8a94" stroke-width="2.6" stroke-linecap="round"/><path d="M' + P(x - 6, y + 2.6) + ' H' + f(x + w + 6) + '" stroke="#fff" stroke-width=".6" opacity=".45"/>';
    return q;
  }
  /* un pignon vu de face : le triangle du mur, ses poutres, les deux rives du toit, l'œil-de-bœuf */
  function pignon(x, y, w, h, coul, o){
    o = o || {};
    var cx = x + w / 2, q = '', py = y - h;
    q += '<path d="M' + P(x, y + .5) + ' L' + P(cx, py) + ' L' + P(x + w, y + .5) + ' Z" fill="' + coul + '"/>';
    if(T.crepi) q += '<path d="M' + P(x, y + .5) + ' L' + P(cx, py) + ' L' + P(x + w, y + .5) + ' Z" fill="' + U('gc') + '"/>';
    q += '<path d="M' + P(cx, py) + ' L' + P(x + w, y + .5) + ' L' + P(cx, y + .5) + ' Z" fill="#2a1830" opacity=".1"/>';
    if(o.bois) q += poutres([[x + w * .2, y - h * .42, x + w * .8, y - h * .42], [cx, y - h * .42, x + w * .3, y], [cx, y - h * .42, x + w * .7, y]], [[cx, y, cx, py + 9]], 5);
    if(o.oeil){ var oy = y - h * .64; q += '<circle cx="' + f(cx) + '" cy="' + f(oy) + '" r="9.6" fill="#d9ceb8"' + ct(.8) + '/><circle cx="' + f(cx) + '" cy="' + f(oy) + '" r="7.2" fill="' + U('ve') + '"' + ct(.9) + '/><path d="M' + P(cx - 7, oy) + ' h14 M' + P(cx, oy - 7) + ' v14" stroke="' + K + '" stroke-width="1.5"/><path d="M' + P(cx - 7, oy) + ' h14 M' + P(cx, oy - 7) + ' v14" stroke="#f6efe0" stroke-width=".8"/>'; }
    /* l'ombre sous les rives, puis les rives couvertes de tuiles */
    var a = Math.atan2(h, w / 2), ux = Math.cos(a), uy = Math.sin(a), ep = 9;
    q += '<path d="M' + P(x - 4, y + 2) + ' L' + P(cx, py - 2) + ' L' + P(x + w + 4, y + 2) + ' L' + P(x + w - 9, y + 2) + ' L' + P(cx, py + 15) + ' L' + P(x + 9, y + 2) + ' Z" fill="#1c1024" opacity=".22"/>';
    var rive = 'M' + P(x - 9, y + 5) + ' L' + P(cx, py - 6.5) + ' L' + P(x + w + 9, y + 5) + ' L' + P(x + w + 9 - uy * ep * .2 - 8, y + 5) + ' L' + P(cx, py + ep * .9) + ' L' + P(x - 9 + 8 + uy * ep * .2, y + 5) + ' Z';
    q += '<path d="' + rive + '" fill="' + U(o.motif || 'tu') + '"' + ct(1.4) + ' stroke-linejoin="round"/><path d="M' + P(x - 8, y + 4) + ' L' + P(cx, py - 5.4) + ' L' + P(x + w + 8, y + 4) + '" fill="none" stroke="#fff" stroke-width=".7" opacity=".4"/>';
    q += '<path d="M' + P(cx, py - 6) + ' v-12" stroke="' + K + '" stroke-width="1.6"/><circle cx="' + f(cx) + '" cy="' + f(py - 18) + '" r="2.6" fill="' + U('la') + '"' + ct(.6) + '/>';
    return q;
  }
  /* une enseigne en fer forgé, avec son dessin */
  function enseigne(x, y, cote, dessin){
    var k = cote, q = '<path d="M' + P(x, y) + ' h' + f(22 * k) + ' M' + P(x, y + 9) + ' q' + f(9 * k) + ',-1 ' + f(13 * k) + ',-9" fill="none" stroke="' + K + '" stroke-width="1.5" stroke-linecap="round"/><path d="M' + P(x + 9 * k, y) + ' v5 M' + P(x + 19 * k, y) + ' v5" stroke="' + K + '" stroke-width=".8"/>';
    return q + '<g transform="translate(' + P(x + 14 * k, y + 14) + ')"><rect x="-9" y="-9" width="18" height="18" rx="3" fill="#f6efe0"' + ct(1) + '/>' + dessin + '</g>';
  }
  /* une boutique : la vitrine, la porte, le store rayé et son lambrequin en festons */
  function boutique(x, w, motif, etalage){
    var y = SOLY - 62, q = '';
    q += '<rect x="' + f(x + 6) + '" y="' + f(y + 16) + '" width="' + f(w * .56) + '" height="34" fill="#2e2230"/><rect x="' + f(x + 7) + '" y="' + f(y + 17) + '" width="' + f(w * .56 - 2) + '" height="32" fill="' + U('ve') + '" opacity=".9"/>' + etalage(x + 7, y + 17, w * .56 - 2, 32) +
      '<rect x="' + f(x + 6) + '" y="' + f(y + 16) + '" width="' + f(w * .56) + '" height="34" fill="none"' + ct(2.4) + '/><rect x="' + f(x + 6) + '" y="' + f(y + 16) + '" width="' + f(w * .56) + '" height="34" fill="none" stroke="#f6efe0" stroke-width="1.2"/>' +
      '<rect x="' + f(x + 3) + '" y="' + f(y + 50) + '" width="' + f(w * .56 + 6) + '" height="4" rx="1" fill="#cfc3aa"' + ct(.8) + '/>';
    var sx = x + 1, sw = w * .62, sy = y + 3;
    q += '<path d="M' + P(sx + 5, sy) + ' H' + f(sx + sw - 5) + ' L' + P(sx + sw + 3, sy + 13) + ' H' + f(sx - 3) + ' Z" fill="' + U(motif) + '"' + ct(1.1) + ' stroke-linejoin="round"/><path d="M' + P(sx + 5, sy) + ' H' + f(sx + sw - 5) + ' L' + P(sx + sw + 3, sy + 13) + ' H' + f(sx - 3) + ' Z" fill="#fff" opacity=".12"/>';
    var fe = 'M' + P(sx - 3, sy + 13); for(var i = 0; i < Math.round((sw + 6) / 6); i++) fe += ' q3,6.4 6,0'; fe += ' Z';
    q += '<path d="' + fe + '" fill="' + U(motif) + '"' + ct(.9) + ' stroke-linejoin="round"/><rect x="' + f(sx - 2) + '" y="' + f(sy + 13) + '" width="' + f(sw + 4) + '" height="9" fill="' + U('oh') + '" opacity=".5"/>';
    return q;
  }

  /* ---------- les sept maisons, de gauche à droite (le clocher est dessiné à part) ---------- */
  /* A : la maison verte, toit d'ardoise */
  s += mur(-652, -50, 196, 220, '#d6e6c2') + soubassement(-652, 196, 18);
  s += '<rect x="-652" y="-48" width="196" height="12" fill="' + U('oh') + '"/>';
  [-616, -554, -492].forEach(function(cx, i){ s += fenetre(cx, -22, 24, 38, {volets:'#5874b0', fleurs:i !== 1, pierre:true}) + fenetre(cx, 58, 24, 38, {volets:'#5874b0', fleurs:i === 1, pierre:true}); });
  s += porte(-554, 26, 46, '#5874b0') + toitPlan(-652, -50, 196, 72, 'ar', {cheminee:.2, lucarnes:[.68], mur:'#d6e6c2'});
  /* B : la boulangerie de Gaspard, à colombages, pignon sur la place ; la dame est à sa fenêtre du premier */
  s += mur(-448, -62, 212, 232, '#f3dfae') + soubassement(-448, 212, 14);
  s += poutres([[-448, 104, -236, 104], [-448, 26, -236, 26], [-448, -58, -236, -58], [-444, 26, -410, -58], [-240, 26, -274, -58], [-388, -58, -372, 26], [-296, -58, -312, 26]], [[-444, 156, -444, -58], [-240, 156, -240, -58], [-372, 104, -372, -58], [-312, 104, -312, -58]], 6);
  s += fenetre(-342, -36, 30, 48, {volets:'#b8482e', sansRideau:true}) + fenetre(-408, 44, 22, 40, {volets:'#b8482e', fleurs:true}) + fenetre(-342, 44, 22, 40, {volets:'#b8482e'}) + fenetre(-276, 44, 22, 40, {volets:'#b8482e', fleurs:true});
  s += boutique(-440, 160, 'sr', function(x, y, w, h){ var q = ''; for(var i = 0; i < 5; i++) q += '<ellipse cx="' + f(x + 12 + i * (w - 24) / 4) + '" cy="' + f(y + h - 7) + '" rx="8.4" ry="5" fill="#d9a054"' + ct(.7) + '/><path d="M' + P(x + 8 + i * (w - 24) / 4, y + h - 8) + ' l3,-2 M' + P(x + 12 + i * (w - 24) / 4, y + h - 8) + ' l3,-2" stroke="#8a5a22" stroke-width=".8"/>'; return q + '<path d="M' + P(x + 10, y + 13) + ' l14,-9 M' + P(x + 22, y + 15) + ' l14,-9 M' + P(x + 34, y + 13) + ' l14,-9" stroke="' + K + '" stroke-width="5" stroke-linecap="round"/><path d="M' + P(x + 10, y + 13) + ' l14,-9 M' + P(x + 22, y + 15) + ' l14,-9 M' + P(x + 34, y + 13) + ' l14,-9" stroke="#e2b060" stroke-width="3.4" stroke-linecap="round"/>'; });
  s += porte(-262, 30, 52, '#8a4a2c');
  s += pignon(-448, -62, 212, 108, '#f3dfae', {bois:true, oeil:true});
  s += enseigne(-448, 78, -1, '<path d="M-5,2 C-7,-5 -1,-6 0,-1 C1,-6 7,-5 5,2 C3,6 -3,6 -5,2 Z M-4,3 L4,-3 M4,3 L-4,-3" fill="none" stroke="#a8682a" stroke-width="2.4" stroke-linecap="round"/>');
  /* C : la grande maison crème, toit de tuiles ; le couvreur est assis sur son faîtage */
  s += mur(-230, -84, 204, 254, '#f4ead6') + soubassement(-230, 204, 20);
  s += '<rect x="-230" y="-82" width="204" height="13" fill="' + U('oh') + '"/>';
  s += '<path d="M-230,64 H-26 M-230,-18 H-26" stroke="#cfc3aa" stroke-width="3.4"/><path d="M-230,62.6 H-26 M-230,-19.4 H-26" stroke="#fff" stroke-width=".6" opacity=".6"/><path d="M-230,66 H-26 M-230,-16 H-26" stroke="#2a1830" stroke-width=".8" opacity=".25"/>';
  [[-230, 1], [-36, -1]].forEach(function(c){ for(var y = -76; y < 146; y += 16) s += '<rect x="' + f(c[0] + (c[1] > 0 ? 0 : -1) + ((y / 16) % 2 ? 0 : (c[1] > 0 ? 0 : -4))) + '" y="' + y + '" width="' + ((y / 16) % 2 ? 10 : 14) + '" height="14" rx="1" fill="#e2d8c4"' + ct(.6) + '/>'; });
  [-190, -128, -66].forEach(function(cx){ s += fenetre(cx, -66, 20, 30, {volets:'#3f8a6a', pierre:true}); });
  s += fenetre(-190, -4, 24, 46, {volets:'#3f8a6a', fleurs:true, pierre:true}) + fenetre(-66, -4, 24, 46, {volets:'#3f8a6a', fleurs:true, pierre:true}) + fenetre(-128, -8, 28, 52, {pierre:true});
  s += '<rect x="-152" y="43" width="48" height="5" rx="1" fill="#cfc3aa"' + ct(.9) + '/><path d="M-150,43 V26 H-106 V43 M-141,43 V27 M-132,43 V27 M-123,43 V27 M-114,43 V27" fill="none" stroke="' + K + '" stroke-width="1.5"/><path d="M-150,26 H-106" stroke="' + K + '" stroke-width="2.6" stroke-linecap="round"/>';
  s += '<path d="M-128,26 L-150,-2" stroke="' + K + '" stroke-width="1.6"/><path d="M-150,-2 l-2,22 q-10,-4 -20,0 l2,-22 q10,-4 20,0 Z" fill="#3f8fd6"' + ct(.9) + '/><path d="M-151,5 q-10,-4 -20,0 l.6,-7 q10,-4 20,0 Z" fill="#f6c23a"/>';
  s += fenetre(-190, 84, 24, 44, {volets:'#3f8a6a', pierre:true}) + fenetre(-66, 84, 24, 44, {volets:'#3f8a6a', pierre:true}) + porte(-128, 34, 66, '#6e4a8a');
  s += toitPlan(-230, -84, 204, 86, 'tu', {cheminee:.8, lucarnes:[.22, .58], mur:'#f4ead6'});
  /* E : la maison saumon à colombages (les croix de saint André) ; Basile y a posé son échelle */
  s += mur(90, -56, 212, 226, '#f2b796') + soubassement(90, 212, 14);
  s += poutres([[90, 100, 302, 100], [90, 24, 302, 24], [90, -52, 302, -52], [94, 24, 134, -52], [134, 24, 94, -52], [258, 24, 298, -52], [298, 24, 258, -52], [94, 100, 134, 24], [298, 100, 258, 24]], [[94, 156, 94, -52], [298, 156, 298, -52], [134, 100, 134, -52], [258, 100, 258, -52], [196, 100, 196, 24]], 6);
  s += fenetre(165, -40, 24, 46, {volets:'#3f6aa8', fleurs:true}) + fenetre(227, -40, 24, 46, {volets:'#3f6aa8', fleurs:true}) + fenetre(165, 40, 22, 40, {volets:'#3f6aa8'}) + fenetre(227, 40, 22, 40, {volets:'#3f6aa8'});
  s += fenetre(128, 114, 26, 34, {volets:'#3f6aa8', fleurs:true}) + porte(196, 30, 54, '#3f6aa8') + fenetre(266, 114, 26, 34, {volets:'#3f6aa8'});
  s += pignon(90, -56, 212, 106, '#f2b796', {bois:true});   /* pas d'œil-de-bœuf ici : l'anneau de Basile se tient juste devant, deux ronds l'un sur l'autre se lisaient mal */
  s += enseigne(302, 70, 1, '<circle cx="-3" cy="4" r="2.6" fill="none" stroke="#b8482e" stroke-width="1.6"/><circle cx="3" cy="4" r="2.6" fill="none" stroke="#b8482e" stroke-width="1.6"/><path d="M-2,2 L4,-7 M2,2 L-4,-7" stroke="#6a6a78" stroke-width="1.5" stroke-linecap="round"/>');
  /* F : la boutique de fleurs d'Iris, bleue, toit d'ardoise */
  s += mur(308, -76, 196, 246, '#cddcf0') + soubassement(308, 196, 16);
  s += '<rect x="308" y="-74" width="196" height="12" fill="' + U('oh') + '"/><path d="M308,34 H504" stroke="#aebdd4" stroke-width="3"/><path d="M308,32.8 H504" stroke="#fff" stroke-width=".6" opacity=".6"/>';
  [344, 406, 468].forEach(function(cx){ s += fenetre(cx, -50, 24, 42, {volets:'#f4ecdc', fleurs:true, cadre:'#fff'}); });
  s += fenetre(344, 44, 22, 36, {volets:'#f4ecdc', cadre:'#fff'}) + fenetre(468, 44, 22, 36, {volets:'#f4ecdc', cadre:'#fff', fleurs:true}) + fenetre(406, 44, 22, 36, {volets:'#f4ecdc', cadre:'#fff'});
  s += boutique(316, 150, 'sv', function(x, y, w, h){ var q = ''; for(var i = 0; i < 4; i++){ var bx = x + 10 + i * (w - 20) / 3; q += '<path d="M' + P(bx - 5, y + h) + ' l1.5,-11 h7 l1.5,11 Z" fill="#8a9aa8"' + ct(.7) + '/>' + fleurs(bx - 6, y + h - 13, 12, 4); } return q; });
  s += porte(474, 28, 52, '#3f8a6a');
  s += toitPlan(308, -76, 196, 72, 'ar', {cheminee:.72, lucarnes:[.3], mur:'#cddcf0'});
  /* G : la dernière maison, à pignon */
  s += mur(510, -48, 190, 218, '#f0e2c0') + soubassement(510, 190, 14);
  s += poutres([[510, 96, 700, 96], [510, 22, 700, 22], [510, -44, 700, -44], [514, 22, 548, -44]], [[514, 156, 514, -44], [548, 96, 548, -44], [640, 96, 640, -44]], 6);
  s += fenetre(594, -28, 24, 40, {volets:'#7a5a9a', fleurs:true}) + fenetre(594, 44, 24, 40, {volets:'#7a5a9a'}) + fenetre(560, 112, 24, 36, {volets:'#7a5a9a', fleurs:true}) + porte(626, 28, 52, '#7a5a9a');
  s += pignon(510, -48, 190, 96, '#f0e2c0', {bois:true, oeil:true});

  /* ---------- le clocher : la tour de pierre, l'horloge, la Grosse Marie, la flèche d'ardoise, le coq ---------- */
  (function(){
    var x = -20, w = 104, cx = 32;
    s += '<rect x="' + x + '" y="-300" width="' + w + '" height="' + (SOLY + 300) + '" fill="' + U('pi') + '"' + ct(1.4) + '/>' + (T.pierre ? '<rect x="' + x + '" y="-300" width="' + w + '" height="' + (SOLY + 300) + '" fill="' + U('gp') + '"/>' : '') + '<rect x="' + x + '" y="-300" width="' + w + '" height="' + (SOLY + 300) + '" fill="' + U('od') + '"/>';
    for(var y = -286; y < 160; y += 24){ s += '<rect x="' + (x - 2) + '" y="' + y + '" width="' + ((y / 24) % 2 ? 13 : 9) + '" height="11" rx="1" fill="#e6dcc8"' + ct(.6) + '/><rect x="' + (x + w + 2 - ((y / 24) % 2 ? 9 : 13)) + '" y="' + y + '" width="' + ((y / 24) % 2 ? 9 : 13) + '" height="11" rx="1" fill="#c9bda4"' + ct(.6) + '/>'; }
    s += '<path d="M10,' + SOLY + ' V118 Q32,92 54,118 V' + SOLY + ' Z" fill="#6e4424"' + ct(1.2) + '/><path d="M32,104 V' + SOLY + ' M21,112 V' + SOLY + ' M43,112 V' + SOLY + '" stroke="#000" stroke-width=".8" opacity=".4"/><path d="M12,128 h14 M12,152 h14 M52,128 h-14 M52,152 h-14" stroke="#4a4650" stroke-width="2" stroke-linecap="round"/><circle cx="29" cy="140" r="1.6" fill="' + U('la') + '"/><circle cx="35" cy="140" r="1.6" fill="' + U('la') + '"/>';
    s += '<path d="M6,' + SOLY + ' V116 Q32,86 58,116 V' + SOLY + '" fill="none" stroke="#e6dcc8" stroke-width="4"/><path d="M4,' + SOLY + ' V115 Q32,83 60,115 V' + SOLY + '" fill="none"' + ct(.8) + '/>';
    [-100, 20].forEach(function(fy){ s += '<path d="M24,' + (fy + 40) + ' V' + (fy + 12) + ' Q32,' + fy + ' 40,' + (fy + 12) + ' V' + (fy + 40) + ' Z" fill="#2e2230"' + ct(1) + '/><path d="M26.5,' + (fy + 40) + ' V' + (fy + 13) + ' Q32,' + (fy + 4) + ' 37.5,' + (fy + 13) + ' V' + (fy + 40) + ' Z" fill="' + U('ve') + '" opacity=".75"/><rect x="21" y="' + (fy + 40) + '" width="22" height="3.4" rx="1" fill="#e6dcc8"' + ct(.6) + '/>'; });
    /* l'horloge */
    s += '<circle cx="' + cx + '" cy="-212" r="30" fill="#c9bda4"' + ct(1.2) + '/><circle cx="' + cx + '" cy="-212" r="26" fill="#fbf4e0"' + ct(1) + '/><circle cx="' + cx + '" cy="-212" r="21" fill="none" stroke="#b8a888" stroke-width=".7"/>';
    for(var i = 0; i < 12; i++){ var a = i * Math.PI / 6; s += '<path d="M' + P(cx + Math.sin(a) * 19, -212 - Math.cos(a) * 19) + ' L' + P(cx + Math.sin(a) * 23.6, -212 - Math.cos(a) * 23.6) + '" stroke="' + K + '" stroke-width="' + (i % 3 ? 1.1 : 2.2) + '"/>'; }
    s += '<path d="M' + cx + ',-212 L' + (cx + 1) + ',-229 M' + cx + ',-212 L' + (cx + 11) + ',-206" stroke="' + K + '" stroke-width="2.4" stroke-linecap="round"/><circle cx="' + cx + '" cy="-212" r="2.4" fill="' + U('la') + '"' + ct(.6) + '/>';
    /* la corniche, puis le beffroi et sa cloche */
    s += '<rect x="' + (x - 6) + '" y="-306" width="' + (w + 12) + '" height="10" rx="2" fill="#ddd2bc"' + ct(1.1) + '/><rect x="' + (x - 3) + '" y="-296" width="' + (w + 6) + '" height="7" fill="' + U('oh') + '"/>';
    s += '<rect x="' + (x + 4) + '" y="-392" width="' + (w - 8) + '" height="88" fill="' + U('pi') + '"' + ct(1.3) + '/>' + (T.pierre ? '<rect x="' + (x + 4) + '" y="-392" width="' + (w - 8) + '" height="88" fill="' + U('gp') + '"/>' : '') + '<rect x="' + (x + 4) + '" y="-392" width="' + (w - 8) + '" height="88" fill="' + U('od') + '"/>';
    s += '<path d="M6,-306 V-352 Q32,-386 58,-352 V-306 Z" fill="#2c2034"' + ct(1.2) + '/><path d="M3,-306 V-353 Q32,-390 61,-353 V-306" fill="none" stroke="#e6dcc8" stroke-width="3.4"/><path d="M1,-306 V-354 Q32,-393 63,-354 V-306" fill="none"' + ct(.7) + '/>';
    s += '<path d="M6,-362 H58" stroke="' + K + '" stroke-width="3.2"/><path d="M6,-362 H58" stroke="#7b5233" stroke-width="1.8"/><path d="M26,-362 V-354" stroke="' + K + '" stroke-width="2"/><path d="M14,-322 C14,-343 18,-354 26,-354 C34,-354 38,-343 38,-322 L41,-317 H11 Z" fill="' + U('br') + '"' + ct(1) + ' stroke-linejoin="round"/><path d="M13,-326 H39" stroke="#6e4418" stroke-width="1" opacity=".7"/><path d="M18,-340 C19,-348 22,-351 25,-351" fill="none" stroke="#ffe7b0" stroke-width="1.2" opacity=".7" stroke-linecap="round"/><circle cx="26" cy="-315" r="3" fill="#6e4418"' + ct(.7) + '/>';
    s += '<rect x="' + (x - 4) + '" y="-398" width="' + (w + 8) + '" height="9" rx="2" fill="#ddd2bc"' + ct(1.1) + '/>';
    /* la flèche et la girouette */
    s += '<path d="M' + (x - 2) + ',-397 L' + cx + ',-596 L' + (x + w + 2) + ',-397 Z" fill="' + U('ar') + '"' + ct(1.5) + ' stroke-linejoin="round"/><path d="M' + cx + ',-596 L' + (x + w + 2) + ',-397 L' + cx + ',-397 Z" fill="#141a30" opacity=".28"/><path d="M' + (cx - 3) + ',-590 L' + (x + 8) + ',-400" stroke="#fff" stroke-width="1" opacity=".25"/>';
    s += '<path d="M' + cx + ',-594 V-634" stroke="' + K + '" stroke-width="2"/><circle cx="' + cx + '" cy="-612" r="3.4" fill="' + U('la') + '"' + ct(.7) + '/><g transform="translate(' + cx + ',-640)"><path d="M-11,5 C-11,-5 -4,-10 2,-7 L5,-15 L7,-7 C12,-7 15,-2 12,3 L16,7 L7,5 C5,10 -7,10 -11,5 Z" fill="' + U('la') + '"' + ct(.9) + ' stroke-linejoin="round"/><path d="M-11,5 L-19,0 L-16,8 Z" fill="#e6b84a"' + ct(.7) + '/><circle cx="6" cy="-4" r=".9" fill="' + K + '"/></g>';
  })();

  /* ---------- les guirlandes de fanions et les fils de lampions, tendus de toit en toit ---------- */
  function courbe(a, b, fl){ var mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2 + fl; return function(t){ var u = 1 - t; return [u * u * a[0] + 2 * u * t * mx + t * t * b[0], u * u * a[1] + 2 * u * t * (my + fl) + t * t * b[1], 2 * u * (mx - a[0]) + 2 * t * (b[0] - mx), 2 * u * (my + fl - a[1]) + 2 * t * (b[1] - my - fl)]; }; }
  function guirlande(a, b, fl, pas, k){
    var c = courbe(a, b, fl), L = Math.hypot(b[0] - a[0], b[1] - a[1]) * 1.06, n = Math.max(3, Math.round(L / pas)), q = '', p0 = c(0), dd = 'M' + P(p0[0], p0[1]);
    for(var i = 1; i <= 24; i++){ var p = c(i / 24); dd += ' L' + P(p[0], p[1]); }
    q += '<path d="' + dd + '" fill="none" stroke="' + K + '" stroke-width="' + f(1.3 * k) + '" opacity=".7"/><path d="' + dd + '" fill="none" stroke="#f4ecdc" stroke-width="' + f(.6 * k) + '"/>';
    for(i = 0; i < n; i++){
      var t = (i + .5) / n, pt = c(t), an = Math.atan2(pt[3], pt[2]) * 180 / Math.PI + rr(-7, 7);
      q += '<path transform="translate(' + P(pt[0], pt[1]) + ') rotate(' + f(an) + ')" d="M' + f(-3.4 * k) + ',0 H' + f(3.4 * k) + ' L0,' + f(8.6 * k) + ' Z" fill="' + COULEURS[(i + Math.abs(Math.round(a[0]))) % 6] + '" stroke="' + K + '" stroke-width="' + f(.55 * k) + '" stroke-linejoin="round"/>';
    }
    return q;
  }
  function lampions(a, b, fl, pas){
    var c = courbe(a, b, fl), L = Math.hypot(b[0] - a[0], b[1] - a[1]), n = Math.max(2, Math.round(L / pas)), q = '', p0 = c(0), dd = 'M' + P(p0[0], p0[1]);
    for(var i = 1; i <= 20; i++){ var p = c(i / 20); dd += ' L' + P(p[0], p[1]); }
    q += '<path d="' + dd + '" fill="none" stroke="' + K + '" stroke-width="1"/>';
    for(i = 0; i < n; i++){
      var pt = c((i + .5) / n), col = ['#ff8a3c', '#e5484d', '#ffd23f', '#ef7fb0', '#4fb06a'][i % 5];
      q += '<g transform="translate(' + P(pt[0], pt[1]) + ')"><path d="M0,0 V3" stroke="' + K + '" stroke-width=".8"/><rect x="-2.2" y="2.4" width="4.4" height="1.8" fill="#5a4a3a"' + ct(.5) + '/><ellipse cy="9.4" rx="5.2" ry="5.6" fill="' + col + '"' + ct(.8) + '/><path d="M-2.6,4.6 Q-4.6,9.4 -2.6,14.2 M0,4 V14.8 M2.6,4.6 Q4.6,9.4 2.6,14.2" fill="none" stroke="#000" stroke-width=".5" opacity=".3"/><ellipse cx="-1.8" cy="7.4" rx="1.3" ry="2.2" fill="#fff" opacity=".55"/><rect x="-2.2" y="14.6" width="4.4" height="1.6" fill="#5a4a3a"' + ct(.5) + '/><path d="M0,16.2 v4" stroke="#e5484d" stroke-width="1"/></g>';
    }
    return q;
  }
  s += guirlande([-470, -122], [-342, -180], 14, 13, 1) + guirlande([-342, -180], [-22, -304], 26, 13, 1) + guirlande([86, -304], [196, -172], 16, 13, 1) + guirlande([196, -172], [318, -148], 10, 13, 1) + guirlande([500, -148], [605, -152], 12, 13, 1) + guirlande([-652, -124], [-470, -122], 16, 13, 1);
  s += lampions([-236, -56], [-22, -150], 22, 24) + lampions([86, -150], [302, -50], 20, 24) + lampions([-448, -52], [-236, -66], 14, 26) + lampions([302, -60], [504, -72], 16, 26);

  /* ---------- le sol : les pavés de la place, de plus en plus gros en venant vers nous ---------- */
  s += '<rect x="' + BORNES.x0 + '" y="' + SOLY + '" width="' + (BORNES.x1 - BORNES.x0) + '" height="' + (BORNES.y1 - SOLY) + '" fill="#6f6252"/>';
  s += '<rect x="' + BORNES.x0 + '" y="' + SOLY + '" width="' + (BORNES.x1 - BORNES.x0) + '" height="9" fill="#d8ccb4"' + ct(.9) + '/><path d="M' + BORNES.x0 + ',' + (SOLY + 1.2) + ' H' + BORNES.x1 + '" stroke="#fff" stroke-width=".7" opacity=".5"/>';
  RANGS.forEach(function(g, i){ s += '<rect x="' + BORNES.x0 + '" y="' + f(g[0]) + '" width="' + (BORNES.x1 - BORNES.x0) + '" height="' + f(g[1] + .3) + '" fill="' + U('pv' + i) + '"/>'; });
  s += '<rect x="' + BORNES.x0 + '" y="' + SOLY + '" width="' + (BORNES.x1 - BORNES.x0) + '" height="26" fill="' + U('oh') + '" opacity=".6"/>';
  s += '<rect x="' + BORNES.x0 + '" y="' + SOLY + '" width="' + (BORNES.x1 - BORNES.x0) + '" height="' + (BORNES.y1 - SOLY) + '" fill="#ffe9b8" opacity=".12"/>';

  /* ---------- sur la place : les tonneaux, l'étal d'Iris, la table de Gaspard, le mât de la fête ---------- */
  function ombre(x, w){ return '<ellipse cx="' + f(x) + '" cy="' + (SOLY + 13) + '" rx="' + f(w) + '" ry="' + f(w * .2) + '" fill="#1c1024" opacity=".28"/>'; }
  function tonneau(x, h, w){
    var y = SOLY + 10 - h;
    return ombre(x + 3, w * .8) + '<path d="M' + P(x - w / 2, y) + ' C' + P(x - w / 2 - 3.4, y + h * .3) + ' ' + P(x - w / 2 - 3.4, y + h * .7) + ' ' + P(x - w / 2, y + h) + ' H' + f(x + w / 2) + ' C' + P(x + w / 2 + 3.4, y + h * .7) + ' ' + P(x + w / 2 + 3.4, y + h * .3) + ' ' + P(x + w / 2, y) + ' Z" fill="#a06a3c"' + ct(1.1) + '/>' +
      '<path d="M' + P(x - w * .25, y) + ' Q' + P(x - w * .32, y + h / 2) + ' ' + P(x - w * .25, y + h) + ' M' + P(x, y) + ' V' + f(y + h) + ' M' + P(x + w * .25, y) + ' Q' + P(x + w * .32, y + h / 2) + ' ' + P(x + w * .25, y + h) + '" fill="none" stroke="#6a4222" stroke-width=".7"/>' +
      '<path d="M' + P(x - w / 2 - 1.6, y + h * .2) + ' H' + f(x + w / 2 + 1.6) + ' M' + P(x - w / 2 - 1.6, y + h * .8) + ' H' + f(x + w / 2 + 1.6) + '" stroke="' + K + '" stroke-width="3"/><path d="M' + P(x - w / 2 - 1.6, y + h * .2) + ' H' + f(x + w / 2 + 1.6) + ' M' + P(x - w / 2 - 1.6, y + h * .8) + ' H' + f(x + w / 2 + 1.6) + '" stroke="#7d8a94" stroke-width="1.7"/>' +
      '<ellipse cx="' + f(x) + '" cy="' + f(y) + '" rx="' + f(w / 2) + '" ry="3.2" fill="#b98250"' + ct(1) + '/><path d="M' + P(x + w * .2, y + 3) + ' Q' + P(x + w / 2 + 2.4, y + h / 2) + ' ' + P(x + w * .2, y + h - 2) + ' L' + P(x + w / 2, y + h) + ' C' + P(x + w / 2 + 3.4, y + h * .7) + ' ' + P(x + w / 2 + 3.4, y + h * .3) + ' ' + P(x + w / 2, y) + ' Z" fill="#2a1830" opacity=".2"/>';
  }
  function etal(x, w, motif, garni){
    var y0 = SOLY + 14, q = ombre(x + w / 2 + 6, w * .62);
    q += '<path d="M' + P(x + 3, y0) + ' V' + f(y0 - 74) + ' M' + P(x + w - 3, y0) + ' V' + f(y0 - 74) + '" stroke="' + K + '" stroke-width="4.4" stroke-linecap="round"/><path d="M' + P(x + 3, y0) + ' V' + f(y0 - 74) + ' M' + P(x + w - 3, y0) + ' V' + f(y0 - 74) + '" stroke="' + U('bv') + '" stroke-width="3" stroke-linecap="round"/>';
    q += '<rect x="' + f(x - 2) + '" y="' + f(y0 - 34) + '" width="' + f(w + 4) + '" height="30" fill="#f6efe0"' + ct(1) + '/><path d="M' + P(x - 2, y0 - 4) + ' ' + Array.apply(null, Array(Math.round((w + 4) / 8))).map(function(){ return 'l4,5 l4,-5'; }).join(' ') + '" fill="#f6efe0"' + ct(.8) + '/><rect x="' + f(x - 2) + '" y="' + f(y0 - 34) + '" width="' + f(w + 4) + '" height="30" fill="' + U('od') + '"/>';
    q += '<rect x="' + f(x - 5) + '" y="' + f(y0 - 39) + '" width="' + f(w + 10) + '" height="6" rx="1.2" fill="' + U('bo') + '"' + ct(1) + '/>' + garni(x, y0 - 39, w);
    q += '<path d="M' + P(x + 4, y0 - 92) + ' H' + f(x + w - 4) + ' L' + P(x + w + 9, y0 - 72) + ' H' + f(x - 9) + ' Z" fill="' + U(motif) + '"' + ct(1.2) + ' stroke-linejoin="round"/><path d="M' + P(x + 4, y0 - 92) + ' H' + f(x + w - 4) + ' L' + P(x + w + 9, y0 - 72) + ' H' + f(x - 9) + ' Z" fill="' + U('od') + '"/>';
    var fe = 'M' + P(x - 9, y0 - 72); for(var i = 0; i < Math.round((w + 18) / 7); i++) fe += ' q3.5,7.4 7,0'; q += '<path d="' + fe + ' Z" fill="' + U(motif) + '"' + ct(.9) + ' stroke-linejoin="round"/>';
    return q;
  }
  s += tonneau(-470, 30, 24) + tonneau(-446, 24, 20);
  s += etal(-618, 92, 'sj', function(x, y, w){ var q = ''; for(var i = 0; i < 5; i++){ var bx = x + 10 + i * (w - 20) / 4; q += '<ellipse cx="' + f(bx) + '" cy="' + f(y - 4) + '" rx="8" ry="4.6" fill="#d9a054"' + ct(.8) + '/><path d="M' + P(bx - 4, y - 5) + ' l2.6,-2 M' + P(bx, y - 5) + ' l2.6,-2 M' + P(bx + 4, y - 5) + ' l2.6,-2" stroke="#8a5a22" stroke-width=".8"/>'; } return q + '<ellipse cx="' + f(x + w / 2) + '" cy="' + f(y - 11) + '" rx="9" ry="5" fill="#e6b060"' + ct(.8) + '/><ellipse cx="' + f(x + w / 2 - 20) + '" cy="' + f(y - 10) + '" rx="8" ry="4.6" fill="#c98a44"' + ct(.8) + '/>'; });
  s += etal(540, 96, 'sb', function(x, y, w){ var q = ''; for(var i = 0; i < 5; i++){ var bx = x + 10 + i * (w - 20) / 4; q += '<path d="M' + P(bx - 6, y) + ' l1.6,-12 h8.8 l1.6,12 Z" fill="' + ['#8a9aa8', '#b46a4c', '#8a9aa8', '#b46a4c', '#8a9aa8'][i] + '"' + ct(.8) + '/>' + fleurs(bx - 8, y - 15, 16, 5) + fleurs(bx - 6, y - 19, 12, 3); } return q; });
  s += tonneau(516, 28, 22) + tonneau(-96, 26, 24) + tonneau(290, 24, 20);
  [[-518, '#e5484d'], [-508, '#3f8fd6'], [-514, '#f6c23a'], [548, '#ef7fb0'], [538, '#4fb06a'], [554, '#ff9a3c']].forEach(function(b, i){
    var bx = b[0], by = SOLY - 86 - (i % 3) * 13, px = bx < 0 ? -529 : 543, py = SOLY - 58;
    s += '<path d="M' + P(px, py) + ' Q' + P((px + bx) / 2 + 3, (py + by) / 2 + 8) + ' ' + P(bx, by + 9) + '" fill="none" stroke="#f4ecdc" stroke-width=".7"/><ellipse cx="' + bx + '" cy="' + by + '" rx="7" ry="8.6" fill="' + b[1] + '"' + ct(.9) + '/><path d="M' + P(bx - 1.6, by + 8.4) + ' h3.2 l-1.6,2.4 Z" fill="' + b[1] + '"' + ct(.6) + '/><ellipse cx="' + (bx - 2.6) + '" cy="' + (by - 3.4) + '" rx="1.7" ry="2.6" fill="#fff" opacity=".7"/>';
  });
  /* le mât de la fête : un ruban rouge qui tourne autour, une couronne de fleurs, de longs rubans */
  (function(){
    var x = MAT.x, y = MAT.y, q = ombre(x + 5, 16) + '<rect x="' + (x - 10) + '" y="' + (SOLY + 2) + '" width="20" height="12" rx="2" fill="' + U('pi') + '"' + ct(1) + '/>';
    q += '<path d="M' + x + ',' + (SOLY + 4) + ' V' + (y + 6) + '" stroke="' + K + '" stroke-width="6.4" stroke-linecap="round"/><path d="M' + x + ',' + (SOLY + 4) + ' V' + (y + 6) + '" stroke="#f4ecdc" stroke-width="4.6" stroke-linecap="round"/>';
    var ru = ''; for(var yy2 = SOLY - 4; yy2 > y + 12; yy2 -= 15) ru += 'M' + P(x - 2.3, yy2) + ' L' + P(x + 2.3, yy2 - 8) + ' ';
    q += '<path d="' + ru + '" stroke="#e5484d" stroke-width="4.2"/><path d="M' + (x + 1.4) + ',' + (SOLY + 2) + ' V' + (y + 8) + '" stroke="#2a1830" stroke-width="1.2" opacity=".22"/>';
    [['#e5484d', -46, 96], ['#f6c23a', 40, 110], ['#3f8fd6', -26, 132], ['#4fb06a', 58, 74], ['#ef7fb0', 22, 148]].forEach(function(r, i){ q += '<path d="M' + P(x, y + 12) + ' C' + P(x + r[1] * .5, y + 22) + ' ' + P(x + r[1] * 1.2, y + r[2] * .5) + ' ' + P(x + r[1], y + r[2]) + '" fill="none" stroke="' + K + '" stroke-width="3.2" stroke-linecap="round" opacity=".8"/><path d="M' + P(x, y + 12) + ' C' + P(x + r[1] * .5, y + 22) + ' ' + P(x + r[1] * 1.2, y + r[2] * .5) + ' ' + P(x + r[1], y + r[2]) + '" fill="none" stroke="' + r[0] + '" stroke-width="2.2" stroke-linecap="round"/>'; });
    q += '<ellipse cx="' + x + '" cy="' + (y + 12) + '" rx="15" ry="4.6" fill="none" stroke="#3f8a4a" stroke-width="4"' + '/>' + fleurs(x - 15, y + 14, 30, 9);
    q += '<circle cx="' + x + '" cy="' + (y + 2) + '" r="4.6" fill="' + U('la') + '"' + ct(.9) + '/>';
    s += q;
  })();

  /* ---------- les cinq porteurs de perche (sans leur perche : c'est le jeu qui la pose) ---------- */
  function tete(x, y, r, o){
    var q = '';
    if(o.coiffe === 'capuche') q += '<path d="M' + P(x - r - 3, y + r + 2) + ' C' + P(x - r - 5, y - r - 6) + ' ' + P(x + r + 5, y - r - 6) + ' ' + P(x + r + 3, y + r + 2) + ' Z" fill="' + o.habit + '"' + ct(.9) + '/>';
    q += '<circle cx="' + f(x) + '" cy="' + f(y) + '" r="' + r + '" fill="' + (o.peau || '#f1c7a0') + '"' + ct(.9) + '/>';
    q += '<circle cx="' + f(x - r * .36) + '" cy="' + f(y - r * .08) + '" r="' + f(r * .13) + '" fill="' + K + '"/><circle cx="' + f(x + r * .36) + '" cy="' + f(y - r * .08) + '" r="' + f(r * .13) + '" fill="' + K + '"/><path d="M' + P(x - r * .34, y + r * .4) + ' Q' + P(x, y + r * .72) + ' ' + P(x + r * .34, y + r * .4) + '" fill="none" stroke="' + K + '" stroke-width="' + f(r * .14) + '" stroke-linecap="round"/><circle cx="' + f(x - r * .62) + '" cy="' + f(y + r * .3) + '" r="' + f(r * .18) + '" fill="#f08a7a" opacity=".6"/><circle cx="' + f(x + r * .62) + '" cy="' + f(y + r * .3) + '" r="' + f(r * .18) + '" fill="#f08a7a" opacity=".6"/>';
    if(o.coiffe === 'chignon') q += '<path d="M' + P(x - r, y - r * .1) + ' C' + P(x - r * 1.05, y - r * 1.4) + ' ' + P(x + r * 1.05, y - r * 1.4) + ' ' + P(x + r, y - r * .1) + ' C' + P(x + r * .5, y - r * .7) + ' ' + P(x - r * .5, y - r * .7) + ' ' + P(x - r, y - r * .1) + ' Z" fill="#7a4a28"' + ct(.7) + '/><circle cx="' + f(x) + '" cy="' + f(y - r * 1.36) + '" r="' + f(r * .5) + '" fill="#7a4a28"' + ct(.7) + '/>';
    else if(o.coiffe === 'casquette') q += '<path d="M' + P(x - r, y - r * .26) + ' C' + P(x - r * .95, y - r * 1.5) + ' ' + P(x + r * .95, y - r * 1.5) + ' ' + P(x + r, y - r * .26) + ' Z" fill="#e5484d"' + ct(.8) + '/><path d="M' + P(x + r * .4, y - r * .34) + ' h' + f(r * 1.1) + '" stroke="' + K + '" stroke-width="' + f(r * .34) + '" stroke-linecap="round"/><path d="M' + P(x + r * .4, y - r * .34) + ' h' + f(r * 1.1) + '" stroke="#c23a40" stroke-width="' + f(r * .16) + '" stroke-linecap="round"/>';
    else if(o.coiffe === 'paille') q += '<ellipse cx="' + f(x) + '" cy="' + f(y - r * .62) + '" rx="' + f(r * 1.7) + '" ry="' + f(r * .42) + '" fill="#e6c25a"' + ct(.8) + '/><path d="M' + P(x - r * .84, y - r * .66) + ' C' + P(x - r * .84, y - r * 1.74) + ' ' + P(x + r * .84, y - r * 1.74) + ' ' + P(x + r * .84, y - r * .66) + ' Z" fill="#e6c25a"' + ct(.8) + '/><path d="M' + P(x - r * .84, y - r * .78) + ' H' + f(x + r * .84) + '" stroke="#e5484d" stroke-width="' + f(r * .26) + '"/>';
    else if(o.coiffe === 'cheveux') q += '<path d="M' + P(x - r, y) + ' C' + P(x - r * 1.1, y - r * 1.5) + ' ' + P(x + r * 1.1, y - r * 1.5) + ' ' + P(x + r, y) + ' C' + P(x + r * .5, y - r * .8) + ' ' + P(x - r * .3, y - r * .5) + ' ' + P(x - r, y) + ' Z" fill="#e6b84a"' + ct(.7) + '/>';
    return q;
  }
  function bras(ep, main, habit){ return ep.map(function(e, i){ var mx = main[0] + (i ? 1.6 : -2.4), my = main[1] + (i ? -2.4 : 3.4); return '<path d="M' + P(e[0], e[1]) + ' L' + P(mx, my) + '" stroke="' + K + '" stroke-width="5" stroke-linecap="round"/><path d="M' + P(e[0], e[1]) + ' L' + P(mx, my) + '" stroke="' + habit + '" stroke-width="3.2" stroke-linecap="round"/><circle cx="' + f(mx) + '" cy="' + f(my) + '" r="2.3" fill="#f1c7a0"' + ct(.7) + '/>'; }).join(''); }
  var PM = {}; PORTEURS.forEach(function(p){ PM[p.id] = p.main; });
  /* la dame au chignon, à sa fenêtre du premier */
  s += '<g class="vs-porteur"><path d="M-349,12 V-8 C-349,-17 -327,-17 -327,-8 V12 Z" fill="#c8574a"' + ct(1) + '/><path d="M-343,-10 L-338,-3 L-333,-10" fill="#f4ecdc"' + ct(.6) + '/>' + tete(-338, -20, 7, {coiffe:'chignon'}) + bras([[-331, -8], [-344, -7]], PM.dame, '#c8574a') + '</g>';
  /* le couvreur, assis à cheval sur le faîtage */
  s += '<g class="vs-porteur"><path d="M-156,-172 L-170,-152 L-174,-136 M-144,-172 L-132,-150 L-130,-134" fill="none" stroke="' + K + '" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/><path d="M-156,-172 L-170,-152 L-174,-136 M-144,-172 L-132,-150 L-130,-134" fill="none" stroke="#5e4430" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/><path d="M-178,-134 h8 M-134,-132 h8" stroke="' + K + '" stroke-width="3.4" stroke-linecap="round"/>' +
    '<path d="M-159,-170 V-186 C-159,-196 -141,-196 -141,-186 V-170 Z" fill="#3f6aa8"' + ct(1) + '/><path d="M-155,-170 v-14 M-145,-170 v-14" stroke="#2c4c80" stroke-width="1.4"/>' + tete(-150, -202, 7, {coiffe:'casquette'}) + bras([[-144, -188], [-156, -187]], PM.couvreur, '#3f6aa8') + '</g>';
  /* le sonneur, dans l'arche du beffroi, à côté de la Grosse Marie */
  s += '<g class="vs-porteur"><path d="M36,-306 V-326 C36,-336 58,-336 58,-326 V-306 Z" fill="#7a5a9a"' + ct(1) + '/>' + tete(47, -340, 6.6, {coiffe:'capuche', habit:'#7a5a9a'}) + bras([[53, -328], [42, -327]], PM.sonneur, '#7a5a9a') + '</g>';
  /* Basile, en haut de son échelle, contre la maison saumon */
  s += '<g class="vs-porteur">' + ombre(262, 14) + '<path d="M254,' + (SOLY + 10) + ' L240,-34 M272,' + (SOLY + 10) + ' L256,-34" stroke="' + K + '" stroke-width="4.4" stroke-linecap="round"/><path d="M254,' + (SOLY + 10) + ' L240,-34 M272,' + (SOLY + 10) + ' L256,-34" stroke="#c99a5e" stroke-width="2.8" stroke-linecap="round"/>';
  for(var e2 = 0; e2 < 12; e2++){ var u2 = (e2 + .6) / 12.4, ey = SOLY + 10 - (SOLY + 44) * u2; s += '<path d="M' + P(254 - 14 * u2, ey) + ' L' + P(272 - 16 * u2, ey) + '" stroke="' + K + '" stroke-width="3.2"/><path d="M' + P(254 - 14 * u2, ey) + ' L' + P(272 - 16 * u2, ey) + '" stroke="#a87a4a" stroke-width="1.8"/>'; }
  s += '<path d="M246,58 L247,34 M256,58 L255,34" stroke="' + K + '" stroke-width="6.4" stroke-linecap="round"/><path d="M246,58 L247,34 M256,58 L255,34" stroke="#6e4a32" stroke-width="4.4" stroke-linecap="round"/><path d="M243,60 h7 M253,60 h7" stroke="' + K + '" stroke-width="3.6" stroke-linecap="round"/>' +
    '<path d="M241,36 V12 C241,0 261,0 261,12 V36 Z" fill="#5e8ac8"' + ct(1) + '/><path d="M245,36 V10 M257,36 V10 M245,20 H257" stroke="#3f6aa8" stroke-width="1.5"/>' + tete(251, -8, 7.4, {coiffe:'paille'}) + '<path d="M245.6,-3.6 C247,2.6 255,2.6 256.4,-3.6 C254,-.4 248,-.4 245.6,-3.6 Z" fill="#b8a888"' + ct(.6) + '/>' + bras([[244, 8], [257, 9]], PM.basile, '#5e8ac8') + '</g>';
  /* le petit, debout sur un tonneau, bras levés */
  s += '<g class="vs-porteur"><path d="M-100,152 V136 M-92,152 V136" stroke="' + K + '" stroke-width="5.6" stroke-linecap="round"/><path d="M-100,152 V136 M-92,152 V136" stroke="#3f5aa8" stroke-width="3.6" stroke-linecap="round"/><path d="M-103,154 h6 M-95,154 h6" stroke="' + K + '" stroke-width="3.2" stroke-linecap="round"/>' +
    '<path d="M-104,138 V122 C-104,112 -88,112 -88,122 V138 Z" fill="#4fb06a"' + ct(1) + '/>' + tete(-96, 106, 6.6, {coiffe:'cheveux'}) + bras([[-91, 120], [-101, 120]], PM.enfant, '#4fb06a') + '</g>';
  return s;
}

MJ.VISEE_ART = {monde:monde, anneau:anneau, PORTEURS:PORTEURS, MAT:MAT, BORNES:BORNES, SOLY:SOLY, K:K, COULEURS:COULEURS, alea:alea, f:f, P:P};
})();
