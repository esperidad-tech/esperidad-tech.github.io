/* ==========================================================
   Brumeval v2 — les dessins du mini-jeu « Le chaudron » (23 novembre 2026, go de Romain à 9 h 31 ; Bible §13.91)
   Tout ce qui se DESSINE dans le chaudron refait, sans aucune règle du jeu (les règles : mj-chaudron.js) :
   - svg(id)        le chaudron, son feu, ses six bûches, la flèche à deux pointes (repère du jeu : 400 unités de large,
                    le bord en y = 157, le sol en y = 392 ; la boîte du dessin : -30 0 460 462) ;
   - reserve(id)    la réserve de bois (le bouton « une bûche de plus ») ;
   - bocal(…)       un bocal de verre de l'étagère, vu d'un peu au-dessus, avec son ingrédient dessiné dedans ;
   - decor(L, id)   l'âtre de la cheminée de l'atelier, en perspective, à la taille de l'écran (L : mj-chaudron.js, disposer) ;
   - icFeu, icGivre les deux petits dessins du thermomètre.
   LA PERSPECTIVE (une seule règle pour tout) : le chaudron est vu d'un peu au-dessus, un rond posé à plat devient un ovale
   aplati à APLAT = 0,37. Les pieds, le lit de cendre et les bûches sont posés sur cet ovale ; le fond de l'âtre, ses côtés,
   ses dalles et le parquet fuient vers un même point (L.VP).
   Préfixe CSS : .mjc-   Chargé AVANT mj-chaudron.js (build.py). Dépend de mj-core.js.
   ========================================================== */
(function(){
'use strict';
var MJ = window.MJ;
if(!MJ){ console.error('mj-chaudron-dessin : mj-core.js doit être chargé avant.'); return; }
var K = '#24182e', APLAT = 0.37, COSV = Math.sqrt(1 - APLAT * APLAT);
function alea(seed){ var s = seed % 2147483647; if(s <= 0) s += 2147483646; return function(){ s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; }; }
function f(x){ return (Math.round(x * 10) / 10).toString(); }
function pts(a){ return a.map(function(p){ return f(p[0]) + ',' + f(p[1]); }).join(' '); }

/* ---------- les flammes : une langue en trois couches (rouge orangé, orange, jaune clair), au pied arrondi ---------- */
function flamme(cx, by, w, h, sway){
  return 'M' + f(cx - w / 2) + ',' + f(by) +
    ' C' + f(cx - w * .62) + ',' + f(by - h * .34) + ' ' + f(cx - w * .30 + sway * .2) + ',' + f(by - h * .56) + ' ' + f(cx - w * .12 + sway * .6) + ',' + f(by - h * .78) +
    ' C' + f(cx - w * .04 + sway * .8) + ',' + f(by - h * .88) + ' ' + f(cx + sway * .9 - w * .05) + ',' + f(by - h * .95) + ' ' + f(cx + sway) + ',' + f(by - h) +
    ' C' + f(cx + sway * .7 + w * .12) + ',' + f(by - h * .84) + ' ' + f(cx + w * .30 + sway * .3) + ',' + f(by - h * .62) + ' ' + f(cx + w * .20) + ',' + f(by - h * .42) +
    ' C' + f(cx + w * .44) + ',' + f(by - h * .5) + ' ' + f(cx + w * .58) + ',' + f(by - h * .24) + ' ' + f(cx + w / 2) + ',' + f(by) +
    ' C' + f(cx + w * .42) + ',' + f(by + w * .26) + ' ' + f(cx - w * .42) + ',' + f(by + w * .26) + ' ' + f(cx - w / 2) + ',' + f(by) + ' Z';
}
function langue(id, cx, by, w, h, sway, cl, sansCoeur){
  return '<g class="mjc-fl ' + cl + '" style="transform-origin:' + f(cx) + 'px ' + f(by) + 'px">' +
    '<path d="' + flamme(cx, by, w, h, sway) + '" fill="url(#mjcf1' + id + ')" stroke="#8c2410" stroke-width="2.2" stroke-linejoin="round"/>' +
    '<path d="' + flamme(cx + sway * .1, by + 1, w * .66, h * .72, sway * .7) + '" fill="url(#mjcf2' + id + ')"/>' +
    (sansCoeur ? '' : '<path d="' + flamme(cx + sway * .12, by + 2, w * .36, h * .44, sway * .45) + '" fill="#fff3b8"/>') + '</g>';
}
function flocon(r, c){
  var s = '';
  for(var i = 0; i < 3; i++) s += '<g transform="rotate(' + (i * 60) + ')"><path d="M0,' + (-r) + ' V' + r + ' M0,' + f(-r * .55) + ' l' + f(-r * .3) + ',' + f(-r * .3) + ' M0,' + f(-r * .55) + ' l' + f(r * .3) + ',' + f(-r * .3) + ' M0,' + f(r * .55) + ' l' + f(-r * .3) + ',' + f(r * .3) + ' M0,' + f(r * .55) + ' l' + f(r * .3) + ',' + f(r * .3) + '" stroke="' + c + '" stroke-width="' + f(r * .22) + '" stroke-linecap="round" fill="none"/></g>';
  return s;
}

/* ---------- une bûche couchée sur le sol ----------
   (x1,y1) = le bout coupé, vers nous ; (x2,y2) = le bout dans le feu. Une bûche est un cylindre : son corps garde la même épaisseur à
   l'écran, et son bout coupé est un ovale d'autant plus rond qu'elle pointe vers nous. On retrouve l'angle vrai de la bûche sur le sol
   d'après sa pente à l'écran (APLAT), et on en tire la largeur de l'ovale.
   .mjc-charbon et .mjc-ember : la bûche qui se consume noircit et rougeoie (mj-chaudron.js, rendu). */
var BUCHES = [[34, 410, 190, 381, 15], [368, 408, 212, 380, 15], [227, 433, 203, 394, 15.5], [88, 432, 192, 399, 13], [316, 434, 210, 400, 13], [124, 373, 270, 366, 12]];
function buche(id, i){
  var B = BUCHES[i], x1 = B[0], y1 = B[1], x2 = B[2], y2 = B[3], r = B[4];
  var dx = x2 - x1, dy = y2 - y1, L = Math.hypot(dx, dy), a = Math.atan2(dy, dx) * 180 / Math.PI, s = '', rr = alea(11 + i * 7), k;
  var phi = Math.atan2(Math.abs(dy) / APLAT, Math.abs(dx)), ov = Math.max(.2, Math.sin(phi) * COSV), re = r * (i === 2 ? .84 : .92), bas = dx < 0 ? -1 : 1;
  var gid = 'mjcb' + id + '_' + i, corps = 'M0,' + (-r) + ' L' + f(L - re * .5) + ',' + f(-re) + ' Q' + f(L) + ',' + f(-re) + ' ' + f(L) + ',0 Q' + f(L) + ',' + f(re) + ' ' + f(L - re * .5) + ',' + f(re) + ' L0,' + r + ' Z';
  s += '<g class="mjc-buche" data-i="' + i + '"><g transform="translate(' + f(x1) + ',' + f(y1) + ') rotate(' + f(a) + ')"><defs>' +
    '<linearGradient id="' + gid + '" x1="0" y1="' + (bas > 0 ? 0 : 1) + '" x2="0" y2="' + (bas > 0 ? 1 : 0) + '"><stop offset="0" stop-color="#b47a4b"/><stop offset=".3" stop-color="#8d5933"/><stop offset=".72" stop-color="#5f381d"/><stop offset="1" stop-color="#3a2010"/></linearGradient>' +
    '<clipPath id="c' + gid + '"><path d="' + corps + '"/></clipPath></defs>';
  /* le corps : l'écorce, un peu bosselée */
  var haut = 'M0,' + (-r), bq = '';
  for(k = 1; k <= 6; k++) haut += ' L' + f(L * k / 6.4) + ',' + f(-(r + (re - r) * k / 6.4) + (rr() - .5) * 2.2);
  for(k = 6; k >= 1; k--) bq += ' L' + f(L * k / 6.4) + ',' + f((r + (re - r) * k / 6.4) + (rr() - .5) * 2.2);
  s += '<path d="' + haut + ' Q' + f(L + re * .3) + ',' + f(-re) + ' ' + f(L) + ',0 Q' + f(L + re * .3) + ',' + f(re) + ' ' + f(L * 6 / 6.4) + ',' + f(re) + bq + ' L0,' + r + ' Z" fill="url(#' + gid + ')" stroke="' + K + '" stroke-width="3.2" stroke-linejoin="round"/>';
  s += '<g clip-path="url(#c' + gid + ')">';
  /* les crevasses de l'écorce (des traits sombres qui ondulent dans le sens du bois) et leurs crêtes claires */
  for(k = 0; k < 16; k++){ var bx = 5 + rr() * (L * .6), by = -r + 2.5 + rr() * (2 * r - 5), bl = 9 + rr() * 16, w1 = (rr() - .5) * 3;
    s += '<path d="M' + f(bx) + ',' + f(by) + ' q' + f(bl * .5) + ',' + f(w1) + ' ' + f(bl) + ',' + f((rr() - .5) * 1.6) + '" fill="none" stroke="#33190a" stroke-width="' + f(1.4 + rr() * .9) + '" stroke-linecap="round" opacity=".9"/>';
    if(k % 2) s += '<path d="M' + f(bx + 2) + ',' + f(by - 2.2 * bas) + ' q' + f(bl * .4) + ',' + f(w1) + ' ' + f(bl * .7) + ',0" fill="none" stroke="#d09a64" stroke-width="1.3" stroke-linecap="round" opacity=".75"/>'; }
  /* un nœud, et l'écorce qui le contourne */
  var nx = L * (.24 + rr() * .12), ny = (rr() - .5) * r * .5;
  s += '<path d="M' + f(nx - 11) + ',' + f(ny - 5.5) + ' q11,-4 22,0 M' + f(nx - 11) + ',' + f(ny + 5.5) + ' q11,4 22,0" fill="none" stroke="#33190a" stroke-width="1.5" stroke-linecap="round"/>' +
    '<ellipse cx="' + f(nx) + '" cy="' + f(ny) + '" rx="5.4" ry="3.6" fill="#4a2812" stroke="#2a1508" stroke-width="1.4"/><ellipse cx="' + f(nx) + '" cy="' + f(ny) + '" rx="2.4" ry="1.5" fill="#8d5933"/>';
  /* la lumière du feu sur le bois, puis le bout qui brûle : le charbon */
  s += '<rect x="' + f(L * .3) + '" y="' + (-r - 2) + '" width="' + f(L * .7) + '" height="' + (2 * r + 4) + '" fill="url(#mjcfb' + id + ')"/>' +
    '<rect x="' + f(L * .58) + '" y="' + (-r - 2) + '" width="' + f(L * .44) + '" height="' + (2 * r + 4) + '" fill="url(#mjcch' + id + ')"/>';
  /* la bûche qui se consume : elle noircit tout entière, ses fentes rougeoient */
  s += '<rect class="mjc-charbon" x="-2" y="' + (-r - 2) + '" width="' + f(L + 4) + '" height="' + (2 * r + 4) + '" fill="#1c1216" opacity="0"/><g class="mjc-ember" opacity="0">';
  for(k = 0; k < 5; k++){ var ex = L * (.18 + k * .16), ey = (rr() - .5) * r * 1.1;
    s += '<path d="M' + f(ex) + ',' + f(ey) + ' q' + f(3 + rr() * 3) + ',' + f(1.5 + rr() * 1.5) + ' ' + f(7 + rr() * 5) + ',' + f((rr() - .5) * 3) + '" fill="none" stroke="' + (k % 2 ? '#ffb347' : '#ff7a2c') + '" stroke-width="' + f(1.5 + rr() * .7) + '" stroke-linecap="round"/>'; }
  s += '</g></g>';
  /* un reflet le long du dessus */
  s += '<path d="M' + f(r * ov + 5) + ',' + f(-(r - 3.2) * bas) + ' H' + f(L * .5) + '" stroke="#e0b07c" stroke-width="2" stroke-linecap="round" opacity=".5"/>';
  /* le bout coupé : l'écorce autour, l'aubier clair, le cœur plus foncé, les cernes, deux fentes */
  var e0 = r * ov;
  s += '<ellipse cx="0" cy="0" rx="' + f(e0) + '" ry="' + f(r) + '" fill="#5a3519" stroke="' + K + '" stroke-width="3.2"/>' +
    '<ellipse cx="0" cy="0" rx="' + f(e0 * .8) + '" ry="' + f(r * .82) + '" fill="#f1d3a0"/><ellipse cx="0" cy="0" rx="' + f(e0 * .52) + '" ry="' + f(r * .54) + '" fill="#e2b77c"/>' +
    '<ellipse cx="0" cy="0" rx="' + f(e0 * .66) + '" ry="' + f(r * .68) + '" fill="none" stroke="#b9854a" stroke-width="1.2"/><ellipse cx="0" cy="0" rx="' + f(e0 * .38) + '" ry="' + f(r * .4) + '" fill="none" stroke="#b9854a" stroke-width="1.2"/>' +
    '<ellipse cx="0" cy="0" rx="' + f(e0 * .16) + '" ry="' + f(r * .17) + '" fill="#a8733c"/>' +
    '<path d="M0,0 L' + f(e0 * .55) + ',' + f(-r * .6) + ' M0,0 L' + f(-e0 * .5) + ',' + f(r * .62) + '" stroke="#8a5a2c" stroke-width="1.5" stroke-linecap="round"/>' +
    '<path d="M' + f(-e0 * .62) + ',' + f(-r * .5) + ' Q' + f(-e0 * .2) + ',' + f(-r * .82) + ' ' + f(e0 * .3) + ',' + f(-r * .74) + '" fill="none" stroke="#fff3d6" stroke-width="1.6" stroke-linecap="round" opacity=".8"/>';
  return s + '</g></g>';
}

/* ---------- le chaudron, son feu, ses bûches ---------- */
function defs(id){
  return '<linearGradient id="mjcm' + id + '" x1="0" x2="1"><stop offset="0" stop-color="#6a5f92"/><stop offset=".42" stop-color="#3d3459"/><stop offset="1" stop-color="#1a1428"/></linearGradient>' +
    '<linearGradient id="mjcpi' + id + '" x1="0" x2="1"><stop offset="0" stop-color="#4d4370"/><stop offset="1" stop-color="#231c36"/></linearGradient>' +
    '<linearGradient id="mjca' + id + '" x1="0" x2="1"><stop offset="0" stop-color="#ff5a5a"/><stop offset=".2" stop-color="#ffb347"/><stop offset=".4" stop-color="#fff35c"/><stop offset=".6" stop-color="#5df08a"/><stop offset=".8" stop-color="#5ab8ff"/><stop offset="1" stop-color="#c77dff"/></linearGradient>' +
    '<radialGradient id="mjcg' + id + '" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#ffc56a" stop-opacity=".85"/><stop offset=".4" stop-color="#ff7a2c" stop-opacity=".42"/><stop offset="1" stop-color="#ff7a2c" stop-opacity="0"/></radialGradient>' +
    '<radialGradient id="mjcc2' + id + '" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#ffc05a" stop-opacity="1"/><stop offset=".5" stop-color="#ff6a2a" stop-opacity=".62"/><stop offset="1" stop-color="#ff6a2a" stop-opacity="0"/></radialGradient>' +
    '<radialGradient id="mjcpo' + id + '" cx=".42" cy=".35" r=".7"><stop offset="0" stop-color="#fff" stop-opacity=".34"/><stop offset=".6" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".22"/></radialGradient>' +
    '<radialGradient id="mjcos' + id + '" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#000" stop-opacity=".5"/><stop offset=".7" stop-color="#000" stop-opacity=".22"/><stop offset="1" stop-color="#000" stop-opacity="0"/></radialGradient>' +
    '<linearGradient id="mjcf1' + id + '" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#ff8a1e"/><stop offset=".55" stop-color="#f4511e"/><stop offset="1" stop-color="#d9361a"/></linearGradient>' +
    '<linearGradient id="mjcf2' + id + '" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#ffe27a"/><stop offset=".6" stop-color="#ffb02e"/><stop offset="1" stop-color="#ff8a1e"/></linearGradient>' +
    '<linearGradient id="mjcf3' + id + '" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#ffe27a"/><stop offset=".45" stop-color="#ffab2e"/><stop offset="1" stop-color="#f4611e"/></linearGradient>' +
    '<linearGradient id="mjcfb' + id + '" x1="0" x2="1"><stop offset="0" stop-color="#ff9a3c" stop-opacity="0"/><stop offset="1" stop-color="#ff9a3c" stop-opacity=".55"/></linearGradient>' +
    '<linearGradient id="mjcch' + id + '" x1="0" x2="1"><stop offset="0" stop-color="#1c1216" stop-opacity="0"/><stop offset=".4" stop-color="#1c1216" stop-opacity=".88"/><stop offset="1" stop-color="#120b0f"/></linearGradient>' +
    '<clipPath id="mjccp' + id + '"><path d="M58,160 C30,210 62,322 200,322 C338,322 370,210 342,160 Z"/></clipPath>' +
    '<clipPath id="mjcc' + id + '"><ellipse cx="200" cy="157" rx="128" ry="46"/></clipPath>';
}
function svg(id, demo){
  var s = '<svg class="mjc-svg" viewBox="-30 0 460 462" aria-hidden="true"><defs>' + defs(id) + '</defs>', i;
  /* la lumière du feu derrière, l'ombre sur la pierre de l'âtre, le lit de cendre et ses braises */
  s += '<ellipse class="mjc-lueur-feu" cx="200" cy="356" rx="235" ry="150" fill="url(#mjcg' + id + ')"/>' +
    '<ellipse cx="200" cy="402" rx="190" ry="60" fill="url(#mjcos' + id + ')"/>' +
    '<path d="M118,398 C110,384 138,370 176,372 C196,366 232,368 252,374 C282,376 296,390 284,402 C290,414 262,424 232,420 C212,428 176,426 160,420 C132,422 110,412 118,398 Z" fill="#2c2433" opacity=".75"/>' +
    '<path d="M140,398 C138,388 160,380 200,380 C240,380 262,388 260,398 C258,410 240,416 200,416 C160,416 142,410 140,398 Z" fill="#4a363c"/>';
  [[126, 414, 2.2], [282, 416, 2], [108, 392, 1.6], [298, 396, 1.8], [150, 426, 1.6], [262, 428, 1.8]].forEach(function(c){ s += '<circle cx="' + c[0] + '" cy="' + c[1] + '" r="' + c[2] + '" fill="#8d8494" opacity=".7"/>'; });
  [[150, 400, 8, 3.4], [186, 412, 9, 3.6], [240, 414, 8, 3.4], [258, 396, 7, 3], [170, 388, 6, 2.6]].forEach(function(b, j){ s += '<ellipse class="mjc-braise' + (j % 2 ? ' b2' : '') + '" cx="' + b[0] + '" cy="' + b[1] + '" rx="' + b[2] + '" ry="' + b[3] + '" fill="' + (j % 2 ? '#ffb347' : '#ff6a2a') + '"/>'; });
  /* le pied du fond */
  s += '<path d="M192,300 L196,352 H206 L210,300 Z" fill="#231c36" stroke="' + K + '" stroke-width="3.5" stroke-linejoin="round"/>';
  /* la bûche du fond (la sixième) */
  s += buche(id, 5);
  /* les flammes de derrière : deux langues lèchent les côtés de la panse, une grande masse claire sous le chaudron */
  s += '<g class="mjc-flammes">' + langue(id, 104, 392, 66, 144, -44, 'a') + langue(id, 298, 392, 68, 158, 48, 'b') +
    '<path d="M112,400 C104,360 126,330 150,318 H250 C274,330 296,360 288,400 Z" fill="url(#mjcf3' + id + ')"/></g>';
  /* ---- le chaudron (ce groupe tremble quand ça bout fort) ---- */
  s += '<g class="mjc-corps">';
  s += '<path d="M58,160 C30,210 62,322 200,322 C338,322 370,210 342,160 Z" fill="url(#mjcm' + id + ')" stroke="' + K + '" stroke-width="5" stroke-linejoin="round"/>';
  s += '<g clip-path="url(#mjccp' + id + ')"><ellipse class="mjc-chaud" cx="200" cy="372" rx="200" ry="128" fill="url(#mjcc2' + id + ')"/>' +
    '<path d="M76,188 C70,240 104,286 152,304" fill="none" stroke="#fff" stroke-opacity=".26" stroke-width="9" stroke-linecap="round"/><path d="M92,196 C90,222 100,246 116,262" fill="none" stroke="#fff" stroke-opacity=".3" stroke-width="4" stroke-linecap="round"/>' +
    '<path d="M330,196 C326,244 300,284 262,304" fill="none" stroke="#0e0a17" stroke-opacity=".5" stroke-width="12" stroke-linecap="round"/>' +
    /* le cerclage sous le bord, et ses rivets */
    '<path d="M48,196 C80,236 320,236 352,196" fill="none" stroke="#1d1730" stroke-width="9"/><path d="M48,193 C80,233 320,233 352,193" fill="none" stroke="#6a5f92" stroke-width="2" opacity=".8"/>';
  [72, 104, 142, 180, 220, 258, 296, 328].forEach(function(x){ var t = (x - 200) / 152; s += '<circle cx="' + x + '" cy="' + f(195 + 30 * (1 - t * t)) + '" r="3.6" fill="#7b70a6" stroke="#15101f" stroke-width="1.6"/>'; });
  s += '</g>';
  /* les anses : un anneau de fer de chaque côté */
  s += '<path d="M56,178 C26,174 24,222 54,218 M344,178 C374,174 376,222 346,218" fill="none" stroke="' + K + '" stroke-width="11" stroke-linecap="round"/><path d="M56,178 C26,174 24,222 54,218 M344,178 C374,174 376,222 346,218" fill="none" stroke="#51476f" stroke-width="5" stroke-linecap="round"/>';
  /* l'intérieur : la paroi, la potion et tout ce qui bouge dessus */
  s += '<g clip-path="url(#mjcc' + id + ')"><ellipse cx="200" cy="157" rx="128" ry="46" fill="#120d1c"/>' +
    '<ellipse class="mjc-liq" cx="200" cy="170" rx="118" ry="42.5"/><ellipse class="mjc-ae" cx="200" cy="170" rx="118" ry="42.5" fill="url(#mjca' + id + ')"/>' +
    '<ellipse cx="200" cy="170" rx="118" ry="42.5" fill="url(#mjcpo' + id + ')"/><ellipse cx="176" cy="160" rx="62" ry="15" fill="#fff" opacity=".16"/>' +
    /* le tourbillon de la cuillère */
    '<g class="mjc-tour"><path d="M200,82 A88,88 0 0 1 288,170 M200,258 A88,88 0 0 1 112,170 M200,114 A56,56 0 0 1 256,170 M200,226 A56,56 0 0 1 144,170" fill="none" stroke="#fff" stroke-opacity=".45" stroke-width="3.5" stroke-linecap="round" vector-effect="non-scaling-stroke"/></g>' +
    /* le calme (vert) : deux ronds qui s'élargissent doucement */
    '<g class="mjc-ondes"><ellipse class="mjc-onde" cx="162" cy="176" rx="34" ry="12"/><ellipse class="mjc-onde o2" cx="246" cy="164" rx="30" ry="10.5"/></g>';
  var bl = '';
  for(i = 0; i < 16; i++){ var a = (i * 137.5) % 360 * Math.PI / 180, q = 0.2 + ((i * 0.41) % 0.75);
    bl += '<circle class="mjc-bl" style="animation-delay:-' + ((i * 0.29) % 1.6).toFixed(2) + 's" cx="' + f(200 + Math.cos(a) * 100 * q) + '" cy="' + f(170 + Math.sin(a) * 36 * q) + '" r="' + (5 + (i % 3) * 2) + '"/>'; }
  s += '<g class="mjc-bulles">' + bl + '</g>';
  /* ça bout (jaune, rouge) : de gros bouillons qui se soulèvent */
  s += '<g class="mjc-bouillons">';
  [[150, 182, 15], [236, 190, 17], [196, 164, 13], [262, 166, 12], [128, 164, 11], [206, 198, 14]].forEach(function(b, j){
    s += '<path class="mjc-bo" style="animation-delay:-' + (j * .23).toFixed(2) + 's" d="M' + (b[0] - b[2]) + ',' + b[1] + ' A' + b[2] + ',' + f(b[2] * .8) + ' 0 0 1 ' + (b[0] + b[2]) + ',' + b[1] + ' A' + b[2] + ',' + f(b[2] * .3) + ' 0 0 1 ' + (b[0] - b[2]) + ',' + b[1] + ' Z"/>'; });
  s += '</g>';
  /* ça refroidit (bleu) : une brume froide rampe sur la potion, de petits glaçons dérivent, un liseré de givre au bord */
  s += '<g class="mjc-frais"><ellipse cx="200" cy="170" rx="113" ry="39" fill="none" stroke="#eaf7ff" stroke-width="5" stroke-dasharray="2 9" stroke-linecap="round" opacity=".9"/>' +
    '<ellipse class="mjc-brumef" cx="150" cy="166" rx="52" ry="11" fill="#eaf7ff" opacity=".4"/><ellipse class="mjc-brumef b2" cx="250" cy="182" rx="46" ry="10" fill="#eaf7ff" opacity=".34"/><ellipse class="mjc-brumef b3" cx="204" cy="150" rx="40" ry="8" fill="#eaf7ff" opacity=".3"/>';
  [[142, 184, 1], [258, 160, .8], [206, 196, .7]].forEach(function(g, j){
    s += '<g class="mjc-glacon' + (j % 2 ? ' g2' : '') + '"><path transform="translate(' + g[0] + ',' + g[1] + ') scale(' + g[2] + ')" d="M-14,0 L-8,-6 L6,-7 L15,-1 L9,6 L-7,6 Z" fill="#f4fbff" stroke="#8fc6ea" stroke-width="2" stroke-linejoin="round"/><path transform="translate(' + g[0] + ',' + g[1] + ') scale(' + g[2] + ')" d="M-6,-2 L3,-3" stroke="#bfe3f7" stroke-width="2" stroke-linecap="round"/></g>'; });
  s += '</g>';
  /* ça gèle (violet) : de grandes plaques de glace se rejoignent (leur opacité suit la température : mj-chaudron.js) */
  s += '<g class="mjc-givre"><path d="M92,170 L120,146 L170,140 L196,158 L176,186 L124,192 Z M204,150 L250,136 L296,150 L306,174 L262,180 L222,172 Z M186,196 L230,184 L278,190 L262,206 L206,210 Z" fill="#f4fbff" fill-opacity=".9" stroke="#8fc6ea" stroke-width="2.5" stroke-linejoin="round"/>' +
    '<path d="M120,160 L160,166 M150,150 L158,178 M232,150 L262,166 M270,146 L256,172 M214,196 L250,198" stroke="#a9d6f0" stroke-width="2" stroke-linecap="round"/>';
  [[140, 158], [266, 160], [228, 196], [182, 150]].forEach(function(e, j){ s += '<g class="mjc-eclat' + (j % 2 ? ' e2' : '') + '" transform="translate(' + e[0] + ',' + e[1] + ')"><path d="M0,-7 L1.8,-1.8 L7,0 L1.8,1.8 L0,7 L-1.8,1.8 L-7,0 L-1.8,-1.8 Z" fill="#fff"/></g>'; });
  s += '</g>';
  /* la cuillère dans la potion (redessinée à chaque image : mj-chaudron.js, dessinerLouche) */
  s += '<g class="mjc-louche-in"><ellipse class="mjc-ride" fill="none" stroke="#fff" stroke-opacity=".55" stroke-width="2.5"/><ellipse class="mjc-cuilleron" fill="rgba(20,10,30,.35)"/>' +
    '<polygon class="mjc-manche-in" fill="#b9733f" stroke="' + K + '" stroke-width="3.5" stroke-linejoin="round"/></g></g>';
  /* le bord : un gros bourrelet de fonte */
  s += '<path d="M56,157 a144,53 0 1 0 288,0 a144,53 0 1 0 -288,0 Z M72,157 a128,46 0 1 0 256,0 a128,46 0 1 0 -256,0 Z" fill="#4a4166" fill-rule="evenodd" stroke="' + K + '" stroke-width="5"/>' +
    '<path d="M70,175 Q200,222 330,175" fill="none" stroke="#8a80b8" stroke-width="3" stroke-opacity=".7" stroke-linecap="round"/><path d="M84,128 Q200,98 316,128" fill="none" stroke="#2a2240" stroke-width="3" stroke-opacity=".8" stroke-linecap="round"/>';
  /* le givre sur le bord et ses petits glaçons (quand la potion va geler) */
  s += '<g class="mjc-givre-bord"><path d="M62,170 Q200,226 338,170" fill="none" stroke="#f4fbff" stroke-width="6" stroke-linecap="round" stroke-dasharray="14 6"/>';
  [[96, 196, 14], [140, 207, 18], [186, 212, 13], [232, 211, 19], [276, 204, 14], [312, 193, 11]].forEach(function(g){ s += '<path d="M' + (g[0] - 4.5) + ',' + g[1] + ' L' + (g[0] + 4.5) + ',' + g[1] + ' L' + g[0] + ',' + (g[1] + g[2]) + ' Z" fill="#eaf7ff" stroke="#8fc6ea" stroke-width="1.6" stroke-linejoin="round"/>'; });
  s += '</g>';
  /* les gouttes qui sautent quand ça bout fort (rouge) */
  s += '<g class="mjc-gouttes">';
  [[150, 150], [206, 138], [258, 148], [180, 132], [234, 128]].forEach(function(g, j){ s += '<circle class="mjc-goutte" style="animation-delay:-' + (j * .19).toFixed(2) + 's" cx="' + g[0] + '" cy="' + g[1] + '" r="' + (3.4 + (j % 2)) + '"/>'; });
  s += '</g>';
  /* la vapeur */
  s += '<g class="mjc-vapeur"><path d="M146,112 C132,88 160,74 148,44"/><path d="M196,104 C182,76 210,60 198,26"/><path d="M252,112 C238,88 266,72 254,46"/></g>';
  /* la cuillère hors de la potion, et le bord du fond qui passe devant elle quand elle est derrière */
  s += '<g class="mjc-louche-out"><polygon class="mjc-manche" fill="#c98450" stroke="' + K + '" stroke-width="3.5" stroke-linejoin="round"/><polygon class="mjc-reflet" fill="#f3c991"/>' +
    '<circle class="mjc-pommeau" fill="#a8693a" stroke="' + K + '" stroke-width="3.5"/></g>' +
    '<path class="mjc-bord-arriere" d="M56,157 A144,53 0 0 1 344,157 L328,157 A128,46 0 0 0 72,157 Z" fill="#4a4166" stroke="' + K + '" stroke-width="5" stroke-linejoin="round" opacity="0"/>';
  s += '</g>';
  /* la flèche à deux pointes : on touille dans le sens qu'on veut, ça refroidit (elle grossit quand il faut refroidir) */
  var rx = 184, ry = 86, cx = 200, cy = 158, t0 = Math.PI * .80, t1 = Math.PI * 1.20;
  var P = function(t){ return [cx + rx * Math.cos(t), cy + ry * Math.sin(t)]; }, p0 = P(t0), p1 = P(t1), d = 'M' + f(p0[0]) + ',' + f(p0[1]) + ' A' + rx + ',' + ry + ' 0 0 1 ' + f(p1[0]) + ',' + f(p1[1]);
  var pointe = function(t, sens){ var p = P(t), tx = -rx * Math.sin(t) * sens, ty = ry * Math.cos(t) * sens, l = Math.hypot(tx, ty); tx /= l; ty /= l; var nx = -ty, ny = tx;
    return '<path d="M' + f(p[0] + tx * 17) + ',' + f(p[1] + ty * 17) + ' L' + f(p[0] + nx * 13) + ',' + f(p[1] + ny * 13) + ' L' + f(p[0] - nx * 13) + ',' + f(p[1] - ny * 13) + ' Z" fill="#6cc4ff" stroke="' + K + '" stroke-width="3.5" stroke-linejoin="round"/>'; };
  s += '<g class="mjc-fleche mjc-refroidit"><path d="' + d + '" fill="none" stroke="' + K + '" stroke-width="13" stroke-linecap="round"/><path d="' + d + '" fill="none" stroke="#6cc4ff" stroke-width="6.5" stroke-linecap="round"/>' + pointe(t1, 1) + pointe(t0, -1) +
    '<g transform="translate(-11,158)"><circle r="15" fill="#eaf7ff" stroke="' + K + '" stroke-width="3"/>' + flocon(9, '#2f8fd6') + '</g></g>';
  /* les deux bûches de côté : elles passent derrière les pieds, leur bout coupé revient vers nous */
  s += buche(id, 0) + buche(id, 1);
  /* les deux pieds de devant, posés sur le même ovale que le bord */
  s += '<path d="M127,284 C123,330 114,372 103,402 L115,406 C126,376 137,336 145,296 Z M273,284 C277,330 286,372 297,402 L285,406 C274,376 263,336 255,296 Z" fill="url(#mjcpi' + id + ')" stroke="' + K + '" stroke-width="4" stroke-linejoin="round"/>' +
    '<path d="M96,402 Q108,396 120,404 L122,411 Q108,416 94,410 Z M304,402 Q292,396 280,404 L278,411 Q292,416 306,410 Z" fill="#2a2240" stroke="' + K + '" stroke-width="3.5" stroke-linejoin="round"/>' +
    '<path d="M129,296 C126,334 119,368 110,396" fill="none" stroke="#7b70a6" stroke-width="2.4" stroke-linecap="round" opacity=".7"/><path class="mjc-chaud" d="M290,398 C282,370 274,336 269,302" fill="none" stroke="#ff9a4a" stroke-width="2.6" stroke-linecap="round" opacity=".7"/>';
  /* les flammes de devant : elles naissent sur le bois et lèchent le fond de la panse */
  s += '<g class="mjc-flammes">' + langue(id, 170, 398, 44, 84, -8, 'b') + langue(id, 230, 398, 48, 98, 9, 'c') + langue(id, 200, 402, 38, 60, 2, 'a') + langue(id, 146, 396, 26, 42, -7, 'c', 1) + langue(id, 256, 396, 26, 48, 7, 'a', 1) + '</g>';
  /* les bûches de devant : deux en biais, puis celle qui pointe vers nous (on voit tout son bout rond) */
  s += buche(id, 3) + buche(id, 4) + buche(id, 2);
  s += '<g class="mjc-flammes">' + langue(id, 190, 406, 20, 30, -3, 'c', 1) + '</g>';
  /* les étincelles, autour du chaudron */
  s += '<g class="mjc-etincelles">';
  [[40, 250, 2.6], [22, 300, 2], [54, 214, 1.8], [364, 236, 2.6], [380, 296, 2], [350, 204, 1.8], [14, 262, 1.5], [390, 258, 1.6]].forEach(function(e, j){ s += '<circle class="mjc-et e' + (j % 3) + '" cx="' + e[0] + '" cy="' + e[1] + '" r="' + e[2] + '" fill="' + (j % 2 ? '#ffd36a' : '#ff9a3c') + '"/>'; });
  return s + '</g></svg>';
}

/* ---------- la réserve de bois : des bûches empilées qui pointent vers nous, leur longueur fuit vers le fond ----------
   .mjc-tas [data-act=bois] : on la touche pour ajouter une bûche ; .mjc-plus : le rond vert, qui brille quand le feu baisse ;
   .mjc-fl-bois : la grosse flèche rouge du tutoriel (niveau 1), au-dessus du tas. */
function reserve(id){
  var D = 30, dxv = 7, fer = 'M4,22 V86 Q4,95 13,95 H111 Q120,95 120,86 V22';
  var s = '<svg class="mjc-tas" data-act="bois" viewBox="-12 -124 174 242" aria-hidden="true"><defs><linearGradient id="mjcev' + id + '" x1="0" x2="1"><stop offset="0" stop-color="#b47a4b"/><stop offset=".4" stop-color="#8d5933"/><stop offset="1" stop-color="#4a2a15"/></linearGradient></defs>' +
    '<g class="mjc-tas-g"><ellipse cx="66" cy="98" rx="84" ry="15" fill="rgba(0,0,0,.45)"/>' +
    '<path d="M4,95 L' + (4 + dxv) + ',' + (95 - D) + ' M120,95 L' + (113 + dxv) + ',' + (95 - D) + '" stroke="' + K + '" stroke-width="7" stroke-linecap="round"/>';
  [[30, 78, 15.5, 1], [62, 79, 16.5, 2], [95, 78, 15.5, 3], [46, 51, 15.5, 4], [79, 51, 15.5, 5], [62, 25, 14.5, 6]].forEach(function(b){
    var cx = b[0], cy = b[1], r = b[2], rr = alea(b[3] * 31), rf = r * .9, fx = cx + dxv, fy = cy - D, i;
    s += '<path d="M' + f(cx - r) + ',' + cy + ' L' + f(fx - rf) + ',' + f(fy) + ' Q' + f(fx) + ',' + f(fy - rf * .9) + ' ' + f(fx + rf) + ',' + f(fy) + ' L' + f(cx + r) + ',' + cy + ' Z" fill="url(#mjcev' + id + ')" stroke="' + K + '" stroke-width="3" stroke-linejoin="round"/>';
    for(i = 0; i < 4; i++){ var t = .15 + i * .23, ax = cx - r + 2 * r * t, bx2 = fx - rf + 2 * rf * t; s += '<path d="M' + f(ax) + ',' + f(cy - 6 - rr() * 5) + ' L' + f(ax + (bx2 - ax) * .8) + ',' + f(cy - D * .8 - rr() * 3) + '" stroke="' + (i % 2 ? '#33190a' : '#c08a58') + '" stroke-width="1.5" stroke-linecap="round" opacity=".85"/>'; }
    s += '<ellipse cx="' + cx + '" cy="' + cy + '" rx="' + r + '" ry="' + f(r * .93) + '" fill="#5a3519" stroke="' + K + '" stroke-width="3.2"/>' +
      '<ellipse cx="' + cx + '" cy="' + cy + '" rx="' + f(r * .8) + '" ry="' + f(r * .75) + '" fill="#f1d3a0"/><ellipse cx="' + cx + '" cy="' + cy + '" rx="' + f(r * .5) + '" ry="' + f(r * .46) + '" fill="#e2b77c"/>' +
      '<ellipse cx="' + cx + '" cy="' + cy + '" rx="' + f(r * .64) + '" ry="' + f(r * .6) + '" fill="none" stroke="#b9854a" stroke-width="1.3"/><ellipse cx="' + cx + '" cy="' + cy + '" rx="' + f(r * .34) + '" ry="' + f(r * .31) + '" fill="none" stroke="#b9854a" stroke-width="1.3"/>' +
      '<circle cx="' + cx + '" cy="' + cy + '" r="' + f(r * .13) + '" fill="#a8733c"/>' +
      '<path d="M' + cx + ',' + cy + ' l' + f((rr() - .3) * r * .9) + ',' + f(-r * .62) + ' M' + cx + ',' + cy + ' l' + f((rr() - .7) * r * .9) + ',' + f(r * .6) + '" stroke="#8a5a2c" stroke-width="1.5" stroke-linecap="round"/>' +
      '<path d="M' + f(cx - r * .55) + ',' + f(cy - r * .42) + ' Q' + f(cx - r * .2) + ',' + f(cy - r * .74) + ' ' + f(cx + r * .28) + ',' + f(cy - r * .68) + '" fill="none" stroke="#fff3d6" stroke-width="1.6" stroke-linecap="round" opacity=".8"/>';
  });
  s += '<path d="' + fer + '" fill="none" stroke="' + K + '" stroke-width="9" stroke-linecap="round"/><path d="' + fer + '" fill="none" stroke="#51476f" stroke-width="4" stroke-linecap="round"/>';
  /* le rond vert « une bûche de plus » */
  s += '<g class="mjc-plus"><circle class="mjc-plus-halo" cx="120" cy="-8" r="30"/><circle cx="120" cy="-8" r="21" fill="#7cf0a8" stroke="' + K + '" stroke-width="3.6"/><path d="M120,-18 V2 M110,-8 H130" stroke="' + K + '" stroke-width="5" stroke-linecap="round"/></g>' +
    '<rect x="-10" y="-34" width="160" height="150" fill="transparent"/></g>';
  /* la flèche rouge du tutoriel */
  s += '<g class="mjc-fl-bois"><g><path d="M50,-118 H74 V-74 H94 L62,-36 L30,-74 H50 Z" fill="#ff3a2e" stroke="' + K + '" stroke-width="4" stroke-linejoin="round"/><path d="M55,-112 V-72" stroke="rgba(255,255,255,.45)" stroke-width="5" stroke-linecap="round"/></g></g>';
  return s + '</svg>';
}

/* ---------- un bocal de l'étagère ----------
   Vu d'un peu au-dessus, comme le chaudron : on voit le dessus du bouchon, le fond est arrondi, l'étiquette suit la courbe du verre.
   Boîte du dessin : 0 0 72 94. L'ingrédient est dessiné dans la « fenêtre » du verre, au-dessus de l'étiquette.
   ic : la petite étiquette ronde pendue au goulot (l'icône de la recette et de la frise), pour retrouver le bocal d'un coup d'œil. */
function contenu(k, w, T, B){
  var s = '', A = B - T, r = alea(k.length * 97 + k.charCodeAt(0) * 13), i, x, y;
  function feuille(x, y, a, l, c, c2){ return '<g transform="translate(' + f(x) + ',' + f(y) + ') rotate(' + a + ')"><path d="M0,0 C' + f(l * .3) + ',' + f(-l * .42) + ' ' + f(l * .8) + ',' + f(-l * .32) + ' ' + l + ',0 C' + f(l * .8) + ',' + f(l * .32) + ' ' + f(l * .3) + ',' + f(l * .42) + ' 0,0 Z" fill="' + c + '" stroke="' + K + '" stroke-width="1.7" stroke-linejoin="round"/><path d="M2,0 H' + f(l - 3) + '" stroke="' + c2 + '" stroke-width="1.4" stroke-linecap="round"/></g>'; }
  /* un liquide : sa surface est un ovale (on la voit d'en haut), plus claire que le dessous */
  function liquide(ys, c, c2, c3){ return '<path d="M' + (-w) + ',' + f(ys) + ' V8 H' + w + ' V' + f(ys) + ' Z" fill="' + c + '"/><rect x="' + (-w) + '" y="' + f(B) + '" width="' + (2 * w) + '" height="' + f(-B + 8) + '" fill="' + c3 + '" opacity=".6"/>' +
    '<ellipse cx="0" cy="' + f(ys) + '" rx="' + w + '" ry="' + f(w * .24) + '" fill="' + c2 + '" stroke="#fff" stroke-opacity=".6" stroke-width="1.4"/>'; }
  switch(k){
    case 'eau':
      s += liquide(T + A * .4, '#4ec1f5', '#a9e3fb', '#2f9fe0') + '<circle cx="' + f(w * .3) + '" cy="' + f(T + A * .78) + '" r="3" fill="#dff6ff"/><circle cx="' + f(-w * .25) + '" cy="' + f(T + A * .7) + '" r="2.1" fill="#dff6ff"/>';
      break;
    case 'miel':
      s += liquide(T + A * .44, '#f0a418', '#ffcf5a', '#c9690c') + '<ellipse cx="' + f(-w * .12) + '" cy="' + f(T + A * .42) + '" rx="' + f(w * .3) + '" ry="2.4" fill="#fff0b8" opacity=".8"/>';
      break;
    case 'baies':
      for(i = 0; i < 40; i++){ x = (i % 5 - 2) * w * .42 + (Math.floor(i / 5) % 2 ? w * .2 : 0); y = -5 - Math.floor(i / 5) * w * .36 - r() * 2; if(y < T + A * .22) break;
        s += '<circle cx="' + f(x) + '" cy="' + f(y) + '" r="' + f(w * .25) + '" fill="' + (i % 3 ? '#5165cb' : '#3f4fae') + '" stroke="' + K + '" stroke-width="1.5"/><circle cx="' + f(x - 1.8) + '" cy="' + f(y - 2) + '" r="1.6" fill="#b9c4ff"/>'; }
      break;
    case 'champignon':
      [[-.3, 1, B + 3], [.36, .78, B + 4]].forEach(function(m){ var q = w * .56 * m[1], hh = A * .86 * m[1]; x = w * m[0]; y = m[2];
        s += '<path d="M' + f(x - q * .3) + ',' + f(y) + ' V' + f(y - hh * .5) + ' H' + f(x + q * .3) + ' V' + f(y) + ' Z" fill="#f6ead2" stroke="' + K + '" stroke-width="1.8"/>' +
          '<path d="M' + f(x - q) + ',' + f(y - hh * .44) + ' C' + f(x - q) + ',' + f(y - hh * 1.06) + ' ' + f(x + q) + ',' + f(y - hh * 1.06) + ' ' + f(x + q) + ',' + f(y - hh * .44) + ' Z" fill="#ff521a" stroke="' + K + '" stroke-width="2"/>' +
          '<circle cx="' + f(x - q * .42) + '" cy="' + f(y - hh * .62) + '" r="2.6" fill="#fff3e0"/><circle cx="' + f(x + q * .34) + '" cy="' + f(y - hh * .7) + '" r="2.2" fill="#fff3e0"/><circle cx="' + f(x) + '" cy="' + f(y - hh * .84) + '" r="1.8" fill="#fff3e0"/>'; });
      break;
    case 'trefle':
      [[-.42, .7, .82], [.4, .62, .9], [0, .34, 1.08]].forEach(function(m){ x = w * m[0]; y = T + A * m[1]; var q = w * .21 * m[2];
        s += '<path d="M' + f(x) + ',' + f(y + q) + ' V' + f(B + 6) + '" stroke="#5c8a1c" stroke-width="2.2"/>';
        [0, 120, 240].forEach(function(a){ s += '<circle cx="' + f(x + Math.sin(a * Math.PI / 180) * q) + '" cy="' + f(y - Math.cos(a * Math.PI / 180) * q) + '" r="' + f(q) + '" fill="#8bc02b" stroke="' + K + '" stroke-width="1.6"/>'; });
        s += '<circle cx="' + f(x) + '" cy="' + f(y) + '" r="' + f(q * .3) + '" fill="#5c8a1c"/>'; });
      break;
    case 'brume':
      s += '<rect x="' + (-w) + '" y="' + f(T - 8) + '" width="' + (2 * w) + '" height="' + f(-T + 14) + '" fill="#e3e8ea" opacity=".72"/>';
      [[-.22, .34], [.18, .62], [-.3, .86]].forEach(function(m){ x = w * m[0]; y = T + A * m[1];
        s += '<path d="M' + f(x - 13) + ',' + f(y) + ' c0,-10 14,-10 14,-2 c0,6 -8,6 -8,1 M' + f(x + 4) + ',' + f(y + 3) + ' c5,-8 17,-6 14,3" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round"/>' +
          '<path d="M' + f(x - 13) + ',' + f(y + 1.5) + ' c0,-10 14,-10 14,-2" fill="none" stroke="#9fb0bb" stroke-width="1.2" stroke-linecap="round" opacity=".7"/>'; });
      break;
    case 'lavande':
      [-.5, 0, .5].forEach(function(m, j){ x = w * m; var yt = T + A * (j === 1 ? .12 : .26); s += '<path d="M' + f(x) + ',' + f(B + 6) + ' V' + f(yt + 8) + '" stroke="#6f8f3a" stroke-width="2.2"/>';
        for(i = 0; i < 6; i++) s += '<ellipse cx="' + f(x + (i % 2 ? 3 : -3)) + '" cy="' + f(yt + 4 + i * A * .11) + '" rx="4.4" ry="3.6" fill="' + (i % 2 ? '#9a6cf0' : '#8253dc') + '" stroke="' + K + '" stroke-width="1.3"/>'; });
      break;
    case 'pensee':
      [[-.36, .68, .62], [.38, .6, .56], [0, .3, .5]].forEach(function(m){ x = w * m[0]; y = T + A * m[1];
        s += '<path d="M' + f(x) + ',' + f(y + 6) + ' V' + f(B + 6) + '" stroke="#6f8f3a" stroke-width="2"/><g transform="translate(' + f(x) + ',' + f(y) + ') scale(' + f(m[2] * w / 30) + ')"><g stroke="' + K + '" stroke-width="2.6" stroke-linejoin="round"><ellipse cx="-7" cy="-9" rx="8" ry="9" fill="#ffc21a"/><ellipse cx="7" cy="-9" rx="8" ry="9" fill="#ffc21a"/><ellipse cx="-11" cy="2" rx="8.5" ry="7.5" fill="#febb02"/><ellipse cx="11" cy="2" rx="8.5" ry="7.5" fill="#febb02"/><path d="M-10 6 C -10 18 10 18 10 6 C 6 3 -6 3 -10 6 Z" fill="#ffd23f"/></g><path d="M0 3 L -5 -4 M0 3 L 5 -4 M0 3 L 0 11" stroke="#6a3aa8" stroke-width="2" stroke-linecap="round"/><circle cx="0" cy="3" r="3" fill="#ff8a1a" stroke="' + K + '" stroke-width="1.2"/></g>'; });
      break;
    case 'menthe':
      s += '<path d="M0,' + f(B + 6) + ' V' + f(T + A * .18) + '" stroke="#3d6e12" stroke-width="2.4"/>';
      for(i = 0; i < 6; i++) s += feuille(0, T + A * (.26 + i * .13), i % 2 ? -24 : -156, w * (.78 - i * .03), '#5b9821', '#2f5a0c');
      s += feuille(0, T + A * .2, -90, w * .5, '#6aa82a', '#2f5a0c');
      break;
    case 'ortie':
      s += '<path d="M0,' + f(B + 6) + ' V' + f(T + A * .2) + '" stroke="#6d9320" stroke-width="2.4"/>';
      for(i = 0; i < 4; i++){ var a = i % 2 ? -18 : -162, l = w * (.86 - i * .05), yy = T + A * (.3 + i * .2);
        s += '<g transform="translate(0,' + f(yy) + ') rotate(' + a + ')"><path d="M0,0 L' + f(l * .16) + ',' + f(-l * .26) + ' L' + f(l * .3) + ',' + f(-l * .2) + ' L' + f(l * .42) + ',' + f(-l * .32) + ' L' + f(l * .56) + ',' + f(-l * .2) + ' L' + f(l * .7) + ',' + f(-l * .26) + ' L' + l + ',0 L' + f(l * .7) + ',' + f(l * .26) + ' L' + f(l * .56) + ',' + f(l * .2) + ' L' + f(l * .42) + ',' + f(l * .32) + ' L' + f(l * .3) + ',' + f(l * .2) + ' L' + f(l * .16) + ',' + f(l * .26) + ' Z" fill="#99c23b" stroke="' + K + '" stroke-width="1.6" stroke-linejoin="round"/><path d="M2,0 H' + f(l - 3) + '" stroke="#5f8418" stroke-width="1.4"/></g>'; }
      break;
    case 'racine':
      [[-.3, B + 1, 8, 1], [.3, B - 1, -14, .9], [0, T + A * .56, 24, 1.05]].forEach(function(m){ var q = w / 26 * m[3];
        s += '<g transform="translate(' + f(w * m[0]) + ',' + f(m[1]) + ') rotate(' + m[2] + ') scale(' + f(q) + ')"><path d="M-16,0 C-12,-10 6,-12 14,-6 C22,-2 20,7 12,9 C2,12 -12,10 -16,0 Z" fill="#ad7156" stroke="' + K + '" stroke-width="2"/><path d="M-8,-3 q6,4 14,0 M-4,4 q5,2 10,0" fill="none" stroke="#7d4c36" stroke-width="1.5" stroke-linecap="round"/><path d="M14,-6 q8,-4 10,-10 M-16,0 q-6,2 -8,8" fill="none" stroke="#8a563c" stroke-width="2.2" stroke-linecap="round"/></g>'; });
      break;
    case 'lune':
      s += '<path d="M' + (-w) + ',' + f(T + A * .78) + ' Q' + f(-w * .1) + ',' + f(T + A * .46) + ' ' + w + ',' + f(T + A * .82) + ' V8 H' + (-w) + ' Z" fill="#fdd835"/><path d="M' + (-w) + ',' + f(T + A * .78) + ' Q' + f(-w * .1) + ',' + f(T + A * .46) + ' ' + w + ',' + f(T + A * .82) + '" fill="none" stroke="#fff6c2" stroke-width="2.2"/>';
      [[-.3, .3, 6.5], [.36, .2, 5], [.1, .5, 3.6], [-.5, .62, 3]].forEach(function(m){ x = w * m[0]; y = T + A * m[1]; var q = m[2];
        s += '<path d="M' + f(x) + ',' + f(y - q) + ' L' + f(x + q * .28) + ',' + f(y - q * .28) + ' L' + f(x + q) + ',' + f(y) + ' L' + f(x + q * .28) + ',' + f(y + q * .28) + ' L' + f(x) + ',' + f(y + q) + ' L' + f(x - q * .28) + ',' + f(y + q * .28) + ' L' + f(x - q) + ',' + f(y) + ' L' + f(x - q * .28) + ',' + f(y - q * .28) + ' Z" fill="#fff6c2" stroke="#c99a12" stroke-width="1"/>'; });
      break;
    default:
      s += '<circle cx="0" cy="' + f(T + A * .5) + '" r="' + f(w * .5) + '" fill="#8d8a99" stroke="' + K + '" stroke-width="2"/>';
  }
  return s;
}
var nBocal = 0;
/* o : {nom, court (le nom des bocaux étroits), ic (html de l'icône : un émoji, ou un petit svg)} */
function bocal(k, o){
  o = o || {};
  var id = 'mjcj' + (++nBocal), s = '', hw = 27;
  /* le verre : des épaules rondes, un goulot, un fond arrondi (l'ovale du dessous) */
  var corps = 'M9,36 C9,27 19,28 19,21 L53,21 C53,28 63,27 63,36 L63,80 A27,7.5 0 0 1 9,80 Z';
  function etiq(nom, cls){
    var fs = nom.length > 8 ? 9.6 : 11.4, lw = Math.max(46, nom.length * fs * .6 + 10);
    return '<g class="' + cls + '"><path d="M' + f(36 - lw / 2) + ',60 Q36,65.5 ' + f(36 + lw / 2) + ',60 L' + f(36 + lw / 2) + ',76 Q36,81.5 ' + f(36 - lw / 2) + ',76 Z" fill="#f3e4c2" stroke="#5a4630" stroke-width="2" stroke-linejoin="round"/>' +
      '<text x="36" y="' + f(71.6 + fs * .36) + '" text-anchor="middle" font-weight="700" font-size="' + fs + '" fill="#35281b">' + nom + '</text></g>';
  }
  s += '<svg class="mjc-bocal" viewBox="0 0 72 94" aria-hidden="true" focusable="false"><defs>' +
    '<clipPath id="' + id + '"><path d="' + corps + '"/></clipPath>' +
    '<linearGradient id="' + id + 'v" x1="0" x2="1"><stop offset="0" stop-color="#fff" stop-opacity=".34"/><stop offset=".28" stop-color="#fff" stop-opacity=".04"/><stop offset=".78" stop-color="#bcd6ff" stop-opacity=".08"/><stop offset="1" stop-color="#000" stop-opacity=".26"/></linearGradient>' +
    '<linearGradient id="' + id + 'l" x1="0" x2="1"><stop offset="0" stop-color="#e0b684"/><stop offset=".5" stop-color="#c7935e"/><stop offset="1" stop-color="#8f5f38"/></linearGradient></defs>';
  s += '<ellipse cx="36" cy="88" rx="31" ry="5.5" fill="rgba(0,0,0,.42)"/>';
  s += '<path class="mjc-bocal-halo" d="' + corps + '" fill="none" stroke="#ffd36a" stroke-width="11" stroke-linejoin="round"/>';
  s += '<path d="' + corps + '" fill="#d7dcf2" fill-opacity=".42"/><g clip-path="url(#' + id + ')"><g transform="translate(36,86)">' + contenu(k, hw, -60, -27) + '</g>' +
    '<rect x="6" y="14" width="60" height="78" fill="url(#' + id + 'v)"/>' +
    /* le fond du bocal, vu à travers le verre */
    '<path d="M11,80 A25,6.5 0 0 0 61,80" fill="none" stroke="#fff" stroke-opacity=".4" stroke-width="2"/></g>';
  s += '<path d="' + corps + '" fill="none" stroke="' + K + '" stroke-width="3.2" stroke-linejoin="round"/>';
  /* les reflets du verre : il est rond */
  s += '<path d="M15,40 C14,52 14,66 15.5,76" fill="none" stroke="#fff" stroke-width="3.6" stroke-linecap="round" opacity=".6"/><path d="M57,42 V56" stroke="#fff" stroke-width="2" stroke-linecap="round" opacity=".35"/>' +
    '<path d="M19,22.5 Q36,27.5 53,22.5" fill="none" stroke="#fff" stroke-opacity=".55" stroke-width="2"/>';
  /* le bouchon de liège : son tour, son dessus (un ovale : on le voit d'en haut), la ficelle du goulot */
  s += '<path d="M21,9 V21 A15,4.6 0 0 0 51,21 V9 Z" fill="url(#' + id + 'l)" stroke="' + K + '" stroke-width="3" stroke-linejoin="round"/>' +
    '<ellipse cx="36" cy="9" rx="15" ry="4.8" fill="#e9c79c" stroke="' + K + '" stroke-width="3"/><path d="M28,8.4 q8,2.6 16,0" fill="none" stroke="#b98a5c" stroke-width="1.5" stroke-linecap="round"/>' +
    '<path d="M19.5,23.5 Q36,29 52.5,23.5" fill="none" stroke="#c9a56a" stroke-width="2.6" stroke-linecap="round"/>';
  /* l'étiquette de papier (le nom), courbée comme le verre */
  s += etiq(o.nom || k, 'mjc-nl') + etiq(o.court || o.nom || k, 'mjc-nc');
  s += '</svg>';
  /* l'étiquette ronde du goulot : l'icône de la recette */
  if(o.ic) s += '<span class="mjc-pastille-ic" aria-hidden="true">' + o.ic + '</span>';
  return s;
}

/* ---------- l'âtre de la cheminée, à la taille de l'écran ----------
   L (mj-chaudron.js, disposer) : W, H (la scène), VP {x, y} (le point de fuite), s (le fond de l'âtre, plus petit que l'ouverture),
   JX0, JX1 (les montants, côté pièce), OX0, OX1 (l'ouverture), FY (le bord de devant de l'âtre), av, tr (la pierre qui avance, sa tranche),
   planche (largeur d'une planche du parquet, devant), cx, cy, sc (le chaudron : le centre de son ovale au sol, son échelle), large. */
function tuile(pid, w, h, rangs, o){
  var s = '<pattern id="' + pid + '" patternUnits="userSpaceOnUse" width="' + w + '" height="' + h + '"><rect width="' + w + '" height="' + h + '" fill="' + o.joint + '"/>', y = 0, hh = h / rangs.length;
  rangs.forEach(function(l, j){
    var x = l[0];
    l.slice(1).forEach(function(ww, i){
      [x, x - w].forEach(function(xx){
        if(xx + ww < 0 || xx > w) return;
        s += '<rect x="' + f(xx + o.jw / 2) + '" y="' + f(y + o.jw / 2) + '" width="' + f(ww - o.jw) + '" height="' + f(hh - o.jw) + '" rx="' + o.rx + '" fill="' + o.cols[(i + j) % o.cols.length] + '"/>' +
          '<path d="M' + f(xx + 7) + ',' + f(y + 5.5) + ' H' + f(xx + ww * (.35 + ((i * 7 + j * 3) % 5) * .08)) + '" stroke="' + o.clair + '" stroke-width="2" stroke-linecap="round" opacity=".7"/>';
      });
      x += ww;
    });
    y += hh;
  });
  return s + '</pattern>';
}
function decor(L, id){
  var W = L.W, H = L.H, VP = L.VP, s = '', i, P = 'mjd' + id;
  function vp(x, y, k){ return [VP.x + (x - VP.x) * k, VP.y + (y - VP.y) * k]; }
  var bx0 = vp(L.OX0, 0, L.s)[0], bx1 = vp(L.OX1, 0, L.s)[0], by1 = vp(0, L.FY, L.s)[1], byT = -6, bq = L.large ? 24 : 19, bl = L.large ? 46 : 38;
  s += '<svg class="mjc-decor" viewBox="0 0 ' + W + ' ' + H + '" width="' + W + '" height="' + H + '" aria-hidden="true"><defs>' +
    tuile(P + 'pc', bl * 4, bl * 2, [[0, bl * 1.5, bl * 1.3, bl * 1.2], [-bl * .7, bl * 1.4, bl * 1.1, bl * 1.5]], {joint:'#6f689a', jw:3, rx:4, cols:['#a59ecb', '#aea7d3', '#9c95c2'], clair:'#c9c3e6'}) +
    tuile(P + 'pm', 132, 116, [[0, 66, 66], [-33, 66, 66]], {joint:'#5d5688', jw:2.5, rx:2, cols:['#857eb0', '#8c85b8', '#7f78aa'], clair:'#a59ecb'}) +
    tuile(P + 'pb', bq * 4.4, bq * 2, [[0, bq * 2.2, bq * 2.2], [-bq * 1.1, bq * 2.2, bq * 2.2]], {joint:'#1f1728', jw:2.2, rx:1, cols:['#3b2f47', '#42354f', '#372b43'], clair:'#55476a'}) +
    '<linearGradient id="' + P + 'su" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#07050b" stop-opacity=".9"/><stop offset=".55" stop-color="#07050b" stop-opacity=".25"/><stop offset="1" stop-color="#07050b" stop-opacity="0"/></linearGradient>' +
    '<linearGradient id="' + P + 'oh" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#000" stop-opacity=".6"/><stop offset="1" stop-color="#000" stop-opacity="0"/></linearGradient>' +
    '<linearGradient id="' + P + 'cg" x1="1" x2="0"><stop offset="0" stop-color="#ff9a4a" stop-opacity=".5"/><stop offset="1" stop-color="#ff9a4a" stop-opacity="0"/></linearGradient>' +
    '<linearGradient id="' + P + 'cd" x1="0" x2="1"><stop offset="0" stop-color="#ff9a4a" stop-opacity=".5"/><stop offset="1" stop-color="#ff9a4a" stop-opacity="0"/></linearGradient>' +
    '<radialGradient id="' + P + 'sf" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#ffb35c" stop-opacity=".7"/><stop offset=".55" stop-color="#ff7a2c" stop-opacity=".26"/><stop offset="1" stop-color="#ff7a2c" stop-opacity="0"/></radialGradient>' +
    '<radialGradient id="' + P + 'vi" cx=".5" cy=".55" r=".75"><stop offset=".55" stop-color="#0b0714" stop-opacity="0"/><stop offset="1" stop-color="#0b0714" stop-opacity=".6"/></radialGradient>' +
    '<clipPath id="' + P + 'cs"><polygon points="' + pts([[bx0, by1], [bx1, by1], [L.OX1, L.FY], [L.OX0, L.FY]]) + '"/></clipPath></defs>';
  /* 1. le mur de l'atelier (les mêmes pierres violettes), de chaque côté de la cheminée */
  s += '<rect width="' + W + '" height="' + H + '" fill="url(#' + P + 'pm)"/>';
  /* 2. le parquet de l'atelier, devant : ses planches fuient vers le même point que l'âtre */
  s += '<rect x="0" y="' + L.FY + '" width="' + W + '" height="' + (H - L.FY) + '" fill="#8c5a33"/>';
  var kf = (L.FY - VP.y) / (H - VP.y), np = Math.ceil(W / L.planche / 2) + 2;
  for(i = -np; i <= np; i++){ var xb = VP.x + i * L.planche;
    s += '<polygon points="' + pts([[vp(xb, H, kf)[0], L.FY], [vp(xb + L.planche, H, kf)[0], L.FY], [xb + L.planche, H], [xb, H]]) + '" fill="' + (i % 2 ? '#9a6539' : '#8f5c34') + '" stroke="#5a3519" stroke-width="2.5"/>'; }
  s += '<rect x="0" y="' + L.FY + '" width="' + W + '" height="' + (H - L.FY) + '" fill="url(#' + P + 'oh)" opacity=".4"/>';
  /* 3. l'intérieur de l'âtre : le fond de briques noircies, les deux côtés, les dalles du sol */
  s += '<rect x="' + L.OX0 + '" y="-2" width="' + (L.OX1 - L.OX0) + '" height="' + (L.FY + 2) + '" fill="#1a1424"/>' +
    '<rect x="' + f(bx0) + '" y="' + byT + '" width="' + f(bx1 - bx0) + '" height="' + f(by1 - byT) + '" fill="url(#' + P + 'pb)"/><rect x="' + f(bx0) + '" y="' + byT + '" width="' + f(bx1 - bx0) + '" height="' + f(by1 - byT) + '" fill="url(#' + P + 'su)"/>';
  s += '<polygon points="' + pts([[L.OX0, byT], [bx0, byT], [bx0, by1], [L.OX0, L.FY]]) + '" fill="#31273d"/><polygon points="' + pts([[L.OX1, byT], [bx1, byT], [bx1, by1], [L.OX1, L.FY]]) + '" fill="#2b2236"/>';
  for(i = 1; i < 9; i++){ var yj = L.FY * i / 9, q = vp(0, yj, L.s)[1];
    s += '<path d="M' + L.OX0 + ',' + f(yj) + ' L' + f(bx0) + ',' + f(q) + ' M' + L.OX1 + ',' + f(yj) + ' L' + f(bx1) + ',' + f(q) + '" stroke="#1c1526" stroke-width="2.2"/>'; }
  s += '<polygon points="' + pts([[L.OX0, byT], [bx0, byT], [bx0, by1], [L.OX0, L.FY]]) + '" fill="url(#' + P + 'cd)" opacity=".55"/><polygon points="' + pts([[L.OX1, byT], [bx1, byT], [bx1, by1], [L.OX1, L.FY]]) + '" fill="url(#' + P + 'cg)" opacity=".55"/>';
  s += '<polygon points="' + pts([[bx0, by1], [bx1, by1], [L.OX1, L.FY], [L.OX0, L.FY]]) + '" fill="#5a4f6e"/><g clip-path="url(#' + P + 'cs)">';
  for(i = -4; i <= 4; i++){ var xf = VP.x + i * (L.OX1 - L.OX0) / 5.2; s += '<path d="M' + f(xf) + ',' + L.FY + ' L' + f(vp(xf, L.FY, L.s)[0]) + ',' + f(by1) + '" stroke="#3a3049" stroke-width="2.6"/>'; }
  [0.22, 0.5, 0.8].forEach(function(t){ var yy = by1 + (L.FY - by1) * t * (0.6 + 0.4 * t); s += '<path d="M0,' + f(yy) + ' H' + W + '" stroke="#3a3049" stroke-width="2.6"/>'; });
  s += '<ellipse cx="' + f(L.cx) + '" cy="' + f(L.cy) + '" rx="' + f(L.sc * 290) + '" ry="' + f(L.sc * 105) + '" fill="url(#' + P + 'sf)"/></g>';
  s += '<path d="M' + f(bx0) + ',' + f(by1) + ' H' + f(bx1) + ' M' + f(bx0) + ',' + byT + ' V' + f(by1) + ' M' + f(bx1) + ',' + byT + ' V' + f(by1) + '" stroke="#17111f" stroke-width="3" fill="none"/>';
  /* la crémaillère : la tige à crans et son crochet, au fond */
  var cmx = L.cx + L.sc * 6, cmy = L.cy - L.sc * 382, e = L.sc;
  if(cmy > 60){
    s += '<g opacity=".9"><path d="M' + f(cmx) + ',-4 V' + f(cmy - 26) + '" stroke="#0e0a15" stroke-width="' + f(7 * e + 2) + '" stroke-linecap="round"/>';
    for(var yc = 14; yc < cmy - 44; yc += 17 * e + 6) s += '<path d="M' + f(cmx) + ',' + f(yc) + ' l' + f(9 * e + 3) + ',' + f(5 * e + 2) + '" stroke="#0e0a15" stroke-width="' + f(4 * e + 1.5) + '" stroke-linecap="round"/>';
    s += '<path d="M' + f(cmx) + ',' + f(cmy - 28) + ' q0,' + f(20 * e + 6) + ' ' + f(-13 * e - 4) + ',' + f(15 * e + 5) + '" fill="none" stroke="#0e0a15" stroke-width="' + f(5 * e + 2) + '" stroke-linecap="round"/></g>';
  }
  /* l'ombre de la poutre dans l'âtre */
  s += '<rect x="' + L.OX0 + '" y="0" width="' + (L.OX1 - L.OX0) + '" height="' + f(Math.min(90, H * .16)) + '" fill="url(#' + P + 'oh)"/>';
  /* 4. la pierre de l'âtre qui avance dans la pièce : son dessus, sa tranche */
  s += '<polygon points="' + pts([[L.JX0 - L.av * .4, L.FY], [L.JX1 + L.av * .4, L.FY], [L.JX1 + L.av, L.FY + L.av], [L.JX0 - L.av, L.FY + L.av]]) + '" fill="#6b607f" stroke="' + K + '" stroke-width="3.5" stroke-linejoin="round"/>' +
    '<polygon points="' + pts([[L.JX0 - L.av, L.FY + L.av], [L.JX1 + L.av, L.FY + L.av], [L.JX1 + L.av, L.FY + L.av + L.tr], [L.JX0 - L.av, L.FY + L.av + L.tr]]) + '" fill="#4a405e" stroke="' + K + '" stroke-width="3.5" stroke-linejoin="round"/>';
  for(i = -3; i <= 3; i++){ var xs = VP.x + i * (L.JX1 - L.JX0) / 6.4; s += '<path d="M' + f(xs) + ',' + (L.FY + 2) + ' L' + f(xs + (xs - VP.x) * .05) + ',' + (L.FY + L.av - 2) + ' M' + f(xs + (xs - VP.x) * .05) + ',' + (L.FY + L.av + 2) + ' v' + (L.tr - 4) + '" stroke="#3f3552" stroke-width="2.4"/>'; }
  s += '<ellipse cx="' + f(L.cx) + '" cy="' + f(L.FY + L.av * .3) + '" rx="' + f(L.sc * 240) + '" ry="' + f(L.av * .9) + '" fill="url(#' + P + 'sf)" opacity=".7"/>';
  /* 5. les deux montants de la cheminée, en grosses pierres claires ; le feu les éclaire du côté de l'âtre */
  var ch = Math.min(70, (L.OX0 - L.JX0) * .6);
  s += '<rect x="' + L.JX0 + '" y="-4" width="' + (L.OX0 - L.JX0) + '" height="' + (L.FY + 4) + '" fill="url(#' + P + 'pc)"/><rect x="' + f(L.OX0 - ch) + '" y="-4" width="' + f(ch) + '" height="' + (L.FY + 4) + '" fill="url(#' + P + 'cg)"/>' +
    '<rect x="' + L.OX1 + '" y="-4" width="' + (L.JX1 - L.OX1) + '" height="' + (L.FY + 4) + '" fill="url(#' + P + 'pc)"/><rect x="' + L.OX1 + '" y="-4" width="' + f(ch) + '" height="' + (L.FY + 4) + '" fill="url(#' + P + 'cd)"/>' +
    '<rect x="' + L.JX0 + '" y="-4" width="' + (L.OX0 - L.JX0) + '" height="' + (L.FY + 4) + '" fill="none" stroke="' + K + '" stroke-width="4"/><rect x="' + L.OX1 + '" y="-4" width="' + (L.JX1 - L.OX1) + '" height="' + (L.FY + 4) + '" fill="none" stroke="' + K + '" stroke-width="4"/>';
  /* les deux corbeaux de pierre qui portent la poutre, en haut des montants (elle avance dans la pièce) */
  if(L.large){
    var cw = L.OX0 - L.JX0, chh = Math.min(30, H * .06);
    [[L.JX0, 1], [L.OX1, -1]].forEach(function(m){
      var a0 = m[0] + cw * .12, a1 = m[0] + cw * .88;
      s += '<polygon points="' + pts([[a0, -2], [a1, -2], [a1 - 9, chh], [a0 + 9, chh]]) + '" fill="#8f88b8" stroke="' + K + '" stroke-width="3.5" stroke-linejoin="round"/>' +
        '<path d="M' + f(a0 + 6) + ',' + f(chh * .5) + ' H' + f(a1 - 6) + '" stroke="#6f689a" stroke-width="2.5"/>';
    });
  }
  /* la poutre avance dans la pièce : son ombre tombe sur les montants */
  s += '<rect x="' + L.JX0 + '" y="0" width="' + (L.JX1 - L.JX0) + '" height="' + f(Math.min(34, H * .07)) + '" fill="url(#' + P + 'oh)"/>';
  /* 6. l'ombre des coins */
  s += '<rect width="' + W + '" height="' + H + '" fill="url(#' + P + 'vi)"/>';
  return s + '</svg>';
}

/* les deux petits dessins du thermomètre : le feu en haut, le givre en bas */
var icFeu = '<svg viewBox="-10 -14 20 24" aria-hidden="true"><path d="' + flamme(0, 7, 14, 19, 1.5) + '" fill="#f4511e" stroke="' + K + '" stroke-width="2"/><path d="' + flamme(0, 7, 7, 10, 1) + '" fill="#ffd36a"/></svg>';
var icGivre = '<svg viewBox="-10 -10 20 20" aria-hidden="true">' + flocon(8, '#2f6fb0') + '</svg>';

MJ.chaudronDessin = {BUCHES:BUCHES, svg:svg, reserve:reserve, bocal:bocal, decor:decor, icFeu:icFeu, icGivre:icGivre};
})();
