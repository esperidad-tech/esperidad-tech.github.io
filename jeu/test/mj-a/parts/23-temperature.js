
/* ==========================================================
   TEMPÉRATURE (Alchimiste) — garder la potion à la bonne chaleur :
   garder le doigt sur « Chauffer » fait monter l'aiguille, lâcher la
   fait redescendre, avec de l'inertie (ça continue un peu sur sa
   lancée). La zone verte BOUGE (la recette dérive), des courants
   d'air 💨 refroidissent et les braises 🔥 s'emballent (annoncés
   juste avant). Il faut cumuler N secondes dans la zone ; plus loin,
   le compteur redescend quand on en sort. Trop chaud : ça déborde.
   Aux niveaux 7+, la zone n'est plus dessinée : il faut lire les
   bulles (rares = froid, régulières = bon, bouillons = trop chaud).
   Mods compris : erreurs (+vies), zone (zone plus large), lent
   (aiguille plus lente), temps (+N s au sablier), revele (la zone
   reste affichée et l'aiguille clignote quand il faut lâcher),
   aide (idem, et le compteur ne redescend plus hors de la zone).
   ========================================================== */
MJ.enregistrer('temperature', {
  nom:'Dosage et température', role:'alchimiste', ic:'🌡️',
  consigne:'Garde ton doigt sur le bouton 🔥 pour chauffer et lâche-le pour refroidir : reste dans la zone verte, même quand elle bouge !',
  minuteur:true,
  reglages: function(n, mods){
    var p = {};
    p.largeur = fixe(courbe(n, {1:0.3, 3:0.21, 6:0.15, 9:0.11, 12:0.09}) * (mods.zone || 1), 0.06, 0.6);
    p.requis = entier(n, {1:5, 3:8, 6:11, 9:14, 12:16});
    p.duree = Math.round(p.requis * courbe(n, {1:2.4, 3:2.0, 6:1.7, 9:1.45}) + (mods.temps || 0));
    p.vitesse = courbe(n, {1:0.3, 3:0.36, 6:0.42, 9:0.5}) * (mods.lent || 1);
    p.inertie = courbe(n, {1:0.15, 3:0.32, 6:0.5, 9:0.7});
    p.derive = courbe(n, {1:0, 2:0, 3:0.08, 6:0.16, 9:0.22});
    p.deriveW = courbe(n, {1:0.3, 3:0.35, 9:0.62});
    p.coups = courbe(n, {1:0, 2:0.07, 6:0.2, 9:0.3});
    p.perte = courbe(n, {1:0, 4:0, 5:0.3, 9:0.7});
    p.zoneVisible = n <= 6 || !!mods.revele || !!mods.aide;
    p.aide = !!(mods.aide || mods.revele);
    if(mods.aide) p.perte = 0;
    p.erreurs = erreursPermises(n, mods);
    p.lignes = [
      {nom:'Temps à tenir dans la zone', val:p.requis + ' s'},
      {nom:'Sablier', val:p.duree + ' s'},
      {nom:'Largeur de la zone', val:pct(p.largeur)},
      {nom:'La zone bouge', val:p.derive > 0.12 ? 'beaucoup' : (p.derive > 0 ? 'un peu' : 'non')},
      {nom:'Courants d\'air et braises', val:p.coups > 0.15 ? 'souvent' : (p.coups > 0 ? 'parfois' : 'non')},
      {nom:'Zone affichée', val:p.zoneVisible ? 'oui' : 'non : regarde les bulles'},
      {nom:'Erreurs permises', val:String(p.erreurs)}
    ];
    if(p.perte > 0) p.lignes.splice(1, 0, {nom:'Hors de la zone', val:'le compteur redescend'});
    return p;
  },
  demo: function(el){
    var d = demoScene(el, '<rect width="300" height="170" rx="14" fill="#1f2547"/><rect x="246" y="20" width="22" height="120" rx="11" fill="#1d2240" stroke="' + CONTOUR + '" stroke-width="3"/><rect x="249" y="50" width="16" height="34" fill="#4fbf6a" opacity=".8"/>');
    d.contenu.innerHTML = '<g transform="translate(130,110) scale(.55)">' + chaudronSVG({feu:true}) + '</g><rect class="mja-niv-demo" x="251" y="120" width="12" height="16" rx="6" fill="#e8693c"/><rect x="60" y="140" width="110" height="24" rx="12" fill="#e8693c" stroke="' + CONTOUR + '" stroke-width="3"/><text x="115" y="157" text-anchor="middle" font-size="13" font-weight="700" fill="#fff">Chauffer</text>';
    var niv = d.contenu.querySelector('.mja-niv-demo'), feu = d.contenu.querySelector('.mja-feu');
    function hauteur(h, ms){ niv.style.transition = 'transform ' + (ms || 0) + 'ms ease-in-out'; niv.style.transform = 'translate(0,' + (-h) + 'px)'; niv.style.transformBox = 'fill-box'; }
    return scenario([
      [10, function(){ hauteur(0); d.vers(260, 160, 0); feu.classList.remove('fort'); }],
      [200, function(){ d.vers(115, 150); }],
      [600, function(){ d.appuie(true); feu.classList.add('fort'); hauteur(62, 1300); }],
      [1300, function(){ d.appuie(false); feu.classList.remove('fort'); hauteur(52, 600); U.son('ok'); }],
      [900, function(){ }]
    ], 600);
  },
  jouer: function(el, p, fin){
    var P = Partie(fin);
    var vies = p.erreurs + 1, maxVies = vies;
    var hud = creerHud(el);
    hud.vies(vies, maxVies);
    var terrain = U.html('<div class="mja-terrain mja-temperature"></div>');
    el.appendChild(terrain);
    var H0 = 70, H1 = 400;
    terrain.innerHTML = '<svg viewBox="0 0 360 480" preserveAspectRatio="xMidYMid meet">' +
      '<g class="mja-souffle" opacity="0"><path d="M-40,250 C0,236 40,264 90,248 M-50,290 C-10,276 30,304 80,288 M-30,330 C10,316 50,344 100,328" stroke="#dfe6ff" stroke-width="5" fill="none" stroke-linecap="round"/></g>' +
      '<g transform="translate(150,360) scale(1.45)">' + chaudronSVG({feu:true}) + '</g>' +
      '<g class="mja-vapeur"><path d="M120,250 C100,220 140,200 120,170"/><path d="M180,250 C200,220 160,200 180,170"/></g>' +
      '<g class="mja-thermo"><rect x="300" y="' + (H0 - 12) + '" width="40" height="' + (H1 - H0 + 24) + '" rx="20" fill="#1d2240" stroke="' + CONTOUR + '" stroke-width="5"/>' +
      '<rect class="mja-zone-v" x="306" y="100" width="28" height="40" rx="6"/>' +
      '<rect class="mja-rouge" x="306" y="' + H0 + '" width="28" height="' + ((H1 - H0) * 0.06).toFixed(0) + '" rx="6"/>' +
      '<rect class="mja-colonne" x="312" y="200" width="16" height="200" rx="8"/>' +
      '<circle cx="320" cy="' + (H1 + 26) + '" r="20" fill="#e8693c" stroke="' + CONTOUR + '" stroke-width="5"/>' +
      '<path class="mja-aiguille" d="M292,0 L276,-9 L276,9 Z"/></g>' +
      '<g class="mja-cercle" transform="translate(150,90)"><circle r="34" fill="#1d2240" stroke="' + CONTOUR + '" stroke-width="5"/><circle class="mja-cercle-v" r="26" fill="none" stroke="#4fbf6a" stroke-width="9" stroke-dasharray="0 999" transform="rotate(-90)"/><text class="mja-cercle-t" y="8" text-anchor="middle">0</text></g>' +
    '</svg>' +
    '<div class="mja-actions"><button class="btn grand danger mja-chauffer" type="button">🔥 Chauffer</button></div>';
    var svg = terrain.querySelector('svg');
    cadrer(P, svg);
    var col = svg.querySelector('.mja-colonne'), aig = svg.querySelector('.mja-aiguille'), zoneV = svg.querySelector('.mja-zone-v'), cercle = svg.querySelector('.mja-cercle-v'), cercleT = svg.querySelector('.mja-cercle-t');
    var feu = svg.querySelector('.mja-feu'), liq = svg.querySelector('.mja-liquide'), gB = svg.querySelector('.mja-bulles-ch'), btn = terrain.querySelector('.mja-chauffer'), souffle = svg.querySelector('.mja-souffle');
    liq.style.fill = '#6fd3a8';
    if(!p.zoneVisible) zoneV.style.opacity = '0';
    var z0 = U.rand(0.4, 0.72 - p.largeur / 2), z = z0, v = 0.12, vit = 0, chauffe = false, dedansT = 0, restant = p.duree, fini = false, bulleT = 0, t = 0, ph = U.rand(0, 6);
    var evt = null, prochainEvt = p.coups ? U.rand(2, 1 / p.coups + 2) : 1e9;
    function yDe(f){ return H1 - f * (H1 - H0); }
    function placeZone(){ zoneV.setAttribute('y', yDe(z + p.largeur).toFixed(1)); zoneV.setAttribute('height', (p.largeur * (H1 - H0)).toFixed(1)); }
    placeZone();
    function presser(e){ if(e) e.preventDefault(); if(fini) return; chauffe = true; btn.classList.add('presse'); feu.classList.add('fort'); }
    function relacher(){ chauffe = false; btn.classList.remove('presse'); feu.classList.remove('fort'); }
    P.ecoute(btn, 'pointerdown', presser);
    P.ecoute(window, 'pointerup', relacher); P.ecoute(window, 'pointercancel', relacher);
    P.ecoute(btn, 'pointerleave', relacher);
    P.ecoute(document, 'keydown', function(e){ if(e.key === ' ' && !e.repeat){ presser(e); } });
    P.ecoute(document, 'keyup', function(e){ if(e.key === ' '){ relacher(); } });
    P.ecoute(btn, 'contextmenu', function(e){ e.preventDefault(); });
    terrain.mjaEtat = function(){ return {v:v, vit:vit, z:z, l:p.largeur, chauffe:chauffe}; };
    P.boucle(function(dt){
      if(fini) return false;
      t += dt;
      restant -= dt;
      hud.temps(restant / p.duree);
      /* la zone dérive */
      if(p.derive){ z = fixe(z0 + Math.sin(t * p.deriveW + ph) * p.derive + Math.sin(t * p.deriveW * 2.3 + ph * 2) * p.derive * 0.35, 0.1, 0.9 - p.largeur); placeZone(); }
      /* courants d'air et braises : annoncés 0,8 s avant, puis poussent 1,3 s */
      prochainEvt -= dt;
      if(!evt && prochainEvt <= 0){
        evt = {type:Math.random() < 0.5 ? 'air' : 'braise', t:0};
        var q = pctDans(svg, terrain, 150, 200);
        flotter(terrain, q.x, q.y, evt.type === 'air' ? '💨 Courant d\'air !' : '🔥 Les braises !', '');
      }
      var force = 0;
      if(evt){
        evt.t += dt;
        if(evt.t > 0.8){ force = (evt.type === 'air' ? -1 : 1) * p.vitesse * 1.1; }
        souffle.setAttribute('opacity', evt.type === 'air' && evt.t > 0.5 ? '0.5' : '0');
        souffle.setAttribute('transform', 'translate(' + ((evt.t * 160) % 120).toFixed(0) + ',0)');
        feu.classList.toggle('emballe', evt.type === 'braise' && evt.t > 0.5);
        if(evt.t > 2.1){ evt = null; souffle.setAttribute('opacity', '0'); feu.classList.remove('emballe'); prochainEvt = U.rand(0.6, 1.4) / p.coups; }
      }
      /* dynamique : la vitesse cible dépend du feu, avec de l'inertie */
      var cibleV = (chauffe ? p.vitesse : -p.vitesse * 0.8) + force;
      vit += (cibleV - vit) * Math.min(1, dt / p.inertie);
      v = fixe(v + vit * dt, 0, 1);
      var dedans = v >= z && v <= z + p.largeur;
      if(dedans) dedansT += dt; else dedansT = Math.max(0, dedansT - dt * p.perte);
      var frac = Math.min(1, dedansT / p.requis);
      cercle.setAttribute('stroke-dasharray', (frac * 163.4).toFixed(1) + ' 999');
      cercleT.textContent = Math.ceil(Math.max(0, p.requis - dedansT));
      /* dessin */
      var y = yDe(v);
      col.setAttribute('y', y.toFixed(1)); col.setAttribute('height', (H1 + 10 - y).toFixed(1));
      aig.setAttribute('transform', 'translate(0,' + y.toFixed(1) + ')');
      var etat = v > z + p.largeur ? 'chaud' : (dedans ? 'bon' : 'froid');
      terrain.setAttribute('data-etat', etat);
      aig.classList.toggle('lache', p.aide && dedans && chauffe && v > z + p.largeur * 0.6);
      /* bulles : peu si froid, régulières si bon, beaucoup si trop chaud */
      bulleT -= dt;
      if(bulleT <= 0){
        var nb = etat === 'chaud' ? 5 : (etat === 'bon' ? 2 : (v > z - 0.12 ? 1 : 0));
        if(nb) bullesDansChaudron(gB, nb, etat === 'chaud' ? '#ffb38a' : '#d6fff0');
        if(etat === 'bon' && Math.random() < 0.3) U.son('bulle');
        bulleT = etat === 'chaud' ? 0.18 : 0.45;
      }
      liq.style.fill = etat === 'chaud' ? '#ff8a6a' : (etat === 'bon' ? '#6fd3a8' : '#7aa7c9');
      if(v >= 0.97){
        vies--; hud.perdVie(vies, maxVies);
        erreurSensorielle(terrain);
        var q2 = pctDans(svg, terrain, 150, 260); flotter(terrain, q2.x, q2.y, 'Ça déborde !', 'ko');
        liq.classList.remove('eclabousse'); void liq.getBoundingClientRect(); liq.classList.add('eclabousse');
        v = z * 0.6; vit = 0;
        if(vies <= 0){ fini = true; relacher(); P.finir({reussi:false, score:frac, erreurs:maxVies, detail:'La potion a débordé…'}, 900); return false; }
      }
      if(dedansT >= p.requis){ fini = true; relacher(); U.son('ok'); liq.classList.add('brille'); P.finir({reussi:true, score:1, erreurs:maxVies - vies, detail:'La cuisson est parfaite !'}, 900); return false; }
      if(restant <= 0){ fini = true; relacher(); P.finir({reussi:false, score:frac, detail:'Le sablier est vide…'}, 600); return false; }
    });
    return {arreter: P.arreter};
  }
});
