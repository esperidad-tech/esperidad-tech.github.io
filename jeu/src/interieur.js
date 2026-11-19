/* ==========================================================
   Brumeval — L'INTÉRIEUR DES MAISONS, vu de dessus (interieur.js)
   Romain, 16 novembre, 22 h 43 : « une maison très détaillée avec des textures très détaillées […] c'est sans doute quelque chose
   qui va se reproduire dans d'autres maisons. Je ne veux pas juste des carrés et des ronds […] des objets un petit peu complexes,
   bien dessinés […] des jolis effets de lumière. »

   Deux choses ici :
   1. UN ATELIER DE DESSIN (MJ.Interieur) : une pièce de 600 × 800, vue de dessus. Le plancher (des lames, leurs veines, leurs nœuds,
      leurs clous), les murs de pierre, et des meubles tout faits (MEUBLES : le lit, la table ronde, la cheminée, le buffet, le
      fauteuil à bascule, les paniers, le coffre, les tapis, les plantes…). Tout est dessiné au trait, sans filtre (RAPIDITE.md :
      rien qui coûte à chaque image) ; les textures sont des traits tirés d'une graine : le même dessin à chaque fois.
      La lumière vient par-dessus : la pénombre du matin, le rayon de soleil de l'après-midi (ses carreaux, les ombres longues),
      la poussière qui danse, la braise de la cheminée.
      RAPIDITE.md : une pièce, c'est 2 000 traits. On ne les redessine JAMAIS. La pièce est une pile de calques (dessiner) :
        .in-fond    le décor, immobile (dessiné une fois) ;
        .in-rayons  le soleil et ses ombres : le calque entier respire (son opacité) ;
        .in-ors     les trois dalles que le soleil allume (une lueur dorée, sans signe) : le calque entier palpite ;
        .in-grains, .in-feu   des pastilles HTML (la poussière, la braise) : position et opacité seulement ;
        .in-vie     ce qui prend le doigt (les dalles, les meubles à regarder) et la dalle qui glisse.
      1 em = 1 unité du dessin (la taille des lettres de .in-piece est réglée par caler).
      Une maison = une fiche dans MAISONS (ses meubles, ses fenêtres, sa porte, ce qu'on peut y regarder) : pour une autre maison,
      on écrit une autre fiche.
   2. LE MINI-JEU « interieur » : on fouille la pièce du bout du doigt. Chez Odette (enquête 3), neuf vieilles dalles, SANS AUCUN SIGNE
      (Romain, 19 novembre : « il n'y a pas de signe, il n'y a pas de clé […] c'est juste il faut appuyer sur des dalles » ; « il n'y a
      pas de message qui dit quoi que ce soit comme indice »). Trois dalles, dans le bon ordre, et la cachette s'ouvre.
      · Le matin : la pièce est dans l'ombre, AUCUNE aide ; on peut appuyer sur les dalles, mais rien ne dit lesquelles (un coup de
        chance sur 504 : tant mieux pour lui s'il trouve).
      · L'après-midi : trois secondes après l'entrée, le soleil allume une dalle, une seconde plus tard une deuxième, une seconde plus
        tard une troisième : c'est l'ordre. Après un essai raté, elles s'éteignent et se rallument, dans le même ordre.
      On n'y perd jamais : on essaie autant qu'on veut, ou on ressort (sorti:true : pas de fenêtre « Raté », moteur-actions.js).
        params : maison ('odette'), moment ('matin' | 'apresmidi' | 'nuit'), visite (true : on regarde seulement, les dalles ne bougent pas)
        résultat : {reussi, message, detail, essais, sorti}
        crochet de test : window.__interieur = {etat(), dalle(k), sortir()}
      (Les noms de D.signes — 'lune', 'cloche'… — ne sont plus que les noms des dalles dans le code : on ne les dessine nulle part.)
   ========================================================== */
(function(){
'use strict';
var MJ = window.MJ = window.MJ || {};
var U = MJ.util;
var W = 600, H = 800, MUR = 28, TR = '#2c2118';
function n(v){ return Math.round(v * 10) / 10; }
function esc(s){ return String(s).replace(/[&<>"']/g, function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]; }); }
function graine(s){ return function(){ s |= 0; s = s + 0x6D2B79F5 | 0; var t = Math.imul(s ^ s >>> 15, 1 | s); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
function hsl(h, s, l){ return 'hsl(' + n(h) + ',' + n(s) + '%,' + n(l) + '%)'; }
var uidN = 0;

/* ---------- Les neuf signes des vieilles dalles (dans un carré de −16 à 16) ---------- */
var SIGNES = {
  lune:{nom:'la lune', d:'M5 -14A15 15 0 1 0 5 14A11.5 11.5 0 1 1 5 -14Z'},
  oeil:{nom:'l\'œil', d:'M-15 0Q0 -13 15 0Q0 13 -15 0ZM5 0A5 5 0 1 1 -5 0A5 5 0 1 1 5 0Z'},
  cloche:{nom:'la cloche', d:'M-11 8C-11 -5 -7 -13 0 -13C7 -13 11 -5 11 8ZM-14 8H14M-2.5 12A2.5 2.5 0 1 0 2.5 12'},
  chaudron:{nom:'le chaudron', d:'M-13 -5C-13 9 -7 13 0 13C7 13 13 9 13 -5ZM-15 -7H15M-8 12L-10 16M8 12L10 16'},
  lanterne:{nom:'la lanterne', d:'M-7 -7H7V11H-7ZM-9 -7H9M-9 11H9M-3 -7C-3 -15 3 -15 3 -7M0 7C-4 3 0 1 0 -3C0 1 4 3 0 7Z'},
  etoile:{nom:'l\'étoile', d:'M0 -16L4 -4L16 0L4 4L0 16L-4 4L-16 0L-4 -4Z'},
  lyre:{nom:'la lyre', d:'M-8 -14C-16 -3 -11 12 0 12C11 12 16 -3 8 -14M-9 -8H9M-4 -8V10M0 -8V12M4 -8V10'},
  arbre:{nom:'l\'arbre', d:'M0 15V1M-6 15H6M-8 -7A8 8 0 1 0 8 -7A8 8 0 1 0 -8 -7Z'},
  cle:{nom:'la clé', d:'M-3 0A5.5 5.5 0 1 1 -14 0A5.5 5.5 0 1 1 -3 0ZM-3 0H15M10 0V6M14.5 0V5'}
};
function signeSVG(id, taille, couleur, epais){
  var S = SIGNES[id]; if(!S) return '';
  return '<svg class="in-signe" viewBox="-20 -20 40 40" width="' + (taille || 28) + '" height="' + (taille || 28) + '" role="img" aria-label="' + esc(S.nom) + '"><path d="' + S.d + '" fill="none" stroke="' + (couleur || 'currentColor') + '" stroke-width="' + (epais || 2.4) + '" stroke-linecap="round" stroke-linejoin="round"/></svg>';
}

/* ==========================================================
   Les textures
   ========================================================== */
/* le plancher : quatorze rangées de lames, chacune avec sa teinte, ses veines, parfois un nœud, deux clous à chaque bout */
function plancher(R){
  var s = '<rect x="' + MUR + '" y="' + MUR + '" width="' + (W - 2 * MUR) + '" height="' + (H - 2 * MUR) + '" fill="#8a5c34"/>', nb = 14, larg = (W - 2 * MUR) / nb, c, k;
  for(c = 0; c < nb; c++){
    var x = MUR + c * larg, y = MUR - R() * 130;
    while(y < H - MUR){
      var h = 150 + R() * 200, y0 = Math.max(MUR, y), y1 = Math.min(H - MUR, y + h), lg = y1 - y0;
      if(lg > 6){
        s += '<rect x="' + n(x) + '" y="' + n(y0) + '" width="' + n(larg) + '" height="' + n(lg) + '" fill="' + hsl(27 + R() * 8, 36 + R() * 12, 38 + R() * 11) + '"/>';
        for(k = 0; k < 5; k++){
          var vx = x + 3 + R() * (larg - 6), d = (R() - .5) * 7;
          s += '<path d="M' + n(vx) + ' ' + n(y0 + 2) + 'C' + n(vx + d) + ' ' + n(y0 + lg * .33) + ' ' + n(vx - d) + ' ' + n(y0 + lg * .66) + ' ' + n(vx + d * .4) + ' ' + n(y1 - 2) + '" fill="none" stroke="rgba(52,26,8,' + n(.1 + R() * .2) + ')" stroke-width="' + n(.5 + R() * .9) + '"/>';
        }
        if(R() < .34 && lg > 70){
          var kx = x + 9 + R() * (larg - 18), ky = y0 + 24 + R() * (lg - 48);
          s += '<path d="M' + n(kx - 9) + ' ' + n(ky - 22) + 'C' + n(kx - 9) + ' ' + n(ky - 8) + ' ' + n(kx - 9) + ' ' + n(ky + 8) + ' ' + n(kx - 8) + ' ' + n(ky + 22) + 'M' + n(kx + 9) + ' ' + n(ky - 22) + 'C' + n(kx + 10) + ' ' + n(ky - 8) + ' ' + n(kx + 10) + ' ' + n(ky + 8) + ' ' + n(kx + 8) + ' ' + n(ky + 22) + '" fill="none" stroke="rgba(52,26,8,.2)" stroke-width="1"/>' +
            '<ellipse cx="' + n(kx) + '" cy="' + n(ky) + '" rx="6" ry="9.5" fill="rgba(74,38,12,.34)"/><ellipse cx="' + n(kx) + '" cy="' + n(ky) + '" rx="3.6" ry="6" fill="none" stroke="rgba(40,18,4,.4)" stroke-width="1"/><ellipse cx="' + n(kx) + '" cy="' + n(ky) + '" rx="1.8" ry="3" fill="rgba(34,14,2,.6)"/>';
        }
        if(y1 < H - MUR - 1) s += '<path d="M' + n(x) + ' ' + n(y1) + 'h' + n(larg) + '" stroke="rgba(26,12,4,.6)" stroke-width="1.5"/><circle cx="' + n(x + 7) + '" cy="' + n(y1 - 6) + '" r="1.5" fill="rgba(20,10,4,.7)"/><circle cx="' + n(x + larg - 7) + '" cy="' + n(y1 - 6) + '" r="1.5" fill="rgba(20,10,4,.7)"/><circle cx="' + n(x + 7) + '" cy="' + n(y1 + 6) + '" r="1.5" fill="rgba(20,10,4,.7)"/><circle cx="' + n(x + larg - 7) + '" cy="' + n(y1 + 6) + '" r="1.5" fill="rgba(20,10,4,.7)"/>';
      }
      y += h;
    }
    s += '<path d="M' + n(x) + ' ' + MUR + 'V' + (H - MUR) + '" stroke="rgba(26,12,4,.55)" stroke-width="1.4"/><path d="M' + n(x + 1.6) + ' ' + MUR + 'V' + (H - MUR) + '" stroke="rgba(255,226,170,.11)" stroke-width="1.1"/>';
  }
  return s;
}
/* un mur de pierres, vu du dessus : deux rangs de moellons sur l'épaisseur, chacun avec sa teinte, son joint, son éclat */
function mur(x, y, w, h, R){
  var s = '<rect x="' + n(x) + '" y="' + n(y) + '" width="' + n(w) + '" height="' + n(h) + '" fill="#4f4840"/>', long = Math.max(w, h), horiz = w >= h, ep = horiz ? h : w, rang, p;
  for(rang = 0; rang < 2; rang++){
    p = -R() * 14;
    while(p < long){
      var l = 18 + R() * 20, a = Math.max(0, p) + 1, b = Math.min(long, p + l) - 1, e0 = rang * ep / 2 + 1.2, e1 = ep / 2 - 2.4;
      if(b - a > 4){
        var rx = horiz ? x + a : x + e0, ry = horiz ? y + e0 : y + a, rw = horiz ? b - a : e1, rh = horiz ? e1 : b - a;
        s += '<rect x="' + n(rx) + '" y="' + n(ry) + '" width="' + n(rw) + '" height="' + n(rh) + '" rx="3.4" fill="' + hsl(30 + R() * 14, 7 + R() * 9, 50 + R() * 16) + '" stroke="#2f2923" stroke-width=".9"/>' +
          '<path d="M' + n(rx + 2.5) + ' ' + n(ry + 2.4) + (horiz ? 'h' + n(rw * .5) : 'v' + n(rh * .5)) + '" stroke="rgba(255,250,235,.3)" stroke-width="1.2" stroke-linecap="round"/>';
        if(R() < .3) s += '<circle cx="' + n(rx + rw * (.3 + R() * .4)) + '" cy="' + n(ry + rh * (.3 + R() * .4)) + '" r="' + n(.8 + R() * 1.2) + '" fill="rgba(40,34,28,.4)"/>';
      }
      p += l;
    }
  }
  return s;
}
/* un poteau de chêne, dans un angle : les cernes du bois */
function poteau(cx, cy){
  return '<rect x="' + (cx - 17) + '" y="' + (cy - 17) + '" width="34" height="34" rx="4" fill="#6b4424" stroke="' + TR + '" stroke-width="2"/>' +
    '<circle cx="' + cx + '" cy="' + cy + '" r="11" fill="none" stroke="rgba(40,20,6,.45)" stroke-width="1.2"/><circle cx="' + cx + '" cy="' + cy + '" r="6.5" fill="none" stroke="rgba(40,20,6,.4)" stroke-width="1"/><circle cx="' + cx + '" cy="' + cy + '" r="2.4" fill="rgba(40,20,6,.55)"/>' +
    '<path d="M' + (cx - 13) + ' ' + (cy - 13) + 'h8" stroke="rgba(255,220,170,.3)" stroke-width="1.6" stroke-linecap="round"/>';
}
/* l'osier d'un panier : des brins croisés */
function osier(cx, cy, rx, ry, R, teinte){
  var s = '<ellipse cx="' + n(cx + 4) + '" cy="' + n(cy + 6) + '" rx="' + n(rx + 1) + '" ry="' + n(ry + 1) + '" fill="rgba(18,8,0,.3)"/>' +
    '<ellipse cx="' + n(cx) + '" cy="' + n(cy) + '" rx="' + n(rx) + '" ry="' + n(ry) + '" fill="' + (teinte || '#b8894e') + '" stroke="' + TR + '" stroke-width="2"/>', k;
  for(k = 0; k < 22; k++){
    var a = k / 22 * Math.PI * 2, c = Math.cos(a), si = Math.sin(a);
    s += '<path d="M' + n(cx + c * rx * .72) + ' ' + n(cy + si * ry * .72) + 'L' + n(cx + c * rx * .97) + ' ' + n(cy + si * ry * .97) + '" stroke="rgba(70,40,12,.55)" stroke-width="1.6"/>';
  }
  return s + '<ellipse cx="' + n(cx) + '" cy="' + n(cy) + '" rx="' + n(rx * .86) + '" ry="' + n(ry * .86) + '" fill="none" stroke="rgba(255,225,170,.4)" stroke-width="1.4" stroke-dasharray="5 4"/>' +
    '<ellipse cx="' + n(cx) + '" cy="' + n(cy) + '" rx="' + n(rx * .7) + '" ry="' + n(ry * .7) + '" fill="#6e4a22" stroke="rgba(40,20,6,.6)" stroke-width="1.2"/>';
}

/* ==========================================================
   Les meubles (tous vus de dessus ; chacun pose son ombre)
   ========================================================== */
var BRAISES = [[-22, 2, 4], [-8, 8, 5], [6, 0, 4.4], [18, 9, 3.6], [-2, -6, 3.2], [26, -2, 3], [-30, 10, 3]];
var MEUBLES = {
  /* un tapis tressé, ovale : des anneaux de laine et leurs points */
  tapis:function(o){
    var cols = o.cols || ['#7d3340', '#c58a3c', '#3c6464', '#d6c79f', '#62466f'], s = '<ellipse cx="' + (o.x + 3) + '" cy="' + (o.y + 4) + '" rx="' + (o.rx + 2) + '" ry="' + (o.ry + 2) + '" fill="rgba(18,8,0,.22)"/>', nb = 9, k;
    for(k = 0; k < nb; k++){
      var u = 1 - k / nb;
      s += '<ellipse cx="' + o.x + '" cy="' + o.y + '" rx="' + n(o.rx * u) + '" ry="' + n(o.ry * u) + '" fill="' + cols[k % cols.length] + '" stroke="rgba(30,14,4,.5)" stroke-width="1"/>' +
        '<ellipse cx="' + o.x + '" cy="' + o.y + '" rx="' + n(o.rx * (u - .055)) + '" ry="' + n(o.ry * (u - .055)) + '" fill="none" stroke="rgba(255,240,210,.32)" stroke-width="1.3" stroke-dasharray="3 5"/>';
    }
    return s;
  },
  /* le paillasson de l'entrée */
  paillasson:function(o){
    var s = '<rect x="' + o.x + '" y="' + o.y + '" width="' + o.w + '" height="' + o.h + '" rx="3" fill="#a07a44" stroke="' + TR + '" stroke-width="1.6"/>', k;
    for(k = 1; k < 12; k++) s += '<path d="M' + n(o.x + k * o.w / 12) + ' ' + (o.y + 2) + 'v' + (o.h - 4) + '" stroke="rgba(60,34,10,.4)" stroke-width="1"/>';
    return s + '<rect x="' + (o.x + 5) + '" y="' + (o.y + 5) + '" width="' + (o.w - 10) + '" height="' + (o.h - 10) + '" rx="2" fill="none" stroke="rgba(120,30,30,.6)" stroke-width="2"/>';
  },
  /* la cheminée, contre le mur du haut : son manteau de pierre, ses bûches, sa braise, la pierre de l'âtre */
  cheminee:function(o, R){
    var x = o.x, w = o.w, s = '';
    s += '<rect x="' + (x - 3) + '" y="' + (MUR + 72) + '" width="' + (w + 12) + '" height="36" rx="3" fill="rgba(18,8,0,.3)"/><rect x="' + (x - 6) + '" y="' + (MUR + 68) + '" width="' + (w + 12) + '" height="36" rx="3" fill="#8f877a" stroke="' + TR + '" stroke-width="2"/>';
    for(var k = 1; k < 5; k++) s += '<path d="M' + n(x - 6 + k * (w + 12) / 5) + ' ' + (MUR + 69) + 'v34" stroke="rgba(40,34,28,.5)" stroke-width="1.2"/>';
    s += '<path d="M' + (x - 2) + ' ' + (MUR + 72) + 'h' + (w + 4) + '" stroke="rgba(255,250,235,.3)" stroke-width="1.6"/>';
    s += mur(x, MUR - 14, w, 84, R);
    s += '<rect x="' + x + '" y="' + (MUR - 14) + '" width="' + w + '" height="84" fill="none" stroke="' + TR + '" stroke-width="2.4"/>';
    s += '<rect x="' + (x + 24) + '" y="' + (MUR + 2) + '" width="' + (w - 48) + '" height="62" rx="6" fill="#1d1613" stroke="' + TR + '" stroke-width="2"/>';
    s += '<ellipse cx="' + (x + w / 2) + '" cy="' + (MUR + 40) + '" rx="' + (w / 2 - 34) + '" ry="22" fill="#3a2a22"/>';
    /* les bûches (leurs bouts, leurs cernes), la cendre */
    [[-30, 34, 24], [4, 30, -16], [-10, 46, 6]].forEach(function(b, i){
      s += '<g transform="translate(' + (x + w / 2 + b[0]) + ' ' + (MUR + b[1]) + ') rotate(' + b[2] + ')"><rect x="-26" y="-7" width="52" height="14" rx="6" fill="' + ['#5a3a20', '#4a2e18', '#63402a'][i] + '" stroke="' + TR + '" stroke-width="1.6"/>' +
        '<path d="M-20 -3h36M-18 2h30" stroke="rgba(20,8,0,.45)" stroke-width="1"/><ellipse cx="26" cy="0" rx="4" ry="7" fill="#c9a06a" stroke="' + TR + '" stroke-width="1.3"/><ellipse cx="26" cy="0" rx="2" ry="3.6" fill="none" stroke="rgba(90,50,20,.7)" stroke-width=".9"/></g>';
    });
    /* la braise, sous la cendre (elle est dessinée ici ; ce qui palpite, c'est le calque .in-feu) */
    BRAISES.forEach(function(p){ s += '<circle cx="' + (x + w / 2 + p[0]) + '" cy="' + (MUR + 40 + p[1]) + '" r="' + p[2] + '" fill="#e8742a"/><circle cx="' + (x + w / 2 + p[0]) + '" cy="' + (MUR + 40 + p[1]) + '" r="' + n(p[2] * .5) + '" fill="#ffd98a"/>'; });
    return s;
  },
  /* la bouilloire de fonte, posée sur la pierre de l'âtre */
  bouilloire:function(o){
    return '<ellipse cx="' + (o.x + 4) + '" cy="' + (o.y + 6) + '" rx="17" ry="15" fill="rgba(18,8,0,.34)"/><circle cx="' + o.x + '" cy="' + o.y + '" r="16" fill="#2e2b30" stroke="#121014" stroke-width="2"/>' +
      '<circle cx="' + o.x + '" cy="' + o.y + '" r="10.5" fill="#3d3a42" stroke="#121014" stroke-width="1.4"/><circle cx="' + o.x + '" cy="' + o.y + '" r="3" fill="#77727f" stroke="#121014" stroke-width="1"/>' +
      '<path d="M' + (o.x + 14) + ' ' + (o.y - 6) + 'l12 -7 3 5 -11 8z" fill="#2e2b30" stroke="#121014" stroke-width="1.6" stroke-linejoin="round"/>' +
      '<path d="M' + (o.x - 13) + ' ' + (o.y - 10) + 'C' + (o.x - 6) + ' ' + (o.y - 24) + ' ' + (o.x + 6) + ' ' + (o.y - 24) + ' ' + (o.x + 13) + ' ' + (o.y - 10) + '" fill="none" stroke="#121014" stroke-width="3.2" stroke-linecap="round"/>' +
      '<path d="M' + (o.x - 9) + ' ' + (o.y - 7) + 'a12 12 0 0 1 8 -5" fill="none" stroke="rgba(255,255,255,.35)" stroke-width="2" stroke-linecap="round"/>';
  },
  /* le panier à bûches */
  buches:function(o, R){
    var s = osier(o.x, o.y, 30, 24, R, '#a57a42');
    [[-12, -6, 9], [8, -8, 10], [-3, 6, 11], [14, 7, 8]].forEach(function(b){
      s += '<circle cx="' + (o.x + b[0]) + '" cy="' + (o.y + b[1]) + '" r="' + b[2] + '" fill="#c9a06a" stroke="' + TR + '" stroke-width="1.5"/><circle cx="' + (o.x + b[0]) + '" cy="' + (o.y + b[1]) + '" r="' + n(b[2] * .62) + '" fill="none" stroke="rgba(90,50,20,.6)" stroke-width="1"/><circle cx="' + (o.x + b[0]) + '" cy="' + (o.y + b[1]) + '" r="' + n(b[2] * .28) + '" fill="rgba(90,50,20,.6)"/>';
    });
    return s;
  },
  /* le lit : son cadre de bois, la courtepointe en carrés de tissu, l'oreiller, le châle plié au pied */
  lit:function(o, R){
    var x = o.x, y = o.y, w = o.w, h = o.h, s = '<rect x="' + (x + 6) + '" y="' + (y + 9) + '" width="' + w + '" height="' + h + '" rx="6" fill="rgba(18,8,0,.34)"/>';
    s += '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" rx="6" fill="#5e3b1f" stroke="' + TR + '" stroke-width="2.4"/>';
    s += '<rect x="' + (x + 4) + '" y="' + (y + 3) + '" width="' + (w - 8) + '" height="12" rx="4" fill="#7a5230" stroke="' + TR + '" stroke-width="1.4"/><path d="M' + (x + 12) + ' ' + (y + 9) + 'h' + (w - 24) + '" stroke="rgba(255,220,170,.3)" stroke-width="1.4"/>';
    s += '<rect x="' + (x + 7) + '" y="' + (y + 17) + '" width="' + (w - 14) + '" height="' + (h - 24) + '" rx="5" fill="#efe6d2" stroke="' + TR + '" stroke-width="1.6"/>';
    /* l'oreiller, son pli, sa broderie */
    s += '<rect x="' + (x + 18) + '" y="' + (y + 23) + '" width="' + (w - 36) + '" height="34" rx="10" fill="#fbf6ea" stroke="' + TR + '" stroke-width="1.5"/><path d="M' + (x + 28) + ' ' + (y + 40) + 'q' + n((w - 56) / 2) + ' 8 ' + (w - 56) + ' 0" fill="none" stroke="rgba(120,100,80,.4)" stroke-width="1.2"/>' +
      '<path d="M' + (x + 24) + ' ' + (y + 29) + 'h' + (w - 48) + '" stroke="#c98aa0" stroke-width="1.6" stroke-dasharray="2 4"/>';
    /* la courtepointe : cinq rangs de quatre carrés, chacun son tissu */
    var qy = y + 64, qh = h - 74, cw = (w - 14) / 4, ch = qh / 5, tis = ['#8e4a5a', '#d9a94e', '#4f7d74', '#c9c0a8', '#6a5a8e', '#b86a3e', '#7a9a5a'], i, j;
    for(j = 0; j < 5; j++) for(i = 0; i < 4; i++){
      var px = x + 7 + i * cw, py = qy + j * ch, c = tis[Math.floor(R() * tis.length)], m = Math.floor(R() * 4);
      s += '<rect x="' + n(px) + '" y="' + n(py) + '" width="' + n(cw) + '" height="' + n(ch) + '" fill="' + c + '" stroke="rgba(30,14,4,.55)" stroke-width="1"/>';
      if(m === 0) s += '<path d="M' + n(px + 4) + ' ' + n(py + ch / 3) + 'h' + n(cw - 8) + 'M' + n(px + 4) + ' ' + n(py + ch * 2 / 3) + 'h' + n(cw - 8) + '" stroke="rgba(255,245,220,.4)" stroke-width="1.6"/>';
      else if(m === 1) s += '<circle cx="' + n(px + cw * .3) + '" cy="' + n(py + ch * .3) + '" r="2" fill="rgba(255,245,220,.5)"/><circle cx="' + n(px + cw * .7) + '" cy="' + n(py + ch * .3) + '" r="2" fill="rgba(255,245,220,.5)"/><circle cx="' + n(px + cw * .5) + '" cy="' + n(py + ch * .68) + '" r="2" fill="rgba(255,245,220,.5)"/>';
      else if(m === 2) s += '<path d="M' + n(px + cw / 2) + ' ' + n(py + 4) + 'l' + n(cw / 2 - 5) + ' ' + n(ch / 2 - 4) + ' -' + n(cw / 2 - 5) + ' ' + n(ch / 2 - 4) + ' -' + n(cw / 2 - 5) + ' -' + n(ch / 2 - 4) + 'z" fill="none" stroke="rgba(30,14,4,.4)" stroke-width="1.2"/>';
      s += '<rect x="' + n(px + 2) + '" y="' + n(py + 2) + '" width="' + n(cw - 4) + '" height="' + n(ch - 4) + '" fill="none" stroke="rgba(255,250,235,.35)" stroke-width=".9" stroke-dasharray="2 3"/>';
    }
    s += '<rect x="' + (x + 7) + '" y="' + n(qy) + '" width="' + (w - 14) + '" height="' + n(qh) + '" rx="3" fill="none" stroke="' + TR + '" stroke-width="1.6"/><path d="M' + (x + 7) + ' ' + n(qy + 9) + 'h' + (w - 14) + '" stroke="rgba(255,250,235,.55)" stroke-width="5"/><path d="M' + (x + 7) + ' ' + n(qy + 12) + 'h' + (w - 14) + '" stroke="rgba(30,14,4,.3)" stroke-width="1"/>';
    /* le châle violet, plié au pied du lit */
    s += '<path d="M' + (x + 16) + ' ' + (y + h - 40) + 'q' + n((w - 32) / 2) + ' -9 ' + (w - 32) + ' 0v24q-' + n((w - 32) / 2) + ' 8 -' + (w - 32) + ' 0z" fill="#6a3f8a" stroke="' + TR + '" stroke-width="1.5"/>' +
      '<path d="M' + (x + 22) + ' ' + (y + h - 30) + 'q' + n((w - 44) / 2) + ' -8 ' + (w - 44) + ' 0M' + (x + 22) + ' ' + (y + h - 22) + 'q' + n((w - 44) / 2) + ' -8 ' + (w - 44) + ' 0" fill="none" stroke="#c9a0e6" stroke-width="1.3" stroke-dasharray="1.5 3"/>';
    return s;
  },
  /* une paire de pantoufles */
  pantoufles:function(o){
    function p(dx, r){ return '<g transform="translate(' + (o.x + dx) + ' ' + o.y + ') rotate(' + r + ')"><ellipse cx="2" cy="3" rx="7.5" ry="13" fill="rgba(18,8,0,.3)"/><ellipse rx="7" ry="12.5" fill="#a04858" stroke="' + TR + '" stroke-width="1.4"/><path d="M-6.4 -3a6.6 9 0 0 1 12.8 0v-5a6.4 6 0 0 0 -12.8 0z" fill="#c9687a" stroke="' + TR + '" stroke-width="1.2"/><circle cy="-7" r="2.2" fill="#f4e6c8"/></g>'; }
    return p(0, -8) + p(18, 6);
  },
  /* le buffet, contre le mur du haut : son napperon de dentelle, ses assiettes, ses bocaux, sa pile de livres, son bougeoir */
  buffet:function(o){
    var x = o.x, y = o.y, w = o.w, h = o.h, s = '<rect x="' + (x + 5) + '" y="' + (y + 8) + '" width="' + w + '" height="' + h + '" rx="4" fill="rgba(18,8,0,.34)"/>';
    s += '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" rx="4" fill="#74492a" stroke="' + TR + '" stroke-width="2.4"/><path d="M' + (x + 6) + ' ' + (y + 6) + 'h' + (w - 12) + '" stroke="rgba(255,220,170,.28)" stroke-width="2"/>';
    for(var k = 0; k < 4; k++) s += '<path d="M' + (x + 8) + ' ' + n(y + 12 + k * (h - 18) / 3.4) + 'q' + n(w / 2) + ' ' + (k % 2 ? 3 : -3) + ' ' + (w - 16) + ' 0" fill="none" stroke="rgba(40,18,4,.25)" stroke-width="1"/>';
    /* le napperon */
    s += '<rect x="' + (x + 44) + '" y="' + (y + 5) + '" width="' + (w - 88) + '" height="' + (h - 10) + '" rx="3" fill="#f6f0e2" stroke="rgba(120,100,80,.7)" stroke-width="1"/><rect x="' + (x + 48) + '" y="' + (y + 9) + '" width="' + (w - 96) + '" height="' + (h - 18) + '" fill="none" stroke="rgba(160,140,120,.7)" stroke-width="1" stroke-dasharray="2 2.5"/>';
    /* trois assiettes peintes */
    [[20, .5, '#3f6b9a'], [w / 2, .5, '#9a3f52'], [w - 22, .5, '#3f8a62']].forEach(function(a, i){
      var cx = x + a[0], cy = y + h * a[1], r = i === 1 ? 16 : 13;
      s += '<circle cx="' + n(cx + 2) + '" cy="' + n(cy + 3) + '" r="' + r + '" fill="rgba(18,8,0,.3)"/><circle cx="' + n(cx) + '" cy="' + n(cy) + '" r="' + r + '" fill="#f7f1e3" stroke="' + TR + '" stroke-width="1.5"/><circle cx="' + n(cx) + '" cy="' + n(cy) + '" r="' + (r - 3.5) + '" fill="none" stroke="' + a[2] + '" stroke-width="2"/>' +
        '<circle cx="' + n(cx) + '" cy="' + n(cy) + '" r="' + (r - 8) + '" fill="none" stroke="' + a[2] + '" stroke-width="1" stroke-dasharray="1.5 2.5"/><circle cx="' + n(cx) + '" cy="' + n(cy) + '" r="1.8" fill="' + a[2] + '"/>';
    });
    /* deux bocaux et un bougeoir */
    s += '<circle cx="' + (x + 50) + '" cy="' + (y + 14) + '" r="7" fill="#d9b25c" stroke="' + TR + '" stroke-width="1.4"/><circle cx="' + (x + 50) + '" cy="' + (y + 14) + '" r="4.4" fill="#8a5a2a" stroke="' + TR + '" stroke-width="1"/>' +
      '<circle cx="' + (x + 52) + '" cy="' + (y + h - 13) + '" r="6.4" fill="#b7d0c0" stroke="' + TR + '" stroke-width="1.4"/><circle cx="' + (x + 52) + '" cy="' + (y + h - 13) + '" r="3.8" fill="#7a5230" stroke="' + TR + '" stroke-width="1"/>' +
      '<circle cx="' + (x + w - 52) + '" cy="' + (y + 13) + '" r="7" fill="#c9952e" stroke="' + TR + '" stroke-width="1.4"/><circle cx="' + (x + w - 52) + '" cy="' + (y + 13) + '" r="3" fill="#f4ead0" stroke="' + TR + '" stroke-width="1"/><circle cx="' + (x + w - 52) + '" cy="' + (y + 13) + '" r="1" fill="#3a2a1e"/>';
    /* la pile de livres */
    s += '<g transform="translate(' + (x + w - 54) + ' ' + (y + h - 14) + ') rotate(-8)"><rect x="-11" y="-8" width="22" height="16" rx="1.5" fill="#7b2d26" stroke="' + TR + '" stroke-width="1.3"/><rect x="-9" y="-10" width="20" height="15" rx="1.5" fill="#2f4f3a" stroke="' + TR + '" stroke-width="1.3"/><path d="M-5 -6h12M-5 -2h8" stroke="#d9b15c" stroke-width="1.2"/></g>';
    return s;
  },
  /* le fauteuil à bascule : ses patins, son coussin brodé, la couverture de laine sur l'accoudoir */
  bascule:function(o){
    var s = '<g transform="translate(' + o.x + ' ' + o.y + ') rotate(' + (o.r || 0) + ')">';
    s += '<rect x="-27" y="-24" width="62" height="60" rx="12" fill="rgba(18,8,0,.32)"/>';
    s += '<path d="M-36 -30C-42 -10 -42 14 -36 34M36 -30C42 -10 42 14 36 34" fill="none" stroke="#4a2c14" stroke-width="5" stroke-linecap="round"/><path d="M-36 -30C-42 -10 -42 14 -36 34M36 -30C42 -10 42 14 36 34" fill="none" stroke="#7a5230" stroke-width="2" stroke-linecap="round"/>';
    s += '<rect x="-30" y="-28" width="60" height="58" rx="11" fill="#6b4424" stroke="' + TR + '" stroke-width="2.2"/>';
    s += '<rect x="-30" y="-32" width="60" height="14" rx="7" fill="#7a5230" stroke="' + TR + '" stroke-width="2"/>';
    for(var k = -2; k <= 2; k++) s += '<path d="M' + (k * 10) + ' -18v12" stroke="#4a2c14" stroke-width="4" stroke-linecap="round"/>';
    s += '<rect x="-23" y="-8" width="46" height="34" rx="9" fill="#7a4a9a" stroke="' + TR + '" stroke-width="1.6"/><rect x="-18" y="-3" width="36" height="24" rx="6" fill="none" stroke="#d9b8f0" stroke-width="1.2" stroke-dasharray="2 3"/>' +
      '<path d="M0 3l3 6 6 1 -4.5 4 1.2 6 -5.7 -3 -5.7 3 1.2 -6 -4.5 -4 6 -1z" fill="#e8c46a" stroke="rgba(60,30,10,.6)" stroke-width=".8"/>';
    s += '<rect x="-36" y="-12" width="12" height="40" rx="6" fill="#5e3b1f" stroke="' + TR + '" stroke-width="1.8"/><rect x="24" y="-12" width="12" height="40" rx="6" fill="#5e3b1f" stroke="' + TR + '" stroke-width="1.8"/>';
    s += '<path d="M22 -16c8 -2 16 2 17 10l-2 26c-5 4 -11 4 -16 0z" fill="#c9683e" stroke="' + TR + '" stroke-width="1.5"/><path d="M24 -6h13M24 2h13M23 10h13" stroke="#f1d9a8" stroke-width="2"/><path d="M22 18l-1 6M27 19l-.5 6M32 19v6M37 18l.5 6" stroke="#c9683e" stroke-width="1.6" stroke-linecap="round"/>';
    return s + '</g>';
  },
  /* le panier à tricot : trois pelotes, deux aiguilles, un ouvrage commencé */
  tricot:function(o, R){
    var s = osier(o.x, o.y, 27, 23, R);
    [[-9, -4, 9, '#b8443e'], [8, -6, 8, '#3f7a8a'], [1, 8, 8.5, '#e0b64e']].forEach(function(p){
      var cx = o.x + p[0], cy = o.y + p[1];
      s += '<circle cx="' + cx + '" cy="' + cy + '" r="' + p[2] + '" fill="' + p[3] + '" stroke="' + TR + '" stroke-width="1.4"/>' +
        '<path d="M' + (cx - p[2] + 2) + ' ' + cy + 'q' + p[2] + ' -' + n(p[2] * .9) + ' ' + (2 * p[2] - 4) + ' 0M' + (cx - p[2] + 3) + ' ' + (cy + 3) + 'q' + p[2] + ' -' + n(p[2] * .5) + ' ' + (2 * p[2] - 6) + ' -1M' + (cx - 3) + ' ' + (cy - p[2] + 2) + 'q' + n(p[2] * .8) + ' ' + p[2] + ' 1 ' + (2 * p[2] - 4) + '" fill="none" stroke="rgba(255,250,235,.45)" stroke-width="1"/>';
    });
    return s + '<path d="M' + (o.x - 22) + ' ' + (o.y - 20) + 'L' + (o.x + 16) + ' ' + (o.y + 14) + 'M' + (o.x - 14) + ' ' + (o.y - 24) + 'L' + (o.x + 20) + ' ' + (o.y + 8) + '" stroke="#e9dfc8" stroke-width="2.2" stroke-linecap="round"/><circle cx="' + (o.x - 22) + '" cy="' + (o.y - 20) + '" r="2.6" fill="#e9dfc8" stroke="' + TR + '" stroke-width="1"/><circle cx="' + (o.x - 14) + '" cy="' + (o.y - 24) + '" r="2.6" fill="#e9dfc8" stroke="' + TR + '" stroke-width="1"/>' +
      '<path d="M' + (o.x + 20) + ' ' + (o.y + 12) + 'c14 6 4 20 16 22" fill="none" stroke="#b8443e" stroke-width="1.8" stroke-linecap="round"/>';
  },
  /* la table ronde : sa nappe à carreaux, la théière, deux tasses, les biscuits, le bouquet */
  table:function(o, R, u){
    var x = o.x, y = o.y, r = o.r, s = '<circle cx="' + (x + 7) + '" cy="' + (y + 10) + '" r="' + (r + 2) + '" fill="rgba(18,8,0,.34)"/>';
    s += '<circle cx="' + x + '" cy="' + y + '" r="' + r + '" fill="#6b4424" stroke="' + TR + '" stroke-width="2.4"/>';
    s += '<circle cx="' + x + '" cy="' + y + '" r="' + (r - 5) + '" fill="url(#' + u + 'vichy)" stroke="' + TR + '" stroke-width="1.5"/><circle cx="' + x + '" cy="' + y + '" r="' + (r - 9) + '" fill="none" stroke="rgba(255,255,255,.55)" stroke-width="1.2" stroke-dasharray="2 3"/>';
    /* la théière bleue */
    s += '<g transform="translate(' + (x - 6) + ' ' + (y - 8) + ')"><ellipse cx="3" cy="5" rx="19" ry="16" fill="rgba(18,8,0,.3)"/><path d="M15 -3l14 -8 4 5 -13 10z" fill="#3f6b9a" stroke="' + TR + '" stroke-width="1.6" stroke-linejoin="round"/><path d="M-15 -6c-12 -2 -12 14 0 12" fill="none" stroke="' + TR + '" stroke-width="5.6" stroke-linecap="round"/><path d="M-15 -6c-12 -2 -12 14 0 12" fill="none" stroke="#3f6b9a" stroke-width="2.8" stroke-linecap="round"/>' +
      '<circle r="17" fill="#4a7db0" stroke="' + TR + '" stroke-width="2"/><circle r="10" fill="#3f6b9a" stroke="' + TR + '" stroke-width="1.3"/><circle r="3.4" fill="#f4ead0" stroke="' + TR + '" stroke-width="1.2"/><path d="M-11 -9a14 14 0 0 1 9 -6" fill="none" stroke="rgba(255,255,255,.55)" stroke-width="2.4" stroke-linecap="round"/>' +
      '<path d="M-13 3l3 2 -3 2M13 3l-3 2 3 2M-2 12l2 3 2 -3" fill="none" stroke="#f4ead0" stroke-width="1.1"/></g>';
    /* deux tasses sur leur soucoupe */
    [[-34, 26, 30], [34, 18, -40]].forEach(function(t){
      s += '<g transform="translate(' + (x + t[0]) + ' ' + (y + t[1]) + ') rotate(' + t[2] + ')"><circle cx="1.5" cy="2.5" r="12.5" fill="rgba(18,8,0,.26)"/><circle r="12" fill="#f7f1e3" stroke="' + TR + '" stroke-width="1.4"/><circle r="9" fill="none" stroke="#3f6b9a" stroke-width="1" stroke-dasharray="1.5 2"/>' +
        '<path d="M6 0c8 -3 8 7 0 4" fill="none" stroke="' + TR + '" stroke-width="3.6" stroke-linecap="round"/><path d="M6 0c8 -3 8 7 0 4" fill="none" stroke="#f7f1e3" stroke-width="1.6" stroke-linecap="round"/>' +
        '<circle r="7" fill="#f7f1e3" stroke="' + TR + '" stroke-width="1.3"/><circle r="5.2" fill="#8a5a2a"/><path d="M-3 -2a4 4 0 0 1 4 -2" fill="none" stroke="rgba(255,255,255,.5)" stroke-width="1.2" stroke-linecap="round"/></g>';
    });
    /* l'assiette de biscuits */
    s += '<g transform="translate(' + (x + 4) + ' ' + (y + 34) + ')"><circle cx="1.5" cy="2.5" r="15" fill="rgba(18,8,0,.26)"/><circle r="14.5" fill="#f7f1e3" stroke="' + TR + '" stroke-width="1.4"/><circle r="11" fill="none" stroke="#9a3f52" stroke-width="1"/>';
    [[-5, -3], [4, -5], [5, 4], [-3, 6], [0, 0]].forEach(function(b){ s += '<circle cx="' + b[0] + '" cy="' + b[1] + '" r="4.4" fill="#d9a55a" stroke="rgba(90,50,20,.8)" stroke-width="1"/><circle cx="' + (b[0] - 1) + '" cy="' + (b[1] - 1) + '" r=".8" fill="#6a3a1a"/><circle cx="' + (b[0] + 1.4) + '" cy="' + (b[1] + .6) + '" r=".8" fill="#6a3a1a"/>'; });
    s += '</g>';
    /* le petit bouquet, dans son pot de grès */
    s += '<g transform="translate(' + (x + 22) + ' ' + (y - 28) + ')"><circle cx="1.5" cy="2.5" r="10" fill="rgba(18,8,0,.26)"/><circle r="9.5" fill="#b88a5a" stroke="' + TR + '" stroke-width="1.4"/>';
    [[0, -4, '#f2c94c'], [-5, 2, '#f08a9a'], [5, 2, '#f6f1e8'], [0, 5, '#f08a9a'], [-4, -6, '#f6f1e8'], [5, -5, '#f2c94c']].forEach(function(f){ s += '<circle cx="' + f[0] + '" cy="' + f[1] + '" r="4" fill="' + f[2] + '" stroke="rgba(60,30,10,.6)" stroke-width=".8"/><circle cx="' + f[0] + '" cy="' + f[1] + '" r="1.3" fill="#c9762e"/>'; });
    return s + '</g>';
  },
  /* une chaise paillée, glissée sous la table */
  chaise:function(o){
    var s = '<g transform="translate(' + o.x + ' ' + o.y + ') rotate(' + (o.r || 0) + ')"><rect x="-19" y="-17" width="42" height="42" rx="6" fill="rgba(18,8,0,.3)"/><rect x="-21" y="-21" width="42" height="42" rx="6" fill="#d9b25c" stroke="' + TR + '" stroke-width="2"/>';
    for(var k = 0; k < 7; k++) s += '<path d="M' + (-17 + k * 5.6) + ' -18v36" stroke="rgba(120,80,20,.45)" stroke-width="1"/><path d="M-18 ' + (-17 + k * 5.6) + 'h36" stroke="rgba(120,80,20,.3)" stroke-width="1"/>';
    return s + '<rect x="-23" y="-25" width="46" height="9" rx="4.5" fill="#6b4424" stroke="' + TR + '" stroke-width="1.8"/><circle cx="-21" cy="19" r="3.4" fill="#6b4424" stroke="' + TR + '" stroke-width="1.4"/><circle cx="21" cy="19" r="3.4" fill="#6b4424" stroke="' + TR + '" stroke-width="1.4"/></g>';
  },
  /* un panier de chat : son coussin, la trace ronde du dormeur, quelques poils */
  panier:function(o, R){
    var s = osier(o.x, o.y, o.rx || 34, o.ry || 28, R, o.osier);
    s += '<ellipse cx="' + o.x + '" cy="' + o.y + '" rx="' + n((o.rx || 34) * .66) + '" ry="' + n((o.ry || 28) * .66) + '" fill="' + (o.c || '#c9687a') + '" stroke="' + TR + '" stroke-width="1.3"/>' +
      '<ellipse cx="' + (o.x - 2) + '" cy="' + (o.y + 1) + '" rx="' + n((o.rx || 34) * .4) + '" ry="' + n((o.ry || 28) * .38) + '" fill="rgba(20,10,0,.16)"/>' +
      '<ellipse cx="' + o.x + '" cy="' + o.y + '" rx="' + n((o.rx || 34) * .56) + '" ry="' + n((o.ry || 28) * .56) + '" fill="none" stroke="rgba(255,250,235,.45)" stroke-width="1" stroke-dasharray="2 3"/>';
    for(var k = 0; k < 5; k++) s += '<path d="M' + n(o.x - 12 + R() * 24) + ' ' + n(o.y - 8 + R() * 16) + 'l' + n(R() * 5 - 2.5) + ' ' + n(2 + R() * 3) + '" stroke="' + (o.poil || '#8d939c') + '" stroke-width="1" stroke-linecap="round"/>';
    return s;
  },
  /* la rangée des gamelles : une par chat ; lait (true) : celle du milieu est renversée, une flaque, des traces de pattes vers la porte */
  gamelles:function(o){
    var s = '', k;
    for(k = 0; k < 7; k++){
      var cx = o.x + k * 25, cy = o.y + (k % 2 ? 3 : 0);
      if(o.lait && k === 3) continue;
      s += '<circle cx="' + (cx + 1.5) + '" cy="' + (cy + 2.5) + '" r="10" fill="rgba(18,8,0,.3)"/><circle cx="' + cx + '" cy="' + cy + '" r="9.6" fill="' + ['#c9687a', '#5a8ab0', '#d9b25c', '#7aa06a', '#b88a5a', '#8a6aa8', '#c9805a'][k] + '" stroke="' + TR + '" stroke-width="1.5"/><circle cx="' + cx + '" cy="' + cy + '" r="6.4" fill="' + (k % 3 === 1 ? '#8a5a2a' : '#fbf8ef') + '" stroke="rgba(30,14,4,.5)" stroke-width="1"/><path d="M' + (cx - 4) + ' ' + (cy - 3) + 'a5 5 0 0 1 4 -2" fill="none" stroke="rgba(255,255,255,.6)" stroke-width="1.2" stroke-linecap="round"/>';
    }
    if(o.lait){
      var lx = o.x + 75, ly = o.y;
      s += '<path d="M' + (lx - 6) + ' ' + (ly - 10) + 'c18 -12 40 -4 44 8c10 2 14 14 2 18c-10 10 -30 8 -40 0c-14 2 -22 -10 -12 -18c-2 -4 2 -8 6 -8z" fill="#fbf8ef" stroke="rgba(120,110,90,.5)" stroke-width="1"/><path d="M' + (lx + 6) + ' ' + (ly - 4) + 'c8 -5 18 -3 22 2" fill="none" stroke="rgba(255,255,255,.9)" stroke-width="2" stroke-linecap="round"/>' +
        '<g transform="translate(' + (lx - 4) + ' ' + (ly - 14) + ') rotate(-28)"><ellipse cx="2" cy="3" rx="11" ry="7" fill="rgba(18,8,0,.3)"/><ellipse rx="10.5" ry="6.4" fill="#d9b25c" stroke="' + TR + '" stroke-width="1.5"/><ellipse cx="2" rx="6" ry="4" fill="#b98f3c" stroke="rgba(30,14,4,.5)" stroke-width="1"/></g>';
      /* les pattes blanches de lait, qui filent vers la porte */
      [[38, -22, -30], [58, -34, -20], [80, -36, 0], [104, -30, 14], [128, -20, 24], [150, -6, 30], [170, 12, 36]].forEach(function(p, i){ s += patte(lx + p[0], ly + p[1], p[2] + 90, Math.max(.25, .85 - i * .09)); });
    }
    return s;
  },
  /* le coffre, contre le mur : ses ferrures, sa serrure, une couverture posée dessus */
  coffre:function(o){
    var x = o.x, y = o.y, w = o.w, h = o.h, s = '<rect x="' + (x + 5) + '" y="' + (y + 8) + '" width="' + w + '" height="' + h + '" rx="5" fill="rgba(18,8,0,.34)"/><rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" rx="5" fill="#6b4424" stroke="' + TR + '" stroke-width="2.4"/>', k;
    for(k = 1; k < 4; k++) s += '<path d="M' + n(x + k * w / 4) + ' ' + (y + 3) + 'v' + (h - 6) + '" stroke="rgba(40,18,4,.4)" stroke-width="1.2"/>';
    [.18, .82].forEach(function(u){ s += '<rect x="' + (x - 1) + '" y="' + n(y + h * u - 5) + '" width="' + (w + 2) + '" height="10" fill="#3a3640" stroke="#121014" stroke-width="1.4"/>'; for(k = 0; k < 4; k++) s += '<circle cx="' + n(x + 7 + k * (w - 14) / 3) + '" cy="' + n(y + h * u) + '" r="1.8" fill="#8a8690"/>'; });
    s += '<rect x="' + (x + w - 12) + '" y="' + n(y + h / 2 - 8) + '" width="14" height="16" rx="3" fill="#3a3640" stroke="#121014" stroke-width="1.4"/><circle cx="' + (x + w - 5) + '" cy="' + n(y + h / 2 - 1) + '" r="2" fill="#121014"/>';
    return s + '<path d="M' + (x + 6) + ' ' + n(y + h * .34) + 'h' + (w - 20) + 'v' + n(h * .32) + 'h-' + (w - 20) + 'z" fill="#4f7d74" stroke="' + TR + '" stroke-width="1.4"/><path d="M' + (x + 10) + ' ' + n(y + h * .42) + 'h' + (w - 28) + 'M' + (x + 10) + ' ' + n(y + h * .5) + 'h' + (w - 28) + 'M' + (x + 10) + ' ' + n(y + h * .58) + 'h' + (w - 28) + '" stroke="#d8e6d0" stroke-width="1.2" stroke-dasharray="3 2"/>';
  },
  /* une fougère en pot */
  plante:function(o, R){
    var s = '<circle cx="' + (o.x + 5) + '" cy="' + (o.y + 8) + '" r="' + (o.r + 12) + '" fill="rgba(18,8,0,.26)"/><circle cx="' + o.x + '" cy="' + o.y + '" r="' + o.r + '" fill="#b06a42" stroke="' + TR + '" stroke-width="2"/><circle cx="' + o.x + '" cy="' + o.y + '" r="' + (o.r - 4) + '" fill="#4a3320"/>', k, nb = 11;
    for(k = 0; k < nb; k++){
      var a = k / nb * Math.PI * 2 + R() * .3, l = o.r + 8 + R() * 14, ex = o.x + Math.cos(a) * l, ey = o.y + Math.sin(a) * l, mx = o.x + Math.cos(a + .35) * l * .55, my = o.y + Math.sin(a + .35) * l * .55;
      s += '<path d="M' + o.x + ' ' + o.y + 'Q' + n(mx) + ' ' + n(my) + ' ' + n(ex) + ' ' + n(ey) + 'Q' + n(o.x + Math.cos(a - .3) * l * .55) + ' ' + n(o.y + Math.sin(a - .3) * l * .55) + ' ' + o.x + ' ' + o.y + 'Z" fill="' + hsl(105 + R() * 30, 38 + R() * 14, 28 + R() * 14) + '" stroke="rgba(16,40,12,.75)" stroke-width="1"/>' +
        '<path d="M' + o.x + ' ' + o.y + 'L' + n(ex) + ' ' + n(ey) + '" stroke="rgba(190,230,150,.5)" stroke-width=".9"/>';
    }
    return s;
  },
  /* le balai, appuyé dans un coin */
  balai:function(o){
    return '<g transform="translate(' + o.x + ' ' + o.y + ') rotate(' + (o.r || 0) + ') scale(' + (o.k || 1) + ')"><path d="M3 4L3 96" stroke="rgba(18,8,0,.3)" stroke-width="5" stroke-linecap="round"/><path d="M0 0V92" stroke="' + TR + '" stroke-width="5.4" stroke-linecap="round"/><path d="M0 0V92" stroke="#b8894e" stroke-width="2.8" stroke-linecap="round"/>' +
      '<path d="M-13 92h26l5 26h-36z" fill="#d9b25c" stroke="' + TR + '" stroke-width="1.6" stroke-linejoin="round"/><path d="M-10 96l-3 20M-4 96l-1 22M3 96l1 22M9 96l4 20" stroke="rgba(120,80,20,.6)" stroke-width="1.1"/><path d="M-14 99h28" stroke="#8a3a3a" stroke-width="2.4"/></g>';
  },
  /* la canne d'Odette, posée contre le mur (le Barde l'a rapportée) : ses sept petits chats gravés */
  canne:function(o){
    var s = '<g transform="translate(' + o.x + ' ' + o.y + ') rotate(' + (o.r || 0) + ')"><path d="M3 4V84" stroke="rgba(18,8,0,.3)" stroke-width="6" stroke-linecap="round"/><path d="M0 0V80M0 0C0 -12 14 -12 14 -2" fill="none" stroke="' + TR + '" stroke-width="6.4" stroke-linecap="round"/><path d="M0 0V80M0 0C0 -12 14 -12 14 -2" fill="none" stroke="#6a3a1a" stroke-width="3.6" stroke-linecap="round"/>';
    for(var k = 0; k < 7; k++) s += '<circle cx="0" cy="' + (10 + k * 10) + '" r="1.3" fill="#e8c46a"/>';
    return s + '</g>';
  },
  /* la souris de chiffon et la balle à grelot */
  jouets:function(o){
    return '<g transform="translate(' + o.x + ' ' + o.y + ')"><ellipse cx="1.5" cy="2.5" rx="9" ry="6" fill="rgba(18,8,0,.28)"/><path d="M-9 0C-9 -6 4 -7 9 0C4 7 -9 6 -9 0Z" fill="#9aa0a8" stroke="' + TR + '" stroke-width="1.3"/><circle cx="-4" cy="-4" r="2.6" fill="#c9a0a8" stroke="' + TR + '" stroke-width="1"/><circle cx="-4" cy="4" r="2.6" fill="#c9a0a8" stroke="' + TR + '" stroke-width="1"/><path d="M9 0c8 -2 6 8 14 6" fill="none" stroke="#c9687a" stroke-width="1.6" stroke-linecap="round"/></g>' +
      '<g transform="translate(' + (o.x + 34) + ' ' + (o.y - 22) + ')"><circle cx="1.5" cy="2.5" r="7.5" fill="rgba(18,8,0,.28)"/><circle r="7" fill="#e0b64e" stroke="' + TR + '" stroke-width="1.3"/><path d="M-7 0h14M0 -7v14" stroke="#b8443e" stroke-width="1.6"/><circle r="1.6" fill="#3a2a1e"/></g>';
  }
};
/* une trace de patte (quatre petits coussinets et un gros) */
function patte(x, y, rot, op){
  return '<g transform="translate(' + n(x) + ' ' + n(y) + ') rotate(' + n(rot) + ')" opacity="' + n(op) + '"><ellipse cx="0" cy="2" rx="3.4" ry="2.8" fill="#fbf8ef"/><circle cx="-3.6" cy="-2" r="1.5" fill="#fbf8ef"/><circle cx="-1.2" cy="-3.8" r="1.5" fill="#fbf8ef"/><circle cx="1.6" cy="-3.6" r="1.5" fill="#fbf8ef"/><circle cx="3.8" cy="-1.6" r="1.5" fill="#fbf8ef"/></g>';
}
/* le chat de pierre qui dort, sur la tablette de la fenêtre (une vieille statue : « le chat qui dort ») */
function chatDePierre(cx, cy, k){
  return '<g transform="translate(' + cx + ' ' + cy + ') scale(' + (k || 1) + ')"><ellipse cx="2" cy="3" rx="15" ry="13" fill="rgba(18,8,0,.35)"/>' +
    '<path d="M-12 4C-14 -6 -6 -12 3 -11C12 -10 15 -2 13 5C11 12 2 14 -5 12C-10 11 -12 8 -12 4Z" fill="#9c9a92" stroke="' + TR + '" stroke-width="1.6"/>' +
    '<path d="M11 7C15 12 6 16 -2 14" fill="none" stroke="' + TR + '" stroke-width="5" stroke-linecap="round"/><path d="M11 7C15 12 6 16 -2 14" fill="none" stroke="#8a8880" stroke-width="2.6" stroke-linecap="round"/>' +
    '<path d="M-9 -3l-4 -6 6 2zM-3 -7l1 -7 4 5z" fill="#9c9a92" stroke="' + TR + '" stroke-width="1.3" stroke-linejoin="round"/><circle cx="-5" cy="-1" r="6" fill="#a8a69e" stroke="' + TR + '" stroke-width="1.4"/>' +
    '<path d="M-8 -1q1.5 1.6 3 0M-4.4 -1.6q1.5 1.6 3 0" fill="none" stroke="' + TR + '" stroke-width="1" stroke-linecap="round"/><path d="M-2 -8a9 9 0 0 1 10 2" fill="none" stroke="rgba(255,255,255,.45)" stroke-width="1.6" stroke-linecap="round"/>' +
    '<circle cx="5" cy="3" r="1" fill="rgba(60,60,56,.5)"/><circle cx="1" cy="8" r=".9" fill="rgba(60,60,56,.5)"/><circle cx="8" cy="-3" r=".8" fill="rgba(60,60,56,.5)"/><path d="M-1 6c3 2 6 1 8 -1" fill="none" stroke="rgba(110,130,90,.6)" stroke-width="1.4" stroke-linecap="round"/></g>';
}

/* ==========================================================
   Les maisons
   ========================================================== */
var DALLE = {x:232, y:310, t:56, e:6};   /* le carré des neuf dalles, au milieu de la pièce */
function dalleXY(k){ return {x:DALLE.x + (k % 3) * (DALLE.t + DALLE.e), y:DALLE.y + Math.floor(k / 3) * (DALLE.t + DALLE.e)}; }
var MAISONS = {
  odette:{
    nom:'La maison d\'Odette', graine:4107,
    fenetre:{cote:'gauche', y0:322, y1:478},
    porte:{x0:262, x1:338},
    cheminee:{x:210, w:180},
    /* l'ordre : la lune, la cloche, la clé. Exprès PAS les signes des Fondateurs (l'œil, le chaudron, la lyre, l'étoile : tout le monde les
       connaît depuis l'enquête 1 — en essayant ces quatre-là, on trouvait sans le Sage). Neuf dalles, trois dans l'ordre : 504 essais. */
    dalles:{signes:['lune', 'oeil', 'cloche', 'chaudron', 'lanterne', 'etoile', 'lyre', 'arbre', 'cle'], ordre:['lune', 'cloche', 'cle'], cachette:4},
    /* ce qu'on peut regarder de près : [x, y, largeur, hauteur, la phrase] — courtes, à lire avec 🔊 */
    regards:[
      {id:'lit', r:[438, 118, 124, 196], t:'Le lit est fait, sans un pli. Odette n\'y a pas dormi.'},
      {id:'table', r:[396, 566, 148, 148], t:'Deux tasses. Le thé est froid… Qui Odette attendait-elle ?'},
      {id:'paniers', r:[40, 556, 190, 150], t:'Trois grands paniers pour sept chats. Et pas un seul chat dedans.'},
      {id:'gamelles', r:[42, 726, 180, 34], t:'Sept gamelles, bien alignées. Personne pour les vider.', lait:'Une gamelle renversée ! Et des pattes blanches de lait, qui filent vers la porte…'},
      {id:'cheminee', r:[204, 14, 192, 124], t:'La braise rougeoie encore sous la cendre.'},
      {id:'fauteuil', r:[90, 160, 110, 110], t:'Son fauteuil, son tricot : une écharpe, pas finie.'},
      {id:'chat', r:[24, 370, 44, 60], t:'Un vieux chat de pierre, qui dort sur le rebord. Il est là depuis toujours.'},
      {id:'coffre', r:[508, 356, 60, 124], t:'Un coffre : des couvertures, de la laine. Rien d\'autre.'},
      {id:'buffet', r:[42, 32, 158, 54], t:'De la belle vaisselle peinte, bien rangée.'},
      {id:'canne', r:[344, 668, 30, 100], t:'Sa canne aux sept chats. Elle ne sort jamais sans elle…'}
    ],
    meubles:function(R, u, p){
      var s = '';
      s += MEUBLES.tapis({x:138, y:214, rx:92, ry:70});
      s += MEUBLES.paillasson({x:266, y:716, w:68, h:40});
      s += MEUBLES.buffet({x:44, y:34, w:154, h:50});
      s += MEUBLES.bouilloire({x:236, y:114});
      s += MEUBLES.buches({x:432, y:66}, R);
      s += MEUBLES.lit({x:440, y:120, w:120, h:192}, R);
      s += MEUBLES.pantoufles({x:412, y:262});
      s += MEUBLES.bascule({x:144, y:212, r:-24});
      s += MEUBLES.tricot({x:76, y:262}, R);
      s += MEUBLES.coffre({x:510, y:358, w:54, h:120});
      s += MEUBLES.plante({x:540, y:520, r:15}, R);
      s += MEUBLES.chaise({x:386, y:640, r:-90});
      s += MEUBLES.chaise({x:470, y:722, r:180});
      s += MEUBLES.table({x:470, y:640, r:64}, R, u);
      s += MEUBLES.panier({x:84, y:596, c:'#c9687a', poil:'#e9c48a'}, R);
      s += MEUBLES.panier({x:168, y:606, rx:30, ry:25, c:'#5a8ab0', poil:'#2e2a33', osier:'#a57a42'}, R);
      s += MEUBLES.panier({x:106, y:668, rx:38, ry:31, c:'#7aa06a', poil:'#8d939c'}, R);
      s += MEUBLES.jouets({x:196, y:680});
      s += MEUBLES.gamelles({x:56, y:742, lait:!!p.lait});
      s += MEUBLES.balai({x:46, y:490, r:5, k:.74});
      s += MEUBLES.canne({x:356, y:682, r:-6});
      return s;
    }
  }
};

/* les neuf dalles : la pierre, ses éclats, ses fissures, ses rayures d'usure. Aucun signe. → les neuf dessins, un par dalle */
function pierresDalles(M, R){
  var D = M.dalles, T = DALLE.t, sortie = [], k, i;
  function j(){ return (R() - .5) * 3.2; }
  for(k = 0; k < 9; k++){
    var p = dalleXY(k), s = '';
    s += '<path d="M' + n(p.x + j()) + ' ' + n(p.y + j()) + 'L' + n(p.x + T + j()) + ' ' + n(p.y + j()) + 'L' + n(p.x + T + j()) + ' ' + n(p.y + T + j()) + 'L' + n(p.x + j()) + ' ' + n(p.y + T + j()) + 'Z" fill="' + hsl(34 + R() * 10, 9 + R() * 7, 52 + R() * 10) + '" stroke="#2a231d" stroke-width="1.6" stroke-linejoin="round"/>' +
      '<path d="M' + (p.x + 4) + ' ' + (p.y + 4) + 'h' + (T - 10) + 'M' + (p.x + 4) + ' ' + (p.y + 4) + 'v' + (T - 10) + '" fill="none" stroke="rgba(255,250,235,.3)" stroke-width="1.6" stroke-linecap="round"/><path d="M' + (p.x + T - 4) + ' ' + (p.y + 6) + 'v' + (T - 10) + 'h-' + (T - 10) + '" fill="none" stroke="rgba(30,24,18,.3)" stroke-width="1.6" stroke-linecap="round"/>';
    for(i = 0; i < 12; i++) s += '<circle cx="' + n(p.x + 5 + R() * (T - 10)) + '" cy="' + n(p.y + 5 + R() * (T - 10)) + '" r="' + n(.6 + R() * 1.3) + '" fill="' + (R() < .5 ? 'rgba(40,34,28,.28)' : 'rgba(255,250,235,.3)') + '"/>';
    if(R() < .55){ var fx = p.x + 8 + R() * (T - 16), fy = p.y + 6; s += '<path d="M' + n(fx) + ' ' + n(fy) + 'l' + n(R() * 8 - 4) + ' ' + n(10 + R() * 8) + ' ' + n(R() * 8 - 4) + ' ' + n(8 + R() * 10) + '" fill="none" stroke="rgba(30,24,18,.45)" stroke-width="1"/>'; }
    if(R() < .4) s += '<path d="M' + n(p.x + T - 12) + ' ' + n(p.y + T - 3) + 'q5 -8 10 -6v6z" fill="#2f2822"/>';
    /* (19 novembre : plus aucun signe gravé — de la vieille pierre usée, les mêmes rayures le matin et l'après-midi) */
    { var Ru = graine(M.graine + 31 + k); for(i = 0; i < 7; i++){ var ux = p.x + 10 + Ru() * (T - 20), uy = p.y + 10 + Ru() * (T - 20); s += '<path d="M' + n(ux) + ' ' + n(uy) + 'q' + n(Ru() * 12 - 6) + ' ' + n(Ru() * 8 - 4) + ' ' + n(Ru() * 18 - 9) + ' ' + n(Ru() * 14 - 7) + '" fill="none" stroke="rgba(34,26,18,' + n(.12 + Ru() * .14) + ')" stroke-width="' + n(1.2 + Ru() * 1.6) + '" stroke-linecap="round"/>'; } }
    sortie.push(s);
  }
  return sortie;
}
/* le cadre de chêne autour des dalles ; sous la dalle de la cachette : le trou, et son étui de cuir */
function cadreDalles(M){
  var T = DALLE.t, c = dalleXY(M.dalles.cachette), cote = 3 * T + 2 * DALLE.e;
  return '<rect x="' + (DALLE.x - 9) + '" y="' + (DALLE.y - 9) + '" width="' + (cote + 18) + '" height="' + (cote + 18) + '" rx="5" fill="#4a2c14" stroke="' + TR + '" stroke-width="2.2"/>' +
    '<path d="M' + (DALLE.x - 5) + ' ' + (DALLE.y - 5.5) + 'h' + (cote + 10) + '" stroke="rgba(255,220,170,.25)" stroke-width="1.6"/>' +
    [[-6, -6], [cote + 6, -6], [-6, cote + 6], [cote + 6, cote + 6]].map(function(q){ return '<circle cx="' + (DALLE.x + q[0]) + '" cy="' + (DALLE.y + q[1]) + '" r="2.2" fill="#1c120a"/>'; }).join('') +
    '<rect x="' + (DALLE.x - 4) + '" y="' + (DALLE.y - 4) + '" width="' + (cote + 8) + '" height="' + (cote + 8) + '" rx="3" fill="#2f2822"/>' +
    '<rect x="' + c.x + '" y="' + c.y + '" width="' + T + '" height="' + T + '" fill="#120d0a"/><path d="M' + (c.x + 2) + ' ' + (c.y + T - 2) + 'v-' + (T - 4) + 'h' + (T - 4) + '" fill="none" stroke="rgba(0,0,0,.7)" stroke-width="5"/><rect x="' + (c.x + 3) + '" y="' + (c.y + 3) + '" width="' + (T - 6) + '" height="' + (T - 6) + '" fill="none" stroke="rgba(120,100,80,.3)" stroke-width="1.6"/>' +
    '<g transform="translate(' + (c.x + T / 2 + 1) + ' ' + (c.y + T / 2 + 2) + ') rotate(-32)"><rect x="-19" y="-4" width="42" height="14" rx="7" fill="rgba(0,0,0,.5)"/><rect x="-21" y="-7" width="42" height="14" rx="7" fill="#8a5a2a" stroke="' + TR + '" stroke-width="1.6"/><path d="M-12 -7v14M12 -7v14" stroke="#e8c46a" stroke-width="2.4"/><path d="M-9 -7v14M15 -7v14" stroke="rgba(60,30,8,.5)" stroke-width="1"/><path d="M-17 -3.4h32" stroke="rgba(255,225,170,.55)" stroke-width="1.6" stroke-linecap="round"/><circle cx="21" r="5.6" fill="#6b4424" stroke="' + TR + '" stroke-width="1.4"/><circle cx="21" r="2.4" fill="none" stroke="#e8c46a" stroke-width="1"/><path d="M-21 0c-6 2 -7 8 -3 11" fill="none" stroke="#5a2a1a" stroke-width="1.6" stroke-linecap="round"/></g>';
}
/* la fenêtre du mur de gauche : la jardinière dehors, les carreaux, la tablette de bois, le chat de pierre, un pot de géranium */
function fenetreGauche(F){
  var y0 = F.y0, y1 = F.y1, m = (y0 + y1) / 2, s = '<rect x="0" y="' + y0 + '" width="' + MUR + '" height="' + (y1 - y0) + '" fill="#c9b892"/>', k;
  s += '<rect x="-6" y="' + (y0 + 8) + '" width="12" height="' + (y1 - y0 - 16) + '" rx="3" fill="#6b4424" stroke="' + TR + '" stroke-width="1.6"/>';
  for(k = 0; k < 6; k++) s += '<circle cx="' + (k % 2 ? 2 : -1) + '" cy="' + n(y0 + 20 + k * (y1 - y0 - 40) / 5) + '" r="5" fill="' + ['#e86a7a', '#f2c94c', '#e86a7a', '#f6f1e8', '#e86a7a', '#f2c94c'][k] + '" stroke="rgba(60,30,10,.6)" stroke-width=".8"/><circle cx="' + (k % 2 ? 5 : 3) + '" cy="' + n(y0 + 28 + k * (y1 - y0 - 40) / 5) + '" r="3.4" fill="#4a8a3a"/>';
  s += '<rect x="10" y="' + y0 + '" width="7" height="' + (y1 - y0) + '" fill="#bfe6f7" stroke="' + TR + '" stroke-width="1.4"/><path d="M12 ' + (y0 + 6) + 'v' + (y1 - y0 - 12) + '" stroke="rgba(255,255,255,.85)" stroke-width="1.6"/>';
  [y0, m, y1].forEach(function(y){ s += '<rect x="7" y="' + (y - 5) + '" width="13" height="10" rx="2" fill="#7a5230" stroke="' + TR + '" stroke-width="1.5"/>'; });
  s += '<rect x="' + (MUR - 1) + '" y="' + (y0 - 3) + '" width="34" height="' + (y1 - y0 + 12) + '" rx="3" fill="rgba(18,8,0,.3)"/><rect x="' + (MUR - 3) + '" y="' + (y0 - 6) + '" width="34" height="' + (y1 - y0 + 12) + '" rx="3" fill="#8a5c34" stroke="' + TR + '" stroke-width="2"/><path d="M' + (MUR + 4) + ' ' + y0 + 'v' + (y1 - y0) + 'M' + (MUR + 13) + ' ' + (y0 + 4) + 'v' + (y1 - y0 - 12) + 'M' + (MUR + 22) + ' ' + (y0 - 2) + 'v' + (y1 - y0 - 6) + '" stroke="rgba(40,18,4,.3)" stroke-width="1"/><path d="M' + MUR + ' ' + (y0 - 3) + 'h20" stroke="rgba(255,225,170,.4)" stroke-width="1.6"/>';
  /* le pot de géranium */
  s += '<g transform="translate(' + (MUR + 13) + ' ' + (y0 + 26) + ') scale(1.15)"><circle cx="1.5" cy="2.5" r="9.5" fill="rgba(18,8,0,.3)"/><circle r="9" fill="#b06a42" stroke="' + TR + '" stroke-width="1.5"/><circle r="6" fill="#3f7a34"/>' + [[0, -3], [-3, 2], [3, 2]].map(function(f){ return '<circle cx="' + f[0] + '" cy="' + f[1] + '" r="2.8" fill="#e23e52" stroke="rgba(60,10,10,.6)" stroke-width=".7"/>'; }).join('') + '</g>';
  return s + chatDePierre(MUR + 14, m, 1.3);
}
/* la porte du bas : le seuil de pierre, le battant ouvert vers l'intérieur, sa poignée */
function porteBas(Pt){
  var x0 = Pt.x0, x1 = Pt.x1, y = H - MUR;
  return '<rect x="' + x0 + '" y="' + y + '" width="' + (x1 - x0) + '" height="' + MUR + '" fill="#9a9184" stroke="' + TR + '" stroke-width="1.6"/><path d="M' + (x0 + 6) + ' ' + (y + 9) + 'h' + (x1 - x0 - 12) + 'M' + (x0 + 6) + ' ' + (y + 19) + 'h' + (x1 - x0 - 12) + '" stroke="rgba(40,34,28,.35)" stroke-width="1.2"/>' +
    '<path d="M' + x0 + ' ' + y + 'A' + (x1 - x0) + ' ' + (x1 - x0) + ' 0 0 1 ' + n(x0 - (x1 - x0) * .64) + ' ' + n(y - (x1 - x0) * .77) + '" fill="none" stroke="rgba(255,240,210,.14)" stroke-width="1.4" stroke-dasharray="4 5"/>' +
    '<g transform="translate(' + x0 + ' ' + y + ') rotate(-130)"><rect x="3" y="2" width="' + (x1 - x0) + '" height="9" rx="2" fill="rgba(18,8,0,.32)"/><rect x="0" y="-5" width="' + (x1 - x0) + '" height="10" rx="2" fill="#6b4424" stroke="' + TR + '" stroke-width="2"/><path d="M6 -1h' + (x1 - x0 - 12) + '" stroke="rgba(255,220,170,.3)" stroke-width="1.4"/><circle cx="' + (x1 - x0 - 9) + '" cy="6" r="3" fill="#c9952e" stroke="' + TR + '" stroke-width="1.2"/></g>' +
    '<rect x="' + (x0 - 5) + '" y="' + (y - 3) + '" width="8" height="' + (MUR + 6) + '" rx="2" fill="#6b4424" stroke="' + TR + '" stroke-width="1.5"/><rect x="' + (x1 - 3) + '" y="' + (y - 3) + '" width="8" height="' + (MUR + 6) + '" rx="2" fill="#6b4424" stroke="' + TR + '" stroke-width="1.5"/>';
}

/* ---------- La lumière ---------- */
var RAYON = {x:0, y:262, w:480, h:276};   /* la boîte du calque du soleil (dans le dessin) */
/* le rayon de soleil : deux carreaux de lumière (le meneau de la fenêtre les sépare), plus pâles en s'éloignant ; la flaque de lumière
   sur les dalles ; l'ombre du pot de géranium ; l'ombre longue du chat de pierre, dont la tête se pose sur la dalle du milieu */
function soleil(M, u){
  var F = M.fenetre, m = (F.y0 + F.y1) / 2, xf = 470, ht = F.y1 - F.y0, s = '';
  function bande(a, b, a2, b2, g){ return '<path d="M' + MUR + ' ' + n(a) + 'L' + xf + ' ' + n(a2) + 'L' + xf + ' ' + n(b2) + 'L' + MUR + ' ' + n(b) + 'Z" fill="url(#' + u + g + ')"/>'; }
  s += bande(F.y0 - 10, F.y1 + 10, F.y0 - 50, F.y1 + 50, 'pen');     /* la pénombre, autour */
  s += bande(F.y0 + 4, F.y1 - 4, F.y0 - 24, F.y1 + 24, 'ray');       /* le rayon */
  [[.1, .09], [.33, .04], [.62, .11], [.86, .05]].forEach(function(q){   /* des raies plus claires, dans le rayon */
    var a = F.y0 + 4 + (ht - 8) * q[0], a2 = F.y0 - 24 + (ht + 48) * q[0];
    s += bande(a, a + ht * q[1], a2, a2 + ht * q[1] * 1.3, 'raie');
  });
  s += '<ellipse cx="322" cy="400" rx="124" ry="108" fill="url(#' + u + 'flaque)"/>';
  /* l'ombre du pot de géranium, celle du meneau, et celle du chat qui dort : un long cou d'ombre, une tête, deux oreilles */
  s += '<ellipse cx="' + (MUR + 76) + '" cy="' + (F.y0 + 25) + '" rx="54" ry="10" fill="rgba(30,14,4,.24)"/>';
  s += '<path d="M' + (MUR + 30) + ' ' + (m - 3) + 'L' + xf + ' ' + (m - 5) + 'L' + xf + ' ' + (m + 5) + 'L' + (MUR + 30) + ' ' + (m + 3) + 'Z" fill="url(#' + u + 'meneau)"/>';
  s += '<path class="in-ombre-chat" d="M' + (MUR + 28) + ' ' + (m - 14) + 'C120 ' + (m - 13) + ' 220 ' + (m - 12) + ' 280 ' + (m - 12) + 'C283 ' + (m - 21) + ' 298 ' + (m - 25) + ' 309 ' + (m - 19) + 'L335 ' + (m - 22) + 'L322 ' + (m - 6) + 'Q326 ' + m + ' 322 ' + (m + 6) + 'L335 ' + (m + 22) + 'L309 ' + (m + 19) + 'C298 ' + (m + 25) + ' 283 ' + (m + 21) + ' 280 ' + (m + 12) + 'C220 ' + (m + 12) + ' 120 ' + (m + 13) + ' ' + (MUR + 28) + ' ' + (m + 14) + 'Z" fill="rgba(30,14,4,.42)"/>';
  s += '<ellipse cx="' + (MUR - 8) + '" cy="' + m + '" rx="36" ry="' + n(ht * .58) + '" fill="url(#' + u + 'eclat)"/>';
  /* le chat de pierre, redessiné par-dessus l'éclat de la vitre (on doit bien le voir : c'est lui, « le chat qui dort ») */
  return s + chatDePierre(MUR + 14, m, 1.3);
}
function defs(u){
  return '<defs>' +
    '<pattern id="' + u + 'vichy" width="16" height="16" patternUnits="userSpaceOnUse"><rect width="16" height="16" fill="#f7f1e3"/><rect width="8" height="16" fill="rgba(190,50,60,.55)"/><rect width="16" height="8" fill="rgba(190,50,60,.55)"/></pattern>' +
    '<linearGradient id="' + u + 'ray" gradientUnits="userSpaceOnUse" x1="' + MUR + '" y1="0" x2="470" y2="0"><stop offset="0" stop-color="#ffe08a" stop-opacity=".5"/><stop offset=".5" stop-color="#ffd36b" stop-opacity=".3"/><stop offset="1" stop-color="#ffc85a" stop-opacity="0"/></linearGradient>' +
    '<linearGradient id="' + u + 'pen" gradientUnits="userSpaceOnUse" x1="' + MUR + '" y1="0" x2="470" y2="0"><stop offset="0" stop-color="#ffd98a" stop-opacity=".2"/><stop offset=".6" stop-color="#ffc85a" stop-opacity=".1"/><stop offset="1" stop-color="#ffc85a" stop-opacity="0"/></linearGradient>' +
    '<linearGradient id="' + u + 'raie" gradientUnits="userSpaceOnUse" x1="' + MUR + '" y1="0" x2="470" y2="0"><stop offset="0" stop-color="#fffbe0" stop-opacity=".34"/><stop offset=".7" stop-color="#fff0b8" stop-opacity=".1"/><stop offset="1" stop-color="#fff0b8" stop-opacity="0"/></linearGradient>' +
    '<linearGradient id="' + u + 'meneau" gradientUnits="userSpaceOnUse" x1="' + MUR + '" y1="0" x2="470" y2="0"><stop offset="0" stop-color="#1e0e04" stop-opacity=".3"/><stop offset="1" stop-color="#1e0e04" stop-opacity="0"/></linearGradient>' +
    '<radialGradient id="' + u + 'flaque"><stop offset="0" stop-color="#fff0b0" stop-opacity=".26"/><stop offset=".6" stop-color="#ffd36b" stop-opacity=".1"/><stop offset="1" stop-color="#ffd36b" stop-opacity="0"/></radialGradient>' +
    '<radialGradient id="' + u + 'eclat"><stop offset="0" stop-color="#fffbe6" stop-opacity=".85"/><stop offset=".4" stop-color="#ffe9a0" stop-opacity=".4"/><stop offset="1" stop-color="#ffe9a0" stop-opacity="0"/></radialGradient>' +
    '<radialGradient id="' + u + 'nuit" cx=".5" cy=".5" r=".75"><stop offset="0" stop-color="#141a44" stop-opacity=".3"/><stop offset="1" stop-color="#0a0e2a" stop-opacity=".76"/></radialGradient>' +
    '<radialGradient id="' + u + 'jour" cx=".42" cy=".5" r=".8"><stop offset=".3" stop-color="#2a1608" stop-opacity="0"/><stop offset="1" stop-color="#1c0e04" stop-opacity=".6"/></radialGradient>' +
    '<linearGradient id="' + u + 'froid" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#b9d4ff" stop-opacity=".2"/><stop offset="1" stop-color="#b9d4ff" stop-opacity="0"/></linearGradient>' +
    '<radialGradient id="' + u + 'feufixe"><stop offset="0" stop-color="#ffb04a" stop-opacity=".5"/><stop offset=".45" stop-color="#ff8a2a" stop-opacity=".2"/><stop offset="1" stop-color="#ff8a2a" stop-opacity="0"/></radialGradient>' +
    '<linearGradient id="' + u + 'omh" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#140800" stop-opacity=".5"/><stop offset="1" stop-color="#140800" stop-opacity="0"/></linearGradient>' +
    '<linearGradient id="' + u + 'omg" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#140800" stop-opacity=".5"/><stop offset="1" stop-color="#140800" stop-opacity="0"/></linearGradient>' +
    '</defs>';
}
/* un calque : un petit dessin posé à sa place dans la pièce (boîte b : {x, y, w, h}, dans les unités du dessin) */
function calque(cls, b, contenu){
  return '<svg class="' + cls + '" style="left:' + n(b.x / W * 100) + '%;top:' + n(b.y / H * 100) + '%;width:' + n(b.w / W * 100) + '%;height:' + n(b.h / H * 100) + '%" viewBox="' + b.x + ' ' + b.y + ' ' + b.w + ' ' + b.h + '" preserveAspectRatio="none" aria-hidden="true">' + contenu + '</svg>';
}
var TOUT = {x:0, y:0, w:W, h:H};
function u1(v){ return 'calc(var(--in-u,1px)*' + n(v) + ')'; }
/* Le dessin d'une pièce. o : {maison, moment ('matin' | 'apresmidi' | 'nuit'), lait} → le HTML d'une pile de calques (.in-piece,
   3 de large pour 4 de haut ; à poser dans un cadre, puis caler(piece, cadre) règle sa taille et son unité --in-u) */
function dessiner(o){
  o = o || {};
  var M = MAISONS[o.maison] || MAISONS.odette, R = graine(M.graine), u = 'in' + (++uidN) + '-', jour = o.moment === 'apresmidi', nuit = o.moment === 'nuit', D = M.dalles, F = M.fenetre, T = DALLE.t, k, f, s;
  /* ---- le décor (immobile) ---- */
  f = defs(u) + plancher(R);
  var pierres = D ? pierresDalles(M, R) : [];
  if(D) f += cadreDalles(M) + pierres.filter(function(x, i){ return i !== D.cachette; }).join('');
  f += '<rect x="' + MUR + '" y="' + MUR + '" width="' + (W - 2 * MUR) + '" height="26" fill="url(#' + u + 'omh)"/><rect x="' + MUR + '" y="' + MUR + '" width="22" height="' + (H - 2 * MUR) + '" fill="url(#' + u + 'omg)"/>';
  f += mur(0, 0, W, MUR, R) + mur(0, H - MUR, W, MUR, R) + mur(0, 0, MUR, H, R) + mur(W - MUR, 0, MUR, H, R);
  f += '<rect x="' + MUR + '" y="' + MUR + '" width="' + (W - 2 * MUR) + '" height="' + (H - 2 * MUR) + '" fill="none" stroke="' + TR + '" stroke-width="2.6"/>';
  if(M.cheminee) f += MEUBLES.cheminee(M.cheminee, R);
  if(F) f += fenetreGauche(F);
  if(M.porte) f += porteBas(M.porte);
  f += poteau(14, 14) + poteau(W - 14, 14) + poteau(14, H - 14) + poteau(W - 14, H - 14);
  f += M.meubles(R, u, {lait:!!o.lait});
  if(jour) f += '<rect width="' + W + '" height="' + H + '" fill="url(#' + u + 'jour)"/>';
  else {
    var m = F ? (F.y0 + F.y1) / 2 : 400;
    f += '<rect width="' + W + '" height="' + H + '" fill="#101638" opacity="' + (nuit ? .52 : .3) + '"/><rect width="' + W + '" height="' + H + '" fill="url(#' + u + 'nuit)"/>';
    if(F && !nuit) f += '<path d="M' + MUR + ' ' + (F.y0 + 6) + 'L210 ' + (F.y0 - 14) + 'L210 ' + (F.y1 + 14) + 'L' + MUR + ' ' + (F.y1 - 6) + 'Z" fill="url(#' + u + 'froid)"/><rect x="9" y="' + F.y0 + '" width="9" height="' + (F.y1 - F.y0) + '" fill="#cfe2ff" opacity=".3"/>';
  }
  if(M.cheminee) f += '<ellipse cx="' + (M.cheminee.x + M.cheminee.w / 2) + '" cy="' + (MUR + 50) + '" rx="' + (jour ? 110 : 160) + '" ry="' + (jour ? 84 : 124) + '" fill="url(#' + u + 'feufixe)"/>';
  s = '<div class="in-piece in-' + (jour ? 'jour' : 'ombre') + '" role="img" aria-label="' + esc(M.nom) + ', vue de dessus">' + calque('in-fond', TOUT, f);
  if(D){
    /* la dalle de la cachette, dans sa case : quand elle glisse, elle disparaît sous sa voisine (le matin aussi : dans l'ombre, elle
       porte la même pénombre que ses voisines) */
    var c = dalleXY(D.cachette);
    s += calque('in-glisse', {x:c.x - 3, y:c.y - 3, w:T + 6, h:T + 6}, '<g class="in-glisse-g">' + pierres[D.cachette] +
      (jour ? '' : '<rect x="' + (c.x - 2) + '" y="' + (c.y - 2) + '" width="' + (T + 4) + '" height="' + (T + 4) + '" fill="#101638" opacity="' + (nuit ? .52 : .3) + '"/><rect x="' + (c.x - 2) + '" y="' + (c.y - 2) + '" width="' + (T + 4) + '" height="' + (T + 4) + '" fill="#141a44" opacity=".32"/>') + '</g>');
  }
  if(jour && F) s += calque('in-rayons', RAYON, defs(u + 'r-') + soleil(M, u + 'r-'));
  if(jour && D){
    /* les trois dalles que le soleil allume, l'une après l'autre (le mini-jeu pose la classe « on ») : une lueur dorée, rien d'écrit */
    var cote = 3 * T + 2 * DALLE.e, ors = '';
    D.ordre.forEach(function(sg, rang){
      var kk = D.signes.indexOf(sg), p = dalleXY(kk);
      ors += '<g class="in-or" data-k="' + kk + '" data-rang="' + rang + '"><rect x="' + (p.x - 5) + '" y="' + (p.y - 5) + '" width="' + (T + 10) + '" height="' + (T + 10) + '" rx="7" fill="#ffb52e" fill-opacity=".3"/>' +
        '<rect x="' + (p.x + 1) + '" y="' + (p.y + 1) + '" width="' + (T - 2) + '" height="' + (T - 2) + '" rx="3" fill="#ffd36b" fill-opacity=".62" stroke="#fff1b8" stroke-width="2.6"/>' +
        '<rect x="' + (p.x + 9) + '" y="' + (p.y + 9) + '" width="' + (T - 18) + '" height="' + (T - 18) + '" rx="6" fill="#fffbe0" fill-opacity=".5"/></g>';
    });
    s += calque('in-ors', {x:DALLE.x - 10, y:DALLE.y - 10, w:cote + 20, h:cote + 20}, ors);
  }
  /* la poussière qui danse dans le rayon (des pastilles : elles ne font que glisser et pâlir) */
  if(jour && F){
    var Rg = graine(M.graine + 9), mm = (F.y0 + F.y1) / 2;
    s += '<div class="in-grains" aria-hidden="true">';
    for(k = 0; k < 20; k++){
      var t = Rg(), gx = MUR + 26 + t * 400, gh = (F.y1 - F.y0) * (.86 + t * .3), gy = mm + (Rg() - .5) * gh, gr = 2.2 + Rg() * 3.2;
      s += '<i style="left:' + u1(gx) + ';top:' + u1(gy) + ';width:' + u1(gr) + ';height:' + u1(gr) + ';animation-duration:' + n(6 + Rg() * 7) + 's;animation-delay:-' + n(Rg() * 12) + 's"></i>';
    }
    s += '</div>';
  }
  /* la braise qui palpite */
  if(M.cheminee){
    var cx = M.cheminee.x + M.cheminee.w / 2, cy = MUR + 40;
    s += '<div class="in-feu" aria-hidden="true"><b style="left:' + u1(cx - 130) + ';top:' + u1(cy - 96) + ';width:' + u1(260) + ';height:' + u1(210) + '"></b>' +
      BRAISES.map(function(q, i){ return '<i style="left:' + u1(cx + q[0] - q[2]) + ';top:' + u1(cy + q[1] - q[2]) + ';width:' + u1(q[2] * 2) + ';height:' + u1(q[2] * 2) + ';animation-delay:-' + (i * .43).toFixed(2) + 's"></i>'; }).join('') + '</div>';
  }
  /* ce qui prend le doigt : les dalles (et la marque de celles qu'on a enfoncées), les meubles à regarder */
  var v = '';
  if(D) for(k = 0; k < 9; k++){
    var q = dalleXY(k);
    v += '<g class="in-dalle" data-k="' + k + '">' +
      '<rect class="in-enfonce" x="' + (q.x + 1) + '" y="' + (q.y + 1) + '" width="' + (T - 2) + '" height="' + (T - 2) + '" rx="2" fill="rgba(24,12,2,' + (jour ? '.36' : '.5') + ')" stroke="' + (jour ? '#ffd36b' : '#aab4d8') + '" stroke-width="3"/>' +   /* (la dalle enfoncée : plus sombre, un liseré ; aucun signe) */
      '<rect class="in-touche" x="' + (q.x - 3) + '" y="' + (q.y - 3) + '" width="' + (T + 6) + '" height="' + (T + 6) + '" fill="#fff" fill-opacity="0"/></g>';
  }
  v += (M.regards || []).map(function(g){ return '<rect class="in-regard" data-o="' + g.id + '" x="' + g.r[0] + '" y="' + g.r[1] + '" width="' + g.r[2] + '" height="' + g.r[3] + '" rx="8" fill="#fff" fill-opacity="0"/>'; }).join('');
  s += calque('in-vie', TOUT, v);
  if(D){ var c2 = dalleXY(D.cachette); s += '<i class="in-eclat-tube" aria-hidden="true" style="left:' + u1(c2.x + T / 2 - 22) + ';top:' + u1(c2.y + T / 2 - 22) + ';width:' + u1(44) + ';height:' + u1(44) + '"></i>'; }
  return s + '</div>';
}
/* règle la taille de la pièce dans son cadre (la plus grande qui tient, 3 pour 4) et son unité ; → de quoi arrêter de surveiller */
function caler(piece, cadre){
  function f(){
    var w = cadre.clientWidth, h = cadre.clientHeight; if(!w || !h) return;
    var l = Math.floor(Math.min(w, h * W / H));
    piece.style.width = l + 'px'; piece.style.height = Math.floor(l * H / W) + 'px';
    piece.style.setProperty('--in-u', (l / W).toFixed(4) + 'px');
  }
  var ro = window.ResizeObserver ? new ResizeObserver(f) : null;
  if(ro) ro.observe(cadre); else window.addEventListener('resize', f);
  f(); try{ requestAnimationFrame(f); }catch(e){}
  return function(){ if(ro) ro.disconnect(); else window.removeEventListener('resize', f); };
}

/* ==========================================================
   Le mini-jeu
   ========================================================== */
/* (19 novembre) AUCUNE phrase d'aide : ni « reviens cet après-midi », ni « trois dalles, dans le bon ordre », ni « demande au Sage ».
   Ces phrases disent seulement où l'on est, et ce qui vient de se passer. */
var TEXTES = {
  matin:'La maison d\'Odette. Pas un bruit… et pas un chat.',
  nuit:'La maison d\'Odette, en pleine nuit. Seule la braise éclaire encore un peu.',
  jour:'La maison d\'Odette. Le soleil entre par la fenêtre.',
  faux:'Clac ! Les dalles remontent.',
  bon:'Un déclic, sous tes pieds… La dalle du milieu glisse !'
};
MJ.PHRASES = MJ.PHRASES || {};
MJ.PHRASES.interieur = function(p){ return 'Regarde partout, du bout du doigt !'; };
MJ.PLEIN_ECRAN = MJ.PLEIN_ECRAN || {};
MJ.PLEIN_ECRAN.interieur = 1;
MJ.enregistrer('interieur', {
  nom:'Fouiller la maison', role:'pisteur', ic:'🏠',
  consigne:function(p){ return 'Fouille la pièce : regarde chaque meuble de près.'; },
  reglages:function(nv, mods){ return {lignes:[{nom:'Essais', val:'autant que tu veux'}]}; },
  jouer:function(zone, params, fin){
    var id = MAISONS[params.maison] ? params.maison : 'odette', M = MAISONS[id], D = M.dalles;
    /* visite (params.visite, ou une maison sans dalles) : on regarde seulement. Sinon les dalles s'enfoncent, le matin comme l'après-midi. */
    var jour = params.moment === 'apresmidi', visite = !!params.visite || !D, essais = 0, pris = [], fini = false, bloque = false, minut = [], suite = [], allumees = [], tSuite = 0, temps = [];
    zone.innerHTML = '<div class="in-jeu' + (jour ? ' in-j-jour' : ' in-j-ombre') + (visite ? ' in-j-visite' : '') + '">' +
      '<div class="in-cadre">' + dessiner({maison:id, moment:params.moment, lait:!!params.lait}) + '</div>' +
      '<div class="in-bas"><p class="in-bulle" aria-live="polite"></p>' +
      '<div class="in-actions"><button type="button" class="btn second in-sortir">Sortir de la maison</button></div></div></div>';
    var racine = zone.firstChild, piece = racine.querySelector('.in-piece'), vie = racine.querySelector('.in-vie'), bulle = racine.querySelector('.in-bulle');
    var decaler = caler(piece, racine.querySelector('.in-cadre'));
    function apres(ms, f){ var t = setTimeout(f, ms); minut.push(t); return t; }
    function dire(t){
      bulle.textContent = t;
      if(MJ.boutonLire && MJ.nbMots && MJ.nbMots(t) > 3) bulle.appendChild(MJ.boutonLire(t));
      bulle.classList.remove('in-neuf'); void bulle.offsetWidth; bulle.classList.add('in-neuf');
    }
    function dalleEl(k){ return vie.querySelector('.in-dalle[data-k="' + k + '"]'); }
    /* L'APRÈS-MIDI, LE SOLEIL MONTRE L'ORDRE : la première dalle s'allume « d0 » millisecondes après, la deuxième une seconde plus tard,
       la troisième une seconde plus tard encore. Elles restent allumées. (Après un essai raté : tout s'éteint, et ça recommence.) */
    function eteindre(){
      suite.forEach(clearTimeout); suite = []; allumees = []; temps = [];
      Array.prototype.forEach.call(racine.querySelectorAll('.in-or.on'), function(e){ e.classList.remove('on'); });
    }
    function montrer(d0){
      if(!jour || visite || !D) return;
      eteindre(); tSuite = Date.now();
      D.ordre.forEach(function(sg, i){
        suite.push(apres(d0 + i * 1000, function(){
          if(fini) return;
          var k = D.signes.indexOf(sg), e = racine.querySelector('.in-or[data-k="' + k + '"]');
          if(e) e.classList.add('on');
          allumees.push(k); temps.push(Date.now() - tSuite); U.son('ok');   /* (temps : pour les robots — à quel instant chaque dalle s'est allumée) */
        }));
      });
    }
    function terminer(res){
      if(fini) return; fini = true;
      minut.forEach(clearTimeout); try{ decaler(); }catch(e){}
      fin(Object.assign({essais:essais}, res));
    }
    function reussir(){
      bloque = true;
      U.son('magie'); U.vibrer([40, 60, 120]);
      pris.forEach(function(k){ dalleEl(k).classList.add('in-bonne'); });
      dire(TEXTES.bon);
      apres(900, function(){ racine.classList.add('in-ouvert'); U.son('porte'); });
      apres(3200, function(){ terminer({reussi:true, message:'Une cachette !', detail:'Sous la dalle du milieu, un étui de cuir attendait là depuis très longtemps.'}); });
    }
    function rater(){
      bloque = true; essais++;
      U.son('ko'); U.vibrer(80);
      racine.classList.add('in-secoue');
      dire(TEXTES.faux);
      apres(750, function(){
        pris.forEach(function(k){ dalleEl(k).classList.remove('in-bas-d'); });
        pris = []; racine.classList.remove('in-secoue'); bloque = false;
        montrer(1000);
      });
    }
    function appuyer(k){
      if(fini || bloque || !D || !(k >= 0 && k < 9)) return;
      if(visite){ U.son('tic'); return; }
      if(pris.indexOf(k) >= 0) return;
      pris.push(k); dalleEl(k).classList.add('in-bas-d');
      U.son('tic'); U.vibrer(20);
      if(pris.length < 3) return;
      var ok = pris.every(function(d, i){ return D.signes[d] === D.ordre[i]; });
      bloque = true;
      apres(420, function(){ bloque = false; if(ok) reussir(); else rater(); });
    }
    function regarder(o){
      var g = (M.regards || []).filter(function(x){ return x.id === o; })[0];
      if(!g || bloque || fini) return;
      U.son('clic'); dire(params.lait && g.lait ? g.lait : g.t);
    }
    function clic(e){
      var d = e.target.closest ? e.target.closest('.in-dalle') : null;
      if(d){ appuyer(+d.getAttribute('data-k')); return; }
      var r = e.target.closest ? e.target.closest('.in-regard') : null;
      if(r) regarder(r.getAttribute('data-o'));
    }
    vie.addEventListener('click', clic);
    racine.querySelector('.in-sortir').onclick = function(){
      /* (direct : pas d'écran de résultat — on ressort, c'est tout ; mj-core.js. sorti : le jeu ne dit ni « Raté » ni « Réessaie » :
         il ramène devant la maison, moteur-actions.js) */
      if(visite) terminer({reussi:true, direct:true});
      else terminer({reussi:false, direct:true, sorti:true});
    };
    dire(jour ? TEXTES.jour : (params.moment === 'nuit' ? TEXTES.nuit : TEXTES.matin));
    montrer(3000);
    window.__interieur = {
      etat:function(){ return {maison:id, jour:jour, visite:visite, pris:pris.map(function(k){ return D.signes[k]; }), essais:essais, fini:fini, ouvert:racine.classList.contains('in-ouvert'), signes:D ? D.signes.slice() : [],
        allumees:allumees.map(function(k){ return D.signes[k]; }), temps:temps.slice(), bulle:bulle.textContent}; },
      dalle:function(k){ appuyer(typeof k === 'string' ? D.signes.indexOf(k) : k); },
      regarder:regarder,
      sortir:function(){ racine.querySelector('.in-sortir').click(); }
    };
    return {arreter:function(){ fini = true; minut.forEach(clearTimeout); try{ decaler(); }catch(e){} vie.removeEventListener('click', clic); }};
  }
});

MJ.DEMOS = MJ.DEMOS || {};
/* l'explication en images : la fouille — une main se pose sur un meuble, une bulle s'ouvre. Le matin comme l'après-midi : on ne montre
   pas les dalles (19 novembre : aucune aide). */
MJ.DEMOS.interieur = {w:300, h:420, f:function(el, p){
    var k, s = '<svg class="in-demo in-demo-visite" viewBox="0 0 300 420" preserveAspectRatio="xMidYMid meet"><rect width="300" height="420" fill="#3a2a1c"/>';
    for(k = 0; k < 6; k++) s += '<rect x="' + (k * 50) + '" y="0" width="50" height="420" fill="' + ['#8a5c34', '#7d5230', '#906238', '#84572f', '#8c5e36', '#7a4f2c'][k] + '" stroke="rgba(26,12,4,.5)" stroke-width="1.4"/><path d="M' + (k * 50 + 12) + ' 0C' + (k * 50 + 20) + ' 140 ' + (k * 50 + 6) + ' 280 ' + (k * 50 + 14) + ' 420M' + (k * 50 + 34) + ' 0C' + (k * 50 + 28) + ' 160 ' + (k * 50 + 40) + ' 300 ' + (k * 50 + 32) + ' 420" fill="none" stroke="rgba(52,26,8,.25)" stroke-width="1.2"/>';
    s += (p && p.moment === 'apresmidi' ? '<path d="M0 150L300 110L300 300L0 262Z" fill="rgba(255,214,120,.3)"/>' : '<rect width="300" height="420" fill="#101638" opacity=".42"/>') +
      '<g transform="translate(150 250)"><circle cx="5" cy="8" r="66" fill="rgba(18,8,0,.34)"/><circle r="64" fill="#6b4424" stroke="#2c2118" stroke-width="3"/><circle r="56" fill="#f7f1e3" stroke="#2c2118" stroke-width="2"/><circle r="56" fill="rgba(190,50,60,.3)"/><circle cx="-6" cy="-8" r="19" fill="#4a7db0" stroke="#2c2118" stroke-width="2.4"/><circle cx="-6" cy="-8" r="5" fill="#f4ead0" stroke="#2c2118" stroke-width="1.4"/><circle cx="30" cy="20" r="12" fill="#f7f1e3" stroke="#2c2118" stroke-width="1.8"/><circle cx="30" cy="20" r="6" fill="#8a5a2a"/><circle cx="-32" cy="24" r="12" fill="#f7f1e3" stroke="#2c2118" stroke-width="1.8"/><circle cx="-32" cy="24" r="6" fill="#8a5a2a"/></g>' +
      '<g class="in-demo-bulle"><rect x="40" y="52" width="220" height="86" rx="16" fill="#fbf3dc" stroke="#2c2118" stroke-width="3"/><path d="M132 136l18 26 14 -26z" fill="#fbf3dc" stroke="#2c2118" stroke-width="3" stroke-linejoin="round"/><path d="M134 135h28" stroke="#fbf3dc" stroke-width="5"/><path d="M62 82h176M62 104h130" stroke="#8a6a3a" stroke-width="7" stroke-linecap="round"/></g>';
    s += '<text class="in-demo-main" x="0" y="0" font-size="50" text-anchor="middle">👆</text></svg>';
    el.innerHTML = s;
    return {arreter:function(){ var d = el.firstChild; if(d && d.classList) d.classList.add('in-fige'); }};
  }};

MJ.Interieur = {SIGNES:SIGNES, MAISONS:MAISONS, MEUBLES:MEUBLES, dessiner:dessiner, caler:caler, signeSVG:signeSVG, DALLE:DALLE, dalleXY:dalleXY, W:W, H:H, MUR:MUR};
})();
