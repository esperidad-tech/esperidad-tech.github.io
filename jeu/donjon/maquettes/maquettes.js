/* Maquettes du donjon (images fixes) — dessinées avec les vrais héros du jeu (Persos). */
(function(){
var O = '#24182e';
function heros(role, sexe, buste){
  var tmp = document.createElement('div'); tmp.style.cssText = 'position:absolute;left:-9999px;top:0;width:300px;height:440px';
  document.body.appendChild(tmp);
  tmp.innerHTML = Persos.heros(Persos.defaut(role, sexe), {fond:false, anime:false});
  var s = tmp.querySelector('svg'), bb = s.getBBox();
  var x = bb.x - 4, y = bb.y - 4, w = bb.width + 8, h = bb.height + 8;
  if(buste){ var c = Math.min(w, h * 0.5); x = x + (w - c) / 2; w = c; h = c * 1.05; }
  s.setAttribute('viewBox', [x, y, w, h].map(function(n){ return Math.round(n); }).join(' '));
  s.setAttribute('preserveAspectRatio', buste ? 'xMidYMin meet' : 'xMidYMax meet');
  s.style.width = '100%'; s.style.height = '100%'; s.style.display = 'block'; s.style.overflow = 'visible';
  var out = s.outerHTML; tmp.remove(); return out;
}
var nid = 0;
function rat(sens, sombre){
  var i = 'rt' + (++nid), f = sens === 'd' ? ' transform="translate(200 0) scale(-1 1)"' : '';
  return '<svg viewBox="0 0 200 124" style="width:100%;height:100%;display:block;overflow:visible">' +
    '<defs><linearGradient id="' + i + 'c" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="' + (sombre ? '#6d5e6c' : '#8c7a86') + '"/><stop offset="1" stop-color="' + (sombre ? '#3a2f3a' : '#4d3e4b') + '"/></linearGradient>' +
    '<filter id="' + i + 'g" x="-1" y="-1" width="3" height="3"><feGaussianBlur stdDeviation="3"/></filter></defs>' +
    '<ellipse cx="100" cy="116" rx="70" ry="7" fill="#000" opacity=".45"/><g' + f + '>' +
    '<path d="M150 86 C 186 82 198 56 184 38 C 176 29 165 36 171 44" stroke="' + O + '" stroke-width="10" fill="none" stroke-linecap="round"/>' +
    '<path d="M150 86 C 186 82 198 56 184 38 C 176 29 165 36 171 44" stroke="#d68d9c" stroke-width="5" fill="none" stroke-linecap="round"/>' +
    '<ellipse cx="78" cy="106" rx="11" ry="7" fill="#3a2f3a" stroke="' + O + '" stroke-width="3"/><ellipse cx="136" cy="106" rx="12" ry="7" fill="#3a2f3a" stroke="' + O + '" stroke-width="3"/>' +
    '<path d="M52 78 C 52 44 86 34 116 38 C 150 42 166 62 162 84 C 158 104 128 108 100 106 C 72 104 52 100 52 78 Z" fill="url(#' + i + 'c)" stroke="' + O + '" stroke-width="4"/>' +
    '<path d="M70 44 l6 -10 l5 9 l6 -11 l5 10 l7 -11 l4 11 l7 -9 l3 10" fill="none" stroke="' + O + '" stroke-width="3" stroke-linejoin="round"/>' +
    '<path d="M66 60 C 44 52 20 60 8 74 C 18 86 42 92 66 88 Z" fill="url(#' + i + 'c)" stroke="' + O + '" stroke-width="4" stroke-linejoin="round"/>' +
    '<ellipse cx="66" cy="50" rx="13" ry="15" fill="#c98896" stroke="' + O + '" stroke-width="3.5"/><ellipse cx="66" cy="52" rx="6" ry="8" fill="#9a5f6c"/>' +
    '<circle cx="38" cy="68" r="9" fill="#ff2a3a" filter="url(#' + i + 'g)" opacity=".9"/><circle cx="38" cy="68" r="5" fill="#ff4a4a" stroke="' + O + '" stroke-width="2"/><circle cx="36.5" cy="66.5" r="1.6" fill="#fff"/>' +
    '<circle cx="9" cy="74" r="4.5" fill="#f07a8a" stroke="' + O + '" stroke-width="2.5"/>' +
    '<path d="M18 84 l3 9 l4 -8 Z M25 85 l3 8 l3 -8 Z" fill="#fff6e0" stroke="' + O + '" stroke-width="1.8" stroke-linejoin="round"/>' +
    '<path d="M16 70 l-14 -6 M16 74 l-15 1 M18 78 l-13 7" stroke="#d8d0d8" stroke-width="1.4" stroke-linecap="round"/>' +
    '</g></svg>';
}
function chauve(){
  var i = 'cs' + (++nid);
  return '<svg viewBox="0 0 160 90" style="width:100%;height:100%;display:block;overflow:visible"><defs><filter id="' + i + '" x="-1" y="-1" width="3" height="3"><feGaussianBlur stdDeviation="2.5"/></filter></defs>' +
    '<path d="M80 40 C 60 18 34 10 6 22 C 18 28 20 38 14 46 C 26 42 34 48 34 58 C 46 50 58 52 66 58 Z" fill="#4c3a6e" stroke="' + O + '" stroke-width="3.5" stroke-linejoin="round"/>' +
    '<path d="M80 40 C 100 18 126 10 154 22 C 142 28 140 38 146 46 C 134 42 126 48 126 58 C 114 50 102 52 94 58 Z" fill="#4c3a6e" stroke="' + O + '" stroke-width="3.5" stroke-linejoin="round"/>' +
    '<path d="M20 26 L 60 44 M30 22 L 62 40 M140 26 L 100 44 M130 22 L 98 40" stroke="#6c58a0" stroke-width="2"/>' +
    '<ellipse cx="80" cy="50" rx="17" ry="20" fill="#5e4a84" stroke="' + O + '" stroke-width="3.5"/>' +
    '<path d="M67 34 l-4 -12 l10 8 Z M93 34 l4 -12 l-10 8 Z" fill="#5e4a84" stroke="' + O + '" stroke-width="3" stroke-linejoin="round"/>' +
    '<circle cx="73" cy="46" r="6" fill="#ff2a3a" filter="url(#' + i + ')"/><circle cx="87" cy="46" r="6" fill="#ff2a3a" filter="url(#' + i + ')"/>' +
    '<circle cx="73" cy="46" r="3.2" fill="#ff5050" stroke="' + O + '" stroke-width="1.5"/><circle cx="87" cy="46" r="3.2" fill="#ff5050" stroke="' + O + '" stroke-width="1.5"/>' +
    '<path d="M75 58 l2 5 l2 -5 M81 58 l2 5 l2 -5" stroke="#fff" stroke-width="1.6" fill="none"/></svg>';
}
function torche(){
  return '<svg viewBox="0 0 60 120" style="width:100%;height:100%;display:block;overflow:visible"><defs>' +
    '<radialGradient id="tq-h" cx=".5" cy=".6" r=".5"><stop offset="0" stop-color="#fff6c0"/><stop offset=".45" stop-color="#ffc040"/><stop offset="1" stop-color="#ff6a1a"/></radialGradient></defs>' +
    '<rect x="25" y="46" width="10" height="70" rx="4" fill="#7a4e2c" stroke="' + O + '" stroke-width="3"/><rect x="21" y="42" width="18" height="12" rx="3" fill="#4a3a30" stroke="' + O + '" stroke-width="3"/>' +
    '<path d="M30 4 C 40 20 50 26 46 38 C 44 46 38 48 30 48 C 22 48 16 46 14 38 C 11 28 22 22 26 12 C 28 20 32 22 30 4 Z" fill="url(#tq-h)" stroke="' + O + '" stroke-width="3" stroke-linejoin="round"/>' +
    '<path d="M30 26 C 35 32 36 38 32 44 C 27 44 25 40 27 34 Z" fill="#fff8d8"/></svg>';
}
function jaugeTorche(p, l){
  return '<div class="mq-torche" style="width:' + (l || 150) + 'px"><span>🔥</span><i><b style="width:' + p + '%"></b></i></div>';
}
function lire(){ return '<span class="mq-lire">🔊</span>'; }
function coeurs(n, t){ var s = ''; for(var k = 0; k < t; k++) s += '<span class="mq-c' + (k < n ? '' : ' vide') + '">❤</span>'; return s; }
function pips(n, t){ var s = ''; for(var k = 0; k < t; k++) s += '<i class="' + (k < n ? 'on' : '') + '"></i>'; return '<div class="mq-pips">' + s + '</div>'; }

var CSS = '<style>' +
  '.mq{position:relative;overflow:hidden;font-family:var(--f-texte);color:#fff4e0;background:#100c18}' +
  '.mq *{box-sizing:border-box}' +
  '.mq-abs{position:absolute}' +
  '.mq-torche{display:flex;align-items:center;gap:6px;font-size:20px}.mq-torche i{flex:1;height:14px;border-radius:99px;background:#2a2036;border:3px solid ' + O + ';overflow:hidden;box-shadow:0 0 0 2px #5a4a2a}' +
  '.mq-torche b{display:block;height:100%;background:linear-gradient(90deg,#ff6a1a,#ffc040,#fff2a0);box-shadow:0 0 12px #ffb040}' +
  '.mq-lire{display:inline-grid;place-items:center;width:34px;height:34px;border-radius:50%;background:rgba(255,255,255,.14);font-size:17px;flex:none}' +
  '.mq-btn{display:flex;align-items:center;justify-content:center;gap:6px;border-radius:999px;background:linear-gradient(#ffe28a,#f5b945);color:#1a1208;font-weight:800;border:3px solid ' + O + ';box-shadow:0 4px 0 rgba(0,0,0,.45);font-size:15px;line-height:1.1;text-align:center;padding:6px 12px}' +
  '.mq-btn.sec{background:linear-gradient(#3a3456,#28233f);color:#fff4e0}' +
  '.mq-btn em{font-style:normal;font-size:20px}' +
  '.mq-pill{display:inline-block;padding:3px 10px;border-radius:99px;background:#f5b945;color:#1a1208;font-weight:800;font-size:13px;border:2.5px solid ' + O + ';white-space:nowrap}' +
  '.mq-pips{display:flex;gap:4px;justify-content:center}.mq-pips i{width:12px;height:12px;border-radius:3px;background:#3a2a36;border:2px solid ' + O + ';transform:rotate(45deg)}.mq-pips i.on{background:#ff4a5a;box-shadow:0 0 6px #ff4a5a}' +
  '.mq-c{color:#ff5a6e;font-size:16px;text-shadow:0 1px 0 ' + O + '}.mq-c.vide{color:#3a2a36}' +
  '.mq-bulle{display:flex;align-items:center;gap:10px;padding:8px 10px 8px 14px;border-radius:16px;background:#f3e7cb;color:#35281b;border:3px solid ' + O + ';box-shadow:0 5px 0 rgba(0,0,0,.4);font-weight:700;font-size:15px;line-height:1.25}' +
  '.mq-bulle .mq-lire{background:rgba(36,24,46,.12)}' +
  '.mq-anneau{position:absolute;border-radius:50%;border:4px solid #ffd36a;box-shadow:0 0 18px #ffb040, inset 0 0 12px #ffb040}' +
  '.mq-titre{font-family:var(--f-titre);color:#ffe3a3;text-shadow:0 2px 0 ' + O + '}' +
  '</style>';

/* ============ A. Le couloir (façon Darkest Dungeon), écran couché ============ */
function A(){
  var W = 844, H = 390, sol = 300;
  var bg = '<svg class="mq-abs" style="inset:0" viewBox="0 0 ' + W + ' ' + H + '" width="' + W + '" height="' + H + '"><defs>' +
    '<pattern id="pa-pierre" width="76" height="40" patternUnits="userSpaceOnUse"><rect width="76" height="40" fill="#2a2236"/>' +
    '<path d="M0 0 h76 M0 20 h76 M0 0 v20 M38 0 v20 M19 20 v20 M57 20 v20" stroke="#17121f" stroke-width="3"/><path d="M4 4 h28 M42 24 h12" stroke="#3a3048" stroke-width="2"/></pattern>' +
    '<radialGradient id="pa-lum" cx="310" cy="160" r="430" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#ffb860" stop-opacity=".55"/><stop offset=".35" stop-color="#ff8a30" stop-opacity=".18"/><stop offset="1" stop-color="#ff8a30" stop-opacity="0"/></radialGradient>' +
    '<radialGradient id="pa-vig" cx="320" cy="190" r="520" gradientUnits="userSpaceOnUse"><stop offset=".38" stop-color="#000" stop-opacity="0"/><stop offset=".8" stop-color="#05030a" stop-opacity=".78"/><stop offset="1" stop-color="#05030a" stop-opacity=".92"/></radialGradient>' +
    '<linearGradient id="pa-sol" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3a3044"/><stop offset="1" stop-color="#16101e"/></linearGradient></defs>' +
    '<rect width="' + W + '" height="' + H + '" fill="url(#pa-pierre)"/>' +
    [120, 470, 780].map(function(x){ return '<path d="M' + (x - 70) + ' ' + sol + ' V 120 C ' + (x - 70) + ' 50 ' + (x + 70) + ' 50 ' + (x + 70) + ' 120 V ' + sol + ' Z" fill="#0d0a14" stroke="#3e3350" stroke-width="6"/>'; }).join('') +
    
    '<path d="M0 ' + sol + ' H ' + W + ' V ' + H + ' H 0 Z" fill="url(#pa-sol)"/>' +
    '<path d="M0 ' + (sol + 30) + ' H ' + W + ' M0 ' + (sol + 62) + ' H ' + W + ' M120 ' + sol + ' L 90 ' + H + ' M300 ' + sol + ' L 290 ' + H + ' M480 ' + sol + ' L 490 ' + H + ' M660 ' + sol + ' L 690 ' + H + '" stroke="#110c18" stroke-width="3"/>' +
    '<path d="M700 ' + (sol + 18) + ' c 10 -6 20 -6 30 0 M610 ' + (sol + 44) + ' c 8 -4 16 -4 24 0" stroke="#5a4a66" stroke-width="2" fill="none"/>' +
    '<rect width="' + W + '" height="' + H + '" fill="url(#pa-lum)"/>' +
    '</svg>';
  var vig = '<svg class="mq-abs" style="inset:0;pointer-events:none" viewBox="0 0 ' + W + ' ' + H + '" width="' + W + '" height="' + H + '"><rect width="' + W + '" height="' + H + '" fill="url(#pa-vig)"/></svg>';
  var hx = [[30, 'sage', 'f'], [140, 'alchimiste', 'm'], [250, 'pisteur', 'f']];
  var hs = hx.map(function(a){ return '<div class="mq-abs" style="left:' + a[0] + 'px;top:' + (sol - 196) + 'px;width:112px;height:200px">' + heros(a[1], a[2]) + '</div>'; }).join('');
  var anneau = '<div class="mq-anneau" style="left:140px;top:' + (sol - 14) + 'px;width:112px;height:26px"></div>' +
    '<div class="mq-abs" style="left:146px;top:' + (sol - 236) + 'px"><span class="mq-pill">À toi, Alchimiste !</span></div>';
  var tq = '<div class="mq-abs" style="left:318px;top:' + (sol - 214) + 'px;width:34px;height:70px;transform:rotate(14deg)">' + torche() + '</div>';
  var mon = '<div class="mq-abs" style="left:470px;top:' + (sol - 104) + 'px;width:170px;height:106px">' + rat('g') + '</div>' +
    '<div class="mq-abs" style="left:520px;top:' + (sol - 132) + 'px;width:70px">' + pips(3, 3) + '</div>' +
    '<div class="mq-abs" style="left:640px;top:' + (sol - 92) + 'px;width:150px;height:94px">' + rat('g', true) + '</div>' +
    '<div class="mq-abs" style="left:684px;top:' + (sol - 118) + 'px;width:70px">' + pips(2, 3) + '</div>' +
    '';
  var hud = '<div class="mq-abs" style="left:14px;top:12px">' + jaugeTorche(62, 170) + '</div>' +
    '<div class="mq-abs mq-titre" style="left:0;right:0;top:10px;text-align:center;font-size:20px">Salle 2 sur 3</div>' +
    '<div class="mq-abs" style="right:14px;top:10px;font-size:13px;opacity:.85">🗺️ Le plan : chez le Sage</div>' +
    '<div class="mq-abs" style="left:372px;right:16px;top:46px"><div class="mq-bulle" style="font-size:14px">Deux rats gros comme des chiens… et ton sac qui cliquette, Alchimiste !' + lire() + '</div></div>';
  var bas = '<div class="mq-abs" style="left:0;right:0;bottom:0;height:78px;background:linear-gradient(transparent,rgba(5,3,10,.92) 40%);display:flex;gap:10px;align-items:center;justify-content:center;padding:14px 12px 10px">' +
    '<div class="mq-btn" style="width:190px;height:52px"><em>🧪</em>Fiole de feu</div>' +
    '<div class="mq-btn" style="width:190px;height:52px"><em>💨</em>Fumigène</div>' +
    '<div class="mq-btn" style="width:190px;height:52px"><em>💚</em>Baume (Sage)</div>' +
    '<div class="mq-btn sec" style="width:120px;height:52px"><em>🎒</em>Sac · 4</div></div>';
  return CSS + '<div class="mq" style="width:' + W + 'px;height:' + H + 'px">' + bg + hs + tq + mon + vig + anneau + hud + bas + '</div>';
}

/* ============ B. La coupe (le sous-sol vu en tranche), écran debout ============ */
function B(){
  var W = 390, H = 844, surf = 150;
  var s = '<svg class="mq-abs" style="inset:0" viewBox="0 0 ' + W + ' ' + H + '" width="' + W + '" height="' + H + '"><defs>' +
    '<linearGradient id="pb-ciel" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#14183c"/><stop offset="1" stop-color="#2c2f66"/></linearGradient>' +
    '<linearGradient id="pb-terre" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#4a3424"/><stop offset=".5" stop-color="#2e2018"/><stop offset="1" stop-color="#160f0c"/></linearGradient>' +
    '<radialGradient id="pb-lum" cx="140" cy="355" r="150" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#ffc070" stop-opacity=".7"/><stop offset=".55" stop-color="#ff8a30" stop-opacity=".22"/><stop offset="1" stop-color="#ff8a30" stop-opacity="0"/></radialGradient>' +
    '<radialGradient id="pb-lum1" cx="300" cy="230" r="80" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#8ff3ff" stop-opacity=".22"/><stop offset="1" stop-color="#8ff3ff" stop-opacity="0"/></radialGradient>' +
    '<filter id="pb-flou"><feGaussianBlur stdDeviation="2.2"/></filter>' +
    '<linearGradient id="pb-noir" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#07050b" stop-opacity="0"/><stop offset=".38" stop-color="#07050b" stop-opacity=".96"/><stop offset="1" stop-color="#07050b"/></linearGradient></defs>' +
    '<rect width="' + W + '" height="' + surf + '" fill="url(#pb-ciel)"/>' +
    [[30, 20], [90, 40], [160, 14], [220, 34], [350, 22], [120, 70], [260, 60]].map(function(p){ return '<circle cx="' + p[0] + '" cy="' + p[1] + '" r="1.6" fill="#fff" opacity=".8"/>'; }).join('') +
    '<path d="M0 ' + surf + ' V 104 L 26 84 L 52 104 V 92 L 90 70 L 128 92 V ' + surf + ' Z M128 ' + surf + ' V 100 L 160 78 L 192 100 V ' + surf + ' Z M196 ' + surf + ' V 108 L 222 90 L 248 108 V ' + surf + ' Z" fill="#0d1030" stroke="' + O + '" stroke-width="3"/>' +
    '<path d="M268 ' + surf + ' V 62 L 300 20 L 332 62 V ' + surf + ' Z" fill="#0d1030" stroke="' + O + '" stroke-width="3"/><path d="M290 70 h20 v16 h-20 Z" fill="#ffd36a" opacity=".8"/><path d="M300 22 v-12" stroke="#0d1030" stroke-width="3"/>' +
    '<path d="M340 ' + surf + ' V 104 L 366 86 L 392 104 V ' + surf + ' Z" fill="#0d1030" stroke="' + O + '" stroke-width="3"/>' +
    [[40, 120], [104, 118], [170, 124], [230, 126], [365, 124]].map(function(p){ return '<rect x="' + p[0] + '" y="' + p[1] + '" width="9" height="9" fill="#ffd36a" opacity=".85"/>'; }).join('') +
    '<path d="M0 96 Q 60 118 128 96 Q 200 124 268 100" stroke="#3a3048" stroke-width="1.5" fill="none"/>' +
    [[20, 103, '#ff6a6a'], [50, 108, '#ffd36a'], [80, 108, '#8ff3ff'], [110, 101, '#a8f0a0'], [150, 104, '#ff6a6a'], [190, 110, '#ffd36a'], [230, 108, '#8ff3ff']].map(function(p){ return '<circle cx="' + p[0] + '" cy="' + p[1] + '" r="5" fill="' + p[2] + '" stroke="' + O + '" stroke-width="1.5"/><circle cx="' + p[0] + '" cy="' + p[1] + '" r="9" fill="' + p[2] + '" opacity=".25" filter="url(#pb-flou)"/>'; }).join('') +
    '<rect y="' + surf + '" width="' + W + '" height="' + (600 - surf) + '" fill="url(#pb-terre)"/>' +
    '<path d="M0 ' + surf + ' H ' + W + '" stroke="#3f7a3a" stroke-width="6"/>' +
    '<path d="M40 ' + (surf + 4) + ' c 6 20 -4 30 4 46 M60 ' + (surf + 4) + ' c -4 16 6 24 0 38 M200 ' + (surf + 4) + ' c 8 14 0 26 8 40" stroke="#5a3f2a" stroke-width="3" fill="none"/>' +
    [[30, 250, 14], [350, 330, 18], [190, 470, 12], [60, 560, 16], [330, 560, 12], [210, 280, 9]].map(function(p){ return '<ellipse cx="' + p[0] + '" cy="' + p[1] + '" rx="' + p[2] + '" ry="' + (p[2] * 0.7) + '" fill="#3c2b22" stroke="#1c140f" stroke-width="2"/>'; }).join('') +
    /* l'escalier de la crypte, sous le clocher */
    '<path d="M286 ' + surf + ' V 186 H 314 V ' + surf + '" fill="#18121c" stroke="#5a4a40" stroke-width="3"/>' +
    '<path d="M288 160 h24 M288 170 h24 M288 180 h24" stroke="#5a4a40" stroke-width="2"/>' +
    /* salle 1 (déjà vue) */
    '<path d="M240 186 H 360 C 372 186 376 196 376 208 V 252 C 376 264 368 270 356 270 H 244 C 232 270 226 262 226 250 V 204 C 226 192 230 186 240 186 Z" fill="#2c2636" stroke="#5a4a40" stroke-width="4"/>' +
    '<rect x="226" y="186" width="150" height="84" fill="url(#pb-lum1)"/>' +
    '<text x="300" y="234" text-anchor="middle" font-size="12" fill="#bfb2c8" font-family="Trebuchet MS">✔ la crypte (vue)</text>' +
    /* tunnel vers la salle 2 */
    '<path d="M228 250 C 200 270 210 300 196 318" stroke="#2c2636" stroke-width="26" fill="none" stroke-linecap="round"/>' +
    '<path d="M228 250 C 200 270 210 300 196 318" stroke="#5a4a40" stroke-width="30" fill="none" stroke-linecap="round" opacity=".35"/>' +
    /* salle 2 (ici) */
    '<path d="M40 310 H 220 C 236 310 244 320 244 336 V 392 C 244 408 236 414 220 414 H 40 C 24 414 18 404 18 390 V 334 C 18 318 26 310 40 310 Z" fill="#3a3044" stroke="#7a6a58" stroke-width="4"/>' +
    '<rect x="0" y="230" width="300" height="260" fill="url(#pb-lum)"/>' +
    /* deux tunnels vers le noir */
    '<path d="M60 414 C 54 440 30 450 26 500" stroke="#5a4a40" stroke-width="30" fill="none" opacity=".35"/><path d="M60 414 C 54 440 30 450 26 500" stroke="#2a2232" stroke-width="24" fill="none"/>' +
    '<path d="M220 404 C 250 430 280 430 300 500" stroke="#5a4a40" stroke-width="30" fill="none" opacity=".35"/><path d="M220 404 C 250 430 280 430 300 500" stroke="#2a2232" stroke-width="24" fill="none"/>' +
    /* le noir : ce qu'on ne connaît pas encore */
    '<rect y="430" width="390" height="170" fill="url(#pb-noir)"/>' +
    '<circle cx="318" cy="520" r="3" fill="#ff3a3a"/><circle cx="328" cy="520" r="3" fill="#ff3a3a"/><circle cx="312" cy="530" r="2" fill="#ff3a3a" opacity=".8"/><circle cx="334" cy="530" r="2" fill="#ff3a3a" opacity=".8"/>' +
    '<circle cx="70" cy="540" r="2.6" fill="#9cff7a" opacity=".7"/><circle cx="80" cy="541" r="2.6" fill="#9cff7a" opacity=".7"/>' +
    
    '</svg>';
  var hs = [['sage', 'f', 52], ['alchimiste', 'm', 92], ['pisteur', 'f', 132]].map(function(a){ return '<div class="mq-abs" style="left:' + a[2] + 'px;top:338px;width:42px;height:74px">' + heros(a[0], a[1]) + '</div>'; }).join('');
  var tq = '<div class="mq-abs" style="left:166px;top:330px;width:16px;height:34px;transform:rotate(12deg)">' + torche() + '</div>';
  var hud = '<div class="mq-abs" style="left:10px;top:' + (surf + 12) + 'px">' + jaugeTorche(62, 140) + '</div>' +
    '<div class="mq-abs mq-titre" style="left:28px;top:318px;font-size:14px">Salle 2</div>' +
    '<div class="mq-abs" style="left:96px;top:296px"><span class="mq-pill" style="font-size:11px">Vous êtes ici</span></div>';
  var bas = '<div class="mq-abs" style="left:0;right:0;top:600px;bottom:0;background:linear-gradient(#1a1324,#100c18);border-top:3px solid #5a4a40;padding:16px 14px 18px;display:flex;flex-direction:column;gap:14px">' +
    '<div class="mq-bulle">Le tunnel se sépare en deux. À gauche, un souffle glacé. À droite, ça sent le crapaud mouillé… Sage, que dit ton plan ?' + lire() + '</div>' +
    '<div style="display:flex;gap:10px"><div class="mq-btn" style="flex:1;height:64px"><em>⬅️</em>Le souffle glacé</div><div class="mq-btn" style="flex:1;height:64px">L\'odeur de crapaud<em>➡️</em></div></div>' +
    '<div style="display:flex;gap:8px;justify-content:center;font-size:13px;opacity:.8"><span>🎒 Sac : 4 potions</span><span>·</span><span>❤ 3 · ❤ 3 · ❤ 2</span></div></div>';
  return CSS + '<div class="mq" style="width:' + W + 'px;height:' + H + 'px">' + s + hs + tq + hud + bas + '</div>';
}

/* ============ C. Les cartes (le combat comme un jeu de société), écran debout ============ */
function C(){
  var W = 390, H = 844;
  var fond = '<svg class="mq-abs" style="inset:0" viewBox="0 0 ' + W + ' ' + H + '" width="' + W + '" height="' + H + '"><defs>' +
    '<pattern id="pc-p" width="70" height="38" patternUnits="userSpaceOnUse"><rect width="70" height="38" fill="#221b2e"/><path d="M0 0 h70 M0 19 h70 M0 0 v19 M35 0 v19 M17 19 v19 M52 19 v19" stroke="#140f1c" stroke-width="3"/></pattern>' +
    '<radialGradient id="pc-l" cx="195" cy="330" r="420" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#ffaa50" stop-opacity=".35"/><stop offset=".5" stop-color="#ff8a30" stop-opacity=".08"/><stop offset="1" stop-color="#000" stop-opacity=".6"/></radialGradient></defs>' +
    '<rect width="' + W + '" height="' + H + '" fill="url(#pc-p)"/><rect width="' + W + '" height="' + H + '" fill="url(#pc-l)"/></svg>';
  function carteMonstre(x, dessin, nom, n, t, intention, sombre){
    return '<div class="mq-abs" style="left:' + x + 'px;top:62px;width:170px;height:236px;border-radius:16px;border:4px solid ' + O + ';background:linear-gradient(#4a2a3a,#22141e);box-shadow:0 6px 0 rgba(0,0,0,.5), inset 0 0 0 3px #7a4a5a">' +
      '<div class="mq-abs" style="left:-4px;right:-4px;top:-26px;text-align:center"><span class="mq-pill" style="background:#ffd9d9;font-size:12px">' + intention + '</span></div>' +
      '<div class="mq-abs" style="left:8px;right:8px;top:14px;height:128px;border-radius:10px;background:radial-gradient(circle at 50% 70%,#5a3a4a,#1a0e16);border:3px solid ' + O + ';padding:14px 6px 4px">' + dessin + '</div>' +
      '<div class="mq-abs mq-titre" style="left:0;right:0;top:150px;text-align:center;font-size:19px">' + nom + '</div>' +
      '<div class="mq-abs" style="left:0;right:0;top:182px">' + pips(n, t) + '</div>' +
      '<div class="mq-abs" style="left:0;right:0;top:204px;text-align:center;font-size:12px;opacity:.75">Mord · rapide</div></div>';
  }
  var monstres = carteMonstre(20, rat('g'), 'Rat géant', 3, 3, '🦷 va mordre la Sage') + carteMonstre(200, rat('g', true), 'Rat géant', 2, 3, '💤 reprend son souffle');
  var conteur = '<div class="mq-abs" style="left:14px;right:14px;top:318px"><div class="mq-bulle" style="font-size:14px">Le premier rat montre les dents à la Sage… Alchimiste, c\'est le moment !' + lire() + '</div></div>';
  function carteHeros(x, role, sexe, nom, n, actif){
    return '<div class="mq-abs" style="left:' + x + 'px;top:' + (actif ? 390 : 410) + 'px;width:112px;height:160px;border-radius:14px;border:4px solid ' + O + ';background:linear-gradient(#34406e,#1c2447);' + (actif ? 'box-shadow:0 0 0 4px #ffd36a, 0 0 26px #ffb040, 0 6px 0 rgba(0,0,0,.5)' : 'box-shadow:0 6px 0 rgba(0,0,0,.5);opacity:.82') + '">' +
      (actif ? '<div class="mq-abs" style="left:-10px;right:-10px;top:-24px;text-align:center"><span class="mq-pill">À toi !</span></div>' : '') +
      '<div class="mq-abs" style="left:6px;right:6px;top:6px;height:96px;border-radius:9px;overflow:hidden;background:radial-gradient(circle at 50% 30%,#4a5a9a,#1c2447)">' + heros(role, sexe, true) + '</div>' +
      '<div class="mq-abs" style="left:0;right:0;top:104px;text-align:center;font-weight:800;font-size:14px">' + nom + '</div>' +
      '<div class="mq-abs" style="left:0;right:0;top:126px;text-align:center">' + coeurs(n, 3) + '</div></div>';
  }
  var equipe = carteHeros(12, 'sage', 'f', 'Sage', 2, false) + carteHeros(139, 'alchimiste', 'm', 'Alchimiste', 3, true) + carteHeros(266, 'pisteur', 'f', 'Pisteur', 3, false);
  function action(x, ic, titre, txt, choisi){
    return '<div class="mq-abs" style="left:' + x + 'px;top:' + (choisi ? 592 : 606) + 'px;width:116px;height:214px;border-radius:14px;border:4px solid ' + O + ';background:linear-gradient(#fbf1da,#e8d6ae);color:#35281b;box-shadow:' + (choisi ? '0 0 0 4px #ffd36a, 0 0 22px #ffb040, ' : '') + '0 6px 0 rgba(0,0,0,.5);padding:10px 8px;text-align:center">' +
      '<div style="font-size:44px;line-height:1.1;margin-top:4px">' + ic + '</div>' +
      '<div style="font-weight:800;font-size:15px;margin-top:6px;line-height:1.1">' + titre + '</div>' +
      '<div style="font-size:12.5px;line-height:1.25;margin-top:8px">' + txt + '</div>' +
      '<div class="mq-abs" style="left:0;right:0;bottom:8px;font-size:11px;opacity:.6">dans ton sac : ' + (choisi ? '2' : '1') + '</div></div>';
  }
  var main = action(14, '🧪', 'Fiole de feu', 'Le rat recule : deux crans de force en moins.', true) + action(137, '💨', 'Fumigène', 'Les rats ratent leur prochaine morsure.') + action(260, '💚', 'Baume', 'Un cœur rendu à un équipier.');
  var haut = '<div class="mq-abs mq-titre" style="left:14px;top:14px;font-size:20px">Salle 2 · Les rats</div><div class="mq-abs" style="right:14px;top:16px">' + jaugeTorche(62, 130) + '</div>';
  return CSS + '<div class="mq" style="width:' + W + 'px;height:' + H + 'px">' + fond + haut + monstres + conteur + equipe + main + '</div>';
}
window.MAQ = {A:A, B:B, C:C};
})();
