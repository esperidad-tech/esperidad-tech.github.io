/* textures-chene.js — les matières du VIEUX CHÊNE, LA NUIT (le film du rassemblement, enquête 2 ; Bible §12.63), peintes une fois
   sur des toiles au chargement : le ciel et ses étoiles, la lune, la forêt au loin, les arbres du chemin, le Vieux Chêne (son tronc,
   ses grosses branches, son feuillage), les gros rochers sur le trou, l'herbe et le chemin de terre, le village au loin.
   Tout est peint « de nuit » : du bleu sombre, la lune qui accroche le bord gauche des choses ; la lumière chaude des lanternes et
   le rouge de la fumée sont ajoutés par le film, par-dessus. Rien n'est tiré au hasard sans graine. */
(function(){
'use strict';
var U = window.CU, T = window.CTC = {};

function toile(w, h){ var c = document.createElement('canvas'); c.width = Math.max(2, Math.round(w)); c.height = Math.max(2, Math.round(h)); return c; }
function rgba(c, a){ return 'rgba(' + Math.round(c[0]) + ',' + Math.round(c[1]) + ',' + Math.round(c[2]) + ',' + a + ')'; }
function mel(a, b, k){ return [U.lerp(a[0], b[0], k), U.lerp(a[1], b[1], k), U.lerp(a[2], b[2], k)]; }
function rond(g, x, y, r){ g.beginPath(); g.arc(x, y, Math.max(.1, r), 0, 7); g.fill(); }
function tache(g, x, y, rx, ry, c, a){
  var gr = g.createRadialGradient(x, y, 0, x, y, 1);
  gr.addColorStop(0, rgba(c, a)); gr.addColorStop(1, rgba(c, 0));
  g.save(); g.translate(x, y); g.scale(rx, ry); g.translate(-x, -y); g.fillStyle = gr; g.beginPath(); g.arc(x, y, 1, 0, 7); g.fill(); g.restore();
}
var _grain = null;

/* ---------------------------------------------------------------- LE CIEL : un dégradé de nuit, des nuages fins, des étoiles */
T.ciel = function(o){
  var w = o.w, h = o.h, c = toile(w, h), g = c.getContext('2d'), R = U.hasard(o.graine || 3);
  var gr = g.createLinearGradient(0, 0, 0, h);
  gr.addColorStop(0, '#03050c'); gr.addColorStop(.35, '#080d22'); gr.addColorStop(.7, '#111c40'); gr.addColorStop(.9, '#1a2b52'); gr.addColorStop(1, '#20355a');
  g.fillStyle = gr; g.fillRect(0, 0, w, h);
  /* la lueur de la lune dans le ciel (le disque lui-même est une toile à part, plus fine) */
  if(o.lune){ tache(g, o.lune[0], o.lune[1], o.lune[2] * 7, o.lune[2] * 7, [150, 175, 235], .34); tache(g, o.lune[0], o.lune[1], o.lune[2] * 2.6, o.lune[2] * 2.6, [215, 228, 255], .42); }
  /* les étoiles : plus rares vers l'horizon ; quelques grosses, avec un petit halo */
  var n = Math.round(w * h / 2600);
  for(var i = 0; i < n; i++){
    var x = R() * w, y = Math.pow(R(), 1.5) * h * .92, b = Math.pow(R(), 2.2), r = .45 + b * 1.25;
    if(o.lune && Math.hypot(x - o.lune[0], y - o.lune[1]) < o.lune[2] * 2.2) continue;
    var teinte = R() < .2 ? [255, 226, 190] : R() < .5 ? [200, 216, 255] : [245, 245, 255];
    g.fillStyle = rgba(teinte, .35 + b * .65); rond(g, x, y, r);
    if(b > .82) tache(g, x, y, r * 5, r * 5, teinte, .3);
  }
  /* des voiles de nuages, en longues bandes, éclairés par la lune */
  for(var k = 0; k < 46; k++){
    var by = h * (.3 + R() * .5), bx = R() * w, lg = w * (.05 + R() * .16), ep = h * (.012 + R() * .03);
    var pres = o.lune ? U.clamp(1 - Math.hypot(bx - o.lune[0], by - o.lune[1]) / (w * .3), 0, 1) : 0;
    for(var q = 0; q < 7; q++) tache(g, bx + (R() - .5) * lg * 2, by + (R() - .5) * ep * 2, lg * (.5 + R() * .6), ep * (.6 + R()), mel([70, 86, 130], [170, 190, 235], pres), .05 + pres * .07);
  }
  return c;
};
T.lune = function(r){
  var p = r * .25, c = toile((r + p) * 2, (r + p) * 2), g = c.getContext('2d'), R = U.hasard(77), cx = r + p, cy = r + p;
  tache(g, cx, cy, r + p, r + p, [220, 232, 255], .5);
  var gr = g.createRadialGradient(cx - r * .25, cy - r * .25, r * .1, cx, cy, r);
  gr.addColorStop(0, '#fffef2'); gr.addColorStop(.7, '#f0eeda'); gr.addColorStop(1, '#cfd3c8');
  g.fillStyle = gr; rond(g, cx, cy, r);
  g.save(); g.beginPath(); g.arc(cx, cy, r, 0, 7); g.clip();
  /* les mers de la lune */
  [[-.3, -.28, .3], [.18, -.36, .22], [.3, .08, .26], [-.12, .3, .2], [-.46, .14, .14], [.02, -.02, .12]].forEach(function(m){
    tache(g, cx + m[0] * r, cy + m[1] * r, m[2] * r * (1 + R() * .3), m[2] * r, [150, 156, 150], .5);
  });
  for(var i = 0; i < 26; i++) tache(g, cx + (R() - .5) * r * 1.8, cy + (R() - .5) * r * 1.8, r * (.02 + R() * .05), r * (.02 + R() * .05), R() < .5 ? [255, 255, 250] : [160, 164, 160], .35);
  g.restore();
  return c;
};

/* ---------------------------------------------------------------- UNE TOUFFE DE FEUILLES (le pinceau de tous les feuillages)
   tons = [le dessous sombre, le milieu, le dessus, le bord que la lune accroche] ; la lumière vient d'en haut à gauche */
function feuille(g, x, y, l, e, rot){ g.save(); g.translate(x, y); g.rotate(rot); g.beginPath(); g.ellipse(0, 0, l, e, 0, 0, 7); g.fill(); g.restore(); }
function touffe(g, x, y, R0, tons, R, o){
  o = o || {};
  var k, a, d;
  /* la masse sombre, et des petites feuilles sur son bord (une silhouette de feuillage, pas un ballon) */
  g.fillStyle = rgba(tons[0], 1);
  for(k = 0; k < 9; k++){ a = R() * 7; d = R0 * .5 * R(); rond(g, x + Math.cos(a) * d, y + Math.sin(a) * d * .8, R0 * (.42 + .3 * R())); }
  for(k = 0; k < 34; k++){ a = R() * 7; d = R0 * (.74 + R() * .4); feuille(g, x + Math.cos(a) * d, y + Math.sin(a) * d * .85, R0 * (.06 + R() * .08), R0 * (.028 + R() * .03), R() * 7); }
  if(o.plat) return;
  /* les feuilles du milieu : partout, un peu plus vers la lumière (en haut à gauche) */
  for(k = 0; k < 70; k++){
    a = R() * 7; d = R0 * Math.sqrt(R()) * 1.02;
    g.fillStyle = rgba(mel(tons[0], tons[1], .45 + R() * .55), 1);
    feuille(g, x - R0 * .1 + Math.cos(a) * d, y - R0 * .14 + Math.sin(a) * d * .82, R0 * (.07 + R() * .07), R0 * (.03 + R() * .03), -.5 + (R() - .5) * 2.2);
  }
  /* le dessus */
  for(k = 0; k < 44; k++){
    a = R() * 7; d = R0 * Math.sqrt(R()) * .72;
    g.fillStyle = rgba(mel(tons[1], tons[2], .3 + R() * .7), 1);
    feuille(g, x - R0 * .26 + Math.cos(a) * d, y - R0 * .34 + Math.sin(a) * d * .7, R0 * (.06 + R() * .06), R0 * (.026 + R() * .026), -.5 + (R() - .5) * 1.8);
  }
  /* les feuilles que la lune accroche */
  for(k = 0; k < 14; k++){
    a = R() * 7; d = R0 * Math.sqrt(R()) * .5;
    g.fillStyle = rgba(mel(tons[2], tons[3], .3 + R() * .7), .9);
    feuille(g, x - R0 * .36 + Math.cos(a) * d, y - R0 * .5 + Math.sin(a) * d * .55, R0 * (.045 + R() * .04), R0 * (.018 + R() * .016), -.6 + (R() - .5) * 1.2);
  }
}
T.touffe = touffe;
var TONS_NUIT = [[6, 13, 15], [12, 28, 27], [22, 48, 44], [88, 128, 132]];
T.TONS = TONS_NUIT;

/* ---------------------------------------------------------------- LA FORÊT AU LOIN : une rangée de silhouettes, dans la brume
   o = {w, h, graine, ton:[r, g, b], brume:[r, g, b], n (arbres), hMin, hMax (leur hauteur, en part de h), lune (0 → 1 : le liseré)} */
T.foret = function(o){
  var w = o.w, h = o.h, c = toile(w, h), g = c.getContext('2d'), R = U.hasard(o.graine || 11), ton = o.ton || [9, 15, 26];
  var clair = mel(ton, [120, 150, 190], .2 * (o.lune == null ? 1 : o.lune));
  var arbres = [];
  for(var i = 0; i < o.n; i++) arbres.push({x:(i + R() * .9) / o.n * w, H:h * U.lerp(o.hMin || .5, o.hMax || .9, R()), sapin:R() < (o.sapins == null ? .3 : o.sapins)});
  /* (deux passes : une rangée du fond, plus claire, puis celle de devant) */
  [0, 1].forEach(function(passe){
    arbres.forEach(function(a, ai){
      if((ai % 2) !== passe) return;
      var tn = passe ? ton : mel(ton, o.brume || [60, 84, 130], .28);
      var l = a.H * (a.sapin ? .2 : .4) * (.8 + R() * .5), y0 = h - a.H;
      g.fillStyle = rgba(tn, 1);
      g.fillRect(a.x - a.H * .011, y0 + a.H * .3, a.H * .022, a.H * .7);
      if(a.sapin){
        for(var e = 0; e < 7; e++){
          var yy = y0 + a.H * (.04 + e * .12), ll = l * (.2 + e * .13);
          g.fillStyle = rgba(tn, 1);
          g.beginPath(); g.moveTo(a.x, yy - a.H * .1); g.lineTo(a.x + ll, yy + a.H * .1); g.lineTo(a.x + ll * .4, yy + a.H * .08); g.lineTo(a.x - ll * .4, yy + a.H * .08); g.lineTo(a.x - ll, yy + a.H * .1); g.closePath(); g.fill();
        }
      } else {
        var nb = 8 + Math.floor(R() * 6), pts = [];
        for(var q = 0; q < nb; q++) pts.push([a.x + (R() - .5) * l * 1.5, y0 + a.H * (.08 + R() * .42), l * (.22 + R() * .3)]);
        pts.forEach(function(p){ rond(g, p[0], p[1], p[2]); for(var k = 0; k < 9; k++){ var an = R() * 7; feuille(g, p[0] + Math.cos(an) * p[2], p[1] + Math.sin(an) * p[2], p[2] * .2, p[2] * .09, R() * 7); } });
      }
    });
  });
  /* le sous-bois : une ligne de buissons continue (on ne voit pas les pieds des troncs alignés) */
  g.fillStyle = rgba(ton, 1);
  for(var sb = 0; sb < w; sb += h * .05){ rond(g, sb + R() * h * .04, h * (.86 + R() * .08), h * (.07 + R() * .08)); }
  g.fillRect(0, h * .93, w, h * .07);
  /* la lune sur le haut des arbres */
  var lu = g.createLinearGradient(0, h * (1 - (o.hMax || .9)), 0, h * .7);
  lu.addColorStop(0, rgba([110, 140, 190], .2 * (o.lune == null ? 1 : o.lune))); lu.addColorStop(1, rgba([110, 140, 190], 0));
  g.globalCompositeOperation = 'source-atop'; g.fillStyle = lu; g.fillRect(0, 0, w, h);
  if(o.brume){
    /* une nappe de brume au-dessus du sol (le pied reste sombre : il se fond dans l'herbe) */
    var br = g.createLinearGradient(0, h, 0, h * .45), K = o.brumeK == null ? .6 : o.brumeK;
    br.addColorStop(0, rgba(o.brume, K * .1)); br.addColorStop(.12, rgba(o.brume, K * .4)); br.addColorStop(.3, rgba(o.brume, K * .7)); br.addColorStop(.6, rgba(o.brume, K * .3)); br.addColorStop(1, rgba(o.brume, 0));
    g.fillStyle = br; g.fillRect(0, 0, w, h);
  }
  g.globalCompositeOperation = 'source-over';
  return c;
};

/* ---------------------------------------------------------------- LE VILLAGE AU LOIN (derrière les villageois) : des toits, le clocher,
   quelques fenêtres encore allumées */
T.village = function(o){
  var w = o.w, h = o.h, c = toile(w, h), g = c.getContext('2d'), R = U.hasard(o.graine || 19), ton = [10, 14, 28];
  /* la colline */
  g.fillStyle = rgba(ton, 1); g.beginPath(); g.moveTo(0, h);
  for(var x = 0; x <= w; x += 20) g.lineTo(x, h * .62 - Math.sin(x / w * Math.PI) * h * .2 + U.fbm(x * .004, 5, 3) * h * .05);
  g.lineTo(w, h); g.closePath(); g.fill();
  var cx = w * .5, base = h * .45;
  /* le clocher */
  g.fillRect(cx - w * .012, base - h * .3, w * .024, h * .34);
  g.beginPath(); g.moveTo(cx - w * .017, base - h * .3); g.lineTo(cx, base - h * .44); g.lineTo(cx + w * .017, base - h * .3); g.closePath(); g.fill();
  g.fillStyle = 'rgba(255,196,110,.9)'; g.fillRect(cx - w * .003, base - h * .26, w * .006, h * .03);
  tache(g, cx, base - h * .245, w * .02, w * .02, [255, 180, 90], .35);
  /* les maisons */
  for(var i = 0; i < 26; i++){
    var mx = cx + (R() - .5) * w * .5, my = h * .47 - Math.sin(mx / w * Math.PI) * h * .2 + h * .2 + R() * h * .04, ml = w * (.014 + R() * .014), mh = h * (.05 + R() * .05);
    g.fillStyle = rgba(ton, 1); g.fillRect(mx - ml, my - mh, ml * 2, mh + h * .05);
    g.beginPath(); g.moveTo(mx - ml * 1.15, my - mh); g.lineTo(mx, my - mh - ml * 1.1); g.lineTo(mx + ml * 1.15, my - mh); g.closePath(); g.fill();
    if(R() < .55){ var fx = mx + (R() - .5) * ml, fy = my - mh * .6; g.fillStyle = 'rgba(255,190,100,' + (.6 + R() * .4) + ')'; g.fillRect(fx - ml * .16, fy, ml * .32, mh * .3); tache(g, fx, fy + mh * .15, ml * 1.2, ml * 1.2, [255, 170, 80], .3); }
  }
  var br = g.createLinearGradient(0, h, 0, h * .3);
  br.addColorStop(0, 'rgba(30,44,78,.6)'); br.addColorStop(1, 'rgba(30,44,78,0)');
  g.globalCompositeOperation = 'source-atop'; g.fillStyle = br; g.fillRect(0, 0, w, h); g.globalCompositeOperation = 'source-over';
  return c;
};

/* ---------------------------------------------------------------- L'ÉCORCE : un tronc entre deux bords xg(v), xd(v) (v : 0 en haut → 1 au sol)
   peint par bandes : la lune accroche le bord gauche, la droite est dans le noir ; des crevasses qui suivent le tronc */
function ecorce(g, h, xg, xd, R, o){
  o = o || {};
  var y, pas = 5, clairG = o.clair || [64, 78, 104], milieu = o.milieu || [27, 25, 26], sombre = o.sombre || [7, 6, 8], v0 = o.v0 || 0, v1 = o.v1 == null ? 1 : o.v1;
  for(y = v0 * h; y < v1 * h; y += pas){
    var v = y / h, a = xg(v), b = xd(v), gr = g.createLinearGradient(a, 0, b, 0), k = o.lune == null ? 1 : o.lune;
    gr.addColorStop(0, rgba(mel(milieu, clairG, k), 1)); gr.addColorStop(.1, rgba(mel(milieu, clairG, k * .5), 1)); gr.addColorStop(.3, rgba(milieu, 1)); gr.addColorStop(.75, rgba(mel(milieu, sombre, .8), 1)); gr.addColorStop(1, rgba(sombre, 1));
    g.fillStyle = gr; g.fillRect(a, y - .5, b - a, pas + 1);
  }
  /* les crevasses et leurs arêtes */
  var n = o.rides || 46;
  for(var i = 0; i < n; i++){
    var u = (i + R() * .8) / n, gra = 40 + i * 3.7, lw = 2.5 + R() * 8, depart = v1 - R() * .05, fin = v0 + R() * .12, ecl = U.clamp(1 - u * 1.9, 0, 1);
    var seg = false, px = 0, py = 0;
    for(var vv = depart; vv > fin; vv -= .012){
      var xa = xg(vv), xb = xd(vv), x = xa + (xb - xa) * (u + .035 * U.fbm(vv * 9, gra, 3) + .012 * U.bruit(vv * 60, gra + 1)), yy = vv * h;
      var plein = U.fbm(vv * 14 + i, gra + 9, 2) > -.28;
      if(seg && plein){
        g.strokeStyle = 'rgba(3,2,3,' + (.5 + .3 * R()) + ')'; g.lineWidth = lw * (.6 + .5 * U.bruit(vv * 30, gra)); g.beginPath(); g.moveTo(px, py); g.lineTo(x, yy); g.stroke();
        if(ecl > .02){ g.strokeStyle = 'rgba(140,160,200,' + (.04 + .26 * ecl * (o.lune == null ? 1 : o.lune)) + ')'; g.lineWidth = 1.6; g.beginPath(); g.moveTo(px - lw * .7, py); g.lineTo(x - lw * .7, yy); g.stroke(); }
        else { g.strokeStyle = 'rgba(90,76,64,.16)'; g.lineWidth = 1.2; g.beginPath(); g.moveTo(px - lw * .7, py); g.lineTo(x - lw * .7, yy); g.stroke(); }
      }
      seg = true; px = x; py = yy;
    }
  }
}
/* une grosse branche : un trait épais qui s'affine, courbé ; pts = [[x, y, épaisseur], …] */
function branche(g, pts, R, lune){
  var gauche = [], droite = [], i;
  for(i = 0; i < pts.length; i++){
    var p = pts[i], q = pts[Math.min(i + 1, pts.length - 1)], pr = pts[Math.max(i - 1, 0)], dx = q[0] - pr[0], dy = q[1] - pr[1], l = Math.hypot(dx, dy) || 1, nx = -dy / l, ny = dx / l;
    gauche.push([p[0] + nx * p[2] / 2, p[1] + ny * p[2] / 2]); droite.push([p[0] - nx * p[2] / 2, p[1] - ny * p[2] / 2]);
  }
  function ligne(L){ g.beginPath(); L.forEach(function(p, k){ if(k) g.lineTo(p[0], p[1]); else g.moveTo(p[0], p[1]); }); }
  var tout = gauche.concat(droite.slice().reverse());
  ligne(tout); g.closePath(); g.fillStyle = 'rgb(20,18,20)'; g.fill();
  g.save(); ligne(tout); g.closePath(); g.clip();
  /* le dessous dans le noir, le dessus (ou le côté gauche) accroché par la lune */
  var hautL = gauche.reduce(function(a, p){ return a + p[1] - p[0] * .5; }, 0) < droite.reduce(function(a, p){ return a + p[1] - p[0] * .5; }, 0) ? gauche : droite, basL = hautL === gauche ? droite : gauche;
  g.lineCap = 'round'; g.lineJoin = 'round';
  g.strokeStyle = 'rgba(2,2,3,.75)'; g.lineWidth = pts[0][2] * .7; ligne(basL); g.stroke();
  g.strokeStyle = 'rgba(52,64,88,' + (.7 * (lune == null ? 1 : lune)) + ')'; g.lineWidth = pts[0][2] * .34; ligne(hautL); g.stroke();
  g.strokeStyle = 'rgba(104,124,160,' + (.4 * (lune == null ? 1 : lune)) + ')'; g.lineWidth = pts[0][2] * .07; ligne(hautL); g.stroke();
  /* des rides le long de la branche */
  for(var r = 0; r < 5; r++){
    var u = (r + .5) / 5 - .5;
    g.strokeStyle = 'rgba(3,2,3,.55)'; g.lineWidth = 1.5 + R() * 3; g.beginPath();
    pts.forEach(function(p, k){ var q = pts[Math.min(k + 1, pts.length - 1)], pr = pts[Math.max(k - 1, 0)], dx = q[0] - pr[0], dy = q[1] - pr[1], l = Math.hypot(dx, dy) || 1; var x = p[0] - dy / l * p[2] * u * .8 + (R() - .5) * 4, y = p[1] + dx / l * p[2] * u * .8 + (R() - .5) * 4; if(k) g.lineTo(x, y); else g.moveTo(x, y); });
    g.stroke();
  }
  g.restore();
}

/* LE VIEUX CHÊNE : un tronc énorme et tordu, des racines qui s'étalent, un creux, de la mousse, quatre grosses branches.
   o = {w, h, graine, dos (vu de derrière : plus noir, pas de lune), lune (0 → 1)} — transparent autour */
T.chene = function(o){
  var w = o.w, h = o.h, c = toile(w, h), g = c.getContext('2d'), R = U.hasard(o.graine || 41), lune = o.dos ? .12 : (o.lune == null ? 1 : o.lune);
  var cx = function(v){ return w * (.5 + .018 * Math.sin(v * 5 + 1) - .03 * (1 - v)); };
  var demi = U.piste([[0, .15], [.3, .152], [.42, .128, 'l'], [.6, .122, 'l'], [.78, .14, 'l'], [.9, .19, 'l'], [.96, .26, 'l'], [1, .34, 'l']]);
  var bosse = function(v, s){ return 1 + .05 * U.fbm(v * 6, s, 3) + (v > .88 ? .12 * Math.abs(Math.sin(v * 46 + s)) * (v - .88) / .12 : 0); };
  var xg = function(v){ return cx(v) - demi(v) * w * bosse(v, 3); }, xd = function(v){ return cx(v) + demi(v) * w * bosse(v, 8); };
  var haut = .3;   /* la fourche */
  /* les grosses branches (derrière le tronc) */
  var B = [
    [[w * .46, h * .36, w * .17], [w * .36, h * .25, w * .14], [w * .25, h * .16, w * .1], [w * .15, h * .11, w * .07]],
    [[w * .5, h * .34, w * .16], [w * .5, h * .21, w * .13], [w * .47, h * .11, w * .09]],
    [[w * .55, h * .36, w * .17], [w * .66, h * .26, w * .14], [w * .77, h * .19, w * .1], [w * .86, h * .15, w * .07]],
    [[w * .58, h * .44, w * .12], [w * .7, h * .405, w * .095], [w * .8, h * .39, w * .075], [w * .88, h * .385, w * .055]],
    [[w * .42, h * .46, w * .1], [w * .3, h * .435, w * .08], [w * .2, h * .43, w * .06], [w * .13, h * .44, w * .045]]
  ];
  B.forEach(function(b){ branche(g, b, R, lune); });
  B.forEach(function(b){ var q = b[b.length - 2], e = b[b.length - 1]; [[q, .9], [e, 1.3], [[(q[0] + e[0]) / 2, (q[1] + e[1]) / 2 - h * .02], 1]].forEach(function(z){ touffe(g, z[0][0] + (R() - .5) * w * .05, z[0][1] - h * .01 + (R() - .5) * h * .03, w * .075 * z[1], TONS_NUIT, R); }); });
  /* le tronc */
  g.save(); g.beginPath(); g.moveTo(xg(haut), haut * h);
  var v;
  for(v = haut; v <= 1.001; v += .01) g.lineTo(xg(v), v * h);
  for(v = 1; v >= haut - .001; v -= .01) g.lineTo(xd(v), v * h);
  g.closePath(); g.clip();
  ecorce(g, h, xg, xd, R, {v0:haut - .02, lune:lune, rides:54});
  /* un creux noir (un vieux chêne en a toujours un) : une fente tordue, ses lèvres de bois */
  var kx = cx(.6) + w * .03, ky = h * .6;
  function creux(k){ g.beginPath(); g.moveTo(kx - w * .012 * k, ky - h * .05 * k); g.bezierCurveTo(kx + w * .04 * k, ky - h * .035 * k, kx + w * .036 * k, ky + h * .03 * k, kx + w * .004 * k, ky + h * .052 * k); g.bezierCurveTo(kx - w * .03 * k, ky + h * .03 * k, kx - w * .04 * k, ky - h * .02 * k, kx - w * .012 * k, ky - h * .05 * k); g.closePath(); }
  g.fillStyle = 'rgba(12,10,12,.55)'; creux(1.3); g.fill(); g.fillStyle = '#020102'; creux(1); g.fill();
  g.strokeStyle = 'rgba(120,138,170,' + (.18 * lune) + ')'; g.lineWidth = 2.5; g.beginPath(); g.moveTo(kx - w * .02, ky - h * .072); g.bezierCurveTo(kx - w * .05, ky - h * .04, kx - w * .058, ky, kx - w * .04, ky + h * .04); g.stroke();
  tache(g, cx(.8) - w * .08, h * .8, w * .05, h * .035, [70, 80, 96], .5);
  /* la mousse, du côté de la lune */
  for(var m = 0; m < 320; m++){ var mv = .55 + R() * .45, mu = Math.pow(R(), 1.8) * .5; g.fillStyle = 'rgba(' + Math.round(34 + R() * 30) + ',' + Math.round(70 + R() * 40) + ',' + Math.round(50 + R() * 20) + ',' + (.18 + R() * .3) + ')'; rond(g, xg(mv) + (xd(mv) - xg(mv)) * mu, mv * h, 2 + R() * 7); }
  /* le pied dans l'ombre de l'herbe */
  var om = g.createLinearGradient(0, h * .9, 0, h); om.addColorStop(0, 'rgba(3,6,6,0)'); om.addColorStop(1, 'rgba(3,6,6,.85)'); g.fillStyle = om; g.fillRect(0, h * .9, w, h * .1);
  g.restore();
  grainDedansSur(c, .45);
  return c;
};
/* le grain de la matière, multiplié (il assombrit, il n'éclaircit jamais), seulement là où la toile est peinte */
function grainDedansSur(c, a){
  if(!window.CT) return;
  _grain = _grain || CT.grain(3, 10, 5);
  var t = toile(c.width, c.height), g2 = t.getContext('2d');
  g2.fillStyle = g2.createPattern(_grain, 'repeat'); g2.fillRect(0, 0, c.width, c.height);
  g2.globalCompositeOperation = 'destination-in'; g2.drawImage(c, 0, 0);
  var g = c.getContext('2d');
  g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.globalCompositeOperation = 'multiply'; g.globalAlpha = Math.min(1, a * 1.3); g.drawImage(t, 0, 0); g.restore();
}

/* LE DOS DU CHÊNE, de tout près (derrière lui, l'homme en cape) : un mur d'écorce, noir, un bord à peine éclairé */
T.ecorceDos = function(o){
  var w = o.w, h = o.h, c = toile(w, h), g = c.getContext('2d'), R = U.hasard(o.graine || 53);
  var xg = function(v){ return w * (.02 + .03 * U.fbm(v * 4, 2, 3)) - (v > .86 ? (v - .86) * w * .5 : 0); }, xd = function(v){ return w * (.9 + .05 * U.fbm(v * 5, 6, 3)) + (v > .84 ? (v - .84) * w * .6 * Math.abs(Math.sin(v * 30)) : 0); };
  g.save(); g.beginPath(); g.moveTo(xg(0), 0);
  var v;
  for(v = 0; v <= 1.001; v += .01) g.lineTo(xg(v), v * h);
  for(v = 1; v >= -.001; v -= .01) g.lineTo(xd(v), v * h);
  g.closePath(); g.clip();
  /* (le bord droit accroche un peu de lumière : c'est de ce côté que sont les lanternes du village) */
  ecorce(g, h, function(v){ return xd(v); }, function(v){ return xg(v); }, R, {lune:.35, rides:60, clair:[120, 92, 64], milieu:[30, 26, 24], sombre:[6, 5, 6]});
  for(var m = 0; m < 260; m++){ var mv = .5 + R() * .5, mu = .5 + Math.pow(R(), 1.6) * .5; g.fillStyle = 'rgba(' + Math.round(24 + R() * 22) + ',' + Math.round(50 + R() * 30) + ',' + Math.round(36 + R() * 16) + ',' + (.2 + R() * .3) + ')'; rond(g, xg(mv) + (xd(mv) - xg(mv)) * mu, mv * h, 2 + R() * 8); }
  var om = g.createLinearGradient(0, h * .88, 0, h); om.addColorStop(0, 'rgba(2,4,4,0)'); om.addColorStop(1, 'rgba(2,4,4,.9)'); g.fillStyle = om; g.fillRect(0, h * .88, w, h * .12);
  var ha = g.createLinearGradient(0, 0, 0, h * .4); ha.addColorStop(0, 'rgba(2,3,5,.9)'); ha.addColorStop(1, 'rgba(2,3,5,0)'); g.fillStyle = ha; g.fillRect(0, 0, w, h * .4);
  g.restore();
  grainDedansSur(c, .5);
  return c;
};

/* ---------------------------------------------------------------- UN FEUILLAGE : des touffes dans une forme
   o = {w, h, graine, n, r:[min, max], tons, forme:function(x, y) -> vrai si on peut poser une touffe (x, y en parts), trous} */
T.feuillage = function(o){
  var w = o.w, h = o.h, c = toile(w, h), g = c.getContext('2d'), R = U.hasard(o.graine || 61), tons = o.tons || TONS_NUIT, L = [];
  var essais = 0;
  while(L.length < o.n && essais < o.n * 40){
    essais++;
    var x = R(), y = R();
    if(o.forme && !o.forme(x, y, R)) continue;
    var rt = U.lerp(o.r[0], o.r[1], Math.pow(R(), 1.4)), mg = rt * 1.25;
    /* (une touffe ne dépasse jamais de la toile : son bord serait coupé droit) */
    if(x * w < mg || x * w > w - mg || y * h < mg || y * h > h - mg) continue;
    L.push([x * w, y * h, rt]);
  }
  /* du haut vers le bas : les touffes du bas passent devant */
  L.sort(function(a, b){ return a[1] - b[1]; });
  L.forEach(function(t){ touffe(g, t[0], t[1], t[2], tons, R, {plat:o.plat}); });
  if(o.ombreBas){ var om = g.createLinearGradient(0, h * .45, 0, h); om.addColorStop(0, 'rgba(2,5,6,0)'); om.addColorStop(1, 'rgba(2,5,6,' + o.ombreBas + ')'); g.globalCompositeOperation = 'source-atop'; g.fillStyle = om; g.fillRect(0, 0, w, h); g.globalCompositeOperation = 'source-over'; }
  return c;
};

/* ---------------------------------------------------------------- LES GROS ROCHERS (ils bouchent le trou, au pied du chêne)
   o = {w, h, graine, blocs:[[cx, cy (le bas), rx, ry], …] (en parts de w, h), lune} */
T.rochers = function(o){
  var w = o.w, h = o.h, c = toile(w, h), g = c.getContext('2d'), R = U.hasard(o.graine || 71), lune = o.lune == null ? 1 : o.lune;
  (o.blocs || []).forEach(function(b, bi){
    var cx = b[0] * w, bas = b[1] * h, rx = b[2] * w, ry = b[3] * h, cy = bas - ry, n = 9, pts = [], k;
    for(k = 0; k < n; k++){
      var a = (k + (R() - .5) * .5) / n * Math.PI * 2, rr = 1 + .22 * (R() - .5) * 2 * (Math.sin(a) > .5 ? .3 : 1), s = Math.sin(a);
      /* le dessous est aplati (posé par terre) */
      pts.push([cx + Math.cos(a) * rx * rr, cy + (s > 0 ? Math.min(s * ry * rr * 1.2, ry * .97) : s * ry * rr)]);
    }
    function trace(){
      g.beginPath();
      for(k = 0; k < n; k++){ var p = pts[k], q = pts[(k + 1) % n], m1 = [U.lerp(p[0], q[0], .28), U.lerp(p[1], q[1], .28)], m2 = [U.lerp(p[0], q[0], .72), U.lerp(p[1], q[1], .72)]; if(k === 0) g.moveTo(m1[0], m1[1]); g.lineTo(m2[0], m2[1]); var r = pts[(k + 2) % n]; g.quadraticCurveTo(q[0], q[1], U.lerp(q[0], r[0], .28), U.lerp(q[1], r[1], .28)); }
      g.closePath();
    }
    /* l'ombre portée au sol */
    tache(g, cx + rx * .15, bas - ry * .04, rx * 1.25, ry * .22, [0, 0, 0], .75);
    trace();
    var gr = g.createLinearGradient(cx - rx * .7, cy - ry, cx + rx * .5, bas);
    gr.addColorStop(0, rgba(mel([44, 47, 58], [112, 124, 150], lune), 1)); gr.addColorStop(.22, 'rgb(56,60,74)'); gr.addColorStop(.55, 'rgb(31,33,43)'); gr.addColorStop(1, 'rgb(9,9,14)');
    g.fillStyle = gr; g.fill();
    g.save(); trace(); g.clip();
    /* des pans : la pierre est cassée, pas ronde (des zones un peu plus sombres ou plus claires, sans trait) */
    for(k = 0; k < 3; k++){
      var a1 = Math.PI * (1 + R()), x1 = cx + Math.cos(a1) * rx * 1.3, y1 = cy + Math.sin(a1) * ry * 1.3, a2 = a1 + 1.6 + R() * 1.6, x2 = cx + Math.cos(a2) * rx * 1.3, y2 = cy + Math.sin(a2) * ry * 1.3;
      var pan = g.createLinearGradient(x1, y1, x1 + (y1 - y2) * .25, y1 + (x2 - x1) * .25);
      pan.addColorStop(0, R() < .6 ? 'rgba(0,0,0,.34)' : 'rgba(150,168,205,.12)'); pan.addColorStop(1, 'rgba(0,0,0,0)');
      g.fillStyle = pan; g.beginPath(); g.moveTo(x1, y1); g.lineTo(x2, y2); g.lineTo(x2 + rx, y2 + ry * 2); g.lineTo(x1 + rx, y1 + ry * 2); g.closePath(); g.fill();
    }
    /* le grain, des taches de lichen, une fissure */
    for(k = 0; k < 420; k++){ g.fillStyle = R() < .55 ? 'rgba(0,0,0,.2)' : 'rgba(170,184,215,.09)'; rond(g, cx + (R() - .5) * rx * 2.2, cy + (R() - .5) * ry * 2.2, .6 + R() * 2.2); }
    for(k = 0; k < 9; k++) tache(g, cx + (R() - .5) * rx * 1.7, cy + (R() - .2) * ry * 1.4, rx * (.05 + R() * .1), ry * (.04 + R() * .07), [54, 78, 60], .4);
    g.strokeStyle = 'rgba(2,2,5,.75)'; g.lineWidth = 2; g.beginPath(); var fx = cx + (R() - .5) * rx, fy = cy - ry * .8; g.moveTo(fx, fy);
    for(k = 0; k < 6; k++){ fx += (R() - .5) * rx * .34; fy += ry * .24; g.lineTo(fx, fy); } g.stroke();
    /* le bas dans l'ombre et dans l'herbe */
    var om = g.createLinearGradient(0, bas - ry * .6, 0, bas); om.addColorStop(0, 'rgba(3,5,7,0)'); om.addColorStop(1, 'rgba(3,5,7,.9)'); g.fillStyle = om; g.fillRect(cx - rx * 1.4, bas - ry * .6, rx * 2.8, ry * .65);
    /* l'arête du haut, à gauche, que la lune accroche */
    g.strokeStyle = 'rgba(200,216,250,' + (.42 * lune) + ')'; g.lineWidth = 7; g.lineJoin = 'round'; trace(); g.save(); g.beginPath(); g.rect(cx - rx * 1.4, cy - ry * 1.4, rx * 1.65, ry * 1.45); g.clip(); trace(); g.stroke(); g.restore();
    g.restore();
    /* des brins d'herbe au pied */
    for(k = 0; k < 40; k++){ var hx = cx + (R() - .5) * rx * 2.3, hl = 8 + R() * 22; g.strokeStyle = 'rgba(' + Math.round(10 + R() * 12) + ',' + Math.round(26 + R() * 20) + ',' + Math.round(20 + R() * 12) + ',.95)'; g.lineWidth = 1.6 + R() * 1.6; g.beginPath(); g.moveTo(hx, bas + 2); g.quadraticCurveTo(hx + (R() - .5) * 8, bas - hl * .5, hx + (R() - .5) * 14, bas - hl); g.stroke(); }
  });
  return c;
};

/* ---------------------------------------------------------------- L'HERBE DE NUIT : une tuile qui se répète (le sol est grand) */
T.herbe = function(o){
  var N = o.n || 1024, c = toile(N, N), g = c.getContext('2d'), R = U.hasard(o.graine || 81), i;
  g.fillStyle = '#0a1310'; g.fillRect(0, 0, N, N);
  /* des plaques plus claires et plus sombres (qui se raccordent d'un bord à l'autre) */
  function partout(fn){ for(var dx = -1; dx <= 1; dx++) for(var dy = -1; dy <= 1; dy++) fn(dx * N, dy * N); }
  for(i = 0; i < 90; i++){ var x = R() * N, y = R() * N, rx = 40 + R() * 150, ry = 30 + R() * 110, cl = R() < .5 ? [22, 44, 32] : [3, 7, 6], al = .25 + R() * .3; partout(function(dx, dy){ tache(g, x + dx, y + dy, rx, ry, cl, al); }); }
  /* les brins : des milliers de petits traits */
  for(i = 0; i < 15000; i++){
    var bx = R() * N, by = R() * N, l = 5 + R() * 14, a = -Math.PI / 2 + (R() - .5) * 1.7, t = R();
    g.strokeStyle = t < .45 ? 'rgba(' + Math.round(14 + R() * 12) + ',' + Math.round(34 + R() * 22) + ',' + Math.round(24 + R() * 12) + ',.9)' : t < .8 ? 'rgba(4,10,8,.8)' : 'rgba(' + Math.round(50 + R() * 30) + ',' + Math.round(84 + R() * 30) + ',' + Math.round(76 + R() * 20) + ',.5)';
    g.lineWidth = .8 + R() * 1.3; g.beginPath(); g.moveTo(bx, by); g.lineTo(bx + Math.cos(a) * l, by + Math.sin(a) * l); g.stroke();
  }
  /* des feuilles mortes, des petites fleurs fermées */
  for(i = 0; i < 160; i++){ g.fillStyle = R() < .7 ? 'rgba(' + Math.round(50 + R() * 30) + ',' + Math.round(36 + R() * 18) + ',22,.7)' : 'rgba(150,160,190,.5)'; g.save(); g.translate(R() * N, R() * N); g.rotate(R() * 7); g.beginPath(); g.ellipse(0, 0, 2 + R() * 4, 1 + R() * 2, 0, 0, 7); g.fill(); g.restore(); }
  return c;
};
/* LE CHEMIN DE TERRE, posé sur l'herbe (transparent autour) : il vient du village (le bas de la toile est près de la caméra)
   o = {w, d, e (points par unité), graine, larg (sa largeur), cx:function(v) (son milieu, v : 0 au fond → 1 devant), place:[x, z, rx, rz] (un rond de terre battue),
        traces:[[x0, z0, x1, z1], …] (les rochers traînés dans l'herbe)} */
T.chemin = function(o){
  var e = o.e || .25, w = o.w * e, h = o.d * e, c = toile(w, h), g = c.getContext('2d'), R = U.hasard(o.graine || 91), i;
  g.scale(e, e);
  var cx = o.cx || function(){ return o.w / 2; }, larg = o.larg || 700;
  function bords(v){ var m = cx(v), l = larg * (.5 + .08 * U.fbm(v * 7, 4, 3)); return [m - l + U.fbm(v * 11, 9, 3) * 60, m + l + U.fbm(v * 13, 14, 3) * 60]; }
  var v;
  /* plusieurs passes de plus en plus étroites : le bord se fond dans l'herbe */
  [[1.25, 'rgba(22,22,19,.3)'], [1.08, 'rgba(28,26,22,.5)'], [.94, 'rgba(36,33,27,.8)'], [.7, 'rgba(42,38,31,.6)']].forEach(function(p){
    g.fillStyle = p[1]; g.beginPath();
    for(v = (o.v0 || 0); v <= 1.001; v += .01){ var b = bords(v), m = (b[0] + b[1]) / 2; if(v === (o.v0 || 0)) g.moveTo(m - (m - b[0]) * p[0], v * o.d); else g.lineTo(m - (m - b[0]) * p[0], v * o.d); }
    for(v = 1; v >= (o.v0 || 0) - .001; v -= .01){ var b2 = bords(v), m2 = (b2[0] + b2[1]) / 2; g.lineTo(m2 + (b2[1] - m2) * p[0], v * o.d); }
    g.closePath(); g.fill();
  });
  if(o.place){ var pl = o.place; [[1.2, .3], [1, .5], [.8, .6]].forEach(function(p){ tache(g, pl[0], pl[1], pl[2] * p[0], pl[3] * p[0], [38, 35, 29], p[1]); }); }
  /* les ornières, les cailloux */
  for(i = 0; i < 2; i++){
    g.strokeStyle = 'rgba(14,12,10,.5)'; g.lineWidth = 26; g.lineCap = 'round'; g.beginPath();
    for(v = (o.v0 || 0) + .02; v <= 1; v += .02){ var b3 = bords(v), x = U.lerp(b3[0], b3[1], i ? .68 : .32) + U.fbm(v * 20, i * 5 + 2, 2) * 30; if(v < (o.v0 || 0) + .03) g.moveTo(x, v * o.d); else g.lineTo(x, v * o.d); }
    g.stroke();
  }
  for(i = 0; i < o.d / 6; i++){ var vv = (o.v0 || 0) + R() * (1 - (o.v0 || 0)), b4 = bords(vv), px = U.lerp(b4[0], b4[1], R()), t = R(); g.fillStyle = t < .5 ? 'rgba(66,65,64,.7)' : t < .8 ? 'rgba(16,15,14,.7)' : 'rgba(96,102,116,.55)'; g.beginPath(); g.ellipse(px, vv * o.d, 4 + R() * 12, 3 + R() * 7, R() * 3, 0, 7); g.fill(); }
  /* les rochers traînés : de longues griffures sombres dans l'herbe, la terre retournée sur leurs bords */
  (o.traces || []).forEach(function(tr){
    for(var q = 0; q < 5; q++){
      var dec = (q - 2) * 26 + (R() - .5) * 10;
      g.strokeStyle = 'rgba(8,7,6,.55)'; g.lineWidth = 14 + R() * 16; g.lineCap = 'round'; g.beginPath(); g.moveTo(tr[0] + dec, tr[1]);
      g.bezierCurveTo(tr[0] + dec + (R() - .5) * 80, U.lerp(tr[1], tr[3], .3), tr[2] + dec + (R() - .5) * 80, U.lerp(tr[1], tr[3], .7), tr[2] + dec, tr[3]); g.stroke();
    }
    for(var k = 0; k < 60; k++){ var u = R(), xx = U.lerp(tr[0], tr[2], u) + (R() < .5 ? -1 : 1) * (70 + R() * 30), zz = U.lerp(tr[1], tr[3], u); g.fillStyle = 'rgba(62,54,42,.6)'; g.beginPath(); g.ellipse(xx, zz, 8 + R() * 16, 5 + R() * 9, R() * 3, 0, 7); g.fill(); }
  });
  return c;
};

/* ---------------------------------------------------------------- UNE RANGÉE D'ARBRES AU BORD DU CHEMIN (de gros troncs, les feuillages en haut)
   o = {w, h, graine, arbres:[[x (part de w), largeur du tronc (unités), penché], …], bas (des buissons au pied : 0 → 1), lune, sombre} */
T.rangee = function(o){
  var w = o.w, h = o.h, c = toile(w, h), g = c.getContext('2d'), R = U.hasard(o.graine || 101), lune = o.lune == null ? .6 : o.lune;
  var tons = o.tons || TONS_NUIT;
  (o.arbres || []).forEach(function(a, ai){
    var x0 = a[0] * w, l = a[1], pen = a[2] || 0;
    var cxa = function(v){ return x0 + pen * (1 - v) * h * .3 + Math.sin(v * 4 + ai) * l * .12; };
    var dm = function(v){ return l * (.42 + .3 * Math.pow(v, 6) + .06 * U.fbm(v * 5, ai * 3 + 1, 2)); };
    var xg = function(v){ return cxa(v) - dm(v); }, xd = function(v){ return cxa(v) + dm(v); };
    /* deux branches */
    branche(g, [[cxa(.42), h * .42, l * .5], [cxa(.42) - l * 1.6, h * .3, l * .36], [cxa(.42) - l * 3.2, h * .22, l * .24], [cxa(.42) - l * 4.6, h * .18, l * .14]], R, lune);
    branche(g, [[cxa(.34), h * .34, l * .46], [cxa(.34) + l * 1.5, h * .22, l * .34], [cxa(.34) + l * 3, h * .14, l * .22], [cxa(.34) + l * 4.4, h * .1, l * .12]], R, lune);
    g.save(); g.beginPath(); g.moveTo(xg(0), 0);
    var v;
    for(v = 0; v <= 1.001; v += .02) g.lineTo(xg(v), v * h);
    for(v = 1; v >= -.001; v -= .02) g.lineTo(xd(v), v * h);
    g.closePath(); g.clip();
    ecorce(g, h, xg, xd, R, {lune:lune, rides:Math.max(8, Math.round(l / 9)), sombre:o.sombre ? [4, 4, 6] : null});
    var om = g.createLinearGradient(0, h * .9, 0, h); om.addColorStop(0, 'rgba(3,6,6,0)'); om.addColorStop(1, 'rgba(3,6,6,.9)'); g.fillStyle = om; g.fillRect(0, h * .9, w, h * .1);
    g.restore();
  });
  /* les feuillages, en haut : une masse continue, avec des trous */
  var nb = Math.round(w / 60);
  var L = [];
  for(var i = 0; i < nb; i++){ var fx = R() * w, fy = Math.pow(R(), 1.6) * h * (o.feuilles || .34); L.push([fx, fy, 70 + R() * 130]); }
  L.sort(function(p, q){ return p[1] - q[1]; });
  L.forEach(function(t){ touffe(g, t[0], t[1], t[2], tons, R); });
  /* les buissons et les fougères, au pied (bas : on doit voir entre les troncs) */
  if(o.bas){
    var nb2 = Math.round(w / 150 * o.bas), L2 = [];
    for(var j = 0; j < nb2; j++){ var ar = o.arbres[Math.floor(R() * o.arbres.length)], rr = 22 + R() * 34; L2.push([ar[0] * w + (R() - .5) * 520, h - rr * (.5 + R() * .5), rr]); }
    L2.sort(function(p, q){ return p[1] - q[1]; });
    L2.forEach(function(t){ touffe(g, t[0], t[1], t[2], tons, R); });
    /* des fougères : des éventails de frondes */
    for(var f = 0; f < nb2 * 1.5; f++){
      var ar2 = o.arbres[Math.floor(R() * o.arbres.length)], fx2 = ar2[0] * w + (R() - .5) * 700, nf = 5 + Math.floor(R() * 4), lf = 26 + R() * 40;
      for(var q = 0; q < nf; q++){
        var an = -Math.PI / 2 + (q / (nf - 1) - .5) * 2.2 + (R() - .5) * .2, ex = fx2 + Math.cos(an) * lf, ey = h - 2 + Math.sin(an) * lf * .9;
        g.strokeStyle = rgba(mel(tons[0], tons[2], R()), 1); g.lineWidth = 2.2; g.lineCap = 'round'; g.beginPath(); g.moveTo(fx2, h); g.quadraticCurveTo(fx2 + Math.cos(an) * lf * .6, h - lf * .7, ex, ey); g.stroke();
        for(var z = 2; z < 9; z++){ var kq = z / 9, px = U.lerp(fx2, ex, kq) + Math.cos(an) * lf * .1 * (1 - kq), py = U.lerp(h, ey, kq) - lf * .25 * Math.sin(kq * Math.PI); g.lineWidth = 1.4; g.beginPath(); g.moveTo(px - 5 * (1 - kq) - 2, py + 3); g.lineTo(px, py); g.lineTo(px + 5 * (1 - kq) + 2, py + 3); g.stroke(); }
      }
    }
  }
  grainDedansSur(c, .3);
  return c;
};

/* UN BUISSON (celui du pied du chêne, avec ses baies rouges) */
T.buisson = function(o){
  var w = o.w, h = o.h, c = toile(w, h), g = c.getContext('2d'), R = U.hasard(o.graine || 111), L = [];
  for(var i = 0; i < 16; i++){ var a = R() * Math.PI; L.push([w * .5 + Math.cos(a) * w * .3 * R(), h - 20 - Math.sin(a) * h * .55 * R() - h * .12, w * (.1 + R() * .12)]); }
  L.sort(function(p, q){ return p[1] - q[1]; });
  L.forEach(function(t){ touffe(g, t[0], t[1], t[2], o.tons || TONS_NUIT, R); });
  if(o.baies) for(var k = 0; k < 22; k++){ var bx = w * (.2 + R() * .6), by = h * (.3 + R() * .5); g.fillStyle = 'rgba(150,34,40,.9)'; rond(g, bx, by, 4 + R() * 3); g.fillStyle = 'rgba(255,170,170,.5)'; rond(g, bx - 1.5, by - 1.5, 1.4); }
  return c;
};
/* UN VOILE DE BRUME (posé debout, dans la profondeur) : une bande claire et transparente, plus dense en bas */
T.brume = function(o){
  var w = o.w, h = o.h, c = toile(w, h), g = c.getContext('2d'), R = U.hasard(o.graine || 121), coul = o.c || [120, 150, 200];
  for(var i = 0; i < 70; i++) tache(g, R() * w, h * (.5 + Math.pow(R(), .7) * .45), w * (.05 + R() * .12), h * (.05 + R() * .13), coul, (o.a || .08) * (.3 + R() * .7));
  return c;
};
})();
