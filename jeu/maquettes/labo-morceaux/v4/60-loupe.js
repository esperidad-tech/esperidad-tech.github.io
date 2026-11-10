
/* ============ Les vues en gros plan (loupe, microscope, chaudron) : chacune est une vraie image, en plein écran ============ */
var boucle = 0;
function pos(x, y, w, h){ return 'left:calc(' + x + '*var(--u));top:calc(' + y + '*var(--u));width:calc(' + w + '*var(--u));height:calc(' + h + '*var(--u))'; }
function ouvrirMode(nom, html, origine){
  S.mode = nom; var m = $('#mode'); m.className = 'mode m-' + nom; m.innerHTML = html; m.hidden = false; $('#cadre').classList.add('ouvert'); document.body.classList.add('ouvert');
  var v = $('#vue'); if(v && origine) v.style.transformOrigin = (origine.x/10) + '% ' + (origine.y/6.4) + '%';
}
function fermerMode(){
  S.mode = null; S.essai = null; S.balaie = null; var m = $('#mode'); m.hidden = true; m.innerHTML = ''; $('#cadre').classList.remove('ouvert'); document.body.classList.remove('ouvert'); cancelAnimationFrame(boucle);
  var lm = $('#loupeMobile'); if(lm) lm.removeAttribute('transform');
  dessinerLame(); dessinerCoupes(); majArdoise(); majChaudron(); majOutils();
  if(S.vientDeTrouver){ var t = S.vientDeTrouver; S.vientDeTrouver = null; mimiDit('Mrrraou !', true); if(S.sel === t){ var p = posCible(); bulle(p.x, p.y - 18, '✅ ' + nomTrouve(t), 3200); } }
}
function modeHaut(avecCoeurs, label){ return '<div class="mode-haut">' + (avecCoeurs ? '<span class="coeurs" id="coeurs"></span><span class="alerte" id="alerte"></span>' : '<span></span>') + '<button type="button" class="fermer" id="bFermer" aria-label="' + label + '">✕</button></div>'; }
function nomTrouve(t){ var o = OBJETS[t]; return o.liquide ? CIBLES[S.niveau].map(function(k){ return INGR.filter(function(i){ return i.k === k; })[0].nom; }).join(' + ') : ECH[o.tiroir][o.bon].nom; }
function majCoeurs(perdu){
  var el = $('#coeurs'); if(!el) return; var co = coeursDe(S.sel), c = ''; for(var i=0;i<3;i++) c += i < co ? '❤️' : '🖤';
  el.textContent = c; el.setAttribute('aria-label', co + ' cœurs'); $('#alerte').textContent = perdu ? TXT.perdu : (co === 0 && !S.trouves[S.sel] ? TXT.plusCoeur : '');
}
/* Un petit dessin qui vole d'un endroit à un autre (la carte vers la loupe, l'ingrédient vers le chaudron) */
function volVers(de, vers, fin, hauteur){
  if(reduit){ fin(); return; }
  var a = de.getBoundingClientRect(), b = vers.getBoundingClientRect(), v = de.cloneNode(true), c0 = de.querySelector('canvas'), c1 = v.querySelector('canvas');
  if(c0 && c1){ c1.width = c0.width; c1.height = c0.height; c1.getContext('2d').drawImage(c0, 0, 0); }
  v.classList.add('vol'); v.removeAttribute('data-ech'); v.removeAttribute('data-ingr'); v.style.cssText = 'left:' + a.left + 'px;top:' + a.top + 'px;width:' + a.width + 'px;height:' + a.height + 'px';
  document.body.appendChild(v); void v.offsetWidth;
  v.style.left = (b.left + b.width/2 - a.width/2) + 'px'; v.style.top = (b.top + b.height*(hauteur == null ? .62 : hauteur) - a.height/2) + 'px'; v.style.transform = 'scale(.45) rotate(8deg)'; v.style.opacity = '.25';
  setTimeout(function(){ v.remove(); fin(); }, 400);
}
function tampon(sym){ var t = $('#tampon'); if(!t) return; t.textContent = sym; t.classList.remove('pop'); void t.offsetWidth; t.classList.add('pop'); }

/* ============ La loupe : un gros plan sur la paillasse, avec ses deux vrais tiroirs ============ */
function artBougie(){
  return T('M19,-1 c14,-2 14,-15 1,-12', K, 6.5) + T('M19,-1 c14,-2 14,-15 1,-12', '#f5b945', 2.8) + Ell(0, 0, 23, 10, G('laiton')) + '<ellipse cx="0" cy="-2" rx="17" ry="6.5" fill="#c98a1c" stroke="' + K + '" stroke-width="2"/>' + R(-8.5, -11, 17, 10, 3, G('laiton'), ' stroke-width="3"') +
    R(-7, -52, 14, 43, 3, G('cire'), ' stroke-width="3"') + F('M-6,-51 c1,12 3,12 4,3 c1,9 3,15 4.5,5 c1,6 2.5,6 3.5,-3 l0,-5 Z', '#fffdf4') + T('M0,-52 v-5', K, 2) +
    '<g class="flamme"><path d="M0,-55 C-9,-65 -5,-77 0,-89 C5,-77 9,-65 0,-55 Z" fill="' + G('flamme') + '" stroke="#e8693c" stroke-width="2"/><path d="M0,-57 C-4,-63 -2,-69 0,-75 C2,-69 4,-63 0,-57 Z" fill="#fff7c2"/></g>';
}
function sceneLoupe(){
  var s = '<rect x="-1700" y="-1500" width="4400" height="1566" fill="#2a2140"/><rect x="-1700" y="-82" width="4400" height="148" fill="' + G('briques') + '" opacity=".6"/><rect x="-1700" y="-1500" width="4400" height="1566" fill="rgba(10,6,20,.5)"/>';
  /* le plateau de la paillasse, vu de près */
  s += '<rect x="-1700" y="64" width="4400" height="312" fill="' + G('boisH') + '"/>';
  [108, 164, 244].forEach(function(y){ s += T('M-1700,' + y + ' H2700', '#a5653a', 3, ' opacity=".7"'); });
  s += grainBois(-1700, 66, 4400, 40, 3, 81, '#8a5530', .35) + grainBois(-1700, 110, 4400, 52, 4, 82, '#8a5530', .35) + grainBois(-1700, 166, 4400, 76, 5, 83, '#8a5530', .35) + grainBois(-1700, 246, 4400, 126, 7, 84, '#8a5530', .35);
  s += noeud(150, 318, 17, .5) + noeud(868, 136, 11, .45) + noeud(764, 338, 13, .5) + '<ellipse cx="236" cy="134" rx="30" ry="12" fill="rgba(70,40,110,.25)"/><ellipse cx="820" cy="268" rx="34" ry="14" fill="none" stroke="rgba(120,60,30,.3)" stroke-width="3"/>' +
    T('M60,216 l46,6 M880,326 l40,-5 M700,88 l30,4', 'rgba(90,50,20,.45)', 2) + '<rect x="-1700" y="64" width="4400" height="46" fill="' + G('piedMur') + '"/>';
  /* le drap d'examen, là où l'on pose ce qu'on regarde */
  s += '<ellipse cx="506" cy="226" rx="226" ry="104" fill="rgba(8,4,16,.3)" filter="url(#flou9)"/>' + P('M318,112 L682,112 L712,318 L288,318 Z', G('tapis')) + '<path d="M329,123 L671,123 L698,307 L302,307 Z" fill="none" stroke="#eef2fc" stroke-width="2" stroke-dasharray="7 6" opacity=".7"/>';
  /* à gauche : la bougie, l'encrier et sa plume ; à droite : un parchemin, la pince */
  s += '<circle cx="118" cy="150" r="150" fill="' + G('lueur') + '"/>' + ombre(126, 282, 62, 16, .45) + '<g transform="translate(118,270) scale(2.2)">' + artBougie() + '</g>';
  s += ombre(232, 200, 34, 9, .4) + P('M208,196 C204,176 214,166 220,164 L220,154 L240,154 L240,164 C246,166 256,176 252,196 Z', '#2c2440', ' stroke-width="3.5"') + R(216, 148, 28, 9, 3, G('laitonV'), ' stroke-width="3"') + reflet('M213,190 C211,180 215,172 220,169', 3, .4) +
    T('M232,150 C246,110 262,84 286,70', K, 5) + T('M232,150 C246,110 262,84 286,70', '#f4f1ea', 2) + P('M244,122 C250,98 266,78 290,66 C286,86 272,106 252,124 Z', '#f4f1ea', ' stroke-width="3"') + T('M252,118 l16,-22 M258,108 l-7,-4 M266,98 l-8,-5 M260,112 l8,3', '#b9b3a6', 1.5);
  s += ombre(858, 180, 78, 14, .4) + '<g transform="rotate(-8 850 164)">' + R(774, 148, 150, 32, 16, G('parchemin')) + Ell(924, 164, 9, 16, '#d9c89c', ' stroke-width="3"') + T('M790,158 h100 M790,168 h76', '#b9a67c', 2) + R(838, 144, 12, 40, 3, '#8a3a4a', ' stroke-width="3"') + '</g>';
  s += '<g transform="rotate(24 860 290)">' + T('M800,282 L924,290 M800,298 L924,290', K, 8) + T('M800,282 L924,290 M800,298 L924,290', '#c9c4de', 3.5) + R(916, 284, 16, 12, 3, G('fer'), ' stroke-width="2.5"') + '</g>';
  /* l'ombre de la loupe sur le drap */
  s += '<ellipse cx="526" cy="230" rx="130" ry="124" fill="rgba(8,4,16,.34)" filter="url(#flou9)"/>';
  /* le chant du plateau, puis le tablier où sont les tiroirs */
  s += R(-1700, 372, 4400, 22, 0, G('boisS')) + reflet('M-1700,376 H2700', 2.5, .3) + '<rect x="-1700" y="394" width="4400" height="1900" fill="' + G('boisF') + '"/>' + grainBois(-1700, 400, 4400, 250, 9, 85, '#2e1608', .45) + '<rect x="-1700" y="394" width="4400" height="18" fill="rgba(8,4,16,.45)"/>';
  return s + '<g id="tirSvg"></g>';
}
function loupeDevant(){
  var cx = 500, cy = 196, r = 112;
  var s = '<g transform="rotate(40 ' + cx + ' ' + cy + ')">' + R(cx + r + 30, cy - 15, 150, 30, 15, G('bois')) + T('M' + (cx+r+66) + ',' + (cy-13) + ' v26 M' + (cx+r+90) + ',' + (cy-13) + ' v26 M' + (cx+r+114) + ',' + (cy-13) + ' v26', '#5a3418', 2.5) + reflet('M' + (cx+r+40) + ',' + (cy-7) + ' h130', 4, .35) +
    R(cx + r + 10, cy - 19, 30, 38, 6, G('laiton')) + Cir(cx + r + 180, cy, 10, G('laitonV')) + '</g>';
  s += '<circle cx="' + cx + '" cy="' + cy + '" r="' + (r + 10) + '" fill="none" stroke="' + K + '" stroke-width="26"/><circle cx="' + cx + '" cy="' + cy + '" r="' + (r + 10) + '" fill="none" stroke="' + G('laiton') + '" stroke-width="18"/>' +
    '<circle cx="' + cx + '" cy="' + cy + '" r="' + (r + 17) + '" fill="none" stroke="#fff1b8" stroke-width="1.5" opacity=".6"/><circle cx="' + cx + '" cy="' + cy + '" r="' + (r + 1) + '" fill="none" stroke="#6a4410" stroke-width="3"/>' +
    '<circle class="anneau" cx="' + cx + '" cy="' + cy + '" r="' + (r + 10) + '" fill="none" stroke-width="20"/>' +
    '<path d="M' + (cx - 82) + ',' + (cy - 46) + ' C' + (cx - 64) + ',' + (cy - 78) + ' ' + (cx - 34) + ',' + (cy - 94) + ' ' + (cx - 4) + ',' + (cy - 98) + '" fill="none" stroke="#fff" stroke-width="7" opacity=".5" stroke-linecap="round"/>' +
    '<path d="M' + (cx + 64) + ',' + (cy + 70) + ' C' + (cx + 52) + ',' + (cy + 82) + ' ' + (cx + 40) + ',' + (cy + 90) + ' ' + (cx + 26) + ',' + (cy + 94) + '" fill="none" stroke="#fff" stroke-width="4" opacity=".3" stroke-linecap="round"/>';
  return s;
}
function ouvrirLoupe(tir){
  if(S.occupe) return; var p = posCible(), g = $('#loupeMobile'), dx = p.x - LOUPE.x, dy = p.y - 12 - LOUPE.y; S.occupe = true;
  /* la loupe se soulève, vient au-dessus de l'objet, puis on plonge dedans */
  tween(640, function(q){ g.setAttribute('transform', 'translate(' + f1(dx*q) + ',' + f1(dy*q - Math.sin(q*Math.PI)*42) + ')'); }, function(){
    attendre(200, function(){ S.occupe = false; S.tiroir = tir || null; S.casier = null; S.essai = null; afficherLoupe(p); });
  });
}
function afficherLoupe(origine){
  var o = OBJETS[S.sel];
  ouvrirMode('loupe', '<div class="vue" id="vue"><svg class="fond" viewBox="0 0 1000 640" aria-hidden="true">' + sceneLoupe() + '</svg>' +
    '<canvas id="cvVerre" class="pose" style="' + pos(388, 84, 224, 224) + '" aria-label="Sous la loupe : ' + o.nom + '"></canvas>' +
    '<svg class="devant" viewBox="0 0 1000 640" aria-hidden="true">' + loupeDevant() + '</svg>' +
    '<div class="tampon pose" id="tampon" style="' + pos(430, 126, 140, 140) + '" aria-hidden="true"></div><div class="ruban pose" id="ruban" hidden></div>' +
    '<div id="bas"></div></div>' + modeHaut(true, 'Reposer la loupe'), origine);
  majBas(); majCoeurs(); requestAnimationFrame(function(){ rendVerre(); });
}
function svgPicto(k){ return '<svg viewBox="-26 -22 52 44" aria-hidden="true">' + picto(k, 0, 0, 40) + '</svg>'; }
/* Le bas de l'écran : les deux tiroirs fermés, ou le tiroir ouvert avec ses trois casiers et les échantillons */
function majBas(){
  var svg = $('#tirSvg'), bas = $('#bas'); if(!svg || !bas) return; var t = S.sel, o = OBJETS[t], fait = !!S.trouves[t], barres = S.barres[t] || {}, flair = S.flair[t] || {}, s = '', h = '';
  $('#vue').classList.toggle('bon', fait);
  var rb = $('#ruban'); rb.hidden = !fait; if(fait) rb.textContent = '✅ ' + nomTrouve(t);
  if(!S.tiroir){
    [['g', 50], ['d', 530]].forEach(function(d){ var x0 = d[1];
      s += '<g data-tiroir="' + d[0] + '" class="tir-svg" tabindex="0" role="button" aria-label="Ouvrir le tiroir : ' + TIROIRS[d[0]].map(function(k){ return CASIERS[k]; }).join(', ') + '">' +
        '<rect class="rond toujours" x="' + (x0 - 9) + '" y="405" width="438" height="210" rx="16"/>' + R(x0, 414, 420, 192, 8, G('boisC')) + '<rect x="' + (x0 + 12) + '" y="426" width="396" height="168" rx="5" fill="none" stroke="#7d4626" stroke-width="2.5" opacity=".5"/>' +
        grainBois(x0 + 8, 420, 404, 180, 8, 40 + x0, '#7d4626', .3) + reflet('M' + (x0 + 10) + ',419 h400', 2.5, .35) +
        R(x0 + 92, 432, 236, 70, 6, '#fff6d8', ' stroke-width="3"') + TIROIRS[d[0]].map(function(k, n){ return picto(k, x0 + 134 + n*76, 456, 30) + txt(x0 + 134 + n*76, 487, 16, CASIERS[k]); }).join('') +
        R(x0 + 158, 530, 104, 30, 10, G('laitonV'), ' stroke-width="3.5"') + T('M' + (x0 + 178) + ',545 q32,32 64,0', K, 11) + T('M' + (x0 + 178) + ',545 q32,32 64,0', '#f5b945', 5.5) + Cir(x0 + 178, 545, 4, '#8a5a12') + Cir(x0 + 242, 545, 4, '#8a5a12') + '</g>'; });
    svg.innerHTML = s; bas.innerHTML = ''; return;
  }
  /* le tiroir tiré vers nous : le cadre de bois, le fond de feutre */
  s += R(14, 396, 972, 1900, 10, G('boisC')) + grainBois(18, 400, 964, 34, 2, 91, '#7d4626', .3) + '<rect x="30" y="438" width="940" height="1900" rx="5" fill="' + G('feutre') + '" stroke="' + K + '" stroke-width="3.5"/><rect x="32" y="440" width="936" height="22" fill="rgba(8,4,16,.35)"/>' + reflet('M22,401 H978', 2.5, .35);
  svg.innerHTML = s;
  var autre = S.tiroir === 'g' ? 'd' : 'g';
  h += '<div class="onglets pose" style="' + pos(40, 398, 920, 38) + '">' + TIROIRS[S.tiroir].map(function(k){ return '<button type="button" class="onglet" data-casier="' + k + '" aria-pressed="' + (S.casier === k) + '">' + svgPicto(k) + '<span>' + CASIERS[k] + '</span></button>'; }).join('') +
    '<button type="button" class="onglet autre" data-tiroir="' + autre + '" aria-label="L\'autre tiroir : ' + TIROIRS[autre].map(function(k){ return CASIERS[k]; }).join(', ') + '"><span class="poignee-o"></span>' + TIROIRS[autre].map(svgPicto).join('') + '</button></div>';
  if(!S.casier){
    h += '<div class="casiers pose" style="' + pos(44, 448, 912, 184) + '">' + TIROIRS[S.tiroir].map(function(k){ return '<button type="button" class="casier" data-casier="' + k + '">' + svgPicto(k) + '<span class="plaque">' + CASIERS[k] + '</span><span class="nb">' + contenuCasier(k).length + '</span></button>'; }).join('') + '</div>';
  } else {
    var l = contenuCasier(S.casier), cols = Math.max(6, Math.ceil(l.length/2));
    h += '<div class="rangee pose" style="' + pos(44, 446, 912, 188) + ';grid-template-columns:repeat(' + cols + ', minmax(0, 1fr))">' + l.map(function(r){ var id = S.casier + ':' + r, bon = fait && S.casier === o.tiroir && r === o.bon;
      return '<button type="button" class="ech' + (barres[id] ? ' barre' : '') + (flair[id] ? ' flair' : '') + (bon ? ' ok' : '') + '" data-ech="' + id + '"' + (fait || barres[id] || flair[id] ? ' disabled' : '') + '><canvas></canvas><span class="nm">' + ECH[S.casier][r].nom + '</span>' + (bon ? '<span class="marque">✅</span>' : (flair[id] ? '<span class="marque">🐾</span>' : (barres[id] ? '<span class="marque">❌</span>' : ''))) + '</button>'; }).join('') + '</div>';
  }
  bas.innerHTML = h;
  requestAnimationFrame(function(){ $$('.ech canvas').forEach(function(cv){ var rr = prep(cv), id = cv.parentNode.dataset.ech.split(':'); fondTapis(rr.ctx, rr.w, rr.h); dessinerRef(rr.ctx, rr.w, rr.h, id[0], id[1], 31 + id[1].length, rr.h/66*({fils:.9, grains:.74, poils:.85, petales:.8}[id[0]] || 1)); }); });
}
/* Ce qu'on voit dans le verre : l'objet seul, bien grossi ; ou l'objet et l'échantillon posé juste à côté, sous le même verre */
function rendVerre(a){
  var cv = $('#cvVerre'); if(!cv) return; var r = prep(cv), c = r.ctx, w = r.w, h = r.h, ech = w/284, o = OBJETS[S.sel];
  var montre = S.essai || (S.trouves[S.sel] ? o.tiroir + ':' + o.bon : null), p = a == null ? 1 : a;
  c.clearRect(0, 0, w, h); c.save(); c.beginPath(); c.arc(w/2, h/2, w/2, 0, 6.283); c.clip(); fondTapis(c, w, h);
  if(!montre) dessinerPreuve(c, w, h, 2.4*ech);
  else { var id = montre.split(':');
    c.save(); c.translate(0, -h*.2*p); dessinerPreuve(c, w, h, (2.4 - .9*p)*ech); c.restore();
    c.save(); c.translate(0, h*.2 + (1 - p)*h*.7); dessinerRef(c, w, h, id[0], id[1], 11 + id[1].length, 1.5*ech); c.restore(); }
  if(S.balaie != null){ var bx = w*S.balaie, g = c.createLinearGradient(bx - 34, 0, bx + 34, 0); g.addColorStop(0, 'rgba(255,255,255,0)'); g.addColorStop(.5, 'rgba(255,255,255,.6)'); g.addColorStop(1, 'rgba(255,255,255,0)'); c.fillStyle = g; c.fillRect(bx - 34, 0, 68, h); }
  var lg = c.createRadialGradient(w*.35, h*.3, 0, w*.35, h*.3, w*.6); lg.addColorStop(0, 'rgba(255,255,255,.2)'); lg.addColorStop(1, 'rgba(255,255,255,0)'); c.fillStyle = lg; c.fillRect(0, 0, w, h);
  var vg = c.createRadialGradient(w/2, h/2, w*.36, w/2, h/2, w/2); vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(20,12,40,.32)'); c.fillStyle = vg; c.fillRect(0, 0, w, h);
  c.restore();
}
function ouvrirTiroir(k){ if(S.occupe) return; S.tiroir = k; S.casier = null; majBas(); }
function ouvrirCasier(k){ if(S.occupe) return; S.casier = k; majBas(); }
/* On touche un échantillon : il vient se poser sous la loupe à côté de l'objet, l'ordinateur compare et le dit clairement */
function essayer(id, bouton){
  var t = S.sel, o = OBJETS[t]; if(S.trouves[t] || S.occupe || (S.barres[t] || {})[id] || (S.flair[t] || {})[id]) return;
  S.occupe = true; $$('.ech').forEach(function(b){ b.setAttribute('aria-pressed', String(b.dataset.ech === id)); });
  volVers(bouton, $('#cvVerre'), function(){
    S.essai = id;
    tween(380, function(p){ rendVerre(p); }, function(){
      tweenLin(reduit ? 1 : 700, function(p){ S.balaie = p; rendVerre(1); }, function(){ S.balaie = null; rendVerre(1); verdict(id, id === o.tiroir + ':' + o.bon); });
    });
  });
}
function verdict(id, bon){
  var t = S.sel, v = $('#vue'), co = coeursDe(t);
  if(bon){ S.trouves[t] = true; S.vientDeTrouver = t; S.occupe = false; S.essai = null; tampon('✅'); majBas(); rendVerre(1); return; }
  v.classList.add('faux'); tampon('❌');
  attendre(950, function(){
    v.classList.remove('faux');
    if(co === 0){ S.coeurs[t] = 3; S.barres[t] = {}; } else { S.coeurs[t] = co - 1; S.barres[t] = S.barres[t] || {}; S.barres[t][id] = true; }
    tween(300, function(p){ rendVerre(1 - p); }, function(){ S.essai = null; S.occupe = false; rendVerre(); majBas(); majCoeurs(co === 0); });
  });
}
