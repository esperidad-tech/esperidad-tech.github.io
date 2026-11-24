function ensureSprites() {
  if (cv.width < 8 || cv.height < 8) return;
  // kvR : la taille de l'écran SANS la finesse. Les images cuites (golems, Grosbec, lueurs) gardent cette taille :
  // quand la page baisse sa finesse parce que l'appareil rame, rien n'est recuit en plein combat (leçon du jeu du Barde, Bible §16.7).
  const kv = view().k, kvR = kv / (FIN || 1), sc = Math.min(3, Math.max(1, kvR));
  if (R8.sc !== sc || !R8.spr.glowRed) {
    R8.sc = sc;
    R8.spr.glowRed = glowSprite(sc, 'rgba(255,70,80,A)'); R8.spr.glowCyan = glowSprite(sc, 'rgba(140,235,255,A)'); R8.spr.glowGold = glowSprite(sc, 'rgba(255,215,90,A)'); R8.spr.glowFire = glowSprite(sc, 'rgba(255,120,30,A)'); R8.spr.flame = flameSprite(sc * 2); R8.spr.glowPink = glowSprite(sc, 'rgba(255,120,220,A)');
    R8.spr.wall = wallPattern();
    R8.spr.parch = makeParchment();
    R8.spr.ombre = ombreSprite(sc); R8.spr.cuirasse = cuirasseSprite(sc * 1.5);
    { const c = mk(48 * sc, 20 * sc), g = c.getContext('2d'), gr = g.createRadialGradient(24 * sc, 24 * sc, 0, 24 * sc, 24 * sc, 24 * sc); gr.addColorStop(0, 'rgba(201,191,168,.9)'); gr.addColorStop(1, 'rgba(201,191,168,0)'); g.scale(1, 20 / 48); g.fillStyle = gr; g.fillRect(0, 0, 48 * sc, 48 * sc); R8.spr.fumee = c; }   // un nuage de poussière
    R8.spr.dos = { P: heroDos('P', sc * 1.25), A: heroDos('A', sc * 1.25), B: heroDos('B', sc * 1.25) };
  }
  // les golems et Grosbec sont cuits à la taille de l'écran (on ne les recuit que si elle change vraiment)
  const kg = Math.round(Math.min(1.3, Math.max(0.45, kvR * 0.64)) * 10) / 10;
  if (kg !== R8.kg) { R8.kg = kg; Golems.regler(kg); Golems.prevoir(Object.values(GOLEM).map(P => P.m)); }
  gbRegler(kvR, s ? s.entered.length + '|' + (s.rage ? 1 : 0) : GB.etat || '0|0');
}
