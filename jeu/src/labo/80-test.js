
/* ============ Le test des couleurs : la bandelette de papier buvard (une vraie chromatographie) ============
   Une goutte du liquide sur la bandelette, le pied dans l'alcool : les couleurs montent et se séparent en bandes.
   On compare avec les bandelettes témoins du carnet de teintures : celle qui a les mêmes bandes donne l'ingrédient.
   Une teinture est souvent un mélange : chaque bande porte un « ? » tant qu'aucun ingrédient ne l'explique. Tant qu'il reste un « ? »,
   il reste un ingrédient à trouver. */
function svgIngr(k){
  var s = '<svg viewBox="0 0 60 60" aria-hidden="true">';
  if(k === 'garance'){ var r = 'M30,20 C25,32 19,40 12,53 M30,20 C30,34 28,44 29,57 M30,20 C36,32 42,40 49,51 M22,36 l-7,1 M37,34 l8,2 M29,44 l6,3';
    s += T(r, K, 8) + T(r, '#c8503c', 4.6) + T('M24,30 l2,2 M34,29 l-2,2 M28,50 l2,1', '#8a2a1c', 1.5) + T('M22,21 Q30,16 38,21', K, 6) + T('M22,21 Q30,16 38,21', '#e8d8a8', 2.8) +
      P('M30,20 C22,15 18,8 22,2 C28,6 30,12 30,20 Z', '#6fae5a', ' stroke-width="2.5"') + P('M30,20 C38,15 42,8 38,2 C32,6 30,12 30,20 Z', '#5e9a4a', ' stroke-width="2.5"'); }
  else if(k === 'coquelicot') s += T('M30,34 C30,44 27,50 30,58', K, 6) + T('M30,34 C30,44 27,50 30,58', '#4b7a34', 3) + [0,90,180,270].map(function(a){ return '<ellipse cx="30" cy="15" rx="12" ry="10" fill="#e8343c" stroke="' + K + '" stroke-width="2.5" transform="rotate(' + a + ' 30 26)"/>'; }).join('') +
      T('M30,8 v6 M12,26 h6 M48,26 h-6', '#b0101a', 1.4) + Cir(30, 26, 6.5, '#1a1010', ' stroke-width="2"') + [[-3,-2],[3,-1],[0,3]].map(function(q){ return '<circle cx="' + (30+q[0]) + '" cy="' + (26+q[1]) + '" r="1.1" fill="#e8d860"/>'; }).join('');
  else if(k === 'betterave') s += P('M30,22 C13,22 11,45 30,51 C49,45 47,22 30,22 Z', '#9c2257', ' stroke-width="3"') + T('M30,51 C30,55 32,57 35,59', '#9c2257', 3) + T('M21,32 C26,37 34,37 39,32', '#c8447a', 2) + reflet('M19,30 q1,-4 5,-5', 2.5, .5) +
      P('M30,22 C24,14 20,6 24,2 C30,6 31,14 30,22 Z', '#5e9a4a', ' stroke-width="2.5"') + P('M30,22 C36,12 42,6 45,10 C41,16 36,20 30,22 Z', '#6fae5a', ' stroke-width="2.5"') + T('M30,22 L25,6 M30,22 L41,11', '#9c2257', 1.5);
  else if(k === 'cochenille') s += Ell(30, 46, 24, 9, '#e9dcc0', ' stroke-width="2.5"') + [[18,40,-.3],[31,36,.2],[42,41,.5],[24,46,.1],[37,47,-.4]].map(function(q){ return '<g transform="translate(' + q[0] + ',' + q[1] + ') rotate(' + (q[2]*57) + ')"><ellipse cx="0" cy="0" rx="7" ry="5" fill="#c9306a" stroke="' + K + '" stroke-width="2"/><path d="M-3,-4.5 v9 M0,-5 v10 M3,-4.5 v9" stroke="#7a1238" stroke-width="1.1"/><circle cx="-2" cy="-2" r="1.1" fill="#fff" opacity=".7"/></g>'; }).join('') +
      T('M10,22 l4,4 M50,20 l-4,5 M30,16 v6', '#c9306a', 2, ' opacity=".5"');
  /* le bois de Brésil (enquête 2) : une bûche coupée, le cœur du bois tout rouge, et des copeaux */
  else if(k === 'bresil') s += P('M8,24 L40,14 C48,12 52,30 44,34 L12,44 Z', '#8a5a30', ' stroke-width="2.5"') + Ell(10, 34, 7, 10, '#c2305a', ' stroke-width="2.5"') +
      '<ellipse cx="10" cy="34" rx="3.4" ry="5" fill="#8a1a3a"/>' + T('M18,24 L42,17 M20,38 L44,30', '#6a4220', 1.6) +
      P('M36,46 q6,-6 12,0 q-6,4 -12,0 Z', '#d8406a', ' stroke-width="2"') + P('M44,52 q5,-5 10,0 q-5,3 -10,0 Z', '#c2305a', ' stroke-width="2"');
  else if(k === 'mure') s += P('M34,12 C40,4 50,6 52,14 C46,18 40,18 34,12 Z', '#5e9a4a', ' stroke-width="2.5"') + T('M30,14 C30,8 32,5 35,3', K, 5) + T('M30,14 C30,8 32,5 35,3', '#4b7a34', 2.4) +
      [[30,20],[22,24],[38,24],[18,32],[30,30],[42,32],[22,40],[34,40],[28,48]].map(function(q){ return '<circle cx="' + q[0] + '" cy="' + q[1] + '" r="6.4" fill="#4a2a5c" stroke="' + K + '" stroke-width="2.2"/><circle cx="' + (q[0]-2) + '" cy="' + (q[1]-2) + '" r="1.5" fill="#b9a0d0"/>'; }).join('');
  else if(k === 'oignon') s += P('M30,16 C12,20 10,46 30,52 C50,46 48,20 30,16 Z', '#d98a2c', ' stroke-width="3"') + T('M30,16 C22,26 21,40 30,52 M30,16 C38,26 39,40 30,52', '#a86414', 1.8) + T('M30,16 C30,10 28,6 26,3 M30,16 C31,10 34,7 36,5', K, 4.5) + T('M30,16 C30,10 28,6 26,3 M30,16 C31,10 34,7 36,5', '#c9a877', 2) +
      P('M44,34 C54,32 58,40 54,48 C50,44 46,42 44,34 Z', '#e8a850', ' stroke-width="2.5"') + reflet('M18,30 q1,-6 6,-9', 2.5, .5) + T('M26,52 l-3,5 M30,52 v6 M34,52 l3,5', '#c9a877', 1.5);
  else if(k === 'safran') s += T('M30,40 C30,48 29,53 30,58', K, 6) + T('M30,40 C30,48 29,53 30,58', '#4b7a34', 3) + P('M30,42 C16,36 14,18 22,8 C26,18 28,30 30,42 Z', '#8a5ad0', ' stroke-width="2.5"') + P('M30,42 C44,36 46,18 38,8 C34,18 32,30 30,42 Z', '#7a4ac0', ' stroke-width="2.5"') + P('M30,42 C22,30 24,14 30,4 C36,14 38,30 30,42 Z', '#9a6ae0', ' stroke-width="2.5"') +
      T('M30,36 C27,28 24,24 20,22 M30,36 C30,28 30,22 30,18 M30,36 C33,28 36,24 40,22', K, 4.2) + T('M30,36 C27,28 24,24 20,22 M30,36 C30,28 30,22 30,18 M30,36 C33,28 36,24 40,22', '#e8500e', 2.2);
  else s += P('M14,30 C14,14 46,14 46,30 C46,48 14,48 14,30 Z', '#6a9a3a', ' stroke-width="3"') + P('M20,30 C20,20 40,20 40,30 C40,42 20,42 20,30 Z', '#b98a52', ' stroke-width="2.5"') + T('M30,21 V40 M24,26 C27,29 27,33 24,36 M36,26 C33,29 33,33 36,36', '#6a4a2c', 1.8) +
      '<ellipse cx="22" cy="50" rx="12" ry="4" fill="#3a2414" opacity=".8"/><circle cx="40" cy="52" r="2.4" fill="#3a2414"/><circle cx="46" cy="48" r="1.6" fill="#3a2414"/>' + reflet('M17,26 q1,-6 6,-8', 2.5, .4);
  return s + '</svg>';
}
function ouvrirTest(){
  if(S.occupe) return;
  if(D().bande){ montrerTest(); return; }
  /* la pipette prend une goutte dans la coupelle et la dépose sur la bandelette */
  var de = posCible(), pip = $('#pipette'), x1 = TESTP.x, y1 = TESTP.y - 84; S.occupe = true; son('pipette'); pip.style.display = ''; $('#pipLiq').setAttribute('fill', couleurLiq(S.sel));
  tween(700, function(p){ pip.setAttribute('transform', 'translate(' + f1(de.x + (x1 - de.x)*p) + ',' + f1(de.y - 20 + (y1 - de.y + 20)*p - Math.sin(p*Math.PI)*70) + ')'); }, function(){
    son('goutte'); attendre(260, function(){ pip.style.display = 'none'; S.occupe = false; D().bande = .001; montrerTest(); });
  });
}
function montrerTest(){
  ouvrirMode('test', '<div class="bande-hud pose" id="bandeHud" style="' + pos(34, 26, 340, 590) + '"><canvas id="cvBande" aria-label="La bandelette"></canvas><div class="tampon" id="tampon" aria-hidden="true"></div></div>' +
    '<div class="ruban" id="ruban" style="left:calc(785*var(--u));top:calc(34*var(--u))" hidden></div><div class="temoins pose" id="temoins" role="group" aria-label="Le carnet de teintures" style="' + pos(392, 96, 786, 520) + '"></div>');
  camera(270, 340, 2); majTemoins();
  if(D().bande < 1){ S.occupe = true; son('monte'); tweenLin(reduit ? 1 : 2800, function(p){ D().bande = Math.max(.001, p); rendBande(); }, function(){ D().bande = 1; S.occupe = false; majBandeScene(); majTemoins(); rendBande(); }); }
  requestAnimationFrame(rendBande);
}
/* La bandelette vue de près (à gauche), avec une pastille par bande : « ? » tant qu'on ne sait pas d'où elle vient, « ✓ » ensuite.
   Le témoin qu'on essaie vient se poser juste à côté. */
function rendBande(){
  var cv = $('#cvBande'); if(!cv) return; var r = prep(cv), c = r.ctx, w = r.w, h = r.h, e = S.essai, lw = w*.23, xb = w*.36, u = w/340;
  c.clearRect(0, 0, w, h);
  c.lineCap = 'round'; c.strokeStyle = '#24182e'; c.lineWidth = h*.03; c.beginPath(); c.moveTo(w*.28, h*.045); c.lineTo(w*.97, h*.045); c.stroke(); c.strokeStyle = '#c98450'; c.lineWidth = h*.017; c.stroke();
  dessinerBandelette(c, xb, h*.05, lw, h*.9, ciblesLiq(), D().bande, {seed:3});
  if(e) dessinerBandelette(c, w*.69, h*.05, lw, h*.9, [e], 1, {seed:9});
  if(D().bande >= 1){
    var y0 = h*.86, course = h*.72, cx = w*.15, rr = Math.min(w*.085, h*.036);
    bandesMelange().forEach(function(b){
      var yb = y0 - course*b.y, ok = D().mix.indexOf(b.k) >= 0;
      c.strokeStyle = 'rgba(36,24,46,.75)'; c.lineWidth = Math.max(1.5, 2.4*u); c.beginPath(); c.moveTo(xb - 3*u, yb); c.lineTo(cx + rr, yb); c.stroke();
      c.fillStyle = ok ? '#7fe08a' : '#fff6d8'; c.strokeStyle = '#24182e'; c.lineWidth = Math.max(2, 3.2*u); c.beginPath(); c.arc(cx, yb, rr, 0, 6.283); c.fill(); c.stroke();
      c.fillStyle = '#24182e'; c.font = '700 ' + f1(rr*1.4) + 'px Andika, "Trebuchet MS", sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(ok ? '✓' : '?', cx, yb + rr*.08);
    });
  }
  if(S.balaie != null){ var by = h*(.95 - .9*S.balaie), g = c.createLinearGradient(0, by - 26, 0, by + 26); g.addColorStop(0, 'rgba(255,255,255,0)'); g.addColorStop(.5, 'rgba(255,255,255,.7)'); g.addColorStop(1, 'rgba(255,255,255,0)'); c.fillStyle = g; c.fillRect(w*.3, by - 26, w*.7, 52); }
}
function majTemoins(){
  var m = $('#temoins'); if(!m) return; var fait = !!S.trouves[liqDe(S.dc)], faux = S.barres[liqDe(S.dc)] || {}, pret = D().bande >= 1;
  $('#bandeHud').classList.toggle('bon', fait); m.classList.toggle('fini', fait); var rb = $('#ruban'); rb.hidden = !fait; if(fait) rb.textContent = '✅ ' + nomTrouve(liqDe(S.dc));
  m.innerHTML = TEINTES.map(function(i){ var ok = D().mix.indexOf(i.k) >= 0;
    return '<button type="button" class="temoin' + (ok ? ' ok' : '') + (faux[i.k] ? ' barre' : '') + '" data-temoin="' + i.k + '"' + (!pret || fait || ok || faux[i.k] ? ' disabled' : '') + '><canvas></canvas><span class="dessin">' + svgIngr(i.k) + '</span><span class="nm">' + i.nom + '</span>' +
      (ok ? '<span class="marque">✅</span>' : (faux[i.k] ? '<span class="marque">❌</span>' : '')) + '</button>'; }).join('');
  requestAnimationFrame(function(){ $$('.temoin canvas').forEach(function(cv){ var rr = prep(cv); rr.ctx.clearRect(0, 0, rr.w, rr.h); dessinerBandelette(rr.ctx, rr.w*.12, rr.h*.02, rr.w*.76, rr.h*.96, [cv.parentNode.dataset.temoin], 1, {seed:9}); }); });
}
/* On touche un témoin : il vient à côté de la bandelette, l'ordinateur compare les bandes et le dit clairement */
function essayerTemoin(k, bouton){
  if(S.occupe || S.trouves[liqDe(S.dc)] || S.mode !== 'test' || D().bande < 1) return; S.occupe = true; son('papier');
  volVers(bouton.querySelector('canvas'), $('#cvBande'), function(){
    S.essai = k; rendBande(); son('compare');
    tweenLin(reduit ? 1 : 800, function(p){ S.balaie = p; rendBande(); }, function(){
      S.balaie = null; var bon = ciblesLiq().indexOf(k) >= 0, v = $('#bandeHud');
      if(bon){ D().mix.push(k); if(D().mix.length === ciblesLiq().length){ S.trouves[liqDe(S.dc)] = true; S.vientDeTrouver = liqDe(S.dc); apresTrouve(liqDe(S.dc)); } else garder(); son('bon'); tampon('✅'); attendre(900, function(){ S.essai = null; S.occupe = false; rendBande(); majTemoins(); }); return; }
      v.classList.add('faux'); son('faux'); tampon('❌');
      attendre(950, function(){ v.classList.remove('faux'); S.barres[liqDe(S.dc)] = S.barres[liqDe(S.dc)] || {}; S.barres[liqDe(S.dc)][k] = true; garder(); S.essai = null; S.occupe = false; rendBande(); majTemoins(); });
    });
  }, .5);
}
