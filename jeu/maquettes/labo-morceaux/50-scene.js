
/* ============ La paillasse, vue de près ============
   On est penché sur la paillasse de l'atelier : le plateau remplit l'écran, le mur de l'atelier est derrière, les deux tiroirs dessous.
   Tout ce qui sert est posé dessus, et tout reste à sa place quand on zoome (loupe, microscope, bandelette). */
var LOUPE = {x:214, y:442}, TESTP = {x:152, y:374};
var COUPES = [[800,386],[884,386],[968,386],[842,444],[926,444]];
var BOUGIE = {x:216, y:262, e:1.1};
var MICRO = {x:930, y:304, e:1.05};
var TIR = {g:106, d:620, w:474, y:506, h:112};

/* Le mur du fond de l'atelier (mêmes motifs et mêmes couleurs que dans le jeu), jusqu'en haut de l'écran */
function mur(){
  var ti = ST.murT, f = ST.murF, cl = ti ? clair(THEMES[ti].c, .55) : '#ffffff', op = ti ? .22 : .06, E = 1.85, s = '', d = '', d2 = '', u, v, r, u0 = -1300, u1 = 1300, H = 1060;
  function W(a, b){ return [600 + a*E, 236 + (122 - b)*E]; }
  function rect(ua, va, ub, vb){ var a = W(ua, va), b = W(ub, vb); return 'M' + f1(a[0]) + ',' + f1(a[1]) + ' H' + f1(b[0]) + ' V' + f1(b[1]) + ' H' + f1(a[0]) + ' Z '; }
  function etoile(cu, cv, rr){ var t = ''; for(var j = 0; j < 8; j++){ var a = j/8*Math.PI*2, q = W(cu + Math.cos(a)*(j % 2 ? rr*.3 : rr), cv + Math.sin(a)*(j % 2 ? rr*.3 : rr)); t += (j ? ' L' : 'M') + f1(q[0]) + ',' + f1(q[1]); } return t + ' Z '; }
  function fleur(cu, cv){ var t = ''; for(var p = 0; p < 5; p++){ var b = p/5*Math.PI*2, pu = cu + Math.cos(b)*7, pv = cv + Math.sin(b)*7, a = W(pu - 5, pv), b2 = W(pu, pv + 5), c2 = W(pu + 5, pv), d3 = W(pu, pv - 5); t += 'M' + f1(a[0]) + ',' + f1(a[1]) + ' L' + f1(b2[0]) + ',' + f1(b2[1]) + ' L' + f1(c2[0]) + ',' + f1(c2[1]) + ' L' + f1(d3[0]) + ',' + f1(d3[1]) + ' Z '; } return t; }
  s += '<rect x="-1900" y="-1800" width="5000" height="2300" fill="' + G('mur') + '"/>';
  if(f === 0){ for(r = 0; r*54 < H; r++){ var dec = (r % 2)*50; for(u = u0 + dec; u < u1; u += 100) d += rect(u + 4, r*54 + 3, u + 96, r*54 + 51); }
    s += '<path d="' + d + '" fill="' + cl + '" fill-opacity="' + (ti ? .1 : .035) + '" stroke="rgba(10,6,20,.32)" stroke-width="3" stroke-linejoin="round"/>'; }
  else if(f === 1){ for(u = u0; u < u1; u += 64){ d += rect(u, 0, u + 30, H); d2 += rect(u + 40, 0, u + 44, H); }
    s += '<path d="' + d + '" fill="' + cl + '" fill-opacity="' + op + '"/><path d="' + d2 + '" fill="' + cl + '" fill-opacity="' + (op*.8) + '"/>'; }
  else if(f === 2 || f === 4){ for(v = 40; v < H; v += 90) for(u = u0 + ((v/90 | 0) % 2)*45; u < u1; u += 90) d += f === 2 ? etoile(u, v, 11) : fleur(u, v);
    s += '<path d="' + d + '" fill="' + cl + '" fill-opacity="' + (op*1.35) + '"/>'; }
  else { for(u = u0 + 14; u < u1; u += 120) d += rect(u, 22, u + 92, 172);
    s += '<path d="' + rect(u0, 0, u1, 196) + '" fill="' + (ti ? sombre(THEMES[ti].c, .35) : '#3a2418') + '" fill-opacity="' + (ti ? .55 : .7) + '"/><path d="' + d + '" fill="none" stroke="' + cl + '" stroke-opacity="' + (op*1.8) + '" stroke-width="4" stroke-linejoin="round"/>' +
      '<path d="' + rect(u0, 196, u1, 210) + '" fill="' + (ti ? sombre(THEMES[ti].c, .2) : '#6b4a2a') + '" stroke="rgba(10,6,20,.3)" stroke-width="3"/>'; }
  /* le plancher, de chaque côté de la paillasse (on le voit sur un écran large) */
  s += '<rect x="-1900" y="462" width="5000" height="1700" fill="#5a3a24"/>';
  for(u = -1500; u < 2700; u += 132) s += '<path d="M' + u + ',462 L' + f1(600 + (u - 600)*2.2) + ',1760" stroke="rgba(40,20,10,.45)" stroke-width="3" fill="none"/>';
  return s + '<rect x="-1900" y="462" width="5000" height="60" fill="' + G('piedMur') + '"/><rect x="-1900" y="150" width="5000" height="90" fill="' + G('dessous') + '" transform="rotate(180 600 195)" opacity=".5"/>';
}
/* Le plateau (sa matière dépend de la paillasse choisie), son chant, le tablier, et ce qu'il y a dessous */
function plateau(){
  var p = palettePlateau(), b = paletteBois(), Rn = rng(21), s = '', i, y, q = 'M30,478 L1170,478 L' + f1(xP(570, YB)) + ',' + YB + ' L' + f1(xP(-570, YB)) + ',' + YB + ' Z';
  /* le bas du meuble (visible sur un écran haut) : pieds, portes, petits tiroirs ou tréteaux selon la forme */
  s += '<rect x="20" y="640" width="1160" height="640" fill="rgba(10,6,20,.35)"/>';
  if(ST.paF === 0) s += R(40, 650, 52, 560, 4, G('pTablier')) + R(1108, 650, 52, 560, 4, G('pTablier')) + R(92, 900, 1016, 34, 4, G('pFonce'));
  else if(ST.paF === 1) s += R(44, 650, 1112, 560, 6, G('pTablier')) + R(70, 676, 506, 500, 8, G('pTiroir')) + R(624, 676, 506, 500, 8, G('pTiroir')) + Cir(556, 920, 9, G('laitonV')) + Cir(644, 920, 9, G('laitonV'));
  else if(ST.paF === 2) [70, 380, 800, 1110].forEach(function(x){ s += T('M' + x + ',650 q-14,280 0,560', K, 26) + T('M' + x + ',650 q-14,280 0,560', '#f5b945', 14); });
  else if(ST.paF === 3){ s += R(44, 650, 1112, 560, 6, G('pTablier')); for(i = 0; i < 8; i++) s += R(64 + (i % 4)*272, 672 + Math.floor(i/4)*120, 256, 104, 6, G('pTiroir')) + Cir(192 + (i % 4)*272, 724 + Math.floor(i/4)*120, 8, G('laitonV')); }
  else [150, 1050].forEach(function(x){ s += T('M' + (x - 90) + ',650 L' + (x + 90) + ',1210 M' + (x + 90) + ',650 L' + (x - 90) + ',1210', K, 30) + T('M' + (x - 90) + ',650 L' + (x + 90) + ',1210 M' + (x + 90) + ',650 L' + (x - 90) + ',1210', b.V[1], 18); });
  /* le tablier et ses montants */
  s += R(30, 496, 1140, 160, 0, G('pTablier'));
  if(ST.paF !== 2) s += grainBois(34, 500, 1132, 152, 6, 23, b.F[1], .32);
  s += '<rect x="30" y="496" width="1140" height="22" fill="' + G('dessous') + '"/>';
  /* le dessus */
  s += '<clipPath id="clipPlateau"><path d="' + q + '"/></clipPath>' + P(q, G('pPlateau')) + '<g clip-path="url(#clipPlateau)">';
  if(p.sorte === 'bois' || p.sorte === 'planches'){
    [.27, .52, .76].forEach(function(t){ y = yT(t); s += T('M' + f1(xP(-575, y)) + ',' + f1(y) + ' H' + f1(xP(575, y)), p.joint, p.sorte === 'planches' ? 4 : 2.4, ' opacity=".8"'); if(p.sorte === 'planches') s += Cir(xP(-548, y) , y - 9, 3, '#5f5872') + Cir(xP(548, y), y - 9, 3, '#5f5872'); });
    for(i = 0; i < 20; i++){ var t = (i + .2 + Rn()*.6)/20; y = yT(t); var ph = Rn()*6, am = 1 + Rn()*2.4, d = '', x0 = xP(-575, y), x1 = xP(575, y);
      for(var x = x0; x <= x1; x += 24) d += (d ? ' L' : 'M') + f1(x) + ',' + f1(y + Math.sin(x/47 + ph)*am);
      s += '<path d="' + d + '" fill="none" stroke="' + b.veine + '" stroke-width="' + (1 + Rn()*1.4).toFixed(1) + '" opacity=".34"/>'; }
    s += noeud(1000, 462, 13, .44) + noeud(120, 396, 10, .42) + noeud(480, 262, 8, .36) + noeud(712, 470, 7, .44);
    s += '<ellipse cx="344" cy="424" rx="34" ry="14" fill="none" stroke="rgba(110,50,20,.3)" stroke-width="3"/><ellipse cx="1076" cy="356" rx="20" ry="8" fill="rgba(60,30,90,.22)"/>' + T('M88,446 l44,5 M738,300 l34,-4 M560,468 l30,2', 'rgba(60,30,10,.4)', 2);
  } else if(p.sorte === 'pierre'){
    for(i = 0; i < 260; i++){ y = YB + Rn()*(YF - YB); s += '<circle cx="' + f1(xP((Rn() - .5)*1140, y)) + '" cy="' + f1(y) + '" r="' + f1(1 + Rn()*2.6) + '" fill="' + (Rn() < .5 ? 'rgba(30,24,60,.22)' : 'rgba(255,255,255,.3)') + '"/>'; }
    s += T('M250,250 l40,22 l-14,30 l52,34 M980,470 l-46,-28 l10,-20', 'rgba(40,30,70,.35)', 2.4);
  } else {
    s += T('M120,300 C260,320 300,270 440,300 S640,360 760,330 S980,290 1090,330 M200,440 C340,420 420,470 560,440 S820,420 1000,460 M520,250 C580,270 640,250 720,268', p.joint, 3, ' opacity=".55"') +
      T('M150,376 C240,360 300,392 380,372 M700,400 C780,384 860,412 960,392', p.joint, 1.8, ' opacity=".45"');
  }
  s += '<path d="M30,478 L1170,478 L1166,456 L34,456 Z" fill="#fff" opacity=".07"/></g>';
  s += R(30, 478, 1140, 18, 3, G('pChant')) + reflet('M40,482 H1160', 2.5, .35);
  return s;
}
/* La façade d'un tiroir (dans son repère : coin en haut à gauche), avec sa plaque et sa poignée */
function facadeTiroir(t){
  var w = TIR.w, h = TIR.h, b = paletteBois(), s = R(0, 0, w, h, 6, G('pTiroir')) + '<rect x="9" y="8" width="' + (w - 18) + '" height="' + (h - 16) + '" rx="4" fill="none" stroke="' + (ST.paF === 2 ? '#c9a23a' : b.F[1]) + '" stroke-width="2.5" opacity=".5"/>';
  if(ST.paF !== 2) s += grainBois(6, 5, w - 12, h - 10, 5, 30 + (t === 'g' ? 1 : 2), b.F[1], .28);
  s += reflet('M8,4 h' + (w - 16), 2.5, .35) + R(w/2 - 122, 10, 244, 52, 5, '#fff6d8', ' stroke-width="3"') +
    TIROIRS[t].map(function(k, n){ return picto(k, w/2 - 80 + n*80, 28, 24) + txt(w/2 - 80 + n*80, 50, 14, CASIERS[k]); }).join('') +
    R(w/2 - 50, 72, 100, 26, 9, G('laitonV'), ' stroke-width="3.5"') + T('M' + (w/2 - 30) + ',85 q30,28 60,0', K, 10) + T('M' + (w/2 - 30) + ',85 q30,28 60,0', '#f5b945', 5) + Cir(w/2 - 30, 85, 3.5, '#8a5a12') + Cir(w/2 + 30, 85, 3.5, '#8a5a12');
  return s;
}
/* Un tiroir, fermé ou tiré vers nous (p de 0 à 1) : on voit alors l'intérieur, ses parois, ses trois casiers */
function dessinerTiroir(t){
  var g = $('#tir-' + t); if(!g) return; var p = S.tirP[t], x0 = TIR[t], w = TIR.w, kf = 1 + .22*p, px = 600 + (x0 - 600)*kf, py = TIR.y + 170*p, pw = w*kf, s = '';
  if(p > 0.01){
    s += F('M' + x0 + ',' + TIR.y + ' L' + (x0 + 4) + ',' + (TIR.y + 3) + ' L' + f1(px + 9*kf) + ',' + f1(py + 5) + ' L' + f1(px) + ',' + f1(py) + ' Z', G('pFonce'), ' stroke="' + K + '" stroke-width="3" stroke-linejoin="round"') +
      F('M' + (x0 + w) + ',' + TIR.y + ' L' + (x0 + w - 4) + ',' + (TIR.y + 3) + ' L' + f1(px + pw - 9*kf) + ',' + f1(py + 5) + ' L' + f1(px + pw) + ',' + f1(py) + ' Z', G('pFonce'), ' stroke="' + K + '" stroke-width="3" stroke-linejoin="round"') +
      F('M' + (x0 + 4) + ',' + (TIR.y + 3) + ' L' + (x0 + w - 4) + ',' + (TIR.y + 3) + ' L' + f1(px + pw - 9*kf) + ',' + f1(py + 5) + ' L' + f1(px + 9*kf) + ',' + f1(py + 5) + ' Z', G('feutre'), ' stroke="' + K + '" stroke-width="3" stroke-linejoin="round"');
    [1/3, 2/3].forEach(function(q){ var d = 'M' + f1(x0 + w*q) + ',' + (TIR.y + 3) + ' L' + f1(px + pw*q) + ',' + f1(py + 5); s += T(d, K, 7) + T(d, paletteBois().V[1], 3.5); });
    s += '<path d="M' + (x0 + 4) + ',' + (TIR.y + 3) + ' L' + (x0 + w - 4) + ',' + (TIR.y + 3) + ' L' + f1(x0 + w - 4 + (px + pw - 9*kf - x0 - w + 4)*.22) + ',' + f1(TIR.y + 3 + (py + 2 - TIR.y)*.22) + ' L' + f1(x0 + 4 + (px + 9*kf - x0 - 4)*.22) + ',' + f1(TIR.y + 3 + (py + 2 - TIR.y)*.22) + ' Z" fill="rgba(8,4,16,.42)"/>';
  }
  s += '<g transform="translate(' + f1(px) + ',' + f1(py) + ') scale(' + kf.toFixed(3) + ')">' + (p < .01 ? '<rect class="rond" x="-6" y="-6" width="' + (w + 12) + '" height="' + (TIR.h + 12) + '" rx="10"/>' : '') + facadeTiroir(t) + '</g>';
  g.innerHTML = s; g.classList.toggle('tire', p > .01);
}
function etagere(){
  var s = ombre(600, 262, 230, 8, .4) + P('M388,244 L812,244 L806,218 L394,218 Z', G('boisH'), ' stroke-width="3.5"') + R(388, 244, 424, 16, 3, G('boisS'), ' stroke-width="3.5"') + reflet('M394,247 H806', 2, .3) + R(400, 258, 22, 8, 2, G('boisS'), ' stroke-width="3"') + R(778, 258, 22, 8, 2, G('boisS'), ' stroke-width="3"');
  BOCAUX.forEach(function(b){ s += bocal(b); });
  return s;
}
/* Un bocal vu d'un peu haut : on voit le dessus du bouchon de liège */
function bocal(b){
  var x = b.x, y = b.y, s = '<g id="bocal-' + b.k + '" data-act="goutte" data-outil="goutte" data-k="' + b.k + '" tabindex="0" role="button" aria-label="Bocal : ' + b.nom.join(' ') + '"><rect class="rond" x="' + (x-37) + '" y="' + (y-98) + '" width="74" height="114" rx="13"/>';
  if(b.poudre) s += '<path d="M' + (x-26) + ',' + (y-16) + ' Q' + x + ',' + (y-42) + ' ' + (x+26) + ',' + (y-16) + ' L' + (x+26) + ',' + (y-3) + ' A26,9.5 0 0 1 ' + (x-26) + ',' + (y-3) + ' Z" fill="#f6f4ee"/>' + [[-8,-20],[6,-25],[13,-14],[-14,-12]].map(function(q){ return '<circle cx="' + (x+q[0]) + '" cy="' + (y+q[1]) + '" r="1.4" fill="#cfcac0"/>'; }).join('');
  else s += '<path d="M' + (x-26) + ',' + (y-46) + ' L' + (x-26) + ',' + (y-3) + ' A26,9.5 0 0 0 ' + (x+26) + ',' + (y-3) + ' L' + (x+26) + ',' + (y-46) + ' Z" fill="' + b.liq + '" opacity="' + b.a + '"/><ellipse cx="' + x + '" cy="' + (y-46) + '" rx="26" ry="9" fill="' + clair(b.liq, .4) + '" opacity="' + b.a + '"/>';
  s += '<path d="M' + (x-29) + ',' + (y-60) + ' L' + (x-29) + ',' + (y-2) + ' A29,10.5 0 0 0 ' + (x+29) + ',' + (y-2) + ' L' + (x+29) + ',' + (y-60) + ' Q' + (x+29) + ',' + (y-70) + ' ' + (x+19) + ',' + (y-72) + ' L' + (x-19) + ',' + (y-72) + ' Q' + (x-29) + ',' + (y-70) + ' ' + (x-29) + ',' + (y-60) + ' Z" fill="rgba(220,245,255,.22)" stroke="' + K + '" stroke-width="3.5" stroke-linejoin="round"/>' +
    '<ellipse cx="' + x + '" cy="' + (y-72) + '" rx="19" ry="7" fill="rgba(220,245,255,.35)" stroke="' + K + '" stroke-width="3"/>' +
    '<path d="M' + (x-15) + ',' + (y-86) + ' L' + (x-15) + ',' + (y-73) + ' A15,5.5 0 0 0 ' + (x+15) + ',' + (y-73) + ' L' + (x+15) + ',' + (y-86) + ' Z" fill="' + G('boisC') + '" stroke="' + K + '" stroke-width="3" stroke-linejoin="round"/>' +
    '<ellipse cx="' + x + '" cy="' + (y-86) + '" rx="15" ry="5.5" fill="#e8b47e" stroke="' + K + '" stroke-width="3"/>' + [[-6,-87],[3,-85],[7,-88],[-1,-84]].map(function(q){ return '<circle cx="' + (x+q[0]) + '" cy="' + (y+q[1]) + '" r="1" fill="#9a6a3a"/>'; }).join('') +
    reflet('M' + (x-22) + ',' + (y-56) + ' L' + (x-22) + ',' + (y-10), 4, .45) + reflet('M' + (x-14) + ',' + (y-56) + ' L' + (x-14) + ',' + (y-44), 2, .3) +
    '<g transform="rotate(-3 ' + x + ' ' + (y-26) + ')">' + R(x-25, b.nom.length > 1 ? y-41 : y-36, 50, b.nom.length > 1 ? 29 : 20, 3, '#fff6d8', ' stroke-width="2.5"') +
    (b.nom.length > 1 ? txt(x, y-33, 13, b.nom[0]) + txt(x, y-20, 13, b.nom[1]) : txt(x, y-26, b.nom[0].length > 5 ? 12.5 : 15, b.nom[0])) + '</g>';
  if(b.vapeur) s += '<g class="vapeur">' + T('M' + (x-6) + ',' + (y-94) + ' q-5,-7 0,-14 q5,-7 0,-14', '#dff6ff', 2.8, ' opacity=".7"') + '</g><g class="vapeur v2">' + T('M' + (x+7) + ',' + (y-94) + ' q-5,-7 0,-14 q5,-7 0,-14', '#dff6ff', 2.8, ' opacity=".7"') + '</g>';
  return s + '<rect x="' + (x-38) + '" y="' + (y-98) + '" width="76" height="114" fill="transparent"/></g>';
}
function artBougie(){
  return T('M19,-1 c14,-2 14,-15 1,-12', K, 6.5) + T('M19,-1 c14,-2 14,-15 1,-12', '#f5b945', 2.8) + Ell(0, 0, 23, 10, G('laiton')) + '<ellipse cx="0" cy="-2" rx="17" ry="6.5" fill="#c98a1c" stroke="' + K + '" stroke-width="2"/>' + R(-8.5, -11, 17, 10, 3, G('laiton'), ' stroke-width="3"') +
    R(-7, -52, 14, 43, 3, G('cire'), ' stroke-width="3"') + F('M-6,-51 c1,12 3,12 4,3 c1,9 3,15 4.5,5 c1,6 2.5,6 3.5,-3 l0,-5 Z', '#fffdf4') + '<ellipse cx="0" cy="-52" rx="7" ry="2.6" fill="#fffdf4" stroke="' + K + '" stroke-width="2"/>' + T('M0,-52 v-5', K, 2) +
    '<g class="flamme"><path d="M0,-55 C-9,-65 -5,-77 0,-89 C5,-77 9,-65 0,-55 Z" fill="' + G('flamme') + '" stroke="#e8693c" stroke-width="2"/><path d="M0,-57 C-4,-63 -2,-69 0,-75 C2,-69 4,-63 0,-57 Z" fill="#fff7c2"/></g>';
}
function bougieScene(){
  var x = BOUGIE.x, y = BOUGIE.y;
  return '<g id="gLampe" data-act="flamme" data-outil="flamme" tabindex="0" role="button" aria-label="La bougie"><rect class="rond" x="' + (x-40) + '" y="' + (y-112) + '" width="84" height="130" rx="16"/>' + ombre(x + 5, y + 8, 34, 9, .45) +
    '<circle cx="' + x + '" cy="' + (y - 78) + '" r="52" fill="' + G('halo') + '" opacity=".6"/><g transform="translate(' + x + ',' + y + ') scale(' + BOUGIE.e + ')">' + artBougie() + '</g>' +
    '<rect x="' + (x-40) + '" y="' + (y-112) + '" width="84" height="130" fill="transparent"/></g>';
}
/* L'ardoise posée contre le mur, au fond du plateau : c'est là que s'écrit le code à transmettre */
function ardoiseScene(){
  return '<g transform="translate(-22,0)">' + ombre(334, 268, 46, 6, .4) + '<g transform="rotate(-2 331 262)">' + R(290, 150, 82, 114, 4, G('boisS')) + '<rect x="297" y="157" width="68" height="100" rx="2" fill="' + G('ardoise') + '" stroke="' + K + '" stroke-width="2.5"/>' +
    '<path d="M300,172 q20,-10 62,-4 M302,240 q30,8 60,-2" stroke="#fff" stroke-width="5" opacity=".05" fill="none"/><g id="ardoise"></g></g></g>';
}
function majArdoise(){
  var g = $('#ardoise'); if(!g) return; var pret = S.trouves.fil && S.trouves.noir, craie = ' font-family="Caveat, cursive" font-weight="700" text-anchor="middle" fill="#f4f1ea"';
  if(!pret){ g.innerHTML = '<path d="M323,200 l0,-14 l-5,0 l0,-5 l26,0 l0,5 l-5,0 l0,14 l11,20 q2,7 -6,7 l-26,0 q-8,0 -6,-7 Z" fill="none" stroke="#f4f1ea" stroke-width="2" opacity=".5" stroke-linejoin="round"/><path d="M316,216 h30" stroke="#f4f1ea" stroke-width="2" opacity=".35"/>'; return; }
  g.innerHTML = '<text x="331" y="176" font-size="13"' + craie + '>pour le</text><text x="331" y="190" font-size="15"' + craie + '>Barde</text><text class="chiffres" x="331" y="224" font-size="32"' + craie.replace('#f4f1ea', '#ffe9a3') + '>' + TXT.code + '</text><path d="M308,238 q23,7 46,-1" stroke="#f4f1ea" stroke-width="2.5" fill="none" stroke-linecap="round"/>';
}
/* Le microscope de laiton, avec sa grosse molette ×10, ×40, ×100 */
function microscopeScene(){
  var x = MICRO.x, y = MICRO.y, s = '<g id="gMicro" data-act="micro" data-outil="micro" tabindex="0" role="button" aria-label="Le microscope"><rect class="rond" x="826" y="96" width="166" height="232" rx="18"/>' + ombre(x + 8, y + 8, 60, 12, .5) + '<g transform="translate(' + x + ',' + y + ') scale(' + MICRO.e + ')">';
  s += Ell(0, 0, 46, 19, G('fer')) + '<ellipse cx="0" cy="-5" rx="39" ry="14" fill="#5f5872" stroke="' + K + '" stroke-width="2.5"/>' + reflet('M-30,-8 Q0,-17 28,-10', 2.5, .35);
  s += R(-30, -78, 13, 74, 3, G('laiton'), ' stroke-width="3.5"') + T('M-8,-24 L2,-38 M-8,-24 L-18,-38', K, 3) + Ell(-8, -41, 13, 7.5, '#d9e6f0', ' stroke-width="3"') + reflet('M-15,-43 l9,-2', 2, .8);
  s += P('M-50,-66 L32,-66 L40,-50 L-58,-50 Z', G('fer')) + T('M-42,-58 l14,0 M12,-58 l14,0', '#f5b945', 3) + '<ellipse cx="-6" cy="-58" rx="8" ry="3" fill="#0f0b18"/>' + R(-24, -70, 36, 5, 1, 'rgba(225,245,255,.85)', ' stroke-width="1.5"') + T('M-18,-67.5 h24', ROUGE, 1.6);
  s += T('M-24,-76 C-70,-96 -70,-158 -8,-158', K, 20) + T('M-24,-76 C-70,-96 -70,-158 -8,-158', '#e0a23a', 12) + reflet('M-34,-88 C-62,-104 -60,-146 -22,-154', 3, .45);
  s += '<g transform="rotate(16 -8 -116)">' + R(-19, -168, 24, 96, 5, G('laiton')) + T('M-19,-146 h24 M-19,-120 h24 M-19,-96 h24', '#8a5a12', 2.5) + reflet('M-13,-162 V-80', 3, .45) +
    R(-17, -190, 20, 24, 4, G('fer')) + Ell(-7, -190, 11, 4.5, '#bff3ff', ' stroke-width="3"') + Ell(-7, -71, 15, 6, G('laitonV'), ' stroke-width="3"') +
    [[10, -16, 15], [40, -6, 11], [100, 3, 8]].map(function(o){ return '<g class="obj" data-obj="' + o[0] + '">' + R(o[1], -69 + (15 - o[2])*.3, 8, o[2], 2.5, o[0] === 10 ? G('fer') : G('laitonV'), ' stroke-width="2.5"') + '</g>'; }).join('') + '</g>';
  /* la molette */
  s += '<circle cx="-62" cy="-114" r="33" fill="rgba(8,4,16,.35)" filter="url(#flou2)"/><g id="moletteG" data-act="molette" role="button" aria-label="La molette des grossissements"><circle class="rond toujours-micro" cx="-64" cy="-118" r="37"/>' +
    '<g id="molette" style="transform-origin:-64px -118px">' + '<circle cx="-64" cy="-118" r="31" fill="' + G('laiton') + '" stroke="' + K + '" stroke-width="3.5"/><circle cx="-64" cy="-118" r="27.5" fill="none" stroke="#8a5a12" stroke-width="5" stroke-dasharray="2 2.6"/>' +
    '<circle cx="-64" cy="-118" r="23.5" fill="#f7cd6a" stroke="' + K + '" stroke-width="2.2"/>' +
    [[10, 0], [40, 120], [100, 240]].map(function(z){ return '<g class="num" data-zoom="' + z[0] + '" transform="rotate(' + z[1] + ' -64 -118)"><circle cx="-64" cy="-133" r="11" fill="transparent"/>' +
      '<text x="-64" y="-132.5" font-size="' + (z[0] === 100 ? 8.6 : 10) + '" font-weight="700" text-anchor="middle" dominant-baseline="central" fill="#35281b" font-family="Andika, sans-serif">×' + z[0] + '</text></g>'; }).join('') +
    Cir(-64, -118, 5, '#3a3450') + '</g>' + P('M-70,-157 L-58,-157 L-64,-147 Z', '#e8343c', ' stroke-width="2.2"') + '</g>';
  return s + '</g><rect x="828" y="98" width="162" height="228" fill="transparent" class="prise-micro"/></g>';
}
/* Le bocal à bandelettes et le carnet de teintures : le test des couleurs */
function testScene(){
  var x = TESTP.x, y = TESTP.y, s = '<g id="gTest" data-act="test" data-outil="test" tabindex="0" role="button" aria-label="Le bocal à bandelettes et le carnet de teintures"><rect class="rond" x="104" y="256" width="284" height="140" rx="18"/>' + ombre(x + 6, y + 8, 44, 11, .45) + ombre(320, 372, 62, 8, .4) + '<g transform="translate(-68,8)">';
  /* le carnet ouvert, avec ses bandelettes témoins */
  s += P('M330,360 L446,360 L438,314 L338,314 Z', '#7a3a4a', ' stroke-width="3.5"') + P('M335,356 L388,356 L388,317 L342,317 Z', G('parchemin'), ' stroke-width="2.5"') + P('M388,356 L441,356 L434,317 L388,317 Z', G('parchemin'), ' stroke-width="2.5"') +
    TEINTES.map(function(t, n){ var gx = (n < 4 ? 344 : 394) + (n % 4)*10.5, gy = 322; return '<rect x="' + gx + '" y="' + gy + '" width="7" height="29" fill="#fffaf0" stroke="' + K + '" stroke-width="1"/><rect x="' + (gx + .8) + '" y="' + (gy + 8 + (n % 3)*4) + '" width="5.4" height="6" fill="' + t.c + '"/>'; }).join('') + T('M388,317 V358', K, 2.5) + T('M412,316 q4,28 -2,50', '#e8343c', 3) + '</g>';
  /* le bocal : un fond d'alcool, une baguette en travers, la bandelette qui pend */
  s += '<path d="M' + (x-31) + ',' + (y-30) + ' L' + (x-31) + ',' + (y-4) + ' A31,12.5 0 0 0 ' + (x+31) + ',' + (y-4) + ' L' + (x+31) + ',' + (y-30) + ' Z" fill="#cfeaf6" opacity=".7"/><ellipse cx="' + x + '" cy="' + (y-30) + '" rx="31" ry="11" fill="#e4f6ff" opacity=".7"/>' +
    '<g id="bandeScene"></g>' +
    '<path d="M' + (x-35) + ',' + (y-100) + ' L' + (x-35) + ',' + (y-3) + ' A35,14 0 0 0 ' + (x+35) + ',' + (y-3) + ' L' + (x+35) + ',' + (y-100) + '" fill="rgba(220,245,255,.2)" stroke="' + K + '" stroke-width="3.5" stroke-linejoin="round"/>' +
    '<ellipse cx="' + x + '" cy="' + (y-100) + '" rx="35" ry="13" fill="rgba(220,245,255,.16)" stroke="' + K + '" stroke-width="3.5"/>' + reflet('M' + (x-27) + ',' + (y-90) + ' V' + (y-16), 4.5, .45) + reflet('M' + (x-18) + ',' + (y-88) + ' V' + (y-66), 2.4, .3) +
    T('M' + (x-44) + ',' + (y-101) + ' L' + (x+44) + ',' + (y-99), K, 8) + T('M' + (x-44) + ',' + (y-101) + ' L' + (x+44) + ',' + (y-99), '#c98450', 4);
  return s + '<rect x="106" y="258" width="280" height="136" fill="transparent"/></g>';
}
function majBandeScene(){
  var g = $('#bandeScene'); if(!g) return; var x = TESTP.x, y = TESTP.y, s = R(x - 9, y - 100, 18, 84, 1, '#fffaf0', ' stroke-width="2"') + T('M' + (x-9) + ',' + (y-26) + ' h18', 'rgba(70,70,80,.6)', 1.2);
  if(S.bande > 0) CIBLES[S.niveau].forEach(function(k){ teinte(k).b.forEach(function(b){ s += '<rect x="' + (x - 7.5) + '" y="' + f1(y - 26 - b.y*70 - b.h*30) + '" width="15" height="' + f1(Math.max(3, b.h*60)) + '" fill="' + b.c + '" opacity="' + (b.a || .9) + '"/>'; }); });
  g.innerHTML = s;
}
function loupeScene(){
  var x = LOUPE.x, y = LOUPE.y, rx = 54, ry = 25;
  return '<g id="gLoupe" data-act="loupe" data-outil="loupe" tabindex="0" role="button" aria-label="La loupe"><ellipse class="rond" cx="' + (x + 34) + '" cy="' + (y + 6) + '" rx="108" ry="40"/><g id="loupeMobile">' + ombre(x + 10, y + 14, 62, 16, .4) +
    '<g transform="translate(' + (x + 50) + ',' + (y + 9) + ') rotate(9)">' + R(0, -8.5, 72, 17, 8.5, G('bois'), ' stroke-width="3.5"') + T('M18,-8 V8 M31,-8 V8 M44,-8 V8', '#5a3418', 1.8) + reflet('M6,-4 H66', 2.4, .4) + R(-10, -10.5, 15, 21, 4, G('laiton'), ' stroke-width="3"') + Cir(72, 0, 6.5, G('laitonV'), ' stroke-width="2.5"') + '</g>' +
    Ell(x, y, rx, ry, G('laiton')) + '<ellipse cx="' + x + '" cy="' + (y - 2) + '" rx="' + (rx - 9) + '" ry="' + (ry - 6) + '" fill="rgba(205,240,255,.6)" stroke="' + K + '" stroke-width="2.5"/>' +
    reflet('M' + (x - 34) + ',' + (y - 8) + ' Q' + (x - 18) + ',' + (y - 17) + ' ' + (x + 4) + ',' + (y - 17), 3.5, .85) + '</g>' +
    '<rect x="' + (x - 64) + '" y="' + (y - 34) + '" width="200" height="74" fill="transparent"/></g>';
}
/* Le carré de cuir où sont posés les échantillons : une étiquette « n° 1 » et un tout petit bout de fil */
function cuirScene(){
  var q = 'M' + f1(xP(-118, 456)) + ',456 L' + f1(xP(118, 456)) + ',456 L' + f1(xP(118, 368)) + ',368 L' + f1(xP(-118, 368)) + ',368 Z', q2 = 'M' + f1(xP(-108, 449)) + ',449 L' + f1(xP(108, 449)) + ',449 L' + f1(xP(108, 375)) + ',375 L' + f1(xP(-108, 375)) + ',375 Z';
  return '<g id="gLame" class="objet" data-act="lame" tabindex="0" role="button" aria-label="L\'échantillon numéro 1, sur le carré de cuir"><ellipse class="rond" cx="600" cy="412" rx="132" ry="56"/>' + ombre(604, 420, 122, 44, .3) +
    P(q, G('cuir'), ' stroke-width="3.5"') + '<path d="' + q2 + '" fill="none" stroke="#6e4226" stroke-width="1.8" stroke-dasharray="6 5" opacity=".75"/><path d="' + q2 + '" fill="#fff" opacity=".06"/>' +
    '<g transform="rotate(-6 536 392)">' + R(514, 382, 44, 20, 3, '#fff6d8', ' stroke-width="2.2"') + txt(536, 392.5, 12, 'n° 1') + '</g><g id="filLame"></g>' +
    '<rect x="470" y="358" width="260" height="106" fill="transparent"/></g>';
}
function dessinerLame(){
  /* de loin, l'échantillon n'est qu'un tout petit trait : c'est la loupe qui montre ce que c'est */
  var d = 'M592,416 q5,-4 10,0 t10,0 t9,-1', s = T(d, K, 4.6) + T(d, ROUGE, 2.2);
  if(S.trouves.fil) s += '<text x="676" y="380" font-size="20" text-anchor="middle" dominant-baseline="central">✅</text>';
  var g = $('#filLame'); if(g) g.innerHTML = s;
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
  COUPES.forEach(function(q, i){
    var g = $('#coupe' + i), c = S.coupes[i], x = q[0], y = q[1]; if(!g) return;
    g.innerHTML = (c ? '<ellipse class="rond" cx="' + x + '" cy="' + (y - 7) + '" rx="45" ry="25"/>' : '') + coupelle(x, y, 36, c) +
      (c && S.trouves[c.t] ? '<text x="' + (x + 30) + '" y="' + (y - 32) + '" font-size="17" text-anchor="middle" dominant-baseline="central">✅</text>' : '') +
      (c ? '<rect x="' + (x - 42) + '" y="' + (y - 34) + '" width="84" height="56" fill="transparent"/>' : '');
    g.classList.toggle('objet', !!c); g.classList.toggle('sel', !!c && S.sel === c.t);
    if(c){ g.setAttribute('tabindex', '0'); g.setAttribute('role', 'button'); g.setAttribute('aria-label', 'Coupelle : ' + OBJETS[c.t].nom); } else { g.removeAttribute('tabindex'); g.removeAttribute('role'); g.removeAttribute('aria-label'); }
  });
}
function posCible(){ if(S.sel === 'fil' || !S.sel) return {x:606, y:414}; var i = S.coupes.findIndex(function(c){ return c && c.t === S.sel; }); return {x:COUPES[i][0], y:COUPES[i][1] - 9}; }
function dessinerScene(){
  var s = defs() + mur() + plateau();
  s += '<g id="tir-g" data-act="tiroir" data-outil="tiroir" data-t="g" tabindex="0" role="button" aria-label="Tiroir : ' + TIROIRS.g.map(function(k){ return CASIERS[k]; }).join(', ') + '"></g>' +
       '<g id="tir-d" data-act="tiroir" data-outil="tiroir" data-t="d" tabindex="0" role="button" aria-label="Tiroir : ' + TIROIRS.d.map(function(k){ return CASIERS[k]; }).join(', ') + '"></g>';
  /* sur le plateau, du fond vers le devant */
  s += bougieScene() + ardoiseScene() + etagere() + microscopeScene() + testScene() + cuirScene() + loupeScene();
  COUPES.forEach(function(q, i){ s += '<g data-act="coupe" data-i="' + i + '" id="coupe' + i + '"></g>'; });
  /* la pipette et la pince (cachées : elles servent aux expériences) */
  s += '<g id="pipette" style="display:none">' + R(-6, -84, 12, 72, 5, 'rgba(220,245,255,.85)', ' stroke-width="3"') + P('M-11,-110 C-11,-127 11,-127 11,-110 L8,-84 L-8,-84 Z', '#d9603a', ' stroke-width="3"') + '<rect id="pipLiq" x="-3.5" y="-40" width="7" height="26" fill="#9fd8ff"/></g>';
  s += '<g id="goutte" style="display:none"><path d="M0,-10 C6,-1 7,5 0,10 C-7,5 -6,-1 0,-10 Z" stroke="' + K + '" stroke-width="2"/></g>';
  s += '<g id="pince" style="display:none">' + T('M0,0 L-12,-84 M0,0 L12,-84', K, 8) + T('M0,0 L-12,-84 M0,0 L12,-84', '#c9c4de', 3.5) + '<circle id="pinceBout" cx="0" cy="2" r="6" fill="#b3262f" stroke="' + K + '" stroke-width="2"/></g>';
  s += '<g id="effets"></g><rect x="-1900" y="-1800" width="5000" height="4000" fill="' + G('vignette') + '" pointer-events="none"/>';
  $('#scene').innerHTML = s;
  dessinerTiroir('g'); dessinerTiroir('d'); dessinerLame(); dessinerCoupes(); majArdoise(); majBandeScene(); majMolette();
}
