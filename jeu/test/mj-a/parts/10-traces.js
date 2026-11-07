
/* ==========================================================
   TRACES (Pisteur) — « Suivre la piste ». Vue du dessus, monde
   BEAUCOUP plus large que l'écran (5 écrans au niveau 3, 8 et plus
   au niveau 9). Le sol défile vers l'avant sans jamais s'arrêter ;
   la caméra suit le Pisteur de côté. Il marche vers le doigt (ou la
   souris) à vitesse limitée et ne voit les empreintes que dans un
   petit cercle devant lui.
   Départ : une ligne droite avec SEULEMENT sa piste. Ensuite, aux
   embranchements et à la sortie des haies, ruisseaux, graviers, la
   piste se sépare en branches qui partent très loin l'une de l'autre :
   à l'écran, jamais plus de quelques pistes. Une erreur vite vue se
   rattrape ; trop tard, la bonne piste sort de l'écran.
   Perdu : la bonne piste n'est plus du tout à l'écran (devant le
   Pisteur) pendant 2 s → « Tu t'es perdu : tu as perdu la trace ! »,
   ou on entre dans une autre arrivée, ou la bonne arrivée défile sans
   qu'on l'atteigne. Gagné : on entre dans l'arrivée de sa piste.
   Jamais de changement de direction dans une zone sans traces
   (gravier, eau, haie, dalles, clôture) : le virage se fait AVANT,
   il faut lire l'angle des derniers pas.
   Mods : zone (cercle de vision plus grand), vitesse (+x : le Pisteur
   marche plus vite, ex. 0.3 = +30 %), lent (le sol défile moins vite),
   temps (+N : défilement un peu plus lent), nuit (vision de nuit :
   toutes les empreintes visibles, floues et pâles au loin, nettes près
   de toi), aide (rappel de l'empreinte dans un coin), revele (après
   chaque obstacle, les pas suivants s'allument un instant), erreurs
   (+N : une mauvaise arrivée ne termine pas la partie).
   params.suspect (facultatif) : 'enfant' | 'femme' | 'homme' | 'sabot'
   | 'botte', ou params.empreinte = {L, W, bout, talon, detail, foulee,
   ouvre} ; params.meteo (essais) : 'bruine' | 'averse' | 'vent' | 'beau'.
   ========================================================== */
var EMP_PRESETS = {
  enfant:{nom:'Petite chaussure d\'enfant', L:14.5, W:0.42, bout:'rond', talon:'separe', detail:'aucun', foulee:19, ouvre:6},
  femme:{nom:'Chaussure fine', L:16.5, W:0.37, bout:'rond', talon:'separe', detail:'aucun', foulee:22, ouvre:4},
  homme:{nom:'Grosse chaussure', L:19.5, W:0.43, bout:'carre', talon:'separe', detail:'aucun', foulee:26, ouvre:10},
  sabot:{nom:'Sabot de bois', L:17, W:0.46, bout:'rond', talon:'plein', detail:'aucun', foulee:22, ouvre:8},
  botte:{nom:'Botte', L:18.5, W:0.44, bout:'carre', talon:'plein', detail:'trait', foulee:25, ouvre:6}
};
var BOUTS = ['rond', 'carre'], DETAILS = ['aucun', 'encoche', 'point', 'trait'];
var formesCache = {};
function n1(v){ return (Math.round(v * 10) / 10).toString(); }
/* Forme d'une semelle (pied gauche, pointe vers le haut), centrée sur 0.
   bout : 'rond' (arrondi) | 'carre' (bout plat) ; talon : 'separe' (avant et talon
   bien séparés) | 'plein' (une seule semelle d'un bloc, avec son rebord). */
function formeSemelle(f){
  var cle = [n1(f.L), n1(f.W), f.bout, f.talon, f.detail].join('|');
  if(formesCache[cle]) return formesCache[cle];
  var L = f.L, w = f.L * f.W;
  function P(a, b){ return n1(a * w) + ',' + n1(b * L); }
  var bout = f.bout === 'carre'
    ? ' C' + P(-0.52, -0.38) + ' ' + P(-0.5, -0.5) + ' ' + P(-0.3, -0.5) + ' L' + P(0.32, -0.5) + ' C' + P(0.5, -0.5) + ' ' + P(0.53, -0.38) + ' ' + P(0.5, -0.24)
    : ' C' + P(-0.5, -0.42) + ' ' + P(-0.24, -0.56) + ' ' + P(0.04, -0.54) + ' C' + P(0.34, -0.52) + ' ' + P(0.52, -0.4) + ' ' + P(0.5, -0.24);
  var d, det = '';
  if(f.talon === 'plein'){
    /* une seule semelle : bord continu, taille marquée mais pas coupée */
    d = 'M' + P(-0.5, -0.24) + bout + ' C' + P(0.48, -0.02) + ' ' + P(0.36, 0.12) + ' ' + P(0.37, 0.28) + ' C' + P(0.38, 0.46) + ' ' + P(0.22, 0.53) + ' ' + P(0, 0.53) + ' C' + P(-0.22, 0.53) + ' ' + P(-0.4, 0.46) + ' ' + P(-0.39, 0.28) + ' C' + P(-0.38, 0.12) + ' ' + P(-0.53, -0.02) + ' ' + P(-0.5, -0.24) + ' Z';
    det += '<path class="e-rebord" d="M' + P(-0.28, -0.22) + ' C' + P(-0.28, -0.36) + ' ' + P(0.24, -0.38) + ' ' + P(0.26, -0.22) + ' C' + P(0.26, 0.05) + ' ' + P(0.17, 0.2) + ' ' + P(0.18, 0.32) + ' C' + P(0.18, 0.4) + ' ' + P(-0.18, 0.4) + ' ' + P(-0.2, 0.32) + ' C' + P(-0.2, 0.2) + ' ' + P(-0.28, 0.05) + ' ' + P(-0.28, -0.22) + ' Z"/>';
  } else {
    /* avant du pied, puis un vrai vide, puis le talon */
    d = 'M' + P(-0.5, -0.24) + bout + ' C' + P(0.48, -0.04) + ' ' + P(0.34, 0.06) + ' ' + P(0.3, 0.12) + ' Q' + P(-0.02, 0.17) + ' ' + P(-0.36, 0.11) + ' C' + P(-0.48, 0.02) + ' ' + P(-0.53, -0.1) + ' ' + P(-0.5, -0.24) + ' Z';
    d += ' M' + P(-0.34, 0.28) + ' C' + P(-0.37, 0.46) + ' ' + P(-0.2, 0.53) + ' ' + P(0, 0.53) + ' C' + P(0.2, 0.53) + ' ' + P(0.35, 0.46) + ' ' + P(0.33, 0.28) + ' Q' + P(0, 0.23) + ' ' + P(-0.34, 0.28) + ' Z';
  }
  if(f.detail === 'encoche') det += '<circle class="e-trou" cx="' + n1(-0.37 * w) + '" cy="' + n1(0.4 * L) + '" r="' + n1(0.07 * L) + '"/>';
  else if(f.detail === 'point') det += '<circle class="e-c" cx="' + n1(0.02 * w) + '" cy="' + n1(-0.28 * L) + '" r="' + n1(0.055 * L) + '"/>';
  else if(f.detail === 'trait') det += '<path class="e-r" d="M' + P(-0.2, 0.4) + ' L' + P(0.2, 0.4) + '"/>';
  return (formesCache[cle] = {d:d, det:det});
}
function empreinteCarte(f, taille){
  var s = formeSemelle(f), h = f.L * 1.25, k = (taille || 70) / h;
  return '<svg class="mja-empr-carte" viewBox="' + n1(-h * 0.75) + ' ' + n1(-h / 2) + ' ' + n1(h * 1.5) + ' ' + n1(h) + '" width="' + Math.round(h * 1.5 * k) + '" height="' + Math.round(taille || 70) + '" aria-hidden="true">' +
    '<g class="mja-empr" transform="translate(' + n1(-f.L * 0.32) + ',' + n1(f.L * 0.08) + ')"><path class="e-f" d="' + s.d + '"/>' + s.det + '</g>' +
    '<g class="mja-empr" transform="translate(' + n1(f.L * 0.32) + ',' + n1(-f.L * 0.08) + ') scale(-1,1)"><path class="e-f" d="' + s.d + '"/>' + s.det + '</g></svg>';
}
/* Deux empreintes « pareilles » : même forme (bout, talon, détail, largeur) ET même taille (moins de 9 % d'écart).
   La piste à suivre doit être UNIQUE : aucune autre piste de la carte ne lui est pareille. */
function memeEmpreinte(a, b){
  return a.bout === b.bout && a.talon === b.talon && a.detail === b.detail && Math.abs(a.W - b.W) < 0.03 &&
    Math.abs(a.L - b.L) / Math.min(a.L, b.L) < 0.09;
}
/* Une fausse piste « de la même famille » : toujours une VRAIE différence visible — autre taille (au moins
   +11 %, souvent la même chaussure en plus grand), autre bout, autre talon ou autre petit détail —, plus
   parfois une foulée ou un angle de pied un peu différents. evite : empreintes déjà prises dans le même groupe. */
function variante(c, n, evite){
  var amp = Math.max(0.11, courbe(n, {1:0.3, 3:0.2, 6:0.14, 9:0.11, 12:0.11}));
  function sgn(){ return Math.random() < 0.5 ? -1 : 1; }
  var poids = n <= 2 ? ['taille', 'bout', 'talon', 'detail'] : ['taille', 'taille', 'bout', 'talon', 'talon', 'detail'];
  for(var essai = 0; essai < 60; essai++){
    var v = Object.assign({}, c), trait = U.choix(poids);
    if(trait === 'taille'){
      var k = c.L < 16 ? 1 : (c.L > 19 ? -1 : sgn()), a = amp * U.rand(1, 1.35);
      v.L = c.L * (1 + k * a); v.foulee = c.foulee * (1 + k * a * 0.85);
    }
    else if(trait === 'bout') v.bout = c.bout === 'rond' ? 'carre' : 'rond';
    else if(trait === 'talon') v.talon = c.talon === 'plein' ? 'separe' : 'plein';
    else v.detail = U.choix(DETAILS.filter(function(d){ return d !== c.detail; }));
    if(n <= 2 && trait !== 'taille'){ var s2 = Math.random() < 0.5 ? 1 : -1; v.L = c.L * (1 + s2 * 0.2); v.foulee = c.foulee * (1 + s2 * 0.17); }
    if(Math.random() < 0.4) v.foulee *= 1 + sgn() * 0.08;
    if(Math.random() < 0.3) v.ouvre = c.ouvre + sgn() * 8;
    if(memeEmpreinte(v, c)) continue;
    if(evite && evite.some(function(e){ return memeEmpreinte(v, e); })) continue;
    if(evite) evite.push(v);
    return v;
  }
  var w = Object.assign({}, c); w.L = c.L * 1.3; w.foulee = c.foulee * 1.25; if(evite) evite.push(w); return w;
}
/* Une piste = des segments droits (pente m = dx/dd) reliés par de petits virages
   arrondis (largeur ±V) qu'on ne place jamais dans une zone sans traces. */
var VIR = 20;
function Trace(noeuds){
  for(var i = 1; i < noeuds.length; i++) noeuds[i].x = noeuds[i - 1].x + noeuds[i - 1].m * (noeuds[i].d - noeuds[i - 1].d);
  var k = 0, n = noeuds;
  return {n:n, x:function(d){
    if(d <= n[0].d) return n[0].x + n[0].m * (d - n[0].d);
    if(k >= n.length || n[k].d > d) k = 0;
    while(k < n.length - 1 && n[k + 1].d <= d) k++;
    var a = n[k], x = a.x + a.m * (d - a.d);
    if(k > 0 && d - a.d < VIR){ var p0 = a.x - n[k - 1].m * VIR, p2 = a.x + a.m * VIR, t = (d - a.d + VIR) / (2 * VIR); return (1 - t) * (1 - t) * p0 + 2 * t * (1 - t) * a.x + t * t * p2; }
    if(k < n.length - 1 && n[k + 1].d - d < VIR){ var b = n[k + 1], q0 = b.x - a.m * VIR, q2 = b.x + b.m * VIR, u = (d - b.d + VIR) / (2 * VIR); return (1 - u) * (1 - u) * q0 + 2 * u * (1 - u) * b.x + u * u * q2; }
    return x;
  }, pente:function(d){ var h = this.x(d + 3) - this.x(d - 3); return h / 6; }};
}
var NOMS_OBST = {gravier:'gravier', haie:'haies', eau:'ruisseaux et flaques', dalles:'grandes dalles', cloture:'clôtures'};
function genererMonde(p){
  /* D0 : la ligne droite du départ, avec seulement la bonne piste (230 avant la partie raccourcie du 4 nov.) */
  var W = p.largeur * 360, X0 = W / 2, D0 = 150, FIN = 200, zones = [], fourches = [];
  var EP = {haie:null, eau:null, dalles:[90, 120], cloture:[30, 30]};
  var evts = U.melanger(p.obstaclesListe.map(function(t){ return {type:t}; }).concat(Array.apply(null, Array(p.fourches)).map(function(){ return {type:'fourche'}; })));
  var noeuds = [{d:-900, x:X0, m:0}], dern = noeuds[0];
  function xA(d){ return dern.x + dern.m * (d - dern.d); }
  function vire(d, m){ var x = xA(d); dern = {d:d, x:x, m:m}; noeuds.push(dern); }
  function borne(x, m, long){
    var xf = x + m * (long || 320);
    if(xf < W * 0.12 || xf > W * 0.88){ m = -m; xf = x + m * (long || 320); if(xf < W * 0.12 || xf > W * 0.88) m = (X0 - x) / 700; }
    return fixe(m, -p.penteMax, p.penteMax);
  }
  var d = D0, verrou = null;
  /* après un embranchement, la bonne piste continue de s'écarter un moment */
  function penteLibre(dd){
    if(verrou && dd < verrou.fin){ var xv = xA(dd); if((verrou.signe < 0 && xv < W * 0.2) || (verrou.signe > 0 && xv > W * 0.8)) verrou = null; else { var m0 = verrou.signe * U.rand(0.5, Math.max(0.6, p.ampli)); return fixe(m0, -p.penteMax, p.penteMax); } }
    return borne(xA(dd), U.rand(-p.ampli, p.ampli));
  }
  evts.forEach(function(ev){
    var gap = U.rand(150, 215), nt = Math.random() < 0.55 ? 1 : 2;
    for(var k = 1; k <= nt; k++){
      var dt = d + gap * k / (nt + 1), mL = penteLibre(dt);
      /* avant un embranchement, on revient vers le milieu de la forêt : les deux branches auront de la place */
      if(ev.type === 'fourche' && !(verrou && dt < verrou.fin)) mL = fixe((X0 - xA(dt)) / Math.max(60, d + gap - dt) * 0.8 + U.rand(-0.15, 0.15), -p.penteMax, p.penteMax);
      vire(dt, mL);
    }
    d += gap;
    if(ev.type === 'fourche'){
      var x = xA(d), roomG = x - 80, roomD = W - 80 - x;
      /* la fausse branche part du côté où elle a la place de s'éloigner (≈ 500), la bonne de l'autre */
      var okD = roomD >= 500 && roomG >= 380, okG = roomG >= 500 && roomD >= 380;
      var cote = okD && okG ? (Math.random() < 0.5 ? 1 : -1) : (okD ? 1 : (okG ? -1 : (roomD > roomG ? 1 : -1)));
      var mt = fixe(-cote * p.ecart * U.rand(0.35, 0.5), -p.penteMax, p.penteMax);
      var md = fixe(mt + cote * p.ecart, -1.75, 1.75);
      vire(d, mt);
      var f = {d:d, x:x, mt:mt, pentes:[md]};
      if(Math.random() < p.triple) f.pentes.push(fixe(mt - cote * p.ecart * 0.85, -1.75, 1.75));
      fourches.push(f);
      verrou = {fin:d + 360, signe:mt < 0 ? -1 : 1};
      d += VIR + 60;
    } else {
      var z = {type:ev.type, mAvant:dern.m};
      if(ev.type === 'gravier'){
        var sd = (verrou && d < verrou.fin ? verrou.signe : (Math.random() < 0.5 ? -1 : 1)) * p.diag * U.rand(0.8, 1.15);
        if(!(verrou && d < verrou.fin)) sd = borne(xA(d), sd, 260);
        sd = fixe(sd, -p.penteMax, p.penteMax);
        if(Math.abs(sd - z.mAvant) < 0.35) sd = fixe(sd + (sd >= z.mAvant ? 0.45 : -0.45), -p.penteMax, p.penteMax);
        vire(d, sd);
        z.d0 = d + VIR + 48; z.d1 = z.d0 + U.rand(40, p.gravierMax);
      } else {
        if(Math.abs(dern.m) > 0.9 && !(verrou && d < verrou.fin)) vire(d, borne(xA(d), dern.m * 0.6));
        var r0 = Math.random(), ep;
        if(ev.type === 'eau') ep = r0 < 0.4 ? 24 : (r0 < 0.75 ? 54 : U.rand(88, 110));
        else if(ev.type === 'haie') ep = r0 < 0.5 ? U.rand(34, 44) : (r0 < 0.8 ? U.rand(62, 80) : U.rand(96, 124));
        else ep = U.rand(EP[ev.type][0], EP[ev.type][1]);
        z.d0 = d + VIR + 22; z.d1 = z.d0 + ep;
      }
      z.x0 = xA(z.d0); z.x1 = xA(z.d1); z.m = dern.m;
      zones.push(z);
      d = z.d1 + VIR + 28;
    }
  });
  vire(d + 60, borne(xA(d + 60), U.rand(-p.ampli, p.ampli) * 0.6));
  var L = d + FIN;   /* l'arrivée, après le dernier obstacle (300 avant le 4 nov.) */
  /* garde-fou : si la piste frôle un bord, on recommence la carte */
  for(var dd0 = 0; dd0 < L; dd0 += 40){ var xx0 = (function(dd){ var k = 0; while(k < noeuds.length - 1 && noeuds[k + 1].d <= dd) k++; return noeuds[k].x + noeuds[k].m * (dd - noeuds[k].d); })(dd0); if(xx0 < W * 0.06 || xx0 > W * 0.94){ if((p._essaiCarte = (p._essaiCarte || 0) + 1) < 25) return genererMonde(p); break; } }
  p._essaiCarte = 0;
  noeuds.push({d:L + 400, m:0});
  var cible = Trace(noeuds);
  cible.debut = 20; cible.fin = L - 12; cible.vrai = true; cible.f = p.empreinte;
  function dansZone(dd, marge){ for(var i = 0; i < zones.length; i++){ if(dd > zones[i].d0 - marge && dd < zones[i].d1 + marge) return zones[i]; } return null; }
  function libre(dd){ var z; while((z = dansZone(dd, VIR + 8))) dd = z.d1 + VIR + 10; return dd; }
  /* arrivées : une seule par écran */
  var arrivees = [{x:cible.x(L), d:L, trace:cible, cible:true}];
  function placeLibre(x, dd){ if(x < 50 || x > W - 50) return false; if(dansZone(dd, 30)) return false; if(dd < L + 40 && Math.abs(x - cible.x(dd)) < 64) return false; return arrivees.every(function(a){ return Math.abs(a.d - dd) > 560 || Math.abs(a.x - x) > 420; }); }
  var leurres = [];
  function ajoute(tr, f, dS, dFin){
    tr.f = f; tr.debut = dS + 4; tr.fin = dFin - 12; tr.vrai = false;
    var a = {x:tr.x(dFin), d:dFin, trace:tr, cible:false}; arrivees.push(a); tr.arrivee = a;
    leurres.push(tr); return leurres.length - 1;
  }
  /* fausse piste longue : part fort de côté, s'éloigne, finit loin */
  function longue(dS, xS, mS, groupe){
    var nds = [{d:dS - 1, x:xS - mS, m:mS}], der = nds[0];
    function xa(dd){ return der.x + der.m * (dd - der.d); }
    var dd = dS + U.rand(260, 420);
    while(dd < L + 700){
      dd = libre(dd);
      var xL = xa(dd), sep = xL - cible.x(dd), sg = sep >= 0 ? 1 : -1;
      var m = Math.abs(sep) < 300 ? sg * U.rand(0.55, 0.95) : sg * U.rand(-0.15, 0.7);
      if(xL + m * 260 < 70 || xL + m * 260 > W - 70) m = (xL < W / 2 ? 1 : -1) * U.rand(0, 0.25);
      der = {d:dd, x:xa(dd), m:m}; nds.push(der);
      dd += U.rand(170, 260);
    }
    nds.push({d:L + 1200, m:0});
    var tr = Trace(nds);
    for(var e = 0; e < 40; e++){
      var dFin = U.rand(dS + 650, L + 650), x = tr.x(dFin);
      if(placeLibre(x, dFin)) return ajoute(tr, variante(p.empreinte, p.niveau, groupe), dS, dFin);
    }
    return ajoute(tr, variante(p.empreinte, p.niveau, groupe), dS, L + 1100 + U.rand(0, 400));
  }
  /* fausse piste courte : diverge peu, finit vite dans une arrivée (cul-de-sac) */
  function courte(dS, xS, mS, groupe){
    var lg = U.rand(170, 230), dFin = dS + lg, tr = Trace([{d:dS - 1, x:xS - mS, m:mS}, {d:dFin + 100, m:mS}]);
    if(!placeLibre(tr.x(dFin), dFin)) return -1;
    return ajoute(tr, variante(p.empreinte, p.niveau, groupe), dS, dFin);
  }
  fourches.forEach(function(f){ var g = []; f.leurres = f.pentes.map(function(m){ return longue(f.d + 2, f.x, m, g); }); });
  zones.forEach(function(z){
    z.leurres = []; z.court = -1; var groupe = [];
    var nb = p.eventail[z.type] || 0, offs = [], tries = 0;
    if(z.type === 'gravier'){ var xn = z.x0 + z.mAvant * (z.d1 - z.d0); if(Math.abs(xn - z.x1) > 30) offs.push(xn - z.x1); }
    while(offs.length < nb && tries++ < 60){
      var o = (Math.random() < 0.5 ? -1 : 1) * U.rand(26, 72);
      if(offs.every(function(q){ return Math.abs(q - o) > 22; })) offs.push(o);
    }
    offs.slice(0, nb).forEach(function(o, i){
      var xS = z.x1 + o, sg = o >= 0 ? 1 : -1, id;
      if(i === 0 && nb >= 2 && z.court < 0){ id = courte(z.d1 + 3, xS, z.m + sg * U.rand(0.45, 0.7), groupe); if(id >= 0){ z.court = id; z.leurres.push(id); return; } }
      id = longue(z.d1 + 3, xS, fixe(z.m + sg * U.rand(1.0, p.ecart), -1.75, 1.75), groupe);
      z.leurres.push(id);
    });
  });
  /* dalles le long de la piste (elle y est droite), flaques à côté */
  var dalles = [], flaques = [], rochers = [];
  zones.forEach(function(z){
    if(z.type === 'dalles'){ for(var dd = z.d0 + 14; dd < z.d1 - 8; dd += U.rand(30, 40)) dalles.push({d:dd, x:cible.x(dd) + U.rand(-9, 9), r:U.rand(17, 26), a:U.rand(0, 6)}); for(var k = 0; k < 6; k++){ var dr = U.rand(z.d0, z.d1), xr = cible.x(dr) + (Math.random() < 0.5 ? -1 : 1) * U.rand(60, 170); rochers.push({d:dr, x:xr, r:U.rand(14, 22)}); } }
    if(z.type === 'eau'){ for(var k2 = 0; k2 < 3; k2++){ var dq = z.d1 + U.rand(20, 130), xq = cible.x(dq) + (Math.random() < 0.5 ? -1 : 1) * U.rand(45, 140); flaques.push({d:dq, x:xq, rx:U.rand(16, 26), ry:U.rand(9, 14)}); } }
  });
  return {W:W, X0:X0, D0:D0, L:L, zones:zones, fourches:fourches, cible:cible, leurres:leurres, arrivees:arrivees, dalles:dalles, flaques:flaques, rochers:rochers};
}
var ARRIVEES_ART = {
  buisson:'<path d="M-17,8 C-22,-4 -12,-16 -2,-13 C4,-20 18,-14 16,-4 C24,0 20,12 10,12 C2,17 -10,16 -13,11 C-20,12 -21,8 -17,8 Z" fill="#2f7a4c" stroke="' + CONTOUR + '" stroke-width="3"/><circle cx="-5" cy="-3" r="2.3" fill="#e5484d"/><circle cx="7" cy="3" r="2.3" fill="#e5484d"/><ellipse cx="0" cy="9" rx="7" ry="4" fill="#14111f"/>',
  porte:'<rect x="-15" y="-16" width="30" height="26" rx="3" fill="#7a5a3e" stroke="' + CONTOUR + '" stroke-width="3"/><path d="M-15,-16 L0,-26 L15,-16" fill="#a8743f" stroke="' + CONTOUR + '" stroke-width="3" stroke-linejoin="round"/><rect x="-6" y="-4" width="12" height="14" rx="5" fill="#3b2a1e" stroke="' + CONTOUR + '" stroke-width="2"/><circle cx="3" cy="3" r="1.4" fill="#ffd36a"/>',
  creux:'<circle r="16" fill="#6e4424" stroke="' + CONTOUR + '" stroke-width="3"/><circle r="11" fill="none" stroke="#8a5a33" stroke-width="2"/><ellipse cx="0" cy="3" rx="7" ry="8" fill="#14111f"/>',
  terrier:'<path d="M-16,8 C-16,-8 16,-8 16,8 Z" fill="#7a6250" stroke="' + CONTOUR + '" stroke-width="3"/><ellipse cx="0" cy="5" rx="8" ry="6" fill="#14111f"/><circle cx="-12" cy="-6" r="3" fill="#8b7a62" stroke="' + CONTOUR + '" stroke-width="1.5"/>',
  grotte:'<path d="M-18,10 L-14,-8 L-4,-16 L8,-14 L17,-4 L18,10 Z" fill="#7d7a92" stroke="' + CONTOUR + '" stroke-width="3" stroke-linejoin="round"/><path d="M-7,10 C-7,-2 7,-2 7,10 Z" fill="#14111f"/>',
  tonneau:'<ellipse cx="0" cy="0" rx="15" ry="13" fill="#9a6235" stroke="' + CONTOUR + '" stroke-width="3"/><ellipse cx="0" cy="0" rx="9" ry="8" fill="#14111f"/><path d="M-15,-4 L15,-4" stroke="#3b3346" stroke-width="2" opacity=".6"/>'
};
MJ.enregistrer('traces', {
  nom:'Suivre la piste', role:'pisteur', ic:'👣',
  consigne:'Retiens bien l\'empreinte du départ, puis guide le Pisteur du doigt sur SA piste jusqu\'à son arrivée, sans jamais la perdre de vue !',
  minuteur:false,
  reglages: function(n, mods){
    var p = {niveau:n};
    var t = Math.min(6, mods.temps || 0);
    p.defile = courbe(n, {1:20, 3:24, 6:29, 9:34, 12:38}) * (mods.lent || 1) / (1 + 0.06 * t);
    p.marche = 52 * (1 + (mods.vitesse || 0));
    p.vision = courbe(n, {1:36, 3:31, 6:28, 9:25, 12:23}) * (mods.zone || 1);
    p.largeur = courbe(n, {1:4, 3:5, 6:7, 9:8.5, 12:10});
    /* Romain, 4 nov. : « c'est beaucoup trop long » → une partie deux fois plus courte à chaque niveau :
       environ deux fois moins d'embranchements et d'obstacles (avant : 1 à 4 embranchements, 3 à 8 obstacles ;
       maintenant 1 à 2 embranchements et 1 à 4 obstacles), et un départ et une arrivée un peu plus courts
       (genererMonde). Chaque obstacle et chaque embranchement restent aussi durs qu'avant.
       Arrondi au hasard (1,8 obstacle = 2 obstacles 8 fois sur 10) : la durée moyenne suit le niveau sans à-coups. */
    function auHasard(x){ return Math.floor(x + Math.random()); }
    p.fourches = auHasard(courbe(n, {1:1, 5:1, 8:2, 12:2.5}));
    var nbObst = auHasard(courbe(n, {1:1, 3:1.8, 6:2.7, 9:3.6, 12:4.2}));
    /* les obstacles sont tirés parmi ceux de l'ancienne piste du même niveau : dalles et clôtures restent pour les grands niveaux */
    var sac = ['gravier', 'haie', 'eau', 'gravier', 'dalles', 'cloture', 'haie', 'gravier', 'eau'];
    p.obstaclesListe = U.melanger(sac.slice(0, entier(n, {1:3, 3:4, 6:6, 9:8, 12:9}))).slice(0, nbObst);
    p.eventail = {gravier:entier(n, {1:1, 3:2, 6:3, 9:3}), haie:entier(n, {1:2, 3:3, 6:4, 9:4}), eau:entier(n, {1:1, 3:2, 6:2, 9:3}), dalles:entier(n, {1:0, 6:1, 9:2}), cloture:entier(n, {1:0, 3:1, 9:2})};
    p.ecart = courbe(n, {1:1.8, 3:2.4, 6:2.5, 9:2.6, 12:2.7});
    var v0 = courbe(n, {1:20, 3:24, 6:29, 9:34, 12:38});
    p.penteMax = Math.min(1.25, 0.85 * Math.sqrt(Math.max(1, 52 * 52 - v0 * v0)) / v0);
    p.ampli = Math.min(p.penteMax, courbe(n, {1:0.5, 3:0.75, 6:0.95, 9:1.1}));
    p.diag = Math.min(p.penteMax, courbe(n, {1:0.55, 3:0.8, 6:0.95, 9:1.05}));
    p.gravierMax = courbe(n, {1:110, 3:170, 6:230, 9:260});
    p.triple = courbe(n, {1:0, 5:0, 6:0.3, 9:0.5});
    p.bruine = courbe(n, {1:0, 2:0, 3:0.25, 6:0.35, 9:0.4});
    p.averse = courbe(n, {1:0, 2:0, 3:0.15, 6:0.3, 9:0.45});
    p.vent = courbe(n, {1:0, 2:0, 3:0.3, 6:0.5, 9:0.7});
    p.grace = 2;
    p.essais = 1 + (mods.erreurs || 0);
    p.nuit = !!mods.nuit; p.aide = !!mods.aide; p.revele = !!mods.revele;
    p.suspect = U.choix(Object.keys(EMP_PRESETS));
    var obstNoms = []; p.obstaclesListe.forEach(function(o){ if(obstNoms.indexOf(NOMS_OBST[o]) < 0) obstNoms.push(NOMS_OBST[o]); });
    var meteo = [];
    if(p.bruine > 0) meteo.push('bruine'); if(p.averse > 0) meteo.push('grosse pluie'); if(p.vent > 0) meteo.push('vent');
    p.lignes = [
      {nom:'Taille de ta vision', val:p.vision < 27 ? 'toute petite' : (p.vision < 33 ? 'petite' : (p.vision < 42 ? 'moyenne' : 'grande'))},
      {nom:'Vitesse du Pisteur', val:(mods.vitesse || 0) > 0 ? 'rapide (+' + Math.round(mods.vitesse * 100) + ' %)' : 'normale'},
      {nom:'Le sol défile', val:p.defile < 22 ? 'lentement' : (p.defile < 30 ? 'moyennement' : 'vite')},
      {nom:'Largeur de la forêt', val:Math.round(p.largeur) + ' écrans'},
      {nom:'Embranchements', val:p.fourches + ' + des pistes qui surgissent derrière les obstacles'},
      {nom:'Fausses pistes', val:n <= 2 ? 'assez différentes' : (n <= 5 ? 'ressemblantes' : 'presque pareilles')},
      {nom:'Obstacles', val:obstNoms.join(', ')},
      {nom:'Météo', val:meteo.length ? meteo.join(', ') + ' possibles' : 'beau temps'}
    ];
    if(p.essais > 1) p.lignes.push({nom:'Mauvaises arrivées permises', val:String(p.essais - 1)});
    if(p.nuit) p.lignes.push({nom:'Vision de nuit', val:'toutes les traces, floues au loin'});
    if(p.aide) p.lignes.push({nom:'Rappel de l\'empreinte', val:'dans un coin'});
    if(p.revele) p.lignes.push({nom:'Après un obstacle', val:'les pas suivants s\'allument'});
    return p;
  },
  /* Vérification (banc d'essai) : sur nb cartes au niveau n, la piste à suivre est-elle unique, aucun
     embranchement ni éventail ne donne deux branches pareilles, et aucun virage dans une zone sans traces ? */
  verifier: function(n, nb){
    var r = {cartes:0, pistes:0, pareilleCible:0, fourchePareille:0, eventailPareil:0, virageDansZone:0, exemples:[]};
    for(var k = 0; k < (nb || 200); k++){
      var p = MJ.reglages('traces', n, {}, {brut:true}); p.empreinte = EMP_PRESETS[p.suspect];   /* n : le niveau du jeu tel quel */
      var M = genererMonde(p), C = M.cible.f;
      r.cartes++; r.pistes += M.leurres.length + 1;
      M.leurres.forEach(function(l){ if(memeEmpreinte(l.f, C)) r.pareilleCible++; });
      function pareils(liste){ for(var i = 0; i < liste.length; i++) for(var j = i + 1; j < liste.length; j++) if(memeEmpreinte(liste[i], liste[j])) return true; return false; }
      M.fourches.forEach(function(f){ if(pareils([C].concat(f.leurres.filter(function(i){ return i >= 0; }).map(function(i){ return M.leurres[i].f; })))) r.fourchePareille++; });
      M.zones.forEach(function(z){ if(pareils([C].concat(z.leurres.filter(function(i){ return i >= 0; }).map(function(i){ return M.leurres[i].f; })))) r.eventailPareil++; });
      [M.cible].concat(M.leurres).forEach(function(t, it){
        t.n.forEach(function(nd, i){
          if(i === 0 || Math.abs(nd.m - t.n[i - 1].m) < 0.005 || nd.d > t.fin) return;
          M.zones.forEach(function(z){ if(nd.d > z.d0 - VIR && nd.d < z.d1 + VIR){ r.virageDansZone++; if(r.exemples.length < 4) r.exemples.push({piste:it ? 'leurre' : 'cible', type:z.type, d:Math.round(nd.d), z:[Math.round(z.d0), Math.round(z.d1)]}); } });
        });
      });
    }
    return r;
  },
  demo: function(el){
    var f = EMP_PRESETS.enfant, g = variante(EMP_PRESETS.enfant, 9);
    g.L = 17.5; g.foulee = 23;
    el.innerHTML = '<svg class="mja-demo-svg mja-traces" viewBox="0 0 300 170" preserveAspectRatio="xMidYMid slice"><rect x="-200" y="-20" width="700" height="210" fill="#5b5236"/>' +
      '<g class="dm"></g><circle class="dv" r="30" fill="#fff4d6" fill-opacity=".14" stroke="#8ff3ff" stroke-width="1.6" stroke-dasharray="4 4"/>' +
      '<g class="dj"><ellipse cx="0" cy="6" rx="10" ry="4" fill="#000" opacity=".3"/><circle r="8" fill="#3c9a62" stroke="' + CONTOUR + '" stroke-width="3"/><path d="M-4,-2 C-2,-6 2,-6 4,-2" stroke="#bff0cf" stroke-width="1.6" fill="none"/></g>' + MAIN + '</svg>';
    var svg = el.querySelector('svg'), gm = svg.querySelector('.dm'), j = svg.querySelector('.dj'), cv = svg.querySelector('.dv'), main = svg.querySelector('.mja-main');
    var s1 = formeSemelle(f), s2 = formeSemelle(g), prints = [];
    function xb(y){ return y > 40 ? 150 : 150 - (40 - y) * 1.1; }
    function xl(y){ return y > 40 ? 150 : 150 + (40 - y) * 1.1; }
    for(var y = 260, i = 0; y > -320; y -= 18, i++){
      prints.push({x:xb(y) + (i % 2 ? 4 : -4), y:y, s:s1, sx:i % 2 ? -1 : 1});
      if(y < 36) prints.push({x:xl(y) + (i % 2 ? 4 : -4), y:y, s:s2, sx:i % 2 ? -1 : 1});
    }
    gm.innerHTML = prints.map(function(q){ return '<g class="mja-empr" transform="translate(' + q.x.toFixed(1) + ',' + q.y + ') scale(' + q.sx + ',1)"><path class="e-f" d="' + q.s.d + '"/>' + q.s.det + '</g>'; }).join('');
    var els = gm.querySelectorAll('.mja-empr');
    main.style.transition = 'none';
    return demoBoucle(svg, function(dt, t){
      var c = (t % 6) / 6, dec = c * 360, dW = 120 - dec, xW = xb(dW), camX = xW;
      gm.setAttribute('transform', 'translate(' + (150 - camX).toFixed(1) + ',' + dec.toFixed(1) + ')');
      j.setAttribute('transform', 'translate(150,120)');
      cv.setAttribute('cx', 150); cv.setAttribute('cy', 106);
      for(var k = 0; k < els.length; k++){ var q = prints[k], dd = Math.hypot(q.x - camX, q.y + dec - 106); els[k].style.opacity = dd < 32 ? 1 : 0.07; }
      main.style.transform = 'translate(160px,148px)';
    });
  },
  jouer: function(el, p, fin){
    var P = Partie(fin);
    var cibleF = p.empreinte || EMP_PRESETS[p.suspect] || EMP_PRESETS.enfant;
    p.empreinte = cibleF;
    var hud = creerHud(el);
    var essais = p.essais;
    if(p.essais > 1) hud.vies(essais, p.essais);
    hud.barre(0);
    if(p.aide){ var badge = hud.badge(empreinteCarte(cibleF, 30)); badge.classList.add('large'); }
    var terrain = U.html('<div class="mja-terrain mja-traces"></div>');
    el.appendChild(terrain);
    var M = genererMonde(p), cible = M.cible, YB = 430, W = M.W, L = M.L;
    var id = nid('tr');
    /* météo : une pluie (bruine ou averse) sur une partie du chemin, du vent sur une autre */
    var meteo = {bruine:null, averse:null, vent:null}, tout = [M.D0 - 80, L + 2000];
    if(p.meteo === 'bruine' || p.meteo === 'averse' || p.meteo === 'vent') meteo[p.meteo] = tout;
    else if(!p.meteo){
      var r = Math.random(), a0 = U.rand(M.D0 + 60, L * 0.5), a1 = a0 + L * U.rand(0.3, 0.5);
      if(r < p.averse) meteo.averse = [a0, a1]; else if(r < p.averse + p.bruine) meteo.bruine = [a0, a1];
      if(Math.random() < p.vent){ var b0 = U.rand(M.D0 + 60, L * 0.6); meteo.vent = [b0, b0 + L * U.rand(0.25, 0.45)]; }
    }
    /* grosse pluie : deux motifs de traits déplacés par la boucle (pas d'animation CSS par trait) */
    function motifPluie(pid, n, taille){ var t2 = ''; for(var i = 0; i < n; i++){ var xr = U.rand(0, taille), yr = U.rand(0, taille); t2 += '<path d="M' + xr.toFixed(0) + ',' + yr.toFixed(0) + ' l-9,26"/>'; } return '<pattern id="' + pid + '" class="mja-motif-pluie" width="' + taille + '" height="' + taille + '" patternUnits="userSpaceOnUse">' + t2 + '</pattern>'; }
    var lignesPluie = '<defs>' + motifPluie(id + 'p1', 9, 130) + motifPluie(id + 'p2', 7, 97) + '</defs><rect x="' + DEC.x + '" y="' + DEC.y + '" width="' + DEC.w + '" height="' + DEC.h + '" fill="url(#' + id + 'p1)"/><rect x="' + DEC.x + '" y="' + DEC.y + '" width="' + DEC.w + '" height="' + DEC.h + '" fill="url(#' + id + 'p2)" opacity=".7"/>';
    terrain.innerHTML = '<svg viewBox="0 0 360 480" preserveAspectRatio="xMidYMid meet">' +
      '<defs><radialGradient id="' + id + 'n" class="mja-gr-nuit" cx="180" cy="300" r="60" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#090a1c" stop-opacity="0"/><stop offset=".45" stop-color="#090a1c" stop-opacity=".25"/><stop offset="1" stop-color="#090a1c" stop-opacity=".8"/></radialGradient>' +
        '<radialGradient id="' + id + 'b" class="mja-gr-bruine" cx="180" cy="300" r="250" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#8f97a8" stop-opacity=".06"/><stop offset=".22" stop-color="#8f97a8" stop-opacity=".14"/><stop offset=".5" stop-color="#9aa2b4" stop-opacity=".4"/><stop offset="1" stop-color="#a7aebd" stop-opacity=".66"/></radialGradient>' +
        '<pattern id="' + id + 'g" width="16" height="16" patternUnits="userSpaceOnUse"><rect width="16" height="16" fill="#9a907c"/><circle cx="3" cy="4" r="2.2" fill="#b8ad96"/><circle cx="11" cy="3" r="1.8" fill="#7d7462"/><circle cx="7" cy="11" r="2.4" fill="#ada28a"/><circle cx="14" cy="12" r="1.6" fill="#857b68"/><circle cx="2" cy="13" r="1.3" fill="#c4b9a2"/></pattern>' +
        '<linearGradient id="' + id + 'w" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2e6f9a"/><stop offset=".5" stop-color="#3f8fc0"/><stop offset="1" stop-color="#2a5f86"/></linearGradient></defs>' +
      '<rect x="' + DEC.x + '" y="' + DEC.y + '" width="' + DEC.w + '" height="' + DEC.h + '" fill="#5b5236"/>' +
      '<g class="mja-monde"><g class="mja-deco"></g><g class="mja-sol-z"></g><g class="mja-flous"></g><g class="mja-marques"></g><g class="mja-haut-z"></g><g class="mja-arr"></g></g>' +
      '<circle class="mja-vision-sol" r="30"/>' +
      '<g class="mja-pisteur-g"><ellipse cx="0" cy="6" rx="12" ry="5" fill="#000" opacity=".35"/>' +
        '<g class="mja-pisteur-corps" transform="scale(.72)"><path d="M-15,4 C-17,18 -8,28 0,30 C8,28 17,18 15,4 Z" fill="#245e3c" stroke="' + CONTOUR + '" stroke-width="4" stroke-linejoin="round"/>' +
        '<path d="M-6,-14 L-11,14 M9,-12 C17,-4 17,8 9,16" stroke="#8a5a33" stroke-width="3.5" fill="none" stroke-linecap="round"/>' +
        '<ellipse cx="0" cy="2" rx="17" ry="11" fill="#3c9a62" stroke="' + CONTOUR + '" stroke-width="4"/>' +
        '<circle cx="0" cy="-4" r="11" fill="#2f7a4c" stroke="' + CONTOUR + '" stroke-width="4"/><path d="M-6,-10 C-3,-15 3,-15 6,-10" stroke="#bff0cf" stroke-width="2.5" fill="none" stroke-linecap="round"/></g></g>' +
      '<g class="mja-feuilles-v"></g>' +
      '<g class="mja-bruine-g" opacity="0" display="none"><rect x="' + DEC.x + '" y="' + DEC.y + '" width="' + DEC.w + '" height="' + DEC.h + '" fill="url(#' + id + 'b)"/></g>' +
      '<g class="mja-nuit-g" opacity="0" display="none"><rect x="' + DEC.x + '" y="' + DEC.y + '" width="' + DEC.w + '" height="' + DEC.h + '" fill="url(#' + id + 'n)"/></g>' +
      '<g class="mja-pluie" opacity="0" display="none">' + lignesPluie + '</g>' +
      '<circle class="mja-vision-halo" r="30"/><circle class="mja-vision" r="30"/>' +
      '<rect class="mja-alerte-perdu" x="' + DEC.x + '" y="' + DEC.y + '" width="' + DEC.w + '" height="' + DEC.h + '" opacity="0" display="none"/>' +
    '</svg>';
    var svg = terrain.querySelector('svg');
    var vue = {x:0, y:0, w:360, h:480};
    cadrer(P, svg, {maxW:440, apres:function(x, y, w, h){ vue = {x:x, y:y, w:w, h:h}; }});
    var gMonde = svg.querySelector('.mja-monde'), gDeco = svg.querySelector('.mja-deco'), gSolZ = svg.querySelector('.mja-sol-z'), gHaut = svg.querySelector('.mja-haut-z'), gM = svg.querySelector('.mja-marques'), gFlous = svg.querySelector('.mja-flous'), gArr = svg.querySelector('.mja-arr');
    var gJ = svg.querySelector('.mja-pisteur-g'), corpsJ = svg.querySelector('.mja-pisteur-corps'), cercle = svg.querySelector('.mja-vision'), cercleSol = svg.querySelector('.mja-vision-sol');
    var nuitG = svg.querySelector('.mja-nuit-g'), bruineG = svg.querySelector('.mja-bruine-g'), pluieG = svg.querySelector('.mja-pluie'), gFeuilles = svg.querySelector('.mja-feuilles-v'), alerteR = svg.querySelector('.mja-alerte-perdu');

    /* ---- Zones dessinées sur toute la largeur du monde (y = -d) ---- */
    var X1 = -320, X2 = W + 320, s = '', h = '', motifs = [];
    M.zones.forEach(function(o){
      var y0 = -o.d1, y1 = -o.d0, H = o.d1 - o.d0;
      if(o.type === 'gravier'){
        s += '<rect x="' + X1 + '" y="' + (y0 - 5).toFixed(0) + '" width="' + (X2 - X1) + '" height="' + (H + 10).toFixed(0) + '" fill="#6d6352"/><rect x="' + X1 + '" y="' + y0.toFixed(0) + '" width="' + (X2 - X1) + '" height="' + H.toFixed(0) + '" fill="url(#' + id + 'g)"/>';
        s += '<path d="M' + X1 + ',' + (y0 - 2).toFixed(0) + ' L' + X2 + ',' + (y0 - 2).toFixed(0) + ' M' + X1 + ',' + (y1 + 2).toFixed(0) + ' L' + X2 + ',' + (y1 + 2).toFixed(0) + '" stroke="#4a4232" stroke-width="3" stroke-dasharray="10 6"/>';
      } else if(o.type === 'haie'){
        var rangs = Math.max(1, Math.round(H / 30));
        for(var rg = 0; rg < rangs; rg++) for(var x = X1 + (rg % 2) * 12; x < X2; x += U.rand(20, 28)){ var yy = y0 + H * (rg + 0.5) / rangs + U.rand(-6, 6), rr = U.rand(16, 23) + (rangs > 1 ? 3 : 0); h += '<circle cx="' + x.toFixed(0) + '" cy="' + yy.toFixed(0) + '" r="' + rr.toFixed(0) + '" fill="' + U.choix(['#245e3c', '#2a6a44', '#2f7a4c']) + '" stroke="' + CONTOUR + '" stroke-width="3"/>'; if(Math.random() < 0.25) h += '<circle cx="' + (x + U.rand(-6, 6)).toFixed(0) + '" cy="' + (yy - 4).toFixed(0) + '" r="2.4" fill="' + U.choix(['#e5484d', '#f6d23a', '#eef0ff']) + '"/>'; }
      } else if(o.type === 'eau'){
        s += '<rect x="' + X1 + '" y="' + (y0 - 6).toFixed(0) + '" width="' + (X2 - X1) + '" height="' + (H + 12).toFixed(0) + '" fill="#3b2c1e"/><rect x="' + X1 + '" y="' + y0.toFixed(0) + '" width="' + (X2 - X1) + '" height="' + H.toFixed(0) + '" fill="url(#' + id + 'w)"/>';
        [0.3, 0.7].forEach(function(fr){ var yv = y0 + H * fr - 6, pid = id + 'v' + (motifs.length); motifs.push('<pattern id="' + pid + '" class="mja-motif-v" width="40" height="12" x="0" y="' + yv.toFixed(0) + '" patternUnits="userSpaceOnUse"><path d="M0,6 q10,-5 20,0 t20,0" fill="none" stroke="#bfe6ff" stroke-width="2.5" stroke-opacity=".6"/></pattern>'); s += '<rect x="' + X1 + '" y="' + yv.toFixed(0) + '" width="' + (X2 - X1) + '" height="12" fill="url(#' + pid + ')"/>'; });
        for(var k = 0; k < W / 180; k++) s += '<ellipse cx="' + U.rand(X1, X2).toFixed(0) + '" cy="' + (y0 + H / 2).toFixed(0) + '" rx="9" ry="6" fill="#8a8aa0" stroke="' + CONTOUR + '" stroke-width="2.5"/>';
      } else if(o.type === 'cloture'){
        var yf = -(o.d0 + o.d1) / 2;
        h += '<path d="M' + X1 + ',' + (yf - 4).toFixed(0) + ' L' + X2 + ',' + (yf - 4).toFixed(0) + ' M' + X1 + ',' + (yf + 4).toFixed(0) + ' L' + X2 + ',' + (yf + 4).toFixed(0) + '" stroke="' + CONTOUR + '" stroke-width="6"/><path d="M' + X1 + ',' + (yf - 4).toFixed(0) + ' L' + X2 + ',' + (yf - 4).toFixed(0) + ' M' + X1 + ',' + (yf + 4).toFixed(0) + ' L' + X2 + ',' + (yf + 4).toFixed(0) + '" stroke="#a8743f" stroke-width="3"/>';
        for(var xp = X1; xp < X2; xp += 34) h += '<rect x="' + (xp - 4) + '" y="' + (yf - 9).toFixed(0) + '" width="8" height="18" rx="2" fill="#8a5a33" stroke="' + CONTOUR + '" stroke-width="2.5"/>';
      }
    });
    M.flaques.forEach(function(q){ s += '<ellipse cx="' + q.x.toFixed(0) + '" cy="' + (-q.d).toFixed(0) + '" rx="' + (q.rx + 7).toFixed(0) + '" ry="' + (q.ry + 5).toFixed(0) + '" fill="#3f2e1f" opacity=".7"/><ellipse cx="' + q.x.toFixed(0) + '" cy="' + (-q.d).toFixed(0) + '" rx="' + q.rx.toFixed(0) + '" ry="' + q.ry.toFixed(0) + '" fill="#3a5f96" stroke="' + CONTOUR + '" stroke-width="2"/><ellipse cx="' + (q.x - q.rx * 0.3).toFixed(0) + '" cy="' + (-q.d - 3).toFixed(0) + '" rx="' + (q.rx * 0.35).toFixed(0) + '" ry="2.5" fill="#a8d4ff" opacity=".6"/>'; });
    M.dalles.forEach(function(q){
      var pts = []; for(var k = 0; k < 7; k++){ var a = q.a + k / 7 * 6.283, rr = q.r * U.rand(0.85, 1.08); pts.push((q.x + Math.cos(a) * rr).toFixed(1) + ',' + (-q.d + Math.sin(a) * rr * 0.85).toFixed(1)); }
      s += '<path d="M' + pts.join(' L') + ' Z" fill="#8c8aa0" stroke="' + CONTOUR + '" stroke-width="3" stroke-linejoin="round"/><path d="M' + (q.x - q.r * 0.4).toFixed(0) + ',' + (-q.d - 2).toFixed(0) + ' l' + (q.r * 0.5).toFixed(0) + ',4" stroke="#6d6b82" stroke-width="2"/>';
    });
    M.rochers.forEach(function(q){ h += '<ellipse cx="' + q.x.toFixed(0) + '" cy="' + (-q.d + 6).toFixed(0) + '" rx="' + q.r.toFixed(0) + '" ry="' + (q.r * 0.6).toFixed(0) + '" fill="#000" opacity=".3"/><path d="M' + (q.x - q.r) + ',' + (-q.d + 4) + ' C' + (q.x - q.r) + ',' + (-q.d - q.r) + ' ' + (q.x + q.r) + ',' + (-q.d - q.r) + ' ' + (q.x + q.r) + ',' + (-q.d + 4) + ' Z" fill="#7d7a92" stroke="' + CONTOUR + '" stroke-width="3"/>'; });
    gSolZ.innerHTML = s; gHaut.innerHTML = h;
    if(motifs.length) svgFrag(svg.querySelector('defs'), motifs.join(''));
    var motifsV = Array.prototype.slice.call(svg.querySelectorAll('.mja-motif-v')), motifsPluie = svg.querySelectorAll('.mja-motif-pluie'), grNuit = svg.querySelector('.mja-gr-nuit'), grBruine = svg.querySelector('.mja-gr-bruine'), cercleHalo = svg.querySelector('.mja-vision-halo');
    /* arrivées : une par piste, éparpillées */
    var types = Object.keys(ARRIVEES_ART);
    M.arrivees.forEach(function(a){
      a.type = U.choix(types);
      a.g = svgNoeud('g', {'class':'mja-arrivee', transform:'translate(' + a.x.toFixed(1) + ',' + (-a.d).toFixed(1) + ') scale(1.25)'}, gArr);
      a.g.innerHTML = '<circle class="mja-arr-halo" r="21"/>' + ARRIVEES_ART[a.type] + '<text class="mja-arr-x" y="6" text-anchor="middle">✗</text>';
    });
    /* ---- Zones sans empreintes, zones mouillées ---- */
    function sansTrace(x, d){
      for(var i = 0; i < M.zones.length; i++){
        var o = M.zones[i];
        if(o.type === 'cloture'){ if(Math.abs(d - (o.d0 + o.d1) / 2) < 22) return true; }
        else if(o.type !== 'dalles' && d > o.d0 - 5 && d < o.d1 + 5) return true;
      }
      for(var j = 0; j < M.dalles.length; j++){ var q = M.dalles[j]; if(Math.hypot(x - q.x, (d - q.d) / 0.85) < q.r + 2) return true; }
      for(var k = 0; k < M.flaques.length; k++){ var f = M.flaques[k], u = (x - f.x) / f.rx, v = (d - f.d) / f.ry; if(u * u + v * v < 1.1) return true; }
      return false;
    }
    /* Après l'eau : pendant ~3,5 pas, TOUTES les pistes (la bonne aussi) ne laissent que la même tache de boue. */
    var mouilleL = cibleF.foulee * 3.6;
    function mouille(x, d){
      for(var i = 0; i < M.zones.length; i++){ var o = M.zones[i]; if(o.type === 'eau' && d > o.d1 && d < o.d1 + mouilleL) return true; }
      for(var k = 0; k < M.flaques.length; k++){ var f = M.flaques[k], u = (x - f.x) / (f.rx + 18), v = (d - f.d) / (f.ry + 18); if(u * u + v * v < 1) return true; }
      return false;
    }
    /* Après une clôture : on a sauté, les 1 ou 2 premiers pas sont plus grands et plus enfoncés. */
    function atterrissage(d, foulee){
      for(var i = 0; i < M.zones.length; i++){ var o = M.zones[i]; if(o.type !== 'cloture') continue; var mid = (o.d0 + o.d1) / 2; if(d > mid + 22 && d < mid + 22 + foulee * 1.9) return true; }
      return false;
    }
    var TACHE = 'M-6,-10 C-3,-15 5,-14 7,-8 C9,-2 8,6 6,10 C3,15 -4,15 -6,10 C-9,4 -9,-5 -6,-10 Z';
    /* ---- Empreintes : créées au fil du défilement ---- */
    var pistes = [cible].concat(M.leurres);
    pistes.forEach(function(t){ t.next = t.debut; t.k = 0; });
    var marques = [];
    function creerJusqua(dMax){
      pistes.forEach(function(t){
        while(t.next < Math.min(dMax, t.fin)){
          var d = t.next, x = t.x(d), pente = t.pente(d);
          t.next += t.f.foulee / Math.sqrt(1 + pente * pente); t.k++;
          if(sansTrace(x, d)) continue;
          var cote = t.k % 2 ? 1 : -1, rad = Math.atan(pente), off = t.f.L * 0.3 * cote;
          var px = x + Math.cos(rad) * off, pd = d - Math.sin(rad) * off;
          var boue = mouille(px, pd), saut = !boue && atterrissage(d, t.f.foulee), fs = formeSemelle(t.f), tr, contenu, forme;
          if(boue){
            /* la même tache pour tout le monde : même taille, même forme, seulement dans le sens de la marche */
            tr = 'translate(' + px.toFixed(1) + ',' + (-pd).toFixed(1) + ') rotate(' + (rad * 57.3).toFixed(0) + ')';
            contenu = '<ellipse class="e-tache" rx="11" ry="15"/><path class="e-f" d="' + TACHE + '"/>'; forme = TACHE;
          } else {
            var k = saut ? 1.3 : 1, ang = rad * 57.3 + t.f.ouvre * cote;
            tr = 'translate(' + px.toFixed(1) + ',' + (-pd).toFixed(1) + ') rotate(' + ang.toFixed(0) + ') scale(' + (cote > 0 ? -k : k) + ',' + k + ')';
            contenu = (saut ? '<path class="e-creux" d="' + fs.d + '"/>' : '') + '<path class="e-f" d="' + fs.d + '"/>' + fs.det; forme = fs.d;
          }
          var m = {x:px, d:pd, vrai:t.vrai, o:-1, of:-1};
          m.g = svgNoeud('g', {'class':'mja-empr' + (boue ? ' boue' : '') + (saut ? ' saut' : ''), transform:tr, opacity:'0'}, gM);
          m.g.innerHTML = contenu;
          if(p.nuit) m.fl = svgNoeud('path', {'class':'e-flou', d:forme, transform:tr, opacity:'0'}, gFlous);
          marques.push(m);
        }
      });
    }
    /* ---- Décor par tuiles autour de la caméra ; arbres serrés au bord du monde ---- */
    var tuiles = {};
    function decor(){
      var tx0 = Math.floor((camX + vue.x - 180 - 200) / 360), tx1 = Math.floor((camX + vue.x + vue.w - 180 + 200) / 360);
      var ty0 = Math.floor((cam + YB - (vue.y + vue.h) - 100) / 240), ty1 = Math.floor((cam + YB - vue.y + 300) / 240);
      for(var ix = tx0; ix <= tx1; ix++) for(var iy = ty0; iy <= ty1; iy++){
        var cle = ix + ',' + iy; if(tuiles[cle]) continue;
        var s2 = '', xa = ix * 360, da = iy * 240;
        if(Math.random() < 0.22){ var ya = -(da + U.rand(20, 200)), sl = U.rand(-0.5, 0.5); s2 += '<path d="M' + xa + ',' + (ya + sl * 0).toFixed(0) + ' L' + (xa + 360) + ',' + (ya - sl * 360).toFixed(0) + '" stroke="#7a6a4c" stroke-width="30" stroke-linecap="round" opacity=".5"/>'; }
        for(var i = 0; i < 14; i++){
          var x = xa + U.rand(0, 360), y = -(da + U.rand(0, 240)), r = Math.random();
          if(r < .3) s2 += '<path d="M' + x.toFixed(0) + ',' + y.toFixed(0) + ' l-3,-9 M' + x.toFixed(0) + ',' + y.toFixed(0) + ' l1,-11 M' + x.toFixed(0) + ',' + y.toFixed(0) + ' l5,-8" stroke="#7fa65a" stroke-width="2.4" stroke-linecap="round"/>';
          else if(r < .45) s2 += '<ellipse cx="' + x.toFixed(0) + '" cy="' + y.toFixed(0) + '" rx="' + U.rand(3, 7).toFixed(0) + '" ry="' + U.rand(2, 5).toFixed(0) + '" fill="#8b7a62" stroke="' + CONTOUR + '" stroke-width="1.5"/>';
          else if(r < .6) s2 += '<path d="M' + x.toFixed(0) + ',' + y.toFixed(0) + ' c8,-4 14,2 24,-3 M' + (x + 10).toFixed(0) + ',' + (y - 2).toFixed(0) + ' c4,6 2,10 8,14" stroke="#4a3220" stroke-width="3.5" fill="none" stroke-linecap="round"/>';
          else if(r < .72) s2 += '<g transform="translate(' + x.toFixed(0) + ',' + y.toFixed(0) + ')"><circle r="2.6" cx="-3" fill="' + U.choix(['#ef7fa8', '#f6d23a', '#eef0ff', '#b48cff']) + '"/><circle r="2.6" cx="3" fill="' + U.choix(['#ef7fa8', '#f6d23a', '#eef0ff']) + '"/><circle r="2.6" cy="-3" fill="#f6d23a"/></g>';
          else if(r < .86) s2 += '<path d="M' + x.toFixed(0) + ',' + y.toFixed(0) + ' c4,-6 11,-6 13,0 c-4,4 -9,4 -13,0 Z" fill="' + U.choix(['#c07a34', '#a5672e', '#d79a3c']) + '" transform="rotate(' + U.rand(0, 360).toFixed(0) + ' ' + x.toFixed(0) + ' ' + y.toFixed(0) + ')"/>';
          else s2 += '<ellipse cx="' + x.toFixed(0) + '" cy="' + y.toFixed(0) + '" rx="' + U.rand(18, 32).toFixed(0) + '" ry="' + U.rand(8, 14).toFixed(0) + '" fill="#4f472e" opacity=".55"/>';
        }
        if(xa < 30 || xa + 360 > W - 30){
          var bord = xa < 30 ? 0 : W;
          for(var yb = 0; yb < 240; yb += 26){ for(var kb = 0; kb < 4; kb++){ var xx = bord + (bord ? 1 : -1) * (kb * 30 + U.rand(0, 14)); s2 += '<circle cx="' + xx.toFixed(0) + '" cy="' + (-(da + yb + U.rand(0, 10))).toFixed(0) + '" r="' + U.rand(18, 26).toFixed(0) + '" fill="' + U.choix(['#1f4a34', '#245e3c', '#1a3f2c']) + '" stroke="' + CONTOUR + '" stroke-width="3"/>'; } }
        }
        var g = svgNoeud('g', {'data-d':da}, gDeco); g.innerHTML = s2; tuiles[cle] = g;
      }
      var dMin = cam + YB - (vue.y + vue.h) - 400;
      Object.keys(tuiles).forEach(function(c){ if(+tuiles[c].getAttribute('data-d') + 240 < dMin){ tuiles[c].parentNode.removeChild(tuiles[c]); delete tuiles[c]; } });
    }
    /* ---- Vent : feuilles devant ---- */
    var feuilles = [];
    for(var fI = 0; fI < 52; fI++){ var fe = {x:U.rand(-240, 600), y:U.rand(-200, 680), v:U.rand(90, 170), ph:U.rand(0, 6), r:U.rand(0, 360)}; fe.g = svgNoeud('path', {'class':'mja-feuille-v', d:'M-9,0 c6,-9 16,-9 19,0 c-6,6 -13,6 -19,0 Z', fill:U.choix(['#d79a3c', '#c07a34', '#e8b04a', '#7fa65a'])}, gFeuilles); feuilles.push(fe); }

    /* ---- État ---- */
    var cam = 0, camX = M.X0, px = M.X0, pd = 0, phase = 'depart', t = 0, fini = false, perduT = 0;
    var doigt = null, butMonde = null, clavier = {x:0, y:0}, reveles = [], iBruine = 0, iAverse = 0, iVent = 0;
    pd = cam + YB - 400;
    function ecranX(x){ return 180 + (x - camX); }
    function ecranY(d){ return YB - (d - cam); }
    /* Contrôles : on vise un point de l'écran, le Pisteur y marche ; la caméra le suit */
    var appui = null;
    function viser(e){ var pt = ptSVG(svg, e); if(e.pointerType === 'touch'){ var m = svg.getScreenCTM(); pt.y -= 34 / (m ? m.d : 1); } doigt = {x:pt.x, y:pt.y}; butMonde = null; }
    P.ecoute(svg, 'pointerdown', function(e){ e.preventDefault(); appui = e.pointerId; try{ svg.setPointerCapture(e.pointerId); }catch(er){} viser(e); });
    P.ecoute(svg, 'pointermove', function(e){ if(appui === e.pointerId) viser(e); });
    function lacher(e){ if(appui === e.pointerId){ appui = null; doigt = null; } }
    P.ecoute(svg, 'pointerup', lacher); P.ecoute(svg, 'pointercancel', lacher);
    P.ecoute(document, 'keydown', function(e){ var k = {ArrowLeft:[-1, 0], ArrowRight:[1, 0], ArrowUp:[0, -1], ArrowDown:[0, 1]}[e.key]; if(k){ clavier.x = k[0] || clavier.x; clavier.y = k[1] || clavier.y; e.preventDefault(); } });
    P.ecoute(document, 'keyup', function(e){ if(e.key === 'ArrowLeft' || e.key === 'ArrowRight') clavier.x = 0; if(e.key === 'ArrowUp' || e.key === 'ArrowDown') clavier.y = 0; });
    terrain.mjaViserMonde = function(x, d){ butMonde = (x === null) ? null : {x:x, d:d}; };
    terrain.mjaEtat = function(){ return {t:t, cam:cam, camX:camX, px:px, pd:pd, YB:YB, L:L, W:W, phase:phase, perduT:perduT, vue:vue, defile:p.defile,
      cible:function(d){ return cible.x(d); }, fourches:M.fourches.map(function(f){ return {d:f.d, x:f.x, leurres:f.leurres}; }),
      zones:M.zones.map(function(z){ return {type:z.type, d0:z.d0, d1:z.d1, x0:z.x0, x1:z.x1, leurres:z.leurres, court:z.court}; }),
      leurre:function(i, d){ return M.leurres[i].x(d); }, finLeurre:function(i){ var a = M.leurres[i].arrivee; return {x:a.x, d:a.d, debut:M.leurres[i].debut}; }, arrivee:{x:M.arrivees[0].x, d:M.arrivees[0].d}, meteo:meteo}; };

    /* Carte de départ : l'empreinte à retenir */
    function esc2(x){ return String(x).replace(/[&<>"]/g, function(c){ return {'&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;'}[c]; }); }
    var carteD = U.html('<div class="mja-depart"><div class="mja-depart-in"><span class="sur-titre">Retiens bien cette empreinte</span>' + empreinteCarte(cibleF, 96) + '<b>' + esc2(cibleF.nom || 'L\'empreinte du suspect') + '</b><span class="mja-depart-pt">Au début, elle est toute seule. Ensuite, la piste se sépare : ne la perds pas de vue !</span></div></div>');
    terrain.appendChild(carteD);
    P.apres(2800, function(){
      carteD.classList.add('part');
      P.apres(400, function(){ if(carteD.parentNode) carteD.parentNode.removeChild(carteD); });
      phase = 'marche';
    });
    function perdre(detail, ann){
      if(fini) return;
      phase = 'fin'; fini = true;
      if(ann) annonce(terrain, ann, 1600);
      M.arrivees[0].g.classList.add('bonne', 'revelee');
      P.finir({reussi:false, score:fixe(pd / L, 0, 1) * 0.5, erreurs:p.essais - essais + 1, detail:detail}, 1700);
    }
    function entrer(a){
      if(a.essaye) return;
      a.essaye = true;
      var q = pctDans(svg, terrain, ecranX(a.x), ecranY(a.d) - 34);
      if(a.cible){
        phase = 'fin'; fini = true;
        a.g.classList.add('bonne');
        U.son('victoire'); U.vibrer(40);
        flotter(terrain, q.x, q.y, 'C\'est lui !', 'ok');
        P.finir({reussi:true, score:1, erreurs:p.essais - essais, detail:'Tu as suivi la bonne piste jusqu\'au bout !'}, 1500);
        return;
      }
      essais--; if(p.essais > 1) hud.perdVie(essais, p.essais);
      a.g.classList.add('fausse');
      erreurSensorielle(terrain);
      flotter(terrain, q.x, q.y, 'Ce n\'est pas lui…', 'ko');
      if(essais <= 0) perdre('Tu as suivi la piste de quelqu\'un d\'autre…');
    }
    function cibleVisible(xMin, xMax, dTop){
      var d0 = Math.max(cible.debut, pd - 30), d1 = Math.min(cible.fin + 12, dTop);
      if(d0 > d1) return true;
      for(var d = d0; d <= d1; d += 14){ var x = cible.x(d); if(x > xMin - 6 && x < xMax + 6) return true; }
      return false;
    }

    P.boucle(function(dt){
      if(fini) return false;
      t += dt;
      /* le sol défile toujours, même à la fin */
      if(phase !== 'depart') cam += p.defile * dt;
      var dBas = cam + YB - (vue.y + vue.h), dHaut = cam + YB - vue.y;
      var xMin = camX + vue.x - 180, xMax = camX + vue.x + vue.w - 180;
      /* le Pisteur marche vers le doigt, à vitesse limitée */
      if(phase === 'marche'){
        var tx = null, td = null;
        if(butMonde){ tx = butMonde.x; td = butMonde.d; }
        else if(doigt){ tx = camX + (doigt.x - 180); td = cam + YB - doigt.y; }
        var vx = 0, vd = 0;
        if(tx !== null){ var dx = tx - px, ddd = td - pd, dd = Math.sqrt(dx * dx + ddd * ddd); if(dd > 1){ var v = Math.min(p.marche, dd * 8); vx = dx / dd * v; vd = ddd / dd * v; } }
        else if(clavier.x || clavier.y){ vx = clavier.x * p.marche; vd = -clavier.y * p.marche; }
        px = fixe(px + vx * dt, 24, W - 24); pd += vd * dt;
        pd = fixe(pd, cam + YB - (vue.y + vue.h - 26), cam + YB - (vue.y + 40));
        corpsJ.setAttribute('transform', 'rotate(' + (vx || vd ? Math.atan2(vx, vd) * 57.3 : 0).toFixed(0) + ') scale(.72)');
      } else if(phase === 'depart') pd = cam + YB - (vue.y + vue.h * 0.8);
      camX += (px - camX) * Math.min(1, dt * 3);
      creerJusqua(dHaut + 80);
      decor();
      hud.barre(fixe(pd / L, 0, 1));
      /* arrivées */
      if(phase === 'marche'){
        for(var ia = 0; ia < M.arrivees.length; ia++){ var a = M.arrivees[ia]; if(!a.essaye && Math.abs(a.x - px) < 18 && Math.abs(a.d - pd) < 18){ entrer(a); if(fini) return false; } }
        var aC = M.arrivees[0];
        if(aC.d < dBas - 14){ perdre('La bonne arrivée est passée sans toi…', '😵 Trop tard !'); return false; }
        /* la bonne piste doit rester à l'écran (devant le Pisteur) */
        if(!cibleVisible(xMin, xMax, dHaut)){ perduT += dt; if(perduT > p.grace){ perdre('Tu t\'es perdu : tu as perdu la trace !', '😵 Perdu !'); return false; } }
        else perduT = 0;
        var al = perduT > 0.9; if(alerteR._vis !== al){ alerteR._vis = al; alerteR.setAttribute('display', al ? 'inline' : 'none'); } if(al) alerteR.setAttribute('opacity', (0.16 + 0.12 * Math.sin(t * 12)).toFixed(2));
      }
      /* « revele » : après chaque obstacle, les pas suivants s'allument */
      if(p.revele) M.zones.forEach(function(o){ if(!o.vu && pd > o.d1 - 30){ o.vu = true; reveles.push({d0:o.d1, d1:o.d1 + cibleF.foulee * 5.5, fin:t + 1.9}); } });
      /* météo */
      var dm = pd + 60;
      function dans(z){ return z && dm > z[0] && dm < z[1] ? 1 : 0; }
      iBruine += (dans(meteo.bruine) - iBruine) * Math.min(1, dt * 1.2);
      iAverse += (dans(meteo.averse) - iAverse) * Math.min(1, dt * 1.2);
      iVent += (dans(meteo.vent) - iVent) * Math.min(1, dt * 1.2);
      function montre(g, o){ var vis = o > 0.02; if(g._vis !== vis){ g._vis = vis; g.setAttribute('display', vis ? 'inline' : 'none'); } if(vis) g.setAttribute('opacity', o.toFixed(2)); }
      montre(bruineG, iBruine); montre(pluieG, iAverse * 0.95); montre(nuitG, iAverse * 0.85); montre(gFeuilles, iVent);
      if(pluieG._vis){ motifsPluie[0].setAttribute('patternTransform', 'translate(' + (-(t * 120) % 130).toFixed(1) + ',' + ((t * 340) % 130).toFixed(1) + ')'); motifsPluie[1].setAttribute('patternTransform', 'translate(' + (-(t * 95) % 97).toFixed(1) + ',' + ((t * 270) % 97).toFixed(1) + ')'); }
      if(motifsV.length){ var dv = ((t * 22) % 40).toFixed(1); for(var mv = 0; mv < motifsV.length; mv++) motifsV[mv].setAttribute('patternTransform', 'translate(' + dv + ',0)'); }
      if(iVent > 0.02) feuilles.forEach(function(fe){
        fe.x += fe.v * dt; fe.y += Math.sin(t * 2 + fe.ph) * 30 * dt; fe.r += 200 * dt;
        if(fe.x > 610){ fe.x = -250; fe.y = U.rand(-200, 680); }
        fe.g.setAttribute('transform', 'translate(' + fe.x.toFixed(0) + ',' + fe.y.toFixed(0) + ') rotate(' + (fe.r % 360).toFixed(0) + ')');
      });
      /* dessin */
      var sx = ecranX(px), sy = ecranY(pd);
      var R = p.vision * (1 - 0.15 * Math.max(iBruine, iAverse)), cx = sx, cy = sy - R * 0.4;
      cercle.setAttribute('cx', cx.toFixed(1)); cercle.setAttribute('cy', cy.toFixed(1)); cercle.setAttribute('r', R.toFixed(1));
      cercleSol.setAttribute('cx', cx.toFixed(1)); cercleSol.setAttribute('cy', cy.toFixed(1)); cercleSol.setAttribute('r', R.toFixed(1));
      cercleHalo.setAttribute('cx', cx.toFixed(1)); cercleHalo.setAttribute('cy', cy.toFixed(1)); cercleHalo.setAttribute('r', R.toFixed(1));
      if(nuitG._vis){ grNuit.setAttribute('cx', cx.toFixed(1)); grNuit.setAttribute('cy', cy.toFixed(1)); grNuit.setAttribute('r', (R * 110 / 60).toFixed(1)); }
      if(bruineG._vis){ grBruine.setAttribute('cx', cx.toFixed(1)); grBruine.setAttribute('cy', cy.toFixed(1)); grBruine.setAttribute('r', (R * 170 / 20).toFixed(1)); }
      gMonde.setAttribute('transform', 'translate(' + (180 - camX).toFixed(1) + ',' + (YB + cam).toFixed(1) + ')');
      gJ.setAttribute('transform', 'translate(' + sx.toFixed(1) + ',' + sy.toFixed(1) + ')');
      /* empreintes : visibles dans le cercle (vision de nuit : floues au loin) */
      var garde = [], attenue = 1 - 0.3 * iAverse;
      for(var i = 0; i < marques.length; i++){
        var m = marques[i];
        if(m.d < dBas - 60){ m.g.parentNode.removeChild(m.g); if(m.fl) m.fl.parentNode.removeChild(m.fl); continue; }
        garde.push(m);
        var ex = ecranX(m.x) - cx, ey = ecranY(m.d) - cy, dist2 = Math.sqrt(ex * ex + ey * ey);
        var o = dist2 < R * 0.6 ? 1 : (dist2 > R ? 0 : 1 - (dist2 - R * 0.6) / (R * 0.4));
        if(m.vrai && reveles.length){ for(var k = 0; k < reveles.length; k++){ var rv = reveles[k]; if(t < rv.fin && m.d > rv.d0 && m.d < rv.d1){ o = 1; if(!m.rv){ m.rv = true; m.g.classList.add('revele'); } } } }
        o = Math.round(o * attenue * 10) / 10;
        if(o !== m.o){ m.o = o; m.g.setAttribute('opacity', o); }
        if(m.fl){ var of = dist2 > 700 ? 0 : Math.round((1 - o) * fixe(0.6 - dist2 / 560, 0.1, 0.6) * (1 - 0.6 * iBruine) * 10) / 10; if(of !== m.of){ m.of = of; m.fl.setAttribute('opacity', of); } }
      }
      marques = garde;
      if(reveles.length && reveles.every(function(rv){ return t > rv.fin; })){ reveles = []; marques.forEach(function(m){ if(m.rv){ m.rv = false; m.g.classList.remove('revele'); } }); }
    });
    return {arreter: P.arreter};
  }
});
