/* Vérificateur automatique des enquêtes de Brumeval.
   node tools/verif.js 1 2 3
   - Avec tous les indices : une seule solution.
   - Sans un rôle : au moins deux solutions possibles (chaque rôle est indispensable).
   - Aucun blocage : tout ce qui sert à la solution s'obtient sans talent ni objet de boutique.
   - Budget d'actions : ce qu'il faut faire tient dans les actions disponibles. */
const fs = require('fs'), path = require('path'), vm = require('vm');
const SRC = path.join(__dirname, '..', 'src');
const ctx = {window:{}, console};
vm.createContext(ctx);
['donnees.js', 'e1.js', 'e2.js', 'e3.js', 'souterrains.js'].forEach(f => { const p = path.join(SRC, f); if(fs.existsSync(p)) vm.runInContext(fs.readFileSync(p, 'utf8'), ctx); });
const D = ctx.window.DONNEES, ENQ = ctx.window.ENQUETES;
/* Sous les rues (souterrains.js) : le Pisteur y fouille sans dépenser d'action */
const SOUS = new Set(((ctx.window.SOUTERRAINS || {}).lieux) || []);
const fouilleGratuite = (E, role, lieu) => role === 'pisteur' && (SOUS.has(lieu) || !!(E.lieux[lieu] && E.lieux[lieu].souterrain));
const ROLES = ['pisteur', 'alchimiste', 'barde', 'sage'];
let echecs = 0;

function elements(E){
  const els = [];
  for(const lieu of Object.keys(E.lieux)){
    const L = E.lieux[lieu];
    for(const role of ['pisteur', 'sage']){
      if(!L[role] || !L[role].points) continue;
      for(const p of L[role].points){
        els.push({cle:`${role}:${lieu}:${p.id}`, role, textes:[p.t, p.note, p.rate, p.rateNote].concat((p.variantes || []).flatMap(v => [v.t, v.note])), ok:p.ok, besoins:[L.verrou && (!L.verrou.roles || L.verrou.roles.includes(role)) ? L.verrou.besoin : null, p.besoin, p.visibleSi].filter(Boolean),   /* visibleSi : caché avant (regles.js) ; cacheSi : voir verifierChoixPoints */
          produit:[p.obj ? 'obj:' + p.obj : null, p.donne || null].filter(Boolean), action:fouilleGratuite(E, role, lieu) ? null : {type:'lieu', id:role + ':' + lieu}, gratuit:fouilleGratuite(E, role, lieu) ? lieu : null, moments:p.moments,
          mj:p.mj || null, partiel:!!p.partiel, ouvrePartiel:!!p.ouvrePartiel});
      }
    }
    /* l'Alchimiste (regles.js) : un flacon à remplir (echantillon), une trouvaille en cueillant (trouvaille) */
    const Al = L.alchimiste || {}, vAl = L.verrou && (!L.verrou.roles || L.verrou.roles.includes('alchimiste')) ? [L.verrou.besoin] : [];
    if(Al.echantillon) els.push({cle:`alchimiste:echantillon:${lieu}`, role:'alchimiste', textes:[Al.echantillon.t], besoins:vAl, produit:['obj:' + Al.echantillon.objet], action:{type:'lieu', id:'alchimiste:' + lieu}, moments:Al.echantillon.moments});
    if(Al.trouvaille) els.push({cle:`alchimiste:trouvaille:${lieu}`, role:'alchimiste', textes:[Al.trouvaille.t, Al.trouvaille.note], besoins:vAl, produit:[Al.trouvaille.donne].filter(Boolean), action:{type:'lieu', id:'alchimiste:' + lieu}, moments:Al.trouvaille.moments});
  }
  for(const id of Object.keys(E.pnj || {})){
    const N = E.pnj[id];
    /* au matin, est-il là (et a-t-il le temps de parler) ? Pour « sans le Sage » : personne ne passe le matin (opts.matin) */
    const matin = !!(N.ou && N.ou.matin) && !(N.occupe && N.occupe.matin);
    (N.questions || []).forEach((q, i) => {
      const qm = matin && (!q.moments || q.moments.includes('matin'));
      /* une question à choix dont le bon choix dit un fait (c.si, barde.js choixVisibles) : il faut aussi savoir ce fait */
      const bonSi = ((q.choix || []).find(c => c.bon) || {}).si;
      els.push({cle:`barde:${id}:${i}`, role:'barde', textes:[q.a, q.note, q.vrai, q.noteVrai], ok:q.ok, besoins:[q.besoin, bonSi].filter(Boolean), produit:[q.obj ? 'obj:' + q.obj : null, q.donne || null].filter(Boolean), action:{type:'pnj', id}, matin:qm});
      if(q.ment){
        /* une vérité peut donner un objet (q.objVrai : la pierre de Tim) */
        const pv = [q.objVrai ? 'obj:' + q.objVrai : null, q.donneVrai || null].filter(Boolean);
        els.push({cle:`barde:${id}:${i}:verite`, role:'barde', besoins:[[{cle:`barde:${id}:${i}`}]], produit:pv, action:{type:'pnj', id}, mj:'mensonge', pnj:id, partiel:!!q.partiel, matin:qm});
        /* talent « Exige la vérité » (niveau 2) : la même vérité, sans épreuve, pour 2 interrogatoires au plus (opts.exige) */
        els.push({cle:`barde:${id}:${i}:exige`, alias:`barde:${id}:${i}:verite`, role:'barde', besoins:[[{cle:`barde:${id}:${i}`}], [{talent:'exiger'}]], produit:pv, action:null, pnj:id, exige:true, matin:qm});
      }
    });
    /* vexé, il lâche quand même ce qu'il cachait (N.vexeDonne, barde.js vexeLache : Tim et sa pierre, la nuit) : compté seulement
       dans le pire cas de verifierVexes (opts.vexe), jamais comme un chemin ordinaire */
    if(N.vexeDonne && (N.vexeDonne.obj || N.vexeDonne.info)) els.push({cle:`vexe:${id}`, role:'barde', textes:[N.vexeDonne.a, N.vexeDonne.note], besoins:[N.vexeDonne.besoin].filter(Boolean), produit:[N.vexeDonne.obj ? 'obj:' + N.vexeDonne.obj : 'info:' + N.vexeDonne.info], action:{type:'pnj', id}, vexe:id, moments:N.vexeDonne.moments});
  }
  /* talent « Tendre l'oreille » (niveau 2) : les bribes (E.bribes), des phrases à trous, gratuites, 2 au plus (opts.oreilles) */
  for(const b of E.bribes || []){
    els.push({cle:`barde:oreille:${b.id}`, role:'barde', textes:[b.titre, b.intro, b.t].concat((b.phrases || []).map(x => String(x.texte || '').replace(/[\[\]]/g, ''))), ok:b.ok,
      besoins:[[{talent:'tendre'}]], produit:[], action:null, mj:'trous', oreille:b.id, partiel:false, moments:b.moments});
  }
  for(const id of Object.keys(E.analyses || {})){
    const A = E.analyses[id];
    els.push({cle:`alchimiste:analyse:${id}`, role:'alchimiste', textes:[A.t, A.note, A.detail && A.detail.t].concat((A.variantes || []).flatMap(v => [v.t, v.note])), ok:A.ok, besoins:[[{code:'obj:' + id}]].concat(A.besoin ? [A.besoin] : []), produit:[A.donne || null].filter(Boolean), action:{type:'analyse', id}, mj:A.mj || null, partiel:!!A.partiel});
    /* une variante qui donne un code (11 novembre : les deux pièces d'or, la deuxième analysée donne info:piece) : elle compte quand ses conditions (si) sont là */
    (A.variantes || []).forEach((va, k) => { if(va.donne) els.push({cle:`alchimiste:analyse:${id}:v${k}`, role:'alchimiste', textes:[], besoins:[[{cle:`alchimiste:analyse:${id}`}], va.si || []], produit:[va.donne], action:null}); });
  }
  for(const p of E.pages || []){
    els.push({cle:`sage:page:${p.id}`, role:'sage', textes:[p.t, p.note, p.avant].concat((p.lettres || []).map(l => l.texte)), ok:p.ok, besoins:[p.besoin].filter(Boolean), produit:[p.donne || null].filter(Boolean), action:p.action ? {type:'page', id:p.id} : null, mj:p.mj || null, partiel:!!p.partiel, ouvrePartiel:!!p.ouvrePartiel});
  }
  for(const x of E.ecoutes || []){
    els.push({cle:`${x.role}:ecoute:${x.id}`, role:x.role, textes:[x.t, x.note, x.intro], ok:x.ok, besoins:[x.besoin].filter(Boolean), produit:[], action:{type:'ecoute', id:x.id}, mj:x.mj || null, partiel:!!x.partiel, moments:x.moments});
  }
  /* au matin seulement (opts.matin) : un point, une écoute, une bribe qui ne sont pas là le matin ; un villageois absent le matin */
  els.forEach(e => { if(e.matin === undefined) e.matin = !e.moments || e.moments.includes(E.moments[0]); });
  return els;
}
/* Codes qui ouvrent un lieu (verrou ou besoin d'un lieu : plan, chemin, passage secret) : le moteur les rend
   valables pour les quatre rôles (moteur-base.js, M.codesLieux), quel que soit leur « pour ».
   Les textes qui les donnent ne doivent donc pas dire « code pour le Pisteur ».
   Sauf les chemins secrets du Pisteur (E.chemins, Romain, 5 novembre, 01 h 30) : pour lui seul (verifierChemins, plus bas). */
function codesLieux(E){
  const l = new Set(), seul = new Set((E.chemins || []).map(c => c.code).filter(Boolean));
  const voir = besoin => (besoin || []).forEach(b => { if(!b) return; if(b.code && /^(info|obj):/.test(b.code) && !seul.has(b.code)) l.add(b.code); if(b.et) voir(b.et); });
  for(const id of Object.keys(E.lieux || {})){ const L = E.lieux[id] || {}; voir(L.verrou && L.verrou.besoin); voir(L.besoin); }
  return l;
}
/* Les chemins secrets du Pisteur (E.chemins, carte-jeu.js) : un id unique dans la saison, un code qui existe, pour le Pisteur SEUL
   (jamais « pour toute l'équipe »), donné par quelqu'un ; un lieu d'arrivée qui existe, avec quelque chose pour le Pisteur ;
   un tracé d'au moins deux points dans la carte (1000 × 1400). */
function verifierChemins(E){
  const l = E.chemins || [];
  if(!l.length) return;
  const pb = [], TOUS = /toute l'équipe|chacun peut le taper/i;
  const autres = Object.keys(ENQ).filter(n => +n !== +E.id).flatMap(n => (ENQ[n].chemins || []).map(c => c.id));
  const tout = analyser(E, ROLES);
  l.forEach(c => {
    const ou = 'chemin ' + (c.id || '?');
    if(!c.id) pb.push(ou + ' : sans id');
    if(autres.includes(c.id) || l.filter(x => x.id === c.id).length > 1) pb.push(ou + ' : id déjà pris dans la saison');
    if(!c.nom) pb.push(ou + ' : sans nom');
    if(!Array.isArray(c.pts) || c.pts.length < 2 || c.pts.some(q => !Array.isArray(q) || q[0] < 0 || q[0] > 1000 || q[1] < 0 || q[1] > 1400)) pb.push(ou + ' : tracé (pts) invalide');
    if(c.vers && !((E.lieux || {})[c.vers] || {}).pisteur) pb.push(ou + ' : mène à ' + c.vers + ', où le Pisteur n\'a rien');
    if(!c.code) return;
    const [t, x] = c.code.split(':'), I = t === 'info' ? (E.infos || {})[x] : t === 'obj' ? (E.objets || {})[x] : null;
    if(!I){ pb.push(ou + ' : code inconnu ' + c.code); return; }
    if(I.pour !== 'pisteur') pb.push(`${ou} : ${c.code} doit être pour:'pisteur' (pas ${JSON.stringify(I.pour)})`);
    if(TOUS.test([I.t, I.dire].filter(Boolean).join(' '))) pb.push(`${ou} : ${c.code} dit encore « pour toute l'équipe »`);
    const prod = tout.els.filter(e => e.produit.includes(c.code));
    if(!prod.length) pb.push(`${ou} : personne ne donne ${c.code}`);
    prod.forEach(e => (e.textes || []).forEach(tx => { if(tx && TOUS.test(tx)) pb.push(`${ou} : ${e.cle} dit encore « pour toute l'équipe »`); }));
  });
  if(pb.length){ echecs++; console.log('  ✗ Chemins secrets du Pisteur : ' + pb.join(' ; ')); }
  else console.log('  ✓ Chemins secrets du Pisteur : ' + l.map(c => `${c.id} (${c.code} → ${c.vers || 'aucun lieu'})`).join(', ') + ', pour lui seul');
}
function verifierCodesLieux(E){
  const codes = codesLieux(E), pb = [];
  const UN_SEUL = /(pour|au|à)\s+(ton ami\s+|ton amie\s+)?(le\s+|la\s+|l')?(pisteur|pisteuse|alchimiste|barde|sage)\b/i;
  const voir = (cle, textes) => textes.filter(Boolean).forEach(t => { const m = t.match(UN_SEUL); if(m) pb.push(cle + ' : « ' + m[0] + ' »'); });
  for(const c of codes){
    const x = c.split(':')[1], I = c.startsWith('info:') ? (E.infos || {})[x] : (E.objets || {})[x];
    if(!I){ pb.push(c + ' : code inconnu'); continue; }
    voir(c, [I.t]);
  }
  /* ce qui donne ces codes : points des lieux, questions du Barde, analyses, pages du Grand Livre */
  for(const lieu of Object.keys(E.lieux || {})) for(const role of ROLES){
    const R = (E.lieux[lieu] || {})[role];
    ((R && R.points) || []).forEach(p => { if(codes.has(p.donne) || codes.has('obj:' + p.obj)) voir(`${role}:${lieu}:${p.id}`, [p.t, p.note]); });
  }
  for(const id of Object.keys(E.pnj || {})) (E.pnj[id].questions || []).forEach((q, i) => { if(codes.has(q.donne) || codes.has('obj:' + q.obj)) voir(`barde:${id}:${i}`, [q.a, q.note]); });
  for(const id of Object.keys(E.analyses || {})){ const A = E.analyses[id]; if(codes.has(A.donne)) voir('analyse:' + id, [A.t, A.note]); }
  for(const p of E.pages || []) if(codes.has(p.donne)) voir('page:' + p.id, [p.t, p.note]);
  if(pb.length){ echecs++; console.log('  ✗ Codes de lieu présentés comme pour un seul rôle : ' + pb.join(' ; ')); }
  else console.log('  ✓ Codes de lieu pour toute l\'équipe : ' + ([...codes].join(', ') || 'aucun'));
}
/* Les codes de lieu marchent pour tous : l'Alchimiste peut cueillir derrière un verrou dès que l'équipe a le code */
function ingredientsObtenables(E, codes){
  const ok = new Set(Object.keys((E.depart && E.depart.alchimiste && E.depart.alchimiste.ingr) || {}));
  for(const lieu of Object.keys(E.lieux)){
    const L = E.lieux[lieu];
    if(!L.alchimiste || !L.alchimiste.cueillir) continue;
    if(L.verrou && !(L.verrou.besoin || []).some(b => b.code && codes.has(b.code))) continue;
    L.alchimiste.cueillir.forEach(c => { if(!c.besoin) ok.add(c.ingr); });
  }
  return ok;
}
/* opts (facultatif) : {talents:Set, oreilles:Set des bribes écoutées, exige:Set des villageois où l'on exige la vérité} */
function analyser(E, roles, echecs, opts){
  opts = opts || {};
  const tal = opts.talents || new Set();
  const els = elements(E);
  const obtenu = new Set(), codes = new Set();
  const recettes = new Set(D.RECETTES_DE_BASE.concat(E.recettes || []));
  let change = true;
  function condOk(b, role){
    if(b.cle) return obtenu.has(b.cle);
    if(b.page) return obtenu.has('sage:page:' + b.page);
    if(b.analyse) return obtenu.has('alchimiste:analyse:' + b.analyse);
    if(b.code) return codes.has(b.code);
    if(b.vu){ const mv = /^verite:([a-z_]+):(\d+)$/.exec(b.vu); return obtenu.has(mv ? `barde:${mv[1]}:${mv[2]}:verite` : b.vu); }   /* « verite:tim:1 » (le jeu) = « barde:tim:1:verite » (ici) */
    if(b.moment) return !opts.matin || b.moment === E.moments[0];
    if(b.et) return b.et.every(x => condOk(x, role));
    if(b.outil) return false;   /* outil de saison : pas garanti, il faut toujours un autre chemin */
    if(b.talent) return tal.has(b.talent);
    if(b.acces){
      return Object.keys(D.POTIONS).some(pid => (D.POTIONS[pid].fx.acces || []).includes(b.acces) && D.POTIONS[pid].pour.includes(role) && codes.has('pot:' + pid));
    }
    return false;
  }
  while(change){
    change = false;
    if(roles.includes('alchimiste')){
      const ingr = ingredientsObtenables(E, codes);
      for(const r of recettes){
        if(codes.has('pot:' + r)) continue;
        const R = D.RECETTES[r];
        if(R.secrete && !obtenu.has('sage:page:recettes')) continue;
        if(R.ingr.every(x => ingr.has(x[0]))){ codes.add('pot:' + r); change = true; }
      }
    }
    for(const e of els){
      if(obtenu.has(e.cle) || !roles.includes(e.role)) continue;
      if(e.oreille && !(opts.oreilles && opts.oreilles.has(e.oreille))) continue;
      if(e.exige && !(opts.exige && opts.exige.has(e.pnj))) continue;
      if(e.vexe && opts.vexe !== e.vexe) continue;   /* le filet d'un villageois vexé : seulement quand on l'a vexé (verifierVexes) */
      if(opts.matin && !e.matin) continue;   /* sans le Sage, personne ne passe au moment suivant : seulement le matin */
      /* un mini-jeu raté deux fois : fermé. Seul l'indice partiel (rate) reste, s'il suffit (partiel:true) ; aucun code n'est donné,
         sauf ouvrePartiel (le code est donné quand même, avec l'indice partiel) */
      const rate = echecs && echecs.has(e.cle);
      if(rate && !e.partiel) continue;
      if(e.besoins.every(alt => alt.some(b => condOk(b, e.role)))){
        obtenu.add(e.cle); if(e.alias) obtenu.add(e.alias); if(!rate || e.ouvrePartiel) e.produit.forEach(c => codes.add(c)); change = true;
      }
    }
  }
  return {obtenu, codes, els};
}
function candidats(E, obtenu){
  const reste = {qui:new Set(E.qui.choix)};
  if(E.ou) reste.ou = new Set(E.ou.choix.map(x => x.id));
  if(E.quoi) reste.quoi = new Set(E.quoi.choix.map(x => x.id));
  if(E.pourquoi) reste.pourquoi = new Set(E.pourquoi.choix.map(x => x.id));   /* l'enquête 2 : POURQUOI */
  for(const f of E.faits){
    const ok = f.sources.every(s => Array.isArray(s) ? s.some(x => obtenu.has(x)) : obtenu.has(s));
    if(!ok) continue;
    for(const d of ['qui', 'ou', 'quoi', 'pourquoi']) (f[d] || []).forEach(x => reste[d] && reste[d].delete(x));
  }
  return reste;
}
function taille(r){ return Object.values(r).reduce((a, s) => a * s.size, 1); }
function verifierMissions(E){
  if(!E.etapes){ console.log('  ✗ Pas de missions de base (E.etapes)'); echecs++; return; }
  const pb = [], resume = [];
  const pageOk = id => (E.pages || []).some(p => p.id === id);
  function point(k){ const p = k.split(':'); const L = E.lieux[p[1]]; return !!(L && L[p[0]] && (L[p[0]].points || []).some(x => x.id === p[2])); }
  function vu(k){
    const p = k.split(':');
    if(p[0] === 'pisteur' || p[0] === 'sage') return point(k);
    if(p[0] === 'barde'){ const N = (E.pnj || {})[p[1]]; return !!(N && N.questions[+p[2]]); }
    if(p[0] === 'verite'){ const N = (E.pnj || {})[p[1]]; return !!(N && N.questions[+p[2]] && N.questions[+p[2]].ment); }
    if(p[0] === 'ecoute' || p[0] === 'ecoute2') return (E.ecoutes || []).some(x => x.id === p[1]);
    if(p[0] === 'oreille') return (E.bribes || []).some(x => x.id === p[1]);
    if(p[0] === 'trous'){   /* une phrase à trous complétée (barde.js) : trous:ecoute:x, trous:oreille:x, trous:bonus:x */
      const l = {ecoute:E.ecoutes, oreille:E.bribes, bonus:E.bonus}[p[1]] || [];
      return l.some(x => x.id === p[2] && (p[1] !== 'ecoute' || x.mj === 'trous') && (p[1] !== 'bonus' || x.trous));
    }
    if(p[0] === 'page') return pageOk(p[1]);
    if(p[0] === 'rassemblement') return !!E.rassemblement;   /* le rassemblement du Barde (barde.js) */
    return false;
  }
  function finiOk(k){   /* « fini » : un mini-jeu réussi ou fermé après deux échecs */
    const p = k.split(':');
    if(p[1] === 'analyse') return !!((E.analyses || {})[p[2]] || {}).mj;
    if(p[1] === 'page') return !!((E.pages || []).find(x => x.id === p[2]) || {}).mj;
    if(p[1] === 'ecoute') return !!((E.ecoutes || []).find(x => x.id === p[2]) || {}).mj;
    const L = E.lieux[p[1]], R = L && L[p[0]];
    return !!(R && (R.points || []).some(x => x.id === p[2] && x.mj));
  }
  function code(c){ const [t, x] = c.split(':'); return t === 'pot' ? !!D.POTIONS[x] : t === 'obj' ? !!(E.objets || {})[x] : t === 'info' ? !!(E.infos || {})[x] : false; }
  function cond(b, ou){
    if(b.ou) return b.ou.forEach(x => cond(x, ou)); if(b.et) return b.et.forEach(x => cond(x, ou));
    if(b.vu && !vu(b.vu)) pb.push(ou + ' vu ' + b.vu);
    if(b.essaye && !point(b.essaye)) pb.push(ou + ' essaye ' + b.essaye);
    if(b.fini && !finiOk(b.fini)) pb.push(ou + ' fini ' + b.fini + ' (pas un mini-jeu)');
    if(b.page && !pageOk(b.page)) pb.push(ou + ' page ' + b.page);
    if(b.lu && !pageOk(b.lu)) pb.push(ou + ' lu ' + b.lu);
    if(b.analyse && !(E.analyses || {})[b.analyse]) pb.push(ou + ' analyse ' + b.analyse);
    if(b.code && !code(b.code)) pb.push(ou + ' code ' + b.code);
    if(b.donne && !code(b.donne)) pb.push(ou + ' donne ' + b.donne);
    if(b.potion && !D.POTIONS[b.potion]) pb.push(ou + ' potion ' + b.potion);
    if(b.ingr) Object.keys(b.ingr).forEach(k => { if(!D.INGR[k]) pb.push(ou + ' ingr ' + k); });
  }
  for(const role of ROLES){
    const L = E.etapes[role] || [];
    const n = L.filter(e => !e.libre && !e.piste).length;   /* les « Piste : … » ne comptent pas comme missions */
    resume.push(`${role} ${n}`);
    const max = E.niveau === 1 ? 10 : 4;   /* l'enquête 1 est un tutoriel : tout est décrit, endroit par endroit */
    if(n < 2 || n > max) pb.push(`${role} : ${n} missions (2 à ${max} attendues)`);
    L.forEach((e, i) => { [].concat(e.lieu || []).forEach(l => { if(!E.lieux[l] && !(E.pnj && Object.keys(E.pnj).some(p => Object.values(E.pnj[p].ou || {}).indexOf(l) >= 0))) pb.push(`${role}[${i}] lieu inconnu ${l}`); }); });
    L.forEach((e, i) => {
      const ou = `${role}[${i}]`;
      if(!e.t) pb.push(ou + ' sans texte');
      if(!e.libre && !e.piste && !e.manuel && !(e.fait && e.fait.length)) pb.push(ou + ' sans condition');
      (e.fait || []).forEach(b => cond(b, ou));
      if(E.sensibles && !e.libre){ const t = e.t.toLowerCase(); E.sensibles.forEach(m => { if(new RegExp('(^|[^a-zà-ÿ])' + m.toLowerCase()).test(t)) pb.push(ou + ' trahit : ' + m); }); }
    });
  }
  if(pb.length){ echecs++; console.log('  ✗ Missions de base : ' + pb.join(' ; ')); }
  else console.log('  ✓ Missions de base : ' + resume.join(', ') + ' (toutes visent du contenu qui existe)');
}
/* Renseignements « pour le Barde » sur un habitant (E.infos.x = {pour:'barde', de, pnj, t}) :
   le Barde est l'informateur des habitants. Chaque code doit : être donné par le rôle « de » (point, analyse ou page),
   viser un habitant qui a un visage dans le Carnet du Barde, et ne pas en dire plus que l'indice d'origine.
   3 à 6 codes par enquête : les enfants ne doivent pas taper 15 codes. */
function verifierCodesBarde(E){
  const pb = [], liste = [];
  const gens = new Set([].concat(E.qui.choix || [], Object.keys(E.pnj || {}), ((E.quoi && E.quoi.choix) || []).filter(c => c.pnj).map(c => c.id)));
  gens.delete('voisin');
  const tout = analyser(E, ROLES);
  for(const x of Object.keys(E.infos || {})){
    const I = E.infos[x]; if(!I.pnj) continue;
    const code = 'info:' + x, cibles = typeof I.pnj === 'string' ? {[I.pnj]: I.t} : I.pnj;
    liste.push(x);
    /* pour le Barde (et parfois aussi pour le Sage, qui accuse : Tim au Vieux Chêne, enquête 2) */
    if(!(I.pour === 'barde' || (Array.isArray(I.pour) && I.pour.includes('barde')))) pb.push(`${code} : un renseignement sur un habitant est « pour:'barde' »`);
    if(!['sage', 'alchimiste', 'pisteur'].includes(I.de)) pb.push(`${code} : « de » doit être sage, alchimiste ou pisteur`);
    for(const id of Object.keys(cibles)){
      if(!D.PNJ[id]) pb.push(`${code} : habitant inconnu ${id}`);
      else if(!gens.has(id)) pb.push(`${code} : ${id} n'a pas de visage dans le Carnet du Barde`);
      if(!String(cibles[id] || '').trim()) pb.push(`${code} : rien à écrire sur ${id}`);
    }
    const prod = tout.els.filter(e => e.produit.includes(code));
    if(!prod.length){ pb.push(`${code} : personne ne le donne`); continue; }
    if(!prod.some(e => tout.obtenu.has(e.cle))) pb.push(`${code} : jamais obtenu`);
    prod.forEach(e => { if(e.role !== I.de) pb.push(`${code} : donné par ${e.role}, pas par ${I.de}`); });
    /* pas plus bavard que l'indice d'origine : un mot sensible du code doit déjà être dans ce qui le donne */
    const reg = Object.keys(E.registre || {}).map(k => E.registre[k].note || '');
    const txtProd = prod.flatMap(e => (e.textes || []).concat(e.cle.endsWith(':page:habitants') ? reg : [])).filter(Boolean).join(' ').toLowerCase();
    const txtInfo = [I.t].concat(Object.values(cibles)).filter(Boolean).join(' ').toLowerCase();
    (E.sensibles || []).forEach(m => { const re = new RegExp('(^|[^a-zà-ÿ])' + m.toLowerCase()); if(re.test(txtInfo) && !re.test(txtProd)) pb.push(`${code} en dit plus que l'indice d'origine (« ${m} »)`); });
  }
  /* un point (ou une analyse, une page) ne montre qu'un seul code : pas d'objet ET de renseignement au même endroit */
  tout.els.forEach(e => { if(e.produit.length > 1) pb.push(`${e.cle} donne deux codes (${e.produit.join(' + ')}) : un seul s'afficherait`); });
  if(liste.length > 6) pb.push(`${liste.length} codes pour le Barde (6 au plus)`);
  if(pb.length){ echecs++; console.log('  ✗ Renseignements pour le Barde : ' + pb.join(' ; ')); }
  else console.log(`  ✓ Renseignements pour le Barde : ${liste.length} code(s) (${liste.join(', ') || 'aucun'}), chacun donné par son rôle et noté sur un visage du Barde`);
}
/* Les photos du tableau de liège du Barde (E.liege = {pnj, lieux}) : tous les suspects et tous les lieux du OÙ
   y sont (sinon celui qui manque, ou celui qui est seul en plus, trahirait la réponse), et tout existe. */
function verifierLiege(E){
  if(!E.liege){ console.log('  ✓ Tableau de liège : liste par défaut (QUI et OÙ)'); return; }
  const pb = [], Lg = E.liege, pnj = Lg.pnj || [], lieux = Lg.lieux || [];
  let LIEUX = {};
  try{ const c = {window:{}, console}; vm.createContext(c); vm.runInContext(fs.readFileSync(path.join(SRC, 'carte.js'), 'utf8'), c); LIEUX = c.window.Carte.LIEUX || {}; }catch(e){}
  const ou = ((E.ou && E.ou.choix) || []).map(c => c.id);
  [].concat(E.qui.choix || [], ((E.quoi && E.quoi.choix) || []).filter(c => c.pnj).map(c => c.id)).forEach(id => { if(!pnj.includes(id)) pb.push(`suspect absent : ${id}`); });
  ou.forEach(id => { if(!lieux.includes(id)) pb.push(`lieu du OÙ absent : ${id}`); });
  pnj.forEach(id => { if(!D.PNJ[id] || id === 'voisin') pb.push(`habitant inconnu : ${id}`); });
  lieux.forEach(id => { if(!ou.includes(id) && !LIEUX[id]) pb.push(`lieu inconnu : ${id}`); else if(LIEUX[id] && LIEUX[id].zone === 'dessous') pb.push(`lieu secret (souterrain) : ${id}`); });
  if(pb.length){ echecs++; console.log('  ✗ Tableau de liège : ' + pb.join(' ; ')); }
  else console.log(`  ✓ Tableau de liège : ${pnj.length} habitants, ${lieux.length} lieux (tous les suspects et tous les lieux du OÙ)`);
}
/* Deux essais au plus par mini-jeu : après deux échecs, le point est fermé pour toute l'enquête.
   Pour chaque mini-jeu (et chaque habitant à démasquer) qu'on rate pour de bon : l'enquête doit rester soluble.
   - « clé » : sans lui, plusieurs solutions restent ; il lui faut un indice partiel (rate + partiel:true) qui garde le fait ;
   - sinon, il peut simplement se fermer (les autres indices suffisent). */
function verifierEchecs(E){
  const els = elements(E), pb = [], cles = [], fermes = [];
  const groupes = {};   /* un habitant raté deux fois au démasquage : tous ses mensonges restent cachés */
  els.filter(e => e.mj && !e.oreille).forEach(e => { const g = e.mj === 'mensonge' ? 'démasquer ' + e.pnj : e.cle; (groupes[g] = groupes[g] || []).push(e); });
  for(const g of Object.keys(groupes)){
    const set = new Set(groupes[g].map(e => e.cle));
    const a = analyser(E, ROLES, set), r = candidats(E, a.obtenu), n = taille(r);
    const partiels = groupes[g].filter(e => e.partiel).length;
    if(n === 1 && Object.keys(r).every(d => r[d].has(E.solution[d]))){ (partiels ? cles : fermes).push(g + (partiels ? ' (partiel)' : '')); continue; }
    pb.push(`${g} raté deux fois : ${n} solutions (${Object.keys(r).map(d => d + ' ' + [...r[d]].join('|')).join(', ')})`);
  }
  /* un indice partiel doit exister vraiment : un texte d'échec (rate) et une note (rateNote / noteRate) */
  const voir = (cle, x) => { if(x.partiel && !(x.rate && (x.rateNote || x.noteRate))) pb.push(`${cle} : partiel:true sans rate + rateNote`); };
  for(const l of Object.keys(E.lieux)) for(const r of ROLES) ((E.lieux[l][r] || {}).points || []).forEach(p => voir(`${r}:${l}:${p.id}`, p));
  Object.keys(E.analyses || {}).forEach(a => voir('analyse:' + a, E.analyses[a]));
  (E.pages || []).forEach(p => voir('page:' + p.id, p));
  (E.ecoutes || []).forEach(x => voir('ecoute:' + x.id, x));
  if(pb.length){ echecs++; console.log('  ✗ Deux échecs sur un mini-jeu clé, sans indice partiel suffisant : ' + pb.join(' ; ')); }
  else console.log(`  ✓ Deux essais par mini-jeu : l'enquête reste soluble après n'importe quel échec. Clés gardées par un indice partiel : ${cles.join(', ') || 'aucune'} ; les autres se ferment simplement (${fermes.length})`);
}
/* Le nouveau Barde (barde.js) : questions à choix (une seule bonne façon, un texte de vexation pour les autres)
   et secrets de menteur (mimique) donnés par une question, un code, une écoute ou une bribe : sur quelqu'un qui ment vraiment. */
function verifierChoix(E){
  const pb = [], menteurs = new Set(Object.keys(E.pnj || {}).filter(id => (E.pnj[id].questions || []).some(q => q.ment)));
  let n = 0;
  const mim = (ou, ids) => [].concat(ids || []).forEach(id => { if(!D.PNJ[id] || !(E.pnj || {})[id]) pb.push(`${ou} : secret de menteur pour ${id}, qui n'est pas interrogé`); else if(!menteurs.has(id)) pb.push(`${ou} : secret de menteur pour ${id}, qui ne ment jamais ici`); });   /* un id, ou une liste (Margot, enquête 2) */
  for(const id of Object.keys(E.pnj || {})) (E.pnj[id].questions || []).forEach((q, i) => {
    mim(`barde:${id}:${i}`, q.mimique);
    if(!q.choix) return;
    n++;
    const bons = q.choix.filter(c => c.bon).length;
    if(!q.q) pb.push(`barde:${id}:${i} : une question à choix a besoin d'un titre (q)`);
    if(bons !== 1) pb.push(`barde:${id}:${i} : ${bons} bonnes façons de demander (il en faut une)`);
    q.choix.forEach((c, k) => { if(!c.q) pb.push(`barde:${id}:${i} choix ${k} sans texte`); if(!c.bon && !c.vexe) pb.push(`barde:${id}:${i} choix ${k} : maladroit sans texte de vexation`); });
    /* q.nbChoix : on en montre au plus ce nombre, parmi ceux que le Barde sait (c.si) ; il faut assez de choix sans fait pour remplir la liste */
    const vus = q.nbChoix || q.choix.length, libres = q.choix.filter(c => !c.bon && !c.si).length;
    if(vus < 2 || vus > 3) pb.push(`barde:${id}:${i} : ${vus} façons montrées (2 ou 3 attendues)`);
    if(q.nbChoix && libres < q.nbChoix - 1) pb.push(`barde:${id}:${i} : pas assez de choix sans fait nouveau (${libres}) pour en montrer ${q.nbChoix}`);
    if(!q.nbChoix && q.choix.some(c => c.si)) pb.push(`barde:${id}:${i} : des choix qui disent un fait (si) sans nbChoix`);
  });
  Object.keys(E.infos || {}).forEach(x => mim('info:' + x, E.infos[x].mimique));
  (E.ecoutes || []).forEach(x => mim('ecoute:' + x.id, x.mimique));
  (E.bribes || []).forEach(b => mim('oreille:' + b.id, b.mimique));
  if(pb.length){ echecs++; console.log('  ✗ Questions à choix et secrets de menteur : ' + pb.join(' ; ')); }
  else console.log(`  ✓ Questions à choix : ${n} (une seule bonne façon chacune) ; secrets de menteur sur de vrais menteurs`);
}
/* Le double contrôle des talents du niveau 2 (Romain : à l'enquête 2, le Barde a forcément Tendre l'oreille OU Exige la vérité).
   Pour chacun, au mieux de ses 2 usages (2 bribes, ou 2 interrogatoires) :
   - toujours juste : quel que soit l'usage, une seule solution, la bonne ;
   - pas trop facile : sans le Pisteur, l'Alchimiste ou le Sage, il reste au moins 2 solutions ;
   - survivable : après n'importe quel mini-jeu raté deux fois, l'enquête reste soluble ;
   - utile : le talent ouvre un chemin vers au moins un fait ;
   - et pour information : un Barde qui rate toutes ses épreuves (démasquer, écoutes, dépositions), combien de solutions sans et avec. */
function paires(l){ if(l.length <= 2) return [l]; const r = []; for(let i = 0; i < l.length; i++) for(let j = i + 1; j < l.length; j++) r.push([l[i], l[j]]); return r; }
function verifierTalents(E){
  if((E.niveau || E.id) < 2) return;
  const NOMS = {tendre:'Tendre l\'oreille', exiger:'Exige la vérité'};
  const pb = [], resume = [], els = elements(E);
  const bribes = (E.bribes || []).map(b => b.id);
  const menteurs = Object.keys(E.pnj || {}).filter(id => (E.pnj[id].questions || []).some(q => q.ment));
  const sources = new Set(E.faits.flatMap(f => f.sources.flat()));
  const groupes = {};
  els.filter(e => e.mj && !e.oreille).forEach(e => { const g = e.mj === 'mensonge' ? 'démasquer ' + e.pnj : e.cle; (groupes[g] = groupes[g] || new Set()).add(e.cle); });
  const juste = r => taille(r) === 1 && Object.keys(r).every(d => r[d].has(E.solution[d]));
  for(const T of ['tendre', 'exiger']){
    const choix = T === 'tendre' ? paires(bribes) : paires(menteurs);
    if(!choix.length || !choix[0].length){ pb.push(`${NOMS[T]} : rien à quoi servir dans cette enquête`); continue; }
    const opt = c => T === 'tendre' ? {talents:new Set([T]), oreilles:new Set(c)} : {talents:new Set([T]), exige:new Set(c)};
    for(const c of choix){ const r = candidats(E, analyser(E, ROLES, null, opt(c)).obtenu); if(!juste(r)) pb.push(`${NOMS[T]} [${c.join(' + ')}] : ${taille(r)} solutions`); }
    for(const role of ['pisteur', 'alchimiste', 'sage']){
      let min = Infinity;
      for(const c of choix) min = Math.min(min, taille(candidats(E, analyser(E, ROLES.filter(x => x !== role), null, Object.assign(opt(c), sansSage(role))).obtenu)));
      if(min < 2) pb.push(`${NOMS[T]} : sans le ${role}, il ne reste qu'une solution (trop facile)`);
    }
    for(const g of Object.keys(groupes)){
      if(!choix.some(c => juste(candidats(E, analyser(E, ROLES, groupes[g], opt(c)).obtenu)))) pb.push(`${NOMS[T]} : ${g} raté deux fois, plus soluble`);
    }
    const siens = T === 'tendre' ? bribes.map(b => 'barde:oreille:' + b) : menteurs.flatMap(id => E.pnj[id].questions.map((q, i) => q.ment ? `barde:${id}:${i}:verite` : null).filter(Boolean));
    const utiles = siens.filter(s => sources.has(s));
    if(!utiles.length) pb.push(`${NOMS[T]} ne sert à aucun fait`);
    const tout = new Set([].concat(...Object.values(groupes).map(s => [...s])).filter(k => k.startsWith('barde:')));
    const n0 = taille(candidats(E, analyser(E, ROLES, tout).obtenu));
    let nT = Infinity; for(const c of choix) nT = Math.min(nT, taille(candidats(E, analyser(E, ROLES, tout, opt(c)).obtenu)));
    resume.push(`${NOMS[T]} (${choix.length} usage${choix.length > 1 ? 's' : ''} essayé${choix.length > 1 ? 's' : ''}) : sert à ${utiles.join(', ')} ; un Barde qui rate toutes ses épreuves : ${n0} → ${nT} solution(s)`);
  }
  if(pb.length){ echecs++; console.log('  ✗ Talents du niveau 2 : ' + pb.join(' ; ')); }
  else console.log('  ✓ Talents du niveau 2, l\'un ou l\'autre : toujours juste, jamais trop facile, survivable.\n      ' + resume.join('\n      '));
}
/* Sans le Sage, personne ne donne les codes des moments : l'équipe reste au premier moment (enquêtes sans points d'action) */
function sansSage(role){ return role === 'sage' ? {matin:true} : null; }
/* (Le verrou de l'accusation, E.verrouAccusation, et le petit matin : supprimés le 5 novembre, 01 h 36 ; le Sage accuse quand il veut.
   Une enquête qui en aurait encore un est refusée : verifierPlusDeVerrou.) */
function verifierPlusDeVerrou(E){
  if(!E.verrouAccusation) return;
  echecs++; console.log('  ✗ E.verrouAccusation : plus de verrou sur l\'accusation (Romain, 5 novembre, 01 h 36), à enlever');
}
/* Une page du Grand Livre « un peu obligatoire » (p.obligatoire : livre.js ouvre le livre dessus) : elle doit pouvoir se faire sans rien
   d'autre (pas de besoin, pas de mini-jeu, pas d'action), sinon le Sage atterrirait sur une page qu'il ne peut pas faire. */
function verifierObligatoires(E){
  const l = (E.pages || []).filter(p => p.obligatoire);
  if(!l.length) return;
  const pb = [];
  l.forEach(p => { if(p.besoin) pb.push(p.id + ' : un besoin'); if(p.mj) pb.push(p.id + ' : un mini-jeu'); if(p.action) pb.push(p.id + ' : une action'); if(p.dans) pb.push(p.id + ' : rangée dans une autre page'); });
  if(pb.length){ echecs++; console.log('  ✗ Pages obligatoires du Grand Livre : ' + pb.join(' ; ')); }
  else console.log('  ✓ Pages obligatoires du Grand Livre (le livre s\'y ouvre) : ' + l.map(p => p.id + (p.moments ? ' (' + p.moments.join(', ') + ')' : '')).join(', ') + ', sans condition');
}
/* Un villageois vexé la nuit (Romain, 4 novembre, 22 h 43 : accusé à tort, il ne parle plus jusqu'au moment suivant ; la nuit, plus du tout).
   Le pire cas : on ne l'avait pas encore interrogé. On enlève tout ce qu'il dit : l'enquête est-elle encore résoluble ?
   Un avertissement (⚠) seulement : c'est une information pour décider, pas une erreur. */
/* Un point qui finit sur un choix (p.choix, enquête 2 : au moulin la nuit, entrer ou suivre l'homme en cape) : quel que soit le chemin pris,
   l'enquête doit rester gagnable. Une option qui en cache une autre (p.cacheSi : [{vu:option}]) : on enlève celle qu'elle cache. */
function verifierChoixPoints(E){
  const l = [], cache = {};
  for(const lieu of Object.keys(E.lieux || {})) for(const role of ['pisteur', 'sage']) ((E.lieux[lieu][role] || {}).points || []).forEach(p => {
    cache[`${role}:${lieu}:${p.id}`] = (p.cacheSi || []).filter(b => b.vu).map(b => b.vu);
    if(p.choix) l.push({cle:`${role}:${lieu}:${p.id}`, opts:p.choix.map(o => `${role}:${lieu}:${o}`)});
  });
  if(!l.length) return;
  const pb = [];
  l.forEach(c => c.opts.forEach(o => {
    const a = analyser(E, ROLES, new Set(c.opts.filter(x => x !== o && (cache[x] || []).includes(o)))), r = candidats(E, a.obtenu);
    const juste = Object.keys(r).every(d => r[d].size === 1 && r[d].has(E.solution[d]));
    if(!a.obtenu.has(o) || !juste) pb.push(`${c.cle} → ${o}` + (a.obtenu.has(o) ? '' : ' (jamais atteint)') + (juste ? '' : ' (plus résoluble)'));
  }));
  if(pb.length){ echecs++; console.log('  ✗ Un choix qui bloque l\'enquête : ' + pb.join(' ; ')); }
  else console.log('  ✓ Choix (' + l.map(c => c.cle + ' : ' + c.opts.map(o => o.split(':')[2]).join(' / ')).join(' ; ') + ') : chaque chemin mène à la solution');
}
function verifierVexes(E){
  const els = elements(E), pb = [];
  for(const id of Object.keys(E.pnj || {})){
    if(id === 'voisin') continue;   /* une porte : pas de 🤥, personne à vexer */
    const siens = new Set(els.filter(e => e.cle.startsWith('barde:' + id + ':')).map(e => e.cle));
    if(!siens.size) continue;
    const a = analyser(E, ROLES, siens, {vexe:id}), r = candidats(E, a.obtenu);   /* vexé : son filet éventuel (N.vexeDonne) compte */
    const juste = Object.keys(r).every(d => r[d].size === 1 && r[d].has(E.solution[d]));
    if(!juste) pb.push(id + ' (plus résoluble : ' + Object.keys(r).filter(d => r[d].size !== 1).map(d => d + ' ' + r[d].size).join(', ') + ')');
  }
  if(pb.length) console.log('  ⚠ Un villageois qui ne parle plus du tout (vexé la nuit, jamais interrogé avant) : ' + pb.join(' ; '));
  else console.log('  ✓ Un villageois vexé la nuit (jamais interrogé avant) : l\'enquête reste résoluble');
}
/* Écouter aux portes (barde.js) : la bulle montre une réplique à la fois, dans une boîte de taille fixe (Romain, 5 novembre, 15 h 34 :
   les longs dialogues débordaient). Une réplique trop longue défile dans sa boîte : ça marche, mais c'est moins agréable à lire.
   Règle pour écrire les enquêtes : une réplique par personne (E.bribes[].phrases), une phrase « aux portes » courte (E.portes), 200 signes au plus. */
function verifierPortes(E){
  const longues = [];
  for(const b of E.bribes || []){ if((b.intro || '').length > 200) longues.push(`bribe ${b.id} (intro) : ${b.intro.length}`); (b.phrases || []).forEach((ph, i) => { if(String(ph.texte || '').length > 200) longues.push(`bribe ${b.id}, phrase ${i + 1} : ${ph.texte.length}`); }); }
  for(const id of Object.keys(E.portes || {})) for(const m of Object.keys(E.portes[id])) if(String(E.portes[id][m]).length > 200) longues.push(`portes ${id} (${m}) : ${E.portes[id][m].length}`);
  if(longues.length) console.log('  ⚠ Répliques « aux portes » longues (plus de 200 signes, elles défilent dans la bulle) : ' + longues.join(' ; '));
  else if((E.bribes || []).length || E.portes) console.log('  ✓ Répliques « aux portes » : toutes courtes (200 signes au plus)');
}
function verifier(id){
  const E = ENQ[id];
  if(!E){ console.log(`Enquête ${id} : absente`); return; }
  /* l'enquête 3 (les grands dialogues, la fête, l'établi, le sac, le donjon) a son propre vérificateur : verif-e3.js */
  if(E.grands && E.donjon){ console.log(`\n=== Enquête ${id} : ${E.titre} ===` + (E.enEcriture ? '  (fermée aux joueurs : en cours d\'écriture)' : '')); echecs += require('./verif-e3.js')(E, SRC, D); return; }
  if(E.enEcriture){ console.log(`\n=== Enquête ${id} : ${E.titre} ===\n  (en cours d'écriture : pas jouable, pas vérifiée)`); return; }
  console.log(`\n=== Enquête ${id} : ${E.titre} ===`);
  verifierPortes(E);
  // sources existantes
  const toutes = new Set(elements(E).map(e => e.cle));
  E.faits.forEach(f => f.sources.flat().forEach(s => { if(!toutes.has(s)){ console.log('  ✗ source inconnue :', s); echecs++; } }));
  const tout = analyser(E, ROLES);
  const r = candidats(E, tout.obtenu);
  const sol = Object.keys(r).map(d => d + '=' + [...r[d]].join('|')).join('  ');
  const unique = Object.keys(r).every(d => r[d].size === 1 && r[d].has(E.solution[d]));
  console.log(`  ${unique ? '✓' : '✗'} Avec toute l'équipe : ${sol}`);
  if(!unique) echecs++;
  for(const role of ROLES){
    /* sans le Sage, personne ne reçoit le code du moment suivant : l'équipe reste au matin (sansSage) */
    const a = analyser(E, ROLES.filter(x => x !== role), null, sansSage(role));
    const rr = candidats(E, a.obtenu), n = taille(rr);
    const ok = n >= 2;
    if(!ok) echecs++;
    console.log(`  ${ok ? '✓' : '✗'} Sans ${role.padEnd(10)} : ${n} solutions possibles (${Object.keys(rr).map(d => d + ' ' + rr[d].size).join(', ')})`);
  }
  // Indices trop bavards : un texte qu'un joueur obtient tout seul ne doit pas trahir le coupable
  if(E.sensibles && E.sensibles.length){
    const sources = new Set(E.faits.flatMap(f => f.sources.flat()));
    const bavards = [];
    const avecTalents = [null, {talents:new Set(['tendre']), oreilles:new Set((E.bribes || []).map(b => b.id))}, {talents:new Set(['exiger']), exige:new Set(Object.keys(E.pnj || {}))}];
    for(const role of ROLES) for(const opts of (role === 'barde' ? avecTalents : [null])){
      const seul = analyser(E, [role], null, opts);
      seul.els.filter(e => e.role === role && seul.obtenu.has(e.cle) && !bavards.some(x => x.startsWith(e.cle + ' '))).forEach(e => {
        if(sources.has(e.cle) || e.ok) return;
        const txt = (e.textes || []).filter(Boolean).join(' ').toLowerCase();
        const mots = E.sensibles.filter(m => new RegExp('(^|[^a-zà-ÿ])' + m.toLowerCase()).test(txt));
        if(mots.length) bavards.push(`${e.cle} (${mots.join(', ')})`);
      });
    }
    if(bavards.length){ echecs++; console.log('  ✗ Trop évident, un joueur seul en apprend trop : ' + bavards.join(' ; ')); }
    else console.log('  ✓ Aucun texte obtenu seul ne trahit le coupable');
  }
  // missions de base (E.etapes) : chaque condition doit viser quelque chose qui existe
  verifierMissions(E);
  verifierCodesBarde(E);
  verifierLiege(E);
  verifierEchecs(E);
  verifierChoix(E);
  verifierChoixPoints(E);
  verifierTalents(E);
  verifierPlusDeVerrou(E);
  verifierObligatoires(E);
  if((E.niveau || E.id) >= 2) verifierVexes(E);   /* l'enquête 2 et suivantes : la règle « accusé à tort, vexé » */
  // blocages : sources de faits non obtenables sans talent ni objet
  const manquants = new Set();
  E.faits.forEach(f => f.sources.forEach(s => { const l = Array.isArray(s) ? s : [s]; if(!l.some(x => tout.obtenu.has(x))) l.forEach(x => manquants.add(x)); }));
  if(manquants.size){ console.log('  ✗ inaccessibles sans talent/objet :', [...manquants].join(', ')); echecs++; }
  else console.log('  ✓ Aucun blocage : tout s\'obtient sans talent ni objet');
  verifierCodesLieux(E);
  verifierChemins(E);
  // une enquête sans points d'action (E.sansActions, l'enquête 1) : pas de budget à calculer (le tutoriel et « une chose par lieu et par moment » limitent)
  if(E.sansActions){ console.log('  Budget : pas de points d\'action dans cette enquête (sansActions), rien à compter'); return; }
  // budget d'actions approximatif (ce qui sert aux faits)
  const utiles = new Set();
  E.faits.forEach(f => f.sources.forEach(s => { const l = Array.isArray(s) ? s : [s]; utiles.add(l[0]); }));
  const dispo = E.moments.length * 2;
  const parRole = {};
  const els = tout.els.filter(e => utiles.has(e.cle));
  // dépendances : ajoute les éléments qui produisent les codes nécessaires
  function ajouterDeps(e, vus){
    for(const alt of e.besoins){
      const b = alt.find(x => (x.code && !x.code.startsWith('pot:')) || x.cle);
      if(!b) continue;
      if(b.cle){ const d = tout.els.find(x => x.cle === b.cle); if(d && !vus.has(d.cle)){ vus.add(d.cle); ajouterDeps(d, vus); } continue; }
      const prod = tout.els.find(x => x.produit.includes(b.code) && tout.obtenu.has(x.cle));
      if(prod && !vus.has(prod.cle)){ vus.add(prod.cle); ajouterDeps(prod, vus); }
    }
  }
  const vus = new Set(els.map(e => e.cle));
  els.forEach(e => ajouterDeps(e, vus));
  tout.els.filter(e => vus.has(e.cle)).forEach(e => { if(!e.action) return; (parRole[e.role] = parRole[e.role] || new Set()).add(e.action.type + ':' + e.action.id); });
  const pot = {};
  E.faits.forEach(f => f.sources.flat().forEach(s => {}));
  const gratuits = new Set(tout.els.filter(e => vus.has(e.cle) && e.gratuit).map(e => e.gratuit));
  console.log('  Budget (actions utiles / disponibles) : ' + ROLES.map(r => `${r} ${(parRole[r] || new Set()).size}/${dispo}`).join(', ') + ' (+ potions et cueillettes pour l\'Alchimiste)' +
    (gratuits.size ? ` ; fouilles sous terre sans action pour le Pisteur : ${[...gratuits].join(', ')}` : ''));
}
const ids = process.argv.slice(2).length ? process.argv.slice(2) : Object.keys(ENQ);
ids.forEach(verifier);
console.log(echecs ? `\n${echecs} problème(s).` : '\nTout est bon.');
process.exit(echecs ? 1 : 0);
