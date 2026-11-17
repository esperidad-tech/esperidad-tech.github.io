/* ==========================================================
   MIMI EN GROS PLAN (Romain, 16 novembre, 20 h 00 → 20 h 14 ; DESIGN-saison1.md §12.67 et §12.76) : « de temps en temps, le chat, il
   descend et il sort un peu de l'écran par en bas. Et là, on le voit grimper et on le voit à plein écran […] ses petites pattes, elles
   s'accrochent comme si le bas de l'écran de l'atelier, c'était quelque chose sur lequel elles pouvaient s'accrocher […] d'abord ses
   petites oreilles qui arrivent, et ensuite sa petite tête qui monte […] qui regarde tout étonnée, toute mignonne » ; « il faut refaire
   sa tête […] on aura 10 fois plus de détails […] Accentuer vraiment le côté mignon […] au niveau des oreilles, des moustaches. Il faut
   s'inspirer des vrais chats » ; « la seule interaction […] lui caresser la tête […] Elle pourrait aussi lécher un peu l'écran ».

   UNE TÊTE DESSINÉE EXPRÈS, dans le même repère que sa petite tête (mimi-dessin.js : le milieu de la tête en (0, 0), le crâne de ±16,5 ;
   ses habits de la tête et du museau s'y posent donc tels quels), mais bien plus détaillée : le poil (des mèches, des rayures, les
   touffes des joues et des oreilles), des yeux à iris strié, deux reflets, une pupille qui s'ouvre et se ferme, les paupières, des
   moustaches longues et fines, les sourcils-moustaches, la truffe, la langue. Et ses deux pattes de devant, qui s'accrochent au bord.

   MimiPantin.gros(v, acc) → le SVG de la scène (la tête, les pattes ; le bord de l'écran en y = 20), à poser dans un
     <svg viewBox="-36 -48 72 72"> (GROS_VB) ; elle y est déjà en place, montée, les yeux ouverts ;
   MimiPantin.grosRig(svg) → l'animation : rig.E (les réglages : monte, regard, pupilles, paupières, yeux fermés, oreilles, moustaches,
     gueule, langue, ronron, pattes, griffes) et rig.appliquer(t) ;
   MimiPantin.grosImage(v, acc, E) → une image fixe (un <svg> complet : l'album photo).
   ========================================================== */
(function(G){
'use strict';
var M = G.MimiPantin, K = '#24182e', O = M.outils, sombre = O.sombre, clair = O.clair, mel = O.mel;
function r1(v){ return Math.round(v * 100) / 100; }
function P(d, f, w, x){ return '<path d="' + d + '" fill="' + f + '"' + (w ? ' stroke="' + K + '" stroke-width="' + w + '" stroke-linejoin="round" stroke-linecap="round"' : '') + (x || '') + '/>'; }
function T(d, c, w, x){ return '<path d="' + d + '" fill="none" stroke="' + c + '" stroke-width="' + w + '" stroke-linecap="round" stroke-linejoin="round"' + (x || '') + '/>'; }
/* un chemin et son symétrique (x → -x) */
function sym(d){ return d.replace(/(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/g, function(m, x, y){ return r1(-parseFloat(x)) + ',' + y; }); }

var GID = 0;
/* ---------- la scène : la tête et les pattes ---------- */
M.gros = function(v, acc){
  var pe = M.peau(v), p = M.CHATS[pe.p], tig = !!p[6], Y = pe.y >= 0 ? M.YEUX[pe.y] : [p[3], p[4]], Y2 = Y[3] ? [Y[3], Y[4]] : Y, id = 'mg' + (++GID);
  var F = p[0], R = p[1], L = p[2], fonce = sombre(F, 0.16), plusFonce = sombre(F, 0.3), lumiere = clair(F, 0.28), rose = '#f39ab0', roseF = '#d9667f';
  acc = acc || {};
  var defs = '<defs>' +
    '<radialGradient id="' + id + 'f" cx="50%" cy="38%" r="62%"><stop offset="0" stop-color="' + lumiere + '"/><stop offset=".55" stop-color="' + F + '"/><stop offset="1" stop-color="' + fonce + '"/></radialGradient>' +
    '<radialGradient id="' + id + 'o" cx="50%" cy="70%" r="70%"><stop offset="0" stop-color="#ffd3df"/><stop offset=".6" stop-color="' + rose + '"/><stop offset="1" stop-color="' + roseF + '"/></radialGradient>' +
    [Y, Y2].map(function(y, k){ return '<radialGradient id="' + id + 'y' + (k ? 'b' : '') + '" cx="50%" cy="45%" r="55%"><stop offset="0" stop-color="' + clair(y[0], 0.35) + '"/><stop offset=".45" stop-color="' + y[0] + '"/><stop offset=".85" stop-color="' + y[1] + '"/><stop offset="1" stop-color="' + sombre(y[1], 0.35) + '"/></radialGradient>'; }).join('') +
    '<radialGradient id="' + id + 'n" cx="40%" cy="30%" r="70%"><stop offset="0" stop-color="#ffc2d0"/><stop offset=".6" stop-color="#f08aa3"/><stop offset="1" stop-color="#c95a76"/></radialGradient>' +
    '<radialGradient id="' + id + 'm" cx="50%" cy="35%" r="65%"><stop offset="0" stop-color="#ffffff"/><stop offset=".7" stop-color="' + L + '"/><stop offset="1" stop-color="' + sombre(L, 0.08) + '"/></radialGradient>' +
    '</defs>';

  /* --- une oreille (la gauche ; la droite est son symétrique) : le dos, l'intérieur rose, les touffes, le liseré --- */
  function oreille(sg){
    var ext = 'M-15.6,-9.4 C-17.6,-17 -18.8,-26 -17,-33.6 C-16.6,-35 -15.4,-35.2 -14.4,-34.2 C-9.6,-30.2 -5.6,-24.6 -3.8,-18.8 Z';
    var inte = 'M-14.2,-12.4 C-15.6,-18.4 -16,-24.8 -15.2,-30.2 C-11.6,-27.2 -8.4,-23 -6.6,-18.2 Z';
    var touffes = 'M-13.6,-13 C-14.6,-17 -15.2,-20.6 -15.6,-24 M-12,-14.4 C-12.6,-18.4 -12.8,-21.6 -12.6,-25.4 M-10.4,-15.6 C-10.4,-19 -10,-21.6 -9.6,-24.4 M-8.6,-16.8 C-8.2,-19.4 -7.6,-21 -7,-22.6';
    var bord = 'M-16.2,-15 C-17.2,-22 -17.4,-28 -16.4,-32.6';
    var g = P(ext, 'url(#' + id + 'f)', 1.5) + (tig ? P('M-16.6,-28.6 C-16.4,-31.6 -15.8,-33.6 -15,-34 C-14,-33.2 -12.6,-31.8 -11.6,-30.6 Z', R) : '') +
      P(inte, 'url(#' + id + 'o)') + T(touffes, '#fffaf4', 0.55, ' opacity=".95"') + T(bord, lumiere, 0.7, ' opacity=".8"') + T(ext, K, 1.5);
    if(sg > 0) g = g.replace(/d="([^"]*)"/g, function(m, d){ return 'd="' + sym(d) + '"'; });
    return '<g data-g="or' + (sg < 0 ? 'G' : 'D') + '">' + g + '</g>';
  }
  /* --- un œil (centre ex) : le blanc à peine, l'iris strié, la pupille (elle s'ouvre : data-g="pup"), deux reflets, les paupières --- */
  function oeil(ex, cote){
    var sg = cote === 'G' ? -1 : 1;      /* (le coin de l'œil, vers l'extérieur) */
    var forme = 'M' + (ex - 6.6) + ',-2.4 C' + (ex - 5.6) + ',-8.4 ' + (ex + 5.6) + ',-8.4 ' + (ex + 6.6) + ',-2.4 C' + (ex + 5.4) + ',3.4 ' + (ex - 5.4) + ',3.4 ' + (ex - 6.6) + ',-2.4 Z';
    var stries = '';
    for(var k = 0; k < 16; k++){ var a = k / 16 * Math.PI * 2; stries += 'M' + r1(ex + Math.cos(a) * 1.9) + ',' + r1(-2.6 + Math.sin(a) * 1.9) + ' L' + r1(ex + Math.cos(a) * 4.6) + ',' + r1(-2.6 + Math.sin(a) * 4.6) + ' '; }
    return '<g data-g="oeil' + cote + '">' +
      P(forme, '#2a2036') +
      '<g data-g="iris' + cote + '"><circle cx="' + ex + '" cy="-2.6" r="5.3" fill="url(#' + id + 'y' + (cote === 'D' && Y2 !== Y ? 'b' : '') + ')"/>' +
        T(stries, sombre((cote === 'D' ? Y2 : Y)[1], 0.25), 0.35, ' opacity=".55"') +
        '<circle cx="' + ex + '" cy="-2.6" r="5.3" fill="none" stroke="' + sombre((cote === 'D' ? Y2 : Y)[1], 0.45) + '" stroke-width=".7" opacity=".8"/>' +
        '<ellipse data-g="pup' + cote + '" cx="' + ex + '" cy="-2.6" rx="1.4" ry="4.4" fill="#120c1c"/>' +
        '<circle cx="' + r1(ex - 1.9) + '" cy="-5.2" r="1.55" fill="#ffffff"/><circle cx="' + r1(ex + 1.9) + '" cy="-0.4" r=".75" fill="#ffffff" opacity=".9"/>' +
        '<path d="M' + r1(ex - 4) + ',-0.2 Q' + ex + ',2.2 ' + r1(ex + 4) + ',-0.2" fill="none" stroke="#ffffff" stroke-width=".5" opacity=".35"/></g>' +
      T('M' + (ex - 6.6) + ',-2.4 C' + (ex - 5.6) + ',-8.4 ' + (ex + 5.6) + ',-8.4 ' + (ex + 6.6) + ',-2.4', K, 1.25) +
      T('M' + (ex + sg * 6.6) + ',-2.6 l' + (sg * 1.4) + ',-1.1', K, 0.9) +
      T('M' + (ex - 5.2) + ',1.6 C' + (ex - 2.4) + ',3.4 ' + (ex + 2.4) + ',3.4 ' + (ex + 5.2) + ',1.6', sombre(F, 0.35), 0.5, ' opacity=".6"') +
      '</g>' +
      /* fermé de plaisir : deux arcs souriants (data-g="clos") */
      '<g data-g="clos' + cote + '" opacity="0">' + P('M' + (ex - 7.6) + ',-2.4 C' + (ex - 6.6) + ',-10.8 ' + (ex + 6.6) + ',-10.8 ' + (ex + 7.6) + ',-2.4 C' + (ex + 6.4) + ',4.8 ' + (ex - 6.4) + ',4.8 ' + (ex - 7.6) + ',-2.4 Z', 'url(#' + id + 'f)') +
        T('M' + (ex - 5.4) + ',-0.6 Q' + ex + ',-5.4 ' + (ex + 5.4) + ',-0.6', K, 1.35) + T('M' + (ex + sg * 5.4) + ',-0.6 l' + (sg * 1.2) + ',.6', K, 0.9) + '</g>';
  }
  /* --- les moustaches d'un côté (dans un groupe qui pivote) --- */
  function moustaches(sg){
    var l = [['M-8.4,8 C-14,5.6 -22,4.4 -31,5.4'], ['M-8.6,9.6 C-15,9 -23,9.6 -31.4,11.6'], ['M-8.2,11.2 C-14,12.4 -21,14.6 -28.4,18.2'], ['M-7.6,12.4 C-12,14.6 -16.6,17.6 -21,21.2']];
    var s = '';
    l.forEach(function(q){ var d = sg > 0 ? sym(q[0]) : q[0]; s += T(d, K, 1.05, ' opacity=".25"') + T(d, '#fffdf8', 0.55); });
    return '<g data-g="mou' + (sg < 0 ? 'G' : 'D') + '">' + s + '</g>';
  }
  /* --- la tête --- */
  var crane = 'M-15.2,-10.8 C-13,-19 -6.4,-21.8 0,-21.8 C6.4,-21.8 13,-19 15.2,-10.8 C17.6,-4.8 19.4,1.2 18.4,6 L21.8,7.6 L18.2,9.6 L21,12.8 L15.8,13.2 L17.4,15.8 L12.6,15.6 C9,19.2 4.6,20.4 0,20.4 C-4.6,20.4 -9,19.2 -12.6,15.6 L-17.4,15.8 L-15.8,13.2 L-21,12.8 L-18.2,9.6 L-21.8,7.6 L-18.4,6 C-19.4,1.2 -17.6,-4.8 -15.2,-10.8 Z';
  /* des mèches : plus sombres sur les bords, plus claires dans le front */
  var meches = '', mechesC = '';
  [[-12.6, -14.6, -10.6, -11.2], [-9.4, -18.4, -7.8, -14.6], [9.4, -18.4, 7.8, -14.6], [12.6, -14.6, 10.6, -11.2], [-16.2, -4, -13.6, -2.2], [16.2, -4, 13.6, -2.2], [-17.2, 2.4, -14.4, 3.2], [17.2, 2.4, 14.4, 3.2]].forEach(function(q){ meches += 'M' + q[0] + ',' + q[1] + ' L' + q[2] + ',' + q[3] + ' '; });
  [[-3.4, -19.6, -2.6, -16.4], [3.4, -19.6, 2.6, -16.4], [-6.6, -17.8, -5.4, -15], [6.6, -17.8, 5.4, -15], [0, -20.2, 0, -17.2]].forEach(function(q){ mechesC += 'M' + q[0] + ',' + q[1] + ' L' + q[2] + ',' + q[3] + ' '; });
  /* les rayures : le « M » du front, deux de chaque côté des joues */
  var rayures = tig ? P('M-1.2,-21.4 L0,-12.2 L1.2,-21.4 Z M-6.8,-20.4 C-6,-16 -5,-13.2 -3.6,-10.8 C-4,-14 -4.4,-17.4 -4.6,-21 Z M6.8,-20.4 C6,-16 5,-13.2 3.6,-10.8 C4,-14 4.4,-17.4 4.6,-21 Z', R) +
    P('M-18.8,-1.4 C-16,-0.6 -14.4,0.4 -13.2,1.8 C-15,1.6 -16.8,1.2 -18.9,1 Z M-19,4.2 C-16.4,4.6 -14.8,5.4 -13.6,6.6 C-15.4,6.6 -17.2,6.4 -19.2,6.6 Z', R) +
    P(sym('M-18.8,-1.4 C-16,-0.6 -14.4,0.4 -13.2,1.8 C-15,1.6 -16.8,1.2 -18.9,1 Z M-19,4.2 C-16.4,4.6 -14.8,5.4 -13.6,6.6 C-15.4,6.6 -17.2,6.4 -19.2,6.6 Z'), R) : '';
  var museau = P('M-9.8,8.6 C-9.8,4.2 -4.2,2.6 0,5.6 C4.2,2.6 9.8,4.2 9.8,8.6 C9.8,13.4 4.4,14.6 0,13 C-4.4,14.6 -9.8,13.4 -9.8,8.6 Z', 'url(#' + id + 'm)') +
    P('M-4.6,13.2 C-3.4,17 3.4,17 4.6,13.2 C2.6,14.2 -2.6,14.2 -4.6,13.2 Z', mel(L, F, 0.25));
  var points = [[-4.6, 8.6], [-6.8, 7.8], [-6.2, 10.4], [-8.4, 9.6], [4.6, 8.6], [6.8, 7.8], [6.2, 10.4], [8.4, 9.6]].map(function(q){ return '<circle cx="' + q[0] + '" cy="' + q[1] + '" r=".42" fill="' + sombre(L, 0.45) + '"/>'; }).join('');
  var truffe = '<g data-g="truffe">' + P('M-2.9,4 C-2.9,2.4 2.9,2.4 2.9,4 C2.9,5.6 0.9,7.3 0,7.6 C-0.9,7.3 -2.9,5.6 -2.9,4 Z', 'url(#' + id + 'n)', 0.9) +
    '<ellipse cx="-1.1" cy="3.6" rx="1" ry=".5" fill="#ffffff" opacity=".75"/>' + T('M-1.4,5.4 Q-0.8,6 -0.4,5.6 M1.4,5.4 Q0.8,6 0.4,5.6', '#a8445e', 0.5) + '</g>';
  var bouche = '<g data-g="bouche">' + T('M0,7.6 L0,9 M0,9 Q-2,11.6 -4.6,9.8 M0,9 Q2,11.6 4.6,9.8', K, 0.95) + '</g>' +
    '<g data-g="gueule" opacity="0">' + P('M-3.6,9.2 C-3.8,15 3.8,15 3.6,9.2 C1.6,10.6 -1.6,10.6 -3.6,9.2 Z', '#5b1d34', 0.8) + P('M-2.4,12.8 C-1.8,11 1.8,11 2.4,12.8 C1.2,14 -1.2,14 -2.4,12.8 Z', '#ff8fab') +
      P('M-3,9.8 L-2.3,11.6 L-1.6,10.2 Z M3,9.8 L2.3,11.6 L1.6,10.2 Z', '#ffffff') + '</g>' +
    '<g data-g="langue" opacity="0">' + P('M-3.4,9.6 C-4,17 -2.4,21.4 0,21.6 C2.4,21.4 4,17 3.4,9.6 Z', '#ff8fab', 0.8) + T('M0,11 L0,17.6', '#e4668a', 0.7) + '<ellipse cx="-1.4" cy="14" rx=".9" ry="1.8" fill="#ffd0dc" opacity=".8"/></g>';
  var joues = '<ellipse cx="-12.4" cy="5.2" rx="3.2" ry="1.9" fill="#ff8aa6" opacity=".35"/><ellipse cx="12.4" cy="5.2" rx="3.2" ry="1.9" fill="#ff8aa6" opacity=".35"/>';
  var sourcils = T('M-9.8,-9.4 C-11.4,-13 -11.6,-16.4 -10.4,-19.6 M-7.6,-9.6 C-8.4,-12.6 -8.2,-15.2 -7.2,-17.6', '#fffdf8', 0.4, ' opacity=".9"') +
    T(sym('M-9.8,-9.4 C-11.4,-13 -11.6,-16.4 -10.4,-19.6 M-7.6,-9.6 C-8.4,-12.6 -8.2,-15.2 -7.2,-17.6'), '#fffdf8', 0.4, ' opacity=".9"');
  var tete = '<g data-g="tete">' +
    oreille(-1) + oreille(1) +
    (acc.cou || '') +
    P(crane, 'url(#' + id + 'f)', 1.6) +
    T(meches, plusFonce, 0.55, ' opacity=".55"') + T(mechesC, lumiere, 0.55, ' opacity=".7"') + rayures +
    joues + museau + points + truffe + bouche +
    oeil(-7.8, 'G') + oeil(7.8, 'D') + sourcils +
    moustaches(-1) + moustaches(1) +
    (acc.tete || '') +
    '</g>';
  /* --- les pattes de devant, accrochées au bord (vues d'en haut : quatre doigts, les griffes qui dépassent) --- */
  function patte(sg){
    /* (0, 0) : le milieu du bas de la patte, sur le bord de l'écran ; l'avant-bras descend derrière le bord (on ne le voit pas) */
    var pied = (tig || pe.p !== 2) ? (tig ? mel(F, L, 0.3) : F) : L;
    var dome = 'M-7.2,0 C-7.8,-5.4 -6.2,-10.4 -3.6,-11.4 C-1.2,-12.4 1.2,-12.4 3.6,-11.4 C6.2,-10.4 7.8,-5.4 7.2,0 C5.4,1.2 3.6,1 1.8,.4 C.6,1.1 -.6,1.1 -1.8,.4 C-3.6,1 -5.4,1.2 -7.2,0 Z';
    var doigts = T('M-3.6,.6 C-3.4,-1.4 -3.2,-2.8 -3.2,-4.2 M0,.9 L0,-4.4 M3.6,.6 C3.4,-1.4 3.2,-2.8 3.2,-4.2', sombre(pied, 0.3), 0.7);
    var griffes = '<g data-g="gri' + (sg < 0 ? 'G' : 'D') + '">' + [-5.4, -1.8, 1.8, 5.4].map(function(x){ var d = 'M' + x + ',.6 q.5,1.5 -.3,2.6'; return T(d, K, 1.3) + T(d, '#fffaf0', 0.6); }).join('') + '</g>';
    return '<g data-g="pat' + (sg < 0 ? 'G' : 'D') + '">' + P('M-6.8,-2 L-6.6,22 L6.6,22 L6.8,-2 Z', 'url(#' + id + 'f)', 1.4) +
      griffes + P(dome, pied, 1.4) + (tig ? T('M-6,-7.4 C-3,-8.6 3,-8.6 6,-7.4', R, 1.2, ' opacity=".6"') : '') + doigts +
      T('M-4.6,-9.4 C-2.4,-10.6 1.2,-10.8 3.4,-10', clair(pied, 0.4), 0.8, ' opacity=".8"') + '</g>';
  }
  return defs + '<g data-g="corps" transform="translate(0,-2)">' + P('M-15,14 C-17,22 -18,30 -18,40 L18,40 C18,30 17,22 15,14 Z', 'url(#' + id + 'f)', 1.6) +
    P('M-8,15 C-6,22 6,22 8,15 C9,24 8,32 0,40 C-8,32 -9,24 -8,15 Z', 'url(#' + id + 'm)') + '</g>' +
    tete.replace('<g data-g="tete">', '<g data-g="tete" transform="translate(0,-2)">') +
    patte(-1).replace('<g data-g="patG">', '<g data-g="patG" transform="translate(-13.5,20)">') + patte(1).replace('<g data-g="patD">', '<g data-g="patD" transform="translate(13.5,20)">');
};
M.GROS_VB = '-36 -48 72 72';

/* ---------- l'animation ----------
   E.monte : 0 (cachée sous le bord) … 1 (montée, le menton au bord) ; E.tilt : la tête penchée (degrés) ; E.dx : de côté ;
   E.lx, E.ly : le regard (-1 … 1) ; E.pup : les pupilles (0 fente … 1 rondes) ; E.pau : la paupière (0 ouverte … 1 fermée) ;
   E.clos : les yeux fermés de plaisir (0 … 1) ; E.orG, E.orD : les oreilles (degrés : + vers l'extérieur, en arrière) ;
   E.mou : les moustaches (degrés : + vers l'avant) ; E.gueule, E.langue : 0 … 1 ; E.ronron : 0 … 1 (elle vibre) ;
   E.patG, E.patD : les pattes (0 : posées sur le bord ; 30 : cachées dessous) ; E.griG, E.griD : les griffes (0 … 1) */
M.grosRig = function(svg){
  var g = {};
  Array.prototype.forEach.call(svg.querySelectorAll('[data-g]'), function(e){ g[e.getAttribute('data-g')] = e; });
  var E = {monte:1, tilt:0, dx:0, lx:0, ly:0, pup:0.35, pau:0, clos:0, orG:0, orD:0, mou:0, gueule:0, langue:0, ronron:0, patG:0, patD:0, griG:1, griD:1};
  var vu = {};
  function met(k, at, v){ var e = g[k]; if(!e) return; var c = k + '|' + at; if(vu[c] === v) return; vu[c] = v; e.setAttribute(at, v); }
  function f(v){ return (Math.round(v * 100) / 100).toString(); }
  return {E:E, g:g, appliquer:function(t){
    var y = (1 - E.monte) * 64 - 2 + (E.ronron ? Math.sin(t * 46) * 0.18 * E.ronron : 0);
    met('tete', 'transform', 'translate(' + f(E.dx) + ',' + f(y) + ') rotate(' + f(E.tilt) + ',0,16)');
    met('corps', 'transform', 'translate(' + f(E.dx * 0.6) + ',' + f(y) + ')');
    met('patG', 'transform', 'translate(-13.5,' + f(20 + E.patG) + ')');
    met('patD', 'transform', 'translate(13.5,' + f(20 + E.patD) + ')');
    met('griG', 'transform', 'scale(1,' + f(Math.max(0.01, E.griG)) + ')');
    met('griD', 'transform', 'scale(1,' + f(Math.max(0.01, E.griD)) + ')');
    ['G', 'D'].forEach(function(c){
      met('iris' + c, 'transform', 'translate(' + f(E.lx * 1.5) + ',' + f(E.ly * 1.3) + ')');
      met('pup' + c, 'rx', f(1.2 + E.pup * 3.4));
      /* (le clignement : l'œil s'écrase autour de sa ligne du milieu ; fermé, il n'en reste qu'un trait) */
      var sy = 1 - 0.93 * Math.min(1, Math.max(0, E.pau));
      met('oeil' + c, 'transform', 'translate(0,-1.2) scale(1,' + f(sy) + ') translate(0,1.2)');
      met('clos' + c, 'opacity', f(E.clos));
    });
    met('orG', 'transform', 'rotate(' + f(-E.orG) + ',-9.6,-14)');
    met('orD', 'transform', 'rotate(' + f(E.orD) + ',9.6,-14)');
    met('mouG', 'transform', 'rotate(' + f(E.mou) + ',-8.4,9.6)');
    met('mouD', 'transform', 'rotate(' + f(-E.mou) + ',8.4,9.6)');
    var ouv = Math.max(E.gueule, E.langue > 0.02 ? 1 : 0);
    met('bouche', 'opacity', ouv > 0.5 ? '0' : '1');
    met('gueule', 'opacity', E.gueule > 0.5 && E.langue < 0.02 ? '1' : '0');
    met('langue', 'opacity', E.langue > 0.02 ? '1' : '0');
    met('langue', 'transform', 'translate(0,9.6) scale(1,' + f(Math.max(0.05, E.langue)) + ') translate(0,-9.6)');
  }};
};
/* une image fixe (l'album) : la même scène, un regard et des yeux au choix */
M.grosImage = function(v, acc, E){
  var d = document.createElement('div');
  d.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="' + M.GROS_VB + '" aria-hidden="true">' + M.gros(v, acc) + '</svg>';
  var svg = d.firstChild, r = M.grosRig(svg);
  for(var k in (E || {})) r.E[k] = E[k];
  r.appliquer(0);
  return d.innerHTML;
};
})(window);
