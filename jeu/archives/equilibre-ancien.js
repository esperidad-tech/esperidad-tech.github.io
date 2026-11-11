#!/usr/bin/env node
/* ==========================================================================
   Brumeval — analyse d'équilibrage (actions, difficulté, progression)
   --------------------------------------------------------------------------
   UNE SEULE COMMANDE, depuis le dossier du jeu :

       node tools/equilibre.js

   Options :
       node tools/equilibre.js 2 3          seulement les enquêtes 2 et 3
       node tools/equilibre.js --n 10000    nombre de parties simulées (défaut 1500 ; environ 5 minutes en tout)
       node tools/equilibre.js --rejeu code règle de rejeu d'un mini-jeu raté :
                                            prevu  = revenir à un autre moment (1 action)  [défaut]
                                            action = rejouer tout de suite pour 1 action
                                            code   = rejouer tout de suite gratuitement (moteur actuel)
       node tools/equilibre.js --json r.json  écrit aussi tous les résultats bruts
       node tools/equilibre.js --reglages   montre ce que chaque mod change dans chaque mini-jeu
       node tools/equilibre.js --vite       moins de parties (500), pour essayer vite

   Ce que l'outil lit (rien n'est modifié) :
       src/donnees.js                       rôles, talents, objets, potions, recettes, seuils d'XP
       src/e1.js, src/e2.js, … (toutes)     les enquêtes : lieux, habitants, pages, faits
       src/mj-core.js                       MJ.CALIBRAGE (niveaux validés des mini-jeux)
       tools/proba-minijeux.json            chances de réussite SUPPOSÉES (à recalibrer)

   Ce qu'il calcule :
       1. Pour chaque enquête : les faits, les mini-jeux qui les gardent, les combinaisons
          minimales de faits qui suffisent, et les actions nécessaires par rôle.
       2. Une simulation (Monte-Carlo) de l'équipe qui joue : actions dépensées, actions
          qui manquent, mini-jeux réussis ou ratés, potions, accusation (avec 3 essais
          et le message « une partie est juste »), pour plusieurs équipes et plusieurs
          règles d'actions.
       3. La progression des héros (XP, or, talents, achats raisonnables) et la chance de
          réussir chaque mini-jeu aux enquêtes 1, 3, 5, 7 et 9, avec les objets qui
          rendent un jeu presque gratuit.
       4. Une projection des enquêtes 4 à 9 (pas encore écrites) et la chance de finir la
          saison sans devoir tout recommencer.

   Tout ce qui est réglable est dans la partie « RÉGLAGES DE L'ANALYSE » juste en dessous.
   ========================================================================== */
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm');
const ICI = __dirname, RACINE = path.join(ICI, '..'), SRC = path.join(RACINE, 'src');
const ROLES = ['pisteur', 'alchimiste', 'barde', 'sage'];
const ORDRE_JEU = ['sage', 'barde', 'pisteur', 'alchimiste'];   /* ordre dans un « tour » : le Sage lit et donne d'abord */

/* ==========================================================================
   RÉGLAGES DE L'ANALYSE (modifiables)
   ========================================================================== */
const CONFIG = {
  parties: 1500,
  graine: 20261102,
  essaisAccusation: 3,             /* moteur actuel : 3 accusations ratées = perdu (et, en saison, tout recommencer) */
  rejeu: 'prevu',
  essaisGratuitsMax: 3,            /* quand un rejeu est gratuit (règle 'code', pages du Sage sans action) : 3 essais au plus par moment */

  /* Les équipes : quel profil de joueur (voir proba-minijeux.json) joue chaque rôle.
     « famille » : supposition sur qui joue quoi (Alicia = Alchimiste, c'est dans les notes ; le reste est à corriger). */
  equipes: {
    enfants:        {nom:'4 enfants de 8 ans',            pisteur:'enfant', alchimiste:'enfant', barde:'enfant', sage:'enfant', raisonnement:'enfants'},
    famille:        {nom:'Famille (Naïm Pisteur, Alicia Alchimiste, Siham Barde, Romain Sage)', pisteur:'naim', alchimiste:'enfant', barde:'adulte_moyen', sage:'adulte_moyen', raisonnement:'famille'},
    adultes_moyens: {nom:'4 adultes moyens (comme Romain)', pisteur:'adulte_moyen', alchimiste:'adulte_moyen', barde:'adulte_moyen', sage:'adulte_moyen', raisonnement:'adultes_moyens'},
    adultes_forts:  {nom:'4 adultes forts',               pisteur:'adulte_fort', alchimiste:'adulte_fort', barde:'adulte_fort', sage:'adulte_fort', raisonnement:'adultes_forts'}
  },

  /* Les règles d'actions comparées.
     actions = actions par moment pour chaque rôle ; reserve = actions que le Sage peut donner (par enquête) ;
     plafondDon = dons au plus par joueur et par moment ; difficulte = 'auto' applique la règle autoDifficulte ;
     essais = accusations permises ; partiel = chance qu'un mini-jeu d'indice raté donne quand même l'indice (indice partiel). */
  scenarios: {
    actuel:      {nom:'Actuel : 2 actions par moment pour tous', actions:{pisteur:2, alchimiste:2, barde:2, sage:2}, reserve:0},
    alchi3:      {nom:'Alchimiste 3, les autres 2', actions:{pisteur:2, alchimiste:3, barde:2, sage:2}, reserve:0},
    tous3:       {nom:'3 actions par moment pour tous', actions:{pisteur:3, alchimiste:3, barde:3, sage:3}, reserve:0},
    reserve:     {nom:'2 pour tous + réserve du Sage (1 par moment, à donner)', actions:{pisteur:2, alchimiste:2, barde:2, sage:2}, reserve:'moments', plafondDon:1},
    sage_donne:  {nom:'2 pour tous, le Sage peut donner ses propres actions', actions:{pisteur:2, alchimiste:2, barde:2, sage:2}, reserve:0, donSage:true, plafondDon:1},
    propose:     {nom:'PROPOSÉ : Alchimiste 3, les autres 2, + réserve du Sage (= nombre de moments)', actions:{pisteur:2, alchimiste:3, barde:2, sage:2}, reserve:'moments', plafondDon:1},
    propose_auto:{nom:'PROPOSÉ + difficulté automatique', actions:{pisteur:2, alchimiste:3, barde:2, sage:2}, reserve:'moments', plafondDon:1, difficulte:'auto'},
    propose_filets:{nom:'PROPOSÉ + difficulté auto + filets (potion = 1 essai, Sage dévoile 1 indice)', actions:{pisteur:2, alchimiste:3, barde:2, sage:2}, reserve:'moments', plafondDon:1, difficulte:'auto', essaiPotion:1, indiceSage:1}
  },

  /* Difficulté automatique proposée (voir EQUILIBRE.md). Clé = composition de l'équipe.
     niveau = décalage du niveau des mini-jeux (négatif = plus facile) selon que le joueur est enfant ou adulte ;
     actionsEnPlus = actions en plus par moment pour chaque joueur ; reserveEnPlus = réserve du Sage en plus ;
     essais = accusations permises ; partiel = indice partiel quand un mini-jeu d'indice est raté. */
  autoDifficulte: {
    enfants: {niveau:{enfant:-2, adulte:0},  actionsEnPlus:1, reserveEnPlus:1, essais:3, partiel:0.5},
    mixte:   {niveau:{enfant:-1, adulte:0},  actionsEnPlus:0, reserveEnPlus:0, essais:3, partiel:0.5},
    adultes: {niveau:{enfant:0,  adulte:+1}, actionsEnPlus:0, reserveEnPlus:0, essais:3, partiel:0}
  },
  /* Le coup de pouce « enfant » s'efface quand l'équipement monte : ajouté au décalage enfant, par enquête */
  effacementEnfant: {1:0, 2:0, 3:0, 4:0.5, 5:0.5, 6:1, 7:1, 8:1, 9:1},

  /* Économie (moteur actuel : commencerFin) */
  economie: {
    xpVictoire: 130,             /* 100 + carnet (2 par note, 30 au plus : presque toujours atteint) */
    orVictoire: 50,              /* moins 5 par fausse accusation */
    orBonusDefaut: 20,           /* pour les enquêtes pas encore écrites : une mission bonus par rôle */
    missionsDefaut: 1
  },

  /* Achats « raisonnables » : on achète dans cet ordre dès que c'est permis (palier) et payable ; sinon on économise. */
  achats: {
    pisteur:    {talents:{2:'pistage', 4:'reflexes', 6:'camouflage', 8:'tir', 10:'scene'},
                 liste:['lanterne_sourde', 'gants_pisteur', 'bottes_souples', 'arc_court', 'cape_rodeur', 'bottes_vent', 'carquois', 'lanterne_lune', 'masque_ombre', 'arc_argent']},
    alchimiste: {talents:{2:'potionniste', 4:'mainsure', 6:'empreintes', 8:'antidote', 10:'ultime'},
                 liste:['thermometre', 'fioles_renf', 'herbier', 'sac_herbo', 'alambic', 'lunettes_alchi', 'chaudron_cuivre', 'balance_or', 'serre']},
    barde:      {talents:{2:'conteur', 4:'oreille', 6:'ragots', 8:'memoire', 10:'ballade'},
                 liste:['clochette', 'carnet_ragots', 'luth_voyage', 'bonbons', 'pendule', 'cornet', 'carillon', 'miroir']},
    sage:       {talents:{2:'stratege', 4:'dechiffreur', 6:'tableau', 8:'protection', 10:'verification'},
                 liste:['loupe_lecture', 'plume_encre', 'lunettes_sage', 'sablier', 'pierre_runes', 'cle_archives', 'banniere', 'chapeau_etoile', 'baton_cristal']}
  },

  /* Seuils d'XP proposés (un niveau par enquête : niveau N au début de l'enquête N) */
  seuilsProposes: [0, 120, 250, 380, 510, 640, 770, 900, 1030, 1160],

  /* Nouveautés de la saison (DESIGN-saison1.md) : actions OPTIONNELLES par enquête que chaque rôle aimerait faire.
     Estimations, à corriger quand le document de conception sera fini. */
  saison: {
    alchimiste: {nom:'cueillettes rares (1 à 3 essais, 1 action chacun) + nuisibles', actions:3},
    pisteur:    {nom:'coffres', actions:1},
    barde:      {nom:'(rien de nouveau)', actions:0},
    sage:       {nom:'jeu des couleurs comme outil d\'enquête', actions:1}
  },

  /* Projection de la saison selon DESIGN-saison1.md : les indices « clés de voûte » de chaque enquête
     (sans eux, plus une seule solution), le mini-jeu qui les garde, combien d'essais, et si un raté donne un indice partiel.
     E1 à E3 : tels que réécrits dans le document ; E4 à E9 : la règle du document (3 clés de voûte sur 3 rôles, un seul essai,
     jamais d'indice partiel), avec le rôle en vedette (Bible). partiel = chance qu'un indice partiel suffise quand même. */
  projection: {
    1: {cles:[['pisteur', 'traces', 3, 0.5]]},
    2: {cles:[['alchimiste', 'chaudron', 2, 0], ['alchimiste', 'bulles', 2, 0.3]]},
    3: {cles:[['pisteur', 'traces', 2, 0.3], ['alchimiste', 'double', 2, 0.3], ['sage', 'grille', 2, 0.3]]},
    4: {cles:[['pisteur', 'cachette', 1, 0], ['alchimiste', 'melange', 1, 0], ['sage', 'plans', 1, 0]]},
    5: {cles:[['alchimiste', 'chaudron', 1, 0], ['barde', 'mots', 1, 0], ['sage', 'grille', 1, 0]]},
    6: {cles:[['barde', 'mensonge', 1, 0], ['pisteur', 'traces', 1, 0], ['alchimiste', 'bulles', 1, 0]]},
    7: {cles:[['sage', 'alphabet', 1, 0], ['barde', 'mots', 1, 0], ['pisteur', 'tir', 1, 0]]},
    8: {cles:[['pisteur', 'poursuite', 1, 0], ['alchimiste', 'double', 1, 0], ['sage', 'runes', 1, 0]]},
    9: {cles:[['barde', 'mensonge', 1, 0], ['alchimiste', 'differences', 1, 0], ['pisteur', 'cachette', 1, 0]]}
  },
  /* Pouvoirs de secours du Sage (document de design, § 2.4), par enquête */
  pouvoirsSage: {encoreUneFois:1, souffler:1, soufflerSuffit:0.5},
  /* Le mini-jeu « typique » qui garde un indice, par rôle (pour la projection) */
  jeuTypique: {pisteur:'traces', alchimiste:'differences', barde:'mensonge', sage:'plans'}
};

/* Valeurs utilisées par les joueurs simulés pour choisir leur action (plus c'est haut, plus c'est prioritaire) */
const V = {FAIT:10, PREREQ:8, POTION:7, PLANTES:6, BONUS:3, SAISON:2.5, CONTENU:1.5, AIDE_POTION:2};

/* ==========================================================================
   Lecture des arguments
   ========================================================================== */
const ARGS = process.argv.slice(2);
const OPT = {enquetes:[], json:null, reglages:false};
for(let i = 0; i < ARGS.length; i++){
  const a = ARGS[i];
  if(a === '--n') CONFIG.parties = +ARGS[++i];
  else if(a === '--rejeu') CONFIG.rejeu = ARGS[++i];
  else if(a === '--json') OPT.json = ARGS[++i];
  else if(a === '--reglages' || a === '--mods') OPT.reglages = true;
  else if(a === '--vite') CONFIG.parties = 500;
  else if(a === '--graine') CONFIG.graine = +ARGS[++i];
  else if(/^\d+$/.test(a)) OPT.enquetes.push(+a);
}

/* ==========================================================================
   Chargement des données du jeu (sans rien modifier)
   ========================================================================== */
function charger(){
  const ctx = {console, Math, JSON};
  ctx.window = ctx;
  vm.createContext(ctx);
  const lire = f => vm.runInContext(fs.readFileSync(path.join(SRC, f), 'utf8'), ctx, {filename:f});
  lire('donnees.js');
  try{ lire('mj-core.js'); }catch(e){ console.log('(mj-core.js illisible : calibrage par défaut)', e.message); }
  const fichiers = fs.readdirSync(SRC).filter(f => /^e\d+\.js$/.test(f)).sort((a, b) => parseInt(a.slice(1)) - parseInt(b.slice(1)));
  fichiers.forEach(lire);
  return {D:ctx.window.DONNEES, ENQ:ctx.window.ENQUETES || {}, CAL:(ctx.window.MJ && ctx.window.MJ.CALIBRAGE) || {}, fichiers};
}
const {D, ENQ, CAL, fichiers} = charger();
const PR = JSON.parse(fs.readFileSync(path.join(ICI, 'proba-minijeux.json'), 'utf8'));

/* ==========================================================================
   Hasard reproductible
   ========================================================================== */
function hasard(graine){
  let s = (graine >>> 0) || 1;
  return function(){ s ^= s << 13; s >>>= 0; s ^= s >>> 17; s ^= s << 5; s >>>= 0; return s / 4294967296; };
}

/* ==========================================================================
   Chances de réussite des mini-jeux
   ========================================================================== */
function niveauValide(type){ const c = CAL[type]; return c && c.decalage ? Math.min(10, 3 + c.decalage) : 10; }
/* Niveau de départ d'un mini-jeu, comme MJ.reglages : niveau de l'enquête + 2 + calibrage, plafonné à 10 ;
   « fixe » (moteur depuis le 2 novembre) : toujours le niveau validé. plafondValide = forcer le niveau validé pour tous. */
function niveauBase(type, niveauEnquete, plafondValide){
  const c = CAL[type] || {}, cal = c.decalage || 0;
  let n = niveauEnquete + 2 + cal;
  if(c.fixe) n = 3 + cal;
  if(cal) n = Math.min(n, 10);
  if(plafondValide && cal) n = Math.min(n, niveauValide(type));
  return n;
}
function regleMod(cle, type){
  const r = PR.mods[cle]; if(!r || typeof r !== 'object' || cle.charAt(0) === '_') return null;
  const j = (r.jeux && r.jeux[type]) || {};
  return Object.assign({}, r, j);
}
/* Mods → niveaux en moins (négatif = plus facile). Renvoie aussi le détail. */
function decalageMods(type, mods){
  let total = 0; const detail = [];
  for(const k of Object.keys(mods || {})){
    const v = mods[k], r = regleMod(k, type);
    if(!r || v === undefined || v === null || v === false) continue;
    let d = 0;
    if(r.type === 'lineaire') d = (r.parUnite || 0) * (typeof v === 'number' ? v : 1);
    else if(r.type === 'facteur'){ if(typeof v === 'number' && v > 0) d = r.parPas * Math.log(v) / Math.log(r.base); }
    else if(r.type === 'oui') d = v ? (r.valeur || 0) : 0;
    if(r.max !== undefined) d = Math.max(r.max, d);
    if(d){ total += d; detail.push(k + ' ' + d.toFixed(1)); }
  }
  return {total, detail};
}
function niveau50(profil, type){
  const P = PR.profils[profil], J = PR.jeux[type] || {famille:'action'};
  const ecart = (P.jeux && P.jeux[type] !== undefined) ? P.jeux[type] : (P.ecart[J.famille] !== undefined ? P.ecart[J.famille] : 0);
  return niveauValide(type) + ecart;
}
function chanceNiveau(profil, type, niveauEff){
  return 1 / (1 + Math.exp(PR.pente * (niveauEff - niveau50(profil, type))));
}

/* ==========================================================================
   Héros : talents, objets, ensembles (comme M.sources / M.modsPour / M.acces)
   ========================================================================== */
function sourcesFx(lo){
  const l = [];
  (lo.talents || []).forEach(id => { const t = D.TALENTS[id]; if(t) l.push({id, nom:t.nom, fx:t.fx || {}, type:'talent'}); });
  const compte = {};
  (lo.equip || []).forEach(id => { const o = D.OBJETS[id]; if(o){ l.push({id, nom:o.nom, fx:o.fx || {}, type:'objet'}); if(o.ens) compte[o.ens] = (compte[o.ens] || 0) + 1; } });
  Object.keys(compte).filter(e => compte[e] >= 3).forEach(e => { const E = D.ENSEMBLES[e]; l.push({id:'ens:' + e, nom:'Ensemble ' + E.nom, fx:E.fx || {}, type:'ensemble'}); });
  return l;
}
function fxSomme(lo, cle){ return sourcesFx(lo).reduce((s, x) => s + (typeof x.fx[cle] === 'number' ? x.fx[cle] : 0), 0); }
function fxVrai(lo, cle){ return sourcesFx(lo).some(x => !!x.fx[cle]); }
function accesLo(lo, cle){ return sourcesFx(lo).some(x => (x.fx.acces || []).indexOf(cle) >= 0); }
function ajouterMods(mods, m){
  if(!m) return;
  for(const k of Object.keys(m)){
    const v = m[k];
    if(typeof v === 'number'){ if(k === 'lent' || k === 'zone') mods[k] = (mods[k] || 1) * v; else mods[k] = (mods[k] || 0) + v; }
    else mods[k] = mods[k] || v;
  }
}
function modsPour(lo, type, potionId){
  const mods = {}, aides = [];
  for(const x of sourcesFx(lo)){
    let m = null;
    if(type === 'chaudron' && x.fx.mj) m = x.fx.mj.chaudron || x.fx.mj.temperature || x.fx.mj.rythme || x.fx.mj.melange || x.fx.mj.bulles;
    else if(x.fx.mj && x.fx.mj[type]) m = x.fx.mj[type];
    if(m){ ajouterMods(mods, m); aides.push(x.nom); }
    if(x.fx.mjTous && PR.jeux[type] && PR.jeux[type].minuteur !== false){ ajouterMods(mods, x.fx.mjTous); aides.push(x.nom); }
  }
  if(potionId){ const p = D.POTIONS[potionId]; if(p && p.fx.mj && p.fx.mj[type]){ ajouterMods(mods, p.fx.mj[type]); aides.push(p.nom); } }
  return {mods, aides};
}
function autoPour(lo, type){ return sourcesFx(lo).reduce((s, x) => s + ((x.fx.auto && x.fx.auto[type]) || 0), 0); }
function recettesConnues(E, lo){
  const l = new Set(D.RECETTES_DE_BASE.concat(E.recettes || []));
  sourcesFx(lo).forEach(x => (x.fx.recettes || []).forEach(r => l.add(r)));
  return l;
}

/* ==========================================================================
   Lecture d'une enquête : sources d'indices, prérequis, producteurs de codes
   ========================================================================== */
function estMaison(l){ return /^[LFB]\d$/.test(l || ''); }
function preparer(E){
  const info = {}, prod = {};
  const ajouterProd = (code, cle) => { if(code) (prod[code] = prod[code] || []).push(cle); };
  for(const lieu of Object.keys(E.lieux || {})){
    const L = E.lieux[lieu];
    for(const role of ['pisteur', 'sage']){
      if(!L[role] || !L[role].points) continue;
      const verrou = L.verrou && (!L.verrou.roles || L.verrou.roles.includes(role)) ? L.verrou.besoin : null;
      for(const p of L[role].points){
        const cle = `${role}:${lieu}:${p.id}`;
        const produit = [p.obj ? 'obj:' + p.obj : null, p.donne || null].filter(Boolean);
        info[cle] = {cle, role, kind:'point', lieu, p, mj:p.mj || null, moments:p.moments || null, besoins:[verrou, p.besoin].filter(Boolean), produit, or:p.or || 0};
        produit.forEach(c => ajouterProd(c, cle));
      }
    }
  }
  for(const id of Object.keys(E.pnj || {})){
    (E.pnj[id].questions || []).forEach((q, i) => {
      const cle = `barde:${id}:${i}`;
      const produit = [q.obj ? 'obj:' + q.obj : null, q.donne || null].filter(Boolean);
      info[cle] = {cle, role:'barde', kind:'question', pnj:id, i, q, besoins:[q.besoin].filter(Boolean), produit};
      produit.forEach(c => ajouterProd(c, cle));
      if(q.ment) info[cle + ':verite'] = {cle:cle + ':verite', role:'barde', kind:'verite', pnj:id, i, base:cle, besoins:[[{cle}]], produit:[], mj:'mensonge'};
    });
  }
  for(const id of Object.keys(E.analyses || {})){
    const A = E.analyses[id], cle = `alchimiste:analyse:${id}`;
    info[cle] = {cle, role:'alchimiste', kind:'analyse', obj:id, mj:A.mj || null, besoins:[[{code:'obj:' + id}]], produit:[A.donne || null].filter(Boolean)};
    if(A.donne) ajouterProd(A.donne, cle);
  }
  for(const p of E.pages || []){
    const cle = `sage:page:${p.id}`;
    info[cle] = {cle, role:'sage', kind:'page', page:p, mj:p.mj || null, action:!!p.action, besoins:[p.besoin].filter(Boolean), produit:[p.donne || null].filter(Boolean)};
    if(p.donne) ajouterProd(p.donne, cle);
  }
  for(const x of E.ecoutes || []){
    const cle = `${x.role}:ecoute:${x.id}`;
    info[cle] = {cle, role:x.role, kind:'ecoute', x, lieu:x.lieu, mj:x.mj || null, moments:x.moments || null, besoins:[x.besoin].filter(Boolean), produit:[]};
  }
  /* lieux de cueillette */
  const cueillette = {};
  for(const lieu of Object.keys(E.lieux || {})){
    const L = E.lieux[lieu];
    if(L.alchimiste && L.alchimiste.cueillir) cueillette[lieu] = L.alchimiste.cueillir;
  }
  return {E, info, prod, cueillette, faits:E.faits || []};
}

/* ---------- Candidats restants et accusation ---------- */
function itemOk(item, obtenu){ return Array.isArray(item) ? item.some(x => obtenu.has(x)) : obtenu.has(item); }
function faitOk(f, obtenu){ return f.sources.every(s => itemOk(s, obtenu)); }
function candidats(E, obtenu, faitsForces){
  const reste = {qui:new Set(E.qui.choix)};
  if(E.ou) reste.ou = new Set(E.ou.choix.map(x => x.id));
  if(E.quoi) reste.quoi = new Set(E.quoi.choix.map(x => x.id));
  E.faits.forEach((f, i) => {
    if(!(faitsForces ? faitsForces.has(i) : faitOk(f, obtenu))) return;
    for(const d of ['qui', 'ou', 'quoi']) (f[d] || []).forEach(x => reste[d] && reste[d].delete(x));
  });
  return reste;
}
/* Hypothèses = combinaisons possibles (qui, où, quoi) */
function hypotheses(reste){
  const dims = Object.keys(reste);
  let l = [[]];
  dims.forEach(d => { const n = []; l.forEach(h => reste[d].forEach(v => n.push(h.concat([v])))); l = n; });
  return l;
}
/* Meilleure stratégie d'accusation avec le retour « une partie est juste / rien n'est juste ».
   Renvoie la répartition [P(gagner au 1er essai), P(au 2e), …]. Mémorisé. */
const memoAcc = new Map();
function repartitionAccusation(H, t){
  const n = H.length;
  if(t <= 0 || n === 0) return [];
  if(n === 1) return [1];
  const cle = t + '|' + H.map(h => h.join(',')).sort().join(';');
  if(memoAcc.has(cle)) return memoAcc.get(cle).slice();
  let best = null, bestP = -1;
  /* au-delà de 12 possibilités on ne cherche pas le meilleur premier essai (dans les gabarits, tous se valent) */
  for(const g of (n > 12 ? [H[0]] : H)){
    const part = [], rien = [];
    for(const h of H){
      if(h === g) continue;
      const justes = h.reduce((s, v, k) => s + (v === g[k] ? 1 : 0), 0);
      if(h.length > 1 && justes > 0) part.push(h); else rien.push(h);
    }
    const dist = [1 / n];
    const dp = repartitionAccusation(part, t - 1), dr = repartitionAccusation(rien, t - 1);
    for(let k = 0; k < t - 1; k++) dist.push((dp[k] || 0) * part.length / n + (dr[k] || 0) * rien.length / n);
    const p = dist.reduce((a, b) => a + b, 0);
    if(p > bestP + 1e-12){ bestP = p; best = dist; }
  }
  memoAcc.set(cle, best);
  return best.slice();
}

/* ==========================================================================
   Progression des héros sur la saison (XP, or, talents, achats)
   ========================================================================== */
function niveauDe(xp, seuils){ let n = 1; seuils.forEach((s, i) => { if(xp >= s) n = i + 1; }); return n; }
function bonusDeLEnquete(k, role){
  const E = ENQ[k];
  if(E && E.bonus) return E.bonus.filter(b => b.role === role).map(b => ({mj:b.mj, or:b.or}));
  const jeux = Object.keys(PR.jeux).filter(t => PR.jeux[t].role === role);
  const l = [];
  for(let i = 0; i < CONFIG.economie.missionsDefaut; i++) l.push({mj:jeux[(k + i) % jeux.length], or:CONFIG.economie.orBonusDefaut});
  return l;
}
/* Progression d'un rôle joué par un profil. Renvoie pour chaque enquête 1..10 l'état AU DÉBUT de l'enquête. */
function progression(role, profil, opts){
  opts = opts || {};
  const seuils = opts.seuils || D.SEUILS, A = CONFIG.achats[role];
  let xp = 0, or = 0; const lo = {talents:[], equip:[]};
  const etats = {};
  for(let k = 1; k <= 10; k++){
    const niv = niveauDe(xp, seuils);
    [2, 4, 6, 8, 10].forEach(p => { if(niv >= p && A.talents[p] && !lo.talents.includes(A.talents[p])) lo.talents.push(A.talents[p]); });
    for(const id of A.liste){
      if(lo.equip.includes(id)) continue;
      const o = D.OBJETS[id]; if(!o) continue;
      if(niv < D.PALIER_NIVEAU[o.palier]) continue;
      if(or < o.prix) break;
      or -= o.prix; lo.equip.push(id);
    }
    etats[k] = {k, xp, niveau:niv, or, talents:lo.talents.slice(), equip:lo.equip.slice()};
    /* gains de l'enquête k : victoire + missions bonus réussies (en moyenne) */
    xp += CONFIG.economie.xpVictoire;
    or += CONFIG.economie.orVictoire;
    for(const b of bonusDeLEnquete(k, role)){
      const p = chanceJeu(profil, b.mj, k, {talents:lo.talents, equip:lo.equip}, null, opts).p;
      or += b.or * p;
    }
  }
  return etats;
}
/* Chance de réussir un mini-jeu, pour un profil, à l'enquête k, avec un équipement */
function chanceJeu(profil, type, k, lo, potion, opts){
  opts = opts || {};
  const base = niveauBase(type, k, opts.plafondValide) + (opts.decalage || 0);
  const mm = modsPour(lo || {}, type, potion);
  const dm = decalageMods(type, mm.mods);
  const eff = Math.max(1, base + dm.total);
  let p = chanceNiveau(profil, type, eff);
  const chances = fxSomme(lo || {}, 'chance');
  const auto = autoPour(lo || {}, type);
  return {p, base, eff, decal:dm.total, detail:dm.detail, aides:mm.aides, chances, auto, pAvecChance:1 - (1 - p) * (1 - p)};
}

/* ==========================================================================
   Simulation d'une enquête jouée par une équipe
   ========================================================================== */
function equipeType(equipe){
  const enf = ROLES.filter(r => /enfant|naim/.test(equipe[r])).length;
  return enf === 4 ? 'enfants' : enf === 0 ? 'adultes' : 'mixte';
}
function reglesScenario(scenario, equipe, E){
  const nM = E.moments.length;
  const r = {actions:Object.assign({}, scenario.actions), reserve:0, plafondDon:scenario.plafondDon || 99, essais:scenario.essais || CONFIG.essaisAccusation, partiel:scenario.partiel || 0, decalage:{},
    donSage:!!scenario.donSage, essaiPotion:scenario.essaiPotion || 0, indiceSage:scenario.indiceSage || 0};
  const res = scenario.reserve;
  r.reserve = res === 'moments' ? nM : res === 'moments+1' ? nM + 1 : (+res || 0);
  ROLES.forEach(x => { r.decalage[x] = 0; });
  if(scenario.difficulte === 'auto'){
    const A = CONFIG.autoDifficulte[equipeType(equipe)];
    ROLES.forEach(x => {
      const enfant = /enfant|naim/.test(equipe[x]);
      r.decalage[x] = A.niveau[enfant ? 'enfant' : 'adulte'];
      if(enfant && r.decalage[x] < 0) r.decalage[x] = Math.min(0, r.decalage[x] + (CONFIG.effacementEnfant[E.niveau || E.id] || 0));
      r.actions[x] += A.actionsEnPlus;
    });
    r.reserve += A.reserveEnPlus; r.essais = A.essais; r.partiel = A.partiel;
  }
  r.essais += r.essaiPotion;
  return r;
}

function simulerUne(prep, equipe, scenario, los, R, opts){
  const E = prep.E, info = prep.info, nM = E.moments.length;
  const regles = reglesScenario(scenario, equipe, E);
  const S = {
    mi:0, sources:new Set(), codes:{}, potions:{}, bues:{}, vus:{}, explore:{}, conv:{}, demasque:{}, analyses:new Set(),
    pages:new Set(), ecoutes:new Set(), bonus:{}, ingr:{}, fioles:3, plantes:new Set(opts.plantesConnues || []), cueilli:{},
    actions:{}, chances:{}, auto:{}, verite:{}, essaisLibres:{}, reserve:regles.reserve, dons:{}, attente:[], saison:{}, veut:{},
    st:{}
  };
  ROLES.forEach(r => {
    S.codes[r] = new Set(); S.potions[r] = {}; S.bues[r] = {};
    S.chances[r] = fxSomme(los[r], 'chance');
    S.auto[r] = {}; Object.keys(PR.jeux).forEach(t => { const a = autoPour(los[r], t); if(a) S.auto[r][t] = a; });
    S.verite[r] = fxSomme(los[r], 'verite');
    S.st[r] = {critique:0, optionnel:0, vide:0, inutilise:0, bloque:0, recu:0, mj:0, mjOk:0, orBonus:0, bonusTentes:0, bonusOk:0, demande:0, critM:E.moments.map(() => 0), demM:E.moments.map(() => 0)};
    S.temps = S.temps || {}; S.temps[r] = 0;
  });
  const dep = (E.depart && E.depart.alchimiste && E.depart.alchimiste.ingr) || {};
  Object.keys(dep).forEach(k => { S.ingr[k] = (S.ingr[k] || 0) + dep[k]; });
  S.fioles = 3 + fxSomme(los.alchimiste, 'fiolesBonus');
  const recettes = recettesConnues(E, los.alchimiste);
  const mid = () => E.moments[S.mi];
  const restants = liste => liste ? E.moments.slice(S.mi).filter(m => liste.includes(m)).length : nM - S.mi;
  const pCache = {};
  function chance(r, type, potion){
    const k = r + type + (potion || '');
    if(pCache[k] === undefined){
      const c = chanceJeu(equipe[r], type, E.niveau, los[r], potion, {plafondValide:opts.plafondValide, decalage:regles.decalage[r]});
      pCache[k] = c.p;
    }
    return pCache[k];
  }
  /* ----- conditions ----- */
  function potionAcces(r, acces){
    return Object.keys(S.potions[r]).find(pid => S.potions[r][pid] > 0 && D.POTIONS[pid] && (D.POTIONS[pid].fx.acces || []).includes(acces) && D.POTIONS[pid].pour.includes(r));
  }
  function condOk(r, c, faire){
    if(c.cle) return S.sources.has(c.cle);
    if(c.page) return S.pages.has(c.page);
    if(c.code){
      if(c.code.startsWith('pot:')){ const pid = c.code.slice(4); if((S.potions[r][pid] || 0) > 0){ if(faire) faire.consomme = pid; return true; } return false; }
      return S.codes[r].has(c.code);
    }
    if(c.acces){
      if(accesLo(los[r], c.acces)) return true;
      if(Object.keys(S.bues[r]).some(pid => S.bues[r][pid] === S.mi && (D.POTIONS[pid].fx.acces || []).includes(c.acces))) return true;
      const pid = potionAcces(r, c.acces); if(pid){ if(faire) faire.boire = pid; return true; }
      return false;
    }
    if(c.talent) return (los[r].talents || []).includes(c.talent);
    if(c.objet) return (los[r].equip || []).includes(c.objet);
    if(c.moment) return mid() === c.moment;
    return false;
  }
  function besoinsOk(r, besoins, appliquer){
    for(const alt of besoins){
      let ok = false;
      for(const c of alt){ const f = {}; if(condOk(r, c, f)){ ok = true; if(appliquer){ if(f.boire){ S.potions[r][f.boire]--; S.bues[r][f.boire] = S.mi; } } break; } }
      if(!ok) return false;
    }
    if(appliquer){
      for(const alt of besoins){
        const autre = alt.some(c => !(c.code && c.code.startsWith('pot:')) && condOk(r, c));
        if(autre) continue;
        for(const c of alt) if(c.code && c.code.startsWith('pot:')){ const pid = c.code.slice(4); if(S.potions[r][pid] > 0){ S.potions[r][pid]--; break; } }
      }
    }
    return true;
  }
  function verrouOk(r, lieu){
    const L = E.lieux[lieu]; if(!L || !L.verrou) return true;
    if(L.verrou.roles && !L.verrou.roles.includes(r)) return true;
    return besoinsOk(r, [L.verrou.besoin]);
  }
  /* ----- codes donnés : arrivent au tour suivant ----- */
  function destinataires(code){
    const [t, x] = code.split(':');
    if(t === 'obj') return [E.objets[x].pour];
    if(t === 'info') return [E.infos[x].pour];
    return [];
  }
  function produire(cle){
    S.sources.add(cle);
    const inf = info[cle]; if(!inf) return;
    inf.produit.forEach(code => destinataires(code).forEach(r => S.attente.push({r, code})));
  }
  function livrer(){ S.attente.forEach(a => { S.codes[a.r].add(a.code); S.st[a.r].recu++; }); S.attente = []; }
  /* ----- mini-jeux ----- */
  const DUR = PR.durees || {actions:{}, minijeux:{}};
  function tenter(r, type, unique){
    if(!type) return true;
    S.st[r].mj++;
    S.temps[r] += DUR.minijeux[type] || 1.5;
    if(S.auto[r][type] > 0){ S.auto[r][type]--; S.st[r].mjOk++; return true; }
    const pid = Object.keys(S.potions[r]).find(k => S.potions[r][k] > 0 && D.POTIONS[k].fx.mj && D.POTIONS[k].fx.mj[type] && D.POTIONS[k].pour.includes(r));
    if(pid) S.potions[r][pid]--;
    const p = chance(r, type, pid);
    let ok = R() < p;
    if(!ok && !unique && S.chances[r] > 0){ S.chances[r]--; S.temps[r] += DUR.minijeux[type] || 1.5; ok = R() < p; }
    if(ok) S.st[r].mjOk++;
    return ok;
  }
  /* ----- ce dont l'équipe a besoin (recalculé à chaque tour) ----- */
  function besoins(){
    const src = new Map(), pots = new Map();
    const ajoute = (cle, v) => { if(S.sources.has(cle)) return false; if((src.get(cle) || 0) < v){ src.set(cle, v); return true; } return false; };
    for(const f of prep.faits){
      if(faitOk(f, S.sources)) continue;
      for(const item of f.sources){ if(itemOk(item, S.sources)) continue; (Array.isArray(item) ? item : [item]).forEach(c => ajoute(c, V.FAIT)); }
    }
    const pile = [...src.keys()], vus = new Set();
    while(pile.length){
      const cle = pile.pop(); if(vus.has(cle)) continue; vus.add(cle);
      const inf = info[cle]; if(!inf) continue;
      if(inf.kind === 'verite' && !S.sources.has(inf.base)){ if(ajoute(inf.base, V.PREREQ)) pile.push(inf.base); }
      const tous = inf.besoins.slice();
      if(inf.kind === 'point' && inf.lieu){ /* déjà dans besoins (verrou) */ }
      for(const alt of tous){
        if(alt.some(c => condOk(inf.role, c))) continue;
        for(const c of alt){
          if(c.cle){ if(ajoute(c.cle, V.PREREQ)) pile.push(c.cle); }
          else if(c.page){ const k = 'sage:page:' + c.page; if(ajoute(k, V.PREREQ)) pile.push(k); }
          else if(c.code && !c.code.startsWith('pot:')){ (prep.prod[c.code] || []).forEach(p => { if(ajoute(p, V.PREREQ)) pile.push(p); }); }
          else if(c.code && c.code.startsWith('pot:')){ const pid = c.code.slice(4); if(recettes.has(pid)) pots.set(pid, (pots.get(pid) || new Set()).add(inf.role)); }
          else if(c.acces){
            const cand = Object.keys(D.POTIONS).filter(pid => (D.POTIONS[pid].fx.acces || []).includes(c.acces) && D.POTIONS[pid].pour.includes(inf.role) && recettes.has(pid));
            cand.sort((a, b) => D.RECETTES[a].ingr.reduce((s, x) => s + x[1], 0) - D.RECETTES[b].ingr.reduce((s, x) => s + x[1], 0));
            if(cand.length) pots.set(cand[0], (pots.get(cand[0]) || new Set()).add(inf.role));
          }
        }
      }
    }
    /* une potion déjà dans les mains de celui qui en a besoin n'est plus à faire ; si l'Alchimiste l'a, il reste à la donner */
    for(const [pid, rs] of [...pots]){
      for(const r of [...rs]) if((S.potions[r][pid] || 0) > 0 || S.bues[r][pid] === S.mi) rs.delete(r);
      if(!rs.size) pots.delete(pid);
    }
    const aFaire = new Set([...pots.keys()].filter(pid => (S.potions.alchimiste[pid] || 0) < [...pots.get(pid)].filter(r => r !== 'alchimiste').length + (pots.get(pid).has('alchimiste') ? 1 : 0)));
    /* ingrédients qui manquent */
    const manque = {};
    for(const pid of aFaire) D.RECETTES[pid].ingr.forEach(([i, n]) => { manque[i] = Math.max(manque[i] || 0, n - (S.ingr[i] || 0)); });
    Object.keys(manque).forEach(i => { if(manque[i] <= 0) delete manque[i]; });
    /* plantes à repérer par le Pisteur : ingrédient qui manque et dont on ne connaît aucun lieu */
    const reperer = new Set();
    Object.keys(manque).forEach(i => {
      const lieux = Object.keys(prep.cueillette).filter(l => prep.cueillette[l].some(c => c.ingr === i));
      if(!lieux.some(l => S.plantes.has(l))) lieux.forEach(l => reperer.add(l));
    });
    return {src, pots, aFaire, manque, reperer};
  }
  /* ----- actions possibles d'un rôle, avec leur valeur ----- */
  function pointsVisibles(lieu, r){
    const L = E.lieux[lieu]; const l = [];
    if(L && L[r] && L[r].points) L[r].points.forEach(p => { if(!p.moments || p.moments.includes(mid())) l.push({cle:`${r}:${lieu}:${p.id}`, p}); });
    if(r === 'pisteur' && prep.cueillette[lieu]) l.push({cle:`plantes:${lieu}`, plantes:true});
    return l;
  }
  function possibles(r, B){
    const l = [];
    const urg = w => 1 + 0.6 / Math.max(1, w);
    if(r === 'pisteur' || r === 'sage'){
      for(const lieu of Object.keys(E.lieux || {})){
        if(!verrouOk(r, lieu)) continue;
        const pts = pointsVisibles(lieu, r); if(!pts.length) continue;
        if(pts.every(x => x.plantes ? S.plantes.has(lieu) : S.vus[x.cle] === 'ok')) continue;
        if(S.explore[r + ':' + lieu] === S.mi && CONFIG.rejeu !== 'action') continue;
        let v = 0, critique = false;
        for(const x of pts){
          if(x.plantes){ if(!S.plantes.has(lieu)) v += B.reperer.has(lieu) ? V.PLANTES : 0.3; continue; }
          if(S.vus[x.cle] === 'ok') continue;
          const inf = info[x.cle];
          if(!besoinsOk(r, [inf.p.besoin].filter(Boolean))) continue;
          const b = B.src.get(x.cle);
          if(b){ v += b * urg(restants(inf.moments)); critique = true; } else v += V.CONTENU;
        }
        l.push({r, type:'explorer', lieu, v, critique});
      }
    }
    if(r === 'sage'){
      for(const p of E.pages || []){
        if(!p.action || S.pages.has(p.id)) continue;
        const cle = 'sage:page:' + p.id;
        if(!besoinsOk(r, [p.besoin].filter(Boolean))) continue;
        const b = B.src.get(cle);
        l.push({r, type:'page', page:p, v:b ? b * urg(nM - S.mi) : V.CONTENU, critique:!!b});
      }
    }
    if(r === 'barde'){
      for(const id of Object.keys(E.pnj || {})){
        const ou = (E.pnj[id].ou || {})[mid()];
        if(!ou || S.conv[id] === S.mi) continue;
        let v = 0, critique = false;
        (E.pnj[id].questions || []).forEach((q, i) => {
          const cle = `barde:${id}:${i}`;
          if(!S.sources.has(cle)){
            if(!besoinsOk(r, [q.besoin].filter(Boolean))) return;
            const b = B.src.get(cle);
            if(b){ v += b * urg(restants(Object.keys(E.pnj[id].ou).filter(m => E.pnj[id].ou[m]))); critique = true; } else v += V.CONTENU;
          } else if(q.ment && !S.sources.has(cle + ':verite')){
            const b = B.src.get(cle + ':verite'); if(b){ v += b * 0.8; critique = true; } else v += 0.3;
          }
        });
        if(v > 0) l.push({r, type:'parler', pnj:id, v, critique});
      }
      for(const x of E.ecoutes || []){
        if(x.role !== r || S.ecoutes.has(x.id) || (x.moments && !x.moments.includes(mid()))) continue;
        if(!besoinsOk(r, [x.besoin].filter(Boolean))) continue;
        const cle = `${r}:ecoute:${x.id}`, b = B.src.get(cle);
        l.push({r, type:'ecouter', x, v:b ? b * urg(restants(x.moments)) : V.CONTENU, critique:!!b});
      }
    }
    if(r === 'alchimiste'){
      for(const code of S.codes.alchimiste){
        if(!code.startsWith('obj:')) continue;
        const id = code.slice(4); if(S.analyses.has(id) || !(E.analyses || {})[id]) continue;
        const cle = 'alchimiste:analyse:' + id, b = B.src.get(cle);
        l.push({r, type:'analyser', obj:id, v:b ? b * urg(nM - S.mi) : V.CONTENU, critique:!!b});
      }
      const nManque = Object.keys(B.manque).length;
      for(const lieu of Object.keys(prep.cueillette)){
        if(S.cueilli[lieu] === S.mi || !verrouOk(r, lieu)) continue;
        const ici = prep.cueillette[lieu].filter(c => (!c.moments || c.moments.includes(mid())) && besoinsOk(r, [c.besoin].filter(Boolean)));
        if(!ici.length) continue;
        let v = 0;
        if(S.plantes.has(lieu)) ici.forEach(c => { if(B.manque[c.ingr]) v += V.POTION / nManque * urg(restants(c.moments)); });
        else v = 0.2;
        l.push({r, type:'cueillir', lieu, v: v || 0.2, critique:v >= 1});
      }
      if(S.fioles > 0){
        for(const pid of recettes){
          const R2 = D.RECETTES[pid];
          if(!R2.ingr.every(([i, n]) => (S.ingr[i] || 0) >= n)) continue;
          let v = 0, critique = false;
          if(B.aFaire.has(pid)){ v = V.POTION + 2; critique = true; }
          else v = aideDePotion(pid, B);
          if(v > 0) l.push({r, type:'cuire', pid, v, critique});
        }
      }
    }
    for(const b of E.bonus || []){
      if(b.role !== r || S.bonus[b.id] || (b.moments && !b.moments.includes(mid()))) continue;
      l.push({r, type:'bonus', b, v:V.BONUS, critique:false});
    }
    /* nouveautés de la saison (coffres, cueillettes rares…) : optionnelles, jamais nécessaires pour résoudre */
    if(opts.saison !== false && (S.saison[r] || 0) < ((CONFIG.saison[r] || {}).actions || 0)) l.push({r, type:'saison', v:V.SAISON, critique:false});
    return l;
  }
  /* une potion de mini-jeu aide-t-elle un équipier sur un indice dont on a besoin ? */
  function aideDePotion(pid, B){
    const P = D.POTIONS[pid]; if(!P.fx.mj) return 0;
    let v = 0;
    for(const [cle] of B.src){
      const inf = info[cle]; if(!inf || !inf.mj || !P.pour.includes(inf.role)) continue;
      if(P.fx.mj[inf.mj] && !(S.potions[inf.role][pid] > 0)) v = Math.max(v, V.AIDE_POTION);
    }
    return v;
  }
  /* ----- faire une action ----- */
  function faire(a){
    const r = a.r, st = S.st[r];
    if(a.critique){ st.critique++; st.critM[S.mi]++; } else if(a.v >= 1) st.optionnel++; else st.vide++;
    S.temps[r] += DUR.actions[a.type] || 1;
    if(a.type === 'explorer'){
      S.explore[r + ':' + a.lieu] = S.mi;
      for(const x of pointsVisibles(a.lieu, r)){
        if(x.plantes){ S.plantes.add(a.lieu); continue; }
        if(S.vus[x.cle] === 'ok') continue;
        const inf = info[x.cle];
        if(!besoinsOk(r, [inf.p.besoin].filter(Boolean), true)) continue;
        let ok = tenter(r, inf.mj, false);
        if(!ok && CONFIG.rejeu === 'code') for(let k = 1; k < CONFIG.essaisGratuitsMax && !ok; k++) ok = tenter(r, inf.mj, false);
        if(!ok && regles.partiel && B0.src.get(x.cle) === V.FAIT && R() < regles.partiel) ok = true;
        if(ok){ S.vus[x.cle] = 'ok'; produire(x.cle); if(inf.or) st.orBonus += inf.or; }
        else S.vus[x.cle] = 'rate';
      }
    } else if(a.type === 'page'){
      const p = a.page, cle = 'sage:page:' + p.id;
      besoinsOk(r, [p.besoin].filter(Boolean), true);
      let ok = tenter(r, p.mj, false);
      if(!ok && regles.partiel && B0.src.get(cle) === V.FAIT && R() < regles.partiel) ok = true;
      if(ok){ S.pages.add(p.id); produire(cle); }
    } else if(a.type === 'parler'){
      S.conv[a.pnj] = S.mi;
      poserQuestions(a.pnj);
    } else if(a.type === 'ecouter'){
      const x = a.x, cle = `${r}:ecoute:${x.id}`;
      S.ecoutes.add(x.id);
      besoinsOk(r, [x.besoin].filter(Boolean), true);
      let ok = tenter(r, x.mj, true);
      if(!ok && regles.partiel && B0.src.get(cle) === V.FAIT && R() < regles.partiel) ok = true;
      if(ok) produire(cle);
    } else if(a.type === 'analyser'){
      const cle = 'alchimiste:analyse:' + a.obj;
      if(tenter(r, info[cle].mj, false)){ S.analyses.add(a.obj); produire(cle); }
    } else if(a.type === 'cueillir'){
      S.cueilli[a.lieu] = S.mi; S.plantes.add(a.lieu);
      prep.cueillette[a.lieu].forEach(c => {
        if(c.moments && !c.moments.includes(mid())) return;
        if(!besoinsOk(r, [c.besoin].filter(Boolean))) return;
        const rare = D.INGR[c.ingr] && D.INGR[c.ingr].rare;
        const n = Math.max(c.min || 1, rare ? 1 : 1 + Math.floor(R() * 3)) + fxSomme(los.alchimiste, 'cueilletteBonus');
        S.ingr[c.ingr] = (S.ingr[c.ingr] || 0) + n;
      });
    } else if(a.type === 'cuire'){
      const R2 = D.RECETTES[a.pid];
      R2.ingr.forEach(([i, n]) => { S.ingr[i] -= n; });
      if(tenter(r, 'chaudron', false)){
        S.fioles--;
        const doses = 1 + fxSomme(los.alchimiste, 'doses');
        S.potions.alchimiste[a.pid] = (S.potions.alchimiste[a.pid] || 0) + doses;
        st.potions = (st.potions || 0) + 1;
      } else st.potionsRatees = (st.potionsRatees || 0) + 1;
    } else if(a.type === 'saison'){
      S.saison[r] = (S.saison[r] || 0) + 1; st.saison = (st.saison || 0) + 1; st.optionnel--;
    } else if(a.type === 'bonus'){
      st.bonusTentes++;
      const ok = tenter(r, a.b.mj, true);
      S.bonus[a.b.id] = ok ? 'ok' : 'ko';
      if(ok){ st.orBonus += a.b.or; st.bonusOk++; }
    }
  }
  function poserQuestions(id){
    const Q = E.pnj[id].questions || [];
    Q.forEach((q, i) => {
      const cle = `barde:${id}:${i}`;
      if(S.sources.has(cle) || !besoinsOk('barde', [q.besoin].filter(Boolean), true)) return;
      produire(cle);
    });
    /* démasquer (gratuit, une fois par habitant et par moment) si un mensonge sert à l'enquête */
    const besoinVerite = Q.some((q, i) => q.ment && S.sources.has(`barde:${id}:${i}`) && !S.sources.has(`barde:${id}:${i}:verite`) && B0.src.has(`barde:${id}:${i}:verite`));
    if(besoinVerite && S.demasque[id] !== S.mi){
      S.demasque[id] = S.mi;
      let ok = tenter('barde', 'mensonge', false);
      if(!ok && S.verite.barde > 0){ S.verite.barde--; ok = true; }
      if(ok) Q.forEach((q, i) => { if(q.ment && S.sources.has(`barde:${id}:${i}`)) S.sources.add(`barde:${id}:${i}:verite`); });
    }
  }
  /* ----- ce qui ne coûte pas d'action : pages du Sage, potions données, questions débloquées ----- */
  function gratuit(){
    for(const p of E.pages || []){
      if(p.action || S.pages.has(p.id)) continue;
      if(!besoinsOk('sage', [p.besoin].filter(Boolean))) continue;
      if(p.mj){
        const k = 'page:' + p.id + ':' + S.mi;
        if((S.essaisLibres[k] || 0) >= CONFIG.essaisGratuitsMax) continue;
        S.essaisLibres[k] = (S.essaisLibres[k] || 0) + 1;
        besoinsOk('sage', [p.besoin].filter(Boolean), true);
        if(!tenter('sage', p.mj, false)) continue;
      } else besoinsOk('sage', [p.besoin].filter(Boolean), true);
      S.pages.add(p.id); produire('sage:page:' + p.id);
    }
    /* l'Alchimiste donne les potions à ceux qui en ont besoin, ou qui jouent un mini-jeu qu'elles facilitent */
    const B = besoins();
    for(const pid of Object.keys(S.potions.alchimiste)){
      while(S.potions.alchimiste[pid] > 0){
        let r = B.pots.has(pid) ? [...B.pots.get(pid)].find(x => x !== 'alchimiste' && !(S.potions[x][pid] > 0)) : null;
        if(!r){
          const P = D.POTIONS[pid];
          for(const [cle] of B.src){ const inf = info[cle]; if(inf && inf.mj && P.fx.mj && P.fx.mj[inf.mj] && P.pour.includes(inf.role) && !(S.potions[inf.role][pid] > 0)){ r = inf.role; break; } }
        }
        if(!r) break;
        S.potions.alchimiste[pid]--; S.potions[r][pid] = (S.potions[r][pid] || 0) + 1;
      }
    }
    /* le Barde continue une conversation de ce moment si un code vient de débloquer une question */
    Object.keys(S.conv).forEach(id => { if(S.conv[id] === S.mi) poserQuestions(id); });
  }

  /* ----- une action importante sera-t-elle encore possible à un moment suivant ? ----- */
  function encorePlusTard(a, B){
    const plus = E.moments.slice(S.mi + 1);
    if(!plus.length) return false;
    const dans = l => !l || l.some(m => plus.includes(m));
    if(a.type === 'explorer'){
      const L = E.lieux[a.lieu];
      return ((L[a.r] && L[a.r].points) || []).some(p => B.src.has(`${a.r}:${a.lieu}:${p.id}`) && dans(p.moments));
    }
    if(a.type === 'parler') return plus.some(m => (E.pnj[a.pnj].ou || {})[m]);
    if(a.type === 'ecouter') return dans(a.x.moments);
    if(a.type === 'cueillir') return prep.cueillette[a.lieu].some(c => B.manque[c.ingr] && dans(c.moments));
    return true;
  }
  /* ----- déroulé des moments ----- */
  let B0 = null;
  const effic = r => PR.efficacite[equipe[r]] || 0.85;
  const frustration = {};
  ROLES.forEach(r => { frustration[r] = 0; });
  let duree = DUR.horsMoments || 0;
  for(S.mi = 0; S.mi < nM; S.mi++){
    ROLES.forEach(r => { S.actions[r] = regles.actions[r] + fxSomme(los[r], 'actionBonus'); S.dons[r] = 0; S.temps[r] = 0; });
    let garde = 0;
    while(garde++ < 20){
      gratuit();
      B0 = besoins();
      let quelqu = false;
      for(const r of ORDRE_JEU){
        let l = possibles(r, B0);
        let best = null;
        l.forEach(a => { if(!best || a.v > best.v || (a.v === best.v && R() < 0.5)) best = a; });
        if(S.actions[r] <= 0){
          /* la réserve du Sage : un équipier sans action qui a encore quelque chose d'important à faire */
          const veut = best && best.critique && best.v >= V.POTION;
          if(veut && !S.veut[r + S.mi]){ S.veut[r + S.mi] = 1; S.st[r].demande++; S.st[r].demM[S.mi] = 1; }
          if(veut && S.reserve > 0 && S.dons[r] < regles.plafondDon){
            S.reserve--; S.dons[r]++; S.actions[r]++; S.st[r].recuReserve = (S.st[r].recuReserve || 0) + 1;
          } else if(veut && regles.donSage && r !== 'sage' && S.actions.sage > 0 && S.dons[r] < regles.plafondDon && !possibles('sage', B0).some(a => a.critique)){
            /* le Sage donne une de SES actions (il n'a rien d'important à faire lui-même) */
            S.actions.sage--; S.dons[r]++; S.actions[r]++; S.st[r].recuReserve = (S.st[r].recuReserve || 0) + 1; S.donnees = (S.donnees || 0) + 1;
          } else continue;
        }
        if(!best || best.v <= 0.25){ S.st[r].inutilise += S.actions[r]; S.actions[r] = 0; continue; }
        /* le Sage qui peut donner ses actions les garde tant que les autres jouent encore et qu'il n'a rien d'important à faire */
        if(r === 'sage' && regles.donSage && !best.critique && ROLES.some(x => x !== 'sage' && S.actions[x] > 0)){ quelqu = true; continue; }
        let a = best;
        if(R() > effic(r)){
          /* curiosité : une action au hasard (parfois utile, souvent non) */
          const pool = l.concat([{r, type:'flaner', v:0}]);
          a = pool[Math.floor(R() * pool.length)];
        }
        S.actions[r]--; quelqu = true;
        if(a.type === 'flaner'){ S.st[r].vide++; continue; }
        faire(a);
      }
      livrer();
      if(!quelqu) break;
    }
    duree += Math.max(...ROLES.map(r => S.temps[r])) + (DUR.parMoment || 0);
    /* frustration : à la fin du moment, il restait quelque chose d'important à faire, et ce ne sera plus possible plus tard */
    const B = besoins();
    ROLES.forEach(r => {
      const l = possibles(r, B).filter(a => a.critique && a.v >= V.PREREQ && !encorePlusTard(a, B));
      if(l.length) frustration[r]++;
    });
  }
  /* ----- accusation ----- */
  let forces = null;
  if(regles.indiceSage){
    /* pouvoir du Sage : un fait manquant est dévoilé (celui qui retire le plus de possibilités) */
    const ok = new Set(); prep.faits.forEach((f, i) => { if(faitOk(f, S.sources)) ok.add(i); });
    let best = null, bestN = hypotheses(candidats(E, null, ok)).length;
    prep.faits.forEach((f, i) => { if(ok.has(i)) return; const t = new Set(ok); t.add(i); const n = hypotheses(candidats(E, null, t)).length; if(n < bestN){ bestN = n; best = t; } });
    if(best) forces = best;
  }
  const reste = forces ? candidats(E, null, forces) : candidats(E, S.sources);
  const strat = fxSomme(los.sage, 'stratege') > 0;
  if(strat && reste.qui.size > 1){
    const inn = [...reste.qui].filter(x => x !== E.solution.qui);
    for(let k = 0; k < 2 && inn.length && reste.qui.size > 1; k++){ const j = Math.floor(R() * inn.length); reste.qui.delete(inn[j]); inn.splice(j, 1); }
  }
  const H = hypotheses(reste);
  const essais = regles.essais + (fxSomme(los.sage, 'protection') > 0 ? 1 : 0);
  let erreurs = 0, gagne = false;
  const perr = PR.raisonnement[equipe.raisonnement] || 0;
  let t = essais;
  if(R() < perr && t > 1){ erreurs++; t--; }
  const dist = repartitionAccusation(H, t);
  let x = R(), cum = 0;
  for(let k = 0; k < dist.length; k++){ cum += dist[k]; if(x < cum){ gagne = true; erreurs += k; break; } }
  if(!gagne) erreurs = essais;
  return {gagne, erreurs, unique:H.length === 1, nH:H.length, faits:prep.faits.filter(f => faitOk(f, S.sources)).length, parFait:prep.faits.map(f => faitOk(f, S.sources)),
    st:S.st, frustration, reserveRestante:S.reserve, reserveTotale:regles.reserve + (S.donnees || 0), reserveVide:regles.reserve > 0 && S.reserve === 0, actionsParMoment:regles.actions, duree};
}

/* Plusieurs parties : moyennes */
function simuler(prep, equipe, scenario, los, n, graine, opts){
  const R = hasard(graine);
  const tot = {gagne:0, sansErreur:0, unique:0, perdu:0, erreurs:0, faits:0, nH:0, reserveUtilisee:0, reserveTotale:0, roles:{}, parFait:prep.faits.map(() => 0)};
  ROLES.forEach(r => { tot.roles[r] = {critique:0, optionnel:0, saison:0, vide:0, inutilise:0, recu:0, recuReserve:0, mj:0, mjOk:0, orBonus:0, frustration:0, frustre:0, potions:0, potionsRatees:0, demande:0, critM:prep.E.moments.map(() => 0), demM:prep.E.moments.map(() => 0)}; });
  tot.duree = 0;
  for(let i = 0; i < n; i++){
    const res = simulerUne(prep, equipe, scenario, los, R, opts);
    if(res.gagne) tot.gagne++; else tot.perdu++;
    if(res.gagne && res.erreurs === 0) tot.sansErreur++;
    if(res.unique) tot.unique++;
    tot.erreurs += res.erreurs; tot.faits += res.faits; tot.nH += res.nH;
    res.parFait.forEach((ok, i) => { if(ok) tot.parFait[i]++; });
    tot.duree += res.duree;
    tot.reserveUtilisee += res.reserveTotale - res.reserveRestante; tot.reserveTotale = Math.max(tot.reserveTotale, res.reserveTotale); if(res.reserveVide) tot.reserveVide = (tot.reserveVide || 0) + 1;
    ROLES.forEach(r => {
      const a = tot.roles[r], s = res.st[r];
      ['critique', 'optionnel', 'saison', 'vide', 'inutilise', 'recu', 'recuReserve', 'mj', 'mjOk', 'orBonus', 'potions', 'potionsRatees', 'demande'].forEach(k => { a[k] += s[k] || 0; });
      s.critM.forEach((x, i) => { a.critM[i] += x; }); s.demM.forEach((x, i) => { a.demM[i] += x; });
      a.frustration += res.frustration[r]; if(res.frustration[r]) a.frustre++;
    });
  }
  const m = x => x / n;
  const out = {n, gagne:m(tot.gagne), sansErreur:m(tot.sansErreur), unique:m(tot.unique), perdu:m(tot.perdu), faits:m(tot.faits), nH:m(tot.nH), parFait:tot.parFait.map(m),
    reserveUtilisee:m(tot.reserveUtilisee), reserveTotale:tot.reserveTotale, roles:{}};
  ROLES.forEach(r => { const a = tot.roles[r]; out.roles[r] = {}; Object.keys(a).forEach(k => { out.roles[r][k] = Array.isArray(a[k]) ? a[k].map(m) : m(a[k]); }); });
  out.duree = m(tot.duree); out.reserveVide = m(tot.reserveVide || 0);
  return out;
}

/* ==========================================================================
   Analyse statique d'une enquête
   ========================================================================== */
function analyseStatique(prep){
  const E = prep.E, F = prep.faits;
  /* combinaisons minimales de faits qui donnent une solution unique */
  const unique = set => { const r = candidats(E, null, set); return Object.values(r).every(s => s.size === 1); };
  const minimales = [];
  const nF = F.length;
  if(nF <= 16){
    const ok = [];
    for(let m = 0; m < (1 << nF); m++){
      const set = new Set(); for(let i = 0; i < nF; i++) if(m & (1 << i)) set.add(i);
      if(unique(set)) ok.push(m);
    }
    ok.forEach(m => { if(!ok.some(m2 => m2 !== m && (m2 & m) === m2)) minimales.push(m); });
  }
  const indispensables = [];
  for(let i = 0; i < nF; i++) if(minimales.length && minimales.every(m => m & (1 << i))) indispensables.push(i);
  /* mini-jeux qui gardent chaque fait */
  const gardes = F.map(f => {
    const l = [];
    f.sources.forEach(item => {
      const alts = Array.isArray(item) ? item : [item];
      const jeux = alts.map(c => jeuxSur(prep, c, new Set()));
      /* un item OU : gardé seulement si toutes les alternatives le sont */
      if(jeux.every(j => j.length)) l.push(alts.length > 1 ? '(' + jeux.map(j => j.join('+')).join(' ou ') + ')' : jeux[0].join('+'));
    });
    return l;
  });
  return {minimales:minimales.map(m => F.map((f, i) => (m & (1 << i)) ? i + 1 : 0).filter(Boolean)), indispensables:indispensables.map(i => i + 1), gardes};
}
/* mini-jeux sur le chemin d'une source (avec ses prérequis) */
function jeuxSur(prep, cle, vus){
  if(vus.has(cle)) return []; vus.add(cle);
  const inf = prep.info[cle]; if(!inf) return [];
  const l = [];
  if(inf.mj){
    const regle = inf.kind === 'ecoute' ? ' (1 seul essai)' : (inf.kind === 'page' && !inf.action) ? ' (essais gratuits)' : '';
    const mom = inf.moments ? ' [' + inf.moments.join('/') + ']' : '';
    l.push(inf.mj + regle + mom);
  }
  for(const alt of inf.besoins){
    const sous = alt.map(c => {
      if(c.cle) return jeuxSur(prep, c.cle, vus);
      if(c.page) return jeuxSur(prep, 'sage:page:' + c.page, vus);
      if(c.code && !c.code.startsWith('pot:')) { const p = (prep.prod[c.code] || []).map(x => jeuxSur(prep, x, vus)); return p.length && p.every(x => x.length) ? p[0] : []; }
      if(c.code && c.code.startsWith('pot:')) return ['chaudron (potion ' + c.code.slice(4) + ')'];
      if(c.acces){ const pots = Object.keys(D.POTIONS).filter(pid => (D.POTIONS[pid].fx.acces || []).includes(c.acces) && D.POTIONS[pid].pour.includes(inf.role)); return pots.length ? ['chaudron (potion ' + pots.join(' ou ') + ')'] : ['objet/talent']; }
      return [];
    });
    if(sous.length && sous.every(s => s.length)) l.push(...sous[0]);
  }
  return l;
}
/* Actions minimales et contenu complet, par rôle.
   coutSource = nombre d'actions pour obtenir une source avec ses prérequis (on prend toujours le chemin le moins cher). */
function coutPotion(E, pid){
  const R2 = D.RECETTES[pid]; if(!R2) return 99;
  const dep = (E.depart && E.depart.alchimiste && E.depart.alchimiste.ingr) || {};
  return 1 + R2.ingr.reduce((s, [i, q]) => s + Math.ceil(Math.max(0, q - (dep[i] || 0)) / 2), 0);
}
function coutCond(prep, role, c, pile){
  if(c.cle) return coutSource(prep, c.cle, pile).c;
  if(c.page) return coutSource(prep, 'sage:page:' + c.page, pile).c;
  if(c.code && c.code.startsWith('pot:')) return coutPotion(prep.E, c.code.slice(4));
  if(c.code){ const p = prep.prod[c.code] || []; return p.length ? Math.min(...p.map(x => coutSource(prep, x, pile).c)) : 99; }
  if(c.acces){ const pid = potionPour(c.acces, role); return pid && D.POTIONS[pid].pour.includes(role) ? coutPotion(prep.E, pid) : 99; }
  return 99;
}
function coutSource(prep, cle, pile){
  pile = pile || new Set();
  const inf = prep.info[cle]; if(!inf || pile.has(cle)) return {c:99};
  pile = new Set(pile); pile.add(cle);
  let c = (inf.kind === 'page' && !inf.action) || inf.kind === 'verite' ? 0 : 1;
  if(inf.kind === 'verite') c += coutSource(prep, inf.base, pile).c;
  for(const alt of inf.besoins) c += Math.min(...alt.map(x => coutCond(prep, inf.role, x, pile)));
  return {c};
}
function besoinsActions(prep, faitsChoisis){
  const info = prep.info;
  const cles = new Set();
  const ajoute = cle => {
    if(cles.has(cle) || !info[cle]) return; cles.add(cle);
    const inf = info[cle];
    if(inf.kind === 'verite') ajoute(inf.base);
    for(const alt of inf.besoins){
      if(!alt.length) continue;
      const c = alt.slice().sort((a, b) => coutCond(prep, inf.role, a) - coutCond(prep, inf.role, b))[0];
      if(c.cle) ajoute(c.cle);
      else if(c.page) ajoute('sage:page:' + c.page);
      else if(c.code && !c.code.startsWith('pot:')){ const p = (prep.prod[c.code] || []).slice().sort((a, b) => coutSource(prep, a).c - coutSource(prep, b).c); if(p.length) ajoute(p[0]); }
      else cles.add('potion:' + (c.code ? c.code.slice(4) : potionPour(c.acces, inf.role)));
    }
  };
  faitsChoisis.forEach(i => prep.faits[i].sources.forEach(item => ajoute(Array.isArray(item) ? item.slice().sort((a, b) => coutSource(prep, a).c - coutSource(prep, b).c)[0] : item)));
  return compterActions(prep, cles);
}
function potionPour(acces, role){ return Object.keys(D.POTIONS).find(pid => (D.POTIONS[pid].fx.acces || []).includes(acces) && D.POTIONS[pid].pour.includes(role) && D.RECETTES_DE_BASE.includes(pid)) || Object.keys(D.POTIONS).find(pid => (D.POTIONS[pid].fx.acces || []).includes(acces) && D.POTIONS[pid].pour.includes(role)) || Object.keys(D.POTIONS).find(pid => (D.POTIONS[pid].fx.acces || []).includes(acces)); }
function compterActions(prep, cles){
  const E = prep.E, info = prep.info;
  const n = {pisteur:new Set(), alchimiste:new Set(), barde:new Set(), sage:new Set()};
  let mj = {pisteur:[], alchimiste:[], barde:[], sage:[]};
  for(const cle of cles){
    if(cle.startsWith('potion:')){
      const pid = cle.slice(7), R2 = D.RECETTES[pid]; if(!R2) continue;
      /* une cueillette rapporte 2 en moyenne : il faut ceil(quantité / 2) cueillettes par ingrédient (moins le stock de départ) */
      const dep = (E.depart && E.depart.alchimiste && E.depart.alchimiste.ingr) || {};
      R2.ingr.forEach(([i, q]) => { const reste = Math.max(0, q - (dep[i] || 0)); for(let k = 0; k < Math.ceil(reste / 2); k++) n.alchimiste.add('cueillir:' + i + ':' + k); });
      /* l'Alchimiste ne sait pas où ça pousse : il faut parfois un repérage du Pisteur (compté à part) */
      n.alchimiste.add('cuire:' + pid); mj.alchimiste.push('chaudron');
      continue;
    }
    const inf = info[cle]; if(!inf) continue;
    if(inf.kind === 'point'){ (n[inf.role].fenetres = n[inf.role].fenetres || {}); (n[inf.role].fenetres[inf.lieu] = n[inf.role].fenetres[inf.lieu] || []).push(inf.moments || E.moments); }
    else if(inf.kind === 'question') n.barde.add('parler:' + inf.pnj + (inf.q.besoin ? ':code' : ''));
    else if(inf.kind === 'verite') n.barde.add('parler:' + inf.pnj);
    else if(inf.kind === 'analyse') n.alchimiste.add('analyser:' + inf.obj);
    else if(inf.kind === 'page' && inf.action) n.sage.add('page:' + inf.page.id);
    else if(inf.kind === 'ecoute') n[inf.role].add('ecouter:' + inf.x.id);
    if(inf.mj) mj[inf.role].push(inf.mj);
  }
  /* visites d'un même lieu : une seule si toutes les fenêtres de moments ont un moment commun, sinon deux */
  ROLES.forEach(x => {
    const F = n[x].fenetres || {};
    Object.keys(F).forEach(lieu => {
      const commun = E.moments.filter(m => F[lieu].every(w => w.includes(m)));
      n[x].add('explorer:' + lieu); if(!commun.length) n[x].add('explorer:' + lieu + ':autre moment');
    });
    delete n[x].fenetres;
  });
  const r = {};
  ROLES.forEach(x => { r[x] = {n:n[x].size, detail:[...n[x]], mj:mj[x]}; });
  return r;
}
function contenuComplet(prep){
  const E = prep.E, cles = new Set();
  Object.keys(prep.info).forEach(c => { if(!c.endsWith(':verite')) cles.add(c); });
  /* potions utiles dans l'enquête : celles qui ouvrent un besoin */
  Object.values(prep.info).forEach(inf => inf.besoins.forEach(alt => alt.forEach(c => {
    if(c.code && c.code.startsWith('pot:')) cles.add('potion:' + c.code.slice(4));
    if(c.acces){ const p = potionPour(c.acces, inf.role); if(p && D.POTIONS[p] && D.POTIONS[p].pour.includes(inf.role)) cles.add('potion:' + p); }
  })));
  const r = compterActions(prep, cles);
  (E.bonus || []).forEach(b => { r[b.role].n++; r[b.role].detail.push('bonus:' + b.id); });
  /* le Pisteur repère les plantes pour l'Alchimiste (lieux de cueillette sans point à lui) */
  const lieuxP = new Set(Object.keys(E.lieux).filter(l => E.lieux[l].pisteur && E.lieux[l].pisteur.points));
  r.pisteur.reperage = Object.keys(prep.cueillette).filter(l => !lieuxP.has(l)).length;
  /* habitants qu'on peut seulement croiser (pas de question utile) */
  return r;
}

/* ==========================================================================
   Affichage
   ========================================================================== */
const pc = x => (x * 100).toFixed(x >= 0.995 && x < 1 ? 1 : 0) + ' %';
const f1 = x => (Math.round(x * 10) / 10).toFixed(1).replace('.', ',');
const pcv = x => pc(x).replace('.', ',');
function tableau(entetes, lignes){
  const s = ['| ' + entetes.join(' | ') + ' |', '|' + entetes.map(() => '---').join('|') + '|'];
  lignes.forEach(l => s.push('| ' + l.join(' | ') + ' |'));
  return s.join('\n');
}
const NOMS = {pisteur:'Pisteur', alchimiste:'Alchimiste', barde:'Barde', sage:'Sage'};
const JSONOUT = {enquetes:{}, progression:{}, jeux:{}, projection:{}};

function sortieEnquete(id, prepAll){
  const E = ENQ[id], prep = prepAll[id];
  const nM = E.moments.length;
  console.log(`\n## Enquête ${id} : ${E.titre} (${nM} moments : ${E.moments.join(', ')})\n`);
  const A = analyseStatique(prep);
  /* faits */
  console.log('### Les faits et ce qui les garde\n');
  console.log(tableau(['N°', 'Élimine', 'Sources', 'Mini-jeux sur le chemin'], prep.faits.map((f, i) => [
    String(i + 1) + (A.indispensables.includes(i + 1) ? ' ⚠️' : ''),
    ['qui', 'ou', 'quoi'].filter(d => f[d]).map(d => d + ' : ' + f[d].join(', ')).join(' ; '),
    f.sources.map(s => Array.isArray(s) ? '(' + s.join(' ou ') + ')' : s).join(' + '),
    A.gardes[i].join(', ') || '—'])));
  console.log(`\n⚠️ = fait indispensable (dans toutes les combinaisons qui suffisent). Combinaisons minimales de faits qui donnent une seule solution : ${A.minimales.length ? A.minimales.map(m => '{' + m.join(',') + '}').join(' ') : 'aucune !'}`);
  /* actions */
  const mins = A.minimales.map(m => ({m, b:besoinsActions(prep, m.map(x => x - 1))}));
  mins.sort((a, b) => ROLES.reduce((s, r) => s + a.b[r].n, 0) - ROLES.reduce((s, r) => s + b.b[r].n, 0));
  const tous = besoinsActions(prep, prep.faits.map((f, i) => i));
  const complet = contenuComplet(prep);
  console.log('\n### Actions : besoin minimal, tous les faits, contenu complet (par enquête, sans compter les ratés)\n');
  console.log(tableau(['Rôle', 'Minimum pour résoudre', 'Tous les faits', 'Tout voir (+ missions bonus)', '+ nouveautés saison', 'Disponible (2 × ' + nM + ')'],
    ROLES.map(r => [NOMS[r], mins.length ? String(mins[0].b[r].n) : '?', String(tous[r].n), String(complet[r].n) + (r === 'pisteur' && complet.pisteur.reperage ? ' (+' + complet.pisteur.reperage + ' repérages de plantes)' : ''),
      String(complet[r].n + CONFIG.saison[r].actions), String(2 * nM)])));
  console.log('\nDétail du minimum : ' + (mins.length ? ROLES.map(r => NOMS[r] + ' = ' + (mins[0].b[r].detail.join(', ') || 'rien')).join(' ; ') : '?'));
  JSONOUT.enquetes[id] = {faits:prep.faits.length, minimales:A.minimales, indispensables:A.indispensables, gardes:A.gardes,
    minimum:mins.length ? mins[0].b : null, tous, complet, simulations:{}};
}

function loadoutsPour(equipe, k, opts){
  const los = {};
  ROLES.forEach(r => { const pr = progression(r, equipe[r], opts); const e = pr[k]; los[r] = {talents:e.talents, equip:e.equip}; });
  return los;
}
function plantesConnuesAvant(k){
  const s = new Set();
  for(let j = 1; j < k; j++){ const E = ENQ[j]; if(!E) continue; Object.keys(E.lieux || {}).forEach(l => { if(E.lieux[l].alchimiste && E.lieux[l].alchimiste.cueillir) s.add(l); }); }
  return s;
}

function sortieSimulations(id, prepAll, resultats){
  const E = ENQ[id], prep = prepAll[id];
  console.log(`\n### Simulation de l'enquête ${id} (${CONFIG.parties} parties par case, rejeu « ${CONFIG.rejeu} », équipement « raisonnable » de l'enquête ${id}, nouveautés de la saison comprises)\n`);
  const lignes = [], lignesA = [];
  for(const sc of Object.keys(CONFIG.scenarios)){
    for(const eq of Object.keys(CONFIG.equipes)){
      const res = resultats[id][sc][eq];
      lignes.push([CONFIG.scenarios[sc].nom.split(' :')[0], eq, pcv(res.unique), pcv(res.sansErreur), pcv(res.gagne), '**' + pcv(res.perdu) + '**',
        ROLES.map(r => pcv(res.roles[r].frustre)).join(' · '),
        f1(ROLES.reduce((a, r) => a + res.roles[r].demande, 0)) + ' (' + ROLES.map(r => f1(res.roles[r].demande)).join('·') + ')',
        res.reserveTotale ? f1(res.reserveUtilisee) + '/' + res.reserveTotale : '—',
        Math.round(res.duree) + ' min']);
      lignesA.push([CONFIG.scenarios[sc].nom.split(' :')[0], eq].concat(ROLES.map(r => { const x = res.roles[r]; return f1(x.critique) + ' / ' + f1(x.optionnel + x.saison) + ' / ' + f1(x.vide) + ' / ' + f1(x.inutilise); })));
    }
  }
  console.log(tableau(['Règle', 'Équipe', 'Une seule solution à la fin', 'Gagné du 1er coup', 'Gagné (avec les essais)', 'PERDU', 'Frustré P·A·B·S', 'Moments « il me faudrait une action de plus » (P·A·B·S)', 'Réserve donnée', 'Durée estimée'], lignes));
  console.log('\nFrustré = part des parties où ce rôle a dû renoncer pour de bon à quelque chose d\'important faute d\'action. « Il me faudrait une action de plus » = nombre moyen de moments où un joueur n\'avait plus d\'action alors qu\'il restait un indice ou un prérequis à aller chercher (c\'est la demande que la réserve du Sage doit couvrir).\n');
  /* charge par moment */
  console.log('Charge par moment (règle actuelle) : actions utiles moyennes, et entre parenthèses la part des parties où le joueur aurait voulu une action de plus à ce moment.\n');
  const lm = [];
  for(const eq of ['enfants', 'famille', 'adultes_moyens']){
    const res = resultats[id].actuel[eq];
    ROLES.forEach(r => lm.push([eq, NOMS[r]].concat(E.moments.map((m, i) => f1(res.roles[r].critM[i]) + ' (' + pcv(res.roles[r].demM[i]) + ')'))));
  }
  console.log(tableau(['Équipe', 'Rôle'].concat(E.moments), lm));
  console.log('');
  console.log('Actions par enquête : utiles (indices et leurs prérequis) / optionnelles (contenu, missions bonus, nouveautés) / perdues (curiosité sans rien) / inutilisées (rien d\'intéressant à faire)\n');
  console.log(tableau(['Règle', 'Équipe', 'Pisteur', 'Alchimiste', 'Barde', 'Sage'], lignesA));
  /* faits obtenus */
  const eqs = Object.keys(CONFIG.equipes);
  console.log('\nChance d\'obtenir chaque fait (règle actuelle → règle proposée), par équipe :\n');
  console.log(tableau(['Fait'].concat(eqs), prep.faits.map((f, i) => [String(i + 1)].concat(eqs.map(eq => pcv(resultats[id].actuel[eq].parFait[i]) + ' → ' + pcv(resultats[id].propose[eq].parFait[i]))))));
}

/* Taille de la réserve du Sage : on essaie 0 à 6 actions par enquête */
function sortieReserve(ids, prepAll){
  console.log('\n## Taille de la réserve du Sage (Alchimiste 3, les autres 2 ; au plus 1 don par joueur et par moment)\n');
  console.log('Pour chaque taille : part des parties où quelqu\'un est frustré (au moins un rôle), chance de perdre, actions données en moyenne, et « réserve vide » = part des parties où la réserve est entièrement utilisée (si c\'est souvent, il faut choisir à qui donner).\n');
  const n = Math.max(300, Math.round(CONFIG.parties / 3));
  const lignes = [];
  for(const k of ids){
    for(const eq of ['enfants', 'famille', 'adultes_moyens']){
      const equipe = CONFIG.equipes[eq], los = loadoutsPour(equipe, k, {plafondValide:true});
      const cells = [0, 1, 2, 3, 4, 5, 6].map(t => {
        const sc = {actions:{pisteur:2, alchimiste:3, barde:2, sage:2}, reserve:t, plafondDon:1};
        const res = simuler(prepAll[k], equipe, sc, los, n, CONFIG.graine + 77 + k, {plafondValide:true, plantesConnues:plantesConnuesAvant(k)});
        const frus = 1 - ROLES.reduce((a, r) => a * (1 - res.roles[r].frustre), 1);
        return pcv(frus) + ' · ' + pcv(res.perdu) + ' · ' + f1(res.reserveUtilisee) + (t ? ' · ' + pcv(res.reserveVide) : '');
      });
      lignes.push(['E' + k + ' ' + eq].concat(cells));
    }
  }
  console.log(tableau(['Enquête, équipe', 'Réserve 0', '1', '2', '3', '4', '5', '6'], lignes));
  console.log('\nLecture d\'une case : frustré · perdu · actions données · réserve vide. (Frustré « au moins un rôle » est approché en supposant les rôles indépendants.)');
}

function sortieProgression(){
  console.log('\n## Progression sur la saison (achats « raisonnables », toutes les enquêtes gagnées)\n');
  const pr = {}; ROLES.forEach(r => { pr[r] = progression(r, 'adulte_moyen'); });
  const prP = {}; ROLES.forEach(r => { prP[r] = progression(r, 'adulte_moyen', {seuils:CONFIG.seuilsProposes}); });
  console.log(tableau(['Début de l\'enquête', 'XP', 'Niveau (seuils actuels)', 'Niveau (seuils proposés)'],
    [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(k => [String(k), String(pr.pisteur[k].xp), String(pr.pisteur[k].niveau), String(prP.pisteur[k].niveau)])));
  for(const r of ROLES){
    const lignes = [1, 3, 5, 7, 9].map(k => {
      const e = pr[r][k];
      return [String(k), String(e.niveau), e.talents.map(t => D.TALENTS[t].nom).join(', ') || '—', e.equip.map(o => D.OBJETS[o].nom).join(', ') || '—', String(Math.round(e.or))];
    });
    console.log(`\n**${NOMS[r]}** (adulte moyen)\n`);
    console.log(tableau(['Enquête', 'Niveau', 'Talents', 'Objets', 'Or restant'], lignes));
    JSONOUT.progression[r] = pr[r];
  }
}

function sortieJeux(){
  console.log('\n## Chance de réussir chaque mini-jeu (équipement raisonnable, sans potion ni deuxième chance)\n');
  console.log('Format : niveau effectif → chance pour enfant / Naïm / adulte moyen / adulte fort. « actuel » = moteur actuel ; « plafonné » = jamais au-dessus du niveau validé.\n');
  for(const plaf of [false, true]){
    console.log(`\n### ${plaf ? 'Avec le plafond au niveau validé (proposé)' : 'Moteur actuel'}\n`);
    const lignes = [];
    for(const type of Object.keys(PR.jeux)){
      const role = PR.jeux[type].role;
      const cells = [1, 3, 5, 7, 9].map(k => {
        const ps = ['enfant', 'naim', 'adulte_moyen', 'adulte_fort'].map(pf => {
          const pr = progression(role, pf, {plafondValide:plaf})[k];
          return chanceJeu(pf, type, k, {talents:pr.talents, equip:pr.equip}, null, {plafondValide:plaf});
        });
        const c = ps[2];
        const triv = (c.eff <= PR.trivial.niveauMin || c.p >= PR.trivial.chanceMaxAdulteMoyen) ? ' ⚠️' : '';
        JSONOUT.jeux[(plaf ? 'plafond:' : 'actuel:') + type + ':' + k] = ps.map(x => ({p:x.p, eff:x.eff}));
        return f1(c.eff) + ' → ' + ps.map(x => Math.round(x.p * 100)).join('/') + triv + (c.auto ? ' (auto ×' + c.auto + ')' : '');
      });
      lignes.push([type + ' (' + NOMS[role] + ')'].concat(cells));
    }
    console.log(tableau(['Mini-jeu', 'Enquête 1', 'Enquête 3', 'Enquête 5', 'Enquête 7', 'Enquête 9'], lignes));
  }
}

/* Ce que chaque mini-jeu devient si on empile TOUT ce qui l'aide */
function sortieEmpilement(){
  console.log('\n## Empilement maximal : tout ce qui aide un mini-jeu (meilleurs talents, tous les objets, ensemble, meilleure potion)\n');
  const lignes = [];
  for(const type of Object.keys(PR.jeux)){
    const role = PR.jeux[type].role;
    /* talents : le meilleur de chaque paire pour ce jeu */
    const talents = [];
    [2, 4, 6, 8, 10].forEach(p => {
      const choix = (D.TALENTS_PAR_ROLE[role] || {})[p] || [];
      let best = null, bd = 0;
      choix.forEach(t => { const d = decalageMods(type, modsPour({talents:[t]}, type).mods).total + (autoPour({talents:[t]}, type) ? -20 : 0); if(d < bd){ bd = d; best = t; } });
      if(best) talents.push(best);
    });
    const objets = Object.keys(D.OBJETS).filter(id => D.OBJETS[id].role === role && (decalageMods(type, modsPour({equip:[id]}, type).mods).total < 0 || autoPour({equip:[id]}, type)));
    /* ensemble complet si un objet d'ensemble aide déjà */
    const ens = new Set(objets.map(o => D.OBJETS[o].ens).filter(Boolean));
    const avecEns = objets.slice();
    ens.forEach(e => { const E2 = D.ENSEMBLES[e]; const m = E2.fx.mj && (E2.fx.mj[type] || (type === 'chaudron' && (E2.fx.mj.chaudron))); if(m){ Object.keys(D.OBJETS).filter(id => D.OBJETS[id].ens === e).forEach(id => { if(!avecEns.includes(id)) avecEns.push(id); }); } });
    let bestPot = null, bp = 0;
    Object.keys(D.POTIONS).forEach(pid => { const P = D.POTIONS[pid]; if(P.fx.mj && P.fx.mj[type] && P.pour.includes(role)){ const d = decalageMods(type, P.fx.mj[type]).total; if(d < bp){ bp = d; bestPot = pid; } } });
    const lo = {talents, equip:avecEns};
    const c = chanceJeu('adulte_moyen', type, 9, lo, bestPot, {plafondValide:true});
    const ce = chanceJeu('enfant', type, 9, lo, bestPot, {plafondValide:true});
    const prix = avecEns.reduce((s, id) => s + D.OBJETS[id].prix, 0);
    const triv = c.auto ? 'GRATUIT (réussir sans jouer ×' + c.auto + ')' : (c.eff <= PR.trivial.niveauMin || c.p >= PR.trivial.chanceMaxAdulteMoyen) ? 'presque gratuit ⚠️' : c.p >= 0.8 ? 'facile' : 'reste dur';
    lignes.push([type, f1(niveauValide(type)), f1(c.eff), Math.round(ce.p * 100) + ' % / ' + Math.round(c.p * 100) + ' %', triv,
      [talents.filter(t => decalageMods(type, modsPour({talents:[t]}, type).mods).total < 0 || autoPour({talents:[t]}, type)).map(t => D.TALENTS[t].nom).join(', '), avecEns.map(id => D.OBJETS[id].nom).join(', '), bestPot ? 'potion ' + D.POTIONS[bestPot].nom : ''].filter(Boolean).join(' ; ') + ' (' + prix + ' po)']);
  }
  console.log(tableau(['Mini-jeu', 'Niveau validé', 'Niveau effectif au pire', 'Enfant / adulte moyen', 'Verdict', 'Ce qui s\'empile (prix des objets)'], lignes));
}

/* Projection de la saison (règles du document de design) et survie sur la saison */
/* Chance de perdre : chaque clé de voûte manquée laisse 2 possibilités au lieu d'une (dans une question au hasard). */
function pPerduCles(pCles, essaisAcc, perr, partiels, pouvoirs, possibilites){
  const v = possibilites || 2;
  /* pCles[i] = chance de réussir le mini-jeu (un essai) ; tries dans pouvoirs.tries[i] ; partiels[i] = chance qu'un raté donne quand même l'indice */
  const n = pCles.length; let pPerdu = 0;
  const somme = d => d.reduce((x, y) => x + y, 0);
  /* on énumère : pour chaque clé, réussie au premier passage ou non ; puis « Encore une fois » sur la première ratée, « Souffler » sur la suivante */
  for(let m = 0; m < (1 << n); m++){
    let pr = 1; const rates = [];
    for(let i = 0; i < n; i++){
      const pOk = 1 - Math.pow(1 - pCles[i], pouvoirs.tries[i]);
      const pFin = 1 - (1 - pOk) * (1 - partiels[i]);
      const rate = !!(m & (1 << i)); pr *= rate ? 1 - pFin : pFin; if(rate) rates.push(i);
    }
    if(pr < 1e-12) continue;
    /* pouvoirs du Sage sur les ratés */
    let dist = [{reste:rates.length, p:1}];
    const appliquer = (pRattrape) => { const nd = []; dist.forEach(d => { if(d.reste > 0){ nd.push({reste:d.reste - 1, p:d.p * pRattrape}); nd.push({reste:d.reste, p:d.p * (1 - pRattrape)}); } else nd.push(d); }); dist = nd; };
    for(let k = 0; k < (pouvoirs.encoreUneFois || 0); k++) if(rates.length) appliquer(pCles[rates[0]]);
    for(let k = 0; k < (pouvoirs.souffler || 0); k++) if(rates.length) appliquer(pouvoirs.soufflerSuffit || 0);
    for(const d of dist){
      const H = []; const nb = Math.pow(2, d.reste); for(let a = 0; a < nb; a++) H.push(['h' + a, 'x']);
      /* deux possibilités dans des questions différentes : le retour « une partie est juste » aide */
      const H2 = []; const q = 1 + Math.ceil(d.reste / 2), o = 1 + Math.floor(d.reste / 2);
      for(let a = 0; a < Math.pow(v, Math.ceil(d.reste / 2)); a++) for(let b = 0; b < Math.pow(v, Math.floor(d.reste / 2)); b++) H2.push(['q' + a, 'o' + b]);
      const win = (1 - perr) * somme(repartitionAccusation(H2, essaisAcc)) + perr * somme(repartitionAccusation(H2, essaisAcc - 1));
      pPerdu += pr * d.p * (1 - win);
    }
  }
  return pPerdu;
}
function pCle(equipe, r, type, k, regle){
  const pr = progression(r, equipe[r], {plafondValide:regle.plafond})[k];
  const enfant = /enfant|naim/.test(equipe[r]);
  let dec = 0;
  if(regle.auto){ const A = CONFIG.autoDifficulte[equipeType(equipe)]; dec = A.niveau[enfant ? 'enfant' : 'adulte']; if(enfant && dec < 0) dec = Math.min(0, dec + (CONFIG.effacementEnfant[k] || 0)); }
  const c = chanceJeu(equipe[r], type, k, {talents:pr.talents, equip:pr.equip}, null, {plafondValide:regle.plafond, decalage:dec});
  return c.auto ? 1 : c.pAvecChance && c.chances ? c.pAvecChance : c.p;
}
function sortieProjection(resultats){
  console.log('\n## La saison entière selon le document de design : chance de perdre chaque enquête, et de finir sans tout recommencer\n');
  console.log('Chaque enquête est résumée par ses indices « clés de voûte » (CONFIG.projection, d\'après DESIGN-saison1.md) : le mini-jeu qui les garde, le nombre d\'essais, l\'indice partiel. Un raté laisse 2 possibilités au lieu d\'une. Le Sage a ses pouvoirs « Encore une fois » et « Souffler » (1 de chaque par enquête), puis l\'accusation avec 3 cœurs et le message « une partie est juste ». La Page des Fondateurs (1 par saison) et l\'Élixir ne sont pas comptés : ce sont des marges en plus.\n');
  const regles = {
    doc:{nom:'document (niveaux actuels, sans difficulté auto)', plafond:false, auto:false, pouvoirs:true},
    sansSage:{nom:'document SANS les pouvoirs du Sage', plafond:false, auto:false, pouvoirs:false},
    propose:{nom:'document + plafond + difficulté auto (proposé)', plafond:true, auto:true, pouvoirs:true}
  };
  const lignes = [], survie = {};
  for(const eq of Object.keys(CONFIG.equipes)){
    const equipe = CONFIG.equipes[eq];
    for(const rk of Object.keys(regles)){
      const R0 = regles[rk];
      let surv = 1; const cells = [];
      for(let k = 1; k <= 9; k++){
        const G = CONFIG.projection[k]; if(!G){ cells.push('?'); continue; }
        const ps = G.cles.map(([r, t]) => pCle(equipe, r, t, k, R0));
        const extraEssai = R0.auto && equipeType(equipe) === 'enfants' ? 1 : 0;
        const pouv = {tries:G.cles.map(c => c[2] + extraEssai), encoreUneFois:R0.pouvoirs ? CONFIG.pouvoirsSage.encoreUneFois : 0, souffler:R0.pouvoirs ? CONFIG.pouvoirsSage.souffler : 0, soufflerSuffit:CONFIG.pouvoirsSage.soufflerSuffit};
        const partiels = G.cles.map(c => R0.auto ? Math.max(c[3], equipeType(equipe) === 'adultes' ? 0 : CONFIG.autoDifficulte[equipeType(equipe)].partiel * (k <= 3 ? 1 : 0.5)) : c[3]);
        const essaisAcc = R0.auto ? CONFIG.autoDifficulte[equipeType(equipe)].essais : CONFIG.essaisAccusation;
        const pPerdu = pPerduCles(ps, essaisAcc, PR.raisonnement[equipe.raisonnement] || 0, partiels, pouv);
        surv *= 1 - pPerdu;
        cells.push(pcv(pPerdu));
      }
      survie[eq + ':' + rk] = surv;
      lignes.push([eq, R0.nom].concat(cells).concat(['**' + pcv(surv) + '**']));
    }
  }
  console.log(tableau(['Équipe', 'Règle', 'E1', 'E2', 'E3', 'E4', 'E5', 'E6', 'E7', 'E8', 'E9', 'Finir la saison sans recommencer'], lignes));
  JSONOUT.projection = survie;
  /* cœurs : 3 partout, ou 2 à partir de l'enquête 5 ou 6 (question ouverte du document de design) */
  console.log('\nLes cœurs (question ouverte du document) : chance de finir la saison sans recommencer, règle proposée, selon le moment où l\'on passe à 2 cœurs. « + élixir » : l\'Alchimiste tente l\'Élixir du Cœur vaillant à chaque enquête (un cœur de plus s\'il réussit son chaudron).\n');
  const l5 = [];
  for(const eq of Object.keys(CONFIG.equipes)){
    const equipe = CONFIG.equipes[eq], R0 = regles.propose;
    const cells = [];
    for(const v of [2, 4]){
      for(const [debut, elixir] of [[99, false], [6, false], [5, false], [6, true], [5, true]]){
        let surv = 1;
        for(let k = 1; k <= 9; k++){
          const G = CONFIG.projection[k];
          const ps = G.cles.map(([r, t]) => pCle(equipe, r, t, k, R0));
          const extraEssai = equipeType(equipe) === 'enfants' ? 1 : 0;
          const pouv = {tries:G.cles.map(c => c[2] + extraEssai), encoreUneFois:CONFIG.pouvoirsSage.encoreUneFois, souffler:CONFIG.pouvoirsSage.souffler, soufflerSuffit:CONFIG.pouvoirsSage.soufflerSuffit};
          const partiels = G.cles.map(c => Math.max(c[3], equipeType(equipe) === 'adultes' ? 0 : CONFIG.autoDifficulte[equipeType(equipe)].partiel * (k <= 3 ? 1 : 0.5)));
          const coeurs = k >= debut ? 2 : 3;
          const perr = PR.raisonnement[equipe.raisonnement] || 0;
          let pp = pPerduCles(ps, coeurs, perr, partiels, pouv, v);
          if(elixir && coeurs < 3){ const pe = pCle(equipe, 'alchimiste', 'chaudron', k, R0); pp = pe * pPerduCles(ps, coeurs + 1, perr, partiels, pouv, v) + (1 - pe) * pp; }
          surv *= 1 - pp;
        }
        cells.push(pcv(surv));
      }
    }
    l5.push([eq].concat(cells));
  }
  console.log(tableau(['Équipe', '3 cœurs partout (2 poss.)', '2 dès E6', '2 dès E5', '2 dès E6 + élixir', '2 dès E5 + élixir', '3 cœurs partout (4 poss.)', '2 dès E6', '2 dès E5', '2 dès E6 + élixir', '2 dès E5 + élixir'], l5));
  /* sensibilité : et si une clé de voûte manquée laissait 4 possibilités au lieu de 2 ? */
  console.log('\nSensibilité : même calcul si chaque clé de voûte manquée laisse 4 possibilités au lieu de 2 (enquêtes où un indice raye beaucoup de monde).\n');
  const l4 = [];
  for(const eq of Object.keys(CONFIG.equipes)){
    const equipe = CONFIG.equipes[eq];
    for(const rk of ['doc', 'propose']){
      const R0 = regles[rk]; let surv = 1; const cells = [];
      for(let k = 1; k <= 9; k++){
        const G = CONFIG.projection[k];
        const ps = G.cles.map(([r, t]) => pCle(equipe, r, t, k, R0));
        const extraEssai = R0.auto && equipeType(equipe) === 'enfants' ? 1 : 0;
        const pouv = {tries:G.cles.map(c => c[2] + extraEssai), encoreUneFois:CONFIG.pouvoirsSage.encoreUneFois, souffler:CONFIG.pouvoirsSage.souffler, soufflerSuffit:CONFIG.pouvoirsSage.soufflerSuffit};
        const partiels = G.cles.map(c => R0.auto ? Math.max(c[3], equipeType(equipe) === 'adultes' ? 0 : CONFIG.autoDifficulte[equipeType(equipe)].partiel * (k <= 3 ? 1 : 0.5)) : c[3]);
        const pp = pPerduCles(ps, R0.auto ? CONFIG.autoDifficulte[equipeType(equipe)].essais : CONFIG.essaisAccusation, PR.raisonnement[equipe.raisonnement] || 0, partiels, pouv, 4);
        surv *= 1 - pp; cells.push(pcv(pp));
      }
      l4.push([eq, R0.nom].concat(cells).concat(['**' + pcv(surv) + '**']));
    }
  }
  console.log(tableau(['Équipe', 'Règle', 'E1', 'E2', 'E3', 'E4', 'E5', 'E6', 'E7', 'E8', 'E9', 'Finir la saison'], l4));
  /* chance de réussir les clés de voûte, par équipe */
  console.log('\nChance de réussir du premier coup chaque mini-jeu clé de voûte (règle proposée) :\n');
  const l2 = [];
  for(let k = 1; k <= 9; k++){
    const G = CONFIG.projection[k];
    l2.push(['E' + k].concat(Object.keys(CONFIG.equipes).map(eq => G.cles.map(([r, t]) => t + ' ' + Math.round(pCle(CONFIG.equipes[eq], r, t, k, regles.propose) * 100)).join(', '))));
  }
  console.log(tableau(['Enquête'].concat(Object.keys(CONFIG.equipes)), l2));
  /* guide d'écriture */
  console.log('\nGuide d\'écriture (enquêtes 4 à 9 : un seul essai, pas d\'indice partiel, avec les pouvoirs du Sage, règle proposée, niveau de l\'enquête 9) : chance de PERDRE selon le nombre de clés de voûte (colonnes) et le nombre de possibilités que laisse UNE clé ratée (lignes).\n');
  const l3 = [];
  for(const eq of ['enfants', 'famille', 'adultes_moyens']){
    const equipe = CONFIG.equipes[eq];
    for(const v of [2, 3, 4]){
      l3.push([eq + ', ' + v + ' possibilités'].concat([2, 3, 4, 5, 6].map(nC => {
        const cles = []; const tours = [['pisteur', 'cachette'], ['alchimiste', 'differences'], ['barde', 'mots'], ['sage', 'plans']];
        for(let i = 0; i < nC; i++) cles.push(tours[i % 4]);
        const ps = cles.map(([r, t]) => pCle(equipe, r, t, 9, regles.propose));
        return pcv(pPerduCles(ps, CONFIG.autoDifficulte[equipeType(equipe)].essais, PR.raisonnement[equipe.raisonnement] || 0, cles.map(() => 0), {tries:cles.map(() => 1), encoreUneFois:1, souffler:1, soufflerSuffit:CONFIG.pouvoirsSage.soufflerSuffit}, v));
      })));
    }
  }
  console.log(tableau(['Équipe, possibilités laissées par une clé ratée', '2 clés', '3 clés', '4 clés', '5 clés', '6 clés'], l3));
}

function sortieReglages(){
  /* charge les vrais mini-jeux avec un faux écran, et montre ce que chaque mod change au niveau 10 */
  const noop = () => {};
  const faux = () => new Proxy(function(){}, {get:(t, k) => k === 'style' ? {} : (k === Symbol.toPrimitive ? () => '' : faux()), apply:() => faux(), set:() => true});
  const doc = {createElement:() => faux(), addEventListener:noop, getElementById:() => null, querySelector:() => null, querySelectorAll:() => [], head:faux(), body:faux(), readyState:'complete', documentElement:faux()};
  const ctx = {console, Math, JSON, setTimeout, clearTimeout, requestAnimationFrame:noop, document:doc, navigator:{}, performance:{now:() => Date.now()}};
  ctx.window = ctx; vm.createContext(ctx);
  const ordre = ['donnees.js', 'mj-core.js', 'mj-pisteur-alchi.js', 'mj-observation.js', 'mj-melange.js', 'mj-bulles.js', 'mj-chaudron.js', 'mj-barde-sage.js', 'mj-sage-plans.js', 'mj-mots.js', 'ragots.js', 'mj-ragots.js', 'mj-sage-codes.js'];
  ordre.forEach(f => { try{ if(fs.existsSync(path.join(SRC, f))) vm.runInContext(fs.readFileSync(path.join(SRC, f), 'utf8'), ctx, {filename:f}); }catch(e){ console.log('  (' + f + ' : ' + e.message + ')'); } });
  const MJ = ctx.MJ;
  const flat = p => { const c = {}; for(const k in p) if(k !== 'lignes' && k !== 'mods' && typeof p[k] !== 'object' && typeof p[k] !== 'function') c[k] = p[k]; return c; };
  console.log('\n## Ce que chaque mod change dans les réglages (niveau 10)\n');
  for(const type of Object.keys(PR.jeux)){
    if(!MJ || !MJ.TYPES[type]) continue;
    const mods = new Map();
    const ajoute = (nom, m) => { const k = JSON.stringify(m); if(!mods.has(k)) mods.set(k, {m, noms:[]}); mods.get(k).noms.push(nom); };
    Object.values(D.TALENTS).concat(Object.values(D.OBJETS)).forEach(x => { const m = x.fx && x.fx.mj && x.fx.mj[type]; if(m) ajoute(x.nom, m); if(x.fx && x.fx.mjTous && PR.jeux[type].minuteur !== false) ajoute(x.nom, x.fx.mjTous); });
    Object.values(D.ENSEMBLES).forEach(x => { const m = x.fx && x.fx.mj && x.fx.mj[type]; if(m) ajoute('Ensemble ' + x.nom, m); });
    Object.values(D.POTIONS).forEach(x => { const m = x.fx && x.fx.mj && x.fx.mj[type]; if(m) ajoute('Potion ' + x.nom, m); });
    if(!mods.size) continue;
    console.log(`\n**${type}**`);
    const base = flat(MJ.TYPES[type].reglages(10, {}));
    for(const {m, noms} of mods.values()){
      let p; try{ p = flat(MJ.TYPES[type].reglages(Math.max(1, 10 - (m.facile || 0)), Object.assign({}, m))); }catch(e){ continue; }
      const d = Object.keys(p).filter(k => JSON.stringify(p[k]) !== JSON.stringify(base[k]) && !/potion|suspect|niveau|nv$/.test(k)).map(k => k + ' ' + (typeof base[k] === 'number' ? +base[k].toFixed(2) : base[k]) + '→' + (typeof p[k] === 'number' ? +p[k].toFixed(2) : p[k]));
      console.log(`- ${noms.join(', ')} ${JSON.stringify(m)} : ${d.join(', ') || '(effet pendant la partie, pas dans les réglages)'} ; estimé ${f1(decalageMods(type, m).total)} niveau(x)`);
    }
  }
}

/* ==========================================================================
   Programme principal
   ========================================================================== */
function main(){
  const ids = (OPT.enquetes.length ? OPT.enquetes : Object.keys(ENQ).map(Number)).filter(k => ENQ[k]).sort((a, b) => a - b);
  console.log('# Brumeval — calculs d\'équilibrage (généré par tools/equilibre.js)\n');
  console.log(`Fichiers lus : ${['donnees.js', 'mj-core.js'].concat(fichiers).join(', ')}, proba-minijeux.json. Parties simulées par case : ${CONFIG.parties}. Rejeu d'un mini-jeu raté : ${CONFIG.rejeu}.`);
  console.log('Rappel : les chances de réussite des mini-jeux sont des SUPPOSITIONS (tools/proba-minijeux.json).');
  if(OPT.reglages){ sortieReglages(); return; }
  const prepAll = {}; ids.forEach(k => { prepAll[k] = preparer(ENQ[k]); });
  const resultats = {};
  ids.forEach(k => {
    sortieEnquete(k, prepAll);
    resultats[k] = {};
    for(const sc of Object.keys(CONFIG.scenarios)){
      resultats[k][sc] = {};
      for(const eq of Object.keys(CONFIG.equipes)){
        const equipe = CONFIG.equipes[eq];
        const plaf = sc.startsWith('propose');
        const los = loadoutsPour(equipe, k, {plafondValide:plaf});
        resultats[k][sc][eq] = simuler(prepAll[k], equipe, CONFIG.scenarios[sc], los, CONFIG.parties, CONFIG.graine + k * 1000, {plafondValide:plaf, plantesConnues:plantesConnuesAvant(k)});
      }
    }
    sortieSimulations(k, prepAll, resultats);
    JSONOUT.enquetes[k].simulations = resultats[k];
  });
  sortieReserve(ids, prepAll);
  sortieProgression();
  sortieJeux();
  sortieEmpilement();
  sortieProjection(resultats);
  if(OPT.json){ fs.writeFileSync(OPT.json, JSON.stringify(JSONOUT, null, 1)); console.log('\nRésultats bruts écrits dans ' + OPT.json); }
}
main();
