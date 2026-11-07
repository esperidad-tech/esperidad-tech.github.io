
/* ==========================================================
   BULLES (Alchimiste) — mémoire : les bulles magiques s'allument
   dans un ordre (avec une note chacune), puis on le refait.
   Plusieurs manches : la suite s'allonge à chaque manche. Plus loin :
   les bulles ÉCHANGENT leurs places juste avant ton tour (retiens
   les couleurs, pas les places !), une manche se joue À L'ENVERS ⏪,
   et les bulles flottent pendant que tu joues.
   Mods compris : erreurs (+vies), lent et temps (montre plus lentement),
   zone (les bulles bougent moins souvent),
   aide (N fois le bouton « Revoir »), revele (la bonne bulle luit
   doucement pendant qu'on joue).
   ========================================================== */
var BULLES_DEF = [
  {c:'#e5484d', f:523, s:'<path d="M0,9 C-10,2 -12,-4 -8,-8 C-5,-11 -1,-10 0,-6 C1,-10 5,-11 8,-8 C12,-4 10,2 0,9 Z"/>'},
  {c:'#3f7fe0', f:587, s:'<path d="M0,-11 C6,-3 9,2 9,5 C9,10 5,13 0,13 C-5,13 -9,10 -9,5 C-9,2 -6,-3 0,-11 Z"/>'},
  {c:'#f6d23a', f:659, s:'<path d="M0,-11 L3,-3 L11,-3 L5,2 L7,10 L0,5 L-7,10 L-5,2 L-11,-3 L-3,-3 Z"/>'},
  {c:'#4fbf6a', f:784, s:'<path d="M-9,9 C-11,-4 -2,-11 10,-10 C11,2 4,10 -9,9 Z M-9,9 L4,-4" />'},
  {c:'#9d6ee3', f:880, s:'<path d="M4,-11 C-6,-10 -11,-2 -9,5 C-7,11 2,13 8,9 C1,8 -4,2 -2,-5 C-1,-8 1,-10 4,-11 Z"/>'},
  {c:'#f08a3c', f:1047, s:'<path d="M0,12 C-8,10 -10,2 -6,-4 C-6,0 -3,1 -2,0 C-4,-6 0,-10 3,-12 C3,-6 9,-3 8,4 C8,9 4,12 0,12 Z"/>'},
  {c:'#ef7fa8', f:1175, s:'<path d="M0,-11 L3,-4 L10,-6 L5,0 L10,6 L3,4 L0,11 L-3,4 L-10,6 L-5,0 L-10,-6 L-3,-4 Z"/>'},
  {c:'#8ff3ff', f:1319, s:'<path d="M0,-11 L9,0 L0,11 L-9,0 Z"/>'}
];
function placesBulles(N){
  var pos = [], i;
  if(N <= 5){
    var R = 118;
    for(i = 0; i < N; i++){
      var a = -Math.PI / 2 + (i - (N - 1) / 2) * (Math.PI * 1.15 / Math.max(1, N - 1)) * (N <= 4 ? 1.05 : 1);
      pos.push({x:180 + Math.cos(a) * R * 1.25, y:250 + Math.sin(a) * R});
    }
  } else {
    var h = Math.ceil(N / 2), b = N - h;
    for(i = 0; i < h; i++) pos.push({x:180 + (i - (h - 1) / 2) * 84, y:128});
    for(i = 0; i < b; i++) pos.push({x:180 + (i - (b - 1) / 2) * 84, y:222});
  }
  return pos;
}
MJ.enregistrer('bulles', {
  nom:'Les bulles magiques', role:'alchimiste', ic:'🫧',
  consigne:'Regarde l\'ordre dans lequel les bulles s\'allument, puis touche-les dans le même ordre.',
  minuteur:false,
  reglages: function(n, mods){
    var p = {};
    p.bulles = entier(n, {1:4, 3:5, 6:6, 9:7, 12:8});
    p.manches = entier(n, {1:2, 3:3, 6:3, 9:4});
    p.longueur = entier(n, {1:3, 3:4, 6:5, 9:6, 12:7});
    p.intervalle = (courbe(n, {1:0.9, 3:0.68, 6:0.5, 9:0.38, 12:0.32}) + 0.08 * Math.min(4, mods.temps || 0)) / (mods.lent || 1);
    p.melange = courbe(n, {1:0, 4:0, 5:0.5, 6:1}) / Math.pow(mods.zone || 1, 3);
    p.envers = n >= 7;
    p.flotte = n >= 8;
    p.erreurs = erreursPermises(n, mods, {1:2, 3:1, 6:1, 9:0});
    p.revoir = mods.aide || 0;
    p.revele = !!mods.revele;
    p.lignes = [
      {nom:'Bulles', val:String(p.bulles)},
      {nom:'Longueur de la suite', val:p.longueur + ' → ' + (p.longueur + p.manches - 1)},
      {nom:'Vitesse', val:txtS(p.intervalle) + ' par bulle'},
      {nom:'Pièges', val:[p.melange >= 1 ? 'les bulles changent de place' : (p.melange > 0 ? 'parfois, les bulles changent de place' : ''), p.envers ? 'une manche à l\'envers ⏪' : '', p.flotte ? 'bulles qui flottent' : ''].filter(Boolean).join(', ') || 'aucun'},
      {nom:'Erreurs permises', val:String(p.erreurs)}
    ];
    return p;
  },
  demo: function(el){
    var d = demoScene(el, '<rect width="300" height="170" rx="14" fill="#1f2547"/>');
    var pos = [[90,70],[150,50],[210,70]];
    d.contenu.innerHTML = pos.map(function(q, i){ var b = BULLES_DEF[i]; return '<g class="mja-bulle-demo" transform="translate(' + q[0] + ',' + q[1] + ')"><circle r="22" fill="' + b.c + '" stroke="' + CONTOUR + '" stroke-width="3"/><g fill="#fff" opacity=".85">' + b.s + '</g></g>'; }).join('');
    var bs = d.contenu.querySelectorAll('.mja-bulle-demo');
    function allume(i){ bs[i].classList.add('allume'); setTimeout(function(){ bs[i].classList.remove('allume'); }, 380); }
    var ordre = [2, 0, 1];
    var et = [[10, function(){ d.vers(260, 150, 0); }]];
    ordre.forEach(function(i){ et.push([550, function(){ allume(i); }]); });
    ordre.forEach(function(i){ et.push([500, function(){ d.vers(pos[i][0], pos[i][1] + 6, 380); }]); et.push([420, function(){ d.tape(); allume(i); }]); });
    return scenario(et, 900);
  },
  jouer: function(el, p, fin){
    var P = Partie(fin);
    var vies = p.erreurs + 1, maxVies = vies;
    var hud = creerHud(el);
    hud.vies(vies, maxVies); hud.prog(0, p.manches, '🫧');
    var terrain = U.html('<div class="mja-terrain mja-bulles"></div>');
    el.appendChild(terrain);
    var N = p.bulles, positions = placesBulles(N);
    terrain.innerHTML = '<svg viewBox="0 0 360 480" preserveAspectRatio="xMidYMid meet">' +
      '<g transform="translate(180,385) scale(1.3)">' + chaudronSVG() + '</g>' +
      '<g class="mja-vapeur"><path d="M150,330 C130,300 170,280 150,250" /><path d="M210,330 C230,300 190,280 210,250"/></g>' +
      positions.map(function(q, i){ var b = BULLES_DEF[i]; return '<g class="mja-bulle" data-i="' + i + '"><g class="mja-bulle-in"><circle class="mja-halo" r="44" fill="' + b.c + '"/><circle r="34" fill="' + b.c + '" stroke="' + CONTOUR + '" stroke-width="4"/><ellipse cx="-11" cy="-13" rx="9" ry="6" fill="#fff" opacity=".55"/><g fill="#fff" stroke="' + CONTOUR + '" stroke-width="1.5" transform="scale(1.35)">' + b.s + '</g></g></g>'; }).join('') +
    '</svg>' +
    '<div class="mja-actions"><span class="mja-etat"></span>' + (p.revoir ? '<button class="btn second mja-revoir" type="button">👁 Revoir (' + p.revoir + ')</button>' : '') + '</div>';
    var svg = terrain.querySelector('svg');
    cadrer(P, svg);
    svg.querySelector('.mja-liquide').style.fill = '#b48cff';
    var bulles = Array.prototype.slice.call(svg.querySelectorAll('.mja-bulle'));
    var place = bulles.map(function(b, i){ return i; });   /* place[i] = index de position de la bulle i */
    function poser(anime){
      bulles.forEach(function(b, i){
        var q = positions[place[i]];
        b.style.transition = anime ? 'transform .55s cubic-bezier(.5,-0.3,.4,1.3)' : 'none';
        b.style.transform = 'translate(' + q.x.toFixed(1) + 'px,' + q.y.toFixed(1) + 'px)';
      });
    }
    poser(false);
    var etat = terrain.querySelector('.mja-etat'), br = terrain.querySelector('.mja-revoir');
    var suite = [];
    for(var k = 0; k < p.longueur + p.manches - 1; k++){
      var v; do { v = U.randInt(0, N - 1); } while(k > 0 && v === suite[k - 1] && Math.random() < 0.75);
      suite.push(v);
    }
    var manche = 0, pos = 0, phase = 'attente', fini = false, revoirs = p.revoir, envers = false, flotteT = 0;
    function longueur(){ return p.longueur + manche; }
    function attendu(){ var L = longueur(); return suite[envers ? L - 1 - pos : pos]; }
    function allumer(i, ms){
      var b = bulles[i]; b.classList.add('allume');
      note(BULLES_DEF[i].f, 0.35);
      P.apres(ms || 360, function(){ b.classList.remove('allume'); });
    }
    function montrer(){
      phase = 'montre'; pos = 0;
      envers = p.envers && manche === p.manches - 1;
      terrain.classList.add('montre');
      terrain.classList.toggle('envers', envers);
      etat.textContent = '👀';
      indice();
      var L = longueur();
      for(var i = 0; i < L; i++){
        (function(i){ P.apres(600 + i * p.intervalle * 1000, function(){ allumer(suite[i], Math.min(420, p.intervalle * 750)); }); })(i);
      }
      var fin0 = 600 + L * p.intervalle * 1000 + 200;
      var bouge = Math.random() < p.melange;
      if(bouge){
        P.apres(fin0, function(){ melanger(); annonce(terrain, '🔀 Elles bougent !', 900); });
        fin0 += 800;
      }
      P.apres(fin0, function(){ phase = 'joue'; terrain.classList.remove('montre'); etat.textContent = envers ? '⏪' : '👆'; annonce(terrain, envers ? '⏪ À l\'envers !' : '👆 À toi !', 900); indice(); });
    }
    function melanger(){
      var nv;
      do { nv = U.melanger(place); } while(N > 2 && nv.some(function(v, i){ return v === place[i]; }) && Math.random() < 0.85);
      place = nv; poser(true); U.son('bulle');
    }
    function indice(){
      bulles.forEach(function(b){ b.classList.remove('indice'); });
      if(p.revele && phase === 'joue' && pos < longueur()){ var i = attendu(); if(bulles[i]) bulles[i].classList.add('indice'); }
    }
    if(br) P.ecoute(br, 'click', function(){ if(phase !== 'joue' || revoirs <= 0) return; revoirs--; br.textContent = '👁 Revoir (' + revoirs + ')'; if(!revoirs) br.disabled = true; montrer(); });
    terrain.mjaEtat = function(){ return {phase:phase, attendu:phase === 'joue' ? attendu() : -1}; };
    P.ecoute(svg, 'pointerdown', function(e){
      if(phase !== 'joue' || fini) return;
      var g = e.target.closest ? e.target.closest('.mja-bulle') : null;
      if(!g) return;
      e.preventDefault();
      var i = +g.getAttribute('data-i');
      allumer(i, 260);
      if(i === attendu()){
        pos++;
        indice();
        if(pos >= longueur()){
          phase = 'attente';
          manche++;
          hud.prog(manche, p.manches, '🫧');
          bullesDansChaudron(svg.querySelector('.mja-bulles-ch'), 8, '#e6d6ff');
          if(manche >= p.manches){ fini = true; U.son('ok'); P.finir({reussi:true, score:1, erreurs:maxVies - vies, detail:'Quelle mémoire !'}, 900); }
          else { U.son('ok'); annonce(terrain, '✨ Une bulle de plus !', 1000); P.apres(1300, montrer); }
        }
      } else {
        vies--; hud.perdVie(vies, maxVies);
        erreurSensorielle(terrain);
        g.classList.add('faux'); P.apres(500, function(){ g.classList.remove('faux'); });
        if(vies <= 0){ fini = true; phase = 'fini'; P.finir({reussi:false, score:manche / p.manches, erreurs:maxVies, detail:'Les bulles ont éclaté…'}, 900); }
        else { phase = 'attente'; annonce(terrain, '👀 Regarde encore…', 900); P.apres(1200, montrer); }
      }
    });
    if(p.flotte) P.boucle(function(dt){
      if(fini) return false;
      if(phase !== 'joue') return;
      flotteT += dt;
      bulles.forEach(function(b, i){
        var q = positions[place[i]], dx = Math.sin(flotteT * 0.9 + i * 1.7) * 16, dy = Math.cos(flotteT * 1.1 + i * 2.3) * 12;
        b.style.transition = 'none';
        b.style.transform = 'translate(' + (q.x + dx).toFixed(1) + 'px,' + (q.y + dy).toFixed(1) + 'px)';
      });
    });
    P.apres(400, montrer);
    return {arreter: P.arreter};
  }
});
