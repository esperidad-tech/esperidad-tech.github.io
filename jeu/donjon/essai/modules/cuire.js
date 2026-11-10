/* cuire.js — la « cuisson » des bêtes animées du donjon (Les Enquêteurs de Brumeval).
   Module autonome, sans dépendance. Règles et explications : jeu/donjon/RAPIDITE.md.

   POURQUOI. Une bête dessinée en un seul grand SVG, dont on anime les <g> (pièces articulées), est REPEINTE en entier à
   chaque image, sur le fil principal (Chrome comme Safari) : style, mise en page SVG, peinture, filtres (grain, flous).
   Une transformation sur un élément HTML, elle, est composée par la carte graphique sans rien repeindre.
   La cuisson transforme donc, UNE fois au chargement, le SVG d'une bête en un arbre de <div> HTML :
     - chaque pièce vivante (pièce articulée, variante qu'on montre / cache, repère, emplacement d'effets) devient un <div>,
       avec la même hiérarchie, le même pivot (transform-origin), le même ordre d'empilement et les mêmes attributs data-*
       et class : les querySelector du module et ses appels animate() marchent tels quels ;
     - le dessin fixe entre deux pièces devient une petite image (PNG rendu à la bonne résolution, filtres compris :
       le grain et les flous sont « cuits » dedans, une seule fois) ;
     - ce qui doit rester du dessin vectoriel modifiable (un tissu simulé, une corde, une fiole qui change de couleur)
       reste un petit îlot SVG, à sa place dans l'arbre.

     Cuire.cuire(svg, o) -> Promise<modele>   le svg doit être dans la page, affiché, toutes ses pièces au repos.
         o.piece(el)  : true si l'élément doit devenir un <div> (par défaut : il a un attribut data-*, une class ou un style)
         o.ilot       : sélecteur CSS des éléments qui restent en SVG (îlots vectoriels)
         o.anime      : sélecteur CSS des <div> qui seront animés (ils reçoivent will-change: transform)
         o.res        : résolution des images, en pixels d'écran par unité du dessin (par défaut 2)
         o.lueur      : {couleur, flou} : cuit aussi une silhouette lumineuse (voir modele.cloner)
     modele.cloner(conteneur, {lueur}) -> {racine, vue, defs}   une copie toute prête (les images sont partagées)
         racine : le <div> à mettre dans le conteneur (il le remplit, comme le SVG d'origine) ;
         vue    : le <div> qui porte le repère du dessin (l'équivalent du <svg>) : on y cherche les pièces ;
         defs   : un <defs> (dans un petit <svg> caché) pour les dégradés des îlots et des effets ajoutés ensuite.
     Cuire.ajuster(racine)        recalcule le cadrage (viewBox + preserveAspectRatio) si le conteneur change de taille.
     Cuire.ctm(el)                la matrice [a,b,c,d,e,f] d'un élément cuit (div ou élément SVG d'un îlot) vers les pixels
                                  du conteneur : l'équivalent de el.getCTM() (marche aussi sur un SVG normal).
     Cuire.point(el, x, y)        un point du repère de el, en pixels du conteneur.
     Cuire.ilot(parent, html)     un petit îlot SVG créé à la volée dans un <div> cuit (pour les effets) : rend le <div>,
                                  qu'on anime en transform / opacity (repère : celui du parent, transform-origin 0 0).
     Cuire.image(svgTexte, w, h, res) -> Promise<url>   cuire un petit dessin (avec ses filtres) en image PNG.

   Le module garde toujours la voie d'origine (le SVG) quand la cuisson n'a pas été faite : les pages de démonstration et
   les anciens appels marchent sans rien changer. */
(function(global){
'use strict';
var NS = 'http://www.w3.org/2000/svg';
var Cuire = global.Cuire = global.Cuire || {};
if(Cuire.cuire) return;

/* ---------------- les matrices [a, b, c, d, e, f] ---------------- */
var ID = [1, 0, 0, 1, 0, 0];
function mul(A, B){ return [A[0] * B[0] + A[2] * B[1], A[1] * B[0] + A[3] * B[1], A[0] * B[2] + A[2] * B[3], A[1] * B[2] + A[3] * B[3], A[0] * B[4] + A[2] * B[5] + A[4], A[1] * B[4] + A[3] * B[5] + A[5]]; }
function inv(m){ var d = m[0] * m[3] - m[1] * m[2] || 1e-9; return [m[3] / d, -m[1] / d, -m[2] / d, m[0] / d, (m[2] * m[5] - m[3] * m[4]) / d, (m[1] * m[4] - m[0] * m[5]) / d]; }
function ap(m, x, y){ return [m[0] * x + m[2] * y + m[4], m[1] * x + m[3] * y + m[5]]; }
function deSvg(m){ return m ? [m.a, m.b, m.c, m.d, m.e, m.f] : ID.slice(); }
function lireMatrice(t){
  if(!t || t === 'none') return null;
  var v = t.replace(/^matrix(3d)?\(|\)$/g, '').split(',').map(parseFloat);
  if(v.length === 16) return [v[0], v[1], v[4], v[5], v[12], v[13]];
  return v.length === 6 ? v : null;
}
Cuire.mul = mul; Cuire.inv = inv; Cuire.ap = ap;

/* ---------------- le CSS (une seule fois) ---------------- */
function css(){
  if(document.getElementById('cuire-css')) return;
  var s = document.createElement('style'); s.id = 'cuire-css';
  s.textContent = '.cu-racine{position:absolute;left:0;top:0;width:100%;height:100%;overflow:visible;pointer-events:none;z-index:0}' +
    /* (1 px et pas 0 : Chrome garde sur le fil principal l'animation d'une boîte vide de taille nulle, par exemple une pièce
       dont tout le contenu est caché ; elle réveillerait alors le fil principal à chaque image) */
    '.cu{position:absolute;left:0;top:0;width:1px;height:1px;transform-origin:0 0}' +
    '.cu-anime{will-change:transform}' +
    '.cu-img{position:absolute;display:block;max-width:none;pointer-events:none;-webkit-user-drag:none;user-select:none;-webkit-user-select:none}' +
    '.cu-ilot{position:absolute;left:0;top:0;width:0;height:0;transform-origin:0 0}' +
    '.cu-ilot>svg{position:absolute;left:0;top:0;width:1px;height:1px;overflow:visible;display:block}' +
    '.cu-defs{position:absolute;left:0;top:0;width:0;height:0;overflow:hidden;visibility:hidden}' +
    '.cu-lueur{position:absolute;left:0;top:0;width:100%;height:100%;display:none;z-index:-1}';
  (document.head || document.documentElement).appendChild(s);
}

/* ---------------- le cadrage d'un viewBox (comme le fait le <svg>) ---------------- */
function cadrage(vb, par, W, H){
  var p = (par || 'xMidYMid meet').split(/\s+/), al = p[0], meet = p[1] !== 'slice';
  if(al === 'none') return [W / vb[2], 0, 0, H / vb[3], -vb[0] * W / vb[2], -vb[1] * H / vb[3]];
  var s = meet ? Math.min(W / vb[2], H / vb[3]) : Math.max(W / vb[2], H / vb[3]);
  var dx = W - vb[2] * s, dy = H - vb[3] * s;
  var fx = /xMin/.test(al) ? 0 : /xMax/.test(al) ? 1 : .5, fy = /YMin/.test(al) ? 0 : /YMax/.test(al) ? 1 : .5;
  return [s, 0, 0, s, dx * fx - vb[0] * s, dy * fy - vb[1] * s];
}
Cuire.ajuster = function(racine, W, H){
  var vue = racine.querySelector(':scope > .cu-vue') || racine;
  var vb = (racine.getAttribute('data-cu-vb') || '0 0 100 100').split(' ').map(Number);
  W = W || racine.clientWidth || (racine.parentNode && racine.parentNode.clientWidth) || vb[2];
  H = H || racine.clientHeight || (racine.parentNode && racine.parentNode.clientHeight) || vb[3];
  var m = cadrage(vb, racine.getAttribute('data-cu-par'), W, H);
  vue.style.transform = 'matrix(' + m.join(',') + ')';
  [].forEach.call(racine.querySelectorAll(':scope > .cu-lueur > .cu-vue'), function(v){ v.style.transform = vue.style.transform; });
  return m;
};

/* ---------------- la matrice d'un élément cuit, vers les pixels du conteneur ---------------- */
/* les matrices lues sont gardées le temps d'un calcul (plusieurs points d'une même bête lus d'un coup ne relisent pas
   deux fois les mêmes pièces) ; on oublie tout à la micro-tâche suivante */
var memo = null;
function matDiv(e){
  if(memo && memo.has(e)) return memo.get(e);
  /* un <div> cuit : translate(left, top) · T(origine) · transform · T(−origine) */
  var cs = getComputedStyle(e), l = parseFloat(e.style.left) || 0, t = parseFloat(e.style.top) || 0, M = lireMatrice(cs.transform), r;
  if(!M) r = [1, 0, 0, 1, l, t];
  else { var o = cs.transformOrigin.split(' ').map(parseFloat); r = mul([1, 0, 0, 1, l + o[0], t + o[1]], mul(M, [1, 0, 0, 1, -o[0], -o[1]])); }
  if(!memo){ memo = new Map(); Promise.resolve().then(function(){ memo = null; }); }
  memo.set(e, r);
  return r;
}
function chaine(d){
  var m = ID.slice();
  for(var e = d; e && e.nodeType === 1; e = e.parentNode){
    m = mul(matDiv(e), m);
    if(e.classList.contains('cu-vue')) break;
  }
  return m;
}
/* le repère propre d'une pièce cuite : celui du dessin (ses enfants sont posés par rapport à son coin left / top) */
function ctmDiv(d){
  var l = parseFloat(d.style.left) || 0, t = parseFloat(d.style.top) || 0, m = chaine(d);
  return (l || t) && !d.classList.contains('cu-ilot') ? mul(m, [1, 0, 0, 1, -l, -t]) : m;
}
Cuire.ctm = function(el){
  if(!el) return ID.slice();
  if(el.namespaceURI === NS){
    var s = el.tagName === 'svg' ? el : el.ownerSVGElement;
    if(!s || !s.parentNode || !s.parentNode.classList || !s.parentNode.classList.contains('cu-ilot')) return deSvg(el.getCTM());
    return mul(chaine(s.parentNode), el === s ? ID.slice() : deSvg(el.getCTM()));
  }
  return ctmDiv(el);
};
Cuire.point = function(el, x, y){ var p = ap(Cuire.ctm(el), x, y); return {x:p[0], y:p[1]}; };
Cuire.estCuit = function(el){ return !!(el && el.closest && el.closest('.cu-vue')); };

/* ---------------- un îlot SVG à la volée (effets) ---------------- */
Cuire.ilot = function(parent, html, cls){
  css();
  var d = document.createElement('div');
  d.className = 'cu-ilot' + (cls ? ' ' + cls : '');
  d.innerHTML = '<svg xmlns="' + NS + '" width="1" height="1">' + (html || '') + '</svg>';
  /* dans une pièce dont la boîte est décalée, l'îlot se remet dans le repère du dessin */
  var l = parent.style ? parseFloat(parent.style.left) || 0 : 0, t = parent.style ? parseFloat(parent.style.top) || 0 : 0;
  if((l || t) && parent.classList && parent.classList.contains('cu')){ d.style.left = (-l) + 'px'; d.style.top = (-t) + 'px'; }
  parent.appendChild(d);
  return d;
};
/* un simple <div> placé en (x, y) dans le repère d'une pièce cuite (pour regrouper des effets) */
Cuire.place = function(parent, x, y, cls){
  css();
  var d = document.createElement('div');
  d.className = 'cu-ilot' + (cls ? ' ' + cls : '');
  var l = parent.style ? parseFloat(parent.style.left) || 0 : 0, t = parent.style ? parseFloat(parent.style.top) || 0 : 0;
  if(!(parent.classList && parent.classList.contains('cu'))){ l = 0; t = 0; }
  d.style.left = ((x || 0) - l) + 'px'; d.style.top = ((y || 0) - t) + 'px';
  parent.appendChild(d);
  return d;
};

/* ---------------- rendre un dessin SVG en image (PNG) ---------------- */
function rendre(texte, W, H){
  return new Promise(function(ok){
    var u = URL.createObjectURL(new Blob([texte], {type:'image/svg+xml'})), im = new Image();
    function fin(r){ URL.revokeObjectURL(u); ok(r); }
    im.onload = function(){
      try{
        var cv = document.createElement('canvas'); cv.width = W; cv.height = H;
        cv.getContext('2d').drawImage(im, 0, 0, W, H);
        /* la toile est vidée dès que l'image est faite (largeur 0) : sur iPhone, Safari compte la mémoire de toutes les toiles
           encore vivantes, même celles qui attendent d'être jetées (RAPIDITE.md, règle R9) */
        if(cv.toBlob) cv.toBlob(function(b){ if(b){ fin({url:URL.createObjectURL(b)}); cv.width = cv.height = 0; } else fin({canvas:cv}); }, 'image/png');
        else { fin({url:cv.toDataURL('image/png')}); cv.width = cv.height = 0; }
      }catch(e){ fin({canvas:null, erreur:e}); }   /* canvas « teinté » (vieux navigateur) : pas d'image, l'îlot de secours prendra le relais */
    };
    im.onerror = function(){ fin({erreur:'image'}); };
    im.src = u;
  });
}
Cuire.image = function(texte, w, h, res){
  res = res || 2;
  var W = Math.max(1, Math.ceil(w * res)), H = Math.max(1, Math.ceil(h * res));
  texte = texte.replace(/^<svg\b/, '<svg width="' + W + '" height="' + H + '"');
  if(!/xmlns=/.test(texte.slice(0, 200))) texte = texte.replace(/^<svg\b/, '<svg xmlns="' + NS + '"');
  return rendre(texte, W, H).then(function(r){ return r.url || null; });
};

/* ---------------- la cuisson ---------------- */
var IGNORE = {defs:1, title:1, desc:1, style:1, script:1, metadata:1, clipPath:1, mask:1, linearGradient:1, radialGradient:1, filter:1, pattern:1, symbol:1, marker:1};
function pieceParDefaut(e){
  if(e.hasAttribute('class') || e.hasAttribute('style')) return true;
  for(var i = 0; i < e.attributes.length; i++) if(e.attributes[i].name.indexOf('data-') === 0) return true;
  return false;
}
function refs(texte){ var r = [], m, re = /url\(\s*['"]?#([^)'"\s]+)['"]?\s*\)|href="#([^"]+)"/g; while((m = re.exec(texte))) r.push(m[1] || m[2]); return r; }

Cuire.cuire = function(svg, o){
  o = o || {};
  css();
  var estPiece = o.piece || pieceParDefaut, ilotSel = o.ilot || null, animeSel = o.anime || null, RES = o.res || 2;
  var ser = new XMLSerializer();
  var vbA = svg.viewBox && svg.viewBox.baseVal, vb = vbA && vbA.width ? [vbA.x, vbA.y, vbA.width, vbA.height] : [0, 0, svg.clientWidth || 100, svg.clientHeight || 100];
  var par = svg.getAttribute('preserveAspectRatio') || 'xMidYMid meet';
  var VB = cadrage(vb, par, svg.clientWidth || vb[2], svg.clientHeight || vb[3]), VBi = inv(VB);
  function user(e){ return mul(VBi, deSvg(e.getCTM())); }        /* de l'élément vers le repère du dessin */
  var parId = {};
  [].forEach.call(svg.querySelectorAll('[id]'), function(e){ parId[e.id] = e; });

  /* 1) tout montrer (pour mesurer), en notant l'état d'origine */
  var styles = [], caches = new Map();
  [].forEach.call(svg.querySelectorAll('*'), function(e){
    if(e.style && e.style.display === 'none'){ caches.set(e, true); styles.push([e, e.getAttribute('style')]); e.style.display = ''; }
    else if(e.getAttribute && e.getAttribute('display') === 'none'){ caches.set(e, true); e.setAttribute('data-cu-display', '1'); e.removeAttribute('display'); }
  });
  function estIlot(e){ return !!(ilotSel && e.matches && e.matches(ilotSel)); }
  var vivantMemo = new Map();
  function vivant(e){ return estIlot(e) || estPiece(e); }
  function contientVivant(e){
    if(vivantMemo.has(e)) return vivantMemo.get(e);
    var r = false;
    for(var c = e.firstElementChild; c && !r; c = c.nextElementSibling){ if(IGNORE[c.tagName]) continue; if(vivant(c) || contientVivant(c)) r = true; }
    vivantMemo.set(e, r);
    return r;
  }
  function bbox(e){ try{ var b = e.getBBox(); return {x:b.x, y:b.y, w:b.width, h:b.height}; }catch(x){ return {x:0, y:0, w:0, h:0}; } }
  function traitMax(e){
    var m = 0;
    function lit(x){ var v = parseFloat(x.getAttribute('stroke-width')); if(x.getAttribute('stroke') && x.getAttribute('stroke') !== 'none') m = Math.max(m, isFinite(v) ? v : 1); else if(isFinite(v)) m = Math.max(m, v); }
    lit(e); [].forEach.call(e.querySelectorAll('[stroke],[stroke-width]'), lit);
    return m;
  }
  function flouMax(texte){
    var m = 0;
    refs(texte).forEach(function(id){ var f = parId[id]; if(f && f.tagName === 'filter') [].forEach.call(f.querySelectorAll('feGaussianBlur'), function(b){ m = Math.max(m, parseFloat(b.getAttribute('stdDeviation')) || 0); }); });
    return m;
  }

  /* 2) le plan : des <div>, des suites de dessin fixe (à cuire en images) et des îlots */
  var suites = [];
  function traiter(F, filtres){
    var kids = [], suite = [];
    function vider(){ if(suite.length){ var s = {type:'suite', noeuds:suite, cadre:F, filtres:filtres.slice()}; suites.push(s); kids.push(s); suite = []; } }
    for(var c = F.firstElementChild; c; c = c.nextElementSibling){
      if(IGNORE[c.tagName]) continue;
      if(estIlot(c)){ vider(); kids.push({type:'ilot', el:c}); continue; }
      if(vivant(c) || contientVivant(c)){ vider(); kids.push(planDiv(c, filtres)); continue; }
      suite.push(c);
    }
    vider();
    return kids;
  }
  function planDiv(E, filtres){
    var feuille = !contientVivant(E), cs = getComputedStyle(E), fb = bbox(E);
    var boite = feuille ? fb : {x:0, y:0, w:0, h:0};
    var or = (cs.transformOrigin || '0 0').split(' ').map(parseFloat), ox = or[0] || 0, oy = or[1] || 0;
    if(cs.transformBox === 'fill-box'){ ox += fb.x; oy += fb.y; }
    /* la transformation fixe : celle de l'attribut SVG (autour de 0 0), sinon celle du style */
    var tf = cs.transform, tl = E.transform && E.transform.baseVal;
    if(tl && tl.numberOfItems){ var c1 = tl.consolidate(); if(c1){ tf = 'matrix(' + deSvg(c1.matrix).join(',') + ')'; ox = 0; oy = 0; } }
    /* l'origine n'est écrite que si elle compte : une transformation fixe, une origine écrite dans le style, ou une origine
       non nulle donnée par une règle CSS (sinon, les classes du module, comme « pulse autour du centre », gardent la main) */
    var ecrire = (tf && tf !== 'none') || !!(E.style && E.style.transformOrigin) || (!feuille && (ox || oy));
    var n = {type:'div', el:E, boite:boite, origine:ecrire ? [ox - boite.x, oy - boite.y] : null, transform:tf, opacite:parseFloat(cs.opacity),
      cache:caches.has(E), visibilite:(E.getAttribute('visibility') || (E.style && E.style.visibility) || ''), clip:null};
    var f = E.getAttribute('filter');
    /* une forme seule (un chemin, un cercle…) qui est vivante : elle se dessine elle-même, dans son propre repère */
    if(!/^(g|svg|a|switch)$/.test(E.tagName)){
      /* (un repère invisible, sans remplissage ni trait, ne fait pas d'image) */
      var invisible = (E.getAttribute('fill') === 'none' || cs.fill === 'none') && (!E.getAttribute('stroke') || E.getAttribute('stroke') === 'none') && cs.stroke === 'none';
      var s0 = {type:'suite', noeuds:[E], cadre:E, filtres:filtres.slice(), soi:true, vide:invisible};
      if(!invisible) suites.push(s0);
      n.kids = [s0];
      return n;
    }
    var cp = E.getAttribute('clip-path');
    if(cp){
      var m = /url\(\s*['"]?#([^)'"\s]+)/.exec(cp), cpEl = m && parId[m[1]];
      if(cpEl && cpEl.children.length === 1 && cpEl.firstElementChild.tagName === 'path' && !cpEl.firstElementChild.getAttribute('transform') && (cpEl.getAttribute('clipPathUnits') || 'userSpaceOnUse') === 'userSpaceOnUse'){
        var d = cpEl.firstElementChild.getAttribute('d');
        if(boite.x || boite.y) d = d.replace(/(-?\d*\.?\d+(?:e-?\d+)?)[ ,]+(-?\d*\.?\d+(?:e-?\d+)?)/g, function(t, a, b){ return (+a - boite.x) + ' ' + (+b - boite.y); });
        n.clip = d;
      } else n.clipUrl = cp;
    }
    n.kids = traiter(E, f ? filtres.concat([f]) : filtres);
    return n;
  }
  var plan = traiter(svg, []);

  /* 3) mesurer chaque suite dans le repère de son cadre */
  var marq = [];
  suites.forEach(function(s){
    var MF = inv(user(s.cadre)), x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
    var ech = Math.sqrt(Math.abs(MF[0] * MF[3] - MF[1] * MF[2])) || 1;   /* pour que l'image reste nette si le cadre est réduit au repos */
    s.noeuds.forEach(function(N){
      var b = bbox(N); if(!b.w && !b.h) return;
      var M = mul(MF, user(N)), pad = 2 + traitMax(N) * 1.3;
      [[b.x - pad, b.y - pad], [b.x + b.w + pad, b.y - pad], [b.x - pad, b.y + b.h + pad], [b.x + b.w + pad, b.y + b.h + pad]].forEach(function(p){
        var q = ap(M, p[0], p[1]); x0 = Math.min(x0, q[0]); y0 = Math.min(y0, q[1]); x1 = Math.max(x1, q[0]); y1 = Math.max(y1, q[1]);
      });
    });
    if(!isFinite(x0)){ s.vide = true; return; }
    s.res = RES / ech;
    s.boite = [x0, y0, x1, y1];
  });
  /* 4) remettre l'état d'origine, puis écrire chaque suite en SVG autonome */
  styles.forEach(function(p){ if(p[1] == null) p[0].removeAttribute('style'); else p[0].setAttribute('style', p[1]); });
  [].forEach.call(svg.querySelectorAll('[data-cu-display]'), function(e){ e.setAttribute('display', 'none'); e.removeAttribute('data-cu-display'); });
  function defsPour(texte){
    var vus = {}, out = [], pile = refs(texte);
    while(pile.length){ var id = pile.pop(); if(vus[id]) continue; vus[id] = 1; var e = parId[id]; if(!e) continue; var t = ser.serializeToString(e); out.push(t); pile = pile.concat(refs(t)); }
    return out.join('');
  }
  function sansAttributs(N){
    var c = N.cloneNode(true);
    ['transform', 'opacity', 'style', 'class', 'id', 'display'].forEach(function(a){ c.removeAttribute(a); });
    [].slice.call(c.attributes).forEach(function(a){ if(a.name.indexOf('data-') === 0) c.removeAttribute(a.name); });
    return c;
  }
  var margeLueur = o.lueur ? (o.lueur.epais || 1.2) + 3 * Math.max(o.lueur.flou || 2, o.lueur.large || 6) : 0;
  function cadrer(s, marge){
    var b = s.boite, x0 = b[0] - marge, y0 = b[1] - marge, x1 = b[2] + marge, y1 = b[3] + marge;
    /* au pixel près (dans l'image), pour que les bords ne bavent pas */
    x0 = Math.floor(x0 * s.res) / s.res; y0 = Math.floor(y0 * s.res) / s.res; x1 = Math.ceil(x1 * s.res) / s.res; y1 = Math.ceil(y1 * s.res) / s.res;
    return {c:[x0, y0, x1 - x0, y1 - y0], W:Math.max(1, Math.round((x1 - x0) * s.res)), H:Math.max(1, Math.round((y1 - y0) * s.res))};
  }
  function texteSvg(k, defs, corps){
    return '<svg xmlns="' + NS + '" xmlns:xlink="http://www.w3.org/1999/xlink" width="' + k.W + '" height="' + k.H + '" viewBox="' + k.c.join(' ') + '" preserveAspectRatio="none"><defs>' + defs + '</defs>' + corps + '</svg>';
  }
  suites.forEach(function(s){
    if(s.vide) return;
    var corps = s.noeuds.map(function(N){ return ser.serializeToString(s.soi ? sansAttributs(N) : N); }).join('');
    s.filtres.slice().reverse().forEach(function(f){ corps = '<g filter="' + f + '">' + corps + '</g>'; });
    var fl = flouMax(corps) * 3, k = cadrer(s, fl), defs = defsPour(corps);
    s.cadreImg = k.c; s.W = k.W; s.H = k.H;
    s.texte = texteSvg(k, defs, corps);
    if(o.lueur){ var kl = cadrer(s, fl + margeLueur); s.cadreImgL = kl.c; s.WL = kl.W; s.HL = kl.H; s.texteL0 = texteSvg(kl, defs, corps); }
    /* la silhouette lumineuse (comme un drop-shadow doré : un liseré net + un halo large), cuite elle aussi */
    if(o.lueur) s.texteL = s.texteL0.replace(/<\/defs>/,'<filter id="cuLueur" x="-50%" y="-50%" width="200%" height="200%" filterUnits="userSpaceOnUse">' +
      '<feMorphology in="SourceAlpha" operator="dilate" radius="' + (o.lueur.epais || 1.2) + '" result="d"/>' +
      '<feGaussianBlur in="d" stdDeviation="' + (o.lueur.flou || 2) + '" result="b1"/><feGaussianBlur in="d" stdDeviation="' + (o.lueur.large || 6) + '" result="b2"/>' +
      '<feFlood flood-color="' + (o.lueur.couleur || '#ffd88a') + '"/><feComposite in2="b1" operator="in" result="c1"/>' +
      '<feFlood flood-color="' + (o.lueur.couleur2 || '#ffbe5a') + '" flood-opacity=".8"/><feComposite in2="b2" operator="in" result="c2"/>' +
      '<feMerge><feMergeNode in="c2"/><feMergeNode in="c1"/></feMerge></filter></defs><g filter="url(#cuLueur)">').replace(/<\/svg>$/, '</g></svg>');
  });
  var ilots = [];
  (function chercher(l){ l.forEach(function(k){ if(k.type === 'ilot'){ k.texte = ser.serializeToString(k.el); ilots.push(k); } else if(k.kids) chercher(k.kids); }); })(plan);
  var tousDefs = [].map.call(svg.querySelectorAll('defs'), function(d){ return d.innerHTML; }).join('');

  /* 5) cuire les images (en parallèle), puis monter le gabarit */
  var travaux = [];
  suites.forEach(function(s){
    if(s.vide) return;
    travaux.push(rendre(s.texte, s.W, s.H).then(function(r){ s.img = r; }));
    if(s.texteL) travaux.push(rendre(s.texteL, s.WL, s.HL).then(function(r){ s.imgL = r; }));
  });
  var garde = [];
  return Promise.all(travaux).then(function(){
    /* les images sont décodées tout de suite (sinon, la première apparition de la bête hoqueterait) */
    var u = [];
    suites.forEach(function(s){ [s.img, s.imgL].forEach(function(r){ if(r && r.url) u.push(r.url); }); });
    return Promise.all(u.map(function(x){ var im = new Image(); im.src = x; garde.push(im); return im.decode ? im.decode().catch(function(){}) : null; }));
  }).then(function(){
    function monter(l, parent, lueur){
      l.forEach(function(k){
        if(k.type === 'suite'){
          var r = lueur ? k.imgL : k.img; if(k.vide || !r) return;
          var src = r.url, e, ci = lueur ? k.cadreImgL : k.cadreImg, B = parent._cuBoite || [0, 0];
          if(src){ e = document.createElement('img'); e.src = src; e.alt = ''; e.draggable = false; }
          else if(r.canvas){ e = document.createElement('canvas'); e.width = lueur ? k.WL : k.W; e.height = lueur ? k.HL : k.H; e._source = r.canvas; }
          else { /* secours : le dessin reste en SVG (si le navigateur refuse l'image) */
            if(lueur) return;
            e = document.createElement('div'); e.className = 'cu-ilot'; e.innerHTML = k.texte.replace(/ width="\d+" height="\d+"/, ' width="' + ci[2] + '" height="' + ci[3] + '"');
            e.firstElementChild.style.cssText = 'position:absolute;left:' + r4(ci[0] - B[0]) + 'px;top:' + r4(ci[1] - B[1]) + 'px;width:' + ci[2] + 'px;height:' + ci[3] + 'px';
            parent.appendChild(e); return;
          }
          e.className = 'cu-img';
          e.style.cssText = 'left:' + r4(ci[0] - B[0]) + 'px;top:' + r4(ci[1] - B[1]) + 'px;width:' + r4(ci[2]) + 'px;height:' + r4(ci[3]) + 'px';
          parent.appendChild(e);
          return;
        }
        if(k.type === 'ilot'){
          if(lueur) return;
          var il = document.createElement('div'); il.className = 'cu-ilot';
          il.innerHTML = '<svg xmlns="' + NS + '" width="1" height="1">' + k.texte + '</svg>';
          var B2 = parent._cuBoite || [0, 0];
          if(B2[0] || B2[1]) il.style.cssText = 'left:' + (-B2[0]) + 'px;top:' + (-B2[1]) + 'px';
          parent.appendChild(il);
          return;
        }
        /* un <div> */
        var E = k.el, d = document.createElement('div');
        for(var i = 0; i < E.attributes.length; i++){
          var a = E.attributes[i];
          if(/^(style|transform|filter|clip-path|opacity|display|fill|stroke|stroke-width|d|points|mask|id)$/.test(a.name)) continue;
          try{ d.setAttribute(a.name, a.value); }catch(x){}
        }
        d.className = 'cu' + (E.getAttribute('class') ? ' ' + E.getAttribute('class') : '') + (animeSel && E.matches(animeSel) ? ' cu-anime' : '');
        var b = k.boite, B3 = parent._cuBoite || [0, 0], st = '';
        if(b.x - B3[0] || b.y - B3[1]) st += 'left:' + r4(b.x - B3[0]) + 'px;top:' + r4(b.y - B3[1]) + 'px;';
        if(b.w || b.h) st += 'width:' + r4(b.w) + 'px;height:' + r4(b.h) + 'px;';
        if(k.origine) st += 'transform-origin:' + r4(k.origine[0]) + 'px ' + r4(k.origine[1]) + 'px;';
        if(k.transform && k.transform !== 'none') st += 'transform:' + k.transform + ';';
        if(k.opacite < 1) st += 'opacity:' + k.opacite + ';';
        if(k.cache) st += 'display:none;';
        if(k.visibilite === 'hidden') st += 'visibility:hidden;';
        if(k.clip) st += 'clip-path:path("' + k.clip + '");-webkit-clip-path:path("' + k.clip + '");';
        else if(k.clipUrl) st += 'clip-path:' + k.clipUrl + ';';
        d.style.cssText = st;
        d._cuBoite = [b.x, b.y];
        parent.appendChild(d);
        monter(k.kids, d, lueur);
        delete d._cuBoite;
      });
    }
    function gabarit(lueur){
      var vue = document.createElement('div'); vue.className = 'cu-vue cu';
      monter(plan, vue, lueur);
      return vue;
    }
    var G = gabarit(false), GL = o.lueur ? gabarit(true) : null;
    var modele = {
      vb:vb, par:par, nbImages:suites.filter(function(s){ return !s.vide; }).length, _images:garde,
      /* la silhouette lumineuse seule (à mettre dans un .cu-lueur de la racine, au moment où on en a besoin) */
      clonerLueur:function(){ return GL ? copier(GL) : null; },
      cloner:function(conteneur, oo){
        oo = oo || {};
        var racine = document.createElement('div'); racine.className = 'cu-racine';
        racine.setAttribute('data-cu-vb', vb.join(' ')); racine.setAttribute('data-cu-par', par);
        var ds = document.createElementNS(NS, 'svg'); ds.setAttribute('class', 'cu-defs'); ds.setAttribute('width', '0'); ds.setAttribute('height', '0');
        ds.innerHTML = '<defs>' + tousDefs + '</defs>';
        racine.appendChild(ds);
        /* la vue d'abord (les querySelector du module trouvent ses pièces en premier), la lueur ensuite, dessinée derrière */
        var vue = copier(G);
        racine.appendChild(vue);
        var lueurRacine = null;
        if(GL && oo.lueur !== false){ lueurRacine = document.createElement('div'); lueurRacine.className = 'cu-lueur'; lueurRacine.appendChild(copier(GL)); racine.appendChild(lueurRacine); }
        if(conteneur){ conteneur.appendChild(racine); Cuire.ajuster(racine); }
        return {racine:racine, vue:vue, defs:ds.firstElementChild, lueur:lueurRacine ? lueurRacine.firstElementChild : null};
      }
    };
    function copier(g){
      var c = g.cloneNode(true);
      var src = g.querySelectorAll('canvas'), dst = c.querySelectorAll('canvas');
      for(var i = 0; i < src.length; i++) if(src[i]._source) dst[i].getContext('2d').drawImage(src[i]._source, 0, 0);
      return c;
    }
    return modele;
  });
};
function r4(v){ return Math.round(v * 1000) / 1000; }

/* ---------------- un hôte caché pour cuire un dessin qui n'est pas encore dans la page ---------------- */
Cuire.hote = function(w, h){
  var d = document.createElement('div');
  d.style.cssText = 'position:fixed;left:-20000px;top:0;width:' + w + 'px;height:' + h + 'px;overflow:hidden;visibility:hidden;pointer-events:none';
  (document.body || document.documentElement).appendChild(d);
  return d;
};
})(typeof window !== 'undefined' ? window : this);
