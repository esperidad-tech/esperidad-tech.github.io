/* ==========================================================
   Géométrie de la pièce : un « cœur » de 1200 × 860, agrandi pour remplir l'écran (V.ext, V.vb).
   Le « monde » (toute la pièce) fait V.vb × V.k pixels ; sur un téléphone il est plus grand que l'écran et on le fait glisser (V.pan).
   Chaque objet est posé dans la pièce en 3D (07-perspective.js) et dessiné avec la même perspective.
   Où il est (dans l'état) :
   - par terre : (o.x, o.y) = à l'écran, le milieu du bas de sa face avant ; contre un mur de côté (o.cote) : o.pz = sa profondeur ;
   - au mur du fond : (o.x, o.y) = le milieu du bas de son dos, sur le mur ; sur un mur de côté (o.cote) : o.pz, o.py (profondeur, hauteur) ;
   - posé sur un meuble : o.sur = {o:le meuble, k:la surface, dx}.
   Il reste exactement là où on le lâche (même devant la porte) ; seul changement automatique : contre un mur de côté,
   un meuble se met de profil et une décoration du mur prend la perspective de ce mur.
   ========================================================== */
function extDe(V){ return V.ext || {l:COTE, r:COTE, t:0, b:0}; }
/* le mur du fond s'agrandit seulement quand l'écran est plus large que la pièce et ses deux murs de côté */
function murG(V){ return 70 - Math.max(0, extDe(V).l - COTE); }
function murD(V){ return LARGEUR - 70 + Math.max(0, extDe(V).r - COTE); }
function solMax(V){ return 850 + extDe(V).b; }
function murHaut(V){ return 36 - extDe(V).t; }
function hautMur(V){ return SOL_Y - murHaut(V); }
function zMaxSol(V){ return surSol(VPX, solMax(V)).Z; }
function bordG(V, y){ return xF(murG(V), y); }
function bordD(V, y){ return xF(murD(V), y); }
function solXmin(V, y){ return Math.max(V.vb.x0 + 8, bordG(V, y) + 4); }
function solXmax(V, y){ return Math.min(V.vb.x0 + V.vb.w - 8, bordD(V, y) - 4); }
/* positions en % du monde (toute la pièce) */
function pX(V, x){ return ((x - V.vb.x0) / V.vb.w * 100).toFixed(3) + '%'; }
function pY(V, y){ return ((y - V.vb.y0) / V.vb.h * 100).toFixed(3) + '%'; }
function pW(V, w){ return (w / V.vb.w * 100).toFixed(3) + '%'; }
function pH(V, h){ return (h / V.vb.h * 100).toFixed(3) + '%'; }
var POS_CARTONS = [[400, 846], [900, 846], [250, 846], [1050, 846], [120, 780], [1180, 780], [300, 760], [1000, 760]];

/* ---------- Le repère d'un objet (là où il est dans la pièce) ---------- */
function profDe(c){ return (c.p || 40) / S_REF; }              /* sa profondeur dans le monde */
function largDe(c){ return c.w / S_REF; }
/* un objet posé sur un meuble (ou sur le manteau de la cheminée) : l'endroit de la surface (dans le monde) et le sens du meuble */
function surfaceRepere(V, o, prof){
  var c = catDe(o);
  if(o.sur.o === 'cheminee') return {o:[CHEMINEE.x + o.sur.dx * CHEMINEE.s, CHEMINEE.Y, CHEMINEE.Z + profDe(c) / 2], ax:AXES_FACE};
  var par = V.parId[o.sur.o];
  if(!par || par.sur || par === o) return null;
  var cp = catDe(par), sf = (cp.surf || [])[o.sur.k];
  if(!sf) return null;
  var Rp = repereObjet(V, par, (prof || 0) + 1), zc = sf.z !== undefined ? sf.z : (cp.p || 40) / 2;
  return {o:mondeDe(Rp, cp.w / 2 + o.sur.dx, cp.h + sf.y, Math.max(2, zc - (c.p || 40) / 2)), ax:Rp.ax};
}
function repereObjet(V, o, prof){
  var c = catDe(o), xl = murG(V), xr = murD(V);
  if(o.sur && (prof || 0) < 3){
    var S = surfaceRepere(V, o, prof);
    if(S) return repere(S.o, S.ax, c.w, c.h);
    /* (le meuble dessous n'est pas là : on le dessine par terre ; reajuster le pose pour de bon) */
    var q0 = surSol(o.x || 600, Math.max(o.y || 0, SOL_MIN + 40));
    return repere([q0.X, 0, q0.Z], AXES_FACE, c.w, c.h);
  }
  var pw = profDe(c);
  if(c.z === 'mur'){
    if(o.cote){
      var Z = o.pz !== undefined ? o.pz : 300, Y = o.py !== undefined ? o.py : SOL_Y - (o.y || 300);
      return repere([o.cote === 'g' ? xl + pw : xr - pw, Y, Z], axesDe(o.cote), c.w, c.h);
    }
    return repere([o.x, SOL_Y - o.y, pw], AXES_FACE, c.w, c.h);
  }
  if(o.cote){
    var z2 = o.pz !== undefined ? o.pz : surSol(o.x, o.y).Z;
    return repere([o.cote === 'g' ? xl + pw : xr - pw, 0, z2], axesDe(o.cote), c.w, c.h);
  }
  var q = surSol(o.x, o.y);
  return repere([q.X, 0, q.Z], AXES_FACE, c.w, c.h);
}
/* Où il est dessiné : x, y (l'ancre à l'écran), s (son échelle), z (l'ordre : ce qui est devant passe devant), R (son repère) */
function posObj(V, o, prof){
  var c = catDe(o), R = repereObjet(V, o, prof), z;
  if(o.sur){
    var par = V.parId[o.sur.o], zp = o.sur.o === 'cheminee' ? 400 : (par ? posObj(V, par, (prof || 0) + 1).z : 1000);
    z = zp + 1 + (o.sur.k || 0) * 0.3 + (o.sur.dx + 300) / 3000;
  } else if(c.z === 'mur') z = (o.cote ? 120 + R.o[2] / 20 : 100) + (SOL_Y - R.o[1]) / 100;
  else {
    /* par terre : d'après le point le plus en avant de l'objet */
    var avant = o.cote ? R.o[2] + largDe(c) / 2 : R.o[2];
    z = (c.z === 'tapis' ? 600 : 1000) + proj(VPX, 0, avant)[1] / (c.z === 'tapis' ? 10 : 1);
  }
  return {x:R.A[0], y:R.A[1], s:R.k, z:z, R:R};
}
/* La boîte de l'objet à l'écran (unités du monde) : [x0, y0, x1, y1] (les 8 coins de sa boîte 3D) */
function boite(o, p){
  var c = catDe(o), R = p.R, x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
  if(!R) return [p.x - 40, p.y - 80, p.x + 40, p.y];
  [0, c.w].forEach(function(x){ [0, c.h].forEach(function(y){ [0, c.p || 40].forEach(function(z){
    var W = mondeDe(R, x, y, z), q = proj(W[0], W[1], W[2]);
    if(q[0] < x0) x0 = q[0]; if(q[1] < y0) y0 = q[1]; if(q[0] > x1) x1 = q[0]; if(q[1] > y1) y1 = q[1];
  }); }); });
  return [x0, y0, x1, y1];
}
function inter(a, b){
  var w = Math.min(a[2], b[2]) - Math.max(a[0], b[0]), h = Math.min(a[3], b[3]) - Math.max(a[1], b[1]);
  return w > 0 && h > 0 ? w * h : 0;
}
function enfantsDe(V, o){ return V.etat.objets.filter(function(e){ return e.sur && e.sur.o === o.id; }); }
/* Les deux pièces : 0 l'atelier, 1 la chambre (o.pc = 1 ; un carton de la chambre : k.ch = 1). Une seule est dessinée à la fois. */
function salleDe(o){ return o && o.pc === 1 ? 1 : 0; }
function ici(V, s){ s = s === undefined ? V.salle : s; return V.etat.objets.filter(function(o){ return salleDe(o) === s; }); }
function cartonsIci(V){ return V.etat.cartons.filter(function(k){ return (k.ch ? 1 : 0) === V.salle; }); }
/* Les meubles qui se mettent de profil contre un mur de côté */
function profilable(c){ return !!c.profil || (!!c.cases && c.z !== 'petit'); }

/* ---------- Poser un objet : exactement là où on le lâche ----------
   (ax, ay) : l'ancre lâchée, à l'écran. On ne fait que garder l'objet dans la pièce (entre les murs, sur le mur). */
function poserSol(V, o, ax, ay){
  var c = catDe(o), xl = murG(V), xr = murD(V), q = surSol(ax, Math.max(ay, SOL_Y + 2)), hw = largDe(c) / 2, pw = profDe(c);
  var Z = borne(q.Z, pw, zMaxSol(V)), X = q.X;
  o.sur = null;
  /* contre un mur de côté : de profil (il garde sa profondeur), sans bouger d'ailleurs */
  if(profilable(c) && c.z !== 'tapis' && (X - hw < xl + 28 || X + hw > xr - 28)){
    o.cote = X - hw < xl + 28 ? 'g' : 'd';
    o.pz = borne(Z, hw + 2, zMaxSol(V));
    var A = proj(o.cote === 'g' ? xl + pw : xr - pw, 0, o.pz);
    o.x = A[0]; o.y = A[1];
    return;
  }
  o.cote = 0; delete o.pz;
  X = borne(X, xl + hw * 0.9, xr - hw * 0.9);
  /* il reste dans ce qu'on voit du monde */
  var s = sZ(Z), A2 = proj(X, 0, Z), lim = c.w * s / S_REF / 2;
  A2[0] = borne(A2[0], V.vb.x0 + lim * 0.6, V.vb.x0 + V.vb.w - lim * 0.6);
  o.x = Math.round(A2[0] * 10) / 10; o.y = Math.round(A2[1] * 10) / 10;
}
function poserMur(V, o, ax, ay){
  var c = catDe(o), xl = murG(V), xr = murD(V), H = hautMur(V), pw = profDe(c), hw = largDe(c) / 2, hh = c.h / S_REF;
  var s0 = sZ(pw), X = VPX + (ax - VPX) / s0, Y = SOL_Y - VPY - (ay - VPY) / s0;
  o.sur = null;
  /* (à l'écran, le mur du fond va de xl à xr ; ce qui est à gauche est sur le mur de gauche. Un objet déjà sur un mur de côté y reste
     tant qu'on ne l'amène pas franchement sur le mur du fond.) */
  var gauche = ax < xl + (o.cote === 'g' ? 70 : 0), droite = ax > xr - (o.cote === 'd' ? 70 : 0);
  if(gauche || droite){
    /* sur un mur de côté : il prend la perspective de ce mur (il reste où on l'a mis) */
    o.cote = gauche ? 'g' : 'd';
    var m = surCote(ax, ay, o.cote === 'g' ? xl + pw : xr - pw);
    o.pz = Math.round(borne(m.Z, hw + 4, zMaxSol(V) - hw)); o.py = Math.round(borne(m.Y, 0, H - hh));
    var A = proj(o.cote === 'g' ? xl + pw : xr - pw, o.py, o.pz);
    o.x = A[0]; o.y = A[1];
    return;
  }
  o.cote = 0; delete o.pz; delete o.py;
  o.x = Math.round(borne(X, xl + hw, xr - hw) * 10) / 10;
  o.y = Math.round((SOL_Y - borne(Y, 0, H - hh)) * 10) / 10;
}
/* Le dessus d'un meuble sous l'endroit visé (pour y poser un petit objet) */
function surfaceSous(V, o, x, y){
  var best = null, c = catDe(o);
  function essai(oid, k, R, sf, pc){
    var cx = ctx3d(R, true), zc = sf.z !== undefined ? sf.z : (pc.p || 40) / 2;
    var g = cx.Q(pc.w / 2 + sf.x0, pc.h + sf.y, zc), d = cx.Q(pc.w / 2 + sf.x1, pc.h + sf.y, zc);
    var dy = y - (g[1] + d[1]) / 2, x0 = Math.min(g[0], d[0]), x1 = Math.max(g[0], d[0]);
    if(x < x0 - 12 || x > x1 + 12 || dy < -64 || dy > 40) return;
    if(!best || Math.abs(dy) < Math.abs(best.dy)){
      var t = Math.abs(d[0] - g[0]) > 1 ? (x - g[0]) / (d[0] - g[0]) : 0.5;
      best = {oid:oid, k:k, dx:sf.x0 + borne(t, 0, 1) * (sf.x1 - sf.x0), x0:sf.x0, x1:sf.x1, dy:dy};
    }
  }
  var Rc = repere([CHEMINEE.x, CHEMINEE.Y, CHEMINEE.Z], AXES_FACE, 0, 0);
  if(!V.salle) essai('cheminee', 0, Rc, {x0:CHEMINEE.x0 * CHEMINEE.s * S_REF, x1:CHEMINEE.x1 * CHEMINEE.s * S_REF, y:0, z:0}, {w:0, h:0, p:0});
  V.etat.objets.forEach(function(p){
    if(p === o || p.sur || salleDe(p) !== V.salle) return;
    var cp = catDe(p);
    if(!cp.surf) return;
    var R = repereObjet(V, p);
    cp.surf.forEach(function(sf, k){ essai(p.id, k, R, sf, cp); });
  });
  if(best){
    var demi = c.w * 0.3, a = best.x0 + demi, b = best.x1 - demi;
    best.dx = a <= b ? borne(best.dx, a, b) : (best.x0 + best.x1) / 2;
    if(best.oid === 'cheminee') best.dx = best.dx / (CHEMINEE.s * S_REF);
    best.dx = Math.round(best.dx / 5) * 5;
  }
  return best;
}
/* Pose un objet à l'endroit lâché : sur un meuble (un petit objet), sur un mur, ou par terre */
function resoudre(V, o, x, y){
  var c = catDe(o);
  if(c.z === 'petit'){
    var sf = surfaceSous(V, o, x, y);
    if(sf){ o.sur = {o:sf.oid, k:sf.k, dx:sf.dx}; o.cote = 0; delete o.pz; delete o.py; return; }
  }
  if(c.z === 'mur') poserMur(V, o, x, y);
  else poserSol(V, o, x, y);
}
/* La place qu'un objet prend (pour la première place des nouveaux) : des rectangles sur le plancher (X, Z), le mur du fond (X, Y)
   ou un mur de côté (Z, Y), dans le monde. Un meuble par terre contre un mur prend aussi un peu de ce mur. */
function empreintes(V, o){
  var c = catDe(o);
  if(o.sur || o.t === 'chat') return [];
  var R = repereObjet(V, o), X0 = 1e9, X1 = -1e9, Y0 = 1e9, Y1 = -1e9, Z0 = 1e9, Z1 = -1e9;
  [0, c.w].forEach(function(x){ [0, c.h].forEach(function(y){ [0, c.p || 40].forEach(function(z){
    var W = mondeDe(R, x, y, z);
    X0 = Math.min(X0, W[0]); X1 = Math.max(X1, W[0]); Y0 = Math.min(Y0, W[1]); Y1 = Math.max(Y1, W[1]); Z0 = Math.min(Z0, W[2]); Z1 = Math.max(Z1, W[2]);
  }); }); });
  if(c.z === 'tapis') return [{p:'tapis', r:[X0, Z0, X1, Z1]}];
  if(c.z === 'mur') return [o.cote ? {p:o.cote, r:[Z0, Y0, Z1, Y1]} : {p:'fond', r:[X0, Y0, X1, Y1]}];
  var l = [{p:'sol', r:[X0, Z0, X1, Z1]}];
  if(o.cote) l.push({p:o.cote, r:[Z0, 0, Z1, Y1]});
  else if(Z0 < 50) l.push({p:'fond', r:[X0, 0, X1, Y1]});
  return l;
}
/* Trouve une place libre pour un objet qui arrive (sorti d'un carton, ou venu d'une ancienne sauvegarde).
   Ce n'est qu'une première place : ensuite, l'objet reste où l'enfant le met. Les rangements vont de préférence contre les murs de côté.
   Renvoie false s'il n'y a plus vraiment de place (l'objet se chevaucherait trop avec un autre). */
function trouverPlace(V, o){
  var c = catDe(o), best = null, mur = c.z === 'mur', rang = profilable(c);
  if(c.z === 'petit' && SUR_MEUBLE[o.t] !== 0 && o.t !== 'chat' && o.t !== 'plante' && surSurface(V, o)) return true;
  var sa = salleDe(o);
  /* les rideaux : devant la fenêtre de la pièce */
  if(c.fenetre){ o.cote = 0; o.sur = null; delete o.pz; delete o.py; o.x = 450 + (sa ? FEN_CH : FEN_DX); o.y = 316; garderDansPiece(V, o); return true; }
  /* la place que prennent les autres : sur le plancher, sur le mur du fond, sur un mur de côté (dans le monde, pas à l'écran) */
  var autres = [], ecrans = [], chatsB = [];
  V.etat.objets.forEach(function(p){
    if(p.t === 'chat' && p !== o && salleDe(p) === sa && !p.sur && !c.plat) chatsB.push(boite(p, posObj(V, p)));     /* (on ne cache pas le chat) */
    if(p === o || p.t === 'chat' || salleDe(p) !== sa) return;
    autres = autres.concat(empreintes(V, p));
    var cp = catDe(p);
    if(!p.sur && cp.z !== 'tapis') ecrans.push({b:boite(p, posObj(V, p)), mur:cp.z === 'mur'});
  });
  /* (pour une première place seulement : pas devant la fenêtre, la porte, la cheminée, ni sur la cueillette) */
  var arche = zoneArche(V, sa);
  var gene = sa ? (mur ? [[362 + FEN_CH, 56, 538 + FEN_CH, 320], arche] : [arche]) :
    (mur ? [[362, 56, 538, 320], [540, 70, 760, 524], [786, 20, 1114, 524], arche] : [[TAS.x - 210, SOL_Y + 10, TAS.x + 210, TAS.y + FLACONS.dy + TAS.dy + 16], arche]);
  if(!mur && c.h > 150){ var ch = V.parId.ch; if(ch && ch !== o && salleDe(ch) === sa){ var pc = posObj(V, ch); gene.push([pc.x - 170, pc.y - 200, pc.x + 170, 1e4]); } }
  var essai = {t:o.t, st:o.st, v:o.v, cases:o.cases, f:0, cote:0}, pref = mur ? [640, 240] : [700, 790], libre = null;
  function noter(){
    var pe = posObj(V, essai), bb = boite(essai, pe), em = empreintes(V, essai), aire = 1, recouvre = 0, g = 0;
    if(bb[0] < V.vb.x0 || bb[2] > V.vb.x0 + V.vb.w) return;
    em.forEach(function(e){ aire += (e.r[2] - e.r[0]) * (e.r[3] - e.r[1]); autres.forEach(function(a){ if(a.p === e.p) recouvre += inter(e.r, a.r); }); });
    gene.forEach(function(Z){ g += inter(bb, Z); });
    /* (et, un peu, ce qu'il cacherait ou qui le cacherait à l'écran) */
    var cache = 0, derriere = 0, ab = Math.max(1, (bb[2] - bb[0]) * (bb[3] - bb[1]));
    if(c.z !== 'tapis') ecrans.forEach(function(a){ if(a.mur === mur){ var i = inter(bb, a.b); cache += i; if(!mur && a.b[3] > bb[3] + 4) derriere += i; } });
    /* caché derrière un meuble plus en avant (le chaudron…) : on ne le verrait plus, on le choisit seulement s'il n'y a rien d'autre */
    derriere = Math.min(1, derriere / ab);
    var devant = 0;
    if(!mur && c.z !== 'tapis') chatsB.forEach(function(b){ if(b[3] < bb[3] + 4) devant += inter(bb, b) / Math.max(1, (b[2] - b[0]) * (b[3] - b[1])); });
    var sc = Math.hypot(pe.x - pref[0], (pe.y - pref[1]) * 1.4) * 0.3 + recouvre * 0.12 + cache * 0.035 + g * 0.3 + (essai.cote ? (rang ? -300 : 400) : 0);
    var cand = {s:sc, x:essai.x, y:essai.y, cote:essai.cote || 0, pz:essai.pz, py:essai.py, part:recouvre / aire};
    if(!best || sc < best.s) best = cand;
    /* parmi les places libres : de préférence une où il n'est pas caché derrière un meuble plus en avant, et où il ne cache pas le chat
       (cela ne change jamais le choix « dans la pièce ou dans le carton 📦 ») */
    var sc2 = sc + (derriere > 0.3 ? derriere * 3000 : 0) + (devant > 0.3 ? devant * 2000 : 0);
    if(cand.part < 0.25 && (!libre || sc2 < libre.s2)){ libre = cand; libre.s2 = sc2; }
  }
  var xl = murG(V), xr = murD(V);
  if(mur){
    for(var x = xl + 60; x <= xr - 60; x += 20) for(var y = Math.max(160, murHaut(V) + 120); y <= 500; y += 20){ essai.cote = 0; essai.x = x; essai.y = y; delete essai.pz; delete essai.py; noter(); }
    if(rang) ['g', 'd'].forEach(function(cote){ for(var z = 80; z < Math.min(700, zMaxSol(V)); z += 30) for(var yy = 120; yy < hautMur(V) - c.h / S_REF; yy += 30){ essai.cote = cote; essai.pz = z; essai.py = yy; noter(); } });
  } else {
    for(var xs = V.vb.x0 + 40; xs <= V.vb.x0 + V.vb.w - 40; xs += 24) for(var ys = SOL_MIN + 20; ys <= solMax(V); ys += 16){
      poserSol(V, essai, xs, ys);
      if(essai.cote && !rang) continue;
      if(!essai.cote && (Math.abs(essai.x - xs) > 12 || Math.abs(essai.y - ys) > 12)) continue;
      noter();
    }
  }
  if(best && best.part < 0.25 && libre) best = libre;
  if(best){
    o.x = best.x; o.y = best.y; o.cote = best.cote; o.sur = null;
    if(best.pz !== undefined) o.pz = best.pz; else delete o.pz;
    if(best.py !== undefined) o.py = best.py; else delete o.py;
    garderDansPiece(V, o);       /* (sa place à l'écran, d'après sa place sur le mur) */
    return best.part < 0.25;
  }
  if(mur) poserMur(V, o, 640, 220); else poserSol(V, o, 450, 780);
  return false;
}
var SUR_MEUBLE = {chat:0, plante:0, gamelle:0, eau:0, distributeur:0};   /* (les gamelles du chat : par terre)*/
/* Un petit objet (bocaux, lampe, vase…) qui sort d'un carton : sur une étagère, une table ou une commode, s'il y a de la place */
function surSurface(V, o){
  var c = catDe(o), w = c.w * 0.66, best = null;
  V.etat.objets.forEach(function(p){
    if(p === o || p.sur || salleDe(p) !== salleDe(o)) return;
    var cp = catDe(p);
    if(!cp.surf || cp.special === 'grimoire' || p.t === 'chat') return;
    cp.surf.forEach(function(sf, k){
      var pris = V.etat.objets.filter(function(x){ return x.sur && x.sur.o === p.id && x.sur.k === k; }).map(function(x){ var cx = catDe(x).w * 0.66; return [x.sur.dx - cx / 2, x.sur.dx + cx / 2]; });
      for(var dx = sf.x0 + w / 2; dx <= sf.x1 - w / 2 + 0.1; dx += 10){
        if(pris.some(function(q){ return dx + w / 2 > q[0] && dx - w / 2 < q[1]; })) continue;
        var sc = Math.abs(dx) * 0.2 + (o.t === 'bocaux' && p.t === 'etagere' ? -500 - k * 50 : 0) + (o.t !== 'bocaux' && p.t === 'etagere' ? 90 : 0) + (cp.z === 'mur' ? 0 : 40) + (p.cote ? 60 : 0);
        if(!best || sc < best.s) best = {s:sc, o:p.id, k:k, dx:Math.round(dx / 5) * 5};
      }
    });
  });
  if(!best) return false;
  o.sur = {o:best.o, k:best.k, dx:best.dx}; o.cote = 0;
  return true;
}

/* ==========================================================
   La vue
   ========================================================== */
function son(V, t){ try{ if(V.o.son) V.o.son(t); else if(util()) util().son(t); }catch(e){} }
function lire(V, t){ try{ if(V.o.lire) V.o.lire(t); else if(util()) util().lire(t); }catch(e){} }
function vibrer(ms){ try{ if(navigator.vibrate) navigator.vibrate(ms || 30); }catch(e){} }
function changer(V){ try{ if(V.o.onChange) V.o.onChange(V.etat); }catch(e){ console.error(e); } }
function apres(V, ms, fn){ var t = setTimeout(function(){ V.timers = V.timers.filter(function(x){ return x !== t; }); if(!V.arrete) fn(); }, ms); V.timers.push(t); return t; }
function ecoute(V, cible, type, fn, opt){ cible.addEventListener(type, fn, opt); V.nettoie.push(function(){ cible.removeEventListener(type, fn, opt); }); }
function q(V, sel){ return V.root.querySelector(sel); }
var MOINS_MOUV = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
function anim(el, kf, o){ try{ if(MOINS_MOUV && o){ o.duration = Math.min(o.duration || 0, 60); o.iterations = 1; o.delay = 0; } return el.animate(kf, o); }catch(e){ return null; } }

function recettesDe(V){
  var D = DD();
  if(Array.isArray(V.o.recettes) && V.o.recettes.length) return V.o.recettes;
  return cles(D.RECETTES || {}).map(function(id){
    var p = (D.POTIONS || {})[id] || {};
    return {id:id, nom:p.nom || id, ic:p.ic || '🧪', c:p.c || '#8ff3ff', connue:!D.RECETTES[id].secrete};
  });
}
function aObjet(V, id){ return (V.o.objets || []).indexOf(id) >= 0; }

function creerObjet(V, t){
  var c = catDe({t:t}), n = V.etat.objets.filter(function(o){ return o.t === t; }).length;
  V.etat.n++;
  var o = {id:'o' + V.etat.n, t:t, x:600, y:700, f:0, v:n % 3, st:0, sur:null, neuf:1};
  if(c.cases) o.cases = c.cases.map(function(){ return {e:[], i:{}}; });
  if(t === 'lampe') o.on = 1;
  return o;
}
/* Les objets achetés à la boutique arrivent dans un colis doré */
function verifierBoutique(V){
  var objs = (V.o.objets || []).filter(function(id){ return !PORTES[id] && BOUTIQUE_DESSIN[id] && V.etat.boutique.indexOf(id) < 0; });
  var colis = V.etat.cartons.filter(function(k){ return k.t === 'colis'; })[0];
  var manque = objs.filter(function(id){ return !colis || colis.reste.indexOf(id) < 0; });
  if(!manque.length) return false;
  if(!colis){ V.etat.n++; colis = {id:'k' + V.etat.n, t:'colis', reste:[], ouvert:0}; V.etat.cartons.push(colis); }
  colis.reste = colis.reste.concat(manque);
  return true;
}
/* Au montage : rien ne bouge (l'enfant met les objets où il veut ; on ne les remet jamais dans une « zone ») ;
   on garde seulement chaque objet dans la pièce (l'écran a peut-être changé de taille). Ce qui vient d'une ancienne sauvegarde (o.placer) trouve une place. */
function garderDansPiece(V, o){
  var c = catDe(o), xl = murG(V), xr = murD(V), hw = largDe(c) / 2, pw = profDe(c);
  if(c.z === 'mur'){
    if(o.cote){
      /* (une sauvegarde d'avant la perspective : sa place à l'écran devient une place sur le mur de côté) */
      if(o.pz === undefined || o.py === undefined){ var m = surCote(o.x || 0, o.y || 300, o.cote === 'g' ? xl + pw : xr - pw); o.pz = m.Z; o.py = m.Y; }
      o.pz = Math.round(borne(o.pz, hw + 4, zMaxSol(V)));
      o.py = Math.round(borne(o.py, 0, hautMur(V) - c.h / S_REF));
      var A = proj(o.cote === 'g' ? xl + pw : xr - pw, o.py, o.pz);
      o.x = A[0]; o.y = A[1];
    } else {
      var nx = borne(o.x, xl + hw, xr - hw), Y = SOL_Y - o.y, nY = borne(Y, 0, hautMur(V) - c.h / S_REF);
      if(Math.abs(nx - o.x) > 0.05) o.x = Math.round(nx * 10) / 10;
      if(Math.abs(nY - Y) > 0.05) o.y = Math.round((SOL_Y - nY) * 10) / 10;
    }
    return;
  }
  if(o.cote && !profilable(c)){ o.cote = 0; delete o.pz; }
  if(o.cote){
    o.pz = borne(o.pz !== undefined ? o.pz : surSol(o.x, Math.max(o.y, SOL_Y + 2)).Z, hw + 2, zMaxSol(V));
    var A3 = proj(o.cote === 'g' ? xl + pw : xr - pw, 0, o.pz);
    o.x = A3[0]; o.y = A3[1];
    return;
  }
  var q = surSol(o.x, Math.max(o.y, SOL_Y + 2)), X = borne(q.X, xl + hw * 0.9, xr - hw * 0.9), Z = borne(q.Z, pw, zMaxSol(V));
  if(Math.abs(X - q.X) > 0.5 || Math.abs(Z - q.Z) > 0.5 || !(o.y >= SOL_Y + 2)){ var A2 = proj(X, 0, Z); o.x = Math.round(A2[0] * 10) / 10; o.y = Math.round(A2[1] * 10) / 10; }
}
function reajuster(V){
  var bouge = false, aPlacer = [];
  V.etat.objets.forEach(function(o){
    if(o.placer){ aPlacer.push(o); return; }
    /* posé sur un meuble qui n'existe plus (ou qui est lui-même posé sur quelque chose) : il trouve une autre place */
    if(o.sur && o.sur.o !== 'cheminee'){
      var par = V.parId[o.sur.o], cp = par && catDe(par);
      if(!par || par.sur || par === o || !cp.surf || !cp.surf[o.sur.k]){ o.sur = null; aPlacer.push(o); return; }
    }
    if(o.sur || o.t === 'chat') return;
    var av = JSON.stringify([o.x, o.y, o.cote, o.pz, o.py]);
    garderDansPiece(V, o);
    if(JSON.stringify([o.x, o.y, o.cote, o.pz, o.py]) !== av) bouge = true;
  });
  aPlacer.forEach(function(o){ delete o.placer; trouverPlace(V, o); bouge = true; });
  return bouge;
}

var MOMENTS = {matin:1, apresmidi:1, soir:1, nuit:1};
var K_LISIBLE = 0.62;          /* sur un téléphone, la pièce n'est jamais plus petite que ça : tout reste lisible, on la fait glisser */
var PAN_DEPART = {x:590, y:560};
var PAN_MEMO = null;           /* la vue est remontée à chaque rendu du moteur : on garde l'endroit regardé */
var SALLE_MEMO = 0;            /* … et la pièce où l'on était (l'atelier ou la chambre) */
var POTS_MEMO = null;          /* … et les potions déjà vues : une potion de plus fait briller son flacon, même après un remontage */
function potionsNeuves(V){
  var P = V.o.potions || {}, avant = POTS_MEMO, neuves = [];
  POTS_MEMO = {};
  cles(P).forEach(function(k){ POTS_MEMO[k] = P[k] || 0; if(avant && (P[k] || 0) > (avant[k] || 0)) neuves.push(k); });
  return neuves;
}
function vue(el, opts){
  opts = opts || {};
  var D = DD();
  INGR = opts.ingr || D.INGR || {};
  var V = {
    el:el, o:opts, uid:++uidVue, etat:normaliser(opts.etat || etatNeuf()),
    mode:'ranger', k:0.5, timers:[], nettoie:[], suivis:[], arrete:false, sel:null, chats:{},
    parId:{}, elO:{}, elK:{}, ouvert:null, mjPartie:null, mjEl:null, grimSel:null, attente:null,
    ext:{l:COTE, r:COTE, t:0, b:0}, vb:{x0:-COTE, y0:0, w:LARGEUR + 2 * COTE, h:860}, pan:{x:0, y:0}, salle:SALLE_MEMO
  };
  if(opts.etat && opts.etat !== V.etat) opts.etat = V.etat;
  /* Le conteneur a-t-il une vraie hauteur ? (le moteur la donne : sous le bandeau, au-dessus des onglets) */
  var hAvant = el.clientHeight;
  V.auto = !(hAvant >= 200);
  var root = V.root = document.createElement('div');
  root.className = 'at';
  root.innerHTML = svgDefs() +
    '<div class="at-piece"><div class="at-monde"><div class="at-fond-box"></div><div class="at-scene"></div><div class="at-halos"></div><div class="at-calque"></div></div>' +
      '<div class="at-lumiere"></div><div class="at-bords"><i class="g"></i><i class="d"></i><i class="h"></i><i class="b"></i></div>' +
      '<div class="at-reperes"></div><div class="at-tient" hidden></div>' +
      '<button type="button" class="at-coin" data-at="reserve" aria-label="Le carton de rangement"><span class="at-coin-ic" aria-hidden="true">📦</span><b class="at-badge" style="display:none"></b></button>' +
      '<button type="button" class="at-salle" data-at="salle" aria-label="L\'autre pièce"><span class="at-salle-ic" aria-hidden="true"></span><b class="at-badge" style="display:none"></b></button></div>' +
    '<div class="at-ouvert" hidden></div><div class="at-grim" hidden></div><div class="at-toast" hidden></div><div class="at-fantomes"></div>';
  el.appendChild(root);
  V.piece = q(V, '.at-piece'); V.monde = q(V, '.at-monde'); V.scene = q(V, '.at-scene'); V.calque = q(V, '.at-calque'); V.ouvertEl = q(V, '.at-ouvert');
  V.grim = q(V, '.at-grim'); V.toastEl = q(V, '.at-toast'); V.fantomes = q(V, '.at-fantomes'); V.tientEl = q(V, '.at-tient'); V.reperes = q(V, '.at-reperes');
  V.fondEl = q(V, '.at-fond-box'); V.halos = q(V, '.at-halos'); V.elReserve = q(V, '.at-coin'); V.elSalle = q(V, '.at-salle');
  majMoment(V);

  if(verifierBoutique(V)) changer(V);
  mise(V, true);
  V.etat.objets.forEach(function(o){ V.parId[o.id] = o; });
  if(reajuster(V)) changer(V);
  dessinerPiece(V);
  var nv = potionsNeuves(V);
  if(nv.length) brillerFlacons(V, nv);
  brancher(V);
  if(window.ResizeObserver){
    var ro = new ResizeObserver(function(){ mise(V); });
    ro.observe(root);
    V.nettoie.push(function(){ ro.disconnect(); });
  }
  if(V.auto || !window.ResizeObserver) ecoute(V, window, 'resize', function(){ mise(V); });
  chatsDemarrer(V);
  tamaMoment(V);
  tamaDemarrer(V);
  /* le guidage du tutoriel (49-guide.js) : il reprend sur la vue remontée */
  VUES.push(V);
  if(GUIDE) apres(V, 60, function(){ guideAppliquer(V, true); });
  /* étape 4 : un ingrédient qu'il rapportait quand l'atelier s'est fermé arrive tout de suite ; les cadeaux gagnés aux mini-jeux sont annoncés */
  if(tama(V).butin) apres(V, 1200, function(){ livrerButin(V, chatsTous(V)[0] || null); });
  annoncerAcc(V);

  return {
    arreter:function(){ arreter(V); },
    maj:function(o2){ maj(V, o2); },
    etat:function(){ return V.etat; },
    /* pour les bancs d'essai */
    _vb:function(){ return {x0:V.vb.x0, y0:V.vb.y0, w:V.vb.w, h:V.vb.h, k:V.k, pan:{x:V.pan.x, y:V.pan.y}}; },
    _voir:function(x, y){ centrerSur(V, x, y); },
    _chat:function(id){ var o = chatsDe(V)[0]; var st = o && V.chats[id || o.id]; return st ? {pose:st.pose, dort:st.pose === 'dort', reste:st.dortJusqua ? Math.max(0, st.dortJusqua - Date.now()) : 0, pos:st.pos, tenu:!!st.tenu, chasse:!!st.chasse, depart:!!st.depart, anim:!!st.anim, mv:st.mv ? st.mv.mode || 1 : 0, mode:V.mode} : null; },
    _sel:function(){ return V.sel; },
    _pos:function(id){ var o = V.parId[id]; if(!o) return null; var p = o.t === 'chat' ? chatPos(V, o) : posObj(V, o), c = catDe(o), F = cadreEl(V.elO[id]); return {x:p.x, y:p.y, s:p.s, w:c.w, h:c.h, cote:o.cote || 0, cadre:F}; },
    _salle:function(){ return V.salle; },
    _allerSalle:function(s){ changerSalle(V, s); },
    /* le chat (étape 3) : faire passer du temps de jeu (en secondes), une bêtise tout de suite */
    _tama:function(sec){ tamaTic(V, sec || TIC); return JSON.parse(JSON.stringify(V.etat.tama)); },
    _betise:function(){ V.etat.tama.betise = -1e9; return peutEtreBetise(V); },
    _agir:function(id){ var o = V.parId[id]; if(!o) return false; var st = chatEtat(V, o); if(st.anim || st.tenu) return false; if(st.t){ clearTimeout(st.t); st.t = null; } st.dortJusqua = 0; chatPose(V, o, 'assis'); st.reveil = false; chatAgir(V, o); return true; },
    _humeur:function(){ majHumeurs(V); },
    _bonheur:function(id){ var o = V.parId[id]; return o ? bonheur(o) : null; },
    _sortie:function(id){ var o = V.parId[id]; return o ? sortieChat(V, o, true) : false; },
    _peutSortir:function(id){ var o = V.parId[id]; return o ? peutSortir(V, o) : false; },
    _souris:function(){ return sourisPasse(V, true); },
    _jouer:function(id, quoi){ var o = V.parId[id]; return o ? chatJoue(V, o, quoi) : null; },
    _garde:function(id){ ouvrirGarde(V, id); },
    _dehors:function(id){ var o = V.parId[id]; if(!o) return false; var st = chatEtat(V, o); st.pos = chatSolVisible(V); placerEl(V, o); var d = V.elO[id]; if(d) d.style.zIndex = Math.round(chatPos(V, o).z * 5); return st.pos; },
    _reveil:function(id){ var o = V.parId[id]; if(!o) return false; var st = chatEtat(V, o); if(st.anim){ var a = st.anim; st.anim = null; try{ a.cancel(); }catch(e){} } if(st.t){ clearTimeout(st.t); st.t = null; } st.dortJusqua = 0; placerEl(V, o); chatPose(V, o, 'assis'); chatPlanifier(V, o, 20000); return true; },
    _bulle:function(id){ var d = V.elO[id], b = d && d.querySelector('.at-bulle'); return b && !b.hidden ? b.getAttribute('data-bulle') : null; },
    _guide:function(){ return guideElements(V).map(function(e){ return e.getAttribute('data-obj') || e.getAttribute('data-tas') || e.getAttribute('data-carton') || e.getAttribute('data-pot') || e.className; }); },
    _flacons:function(){ return (V.elFl || []).map(function(d){ return {k:d._k, n:d._n, cadre:cadreEl(d), neuf:d.classList.contains('at-nouveau')}; }); }
  };
}

function arreter(V){
  if(V.arrete) return;
  V.arrete = true;
  VUES = VUES.filter(function(W){ return W !== V; });
  if(V.mjPartie){ try{ V.mjPartie.arreter(); }catch(e){} V.mjPartie = null; }
  V.suivis.slice().forEach(function(f){ f(); });
  V.timers.forEach(clearTimeout); V.timers = [];
  if(V.defile){ clearInterval(V.defile); V.defile = null; }
  V.nettoie.forEach(function(f){ try{ f(); }catch(e){} }); V.nettoie = [];
  try{ V.root.getAnimations({subtree:true}).forEach(function(a){ a.cancel(); }); }catch(e){}
  if(V.root.parentNode) V.root.parentNode.removeChild(V.root);
  if(V.attente){ var a = V.attente, cb = V.o.potionFinie; V.attente = null; setTimeout(function(){ try{ if(cb) cb(a.id, a.reussi, a.detail); }catch(e){ console.error(e); } }, 0); }
}

/* Mise à jour quand le moteur a changé l'état ou les options (ingrédients cueillis, cartons offerts, boutique, moment…) */
function maj(V, o2){
  if(V.arrete) return;
  if(o2) cles(o2).forEach(function(k){ V.o[k] = o2[k]; });
  if(V.o.etat && V.o.etat !== V.etat) V.etat = V.o.etat;
  normaliser(V.etat);
  INGR = V.o.ingr || DD().INGR || INGR;
  majMoment(V);
  tamaMoment(V);
  var avantK = cles(V.elK);
  if(verifierBoutique(V)) changer(V);
  if(V.mode === 'prep') return;
  if(V.sel && !(V.etat.panier[V.sel] > 0)) V.sel = null;
  mise(V);
  dessinerPiece(V, avantK);
  var nv = potionsNeuves(V);
  if(nv.length) brillerFlacons(V, nv);
  if(V.ouvert) dessinerOuvert(V);
}

/* ---------- La lumière du moment (matin, après-midi, soir, nuit) et les lampes ---------- */
function majMoment(V){
  var m = MOMENTS[V.o.moment] ? V.o.moment : 'matin';
  if(V.moment === m) return;
  if(V.moment) V.root.classList.remove('at-l-' + V.moment);
  V.moment = m;
  V.root.classList.add('at-l-' + m);
  majLumiere(V);
}
function majLumiere(V){
  if(!V.halos) return;
  var tous = ici(V), lampes = tous.filter(function(o){ return o.t === 'lampe' && o.on !== 0; }), chevets = tous.filter(function(o){ return o.t === 'lampe_chevet'; });
  V.root.style.setProperty('--lampes', Math.min(3, lampes.length));
  V.root.classList.toggle('at-lampe-on', lampes.length > 0);
  if(!V.vb) return;
  /* des halos chauds autour des lampes allumées, des bougies et des chandelles fixes (on les voit surtout le soir et la nuit) */
  var h = '';
  function halo(x, y, r, cls){ h += '<i class="at-h ' + (cls || '') + '" style="left:' + pX(V, x) + ';top:' + pY(V, y) + ';width:' + pW(V, r * 2) + ';height:' + pH(V, r * 2) + '"></i>'; }
  lampes.forEach(function(o){ var p = posObj(V, o), c = catDe(o); halo(p.x, p.y - c.h * p.s * 0.62, 230 * p.s, 'lampe'); });
  chevets.forEach(function(o){ var p = posObj(V, o); halo(p.x, p.y - 60 * p.s, 170 * p.s, 'lampe'); });
  tous.filter(function(o){ return o.t === 'bougies'; }).forEach(function(o){ var p = posObj(V, o); halo(p.x, p.y - 60 * p.s, 120 * p.s, 'bougie'); });
  tous.filter(function(o){ return o.t === 'lanterne' || o.t === 'guirlande'; }).forEach(function(o){ var p = posObj(V, o), c = catDe(o); halo(p.x, p.y - c.h * p.s * 0.45, (o.t === 'lanterne' ? 130 : 150) * p.s, 'bougie'); });
  if(!V.salle){ halo(816, 246, 80, 'bougie'); halo(750 + CHEM_DX, 470, 210, 'foyer'); }
  V.halos.innerHTML = h;
}

/* ---------- Mise en page : la pièce prend tout l'écran ----------
   k = pixels par unité. Sur un grand écran toute la pièce tient (on l'agrandit pour remplir) ;
   sur un téléphone, k ne descend pas sous K_LISIBLE : la pièce est plus grande que l'écran et on la fait glisser. */
function mise(V, premier){
  if(V.arrete) return;
  var r = V.root;
  if(V.auto){
    var top = V.el.getBoundingClientRect().top + (window.scrollY || 0);
    var hh = Math.round(Math.max(320, window.innerHeight - top));
    if(r.style.height !== hh + 'px') r.style.height = hh + 'px';
  }
  var w = V.piece.clientWidth, h = V.piece.clientHeight;
  if(!w || !h) return;
  r.classList.toggle('at-paysage', w > h * 1.05 && w >= 600);
  r.classList.toggle('at-petit', Math.min(w, h) < 500);
  var LV = LARGEUR + 2 * COTE;      /* la pièce et ses deux murs de côté */
  var kFit = Math.min(w / LV, h / 860), kMax = Math.max(w / LV, h / 860);
  var k = Math.max(kFit, Math.min(K_LISIBLE, kMax));
  /* pas trop de plancher ou de mur en plus : au-delà, on agrandit et on fait glisser */
  if(h / k > 860 * 1.45) k = h / (860 * 1.45);
  if(w / k > LV * 1.5) k = w / (LV * 1.5);
  /* on fait déjà glisser de côté (téléphone en hauteur) : autant remplir la hauteur, tout est plus gros */
  if(w / k < LV - 1) k = Math.max(k, Math.min(1.05, h / (860 * 1.1)));
  var vw = w / k, vh = h / k, ext = {l:COTE, r:COTE, t:0, b:0};
  if(vw > LV){ ext.l = ext.r = (vw - LARGEUR) / 2; }
  if(vh > 860){ var Y = vh - 860, t = Math.min(Y * 0.3, 300); ext.t = t; ext.b = Y - t; }
  var cle = [w, h, k.toFixed(4)].join(',');
  if(cle === V.miseCle) return;
  var centre = V.miseCle ? centreVue(V) : (PAN_MEMO || PAN_DEPART);
  V.miseCle = cle;
  V.ext = ext;
  V.vb = {x0:-ext.l, y0:-ext.t, w:LARGEUR + ext.l + ext.r, h:860 + ext.t + ext.b};
  V.k = k; V.vw = w; V.vh = h;
  V.mondeW = V.vb.w * k; V.mondeH = V.vb.h * k;
  V.monde.style.width = V.mondeW.toFixed(1) + 'px';
  V.monde.style.height = V.mondeH.toFixed(1) + 'px';
  r.style.setProperty('--k', k.toFixed(4));
  V.fondEl.innerHTML = svgFond(V) + fondAnime(V);
  if(!premier) replacer(V);
  centrerSur(V, centre.x, centre.y, true);
}
/* ---------- Faire glisser la pièce (téléphone) ---------- */
function centreVue(V){ return {x:V.vb.x0 + (V.pan.x + V.vw / 2) / V.k, y:V.vb.y0 + (V.pan.y + V.vh / 2) / V.k}; }
function centrerSur(V, x, y, net){ panA(V, (x - V.vb.x0) * V.k - V.vw / 2, (y - V.vb.y0) * V.k - V.vh / 2, net); }
function panA(V, x, y, net){
  var mx = Math.max(0, V.mondeW - V.vw), my = Math.max(0, V.mondeH - V.vh);
  x = mx > 0 ? borne(x, 0, mx) : -(V.vw - V.mondeW) / 2;
  y = my > 0 ? borne(y, 0, my) : -(V.vh - V.mondeH) / 2;
  V.pan = {x:x, y:y};
  V.monde.style.transform = 'translate3d(' + (-x).toFixed(1) + 'px,' + (-y).toFixed(1) + 'px,0)';
  V.root.classList.toggle('at-glisse-g', mx > 0 && x > 2);
  V.root.classList.toggle('at-glisse-d', mx > 0 && x < mx - 2);
  V.root.classList.toggle('at-glisse-h', my > 0 && y > 2);
  V.root.classList.toggle('at-glisse-b', my > 0 && y < my - 2);
  V.root.classList.toggle('at-glissable', mx > 0 || my > 0);
  PAN_MEMO = centreVue(V);
  if(!net) majReperes(V);
  else apres(V, 0, function(){ majReperes(V); });
}
function panPar(V, dx, dy){ panA(V, V.pan.x + dx, V.pan.y + dy); }
/* Montrer un endroit de la pièce en glissant doucement (repère touché, rangement à trouver…) */
function allerVers(V, x, y){
  var a = {x:V.pan.x, y:V.pan.y};
  centrerSur(V, x, y, true);
  var b = {x:V.pan.x, y:V.pan.y};
  if(Math.abs(a.x - b.x) < 2 && Math.abs(a.y - b.y) < 2) return;
  anim(V.monde, [{transform:'translate3d(' + (-a.x) + 'px,' + (-a.y) + 'px,0)'}, {transform:'translate3d(' + (-b.x) + 'px,' + (-b.y) + 'px,0)'}], {duration:420, easing:'ease-in-out'});
}
/* Une chose importante (objet à analyser, potion neuve) est hors de l'écran : un petit repère au bord, qu'on peut toucher */
/* le cadre d'un élément dessiné dans la pièce (unités du monde) : x le milieu, y le bas, w, h */
function cadreEl(d){
  if(!d || !d._bb || !d._p) return null;
  var b = d._bb, p = d._p, s = p.s, w = d._w, h = d._h;
  var x0 = p.x + (b[0] - w / 2) * s, x1 = p.x + (b[2] - w / 2) * s, y0 = p.y + (b[1] - h) * s, y1 = p.y + (b[3] - h) * s;
  return {x:(x0 + x1) / 2, y:y1, w:x1 - x0, h:y1 - y0};
}
function cadreObjet(V, id){
  var o = V.parId[id];
  if(!o) return null;
  var F = cadreEl(V.elO[id]);
  if(F) return F;
  var b = boite(o, posObj(V, o));
  return {x:(b[0] + b[2]) / 2, y:b[3], w:b[2] - b[0], h:b[3] - b[1]};
}
function cadreFlacons(V){
  var l = (V.elFl || []).map(cadreEl).filter(Boolean);
  if(!l.length) return null;
  var x0 = Math.min.apply(null, l.map(function(f){ return f.x - f.w / 2; })), x1 = Math.max.apply(null, l.map(function(f){ return f.x + f.w / 2; }));
  var y0 = Math.min.apply(null, l.map(function(f){ return f.y - f.h; })), y1 = Math.max.apply(null, l.map(function(f){ return f.y; }));
  return {x:(x0 + x1) / 2, y:y1, w:x1 - x0, h:y1 - y0};
}
function cadreTas(V){ var n = cles(V.etat.panier).length, r = Math.ceil(n / TAS.rang); return {x:TAS.x, y:TAS.y + (r - 1) * TAS.dy + 10, w:Math.min(n, TAS.rang) * TAS.dx, h:r * TAS.dy + 10}; }
function majReperes(V){
  if(!V.reperes) return;
  var l = [];
  /* (seulement ce qui est dans la pièce dessinée ; le reste fait briller le bouton de l'autre pièce) */
  if(somme(V.etat.panier) > 0 && !V.salle) l.push({F:cadreTas(V), ic:'🌿', cle:'arrivage'});
  if(analysesEnAttente(V) > 0 && V.elO.pa) l.push({F:cadreObjet(V, 'pa'), ic:'🔍', cle:'analyses'});
  if((V.elFl || []).some(function(d){ return d.classList.contains('at-nouveau'); })) l.push({F:cadreFlacons(V), ic:'🧪', cle:'potions'});
  if(V.elO.lu && V.elO.lu.classList.contains('at-livre-appel')) l.push({F:cadreObjet(V, 'lu'), ic:'📖', cle:'grimoire'});
  var h = '';
  l.forEach(function(o){
    /* la chose est-elle bien visible (au moins la moitié) ? sinon un repère au bord, du côté où elle est */
    var F = o.F;
    if(!F) return;
    var x0 = (F.x - F.w / 2 - V.vb.x0) * V.k - V.pan.x, x1 = x0 + F.w * V.k, y1 = (F.y - V.vb.y0) * V.k - V.pan.y, y0 = y1 - F.h * V.k;
    var vx = Math.max(0, Math.min(x1, V.vw) - Math.max(x0, 0)), vy = Math.max(0, Math.min(y1, V.vh) - Math.max(y0, 0));
    if(vx >= (x1 - x0) * 0.5 && vy >= (y1 - y0) * 0.5) return;
    var sx = (x0 + x1) / 2, sy = (y0 + y1) / 2, m = 24;
    var cx = borne(sx, 30, V.vw - 30), cy = borne(sy, 30, V.vh - 30);
    var cote = sx <= m ? 'g' : sx >= V.vw - m ? 'd' : sy <= m ? 'h' : 'b';
    h += '<button type="button" class="at-repere at-rep-' + cote + '" data-voir="' + o.cle + '" style="left:' + cx.toFixed(0) + 'px;top:' + cy.toFixed(0) + 'px" aria-label="Voir">' + o.ic + '</button>';
  });
  V.reperes.innerHTML = h;
}

/* Après un changement de taille : tout se replace (et se redessine si sa place dans la pièce a changé) */
function majFlaque(V){ var fl = q(V, '.at-flaque'); if(fl){ var Fl = svgFlaque(V); fl.innerHTML = Fl.svg; placeFixe(V, fl, Fl.F); } }
function replacer(V){
  majFlaque(V);
  placerTas(V);
  placerFlacons(V);
  placerTout(V);
  dessinerBetises(V);
  V.etat.cartons.forEach(function(k, i){ var e = V.elK[k.id]; if(e) placeCarton(V, e, k, i); });
  majIndiceCarton(V);
  majLumiere(V);
  if(GUIDE) guidePlacer(V);
}

/* ---------- La pièce ---------- */
/* la flaque (préparation ratée) : devant le chaudron, où qu'il soit */
function posFlaque(V){
  var ch = V.parId.ch, p = ch ? posObj(V, ch) : {x:950, y:716};
  var y = borne(p.y + 70, SOL_MIN + 40, solMax(V) - 4);
  return {x:borne(p.x - 10, solXmin(V, y) + 110, solXmax(V, y) - 110), y:y, w:220, h:70, z:1000 + p.y + 1};
}
function placeFixe(V, d, F){
  d.style.left = pX(V, F.x - F.w / 2);
  d.style.top = pY(V, F.y - F.h);
  d.style.width = pW(V, F.w);
  d.style.height = pH(V, F.h);
  d.style.zIndex = Math.round((F.z !== undefined ? F.z : 1000 + F.y) * 5);
}
function elFixe(V, cls, F, svg, at){
  var d = document.createElement('div');
  d.className = 'at-fixe ' + cls + (at ? ' at-touche' : '');
  if(at) d.setAttribute('data-at', at);
  placeFixe(V, d, F);
  d.innerHTML = svg;
  return d;
}
/* La flaque, couchée sur le plancher */
function svgFlaque(V){
  var F = posFlaque(V), m = surSol(F.x, F.y), R = repere([m.X, 0, m.Z], AXES_FACE, 220, 4), c = ajouterOutils3d(ctx3d(R, false));
  c.p = 120; c.cat = {w:220, h:4};
  var art = '<path d="M20,60 C10,30 60,14 90,26 C120,4 190,16 196,46 C214,72 170,100 120,92 C80,104 30,98 20,60 Z" fill="#8d8a99" stroke="' + K + '" stroke-width="4"/><ellipse cx="80" cy="50" rx="22" ry="10" fill="#b9b6c6"/>';
  var s = c.surPlan(art, [0, 4, 110], [1, 0, 0], [0, 0, -1], 110, 55) + '<circle class="at-blp" cx="' + f1(c.Q(140, 4, 50)[0]) + '" cy="' + f1(c.Q(140, 4, 50)[1]) + '" r="5" fill="#cfcbe0"/>';
  var b = c.bb;
  return {svg:'<svg viewBox="' + [b[0], b[1], b[2] - b[0], b[3] - b[1]].map(f1).join(' ') + '" overflow="visible" aria-hidden="true">' + s + '</svg>', F:{x:F.x + (b[0] + b[2]) / 2 * R.k - 110 * R.k, y:F.y + (b[3] - 4) * R.k, w:(b[2] - b[0]) * R.k, h:(b[3] - b[1]) * R.k, z:F.z}};
}
/* La cueillette posée devant la porte : un tas par ingrédient (on le glisse dans un rangement, ou on le touche) */
function dessinerTas(V){
  (V.elTas || []).forEach(function(e){ e.remove(); });
  V.elTas = [];
  var p = V.etat.panier, ks = cles(p).filter(function(k){ return p[k] > 0; });
  ks.forEach(function(k, i){
    var d = document.createElement('div');
    d.className = 'at-tas' + (estLiquide(k) ? ' liquide' : '');
    d.setAttribute('data-tas', k);
    d._k = k; d._n = p[k];
    V.scene.appendChild(d);
    V.elTas.push(d);
  });
  if(V.elNeuf){ V.elNeuf.remove(); V.elNeuf = null; }
  if(ks.length && (V.etat.nouveaux || 0) > 0){
    var b = document.createElement('div');
    b.className = 'at-tas-neuf at-touche';
    b.setAttribute('data-at', 'arrivage');
    b.innerHTML = '<span>✨ Nouveau !</span>';
    V.scene.appendChild(b);
    V.elNeuf = b;
  }
  placerTas(V);
  placerFlacons(V);
}
function placerTas(V){
  var n = (V.elTas || []).length;
  (V.elTas || []).forEach(function(d, i){
    var q = posTas(i, n), m = surSol(q.x, q.y), R = repere([m.X, 0, m.Z], AXES_FACE, TAS.w, TAS.h), D = dessinTas(d._k, d._n, R), b = D.bb, bw = b[2] - b[0], bh = b[3] - b[1];
    d.innerHTML = '<svg viewBox="' + [b[0], b[1], bw, bh].map(f1).join(' ') + '" overflow="visible" aria-hidden="true">' + D.svg + '</svg>';
    d.style.left = pX(V, q.x + b[0] - TAS.w / 2); d.style.top = pY(V, q.y + b[1] - TAS.h);
    d.style.width = pW(V, bw); d.style.height = pH(V, bh);
    d.style.transformOrigin = ((TAS.w / 2 - b[0]) / bw * 100).toFixed(2) + '% ' + ((TAS.h - b[1]) / bh * 100).toFixed(2) + '%';
    d.style.setProperty('--s', R.k.toFixed(3));
    d.style.zIndex = Math.round((1000 + q.y) * 5);
    d._s = R.k; d._bb = b; d._p = {x:q.x, y:q.y, s:R.k}; d._w = TAS.w; d._h = TAS.h;
  });
  if(V.elNeuf && n){
    var q0 = posTas(0, n), q1 = posTas(Math.min(n, TAS.rang) - 1, n);
    V.elNeuf.style.left = pX(V, (q0.x + q1.x) / 2 - 85); V.elNeuf.style.top = pY(V, q0.y - TAS.h - 70);
    V.elNeuf.style.width = pW(V, 170); V.elNeuf.style.height = pH(V, 78);
    V.elNeuf.style.zIndex = Math.round((1000 + q0.y) * 5) + 3;
  }
}
/* Les potions finies : des flacons posés par terre devant la porte, comme la cueillette (on touche un flacon : à quoi elle sert, la donner, la vendre) */
function dessinerFlacons(V){
  (V.elFl || []).forEach(function(e){ e.remove(); });
  V.elFl = [];
  var P = V.o.potions || {};
  cles(P).filter(function(k){ return P[k] > 0; }).forEach(function(k){
    var d = document.createElement('div');
    d.className = 'at-flacon at-touche' + (V.flNeufs && V.flNeufs[k] ? ' at-nouveau' : '');
    d.setAttribute('data-at', 'potions');
    d.setAttribute('data-pot', k);
    d._k = k; d._n = P[k];
    V.scene.appendChild(d);
    V.elFl.push(d);
  });
  placerFlacons(V);
}
function placerFlacons(V){
  var l = V.elFl || [], n = l.length, rangs = Math.ceil(cles(V.etat.panier).filter(function(k){ return V.etat.panier[k] > 0; }).length / TAS.rang);
  l.forEach(function(d, i){
    var q = posFlacon(i, n, rangs), m = surSol(q.x, q.y), R = repere([m.X, 0, m.Z], AXES_FACE, FLACONS.w, FLACONS.h), D = dessinFlacon(d._k, d._n, R), b = D.bb, bw = b[2] - b[0], bh = b[3] - b[1];
    d.innerHTML = '<svg viewBox="' + [b[0], b[1], bw, bh].map(f1).join(' ') + '" overflow="visible" aria-hidden="true">' + D.svg + '</svg>';
    d.style.left = pX(V, q.x + b[0] - FLACONS.w / 2); d.style.top = pY(V, q.y + b[1] - FLACONS.h);
    d.style.width = pW(V, bw); d.style.height = pH(V, bh);
    d.style.transformOrigin = ((FLACONS.w / 2 - b[0]) / bw * 100).toFixed(2) + '% ' + ((FLACONS.h - b[1]) / bh * 100).toFixed(2) + '%';
    d.style.setProperty('--s', R.k.toFixed(3));
    d.style.zIndex = Math.round((1000 + q.y) * 5);
    d._bb = b; d._p = {x:q.x, y:q.y, s:R.k}; d._w = FLACONS.w; d._h = FLACONS.h; d._s = R.k;
  });
}
/* Une potion de plus : son flacon brille un moment (et un repère au bord le montre s'il est hors de l'écran) */
function brillerFlacons(V, l){
  V.flNeufs = {};
  l.forEach(function(k){ V.flNeufs[k] = 1; });
  (V.elFl || []).forEach(function(d){ d.classList.toggle('at-nouveau', !!V.flNeufs[d._k]); });
  majReperes(V); majSalleBouton(V);
  clearTimeout(V.flT);
  V.flT = apres(V, 7000, function(){ V.flNeufs = null; (V.elFl || []).forEach(function(d){ d.classList.remove('at-nouveau'); }); majReperes(V); majSalleBouton(V); });
}
function dessinerPiece(V, avantK){
  var sc = V.scene;
  sc.innerHTML = '';
  V.parId = {}; V.elO = {}; V.elK = {}; V.elTas = []; V.elNeuf = null; V.elFl = [];
  V.etat.objets.forEach(function(o){ V.parId[o.id] = o; });
  /* (la flaque : devant le chaudron, dans sa pièce) */
  if(V.etat.flaque && salleDe(V.parId.ch) === V.salle){
    var Fl = svgFlaque(V), fl = elFixe(V, 'at-flaque', Fl.F, Fl.svg, 'flaque');
    sc.appendChild(fl);
  }
  majDessin(V);
  ici(V).forEach(function(o){ var e = elObjet(V, o); sc.appendChild(e); });
  /* la cueillette et les potions : devant la porte de l'atelier */
  if(!V.salle){ dessinerTas(V); dessinerFlacons(V); }
  majFixes(V);
  cartonsIci(V).forEach(function(k, i){
    var e = elCarton(V, k, i);
    sc.appendChild(e);
    if(avantK && avantK.indexOf(k.id) < 0) anim(e, [{transform:'translateY(-' + Math.round(500 * V.k) + 'px) scale(' + e._s + ')', opacity:0}, {transform:'translateY(0) scale(' + e._s * 1.08 + ',' + e._s * 0.9 + ')', opacity:1, offset:0.75}, {transform:'translateY(0) scale(' + e._s + ')', opacity:1}], {duration:650, easing:'ease-in', delay:i * 120, fill:'backwards'});
  });
  placerTout(V);
  dessinerBetises(V);
  majIndiceCarton(V);
  majLumiere(V);
  majCiblesSel(V);
  majTient(V);
  majReperes(V);
  majSalleBouton(V);
  if(GUIDE) guidePlacer(V);
}
/* ---------- Passer d'une pièce à l'autre (l'arche, le bouton 🛏️ / ⚗️ en bas à gauche) ---------- */
function majSalleBouton(V){
  var b = V.elSalle;
  if(!b) return;
  var autre = 1 - V.salle, ic = b.querySelector('.at-salle-ic'), bd = b.querySelector('.at-badge');
  ic.textContent = autre ? '🛏️' : '⚗️';
  b.setAttribute('aria-label', autre ? 'Aller dans la chambre' : 'Retourner dans l\'atelier');
  /* là-bas, des cartons attendent ; ou dans l'atelier, du nouveau (cueillette, potion, objet à analyser) */
  var nk = V.etat.cartons.filter(function(k){ return (k.ch ? 1 : 0) === autre; }).length;
  var neuf = !autre && ((V.etat.nouveaux || 0) > 0 || !!V.flNeufs || (analysesEnAttente(V) > 0 && salleDe(V.parId.pa) === 0));
  if(bd){ bd.textContent = nk ? nk : '!'; bd.style.display = nk || neuf ? '' : 'none'; }
  b.classList.toggle('at-appel', nk > 0 || neuf);
}
function changerSalle(V, s, opts){
  opts = opts || {};
  if(V.arrete || V.mode !== 'ranger') return;
  s = s ? 1 : 0;
  if(V.salle === s){ if(opts.centre) allerVers(V, opts.centre.x, opts.centre.y); return; }
  if(V.ouvert) fermerOuvert(V);
  if(V.grim && !V.grim.hidden) fermerGrimoire(V);
  var de = V.salle;
  V.salle = s; SALLE_MEMO = s;
  majFond(V);
  dessinerPiece(V);
  /* on arrive par l'arche : dans la chambre, elle est à gauche ; dans l'atelier, à droite */
  var c = opts.centre || (s ? {x:330, y:560} : {x:900, y:560});
  centrerSur(V, c.x, c.y, true);
  anim(V.monde, [{opacity:0.2, transform:V.monde.style.transform + ' translateX(' + (s > de ? 80 : -80) + 'px)'}, {opacity:1, transform:V.monde.style.transform}], {duration:360, easing:'ease-out'});
  son(V, 'porte');
  if(s && !V.etat.vuChambre){
    V.etat.vuChambre = 1;
    var t = 'Ta chambre ! Touche les cartons pour l\'installer. Pour revenir à l\'atelier : le bouton ⚗️ ou l\'arche.';
    toast(V, '<b>🛏️ ✨</b> ' + esc(t), 6000, t);
    changer(V);
  }
  chatsDemarrer(V);
}
/* Un objet lâché sur l'arche ou sur le bouton de l'autre pièce : il y passe (avec ce qui est posé dessus) ; on le suit */
function envoyerSalle(V, o){
  var s = 1 - V.salle, enf = enfantsDe(V, o);
  [o].concat(enf).forEach(function(x){ if(s) x.pc = 1; else delete x.pc; });
  o.sur = null; o.cote = 0; delete o.pz; delete o.py; o.neuf = 0;
  var avant = V.salle;
  V.salle = s; trouverPlace(V, o); V.salle = avant;
  changerSalle(V, s);
  var F = cadreObjet(V, o.id);
  if(F) centrerSur(V, F.x, F.y - F.h / 2, true);
  etincelles(V, o);
  var nom = catDe(o).nom, t = s ? nom + ' : dans la chambre !' : nom + ' : dans l\'atelier !';
  toast(V, '<b>' + (catDe(o).ic || '✨') + ' ➡️ ' + (s ? '🛏️' : '⚗️') + '</b> ' + esc(t), 3000, t);
  majLumiere(V);
  changer(V);
}
/* Ce que les meubles spéciaux doivent montrer (objets reçus sur la paillasse, chaudron de cuivre) */
function majDessin(V){
  DESSIN.analyses = V.o.analyses || [];
  DESSIN.cuivre = aObjet(V, 'chaudron_cuivre');
}
/* Le contenu changeant : le carton du coin (son nombre), la paillasse (objets reçus), le chaudron (prêt, fioles vides) */
function analysesEnAttente(V){ return (V.o.analyses || []).filter(function(a){ return !a.fait; }).length; }
function majFixes(V){
  var nr = V.etat.reserve.length, rb = V.elReserve && V.elReserve.querySelector('.at-badge');
  if(rb){ rb.textContent = nr; rb.style.display = nr ? '' : 'none'; }
  majDessin(V);
  var pa = V.parId.pa, att = analysesEnAttente(V);
  if(pa && V.elO.pa){
    redessiner(V, pa);
    V.elO.pa.classList.toggle('at-attente', att > 0);
  }
  var ch = V.elO.ch;
  if(ch){
    var pret = (V.o.fioles || 0) > 0 && recettesDe(V).some(function(r){ return etatRecette(V, r.id).pret; });
    ch.classList.toggle('at-pret', pret);
    var vb = ch.querySelector('.at-vides');
    if(vb) vb.outerHTML = videsHTML(V);
  }
}
/* Les fioles vides : un petit badge sur le chaudron (il faut une fiole vide pour chaque potion) */
function videsHTML(V){
  var n = V.o.fioles || 0;
  return '<span class="at-vides' + (n ? '' : ' zero') + '" aria-hidden="true"><svg viewBox="0 0 24 34"><path d="M9,2 H15 V11 C21,13 22,30 12,31 C2,30 3,13 9,11 Z" fill="rgba(220,250,255,.75)" stroke="#24182e" stroke-width="2.5" stroke-linejoin="round"/>' +
    '<rect x="8" y="0.5" width="8" height="4" rx="1.5" fill="#c58a4a" stroke="#24182e" stroke-width="1.5"/></svg><b>' + n + '</b></span>';
}
/* Plus de fiole vide : le badge du chaudron clignote un moment (et on le montre) */
function brillerVides(V){
  var ch = V.elO.ch;
  if(!ch) return;
  var F = cadreObjet(V, 'ch');
  if(F) allerVers(V, F.x, F.y - F.h / 2);
  ch.classList.add('at-vides-appel');
  apres(V, 5000, function(){ if(V.elO.ch) V.elO.ch.classList.remove('at-vides-appel'); });
}
function briller(V, el, ms){
  if(!el) return;
  el.classList.add('at-nouveau');
  majReperes(V);
  apres(V, ms || 6000, function(){ el.classList.remove('at-nouveau'); majReperes(V); });
}
function elObjet(V, o){
  var c = catDe(o), d = document.createElement('div');
  d.className = 'at-o at-t-' + c.t + ' at-z-' + c.z + (c.plat ? ' at-plat' : '') + (c.cases ? ' at-rang' : '') + (c.verre ? ' at-verre' : '') + (o.neuf ? ' at-neuf' : '') + (o.cote ? ' at-profil' : '') +
    (c.deco ? ' at-deco' : '') + (c.special ? ' at-special' : '') + (c.cls ? ' ' + c.cls : '');
  d.setAttribute('data-obj', o.id);
  V.elO[o.id] = d;
  if(o.t === 'chat') chatHabiller(V, o, d);
  placerEl(V, o, true);
  if(o.t === 'chat') majHumeur(V, o);
  return d;
}
/* Le dessin d'un objet (dans la perspective, là où il est) ; un rangement porte en plus sa petite règle (💧 le verre, 🍃 les choses sèches),
   visible quand on tient un ingrédient ; le chaudron, le nombre de fioles vides */
function htmlObjet(V, o, R){
  var c = catDe(o), D = dessinObjet(o, R), b = D.bb, att = c.special === 'analyses' ? (DESSIN.analyses || []).filter(function(a){ return !a.fait; }).length : 0;
  return {bb:b, html:'<svg viewBox="' + [b[0], b[1], b[2] - b[0], b[3] - b[1]].map(f1).join(' ') + '" overflow="visible" aria-hidden="true">' + D.svg + '</svg>' +
    (c.cases ? '<span class="at-regle ' + (c.verre ? 'at-regle-v' : 'at-regle-s') + '" aria-hidden="true">' + (c.verre ? '💧' : '🍃') + '</span>' : '') +
    (att ? '<b class="at-badge">' + att + '</b>' : '') + (c.special === 'chaudron' ? videsHTML(V) : '') + (o.t === 'chat' ? bulleHTML(o) + bonheurHTML(o) : '')};
}
/* Placer un objet : son ancre (le milieu du bas de sa face avant) à sa place ; son cadre suit son dessin.
   Il se redessine quand sa place dans la pièce change (la perspective n'est pas la même partout). */
function placerEl(V, o, force){
  var d = V.elO[o.id];
  if(!d) return;
  var c = catDe(o), p = o.t === 'chat' ? chatPos(V, o) : posObj(V, o);
  var cle = c.plat ? 'plat' : p.R.o.map(function(v){ return v.toFixed(1); }).join(',') + '|' + (o.cote || '');
  if(force || d._cle !== cle){
    var H = htmlObjet(V, o, c.plat ? null : p.R);
    d.innerHTML = H.html; d._bb = H.bb; d._cle = cle; d._w = c.w; d._h = c.h;
  }
  var b = d._bb, bw = b[2] - b[0], bh = b[3] - b[1];
  d.style.left = pX(V, p.x + b[0] - c.w / 2);
  d.style.top = pY(V, p.y + b[1] - c.h);
  d.style.width = pW(V, bw);
  d.style.height = pH(V, bh);
  d.style.transformOrigin = ((c.w / 2 - b[0]) / bw * 100).toFixed(2) + '% ' + ((c.h - b[1]) / bh * 100).toFixed(2) + '%';
  d.style.setProperty('--s', p.s.toFixed(3));
  d.style.zIndex = Math.round(p.z * 5);
  d._s = p.s; d._p = p;
}
function placerTout(V){ ici(V).forEach(function(o){ placerEl(V, o); }); }
function redessiner(V, o){
  var d = V.elO[o.id];
  if(!d) return;
  placerEl(V, o, true);
  d.classList.toggle('at-neuf', !!o.neuf);
  d.classList.toggle('at-profil', !!o.cote);
}
/* Les cartons arrivés : posés par terre, en avant, sur les côtés (le milieu reste pour la cueillette et les potions) */
function placeCarton(V, d, k, i){
  var t = CARTON_TAILLE[k.t] || CARTON_TAILLE.carton, p = POS_CARTONS[i % POS_CARTONS.length], m = surSol(p[0], p[1]);
  var R = repere([m.X, 0, m.Z], AXES_FACE, t[0], t[1]), D = dessinCarton(k, R), b = D.bb, bw = b[2] - b[0], bh = b[3] - b[1];
  d.innerHTML = '<svg viewBox="' + [b[0], b[1], bw, bh].map(f1).join(' ') + '" overflow="visible" aria-hidden="true">' + D.svg + '</svg>' +
    '<span class="at-reste">' + new Array(Math.min(6, k.reste.length) + 1).join('<i></i>') + '</span>';
  d.style.left = pX(V, p[0] + b[0] - t[0] / 2);
  d.style.top = pY(V, p[1] + b[1] - t[1]);
  d.style.width = pW(V, bw);
  d.style.height = pH(V, bh);
  d.style.transformOrigin = ((t[0] / 2 - b[0]) / bw * 100).toFixed(2) + '% ' + ((t[1] - b[1]) / bh * 100).toFixed(2) + '%';
  d.style.setProperty('--s', R.k.toFixed(3));
  d.style.zIndex = Math.round((1000 + p[1]) * 5);
  d._s = R.k; d._p = p; d._t = t;
}
function elCarton(V, k, i){
  var d = document.createElement('div');
  d.className = 'at-carton at-k-' + k.t + (k.ouvert ? ' at-ouvert-c' : '');
  d.setAttribute('data-carton', k.id);
  placeCarton(V, d, k, i);
  V.elK[k.id] = d;
  return d;
}
/* Petite main qui montre le premier carton tant que l'atelier est vide */
function majIndiceCarton(V){
  var m = q(V, '.at-main-indice');
  var montrer = V.mode === 'ranger' && !ici(V).some(function(o){ var c = catDe(o); return !c.special && o.t !== 'fioles_ingr'; }) && cartonsIci(V).length;
  if(!montrer){ if(m) m.remove(); return; }
  if(!m){ m = document.createElement('div'); m.className = 'at-main-indice'; m.textContent = '👆'; V.calque.appendChild(m); }
  var p = POS_CARTONS[0];
  m.style.left = pX(V, p[0]);
  m.style.top = pY(V, p[1] - 130);
}

/* ---------- L'ingrédient qu'elle tient (choisi dans le carton) : les rangements qui l'acceptent brillent ---------- */
function majCiblesSel(V, kForce){
  var k = kForce !== undefined ? kForce : V.sel;
  V.root.classList.toggle('at-choix', !!k);
  V.etat.objets.forEach(function(o){
    var d = V.elO[o.id], c = catDe(o);
    if(!d || !c.cases) return;
    d.classList.toggle('at-dispo', !!k && !!c.verre === estLiquide(k));
  });
}
function majTient(V){
  var t = V.tientEl, k = V.sel;
  if(!t) return;
  if(!k || !(V.etat.panier[k] > 0)){ V.sel = null; t.hidden = true; t.innerHTML = ''; majCiblesSel(V); return; }
  if(V.ouvert || (V.grim && !V.grim.hidden)){ t.hidden = true; majCiblesSel(V); return; }   /* un gros plan ou un panneau est ouvert */
  var n = V.etat.panier[k];
  t.innerHTML = '<span class="at-tient-j" style="--c:' + coulIngr(k) + '">' + icIngr(k) + '</span><span class="at-tient-t"><b>' + esc(nomIngr(k)) + (n > 1 ? ' ×' + n : '') + '</b><small>' +
    (estLiquide(k) ? '💧 Touche un bocal ou une fiole qui brille' : '🍃 Touche un tiroir ou un placard qui brille') + '</small></span>' +
    '<button type="button" class="at-rond at-tient-x" aria-label="Lâcher">✖</button>';
  t.hidden = false;
  majCiblesSel(V);
}
function nomIngr(k){ return (INGR[k] && INGR[k].nom) || k; }

/* ---------- Bulle d'information (avec 🔊 si l'explication peut être lue) ---------- */
var APPRIS = 3;
function toast(V, html, ms, lu, plus){
  var t = V.toastEl;
  V.toastLu = lu || '';
  t.innerHTML = '<span class="at-toast-t">' + typo(html) + '</span>' + (lu ? '<button type="button" class="at-rond at-toast-lire" aria-label="Écouter">🔊</button>' : '') + (plus || '');
  t.hidden = false;
  t.classList.remove('at-toast-on'); void t.offsetWidth; t.classList.add('at-toast-on');
  clearTimeout(V.toastT);
  V.toastT = apres(V, ms || (lu ? 5000 : 2200), function(){ t.hidden = true; });
}
function prolongerToast(V, ms){
  var t = V.toastEl;
  clearTimeout(V.toastT);
  V.toastT = apres(V, ms, function(){ t.hidden = true; });
}
/* Après une erreur, toutes les petites règles 💧 / 🍃 se montrent un moment */
function montrerRegles(V){
  V.root.classList.add('at-regle-flash');
  clearTimeout(V.regleT);
  V.regleT = apres(V, 4500, function(){ V.root.classList.remove('at-regle-flash'); });
}
/* Le liquide n'a rien à faire dans un tiroir, le sec rien dans un bocal : on explique, on ne perd rien */
var NOM_LIQ = {eau:['L\'eau', 'coulerait'], miel:['Le miel', 'coulerait'], brume:['La brume', 's\'envolerait']};
var NOM_SEC = {baies:['les baies', 'pourriraient'], champignon:['le champignon', 'pourrirait'], trefle:['le trèfle', 'pourrirait'], lavande:['la lavande', 'pourrirait'],
  pensee:['les pensées', 'pourriraient'], menthe:['la menthe', 'pourrirait'], ortie:['l\'ortie', 'pourrirait'], racine:['la racine', 'moisirait'], lune:['la poussière de lune', 'ferait des grumeaux']};
var DE_RANGEMENT = {commode:'du tiroir', casier:'du tiroir', apothicaire:'du tiroir', placard:'du placard'};
function texteMauvaisRangement(k, o){
  if(estLiquide(k)){
    var l = NOM_LIQ[k] || ['Ça', 'coulerait'];
    return l[0] + ' ' + l[1] + ' ' + (DE_RANGEMENT[o.t] || 'de là') + ' ! Les liquides vont dans les bocaux.';
  }
  var s = NOM_SEC[k] || ['ça', 'pourrirait'];
  return (o.t === 'fioles_ingr' ? 'Dans une fiole fermée, ' : 'Dans un bocal fermé, ') + s[0] + ' ' + s[1] + ' ! Les choses sèches vont dans les tiroirs et les placards.';
}
function jetonHTML(k, n, de, on, extra){
  return '<div class="at-jeton' + (on ? ' on' : '') + (estLiquide(k) ? ' liquide' : '') + '" data-ingr="' + k + '" data-de="' + de + '"' + (extra || '') + ' style="--c:' + coulIngr(k) + '"><span>' + icIngr(k) + '</span>' + (n > 1 ? '<b>' + n + '</b>' : '') + '</div>';
}
