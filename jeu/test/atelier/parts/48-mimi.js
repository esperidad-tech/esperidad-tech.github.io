
/* ==========================================================
   Mimi, le chat de l'Alchimiste (étape 4 ; DESIGN-saison1.md, 12.3)
   - Sa barre de bonheur : on le touche, elle apparaît au-dessus de lui (la moyenne de ses besoins) ; elle monte quand on le nourrit,
     le caresse, joue avec lui. À côté, 🎀 ouvre sa garde-robe.
   - La chatière, dans la porte de l'atelier : elle bascule quand il passe.
   - Utile à l'enquête : bien heureux (barre ≥ 80), au plus une fois par moment, il sort par la chatière et revient avec un ingrédient
     dans la gueule (parfois un rare), posé avec la cueillette devant la porte. Pendant une potion, il dresse les oreilles quand on
     verse le bon ingrédient (voir 50-chaudron.js).
   - Ses jeux : une petite souris traverse de temps en temps (il se tapit, remue les fesses, bondit : il l'attrape ou il la rate en
     galipette) ; il suit le doigt qui glisse sur le plancher ; une dizaine de mouvements quand on joue, jamais deux fois le même de suite.
   - Sa garde-robe : colliers, nœuds, clochette, petits chapeaux, en couleurs (et quelques rares qui brillent). On gagne un accessoire
     quand l'Alchimiste réussit un de SES mini-jeux, la première fois pour chaque mini-jeu (Atelier.mjGagne, appelé par le moteur ;
     le chaudron de l'atelier, ici même).
   L'état : etat.garde = {a:[accessoires gagnés], neuf:[pas encore vus], mj:{type:1}, annonce:[déjà annoncés]} ; sur le chat, o.acc = {cou, tete} ;
   etat.tama.sortie (le moment de la dernière sortie), tama.souris (secondes de jeu), tama.butin (l'ingrédient qu'il rapporte, s'il est dehors).
   ========================================================== */
var BONHEUR_SORTIE = 85;            /* barre bien pleine (il arrive à 80 : il faut d'abord bien s'occuper de lui) : il peut aller chercher un ingrédient */
var SOURIS_MIN = 150;               /* une souris au plus toutes les 2 min 30 de jeu */
var BUTIN = ['champignon', 'trefle', 'menthe', 'baies', 'pensee', 'lavande'];   /* ce qu'un chat peut rapporter dans la gueule (pas de liquide !) */
var BUTIN_RARE = ['ortie', 'racine', 'lune'];
var ACC = {
  collier_rouge:{slot:'cou', f:'collier', c:'#e0443a', nom:'Collier rouge'},
  collier_bleu:{slot:'cou', f:'collier', c:'#3d8ef0', nom:'Collier bleu'},
  collier_vert:{slot:'cou', f:'collier', c:'#4cbb5c', nom:'Collier vert'},
  clochette:{slot:'cou', f:'clochette', c:'#e86f9c', nom:'Collier à clochette'},
  noeud_pap_violet:{slot:'cou', f:'papillon', c:'#9d6ee3', nom:'Nœud papillon violet'},
  noeud_pap_jaune:{slot:'cou', f:'papillon', c:'#f2b63c', nom:'Nœud papillon jaune'},
  foulard:{slot:'cou', f:'foulard', c:'#3fcf9a', nom:'Petit foulard'},
  noeud_rose:{slot:'tete', f:'noeud', c:'#ff7fb3', nom:'Nœud rose'},
  noeud_bleu:{slot:'tete', f:'noeud', c:'#5fb8ff', nom:'Nœud bleu ciel'},
  sorciere:{slot:'tete', f:'sorciere', c:'#7b4ac9', nom:'Chapeau de sorcière'},
  beret:{slot:'tete', f:'beret', c:'#d33a3a', nom:'Béret rouge'},
  fete:{slot:'tete', f:'fete', c:'#f2b63c', nom:'Chapeau de fête'},
  fleurs:{slot:'tete', f:'fleurs', c:'#ff8fb3', nom:'Couronne de fleurs'},
  perles:{slot:'cou', f:'perles', c:'#fff6e0', nom:'Collier de perles', rare:true},
  arc:{slot:'cou', f:'collier', c:'arc', nom:'Collier arc-en-ciel', rare:true},
  couronne:{slot:'tete', f:'couronne', c:'#f5c542', nom:'Couronne d\'or', rare:true},
  mage:{slot:'tete', f:'sorciere', c:'#2c3572', nom:'Chapeau de magicien étoilé', rare:true, etoiles:true}
};
var ACC_RARE = 0.15;

/* ---------- Le bonheur : la moyenne de ses cinq besoins ---------- */
function bonheur(o){ var b = besoins(o), s = 0; BESOINS.forEach(function(x){ s += b[x.k]; }); return Math.round(s / BESOINS.length); }
function bonheurHTML(o){
  var n = bonheur(o);
  return '<div class="at-bonheur" hidden><span class="at-bonheur-c" aria-hidden="true">' + (n >= BONHEUR_SORTIE ? '💖' : n >= 45 ? '💗' : '🩶') + '</span>' +
    '<i class="at-bonheur-barre"><b style="width:' + n + '%"></b></i>' +
    '<button type="button" class="at-bonheur-hab" aria-label="Habiller le chat">🎀</button></div>';
}
function montrerBonheur(V, o, ms){
  var d = V.elO[o.id];
  if(!d) return;
  var el = d.querySelector('.at-bonheur'), n = bonheur(o);
  if(!el) return;
  var b = el.querySelector('.at-bonheur-barre b'), c = el.querySelector('.at-bonheur-c');
  if(b) b.style.width = n + '%';
  if(c) c.textContent = n >= BONHEUR_SORTIE ? '💖' : n >= 45 ? '💗' : '🩶';
  el.classList.toggle('plein', n >= BONHEUR_SORTIE);
  el.hidden = false;
  d.classList.add('at-c-bonheur');
  d.style.zIndex = 99000;          /* (au-dessus des meubles qui sont devant lui : on voit la barre, on touche 🎀) */
  clearTimeout(d._bonT);
  d._bonT = apres(V, ms || 6500, function(){
    el.hidden = true; d.classList.remove('at-c-bonheur');
    var st = V.chats[o.id];
    if(V.elO[o.id] === d && !(st && (st.anim || st.tenu))) d.style.zIndex = Math.round(chatPos(V, o).z * 5);
  });      /* (le temps de toucher 🎀) */
}

/* ---------- La garde-robe ---------- */
function garde(e){ if(!e.garde || typeof e.garde !== 'object') normaliserChat(e); return e.garde; }
/* Un mini-jeu de l'Alchimiste réussi : la première fois pour ce mini-jeu, un accessoire (parfois un rare) ; sinon rien */
function gagnerAcc(e, type){
  var G = garde(e);
  if(!type || G.mj[type]) return null;
  G.mj[type] = 1;
  var libres = cles(ACC).filter(function(id){ return G.a.indexOf(id) < 0; });
  if(!libres.length) return null;
  var rares = libres.filter(function(id){ return ACC[id].rare; }), communs = libres.filter(function(id){ return !ACC[id].rare; });
  var l = (rares.length && (Math.random() < ACC_RARE || !communs.length)) ? rares : communs;
  var id = l[Math.floor(Math.random() * l.length)];
  G.a.push(id); G.neuf.push(id);
  return id;
}
function mjGagne(S, type){
  try{
    if(!S || typeof S !== 'object') return null;
    if(!S.atelier || typeof S.atelier !== 'object') S.atelier = etatNeuf();      /* (pas encore d'atelier : comme le moteur le crée) */
    var e = S.atelier;
    normaliser(e);
    var id = gagnerAcc(e, type);
    return id ? {id:id, nom:ACC[id].nom, rare:!!ACC[id].rare} : null;
  }catch(er){ return null; }
}
function nomAcc(id){ var a = ACC[id]; return a ? a.nom.charAt(0).toLowerCase() + a.nom.slice(1) : ''; }
function articleAcc(id){ var a = ACC[id]; if(!a) return ''; return (/^(Couronne|Petit foulard)/.test(a.nom) ? (a.nom.indexOf('Couronne') === 0 ? 'une ' : 'un ') : /^(Collier|Nœud|Chapeau|Béret)/.test(a.nom) ? 'un ' : 'un ') + nomAcc(id); }
/* Les nouveautés gagnées pendant les mini-jeux : annoncées une fois, à l'ouverture de l'atelier */
function annoncerAcc(V){
  var G = garde(V.etat), l = G.neuf.filter(function(id){ return G.annonce.indexOf(id) < 0; });
  if(!l.length) return;
  l.forEach(function(id){ G.annonce.push(id); });
  var chat = chatsTous(V)[0], nom = chat ? nomChat(chat) : PORTEE.mere, rare = l.some(function(id){ return ACC[id].rare; });
  var t = (rare ? 'Un cadeau rare pour ' : 'Un cadeau pour ') + nom + ' : ' + l.map(articleAcc).join(' et ') + ' ! Touche ' + nom + ', puis 🎀 pour l\'habiller.';
  apres(V, 900, function(){ toast(V, '<b>🎁 ' + (rare ? '✨' : '🎀') + '</b> ' + esc(t), 6500, t); son(V, rare ? 'magie' : 'gain'); });
  changer(V);
}
/* Le dessin d'un accessoire sur la tête du chat (cx, cy : le milieu de sa tête) */
function couleurAcc(a){ return a.c === 'arc' ? 'url(#atg-arc)' : a.c; }
function dessinAcc(id, cx, cy){
  var a = ACC[id];
  if(!a) return '';
  var c = couleurAcc(a), s = '', f1c = function(v){ return f1(v); };
  if(a.slot === 'cou'){
    var d = 'M' + f1c(cx - 15) + ',' + f1c(cy + 10) + ' Q' + f1c(cx) + ',' + f1c(cy + 21) + ' ' + f1c(cx + 15) + ',' + f1c(cy + 10);
    if(a.f === 'perles'){
      for(var i = 0; i <= 6; i++){ var t = i / 6, px = (1 - t) * (1 - t) * (cx - 15) + 2 * (1 - t) * t * cx + t * t * (cx + 15), py = (1 - t) * (1 - t) * (cy + 10) + 2 * (1 - t) * t * (cy + 21) + t * t * (cy + 10); s += '<circle cx="' + f1c(px) + '" cy="' + f1c(py) + '" r="3.2" fill="' + c + '" stroke="' + K + '" stroke-width="1.4"/><circle cx="' + f1c(px - 1) + '" cy="' + f1c(py - 1) + '" r="1" fill="#fff"/>'; }
      return '<g class="at-acc at-acc-cou at-acc-brille">' + s + '</g>';
    }
    if(a.f === 'collier' || a.f === 'clochette') s += T(d, K, 7.5) + T(d, c, 4.2);
    if(a.f === 'clochette') s += '<circle cx="' + f1c(cx) + '" cy="' + f1c(cy + 21) + '" r="4.6" fill="#f5c542" stroke="' + K + '" stroke-width="1.6"/>' + T('M' + f1c(cx - 2.4) + ',' + f1c(cy + 22.5) + ' h4.8', K, 1.2);
    else if(a.f === 'collier') s += '<circle cx="' + f1c(cx) + '" cy="' + f1c(cy + 19.5) + '" r="2.8" fill="#f5c542" stroke="' + K + '" stroke-width="1.3"/>';
    if(a.f === 'papillon') s += '<path d="M' + f1c(cx) + ',' + f1c(cy + 17) + ' l-9,-5 v11 Z M' + f1c(cx) + ',' + f1c(cy + 17) + ' l9,-5 v11 Z" fill="' + c + '" stroke="' + K + '" stroke-width="1.6" stroke-linejoin="round"/><circle cx="' + f1c(cx) + '" cy="' + f1c(cy + 17.5) + '" r="2.4" fill="' + sombre(c, 0.25) + '" stroke="' + K + '" stroke-width="1.2"/>';
    if(a.f === 'foulard') s += '<path d="M' + f1c(cx - 13) + ',' + f1c(cy + 11) + ' Q' + f1c(cx) + ',' + f1c(cy + 19) + ' ' + f1c(cx + 13) + ',' + f1c(cy + 11) + ' L' + f1c(cx + 2) + ',' + f1c(cy + 30) + ' Z" fill="' + c + '" stroke="' + K + '" stroke-width="1.6" stroke-linejoin="round"/><circle cx="' + f1c(cx - 3) + '" cy="' + f1c(cy + 19) + '" r="1.4" fill="#fff"/><circle cx="' + f1c(cx + 3) + '" cy="' + f1c(cy + 23) + '" r="1.4" fill="#fff"/>';
    return '<g class="at-acc at-acc-cou' + (a.rare ? ' at-acc-brille' : '') + '">' + s + '</g>';
  }
  /* sur la tête (entre les oreilles) */
  var y0 = cy - 12;
  if(a.f === 'noeud') s += '<path d="M' + f1c(cx + 10) + ',' + f1c(cy - 15) + ' l-8,-7 v13 Z M' + f1c(cx + 10) + ',' + f1c(cy - 15) + ' l8,-7 v13 Z" fill="' + c + '" stroke="' + K + '" stroke-width="1.6" stroke-linejoin="round"/><circle cx="' + f1c(cx + 10) + '" cy="' + f1c(cy - 15) + '" r="2.6" fill="' + sombre(c, 0.2) + '" stroke="' + K + '" stroke-width="1.2"/>';
  if(a.f === 'sorciere'){
    s += '<ellipse cx="' + f1c(cx) + '" cy="' + f1c(y0) + '" rx="16" ry="3.6" fill="' + c + '" stroke="' + K + '" stroke-width="1.8"/>' +
      '<path d="M' + f1c(cx - 9) + ',' + f1c(y0) + ' L' + f1c(cx + 6) + ',' + f1c(y0 - 28) + ' L' + f1c(cx + 9) + ',' + f1c(y0) + ' Z" fill="' + c + '" stroke="' + K + '" stroke-width="1.8" stroke-linejoin="round"/>';
    s += a.etoiles ? '<path d="M' + f1c(cx + 1) + ',' + f1c(y0 - 15) + ' l1.6,3.2 3.4,.4 -2.5,2.3 .7,3.4 -3.2,-1.7 -3,1.7 .6,-3.4 -2.5,-2.3 3.4,-.4 Z" fill="#ffe36b"/><circle cx="' + f1c(cx - 3) + '" cy="' + f1c(y0 - 4) + '" r="1.3" fill="#fff"/>' :
      T('M' + f1c(cx - 7.5) + ',' + f1c(y0 - 3) + ' L' + f1c(cx + 8.5) + ',' + f1c(y0 - 3), '#f5c542', 2.4);
  }
  if(a.f === 'beret') s += '<ellipse cx="' + f1c(cx + 2) + '" cy="' + f1c(y0 - 2) + '" rx="14" ry="5.5" fill="' + c + '" stroke="' + K + '" stroke-width="1.8"/>' + T('M' + f1c(cx + 2) + ',' + f1c(y0 - 7) + ' v-4', K, 2.4);
  if(a.f === 'fete'){
    s += '<path d="M' + f1c(cx - 8) + ',' + f1c(y0) + ' L' + f1c(cx) + ',' + f1c(y0 - 22) + ' L' + f1c(cx + 8) + ',' + f1c(y0) + ' Z" fill="' + c + '" stroke="' + K + '" stroke-width="1.8" stroke-linejoin="round"/>' +
      T('M' + f1c(cx - 5) + ',' + f1c(y0 - 7) + ' L' + f1c(cx + 5) + ',' + f1c(y0 - 4) + ' M' + f1c(cx - 3) + ',' + f1c(y0 - 14) + ' L' + f1c(cx + 3) + ',' + f1c(y0 - 12), '#e0443a', 2) +
      '<circle cx="' + f1c(cx) + '" cy="' + f1c(y0 - 23) + '" r="3.2" fill="#ff8fb3" stroke="' + K + '" stroke-width="1.4"/>';
  }
  if(a.f === 'fleurs') ['#ff8fb3', '#ffd84a', '#8fd0ff', '#ff8fb3', '#b796ff'].forEach(function(col, i){ var ang = Math.PI * (1.15 + i * 0.175), fx = cx + Math.cos(ang) * 17, fy = cy - 2 + Math.sin(ang) * 15; s += '<circle cx="' + f1c(fx) + '" cy="' + f1c(fy) + '" r="3.6" fill="' + col + '" stroke="' + K + '" stroke-width="1.3"/><circle cx="' + f1c(fx) + '" cy="' + f1c(fy) + '" r="1.2" fill="#fff4a8"/>'; });
  if(a.f === 'couronne') s += '<path d="M' + f1c(cx - 11) + ',' + f1c(y0 + 1) + ' l0,-12 5,6 6,-10 6,10 5,-6 0,12 Z" fill="' + c + '" stroke="' + K + '" stroke-width="1.8" stroke-linejoin="round"/><circle cx="' + f1c(cx) + '" cy="' + f1c(y0 - 4) + '" r="2.2" fill="#e0443a"/><circle cx="' + f1c(cx - 6) + '" cy="' + f1c(y0 - 3) + '" r="1.5" fill="#3d8ef0"/><circle cx="' + f1c(cx + 6) + '" cy="' + f1c(y0 - 3) + '" r="1.5" fill="#4cbb5c"/>';
  return '<g class="at-acc at-acc-tete' + (a.rare ? ' at-acc-brille' : '') + '">' + s + '</g>';
}
function accDe(o, slot){ var a = o && o.acc && o.acc[slot]; return a && ACC[a] ? a : null; }
/* La petite image d'un accessoire (dans la garde-robe) : sur une tête de chat */
function vignetteAcc(id, v){
  var p = CHATS[(v || 0) % 3], a = ACC[id];
  return '<svg viewBox="19 -28 76 78" aria-hidden="true">' + teteChat(p, 57, 18, {cou:a && a.slot === 'cou' ? id : null, tete:a && a.slot === 'tete' ? id : null}) + '</svg>';
}
function ouvrirGarde(V, oid){
  var o = V.parId[oid] || chatsDe(V)[0];
  if(!o) return;
  V.gardeChat = o.id;
  ouvrirCalque(V, 'at-cal-garde', htmlGarde(V));
  var G = garde(V.etat); if(G.neuf.length){ G.neuf = []; changer(V); }
  son(V, 'page');
}
function dessinerGarde(V){ if(!V.parId[V.gardeChat]){ fermerGrimoire(V); return; } V.grim.innerHTML = htmlGarde(V); }
function htmlGarde(V){
  var o = V.parId[V.gardeChat];
  if(!o) return '';
  var G = garde(V.etat), nom = nomChat(o), p = CHATS[(o.v || 0) % 3], neuf = G.neuf.slice();
  var t = G.a.length ? 'Touche un accessoire pour habiller ' + nom + '. Tu en gagnes un nouveau quand tu réussis un de tes mini-jeux, la première fois pour chacun.' :
    'La garde-robe est encore vide. Tu gagnes un accessoire pour ' + nom + ' quand tu réussis un de tes mini-jeux, la première fois pour chacun : le chaudron, les bulles, le bon mélange…';
  var corps = '<div class="at-garde-haut"><span class="at-garde-chat">' + '<svg viewBox="19 -28 76 78" aria-hidden="true">' + teteChat(p, 57, 18, o.acc || {}) + '</svg></span>' +
    '<p class="at-feuille-txt">' + esc(t) + ' ' + lireBtn(t) + '</p></div>';
  [['cou', 'Autour du cou'], ['tete', 'Sur la tête']].forEach(function(sl){
    var porte = accDe(o, sl[0]), mes = G.a.filter(function(id){ return ACC[id].slot === sl[0]; }), tous = cles(ACC).filter(function(id){ return ACC[id].slot === sl[0]; });
    corps += '<div class="at-garde-slot"><b>' + esc(sl[1]) + '</b><div class="at-garde-l">' +
      '<button type="button" class="at-garde-it' + (!porte ? ' on' : '') + '" data-acc="" data-slot="' + sl[0] + '" aria-label="Rien"><span class="at-garde-rien">✖</span><small>Rien</small></button>' +
      mes.map(function(id){ var a = ACC[id]; return '<button type="button" class="at-garde-it' + (porte === id ? ' on' : '') + (a.rare ? ' rare' : '') + '" data-acc="' + id + '" data-slot="' + sl[0] + '" aria-label="' + esc(a.nom) + '">' + vignetteAcc(id, o.v) + (neuf.indexOf(id) >= 0 ? '<i class="at-garde-neuf" aria-label="nouveau">✨</i>' : '') + '<small>' + esc(a.nom) + '</small></button>'; }).join('') +
      (tous.length > mes.length ? '<span class="at-garde-it at-garde-verrou" aria-label="À gagner"><span class="at-garde-rien">🔒</span><small>' + (tous.length - mes.length) + ' à gagner</small></span>' : '') +
      '</div></div>';
  });
  return feuille('at-f-garde', '<span class="at-f-ic">🎀</span><h3>La garde-robe de ' + esc(nom) + '</h3>', corps);
}
function habiller(V, id, slot){
  var o = V.parId[V.gardeChat];
  if(!o || (id && (!ACC[id] || garde(V.etat).a.indexOf(id) < 0))) return;
  if(!o.acc || typeof o.acc !== 'object') o.acc = {};
  if(id) o.acc[ACC[id].slot] = id; else delete o.acc[slot];
  redessiner(V, o); majHumeur(V, o);
  coeursChat(V, o);
  son(V, id ? 'magie' : 'clic');
  changer(V);
  dessinerGarde(V);
}

/* ---------- La chatière : elle bascule quand il passe ---------- */
function chatiere(V){
  V.root.classList.remove('at-chatiere-bat'); void V.root.offsetWidth; V.root.classList.add('at-chatiere-bat');
  son(V, 'tic');
  clearTimeout(V.chatiereT);
  V.chatiereT = apres(V, 900, function(){ V.root.classList.remove('at-chatiere-bat'); });
}

/* ---------- Il sort par la chatière, il revient avec un ingrédient ---------- */
function momentCle(V){ return tama(V).moment || (enqueteNo(V) + ':' + (V.o.moment || 'matin')); }
function peutSortir(V, o){
  var st = V.chats[o.id], t = tama(V);
  return !V.salle && salleDe(o) === 0 && t.sortie !== momentCle(V) && !t.butin && bonheur(o) >= BONHEUR_SORTIE &&
    st && !st.tenu && !st.anim && st.pose !== 'dort' && !st.depart && V.mode === 'ranger' && !V.ouvert && V.grim.hidden;
}
function sortieChat(V, o, force){
  var t = tama(V), st = chatEtat(V, o), d = V.elO[o.id];
  if(!d || (!force && !peutSortir(V, o))) return false;
  var rare = Math.random() < 0.12, l = rare ? BUTIN_RARE : BUTIN, ingr = l[Math.floor(Math.random() * l.length)];
  if(!INGR[ingr]) ingr = 'trefle';
  t.sortie = momentCle(V);
  t.butin = {ingr:ingr, nom:nomChat(o), rare:rare ? 1 : 0};
  changer(V);
  var id = (V.sortieN = (V.sortieN || 0) + 1);
  st.sortieId = id;
  chatAller(V, o, chatSol(V, PORTE.x + 8, SOL_MIN + 14), function(){
    if(st.sortieId !== id || V.arrete) return;
    var d2 = V.elO[o.id];
    st.tenu = true; chatPose(V, o, 'marche');
    chatiere(V);
    if(d2) anim(d2, [{opacity:1, transform:'scale(' + d2._s + ')'}, {opacity:0, transform:'translateY(-' + Math.round(10 * V.k) + 'px) scale(' + (d2._s * 0.8) + ')'}], {duration:520, easing:'ease-in', fill:'forwards'});
    apres(V, 520, function(){ var d3 = V.elO[o.id]; if(d3) d3.classList.add('at-c-dehors'); });
    var tx = nomChat(o) + ' sort par la chatière… Il va chercher quelque chose !';
    if(V.toastEl.hidden) toast(V, '<b>🐈 🚪</b> ' + esc(tx), 3200, tx);      /* (sans cacher un message plus important) */
    /* dehors un moment, puis il revient (avec l'ingrédient dans la gueule) */
    apres(V, 6500 + Math.random() * 2500, function(){ retourChat(V, o, id); });
  });
  /* (quoi qu'il arrive en chemin, l'ingrédient arrive : on ne perd jamais rien) */
  apres(V, 22000, function(){ livrerButin(V, o); });
  return true;
}
function retourChat(V, o, id){
  var st = chatEtat(V, o), d = V.elO[o.id], t = tama(V);
  if(!V.parId[o.id]){ livrerButin(V, null); return; }
  chatiere(V);
  st.tenu = false;
  if(d){
    d.classList.remove('at-c-dehors');
    var b = t.butin && INGR[t.butin.ingr], sp = document.createElement('span');
    if(b){ sp.className = 'at-c-butin'; sp.textContent = b.ic || '🌿'; d.appendChild(sp); }
    anim(d, [{opacity:0, transform:'translateY(-' + Math.round(10 * V.k) + 'px) scale(' + (d._s * 0.8) + ')'}, {opacity:1, transform:'scale(' + d._s + ')'}], {duration:480, easing:'ease-out'});
  }
  chatPose(V, o, 'assis');
  apres(V, 500, function(){
    if(st.sortieId !== id) { livrerButin(V, o); return; }
    var pt = posTas(0, 1);
    chatAller(V, o, chatSol(V, pt.x + 90, Math.min(solMax(V), pt.y + 24)), function(){ livrerButin(V, o); chatPose(V, o, 'lave'); chatPlanifier(V, o, 3500); });
  });
}
/* Il pose l'ingrédient avec la cueillette, devant la porte */
function livrerButin(V, o){
  var t = tama(V), b = t.butin;
  if(!b) return false;
  t.butin = null;
  var I = INGR[b.ingr] || {nom:b.ingr, ic:'🌿'};
  ajouter(V.etat, b.ingr, 1);
  if(o){ var d = V.elO[o.id], sp = d && d.querySelector('.at-c-butin'); if(sp) sp.remove(); if(d) d.classList.remove('at-c-dehors'); var st = V.chats[o.id]; if(st && st.tenu && !st.depart) st.tenu = false; }
  if(!V.salle){ dessinerTas(V); placerTas(V); }
  majReperes(V); majSalleBouton(V);
  var tx = (b.nom || PORTEE.mere) + ' t\'a rapporté : ' + I.nom + (b.rare ? ' (un ingrédient rare !)' : '') + '. Il est posé devant la porte, avec la cueillette.';
  /* (si un autre message est à l'écran, celui-ci attend un peu qu'il parte) */
  (function montrer(n){ if(V.arrete) return; if(!V.toastEl.hidden && n < 6){ apres(V, 1500, function(){ montrer(n + 1); }); return; } toast(V, '<b>🐈 ' + (I.ic || '🌿') + (b.rare ? ' ✨' : '') + '</b> ' + esc(tx), 6000, tx); })(0);
  son(V, b.rare ? 'magie' : 'gain');
  if(o) coeursChat(V, o);
  changer(V);
  return true;
}

/* ---------- Ses jeux : une dizaine de mouvements, jamais deux fois le même de suite ---------- */
var JEUX = ['bondir', 'roule', 'galipette', 'tape', 'cache', 'rond', 'etire', 'saut', 'queue', 'fesses'];
function svgChat(V, o){ var d = V.elO[o.id]; return d && d.querySelector('svg'); }
function animSvg(V, o, kf, opt){
  var sv = svgChat(V, o), st = chatEtat(V, o);
  if(!sv) return null;
  var fx = st.gauche ? 'scaleX(-1) ' : '';
  return anim(sv, kf.map(function(k){ var c = {}; cles(k).forEach(function(x){ c[x] = x === 'transform' ? fx + k[x] : k[x]; }); return c; }), opt);
}
function chatJoue(V, o, quoi){
  var st = chatEtat(V, o), d = V.elO[o.id];
  if(!d || st.tenu || st.depart) return null;
  if(st.anim) chatArreter(V, o);
  var l = JEUX.filter(function(j){ return j !== st.dernierJeu; });
  quoi = quoi && quoi !== st.dernierJeu ? quoi : l[Math.floor(Math.random() * l.length)];
  st.dernierJeu = quoi;
  var p = chatPos(V, o), k = V.k, fin = function(ms){ chatPlanifier(V, o, ms || 2600); };
  donner(o, 'jeu', 8);
  if(quoi === 'bondir'){
    var dir = st.gauche ? -1 : 1, c = chatSol(V, p.x + dir * 120, p.y + (Math.random() - 0.5) * 30);
    chatBouger(V, o, c, 'saute', function(){ chatPose(V, o, 'assis'); fin(); });
  } else if(quoi === 'roule'){            /* il roule sur le dos, les pattes en l'air */
    chatPose(V, o, 'dort');
    animSvg(V, o, [{transform:'rotate(0deg)'}, {transform:'translateY(-6%) rotate(-180deg)', offset:0.35}, {transform:'translateY(-6%) rotate(-180deg)', offset:0.7}, {transform:'rotate(-360deg)'}], {duration:1500, easing:'ease-in-out'});
    apres(V, 1500, function(){ chatPose(V, o, 'assis'); }); fin(2800);
  } else if(quoi === 'galipette'){        /* une galipette : il saute et fait un tour complet */
    chatPose(V, o, 'saute');
    animSvg(V, o, [{transform:'translateY(0) rotate(0deg)'}, {transform:'translateY(-45%) rotate(-180deg)', offset:0.5}, {transform:'translateY(0) rotate(-360deg)'}], {duration:820, easing:'ease-in-out'});
    apres(V, 820, function(){ chatPose(V, o, 'assis'); }); fin(2200);
  } else if(quoi === 'tape'){             /* il tape de la patte */
    chatPose(V, o, 'tape'); apres(V, 1400, function(){ chatPose(V, o, 'assis'); }); fin(2400);
  } else if(quoi === 'cache'){            /* il se cache… et surgit ! */
    chatPose(V, o, 'assis');
    animSvg(V, o, [{transform:'translateY(0) scale(1)', opacity:1}, {transform:'translateY(40%) scale(.4)', opacity:0, offset:0.3}, {transform:'translateY(40%) scale(.4)', opacity:0, offset:0.65}, {transform:'translateY(-18%) scale(1.15)', opacity:1, offset:0.82}, {transform:'translateY(0) scale(1)', opacity:1}], {duration:1900, easing:'ease-in-out'});
    fin(2800);
  } else if(quoi === 'rond'){             /* il court en rond */
    var r = 70, pts = [[r, 0], [0, r * 0.45], [-r, 0], [0, -r * 0.45], [0, 0]], i = 0;
    (function tour(){
      if(i >= pts.length || chatEtat(V, o).tenu){ chatPose(V, o, 'assis'); fin(1800); return; }
      var q = pts[i++];
      chatBouger(V, o, chatSol(V, p.x + q[0], p.y + q[1]), 'marche', tour);
    })();
  } else if(quoi === 'etire'){            /* il s'étire, tout long */
    chatPose(V, o, 'marche'); d.classList.add('at-c-fige');
    animSvg(V, o, [{transform:'scale(1,1)'}, {transform:'scale(1.22,.8)', offset:0.4}, {transform:'scale(1.22,.8)', offset:0.7}, {transform:'scale(1,1)'}], {duration:1600, easing:'ease-in-out'});
    apres(V, 1600, function(){ d.classList.remove('at-c-fige'); chatPose(V, o, 'assis'); }); fin(2600);
  } else if(quoi === 'saut'){             /* il saute en l'air, sur place */
    chatPose(V, o, 'saute');
    animSvg(V, o, [{transform:'translateY(0)'}, {transform:'translateY(-60%)', offset:0.45}, {transform:'translateY(0)'}], {duration:700, easing:'cubic-bezier(.3,0,.4,1)'});
    apres(V, 700, function(){ chatPose(V, o, 'assis'); }); fin(2000);
  } else if(quoi === 'queue'){            /* il court après sa queue */
    chatPose(V, o, 'marche'); d.classList.add('at-c-tourne');
    apres(V, 1700, function(){ d.classList.remove('at-c-tourne'); chatPose(V, o, 'assis'); }); fin(2600);
  } else {                                /* il remue les fesses… et bondit sur place */
    chatPose(V, o, 'marche'); d.classList.add('at-c-tapi', 'at-c-fesses');
    apres(V, 1100, function(){ d.classList.remove('at-c-tapi', 'at-c-fesses'); chatPose(V, o, 'saute'); animSvg(V, o, [{transform:'translateY(0)'}, {transform:'translate(14%,-30%)', offset:0.5}, {transform:'translateY(0)'}], {duration:560}); });
    apres(V, 1700, function(){ chatPose(V, o, 'assis'); }); fin(2600);
  }
  majHumeur(V, o);
  return quoi;
}

/* ---------- La petite souris : elle traverse, il se tapit, remue les fesses, bondit ---------- */
function dessinSouris(){
  return '<svg viewBox="0 0 60 34" aria-hidden="true"><path d="M4,26 C-2,24 0,16 8,18" fill="none" stroke="#c08a8a" stroke-width="2.6" stroke-linecap="round"/>' +
    '<ellipse cx="26" cy="22" rx="18" ry="11" fill="#b9b3c8" stroke="#24182e" stroke-width="2.6"/>' +
    '<circle cx="38" cy="12" r="7" fill="#d9d3e6" stroke="#24182e" stroke-width="2.4"/><circle cx="38" cy="12" r="3.4" fill="#ffb3c6"/>' +
    '<path d="M38,17 C46,15 52,19 54,23 C50,26 44,26 40,25 Z" fill="#b9b3c8" stroke="#24182e" stroke-width="2.4" stroke-linejoin="round"/>' +
    '<circle cx="46" cy="20" r="1.8" fill="#24182e"/><circle cx="54.5" cy="23" r="1.6" fill="#ff8fa8"/>' +
    '<path d="M16,31 v2 M32,31 v2" stroke="#24182e" stroke-width="2.4" stroke-linecap="round"/></svg>';
}
function sourisPasse(V, force){
  var t = tama(V);
  if(V.souris || V.mode !== 'ranger' || (!force && (t.jeu - (t.souris || 0) < SOURIS_MIN || !V.grim.hidden || V.ouvert))) return false;
  var chats = chatsDe(V).filter(function(o){ var st = V.chats[o.id]; return st && !st.tenu && st.pose !== 'dort' && !st.depart; });
  if(!chats.length) return false;
  var o = chats[Math.floor(Math.random() * chats.length)], st = chatEtat(V, o), pc = chatPos(V, o);
  t.souris = t.jeu;
  /* elle traverse le plancher, à la hauteur du chat, d'un bord à l'autre (là où on le voit) */
  var y = borne(pc.y + (Math.random() < 0.5 ? -40 : 40), SOL_MIN + 30, solMax(V) - 10), versD = pc.x > 600 ? false : true;
  var x0 = versD ? Math.max(solXmin(V, y) + 20, pc.x - 520) : Math.min(solXmax(V, y) - 20, pc.x + 520), x1 = versD ? Math.min(solXmax(V, y) - 20, pc.x + 560) : Math.max(solXmin(V, y) + 20, pc.x - 560);
  var s = echelleSol(y), m = document.createElement('div'), dur = 4600;
  m.className = 'at-souris' + (versD ? '' : ' g');
  m.innerHTML = dessinSouris();
  m.style.width = 'calc(' + (40 * s).toFixed(1) + 'px * var(--k) * 1.7)';
  m.style.zIndex = Math.round((1000 + y) * 5);
  V.calque.appendChild(m);
  V.souris = m;
  var am = anim(m, [{left:pX(V, x0), top:pY(V, y)}, {left:pX(V, x1), top:pY(V, y)}], {duration:dur, easing:'linear', fill:'forwards'});
  son(V, 'tic');
  var posM = function(f){ return {x:x0 + (x1 - x0) * f, y:y}; };
  var fini = function(){ if(V.souris === m){ m.remove(); V.souris = null; } };
  apres(V, dur + 80, fini);
  /* le chat la voit : il se tapit (face à elle), remue les fesses, et bondit */
  if(st.anim) chatArreter(V, o);
  if(st.t){ clearTimeout(st.t); st.t = null; }
  st.chasse = true;
  apres(V, 500, function(){
    if(chatEtat(V, o).tenu) return;
    var d = V.elO[o.id], p = chatPos(V, o), cible = posM(0.35);
    st.gauche = cible.x < p.x; if(d){ d.classList.toggle('at-c-gauche', st.gauche); d.classList.add('at-c-tapi'); }
    chatPose(V, o, 'marche');
  });
  apres(V, 1200, function(){ var d = V.elO[o.id]; if(d) d.classList.add('at-c-fesses'); });
  apres(V, 2100, function(){
    var d = V.elO[o.id];
    if(d) d.classList.remove('at-c-tapi', 'at-c-fesses');
    if(chatEtat(V, o).tenu){ st.chasse = false; return; }
    var q = posM(0.62), attrape = Math.random() < 0.6;
    chatBouger(V, o, chatSol(V, q.x, q.y), 'saute', function(){
      st.chasse = false;
      donner(o, 'jeu', 25); majHumeur(V, o);
      if(attrape){
        if(am) try{ am.pause(); }catch(e){}
        anim(m, [{transform:'scale(1)', opacity:1}, {transform:'scale(.2) translateY(-60%)', opacity:0}], {duration:420, fill:'forwards'});
        apres(V, 430, fini);
        coeursChat(V, o); flotter(V, o, '🐭 Attrapée !'); son(V, 'magie');
        chatPose(V, o, 'lave'); chatPlanifier(V, o, 3000);
      } else {
        st.dernierJeu = null; chatJoue(V, o, 'galipette'); flotter(V, o, '🐭 Ratée !');
      }
      changer(V);
    });
  });
  return true;
}

/* ---------- Il suit le doigt qui glisse sur le plancher, et essaie de l'attraper ---------- */
function chasseDoigt(V, ev){
  var now = Date.now();
  if(V.mode !== 'ranger' || (V.chasseT && now - V.chasseT < 450)) return;
  V.chasseT = now;
  var r = V.piece.getBoundingClientRect(), wx = V.vb.x0 + (ev.clientX - r.left + V.pan.x) / V.k, wy = V.vb.y0 + (ev.clientY - r.top + V.pan.y) / V.k;
  if(wy < SOL_Y - 10) return;                 /* (seulement sur le plancher) */
  var cibl = chatSol(V, wx, Math.max(wy, SOL_MIN + 20)), best = null, bd = 1e9;
  chatsDe(V).forEach(function(o){
    var st = V.chats[o.id];
    if(!st || st.tenu || st.pose === 'dort' || st.depart || st.chasse || (st.mv && st.anim && st.mv.mode === 'saute')) return;
    var p = chatPos(V, o), dd = Math.hypot(p.x - cibl.x, p.y - cibl.y);
    if(dd < bd && dd < 700){ bd = dd; best = o; }
  });
  if(!best) return;
  var st = chatEtat(V, best);
  if(st.t){ clearTimeout(st.t); st.t = null; }
  if(bd < 70){                                /* il l'a presque : il bondit dessus et tape de la patte */
    if(!st.anim){ chatPose(V, best, Math.random() < 0.5 ? 'tape' : 'saute'); if(st.pose === 'saute') animSvg(V, best, [{transform:'translateY(0)'}, {transform:'translateY(-35%)', offset:0.5}, {transform:'translateY(0)'}], {duration:480}); }
    donner(best, 'jeu', 3);
    chatPlanifier(V, best, 2200);
    return;
  }
  if(st.anim) chatArreter(V, best);
  chatAller(V, best, cibl, function(){ chatPose(V, best, 'tape'); chatPlanifier(V, best, 2200); });
}
function chasseFin(V){
  V.chasseT = 0;
  /* (le doigt est parti : il se rassoit, content, puis retourne à ses affaires) */
  apres(V, 500, function(){ chatsDe(V).forEach(function(o){ var st = V.chats[o.id]; if(st && !st.anim && !st.tenu && !st.chasse && (st.pose === 'tape' || st.pose === 'saute')){ chatPose(V, o, 'assis'); chatPlanifier(V, o, 2500); } }); });
}

/* ---------- Pendant une potion : il dresse les oreilles quand on verse le bon ingrédient (un petit coup de pouce) ---------- */
function chatPotion(V, ov){
  var o = chatsTous(V).filter(function(c){ return !V.chats[c.id] || !V.chats[c.id].depart; })[0];
  if(!o || bonheur(o) < 45 || tama(V).butin) return null;
  var p = CHATS[(o.v || 0) % 3], el = document.createElement('div');
  el.className = 'at-mj-chat';
  el.setAttribute('aria-hidden', 'true');
  el.innerHTML = '<svg viewBox="19 -28 76 78">' + teteChat(p, 57, 18, o.acc || {}) + '</svg><span class="at-mj-chat-n">' + esc(nomChat(o)) + '</span>';
  ov.appendChild(el);
  return function(){
    el.classList.remove('at-oreilles'); void el.offsetWidth; el.classList.add('at-oreilles');
    clearTimeout(el._t); el._t = apres(V, 1500, function(){ el.classList.remove('at-oreilles'); });
  };
}
