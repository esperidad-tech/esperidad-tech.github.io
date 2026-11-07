
/* ==========================================================
   Les couleurs de la décoration : 8 thèmes. Le premier, « naturel », est le dessin d'origine.
   Un objet qui se décore porte un style o.st (un nombre) : sa forme = st % nf, son thème = st % 8.
   nf (le nombre de formes : 1, 3 ou 5) n'a aucun facteur commun avec 8 : en touchant encore et encore,
   on passe par TOUTES les formes et TOUTES les couleurs, et chaque toucher change les deux.
   ========================================================== */
var THEMES = [
  {id:'naturel', nom:'naturel', c:'#c98450'},
  {id:'violet', nom:'violet', c:'#8d5cf0'},
  {id:'jaune', nom:'jaune', c:'#f2c230'},
  {id:'rose', nom:'rose', c:'#f06eaa'},
  {id:'vert', nom:'vert', c:'#4cbb5c'},
  {id:'bleu', nom:'bleu', c:'#3d8ef0'},
  {id:'rouge', nom:'rouge', c:'#e0443a'},
  {id:'orange', nom:'orange', c:'#f58a2a'}
];
var NT = THEMES.length;
function hexRgb(h){ h = String(h).replace('#', ''); return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)]; }
function rgbHex(r){ return '#' + r.map(function(v){ v = Math.round(borne(v, 0, 255)); return (v < 16 ? '0' : '') + v.toString(16); }).join(''); }
function melange(a, b, t){ var x = hexRgb(a), y = hexRgb(b); return rgbHex([0, 1, 2].map(function(i){ return x[i] + (y[i] - x[i]) * t; })); }
function clair(c, t){ return melange(c, '#ffffff', t); }
function sombre(c, t){ return melange(c, '#1c1230', t); }

/* Les dégradés d'origine qu'un thème repeint (le bois, la terre cuite, le métal, l'or, la pierre, la toile).
   Pour chaque arrêt : [éclaircir (+) ou assombrir (−), position, opacité?] ; v : dégradé vertical. */
var DEG_THEME = {
  bois:{s:[[0.3, 0], [0, 0.55], [-0.4, 1]]},
  boisC:{s:[[0.45, 0], [0.12, 0.6], [-0.22, 1]]},
  boisH:{s:[[0.55, 0], [0.22, 1]], v:1},
  boisS:{s:[[-0.25, 0], [-0.5, 1]]},
  terre:{s:[[0.35, 0], [0, 0.6], [-0.35, 1]]},
  cuivre:{s:[[0.55, 0], [0.05, 0.5], [-0.42, 1]]},
  metal:{s:[[-0.25, 0], [-0.5, 0.55], [-0.75, 1]]},
  or:{s:[[0.7, 0], [0.18, 0.5], [-0.3, 1]]},
  pierre:{s:[[0.4, 0], [0.12, 0.6], [-0.18, 1]]},
  toile:{s:[[0.62, 0], [0.38, 0.6], [0.1, 1]]}
};
function teinteArret(c, d){ return d >= 0 ? clair(c, d) : sombre(c, -d); }
function defsThemes(){
  var s = '';
  for(var i = 1; i < NT; i++){
    var c = THEMES[i].c;
    cles(DEG_THEME).forEach(function(n){
      var g = DEG_THEME[n];
      s += lin('t' + i + '-' + n, g.s.map(function(a){ return [teinteArret(c, a[0]), a[1]]; }), g.v);
    });
  }
  return s;
}
/* Repeindre un dessin : ses dégradés de bois, de terre, de métal… deviennent ceux du thème */
var RE_THEME = /url\(#atg-(boisC|boisH|boisS|bois|terre|cuivre|metal|or|pierre|toile)\)/g;
function repeindre(svg, ti){ return ti ? svg.replace(RE_THEME, 'url(#atg-t' + ti + '-$1)') : svg; }

/* ---------- Les styles ---------- */
function nfDe(c){ return (c && c.nf) || 1; }
function nStyles(c){ return nfDe(c) * NT; }
function styleAvec(nf, forme, theme){
  for(var s = 0; s < nf * NT; s++) if(s % nf === forme && s % NT === theme) return s;
  return 0;
}
function formeDe(o){ return (o.st || 0) % nfDe(catDe(o)); }
function themeDe(o){ return (o.st || 0) % NT; }
/* Les couleurs d'un thème pour un dessin : principale, claire, foncée ; « naturel » garde les couleurs d'origine */
function couleurs(ti, nat){
  if(!ti) return nat;
  var c = THEMES[ti].c;
  return [c, clair(c, 0.5), sombre(c, 0.38)];
}
/* Le décor des pièces : murs (fond, gauche, droite), plancher — 5 formes chacun.
   La chambre a ses murs et son plancher à elle (fond2, murG2, murD2, sol2), avec un style de départ plus doux (DECO_DEPART). */
var DECO_NF = {fond:5, murG:5, murD:5, sol:5, fond2:5, murG2:5, murD2:5, sol2:5};
var DECO_DEPART = {fond2:37, murG2:37, murD2:37, sol2:0};     /* 37 : des étoiles sur un mur bleu (une chambre de magicienne) */
var NOMS_FOND = ['pierres', 'rayures', 'étoiles', 'boiseries', 'fleurs'];
var NOMS_SOL = ['planches', 'damier', 'chevrons', 'dalles', 'tapis'];
function decoForme(V, cle){ return ((V.etat.deco || {})[cle] || 0) % DECO_NF[cle]; }
function decoTheme(V, cle){ return ((V.etat.deco || {})[cle] || 0) % NT; }
