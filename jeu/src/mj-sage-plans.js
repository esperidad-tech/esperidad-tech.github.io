/* ==========================================================
   Brumeval v2 — mini-jeux du Sage, nouvelle version :
   « Superposer les plans » ('plans') et « La grille de déduction » ('grille').
   Chargé APRÈS mj-barde-sage.js : ces deux jeux remplacent les anciens.
   Préfixes CSS : .mjsp- (commun), .mjp- (plans), .mjg- (grille).
   Aucune lecture automatique : seulement des boutons 🔊.
   Points d'accès pour les tests : MJ.sagePlans (cartes, géométrie) et MJ.grilleLogique
   (modèle, solveur, générateur), plus root.__test dans chaque partie.
   ========================================================== */
(function(){
'use strict';
var MJ = window.MJ;
if(!MJ || !MJ.enregistrer){ if(window.console) console.error('mj-sage-plans : mj-core.js doit être chargé avant.'); return; }
var U = MJ.util;

/* ---------- Outils communs ---------- */
function esc(s){ return String(s === undefined || s === null ? '' : s).replace(/[&<>"']/g, function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]; }); }
function f1(x){ return Math.round(x * 10) / 10; }
function minuteurs(){
  var ids = [], stops = [];
  return {
    t: function(fn, ms){ var id = setTimeout(fn, ms); ids.push(id); return id; },
    s: function(f){ stops.push(f); return f; },
    tout: function(){ ids.forEach(function(id){ clearTimeout(id); clearInterval(id); }); ids = []; stops.forEach(function(f){ try{ f(); }catch(e){} }); stops = []; }
  };
}
/* Hasard reproductible (tests) ou Math.random */
function aleaGraine(g){ return function(){ g |= 0; g = g + 0x6D2B79F5 | 0; var t = Math.imul(g ^ g >>> 15, 1 | g); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
function rInt(R, a, b){ return a + Math.floor(R() * (b - a + 1)); }
function rPick(R, arr){ return arr[Math.floor(R() * arr.length)]; }
function rShuffle(R, arr){ var a = arr.slice(); for(var i = a.length - 1; i > 0; i--){ var j = Math.floor(R() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
function plage(n){ var a = []; for(var i = 0; i < n; i++) a.push(i); return a; }
function cap(s){ return s.charAt(0).toUpperCase() + s.slice(1); }
function lireBtn(t){ return '<button type="button" class="mjsp-lire" data-lire="' + esc(t) + '" aria-label="Écouter">🔊</button>'; }
function brancherLire(root){
  root.addEventListener('click', function(e){
    var b = e.target.closest && e.target.closest('[data-lire]');
    if(b && root.contains(b)){ e.stopPropagation(); U.son('clic'); U.lire(b.getAttribute('data-lire')); }
  });
}
/* Petite démo : une main qui montre le geste (pas de son, pas de voix). */
function demoMain(el, html, duree, etapes){
  el.innerHTML = '<div class="mjsp-demo">' + html + '<span class="mjsp-main" aria-hidden="true">👆</span></div>';
  var box = el.firstChild, main = box.querySelector('.mjsp-main');
  var T = minuteurs();
  var ctx = {
    box: box,
    q: function(s){ return box.querySelector(s); },
    qa: function(s){ return box.querySelectorAll(s); },
    va: function(x, y){ main.style.left = x + '%'; main.style.top = y + '%'; },
    main: function(t){ main.textContent = t; },
    tape: function(){ main.classList.remove('tape'); void main.offsetWidth; main.classList.add('tape'); }
  };
  function tour(){ etapes.forEach(function(e){ T.t(function(){ e[1](ctx); }, e[0]); }); T.t(tour, duree); }
  tour();
  return {arreter: T.tout};
}

/* ==========================================================
   LA GRILLE DE DÉDUCTION — logique (sans DOM)
   Modèle : des personnes (lignes) et 1 à 3 catégories (lieu, objet, moment).
   Une catégorie 'un' : chacun a exactement un élément, chaque élément est à une seule personne.
   Une catégorie 'multi' : chacun en a entre rmin et rmax, un élément peut être partagé (cmin…cmax).
   Chaque case (personne, catégorie, élément) est une variable vrai/faux.
   Indices = formules en logique à trois valeurs (1 vrai, 0 faux, -1 inconnu) sur les cases.
   ========================================================== */
var FEM = {melusine:1, odette:1, iris:1, margot:1};
var PNJ_REPLI = {grosbec:['Grosbec', '🎩'], gaspard:['Gaspard', '👨‍🍳'], melusine:['Mélusine', '👩‍🦰'], basile:['Basile', '👨‍🌾'], odette:['Odette', '👵'], tim:['Tim', '🧒'],
  victor:['Victor', '🧔'], anselme:['Anselme', '👴'], iris:['Iris', '👩‍🌾'], fortune:['Fortuné', '🤠'], silas:['Silas', '💂'], farinel:['Farinel', '🧑‍🌾'], margot:['Margot', '👩‍🍳']};
var PNJ_IDS = Object.keys(PNJ_REPLI);
function pnjInfo(id){
  var D = window.DONNEES, d = D && D.PNJ && D.PNJ[id], r = PNJ_REPLI[id];
  if(!d && !r) return null;
  return {id:id, nom:d ? d.court : r[0], ic:d ? d.ic : r[1], f:!!FEM[id], pnj:id};
}
/* nom = avec l'article ; a = « à … » ; court = en-tête de colonne */
var LIEUX_G = {
  moulin:{nom:'le moulin', a:'au moulin', court:'Moulin', ic:'🌾'},
  puits:{nom:'le puits', a:'au puits', court:'Puits', ic:'🪣'},
  clocher:{nom:'le clocher', a:'au clocher', court:'Clocher', ic:'🔔'},
  lavoir:{nom:'le lavoir', a:'au lavoir', court:'Lavoir', ic:'🧺'},
  taverne:{nom:'la taverne', a:'à la taverne', court:'Taverne', ic:'🍲'},
  boulangerie:{nom:'la boulangerie', a:'à la boulangerie', court:'Fournil', ic:'🥖'},
  poste:{nom:'la poste', a:'à la poste', court:'Poste', ic:'📮'},
  mairie:{nom:'la mairie', a:'à la mairie', court:'Mairie', ic:'🏛️'},
  place:{nom:'la place', a:'sur la place', court:'Place', ic:'⛲'},
  pont:{nom:'le pont', a:'au pont', court:'Pont', ic:'🌉'},
  chene:{nom:'le Vieux Chêne', a:'au Vieux Chêne', court:'Chêne', ic:'🌳'},
  clairiere:{nom:'la clairière', a:'à la clairière', court:'Clairière', ic:'🐇'},
  potager:{nom:'le potager', a:'au potager', court:'Potager', ic:'🥕'},
  herboristerie:{nom:'l\'herboristerie', a:'à l\'herboristerie', court:'Herbes', ic:'🌿'},
  odette:{nom:'chez Odette', a:'chez Odette', court:'Odette', ic:'🐈'}
};
var OBJETS_G = {
  lanterne:{nom:'la lanterne', court:'Lanterne', ic:'🏮'},
  cle:{nom:'la vieille clé', court:'Clé', ic:'🗝️'},
  lettre:{nom:'la lettre', court:'Lettre', ic:'✉️'},
  plume:{nom:'la plume noire', court:'Plume', ic:'🪶'},
  carte:{nom:'la carte', court:'Carte', ic:'🗺️'},
  craie:{nom:'la craie bleue', court:'Craie', ic:'🖍️'},
  bague:{nom:'la bague', court:'Bague', ic:'💍'},
  fiole:{nom:'la fiole', court:'Fiole', ic:'🧪'},
  pioche:{nom:'la pioche', court:'Pioche', ic:'⛏️'},
  livre:{nom:'le vieux livre', court:'Livre', ic:'📕'},
  loupe:{nom:'la loupe', court:'Loupe', ic:'🔍'},
  cape:{nom:'la cape noire', court:'Cape', ic:'🧥'},
  pastilles:{nom:'les pastilles', court:'Pastille', ic:'🍬'},
  champignon:{nom:'le champignon lumineux', court:'Champi', ic:'🍄'},
  courrier:{nom:'le courrier', court:'Courrier', ic:'✉️'},
  pain:{nom:'le pain', court:'Pain', ic:'🥖'},
  lavande:{nom:'les sachets de lavande', court:'Lavande', ic:'💐'},
  soupe:{nom:'la soupe', court:'Soupe', ic:'🍲'}
};
var OBJETS_HASARD = ['lanterne', 'cle', 'lettre', 'plume', 'carte', 'craie', 'bague', 'fiole', 'pioche', 'livre', 'loupe', 'cape', 'pastilles', 'champignon'];
var LIEUX_HASARD = ['moulin', 'puits', 'clocher', 'lavoir', 'taverne', 'boulangerie', 'poste', 'mairie', 'place', 'pont', 'chene', 'clairiere', 'potager', 'herboristerie'];
var MOMENTS_G = {
  matin:{nom:'le matin', court:'Matin', ic:'🌅'},
  midi:{nom:'à midi', court:'Midi', ic:'🕛'},
  apresmidi:{nom:'l\'après-midi', court:'Après-midi', ic:'☀️'},
  soir:{nom:'le soir', court:'Soir', ic:'🌇'},
  nuit:{nom:'la nuit', court:'Nuit', ic:'🌙'}
};
var MOMENTS_PAR_TAILLE = {2:['matin', 'soir'], 3:['matin', 'apresmidi', 'soir'], 4:['matin', 'midi', 'apresmidi', 'soir'], 5:['matin', 'midi', 'apresmidi', 'soir', 'nuit']};
/* Ce qu'on croirait : sert aux indices « Surprise ! » et à piéger l'intuition */
var HABITUDES = {farinel:{lieu:'moulin'}, gaspard:{lieu:'boulangerie', objet:'pain'}, anselme:{lieu:'clocher', objet:'cle'}, iris:{lieu:'herboristerie', objet:'lavande'},
  victor:{lieu:'poste', objet:'lettre'}, margot:{lieu:'taverne', objet:'soupe'}, basile:{lieu:'potager'}, silas:{objet:'lanterne'}, grosbec:{lieu:'mairie'},
  fortune:{objet:'pastilles'}, odette:{lieu:'odette'}};
/* Formes des verbes : v (il/elle), neg, ni (« n'était ni »), vn (« Ni A ni B n'était »), vp (pluriel féminin, « deux personnes … ») */
function vb(m, f, nm, nf, nim, nif, vn, vp){ return {v:{m:m, f:f}, neg:{m:nm, f:nf}, ni:{m:nim, f:nif}, vn:{m:vn, f:nf.replace(' pas', '')}, vp:vp}; }
var VERBES = {
  etait: vb('était', 'était', 'n\'était pas', 'n\'était pas', 'n\'était ni', 'n\'était ni', 'n\'était', 'étaient'),
  alle: vb('est allé', 'est allée', 'n\'est pas allé', 'n\'est pas allée', 'n\'est allé ni', 'n\'est allée ni', 'n\'est allé', 'sont allées'),
  avait: vb('avait', 'avait', 'n\'avait pas', 'n\'avait pas', 'n\'avait ni', 'n\'avait ni', 'n\'avait', 'avaient'),
  venu: vb('est venu', 'est venue', 'n\'est pas venu', 'n\'est pas venue', 'n\'est venu ni', 'n\'est venue ni', 'n\'est venu', 'sont venues'),
  passe: vb('est passé', 'est passée', 'n\'est pas passé', 'n\'est pas passée', 'n\'est passé ni', 'n\'est passée ni', 'n\'est passé', 'sont passées'),
  apporte: vb('a apporté', 'a apporté', 'n\'a pas apporté', 'n\'a pas apporté', 'n\'a apporté ni', 'n\'a apporté ni', 'n\'a apporté', 'ont apporté'),
  livre: vb('a livré', 'a livré', 'n\'a pas livré', 'n\'a pas livré', 'n\'a livré ni', 'n\'a livré ni', 'n\'a livré', 'ont livré')
};
var CATS_G = {
  lieu:{nom:'Lieux', ic:'🏠', pool:LIEUX_G, verbe:'etait', verbeMulti:'alle'},
  objet:{nom:'Objets', ic:'🎒', pool:OBJETS_G, verbe:'avait'},
  moment:{nom:'Moments', ic:'🕰️', pool:MOMENTS_G, verbe:'venu', ordre:true}
};

/* ---------- Structure par niveau ---------- */
function structureGrille(n){
  if(n <= 1) return {k:3, cats:[['lieu', 'un']]};
  if(n === 2) return {k:3, cats:[['lieu', 'un'], ['objet', 'un']]};
  if(n <= 4) return {k:4, cats:[['lieu', 'un'], ['objet', 'un']]};
  if(n === 5) return {k:4, cats:[['lieu', 'un'], ['objet', 'un'], ['moment', 'un']]};
  if(n === 6) return {k:4, cats:[['lieu', 'multi'], ['objet', 'un'], ['moment', 'un']]};
  if(n === 7) return {k:5, cats:[['lieu', 'un'], ['objet', 'un'], ['moment', 'un']]};
  return {k:5, cats:[['lieu', 'multi'], ['objet', 'un'], ['moment', 'un']]};
}
/* Poids des sortes d'indices par niveau (0 = jamais) */
function poidsTypes(n){
  if(n <= 1) return {est:3, nest:4};
  if(n === 2) return {est:2, nest:4, meme:2};
  if(n === 3) return {est:1, nest:4, nini:2, meme:2, ou:1};
  if(n === 4) return {est:1, nest:3, nini:2, nini_p:1, meme:3, ou:2, ou_p:1};
  if(n === 5) return {est:.5, nest:3, nini:2, nini_p:2, meme:3, ou:1, ou_p:1, apres:3};
  if(n === 6) return {nest:2, nini:2, nini_p:1, meme:3, ou:1, ou_p:1, apres:3, si:2, compte:2, rcompte:2, croise:1};
  if(n === 7) return {nest:2, nini:2, nini_p:2, meme:3, ou:1, ou_p:2, apres:3, si:2, contre:1};
  if(n === 8) return {nest:1.5, nini:2, nini_p:2, meme:3, ou_p:2, apres:3, si:3, soit:1, compte:2, rcompte:2, croise:2, contre:1};
  return {nest:1, nini:2, nini_p:2, meme:3, ou_p:1, apres:4, si:3, soit:2, compte:2, rcompte:2, croise:2, contre:1, pasfaux:1};
}
/* Facilité d'un indice (pour l'ordre d'élagage) */
var FACILITE = {est:0, pasfaux:1, nest:2, contre:2, nini:3, nini_p:3, ou:4, ou_p:4, rcompte:5, compte:5, meme:6, croise:6, apres:7, si:8, soit:8};

/* ---------- Modèle ---------- */
function itemNorm(pool, x){
  if(typeof x === 'string'){
    var b = pool[x];
    if(b) return {id:x, nom:b.nom, a:b.a || b.nom, court:b.court, ic:b.ic};
    return {id:x, nom:x, a:x, court:x, ic:''};
  }
  var base = (x.id && pool[x.id]) || {};
  var nom = x.nom || base.nom || x.id;
  return {id:x.id || x.nom, nom:nom, a:x.a || base.a || nom, court:x.court || base.court || cap(String(nom).replace(/^(le |la |les |l')/i, '')), ic:x.ic !== undefined ? x.ic : (base.ic || '')};
}
function persNorm(x){
  if(typeof x === 'string'){
    var info = pnjInfo(x);
    if(info) return info;
    var id = x.toLowerCase().normalize ? x.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '') : x.toLowerCase();
    info = pnjInfo(id);
    if(info) return Object.assign({}, info, {nom:x});
    return {id:x, nom:x, ic:'🙂', f:false, pnj:null};
  }
  var i2 = x.pnj ? pnjInfo(x.pnj) : (x.id ? pnjInfo(x.id) : null);
  return {id:x.id || x.nom, nom:x.nom || (i2 && i2.nom) || x.id, ic:x.ic || (i2 && i2.ic) || '🙂', f:x.f !== undefined ? !!x.f : !!(i2 && i2.f), pnj:x.pnj || (i2 ? i2.id : null)};
}
/* cats : [{id, mode, items, verbe?, nom?, ic?, ordre?, rmin, rmax, cmin, cmax}] */
function creerModele(pers, cats){
  var M = {pers:pers.map(persNorm), cats:[], off:[], N:0};
  var k = M.pers.length;
  cats.forEach(function(c){
    var def = CATS_G[c.id] || {nom:c.nom || c.id, ic:c.ic || '❔', pool:{}, verbe:'etait'};
    var items = c.items.map(function(x){ return itemNorm(def.pool, x); });
    var mode = c.mode === 'multi' ? 'multi' : 'un';
    if(mode === 'un' && items.length !== k) mode = 'multi';
    var verbe = c.verbe || (mode === 'multi' && def.verbeMulti ? def.verbeMulti : def.verbe);
    var C = {id:c.id, nom:c.nom || def.nom, ic:c.ic || def.ic, mode:mode, ordre:c.ordre !== undefined ? !!c.ordre : !!def.ordre, items:items,
      V:VERBES[verbe] || VERBES.etait, verbe:verbe,
      rmin:mode === 'un' ? 1 : (c.rmin !== undefined ? c.rmin : 1), rmax:mode === 'un' ? 1 : (c.rmax !== undefined ? c.rmax : 2),
      cmin:mode === 'un' ? 1 : (c.cmin !== undefined ? c.cmin : 0), cmax:mode === 'un' ? 1 : (c.cmax !== undefined ? c.cmax : k)};
    M.off.push(M.N); M.N += k * items.length; M.cats.push(C);
  });
  /* groupes : lignes et colonnes de chaque catégorie */
  M.groupes = [];
  M.cats.forEach(function(C, c){
    var K = C.items.length;
    for(var p = 0; p < k; p++) M.groupes.push({c:c, ligne:p, cells:plage(K).map(function(i){ return M.off[c] + p * K + i; }), min:C.rmin, max:C.rmax});
    for(var i = 0; i < K; i++) M.groupes.push({c:c, col:i, cells:plage(k).map(function(p){ return M.off[c] + p * K + i; }), min:C.cmin, max:C.cmax});
  });
  M.cellGroupes = plage(M.N).map(function(){ return []; });
  M.groupes.forEach(function(g, gi){ g.cells.forEach(function(x){ M.cellGroupes[x].push(gi); }); });
  return M;
}
function cel(M, c, p, i){ return M.off[c] + p * M.cats[c].items.length + i; }
function decode(M, x){
  for(var c = M.cats.length - 1; c >= 0; c--) if(x >= M.off[c]){ var K = M.cats[c].items.length, r = x - M.off[c]; return {c:c, p:Math.floor(r / K), i:r % K}; }
  return null;
}

/* ---------- Logique à trois valeurs ---------- */
function ev(n, V){
  if(typeof n === 'number') return V[n];
  var o = n[0], i, x, u = false;
  if(o === '!'){ x = ev(n[1], V); return x < 0 ? -1 : 1 - x; }
  if(o === '&'){ for(i = 1; i < n.length; i++){ x = ev(n[i], V); if(x === 0) return 0; if(x < 0) u = true; } return u ? -1 : 1; }
  if(o === '|'){ for(i = 1; i < n.length; i++){ x = ev(n[i], V); if(x === 1) return 1; if(x < 0) u = true; } return u ? -1 : 0; }
  if(o === '>'){ var a = ev(n[1], V); if(a === 0) return 1; var b = ev(n[2], V); if(b === 1) return 1; if(a === 1 && b === 0) return 0; return -1; }
  if(o === '^'){ var a2 = ev(n[1], V), b2 = ev(n[2], V); if(a2 < 0 || b2 < 0) return -1; return a2 !== b2 ? 1 : 0; }
  if(o === '#'){
    var un = 0, inc = 0;
    for(i = 3; i < n.length; i++){ x = V[n[i]]; if(x === 1) un++; else if(x < 0) inc++; }
    if(un > n[2] || un + inc < n[1]) return 0;
    if(un >= n[1] && un + inc <= n[2]) return 1;
    return -1;
  }
  return -1;
}
function cellsDe(n, acc){
  acc = acc || {};
  if(typeof n === 'number'){ acc[n] = 1; return acc; }
  if(n[0] === '#'){ for(var i = 3; i < n.length; i++) acc[n[i]] = 1; return acc; }
  for(var j = 1; j < n.length; j++) cellsDe(n[j], acc);
  return acc;
}

/* ---------- Indices : compilation et texte ---------- */
function holderMatch(M, x, s){ return s.p !== undefined ? (s.p === x ? true : false) : cel(M, s.c, x, s.i); }
function relOk(rel, j, k){
  if(rel === 'juste') return j === k + 1;
  if(rel === 'justeAvant') return j + 1 === k;
  if(rel === 'apres') return j > k;
  return j < k; /* avant */
}
function compiler(M, q){
  var k = M.pers.length;
  function L(p, c, i, s){ var x = cel(M, c, p, i); return s === false ? ['!', x] : x; }
  var C = q.c !== undefined ? M.cats[q.c] : null;
  switch(q.t){
    case 'est': case 'pasfaux': return L(q.p, q.c, q.i, true);
    case 'nest': case 'contre': return L(q.p, q.c, q.i, false);
    case 'nini': return ['&', L(q.p, q.c, q.i[0], false), L(q.p, q.c, q.i[1], false)];
    case 'nini_p': return ['&', L(q.p[0], q.c, q.i, false), L(q.p[1], q.c, q.i, false)];
    case 'ou': return [C.mode === 'un' ? '|' : '^', L(q.p, q.c, q.i[0]), L(q.p, q.c, q.i[1])];
    case 'ou_p': return [C.mode === 'un' ? '|' : '^', L(q.p[0], q.c, q.i), L(q.p[1], q.c, q.i)];
    case 'meme': return ['&'].concat(plage(k).map(function(p){ return ['>', L(p, q.c1, q.i1), L(p, q.c2, q.i2, q.s)]; }));
    case 'si': return ['>', L(q.a.p, q.a.c, q.a.i, q.a.s), L(q.b.p, q.b.c, q.b.i, q.b.s)];
    case 'soit': return ['^', L(q.a.p, q.a.c, q.a.i, q.a.s), L(q.b.p, q.b.c, q.b.i, q.b.s)];
    case 'compte': return ['#', q.n, q.n].concat(plage(k).map(function(p){ return cel(M, q.c, p, q.i); }));
    case 'rcompte': return ['#', q.n, q.n].concat(plage(C.items.length).map(function(i){ return cel(M, q.c, q.p, i); }));
    case 'croise':
      var o = ['|'].concat(plage(C.items.length).map(function(i){ return ['&', cel(M, q.c, q.p, i), cel(M, q.c, q.q, i)]; }));
      return q.neg ? ['!', o] : o;
    case 'apres':
      var K = M.cats[q.c].items.length, termes = ['|'];
      for(var x = 0; x < k; x++){
        var ma = holderMatch(M, x, q.a); if(ma === false) continue;
        for(var y = 0; y < k; y++){
          if(y === x) continue;
          var mb = holderMatch(M, y, q.b); if(mb === false) continue;
          for(var j = 0; j < K; j++) for(var jj = 0; jj < K; jj++){
            if(!relOk(q.rel, j, jj)) continue;
            var t = ['&', cel(M, q.c, x, j), cel(M, q.c, y, jj)];
            if(ma !== true) t.push(ma);
            if(mb !== true) t.push(mb);
            termes.push(t);
          }
        }
      }
      return q.neg ? ['!', termes] : termes;
  }
  return ['|'];
}
var REL_TXT = {juste:'juste après', justeAvant:'juste avant', apres:'après', avant:'avant'};
function nomP(M, p){ return M.pers[p].nom; }
function genre(M, p){ return M.pers[p].f ? 'f' : 'm'; }
function itemA(M, c, i){ return M.cats[c].items[i].a; }
function phraseLit(M, p, c, i, s, pronom){
  var g = genre(M, p), V = M.cats[c].V;
  var sujet = pronom ? (M.pers[p].f ? 'elle' : 'il') : nomP(M, p);
  return sujet + ' ' + (s === false ? V.neg[g] : V.v[g]) + ' ' + itemA(M, c, i);
}
function quiA(M, c, i){ return 'la personne qui ' + M.cats[c].V.v.f + ' ' + itemA(M, c, i); }
function sujetTxt(M, s){ return s.p !== undefined ? nomP(M, s.p) : quiA(M, s.c, s.i); }
function sujetGenre(M, s){ return s.p !== undefined ? genre(M, s.p) : 'f'; }
function texteIndice(M, q){
  var C = q.c !== undefined ? M.cats[q.c] : null, g, V;
  switch(q.t){
    case 'est': return phraseLit(M, q.p, q.c, q.i, true) + '.';
    case 'nest': return phraseLit(M, q.p, q.c, q.i, false) + '.';
    case 'contre': return 'Surprise : ' + phraseLit(M, q.p, q.c, q.i, false) + ' !';
    case 'pasfaux': return 'Il est faux de dire que ' + phraseLit(M, q.p, q.c, q.i, false) + '.';
    case 'nini': g = genre(M, q.p); return nomP(M, q.p) + ' ' + C.V.ni[g] + ' ' + itemA(M, q.c, q.i[0]) + ', ni ' + itemA(M, q.c, q.i[1]) + '.';
    case 'nini_p': return 'Ni ' + nomP(M, q.p[0]) + ' ni ' + nomP(M, q.p[1]) + ' ' + C.V.vn[M.pers[q.p[0]].f && M.pers[q.p[1]].f ? 'f' : 'm'] + ' ' + itemA(M, q.c, q.i) + '.';
    case 'ou':
      g = genre(M, q.p);
      if(C.mode === 'un') return nomP(M, q.p) + ' ' + C.V.v[g] + ' ' + itemA(M, q.c, q.i[0]) + ' ou ' + itemA(M, q.c, q.i[1]) + '.';
      return nomP(M, q.p) + ' ' + C.V.v[g] + ' soit ' + itemA(M, q.c, q.i[0]) + ', soit ' + itemA(M, q.c, q.i[1]) + ', mais pas les deux.';
    case 'ou_p':
      return 'C\'est ' + nomP(M, q.p[0]) + ' ou ' + nomP(M, q.p[1]) + ' qui ' + C.V.v[M.pers[q.p[0]].f && M.pers[q.p[1]].f ? 'f' : 'm'] + ' ' + itemA(M, q.c, q.i) + (C.mode === 'un' ? '.' : ', mais pas les deux.');
    case 'meme':
      V = M.cats[q.c2].V;
      return cap(quiA(M, q.c1, q.i1)) + ' ' + (q.s === false ? V.neg.f : V.v.f) + ' ' + itemA(M, q.c2, q.i2) + '.';
    case 'si':
      return 'Si ' + phraseLit(M, q.a.p, q.a.c, q.a.i, q.a.s) + ', alors ' + phraseLit(M, q.b.p, q.b.c, q.b.i, q.b.s, q.b.p === q.a.p) + '.';
    case 'soit':
      return 'Soit ' + phraseLit(M, q.a.p, q.a.c, q.a.i, q.a.s) + ', soit ' + phraseLit(M, q.b.p, q.b.c, q.b.i, q.b.s, q.b.p === q.a.p) + ', mais pas les deux.';
    case 'compte':
      if(q.n === 0) return 'Personne ' + C.V.vn.m + ' ' + itemA(M, q.c, q.i) + '.';
      if(q.n === 1) return 'Une seule personne ' + C.V.v.f + ' ' + itemA(M, q.c, q.i) + '.';
      return cap(['zéro', 'une', 'deux', 'trois', 'quatre', 'cinq'][q.n] || String(q.n)) + ' personnes ' + C.V.vp + ' ' + itemA(M, q.c, q.i) + '.';
    case 'rcompte':
      g = genre(M, q.p);
      var lieu = C.id === 'lieu', mot = lieu ? ['endroit', 'endroits'] : ['chose', 'choses'];
      if(q.n === 1) return nomP(M, q.p) + ' ' + C.V.vn[g] + (lieu ? ' qu\'à un seul ' : ' qu\'une seule ') + mot[0] + '.';
      return nomP(M, q.p) + ' ' + C.V.v[g] + (lieu ? ' à ' : ' ') + (['zéro', 'un', 'deux', 'trois', 'quatre'][q.n] || q.n) + ' ' + mot[1] + '.';
    case 'croise':
      var ff = M.pers[q.p].f && M.pers[q.q].f, pp = nomP(M, q.p) + ' et ' + nomP(M, q.q);
      if(C.id === 'lieu') return q.neg ? pp + ' ne sont jamais ' + (ff ? 'allées' : 'allés') + ' au même endroit.' : pp + ' sont ' + (ff ? 'allées' : 'allés') + ' tous les deux à un même endroit.';
      return q.neg ? pp + ' n\'ont rien en commun (' + C.nom.toLowerCase() + ').' : pp + ' ont au moins une chose en commun (' + C.nom.toLowerCase() + ').';
    case 'apres':
      V = M.cats[q.c].V; g = sujetGenre(M, q.a);
      return cap(sujetTxt(M, q.a)) + ' ' + (q.neg ? V.neg[g] : V.v[g]) + ' ' + REL_TXT[q.rel] + ' ' + sujetTxt(M, q.b) + '.';
  }
  return '…';
}

/* ---------- Solveur : propagation + retour arrière ---------- */
function preparer(M, asts){
  var S = {M:M, asts:asts, cellsClue:[], cellClues:plage(M.N).map(function(){ return []; })};
  asts.forEach(function(a, k){
    var cs = Object.keys(cellsDe(a)).map(Number);
    S.cellsClue.push(cs);
    cs.forEach(function(x){ S.cellClues[x].push(k); });
  });
  return S;
}
/* Propage depuis V (modifié sur place). file = cases changées (null = tout vérifier).
   raisons (facultatif) : raisons[case] = {g:groupe} ou {k:indice}. Renvoie false si contradiction. */
function propager(S, V, file, raisons, complet){
  var M = S.M;
  function poser(x, v, pourquoi){
    if(V[x] === v) return true;
    if(V[x] !== -1) return false;
    V[x] = v; file.push(x);
    if(raisons) raisons[x] = pourquoi;
    return true;
  }
  function groupe(gi){
    var G = M.groupes[gi], un = 0, inc = 0, j;
    for(j = 0; j < G.cells.length; j++){ var v = V[G.cells[j]]; if(v === 1) un++; else if(v < 0) inc++; }
    if(un > G.max || un + inc < G.min) return false;
    if(inc === 0) return true;
    if(un === G.max){ for(j = 0; j < G.cells.length; j++) if(V[G.cells[j]] < 0 && !poser(G.cells[j], 0, {g:gi})) return false; }
    else if(un + inc === G.min){ for(j = 0; j < G.cells.length; j++) if(V[G.cells[j]] < 0 && !poser(G.cells[j], 1, {g:gi})) return false; }
    return true;
  }
  function indice(k){
    var a = S.asts[k], r = ev(a, V);
    if(r === 0) return false;
    if(r === 1) return true;
    var cs = S.cellsClue[k];
    if(cs.length > 16 && !complet) return true; /* gros indices : seulement vérifiés (10× plus rapide) */
    for(var j = 0; j < cs.length; j++){
      var x = cs[j]; if(V[x] !== -1) continue;
      V[x] = 1; var r1 = ev(a, V);
      V[x] = 0; var r0 = ev(a, V);
      V[x] = -1;
      if(r1 === 0 && r0 === 0) return false;
      if(r1 === 0){ if(!poser(x, 0, {k:k})) return false; }
      else if(r0 === 0){ if(!poser(x, 1, {k:k})) return false; }
    }
    return true;
  }
  var gi, k;
  if(file === null){
    file = [];
    for(gi = 0; gi < M.groupes.length; gi++) if(!groupe(gi)) return false;
    for(k = 0; k < S.asts.length; k++) if(!indice(k)) return false;
  }
  var q = 0, vusG = {}, vusK = {};
  while(q < file.length){
    var x = file[q++];
    var gs = M.cellGroupes[x], ks = S.cellClues[x];
    for(var a = 0; a < gs.length; a++) if(!groupe(gs[a])) return false;
    for(var b = 0; b < ks.length; b++) if(!indice(ks[b])) return false;
  }
  return true;
}
/* Cherche jusqu'à `limite` solutions. Renvoie un tableau de Int8Array (sols.coupe = recherche abandonnée). */
var STATS = {appels:0, noeuds:0, coupes:0};
function resoudre(S, limite, V0){
  var M = S.M, sols = [], noeuds = 0;
  var V = V0 ? Int8Array.from(V0) : new Int8Array(M.N).fill(-1);
  if(!propager(S, V, null)) return sols;
  (function rec(V){
    if(sols.length >= limite) return;
    if(noeuds > (S.max || 30000)){ sols.coupe = true; return; }
    noeuds++;
    var best = -1, bestU = 1e9;
    for(var gi = 0; gi < M.groupes.length; gi++){
      var G = M.groupes[gi], u = 0;
      for(var j = 0; j < G.cells.length; j++) if(V[G.cells[j]] < 0) u++;
      if(u > 0 && u < bestU){ bestU = u; best = gi; if(u === 2) break; }
    }
    if(best < 0){
      for(var k = 0; k < S.asts.length; k++) if(ev(S.asts[k], V) !== 1) return;
      sols.push(V); return;
    }
    var cells = M.groupes[best].cells, x = -1;
    for(var j2 = 0; j2 < cells.length; j2++) if(V[cells[j2]] < 0){ x = cells[j2]; break; }
    for(var val = 1; val >= 0; val--){
      var W = Int8Array.from(V); W[x] = val;
      if(propager(S, W, [x])) rec(W);
      if(sols.length >= limite) return;
    }
  })(V);
  S.noeuds = noeuds; STATS.appels++; STATS.noeuds += noeuds; if(sols.coupe) STATS.coupes++;
  return sols;
}
function compter(M, indices, limite){
  var S = preparer(M, indices.map(function(q){ return q.ast || compiler(M, q); }));
  return resoudre(S, limite || 2);
}

/* ---------- Solution au hasard ---------- */
function solutionHasard(M, R, eviterHabitudes){
  var k = M.pers.length;
  for(var essai = 0; essai < 200; essai++){
    var V = new Int8Array(M.N).fill(0), ok = true;
    M.cats.forEach(function(C, c){
      var K = C.items.length;
      if(C.mode === 'un'){
        var perm = rShuffle(R, plage(K));
        for(var p = 0; p < k; p++) V[cel(M, c, p, perm[p])] = 1;
      } else {
        var cols = plage(K).map(function(){ return 0; });
        for(var p2 = 0; p2 < k; p2++){
          var nb = rInt(R, C.rmin, C.rmax), choix = rShuffle(R, plage(K)).filter(function(i){ return cols[i] < C.cmax; }).slice(0, nb);
          if(choix.length < C.rmin){ ok = false; return; }
          choix.forEach(function(i){ V[cel(M, c, p2, i)] = 1; cols[i]++; });
        }
        if(cols.some(function(n){ return n < C.cmin; })) ok = false;
        /* une catégorie 'multi' doit vraiment l'être : au moins un partage et une personne à 2 endroits */
        if(!cols.some(function(n){ return n >= 2; })) ok = false;
      }
    });
    if(!ok) continue;
    if(eviterHabitudes && R() < .75){
      var trahi = false;
      M.pers.forEach(function(P, p){
        var h = HABITUDES[P.pnj || P.id]; if(!h) return;
        M.cats.forEach(function(C, c){ if(!h[C.id]) return; C.items.forEach(function(it, i){ if(it.id === h[C.id] && V[cel(M, c, p, i)] === 1) trahi = true; }); });
      });
      if(trahi) continue;
    }
    return V;
  }
  return null;
}

/* ---------- Tirer un indice vrai (et faux dans alt si donné) ---------- */
function tirerIndice(M, R, type, sol, n){
  var k = M.pers.length, cats = M.cats;
  var cU = cats.map(function(C, c){ return C.mode === 'un' ? c : -1; }).filter(function(c){ return c >= 0; });
  var cM = cats.map(function(C, c){ return C.mode === 'multi' ? c : -1; }).filter(function(c){ return c >= 0; });
  var cO = cats.map(function(C, c){ return C.ordre && C.mode === 'un' ? c : -1; }).filter(function(c){ return c >= 0; });
  function v(p, c, i){ return sol[cel(M, c, p, i)]; }
  function itemsDe(p, c, val){ return plage(cats[c].items.length).filter(function(i){ return v(p, c, i) === val; }); }
  function persDe(c, i, val){ return plage(k).filter(function(p){ return v(p, c, i) === val; }); }
  function holder(c, i){ return persDe(c, i, 1)[0]; }
  var c, p, i, a, b;
  switch(type){
    case 'est': case 'pasfaux':
      c = rInt(R, 0, cats.length - 1); p = rInt(R, 0, k - 1); a = itemsDe(p, c, 1); if(!a.length) return null;
      return {t:type, p:p, c:c, i:rPick(R, a)};
    case 'nest':
      c = rInt(R, 0, cats.length - 1); p = rInt(R, 0, k - 1); a = itemsDe(p, c, 0); if(!a.length) return null;
      return {t:'nest', p:p, c:c, i:rPick(R, a)};
    case 'contre':
      var cands = [];
      M.pers.forEach(function(P, pp){
        var h = HABITUDES[P.pnj || P.id]; if(!h) return;
        cats.forEach(function(C, cc){ C.items.forEach(function(it, ii){ if(h[C.id] === it.id && v(pp, cc, ii) === 0) cands.push({t:'contre', p:pp, c:cc, i:ii}); }); });
      });
      return cands.length ? rPick(R, cands) : null;
    case 'nini':
      c = rInt(R, 0, cats.length - 1); p = rInt(R, 0, k - 1); a = rShuffle(R, itemsDe(p, c, 0)); if(a.length < 2) return null;
      return {t:'nini', p:p, c:c, i:[a[0], a[1]]};
    case 'nini_p':
      c = rInt(R, 0, cats.length - 1); i = rInt(R, 0, cats[c].items.length - 1); a = rShuffle(R, persDe(c, i, 0)); if(a.length < 2) return null;
      return {t:'nini_p', p:[a[0], a[1]], c:c, i:i};
    case 'ou':
      c = rInt(R, 0, cats.length - 1); p = rInt(R, 0, k - 1); a = itemsDe(p, c, 1); b = itemsDe(p, c, 0); if(!a.length || !b.length) return null;
      var paire = rShuffle(R, [rPick(R, a), rPick(R, b)]);
      return {t:'ou', p:p, c:c, i:paire};
    case 'ou_p':
      c = rInt(R, 0, cats.length - 1); i = rInt(R, 0, cats[c].items.length - 1); a = persDe(c, i, 1); b = persDe(c, i, 0); if(!a.length || !b.length) return null;
      return {t:'ou_p', p:rShuffle(R, [rPick(R, a), rPick(R, b)]), c:c, i:i};
    case 'meme':
      if(!cU.length || cats.length < 2) return null;
      var c1 = rPick(R, cU), c2 = rPick(R, plage(cats.length).filter(function(x){ return x !== c1; }));
      var i1 = rInt(R, 0, cats[c1].items.length - 1), h = holder(c1, i1);
      var s = R() < .5;
      a = itemsDe(h, c2, s ? 1 : 0); if(!a.length) return null;
      return {t:'meme', c1:c1, i1:i1, c2:c2, i2:rPick(R, a), s:s};
    case 'si': case 'soit':
      function litHasard(pp){ var cc = rInt(R, 0, cats.length - 1), ii = rInt(R, 0, cats[cc].items.length - 1), ss = R() < .55; return {p:pp, c:cc, i:ii, s:ss}; }
      function val(l){ var x = v(l.p, l.c, l.i); return l.s ? x : 1 - x; }
      for(var t = 0; t < 30; t++){
        var A = litHasard(rInt(R, 0, k - 1)), B = litHasard(R() < .7 ? A.p : rInt(R, 0, k - 1));
        if(A.p === B.p && A.c === B.c) continue;
        var va = val(A), vb2 = val(B);
        if(type === 'si'){ if((va === 0 && vb2 === 0) || (va === 1 && vb2 === 1)) return {t:'si', a:A, b:B}; }
        else if(va !== vb2) return {t:'soit', a:A, b:B};
      }
      return null;
    case 'compte':
      if(!cM.length) return null;
      c = rPick(R, cM); i = rInt(R, 0, cats[c].items.length - 1);
      return {t:'compte', c:c, i:i, n:persDe(c, i, 1).length};
    case 'rcompte':
      if(!cM.length) return null;
      c = rPick(R, cM); p = rInt(R, 0, k - 1);
      return {t:'rcompte', c:c, p:p, n:itemsDe(p, c, 1).length};
    case 'croise':
      if(!cM.length) return null;
      c = rPick(R, cM); a = rShuffle(R, plage(k));
      var part = plage(cats[c].items.length).some(function(ii){ return v(a[0], c, ii) && v(a[1], c, ii); });
      return {t:'croise', c:c, p:a[0], q:a[1], neg:!part};
    case 'apres':
      if(!cO.length) return null;
      c = rPick(R, cO);
      var autres = cU.filter(function(x){ return x !== c; });
      function sujet(){
        if(n >= 7 && autres.length && R() < .35){ var cc = rPick(R, autres); return {c:cc, i:rInt(R, 0, cats[cc].items.length - 1)}; }
        return {p:rInt(R, 0, k - 1)};
      }
      function pos(s){ var pp = s.p !== undefined ? s.p : holder(s.c, s.i); return {p:pp, j:itemsDe(pp, c, 1)[0]}; }
      for(var t2 = 0; t2 < 30; t2++){
        var sa = sujet(), sb = sujet(), pa = pos(sa), pb = pos(sb);
        if(pa.p === pb.p) continue;
        var rel = rPick(R, n >= 6 ? ['juste', 'juste', 'justeAvant', 'avant', 'apres'] : ['juste', 'juste', 'justeAvant', 'avant']);
        var vrai = relOk(rel, pa.j, pb.j);
        if(vrai) return {t:'apres', c:c, a:sa, b:sb, rel:rel, neg:false};
        if(n >= 9 && (rel === 'juste' || rel === 'justeAvant') && R() < .5) return {t:'apres', c:c, a:sa, b:sb, rel:rel, neg:true};
      }
      return null;
  }
  return null;
}
function cleIndice(q){ return JSON.stringify(q); }
function choisirType(R, poids){
  var tot = 0, ks = Object.keys(poids); ks.forEach(function(t){ tot += poids[t]; });
  var r = R() * tot;
  for(var j = 0; j < ks.length; j++){ r -= poids[ks[j]]; if(r <= 0) return ks[j]; }
  return ks[ks.length - 1];
}

/* ---------- Générateur : solution unique garantie, indices superflus retirés ---------- */
function genererGrille(n, opts){
  opts = opts || {};
  var R = opts.graine !== undefined ? aleaGraine(opts.graine) : Math.random;
  n = Math.max(1, Math.min(12, Math.round(n)));
  var st = structureGrille(n), k = st.k;
  for(var tentative = 0; tentative < 10; tentative++){
    /* budget de temps par essai : un essai trop long est abandonné pour un autre tirage (sauf après 3 essais) */
    var limite = tentative < 3 ? Date.now() + (opts.budget || 600) : Infinity;
    var persIds = rShuffle(R, PNJ_IDS).slice(0, k);
    var cats = st.cats.map(function(cm){
      var id = cm[0], items;
      if(id === 'moment') items = MOMENTS_PAR_TAILLE[k].slice();
      else items = rShuffle(R, id === 'lieu' ? LIEUX_HASARD : OBJETS_HASARD).slice(0, k);
      return {id:id, mode:cm[1], items:items, rmin:1, rmax:2, cmin:0, cmax:3};
    });
    /* place les habitudes en jeu : quelqu'un « devrait » être au moulin… */
    persIds.forEach(function(pid){
      var h = HABITUDES[pid]; if(!h || R() < .4) return;
      cats.forEach(function(c){ var it = h[c.id]; if(it && c.id !== 'moment' && c.items.indexOf(it) < 0 && (c.id === 'lieu' ? LIEUX_G[it] : OBJETS_G[it])) c.items[rInt(R, 0, c.items.length - 1)] = it; });
    });
    cats.forEach(function(c){ if(c.id !== 'moment'){ var vus = {}; c.items = c.items.filter(function(x){ if(vus[x]) return false; vus[x] = 1; return true; }); var pool = c.id === 'lieu' ? LIEUX_HASARD : OBJETS_HASARD; while(c.items.length < k){ var x = rPick(R, pool); if(!vus[x]){ vus[x] = 1; c.items.push(x); } } } });
    var M = creerModele(persIds, cats);
    var sol = solutionHasard(M, R, n >= 7);
    if(!sol) continue;
    var poids = poidsTypes(n);
    var choisis = [], vus = {};
    function ajouter(q){ var key = cleIndice(q); if(vus[key]) return false; vus[key] = 1; q.ast = compiler(M, q); choisis.push(q); return true; }
    /* départ : quelques indices au hasard */
    var depart = Math.max(1, Math.round(k * M.cats.length * .5));
    for(var t = 0; t < depart * 6 && choisis.length < depart; t++){ var q0 = tirerIndice(M, R, choisirType(R, poids), sol, n); if(q0) ajouter(q0); }
    /* puis des indices qui éliminent une autre solution, jusqu'à l'unicité */
    var ok = false, tours = 0;
    while(tours++ < 80){
      if(Date.now() > limite) break;
      var sols = compter(M, choisis, 2);
      if(sols.length === 1 && !sols.coupe){ ok = true; break; }
      if(!sols.length && !sols.coupe) break;
      var alt = sols.filter(function(sv){ return !sv.every(function(x, j){ return x === sol[j]; }); })[0];
      if(!alt){
        /* recherche trop longue : on resserre avec un indice de plus */
        for(var e0 = 0; e0 < 50; e0++){ var q1 = tirerIndice(M, R, choisirType(R, poids), sol, n); if(q1 && ajouter(q1)) break; }
        continue;
      }
      var trouve = false;
      for(var e = 0; e < 300 && !trouve; e++){
        var ty = e < 240 ? choisirType(R, poids) : rPick(R, ['nest', 'est', 'nini']);
        var q = tirerIndice(M, R, ty, sol, n); if(!q) continue;
        var ast = compiler(M, q);
        if(ev(ast, alt) === 0 && !vus[cleIndice(q)]){ ajouter(q); trouve = true; }
      }
      if(!trouve){
        /* repli : une case où les deux solutions diffèrent */
        for(var x = 0; x < M.N; x++) if(alt[x] !== sol[x]){ var d = decode(M, x); ajouter({t:sol[x] ? 'est' : 'nest', p:d.p, c:d.c, i:d.i}); break; }
      }
    }
    if(!ok) continue;
    /* élagage : retirer tout indice dont on peut se passer */
    var ordre = rShuffle(R, choisis.slice());
    if(n >= 5) ordre.sort(function(a, b){ return FACILITE[a.t] - FACILITE[b.t]; });
    else if(n <= 3) ordre.sort(function(a, b){ return FACILITE[b.t] - FACILITE[a.t]; });
    var tropLong = false;
    ordre.forEach(function(q){
      if(tropLong || Date.now() > limite){ tropLong = true; return; }
      var sans = choisis.filter(function(x){ return x !== q; });
      var r2 = compter(M, sans, 2);
      if(r2.length === 1 && !r2.coupe) choisis = sans;
    });
    if(tropLong) continue;
    var indices = rShuffle(R, choisis).map(function(q){ var o = Object.assign({}, q); o.texte = texteIndice(M, q); return o; });
    return {M:M, sol:sol, indices:indices, niveau:n};
  }
  return null;
}

/* ---------- Énigme fournie par une enquête ---------- */
function idDe(liste, v){
  if(v === undefined || v === null) return -1;
  for(var j = 0; j < liste.length; j++){ var o = liste[j]; if(o.id === v || o.nom === v || o.court === v) return j; }
  var s = String(v).toLowerCase();
  for(var j2 = 0; j2 < liste.length; j2++){ var o2 = liste[j2]; if(String(o2.nom).toLowerCase() === s || String(o2.id).toLowerCase() === s) return j2; }
  return -1;
}
function enigmeFournie(p){
  if(!(p.personnes && p.personnes.length && ((p.lieux && p.lieux.length) || (p.objets && p.objets.length) || (p.moments && p.moments.length)))) return null;
  var pers = p.personnes, k = pers.length, cats = [];
  var verbes = p.verbes || {}, modes = p.modes || {};
  [['lieu', p.lieux], ['objet', p.objets], ['moment', p.moments]].forEach(function(x){
    if(!x[1] || !x[1].length) return;
    var mode = modes[x[0]] || (x[1].length === k ? 'un' : 'multi');
    var c = {id:x[0], mode:mode, items:x[1], verbe:verbes[x[0]]};
    if(p.bornes && p.bornes[x[0]]) Object.assign(c, p.bornes[x[0]]);
    cats.push(c);
  });
  var M = creerModele(pers, cats);
  var catIdx = {}; M.cats.forEach(function(C, c){ catIdx[C.id] = c; });
  /* solution : {personne: {lieu, objet, moment}} ou ancien format {personne: lieu} ; valeurs multiples en tableau */
  var sol = new Int8Array(M.N).fill(0), solOk = true;
  M.pers.forEach(function(P, pi){
    var brut = p.solution ? (p.solution[P.id] !== undefined ? p.solution[P.id] : p.solution[P.nom]) : undefined;
    if(brut === undefined && p.solution){ Object.keys(p.solution).forEach(function(kk){ if(idDe([P], kk) === 0) brut = p.solution[kk]; }); }
    if(brut === undefined){ solOk = false; return; }
    if(typeof brut === 'string' || Array.isArray(brut)) brut = {lieu:brut};
    M.cats.forEach(function(C, c){
      var vals = brut[C.id]; if(vals === undefined){ solOk = false; return; }
      (Array.isArray(vals) ? vals : [vals]).forEach(function(vv){ var ii = idDe(C.items, vv); if(ii < 0) solOk = false; else sol[cel(M, c, pi, ii)] = 1; });
    });
  });
  function rP(v){ var j = idDe(M.pers, v); if(j < 0) throw new Error('personne inconnue : ' + v); return j; }
  function rC(v){ if(catIdx[v] === undefined) throw new Error('catégorie inconnue : ' + v); return catIdx[v]; }
  function rI(c, v){ var j = idDe(M.cats[c].items, v); if(j < 0) throw new Error('élément inconnu : ' + v); return j; }
  function rL(l){ var c = rC(l.c); return {p:rP(l.p), c:c, i:rI(c, l.i), s:l.s !== false}; }
  function rS(s){ if(s.p !== undefined) return {p:rP(s.p)}; var c = rC(s.c); return {c:c, i:rI(c, s.i)}; }
  var indices = (p.indices || []).map(function(x){
    if(typeof x === 'string') return {t:'texte', texte:x};
    var q = null;
    try{
      switch(x.t){
        case 'est': case 'nest': case 'contre': case 'pasfaux': var c = rC(x.c); q = {t:x.t, p:rP(x.p), c:c, i:rI(c, x.i)}; break;
        case 'nini': case 'ou': var c2 = rC(x.c); q = {t:x.t, p:rP(x.p), c:c2, i:x.i.map(function(v){ return rI(c2, v); })}; break;
        case 'nini_p': case 'ou_p': var c3 = rC(x.c); q = {t:x.t, p:x.p.map(rP), c:c3, i:rI(c3, x.i)}; break;
        case 'meme': var a1 = rC(x.c1), a2 = rC(x.c2); q = {t:'meme', c1:a1, i1:rI(a1, x.i1), c2:a2, i2:rI(a2, x.i2), s:x.s !== false}; break;
        case 'si': case 'soit': q = {t:x.t, a:rL(x.a), b:rL(x.b)}; break;
        case 'compte': var c4 = rC(x.c); q = {t:'compte', c:c4, i:rI(c4, x.i), n:x.n}; break;
        case 'rcompte': var c5 = rC(x.c); q = {t:'rcompte', c:c5, p:rP(x.p), n:x.n}; break;
        case 'croise': q = {t:'croise', c:rC(x.c), p:rP(x.p), q:rP(x.q), neg:!!x.neg}; break;
        case 'apres': q = {t:'apres', c:rC(x.c || 'moment'), a:rS(x.a), b:rS(x.b), rel:x.rel || 'juste', neg:!!x.neg}; break;
      }
    }catch(e){ if(window.console) console.warn('grille : indice ignoré', x, e.message); q = null; }
    if(!q) return {t:'texte', texte:x.texte || '…', ic:x.ic};
    q.ast = compiler(M, q);
    q.texte = x.texte || texteIndice(M, q);
    if(x.ic) q.ic = x.ic;
    return q;
  });
  return {M:M, sol:solOk ? sol : null, indices:indices, fixe:true};
}

/* Indice d'aide : une case qu'on peut déduire des indices et des cases JUSTES déjà remplies.
   Renvoie {x, v, k (indice responsable ou -1)} ou null. */
function deduction(E, marques){
  var M = E.M, logiques = E.indices.filter(function(q){ return q.ast; });
  var S = preparer(M, logiques.map(function(q){ return q.ast; }));
  var V = new Int8Array(M.N).fill(-1);
  for(var x = 0; x < M.N; x++) if(marques[x] !== -1 && E.sol && marques[x] === E.sol[x]) V[x] = marques[x];
  var raisons = {}, W = Int8Array.from(V);
  propager(S, W, null, raisons, true);
  var forcees = [];
  for(var y = 0; y < M.N; y++) if(V[y] === -1 && W[y] !== -1 && marques[y] !== W[y]) forcees.push({x:y, v:W[y], r:raisons[y]});
  function idxIndice(r){ if(!r || r.k === undefined) return -1; return E.indices.indexOf(logiques[r.k]); }
  var choix = forcees.filter(function(f){ return f.r && f.r.k !== undefined && f.v === 1; })[0] || forcees.filter(function(f){ return f.r && f.r.k !== undefined; })[0] ||
    forcees.filter(function(f){ return f.v === 1; })[0] || forcees[0];
  if(choix) return {x:choix.x, v:choix.v, k:idxIndice(choix.r)};
  /* raisonnement par l'absurde : « si c'était oui, ça casserait » */
  for(var z = 0; z < M.N; z++){
    if(V[z] !== -1 || marques[z] === E.sol[z]) continue;
    var T = Int8Array.from(V); T[z] = 1 - E.sol[z];
    if(!propager(S, T, [z], null, true)) return {x:z, v:E.sol[z], k:-1, absurde:true};
  }
  for(var w = 0; w < M.N; w++) if(E.sol && marques[w] !== E.sol[w] && E.sol[w] === 1) return {x:w, v:1, k:-1};
  return null;
}
/* Contradictions visibles (mod révèle) : indices faux et lignes/colonnes impossibles avec les marques du joueur. */
function contradictions(E, marques){
  var M = E.M, V = Int8Array.from(marques), res = {indices:[], cells:{}};
  E.indices.forEach(function(q, k){ if(q.ast && ev(q.ast, V) === 0) res.indices.push(k); });
  M.groupes.forEach(function(G){
    var un = 0, inc = 0;
    G.cells.forEach(function(x){ if(V[x] === 1) un++; else if(V[x] < 0) inc++; });
    if(un > G.max || un + inc < G.min) G.cells.forEach(function(x){ res.cells[x] = 1; });
  });
  return res;
}

MJ.grilleLogique = {creerModele:creerModele, compiler:compiler, ev:ev, preparer:preparer, propager:propager, resoudre:resoudre, compter:compter,
  generer:genererGrille, fournie:enigmeFournie, deduction:deduction, contradictions:contradictions, texte:texteIndice, structure:structureGrille,
  cel:cel, decode:decode, stats:STATS, VERBES:VERBES, LIEUX:LIEUX_G, OBJETS:OBJETS_G, MOMENTS:MOMENTS_G};

/* ==========================================================
   SUPERPOSER LES PLANS
   Un plan d'aujourd'hui (encre sur parchemin) et un ou plusieurs vieux calques transparents
   (encre rouge) à DÉPLACER, TOURNER et ZOOMER jusqu'à ce que les repères coïncident.
   Bien aligné (dans la tolérance) et tenu un instant : le secret s'allume.
   Gestes : un doigt glisse ; deux doigts pincent (zoom) et tournent ; molette (zoom), Maj+molette (rotation),
   flèches du clavier, Q/E (tourner), +/− (zoom). Boutons ▲◀▶▼ ⟲ ⟳ − + (appui long = plus vite) et deux réglettes.
   Petit aimant seulement tout près de la solution (plus fort avec une aide).
   mods : echelle (zoom bloqué, déjà juste), rotation (rotation bloquée, déjà juste), zone (× tolérance et aimant),
          aide (1 ou 2 paires de repères entourées + aimant fort), revele (contour fantôme de la bonne place + aimant fort),
          temps (+5 s par point), lent (< 1 : plus de temps), erreurs (+15 s par point).
   params : carte ∈ moulin | village | clocher | foret | puits ; secret (id d'un secret de la carte) ;
            passage (texte affiché à la révélation, ancien paramètre) ; au hasard sinon.
   ========================================================== */
var PT = 400, PC = 200;
function lisse(pts){
  var d = 'M' + f1(pts[0][0]) + ' ' + f1(pts[0][1]);
  for(var i = 0; i < pts.length - 1; i++){
    var p0 = pts[i - 1] || pts[i], p1 = pts[i], p2 = pts[i + 1], p3 = pts[i + 2] || p2;
    d += 'C' + f1(p1[0] + (p2[0] - p0[0]) / 6) + ' ' + f1(p1[1] + (p2[1] - p0[1]) / 6) + ' ' + f1(p2[0] - (p3[0] - p1[0]) / 6) + ' ' + f1(p2[1] - (p3[1] - p1[1]) / 6) + ' ' + f1(p2[0]) + ' ' + f1(p2[1]);
  }
  return d;
}
function brisee(pts){ return 'M' + pts.map(function(p){ return f1(p[0]) + ' ' + f1(p[1]); }).join('L'); }
function grp(x, y, a, inner){ return '<g transform="translate(' + f1(x) + ' ' + f1(y) + ')' + (a ? ' rotate(' + f1(a) + ')' : '') + '">' + inner + '</g>'; }
function arbreD(r){
  var n = Math.max(7, Math.round(r * .62)), d = '', rr = r * Math.sin(Math.PI / n) * 1.15;
  for(var i = 0; i <= n; i++){
    var a = i * 2 * Math.PI / n, x = r * Math.cos(a), y = r * Math.sin(a);
    d += (i ? 'A' + f1(rr) + ' ' + f1(rr) + ' 0 0 1 ' : 'M') + f1(x) + ' ' + f1(y);
  }
  return '<path class="tf" d="' + d + 'Z"/><circle class="tn" r="' + f1(Math.max(1.4, r * .1)) + '"/>' + (r > 20 ? '<circle class="t fin" r="' + f1(r * .55) + '"/>' : '');
}
function pinD(r){
  var d = ''; for(var i = 0; i < 9; i++){ var a = i * 2 * Math.PI / 9; d += 'M' + f1(Math.cos(a) * r * .45) + ' ' + f1(Math.sin(a) * r * .45) + 'L' + f1(Math.cos(a) * r) + ' ' + f1(Math.sin(a) * r); }
  return '<circle class="tf" r="' + f1(r * .5) + '"/><path class="t fin" d="' + d + '"/>';
}
var SYMB = {
  puits:'<circle class="tf" r="10"/><circle class="tn" r="4.5"/><path class="t" d="M-15 0H15M-15 -4V4M15 -4V4"/>',
  fontaine:'<circle class="tf" r="13"/><circle class="t" r="7.5"/><circle class="tn" r="2.6"/><path class="t fin" d="M0 -7.5V-11M0 7.5V11M-7.5 0H-11M7.5 0H11"/>',
  clocher:'<rect class="tf" x="-15" y="-15" width="30" height="30"/><path class="t" d="M-15 -15L15 15M15 -15L-15 15"/><circle class="tf" r="5.5"/><circle class="tn" r="1.8"/>',
  meule:'<circle class="tf" r="12"/><circle class="tn" r="2.6"/><path class="t fin" d="M0 -12V-5M0 12V5M-12 0H-5M12 0H5M-8.5 -8.5L-3.5 -3.5M8.5 8.5L3.5 3.5M8.5 -8.5L3.5 -3.5M-8.5 8.5L-3.5 3.5"/>',
  roue:'<circle class="tf" r="15"/><circle class="t" r="4"/><path class="t fin" d="M0 -15V15M-15 0H15M-10.6 -10.6L10.6 10.6M10.6 -10.6L-10.6 10.6"/><path class="t" d="M0 -15v-5M0 15v5M-15 0h-5M15 0h5M-10.6 -10.6l-3.5 -3.5M10.6 10.6l3.5 3.5M10.6 -10.6l3.5 -3.5M-10.6 10.6l-3.5 3.5"/>',
  croix:'<rect class="tf" x="-5" y="-5" width="10" height="10"/><path class="t" d="M0 -12V12M-7 -5H7"/>',
  tombe:'<rect class="tf" x="-7" y="-10" width="14" height="20" rx="6"/><path class="t fin" d="M0 -6V5M-4 -2.5H4"/>',
  borne:'<path class="tf" d="M-6 7V-2A6 6 0 0 1 6 -2V7Z"/><circle class="tn" r="1.7" cy="-1"/>',
  souche:'<circle class="tf" r="9"/><circle class="t fin" r="5.5"/><circle class="t fin" r="2"/>',
  rocher:'<path class="tf" d="M-12 4L-9 -7L1 -12L11 -5L13 5L3 11L-8 9Z"/><path class="t fin" d="M-5 -3L2 -6M-2 3L6 1"/>',
  four:'<circle class="tf" r="11"/><path class="t fin" d="M-6 -2A6 6 0 0 1 6 -2"/><rect class="tn" x="-4" y="6" width="8" height="7"/>',
  tour:'<circle class="tf" r="13"/><circle class="t" r="8"/><path class="t" d="M0 -13v-4M0 13v4M-13 0h-4M13 0h4M-9.2 -9.2l-2.8 -2.8M9.2 9.2l2.8 2.8M9.2 -9.2l2.8 -2.8M-9.2 9.2l-2.8 2.8"/>',
  lavoir:'<rect class="tf" x="-19" y="-12" width="38" height="24"/><rect class="eau" x="-13" y="-6.5" width="26" height="13"/><path class="t fin" d="M-10 -1q2.5 -2 5 0t5 0t5 0t5 0"/><circle class="tn" r="2" cx="-19" cy="-12"/><circle class="tn" r="2" cx="19" cy="-12"/><circle class="tn" r="2" cx="-19" cy="12"/><circle class="tn" r="2" cx="19" cy="12"/>',
  source:'<circle class="eau" r="8"/><circle class="t" r="8"/><path class="t fin" d="M-15 -11q3.5 -3 7 0t7 0t7 0M-15 13q3.5 -3 7 0t7 0t7 0"/>',
  panneau:'<path class="t" d="M0 9V-12M0 -10H11L14 -7L11 -4H0M0 -1H-10L-13 2L-10 5H0"/><circle class="tn" r="2" cy="9"/>',
  cabane:'<rect class="tf" x="-11" y="-9" width="22" height="18"/><path class="t" d="M-11 -9L11 9M11 -9L-11 9"/>',
  champi:'<path class="tf" d="M-6 0A6 5 0 0 1 6 0Z"/><path class="t fin" d="M0 0V5"/>'
};
function maisonD(w, h){
  return '<rect class="tf" x="' + f1(-w / 2) + '" y="' + f1(-h / 2) + '" width="' + w + '" height="' + h + '"/><rect class="hach" x="' + f1(-w / 2) + '" y="0" width="' + w + '" height="' + f1(h / 2) + '"/><path class="t fin" d="M' + f1(-w / 2) + ' 0H' + f1(w / 2) + '"/>';
}
function batD(w, h){
  return '<rect class="tf" x="' + f1(-w / 2) + '" y="' + f1(-h / 2) + '" width="' + w + '" height="' + h + '"/><rect class="t fin" x="' + f1(-w / 2 + 4) + '" y="' + f1(-h / 2 + 4) + '" width="' + (w - 8) + '" height="' + (h - 8) + '"/>';
}
function potagerD(w, h){
  var s = '<rect class="tf" x="' + f1(-w / 2) + '" y="' + f1(-h / 2) + '" width="' + w + '" height="' + h + '"/><path class="t fin" stroke-dasharray="1 5" d="';
  for(var y = -h / 2 + 7; y < h / 2 - 3; y += 8) s += 'M' + f1(-w / 2 + 5) + ' ' + f1(y) + 'H' + f1(w / 2 - 5);
  return s + '"/>';
}
function pontD(L){ var a = L / 2; return '<path class="tf" d="M' + (-a) + ' -8H' + a + 'V8H' + (-a) + 'Z"/><path class="t" d="M' + (-a - 6) + ' -14L' + (-a) + ' -8M' + (a + 6) + ' -14L' + a + ' -8M' + (-a - 6) + ' 14L' + (-a) + ' 8M' + (a + 6) + ' 14L' + a + ' 8"/>'; }
function placeD(r){ return '<circle class="t" r="' + r + '" stroke-dasharray="3 5"/><circle class="t fin" r="' + (r - 6) + '"/>'; }
function clairiereD(r){ return '<circle class="t" r="' + r + '" stroke-dasharray="2 6"/>' + [[-14, -10], [12, -16], [18, 10], [-8, 16], [0, 0]].map(function(q){ return grp(q[0], q[1], 0, SYMB.champi); }).join(''); }
/* Éléments : [type, ou, …] — ou : 2 = sur les deux plans, 1 = plan d'aujourd'hui seulement (construit après), 0 = vieux plan seulement (disparu) */
var LIGNES = {riviere:1, route:1, sentier:1, mur:1, txt:1};
function dessinerEl(e, couche){
  var t = e[0], a = e.slice(2), base = couche === 'base';
  switch(t){
    case 'riviere':
      var dR = lisse(a[0]);
      return base ? '<path class="v1" stroke-width="' + (a[1] + 4) + '" d="' + dR + '"/><path class="v2" stroke-width="' + a[1] + '" d="' + dR + '"/><path class="v3" d="' + dR + '"/>'
        : '<path class="vc" stroke-width="' + a[1] + '" d="' + dR + '"/><path class="t fin" d="' + dR + '"/>';
    case 'route':
      var dT = lisse(a[0]);
      return base ? '<path class="r1" stroke-width="' + (a[1] + 3.5) + '" d="' + dT + '"/><path class="r2" stroke-width="' + a[1] + '" d="' + dT + '"/>' : '<path class="t rc" d="' + dT + '"/>';
    case 'sentier': return '<path class="t ' + (base ? 'sent' : 'sentc') + '" d="' + lisse(a[0]) + '"/>';
    case 'mur': var dM = brisee(a[0]); return '<path class="t mur" d="' + dM + '"/><path class="t murt" d="' + dM + '"/>';
    case 'txt': return base ? '<text class="lbl" x="' + a[0] + '" y="' + a[1] + '"' + (a[3] ? ' transform="rotate(' + a[3] + ' ' + a[0] + ' ' + a[1] + ')"' : '') + '>' + esc(a[2]) + '</text>' : '';
    case 'arbre': return grp(a[0], a[1], 0, arbreD(a[2] || 13));
    case 'pin': return grp(a[0], a[1], 0, pinD(a[2] || 12));
    case 'maison': return grp(a[0], a[1], a[4] || 0, maisonD(a[2], a[3]));
    case 'bat': return grp(a[0], a[1], a[4] || 0, batD(a[2], a[3]));
    case 'potager': return grp(a[0], a[1], a[4] || 0, potagerD(a[2], a[3]));
    case 'pont': return grp(a[0], a[1], a[2] || 0, pontD(a[3] || 60));
    case 'place': return grp(a[0], a[1], 0, placeD(a[2] || 46));
    case 'clairiere': return grp(a[0], a[1], 0, clairiereD(a[2] || 40));
    case 'clocher': return grp(a[0], a[1], a[2] || 0, a[3] ? '<g transform="scale(' + a[3] + ')">' + SYMB.clocher + '</g>' : SYMB.clocher);
    default: return SYMB[t] ? grp(a[0], a[1], a[2] || 0, SYMB[t]) : '';
  }
}
function estPoint(e){ return !LIGNES[e[0]]; }

var CARTES = {
  moulin:{nom:'Le moulin', vieux:'Moulin des Fondateurs', els:[
    ['riviere', 2, [[292, -20], [300, 50], [284, 120], [296, 190], [316, 260], [302, 330], [312, 420]], 36],
    ['route', 2, [[-20, 214], [60, 206], [120, 196], [178, 188]], 9],
    ['route', 2, [[150, 196], [146, 240], [170, 300], [226, 322], [276, 322]], 8],
    ['route', 2, [[340, 318], [380, 310], [420, 300]], 8],
    ['sentier', 0, [[120, 196], [104, 120], [90, 40], [80, -20]]],
    ['sentier', 1, [[350, 140], [360, 210], [356, 300], [344, 318]]],
    ['bat', 2, 226, 168, 88, 64, 0], ['meule', 2, 210, 166], ['meule', 2, 242, 166], ['roue', 2, 282, 168],
    ['maison', 2, 162, 264, 66, 42, -8], ['pont', 2, 308, 320, -4, 74],
    ['puits', 2, 110, 262], ['croix', 2, 62, 198], ['borne', 2, 226, 236],
    ['arbre', 2, 52, 62, 17], ['arbre', 2, 104, 36, 12], ['arbre', 1, 142, 96, 11], ['arbre', 2, 36, 330, 18], ['arbre', 1, 96, 374, 13],
    ['arbre', 2, 372, 52, 14], ['arbre', 1, 384, 378, 15], ['arbre', 2, 236, 376, 12], ['arbre', 1, 190, 66, 10],
    ['potager', 1, 364, 176, 54, 70, 0], ['maison', 1, 370, 262, 30, 24, 6],
    ['tour', 0, 344, 96], ['maison', 0, 86, 128, 26, 20, 12], ['four', 0, 150, 350],
    ['txt', 1, 226, 126, 'Moulin'], ['txt', 1, 160, 302, 'Grange'], ['txt', 1, 312, 356, 'Pont'], ['txt', 1, 364, 130, 'Potager'], ['txt', 1, 272, 92, 'Rivière', 80], ['txt', 1, 112, 292, 'Puits']
  ], secrets:{
    meules:{nom:'la cave sous les meules', fin:'escalier', pts:[[178, 192], [196, 204], [218, 200], [226, 182], [226, 168]]},
    tunnel:{nom:'le vieux tunnel du moulin', fin:'escalier', pts:[[226, 196], [204, 224], [176, 240], [140, 256], [110, 262]]}
  }},
  village:{nom:'Les rues du village', vieux:'Brumeval, an 1726', els:[
    ['route', 2, [[200, 150], [196, 80], [210, -20]], 10],
    ['route', 2, [[200, 250], [204, 320], [200, 420]], 11],
    ['route', 2, [[250, 206], [320, 214], [420, 222]], 10],
    ['route', 2, [[166, 238], [128, 296], [86, 348], [52, 420]], 7],
    ['route', 1, [[152, 198], [80, 192], [-20, 186]], 9],
    ['place', 2, 200, 200, 50], ['fontaine', 2, 200, 200],
    ['bat', 2, 146, 128, 62, 40, -4], ['clocher', 2, 276, 118, 0], ['maison', 2, 114, 226, 46, 36, 0], ['maison', 2, 292, 234, 42, 34, 4], ['four', 2, 306, 262],
    ['maison', 2, 174, 282, 26, 30, 0], ['maison', 1, 230, 286, 26, 30, 0], ['maison', 1, 172, 332, 26, 30, 0], ['maison', 2, 232, 338, 26, 30, 0], ['maison', 1, 174, 384, 26, 30, 0], ['maison', 1, 230, 390, 26, 30, 0],
    ['maison', 1, 334, 190, 30, 24, 0], ['maison', 2, 376, 196, 30, 24, 0], ['maison', 1, 338, 244, 30, 24, 0],
    ['lavoir', 2, 66, 360, 12], ['puits', 2, 58, 86],
    ['arbre', 2, 110, 58, 14], ['arbre', 1, 330, 56, 13], ['arbre', 2, 360, 330, 16], ['arbre', 1, 300, 392, 12], ['arbre', 2, 34, 252, 12],
    ['tour', 0, 252, 54], ['croix', 0, 336, 304], ['maison', 0, 100, 160, 22, 18, 20],
    ['txt', 1, 146, 98, 'Mairie'], ['txt', 1, 276, 88, 'Clocher'], ['txt', 1, 114, 258, 'Taverne'], ['txt', 1, 66, 392, 'Lavoir'], ['txt', 1, 214, 168, 'Place'], ['txt', 1, 214, 310, 'Rue des Lanternes', 90], ['txt', 1, 360, 228, 'Rue du Four']
  ], secrets:{
    place:{nom:'la croix sous la place', fin:'croix', pts:[[148, 150], [166, 174], [184, 190], [200, 200]]},
    ruelle:{nom:'le passage de la ruelle des Brumes', fin:'escalier', pts:[[150, 262], [124, 300], [98, 330], [70, 354]]},
    mairie:{nom:'la cachette sous la mairie', fin:'eclat', pts:[[176, 168], [160, 146], [146, 128]]}
  }},
  clocher:{nom:'Le clocher', vieux:'Le clocher et sa crypte', els:[
    ['mur', 2, [[78, 58], [340, 54], [352, 332], [232, 338]]], ['mur', 2, [[168, 340], [70, 342], [78, 58]]],
    ['route', 2, [[200, 420], [200, 340], [200, 300]], 10], ['route', 1, [[-20, 384], [90, 366], [200, 362]], 8],
    ['clocher', 2, 200, 118, 0, 1.6], ['bat', 2, 200, 230, 82, 112, 0],
    ['tombe', 2, 288, 196], ['tombe', 2, 318, 226], ['tombe', 2, 284, 262], ['tombe', 2, 320, 292], ['tombe', 1, 300, 318], ['tombe', 0, 262, 300],
    ['arbre', 2, 128, 300, 24], ['puits', 2, 112, 200], ['maison', 2, 120, 118, 42, 34, 0], ['croix', 2, 200, 318],
    ['arbre', 2, 372, 120, 14], ['arbre', 1, 374, 372, 15], ['arbre', 2, 38, 180, 13], ['arbre', 1, 40, 52, 12], ['arbre', 2, 300, 120, 11],
    ['tour', 0, 300, 82], ['four', 0, 62, 300],
    ['txt', 1, 200, 70, 'Clocher'], ['txt', 1, 200, 236, 'Église'], ['txt', 1, 304, 172, 'Cimetière'], ['txt', 1, 128, 340, 'Le vieil if'], ['txt', 1, 120, 92, 'Presbytère']
  ], secrets:{
    crypte:{nom:'l\'escalier de la crypte', fin:'escalier', pts:[[200, 306], [190, 262], [194, 210], [200, 160], [200, 124]]},
    tombe:{nom:'la cachette sous la vieille tombe', fin:'eclat', pts:[[226, 328], [244, 314], [262, 300]]},
    cloche:{nom:'la trappe de la Grande Voix', fin:'croix', pts:[[150, 160], [174, 140], [200, 118]]}
  }},
  foret:{nom:'Les chemins de la forêt', vieux:'Les bois des Fondateurs', els:[
    ['riviere', 2, [[-20, 252], [60, 270], [140, 254], [220, 290], [300, 278], [420, 306]], 16],
    ['sentier', 2, [[200, 420], [204, 330], [200, 266], [190, 196], [140, 132]]],
    ['sentier', 2, [[200, 266], [258, 220], [296, 156], [300, 112]]],
    ['sentier', 1, [[-20, 142], [60, 152], [130, 130]]], ['sentier', 0, [[300, 112], [356, 44], [400, -12]]],
    ['pont', 2, 203, 278, 84, 34], ['arbre', 2, 130, 112, 32], ['clairiere', 2, 300, 108, 42],
    ['rocher', 2, 236, 194], ['rocher', 2, 252, 340], ['rocher', 2, 84, 214], ['souche', 2, 76, 330], ['cabane', 1, 346, 236], ['panneau', 2, 216, 306],
    ['pin', 2, 40, 40, 13], ['pin', 1, 82, 58, 12], ['pin', 2, 184, 48, 14], ['pin', 1, 240, 72, 12], ['pin', 2, 372, 190, 13], ['pin', 1, 382, 262, 12],
    ['pin', 2, 30, 382, 14], ['pin', 1, 120, 384, 12], ['pin', 2, 304, 382, 13], ['pin', 1, 364, 358, 12], ['pin', 1, 160, 330, 11], ['arbre', 2, 250, 138, 12], ['arbre', 1, 30, 300, 12],
    ['cabane', 0, 150, 206], ['puits', 0, 330, 330], ['tour', 0, 56, 112],
    ['txt', 1, 130, 166, 'Vieux Chêne'], ['txt', 1, 300, 58, 'Clairière'], ['txt', 1, 320, 300, 'Ruisseau', 8], ['txt', 1, 346, 214, 'Cabane']
  ], secrets:{
    chene:{nom:'le tunnel du Vieux Chêne', fin:'escalier', pts:[[236, 196], [204, 182], [172, 160], [146, 134], [132, 116]]},
    clairiere:{nom:'la cachette d\'herbes rares', fin:'eclat', pts:[[262, 160], [282, 132], [304, 106]]},
    source:{nom:'la source cachée', fin:'eclat', pts:[[216, 306], [234, 322], [250, 338]]}
  }},
  puits:{nom:'Les puits de Brumeval', vieux:'Les eaux de Brumeval', els:[
    ['route', 2, [[-20, 200], [100, 202], [200, 200], [300, 198], [420, 210]], 9],
    ['route', 2, [[200, -20], [198, 100], [200, 200], [204, 300], [206, 420]], 9],
    ['route', 1, [[210, 210], [300, 300], [380, 420]], 7], ['sentier', 0, [[36, 160], [60, 120], [88, 84]]],
    ['fontaine', 2, 200, 200], ['puits', 2, 88, 84], ['puits', 2, 314, 96], ['puits', 2, 110, 316], ['puits', 2, 304, 318], ['puits', 0, 58, 250],
    ['lavoir', 2, 206, 364, 0], ['source', 2, 36, 160],
    ['maison', 2, 150, 150, 30, 26, 0], ['maison', 1, 252, 150, 30, 26, 0], ['maison', 1, 150, 252, 30, 26, 0], ['maison', 2, 256, 258, 30, 26, 45], ['maison', 1, 360, 150, 28, 22, 0],
    ['arbre', 2, 360, 40, 14], ['arbre', 1, 40, 360, 15], ['arbre', 2, 372, 372, 13], ['arbre', 1, 24, 40, 12], ['croix', 2, 140, 200], ['borne', 2, 260, 202],
    ['tour', 0, 360, 250], ['four', 0, 120, 380],
    ['txt', 1, 200, 236, 'Fontaine'], ['txt', 1, 206, 396, 'Lavoir'], ['txt', 1, 36, 186, 'Source'], ['txt', 1, 88, 112, 'Puits'], ['txt', 1, 314, 124, 'Puits'], ['txt', 1, 110, 344, 'Puits'], ['txt', 1, 304, 346, 'Puits']
  ], secrets:{
    puits:{nom:'le tunnel du vieux puits', fin:'escalier', pts:[[88, 84], [122, 122], [158, 166], [194, 194]]},
    source:{nom:'la source cachée', fin:'eclat', pts:[[58, 250], [46, 212], [36, 170]]},
    lavoir:{nom:'la cachette du lavoir', fin:'croix', pts:[[304, 318], [262, 342], [214, 360]]}
  }}
};
var CARTES_IDS = Object.keys(CARTES);

/* ---------- Géométrie : M(p) = s·R(θ)·(p − C) + C + t ---------- */
function appliquer(e, x, y){
  var r = e.th * Math.PI / 180, c = Math.cos(r) * e.s, s = Math.sin(r) * e.s, dx = x - PC, dy = y - PC;
  return {x:PC + c * dx - s * dy + e.tx, y:PC + s * dx + c * dy + e.ty};
}
function matrice(e){
  var r = e.th * Math.PI / 180, a = Math.cos(r) * e.s, b = Math.sin(r) * e.s;
  return 'matrix(' + [a, b, -b, a, PC + e.tx - (a * PC - b * PC), PC + e.ty - (b * PC + a * PC)].map(function(v){ return v.toFixed(4); }).join(' ') + ')';
}
/* Tourner de α° et zoomer de k autour du point q (coordonnées de la carte) */
function autour(e, q, k, alpha){
  var r = alpha * Math.PI / 180, c = Math.cos(r) * k, s = Math.sin(r) * k;
  var vx = PC + e.tx - q.x, vy = PC + e.ty - q.y;
  return {s:e.s * k, th:e.th + alpha, tx:c * vx - s * vy + q.x - PC, ty:s * vx + c * vy + q.y - PC};
}
var POINTS_TEST = [[PC - 130, PC - 130], [PC + 130, PC - 130], [PC + 130, PC + 130], [PC - 130, PC + 130], [PC, PC]];
function erreurPlan(e){
  var m = 0;
  POINTS_TEST.forEach(function(q){ var r = appliquer(e, q[0], q[1]); m = Math.max(m, Math.hypot(r.x - q[0], r.y - q[1])); });
  return m;
}
function normAngle(a){ a = ((a + 180) % 360 + 360) % 360 - 180; return a; }

/* ---------- Réglages ---------- */
function reglagesPlans(n, mods){
  mods = mods || {};
  var couches = n >= 9 ? 3 : n >= 6 ? 2 : 1;
  var rotMax = n <= 2 ? 0 : Math.round(U.parNiveau(n, -10, 180, 20, 180));
  var rotMin = n <= 2 ? 0 : Math.round(U.parNiveau(n, 0, 40, 6, 40));
  var zoomMax = n <= 3 ? 1 : U.parNiveau(n, 1.0, 1.65, 1.12, 1.7);
  var tol = U.parNiveau(n, 18, 6, 4.5) * (mods.zone || 1);
  var aimant = (mods.aide || mods.revele) ? 2.5 : n <= 3 ? 1.8 : 1.35;
  var base = U.parNiveau(n, 150, 65, 55);
  var temps = Math.round(base * (1 + .65 * (couches - 1)) / Math.min(1, mods.lent || 1) + (mods.temps || 0) * 5 + (mods.erreurs || 0) * 15);
  var brule = n <= 3 ? 0 : U.parNiveau(n, .02, .3, .1, .32);
  var p = {
    couches:couches, rotMin:rotMin, rotMax:rotMax, zoomMax:zoomMax, tolerance:tol, aimant:aimant, temps:temps,
    brule:brule, dechire:n >= 8, encre:U.parNiveau(n, .95, .58, .55), effaces:n >= 6, leurres:n <= 3 ? 0 : n <= 6 ? 2 : 3,
    rose:n < 7, guide:n <= 3 || (mods.aide || 0) > 0, pairesAide:Math.min(2, mods.aide || 0), revele:!!mods.revele,
    echelleBloquee:!!mods.echelle || zoomMax <= 1, rotationBloquee:!!mods.rotation || rotMax <= 0,
    raisonEchelle:mods.echelle ? 'aide' : 'niveau', raisonRotation:mods.rotation ? 'aide' : 'niveau',
    maintien:U.parNiveau(n, .7, 1, .6, 1.1)
  };
  p.lignes = [
    {nom:'Calques à poser', val:String(couches)},
    {nom:'Il faut tourner', val:p.rotationBloquee ? (mods.rotation ? 'non (aide 🔒)' : 'non') : (rotMax >= 90 ? 'oui, beaucoup' : 'un peu')},
    {nom:'Il faut zoomer', val:p.echelleBloquee ? (mods.echelle ? 'non (aide 🔒)' : 'non') : 'oui'},
    {nom:'Précision', val:tol >= 14 ? 'large' : tol >= 9 ? 'moyenne' : 'très fine'},
    {nom:'Parchemin', val:brule > 0 ? (p.dechire ? 'brûlé et déchiré' : 'brûlé d\'un côté') : 'en bon état'},
    {nom:'Bougie', val:temps + ' s'}
  ];
  if(p.pairesAide) p.lignes.push({nom:'Repères montrés', val:String(p.pairesAide)});
  if(p.revele) p.lignes.push({nom:'Place du calque montrée', val:'oui'});
  return p;
}

/* ---------- Construction des feuilles ---------- */
function bordBrule(R, prof, dechire){
  /* bord gauche déchiqueté à x ≈ prof (repère « brûlé à gauche » ; tourné ensuite) */
  var pts = [], y = -4;
  while(y < PT + 8){ pts.push([prof + (R() - .5) * 14 + (R() < .15 ? R() * 16 : 0), y]); y += 9 + R() * 8; }
  pts.push([prof + (R() - .5) * 10, PT + 4]);
  return pts;
}
function tournePts(pts, quart){
  return pts.map(function(p){
    var x = p[0] - PC, y = p[1] - PC;
    for(var i = 0; i < quart; i++){ var t = x; x = -y; y = t; }
    return [x + PC, y + PC];
  });
}
function construireFeuilles(C, p, R, secretId){
  var L = p.couches;
  var communs = C.els.filter(function(e){ return estPoint(e) && e[1] === 2; });
  var disparus = C.els.filter(function(e){ return estPoint(e) && e[1] === 0; });
  var feuilles = [];
  var cotes = rShuffle(R, [0, 1, 2, 3]);
  var melange = rShuffle(R, communs);
  for(var k = 0; k < L; k++){
    var miens = L === 1 ? communs.slice() : melange.filter(function(e, j){ return j % L === k; });
    if(L > 1){ /* un ou deux repères en commun avec la feuille suivante : on peut s'aider des calques déjà posés */
      var extra = melange[(k * 3 + 1) % melange.length]; if(miens.indexOf(extra) < 0) miens.push(extra);
    }
    var leurres = rShuffle(R, disparus).slice(0, Math.min(p.leurres, disparus.length));
    if(L > 1) leurres = leurres.filter(function(e, j){ return (j + k) % L === 0 || j === 0; });
    var cote = cotes[k % 4];
    /* brûlure : on garde au moins 3 repères visibles */
    var prof = p.brule * PT, bord = null, vis = miens;
    for(var essai = 0; essai < 6 && prof > 0; essai++){
      bord = tournePts(bordBrule(R, prof, p.dechire), cote);
      var lim = prof + 12;
      vis = miens.filter(function(e){
        var x = e[2] - PC, y = e[3] - PC;
        for(var i = 0; i < (4 - cote) % 4; i++){ var t = x; x = -y; y = t; }
        return x + PC > lim;
      });
      if(vis.length >= 3) break;
      prof *= .7;
    }
    if(prof <= 0) vis = miens;
    var dech = null;
    if(p.dechire){
      /* coin arraché, à l'opposé de la brûlure */
      var c = (cote + 2) % 4, base = [[PT + 6, PT * .62], [PT * .84, PT * .78], [PT * .74, PT + 6]];
      var j = []; for(var u = 0; u <= 6; u++){ var tt = u / 6, q = u < 3 ? [base[0][0] + (base[1][0] - base[0][0]) * tt * 2, base[0][1] + (base[1][1] - base[0][1]) * tt * 2] : [base[1][0] + (base[2][0] - base[1][0]) * (tt - .5) * 2, base[1][1] + (base[2][1] - base[1][1]) * (tt - .5) * 2]; j.push([q[0] + (R() - .5) * 9, q[1] + (R() - .5) * 9]); }
      dech = tournePts(j, c);
      var cx = dech[3][0], cy = dech[3][1];
      vis = vis.filter(function(e){ return Math.hypot(e[2] - cx, e[3] - cy) > 40 || vis.length <= 3; });
    }
    feuilles.push({k:k, els:vis, leurres:leurres, bord:bord, cote:cote, prof:prof, dechire:dech});
  }
  return feuilles;
}
function etatDepart(p, R){
  for(var essai = 0; essai < 30; essai++){
    var a = R() * Math.PI * 2, d = 40 + R() * 70;
    var th = p.rotationBloquee ? 0 : (R() < .5 ? -1 : 1) * (p.rotMin + R() * Math.max(0, p.rotMax - p.rotMin));
    var s = p.echelleBloquee ? 1 : Math.exp((R() < .5 ? -1 : 1) * (Math.log(1.06) + R() * Math.max(0, Math.log(p.zoomMax) - Math.log(1.06))));
    var e = {s:s, th:th, tx:Math.cos(a) * d, ty:Math.sin(a) * d};
    if(erreurPlan(e) > p.tolerance * 4) return e;
  }
  return {s:1, th:0, tx:80, ty:60};
}
function morceaux(pts, L){
  var P = pts.slice();
  while(P.length < L + 1){ var j = 0, dm = 0; for(var i = 0; i < P.length - 1; i++){ var d = Math.hypot(P[i + 1][0] - P[i][0], P[i + 1][1] - P[i][1]); if(d > dm){ dm = d; j = i; } } P.splice(j + 1, 0, [(P[j][0] + P[j + 1][0]) / 2, (P[j][1] + P[j + 1][1]) / 2]); }
  var res = [], n = P.length - 1;
  for(var k = 0; k < L; k++){ var a = Math.round(k * n / L), b = Math.round((k + 1) * n / L); res.push(P.slice(a, b + 1)); }
  return res;
}
function finSecret(type, x, y){
  if(type === 'croix') return grp(x, y, 0, '<circle class="sec-onde" r="16"/><path class="sec-x-halo" d="M-11 -11L11 11M11 -11L-11 11"/><path class="sec-x" d="M-11 -11L11 11M11 -11L-11 11"/>');
  if(type === 'escalier') return grp(x, y, 0, '<circle class="sec-onde" r="18"/><rect class="sec-esc-fond" x="-12" y="-12" width="24" height="24" rx="3"/><path class="sec-esc" d="M-12 -7H12M-12 -2H12M-12 3H12M-12 8H12M-12 -12V12M12 -12V12"/>');
  return grp(x, y, 0, '<circle class="sec-onde" r="16"/><path class="sec-eclat" d="M0 -14L3 -3L14 0L3 3L0 14L-3 3L-14 0L-3 -3Z"/>');
}
function choisirCarte(p, R){
  var id = p.carte && CARTES[p.carte] ? p.carte : null;
  if(!id && p.secret){ CARTES_IDS.forEach(function(c){ if(!id && CARTES[c].secrets[p.secret]) id = c; }); }
  if(!id && p.passage){
    var t = String(p.passage).toLowerCase();
    if(/moulin|meule/.test(t)) id = 'moulin'; else if(/clocher|crypte|cloche|tombe/.test(t)) id = 'clocher'; else if(/chêne|chene|forêt|foret|clairi/.test(t)) id = 'foret';
    else if(/puits|source|lavoir/.test(t)) id = 'puits'; else if(/place|ruelle|mairie|village/.test(t)) id = 'village';
  }
  if(!id) id = rPick(R, CARTES_IDS);
  var C = CARTES[id], sid = p.secret && C.secrets[p.secret] ? p.secret : null;
  if(!sid && p.passage){ var t2 = String(p.passage).toLowerCase(); Object.keys(C.secrets).forEach(function(s){ if(!sid && t2.indexOf(s) >= 0) sid = s; }); }
  if(!sid) sid = rPick(R, Object.keys(C.secrets));
  return {id:id, C:C, sid:sid, S:C.secrets[sid]};
}
function svgDefs(){
  return '<defs>' +
    '<linearGradient id="mjp-parch" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f6e9c8"/><stop offset=".55" stop-color="#ecd9ab"/><stop offset="1" stop-color="#dcc28c"/></linearGradient>' +
    '<radialGradient id="mjp-vign" cx="50%" cy="50%" r="72%"><stop offset=".62" stop-color="#8a6a3a" stop-opacity="0"/><stop offset="1" stop-color="#7a5528" stop-opacity=".38"/></radialGradient>' +
    '<pattern id="mjp-hach" width="5" height="5" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><path d="M0 0V5" stroke="#3b2a1a" stroke-width="1" opacity=".55"/></pattern>' +
  '</defs>';
}
function roseD(x, y, r){
  return grp(x, y, 0, '<circle class="t fin" r="' + r + '"/><path class="tn" d="M0 ' + (-r - 4) + 'L4 0L0 ' + (r * .55) + 'L-4 0Z"/><path class="t fin" d="M' + (-r) + ' 0H' + r + 'M0 ' + r + 'V' + (-r) + '"/><text class="rose-n" y="' + (-r - 7) + '">N</text>');
}
function baseSVG(C){
  var s = '<g class="mjp-base">';
  s += '<rect width="400" height="400" fill="url(#mjp-parch)"/>';
  var taches = [[70, 300, 34, .07], [320, 80, 28, .06], [250, 330, 20, .05], [120, 120, 16, .05]];
  s += taches.map(function(t){ return '<circle cx="' + t[0] + '" cy="' + t[1] + '" r="' + t[2] + '" fill="#9b7742" opacity="' + t[3] + '"/>'; }).join('');
  s += C.els.filter(function(e){ return e[1] >= 1 && LIGNES[e[0]] && e[0] !== 'txt'; }).map(function(e){ return dessinerEl(e, 'base'); }).join('');
  s += C.els.filter(function(e){ return e[1] >= 1 && !LIGNES[e[0]]; }).map(function(e){ return dessinerEl(e, 'base'); }).join('');
  s += C.els.filter(function(e){ return e[0] === 'txt'; }).map(function(e){ return dessinerEl(e, 'base'); }).join('');
  s += roseD(368, 34, 15);
  s += '<g class="cartouche"><rect x="10" y="368" width="150" height="24" rx="4"/><text x="85" y="385">' + esc(C.nom) + '</text></g>';
  s += '<rect width="400" height="400" fill="url(#mjp-vign)"/><rect class="cadre" x="4" y="4" width="392" height="392"/>';
  return s + '</g>';
}
function feuilleSVG(C, F, p, uid){
  var s = '<g class="mjp-feuille futur" data-k="' + F.k + '">';
  var poly = null;
  if(F.bord){
    /* papier restant : à droite du bord brûlé (avant rotation) */
    var bord = F.bord, quart = F.cote;
    var coin = tournePts([[PT + 30, PT + 30], [PT + 30, -30]], quart);
    poly = bord.concat([coin[0], coin[1]]);
  }
  s += '<defs>' + (poly ? '<clipPath id="' + uid + '-b" clipPathUnits="userSpaceOnUse"><path d="' + brisee(poly) + 'Z"/></clipPath>' : '') +
    (F.dechire ? '<clipPath id="' + uid + '-d" clipPathUnits="userSpaceOnUse"><path d="' + brisee([[-40, -40], [440, -40], [440, 440], [-40, 440]]) + 'Z' + brisee(F.dechire.concat([F.dechire[F.dechire.length - 1].map(function(v){ return v > PC ? PT + 60 : -60; })])) + 'Z" clip-rule="evenodd"/></clipPath>' : '') + '</defs>';
  s += '<g' + (poly ? ' clip-path="url(#' + uid + '-b)"' : '') + '><g' + (F.dechire ? ' clip-path="url(#' + uid + '-d)"' : '') + '>';
  s += '<rect class="calque-papier" width="400" height="400"/>';
  s += '<g class="encre" style="opacity:' + f1(p.encre * 100) / 100 + '">';
  s += C.els.filter(function(e){ return e[1] !== 1 && LIGNES[e[0]] && e[0] !== 'txt'; }).map(function(e){ return dessinerEl(e, 'calque'); }).join('');
  s += F.els.map(function(e, j){ return '<g class="rep' + (p.effaces && j % 3 === 2 ? ' efface' : '') + '">' + dessinerEl(e, 'calque') + '</g>'; }).join('');
  s += F.leurres.map(function(e){ return dessinerEl(e, 'calque'); }).join('');
  if(p.rose) s += roseD(368, 34, 15);
  s += '<text class="titre-vieux" x="' + (F.cote === 2 ? 290 : 110) + '" y="' + (F.cote === 3 ? 380 : 26) + '">' + esc(C.vieux) + (p.couches > 1 ? ' · ' + (F.k + 1) : '') + '</text>';
  s += '</g>';
  if(F.bord) s += '<path class="roussi" d="' + brisee(F.bord) + '"/>';
  s += '</g></g>';
  if(F.bord) s += '<path class="brule" d="' + brisee(F.bord) + '"/><path class="braise" d="' + brisee(F.bord) + '"/>';
  if(F.dechire) s += '<path class="dechirure" d="' + brisee(F.dechire) + '"/>';
  s += '<rect class="calque-bord" width="400" height="400"/>';
  s += '<g class="mjp-anneaux">' + F.els.map(function(e, j){ return '<circle class="anneau" data-j="' + j + '" cx="' + e[2] + '" cy="' + e[3] + '" r="17"/>'; }).join('') + '<g class="aide-c"></g></g>';
  return s + '</g>';
}

MJ.enregistrer('plans', {
  nom:'Superposer les plans', role:'sage', ic:'🗺️',
  consigne:'Pose le vieux calque sur le plan : fais-le glisser, tourne-le et zoome jusqu\'à ce que les dessins tombent pile l\'un sur l\'autre. Tiens-le en place : le secret apparaît !',
  reglages:reglagesPlans,
  demo: function(el){
    return demoMain(el,
      '<div class="mjp-d"><div class="mjp-d-carte"><i style="left:22%;top:24%"></i><i style="left:68%;top:32%"></i><i style="left:40%;top:70%"></i><b class="mjp-d-x">✕</b></div>' +
      '<div class="mjp-d-calque"><i style="left:22%;top:24%"></i><i style="left:68%;top:32%"></i><i style="left:40%;top:70%"></i></div></div>',
      6400, [
        [0, function(c){ c.box.classList.remove('e1', 'e2', 'e3', 'vu'); c.main('👆'); c.va(78, 74); }],
        [600, function(c){ c.box.classList.add('e1'); c.va(58, 58); }],
        [1900, function(c){ c.main('✌️'); c.va(56, 52); }],
        [2300, function(c){ c.box.classList.add('e2'); }],
        [3500, function(c){ c.box.classList.add('e3'); }],
        [4500, function(c){ c.box.classList.add('vu'); c.main('👍'); c.va(82, 80); }]
      ]);
  },
  jouer: function(el, p, fin){
    var T = minuteurs(), R = Math.random;
    var choix = choisirCarte(p, R), C = choix.C, S = choix.S;
    var label = p.passage ? String(p.passage) : S.nom;
    var L = Math.max(1, Math.min(3, p.couches || 1));
    var pp = Object.assign({}, p, {couches:L});
    var feuilles = construireFeuilles(C, pp, R, choix.sid);
    var uid = 'mjp' + Math.floor(R() * 1e6);
    var tol = p.tolerance || 10, aimant = tol * (p.aimant || 1.35);
    var tempsTotal = p.temps || 120, temps = tempsTotal;
    var termine = false, arrete = false, pause = false, k = 0;
    var etats = feuilles.map(function(){ return etatDepart(p, R); });
    var e = etats[0];
    var parts = morceaux(S.pts, L), fin0 = S.pts[S.pts.length - 1];
    /* --- HTML --- */
    var rotUI = p.rotationBloquee ? '<div class="mjp-reg verrou"><span>⟳ 🔒</span><small>' + (p.raisonRotation === 'aide' ? 'Rotation bloquée (aide)' : 'Pas besoin de tourner') + '</small></div>' :
      '<div class="mjp-reg" data-reg="rot"><button type="button" class="mjp-b" data-rot="-1" aria-label="Tourner à gauche">⟲</button><input type="range" class="mjp-range" data-range="rot" min="-180" max="180" step="0.25" aria-label="Rotation"><button type="button" class="mjp-b" data-rot="1" aria-label="Tourner à droite">⟳</button></div>';
    var zoomUI = p.echelleBloquee ? '<div class="mjp-reg verrou"><span>🔍 🔒</span><small>' + (p.raisonEchelle === 'aide' ? 'Taille bloquée (aide)' : 'Pas besoin de zoomer') + '</small></div>' :
      '<div class="mjp-reg" data-reg="zoom"><button type="button" class="mjp-b" data-zoom="-1" aria-label="Plus petit">−</button><input type="range" class="mjp-range" data-range="zoom" min="-1" max="1" step="0.002" aria-label="Taille"><button type="button" class="mjp-b" data-zoom="1" aria-label="Plus grand">+</button></div>';
    el.innerHTML = '<div class="mjp mjsp-fond">' +
      '<div class="mjp-haut">' +
        '<div class="mjp-couches"><span class="mjp-couche-txt"></span><span class="mjp-pastilles">' + feuilles.map(function(F, j){ return '<i data-k="' + j + '"></i>'; }).join('') + '</span></div>' +
        '<div class="mjp-bougie" aria-label="Bougie"><span>🕯️</span><div class="mjp-bougie-barre"><i></i></div></div>' +
      '</div>' +
      '<div class="mjp-milieu">' +
        '<div class="mjp-carte"><svg class="mjp-svg" viewBox="0 0 400 400" aria-label="Le plan et le vieux calque">' + svgDefs() + baseSVG(C) +
          '<g class="mjp-aide-base"></g>' +
          (p.revele ? '<rect class="mjp-fantome" x="2" y="2" width="396" height="396" rx="2"/>' : '') +
          feuilles.map(function(F){ return feuilleSVG(C, F, pp, uid + '-' + F.k); }).join('') +
          '<g class="mjp-secret">' + parts.map(function(pts, j){ var d = lisse(pts); return '<g class="sec-part" data-k="' + j + '"><path class="sec-halo" d="' + d + '"/><path class="sec-trait" d="' + d + '"/></g>'; }).join('') +
            '<g class="sec-fin">' + finSecret(S.fin, fin0[0], fin0[1]) + '</g>' +
            '<text class="sec-nom" x="' + f1(U.borne(fin0[0], 110, 290)) + '" y="' + f1(fin0[1] > 300 ? fin0[1] - 34 : fin0[1] + 44) + '">' + esc(cap(label)) + '</text></g>' +
          '<circle class="mjp-tenir" r="24" cx="200" cy="200"/>' +
        '</svg><div class="mjp-astuce"></div></div>' +
        '<div class="mjp-commandes">' +
          '<div class="mjp-pad"><button type="button" class="mjp-b haut" data-dep="0,-1" aria-label="Monter">▲</button><button type="button" class="mjp-b gauche" data-dep="-1,0" aria-label="À gauche">◀</button>' +
            '<span class="mjp-pad-c" aria-hidden="true">✥</span><button type="button" class="mjp-b droite" data-dep="1,0" aria-label="À droite">▶</button><button type="button" class="mjp-b bas" data-dep="0,1" aria-label="Descendre">▼</button></div>' +
          '<div class="mjp-regs">' + rotUI + zoomUI + '</div>' +
        '</div>' +
      '</div>' +
    '</div>';
    var root = el.firstChild, svg = root.querySelector('.mjp-svg'), carte = root.querySelector('.mjp-carte');
    var gF = Array.prototype.slice.call(root.querySelectorAll('.mjp-feuille'));
    var astuce = root.querySelector('.mjp-astuce'), tenir = root.querySelector('.mjp-tenir');
    var barre = root.querySelector('.mjp-bougie-barre i');
    var rngRot = root.querySelector('[data-range="rot"]'), rngZoom = root.querySelector('[data-range="zoom"]');
    var sale = true, maintien = 0, aimantAnim = null, glisseRange = null;

    /* --- mise en page : la carte carrée prend toute la place possible --- */
    function gabarit(){
      var W = root.clientWidth, H = root.clientHeight; if(!W || !H) return;
      var haut = root.querySelector('.mjp-haut').offsetHeight;
      var paysage = W > H * 1.08 && W >= 560;
      root.classList.toggle('paysage', paysage);
      root.classList.toggle('etroit', !paysage && W < 480 && H > W * 1.45);
      var cmd = root.querySelector('.mjp-commandes');
      var taille = paysage ? Math.min(H - haut - 20, W - cmd.offsetWidth - 34) : Math.min(W - 20, H - haut - cmd.offsetHeight - 30);
      taille = Math.max(220, Math.floor(taille));
      carte.style.width = carte.style.height = taille + 'px';
    }
    var ro = null;
    if(window.ResizeObserver){ ro = new ResizeObserver(function(){ gabarit(); }); ro.observe(root); T.s(function(){ ro.disconnect(); }); }
    else { window.addEventListener('resize', gabarit); T.s(function(){ window.removeEventListener('resize', gabarit); }); }
    gabarit();

    /* --- repères d'aide (paires numérotées) --- */
    function majAide(){
      var gb = root.querySelector('.mjp-aide-base'); gb.innerHTML = '';
      gF.forEach(function(g){ var a = g.querySelector('.aide-c'); if(a) a.innerHTML = ''; });
      if(!p.pairesAide) return;
      var F = feuilles[k], choix2 = rShuffle(R, F.els.filter(function(x){ return x[0] !== 'arbre' && x[0] !== 'pin'; })).slice(0, p.pairesAide);
      if(choix2.length < p.pairesAide) choix2 = choix2.concat(rShuffle(R, F.els).slice(0, p.pairesAide - choix2.length));
      var s1 = '', s2 = '';
      choix2.forEach(function(x, j){
        var marque = '<circle class="aide-anneau" r="21"/><text class="aide-num" y="-24">' + (j + 1) + '</text>';
        s1 += grp(x[2], x[3], 0, marque); s2 += grp(x[2], x[3], 0, marque);
      });
      gb.innerHTML = s1; gF[k].querySelector('.aide-c').innerHTML = s2;
    }

    /* --- activer une feuille --- */
    function activer(j){
      k = j; e = etats[k]; maintien = 0;
      gF.forEach(function(g, i){ g.classList.toggle('futur', i > k); g.classList.toggle('actif', i === k); });
      root.querySelector('.mjp-couche-txt').innerHTML = L > 1 ? 'Calque <b>' + (k + 1) + '</b> / ' + L : 'Le vieux calque';
      root.querySelectorAll('.mjp-pastilles i').forEach(function(x, i){ x.className = i < k ? 'ok' : i === k ? 'cur' : ''; });
      majAide();
      sale = true;
    }

    /* --- dessin --- */
    function dessiner(){
      if(!gF[k]) return;
      gF[k].setAttribute('transform', matrice(e));
      if(rngRot && glisseRange !== rngRot) rngRot.value = String(normAngle(e.th));
      if(rngZoom && glisseRange !== rngZoom) rngZoom.value = String(Math.log(e.s) / Math.LN2);
      var c = appliquer(e, PC, PC);
      tenir.setAttribute('cx', f1(c.x)); tenir.setAttribute('cy', f1(c.y));
      if(p.guide){
        var F = feuilles[k], ann = gF[k].querySelectorAll('.anneau');
        F.els.forEach(function(x, j){ var q = appliquer(e, x[2], x[3]); if(ann[j]) ann[j].classList.toggle('proche', Math.hypot(q.x - x[2], q.y - x[3]) <= tol * 1.6); });
      }
      root.dataset.erreur = erreurPlan(e).toFixed(2);
      sale = false;
    }
    function borner(){
      e.s = U.borne(e.s, .45, 2.2); e.tx = U.borne(e.tx, -260, 260); e.ty = U.borne(e.ty, -260, 260);
      if(p.echelleBloquee) e.s = 1;
      if(p.rotationBloquee) e.th = 0;
      etats[k] = e; sale = true;
    }
    function bouge(){ aimantAnim = null; borner(); }

    /* --- petit aimant tout près de la solution --- */
    function verifierAimant(){
      if(termine || pause) return;
      var err = erreurPlan(e);
      if(err > 0.05 && err <= aimant){ aimantAnim = {de:Object.assign({}, e), t:0}; U.son('tic'); }
    }

    /* --- gestes : un doigt glisse, deux doigts tournent et zooment --- */
    var doigts = new Map(), geste = null;
    function pos(ev){ var r = svg.getBoundingClientRect(); return {x:(ev.clientX - r.left) * PT / r.width, y:(ev.clientY - r.top) * PT / r.height}; }
    function debutGeste(){
      var l = Array.from(doigts.values());
      geste = l.length ? {e0:Object.assign({}, e), l0:l.map(function(q){ return {x:q.x, y:q.y}; })} : null;
    }
    function majGeste(){
      if(!geste) return;
      var l = Array.from(doigts.values()), e0 = geste.e0;
      if(l.length === 1 || geste.l0.length === 1){
        e = {s:e0.s, th:e0.th, tx:e0.tx + l[0].x - geste.l0[0].x, ty:e0.ty + l[0].y - geste.l0[0].y};
      } else {
        var a0 = geste.l0[0], b0 = geste.l0[1], a = l[0], b = l[1];
        var m0 = {x:(a0.x + b0.x) / 2, y:(a0.y + b0.y) / 2}, m = {x:(a.x + b.x) / 2, y:(a.y + b.y) / 2};
        var d0 = Math.hypot(b0.x - a0.x, b0.y - a0.y) || 1, d = Math.hypot(b.x - a.x, b.y - a.y) || 1;
        var kz = p.echelleBloquee ? 1 : d / d0;
        var al = p.rotationBloquee ? 0 : (Math.atan2(b.y - a.y, b.x - a.x) - Math.atan2(b0.y - a0.y, b0.x - a0.x)) * 180 / Math.PI;
        var n = autour(e0, m0, kz, al);
        n.tx += m.x - m0.x; n.ty += m.y - m0.y;
        e = n;
      }
      bouge();
    }
    svg.addEventListener('pointerdown', function(ev){
      if(termine || pause) return;
      ev.preventDefault();
      try{ svg.setPointerCapture(ev.pointerId); }catch(er){}
      if(doigts.size >= 2) return;
      doigts.set(ev.pointerId, pos(ev)); debutGeste();
      root.classList.add('tire'); astuce.textContent = '';
    });
    svg.addEventListener('pointermove', function(ev){
      if(!doigts.has(ev.pointerId)) return;
      doigts.set(ev.pointerId, pos(ev)); majGeste();
    });
    function lacher(ev){
      if(!doigts.has(ev.pointerId)) return;
      doigts.delete(ev.pointerId); debutGeste();
      if(!doigts.size){ root.classList.remove('tire'); verifierAimant(); }
    }
    svg.addEventListener('pointerup', lacher);
    svg.addEventListener('pointercancel', lacher);
    svg.addEventListener('lostpointercapture', lacher);
    var molT = null;
    svg.addEventListener('wheel', function(ev){
      if(termine || pause) return;
      ev.preventDefault();
      var q = pos(ev);
      if(ev.shiftKey || ev.altKey){ if(!p.rotationBloquee) e = autour(e, q, 1, (ev.deltaY || ev.deltaX) > 0 ? .5 : -.5); }
      else if(!p.echelleBloquee) e = autour(e, q, Math.exp(-U.borne(ev.deltaY, -60, 60) * .0015), 0);
      bouge();
      clearTimeout(molT); molT = T.t(verifierAimant, 260);
    }, {passive:false});

    /* --- boutons (appui long = de plus en plus vite) --- */
    function agir(b, f){
      var t0 = null, rep = null, n = 0;
      function stop(){ if(t0){ clearTimeout(t0); t0 = null; } if(rep){ clearInterval(rep); rep = null; verifierAimant(); } b.classList.remove('appui'); }
      b.addEventListener('pointerdown', function(ev){
        if(termine || pause) return;
        ev.preventDefault(); stop(); n = 0; f(1); b.classList.add('appui'); U.son('clic');
        try{ b.setPointerCapture(ev.pointerId); }catch(er){}
        /* répétition réglée sur le temps réel (même vitesse sur une tablette lente) : accélère pendant l'appui */
        var debut = Date.now(), avant = debut + 360;
        t0 = setTimeout(function(){ t0 = null; rep = setInterval(function(){
          if(termine || pause){ stop(); return; }
          var now = Date.now(), dt = Math.min(250, now - avant); avant = now;
          f(dt / 45 * Math.min(9, 1 + (now - debut) / 1000 * 4));
        }, 40); }, 360);
      });
      ['pointerup', 'pointercancel', 'lostpointercapture'].forEach(function(t){ b.addEventListener(t, function(){ var r = !!rep; stop(); if(!r) verifierAimant(); }); });
      b.addEventListener('click', function(ev){ if(ev.detail === 0 && !termine && !pause){ f(1); verifierAimant(); } });
      T.s(stop);
    }
    root.querySelectorAll('[data-dep]').forEach(function(b){
      var d = b.dataset.dep.split(',').map(Number);
      agir(b, function(m){ e = {s:e.s, th:e.th, tx:e.tx + d[0] * .5 * m, ty:e.ty + d[1] * .5 * m}; bouge(); });
    });
    root.querySelectorAll('[data-rot]').forEach(function(b){
      var sg = +b.dataset.rot;
      agir(b, function(m){ e = autour(e, appliquer(e, PC, PC), 1, sg * .25 * m); bouge(); });
    });
    root.querySelectorAll('[data-zoom]').forEach(function(b){
      var sg = +b.dataset.zoom;
      agir(b, function(m){ e = autour(e, appliquer(e, PC, PC), Math.exp(sg * .0025 * m), 0); bouge(); });
    });
    /* --- réglettes --- */
    [rngRot, rngZoom].forEach(function(r){
      if(!r) return;
      r.addEventListener('pointerdown', function(){ glisseRange = r; });
      r.addEventListener('input', function(){
        if(termine || pause) return;
        glisseRange = r;
        var c = appliquer(e, PC, PC);
        if(r === rngRot) e = autour(e, c, 1, +r.value - e.th);
        else e = autour(e, c, Math.pow(2, +r.value) / e.s, 0);
        bouge();
      });
      r.addEventListener('change', function(){ glisseRange = null; verifierAimant(); });
      r.addEventListener('pointerup', function(){ glisseRange = null; });
    });
    /* --- clavier --- */
    function clavier(ev){
      if(termine || pause || !root.isConnected || (window.MJT && MJT.enPause())) return;   /* en pause (mj-temps.js) : le clavier sert au reste du jeu */
      if(ev.target && ev.target.tagName === 'INPUT') return;
      var g = ev.shiftKey ? 8 : 1, fait = true, c = appliquer(e, PC, PC);
      switch(ev.key){
        case 'ArrowLeft': e = {s:e.s, th:e.th, tx:e.tx - .5 * g, ty:e.ty}; break;
        case 'ArrowRight': e = {s:e.s, th:e.th, tx:e.tx + .5 * g, ty:e.ty}; break;
        case 'ArrowUp': e = {s:e.s, th:e.th, tx:e.tx, ty:e.ty - .5 * g}; break;
        case 'ArrowDown': e = {s:e.s, th:e.th, tx:e.tx, ty:e.ty + .5 * g}; break;
        case 'q': case 'Q': if(!p.rotationBloquee) e = autour(e, c, 1, -.25 * g); break;
        case 'e': case 'E': if(!p.rotationBloquee) e = autour(e, c, 1, .25 * g); break;
        case '+': case '=': if(!p.echelleBloquee) e = autour(e, c, Math.exp(.0025 * g), 0); break;
        case '-': case '_': if(!p.echelleBloquee) e = autour(e, c, Math.exp(-.0025 * g), 0); break;
        default: fait = false;
      }
      if(fait){ ev.preventDefault(); bouge(); }
    }
    function clavierHaut(){ if(window.MJT && MJT.enPause()) return; verifierAimant(); }
    document.addEventListener('keydown', clavier);
    document.addEventListener('keyup', clavierHaut);
    T.s(function(){ document.removeEventListener('keydown', clavier); document.removeEventListener('keyup', clavierHaut); });

    /* --- une feuille est posée --- */
    function feuillePosee(){
      pause = true; maintien = 0;
      e = {s:1, th:0, tx:0, ty:0}; etats[k] = e; dessiner();
      gF[k].classList.remove('actif'); gF[k].classList.add('fait');
      root.querySelector('.sec-part[data-k="' + k + '"]').classList.add('vu');
      root.querySelectorAll('.mjp-pastilles i')[k].className = 'ok';
      U.son('magie'); U.vibrer(40);
      if(k < L - 1){
        astuce.textContent = '✨ Un morceau du secret ! Au calque suivant…';
        T.t(function(){ if(arrete) return; astuce.textContent = ''; activer(k + 1); pause = false; }, 1400);
      } else {
        root.classList.add('gagne'); termine = true;
        astuce.textContent = '';
        T.t(function(){ U.son('gain'); }, 500);
        var score = Math.round(100 * (.5 + .5 * Math.max(0, temps) / tempsTotal)) / 100;
        T.t(function(){ if(arrete) return; fin({reussi:true, score:score, erreurs:0, message:'Le secret apparaît !', detail:cap(label) + '.'}); }, 2900);
      }
    }

    /* --- la boucle : bougie, aimant, maintien, dessin --- */
    var stopBoucle = U.boucle(function(dt){
      if(arrete) return false;
      if(!termine && !pause){
        temps -= dt;
        if(temps <= 0){
          temps = 0; termine = true; root.classList.add('eteint');
          U.son('echec');
          T.t(function(){ if(arrete) return; fin({reussi:false, score:0, erreurs:1, message:'La bougie s\'est éteinte…', detail:'Les plans ne coïncident pas : le secret reste caché.'}); }, 900);
        }
      }
      barre.style.transform = 'scaleX(' + Math.max(0, temps / tempsTotal).toFixed(4) + ')';
      root.classList.toggle('alerte', !termine && temps < Math.min(15, tempsTotal * .2));
      if(aimantAnim){
        aimantAnim.t = Math.min(1, aimantAnim.t + dt / .22);
        var u = 1 - Math.pow(1 - aimantAnim.t, 3), a = aimantAnim.de;
        e = {s:a.s + (1 - a.s) * u, th:a.th * (1 - u), tx:a.tx * (1 - u), ty:a.ty * (1 - u)}; etats[k] = e; sale = true;
        if(aimantAnim.t >= 1) aimantAnim = null;
      }
      if(!termine && !pause){
        var dedans = erreurPlan(e) <= tol;
        maintien = dedans ? maintien + dt : 0;
        root.classList.toggle('dedans', dedans);
        tenir.style.strokeDashoffset = String(151 * (1 - Math.min(1, maintien / p.maintien)));
        if(maintien >= p.maintien) feuillePosee();
      } else root.classList.remove('dedans');
      if(sale) dessiner();
    });
    T.s(stopBoucle);

    activer(0);
    astuce.textContent = L > 1 ? '👆 Glisse · ✌️ Tourne et zoome à deux doigts · ' + L + ' calques !' : '👆 Glisse · ✌️ Tourne et zoome à deux doigts';
    root.__test = {
      carte:choix.id, secret:choix.sid, couches:L, tol:tol, aimant:aimant,
      etat:function(){ return {k:k, s:e.s, th:e.th, tx:e.tx, ty:e.ty, erreur:erreurPlan(e), temps:temps, termine:termine, pause:pause}; },
      poser:function(o){ e = Object.assign({}, e, o); bouge(); dessiner(); },
      lacher:function(){ verifierAimant(); },
      temps:function(t){ temps = t; },
      feuilles:feuilles.map(function(F){ return {visibles:F.els.length, leurres:F.leurres.length, brule:!!F.bord, cote:F.cote, dechire:!!F.dechire}; })
    };
    root.dataset.carte = choix.id;
    return {arreter:function(){ arrete = true; termine = true; T.tout(); }};
  }
});

MJ.sagePlans = {CARTES:CARTES, appliquer:appliquer, autour:autour, erreur:erreurPlan, reglages:reglagesPlans, matrice:matrice};

/* ==========================================================
   LA GRILLE DE DÉDUCTION — le jeu
   mods : aide (croix automatiques + N coups de pouce 💡 qui révèlent une déduction), erreurs (+N cœurs),
          temps (+30 s par point si la partie a un sablier), revele (montre les contradictions en direct).
   params (facultatif, énigme d'enquête) : personnes, lieux, objets, moments, indices, solution, verbes, modes,
          bornes, intro, confirme (texte affiché quand c'est réussi), note.
   Sans params : une énigme est générée (solution unique vérifiée par le solveur).
   ========================================================== */
var MINUTES_GRILLE = {7:14, 8:12, 9:11, 10:10, 11:9, 12:8};
function coeursGrille(n){ return n <= 2 ? 3 : n <= 6 ? 2 : 1; }
function catsTexte(st){ return st.cats.map(function(c){ var d = CATS_G[c[0]]; return d.ic + ' ' + d.nom.toLowerCase(); }).join(', '); }
var INDICES_APPROX = {1:'2', 2:'3 à 5', 3:'5 à 8', 4:'5 à 7', 5:'8 à 11', 6:'11 à 17', 7:'10 à 13', 8:'15 à 24', 9:'15 à 22', 10:'15 à 23', 11:'15 à 23', 12:'13 à 21'};
function lignesGrille(p, info){
  var l = [];
  l.push({nom:'Personnes', val:String(info.k)});
  l.push({nom:'À trouver', val:info.cats});
  if(info.multi) l.push({nom:'Attention', val:'on peut aller à 2 endroits !'});
  l.push({nom:'Indices', val:info.indices});
  l.push({nom:'Cœurs (erreurs permises)', val:p.coeurs > 1 ? new Array(p.coeurs).join('❤️') : '0'});
  l.push({nom:'Sablier', val:p.temps ? Math.floor(p.temps / 60) + ' min' + (p.temps % 60 ? ' ' + (p.temps % 60) + ' s' : '') : 'aucun'});
  if(p.aide) l.push({nom:'Croix automatiques', val:'oui'}, {nom:'Coups de pouce 💡', val:String(p.aide)});
  if(p.revele) l.push({nom:'Les erreurs se voient', val:'oui'});
  return l;
}
function portraitMini(P){
  if(P.pnj && window.Persos && Persos.pnj){ try{ var s = Persos.pnj(P.pnj, {anime:false}); if(s) return '<span class="mjg-portrait">' + s + '</span>'; }catch(e){} }
  return '<span class="mjg-emoji">' + esc(P.ic || '🙂') + '</span>';
}
function reglesTexte(C){
  if(C.mode === 'un') return C.ic + ' ' + C.nom + ' : une seule ✓ par ligne et une seule ✓ par colonne.';
  return C.ic + ' ' + C.nom + ' : ' + (C.rmin === C.rmax ? C.rmin : C.rmin + ' ou ' + C.rmax) + ' ✓ par personne. Plusieurs personnes peuvent aller au même endroit (ou personne).';
}

MJ.enregistrer('grille', {
  nom:'La grille de déduction', role:'sage', ic:'🧩',
  consigne: function(p){
    p = p || {};
    if(p.personnes && p.personnes.length && !p.__lignesFixe){
      /* énigme d'enquête : les réglages décrivent l'énigme fournie */
      try{
        var E = enigmeFournie(p);
        if(E){
          p.__lignesFixe = true;
          p.lignes = lignesGrille(p, {k:E.M.pers.length, cats:E.M.cats.map(function(C){ return C.ic + ' ' + C.nom.toLowerCase(); }).join(', '),
            multi:E.M.cats.some(function(C){ return C.mode === 'multi'; }), indices:String(E.indices.length)});
        }
      }catch(e){}
      return p.intro || 'Lis les indices. Touche une case : ✗ si c\'est impossible, encore une fois : ✓ si c\'est sûr. Quand tout est rempli, valide !';
    }
    return 'Lis les indices. Touche une case : ✗ si c\'est impossible, encore une fois : ✓ si c\'est sûr. Quand tout est rempli, valide !';
  },
  reglages: function(n, mods){
    mods = mods || {};
    var st = structureGrille(n);
    var p = {
      coeurs:coeursGrille(n) + (mods.erreurs || 0),
      temps:MINUTES_GRILLE[n] ? MINUTES_GRILLE[n] * 60 + (mods.temps || 0) * 30 : 0,
      aide:mods.aide || 0, revele:!!mods.revele, montreFautes:n <= 4, niveauGrille:n
    };
    p.lignes = lignesGrille(p, {k:st.k, cats:catsTexte(st), multi:st.cats.some(function(c){ return c[1] === 'multi'; }), indices:INDICES_APPROX[n] || 'beaucoup'});
    return p;
  },
  demo: function(el){
    return demoMain(el,
      '<div class="mjg-d"><p class="mjg-d-ind"><i>1</i> Tim n\'était pas au moulin.</p><p class="mjg-d-ind d2"><i>2</i> Odette était au puits.</p>' +
      '<div class="mjg-d-grille"><b></b><b>🌾</b><b>🪣</b><b>🧒</b><i data-c="0"></i><i data-c="1"></i><b>👵</b><i data-c="2"></i><i data-c="3"></i></div></div>',
      5600, [
        [0, function(c){ c.qa('.mjg-d-grille i').forEach(function(x){ x.textContent = ''; x.className = ''; }); c.qa('.mjg-d-ind').forEach(function(x){ x.classList.remove('vu', 'lu'); }); c.va(50, 96); }],
        [500, function(c){ c.q('.mjg-d-ind').classList.add('lu'); }],
        [900, function(c){ c.va(66, 66); }],
        [1400, function(c){ c.tape(); var x = c.q('[data-c="0"]'); x.textContent = '✗'; x.className = 'x'; }],
        [1900, function(c){ c.va(10, 26); }],
        [2300, function(c){ c.tape(); c.q('.mjg-d-ind').classList.add('vu'); c.q('.d2').classList.add('lu'); }],
        [2900, function(c){ c.va(80, 86); }],
        [3300, function(c){ c.tape(); var x = c.q('[data-c="3"]'); x.textContent = '✗'; x.className = 'x'; }],
        [3700, function(c){ c.tape(); var x = c.q('[data-c="3"]'); x.textContent = '✓'; x.className = 'v'; }],
        [4300, function(c){ var a = c.q('[data-c="1"]'); a.textContent = '✓'; a.className = 'v'; var b = c.q('[data-c="2"]'); b.textContent = '✗'; b.className = 'x'; c.q('.d2').classList.add('vu'); }]
      ]);
  },
  jouer: function(el, p, fin){
    var T = minuteurs(), termine = false, arrete = false;
    el.innerHTML = '<div class="mjg mjsp-fond"><div class="mjg-prepare"><span class="mjg-sablier">⏳</span><p>Le Sage prépare l\'énigme…</p></div></div>';
    var root = el.firstChild;
    root.__test = {pret:false};
    function finir(res){ if(termine || arrete) return; termine = true; T.tout(); fin(res); }
    T.t(function(){
      if(arrete) return;
      var E = null;
      try{ E = enigmeFournie(p || {}); }catch(e){ if(window.console) console.warn('grille : énigme fournie illisible', e); }
      if(!E || !E.sol){ E = genererGrille(p.niveauGrille || p.niveauEffectif || 3); }
      if(!E){ root.innerHTML = '<p class="mjg-message">Oups, pas d\'énigme.</p>'; T.t(function(){ finir({reussi:true, score:1, detail:''}); }, 800); return; }
      monter(E);
    }, 40);

    function monter(E){
      var M = E.M, k = M.pers.length, C = M.cats.length;
      var marques = new Int8Array(M.N).fill(-1), auto = {}, pouce = {};
      var coeurs = p.coeurs || 1, coeursMax = coeurs, pouces = p.aide || 0, essais = 0;
      var actif = 0, mode = 'tout', temps = p.temps || 0;
      var usage = E.indices.map(function(){ return false; });
      /* --- HTML --- */
      var h = '';
      h += '<div class="mjg-haut">' +
        (temps ? '<span class="mjg-temps" aria-label="Sablier">⏳ <b></b></span>' : '') +
        '<span class="mjg-coeurs" aria-label="Cœurs"></span>' +
        (pouces ? '<button type="button" class="mjg-pouce" aria-label="Coup de pouce">💡 <b></b></button>' : '') +
      '</div>';
      h += '<div class="mjg-corps"><div class="mjg-colg">';
      h += '<div class="mjg-regles">' + (p.intro && E.fixe ? '<p class="mjg-intro">' + esc(p.intro) + '</p>' : '') + M.cats.map(function(Cc){ return '<p>' + esc(reglesTexte(Cc)) + '</p>'; }).join('') + '</div>';
      if(C > 1) h += '<div class="mjg-onglets" role="tablist">' + M.cats.map(function(Cc, c){ return '<button type="button" class="mjg-onglet" data-cat="' + c + '" role="tab"><span>' + Cc.ic + '</span> ' + esc(Cc.nom) + ' <small></small></button>'; }).join('') + '</div>';
      /* tableau : colonne des noms + par catégorie un séparateur et K colonnes */
      h += '<div class="mjg-tableau">';
      h += '<div class="mjg-coin" style="grid-row:1 / span 2;grid-column:1"><small>Touche :<br>✗ puis ✓</small></div>';
      var col = 2;
      M.cats.forEach(function(Cc, c){
        var K = Cc.items.length;
        h += '<div class="mjg-sep" data-cat="' + c + '" style="grid-row:1 / span ' + (k + 2) + ';grid-column:' + col + '"></div>';
        col++;
        h += '<div class="mjg-cat" data-cat="' + c + '" style="grid-row:1;grid-column:' + col + ' / span ' + K + '">' + Cc.ic + ' ' + esc(Cc.nom) + (Cc.mode === 'multi' ? ' <em>(1 ou 2 ✓)</em>' : '') + '</div>';
        Cc.items.forEach(function(it, i){
          h += '<div class="mjg-item" data-cat="' + c + '" style="grid-row:2;grid-column:' + (col + i) + '"><span class="mjg-item-ic">' + esc(it.ic || '•') + '</span><span class="mjg-item-nom">' + esc(it.court) + '</span></div>';
        });
        col += K;
      });
      M.pers.forEach(function(P, pi){
        h += '<div class="mjg-pers" data-p="' + pi + '" style="grid-row:' + (pi + 3) + ';grid-column:1">' + portraitMini(P) + '<span>' + esc(P.nom) + '</span></div>';
        var cc = 2;
        M.cats.forEach(function(Cc, c){
          cc++;
          Cc.items.forEach(function(it, i){
            var x = cel(M, c, pi, i);
            h += '<button type="button" class="mjg-case" data-x="' + x + '" data-cat="' + c + '" style="grid-row:' + (pi + 3) + ';grid-column:' + (cc + i) + '" aria-label="' + esc(P.nom + ', ' + it.nom) + '"></button>';
          });
          cc += Cc.items.length;
        });
      });
      h += '</div><p class="mjg-legende">Touche une case : vide → <b class="x">✗</b> → <b class="v">✓</b> → vide</p></div>';
      h += '<div class="mjg-cold"><h3 class="mjg-titre-ind">📜 Les indices <small>(touche-les pour les barrer)</small></h3><ol class="mjg-indices">' + E.indices.map(function(q, j){
        return '<li class="mjg-ind" data-k="' + j + '"><button type="button" class="mjg-ind-btn" aria-pressed="false"><span class="mjg-num">' + (j + 1) + '</span><p>' + esc(q.texte) + '</p></button>' + lireBtn(q.texte) + '</li>';
      }).join('') + '</ol></div></div>';
      h += '<div class="mjg-bas"><p class="mjg-message" role="status"></p><button type="button" class="mjsp-gros mjg-valider">✔ Valider</button></div>';
      root.innerHTML = h;
      brancherLire(root);
      var tab = root.querySelector('.mjg-tableau'), msg = root.querySelector('.mjg-message');
      var cases = Array.prototype.slice.call(root.querySelectorAll('.mjg-case'));
      var parX = []; cases.forEach(function(b){ parX[+b.dataset.x] = b; });
      var lis = root.querySelectorAll('.mjg-ind');
      root.dataset.sol = JSON.stringify(plage(M.N).filter(function(x){ return E.sol[x] === 1; }));

      /* --- mise en page : tout le tableau, ou un onglet par catégorie --- */
      function gabarit(){
        var W = root.clientWidth, H = root.clientHeight;
        var paysage = W > H * 1.12 && W >= 640;
        var largeurG = paysage ? W * .52 : W;
        var etroit = W < 480; root.classList.toggle('etroit', etroit);
        var nomW = etroit ? 78 : 112, totalK = 0; M.cats.forEach(function(Cc){ totalK += Cc.items.length; });
        var celTout = Math.floor((largeurG - 30 - nomW - C * 8) / totalK);
        mode = (C === 1 || celTout >= 42) ? 'tout' : 'onglets';
        if(mode === 'onglets' && !etroit) nomW = Math.min(170, Math.max(nomW, Math.floor(largeurG * .26)));
        root.classList.toggle('paysage', paysage);
        root.classList.toggle('onglets', mode === 'onglets');
        var cols = ['minmax(' + (nomW - 10) + 'px,' + nomW + 'px)'];
        M.cats.forEach(function(Cc, c){
          var vis = mode === 'tout' || c === actif;
          cols.push(vis && (c > 0 && mode === 'tout') ? '8px' : '0px');
          for(var i = 0; i < Cc.items.length; i++) cols.push(vis ? 'minmax(40px,' + (mode === 'onglets' ? 96 : 76) + 'px)' : '0px');
        });
        tab.style.gridTemplateColumns = cols.join(' ');
        root.querySelectorAll('[data-cat]').forEach(function(n){ if(n.classList.contains('mjg-onglet')) return; n.classList.toggle('cache', mode === 'onglets' && +n.dataset.cat !== actif); });
        root.querySelectorAll('.mjg-onglet').forEach(function(b){ var on = +b.dataset.cat === actif; b.classList.toggle('on', on); b.setAttribute('aria-selected', on ? 'true' : 'false'); });
      }
      var ro = null;
      if(window.ResizeObserver){ ro = new ResizeObserver(function(){ gabarit(); }); ro.observe(root); T.s(function(){ ro.disconnect(); }); }
      else { window.addEventListener('resize', gabarit); T.s(function(){ window.removeEventListener('resize', gabarit); }); }
      gabarit();

      /* --- dessin --- */
      function dessiner(){
        var ctr = p.revele ? contradictions(E, marques) : null;
        cases.forEach(function(b){
          var x = +b.dataset.x, v = marques[x];
          b.textContent = v === 1 ? '✓' : v === 0 ? '✗' : '';
          b.className = 'mjg-case' + (v === 1 ? ' v' : v === 0 ? ' x' : '') + (auto[x] && v === 0 ? ' auto' : '') + (pouce[x] ? ' pouce' : '') + (ctr && ctr.cells[x] ? ' conflit' : '') +
            (mode === 'onglets' && +b.dataset.cat !== actif ? ' cache' : '');
        });
        lis.forEach(function(li, j){ li.classList.toggle('faux', !!(ctr && ctr.indices.indexOf(j) >= 0)); });
        root.querySelectorAll('.mjg-onglet small').forEach(function(s, c){
          var Cc = M.cats[c], n = 0, besoin = 0;
          for(var pi = 0; pi < k; pi++) for(var i = 0; i < Cc.items.length; i++){ if(marques[cel(M, c, pi, i)] === 1) n++; if(E.sol[cel(M, c, pi, i)] === 1) besoin++; }
          s.textContent = Cc.mode === 'un' ? n + '/' + k : n + ' ✓';
        });
        var hc = root.querySelector('.mjg-coeurs');
        /* la règle des cœurs (mj-core.js) : cœurs = erreurs encore permises (coeurs − 1 : on perd quand coeurs tombe à 0) */
        hc.innerHTML = U.coeurs(coeurs - 1, coeursMax - 1, hc.__avant !== undefined && coeurs < hc.__avant ? coeurs - 1 : undefined);
        if(hc.__avant !== undefined && coeurs < hc.__avant && coeurs === 1) U.plusDeCoeur(root);
        hc.__avant = coeurs;
        var bp = root.querySelector('.mjg-pouce'); if(bp){ bp.querySelector('b').textContent = '×' + pouces; bp.disabled = pouces <= 0 || termine; }
        root.__test.marques = Array.prototype.slice.call(marques);
      }
      function croixAuto(x){
        var d = decode(M, x), Cc = M.cats[d.c];
        if(Cc.mode !== 'un') return;
        for(var i = 0; i < Cc.items.length; i++){ var y = cel(M, d.c, d.p, i); if(y !== x && marques[y] === -1){ marques[y] = 0; auto[y] = 1; } }
        for(var pi = 0; pi < k; pi++){ var z = cel(M, d.c, pi, d.i); if(z !== x && marques[z] === -1){ marques[z] = 0; auto[z] = 1; } }
      }
      function poser(x, v){
        marques[x] = v; delete auto[x]; delete pouce[x];
        if(v === 1 && p.aide) croixAuto(x);
      }
      tab.addEventListener('click', function(e){
        var b = e.target.closest('.mjg-case'); if(!b || termine) return;
        var x = +b.dataset.x, v = marques[x];
        poser(x, v === -1 ? 0 : v === 0 ? 1 : -1);
        U.son(marques[x] === 1 ? 'tic' : 'clic');
        dessiner();
        b.classList.add('pop');
      });
      root.querySelectorAll('.mjg-onglet').forEach(function(b){
        b.addEventListener('click', function(){ actif = +b.dataset.cat; U.son('page'); gabarit(); dessiner(); });
      });
      root.querySelector('.mjg-indices').addEventListener('click', function(e){
        var b = e.target.closest('.mjg-ind-btn'); if(!b) return;
        var li = b.parentNode, j = +li.dataset.k;
        usage[j] = !usage[j];
        li.classList.toggle('barre', usage[j]); b.setAttribute('aria-pressed', usage[j] ? 'true' : 'false');
        U.son('clic');
      });
      var bp = root.querySelector('.mjg-pouce');
      if(bp) bp.addEventListener('click', function(){
        if(termine || pouces <= 0) return;
        var d = deduction(E, marques);
        if(!d){ msg.textContent = '💡 Tout ce qui est rempli est déjà juste !'; return; }
        pouces--;
        marques[d.x] = d.v; delete auto[d.x]; pouce[d.x] = 1;
        if(d.v === 1 && p.aide) croixAuto(d.x);
        var dd = decode(M, d.x);
        if(mode === 'onglets' && dd.c !== actif){ actif = dd.c; gabarit(); }
        dessiner();
        U.son('magie');
        var cible = parX[d.x]; if(cible){ cible.classList.remove('eclair'); void cible.offsetWidth; cible.classList.add('eclair'); }
        lis.forEach(function(li){ li.classList.remove('eclaire'); });
        if(d.k >= 0 && lis[d.k]){ lis[d.k].classList.add('eclaire'); try{ lis[d.k].scrollIntoView({block:'nearest'}); }catch(er){} }
        var nomCase = M.pers[dd.p].nom + ' · ' + M.cats[dd.c].items[dd.i].court;
        msg.textContent = '💡 ' + (d.v ? '✓ ' : '✗ ') + nomCase + (d.k >= 0 ? ' — grâce à l\'indice ' + (d.k + 1) + '.' : d.absurde ? ' — sinon, rien ne marcherait !' : '.');
      });

      /* --- valider --- */
      root.querySelector('.mjg-valider').addEventListener('click', function(){
        if(termine) return;
        var manque = [];
        M.groupes.forEach(function(G){
          if(G.ligne === undefined) return;
          var n = 0; G.cells.forEach(function(x){ if(marques[x] === 1) n++; });
          if(n < G.min || (M.cats[G.c].mode === 'un' && n !== 1)) manque.push(G);
        });
        if(manque.length){
          var G0 = manque[0], Cc = M.cats[G0.c];
          msg.textContent = '✋ Il manque des ✓ : ' + M.pers[G0.ligne].nom + ' (' + Cc.nom.toLowerCase() + ')' + (Cc.mode === 'un' ? ' doit avoir une seule ✓.' : ' doit avoir au moins ' + Cc.rmin + ' ✓.');
          manque.forEach(function(G){ G.cells.forEach(function(x){ var b = parX[x]; if(b){ b.classList.remove('manque'); void b.offsetWidth; b.classList.add('manque'); } }); });
          if(mode === 'onglets' && G0.c !== actif){ actif = G0.c; gabarit(); dessiner(); }
          U.son('clic');
          return;
        }
        essais++;
        var faux = [];
        for(var x = 0; x < M.N; x++) if((marques[x] === 1 ? 1 : 0) !== E.sol[x]) faux.push(x);
        if(!faux.length){
          root.classList.add('gagne'); U.son('magie'); dessiner();
          this.disabled = true;
          var detail = E.fixe && p.confirme ? p.confirme : 'Résolu avec ' + E.indices.length + ' indices' + (coeurs < coeursMax ? ' et ' + (coeursMax - coeurs) + ' erreur' + (coeursMax - coeurs > 1 ? 's' : '') : ', sans aucune erreur') + ' !';
          T.t(function(){ finir({reussi:true, score:Math.round(100 * coeurs / coeursMax) / 100, erreurs:coeursMax - coeurs, message:'Tout est logique !', detail:detail, note:E.fixe ? (p.note || null) : null}); }, 1300);
          return;
        }
        coeurs--; U.son('ko'); U.vibrer(60);
        var hc = root.querySelector('.mjg-coeurs'); hc.classList.remove('choc'); void hc.offsetWidth; hc.classList.add('choc');
        if(p.montreFautes){
          var lignes = {}; faux.forEach(function(x){ var d = decode(M, x); lignes[d.p + ':' + d.c] = 1; });
          Object.keys(lignes).forEach(function(kk){ var a = kk.split(':'); var Cc = M.cats[+a[1]]; for(var i = 0; i < Cc.items.length; i++){ var b = parX[cel(M, +a[1], +a[0], i)]; if(b){ b.classList.remove('faute'); void b.offsetWidth; b.classList.add('faute'); } } });
          msg.textContent = '🤔 Pas encore… Regarde les cases qui clignotent.';
        } else msg.textContent = coeurs > 0 ? '🤔 Ce n\'est pas ça… Relis les indices !' : '';
        dessiner();
        if(coeurs <= 0){
          this.disabled = true;
          T.t(function(){ finir({reussi:false, score:0, erreurs:coeursMax, message:'Ça ne tient pas debout…', detail:'Plus de cœur : c\'était l\'erreur de trop, la grille reste un mystère.'}); }, 900);
        }
      });

      /* --- sablier --- */
      if(temps){
        var tb = root.querySelector('.mjg-temps b'), tspan = root.querySelector('.mjg-temps');
        (function tic(){
          if(termine || arrete) return;
          tb.textContent = Math.floor(temps / 60) + ':' + ('0' + (temps % 60)).slice(-2);
          tspan.classList.toggle('alerte', temps <= 30);
          if(temps <= 0){ U.son('echec'); finir({reussi:false, score:0, erreurs:coeursMax - coeurs, message:'Le sablier est vide…', detail:'Le temps est passé : la grille reste un mystère.'}); return; }
          temps--; T.t(tic, 1000);
        })();
      }
      dessiner();
      root.__test = {pret:true, E:E, M:M, marques:Array.prototype.slice.call(marques),
        poser:function(x, v){ poser(x, v); dessiner(); },
        solution:function(){ return Array.prototype.slice.call(E.sol); },
        valider:function(){ root.querySelector('.mjg-valider').click(); },
        coeurs:function(){ return coeurs; }, deduction:function(){ return deduction(E, marques); }};
      root.dataset.pret = '1';
    }
    return {arreter: function(){ arrete = true; termine = true; T.tout(); }};
  }
});

})();
