
/* ==========================================================
   RYTHME (Alchimiste) — le chaudron vu du dessus : la cuillère
   tourne autour. Touche quand elle passe sur une goutte dorée.
   Si elle passe une goutte sans que tu touches, c'est raté aussi !
   À chaque goutte prise, la cuillère repart dans l'autre sens et
   va un peu plus vite. Plus loin : plusieurs gouttes à la fois,
   gouttes de poison 💀 à ne PAS toucher, vitesse qui varie.
   Mods : erreurs (+vies), zone (gouttes plus larges), lent et temps (cuillère
   plus lente), aide (N premières gouttes : elle brille quand c'est
   le moment), revele (toujours), params.couleur (couleur potion).
   ========================================================== */
function bullesDansChaudron(gB, n, couleur){
  for(var i = 0; i < n; i++){
    var c = svgNoeud('circle', {cx:U.rand(-55, 55).toFixed(0), cy:'-16', r:U.rand(3, 8).toFixed(1), 'class':'mja-bulle-ch', fill:couleur || '#bff9ff'}, gB);
    c.style.animationDelay = (i * 0.08) + 's';
    (function(c){ setTimeout(function(){ if(c.parentNode) c.parentNode.removeChild(c); }, 1400); })(c);
  }
}
var GAMME = [523, 587, 659, 698, 784, 880, 988, 1047, 1175, 1319];
function chaudronDessus(id, couleur){
  return '<defs><radialGradient id="' + id + 'f" cx=".42" cy=".38" r=".7"><stop offset="0" stop-color="#5a5078"/><stop offset=".6" stop-color="#2b2540"/><stop offset="1" stop-color="#14111f"/></radialGradient>' +
    '<radialGradient id="' + id + 'l" cx=".45" cy=".4" r=".65"><stop offset="0" stop-color="#fff" stop-opacity=".35"/><stop offset=".5" stop-color="#fff" stop-opacity="0"/></radialGradient></defs>' +
    '<circle r="152" fill="#000" opacity=".3" cy="10"/>' +
    '<circle r="148" fill="url(#' + id + 'f)" stroke="' + CONTOUR + '" stroke-width="6"/>' +
    '<circle r="134" fill="none" stroke="#6b6290" stroke-width="3" opacity=".5"/>' +
    '<circle class="mja-liq-dessus" r="128" fill="' + couleur + '" stroke="' + CONTOUR + '" stroke-width="4"/>' +
    '<g class="mja-remous"><path d="M-80,-20 C-60,-70 20,-90 60,-50 M-40,40 C0,70 70,50 90,0 M-20,-10 C0,-30 30,-20 30,0" stroke="#fff" stroke-opacity=".35" stroke-width="6" fill="none" stroke-linecap="round"/></g>' +
    '<circle r="128" fill="url(#' + id + 'l)"/>';
}
MJ.enregistrer('rythme', {
  nom:'Remuer en rythme', role:'alchimiste', ic:'🥄',
  consigne:'Touche l\'écran quand la cuillère passe sur une goutte dorée, sans en laisser filer une seule !',
  minuteur:false,
  reglages: function(n, mods){
    var p = {};
    p.coups = entier(n, {1:6, 3:10, 6:14, 9:18, 12:22});
    p.vitesse = courbe(n, {1:90, 3:126, 6:172, 9:225, 12:265}) * (mods.lent || 1) / (1 + 0.06 * Math.min(5, mods.temps || 0));
    p.accel = courbe(n, {1:1.0, 3:1.009, 6:1.016, 9:1.022});
    p.largeur = courbe(n, {1:17, 3:13, 6:9.5, 9:7, 12:6}) * (mods.zone || 1);
    p.inverse = n >= 2;
    p.gouttes = n >= 9 ? 3 : (n >= 5 ? 2 : 1);
    p.poisons = n >= 8 ? 2 : (n >= 4 ? 1 : 0);
    p.variation = n >= 7 ? courbe(n, {7:0.1, 12:0.22}) : 0;
    p.erreurs = erreursPermises(n, mods);
    p.aide = mods.aide || 0;
    p.revele = !!mods.revele;
    p.couleur = '#7cc4ff';
    p.lignes = [
      {nom:'Gouttes à attraper', val:String(p.coups)},
      {nom:'Vitesse de la cuillère', val:Math.round(p.vitesse / 36) + ' / 10' + (p.inverse ? ', change de sens' : '')},
      {nom:'Taille des gouttes', val:p.largeur >= 14 ? 'grosses' : (p.largeur >= 9 ? 'moyennes' : 'toutes petites')},
      {nom:'Pièges', val:(p.gouttes > 1 ? p.gouttes + ' gouttes à la fois' : '') + (p.poisons ? (p.gouttes > 1 ? ', ' : '') + p.poisons + ' poison 💀' : '') || 'aucun'},
      {nom:'Erreurs permises', val:String(p.erreurs)}
    ];
    return p;
  },
  demo: function(el){
    el.innerHTML = '<svg class="mja-demo-svg" viewBox="0 0 300 170" preserveAspectRatio="xMidYMid meet"><g transform="translate(150,85) scale(.52)">' + chaudronDessus(nid('rd'), '#7cc4ff') +
      '<path class="mja-goutte-arc" d="" stroke-width="22"/><g class="dc"><path d="M0,-22 L0,-96" stroke="' + CONTOUR + '" stroke-width="14" stroke-linecap="round"/><path d="M0,-22 L0,-96" stroke="#c99a5e" stroke-width="8" stroke-linecap="round"/><ellipse cx="0" cy="-112" rx="14" ry="19" fill="#d9b48a" stroke="' + CONTOUR + '" stroke-width="5"/></g></g>' + MAIN + '</svg>';
    var svg = el.querySelector('svg'), c = svg.querySelector('.dc'), arc = svg.querySelector('.mja-goutte-arc'), main = svg.querySelector('.mja-main');
    var cible = 1.2;
    function arcD(a, hw){ var R = 112, x1 = Math.sin(a - hw) * R, y1 = -Math.cos(a - hw) * R, x2 = Math.sin(a + hw) * R, y2 = -Math.cos(a + hw) * R; return 'M' + x1.toFixed(1) + ',' + y1.toFixed(1) + ' A' + R + ',' + R + ' 0 0 1 ' + x2.toFixed(1) + ',' + y2.toFixed(1); }
    arc.setAttribute('d', arcD(cible, 0.25));
    var a = -0.6, dir = 1, tape = 0;
    main.style.transition = 'none'; main.style.transform = 'translate(250px,140px)';
    return demoBoucle(svg, function(dt){
      a += dir * 1.6 * dt;
      if(Math.abs(angleNorm(a - cible)) < 0.06 && tape <= 0){ tape = 0.5; main.classList.remove('tape'); void main.getBoundingClientRect(); main.classList.add('tape'); dir = -dir; cible = a + dir * U.rand(1.6, 3.4); arc.setAttribute('d', arcD(cible, 0.25)); }
      if(tape > 0) tape -= dt;
      c.setAttribute('transform', 'rotate(' + (a * 57.3).toFixed(1) + ')');
    });
  },
  jouer: function(el, p, fin){
    var P = Partie(fin);
    var vies = p.erreurs + 1, maxVies = vies;
    var hud = creerHud(el);
    hud.vies(vies, maxVies); hud.prog(0, p.coups, '💧');
    var terrain = U.html('<div class="mja-terrain mja-rythme"></div>');
    el.appendChild(terrain);
    var id = nid('ry'), R = 112, couleur = p.couleur || '#7cc4ff';
    terrain.innerHTML = '<svg viewBox="0 0 360 480" preserveAspectRatio="xMidYMid meet"><g transform="translate(180,236)">' + chaudronDessus(id, couleur) +
      '<circle r="' + R + '" fill="none" stroke="#fff" stroke-opacity=".22" stroke-width="2" stroke-dasharray="3 9"/>' +
      '<g class="mja-gouttes-r"></g><g class="mja-eclabousse"></g>' +
      '<g class="mja-cuillere"><path d="M0,-18 L0,' + (-R + 18) + '" stroke="' + CONTOUR + '" stroke-width="14" stroke-linecap="round"/><path d="M0,-18 L0,' + (-R + 18) + '" stroke="#c99a5e" stroke-width="8" stroke-linecap="round"/><path d="M-2,-30 L-2,' + (-R + 26) + '" stroke="#e6c08a" stroke-width="2" stroke-linecap="round"/>' +
        '<ellipse cx="0" cy="' + (-R) + '" rx="13" ry="18" fill="#d9b48a" stroke="' + CONTOUR + '" stroke-width="5"/><ellipse cx="-3" cy="' + (-R - 4) + '" rx="5" ry="8" fill="#f0d4a8"/></g>' +
      '<circle r="20" fill="#2b2540" stroke="' + CONTOUR + '" stroke-width="4"/><text class="mja-combo" y="7" text-anchor="middle"></text>' +
    '</g></svg>' +
    '<div class="mja-actions"><button class="btn grand mja-remuer" type="button">🥄 Remue !</button></div>';
    var svg = terrain.querySelector('svg');
    cadrer(P, svg);
    var gG = svg.querySelector('.mja-gouttes-r'), cuil = svg.querySelector('.mja-cuillere'), liq = svg.querySelector('.mja-liq-dessus'), gE = svg.querySelector('.mja-eclabousse'), combo = svg.querySelector('.mja-combo');
    var hw = p.largeur * Math.PI / 180, omega = p.vitesse * Math.PI / 180;
    var a = 0, dir = 1, faits = 0, serie = 0, fini = false, t = 0, depart = 0.9, gouttes = [];
    function arcD(ang, w){ var x1 = Math.sin(ang - w) * R, y1 = -Math.cos(ang - w) * R, x2 = Math.sin(ang + w) * R, y2 = -Math.cos(ang + w) * R; return 'M' + x1.toFixed(1) + ',' + y1.toFixed(1) + ' A' + R + ',' + R + ' 0 0 1 ' + x2.toFixed(1) + ',' + y2.toFixed(1); }
    function libre(ang){ return gouttes.every(function(g){ return Math.abs(angleNorm(g.ang - ang)) > hw * 3 + 0.25; }) && Math.abs(angleNorm(ang - a)) > 0.9; }
    function placer(g){
      for(var k = 0; k < 40; k++){
        var ang = a + dir * U.rand(1.25, 5.2);
        if(libre(ang)){ g.ang = ang; break; }
      }
      g.dedans = false;
      g.arc.setAttribute('d', arcD(g.ang, hw));
      g.ic.setAttribute('transform', 'translate(' + (Math.sin(g.ang) * R).toFixed(1) + ',' + (-Math.cos(g.ang) * R).toFixed(1) + ')');
      g.el.classList.remove('nait'); void g.el.getBoundingClientRect(); g.el.classList.add('nait');
    }
    function creer(poison){
      var g = {poison:poison, ang:0};
      g.el = svgNoeud('g', {'class':'mja-goutte-r' + (poison ? ' poison' : '')}, gG);
      g.arc = svgNoeud('path', {'class':'mja-goutte-arc'}, g.el);
      g.ic = svgNoeud('g', {'class':'mja-goutte-ic'}, g.el);
      g.ic.innerHTML = poison ? '<circle r="11" fill="#5a2a7a" stroke="' + CONTOUR + '" stroke-width="3"/><path d="M-5,-2 C-5,-8 5,-8 5,-2 C5,1 3,2 3,4 L-3,4 C-3,2 -5,1 -5,-2 Z" fill="#eef0ff"/><circle cx="-2" cy="-2" r="1.4" fill="#5a2a7a"/><circle cx="2" cy="-2" r="1.4" fill="#5a2a7a"/>'
        : '<path d="M0,-12 C6,-4 9,1 9,4 C9,9 5,12 0,12 C-5,12 -9,9 -9,4 C-9,1 -6,-4 0,-12 Z" fill="#ffd36a" stroke="' + CONTOUR + '" stroke-width="3"/><path d="M-4,2 C-4,5 -2,7 1,7" stroke="#fff" stroke-width="2" fill="none" opacity=".7"/>';
      gouttes.push(g);
      placer(g);
      return g;
    }
    for(var i = 0; i < p.gouttes; i++) creer(false);
    for(var j = 0; j < p.poisons; j++) creer(true);
    function eclabousser(ang, coul){
      var x = Math.sin(ang) * R, y = -Math.cos(ang) * R;
      for(var k = 0; k < 8; k++){
        var c = svgNoeud('circle', {cx:x.toFixed(1), cy:y.toFixed(1), r:U.rand(3, 6).toFixed(1), fill:coul, 'class':'mja-giclee'}, gE);
        var aa = U.rand(0, 6.28), d = U.rand(18, 40);
        c.style.setProperty('--dx', (Math.cos(aa) * d).toFixed(0) + 'px'); c.style.setProperty('--dy', (Math.sin(aa) * d).toFixed(0) + 'px');
        (function(c){ setTimeout(function(){ if(c.parentNode) c.parentNode.removeChild(c); }, 600); })(c);
      }
    }
    function rate(texte){
      vies--; hud.perdVie(vies, maxVies); serie = 0; combo.textContent = '';
      erreurSensorielle(terrain);
      liq.classList.remove('rouge'); void liq.getBoundingClientRect(); liq.classList.add('rouge');
      var q = pctDans(svg, terrain, 180 + Math.sin(a) * R, 236 - Math.cos(a) * R - 30); flotter(terrain, q.x, q.y, texte, 'ko');
      if(vies <= 0){ fini = true; P.finir({reussi:false, score:faits / p.coups, erreurs:maxVies, detail:'La potion a tourné…'}, 900); }
    }
    function remuer(){
      if(fini || depart > 0) return;
      var bonne = null, poison = null;
      gouttes.forEach(function(g){ if(Math.abs(angleNorm(a - g.ang)) <= hw){ if(g.poison) poison = g; else bonne = g; } });
      if(bonne){
        faits++; serie++;
        hud.prog(faits, p.coups, '💧');
        note(GAMME[Math.min(GAMME.length - 1, serie - 1)], 0.25);
        U.vibrer(15);
        eclabousser(bonne.ang, '#ffd36a');
        liq.classList.remove('flash'); void liq.getBoundingClientRect(); liq.classList.add('flash');
        combo.textContent = serie > 1 ? '×' + serie : '';
        if(faits >= p.coups){ fini = true; U.son('ok'); liq.classList.add('brille'); P.finir({reussi:true, score:1, erreurs:maxVies - vies, detail:'La potion est parfaitement mélangée !'}, 900); return; }
        if(p.inverse) dir = -dir;
        omega *= p.accel;
        placer(bonne);
        gouttes.forEach(function(g){ if(g.poison && Math.random() < 0.5) placer(g); });
      } else if(poison){ eclabousser(poison.ang, '#9d6ee3'); rate('Poison !'); placer(poison); }
      else rate('Splatch !');
    }
    P.ecoute(terrain.querySelector('.mja-remuer'), 'pointerdown', function(e){ e.preventDefault(); remuer(); });
    P.ecoute(svg, 'pointerdown', function(e){ e.preventDefault(); remuer(); });
    P.ecoute(document, 'keydown', function(e){ if((e.key === ' ' || e.key === 'Enter') && !e.repeat){ e.preventDefault(); remuer(); } });
    terrain.mjaEtat = function(){ return {a:a, hw:hw, dir:dir, w:omega * (1 + p.variation * Math.sin(t * 1.3)), gouttes:gouttes.map(function(g){ return {ang:g.ang, poison:g.poison}; }), depart:depart}; };
    annonce(terrain, '🥄 Prêt ?', 900);
    P.boucle(function(dt){
      if(fini) return false;
      t += dt;
      if(depart > 0){ depart -= dt; }
      else {
        var w = omega * (1 + p.variation * Math.sin(t * 1.3));
        a += dir * w * dt;
      }
      cuil.setAttribute('transform', 'rotate(' + (a * 57.3).toFixed(2) + ')');
      for(var i = 0; i < gouttes.length; i++){
        var g = gouttes[i], rel = angleNorm(a - g.ang) * dir;
        var dedans = Math.abs(rel) <= hw;
        g.el.classList.toggle('maintenant', dedans && !g.poison && (p.revele || faits < p.aide));
        if(dedans) g.dedans = true;
        else if(g.dedans && rel > hw && rel < hw + 0.6){
          g.dedans = false;
          if(!g.poison){ rate('Trop tard !'); if(fini) return false; placer(g); }
        } else if(rel < -hw) g.dedans = false;
      }
    });
    return {arreter: P.arreter};
  }
});
