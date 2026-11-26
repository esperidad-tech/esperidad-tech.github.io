/* =====================================================================
   Phase 3, maquette rapide (chantier 4 du § 18.11) — LE MOTEUR
   Aucun dessin ici : les règles, le hasard partagé, la suite des coups,
   la simulation d'UN joueur (sa tablette), et un robot pour les essais.
   Marche dans la page et dans node (tests/robot.js).

   Le principe (Bible § 18.5) : les quatre tablettes ne sont pas reliées.
   Chacune calcule LA MÊME suite de coups à partir du numéro de partie,
   du numéro de l'essai et du numéro de la manche (aucun Math.random ici).
   Chaque tablette ne simule que SON héros ; elle affiche les cartes
   « à crier » dont elle est le donneur (jamais celles qui la concernent).
   ===================================================================== */
(function (G) {
'use strict';

var ROLES = ['pisteur', 'alchimiste', 'barde', 'sage'];
var R = {
  pisteur:    { nom: 'PISTEUR',    ic: '🏹', c: '#5fcf86' },
  alchimiste: { nom: 'ALCHIMISTE', ic: '⚗️', c: '#b48cff' },
  barde:      { nom: 'BARDE',      ic: '🎻', c: '#ff8fb3' },
  sage:       { nom: 'SAGE',       ic: '📜', c: '#6cb6ff' }
};
/* L'anneau du début (Bible § 18.5, « la montée ») : le Barde donne au Sage, le Sage à l'Alchimiste,
   l'Alchimiste au Pisteur, le Pisteur au Barde. [donneur, receveur] */
var ANNEAU = [['barde', 'sage'], ['sage', 'alchimiste'], ['alchimiste', 'pisteur'], ['pisteur', 'barde']];
var ZONES = ['GAUCHE', 'MILIEU', 'DROITE'];
var ELEMS = [{ n: 'FEU', ic: '🔥', c: '#ff7a2f' }, { n: 'ACIDE', ic: '🧪', c: '#8fe03a' }, { n: 'GEL', ic: '❄️', c: '#8fdcff' }];
/* les parties du corps se nomment par ce qu'on voit (Bible § 18.5, point 3) */
var PARTIES = ['LANTERNE', 'CORBEAU', 'CŒUR', 'TÊTE'];
/* Les symboles de victoire : ceux du jeu (DONNEES.SYM), sans 🔥 (c'est le feu) ni ❤️ (c'est le cœur de Grosbec). */
var SYMB = [['lune', '🌙', 'LUNE'], ['etoile', '⭐', 'ÉTOILE'], ['soleil', '☀️', 'SOLEIL'], ['cle', '🔑', 'CLÉ'],
  ['champi', '🍄', 'CHAMPIGNON'], ['poisson', '🐟', 'POISSON'], ['arbre', '🌳', 'ARBRE'], ['cloche', '🔔', 'CLOCHE'],
  ['chapeau', '🎩', 'CHAPEAU'], ['chat', '🐱', 'CHAT']];

/* ---------- Les réglages qui comptent pour le jeu (tous les chiffres sont ici) ---------- */
var REG = {
  vie: 100,            // la vie d'un héros
  degZone: 60,         // une frappe de zone qui tombe sur toi
  degMega: 100,        // la méga attaque sans bouclier : tu tombes
  soin: 35,            // ce que rend un soin
  soinDuree: 2.5,      // le soin : rester sans bouger, sans taper ; un coup reçu le coupe
  tir: 0.65,           // le héros tape tout seul toutes les 0,65 s, sur la partie choisie, avec l'élément choisi
  deplacement: 0.28,   // aller d'une zone à l'autre (pendant ce temps, on ne tape pas)
  bouclierDuree: 5,    // le bouclier tient 5 s (ou jusqu'à la méga attaque qu'il arrête)
  bouclierAttente: 2,  // une fois levé, il revient après DEUX méga attaques (celle qu'il arrête ou qu'il rate, puis la suivante) :
                       // on ne peut donc pas le lever à chaque fois « au cas où » ; et on n'est jamais visé deux fois de suite
  bossVie: { court: 200, normal: 330, long: 480 },
  lancement: 2         // après « GO » : deux secondes de calme
};
/* La vitesse (la même sur les quatre tablettes) : un facteur sur toutes les durées des manches. */
var VITESSES = { lente: 1.25, normale: 1, rapide: 0.85 };

/* ---------- Le hasard partagé ---------- */
function hash(s) { var h = 2166136261 >>> 0; for (var i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619) >>> 0; } return h >>> 0; }
function rngDe(s) {
  var a = hash(s);
  return function () { a = (a + 0x6D2B79F5) >>> 0; var t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}
function entier(r, n) { return Math.floor(r() * n); }
function melanger(r, a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = entier(r, i + 1), x = a[i]; a[i] = a[j]; a[j] = x; } return a; }
function arrondi(x) { return Math.round(x * 100) / 100; }
/* chacun donne une fois et reçoit une fois, jamais à soi-même */
function derangement(r) {
  for (;;) {
    var p = melanger(r, ROLES), ok = true;
    for (var i = 0; i < 4; i++) if (p[i] === ROLES[i]) { ok = false; break; }
    if (ok) return ROLES.map(function (g, i) { return [g, p[i]]; });
  }
}
/* coupe un tour (4 échanges) en deux temps de deux échanges qui ne se touchent pas (deux paires qui parlent en même temps) */
function enPaires(r, arcs) {
  for (var j = 1; j < 4; j++) {
    var a = arcs[0], b = arcs[j];
    if (a[0] !== b[0] && a[0] !== b[1] && a[1] !== b[0] && a[1] !== b[1]) {
      var reste = arcs.filter(function (x, k) { return k !== 0 && k !== j; });
      var p1 = [a, b], p2 = reste;
      return r() < 0.5 ? [p1, p2] : [p2, p1];
    }
  }
  throw new Error('enPaires');
}
/* Les symboles de victoire de la partie : quatre différents, un par rôle (ne changent pas d'un essai à l'autre). */
function symboles(partie) {
  var r = rngDe('symboles|' + partie), l = melanger(r, SYMB.map(function (s, i) { return i; })), o = {};
  ROLES.forEach(function (ro, i) { o[ro] = l[i]; });
  return o;
}

/* ---------- La montée, manche par manche (Bible § 18.5 : un cycle simple, puis ça s'enchaîne, ça se mélange,
   ça accélère, des informations en même temps) ---------- */
function niveau(m) {
  var n;
  if (m === 1) n = { ordre: 'anneau', parTemps: [1], items: ['zone'], gap: 5.0, warn: 4.0, tours: 2, mega: false };
  else if (m === 2) n = { ordre: 'anneau', parTemps: [1], items: ['zone', 'elem'], gap: 4.6, warn: 3.8, tours: 2, mega: false };
  else if (m === 3) n = { ordre: 'anneau', parTemps: [1], items: ['zone', 'elem', 'part'], gap: 4.6, warn: 3.8, tours: 2, mega: false };
  else if (m === 4) n = { ordre: 'anneau', parTemps: [1], items: ['zone', 'elem', 'part'], gap: 3.7, warn: 3.4, tours: 2, mega: true };
  else if (m === 5) n = { ordre: 'melange', parTemps: [1], items: ['zone', 'elem', 'part'], gap: 3.5, warn: 3.2, tours: 2, mega: true };
  else if (m === 6) n = { ordre: 'melange', parTemps: [2], items: ['zone', 'elem', 'part'], gap: 4.3, warn: 3.3, tours: 3, mega: true };
  else if (m === 7) n = { ordre: 'melange', parTemps: [2], items: ['zone', 'elem', 'part'], gap: 3.9, warn: 3.1, tours: 3, mega: true };
  else if (m === 8) n = { ordre: 'melange', parTemps: [2, 4], items: ['zone', 'elem', 'part'], gap: 3.7, warn: 3.0, tours: 4, mega: true };
  else {
    var k = m - 8;
    n = { ordre: 'melange', parTemps: [4, 2], items: ['zone', 'elem', 'part'], gap: Math.max(2.7, 3.7 * Math.pow(0.95, k)),
      warn: Math.max(2.3, 3.0 * Math.pow(0.96, k)), tours: 4, mega: true };
  }
  n.warn = Math.min(n.warn, n.gap - 0.4);   // un même héros ne reçoit jamais deux frappes de zone qui se chevauchent
  n.megaWarn = m <= 5 ? 3.6 : (m <= 8 ? 3.2 : 2.8);
  return n;
}

/* ---------- Une manche : la liste de tous les coups, pour les quatre héros ---------- */
var CACHE = {};
function manche(partie, essai, m, vitesse) {
  var cle = [partie, essai, m, vitesse].join('|');
  if (!CACHE[cle]) CACHE[cle] = fabriquerManche(partie, essai, m, vitesse);
  return JSON.parse(CACHE[cle]);
}
function fabriquerManche(partie, essai, m, vitesse) {
  var f = VITESSES[vitesse] || 1, n = niveau(m), r = rngDe(['manche', partie, essai, m, vitesse].join('|'));
  var gap = n.gap * f, warn = n.warn * f, megaWarn = n.megaWarn * f;
  var ev = [], t = 1.5 * f, id = 0, derniere = {}, megaAvant = null, donnes = { pisteur: 0, alchimiste: 0, barde: 0, sage: 0 };
  var megaDons = { pisteur: 0, alchimiste: 0, barde: 0, sage: 0 };   // les cartes sont équilibrées par construction ; on équilibre les méga attaques
  var impacts = { pisteur: [], alchimiste: [], barde: [], sage: [] };
  /* jamais deux méga attaques de suite sur le même héros, même d'une manche à l'autre */
  if (m > 1) { var mp = manche(partie, essai, m - 1, vitesse).ev.filter(function (e) { return e.k === 'mega'; }); if (mp.length) megaAvant = mp[mp.length - 1].cible; }
  for (var tour = 0; tour < n.tours; tour++) {
    var arcs = n.ordre === 'anneau' ? ANNEAU.slice() : derangement(r);
    var pt = n.parTemps[tour % n.parTemps.length], temps;
    if (pt === 1) temps = arcs.map(function (a) { return [a]; });
    else if (pt === 2) temps = enPaires(r, arcs);
    else temps = [arcs];
    var megaApres = n.mega ? entier(r, temps.length) : -1;
    for (var b = 0; b < temps.length; b++) {
      temps[b].forEach(function (a) {
        var c = { k: 'carte', id: ++id, donneur: a[0], cible: a[1], tA: arrondi(t), tI: arrondi(t + warn), zone: entier(r, 3), elem: null, part: null };
        var av = derniere[a[1]];
        if (n.items.indexOf('elem') >= 0) {
          do {
            c.elem = entier(r, 3);
            c.part = n.items.indexOf('part') >= 0 ? entier(r, 4) : null;
          } while (av && av.elem === c.elem && av.part === c.part);
        }
        derniere[a[1]] = c; donnes[a[0]]++; impacts[a[1]].push(c.tI);
        ev.push(c);
      });
      t += gap;
      if (b === megaApres) {
        /* la méga attaque : sur toutes les tablettes, un seul héros visé ; l'information est chez un autre */
        var tA = t - gap * 0.45, tI = tA + megaWarn;
        var cand = ROLES.filter(function (ro) {
          return ro !== megaAvant && impacts[ro].every(function (x) { return Math.abs(x - tI) > 0.9 * f; });
        });
        if (!cand.length) cand = ROLES.filter(function (ro) { return ro !== megaAvant; });
        /* le donneur d'abord (celui qui a le moins crié, et pas déjà en train de crier), puis le visé */
        var mini = Math.min.apply(null, ROLES.map(function (ro) { return megaDons[ro]; }));
        var dons = ROLES.filter(function (ro) { return megaDons[ro] === mini && cand.some(function (c) { return c !== ro; }); });
        if (!dons.length) dons = ROLES.filter(function (ro) { return cand.some(function (c) { return c !== ro; }); });
        var libres = dons.filter(function (ro) { return !ev.some(function (c) { return c.donneur === ro && Math.abs(c.tA - tA) < 1.3 * f; }); });
        if (libres.length) dons = libres;
        var donneur = dons[entier(r, dons.length)];
        var vises = cand.filter(function (c) { return c !== donneur; });
        var cible = vises[entier(r, vises.length)];
        donnes[donneur]++; megaDons[donneur]++; megaAvant = cible;
        ev.push({ k: 'mega', id: ++id, donneur: donneur, cible: cible, tA: arrondi(tA), tI: arrondi(tI) });
        t = Math.max(t, tI + 0.4 * f);
      }
    }
  }
  var fin = Math.max.apply(null, ev.map(function (e) { return e.tI; }));
  ev.sort(function (a, b) { return a.tA - b.tA || a.id - b.id; });
  return JSON.stringify({ partie: partie, essai: essai, m: m, vitesse: vitesse, n: n, D: arrondi(fin + 1.2 * f), ev: ev, donnes: donnes });
}

/* ---------- UN héros sur SA tablette ----------
   Le temps t est celui de la manche (secondes depuis son début). */
function Joueur(role, o) {
  o = o || {};
  this.role = role;
  this.bossMax = REG.bossVie[o.bossVie || 'normal'] || REG.bossVie.normal;
  this.reset(o.snap);
}
Joueur.prototype.reset = function (snap) {
  this.vie = REG.vie; this.mort = false;
  this.boss = snap ? snap.boss : this.bossMax;
  this.faible = snap ? { elem: snap.faible.elem, part: snap.faible.part } : { elem: 'tout', part: 'tout' };
  this.zone = 1; this.versZone = 1; this.arrivee = 0;
  this.elemSel = snap ? snap.elemSel : null; this.partSel = snap ? snap.partSel : null;
  this.bouclierFin = -1; this.bouclierAttente = 0;
  this.soinDebut = -1;
  this.prochainTir = 0;
  this.zoneEnCours = null;     // la frappe de zone qui arrive sur moi (je vois qu'elle arrive, pas où)
  this.megaEnCours = null;
  this.journal = [];           // ce qui s'est passé (pour l'écran et pour les essais)
  this.vus = {};               // les coups déjà traités
  this.t = 0;
};
Joueur.prototype.instantane = function () {
  return { boss: this.boss, faible: { elem: this.faible.elem, part: this.faible.part }, elemSel: this.elemSel, partSel: this.partSel };
};
Joueur.prototype.ev = function (type, d) { d = d || {}; d.type = type; d.t = this.t; this.journal.push(d); if (this.surEv) this.surEv(d); };
Joueur.prototype.soutien = function () { return this.boss <= 0; };
Joueur.prototype.immobile = function (t) { return t >= this.arrivee; };

/* les gestes du joueur */
Joueur.prototype.aller = function (z, t) {
  if (this.mort || z === this.versZone) return;
  this.versZone = z; this.arrivee = t + REG.deplacement; this.couperSoin('bouge');
  this.ev('aller', { z: z });
};
Joueur.prototype.choisirElem = function (e) { if (!this.mort) { this.elemSel = e; this.couperSoin('change'); this.ev('elem', { e: e }); } };
Joueur.prototype.choisirPart = function (p) { if (!this.mort) { this.partSel = p; this.couperSoin('change'); this.ev('part', { p: p }); } };
Joueur.prototype.bouclier = function (t) {
  if (this.mort || this.bouclierAttente > 0) return false;
  this.bouclierFin = t + REG.bouclierDuree; this.bouclierAttente = REG.bouclierAttente; this.ev('bouclier');
  return true;
};
Joueur.prototype.soigner = function (t) {
  if (this.mort || this.soinDebut >= 0 || this.vie >= REG.vie) return false;
  this.soinDebut = t; this.ev('soin-debut'); return true;
};
Joueur.prototype.couperSoin = function (pourquoi) { if (this.soinDebut >= 0) { this.soinDebut = -1; this.ev('soin-coupe', { pourquoi: pourquoi }); } };
Joueur.prototype.toucher = function (deg, pourquoi) {
  this.vie = Math.max(0, this.vie - deg); this.couperSoin('coup');
  this.ev('touche', { deg: deg, pourquoi: pourquoi });
  if (this.vie <= 0) { this.mort = true; this.soinDebut = -1; this.ev('mort', { pourquoi: pourquoi }); }
};

/* faire avancer le temps de ma tablette jusqu'à t, avec la manche en cours :
   les annonces (tA) et les frappes (tI) dans l'ordre, et entre elles le tir automatique et le soin */
Joueur.prototype.avancer = function (t, M) {
  var pas = [], vus = this.vus;
  M.ev.forEach(function (e) {
    if (e.tA <= t && !vus[e.id + 'a']) pas.push({ t: e.tA, a: true, e: e });
    if (e.tI <= t && !vus[e.id + 'i']) pas.push({ t: e.tI, a: false, e: e });
  });
  pas.sort(function (x, y) { return x.t - y.t || (x.a === y.a ? x.e.id - y.e.id : (x.a ? 1 : -1)); });
  for (var k = 0; k <= pas.length; k++) {
    this.tirerJusqua(k < pas.length ? pas[k].t : t);
    if (k < pas.length) { if (pas[k].a) this.annonce(pas[k].e); else this.impact(pas[k].e); }
  }
  this.t = t;
};
Joueur.prototype.annonce = function (e) {
  this.vus[e.id + 'a'] = 1; this.t = e.tA;
  if (this.mort) return;
  if (e.k === 'carte' && e.cible === this.role) {
    this.zoneEnCours = e;
    if (e.elem !== null) { this.faible = { elem: e.elem, part: e.part === null ? 'tout' : e.part }; this.ev('garde', { id: e.id }); }
    this.ev('zone-annonce', { id: e.id });
  }
  if (e.k === 'mega') { this.megaEnCours = e; this.ev('mega-annonce', { id: e.id, moi: e.cible === this.role }); }
};
/* passer à la manche suivante : tous les temps reculent de la durée de la manche finie */
Joueur.prototype.decaler = function (D) {
  var self = this;
  ['arrivee', 'prochainTir', 'bouclierFin'].forEach(function (k) { self[k] -= D; });
  if (this.soinDebut >= 0) this.soinDebut -= D;
  this.t -= D; this.vus = {}; this.zoneEnCours = null; this.megaEnCours = null;
};
Joueur.prototype.tirerJusqua = function (t) {
  while (!this.mort) {
    /* le soin */
    if (this.soinDebut >= 0 && this.soinDebut + REG.soinDuree <= t) {
      this.t = this.soinDebut + REG.soinDuree;
      this.vie = Math.min(REG.vie, this.vie + REG.soin); this.soinDebut = -1; this.ev('soin', { vie: this.vie });
      continue;
    }
    if (this.arrivee <= t && this.zone !== this.versZone) { this.zone = this.versZone; }
    /* le tir : seulement immobile, pas en train de se soigner, avec un élément et une partie choisis, et un boss vivant */
    var prochain = Math.max(this.prochainTir, this.arrivee);
    if (this.soinDebut >= 0 || this.boss <= 0 || this.elemSel === null || this.partSel === null || prochain > t) break;
    this.t = prochain; this.prochainTir = prochain + REG.tir;
    var bonElem = this.faible.elem === 'tout' || this.faible.elem === this.elemSel;
    var bonPart = this.faible.part === 'tout' || this.faible.part === this.partSel;
    if (bonElem && bonPart && this.faible.elem !== null) {
      this.boss = Math.max(0, this.boss - 1); this.dernierTirBon = true; this.ev('tir', { bon: true });
      if (this.boss <= 0) this.ev('boss-mort');
    } else { this.dernierTirBon = false; this.ev('tir', { bon: false }); }
  }
  if (this.arrivee <= t) this.zone = this.versZone;
  this.t = Math.max(this.t, t);
};
Joueur.prototype.impact = function (e) {
  this.vus[e.id + 'i'] = 1; this.t = e.tI;
  if (this.mort) return;
  if (e.k === 'carte' && e.cible === this.role) {
    this.zoneEnCours = null;
    var z = this.arrivee <= e.tI ? this.versZone : this.zone;   // en plein déplacement : on compte d'où l'on part
    var ok = z === e.zone;
    this.ev('zone-impact', { id: e.id, ok: ok, sur: e.zone });
    if (!ok) this.toucher(REG.degZone, 'zone');
  }
  if (e.k === 'mega') {
    this.megaEnCours = null;
    if (this.bouclierAttente > 0) this.bouclierAttente--;
    if (e.cible === this.role) {
      var protege = this.bouclierFin >= e.tI;
      this.ev('mega-impact', { id: e.id, moi: true, ok: protege });
      if (protege) this.bouclierFin = -1; else this.toucher(REG.degMega, 'mega');
    } else this.ev('mega-impact', { id: e.id, moi: false, cible: e.cible });
  }
};

/* ---------- Une partie sur une tablette : les manches à la suite, les instantanés, « On reprend » ---------- */
function Partie(o) {
  this.partie = o.partie; this.vitesse = o.vitesse || 'normale'; this.role = o.role;
  this.depart = o.depart || 1; this.bossVie = o.bossVie || 'normal';
  this.essai = 1; this.m = this.depart;
  this.snaps = {};
  this.symboles = symboles(this.partie);
  this.code = {};                       // les symboles tapés (les miens arrivent tout seuls)
  this.debut = 0; this.mortManche = null;
  this.joueur = new Joueur(this.role, { bossVie: this.bossVie });
  this.charger(this.m);
}
Partie.prototype.charger = function (m) {
  this.m = m; this.M = manche(this.partie, this.essai, m, this.vitesse);
  this.snaps[m] = this.joueur.instantane();
};
/* T = secondes depuis le GO (négatif pendant les deux secondes de calme) ; la manche en cours commence à this.debut */
Partie.prototype.temps = function (T) {
  var avant = this.m, t = T - this.debut;
  while (t >= this.M.D) { var D = this.M.D; this.joueur.avancer(D, this.M); this.joueur.decaler(D); this.debut += D; t -= D; this.charger(this.m + 1); if (this.surManche) this.surManche(this.m); }
  this.joueur.avancer(t, this.M);
  if (this.joueur.mort && this.mortManche === null) this.mortManche = this.m;
  return t;
};
/* t = secondes depuis le début de la manche en cours ; rend le temps qui reste dans la manche */
Partie.prototype.avancer = function (t) {
  while (t >= this.M.D) {
    this.joueur.avancer(this.M.D, this.M);
    t -= this.M.D; this.joueur.decaler(this.M.D);
    this.charger(this.m + 1);
    if (this.surManche) this.surManche(this.m);
  }
  this.joueur.avancer(t, this.M);
  return t;
};
/* « On reprend » : on revient au début de la manche k, l'essai change (l'ordre des coups aussi), toute la vie revient */
Partie.prototype.reprendre = function (k, essai) {
  k = Math.max(this.depart, Math.min(k, this.m));
  var s = this.snaps[k] || this.joueur.instantane();
  this.essai = essai; this.debut = 0; this.mortManche = null;
  this.joueur.reset(s);
  for (var x in this.snaps) if (+x > k) delete this.snaps[x];
  this.charger(k);
};
/* les cartes que MA tablette affiche à l'instant t (j'en suis le donneur) */
Partie.prototype.cartes = function (t) {
  var me = this.role, M = this.M;
  if (this.joueur.mort) return [];
  return M.ev.filter(function (e) { return e.donneur === me && e.tA <= t && t < e.tI + (e.k === 'carte' ? 0.6 : 0.3); });
};
Partie.prototype.monSymbole = function () { return this.symboles[this.role]; };
Partie.prototype.taper = function (role, i) {
  if (role === this.role) return false;
  if (this.symboles[role] !== i) return false;
  this.code[role] = i; return true;
};
Partie.prototype.victoire = function () {
  var self = this;
  return this.joueur.boss <= 0 && ROLES.every(function (ro) { return ro === self.role || self.code[ro] === self.symboles[ro]; });
};

/* ---------- Un robot (pour les essais et pour « Voir les robots ») ----------
   Il entend une carte si son donneur est vivant, avec une probabilité p, un peu plus tard (lire, crier, comprendre). */
function Robot(j, r, o) {
  this.j = j; this.r = r; this.p = o.p; this.prochainEssai = 0;
  this.attente = [];     // ce qu'il va entendre : {t, e}
  this.entendus = {}; this.devines = {};
}
/* tCri : le moment où le donneur a fini de crier ; il comprend un peu après (ou pas) */
Robot.prototype.entendre = function (e, tCri) {
  if (this.r() < this.p) this.attente.push({ t: tCri + 0.2 + this.r() * 0.5, e: e });
};
Robot.prototype.jouer = function (t) {
  var j = this.j, self = this;
  if (j.mort) { this.attente = []; return; }
  this.attente = this.attente.filter(function (a) {
    if (a.t > t) return true;
    var e = a.e; self.entendus[e.id] = 1;
    if (e.k === 'carte') {
      j.aller(e.zone, t);
      if (e.elem !== null) {
        if (j.boss > 0) { j.choisirElem(e.elem); j.choisirPart(e.part === null ? (j.partSel === null ? 0 : j.partSel) : e.part); }
        self.prochainEssai = t + 4;
      }
    } else if (e.k === 'mega') j.bouclier(t);
    return false;
  });
  /* une frappe arrive et il ne sait pas où : il tente sa chance */
  var z = j.zoneEnCours;
  if (z && !this.devines[z.id] && !this.entendus[z.id] && t > z.tA + 1.8 && !this.attente.some(function (a) { return a.e.id === z.id; })) {
    this.devines[z.id] = 1; j.aller(entier(this.r, 3), t);
  }
  /* pas d'élément, ou ça ne fait rien : il essaie autre chose */
  if (j.boss > 0 && (j.elemSel === null || j.partSel === null)) { j.choisirElem(entier(this.r, 3)); j.choisirPart(entier(this.r, 4)); }
  if (j.boss > 0 && t > this.prochainEssai && j.dernierTirBon === false) {
    j.choisirElem(entier(this.r, 3)); j.choisirPart(entier(this.r, 4)); this.prochainEssai = t + 1.3; j.dernierTirBon = null;
  }
  /* se soigner quand il est bas et que rien n'arrive sur lui */
  if (j.vie <= 45 && j.soinDebut < 0 && j.immobile(t)) {
    var calme = !j.zoneEnCours || j.zoneEnCours.tI - t > REG.soinDuree + 0.2;
    var megaMoi = j.megaEnCours && j.megaEnCours.cible === j.role;
    if (calme && !megaMoi) j.soigner(t);
  }
};

/* ---------- Une table de quatre robots (les essais, et « Voir les robots ») ----------
   Les quatre tablettes avancent ensemble ; quand une carte s'affiche chez un donneur vivant, il la crie
   (une à la fois : sa voix est occupée environ une seconde par carte), et le receveur l'entend avec la probabilité p. */
function Table(o) {
  var self = this;
  this.o = o; this.t = 0; this.r = rngDe('robots|' + (o.graine || 1));
  this.parties = {}; this.robots = {}; this.voix = {}; this.cries = {};
  ROLES.forEach(function (ro) {
    var P = new Partie({ partie: o.partie, vitesse: o.vitesse, role: ro, depart: o.depart, bossVie: o.bossVie });
    self.parties[ro] = P;
    self.robots[ro] = new Robot(P.joueur, rngDe('robot|' + ro + '|' + (o.graine || 1)), { p: (o.p && o.p[ro] !== undefined) ? o.p[ro] : (o.pTous !== undefined ? o.pTous : 0.95) });
    self.voix[ro] = 0;
  });
}
Table.prototype.M = function () { return this.parties.sage.M; };
Table.prototype.pas = function (dt) {
  var self = this, M = this.M();
  this.t += dt;
  if (this.t >= M.D) {
    ROLES.forEach(function (ro) { self.parties[ro].avancer(self.t); });
    this.t -= M.D; this.cries = {};
    ROLES.forEach(function (ro) { self.voix[ro] = Math.min(0, self.voix[ro] - M.D); });
    if (this.surManche) this.surManche(this.M().m);
  }
  var t = this.t;
  ROLES.forEach(function (ro) {
    var P = self.parties[ro];
    P.avancer(t);
    P.cartes(t).forEach(function (e) {
      if (self.cries[e.id]) return;
      var debut = Math.max(e.tA + 0.4, self.voix[ro]), fin = debut + (e.k === 'mega' ? 0.7 : 1.1);
      self.cries[e.id] = fin; self.voix[ro] = fin;
      if (!self.parties[e.cible].joueur.mort) self.robots[e.cible].entendre(e, fin);
    });
  });
  ROLES.forEach(function (ro) { self.robots[ro].jouer(t); });
};
Table.prototype.morts = function () { var self = this; return ROLES.filter(function (ro) { return self.parties[ro].joueur.mort; }); };
Table.prototype.reprendre = function (k) {
  var self = this, essai = this.parties.sage.essai + 1;
  ROLES.forEach(function (ro) {
    self.parties[ro].reprendre(k, essai);
    self.robots[ro] = new Robot(self.parties[ro].joueur, rngDe('robot|' + ro + '|' + essai + '|' + (self.o.graine || 1)), { p: self.robots[ro].p });
    self.voix[ro] = 0;
  });
  this.t = -REG.lancement; this.cries = {};
};

G.P3 = { ROLES: ROLES, R: R, ANNEAU: ANNEAU, ZONES: ZONES, ELEMS: ELEMS, PARTIES: PARTIES, SYMB: SYMB, REG: REG, VITESSES: VITESSES,
  hash: hash, rngDe: rngDe, derangement: derangement, enPaires: enPaires, symboles: symboles, niveau: niveau, manche: manche,
  Joueur: Joueur, Partie: Partie, Robot: Robot, Table: Table };
if (typeof module !== 'undefined') module.exports = G.P3;
})(typeof window !== 'undefined' ? window : globalThis);
