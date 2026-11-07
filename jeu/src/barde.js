/* ==========================================================
   Brumeval — le nouveau Barde (Romain, nuit du 3 au 4 novembre ; DESIGN-saison1.md § 12.4 et 12.5)
   Plus de mini-jeux à part : tout se passe dans les interrogatoires.
   · L'interrogatoire : le villageois RÉPOND EN PARLANT (son visage, ses mimiques). Dès l'enquête 2,
     « 🤥 Il ment ! » pendant ou après sa réponse ; « 🔁 Répète » pour le revoir.
     Le moteur du mensonge est celui du mini-jeu (MJ.TYPES.mensonge : scenario, MIMIQUES, reglages).
   · Questions à choix (q.choix) : la maladroite vexe (« repasse ce soir »), jamais d'indice perdu pour de bon.
   · Les mimiques des menteurs : chaque villageois a son tic ; avec le secret, il se voit bien.
   · Les dépositions : une scène de groupe, dans la même feuille (E.ecoutes, mj:'depositions').
   · Écouter de loin → phrase à trous dans le Carnet (E.ecoutes mj:'trous', E.bribes, la chanson de l'enquête 1).
     On ne dit jamais si c'est juste.
   · Les dix talents du nouvel arbre (donnees.js), et les vieilles sauvegardes.
   Chargé APRÈS carnet.js et essais.js (remplace M.feuilleConv et des actions de M.A).
   État : P.vexe {pnj:moment}, P.trous {clé:{poses, fixes, elim}}, P.scenes {id:{m, faux}}, P.mimiques {pnj:source},
          P.repete {pnj:moment:n}, P.usages.(verite|oreille|rumeur|hydromel|intuition|recoupement|clochette),
          P.rumeur (Pisteur), P.reseau {moment:pnj}, P.physio.
   ========================================================== */
(function(){
'use strict';
var M = window.M, D = window.DONNEES;
if(!M || !M.A) return;
var A = M.A, UI = M.UI;
function esc(s){ return M.esc(s); }
function lire(t, qui){ return M.lireBtn(t, qui); }
var B = M.barde = {};

/* ---------- Petits outils ---------- */
var FEM = {melusine:1, odette:1, iris:1, margot:1};
function nom(id){ return (D.PNJ[id] && D.PNJ[id].court) || id; }
function il(id){ return FEM[id] ? 'elle' : 'il'; }
function Il(id){ return FEM[id] ? 'Elle' : 'Il'; }
function lui(id){ return FEM[id] ? 'elle' : 'lui'; }
function talent(id){ return !!(M.S && M.S.talents && M.S.talents.indexOf(id) >= 0); }
function enquete2(){ var E = M.E(); return !!E && (E.niveau || E.id || 1) >= 2; }   /* on démasque dès l'enquête 2 (§ 3.6) */
function questions(id){ var E = M.E(); return (E && E.pnj && E.pnj[id] && E.pnj[id].questions) || []; }
function repondu(id, i){ var P = M.P(); return !!P && P.vus['barde:' + id + ':' + i] === 'ok'; }
function minus(t){ t = String(t || ''); return t.charAt(0).toLowerCase() + t.slice(1); }
var QUAND = {matin:'demain matin', apresmidi:'cet après-midi', soir:'ce soir', nuit:'cette nuit'};
var UN_SIGNE = ['coin', 'force', 'mordille', 'morsure', 'rougeur', 'sueur', 'double'];

/* ==========================================================
   Les mimiques des menteurs
   ========================================================== */
var TIC = {fortune:'coin', melusine:'mordille', tim:'mordille', basile:'sueur', silas:'double', iris:'force', victor:'morsure',
  odette:'rougeur', gaspard:'sueur', anselme:'double', margot:'coin', grosbec:'force', farinel:'mordille'};
var GESTE = {coin:'ses yeux filent sur le côté, avec un petit sourire de travers', rougeur:'le haut de son front devient tout rose',
  sueur:'une goutte de sueur glisse sur son front', force:'sa bouche sourit, mais ses yeux ne sourient pas',
  mordille:'{il} mordille sa lèvre du bas', morsure:'{il} se mord la lèvre, très vite', double:'{il} cligne des yeux deux fois, très vite',
  /* signes propres à un personnage (enquête 2) */
  oreilles:'ses oreilles rougissent', yeuxbas:'{il} baisse les yeux et lève les sourcils'};
var SIGNE_IC = {coin:'😏', rougeur:'🌸', sueur:'💧', force:'😬', mordille:'👄', morsure:'🦷', double:'😑', oreilles:'👂', yeuxbas:'🙄'};
B.GESTE = GESTE; B.SIGNE_IC = SIGNE_IC;
B.TIC = TIC;
/* Les signes d'une enquête (E.tics : à l'enquête 2, un signe différent par menteur, § 12.11), sinon le tic habituel */
function tic(id){ var E = M.S && M.S.e ? M.E() : null; return (E && E.tics && E.tics[id]) || TIC[id]; }
B.tic = tic;
B.phraseMimique = function(id){ return 'Quand ' + nom(id) + ' ment, ' + GESTE[tic(id) || 'coin'].replace('{il}', il(id)) + '.'; };
/* Les secrets connus : appris d'un villageois (question, q.mimique : un id ou une liste), d'un équipier (code), en écoutant (bribe), ou par le Physionomiste */
B.mimiques = function(){
  var P = M.P(), E = M.E(), o = {};
  if(!P || !E) return o;
  M.cle(P.mimiques || {}).forEach(function(k){ o[k] = P.mimiques[k]; });
  M.cle(E.infos || {}).forEach(function(x){ var I = E.infos[x]; if(I.mimique && P.recus && P.recus['info:' + x]) o[I.mimique] = o[I.mimique] || 'code'; });
  M.cle(E.pnj || {}).forEach(function(id){ (E.pnj[id].questions || []).forEach(function(q, i){ if(q.mimique && P.vus['barde:' + id + ':' + i] === 'ok') [].concat(q.mimique).forEach(function(m){ o[m] = o[m] || 'question'; }); }); });
  return o;
};

/* ==========================================================
   La parole : le visage qui parle, les mimiques, le texte qui s'écrit
   ========================================================== */
var anim = null, uid = 0;
function stopAnim(){ if(!anim) return; anim.t.forEach(clearTimeout); anim.i.forEach(clearInterval); anim = null; }
function reglagesMensonge(){
  var E = M.E(), P = M.P();
  var pot = P && P.bues && P.bues.verite === P.moment ? 'verite' : null;   /* la potion de vérité, bue pour ce moment */
  var mm = M.modsPour('mensonge', pot);
  var p = window.MJ && MJ.reglages ? MJ.reglages('mensonge', ((E && E.niveau) || 1) + M.decalage(), mm.mods) : {};
  p.mods = mm.mods;
  return p;
}
B.reglages = reglagesMensonge;
function scenario(id, texte, ment){
  var T = window.MJ && MJ.TYPES && MJ.TYPES.mensonge;
  if(!T || !T.scenario) return {D:2.4 + texte.length * .05, ev:[], couche:null};
  var p = reglagesMensonge(), signe = null;
  if(ment){
    if(B.mimiques()[id] && tic(id)){
      /* le secret est connu : SON geste, un peu plus net que les signes au hasard, mais bref et glissé parmi les gestes naturels.
         Durée et netteté suivent le niveau (MJ.reglages, le mini-jeu du mensonge) : au niveau 2, bien visible ; au niveau 10, très bref.
         (Romain, 4 novembre, 22 h 44 : plus de zoom, plus de geste qui dure trop longtemps.) */
      signe = tic(id);
      p = Object.assign({}, p, {force:Math.min(1, (p.force || .7) + .12), signe:(p.signe || .6) * 1.2, double:(p.double || .36) * 1.15, tient:(p.tient || 1) * 1.15});
    } else {
      var l = p.listeSignes && p.listeSignes.length ? p.listeSignes : UN_SIGNE;
      signe = l[Math.floor(Math.random() * l.length)];
    }
  }
  var sc = T.scenario({texte:texte, ment:!!ment}, p, signe);
  return sc;
}
function sansMimiques(texte){ return {D:Math.max(2.2, 1.6 + texte.length * .045), ev:[], couche:null}; }
var HUMEUR = {
  vexe:{sourcils:'fronces', bouche:'moue', regard:'cote-g', menton:true, vitesse:.3},
  outre:{sourcils:'fronces', grandsYeux:true, vitesse:.2},
  vrai:{sourcils:'leves', regard:'bas', menton:'bas', vitesse:.3},
  exige:{sourcils:'leves', regard:'bas', menton:'bas', vitesse:.3},
  pardon:{sourire:1, vitesse:.3}, hydromel:{sourire:2, yeuxRieurs:true, rougeur:.35, vitesse:.3}, salut:{sourire:1, vitesse:.3},
  cloche:{sourire:1, vitesse:.3}, rien:{sourire:1, vitesse:.3},
  encore:{sourcils:'fronces', bouche:'moue', regard:'cote-d', vitesse:.3}, nouveau:{sourcils:'leves', sourire:1, vitesse:.3},
  pasencore:{regard:'haut-g', sourcils:'un', vitesse:.3}, potion:{sourire:2, yeuxRieurs:true, vitesse:.3}, accuse:{sourcils:'fronces', grandsYeux:true, menton:true, vitesse:.2}
};
/* Joue une réplique : bouche qui parle, mimiques (et le signe s'il ment), texte qui s'écrit ; fin() à la fin */
function jouer(box, bulle, texte, sc, base, fin){
  stopAnim();
  var svg = box && box.querySelector('svg.pj-expr, svg');
  function X(e){ if(svg && window.Persos && Persos.expression){ try{ Persos.expression(svg, e); }catch(er){} } }
  var a = anim = {t:[], i:[]};
  function T(fn, ms){ a.t.push(setTimeout(function(){ if(anim === a) fn(); }, ms)); }
  var duree = Math.min(sc.D * .75, texte.length * .05 + .6), n = 0, pas = Math.max(1, Math.round(texte.length / Math.max(1, duree / .04)));
  bulle.textContent = '';
  a.i.push(setInterval(function(){ if(n >= texte.length) return; n = Math.min(texte.length, n + pas); bulle.textContent = texte.slice(0, n); }, 40));
  var couche = {}, mim = {};
  base = base || {};
  function rendre(){ X(Object.assign({bouche:'parle'}, base, couche, mim)); ['cligne', 'hoche', 'secoue', 'avale'].forEach(function(g){ delete mim[g]; }); }
  rendre();
  (sc.ev || []).forEach(function(x){
    T(function(){ mim = Object.assign({}, x.e); if(x.signe) box.dataset.signe = x.id; rendre(); }, x.t * 1000);
    T(function(){ mim = {vitesse:x.retour}; if(x.signe) delete box.dataset.signe; rendre(); }, (x.t + x.actif) * 1000);
  });
  if(sc.couche){
    var cc = sc.couche;
    T(function(){ couche = Object.assign({}, cc.e); box.dataset.signe = cc.id; rendre(); }, cc.t * 1000);
    T(function(){ couche = cc.id === 'rougeur' ? {rougeur:0, vitesseRougeur:cc.descend} : cc.id === 'oreilles' ? {oreilles:0, vitesseRougeur:cc.descend} : {}; delete box.dataset.signe; rendre(); }, (cc.t + cc.actif) * 1000);
  }
  T(function(){
    a.i.forEach(clearInterval); a.i = [];
    bulle.textContent = texte;
    X(Object.assign({bouche:'fermee'}, base.menton ? {} : {}));
    if(fin) fin();
  }, sc.D * 1000);
}
function visage(id){
  if(window.Persos && Persos.pnj && Persos.PNJ && Persos.PNJ[id]){
    try{ var s = Persos.pnj(id, {anime:true, expressif:true, cadre:'visage', id:'bdv' + (++uid)}); if(s) return s; }catch(e){}
  }
  return '<span class="bd-emoji">' + ((D.PNJ[id] && D.PNJ[id].ic) || '🙂') + '</span>';
}

/* ==========================================================
   L'interrogatoire
   ========================================================== */
var CHARME = 'Ha ha ! Tu es un peu direct… mais avec toi, impossible de se fâcher. ';
function corrige(id){ return 'Non, attends… je me suis trompé' + (FEM[id] ? 'e' : '') + ' ! '; }
var MERCI = 'Oh, c\'est pour moi ? C\'est très gentil, merci beaucoup !';
var VEXE_ACCUSE = 'Tu me traites de menteur ?! Je ne te parle plus !';
/* les réponses dites DANS la boîte de leur question (les autres répliques s'écrivent en haut, sous le nom) */
var DANS_BOITE = {rep:1, vrai:1, exige:1, pasencore:1, outre:1, cloche:1, potionrep:1};
/* Ce qu'il dit en premier : trop occupé à ce moment (N.occupe), un salut du moment (N.saluts), ou son salut habituel */
function salut(id){
  var N = (M.E().pnj || {})[id] || {}, mid = M.momentId(), o = occupe(id); if(o) return o;
  /* E.salutUneFois (enquête 2, Romain, 7 novembre : « le Barde lit trop ») : le salut n'est dit qu'à la première visite ;
     le salut d'un moment (N.saluts), à la première visite de ce moment. Ensuite, rien sous le nom : le visage, et les questions. */
  var P = M.P(), E = M.E(); if(E && E.salutUneFois && P && P.vus && P.vus[cleSalut(id)]) return '';
  return (N.saluts && N.saluts[mid]) || N.salut || (id === 'voisin' ? 'Oui ? Qui est là ?' : 'Bonjour ! Que veux-tu savoir ?');
}
function cleSalut(id){ var N = (M.E().pnj || {})[id] || {}, mid = M.momentId(); return 'salut:' + id + ':' + (N.saluts && N.saluts[mid] ? mid : '*'); }
function occupe(id){ var E = M.E(), N = (E && E.pnj && E.pnj[id]) || {}; return (N.occupe && N.occupe[M.momentId()]) || null; }
function estVexe(id){ var P = M.P(); return !!(P && P.vexe && P.vexe[id] === P.moment); }
/* vexé parce qu'accusé à tort (« Mensonge ? » sur une vérité) : P.vexeAccuse {pnj:moment} */
function accuseAMoment(id){ var P = M.P(); return !!(P && P.vexeAccuse && P.vexeAccuse[id] === P.moment); }
/* la potion de vérité (enquête 2) : bue par un seul villageois de l'enquête (P.potionBue) */
function aBu(id){ var P = M.P(); return !!(P && P.potionBue === id); }
/* Une question qu'on ne montre pas : pas à ce moment (q.moments), plus utile (q.cacheSi), le rassemblement déjà fait,
   ou qui attend un indice qu'on n'a pas encore (q.secret, ou E.questionsCachees : enquête 2). */
function cachee(id, q){
  var E = M.E(), P = M.P();
  if(q.moments && !M.momentOk(q.moments)) return true;
  if(q.cacheSi && M.besoinOk(q.cacheSi)) return true;
  if(q.rassemble && P && P.vus && P.vus.rassemblement) return true;
  return !!(q.besoin && !M.besoinOk(q.besoin) && (q.secret || (E && E.questionsCachees)));
}
B.cachee = cachee;
/* Les choix montrés (Romain, 4 novembre, 22 h 25) : un choix qui dit un fait (c.si) n'apparaît que si le Barde le sait vraiment ;
   q.nbChoix : au plus ce nombre de choix (le bon, puis les premiers autres de la liste, dans l'ordre). Tant que le bon n'est pas
   connu, aucun choix : le villageois dit gentiment qu'il faudrait en savoir plus (q.pasEncore), sans rien révéler ni se fermer.
   Renvoie [{c, kc}] (kc : la place du choix dans q.choix, qui ne change jamais). */
var PAS_ENCORE = 'Hmm… Pour l\'instant, je ne vois pas bien pourquoi. Reviens quand tu en sauras un peu plus !';
function choixVisibles(q){
  var l = (q.choix || []).map(function(c, kc){ return {c:c, kc:kc}; }).filter(function(x){ return !x.c.si || M.besoinOk(x.c.si); });
  if(!l.some(function(x){ return x.c.bon; })) return [];
  if(q.nbChoix && l.length > q.nbChoix){ var n = 0; l = l.filter(function(x){ return x.c.bon || ++n < q.nbChoix; }); }
  return l;
}
B.choixVisibles = choixVisibles;

/* ---------- Enquête 2 (§ 12.11) : une seule visite par moment pour certains villageois (E.uneVisite) ----------
   « Encore toi ? Reviens plus tard ! » ; revenir avec du nouveau qui le concerne (une question qui s'ouvre, son signe de menteur
   appris) rouvre la porte : « Tu as du nouveau ? Bon, je t'écoute. » Un villageois vexé reste fermé jusqu'au moment suivant.
   P.visites {pnj:{m, sait}} ; UI.convOuverte : la conversation ouverte en ce moment (une découverte qui y revient en fait partie). */
function uneVisite(id){ var E = M.E(); return !!(E && E.uneVisite && E.uneVisite.indexOf(id) >= 0); }
function ceQuOnSait(id){
  var l = [];
  /* une question à choix dont le bon argument vient d'être appris : c'est du nouveau (« :pret ») */
  questions(id).forEach(function(q, i){ if(!repondu(id, i) && !cachee(id, q) && (!q.besoin || M.besoinOk(q.besoin))) l.push('q' + i + (q.choix && choixVisibles(q).length ? ':pret' : '')); });
  if(B.mimiques()[id]) l.push('signe');
  return l;
}
function dejaOuvert(id){
  var m = UI.modal;
  return UI.convOuverte === id && !!m && ((m.type === 'conv' && m.id === id) || (m.type === 'decouverte' && m.retourId === id));
}
/* true : il te reçoit ; false : « Encore toi ? » (la feuille s'ouvre sur sa porte fermée) */
function porte(id){
  var P = M.P();
  if(!P || !uneVisite(id) || estVexe(id) || occupe(id) || dejaOuvert(id)) return true;
  P.visites = P.visites || {};
  var v = P.visites[id], sait = ceQuOnSait(id);
  /* (Romain, 5 novembre, 12 h 31) la visite ne compte qu'une fois au moins une question posée (v.q, A.question) :
     ouvrir la conversation puis repartir sans rien demander laisse la porte ouverte */
  if(v && v.m === P.moment && v.q){
    if(!sait.some(function(k){ return v.sait.indexOf(k) < 0; })){
      UI.bd = {p:id, mode:'encore', t:'Encore toi ? Reviens plus tard !', m:P.moment};
      M.son('porte'); M.sauver(); M.ouvrir({type:'conv', id:id, classe:'b-feuille-conv'});
      return false;
    }
    UI.bd = {p:id, mode:'nouveau', t:'Tu as du nouveau ? Bon, je t\'écoute.', m:P.moment};
  }
  return true;
}
/* sans rien changer : est-ce qu'il dirait « Encore toi ? » (la carte le montre en rouge : B.fache) */
function encoreToi(id){
  var P = M.P(); if(!P || !uneVisite(id) || estVexe(id) || occupe(id)) return false;
  var v = P.visites && P.visites[id]; if(!v || v.m !== P.moment || !v.q) return false;
  var sait = ceQuOnSait(id);
  return !sait.some(function(k){ return v.sait.indexOf(k) < 0; });
}
/* fâché (vexé) ou « Encore toi ? » : on ne peut plus lui parler pour ce moment */
B.fache = function(id){ return estVexe(id) || encoreToi(id); };
M.pnjFache = function(id){ try{ return M.role() === 'barde' && B.fache(id); }catch(e){ return false; } };
/* Plus rien de nouveau à lui demander (Romain, 5 novembre, 13 h 19) : toutes ses questions ouvertes sont posées, pas de mensonge à démasquer,
   pas d'hydromel à offrir → sur la carte, son visage et « Rien de plus à dire », cerclés de rouge (sans « Parler ») */
B.rienADire = function(id){
  var P = M.P(), E = M.E(); if(!P || !E || !E.pnj || !E.pnj[id] || id === 'voisin') return false;
  var Q = questions(id); if(!Q.length) return false;
  if(Q.some(function(q, i){ return !repondu(id, i) && !cachee(id, q) && (!q.besoin || M.besoinOk(q.besoin)); })) return false;
  if(enquete2() && !fermeDemasque(id) && Q.some(function(q, i){ return mentNonVu(id, i); })) return false;
  if(talent('hydromel') && (P.potions.hydromel || 0) > 0 && !(P.usages && P.usages.hydromel)) return false;
  return true;
};
/* la pastille rouge de la carte (fâché, « Encore toi », plus rien à dire) ; '' : on peut lui parler */
B.pastilleRouge = function(id){
  var t = B.fache(id) ? 'reviens plus tard' : B.rienADire(id) ? 'rien de plus à dire' : '';
  return t ? '<div class="b-gens-carte bd-fache"><div class="b-gens-img">' + M.pnjImg(id) + '</div><span><b>' + esc(nom(id)) + '</b> : ' + t + '</span></div>' : '';
};
M.pastilleRouge = function(id){ try{ return M.role() === 'barde' ? B.pastilleRouge(id) : ''; }catch(e){ console.error(e); return ''; } };
B.porte = porte;
/* Pourra-t-on le revoir à un moment suivant ? Sinon, il accepte de reparler tout de suite (contre une action). */
function peutRevoir(id){
  var E = M.E(), P = M.P(), N = (E.pnj || {})[id] || {}, o = N.ou || {};
  for(var n = P.moment + 1; n < E.moments.length; n++) if(o[E.moments[n]]) return true;
  return false;
}
function texteVexe(id, c){
  var E = M.E(), P = M.P(), t = (c && c.vexe) || 'Hé ! Ce n\'est pas très poli, ça.';
  var neutre = !!E.vexeNeutre;   /* enquête 2 (§ 12.13) : la même réplique neutre pour tous les mauvais choix, sans « vexé » */
  if(peutRevoir(id)){
    var n = P.moment + 1;
    while(n < E.moments.length && !(((E.pnj[id] || {}).ou || {})[E.moments[n]])) n++;
    return t + (neutre ? ' Repasse ' : ' J\'ai plus trop envie de parler. Repasse ') + (QUAND[E.moments[n]] || 'plus tard') + '.';
  }
  return t + (neutre ? ' Bon… repose-moi la question autrement, si tu veux.' : ' J\'ai plus trop envie de parler… Bon. Si tu me demandes pardon, je veux bien t\'écouter quand même.');
}
function fermeDemasque(id){
  var p = reglagesMensonge();
  return M.nbEchecs ? M.nbEchecs('demasque:' + id) >= M.MAX_ESSAIS + ((p.mods && p.mods.erreurs) || 0) : false;
}
function repetesMax(){ var p = reglagesMensonge(); return 1 + (p.revoir || 0); }
function repetes(id){ var P = M.P(); return ((P.repete || {})[id + ':' + P.moment]) || 0; }
function texteDe(bd){
  if(!bd) return '';
  var q = questions(bd.p)[bd.i];
  if(bd.mode === 'rep' && q) return (bd.charme ? CHARME : '') + q.a;
  if(bd.mode === 'vrai' && q) return q.vrai || q.a;
  if(bd.mode === 'potionrep' && q) return q.a + ' ' + corrige(bd.p) + q.vrai;   /* la potion de vérité : le mensonge, puis il se reprend tout de suite */
  return bd.t || '';
}
function mentNonVu(id, i){ var P = M.P(), q = questions(id)[i]; return !!(q && q.ment && repondu(id, i) && !P.vus['verite:' + id + ':' + i]); }
function preparer(id){
  /* N.noteSalut : ce que dit sa phrase d'accueil s'inscrit aussi dans le Carnet, une seule fois (Iris, enquête 2 : Bible §13.10) */
  try{ var P0 = M.P(), N0 = ((M.E() || {}).pnj || {})[id] || {}; if(N0.noteSalut && P0 && !estVexe(id) && !P0.vus['salut-note:' + id]){ P0.vus['salut-note:' + id] = 1; M.noter(N0.noteSalut, (D.PNJ[id] || {}).ic); } }catch(e){ console.error(e); }
  if(UI.bd && UI.bd.p === id && UI.bd.m === M.P().moment) return;
  UI.bd = estVexe(id) ? {p:id, mode:'vexe', t:(M.P().vexeTxt || {})[id] || texteVexe(id), m:M.P().moment, joue:true} : {p:id, mode:'salut', t:salut(id), m:M.P().moment};
  /* le salut est dit : la prochaine visite n'en aura plus (E.salutUneFois) ; « occupé » n'est pas un salut */
  try{ var E1 = M.E(), P1 = M.P(); if(E1 && E1.salutUneFois && UI.bd.mode === 'salut' && UI.bd.t && !occupe(id)){ P1.vus[cleSalut(id)] = 1; M.sauver(); } }catch(e){ console.error(e); }
}
B.preparer = preparer;

M.feuilleConv = function(id){
  if(/^scene:/.test(id)) return sceneHTML(id.slice(6));
  if(/^bonus:/.test(id)) return bonusConvHTML(id.slice(6));
  if(id === 'rumeur') return rumeurHTML();
  var E = M.E(), P = M.P(), x = D.PNJ[id] || {nom:id, court:id, metier:''}, Q = questions(id);
  var bd = UI.bd && UI.bd.p === id ? UI.bd : null;
  var vexe = estVexe(id), e2 = enquete2() && id !== 'voisin', ferme = e2 && fermeDemasque(id);   /* le voisin (une porte, une scène) : pas de 🤥 */
  var occ = !vexe && occupe(id), encore = !vexe && !occ && !!(bd && bd.mode === 'encore');
  var t = bd ? texteDe(bd) : salut(id);
  /* Romain, 4 novembre, 22 h 38 (tous les interrogatoires) : en haut, seulement le nom et le grand visage animé. Une réponse s'écrit
     DANS la boîte de sa question (DANS_BOITE) ; les autres répliques (salut, « Encore toi ? », merci pour la potion…) : une ligne sous le nom. */
  var dansBoite = !!(bd && DANS_BOITE[bd.mode] && bd.i !== undefined && bd.i !== null);
  var tHaut = dansBoite ? '' : t;
  function texteEcrit(txt){ return bd && !bd.joue ? '' : esc(txt); }   /* le texte qui va s'écrire (apresRendu) commence vide */
  var s = '<div class="bd-conv">';
  s += '<div class="bd-tete"><div class="bd-nom"><h2>' + esc(x.nom) + '</h2><span class="doux">' + esc(x.metier) + '</span></div>' +
    (tHaut ? '<p class="bd-dit-haut' + (bd ? ' bd-' + bd.mode : '') + '"><span id="bd-texte">' + texteEcrit(tHaut) + '</span>' + lire(tHaut, id) + '</p>' : '') +
    '<div class="bd-visage' + (vexe ? ' vexe' : '') + '" id="bd-visage">' + visage(id) + '</div></div>';
  /* (Romain, 22 h 46 : plus de « 🤫 Ton secret » ici. Les signes ne sont QUE sur le tableau de liège : un petit bouton pour y aller et revenir.) */
  var tableauHTML = M.role() === 'barde' && M.liegeHTML ? '<button class="btn petit second bd-tableau" data-act="bd-tableau" data-p="' + id + '">📌 Mon tableau</button>' : '';
  if(vexe && accuseAMoment(id)){
    /* accusé de mentir alors qu'il disait la vérité (Romain, 22 h 43) : pas de deuxième chance, fermé jusqu'au moment suivant (pas de pardon) */
    s += '<div class="bd-boude"><p>😠 ' + esc(nom(id)) + ' ne te parle plus : tu ' + (FEM[id] ? 'l\'as traitée' : 'l\'as traité') + ' de menteu' + (FEM[id] ? 'se' : 'r') + '. ' +
      (peutRevoir(id) ? 'Reviens au moment suivant.' : 'C\'était le dernier moment pour ' + (FEM[id] ? 'la' : 'le') + ' voir.') + '</p></div>';
    return s + '</div>';
  }
  if(vexe){
    var neutre = !!E.vexeNeutre;   /* enquête 2 (§ 12.13) : pas « vexé », il ne veut juste plus parler pour ce moment */
    s += '<div class="bd-boude"><p>' + (neutre ? '🤔 ' + esc(nom(id)) + ' n\'a plus rien à te dire pour ce moment. ' : '😤 ' + esc(nom(id)) + ' est vexé' + (FEM[id] ? 'e' : '') + '. ') +
      (peutRevoir(id) ? 'Reviens au moment suivant : ' + il(id) + ' te reparlera.' : neutre ? 'C\'est le dernier moment où tu peux ' + (FEM[id] ? 'la' : 'le') + ' voir : repose ta question autrement !' : 'C\'est le dernier moment où tu peux ' + (FEM[id] ? 'la' : 'le') + ' voir : demande-' + lui(id) + ' pardon !') + '</p>';
    /* sans points d'action (enquête 1) : on revient au moment suivant ; s'il n'y en a plus, le pardon ne coûte rien */
    if(!peutRevoir(id)) s += '<button class="btn magie grand" data-act="bd-pardon" data-p="' + id + '"' + (M.peutAgir() ? '' : ' disabled') + '>' + (neutre ? '🔁 Reposer la question' : '🙏 Demander pardon') + M.coutTxt() + '</button>' +
      (M.peutAgir() ? '' : '<p class="doux petit">Plus d\'action ? Le Sage peut te donner une action de sa réserve 💡.</p>');
    return s + '</div></div>';
  }
  /* trop occupé à ce moment (N.occupe), ou déjà vu à ce moment sans rien de nouveau (E.uneVisite) : pas de questions */
  if(occ || encore){
    s += '<div class="bd-boude"><p>' + (occ ? '⏳ ' + esc(nom(id)) + ' est bien trop occupé' + (FEM[id] ? 'e' : '') + ' pour l\'instant. Reviens plus tard !' :
      '🚪 ' + esc(nom(id)) + ' ne veut plus te parler pour ce moment. Reviens au moment suivant… ou quand tu auras du nouveau pour ' + lui(id) + ' !') + '</p></div>';
    return s + '</div>';
  }
  /* la potion de vérité (enquête 2, E.potionAveu) : on l'offre AVANT les questions ; il accepte toujours, sans savoir ce que c'est.
     Une seule par enquête : un seul villageois la boit (P.potionBue). Bouton jaune (la règle des boutons). */
  var resteADemander = Q.some(function(q, i){ return !repondu(id, i) && !cachee(id, q) && (!q.besoin || M.besoinOk(q.besoin)); });
  if(e2 && E.potionAveu && (P.potions.verite || 0) > 0 && !P.potionBue && resteADemander) s += '<button class="btn b-aller bd-potion-btn" data-act="bd-potion" data-p="' + id + '">💬 Lui offrir la potion de vérité</button>';
  if(aBu(id)) s += '<p class="bd-potion-bue">💬 ' + esc(nom(id)) + ' a bu ta potion de vérité : maintenant, tout ce qu\'' + il(id) + ' dit est vrai.</p>';
  /* Chaque question : une petite boîte repliable (▸ fermée, ▾ ouverte), une seule ouverte à la fois (name + bd-boites, plus bas).
     Pas encore posée : la toucher la pose, et sa boîte s'ouvre sur la réponse (avec 🔁 Répète et 🤥 Mensonge ?). */
  var nomBoites = 'bdq-' + id;
  s += '<div class="b-questions bd-questions">';
  Q.forEach(function(q, i){
    var k = 'barde:' + id + ':' + i, st = P.vus[k];
    if(!st && cachee(id, q)) return;
    if(q.besoin && !M.besoinOk(q.besoin) && !st){
      s += '<div class="b-question ferme"><span>🔒</span><div><b>' + esc(q.q) + '</b>' + M.besoinHTML(q.besoin, 'barde') + '</div></div>';
      return;
    }
    var ici = dansBoite && bd.i === i;   /* la réplique de ce moment est pour cette question */
    if(st !== 'ok'){
      var vis = q.choix && q.choix.length ? choixVisibles(q) : null;
      if(vis && vis.length){
        /* une question à choix : sa boîte s'ouvre sur les façons de demander */
        s += '<details class="b-question bd-boite bd-choix" name="' + nomBoites + '"><summary><b>' + esc(q.q) + '</b></summary><div class="bd-boite-in"><p class="bd-choix-sous">' + esc(q.sousTitre || 'Comment tu le demandes ?') + '</p>' + vis.map(function(x){
          var c = x.c, kc = x.kc, barre = !!P.vus['maladroit:' + id + ':' + i + ':' + kc];
          return '<button class="b-question bd-facon' + (barre ? ' barre' : '') + '" data-act="question" data-p="' + id + '" data-i="' + i + '" data-c="' + kc + '"' + (barre ? ' disabled' : '') + '><span>' + (barre ? '❌' : '🗨️') + '</span><b>« ' + esc(c.q) + ' »</b></button>';
        }).join('') + '</div></details>';
      } else if(ici){
        /* une réplique sans réponse notée (le bon argument pas encore connu) : la boîte ouverte, la réplique dedans */
        s += '<details class="b-question bd-boite" name="' + nomBoites + '" open><summary><b>' + esc(q.q) + '</b></summary><div class="bd-boite-in"><div class="bd-cadre"><p class="b-reponse" id="bd-texte">' + texteEcrit(t) + '</p></div></div></details>';
      } else s += '<button class="b-question bd-boite bd-a-poser" data-act="question" data-p="' + id + '" data-i="' + i + '"><b>' + esc(q.q) + '</b></button>';
      return;
    }
    var v = P.vus['verite:' + id + ':' + i], intu = P.vus['intuition:' + id + ':' + i] && !v, pot = !!P.vus['potion:' + id + ':' + i];
    /* le cadre de la réponse ; ce qui s'écrit en ce moment (id bd-texte) : la réponse, la vérité, ou sa réplique (outré, clochette) */
    var ecrit = ici ? bd.mode : '';
    var cadre = '<div class="bd-cadre">';
    if(ecrit === 'potionrep') cadre += '<p class="b-reponse" id="bd-texte">' + texteEcrit(t) + '</p>';
    else {
      cadre += '<p class="b-reponse"' + (ecrit === 'rep' ? ' id="bd-texte"' : '') + '>' + (ecrit === 'rep' ? texteEcrit(t) : '« ' + esc(q.a) + ' »') + '</p>';
      if(v) cadre += '<p class="b-reponse verite"><b>🔍 La vérité :</b> ' + (pot ? esc(corrige(id)) : '') + '<span' + (ecrit === 'vrai' || ecrit === 'exige' ? ' id="bd-texte">' + texteEcrit(t) : '>« ' + esc(q.vrai) + ' »') + '</span></p>';
      if(ecrit === 'cloche' || ecrit === 'outre') cadre += '<p class="b-reponse bd-replique" id="bd-texte">' + texteEcrit(t) + '</p>';
    }
    if(v) cadre += '<p class="bd-tag-ment">🤥 Mensonge' + (pot ? ' <small>(potion de vérité)</small>' : '') + '</p>';
    if(intu) cadre += '<p class="bd-intu">🔮 Ton intuition : c\'est un mensonge !</p>';
    cadre += '<div class="bd-rep-outils">' + lire(v ? q.vrai : q.a, id) +
      (e2 && repetes(id) < repetesMax() ? '<button class="btn petit second" data-act="bd-repete" data-p="' + id + '" data-i="' + i + '">🔁 Répète</button>' : '') +
      (e2 && !v && !ferme && derniere(id) === i ? '<button class="btn petit bd-ment-p" data-act="bd-ment" data-p="' + id + '" data-i="' + i + '">🤥 Mensonge ?</button>' : '') + '</div></div>';
    s += '<details class="b-question repondue bd-boite' + (ici ? ' bd-cur' : '') + '" name="' + nomBoites + '"' + (ici ? ' open' : '') + '><summary>' + (v ? '<span class="bd-mini-tag">🤥</span>' : '') + '<b>' + esc(q.q) + '</b></summary><div class="bd-boite-in">' + cadre + '</div></details>';
  });
  s += '</div>';
  s += tableauHTML;
  /* sans points d'action : un villageois ne donne qu'une chose par moment ; tout demandé, on le dit gentiment */
  if(M.sansActions() && M.rienDePlus && Q.length && Q.every(function(q, i){ return repondu(id, i) || cachee(id, q); })) s += M.rienDePlus();
  /* en bas : ce qui sert à la fin d'un interrogatoire */
  var bas = '';
  var parle = Q.some(function(q, i){ return repondu(id, i); });
  var ex = M.fxSomme('verite') - ((P.usages && P.usages.verite) || 0);
  if(e2 && ex > 0 && parle) bas += '<button class="btn magie" data-act="bd-exiger" data-p="' + id + '">⚖️ J\'exige la vérité ! <small>(encore ' + ex + ')</small></button>';
  if(talent('hydromel') && (P.potions.hydromel || 0) > 0 && !P.usages.hydromel && id !== 'voisin') bas += '<button class="btn magie" data-act="bd-hydromel" data-p="' + id + '">🍯 Offrir l\'Hydromel des confidences</button>';
  /* (la potion de vérité de l'enquête 2 s'offre en haut, avant les questions ; sans E.potionAveu, on la boit soi-même) */
  if(e2 && !E.potionAveu && (P.potions.verite || 0) > 0 && !(P.bues && P.bues.verite === P.moment)) bas += '<button class="btn second" data-act="boire" data-id="verite">💬 Boire la potion de vérité (tout ce moment)</button>';
  if(bas) s += '<div class="bd-bas">' + bas + '</div>';
  if(e2 && ferme) s += '<p class="doux petit bd-avert">🔒 ' + esc(nom(id)) + ' ne te croit plus : tu ne peux plus ' + (FEM[id] ? 'la' : 'le') + ' démasquer pendant cette enquête.</p>';
  /* (le bloc « 📖 Les 7 signes du menteur » n'est plus dans l'interrogatoire : Romain, 4 novembre, 22 h 25) */
  return s + '</div>';
};

/* ---------- Les actions de l'interrogatoire ---------- */
var parler0 = A.parler, frapper0 = A.frapper;
A.parler = function(el){ if(!porte(el.dataset.id)) return; preparer(el.dataset.id); return parler0(el); };
A.frapper = function(el){
  var P = M.P(), ici = M.pnjIci(el.dataset.id);
  if(ici.length && !porte(ici[0])) return;   /* une seule visite par moment (E.uneVisite) */
  if(ici.length) preparer(ici[0]);
  if(ici.length && P.conv[ici[0]] === P.moment){ M.son('porte'); M.ouvrir({type:'conv', id:ici[0], classe:'b-feuille-conv'}); return; }   /* déjà ouvert à ce moment : sans action */
  return frapper0(el);
};
/* 🤥 Mensonge ? seulement juste après la réponse (Romain, 5 novembre, 21 h 46 : « trop simple pour détecter les mensonges ») :
   le bouton n'est que sous la dernière réponse de ce villageois (P.derniere[id]) ; dès qu'on pose une autre question, il part
   en fumée, avec un tout petit souffle (M.son('fumee')). « 🔁 Répète » redonne la chance sur la réponse répétée. */
function derniere(id){ var P = M.P(); return P && P.derniere ? P.derniere[id] : undefined; }
function poserDerniere(id, i){ var P = M.P(); P.derniere = P.derniere || {}; P.derniere[id] = i; }
B.derniere = derniere;
/* La fumée : sur un vrai toucher, le bouton s'évapore à sa place, puis la question part (un tiers de seconde) ; appelée par le code
   (les tests), la question part tout de suite et une copie du bouton s'évapore là où il était (rien n'attend). */
var fumeeEnCours = false;
function bouffees(r){
  var f = document.createElement('div');
  f.className = 'bd-fumee'; f.setAttribute('aria-hidden', 'true');
  f.style.left = (r.left + r.width / 2) + 'px'; f.style.top = (r.top + r.height / 2) + 'px';
  f.innerHTML = '<i></i><i></i><i></i><i></i><i></i>';
  document.body.appendChild(f);
  setTimeout(function(){ f.remove(); }, 1100);
}
function fantome(b, r){   /* r : sa place, mesurée avant que la fenêtre ne se redessine */
  var g = b.cloneNode(true);
  g.removeAttribute('data-act'); g.setAttribute('aria-hidden', 'true'); g.classList.add('bd-part', 'bd-fantome');
  g.style.left = r.left + 'px'; g.style.top = r.top + 'px'; g.style.width = r.width + 'px'; g.style.height = r.height + 'px';
  document.body.appendChild(g); bouffees(r);
  setTimeout(function(){ g.remove(); }, 1100);
}
A.question = function(el){
  if(fumeeEnCours) return;
  var P0 = M.P(), id0 = el.dataset.p, i0 = +el.dataset.i, avant = derniere(id0), b = null, r = null;
  if(P0 && avant !== undefined && avant !== i0){
    b = document.querySelector('#voile .bd-ment-p[data-act="bd-ment"][data-p="' + id0 + '"][data-i="' + avant + '"]');
    r = b && b.getBoundingClientRect();
    if(!r || !r.width || !r.height) b = null;   /* sa boîte est refermée : rien à voir partir */
  }
  if(b && el.nodeType === 1){
    fumeeEnCours = true; b.classList.add('bd-part'); bouffees(r); M.son('fumee');
    setTimeout(function(){ fumeeEnCours = false; try{ question(el); }catch(e){ console.error(e); } }, 330);
    return;
  }
  var res = question(el);
  try{ if(b && derniere(id0) !== avant){ fantome(b, r); M.son('fumee'); } }catch(e){ console.error(e); }
  return res;
};
function question(el){
  var P = M.P(), id = el.dataset.p, i = +el.dataset.i, q = questions(id)[i];
  if(!P || !q || estVexe(id)) return;
  if(q.besoin && !M.besoinOk(q.besoin) && !P.vus['barde:' + id + ':' + i]) return;
  if(uneVisite(id)){ P.visites = P.visites || {}; var vv = P.visites[id]; if(!(vv && vv.m === P.moment && vv.q)) P.visites[id] = {m:P.moment, sait:ceQuOnSait(id), q:1}; }   /* la visite compte (porte) */
  if(repondu(id, i)){ poserDerniere(id, i); UI.bd = {p:id, i:i, mode:'rep', m:P.moment}; M.render(); return; }   /* redemandée : c'est la dernière réponse */
  if(P.derniere) delete P.derniere[id];   /* une autre question : la chance du 🤥 sur la réponse d'avant est passée */
  var kc = el.dataset.c, c = q.choix && kc !== undefined && kc !== '' ? q.choix[+kc] : null, charme = false;
  if(q.choix && q.choix.length){
    var vis = choixVisibles(q);
    /* le bon argument pas encore connu : une réplique gentille et neutre ; il ne se ferme pas, rien n'est noté */
    if(!vis.length){ UI.bd = {p:id, i:i, mode:'pasencore', t:q.pasEncore || PAS_ENCORE, m:P.moment}; M.son('clic'); M.render(); return; }
    if(!c || !vis.some(function(x){ return x.c === c; })) return;   /* un choix qu'on ne voit pas (pas encore su) */
  }
  if(c && !c.bon){
    if(M.fxVrai('charmeur')) charme = true;   /* Charmeur : les maladroites ne vexent plus */
    else {
      P.vus['maladroit:' + id + ':' + i + ':' + kc] = 1;
      P.vexe = P.vexe || {}; P.vexe[id] = P.moment;
      P.vexeTxt = P.vexeTxt || {}; P.vexeTxt[id] = texteVexe(id, c);
      UI.bd = {p:id, mode:'vexe', t:P.vexeTxt[id], m:P.moment};
      M.noter((M.E() || {}).vexeNeutre ? nom(id) + ' n\'a rien voulu dire quand tu as dit : « ' + c.q + ' ».' : nom(id) + ' s\'est vexé' + (FEM[id] ? 'e' : '') + ' : « ' + c.q + ' », ce n\'était pas la bonne façon de demander.', (M.E() || {}).vexeNeutre ? '🤔' : '😤');
      M.son('ko'); M.sauver(); if(vexeLache(id)) return; M.render(); return;
    }
  }
  P.vus['barde:' + id + ':' + i] = 'ok';
  poserDerniere(id, i);
  if(q.mimique){ P.mimiques = P.mimiques || {}; [].concat(q.mimique).forEach(function(m){ P.mimiques[m] = P.mimiques[m] || 'question'; }); }
  /* dès l'enquête 2 (E.tics), les signes révélés deviennent des étiquettes du tableau de liège (liege.js) */
  if(q.mimique && (M.E() || {}).tics) M.toast('📌 ' + ([].concat(q.mimique).length > 1 ? 'De nouvelles étiquettes' : 'Une nouvelle étiquette') + ' pour ton tableau de liège !');
  M.noter(q.note, (D.PNJ[id] || {}).ic);
  /* il a bu la potion de vérité : il dit le mensonge, se reprend tout de suite (« je me suis trompé ! ») et dit la vérité */
  var potionRep = !!(q.ment && aBu(id));
  if(potionRep){
    P.vus['verite:' + id + ':' + i] = 1; P.vus['potion:' + id + ':' + i] = 1;
    M.noter(q.noteVrai || (nom(id) + ' a avoué : ' + String(q.vrai || '').replace(/[«»]/g, '').trim()), '💬');
  }
  var code = null;
  if(q.obj){ P.objets[q.obj] = true; code = 'obj:' + q.obj; }
  if(q.donne){ P.objets['_' + q.donne] = true; code = q.donne; }
  UI.bd = {p:id, i:i, mode:potionRep ? 'potionrep' : 'rep', charme:charme, m:P.moment};
  M.son('clic'); M.sauver();
  if(potionRep && apresVerite(id, [i])){ UI.bd.joue = true; return; }   /* une vérité qui donne un objet (la pierre de Tim) */
  if(q.rassemble && rassemblement(id, q)) return;   /* le troisième villageois convaincu : toute la troupe part au Vieux Chêne */
  if(code){ UI.bd.joue = true; M.decouvrir({ic:(D.PNJ[id] || {}).ic, titre:nom(id) + ' te donne quelque chose', t:q.a, code:code, retour:'parler', retourId:id}); return; }
  M.render();
}
/* ---------- Le rassemblement (E.rassemblement, enquête 2) : convaincre n villageois (questions q.rassemble, le bon argument) ---------- */
function convaincus(){ var E = M.E(); return M.cle(E.pnj || {}).filter(function(id){ return questions(id).some(function(q, i){ return q.rassemble && repondu(id, i); }); }); }
B.convaincus = convaincus;
function rassemblement(id, q){
  var E = M.E(), P = M.P(), R = E && E.rassemblement;
  if(!R || P.vus.rassemblement) return false;
  var n = convaincus().length;
  if(n < (R.n || 3)){ M.toast('📣 ' + n + ' villageois sur ' + (R.n || 3) + ' prêts à venir au Vieux Chêne !'); return false; }
  P.vus.rassemblement = 1;
  if(R.code) P.objets['_' + R.code] = true;
  M.sauver();
  M.decouvrir({ic:R.ic || '📣', illu:R.illu || null, titre:R.titre || 'Le rassemblement', t:'« ' + q.a + ' » ' + R.t, note:R.note, code:R.code || null});
  return true;
}
/* Un filet de sécurité (Romain, 23 h 20) : vexé (mauvais choix ou accusé à tort) au moment N.vexeDonne.moments, il part fâché…
   mais lâche quand même ce qu'il cachait (N.vexeDonne {obj, moments, a, note} : Tim et sa pierre, la nuit). Rien si l'objet est déjà donné. */
/* Une info aussi (N.vexeDonne {info, besoin, deja} : Farinel et les plans du moulin, si le Barde a les traces ; rien s'il les a déjà donnés). */
function vexeLache(id){
  var P = M.P(), N = ((M.E() || {}).pnj || {})[id] || {}, V = N.vexeDonne;
  if(!P || !V || !(V.obj || V.info) || !M.momentOk(V.moments)) return false;
  if(V.obj && P.objets[V.obj]) return false;
  if(V.info && (P.vus['vexe-donne:' + id] || (V.deja && P.vus[V.deja]) || (V.besoin && !M.besoinOk(V.besoin)))) return false;
  if(V.obj) P.objets[V.obj] = true; else P.vus['vexe-donne:' + id] = 1;
  if(V.note) M.noter(V.note, (D.PNJ[id] || {}).ic); M.sauver();
  UI.bd.joue = true;
  M.decouvrir({ic:(D.PNJ[id] || {}).ic, titre:nom(id) + ' s\'en va, fâché' + (FEM[id] ? 'e' : ''), t:((P.vexeTxt || {})[id] ? '« ' + P.vexeTxt[id] + ' » ' : '') + V.a, code:V.obj ? 'obj:' + V.obj : 'info:' + V.info, retour:'parler', retourId:id});
  return true;
}
/* Une vérité qui donne un objet (q.objVrai : la pierre de Tim) : son code s'affiche tout de suite */
function apresVerite(id, idx){
  var P = M.P(), l = idx.filter(function(i){ var q = questions(id)[i]; return q && q.objVrai; });
  if(!l.length) return false;
  var q = questions(id)[l[0]];
  P.objets[q.objVrai] = true; M.sauver();
  M.decouvrir({ic:(D.PNJ[id] || {}).ic, titre:nom(id) + ' te donne quelque chose', t:q.vrai, code:'obj:' + q.objVrai, retour:'parler', retourId:id});
  return true;
}
/* Il avoue (Exige la vérité, potion de vérité) : ces mensonges deviennent la vérité, notée dans le Carnet */
function avouer(id, idx, ic){
  var P = M.P();
  idx.forEach(function(i){ var q = questions(id)[i]; P.vus['verite:' + id + ':' + i] = 1; M.noter(q.noteVrai || (nom(id) + ' a avoué : ' + String(q.vrai || '').replace(/[«»]/g, '').trim()), ic || '⚖️'); });
}
/* 🤥 : juste, la vérité sort ; faux, il est outré (un échec ; deux échecs, il ne te croit plus de l'enquête) */
A['bd-ment'] = function(el){
  var P = M.P(), id = el.dataset.p, i = +el.dataset.i, q = questions(id)[i];
  if(!P || !q || !enquete2() || !repondu(id, i) || P.vus['verite:' + id + ':' + i]) return;
  if(derniere(id) !== i) return;   /* plus que sous la dernière réponse */
  if(fermeDemasque(id)){ M.toast(nom(id) + ' ne te croit plus : plus possible de ' + (FEM[id] ? 'la' : 'le') + ' démasquer dans cette enquête.'); return; }
  if(q.ment){
    P.vus['verite:' + id + ':' + i] = 1;
    M.noter(q.noteVrai || (nom(id) + ' a avoué : ' + String(q.vrai || '').replace(/[«»]/g, '').trim()), '🔍');
    UI.bd = {p:id, i:i, mode:'vrai', m:P.moment};
    M.son('magie'); M.sauver();
    if(apresVerite(id, [i])){ UI.bd.joue = true; return; }
    M.render(); M.toast('Démasqué ! ' + nom(id) + ' dit enfin la vérité.');
    return;
  }
  var p = reglagesMensonge(), cloches = (p.mods && p.mods.indice) || 0;
  P.usages = P.usages || {};
  if((P.usages.clochette || 0) < cloches){   /* la clochette de vérité : elle évite une fausse accusation */
    P.usages.clochette = (P.usages.clochette || 0) + 1;
    UI.bd = {p:id, i:i, mode:'cloche', t:'Ding ! La clochette de vérité tinte : cette réponse est sûrement vraie. Tu gardes ton accusation pour plus tard.', m:P.moment};
    M.son('cloche'); M.sauver(); M.render(); return;
  }
  /* Romain (4 novembre, 22 h 43) : pas de deuxième chance. Accusé à tort, il se vexe, la discussion s'arrête tout de suite,
     et il reste fermé jusqu'au moment suivant (« du nouveau » ne rouvre pas la porte d'un vexé ; pas de pardon). */
  P.vexe = P.vexe || {}; P.vexe[id] = P.moment;
  P.vexeAccuse = P.vexeAccuse || {}; P.vexeAccuse[id] = P.moment;
  P.vexeTxt = P.vexeTxt || {}; P.vexeTxt[id] = VEXE_ACCUSE;
  M.noter(nom(id) + ' disait la vérité, et tu l\'as traité' + (FEM[id] ? 'e' : '') + ' de menteu' + (FEM[id] ? 'se' : 'r') + ' : ' + il(id) + ' ne te parle plus pour ce moment.', '😠');
  UI.bd = {p:id, mode:'accuse', t:VEXE_ACCUSE, m:P.moment};
  M.son('ko'); M.sauver(); if(vexeLache(id)) return; M.render();
};
A['bd-repete'] = function(el){
  var P = M.P(), id = el.dataset.p, i = +el.dataset.i;
  if(!repondu(id, i) || repetes(id) >= repetesMax()) return;
  P.repete = P.repete || {}; P.repete[id + ':' + P.moment] = repetes(id) + 1;
  poserDerniere(id, i);   /* répétée : c'est de nouveau la dernière réponse, le 🤥 y revient */
  UI.bd = {p:id, i:i, mode:'rep', m:P.moment};
  M.son('page'); M.sauver(); M.render();
};
A['bd-pardon'] = function(el){
  var P = M.P(), id = el.dataset.p;
  if(!estVexe(id) || peutRevoir(id) || accuseAMoment(id)) return;   /* accusé à tort : pas de pardon */
  if(!M.peutAgir()){ M.toast('Plus d\'action : demande au Sage une action de sa réserve 💡'); return; }
  M.depenser(); delete P.vexe[id];
  UI.bd = {p:id, mode:'pardon', t:(M.E() || {}).vexeNeutre ? 'Bon… vas-y, je t\'écoute.' : 'Bon… j\'accepte tes excuses. Vas-y, demande-moi.', m:P.moment};
  M.son('ok'); M.sauver(); M.render();
};
/* Exige la vérité : tous les mensonges de cet interrogatoire deviennent la vérité (le bouton est toujours là : il ne trahit rien) */
A['bd-exiger'] = function(el){
  var P = M.P(), id = el.dataset.p, aveux = [];
  P.usages = P.usages || {};
  if(M.fxSomme('verite') <= (P.usages.verite || 0)) return;
  P.usages.verite = (P.usages.verite || 0) + 1;
  questions(id).forEach(function(q, i){ if(mentNonVu(id, i)) aveux.push(i); });
  avouer(id, aveux, '⚖️');
  if(aveux.length) UI.bd = {p:id, i:aveux[0], mode:'exige', m:P.moment, t:'Bon, d\'accord… Je vais tout te dire. ' + aveux.map(function(i){ return questions(id)[i].vrai; }).join(' ')};
  else UI.bd = {p:id, mode:'rien', m:P.moment, t:'J\'ai tout dit vrai, je te le jure ! Tu peux me croire.'};
  M.son('magie'); M.sauver();
  if(aveux.length && apresVerite(id, aveux)){ UI.bd.joue = true; return; }
  M.render();
};
/* La potion de vérité (enquête 2, E.potionAveu ; Romain, 4 novembre, 22 h 38) : on l'offre AVANT de poser les questions.
   Le villageois accepte toujours, sans savoir ce que c'est ; ensuite, tout ce qu'il dit est vrai (A.question : « je me suis trompé ! »).
   Une seule par enquête : bue, elle est consommée, et ne sert que pour CE villageois (P.potionBue). */
A['bd-potion'] = function(el){
  var P = M.P(), E = M.E(), id = el.dataset.p;
  if(!P || !E || !E.potionAveu || !((P.potions.verite || 0) > 0) || P.potionBue) return;
  P.potions.verite--; P.potionBue = id;
  M.noter('Tu as offert ta potion de vérité à ' + nom(id) + ' (sans le lui dire) : tout ce qu\'' + il(id) + ' te dira maintenant est vrai.', '💬');
  UI.bd = {p:id, mode:'potion', m:P.moment, t:MERCI};
  M.son('magie'); M.sauver(); M.render();
};
/* 📌 Mon tableau : le tableau de liège (les signes des menteurs n'y sont plus qu'en étiquettes), puis ↩️ retour au même villageois,
   dans la même visite (liege.js : M.retourConv) */
A['bd-tableau'] = function(el){
  var P = M.P(), id = el.dataset.p;
  UI.bdRetour = {id:id, m:P.moment};
  UI.modal = null; P.onglet = 'role'; M.sauver(); M.render(); window.scrollTo(0, 0);
};
M.retourConv = function(){
  var r = UI.bdRetour, P = M.P();
  UI.bdRetour = null;
  if(!r || !P || r.m !== P.moment) return false;
  preparer(r.id); if(UI.bd && UI.bd.p === r.id) UI.bd.joue = true;   /* il ne redit pas son salut */
  M.ouvrir({type:'conv', id:r.id, classe:'b-feuille-conv'});
  return true;
};
B.retourPossible = function(){ var r = UI.bdRetour, P = M.P(); return !!(r && P && r.m === P.moment) ? r.id : null; };
A.forcer = function(el){ A['bd-exiger']({dataset:{p:el.dataset.p}}); };
/* L'ancien bouton « Démasquer » (ancien mini-jeu) : on rouvre simplement la conversation */
A.demasquer = function(el){ var id = el.dataset.p; preparer(id); M.ouvrir({type:'conv', id:id, classe:'b-feuille-conv'}); };
/* Hydromel des confidences : le villageois innocente un suspect (jamais le coupable, jamais la solution directement) */
A['bd-hydromel'] = function(el){
  var P = M.P(), E = M.E(), id = el.dataset.p;
  if(!talent('hydromel') || !((P.potions.hydromel || 0) > 0) || P.usages.hydromel) return;
  var L = (P.liege && P.liege.cartes) || {};
  var l = (E.qui.choix || []).filter(function(s){ return s !== E.solution.qui && s !== id; });
  var pas = l.filter(function(s){ return !(L['pnj:' + s] && L['pnj:' + s].s === 1); });   /* d'abord ceux qu'il n'a pas déjà mis en vert */
  if(pas.length) l = pas;
  if(!l.length) return;
  var s = l[Math.floor(Math.random() * l.length)];
  P.potions.hydromel--; P.usages.hydromel = s;
  var al = (E.alibis && E.alibis[s]) || (nom(s) + ' n\'y est pour rien, crois-moi : je sais où ' + il(s) + ' était, et ce n\'était pas là-bas.');
  M.noter('Hydromel : ' + nom(id) + ' t\'a confié que ' + nom(s) + ' n\'y est pour rien. « ' + al + ' »', '🍯');
  UI.bd = {p:id, mode:'hydromel', m:P.moment, t:'Hic ! Il est délicieux, ton hydromel… Bon, je vais te confier un secret. ' + al};
  M.son('magie'); M.sauver(); M.render();
};

/* ---------- Après chaque rendu : le villageois parle ---------- */
function apresRendu(){
  var m = UI.modal, bd = UI.bd;
  if(!m || m.type !== 'conv') return;
  var box = document.getElementById('bd-visage'), bulle = document.getElementById('bd-texte');
  if(!box || !bulle || !bd || bd.joue) return;
  if(bd.mode === 'suite'){ bd.joue = true; jouerSuite(box, bulle, bd); return; }
  if(m.id !== bd.p) return;
  bd.joue = true;
  var t = texteDe(bd), q = questions(bd.p)[bd.i];
  if(!t) return;
  /* la réponse s'écrit dans sa boîte : on la fait voir (le moins de défilement possible, pour garder le visage) */
  try{ var bx = bulle.closest && bulle.closest('.bd-boite'); if(bx && bx.scrollIntoView) bx.scrollIntoView({block:'nearest'}); }catch(e){}
  var sc = bd.mode === 'rep' ? scenario(bd.p, t, !!(q && q.ment)) : (bd.mode === 'vrai' || bd.mode === 'exige' || bd.mode === 'potionrep' ? scenario(bd.p, t, false) : sansMimiques(t));
  jouer(box, bulle, t, sc, HUMEUR[bd.mode] || {}, function(){ if(bd.mode === 'vexe' || bd.mode === 'outre' || bd.mode === 'accuse'){ var svg = box.querySelector('svg'); if(svg && window.Persos) try{ Persos.expression(svg, HUMEUR[bd.mode]); }catch(e){} } });
}

/* Les boîtes des questions : une seule ouverte à la fois (en plus de l'attribut name, pour les navigateurs qui ne le connaissent pas) */
document.addEventListener('toggle', function(e){
  var d = e.target;
  if(!d || !d.classList || !d.classList.contains('bd-boite') || !d.open || !d.parentNode) return;
  Array.prototype.forEach.call(d.parentNode.querySelectorAll('details.bd-boite[open]'), function(x){ if(x !== d) x.open = false; });
}, true);

/* ==========================================================
   Les dépositions : tous les témoins dans la même pièce
   ========================================================== */
function ecoute(id){ return (M.E().ecoutes || []).filter(function(x){ return x.id === id; })[0]; }
function phrases(d){ return (d.phrases || [d.texte]).map(function(ph){ return typeof ph === 'string' ? {t:ph} : ph; }); }
function etatScene(id){ var P = M.P(); P.scenes = P.scenes || {}; return P.scenes[id] = P.scenes[id] || {m:{}, faux:[]}; }
function sceneFinie(id){ var P = M.P(); return !!P.vus['ecoute:' + id]; }
function sceneHTML(id){
  var x = ecoute(id); if(!x) return '';
  var P = M.P(), prm = x.params || {}, sc = typeof prm.scene === 'string' ? {texte:prm.scene, ic:'🗣️', titre:x.titre} : (prm.scene || {}), st = etatScene(id), fini = sceneFinie(id);
  var s = '<div class="bd-scene"><div class="b-feuille-tete"><span class="b-feuille-ic">' + (sc.ic || '🗣️') + '</span><div><h2>' + esc(x.titre) + '</h2><span class="doux">' + esc(sc.titre || '') + '</span></div></div>';
  var aide = (sc.texte ? sc.texte + ' ' : '') + 'Lis ce que raconte chacun. Touche une phrase pour la colorier : une fois, vert, c\'est pareil chez les autres ; deux fois, rouge, c\'est bizarre. Puis montre le menteur !';
  s += '<p class="bd-aide">' + esc(aide) + ' ' + lire(aide) + '</p>';
  s += '<div class="bd-temoins">' + (prm.depositions || []).map(function(d, w){
    var faux = st.faux.indexOf(w) >= 0;
    var tout = phrases(d).map(function(ph){ return ph.t; }).join(' ');
    return '<div class="bd-temoin' + (faux ? ' innocent' : '') + '"><div class="bd-t-tete"><span class="bd-t-img">' + M.pnjImg(d.qui) + '</span><b>' + esc(nom(d.qui)) + '</b>' + lire(tout, d.qui) + '</div><ul>' +
      phrases(d).map(function(ph, k){ var mk = st.m[w + ':' + k] || ''; return '<li><button class="bd-ph' + (mk ? ' m-' + mk : '') + '" data-act="bd-marque" data-s="' + id + '" data-w="' + w + '" data-k="' + k + '">' + esc(ph.t) + '</button></li>'; }).join('') + '</ul>' +
      (fini ? '' : faux ? '<p class="bd-t-vrai">✔ ' + esc(nom(d.qui)) + ' dit vrai</p>' : '<button class="btn petit danger bd-t-accuse" data-act="bd-dep" data-s="' + id + '" data-w="' + w + '">🤥 C\'est ' + lui(d.qui) + ' qui ment</button>') + '</div>';
  }).join('') + '</div>';
  if(fini) s += '<p class="bd-fini">' + (P.vus['ecoute:' + id] === 'rate' ? '💨 Le menteur t\'a échappé. Ce que tu as compris est dans ton Carnet.' : '✅ Tu as trouvé le menteur ! C\'est noté dans ton Carnet.') + '</p>';
  else if(st.faux.length) s += '<p class="doux petit bd-avert">⚠️ Attention : c\'est ta dernière chance.</p>';
  return s + '</div>';
}
function ouvrirScene(x){
  var P = M.P(), k = 'scene:' + x.id;
  if(sceneFinie(x.id)){ M.ouvrir({type:'conv', id:k, classe:'b-feuille-conv bd-feuille-scene'}); return; }
  if(P.conv[k] !== P.moment){ if(!M.peutAgir()) return; M.depenser(); P.conv[k] = P.moment; M.consommerBesoin(x.besoin); }
  M.son('porte'); M.sauver(); M.ouvrir({type:'conv', id:k, classe:'b-feuille-conv bd-feuille-scene'});
}
A['bd-marque'] = function(el){   /* colorier une phrase : sans redessiner la feuille (on garde la place où l'on lit) */
  var st = etatScene(el.dataset.s), k = el.dataset.w + ':' + el.dataset.k, v = st.m[k] || '';
  v = v === '' ? 'v' : v === 'v' ? 'r' : '';
  if(v) st.m[k] = v; else delete st.m[k];
  el.classList.remove('m-v', 'm-r'); if(v) el.classList.add('m-' + v);
  M.son('clic'); M.sauver();
};
function revisionScene(x, ok){
  var P = M.P(), st = etatScene(x.id), prm = x.params || {}, sc = typeof prm.scene === 'string' ? {titre:prm.scene} : (prm.scene || {});
  P.revisions = P.revisions || [];
  P.revisions.push({type:'depositions', titre:x.titre, ic:'🗣️', m:P.moment, scene:sc.titre || '', bilan:ok ? 'Tu as trouvé le menteur.' : 'Le menteur t\'a échappé.',
    depositions:(prm.depositions || []).map(function(d, w){ return {qui:d.qui, nom:nom(d.qui), phrases:phrases(d).map(function(ph, k){ return {t:ph.t, m:st.m[w + ':' + k] || ''}; })}; })});
}
A['bd-dep'] = function(el){
  var P = M.P(), x = ecoute(el.dataset.s), w = +el.dataset.w; if(!x || sceneFinie(x.id)) return;
  var d = (x.params.depositions || [])[w], st = etatScene(x.id); if(!d || st.faux.indexOf(w) >= 0) return;
  if(d.ment){
    P.vus['ecoute:' + x.id] = 1; revisionScene(x, true); M.sauver();
    M.decouvrir({ic:'🗣️', titre:x.titre, t:x.t, note:x.note, retour:'fermer'});
    return;
  }
  var n = M.echec ? M.echec('barde:ecoute:' + x.id) : 1;
  st.faux.push(w);
  if(n >= M.MAX_ESSAIS){
    P.vus['ecoute:' + x.id] = 'rate'; P.vus['ecoute2:' + x.id] = 1; revisionScene(x, false);
    if(x.noteRate) M.noter(x.noteRate, '🗣️');
    M.sauver();
    M.decouvrir({ic:'💨', titre:x.titre, t:(x.rate || 'Le menteur t\'a échappé…') + ' ' + (M.texteFerme ? M.texteFerme(x) : ''), rate:true});
    return;
  }
  P.vus['ecoute2:' + x.id] = 1;
  M.son('ko'); M.sauver(); M.render();
  M.toast('Non… ' + nom(d.qui) + ' dit la vérité. Attention, il te reste une seule chance !');
};

/* ==========================================================
   Les phrases à trous (écouter de loin) — dans le Carnet
   ========================================================== */
var TROUS_TXT = 'Ce que tu as entendu est dans ton Carnet 📒, avec des trous : remets les bons mots. Personne ne te dira si c\'est juste : à toi et à l\'équipe de juger !';
function source(cle){
  var q = cle.split(':'), E = M.E();
  if(q[0] === 'ecoute') return ecoute(q[1]);
  if(q[0] === 'oreille') return (E.bribes || []).filter(function(b){ return b.id === q[1]; })[0];
  if(q[0] === 'bonus') return (E.bonus || []).filter(function(b){ return b.id === q[1]; })[0];
  return null;
}
function contenu(src){ var c = (src && ((typeof src.trous === 'object' && src.trous) || src.params)) || {}; return {phrases:c.phrases || src.phrases || [], pieges:c.pieges || src.pieges || []}; }
function decouper(texte){
  var l = [], re = /\[([^\]]+)\]/g, m, i = 0;
  while((m = re.exec(texte))){ if(m.index > i) l.push({t:texte.slice(i, m.index)}); l.push({trou:m[1]}); i = m.index + m[0].length; }
  if(i < texte.length) l.push({t:texte.slice(i)});
  return l;
}
function analyseTrous(cle){
  var src = source(cle); if(!src) return null;
  var c = contenu(src), trous = [];
  var lignes = c.phrases.map(function(ph){ var mc = decouper(ph.texte); mc.forEach(function(x){ if(x.trou){ x.n = trous.length; trous.push(x.trou); } }); return {qui:ph.qui, morceaux:mc}; });
  var bons = trous.slice(), banque = [];
  bons.concat(c.pieges.filter(function(p){ return bons.indexOf(p) < 0; })).forEach(function(w){ if(banque.indexOf(w) < 0) banque.push(w); });
  var h = 0; for(var i = 0; i < cle.length; i++) h = (h * 31 + cle.charCodeAt(i)) % 100003;
  var r = M.alea ? M.alea(h + 17 * (M.E().id || 1)) : Math.random;
  for(var j = banque.length - 1; j > 0; j--){ var k = Math.floor(r() * (j + 1)); var t = banque[j]; banque[j] = banque[k]; banque[k] = t; }
  return {src:src, lignes:lignes, trous:trous, banque:banque};
}
function creerTrous(cle){
  var P = M.P(); P.trous = P.trous || {};
  if(P.trous[cle]) return;
  var a = analyseTrous(cle); if(!a) return;
  var o = P.trous[cle] = {poses:{}, fixes:{}, elim:{}, m:P.moment};
  if(M.modsPour('mots').mods.revele && a.trous.length > 1){ var n = Math.floor(Math.random() * a.trous.length); o.poses[n] = a.trous[n]; o.fixes[n] = 1; }   /* le Carillon : un mot retrouvé tout seul */
  /* Tendre l'oreille (talent) : il entend mieux que tout le monde, un mot de plus est déjà à sa place (et les premières lettres : trousHTML) */
  if(talent('tendre') && a.trous.length > 1){
    var libres = a.trous.map(function(m, k){ return k; }).filter(function(k){ return !o.fixes[k]; });
    if(libres.length > 1){ var n2 = libres[Math.floor(Math.random() * libres.length)]; o.poses[n2] = a.trous[n2]; o.fixes[n2] = 1; }
  }
}
B.creerTrous = creerTrous;
function tirets(mot, premiere){
  var l = Array.from(mot);
  return l.map(function(ch, i){ return ch === ' ' || ch === '-' || ch === '\'' ? ch : (premiere && i === 0 ? ch : '_'); }).join(' ');
}
function texteActuel(a, o){
  return a.lignes.map(function(l){ return (D.PNJ[l.qui] ? nom(l.qui) + ' : ' : '') + l.morceaux.map(function(x){ return x.trou ? (o.poses[x.n] || '…') : x.t; }).join(''); }).join(' ');
}
function trousHTML(cle){
  var P = M.P(), o = P.trous[cle], a = analyseTrous(cle); if(!o || !a) return '';
  var E = M.E(), premiere = (E.niveau || 1) <= 1 || talent('tendre'), ouvert = UI.trouOuvert === cle;   /* Tendre l'oreille : la première lettre de chaque mot */
  var vides = a.trous.filter(function(m, n){ return !o.poses[n]; }).length;
  var titre = a.src.titre || 'Une conversation';
  var s = '<div class="bd-trous' + (ouvert ? ' ouvert' : '') + '" id="bdt-' + cle.replace(/[^a-z0-9]/gi, '-') + '"><button type="button" class="bd-trous-tete" data-act="bd-trous-ouvre" data-k="' + cle + '">' +
    '<span>' + (cle.indexOf('bonus:') === 0 ? '🎶' : '👂') + '</span><b>' + esc(titre) + '</b><small>' + (vides ? vides + ' mot' + (vides > 1 ? 's' : '') + ' à placer' : '✍️ complet') + '</small><i>' + (ouvert ? '▴' : '▾') + '</i></button>';
  if(!ouvert) return s + '</div>';
  var choisi = UI.trouChoisi && UI.trouChoisi.k === cle ? UI.trouChoisi.n : null;
  if(choisi === null){ for(var n0 = 0; n0 < a.trous.length; n0++) if(!o.poses[n0]){ choisi = n0; break; } }
  s += '<div class="bd-trous-corps"><div class="bd-parchemin">' + a.lignes.map(function(l){
    var qui = D.PNJ[l.qui] ? '<span class="bd-tq">' + (D.PNJ[l.qui].ic || '') + ' ' + esc(nom(l.qui)) + '</span>' : '<span class="bd-tq">' + esc(l.qui || '💬') + '</span>';
    return '<p class="bd-tl">' + qui + '<span>' + l.morceaux.map(function(x){
      if(!x.trou) return esc(x.t);
      var pose = o.poses[x.n];
      return '<button type="button" class="bd-trou' + (pose ? ' plein' : '') + (o.fixes[x.n] ? ' fixe' : '') + (choisi === x.n ? ' choisi' : '') + '" data-act="bd-trou" data-k="' + cle + '" data-n="' + x.n + '">' + (pose ? esc(pose) : '<span class="bd-tirets">' + esc(tirets(x.trou, premiere)) + '</span>') + '</button>';
    }).join('') + '</span></p>';
  }).join('') + '</div>';
  var pris = {}; M.cle(o.poses).forEach(function(n){ pris[o.poses[n]] = (pris[o.poses[n]] || 0) + 1; });
  var elim = (choisi !== null && o.elim[choisi]) || [];
  s += '<p class="doux petit">' + (vides ? 'Touche un trou, puis le mot qui va dedans. Chaque trait, c\'est une lettre.' : 'Relis bien ta phrase. Personne ne te dira si c\'est juste : parles-en avec l\'équipe !') + '</p>';
  s += '<div class="bd-banque">' + a.banque.map(function(w, i){
    var p = pris[w] > 0, e = elim.indexOf(w) >= 0;
    return '<button type="button" class="bd-mot' + (p ? ' pris' : '') + (e ? ' elimine' : '') + '" data-act="bd-mot" data-k="' + cle + '" data-w="' + i + '"' + (p || e ? ' disabled' : '') + '>' + esc(w) + '</button>';
  }).join('') + '</div>';
  var ind = (M.modsPour('mots').mods.aide || 0) - ((P.usages && P.usages.indiceTrous) || 0);
  s += '<div class="b-rangee">' + lire(texteActuel(a, o)) + '<span class="doux petit">Relire ma phrase</span>' +
    (ind > 0 && choisi !== null && !o.poses[choisi] && !o.elim[choisi] ? '<button class="btn petit second" data-act="bd-indice" data-k="' + cle + '" data-n="' + choisi + '">💡 Indice (' + ind + ')</button>' : '') + '</div>';
  var bid = cle.indexOf('bonus:') === 0 ? cle.slice(6) : null;
  if(bid && P.bonus[bid] === 'encours') s += vides ? '<p class="doux petit">🎶 Quand tous les mots sont placés, chante la chanson à Margot (un seul essai).</p>' :
    '<button class="btn magie grand" data-act="bd-chanter" data-k="' + cle + '">🎶 Chanter la chanson à Margot · un seul essai</button>';
  if(bid && (P.bonus[bid] === 'ok' || P.bonus[bid] === 'ko')) s += '<p class="bd-fini">' + (P.bonus[bid] === 'ok' ? '🪙 Margot a applaudi : c\'était exactement sa chanson !' : '🎶 Margot a froncé les sourcils : ce n\'était pas tout à fait ça.') + '</p>';
  return s + '</div></div>';
}
A['bd-trous-ouvre'] = function(el){ var k = el.dataset.k; UI.trouOuvert = UI.trouOuvert === k ? null : k; UI.trouChoisi = null; M.son('page'); UI.garderDefilement = true; M.render(); };
A['bd-trou'] = function(el){
  var P = M.P(), k = el.dataset.k, n = +el.dataset.n, o = P.trous && P.trous[k]; if(!o || o.fixes[n]) return;
  if(bonusJuge(k)) return;
  if(o.poses[n]){ delete o.poses[n]; M.son('tic'); }
  UI.trouChoisi = {k:k, n:n}; M.sauver(); UI.garderDefilement = true; M.render();
};
A['bd-mot'] = function(el){
  var P = M.P(), k = el.dataset.k, o = P.trous && P.trous[k], a = analyseTrous(k); if(!o || !a || bonusJuge(k)) return;
  var w = a.banque[+el.dataset.w]; if(w === undefined) return;
  var n = UI.trouChoisi && UI.trouChoisi.k === k ? UI.trouChoisi.n : null;
  if(n === null || o.poses[n]){ n = null; for(var i = 0; i < a.trous.length; i++) if(!o.poses[i]){ n = i; break; } }
  if(n === null || o.fixes[n]) return;
  o.poses[n] = w; UI.trouChoisi = null;
  if(a.trous.every(function(m, i){ return o.poses[i]; })) P.vus['trous:' + k] = 1;   /* complète (pas forcément juste) : pour les missions, ex. {vu:'trous:ecoute:chuchotis'} */
  M.son('clic'); M.sauver(); UI.garderDefilement = true; M.render();
};
/* Indice (Luth de voyage, Carillon) : pour ce trou, la moitié des mots qui ne vont nulle part s'efface */
A['bd-indice'] = function(el){
  var P = M.P(), k = el.dataset.k, n = +el.dataset.n, o = P.trous && P.trous[k], a = analyseTrous(k); if(!o || !a) return;
  P.usages = P.usages || {};
  if((M.modsPour('mots').mods.aide || 0) <= (P.usages.indiceTrous || 0) || o.elim[n]) return;
  var faux = a.banque.filter(function(w){ return a.trous.indexOf(w) < 0; });
  for(var i = faux.length - 1; i > 0; i--){ var j = Math.floor(Math.random() * (i + 1)); var t = faux[i]; faux[i] = faux[j]; faux[j] = t; }
  o.elim[n] = faux.slice(0, Math.ceil(faux.length / 2));
  P.usages.indiceTrous = (P.usages.indiceTrous || 0) + 1;
  UI.trouChoisi = {k:k, n:n}; M.son('magie'); M.sauver(); UI.garderDefilement = true; M.render();
};
function bonusJuge(k){ var P = M.P(); return k.indexOf('bonus:') === 0 && (P.bonus[k.slice(6)] === 'ok' || P.bonus[k.slice(6)] === 'ko'); }
/* La chanson de la fête (mission bonus) : Margot connaît sa chanson, elle dit si c'est juste (une seule fois) */
A['bd-chanter'] = function(el){
  var P = M.P(), k = el.dataset.k, o = P.trous && P.trous[k], a = analyseTrous(k), id = k.slice(6), b = a && a.src;
  if(!o || !a || P.bonus[id] !== 'encours') return;
  if(a.trous.some(function(m, n){ return !o.poses[n]; })) return;
  var ok = a.trous.every(function(m, n){ return o.poses[n] === m; });
  P.bonus[id] = ok ? 'ok' : 'ko';
  if(ok){ M.S.or += b.or || 15; M.son('gain'); } else M.son('ko');
  M.sauver();
  M.ouvrir({type:'info', ic:ok ? '🪙' : '🎶', titre:ok ? 'Mission réussie : +' + (b.or || 15) + ' pièces d\'or !' : 'Mission ratée', t:ok ? 'Margot applaudit : « Bravo, c\'est exactement ma chanson ! » L\'or est dans ta bourse.' : 'Margot fronce les sourcils : « Hmm… ce n\'est pas tout à fait ça. » Dommage, cette mission ne se rejoue pas.'});
};
A['bd-carnet'] = function(el){
  var P = M.P(); if(!P) return;
  UI.modal = null; P.onglet = 'carnet'; UI.trouOuvert = el.dataset.id || UI.trouOuvert; UI.trouChoisi = null;
  M.sauver(); M.render();
  setTimeout(function(){ var e = document.querySelector('.bd-trous.ouvert'); if(e && e.scrollIntoView) e.scrollIntoView({block:'start', behavior:'smooth'}); }, 80);
};

/* ---------- Écouter en cachette (écoutes de l'enquête : pour tous les Bardes, 1 action) ---------- */
var ecouter0 = A.ecouter;
A.ecouter = function(el){
  var P = M.P(), x = ecoute(el.dataset.id);
  if(x && x.role !== 'barde') return ecouter0(el);   /* les écoutes des autres rôles (grilles du Pisteur…) : comme avant */
  if(!P || !x) return;
  if(x.mj === 'depositions'){ ouvrirScene(x); return; }
  if(P.vus['ecoute:' + x.id]){ A['bd-carnet']({dataset:{id:'ecoute:' + x.id}}); return; }
  if(!M.peutAgir()) return;
  M.depenser(); M.consommerBesoin(x.besoin); P.vus['ecoute:' + x.id] = 1;
  if(x.mimique){ P.mimiques = P.mimiques || {}; P.mimiques[x.mimique] = 'oreille'; }
  /* (Romain, 5 novembre, 14 h 15 : plus de phrase à trous ; ce qu'il entend est dit tout de suite, et noté) */
  if(x.t){ M.sauver(); M.decouvrir({ic:'👂', titre:x.titre, t:x.t, note:x.note}); return; }
  creerTrous('ecoute:' + x.id);
  M.sauver();
  M.decouvrir({ic:'👂', titre:x.titre, t:(x.entendu || 'Tu tends l\'oreille… mais tu n\'entends que des morceaux !') + ' ' + TROUS_TXT, retour:'bd-carnet', retourId:'ecoute:' + x.id});
};
/* ---------- Tendre l'oreille (talent) : gratuit, 2 fois par enquête (+ le Cornet acoustique) ---------- */
B.oreillesMax = function(){ return talent('tendre') ? M.fxSomme('oreille') : 0; };
B.oreillesReste = function(){ var P = M.P(); return Math.max(0, B.oreillesMax() - ((P && P.usages && P.usages.oreille) || 0)); };
B.bribesIci = function(lieu){
  var E = M.E(), P = M.P();
  return (E.bribes || []).filter(function(b){ return b.lieu === lieu && M.momentOk(b.moments) && !(P.trous && P.trous['oreille:' + b.id]); });
};
A['bd-oreille'] = function(el){
  var P = M.P(), E = M.E(), b = (E.bribes || []).filter(function(x){ return x.id === el.dataset.id; })[0];
  if(!P || !b || B.oreillesReste() <= 0 || (P.trous && P.trous['oreille:' + b.id])) return;
  P.usages = P.usages || {}; P.usages.oreille = (P.usages.oreille || 0) + 1;
  P.vus['barde:oreille:' + b.id] = 1;   /* pour les conditions d'une enquête (ex. : {vu:'barde:oreille:boulangerie'}) */
  creerTrous('oreille:' + b.id);
  if(b.mimique){ P.mimiques = P.mimiques || {}; P.mimiques[b.mimique] = 'oreille'; }
  M.son('pas'); M.sauver();
  M.decouvrir({ic:'👂', titre:b.titre, t:(b.intro || 'Tu entres sans bruit et tu tends l\'oreille…') + ' ' + TROUS_TXT + (b.mimique ? ' Et tu as appris un secret : ' + B.phraseMimique(b.mimique) : ''), retour:'bd-carnet', retourId:'oreille:' + b.id});
};

/* ==========================================================
   👂 Écouter aux portes (talent « Tendre l'oreille » ; Romain, 5 novembre, 12 h 31)
   Sur la carte, partout où quelqu'un se trouve (un bâtiment, une maison, dehors), tout le temps et gratuit : plus de compte par enquête,
   plus de phrase à trous. Ce qui se dit s'écrit lettre après lettre dans une bulle posée sur la carte, puis reste dans le Carnet, sur la
   page de chacun (M.dossierBarde). Une bribe de l'enquête (E.bribes : un vrai indice, un signe de menteur) passe avant les petites
   phrases de tous les jours (E.portes[pnj][moment]).
   ========================================================== */
var BATIMENTS = {taverne:1, boulangerie:1, moulin:1, mairie:1, poste:1, atelier:1, herboristerie:1, clocher:1};
function batiment(l){ return !!BATIMENTS[l] || /^[LFB]\d$/.test(l || ''); }
function bribeLignes(b){
  return (b.phrases || []).map(function(p){ return (D.PNJ[p.qui] ? nom(p.qui) : p.qui) + ' : « ' + String(p.texte || '').replace(/[\[\]]/g, '') + ' »'; }).join('\n');
}
B.porteIci = function(lieu){
  if(!talent('tendre') || !lieu) return null;
  var E = M.E(), mid = M.momentId(), l = [], pris = {};
  /* la nuit, ceux qui dorment ou ne sont pas disponibles (occupe) : plus rien à écouter derrière leur porte (Romain, 5 novembre, 21 h 46) */
  var qui = M.pnjIci(lieu).concat(M.pnjOccupesIci && mid !== 'nuit' ? M.pnjOccupesIci(lieu) : []).filter(function(id, i, a){ return a.indexOf(id) === i && id !== 'voisin' && D.PNJ[id]; });
  var b = (E.bribes || []).filter(function(x){ return x.lieu === lieu && M.momentOk(x.moments); })[0];
  if(b){
    var q0 = (b.phrases || []).map(function(p){ return p.qui; }).filter(function(q){ return D.PNJ[q]; })[0] || null;
    (b.phrases || []).forEach(function(p){ if(D.PNJ[p.qui]) pris[p.qui] = 1; });
    l.push({pnj:q0, t:(b.intro ? b.intro + '\n' : '') + bribeLignes(b), b:b.id, mimique:b.mimique || null});
  }
  qui.forEach(function(id){ var t = ((E.portes || {})[id] || {})[mid]; if(t && !pris[id]) l.push({pnj:id, t:t}); });
  if(!l.length) return null;
  return {cle:lieu + ':' + mid, l:lieu, morceaux:l};
};
B.porteBouton = function(lieu){
  if(!B.porteIci(lieu)) return '';
  return '<button class="btn bd-porte-btn" data-act="bd-porte" data-l="' + esc(lieu) + '">👂 ' + (batiment(lieu) ? 'Écouter aux portes' : 'Écouter en douce') + '</button>';
};
M.porteBouton = function(lieu){ try{ return M.role() === 'barde' ? B.porteBouton(lieu) : ''; }catch(e){ console.error(e); return ''; } };
A['bd-porte'] = function(el){
  var P = M.P(), x = B.porteIci(el.dataset.l); if(!P || !x) return;
  P.portes = P.portes || {};
  var secret = '';
  x.morceaux.forEach(function(mo){
    if(mo.pnj){ var L = P.portes[mo.pnj] = P.portes[mo.pnj] || [], k = mo.b ? 'b:' + mo.b : 'p:' + P.moment;
      if(!L.some(function(e){ return e.k === k; })) L.push({k:k, m:P.moment, t:mo.t}); }
    if(mo.b){
      P.vus['barde:oreille:' + mo.b] = 1;   /* pour les conditions d'une enquête (ex. : {vu:'barde:oreille:boulangerie'}) */
      if(mo.mimique){ P.mimiques = P.mimiques || {}; if(!P.mimiques[mo.mimique]){ P.mimiques[mo.mimique] = 'oreille'; secret = 'Tu as appris un secret : ' + B.phraseMimique(mo.mimique); } }
    }
  });
  M.son('pas'); M.sauver();
  UI.porteTape = {cle:x.cle, i:0, n:0, tape:false};
  M.ouvrir(Object.assign({type:'porte', l:x.l, cle:x.cle, morceaux:x.morceaux, rep:repliques(x.morceaux, secret), leger:true}, M.bulleDe ? M.bulleDe(el) : {}));
  taperPorte();
};
/* Les longs dialogues (Romain, 5 novembre, 15 h 34 : Margot et Victor à la taverne, la nuit, débordaient de l'écran et la bulle
   sautait d'un bout à l'autre de la carte) : la bulle montre UNE réplique à la fois — un visage, un nom, le texte qui s'écrit —
   dans une boîte de taille fixe (le texte défile dedans s'il est long). Toucher la bulle : tout le texte d'un coup, puis
   « ▶ Suite » (la réplique suivante), puis « ✔ C'est tout » (la bulle se ferme). La bulle ne bouge plus et ne grandit plus :
   n'importe quelle longueur passe. Une bribe d'enquête (E.bribes) devient une réplique par phrase ; une personne qui n'est pas
   un habitant parle avec son emoji et son nom (p.nom, sinon VOIX). Le Carnet garde tout, comme avant (P.portes). */
var VOIX = {'🧑‍🍳':'L\'apprenti', '🧔':'Un client'};
function repliques(morceaux, secret){
  var E = M.E(), l = [];
  (morceaux || []).forEach(function(mo){
    var b = mo.b && (E.bribes || []).filter(function(x){ return x.id === mo.b; })[0];
    if(b){
      if(b.intro) l.push({ic:'👂', nom:'Derrière la porte', t:b.intro});
      (b.phrases || []).forEach(function(p){
        var t = '« ' + String(p.texte || '').replace(/[\[\]]/g, '') + ' »';
        l.push(D.PNJ[p.qui] ? {pnj:p.qui, t:t} : {ic:p.qui, nom:p.nom || VOIX[p.qui] || 'Quelqu\'un', t:t});
      });
    } else l.push({pnj:mo.pnj, t:mo.t});
  });
  if(secret) l.push({ic:'🤫', nom:'Un secret', t:secret});
  return l;
}
function texteBr(t){ return esc(t).replace(/\n/g, '<br>'); }
function porteEtat(m){ var u = UI.porteTape, n = (m.rep || []).length; return u && u.cle === m.cle ? u : {i:Math.max(0, n - 1), n:1e9, tape:true}; }
function porteDedans(m){
  var R = m.rep || [], u = porteEtat(m), r = R[Math.min(u.i, R.length - 1)] || {t:''};
  var t = u.tape ? r.t : r.t.slice(0, u.n);
  var s = (r.pnj ? '<div class="b-gens-img">' + M.pnjImg(r.pnj) + '</div>' : '<span class="bd-porte-ic">' + esc(r.ic || '👂') + '</span>') +
    '<div class="bd-porte-corps"><b>' + esc(r.pnj ? nom(r.pnj) : (r.nom || '')) + '</b><p class="bd-porte-txt">' + texteBr(t) + '</p>';
  if(R.length > 1) s += '<div class="bd-porte-pied"><small>' + (u.i + 1) + ' / ' + R.length + '</small>' +
    (u.tape ? '<span class="bd-porte-suite' + (u.i + 1 < R.length ? '' : ' fin') + '">' + (u.i + 1 < R.length ? '▶ Suite' : '✔ C\'est tout') + '</span>' : '') + '</div>';
  return s + '</div>';
}
M.porteHTML = function(m){
  if(!m.rep) m.rep = repliques(m.morceaux, m.secret);   /* (une bulle d'avant cette version) */
  return '<div class="bd-porte bd-porte-un' + ((m.rep || []).length > 1 ? ' bd-porte-long' : '') + '" data-act="bd-porte-fin">' + porteDedans(m) + '</div>';
};
/* sur place, sans redessiner la bulle (elle ne bouge pas) */
function majPorte(tout){
  var m = UI.modal, box = document.querySelector('#voile .bd-porte-un'); if(!m || m.type !== 'porte' || !box) return;
  if(tout){ box.innerHTML = porteDedans(m); return; }
  var u = porteEtat(m), r = (m.rep || [])[u.i], el = box.querySelector('.bd-porte-txt'); if(!r || !el) return;
  el.innerHTML = texteBr(u.tape ? r.t : r.t.slice(0, u.n));
  el.scrollTop = el.scrollHeight;   /* le texte long défile dans sa boîte */
}
var tapeT = null;
function taperPorte(){
  clearInterval(tapeT);
  tapeT = setInterval(function(){
    var u = UI.porteTape, m = UI.modal;
    if(!u || u.tape || !m || m.type !== 'porte' || m.cle !== u.cle){ clearInterval(tapeT); return; }
    var r = (m.rep || [])[u.i]; if(!r){ clearInterval(tapeT); return; }
    u.n = Math.min(r.t.length, u.n + 1);
    if(u.n >= r.t.length){ u.tape = true; clearInterval(tapeT); majPorte(true); return; }
    majPorte(false);
  }, 30);
}
/* toucher la bulle : finir d'écrire ; sinon la réplique suivante ; à la fin, fermer */
A['bd-porte-fin'] = function(){
  var u = UI.porteTape, m = UI.modal; if(!u || !m || m.type !== 'porte' || m.cle !== u.cle) return;
  if(!u.tape){ u.tape = true; clearInterval(tapeT); majPorte(true); return; }
  if(u.i + 1 < (m.rep || []).length){ u.i++; u.n = 0; u.tape = false; majPorte(true); M.son('clic'); taperPorte(); return; }
  if((m.rep || []).length > 1) M.fermer();
};

/* ==========================================================
   La feuille d'un lieu, pour le Barde (moteur-roles.js appelle M.lieuBarde)
   ========================================================== */
function carteGens(id){
  var P = M.P(), x = D.PNJ[id], ouvert = P.conv[id] === P.moment, vexe = estVexe(id);
  /* fâché, ou « Encore toi ? » (Romain, 5 novembre, 12 h 31) : son visage et « Reviens plus tard », cerclés de rouge (son rond aussi, sur la carte) */
  var rouge = B.pastilleRouge(id); if(rouge) return rouge;
  return '<div class="b-gens-carte' + (vexe ? ' bd-vexe' : '') + '"><div class="b-gens-img">' + M.pnjImg(id) + '</div><b>' + esc(x.court) + '</b><small>' + esc(x.metier) + '</small>' +
    (vexe ? '<small class="bd-boude-mini">' + ((M.E() || {}).vexeNeutre ? '🤔 plus tard' : '😤 vexé' + (FEM[id] ? 'e' : '')) + '</small>' : '') +
    '<button class="btn petit' + (ouvert ? ' second' : '') + '" data-act="parler" data-id="' + id + '"' + (ouvert || M.peutAgir() ? '' : ' disabled') + '>' + (ouvert ? '💬 Continuer' : '💬 Parler' + M.coutTxt()) + '</button></div>';
}
M.lieuBarde = function(lieu){
  var E = M.E(), P = M.P(), s = '', gens = M.pnjIci(lieu);
  if(gens.length) s += '<p class="sur-titre">Ici en ce moment</p><div class="b-gens">' + gens.map(carteGens).join('') + '</div>';
  /* ceux qu'on voit ici sur la carte, mais trop occupés pour parler en ce moment (E.pnj[id].carte et .occupe : moteur-roles.js) */
  var occ = M.pnjOccupesIci ? M.pnjOccupesIci(lieu) : [];
  if(occ.length) s += (gens.length ? '' : '<p class="sur-titre">Ici en ce moment</p>') + '<div class="b-gens">' + occ.map(function(id){
    var t = M.texteOccupe(id);
    return '<div class="b-gens-carte bd-occupe"><div class="b-gens-img">' + M.pnjImg(id) + '</div><b>' + esc(nom(id)) + '</b><small>' + esc(t) + '</small>' + lire(t) + '</div>';
  }).join('') + '</div>';
  /* Tendre l'oreille (talent) : 👂 Écouter aux portes, partout où quelqu'un parle, tout le temps (B.porteIci) */
  s += B.porteBouton(lieu);
  /* Les écoutes et les scènes de l'enquête */
  M.ecoutesIci(lieu).forEach(function(x){
    var ok = M.besoinOk(x.besoin);
    if(x.mj === 'depositions'){
      var ouvert = P.conv['scene:' + x.id] === P.moment, deps = (x.params && x.params.depositions) || [];
      s += '<div class="b-ecoute bd-ecoute-scene"><h3>🗣️ ' + esc(x.titre) + '</h3><div class="bd-mini-gens">' + deps.map(function(d){ return '<span title="' + esc(nom(d.qui)) + '">' + M.pnjImg(d.qui) + '</span>'; }).join('') + '</div><p>' + esc(x.intro || '') + '</p>' + lire(x.intro || '') +
        (ok ? '<button class="btn grand" data-act="ecouter" data-id="' + x.id + '"' + (ouvert || M.peutAgir() ? '' : ' disabled') + '>' + (ouvert ? '🗣️ Continuer' : '🗣️ Les interroger tous ensemble' + M.coutTxt()) + '</button>' : M.besoinHTML(x.besoin, 'barde')) + '</div>';
      return;
    }
    s += '<div class="b-ecoute"><h3>👂 ' + esc(x.titre) + '</h3><p>' + esc(x.intro || '') + '</p>' + lire(x.intro || '') +
      (ok ? '<button class="btn grand" data-act="ecouter" data-id="' + x.id + '"' + (M.peutAgir() ? '' : ' disabled') + '>👂 Écouter en cachette' + M.coutTxt() + '</button>' : M.besoinHTML(x.besoin, 'barde') + (x.alt ? '<p class="doux petit">' + esc(x.alt) + '</p>' : '')) + '</div>';
  });
  /* Lancer une rumeur (talent), à la taverne */
  if(lieu === 'taverne' && talent('rumeur') && E.ou && E.ou.choix) s += rumeurLieuHTML();
  if(!s && !M.bonusIci(lieu).length) s += '<p class="doux">Il n\'y a personne ici en ce moment. ' + lire('Il n\'y a personne ici en ce moment.') + '</p>';
  return s;
};
var aq0 = M.aQuelqueChose;
M.aQuelqueChose = function(lieu){
  if(aq0(lieu)) return true;
  var P = M.P(); if(!P) return false;
  if(M.role() === 'barde') return (talent('tendre') && B.bribesIci(lieu).length > 0) || (lieu === 'taverne' && talent('rumeur') && !(P.usages && P.usages.rumeur));
  if(M.role() === 'pisteur') return rumeurActive(lieu);
  return false;
};

/* ==========================================================
   Talent « Lancer une rumeur » (avec le Pisteur)
   ========================================================== */
var GUET = {toits:'place', meules:'moulin', roue:'moulin'};
function guetLieu(c){ return (c && (c.guet || (window.Carte && Carte.LIEUX && Carte.LIEUX[c.id] ? c.id : GUET[c.id]))) || 'place'; }
function dernierMoment(){ var E = M.E(), P = M.P(); return P.moment >= E.moments.length - 1; }
function rumeurLieuHTML(){
  var P = M.P(), u = P.usages && P.usages.rumeur, E = M.E();
  if(u){ var c = E.ou.choix[u.i]; return '<div class="b-ecoute bd-rumeur"><h3>🗣️ Ta rumeur</h3><p>« Demain, les gardes fouillent ' + esc(minus(c ? c.nom : '')) + ' ! » Elle court dans tout le village. Le Pisteur guette au moment suivant.</p><button class="btn petit second" data-act="bd-code" data-c="rumeur:' + u.i + '">🔢 Revoir le code du Pisteur</button></div>'; }
  if(dernierMoment()) return '<div class="b-ecoute bd-rumeur"><h3>🗣️ Lancer une rumeur</h3><p class="doux">Trop tard : il n\'y a plus de moment après celui-ci pour guetter.</p></div>';
  return '<div class="b-ecoute bd-rumeur"><h3>🗣️ Lancer une rumeur</h3><p>Fais croire à toute la taverne que les gardes vont fouiller un lieu. Au moment suivant, le Pisteur guettera : qui va accourir ?</p>' +
    '<button class="btn grand magie" data-act="bd-rumeur" ' + (M.peutAgir() ? '' : ' disabled') + '>🗣️ Lancer une rumeur' + M.coutTxt() + '</button></div>';
}
function rumeurHTML(){
  var E = M.E();
  var t = 'Sur quel lieu lances-tu ta rumeur ? « Demain, les gardes fouillent… »';
  return '<div class="b-info-modal"><div class="b-grand-ic">🗣️</div><h2>Lancer une rumeur</h2><p>' + esc(t) + ' ' + lire(t) + '</p><div class="b-lieux-acc">' + E.ou.choix.map(function(c, i){
    return '<button class="b-lieu-acc" data-act="bd-rumeur-lieu" data-i="' + i + '"><span>' + c.ic + '</span><b>' + esc(c.nom) + '</b></button>';
  }).join('') + '</div></div>';
}
A['bd-rumeur'] = function(){
  var P = M.P(); if(!talent('rumeur') || (P.usages && P.usages.rumeur) || !M.peutAgir() || dernierMoment()) return;
  M.ouvrir({type:'conv', id:'rumeur'});
};
A['bd-rumeur-lieu'] = function(el){
  var P = M.P(), E = M.E(), i = +el.dataset.i, c = E.ou.choix[i];
  if(!c || !talent('rumeur') || (P.usages && P.usages.rumeur) || !M.peutAgir()) return;
  M.depenser(); P.usages = P.usages || {}; P.usages.rumeur = {i:i, m:P.moment};
  M.noter('Rumeur lancée à la taverne : « Demain, les gardes fouillent ' + minus(c.nom) + ' ! » Le Pisteur guette là-bas au moment suivant.', '🗣️');
  M.son('magie'); M.sauver();
  M.ouvrir({type:'code', code:'rumeur:' + i, titre:'La rumeur, pour le Pisteur', suite:'fermer', suiteTxt:'C\'est donné !'});
};
A['bd-code'] = function(el){ M.ouvrir({type:'code', code:el.dataset.c}); };
function rumeurActive(lieu){
  var P = M.P(), E = M.E(); if(!P || !P.rumeur || P.rumeur.fait || !E.ou) return false;
  return guetLieu(E.ou.choix[P.rumeur.i]) === lieu && P.moment > P.rumeur.m;
}
M.rumeurLieu = function(lieu){
  var P = M.P(), E = M.E(); if(!P || !P.rumeur || !E.ou) return '';
  var c = E.ou.choix[P.rumeur.i]; if(!c || guetLieu(c) !== lieu) return '';
  var tit = '<h3>🗣️ La rumeur du Barde</h3><p>« Demain, les gardes fouillent ' + esc(minus(c.nom)) + ' ! »</p>';
  if(P.rumeur.fait) return '<div class="b-ecoute bd-rumeur">' + tit + '<p class="doux">Tu as déjà guetté ici.</p></div>';
  if(P.moment <= P.rumeur.m) return '<div class="b-ecoute bd-rumeur">' + tit + '<p class="doux">La rumeur court dans le village… Reviens guetter ici au moment suivant !</p></div>';
  return '<div class="b-ecoute bd-rumeur">' + tit + '<button class="btn grand magie" data-act="bd-guet"' + (M.peutAgir() ? '' : ' disabled') + '>🫥 Te cacher et guetter' + M.coutTxt() + '</button></div>';
};
A['bd-guet'] = function(){
  var P = M.P(), E = M.E(); if(!P || !P.rumeur || P.rumeur.fait || !M.peutAgir() || P.moment <= P.rumeur.m) return;
  var c = E.ou.choix[P.rumeur.i], bon = c.id === E.solution.ou, l = guetLieu(c);
  M.depenser(); P.rumeur.fait = bon ? 'oui' : 'non';
  var t = bon ? 'Tu attends, bien caché… Soudain, une silhouette encapuchonnée arrive en courant ! Elle regarde partout, inquiète, puis repart à toute vitesse. La rumeur l\'a fait accourir : c\'est le bon endroit !' :
    'Tu attends longtemps, bien caché… Personne ne vient. La rumeur n\'a inquiété personne : ce n\'est pas le bon endroit.';
  var note = 'Rumeur du Barde : ' + c.nom + (bon ? ', une silhouette encapuchonnée est accourue : c\'est le bon endroit !' : ', personne n\'est venu : ce n\'est pas le bon endroit.');
  M.noter(note, '🫥');
  if(Array.isArray(P.aventure)){ P.aventure.push({m:P.moment, lieu:l, ic:'🫥', titre:'La rumeur du Barde', t:note}); }
  M.son(bon ? 'magie' : 'page'); M.sauver();
  M.decouvrir({ic:'🫥', titre:'La rumeur du Barde', t:t});
};

/* ==========================================================
   Les codes des talents : rumeur (Pisteur), plaidoirie (Sage), recette de l'Hydromel (Alchimiste)
   ========================================================== */
var nc0 = M.nomCode, de0 = M.destinataire;
M.nomCode = function(id){
  var q = String(id).split(':'), E = M.E();
  if(q[0] === 'rumeur'){ var c = E && E.ou && E.ou.choix[+q[1]]; return {ic:'🗣️', nom:'La rumeur du Barde' + (c ? ' : ' + c.nom : '')}; }
  if(q[0] === 'plaide') return {ic:'📜', nom:'La plaidoirie du Barde'};
  if(q[0] === 'recette') return {ic:'🍯', nom:'Recette : Hydromel des confidences'};
  return nc0(id);
};
M.destinataire = function(id){
  var t = String(id).split(':')[0];
  if(t === 'rumeur') return 'pisteur';
  if(t === 'plaide') return 'sage';
  if(t === 'recette') return 'alchimiste';
  return de0(id);
};
M.codeSpecial = function(t, x, id){
  if(t !== 'rumeur' && t !== 'plaide' && t !== 'recette') return false;
  var P = M.P(), E = M.E(), S = M.S;
  if(P.recus[id]){ M.ouvrir({type:'info', ic:'👍', titre:'Déjà reçu', t:'Tu as déjà ce code.'}); return true; }
  if(t === 'rumeur'){
    var c = E.ou && E.ou.choix[+x];
    if(!c){ M.ouvrir({type:'info', ic:'🤔', titre:'Ce code ne marche pas', t:'Vérifie les symboles avec le Barde.'}); return true; }
    if(P.rumeur){ M.ouvrir({type:'info', ic:'🗣️', titre:'Une seule rumeur', t:'Tu guettes déjà la rumeur du Barde.'}); return true; }
    P.recus[id] = true; P.rumeur = {i:+x, m:P.moment}; M.son('gain');
    var tx = 'Le Barde a lancé une rumeur à la taverne : « Demain, les gardes fouillent ' + minus(c.nom) + ' ! » Au moment suivant, va te cacher là-bas (' + M.nomLieu(guetLieu(c)) + ') et guette : si quelqu\'un accourt, c\'est le bon endroit !';
    M.noter(tx, '🗣️'); M.sauver();
    M.ouvrir({type:'info', ic:'🗣️', titre:'La rumeur du Barde', t:tx}); return true;
  }
  if(t === 'plaide'){
    P.recus[id] = true; M.son('gain'); M.sauver();
    M.ouvrir({type:'info', ic:'📜', titre:'La plaidoirie du Barde', t:'Le Barde plaidera pour toi : si tu accuses un innocent, il prouvera son innocence, et tu ne perdras pas de cœur. Une seule fois.'}); return true;
  }
  S.recettes = S.recettes || []; if(S.recettes.indexOf('hydromel') < 0) S.recettes.push('hydromel');
  P.recus[id] = true; M.son('gain'); M.sauver();
  var r = 'Le Barde t\'apprend la recette de l\'Hydromel des confidences : ' + D.texteEtapes('hydromel') + '. Elle est dans ton grimoire pour toute la saison. Fabrique-la au grand chaudron, puis donne-la au Barde !';
  M.noter(r, '🍯');
  M.ouvrir({type:'info', ic:'🍯', titre:'Recette : Hydromel des confidences', t:r});
  return true;
};
/* Plaidoirie (sur la tablette du Sage) : une fois, s'il accuse un innocent */
M.plaidoirie = function(m){
  var P = M.P(), E = M.E();
  if(!P || !E || !P.recus || !P.recus['plaide:1'] || (P.usages && P.usages.plaidoirie)) return false;
  var q = m && m.choix && m.choix.qui; if(!q || q === E.solution.qui) return false;
  P.usages = P.usages || {}; P.usages.plaidoirie = q;
  if(P.raye.indexOf(q) < 0) P.raye.push(q);
  M.son('magie'); M.sauver();
  M.ouvrir({type:'info', ic:'📜', titre:'Le Barde plaide !', t:'« Attendez ! » Le Barde se lève et plaide… et ' + nom(q) + ' prouve son innocence : ce n\'est pas ' + lui(q) + ' ! Tu ne perds pas de cœur. Cherchez encore !'});
  return true;
};

/* ==========================================================
   Les talents qui travaillent tout seuls : Physionomiste, Réseau d'informateurs
   ========================================================== */
function preposition(l){
  var n = M.nomLieu(l);
  if(/^[LFB]\d$/.test(l)) return null;
  if(/^Le /.test(n)) return 'au ' + n.slice(3);
  if(/^La /.test(n)) return 'à la ' + n.slice(3);
  if(/^L'/.test(n)) return 'à l\'' + n.slice(2);
  if(/^Les /.test(n)) return 'aux ' + n.slice(4);
  return 'à ' + n;
}
function majTalents(){
  var P = M.P(), E = M.E();
  if(!P || !E || !M.S || M.role() !== 'barde' || P.etape !== 'jeu' || P.resolu) return;
  var sus = [].concat(E.qui.choix || [], ((E.quoi && E.quoi.choix) || []).filter(function(c){ return c.pnj; }).map(function(c){ return c.id; }));
  if(M.fxSomme('physio') > 0 && !P.physio){
    /* jamais le coupable ni son complice : le talent ne doit pas désigner la solution (Romain veut que le coupable ne soit pas trop désigné) */
    var sol = E.solution || {}, pasSol = function(id){ return id !== sol.qui && id !== sol.quoi; };
    var men = sus.filter(function(id){ return pasSol(id) && questions(id).some(function(q){ return q.ment; }) && tic(id); });
    var l = men.length ? men : sus.filter(function(id){ return pasSol(id) && tic(id); });
    if(l.length){
      var id = l[Math.floor(Math.random() * l.length)];
      P.physio = id; P.mimiques = P.mimiques || {}; P.mimiques[id] = 'physio';
      var phy = (M.E() || {}).tics ? 'tu as deviné le signe de ' + nom(id) + ' : une étiquette pour ton tableau de liège !' : B.phraseMimique(id);   /* E.tics : les signes, seulement sur le liège */
      M.noter('Physionomiste : ' + phy, '🧐'); M.sauver();
      setTimeout(function(){ M.toast('🧐 Physionomiste : ' + phy); }, 500);
    } else P.physio = '-';
  }
  if(M.fxVrai('reseau')){
    P.reseau = P.reseau || {};
    if(P.reseau[P.moment] === undefined){
      var mid = M.momentId(), deja = M.cle(P.reseau).map(function(k){ return P.reseau[k]; });
      var ok = sus.filter(function(id){ var o = (E.pnj[id] || {}).ou || {}; return o[mid]; });
      var neufs = ok.filter(function(id){ return deja.indexOf(id) < 0; });
      if(neufs.length) ok = neufs;
      if(ok.length){
        var s = ok[Math.floor(Math.random() * ok.length)], ou = E.pnj[s].ou[mid], pr = preposition(ou);
        var t = nom(s) + (pr ? ' est ' + pr : ' est chez ' + lui(s)) + ' en ce moment.';
        P.reseau[P.moment] = s;
        M.noter('Un enfant du village t\'a glissé : « ' + t + ' »', '🧒'); M.sauver();
        setTimeout(function(){ M.toast('🧒 Psst ! ' + t); }, 700);
      } else P.reseau[P.moment] = null;
    }
  }
}

/* ==========================================================
   Le Carnet du Barde : 🎻 mes talents, 👂 ce que j'ai entendu (carnet.js appelle M.carnetBarde)
   ========================================================== */
M.carnetBarde = function(){
  var P = M.P(), E = M.E(), s = '', t = [];
  if(talent('tendre')) t.push('<li>👂 <b>Tendre l\'oreille</b> : sur la carte, touche un bâtiment où quelqu\'un se trouve, puis « Écouter aux portes ». Tout le temps, gratuit.</li>');
  var ex = M.fxSomme('verite') - ((P.usages && P.usages.verite) || 0);
  if(talent('exiger') || M.fxSomme('verite') > 0) t.push('<li>⚖️ <b>Exige la vérité</b> : encore ' + Math.max(0, ex) + ' fois, à la fin d\'un interrogatoire.</li>');
  if(M.fxVrai('charmeur')) t.push('<li>😊 <b>Charmeur</b> : personne ne se vexe.</li>');
  if(P.physio && P.physio !== '-') t.push('<li>🧐 <b>Physionomiste</b> : ' + ((M.E() || {}).tics ? 'tu as deviné le signe de ' + esc(nom(P.physio)) + ' : il est sur ton tableau de liège.' : esc(B.phraseMimique(P.physio))) + '</li>');
  if(talent('rumeur')) t.push('<li>🗣️ <b>Rumeur</b> : ' + (P.usages && P.usages.rumeur ? 'lancée.' : 'à lancer à la taverne (une fois).') + '</li>');
  if(talent('hydromel')){
    t.push('<li>🍯 <b>Hydromel</b> : ' + (P.usages && P.usages.hydromel ? 'offert.' : (P.potions.hydromel > 0 ? 'tu l\'as ! Offre-le pendant un interrogatoire.' : 'l\'Alchimiste doit le fabriquer.')) +
      ' <button class="btn petit second" data-act="bd-code" data-c="recette:hydromel">📜 La recette, pour l\'Alchimiste</button></li>');
  }
  if(talent('intuition')) t.push('<li>🔮 <b>Intuition</b> : ' + (P.usages && P.usages.intuition ? 'utilisée.' : '<button class="btn petit magie" data-act="bd-intuition">🔮 Écouter mon intuition</button>') + '</li>');
  if(talent('recoupement')){
    var R = UI.recoup;
    t.push('<li>🧩 <b>Recoupement</b> : ' + (P.usages && P.usages.recoupement ? 'utilisé.' :
      (R ? 'ouvre deux habitants ci-dessous et coche une phrase chez chacun (' + R.sel.length + '/2). ' + (R.sel.length === 2 ? '<button class="btn petit magie" data-act="bd-recoup-go">🧩 Comparer</button>' : '') + '<button class="btn petit second" data-act="bd-recoup-mode">Annuler</button>' :
        '<button class="btn petit magie" data-act="bd-recoup-mode">🧩 Comparer deux phrases</button>')) + '</li>');
  }
  if(M.fxVrai('reseau')) t.push('<li>🧒 <b>Réseau d\'informateurs</b> : un enfant te parle à chaque moment.</li>');
  if(talent('plaidoirie')) t.push('<li>📜 <b>Plaidoirie</b> : <button class="btn petit second" data-act="bd-code" data-c="plaide:1">📜 Le code, pour le Sage</button></li>');
  /* le rassemblement de l'enquête 2 : où il en est, et son code s'il est fait */
  var Ra = E.rassemblement;
  if(Ra) t.push('<li>📣 <b>' + esc(Ra.titre || 'Le rassemblement') + '</b> : ' + (P.vus.rassemblement ? 'fait ! ' + (Ra.code ? '<button class="btn petit second" data-act="bd-code" data-c="' + Ra.code + '">🔢 Le code, pour l\'équipe</button>' : '') :
    convaincus().length + ' villageois sur ' + (Ra.n || 3) + ' prêts à venir au Vieux Chêne.') + '</li>');
  if(t.length) s += '<section class="bd-talents"><h3>🎻 Mes talents</h3><ul>' + t.join('') + '</ul></section>';
  var cles = M.cle(P.trous || {});
  if(cles.length){
    var aide = 'Remets les mots qui manquent. Personne ne te dira si c\'est juste : à toi et à l\'équipe de juger !';
    s += '<section class="bd-entendu"><h3>👂 Ce que j\'ai entendu</h3><p class="doux petit">' + esc(aide) + ' ' + lire(aide) + '</p>' + cles.map(trousHTML).join('') + '</section>';
  }
  return s;
};
/* Ce qui reste dans le Carnet du Barde (Romain, 5 novembre, 14 h 15 : ses missions et les habitants) : la chanson d'une mission bonus
   en cours (la phrase à trous de la fête, enquête 1), sinon elle ne se jouerait nulle part */
M.trousBonusBarde = function(){
  var P = M.P(); if(!P) return '';
  var cles = M.cle(P.trous || {}).filter(function(k){ return k.indexOf('bonus:') === 0; });
  return cles.length ? '<section class="bd-entendu">' + cles.map(trousHTML).join('') + '</section>' : '';
};
M.repBarde = function(id, i, q){
  var P = M.P(), s = '';
  if(P.vus['intuition:' + id + ':' + i] && !P.vus['verite:' + id + ':' + i]) s += '<p class="bd-intu">🔮 Ton intuition : c\'est un mensonge !</p>';
  if(UI.recoup && talent('recoupement') && !(P.usages && P.usages.recoupement)){
    var k = id + ':' + i, on = UI.recoup.sel.indexOf(k) >= 0;
    s += '<button class="btn petit' + (on ? ' magie' : ' second') + ' bd-rc" data-act="bd-recoup" data-k="' + k + '">' + (on ? '☑' : '☐') + ' Comparer cette phrase</button>';
  }
  return s;
};
M.dossierBarde = function(id){
  var l = [], P = M.P();
  /* 👂 ce qu'il a dit derrière sa porte (A['bd-porte']) */
  ((P.portes || {})[id] || []).forEach(function(e){
    var mo = D.MOMENTS[(M.E().moments || [])[e.m]] || {ic:'👂', nom:''};
    l.push('<li class="cn-rep bd-cn-porte"><div><p class="cn-q">👂 Entendu aux portes · ' + mo.ic + ' ' + esc(mo.nom) + '</p><p class="cn-a">' + esc(e.t).replace(/\n/g, '<br>') + '</p></div>' + M.lireBtn(e.t, id) + '</li>');
  });
  /* dès l'enquête 2 (E.tics) : les signes ne sont que sur le tableau de liège (Romain, 22 h 46) ; le Carnet y renvoie sans les dire */
  var Et = M.E() || {};
  if(B.mimiques()[id]) l.push(Et.tics ? '<li class="cn-info bd-cn-secret"><div><p class="cn-de">📌 Son signe de menteur</p><p>Tu le connais : il est sur ton tableau de liège.</p></div></li>' :
    '<li class="cn-info bd-cn-secret"><div><p class="cn-de">🤫 Son secret de menteur</p><p>' + esc(B.phraseMimique(id)) + '</p></div>' + M.lireBtn(B.phraseMimique(id), id) + '</li>');
  if(estVexe(id)) l.push((M.E() || {}).vexeNeutre ? '<li class="cn-note"><span class="cn-nic">🤔</span><p>' + esc(nom(id)) + ' n\'a plus rien à te dire pour ce moment : reviens plus tard.</p></li>' :
    '<li class="cn-note"><span class="cn-nic">😤</span><p>' + esc(nom(id)) + ' est vexé' + (FEM[id] ? 'e' : '') + ' : reviens plus tard.</p></li>');
  return l;
};
A['bd-intuition'] = function(){
  var P = M.P(), E = M.E(); if(!talent('intuition') || (P.usages && P.usages.intuition)) return;
  var l = [];
  M.cle(E.pnj || {}).forEach(function(id){ questions(id).forEach(function(q, i){ if(mentNonVu(id, i) && !P.vus['intuition:' + id + ':' + i]) l.push([id, i]); }); });
  P.usages = P.usages || {}; P.usages.intuition = 1;
  if(!l.length){ M.sauver(); M.son('page'); M.ouvrir({type:'info', ic:'🔮', titre:'Ton intuition', t:'Plus aucun mensonge dans tes interrogatoires… pour l\'instant !'}); return; }
  var c = l[Math.floor(Math.random() * l.length)], q = questions(c[0])[c[1]];
  P.vus['intuition:' + c[0] + ':' + c[1]] = 1;
  var t = nom(c[0]) + ' t\'a menti quand ' + il(c[0]) + ' a dit : « ' + q.a + ' »';
  M.noter('Intuition : ' + t, '🔮'); M.son('magie'); M.sauver();
  M.ouvrir({type:'info', ic:'🔮', titre:'Ton intuition te souffle…', t:t + ' Va ' + (FEM[c[0]] ? 'la' : 'le') + ' démasquer !'});
};
A['bd-recoup-mode'] = function(){ UI.recoup = UI.recoup ? null : {sel:[]}; M.son('clic'); UI.garderDefilement = true; M.render(); };
A['bd-recoup'] = function(el){
  var R = UI.recoup; if(!R) return;
  var k = el.dataset.k, j = R.sel.indexOf(k);
  if(j >= 0) R.sel.splice(j, 1);
  else {
    if(R.sel.length >= 2){ M.toast('Deux phrases seulement !'); return; }
    if(R.sel.length && R.sel[0].split(':')[0] === k.split(':')[0]){ M.toast('Choisis une phrase chez un autre habitant.'); return; }
    R.sel.push(k);
  }
  M.son('clic'); UI.garderDefilement = true; M.render();
};
A['bd-recoup-go'] = function(){
  var P = M.P(), R = UI.recoup; if(!R || R.sel.length !== 2 || (P.usages && P.usages.recoupement)) return;
  var qs = R.sel.map(function(k){ var p = k.split(':'); return {id:p[0], q:questions(p[0])[+p[1]]}; });
  var faux = qs.some(function(x){ return x.q && x.q.ment; });
  P.usages = P.usages || {}; P.usages.recoupement = 1; UI.recoup = null;
  var t = '« ' + qs[0].q.a + ' » (' + nom(qs[0].id) + ') et « ' + qs[1].q.a + ' » (' + nom(qs[1].id) + ') : ' +
    (faux ? 'elles ne peuvent pas être vraies toutes les deux. L\'une des deux est forcément un mensonge !' : 'ces deux phrases peuvent être vraies toutes les deux.');
  M.noter('Recoupement : ' + t, '🧩'); M.son('magie'); M.sauver();
  M.ouvrir({type:'info', ic:'🧩', titre:'Recoupement', t:t});
};

/* ==========================================================
   Missions bonus du Barde : la chanson (phrase à trous), le concours de menteurs (dans la conversation)
   ========================================================== */
var bonus0 = A.bonus;
A.bonus = function(el){
  var P = M.P(), E = M.E(), b = (E.bonus || []).filter(function(x){ return x.id === el.dataset.id; })[0];
  if(b && b.role === 'barde' && b.trous){
    if(!M.peutAgir() || P.bonus[b.id]) return;
    M.depenser(); P.bonus[b.id] = 'encours'; creerTrous('bonus:' + b.id); M.sauver();
    M.decouvrir({ic:'🎶', titre:b.titre, t:(b.entendu || b.t) + ' ' + TROUS_TXT.replace('Personne ne te dira si c\'est juste : à toi et à l\'équipe de juger !', 'Quand tout est placé, chante-la à Margot : un seul essai !'), retour:'bd-carnet', retourId:'bonus:' + b.id});
    return;
  }
  if(b && b.role === 'barde' && b.repliques){
    if(P.bonus[b.id] === 'ok' || P.bonus[b.id] === 'ko') return;
    if(P.bonus[b.id] !== 'encours'){ if(!M.peutAgir()) return; M.depenser(); P.bonus[b.id] = 'encours'; }
    UI.bd = {p:'bonus:' + b.id, mode:'attente', joue:true}; M.sauver();
    M.ouvrir({type:'conv', id:'bonus:' + b.id, classe:'b-feuille-conv'});
    return;
  }
  return bonus0(el);
};
var bi0 = M.bonusIci;
function bonusConv(id){ return (M.E().bonus || []).filter(function(x){ return x.id === id; })[0]; }
function bonusConvHTML(id){
  var P = M.P(), b = bonusConv(id); if(!b) return '';
  var pnj = b.pnj || 'margot', st = (P.bonusConv = P.bonusConv || {})[id] = (P.bonusConv[id] || {vu:0});
  var juge = P.bonus[id] === 'ok' || P.bonus[id] === 'ko';
  var t0 = b.t || '';
  var s = '<div class="bd-conv"><div class="bd-tete"><div class="bd-visage" id="bd-visage">' + visage(pnj) + '</div><div class="bd-nom"><h2>' + esc(b.titre) + '</h2><span class="doux">' + esc(nom(pnj)) + '</span></div>' +
    '<div class="bd-bulle"><p id="bd-texte">' + (UI.bd && UI.bd.p === 'bonus:' + id && UI.bd.mode === 'suite' && !UI.bd.joue ? '' : esc(t0)) + '</p>' + lire(t0, pnj) + '</div></div>';
  if(juge) return s + '<p class="bd-fini">' + (P.bonus[id] === 'ok' ? '🪙 Bien vu ! Tu as gagné ' + b.or + ' pièces d\'or.' : '💨 Raté… Cette mission ne se rejoue pas.') + '</p></div>';
  s += '<p class="bd-aide">Regarde bien son visage : une de ses histoires est un mensonge. Laquelle ? Un seul essai !</p>';
  if(st.vu < 2) s += '<button class="btn grand" data-act="bd-menteurs-joue" data-id="' + id + '">' + (st.vu ? '🔁 Encore une fois' : '▶ Écouter ses histoires') + '</button>';
  if(st.vu) s += '<div class="bd-questions">' + b.repliques.map(function(r, k){
    return '<div class="b-question repondue"><p class="b-reponse">« ' + esc(r.texte) + ' »</p><div class="bd-rep-outils">' + lire(r.texte, pnj) + '<button class="btn petit bd-ment-p" data-act="bd-menteurs" data-id="' + id + '" data-k="' + k + '">🤥 C\'est celle-là !</button></div></div>';
  }).join('') + '</div>';
  return s + signesHTML() + '</div>';
}
A['bd-menteurs-joue'] = function(el){
  var P = M.P(), id = el.dataset.id, st = (P.bonusConv = P.bonusConv || {})[id] = (P.bonusConv[id] || {vu:0});
  if(st.vu >= 2) return;
  UI.bd = {p:'bonus:' + id, mode:'suite', id:id}; M.son('clic'); M.render();
};
function jouerSuite(box, bulle, bd){
  var b = bonusConv(bd.id), P = M.P(); if(!b) return;
  var pnj = b.pnj || 'margot', k = 0;
  function suivante(){
    if(k >= b.repliques.length){ var st = P.bonusConv[bd.id]; st.vu = (st.vu || 0) + 1; M.sauver(); UI.bd = {p:'bonus:' + bd.id, mode:'attente', joue:true}; M.render(); return; }
    var r = b.repliques[k++];
    jouer(box, bulle, r.texte, scenario(pnj, r.texte, !!r.ment), {}, function(){ anim = {t:[setTimeout(suivante, 900)], i:[]}; });
  }
  suivante();
}
A['bd-menteurs'] = function(el){
  var P = M.P(), b = bonusConv(el.dataset.id); if(!b || P.bonus[b.id] !== 'encours') return;
  var r = b.repliques[+el.dataset.k], ok = !!(r && r.ment);
  P.bonus[b.id] = ok ? 'ok' : 'ko';
  if(ok){ M.S.or += b.or || 15; M.son('gain'); } else M.son('ko');
  M.sauver();
  M.ouvrir({type:'info', ic:ok ? '🪙' : '💨', titre:ok ? 'Mission réussie : +' + b.or + ' pièces d\'or !' : 'Mission ratée', t:ok ? 'Bien vu ! C\'était bien la blague de ' + nom(b.pnj || 'margot') + '. L\'or est dans ta bourse.' : 'Dommage… Ce n\'était pas celle-là. Cette mission ne se rejoue pas.'});
};

/* ==========================================================
   Les vieilles sauvegardes : les anciens talents du Barde deviennent ceux du même niveau
   ========================================================== */
var ANCIENS = {conteur:'exiger', ombre:'tendre', oreille:'physio', ami:'charmeur', apaisante:'hydromel', ragots:'rumeur', imitation:'intuition', memoire:'recoupement', ballade:'plaidoirie'};
function migrer(s){
  if(s && Array.isArray(s.talents)){
    var l = [];
    s.talents.forEach(function(id){ var n = ANCIENS[id] || id; if(l.indexOf(n) < 0) l.push(n); });
    s.talents = l;
  }
  return s;
}
B.migrer = migrer;
var ch0 = M.charger;
M.charger = function(){ return migrer(ch0.apply(this, arguments)); };
var ls0 = M.lireSauvegarde;
M.lireSauvegarde = function(texte){
  try{
    var o = JSON.parse(String(texte || '').replace(/^﻿/, ''));
    if(o && o.etat) migrer(o.etat); else migrer(o);
    return ls0(JSON.stringify(o));
  }catch(e){ return ls0(texte); }
};
if(M.S) migrer(M.S);

/* Le dessin des nouveaux talents sur le héros : ceux des anciens qui leur ressemblent (persos.js) */
var VISU = {tendre:'oreille', exiger:'conteur', charmeur:'ami', physio:'imitation', rumeur:'ragots', hydromel:'apaisante', intuition:'memoire', recoupement:'memoire', plaidoirie:'ballade'};
if(window.Persos && Persos.heros){
  var h0 = Persos.heros;
  Persos.heros = function(h, o){
    try{
      if(h && Array.isArray(h.talents) && h.talents.some(function(id){ return VISU[id]; }))
        h = Object.assign({}, h, {talents:h.talents.concat(h.talents.map(function(id){ return VISU[id]; }).filter(Boolean))});
    }catch(e){}
    return h0.call(this, h, o);
  };
}

/* ---------- La conversation ouverte (une seule visite par moment, E.uneVisite) : ouverte jusqu'à ce qu'on la ferme ;
   une découverte qui y revient (« D'accord » → la conversation) en fait partie ---------- */
var ouvrir0 = M.ouvrir, fermer0 = M.fermer;
M.ouvrir = function(m){
  if(m && m.type === 'conv' && D.PNJ[m.id]) UI.convOuverte = UI.bd && UI.bd.p === m.id && UI.bd.mode === 'encore' ? null : m.id;
  else if(!(m && m.type === 'decouverte' && m.retour === 'parler' && m.retourId === UI.convOuverte)) UI.convOuverte = null;
  return ouvrir0.apply(this, arguments);
};
M.fermer = function(){ UI.convOuverte = null; return fermer0.apply(this, arguments); };

/* ---------- Chaque rendu : arrêter la parole en cours, mettre les talents à jour, puis faire parler ---------- */
var r0 = M.render;
M.render = function(){
  stopAnim();
  try{ majTalents(); }catch(e){ console.error(e); }
  var r = r0.apply(this, arguments);
  try{ apresRendu(); }catch(e){ console.error(e); }
  return r;
};
})();
