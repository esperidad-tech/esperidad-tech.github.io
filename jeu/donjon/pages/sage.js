/* sage.js — la tablette du SAGE pendant le donjon (Les Enquêteurs de Brumeval, enquête 3).
   - Le plan des Fondateurs (sage-plan.js), qu'on fait glisser et zoomer ; ses notes codées (loupe + grille de l'alphabet
     secret) ; l'encre invisible (la rune qu'on promène : l'encre apparaît là où elle passe, et reste) ; le coin déchiré,
     complété par le code page:dechiree.
   - Le Grand Livre et ses pages blanches de sauvegarde (3, +1 avec page:blanche) : chaque page donne un code sauve:N.
   - Le bouton « 📥 Un code » : page:dechiree, page:blanche, porte:odette, rune:lumiere (chacun une seule fois), et les
     codes d'étude des monstres (etude:<monstre>) : le Grand Livre montre le monstre et ses énigmes (donnees.js, D.LIVRE).
   Tout est gardé dans localStorage ('brumeval-donjon-sage'). Rapidité : glisser / zoomer = un seul transform ;
   la rune ne peint que la petite toile de l'encre qu'elle touche ; au repos, rien ne tourne. */
(function(){
'use strict';
var C = window.CARTE_DONJON, P = C.PLAN, U = C.util, DC = window.DONJON_CODES, PS = window.PLAN_SAGE, PG = window.PAGE, DD = window.DonjonDonnees;
var q = PG.q, qa = PG.qa, esc = PG.esc, el = PG.el, dit = PG.dit;
var PV = P.vue, RES = 2.6;     /* l'encre invisible : px par unité */
var mem = PG.memoire('brumeval-donjon-sage');
var S;
function neuf(){ return {v:1, codes:{}, pages:{}, encre:{}, encreFinie:{}, lues:{}, grille:null, debut:true}; }
function garder(){ mem.ecrire(S); }
var tGarde = 0; function garderBientot(){ clearTimeout(tGarde); tGarde = setTimeout(garder, 350); }

/* ======================================================================
   Le plan : construction
   ====================================================================== */
var table, couche, planEl, coinEl, runeEl, curseur, bulleEl;
var NOTES_ENCRE = P.notes.filter(function(n){ return n.type === 'encre'; });
var CELL = 12;     /* les petites cases où l'encre est révélée (en unités) */
function construirePlan(){
  var s = PS.svg();
  couche.innerHTML = s.principal;
  planEl = couche.firstChild;
  /* les toiles de l'encre invisible */
  NOTES_ENCRE.forEach(function(n){
    var b = n.boite, cv = el('canvas', 'encre');
    cv.width = Math.round(b.w * RES); cv.height = Math.round(b.h * RES);
    cv.style.left = (b.x - PV.x) + 'px'; cv.style.top = (b.y - PV.y) + 'px'; cv.style.width = b.w + 'px'; cv.style.height = b.h + 'px';
    cv.dataset.note = n.id;
    couche.appendChild(cv);
    n.vis = cv; n.pleine = document.createElement('canvas'); n.pleine.width = cv.width; n.pleine.height = cv.height;
    n.nx = Math.ceil(b.w / CELL); n.ny = Math.ceil(b.h / CELL);
  });
  /* le coin déchiré (caché tant que le code page:dechiree n'est pas arrivé) */
  var w = el('div', 'coin'); w.innerHTML = s.coin; coinEl = w; var bc = s.boiteCoin;
  w.style.left = (bc.x - PV.x) + 'px'; w.style.top = (bc.y - PV.y) + 'px'; w.style.width = bc.w + 'px'; w.style.height = bc.h + 'px';
  couche.appendChild(w);
  majCoin(false); majTraductions(); majOdette();
  peindreEncre();
  if(document.fonts && document.fonts.ready) document.fonts.ready.then(function(){ peindreEncre(); });
}
/* l'encre « pleine » de chaque note (avec la bonne police), et ce qui en est déjà révélé */
function peindreEncre(){
  NOTES_ENCRE.forEach(function(n){
    var px = n.pleine.getContext('2d'); PS.encre(px, n, RES);
    /* les cases qui contiennent de l'encre (pour savoir quand la note est assez révélée) */
    var d = null; try{ d = px.getImageData(0, 0, n.pleine.width, n.pleine.height).data; }catch(e){}
    n.casesEncre = [];
    for(var j = 0; j < n.ny; j++) for(var i = 0; i < n.nx; i++){
      if(!d){ n.casesEncre.push(j * n.nx + i); continue; }
      var x0 = Math.floor(i * CELL * RES), y0 = Math.floor(j * CELL * RES), x1 = Math.min(n.pleine.width, Math.floor((i + 1) * CELL * RES)), y1 = Math.min(n.pleine.height, Math.floor((j + 1) * CELL * RES)), ok = false;
      for(var y = y0; y < y1 && !ok; y += 3) for(var x = x0; x < x1 && !ok; x += 3) if(d[(y * n.pleine.width + x) * 4 + 3] > 60) ok = true;
      if(ok) n.casesEncre.push(j * n.nx + i);
    }
    redessinerEncre(n);
  });
}
function cases(n){ var c = S.encre[n.id]; if(!c){ c = S.encre[n.id] = ''; } return c; }
function redessinerEncre(n){
  var x = n.vis.getContext('2d'); x.setTransform(1, 0, 0, 1, 0, 0); x.clearRect(0, 0, n.vis.width, n.vis.height);
  if(S.encreFinie[n.id]){ x.drawImage(n.pleine, 0, 0); return; }
  var c = cases(n); if(!c) return;
  x.save(); x.beginPath();
  for(var k = 0; k < c.length; k++) if(c.charCodeAt(k) === 49){ var i = k % n.nx, j = Math.floor(k / n.nx); x.moveTo((i + .5) * CELL * RES + CELL * RES, (j + .5) * CELL * RES); x.arc((i + .5) * CELL * RES, (j + .5) * CELL * RES, CELL * RES, 0, 6.2832); }
  x.clip(); x.drawImage(n.pleine, 0, 0); x.restore();
}
/* la rune passe en (wx, wy), rayon wr (en unités) : l'encre apparaît là, et reste */
function reveler(wx, wy, wr){
  var trouve = null;
  NOTES_ENCRE.forEach(function(n){
    var b = n.boite;
    if(wx + wr < b.x || wx - wr > b.x + b.w || wy + wr < b.y || wy - wr > b.y + b.h || S.encreFinie[n.id]) return;
    var x = n.vis.getContext('2d');
    x.save(); x.beginPath(); x.arc((wx - b.x) * RES, (wy - b.y) * RES, wr * RES, 0, 6.2832); x.clip(); x.drawImage(n.pleine, 0, 0); x.restore();
    var c = cases(n), t = c.length < n.nx * n.ny ? (c + new Array(n.nx * n.ny - c.length + 1).join('0')).split('') : c.split(''), neuves = 0;
    var i0 = Math.max(0, Math.floor((wx - wr - b.x) / CELL)), i1 = Math.min(n.nx - 1, Math.floor((wx + wr - b.x) / CELL)), j0 = Math.max(0, Math.floor((wy - wr - b.y) / CELL)), j1 = Math.min(n.ny - 1, Math.floor((wy + wr - b.y) / CELL));
    for(var j = j0; j <= j1; j++) for(var i = i0; i <= i1; i++){ var cx = b.x + (i + .5) * CELL, cy = b.y + (j + .5) * CELL; if(Math.hypot(cx - wx, cy - wy) <= wr && t[j * n.nx + i] !== '1'){ t[j * n.nx + i] = '1'; neuves++; } }
    if(!neuves) return;
    S.encre[n.id] = t.join('');
    var vus = n.casesEncre.filter(function(k){ return t[k] === '1'; }).length, part = n.casesEncre.length ? vus / n.casesEncre.length : 0;
    if(vus && !n.dejaVu){ n.dejaVu = true; trouve = trouve || {n:n, debut:true}; }
    if(part >= .55){ S.encreFinie[n.id] = true; trouve = {n:n, fini:true}; finirEncre(n); }
    garderBientot();
  });
  return trouve;
}
function finirEncre(n){
  var x = n.vis.getContext('2d'), a = el('canvas', 'encre'); a.width = n.vis.width; a.height = n.vis.height; a.style.cssText = n.vis.style.cssText;
  a.getContext('2d').drawImage(n.pleine, 0, 0);
  couche.appendChild(a);
  var an = a.animate ? a.animate([{opacity:0}, {opacity:1}], {duration:900, easing:'ease-out'}) : null;
  function fin(){ x.clearRect(0, 0, n.vis.width, n.vis.height); x.drawImage(n.pleine, 0, 0); a.remove(); }
  if(an) an.onfinish = fin; else fin();
  PG.son('magie');
  PG.etincelles(table, (n.x - PV.x) * Z.z + Z.tx, (n.y - PV.y) * Z.z + Z.ty, 18, {dist:70});
}
function majCoin(anim){
  var ok = !!S.codes['page:dechiree'];
  coinEl.hidden = !ok;
  var place = planEl.querySelector('.place-coin'); if(place) place.style.display = ok ? 'none' : '';
  if(ok && anim && coinEl.animate){
    coinEl.animate([{transform:'translate(320px, 260px) rotate(14deg) scale(.8)', opacity:0}, {transform:'translate(40px, 30px) rotate(4deg) scale(.97)', opacity:1, offset:.6}, {transform:'none', opacity:1}],
      {duration:1300, easing:'cubic-bezier(.2,.8,.3,1)'});
  }
}
function majTraductions(){ qa('[data-trad]', planEl).forEach(function(g){ g.style.display = S.lues[g.getAttribute('data-trad')] ? '' : 'none'; }); }
/* la rune de lumière : le Pisteur la trouve au fond du puits (Romain, 10 novembre) ; tant que son code n'est pas arrivé, pas de rune */
function majRune(anim){
  var ok = !!S.codes['rune:lumiere'];
  runeEl.hidden = !ok;
  if(ok && anim && runeEl.animate) runeEl.animate([{transform:'translateY(60px) scale(.5)', opacity:0}, {transform:'translateY(-8px) scale(1.12)', opacity:1, offset:.7}, {transform:'none', opacity:1}], {duration:700, easing:'ease-out'});
}
function majOdette(){ var g = coinEl && coinEl.querySelector('.coeur-odette'); if(g) g.style.display = S.codes['porte:odette'] ? '' : 'none'; }

/* ======================================================================
   Glisser et zoomer (un seul transform sur la couche)
   ====================================================================== */
var Z = {z:.5, tx:0, ty:0, zMin:.3, zMax:2.4};
var BARRE = 96, BAS = 76, HAUT = 0;
/* la place prise par la barre d'outils (à droite) et par la rune et le conteur (en bas) */
function mesurerBords(){ var b = q('#barre'), r = b ? b.getBoundingClientRect() : null, ba = q('#bas'), rb = ba ? ba.getBoundingClientRect() : null;
  if(r && r.width) BARRE = Math.max(0, window.innerWidth - r.left) + 6; if(rb && rb.height) BAS = Math.max(0, window.innerHeight - rb.top) + 4;
  var g = q('#grille'); HAUT = g && !g.hidden ? g.getBoundingClientRect().bottom + 8 : 0; }
function dims(){ var r = table.getBoundingClientRect(); return {w:r.width, h:r.height}; }
function zoomFit(){ var d = dims(); return Math.min((d.w - BARRE - 8) / PV.w, d.h / PV.h); }
function borner(){
  var d = dims(), cw = PV.w * Z.z, ch = PV.h * Z.z, aw = d.w - BARRE;
  if(cw <= aw) Z.tx = (aw - cw) / 2; else Z.tx = Math.max(aw - cw - 20, Math.min(20, Z.tx));
  if(ch + BAS + HAUT <= d.h) Z.ty = HAUT + (d.h - BAS - HAUT - ch) / 2;
  else if(ch + BAS <= d.h) Z.ty = (d.h - BAS - ch) / 2;
  else if(ch <= d.h) Z.ty = Math.max(d.h - BAS - ch, Math.min((d.h - ch) / 2, Z.ty));
  else Z.ty = Math.max(d.h - BAS - ch - 10, Math.min(20, Z.ty));
}
var raf = 0;
function poser(){ raf = 0; couche.style.transform = 'translate3d(' + Math.round(Z.tx * 10) / 10 + 'px,' + Math.round(Z.ty * 10) / 10 + 'px,0) scale(' + Math.round(Z.z * 10000) / 10000 + ')'; }
function demander(){ if(!raf) raf = requestAnimationFrame(poser); }
/* après un zoom : le navigateur repeint le plan net à la nouvelle taille (une fois) */
var tNet = 0;
function nettete(){ clearTimeout(tNet); tNet = setTimeout(function(){ couche.style.willChange = 'auto'; requestAnimationFrame(function(){ requestAnimationFrame(function(){ couche.style.willChange = 'transform'; }); }); }, 160); }
function zoomer(z, sx, sy, anim){
  var z0 = Z.z, nz = Math.max(Z.zMin, Math.min(Z.zMax, z));
  var wx = (sx - Z.tx) / z0, wy = (sy - Z.ty) / z0;
  var t0 = {tx:Z.tx, ty:Z.ty, z:z0};
  Z.z = nz; Z.tx = sx - wx * nz; Z.ty = sy - wy * nz; borner();
  if(anim && couche.animate){
    var de = 'translate3d(' + t0.tx + 'px,' + t0.ty + 'px,0) scale(' + t0.z + ')', a = 'translate3d(' + Z.tx + 'px,' + Z.ty + 'px,0) scale(' + Z.z + ')';
    poser(); couche.animate([{transform:de}, {transform:a}], {duration:260, easing:'ease-out'});
  } else poser();
  nettete();
}
function versMonde(cx, cy){ var r = table.getBoundingClientRect(); return {x:(cx - r.left - Z.tx) / Z.z + PV.x, y:(cy - r.top - Z.ty) / Z.z + PV.y}; }
function centrerSur(wx, wy, z){
  var d = dims(); if(z) Z.z = Math.max(Z.zMin, Math.min(Z.zMax, z));
  var t0 = couche.style.transform;
  Z.tx = (d.w - BARRE) / 2 - (wx - PV.x) * Z.z; Z.ty = (d.h - BAS) / 2 - (wy - PV.y) * Z.z; borner();
  var a = 'translate3d(' + Z.tx + 'px,' + Z.ty + 'px,0) scale(' + Z.z + ')';
  poser(); if(couche.animate && t0) couche.animate([{transform:t0}, {transform:a}], {duration:700, easing:'cubic-bezier(.3,.7,.3,1)'});
  nettete();
}
function gestes(){
  var doigts = {}, d0 = null, glisse = null, dernierTap = 0;
  table.addEventListener('pointerdown', function(e){
    if(e.target.closest('button, .voile')) return;
    doigts[e.pointerId] = {x:e.clientX, y:e.clientY};
    try{ table.setPointerCapture(e.pointerId); }catch(er){}
    var ids = Object.keys(doigts);
    if(ids.length === 1) glisse = {x:e.clientX, y:e.clientY, tx:Z.tx, ty:Z.ty, bouge:false, t:performance.now()};
    else if(ids.length === 2){
      var a = doigts[ids[0]], b = doigts[ids[1]], r = table.getBoundingClientRect();
      d0 = {d:Math.hypot(a.x - b.x, a.y - b.y) || 1, z:Z.z, mx:(a.x + b.x) / 2 - r.left, my:(a.y + b.y) / 2 - r.top, tx:Z.tx, ty:Z.ty};
      glisse = null;
    }
  });
  table.addEventListener('pointermove', function(e){
    if(!doigts[e.pointerId]) return;
    doigts[e.pointerId] = {x:e.clientX, y:e.clientY};
    var ids = Object.keys(doigts);
    if(ids.length >= 2 && d0){
      var a = doigts[ids[0]], b = doigts[ids[1]], r = table.getBoundingClientRect();
      var d = Math.hypot(a.x - b.x, a.y - b.y) || 1, mx = (a.x + b.x) / 2 - r.left, my = (a.y + b.y) / 2 - r.top;
      var nz = Math.max(Z.zMin, Math.min(Z.zMax, d0.z * d / d0.d)), wx = (d0.mx - d0.tx) / d0.z, wy = (d0.my - d0.ty) / d0.z;
      Z.z = nz; Z.tx = mx - wx * nz; Z.ty = my - wy * nz; borner(); demander();
      return;
    }
    if(!glisse) return;
    var dx = e.clientX - glisse.x, dy = e.clientY - glisse.y;
    if(!glisse.bouge && Math.abs(dx) + Math.abs(dy) > 8){ glisse.bouge = true; table.classList.add('glisse'); }
    if(glisse.bouge){ Z.tx = glisse.tx + dx; Z.ty = glisse.ty + dy; borner(); demander(); }
  });
  function fin(e){
    if(!doigts[e.pointerId]) return;
    delete doigts[e.pointerId];
    var ids = Object.keys(doigts);
    if(d0 && ids.length < 2){ d0 = null; nettete(); if(ids.length === 1){ var a = doigts[ids[0]]; glisse = {x:a.x, y:a.y, tx:Z.tx, ty:Z.ty, bouge:true}; } return; }
    if(!ids.length && glisse){
      var g = glisse; glisse = null; table.classList.remove('glisse');
      if(!g.bouge && e.type === 'pointerup'){
        var n = performance.now();
        if(n - dernierTap < 320){ dernierTap = 0; var r = table.getBoundingClientRect(); var zf = zoomFit();
          zoomer(Z.z < zf * 1.6 ? Z.z * 2 : zf, e.clientX - r.left, e.clientY - r.top, true); return; }
        dernierTap = n;
        toucherPlan(versMonde(e.clientX, e.clientY));
      }
    }
  }
  table.addEventListener('pointerup', fin);
  table.addEventListener('pointercancel', fin);
  table.addEventListener('wheel', function(e){
    e.preventDefault(); var r = table.getBoundingClientRect();
    zoomer(Z.z * Math.exp(-e.deltaY * .0016), e.clientX - r.left, e.clientY - r.top, false);
  }, {passive:false});
}

/* ======================================================================
   Toucher le plan : lire un nom, ouvrir une note codée…
   ====================================================================== */
var NOMS_SIGNES = {etoile:'une étoile', lune:'une lune', oeil:'un œil', gueule:'une gueule de crapaud'};
function dans(p, x, y, w, h){ return p.x >= x - w / 2 && p.x <= x + w / 2 && p.y >= y - h / 2 && p.y <= y + h / 2; }
function toucherPlan(p){
  var coinOk = !!S.codes['page:dechiree'];
  if(!coinOk && U.dansPoly(PS.bordCoin, p.x, p.y)){ conte('Un morceau du plan a été arraché… Où peut-il bien se cacher ?'); return; }
  for(var i = 0; i < P.notes.length; i++){
    var n = P.notes[i];
    if(n.type === 'code'){
      var t = 12 * PS.K1, lw = Math.max.apply(null, n.lignes.map(function(m){ return PS.largeurCode(m, t); })) + 40, hh = (n.lignes.length - 1) * t * 1.45 + t + 40;
      if(dans(p, n.x, n.y, Math.max(lw, 110), Math.max(hh, 90))){ PG.son('page'); loupe(n); return; }
    } else if(n.type === 'encre' && S.encreFinie[n.id] && dans(p, n.x, n.y, 300, 80)){ conte('L’encre invisible dit : « ' + n.lignes.join(' ') + ' ».'); return; }
    else if(n.type === 'coin' && coinOk && dans(p, n.x, n.y, 300, 70)){ conte('Une note à l’encre rouge : « ' + n.lignes.join(' ') + ' »'); return; }
  }
  if(dans(p, P.titre.x, P.titre.y + 15, 380, 110)){ conte('« ' + P.titre.t + ' », ' + P.titre.sous + '.'); return; }
  for(var k = 0; k < P.signes.length; k++){
    var sg = P.signes[k];
    if(Math.hypot(p.x - sg.x, p.y - sg.y) < Math.max(26, sg.t * .9)){ conte(sg.porte ? 'Sur cette porte, un signe gravé : ' + NOMS_SIGNES[sg.s] + '.' : 'Pas de nom ici, juste un signe : ' + NOMS_SIGNES[sg.s] + '.'); return; }
  }
  var id = C.lieuEn(p.x, p.y);
  if(id === 'galerie' || (!id && U.dansPoly(U.contourTrait(U.lissePts(C.VIEUX), 50), p.x, p.y))){ conte('C’est écrit : « La grande galerie ». Sur ce vieux plan, elle va jusqu’à la grotte de givre.'); return; }
  if(id){
    var nom = P.noms.filter(function(m){ return m.lieu === id && (!m.coin || coinOk); })[0];
    if(nom){ conte('C’est écrit : « ' + nom.l.join(' ').replace(/\s+/g, ' ') + ' ».'); return; }
    var sg2 = P.signes.filter(function(m){ return m.lieu === id && !m.porte; })[0];
    if(sg2){ conte('Pas de nom ici, juste un signe : ' + NOMS_SIGNES[sg2.s] + '.'); return; }
    if(id === 'egouts'){ conte('Un couloir qui tourne, qui tourne… Les Fondateurs aimaient les détours.'); return; }
    if(id === 'dalles'){ conte('Un couloir pavé de dalles claires et sombres. Un petit crâne rouge… et une note codée, juste à côté.'); return; }
    if(id === 'porte4' && coinOk){ conte('Une grande porte ronde, avec quatre signes gravés.' + (S.codes['porte:odette'] ? ' Odette est juste derrière.' : '')); return; }
  }
}

/* ======================================================================
   Le conteur (la bulle en bas)
   ====================================================================== */
function conte(t){
  bulleEl.innerHTML = '<span>' + esc(t) + '</span>' + PG.lireBtn(t);
  bulleEl.classList.remove('pop'); void bulleEl.offsetWidth; bulleEl.classList.add('pop');
  bulleEl.hidden = false;
}

/* ======================================================================
   La rune : on la promène sur le plan, l'encre invisible apparaît
   ====================================================================== */
function rune(){
  var actif = null, dernier = null, rafR = 0, cible = null, lu = false;
  function placer(x, y){ curseur.style.transform = 'translate3d(' + x + 'px,' + y + 'px,0)'; }
  function pas(){
    rafR = 0; if(!actif || !cible) return;
    var r = table.getBoundingClientRect(), sx = cible.x, sy = cible.y - 54;
    placer(sx - r.left, sy - r.top);
    var p = versMonde(sx, sy), wr = 44 / Z.z, res = null;
    /* entre deux images, on comble le trajet (pas de trous si le doigt va vite) */
    if(dernier){ var d = Math.hypot(p.x - dernier.x, p.y - dernier.y), n = Math.ceil(d / (wr * .5)); for(var k = 1; k < n; k++){ var r2 = reveler(dernier.x + (p.x - dernier.x) * k / n, dernier.y + (p.y - dernier.y) * k / n, wr); res = res || r2; } }
    res = reveler(p.x, p.y, wr) || res;
    dernier = p;
    if(res){
      if(res.fini) conte('L’encre se réveille : « ' + res.n.lignes.join(' ') + ' » !' + (res.n.id === 'crane' ? ' Et un passage en pointillés part du crâne…' : res.n.id === 'roue' ? ' Et un passage en pointillés part des canaux… jusqu’à la salle de la lune !' : ''));
      else if(res.debut) conte('Oh ! De l’encre apparaît sous la rune… Continue, doucement.');
    }
  }
  runeEl.addEventListener('pointerdown', function(e){
    e.preventDefault(); e.stopPropagation();
    actif = e.pointerId; dernier = null; cible = {x:e.clientX, y:e.clientY};
    try{ runeEl.setPointerCapture(e.pointerId); }catch(er){}
    runeEl.classList.add('prise'); curseur.hidden = false; PG.guider(null);
    if(!lu){ lu = true; conte('La rune brille… Promène-la doucement sur le vieux papier.'); }
    if(S.debut){ S.debut = false; garder(); }
    PG.son('magie');
    pas();
  });
  runeEl.addEventListener('pointermove', function(e){ if(e.pointerId !== actif) return; cible = {x:e.clientX, y:e.clientY}; if(!rafR) rafR = requestAnimationFrame(pas); });
  function lacher(e){ if(e.pointerId !== actif) return; actif = null; dernier = null; runeEl.classList.remove('prise'); curseur.hidden = true; garder(); }
  runeEl.addEventListener('pointerup', lacher);
  runeEl.addEventListener('pointercancel', lacher);
  /* pour les tests (et un clavier) : promener la rune le long d'une ligne, en unités du plan */
  window.SAGE.promener = function(pts, wr){ var r = null; pts.forEach(function(p){ r = reveler(p[0], p[1], wr || 40) || r; }); garder(); return r; };
}

/* ======================================================================
   La loupe d'une note codée : les signes en grand, la grille, et des cases pour écrire les lettres
   ====================================================================== */
function loupe(n){
  var lettres = n.lignes.join(' ').split(''), nb = 0, sel = 0, ecrit = (S.lues[n.id] ? n.lignes.join(' ').split('') : []);
  var html = '<div class="titre"><h2>🔍 Une note codée</h2></div>' +
    (S.lues[n.id] ? PG.bulle('Tu l’as déjà déchiffrée : « ' + n.dit + ' ».') : dit('Les Fondateurs écrivaient avec leur alphabet secret. Chaque signe a la forme de sa case dans la grille.', 'sur-nuit')) +
    '<div class="loupe-corps"><div class="loupe-mots">';
  n.lignes.forEach(function(m){
    html += '<div class="loupe-ligne">';
    m.split('').forEach(function(ch){
      if(ch === ' '){ html += '<span class="loupe-esp"></span>'; return; }
      var i = nb++;
      html += '<button type="button" class="loupe-l" data-i="' + i + '">' + PS.glyphes([ch], 30, '#8e2e1c').replace('class="glyphes"', 'class="glyphes un"') + '<b data-case="' + i + '"></b></button>';
    });
    html += '</div>';
  });
  html += '</div><div class="loupe-cle">' + PS.cle() + '</div></div>' +
    '<div class="clavier">' + 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').map(function(l){ return '<button type="button" data-l="' + l + '">' + l + '</button>'; }).join('') + '<button type="button" class="eff" data-l="" aria-label="Effacer">⌫</button></div>' +
    '<div class="loupe-msg"></div>';
  var w = PG.fenetre(html, {classe:'loupe parch'}), f = w.el;
  var reponse = n.lignes.join('').replace(/ /g, '').split(''), saisie = [];
  if(S.lues[n.id]) saisie = reponse.slice();
  function maj(){
    qa('[data-case]', f).forEach(function(b){ var i = +b.getAttribute('data-case'); b.textContent = saisie[i] || ''; });
    qa('.loupe-l', f).forEach(function(b){ b.classList.toggle('choisi', +b.getAttribute('data-i') === sel && !S.lues[n.id]); });
  }
  function verifier(){
    var m = q('.loupe-msg', f);
    if(saisie.filter(Boolean).length < reponse.length){ m.innerHTML = ''; return; }
    if(saisie.join('') === reponse.join('')){
      S.lues[n.id] = true; garder(); majTraductions(); PG.son('ok');
      m.innerHTML = PG.bulle('Bravo ! Le message dit : « ' + n.dit + ' ».');
      conte('Déchiffré : « ' + n.dit + ' ». Le crayon l’a noté sur le plan.');
    } else { PG.son('ko'); m.innerHTML = PG.bulle('Hmm… ça ne veut rien dire. Regarde encore la grille.', 'ko'); }
  }
  f.addEventListener('click', function(e){
    var b = e.target.closest('button'); if(!b || S.lues[n.id]) return;
    if(b.classList.contains('loupe-l')){ sel = +b.getAttribute('data-i'); PG.son('tic'); maj(); return; }
    if(b.hasAttribute('data-l')){
      var l = b.getAttribute('data-l'); PG.son('tic');
      if(!l){ saisie[sel] = ''; maj(); q('.loupe-msg', f).innerHTML = ''; return; }
      saisie[sel] = l; if(sel < reponse.length - 1) sel++; maj(); verifier();
    }
  });
  maj();
}

/* ======================================================================
   Le Grand Livre et ses pages blanches
   ====================================================================== */
function nbPages(){ return 3 + (S.codes['page:blanche'] ? 1 : 0); }
function pagesLibres(){ var n = 0; for(var i = 1; i <= nbPages(); i++) if(!S.pages[i]) n++; return n; }
function majBadge(){ var b = q('#b-livre .badge'); if(b) b.textContent = pagesLibres(); }
function livre(guide){
  var html = '<div class="titre"><h2>📖 Le Grand Livre</h2></div>' +
    dit('Chaque page blanche peut garder un sort de sauvegarde. Le Pisteur le tape quand l’équipe est au calme, jamais pendant un combat.', 'livre-expl') +
    '<div class="pages">';
  for(var i = 1; i <= nbPages(); i++){
    var id = 'sauve:' + i, nom = i === 4 ? 'La page trouvée' : 'Page n° ' + i;
    if(S.pages[i]) html += '<button type="button" class="page ecrite" data-voir="' + i + '"><b>Sort de sauvegarde</b><small>' + nom + '</small>' + PG.codeGrand(id) + '</button>';
    else html += '<button type="button" class="page blanche" data-page="' + i + '"><b>Page blanche</b><small>' + nom + '</small><i aria-hidden="true">✦</i></button>';
  }
  html += '</div>';
  /* les monstres étudiés : une page chacun (le portrait et les énigmes) */
  var betes = monstresEtudies();
  html += '<div class="livre-betes"><h3>🔍 Les monstres étudiés</h3>' +
    (betes.length ? '<div class="betes">' + betes.map(function(m){ return '<button type="button" class="bete-vignette" data-bete="' + m + '"><img src="' + PORTRAITS + m + '.webp" alt="" loading="lazy"><b>' + esc(DD.MONSTRES[m].nom) + '</b></button>'; }).join('') + '</div>'
      : dit('Aucun pour l’instant. Pendant un combat, ton héros peut étudier un monstre : le Pisteur te montrera un code.')) + '</div>';
  if(S.codes['porte:odette']) html += '<div class="livre-note">' + dit('Noté de ta main : Odette est vivante, derrière la porte aux quatre signes.') + '</div>';
  var w = PG.fenetre(html, {classe:'livre parch'}), f = w.el;
  if(guide) PG.guider(f.querySelector('[data-page="' + guide + '"]'));
  f.addEventListener('click', function(e){
    var b = e.target.closest('button'); if(!b) return;
    if(b.hasAttribute('data-page')){ PG.son('page'); var n = +b.getAttribute('data-page'); w.fermer(); utiliser(n); }
    else if(b.hasAttribute('data-voir')){ PG.son('page'); var n2 = +b.getAttribute('data-voir'); w.fermer(); voirPage(n2, false); }
    else if(b.hasAttribute('data-bete')){ PG.son('page'); var m = b.getAttribute('data-bete'); w.fermer(); pageMonstre(m, false); }
  });
}

/* ======================================================================
   Les monstres étudiés (Romain, 10 novembre) : « le code, il le tape sur sa tablette, et là il voit apparaître l'image de
   l'ennemi. Ensuite, toutes les propositions pour le battre, mais sous la forme d'énigmes : qu'il faille un peu réfléchir. »
   Les énigmes sont dans moteur/src/donnees.js (D.LIVRE) ; les portraits viennent des fiches du bestiaire.
   ====================================================================== */
var PORTRAITS = /donjon-sage\.html/.test(location.pathname) ? 'pages/portraits/' : 'i/portrait-';
var ICONES_ENIGMES = ['🗝️', '⚠️', '🔀', '🎒'];
function monstresEtudies(){ return Object.keys(DD.LIVRE).filter(function(m){ return !!S.codes['etude:' + m]; }); }
function pageMonstre(m, nouveau){
  var M = DD.MONSTRES[m], L = DD.LIVRE[m] || [], T = (DD.LIVRE_TITRES_DE && DD.LIVRE_TITRES_DE[m]) || DD.LIVRE_TITRES;
  var rang = M.rang === 'boss' ? 'Le maître du donjon' : M.rang === 'elite' ? 'Un monstre d’élite' : 'Un monstre du donjon';
  var html = '<div class="titre"><h2>' + esc(M.nom) + '</h2>' + PG.lireBtn(M.nom) + '</div>' +
    '<div class="bete-page"><div class="bete-img"><img src="' + PORTRAITS + m + '.webp" alt="" width="560" height="502"><small>' + esc(rang) + '</small></div>' +
    '<div class="bete-enigmes">' +
      (nouveau ? dit('Ton Grand Livre s’ouvre tout seul à sa page. Les Fondateurs n’écrivaient jamais rien clairement : à toi de deviner, et de le dire aux autres.', 'bete-intro') : '') +
      L.map(function(t, i){ return '<div class="enigme"><h3>' + (ICONES_ENIGMES[i] || '•') + ' ' + esc(T[i] || '') + '</h3>' + dit(t) + '</div>'; }).join('') +
    '</div></div>' +
    '<div class="rangee"><button type="button" class="aller" data-fen-fermer>' + (nouveau ? 'C’est noté' : 'Refermer la page') + '</button></div>';
  var w = PG.fenetre(html, {classe:'bete-fen parch', surFermer:nouveau ? null : function(){ livre(); }});
  if(nouveau){ PG.son('magie'); var r = w.el.getBoundingClientRect(); PG.etincelles(w.el, r.width * .25, r.height * .4, 22, {dist:130, duree:1100}); PG.guider(w.el.querySelector('.aller')); }
  return w;
}
function utiliser(n){
  PG.confirmer({titre:'Utiliser cette page ?', texte:'Le sort ne s’écrit qu’une fois. Le Pisteur tapera son code quand l’équipe sera hors combat.', oui:'Oui, j’écris le sort', non:'Non'}).then(function(oui){
    if(!oui){ livre(); return; }
    S.pages[n] = true; garder(); majBadge();
    voirPage(n, true);
  });
}
function voirPage(n, ecrire){
  var id = 'sauve:' + n;
  var html = '<div class="grande-page' + (ecrire ? ' ecrit' : '') + '">' +
    '<div class="tache" aria-hidden="true"></div>' +
    '<div class="runes-vol" aria-hidden="true">' + ['ᚱ', 'ᛟ', 'ᚨ', 'ᛉ', 'ᚷ', 'ᛞ'].map(function(r, i){ return '<i style="--i:' + i + '">' + r + '</i>'; }).join('') + '</div>' +
    '<h2>Sort de sauvegarde</h2><p class="num">' + (n === 4 ? 'La page trouvée' : 'Page n° ' + n) + '</p>' + PG.codeGrand(id) +
    dit('Montre ce code au Pisteur. Il le tape quand l’équipe est hors combat, et le Grand Livre se souvient de tout.', 'page-expl') +
    '<div class="rangee"><button type="button" class="aller" data-fen-fermer>C’est noté</button></div></div>';
  var w = PG.fenetre(html, {classe:'page-fen parch', surFermer:function(){ livre(); }});
  if(ecrire){ PG.son('magie'); var r = w.el.getBoundingClientRect(); PG.etincelles(w.el, r.width / 2, r.height * .45, 26, {dist:150, duree:1200}); }
  PG.guider(w.el.querySelector('.aller'));
}

/* ======================================================================
   Les codes (pour le Sage) et leurs petites scènes
   ====================================================================== */
function unCode(){
  PG.pave({tablette:'sage', titre:'📥 Un code', texte:'Le Pisteur a trouvé quelque chose pour toi, ou ton héros a étudié un monstre ? Tape les trois symboles qu’il te montre.',
    deja:function(id){ return !!S.codes[id]; },
    recevoir:function(id){ S.codes[id] = true; garder(); scene(id); }});
}
function scene(id){
  if(id.indexOf('etude:') === 0){
    var m = id.slice(6);
    pageMonstre(m, true);
    conte('Une page de plus dans ton Grand Livre : ' + DD.MONSTRES[m].nom + '. Tu la retrouveras là-bas, avec ses énigmes.');
  } else if(id === 'rune:lumiere'){
    var wr = PG.fenetre('<div class="titre"><h2>✨ La rune de lumière</h2>' + PG.lireBtn('La rune de lumière') + '</div>' + '<div class="scene-img rune-img" aria-hidden="true"><i>ᛉ</i></div>' +
      dit('Le Pisteur l’a trouvée au fond du puits : une pierre gravée, tiède comme un petit soleil. Promène-la sur ton plan : elle réveille l’encre que les Fondateurs ont cachée.', 'scene-txt') +
      '<div class="rangee"><button type="button" class="aller" data-fen-fermer>Prendre la rune</button></div>', {classe:'scene parch', surFermer:function(){
        majRune(true); mesurerBords(); PG.guider(runeEl);
        conte('Ta rune de lumière est là, en bas. Promène-la doucement sur le vieux papier…');
      }});
    PG.guider(wr.el.querySelector('.aller'));
  } else if(id === 'page:dechiree'){
    var w = PG.fenetre('<div class="titre"><h2>📜 La page déchirée</h2></div>' + '<div class="scene-img dechiree" aria-hidden="true"><i></i></div>' +
      dit('Le Pisteur a trouvé le morceau perdu de ton plan, dans la bibliothèque engloutie. Les bords se recollent tout seuls…', 'scene-txt') +
      '<div class="rangee"><button type="button" class="aller" data-fen-fermer>Recoller le morceau</button></div>', {classe:'scene parch', surFermer:function(){
        majCoin(true); majOdette(); majBadge();
        setTimeout(function(){ centrerSur(2200, 1220, Math.max(zoomFit() * 1.6, .7)); }, 200);
        conte('Le grand bassin… et une note à l’encre rouge, sur Bourbe !');
      }});
    PG.guider(w.el.querySelector('.aller'));
  } else if(id === 'page:blanche'){
    majBadge();
    var w2 = PG.fenetre('<div class="titre"><h2>✨ Une page blanche</h2></div>' + '<div class="scene-img blanche" aria-hidden="true"><i></i></div>' +
      dit('Le Pisteur l’a trouvée en fouillant. Elle se glisse dans ton Grand Livre : une sauvegarde de plus !', 'scene-txt') +
      '<div class="rangee"><button type="button" class="aller" data-ouvrir>Ouvrir le Grand Livre</button></div>', {classe:'scene parch'});
    w2.el.querySelector('[data-ouvrir]').addEventListener('click', function(){ PG.son('page'); w2.fermer(); livre(4); });
    PG.guider(w2.el.querySelector('.aller'));
  } else if(id === 'porte:odette'){
    majOdette();
    var w3 = PG.fenetre('<div class="titre"><h2>🗝️ La porte aux quatre signes</h2>' + PG.lireBtn('La porte aux quatre signes', 'clair') + '</div>' +
      '<div class="odette"><div class="porte" aria-hidden="true">' + portePierre() + '<div class="moustache">' + chat() + '</div></div>' +
      '<div class="odette-txt">' +
        dit('Moustache gratte le bas de la grande porte, et il miaule.', 'l1 sur-nuit') +
        '<div class="voix l2">' + dit('« Moustache ? Mon gros gris, c’est toi ? »', 'sur-nuit') + '</div>' +
        '<div class="voix l3">' + dit('« Oh, mon tout doux… Je suis là. Je suis là. »', 'sur-nuit') + '</div>' +
        dit('C’est la voix d’Odette ! Elle est vivante, juste derrière la porte. Mais la porte ne s’ouvre pas.', 'l4 sur-nuit') +
      '</div></div>' +
      '<div class="rangee"><button type="button" class="aller" data-fen-fermer>Le noter dans le Grand Livre</button></div>', {classe:'scene sombre-fen'});
    PG.guider(w3.el.querySelector('.aller'));
    conte('Odette est vivante, derrière la porte aux quatre signes. Ton Grand Livre l’a noté.');
  }
}
function portePierre(){
  var s = '<svg viewBox="0 0 200 200" width="200" height="200"><defs><radialGradient id="pp" cx=".5" cy=".4" r=".6"><stop offset="0" stop-color="#7a7090"/><stop offset="1" stop-color="#3a3250"/></radialGradient>' +
    '<radialGradient id="pl" cx=".5" cy="1" r=".6"><stop offset="0" stop-color="#ffd27a" stop-opacity=".9"/><stop offset="1" stop-color="#ffd27a" stop-opacity="0"/></radialGradient></defs>' +
    '<rect x="0" y="0" width="200" height="200" fill="#1a1426"/>';
  for(var i = 0; i < 6; i++) for(var j = 0; j < 6; j++) s += '<rect x="' + (j * 34 - (i % 2) * 17) + '" y="' + (i * 34) + '" width="32" height="32" rx="3" fill="#2a2238" stroke="#120c1a" stroke-width="2"/>';
  s += '<circle cx="100" cy="104" r="80" fill="#000" opacity=".4"/><circle cx="100" cy="100" r="80" fill="url(#pp)" stroke="#24182e" stroke-width="5"/><circle cx="100" cy="100" r="64" fill="none" stroke="#3a3250" stroke-width="3"/>' +
    '<path d="M36 100 H164 M100 36 V164" stroke="#3a3250" stroke-width="3"/>';
  var c = '#bff9ff';
  s += '<g transform="translate(70 70) scale(1.6)"><path d="' + C.SIGNES.oeil + '" fill="none" stroke="' + c + '" stroke-width="2"/></g>' +
    '<g transform="translate(130 70)"><path d="M-12 -4 H12 Q 12 12 0 12 Q -12 12 -12 -4 Z M-5 -9 q2 -4 0 -8 M4 -9 q2 -4 0 -8" fill="none" stroke="' + c + '" stroke-width="3" stroke-linecap="round"/></g>' +
    '<g transform="translate(70 130)"><path d="M-10 -12 Q -13 9 0 12 Q 13 9 10 -12 M-4 -6 V9 M4 -6 V9" fill="none" stroke="' + c + '" stroke-width="3" stroke-linecap="round"/></g>' +
    '<g transform="translate(130 130) scale(1.6)"><path d="' + C.SIGNES.etoile + '" fill="none" stroke="' + c + '" stroke-width="2"/></g>';
  s += '<rect x="40" y="186" width="120" height="14" fill="url(#pl)"/></svg>';
  return s;
}
function chat(){
  return '<svg viewBox="0 0 120 100" width="120" height="100"><g stroke="#24182e" stroke-width="3" stroke-linejoin="round" stroke-linecap="round">' +
    '<path d="M14 88 C 6 70 18 44 44 42 C 66 40 82 52 84 72 L 86 88 Z" fill="#8a8a96"/>' +
    '<path d="M24 60 q8 -6 14 0 M28 72 q8 -6 14 0" fill="none" stroke="#5a5a66" stroke-width="2.5"/>' +
    '<path d="M14 84 C 0 80 -2 60 8 56" fill="none" stroke="#8a8a96" stroke-width="7"/>' +
    '<circle cx="80" cy="44" r="18" fill="#9a9aa6"/><path d="M66 34 L 64 18 L 76 28 Z M88 28 L 98 18 L 96 34 Z" fill="#9a9aa6"/>' +
    '<g class="patte"><path d="M84 62 C 96 56 106 52 110 40" fill="none" stroke="#8a8a96" stroke-width="9"/><circle cx="110" cy="38" r="6" fill="#9a9aa6"/></g>' +
    '</g><circle cx="74" cy="44" r="2.4" fill="#24182e"/><circle cx="86" cy="44" r="2.4" fill="#24182e"/><path d="M78 50 l2 2 l2 -2" fill="none" stroke="#24182e" stroke-width="1.6"/></svg>';
}

/* ======================================================================
   La grille de l'alphabet secret (la carte posée sur la table)
   ====================================================================== */
function majGrille(){
  var g = q('#grille'), b = q('#b-grille');
  g.hidden = !S.grille; b.classList.toggle('on', !!S.grille);
}

/* ======================================================================
   Le départ
   ====================================================================== */
function recommencer(){
  PG.confirmer({titre:'Recommencer une partie ?', texte:'Tout ce qui est sur cette tablette sera effacé : les pages écrites, l’encre révélée et les codes reçus.', oui:'Oui, on recommence', non:'Non'}).then(function(oui){
    if(!oui) return;
    mem.effacer(); S = neuf(); location.reload();
  });
}
function demarrer(){
  S = mem.lire(null); if(!S || S.v !== 1) S = neuf();
  if(S.grille === null) S.grille = window.innerWidth >= 900;
  PG.orientation();
  table = q('#table'); couche = q('#couche'); runeEl = q('#rune'); curseur = q('#curseur'); bulleEl = q('#bulle');
  q('#grille .cle').innerHTML = PS.cle();
  window.SAGE = {monstre:pageMonstre, etat:function(){ return S; }, zoom:function(){ return {z:Z.z, tx:Z.tx, ty:Z.ty, fit:zoomFit(), pv:PV}; }, reveler:reveler, notes:NOTES_ENCRE, versMonde:versMonde, zoomer:zoomer, centrerSur:centrerSur};
  construirePlan();
  majGrille();
  mesurerBords();
  Z.z = zoomFit(); borner(); poser();
  gestes(); rune(); majRune(false);
  majBadge(); majGrille();
  q('#b-livre').addEventListener('click', function(){ PG.son('page'); livre(); });
  q('#b-code').addEventListener('click', function(){ PG.son('tic'); unCode(); });
  q('#b-grille').addEventListener('click', function(){ PG.son('tic'); S.grille = !S.grille; garder(); majGrille(); mesurerBords(); borner(); poser(); });
  q('#b-plus').addEventListener('click', function(){ var d = dims(); zoomer(Z.z * 1.45, (d.w - BARRE) / 2, (d.h - BAS) / 2, true); });
  q('#b-moins').addEventListener('click', function(){ var d = dims(); zoomer(Z.z / 1.45, (d.w - BARRE) / 2, (d.h - BAS) / 2, true); });
  q('#b-nouveau').addEventListener('click', recommencer);
  window.addEventListener('resize', function(){ mesurerBords(); var f0 = zoomFit(); if(Z.z < f0) Z.z = f0; Z.zMin = Math.min(.3, f0); borner(); poser(); });
  Z.zMin = Math.min(.3, zoomFit());
  if(S.debut && !S.codes['rune:lumiere']){ conte('Le vieux plan des Fondateurs ! Il glisse sous ton doigt, et il s’approche à deux doigts. Ils y ont laissé des notes, dans leur drôle d’alphabet…'); S.debut = false; garder(); }
  else conte('Le plan des Fondateurs t’attend. Le Grand Livre aussi.');
}
if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', demarrer); else demarrer();
})();
