// ===== Le rendu (version 16) : la grande salle vue de haut, Grosbec dans son armure, ses golems, les trois amis de dos =====
// Les golems et Grosbec sont les modèles du combat du Barde (barde/golems.js, barde/grosbec.js) : chaque image est peinte UNE fois
// (« cuite »), puis recopiée. La salle aussi est peinte une seule fois. Rien n'est redessiné à chaque image : ça ne doit jamais ramer.
const TAU = Math.PI * 2;
const TOP = 132;
// vider une réserve d'images : chaque toile est vidée avant d'être jetée (Safari garde longtemps la mémoire d'une toile jetée)
const vider = M => { for (const v of M.values()) if (v && v.c) v.c.width = v.c.height = 0; M.clear(); };   // la place du mur du fond, au-dessus de la place (en unités du jeu)
const R8 = { anim: new Map(), parts: [], motes: [], sc: 0, spr: {}, wallsPrev: [], sage: { x: 0, y: 0, phase: 0, face: 1, spd: 0 }, hurt: {}, t: 0, lampes: [], tirs: [], tir: {}, q: 1, jeu: null };
function view() { const k = Math.min(cv.width / G.W, cv.height / (G.H + TOP)); return { k, ox: (cv.width - G.W * k) / 2, oy: TOP * k + (cv.height - (G.H + TOP) * k) / 2 }; }
