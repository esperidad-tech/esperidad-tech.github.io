
/* ============ Le labo dessiné ============
   Trois grands blocs bien répartis : la cheminée et son chaudron à gauche, la paillasse et ses outils au milieu
   (l'étagère des bocaux et la lanterne au-dessus), la fenêtre et le coffre à droite. Le sol de dalles est visible partout. */
function wx(X){ return 500 + 160*X; }
function wy(Y){ return 110 + 160*(2.3 - Y); }
var LOUPE = {x:pr(-.9, .9, 3.2)[0], y:pr(0, .9, 3.2)[1]};
var POS_COUPES = [-.53, -.25, .03, .31, .59].map(function(X){ return f1(pr(X, .9, 3.12)[0]); }), Y_COUPE = f1(pr(0, .9, 3.12)[1]);
var BOUGIE = {x:f1(pr(1.18, .9, 3.2)[0]), y:f1(pr(0, .9, 3.2)[1])};

function murPierre(){
  var s = '', Rw = rng(11), cols = ['#4a3d66','#51446e','#453960','#564873','#483b63','#3f3459','#5a4c78'], i;
  s += '<rect x="-1700" y="-1500" width="4400" height="3700" fill="#1d1630"/><rect x="-1700" y="-2" width="4400" height="480" fill="' + G('briques') + '"/><rect x="-2" y="-2" width="1004" height="480" fill="#2a2140"/>';
  for(var row = 0; row < 12; row++){
    var y = -2 + row*40, off = (row % 2) ? -50 : 0;
    for(var x = off; x < 1000; x += 100){
      var w = 96 - Math.floor(Rw()*4), c = cols[Math.floor(Rw()*cols.length)];
      s += '<rect x="' + (x+2) + '" y="' + (y+2) + '" width="' + w + '" height="36" rx="7" fill="' + c + '"/>' +
        '<path d="M' + (x+9) + ',' + (y+6) + ' H' + (x+w-7) + '" stroke="rgba(255,255,255,.09)" stroke-width="2.5" stroke-linecap="round"/>' +
        '<path d="M' + (x+9) + ',' + (y+36) + ' H' + (x+w-7) + '" stroke="rgba(0,0,0,.3)" stroke-width="2.5" stroke-linecap="round"/>';
      for(i=0;i<3;i++) s += '<circle cx="' + f1(x + 10 + Rw()*(w-18)) + '" cy="' + f1(y + 9 + Rw()*24) + '" r="' + f1(1 + Rw()*2) + '" fill="' + (Rw() < .5 ? 'rgba(0,0,0,.16)' : 'rgba(255,255,255,.07)') + '"/>';
      if(Rw() < .13) s += '<path d="M' + f1(x+20 + Rw()*40) + ',' + (y+4) + ' l6,9 l-4,8 l7,11" fill="none" stroke="rgba(0,0,0,.38)" stroke-width="1.6"/>';
      if(Rw() < .08) s += '<path d="M' + (x+w-12) + ',' + (y+2) + ' l14,0 l0,12 Z" fill="rgba(255,255,255,.08)"/>';
      if(row >= 9 && Rw() < .28) s += '<ellipse cx="' + f1(x+15 + Rw()*60) + '" cy="' + (y+35) + '" rx="' + f1(8 + Rw()*12) + '" ry="4.5" fill="#5d8a4a" opacity=".4"/>';
    }
  }
  return s + '<rect x="-1700" y="-2" width="4400" height="480" fill="' + G('murOmbre') + '"/>';
}
function plafond(){
  var s = '<path d="' + d3([[-14,3,4],[14,3,4],[14,3,.42],[-14,3,.42]]) + '" fill="#160f20"/>', X;
  for(X = -9; X <= 9; X += .5) s += '<path d="' + d3([[X,3,4],[X,3,.42]], true) + '" stroke="#0e0816" stroke-width="2" fill="none"/>';
  /* les murs de côté (on ne les voit que sur un écran très large) */
  [-3.7, 3.7].forEach(function(Xm){
    s += '<path d="' + d3([[Xm,0,4],[Xm,3,4],[Xm,3,.42],[Xm,0,.42]]) + '" fill="#231b38"/>';
    for(var Y = .25; Y < 3; Y += .25) s += '<path d="' + d3([[Xm,Y,4],[Xm,Y,.42]], true) + '" stroke="rgba(0,0,0,.35)" stroke-width="2" fill="none"/>';
    s += '<path d="' + d3([[Xm,0,4],[Xm,3,4]], true) + '" stroke="' + K + '" stroke-width="4" fill="none"/>';
  });
  /* la poutre posée sur le mur du fond, et les solives qui viennent vers nous */
  s += R(-1700, -4, 4400, 26, 0, G('boisS')) + grainBois(-60, -1, 1120, 20, 3, 4, '#2a160a', .4);
  [-3.05, -1, 1, 3.05].forEach(function(Xs, n){
    var cote = Xs < 0 ? Xs + .13 : Xs - .13;
    s += '<path d="' + d3([[cote,2.86,4],[cote,3,4],[cote,3,.42],[cote,2.86,.42]]) + '" fill="#2e1a10" stroke="' + K + '" stroke-width="3" stroke-linejoin="round"/>' +
      '<path d="' + d3([[Xs-.13,2.86,4],[Xs+.13,2.86,4],[Xs+.13,2.86,.42],[Xs-.13,2.86,.42]]) + '" fill="#6b4226" stroke="' + K + '" stroke-width="3" stroke-linejoin="round"/>' +
      '<path d="' + d3([[Xs-.05,2.86,4],[Xs-.05,2.86,.42]], true) + '" stroke="#3a2010" stroke-width="1.5" fill="none" opacity=".6"/><path d="' + d3([[Xs+.06,2.86,4],[Xs+.06,2.86,.42]], true) + '" stroke="#8a5a36" stroke-width="1.5" fill="none" opacity=".6"/>';
  });
  return s;
}
function solDalles(){
  var s = '<path d="' + d3([[-16,0,4],[16,0,4],[16,0,.6],[-16,0,.6]]) + '" fill="#17111f"/>', Rf = rng(5), Zs = [4, 3.55, 3.15, 2.8, 2.5, 2.2, 1.9, 1.6, 1.35, 1.1, .9, .72], cols = ['#463b60','#4d416a','#3f3457','#534670','#483d63'];
  for(var r = 0; r < Zs.length - 1; r++){
    var z0 = Zs[r], z1 = Zs[r+1], dec = (r % 2) ? .42 : 0, g = .022, L = r < 5 ? 9.2 : 4.6;
    for(var X = -L + dec; X < L; X += .84){
      s += '<path d="' + d3([[X+g,0,z0-g],[X+.84-g,0,z0-g],[X+.84-g,0,z1+g],[X+g,0,z1+g]]) + '" fill="' + cols[Math.floor(Rf()*cols.length)] + '" stroke="#120d1a" stroke-width="2.5" stroke-linejoin="round"/>' +
        '<path d="' + d3([[X+.09,0,z0-.07],[X+.75,0,z0-.07]], true) + '" stroke="rgba(255,255,255,.08)" stroke-width="2" fill="none" stroke-linecap="round"/>';
      var a = Rf(), b = Rf(), zm = (z0 + z1)/2;
      if(a < .22) s += '<path d="' + d3([[X+.2+b*.3,0,z0-.08],[X+.3+b*.2,0,zm],[X+.22+b*.4,0,z1+.08]], true) + '" stroke="rgba(0,0,0,.4)" stroke-width="1.6" fill="none"/>';
      else if(a < .5){ var q = pr(X + .2 + b*.4, 0, zm); s += '<ellipse cx="' + f1(q[0]) + '" cy="' + f1(q[1]) + '" rx="' + f1(kz(zm)*.07) + '" ry="' + f1(kz(zm)*.035) + '" fill="rgba(0,0,0,.14)"/>'; }
    }
  }
  /* l'ombre au pied du mur */
  return s + '<rect x="-1700" y="474" width="4400" height="26" fill="' + G('piedMur') + '"/>';
}
function cheminee(){
  var s = '', xL = 32.8, xR = 192.8, yA = 246, yS = 478, bx0 = 89.3, byS = 433.5, i, y;
  var arche = 'M' + xL + ',' + yS + ' L' + xL + ',' + yA + ' Q112.8,198 ' + xR + ',' + yA + ' L' + xR + ',' + yS + ' Z';
  /* la hotte, jusqu'au plafond */
  s += P('M12,176 L213.6,176 L165.6,-2 L60,-2 Z', G('pierre'));
  for(i = 0, y = 140; y > 4; y -= 36, i++){ var xl = 12 + (176 - y)*.2697, xr = 213.6 - (176 - y)*.2697; s += T('M' + f1(xl) + ',' + y + ' H' + f1(xr), '#3f3760', 2.5, ' opacity=".8"');
    for(var xj = xl + (i % 2 ? 26 : 52); xj < xr - 10; xj += 52) s += T('M' + f1(xj) + ',' + y + ' v36', '#3f3760', 2.5, ' opacity=".8"'); }
  s += '<ellipse cx="112" cy="168" rx="78" ry="30" fill="rgba(10,6,16,.4)" filter="url(#flou)"/>';
  /* la poêle de cuivre accrochée à la hotte */
  s += Cir(112, 52, 3, '#8a8aa8') + R(108.5, 52, 7, 34, 3, G('fer'), ' stroke-width="2.5"') + Cir(112, 104, 22, G('cuivre')) + '<circle cx="112" cy="104" r="15" fill="none" stroke="#7a3418" stroke-width="2" opacity=".6"/>' + reflet('M98,96 q4,-8 12,-10', 3, .6);
  /* les jambages et l'arc en pierre de taille */
  s += P('M0.8,478 L0.8,204 L224.8,204 L224.8,478 L' + xR + ',478 L' + xR + ',' + yA + ' Q112.8,198 ' + xL + ',' + yA + ' L' + xL + ',478 Z', G('pierre'));
  for(y = 432; y > 250; y -= 46) s += T('M0.8,' + y + ' H32.8 M192.8,' + y + ' H224.8', K, 2.5) + reflet('M4,' + (y + 4) + ' H29 M196,' + (y + 4) + ' H221', 2, .16);
  s += T('M32.8,246 L0.8,246 M192.8,246 L224.8,246 M60,227 L50,204 M90,217 L86,204 M135,217 L139,204 M165,227 L175,204', K, 2.5) + reflet('M6,209 H220', 2.5, .2);
  /* l'intérieur de l'âtre : le fond, la joue, la sole, la suie */
  s += '<clipPath id="clipAtre"><path d="' + arche + '"/></clipPath><g clip-path="url(#clipAtre)"><rect x="30" y="190" width="170" height="292" fill="#150d18"/>' +
    F('M' + bx0 + ',196 L202,196 L202,' + byS + ' L' + bx0 + ',' + byS + ' Z', '#241926') +
    T('M' + bx0 + ',236 H202 M' + bx0 + ',276 H202 M' + bx0 + ',316 H202 M' + bx0 + ',356 H202 M' + bx0 + ',396 H202 M130,196 V236 M170,236 V276 M112,276 V316 M152,316 V356 M124,356 V396 M176,396 V433', '#140c16', 2.5) +
    F('M' + xL + ',186 L' + bx0 + ',196 L' + bx0 + ',' + byS + ' L' + xL + ',' + yS + ' Z', '#1b121d') + T('M' + bx0 + ',196 V' + byS, '#0e0810', 2.5) +
    F('M' + xL + ',' + yS + ' L' + xR + ',' + yS + ' L229.9,' + byS + ' L' + bx0 + ',' + byS + ' Z', '#30222a') +
    '<ellipse class="braise" cx="131" cy="448" rx="104" ry="96" fill="' + G('atre') + '"/></g>' + P(arche, 'none', ' stroke-width="5"');
  /* les bûches et les flammes (derrière le chaudron) */
  s += '<g transform="rotate(-9 131 462)">' + R(84, 454, 96, 15, 7, G('bois'), ' stroke-width="3"') + Ell(180, 461.5, 5, 7, '#e8b47e', ' stroke-width="2.5"') + '</g><g transform="rotate(8 131 462)">' + R(86, 456, 92, 14, 7, G('boisV'), ' stroke-width="3"') + Ell(86, 463, 5, 6.5, '#e8b47e', ' stroke-width="2.5"') + '</g>';
  s += '<g class="flamme"><path d="M106,460 C94,442 104,428 111,416 C118,432 124,442 116,460 Z" fill="' + G('flamme') + '" stroke="#e8693c" stroke-width="2"/></g>' +
    '<g class="flamme f2"><path d="M129,462 C114,438 126,420 134,404 C142,424 150,440 139,462 Z" fill="' + G('flamme') + '" stroke="#e8693c" stroke-width="2"/></g>' +
    '<g class="flamme f3"><path d="M152,460 C142,444 149,432 155,422 C161,435 166,446 160,460 Z" fill="' + G('flamme') + '" stroke="#e8693c" stroke-width="2"/></g>' +
    [[100,470],[124,473],[150,472],[166,468]].map(function(q){ return '<circle class="braise" cx="' + q[0] + '" cy="' + q[1] + '" r="2.6" fill="#ffb050"/>'; }).join('');
  return s;
}
function manteau(){
  /* la poutre du manteau et ce qui est posé dessus (dessinés après le chaudron) */
  var s = P('M-53.8,178.8 L221.4,178.8 L240.8,174 L-15.2,174 Z', '#a5714a', ' stroke-width="3"') + P('M221.4,178.8 L240.8,174 L240.8,202.8 L221.4,209.8 Z', '#5a3418', ' stroke-width="3"') +
    R(-53.8, 178.8, 275.2, 31, 3, G('boisS')) + grainBois(0, 181, 218, 27, 3, 9, '#2a160a', .4) + noeud(150, 195, 7, .5) + reflet('M0,182 H216', 2, .22);
  /* un bougeoir, deux pots, des livres */
  s += R(34, 152, 9, 23, 2, G('cire'), ' stroke-width="2.5"') + '<path class="flamme" d="M38.5,151 C34,145 36,140 38.5,134 C41,140 43,145 38.5,151 Z" fill="' + G('flamme') + '" stroke="#e8693c" stroke-width="1.2"/><circle cx="38.5" cy="142" r="22" fill="' + G('halo') + '" opacity=".5"/>' + Ell(38.5, 176, 10, 3, G('laitonV'), ' stroke-width="2.5"');
  s += P('M66,176 C61,160 68,148 78,148 C88,148 95,160 90,176 Z', '#b0683e', ' stroke-width="3"') + Ell(78, 148, 8, 2.4, '#7a4424', ' stroke-width="2.5"') + reflet('M69,170 C66,162 69,154 73,151', 2.5, .35);
  s += P('M104,176 L104,158 C104,152 110,152 110,146 L110,140 L118,140 L118,146 C118,152 124,152 124,158 L124,176 Z', 'rgba(110,190,150,.75)', ' stroke-width="3"') + R(109.5, 135, 9, 6, 2, '#c98450', ' stroke-width="2"') + reflet('M108,172 V160', 2, .5);
  s += R(146, 146, 11, 30, 2, '#8a3a4a', ' stroke-width="3"') + R(157, 142, 9, 34, 2, '#3a5a8a', ' stroke-width="3"') + '<g transform="rotate(14 172 176)">' + R(167, 148, 10, 28, 2, '#5a7a3a', ' stroke-width="3"') + '</g>' + T('M148,154 h7 M159,150 h5', '#f5c45a', 1.6);
  return s;
}
function chaudronScene(){
  var s = '<g id="gChaudron" data-act="chaudron" data-outil="chaudron" tabindex="0" role="button" aria-label="Le chaudron"><ellipse class="rond" cx="131" cy="350" rx="80" ry="92"/>';
  /* la crémaillère et l'anse */
  s += T('M131,204 L131,264', K, 7) + T('M131,204 L131,264', '#5f5872', 3, ' stroke-dasharray="6 4"') + T('M75,318 C75,254 187,254 187,318', K, 8) + T('M75,318 C75,254 187,254 187,318', '#5f5872', 3.5);
  /* la panse, la lueur du feu dessous, le bord, le liquide */
  s += P('M73,318 C56,352 64,402 131,412 C198,402 206,352 189,318 Z', G('fonte')) +
    '<path d="M80,370 C98,404 164,404 182,370 C176,396 156,409 131,410 C106,409 86,396 80,370 Z" fill="#ff8a3a" opacity=".32"/>' + reflet('M84,336 C80,354 86,374 96,388', 5, .22) + reflet('M96,330 C94,338 95,346 98,352', 2.5, .3) +
    P('M72,322 C62,322 62,338 72,340', 'none', ' stroke-width="7"') + T('M72,322 C62,322 62,338 72,340', '#5f5872', 3) + P('M190,322 C200,322 200,338 190,340', 'none', ' stroke-width="7"') + T('M190,322 C200,322 200,338 190,340', '#5f5872', 3) +
    Ell(131, 316, 58, 19, 'none', ' stroke-width="11"') + '<ellipse cx="131" cy="316" rx="58" ry="19" fill="none" stroke="#5f5872" stroke-width="5.5"/>' +
    '<ellipse id="liqChaudron" cx="131" cy="318" rx="51" ry="14.5" fill="' + EAU_CHAUDRON + '"/><ellipse cx="116" cy="314" rx="22" ry="4.5" fill="#fff" opacity=".25"/>' +
    '<circle class="bul" cx="112" cy="320" r="3.5" fill="#fff" opacity=".6" style="animation-delay:-.4s"/><circle class="bul" cx="146" cy="316" r="3" fill="#fff" opacity=".6" style="animation-delay:-1.3s"/><circle class="bul" cx="130" cy="324" r="2.5" fill="#fff" opacity=".6" style="animation-delay:-.9s"/>' +
    reflet('M82,308 C96,300 112,297 128,297', 2.5, .35);
  s += '<g class="vapeur">' + T('M114,296 q-8,-11 0,-22 q8,-11 0,-22', '#e6f6ff', 3.5, ' opacity=".5"') + '</g><g class="vapeur v2">' + T('M142,292 q-8,-11 0,-22 q8,-11 0,-22', '#e6f6ff', 3.5, ' opacity=".5"') + '</g>';
  return s + '<rect x="56" y="250" width="150" height="170" fill="transparent"/></g>';
}
function fenetre(){
  var s = '', ext = 'M812,278 L812,142 A72,72 0 0 1 956,142 L956,278 Z', int = 'M790.2,266.2 L790.2,139.8 A66.95,66.95 0 0 1 924.1,139.8 L924.1,266.2 Z';
  /* l'encadrement en pierre */
  s += '<path d="M801,292 L801,142 A83,83 0 0 1 967,142 L967,292" fill="none" stroke="' + K + '" stroke-width="27" stroke-linejoin="round"/><path d="M801,292 L801,142 A83,83 0 0 1 967,142 L967,292" fill="none" stroke="#7d74a0" stroke-width="20" stroke-linejoin="round"/>' +
    T('M791,250 h20 M791,206 h20 M791,162 h20 M957,250 h20 M957,206 h20 M957,162 h20 M806,104 l13,10 M840,64 l7,15 M884,49 l0,17 M928,64 l-7,15 M962,104 l-13,10', K, 2.5);
  /* l'épaisseur du mur (à droite et dessous), puis la vitre, la nuit et les toits de Brumeval */
  s += '<clipPath id="clipFen"><path d="' + ext + '"/></clipPath><g clip-path="url(#clipFen)"><path d="' + ext + '" fill="' + G('pierreL') + '"/>' +
    F('M812,278 L956,278 L924.1,266.2 L780,266.2 Z', '#b9b6dc') + T('M924.1,266.2 L956,278', K, 2.5) +
    '<clipPath id="clipVitre"><path d="' + int + '"/></clipPath><g clip-path="url(#clipVitre)"><rect x="780" y="60" width="160" height="210" fill="' + G('ciel') + '"/>' +
    '<circle cx="838" cy="116" r="34" fill="' + G('lune') + '"/><circle cx="838" cy="116" r="15" fill="#fff3c4"/><circle cx="834" cy="112" r="3.4" fill="#e9dca0"/><circle cx="843" cy="121" r="2.2" fill="#e9dca0"/><circle cx="841" cy="109" r="1.5" fill="#e9dca0"/>' +
    [[818,84],[870,96],[892,128],[900,84],[880,160],[824,168],[906,186],[856,196]].map(function(q, n){ return '<circle class="etoile" cx="' + q[0] + '" cy="' + q[1] + '" r="' + (n % 3 ? 1.3 : 1.9) + '" fill="#fff" style="animation-delay:-' + (n*.7) + 's"/>'; }).join('') +
    F('M786,268 L786,238 L800,224 L814,238 L814,246 L827,231 L841,246 L841,236 L851,222 L851,208 L855,198 L859,208 L859,224 L868,240 L868,250 L882,234 L897,250 L897,242 L909,229 L926,246 L926,268 Z', '#121836') +
    '<rect x="796" y="244" width="5" height="6" fill="#ffd36a"/><rect x="826" y="250" width="5" height="6" fill="#ffd36a"/><rect x="880" y="252" width="5" height="6" fill="#ffd36a"/><rect x="907" y="246" width="5" height="6" fill="#ffb85a"/><rect x="853.5" y="226" width="3.5" height="5" fill="#ffd36a"/>' +
    '<ellipse cx="857" cy="264" rx="84" ry="9" fill="#c8d0f0" opacity=".28"/><path d="M800,90 L840,266 M850,74 L900,266" stroke="#fff" stroke-width="14" opacity=".05"/></g>' +
    /* les croisillons de bois */
    '<path d="' + int + '" fill="none" stroke="' + K + '" stroke-width="11"/><path d="' + int + '" fill="none" stroke="#8a5a32" stroke-width="6"/>' +
    T('M857,74 V266 M790,140 H924 M790,204 H924', K, 9) + T('M857,74 V266 M790,140 H924 M790,204 H924', '#8a5a32', 4.5) + '</g>';
  s += '<path d="' + ext + '" fill="none" stroke="' + K + '" stroke-width="4"/>';
  /* la tablette de bois et un petit pot de menthe */
  s += R(798, 278, 172, 11, 3, G('boisH'), ' stroke-width="3.5"') + reflet('M803,281 H964', 2, .3);
  s += P('M931,274 L928,258 L946,258 L943,274 Z', '#b0683e', ' stroke-width="2.5"') + T('M937,258 C934,248 928,246 926,240 M937,258 C938,246 942,244 944,236 M937,258 C936,250 937,244 936,238', '#4b7a34', 3) +
    '<ellipse cx="926" cy="240" rx="5" ry="3" fill="#6fae5a" stroke="' + K + '" stroke-width="1.5" transform="rotate(-30 926 240)"/><ellipse cx="944" cy="236" rx="5" ry="3" fill="#6fae5a" stroke="' + K + '" stroke-width="1.5" transform="rotate(30 944 236)"/><ellipse cx="936" cy="237" rx="4" ry="2.6" fill="#7cc06a" stroke="' + K + '" stroke-width="1.5"/>';
  return s;
}
function coffre(){
  var X0 = 1.75, X1 = 2.6, s = '<path d="' + d3([[X0-.1,0,3.42],[X1+.1,0,3.42],[X1+.05,0,4],[X0-.05,0,4]]) + '" fill="rgba(8,4,16,.5)" filter="url(#flou)"/>';
  s += Q3([[X0,.55,3.5],[X0,.55,4],[X0,0,4],[X0,0,3.5]], '#5a3418') + Q3([[X0,0,3.5],[X1,0,3.5],[X1,.55,3.5],[X0,.55,3.5]], G('boisC'));
  var a = pr(X0,.55,3.5), b = pr(X1,.55,3.5), base = pr(X0,0,3.5);
  s += grainBois(a[0] + 4, a[1] + 6, b[0] - a[0] - 8, base[1] - a[1] - 12, 5, 61, '#7d4626', .35) + T('M' + f1(a[0]) + ',' + f1(a[1] + 34) + ' H' + f1(b[0]) + ' M' + f1(a[0]) + ',' + f1(a[1] + 68) + ' H' + f1(b[0]), '#7d4626', 2, ' opacity=".6"');
  /* le couvercle bombé */
  s += Q3([[X0,.55,3.5],[X0,.66,3.5],[X0,.66,4],[X0,.55,4]], '#6b3d1f') + Q3([[X0,.66,3.5],[X1,.66,3.5],[X1,.66,4],[X0,.66,4]], '#b47848') +
    Q3([[X0,.55,3.5],[X1,.55,3.5],[X1,.66,3.5],[X0,.66,3.5]], G('boisS'));
  /* les ferrures et la serrure */
  [1.92, 2.43].forEach(function(X){ s += '<path d="' + d3([[X,0,3.5],[X,.66,3.5],[X,.66,4]], true) + '" fill="none" stroke="' + K + '" stroke-width="11" stroke-linejoin="round"/><path d="' + d3([[X,0,3.5],[X,.66,3.5],[X,.66,4]], true) + '" fill="none" stroke="#5f5872" stroke-width="6" stroke-linejoin="round"/>';
    [.1,.3,.5].forEach(function(Y){ var q = pr(X, Y, 3.5); s += '<circle cx="' + f1(q[0]) + '" cy="' + f1(q[1]) + '" r="1.6" fill="#b9b3cc"/>'; }); });
  var m = pr((X0+X1)/2, .46, 3.5); s += R(m[0] - 10, m[1] - 4, 20, 22, 3, G('laitonV'), ' stroke-width="3"') + '<circle cx="' + f1(m[0]) + '" cy="' + f1(m[1] + 5) + '" r="2.6" fill="' + K + '"/><rect x="' + f1(m[0] - 1.2) + '" y="' + f1(m[1] + 5) + '" width="2.4" height="7" fill="' + K + '"/>';
  /* le coussin de Mimi */
  var c = disque(2.18, .66, 3.76, .3); s += Ell(c.cx, c.cy - 4, c.rx, c.ry + 3, '#8a3a5a', ' stroke-width="3.5"') + '<ellipse cx="' + f1(c.cx - 6) + '" cy="' + f1(c.cy - 7) + '" rx="' + f1(c.rx*.6) + '" ry="' + f1(c.ry*.5) + '" fill="#a84e70" opacity=".8"/>' + T('M' + f1(c.cx - c.rx + 6) + ',' + f1(c.cy - 2) + ' q' + f1(c.rx - 6) + ',9 ' + f1(2*c.rx - 12) + ',0', '#5a2238', 1.6, ' opacity=".6"');
  return s;
}
function ardoiseMur(){
  return T('M262,128 L292,100 L322,128', '#c9a877', 2) + Cir(292, 100, 3, '#8a8aa8') + R(252, 126, 80, 112, 4, G('boisS')) + '<rect x="259" y="133" width="66" height="98" rx="2" fill="' + G('ardoise') + '" stroke="' + K + '" stroke-width="2.5"/>' +
    '<path d="M262,150 q20,-10 60,-4 M264,214 q30,8 58,-2" stroke="#fff" stroke-width="5" opacity=".05" fill="none"/><g id="ardoise"></g>' + R(256, 236, 72, 6, 2, G('boisH'), ' stroke-width="2.5"') + R(300, 231, 16, 5, 2, '#f4f1ea', ' stroke-width="1.5"');
}
function etagere(){
  var s = '<rect x="340" y="220" width="320" height="30" fill="rgba(8,4,16,.45)" filter="url(#flou)"/>';
  [-.74, .74].forEach(function(X){ s += Q3([[X,1.655,4],[X,1.655,3.74],[X,1.38,4]], G('fer'), ' stroke-width="3"'); });
  s += Q3([[-.9,1.7,3.72],[.9,1.7,3.72],[.9,1.7,4],[-.9,1.7,4]], '#c08a58', ' stroke-width="3"') + Q3([[-.9,1.655,3.72],[.9,1.655,3.72],[.9,1.7,3.72],[-.9,1.7,3.72]], G('boisS'), ' stroke-width="3.5"');
  BOCAUX.forEach(function(b){ s += bocal(b); });
  return s;
}
function bocal(b){
  var x = f1(b.x), y = f1(b.y), s = '<g id="bocal-' + b.k + '" data-act="goutte" data-outil="goutte" data-k="' + b.k + '" tabindex="0" role="button" aria-label="Bocal : ' + b.nom.join(' ') + '"><rect class="rond" x="' + (x-32) + '" y="' + (y-88) + '" width="64" height="96" rx="12"/>';
  if(b.poudre) s += '<path d="M' + (x-22) + ',' + (y-14) + ' Q' + x + ',' + (y-36) + ' ' + (x+22) + ',' + (y-14) + ' L' + (x+22) + ',' + (y-2) + ' A22,3.4 0 0 1 ' + (x-22) + ',' + (y-2) + ' Z" fill="#f6f4ee"/>' + [[-8,-18],[6,-22],[12,-12],[-13,-10]].map(function(q){ return '<circle cx="' + (x+q[0]) + '" cy="' + (y+q[1]) + '" r="1.3" fill="#cfcac0"/>'; }).join('');
  else s += '<path d="M' + (x-22) + ',' + (y-42) + ' L' + (x-22) + ',' + (y-2) + ' A22,3.4 0 0 0 ' + (x+22) + ',' + (y-2) + ' L' + (x+22) + ',' + (y-42) + ' Z" fill="' + b.liq + '" opacity="' + b.a + '"/><ellipse cx="' + x + '" cy="' + (y-42) + '" rx="22" ry="2.2" fill="' + clair(b.liq, .35) + '" opacity="' + b.a + '"/>';
  /* le verre, le col, le bouchon de liège (vu presque de profil : on est à sa hauteur) */
  s += '<path d="M' + (x-25) + ',' + (y-56) + ' L' + (x-25) + ',' + (y-2) + ' A25,3.8 0 0 0 ' + (x+25) + ',' + (y-2) + ' L' + (x+25) + ',' + (y-56) + ' Q' + (x+25) + ',' + (y-64) + ' ' + (x+17) + ',' + (y-66) + ' L' + (x-17) + ',' + (y-66) + ' Q' + (x-25) + ',' + (y-64) + ' ' + (x-25) + ',' + (y-56) + ' Z" fill="rgba(220,245,255,.22)" stroke="' + K + '" stroke-width="3.5" stroke-linejoin="round"/>' +
    '<path d="M' + (x-16) + ',' + (y-80) + ' Q' + x + ',' + (y-82.5) + ' ' + (x+16) + ',' + (y-80) + ' L' + (x+15) + ',' + (y-64) + ' L' + (x-15) + ',' + (y-64) + ' Z" fill="' + G('boisC') + '" stroke="' + K + '" stroke-width="3" stroke-linejoin="round"/>' +
    [[-7,-74],[4,-70],[9,-76],[-2,-68]].map(function(q){ return '<circle cx="' + (x+q[0]) + '" cy="' + (y+q[1]) + '" r="1.1" fill="#9a6a3a"/>'; }).join('') +
    reflet('M' + (x-19) + ',' + (y-52) + ' L' + (x-19) + ',' + (y-10), 3.5, .45) + reflet('M' + (x-12) + ',' + (y-52) + ' L' + (x-12) + ',' + (y-40), 2, .3) +
    '<g transform="rotate(-3 ' + x + ' ' + (y-24) + ')">' + R(x-22, b.nom.length > 1 ? y-38 : y-33, 44, b.nom.length > 1 ? 27 : 18, 3, '#fff6d8', ' stroke-width="2.5"') +
    (b.nom.length > 1 ? txt(x, y-31, 12, b.nom[0]) + txt(x, y-19, 12, b.nom[1]) : txt(x, y-24, b.nom[0].length > 5 ? 11.5 : 14, b.nom[0])) + '</g>';
  if(b.vapeur) s += '<g class="vapeur">' + T('M' + (x-6) + ',' + (y-86) + ' q-5,-7 0,-14 q5,-7 0,-14', '#dff6ff', 2.6, ' opacity=".7"') + '</g><g class="vapeur v2">' + T('M' + (x+7) + ',' + (y-86) + ' q-5,-7 0,-14 q5,-7 0,-14', '#dff6ff', 2.6, ' opacity=".7"') + '</g>';
  return s + '<rect x="' + (x-30) + '" y="' + (y-86) + '" width="60" height="92" fill="transparent"/></g>';
}
function herbes(){
  var s = T('M676,118 L788,118', K, 5) + T('M676,118 L788,118', '#8a5a32', 2.5) + Cir(680, 118, 3, '#8a8aa8') + Cir(784, 118, 3, '#8a8aa8');
  [[698,'#6fae5a'],[732,'#9a72d8'],[766,'#d9b44a']].forEach(function(h){
    var hx = h[0]; s += T('M' + hx + ',118 L' + hx + ',130', K, 2.5) + R(hx - 7, 128, 14, 7, 2, '#c4a06a', ' stroke-width="2.5"');
    for(var k = -2; k <= 2; k++){ var bx = hx + k*6, by = 136; s += T('M' + hx + ',' + by + ' L' + bx + ',' + (by + 56 - Math.abs(k)*6), '#4b6b34', 2);
      for(var f = 0; f < 4; f++){ var fy = by + 14 + f*10, fx = hx + (bx - hx)*(14 + f*10)/56; s += '<ellipse cx="' + (fx + (k <= 0 ? -4 : 4)) + '" cy="' + fy + '" rx="5" ry="2.6" fill="' + h[1] + '" stroke="' + K + '" stroke-width="1.2" transform="rotate(' + (k <= 0 ? -30 : 30) + ' ' + fx + ' ' + fy + ')"/>'; } }
  });
  return s;
}
function lanterne(){
  return T('M500,-40 L500,26', K, 5) + T('M500,-40 L500,26', '#8a8aa8', 2, ' stroke-dasharray="5 3"') + Cir(500, 30, 5, G('laitonV')) + P('M476,46 L524,46 L516,36 L484,36 Z', G('laitonV')) +
    P('M480,46 L520,46 L514,100 L486,100 Z', 'rgba(255,222,140,.78)') + T('M490,48 L488,98 M510,48 L512,98 M500,46 L500,100', '#8a5a12', 2.5) +
    '<ellipse class="flamme" cx="500" cy="76" rx="6.5" ry="13" fill="#fff6c8"/>' + R(478, 98, 44, 9, 3, G('laitonV'), ' stroke-width="3"') + '<ellipse cx="500" cy="107" rx="16" ry="2" fill="#8a5a12"/>';
}
function paillasse(){
  var s = '', X, i;
  s += '<path d="' + d3([[-1.42,0,2.97],[1.42,0,2.97],[1.4,0,4],[-1.4,0,4]]) + '" fill="rgba(8,4,16,.5)" filter="url(#flou)"/>';
  /* sous la table : l'ombre, l'étagère basse et ce qui est rangé dessus */
  var bG = pr(-1.3,0,3.02), bD = pr(1.3,0,3.02), tab = pr(0,.5,3.02)[1];
  s += '<rect x="' + f1(bG[0]) + '" y="' + f1(tab - 4) + '" width="' + f1(bD[0] - bG[0]) + '" height="' + f1(bG[1] - tab + 4) + '" fill="rgba(10,6,20,.5)"/>';
  s += Q3([[-1.2,.2,3.1],[1.2,.2,3.1],[1.2,.2,3.9],[-1.2,.2,3.9]], '#7a4a28', ' stroke-width="3"') + veines3(-1.15, 1.15, .2, 3.12, 3.5, 4, 71, '#4f2a14', .5);
  /* un panier, des livres, une cruche, des rouleaux */
  var pan = pr(-.8,.2,3.22); s += P('M' + f1(pan[0]-34) + ',' + f1(pan[1]-34) + ' L' + f1(pan[0]-28) + ',' + f1(pan[1]) + ' Q' + f1(pan[0]) + ',' + f1(pan[1]+8) + ' ' + f1(pan[0]+28) + ',' + f1(pan[1]) + ' L' + f1(pan[0]+34) + ',' + f1(pan[1]-34) + ' Z', '#b98a4a', ' stroke-width="3"') +
    T('M' + f1(pan[0]-31) + ',' + f1(pan[1]-22) + ' q31,9 62,0 M' + f1(pan[0]-29) + ',' + f1(pan[1]-10) + ' q29,9 58,0 M' + f1(pan[0]-14) + ',' + f1(pan[1]-34) + ' v38 M' + f1(pan[0]+2) + ',' + f1(pan[1]-34) + ' v40 M' + f1(pan[0]+18) + ',' + f1(pan[1]-34) + ' v37', '#7a5424', 1.6);
  var liv = pr(-.12,.2,3.2); s += R(liv[0]-40, liv[1]-12, 80, 13, 2, '#3a5a8a', ' stroke-width="3"') + R(liv[0]-34, liv[1]-24, 72, 12, 2, '#8a3a4a', ' stroke-width="3"') + R(liv[0]-38, liv[1]-35, 70, 11, 2, '#5a7a3a', ' stroke-width="3"') + T('M' + f1(liv[0]-30) + ',' + f1(liv[1]-6) + ' h14 M' + f1(liv[0]-24) + ',' + f1(liv[1]-18) + ' h12', '#f5c45a', 2);
  var cr = pr(.55,.2,3.22); s += P('M' + f1(cr[0]-20) + ',' + f1(cr[1]) + ' C' + f1(cr[0]-30) + ',' + f1(cr[1]-22) + ' ' + f1(cr[0]-22) + ',' + f1(cr[1]-44) + ' ' + f1(cr[0]) + ',' + f1(cr[1]-46) + ' C' + f1(cr[0]+22) + ',' + f1(cr[1]-44) + ' ' + f1(cr[0]+30) + ',' + f1(cr[1]-22) + ' ' + f1(cr[0]+20) + ',' + f1(cr[1]) + ' Z', '#9a6a4e', ' stroke-width="3"') + reflet('M' + f1(cr[0]-17) + ',' + f1(cr[1]-10) + ' q-6,-14 2,-26', 3, .3);
  var ro = pr(.98,.2,3.2); s += '<g transform="rotate(-4 ' + f1(ro[0]) + ' ' + f1(ro[1]) + ')">' + R(ro[0]-34, ro[1]-13, 68, 13, 6.5, G('parchemin'), ' stroke-width="3"') + Ell(ro[0]+34, ro[1]-6.5, 4, 6.5, '#d9c89c', ' stroke-width="2.5"') + R(ro[0]-28, ro[1]-25, 60, 12, 6, '#e9dcb8', ' stroke-width="3"') + '</g>';
  s += Q3([[-1.2,.16,3.1],[1.2,.16,3.1],[1.2,.2,3.1],[-1.2,.2,3.1]], G('boisS'), ' stroke-width="3"');
  /* les pieds de devant (la face de devant et la face tournée vers le milieu) */
  [-1, 1].forEach(function(c){ s += Q3([[c*1.2,0,3.02],[c*1.2,0,3.12],[c*1.2,.52,3.12],[c*1.2,.52,3.02]], '#5a3418', ' stroke-width="3"') + Q3([[c*1.3,0,3.02],[c*1.2,0,3.02],[c*1.2,.52,3.02],[c*1.3,.52,3.02]], G('boisV'), ' stroke-width="3.5"'); });
  /* le tablier et ses deux tiroirs */
  s += Q3([[-1.3,.5,3.02],[1.3,.5,3.02],[1.3,.86,3.02],[-1.3,.86,3.02]], G('boisV'));
  var t0 = pr(-1.3,.86,3.02), t1 = pr(1.3,.5,3.02); s += grainBois(t0[0] + 3, t0[1] + 3, t1[0] - t0[0] - 6, t1[1] - t0[1] - 6, 5, 23, '#6b3d1f', .35);
  [['g', -1.22, -.08], ['d', .08, 1.22]].forEach(function(d){
    var a = pr(d[1], .82, 3.02), b = pr(d[2], .55, 3.02), w = b[0] - a[0], h = b[1] - a[1], mx = (a[0] + b[0])/2, my = a[1] + h/2;
    s += '<g id="tir-' + d[0] + '" data-act="tiroir" data-outil="tiroir" data-t="' + d[0] + '" tabindex="0" role="button" aria-label="Tiroir : ' + TIROIRS[d[0]].map(function(k){ return CASIERS[k]; }).join(', ') + '">' +
      '<rect class="rond" x="' + f1(a[0] - 5) + '" y="' + f1(a[1] - 5) + '" width="' + f1(w + 10) + '" height="' + f1(h + 10) + '" rx="9"/>' +
      R(a[0], a[1], w, h, 5, G('boisC'), ' stroke-width="3.5"') + '<rect x="' + f1(a[0] + 7) + '" y="' + f1(a[1] + 6) + '" width="' + f1(w - 14) + '" height="' + f1(h - 12) + '" rx="3" fill="none" stroke="#7d4626" stroke-width="2" opacity=".5"/>' + grainBois(a[0] + 5, a[1] + 4, w - 10, h - 8, 4, 30 + d[1]*10, '#7d4626', .3) + reflet('M' + f1(a[0] + 6) + ',' + f1(a[1] + 3.5) + ' h' + f1(w - 12), 2, .35) +
      /* la plaque : ce qu'il y a dedans */
      R(mx - 44, a[1] + 8, 88, 21, 3, '#fff6d8', ' stroke-width="2.5"') + TIROIRS[d[0]].map(function(k, n){ return picto(k, mx - 28 + n*28, a[1] + 18.5, 15); }).join('') +
      /* la poignée */
      R(mx - 24, my + 9, 48, 13, 6, G('laitonV'), ' stroke-width="3"') + T('M' + f1(mx - 15) + ',' + f1(my + 15) + ' q15,15 30,0', K, 5.5) + T('M' + f1(mx - 15) + ',' + f1(my + 15) + ' q15,15 30,0', '#f5b945', 2.6) + '</g>';
  });
  /* le plateau : le dessus (les planches fuient vers le fond), puis le chant */
  s += Q3([[-1.35,.9,3],[1.35,.9,3],[1.35,.9,4],[-1.35,.9,4]], G('boisH'));
  [3.25, 3.5, 3.75].forEach(function(z){ s += '<path d="' + d3([[-1.35,.9,z],[1.35,.9,z]], true) + '" stroke="#a5653a" stroke-width="2.2" fill="none" opacity=".75"/>'; });
  s += veines3(-1.3, 1.3, .9, 3.02, 3.98, 15, 21, '#8a5530', .38);
  [[-.2,3.14,.05],[1.05,3.82,.04],[-1.12,3.3,.035],[.6,3.62,.03]].forEach(function(n){ var q = disque(n[0], .9, n[1], n[2]); s += noeud(q.cx, q.cy, f1(q.rx), q.ry/q.rx); });
  /* des taches : de l'encre, un rond de verre, une brûlure */
  var ta = disque(-.62, .9, 3.72, .1), tb = disque(.55, .9, 3.86, .085), tc = disque(1.1, .9, 3.5, .06);
  s += '<ellipse cx="' + f1(ta.cx) + '" cy="' + f1(ta.cy) + '" rx="' + f1(ta.rx) + '" ry="' + f1(ta.ry) + '" fill="rgba(70,40,110,.3)"/><ellipse cx="' + f1(ta.cx + 9) + '" cy="' + f1(ta.cy + 2) + '" rx="4" ry="1.6" fill="rgba(70,40,110,.3)"/>' +
    '<ellipse cx="' + f1(tb.cx) + '" cy="' + f1(tb.cy) + '" rx="' + f1(tb.rx) + '" ry="' + f1(tb.ry) + '" fill="none" stroke="rgba(120,60,30,.35)" stroke-width="2"/>' +
    '<ellipse cx="' + f1(tc.cx) + '" cy="' + f1(tc.cy) + '" rx="' + f1(tc.rx) + '" ry="' + f1(tc.ry) + '" fill="rgba(40,20,10,.35)"/>';
  s += '<path d="' + d3([[-1.2,.9,3.08],[-1.02,.9,3.1]], true) + ' ' + d3([[.75,.9,3.06],[.92,.9,3.09]], true) + ' ' + d3([[.2,.9,3.9],[.34,.9,3.88]], true) + '" stroke="rgba(90,50,20,.5)" stroke-width="1.4" fill="none"/>';
  s += Q3([[-1.35,.86,3],[1.35,.86,3],[1.35,.9,3],[-1.35,.9,3]], G('boisS'), ' stroke-width="3.5"');
  var e0 = pr(-1.35,.9,3), e1 = pr(1.35,.9,3); s += reflet('M' + f1(e0[0] + 6) + ',' + f1(e0[1] + 1) + ' H' + f1(e1[0] - 6), 2, .4);
  return s;
}
function alambic(){
  var s = '<g transform="translate(306,352)">' + ombre(18, 4, 54, 8, .45);
  s += T('M-20,2 L-13,-36 M20,2 L13,-36 M0,6 L0,-34', K, 6) + T('M-20,2 L-13,-36 M20,2 L13,-36 M0,6 L0,-34', '#5f5872', 2.5) + Ell(0, -37, 20, 6, 'none', ' stroke-width="6"') + '<ellipse cx="0" cy="-37" rx="20" ry="6" fill="none" stroke="#5f5872" stroke-width="2.5"/>';
  s += R(-7, -12, 14, 12, 3, G('laiton'), ' stroke-width="2.5"') + '<path class="flamme" d="M0,-12 C-4,-17 -2,-22 0,-28 C2,-22 4,-17 0,-12 Z" fill="' + G('flamme') + '"/>';
  s += P('M-18,-38 C-28,-58 -16,-78 0,-78 C16,-78 28,-58 18,-38 Z', G('cuivre')) + reflet('M-14,-46 C-18,-56 -12,-68 -6,-72', 3.5, .5) + P('M-11,-76 C-13,-94 13,-94 11,-76 Z', G('cuivre'), ' stroke-width="3.5"');
  s += T('M7,-90 C34,-98 46,-70 52,-34', K, 9) + T('M7,-90 C34,-98 46,-70 52,-34', '#d98a4a', 4.5) + reflet('M14,-93 C30,-94 38,-80 42,-66', 1.5, .6);
  s += '<circle cx="56" cy="-14" r="14" fill="rgba(210,240,255,.4)" stroke="' + K + '" stroke-width="3"/><path d="M43.5,-10 A14,14 0 0 0 68.5,-10 Q56,-6 43.5,-10 Z" fill="#6fd3c0" opacity=".85"/>' + R(51, -37, 10, 11, 2, 'rgba(210,240,255,.5)', ' stroke-width="2.5"') + reflet('M47,-20 q2,-6 7,-7', 2, .8) + '<circle class="bul" cx="56" cy="-6" r="2" fill="#dffff6"/>';
  return s + '</g>';
}
function loupeScene(){
  var x = f1(LOUPE.x), y = f1(LOUPE.y), rx = 40, ry = 17.5;
  return '<g id="gLoupe" data-act="loupe" data-outil="loupe" tabindex="0" role="button" aria-label="La loupe"><ellipse class="rond" cx="' + (x - 14) + '" cy="' + (y + 3) + '" rx="66" ry="29"/><g id="loupeMobile">' + ombre(x + 6, y + 10, 46, 11, .4) +
    '<g transform="translate(' + (x - 36) + ',' + (y + 6) + ') rotate(171)">' + R(0, -6.5, 50, 13, 6.5, G('bois'), ' stroke-width="3.5"') + T('M12,-6 V6 M21,-6 V6 M30,-6 V6', '#5a3418', 1.5) + reflet('M4,-3 H46', 2, .4) + R(-8, -8, 12, 16, 3, G('laiton'), ' stroke-width="3"') + Cir(50, 0, 5, G('laitonV'), ' stroke-width="2.5"') + '</g>' +
    Ell(x, y, rx, ry, G('laiton')) + '<ellipse cx="' + x + '" cy="' + (y - 1.5) + '" rx="' + (rx - 7) + '" ry="' + (ry - 4.5) + '" fill="rgba(205,240,255,.6)" stroke="' + K + '" stroke-width="2.5"/>' +
    '<ellipse cx="' + (x + 3) + '" cy="' + y + '" rx="22" ry="7" fill="#eec08a" opacity=".5"/>' + T('M' + (x - 12) + ',' + (y + 1) + ' h28', '#a5653a', 1.6, ' opacity=".5"') +
    reflet('M' + (x - 26) + ',' + (y - 5) + ' Q' + (x - 14) + ',' + (y - 12) + ' ' + (x + 2) + ',' + (y - 12), 3, .85) + '</g>' +
    '<rect x="' + (x - 96) + '" y="' + (y - 24) + '" width="140" height="50" fill="transparent"/></g>';
}
function lameScene(){
  var a = pr(-.455,.9,3.38), b = pr(.495,.9,3.38);
  return '<g id="gLame" class="objet" data-act="lame" tabindex="0" role="button" aria-label="Le fil rouge, sur sa lame de verre"><ellipse class="rond" cx="504" cy="366" rx="108" ry="23"/>' + ombre(506, 378, 96, 6, .4) +
    P(d3([[-.455,.9,3.38],[.495,.9,3.38],[.495,.9,3.62],[-.455,.9,3.62]]), 'rgba(225,245,255,.52)', ' stroke-width="3"') + R(a[0], a[1], b[0] - a[0], 4.5, 1, 'rgba(150,200,225,.9)', ' stroke-width="2.5"') +
    P('M418,372.6 L444,372.6 L446.4,360.4 L422.6,360.4 Z', '#fff6d8', ' stroke-width="2"') + txt(432.6, 366.6, 9, 'n° 1') + reflet('M458,361 L560,361', 1.6, .55) + '<g id="filLame"></g>' +
    '<rect x="402" y="346" width="204" height="40" fill="transparent"/></g>';
}
function dessinerLame(){
  var d = 'M452,367 C464,360.5 476,371.5 490,366 S514,360.5 528,366 S554,371.5 582,364.5', s = T(d, K, 8.5) + T(d, ROUGE, 4.8);
  for(var x = 458; x < 580; x += 8) s += T('M' + (x-2) + ',369 L' + (x+2) + ',363.5', sombre(ROUGE, .45), 1.3);
  var restants = S.items ? S.items[10].filter(function(i){ return i.t === 'noir' && !i.pris && !i.min; }).length : 3;
  [[470,365.5],[516,368],[560,364.5]].slice(0, restants).forEach(function(q){ s += '<circle cx="' + q[0] + '" cy="' + q[1] + '" r="2.4" fill="#17110f"/>'; });
  if(S.trouves.fil) s += '<text x="592" y="352" font-size="14" text-anchor="middle" dominant-baseline="central">✅</text>';
  $('#filLame').innerHTML = s;
}
function microscopeScene(){
  var s = '<g id="gMicro" data-act="micro" data-outil="micro" tabindex="0" role="button" aria-label="Le microscope"><rect class="rond" x="616" y="212" width="98" height="174" rx="16"/>' + ombre(680, 372, 48, 8, .5) + '<g transform="translate(674,366) scale(.8)">';
  s += Ell(0, 0, 42, 15, G('fer')) + '<ellipse cx="0" cy="-4" rx="36" ry="11" fill="#5f5872" stroke="' + K + '" stroke-width="2.5"/>' + reflet('M-28,-6 Q0,-13 26,-8', 2.5, .35);
  s += R(-28, -74, 12, 70, 3, G('laiton'), ' stroke-width="3.5"');
  s += T('M-8,-22 L2,-36 M-8,-22 L-18,-36', K, 3) + Ell(-8, -38, 13, 7, '#d9e6f0', ' stroke-width="3"') + reflet('M-15,-40 l9,-2', 2, .8);
  s += P('M-48,-62 L32,-62 L38,-50 L-54,-50 Z', G('fer')) + T('M-40,-56 l14,0 M12,-56 l14,0', '#f5b945', 3) + '<ellipse cx="-6" cy="-56" rx="8" ry="2.6" fill="#0f0b18"/>' + R(-22, -65, 34, 4, 1, 'rgba(225,245,255,.85)', ' stroke-width="1.5"') + T('M-16,-63 h22', ROUGE, 1.6);
  s += T('M-22,-72 C-62,-90 -64,-150 -6,-150', K, 20) + T('M-22,-72 C-62,-90 -64,-150 -6,-150', '#e0a23a', 12) + reflet('M-30,-82 C-56,-96 -56,-138 -20,-146', 3, .45);
  s += Cir(-50, -112, 13, G('laiton')) + '<circle cx="-50" cy="-112" r="13" fill="none" stroke="#8a5a12" stroke-width="2" stroke-dasharray="2 3"/>' + Cir(-50, -112, 4.5, '#3a3450');
  s += '<g transform="rotate(16 -8 -110)">' + R(-19, -160, 24, 92, 5, G('laiton')) + T('M-19,-140 h24 M-19,-116 h24 M-19,-92 h24', '#8a5a12', 2.5) + reflet('M-13,-154 V-76', 3, .45) +
    R(-17, -182, 20, 24, 4, G('fer')) + Ell(-7, -182, 11, 3.5, '#bff3ff', ' stroke-width="3"') +
    Ell(-7, -67, 15, 5.5, G('laitonV'), ' stroke-width="3"') + R(-16, -65, 8, 15, 2.5, G('fer'), ' stroke-width="2.5"') + R(-6, -63, 8, 11, 2.5, G('laitonV'), ' stroke-width="2.5"') + R(3, -65, 7, 8, 2.5, G('laitonV'), ' stroke-width="2.5"') + '</g>';
  return s + '</g><rect x="618" y="214" width="94" height="170" fill="transparent"/></g>';
}
function bougieScene(){
  var x = BOUGIE.x, y = BOUGIE.y;
  return '<g id="gLampe" data-act="flamme" data-outil="flamme" tabindex="0" role="button" aria-label="La bougie"><rect class="rond" x="' + (x-31) + '" y="' + (y-94) + '" width="64" height="108" rx="14"/>' + ombre(x + 4, y + 6, 28, 7, .45) +
    '<circle cx="' + x + '" cy="' + (y - 68) + '" r="42" fill="' + G('halo') + '" opacity=".6"/>' +
    T('M' + (x+19) + ',' + (y-1) + ' c14,-2 14,-15 1,-12', K, 6.5) + T('M' + (x+19) + ',' + (y-1) + ' c14,-2 14,-15 1,-12', '#f5b945', 2.8) +
    Ell(x, y, 23, 10, G('laiton')) + '<ellipse cx="' + x + '" cy="' + (y - 2) + '" rx="17" ry="6.5" fill="#c98a1c" stroke="' + K + '" stroke-width="2"/>' + R(x - 8.5, y - 11, 17, 10, 3, G('laiton'), ' stroke-width="3"') +
    R(x - 7, y - 52, 14, 43, 3, G('cire'), ' stroke-width="3"') + F('M' + (x-6) + ',' + (y-51) + ' c1,12 3,12 4,3 c1,9 3,15 4.5,5 c1,6 2.5,6 3.5,-3 l0,-5 Z', '#fffdf4') + T('M' + x + ',' + (y - 52) + ' v-5', K, 2) +
    '<g class="flamme"><path d="M' + x + ',' + (y-55) + ' C' + (x-9) + ',' + (y-65) + ' ' + (x-5) + ',' + (y-77) + ' ' + x + ',' + (y-89) + ' C' + (x+5) + ',' + (y-77) + ' ' + (x+9) + ',' + (y-65) + ' ' + x + ',' + (y-55) + ' Z" fill="' + G('flamme') + '" stroke="#e8693c" stroke-width="2"/>' +
    '<path d="M' + x + ',' + (y-57) + ' C' + (x-4) + ',' + (y-63) + ' ' + (x-2) + ',' + (y-69) + ' ' + x + ',' + (y-75) + ' C' + (x+2) + ',' + (y-69) + ' ' + (x+4) + ',' + (y-63) + ' ' + x + ',' + (y-57) + ' Z" fill="#fff7c2"/></g>' +
    '<rect x="' + (x-29) + '" y="' + (y-92) + '" width="60" height="104" fill="transparent"/></g>';
}
/* Une coupelle de verre posée en (x, y) : la paroi, le fond, ce qu'il y a dedans, le bord épais, les reflets */
function contenuCoupe(t, x, y, n, rx){
  var o = OBJETS[t], u = rx/20;
  if(o.liquide) return '<ellipse cx="' + f1(x) + '" cy="' + f1(y - 3*u) + '" rx="' + f1(rx*1.04) + '" ry="' + f1(rx*.42) + '" fill="' + (S.teinte || couleurRouge()) + '" opacity=".92"/><ellipse cx="' + f1(x - 6*u) + '" cy="' + f1(y - 4.5*u) + '" rx="' + f1(7*u) + '" ry="' + f1(2*u) + '" fill="#fff" opacity=".3"/>';
  var s = '', R0 = rng(t.length*7);
  for(var i=0;i<Math.min(n, 5);i++){ var gx = x - 7*u + (i % 3)*7*u + R0()*3*u, gy = y - 2*u - Math.floor(i/3)*3.6*u + R0()*1.5*u;
    s += t === 'or' ? '<path d="M' + f1(gx-4*u) + ',' + f1(gy) + ' L' + f1(gx) + ',' + f1(gy-4*u) + ' L' + f1(gx+5*u) + ',' + f1(gy-u) + ' L' + f1(gx+u) + ',' + f1(gy+3*u) + ' Z" fill="#f2c040" stroke="' + K + '" stroke-width="' + f1(1.5*u) + '"/>'
      : '<circle cx="' + f1(gx) + '" cy="' + f1(gy) + '" r="' + f1(3.5*u) + '" fill="' + o.coul + '" stroke="' + K + '" stroke-width="' + f1(1.3*u) + '"/><circle cx="' + f1(gx - u) + '" cy="' + f1(gy - 1.2*u) + '" r="' + f1(.9*u) + '" fill="#fff" opacity=".35"/>'; }
  return s;
}
function coupelle(x, y, rx, c){
  var ry = rx*.45, h = rx*.27, u = rx/24, s = ombre(x + 2*u, y + 3*u, rx*1.05, ry*.7, .4);
  s += '<path d="M' + f1(x-rx) + ',' + f1(y-h) + ' L' + f1(x-rx*.8) + ',' + f1(y) + ' A' + f1(rx*.8) + ',' + f1(ry*.8) + ' 0 0 0 ' + f1(x+rx*.8) + ',' + f1(y) + ' L' + f1(x+rx) + ',' + f1(y-h) + ' Z" fill="rgba(190,228,246,.42)" stroke="' + K + '" stroke-width="' + f1(2.6*u) + '" stroke-linejoin="round"/>';
  s += '<ellipse cx="' + f1(x) + '" cy="' + f1(y-h) + '" rx="' + f1(rx) + '" ry="' + f1(ry) + '" fill="rgba(226,246,255,.3)"/>';
  if(c) s += contenuCoupe(c.t, x, y - h*.1, c.n, rx*.8);
  s += '<ellipse cx="' + f1(x) + '" cy="' + f1(y-h) + '" rx="' + f1(rx) + '" ry="' + f1(ry) + '" fill="none" stroke="' + K + '" stroke-width="' + f1(4.4*u) + '"/><ellipse cx="' + f1(x) + '" cy="' + f1(y-h) + '" rx="' + f1(rx) + '" ry="' + f1(ry) + '" fill="none" stroke="#dff5ff" stroke-width="' + f1(1.8*u) + '"/>';
  return s + reflet('M' + f1(x-rx*.74) + ',' + f1(y-h*.2) + ' q' + f1(rx*.3) + ',' + f1(ry*.55) + ' ' + f1(rx*.62) + ',' + f1(ry*.62), 2.2*u, .55) + reflet('M' + f1(x+rx*.5) + ',' + f1(y-h-ry*.55) + ' q' + f1(rx*.22) + ',' + f1(ry*.2) + ' ' + f1(rx*.3) + ',' + f1(ry*.45), 1.6*u, .7);
}
function dessinerCoupes(){
  POS_COUPES.forEach(function(x, i){
    var g = $('#coupe' + i), c = S.coupes[i]; if(!g) return;
    g.innerHTML = (c ? '<ellipse class="rond" cx="' + x + '" cy="' + (Y_COUPE - 5) + '" rx="32" ry="18"/>' : '') + coupelle(x, Y_COUPE, 24, c) +
      (c && S.trouves[c.t] ? '<text x="' + (x + 21) + '" y="' + (Y_COUPE - 22) + '" font-size="13" text-anchor="middle" dominant-baseline="central">✅</text>' : '') +
      (c ? '<rect x="' + (x - 28) + '" y="' + (Y_COUPE - 24) + '" width="56" height="36" fill="transparent"/>' : '');
    g.classList.toggle('objet', !!c); g.classList.toggle('sel', !!c && S.sel === c.t);
    if(c){ g.setAttribute('tabindex', '0'); g.setAttribute('role', 'button'); g.setAttribute('aria-label', 'Coupelle : ' + OBJETS[c.t].nom); } else { g.removeAttribute('tabindex'); g.removeAttribute('role'); g.removeAttribute('aria-label'); }
  });
}
function posCible(){ if(S.sel === 'fil' || !S.sel) return {x:512, y:364}; var i = S.coupes.findIndex(function(c){ return c && c.t === S.sel; }); return {x:POS_COUPES[i], y:Y_COUPE - 6}; }
/* L'ardoise accrochée au mur : c'est là que s'écrit le code à transmettre, quand l'analyse le permet */
function majArdoise(){
  var g = $('#ardoise'); if(!g) return; var pret = S.trouves.fil && S.trouves.noir, craie = ' font-family="Caveat, cursive" font-weight="700" text-anchor="middle" fill="#f4f1ea"';
  if(!pret){ g.innerHTML = '<path d="M284,176 l0,-14 l-5,0 l0,-5 l26,0 l0,5 l-5,0 l0,14 l11,20 q2,7 -6,7 l-26,0 q-8,0 -6,-7 Z" fill="none" stroke="#f4f1ea" stroke-width="2" opacity=".55" stroke-linejoin="round"/><path d="M277,192 h30" stroke="#f4f1ea" stroke-width="2" opacity=".4"/><text x="292" y="150" font-size="13" opacity=".45"' + craie + '>?</text>'; return; }
  g.innerHTML = '<text x="292" y="152" font-size="13"' + craie + '>pour le</text><text x="292" y="166" font-size="15"' + craie + '>Barde</text><text class="chiffres" x="292" y="200" font-size="34"' + craie + ' fill="#ffe9a3">' + TXT.code + '</text><path d="M268,212 q24,7 48,-1" stroke="#f4f1ea" stroke-width="2.5" fill="none" stroke-linecap="round"/>';
}
function dessinerScene(){
  var s = defs();
  s += murPierre() + solDalles() + plafond();
  /* les lueurs : le feu, la lanterne */
  s += '<circle class="braise" cx="131" cy="420" r="270" fill="' + G('feu') + '"/><circle cx="500" cy="70" r="230" fill="' + G('lueur') + '"/>';
  /* une toile d'araignée dans le coin, la tresse d'ail, le trou de souris */
  s += T('M1000,22 L940,22 M1000,22 L952,56 M1000,22 L984,84 M1000,22 L1000,92 M962,22 Q966,42 990,62 M980,22 Q982,34 998,44 M946,22 Q952,52 986,80', '#e6e0ff', 1.2, ' opacity=".35"');
  s += T('M236,24 L236,116', '#c9a877', 2.5) + [36,52,68,84,100].map(function(y, n){ return Ell(236 + (n % 2 ? 5 : -5), y, 8, 9, '#f4ecd8', ' stroke-width="2.5"') + T('M' + (236 + (n % 2 ? 5 : -5)) + ',' + (y - 9) + ' v-4', '#c9a877', 2); }).join('');
  s += P('M800,478 L800,462 Q812,448 824,462 L824,478 Z', '#0d0812', ' stroke-width="3"') + '<circle class="etoile" cx="808" cy="468" r="1.5" fill="#ffd36a"/><circle class="etoile" cx="815" cy="468" r="1.5" fill="#ffd36a"/>';
  /* à gauche : la cheminée, le chaudron, le manteau, la dalle du foyer, l'écuelle de Mimi */
  s += cheminee() + chaudronScene() + manteau();
  s += Q3([[-3.1,.05,3.55],[-1.75,.05,3.55],[-1.75,.05,4],[-3.1,.05,4]], G('pierre'), ' stroke-width="3"') + Q3([[-3.1,0,3.55],[-1.75,0,3.55],[-1.75,.05,3.55],[-3.1,.05,3.55]], G('pierreS'), ' stroke-width="3"');
  var ec = disque(-1.7, 0, 3.36, .11); s += ombre(ec.cx + 2, ec.cy + 4, ec.rx*1.1, ec.ry*.7, .4) + Ell(ec.cx, ec.cy, ec.rx, ec.ry, '#9ab0c8', ' stroke-width="3"') + Ell(ec.cx, ec.cy - 3, ec.rx*.78, ec.ry*.72, '#f6fbff', ' stroke-width="2"');
  /* à droite : la fenêtre, le coffre ; un rayon de lune sur les dalles */
  s += fenetre() + coffre();
  s += '<path d="' + d3([[1.35,0,2.9],[2.15,0,2.9],[2.45,0,3.4],[1.65,0,3.4]]) + '" fill="#9ab4ff" opacity=".13" filter="url(#flou2)"/>';
  /* au mur : l'ardoise, l'étagère des bocaux, les herbes qui sèchent */
  s += ardoiseMur() + etagere() + herbes();
  /* au milieu : la paillasse et tout ce qui est posé dessus, du fond vers le devant */
  s += paillasse() + alambic() + microscopeScene() + lameScene() + loupeScene() + bougieScene();
  POS_COUPES.forEach(function(x, i){ s += '<g data-act="coupe" data-i="' + i + '" id="coupe' + i + '"></g>'; });
  s += lanterne();
  /* la pipette et la pince (cachées : elles servent aux expériences) */
  s += '<g id="pipette" style="display:none">' + R(-5, -70, 10, 60, 4, 'rgba(220,245,255,.85)', ' stroke-width="3"') + P('M-9,-92 C-9,-106 9,-106 9,-92 L7,-70 L-7,-70 Z', '#d9603a', ' stroke-width="3"') + '<rect id="pipLiq" x="-3" y="-34" width="6" height="22" fill="#9fd8ff"/></g>';
  s += '<g id="goutte" style="display:none"><path d="M0,-8 C5,-1 6,4 0,8 C-6,4 -5,-1 0,-8 Z" stroke="' + K + '" stroke-width="2"/></g>';
  s += '<g id="pince" style="display:none">' + T('M0,0 L-10,-70 M0,0 L10,-70', K, 7) + T('M0,0 L-10,-70 M0,0 L10,-70', '#c9c4de', 3) + '<circle id="pinceBout" cx="0" cy="2" r="5" fill="#b3262f" stroke="' + K + '" stroke-width="2"/></g>';
  s += '<g id="effets"></g><rect x="-1700" y="-1500" width="4400" height="3700" fill="' + G('vignette') + '" pointer-events="none"/>';
  $('#scene').innerHTML = s;
  dessinerLame(); dessinerCoupes(); majArdoise(); majChaudron();
}
function majChaudron(){ var l = $('#liqChaudron'); if(l) l.setAttribute('fill', S.trouves.rouge ? couleurRouge() : EAU_CHAUDRON); }
