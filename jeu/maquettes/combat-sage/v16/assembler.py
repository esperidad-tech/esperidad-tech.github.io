# Fabrique render16.js à partir de render15.js (les effets, les pouvoirs, le Sage, l'affichage) et des morceaux neufs de v16/
import os
D = os.path.dirname(os.path.abspath(__file__)); S = os.path.dirname(D)
L = open(S + '/render15.js').read().split('\n')
f = lambda n: open(D + '/' + n).read().rstrip('\n')
def at(debut):   # le numéro (à partir de 0) de la ligne qui commence par…
    i = [n for n, l in enumerate(L) if l.startswith(debut)]; assert len(i) == 1, (debut, i); return i[0]
iPiece, iGlow, iBlit, iEtats = at("// le dessin d'une pièce"), at('function glowSprite'), at('function blit'), at('// ce que les amis lui ont fait')
iP, iHit = at("  if (id === 'P') {"), at('  if (hit) { ctx.globalAlpha')
iHeros, iCoeur, iSalle, iParch, iSprites, iParts = at('// ----- les héros -----'), at("// ----- le cœur de l'armure"), at("// ----- l'arène (dessinée une fois)"), at('function makeParchment'), at('function ensureSprites'), at('// ----- particules')
out = [f('entete.js')] + L[4:iPiece] + L[iGlow:iBlit] + [f('golems.js')] + L[iEtats:iHeros] + [f('herosdos.js')] + L[iHeros:iP] + [f('heros.js')] + L[iHit:iCoeur] + [f('grosbec.js'), '', f('salle.js')] + L[iParch:iSprites] + [f('sprites.js')] + L[iParts:]
s = '\n'.join(out)
def rep(a, b, n=1):
    global s
    assert s.count(a) == n, (a[:90], s.count(a)); s = s.replace(a, b)
# --- les golems cuirassés : la plaque est posée par drawGolem
i0 = s.index("  // cuirassé (la fureur du cœur) : un casque et une plaque de fer"); i1 = s.index("  // en feu et en panique (volcan niveau 3)"); s = s[:i0] + s[i1:]
# --- les amis ne sont plus retournés (ils sont de dos) ; seul le Sage regarde à gauche ou à droite
rep("const isSage = id === 'S', a = isSage ? R8.sage : { face: id === 'P' ? -1 : 1, spd: 0, phase: 0 };", "const isSage = id === 'S', a = isSage ? R8.sage : { face: 1, spd: 0, phase: 0 };")
# --- suivre les golems : leur pas, de quel côté ils sont tournés, leur chute
rep("""    if (!a) { a = { x: u.x, y: u.y, phase: Math.random() * TAU, face: u.x < 450 ? 1 : -1, spd: 0, rot: 0, age: 0, flying: false, mx: 1, my: 0 }; R8.anim.set(u.id, a); if (u.y > 20 && u.y < 880 && u.x > 20 && u.x < 880) burst(u.x, u.y + FOOT(u.type), 8, { k: 'rock', col: '#5a6070', v0: 30, v1: 110 }); }""",
    """    if (!a) { const dehors = u.x < 0 || u.x > 900 || u.y > 900; a = { x: u.x, y: u.y, phase: Math.random() * 2, yaw: u.x < 330 ? 1 : u.x > 570 ? -1 : dehors ? (u.id % 2 ? 1 : -1) : 0, face: 1, spd: 0, rot: 0, age: 0, flying: false, mx: 0, my: 0, dehors, pose: false }; R8.anim.set(u.id, a); }""")
rep("""    if (!a.flying && d > 0.2 && Math.abs(dx) > 0.05) a.face = dx > 0 ? 1 : -1;
    const P = GOLEM[u.type], before = Math.cos(a.phase);
    if (!a.flying && u.daze <= 0) a.phase += d / (P.lw * 1.25 + 4) * 1.7;
    const after = Math.cos(a.phase);
    if (d > 0.05 && !a.flying) { a.mx += (dx / d - a.mx) * 0.2; a.my += (dy / d - a.my) * 0.2; }
    if (before * after < 0 && a.spd > 8 && (u.type === 'brute' || u.type === 'costaud' || u.type === 'cogneur')) {
      dust(u.x + (Math.sin(a.phase) > 0 ? 1 : -1) * P.bw * 0.25 * a.face, u.y + FOOT(u.type), P.bw * 0.22);
      if (u.type === 'costaud') s.shake = Math.max(s.shake, 0.04);
    }""",
    """    const P = GOLEM[u.type], before = Math.floor(a.phase);
    if (!a.flying && u.daze <= 0) a.phase += d / P.pas;
    if (d > 0.05 && !a.flying) {     // de face quand il descend vers nous, tourné à gauche ou à droite sinon
      a.mx += (dx / d - a.mx) * 0.2; a.my += (dy / d - a.my) * 0.2;
      if (Math.abs(a.mx) > 0.5) a.yaw = a.mx > 0 ? 1 : -1; else if (a.my > 0.62 && Math.abs(a.mx) < 0.3) a.yaw = 0; else if (a.my < -0.6 && !a.yaw) a.yaw = u.x < 450 ? 1 : -1;
      a.face = a.yaw || 1;
    }
    if (Math.floor(a.phase) !== before && a.spd > 8 && P.lourd >= 0.5) {     // son pied tape le sol : un peu de poussière (le colosse fait trembler la salle)
      dust(u.x + (Math.floor(a.phase) & 1 ? 1 : -1) * P.bw * 0.22, u.y + P.F, P.bw * 0.2);
      if (u.type === 'costaud') s.shake = Math.max(s.shake, 0.04);
    }
    if (a.dehors && !a.pose && a.age >= 0.45) { a.pose = true; dust(u.x, u.y + P.F, P.bw * 0.5); }   // il retombe de la galerie""")
rep("""    burst(a.x, a.y + F, 10 + Math.round(P.bw / 6), { k: 'rock', col: P.pal[1], s0: P.bw * 0.12, s1: P.bw * 0.24, z: F });
    burst(a.x, a.y + F, 6, { k: 'shard', col: '#ff6a7a', s0: 3, s1: 5, z: F + 6, v0: 80, v1: 220 });""",
    """    burst(a.x, a.y + F, 7 + Math.round(P.bw / 8), { k: 'rock', col: '#373f47', s0: P.bw * 0.12, s1: P.bw * 0.24, z: F });
    burst(a.x, a.y + F, 4 + Math.round(P.bw / 14), { k: 'rock', col: '#8a6c40', s0: P.bw * 0.08, s1: P.bw * 0.16, z: F });
    burst(a.x, a.y + F, 6, { k: 'shard', col: '#ff7a3a', s0: 3, s1: 5, z: F + 6, v0: 80, v1: 220 });""")
# --- les effets neufs : Grosbec réagit
rep("""    if (e._seen) continue; e._seen = true;""", """    if (e._seen) continue; e._seen = true;
    gbFx(e, R8.t);""")
# --- le grand dessin
rep("""  trackUnits(gdt); newFx(); stepParts(gdt);""", """  gbSuivre(t, gdt); trackUnits(gdt); newFx(); tirsAmis(t, gdt); stepParts(gdt);
  if (!paused) cuisson(2.5);""")
rep("""  // la poussière qui flotte
  if (R8.motes.length < 36) R8.motes.push({ x: rnd(0, 900), y: rnd(0, 900), v: rnd(4, 12), p: rnd(0, TAU) });
  for (const m of R8.motes) { m.y -= m.v * gdt; m.x += Math.sin(t * 0.6 + m.p) * 4 * gdt; if (m.y < -10) { m.y = 910; m.x = rnd(0, 900); } ctx.globalAlpha = 0.18 + Math.sin(t + m.p) * 0.08; ctx.fillStyle = '#ffd9a0'; ctx.beginPath(); ctx.arc(m.x, m.y, 1.4, 0, TAU); ctx.fill(); }
  ctx.globalAlpha = 1;""",
    """  lumieres(t);
  // la poussière qui flotte dans la lumière
  if (R8.motes.length < 14) R8.motes.push({ x: rnd(0, 900), y: rnd(30, 900), v: rnd(4, 12), p: rnd(0, TAU) });
  ctx.fillStyle = '#c8f6ff'; for (const m of R8.motes) { m.y -= m.v * gdt; m.x += Math.sin(t * 0.6 + m.p) * 4 * gdt; if (m.y < 30) { m.y = 910; m.x = rnd(0, 900); } ctx.globalAlpha = 0.2 + Math.sin(t + m.p) * 0.1; ctx.fillRect(m.x, m.y, 2.4, 2.4); }
  ctx.globalAlpha = 1;""")
rep("""    g.addColorStop(0, `rgba(255,60,80,${a})`); g.addColorStop(1, 'rgba(255,60,80,0)'); ctx.fillStyle = g; ctx.fillRect(0, 0, 900, 900);""",
    """    g.addColorStop(0, `rgba(255,60,80,${a})`); g.addColorStop(1, 'rgba(255,60,80,0)'); ctx.fillStyle = g; bande(e.side, 90);""")
rep("""g.addColorStop(0, `rgba(170,20,40,${b * 0.6})`); g.addColorStop(1, 'rgba(170,20,40,0)'); ctx.fillStyle = g; ctx.fillRect(0, 0, 900, 900); } }""",
    """g.addColorStop(0, `rgba(170,20,40,${b * 0.6})`); g.addColorStop(1, 'rgba(170,20,40,0)'); ctx.fillStyle = g; bande(side, 120); } }""")
rep("  // la colère du cœur : les bords de la place rougissent et battent", "  // la colère de Grosbec : les bords de la salle rougissent et battent")
rep("""  if (!s.heart.bare) drawHeart(t, gdt);
""", "")
rep("""  for (const f of s.friends) items.push({ y: f.y + 28, d: () => drawHero(f, t) });""", """  items.push({ y: GB.y, d: () => drawGrosbec(t) });
  for (const f of s.friends) items.push({ y: f.y + 28, d: () => drawHero(f, t) });""")
rep("""  if (s.heart.bare) drawHeart(t, gdt);
""", "")
rep("""  for (const p of s.potions) drawPotion(p);""", """  drawTirs(t);
  for (const p of s.potions) drawPotion(p);""")
# les braises des frondeurs (à la place des pierres)
i0 = s.index("  for (const p of s.stones) {"); i1 = s.index("  // les effets des runes")
s = s[:i0] + """  if (s.stones.length) { const sp = Golems.eclat(), w = sp.w * 0.62, h = sp.h * 0.62;
    for (const p of s.stones) {
      ctx.fillStyle = 'rgba(0,0,0,.3)'; ctx.beginPath(); ctx.ellipse(p.x, p.y + 20, 6, 2.5, 0, 0, TAU); ctx.fill();
      ctx.globalAlpha = 0.75; ctx.drawImage(p.back ? R8.spr.glowGold : R8.spr.glowFire, p.x - 17, p.y - 17, 34, 34); ctx.globalAlpha = 1;
      ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(Math.atan2(p.vy, p.vx) + Math.PI / 2); ctx.drawImage(sp.c, -w / 2, -h / 2, w, h); ctx.restore();
    }
  }
""" + s[i1:]
# les mots de Grosbec, au-dessus de son casque
rep("""  // le parchemin et l'encre
  ctx.setTransform(1, 0, 0, 1, 0, 0);""", """  if (GB.mots) { const u = t - GB.mots.t0; if (u > 1.5) GB.mots = null; else { const p = gbPoint('tete'); ctx.globalAlpha = Math.min(1, (1.5 - u) * 3, u * 8); ctx.font = `900 ${popSize}px Nunito, sans-serif`; ctx.textAlign = 'center'; ctx.lineWidth = 4; ctx.strokeStyle = 'rgba(11,16,32,.9)'; const y = Math.max(-TOP + popSize, p.y - 34 - u * 8); ctx.strokeText(GB.mots.txt, GB.x, y); ctx.fillStyle = '#ffd0d6'; ctx.fillText(GB.mots.txt, GB.x, y); ctx.globalAlpha = 1; } }
  // le parchemin et l'encre
  ctx.setTransform(1, 0, 0, 1, 0, 0);""")
# ----- pour que ça ne rame jamais : moins de tracés, moins de texte, moins de grandes lueurs quand tout éclate en même temps -----
# les particules : des carrés (pas de ronds à lisser), sans rotation ; jamais plus de 320 à la fois
i0 = s.index("function burst(x, y, n, o) {"); i1 = s.index("// ----- suivre chaque soldat d'une image à l'autre")
s = s[:i0] + """function burst(x, y, n, o) {
  const L = R8.parts.length; if (L > 300) return; if (L > 180) n = Math.ceil(n / 3);     // déjà beaucoup d'éclats : on en ajoute moins
  for (let i = 0; i < n; i++) {
    const a = rnd(0, TAU), v = rnd(o.v0 ?? 60, o.v1 ?? 200), life = rnd(o.l0 ?? 0.5, o.l1 ?? 0.9);
    R8.parts.push({ x, y, z: o.z ?? 0, vx: Math.cos(a) * v, vy: Math.sin(a) * v * 0.6, vz: rnd(o.vz0 ?? 80, o.vz1 ?? 260), life, max: life, k: o.k, col: o.col ?? '#9aa3b5', size: rnd(o.s0 ?? 3, o.s1 ?? 6), g: o.g ?? 700 });
  }
}
function dust(x, y, size) { if (R8.parts.length < 240) R8.parts.push({ x, y, z: 0, vx: rnd(-10, 10), vy: rnd(-4, 4), vz: 0, life: 0.45, max: 0.45, k: 'puff', size, g: 0 }); }
function stepParts(dt) {
  let n = 0; const P = R8.parts;
  for (let i = 0; i < P.length; i++) {
    const p = P[i]; p.life -= dt; if (p.life <= 0) continue;
    p.x += p.vx * dt; p.y += p.vy * dt;
    if (p.g) { p.vz -= p.g * dt; p.z += p.vz * dt; if (p.z < 0) { p.z = 0; p.vz *= -0.35; p.vx *= 0.6; p.vy *= 0.6; } }
    P[n++] = p;
  }
  P.length = n; if (n > 320) P.splice(0, n - 320);
}
function drawParts(front) {
  for (const p of R8.parts) {
    const a = Math.max(0, Math.min(1, p.life / p.max * 1.6));
    if (!front) { if (p.k === 'puff') { const w = p.size * (1.6 - p.life / p.max) * 2.4; ctx.globalAlpha = a * 0.5; ctx.drawImage(R8.spr.fumee, p.x - w / 2, p.y - w * 0.2, w, w * 0.4); } continue; }
    if (p.k === 'spark') { const r = p.size * a; ctx.globalAlpha = a; ctx.fillStyle = p.col; ctx.fillRect(p.x - r, p.y - p.z - r, r * 2, r * 2); }
    else if (p.k === 'rock') { const z = p.size; ctx.globalAlpha = a; ctx.fillStyle = p.col; ctx.fillRect(p.x - z / 2, p.y - p.z - z / 2, z, z * 0.8); ctx.fillStyle = 'rgba(0,0,0,.4)'; ctx.fillRect(p.x - z / 2, p.y - p.z + z * 0.12, z, z * 0.18); }
    else if (p.k === 'shard') { const z = p.size, y = p.y - p.z; ctx.globalAlpha = a; ctx.fillStyle = p.col; ctx.beginPath(); ctx.moveTo(p.x, y - z); ctx.lineTo(p.x + z * .5, y); ctx.lineTo(p.x, y + z); ctx.lineTo(p.x - z * .5, y); ctx.fill(); }
    else if (p.k === 'note') { ctx.globalAlpha = a * 0.9; note(p.x, p.y, p.col, 0.8); }
  }
  ctx.globalAlpha = 1;
}
// un mot qui s'envole (« −2 », « sonné ! ») : écrit une fois dans une petite image, puis recopié (écrire du texte à chaque image coûte cher)
const MOTS = new Map();
if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => MOTS.clear());
function mot(txt, col, px) {
  const cle = txt + '|' + col + '|' + px; let sp = MOTS.get(cle); if (sp) return sp;
  if (MOTS.size > 90) vider(MOTS);
  const f = `800 ${px}px Nunito, sans-serif`, m = mk(4, 4).getContext('2d'); m.font = f;
  const w = Math.ceil(m.measureText(txt).width) + 12, h = Math.ceil(px * 1.5) + 8, c = mk(w, h), g = c.getContext('2d');
  g.font = f; g.textAlign = 'center'; g.textBaseline = 'middle'; g.lineJoin = 'round'; g.lineWidth = Math.max(3, px * 0.2); g.strokeStyle = 'rgba(11,16,32,.85)'; g.strokeText(txt, w / 2, h / 2); g.fillStyle = col; g.fillText(txt, w / 2, h / 2);
  sp = { c, w, h }; MOTS.set(cle, sp); return sp;
}

""" + s[i1:]
i0 = s.index("  for (const e of s.fx) if (e.k === 'pop') {"); i1 = s.index("\n", i0)
s = s[:i0] + """  { const px = Math.max(8, Math.round(popSize * k)); for (const e of s.fx) if (e.k === 'pop') { const a = Math.max(0, e.life / e.max), sp = mot(e.t, e.col, px), w = sp.w / k, h = sp.h / k, x = Math.max(70, Math.min(830, e.x)), y = Math.max(30, e.y - 30 - (1 - a) * 26); ctx.globalAlpha = Math.min(1, a * 2); ctx.drawImage(sp.c, x - w / 2, y - popSize * 0.35 - h / 2, w, h); } ctx.globalAlpha = 1; }""" + s[i1:]
# les orbes et les étoiles : quand il y en a beaucoup, plus de lueur ni de rond (un carré clair et sa traîne)
rep("""    ctx.globalAlpha = 0.8; ctx.drawImage(R8.spr.glowCyan, b.x - 15, b.y - 15, 30, 30); ctx.globalAlpha = 1;
    const br = 4.5 + ((b.dmg || 1) - 1) * 1.6, tl = b.pierce !== undefined && G.lv(s, 'percant') ? 0.07 : 0.03;""",
    """    const br = 4.5 + ((b.dmg || 1) - 1) * 1.6, tl = b.pierce !== undefined && G.lv(s, 'percant') ? 0.07 : 0.03;
    if (s.bolts.length > 36) { ctx.fillStyle = (b.dmg || 1) > 1 ? 'rgba(255,214,120,.55)' : 'rgba(200,245,255,.5)'; const tx = b.x - b.vx * tl * 0.6, ty = b.y - b.vy * tl * 0.6; ctx.fillRect(tx - br * 0.6, ty - br * 0.6, br * 1.2, br * 1.2); ctx.fillStyle = (b.dmg || 1) > 1 ? '#fff3c4' : '#ffffff'; ctx.fillRect(b.x - br, b.y - br, br * 2, br * 2); continue; }
    ctx.globalAlpha = 0.8; ctx.drawImage(R8.spr.glowCyan, b.x - 15, b.y - 15, 30, 30); ctx.globalAlpha = 1;""")
# les grandes lueurs des éclatements : dix au plus par image (les autres gardent leur cœur clair)
rep("""  // les effets des runes
  for (const e of s.fx) {
    const a = Math.max(0, e.life / e.max);""", """  // les effets des runes
  let lueurs = 0;
  for (const e of s.fx) {
    const a = Math.max(0, e.life / e.max);""")
rep("""    if (e.k === 'burst') { ctx.globalAlpha = a; ctx.drawImage(R8.spr.glowCyan, e.x - e.R, e.y - e.R, e.R * 2, e.R * 2);""", """    if (e.k === 'burst') { ctx.globalAlpha = a; if (lueurs++ < 10) ctx.drawImage(R8.spr.glowCyan, e.x - e.R, e.y - e.R, e.R * 2, e.R * 2);""")
rep("""ctx.globalAlpha = a; ctx.drawImage(e.stone ? R8.spr.glowGold : R8.spr.glowFire, e.x - R * 1.4, e.y - R * 1.4, R * 2.8, R * 2.8);""", """ctx.globalAlpha = a; if (lueurs++ < 10) ctx.drawImage(e.stone ? R8.spr.glowGold : R8.spr.glowFire, e.x - R * 1.4, e.y - R * 1.4, R * 2.8, R * 2.8);""")
rep("""    if (e.k === 'pop2') { const R = e.big ? 75 : 50; ctx.globalAlpha = a; ctx.drawImage(R8.spr.glowGold, e.x - R, e.y - R * 0.72, R * 2, R * 2); ctx.globalAlpha = 1; }""", """    if (e.k === 'pop2') { if (lueurs++ < 10) { const R = e.big ? 75 : 50; ctx.globalAlpha = a; ctx.drawImage(R8.spr.glowGold, e.x - R, e.y - R * 0.72, R * 2, R * 2); ctx.globalAlpha = 1; } }""")
# une étoile : dessinée une fois par couleur, puis recopiée
i0 = s.index("function star(x, y, r, col) {"); i1 = s.index("}\n", s.index("ctx.closePath(); ctx.fill();", i0)) + 2
s = s[:i0] + """const ETOILES = {};
function star(x, y, r, col) {
  let c = ETOILES[col];
  if (!c) { c = ETOILES[col] = mk(40, 40); const g = c.getContext('2d'); g.fillStyle = col; g.beginPath(); for (let i = 0; i < 10; i++) { const a = i / 10 * TAU - Math.PI / 2, q = i % 2 ? 9 : 20; g.lineTo(20 + Math.cos(a) * q, 20 + Math.sin(a) * q); } g.closePath(); g.fill(); }
  ctx.drawImage(c, x - r, y - r, r * 2, r * 2);
}
""" + s[i1:]
# le « !! » des golems en panique : une petite image
i0 = s.index("  if (u.burn > 0 && G.lv(s, 'volcan') >= 3 && u.daze <= 0) { ctx.font"); i1 = s.index("\n", i0)
s = s[:i0] + """  if (u.burn > 0 && G.lv(s, 'volcan') >= 3 && u.daze <= 0) { const kk = R8.kv || 1, sp = mot('!!', '#ffdf6b', Math.max(8, Math.round(17 * kk))), w = sp.w / kk, h = sp.h / kk; ctx.drawImage(sp.c, u.x - w / 2, top - 10 + Math.sin(t * 20 + u.id) * 2 - h * 0.7, w, h); }""" + s[i1:]
rep("const { k, ox, oy } = view(), dpr = cv.width / cv.getBoundingClientRect().width || 1, cw = cv.width / dpr, ch = cv.height / dpr;", "const { k, ox, oy } = view(), dpr = R8.dpr || (R8.dpr = cv.width / cv.getBoundingClientRect().width || 1), cw = cv.width / dpr, ch = cv.height / dpr; R8.kv = k;")
# l'affichage
rep("s.rage >= 3 ? '💢 FUREUR du cœur' : s.rage === 2 ? '💢 Le cœur est fou de rage' : '💢 Le cœur est en colère'", "s.rage >= 3 ? '💢 FUREUR de Grosbec' : s.rage === 2 ? '💢 Grosbec est fou de rage' : '💢 Grosbec est en colère'")
# deux petites fonctions de plus : une bande au bord de la salle (au lieu de repeindre tout l'écran), et les lumières qui battent
s += """
// une bande au bord de la salle (0 le haut, 1 la droite, 2 le bas, 3 la gauche) : on ne repeint que là où ça se voit
function bande(side, w) { side === 0 ? ctx.fillRect(0, 0, 900, w) : side === 2 ? ctx.fillRect(0, 900 - w, 900, w) : side === 3 ? ctx.fillRect(0, 0, w, 900) : ctx.fillRect(900 - w, 0, w, 900); }
// les lumières calmes de la salle, juste après le fond : les rigoles d'or et le tour de la rosace, les lanternes, le rouge des forges
function lumieres(t) {
  const pul = 0.5 + 0.5 * Math.sin(t * 2.4);
  ctx.fillStyle = `rgba(255,224,138,${0.06 + 0.2 * pul})`; ctx.fillRect(450 - 62 - 1.5, 118, 3, 251); ctx.fillRect(450 + 62 - 1.5, 118, 3, 251);
  ctx.globalAlpha = 0.22 + 0.2 * pul; for (const L of R8.lampes) ctx.drawImage(R8.spr.glowGold, L.x - 30, L.y - 30, 60, 60);
  ctx.globalAlpha = 0.2 + 0.12 * Math.sin(t * 5.1); for (const [a, b] of G.PORTES) ctx.drawImage(R8.spr.glowFire, (a + b) / 2 - 80, -40, 160, 96);
  ctx.globalAlpha = 1;
}
"""
open(S + '/render16.js', 'w').write(s)
print('render16.js :', len(s) // 1024, 'Ko')
for mot in ['drawHeart', 'heartPath', 'R8.heartY', 'limb(', 'blit(', 'crystal(', 'piece(', '.pal', 'P.lw', 'golemSprites']:
    if mot in s: print('  reste :', mot, s.count(mot))
