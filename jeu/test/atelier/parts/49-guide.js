
/* ==========================================================
   Le guidage (pour le tutoriel de l'enquête 1) : Atelier.guider(cible, options)
   - Un rond lumineux (un anneau doré qui pulse, avec « Nouveau ! ») autour de la chose à toucher ; la vue glisse jusqu'à elle.
   - Pendant le guidage, le reste de l'atelier est inactif : un toucher ailleurs ne fait rien d'autre que « Pas maintenant »
     (on peut toujours faire glisser la pièce pour regarder ; les panneaux ouverts, eux, marchent normalement).
   - Quand l'action guidée est faite : le guidage s'arrête, l'événement « atelier:guide-fait » part sur document
     (detail : {cible}) et options.fait(cible) est appelé.
   - Le guidage tient d'un remontage à l'autre de la vue (le moteur la remonte à chaque rendu), jusqu'à Atelier.guider(null).
   Cibles : 'cueillette' (les ingrédients posés devant la porte : les toucher ou les glisser),
     'rangement' (le meuble où ranger le premier ingrédient de la cueillette : fait quand un ingrédient y est rangé),
     'grimoire' (le livre sur le lutrin : fait quand il s'ouvre), 'chaudron' (fait quand le panneau du chaudron s'ouvre),
     'paillasse' (l'analyse : fait quand le panneau des analyses s'ouvre), 'carton' (un carton à ouvrir : fait au premier objet sorti),
     'potion' (le flacon prêt devant la porte : fait quand on le touche).
   ========================================================== */
var GUIDE = null;          /* {cible, fait} : le guidage en cours (il survit aux remontages de la vue) */
var VUES = [];             /* les vues montées (en pratique une seule) */
var GUIDE_CIBLES = {cueillette:1, rangement:1, grimoire:1, chaudron:1, paillasse:1, carton:1, potion:1};
function guider(cible, opts){
  opts = opts || {};
  if(!cible || !GUIDE_CIBLES[cible]){ GUIDE = null; VUES.forEach(function(V){ guideEnlever(V); }); return false; }
  GUIDE = {cible:cible, fait:typeof opts.fait === 'function' ? opts.fait : null, texte:opts.texte || ''};
  VUES.forEach(function(V){ guideAppliquer(V, true); });
  return true;
}
function guideEnCours(){ return GUIDE ? GUIDE.cible : null; }
/* Le meuble où ranger : celui qui convient à l'ingrédient tenu, ou au premier de la cueillette (verre pour les liquides), de préférence là où il y en a déjà */
function meubleGuide(V){
  /* (l'ingrédient qu'elle tient, sinon le premier de la cueillette) */
  var k = (V.sel && V.etat.panier[V.sel] > 0) ? V.sel : cles(V.etat.panier).filter(function(x){ return V.etat.panier[x] > 0; })[0], best = null, note = -1;
  ici(V, 0).forEach(function(o){
    var c = catDe(o);
    if(!c.cases || o.sur && !V.parId[o.sur.o]) return;
    var n = 0;
    if(k){
      if(!!c.verre !== estLiquide(k)) return;
      (o.cases || []).forEach(function(cs, j){ var cap = c.cases[j] ? c.cases[j].cap : 0, s = somme(cs.i); if(cs.i[k] > 0) n = Math.max(n, 3); else if(!s && cap > 0) n = Math.max(n, 2); else if(s < cap) n = Math.max(n, 1); });
    } else n = 1;
    if(n > note){ note = n; best = o; }
  });
  return best;
}
/* Les éléments de la pièce que le guidage montre (et qui restent actifs) */
function guideElements(V){
  if(!GUIDE) return [];
  var c = GUIDE.cible, l = [];
  if(c === 'cueillette') l = (V.elTas || []).slice();
  else if(c === 'rangement'){ var m = meubleGuide(V); if(m && V.elO[m.id]) l = [V.elO[m.id]]; }
  else if(c === 'grimoire'){ if(V.elO.lu) l = [V.elO.lu]; }
  else if(c === 'chaudron'){ if(V.elO.ch) l = [V.elO.ch]; }
  else if(c === 'paillasse'){ if(V.elO.pa) l = [V.elO.pa]; }
  else if(c === 'carton'){ var ks = cartonsIci(V); if(ks.length && V.elK[ks[0].id]) l = [V.elK[ks[0].id]]; }
  else if(c === 'potion') l = (V.elFl || []).slice();
  return l.filter(Boolean);
}
/* Ce qu'on a le droit de toucher dans la pièce pendant le guidage */
function guideAutorise(V, t){
  if(!GUIDE) return true;
  if(t.closest('.at-repere') || t.closest('.at-tient')) return true;
  var c = GUIDE.cible, els = guideElements(V);
  if(els.some(function(e){ return e.contains(t); })) return true;
  if(c === 'rangement'){                   /* ranger : la cueillette (on la prend) et tous les rangements (on la pose) */
    if(t.closest('.at-tas')) return true;
    var ob = t.closest('.at-o'), o = ob && V.parId[ob.getAttribute('data-obj')];
    if(o && catDe(o).cases) return true;
  }
  if(c === 'cueillette' && t.closest('.at-tas')) return true;
  if(c === 'potion' && t.closest('[data-at=potions]')) return true;
  if(c === 'carton' && t.closest('.at-carton')) return true;
  return false;
}
function pasMaintenant(V){
  var t = 'Pas maintenant ! Touche ce qui brille.';
  toast(V, '<b>✨ 👆</b> ' + esc(t), 2600, t);
  son(V, 'clic');
  var g = V.calque && V.calque.querySelector('.at-guide');
  if(g){ g.classList.remove('at-guide-hop'); void g.offsetWidth; g.classList.add('at-guide-hop'); }
}
/* Le rond lumineux : placé dans la pièce (il glisse avec elle), autour de la chose (ou des choses) à toucher */
function guidePlacer(V){
  var g = V.calque && V.calque.querySelector('.at-guide');
  if(!GUIDE){ if(g) g.remove(); return null; }
  var els = guideElements(V);
  if(!els.length){ if(g) g.hidden = true; return null; }
  var mr = V.monde.getBoundingClientRect(), x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
  els.forEach(function(e){ var r = e.getBoundingClientRect(); if(!r.width && !r.height) return; x0 = Math.min(x0, r.left); y0 = Math.min(y0, r.top); x1 = Math.max(x1, r.right); y1 = Math.max(y1, r.bottom); });
  if(x1 < x0){ if(g) g.hidden = true; return null; }
  /* (en unités du monde : le rond suit la pièce quand elle glisse) */
  var F = {x0:V.vb.x0 + (x0 - mr.left) / V.k, y0:V.vb.y0 + (y0 - mr.top) / V.k, x1:V.vb.x0 + (x1 - mr.left) / V.k, y1:V.vb.y0 + (y1 - mr.top) / V.k};
  var m = 18, w = F.x1 - F.x0 + 2 * m, h = F.y1 - F.y0 + 2 * m, mn = 96;
  if(w < mn){ F.x0 -= (mn - w) / 2; w = mn; } else F.x0 -= m;
  if(h < mn){ F.y0 -= (mn - h) / 2; h = mn; } else F.y0 -= m;
  if(!g){
    g = document.createElement('div');
    g.className = 'at-guide';
    g.setAttribute('aria-hidden', 'true');
    g.innerHTML = '<i class="at-guide-anneau"></i><b class="at-guide-nouveau">✨ Nouveau !</b>';
    V.calque.appendChild(g);
  }
  g.hidden = false;
  g.setAttribute('data-cible', GUIDE.cible);
  g.style.left = pX(V, F.x0); g.style.top = pY(V, F.y0); g.style.width = pW(V, w); g.style.height = pH(V, h);
  return {x:F.x0 + w / 2, y:F.y0 + h, w:w, h:h};
}
function guideAppliquer(V, montrer){
  if(V.arrete || !GUIDE) return;
  /* (tout ce qu'on guide est dans l'atelier ; un carton peut attendre dans la chambre) */
  var c = GUIDE.cible, s = 0;
  var kd = function(n){ return V.etat.cartons.filter(function(k){ return (k.ch ? 1 : 0) === n; }).length; };
  if(c === 'carton' && !kd(0) && kd(1)) s = 1;
  if(V.salle !== s && V.mode === 'ranger') changerSalle(V, s);
  V.root.classList.add('at-guidage');
  var F = guidePlacer(V);
  if(F && montrer) allerVers(V, F.x, F.y - F.h / 2);
}
function guideEnlever(V){
  if(!V.root) return;
  V.root.classList.remove('at-guidage');
  var g = V.calque && V.calque.querySelector('.at-guide');
  if(g) g.remove();
}
/* L'action guidée est faite : on arrête, et on prévient le moteur */
function guideFait(V, cible){
  if(!GUIDE || GUIDE.cible !== cible) return;
  var fait = GUIDE.fait;
  GUIDE = null;
  VUES.forEach(function(W){ guideEnlever(W); });
  try{ document.dispatchEvent(new CustomEvent('atelier:guide-fait', {detail:{cible:cible}})); }catch(e){}
  try{ if(fait) fait(cible); }catch(e){ console.error(e); }
}
/* (les actions guidées : chacune prévient le guidage quand elle a eu lieu) */
(function(){
  function apresFait(nom, cible, f){ return function(V){ var r = f.apply(this, arguments); try{ guideFait(V, cible); }catch(e){} return r; }; }
  ouvrirLivre = apresFait('ouvrirLivre', 'grimoire', ouvrirLivre);
  ouvrirChaudron = apresFait('ouvrirChaudron', 'chaudron', ouvrirChaudron);
  ouvrirAnalyses = apresFait('ouvrirAnalyses', 'paillasse', ouvrirAnalyses);
  ouvrirPotions = apresFait('ouvrirPotions', 'potion', ouvrirPotions);
  ouvrirArrivage = apresFait('ouvrirArrivage', 'cueillette', ouvrirArrivage);
  var rd = rangerDans;      /* (ranger : fait seulement quand un ingrédient est vraiment rangé) */
  rangerDans = function(V){ var r = rd.apply(this, arguments); if(r > 0) try{ guideFait(V, 'rangement'); }catch(e){} return r; };
  var oc = ouvrirCarton;
  ouvrirCarton = function(V){ var n = V.etat.objets.length + V.etat.reserve.length, r = oc.apply(this, arguments); if(V.etat.objets.length + V.etat.reserve.length > n) guideFait(V, 'carton'); return r; };
  var mt = majTient;        /* (elle prend un autre ingrédient : le rond va sur un meuble qui lui convient) */
  majTient = function(V){ var r = mt.apply(this, arguments); if(GUIDE && GUIDE.cible === 'rangement') try{ guidePlacer(V); }catch(e){} return r; };
  var gt = glisserTas;
  glisserTas = function(V){ var r = gt.apply(this, arguments); try{ guideFait(V, 'cueillette'); }catch(e){} return r; };
})();
