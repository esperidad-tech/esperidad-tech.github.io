/* ==========================================================
   Brumeval — la cabane du Pisteur (son premier onglet « 🛖 Cabane »)
   Une cabane de rondins, plein écran entre le bandeau et les onglets, qu'on fait glisser au doigt.
     - devant, le Pisteur, en grand, accroupi aux aguets, avec tout ce qu'il porte.
       On l'habille DIRECTEMENT : toucher la tête, le cou, le torse, le pantalon, les bottes,
       les mains ou le carquois ouvre, à côté de lui, les vêtements trouvés pour cette partie du corps,
       et les bulles de couleur sur le côté (toucher ailleurs les referme) ;
     - l'armoire montre la collection : tout ce qui est trouvé et ce qui reste à trouver ;
     - le sac 🎒 ouvre ce que montrait l'ancien onglet Sac (codes, potions, infos, équipement) ;
     - le grand tableau « Les chemins secrets » (sous terre et en surface), dans un cadre de bois sur un chevalet
       (#cabane-carte, rempli par carte-jeu.js : M.carteMurale) ;
       le village est dans l'onglet Carte, pour ne pas faire doublon.
   La garde-robe : M.S.garde = {v:2, a:{id:{c, n, o}}, p:{emplacement:id}, f:{trouvailles faites}, n}
     (v:2 = les règles « moins souvent, mais plus belles » de garderobe.js : TROUVAILLES)
     a = ce qu'il possède (c couleur, n « nouveau », o ordre), p = ce qu'il porte.
   Tout est décoratif. Gardé d'une enquête à l'autre ; remis à zéro après une défaite (nouvel état).
   Chargé APRÈS moteur-actions.js (M.render appelle M.demonterCabane / M.monterCabane).
   ========================================================== */
(function(){
'use strict';
var M = window.M, D = window.DONNEES, Gd = window.Garde;
if(!M || !Gd || !window.Persos) return;
var esc = M.esc, UI = M.UI;
var H = 760, MUR = 572;
var HERO = {x:420, pied:706, h:800};        /* le Pisteur, en grand, un peu dans la pièce : ses pieds au milieu du plancher (Romain, 3 novembre) */
var CARTE_IN = 24;                          /* l'épaisseur du cadre de bois autour de la carte */
var uid = 0;
/* ce que montre chaque partie du corps qu'on touche */
var ZONES = {
  tete:{nom:'Tête', slots:['tete', 'yeux', 'bouche']},
  cou:{nom:'Cou', slots:['bouche', 'cou']},
  corps:{nom:'Habit', slots:['corps', 'cape']},
  jambes:{nom:'Pantalon', slots:['jambes']},
  pieds:{nom:'Bottes', slots:['pieds']},
  mains:{nom:'Mains', slots:['mains', 'bras', 'arme']},
  carquois:{nom:'Carquois', slots:['fleches', 'carquois']}
};
var ZONE_DE = {tete:'tete', yeux:'tete', bouche:'cou', cou:'cou', corps:'corps', cape:'corps', jambes:'jambes', pieds:'pieds', mains:'mains', bras:'mains', arme:'mains', fleches:'carquois', carquois:'carquois'};

/* ==========================================================
   L'état de la garde-robe
   ========================================================== */
function donner(G, id){
  var it = Gd.ITEMS[id];
  if(!it || G.a[id]) return false;
  G.a[id] = {c:it.c, n:1, o:++G.n};
  return true;
}
/* La table d'une enquête (garderobe.js), complétée par E.garderobe = {mj, paquets, bonus} d'une enquête future */
function tableDe(eId){
  var T = Gd.TROUVAILLES[eId] || {}, E = window.ENQUETES && window.ENQUETES[eId], X = (E && E.garderobe) || {};
  return {mj:Object.assign({}, T.mj || {}, X.mj || {}), paquets:(T.paquets || []).concat(X.paquets || []), bonus:Object.assign({}, T.bonus || {}, X.bonus || {})};
}
function pointDe(eId, lieu, id){
  var E = window.ENQUETES && window.ENQUETES[eId], L = E && E.lieux && E.lieux[lieu], p = L && L.pisteur && L.pisteur.points;
  return (p || []).filter(function(x){ return x.id === id; })[0] || null;
}
/* une condition de paquet, d'après P.vus et P.bonus */
function condOk(c, P){
  if(!c) return false;
  if(c.et) return c.et.every(function(x){ return condOk(x, P); });
  if(c.ou) return c.ou.some(function(x){ return condOk(x, P); });
  var vus = P.vus || {};
  if(c.vu) return vus[c.vu] === 'ok';
  if(c.explore) return vus['explore:' + c.explore] != null;   /* la valeur est le moment de la fouille (0 le matin) */
  if(c.bonus) return !!P.bonus && P.bonus[c.bonus] === 'ok';
  return false;
}
function vusDe(c, l){ l = l || []; if(c){ if(c.vu) l.push(c.vu); (c.et || c.ou || []).forEach(function(x){ vusDe(x, l); }); } return l; }
/* un rare pas encore trouvé, qui va avec le lieu si possible */
function rareLibre(G, lieu){
  var l = ((Gd.RARES_LIEU || {})[lieu] || []).concat(Gd.ORDRE.filter(function(id){ return Gd.ITEMS[id].rare; }));
  return l.filter(function(id){ return Gd.ITEMS[id] && !G.a[id]; })[0] || null;
}
/* Les trouvailles d'une enquête, d'après ce que le Pisteur a fait (P.vus, P.bonus).
   Renvoie [{ids:[…], genre:'rare'|'paquet'|'bonus'}] ; sec = seulement noter comme faites (ancienne sauvegarde). */
function traiter(eId, P, G, sec){
  var T = tableDe(eId), tous = (Gd.TROUVAILLES.tous && Gd.TROUVAILLES.tous.paquets) || [], l = [], vus = (P && P.vus) || {};
  function ajoute(cle, ids, genre){
    if(G.f[cle]) return;
    G.f[cle] = 1;
    if(sec) return;
    var n = ids.filter(function(id){ return id && donner(G, id); });
    if(n.length) l.push({ids:n, genre:genre});
  }
  /* 3. les découvertes importantes : un paquet */
  var dansPaquet = {};
  [[eId, T.paquets], ['tous', tous]].forEach(function(x){
    x[1].forEach(function(pq){
      vusDe(pq.quand).forEach(function(k){ dansPaquet[k] = 1; });
      if(condOk(pq.quand, P)) ajoute(x[0] + ':k:' + pq.id, pq.items, 'paquet');
    });
  });
  /* 2. un mini-jeu gagné : un rare (sauf si ce point ouvre un paquet) */
  M.cle(vus).forEach(function(k){
    var m = /^pisteur:([^:]+):(.+)$/.exec(k);
    if(!m || vus[k] !== 'ok' || dansPaquet[k]) return;
    var p = pointDe(eId, m[1], m[2]);
    if(!p || !p.mj) return;   /* 1. une découverte ordinaire : rien */
    var cle = eId + ':m:' + m[1] + ':' + m[2];
    if(G.f[cle]) return;
    var id = T.mj[m[1] + ':' + m[2]];
    if(!id || G.a[id] || !Gd.ITEMS[id]) id = rareLibre(G, m[1]);
    ajoute(cle, [id], 'rare');
  });
  /* 4. une mission bonus gagnée : un vêtement */
  M.cle(T.bonus).forEach(function(b){ if(P && P.bonus && P.bonus[b] === 'ok') ajoute(eId + ':b:' + b, [T.bonus[b]], 'bonus'); });
  return l;
}
function etatGarde(S){
  S = S || M.S;
  if(!S || !S.heros || S.heros.role !== 'pisteur') return null;
  var G = S.garde, neuf = false;
  if(!G || typeof G !== 'object' || !G.a || typeof G.a !== 'object'){ G = S.garde = {v:2, a:{}, p:{}, f:{}, n:0}; neuf = true; }
  if(!G.p || typeof G.p !== 'object') G.p = {};
  if(!G.f || typeof G.f !== 'object') G.f = {};
  if(typeof G.n !== 'number') G.n = M.cle(G.a).length;
  M.cle(G.a).forEach(function(id){
    var it = Gd.ITEMS[id];
    if(!it){ delete G.a[id]; return; }
    if(!G.a[id] || typeof G.a[id] !== 'object') G.a[id] = {};
    if(!Gd.PAL[G.a[id].c]) G.a[id].c = it.c;
  });
  M.cle(G.p).forEach(function(sl){ var id = G.p[sl]; if(!G.a[id] || !Gd.ITEMS[id] || Gd.ITEMS[id].slot !== sl) delete G.p[sl]; });
  if(neuf){
    Gd.DEPART.forEach(function(id){ donner(G, id); });
    /* une sauvegarde d'avant la garde-robe : ce qu'il avait déjà fait lui donne ses vêtements, sans rien interrompre */
    M.cle(S.journal || {}).forEach(function(e){ var J = S.journal[e]; if(J && J.vus) traiter(+e || J.e, J, G); });
    if(S.e && S.e.vus) traiter(S.e.id, S.e, G);
  } else if(G.v !== 2){
    /* une garde-robe des anciennes règles (un vêtement presque à chaque découverte) : il garde tout ce qu'il a,
       et ce qu'il a déjà fait ne redonne rien (pas d'avalanche de trouvailles au chargement) */
    M.cle(S.journal || {}).forEach(function(e){ var J = S.journal[e]; if(J && J.vus) traiter(+e || J.e, J, G, true); });
    if(S.e && S.e.vus) traiter(S.e.id, S.e, G, true);
    G.v = 2;
  }
  return G;
}
M.etatGarde = etatGarde;
/* La tenue portée, pour Persos.heros (h.garde) ; null quand il ne porte rien de la garde-robe */
M.lookGarde = function(S){
  S = S || M.S;
  if(!S || !S.heros || S.heros.role !== 'pisteur') return null;
  var G = S === M.S ? etatGarde(S) : S.garde;
  if(!G || !G.p || !G.a) return null;
  var l = {}, n = 0;
  M.cle(G.p).forEach(function(sl){ var id = G.p[sl], it = Gd.ITEMS[id]; if(it && it.slot === sl && G.a[id]){ l[sl] = {id:id, c:G.a[id].c || it.c}; n++; } });
  return n ? l : null;
};
function nouveaux(G, slot){ return M.cle(G.a).filter(function(id){ return G.a[id].n && (!slot || Gd.ITEMS[id].slot === slot); }).length; }
function possedes(G, slot){ return Gd.parSlot(slot).filter(function(id){ return G.a[id]; }); }

/* Après chaque rendu : ce que le Pisteur vient d'explorer lui a-t-il fait trouver un vêtement ? */
function verifier(){
  var S = M.S;
  if(!S || !S.heros || S.heros.role !== 'pisteur') return;
  var G = etatGarde(S), P = M.P();
  if(!G || !P || !P.id) return;
  var l = traiter(P.id, P, G);
  if(!l.length) return;
  M.sauver();
  l.forEach(function(x){ montrerTrouvaille(x); });
}
M.verifierGarde = verifier;

/* ==========================================================
   La trouvaille : une petite carte qui apparaît en haut, se lit avec 🔊,
   puis file vers l'onglet Cabane. Elle ne bloque rien (on peut continuer à jouer dessous).
   ========================================================== */
var file = [], carteEnCours = null;
function heroBase(){
  var h = M.heroObj ? M.heroObj() : M.copie(M.S.heros);
  h.garde = null; h.potion = null;
  return h;
}
var CACHE = {}, cacheCle = '';
function cleHeros(h){ return [h.sexe, h.age, h.peau, h.coiffure, h.cheveux, h.yeux, h.tenue, h.barbe, Persos.palier(h.niveau), (h.equip || []).join(','), (h.talents || []).join(',')].join('|'); }
function vignette(id, c, h){
  var it = Gd.ITEMS[id];
  if(!it) return '';
  h = h || heroBase();
  var k = cleHeros(h);
  if(k !== cacheCle){ CACHE = {}; cacheCle = k; }
  var cle = id + ':' + (c || it.c);
  if(CACHE[cle]) return CACHE[cle];
  var look = {}; look[it.slot] = {id:id, c:c || it.c};
  var hh = Object.assign({}, h, {garde:look});
  if(it.slot === 'jambes'){ hh.niveau = 1; hh.equip = (h.equip || []).filter(function(e){ return !/^bottes_/.test(e); }); }   /* des bottes basses : on voit le pantalon */
  var z = it.slot + (it.p.hanche ? '-hanche' : '');
  var s;
  try{ s = Persos.heros(hh, {vue:'pied', anime:false, fond:false, cadre:z, id:'grv' + (++uid)}); }catch(e){ console.error(e); s = ''; }
  return CACHE[cle] = s;
}
/* x = {ids:[…], genre:'rare'|'paquet'|'bonus'} (un seul id accepté aussi) */
function montrerTrouvaille(x){ if(typeof x === 'string') x = {ids:[x], genre:'bonus'}; file.push(x); if(!carteEnCours) suivante(); }
function liste(noms){ return noms.length < 2 ? noms[0] : noms.slice(0, -1).join(', ') + ' et ' + noms[noms.length - 1]; }
function suivante(){
  var x = file.shift();
  if(!x){ carteEnCours = null; return; }
  var ids = (x.ids || []).filter(function(id){ return Gd.ITEMS[id]; });
  if(!ids.length){ suivante(); return; }
  var its = ids.map(function(id){ return Gd.ITEMS[id]; }), paquet = ids.length > 1, rare = its.some(function(it){ return it.rare; });
  var t = 'Tu as trouvé ' + liste(its.map(function(it){ return Gd.nomComplet(it); })) + ' !';
  var titre = paquet ? '🎁 Un paquet : ' + ids.length + ' trouvailles !' : rare ? '✨ Un vêtement rare !' : '👕 Pour ta garde-robe';
  var el = document.createElement('div');
  el.className = 'gr-trouve' + (rare ? ' rare' : '') + (paquet ? ' paquet' : '');
  el.setAttribute('role', 'status');
  el.dataset.id = ids.join(' ');
  el.innerHTML = '<div class="gr-trouve-imgs">' + ids.map(function(id){ return '<div class="gr-trouve-img' + (Gd.ITEMS[id].rare ? ' rare' : '') + '">' + vignette(id) + '</div>'; }).join('') + '</div>' +
    '<div class="gr-trouve-t"><small>' + esc(titre) + '</small><b>' + esc(t) + '</b></div>' +
    '<button type="button" class="gr-trouve-lire" aria-label="Écouter">🔊</button>';
  document.body.appendChild(el);
  carteEnCours = el;
  el.querySelector('button').addEventListener('click', function(e){ e.preventDefault(); e.stopPropagation(); M.lire((paquet ? 'Un paquet ! ' : '') + t); });
  try{ M.son(rare || paquet ? 'magie' : 'gain'); }catch(e){}
  badgeOnglet();
  /* le message « ✅ Mission validée ! » (#toast) s'affiche au même endroit : la carte descend juste en dessous le temps qu'il est là */
  var tst = document.getElementById('toast'), suit = function(){
    var on = !!(tst && tst.classList.contains('on'));
    el.classList.toggle('bas', on);
    el.style.top = on ? Math.round(tst.getBoundingClientRect().bottom + 8) + 'px' : '';
  };
  suit(); var it = setInterval(function(){ if(!el.parentNode) clearInterval(it); else suit(); }, 150);
  setTimeout(function(){ clearInterval(it); partir(el); }, paquet ? 4600 : 3800);
}
function partir(el){
  if(!el.parentNode){ suivante(); return; }
  var cible = document.querySelector('.b-onglets [data-o="role"]'), doux = matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fin = function(){ if(el.parentNode) el.parentNode.removeChild(el); var b = document.querySelector('.b-onglets [data-o="role"]'); if(b){ b.classList.remove('cb-recu'); void b.offsetWidth; b.classList.add('cb-recu'); } setTimeout(suivante, 150); };
  if(!cible || doux || !el.animate){ el.classList.add('part'); setTimeout(fin, 400); return; }
  var a = el.getBoundingClientRect(), b = cible.getBoundingClientRect();
  var dx = (b.left + b.width / 2) - (a.left + a.width / 2), dy = (b.top + b.height / 2) - (a.top + a.height / 2);
  var an = el.animate([{transform:'translate(-50%,0) scale(1)', opacity:1}, {transform:'translate(calc(-50% + ' + dx + 'px),' + dy + 'px) scale(.15)', opacity:.2}], {duration:700, easing:'cubic-bezier(.5,0,.75,.4)', fill:'forwards'});
  an.onfinish = fin;
}
/* ✨ sur l'onglet Cabane quand il y a des vêtements pas encore vus */
function badgeOnglet(){
  var b = document.querySelector('.b-onglets [data-o="role"] span');
  if(!b) return;
  var G = M.role() === 'pisteur' ? etatGarde() : null, n = G ? nouveaux(G) : 0;
  var ss = 0; try{ ss = M.nouveauxSousSols ? M.nouveauxSousSols() : 0; }catch(e){}   /* un chemin secret nouveau (sous terre ou en surface), sur le chevalet */
  n += ss;
  var x = b.querySelector('.cb-onglet-badge');
  if(n && !x){ x = document.createElement('em'); x.className = 'cb-onglet-badge'; x.setAttribute('aria-label', 'Du nouveau dans ta cabane'); x.textContent = '✨'; b.appendChild(x); }
  if(!n && x) x.remove();
}

/* ==========================================================
   La cabane : mise en page. Le monde fait toute la hauteur de l'écran (760 unités) ;
   à gauche l'armoire, le Pisteur en grand et le sac ; à droite le chevalet, dont la carte
   prend presque tout l'écran (sa taille suit l'écran). On glisse de l'un à l'autre.
   ========================================================== */
function mise(w, h){
  var k = Math.max(.28, h / H);
  var fw = Math.round(Math.max(340, Math.min(3000, .94 * w / k))), fh = Math.round(Math.max(300, Math.min(650, .9 * h / k)));
  var X0 = 960, WW = X0 + 30 + fw + 50;
  var hw = HERO.h * 300 / 440;
  var B = {
    armoire:[20, 140, 214, 470],
    perso:[HERO.x - hw / 2, HERO.pied - HERO.h * 414 / 440, hw, HERO.h],
    sac:[672, 492, 150, 160],                 /* contre le mur du fond */
    cadre:[X0 + 30, 22, fw, fh]
  };
  var vw = w / k, e = vw > WW ? (vw - WW) / 2 : 0;
  var vb = {x0:-e, y0:0, w:WW + 2 * e, h:H};
  return {k:k, w:w, h:h, vb:vb, mw:vb.w * k, mh:vb.h * k, B:B, X0:X0, WW:WW, fw:fw, fh:fh, cle:[Math.round(w), Math.round(h)].join('x')};
}
function px(L, b){ return 'left:' + ((b[0] - L.vb.x0) * L.k).toFixed(1) + 'px;top:' + ((b[1] - L.vb.y0) * L.k).toFixed(1) + 'px;width:' + (b[2] * L.k).toFixed(1) + 'px;height:' + (b[3] * L.k).toFixed(1) + 'px'; }

/* ---------- Le décor (une seule image, la cabane ne bouge pas) ---------- */
var K0 = '#24182e';
function ciel(mid){
  return {matin:['#ffcf9e', '#a8d8ff'], apresmidi:['#8fd0ff', '#e6f7ff'], soir:['#ff9a5a', '#7a4f9e'], nuit:['#141a46', '#2c3572']}[mid] || ['#8fd0ff', '#e6f7ff'];
}
function fond(L, mid, nom){
  var vb = L.vb, x0 = vb.x0, x1 = vb.x0 + vb.w, y0 = vb.y0, y1 = vb.y0 + vb.h, s = '';
  var sk = ciel(mid), nuit = mid === 'nuit' || mid === 'soir';
  s += '<defs><linearGradient id="cb-log" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#c58f58"/><stop offset=".45" stop-color="#93603a"/><stop offset="1" stop-color="#5c391d"/></linearGradient>' +
    '<linearGradient id="cb-log2" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#b98250"/><stop offset=".45" stop-color="#875632"/><stop offset="1" stop-color="#53321a"/></linearGradient>' +
    '<linearGradient id="cb-poutre" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8a5a34"/><stop offset="1" stop-color="#4a2c16"/></linearGradient>' +
    '<linearGradient id="cb-pied" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#5a3518"/><stop offset=".45" stop-color="#b47c48"/><stop offset="1" stop-color="#5a3518"/></linearGradient>' +
    '<linearGradient id="cb-sol" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#5a371c"/><stop offset=".25" stop-color="#7c5030"/><stop offset="1" stop-color="#5e3a1e"/></linearGradient>' +
    '<linearGradient id="cb-ciel" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="' + sk[1] + '"/><stop offset="1" stop-color="' + sk[0] + '"/></linearGradient>' +
    '<radialGradient id="cb-lueur"><stop offset="0" stop-color="#ffe9a8" stop-opacity=".75"/><stop offset=".5" stop-color="#ffc860" stop-opacity=".25"/><stop offset="1" stop-color="#ffc860" stop-opacity="0"/></radialGradient>' +
    '<linearGradient id="cb-ombre-mur" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#000" stop-opacity=".45"/><stop offset="1" stop-color="#000" stop-opacity="0"/></linearGradient></defs>';
  /* plafond et grosse poutre */
  s += '<rect x="' + x0 + '" y="' + y0 + '" width="' + vb.w + '" height="' + (64 - y0) + '" fill="#2e1c12"/>';
  for(var xr = Math.floor(x0 / 170) * 170 + 40; xr < x1; xr += 170) s += '<path d="M' + xr + ' ' + y0 + ' L ' + (xr + 26) + ' ' + y0 + ' L ' + (xr + 26) + ' 40 L ' + xr + ' 40 Z" fill="#4a2e1a" stroke="' + K0 + '" stroke-width="3"/>';
  /* le mur du fond : des rondins */
  var n = 10, hl = (MUR - 62) / n;
  for(var i = 0; i < n; i++){
    var y = 62 + i * hl;
    s += '<rect x="' + (x0 - 30) + '" y="' + y.toFixed(1) + '" width="' + (vb.w + 60) + '" height="' + (hl + 1).toFixed(1) + '" rx="22" fill="url(#cb-log' + (i % 2 ? '2' : '') + ')" stroke="' + K0 + '" stroke-width="3"/>';
    s += '<path d="M' + (x0 + 30) + ' ' + (y + hl * .32).toFixed(1) + ' H ' + (x1 - 30) + '" stroke="#e8b47a" stroke-width="2" opacity=".28"/>';
    for(var g = 0; g < 6; g++){
      var gx = x0 + ((i * 397 + g * 331) % Math.max(200, vb.w - 200)) + 100, gy = y + hl * (.45 + ((i + g) % 3) * .12);
      s += '<path d="M' + gx.toFixed(0) + ' ' + gy.toFixed(1) + ' q 40 -6 80 0 t 80 0" stroke="#4a2c16" stroke-width="1.6" fill="none" opacity=".5"/>';
      if((i + g) % 3 === 0) s += '<ellipse cx="' + (gx + 60).toFixed(0) + '" cy="' + (gy - 2).toFixed(1) + '" rx="9" ry="5" fill="#5a3518" stroke="#3a2010" stroke-width="1.4" opacity=".75"/>';
    }
  }
  /* les coins : les bouts des rondins */
  [x0 + 16, x1 - 16].forEach(function(cx){
    for(var j = 0; j < n; j++){
      var cy = 62 + j * hl + hl / 2;
      s += '<circle cx="' + cx + '" cy="' + cy.toFixed(1) + '" r="' + (hl / 2 + 3).toFixed(1) + '" fill="#d1a26c" stroke="' + K0 + '" stroke-width="3"/><circle cx="' + cx + '" cy="' + cy.toFixed(1) + '" r="' + (hl / 3.2).toFixed(1) + '" fill="none" stroke="#9a6a3e" stroke-width="2"/><circle cx="' + cx + '" cy="' + cy.toFixed(1) + '" r="' + (hl / 7).toFixed(1) + '" fill="none" stroke="#9a6a3e" stroke-width="2"/>';
    }
  });
  s += '<rect x="' + x0 + '" y="24" width="' + vb.w + '" height="40" rx="8" fill="url(#cb-poutre)" stroke="' + K0 + '" stroke-width="3"/><path d="M' + x0 + ' 34 H ' + x1 + '" stroke="#c48a50" stroke-width="2" opacity=".35"/>';
  /* le plancher */
  s += '<rect x="' + x0 + '" y="' + (MUR + 10) + '" width="' + vb.w + '" height="' + (y1 - MUR - 10) + '" fill="url(#cb-sol)"/>';
  var vx = (x0 + x1) / 2, vy = 250, kk = (y1 - vy) / (MUR + 10 - vy);
  for(var xp = Math.floor(x0 / 86) * 86; xp <= x1 + 86; xp += 86) s += '<path d="M' + xp + ' ' + (MUR + 10) + ' L ' + (vx + (xp - vx) * kk).toFixed(0) + ' ' + y1 + '" stroke="#3e2512" stroke-width="2.4" opacity=".7"/>';
  for(var r = 0; r < 24; r++){ var jy = MUR + 40 + (r * 53) % Math.max(60, y1 - MUR - 50), jx = x0 + ((r * 211) % Math.max(100, vb.w)); s += '<path d="M' + jx + ' ' + jy + ' h 40" stroke="#3e2512" stroke-width="2" opacity=".5"/>'; }
  s += '<rect x="' + x0 + '" y="' + (MUR + 10) + '" width="' + vb.w + '" height="60" fill="url(#cb-ombre-mur)"/>';
  s += '<rect x="' + x0 + '" y="' + (MUR - 6) + '" width="' + vb.w + '" height="18" fill="#4a2c16" stroke="' + K0 + '" stroke-width="3"/>';
  /* le tapis tressé sous le Pisteur, des traces de pattes de renard vers le chevalet */
  s += '<g transform="translate(' + HERO.x + ' ' + (HERO.pied - 10) + ')"><ellipse rx="226" ry="40" fill="#8a3a32" stroke="' + K0 + '" stroke-width="3"/><ellipse rx="186" ry="32" fill="none" stroke="#d9a441" stroke-width="9"/><ellipse rx="140" ry="23" fill="none" stroke="#4a7a52" stroke-width="9"/><ellipse rx="90" ry="14" fill="none" stroke="#e8c890" stroke-width="8"/></g>';
  for(var pi = 0; pi < 6; pi++){ var qx = 760 + pi * 36, qy = 700 + (pi % 2) * 22; s += '<g transform="translate(' + qx + ' ' + qy + ') rotate(' + (pi % 2 ? -14 : 8) + ')" fill="#2a180c" opacity=".28"><ellipse cx="0" cy="4" rx="7" ry="6"/><circle cx="-7" cy="-5" r="2.6"/><circle cx="-2" cy="-8" r="2.6"/><circle cx="3" cy="-8" r="2.6"/><circle cx="8" cy="-5" r="2.6"/></g>'; }
  /* la cible de tir, entre la fenêtre et le chevalet */
  s += '<g transform="translate(912 150)"><circle r="44" fill="#f4ead6" stroke="' + K0 + '" stroke-width="3.4"/><circle r="34" fill="#d84a3e"/><circle r="24" fill="#f4ead6"/><circle r="14" fill="#2f6ed0"/><circle r="6" fill="#f1c232"/>' +
    '<path d="M4 -2 L 58 -26" stroke="' + K0 + '" stroke-width="4"/><path d="M4 -2 L 58 -26" stroke="#d9cbb0" stroke-width="2"/><path d="M52 -30 l 12 -2 l -4 8 M50 -22 l 12 2 l -8 6" fill="#e8584a" stroke="' + K0 + '" stroke-width="1.6"/>' +
    '<path d="M-10 12 L -60 36" stroke="' + K0 + '" stroke-width="4"/><path d="M-10 12 L -60 36" stroke="#d9cbb0" stroke-width="2"/><path d="M-54 40 l -12 0 l 4 -8 M-56 32 l -10 -4 l 8 -4" fill="#4aa64e" stroke="' + K0 + '" stroke-width="1.6"/></g>';
  /* la fenêtre (le ciel change avec le moment), au-dessus du sac ; avec la pancarte et l'étagère, juste à droite du Pisteur */
  s += '<g transform="translate(60 0)"><g transform="translate(600 118)">';
  s += '<rect x="-16" y="-12" width="208" height="210" rx="10" fill="#5a3518" stroke="' + K0 + '" stroke-width="4"/>';
  s += '<rect x="0" y="0" width="176" height="186" rx="4" fill="url(#cb-ciel)" stroke="' + K0 + '" stroke-width="3"/>';
  if(nuit) s += '<circle cx="132" cy="44" r="18" fill="#fff6dc"/><circle cx="125" cy="40" r="4" fill="#efe2c0"/><g fill="#fff"><circle cx="30" cy="30" r="1.8"/><circle cx="72" cy="20" r="1.4"/><circle cx="98" cy="66" r="1.6"/><circle cx="20" cy="80" r="1.2"/></g>';
  else s += '<circle cx="128" cy="52" r="20" fill="#fff2b0" opacity=".95"/><path d="M14 60 q 14 -12 28 0 q 10 -10 22 0 Z" fill="#fff" opacity=".85"/>';
  s += '<path d="M0 150 L 16 110 L 30 140 L 48 92 L 68 140 L 84 104 L 104 146 L 122 100 L 140 144 L 158 112 L 176 146 L 176 186 L 0 186 Z" fill="' + (nuit ? '#1a2a3a' : '#2e5a44') + '"/>';
  s += '<path d="M0 170 Q 88 150 176 172 L 176 186 L 0 186 Z" fill="' + (nuit ? '#142030' : '#3f7a52') + '"/>';
  s += '<path d="M88 0 V 186 M0 93 H 176" stroke="#5a3518" stroke-width="9"/><path d="M88 0 V 186 M0 93 H 176" stroke="' + K0 + '" stroke-width="2" opacity=".5"/>';
  s += '<path d="M8 8 l 30 30 M110 104 l 24 24" stroke="#fff" stroke-width="4" opacity=".25" stroke-linecap="round"/>';
  s += '<rect x="-24" y="186" width="224" height="16" rx="4" fill="#6b4122" stroke="' + K0 + '" stroke-width="3"/>';
  s += '<g transform="translate(150 186)"><path d="M-12 0 L -10 -20 L 10 -20 L 12 0 Z" fill="#c8643a" stroke="' + K0 + '" stroke-width="2.4"/><path d="M0 -20 C -4 -40 -16 -44 -18 -52 C -6 -50 0 -40 0 -20 Z M0 -20 C 4 -38 14 -46 20 -48 C 16 -36 6 -30 0 -20 Z M0 -20 C 0 -40 4 -50 2 -60 C 8 -48 6 -32 0 -20 Z" fill="#5fae5a" stroke="' + K0 + '" stroke-width="2"/></g>';
  s += '<g transform="translate(30 186)"><path d="M-10 0 C -12 -14 -6 -24 0 -26 C 6 -24 12 -14 10 0 Z" fill="#8a5a30" stroke="' + K0 + '" stroke-width="2.2"/><path d="M-8 -6 h16 M-9 -12 h18 M-7 -18 h14" stroke="#5a3518" stroke-width="2"/></g>';
  ['M-30 -18 C -36 40 -10 70 -14 100 C -10 130 -30 170 -26 196 L 10 196 C 4 150 14 120 2 100 C 12 70 4 30 10 -18 Z', 'M206 -18 C 212 40 186 70 190 100 C 186 130 206 170 202 196 L 166 196 C 172 150 162 120 174 100 C 164 70 172 30 166 -18 Z'].forEach(function(d){
    s += '<path d="' + d + '" fill="#d84a3e" stroke="' + K0 + '" stroke-width="3"/>';
  });
  s += '<path d="M-28 10 h 36 M-30 40 h 38 M-24 70 h 34 M-16 130 h 22 M-26 160 h 32 M168 10 h 36 M168 40 h 38 M174 70 h 22 M178 130 h 22 M170 160 h 32" stroke="#fff3e6" stroke-width="5" opacity=".7"/>';
  s += '<path d="M-16 98 q 14 6 22 -4 M192 98 q -14 6 -22 -4" stroke="#e8c050" stroke-width="5" fill="none" stroke-linecap="round"/>';
  s += '<rect x="-44" y="-26" width="264" height="10" rx="5" fill="#3a2412" stroke="' + K0 + '" stroke-width="2.4"/>';
  s += '</g>';
  /* la pancarte avec son nom */
  var t = 'Cabane de ' + (nom || 'Pisteur'), tl = t.length > 13 ? ' textLength="' + Math.min(184, t.length * 12) + '" lengthAdjust="spacingAndGlyphs"' : '';
  s += '<path d="M626 64 L 634 40 M774 64 L 766 40" stroke="#c9a46a" stroke-width="3"/>';
  s += '<rect x="590" y="62" width="220" height="40" rx="10" fill="#b98250" stroke="' + K0 + '" stroke-width="3.4"/><rect x="598" y="68" width="204" height="28" rx="7" fill="none" stroke="#7a4a26" stroke-width="2"/>';
  s += '<text x="700" y="90" text-anchor="middle" font-family="Macondo, Georgia, serif" font-size="23" fill="#3a2412"' + tl + '>' + esc(t) + '</text>';
  /* l'étagère, sa lanterne, ses bocaux */
  s += '<path d="M612 366 L 624 392 M766 366 L 754 392" stroke="#4a2c16" stroke-width="7" stroke-linecap="round"/><rect x="600" y="354" width="180" height="14" rx="4" fill="#9a6a3e" stroke="' + K0 + '" stroke-width="3"/>';
  s += '<g transform="translate(640 354)"><circle cy="-34" r="44" fill="url(#cb-lueur)" class="cb-lueur"/><path d="M-12 -62 Q 0 -78 12 -62" fill="none" stroke="' + K0 + '" stroke-width="4"/><rect x="-16" y="-62" width="32" height="8" rx="3" fill="#c99a3a" stroke="' + K0 + '" stroke-width="2.4"/><rect x="-13" y="-54" width="26" height="46" rx="5" fill="#ffe3a3" stroke="' + K0 + '" stroke-width="2.4"/><path class="cb-flamme" d="M0 -42 C -6 -32 -4 -22 0 -18 C 4 -22 6 -32 0 -42 Z" fill="#e8693c"/><rect x="-16" y="-8" width="32" height="8" rx="3" fill="#c99a3a" stroke="' + K0 + '" stroke-width="2.4"/></g>';
  s += '<g transform="translate(694 354)"><path d="M-12 0 L -12 -30 Q -12 -36 -6 -36 L 6 -36 Q 12 -36 12 -30 L 12 0 Z" fill="#9fd0e8" fill-opacity=".8" stroke="' + K0 + '" stroke-width="2.4"/><rect x="-10" y="-42" width="20" height="8" rx="2" fill="#8a5a30" stroke="' + K0 + '" stroke-width="2"/><circle cx="-3" cy="-12" r="4" fill="#d84a3e"/><circle cx="4" cy="-20" r="3.4" fill="#d84a3e"/><circle cx="2" cy="-8" r="3" fill="#d84a3e"/></g>';
  s += '<g transform="translate(730 354)"><path d="M-9 0 L -9 -24 Q -9 -28 -4 -28 L 4 -28 Q 9 -28 9 -24 L 9 0 Z" fill="#b8e6a8" fill-opacity=".85" stroke="' + K0 + '" stroke-width="2.2"/><path d="M0 -28 C -4 -50 -12 -56 -10 -70 C 0 -60 4 -46 0 -28 Z" fill="#f4f0e6" stroke="' + K0 + '" stroke-width="2"/></g>';
  s += '<g transform="translate(762 354)"><path d="M-9 0 C -11 -12 -6 -22 0 -24 C 6 -22 11 -12 9 0 Z" fill="#8a5a30" stroke="' + K0 + '" stroke-width="2"/><path d="M-7 -6 h14 M-8 -12 h16 M-6 -18 h12" stroke="#5a3518" stroke-width="1.8"/></g></g>';
  /* un panier de pommes de pin près de l'armoire */
  s += '<g transform="translate(118 690)"><path d="M-34 0 L -28 34 Q 0 42 28 34 L 34 0 Z" fill="#c9a46a" stroke="' + K0 + '" stroke-width="3"/><path d="M-32 10 Q 0 18 32 10 M-30 22 Q 0 30 30 22" stroke="#8a6a3a" stroke-width="2" fill="none"/>' +
    [[-16, -2], [0, -8], [16, -2], [-6, 2]].map(function(q){ return '<g transform="translate(' + q[0] + ' ' + q[1] + ')"><path d="M-8 4 C -10 -6 -5 -14 0 -16 C 5 -14 10 -6 8 4 Z" fill="#8a5a30" stroke="' + K0 + '" stroke-width="2"/><path d="M-6 -2 h12 M-7 -8 h14" stroke="#5a3518" stroke-width="1.6"/></g>'; }).join('') + '</g>';
  /* le chevalet : un mât derrière le grand cadre, trois pieds jusqu'au plancher, une tablette où il repose */
  var c = L.B.cadre, cx0 = c[0], cw = c[2], yb = c[1] + c[3];
  s += '<path d="M' + (cx0 + cw / 2) + ' ' + (yb - 30) + ' L ' + (cx0 + cw / 2) + ' 742" stroke="' + K0 + '" stroke-width="18" stroke-linecap="round"/><path d="M' + (cx0 + cw / 2) + ' ' + (yb - 30) + ' L ' + (cx0 + cw / 2) + ' 742" stroke="#5a3518" stroke-width="12" stroke-linecap="round"/>';
  [[.16, .04], [.84, .96]].forEach(function(q){
    var xa = cx0 + cw * q[0], xb = cx0 + cw * q[1];
    s += '<path d="M' + xa + ' ' + (yb - 40) + ' L ' + xb + ' 758" stroke="' + K0 + '" stroke-width="22" stroke-linecap="round"/><path d="M' + xa + ' ' + (yb - 40) + ' L ' + xb + ' 758" stroke="url(#cb-pied)" stroke-width="15" stroke-linecap="round"/>';
  });
  s += '<rect x="' + (cx0 + cw / 2 - 12) + '" y="4" width="24" height="40" rx="6" fill="#7a4a26" stroke="' + K0 + '" stroke-width="3"/>';
  s += '<rect x="' + (cx0 - 22) + '" y="' + (yb - 8) + '" width="' + (cw + 44) + '" height="24" rx="6" fill="#9a6a3e" stroke="' + K0 + '" stroke-width="3.4"/><path d="M' + (cx0 - 14) + ' ' + (yb) + ' H ' + (cx0 + cw + 14) + '" stroke="#c48a50" stroke-width="2" opacity=".5"/>';
  /* sur la tablette du chevalet : une bougie, une boussole */
  s += '<g transform="translate(' + (cx0 + 30) + ' ' + (yb - 8) + ')"><circle cy="-30" r="34" fill="url(#cb-lueur)" class="cb-lueur"/><rect x="-12" y="-6" width="24" height="6" rx="3" fill="#c99a3a" stroke="' + K0 + '" stroke-width="2"/><rect x="-6" y="-30" width="12" height="24" rx="3" fill="#f4ead6" stroke="' + K0 + '" stroke-width="2"/><path class="cb-flamme" d="M0 -44 C -5 -37 -4 -32 0 -30 C 4 -32 5 -37 0 -44 Z" fill="#ffb040"/></g>';
  s += '<g transform="translate(' + (cx0 + cw - 40) + ' ' + (yb - 14) + ')"><ellipse rx="24" ry="9" fill="#c99a3a" stroke="' + K0 + '" stroke-width="2.4"/><ellipse rx="17" ry="5.6" fill="#f4ead6"/><path d="M-12 0 L 12 0" stroke="#d84a3e" stroke-width="3" stroke-linecap="round"/><path d="M0 0 L 12 0" stroke="#2f6ed0" stroke-width="3" stroke-linecap="round"/></g>';
  /* la lumière du moment */
  s += '<rect class="cb-ambiance" x="' + x0 + '" y="' + y0 + '" width="' + vb.w + '" height="' + vb.h + '" fill="' + (mid === 'nuit' ? '#0a1030' : mid === 'soir' ? '#3a1a30' : mid === 'matin' ? '#ffb070' : '#ffffff') + '" opacity="' + (mid === 'nuit' ? .34 : mid === 'soir' ? .16 : mid === 'matin' ? .06 : 0) + '" pointer-events="none"/>';
  return '<svg class="cb-fond-svg" viewBox="' + [x0, y0, vb.w, vb.h].map(function(v){ return v.toFixed(1); }).join(' ') + '" preserveAspectRatio="none" aria-hidden="true">' + s + '</svg>';
}

/* ---------- L'armoire et le sac (dessins fixes) ---------- */
function armoireSVG(G){
  var porte = G && G.p, bouche = porte && porte.bouche && G.a[porte.bouche] ? Gd.teinte(G.a[porte.bouche].c).c : '#d33a3a';
  var s = '<svg viewBox="0 0 214 470" aria-hidden="true"><defs><linearGradient id="cb-ar" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#b47c48"/><stop offset=".55" stop-color="#8a5a32"/><stop offset="1" stop-color="#5a361a"/></linearGradient>' +
    '<linearGradient id="cb-ar2" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#c48e56"/><stop offset="1" stop-color="#8a5a32"/></linearGradient></defs>';
  s += '<rect x="22" y="448" width="28" height="20" rx="4" fill="#4a2c16" stroke="' + K0 + '" stroke-width="3"/><rect x="164" y="448" width="28" height="20" rx="4" fill="#4a2c16" stroke="' + K0 + '" stroke-width="3"/>';
  s += '<rect x="10" y="40" width="194" height="414" rx="10" fill="url(#cb-ar)" stroke="' + K0 + '" stroke-width="4"/>';
  s += '<path d="M2 48 L 212 48 L 206 26 Q 107 -4 8 26 Z" fill="#6b4122" stroke="' + K0 + '" stroke-width="4" stroke-linejoin="round"/>';
  s += '<path d="M107 6 C 98 14 96 26 107 34 C 118 26 116 14 107 6 Z" fill="#5fae5a" stroke="' + K0 + '" stroke-width="2.4"/><path d="M107 10 V 32" stroke="#3f7a3c" stroke-width="1.6"/>';
  [[22, 104], [110, 192]].forEach(function(d, i){
    s += '<rect x="' + d[0] + '" y="58" width="' + (d[1] - d[0] - 2) + '" height="378" rx="6" fill="url(#cb-ar2)" stroke="' + K0 + '" stroke-width="3"/>';
    s += '<rect x="' + (d[0] + 12) + '" y="74" width="' + (d[1] - d[0] - 26) + '" height="150" rx="10" fill="none" stroke="#5a361a" stroke-width="3"/><rect x="' + (d[0] + 12) + '" y="240" width="' + (d[1] - d[0] - 26) + '" height="180" rx="10" fill="none" stroke="#5a361a" stroke-width="3"/>';
    var cx = (d[0] + d[1]) / 2 - 1;
    if(i === 0) s += '<path d="M' + cx + ' 110 V 190 M' + (cx - 10) + ' 124 L ' + cx + ' 108 L ' + (cx + 10) + ' 124 M' + (cx - 10) + ' 190 l 10 -10 l 10 10" stroke="#5a361a" stroke-width="3.4" fill="none" stroke-linecap="round" stroke-linejoin="round"/>';
    else s += '<path d="M' + cx + ' 112 C ' + (cx - 22) + ' 140 ' + (cx - 16) + ' 176 ' + cx + ' 192 C ' + (cx + 16) + ' 176 ' + (cx + 22) + ' 140 ' + cx + ' 112 Z M' + cx + ' 118 V 190" stroke="#5a361a" stroke-width="3" fill="none"/>';
  });
  s += '<circle cx="98" cy="250" r="7" fill="#e8c050" stroke="' + K0 + '" stroke-width="2.4"/><circle cx="118" cy="250" r="7" fill="#e8c050" stroke="' + K0 + '" stroke-width="2.4"/>';
  s += '<path d="M106 286 C 114 312 98 340 108 372 L 120 370 C 112 340 126 312 114 286 Z" fill="' + bouche + '" stroke="' + K0 + '" stroke-width="2.6"/><path d="M108 372 l -2 10 M112 372 l 0 11 M116 371 l 2 10" stroke="' + bouche + '" stroke-width="3" stroke-linecap="round"/>';
  s += '<path d="M10 52 V 440" stroke="#fff" stroke-width="3" opacity=".12"/>';
  s += '<g transform="translate(66 26)"><path d="M-44 0 C -36 -12 36 -12 44 0 C 34 8 -34 8 -44 0 Z" fill="#5a4a3a" stroke="' + K0 + '" stroke-width="3"/><path d="M-24 -4 C -24 -34 24 -34 24 -4 Z" fill="#7a6a58" stroke="' + K0 + '" stroke-width="3"/><path d="M-24 -10 C -10 -14 10 -14 24 -10 L 24 -4 C 10 -8 -10 -8 -24 -4 Z" fill="#d84a3e"/></g>';
  return s + '</svg>';
}
function sacSVG(){
  return '<svg viewBox="0 0 150 160" aria-hidden="true"><defs><linearGradient id="cb-sacg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#c08850"/><stop offset=".55" stop-color="#8a5a30"/><stop offset="1" stop-color="#5a3518"/></linearGradient></defs>' +
    '<rect x="6" y="100" width="138" height="58" rx="4" fill="#9a6a3e" stroke="' + K0 + '" stroke-width="3"/><path d="M6 118 H 144 M6 138 H 144 M40 100 V 158 M110 100 V 158" stroke="#5a361a" stroke-width="2.4"/>' +
    '<path d="M30 104 C 24 64 36 30 75 28 C 114 30 126 64 120 104 Z" fill="url(#cb-sacg)" stroke="' + K0 + '" stroke-width="3.4"/>' +
    '<path d="M22 70 C 14 74 14 96 24 102 L 30 100 C 26 90 26 78 30 70 Z M128 70 C 136 74 136 96 126 102 L 120 100 C 124 90 124 78 120 70 Z" fill="#7a4a26" stroke="' + K0 + '" stroke-width="2.6"/>' +
    '<path d="M36 58 C 44 36 106 36 114 58 L 110 80 Q 75 90 40 80 Z" fill="#6e4223" stroke="' + K0 + '" stroke-width="3"/>' +
    '<rect x="68" y="66" width="14" height="34" rx="3" fill="#5a3518" stroke="' + K0 + '" stroke-width="2.4"/><rect x="66" y="78" width="18" height="14" rx="3" fill="none" stroke="#e8c050" stroke-width="3"/>' +
    '<rect x="28" y="10" width="94" height="28" rx="14" fill="#4a7a52" stroke="' + K0 + '" stroke-width="3"/><path d="M44 10 V 38 M60 10 V 38 M90 10 V 38 M106 10 V 38" stroke="#d84a3e" stroke-width="4"/><path d="M28 24 H 122" stroke="#e8c890" stroke-width="2" opacity=".7"/>' +
    '<path d="M50 30 V 46 M100 30 V 46" stroke="#3a2010" stroke-width="5" stroke-linecap="round"/></svg>';
}

/* ---------- Le Pisteur, en grand, accroupi aux aguets (chaque partie du corps se touche) ---------- */
function persoSVG(){
  try{ var h = M.heroObj(); return Persos.heros(h, {vue:'pied', pose:'guet', anime:true, fond:false, zones:true, id:'cbperso'}); }catch(e){ console.error(e); return ''; }
}
function majPortraitBandeau(){
  var b = document.querySelector('.b-et-heros');
  if(b && M.portrait) b.innerHTML = M.portrait('tete', false);
}

/* ==========================================================
   L'onglet
   ========================================================== */
M.cabanePlein = function(){ return M.role() === 'pisteur' && !!window.Garde && !!window.Persos; };
function estimer(){ var w = window.innerWidth || 800, h = Math.max(240, (window.innerHeight || 800) - 128); return {w:w, h:h}; }
M.cabaneHTML = function(){
  var S = M.S, G = etatGarde(S), P = M.P(), e = estimer(), L = mise(e.w, e.h), mid = M.momentId ? M.momentId() : 'matin';
  var n = G ? nouveaux(G) : 0, codes = P ? M.cle(P.objets || {}).length : 0;
  var aide = 'Glisse avec ton doigt pour voir toute ta cabane. Pour t\'habiller, touche ton personnage : la tête, le cou, le torse, le pantalon, les bottes, les mains ou le carquois. Les bulles changent la couleur. L\'armoire montre ta collection, le sac tes objets et leurs codes, et le grand tableau tous tes chemins secrets.';
  var s = '<div id="cabane-ici" class="cb cb-m-' + mid + '" style="height:' + e.h + 'px"><div class="cb-vue">';
  s += '<div class="cb-monde" style="width:' + L.mw.toFixed(1) + 'px;height:' + L.mh.toFixed(1) + 'px">';
  s += '<div class="cb-fond">' + fond(L, mid, S.heros && S.heros.nom) + '</div>';
  s += '<button type="button" class="cb-obj cb-armoire" data-cb="armoire" data-b="armoire" style="' + px(L, L.B.armoire) + '" aria-label="Ma collection de vêtements">' + armoireSVG(G) + '<span class="cb-etiq">🧥 Collection</span>' + (n ? '<i class="cb-badge">✨ ' + n + '</i>' : '') + '</button>';
  s += '<button type="button" class="cb-obj cb-sac" data-cb="sac" data-b="sac" style="' + px(L, L.B.sac) + '" aria-label="Ouvrir mon sac">' + sacSVG() + '<span class="cb-etiq">🎒 Mon sac</span>' + (codes ? '<i class="cb-badge cb-badge-sac">' + codes + '</i>' : '') + '</button>';
  s += '<div class="cb-obj cb-perso" data-cb="perso" data-b="perso" style="' + px(L, L.B.perso) + '" aria-label="Mon personnage : touche une partie du corps pour l\'habiller">' + persoSVG() + '</div>';
  s += '<div class="cb-obj cb-cadre" data-b="cadre" style="' + px(L, L.B.cadre) + '"><i class="cb-clou a"></i><i class="cb-clou b"></i><i class="cb-clou c"></i><i class="cb-clou d"></i>' +
    '<div id="cabane-carte" class="cb-carte" style="left:' + (CARTE_IN * L.k).toFixed(1) + 'px;top:' + (CARTE_IN * L.k).toFixed(1) + 'px;right:' + (CARTE_IN * L.k).toFixed(1) + 'px;bottom:' + (CARTE_IN * L.k).toFixed(1) + 'px"></div></div>';
  s += '</div>';
  s += '<button type="button" class="cb-fleche g" data-cb="gauche" aria-label="Voir à gauche" hidden>‹</button><button type="button" class="cb-fleche d" data-cb="droite" aria-label="Voir à droite" hidden>›</button>';
  s += '<p class="cb-aide" hidden><span>👆 Touche-moi pour m\'habiller</span>' + M.lireBtn(aide) + '</p>';
  s += '</div><div class="cb-couleurs" hidden></div><div class="cb-choix" hidden></div><div class="gr" hidden></div></div>';
  return s;
};

var V = null;    /* la cabane montée */
M.demonterCabane = function(){
  if(!V) return;
  try{
    V.suivis.slice().forEach(function(f){ f(); });
    V.nettoie.forEach(function(f){ try{ f(); }catch(e){} });
  }catch(e){}
  UI.cbPan = V.centre ? V.centre() : UI.cbPan;
  V = null;
};
M.monterCabane = function(){
  try{ verifier(); }catch(e){ console.error(e); }
  badgeOnglet();
  var ici = document.getElementById('cabane-ici');
  if(!ici){ if(UI.cbChoix) vusZone(UI.cbChoix.zone); UI.gr = null; UI.cbChoix = null; return; }
  M.demonterCabane();
  V = {ici:ici, vue:ici.querySelector('.cb-vue'), monde:ici.querySelector('.cb-monde'), gr:ici.querySelector('.gr'), choix:ici.querySelector('.cb-choix'), couleurs:ici.querySelector('.cb-couleurs'),
    pan:{x:0, y:0}, suivis:[], nettoie:[], L:null, avaler:false};
  V.centre = function(){ var L = V.L; if(!L) return null; return {x:L.vb.x0 + (V.pan.x + L.w / 2) / L.k, y:L.vb.y0 + (V.pan.y + L.h / 2) / L.k}; };
  hauteur();
  /* UI.cbVersCarte (carte-jeu.js, le code d'un chemin secret) : la cabane s'ouvre devant le tableau des chemins secrets du chevalet */
  if(UI.cbVersCarte){
    UI.cbVersCarte = false;
    var L0 = mise(V.vue.clientWidth || 800, V.vue.clientHeight || 600), c0 = L0.B.cadre;
    UI.cbPan = {x:c0[0] + c0[2] / 2, y:c0[1] + c0[3] / 2};
  }
  appliquerMise(true);
  remplirCarte();
  brancher();
  brancherChoix();
  var onR = function(){ if(!V) return; hauteur(); appliquerMise(); };
  window.addEventListener('resize', onR);
  V.nettoie.push(function(){ window.removeEventListener('resize', onR); });
  if(window.ResizeObserver){ var ro = new ResizeObserver(function(){ if(V) appliquerMise(); }); ro.observe(ici); V.nettoie.push(function(){ ro.disconnect(); }); }
  if(UI.gr && UI.gr.ouvert) dessinerCollection();
  if(UI.cbChoix) dessinerChoix(true);
};
function hauteur(){
  var ici = V.ici, nav = document.querySelector('.b-onglets'), bas = nav ? nav.offsetHeight : 0;
  ici.style.height = Math.max(240, Math.round(window.innerHeight - (ici.getBoundingClientRect().top + window.scrollY) - bas)) + 'px';
}
function appliquerMise(premier){
  var w = V.vue.clientWidth, h = V.vue.clientHeight;
  if(!w || !h) return;
  var L = mise(w, h), ancien = V.L, centre = ancien ? V.centre() : (UI.cbPan || {x:HERO.x + 20, y:380});
  if(ancien && ancien.cle === L.cle && !premier) return;
  V.L = L;
  V.monde.style.width = L.mw.toFixed(1) + 'px'; V.monde.style.height = L.mh.toFixed(1) + 'px';
  var S = M.S, f = V.monde.querySelector('.cb-fond');
  if(f){ f.innerHTML = fond(L, M.momentId ? M.momentId() : 'matin', S.heros && S.heros.nom); f.dataset.cle = L.cle; }
  [].forEach.call(V.monde.querySelectorAll('[data-b]'), function(el){ el.setAttribute('style', px(L, L.B[el.dataset.b])); });
  var c = V.monde.querySelector('#cabane-carte');
  if(c){ var m = (CARTE_IN * L.k).toFixed(1) + 'px'; c.style.left = c.style.top = c.style.right = c.style.bottom = m; }
  V.ici.classList.toggle('cb-petit', L.k < .62);
  centrer(centre.x, centre.y);
  if(M.UI.carteMurale && M.UI.carteMurale.ajuster){ try{ M.UI.carteMurale.ajuster(); }catch(e){} }
}
function panA(x, y){
  var L = V.L, mx = Math.max(0, L.mw - L.w), my = Math.max(0, L.mh - L.h);
  x = mx > 0 ? Math.max(0, Math.min(mx, x)) : -(L.w - L.mw) / 2;
  y = my > 0 ? Math.max(0, Math.min(my, y)) : -(L.h - L.mh) / 2;
  V.pan = {x:x, y:y};
  V.monde.style.transform = 'translate3d(' + (-x).toFixed(1) + 'px,' + (-y).toFixed(1) + 'px,0)';
  var q = function(s){ return V.ici.querySelector('.cb-fleche.' + s); }, st = stations();
  q('g').hidden = !(mx > 0 && x > 4 && st[0] < x - 10) || !!UI.cbChoix; q('d').hidden = !(mx > 0 && st[st.length - 1] > x + 10) || !!UI.cbChoix;
  /* « Touche-moi pour m'habiller » : au-dessus du Pisteur, seulement quand on le voit */
  var aide = V.ici.querySelector('.cb-aide'), rh = rectHeros(), cxh = (rh.x0 + rh.x1) / 2;
  aide.hidden = !!UI.cbAide || !!UI.cbChoix || L.h < 330 || cxh < 0 || cxh > L.w;
  if(!aide.hidden){ var dw = (aide.offsetWidth || 300) / 2 + 8; aide.style.left = Math.max(dw, Math.min(L.w - dw, cxh)).toFixed(0) + 'px'; }
  UI.cbPan = V.centre();
  if(UI.cbChoix) placerChoix();
  carteSousLesYeux();
}
/* Le tableau des chemins secrets est bien à l'écran : ce qui est nouveau (sous terre ou en surface) surgit (carte-jeu.js : M.regarderCarteMurale) */
function carteSousLesYeux(){
  if(!V || !V.L || V.carteVue || !M.regarderCarteMurale) return;
  var L = V.L, c = L.B.cadre, x0 = (c[0] - L.vb.x0) * L.k - V.pan.x, x1 = x0 + c[2] * L.k;
  var vu = Math.min(L.w, x1) - Math.max(0, x0);
  if(vu < Math.min(L.w, c[2] * L.k) * .6) return;
  V.carteVue = true;
  var ceV = V;
  setTimeout(function(){ if(V === ceV && M.regarderCarteMurale()) badgeOnglet(); }, 450);
}
function centrer(x, y){ var L = V.L; panA((x - L.vb.x0) * L.k - L.w / 2, (y - L.vb.y0) * L.k - L.h / 2); }
function allerA(px0, py0){
  var a = {x:V.pan.x, y:V.pan.y};
  panA(px0, py0);
  var b = {x:V.pan.x, y:V.pan.y};
  if(V.monde.animate && (Math.abs(a.x - b.x) > 2 || Math.abs(a.y - b.y) > 2)) V.monde.animate([{transform:'translate3d(' + (-a.x) + 'px,' + (-a.y) + 'px,0)'}, {transform:'translate3d(' + (-b.x) + 'px,' + (-b.y) + 'px,0)'}], {duration:380, easing:'ease-in-out'});
}
function allerVers(x, y){ var L = V.L; allerA((x - L.vb.x0) * L.k - L.w / 2, (y - L.vb.y0) * L.k - L.h / 2); }
/* La carte du chevalet : remplie par carte-jeu.js (M.carteMurale) ; sans elle, le dessin du village, et le toucher ouvre l'onglet Carte */
function remplirCarte(){
  var c = V.ici.querySelector('#cabane-carte');
  if(!c || c.childElementCount || M.carteMurale) return;
  if(!window.Carte || !Carte.svg) return;
  var guide = M.carteGuidee ? M.carteGuidee() : null, caches = [];
  if(guide && Carte.LIEUX) caches = M.cle(Carte.LIEUX).filter(function(id){ return guide.indexOf(id) < 0; });
  else if(Carte.LIEUX) caches = M.cle(Carte.LIEUX).filter(function(id){ return Carte.LIEUX[id].zone === 'dessous'; });
  var svg = '';
  try{ svg = Carte.svg({id:'cbcarte', moment:M.momentId ? M.momentId() : 'matin', niveau:'surface', actifs:[], verrous:[], caches:caches, notes:{}, marqueurs:[]}); }catch(e){ console.error(e); }
  c.classList.add('cb-carte-dessin');
  c.innerHTML = '<div class="cb-carte-img">' + svg + '</div><button type="button" class="cb-carte-ouvrir" data-act="onglet" data-o="carte" aria-label="Ouvrir la carte"><span>🗺️ Ouvrir la carte</span></button>';
}

/* ---------- Gestes : glisser la cabane, toucher les choses ---------- */
function suivre(e, cb){
  var id = e.pointerId, x0 = e.clientX, y0 = e.clientY, bouge = false;
  function mv(ev){ if(ev.pointerId !== id) return; var dx = ev.clientX - x0, dy = ev.clientY - y0; if(!bouge && Math.hypot(dx, dy) > 8) bouge = true; if(cb.move) cb.move(ev, dx, dy, bouge); }
  function up(ev){ if(ev.pointerId !== id) return; fin(); if(cb.up) cb.up(ev, bouge); }
  function fin(){ window.removeEventListener('pointermove', mv); window.removeEventListener('pointerup', up); window.removeEventListener('pointercancel', up); if(V) V.suivis = V.suivis.filter(function(f){ return f !== fin; }); }
  window.addEventListener('pointermove', mv); window.addEventListener('pointerup', up); window.addEventListener('pointercancel', up);
  V.suivis.push(fin);
}
/* la partie du corps touchée : d'abord un vêtement porté (data-gs), sinon la partie du corps (data-zone) */
function zoneTouchee(cible){
  var g = cible.closest('[data-gs]');
  if(g && ZONE_DE[g.dataset.gs]) return {zone:ZONE_DE[g.dataset.gs], slot:g.dataset.gs};
  var z = cible.closest('[data-zone]');
  return z && ZONES[z.dataset.zone] ? {zone:z.dataset.zone, slot:null} : null;
}
function brancher(){
  var vue = V.vue;
  vue.addEventListener('pointerdown', function(e){
    if(e.button > 0 || !V || !V.L) return;
    if(e.target.closest('#cabane-carte') || e.target.closest('.cb-fleche') || e.target.closest('.b-lire')) return;
    var p0 = {x:V.pan.x, y:V.pan.y};
    suivre(e, {
      move:function(ev, dx, dy, bouge){ if(!bouge) return; vue.classList.add('cb-defile'); panA(p0.x - dx, p0.y - dy); },
      up:function(ev, bouge){ vue.classList.remove('cb-defile'); if(bouge){ V.avaler = true; setTimeout(function(){ if(V) V.avaler = false; }, 80); } }
    });
  });
  vue.addEventListener('click', function(e){
    if(!V) return;
    if(V.avaler){ V.avaler = false; return; }   /* le « clic » qui termine un glisser n'ouvre rien */
    if(e.target.closest('#cabane-carte')) { if(UI.cbChoix) fermerChoix(); return; }
    var b = e.target.closest('[data-cb]'), a = b && b.dataset.cb;
    if(a === 'perso'){
      var z = zoneTouchee(e.target);
      if(z){ ouvrirChoix(z.zone, z.slot); return; }
      if(UI.cbChoix){ fermerChoix(); return; }
      ouvrirChoix('tete'); return;
    }
    if(UI.cbChoix && a !== 'gauche' && a !== 'droite'){ fermerChoix(); return; }   /* toucher à côté : ça se referme */
    if(!b) return;
    if(a === 'armoire'){ ouvrirCollection(); return; }
    if(a === 'sac'){ M.son('page'); M.ouvrir({type:'pisteur-sac', classe:'b-feuille-sac'}); return; }
    if(a === 'gauche' || a === 'droite'){
      /* les flèches vont d'une chose à l'autre : l'armoire, le Pisteur, le sac, la carte */
      var L = V.L, st = stations(), x = V.pan.x, cible = null;
      if(a === 'droite') st.forEach(function(p){ if(cible === null && p > x + 10) cible = p; });
      else st.slice().reverse().forEach(function(p){ if(cible === null && p < x - 10) cible = p; });
      allerA(cible === null ? x + (a === 'gauche' ? -1 : 1) * L.w * .75 : cible, V.pan.y);
      M.son('clic');
    }
  });
}
function stations(){
  var L = V.L, mx = Math.max(0, L.mw - L.w);
  return [L.B.armoire[0] + L.B.armoire[2] / 2, HERO.x, 780, L.B.cadre[0] + L.B.cadre[2] / 2].map(function(x){ return Math.max(0, Math.min(mx, (x - L.vb.x0) * L.k - L.w / 2)); });
}

/* ==========================================================
   S'habiller sur la cabane : les vêtements de la partie du corps touchée,
   à côté du Pisteur, et les bulles de couleur sur le côté
   ========================================================== */
function ouvrirChoix(zone, slot){
  var G = etatGarde(); if(!G) return;
  var Z = ZONES[zone];
  if(UI.cbChoix && UI.cbChoix.zone !== zone) vusZone(UI.cbChoix.zone);
  var sel = slot && Z.slots.indexOf(slot) >= 0 ? slot : null;
  if(!sel) Z.slots.forEach(function(s){ if(!sel && G.p[s]) sel = s; });
  UI.cbChoix = {zone:zone, sel:sel || Z.slots[0]};
  UI.cbAide = true;
  M.son('clic');
  dessinerChoix();
}
function vusZone(zone){
  var G = etatGarde(); if(!G || !ZONES[zone]) return;
  ZONES[zone].slots.forEach(function(sl){ M.cle(G.a).forEach(function(id){ if(Gd.ITEMS[id].slot === sl) G.a[id].n = 0; }); });
}
function fermerChoix(){
  if(!UI.cbChoix) return;
  vusZone(UI.cbChoix.zone);
  UI.cbChoix = null;
  M.sauver();
  if(!V) return;
  V.choix.hidden = true; V.couleurs.hidden = true; V.choix.innerHTML = ''; V.couleurs.innerHTML = '';
  V.ici.classList.remove('cb-habille');
  echelleHeros(1);
  majArmoire(); badgeOnglet();
  panA(V.pan.x, V.pan.y);
}
/* la silhouette du Pisteur à l'écran, à sa taille normale (de l'arc au carquois, le dessin occupe à peu près 24 % → 80 % de sa boîte) */
function rectHeros(){
  var L = V.L, b = L.B.perso;
  return {x0:(b[0] + .24 * b[2] - L.vb.x0) * L.k - V.pan.x, x1:(b[0] + .8 * b[2] - L.vb.x0) * L.k - V.pan.x, y0:(b[1] + .1 * b[3]) * L.k, y1:Math.min(L.h, (b[1] + .97 * b[3]) * L.k)};
}
/* [bulles] [Pisteur] [vêtements], séparés de 6 px ; sur un écran étroit le Pisteur recule un peu (il rapetisse, les pieds restent sur le tapis) */
var COUL_W = 60, LW_MIN = 68, LW_MAX = 192, GAP = 6;
function geoChoix(){
  var L = V.L, r = rectHeros(), fw = r.x1 - r.x0, marge = COUL_W + 4 * GAP, lib = L.w - marge - fw;
  if(lib >= LW_MIN) return {lw:Math.min(LW_MAX, lib), s:1, r:r};
  var s = Math.max(.7, (L.w - marge - LW_MIN) / fw), b = L.B.perso, cx = (b[0] + b[2] / 2 - L.vb.x0) * L.k - V.pan.x;
  return {lw:LW_MIN, s:s, r:{x0:cx - (cx - r.x0) * s, x1:cx + (r.x1 - cx) * s}};
}
function echelleHeros(s){ var p = V && V.monde.querySelector('.cb-perso'); if(p) p.style.transform = s < .999 ? 'scale(' + s.toFixed(3) + ')' : ''; }
/* on fait glisser la cabane pour que le Pisteur ait ses bulles à gauche et ses vêtements à droite */
function cadrerHeros(){
  var L = V.L, g = geoChoix(), fw = g.r.x1 - g.r.x0;
  var libre = L.w - (COUL_W + fw + g.lw + 4 * GAP);
  allerA(V.pan.x + (g.r.x0 - (2 * GAP + COUL_W + Math.max(0, libre / 2))), V.pan.y);
}
function placerChoix(){
  if(!V || !UI.cbChoix) return;
  var L = V.L, g = geoChoix(), r = g.r, lw = g.lw;
  echelleHeros(g.s);
  var xc = Math.max(GAP, Math.min(r.x0 - COUL_W - GAP, L.w - lw - COUL_W - 3 * GAP));
  var xi = Math.min(L.w - lw - GAP, Math.max(r.x1 + GAP, xc + COUL_W + GAP));
  V.couleurs.style.left = xc.toFixed(0) + 'px';
  V.choix.style.left = xi.toFixed(0) + 'px';
  V.choix.style.width = lw.toFixed(0) + 'px';
  V.choix.classList.toggle('etroit', lw < 130);   /* une seule colonne : les icônes, sans les noms */
}
function dessinerChoix(remonte){
  if(!V || !UI.cbChoix) return;
  var G = etatGarde(), C = UI.cbChoix, Z = ZONES[C.zone], h = heroBase();
  var s = '<div class="cb-choix-tete"><b>' + Gd.icone(Z.slots[0]) + esc(Z.nom) + '</b><button type="button" class="cb-choix-x" data-ch="fermer" aria-label="Fermer">✕</button></div>';
  Z.slots.forEach(function(sl){
    var l = possedes(G, sl), porte = G.p[sl];
    s += '<div class="cb-choix-slot' + (C.sel === sl ? ' sel' : '') + '"><span class="cb-choix-nom">' + Gd.icone(sl) + '<small>' + esc(Gd.SLOT[sl].nom) + '</small></span><div class="cb-choix-l">';
    s += '<button type="button" class="cb-ic cb-ic-rien' + (!porte ? ' on' : '') + '" data-ch="rien" data-s="' + sl + '" aria-label="Rien"><span>✖</span></button>';
    s += l.map(function(id){
      var x = G.a[id], it = Gd.ITEMS[id];
      return '<button type="button" class="cb-ic' + (porte === id ? ' on' : '') + (porte === id && C.sel === sl ? ' sel' : '') + (it.rare ? ' rare' : '') + '" data-ch="it" data-s="' + sl + '" data-id="' + id + '" aria-label="' + esc(it.nom) + '">' + vignette(id, x.c, h) + (x.n ? '<i class="cb-neuf" aria-label="nouveau"></i>' : '') + '</button>';
    }).join('');
    s += '</div></div>';
  });
  var haut = remonte ? V.choix.scrollTop : 0;   /* on garde l'endroit où on était dans la liste */
  V.choix.innerHTML = s;
  V.choix.scrollTop = haut;
  V.choix.hidden = false;
  dessinerCouleurs();
  V.ici.classList.add('cb-habille');
  if(!remonte) cadrerHeros();
  placerChoix();
  panA(V.pan.x, V.pan.y);
}
function dessinerCouleurs(){
  var G = etatGarde(), C = UI.cbChoix, id = C && G.p[C.sel];
  if(!id || !G.a[id]){ V.couleurs.hidden = true; V.couleurs.innerHTML = ''; return; }
  var c = G.a[id].c;
  var haut = V.couleurs.scrollTop;
  V.couleurs.innerHTML = Gd.PALETTE.map(function(p){ return '<button type="button" class="cb-coul' + (p.id === c ? ' on' : '') + '" style="--p:' + p.c + '" data-ch="couleur" data-c="' + p.id + '" aria-label="' + esc(p.nom) + '"></button>'; }).join('');
  V.couleurs.scrollTop = haut;
  V.couleurs.hidden = false;
}
function majHeros(){
  var p = V.monde.querySelector('.cb-perso'); if(p) p.innerHTML = persoSVG();
  majPortraitBandeau();
}
function majArmoire(){
  var a = V && V.monde.querySelector('.cb-armoire'); if(!a) return;
  var G = etatGarde(), n = nouveaux(G), x = a.querySelector('.cb-badge');
  if(x) x.remove();
  if(n){ x = document.createElement('i'); x.className = 'cb-badge'; x.textContent = '✨ ' + n; a.appendChild(x); }
  var sv = a.querySelector('svg'); if(sv) sv.outerHTML = armoireSVG(G);
}
function brancherChoix(){
  function clic(e){
    var b = e.target.closest('[data-ch]');
    if(!b || !V || !UI.cbChoix) return;
    var a = b.dataset.ch, G = etatGarde(), sl = b.dataset.s;
    if(a === 'fermer'){ fermerChoix(); M.son('clic'); return; }
    if(a === 'it'){
      var id = b.dataset.id; if(!G.a[id]) return;
      G.p[sl] = id; G.a[id].n = 0; UI.cbChoix.sel = sl;
      M.son('magie'); M.sauver(); majHeros(); dessinerChoix(true);
      return;
    }
    if(a === 'rien'){ if(G.p[sl]){ delete G.p[sl]; M.son('clic'); M.sauver(); majHeros(); } UI.cbChoix.sel = sl; dessinerChoix(true); return; }
    if(a === 'couleur'){
      var pid = G.p[UI.cbChoix.sel]; if(!pid || !G.a[pid]) return;
      G.a[pid].c = b.dataset.c; M.son('tic'); M.sauver(); majHeros();
      var ic = V.choix.querySelector('.cb-ic[data-id="' + pid + '"]'); if(ic){ var x = G.a[pid]; ic.innerHTML = vignette(pid, x.c) + (x.n ? '<i class="cb-neuf"></i>' : ''); }
      [].forEach.call(V.couleurs.querySelectorAll('.cb-coul'), function(q){ q.classList.toggle('on', q.dataset.c === b.dataset.c); });
      return;
    }
  }
  V.choix.addEventListener('click', clic);
  V.couleurs.addEventListener('click', clic);
  var esc0 = function(e){ if(e.key === 'Escape' && V && !UI.modal){ if(UI.cbChoix) fermerChoix(); else if(V.gr && !V.gr.hidden) fermerCollection(); } };
  document.addEventListener('keydown', esc0);
  V.nettoie.push(function(){ document.removeEventListener('keydown', esc0); });
}

/* ==========================================================
   L'armoire : la collection (tout ce qui est trouvé, et ce qui reste à trouver).
   Tous les emplacements tiennent sur un écran ; en touchant l'un, ses vêtements s'affichent dessous.
   ========================================================== */
function ouvrirCollection(slot){
  if(UI.cbChoix) fermerChoix();
  UI.gr = {ouvert:true, slot:slot || (UI.gr && UI.gr.slot) || null};
  M.son('porte');
  dessinerCollection();
}
function fermerCollection(){
  if(!V) return;
  if(UI.gr && UI.gr.slot) vuSlot(UI.gr.slot);
  UI.gr = null;
  M.sauver();
  V.gr.hidden = true; V.gr.innerHTML = '';
  majArmoire(); badgeOnglet();
  M.son('porte');
}
function vuSlot(slot){
  var G = etatGarde(); if(!G || !slot) return;
  M.cle(G.a).forEach(function(id){ if(Gd.ITEMS[id].slot === slot) G.a[id].n = 0; });
}
function dessinerCollection(){
  if(!V) return;
  var G = etatGarde(); if(!G) return;
  var slot = UI.gr.slot, tot = Gd.ORDRE.length, a = M.cle(G.a).length;
  var s = '<div class="gr-tete"><h2>🧥 Garde-robe <b>' + a + ' / ' + tot + '</b></h2><button type="button" class="gr-rond gr-fermer" data-gr="fermer" aria-label="Fermer">✕</button></div>';
  s += '<div class="gr-defile"><div class="gr-cases">' + Gd.SLOTS.map(function(S){
    var l = Gd.parSlot(S.id), n = l.filter(function(id){ return G.a[id]; }).length, nn = nouveaux(G, S.id);
    var pts = l.map(function(id){ var x = G.a[id], it = Gd.ITEMS[id]; return '<i class="gr-pt' + (x ? ' on' : '') + (it.rare ? ' rare' : '') + (x && x.n ? ' neuf' : '') + '"' + (x ? ' style="--p:' + Gd.teinte(x.c).c + '"' : '') + '></i>'; }).join('');
    return '<button type="button" class="gr-case' + (S.id === slot ? ' on' : '') + '" data-gr="slot" data-s="' + S.id + '" aria-label="' + esc(S.nom) + ' : ' + n + ' sur ' + l.length + '"><span class="gr-case-t">' + Gd.icone(S.id) + '<b>' + esc(S.nom) + '</b><small>' + n + '/' + l.length + '</small>' + (nn ? '<em class="gr-case-neuf"></em>' : '') + '</span><span class="gr-pts">' + pts + '</span></button>';
  }).join('') + '</div>';
  if(slot){
    var h = heroBase();
    s += '<div class="gr-liste">' + Gd.parSlot(slot).map(function(id){
      var it = Gd.ITEMS[id], x = G.a[id];
      if(!x) return '<span class="gr-v gr-v-ferme' + (it.rare ? ' rare' : '') + '" aria-label="Pas encore trouvé">' + (it.rare ? '✨' : '❔') + '</span>';
      return '<span class="gr-v' + (it.rare ? ' rare' : '') + (G.p[slot] === id ? ' porte' : '') + '" aria-label="' + esc(it.nom) + '">' + vignette(id, x.c, h) + (x.n ? '<i class="cb-neuf"></i>' : '') + '</span>';
    }).join('') + '</div>';
  }
  s += '</div>';
  V.gr.innerHTML = s;
  V.gr.hidden = false;
  if(!V.grBranche){
    V.grBranche = true;
    V.gr.addEventListener('click', function(e){
      var b = e.target.closest('[data-gr]'); if(!b || !V) return;
      if(b.dataset.gr === 'fermer'){ fermerCollection(); return; }
      if(b.dataset.gr === 'slot'){
        var avant = UI.gr.slot;
        if(avant) vuSlot(avant);
        UI.gr.slot = avant === b.dataset.s ? null : b.dataset.s;
        M.son('page'); M.sauver(); dessinerCollection();
        var li = V.gr.querySelector('.gr-liste'); if(li && li.scrollIntoView) try{ li.scrollIntoView({block:'nearest'}); }catch(e2){}
      }
    });
  }
}

/* pour les tests */
M._cabane = {etat:etatGarde, vignette:vignette, enAttente:function(){ return file.length + (carteEnCours ? 1 : 0); }, traiter:traiter,
  choisir:function(zone, slot){ ouvrirChoix(zone, slot); }, fermerChoix:fermerChoix, collection:ouvrirCollection, fermer:fermerCollection,
  vue:function(){ return V ? {L:{k:V.L.k, w:V.L.w, h:V.L.h, mw:V.L.mw, fw:V.L.fw, fh:V.L.fh}, pan:V.pan, centre:V.centre(), heros:rectHeros()} : null; },
  aller:function(x, y){ if(V) centrer(x, y); }};
})();
