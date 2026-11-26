/* Les écrans de la version 2 : le départ (seul ou à quatre), le pouce gauche, les six boutons, le groupe en haut à gauche,
   le code, « On reprend », le film d'Odette, la fin, les sons, la boucle. */
(function () {
'use strict';
var P3 = window.P3, REG = P3.REG, Dessin = window.Dessin;
var VERSION = 'version 2 (27 novembre, nuit)';
var $ = function (id) { return document.getElementById(id); };
var cv = $('c'), ctx = cv.getContext('2d');
var S = null, pause = false, finMontree = false, fige = false, enJeu = false;
var W = 0, H = 0, DPR = 1, vue = {T: 40, ox: 0, oy: 0}, dctx = {infos: [], boites: []};

/* ---------- les réglages, gardés d'une partie à l'autre ---------- */
var reglages = {};
for (var k in P3.DEFAUT) reglages[k] = P3.DEFAUT[k];
try { var mem = JSON.parse(localStorage.getItem('phase3-v2') || '{}'); for (k in mem) if (k in reglages) reglages[k] = mem[k]; } catch (e) {}
var numero = String(reglages.partie || '');
function garder() { try { localStorage.setItem('phase3-v2', JSON.stringify(reglages)); } catch (e) {} }

/* ---------- l'horloge : les quatre tablettes partent ensemble (le bouton jaune) et suivent l'heure, pas les images ---------- */
var horloge = {zero: 0, reel0: 0, pauseT: 0};
function caler() { horloge.zero = performance.now(); horloge.reel0 = S ? S.reel : 0; }

/* ---------- la mise en page : la salle au centre, les pouces sur les côtés ---------- */
var BOUTONS = ['bBouclier', 'bFeu', 'bGlace', 'bAcide', 'bSoin', 'bSaut'];
function taille() {
  W = innerWidth; H = innerHeight; DPR = Math.min(2, window.devicePixelRatio || 1);
  cv.width = Math.round(W * DPR); cv.height = Math.round(H * DPR);
  var L = REG.salle, K = Dessin.K, haut = Math.max(34, H * 0.08), cote = Math.min(W * 0.15, 170), dessus = 6.6;   // dessus : Grosbec dépasse le mur du fond
  var T = Math.min((H - haut - 6) / (dessus + L.P * K), (W - 2 * cote) / L.L);
  vue.T = T; vue.ox = (W - L.L * T) / 2;
  var bloc = (dessus + L.P * K) * T; vue.oy = haut + (H - haut - bloc) / 2 + dessus * T;
  // les six boutons, sous le pouce droit : le bouclier au milieu (le bouton de panique), les trois sorts autour, le soin et le saut plus loin
  var g = Math.min(H * 0.25, 150), p = Math.min(H * 0.16, 96), cx = W - Math.min(H * 0.05, 30) - g / 2 - (window.safeDroite || 0), cy = H - Math.min(H * 0.06, 36) - g / 2;
  function place(id, x, y, d) { var el = $(id); el.style.width = el.style.height = d + 'px'; el.style.left = (x - d / 2) + 'px'; el.style.top = (y - d / 2) + 'px'; el.style.fontSize = (d * 0.36) + 'px'; }
  place('bBouclier', cx, cy, g);
  var r1 = g / 2 + p / 2 + Math.min(H * 0.02, 10);
  [['bFeu', 180], ['bGlace', 135], ['bAcide', 90]].forEach(function (b) { var a = b[1] * Math.PI / 180; place(b[0], cx + Math.cos(a) * r1, cy - Math.sin(a) * r1, p); });
  var r2 = r1 + p * 0.95;
  [['bSoin', 165], ['bSaut', 115]].forEach(function (b) { var a = b[1] * Math.PI / 180; place(b[0], cx + Math.cos(a) * r2, cy - Math.sin(a) * r2, p * 0.92); });
}
addEventListener('resize', taille);

/* ---------- les sons (tout petits, faits à la main : « tchac » quand ça porte, « ping » quand ça rebondit) ---------- */
var AC = null;
function audio() { if (!AC) { try { AC = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { AC = null; } } if (AC && AC.state === 'suspended') AC.resume(); return AC; }
function son(nom) {
  if (!S || !S.reg.sons || !AC) return;
  var a = AC, t = a.currentTime, o, g;
  function env(node, v, d) { g = a.createGain(); g.gain.setValueAtTime(v, t); g.gain.exponentialRampToValueAtTime(0.0008, t + d); node.connect(g); g.connect(a.destination); }
  function bruit(d, f, q) { var b = a.createBuffer(1, Math.ceil(a.sampleRate * d), a.sampleRate), x = b.getChannelData(0); for (var i = 0; i < x.length; i++) x[i] = Math.random() * 2 - 1; var s = a.createBufferSource(); s.buffer = b; var fl = a.createBiquadFilter(); fl.type = 'bandpass'; fl.frequency.value = f; fl.Q.value = q; s.connect(fl); s.start(t); return fl; }
  if (nom === 'tchac') { env(bruit(0.12, 1400, 1.2), 0.5, 0.12); o = a.createOscillator(); o.frequency.setValueAtTime(150, t); o.frequency.exponentialRampToValueAtTime(60, t + 0.15); env(o, 0.5, 0.16); o.start(t); o.stop(t + 0.2); }
  else if (nom === 'ping') { o = a.createOscillator(); o.type = 'triangle'; o.frequency.setValueAtTime(1900, t); o.frequency.exponentialRampToValueAtTime(1500, t + 0.25); env(o, 0.22, 0.28); o.start(t); o.stop(t + 0.3); }
  else if (nom === 'boum') { env(bruit(0.6, 180, 0.6), 1.1, 0.6); }
  else if (nom === 'victoire') { [523, 659, 784, 1046].forEach(function (f, i) { var oo = a.createOscillator(), gg = a.createGain(), tt = t + i * 0.11; oo.type = 'triangle'; oo.frequency.value = f; gg.gain.setValueAtTime(0.0001, t); gg.gain.setValueAtTime(0.25, tt); gg.gain.exponentialRampToValueAtTime(0.001, tt + 0.35); oo.connect(gg); gg.connect(a.destination); oo.start(tt); oo.stop(tt + 0.4); }); }
  else if (nom === 'rayon') { o = a.createOscillator(); o.type = 'sawtooth'; o.frequency.setValueAtTime(220, t); o.frequency.exponentialRampToValueAtTime(55, t + 0.5); env(o, 0.25, 0.5); o.start(t); o.stop(t + 0.55); }
}
function surEvt(e) {
  if (e.type === 'touche') son('tchac'); else if (e.type === 'rebond') son('ping');
  else if (e.type === 'zone') son('boum'); else if (e.type === 'symbole' || e.type === 'victoire') son('victoire');
  else if (e.type === 'mega' && (e.moi || e.vuIci)) son('rayon');
}

/* ---------- une partie ---------- */
function nouvelle() {
  reglages.partie = +numero || 1;
  S = P3.nouvelle(reglages, (Date.now() & 0xffff) + 1);
  S.surEvt = surEvt; S.attente = Math.max(S.attente, REG.lancement);
  finMontree = false; $('fin').classList.remove('on'); fermerSymboles();
  construireGroupe();
  caler();
}
function demarrer() {   // le bouton jaune du départ
  enJeu = true; $('debut').classList.remove('on');
  audio(); nouvelle();
  if (S.seul) { cacherJaune(); return; }
  montrerJaune('GO', true, function () { caler(); S.attente = REG.lancement; });
  fige = true;
}

/* ---------- le pouce gauche (il se pose où il veut, sur la moitié gauche), et toucher Grosbec pour viser ---------- */
var joy = {id: null, bx: 0, by: 0, vx: 0, vy: 0, mx: 0, my: 0, R: 60};
cv.addEventListener('pointerdown', function (e) {
  e.preventDefault(); audio();
  if (!S || pause || !enJeu || S.etat !== 'combat') return;
  // mode seul : toucher une bulle de mon villageois, c'est la crier (l'endroit sûr à tous, le reste à l'ami concerné)
  for (var i = 0; i < dctx.boites.length; i++) { var b = dctx.boites[i]; if (e.clientX >= b.x - 6 && e.clientX <= b.x + b.w + 6 && e.clientY >= b.y - 6 && e.clientY <= b.y + b.h + 6) {
    if (S.seul) { if (b.info.quoi === 'zone') P3.relayerZone(S); else P3.relayer(S, b.info.cible); }
    return; } }
  var p = Dessin.partieSous(e.clientX, e.clientY);
  if (p >= 0 && P3.vivant(S)) { P3.viser(S, p); return; }
  if (e.clientX < W * 0.55 && joy.id === null) {
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
  var wx = dx, wy = dy / Dessin.K, n = Math.hypot(wx, wy) || 1; joy.mx = wx / n * m; joy.my = wy / n * m;
}, {passive: false});
function finDoigt(e) { if (e.pointerId === joy.id) { joy.id = null; joy.vx = joy.vy = joy.mx = joy.my = 0; } }
['pointerup', 'pointercancel', 'lostpointercapture'].forEach(function (n) { cv.addEventListener(n, finDoigt); });
cv.addEventListener('contextmenu', function (e) { e.preventDefault(); });

/* ---------- le clavier (sur ordinateur) ---------- */
var touches = {};
addEventListener('keydown', function (e) {
  var kk = e.key.toLowerCase(); touches[kk] = true;
  if (!S || !enJeu) return;
  if (kk === 'escape') { basculerPause(); return; }
  if (pause) return;
  if (kk === '1') geste('bFeu'); else if (kk === '2') geste('bGlace'); else if (kk === '3') geste('bAcide'); else if (kk === '4') geste('bSoin');
  else if (kk === ' ') { e.preventDefault(); geste('bSaut'); } else if (kk === 'b' || kk === 'enter') geste('bBouclier');
});
addEventListener('keyup', function (e) { touches[e.key.toLowerCase()] = false; });
function entreeClavier() {
  var x = (touches.arrowright || touches.d ? 1 : 0) - (touches.arrowleft || touches.q || touches.a ? 1 : 0);
  var y = (touches.arrowdown || touches.s ? 1 : 0) - (touches.arrowup || touches.z || touches.w ? 1 : 0);
  var n = Math.hypot(x, y); return n ? {mx: x / n, my: y / n} : null;
}

/* ---------- les six boutons ---------- */
function refus(el) { el.classList.remove('non'); void el.offsetWidth; el.classList.add('non'); }
function geste(id) {
  if (!S || pause || !enJeu) return;
  var el = $(id), ok = false;
  if (id === 'bFeu') ok = P3.lancer(S, 'feu'); else if (id === 'bGlace') ok = P3.lancer(S, 'glace'); else if (id === 'bAcide') ok = P3.lancer(S, 'acide');
  else if (id === 'bSoin') ok = P3.lancer(S, 'soin');
  else if (id === 'bSaut') { var kb = entreeClavier(); ok = P3.sauter(S, kb ? kb.mx : joy.mx, kb ? kb.my : joy.my); }
  else if (id === 'bBouclier') ok = P3.bouclier(S);
  if (!ok) refus(el); else { el.classList.add('appui'); setTimeout(function () { el.classList.remove('appui'); }, 120); }
}
BOUTONS.forEach(function (id) { $(id).addEventListener('pointerdown', function (e) { e.preventDefault(); e.stopPropagation(); audio(); geste(id); }); });

/* ---------- le groupe, en haut à gauche : les portraits, la case du symbole à côté (le code de la fin) ---------- */
var cadres = {};
function construireGroupe() {
  var g = $('groupe'); g.innerHTML = ''; cadres = {};
  [S.moi].concat(P3.ROLES.filter(function (r) { return r !== S.moi; })).forEach(function (ro) {
    var R = Dessin.ROLES[ro], b = document.createElement('button');
    b.className = 'cadre'; b.dataset.r = ro; b.setAttribute('aria-label', ro);
    b.innerHTML = '<span class="tete" style="background:' + R.c + '">' + R.ic + '</span>' + (ro === S.moi ? '<span class="vie"><i></i><span></span></span>' : '') + '<span class="sym"></span>';
    if (ro !== S.moi) b.addEventListener('pointerdown', function (e) { e.preventDefault(); e.stopPropagation(); toucherAmi(ro, b); });
    g.appendChild(b); cadres[ro] = b;
  });
}
function toucherAmi(ro, b) {
  if (!S || pause || S.etat !== 'combat') return;
  if (S.seul && P3.aRelayer(S, ro)) { P3.relayer(S, ro); b.classList.add('fait'); setTimeout(function () { b.classList.remove('fait'); }, 400); return; }   // mode seul : « crier » à cet ami
  if (S.combat !== 2 || !P3.vivant(S) || S.code[ro]) { refus(b); return; }
  ouvrirSymboles(ro, b);
}
var symAmi = null;
(function () {
  var f = $('symboles');
  P3.SYMS.forEach(function (s) {
    var b = document.createElement('button'); b.textContent = s; b.setAttribute('aria-label', s);
    b.addEventListener('pointerdown', function (e) {
      e.preventDefault(); e.stopPropagation(); if (!S || !symAmi) return;
      var ro = symAmi; fermerSymboles();
      if (!P3.taper(S, ro, s)) refus(cadres[ro]);
    });
    f.appendChild(b);
  });
  var x = document.createElement('button'); x.textContent = '✕'; x.setAttribute('aria-label', 'Fermer');
  x.addEventListener('pointerdown', function (e) { e.preventDefault(); e.stopPropagation(); fermerSymboles(); }); f.appendChild(x);
})();
function ouvrirSymboles(ro, b) {
  symAmi = ro; var f = $('symboles'), r = b.getBoundingClientRect();
  f.classList.add('on'); f.style.left = (r.right + 8) + 'px'; f.style.top = Math.max(6, Math.min(H - f.offsetHeight - 6, r.top - 10)) + 'px';
}
function fermerSymboles() { symAmi = null; $('symboles').classList.remove('on'); }

/* ---------- le gros bouton jaune (« 3, 2, 1 », tous ensemble) ---------- */
var apresJaune = null;
function montrerJaune(txt, ferme, fn) { $('bJaune').textContent = txt; $('bJauneFerme').hidden = !ferme; $('jaune').classList.add('on'); apresJaune = fn; }
function cacherJaune() { $('jaune').classList.remove('on'); apresJaune = null; }
$('bJaune').addEventListener('pointerdown', function (e) { e.preventDefault(); audio(); var fn = apresJaune; cacherJaune(); fige = false; if (fn) fn(); });
$('bJauneFerme').addEventListener('pointerdown', function (e) { e.preventDefault(); var depart = fige; cacherJaune(); if (depart && S && S.T === 0 && !S.seul) { enJeu = false; fige = false; $('debut').classList.add('on'); } });
$('bReprise').addEventListener('pointerdown', function (e) {
  e.preventDefault(); if (!S || S.combat !== 2 || S.etat !== 'combat') { refus($('bReprise')); return; }
  // (R) quand les quatre sont à terre : chacun touche ↺, puis tous ensemble le gros bouton jaune ; la tablette revient toute seule au dernier point de reprise
  montrerJaune('↺', true, function () { P3.reprendre(S); caler(); });
});

/* ---------- chaque image : les boutons, le groupe ---------- */
function cls(el, c, v) { if (el.classList.contains(c) !== !!v) el.classList.toggle(c, !!v); }
function majInterface() {
  var en = S && enJeu && S.etat === 'combat', h = S && S.h, viv = S && P3.vivant(S);
  BOUTONS.forEach(function (id) { cls($(id), 'on', en && viv); });
  cls($('groupe'), 'on', en && viv);   // (R) mort : plus aucune info
  cls($('bPause'), 'on', enJeu && !finMontree); cls($('bReprise'), 'on', en && S.combat === 2);
  cls(cv, 'mort', en && !viv);
  if (!S || !en) return;
  var c1 = S.combat === 1, sout = S.combat === 2 && S.boss <= 0;
  cls($('bAcide'), 'on', en && viv && !c1); cls($('bBouclier'), 'on', en && viv && !c1);   // (C) au premier combat : ni acide ni bouclier
  [['bFeu', 'feu'], ['bGlace', 'glace'], ['bAcide', 'acide'], ['bSoin', 'soin']].forEach(function (b) {
    var el = $(b[0]); cls(el, 'eteint', b[1] !== 'soin' && sout);
    el.style.setProperty('--p', h.lance && h.lance.quoi === b[1] ? (h.lance.t / h.lance.dur).toFixed(3) : 0);
    el.style.setProperty('--c', b[1] === 'soin' ? '#5fe07a' : b[1] === 'feu' ? '#ff7a2a' : b[1] === 'glace' ? '#9fe3ff' : '#8fe03a');
  });
  $('bSaut').style.setProperty('--r', h.sautT > 0 ? (h.sautT / REG.saut.recharge).toFixed(3) : 0);
  var bq = $('bBouclier'), att = Math.max(0, h.bouclierPret - S.T);
  cls(bq, 'leve', h.bouclierFin > S.T); bq.style.setProperty('--r', h.bouclierFin > S.T ? 0 : (att / S.reg.recharge).toFixed(3));
  cls($('bSoin'), 'appel', h.pv <= 40 && !h.lance);
  // le groupe
  var mc = cadres[S.moi];
  if (mc) { var pv = Math.max(0, Math.round(h.pv)), vi = mc.querySelector('.vie i'); vi.style.width = pv + '%'; vi.style.background = pv > 70 ? '#5fe07a' : pv > 40 ? '#ffa23a' : '#ff4a3a'; mc.querySelector('.vie span').textContent = pv;
    var ms = mc.querySelector('.sym'), t1 = sout ? S.symboles[S.moi] : ''; if (ms.textContent !== t1) { ms.textContent = t1; cls(ms, 'plein', !!t1); } cls(mc, 'crie', sout && S.reel - (S.symboleT || 0) < 6); }
  for (var ro in cadres) {
    if (ro === S.moi) continue;
    var cd = cadres[ro], s2 = cd.querySelector('.sym'), t2 = S.code[ro] || '';
    if (s2.textContent !== t2) { s2.textContent = t2; cls(s2, 'plein', !!t2); }
    cls(cd, 'mort', S.seul && S.amis[ro].mort > 0);
    cls(cd, 'crie', S.seul && P3.aRelayer(S, ro));   // mode seul : il y a quelque chose à lui crier
  }
  cls($('bReprise'), 'appel', !viv && S.seul && Object.keys(S.amis).every(function (r) { return S.amis[r].mort > 0; }));
}

/* ---------- la pause, les réglages ---------- */
function basculerPause() {
  if (!enJeu) return;
  pause = !pause; $('pause').classList.toggle('on', pause);
  if (pause) { majMenu(); horloge.pauseT = performance.now(); fermerSymboles(); }
  else if (S && S.seul) horloge.zero += performance.now() - horloge.pauseT;   // en mode seul, le temps s'arrête ; à quatre, non
  joy.id = null; joy.mx = joy.my = 0;
}
$('bPause').addEventListener('click', basculerPause);
$('bReprendre').addEventListener('click', function () { if (!enJeu) { $('pause').classList.remove('on'); $('debut').classList.add('on'); return; } basculerPause(); });
document.querySelectorAll('.choix[data-r]').forEach(function (g) {
  g.addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b) return;
    var r = g.dataset.r, v = b.dataset.v;
    reglages[r] = r === 'sons' ? v === 'true' : (r === 'vie' ? v : +v);
    if (S && r !== 'debut' && r !== 'vie') S.reg[r] = reglages[r];
    garder(); majMenu();
  });
});
$('bRecommencer').addEventListener('click', function () { pause = false; $('pause').classList.remove('on'); demarrer(); });
$('bAccueil').addEventListener('click', function () { pause = false; enJeu = false; S = null; $('pause').classList.remove('on'); cacherJaune(); $('debut').classList.add('on'); });
function majMenu() {
  document.querySelectorAll('.choix[data-r]').forEach(function (g) {
    var r = g.dataset.r; g.querySelectorAll('button').forEach(function (b) { b.classList.toggle('choisi', String(reglages[r]) === b.dataset.v); });
  });
  $('noteQuatre').hidden = !(S && !S.seul && enJeu);
  $('mesures').textContent = 'Maquette rapide de la phase 3, ' + VERSION + ' · ' + ips + ' images par seconde' + (S ? ' · partie ' + S.partie : '');
}

/* ---------- avant de jouer : son héros, seul ou à quatre ---------- */
var roles = $('roles');
P3.ROLES.forEach(function (r) {
  var b = document.createElement('button'), R = Dessin.ROLES[r];
  b.style.background = R.c; b.textContent = R.ic; b.dataset.r = r; b.setAttribute('aria-label', r);
  b.addEventListener('click', function () { reglages.role = r; garder(); majDebut(); });
  roles.appendChild(b);
});
$('modes').addEventListener('click', function (e) { var b = e.target.closest('button'); if (!b) return; reglages.mode = b.dataset.m; garder(); majDebut(); });
'1234567890'.split('').forEach(function (d) { var b = document.createElement('button'); b.textContent = d; b.addEventListener('click', function () { if (numero.length < 3) numero += d; majDebut(); }); $('pave').appendChild(b); });
(function () { var b = document.createElement('button'); b.textContent = '⌫'; b.setAttribute('aria-label', 'Effacer'); b.addEventListener('click', function () { numero = numero.slice(0, -1); majDebut(); }); $('pave').appendChild(b); })();
function majDebut() {
  roles.querySelectorAll('button').forEach(function (b) { b.classList.toggle('choisi', b.dataset.r === reglages.role); });
  $('modes').querySelectorAll('button').forEach(function (b) { b.classList.toggle('choisi', b.dataset.m === reglages.mode); });
  cls($('numero'), 'on', reglages.mode === 'quatre'); $('numVal').textContent = numero || '—';
  $('bGo').disabled = reglages.mode === 'quatre' && !numero; $('bGo').style.opacity = $('bGo').disabled ? 0.35 : 1;
}
majDebut();
$('bGo').addEventListener('click', function () { if (!$('bGo').disabled) demarrer(); });
$('bReglages').addEventListener('click', function () { $('debut').classList.remove('on'); $('pause').classList.add('on'); majMenu(); });

/* ---------- la fin : sans un mot ---------- */
function mmss(s) { s = Math.round(s); return Math.floor(s / 60) + ':' + ('0' + s % 60).slice(-2); }
function montrerFin() {
  finMontree = true;
  $('fin4').innerHTML = P3.ROLES.map(function (ro) { var R = Dessin.ROLES[ro]; return '<div><i style="background:' + R.c + '">' + R.ic + '</i>' + S.symboles[ro] + '</div>'; }).join('');
  $('stats').innerHTML = '<span>⏱</span><b>' + mmss(S.T) + '</b><span>💀</span><b>' + S.stats.morts + '</b><span>↺</span><b>' + S.stats.reprises + '</b>';
  $('fin').classList.add('on');
}
$('bRejouer').addEventListener('click', function () { $('fin').classList.remove('on'); enJeu = false; S = null; $('debut').classList.add('on'); });

/* ---------- la boucle : le temps suit l'horloge (les quatre tablettes restent calées), pas le nombre d'images ---------- */
var avant = performance.now(), ips = 60, nImg = 0, t0 = avant;
function boucle(maintenant) {
  requestAnimationFrame(boucle);
  nImg++; if (maintenant - t0 > 1000) { ips = Math.round(nImg * 1000 / (maintenant - t0)); nImg = 0; t0 = maintenant; }
  if (S && enJeu && !fige && !(pause && S.seul)) {
    var cible = horloge.reel0 + (maintenant - horloge.zero) / 1000, n = 0;
    while (S.reel < cible - 1e-6 && n++ < 600) {
      var dt = Math.min(0.05, cible - S.reel), kb = entreeClavier(), e = kb || {mx: joy.mx, my: joy.my};
      if (window.__pilote) e = window.__pilote(S, dt) || e;   // pour les essais : un robot peut tenir la manette
      P3.pas(S, dt, pause ? null : e);
    }
    if (S.etat === 'go' && !$('jaune').classList.contains('on')) montrerJaune('GO', false, function () { P3.demarrerC2(S); caler(); });
    if (S.etat === 'fini' && !finMontree) montrerFin();
  }
  ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  if (S && enJeu) Dessin.tout(ctx, S, vue, W, H, joy, dctx); else { ctx.fillStyle = '#070912'; ctx.fillRect(0, 0, W, H); }
  majInterface();
}
document.addEventListener('visibilitychange', function () { if (document.hidden && S && S.seul && enJeu && !pause && !finMontree) basculerPause(); });
taille();
requestAnimationFrame(boucle);

window.__p3 = {get S() { return S; }, set fige(v) { fige = v; }, P3: P3, geste: geste, vue: vue, dctx: dctx, demarrer: demarrer, reglages: reglages,
  get ips() { return ips; }, VERSION: VERSION, toucherAmi: function (ro) { toucherAmi(ro, cadres[ro]); }, caler: caler,
  jaune: function () { $('bJaune').dispatchEvent(new PointerEvent('pointerdown')); }};
})();
