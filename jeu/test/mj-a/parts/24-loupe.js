
/* ==========================================================
   LOUPE (Alchimiste) — deux images de l'étagère : trouver les N
   différences avant la fin du sablier. Toucher une différence sur
   l'une ou l'autre image l'entoure sur les deux. Plus loin : trois
   étagères, différences subtiles (teinte proche, petit détail,
   objet décalé, tourné, un peu plus grand…) et, dès le niveau 5,
   il fait sombre : seule la LOUPE (sous ton doigt) éclaire les deux
   images au même endroit. Glisse pour regarder, touche pour marquer.
   Mods compris : erreurs (+N touches ratées permises), temps (+N s), lent (sablier plus long),
   aide (N fois le bouton 💡 qui montre une différence : lunettes
   d'alchimiste), revele (les différences scintillent, pas de nuit),
   zone (zones de touche et loupe plus grandes).
   ========================================================== */
var COUL_ALT = {
  '#e5484d':['#3f7fe0', '#e8803c'], '#3f7fe0':['#4fbf6a', '#5a5fd8'], '#4fbf6a':['#f6d23a', '#3fa88a'], '#f6d23a':['#e5484d', '#f0b93a'],
  '#9d6ee3':['#e5484d', '#c06ee3'], '#f08a3c':['#9d6ee3', '#e8603c'], '#c08a4a':['#6e8acb', '#a8743f'], '#8ff3ff':['#ffd36a', '#a8e8ff']
};
var COULS = Object.keys(COUL_ALT);
var OBJ_LOUPE = {
  fiole: {asym:false, art:function(o){ return '<path d="M-6,-46 L6,-46 L6,-30 C18,-24 20,-10 18,-4 C14,4 -14,4 -18,-4 C-20,-10 -18,-24 -6,-30 Z" fill="#dfe6ff" fill-opacity=".3" stroke="' + CONTOUR + '" stroke-width="3"/><path d="M-16,-12 C-6,-15 6,-9 16,-12 C17,-6 15,-1 12,1 C4,4 -4,4 -12,1 C-15,-1 -17,-6 -16,-12 Z" fill="' + o.c + '"/>' + (o.d ? '<rect x="-7" y="-52" width="14" height="8" rx="2" fill="#b8862e" stroke="' + CONTOUR + '" stroke-width="2"/>' : '') + '<path d="M-11,-20 C-13,-14 -13,-9 -11,-5" stroke="#fff" stroke-width="2.5" fill="none" opacity=".6"/>'; }},
  livre: {asym:false, art:function(o){ return '<rect x="-10" y="-50" width="20" height="50" rx="2" fill="' + o.c + '" stroke="' + CONTOUR + '" stroke-width="3"/><path d="M-6,-46 L-6,-4" stroke="#fff" stroke-width="2" opacity=".35"/>' + (o.d ? '<rect x="-10" y="-36" width="20" height="6" fill="#f5b945" stroke="' + CONTOUR + '" stroke-width="1.5"/>' : '') + '<rect x="-10" y="-14" width="20" height="4" fill="' + CONTOUR + '" opacity=".35"/>'; }},
  bougie: {asym:false, art:function(o){ return '<ellipse cx="0" cy="-2" rx="16" ry="5" fill="#b8862e" stroke="' + CONTOUR + '" stroke-width="3"/><rect x="-7" y="-34" width="14" height="32" rx="3" fill="#fff4dc" stroke="' + CONTOUR + '" stroke-width="3"/><path d="M0,-34 L0,-39" stroke="' + CONTOUR + '" stroke-width="2"/>' + (o.d ? '<path d="M0,-52 C5,-46 5,-41 0,-38 C-5,-41 -5,-46 0,-52 Z" fill="#ffb03a" stroke="' + CONTOUR + '" stroke-width="1.5"/>' : ''); }},
  champignon: {asym:false, art:function(o){ return '<path d="M-6,0 L-5,-18 L5,-18 L6,0 Z" fill="#fff4dc" stroke="' + CONTOUR + '" stroke-width="3"/><path d="M-22,-16 C-22,-40 22,-40 22,-16 Z" fill="' + o.c + '" stroke="' + CONTOUR + '" stroke-width="3"/><circle cx="-10" cy="-26" r="3.5" fill="#fff"/><circle cx="8" cy="-30" r="3" fill="#fff"/>' + (o.d ? '<circle cx="12" cy="-20" r="3" fill="#fff"/>' : ''); }},
  cle: {asym:true, art:function(o){ return '<circle cx="-14" cy="-14" r="10" fill="none" stroke="' + o.c + '" stroke-width="6"/><circle cx="-14" cy="-14" r="10" fill="none" stroke="' + CONTOUR + '" stroke-width="1.5"/><path d="M-4,-14 L22,-14" stroke="' + o.c + '" stroke-width="6" stroke-linecap="round"/><path d="M16,-14 L16,-6' + (o.d ? ' M10,-14 L10,-7' : '') + '" stroke="' + o.c + '" stroke-width="5"/>'; }},
  plume: {asym:true, art:function(o){ return '<path d="M-12,0 L-14,-14 L14,-14 L12,0 Z" fill="#2a2440" stroke="' + CONTOUR + '" stroke-width="3"/>' + (o.d ? '<rect x="-8" y="-11" width="16" height="6" fill="#f3e7cb"/>' : '') + '<path d="M2,-14 C4,-34 14,-50 24,-56 C22,-40 16,-24 4,-14 Z" fill="' + o.c + '" stroke="' + CONTOUR + '" stroke-width="2.5"/><path d="M3,-14 L22,-52" stroke="' + CONTOUR + '" stroke-width="1.5"/>'; }},
  sablier: {asym:false, art:function(o){ return '<rect x="-14" y="-50" width="28" height="5" rx="2" fill="#8a5a33" stroke="' + CONTOUR + '" stroke-width="2.5"/><rect x="-14" y="-5" width="28" height="5" rx="2" fill="#8a5a33" stroke="' + CONTOUR + '" stroke-width="2.5"/><path d="M-10,-45 C-10,-30 -2,-28 0,-25 C2,-28 10,-30 10,-45 Z M-10,-5 C-10,-20 -2,-22 0,-25 C2,-22 10,-20 10,-5 Z" fill="#dfe6ff" fill-opacity=".4" stroke="' + CONTOUR + '" stroke-width="2.5"/>' + (o.d ? '<path d="M-7,-42 L7,-42 C5,-34 2,-30 0,-28 C-2,-30 -5,-34 -7,-42 Z" fill="' + o.c + '"/>' : '<path d="M-8,-6 C-6,-14 6,-14 8,-6 Z" fill="' + o.c + '"/>'); }},
  pomme: {asym:true, art:function(o){ return '<path d="M0,-30 C-4,-36 -18,-36 -20,-22 C-22,-8 -10,0 0,-4 C10,0 22,-8 20,-22 C18,-36 4,-36 0,-30 Z" fill="' + o.c + '" stroke="' + CONTOUR + '" stroke-width="3"/><path d="M0,-30 L2,-38" stroke="#5e3a1e" stroke-width="3"/>' + (o.d ? '<path d="M2,-36 C8,-44 16,-40 16,-38 C10,-34 6,-34 2,-36 Z" fill="#4fbf6a" stroke="' + CONTOUR + '" stroke-width="2"/>' : '') + '<path d="M-12,-24 C-12,-28 -9,-30 -6,-30" stroke="#fff" stroke-width="2.5" fill="none" opacity=".6"/>'; }},
  cristal: {asym:true, art:function(o){ return '<path d="M-6,0 L-10,-30 L-2,-46 L6,-30 L4,0 Z" fill="' + o.c + '" stroke="' + CONTOUR + '" stroke-width="3"/><path d="M4,0 L10,-22 L18,-14 L14,0 Z" fill="' + o.c + '" stroke="' + CONTOUR + '" stroke-width="3" opacity=".9"/>' + (o.d ? '<path d="M-6,0 L-18,-16 L-12,-22 L-8,-4 Z" fill="' + o.c + '" stroke="' + CONTOUR + '" stroke-width="3"/>' : '') + '<path d="M-4,-34 L-2,-12" stroke="#fff" stroke-width="2" opacity=".6"/>'; }},
  pot: {asym:true, art:function(o){ return '<path d="M-14,-20 L14,-20 L10,0 L-10,0 Z" fill="' + o.c + '" stroke="' + CONTOUR + '" stroke-width="3"/><path d="M0,-20 C-2,-30 -8,-36 -12,-40 M0,-20 C2,-32 8,-38 14,-40" stroke="#3a8a5a" stroke-width="3" fill="none"/><ellipse cx="-12" cy="-40" rx="6" ry="3" fill="#4fbf6a" stroke="' + CONTOUR + '" stroke-width="1.5"/>' + (o.d ? '<circle cx="14" cy="-42" r="5" fill="#ff8fb3" stroke="' + CONTOUR + '" stroke-width="2"/>' : '<ellipse cx="14" cy="-40" rx="6" ry="3" fill="#4fbf6a" stroke="' + CONTOUR + '" stroke-width="1.5"/>'); }}
};
var TYPES_LOUPE = Object.keys(OBJ_LOUPE);
function etagere(id, H){
  var s = '<defs><linearGradient id="' + id + 'm" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3a3168"/><stop offset="1" stop-color="#262050"/></linearGradient></defs>' +
    '<rect width="360" height="' + H + '" fill="url(#' + id + 'm)"/>';
  for(var y = 108; y < H; y += 112) s += '<path d="M0,' + (y - 70) + ' L360,' + (y - 70) + '" stroke="#30285a" stroke-width="2"/><rect x="6" y="' + y + '" width="348" height="12" rx="3" fill="#8a5a33" stroke="' + CONTOUR + '" stroke-width="3"/>';
  return s;
}
function genererScene(n, nDiff){
  var objets = [], rangees = n >= 6 ? 3 : 2;
  var parEtagere = n <= 2 ? 4 : 5;
  for(var r = 0; r < rangees; r++){
    var y = 108 + r * 112, largeur = 330 / parEtagere;
    for(var i = 0; i < parEtagere; i++){
      objets.push({t:U.choix(TYPES_LOUPE), x:22 + largeur * (i + 0.5) + U.rand(-6, 6), y:y, s:U.rand(1.05, 1.3), c:U.choix(COULS), d:Math.random() < 0.6, m:Math.random() < 0.3, r:0});
    }
  }
  var sortes = n <= 2 ? ['absent', 'couleur', 'taille'] : (n <= 5 ? ['absent', 'couleur', 'detail', 'detail', 'miroir', 'decale'] : ['detail', 'detail', 'teinte', 'miroir', 'decale', 'tourne', 'taille']);
  var indices = U.melanger(objets.map(function(o, i){ return i; })).slice(0, nDiff);
  var diffs = indices.map(function(i){
    var o = objets[i];
    var sorte = U.choix(sortes);
    if(sorte === 'miroir' && !OBJ_LOUPE[o.t].asym) sorte = 'detail';
    var b = {t:o.t, x:o.x, y:o.y, s:o.s, c:o.c, d:o.d, m:o.m, r:0};
    if(sorte === 'couleur') b.c = COUL_ALT[o.c][0];
    else if(sorte === 'teinte') b.c = COUL_ALT[o.c][1];
    else if(sorte === 'detail') b.d = !o.d;
    else if(sorte === 'miroir') b.m = !o.m;
    else if(sorte === 'taille') b.s = o.s * (n <= 2 ? 1.35 : 1.16);
    else if(sorte === 'decale') b.x = o.x + (Math.random() < .5 ? -1 : 1) * (n <= 5 ? 14 : 9);
    else if(sorte === 'tourne') b.r = (Math.random() < .5 ? -1 : 1) * 16;
    else if(sorte === 'absent') b.absent = true;
    return {i:i, sorte:sorte, b:b, x:o.x, y:o.y - 26 * o.s, r:30 * o.s};
  });
  return {objets:objets, diffs:diffs, H:rangees * 112 + 16};
}
function dessinerObjets(objets, remplacements){
  return objets.map(function(o, i){
    var r = remplacements && remplacements[i] ? remplacements[i] : o;
    if(r.absent) return '';
    return '<g class="mja-obj o-' + r.t + '" transform="translate(' + r.x.toFixed(1) + ',' + r.y.toFixed(1) + ') rotate(' + (r.r || 0) + ') scale(' + (r.m ? -r.s : r.s).toFixed(2) + ',' + r.s.toFixed(2) + ')">' + OBJ_LOUPE[r.t].art(r) + '</g>';
  }).join('');
}
MJ.enregistrer('loupe', {
  nom:'Différences à la loupe', role:'alchimiste', ic:'🔍',
  consigne:function(p){ return p && p.loupe ? 'Promène ta loupe sur les étagères et touche les différences entre les deux images avant la fin du sablier !' : 'Touche les différences entre les deux étagères avant la fin du sablier !'; },
  minuteur:true,
  reglages: function(n, mods){
    var p = {};
    p.differences = entier(n, {1:3, 3:5, 6:6, 9:7, 12:8});
    p.duree = Math.round(courbe(n, {1:75, 3:58, 6:50, 9:42, 12:36}) / (mods.lent || 1) + (mods.temps || 0));
    p.erreurs = erreursPermises(n, mods, {1:5, 3:3, 6:2, 9:1});
    p.indices = mods.aide || 0;
    p.revele = !!mods.revele;
    p.marge = mods.zone || 1;
    p.loupe = n >= 5 && !mods.revele ? courbe(n, {5:96, 7:82, 9:70, 12:60}) * (mods.zone || 1) : 0;
    p.niveauScene = n;
    p.lignes = [
      {nom:'Différences', val:String(p.differences)},
      {nom:'Sablier', val:p.duree + ' s'},
      {nom:'Touches ratées permises', val:String(p.erreurs)},
      {nom:'Taille des différences', val:n <= 2 ? 'faciles à voir' : (n <= 5 ? 'moyennes' : 'toutes petites')},
      {nom:'Lumière', val:p.loupe ? 'nuit : seule ta loupe éclaire' : 'plein jour'}
    ];
    return p;
  },
  demo: function(el){
    var d = demoScene(el, '<rect width="300" height="170" rx="14" fill="#1f2547"/><rect x="14" y="20" width="130" height="110" rx="10" fill="#3a3168" stroke="' + CONTOUR + '" stroke-width="3"/><rect x="156" y="20" width="130" height="110" rx="10" fill="#3a3168" stroke="' + CONTOUR + '" stroke-width="3"/>');
    var a = {t:'champignon', x:50, y:110, s:1, c:'#e5484d', d:true}, b = {t:'fiole', x:105, y:110, s:1, c:'#4fbf6a', d:true};
    var b2 = {t:'fiole', x:247, y:110, s:1, c:'#3f7fe0', d:true}, a2 = {t:'champignon', x:192, y:110, s:1, c:'#e5484d', d:true};
    d.contenu.innerHTML = dessinerObjets([a, b]) + dessinerObjets([a2, b2]) + '<circle class="mja-rond-demo" cx="247" cy="86" r="26" fill="none" stroke="#8ff3ff" stroke-width="4" opacity="0"/><circle class="mja-rond-demo2" cx="105" cy="86" r="26" fill="none" stroke="#8ff3ff" stroke-width="4" opacity="0"/>';
    var r1 = d.contenu.querySelector('.mja-rond-demo'), r2 = d.contenu.querySelector('.mja-rond-demo2');
    return scenario([
      [10, function(){ r1.setAttribute('opacity', '0'); r2.setAttribute('opacity', '0'); d.vers(270, 160, 0); }],
      [500, function(){ d.vers(247, 92, 800); }],
      [900, function(){ d.tape(); r1.setAttribute('opacity', '1'); r2.setAttribute('opacity', '1'); U.son('ok'); }],
      [1200, function(){ }]
    ], 600);
  },
  jouer: function(el, p, fin){
    var P = Partie(fin);
    var hud = creerHud(el);
    var ratesMax = p.erreurs, rates = 0;
    hud.vies(ratesMax + 1, ratesMax + 1);
    hud.prog(0, p.differences, '🔍');
    var scene = p.scene || genererScene(p.niveauScene, p.differences);
    var H = scene.H || 240;
    var id = nid('lo');
    var remp = {};
    scene.diffs.forEach(function(d){ remp[d.i] = d.b; });
    function nuit(k){ return p.loupe ? '<defs><mask id="' + id + 'k' + k + '"><rect width="360" height="' + H + '" fill="#fff"/><circle class="mja-trou" cx="-200" cy="-200" r="' + p.loupe.toFixed(0) + '" fill="#000"/></mask>' +
      '<radialGradient id="' + id + 'g' + k + '"><stop offset=".8" stop-color="#8ff3ff" stop-opacity="0"/><stop offset="1" stop-color="#8ff3ff" stop-opacity=".5"/></radialGradient></defs>' +
      '<rect class="mja-nuit" width="360" height="' + H + '" mask="url(#' + id + 'k' + k + ')"/><circle class="mja-lentille" cx="-200" cy="-200" r="' + p.loupe.toFixed(0) + '" fill="url(#' + id + 'g' + k + ')"/>' : ''; }
    var terrain = U.html('<div class="mja-terrain mja-loupe' + (p.loupe ? ' de-nuit' : '') + '"><div class="mja-images">' +
      '<div class="mja-image"><svg viewBox="0 0 360 ' + H + '" preserveAspectRatio="xMidYMid meet" data-img="a">' + etagere(id + 'a', H) + dessinerObjets(scene.objets) + '<g class="mja-ronds"></g>' + nuit(0) + '</svg></div>' +
      '<div class="mja-image"><svg viewBox="0 0 360 ' + H + '" preserveAspectRatio="xMidYMid meet" data-img="b">' + etagere(id + 'b', H) + dessinerObjets(scene.objets, remp) + '<g class="mja-ronds"></g>' + nuit(1) + '</svg></div>' +
    '</div>' + (p.indices ? '<div class="mja-actions"><button class="btn magie mja-indice" type="button">💡 × ' + p.indices + '</button></div>' : '') + '</div>');
    el.appendChild(terrain);
    var images = terrain.querySelector('.mja-images');
    function disposer(){ var r = terrain.getBoundingClientRect(); images.classList.toggle('cote', r.width > r.height * 1.1); }
    disposer();
    P.ecoute(window, 'resize', disposer);
    var svgs = Array.prototype.slice.call(terrain.querySelectorAll('svg'));
    var trouvees = 0, restant = p.duree, fini = false, indicesRestants = p.indices;
    if(p.revele){
      scene.diffs.forEach(function(d){ svgs.forEach(function(s){ svgNoeud('circle', {cx:d.x, cy:d.y, r:d.r, 'class':'mja-scintille'}, s.querySelector('.mja-ronds')); }); });
    }
    function lentille(pt){
      if(!p.loupe) return;
      svgs.forEach(function(s){ s.querySelectorAll('.mja-trou, .mja-lentille').forEach(function(c){ c.setAttribute('cx', pt.x.toFixed(1)); c.setAttribute('cy', pt.y.toFixed(1)); }); });
    }
    if(p.loupe) lentille({x:180, y:H / 2});
    function marquer(s, pt){
      if(fini) return;
      var d = null;
      scene.diffs.forEach(function(x){ if(!x.ok && dist(pt, x) < x.r * p.marge + 6) d = x; });
      if(d){
        d.ok = true; trouvees++;
        svgs.forEach(function(s2){ svgNoeud('circle', {cx:d.x, cy:d.y, r:d.r, 'class':'mja-rond'}, s2.querySelector('.mja-ronds')); });
        U.son('ok');
        hud.prog(trouvees, p.differences, '🔍');
        if(trouvees >= p.differences){ fini = true; P.finir({reussi:true, score:1, erreurs:rates, detail:'Tu as l\'œil d\'un vrai savant !'}, 900); }
      } else {
        rates++;
        hud.perdVie(ratesMax + 1 - rates, ratesMax + 1);
        erreurSensorielle(s.parentNode);
        var x = svgNoeud('text', {x:pt.x, y:pt.y + 8, 'class':'mja-croix', 'text-anchor':'middle'}, s.querySelector('.mja-ronds'));
        x.textContent = '✗';
        P.apres(700, function(){ if(x.parentNode) x.parentNode.removeChild(x); });
        if(rates > ratesMax){ fini = true; montrerTout(); P.finir({reussi:false, score:trouvees / p.differences, erreurs:rates, detail:'Trop de mauvaises touches…'}, 1400); }
      }
    }
    svgs.forEach(function(s){
      var appui = null;
      P.ecoute(s, 'pointerdown', function(e){
        if(fini) return;
        e.preventDefault();
        var pt = ptSVG(s, e);
        if(!p.loupe){ marquer(s, pt); return; }
        appui = {x:e.clientX, y:e.clientY, id:e.pointerId, bouge:false};
        try{ s.setPointerCapture(e.pointerId); }catch(er){}
        lentille(pt);
      });
      P.ecoute(s, 'pointermove', function(e){
        if(!p.loupe) return;
        if(appui && e.pointerId === appui.id){ if(Math.abs(e.clientX - appui.x) + Math.abs(e.clientY - appui.y) > 12) appui.bouge = true; lentille(ptSVG(s, e)); }
        else if(e.pointerType === 'mouse') lentille(ptSVG(s, e));
      });
      P.ecoute(s, 'pointerup', function(e){
        if(!p.loupe || !appui || e.pointerId !== appui.id) return;
        var a = appui; appui = null;
        if(!a.bouge) marquer(s, ptSVG(s, e));
      });
      P.ecoute(s, 'pointercancel', function(){ appui = null; });
    });
    var bi = terrain.querySelector('.mja-indice');
    if(bi) P.ecoute(bi, 'click', function(){
      if(fini || indicesRestants <= 0) return;
      var restantes = scene.diffs.filter(function(d){ return !d.ok; });
      if(!restantes.length) return;
      indicesRestants--; bi.textContent = '💡 × ' + indicesRestants; if(!indicesRestants) bi.disabled = true;
      var d = U.choix(restantes);
      U.son('magie');
      lentille(d);
      var c = svgNoeud('circle', {cx:d.x, cy:d.y, r:d.r * 1.2, 'class':'mja-indice-rond'}, svgs[1].querySelector('.mja-ronds'));
      P.apres(1800, function(){ if(c.parentNode) c.parentNode.removeChild(c); });
    });
    function montrerTout(){
      terrain.classList.remove('de-nuit');
      scene.diffs.forEach(function(d){ if(!d.ok) svgs.forEach(function(s){ svgNoeud('circle', {cx:d.x, cy:d.y, r:d.r, 'class':'mja-rond manque'}, s.querySelector('.mja-ronds')); }); });
    }
    terrain.mjaEtat = function(){ return {diffs:scene.diffs.map(function(d){ return {x:d.x, y:d.y, ok:!!d.ok}; }), loupe:p.loupe}; };
    P.boucle(function(dt){
      if(fini) return false;
      restant -= dt;
      hud.temps(restant / p.duree);
      if(restant <= 0){ fini = true; montrerTout(); P.finir({reussi:false, score:trouvees / p.differences, erreurs:rates, detail:'Le sablier est vide…'}, 1400); return false; }
    });
    return {arreter: P.arreter};
  }
});

})();
