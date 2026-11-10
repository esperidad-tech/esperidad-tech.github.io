
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

/* Mimi se déplace comme un vrai chat : il marche sur le sol, il saute pour monter (coffre, rebord de la fenêtre, paillasse).
   Il ne marche jamais sur le mur. Sa taille suit la perspective (plus gros quand il est près). */
function P3(X, Y, Z){ var q = pr(X, Y, Z); return {x:q[0], y:q[1], k:kz(Z)}; }
var LIEUX = [
  {n:'rebord', p:P3(2.3, 1.22, 4.14), pose:'assis'},
  {n:'coffre', p:P3(2.18, .68, 3.75), pose:'dort'},
  {n:'solD', p:P3(2.1, 0, 3.3), pose:'assis'},
  {n:'devantD', p:P3(1.5, 0, 2.86), pose:'assis'},
  {n:'devantG', p:P3(-1.5, 0, 2.86), pose:'assis'},
  {n:'feu', p:P3(-2.3, 0, 3.42), pose:'dort'}
];
var mimi = {el:null, x:0, y:0, k:160, i:0, enRoute:false, t:0, ditT:0};
function tweenLin(dur, f, fin){ var t0 = performance.now(); if(reduit) dur = 1; (function pas(now){ var p = Math.min(1, (now - t0)/dur); f(p); if(p < 1) requestAnimationFrame(pas); else if(fin) fin(); })(t0); }
function mimiPlace(p){ mimi.x = p.x; mimi.y = p.y; mimi.k = p.k; var e = mimi.el; e.style.left = (p.x/10) + '%'; e.style.top = (p.y/6.4) + '%'; e.style.width = (p.k*.056) + '%'; }
function mimiPose(p, el){ el = el || mimi.el; ['assis','marche','dort','lave','salut'].forEach(function(c){ el.classList.remove('at-c-' + c); }); el.classList.add('at-c-' + p); }
function mimiMarche(vers, fin, vite){
  var de = {x:mimi.x, y:mimi.y, k:mimi.k}, d = Math.hypot(vers.x - de.x, vers.y - de.y);
  if(d < 3){ if(fin) fin(); return; }
  mimi.el.classList.toggle('at-c-gauche', vers.x < de.x); mimiPose('marche');
  tweenLin(d/(vite ? 330 : 150)*1000, function(q){ mimiPlace({x:de.x + (vers.x - de.x)*q, y:de.y + (vers.y - de.y)*q, k:de.k + (vers.k - de.k)*q}); }, fin);
}
function mimiSaut(vers, fin){
  var de = {x:mimi.x, y:mimi.y, k:mimi.k}, haut = 34 + Math.abs(vers.y - de.y)*.3, sens = vers.x < de.x ? -1 : 1, e = mimi.el;
  e.classList.toggle('at-c-gauche', sens < 0); mimiPose('assis'); e.classList.add('elan');
  attendre(220, function(){
    e.classList.remove('elan'); mimiPose('marche'); e.classList.add('saut');
    tweenLin(540, function(q){
      mimiPlace({x:de.x + (vers.x - de.x)*q, y:de.y + (vers.y - de.y)*q - Math.sin(Math.PI*q)*haut, k:de.k + (vers.k - de.k)*q});
      e.style.setProperty('--tangage', (sens*(q - .5)*44).toFixed(1) + 'deg');
    }, function(){ e.classList.remove('saut'); e.style.removeProperty('--tangage'); mimiPose('assis'); if(fin) fin(); });
  });
}
/* Aller d'un lieu à l'autre : rebord ⇄ coffre ⇄ sol sont des sauts, le reste se fait en marchant sur le sol */
function mimiVa(j, fin, vite){
  if(mimi.i === j){ if(fin) fin(); return; }
  var n = mimi.i + (j > mimi.i ? 1 : -1), saut = Math.min(mimi.i, n) <= 1;
  var suite = function(){ mimi.i = n; mimiVa(j, fin, vite); };
  if(saut) mimiSaut(LIEUX[n].p, suite); else mimiMarche(LIEUX[n].p, suite, vite);
}
function mimiPlanifie(){ clearTimeout(mimi.t); mimi.t = setTimeout(mimiBouge, 7000 + Math.random()*8000); }
function mimiBouge(){
  if(S.mode || reduit || mimi.enRoute || S.occupe) return mimiPlanifie();
  if(Math.random() < .22 && !mimi.el.classList.contains('at-c-dort')){ mimiPose('lave'); setTimeout(function(){ if(!mimi.enRoute) mimiPose('assis'); }, 3500); return mimiPlanifie(); }
  var j; do { j = Math.floor(Math.random()*LIEUX.length); } while(j === mimi.i);
  mimi.enRoute = true; mimi.el.classList.remove('pret'); mimiVa(j, function(){ mimi.enRoute = false; mimiPose(LIEUX[j].pose); mimiPlanifie(); majOutils(); });
}
function mimiDit(t, saute){
  var m = mimi.el; if(!m) return; var d = m.querySelector('.dit'); d.textContent = t; d.classList.add('on'); clearTimeout(mimi.ditT); mimi.ditT = setTimeout(function(){ d.classList.remove('on'); }, 2200);
  if(saute && !mimi.enRoute){ m.classList.remove('sursaut'); void m.offsetWidth; m.classList.add('sursaut'); }
}
function mimiCaresse(){
  var m = mimi.el; if(m.classList.contains('at-c-dort')) mimiPose('assis'); mimiDit('Mrrr…');
  var h = document.createElement('span'); h.className = 'coeur-v'; h.textContent = '❤️'; m.appendChild(h); setTimeout(function(){ h.remove(); }, 1300);
}
/* L'utilité de Mimi (le tour « renifler » du talent « Mimi, chat de labo ») : il saute sur la paillasse, renifle l'objet choisi,
   et écarte la moitié des mauvais échantillons (ou des mauvais ingrédients). Une fois par objet. */
function mimiPeutFlairer(){ return !!(S.sel && !S.trouves[S.sel] && !S.flair[S.sel] && !mimi.enRoute && !S.occupe && !S.mode); }
function mimiFlaire(){
  var t = S.sel, c = posCible(), xs = Math.max(250, Math.min(750, c.x - 40));
  var bas = {x:500 + (xs - 500)*kz(2.86)/kz(3.05), y:pr(0, 0, 2.86)[1], k:kz(2.86)}, haut = {x:xs, y:pr(0, .9, 3.05)[1], k:kz(3.05)};
  mimi.enRoute = true; S.occupe = true; clearTimeout(mimi.t); mimi.el.classList.remove('pret');
  var monter = function(){
    mimiMarche(bas, function(){ mimiSaut(haut, function(){
      mimi.el.classList.remove('at-c-gauche'); mimi.el.classList.add('renifle'); mimiDit('snif, snif…');
      attendre(1500, function(){
        mimi.el.classList.remove('renifle'); S.flair[t] = flairer(t); mimiDit('Mrraou !');
        attendre(800, function(){ mimiSaut(bas, function(){ mimi.i = bas.x > 500 ? 3 : 4; mimiMarche(LIEUX[mimi.i].p, function(){ mimi.enRoute = false; S.occupe = false; mimiPose('assis'); mimiPlanifie(); majOutils(); }, true); }); });
      });
    }); }, true);
  };
  if(mimi.i <= 2) mimiVa(3, monter, true); else if(mimi.i === 5) mimiVa(4, monter, true); else monter();
}
function poserMimi(){
  var e = document.createElement('div'); e.className = 'mimi at-t-chat at-c-assis'; e.innerHTML = '<span class="dit"></span>' + svgChat();
  e.setAttribute('role', 'button'); e.setAttribute('aria-label', 'Mimi, le chat'); e.tabIndex = 0; mimi.el = e;
  $('#calque').appendChild(e); mimi.i = 0; mimiPlace(LIEUX[0].p);
  var touche = function(){ if(mimiPeutFlairer()) mimiFlaire(); else if(!mimi.enRoute) mimiCaresse(); };
  e.addEventListener('click', touche); e.addEventListener('keydown', function(ev){ if(ev.key === 'Enter' || ev.key === ' '){ ev.preventDefault(); touche(); } });
  mimiPlanifie();
}
