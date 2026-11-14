/* Le vérificateur de l'enquête 3 « La lettre d'Odette » (appelé par verif.js : node tools/verif.js 3).

   L'enquête 3 ne marche pas comme les deux premières (pas de points d'action, des grands dialogues à étapes, la fête, l'établi des
   plantes, le sac, le donjon) : elle a son propre modèle. Il est LU dans les données de e3.js (les points, les questions, les grands
   dialogues, la fête, les pages du Sage, les analyses, les missions) et dans plantes-donnees.js (les recettes) ; seuls quelques liens qui
   vivent dans le code sont écrits ici à la main (ils sont marqués « à la main »).

   Ce qu'il vérifie (Bible § 13.14, étape 8 ; E3-actions-des-roles.md § 5, « Qui prouve quoi ») :
   1. le chemin parfait : avec toute l'équipe et tout réussi, une seule solution (QUI et OÙ), et toutes les missions se cochent ;
   2. chaque rôle est indispensable : sans lui, au moins deux solutions restent possibles ;
   3. jamais de blocage : avec TOUT raté (chaque mini-jeu, chaque grand dialogue, chaque mensonge), l'enquête se résout encore ;
      et aussi avec un seul raté à la fois ;
   4. les codes : chacun a quelqu'un qui le donne, quelqu'un à qui il sert, et celui qui en a besoin est bien celui qui le reçoit ;
   5. les missions du Carnet visent des choses qui existent.
   Rend le nombre de problèmes. */
const fs = require('fs'), path = require('path');
const ROLES = ['pisteur', 'alchimiste', 'barde', 'sage'];

module.exports = function verifierE3(E, SRC, D){
  let pb = 0;
  const dit = (ok, t) => { console.log(`  ${ok ? '✓' : '✗'} ${t}`); if(!ok) pb++; };
  const NUIT = ['nuit'];
  const liste = x => x == null ? [] : Array.isArray(x) ? x : [x];
  const pour = id => { const p = id.split(':'), I = p[0] === 'obj' ? (E.objets || {})[p[1]] : p[0] === 'info' ? (E.infos || {})[p[1]] : null; return id === 'sac' || id === 'allure:sage' ? ['pisteur'] : I ? liste(I.pour) : []; };

  /* ---------- les recettes de l'établi (plantes-donnees.js) : la plante de chaque potion, et la potion qu'il faut avant (le baume cuit dans
     l'huile de lin : une étape liq:'huile') ---------- */
  const W = {};
  new Function('window', fs.readFileSync(path.join(SRC, 'plantes-donnees.js'), 'utf8'))(W);
  const RECETTES = {};
  W.PLANTES_DONNEES.ORDRE.forEach(id => {
    const r = W.PLANTES_DONNEES.RE[id];
    RECETTES[id] = {plante:r.plante, avant:id !== 'huile' && r.etapes.some(e => e.liq === 'huile') ? 'huile' : null};
  });

  /* ---------- les règles : {cle, role, moments, besoins (toutes ; chacune : une des conditions), sauf, produit, faits, ratable, rate} ---------- */
  const R = [];
  const aj = r => { R.push(Object.assign({besoins:[], sauf:null, produit:[], faits:[], moments:null, ratable:false, rate:{produit:[], faits:[]}}, r)); };
  for(const l of Object.keys(E.lieux)){
    for(const role of ['pisteur', 'sage', 'alchimiste']){
      const L = E.lieux[l][role]; if(!L) continue;
      (L.points || []).forEach(p => {
        /* (14 novembre) p.donneAussi : un deuxième code, pour un autre équipier (la grille : le Barde) */
        const cle = `${role}:${l}:${p.id}`, prod = liste(p.donne).concat(liste(p.donneAussi)).concat(p.obj ? ['obj:' + p.obj] : []), f = p.plante ? ['plante:' + p.plante] : [];
        /* (le gâteau est une création libre : on ne le rate jamais ; p.essaisInfinis : on recommence autant qu'on veut, il finit toujours par réussir) */
        const ratable = !!p.mj && p.mj !== 'gateau' && !p.essaisInfinis;
        aj({cle, role, moments:p.moments, besoins:[p.besoin, p.visibleSi].filter(Boolean), sauf:p.cacheSi, produit:prod, faits:f, ratable, mj:p.mj,
          rate:p.ouvrePartiel ? {produit:prod, faits:f} : {produit:[], faits:[]}});
        (p.variantes || []).forEach((v, k) => { if(v.recoit || v.donne || v.obj) aj({cle:`${cle}:v${k}`, role, moments:p.moments, besoins:[[{vu:cle}]].concat(v.si ? [v.si] : []), produit:liste(v.recoit).concat(liste(v.donne)), filet:true}); });
      });
      (L.cueillir || []).forEach(c => { if(c.plante) aj({cle:`alchimiste:cueillir:${c.plante}`, role, moments:c.moments, besoins:[c.besoin].filter(Boolean), faits:['plante:' + c.plante]}); });
    }
  }
  /* (12 novembre, Bible §13.26) les sept plantes : sept endroits cachés de la carte (D.PLANTES, donnees.js ; src/cueillette.js). Celles d'au-delà
     de la brume demandent que leur zone soit levée (E.brume : Bertille, la petite cloche d'Anselme) ; pasAvant : pas avant ce moment — ensuite,
     toujours (la nuit aussi). Une plante dont la zone n'est levée par rien ne se cueille jamais. */
  Object.keys((D && D.PLANTES) || {}).forEach(id => {
    const pl = D.PLANTES[id]; if(typeof pl.x !== 'number' || (pl.des || 99) > (E.id || 3)) return;
    const r0 = pl.pasAvant ? E.moments.indexOf(pl.pasAvant) : 0;
    const levee = !pl.zone ? [] : (E.brume && (E.brume.zones || []).indexOf(pl.zone) >= 0) ? [E.brume.si] : [[{vu:'jamais'}]];
    aj({cle:`alchimiste:cueillir:${id}`, role:'alchimiste', moments:r0 > 0 ? E.moments.slice(r0) : null, besoins:levee, faits:['plante:' + id]});
  });
  for(const id of Object.keys(E.pnj || {})){
    const N = E.pnj[id];
    /* une question sans moment se pose quand le villageois est là, et pas occupé (N.ou, N.occupe) */
    const la = N.ou ? E.moments.filter(m => N.ou[m] && !(N.occupe && N.occupe[m])) : null;
    (N.questions || []).forEach((q, i) => {
      if(!q.moments && la && la.length) q = Object.assign({}, q, {moments:la});
      const cle = `barde:${id}:${i}`;
      if(q.grand){
        const X = E.grands[q.grand], fin = [`grand:${q.grand}:fini`];
        aj({cle:`grand:${q.grand}`, role:'barde', moments:q.moments, besoins:[q.besoin].filter(Boolean), sauf:q.cacheSi, produit:liste(X.reussi && X.reussi.code), faits:fin, ratable:true, grand:q.grand,
          rate:{produit:liste(X.echec && X.echec.code), faits:fin}});
        return;
      }
      aj({cle, role:'barde', moments:q.moments, besoins:[q.besoin].filter(Boolean), sauf:q.cacheSi, produit:liste(q.donne)});
      /* un mensonge démasqué (🤥 sous la dernière réponse) : on peut le manquer */
      if(q.ment) aj({cle:`${cle}:verite`, role:'barde', moments:q.moments, besoins:[[{vu:cle}]], produit:liste(q.donneVrai), faits:[`verite:${id}:${i}`], ratable:true, mensonge:true});
    });
  }
  /* la fête : le filet de celui qui craque (Mélusine), si le Barde n'a pas déjà son aveu */
  for(const id of Object.keys((E.fete || {}).gens || {})){
    const x = E.fete.gens[id];
    if(x.filet) aj({cle:`barde:fete:${id}`, role:'barde', moments:E.fete.moments, sauf:[{donne:x.filet.sauf}], produit:[x.filet.code], faits:[`fete:filet:${id}`], filet:true});
    /* (13 novembre, Bible §13.33) l'aide pour le donjon : avec le code du Pisteur, ce villageois a de nouvelles questions */
    if(x.aide) aj({cle:`barde:fete:aide:${id}`, role:'barde', moments:E.fete.moments, besoins:[[{code:x.aide.si}]], faits:[`fete:aide:${id}`]});
    /* (14 novembre, Bible §13.36) le grand dialogue d'un fêtard (le maire inquiet) : avec un des codes du Pisteur (la grille, ou le puits) ;
       écouter tout le monde à la fête ne se rate pas. Réussi ou raté, il ne donne rien : la fin ne change pas. */
  }
  /* (14 novembre, 11 h 44, Bible §13.38) un grand dialogue à minuteurs cachés (X.attente : le maire inquiet) : il vient tout seul, un
     moment après le code du Pisteur ; le temps qui passe ne se rate pas. Réussi ou raté, il ne donne rien : la fin ne change pas. */
  for(const g of Object.keys(E.grands || {})){
    const X = E.grands[g]; if(!X.attente) continue;
    const fin = [`grand:${g}:fini`];
    aj({cle:`grand:${g}`, role:'barde', moments:(E.fete || {}).moments || NUIT, besoins:[X.attente.si].filter(Boolean), faits:fin, ratable:true, grand:g, rate:{produit:[], faits:fin}});
  }
  if(E.retenir) aj({cle:'grand:retenir', role:'barde', moments:(E.fete || {}).moments || NUIT, besoins:[E.retenir.besoin].filter(Boolean), produit:liste(E.retenir.reussi.code), faits:['grand:retenir:fini'], ratable:true,
    rate:{produit:[], faits:['grand:retenir:fini']}});
  /* Léo : le code du Pisteur ouvre son grand dialogue (grands.js) ; tout réussi : sa dernière fin */
  if(E.grands && E.grands.leo){
    const F = E.grands.leo.fins, fin = ['grand:leo:fini'];
    aj({cle:'grand:leo', role:'barde', moments:NUIT, besoins:[[{code:'info:leo_attrape'}]], produit:liste(F[F.length - 1].code), faits:fin, ratable:true, rate:{produit:[], faits:fin}});
    aj({cle:'grand:leo:enfui', role:'barde', moments:NUIT, besoins:[[{code:'info:leo_enfui'}]], faits:fin});
  }
  /* les pages du Grand Livre */
  (E.pages || []).forEach(p => {
    const prod = liste(p.donne), f = ['page:' + p.id];
    /* (13 novembre) p.visibleSi : la page n'existe qu'avec ce code (la lettre, le carnet) ; p.quand : son bouton attend ce moment (le Livre d'or) */
    aj({cle:`sage:page:${p.id}`, role:'sage', moments:p.moments || p.quand, besoins:[p.besoin, p.visibleSi].filter(Boolean), produit:prod, faits:f, ratable:!!p.mj, mj:p.mj, rate:p.ouvrePartiel || p.partiel ? {produit:prod, faits:f} : {produit:[], faits:[]}});
  });
  /* les analyses du labo (à la main : la lettre a besoin des écritures du Livre d'or — labo.js, CFG.livredor) */
  for(const id of Object.keys(E.analyses || {})){
    const A = E.analyses[id];
    aj({cle:`alchimiste:analyse:${id}`, role:'alchimiste', besoins:[[{code:'obj:' + id}]].concat(A.besoin ? [A.besoin] : []).concat(id === 'lettre' ? [[{code:'info:ecritures'}]] : []), produit:liste(A.donne)});
  }
  /* un code qui apporte une plante (I.plante : « Le gui », cueilli par le Pisteur, arrive sur l'établi de l'Alchimiste) */
  for(const id of Object.keys(E.infos || {})){ const I = E.infos[id]; if(I.plante) liste(I.pour).forEach(role => aj({cle:`${role}:recu:${id}`, role, besoins:[[{code:'info:' + id}]], faits:['plante:' + I.plante]})); }
  /* l'établi : une plante, une potion (plantes.js) ; le sac, la nuit (à la main : plantes.js) */
  for(const k of Object.keys(RECETTES)) aj({cle:'fiole:' + k, role:'alchimiste', besoins:[[{vu:'plante:' + RECETTES[k].plante}]].concat(RECETTES[k].avant ? [[{vu:'fiole:' + RECETTES[k].avant}]] : [])});
  /* (13 novembre) « sac » : le code d'allure de l'Alchimiste — il ne l'a qu'avec ses sept potions, et il les met dans le sac du Pisteur */
  aj({cle:'alchimiste:sac', role:'alchimiste', moments:NUIT, besoins:Object.keys(RECETTES).map(k => [{vu:'fiole:' + k}]), produit:['sac']});   /* (Romain, 12 novembre, 12 h 45 : le code n'est donné qu'une fois les SEPT potions faites) */
  aj({cle:'sac:recu', role:'pisteur', moments:NUIT, besoins:[[{code:'sac'}]]});
  for(const k of Object.keys(RECETTES)) aj({cle:'sac:' + k, role:'pisteur', moments:NUIT, besoins:[[{vu:'sac:recu'}], [{vu:'fiole:' + k}]]});
  /* le donjon (à la main : descente.js) : une entrée, et les deux codes d'allure — celui de l'Alchimiste (« sac » : ses sept potions) et
     celui du Sage, qu'il n'a qu'avec le code du départ du Pisteur (info:on_descend, donné quand l'entrée s'ouvre) ; au bout, la porte
     aux quatre signes, puis Léo */
  if(E.donjon){
    const entrees = [];
    for(const l of Object.keys(E.lieux)) ((E.lieux[l].pisteur || {}).points || []).forEach(p => { if(p.descente) entrees.push({vu:`pisteur:${l}:${p.id}`}); });
    if((E.infos || {}).on_descend){
      aj({cle:'sage:tenue', role:'sage', moments:NUIT, besoins:[[{code:'info:on_descend'}]], produit:['allure:sage']});
      aj({cle:'alchimiste:tenue', role:'alchimiste', moments:NUIT, besoins:[[{code:'info:on_descend'}]]});
      aj({cle:'allure:sage:recu', role:'pisteur', moments:NUIT, besoins:[[{code:'allure:sage'}]]});
    }
    aj({cle:'donjon:fini', role:'pisteur', moments:NUIT, besoins:[entrees, [{vu:'sac:recu'}]].concat((E.infos || {}).on_descend ? [[{vu:'allure:sage:recu'}]] : []), produit:['info:odette_porte'], donjon:true});
    aj({cle:'donjon:ouvert:sage', role:'sage', moments:NUIT, besoins:[[{vu:'page:donjon'}]]});
    aj({cle:'donjon:ouvert:alchimiste', role:'alchimiste', moments:NUIT});
  }
  /* le marché aux fleurs du Barde, le matin (à la main : marche.js) */
  if(E.marche) aj({cle:'marche:dix', role:'barde', moments:[E.moments[0]]});

  /* ---------- jouer : ce qu'une équipe (les rôles présents) peut obtenir, selon ce qui rate ---------- */
  /* sauter (14 novembre) : des règles qu'on laisse de côté — devant la grille de la crypte, un seul geste compte : pour voir ce que donne
     « soulever », on saute « tirer » et « pousser » (qui passent avant lui dans la liste) */
  function jouer(roles, rate, sauter){
    rate = rate || (() => false);
    const faits = new Set(), codes = new Set(), donnes = new Set();
    const sansSage = !roles.includes('sage');   /* sans le Sage, personne ne donne le code du moment suivant : on reste au matin */
    function ok(c, role){
      if(c.code) return codes.has(c.code) && (pour(c.code).includes(role) || !pour(c.code).length);
      if(c.donne) return donnes.has(c.donne) || codes.has(c.donne);
      if(c.vu) return faits.has(c.vu);
      if(c.rate) return faits.has(c.rate + ':rate');
      if(c.fini) return faits.has(c.fini) || faits.has(c.fini + ':rate');
      if(c.analyse) return faits.has('alchimiste:analyse:' + c.analyse);
      if(c.page) return faits.has('page:' + c.page);
      if(c.et) return c.et.every(x => ok(x, role));
      if(c.ou) return c.ou.some(x => ok(x, role));
      /* (12 novembre au soir) « tout demandé à ces villageois » (barde.js, M.toutDit) : toujours possible — celui à qui on ne peut pas
         parler à ce moment ne bloque pas, et poser une question ne se rate pas */
      if(c.toutDit) return true;
      if(c.non) return !ok(c.non, role);
      return false;
    }
    const tentes = new Set();
    function tour(L){
      let change = false;
      for(const r of L){
        if(tentes.has(r.cle) || !roles.includes(r.role) || (sauter && sauter.includes(r.cle))) continue;
        if(sansSage && r.moments && !r.moments.includes(E.moments[0])) continue;
        if(!r.besoins.every(alt => alt.some(c => ok(c, r.role)))) continue;
        if(r.sauf && r.sauf.some(c => ok(c, r.role))) continue;
        tentes.add(r.cle); change = true;
        const ra = r.ratable && rate(r);
        if(ra){ faits.add(r.cle + ':rate'); r.rate.faits.forEach(f => faits.add(f)); r.rate.produit.forEach(c => { codes.add(c); donnes.add(c); }); }
        else { faits.add(r.cle); r.faits.forEach(f => faits.add(f)); r.produit.forEach(c => { codes.add(c); donnes.add(c); }); }
      }
      return change;
    }
    /* les filets (ce qui rattrape un raté : la lettre accrochée sous le tableau, Mélusine qui craque à la fête) passent APRÈS le reste :
       ils ont une condition « si personne ne l'a déjà » */
    const filets = R.filter(r => r.filet), reste = R.filter(r => !r.filet);
    function points(L){ let c = false; while(tour(L)) c = true; return c; }
    let encore = true;
    while(encore){
      encore = points(reste);
      /* Léo, au fond du donjon (13 novembre) : en entrant chez lui, le code pour le Barde ; battu, le code pour le Sage */
      if(faits.has('donjon:fini') && !codes.has('info:leo_battu')){ codes.add('info:leo_la'); codes.add('info:leo_battu'); encore = true; continue; }
      if(!encore) encore = points(filets);
    }
    return {faits, codes};
  }
  function solutions(j){
    const reste = {qui:new Set(E.qui.choix), ou:new Set(E.ou.choix.map(x => x.id)), quoi:new Set(((E.quoi || {}).choix || [{id:'-'}]).map(x => x.id))};
    (E.faits || []).forEach(f => {
      if(!f.sources.every(s => liste(s).some(x => j.faits.has(x)))) return;
      ['qui', 'ou', 'quoi'].forEach(d => (f[d] || []).forEach(x => reste[d].delete(x)));
    });
    return reste;
  }
  const taille = r => r.qui.size * r.ou.size * r.quoi.size;
  const resume = r => `QUI ${[...r.qui].join('|')} · OÙ ${[...r.ou].join('|')}` + (E.quoi ? ` · SOUS LA CAPE ${[...r.quoi].join('|')}` : '');
  const juste = r => r.qui.size === 1 && r.qui.has(E.solution.qui) && r.ou.size === 1 && r.ou.has(E.solution.ou) && r.quoi.size === 1 && (!E.quoi || r.quoi.has(E.solution.quoi));

  /* ---------- 0. les sources des faits existent ---------- */
  const cles = new Set(R.map(r => r.cle));
  (E.faits || []).forEach(f => f.sources.flat().forEach(s => { if(!cles.has(s)) dit(false, `un fait cite une source qui n'existe pas : ${s}`); }));
  dit((E.faits || []).length > 0, `les preuves de l'enquête sont écrites (E.faits : ${(E.faits || []).length})`);

  /* ---------- 1. le chemin parfait ---------- */
  const parfait = jouer(ROLES), sp = solutions(parfait);
  dit(juste(sp), `Avec toute l'équipe, tout réussi : ${resume(sp)}`);
  const leo = parfait.codes.has('info:leo_la') && parfait.codes.has('info:leo_battu') && parfait.faits.has('fete:aide:farinel') && parfait.faits.has('fete:aide:iris');
  dit(leo, 'le chemin parfait va jusqu\'au bout : l\'homme en cape, l\'aide de Farinel et d\'Iris à la fête, « Léo a parlé »');
  dit(!E.accuser || (E.accuser.besoin || []).every(c => !c.code || parfait.codes.has(c.code)), 'le Sage reçoit ce qu\'il lui faut pour accuser (E.accuser.besoin)');
  /* (12 novembre au soir ; Romain, 21 h 44) un grand dialogue ne s'ouvre qu'une fois tout demandé : sa question porte {toutDit} */
  const sansTout = [];
  for(const id of Object.keys(E.pnj || {})) (E.pnj[id].questions || []).forEach(q => { if(q.grand && !/"toutDit"/.test(JSON.stringify(q.besoin || []))) sansTout.push(q.grand); });
  dit(!sansTout.length, sansTout.length ? 'des grands dialogues s\'ouvrent sans avoir tout demandé (pas de {toutDit}) : ' + sansTout.join(', ') : 'Les grands dialogues ne s\'ouvrent qu\'une fois tout demandé ({toutDit})');
  /* le verrou des dialogues (Romain, 12 novembre, 21 h 44) : E3-dialogues-et-trame.md est écrit par tools/e3-dialogues.js à partir de e3.js ;
     s'ils ne disent plus la même chose, un dialogue a changé sans que le fichier suive (ou le fichier a été retouché à la main) */
  const verrou = require('./e3-dialogues.js');
  const miroir = fs.existsSync(verrou.CIBLE) && fs.readFileSync(verrou.CIBLE, 'utf8') === verrou.texte(E, D);
  dit(miroir, miroir ? 'Les dialogues sont verrouillés : E3-dialogues-et-trame.md est le miroir exact du jeu' : 'E3-dialogues-et-trame.md et le jeu ne disent plus la même chose : un dialogue a changé (go de Romain ? puis « node tools/e3-dialogues.js »)');
  /* les trois questions communes, dans le même ordre chez tous (0 la lettre, 1 Odette, 2 la nuit), et aucun nom soufflé avant la nuit */
  const communes = Object.keys(E.pnj || {}).filter(id => id !== 'voisin' && (E.pnj[id].questions || []).length).filter(id => { const Q = E.pnj[id].questions; return !(Q.length >= 4 && /lettre/.test(Q[0].q) && /Odette/.test(Q[1].q) && /nuit/.test(Q[2].q)); });
  dit(!communes.length, communes.length ? 'des villageois n\'ont pas les trois questions communes en tête : ' + communes.join(', ') : 'Tous les villageois ont les trois questions communes, dans le même ordre, puis celle de leur métier');
  const souffle = [];
  for(const id of Object.keys(E.pnj || {})) (E.pnj[id].questions || []).forEach((q, i) => { if(/L[ée]o\b|minuit|lavande/i.test([q.q, q.a, q.vrai, q.note, q.noteVrai].filter(Boolean).join(' '))) souffle.push(`${id}[${i}]`); });
  dit(!souffle.length, souffle.length ? 'des questions parlent encore de Léo, de minuit ou de lavande : ' + souffle.join(', ') : 'Aucune question du Barde ne parle de Léo, de minuit ni de lavande');

  /* ---------- 2. chaque rôle est indispensable ---------- */
  ROLES.forEach(role => {
    const r = solutions(jouer(ROLES.filter(x => x !== role)));
    dit(taille(r) >= 2, `Sans ${role.padEnd(10)} : ${taille(r)} solutions possibles (QUI ${r.qui.size}, OÙ ${r.ou.size})`);
  });

  /* ---------- 3. jamais de blocage ---------- */
  const ratables = R.filter(r => r.ratable);
  const toutJ = jouer(ROLES, () => true), tout = solutions(toutJ);
  dit(juste(tout), `Tout raté (${ratables.length} mini-jeux, grands dialogues et mensonges manqués) : ${resume(tout)}`);
  const bloquants = ratables.filter(x => !juste(solutions(jouer(ROLES, r => r.cle === x.cle)))).map(x => x.cle);
  dit(!bloquants.length, bloquants.length ? `un seul raté bloque l'enquête : ${bloquants.join(', ')}` : `Un seul raté à la fois (${ratables.length} cas) : l'enquête se résout toujours`);
  /* et les deux entrées du donjon : la crypte quand la clé est prise, le puits (et l'acide) quand elle est ratée */
  const cleOk = jouer(ROLES), cleRatee = jouer(ROLES, r => r.cle === 'pisteur:clocher:cle'), anselmeRate = jouer(ROLES, r => r.cle === 'grand:cle');
  dit(cleOk.faits.has('pisteur:clocher:descendre') && !cleOk.faits.has('pisteur:puits:grille'), 'la clé prise : on descend par la crypte, et le puits ne s\'ouvre jamais');
  dit(cleRatee.faits.has('pisteur:puits:descendre') && !cleRatee.faits.has('pisteur:clocher:descendre'), 'la clé ratée par le Pisteur : on descend par le puits, avec l\'acide du sac');
  dit(anselmeRate.faits.has('pisteur:puits:descendre') && anselmeRate.codes.has('info:vieux_puits'), 'Anselme raté par le Barde : « Le vieux puits », et on descend par le puits');
  dit(R.some(r => r.cle === 'alchimiste:cueillir:' + RECETTES.acide.plante && !r.besoins.length && !r.moments), 'l\'acide de la grille du puits : sa plante se cueille à tout moment, sans rien demander à personne');
  /* (14 novembre, Bible §13.36 et §13.38) LE MAIRE INQUIET : en ouvrant le passage, le Pisteur a un code pour le Barde — tirer ou pousser :
     « La grille a hurlé » ; soulever : « La grille s'ouvre sans bruit » ; le puits : « Le puits est ouvert ». Dans les trois cas, un
     minuteur caché démarre chez le Barde : le maire vient le trouver tout seul, 15 minutes après (le grand dialogue « amis »), puis
     5 minutes après chaque bonne réponse ; avec le bruit, il ne pose pas de question. Et ce dialogue ne donne rien : la fin ne change pas. */
  if(E.grands && E.grands.amis){
    const silence = jouer(ROLES, null, ['pisteur:clocher:tirer', 'pisteur:clocher:pousser']), pousse = jouer(ROLES, null, ['pisteur:clocher:tirer', 'pisteur:clocher:soulever']);
    const un = (j, c) => ['info:grille_silence', 'info:grille_bruit', 'info:puits_ouvert'].filter(x => j.codes.has(x)).join() === c;
    dit(un(cleOk, 'info:grille_bruit') && un(pousse, 'info:grille_bruit') && cleOk.faits.has('grand:amis:fini'), 'la grille tirée ou poussée : « La grille a hurlé » pour le Barde, et le maire vient le trouver à la fête');
    dit(un(silence, 'info:grille_silence') && silence.faits.has('grand:amis:fini') && silence.faits.has('pisteur:clocher:descendre'), 'la grille soulevée : « La grille s\'ouvre sans bruit » pour le Barde, et le maire vient le trouver à la fête');
    dit(un(cleRatee, 'info:puits_ouvert') && cleRatee.faits.has('grand:amis:fini'), 'par le puits : « Le puits est ouvert » pour le Barde, et le maire vient le trouver à la fête');
    /* ce que le maire DIT (entre « », quand la réplique mêle paroles et récit ; sinon toute la phrase) : ses questions, et ses réponses aux bons choix */
    const paroles = s => /«/.test(s || '') ? (s.match(/«[^»]*»/g) || []).join(' ') : (s || '');
    const X = E.grands.amis, A = X.attente || {}, SR = X.sansReponse || {};
    const mots = X.etapes.flatMap(e => [e.t].concat(e.choix.filter(c => c.bon).map(c => c.r))).concat([SR.t]).map(paroles).join(' ');
    const codesDe = l => (l || []).map(c => c.code).sort().join();
    dit(!X.reussi && !X.echec && !X.piege, 'le dialogue du maire ne donne aucun code : réussi ou raté, la fin ne change pas');
    dit(!/clocher/i.test(mots) && /clocher/i.test(paroles(X.rate)), 'le maire ne dit jamais « clocher » de lui-même : seulement en partant, après une mauvaise réponse');
    dit(A.debut === 900 && A.suite === 300 && codesDe(A.si) === 'info:grille_bruit,info:grille_silence,info:puits_ouvert', 'le minuteur caché du maire : 15 minutes après le code du Pisteur (l\'un des trois), puis 5 minutes après chaque bonne réponse');
    dit(codesDe(SR.si) === 'info:grille_bruit' && /grille/i.test(paroles(SR.t)) && !!SR.resume, 'avec le bruit : le maire ne pose pas de question, il prévient qu\'il a entendu la grille et qu\'il va voir');
    dit(!(E.fete.gens[X.pnj] || {}).grand && !Object.keys(E.etapes || {}).some(r => E.etapes[r].some(m => /maire cherche/i.test(m.t || ''))), 'rien n\'annonce le maire : ni rond sur lui à la fête, ni mission (le minuteur est caché)');
    dit(X.etapes.every(e => e.choix.length === 4 && e.choix.filter(c => c.bon).length === 1) && new Set(X.etapes.map(e => e.choix.findIndex(c => c.bon))).size === X.etapes.length, 'trois étapes de quatre choix, une seule bonne réponse, jamais à la même place');
  }

  /* ---------- 4. les codes ---------- */
  /* (12 novembre au soir) un code « en réserve » (I.reserve : « La Grosse Marie », gardé pour le donjon, que plus personne ne donne tant que
     Romain n'a pas décidé de la suite) n'est pas vérifié ici */
  const ids = Object.keys(E.objets || {}).map(k => 'obj:' + k).concat(Object.keys(E.infos || {}).filter(k => !E.infos[k].reserve).map(k => 'info:' + k));
  const enReserve = Object.keys(E.infos || {}).filter(k => E.infos[k].reserve);
  if(enReserve.length) console.log(`  · en réserve (plus donné par personne pour l'instant) : ${enReserve.map(k => 'info:' + k).join(', ')}`);
  const donneurs = {}, lecteurs = {};
  R.forEach(r => r.produit.concat(r.rate.produit).forEach(c => (donneurs[c] = donneurs[c] || new Set()).add(r.role)));
  ['info:odette_porte', 'info:leo_la', 'info:leo_battu'].forEach(c => (donneurs[c] = donneurs[c] || new Set()).add('pisteur'));   /* (le donjon : descente.js) */
  (E.accuser && E.accuser.besoin || []).forEach(c => { if(c.code) (lecteurs[c.code] = lecteurs[c.code] || new Set()).add('sage'); });   /* (ce qui ouvre les accusations) */
  if(E.grands.lettre && E.grands.lettre.piege) (donneurs[E.grands.lettre.piege.code] = donneurs[E.grands.lettre.piege.code] || new Set()).add('barde');
  const mauvais = [];
  function lire(c, role, ou){ if(!c) return; if(c.code){ (lecteurs[c.code] = lecteurs[c.code] || new Set()).add(role); const p = pour(c.code); if(p.length && !p.includes(role)) mauvais.push(`${ou} (${role}) attend « ${c.code} », qui est pour ${p.join(', ')}`); } if(c.et) c.et.forEach(x => lire(x, role, ou)); if(c.ou) c.ou.forEach(x => lire(x, role, ou)); if(c.non) lire(c.non, role, ou); }
  R.forEach(r => { r.besoins.flat().forEach(c => lire(c, r.role, r.cle)); (r.sauf || []).forEach(c => lire(c, r.role, r.cle)); });
  for(const l of Object.keys(E.lieux)) for(const role of ['pisteur', 'sage', 'alchimiste']) ((E.lieux[l][role] || {}).points || []).forEach(p => { ((p.facileSi || {}).si || []).forEach(c => lire(c, role, `${role}:${l}:${p.id}`)); (p.variantes || []).forEach(v => (v.si || []).forEach(c => lire(c, role, `${role}:${l}:${p.id}`))); });
  (E.pages || []).forEach(p => (p.variantes || []).forEach(v => (v.si || []).forEach(c => lire(c, 'sage', 'sage:page:' + p.id))));
  dit(!mauvais.length, mauvais.length ? 'un code attendu par quelqu\'un qui ne peut pas le recevoir : ' + mauvais.join(' ; ') : 'Chaque code attendu quelque part est bien pour celui qui l\'attend');
  const sansDonneur = ids.filter(c => !donneurs[c]);
  dit(!sansDonneur.length, sansDonneur.length ? 'des codes que personne ne donne : ' + sansDonneur.join(', ') : `Les ${ids.length} codes de l'enquête ont tous quelqu'un qui les donne`);
  const pasLeBon = ids.filter(c => { const I = E.infos[c.split(':')[1]]; return c.indexOf('info:') === 0 && I && I.de && donneurs[c] && !donneurs[c].has(I.de); });
  dit(!pasLeBon.length, pasLeBon.length ? 'des codes donnés par un autre que celui annoncé (« de ») : ' + pasLeBon.join(', ') : 'Chaque code est donné par celui qui est annoncé');
  /* à quoi sert un code : une condition quelque part chez celui qui le reçoit ; ou bien (à la main) il rouvre une porte chez le Barde
     (pnj), il apporte une plante, il se tape dans le donjon, il ouvre le dialogue de Léo, il change la scène finale */
  /* (13 novembre) I.savoir : une information à retenir, qui n'ouvre rien (le Sage n'a plus de page qui conclut à sa place) */
  const utile = c => { const I = c.indexOf('info:') === 0 ? E.infos[c.split(':')[1]] : null; return !!lecteurs[c] || !!(I && (I.pnj || I.plante || I.donjon || I.savoir)) || /^info:leo_dit/.test(c); };
  const inutiles = ids.filter(c => !utile(c)), prevus = ['info:copie'];   /* (la copie de la lettre : un piège, elle ne sert à rien, exprès) */
  const vraiment = inutiles.filter(c => !prevus.includes(c));
  dit(!vraiment.length, vraiment.length ? 'des codes qui ne servent à rien pour celui qui les reçoit : ' + vraiment.join(', ') : `Chaque code sert à celui qui le reçoit (sauf le piège prévu : ${prevus.join(', ')})`);
  /* (14 novembre) et la partie où le Pisteur soulève la grille : c'est elle qui fait apparaître « La grille s'ouvre sans bruit » */
  const souleve = jouer(ROLES, null, ['pisteur:clocher:tirer', 'pisteur:clocher:pousser']);
  const jamais = ids.filter(c => !parfait.codes.has(c) && !toutJ.codes.has(c) && !souleve.codes.has(c) && !['info:copie', 'info:leo_dit1', 'info:leo_dit2'].includes(c));
  dit(!jamais.length, jamais.length ? 'des codes qu\'aucune partie ne fait apparaître (ni tout réussi, ni tout raté, ni la grille soulevée) : ' + jamais.join(', ') : 'Chaque code apparaît dans une partie (tout réussi, tout raté, ou la grille soulevée)');

  /* ---------- 5. les missions du Carnet ---------- */
  const connus = new Set([...cles, ...R.flatMap(r => r.faits.concat(r.rate.faits))]);
  const inconnues = [], pasFaites = [];
  function cond(c, role){
    if(c.et) return c.et.every(x => cond(x, role));
    if(c.ou) return c.ou.some(x => cond(x, role));
    if(c.bavard) return true;                       /* (parler à des habitants : toujours possible) */
    if(c.lu) return parfait.faits.has('page:' + c.lu) || (E.pages || []).some(p => p.id === c.lu && !p.besoin);
    if(c.analyse) return parfait.faits.has('alchimiste:analyse:' + c.analyse);
    const k = c.vu || c.fini || c.rate || c.essaye;
    if(k && !connus.has(k)) inconnues.push(`${role} : ${k}`);
    if(c.rate) return false;                        /* (une mission qui se coche aussi « si c'est raté » : pas sur le chemin parfait) */
    return k ? parfait.faits.has(k) : false;
  }
  ROLES.forEach(role => (E.etapes[role] || []).forEach((e, i) => { if(e.libre || e.piste) return; if(!(e.fait || []).some(c => cond(c, role))) pasFaites.push(`${role}[${i}]`); }));
  dit(!inconnues.length, inconnues.length ? 'des missions visent une chose qui n\'existe pas : ' + [...new Set(inconnues)].join(' ; ') : 'Les missions du Carnet visent toutes des choses qui existent');
  dit(!pasFaites.length, pasFaites.length ? 'sur le chemin parfait, des missions ne se cochent pas : ' + pasFaites.join(', ') : 'Sur le chemin parfait, toutes les missions des quatre rôles se cochent');
  /* (Romain, 13 novembre : « quand on passe la nuit, il y a des missions qui se mettent à jour et, pour le Pisteur, c'est trop grillé.
     Il faut les enlever. ») Avant, on exigeait des missions de la nuit pour chaque rôle. Maintenant : aucune mission ne doit annoncer
     le donjon — ni « sous la terre », ni « donjon », ni « souterrain », ni le sac de potions pour le Pisteur. */
  const grillees = [];
  ROLES.forEach(role => (E.etapes[role] || []).forEach((e, i) => { if(/donjon|sous la terre|souterrain|chaudron du donjon/i.test(e.t || '')) grillees.push(`${role}[${i}]`); }));
  dit(!grillees.length, grillees.length ? 'des missions du Carnet annoncent le donjon : ' + grillees.join(', ') : 'Aucune mission du Carnet n\'annonce le donjon');
  return pb;
};
