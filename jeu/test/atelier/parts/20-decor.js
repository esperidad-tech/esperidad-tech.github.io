/* ==========================================================
   Décor : dégradés, la pièce, l'établi, le chaudron
   ========================================================== */
/* cls : les arrêts reçoivent une classe (couleurs changées par la lumière du moment, en CSS) */
function lin(id, st, vert, cls){
  return '<linearGradient id="atg-' + id + '" x1="0" y1="0" x2="' + (vert ? 0 : 1) + '" y2="' + (vert ? 1 : 0) + '">' +
    st.map(function(s, i){ return '<stop' + (cls ? ' class="at-s-' + cls + i + '"' : '') + ' offset="' + s[1] + '" stop-color="' + s[0] + '"' + (s[2] !== undefined ? ' stop-opacity="' + s[2] + '"' : '') + '/>'; }).join('') + '</linearGradient>';
}
function rad(id, st, cx, cy, r){
  return '<radialGradient id="atg-' + id + '" cx="' + (cx || 0.5) + '" cy="' + (cy || 0.5) + '" r="' + (r || 0.5) + '">' +
    st.map(function(s){ return '<stop offset="' + s[1] + '" stop-color="' + s[0] + '"' + (s[2] !== undefined ? ' stop-opacity="' + s[2] + '"' : '') + '/>'; }).join('') + '</radialGradient>';
}
function svgDefs(){
  return '<svg class="at-defs" width="0" height="0" aria-hidden="true" focusable="false"><defs>' +
    lin('bois', [['#dc9e63', 0], ['#b06f3e', 0.55], ['#7d4626', 1]]) +
    lin('arc', [['#ff6b6b', 0], ['#ffd84a', 0.3], ['#5fe08a', 0.55], ['#5fb8ff', 0.8], ['#b796ff', 1]]) +
    lin('boisC', [['#ecb882', 0], ['#c98450', 0.6], ['#9a5c31', 1]]) +
    lin('boisH', [['#f3c991', 0], ['#d29a5e', 1]], 1) +
    lin('boisS', [['#94603a', 0], ['#62381d', 1]]) +
    lin('carton', [['#f0c287', 0], ['#d29b5c', 0.6], ['#a87240', 1]]) +
    lin('cartonH', [['#f8dcac', 0], ['#e2b47a', 1]], 1) +
    lin('toile', [['#f4e6c4', 0], ['#d7bf90', 0.6], ['#ab9163', 1]]) +
    lin('metal', [['#5f5582', 0], ['#352c4f', 0.55], ['#1b1529', 1]]) +
    lin('cuivre', [['#ffcf9a', 0], ['#e08a4a', 0.5], ['#94481f', 1]]) +
    lin('verre', [['#ffffff', 0, 0.55], ['#bff3ff', 0.45, 0.16], ['#ffffff', 1, 0.32]]) +
    lin('pierre', [['#a9a5c6', 0], ['#77729c', 0.6], ['#524d75', 1]]) +
    lin('or', [['#fff1b8', 0], ['#f5b945', 0.5], ['#b07a1c', 1]]) +
    lin('vert', [['#a6ef93', 0], ['#4fb45f', 0.55], ['#25703c', 1]]) +
    lin('terre', [['#f0a172', 0], ['#c96a3e', 0.6], ['#94441f', 1]]) +
    lin('violet', [['#b796ff', 0], ['#7d5bd0', 0.6], ['#5537a0', 1]]) +
    lin('murF', [['#2b2148', 0], ['#3e2f5f', 0.6], ['#4a3868', 1]], 1, 'murF') +
    lin('murC', [['#1c1533', 0], ['#2a2048', 1]], 0, 'murC') +
    lin('murC2', [['#2a2048', 0], ['#1c1533', 1]], 0, 'murD') +
    lin('sol', [['#6b3f24', 0], ['#8a5634', 0.45], ['#5c341d', 1]], 1, 'sol') +
    lin('solOmbre', [['#140c18', 0, 0.55], ['#140c18', 1, 0]], 1) +
    lin('ciel', [['#0d1433', 0], ['#26306a', 0.7], ['#4b3f86', 1]], 1, 'ciel') +
    lin('rayon', [['#bff9ff', 0, 0.2], ['#8ff3ff', 1, 0]], 1) +
    rad('halo', [['#ffe9a3', 0, 0.55], ['#ffd36a', 1, 0]]) +
    rad('haloC', [['#bff9ff', 0, 0.55], ['#8ff3ff', 1, 0]]) +
    rad('haloL', [['#fff6d8', 0, 0.6], ['#fff6d8', 1, 0]]) +
    rad('soleil', [['#fff8d8', 0, 0.95], ['#ffe08a', 0.35, 0.6], ['#ffb347', 1, 0]]) +
    rad('feuMur', [['#ff9a4a', 0, 0.22], ['#ff7a3c', 1, 0]]) +
    rad('feuFoyer', [['#ffd36a', 0, 0.95], ['#ff7a3c', 0.5, 0.75], ['#a8391a', 1, 0]]) +
    rad('cristal', [['#f2feff', 0], ['#8ff3ff', 0.5], ['#3fa9d6', 1]], 0.38, 0.32, 0.7) +
    '<clipPath id="atg-fenetre"><path d="M375,300 V150 A75,75 0 0 1 525,150 V300 Z"/></clipPath>' +
    '<clipPath id="atg-ov"><ellipse cx="73" cy="58" rx="54" ry="39"/></clipPath><clipPath id="atg-rd"><circle cx="73" cy="58" r="43"/></clipPath>' +
    defsThemes() +
    '</defs></svg>';
}


/* ---------- La pièce, dessinée avec la perspective de 07-perspective.js ----------
   Le mur du fond (vu de face) va de x 70 à 1130, du haut (murHaut) au plancher (y 520) ; les murs de côté sont les plans X = 70 et X = 1130,
   le plancher le plan Y = 0. Les motifs des murs de côté et du plancher sont posés sur leur plan (pierres, rayures, planches… vont vers le
   point de fuite). Le haut des murs se voit (on regarde la pièce d'au-dessus, comme une maison de poupée).
   Pour remplir un écran très large, le mur du fond s'agrandit : V.ext = {l, r, t, b}. */
var LARGEUR = 1200;                 /* largeur du cœur de la pièce */
var COTE = 160;                     /* le monde déborde du cœur d'au moins ça de chaque côté (on voit tout le plancher) */
var FEN_DX = 0, CHEM_DX = 200;       /* la fenêtre et la cheminée sont dessinées à leur place d'origine puis décalées */
var FEN_CH = 300;                   /* la fenêtre de la chambre (plus à droite) */
/* L'arche entre les deux pièces : dans le mur de droite de l'atelier, dans le mur de gauche de la chambre (profondeur z0..z1, hauteur des côtés h) */
var ARCHE = {z0:50, z1:370, h:170};
/* la place de l'arche à l'écran (pour ne pas y installer de meuble à la première place) */
function zoneArche(V, s){
  var xm = s ? murG(V) : murD(V), a = proj(xm, ARCHE.h + (ARCHE.z1 - ARCHE.z0) / 2, ARCHE.z0), b = proj(xm, 0, ARCHE.z1);
  return s ? [Math.min(a[0], b[0]) - 10, a[1] - 10, Math.max(a[0], b[0]) + 60, b[1] + 10] : [Math.min(a[0], b[0]) - 60, a[1] - 10, Math.max(a[0], b[0]) + 10, b[1] + 10];
}
var PORTE = {x:650, y:520, w:136, h:206};
function f1(x){ return (Math.round(x * 10) / 10).toString(); }
function tF(y){ return (y - VPY) / (SOL_Y - VPY); }
function xF(xa, y){ return VPX + (xa - VPX) * tF(y); }
function pp(q){ return f1(q[0]) + ',' + f1(q[1]); }
function quad(a, b, c2, d){ return 'M' + pp(a) + ' L' + pp(b) + ' L' + pp(c2) + ' L' + pp(d) + ' Z '; }

/* Les couleurs d'un mur ou du plancher dans un thème (naturel : null, on garde les dégradés qui changent avec le moment) */
function coulMur(ti){ if(!ti) return null; var c = THEMES[ti].c; return [melange(c, '#3a2c5a', 0.2), melange(c, '#3a2c5a', 0.34), melange(c, '#3a2c5a', 0.48)]; }
function coulSol(ti){ if(!ti) return null; var c = THEMES[ti].c; return [melange(c, '#5c341d', 0.3), melange(c, '#5c341d', 0.44), melange(c, '#5c341d', 0.58)]; }
function degFond(id, cs, vert){ return '<linearGradient id="' + id + '" x1="0" y1="0" x2="' + (vert ? 0 : 1) + '" y2="' + (vert ? 1 : 0) + '"><stop offset="0" stop-color="' + cs[0] + '"/><stop offset="0.6" stop-color="' + cs[1] + '"/><stop offset="1" stop-color="' + cs[2] + '"/></linearGradient>'; }

/* Le motif d'un mur, dans les coordonnées du mur : u le long du mur (X pour le fond, Z pour un côté), v la hauteur (Y).
   W(u, v) → point de l'écran. Pour le mur du fond, W est l'identité (vu de face) ; pour un mur de côté, la projection. */
function motifPlan(forme, ti, W, u0, u1, H, sens){
  var cl = ti ? clair(THEMES[ti].c, 0.55) : '#ffffff', op = ti ? 0.22 : 0.06, fonce = 'rgba(10,6,20,.3)', s = '', d = '', i, u, v;
  function rect(ua, va, ub, vb){ return quad(W(ua, va), W(ub, va), W(ub, vb), W(ua, vb)); }
  function forme5(cu, cv, r, k){   /* une petite étoile (k = 0) ou une fleur (k = 1) posée sur le mur */
    var t = '';
    if(!k){ for(var j = 0; j < 8; j++){ var a = j / 8 * Math.PI * 2, rr = j % 2 ? r * 0.3 : r; t += (j ? ' L' : 'M') + pp(W(cu + Math.cos(a) * rr * sens, cv + Math.sin(a) * rr)); } return t + ' Z '; }
    for(var p = 0; p < 5; p++){ var b = p / 5 * Math.PI * 2, pu = cu + Math.cos(b) * 7 * sens, pv = cv + Math.sin(b) * 7; t += 'M' + pp(W(pu - 5 * sens, pv)) + ' L' + pp(W(pu, pv + 5)) + ' L' + pp(W(pu + 5 * sens, pv)) + ' L' + pp(W(pu, pv - 5)) + ' Z '; }
    return t;
  }
  if(forme === 0){          /* des pierres, en quinconce */
    for(var r = 0; r * 54 < H; r++){
      var v0 = r * 54 + 3, v1 = Math.min(H, r * 54 + 51), dec = (r % 2) * 50;
      for(u = u0 - ((u0 - dec) % 100 + 100) % 100 - 100 + dec; u < u1; u += 100) if(v1 - v0 > 12) d += rect(Math.max(u0, u + 4), v0, Math.min(u1, u + 96), v1);
    }
    return '<path d="' + d + '" fill="' + cl + '" fill-opacity="' + (ti ? 0.1 : 0.035) + '" stroke="rgba(10,6,20,.32)" stroke-width="3" stroke-linejoin="round"/>';
  }
  if(forme === 1){          /* des rayures */
    for(u = Math.floor(u0 / 64) * 64; u < u1; u += 64) d += rect(u, 0, u + 30, H);
    var d2 = '';
    for(u = Math.floor(u0 / 64) * 64 + 40; u < u1; u += 64) d2 += rect(u, 0, u + 4, H);
    return '<path d="' + d + '" fill="' + cl + '" fill-opacity="' + op + '"/><path d="' + d2 + '" fill="' + cl + '" fill-opacity="' + (op * 0.8) + '"/>';
  }
  if(forme === 2 || forme === 4){   /* des étoiles, ou des fleurs */
    for(v = 40; v < H; v += 90) for(u = Math.floor(u0 / 90) * 90 + ((v / 90 | 0) % 2) * 45; u < u1; u += 90) d += forme5(u, v, forme === 2 ? 11 : 0, forme === 2 ? 0 : 1);
    return '<path d="' + d + '" fill="' + cl + '" fill-opacity="' + (op * (forme === 2 ? 1.4 : 1.3)) + '"/>';
  }
  /* boiseries : un lambris de bois en bas, une baguette, des panneaux */
  var bas = rect(u0, 0, u1, 196), pan = '';
  for(u = Math.floor(u0 / 120) * 120 + 14; u < u1; u += 120) pan += rect(u, 22, u + 92, 172);
  return '<path d="' + bas + '" fill="' + (ti ? sombre(THEMES[ti].c, 0.35) : '#3a2418') + '" fill-opacity="' + (ti ? 0.55 : 0.7) + '"/>' +
    '<path d="' + pan + '" fill="none" stroke="' + cl + '" stroke-opacity="' + (op * 1.8) + '" stroke-width="4" stroke-linejoin="round"/>' +
    '<path d="' + rect(u0, 196, u1, 210) + '" fill="' + (ti ? sombre(THEMES[ti].c, 0.2) : '#6b4a2a') + '" stroke="' + fonce + '" stroke-width="3"/>';
}
/* Le plancher (plan Y = 0) : planches, damier, chevrons, dalles ou moquette, de X xL à xR, de Z 0 à zMax */
function motifSol(forme, ti, xL, xR, zMax){
  var cl = ti ? clair(THEMES[ti].c, 0.35) : '#a87348', trait = 'rgba(40,20,10,.42)', d = '', i, j, X, Z;
  function S(x, z){ return proj(x, 0, z); }
  var pas = 71.7;
  if(forme === 1){        /* damier */
    for(X = xL; X < xR; X += 70) for(Z = 0, j = 0; Z < zMax; Z += 70, j++) if(((X - xL) / 70 + j) % 2 === 0) d += quad(S(X, Z), S(Math.min(xR, X + 70), Z), S(Math.min(xR, X + 70), Z + 70), S(X, Z + 70));
    return '<path d="' + d + '" fill="' + cl + '" fill-opacity="' + (ti ? 0.55 : 0.4) + '"/>';
  }
  if(forme === 3){        /* dalles de pierre, en quinconce */
    for(Z = 0, j = 0; Z < zMax; Z += 84, j++) for(X = xL - (j % 2) * 42; X < xR; X += 84) d += quad(S(Math.max(xL, X) + 3, Z + 3), S(Math.min(xR, X + 84) - 3, Z + 3), S(Math.min(xR, X + 84) - 3, Z + 81), S(Math.max(xL, X) + 3, Z + 81));
    return '<path d="' + d + '" fill="' + cl + '" fill-opacity="' + (ti ? 0.38 : 0.28) + '" stroke="' + trait + '" stroke-width="3" stroke-linejoin="round"/>';
  }
  if(forme === 4){        /* moquette à petits points */
    for(Z = 30; Z < zMax; Z += 62) for(X = xL + 36; X < xR; X += 72){
      var c0 = S(X, Z), rx = 7 * sZ(Z), ry = rx * 0.32;
      d += 'M' + f1(c0[0] - rx) + ',' + f1(c0[1]) + ' a' + f1(rx) + ',' + f1(ry) + ' 0 1 0 ' + f1(2 * rx) + ',0 a' + f1(rx) + ',' + f1(ry) + ' 0 1 0 ' + f1(-2 * rx) + ',0 Z ';
    }
    return '<path d="' + d + '" fill="' + cl + '" fill-opacity="' + (ti ? 0.6 : 0.45) + '"/>';
  }
  /* planches (les chevrons : des joints en biais) */
  var l = '', jn = '';
  for(X = xL + pas; X < xR - 1; X += pas) l += 'M' + pp(S(X, 0)) + ' L' + pp(S(X, zMax)) + ' ';
  for(X = xL, i = 0; X < xR - 1; X += pas, i++){
    var xb = Math.min(xR, X + pas);
    if(forme === 0){ for(Z = 40 + (i * 137) % 220; Z < zMax; Z += 240) jn += 'M' + pp(S(X, Z)) + ' L' + pp(S(xb, Z)) + ' '; }
    else { for(Z = 0, j = 0; Z < zMax; Z += 60, j++){ var hautJ = (i + j) % 2 === 0; jn += 'M' + pp(S(X, hautJ ? Z : Z + 60)) + ' L' + pp(S(xb, hautJ ? Z + 60 : Z)) + ' '; } }
  }
  return T(l, trait, 3) + T(jn, trait, 3);
}
function svgFond(V){
  var vb = V.vb, xL = murG(V), xR = murD(V), haut = murHaut(V), H = SOL_Y - haut, bas = vb.y0 + vb.h, gauche = vb.x0, droite = vb.x0 + vb.w;
  /* jusqu'où on voit les murs de côté et le plancher (vers nous) */
  var sMax = Math.max((VPX - gauche) / (VPX - xL), (droite - VPX) / (xR - VPX), (bas - VPY) / (SOL_Y - VPY)) * 1.05, zMax = zS(sMax);
  var zSol = zS((bas - VPY) / (SOL_Y - VPY) * 1.02);
  /* (la chambre a ses murs et son plancher à elle : fond2, murG2, murD2, sol2) */
  var sx = V.salle ? '2' : '';
  var tF0 = decoTheme(V, 'fond' + sx), fF = decoForme(V, 'fond' + sx), tG = decoTheme(V, 'murG' + sx), fG = decoForme(V, 'murG' + sx), tD = decoTheme(V, 'murD' + sx), fD = decoForme(V, 'murD' + sx), tS = decoTheme(V, 'sol' + sx), fS = decoForme(V, 'sol' + sx);
  var defs = '', s = '';
  if(tF0) defs += degFond('atf-fond', coulMur(tF0), 1);
  if(tG) defs += degFond('atf-murG', coulMur(tG).map(function(c){ return sombre(c, 0.25); }), 0);
  if(tD) defs += degFond('atf-murD', coulMur(tD).map(function(c){ return sombre(c, 0.25); }).reverse(), 0);
  if(tS) defs += degFond('atf-sol', coulSol(tS), 1);
  function Wg(u, v){ return proj(xL, v, u); }
  function Wd(u, v){ return proj(xR, v, u); }
  function Wf(u, v){ return [u, SOL_Y - v]; }
  var pG = quad(Wg(0, 0), Wg(0, H), Wg(zMax, H), Wg(zMax, 0)), pD = quad(Wd(0, 0), Wd(0, H), Wd(zMax, H), Wd(zMax, 0));
  var pS = quad(proj(xL, 0, 0), proj(xR, 0, 0), proj(xR, 0, zSol), proj(xL, 0, zSol));
  defs += '<clipPath id="atf-cl-g"><path d="' + pG + '"/></clipPath><clipPath id="atf-cl-d"><path d="' + pD + '"/></clipPath><clipPath id="atf-cl-s"><path d="' + pS + '"/></clipPath><clipPath id="atf-cl-f"><rect x="' + f1(xL) + '" y="' + f1(haut) + '" width="' + f1(xR - xL) + '" height="' + f1(H) + '"/></clipPath>';
  /* au-dessus des murs : la nuit (on regarde la pièce d'en haut) */
  s += '<rect x="' + f1(gauche) + '" y="' + f1(vb.y0) + '" width="' + f1(vb.w) + '" height="' + f1(vb.h) + '" fill="#141028"/>';
  /* le mur du fond (on le touche : un autre papier peint, une autre couleur) */
  s += '<g data-surf="fond' + sx + '"><rect x="' + f1(xL) + '" y="' + f1(haut) + '" width="' + f1(xR - xL) + '" height="' + f1(H) + '" fill="' + (tF0 ? 'url(#atf-fond)' : G('murF')) + '"/>' +
    '<g clip-path="url(#atf-cl-f)">' + motifPlan(fF, tF0, Wf, xL, xR, H, 1) + '</g></g>';
  /* les murs de côté : leur motif posé sur leur plan ; un voile sombre (ils sont dans l'ombre) */
  s += '<g data-surf="murG' + sx + '"><path d="' + pG + '" fill="' + (tG ? 'url(#atf-murG)' : G('murC')) + '"/><g clip-path="url(#atf-cl-g)">' + motifPlan(fG, tG, Wg, 0, zMax, H, -1) + '</g><path d="' + pG + '" fill="rgba(10,6,20,.16)"/></g>';
  s += '<g data-surf="murD' + sx + '"><path d="' + pD + '" fill="' + (tD ? 'url(#atf-murD)' : G('murC2')) + '"/><g clip-path="url(#atf-cl-d)">' + motifPlan(fD, tD, Wd, 0, zMax, H, 1) + '</g><path d="' + pD + '" fill="rgba(10,6,20,.16)"/></g>';
  /* le plancher (on le touche : d'autres planches, un damier, des dalles…) */
  s += '<g data-surf="sol' + sx + '"><path d="' + pS + '" fill="' + (tS ? 'url(#atf-sol)' : G('sol')) + '"/><g clip-path="url(#atf-cl-s)">' + motifSol(fS, tS, xL, xR, zSol) + '</g>' +
    '<path d="' + quad(proj(xL, 0, 0), proj(xR, 0, 0), proj(xR, 0, 150), proj(xL, 0, 150)) + '" fill="' + G('solOmbre') + '"/></g>';
  /* les plinthes, les coins */
  s += P(quad(proj(xL, 0, 0), proj(xR, 0, 0), proj(xR, 14, 0), proj(xL, 14, 0)), G('boisS'), ' stroke-width="4"') +
    P(quad(Wg(0, 0), Wg(zMax, 0), Wg(zMax, 14), Wg(0, 14)), G('boisS'), ' stroke-width="4"') + P(quad(Wd(0, 0), Wd(zMax, 0), Wd(zMax, 14), Wd(0, 14)), G('boisS'), ' stroke-width="4"');
  s += T('M' + pp(Wg(0, H)) + ' L' + pp(Wg(0, 0)) + ' L' + pp(Wg(zMax, 0)) + ' M' + pp(Wd(0, H)) + ' L' + pp(Wd(0, 0)) + ' L' + pp(Wd(zMax, 0)), 'rgba(10,6,20,.5)', 4);
  /* le haut des murs (leur épaisseur, vue d'au-dessus) et la poutre du mur du fond */
  var e = 26;
  s += P(quad(proj(xL - e, H, -e), proj(xR + e, H, -e), proj(xR, H, 0), proj(xL, H, 0)), G('boisH'), ' stroke-width="4"') +
    P(quad(proj(xL - e, H, -e), proj(xL, H, 0), proj(xL, H, zMax), proj(xL - e, H, zMax)), G('boisH'), ' stroke-width="4"') +
    P(quad(proj(xR, H, 0), proj(xR + e, H, -e), proj(xR + e, H, zMax), proj(xR, H, zMax)), G('boisH'), ' stroke-width="4"');
  s += '<rect x="' + f1(xL) + '" y="' + f1(haut) + '" width="' + f1(xR - xL) + '" height="30" fill="' + G('boisS') + '" stroke="' + K + '" stroke-width="5"/>';
  for(var i = Math.ceil((xL + 34 - 104) / 160); 104 + i * 160 < xR - 40; i++) s += R(104 + i * 160, f1(haut + 26), 36, 20, 3, G('boisS'), ' stroke-width="4"');
  s += P(quad(Wg(0, H), Wg(zMax, H), Wg(zMax, H - 30), Wg(0, H - 30)), G('boisS')) + P(quad(Wd(0, H), Wd(zMax, H), Wd(zMax, H - 30), Wd(0, H - 30)), G('boisS'));
  /* l'atelier : la porte (ce qu'on cueille est posé devant), la fenêtre, la cheminée, l'arche vers la chambre ;
     la chambre : sa fenêtre, l'arche vers l'atelier */
  if(V.salle) s += svgFenetre(FEN_CH) + svgArche(V, 'g');
  else s += svgPorte() + svgFenetre(FEN_DX) + svgCheminee(V) + svgArche(V, 'd');
  return '<svg class="at-fond" viewBox="' + [f1(vb.x0), f1(vb.y0), f1(vb.w), f1(vb.h)].join(' ') + '" preserveAspectRatio="none" aria-hidden="true"><defs>' + defs + '</defs>' + s + '</svg>';
}
/* L'arche dans un mur de côté (elle mène à l'autre pièce) : posée sur le plan du mur, avec l'épaisseur du mur et une lumière chaude derrière.
   On la touche (ou le bouton 🛏️ / ⚗️ en bas à gauche) pour passer dans l'autre pièce ; on y lâche un objet pour l'y envoyer. */
function svgArche(V, cote){
  var xm = cote === 'g' ? murG(V) : murD(V), e = cote === 'g' ? -30 : 30, z0 = ARCHE.z0, z1 = ARCHE.z1, h = ARCHE.h, zc = (z0 + z1) / 2, r = (z1 - z0) / 2;
  function contour(x, m){
    var l = [proj(x, 0, z0 + m)];
    for(var i = 0; i <= 20; i++){ var a = Math.PI - i / 20 * Math.PI; l.push(proj(x, h + Math.sin(a) * (r - m), zc + Math.cos(a) * (r - m))); }
    l.push(proj(x, 0, z1 - m));
    return 'M' + l.map(pp).join(' L') + ' Z';
  }
  var id = 'atf-arche-' + cote, cx = proj(xm + e, h * 0.7, zc);
  var s = '<defs><radialGradient id="' + id + '" cx="' + f1(cx[0]) + '" cy="' + f1(cx[1]) + '" r="160" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#ffcf8a" stop-opacity=".55"/><stop offset="1" stop-color="#2a1d3a" stop-opacity="0"/></radialGradient></defs>';
  s += '<g class="at-arche" data-at="salle">' +
    P(contour(xm, 0), G('pierre'), ' stroke-width="6"') + '<path d="' + contour(xm + e, 14) + '" fill="#1d1430"/>' + '<path d="' + contour(xm + e, 14) + '" fill="url(#' + id + ')"/>' +
    '<path d="' + contour(xm + e, 14) + '" fill="none" stroke="' + K + '" stroke-width="4"/>';
  /* une plaque au-dessus : 🛏️ (vers la chambre) ou ⚗️ (vers l'atelier), posée sur le mur */
  var c = ctx3d(repere([xm, 0, zc], cote === 'g' ? [[0, 0, -1], [0, -1, 0], [-1, 0, 0]] : [[0, 0, 1], [0, -1, 0], [1, 0, 0]], 0, 0), true);
  s += c.sur(Cir(0, -(h + r + 44), 30, G('boisH'), ' stroke-width="5"') + emo(0, -(h + r + 42), 34, cote === 'g' ? '⚗️' : '🛏️'), -2, 0, -(h + r + 44)) + '</g>';
  return s;
}
/* La fenêtre (le ciel change avec le moment : soleil, lune, étoiles) : un rebord de pierre qui avance un peu */
function svgFenetre(dx){
  var cr = ctx3d(repere([450 + dx, SOL_Y - 314, 0], AXES_MONDE, 0, 0), true), rebord = cr.boite(-92, -20, 92, 0, -26, 0, {face:G('boisH'), dessus:G('boisH'), cote:G('boisS')});
  return '<g transform="translate(' + dx + ',0)">' +
    '<g clip-path="url(#atg-fenetre)"><rect x="370" y="70" width="160" height="240" fill="' + G('ciel') + '"/>' +
    '<g class="at-ciel-nuit"><circle cx="478" cy="146" r="48" fill="' + G('haloL') + '"/><circle cx="478" cy="146" r="22" fill="#fff4cf"/><circle cx="486" cy="140" r="5" fill="#f0e2b0"/>' +
      '<circle cx="404" cy="118" r="2" fill="#fff"/><circle cx="420" cy="170" r="1.6" fill="#fff"/><circle cx="508" cy="214" r="1.8" fill="#fff"/><circle cx="398" cy="226" r="1.4" fill="#fff"/></g>' +
    '<g class="at-ciel-soleil"><circle class="at-soleil-halo" cx="450" cy="200" r="70" fill="' + G('soleil') + '"/><circle class="at-soleil" cx="450" cy="200" r="22" fill="#fff3c4"/></g>' +
    '<g class="at-ciel-nuages"><path d="M384,150 c4,-12 22,-12 26,-2 c8,-6 20,0 18,8 H384 Z M462,112 c4,-10 18,-10 22,-2 c6,-4 16,0 14,7 H462 Z" fill="#fff" opacity=".8"/></g>' +
    '<path class="at-collines" d="M370,300 L370,262 C392,250 404,226 420,240 C434,226 452,232 462,246 C476,236 496,232 512,250 L530,256 L530,300 Z" fill="#141a3a"/>' +
    '<path d="M370,282 C400,270 430,288 460,278 C490,268 510,282 530,276 L530,300 L370,300 Z" fill="rgba(200,210,255,.22)"/></g>' +
    '<path d="M375,300 V150 A75,75 0 0 1 525,150 V300 Z" fill="none" stroke="' + K + '" stroke-width="16"/>' +
    '<path d="M375,300 V150 A75,75 0 0 1 525,150 V300 Z" fill="none" stroke="#8a5a3a" stroke-width="8"/>' +
    T('M450,77 V300 M377,196 H523', K, 10) + T('M450,77 V300 M377,196 H523', '#8a5a3a', 5) + '</g>' + rebord;
}
/* La cheminée : le manteau, les piliers et la hotte avancent dans la pièce (leurs côtés et leur dessus se voient) */
var CHEMINEE = {x:950, y:284, x0:-150, x1:150, s:0.86, Y:236, Z:31};
var AXES_MONDE = [[1, 0, 0], [0, -1, 0], [0, 0, -1]];   /* pour le fond : x à droite, y = - la hauteur, z vers le mur (unités du monde) */
function svgCheminee(V){
  var X = 750 + CHEM_DX, c = ctx3d(repere([X, 0, 0], AXES_MONDE, 0, 0), true), s = '', H = SOL_Y - murHaut(V);
  /* (dans ce repère : x vers la droite, y = - la hauteur, z < 0 : vers nous) */
  /* la hotte, jusqu'en haut du mur ; elle s'évase au-dessus du manteau */
  s += c.boite(-120, -H, 120, -284, -46, 0, {face:G('pierre'), cote:G('pierre')}) +
    c.poly([[-120, -284, -46], [-156, -236, -70], [-156, -236, 0], [-120, -284, 0]], G('pierre')) +
    c.poly([[-120, -284, -46], [120, -284, -46], [156, -236, -70], [-156, -236, -70]], G('pierre'));
  var joints = [];
  [470, 414, 358, 302].forEach(function(Y, i){ if(Y < H - 10) joints.push(c.ligne([[-116, -Y, -46], [116, -Y, -46]], 'rgba(36,24,46,.35)', 3)); });
  [[-50, 470, 414], [50, 414, 358], [-30, 358, 302], [20, 470, 414]].forEach(function(q){ if(q[1] < H - 10) joints.push(c.ligne([[q[0], -q[1], -46], [q[0], -q[2], -46]], 'rgba(36,24,46,.35)', 3)); });
  s += joints.join('');
  /* les deux piliers et le fond noir */
  s += P('M' + (X - 98) + ',522 L' + (X - 98) + ',382 C' + (X - 98) + ',330 ' + (X + 98) + ',330 ' + (X + 98) + ',382 L' + (X + 98) + ',522 Z', '#1b0e0a') +
    '<ellipse cx="' + X + '" cy="508" rx="80" ry="40" fill="' + G('feuFoyer') + '" opacity=".55"/>' +
    c.boite(-138, -210, -98, 0, -40, 0, {face:G('pierre'), dessus:G('pierre'), cote:G('pierre')}) + c.boite(98, -210, 138, 0, -40, 0, {face:G('pierre'), dessus:G('pierre'), cote:G('pierre')});
  /* le manteau (on peut y poser de petites choses) et sa bougie */
  s += c.boite(-166, -236, 166, -206, -62, 0, {face:G('bois'), dessus:G('boisH'), cote:G('boisS')}) +
    c.boite(-144, -270, -128, -236, -40, -28, {face:'#f6ecd2', dessus:'#fffaf0', cote:'#e8dcc0'}) +
    '<path d="' + 'M' + pp(c.Q(-136, -270, -34)) + ' c-5,-6 -3,-12 0,-18 c3,6 5,12 0,18 Z" fill="#ffd36a" stroke="#e8693c" stroke-width="2"/>';
  return s;
}
/* Les lumières qui bougent : en HTML pour que le compositeur les anime sans repeindre le fond */
function fondAnime(V){
  function boite(x, y, w, h){ return 'left:' + pX(V, x) + ';top:' + pY(V, y) + ';width:' + pW(V, w) + ';height:' + pH(V, h); }
  var fx = V.salle ? FEN_CH : FEN_DX, s = '<div class="at-fond-anim" aria-hidden="true">' +
    (V.salle ? '' : '<i class="at-a-mur" style="' + boite(410 + CHEM_DX, 170, 680, 540) + '"></i>') +
    '<i class="at-a-rayon" style="' + boite(352 + fx, 312, 300, 478) + '"></i>' +
    (V.salle ? '' : '<i class="at-a-foyer" style="' + boite(654 + CHEM_DX, 433, 192, 132) + '"></i>') +
    '<span class="at-a-fen" style="' + boite(383 + fx, 83, 134, 213) + '"><i></i></span>';
  for(var i = 0; i < 6; i++) s += '<b class="at-a-pouss" style="left:' + pX(V, 414 + fx + (i * 37) % 170) + ';top:' + pY(V, 387 + (i * 59) % 280) + ';animation-delay:-' + (i * 1.5).toFixed(1) + 's"></b>';
  return s + '</div>';
}

/* ---------- Petits dessins partagés ---------- */
function fiolePetite(x, base, c){
  var plein = !!c;
  return (plein ? '<circle class="at-halo" cx="' + x + '" cy="' + (base - 12) + '" r="20" fill="' + G('haloC') + '"/>' : '') +
    P('M' + (x - 5) + ',' + (base - 34) + ' L' + (x + 5) + ',' + (base - 34) + ' L' + (x + 5) + ',' + (base - 24) + ' C' + (x + 13) + ',' + (base - 20) + ' ' + (x + 13) + ',' + (base - 2) + ' ' + x + ',' + base +
      ' C' + (x - 13) + ',' + (base - 2) + ' ' + (x - 13) + ',' + (base - 20) + ' ' + (x - 5) + ',' + (base - 24) + ' Z', G('verre'), ' stroke-width="3.5"') +
    (plein ? '<path d="M' + (x - 10) + ',' + (base - 13) + ' C' + (x - 9) + ',' + (base - 2) + ' ' + (x + 9) + ',' + (base - 2) + ' ' + (x + 10) + ',' + (base - 13) + ' Z" fill="' + c + '"/>' : '') +
    R(x - 4, base - 40, 8, 7, 2, '#c58a4a', ' stroke-width="2.5"');
}
function flammesSVG(cx, by, l){
  return '<g class="at-flammes">' +
    '<path class="at-fl f1" d="M' + (cx - 46) + ',' + by + ' C' + (cx - 58) + ',' + (by - 22) + ' ' + (cx - 38) + ',' + (by - 34) + ' ' + (cx - 40) + ',' + (by - 52) + ' C' + (cx - 26) + ',' + (by - 38) + ' ' + (cx - 20) + ',' + (by - 24) + ' ' + (cx - 22) + ',' + by + ' Z"/>' +
    '<path class="at-fl f2" d="M' + (cx - 16) + ',' + by + ' C' + (cx - 28) + ',' + (by - 30) + ' ' + (cx - 4) + ',' + (by - 44) + ' ' + (cx - 6) + ',' + (by - 68) + ' C' + (cx + 12) + ',' + (by - 44) + ' ' + (cx + 16) + ',' + (by - 26) + ' ' + (cx + 10) + ',' + by + ' Z"/>' +
    '<path class="at-fl f3" d="M' + (cx + 22) + ',' + by + ' C' + (cx + 14) + ',' + (by - 22) + ' ' + (cx + 34) + ',' + (by - 32) + ' ' + (cx + 30) + ',' + (by - 50) + ' C' + (cx + 46) + ',' + (by - 34) + ' ' + (cx + 52) + ',' + (by - 18) + ' ' + (cx + 42) + ',' + by + ' Z"/>' +
    '</g>' + (l ? R(cx - l, by - 4, l * 2, 12, 6, G('boisS'), ' transform="rotate(-6 ' + cx + ' ' + by + ')"') + R(cx - l, by - 4, l * 2, 12, 6, G('bois'), ' transform="rotate(7 ' + cx + ' ' + by + ')"') : '');
}

/* ==========================================================
   Ce qui est fixe dans la pièce : la porte ; devant elle, la cueillette et les potions prêtes
   (le carton de rangement est une petite icône 📦 fixe, en bas à droite de l'écran)
   ========================================================== */
function svgPorte(){
  var x0 = PORTE.x - PORTE.w / 2, x1 = PORTE.x + PORTE.w / 2, y0 = PORTE.y - PORTE.h, r = PORTE.w / 2, s = '';
  s += P('M' + (x0 - 16) + ',520 V' + (y0 + r) + ' A' + (r + 16) + ',' + (r + 16) + ' 0 0 1 ' + (x1 + 16) + ',' + (y0 + r) + ' V520 Z', G('pierre'));
  var d = 'M' + x0 + ',520 V' + (y0 + r) + ' A' + r + ',' + r + ' 0 0 1 ' + x1 + ',' + (y0 + r) + ' V520 Z';
  s += P(d, G('boisC'));
  var pl = '';
  for(var i = 1; i < 4; i++){ var x = x0 + i * PORTE.w / 4; pl += 'M' + f1(x) + ',' + f1(y0 + r - Math.sqrt(Math.max(0, r * r - Math.pow(x - PORTE.x, 2)))) + ' V518 '; }
  s += T(pl, '#7a4524', 3);
  s += T('M' + (x0 + 4) + ',' + (y0 + 104) + ' H' + (x1 - 4) + ' M' + (x0 + 4) + ',' + (y0 + 172) + ' H' + (x1 - 4), '#3a2a4a', 9) + T('M' + (x0 + 4) + ',' + (y0 + 104) + ' H' + (x1 - 4) + ' M' + (x0 + 4) + ',' + (y0 + 172) + ' H' + (x1 - 4), '#6a5f92', 4);
  s += Cir(PORTE.x, y0 + 52, 20, G('ciel')) + T('M' + PORTE.x + ',' + (y0 + 33) + ' V' + (y0 + 71) + ' M' + (PORTE.x - 19) + ',' + (y0 + 52) + ' H' + (PORTE.x + 19), K, 3);
  s += Cir(x1 - 20, y0 + 140, 7, G('or')) + reflet('M' + (x0 + 12) + ',' + (y0 + 76) + ' V510', 3);
  /* la chatière (étape 4) : un petit volet en bas de la porte, qui bascule quand le chat passe */
  var cx0 = PORTE.x - 30, cx1 = PORTE.x + 30, cy0 = 466;
  s += P('M' + cx0 + ',519 V' + (cy0 + 12) + ' Q' + cx0 + ',' + cy0 + ' ' + (cx0 + 12) + ',' + cy0 + ' H' + (cx1 - 12) + ' Q' + cx1 + ',' + cy0 + ' ' + cx1 + ',' + (cy0 + 12) + ' V519 Z', '#2a1c34', ' stroke-width="4"');
  s += '<g class="at-chatiere-volet">' + P('M' + (cx0 + 5) + ',' + (cy0 + 6) + ' H' + (cx1 - 5) + ' V515 H' + (cx0 + 5) + ' Z', G('boisH'), ' stroke-width="3"') +
    T('M' + (cx0 + 12) + ',' + (cy0 + 20) + ' H' + (cx1 - 12) + ' M' + (cx0 + 12) + ',' + (cy0 + 34) + ' H' + (cx1 - 12), '#b07c46', 2.5) + emo(PORTE.x, cy0 + 27, 14, '🐾') + '</g>';
  s += T('M' + (cx0 - 2) + ',' + (cy0 + 5) + ' H' + (cx1 + 2), K, 5) + T('M' + (cx0 - 2) + ',' + (cy0 + 5) + ' H' + (cx1 + 2), '#6a5f92', 2.5);
  return s;
}

/* Les potions prêtes : des flacons posés par terre devant la porte, devant la cueillette (on les touche : à quoi elle sert, donner, vendre) */
/* Les potions finies : des flacons debout sur le plancher devant la porte, juste devant la cueillette (une rangée) */
var FLACONS = {dy:40, dx:80, w:80, h:104, p:64};
function posFlacon(i, n, rangs){ return {x:TAS.x + (i - (n - 1) / 2) * FLACONS.dx, y:TAS.y + FLACONS.dy + (rangs || 0) * TAS.dy}; }
function dessinFlacon(k, n, R){
  var p = (DD().POTIONS || {})[k] || {}, col = p.c || '#8ff3ff', x = ajouterOutils3d(ctx3d(R, false)), cz = 32, l = [];
  x.p = FLACONS.p; x.cat = {w:FLACONS.w, h:FLACONS.h};
  for(var i = 0; i < 24; i++){ var a = i / 24 * Math.PI * 2; l.push(x.Q(40 + Math.cos(a) * 36, FLACONS.h, cz + Math.sin(a) * 30)); }
  var s = '<path d="' + lisse(l, true) + '" fill="rgba(12,6,20,.32)"/>' +
    x.sur('<circle class="at-halo" cx="40" cy="60" r="46" fill="' + G('haloC') + '"/>', cz) +
    x.tour(40, cz, [[102, 22], [90, 30], [72, 30], [56, 24], [44, 11]], G('verre'), null, ' stroke-width="4"') +
    x.tour(40, cz, [[99, 19], [88, 26.5], [68, 27]], col, clair(col, 0.4), ' stroke-width="0" opacity=".92"') +
    x.cylindre(40, cz, 8, 14, 46, G('verre'), null, ' stroke-width="3.5"') + x.cylindre(40, cz, 10, 2, 16, '#c58a4a', '#e0a868', ' stroke-width="3"') +
    x.sur(T('M22,58 C18,68 18,80 22,88', '#fff', 4, ' opacity=".55"') + emo(40, 82, 26, p.ic || '🧪'), cz - 29);
  if(n > 1) s += x.sur('<circle cx="68" cy="20" r="15" fill="#24182e" stroke="#fff6d8" stroke-width="3"/><text x="68" y="20" font-size="17" font-weight="800" fill="#fff6d8" text-anchor="middle" dominant-baseline="central">' + n + '</text>', cz);
  [[-6, -6], [86, -6], [-6, 104]].forEach(function(q){ x.Q(q[0], q[1], cz - 30); });
  var b = x.bb.slice();
  return {svg:'<rect x="' + f1(b[0]) + '" y="' + f1(b[1]) + '" width="' + f1(b[2] - b[0]) + '" height="' + f1(b[3] - b[1]) + '" fill="transparent"/>' + s, bb:b};
}
var TAS = {x:650, y:606, w:86, h:86, rang:4, dx:98, dy:78};
function posTas(i, n){
  var r = Math.floor(i / TAS.rang), dans = Math.min(TAS.rang, n - r * TAS.rang), col = i % TAS.rang;
  return {x:TAS.x + (col - (dans - 1) / 2) * TAS.dx + (r % 2) * 12, y:TAS.y + r * TAS.dy};
}
/* Un tas de la cueillette : un panier d'osier (une cruche pour les liquides) posé sur le plancher, et sa grosse étiquette ronde */
function dessinTas(k, n, R){
  var col = coulIngr(k), liq = estLiquide(k), x = ajouterOutils3d(ctx3d(R, false)), cz = 30, l = [];
  x.p = 60; x.cat = {w:TAS.w, h:TAS.h};
  for(var i = 0; i < 24; i++){ var a = i / 24 * Math.PI * 2; l.push(x.Q(43 + Math.cos(a) * 40, TAS.h, cz + Math.sin(a) * 30)); }
  var s = '<path d="' + lisse(l, true) + '" fill="rgba(12,6,20,.3)"/>';
  if(liq) s += x.tour(43, cz, [[54, 16], [62, 26], [74, 30], [86, 22]], G('terre'), null) + x.cylindre(43, cz, 13, 46, 56, G('terre'), clair(col, 0.2));
  else {
    s += x.cylindre(43, cz, 36, 58, 86, '#c58a4a', null, '', 30) + x.arcAvant(43, cz, 35, 68, '#8a5a2a', 3) + x.arcAvant(43, cz, 33, 78, '#8a5a2a', 3) +
      x.tour(43, cz, [[50, 18], [54, 28], [58, 33]], col, null, ' stroke-width="3.5"') + x.cylindre(43, cz, 37, 56, 62, '#d9a066', null, ' stroke-width="3.5"');
  }
  s += x.sur('<circle cx="43" cy="40" r="30" fill="' + col + '" stroke="' + K + '" stroke-width="4"/><circle cx="43" cy="40" r="24" fill="#fff6e0" stroke="' + K + '" stroke-width="1.5" opacity=".94"/>' +
    emo(43, 42, 34, icIngr(k)) + (liq ? emo(16, 14, 16, '💧') : '') +
    (n > 1 ? '<circle cx="70" cy="62" r="14" fill="#24182e" stroke="#fff6d8" stroke-width="3"/><text x="70" y="62" font-size="16" font-weight="800" fill="#fff6d8" text-anchor="middle" dominant-baseline="central">' + n + '</text>' : ''), cz - 30);
  [[-6, -12], [92, -12], [-6, 80], [92, 80]].forEach(function(q){ x.Q(q[0], q[1], cz - 30); });     /* (l'étiquette compte dans le cadre : on la touche facilement) */
  var b = x.bb.slice();
  return {svg:'<rect x="' + f1(b[0]) + '" y="' + f1(b[1]) + '" width="' + f1(b[2] - b[0]) + '" height="' + f1(b[3] - b[1]) + '" fill="transparent"/>' + s, bb:b};
}
