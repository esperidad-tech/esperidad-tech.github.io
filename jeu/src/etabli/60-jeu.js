
/* ============ L'établi vivant : ce qu'on touche, ce qui bouge ============
   Une seule grammaire, pour tout :
   · on touche une plante du linge : on s'approche (un zoom de la même image), et on touche la partie qu'il faut (feuilles, fleurs, graines…) ;
   · on touche un outil : ce qu'on prépare s'y pose. On retouche l'outil : il travaille (le couteau hache, le pilon écrase, la vis serre,
     la cuillère tourne…). Le bocal à filtrer, le séchoir et les fioles travaillent tout seuls, dès qu'on y pose quelque chose ;
   · la cruche, l'huile, une bûche, une allumette : on la touche (on la tient), puis on touche l'endroit où la verser, la poser, l'allumer.
     Le feu, c'est donc le joueur qui le choisit : pas de bûche, une bûche (feu doux), deux bûches (feu fort), allumé ou pas ;
   · jamais d'échec : un geste qui n'est pas dans la recette donne ce que ça donnerait pour de vrai (une petite phrase), et la matière
     reste comme elle était. Une mauvaise partie de la plante : la plante revient entière.
   S : l'état. plante, partie, n (les étapes faites), ou (où est la matière : 'linge' ou un outil), pos ('entree' / 'sortie' de l'outil),
   m ({nom, c, f} : ce que c'est devenu), H (ce qu'on tient), feux, liq, faites, dispo. */
var S = null, CAM = {cx:600, cy:320, z:1}, bulleT = 0, inviteT = 0;
var HAUT = {alambic:246, marmite:196, presse:224, sechoir:140, fiole:116, mortier:132, tamis:88, filtre:106, planche:74, cruche:110, huilier:120, buches:104, allumettes:62, sac:108, livre:176};
function neuf(){
  S = {plante:null, partie:null, n:0, ou:null, pos:'entree', m:null, faitIci:false, H:null, feux:{marmite:{b:0, allume:false}, alambic:{b:0, allume:false}}, liq:{marmite:null, alambic:null},
    mode:null, occupe:false, faites:{}, dispo:{}, restes:{}, presseBas:false, aDire:[], page:null, nuit:false, sac:null, donjon:false, posee:null, pagesVues:{}, trouvees:{}, stock:null, plus:{}};
}
function recette(){ return S.plante ? RE[PL[S.plante].potion] : null; }
function pos(x, y, w, h){ return 'left:calc(' + f1(x) + '*var(--u));top:calc(' + f1(y) + '*var(--u));width:calc(' + f1(w) + '*var(--u));height:calc(' + f1(h) + '*var(--u))'; }
function borne(v, a, b){ return Math.max(a, Math.min(b, v)); }
function svgEl(html){ var g = document.createElementNS('http://www.w3.org/2000/svg', 'g'); g.innerHTML = html; return g; }
function nbFaites(){ return ORDRE.filter(function(id){ return S.faites[id]; }).length; }
function toutesFaites(){ return nbFaites() === ORDRE.length; }
/* les pages du grimoire : une par plante trouvée (cueillie, ou déjà en potion) ; celles qu'on n'a pas encore lues */
function connues(){ return TOUTES.filter(function(id){ var k = RE[id].plante; return S.dispo[k] > 0 || S.faites[id] || S.trouvees[k]; }); }
function nouvellesPages(){ return connues().filter(function(id){ return !S.pagesVues[id]; }); }
/* Une plante pendue à la tringle : on la touche, hop, elle vient en grand sur le linge. Une seule plante sur le linge à la fois : celle
   qui y était retourne se pendre (Romain, 12 novembre, 13 h 52). */
function decrocher(k){
  if(S.occupe || S.mode || !PL[k] || !(S.dispo[k] > 0) || S.posee === k) return;
  if(S.partie){ son('non'); secouer($('#pendue-' + k)); bulle(TRI.x0 + surTringle().indexOf(k)*TRI.pas, TRI.yTr + 96, DIT.uneChose, 'oups'); return; }
  poser(); enleverBulle(); S.plante = null; S.posee = k; son('pose');
  majPendues(); majPlantes(); majEtat();
  var g = $('#plante-' + k), c = g && g.querySelector('.corps');
  if(c && !reduit) tween(340, function(p){
    var e = 1 - (1 - p)*(1 - p);
    c.setAttribute('transform', trPlante(k, -110*(1 - e), APLAT + (1 - APLAT)*(1 - e))); c.setAttribute('opacity', f1(.35 + .65*e));
  }, function(){ c.removeAttribute('opacity'); c.setAttribute('transform', trPlante(k)); });
  garder();
}
/* (la maquette, sans atelier ni porte : la tringle se regarnit toute seule, trois plantes à la fois) */
function regarnir(){
  if(!S.stock) return;
  var n = TOUTES_PL.filter(function(k){ return S.dispo[k] > 0 && !S.faites[PL[k].potion]; }).length;
  S.stock = S.stock.filter(function(k){ if(S.faites[PL[k].potion] || S.dispo[k] > 0) return false; if(n < TRI.n){ S.dispo[k] = 1; n++; return false; } return true; });
}

/* ---------- La caméra, les gros plans ---------- */
function camera(cx, cy, z){
  CAM = {cx:cx, cy:cy, z:z};
  $('#decor').style.transform = 'translate(calc(' + f1((600 - cx)*z) + '*var(--u)), calc(' + f1((320 - cy)*z) + '*var(--u))) scale(' + z + ')';
}
function ouvrirMode(nom, html){
  enleverBulle();
  S.mode = nom; $('#hudBoite').innerHTML = html || ''; $('#modeHaut').hidden = false; $('#cadre').classList.add('ouvert'); document.body.classList.add('ouvert');
  document.body.className = document.body.className.replace(/\bm-\w+/g, '').trim() + ' m-' + nom;
}
function fermerMode(){
  if(!S.mode) return;
  var m = S.mode;
  S.mode = null; $('#hudBoite').innerHTML = ''; $('#modeHaut').hidden = true; $('#cadre').classList.remove('ouvert'); document.body.classList.remove('ouvert');
  document.body.className = document.body.className.replace(/\bm-\w+/g, '').trim();
  if(m === 'plante'){ camera(600, 320, 1); son('dezoom'); majPlantes(); } else son('clic');
  majEtat();
}

/* ---------- Les classes du corps : ce qui appelle le doigt ---------- */
function majEtat(){
  var b = document.body, m = !!S.partie, h = !!S.H;
  b.classList.toggle('e-choisir', !m && !h); b.classList.toggle('e-matiere', m && !h); b.classList.toggle('e-tenir', h); b.classList.toggle('occupe', !!S.occupe);
  OUTILS_SC.forEach(function(o){ var g = $('#g-' + o); if(g) g.classList.toggle('ici', m && S.ou === o && !AUTO[o] && !S.occupe); });
  [['buches', 'buche'], ['allumettes', 'allumette'], ['cruche', 'cruche'], ['huilier', 'huilier']].forEach(function(q){ var g = $('#g-' + q[0]); if(g) g.classList.toggle('tenu', S.H === q[1]); });
  var fa = $('#flammeAll'); if(fa) fa.style.display = S.H === 'allumette' ? '' : 'none';
  var sc = $('#portique'); if(sc) sc.classList.toggle('appel', !!(toutesFaites() && S.sac && !S.sacVu));
}
/* une invitation : pendant deux secondes, tous les outils montrent qu'on peut y poser la matière */
function inviter(){ document.body.classList.add('invite'); clearTimeout(inviteT); inviteT = setTimeout(function(){ document.body.classList.remove('invite'); }, 2600); }
function occupe(v){ S.occupe = !!v; majEtat(); }

/* ---------- Les bulles : de petites phrases posées sur l'établi ---------- */
function nbMots(t){ return String(t).split(/\s+/).filter(function(m){ return /[A-Za-zÀ-ÿ0-9]/.test(m); }).length; }
function avecSon(el, t){
  if(nbMots(t) <= 3) return;
  var b = document.createElement('button'); b.type = 'button'; b.className = 'b-son'; b.setAttribute('aria-label', 'Écouter'); b.textContent = '🔊'; el.appendChild(b); el.classList.add('avec-son');
  b.addEventListener('click', function(e){ e.stopPropagation(); el.dataset.garde = '1'; lire(t); clearTimeout(el._t); el._t = setTimeout(function(){ el.remove(); }, 9000); });
}
function enleverBulle(){ var b = $('#calque .bulle-o'); if(b) b.remove(); clearTimeout(bulleT); }
function bulle(x, y, t, sorte, ms){
  var c = $('#calque'); enleverBulle();
  var b = document.createElement('div'); b.className = 'bulle-o' + (sorte ? ' ' + sorte : '') + (y < 120 ? ' dessous' : ''); b.setAttribute('role', 'status');
  var sp = document.createElement('span'); sp.textContent = t; b.appendChild(sp);
  b.style.left = borne(x/12, 3, 97) + '%'; b.style.top = (y/6.4) + '%'; c.appendChild(b); avecSon(b, t);
  /* jamais coupée par un bord de l'écran : on la décale, et sa petite pointe reste sur ce qu'elle montre */
  b.style.animation = 'none';   /* (on la mesure à sa vraie taille, pas au début de son petit rebond) */
  var r = b.getBoundingClientRect(), W = window.innerWidth, dx = 0, dy = 0;
  if(r.left < 8) dx = 8 - r.left; else if(r.right > W - 8) dx = W - 8 - r.right;
  if(r.top < 8) dy = 8 - r.top;
  if(dx || dy){ b.style.marginLeft = dx + 'px'; b.style.marginTop = dy + 'px'; b.style.setProperty('--queue', borne(r.width/2 - dx, 18, r.width - 18) + 'px'); }
  b.style.animation = '';
  bulleT = setTimeout(function(){ if(!b.dataset.garde) b.remove(); }, ms || Math.max(3400, 1700 + t.length*62));
  return b;
}
function hautDe(o){ var q = OU[o]; return {x:q.x, y:Math.max(96, q.y - (HAUT[o] || 100)*q.e - 2)}; }
function bulleOutil(o, t, sorte, ms){ var p = hautDe(o); if(o === 'alambic') p.x += 40; if(o === 'presse') p.x += 8; return bulle(p.x, p.y, t, sorte, ms); }
function secouer(g){ if(!g) return; g.classList.remove('secoue-svg'); void g.getBoundingClientRect(); g.classList.add('secoue-svg'); setTimeout(function(){ g.classList.remove('secoue-svg'); }, 500); }
/* ---------- Ce qui vole d'un endroit à l'autre, les petits effets ---------- */
function voler(html, a, b, dur, haut, fin, ech){
  var g = svgEl(html); $('#vol').appendChild(g);
  tween(dur, function(p){ var k = ech ? ech[0] + (ech[1] - ech[0])*p : 1; g.setAttribute('transform', 'translate(' + f1(a.x + (b.x - a.x)*p) + ',' + f1(a.y + (b.y - a.y)*p - Math.sin(p*Math.PI)*(haut || 0)) + ') scale(' + k.toFixed(3) + ')'); }, function(){ g.remove(); if(fin) fin(); });
  return g;
}
function eclats(x, y, c, n, vers){
  var g = svgEl(''), i, L = []; $('#effets').appendChild(g);
  for(i = 0; i < (n || 6); i++){ var a = Math.random()*Math.PI*2, d = 14 + Math.random()*26; L.push([Math.cos(a)*d, (vers === 'bas' ? Math.abs(Math.sin(a))*d + 12 : -Math.abs(Math.sin(a))*d - 6)]); g.insertAdjacentHTML('beforeend', '<circle r="' + f1(1.8 + Math.random()*2.2) + '" fill="' + c + '" stroke="' + K + '" stroke-width=".8"/>'); }
  var cs = g.querySelectorAll('circle');
  tween(520, function(p){ cs.forEach(function(e, i){ e.setAttribute('cx', f1(x + L[i][0]*p)); e.setAttribute('cy', f1(y + L[i][1]*p + (vers === 'bas' ? 0 : 30*p*p))); e.setAttribute('opacity', f1(1 - p*p)); }); }, function(){ g.remove(); });
}
function nuagePouf(x, y, c, grand){
  var g = svgEl(''), i, n = grand ? 9 : 5; $('#effets').appendChild(g);
  for(i = 0; i < n; i++) g.insertAdjacentHTML('beforeend', '<circle cx="' + f1(x + (i - n/2)*9) + '" cy="' + f1(y) + '" r="' + f1(8 + Math.random()*8) + '" fill="' + (c || '#d8d2e4') + '" opacity=".8"/>');
  var cs = g.querySelectorAll('circle');
  tween(grand ? 1300 : 800, function(p){ cs.forEach(function(e, i){ e.setAttribute('cy', f1(y - p*(26 + i*7))); e.setAttribute('r', f1((8 + i*1.2)*(1 + p*1.2))); e.setAttribute('opacity', f1(.8*(1 - p))); }); }, function(){ g.remove(); });
}
function etoiles(x, y, n){
  var c = $('#calque'), i;
  for(i = 0; i < (n || 7); i++){ var e = document.createElement('span'); e.className = 'etoile-f'; e.textContent = i % 2 ? '✨' : '⭐'; var a = i/(n || 7)*Math.PI*2; e.style.cssText = 'left:' + (x/12) + '%;top:' + (y/6.4) + '%;--dx:' + Math.round(Math.cos(a)*90) + 'px;--dy:' + Math.round(Math.sin(a)*70 - 20) + 'px;animation-delay:' + (i*40) + 'ms'; c.appendChild(e); (function(e){ setTimeout(function(){ e.remove(); }, 1300); })(e); }
}
/* le petit sablier qui tourne au-dessus de ce qui prend du temps (tremper, sécher, cuire) */
function sablier(o, dur){
  var p = o === 'sechoir' ? pt(o, -10, -78) : o === 'alambic' ? pt(o, 64, -262) : pt(o, 0, -214), g = svgEl('<circle r="19" fill="#fff6d8" stroke="' + K + '" stroke-width="3"/><g class="sab"><path d="M-7,-10 H7 L1,0 L7,10 H-7 L-1,0 Z" fill="#f5b945" stroke="' + K + '" stroke-width="2" stroke-linejoin="round"/></g>');
  g.setAttribute('transform', 'translate(' + f1(p.x) + ',' + f1(p.y) + ')'); $('#effets').appendChild(g);
  var sb = g.querySelector('.sab'); tween(dur, function(p2){ sb.setAttribute('transform', 'rotate(' + f1(p2*540) + ')'); }, function(){ g.remove(); });
}

/* ---------- Choisir une plante, puis sa partie ---------- */
function lacher(){
  var o = S.ou;
  S.partie = null; S.n = 0; S.ou = null; S.pos = 'entree'; S.m = null; S.faitIci = false; S.presseBas = false; S.restes = {};
  S.liq = {marmite:null, alambic:null};
  if(o && o !== 'linge' && ART[o]) majOutil(o);
  ['presse', 'tamis', 'filtre', 'marmite', 'alambic'].forEach(majOutil);
}
function choisirPlante(k){
  if(S.occupe || S.mode) return;
  var p = PL[k], c = centrePlante(k);
  poser();
  if(S.faites[p.potion]){ son('clic'); bulle(c.x, c.y - 34, DIT.dejaPotion); return; }
  if(!(S.dispo[k] > 0)){ son('clic'); bulle(c.x, c.y - 30, DIT.pasCueillie); return; }
  if(S.partie && S.plante !== k && S.n > 0){ son('non'); secouer($('#plante-' + k)); bulle(c.x, c.y - 34, DIT.uneChose, 'oups'); return; }
  if(S.partie) lacher();
  S.plante = k; garder();
  son('plante');
  ouvrirMode('plante', '<div class="ruban-p" style="' + pos(250, 22, 700, 0) + ';height:auto"><b></b><span></span></div>');
  var rb = $('#hudBoite .ruban-p'); rb.querySelector('b').textContent = p.nom; rb.querySelector('span').textContent = p.arrive; avecSon(rb, p.nom + '. ' + p.arrive);
  S.posee = k; majPendues(); majPlantes(); camera(c.x, c.y + 6, 2.1); son('zoom'); majEtat();
}
function prendre(pa){
  var p = PL[S.plante], d = p.parties[pa]; if(!d) return;
  S.partie = pa; S.n = 0; S.ou = 'linge'; S.pos = 'entree'; S.m = {nom:d.nom, c:d.c, f:d.s}; S.faitIci = false;
  son('partie'); fermerMode(); garder();
  var c = centrePlante(S.plante); bulle(c.x, c.y - 38, d.nom); inviter();
}

/* ---------- Porter la matière d'un endroit à l'autre ---------- */
function ouEst(){ if(S.ou === 'linge' || !S.ou){ var c = centrePlante(S.plante); return {x:c.x, y:c.y}; } return ptFente(S.ou, S.pos === 'sortie' ? 'sortie' : 'entree'); }
function deplacer(o){
  var a = ouEst(), b = ptFente(o, 'entree'), m = S.m, avant = S.ou;
  occupe(true); enleverBulle();
  S.ou = null; S.faitIci = false; if(avant === 'presse') S.presseBas = false;
  if(avant === 'linge') majPlantes(); else if(avant) majOutil(avant);
  son('clic');
  voler('<g transform="scale(' + (OU[o].e*1.05).toFixed(2) + ')">' + spriteM(m, 'vol') + '</g>', a, b, 430, 60, function(){
    S.ou = o; S.pos = 'entree'; son(m.f === 'jus' ? 'goutte' : 'pose'); majOutil(o); majPlantes(); occupe(false); garder();
    if(AUTO[o]) agir(o);
  });
}

/* ---------- Faire travailler un outil ---------- */
function agir(o){
  var r = recette(), e = r.etapes[S.n], p = PL[S.plante], mauvaise = S.partie !== r.partie, ok = !mauvaise && bonGeste(e, o), cas = casDe(o);
  if(S.faitIci && !(e && e.o === o && !e.verse)){ son('clic'); bulleOutil(o, DIT.dejaFait); return; }
  /* une marmite ou un alambic où il n'y a ni liquide ni feu : rien ne se passe, on ne perd rien (on n'a pas fini de préparer) */
  occupe(true); enleverBulle();
  var res = ok ? (S.n === r.etapes.length - 1 ? {c:r.coul, f:'jus', fin:true} : {c:e.c, f:e.f}) : null;
  ANIM[o](res, cas, function(){
    var feu = cas && cas.feu !== 'froid';
    if(feu){ S.feux[o] = {b:0, allume:false}; }
    if(ok) reussir(o, e, r);
    else {
      var t = mauvaise ? (p.parties[S.partie].faux || GEN[o].solide) : phraseFaux(r, S.n, o, S.m);
      son(/Pouf|Pff/.test(t) ? 'pouf' : (feu && /grill|brûl|fume/.test(t)) ? 'grille' : 'non');
      var q = ptFente(o, 'entree'); if(/Pouf/.test(t)) nuagePouf(q.x, q.y - 10, '#a88a64', true); else nuagePouf(q.x, q.y - 6, '#e4dcec');
      if(mauvaise){ lacher(); majPlantes(); } else { S.presseBas = false; majOutil(o); }
      occupe(false); garder();
      bulleOutil(o, t, 'oups');
    }
  });
}
function reussir(o, e, r){
  var id = PL[S.plante].potion, suivante = r.etapes[S.n + 1];
  S.n++;
  if(S.n >= r.etapes.length){ finir(id, e); return; }
  /* ce qui reste dans l'outil (les coques sur le tamis, le tourteau dans le pressoir, les miettes sur le tissu) */
  if(o === 'tamis' || o === 'presse' || o === 'filtre') S.restes[o] = sombre(S.m.c, .25);
  S.m = {nom:e.m, c:e.c, f:e.f}; S.pos = FENTE[o].sortie ? 'sortie' : 'entree'; S.faitIci = true;
  if(o === 'marmite' || o === 'alambic'){ if(!(suivante && suivante.o === o)) S.liq[o] = null; }
  majOutil(o); occupe(false); garder();
  son('bien'); bulleOutil(o, e.t, 'bien'); inviter();
}
function finir(id, e){
  var r = RE[id], k = S.plante;
  S.faites[id] = 1; if(S.dispo[k] > 0) S.dispo[k]--; if(S.posee === k) S.posee = null; regarnir();
  S.partie = null; S.n = 0; S.ou = null; S.m = null; S.pos = 'entree'; S.faitIci = false; S.plante = null; S.restes = {}; S.presseBas = false;
  S.aDire.push(id); dire('finie', {id:id}); garder();
  majTout(); occupe(false); majQuitter();
  /* (une potion en plus des sept, le givre : pas de « tout est prêt », mais son code pour le Pisteur, sur sa carte) */
  var toutes = !enPlus(id) && nbFaites() === ORDRE.length;
  son(toutes ? 'toutes' : 'potion');
  var qp = placePotion(id); etoiles(qp.x, qp.y - 32, 8);
  /* la potion a rejoint l'étagère : une carte la montre en grand, avec ce qui est vrai (on apprend quelque chose à chaque potion) */
  occupe(true);
  attendre(850, function(){ occupe(false); ouvrirPrete(id, e.t, toutes); });
}

/* ---------- Les animations des outils : ANIM[outil](res, cas, fin) — res : ce que ça donne ({c, f}), ou rien si le geste n'est pas le bon ---------- */
function matiereG(o){ var g = $('#g-' + o); return g ? g.querySelector('.matiere') : null; }
function changerMatiere(o, f, c, facon){ var m = matiereG(o); if(m) m.innerHTML = spriteM({f:f, c:c}, facon || FENTE[o].entree[2]); }
function fondre(o){ var m = matiereG(o); if(m) tween(300, function(p){ m.setAttribute('opacity', f1(1 - p)); }); }
function gouttes(el, n, pas, chaque){ var i = 0; (function une(){ if(i++ >= n) return; el.setAttribute('opacity', 1); son('goutte'); tween(pas*.7, function(p){ el.setAttribute('transform', 'translate(0,' + f1(p*18) + ')'); }, function(){ el.setAttribute('opacity', 0); el.removeAttribute('transform'); if(chaque) chaque(i); attendre(pas*.3, une); }); })(); }
var ANIM = {
  /* le couteau vient au-dessus du tas et hache : tac, tac, tac, tac, tac, tac */
  planche:function(res, cas, fin){
    var c = $('#couteauT'), f = FENTE.planche.entree, x1 = f[0] + 78, y1 = f[1] - 4, n = 0, q = pt('planche', f[0], f[1]), coul = S.m.c, fam = famille(S.m);
    function met(x, y, a){ c.setAttribute('transform', 'translate(' + f1(x) + ',' + f1(y) + ') rotate(' + f1(a) + ')'); }
    tween(240, function(p){ met(52 + (x1 - 52)*p, -50 + (y1 + 50)*p, -3 + 21*p); }, function coup(){
      if(n >= 6) return tween(240, function(p){ met(x1 + (52 - x1)*p, y1 + (-50 - y1)*p, 18 - 21*p); }, fin);
      n++;
      tween(80, function(p){ met(x1 - n*5 + 12, y1, 18 - 20*p); }, function(){
        son('hache'); eclats(q.x - n*4 + 10, q.y - 4, coul, 4);
        if(n === 3 && fam === 'solide') changerMatiere('planche', 'hache', coul);
        tween(110, function(p){ met(x1 - n*5 + 12, y1, -2 + 20*p); }, coup);
      });
    });
  },
  /* le tamis se secoue : ce qui est fin tombe dans la jatte */
  tamis:function(res, cas, fin){
    var t = $('#tamisT'), n = 0, q = pt('tamis', -6, -50), coul = res ? res.c : S.m.c;
    (function va(){
      if(n >= 7){ t.removeAttribute('transform'); return fin(); }
      n++; son('tamis'); if(res || famille(S.m) !== 'solide') eclats(q.x + (Math.random() - .5)*30, q.y, coul, 3, 'bas');
      tween(70, function(p){ t.setAttribute('transform', 'translate(' + f1((n % 2 ? 9 : -9)*p) + ',0)'); }, function(){ tween(70, function(p){ t.setAttribute('transform', 'translate(' + f1((n % 2 ? 9 : -9)*(1 - p)) + ',0)'); }, va); });
    })();
  },
  /* le pilon monte et retombe : ploc, ploc, ploc */
  mortier:function(res, cas, fin){
    var t = $('#pilonT'), n = 0, q = pt('mortier', 0, -52), coul = S.m.c, fam = famille(S.m);
    (function va(){
      if(n >= 5){ t.removeAttribute('transform'); return fin(); }
      n++;
      tween(110, function(p){ t.setAttribute('transform', 'translate(' + f1(4*p) + ',' + f1(-22*p) + ') rotate(' + f1(5*p) + ' -12 -56)'); }, function(){
        tween(70, function(p){ t.setAttribute('transform', 'translate(' + f1(4*(1 - p)) + ',' + f1(-22*(1 - p)) + ') rotate(' + f1(5*(1 - p)) + ' -12 -56)'); }, function(){
          son('pilon'); eclats(q.x, q.y, coul, 3); if(n === 3 && fam === 'solide') changerMatiere('mortier', 'pate', coul); attendre(60, va);
        });
      });
    })();
  },
  /* la manivelle tourne, la vis descend, et ça coule goutte à goutte dans le verre */
  presse:function(res, cas, fin){
    var man = $('#manivelleT'), mob = $('#presseMobile'), g = $('#gouttePr'), v = $('#verreLiq');
    son('presse'); attendre(520, function(){ son('presse'); });
    if(res){ g.setAttribute('fill', res.c); v.setAttribute('fill', res.c); }
    tween(1500, function(p){ man.setAttribute('transform', 'scale(' + f1(Math.cos(p*Math.PI*6)) + ',1)'); mob.setAttribute('transform', 'translate(0,' + f1(16*p) + ')'); }, function(){
      man.removeAttribute('transform'); S.presseBas = true; fondre('presse');
      if(!res) return attendre(200, fin);
      gouttes(g, 4, 230, function(i){ v.setAttribute('y', f1(4 - 7*i)); v.setAttribute('height', f1(7*i)); });
      attendre(4*230 + 150, fin);
    });
  },
  /* on verse sur l'étamine : le liquide passe, les miettes restent */
  filtre:function(res, cas, fin){
    var l = $('#bocalLiq'), q = pt('filtre', 0, -60);
    if(!res){ return attendre(500, fin); }
    son('filtre'); l.setAttribute('fill', res.c); fondre('filtre');
    tween(1100, function(p){ l.setAttribute('y', f1(8 - 48*p)); l.setAttribute('height', f1(50*p)); if(Math.random() < .25) eclats(q.x + (Math.random() - .5)*40, q.y, res.c, 1, 'bas'); }, fin);
  },
  /* le temps passe, à l'ombre : ça sèche */
  sechoir:function(res, cas, fin){
    var a = $('#airSec'); if(a) a.style.display = '';
    son('seche'); sablier('sechoir', 1700);
    var m = matiereG('sechoir'); if(m && res) attendre(900, function(){ changerMatiere('sechoir', res.f, res.c); });
    attendre(1750, function(){ if(a) a.style.display = 'none'; fin(); });
  },
  /* la cuillère tourne ; avec du feu, ça chauffe (tout doucement, ou à gros bouillons) ; sans feu, ça trempe */
  marmite:function(res, cas, fin){
    var c = $('#cuillere'), v = $('#vapMa'), chaud = cas.feu !== 'froid', fort = cas.feu === 'fort', sec = cas.liq === 'sec', q = pt('marmite', 0, -122), l = $('#liqMarmite'), dur = sec && !chaud ? 900 : 2300;
    if(chaud){ if(v) v.style.display = ''; son(sec ? 'grille' : fort ? 'bouillon' : 'mijote'); } else son(sec ? 'cuillere' : 'trempe');
    if(!(sec && !chaud)) sablier('marmite', dur);
    var bt = setInterval(function(){ son('cuillere'); if(chaud && !sec) eclats(q.x + (Math.random() - .5)*60, q.y, '#ffffff', fort ? 3 : 1); }, 480);
    var c0 = l ? l.getAttribute('fill') : null;
    tween(dur, function(p){ c.setAttribute('transform', 'rotate(' + f1(Math.sin(p*Math.PI*8)*11) + ' 22 -114) translate(' + f1(Math.sin(p*Math.PI*8)*-8) + ',0)'); if(res && l && c0) l.setAttribute('fill', melange(c0, res.c, p)); }, function(){
      clearInterval(bt); c.removeAttribute('transform'); if(v) v.style.display = 'none'; fin();
    });
  },
  /* le chapeau se referme ; la vapeur monte dans le col de cygne, refroidit dans le seau, et retombe goutte à goutte dans le vase */
  alambic:function(res, cas, fin){
    majAlambicFerme();
    var va = $('#vapAl'), g = $('#goutteAl'), v = $('#vaseLiq'), chaud = cas.feu !== 'froid';
    if(!chaud){ son('clic'); return attendre(700, fin); }
    /* (13 novembre : le givre) un jus qu'on distille tel quel, sans eau en plus, fait sa vapeur comme l'eau — quand c'est le bon geste */
    var vapeur = cas.liq === 'eau' || (!!res && cas.liq === 'jus');
    son(vapeur ? 'alambic' : 'grille'); if(va && vapeur) va.style.display = '';
    if(vapeur) sablier('alambic', 2600);   /* (le temps passe) */
    if(!res || !vapeur) return attendre(1600, function(){ if(va) va.style.display = 'none'; fin(); });
    g.setAttribute('fill', res.c); v.setAttribute('fill', res.c);
    attendre(700, function(){ gouttes(g, 6, 300, function(i){ v.setAttribute('y', f1(6 - 6*i)); v.setAttribute('height', f1(6*i)); }); });
    attendre(700 + 6*300 + 200, function(){ if(va) va.style.display = 'none'; fin(); });
  },
  /* la mise en fiole : par l'entonnoir, la fiole se remplit ; le bouchon ; puis elle va rejoindre l'étagère */
  fiole:function(res, cas, fin){
    var l = $('#fioleLiq'), q = pt('fiole', 0, -96), id = PL[S.plante].potion;
    if(!res || !res.fin){ return attendre(450, fin); }
    if(id === 'fumigene'){ son('pouf'); nuagePouf(q.x, q.y - 8, '#a88a64', true); }
    son('fiole'); l.setAttribute('fill', res.c); fondre('fiole');
    tween(900, function(p){ l.setAttribute('y', f1(-12 - 42*p)); l.setAttribute('height', f1(42*p)); }, function(){
      son('bouchon');
      var a = pt('fiole', 0, -30), b = placePotion(id);
      l.setAttribute('height', 0);
      voler('<g>' + flacon(id, res.c) + '</g>', a, b, 900, 90, fin, [.84, 1]);
    });
  }
};
/* (l'alambic refermé : le col de cygne retrouve sa place) */
function majAlambicFerme(){ var g = $('#g-alambic'); if(!g) return; var m = S.m; S.m = null; var ou = S.ou; S.ou = null; g.innerHTML = ART.alambic(); S.ou = ou; S.m = m; }

/* ---------- Toucher un outil ---------- */
function toucherOutil(o){
  if(S.occupe || S.mode) return;
  if(S.H) return appliquer(S.H, o);
  if(!S.partie){ son('nom'); bulleOutil(o, QUOI[o]); return; }
  if(S.ou !== o) return deplacer(o);
  agir(o);
}

/* ---------- Ce qu'on tient : la cruche, l'huile, une bûche, une allumette ---------- */
function poser(){ if(S.H){ S.H = null; majEtat(); } }
function tenir(h){
  if(S.occupe || S.mode) return;
  var g = {buche:'buches', allumette:'allumettes', cruche:'cruche', huilier:'huilier'}[h];
  if(S.H === h){ poser(); son('clic'); return; }
  if(h === 'huilier' && !S.faites.huile){ son('non'); secouer($('#g-huilier')); bulleOutil('huilier', QUOI.huilierVide, 'oups'); return; }
  S.H = h; son(h === 'allumette' ? 'allumette' : h === 'buche' ? 'buche' : 'clic'); majEtat();
  if(!S.vuH) S.vuH = {};
  if(!S.vuH[h]){ S.vuH[h] = 1; bulleOutil(g, QUOI[h]); } else enleverBulle();
}
function appliquer(h, o){
  var feuO = o === 'marmite' || o === 'alambic', f = feuO ? S.feux[o] : null, de = {buche:'buches', allumette:'allumettes', cruche:'cruche', huilier:'huilier'}[h];
  var a = pt(de, 0, -40), b = feuO ? pt(o, 0, h === 'cruche' || h === 'huilier' ? (o === 'marmite' ? -150 : -196) : -8) : ptFente(o, 'entree');
  S.H = null; majEtat(); enleverBulle();
  function dit(t, sorte){ bulleOutil(o, t, sorte); }
  if(h === 'buche'){
    if(!feuO){ son('non'); return dit(PORTE.buche.defaut, 'oups'); }
    if(f.b >= 2){ son('non'); return dit(DIT.plein); }
    occupe(true);
    voler('<g transform="scale(.7)">' + bucheArt(0, 0, -8, 1) + '</g>', a, b, 420, 70, function(){ f.b++; son('buche'); majOutil(o); occupe(false); dit(f.b === 1 ? DIT.buche1 : DIT.buche2); });
    return;
  }
  if(h === 'allumette'){
    if(!feuO){ son('non'); return dit((PORTE.allumette[o] || PORTE.allumette.defaut), 'oups'); }
    if(f.allume){ son('clic'); return dit(DIT.dejaFeu); }
    occupe(true);
    voler('<g>' + TT('M-16,10 L10,-6', '#e8c98a', 3.4, 3.6) + Cir(12, -7, 5, '#c0392b', ' stroke-width="2.4"') + '<path d="M12,-10 C6,-17 8,-25 12,-33 C16,-25 18,-17 12,-10 Z" fill="' + G('flamme') + '" stroke="#e8693c" stroke-width="2"/></g>', a, b, 460, 50, function(){
      occupe(false);
      if(f.b <= 0){ son('non'); return dit(DIT.sansBois, 'oups'); }
      f.allume = true; son('feu'); majOutil(o);
    });
    return;
  }
  /* la cruche ou l'huile : dans la marmite ou l'alambic, elle y reste ; sur les cristaux de sel d'oseille, l'eau les fait fondre */
  var liq = h === 'cruche' ? 'eau' : 'huile', r = S.partie ? recette() : null, e = r ? r.etapes[S.n] : null;
  /* (les cristaux fondent là où ils sont : dans le séchoir, mais aussi dans un bol, une marmite ou une fiole) */
  var verseOk = !!(e && e.verse === liq && S.ou === o && S.partie === r.partie && o !== 'planche' && o !== 'tamis' && o !== 'presse' && o !== 'filtre');
  if(!feuO && !verseOk){ son('non'); return dit((PORTE[h][o] || PORTE[h].defaut), 'oups'); }
  if(feuO && h === 'huilier' && o === 'alambic'){ son('non'); return dit(PORTE.huilier.alambic, 'oups'); }
  if(feuO && S.liq[o] === liq){ son('clic'); return dit(liq === 'eau' ? DIT.dejaEau : DIT.dejaHuile); }
  if(feuO && S.liq[o]){ son('non'); return dit(DIT.melange, 'oups'); }
  occupe(true);
  var gT0 = $('#' + (h === 'cruche' ? 'crucheT' : 'huilierT')), q0 = OU[de], ech = OU[de].e, sens = h === 'cruche' ? -1 : 1;
  var dx = (b.x - q0.x)/ech + (h === 'cruche' ? 54 : -30), dy = (b.y - 34 - q0.y)/ech + (h === 'cruche' ? 55 : 47);
  function penche(p){ gT0.setAttribute('transform', 'translate(' + f1(dx*p) + ',' + f1(dy*p - Math.sin(p*Math.PI)*30) + ') rotate(' + f1(sens*58*p) + ' 0 -50)'); }
  tween(380, penche, function(){
    son(liq === 'eau' ? 'verse' : 'huile');
    var filet = svgEl('<path d="M' + f1(b.x) + ',' + f1(b.y - 34) + ' q-5,12 -3,' + (feuO ? 36 : 30) + '" fill="none" stroke="' + (liq === 'eau' ? '#6fb6ea' : '#f2b630') + '" stroke-width="6" stroke-linecap="round" opacity=".9"/>'); $('#effets').appendChild(filet);
    attendre(520, function(){
      filet.remove();
      if(feuO && !verseOk) S.liq[o] = liq;
      if(feuO) majOutil(o);
      tween(320, function(p){ penche(1 - p); }, function(){
        gT0.removeAttribute('transform');
        if(verseOk){ S.n++; S.m = {nom:e.m, c:e.c, f:e.f}; S.faitIci = true; majOutil(o); occupe(false); garder(); son('bien'); bulleOutil(o, e.t, 'bien'); inviter(); return; }
        occupe(false); garder(); dit(liq === 'eau' ? DIT.eau : DIT.huile);
      });
    });
  });
}
/* Toucher le foyer, les mains vides : on retire une bûche (si le feu n'est pas allumé) */
function toucherFoyer(o){
  if(S.occupe || S.mode) return;
  if(S.H) return appliquer(S.H, o);
  var f = S.feux[o];
  if(f.b > 0 && !f.allume){ f.b--; son('buche'); majOutil(o); bulleOutil(o, DIT.retire); return; }
  toucherOutil(o);
}

/* ---------- L'étagère : une potion dit son nom et ce qu'elle fait ---------- */
function toucherPotion(id){
  if(S.occupe || S.mode) return;
  var r = RE[id], q = placePotion(id); son('clic'); poser();
  if(enPlus(id)){   /* une potion en plus (le givre) : prête, elle remontre son code pour le Pisteur */
    if(S.faites[id] && codePlus(id)) return ouvrirPrete(id, null, false);
    return bulle(q.x, q.y + 30, S.faites[id] ? r.nom + ' : prête !' : r.court + ' : ' + DIT.pasPrete.charAt(0).toLowerCase() + DIT.pasPrete.slice(1));
  }
  if(toutesFaites() && S.sac) return ouvrirCode();   /* les sept sont prêtes : le code pour le Pisteur */
  bulle(q.x, q.y + 30, S.faites[id] ? r.nom + ' : prête !' : r.court + ' : ' + DIT.pasPrete.charAt(0).toLowerCase() + DIT.pasPrete.slice(1));
}

/* ---------- Garder, reprendre ---------- */
function exporter(){ return {p:S.plante, pa:S.partie, n:S.n, ou:S.ou, pos:S.pos, liq:S.liq, vu:S.vuH || {}, po:S.posee ? [S.posee] : [], pv:Object.keys(S.pagesVues)}; }
function importer(e){
  if(!e || typeof e !== 'object') return;
  if(e.vu && typeof e.vu === 'object') S.vuH = e.vu;
  if(Array.isArray(e.po)) e.po.forEach(function(k){ if(PL[k] && S.dispo[k] > 0 && !S.faites[PL[k].potion]) S.posee = k; });
  if(Array.isArray(e.pv)) e.pv.forEach(function(id){ if(RE[id]) S.pagesVues[id] = 1; });
  var p = PL[e.p]; if(!p || !(S.dispo[e.p] > 0) || S.faites[p.potion]) return;
  S.plante = e.p; S.posee = e.p;
  var r = RE[p.potion], d = p.parties[e.pa]; if(!d) return;
  var n = Math.max(0, Math.min(r.etapes.length - 1, e.n | 0));
  if(e.pa !== r.partie) n = 0;
  if(n > 0 && !(FENTE[e.ou])) return;
  S.partie = e.pa; S.n = n; S.ou = FENTE[e.ou] ? e.ou : 'linge'; S.pos = e.pos === 'sortie' && FENTE[S.ou] && FENTE[S.ou].sortie ? 'sortie' : 'entree';
  var av = n > 0 ? r.etapes[n - 1] : null; S.m = av ? {nom:av.m, c:av.c, f:av.f} : {nom:d.nom, c:d.c, f:d.s};
  S.faitIci = !!(av && av.o === S.ou);
  if(e.liq && typeof e.liq === 'object'){ ['marmite', 'alambic'].forEach(function(o){ if(e.liq[o] === 'eau' || (e.liq[o] === 'huile' && S.faites.huile)) S.liq[o] = e.liq[o]; }); }
}
