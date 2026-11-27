/* ==========================================================
   LES EFFETS (phase 3, version 4) : des étincelles, des braises, des notes, des éclats, des ondes, l'écran qui tremble.
   Tout est dessiné en « lumière » (on ajoute de la lumière à l'image), avec des lueurs peintes une fois.
   Les coordonnées sont celles de l'écran (en points CSS).
   ========================================================== */
(function (G) {
'use strict';
var TAU = Math.PI * 2;
var parts = [], ondes = [], secousse = {f: 0}, LUEURS = {}, temps = 0;
function toile(w, h) { var c = document.createElement('canvas'); c.width = Math.max(1, Math.ceil(w)); c.height = Math.max(1, Math.ceil(h)); return c; }
function lueur(rgb, blanc) {
  var cle = rgb + '|' + blanc; if (LUEURS[cle]) return LUEURS[cle];
  var c = toile(96, 96), x = c.getContext('2d'), gr = x.createRadialGradient(48, 48, 0, 48, 48, 48);
  gr.addColorStop(0, 'rgba(255,255,255,' + blanc + ')'); gr.addColorStop(0.16, 'rgba(' + rgb + ',' + (0.62 + blanc * 0.33) + ')');
  gr.addColorStop(0.45, 'rgba(' + rgb + ',.2)'); gr.addColorStop(1, 'rgba(' + rgb + ',0)');
  x.fillStyle = gr; x.fillRect(0, 0, 96, 96); return (LUEURS[cle] = c);
}
function halo(c, x, y, r, rgb, a, blanc) { if (a <= 0.01 || r <= 0.3) return; c.globalAlpha = Math.min(1, a); c.drawImage(lueur(rgb, blanc === undefined ? 0.5 : blanc), x - r, y - r, r * 2, r * 2); c.globalAlpha = 1; }
/* une particule : {x, y, vx, vy, g (pesanteur), frein, vie, max, r, rgb, blanc, sorte : 'g' lueur | 't' trait | 'n' note | 'e' éclat | 'f' fumée} */
var QE = 2;
function qualite(q) { QE = q; }
function ajouter(o) { if (QE === 0 && Math.random() < 0.5) return o; o.vie = 0; o.max = o.max || 0.6; o.r = o.r || 3; o.rgb = o.rgb || '255,200,120'; o.sorte = o.sorte || 'g'; o.g = o.g || 0; o.frein = o.frein === undefined ? 0.985 : o.frein; o.rot = o.rot || Math.random() * TAU; o.vr = o.vr || (Math.random() - 0.5) * 10; parts.push(o); if (parts.length > 700) parts.splice(0, parts.length - 700); return o; }
/* une gerbe : n particules qui partent d'un point */
function gerbe(x, y, n, o) {
  o = o || {};
  for (var i = 0; i < n; i++) {
    var a = o.angle !== undefined ? o.angle + (Math.random() - 0.5) * (o.ecart || 1) : Math.random() * TAU, v = (o.vit || 160) * (0.3 + Math.random() * 0.9);
    ajouter({x: x + (Math.random() - 0.5) * (o.disp || 0), y: y + (Math.random() - 0.5) * (o.disp || 0), vx: Math.cos(a) * v, vy: Math.sin(a) * v - (o.monte || 0), g: o.g || 0, frein: o.frein,
      max: (o.vie || 0.6) * (0.6 + Math.random() * 0.7), r: (o.r || 3) * (0.6 + Math.random() * 0.8), rgb: o.rgb, blanc: o.blanc, sorte: o.sorte});
  }
}
function onde(x, y, r0, r1, dur, rgb, w, aplati) { ondes.push({x: x, y: y, r0: r0, r1: r1, dur: dur, rgb: rgb, w: w || 3, ap: aplati || 1, t: 0, hex: false}); }
function hexa(x, y, r, dur) { ondes.push({x: x, y: y, r0: r * 0.6, r1: r * 1.2, dur: dur, rgb: '255,214,90', w: 2, ap: 1, t: 0, hex: true}); }
function secouer(f) { secousse.f = Math.max(secousse.f, f); }
function decalage() { var f = secousse.f; return f < 0.2 ? [0, 0] : [Math.sin(temps * 91) * f, Math.cos(temps * 77) * f * 0.8]; }
function maj(dt) {
  temps += dt; secousse.f *= Math.exp(-9 * dt);
  parts = parts.filter(function (p) { p.vie += dt; if (p.vie >= p.max) return false; p.vx *= p.frein; p.vy = p.vy * p.frein + p.g * dt; p.x += p.vx * dt; p.y += p.vy * dt; p.rot += p.vr * dt; return true; });
  ondes = ondes.filter(function (o) { o.t += dt; return o.t < o.dur; });
}
function vider() { parts = []; ondes = []; secousse.f = 0; }
function dessinerHex(c, x, y, r, a) {
  c.strokeStyle = 'rgba(255,220,110,' + a + ')'; c.lineWidth = 1.5;
  var s = r / 3.2;
  for (var i = -3; i <= 3; i++) for (var j = -3; j <= 3; j++) {
    var hx = x + (i + (j % 2 ? 0.5 : 0)) * s * 1.73, hy = y + j * s * 1.5;
    if (Math.hypot(hx - x, hy - y) > r) continue;
    c.beginPath(); for (var k = 0; k < 6; k++) { var an = k / 6 * TAU + Math.PI / 6, px = hx + Math.cos(an) * s * 0.95, py = hy + Math.sin(an) * s * 0.95; if (k) c.lineTo(px, py); else c.moveTo(px, py); } c.closePath(); c.stroke();
  }
}
function dessiner(c) {
  c.save(); c.globalCompositeOperation = 'lighter';
  ondes.forEach(function (o) {
    var u = o.t / o.dur, r = o.r0 + (o.r1 - o.r0) * (1 - Math.pow(1 - u, 2)), a = (1 - u);
    if (o.hex) { dessinerHex(c, o.x, o.y, r, 0.85 * a); c.strokeStyle = 'rgba(255,230,140,' + a + ')'; c.lineWidth = 3; c.beginPath(); c.arc(o.x, o.y, r, 0, TAU); c.stroke(); return; }
    c.strokeStyle = 'rgba(' + o.rgb + ',' + (0.9 * a) + ')'; c.lineWidth = o.w * (1 - u * 0.6); c.beginPath(); c.ellipse(o.x, o.y, r, r * o.ap, 0, 0, TAU); c.stroke();
    c.strokeStyle = 'rgba(' + o.rgb + ',' + (0.25 * a) + ')'; c.lineWidth = o.w * 4; c.stroke();
  });
  parts.forEach(function (p) {
    var u = p.vie / p.max, a = u < 0.15 ? u / 0.15 : 1 - (u - 0.15) / 0.85;
    if (p.sorte === 't') { var l = 0.05; c.strokeStyle = 'rgba(' + p.rgb + ',' + a + ')'; c.lineWidth = p.r * 0.7; c.lineCap = 'round'; c.beginPath(); c.moveTo(p.x, p.y); c.lineTo(p.x - p.vx * l, p.y - p.vy * l); c.stroke(); halo(c, p.x, p.y, p.r * 2.2, p.rgb, a * 0.6, p.blanc); }
    else if (p.sorte === 'n') { c.save(); c.globalAlpha = a; c.translate(p.x, p.y); c.rotate(Math.sin(p.rot) * 0.5); c.fillStyle = 'rgb(' + p.rgb + ')'; c.font = '900 ' + Math.round(p.r * 4) + 'px Nunito,serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(p.note || '♪', 0, 0); c.restore(); halo(c, p.x, p.y, p.r * 3, p.rgb, a * 0.5, 0.3); }
    else if (p.sorte === 'e') { c.save(); c.globalAlpha = a; c.translate(p.x, p.y); c.rotate(p.rot); c.fillStyle = 'rgb(' + p.rgb + ')'; c.beginPath(); c.moveTo(0, -p.r * 1.6); c.lineTo(p.r * 0.8, p.r); c.lineTo(-p.r * 0.8, p.r); c.closePath(); c.fill(); c.restore(); halo(c, p.x, p.y, p.r * 2, p.rgb, a * 0.5, 0.4); }
    else if (p.sorte === 'f') { c.globalCompositeOperation = 'source-over'; c.globalAlpha = a * 0.35; c.fillStyle = 'rgb(' + p.rgb + ')'; c.beginPath(); c.arc(p.x, p.y, p.r * (1 + u * 2), 0, TAU); c.fill(); c.globalAlpha = 1; c.globalCompositeOperation = 'lighter'; }
    else halo(c, p.x, p.y, p.r * 2.2, p.rgb, a, p.blanc);
  });
  c.restore();
}
G.Eff = {qualite: qualite, ajouter: ajouter, gerbe: gerbe, onde: onde, hexa: hexa, secouer: secouer, decalage: decalage, maj: maj, dessiner: dessiner, vider: vider, halo: halo, lueur: lueur,
  get nb() { return parts.length; }};
})(typeof window !== 'undefined' ? window : globalThis);
