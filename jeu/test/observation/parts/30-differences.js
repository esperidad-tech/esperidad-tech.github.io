
/* ==========================================================
   LES 7 DIFFÉRENCES (Alchimiste) — remplace « loupe ».
   Deux images côte à côte (l'une sous l'autre en portrait) ; toucher une
   différence sur l'une OU l'autre l'entoure sur les deux. Une mauvaise
   touche coûte un cœur. 10 décors (params.theme), cueillette d'un
   ingrédient rare (params.ingredient : il est dessiné plusieurs fois dans
   la scène et l'écran de victoire dit « Tu as trouvé … ! »).
   Mods : zone (zones de touche plus grandes), temps (+N s), lent (sablier
   plus long), erreurs (+N cœurs), aide (N indices 💡 : une différence
   clignote), revele (les différences scintillent doucement), facile (cœur).
   ========================================================== */
function txtDuree(s){ s = Math.round(s); if(s < 60) return s + ' secondes'; var m = Math.floor(s / 60), r = s % 60; return m + ' min' + (r ? ' ' + r + ' s' : ''); }
function majuscule(s){ s = String(s || ''); return s.charAt(0).toUpperCase() + s.slice(1); }
function reglagesDiff(n, mods){
  mods = mods || {};
  var p = {};
  p.differences = n <= 2 ? 5 : (n <= 4 ? 6 : 7);
  p.duree = Math.round(courbe(n, {1:120, 3:105, 6:90, 10:70, 12:60}) / (mods.lent || 1) + (mods.temps || 0));
  p.vies = Math.max(1, entier(n, {1:6, 3:5, 6:4, 9:3, 12:2}) + Math.round(mods.erreurs || 0));
  p.erreurs = p.vies - 1;
  p.niveauScene = n;
  p.marge = mods.zone || 1;
  p.indices = Math.max(0, Math.round(mods.aide || 0));
  p.revele = !!mods.revele;
  p.lignes = [
    {nom:'Différences à trouver', val:String(p.differences)},
    {nom:'Elles sont', val:n <= 2 ? 'faciles à voir 👀' : (n <= 5 ? 'un peu cachées' : (n <= 8 ? 'bien cachées' : 'très bien cachées 🔍'))},
    {nom:'Le sablier', val:txtDuree(p.duree)},
    {nom:'Tes cœurs', val:p.vies + ' ❤️'},
    {nom:'Toucher à côté', val:'coûte un cœur'}
  ];
  if(p.marge > 1) p.lignes.push({nom:'Zones à toucher', val:'plus grandes'});
  if(p.indices) p.lignes.push({nom:'Indices 💡', val:String(p.indices)});
  if(p.revele) p.lignes.push({nom:'Les différences brillent', val:'oui ✨'});
  return p;
}
/* Ajoute le lieu et l'ingrédient aux lignes de l'écran de consigne (une seule fois). */
function lignesLieu(p){
  if(!p || p._lignesObs) return;
  p._lignesObs = 1;
  var th = choisirTheme(p), ing = ingredientDe(p.ingredient);
  if(!p.lignes) p.lignes = [];
  if(p.theme || ing) p.lignes.unshift({nom:'Le lieu', val:th.ic + ' ' + th.nom});
  if(ing) p.lignes.unshift({nom:'À cueillir', val:ing.ic + ' ' + (ing.libre || majuscule(ing.art))});
}

/* Une partie de différences dans el. quandFini(res) est appelé une seule fois. */
function partieDiff(el, p, P, quandFini){
  var n = p.niveauScene || p.niveauEffectif || 3, nDiff = p.differences || 7, marge = p.marge || 1;
  var th = choisirTheme(p), ing = ingredientDe(p.ingredient);
  var scene = genererScene(th, n, nDiff, ing);
  nDiff = scene.diffs.length;
  var id = nid('mjod');
  var racine = U.html('<div class="mjo-jeu mjo-diff mjo-th-' + th.id + '" style="--fond:' + th.fondCss + '">' +
    '<div class="mjo-fond" aria-hidden="true"><svg viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice">' + th.bg(id + 'f') + '</svg></div></div>');
  el.appendChild(racine);
  var hud = creerHud(racine);
  var vies = p.vies || 3, viesMax = vies, trouvees = 0, rates = 0, restant = p.duree || 90, fini = false, indices = p.indices || 0, bloqueJusqua = 0;
  hud.vies(vies, viesMax); hud.prog(0, nDiff, '✓'); hud.temps(1);
  if(ing) hud.badge('<span class="mjo-ingr" title="À cueillir">' + ing.ic + '</span>');
  var aireEl = U.html('<div class="mjo-d-aire"><div class="mjo-d-images">' +
    '<div class="mjo-d-cadre">' + imageSVG(scene, 0, id + 'a') + '</div>' +
    '<div class="mjo-d-cadre">' + imageSVG(scene, 1, id + 'b') + '</div>' +
  '</div></div>');
  racine.appendChild(aireEl);
  var bas = null;
  if(indices || ing){
    bas = U.html('<div class="mjo-bas">' + (ing ? '<span class="mjo-cueille">' + ing.ic + ' <b></b></span>' : '') +
      (indices ? '<button class="btn magie mjo-indice" type="button">💡 × ' + indices + '</button>' : '') + '</div>');
    if(ing) bas.querySelector('.mjo-cueille b').textContent = 'À cueillir : ' + (ing.libre || ing.art);
    racine.appendChild(bas);
  }
  var images = aireEl.querySelector('.mjo-d-images'), cadres = Array.prototype.slice.call(aireEl.querySelectorAll('.mjo-d-cadre'));
  var svgs = cadres.map(function(c){ return c.querySelector('svg'); });
  function disposer(){
    var r = aireEl.getBoundingClientRect();
    if(!r.width || !r.height) return;
    var W = r.width - 12, H = r.height - 12, g = 10, pad = 12;
    var wCote = Math.min((W - g) / 2 - pad, (H - pad) * 4 / 3), wPile = Math.min(W - pad, ((H - g) / 2 - pad) * 4 / 3);
    var pile = wPile >= wCote, w = Math.max(140, Math.floor(pile ? wPile : wCote));
    images.classList.toggle('pile', pile);
    cadres.forEach(function(c){ c.style.width = (w + pad) + 'px'; c.style.height = Math.round(w * 0.75 + pad) + 'px'; });
  }
  disposer();
  P.observe(aireEl, disposer);

  function marque(d, cls){
    svgs.forEach(function(s){
      var g = svgNoeud('g', {'class':'mjo-rond ' + (cls || ''), transform:'translate(' + f1(d.x) + ',' + f1(d.y) + ')'}, s.querySelector('.mjo-d-marques'));
      g.innerHTML = '<ellipse class="mjo-rond-o" rx="' + f1(d.rx) + '" ry="' + f1(d.ry) + '" pathLength="100"/><ellipse class="mjo-rond-i" rx="' + f1(d.rx) + '" ry="' + f1(d.ry) + '" pathLength="100"/>' +
        (cls ? '' : etincelle(d.rx * 0.72, -d.ry * 0.72, 7, '#fff4c0') + etincelle(-d.rx * 0.8, d.ry * 0.5, 5, '#fff4c0'));
      d.marques = (d.marques || []).concat([g]);
    });
  }
  if(p.revele) scene.diffs.forEach(function(d){
    svgs.forEach(function(s){ var g = svgNoeud('g', {'class':'mjo-scint', transform:'translate(' + f1(d.x) + ',' + f1(d.y) + ')'}, s.querySelector('.mjo-d-marques')); g.innerHTML = etincelle(0, 0, 9, '#ffffff') + etincelle(d.rx * 0.5, -d.ry * 0.4, 5, '#bff9ff'); d.scint = (d.scint || []).concat([g]); });
  });
  function dedans(d, pt){ var dx = (pt.x - d.x) / (d.rx * marge + 4), dy = (pt.y - d.y) / (d.ry * marge + 4); return dx * dx + dy * dy <= 1; }
  function toucher(k, pt){
    if(fini) return;
    var d = null, best = 9;
    scene.diffs.forEach(function(x){ if(x.ok || !dedans(x, pt)) return; var q = Math.hypot((pt.x - x.x) / x.rx, (pt.y - x.y) / x.ry); if(q < best){ best = q; d = x; } });
    if(d){
      d.ok = true; trouvees++;
      (d.scint || []).forEach(retirer); (d.indice || []).forEach(retirer);
      marque(d);
      P.sons.ding(); U.vibrer(15);
      hud.prog(trouvees, nDiff, '✓');
      if(trouvees >= nDiff){
        fini = true;
        annonce(racine, ing ? ing.ic + ' Bravo !' : 'Bravo !', 1300);
        var res = {reussi:true, score:1, erreurs:rates, detail:'Les ' + nDiff + ' différences sont trouvées' + (rates ? ' (' + rates + ' touche' + (rates > 1 ? 's' : '') + ' à côté).' : ', sans une seule erreur !')};
        if(ing) res.message = ing.libre ? 'Tu as trouvé : ' + ing.libre + ' !' : 'Tu as trouvé ' + ing.art + ' !';
        if(ing) res.ingredient = ing.libre || ing.id;
        quandFini(res);
      }
      return;
    }
    /* touche à côté : pas de pénalité si on touche une différence déjà trouvée, ni deux fois de suite trop vite */
    if(scene.diffs.some(function(x){ return x.ok && dedans(x, pt); })) return;
    var t = performance.now();
    if(t < bloqueJusqua) return;
    bloqueJusqua = t + 450;
    rates++; vies--;
    hud.perdVie(vies, viesMax);
    U.son('ko'); U.vibrer(40);
    relancer(cadres[k], 'mjo-secoue');
    var x = svgNoeud('g', {'class':'mjo-croix', transform:'translate(' + f1(pt.x) + ',' + f1(pt.y) + ')'}, svgs[k].querySelector('.mjo-d-marques'));
    x.innerHTML = Tr('M-9,-9 L9,9 M9,-9 L-9,9', K, 7) + Tr('M-9,-9 L9,9 M9,-9 L-9,9', '#ff6b6b', 3.6);
    P.apres(750, function(){ retirer(x); });
    if(vies <= 0){ fini = true; montrerTout(); quandFini({reussi:false, score:trouvees / nDiff, erreurs:rates, detail:'Plus de cœurs… Il en restait ' + (nDiff - trouvees) + ' à trouver.'}); }
  }
  svgs.forEach(function(s, k){
    P.ecoute(s, 'pointerdown', function(e){ if(fini) return; e.preventDefault(); toucher(k, ptSVG(s, e)); });
  });
  var bi = bas && bas.querySelector('.mjo-indice');
  if(bi) P.ecoute(bi, 'click', function(){
    if(fini || indices <= 0) return;
    var reste = scene.diffs.filter(function(d){ return !d.ok; });
    if(!reste.length) return;
    indices--; bi.textContent = '💡 × ' + indices; if(!indices) bi.disabled = true;
    var d = U.choix(reste);
    P.sons.pop();
    svgs.forEach(function(s){ var g = svgNoeud('g', {'class':'mjo-indice-rond', transform:'translate(' + f1(d.x) + ',' + f1(d.y) + ')'}, s.querySelector('.mjo-d-marques')); g.innerHTML = '<ellipse rx="' + f1(d.rx + 6) + '" ry="' + f1(d.ry + 6) + '"/>'; d.indice = (d.indice || []).concat([g]); P.apres(2600, function(){ retirer(g); }); });
  });
  function montrerTout(){ scene.diffs.forEach(function(d){ if(!d.ok){ (d.scint || []).forEach(retirer); marque(d, 'manque'); } }); }
  racine.mjoEtat = function(){
    return {jeu:'differences', theme:th.id, ingredient:ing ? ing.id : null, ingrNb:scene.objs.filter(function(o){ return o.ingr; }).length, vies:vies, viesMax:viesMax, restant:restant, trouvees:trouvees,
      diffs:scene.diffs.map(function(d){ var a = versEcran(svgs[0], d.x, d.y), b = versEcran(svgs[1], d.x, d.y); return {x:d.x, y:d.y, rx:d.rx, ry:d.ry, sorte:d.sorte, objet:scene.objs[d.i].t, ok:!!d.ok, ecran:[a, b]}; }),
      rect:svgs.map(function(s){ var r = s.getBoundingClientRect(); return {x:r.left, y:r.top, w:r.width, h:r.height}; })};
  };
  P.boucle(function(dt){
    if(fini) return false;
    restant -= dt;
    hud.temps(restant / (p.duree || 90));
    if(restant <= 0){ fini = true; montrerTout(); quandFini({reussi:false, score:trouvees / nDiff, erreurs:rates, detail:'Le sablier est vide… Il en restait ' + (nDiff - trouvees) + ' à trouver.'}); return false; }
  });
  return racine;
}

MJ.enregistrer('differences', {
  nom:'Les 7 différences', role:'alchimiste', ic:'🔎',
  consigne:function(p){
    lignesLieu(p);
    var ing = ingredientDe(p && p.ingredient), nb = (p && p.differences) || 7;
    if(ing) return 'Trouve les ' + nb + ' différences entre les deux images pour cueillir ' + (ing.libre ? 'cet ingrédient rare' : ing.art) + ' ! Touche-les sur l\'une ou l\'autre image.';
    return 'Trouve les ' + nb + ' différences entre les deux images ! Touche-les sur l\'une ou l\'autre image.';
  },
  minuteur:true,
  reglages: reglagesDiff,
  themes: THEMES,
  demo: function(el, p){
    var th = choisirTheme(p), ing = ingredientDe(p && p.ingredient), id = nid('mjodd');
    var fond = '<defs><clipPath id="' + id + 'a"><rect x="14" y="16" width="130" height="104" rx="8"/></clipPath><clipPath id="' + id + 'b"><rect x="156" y="16" width="130" height="104" rx="8"/></clipPath></defs>' +
      '<g clip-path="url(#' + id + 'a)"><g transform="translate(14,16) scale(.325,.3467)">' + th.bg(id + 'x') + '</g></g>' +
      '<g clip-path="url(#' + id + 'b)"><g transform="translate(156,16) scale(.325,.3467)">' + th.bg(id + 'y') + '</g></g>' +
      Re(14, 16, 130, 104, 8, 'none', 3, ' stroke="#d29a5e"') + Re(156, 16, 130, 104, 8, 'none', 3, ' stroke="#d29a5e"');
    var d = demoScene(el, fond);
    var t1 = ing ? ing.t : 'fiole', c1 = ing ? ing.c : '#3f7fe0';
    var objs = [{t:t1, x:44, y:112, s:0.8, c:c1, d:true, n:2, v:ing ? ing.v || 0 : 0}, {t:'champignon', x:79, y:112, s:0.8, c:'#e5484d', d:true, n:1}, {t:'bougie', x:114, y:112, s:0.75, c:'#f3e7cb', d:true}];
    var objs2 = objs.map(function(o){ return Object.assign({}, o, {x:o.x + 142}); });
    objs2[1].c = '#4fbf6a';
    d.contenu.innerHTML = objs.map(dessinerObjet).join('') + objs2.map(dessinerObjet).join('') +
      '<g class="mjo-demo-ronds" opacity="0"><ellipse cx="79" cy="96" rx="20" ry="22" fill="none" stroke="#ffd36a" stroke-width="3.5"/><ellipse cx="221" cy="96" rx="20" ry="22" fill="none" stroke="#ffd36a" stroke-width="3.5"/></g>';
    var r = d.contenu.querySelector('.mjo-demo-ronds');
    return scenario(d.svg, [
      [10, function(){ r.setAttribute('opacity', '0'); d.vers(262, 150, 0); }],
      [500, function(){ d.vers(222, 104, 800); }],
      [900, function(){ d.tape(); r.setAttribute('opacity', '1'); U.son('ok'); }],
      [1300, function(){}]
    ], 600);
  },
  jouer: function(el, p, fin){
    var P = Partie(fin);
    partieDiff(el, p, P, function(res){ P.finir(res, res.reussi ? 1100 : 1600); });
    return {arreter: P.arreter};
  }
});
