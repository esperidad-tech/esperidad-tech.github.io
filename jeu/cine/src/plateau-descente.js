/* plateau-descente.js — LES DEUX DESCENTES (Romain, 17 novembre : « les deux cinématiques de l'entrée du donjon » ; Bible §13.62).
   Un troisième plateau pour l'atelier des films, vu par les yeux de l'équipe (les héros ne sont pas à l'image : chacun a le sien) :
     zone 'escalier' : l'escalier de pierre sous le clocher — le palier en haut, trente marches qui s'enfoncent, un couloir en bas,
                       une porte d'où vient une lueur froide ; des runes bleues gravées dans les murs ;
     zone 'puits'    : le vieux puits — le rebord, le fût de pierre (un octogone), un fond avec une petite arche qui mène plus loin.
   Même monde que les autres (x vers la droite, y vers le BAS, le sol du départ en y = 0, z vers la caméra ; la caméra regarde vers −z).
   Des plans texturés posés en 3D par le navigateur (matrix3d), floutés selon leur distance au point net ; leur luminosité dépend de la
   distance à la lanterne (E.lampe) et aux torches (PLATEAU_DESCENTE.TORCHES, que le film remplit à chaque image). Les personnages, les
   lumières et la poussière sont dessinés par-dessus (scene.js). */
(function(){
'use strict';
var U = window.CU, T = window.CT;
var W = 1440, H = 616, P = 1600;
var PD = window.PLATEAU_DESCENTE = {TORCHES:[], pret:false};
var PL = [];
function q(v){ return Math.round(v * 10000) / 10000; }

/* ---------------------------------------------------------------- les plans */
function mat(O, A, B){
  var N = [A[1] * B[2] - A[2] * B[1], A[2] * B[0] - A[0] * B[2], A[0] * B[1] - A[1] * B[0]], l = Math.hypot(N[0], N[1], N[2]) || 1;
  return 'matrix3d(' + [A[0], A[1], A[2], 0, B[0], B[1], B[2], 0, N[0] / l, N[1] / l, N[2] / l, 0, O[0], O[1], O[2], 1].map(q).join(',') + ')';
}
/* un rectangle de w × h unités : son coin en O ; sa largeur va le long de A, sa hauteur le long de B */
function quad(zone, src, w, h, O, A, B, o){
  o = o || {};
  var d = document.createElement('div');
  d.style.cssText = 'position:absolute;left:0;top:0;width:' + w + 'px;height:' + h + 'px;transform-origin:0 0;transform:' + mat(O, A, B) + ';' +
    (src ? 'background-image:url(' + src + ');background-size:100% 100%;' : '') + (o.css || '');
  PD.monde.appendChild(d);
  var p = {el:d, zone:zone, m:[O[0] + (A[0] * w + B[0] * h) / 2, O[1] + (A[1] * w + B[1] * h) / 2, O[2] + (A[2] * w + B[2] * h) / 2], fm:o.fm == null ? 12 : o.fm,
    rune:o.rune || 0, base:o.base == null ? 1 : o.base, shown:true, nu:o.nu || 0};
  PL.push(p);
  return p;
}
/* les textures de pierre de textures.js sont très sombres (elles sont faites pour un souterrain éclairé par ses torches) : on les relève une fois */
function url(c){
  if(c._brut) return c.toDataURL();
  var o = document.createElement('canvas'); o.width = c.width; o.height = c.height; var g = o.getContext('2d');
  g.filter = 'brightness(4.5) contrast(1.12) saturate(.8)'; g.drawImage(c, 0, 0);
  return o.toDataURL();
}

/* ---------------------------------------------------------------- les textures qu'on ajoute à celles de textures.js */
function toile(w, h){ var c = document.createElement('canvas'); c.width = Math.round(w); c.height = Math.round(h); c._brut = true; return c; }
function toileAraignee(g, x, y, r, sens, R){
  /* une toile d'araignée dans un coin : des rayons, des arcs qui pendent */
  g.save(); g.translate(x, y); g.scale(sens, 1); g.strokeStyle = 'rgba(205,205,195,.30)'; g.lineWidth = 1.2;
  var n = 6, i, j;
  for(i = 0; i < n; i++){ var a = i / (n - 1) * Math.PI / 2; g.beginPath(); g.moveTo(0, 0); g.lineTo(Math.cos(a) * r, Math.sin(a) * r); g.stroke(); }
  for(j = 1; j <= 5; j++){
    var rr = r * j / 5; g.beginPath();
    for(i = 0; i < n; i++){ var a2 = i / (n - 1) * Math.PI / 2, px = Math.cos(a2) * rr, py = Math.sin(a2) * rr + (j > 1 ? 4 + R() * 5 : 0) * Math.sin(Math.PI * (i + .5) / n); if(i) g.lineTo(px, py); else g.moveTo(px, py); }
    g.stroke();
  }
  g.restore();
}
/* des signes gravés qui luisent (bleu glacé) : une rangée de runes, sur fond transparent */
function runesToile(w, h, graine){
  var c = toile(w, h), g = c.getContext('2d'), R = U.hasard(graine);
  g.lineCap = 'round'; g.lineJoin = 'round';
  var n = Math.max(3, Math.floor(w / 78));
  for(var i = 0; i < n; i++){
    var cx = (i + .5) * w / n + (R() - .5) * 18, cy = h * .5 + (R() - .5) * 46, s = 20 + R() * 20, kind = Math.floor(R() * 6), a = R() * .5 - .25;
    g.save(); g.translate(cx, cy); g.rotate(a);
    [[18, 'rgba(60,200,255,.35)', 17], [7, 'rgba(120,230,255,.7)', 8], [3, 'rgba(165,232,255,1)', 3]].forEach(function(l){
      g.strokeStyle = l[1]; g.lineWidth = l[0]; g.shadowColor = 'rgba(70,215,255,.9)'; g.shadowBlur = l[2];
      g.beginPath();
      if(kind === 0){ g.arc(0, 0, s * .7, 0, 6.3); g.moveTo(0, -s * .7); g.lineTo(0, s * .7); }
      else if(kind === 1){ g.moveTo(-s * .6, -s); g.lineTo(s * .6, -s); g.lineTo(s * .6, s); g.lineTo(-s * .6, s); g.closePath(); g.moveTo(-s * .6, 0); g.lineTo(s * .6, 0); }
      else if(kind === 2){ g.moveTo(-s * .7, s); g.lineTo(0, -s); g.lineTo(s * .7, s); g.moveTo(-s * .35, s * .2); g.lineTo(s * .35, s * .2); }
      else if(kind === 3){ g.moveTo(0, -s); g.lineTo(0, s); g.moveTo(-s * .7, -s * .5); g.lineTo(0, 0); g.lineTo(s * .7, -s * .5); }
      else if(kind === 4){ g.moveTo(-s * .8, -s * .6); g.lineTo(s * .8, -s * .6); g.moveTo(0, -s * .6); g.lineTo(0, s); g.moveTo(-s * .5, s * .3); g.lineTo(s * .5, s * .3); }
      else { g.arc(0, 0, s * .45, .4, 5.9); g.moveTo(s * .45, 0); g.lineTo(s * .9, s * .6); }
      g.stroke();
    });
    g.restore();
  }
  return c;
}
/* de l'humidité verte : des plaques de mousse et des coulures (le puits) */
function humide(c, graine){
  var g = c.getContext('2d'), R = U.hasard(graine), w = c.width, h = c.height;
  g.globalCompositeOperation = 'source-atop';
  for(var i = 0; i < 9; i++){
    var x = R() * w, y = R() * h, r = 30 + R() * 80, gr = g.createRadialGradient(x, y, 2, x, y, r);
    gr.addColorStop(0, 'rgba(60,110,40,.55)'); gr.addColorStop(1, 'rgba(40,80,30,0)'); g.fillStyle = gr; g.fillRect(x - r, y - r, 2 * r, 2 * r);
  }
  for(var k = 0; k < 8; k++){
    var cx = R() * w, lg = 90 + R() * 260, la = 5 + R() * 10, co = g.createLinearGradient(0, 0, 0, lg);
    co.addColorStop(0, 'rgba(120,170,170,0)'); co.addColorStop(.25, 'rgba(110,160,160,.11)'); co.addColorStop(1, 'rgba(110,160,160,0)');
    g.save(); g.translate(cx, R() * h * .8); g.fillStyle = co; g.fillRect(-la / 2, 0, la, lg); g.restore();
  }
  g.globalCompositeOperation = 'source-over';
  return c;
}
function mur(w, h, graine, o){
  o = o || {};
  var c = T.mur({w:w, h:h, graine:graine, torches:o.torches || [], echelle:o.echelle || .8, arche:o.arche});
  if(o.toile){ var g = c.getContext('2d'), R = U.hasard(graine + 3), e = o.echelle || .8; g.save(); g.scale(e, e); toileAraignee(g, o.toile[0] > 0 ? w : 0, 0, o.toile[1], o.toile[0] > 0 ? -1 : 1, R); g.restore(); }
  if(o.humide) humide(c, graine + 9);
  return c;
}

/* ================================================================== L'ESCALIER */
var HW = 280, NS = 30, PZ = 70, PY = 36, HT = 660, ZTOP = 900, BAS = NS * PZ, YB = NS * PY, ZEND = -(BAS + 1500), SL = PY / PZ;
PD.ESC = {HW:HW, NS:NS, PZ:PZ, PY:PY, HT:HT, BAS:BAS, YB:YB, ZEND:ZEND, SL:SL, ZTOP:ZTOP};

function escalier(){
  var i, s, side;
  var segs = [{zn:ZTOP, zf:0, yn:0, sl:0, rune:0}];
  for(s = 0; s < 6; s++) segs.push({zn:-s * 350, zf:-(s + 1) * 350, yn:s * 5 * PY, sl:SL, rune:s >= 2 ? .35 + .13 * s : 0});
  segs.push({zn:-BAS, zf:-BAS - 750, yn:YB, sl:0, rune:1}); segs.push({zn:-BAS - 750, zf:ZEND, yn:YB, sl:0, rune:1});
  var murs = [], g = 0;
  segs.forEach(function(sg, k){
    var w = sg.zn - sg.zf, hh = HT + 60;
    [-1, 1].forEach(function(sd){
      var x = sd * HW, c = mur(w, hh, 31 + k * 5 + (sd > 0 ? 2 : 0), {toile:k % 3 === 1 ? [sd, 120] : null});
      quad('escalier', url(c), w, hh, [x, sg.yn - HT, sg.zn], [0, sg.sl, -1], [0, 1, 0], {base:1, fm:10});
      if(sg.rune){
        var rc = runesToile(w, 230, 71 + k * 3 + (sd > 0 ? 1 : 0));
        quad('escalier', url(rc), w, 230, [x - sd * 3, sg.yn - 390, sg.zn], [0, sg.sl, -1], [0, 1, 0], {rune:sg.rune, fm:6});
      }
    });
    /* le plafond (une voûte basse : de grandes dalles sombres) */
    var pl = T.sol({w:w, d:2 * HW, graine:61 + k, echelle:.55});
    quad('escalier', url(pl), w, 2 * HW, [-HW, sg.yn - HT, sg.zn], [0, sg.sl, -1], [1, 0, 0], {base:.3, fm:10});
  });
  /* le sol du palier et du couloir du bas */
  quad('escalier', url(T.sol({w:2 * HW, d:ZTOP, graine:81, echelle:.5})), 2 * HW, ZTOP, [-HW, 0, ZTOP], [1, 0, 0], [0, 0, -1], {fm:10});
  quad('escalier', url(T.sol({w:2 * HW, d:1500, graine:83, echelle:.5})), 2 * HW, 1500, [-HW, YB, -BAS], [1, 0, 0], [0, 0, -1], {fm:10});
  /* les marches : une dalle chacune, le bord (le nez de marche) plus clair */
  var dalles = []; for(i = 0; i < 6; i++) dalles.push(url(T.sol({w:2 * HW, d:PZ, graine:90 + i, echelle:.8})));
  for(i = 0; i < NS; i++) quad('escalier', dalles[i % 6], 2 * HW, PZ, [-HW, i * PY, -i * PZ], [1, 0, 0], [0, 0, -1], {fm:10, css:'box-shadow:inset 0 -7px 0 rgba(236,212,160,.30),inset 0 -14px 10px rgba(0,0,0,.25);'});
  /* le fond : la porte, d'où vient la lueur froide */
  var glow = toile(560, HT + 60), g2 = glow.getContext('2d'), gr = g2.createRadialGradient(280, 360, 10, 280, 360, 330);
  gr.addColorStop(0, 'rgba(165,232,255,1)'); gr.addColorStop(.25, 'rgba(110,215,255,.95)'); gr.addColorStop(1, 'rgba(8,24,40,1)'); g2.fillStyle = gr; g2.fillRect(0, 0, 560, HT + 60);
  quad('escalier', url(glow), 2 * HW, HT + 60, [-HW, YB - HT, ZEND - 60], [1, 0, 0], [0, 1, 0], {nu:1, fm:4});
  quad('escalier', url(mur(2 * HW, HT + 60, 55, {arche:{x:190, w:180, h:400}, torches:[]})), 2 * HW, HT + 60, [-HW, YB - HT, ZEND], [1, 0, 0], [0, 1, 0], {rune:1, fm:6});
}

/* ================================================================== LE PUITS */
var A8 = 290, W8 = 2 * A8 * Math.tan(Math.PI / 8), YT = -140, YW = 2300, SEG = 500, NSEG = Math.ceil((YW - YT) / SEG);
PD.PUITS = {A:A8, YT:YT, YW:YW, W8:W8};
function puits(){
  var k, m;
  for(k = 0; k < 8; k++){
    var th = k * Math.PI / 4, c = [A8 * Math.cos(th), A8 * Math.sin(th)], t = [-Math.sin(th), Math.cos(th)], n = [Math.cos(th), Math.sin(th)];
    for(m = 0; m < NSEG; m++){
      var y0 = YT + m * SEG, hh = Math.min(SEG, YW - y0), arc = (k === 0 && m === NSEG - 1);
      var cv = mur(W8, hh + (arc ? 0 : 0), 111 + k * 7 + m * 3, {humide:true, arche:arc ? {x:W8 / 2 - 78, w:156, h:Math.min(hh - 40, 330)} : null});
      quad('puits', url(cv), W8, hh, [c[0] - t[0] * W8 / 2, y0, c[1] - t[1] * W8 / 2], [t[0], 0, t[1]], [0, 1, 0], {fm:10, base:1});
    }
    /* le bord de la margelle (le dessus des pierres) et la terre autour */
    var wr = W8 + 2 * 120 * Math.tan(Math.PI / 8);
    quad('puitsHaut', url(T.sol({w:wr, d:120, graine:140 + k, echelle:.7})), wr, 120, [c[0] - t[0] * wr / 2, YT - 2, c[1] - t[1] * wr / 2], [t[0], 0, t[1]], [n[0], 0, n[1]], {fm:10});
    quad('puitsHaut', null, 2600, 3600, [c[0] - t[0] * 1300 + n[0] * 120, YT, c[1] - t[1] * 1300 + n[1] * 120], [t[0], 0, t[1]], [n[0], 0, n[1]], {fm:30, css:'background:linear-gradient(#0c140d,#05090a);', base:1});
  }
  /* le fond : de la terre, de la pierre, une flaque */
  quad('puits', url(T.sol({w:760, d:760, graine:150, echelle:.5})), 760, 760, [-380, YW, 380], [1, 0, 0], [0, 0, -1], {fm:10});
  /* la petite galerie, derrière l'arche du fond (côté +x) */
  var gx = A8, L = 900, Hg = 380, Wg = 230;
  quad('puits', url(T.sol({w:L, d:Wg, graine:151, echelle:.5})), L, Wg, [gx, YW, Wg / 2], [1, 0, 0], [0, 0, -1], {fm:10});
  quad('puits', url(T.sol({w:L, d:Wg, graine:152, echelle:.5})), L, Wg, [gx, YW - Hg, Wg / 2], [1, 0, 0], [0, 0, -1], {fm:10, base:.6});
  [-1, 1].forEach(function(sd){ quad('puits', url(mur(L, Hg, 153 + (sd > 0 ? 1 : 0), {humide:true})), L, Hg, [gx, YW - Hg, sd * Wg / 2], [1, 0, 0], [0, 1, 0], {fm:10}); });
  var glow = toile(Wg, Hg + 40), g2 = glow.getContext('2d'), gr = g2.createRadialGradient(Wg / 2, Hg * .6, 5, Wg / 2, Hg * .6, 260);
  gr.addColorStop(0, 'rgba(165,232,255,1)'); gr.addColorStop(.3, 'rgba(110,215,255,.9)'); gr.addColorStop(1, 'rgba(8,24,40,1)'); g2.fillStyle = gr; g2.fillRect(0, 0, Wg, Hg + 40);
  quad('puits', url(glow), Wg, Hg, [gx + L, YW - Hg, Wg / 2], [0, 0, -1], [0, 1, 0], {nu:1, fm:4});
  PD.GALERIE = {x0:gx, x1:gx + L, y:YW, h:Hg, w:Wg};
}

/* ================================================================== construire / image */
PD.construire = function(racine){
  var vue = document.createElement('div');
  vue.id = 'vueDesc';
  vue.style.cssText = 'position:absolute;left:0;top:0;width:' + W + 'px;height:' + H + 'px;perspective:' + P + 'px;perspective-origin:50% 50%;overflow:hidden;background:#030306';
  var monde = document.createElement('div');
  monde.style.cssText = 'position:absolute;left:' + W / 2 + 'px;top:' + H / 2 + 'px;width:0;height:0;transform-style:preserve-3d';
  vue.appendChild(monde); racine.appendChild(vue);
  PD.monde = monde; PD.vue = vue;
  escalier(); puits();
};
/* à chaque image : la caméra ; pour chaque plan, sa lumière (la lanterne, les torches), son flou, ses runes */
PD.image = function(E){
  var z = E.zone || 'escalier', t = window.CINE_T || 0, CAMr = window.CAM;
  PD.monde.style.transform = CAMr.transformCSS();
  PD.TORCHES.length = 0; (E.torches || []).forEach(function(q2){ PD.TORCHES.push(q2); });
  var L = E.lampe || [CAMr.x - 90, CAMr.y + 70, CAMr.z - 40], force = E.lumiere == null ? 1 : E.lumiere, ras = E.ambiance == null ? .10 : E.ambiance;
  var fl = window.CFX ? window.CFX.lueur(t, 3) : 1, rayon = E.rayon || 640;
  PL.forEach(function(p){
    var show = p.zone === z || (p.zone === 'puitsHaut' && z === 'puits' && E.haut); if(show !== p.shown){ p.el.style.display = show ? '' : 'none'; p.shown = show; }
    if(!show) return;
    var pr = CAMr.projeter(p.m[0], p.m[1], p.m[2]);
    if(p.rune){
      var op = (E.runes == null ? 0 : E.runes) * (.78 + .22 * Math.sin(t * 2.1 + p.m[2] * .004 + p.m[0] * .01)) * (p.rune > 1 ? 1 : p.rune);
      if(op < .01){ p.el.style.display = 'none'; p.shown = false; return; }
      p.el.style.display = ''; p.shown = true; p.el.style.opacity = U.r(U.clamp(op, 0, 1));
    }
    var f = Math.min(CAMr.flou(pr.d), p.fm), loc = f / Math.max(pr.s, .05);
    var dl = Math.hypot(p.m[0] - L[0], p.m[1] - L[1], p.m[2] - L[2]), b = ras + 1.45 * force * fl * Math.exp(-Math.pow(dl / rayon, 1.25));
    PD.TORCHES.forEach(function(tq){ var dt = Math.hypot(p.m[0] - tq[0], p.m[1] - tq[1], p.m[2] - tq[2]); b += .9 * Math.exp(-dt / 330); });
    if(p.nu){ b = 1; }
    else if(E.froid && E.froid.cible) { var dg = Math.hypot(p.m[0] - E.froid.cible[0], p.m[1] - E.froid.cible[1], p.m[2] - E.froid.cible[2]); b += E.froid.k * Math.exp(-dg / 480); }
    /* les textures de pierre sont très sombres (faites pour le souterrain éclairé de plateau.js) : on les relève ici */
    /* la lumière : une opacité sur le fond noir (un filtre « brightness » sur un plan énorme, tout près de la caméra, n'est pas peint
       par le navigateur : dans le puits, les murs sont à 300 unités) ; le flou seulement pour ce qui est loin (petit à peindre) */
    b = U.clamp(b * p.base, .03, 1.4);
    if(!p.rune) p.el.style.opacity = p.nu ? 1 : U.r(b / 1.4);
    p.el.style.filter = (loc > .5 && pr.d > 500 ? 'blur(' + U.r(loc) + 'px)' : '');
  });
};
})();
