
/* ==========================================================
   Le chat, un petit Tamagotchi (étape 3). Romain : « Le chat, c'est un élément très très important. »
   - Ses besoins : faim 🍗, soif 💧, câlins ❤️, jeu 🧶, sommeil 💤 (0 à 100, gardés sur le chat : o.b).
     Ils baissent seulement pendant qu'on joue (l'atelier ouvert, l'écran allumé) et un peu à chaque nouveau moment :
     JAMAIS quand l'appli est fermée. Il ne tombe jamais malade, il ne meurt jamais : il a juste l'air un peu triste et il demande
     (une bulle au-dessus de lui ; on la touche pour savoir quoi faire).
   - On lui donne des croquettes (le distributeur ou la gamelle), de l'eau, on le caresse avec le doigt (il ronronne, des cœurs),
     on joue avec la pelote ; il va dormir dans son panier.
   - Une petite bêtise environ toutes les 4 minutes de jeu, jamais plus : une fiole par terre, le tabouret renversé, une pelote déroulée.
     Un toucher remet tout en ordre ; rien n'est jamais perdu.
   - À partir de l'enquête 4 (PORTEE, des données) : la chatte s'arrondit, un chaton naît (un autre pelage), et quand il a un peu grandi,
     Mimi part vivre chez Odette, la grand-mère aux sept chats (etat.chezOdette ; Atelier.chezOdette(etat) pour le village).
   L'état : etat.tama = {jeu (secondes de jeu), betise (le moment de la dernière bêtise), moment, portee:{phase, t}}, etat.betises, etat.chezOdette.
   ========================================================== */
var BESOINS = [
  {k:'faim', ic:'🍗', baisse:5, dit:'%n a faim ! Donne-lui des croquettes : touche le distributeur ou sa gamelle.'},
  {k:'soif', ic:'💧', baisse:6, dit:'%n a soif ! Touche sa gamelle d\'eau pour la remplir.'},
  {k:'amour', ic:'❤️', baisse:5, dit:'%n veut un câlin ! Caresse-le en glissant ton doigt sur lui.'},
  {k:'jeu', ic:'🧶', baisse:4, dit:'%n veut jouer ! Touche la bulle : voilà une pelote.'},
  {k:'dodo', ic:'💤', baisse:3, dit:'%n a sommeil… Touche la bulle : il va faire dodo.'}
];
var DEMANDE = 40, TRISTE = 22;      /* sous 40 il le demande (une bulle) ; sous 22 il a l'air un peu triste */
var TIC = 15;                        /* les besoins changent toutes les 15 secondes de jeu */
var BETISE_MIN = 240;                /* une bêtise au plus toutes les 4 minutes de jeu */
var PAS_MOMENT = 22;                 /* un nouveau moment de la journée : chaque besoin baisse un peu */
/* Le chaton (des données : il arrive à l'enquête 4) : en secondes de jeu ; un nouveau moment compte pour 120 s */
var PORTEE = {enquete:4, ronde:150, naissance:240, depart:420, mere:'Mimi', chatons:['Pompon', 'Caramel', 'Noisette']};
var REPLIQUE_ODETTE = {q:'Comment va %n ?', a:'%n ? Elle est très heureuse ici, avec mes sept chats ! Elle dort sur mon fauteuil, près du feu. Revenez la voir quand vous voulez.'};
var DODO_ICI = /^(panier|lit|pouf|coussin|arbre_chat|coffre)$/;   /* ses coins pour dormir */

function tama(V){ if(!V.etat.tama || !Array.isArray(V.etat.betises)) normaliserChat(V.etat); return V.etat.tama; }
function chatsTous(V){ return V.etat.objets.filter(function(o){ return o.t === 'chat'; }); }
function nomChat(o){ return o.nom || (o.chaton ? PORTEE.chatons[0] : PORTEE.mere); }
function tailleChat(o, p){ if(o.chaton && o.taille > 0 && o.taille < 1) p.s *= o.taille; return p; }
function besoins(o){
  if(!o.b || typeof o.b !== 'object') o.b = {};
  BESOINS.forEach(function(b){ if(typeof o.b[b.k] !== 'number') o.b[b.k] = 80; });
  return o.b;
}
function besoinUrgent(o){
  var b = besoins(o), pire = null;
  BESOINS.forEach(function(x){ if(b[x.k] < DEMANDE && (!pire || b[x.k] < b[pire.k])) pire = x; });
  return pire;
}
function humeur(o){
  var b = besoins(o);
  return {triste:BESOINS.some(function(x){ return b[x.k] < TRISTE; }), fatigue:b.dodo < 30};
}
/* le numéro de l'enquête : donné par le moteur (option enquete), sinon celui de la partie en cours */
function enqueteNo(V){
  var n = 0, t = V.etat.tama || {};
  if(typeof V.o.enquete === 'number') n = V.o.enquete;
  else try{ var S = window.M && window.M.S; n = S && S.e ? +S.e.id || 0 : 0; }catch(e){ n = 0; }
  /* (entre deux enquêtes, la partie n'a pas d'enquête en cours : on garde la plus avancée déjà vue) */
  if(n > 0 && V.etat.tama && !(t.enq >= n)) t.enq = n;
  return Math.max(n, t.enq || 0, 1);
}
function donner(o, k, n){ var b = besoins(o); b[k] = borne(Math.round(b[k] + n), 0, 100); }

/* ---------- Le temps de jeu ---------- */
function tamaDemarrer(V){
  tama(V);
  chatsTous(V).forEach(function(o){ besoins(o); if(!o.nom) o.nom = nomChat(o); });
  clearTimeout(V.tamaT);
  V.tamaT = apres(V, TIC * 1000, function(){ tamaTic(V); });
  majHumeurs(V);
}
function tamaTic(V, force){
  if(V.arrete) return;
  var actif = force || (!document.hidden && V.mode === 'ranger');
  if(actif){
    var t = tama(V), dt = force || TIC;
    t.jeu += dt;
    chatsTous(V).forEach(function(o){
      var st = V.chats[o.id], dort = st && st.pose === 'dort' && salleDe(o) === V.salle;
      BESOINS.forEach(function(x){
        if(x.k === 'dodo' && dort) donner(o, 'dodo', 30 * dt / 60);
        else donner(o, x.k, -x.baisse * dt / 60);
      });
    });
    portee(V, dt);
    if(!V.attenteBetise && !GUIDE && !V.ouvert && V.grim.hidden && t.jeu - t.betise >= BETISE_MIN && Math.random() < (force ? 1 : 0.5)) peutEtreBetise(V);
    /* étape 4 : bien heureux, il sort par la chatière chercher un ingrédient (au plus une fois par moment) ; une souris passe */
    if(!force && !V.attenteBetise && !GUIDE && !V.o.sansSurprise){      /* (rien de tout ça pendant le guidage du tutoriel ; sansSurprise : les bancs d'essai) */
      var sortants = chatsDe(V).filter(function(c){ return peutSortir(V, c); });
      if(sortants.length && Math.random() < 0.3) sortieChat(V, sortants[0]);
      else if(Math.random() < 0.35) sourisPasse(V);
    }
    majHumeurs(V);
    if(!force && (t.jeu / TIC) % 4 === 0) changer(V);
  }
  if(!force){ clearTimeout(V.tamaT); V.tamaT = apres(V, TIC * 1000, function(){ tamaTic(V); }); }
}
/* Un nouveau moment de la journée (matin, après-midi…) : les besoins baissent un peu, le chaton grandit */
function tamaMoment(V){
  var t = tama(V), cle = enqueteNo(V) + ':' + (V.o.moment || 'matin');
  if(t.moment && t.moment !== cle){
    chatsTous(V).forEach(function(o){ BESOINS.forEach(function(x){ donner(o, x.k, -PAS_MOMENT); }); });
    portee(V, 120, true);
  }
  t.moment = cle;
}

/* ---------- L'humeur : sa tête, sa bulle ---------- */
function bulleHTML(o){
  var u = besoinUrgent(o);
  return '<button type="button" class="at-bulle"' + (u ? ' data-bulle="' + u.k + '"' : ' hidden') + ' aria-label="Ce que veut le chat"><span>' + (u ? u.ic : '') + '</span><i></i><i></i></button>';
}
function majHumeur(V, o){
  var d = V.elO[o.id];
  if(!d) return;
  var h = humeur(o), u = besoinUrgent(o), b = d.querySelector('.at-bulle');
  d.classList.toggle('at-c-triste', h.triste);
  d.classList.toggle('at-c-fatigue', h.fatigue);
  d.classList.toggle('at-c-ronde', !!o.ronde);
  d.classList.toggle('at-chaton', !!o.chaton);
  if(b){
    b.hidden = !u;
    if(u){ b.setAttribute('data-bulle', u.k); b.querySelector('span').textContent = u.ic; }
  }
}
function majHumeurs(V){ chatsDe(V).forEach(function(o){ majHumeur(V, o); }); }

/* ---------- Les affaires du chat ---------- */
function gamellePleine(V, o, t){ return V.etat.objets.filter(function(g){ return g.t === t && g.plein && salleDe(g) === salleDe(o) && !g.sur; })[0]; }
function remplir(V, g){
  g.plein = 1; g.neuf = 0;
  redessiner(V, g);
  var d = V.elO[g.id];
  if(d) anim(d, [{transform:'scale(' + d._s + ')'}, {transform:'scale(' + d._s * 1.12 + ',' + d._s * 0.9 + ')', offset:0.4}, {transform:'scale(' + d._s + ')'}], {duration:360});
  son(V, g.t === 'eau' ? 'plouf' : 'gain');
  var t = g.t === 'eau' ? 'De l\'eau fraîche !' : 'Des croquettes !';
  toast(V, '<b>' + (g.t === 'eau' ? '💧' : '🍗') + '</b> ' + esc(t), 2000);
  changer(V);
  /* un chat qui en a besoin arrive tout de suite */
  chatsDe(V).forEach(function(c){ var u = besoinUrgent(c); if(u && (u.k === 'faim' && g.t === 'gamelle' || u.k === 'soif' && g.t === 'eau')) chatPlanifier(V, c, 400); });
}
/* Le distributeur : les croquettes tombent dans la gamelle la plus proche (dans la pièce) */
function parDistributeur(V, dis){
  var gs = ici(V).filter(function(g){ return g.t === 'gamelle'; });
  if(!gs.length){ var t = 'Il faut une gamelle pour les croquettes !'; toast(V, '<b>🥫 ➡️ ?</b> ' + esc(t), 3200, t); son(V, 'ko'); return true; }
  var pd = posObj(V, dis), g = gs.sort(function(a, b){ var pa = posObj(V, a), pb = posObj(V, b); return Math.hypot(pa.x - pd.x, pa.y - pd.y) - Math.hypot(pb.x - pd.x, pb.y - pd.y); })[0];
  if(g.plein) return false;          /* déjà pleine : le toucher change le style du distributeur */
  var d = V.elO[dis.id];
  if(d) anim(d, [{transform:'scale(' + d._s + ')'}, {transform:'scale(' + d._s * 0.94 + ',' + d._s * 1.06 + ')', offset:0.3}, {transform:'scale(' + d._s + ')'}], {duration:420});
  apres(V, 250, function(){ remplir(V, g); });
  return true;
}
function relever(V, o){
  delete o.renverse;
  redessiner(V, o);
  etincelles(V, o);
  son(V, 'pas');
  var t = 'Le tabouret est relevé !';
  toast(V, '<b>🪑 ✔</b> ' + esc(t), 2400, t);
  V.etat.betises = V.etat.betises.filter(function(b){ return !(b.t === 'tabouret' && b.o === o.id); });
  changer(V);
}

/* ---------- Ce que l'enfant fait pour lui ---------- */
function bulleChat(V, o){
  var u = besoinUrgent(o);
  if(!u) return;
  var t = u.dit.replace('%n', nomChat(o));
  if(u.k === 'amour'){ caresser(V, o, 5); return; }
  if(u.k === 'jeu'){ jouerPelote(V, o); toast(V, '<b>🧶</b> ' + esc(nomChat(o) + ' joue avec la pelote !'), 2600); return; }
  if(u.k === 'dodo'){ var st = chatEtat(V, o); if(!st.tenu){ chatVaDormir(V, o); } toast(V, '<b>💤</b> ' + esc(nomChat(o) + ' va faire dodo.'), 2600); return; }
  /* faim, soif : on montre quoi toucher (le distributeur, les gamelles brillent) */
  toast(V, '<b>' + u.ic + '</b> ' + esc(t), 5200, t);
  var l = ici(V).filter(function(g){ return u.k === 'faim' ? (g.t === 'gamelle' || g.t === 'distributeur') : g.t === 'eau'; });
  if(!l.length){ var t2 = 'Ouvre le carton des affaires du chat : il y a sa gamelle !'; apres(V, 2600, function(){ toast(V, '<b>📦</b> ' + esc(t2), 4200, t2); }); }
  l.forEach(function(g){ var d = V.elO[g.id]; if(d){ d.classList.add('at-dispo'); apres(V, 4000, function(){ d.classList.remove('at-dispo'); }); } });
  son(V, 'clic');
}
/* Caresser : le doigt glisse sur lui (ou un toucher) — il ronronne, des cœurs s'envolent */
function caresser(V, o, n){
  donner(o, 'amour', 6 * (n || 1));
  var d = V.elO[o.id], st = chatEtat(V, o);
  if(chatArreter(V, o)) chatPlanifier(V, o, 2600);
  else if(st.pose !== 'dort' && !st.anim && !st.tenu) chatPlanifier(V, o, 2600);
  if(d){ d.classList.add('at-c-ronron'); clearTimeout(d._ronron); d._ronron = apres(V, 1400, function(){ d.classList.remove('at-c-ronron'); }); }
  if(!V.coeurT || Date.now() - V.coeurT > 450){ V.coeurT = Date.now(); coeursChat(V, o); son(V, 'magie'); }
  majHumeur(V, o);
  montrerBonheur(V, o, 2600);
  changer(V);
}
/* La pelote : elle roule un peu plus loin, le chat lui court après */
function jouerPelote(V, o){
  var st = chatEtat(V, o);
  if(st.tenu) return;
  var p = chatPos(V, o), y = borne(p.y + 50, SOL_MIN + 40, solMax(V) - 10), x = borne(p.x + (Math.random() < 0.5 ? -170 : 170), solXmin(V, y) + 60, solXmax(V, y) - 60);
  var b = document.createElement('div'), s = echelleSol(y);
  b.className = 'at-pelote'; b.textContent = '🧶';
  b.style.left = pX(V, p.x); b.style.top = pY(V, p.y - 10); b.style.fontSize = 'calc(' + (34 * s).toFixed(1) + 'px * var(--k) * 1.6)';
  V.calque.appendChild(b);
  anim(b, [{left:pX(V, p.x), top:pY(V, p.y - 10), transform:'translate(-50%,-50%) rotate(0deg)'}, {left:pX(V, x), top:pY(V, y), transform:'translate(-50%,-50%) rotate(720deg)'}], {duration:900, easing:'ease-out', fill:'forwards'});
  if(st.anim){ var a = st.anim; st.anim = null; try{ a.cancel(); }catch(e){} }
  if(st.t){ clearTimeout(st.t); st.t = null; }
  apres(V, 300, function(){
    chatAller(V, o, {x:x + (x > p.x ? -40 : 40), y:y, sur:null}, function(){
      donner(o, 'jeu', 100); majHumeur(V, o); changer(V);
      chatJoue(V, o);                                   /* un de ses dix jeux (jamais le même deux fois de suite) */
      montrerBonheur(V, o, 3000);
      apres(V, 700, function(){ b.remove(); coeursChat(V, o); });
    });
  });
}
function chatVaDormir(V, o){
  var pn = ici(V).filter(function(x){ return x.t === 'panier' && !x.sur && !x.cote; })[0], st = chatEtat(V, o);
  if(st.anim){ var a = st.anim; st.anim = null; try{ a.cancel(); }catch(e){} }
  if(st.t){ clearTimeout(st.t); st.t = null; }
  var dodo = function(){ chatPose(V, o, 'dort'); st.dortJusqua = Date.now() + 25000; chatPlanifier(V, o, 25030); majHumeur(V, o); };
  if(!pn){ dodo(); return; }
  var pp = posObj(V, pn);
  chatAller(V, o, {sur:{o:pn.id, k:0, dx:0}, depart:{x:pp.x + 90, y:Math.min(solMax(V), pp.y + 20)}}, dodo);
}
/* Il a faim (ou soif) et sa gamelle est pleine : il y va, il mange, la gamelle se vide */
function chatVaManger(V, o, g, k){
  var pg = posObj(V, g), st = chatEtat(V, o), cote = pg.x > 600 ? -1 : 1;
  chatAller(V, o, chatSol(V, pg.x + cote * 70 * pg.s, pg.y + 6), function(){
    st.gauche = cote > 0; var d = V.elO[o.id]; if(d) d.classList.toggle('at-c-gauche', st.gauche);
    chatPose(V, o, 'mange');
    son(V, k === 'soif' ? 'plouf' : 'tic');
    chatPlanifier(V, o, 3600);
    apres(V, 3400, function(){
      donner(o, k, 100); g.plein = 0; redessiner(V, g); majHumeur(V, o); changer(V);
      chatPose(V, o, 'lave'); montrerBonheur(V, o, 3000);
    });
  });
}

/* ---------- Les bêtises (environ une toutes les 4 minutes de jeu, jamais plus ; rien n'est perdu) ---------- */
function peutEtreBetise(V){
  var t = tama(V), l = chatsDe(V).filter(function(o){ var st = V.chats[o.id]; return st && !st.tenu && !st.anim && st.pose !== 'dort'; });
  if(!l.length) return false;
  var o = l[Math.floor(Math.random() * l.length)], choix = [];
  var etag = ici(V).filter(function(x){ var c = catDe(x); return !x.sur && c.z === 'mur' && /etagere|epices|fioles/.test(x.t); });
  var tab = ici(V).filter(function(x){ return x.t === 'tabouret' && !x.sur && !x.renverse; });
  if(etag.length) choix.push('fiole');
  if(tab.length) choix.push('tabouret');
  choix.push('pelote');
  var quoi = choix[Math.floor(Math.random() * choix.length)];
  t.betise = t.jeu;
  V.attenteBetise = true;
  var fin = function(){ V.attenteBetise = false; };
  if(quoi === 'fiole'){
    var e = etag[Math.floor(Math.random() * etag.length)], pe = posObj(V, e), y = borne(SOL_Y + 90, SOL_MIN + 40, solMax(V)), F = cadreObjet(V, e.id);
    var x = borne(F ? F.x : pe.x, solXmin(V, y) + 40, solXmax(V, y) - 40);
    chatAller(V, o, chatSol(V, x + 70, y + 10), function(){
      chatPose(V, o, 'saute');
      apres(V, 500, function(){
        V.etat.n++;
        var b = {id:'b' + V.etat.n, t:'fiole', x:x, y:y, pc:V.salle || undefined, c:['#7cf09a', '#ff8fb3', '#8ff3ff', '#ffd84a'][V.etat.n % 4]};
        V.etat.betises.push(b);
        dessinerBetises(V, b.id);
        chatPose(V, o, 'assis'); chatPlanifier(V, o, 3000);
        var tx = 'Oh ! ' + nomChat(o) + ' a fait tomber une fiole. Touche-la pour la remettre à sa place.';
        toast(V, '<b>🐈 💥 🧪</b> ' + esc(tx), 5200, tx); son(V, 'ko'); changer(V); fin();
      });
    });
  } else if(quoi === 'tabouret'){
    var tb = tab[0], pt = posObj(V, tb);
    chatAller(V, o, chatSol(V, pt.x + 80, pt.y + 6), function(){
      chatPose(V, o, 'saute');
      apres(V, 450, function(){
        tb.renverse = 1; redessiner(V, tb);
        V.etat.betises.push({t:'tabouret', o:tb.id});
        chatPose(V, o, 'assis'); chatPlanifier(V, o, 3000);
        var tx = 'Patatras ! ' + nomChat(o) + ' a renversé le tabouret. Touche-le pour le relever.';
        toast(V, '<b>🐈 💥 🪑</b> ' + esc(tx), 5200, tx); son(V, 'ko'); changer(V); fin();
      });
    });
  } else {
    var p = chatPos(V, o), y2 = borne(p.y + 30, SOL_MIN + 40, solMax(V) - 10), x2 = borne(p.x + (p.x > 600 ? -220 : 220), solXmin(V, y2) + 60, solXmax(V, y2) - 60);
    chatAller(V, o, chatSol(V, x2, y2), function(){
      V.etat.n++;
      var b2 = {id:'b' + V.etat.n, t:'pelote', x0:p.x, y0:Math.max(p.y, SOL_MIN + 30), x:x2, y:y2, pc:V.salle || undefined, c:['#e86f9c', '#5f8fd9', '#f2b63c'][V.etat.n % 3]};
      V.etat.betises.push(b2);
      dessinerBetises(V, b2.id);
      chatPose(V, o, 'lave'); chatPlanifier(V, o, 3000);
      var tx = nomChat(o) + ' a déroulé une pelote de laine partout ! Touche-la pour la rembobiner.';
      toast(V, '<b>🐈 🧶</b> ' + esc(tx), 5200, tx); son(V, 'tic'); changer(V); fin();
    });
  }
  return true;
}
/* Le dessin d'une bêtise, couchée sur le plancher, dans la perspective de la pièce */
function dessinBetise(b){
  if(b.t === 'fiole'){
    var m = surSol(b.x, b.y), R = repere([m.X, 0, m.Z], AXES_FACE, 120, 40), x = ajouterOutils3d(ctx3d(R, false));
    x.p = 80; x.cat = {w:120, h:40};
    var s = sansTrait(x.disque(60, 40, 46, 40, b.c, ' opacity=".7"', 30)) + x.tube([30, 26, 40], [86, 30, 46], 13, G('verre'), null, G('verre')) +
      x.tube([86, 30, 46], [100, 31, 48], 5, G('verre'), null, '#c58a4a') + sansTrait(x.tube([36, 30, 40], [70, 32, 44], 7, b.c, null, null, ' opacity=".85"'));
    return {svg:s, bb:x.bb.slice(), R:R, w:120, h:40};
  }
  var m0 = surSol(b.x0, b.y0), m1 = surSol(b.x, b.y), R2 = repere([m1.X, 0, m1.Z], AXES_FACE, 80, 60), y = ajouterOutils3d(ctx3d(R2, false));
  y.p = 60; y.cat = {w:80, h:60};
  /* le fil de laine qui serpente depuis l'endroit où le chat l'a prise */
  var A = y.Q(40, 60, 30), pts = [];
  for(var i = 0; i <= 10; i++){ var tt = i / 10, X = m1.X + (m0.X - m1.X) * tt, Z = m1.Z + (m0.Z - m1.Z) * tt, W = proj(X + Math.sin(tt * 9) * 30, 0, Z + Math.cos(tt * 7) * 14); pts.push([40 + (W[0] - R2.A[0]) / R2.k, 60 + (W[1] - R2.A[1]) / R2.k]); }
  var s2 = T(lisse(pts, false), b.c, 4) + y.boule(40, 34, 30, 22, b.c) + y.sur(T('M24,26 C34,20 46,22 56,30 M22,38 C34,32 48,34 58,42', sombre(b.c, 0.3), 2.5), 8);
  pts.forEach(function(q){ y.bb[0] = Math.min(y.bb[0], q[0]); y.bb[1] = Math.min(y.bb[1], q[1]); y.bb[2] = Math.max(y.bb[2], q[0]); y.bb[3] = Math.max(y.bb[3], q[1]); });
  return {svg:s2, bb:y.bb.slice(), R:R2, w:80, h:60};
}
function dessinerBetises(V, neuf){
  (V.elB || []).forEach(function(e){ e.remove(); });
  V.elB = [];
  V.etat.betises.filter(function(b){ return b.t !== 'tabouret' && (b.pc ? 1 : 0) === V.salle; }).forEach(function(b){
    /* (une zone de toucher d'au moins 120 unités : un doigt d'enfant la touche facilement) */
    var D = dessinBetise(b), bb = D.bb, cx = (bb[0] + bb[2]) / 2, cy = (bb[1] + bb[3]) / 2, hw = Math.max(60, (bb[2] - bb[0]) / 2 + 16), hh = Math.max(60, (bb[3] - bb[1]) / 2 + 16);
    var bx = [cx - hw, cy - hh, cx + hw, cy + hh], bw = bx[2] - bx[0], bh = bx[3] - bx[1], A = D.R.A, k = D.R.k;
    var d = document.createElement('div');
    d.className = 'at-fixe at-touche at-betise'; d.setAttribute('data-at', 'betise'); d.setAttribute('data-b', b.id);
    d.setAttribute('role', 'button'); d.setAttribute('aria-label', b.t === 'fiole' ? 'Ramasser la fiole' : 'Rembobiner la pelote');
    d.innerHTML = '<svg viewBox="' + [bx[0], bx[1], bw, bh].map(f1).join(' ') + '" overflow="visible" aria-hidden="true"><rect x="' + f1(bx[0]) + '" y="' + f1(bx[1]) + '" width="' + f1(bw) + '" height="' + f1(bh) + '" rx="' + f1(Math.min(bw, bh) / 3) + '" fill="transparent"/>' + D.svg + '</svg>';
    d.style.left = pX(V, A[0] + bx[0] - D.w / 2); d.style.top = pY(V, A[1] + bx[1] - D.h);
    d.style.width = pW(V, bw); d.style.height = pH(V, bh);
    d.style.transformOrigin = ((D.w / 2 - bx[0]) / bw * 100).toFixed(2) + '% ' + ((D.h - bx[1]) / bh * 100).toFixed(2) + '%';
    d.style.setProperty('--s', k.toFixed(3));
    d.style.zIndex = Math.round((1000 + A[1]) * 5);
    d._s = k;
    V.scene.appendChild(d);
    V.elB.push(d);
    if(neuf === b.id) anim(d, [{transform:'translateY(-' + Math.round(160 * V.k) + 'px) scale(' + k + ') rotate(-40deg)', opacity:0.4}, {transform:'translateY(0) scale(' + k + ')', opacity:1}], {duration:520, easing:'ease-in'});
  });
}
function reparerBetise(V, id){
  var b = V.etat.betises.filter(function(x){ return x.id === id; })[0], d = (V.elB || []).filter(function(e){ return e.getAttribute('data-b') === id; })[0];
  if(!b) return;
  V.etat.betises = V.etat.betises.filter(function(x){ return x !== b; });
  if(d) anim(d, [{transform:'scale(' + d._s + ')', opacity:1}, {transform:'translateY(-' + Math.round(140 * V.k) + 'px) scale(' + d._s * 0.6 + ')', opacity:0}], {duration:450, easing:'ease-in', fill:'forwards'});
  apres(V, 460, function(){ if(d) d.remove(); });
  var t = b.t === 'fiole' ? 'La fiole est remise à sa place !' : 'La pelote est rembobinée !';
  toast(V, '<b>' + (b.t === 'fiole' ? '🧪' : '🧶') + ' ✔</b> ' + esc(t), 2400, t);
  son(V, 'magie');
  changer(V);
}

/* ---------- Le chaton (à partir de l'enquête 4), puis Mimi part vivre chez Odette ---------- */
function portee(V, dt, moment){
  var t = tama(V), P = t.portee;
  if(enqueteNo(V) < PORTEE.enquete || P.phase >= 3) return;
  var meres = chatsTous(V).filter(function(o){ return !o.chaton; });
  if(!meres.length) return;
  var mere = meres[0];
  if(P.phase === 0){ P.phase = 1; P.t = 0; mere.ronde = 1; majHumeur(V, mere);
    if(salleDe(mere) === V.salle){ var t0 = nomChat(mere) + ' a un gros ventre tout rond… il va se passer quelque chose !'; toast(V, '<b>🐈 ✨</b> ' + esc(t0), 5000, t0); }
    changer(V); return; }
  P.t += dt;
  /* (les grands moments se passent sous les yeux de l'enfant : la pièce du chat est à l'écran) */
  var vu = salleDe(mere) === V.salle && V.mode === 'ranger' && !moment;
  if(P.phase === 1 && P.t >= PORTEE.naissance && vu){ naissance(V, mere); P.phase = 2; P.t = 0; changer(V); return; }
  if(P.phase === 2){
    chatsTous(V).forEach(function(c){
      if(!c.chaton) return;
      var tl = Math.round(Math.min(0.86, 0.68 + 0.18 * P.t / PORTEE.depart) * 100) / 100, stc = V.chats[c.id];
      if(tl !== c.taille){ c.taille = tl; if(V.elO[c.id] && !(stc && (stc.anim || stc.tenu))) placerEl(V, c); }     /* il grandit un peu */
    });
    if(P.t >= PORTEE.depart && vu){ departMere(V, mere); P.phase = 3; changer(V); }
  }
}
function naissance(V, mere){
  var pm = chatPos(V, mere), n = chatsTous(V).filter(function(o){ return o.chaton; }).length;
  V.etat.n++;
  var c = {id:'o' + V.etat.n, t:'chat', x:pm.x + 70, y:Math.min(solMax(V), pm.y + 30), f:0, v:(mere.v + 1) % 3, st:0, sur:null, chaton:1, taille:0.68, nom:PORTEE.chatons[n % PORTEE.chatons.length], b:{faim:90, soif:90, amour:60, jeu:50, dodo:90}};
  if(mere.pc === 1) c.pc = 1;
  if(mere.sur){ c.x = 600; c.y = 760; }
  mere.ronde = 0;
  V.etat.objets.push(c);
  V.parId[c.id] = c;
  var d = elObjet(V, c);
  V.scene.appendChild(d);
  placerEl(V, c);
  anim(d, [{transform:'scale(' + d._s * 0.2 + ')', opacity:0}, {transform:'scale(' + d._s * 1.15 + ')', opacity:1, offset:0.6}, {transform:'scale(' + d._s + ')'}], {duration:700, easing:'ease-out'});
  majHumeur(V, mere); majHumeur(V, c);
  coeursChat(V, mere); coeursChat(V, c);
  var F = cadreObjet(V, c.id); if(F) allerVers(V, F.x, F.y - 60);
  var t = 'Un chaton est né ! Il s\'appelle ' + c.nom + '. Il a besoin de toi, lui aussi.';
  toast(V, '<b>🐈 💕 🐱</b> ' + esc(t), 6500, t);
  son(V, 'magie');
  chatsDemarrer(V);
}
/* Le départ de Mimi : elle fait au revoir de la patte, puis elle s'en va par la porte (elle vivra chez Odette) */
function departMere(V, mere){
  var st = chatEtat(V, mere), d = V.elO[mere.id];
  if(st.anim){ var a = st.anim; st.anim = null; try{ a.cancel(); }catch(e){} }
  if(st.t){ clearTimeout(st.t); st.t = null; }
  st.tenu = true; st.depart = true;
  chatPose(V, mere, 'salut');
  if(d) d.querySelector('.at-bulle') && (d.querySelector('.at-bulle').hidden = true);
  var t = nomChat(mere) + ' part vivre chez Odette. Tu pourras lui rendre visite au village !';
  toast(V, '<b>🐈 👋 👵</b> ' + esc(t), 8000, t);
  coeursChat(V, mere);
  V.etat.chezOdette.push({nom:nomChat(mere), v:mere.v || 0, enquete:enqueteNo(V), acc:mere.acc ? JSON.parse(JSON.stringify(mere.acc)) : {}});
  /* dans l'état, elle vit déjà chez Odette (même si l'atelier se ferme pendant ses adieux) ; à l'écran, elle dit au revoir puis elle sort */
  var p = chatPos(V, mere);
  V.etat.objets = V.etat.objets.filter(function(o){ return o !== mere; });
  V.etat.objets.forEach(function(o){ if(o.sur && o.sur.o === mere.id) o.sur = null; });
  delete V.parId[mere.id];
  apres(V, 3800, function(){
    var porte = V.salle ? {x:-40, y:640} : {x:PORTE.x, y:SOL_Y + 30};
    if(d) anim(d, [{transform:'translate(0,0) scale(' + d._s + ')', opacity:1}, {transform:'translate(' + ((porte.x - p.x) * V.k).toFixed(0) + 'px,' + ((porte.y - p.y) * V.k).toFixed(0) + 'px) scale(' + (d._s * 0.7) + ')', opacity:0}], {duration:2200, easing:'ease-in', fill:'forwards'});
    apres(V, 2250, function(){
      if(V.elO[mere.id] === d) delete V.elO[mere.id];
      delete V.chats[mere.id];
      if(d) d.remove();
    });
  });
}

/* ---------- Ce qu'il a envie de faire (appelé par chatAgir) : ses besoins d'abord ; le chaton a ses jeux à lui ---------- */
function chatArreter(V, o){
  var st = chatEtat(V, o), a = st.anim, mv = st.mv;
  if(!a || (mv && mv.mode === 'saute')) return false;
  var f = mv && typeof a.currentTime === 'number' ? borne(a.currentTime / mv.dur, 0, 1) : 1;
  st.anim = null;
  try{ a.cancel(); }catch(e){}
  if(mv && !(st.pos && st.pos.sur)) st.pos = {x:mv.p0.x + (mv.p1.x - mv.p0.x) * f, y:mv.p0.y + (mv.p1.y - mv.p0.y) * f, sur:null};
  placerEl(V, o);
  var d = V.elO[o.id];
  if(d) d.style.zIndex = Math.round(chatPos(V, o).z * 5);
  chatPose(V, o, 'assis');
  return true;
}
function miaou(V, o){
  var u = besoinUrgent(o);
  flotter(V, o, (u ? u.ic + ' ' : '') + 'Miaou !');
  son(V, 'bulle');
}
function tamaAgir(V, o){
  var u = besoinUrgent(o);
  if(u && Math.random() < 0.75){
    var g = u.k === 'faim' ? gamellePleine(V, o, 'gamelle') : u.k === 'soif' ? gamellePleine(V, o, 'eau') : null;
    if(g){ chatVaManger(V, o, g, u.k); return true; }
    if(u.k === 'dodo'){ chatVaDormir(V, o); return true; }
    if(Math.random() < 0.45){ chatPose(V, o, 'assis'); miaou(V, o); chatPlanifier(V, o, 4200); return true; }   /* il demande */
  }
  if(o.chaton && Math.random() < 0.45) return chatonJoue(V, o);
  return false;
}
/* Les bêtises du chaton : il court après sa queue, il suit sa maman, il bondit sur une ombre */
function chatonJoue(V, o){
  var r = Math.random(), d = V.elO[o.id], p = chatPos(V, o);
  if(r < 0.35 && d){
    chatPose(V, o, 'marche'); d.classList.add('at-c-tourne');
    apres(V, 1700, function(){ d.classList.remove('at-c-tourne'); chatPose(V, o, 'assis'); });
    chatPlanifier(V, o, 2600);
    return true;
  }
  var mere = chatsDe(V).filter(function(c){ return !c.chaton; })[0];
  if(r < 0.7 && mere){
    var pm = chatPos(V, mere);
    chatAller(V, o, chatSol(V, pm.x + (pm.x > 600 ? -90 : 90), Math.max(SOL_MIN + 40, pm.y)), function(){ chatPose(V, o, 'lave'); chatPlanifier(V, o, 2500 + Math.random() * 2000); });
    return true;
  }
  var cible = chatSol(V, p.x + (Math.random() < 0.5 ? -110 : 110), p.y + (Math.random() - 0.5) * 40);
  chatBouger(V, o, cible, 'saute', function(){ chatPose(V, o, 'assis'); chatPlanifier(V, o, 1800 + Math.random() * 1500); });
  return true;
}
/* Une sieste : souvent dans un de ses coins (le panier, le lit, le pouf, l'arbre à chat…) */
function chatSieste(V, o){
  var l = surfacesChat(V).filter(function(sf){ var par = V.parId[sf.sur.o]; return par && DODO_ICI.test(par.t); });
  if(!l.length || Math.random() < 0.35) return false;
  var c = l[Math.floor(Math.random() * l.length)], st = chatEtat(V, o);
  chatAller(V, o, c, function(){
    chatPose(V, o, 'dort');
    st.dortJusqua = Date.now() + 12000 + Math.random() * 9000;
    chatPlanifier(V, o, st.dortJusqua - Date.now() + 30);
  });
  return true;
}
/* Pour le village : qui vit chez Odette (et ce qu'elle en dit) */
function chezOdette(etat){ return ((etat && etat.chezOdette) || []).map(function(c){ return {nom:c.nom, v:c.v, enquete:c.enquete, acc:c.acc || {}}; }); }
function repliqueOdette(etat){
  var l = chezOdette(etat);
  if(!l.length) return null;
  var n = l[0].nom;
  return {q:REPLIQUE_ODETTE.q.replace('%n', n), a:REPLIQUE_ODETTE.a.replace('%n', n), chat:n, v:l[0].v};
}
