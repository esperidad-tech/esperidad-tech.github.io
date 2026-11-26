/* Les écrans de la version 2 : le pouce gauche, les quatre boutons, les menus, la boucle. */
(function () {
'use strict';
var P2 = window.P2, REG = P2.REG, Dessin = window.Dessin;
var VERSION = 'version 2 (26 novembre, nuit)';
var $ = function (id) { return document.getElementById(id); };
var cv = $('c'), ctx = cv.getContext('2d');
var S = null, pause = false, debut = true, finMontree = false, fige = false;
var W = 0, H = 0, DPR = 1, vue = {T: 40, ox: 0, oy: 0};

/* ---------- les réglages, gardés d'une partie à l'autre ---------- */
var reglages = {};
for (var k in P2.DEFAUT) reglages[k] = P2.DEFAUT[k];
try { var mem = JSON.parse(localStorage.getItem('phase2-devant-v2') || '{}'); for (k in mem) if (k in reglages) reglages[k] = mem[k]; } catch (e) {}
function garder() { try { localStorage.setItem('phase2-devant-v2', JSON.stringify(reglages)); } catch (e) {} }

/* ---------- la mise en page : la salle au centre, les pouces sur les côtés ---------- */
function taille() {
  W = innerWidth; H = innerHeight; DPR = Math.min(2, window.devicePixelRatio || 1);
  cv.width = Math.round(W * DPR); cv.height = Math.round(H * DPR);
  var L = REG.salle, K = Dessin.K, haut = Math.max(38, H * 0.09), cote = Math.min(W * 0.14, 150), dessus = 3.35;   // dessus : la hauteur de l'armure au-dessus du sol
  var T = Math.min((H - haut - 8) / (dessus + L.P * K), (W - 2 * cote) / L.L, (W * 0.94) / L.L);
  vue.T = T; vue.ox = (W - L.L * T) / 2;
  var bloc = (dessus + L.P * K) * T; vue.oy = haut + (H - haut - bloc) / 2 + dessus * T;
}
addEventListener('resize', taille);

function nouvelle() { S = P2.nouvelle(reglages, (Date.now() & 0xffff) + 1); finMontree = false; $('fen').classList.remove('on'); }

/* ---------- le pouce gauche : il se pose où il veut, sur la moitié gauche (comme le Pisteur) ---------- */
var joy = {id: null, bx: 0, by: 0, vx: 0, vy: 0, mx: 0, my: 0, R: 60};
function horsJeu(t) { return t.closest && t.closest('button,.voile,#fen'); }
cv.addEventListener('pointerdown', function (e) {
  e.preventDefault();
  if (!S || pause || debut) return;
  // toucher un réparateur : il devient la cible (on lâche un pouce, comme dans World of Warcraft)
  var p = Dessin.versSalle(e.clientX, e.clientY), best = null, bd = 0.9;
  S.reps.forEach(function (r) { var d = Math.hypot(r.x - p[0], r.y - p[1]); if (d < bd) { bd = d; best = r; } });
  if (best) { P2.viser(S, best.x, best.y); return; }
  if (e.clientX < W * 0.5 && joy.id === null) {
    joy.id = e.pointerId; joy.bx = e.clientX; joy.by = e.clientY; joy.vx = joy.vy = joy.mx = joy.my = 0;
    joy.R = Math.max(40, Math.min(80, H * 0.13));
    try { cv.setPointerCapture(e.pointerId); } catch (_) {}
  }
}, {passive: false});
cv.addEventListener('pointermove', function (e) {
  if (e.pointerId !== joy.id) return; e.preventDefault();
  var R = joy.R, dx = e.clientX - joy.bx, dy = e.clientY - joy.by, d = Math.hypot(dx, dy);
  if (d > R * 1.2) { joy.bx += dx / d * (d - R * 1.2); joy.by += dy / d * (d - R * 1.2); dx = e.clientX - joy.bx; dy = e.clientY - joy.by; d = Math.hypot(dx, dy); }
  var m = Math.min(1, d / R); joy.vx = d > 0 ? dx / d * m : 0; joy.vy = d > 0 ? dy / d * m : 0;
  var wx = dx, wy = dy / Dessin.K, n = Math.hypot(wx, wy) || 1;   // la direction dans la salle (vue en biais)
  joy.mx = wx / n * m; joy.my = wy / n * m;
}, {passive: false});
function finDoigt(e) { if (e.pointerId === joy.id) { joy.id = null; joy.vx = joy.vy = joy.mx = joy.my = 0; } }
['pointerup', 'pointercancel', 'lostpointercapture'].forEach(function (n) { cv.addEventListener(n, finDoigt); });
cv.addEventListener('contextmenu', function (e) { e.preventDefault(); });

/* ---------- le clavier (sur ordinateur) ---------- */
var touches = {};
addEventListener('keydown', function (e) {
  var kk = e.key.toLowerCase(); touches[kk] = true;
  if (!S || debut) return;
  if (kk === 'escape') { basculerPause(); return; }
  if (pause || S.code.ouvert) { if (kk === 'backspace' && S.code.ouvert) { P2.effacer(S); majFenetre(); } return; }
  if (kk === '1') geste('bGlace'); else if (kk === '2') geste('bFeu'); else if (kk === '3') geste('bSoin');
  else if (kk === ' ') { e.preventDefault(); geste('bSaut'); } else if (kk === 'enter') geste('bCode'); else if (kk === 'p') geste('bPisteur');
});
addEventListener('keyup', function (e) { touches[e.key.toLowerCase()] = false; });
function entreeClavier() {
  var x = (touches.arrowright || touches.d ? 1 : 0) - (touches.arrowleft || touches.q || touches.a ? 1 : 0);
  var y = (touches.arrowdown || touches.s ? 1 : 0) - (touches.arrowup || touches.z || touches.w ? 1 : 0);
  var n = Math.hypot(x, y); return n ? {mx: x / n, my: y / n} : null;
}

/* ---------- les boutons ---------- */
function refus(el) { el.classList.remove('non'); void el.offsetWidth; el.classList.add('non'); }
function geste(id) {
  if (!S || pause || debut) return;
  var el = $(id), ok = false;
  if (id === 'bGlace') ok = P2.lancer(S, 'glace');
  else if (id === 'bFeu') ok = P2.lancer(S, 'feu');
  else if (id === 'bSoin') ok = P2.lancer(S, 'soin');
  else if (id === 'bSaut') { var kb = entreeClavier(); ok = P2.sauter(S, kb ? kb.mx : joy.mx, kb ? kb.my : joy.my); }
  else if (id === 'bCode') { ok = P2.ouvrirCode(S); if (ok) { joy.id = null; joy.mx = joy.my = 0; majFenetre(); } }
  else if (id === 'bPisteur') ok = P2.pisteurCrie(S);
  if (!ok) refus(el); else { el.classList.add('appui'); setTimeout(function () { el.classList.remove('appui'); }, 120); }
}
['bGlace', 'bFeu', 'bSoin', 'bSaut', 'bCode', 'bPisteur'].forEach(function (id) {
  $(id).addEventListener('pointerdown', function (e) { e.preventDefault(); e.stopPropagation(); geste(id); });
});

/* ---------- la fenêtre du code ---------- */
var clav = document.querySelector('#fen .clavier');
P2.SYMS.forEach(function (s) {
  var b = document.createElement('button'); b.textContent = s; b.setAttribute('aria-label', s);
  b.addEventListener('pointerdown', function (e) {
    e.preventDefault(); if (!S || !S.code.ouvert) return;
    var n = S.stats.mauvaisCodes, saisie = S.code.saisie.concat([s]);
    P2.taper(S, s);
    if (S.stats.mauvaisCodes > n) secouer(saisie); else majFenetre();
  });
  clav.appendChild(b);
});
$('fFerme').addEventListener('pointerdown', function (e) { e.preventDefault(); if (S) P2.fermerCode(S); majFenetre(); });
$('fEfface').addEventListener('pointerdown', function (e) { e.preventDefault(); if (S) P2.effacer(S); majFenetre(); });
function secouer(saisie) {
  var f = $('fen'), cases = f.querySelectorAll('.case');
  f.classList.add('on', 'faux'); for (var i = 0; i < 3; i++) cases[i].textContent = saisie[i] || '';
  setTimeout(function () { f.classList.remove('faux'); majFenetre(); }, 650);
}
function majFenetre() {
  var f = $('fen'), on = S && S.code.ouvert; f.classList.toggle('on', !!on);
  var cases = f.querySelectorAll('.case'); for (var i = 0; i < 3; i++) cases[i].textContent = on ? (S.code.saisie[i] || '') : '';
}

/* chaque image : qui est montré, qui est grisé, qui clignote */
function cls(el, c, v) { if (el.classList.contains(c) !== !!v) el.classList.toggle(c, !!v); }
function majBoutons() {
  var en = S && !debut && S.phase !== 'fini', h = S && S.h, aides = S && S.reg.aides;
  ['bGlace', 'bFeu', 'bSoin', 'bSaut'].forEach(function (id) { cls($(id), 'on', en); });
  cls($('bPause'), 'on', !debut && !finMontree);
  if (!S) return;
  var bulle = en && S.phase === 'bulle';
  cls($('bCode'), 'on', bulle && !S.code.ouvert); cls($('bPisteur'), 'on', bulle && !S.cri);
  var mort = h.mort > 0 || S.code.ouvert;
  ['bGlace', 'bFeu', 'bSoin'].forEach(function (id) {
    var el = $(id), q = id === 'bGlace' ? 'glace' : id === 'bFeu' ? 'feu' : 'soin';
    cls(el, 'eteint', mort);
    el.style.setProperty('--p', h.lance && h.lance.quoi === q ? (h.lance.t / h.lance.dur).toFixed(3) : 0);
    el.style.setProperty('--c', q === 'glace' ? '#9fe3ff' : q === 'feu' ? '#ff7a2a' : '#5fe07a');
  });
  $('bSaut').style.setProperty('--r', h.sautT > 0 ? (h.sautT / S.reg.saut).toFixed(3) : 0);
  cls($('bSaut'), 'eteint', mort);
  cls($('bSoin'), 'appel', aides && h.pv <= 60 && h.mort <= 0 && !h.lance);
  cls($('bCode'), 'appel', aides && bulle && S.cri);
  var f = $('fen');
  if (!f.classList.contains('faux') && f.classList.contains('on') !== S.code.ouvert) majFenetre();
  if (S.code.ouvert) f.querySelector('.lent i').style.width = (100 * S.code.ralenti / S.reg.ralenti).toFixed(1) + '%';
}

/* ---------- la pause, les réglages ---------- */
function basculerPause() { if (debut) return; pause = !pause; $('pause').classList.toggle('on', pause); if (pause) majMenu(); joy.id = null; joy.mx = joy.my = 0; }
$('bPause').addEventListener('click', basculerPause);
$('bReprendre').addEventListener('click', function () {
  if (debut) { $('pause').classList.remove('on'); $('debut').classList.add('on'); return; }
  if (finMontree) { $('pause').classList.remove('on'); $('fin').classList.add('on'); return; }
  basculerPause();
});
document.querySelectorAll('.choix[data-r]').forEach(function (g) {
  g.addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b) return;
    var r = g.dataset.r, v = b.dataset.v;
    reglages[r] = r === 'aides' ? v === 'true' : +v;
    if (S) { S.reg[r] = reglages[r]; if (r === 'vie' && S.phase === 'combat') { S.vieMax = reglages.vie; S.vie = Math.min(S.vie, S.vieMax); } }
    garder(); majMenu();
  });
});
$('essais').addEventListener('click', function (e) {
  var b = e.target.closest('button'); if (!b || !S || debut) return;
  if (b.dataset.f === 's') P2.symboleTout(S); else P2.aller(S, +b.dataset.f);
  $('fin').classList.remove('on'); finMontree = false; basculerPause();
});
$('bRecommencer').addEventListener('click', function () { nouvelle(); $('fin').classList.remove('on'); if (pause) basculerPause(); });
function majMenu() {
  document.querySelectorAll('.choix[data-r]').forEach(function (g) {
    var r = g.dataset.r; g.querySelectorAll('button').forEach(function (b) { b.classList.toggle('choisi', String(reglages[r]) === b.dataset.v); });
  });
  $('essais').style.opacity = debut ? 0.35 : 1;
  $('mesures').textContent = 'Maquette rapide de la phase 2, ' + VERSION + ' · ' + ips + ' images par seconde';
}
if (/depuis=salle/.test(location.search)) { var bs = $('bSalle'); bs.hidden = false; bs.addEventListener('click', function () { location.href = 'salle.html'; }); }

/* ---------- avant de jouer ---------- */
var roles = $('roles');
['barde', 'sage', 'alchimiste'].forEach(function (r) {
  var b = document.createElement('button'), R = Dessin.ROLES[r];
  b.style.background = R.c; b.textContent = R.ic; b.dataset.r = r; b.setAttribute('aria-label', r);
  b.addEventListener('click', function () { reglages.role = r; garder(); majRoles(); });
  roles.appendChild(b);
});
function majRoles() { roles.querySelectorAll('button').forEach(function (b) { b.classList.toggle('choisi', b.dataset.r === reglages.role); }); }
majRoles();
$('bGo').addEventListener('click', function () { debut = false; $('debut').classList.remove('on'); nouvelle(); });
$('bReglages').addEventListener('click', function () { $('debut').classList.remove('on'); $('pause').classList.add('on'); majMenu(); });
$('bFinReglages').addEventListener('click', function () { $('fin').classList.remove('on'); $('pause').classList.add('on'); majMenu(); });
$('bRejouer').addEventListener('click', function () { $('fin').classList.remove('on'); nouvelle(); });

/* ---------- la fin : sans un mot ---------- */
function mmss(s) { s = Math.round(s); return Math.floor(s / 60) + ':' + ('0' + s % 60).slice(-2); }
function montrerFin() {
  finMontree = true;
  var st = S.stats, h = '<span>⏱</span><b>' + mmss(S.t) + '</b>';
  st.tiers.forEach(function (x, i) { h += '<span>' + ['①', '②', '③'][i] + '</span><b>' + mmss(x.code || x.symbole) + '</b>'; });
  h += '<span>💀</span><b>' + st.morts + '</b><span>✚</span><b>' + st.soins + '</b>';
  $('stats').innerHTML = h;
  var fc = $('finImg').getContext('2d'); fc.clearRect(0, 0, 160, 110); Dessin.grosbec(fc, 80, 58, 32);
  $('fin').classList.add('on');
}

/* ---------- la boucle ---------- */
var avant = performance.now(), ips = 60, nImg = 0, t0 = avant;
function boucle(maintenant) {
  requestAnimationFrame(boucle);
  var dt = Math.min(0.05, (maintenant - avant) / 1000); avant = maintenant;
  nImg++; if (maintenant - t0 > 1000) { ips = Math.round(nImg * 1000 / (maintenant - t0)); nImg = 0; t0 = maintenant; }
  if (S && !pause && !debut && !fige) {
    var kb = entreeClavier(), e = kb || {mx: joy.mx, my: joy.my};
    if (window.__pilote) e = window.__pilote(S, dt) || e;   // pour les essais : un robot peut tenir la manette
    P2.pas(S, dt, e);
    if (S.phase === 'fini' && !finMontree) montrerFin();
  }
  ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  if (S) Dessin.tout(ctx, S, vue, W, H, joy); else { ctx.fillStyle = '#070912'; ctx.fillRect(0, 0, W, H); }
  majBoutons();
}
document.addEventListener('visibilitychange', function () { if (document.hidden && S && !pause && !debut && !finMontree) basculerPause(); });
taille();
requestAnimationFrame(boucle);

window.__p2 = {get S() { return S; }, set fige(v) { fige = v; }, P2: P2, nouvelle: nouvelle, geste: geste, vue: vue, majBoutons: majBoutons,
  demarrer: function () { $('bGo').click(); }, get ips() { return ips; }, VERSION: VERSION,
  dessiner: function () { ctx.setTransform(DPR, 0, 0, DPR, 0, 0); Dessin.tout(ctx, S, vue, W, H, joy); }};
})();
