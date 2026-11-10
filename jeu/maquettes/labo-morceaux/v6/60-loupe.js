
/* ============ La caméra : tous les gros plans sont des zooms de la même image ============
   Rien n'apparaît et rien ne disparaît : on se rapproche seulement de la paillasse. Par-dessus, on ne pose que ce que l'œil voit
   dans l'outil (le verre de la loupe, l'oculaire du microscope, la bandelette de près) et les échantillons sortis du tiroir. */
var boucle = 0, CAM = {cx:600, cy:320, z:1};
function pos(x, y, w, h){ return 'left:calc(' + f1(x) + '*var(--u));top:calc(' + f1(y) + '*var(--u));width:calc(' + f1(w) + '*var(--u));height:calc(' + f1(h) + '*var(--u))'; }
function borne(v, a, b){ return Math.max(a, Math.min(b, v)); }
function camera(cx, cy, z){
  CAM = {cx:cx, cy:cy, z:z};
  $('#decor').style.transform = 'translate(calc(' + f1((600 - cx)*z) + '*var(--u)), calc(' + f1((320 - cy)*z) + '*var(--u))) scale(' + z + ')';
}
function ouvrirMode(nom, html){
  var vieille = $('#calque .bulle-o'); if(vieille) vieille.remove();
  S.mode = nom; son('zoom'); $('#hudBoite').innerHTML = html; $('#modeHaut').hidden = false; $('#cadre').classList.add('ouvert'); document.body.classList.add('ouvert');
  document.body.className = document.body.className.replace(/\bm-\w+/g, '').trim() + ' m-' + nom;
}
function fermerMode(){
  if(S.occupe || !S.mode) return;
  var t = S.vientDeTrouver;
  son('dezoom'); S.mode = null; S.essai = null; S.balaie = null; S.tiroir = null; S.casier = null; S.tirP = {g:0, d:0}; $('#hudBoite').innerHTML = ''; $('#modeHaut').hidden = true;
  $('#cadre').classList.remove('ouvert'); document.body.classList.remove('ouvert'); document.body.className = document.body.className.replace(/\bm-\w+/g, '').trim(); cancelAnimationFrame(boucle);
  camera(600, 320, 1);
  var lm = $('#loupeMobile'); if(lm) lm.removeAttribute('transform');
  dessinerTiroir('g'); dessinerTiroir('d'); dessinerLame(); dessinerCoupes(); majArdoise(); majBandeScene(); majOutils();
  if(t){ S.vientDeTrouver = null; if(S.sel === t){ var p = posCible(); bulle(p.x, p.y - 22, '✅ ' + nomTrouve(t), 3200); } }
  /* le code vient de s'écrire sur l'ardoise : un petit bruit de craie */
  if(codePret() && !S.codeEcrit){ S.codeEcrit = true; attendre(500, function(){ son('craie'); }); }
  mimiReveil();
}
function nomTrouve(t){ var o = OBJETS[t]; return o.liquide ? CIBLES[S.niveau].map(function(k){ return teinte(k).nom; }).join(' + ') : ECH[o.tiroir][o.bon].nom; }
/* Un petit dessin qui vole d'un endroit à un autre (la carte vers la loupe, le témoin vers la bandelette) */
function volVers(de, vers, fin, hauteur){
  if(reduit){ fin(); return; }
  var a = de.getBoundingClientRect(), b = vers.getBoundingClientRect(), v = de.cloneNode(true), c0 = de.querySelector('canvas'), c1 = v.querySelector('canvas');
  if(c0 && c1){ c1.width = c0.width; c1.height = c0.height; c1.getContext('2d').drawImage(c0, 0, 0); }
  v.classList.add('vol'); v.removeAttribute('data-ech'); v.removeAttribute('data-temoin'); v.style.cssText = 'left:' + a.left + 'px;top:' + a.top + 'px;width:' + a.width + 'px;height:' + a.height + 'px';
  document.body.appendChild(v); void v.offsetWidth;
  v.style.left = (b.left + b.width/2 - a.width/2) + 'px'; v.style.top = (b.top + b.height*(hauteur == null ? .62 : hauteur) - a.height/2) + 'px'; v.style.transform = 'scale(.45) rotate(8deg)'; v.style.opacity = '.25';
  setTimeout(function(){ v.remove(); fin(); }, 400);
}
function tampon(sym){ var t = $('#tampon'); if(!t) return; t.textContent = sym; t.classList.remove('pop'); void t.offsetWidth; t.classList.add('pop'); }
function svgPicto(k){ return '<svg viewBox="-26 -22 52 44" aria-hidden="true">' + picto(k, 0, 0, 40) + '</svg>'; }

/* ============ La loupe ============ */
function svgVerre(){
  return '<svg viewBox="0 0 100 100" aria-hidden="true"><defs><linearGradient id="vOr" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff1b8"/><stop offset=".45" stop-color="#f5b945"/><stop offset="1" stop-color="#8a5a12"/></linearGradient><linearGradient id="vBois" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#7d4626"/><stop offset=".5" stop-color="#d99a5e"/><stop offset="1" stop-color="#7d4626"/></linearGradient></defs>' +
    '<g transform="rotate(-45 50 50)"><rect x="43.5" y="97" width="13" height="40" rx="6.5" fill="url(#vBois)" stroke="#24182e" stroke-width="2"/><path d="M44.5,106 h11 M44.5,114 h11 M44.5,122 h11" stroke="#5a3418" stroke-width="1"/><rect x="42" y="94" width="16" height="8" rx="2" fill="url(#vOr)" stroke="#24182e" stroke-width="1.6"/></g>' +
    '<circle cx="50" cy="50" r="46.5" fill="none" stroke="#24182e" stroke-width="7.6"/><circle cx="50" cy="50" r="46.5" fill="none" stroke="url(#vOr)" stroke-width="5.2"/><circle cx="50" cy="50" r="44" fill="none" stroke="#6a4410" stroke-width=".9"/>' +
    '<circle class="anneau" cx="50" cy="50" r="46.5" fill="none" stroke-width="6"/><path d="M19,34 C25,21 37,13 50,11.5" fill="none" stroke="#fff" stroke-width="2.2" opacity=".5" stroke-linecap="round"/></svg>';
}
function ouvrirLoupe(tir){
  if(S.occupe) return; var p = posCible(), g = $('#loupeMobile'), dx = p.x - LOUPE.x, dy = p.y - 14 - LOUPE.y; S.occupe = true; son('loupe');
  /* la loupe se soulève et vient se poser juste au-dessus de ce qu'on a choisi (le cuir ou une coupelle), puis on se rapproche */
  tween(640, function(q){ g.setAttribute('transform', 'translate(' + f1(dx*q) + ',' + f1(dy*q - Math.sin(q*Math.PI)*48) + ')'); }, function(){
    attendre(180, function(){
      S.occupe = false; S.tiroir = null; S.casier = null; S.essai = null;
      ouvrirMode('loupe', '<div class="verre-hud" id="verreHud"><canvas id="cvVerre" aria-label="Sous la loupe : ' + OBJETS[S.sel].nom + '"></canvas>' + svgVerre() + '<div class="tampon" id="tampon" aria-hidden="true"></div></div><div class="ruban" id="ruban" hidden></div><div id="zoneTiroir"></div>');
      vueLoupe(); placerVerre(); majBas(); requestAnimationFrame(function(){ rendVerre(); });
      if(tir) attendre(650, function(){ ouvrirTiroir(tir); });
    });
  });
}
function vueLoupe(){ var c = posCible(); camera(borne(c.x, 520, 690), 410.5, 1.45); }
/* Le grand verre : toujours posé sur ce qu'on regarde. Quand un tiroir est ouvert, il rapetisse et remonte, mais il reste du côté
   de l'objet (au-dessus de la coupelle si on la voit encore, sinon contre le bord le plus proche d'elle). */
function placerVerre(){
  var h = $('#verreHud'); if(!h) return; var c = posCible(), r, x, y, sx = 600 + (c.x - CAM.cx)*CAM.z, sy = 320 + (c.y - CAM.cy)*CAM.z;
  if(S.tiroir){ r = 116; x = borne(sx, r + 20, 1200 - r - 20); y = r + 16; }
  else { r = 162; x = borne(sx, r + 16, 1200 - r - 16); y = borne(sy - 58, r + 10, 640 - r - 10); }
  h.style.cssText = pos(x - r, y - r, 2*r, 2*r); S.verre = {x:x, y:y, r:r};
  var rb = $('#ruban'); if(rb) rb.style.cssText = S.tiroir ? 'left:calc(' + f1(borne(x, 300, 900)) + '*var(--u));top:calc(196*var(--u))' : 'left:calc(' + f1(x) + '*var(--u));top:calc(' + f1(Math.min(y + r + 6, 582)) + '*var(--u))';
  setTimeout(rendVerre, reduit ? 0 : 470);
}
/* Sous le grand verre : les deux tiroirs de la paillasse. On en tire un vers soi : ses trois casiers montrent leur dessin, rangé dedans.
   On touche un casier : ses échantillons s'étalent. Toucher à côté fait revenir d'un pas. */
function majBas(){
  var z = $('#zoneTiroir'); if(!z) return; var t = S.sel, o = OBJETS[t], fait = !!S.trouves[t], barres = S.barres[t] || {}, h = '';
  $('#verreHud').classList.toggle('bon', fait);
  var rb = $('#ruban'); rb.hidden = !fait; if(fait) rb.textContent = '✅ ' + nomTrouve(t);
  if(!S.tiroir || S.tirP[S.tiroir] < 1){ z.innerHTML = ''; return; }
  h += '<div class="onglets pose" style="' + pos(44, 258, 1112, 46) + '">' + (S.casier ? TIROIRS[S.tiroir].map(function(k){ return '<button type="button" class="onglet" data-casier="' + k + '" aria-pressed="' + (S.casier === k) + '">' + svgPicto(k) + '<span>' + CASIERS[k] + '</span></button>'; }).join('') : '') +
    '<button type="button" class="onglet refermer" id="bRefermer"><span class="poignee-o"></span>Refermer</button></div>';
  if(S.casier){
    var l = contenuCasier(S.casier), cols = Math.max(6, Math.ceil(l.length/2));
    h += '<div class="rangee pose" style="' + pos(52, 312, 1096, 284) + ';grid-template-columns:repeat(' + cols + ', minmax(0, 1fr))">' + l.map(function(r){ var id = S.casier + ':' + r, bon = fait && S.casier === o.tiroir && r === o.bon;
      return '<button type="button" class="ech' + (barres[id] ? ' barre' : '') + (bon ? ' ok' : '') + '" data-ech="' + id + '"' + (fait || barres[id] ? ' disabled' : '') + '><canvas></canvas><span class="nm">' + ECH[S.casier][r].nom + '</span>' + (bon ? '<span class="marque">✅</span>' : (barres[id] ? '<span class="marque">❌</span>' : '')) + '</button>'; }).join('') + '</div>';
  }
  z.innerHTML = h;
  requestAnimationFrame(function(){ $$('.ech canvas').forEach(function(cv){ var rr = prep(cv), id = cv.parentNode.dataset.ech.split(':'); fondCuir(rr.ctx, rr.w, rr.h); dessinerRef(rr.ctx, rr.w, rr.h, id[0], id[1], 31 + id[1].length, rr.h/66*({fils:.9, grains:.74, poils:.85, petales:.8}[id[0]] || 1)); }); });
}
/* Ce qu'on voit dans le verre : l'échantillon, bien net ; ou l'échantillon et celui du tiroir posé juste à côté, sous le même verre */
function rendVerre(a){
  var cv = $('#cvVerre'); if(!cv) return; var r = prep(cv), c = r.ctx, w = r.w, h = r.h, ech = w/284, o = OBJETS[S.sel];
  var montre = S.essai || (S.trouves[S.sel] ? o.tiroir + ':' + o.bon : null), p = a == null ? 1 : a;
  c.clearRect(0, 0, w, h); c.save(); c.beginPath(); c.arc(w/2, h/2, w/2, 0, 6.283); c.clip(); fondCuir(c, w, h);
  if(!montre) dessinerPreuve(c, w, h, 2.4*ech);
  else { var id = montre.split(':');
    c.save(); c.translate(0, -h*.2*p); dessinerPreuve(c, w, h, (2.4 - .9*p)*ech); c.restore();
    c.save(); c.translate(0, h*.2 + (1 - p)*h*.7); dessinerRef(c, w, h, id[0], id[1], 11 + id[1].length, 1.5*ech); c.restore(); }
  if(S.balaie != null){ var bx = w*S.balaie, g = c.createLinearGradient(bx - 34, 0, bx + 34, 0); g.addColorStop(0, 'rgba(255,255,255,0)'); g.addColorStop(.5, 'rgba(255,255,255,.6)'); g.addColorStop(1, 'rgba(255,255,255,0)'); c.fillStyle = g; c.fillRect(bx - 34, 0, 68, h); }
  var vg = c.createRadialGradient(w/2, h/2, w*.4, w/2, h/2, w/2); vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(40,20,10,.22)'); c.fillStyle = vg; c.fillRect(0, 0, w, h);
  c.restore();
}
/* Un tiroir s'ouvre pour de vrai : il glisse vers nous, on se rapproche pour voir dedans. On peut le refermer pour ouvrir l'autre. */
function ouvrirTiroir(t){
  if(S.occupe || S.mode !== 'loupe' || S.tiroir === t) return;
  var suite = function(){
    S.occupe = true; S.tiroir = t; S.casier = null; son('tiroirOuvre'); camera(t === 'g' ? 286.5 : 913.5, 537, 1.94); placerVerre();
    tween(440, function(p){ S.tirP[t] = p; dessinerTiroir(t); }, function(){ S.tirP[t] = 1; S.occupe = false; majBas(); });
  };
  if(S.tiroir) fermerTiroir(suite); else suite();
}
function fermerTiroir(fin){
  var t = S.tiroir; if(!t || S.occupe) return; S.occupe = true; son('tiroirFerme'); $('#zoneTiroir').innerHTML = ''; S.tiroir = null; S.casier = null; vueLoupe(); placerVerre();
  tween(340, function(p){ S.tirP[t] = 1 - p; dessinerTiroir(t); }, function(){ S.tirP[t] = 0; dessinerTiroir(t); S.occupe = false; majBas(); if(typeof fin === 'function') fin(); });
}
function ouvrirCasier(k){ if(S.occupe || !S.tiroir || S.casier === k) return; S.casier = k; son('casier'); dessinerTiroir(S.tiroir); majBas(); }
function fermerCasier(){ if(S.occupe || !S.casier) return; S.casier = null; son('recule'); dessinerTiroir(S.tiroir); majBas(); }
/* On touche un échantillon : il vient se poser sous la loupe à côté de l'objet, l'ordinateur compare et le dit clairement */
function essayer(id, bouton){
  var t = S.sel, o = OBJETS[t]; if(S.trouves[t] || S.occupe || (S.barres[t] || {})[id]) return;
  S.occupe = true; son('carte'); $$('.ech').forEach(function(b){ b.setAttribute('aria-pressed', String(b.dataset.ech === id)); });
  volVers(bouton, $('#cvVerre'), function(){
    S.essai = id;
    tween(380, function(p){ rendVerre(p); }, function(){
      son('compare'); tweenLin(reduit ? 1 : 700, function(p){ S.balaie = p; rendVerre(1); }, function(){ S.balaie = null; rendVerre(1); verdict(id, id === o.tiroir + ':' + o.bon); });
    });
  });
}
function verdict(id, bon){
  var t = S.sel, v = $('#verreHud');
  if(bon){ S.trouves[t] = true; S.vientDeTrouver = t; S.occupe = false; S.essai = null; son('bon'); tampon('✅'); majBas(); rendVerre(1); return; }
  v.classList.add('faux'); son('faux'); tampon('❌');
  attendre(950, function(){
    v.classList.remove('faux'); S.barres[t] = S.barres[t] || {}; S.barres[t][id] = true;
    tween(300, function(p){ rendVerre(1 - p); }, function(){ S.essai = null; S.occupe = false; rendVerre(); majBas(); });
  });
}
