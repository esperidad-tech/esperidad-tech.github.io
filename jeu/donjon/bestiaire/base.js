/* Bestiaire du donjon (Romain, 8 novembre, 18 h 49) : outils communs de dessin et fiche de présentation.
   Chaque bête s'ajoute dans window.BESTIAIRE[id] = {nom, rang, pv, lieu, livre, dessin:function(){ return svg }}. */
(function(){
var O = '#24182e';
var uid = 0;
function P(d, f, x){ return '<path d="' + d + '" fill="' + f + '" stroke="' + O + '" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"' + (x || '') + '/>'; }
function L(d, c, w, x){ return '<path d="' + d + '" fill="none" stroke="' + c + '" stroke-width="' + w + '" stroke-linejoin="round" stroke-linecap="round"' + (x || '') + '/>'; }
function F(d, f, x){ return '<path d="' + d + '" fill="' + f + '"' + (x || '') + '/>'; }
function C(x, y, r, f, x2){ return '<circle cx="' + x + '" cy="' + y + '" r="' + r + '" fill="' + f + '"' + (x2 || '') + '/>'; }
/* un chemin écrit autour d'un centre (cx, cy) : chaque paire « x y » est décalée */
function T(d, cx, cy){ return d.replace(/(-?\d+(?:\.\d+)?) (-?\d+(?:\.\d+)?)/g, function(m, a, b){ return (cx + +a) + ' ' + (cy + +b); }); }
function hx(c){ c = c.replace('#', ''); return [0, 2, 4].map(function(i){ return parseInt(c.substr(i, 2), 16); }); }
function mix(a, b, t){ var A = hx(a), B = hx(b); return '#' + A.map(function(v, i){ var r = Math.round(v + (B[i] - v) * t); return (r < 16 ? '0' : '') + r.toString(16); }).join(''); }
function clair(c, t){ return mix(c, '#fff6e6', t); }
function sombre(c, t){ return mix(c, '#120a1e', t); }
function rng(s){ return function(){ s = (s * 9301 + 49297) % 233280; return s / 233280; }; }
var LUNE = '#bfe8ff';   /* la lumière de lune qui tombe de la grille du plafond, et les runes */

/* ---------- un dessin : ses dégradés et son grain ---------- */
function Dessin(){ this.defs = []; }
Dessin.prototype.g = function(c, fort){   /* lumière en haut à droite */
  fort = fort || 1;
  var id = 'g' + (++uid);
  this.defs.push('<linearGradient id="' + id + '" x1="1" y1="0" x2="0" y2="1"><stop offset="0" stop-color="' + clair(c, .26 * fort) + '"/><stop offset=".45" stop-color="' + c + '"/><stop offset="1" stop-color="' + sombre(c, .42 * fort) + '"/></linearGradient>');
  return 'url(#' + id + ')';
};
Dessin.prototype.halo = function(c0, c1){
  var id = 'h' + (++uid);
  this.defs.push('<radialGradient id="' + id + '"><stop offset="0" stop-color="' + c0 + '"/><stop offset=".45" stop-color="' + c1 + '" stop-opacity=".6"/><stop offset="1" stop-color="' + c1 + '" stop-opacity="0"/></radialGradient>');
  return 'url(#' + id + ')';
};
Dessin.prototype.flou = function(n){
  var id = 'f' + (++uid);
  this.defs.push('<filter id="' + id + '" x="-1" y="-1" width="3" height="3"><feGaussianBlur stdDeviation="' + n + '"/></filter>');
  return 'url(#' + id + ')';
};
Dessin.prototype.svg = function(vb, corps){
  var gr = 'gr' + (++uid);
  return '<svg viewBox="' + vb + '" style="width:100%;height:100%;overflow:visible;display:block"><defs>' + this.defs.join('') +
    '<filter id="' + gr + '" x="-30%" y="-30%" width="160%" height="160%" color-interpolation-filters="sRGB">' +
    '<feTurbulence type="fractalNoise" baseFrequency="1.1" numOctaves="2" seed="5" result="n"/>' +
    '<feColorMatrix in="n" type="matrix" values=".33 .33 .33 0 0  .33 .33 .33 0 0  .33 .33 .33 0 0  0 0 0 0 1" result="g"/>' +
    '<feComposite in="g" in2="SourceAlpha" operator="in" result="m"/>' +
    '<feBlend in="m" in2="SourceGraphic" mode="soft-light"/></filter></defs>' +
    '<g filter="url(#' + gr + ')">' + corps + '</g></svg>';
};


/* ---------- la fiche de présentation ---------- */
var RANGS = {monstre:['Monstre', '#4e5f86', '#9fb2e0'], elite:['Élite', '#6a3fa0', '#d2b4ff'], boss:['Boss', '#9a2a2a', '#ffd36a'], tard:['Plus tard', '#1f6a78', '#8ff3ff']};
var CSS = '<style>' +
  '.bt-carte{position:relative;width:560px;height:760px;border-radius:22px;overflow:hidden;font-family:var(--f-texte),Andika,sans-serif;color:#f3e7cb;background:#0b0810;border:3px solid #8a6a3a;box-shadow:0 0 0 3px #24182e,0 18px 40px rgba(0,0,0,.6)}' +
  '.bt-carte *{box-sizing:border-box}.bt-abs{position:absolute}' +
  '.bt-rang{left:22px;top:20px;padding:5px 14px;border-radius:999px;font-weight:800;font-size:14px;letter-spacing:.12em;text-transform:uppercase;border:2px solid;box-shadow:0 2px 0 #000}' +
  '.bt-pv{right:22px;top:16px;text-align:right}.bt-pv b{font-size:22px;color:#ffd9a0;text-shadow:0 2px 0 #24182e}.bt-pv small{font-size:13px;opacity:.7;margin-left:4px}' +
  '.bt-barre{width:150px;height:9px;border-radius:5px;background:#3a1a22;border:2px solid #24182e;margin-top:4px;overflow:hidden}.bt-barre i{display:block;height:100%;background:linear-gradient(#ff6a6a,#b8202e)}' +
  '.bt-bete{left:10px;top:58px;width:540px;height:430px}' +
  '.bt-plaque{left:0;right:0;top:494px;bottom:0;padding:16px 30px 0;background:linear-gradient(rgba(11,8,16,0),rgba(11,8,16,.92) 18%,#0b0810);text-align:center}' +
  '.bt-nom{font-family:var(--f-titre),Macondo,serif;font-size:36px;line-height:1.05;color:#ffe3a3;text-shadow:0 3px 0 #24182e,0 0 18px rgba(255,190,90,.25)}' +
  '.bt-lieu{margin-top:4px;font-size:12.5px;letter-spacing:.16em;text-transform:uppercase;color:#bfa77a}' +
  '.bt-orn{margin:10px auto 8px;width:220px;height:10px}' +
  '.bt-livre{font-size:15.5px;line-height:1.35;font-style:italic;color:#e8dcc0}.bt-livre b{font-style:normal;color:#8ff3ff;font-size:12px;letter-spacing:.1em;text-transform:uppercase;display:block;margin-bottom:3px}' +
  '.bt-combo{position:absolute;left:24px;right:24px;bottom:16px;display:flex;justify-content:center;gap:8px;flex-wrap:wrap;font-size:12.5px}' +
  '.bt-combo span{padding:4px 10px;border-radius:999px;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.14)}.bt-combo .ok{border-color:#5fd08a;color:#bff5d0}.bt-combo .pi{border-color:#ff6a6a;color:#ffc4c4}' +
  '</style>';
function fond(){
  var R = rng(31), s = '<svg class="bt-abs" style="inset:0" viewBox="0 0 560 760" width="560" height="760"><defs>' +
    '<radialGradient id="bt-f" cx=".62" cy=".3" r=".8"><stop offset="0" stop-color="#3e3358"/><stop offset=".5" stop-color="#1b1528"/><stop offset="1" stop-color="#09070e"/></radialGradient>' +
    '<pattern id="bt-p" width="64" height="34" patternUnits="userSpaceOnUse"><path d="M0 0 h64 M0 17 h64 M0 0 v17 M32 0 v17 M16 17 v17 M48 17 v17" stroke="#0a0712" stroke-width="3" fill="none"/></pattern>' +
    '<linearGradient id="bt-l" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#cfe8ff" stop-opacity=".22"/><stop offset="1" stop-color="#cfe8ff" stop-opacity="0"/></linearGradient>' +
    '<radialGradient id="bt-v" cx=".5" cy=".42" r=".75"><stop offset=".55" stop-color="#05030a" stop-opacity="0"/><stop offset="1" stop-color="#05030a" stop-opacity=".9"/></radialGradient>' +
    '<filter id="bt-b" x="-1" y="-1" width="3" height="3"><feGaussianBlur stdDeviation="10"/></filter></defs>' +
    '<rect width="560" height="760" fill="url(#bt-f)"/><rect width="560" height="470" fill="url(#bt-p)" opacity=".55"/>';
  for(var k = 0; k < 70; k++){ var x = Math.floor(R() * 18) * 32 + (k % 2 ? 16 : 0), y = Math.floor(R() * 27) * 17; s += '<rect x="' + (x + 1.5) + '" y="' + (y + 1.5) + '" width="29" height="14" fill="' + (R() < .5 ? '#4a3f62' : '#0c0816') + '" opacity="' + (.2 + R() * .3).toFixed(2) + '"/>'; }
  s += '<path d="M330 0 L 420 0 L 520 470 L 200 470 Z" fill="url(#bt-l)"/>' +
    '<path d="M0 452 Q 280 430 560 452 L 560 500 L 0 500 Z" fill="#191426"/><path d="M0 452 Q 280 430 560 452" stroke="#2c2440" stroke-width="3" fill="none"/>' +
    '<ellipse cx="280" cy="470" rx="230" ry="26" fill="#8a90c0" opacity=".14" filter="url(#bt-b)"/>' +
    '<rect width="560" height="760" fill="url(#bt-v)"/>' +
    '<path d="M14 40 V 14 H 40 M520 14 H 546 V 40 M14 720 V 746 H 40 M520 746 H 546 V 720" stroke="#c9a35a" stroke-width="3" fill="none" opacity=".8"/></svg>';
  return s;
}
function fiche(id){
  var b = window.BESTIAIRE[id], r = RANGS[b.rang], pvMax = b.rang === 'boss' || b.rang === 'tard' ? 1000 : b.rang === 'elite' ? 300 : 100;
  return CSS + '<div class="bt-carte">' + fond() +
    '<div class="bt-abs bt-rang" style="background:' + r[1] + ';border-color:' + r[2] + ';color:#fff">' + r[0] + '</div>' +
    '<div class="bt-abs bt-pv"><b>' + b.pv.toLocaleString('fr-FR') + '</b><small>PV</small><div class="bt-barre"><i style="width:' + Math.min(100, b.pv / pvMax * 100) + '%"></i></div></div>' +
    '<div class="bt-abs bt-bete">' + b.dessin() + '</div>' +
    '<div class="bt-abs bt-plaque"><div class="bt-nom">' + b.nom + '</div><div class="bt-lieu">' + b.lieu + '</div>' +
    '<svg class="bt-orn" viewBox="0 0 220 10"><path d="M0 5 H 92 M128 5 H 220" stroke="#8a6a3a" stroke-width="2"/><path d="M110 0 L 118 5 L 110 10 L 102 5 Z" fill="#c9a35a"/></svg>' +
    '<div class="bt-livre"><b>Le Grand Livre</b>' + b.livre + '</div></div>' +
    '<div class="bt-combo">' + (b.combo || []).map(function(c){ return '<span class="' + (c[0] === '+' ? 'ok' : c[0] === '!' ? 'pi' : '') + '">' + c.slice(1) + '</span>'; }).join('') + '</div></div>';
}
window.BESTIAIRE = window.BESTIAIRE || {};
window.BT = {P:P, L:L, F:F, C:C, T:T, mix:mix, clair:clair, sombre:sombre, rng:rng, Dessin:Dessin, O:O, LUNE:LUNE, fiche:fiche};
})();
