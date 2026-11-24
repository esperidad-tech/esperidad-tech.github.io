/* Les personnages du combat final (E10) : Grosbec dans son armure et ses automates.
   Dessinés au canevas, en volume (dégradés, reflets, liseré de lumière), comme les héros du donjon.
   Repère : les pieds au point (0, 0), le haut vers les y négatifs ; une unité = un pixel du combat.
   PC.automate(ctx, type, o) et PC.grosbec(ctx, o) dessinent autour de (0, 0) dans le repère courant. */
(function (G) {
  "use strict";
  var PC = {};

  /* ---------- couleurs ---------- */
  function rgb(h) { if (h.charAt(0) === "#") { var n = parseInt(h.slice(1), 16); return [n >> 16 & 255, n >> 8 & 255, n & 255]; } var m = h.match(/\d+(\.\d+)?/g); return [+m[0], +m[1], +m[2]]; }
  function hex(c) { return "rgb(" + Math.round(c[0]) + "," + Math.round(c[1]) + "," + Math.round(c[2]) + ")"; }
  function mix(a, b, t) { var A = rgb(a), B = rgb(b); return hex([A[0] + (B[0] - A[0]) * t, A[1] + (B[1] - A[1]) * t, A[2] + (B[2] - A[2]) * t]); }
  function clair(c, t) { return mix(c, "#FFFFFF", t); }
  function sombre(c, t) { return mix(c, "#000000", t); }
  function rgba(c, a) { var A = rgb(c); return "rgba(" + A[0] + "," + A[1] + "," + A[2] + "," + a + ")"; }
  PC.mix = mix;

  /* ---------- formes ---------- */
  function capsule(ctx, x1, y1, x2, y2, r1, r2) {
    if (r2 === undefined) r2 = r1;
    var a = Math.atan2(y2 - y1, x2 - x1), n = a + Math.PI / 2;
    ctx.beginPath();
    ctx.arc(x1, y1, r1, n, n + Math.PI);
    ctx.lineTo(x2 + Math.cos(n + Math.PI) * r2, y2 + Math.sin(n + Math.PI) * r2);
    ctx.arc(x2, y2, r2, n + Math.PI, n + 2 * Math.PI);
    ctx.closePath();
  }
  function rrect(ctx, x, y, w, h, r) { ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath(); }
  function ell(ctx, x, y, rx, ry, rot) { ctx.beginPath(); ctx.ellipse(x, y, Math.max(0.1, rx), Math.max(0.1, ry), rot || 0, 0, Math.PI * 2); }
  /* la matière en volume : la lumière vient d'en haut à gauche */
  function volume(ctx, cx, cy, r, c, brillant) {
    var g = ctx.createRadialGradient(cx - r * 0.38, cy - r * 0.45, r * 0.05, cx, cy, r * 1.15);
    g.addColorStop(0, clair(c, brillant ? 0.55 : 0.32));
    g.addColorStop(0.45, c);
    g.addColorStop(1, sombre(c, 0.42));
    return g;
  }
  function trait(ctx, c, l) { ctx.strokeStyle = sombre(c, 0.6); ctx.lineWidth = l || 0.8; ctx.lineJoin = "round"; ctx.stroke(); }
  /* le liseré de lumière froide, sur le bord droit */
  function liseré(ctx, cx, cy, rx, ry, a0, a1, l) {
    ctx.strokeStyle = "rgba(190,225,255,.55)"; ctx.lineWidth = l || 0.7;
    ctx.beginPath(); ctx.ellipse(cx, cy, rx, ry, 0, a0, a1); ctx.stroke();
  }
  function rivet(ctx, x, y, r, c) { ctx.fillStyle = sombre(c, 0.3); ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fill(); ctx.fillStyle = clair(c, 0.6); ctx.beginPath(); ctx.arc(x - r * 0.3, y - r * 0.3, r * 0.45, 0, 7); ctx.fill(); }
  function lueur(ctx, x, y, r, c, a) {
    var g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, rgba(c, a)); g.addColorStop(1, rgba(c, 0));
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fill();
  }
  function flamme(ctx, x, y, h, t, k) {
    var w = h * 0.42, s = Math.sin(t * 13 + k * 2.1) * h * 0.12;
    var g = ctx.createLinearGradient(x, y, x, y - h);
    g.addColorStop(0, "rgba(255,90,30,.95)"); g.addColorStop(0.5, "rgba(255,170,50,.9)"); g.addColorStop(1, "rgba(255,240,150,.2)");
    ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(x - w, y);
    ctx.bezierCurveTo(x - w, y - h * 0.5, x + s - w * 0.2, y - h * 0.7, x + s, y - h);
    ctx.bezierCurveTo(x + s + w * 0.2, y - h * 0.7, x + w, y - h * 0.5, x + w, y); ctx.closePath(); ctx.fill();
    ctx.fillStyle = "rgba(255,250,200,.85)"; ctx.beginPath(); ctx.moveTo(x - w * 0.4, y);
    ctx.quadraticCurveTo(x + s * 0.5, y - h * 0.55, x + w * 0.4, y); ctx.closePath(); ctx.fill();
  }
  function eclair(ctx, x, y, l, rnd) {
    ctx.beginPath(); ctx.moveTo(x, y);
    for (var i = 0; i < 4; i++) { x += (rnd() - 0.5) * l; y += (rnd() - 0.5) * l; ctx.lineTo(x, y); }
    ctx.stroke();
  }

  /* ---------- les automates ---------- */
  /* Ce sont les vieux automates d'Elyra, réveillés par l'énergie de l'armure de Grosbec : une coque claire comme de la porcelaine
     et de la pierre, des articulations de métal d'en bas (bleuté), de l'émail de couleur selon leur sorte, et un cœur de cristal
     qui brille de la lumière ambrée de Grosbec. */
  var COQUE = "#E9E1CF", METAL = "#6F8597", NOYAU = "#FFB347";
  var SORTES = {
    rapide:   { email: "#2FA7BD", jambe: 9.5, rJ: 2.1, hanche: 3.1, bw: 6.6, bh: 9.5, rT: 5.0, rB: 1.8, bras: 8.2, poids: 0.7 },
    bouclier: { email: "#5E7FA6", jambe: 8.2, rJ: 2.7, hanche: 3.9, bw: 8.4, bh: 10.5, rT: 5.2, rB: 2.3, bras: 8.4, poids: 1 },
    lourd:    { email: "#9A6B3E", jambe: 7.2, rJ: 4.1, hanche: 6.4, bw: 14.5, bh: 14.5, rT: 5.4, rB: 3.8, bras: 12.5, poids: 1.6 },
    cracheur: { email: "#C0582C", jambe: 8.2, rJ: 2.7, hanche: 3.9, bw: 9.0, bh: 10.8, rT: 4.9, rB: 2.4, bras: 8.0, poids: 1 },
    souffleur:{ email: "#5F8C7C", jambe: 8.2, rJ: 2.7, hanche: 4.0, bw: 9.6, bh: 10.8, rT: 5.0, rB: 2.4, bras: 8.0, poids: 1 }
  };
  PC.SORTES = SORTES;
  var TERRE = { coque: "#C2703F", metal: "#9A5530", email: "#A85C34" };

  /* o : t (secondes), marche (0 à 1), face (-1 à 1 : il se tourne vers SA droite / gauche), etats {feu, mouille, farine, boue,
     statue, elec, meche, aveugle}, charge (le cracheur va cracher, 0 à 1), souffle (le soufflet, 0 à 1) */
  PC.automate = function (ctx, type, o) {
    o = o || {};
    var S = SORTES[type] || SORTES.rapide, E = o.etats || {}, t = o.t || 0, f = Math.max(-1, Math.min(1, o.face || 0));
    var coque = COQUE, metal = METAL, email = S.email, noyau = NOYAU;
    if (E.statue) { coque = TERRE.coque; metal = TERRE.metal; email = TERRE.email; }
    else if (E.farine) { coque = mix(coque, "#FFFFFF", 0.45); metal = mix(metal, "#EFEAE0", 0.55); email = mix(email, "#EFEAE0", 0.55); }
    else if (E.mouille) { coque = sombre(coque, 0.12); metal = sombre(metal, 0.1); email = sombre(email, 0.1); }
    if (E.feu) { coque = mix(coque, "#FF9A50", 0.25); email = mix(email, "#FF7A30", 0.2); }
    var vit = E.statue ? 0 : (o.marche || 0), ph = t * (S.poids > 1.3 ? 6 : S.poids < 0.9 ? 11 : 8.5);
    var bob = -Math.abs(Math.sin(ph)) * 0.9 * vit * (2 - S.poids * 0.5);
    var lev = [Math.max(0, Math.sin(ph)) * 2.4 * vit, Math.max(0, Math.sin(ph + Math.PI)) * 2.4 * vit];
    var sw = Math.sin(ph) * 0.38 * vit;
    var yH = -S.jambe + bob, bw = S.bw * (1 - 0.1 * Math.abs(f)), bh = S.bh, yB = yH - bh, rT = S.rT;
    var dx = f * bw * 0.42;            // les traits de devant glissent quand il se tourne
    ctx.save();

    /* le bras du fond (celui du côté où il ne se tourne pas) passe derrière */
    function bras(cote, devant) {
      var sx = cote * (bw + S.rB * 0.4), sy0 = yB + bh * 0.22, ang = (cote * 0.18) + (cote > 0 ? sw : -sw);
      if (type === "bouclier" && cote < 0) ang = 0.9 * -1;
      var ex = sx + Math.sin(ang) * S.bras * 0.55 + cote * 1.2, ey = sy0 + Math.cos(ang) * S.bras * 0.55;
      var hx = ex + Math.sin(ang * 1.4) * S.bras * 0.5, hy = ey + Math.cos(ang * 1.4) * S.bras * 0.48;
      if (type === "bouclier" && cote < 0) { hx = -bw * 0.2 + dx; hy = yB + bh * 0.65; }
      var c = devant ? metal : sombre(metal, 0.15);
      capsule(ctx, sx, sy0, ex, ey, S.rB, S.rB * 0.9); ctx.fillStyle = volume(ctx, (sx + ex) / 2, (sy0 + ey) / 2, S.rB * 2, c); ctx.fill(); trait(ctx, c);
      capsule(ctx, ex, ey, hx, hy, S.rB * 0.9, S.rB * 0.85); ctx.fillStyle = volume(ctx, (ex + hx) / 2, (ey + hy) / 2, S.rB * 2, c); ctx.fill(); trait(ctx, c);
      // l'épaule : une coque claire ; la main : une pince
      ell(ctx, sx, sy0, S.rB * 1.35, S.rB * 1.15); ctx.fillStyle = volume(ctx, sx, sy0, S.rB * 1.4, devant ? email : sombre(email, 0.15)); ctx.fill(); trait(ctx, email);
      var rm = type === "lourd" ? S.rB * 1.12 : S.rB * 1.05, cm = type === "lourd" ? sombre(email, 0.1) : coque;
      ell(ctx, hx, hy, rm, rm * 0.95); ctx.fillStyle = volume(ctx, hx, hy, rm, devant ? cm : sombre(cm, 0.12), true); ctx.fill(); trait(ctx, cm);
      if (type === "lourd") { ctx.strokeStyle = sombre(coque, 0.45); ctx.lineWidth = 0.6; ctx.beginPath(); ctx.moveTo(hx - rm * 0.6, hy - rm * 0.1); ctx.lineTo(hx + rm * 0.6, hy - rm * 0.1); ctx.stroke(); }
      return { hx: hx, hy: hy };
    }
    var cFond = f > 0 ? 1 : -1;
    if (f !== 0) bras(cFond, false);

    /* les jambes */
    for (var i = 0; i < 2; i++) {
      var cote = i ? 1 : -1, hx = cote * S.hanche, fx = cote * (S.hanche + 0.6) + (i ? 1 : -1) * 0.3, fy = -lev[i];
      var kx = (hx + fx) / 2 + cote * 0.9, ky = (yH + fy) / 2 - lev[i] * 0.3;
      var cj = E.boue ? "#6B4A2E" : metal;
      capsule(ctx, hx, yH, kx, ky, S.rJ, S.rJ * 0.9); ctx.fillStyle = volume(ctx, (hx + kx) / 2, (yH + ky) / 2, S.rJ * 2, cj); ctx.fill(); trait(ctx, cj);
      capsule(ctx, kx, ky, fx, fy - S.rJ * 0.6, S.rJ * 0.9, S.rJ * 0.8); ctx.fillStyle = volume(ctx, (kx + fx) / 2, (ky + fy) / 2, S.rJ * 2, cj); ctx.fill(); trait(ctx, cj);
      ell(ctx, kx, ky, S.rJ * 1.05, S.rJ * 0.95); ctx.fillStyle = volume(ctx, kx, ky, S.rJ, E.boue ? "#7A5534" : email); ctx.fill(); trait(ctx, email, 0.6);
      // le pied : un sabot de porcelaine
      ell(ctx, fx + cote * 0.3, fy - S.rJ * 0.45, S.rJ * 1.45, S.rJ * 0.85); ctx.fillStyle = volume(ctx, fx, fy - S.rJ * 0.5, S.rJ * 1.4, E.boue ? "#5A3C24" : coque); ctx.fill(); trait(ctx, coque);
    }
    if (E.boue) { ctx.fillStyle = "rgba(107,74,46,.9)"; for (var b = 0; b < 5; b++) { ell(ctx, (b - 2) * S.hanche * 0.7, -1 - (b % 2) * 2, 2.2 + (b % 3), 1.6); ctx.fill(); } }

    /* le bassin */
    rrect(ctx, -bw * 0.62, yH - 2.6, bw * 1.24, 3.8, 1.6); ctx.fillStyle = volume(ctx, 0, yH - 1, bw * 0.7, metal); ctx.fill(); trait(ctx, metal);

    /* le corps */
    if (type === "lourd") {
      // un gros tonneau de porcelaine cerclé de bronze
      ell(ctx, 0, yB + bh * 0.55, bw, bh * 0.62); ctx.fillStyle = volume(ctx, 0, yB + bh * 0.5, bw * 1.05, coque); ctx.fill(); trait(ctx, coque, 1);
      ctx.strokeStyle = sombre(email, 0.1); ctx.lineWidth = 2.2;
      [0.25, 0.78].forEach(function (k) { ctx.beginPath(); ctx.ellipse(0, yB + bh * k, bw * (1 - Math.abs(k - 0.55) * 0.55), bh * 0.12, 0, 0.15, Math.PI - 0.15); ctx.stroke(); });
      ctx.strokeStyle = clair(email, 0.35); ctx.lineWidth = 0.6; [0.25, 0.78].forEach(function (k) { ctx.beginPath(); ctx.ellipse(0, yB + bh * k - 0.6, bw * (1 - Math.abs(k - 0.55) * 0.55), bh * 0.12, 0, 0.6, 1.4); ctx.stroke(); });
      for (var rv = -2; rv <= 2; rv++) rivet(ctx, rv * bw * 0.32 + dx * 0.5, yB + bh * 0.25 + bh * 0.1, 0.8, email);
    } else if (type === "cracheur") {
      // un petit poêle : une coque avec une grille de foyer qui rougeoie
      rrect(ctx, -bw, yB, bw * 2, bh, 3.5); ctx.fillStyle = volume(ctx, 0, yB + bh * 0.4, bw * 1.1, email); ctx.fill(); trait(ctx, email, 1);
      rrect(ctx, -bw * 0.62 + dx, yB + bh * 0.38, bw * 1.24, bh * 0.44, 2); ctx.fillStyle = "#2A120A"; ctx.fill();
      var cg = 0.55 + 0.45 * Math.sin(t * 5) * 0.3 + (o.charge || 0) * 0.5;
      var gf = ctx.createLinearGradient(0, yB + bh * 0.8, 0, yB + bh * 0.4); gf.addColorStop(0, "rgba(255,120,40," + cg + ")"); gf.addColorStop(1, "rgba(255,210,90," + cg * 0.6 + ")");
      ctx.fillStyle = gf; rrect(ctx, -bw * 0.55 + dx, yB + bh * 0.42, bw * 1.1, bh * 0.36, 1.6); ctx.fill();
      ctx.strokeStyle = sombre(email, 0.55); ctx.lineWidth = 0.9; for (var gr = -2; gr <= 2; gr++) { ctx.beginPath(); ctx.moveTo(gr * bw * 0.22 + dx, yB + bh * 0.4); ctx.lineTo(gr * bw * 0.22 + dx, yB + bh * 0.82); ctx.stroke(); }
      lueur(ctx, dx, yB + bh * 0.6, bw * 1.3, "#FF8A3D", 0.25 + (o.charge || 0) * 0.35);
      rrect(ctx, -bw * 1.02, yB - 1, bw * 2.04, 3, 1.4); ctx.fillStyle = volume(ctx, 0, yB, bw, coque); ctx.fill(); trait(ctx, coque);
    } else if (type === "souffleur") {
      // un soufflet de cuir plissé entre deux plaques
      var sf = 0.5 + 0.5 * Math.sin(t * 2.2) * (1 - (o.souffle || 0)) - (o.souffle || 0) * 0.4, plis = bh * (0.5 + sf * 0.25);
      rrect(ctx, -bw, yB, bw * 2, 3.2, 1.5); ctx.fillStyle = volume(ctx, 0, yB, bw, coque); ctx.fill(); trait(ctx, coque);
      for (var pl = 0; pl < 4; pl++) {
        var py = yB + 3 + pl * plis / 4, pw = bw * (0.95 - (pl % 2) * 0.12);
        ctx.beginPath(); ctx.moveTo(-pw, py); ctx.lineTo(pw, py); ctx.lineTo(pw * 0.9, py + plis / 4); ctx.lineTo(-pw * 0.9, py + plis / 4); ctx.closePath();
        ctx.fillStyle = volume(ctx, 0, py + plis / 8, bw, pl % 2 ? sombre("#7A5534", 0.1) : "#8C6440"); ctx.fill(); trait(ctx, "#7A5534", 0.5);
      }
      var yBas = yB + 3 + plis;
      rrect(ctx, -bw, yBas, bw * 2, Math.max(3, yH - yBas), 1.5); ctx.fillStyle = volume(ctx, 0, yBas + 1, bw, email); ctx.fill(); trait(ctx, email);
    } else {
      // le buste : une coque claire, un plastron d'émail
      ctx.beginPath(); ctx.moveTo(-bw, yB + 2); ctx.quadraticCurveTo(-bw, yB - 0.5, -bw + 3, yB - 0.5); ctx.lineTo(bw - 3, yB - 0.5); ctx.quadraticCurveTo(bw, yB - 0.5, bw, yB + 2);
      ctx.lineTo(bw * 0.72, yB + bh); ctx.lineTo(-bw * 0.72, yB + bh); ctx.closePath();
      ctx.fillStyle = volume(ctx, 0, yB + bh * 0.4, bw * 1.1, coque); ctx.fill(); trait(ctx, coque, 0.9);
      ctx.beginPath(); ctx.moveTo(-bw * 0.62 + dx, yB + 1.4); ctx.lineTo(bw * 0.62 + dx, yB + 1.4); ctx.lineTo(bw * 0.42 + dx, yB + bh * 0.78); ctx.quadraticCurveTo(dx, yB + bh * 0.98, -bw * 0.42 + dx, yB + bh * 0.78); ctx.closePath();
      ctx.fillStyle = volume(ctx, dx - 1, yB + bh * 0.35, bw * 0.8, email, true); ctx.fill(); trait(ctx, email, 0.6);
      if (type === "rapide") { ctx.strokeStyle = clair(email, 0.75); ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(1.4 + dx, yB + 2.4); ctx.lineTo(-1.2 + dx, yB + bh * 0.42); ctx.lineTo(1 + dx, yB + bh * 0.42); ctx.lineTo(-1.4 + dx, yB + bh * 0.72); ctx.stroke(); }
    }
    /* le cœur de cristal, qui bat de la lumière de Grosbec */
    if (type !== "cracheur" && type !== "souffleur") {
      var bat = 0.6 + 0.4 * Math.sin(t * 4 + type.length), cx0 = dx, cy0 = type === "lourd" ? yB + bh * 0.5 : yB + bh * 0.33, rc = type === "lourd" ? 2.6 : 1.7;
      lueur(ctx, cx0, cy0, rc * 3.2, E.statue ? "#C2703F" : noyau, E.statue ? 0 : 0.35 * bat);
      ctx.beginPath(); ctx.moveTo(cx0, cy0 - rc * 1.3); ctx.lineTo(cx0 + rc, cy0); ctx.lineTo(cx0, cy0 + rc * 1.3); ctx.lineTo(cx0 - rc, cy0); ctx.closePath();
      ctx.fillStyle = E.statue ? sombre(TERRE.coque, 0.2) : clair(noyau, 0.3 * bat); ctx.fill(); trait(ctx, noyau, 0.5);
    }
    liseré(ctx, 0, yB + bh * 0.5, bw * 0.98, bh * 0.55, -0.9, 0.7, 0.8);

    /* la tête */
    var yT = yB - rT * 0.72 - (type === "lourd" ? -rT * 0.55 : 0), hdx = f * rT * 0.42;
    if (type !== "lourd") { rrect(ctx, -1.4, yB - rT * 0.5, 2.8, rT * 0.6, 0.8); ctx.fillStyle = metal; ctx.fill(); }
    if (type === "bouclier") {
      // un casque rond avec une visière en T
      ctx.beginPath(); ctx.arc(0, yT, rT * 1.05, Math.PI, 0); ctx.lineTo(rT * 1.05, yT + rT * 0.55); ctx.quadraticCurveTo(0, yT + rT * 1.1, -rT * 1.05, yT + rT * 0.55); ctx.closePath();
      ctx.fillStyle = volume(ctx, 0, yT - rT * 0.2, rT * 1.2, email, true); ctx.fill(); trait(ctx, email, 0.9);
      ctx.fillStyle = "#14181C"; rrect(ctx, -rT * 0.72 + hdx, yT - rT * 0.12, rT * 1.44, rT * 0.32, 0.6); ctx.fill(); rrect(ctx, -rT * 0.14 + hdx, yT - rT * 0.12, rT * 0.28, rT * 0.85, 0.6); ctx.fill();
      ctx.fillStyle = "#FFC266"; ell(ctx, -rT * 0.42 + hdx, yT + rT * 0.04, rT * 0.18, rT * 0.08); ctx.fill(); ell(ctx, rT * 0.42 + hdx, yT + rT * 0.04, rT * 0.18, rT * 0.08); ctx.fill();
      ctx.strokeStyle = clair(email, 0.5); ctx.lineWidth = 0.9; ctx.beginPath(); ctx.moveTo(hdx, yT - rT * 1.05); ctx.lineTo(hdx, yT - rT * 0.25); ctx.stroke();
    } else {
      ell(ctx, 0, yT, rT * (type === "lourd" ? 1.05 : 1), rT * 0.92); ctx.fillStyle = volume(ctx, 0, yT, rT * 1.05, coque); ctx.fill(); trait(ctx, coque, 0.9);
      // le masque : une fente d'yeux qui luit
      ell(ctx, hdx, yT + rT * 0.12, rT * 0.72, rT * 0.42); ctx.fillStyle = "#171B1F"; ctx.fill();
      var yeux = E.aveugle ? "#8E8E8E" : (E.elec ? "#BFEFFF" : "#FFC266");
      if (type === "rapide") { // un seul grand œil rond, comme une lentille
        lueur(ctx, hdx, yT + rT * 0.12, rT * 0.9, yeux, 0.5); ctx.fillStyle = yeux; ell(ctx, hdx, yT + rT * 0.12, rT * 0.3, rT * 0.27); ctx.fill();
        ctx.fillStyle = "#fff"; ell(ctx, hdx - rT * 0.1, yT + rT * 0.03, rT * 0.09, rT * 0.08); ctx.fill();
        ctx.strokeStyle = metal; ctx.lineWidth = 0.9; ctx.beginPath(); ctx.moveTo(rT * 0.4, yT - rT * 0.8); ctx.lineTo(rT * 0.9, yT - rT * 1.7); ctx.stroke(); ctx.fillStyle = email; ell(ctx, rT * 0.92, yT - rT * 1.78, 1.1, 1.1); ctx.fill();
      } else {
        lueur(ctx, hdx, yT + rT * 0.12, rT * 1.0, yeux, 0.4);
        ctx.fillStyle = yeux; ell(ctx, hdx - rT * 0.3, yT + rT * 0.12, rT * 0.17, rT * 0.11); ctx.fill(); ell(ctx, hdx + rT * 0.3, yT + rT * 0.12, rT * 0.17, rT * 0.11); ctx.fill();
      }
      if (type === "cracheur") { // une cheminée sur le dessus, et une bouche-tuyère
        rrect(ctx, -1.6 + hdx * 0.4, yT - rT * 1.75, 3.2, rT * 0.95, 0.6); ctx.fillStyle = volume(ctx, hdx * 0.4, yT - rT * 1.3, 2.4, "#4A3A30"); ctx.fill(); trait(ctx, "#4A3A30", 0.6);
        lueur(ctx, hdx * 0.4, yT - rT * 1.75, 3.5, "#FF8A3D", 0.4 + (o.charge || 0) * 0.5);
        ell(ctx, hdx * 1.2, yT + rT * 0.68, rT * 0.42, rT * 0.24); ctx.fillStyle = "#3A2A20"; ctx.fill(); ell(ctx, hdx * 1.2, yT + rT * 0.68, rT * 0.24, rT * 0.13); ctx.fillStyle = o.charge > 0.2 ? "#FFB347" : "#1A100A"; ctx.fill();
      }
      if (type === "souffleur") { // un pavillon de cuivre à la place de la bouche
        var tx = hdx * 1.3, ty = yT + rT * 0.75, ev = 1 + (o.souffle || 0) * 0.3;
        ctx.beginPath(); ctx.moveTo(tx - 1.2, ty - 0.6); ctx.lineTo(tx - rT * 0.7 * ev, ty + rT * 0.9); ctx.quadraticCurveTo(tx, ty + rT * 1.15 * ev, tx + rT * 0.7 * ev, ty + rT * 0.9); ctx.lineTo(tx + 1.2, ty - 0.6); ctx.closePath();
        ctx.fillStyle = volume(ctx, tx, ty + rT * 0.5, rT, "#C99A4A", true); ctx.fill(); trait(ctx, "#C99A4A", 0.6);
        ell(ctx, tx, ty + rT * 0.98 * ev, rT * 0.55 * ev, rT * 0.16); ctx.fillStyle = "#3A2A18"; ctx.fill();
      }
      if (type === "lourd") { ctx.strokeStyle = sombre(email, 0.1); ctx.lineWidth = 1.4; ctx.beginPath(); ctx.arc(0, yT, rT * 1.02, Math.PI * 1.12, Math.PI * 1.88); ctx.stroke(); }
      liseré(ctx, 0, yT, rT * 0.95, rT * 0.88, -1.2, 0.6, 0.7);
    }

    /* le bras de devant, et ce qu'il tient */
    if (f === 0) { bras(-1, true); bras(1, true); } else bras(-cFond, true);
    if (type === "bouclier") {
      // un grand bouclier rond, cerclé d'or : c'est sur lui que rebondit ton rayon de feu
      var sx = -bw * 0.35 + dx * 1.2 - 1, syy = yB + bh * 0.62, sr = 8.6, sa = 1 - Math.abs(f) * 0.35;
      ell(ctx, sx, syy, sr * sa, sr); ctx.fillStyle = volume(ctx, sx, syy, sr * 1.1, E.statue ? TERRE.email : "#4E6E96", true); ctx.fill(); trait(ctx, "#4E6E96", 1);
      ctx.strokeStyle = E.statue ? sombre(TERRE.coque, 0.2) : "#E2B54A"; ctx.lineWidth = 1.6; ell(ctx, sx, syy, sr * sa - 0.9, sr - 0.9); ctx.stroke();
      ctx.strokeStyle = "rgba(255,240,190,.55)"; ctx.lineWidth = 0.7; ctx.beginPath(); ctx.ellipse(sx, syy, sr * sa - 0.9, sr - 0.9, 0, 3.6, 4.6); ctx.stroke();
      // l'emblème : le soleil d'Elyra, rayé d'un coup de griffe
      ctx.fillStyle = E.statue ? sombre(TERRE.coque, 0.3) : "#E2B54A"; ell(ctx, sx, syy, 2.2 * sa, 2.2); ctx.fill();
      ctx.strokeStyle = ctx.fillStyle; ctx.lineWidth = 0.8; for (var ra = 0; ra < 8; ra++) { var aa = ra * Math.PI / 4; ctx.beginPath(); ctx.moveTo(sx + Math.cos(aa) * 3 * sa, syy + Math.sin(aa) * 3); ctx.lineTo(sx + Math.cos(aa) * 4.6 * sa, syy + Math.sin(aa) * 4.6); ctx.stroke(); }
      ctx.strokeStyle = "rgba(20,24,28,.7)"; ctx.lineWidth = 0.9; ctx.beginPath(); ctx.moveTo(sx - 4 * sa, syy - 5); ctx.lineTo(sx + 3 * sa, syy + 4); ctx.moveTo(sx - 2.6 * sa, syy - 5.6); ctx.lineTo(sx + 4.4 * sa, syy + 3); ctx.stroke();
    }

    /* les états */
    var rnd = function () { return Math.random(); };
    if (E.statue) {
      ctx.strokeStyle = "rgba(70,30,12,.75)"; ctx.lineWidth = 0.7;
      ctx.beginPath(); ctx.moveTo(-bw * 0.6, yB + 2); ctx.lineTo(-1, yB + bh * 0.45); ctx.lineTo(-2.5, yH); ctx.moveTo(bw * 0.5, yB + 3); ctx.lineTo(1.5, yB + bh * 0.5); ctx.moveTo(-rT * 0.5, yT - rT * 0.6); ctx.lineTo(rT * 0.1, yT + rT * 0.2); ctx.stroke();
    }
    if (E.farine) { ctx.fillStyle = "rgba(255,255,255,.75)"; for (var fa = 0; fa < 14; fa++) { var a1 = fa * 2.4, rr = (fa % 5) / 5; ell(ctx, Math.cos(a1) * bw * rr, yB + bh * 0.5 + Math.sin(a1) * bh * 0.6 * rr, 0.7, 0.6); ctx.fill(); } }
    if (E.mouille) {
      ctx.fillStyle = "rgba(120,190,255,.8)";
      for (var gd = 0; gd < 3; gd++) { var gy = ((t * 18 + gd * 7) % 14), gx = (gd - 1) * bw * 0.6; ell(ctx, gx, yB + bh * 0.4 + gy, 0.6, 1); ctx.fill(); }
      ctx.strokeStyle = "rgba(200,235,255,.7)"; ctx.lineWidth = 0.6; ctx.beginPath(); ctx.ellipse(-bw * 0.3, yB + bh * 0.3, bw * 0.4, bh * 0.25, 0, 3.4, 4.4); ctx.stroke();
    }
    if (E.elec) {
      lueur(ctx, 0, yB + bh * 0.4, bw * 2, "#9FE0FF", 0.3);
      ctx.strokeStyle = "rgba(230,250,255,.95)"; ctx.lineWidth = 0.9;
      for (var ze = 0; ze < 3; ze++) eclair(ctx, (rnd() - 0.5) * bw * 2, yB + rnd() * bh, 5, rnd);
    }
    if (E.aveugle) { ctx.fillStyle = "rgba(190,190,190,.55)"; for (var fu = 0; fu < 4; fu++) { var fa2 = t * 1.5 + fu * 1.6; ell(ctx, Math.cos(fa2) * rT * 1.2, yT - 1 + Math.sin(fa2 * 1.3) * 1.5, rT * 0.55, rT * 0.4); ctx.fill(); } }
    if (E.feu) {
      lueur(ctx, 0, yB, bw * 2.2, "#FF8A3D", 0.35);
      flamme(ctx, -rT * 0.5, yT - rT * 0.5, rT * 1.6, t, 0); flamme(ctx, rT * 0.55, yT - rT * 0.3, rT * 1.3, t, 1); flamme(ctx, bw * 0.8, yB + 1, rT * 1.1, t, 2); flamme(ctx, -bw * 0.85, yB + 1.5, rT, t, 3);
    }
    if (E.meche) {
      var ty0 = yT - rT * 0.95;
      ctx.strokeStyle = "#5A4630"; ctx.lineWidth = 1.1; ctx.beginPath(); ctx.moveTo(0, ty0); ctx.quadraticCurveTo(3, ty0 - 4, 1.5, ty0 - 7); ctx.stroke();
      lueur(ctx, 1.5, ty0 - 7.5, 4, "#FFD27A", 0.7); ctx.fillStyle = Math.sin(t * 40) > 0 ? "#FFF2B0" : "#FF8A3D"; ell(ctx, 1.5, ty0 - 7.5, 1.4, 1.4); ctx.fill();
    }
    ctx.restore();
  };

  /* ---------- Grosbec dans son armure ---------- */
  /* Une énorme armure faite des pièces de la ville d'en bas (un métal bleuté) cerclée de bronze ; un casque en grand bec
     (son nom), les yeux qui luisent derrière ; les quatre Lanternes d'Or serties dans l'armure (sur la poitrine et sur les
     épaules) d'où partent des veines d'or : c'est l'énergie qu'il siphonne ; l'écharpe rouge du maire et sa médaille ;
     la bague au corbeau sur son poing. o : t, coup (0 à 1 : il vient d'être touché), rage (0 à 1), ordre (0 à 1 : il lève le bras). */
  var ACIER = "#4D6577", BRONZE = "#A8783A", OR = "#F2C230", ROUGE = "#8E2A2A";
  PC.grosbec = function (ctx, o) {
    o = o || {};
    var t = o.t || 0, rage = o.rage || 0, coup = o.coup || 0, ordre = o.ordre || 0;
    var resp = Math.sin(t * 1.6) * 0.8, tremble = coup > 0 ? Math.sin(t * 70) * 2 * coup : 0;
    var veine = mix(OR, "#FF4A2A", rage), yeux = mix("#FFC266", "#FF3A20", rage);
    ctx.save(); ctx.translate(tremble, 0);

    /* l'aura d'énergie */
    lueur(ctx, 0, -50, 62, veine, 0.16 + 0.06 * Math.sin(t * 3));
    for (var pa = 0; pa < 10; pa++) { var py = -((t * 22 + pa * 13) % 95), px = Math.sin(pa * 2.7 + t) * 32; ctx.fillStyle = rgba(veine, 0.55 * (1 + py / 95)); ell(ctx, px, py, 1.1, 1.1); ctx.fill(); }

    /* la cape rouge du maire, en lambeaux, derrière lui */
    ctx.beginPath(); ctx.moveTo(-26, -66 + resp);
    for (var cp = 0; cp <= 8; cp++) { var cx1 = -30 + cp * 7.5, cy1 = -6 + Math.sin(t * 2 + cp) * 2.5 + (cp % 2) * 5; ctx.lineTo(cx1, cy1); }
    ctx.lineTo(26, -66 + resp); ctx.closePath();
    var gc = ctx.createLinearGradient(0, -66, 0, 0); gc.addColorStop(0, sombre(ROUGE, 0.25)); gc.addColorStop(1, sombre(ROUGE, 0.55)); ctx.fillStyle = gc; ctx.fill(); trait(ctx, ROUGE, 1);

    /* les jambes : de grosses jambières, les genouillères de bronze */
    [-1, 1].forEach(function (c) {
      var hx = c * 10, kx = c * 12.5, fx = c * 14;
      capsule(ctx, hx, -36, kx, -18, 7.5, 6.8); ctx.fillStyle = volume(ctx, kx, -28, 8, ACIER); ctx.fill(); trait(ctx, ACIER, 1);
      capsule(ctx, kx, -18, fx, -4, 6.8, 6.2); ctx.fillStyle = volume(ctx, fx, -11, 8, sombre(ACIER, 0.08)); ctx.fill(); trait(ctx, ACIER, 1);
      ell(ctx, kx, -19, 6, 5); ctx.fillStyle = volume(ctx, kx, -20, 6, BRONZE, true); ctx.fill(); trait(ctx, BRONZE, 0.9);
      rrect(ctx, fx - 9 + c * 1.5, -6, 18, 7, 3); ctx.fillStyle = volume(ctx, fx, -3, 9, sombre(ACIER, 0.15)); ctx.fill(); trait(ctx, ACIER, 1);
      ctx.strokeStyle = rgba(veine, 0.8); ctx.lineWidth = 0.9; ctx.beginPath(); ctx.moveTo(hx, -34); ctx.lineTo(kx - c * 1, -23); ctx.stroke();
    });

    /* la jupe de plates */
    for (var jp = -2; jp <= 2; jp++) { rrect(ctx, jp * 9.5 - 5, -42 + resp * 0.5, 10, 12 - Math.abs(jp), 2.5); ctx.fillStyle = volume(ctx, jp * 9.5, -38, 8, jp % 2 ? sombre(ACIER, 0.1) : ACIER); ctx.fill(); trait(ctx, ACIER, 0.8); }

    /* le torse */
    var yT = -42 + resp;
    ctx.beginPath(); ctx.moveTo(-24, yT - 28); ctx.quadraticCurveTo(-27, yT - 10, -18, yT); ctx.lineTo(18, yT); ctx.quadraticCurveTo(27, yT - 10, 24, yT - 28); ctx.quadraticCurveTo(0, yT - 34, -24, yT - 28); ctx.closePath();
    ctx.fillStyle = volume(ctx, -2, yT - 18, 28, ACIER, true); ctx.fill(); trait(ctx, ACIER, 1.2);
    ctx.strokeStyle = BRONZE; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(-18, yT - 1); ctx.lineTo(18, yT - 1); ctx.stroke();
    ctx.strokeStyle = sombre(ACIER, 0.45); ctx.lineWidth = 0.7; ctx.beginPath(); ctx.moveTo(0, yT - 31); ctx.lineTo(0, yT - 3); ctx.stroke();
    /* les veines d'or qui partent de la lanterne du torse, et l'énergie qui y court */
    var lx = 0, ly = yT - 17;
    [[-20, yT - 26], [20, yT - 26], [-15, yT - 3], [15, yT - 3], [-23, yT - 12], [23, yT - 12]].forEach(function (pt, i) {
      ctx.strokeStyle = rgba(veine, 0.55); ctx.lineWidth = 1.3; ctx.beginPath(); ctx.moveTo(lx, ly); ctx.quadraticCurveTo((lx + pt[0]) / 2 + (i % 2 ? 3 : -3), (ly + pt[1]) / 2, pt[0], pt[1]); ctx.stroke();
      var k = ((t * 0.9 + i * 0.17) % 1), qx = lx + (pt[0] - lx) * k, qy = ly + (pt[1] - ly) * k;
      lueur(ctx, qx, qy, 3.2, veine, 0.8);
    });
    /* l'écharpe rouge du maire et sa médaille */
    ctx.beginPath(); ctx.moveTo(-22, yT - 27); ctx.lineTo(-15, yT - 30); ctx.lineTo(21, yT - 4); ctx.lineTo(13, yT - 1); ctx.closePath();
    ctx.fillStyle = volume(ctx, 0, yT - 15, 22, ROUGE); ctx.fill(); trait(ctx, ROUGE, 0.8);
    ctx.strokeStyle = OR; ctx.lineWidth = 0.6; ctx.beginPath(); ctx.moveTo(-20.5, yT - 27.5); ctx.lineTo(18, yT - 3.2); ctx.stroke();
    ell(ctx, 11, yT - 7, 3.2, 3.2); ctx.fillStyle = volume(ctx, 11, yT - 7, 3.4, OR, true); ctx.fill(); trait(ctx, OR, 0.6);
    /* la Lanterne d'Or sertie au milieu du torse */
    function lanterne(x, y, s) {
      lueur(ctx, x, y, 11 * s, OR, 0.55 + 0.2 * Math.sin(t * 4));
      ctx.beginPath(); for (var h = 0; h < 6; h++) { var a = h * Math.PI / 3 + Math.PI / 6; ctx.lineTo(x + Math.cos(a) * 5 * s, y + Math.sin(a) * 5.6 * s); } ctx.closePath();
      ctx.fillStyle = sombre(BRONZE, 0.15); ctx.fill(); trait(ctx, BRONZE, 0.8);
      var gl = ctx.createRadialGradient(x - s, y - s, 0, x, y, 4 * s); gl.addColorStop(0, "#FFFBE0"); gl.addColorStop(0.5, mix(OR, veine, 0.4)); gl.addColorStop(1, sombre(OR, 0.3));
      ctx.fillStyle = gl; ell(ctx, x, y, 3.3 * s, 3.9 * s); ctx.fill();
      ctx.strokeStyle = sombre(BRONZE, 0.3); ctx.lineWidth = 0.6 * s; ctx.beginPath(); ctx.moveTo(x, y - 3.9 * s); ctx.lineTo(x, y + 3.9 * s); ctx.moveTo(x - 3.3 * s, y); ctx.lineTo(x + 3.3 * s, y); ctx.stroke();
    }
    lanterne(lx, ly, 1.25);
    /* la quatrième, à la boucle de la ceinture */
    lanterne(0, yT + 1.5, 0.7);

    /* les bras et les poings */
    [-1, 1].forEach(function (c) {
      var lv = c > 0 ? ordre : 0;
      var sx = c * 27, sy0 = yT - 25, ex = c * (33 - lv * 4), ey = yT - 8 - lv * 22, hx = c * (32 - lv * 6), hy = yT + 9 - lv * 52;
      capsule(ctx, sx, sy0, ex, ey, 7, 6.4); ctx.fillStyle = volume(ctx, ex, (sy0 + ey) / 2, 8, ACIER); ctx.fill(); trait(ctx, ACIER, 1);
      capsule(ctx, ex, ey, hx, hy, 6.4, 6); ctx.fillStyle = volume(ctx, hx, (ey + hy) / 2, 8, sombre(ACIER, 0.06)); ctx.fill(); trait(ctx, ACIER, 1);
      ell(ctx, ex, ey, 5, 4.5); ctx.fillStyle = volume(ctx, ex, ey, 5, BRONZE, true); ctx.fill(); trait(ctx, BRONZE, 0.8);
      // le gantelet
      ell(ctx, hx, hy + 2, 7.6, 7); ctx.fillStyle = volume(ctx, hx, hy + 1, 8, sombre(ACIER, 0.12), true); ctx.fill(); trait(ctx, ACIER, 1);
      ctx.strokeStyle = sombre(ACIER, 0.5); ctx.lineWidth = 0.8; for (var d = -1; d <= 1; d++) { ctx.beginPath(); ctx.moveTo(hx + d * 2.6, hy + 3.5); ctx.lineTo(hx + d * 2.6, hy + 8); ctx.stroke(); }
      if (c > 0) { // la bague au corbeau, l'éclat rouge du cristal
        ell(ctx, hx - 3.5, hy + 4, 2.4, 2.1); ctx.fillStyle = "#1A1A20"; ctx.fill(); trait(ctx, "#1A1A20", 0.5);
        ctx.fillStyle = "#14141A"; ctx.beginPath(); ctx.moveTo(hx - 5, hy + 3.4); ctx.lineTo(hx - 2.2, hy + 2.6); ctx.lineTo(hx - 3.2, hy + 4.6); ctx.closePath(); ctx.fill();
        lueur(ctx, hx - 3.4, hy + 4.2, 3, "#FF2A3A", 0.7); ctx.fillStyle = "#FF5A6A"; ell(ctx, hx - 3.4, hy + 4.2, 0.7, 0.7); ctx.fill();
      }
      if (lv > 0.3) lueur(ctx, hx, hy, 16 * lv, veine, 0.4 * lv);
    });

    /* les épaulières, avec une Lanterne d'Or sur chacune */
    [-1, 1].forEach(function (c) {
      var px = c * 26, py = yT - 27;
      // (tracée avec c : la gauche est exactement le miroir de la droite)
      ctx.beginPath(); ctx.moveTo(px - c * 11, py + 5); ctx.bezierCurveTo(px - c * 14, py - 9, px + c * 9, py - 14, px + c * 14, py + 1);
      ctx.quadraticCurveTo(px + c * 13, py + 9, px + c * 6, py + 9); ctx.quadraticCurveTo(px - c * 3, py + 6, px - c * 11, py + 5); ctx.closePath();
      ctx.fillStyle = volume(ctx, px - c * 2, py - 3, 13, ACIER, true); ctx.fill(); trait(ctx, ACIER, 1.1);
      ctx.strokeStyle = BRONZE; ctx.lineWidth = 1.8; ctx.beginPath(); ctx.moveTo(px - c * 9.5, py + 2.5); ctx.bezierCurveTo(px - c * 12, py - 7.5, px + c * 8, py - 11.5, px + c * 12, py + 0.5); ctx.stroke();
      for (var pk = 0; pk < 3; pk++) { var ax = px + c * (pk * 4 - 2), ay = py - 8.5 + pk * 0.6; ctx.beginPath(); ctx.moveTo(ax - 1.6, ay + 1); ctx.lineTo(ax + c * 0.6, ay - 4.5); ctx.lineTo(ax + 1.6, ay + 1); ctx.closePath(); ctx.fillStyle = volume(ctx, ax, ay - 1, 3, BRONZE, true); ctx.fill(); }
      lanterne(px + c * 1, py - 1, 0.62);
    });

    /* le casque en grand bec */
    var yC = yT - 40;
    rrect(ctx, -7, yT - 33, 14, 6, 2); ctx.fillStyle = sombre(ACIER, 0.3); ctx.fill();
    ctx.beginPath(); ctx.moveTo(-14, yC + 8); ctx.quadraticCurveTo(-16, yC - 12, 0, yC - 16); ctx.quadraticCurveTo(16, yC - 12, 14, yC + 8); ctx.quadraticCurveTo(0, yC + 14, -14, yC + 8); ctx.closePath();
    ctx.fillStyle = volume(ctx, -3, yC - 4, 17, ACIER, true); ctx.fill(); trait(ctx, ACIER, 1.2);
    ctx.strokeStyle = BRONZE; ctx.lineWidth = 2.4; ctx.beginPath(); ctx.moveTo(0, yC - 16); ctx.lineTo(0, yC - 3); ctx.stroke();
    ctx.strokeStyle = clair(BRONZE, 0.4); ctx.lineWidth = 0.7; ctx.beginPath(); ctx.moveTo(-0.6, yC - 15); ctx.lineTo(-0.6, yC - 5); ctx.stroke();
    /* les yeux derrière la fente */
    ctx.fillStyle = "#0B0D10"; rrect(ctx, -11, yC - 3, 22, 5, 2); ctx.fill();
    var cl = coup > 0.4 ? "#FFFFFF" : yeux;
    lueur(ctx, -5, yC - 0.5, 7, cl, 0.6); lueur(ctx, 5, yC - 0.5, 7, cl, 0.6);
    ctx.fillStyle = cl; ell(ctx, -5, yC - 0.5, 2.6, 1.2, 0.15 + rage * 0.25); ctx.fill(); ell(ctx, 5, yC - 0.5, 2.6, 1.2, -0.15 - rage * 0.25); ctx.fill();
    /* le grand bec : de bronze, épais, pointé vers le bas, comme celui d'un gros-bec */
    ctx.beginPath(); ctx.moveTo(-10, yC + 2); ctx.quadraticCurveTo(-9.5, yC + 15, 0, yC + 25); ctx.quadraticCurveTo(9.5, yC + 15, 10, yC + 2); ctx.quadraticCurveTo(0, yC + 5.5, -10, yC + 2); ctx.closePath();
    ctx.fillStyle = volume(ctx, -2.5, yC + 9, 13, BRONZE, true); ctx.fill(); trait(ctx, BRONZE, 1.1);
    ctx.strokeStyle = sombre(BRONZE, 0.5); ctx.lineWidth = 0.9; ctx.beginPath(); ctx.moveTo(-8, yC + 11); ctx.quadraticCurveTo(0, yC + 14.5, 8, yC + 11); ctx.stroke();
    ctx.fillStyle = sombre(BRONZE, 0.55); ell(ctx, -3.2, yC + 5.2, 1, 0.6); ctx.fill(); ell(ctx, 3.2, yC + 5.2, 1, 0.6); ctx.fill();
    ctx.fillStyle = "rgba(255,240,200,.6)"; ell(ctx, -3.6, yC + 9, 1.7, 4, 0.25); ctx.fill();
    /* la crête : un éventail de plumes de bronze, comme celle d'un oiseau */
    for (var pl = -3; pl <= 3; pl++) {
      var pa2 = pl * 0.22 + Math.sin(t * 2 + pl) * 0.02, pL = 15 - Math.abs(pl) * 2.2, bx = Math.sin(pa2) * 3, by = yC - 14;
      ctx.save(); ctx.translate(bx, by); ctx.rotate(pa2);
      ctx.beginPath(); ctx.moveTo(-1.8, 0); ctx.quadraticCurveTo(-2.6, -pL * 0.6, 0, -pL); ctx.quadraticCurveTo(2.6, -pL * 0.6, 1.8, 0); ctx.closePath();
      ctx.fillStyle = volume(ctx, -0.5, -pL * 0.5, pL * 0.6, pl % 2 ? BRONZE : sombre(BRONZE, 0.15), true); ctx.fill(); trait(ctx, BRONZE, 0.6);
      ctx.strokeStyle = rgba(veine, 0.7); ctx.lineWidth = 0.5; ctx.beginPath(); ctx.moveTo(0, -1); ctx.lineTo(0, -pL + 2); ctx.stroke();
      ctx.restore();
    }
    liseré(ctx, 0, yC - 2, 14.5, 14, -1.1, 0.5, 1);
    if (coup > 0) { ctx.globalAlpha = coup * 0.5; ctx.fillStyle = "#fff"; ell(ctx, 0, -50, 34, 52); ctx.fill(); ctx.globalAlpha = 1; }
    if (rage > 0.2) { for (var va = 0; va < 2; va++) { var vy = yC - 10 - ((t * 30 + va * 14) % 26); ctx.fillStyle = "rgba(200,200,210," + (0.5 * rage) + ")"; ell(ctx, (va ? 12 : -12) + Math.sin(t * 3 + va) * 2, vy, 3 + (yC - 10 - vy) * 0.12, 2.5); ctx.fill(); } }
    ctx.restore();
  };

  G.PersosCombat = PC;
})(window);
