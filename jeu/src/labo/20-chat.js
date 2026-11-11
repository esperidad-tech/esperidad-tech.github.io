
/* ============ Mimi : le dessin du jeu (atelier.js), assis, qui marche, qui dort ============ */
var CHAT = ['#f2a65a', '#d9783c', '#ffe0bf'];
function teteChat(p, cx, cy){
  return '<g class="at-c-tete"><g class="at-c-oreilles">' +
    P('M' + (cx-16) + ',' + (cy-6) + ' L' + (cx-18) + ',' + (cy-24) + ' L' + (cx-4) + ',' + (cy-14) + ' Z', p[0], ' stroke-width="4"') +
    P('M' + (cx+4) + ',' + (cy-14) + ' L' + (cx+18) + ',' + (cy-24) + ' L' + (cx+16) + ',' + (cy-6) + ' Z', p[0], ' stroke-width="4"') +
    sansTrait(P('M' + (cx-14) + ',' + (cy-9) + ' L' + (cx-15) + ',' + (cy-19) + ' L' + (cx-7) + ',' + (cy-13) + ' Z', '#ff9db4')) +
    sansTrait(P('M' + (cx+7) + ',' + (cy-13) + ' L' + (cx+15) + ',' + (cy-19) + ' L' + (cx+14) + ',' + (cy-9) + ' Z', '#ff9db4')) + '</g>' +
    Ell(cx, cy, 19, 16, p[0]) +
    sansTrait(P('M' + (cx-8) + ',' + (cy+6) + ' C' + (cx-4) + ',' + (cy+2) + ' ' + (cx+4) + ',' + (cy+2) + ' ' + (cx+8) + ',' + (cy+6) + ' C' + (cx+4) + ',' + (cy+12) + ' ' + (cx-4) + ',' + (cy+12) + ' ' + (cx-8) + ',' + (cy+6) + ' Z', p[2])) +
    '<g class="at-c-yeux">' + Ell(cx-7, cy-1, 3.4, 4.4, K, ' stroke-width="1"') + Ell(cx+7, cy-1, 3.4, 4.4, K, ' stroke-width="1"') +
      '<circle cx="' + (cx-6) + '" cy="' + (cy-2.6) + '" r="1.3" fill="#fff"/><circle cx="' + (cx+8) + '" cy="' + (cy-2.6) + '" r="1.3" fill="#fff"/></g>' +
    '<g class="at-c-ferme">' + T('M' + (cx-10) + ',' + (cy-1) + ' q3,3 6,0 M' + (cx+4) + ',' + (cy-1) + ' q3,3 6,0', K, 2.2) + '</g>' +
    P('M' + (cx-2.5) + ',' + (cy+4) + ' l2.5,2.5 l2.5,-2.5 Z', '#ff8fa8', ' stroke-width="1.5"') +
    T('M' + cx + ',' + (cy+6.5) + ' q-3,3.5 -6,1 M' + cx + ',' + (cy+6.5) + ' q3,3.5 6,1', K, 1.6) +
    T('M' + (cx-11) + ',' + (cy+5) + ' l-12,-2 M' + (cx-11) + ',' + (cy+8) + ' l-12,2 M' + (cx+11) + ',' + (cy+5) + ' l12,-2 M' + (cx+11) + ',' + (cy+8) + ' l12,2', K, 1.1) + '</g>';
}
function svgChat(){
  var p = CHAT, ancienSW = SW; SW = 5;
  var queue = function(d){ return '<g class="at-c-queue">' + T(d, K, 11) + T(d, p[0], 6) + '</g>'; };
  var patte = function(x, y, h, coul, cls){ return '<g class="' + cls + '">' + R(x, y, 9, h, 4, coul) + Ell(x + 4.5, y + h - 1, 6, 3.5, p[2], ' stroke-width="2.5"') + '</g>'; };
  var dort = '<g class="at-c-g-dort"><g transform="translate(0,20)"><g class="at-respire">' + P('M88,64 C112,62 112,38 98,40 C106,46 104,58 86,58 Z', p[0]) + P('M18,68 C8,48 32,26 62,28 C92,30 102,50 98,68 Z', p[0]) +
    T('M60,32 C58,40 60,46 64,50 M76,34 C74,42 76,48 80,52 M44,34 C44,40 46,44 50,48', p[1], 4) + P('M10,68 C2,52 12,38 30,40 C46,42 50,58 44,68 Z', p[0]) +
    P('M13,46 L12,30 L25,40 Z', p[0], ' stroke-width="4"') + P('M33,40 L41,28 L43,46 Z', p[0], ' stroke-width="4"') + P('M15,43 L15,35 L21,40 Z', '#ff9db4', ' stroke-width="0"') +
    P('M20,62 C24,58 34,58 40,62 C36,67 24,67 20,62 Z', p[2], ' stroke-width="0"') + T('M16,54 q4,3 8,0 M30,54 q4,3 8,0', K, 2.5) + P('M26,59 l3,2 l3,-2 Z', '#ff8fa8', ' stroke-width="1.5"') + '</g></g></g>';
  var assis = '<g class="at-c-g-assis">' + queue('M34,88 C12,90 6,72 16,60 C20,55 26,57 24,63') +
    P('M30,91 C24,74 30,52 50,48 C66,46 76,60 76,76 C76,86 70,91 60,91 Z', p[0]) + T('M40,60 C38,70 40,80 44,86 M50,56 C48,64 49,72 52,78', p[1], 4) +
    P('M60,58 C70,60 72,74 66,86 C60,82 58,70 60,58 Z', p[2], ' stroke-width="0"') + patte(57, 66, 26, p[1], 'at-c-patte-b') + patte(67, 64, 28, p[0], 'at-c-patte') + teteChat(p, 68, 34) + '</g>';
  var debout = '<g class="at-c-g-debout">' + queue('M22,62 C6,54 6,34 16,26') + patte(24, 64, 27, p[1], 'at-c-j at-c-j1') + patte(66, 64, 27, p[1], 'at-c-j at-c-j3') +
    P('M18,66 C16,52 30,46 54,46 C76,46 90,50 90,62 C90,72 78,74 56,74 C32,74 18,74 18,66 Z', p[0]) + T('M40,48 C38,56 40,64 44,70 M54,47 C52,56 54,64 58,70', p[1], 3.5) +
    patte(34, 66, 26, p[0], 'at-c-j at-c-j2') + patte(76, 66, 26, p[0], 'at-c-j at-c-j4') + teteChat(p, 92, 46) + '</g>';
  SW = ancienSW;
  return '<svg viewBox="0 -6 114 104" aria-hidden="true"><ellipse class="at-ombre" cx="58" cy="92" rx="46" ry="5" fill="rgba(0,0,0,.28)"/><g class="at-c-corps">' + dort + assis + debout + '</g>' +
    '<text class="at-zzz" x="46" y="34" font-size="17" font-weight="700" fill="#bff9ff" text-anchor="middle">z</text><text class="at-zzz z2" x="56" y="26" font-size="13" font-weight="700" fill="#bff9ff" text-anchor="middle">z</text></svg>';
}

/* Mimi, dans la vue de près : on ne le voit pas. De temps en temps (rarement), il bondit d'en bas de l'écran sur le plateau
   et s'assoit en plein sur les échantillons : il gêne ! On le touche : il s'en va, et il sort de l'écran pour de bon.
   On peut aussi le prendre avec le doigt et le poser ailleurs. */
var SIEGE = {x:600, y:466}, mimi = {el:null, x:0, y:0, enRoute:false, pose:false, sur:false, porte:false, geste:null, tv:0, tp:0, ditT:0, taille:1};
function tweenLin(dur, f, fin){ var t0 = performance.now(); if(reduit) dur = 1; (function pas(now){ var p = Math.min(1, (now - t0)/dur); f(p); if(p < 1) requestAnimationFrame(pas); else if(fin) fin(); })(t0); }
/* Un point hors de l'écran, sous le bord du bas (quelle que soit la taille de l'écran) */
function horsEcran(x){ var c = $('#cadre').getBoundingClientRect(), d = $('#decor').getBoundingClientRect(), u = d.width/1200 || 1; return {x:x == null ? 560 : x, y:640 + Math.max(0, c.bottom - d.bottom)/u + 230}; }
function mimiPlace(p){ mimi.x = p.x; mimi.y = p.y; var e = mimi.el; e.style.left = (p.x/12) + '%'; e.style.top = (p.y/6.4) + '%'; }
function mimiTaille(k){ mimi.taille = k; mimi.el.style.setProperty('--taille', k.toFixed(3)); }
function mimiPose(p, el){ el = el || mimi.el; ['assis','marche','dort','lave','salut'].forEach(function(c){ el.classList.remove('at-c-' + c); }); el.classList.add('at-c-' + p); }
function mimiSaut(vers, fin, taille, sansElan){
  var de = {x:mimi.x, y:mimi.y}, t0 = mimi.taille, t1 = taille || t0, haut = 40 + Math.abs(vers.y - de.y)*.3, sens = vers.x < de.x ? -1 : 1, e = mimi.el;
  e.classList.toggle('at-c-gauche', sens < 0); mimiPose('assis'); if(!sansElan) e.classList.add('elan');
  attendre(sansElan ? 0 : 200, function(){
    e.classList.remove('elan'); mimiPose('marche'); e.classList.add('saut'); son('saut');
    tweenLin(560, function(q){ mimiPlace({x:de.x + (vers.x - de.x)*q, y:de.y + (vers.y - de.y)*q - Math.sin(Math.PI*q)*haut}); mimiTaille(t0 + (t1 - t0)*q); e.style.setProperty('--tangage', (sens*(q - .5)*44).toFixed(1) + 'deg'); },
      function(){ e.classList.remove('saut'); e.classList.remove('at-c-gauche'); e.style.removeProperty('--tangage'); mimiPose('assis'); if(fin) fin(); });
  });
}
function mimiDit(t, saute){
  var m = mimi.el; if(!m) return; var d = m.querySelector('.dit'); d.textContent = t; d.classList.add('on'); clearTimeout(mimi.ditT); mimi.ditT = setTimeout(function(){ d.classList.remove('on'); }, 2200);
  if(saute && !mimi.enRoute){ m.classList.remove('sursaut'); void m.offsetWidth; m.classList.add('sursaut'); }
}
/* Où est-il ? Sur le plateau ? Assis sur les échantillons ? */
function surPlateau(p){ return p.y > YB + 16 && p.y < YF + 4 && Math.abs(p.x - 600) < (LARG - 14)*kY(Math.min(p.y, YF)); }
function surEchantillon(p){ return Math.abs(p.x - 600) < 196 && p.y > 404 && p.y < 520; }
function versScene(cx, cy){ var r = $('#decor').getBoundingClientRect(); return {x:(cx - r.left)/r.width*1200, y:(cy - r.top)/r.height*640}; }
/* Il vient : un bond depuis le bas de l'écran, et il s'installe sur le carré de cuir en ronronnant */
var SANS_MIMI = false;     /* (dans le jeu : pas de visite si l'Alchimiste n'a pas encore de chat) */
function mimiVisite(ms){ clearTimeout(mimi.tv); if(SANS_MIMI) return; mimi.tv = setTimeout(mimiVient, ms == null ? 15000 + Math.random()*8000 : ms); }
function mimiVient(){
  if(mimi.calme) return;
  /* (pendant l'explication en images et le guide de la première analyse, il laisse l'Alchimiste apprendre tranquille : il reviendra voir après) */
  if(document.querySelector('.intro') || (typeof GUIDE === 'object' && GUIDE && GUIDE.id && !GUIDE.fini)) return mimiVisite(20000);
  if(S.mode || S.occupe || mimi.enRoute || mimi.pose || mimi.porte || document.hidden) return mimiVisite(6000);
  mimi.enRoute = true; mimi.el.hidden = false; mimiTaille(1); mimiPlace(horsEcran(540));
  mimiSaut(SIEGE, function(){ mimi.enRoute = false; mimi.pose = true; mimi.sur = true; son('pose'); mimiDit('Mrrr…'); son('ronron'); majOutils(); }, .84, true);
}
/* Il s'en va : il saute par-dessus le bord de la paillasse et sort de l'écran. On ne le voit plus. */
function mimiSort(depuis){
  mimi.enRoute = true; mimi.sur = false; mimi.pose = false; majOutils();
  mimiSaut(horsEcran(mimi.x + (mimi.x < 600 ? -60 : 60)), function(){ mimi.enRoute = false; mimi.el.hidden = true; majOutils(); mimiVisite(55000 + Math.random()*35000); }, 1, depuis === 'main');
}
function mimiPart(muet){
  if(mimi.enRoute || mimi.porte) return; clearTimeout(mimi.tp);
  if(!muet){ mimiDit('Mraou !'); son('miaou'); }
  mimi.enRoute = true; attendre(muet ? 0 : 260, function(){ mimi.enRoute = false; mimiSort(); });
}
/* Il est assis dessus : tant qu'il n'a pas bougé, on ne peut rien faire des échantillons du cuir */
function mimiGene(){ if(!mimi.sur) return false; mimiDit('Mrrr ?', true); son('ronron'); return true; }
/* On le prend avec le doigt… */
function mimiPrend(){
  clearTimeout(mimi.tp); clearTimeout(mimi.tv); mimi.porte = true; mimi.sur = false; mimi.el.classList.add('porte'); mimiPose('marche'); mimi.el.classList.add('saut'); mimiDit('Mraou ?'); son('miaou'); majOutils();
}
/* … et on le repose : sur le plateau, il s'assoit là (et s'il est encore sur les échantillons, il gêne toujours) ; ailleurs, il sort de l'écran */
function mimiLache(p){
  var e = mimi.el; mimi.porte = false; e.classList.remove('porte'); e.classList.remove('saut'); mimiPose('assis');
  if(surPlateau(p)){ mimi.pose = true; mimi.sur = surEchantillon(p); mimiTaille(.84); son('pose'); majOutils(); if(mimi.sur) mimiDit('Mrrr…'); else mimi.tp = setTimeout(function(){ mimiPart(true); }, 7000); }
  else mimiSort('main');
}
/* Quand on revient d'un gros plan, ou qu'on recommence : il reprend sa petite vie */
function mimiReveil(){ if(mimi.el && !mimi.pose && !mimi.enRoute) mimiVisite(20000 + Math.random()*15000); }
function mimiRetour(){ clearTimeout(mimi.tp); clearTimeout(mimi.tv); mimi.enRoute = false; mimi.pose = false; mimi.sur = false; mimi.porte = false; mimi.geste = null; mimi.el.classList.remove('porte', 'saut', 'elan', 'at-c-gauche'); mimiTaille(1); mimi.el.hidden = true; mimiPose('assis'); mimiVisite(); }
function poserMimi(){
  var e = document.createElement('div'); e.className = 'mimi at-t-chat at-c-assis'; e.innerHTML = '<span class="dit"></span>' + svgChat();
  e.setAttribute('role', 'button'); e.setAttribute('aria-label', 'Mimi, le chat'); e.tabIndex = 0; e.hidden = true; mimi.el = e;
  $('#calque').appendChild(e);
  var touche = function(){ if(mimi.enRoute || mimi.porte) return; if(mimi.pose) mimiPart(); };
  e.addEventListener('pointerdown', function(ev){ if(mimi.enRoute || S.mode || S.occupe) return; mimi.geste = {id:ev.pointerId, x:ev.clientX, y:ev.clientY, bouge:false}; try { e.setPointerCapture(ev.pointerId); } catch(err){} });
  e.addEventListener('pointermove', function(ev){
    var g = mimi.geste; if(!g || g.id !== ev.pointerId) return;
    if(!g.bouge && Math.hypot(ev.clientX - g.x, ev.clientY - g.y) > 12){ g.bouge = true; mimiPrend(); }
    if(g.bouge){ var p = versScene(ev.clientX, ev.clientY); mimiPlace({x:p.x, y:p.y + 62*mimi.taille}); }
  });
  var fin = function(ev){ var g = mimi.geste; mimi.geste = null; if(!g || !g.bouge) return; mimi.avale = true; setTimeout(function(){ mimi.avale = false; }, 60); mimiLache({x:mimi.x, y:mimi.y}); };
  e.addEventListener('pointerup', fin); e.addEventListener('pointercancel', fin);
  e.addEventListener('click', function(){ if(mimi.avale) return; touche(); }); e.addEventListener('keydown', function(ev){ if(ev.key === 'Enter' || ev.key === ' '){ ev.preventDefault(); touche(); } });
  mimiVisite();
}
