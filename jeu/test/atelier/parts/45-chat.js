
/* ==========================================================
   Le chat, bien vivant : il dort (il respire, des « z » s'envolent),
   se réveille, se promène, saute sur les meubles, s'assoit, se lèche
   la patte, tape un bocal, s'installe sur le grimoire…
   On le touche : il se roule en boule et dort 30 secondes.
   Tout est fait d'animations Web enchaînées (element.animate) :
   aucune boucle permanente, et jamais de téléportation.
   Sa position du moment n'est pas sauvegardée (seulement sa place à lui,
   quand l'enfant le pose quelque part).
   ========================================================== */
var CHAT_VITESSE = 135;          /* unités logiques par seconde */
var CHAT_SIESTE_TOUCHE = 30000;  /* toucher le chat : il dort 30 secondes */
var POSES = ['dort', 'assis', 'marche', 'saute', 'lave', 'tape', 'mange', 'salut'];

function chatsDe(V){ return ici(V).filter(function(o){ return o.t === 'chat'; }); }   /* (les chats de la pièce dessinée) */
function chatEtat(V, o){
  var st = V.chats[o.id];
  if(!st) st = V.chats[o.id] = {pos:null, pose:'dort', dortJusqua:Date.now() + 5000 + Math.random() * 7000, gauche:false, t:null, anim:null, tenu:false};
  return st;
}
/* Une position « vivante » est-elle encore valable (le meuble existe toujours, il est posé par terre) ? */
function posValide(V, pos){
  if(!pos) return false;
  if(!pos.sur) return typeof pos.x === 'number' && typeof pos.y === 'number';
  if(pos.sur.o === 'cheminee') return true;
  var par = V.parId[pos.sur.o];
  return !!(par && !par.sur && (catDe(par).surf || [])[pos.sur.k]);
}
function chatPos(V, o){
  var st = chatEtat(V, o);
  if(st.pos && !posValide(V, st.pos)) st.pos = null;
  if(!st.pos) return tailleChat(o, posObj(V, o));
  var ps = {t:'chat', x:st.pos.x, y:st.pos.y, sur:st.pos.sur ? {o:st.pos.sur.o, k:st.pos.sur.k, dx:st.pos.sur.dx} : null};
  var p = posObj(V, ps);
  if(st.pos.sur) p.z += 4;    /* sur un meuble, il passe devant ce qui y est posé */
  return tailleChat(o, p);    /* (le chaton est plus petit) */
}
function chatPose(V, o, pose){
  var st = chatEtat(V, o), d = V.elO[o.id];
  if(st.depart && pose !== 'salut') return;      /* Mimi dit au revoir : plus rien ne change sa pose */
  st.pose = pose;
  if(!d) return;
  POSES.forEach(function(p){ d.classList.toggle('at-c-' + p, p === pose); });
}
function chatHabiller(V, o, d){
  var st = chatEtat(V, o);
  d.classList.add('at-c-' + st.pose);
  d.classList.toggle('at-c-gauche', !!st.gauche);
  /* l'élément vient d'être recréé : une animation en cours sur l'ancien ne finira jamais */
  if(st.anim){ st.anim = null; chatPlanifier(V, o, 1500); }
}
function chatPlanifier(V, o, ms){
  var st = chatEtat(V, o);
  if(st.t) clearTimeout(st.t);
  st.t = apres(V, ms, function(){ st.t = null; chatAgir(V, o); });
}
function chatsDemarrer(V){
  chatsDe(V).forEach(function(o){ chatPose(V, o, chatEtat(V, o).pose); chatPlanifier(V, o, 2000 + Math.random() * 3000); });
}

/* ---------- Se déplacer : marcher ou sauter, de là où il est jusqu'à la nouvelle place ---------- */
function chatBouger(V, o, pos, mode, fin){
  var d = V.elO[o.id], st = chatEtat(V, o);
  if(!d || V.arrete){ if(fin) fin(); return; }
  var p0 = chatPos(V, o);
  st.pos = pos;
  var p1 = chatPos(V, o), dx = p1.x - p0.x, dy = p1.y - p0.y, dist = Math.hypot(dx, dy);
  if(dist < 3){ placerEl(V, o); if(fin) fin(); return; }
  if(Math.abs(dx) > 2) st.gauche = dx < 0;
  d.classList.toggle('at-c-gauche', st.gauche);
  chatPose(V, o, mode);
  placerEl(V, o);
  var k = V.k, tx = (-dx * k).toFixed(1), ty = (-dy * k).toFixed(1), kf, dur;
  d.style.zIndex = Math.round(Math.max(p0.z, p1.z) * 5) + 6;
  if(mode === 'saute'){
    var arc = (Math.abs(dy) * 0.3 + 46) * k;
    kf = [{transform:'translate(' + tx + 'px,' + ty + 'px) scale(' + p0.s.toFixed(3) + ')'},
      {transform:'translate(' + (tx / 2).toFixed(1) + 'px,' + (ty / 2 - arc).toFixed(1) + 'px) scale(' + ((p0.s + p1.s) / 2).toFixed(3) + ')', offset:0.5},
      {transform:'translate(0,0) scale(' + p1.s.toFixed(3) + ')'}];
    dur = 620;
  } else {
    kf = [{transform:'translate(' + tx + 'px,' + ty + 'px) scale(' + p0.s.toFixed(3) + ')'}, {transform:'translate(0,0) scale(' + p1.s.toFixed(3) + ')'}];
    dur = Math.max(450, dist / CHAT_VITESSE * 1000);
  }
  var a = anim(d, kf, {duration:dur, easing:mode === 'saute' ? 'cubic-bezier(.3,0,.4,1)' : 'linear'});
  st.anim = a;
  st.mv = {p0:{x:p0.x, y:p0.y}, p1:{x:p1.x, y:p1.y}, mode:mode, dur:dur};
  function fini(){
    if(st.anim !== a) return;
    st.anim = null;
    if(V.arrete) return;
    d.style.zIndex = Math.round(p1.z * 5);
    if(mode === 'saute') anim(d, [{transform:'scale(' + (p1.s * 1.08).toFixed(3) + ',' + (p1.s * 0.9).toFixed(3) + ')'}, {transform:'scale(' + p1.s.toFixed(3) + ')'}], {duration:200});
    if(fin) fin();
  }
  if(a) a.onfinish = fini; else fini();
}
/* Un point du plancher (on reste dans la pièce) */
function chatSol(V, x, y){
  y = borne(y, SOL_MIN + 20, solMax(V));
  return {x:borne(x, solXmin(V, y) + 50, solXmax(V, y) - 50), y:y, sur:null};
}
/* Assis là, serait-il caché derrière le chaudron, l'établi ou un grand meuble ? (on ne choisit pas ces places-là) */
function chatCache(V, x, y){
  var s = echelleSol(y), cx0 = x - 45 * s, cx1 = x + 45 * s, cy0 = y - 80 * s, aire = (cx1 - cx0) * (y - cy0);
  var bx = [];
  ici(V).forEach(function(o){
    if(o.sur || o.t === 'chat' || o.t === 'tapis') return;
    var c = catDe(o);
    if(c.z !== 'sol') return;
    var p = posObj(V, o);
    if(p.y > y) bx.push(boite(o, p));
  });
  return bx.some(function(b){
    var w = Math.min(cx1, b[2]) - Math.max(cx0, b[0]), h = Math.min(y, b[3]) - Math.max(cy0, b[1]);
    return w > 0 && h > 0 && w * h > aire * 0.45;
  });
}
/* Un point du plancher où on le voit */
function chatSolVisible(V){
  for(var i = 0; i < 12; i++){
    var y = SOL_MIN + 40 + Math.random() * (solMax(V) - SOL_MIN - 60);
    var p = chatSol(V, solXmin(V, y) + 60 + Math.random() * Math.max(10, solXmax(V, y) - solXmin(V, y) - 120), y);
    if(!chatCache(V, p.x, p.y)) return p;
  }
  var y2 = solMax(V) - 10;
  return chatSol(V, solXmin(V, y2) + 80 + Math.random() * Math.max(10, solXmax(V, y2) - solXmin(V, y2) - 160), y2);
}
/* Là où il est : sur un meuble ? */
function chatSurMeuble(V, o){ var st = chatEtat(V, o); return !!(st.pos ? st.pos.sur : o.sur); }
/* Une suite de pas : descendre du meuble si besoin, marcher jusqu'au pied du meuble visé, sauter dessus */
function chatAller(V, o, cible, fin){
  var etapes = [];
  if(chatSurMeuble(V, o)){
    var p = chatPos(V, o);
    etapes.push(['saute', chatSol(V, p.x + (Math.random() < 0.5 ? -50 : 50), Math.max(p.y + 40, SOL_MIN + 50))]);
  }
  if(cible.sur){
    etapes.push(['marche', chatSol(V, cible.depart.x, cible.depart.y)]);
    etapes.push(['saute', {sur:cible.sur}]);
  } else etapes.push(['marche', cible]);
  (function suite(i){
    var st = chatEtat(V, o);
    if(V.arrete || st.tenu) return;
    if(st.touche){ st.touche = false; chatEndormir(V, o); return; }      /* touché pendant un saut : il atterrit puis se roule en boule */
    if(i >= etapes.length){ if(fin) fin(); return; }
    chatBouger(V, o, etapes[i][1], etapes[i][0], function(){ suite(i + 1); });
  })(0);
}
/* Les meubles où il peut sauter (pas trop haut) */
function surfacesChat(V){
  var l = [];
  ici(V).forEach(function(p){
    if(p.sur || p.t === 'chat' || p.cote) return;
    var c = catDe(p);
    if(!c.surf) return;
    var pp = posObj(V, p);
    c.surf.forEach(function(sf, k){
      var dx = Math.round((sf.x0 + sf.x1) / 2 + (Math.random() - 0.5) * (sf.x1 - sf.x0) * 0.4);
      var dep = c.z === 'mur' ? {x:pp.x + dx * pp.s, y:SOL_MIN + 40} : {x:pp.x + dx * pp.s, y:Math.min(solMax(V), pp.y + 28)};
      var h = dep.y - (pp.y + sf.y * pp.s);
      if(h > 20 && h < 430) l.push({sur:{o:p.id, k:k, dx:dx}, depart:dep});
    });
  });
  return l;
}

/* ---------- Ce qu'il a envie de faire ---------- */
function chatAgir(V, o){
  var st = chatEtat(V, o);
  if(V.arrete || !V.parId[o.id] || salleDe(o) !== V.salle) return;     /* (un chat de l'autre pièce attend qu'on y aille) */
  if(V.mode !== 'ranger' || V.glisse || st.tenu || st.anim){ chatPlanifier(V, o, 2500); return; }
  var now = Date.now();
  if(st.pose === 'dort'){
    if(now < st.dortJusqua){ chatPlanifier(V, o, st.dortJusqua - now + 30); return; }
    chatPose(V, o, 'assis');                       /* il se réveille et s'étire */
    st.reveil = true;
    var d = V.elO[o.id];
    if(d) anim(d, [{transform:'scale(' + d._s + ')'}, {transform:'scale(' + (d._s * 1.12) + ',' + (d._s * 0.9) + ')', offset:0.4}, {transform:'scale(' + d._s + ')'}], {duration:700});
    chatPlanifier(V, o, 1600);
    return;
  }
  var suite = function(ms){ chatPose(V, o, 'assis'); chatPlanifier(V, o, ms || (2200 + Math.random() * 2800)); };
  if(tamaAgir(V, o)) return;                      /* ses besoins d'abord (manger, boire, dormir, demander) ; le chaton joue */
  var r = Math.random() * (st.reveil ? 0.87 : 1);   /* pas de sieste juste après s'être réveillé */
  st.reveil = false;
  if(r < 0.27){                                   /* une petite promenade */
    chatAller(V, o, chatSolVisible(V), function(){ suite(); });
  } else if(r < 0.5){                             /* il saute sur un meuble */
    var l = surfacesChat(V);
    if(!l.length){ suite(); return; }
    chatAller(V, o, l[Math.floor(Math.random() * l.length)], function(){ suite(); });
  } else if(r < 0.61 && V.parId.lu && !V.parId.lu.sur && salleDe(V.parId.lu) === V.salle){   /* il s'installe sur le grimoire… */
    var pl = posObj(V, V.parId.lu);
    chatAller(V, o, {sur:{o:'lu', k:0, dx:0}, depart:{x:pl.x + 70, y:Math.min(solMax(V), pl.y + 26)}}, function(){ chatPose(V, o, 'lave'); chatPlanifier(V, o, 5000 + Math.random() * 4000); });
  } else if(r < 0.73){                            /* il tape un bocal */
    var b = ici(V).filter(function(x){ return x.t === 'bocaux' || x.t === 'fioles_ingr'; })[0];
    if(!b){ suite(); return; }
    var pb = posObj(V, b), cible;
    if(catDe(b).z === 'mur' || b.cote) cible = chatSol(V, pb.x + (pb.x > 600 ? -80 : 80), SOL_MIN + 60);
    else if(b.sur && V.parId[b.sur.o] && !V.parId[b.sur.o].sur && !V.parId[b.sur.o].cote && (catDe(V.parId[b.sur.o]).surf || [])[b.sur.k]){
      var sfs = catDe(V.parId[b.sur.o]).surf[b.sur.k];
      var dx = b.sur.dx + (b.sur.dx > (sfs.x0 + sfs.x1) / 2 ? -95 : 95);
      cible = {sur:{o:b.sur.o, k:b.sur.k, dx:Math.round(borne(dx, sfs.x0 + 20, sfs.x1 - 20))},
        depart:{x:pb.x, y:catDe(V.parId[b.sur.o]).z === 'mur' ? SOL_MIN + 40 : Math.min(solMax(V), posObj(V, V.parId[b.sur.o]).y + 28)}};
    } else {
      cible = chatSol(V, pb.x + 95, pb.y + 4);
      if(chatCache(V, cible.x, cible.y)) cible = chatSol(V, pb.x - 95, pb.y + 4);
      if(chatCache(V, cible.x, cible.y)){ suite(); return; }
    }
    chatAller(V, o, cible, function(){
      var p = chatPos(V, o), d2 = V.elO[o.id];
      st.gauche = pb.x < p.x;
      if(d2) d2.classList.toggle('at-c-gauche', st.gauche);
      chatPose(V, o, 'tape');
      var jar = V.elO[b.id];
      if(jar) anim(jar, [0, -5, 4, -3, 2, 0].map(function(a){ return {transform:'scale(' + jar._s + ') rotate(' + a + 'deg)'}; }), {duration:900, delay:350, iterations:2});
      son(V, 'tic');
      chatPlanifier(V, o, 2600);
    });
  } else if(r < 0.87){                            /* il se lèche la patte */
    chatPose(V, o, 'lave');
    chatPlanifier(V, o, 3000 + Math.random() * 2000);
  } else if(!chatSieste(V, o)){                   /* une petite sieste (souvent dans un de ses coins) */
    chatPose(V, o, 'dort');
    st.dortJusqua = now + 12000 + Math.random() * 9000;
    chatPlanifier(V, o, st.dortJusqua - now + 30);
  }
}

/* ---------- On le touche : il se roule en boule et dort 30 secondes ---------- */
function chatToucher(V, o){
  var st = chatEtat(V, o), d = V.elO[o.id], a = st.anim, mv = st.mv;
  son(V, 'magie');
  donner(o, 'amour', 10); majHumeur(V, o); changer(V);      /* un câlin */
  montrerBonheur(V, o);                                       /* sa barre de bonheur (et 🎀 pour l'habiller) */
  if(a && mv && mv.mode === 'saute'){ st.touche = true; coeursChat(V, o); return; }   /* en l'air : il finit son saut */
  if(a){
    /* en marche : il s'arrête là où il est (sa place du moment), sans sauter ailleurs */
    var f = mv && typeof a.currentTime === 'number' ? borne(a.currentTime / mv.dur, 0, 1) : 1;
    st.anim = null;
    try{ a.cancel(); }catch(e){}
    if(mv) st.pos = {x:mv.p0.x + (mv.p1.x - mv.p0.x) * f, y:mv.p0.y + (mv.p1.y - mv.p0.y) * f, sur:null};
  }
  chatEndormir(V, o);
  coeursChat(V, o);
}
function chatEndormir(V, o){
  var st = chatEtat(V, o), d = V.elO[o.id];
  placerEl(V, o);
  if(d) d.style.zIndex = Math.round(chatPos(V, o).z * 5);
  chatPose(V, o, 'dort');
  st.dortJusqua = Date.now() + CHAT_SIESTE_TOUCHE;
  chatPlanifier(V, o, CHAT_SIESTE_TOUCHE + 30);
  if(d) anim(d, [{transform:'scale(' + d._s + ')'}, {transform:'scale(' + (d._s * 0.86) + ',' + (d._s * 1.1) + ')', offset:0.35}, {transform:'scale(' + d._s + ')'}], {duration:420, easing:'ease-out'});
}
function coeursChat(V, o){
  var p = chatPos(V, o);
  for(var i = 0; i < 3; i++){
    var h = document.createElement('span'); h.className = 'at-coeur-vole'; h.textContent = '💜';
    h.style.left = pX(V, p.x + (i - 1) * 22); h.style.top = pY(V, p.y - 70 * p.s);
    h.style.animationDelay = (i * 0.15) + 's';
    V.calque.appendChild(h);
    (function(h){ apres(V, 1500, function(){ h.remove(); }); })(h);
  }
}
/* L'enfant l'attrape pour le poser ailleurs : sa place du moment devient sa place à lui */
function chatSaisi(V, o){
  var st = chatEtat(V, o);
  if(st.anim){ var a = st.anim; st.anim = null; try{ a.cancel(); }catch(e){} }
  if(st.t){ clearTimeout(st.t); st.t = null; }
  st.touche = false;
  if(st.pos){
    if(st.pos.sur) o.sur = {o:st.pos.sur.o, k:st.pos.sur.k, dx:st.pos.sur.dx};
    else { o.sur = null; o.x = st.pos.x; o.y = st.pos.y; }
    st.pos = null;
    placerEl(V, o);
  }
  st.tenu = true;
}
function chatLache(V, o){
  var st = chatEtat(V, o);
  st.tenu = false;
  st.pos = null;
  if(st.pose !== 'dort') chatPose(V, o, 'assis');
  chatPlanifier(V, o, st.pose === 'dort' ? Math.max(1000, st.dortJusqua - Date.now()) : 3500);
}
