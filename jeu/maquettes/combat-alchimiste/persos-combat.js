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
    souffleur:{ email: "#5F8C7C", jambe: 8.2, rJ: 2.7, hanche: 4.0, bw: 9.6, bh: 10.8, rT: 5.0, rB: 2.4, bras: 8.0, poids: 1 },
    // (version 12) le berserker : rouge, des lames aux bras, des cornes ; le soldat en armure : tout d'acier ; le porte-barricade :
    // du bois sur le dos ; le Colosse : un gros, deux fois plus grand, cuirassé de fer sombre
    berserker:{ email: "#B3262B", jambe: 9.2, rJ: 2.4, hanche: 3.4, bw: 8.4, bh: 10.2, rT: 5.0, rB: 2.4, bras: 9.4, poids: 0.85 },
    chevalier:{ email: "#8D9AA8", jambe: 8.4, rJ: 2.9, hanche: 4.1, bw: 9.4, bh: 11, rT: 5.4, rB: 2.7, bras: 8.6, poids: 1.25 },
    porteur:  { email: "#9C7A44", jambe: 8.4, rJ: 2.6, hanche: 3.8, bw: 8.2, bh: 10, rT: 5.0, rB: 2.3, bras: 8.4, poids: 1 },
    colosse:  { email: "#4B3F63", jambe: 7.2, rJ: 4.1, hanche: 6.4, bw: 14.5, bh: 14.5, rT: 5.4, rB: 3.8, bras: 12.5, poids: 1.6 },
    // (version 14) les quatre gros boss, dessinés 1,5 fois plus grands : le Glouton (un gros ventre, une bouche sur le ventre, sa
    // serviette et sa fourchette), le Frileux (bonnet, écharpe, glaçons ; il rougit quand il chauffe), le Singe (longs bras, oreilles,
    // museau, une queue en ressort), le Sauteur (monté sur deux gros ressorts, des antennes à ressort)
    glouton:  { email: "#C0703A", jambe: 6.6, rJ: 4.0, hanche: 6.6, bw: 16.5, bh: 16, rT: 5.6, rB: 3.7, bras: 11.5, poids: 1.7 },
    frileux:  { email: "#4F95C8", jambe: 8.6, rJ: 3.0, hanche: 4.4, bw: 10.5, bh: 12, rT: 5.8, rB: 2.8, bras: 9.2, poids: 1.25 },
    singe:    { email: "#7A4E2A", jambe: 7.4, rJ: 2.5, hanche: 3.8, bw: 9.0, bh: 10.6, rT: 5.6, rB: 2.4, bras: 13.5, poids: 0.85 },
    sauteur:  { email: "#4E9A36", jambe: 6.2, rJ: 2.6, hanche: 4.2, bw: 9.6, bh: 11, rT: 5.3, rB: 2.4, bras: 8, poids: 1.0 }
  };
  var BOSS = { glouton: 1, frileux: 1, singe: 1, sauteur: 1 };
  var ACIER = "#9AA8B6";
  PC.SORTES = SORTES;
  var TERRE = { coque: "#C2703F", metal: "#9A5530", email: "#A85C34" };

  /* o : t (secondes), marche (0 à 1), face (-1 à 1 : il se tourne vers SA droite / gauche), etats {feu, mouille, farine, boue,
     statue, elec, meche, aveugle}, charge (le cracheur va cracher, 0 à 1), souffle (le soufflet, 0 à 1)
     (version 12) porte (le porte-barricade : combien de barricades sur son dos), denude (le Colosse a perdu son armure),
     grille (le soldat en armure a pris un court-circuit : il fume) */
  PC.automate = function (ctx, type, o) {
    o = o || {};
    if (type === "colosse") { ctx.save(); ctx.scale(1.75, 1.75); var rc0 = colosse(ctx, o); ctx.restore(); return rc0; }
    if (BOSS[type]) { ctx.save(); ctx.scale(1.5, 1.5); grosBoss(ctx, type, o); ctx.restore(); return; }
    return automate(ctx, type, o);
  };
  function colosse(ctx, o) {
    var E = o.etats || {};
    automate(ctx, "colosse", o);
    var S = SORTES.colosse, t = o.t || 0, f = Math.max(-1, Math.min(1, o.face || 0)), yH = -S.jambe, yB = yH - S.bh, bw = S.bw, bh = S.bh, dx = f * bw * 0.42;
    if (!o.denude) {
      // la cuirasse de fer sombre, rivetée, et ses pointes ; la couronne de pointes sur la tête
      var fer = E.statue ? TERRE.metal : "#3B3448";
      ctx.beginPath(); ctx.ellipse(0, yB + bh * 0.55, bw * 1.06, bh * 0.66, 0, Math.PI * 0.08, Math.PI * 0.92); ctx.lineTo(-bw * 0.9, yB + bh * 0.25); ctx.quadraticCurveTo(0, yB + bh * 0.05, bw * 0.9, yB + bh * 0.25); ctx.closePath();
      ctx.fillStyle = volume(ctx, 0, yB + bh * 0.5, bw * 1.1, fer, true); ctx.fill(); trait(ctx, fer, 1);
      ctx.strokeStyle = "rgba(200,180,255,.35)"; ctx.lineWidth = 0.7; ctx.beginPath(); ctx.moveTo(-bw * 0.8, yB + bh * 0.55); ctx.quadraticCurveTo(0, yB + bh * 0.68, bw * 0.8, yB + bh * 0.55); ctx.stroke();
      for (var r = -3; r <= 3; r++) rivet(ctx, r * bw * 0.26 + dx * 0.4, yB + bh * 0.3, 0.9, "#6A5E80");
      [-1, 1].forEach(function (c) { var px = c * (bw + 1), py = yB + bh * 0.2;
        ctx.beginPath(); ctx.moveTo(px - 3, py + 2); ctx.lineTo(px + c * 3, py - 7); ctx.lineTo(px + 3, py + 2); ctx.closePath(); ctx.fillStyle = volume(ctx, px, py - 2, 4, "#4E4562", true); ctx.fill(); trait(ctx, "#4E4562", 0.7); });
      var yT = yB + S.rT * 0.55 - S.rT * 0.72;
      for (var k = -2; k <= 2; k++) { var cx = k * 2.6 + f * 2, h = 4 + (2 - Math.abs(k)) * 1.6; ctx.beginPath(); ctx.moveTo(cx - 1.4, yT - S.rT * 0.7); ctx.lineTo(cx, yT - S.rT * 0.7 - h); ctx.lineTo(cx + 1.4, yT - S.rT * 0.7); ctx.closePath(); ctx.fillStyle = "#5A4E72"; ctx.fill(); trait(ctx, "#5A4E72", 0.5); }
      lueur(ctx, dx, yB + bh * 0.5, 9, "#B48CFF", 0.25 + 0.15 * Math.sin(t * 3));
    } else {
      // sans armure : la porcelaine fendue, des étincelles
      ctx.strokeStyle = "rgba(40,30,20,.8)"; ctx.lineWidth = 0.7;
      ctx.beginPath(); ctx.moveTo(-bw * 0.5, yB + bh * 0.2); ctx.lineTo(-bw * 0.1, yB + bh * 0.55); ctx.lineTo(-bw * 0.35, yB + bh * 0.9); ctx.moveTo(bw * 0.45, yB + bh * 0.3); ctx.lineTo(bw * 0.1, yB + bh * 0.6); ctx.stroke();
      ctx.strokeStyle = "rgba(230,250,255,.9)"; ctx.lineWidth = 0.6; var rnd = Math.random; for (var z = 0; z < 2; z++) eclair(ctx, (rnd() - 0.5) * bw * 2, yB + rnd() * bh, 4, rnd);
    }
  }
  function automate(ctx, type, o) {
    var S = SORTES[type] || SORTES.rapide, E = o.etats || {}, t = o.t || 0, f = Math.max(-1, Math.min(1, o.face || 0)), LOURD = type === "lourd" || type === "colosse" || type === "glouton";
    var coque = COQUE, metal = METAL, email = S.email, noyau = NOYAU;
    if (type === "frileux") { var chf = o.chaud || 0; coque = mix("#DCEEFA", "#FFB08A", chf * 0.85); metal = mix("#7FA6C4", "#B0604A", chf * 0.7); email = mix(S.email, "#D8402A", chf); }
    if (type === "singe") { coque = "#D8B68A"; metal = "#7A5A40"; }
    if (type === "sauteur") { coque = "#E4ECD2"; metal = "#5F7A55"; }
    if (type === "glouton") { coque = "#F1E4CA"; }
    if (type === "chevalier") { coque = ACIER; metal = "#5D6B7A"; }
    if (type === "colosse") { metal = "#4E5566"; }
    if (o.grille) { coque = sombre(coque, 0.35); email = sombre(email, 0.35); }
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
    if (type === "porteur" && o.porte > 0) {
      // une barricade de pieux sur le dos : une traverse, deux croix de pieux taillés en pointe
      // (sur le dos, de travers : une longue traverse, et trois croix de pieux taillés en pointe, comme un cheval de frise)
      var by0 = yB - 3, bc = E.statue ? TERRE.coque : "#8A5A2E";
      for (var pk = 0; pk < Math.min(2, o.porte); pk++) {
        ctx.save(); ctx.translate(-f * 2, by0 - pk * 4); ctx.rotate(-0.18);
        [-9, 0, 9].forEach(function (px2) { [[-1], [1]].forEach(function (dd) { ctx.save(); ctx.translate(px2, 0); ctx.rotate(dd[0] * 0.62); rrect(ctx, -0.9, -6, 1.8, 12, 0.6); ctx.fillStyle = volume(ctx, 0, 0, 3, bc); ctx.fill(); trait(ctx, bc, 0.5);
          ctx.beginPath(); ctx.moveTo(-0.9, -6); ctx.lineTo(0, -8); ctx.lineTo(0.9, -6); ctx.closePath(); ctx.fillStyle = "#D2AE78"; ctx.fill(); ctx.restore(); }); });
        rrect(ctx, -14, -1.5, 28, 3, 1.4); ctx.fillStyle = volume(ctx, 0, 0, 14, "#6E4524"); ctx.fill(); trait(ctx, "#6E4524", 0.6);
        ctx.strokeStyle = "#C9B48A"; ctx.lineWidth = 0.6; [-9, 0, 9].forEach(function (px2) { ctx.beginPath(); ctx.moveTo(px2 - 1.2, -1.2); ctx.lineTo(px2 + 1.2, 1.2); ctx.moveTo(px2 + 1.2, -1.2); ctx.lineTo(px2 - 1.2, 1.2); ctx.stroke(); });
        ctx.restore();
      }
      ctx.strokeStyle = "#5A4630"; ctx.lineWidth = 0.8; ctx.beginPath(); ctx.moveTo(-bw * 0.6, yB + 2); ctx.lineTo(bw * 0.6, yB + bh * 0.6); ctx.stroke();
    }

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
      var rm = LOURD ? S.rB * 1.12 : S.rB * 1.05, cm = LOURD ? sombre(email, 0.1) : coque;
      ell(ctx, hx, hy, rm, rm * 0.95); ctx.fillStyle = volume(ctx, hx, hy, rm, devant ? cm : sombre(cm, 0.12), true); ctx.fill(); trait(ctx, cm);
      if (LOURD) { ctx.strokeStyle = sombre(coque, 0.45); ctx.lineWidth = 0.6; ctx.beginPath(); ctx.moveTo(hx - rm * 0.6, hy - rm * 0.1); ctx.lineTo(hx + rm * 0.6, hy - rm * 0.1); ctx.stroke(); }
      if (type === "berserker") {
        // une lame courbe au bout de chaque bras
        var la = cote * 0.5 + sw * cote, lx = hx + Math.sin(la) * 1.5, ly = hy;
        ctx.beginPath(); ctx.moveTo(lx - 0.8, ly - 1); ctx.quadraticCurveTo(lx + cote * 6, ly + 2, lx + cote * 4, ly + 9); ctx.quadraticCurveTo(lx + cote * 2.5, ly + 3, lx + 0.8, ly + 0.5); ctx.closePath();
        ctx.fillStyle = volume(ctx, lx + cote * 3, ly + 4, 5, devant ? "#D9DEE4" : "#AEB5BD", true); ctx.fill(); trait(ctx, "#8A939C", 0.6);
        ctx.strokeStyle = "rgba(255,255,255,.7)"; ctx.lineWidth = 0.5; ctx.beginPath(); ctx.moveTo(lx + cote * 1.5, ly + 0.5); ctx.quadraticCurveTo(lx + cote * 4.6, ly + 2.5, lx + cote * 3.8, ly + 7.5); ctx.stroke();
      }
      if (type === "chevalier") {
        // la spalière d'acier sur l'épaule
        ctx.beginPath(); ctx.ellipse(sx, sy0 - 0.5, S.rB * 1.9, S.rB * 1.3, cote * 0.3, Math.PI * 0.95, Math.PI * 2.05); ctx.closePath();
        ctx.fillStyle = volume(ctx, sx, sy0 - 1, S.rB * 2, devant ? ACIER : sombre(ACIER, 0.15), true); ctx.fill(); trait(ctx, ACIER, 0.7);
        if (devant && cote > 0) { // l'épée, pointe en bas
          rrect(ctx, hx - 0.8, hy - 1, 1.6, 12, 0.5); ctx.fillStyle = volume(ctx, hx, hy + 5, 3, "#E4E9EE", true); ctx.fill(); trait(ctx, "#9AA4AE", 0.5);
          rrect(ctx, hx - 2.6, hy - 1.6, 5.2, 1.4, 0.5); ctx.fillStyle = "#B8902F"; ctx.fill();
        }
      }
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
    if (LOURD) {
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
      if (type === "chevalier") { ctx.strokeStyle = sombre(ACIER, 0.35); ctx.lineWidth = 0.7; [0.36, 0.56, 0.74].forEach(function (k) { ctx.beginPath(); ctx.moveTo(-bw * 0.66 + dx * 0.5, yB + bh * k); ctx.quadraticCurveTo(dx, yB + bh * k + 1.6, bw * 0.66 + dx * 0.5, yB + bh * k); ctx.stroke(); }); }
      if (type === "berserker") { ctx.strokeStyle = "rgba(30,10,10,.7)"; ctx.lineWidth = 0.8; for (var gf2 = 0; gf2 < 3; gf2++) { ctx.beginPath(); ctx.moveTo(-bw * 0.4 + gf2 * 2.2 + dx, yB + 2); ctx.lineTo(-bw * 0.1 + gf2 * 2.2 + dx, yB + bh * 0.6); ctx.stroke(); } }
      if (type === "rapide") { ctx.strokeStyle = clair(email, 0.75); ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(1.4 + dx, yB + 2.4); ctx.lineTo(-1.2 + dx, yB + bh * 0.42); ctx.lineTo(1 + dx, yB + bh * 0.42); ctx.lineTo(-1.4 + dx, yB + bh * 0.72); ctx.stroke(); }
    }
    /* le cœur de cristal, qui bat de la lumière de Grosbec */
    if (type !== "cracheur" && type !== "souffleur") {
      var bat = 0.6 + 0.4 * Math.sin(t * 4 + type.length), cx0 = dx, cy0 = LOURD ? yB + bh * 0.5 : yB + bh * 0.33, rc = LOURD ? 2.6 : 1.7;
      lueur(ctx, cx0, cy0, rc * 3.2, E.statue ? "#C2703F" : noyau, E.statue ? 0 : 0.35 * bat);
      ctx.beginPath(); ctx.moveTo(cx0, cy0 - rc * 1.3); ctx.lineTo(cx0 + rc, cy0); ctx.lineTo(cx0, cy0 + rc * 1.3); ctx.lineTo(cx0 - rc, cy0); ctx.closePath();
      ctx.fillStyle = E.statue ? sombre(TERRE.coque, 0.2) : clair(noyau, 0.3 * bat); ctx.fill(); trait(ctx, noyau, 0.5);
    }
    liseré(ctx, 0, yB + bh * 0.5, bw * 0.98, bh * 0.55, -0.9, 0.7, 0.8);

    /* la tête */
    var yT = yB - rT * 0.72 - (LOURD ? -rT * 0.55 : 0), hdx = f * rT * 0.42;
    if (type !== "lourd") { rrect(ctx, -1.4, yB - rT * 0.5, 2.8, rT * 0.6, 0.8); ctx.fillStyle = metal; ctx.fill(); }
    if (type === "chevalier") {
      // un heaume d'acier : une fente pour les yeux, des trous pour respirer, un plumet rouge
      rrect(ctx, -rT * 1.02, yT - rT * 1.05, rT * 2.04, rT * 2.0, rT * 0.7); ctx.fillStyle = volume(ctx, 0, yT - rT * 0.3, rT * 1.25, ACIER, true); ctx.fill(); trait(ctx, ACIER, 0.9);
      ctx.fillStyle = "#101418"; rrect(ctx, -rT * 0.75 + hdx, yT - rT * 0.18, rT * 1.5, rT * 0.26, 0.4); ctx.fill();
      var ye = E.aveugle ? "#8E8E8E" : E.elec ? "#BFEFFF" : "#FFC266"; ctx.fillStyle = ye; ell(ctx, -rT * 0.35 + hdx, yT - rT * 0.05, rT * 0.14, rT * 0.07); ctx.fill(); ell(ctx, rT * 0.35 + hdx, yT - rT * 0.05, rT * 0.14, rT * 0.07); ctx.fill();
      ctx.fillStyle = "#2A3038"; for (var tr = 0; tr < 3; tr++) { ell(ctx, hdx + (tr - 1) * rT * 0.3, yT + rT * 0.45, 0.45, 0.45); ctx.fill(); }
      ctx.strokeStyle = clair(ACIER, 0.5); ctx.lineWidth = 0.8; ctx.beginPath(); ctx.moveTo(hdx, yT - rT * 1.02); ctx.lineTo(hdx, yT - rT * 0.25); ctx.stroke();
      ctx.fillStyle = "#C2342A"; ctx.beginPath(); ctx.moveTo(hdx * 0.6, yT - rT * 1.0); ctx.quadraticCurveTo(hdx * 0.6 - 6 - f * 2, yT - rT * 2.2, hdx * 0.6 - 9 - f * 3, yT - rT * 0.6); ctx.quadraticCurveTo(hdx * 0.6 - 4, yT - rT * 1.3, hdx * 0.6, yT - rT * 1.0); ctx.fill();
      liseré(ctx, 0, yT - rT * 0.1, rT * 0.98, rT * 0.98, -1.2, 0.6, 0.7);
    } else if (type === "bouclier") {
      // un casque rond avec une visière en T
      ctx.beginPath(); ctx.arc(0, yT, rT * 1.05, Math.PI, 0); ctx.lineTo(rT * 1.05, yT + rT * 0.55); ctx.quadraticCurveTo(0, yT + rT * 1.1, -rT * 1.05, yT + rT * 0.55); ctx.closePath();
      ctx.fillStyle = volume(ctx, 0, yT - rT * 0.2, rT * 1.2, email, true); ctx.fill(); trait(ctx, email, 0.9);
      ctx.fillStyle = "#14181C"; rrect(ctx, -rT * 0.72 + hdx, yT - rT * 0.12, rT * 1.44, rT * 0.32, 0.6); ctx.fill(); rrect(ctx, -rT * 0.14 + hdx, yT - rT * 0.12, rT * 0.28, rT * 0.85, 0.6); ctx.fill();
      ctx.fillStyle = "#FFC266"; ell(ctx, -rT * 0.42 + hdx, yT + rT * 0.04, rT * 0.18, rT * 0.08); ctx.fill(); ell(ctx, rT * 0.42 + hdx, yT + rT * 0.04, rT * 0.18, rT * 0.08); ctx.fill();
      ctx.strokeStyle = clair(email, 0.5); ctx.lineWidth = 0.9; ctx.beginPath(); ctx.moveTo(hdx, yT - rT * 1.05); ctx.lineTo(hdx, yT - rT * 0.25); ctx.stroke();
    } else {
      ell(ctx, 0, yT, rT * (LOURD ? 1.05 : 1), rT * 0.92); ctx.fillStyle = volume(ctx, 0, yT, rT * 1.05, coque); ctx.fill(); trait(ctx, coque, 0.9);
      // le masque : une fente d'yeux qui luit
      ell(ctx, hdx, yT + rT * 0.12, rT * 0.72, rT * 0.42); ctx.fillStyle = "#171B1F"; ctx.fill();
      var yeux = E.aveugle ? "#8E8E8E" : (E.elec ? "#BFEFFF" : type === "berserker" ? "#FF3A2A" : "#FFC266");
      if (type === "berserker") {
        // deux cornes recourbées
        [-1, 1].forEach(function (c) { ctx.beginPath(); ctx.moveTo(c * rT * 0.55, yT - rT * 0.6); ctx.quadraticCurveTo(c * rT * 1.6, yT - rT * 0.9, c * rT * 1.35, yT - rT * 1.9); ctx.quadraticCurveTo(c * rT * 1.1, yT - rT * 1.1, c * rT * 0.25, yT - rT * 0.85); ctx.closePath();
          ctx.fillStyle = volume(ctx, c * rT, yT - rT * 1.1, rT, "#E8DCC4", true); ctx.fill(); trait(ctx, "#B9A98C", 0.6); });
      }
      if (o.dort) { // les yeux fermés (le Glouton qui dort)
        ctx.strokeStyle = "#C9D6E2"; ctx.lineWidth = 0.75; [-1, 1].forEach(function (c) { ctx.beginPath(); ctx.arc(hdx + c * rT * 0.3, yT + rT * 0.02, rT * 0.17, 0.25, Math.PI - 0.25); ctx.stroke(); });
      } else if (type === "rapide") { // un seul grand œil rond, comme une lentille
        lueur(ctx, hdx, yT + rT * 0.12, rT * 0.9, yeux, 0.5); ctx.fillStyle = yeux; ell(ctx, hdx, yT + rT * 0.12, rT * 0.3, rT * 0.27); ctx.fill();
        ctx.fillStyle = "#fff"; ell(ctx, hdx - rT * 0.1, yT + rT * 0.03, rT * 0.09, rT * 0.08); ctx.fill();
        ctx.strokeStyle = metal; ctx.lineWidth = 0.9; ctx.beginPath(); ctx.moveTo(rT * 0.4, yT - rT * 0.8); ctx.lineTo(rT * 0.9, yT - rT * 1.7); ctx.stroke(); ctx.fillStyle = email; ell(ctx, rT * 0.92, yT - rT * 1.78, 1.1, 1.1); ctx.fill();
      } else if (type === "berserker") {
        // des yeux rouges en colère (en biais)
        lueur(ctx, hdx, yT + rT * 0.12, rT * 1.3, yeux, 0.55);
        ctx.fillStyle = yeux; [-1, 1].forEach(function (c) { ctx.beginPath(); ctx.moveTo(hdx + c * rT * 0.12, yT + rT * 0.02); ctx.lineTo(hdx + c * rT * 0.52, yT - rT * 0.08); ctx.lineTo(hdx + c * rT * 0.46, yT + rT * 0.22); ctx.closePath(); ctx.fill(); });
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
      if (LOURD) { ctx.strokeStyle = sombre(email, 0.1); ctx.lineWidth = 1.4; ctx.beginPath(); ctx.arc(0, yT, rT * 1.02, Math.PI * 1.12, Math.PI * 1.88); ctx.stroke(); }
      liseré(ctx, 0, yT, rT * 0.95, rT * 0.88, -1.2, 0.6, 0.7);
    }

    /* le bras de devant, et ce qu'il tient */
    if (f === 0) { bras(-1, true); bras(1, true); } else bras(-cFond, true);
    if (type === "bouclier" && !o.sansBouclier) {
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
    if (o.grille) { ctx.fillStyle = "rgba(60,60,64,.45)"; for (var fm = 0; fm < 3; fm++) { var fa3 = t * 2 + fm * 2.1; ell(ctx, Math.sin(fa3) * 3, yT - rT * 1.2 - ((t * 9 + fm * 4) % 10), 2.4 + fm * 0.4, 2); ctx.fill(); } }
    if (E.meche) {
      var ty0 = yT - rT * 0.95;
      ctx.strokeStyle = "#5A4630"; ctx.lineWidth = 1.1; ctx.beginPath(); ctx.moveTo(0, ty0); ctx.quadraticCurveTo(3, ty0 - 4, 1.5, ty0 - 7); ctx.stroke();
      lueur(ctx, 1.5, ty0 - 7.5, 4, "#FFD27A", 0.7); ctx.fillStyle = Math.sin(t * 40) > 0 ? "#FFF2B0" : "#FF8A3D"; ell(ctx, 1.5, ty0 - 7.5, 1.4, 1.4); ctx.fill();
    }
    ctx.restore();
  };

  /* ---------- les quatre gros boss (version 14) ---------- */
  function grosBoss(ctx, type, o) {
    var S = SORTES[type], E = o.etats || {}, t = o.t || 0, f = Math.max(-1, Math.min(1, o.face || 0)), LOURD = type === "glouton";
    // les mêmes mesures que dans automate() (pour poser ce qu'on ajoute au bon endroit)
    var vit = E.statue ? 0 : (o.marche || 0), ph = t * (S.poids > 1.3 ? 6 : S.poids < 0.9 ? 11 : 8.5), bob = -Math.abs(Math.sin(ph)) * 0.9 * vit * (2 - S.poids * 0.5), sw = Math.sin(ph) * 0.38 * vit;
    var bw = S.bw * (1 - 0.1 * Math.abs(f)), bh = S.bh, rT = S.rT, yH = -S.jambe + bob, yB = yH - bh, yT = yB - rT * 0.72 - (LOURD ? -rT * 0.55 : 0), dx = f * bw * 0.42, hdx = f * rT * 0.42;
    var devant = f > 0 ? -1 : 1;   // le côté du bras de devant
    function main(cote) {
      var sx = cote * (bw + S.rB * 0.4), sy0 = yB + bh * 0.22, ang = (cote * 0.18) + (cote > 0 ? sw : -sw);
      var ex = sx + Math.sin(ang) * S.bras * 0.55 + cote * 1.2, ey = sy0 + Math.cos(ang) * S.bras * 0.55;
      return { x: ex + Math.sin(ang * 1.4) * S.bras * 0.5, y: ey + Math.cos(ang * 1.4) * S.bras * 0.48 };
    }
    if (type === "glouton") {
      automate(ctx, type, o);
      var cq = "#F1E4CA";
      if (o.gonfle) { ell(ctx, 0, yB + bh * 0.7, bw * 1.14, bh * 0.52); ctx.fillStyle = volume(ctx, 0, yB + bh * 0.5, bw * 1.15, cq, true); ctx.fill(); trait(ctx, cq, 1); }
      // la grande bouche sur le ventre, avec des dents ; elle mâche quand il mange ; fermée quand il dort
      var bx = dx * 0.8, byy = yB + bh * 0.8, bl = bw * 0.6, ouvre = o.bouche ? 1 : o.dort ? 0 : 0.4, bhh = bh * (0.05 + 0.15 * ouvre);
      if (ouvre > 0.1) {
        ell(ctx, bx, byy, bl, bhh); ctx.fillStyle = "#3A1410"; ctx.fill(); trait(ctx, "#5A2A1A", 0.8);
        ell(ctx, bx, byy + bhh * 0.45, bl * 0.5, bhh * 0.45); ctx.fillStyle = "#C2424A"; ctx.fill();
        ctx.fillStyle = "#FFF6E0";
        for (var d = -3; d <= 3; d++) { var tx = bx + d * bl * 0.27, ky = Math.sqrt(Math.max(0, 1 - Math.pow(d * 0.27, 2)));
          ctx.beginPath(); ctx.moveTo(tx - 1.2, byy - bhh * ky); ctx.lineTo(tx, byy - bhh * ky + 2.2); ctx.lineTo(tx + 1.2, byy - bhh * ky); ctx.fill();
          if (d % 2 === 0) { ctx.beginPath(); ctx.moveTo(tx - 1.1, byy + bhh * ky); ctx.lineTo(tx, byy + bhh * ky - 2); ctx.lineTo(tx + 1.1, byy + bhh * ky); ctx.fill(); } }
      } else { ctx.strokeStyle = "#5A2A1A"; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(bx - bl, byy - 1); ctx.quadraticCurveTo(bx, byy + 2.5, bx + bl, byy - 1); ctx.stroke(); }
      // la serviette nouée au cou, à carreaux rouges
      var nx = dx * 0.3, ny = yB + rT * 0.85;
      ctx.save(); ctx.beginPath(); ctx.moveTo(nx - bw * 0.55, ny); ctx.lineTo(nx + bw * 0.55, ny); ctx.lineTo(dx * 0.6, yB + bh * 0.6); ctx.closePath();
      ctx.fillStyle = "#FFFDF6"; ctx.fill(); trait(ctx, "#D8D0C0", 0.6); ctx.clip();
      ctx.strokeStyle = "rgba(200,40,40,.55)"; ctx.lineWidth = 1.1;
      for (var q = -12; q <= 12; q += 3) { ctx.beginPath(); ctx.moveTo(nx + q, ny - 2); ctx.lineTo(nx + q, yB + bh * 0.65); ctx.stroke(); ctx.beginPath(); ctx.moveTo(nx - 12, ny + 1.5 + (q + 12) * 0.5); ctx.lineTo(nx + 12, ny + 1.5 + (q + 12) * 0.5); ctx.stroke(); }
      ctx.restore();
      [-1, 1].forEach(function (c) { ctx.beginPath(); ctx.moveTo(nx, ny); ctx.lineTo(nx + c * 3.2, ny - 2.2); ctx.lineTo(nx + c * 3.2, ny + 1.6); ctx.closePath(); ctx.fillStyle = "#FFFDF6"; ctx.fill(); trait(ctx, "#C8C0B0", 0.5); });
      // la fourchette, dans la main de devant
      var M = main(f === 0 ? 1 : devant);
      ctx.strokeStyle = "#C9D2DA"; ctx.lineWidth = 1.1; ctx.lineCap = "round"; ctx.beginPath(); ctx.moveTo(M.x, M.y + 1.5); ctx.lineTo(M.x + 0.8, M.y - 11); ctx.stroke();
      ctx.lineWidth = 0.7; for (var dn = -1; dn <= 1; dn++) { ctx.beginPath(); ctx.moveTo(M.x + 0.8 + dn * 1.3, M.y - 11); ctx.lineTo(M.x + 0.8 + dn * 1.3, M.y - 15); ctx.stroke(); }
      ctx.beginPath(); ctx.moveTo(M.x - 0.5, M.y - 11); ctx.lineTo(M.x + 2.1, M.y - 11); ctx.stroke();
      return;
    }
    if (type === "frileux") {
      var ch = o.chaud || 0;
      if (ch >= 0.75) lueur(ctx, 0, yB + bh * 0.5, bw * 2.4, "#FF5A2A", 0.3 + 0.15 * Math.sin(t * 9));
      automate(ctx, type, o);
      // l'écharpe rayée, et son bout qui pend
      var ex0 = dx * 0.3, ey0 = yB - 0.4;
      rrect(ctx, ex0 - bw * 0.55, ey0 - 1.6, bw * 1.1, 3.2, 1.5); ctx.fillStyle = "#C8323A"; ctx.fill(); trait(ctx, "#C8323A", 0.6);
      ctx.strokeStyle = "#FFF2E8"; ctx.lineWidth = 0.9; for (var r1 = -2; r1 <= 2; r1++) { ctx.beginPath(); ctx.moveTo(ex0 + r1 * bw * 0.22, ey0 - 1.5); ctx.lineTo(ex0 + r1 * bw * 0.22 + 0.8, ey0 + 1.5); ctx.stroke(); }
      var bout = -devant * bw * 0.35 + dx * 0.4, fl = Math.sin(t * 4) * 1.2;
      ctx.beginPath(); ctx.moveTo(bout - 1.6, ey0 + 1); ctx.quadraticCurveTo(bout - 2 + fl, ey0 + bh * 0.3, bout - 1 + fl * 1.5, ey0 + bh * 0.62); ctx.lineTo(bout + 2.2 + fl * 1.5, ey0 + bh * 0.62); ctx.quadraticCurveTo(bout + 1.5 + fl, ey0 + bh * 0.3, bout + 1.6, ey0 + 1); ctx.closePath();
      ctx.fillStyle = "#C8323A"; ctx.fill(); trait(ctx, "#C8323A", 0.5);
      ctx.strokeStyle = "#FFF2E8"; ctx.lineWidth = 1; [0.3, 0.5].forEach(function (k) { ctx.beginPath(); ctx.moveTo(bout - 1.6 + fl * k, ey0 + bh * 0.62 * k + 1); ctx.lineTo(bout + 2 + fl * k, ey0 + bh * 0.62 * k + 1); ctx.stroke(); });
      // le bonnet à pompon
      ctx.beginPath(); ctx.moveTo(-rT * 1.05, yT - rT * 0.25); ctx.quadraticCurveTo(-rT * 1.0, yT - rT * 1.6, hdx * 0.4, yT - rT * 1.55); ctx.quadraticCurveTo(rT * 1.0, yT - rT * 1.6, rT * 1.05, yT - rT * 0.25); ctx.closePath();
      ctx.fillStyle = volume(ctx, 0, yT - rT, rT * 1.2, "#C8323A", true); ctx.fill(); trait(ctx, "#C8323A", 0.7);
      rrect(ctx, -rT * 1.1, yT - rT * 0.5, rT * 2.2, rT * 0.42, rT * 0.2); ctx.fillStyle = volume(ctx, 0, yT - rT * 0.3, rT, "#FFF2E8"); ctx.fill(); trait(ctx, "#D8CCC0", 0.5);
      ell(ctx, hdx * 0.4, yT - rT * 1.65, 1.9, 1.9); ctx.fillStyle = volume(ctx, hdx * 0.4, yT - rT * 1.65, 2, "#FFFFFF", true); ctx.fill(); trait(ctx, "#D8CCC0", 0.5);
      // les glaçons (ils fondent quand il chauffe)
      var n = Math.round((1 - ch) * 4);
      var glacons = [[-(bw + S.rB * 0.4), yB + bh * 0.22 + 2.5], [bw + S.rB * 0.4, yB + bh * 0.22 + 2.5], [hdx - 2, yT + rT * 0.95], [hdx + 2.2, yT + rT * 0.9]];
      for (var gi = 0; gi < n; gi++) { var G = glacons[gi], lg = 3.5 + (gi % 2) * 1.5; ctx.beginPath(); ctx.moveTo(G[0] - 1.2, G[1]); ctx.lineTo(G[0], G[1] + lg); ctx.lineTo(G[0] + 1.2, G[1]); ctx.closePath(); ctx.fillStyle = "rgba(210,240,255,.95)"; ctx.fill(); ctx.strokeStyle = "rgba(120,180,220,.9)"; ctx.lineWidth = 0.4; ctx.stroke(); }
      if (ch <= 0.25) { ctx.strokeStyle = "rgba(255,255,255,.9)"; ctx.lineWidth = 0.5; [[-bw * 0.6, yB + 3], [bw * 0.5, yB + bh * 0.6], [-bw * 0.2, yB + bh * 0.85]].forEach(function (P) { ctx.beginPath(); ctx.moveTo(P[0] - 1.2, P[1]); ctx.lineTo(P[0] + 1.2, P[1]); ctx.moveTo(P[0], P[1] - 1.2); ctx.lineTo(P[0], P[1] + 1.2); ctx.stroke(); }); }
      return;
    }
    if (type === "singe") {
      // la queue en spirale, derrière
      var cq2 = -devant, qb = "#7A4E2A";
      ctx.beginPath(); ctx.moveTo(cq2 * bw * 0.3, yH - 2); ctx.bezierCurveTo(cq2 * bw * 1.5, yH + 1, cq2 * bw * 2.1, yB + bh * 0.3, cq2 * bw * 1.6, yB - 1);
      ctx.arc(cq2 * bw * 1.35, yB - 1, bw * 0.25, 0, Math.PI * 1.6, cq2 < 0);
      ctx.strokeStyle = qb; ctx.lineWidth = 2.2; ctx.lineCap = "round"; ctx.stroke(); ctx.strokeStyle = "rgba(255,230,200,.35)"; ctx.lineWidth = 0.7; ctx.stroke();
      automate(ctx, type, o);
      // les oreilles, le museau, la touffe
      [-1, 1].forEach(function (c) { var ox = hdx * 0.3 + c * rT * 1.02, oy = yT - rT * 0.1;
        ell(ctx, ox, oy, rT * 0.42, rT * 0.44); ctx.fillStyle = volume(ctx, ox, oy, rT * 0.5, "#7A4E2A"); ctx.fill(); trait(ctx, "#7A4E2A", 0.6);
        ell(ctx, ox, oy, rT * 0.24, rT * 0.26); ctx.fillStyle = "#E3A7A0"; ctx.fill(); });
      ell(ctx, hdx, yT + rT * 0.66, rT * 0.56, rT * 0.34); ctx.fillStyle = volume(ctx, hdx, yT + rT * 0.6, rT * 0.6, "#F0D8B0", true); ctx.fill(); trait(ctx, "#C8A880", 0.5);
      ctx.fillStyle = "#3A2418"; ell(ctx, hdx - 0.9, yT + rT * 0.55, 0.45, 0.35); ctx.fill(); ell(ctx, hdx + 0.9, yT + rT * 0.55, 0.45, 0.35); ctx.fill();
      ctx.strokeStyle = "#3A2418"; ctx.lineWidth = 0.6; ctx.beginPath(); ctx.arc(hdx, yT + rT * 0.62, rT * 0.28, 0.35, Math.PI - 0.35); ctx.stroke();
      ctx.fillStyle = "#7A4E2A"; for (var k = -1; k <= 1; k++) { ctx.beginPath(); ctx.moveTo(hdx * 0.5 + k * 1.6 - 1, yT - rT * 0.78); ctx.lineTo(hdx * 0.5 + k * 2.2, yT - rT * 1.35 - (k ? 0 : 0.8)); ctx.lineTo(hdx * 0.5 + k * 1.6 + 1, yT - rT * 0.78); ctx.fill(); }
      return;
    }
    if (type === "sauteur") {
      // monté sur deux gros ressorts : écrasés quand il touche le sol, tendus en l'air
      var c = o.ressort || 0, hS = c >= 1 ? 4.5 : c >= 0.5 ? 7.5 : 11;
      [-1, 1].forEach(function (cote) {
        var cx = cote * (S.hanche + 0.6);
        ell(ctx, cx, -0.6, 3.8, 1.4); ctx.fillStyle = "#3E6E2A"; ctx.fill();
        ctx.beginPath(); ctx.moveTo(cx, -0.8); for (var i = 1; i <= 8; i++) ctx.lineTo(cx + (i % 2 ? 2.6 : -2.6), -0.8 - (hS - 0.8) * i / 8.5); ctx.lineTo(cx, -hS);
        ctx.strokeStyle = "#8E9AA4"; ctx.lineWidth = 1.5; ctx.lineJoin = "round"; ctx.stroke(); ctx.strokeStyle = "rgba(255,255,255,.55)"; ctx.lineWidth = 0.5; ctx.stroke();
      });
      ctx.save(); ctx.translate(0, -hS);
      automate(ctx, type, o);
      // des antennes à ressort, une boule jaune au bout
      [-1, 1].forEach(function (cote) {
        var ax = hdx * 0.6 + cote * rT * 0.45, ay = yT - rT * 0.8, sp = Math.sin(t * 8 + cote) * 0.8;
        ctx.beginPath(); ctx.moveTo(ax, ay); for (var i = 1; i <= 6; i++) ctx.lineTo(ax + cote * i * 0.5 + (i % 2 ? 1.1 : -1.1) + sp * i / 6, ay - i * 1.3);
        ctx.strokeStyle = "#6F8597"; ctx.lineWidth = 0.7; ctx.stroke();
        ell(ctx, ax + cote * 3 + sp, ay - 8.4, 1.6, 1.6); ctx.fillStyle = volume(ctx, ax + cote * 3 + sp, ay - 8.4, 1.8, "#F2D24A", true); ctx.fill(); trait(ctx, "#C8A82A", 0.4);
      });
      ctx.restore();
      return;
    }
  }

  /* ---------- Grosbec dans son armure ---------- */
  /* Une énorme armure faite des pièces de la ville d'en bas (un métal bleuté) cerclée de bronze ; un casque en grand bec
     (son nom), les yeux qui luisent derrière ; les quatre Lanternes d'Or serties dans l'armure (sur la poitrine et sur les
     épaules) d'où partent des veines d'or : c'est l'énergie qu'il siphonne ; l'écharpe rouge du maire et sa médaille ;
     la bague au corbeau sur son poing. o : t, coup (0 à 1 : il vient d'être touché), rage (0 à 1), ordre (0 à 1 : il lève le bras).
     (version 9) brasG, brasD (0 à 1 : il lève le bras gauche, le droit), saut (en unités : il décolle du sol, pour taper du pied),
     tremble (0 à 1 : il tremble de colère). */
  var ACIER = "#4D6577", BRONZE = "#A8783A", OR = "#F2C230", ROUGE = "#8E2A2A";
  PC.grosbec = function (ctx, o) {
    o = o || {};
    var t = o.t || 0, rage = o.rage || 0, coup = o.coup || 0, ordre = o.ordre || 0;
    var resp = Math.sin(t * 1.6) * 0.8, tremble = (coup > 0 ? Math.sin(t * 70) * 2 * coup : 0) + (o.tremble ? Math.sin(t * 53) * 2.2 * o.tremble : 0);
    var veine = mix(OR, "#FF4A2A", rage), yeux = mix("#FFC266", "#FF3A20", rage);
    ctx.save(); ctx.translate(tremble, -(o.saut || 0));

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
      var lv = c > 0 ? Math.max(ordre, o.brasD || 0) : (o.brasG || 0);
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
