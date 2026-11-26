# Version 28 [Romain, 26 nov., 23 h 28 : « Je viens de passer 5 minutes à essayer de faire une étoile, j'y suis jamais arrivé. […] Et pourtant, elle était pas si mal faite que ça. »]
# La lecture des formes dorées de la version 27 ne marchait que sur des tracés de machine. Sur des tracés « à la main » (pointes irrégulières,
# petit crochet aux pointes, tracé pas tout à fait refermé ou qui dépasse), elle ratait l'étoile dessinée en contour presque toujours,
# l'étoile croisée une fois sur quatre, et prenait souvent un triangle ou un cercle pour une lune.
# Fabrique logic28.js à partir de logic27.js : une nouvelle lecture des tracés fermés.
#  1. on garde la boucle : on coupe ce qui dépasse au début et à la fin (là où le doigt repasse près de son départ) ;
#  2. on simplifie le tracé en lignes droites et on compte les pointes vraiment sèches (virage de plus de 105°), même coupées par un doigt rapide ;
#  3. on mesure si la forme est « pleine » (sa surface comparée à celle de l'élastique tendu autour) : une lune est creusée, un triangle est plein ;
#  étoile = 4 à 6 pointes sèches (l'étoile croisée ou l'étoile en contour) ; lune = creusée et 2 pointes (3 coins au plus) ; triangle = 3 coins secs et pleine ;
#  un carré (coins à angle droit, pas assez secs) et un cercle restent le bouclier ou la cage.
import os
ici = os.path.dirname(os.path.abspath(__file__)); base = os.path.dirname(ici)
s = open(os.path.join(base, 'logic27.js')).read()
def rep(a, b, n=1):
    global s
    assert s.count(a) == n, (a[:80], s.count(a)); s = s.replace(a, b)
i = s.index("  function formeDoree(pts) {"); j = s.index("  function recognize(pts) {")
s = s[:i] + """  function formeDoree(pts) {
    const n0 = pts.length; if (n0 < 12) return null;
    // 1. la boucle : les deux points les plus proches entre le début et la fin du tracé
    let bi = 0, bj = n0 - 1, bd = 1e9;
    for (let i = 0; i <= Math.floor(n0 * 0.2); i++) for (let j = Math.floor(n0 * 0.7); j < n0; j++) { const d = Math.hypot(pts[i].x - pts[j].x, pts[i].y - pts[j].y); if (d < bd) { bd = d; bi = i; bj = j; } }
    const boucle = pts.slice(bi, bj + 1), ferme = [...boucle, boucle[0]], L = pathLen(ferme); if (L < 150) return null;
    const N = 96, P = resample(ferme, L / N).slice(0, N); if (P.length < 40) return null;
    const n = P.length, ang = (u, v) => { let d = Math.atan2(v.y, v.x) - Math.atan2(u.y, u.x); while (d > Math.PI) d -= 2 * Math.PI; while (d < -Math.PI) d += 2 * Math.PI; return d; };
    // 2. les coins : on simplifie le tracé en lignes droites (on garde les points qui s'écartent de plus de 5 % de la taille),
    //    puis on mesure le virage à chaque coin, entre des points assez loin de lui (un coin coupé par un doigt rapide compte en entier)
    let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9; for (const p of P) { x0 = Math.min(x0, p.x); y0 = Math.min(y0, p.y); x1 = Math.max(x1, p.x); y1 = Math.max(y1, p.y); }
    const taille = Math.hypot(x1 - x0, y1 - y0), eps = 0.05 * taille, loin = 0.12 * taille;
    const ecart = (p, a, b) => { const dx = b.x - a.x, dy = b.y - a.y, l = Math.hypot(dx, dy) || 1; return Math.abs((p.x - a.x) * dy - (p.y - a.y) * dx) / l; };
    const simplifie = (A, i, j, o) => { let m = -1, im = -1; for (let t = i + 1; t < j; t++) { const e = ecart(A[t], A[i], A[j]); if (e > m) { m = e; im = t; } } if (m > eps) { simplifie(A, i, im, o); o.push(im); simplifie(A, im, j, o); } };
    let i0 = 0; { let cx = 0, cy = 0; P.forEach(p => { cx += p.x; cy += p.y; }); cx /= n; cy /= n; let dm = -1; P.forEach((p, i) => { const d = Math.hypot(p.x - cx, p.y - cy); if (d > dm) { dm = d; i0 = i; } }); }
    const Z = [...P.slice(i0), ...P.slice(0, i0)]; let i1 = 0, d1 = -1; Z.forEach((p, i) => { const d = Math.hypot(p.x - Z[0].x, p.y - Z[0].y); if (d > d1) { d1 = d; i1 = i; } });
    const Ab = [...Z, Z[0]], idx = [0]; simplifie(Ab, 0, i1, idx); idx.push(i1); simplifie(Ab, i1, n, idx);
    const V = idx.map(i => Ab[i]), m = V.length, tours = [];
    for (let i = 0; i < m; i++) { let j = i, k = i; do { j = (j - 1 + m) % m; } while (j !== i && Math.hypot(V[j].x - V[i].x, V[j].y - V[i].y) < loin); do { k = (k + 1) % m; } while (k !== i && Math.hypot(V[k].x - V[i].x, V[k].y - V[i].y) < loin); tours.push(j === i || k === i ? 0 : ang({ x: V[i].x - V[j].x, y: V[i].y - V[j].y }, { x: V[k].x - V[i].x, y: V[k].y - V[i].y })); }
    const coins = seuil => { const o = []; for (let i = 0; i < m; i++) { const v = Math.abs(tours[i]); if (v < seuil) continue; if ([...Array(m).keys()].some(j => j !== i && Math.abs(tours[j]) > v && Math.hypot(V[j].x - V[i].x, V[j].y - V[i].y) < loin)) continue; if (!o.some(j => Math.hypot(V[j].x - V[i].x, V[j].y - V[i].y) < loin)) o.push(i); } return o.length; };
    const secs = coins(1.83), forts = coins(1.4);
    // 3. pleine ou creusée : la surface de la forme / la surface de l'élastique tendu autour
    let A = 0; for (let i = 0; i < n; i++) { const p = P[i], q = P[(i + 1) % n]; A += p.x * q.y - q.x * p.y; } A = Math.abs(A) / 2;
    const Q = [...P].sort((a, b) => a.x - b.x || a.y - b.y), cr = (o, a, b) => (a.x - o.x) * (b.y - o.y) - (a.y - o.y) * (b.x - o.x), lo = [], hi = [];
    for (const p of Q) { while (lo.length >= 2 && cr(lo[lo.length - 2], lo[lo.length - 1], p) <= 0) lo.pop(); lo.push(p); }
    for (let i = Q.length - 1; i >= 0; i--) { const p = Q[i]; while (hi.length >= 2 && cr(hi[hi.length - 2], hi[hi.length - 1], p) <= 0) hi.pop(); hi.push(p); }
    const H = [...lo.slice(0, -1), ...hi.slice(0, -1)]; let AH = 0; for (let i = 0; i < H.length; i++) { const p = H[i], q = H[(i + 1) % H.length]; AH += p.x * q.y - q.x * p.y; } AH = Math.abs(AH) / 2;
    const plein = AH > 0 ? A / AH : 1;
    if ((secs >= 4 && secs <= 6) || (forts >= 4 && forts <= 7 && plein < 0.75)) return 'etoile';
    if (forts === 3 && secs >= 2 && plein > 0.85) return 'triangle';
    if (forts >= 1 && forts <= 3 && secs <= 2 && plein < (forts === 3 ? 0.84 : 0.9)) return 'lune';
    return null;
  }
""" + s[j:]
rep("    if (chord < 0.4 * diag) { const f = formeDoree(pts); if (f) return { kind: 'ferme', poly: pts, forme: f }; }", "    if (chord < 0.45 * diag || T > 1.6 * Math.PI) { const f = formeDoree(pts); if (f && !(f === 'lune' && T > 2.5 * Math.PI)) return { kind: 'ferme', poly: pts, forme: f }; }   // une lune fait un seul tour (une spirale, plus)")
open(os.path.join(base, 'logic28.js'), 'w').write(s)
print('logic28.js écrit :', len(s), 'caractères')
