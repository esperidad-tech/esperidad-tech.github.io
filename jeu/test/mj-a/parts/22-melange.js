
/* ==========================================================
   MÉLANGE (Alchimiste) — obtenir la couleur de la fiole modèle
   en versant des gouttes de rouge, jaune, bleu (puis lait de lune
   pour éclaircir et charbon pour assombrir). Les proportions
   comptent : 3 rouges + 1 jaune ≠ 2 rouges + 1 jaune. Le chaudron
   déborde si on verse trop ; « Vider » recommence ; « Goûter »
   vérifie (un essai de moins si c'est faux). Sablier.
   Mods compris : erreurs (+essais), zone (tolérance de couleur plus
   large), temps (+N s) et lent (sablier plus long), aide (N manches : la première couleur de la
   recette brille), revele (la recette s'affiche sous la fiole).
   params.recettes (facultatif) : [{rouge:1, jaune:1}, …] imposées.
   ========================================================== */
var ORDRE_PIG = ['rouge', 'jaune', 'bleu', 'blanc', 'noir'];
function recetteAuHasard(n){
  var nbCouleurs = n <= 2 ? 2 : (n <= 4 ? U.randInt(2, 3) : 3);
  var gouttes = Math.max(nbCouleurs, entier(n, {1:2, 3:4, 6:6, 9:8, 12:9}));
  var choix = U.melanger(['rouge', 'jaune', 'bleu']).slice(0, nbCouleurs);
  var r = {};
  choix.forEach(function(c){ r[c] = 1; });
  var reste = gouttes - nbCouleurs;
  if(n >= 5 && Math.random() < 0.6 && reste > 0){ r.blanc = 1; reste--; }
  if(n >= 8 && Math.random() < 0.5 && reste > 0){ r.noir = 1; reste--; }
  while(reste > 0){ var c = U.choix(choix); r[c]++; reste--; }
  /* pas de proportions « 1:1:1 » simplifiables à 1 goutte : la couleur doit demander de la précision */
  return r;
}
function gouttesTotal(r){ var s = 0; for(var k in r) s += r[k]; return s; }
function recetteTexte(r){ return ORDRE_PIG.filter(function(c){ return r[c]; }).map(function(c){ return r[c] + '×' + PIGMENTS[c].n.toLowerCase(); }).join(' + '); }
function conseilMelange(recette, comptes, n){
  var tr = gouttesTotal(recette), tc = gouttesTotal(comptes) || 1, pire = null, ecart = 0;
  ORDRE_PIG.forEach(function(c){ var d = (recette[c] || 0) / tr - (comptes[c] || 0) / tc; if(d > ecart){ ecart = d; pire = c; } });
  if(n <= 3 && pire) return 'Il manque du ' + PIGMENTS[pire].n.toLowerCase() + ' !';
  if(n <= 6){ var a = couleurMelange(recette), b = couleurMelange(comptes), la = (a[0] + a[1] + a[2]) / 3, lb = (b[0] + b[1] + b[2]) / 3; if(Math.abs(la - lb) > 0.08) return la > lb ? 'Trop sombre !' : 'Trop clair !'; return 'Pas la bonne teinte…'; }
  return 'Pas encore…';
}
function fioleSVG(couleur, cls){
  return '<g class="' + (cls || '') + '"><path d="M-10,-44 L10,-44 L10,-22 C30,-14 34,6 30,18 C24,36 -24,36 -30,18 C-34,6 -30,-14 -10,-22 Z" fill="#dfe6ff" fill-opacity=".25" stroke="' + CONTOUR + '" stroke-width="4"/>' +
    '<path class="mja-fiole-liq" d="M-26,4 C-12,0 12,8 26,4 C28,14 26,22 22,26 C12,34 -12,34 -22,26 C-26,22 -28,14 -26,4 Z" fill="' + couleur + '"/>' +
    '<rect x="-13" y="-52" width="26" height="10" rx="3" fill="#b8862e" stroke="' + CONTOUR + '" stroke-width="3"/>' +
    '<path d="M-18,-8 C-22,0 -22,8 -18,14" stroke="#fff" stroke-width="4" fill="none" stroke-linecap="round" opacity=".6"/></g>';
}
MJ.enregistrer('melange', {
  nom:'Le bon mélange', role:'alchimiste', ic:'🎨',
  consigne:'Verse des gouttes de couleur dans le chaudron pour obtenir la même couleur que la fiole, puis goûte !',
  minuteur:false,
  reglages: function(n, mods){
    var p = {};
    p.manches = entier(n, {1:1, 2:2, 8:2, 9:3});
    p.tolerance = courbe(n, {1:0.085, 3:0.055, 6:0.036, 9:0.026, 12:0.02}) * (mods.zone || 1);
    p.erreurs = erreursPermises(n, mods, {1:3, 3:2, 6:1, 9:1});
    p.blanc = n >= 5;
    p.noir = n >= 8;
    p.marge = entier(n, {1:5, 3:4, 6:3, 9:2});
    p.duree = Math.round(courbe(n, {1:100, 3:75, 6:60, 9:48}) / (mods.lent || 1) + (mods.temps || 0));
    p.jauge = n <= 4 || !!mods.revele;
    p.compteur = n <= 5 || !!mods.revele;
    p.revele = !!mods.revele;
    p.aide = mods.aide || 0;
    p.niveauRecette = n;
    p.lignes = [
      {nom:'Couleurs à préparer', val:String(p.manches)},
      {nom:'Gouttes dans une recette', val:String(Math.max(2, entier(n, {1:2, 3:4, 6:6, 9:8, 12:9})))},
      {nom:'Ingrédients', val:'rouge, jaune, bleu' + (p.blanc ? ', lait de lune' : '') + (p.noir ? ', charbon' : '')},
      {nom:'Précision demandée', val:Math.round(100 - p.tolerance * 100) + ' %'},
      {nom:'Sablier', val:p.duree + ' s'},
      {nom:'Essais ratés permis', val:String(p.erreurs)}
    ];
    return p;
  },
  demo: function(el){
    var d = demoScene(el, '<rect width="300" height="170" rx="14" fill="#1f2547"/>');
    d.contenu.innerHTML = '<g transform="translate(42,92) scale(.8)">' + fioleSVG('#2fa84a') + '</g>' +
      '<g transform="translate(150,120) scale(.5)">' + chaudronSVG() + '</g>' +
      '<g transform="translate(240,50)"><circle r="16" fill="#3f7fe0" stroke="' + CONTOUR + '" stroke-width="3"/></g><g transform="translate(240,100)"><circle r="16" fill="#f6d23a" stroke="' + CONTOUR + '" stroke-width="3"/></g>' +
      '<circle class="mja-goutte-demo" r="6" cx="150" cy="40" fill="#3f7fe0" opacity="0"/>';
    var liq = d.contenu.querySelector('.mja-liquide'), gt = d.contenu.querySelector('.mja-goutte-demo');
    function goutte(c){ gt.setAttribute('fill', c); gt.style.transition = 'none'; gt.style.opacity = '1'; gt.style.transform = 'translate(0,0)'; void gt.getBoundingClientRect(); gt.style.transition = 'transform .4s ease-in, opacity .1s .38s'; gt.style.transform = 'translate(0,70px)'; gt.style.opacity = '0'; }
    return scenario([
      [10, function(){ liq.style.fill = '#8a9ac6'; d.vers(270, 150, 0); }],
      [300, function(){ d.vers(240, 56); }],
      [600, function(){ d.tape(); goutte('#3f7fe0'); }],
      [450, function(){ liq.style.fill = '#3f7fe0'; U.son('plouf'); d.vers(240, 106); }],
      [600, function(){ d.tape(); goutte('#f6d23a'); }],
      [450, function(){ liq.style.fill = '#2fa84a'; U.son('plouf'); }],
      [600, function(){ U.son('ok'); }]
    ], 800);
  },
  jouer: function(el, p, fin){
    var P = Partie(fin);
    var vies = p.erreurs + 1, maxVies = vies;
    var hud = creerHud(el);
    hud.vies(vies, maxVies); hud.prog(0, p.manches, '🎨');
    var terrain = U.html('<div class="mja-terrain mja-melange"></div>');
    el.appendChild(terrain);
    var pigs = ORDRE_PIG.filter(function(c){ return c === 'blanc' ? p.blanc : (c === 'noir' ? p.noir : true); });
    terrain.innerHTML = '<svg viewBox="0 0 360 400" preserveAspectRatio="xMidYMid meet">' +
      '<g class="mja-etagere-m"><rect x="10" y="226" width="120" height="12" rx="4" fill="#8a5a33" stroke="' + CONTOUR + '" stroke-width="3"/></g>' +
      '<g class="mja-modele" transform="translate(70,170) scale(1.35)"></g>' +
      '<text class="mja-recette" x="70" y="262" text-anchor="middle"></text>' +
      '<g transform="translate(236,300) scale(1.05)">' + chaudronSVG({feu:true}) + '</g>' +
      '<g class="mja-points" transform="translate(236,372)"></g>' +
      '<g class="mja-gouttes"></g>' +
      '<g class="mja-jauge" transform="translate(236,52)"><rect x="-80" y="-11" width="160" height="22" rx="11" fill="#1d2240" stroke="' + CONTOUR + '" stroke-width="3"/><rect class="mja-jauge-v" x="-77" y="-8" width="10" height="16" rx="8"/><text x="0" y="-18" text-anchor="middle" class="mja-jauge-t">ressemblance</text></g>' +
    '</svg>' +
    '<div class="mja-pigments">' + pigs.map(function(c){ return '<button class="mja-pig" type="button" data-c="' + c + '" style="--pc:' + PIGMENTS[c].c + '" aria-label="' + PIGMENTS[c].n + '"><span></span></button>'; }).join('') + '</div>' +
    '<div class="mja-actions"><button class="btn second mja-vider" type="button">♻️ Vider</button><button class="btn grand mja-gouter" type="button">👅 Goûter</button></div>';
    var svg = terrain.querySelector('svg');
    var liq = svg.querySelector('.mja-liquide'), gG = svg.querySelector('.mja-gouttes'), jauge = svg.querySelector('.mja-jauge'), jaugeV = svg.querySelector('.mja-jauge-v'), gPts = svg.querySelector('.mja-points');
    var modele = svg.querySelector('.mja-modele'), txtRec = svg.querySelector('.mja-recette');
    if(!p.jauge) jauge.style.display = 'none';
    var manche = 0, comptes = {}, recette = null, cible = null, fini = false, restant = p.duree, enChute = 0;
    var maxGouttes = 0;
    function nouvelleManche(){
      recette = (p.recettes && p.recettes[manche]) ? p.recettes[manche] : recetteAuHasard(p.niveauRecette + manche);
      if(!p.blanc) delete recette.blanc;
      if(!p.noir) delete recette.noir;
      cible = couleurMelange(recette);
      maxGouttes = gouttesTotal(recette) + p.marge;
      modele.innerHTML = fioleSVG(rgbCss(cible), 'mja-fiole-modele');
      txtRec.textContent = p.revele ? recetteTexte(recette) : '';
      vider(true);
    }
    function majAide(){
      terrain.querySelectorAll('.mja-pig').forEach(function(b){ b.classList.remove('indice'); });
      if(manche < p.aide && gouttesTotal(comptes) === 0){
        var premiere = ORDRE_PIG.filter(function(c){ return recette[c]; })[0];
        var b = terrain.querySelector('.mja-pig[data-c="' + premiere + '"]');
        if(b) b.classList.add('indice');
      }
    }
    function majCouleur(){
      var tot = gouttesTotal(comptes);
      var rgb = tot ? couleurMelange(comptes) : [0.55, 0.62, 0.78];
      liq.style.fill = rgbCss(rgb);
      var e = tot ? ecartCouleur(rgb, cible) : 0.5;
      var ress = fixe(1 - e / 0.45, 0, 1);
      jaugeV.setAttribute('width', (10 + ress * 144).toFixed(1));
      jaugeV.classList.toggle('chaud', e < p.tolerance);
      terrain.querySelectorAll('.mja-pig').forEach(function(b){ b.disabled = tot + enChute >= maxGouttes; });
      /* petits points : les gouttes versées */
      if(p.compteur){
        var s = '', i = 0, liste = [];
        ORDRE_PIG.forEach(function(c){ for(var k = 0; k < (comptes[c] || 0); k++) liste.push(c); });
        var w = Math.min(14, 150 / Math.max(1, maxGouttes));
        for(i = 0; i < maxGouttes; i++) s += '<circle cx="' + ((i - (maxGouttes - 1) / 2) * w).toFixed(1) + '" r="' + (w * 0.36).toFixed(1) + '" fill="' + (liste[i] ? PIGMENTS[liste[i]].c : '#2b2f55') + '" stroke="' + CONTOUR + '" stroke-width="1.5"/>';
        gPts.innerHTML = s;
      }
    }
    function vider(silence){
      comptes = {};
      majCouleur();
      if(!silence){ U.son('plouf'); liq.classList.remove('vide'); void liq.getBoundingClientRect(); liq.classList.add('vide'); }
      majAide();
    }
    terrain.querySelectorAll('.mja-pig').forEach(function(b){
      P.ecoute(b, 'click', function(){
        if(fini) return;
        var c = b.getAttribute('data-c');
        if(gouttesTotal(comptes) + enChute >= maxGouttes) return;
        enChute++;
        var g = svgNoeud('circle', {r:7, cx:236, cy:150, fill:PIGMENTS[c].c, stroke:CONTOUR, 'stroke-width':2, 'class':'mja-goutte'}, gG);
        P.apres(380, function(){
          if(g.parentNode) g.parentNode.removeChild(g);
          enChute--;
          comptes[c] = (comptes[c] || 0) + 1;
          U.son('plouf');
          bullesDansChaudron(svg.querySelector('.mja-bulles-ch'), 3, PIGMENTS[c].c);
          var tb = svg.querySelector('.mja-tourbillon'); tb.classList.remove('remue'); void tb.getBoundingClientRect(); tb.classList.add('remue');
          majCouleur(); majAide();
          if(gouttesTotal(comptes) >= maxGouttes){ var q = pctDans(svg, terrain, 236, 250); flotter(terrain, q.x, q.y, 'C\'est plein !', 'ko'); }
        });
      });
    });
    P.ecoute(terrain.querySelector('.mja-vider'), 'click', function(){ if(!fini) vider(false); });
    P.ecoute(terrain.querySelector('.mja-gouter'), 'click', function(){
      if(fini || !gouttesTotal(comptes) || enChute) return;
      var e = ecartCouleur(couleurMelange(comptes), cible);
      var q = pctDans(svg, terrain, 236, 240);
      if(e < p.tolerance){
        manche++;
        hud.prog(manche, p.manches, '🎨');
        U.son('ok');
        liq.classList.add('brille');
        flotter(terrain, q.x, q.y, 'Parfait !', 'ok');
        if(manche >= p.manches){ fini = true; P.finir({reussi:true, score:1, erreurs:maxVies - vies, detail:'C\'est exactement la bonne couleur !'}, 900); }
        else P.apres(1000, function(){ liq.classList.remove('brille'); annonce(terrain, '✨ Une autre couleur !', 900); nouvelleManche(); });
      } else {
        vies--; hud.perdVie(vies, maxVies);
        erreurSensorielle(terrain);
        flotter(terrain, q.x, q.y, conseilMelange(recette, comptes, p.niveauRecette), 'ko');
        if(vies <= 0){ fini = true; P.finir({reussi:false, score:manche / p.manches, erreurs:maxVies, detail:'La potion a une drôle de couleur…'}, 900); }
      }
    });
    terrain.mjaEtat = function(){ return {recette:recette, comptes:comptes}; };
    P.boucle(function(dt){
      if(fini) return false;
      restant -= dt;
      hud.temps(restant / p.duree);
      if(restant <= 0){ fini = true; P.finir({reussi:false, score:manche / p.manches, detail:'Le sablier est vide…'}, 600); return false; }
    });
    nouvelleManche();
    return {arreter: P.arreter};
  }
});
