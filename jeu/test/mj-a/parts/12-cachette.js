
/* ==========================================================
   CACHETTE (Pisteur) — vue du dessus, la nuit. On touche une
   cachette à portée (cercle bleu) pour y courir ; il faut choisir
   son chemin jusqu'à la porte. Plusieurs gardes : rondes avec pauses
   où ils balaient la rue, demi-tours imprévus, guetteurs qui pivotent.
   Une charrette roule : cachée dedans, on avance avec elle. Les tas
   de feuilles et les flaques font du bruit : les gardes viennent voir.
   (Romain, 4 nov. : on ne lance plus rien pour distraire les gardes,
   on se cache seulement.)
   Mods : erreurs (+vies), lent (gardes plus lents), zone (lanternes
   moins longues), gardes (± gardes), invisible (N s d'invisibilité,
   une fois), temps (+N s au sablier),
   aide / revele (chaque cachette dit si on peut y aller : vert/rouge).
   ========================================================== */
var COUVERTS = {
  tonneau: '<circle r="20" fill="#9a6235" stroke="' + CONTOUR + '" stroke-width="4"/><circle r="13" fill="none" stroke="#3b3346" stroke-width="3"/><circle r="5" fill="#6e4424"/>',
  buisson: '<path d="M-24,4 C-30,-10 -16,-24 -4,-20 C2,-30 22,-24 22,-10 C32,-4 26,16 12,16 C4,24 -14,22 -18,14 C-28,14 -30,8 -24,4 Z" fill="#2f7a4c" stroke="' + CONTOUR + '" stroke-width="4"/><circle cx="-8" cy="-6" r="3" fill="#e5484d"/><circle cx="8" cy="4" r="3" fill="#e5484d"/>',
  caisses: '<rect x="-22" y="-20" width="26" height="26" rx="3" fill="#c08a4a" stroke="' + CONTOUR + '" stroke-width="4"/><rect x="-2" y="-6" width="24" height="24" rx="3" fill="#b07a3c" stroke="' + CONTOUR + '" stroke-width="4"/><path d="M-22,-20 L4,6 M-2,-6 L22,18" stroke="#7d5428" stroke-width="3"/>',
  foin: '<circle r="21" fill="#e6c25a" stroke="' + CONTOUR + '" stroke-width="4"/><path d="M-12,-8 C-4,-14 8,-12 12,-4 M-10,6 C-2,12 8,10 12,2" stroke="#b08a2a" stroke-width="3" fill="none"/>',
  puits: '<circle r="21" fill="#7d7a92" stroke="' + CONTOUR + '" stroke-width="4"/><circle r="13" fill="#14112a" stroke="' + CONTOUR + '" stroke-width="3"/><path d="M-22,0 L22,0" stroke="#8a5a33" stroke-width="4"/>'
};
var CHARRETTE = '<rect x="-30" y="-17" width="60" height="32" rx="4" fill="#a8743f" stroke="' + CONTOUR + '" stroke-width="4"/><path d="M-30,-2 L30,-2 M-10,-17 L-10,15 M10,-17 L10,15" stroke="#7d5428" stroke-width="3"/><rect x="-36" y="-23" width="10" height="44" rx="4" fill="#3b3346" stroke="' + CONTOUR + '" stroke-width="3"/><rect x="26" y="-23" width="10" height="44" rx="4" fill="#3b3346" stroke="' + CONTOUR + '" stroke-width="3"/><circle cx="-22" cy="-8" r="6" fill="#e6c25a" stroke="' + CONTOUR + '" stroke-width="2"/><circle cx="20" cy="6" r="7" fill="#e6c25a" stroke="' + CONTOUR + '" stroke-width="2"/>';
var PORTE = '<path d="M-24,14 L-24,-12 C-24,-30 24,-30 24,-12 L24,14 Z" fill="#6e4424" stroke="' + CONTOUR + '" stroke-width="4"/><path d="M0,-26 L0,14" stroke="' + CONTOUR + '" stroke-width="3"/><circle cx="8" cy="0" r="3" fill="#ffd36a"/><path d="M-30,14 L30,14" stroke="' + CONTOUR + '" stroke-width="5" stroke-linecap="round"/>';
var BRUYANTS = {
  feuilles: '<ellipse rx="26" ry="15" fill="#6b3f1e" opacity=".55"/>' + [[-12,-4,'#d79a3c'],[2,-8,'#c07a34'],[12,2,'#e8b04a'],[-4,6,'#a5672e'],[16,-6,'#d79a3c'],[-18,4,'#c07a34']].map(function(f){ return '<path d="M' + f[0] + ',' + f[1] + ' c4,-6 11,-6 13,0 c-4,4 -9,4 -13,0 Z" fill="' + f[2] + '" stroke="' + CONTOUR + '" stroke-width="1"/>'; }).join(''),
  flaque: '<ellipse rx="28" ry="14" fill="#3a5f96" stroke="' + CONTOUR + '" stroke-width="2.5"/><ellipse cx="-8" cy="-4" rx="10" ry="3" fill="#a8d4ff" opacity=".6"/>'
};
function rueNuit(id){
  var s = '<defs><pattern id="' + id + 'pv" width="30" height="22" patternUnits="userSpaceOnUse"><rect width="30" height="22" fill="#2b3150"/><path d="M1,1 h12 v9 h-12 Z M16,1 h13 v9 h-13 Z M-6,12 h13 v9 h-13 Z M9,12 h13 v9 h-13 Z M24,12 h13 v9 h-13 Z" fill="#343b60" stroke="#1d2240" stroke-width="1.5"/></pattern></defs>' +
    '<rect x="' + DEC.x + '" y="' + DEC.y + '" width="' + DEC.w + '" height="' + DEC.h + '" fill="url(#' + id + 'pv)"/>';
  /* maisons des deux côtés */
  [[-240, 16], [344, 600]].forEach(function(c, k){
    var x0 = c[0], x1 = c[1];
    s += '<rect x="' + x0 + '" y="' + DEC.y + '" width="' + (x1 - x0) + '" height="' + DEC.h + '" fill="#3b2a3e"/>';
    for(var y = -200; y < 700; y += 110){
      s += '<path d="M' + x0 + ',' + y + ' L' + x1 + ',' + y + '" stroke="' + CONTOUR + '" stroke-width="5"/>';
      s += '<rect x="' + (k ? x0 + 14 : x1 - 26) + '" y="' + (y + 40) + '" width="12" height="18" rx="2" fill="#ffd36a" opacity="' + (Math.random() < .5 ? .85 : .25) + '"/>';
    }
  });
  s += '<path d="M16,' + DEC.y + ' L16,700 M344,' + DEC.y + ' L344,700" stroke="' + CONTOUR + '" stroke-width="5"/>';
  return s;
}
MJ.enregistrer('cachette', {
  nom:'Se cacher', role:'pisteur', ic:'🫥',
  consigne:'Touche une cachette entourée de bleu pour y courir quand aucune lanterne ne te regarde, jusqu\'à la porte en haut !',
  minuteur:true,
  reglages: function(n, mods){
    var p = {niveau:n};
    p.rangees = entier(n, {1:3, 3:4, 7:4, 8:5});
    p.gardes = fixe(entier(n, {1:1, 3:2, 6:3, 9:4}) + (mods.gardes || 0), 1, 5);
    p.vitesse = courbe(n, {1:30, 3:44, 6:60, 9:78, 12:90}) * (mods.lent || 1);
    p.faisceau = courbe(n, {1:92, 3:110, 6:132, 9:156, 12:170}) / (mods.zone || 1);
    p.pause = courbe(n, {1:1.6, 3:1.2, 6:0.85, 9:0.6});
    p.imprevu = courbe(n, {1:0, 3:0.05, 6:0.16, 9:0.3, 12:0.38});
    p.guet = n >= 5;
    p.boucle = n >= 4;
    p.charrette = n >= 3;
    p.bruits = entier(n, {1:0, 3:1, 6:2, 9:3});
    p.portee = courbe(n, {1:200, 3:182, 6:170, 9:160});
    p.course = courbe(n, {1:205, 3:190, 6:178, 9:165});
    p.erreurs = erreursPermises(n, mods);
    p.duree = Math.round(courbe(n, {1:95, 3:80, 6:68, 9:58}) + (mods.temps || 0));
    p.invisible = mods.invisible || 0;
    p.aide = !!(mods.aide || mods.revele);
    p.lignes = [
      {nom:'Gardes', val:String(p.gardes) + (p.guet ? ' (dont un guetteur)' : '')},
      {nom:'Portée des lanternes', val:Math.round(p.faisceau / 10) + ' pas'},
      {nom:'Ils changent d\'avis', val:p.imprevu > 0.2 ? 'souvent' : (p.imprevu > 0 ? 'parfois' : 'jamais')},
      {nom:'Sablier', val:p.duree + ' s'},
      {nom:'Erreurs permises', val:String(p.erreurs)}
    ];
    return p;
  },
  demo: function(el){
    var d = demoScene(el, '<rect x="-60" width="420" height="170" fill="#2b3150"/>');
    d.contenu.innerHTML = '<g transform="translate(70,138)">' + COUVERTS.tonneau + '</g><g transform="translate(230,40)">' + COUVERTS.buisson + '</g><circle class="mja-demo-anneau" cx="230" cy="40" r="30"/>' +
      '<g class="mja-dg"><path d="M0,0 L90,-40 A98,98 0 0 1 90,40 Z" fill="#ffd36a" opacity=".45"/><circle r="11" fill="#3a5a9a" stroke="' + CONTOUR + '" stroke-width="3"/></g>' +
      '<g class="mja-jd"><circle r="9" fill="#3c9a62" stroke="' + CONTOUR + '" stroke-width="3"/></g>';
    var g = d.contenu.querySelector('.mja-dg'), j = d.contenu.querySelector('.mja-jd');
    function pose(o, x, y, rot, ms){ o.style.transition = 'transform ' + (ms || 0) + 'ms ease-in-out'; o.style.transform = 'translate(' + x + 'px,' + y + 'px) rotate(' + (rot || 0) + 'deg)'; }
    return scenario([
      [10, function(){ pose(g, 150, 92, 200); pose(j, 86, 128); d.vers(270, 160, 0); }],
      [400, function(){ pose(g, 120, 92, 180, 900); }],
      [900, function(){ pose(g, 110, 92, 0, 400); }],
      [450, function(){ d.vers(232, 52); }],
      [600, function(){ d.tape(); pose(j, 222, 46, 0, 700); U.son('pas'); }],
      [900, function(){}]
    ], 500);
  },
  jouer: function(el, p, fin){
    var P = Partie(fin);
    var vies = p.erreurs + 1, maxVies = vies;
    var hud = creerHud(el);
    hud.vies(vies, maxVies);
    hud.barre(0);
    var terrain = U.html('<div class="mja-terrain mja-cachette"></div>');
    el.appendChild(terrain);
    var id = nid('ca');
    terrain.innerHTML = '<svg viewBox="0 0 360 480" preserveAspectRatio="xMidYMid meet">' + rueNuit(id) +
      '<rect class="mja-voile-nuit" x="' + DEC.x + '" y="' + DEC.y + '" width="' + DEC.w + '" height="' + DEC.h + '"/>' +
      '<g class="mja-bruyants"></g><g class="mja-cones"></g><g class="mja-anneaux"></g><g class="mja-couverts"></g>' +
      '<g class="mja-joueur"><ellipse cx="0" cy="4" rx="12" ry="5" fill="#000" opacity=".35"/><circle r="11" fill="#3c9a62" stroke="' + CONTOUR + '" stroke-width="4"/><path d="M-7,-3 C-4,-9 4,-9 7,-3" stroke="#bff0cf" stroke-width="2.5" fill="none" stroke-linecap="round"/><circle cx="-4" cy="3" r="2.4" fill="#fff"/><circle cx="4" cy="3" r="2.4" fill="#fff"/></g>' +
      '<g class="mja-gardes"></g>' +
    '</svg>' +
    (p.invisible ? '<div class="mja-actions"><button class="btn magie mja-invis" type="button">👻 ' + p.invisible + ' s</button></div>' : '');
    var svg = terrain.querySelector('svg');
    cadrer(P, svg);
    var gC = svg.querySelector('.mja-couverts'), gG = svg.querySelector('.mja-gardes'), gCones = svg.querySelector('.mja-cones'), gAn = svg.querySelector('.mja-anneaux'), gBr = svg.querySelector('.mja-bruyants'), joueur = svg.querySelector('.mja-joueur');
    var btnI = terrain.querySelector('.mja-invis');

    /* Cachettes en rangées */
    var R = p.rangees, couv = [], types = Object.keys(COUVERTS), Y0 = 446, Y1 = 40;
    function ry(k){ return Y0 - k * (Y0 - Y1) / (R + 1); }
    var rangCharrette = p.charrette ? U.randInt(1, R) : -1;
    function relie(liste){
      /* chemin possible du départ à la porte sans la charrette ? */
      var vu = [liste[0]], file = [liste[0]], porteP = {x:180, y:Y1};
      while(file.length){
        var c = file.shift();
        if(dist(c, porteP) <= p.portee * 0.95) return true;
        liste.forEach(function(d){ if(vu.indexOf(d) < 0 && !d.charrette && dist(c, d) <= p.portee * 0.95){ vu.push(d); file.push(d); } });
      }
      return false;
    }
    for(var essai = 0; essai < 80; essai++){
      couv = [{x:U.rand(120, 240), y:Y0, k:0, type:U.choix(types)}];
      for(var k = 1; k <= R; k++){
        var segs = U.melanger([[46, 120], [140, 220], [240, 314]]).slice(0, R >= 4 && Math.random() < 0.5 ? 3 : 2);
        if(k === rangCharrette) segs = segs.slice(0, 1);
        segs.forEach(function(sg){ couv.push({x:U.rand(sg[0], sg[1]), y:ry(k) + U.rand(-10, 10), k:k, type:U.choix(types)}); });
        if(k === rangCharrette) couv.push({x:180, y:ry(k), k:k, charrette:true, dir:Math.random() < .5 ? 1 : -1, v:courbe(p.niveau, {3:26, 9:40})});
      }
      if(relie(couv)) break;
    }
    var porte = {x:180, y:Y1, k:R + 1, porte:true};
    couv.push(porte);
    couv.forEach(function(c){
      c.g = svgNoeud('g', {'class':'mja-couvert' + (c.porte ? ' porte' : '') + (c.charrette ? ' charrette' : '')}, gC);
      c.g.innerHTML = c.porte ? PORTE : (c.charrette ? CHARRETTE : COUVERTS[c.type]);
      c.an = svgNoeud('circle', {'class':'mja-anneau', r:c.charrette ? 40 : 32}, gAn);
      placer(c);
    });
    function placer(c){ c.g.setAttribute('transform', 'translate(' + c.x.toFixed(1) + ',' + c.y.toFixed(1) + ')'); c.an.setAttribute('cx', c.x.toFixed(1)); c.an.setAttribute('cy', c.y.toFixed(1)); }
    function cachetteDe(c){ return c.porte ? {x:c.x, y:c.y + 12} : (c.charrette ? {x:c.x, y:c.y + 2} : {x:c.x + 15, y:c.y - 13}); }
    /* Endroits bruyants entre les rangées */
    var bruyants = [];
    for(var b = 0; b < p.bruits; b++){
      for(var e = 0; e < 30; e++){
        var kk = U.randInt(0, R), q = {x:U.rand(50, 310), y:(ry(kk) + ry(kk + 1)) / 2 + U.rand(-12, 12), type:Math.random() < .5 ? 'feuilles' : 'flaque'};
        if(couv.every(function(c){ return dist(c, q) > 46; }) && bruyants.every(function(o){ return dist(o, q) > 70; })){
          q.g = svgNoeud('g', {'class':'mja-bruyant', transform:'translate(' + q.x.toFixed(0) + ',' + q.y.toFixed(0) + ')'}, gBr); q.g.innerHTML = BRUYANTS[q.type]; bruyants.push(q); break;
        }
      }
    }
    /* Gardes */
    var gardes = [], G = p.gardes;
    for(var j = 0; j < G; j++){
      var gap = fixe(Math.round((j + 0.5) * R / G + 0.3), 0, R);
      var y = (ry(gap) + ry(gap + 1)) / 2, gd;
      var typ = (p.guet && j === G - 1 && G >= 2) ? 'guet' : (p.boucle && j === 0 && R >= 3 ? 'boucle' : 'ronde');
      if(typ === 'guet'){ var cote = Math.random() < .5 ? 1 : -1; gd = {type:'guet', x:cote > 0 ? 30 : 330, y:y, base:cote > 0 ? 0 : Math.PI, amp:1.0, w:U.rand(0.7, 1.1), tg:U.rand(0, 6), pts:null}; gd.ang = gd.base; }
      else if(typ === 'boucle'){ var g2 = Math.min(R, gap + 1), ya = y, yb = (ry(g2) + ry(g2 + 1)) / 2; if(Math.abs(yb - ya) < 20) yb = ya - 60; gd = {type:'boucle', pts:[{x:44, y:ya}, {x:316, y:ya}, {x:316, y:yb}, {x:44, y:yb}], i:1, x:44, y:ya}; gd.ang = 0; }
      else { gd = {type:'ronde', pts:[{x:40, y:y}, {x:320, y:y}], i:Math.random() < .5 ? 0 : 1, x:U.rand(80, 280), y:y}; gd.ang = gd.i ? 0 : Math.PI; }
      gd.etat = gd.type === 'guet' ? 'guet' : 'marche'; gd.t = 0; gd.phase = U.rand(0, 6); gd.alerte = 0;
      gd.cone = svgNoeud('path', {'class':'mja-cone'}, gCones);
      gd.g = svgNoeud('g', {'class':'mja-garde'}, gG);
      gd.g.innerHTML = '<ellipse cx="0" cy="5" rx="15" ry="6" fill="#000" opacity=".35"/><g class="mja-corps-garde"><circle r="14" fill="#3a5a9a" stroke="' + CONTOUR + '" stroke-width="4"/><circle r="8" fill="#26345e" stroke="' + CONTOUR + '" stroke-width="3"/><path d="M2,-12 L12,-6" stroke="' + CONTOUR + '" stroke-width="4" stroke-linecap="round"/><circle class="mja-lanterne" cx="18" cy="0" r="6.5" fill="#ffd36a" stroke="' + CONTOUR + '" stroke-width="3"/></g><text class="mja-alerte" x="0" y="-22" text-anchor="middle">!</text><text class="mja-doute" x="0" y="-22" text-anchor="middle">?</text>';
      gd.corps = gd.g.querySelector('.mja-corps-garde');
      gardes.push(gd);
    }
    /* Mouvement d'un garde (aléa = false pour les prévisions) */
    function tourner(gd, cible, dt, vit){ var d = angleNorm(cible - gd.ang); gd.ang += fixe(d, -vit * dt, vit * dt); }
    function majGarde(gd, dt, alea){
      var v = p.vitesse;
      if(gd.alerte > 0){ gd.alerte -= dt; return; }
      gd.phase += dt;
      if(gd.etat === 'guet'){ gd.tg += dt * gd.w; if(alea && p.imprevu && Math.random() < p.imprevu * dt * 0.6) gd.w = U.rand(0.5, 1.4); gd.ang = gd.base + Math.sin(gd.tg) * gd.amp; return; }
      if(gd.etat === 'marche'){
        var c = gd.pts[gd.i], dx = c.x - gd.x, dy = c.y - gd.y, dd = Math.sqrt(dx * dx + dy * dy);
        tourner(gd, Math.atan2(dy, dx), dt, 5);
        if(dd < v * dt + 0.5){ gd.x = c.x; gd.y = c.y; gd.etat = 'pause'; gd.t = p.pause * (alea ? U.rand(0.6, 1.4) : 1); gd.base = gd.ang; gd.phase = 0; gd.i = (gd.i + 1) % gd.pts.length; }
        else { gd.x += dx / dd * v * dt; gd.y += dy / dd * v * dt; }
        if(alea && p.imprevu && Math.random() < p.imprevu * dt){ gd.etat = 'pause'; gd.t = U.rand(0.5, 0.9); gd.base = gd.ang + Math.PI; gd.phase = 0; if(Math.random() < 0.5 && gd.type === 'ronde') gd.i = 1 - gd.i; }
      } else if(gd.etat === 'pause'){
        gd.t -= dt; tourner(gd, gd.base + Math.sin(gd.phase * 2.6) * 0.9, dt, 6);
        if(gd.t <= 0) gd.etat = 'marche';
      } else if(gd.etat === 'enquete'){
        var ex = gd.bruit.x - gd.x, ey = gd.bruit.y - gd.y, ed = Math.sqrt(ex * ex + ey * ey);
        tourner(gd, Math.atan2(ey, ex), dt, 6);
        if(ed < 30){ gd.etat = 'regarde'; gd.t = 2; gd.base = gd.ang; gd.phase = 0; }
        else { gd.x += ex / ed * v * 1.3 * dt; gd.y += ey / ed * v * 1.3 * dt; }
      } else if(gd.etat === 'regarde'){
        gd.t -= dt; gd.ang = gd.base + Math.sin(gd.phase * 3) * 1.4;
        if(gd.t <= 0){ gd.etat = 'marche'; var best = 0; gd.pts.forEach(function(q, i){ if(dist(q, gd) < dist(gd.pts[best], gd)) best = i; }); gd.i = best; }
      }
    }
    function voit(gd, pt, marge){
      var dx = pt.x - gd.x, dy = pt.y - gd.y, d = Math.sqrt(dx * dx + dy * dy);
      if(d < 24) return true;
      if(d > p.faisceau * (marge || 1)) return false;
      return Math.abs(angleNorm(Math.atan2(dy, dx) - gd.ang)) < 0.55 * (marge || 1) + (marge > 1 ? 0.1 : 0);
    }
    function bruit(x, y, rayon, quoi){
      var q = pctDans(svg, terrain, x, y); flotter(terrain, q.x, q.y, quoi, 'ko');
      gardes.forEach(function(gd){ if(gd.type !== 'guet' && dist(gd, {x:x, y:y}) < rayon && gd.alerte <= 0){ gd.etat = 'enquete'; gd.bruit = {x:x, y:y}; gd.g.classList.add('doute'); P.apres(1600, function(){ gd.g.classList.remove('doute'); }); }
        else if(gd.type === 'guet' && dist(gd, {x:x, y:y}) < rayon){ gd.base = Math.atan2(y - gd.y, x - gd.x); gd.tg = 0; } });
    }
    /* Joueur */
    var ici = couv[0], dep = cachetteDe(ici), jx = dep.x, jy = dep.y, course = null, fini = false, restant = p.duree, invisT = 0, invisUtilise = false;
    function accessibles(){ return couv.filter(function(c){ return c !== ici && dist(c, ici) <= p.portee && c.k >= ici.k - 1; }); }
    function majAnneaux(){
      var acc = course ? [] : accessibles();
      couv.forEach(function(c){ var a = acc.indexOf(c) >= 0; c.an.classList.toggle('on', a); c.acc = a; });
    }
    majAnneaux();
    function dureeCourse(a, b){ return dist(a, b) / p.course; }
    /* où sera la charrette dans tt secondes (elle rebondit entre 56 et 304) */
    function charretteDans(c, tt){
      var x = c.x + c.dir * c.v * tt;
      for(var r = 0; r < 6 && (x < 56 || x > 304); r++) x = x > 304 ? 608 - x : 112 - x;
      return {x:x, y:c.y, charrette:true};
    }
    function surPredit(c){
      var a = {x:jx, y:jy}, b = cachetteDe(c), T = dureeCourse(a, b);
      var copies = gardes.map(function(gd){ return Object.assign({}, gd); });
      for(var tt = 0; tt <= T + 0.1; tt += 0.05){
        /* même élan que la vraie course (lente au départ, rapide au milieu) ; la charrette continue de rouler */
        var k = Math.min(1, tt / T), e = k < .5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2, bb = c.charrette ? cachetteDe(charretteDans(c, tt)) : b;
        var pt = {x:a.x + (bb.x - a.x) * e, y:a.y + (bb.y - a.y) * e};
        /* passer sur des feuilles ou une flaque quand un garde est tout près : il se retourne vers toi */
        for(var j = 0; j < bruyants.length; j++){ if(dist(bruyants[j], pt) < 26 && copies.some(function(gd){ return dist(gd, bruyants[j]) < 200; })) return false; }
        for(var i = 0; i < copies.length; i++){ if(copies[i].alerte <= 0 && voit(copies[i], pt, 1.15)) return false; majGarde(copies[i], 0.05, false); }
      }
      return true;
    }
    function courir(c){
      if(fini || course) return;
      var a = {x:jx, y:jy};
      course = {a:a, c:c, t:0, T:dureeCourse(a, cachetteDe(c)), retour:false, bruit:{}};
      U.son('pas');
      majAnneaux();
    }
    if(btnI) P.ecoute(btnI, 'click', function(){ if(invisUtilise || fini) return; invisUtilise = true; invisT = p.invisible; btnI.disabled = true; U.son('magie'); });
    P.ecoute(svg, 'pointerdown', function(e){
      if(fini) return;
      e.preventDefault();
      var pt = ptSVG(svg, e);
      var best = null, bd = 48;
      couv.forEach(function(c){ var d = dist(pt, c); if(d < bd){ bd = d; best = c; } });
      if(!best || best === ici) return;
      if(best.acc) courir(best);
      else { secouer(best.g); var q = pctDans(svg, terrain, best.x, best.y - 30); flotter(terrain, q.x, q.y, 'Trop loin !', 'ko'); }
    });
    terrain.mjaEtat = function(){ return {ici:couv.indexOf(ici), course:!!course, couv:couv.map(function(c, i){ return {i:i, acc:!!c.acc, sur:c.acc ? surPredit(c) : false, k:c.k, porte:!!c.porte, x:c.x, y:c.y}; })}; };
    terrain.mjaCourir = function(i){ if(couv[i] && couv[i].acc) courir(couv[i]); };

    function repere(gd){
      vies--; hud.perdVie(vies, maxVies);
      erreurSensorielle(terrain);
      gd.alerte = 1.2; gd.g.classList.add('alerte'); P.apres(1200, function(){ gd.g.classList.remove('alerte'); });
      var q = pctDans(svg, terrain, jx, jy - 26); flotter(terrain, q.x, q.y, 'Repéré !', 'ko');
      if(vies <= 0){ fini = true; P.finir({reussi:false, score:ici.k / (R + 1), erreurs:maxVies, detail:'Le garde t\'a vu…'}, 900); return; }
      course = {a:{x:jx, y:jy}, c:ici, t:0, T:0.35, retour:true, bruit:{}};
    }
    var majAnneauxT = 0;
    P.boucle(function(dt){
      if(fini) return false;
      restant -= dt;
      hud.temps(restant / p.duree);
      if(restant <= 0){ fini = true; P.finir({reussi:false, score:ici.k / (R + 1), detail:'Le jour se lève… trop tard !'}, 600); return false; }
      if(invisT > 0){ invisT -= dt; if(invisT <= 0 && btnI) btnI.textContent = '👻'; }
      joueur.classList.toggle('invisible', invisT > 0);
      /* charrette */
      couv.forEach(function(c){
        if(!c.charrette) return;
        c.x += c.dir * c.v * dt;
        if(c.x < 56 || c.x > 304){ c.dir = -c.dir; c.x = fixe(c.x, 56, 304); }
        placer(c);
      });
      /* gardes */
      gardes.forEach(function(gd){
        majGarde(gd, dt, true);
        var L = p.faisceau, h = 0.55;
        var x1 = gd.x + Math.cos(gd.ang - h) * L, y1 = gd.y + Math.sin(gd.ang - h) * L, x2 = gd.x + Math.cos(gd.ang + h) * L, y2 = gd.y + Math.sin(gd.ang + h) * L;
        gd.cone.setAttribute('d', 'M' + gd.x.toFixed(1) + ',' + gd.y.toFixed(1) + ' L' + x1.toFixed(1) + ',' + y1.toFixed(1) + ' A' + L.toFixed(0) + ',' + L.toFixed(0) + ' 0 0 1 ' + x2.toFixed(1) + ',' + y2.toFixed(1) + ' Z');
        gd.cone.classList.toggle('alerte', gd.alerte > 0);
        gd.g.setAttribute('transform', 'translate(' + gd.x.toFixed(1) + ',' + gd.y.toFixed(1) + ')');
        gd.corps.setAttribute('transform', 'rotate(' + (gd.ang * 57.3).toFixed(1) + ')');
      });
      /* joueur */
      if(course){
        if(course.c.charrette && !course.retour){ var bb = cachetteDe(course.c); course.b = bb; } else course.b = cachetteDe(course.c);
        course.t += dt / course.T;
        var k = Math.min(1, course.t), e = course.retour ? k : (k < .5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2);
        jx = course.a.x + (course.b.x - course.a.x) * e; jy = course.a.y + (course.b.y - course.a.y) * e;
        if(!course.retour){
          bruyants.forEach(function(q, i){ if(!course.bruit[i] && dist(q, {x:jx, y:jy}) < 26){ course.bruit[i] = true; U.son(q.type === 'flaque' ? 'plouf' : 'pas'); bruit(q.x, q.y, 200, q.type === 'flaque' ? 'Splash !' : 'Crac !'); } });
          if(invisT <= 0){ for(var i = 0; i < gardes.length; i++){ if(gardes[i].alerte <= 0 && voit(gardes[i], {x:jx, y:jy})){ repere(gardes[i]); break; } } }
        }
        if(!fini && course && course.t >= 1){
          if(!course.retour){
            ici = course.c;
            U.son('ok');
            hud.barre(ici.k / (R + 1));
            if(ici.porte){ fini = true; ici.g.classList.add('ouverte'); U.son('porte'); P.finir({reussi:true, score:1, erreurs:maxVies - vies, detail:'Personne ne t\'a vu !'}, 900); }
          }
          course = null;
          majAnneaux();
        }
      } else if(ici.charrette){ var cc = cachetteDe(ici); jx = cc.x; jy = cc.y; majAnneauxT += dt; if(majAnneauxT > 0.2){ majAnneauxT = 0; majAnneaux(); } }
      joueur.setAttribute('transform', 'translate(' + jx.toFixed(1) + ',' + jy.toFixed(1) + ')');
      joueur.classList.toggle('cache', !course);
      /* aide : vert si on peut y aller maintenant */
      if(p.aide && !course){ couv.forEach(function(c){ if(c.acc){ var s = surPredit(c); c.an.classList.toggle('sur', s); c.an.classList.toggle('danger', !s); } }); }
    });
    return {arreter: P.arreter};
  }
});
