/* Les écrans, les boutons, le doigt, la boucle. */
(function () {
'use strict';
var P2 = window.P2, REG = P2.REG, Dessin = window.Dessin;
var VERSION = 'version 1 (26 novembre)';
var $ = function (id) { return document.getElementById(id); };
var cadre = $('cadre'), cv = $('c'), ctx = cv.getContext('2d');
var L = {W: 420}, Sc = 1, K = 1, cvX = 0, cvY = 0;
var S = null, pause = false, debut = true, finMontree = false, fige = false;   // fige : pour les captures des essais
var SENS = 1.5;   // (C) le héros suit le doigt, en un peu plus grand : on n'a pas besoin de traverser tout l'écran

/* ---------- les réglages, gardés d'une partie à l'autre ---------- */
var reglages = {};
for (var k in P2.REGLAGES_DEFAUT) reglages[k] = P2.REGLAGES_DEFAUT[k];
try { var mem = JSON.parse(localStorage.getItem('phase2-devant') || '{}'); for (k in mem) if (k in reglages) reglages[k] = mem[k]; } catch (e) {}
function garder() { try { localStorage.setItem('phase2-devant', JSON.stringify(reglages)); } catch (e) {} }

/* ---------- la mise en page : téléphone debout ; sur tablette, le jeu au centre ---------- */
function taille() {
  var vw = innerWidth, vh = innerHeight, fw = vw;
  if (vw / vh > 0.7) fw = Math.round(vh * 0.62);
  cadre.style.width = fw + 'px'; cadre.style.left = Math.round((vw - fw) / 2) + 'px';
  var W = 420, H = Math.round(Math.max(680, Math.min(940, W * vh / fw)));
  Sc = Math.min(fw / W, vh / H);
  var dpr = Math.min(2, window.devicePixelRatio || 1); K = Sc * dpr;
  cv.width = Math.round(W * K); cv.height = Math.round(H * K);
  cv.style.width = W * Sc + 'px'; cv.style.height = H * Sc + 'px';
  cvX = Math.round((fw - W * Sc) / 2); cvY = Math.round((vh - H * Sc) / 2);
  cv.style.left = cvX + 'px'; cv.style.top = cvY + 'px';
  L.W = W; L.H = H;
  L.solHaut = Math.round(H * 0.36); L.solBas = H - 120; L.solG = 12; L.solD = W - 12;
  L.bossHaut = 64; L.bk = Math.max(0.7, Math.min(1.15, (L.solHaut - 64) / 250));
  L.bossY = Math.round(64 + (L.solHaut - 64) * 0.5); L.bossTouche = Math.round(L.bossY + 14 * L.bk);
  placer();
  if (S) { S.L = L; S.cible.x = Math.min(L.solD, Math.max(L.solG, S.cible.x)); S.cible.y = Math.min(L.solBas, Math.max(L.solHaut, S.cible.y)); S.h.y = Math.min(S.h.y, L.solBas - 20); }
}
function poser(el, x, y, w, h) {
  el.style.left = (cvX + x * Sc) + 'px'; el.style.top = (cvY + y * Sc) + 'px';
  el.style.width = (w * Sc) + 'px'; el.style.height = (h * Sc) + 'px'; el.style.fontSize = (15 * Sc) + 'px';
}
function placer() {
  var y = L.H - 92, h = 80, w = 76, g = 6, x0 = 12, fx = function (i) { return x0 + i * (w + g); };
  poser($('bPotion'), fx(0), y, w, h); poser($('bCouper'), fx(1), y, w, h);
  poser($('bFeu'), fx(2), y, w, h); poser($('bGlace'), fx(3), y, w, h);
  poser($('bTape'), fx(4), y - 4, w, h + 4);
  poser($('bCode'), fx(2), y, w * 2 + g, h);
  poser($('bPisteur'), L.W - 54, 62, 44, 44);
  poser($('bPause'), L.W - 52, 8, 42, 38);
  var f = $('fen'); f.style.left = (cvX + 10 * Sc) + 'px'; f.style.top = (cvY + 34 * Sc) + 'px'; f.style.width = (400 * Sc) + 'px'; f.style.fontSize = (12.5 * Sc) + 'px';
}
addEventListener('resize', taille);

/* ---------- la partie ---------- */
function nouvelle() {
  S = P2.nouvelle(L, reglages, (Date.now() & 0xffff) + 1);
  S.h.y = L.solBas - 70; S.cible.y = S.h.y;
  finMontree = false;
  $('fen').classList.remove('on');
}

/* ---------- le doigt : le héros suit le mouvement du doigt, où qu'on le pose ---------- */
var doigt = null;
function horsJeu(t) { return t.closest && t.closest('button,.voile,#fen'); }
addEventListener('pointerdown', function (e) {
  if (!S || pause || debut || horsJeu(e.target)) return;
  if (doigt) return;
  doigt = {id: e.pointerId, x: e.clientX, y: e.clientY};
  S.cible.x = S.h.x; S.cible.y = S.h.y;
  e.preventDefault();
}, {passive: false});
addEventListener('pointermove', function (e) {
  if (!doigt || e.pointerId !== doigt.id || !S) return;
  var dx = (e.clientX - doigt.x) / Sc * SENS, dy = (e.clientY - doigt.y) / Sc * SENS;
  doigt.x = e.clientX; doigt.y = e.clientY;
  if (!P2.libre(S)) return;
  S.cible.x = Math.max(L.solG, Math.min(L.solD, S.cible.x + dx));
  S.cible.y = Math.max(L.solHaut, Math.min(L.solBas, S.cible.y + dy));
  e.preventDefault();
}, {passive: false});
function lacher(e) { if (doigt && e.pointerId === doigt.id) doigt = null; }
addEventListener('pointerup', lacher); addEventListener('pointercancel', lacher);

/* le clavier (sur ordinateur) : flèches ou ZQSD, Espace pour taper, 1 potion, 2 couper, 3 feu, 4 glace, Entrée le code */
var touches = {};
addEventListener('keydown', function (e) {
  touches[e.key.toLowerCase()] = true;
  if (!S || debut) return;
  var kk = e.key.toLowerCase();
  if (kk === 'escape') { basculerPause(); return; }
  if (pause) return;
  if (S.code.ouvert) {
    if (kk === 'backspace') P2.effacer(S);
    return;
  }
  if (kk === '1') geste('bPotion'); else if (kk === '2') geste('bCouper'); else if (kk === '3') geste('bFeu'); else if (kk === '4') geste('bGlace');
  else if (kk === 'enter') geste('bCode'); else if (kk === 'p') geste('bPisteur');
}, false);
addEventListener('keyup', function (e) { touches[e.key.toLowerCase()] = false; });
function clavier(dt) {
  if (!S || !P2.libre(S)) return;
  var vx = (touches.arrowright || touches.d ? 1 : 0) - (touches.arrowleft || touches.q || touches.a ? 1 : 0);
  var vy = (touches.arrowdown || touches.s ? 1 : 0) - (touches.arrowup || touches.z || touches.w ? 1 : 0);
  if (!vx && !vy) return;
  S.cible.x = Math.max(L.solG, Math.min(L.solD, S.h.x + vx * 40));
  S.cible.y = Math.max(L.solHaut, Math.min(L.solBas, S.h.y + vy * 40));
}

/* ---------- les boutons ---------- */
var tape = false;
function refus(el) { el.classList.remove('non'); void el.offsetWidth; el.classList.add('non'); }
function geste(id) {
  if (!S || pause || debut) return;
  var el = $(id), ok = false;
  if (id === 'bPotion') ok = P2.potion(S);
  else if (id === 'bCouper') ok = P2.couper(S);
  else if (id === 'bFeu') ok = P2.remede(S, 'feu');
  else if (id === 'bGlace') ok = P2.remede(S, 'glace');
  else if (id === 'bCode') { ok = P2.ouvrirCode(S); if (ok) majFenetre(); }
  else if (id === 'bPisteur') ok = P2.pisteurCrie(S);
  if (!ok) refus(el);
  else { el.classList.add('appui'); setTimeout(function () { el.classList.remove('appui'); }, 120); }
}
['bPotion', 'bCouper', 'bFeu', 'bGlace', 'bCode', 'bPisteur'].forEach(function (id) {
  $(id).addEventListener('pointerdown', function (e) { e.preventDefault(); geste(id); });
});
var bTape = $('bTape');
bTape.addEventListener('pointerdown', function (e) { e.preventDefault(); tape = true; bTape.classList.add('appui'); try { bTape.setPointerCapture(e.pointerId); } catch (x) {} });
['pointerup', 'pointercancel', 'lostpointercapture'].forEach(function (n) { bTape.addEventListener(n, function () { tape = false; bTape.classList.remove('appui'); }); });

/* la fenêtre du code */
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
function secouer(saisie) { // un mauvais code : la fenêtre tremble avec ce qu'on a tapé, puis se ferme
  var f = $('fen'), cases = f.querySelectorAll('.case');
  f.classList.add('on', 'faux');
  for (var i = 0; i < 3; i++) cases[i].textContent = saisie[i] || '';
  setTimeout(function () { f.classList.remove('faux'); majFenetre(); }, 650);
}
function majFenetre() {
  var f = $('fen'), on = S && S.code.ouvert;
  f.classList.toggle('on', !!on);
  var cases = f.querySelectorAll('.case');
  for (var i = 0; i < 3; i++) cases[i].textContent = on ? (S.code.saisie[i] || '') : '';
}

/* chaque image : qui est montré, qui est grisé, qui clignote */
function cls(el, c, v) { if (el.classList.contains(c) !== !!v) el.classList.toggle(c, !!v); }
function majBoutons() {
  var en = S && !debut && S.phase !== 'fini', a = S && S.att, aides = S && S.reg.aides;
  var combat = en && S.phase === 'combat', bulle = en && S.phase === 'bulle';
  cls($('bPotion'), 'on', en); cls($('bCouper'), 'on', en && S.phase !== 'bulle');
  cls($('bFeu'), 'on', combat && S.forme === 2); cls($('bGlace'), 'on', combat && S.forme === 2);
  cls($('bTape'), 'on', en && S.reg.facon === 'bouton' && S.phase !== 'bulle');
  cls($('bCode'), 'on', bulle); cls($('bPisteur'), 'on', bulle && !S.cri);
  $('bPause').style.display = (!debut && !finMontree) ? 'flex' : 'none';
  if (!S) return;
  // le bouton pour couper : sa recharge en camembert
  $('bCouper').style.setProperty('--r', (S.couperT / REG.couper.recharge).toFixed(3));
  var gros = a && a.type === 'grosCoup' && a.t < a.prep;
  cls($('bCouper'), 'eteint', S.couperT > 0);
  cls($('bCouper'), 'appel', aides && gros && S.couperT <= 0);
  var rem = a && (a.type === 'chaud' || a.type === 'froid') && !a.fait;
  cls($('bFeu'), 'appel', aides && rem); cls($('bGlace'), 'appel', aides && rem);
  $('bPotion').style.setProperty('--r', S.h.potion > 0 ? (S.h.potion / REG.potion.duree).toFixed(3) : 0);
  cls($('bPotion'), 'appel', aides && combat && S.h.pv < 40 && S.h.potion <= 0 && S.h.mort <= 0);
  cls($('bTape'), 'eteint', S.bouc.actif > 0);
  var bc = $('bCode'), bl = S.code.bloque > 0;
  cls(bc, 'bloque', bl);
  if (bl) bc.querySelector('.nb').textContent = Math.ceil(S.code.bloque);
  cls(bc, 'appel', aides && bulle && S.cri && !bl && !S.code.ouvert);
  var f = $('fen'); if (!f.classList.contains('faux') && f.classList.contains('on') !== S.code.ouvert) majFenetre();
  if (S.code.ouvert) f.querySelector('.lent i').style.width = (100 * S.code.ralenti / S.reg.ralenti).toFixed(1) + '%';
}

/* ---------- la pause, les réglages ---------- */
function basculerPause() { if (debut) return; pause = !pause; $('pause').classList.toggle('on', pause); if (pause) majMenu(); doigt = null; tape = false; }
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
    reglages[r] = r === 'facon' ? v : r === 'aides' ? v === 'true' : +v;
    if (S) S.reg[r] = reglages[r];
    garder(); majMenu();
  });
});
$('essais').addEventListener('click', function (e) {
  var b = e.target.closest('button'); if (!b || !S || debut) return;
  if (b.dataset.f === 's') P2.symboleTout(S); else P2.aller(S, +b.dataset.f);
  $('fin').classList.remove('on'); finMontree = false;
  basculerPause();
});
$('bRecommencer').addEventListener('click', function () { nouvelle(); $('fin').classList.remove('on'); if (pause) basculerPause(); });
function majMenu() {
  document.querySelectorAll('.choix[data-r]').forEach(function (g) {
    var r = g.dataset.r;
    g.querySelectorAll('button').forEach(function (b) { b.classList.toggle('choisi', String(reglages[r]) === b.dataset.v); });
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

/* ---------- la fin ---------- */
function mmss(s) { s = Math.round(s); return Math.floor(s / 60) + ':' + ('0' + s % 60).slice(-2); }
function montrerFin() {
  finMontree = true;
  var st = S.stats, h = '';
  h += '<span>⏱</span><b>' + mmss(S.t) + '</b>';
  st.formes.forEach(function (t, i) { h += '<span>' + ['①', '②', '③'][i] + '</span><b>' + mmss(t) + '</b>'; });
  h += '<span>💀</span><b>' + st.morts + '</b><span>🧪</span><b>' + st.potions + '</b>';
  $('stats').innerHTML = h;
  var fc = $('finImg').getContext('2d'); fc.clearRect(0, 0, 160, 120); Dessin.grosbec(fc, 80, 64, 34);
  $('fin').classList.add('on');
}

/* ---------- la boucle ---------- */
var avant = performance.now(), ips = 60, nImg = 0, t0 = avant;
function boucle(maintenant) {
  requestAnimationFrame(boucle);
  var dt = Math.min(0.05, (maintenant - avant) / 1000); avant = maintenant;
  nImg++; if (maintenant - t0 > 1000) { ips = Math.round(nImg * 1000 / (maintenant - t0)); nImg = 0; t0 = maintenant; }
  if (S && !pause && !debut && !fige) {
    clavier(dt);
    P2.pas(S, dt, {tirer: tape || !!touches[' ']});
    if (S.phase === 'fini' && !finMontree) montrerFin();
  }
  if (S) { ctx.setTransform(K, 0, 0, K, 0, 0); Dessin.tout(ctx, S, L); }
  else { ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.fillStyle = '#05060c'; ctx.fillRect(0, 0, cv.width, cv.height); }
  majBoutons();
}
document.addEventListener('visibilitychange', function () { if (document.hidden && S && !pause && !debut && !finMontree) basculerPause(); });

taille();
requestAnimationFrame(boucle);

// pour les essais (tests/)
window.__p2 = {get S() { return S; }, set fige(v) { fige = v; }, majBoutons: majBoutons, dessiner: function () { ctx.setTransform(K, 0, 0, K, 0, 0); Dessin.tout(ctx, S, L); }, P2: P2, L: L, nouvelle: nouvelle, geste: geste, demarrer: function () { $('bGo').click(); }, get ips() { return ips; }, VERSION: VERSION};
})();
