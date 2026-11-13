/* ==========================================================
   Brumeval — le tutoriel de l'enquête 1, en « pilote automatique » (Romain, 4 novembre, DESIGN 12.2 et 12.7),
   et le talent du niveau 2 à choisir au début de l'enquête 2.

   Un seul mécanisme, générique :
   1. Les étapes : E.etapes[rôle] (e1.js, les missions de mission.js). L'étape en cours = la première pas encore faite.
      Son état : 'faire', 'attend' (le code d'un équipier : le message nomme toujours qui le donne), 'moment' (prévue pour un moment suivant :
      « Tu as tout fait pour ce matin »), 'action' (plus d'action pour ce moment ; jamais dans une enquête sans points d'action, E.sansActions),
      ou 'fini' (toute la trame est faite). Les missions bonus ne sont proposées que pendant une attente ('attend', 'moment', 'fini').
   2. Le chemin : pour l'étape en cours, la liste des choses à toucher, dans l'ordre
      (ex. Pisteur : onglet Carte → la mairie sur la carte → « Explorer » → le massif de fleurs).
      On regarde jusqu'où le joueur est déjà allé (onglet ouvert, fenêtre ouverte, page du livre…) :
      la chose suivante est LA cible. Pour corriger le trajet, il suffit de changer pasEtape() ou les étapes de e1.js.
   3. La cible a un rond lumineux (doré, qui pulse, « 👆 Ici ! ») ; le bandeau du haut dit en une phrase courte (avec 🔊)
      ce qu'il faut faire et pourquoi ; tout ce qui n'est pas la cible est grisé et refuse le toucher
      (« Pas maintenant ! … »). Restent toujours possibles : 🔊, ✕, le menu ☰, le Carnet (lire), le Code (taper les
      codes que donnent les équipiers), les cases du tableau d'enquête du Sage, tourner les pages du Grand Livre.
      Le choix final de l'accusation n'a jamais de rond (on ne montre pas la réponse).
   4. La carte (carte-jeu.js lit M.tutoCarte) : un seul lieu ouvert, celui de l'étape en cours ; ce qui est déjà vu
      reste dessiné, grisé ; un lieu qui attend un code a son cadenas.
   5. Les fiches des lieux : seulement le bon habitant (Barde), le bon point (Pisteur, Sage), pas de cueillette
      ailleurs qu'à la lisière (Alchimiste), et les missions bonus seulement pendant une attente (sans points d'action, l'enquête 1)
      ou quand la trame laisse une action libre (une enquête avec actions).
   6. L'atelier (un autre module) : si Atelier.guider(cible) existe, on lui donne la cible
      ('carton', 'cueillette', 'grimoire', 'chaudron', 'potions', 'analyses', ou null) ; sinon on entoure nous-mêmes
      ce qu'on reconnaît dans la pièce (cartons, tas de la cueillette, grimoire, chaudron, flacons, table d'analyse).
   Enquête 2 : tant que le talent du niveau 2 n'est pas choisi, tout est bloqué ; rond sur le portrait du bandeau,
   puis sur 🌳 (l'arbre des talents), puis sur les deux talents du niveau 2 (sans en conseiller un).
   Chargé EN DERNIER (après heros.js) : il enveloppe M.render, des actions de M.A, M.pnjIci, M.bonusIci, M.feuilleLieu.
   ========================================================== */
(function(){
'use strict';
var M = window.M, D = window.DONNEES;
if(!M || !M.UI || !M.A) return;
var UI = M.UI, A = M.A;
function esc(s){ return M.esc(s); }
var AU = {matin:'le matin', apresmidi:'l\'après-midi', soir:'le soir', nuit:'la nuit'};
var DU = {matin:'du matin', apresmidi:'de l\'après-midi', soir:'du soir', nuit:'de la nuit'};
var A_LA = {matin:'au matin', apresmidi:'à l\'après-midi', soir:'au soir', nuit:'à la nuit'};
var MOM_IC = {matin:'🌅', apresmidi:'☀️', soir:'🌙', nuit:'🌌'};

/* ==========================================================
   1. L'état : l'étape en cours et ce qu'elle attend
   ========================================================== */
function enJeu(){
  try{ var P = M.S && M.S.e, E = P ? M.E() : null; return E && P.etape === 'jeu' && !P.defaite && !P.resolu ? E : null; }catch(e){ return null; }
}
function actif(){ if(window.BRUMEVAL_SANS_TUTO) return false; var E = enJeu(); return !!(E && E.tuto); }   /* BRUMEVAL_SANS_TUTO : les bancs d'essai d'autres systèmes (cœurs, transitions…) jouent l'enquête 1 librement */
M.tutoActif = actif;
function etapes(){ return M.etapesMission ? M.etapesMission() : []; }
function faite(e, i){
  if(!e || e.libre || e.piste) return false;
  var Mi = M.P().mission || {};
  if((Mi.faits || {})[i] || (Mi.coches || {})[i]) return true;
  if(e.manuel) return !!(Mi.manuels || {})[i];
  return (e.fait || []).some(function(b){ try{ return M.condMission(b); }catch(er){ return false; } });
}
function momentN(){ return M.P().moment || 0; }
function estMaison(id){ return /^[LFB]\d$/.test(id || ''); }
/* Où se passe l'étape : le lieu donné, ou là où est l'habitant à ce moment (Barde) */
function lieuxDe(e){
  if(e.pnj){ var E = M.E(), N = E.pnj && E.pnj[e.pnj], l = N && N.ou && N.ou[M.momentId()]; return l ? [l] : []; }
  return e.lieu ? [].concat(e.lieu) : [];
}
function attend(e){ return !!(e.attend && e.attend.length && !e.attend.some(M.uneCondition)); }
function plusTard(e){ return !!(e.action || e.manuel || e.livre) && (e.m || 0) > momentN(); }   /* une étape qui coûte une action, à cocher, ou une page du Grand Livre attend son moment */
function dejaPaye(e){
  var P = M.P();
  if(e.pnj) return P.conv[e.pnj] === P.moment;
  if(e.points) return lieuxDe(e).some(function(l){ return P.vus['explore:' + l] === P.moment; });
  return false;
}
function coute(e){ return !!e.action && !dejaPaye(e); }
function courante(){
  var L = etapes();
  for(var i = 0; i < L.length; i++){ var e = L[i]; if(!e.libre && !e.piste && !faite(e, i)) return {i:i, e:e}; }
  return null;
}
/* Ce que la trame demande encore comme actions pour ce moment (un lieu exploré ou un habitant compte une fois) */
function besoinMoment(){
  var vus = {}, n = 0;
  etapes().forEach(function(e, i){
    if(e.libre || e.piste || faite(e, i) || plusTard(e) || !coute(e)) return;
    var k = e.pnj ? 'p:' + e.pnj : e.points ? 'l:' + lieuxDe(e).join() : 'i:' + i;
    if(!vus[k]){ vus[k] = 1; n++; }
  });
  return n;
}
function bonusDispo(){
  var E = M.E(), P = M.P(), role = M.role();
  return (E.bonus || []).filter(function(b){ return b.role === role && M.momentOk(b.moments) && !P.bonus[b.id]; });
}
/* Une mission bonus est proposée seulement là où la trame laisse une action libre : pendant une attente,
   ou quand les étapes du moment sont faites, et s'il reste plus d'actions que la trame n'en demande encore */
function bonusOfferts(etat, e){
  /* sans points d'action (l'enquête 1) : pas de budget ; seulement pendant une attente, et une seule fois chacune (P.bonus) */
  if(M.sansActions()) return etat === 'attend' || etat === 'moment' || etat === 'fini' ? bonusDispo() : [];
  var P = M.P(); if(P.actions <= 0) return [];
  if(etat === 'faire' && e && !e.manuel) return [];   /* une étape en cours (un lieu ouvert, une fenêtre) : d'abord la finir */
  var l = bonusDispo(); if(!l.length || P.actions <= besoinMoment()) return [];
  if(etat === 'attend' || etat === 'moment' || etat === 'fini') return l;
  var reste = etapes().some(function(e, i){ return !e.libre && !e.piste && !faite(e, i) && !plusTard(e) && coute(e); });
  return reste ? [] : l;
}
/* Le Sage peut passer au moment suivant : ses étapes prévues jusqu'ici sont faites (ou attendent un code) */
function sagePeutPasser(){
  var m = momentN();
  return etapes().every(function(e, i){ return e.libre || e.piste || faite(e, i) || (e.m || 0) > m || attend(e); });
}
/* Qui donne ce code ? (les messages d'attente nomment toujours le rôle, jamais « un équipier ») */
var ORDRE = ['pisteur', 'alchimiste', 'barde', 'sage'];
var IL = {pisteur:'il', alchimiste:'elle', barde:'il', sage:'il'};   /* comme les textes de e1.js */
function donneurs(code){
  var E = M.E(), r = {}, t = String(code).split(':')[0];
  function vise(x){ return !!x && ((x.obj && 'obj:' + x.obj === code) || x.donne === code); }
  M.cle(E.lieux || {}).forEach(function(l){ ORDRE.forEach(function(role){ (((E.lieux[l] || {})[role] || {}).points || []).forEach(function(p){ if(vise(p)) r[role] = 1; }); }); });
  M.cle(E.pnj || {}).forEach(function(id){ (E.pnj[id].questions || []).forEach(function(q){ if(vise(q)) r.barde = 1; }); });
  M.cle(E.analyses || {}).forEach(function(id){ if(E.analyses[id].donne === code) r.alchimiste = 1; });
  (E.pages || []).forEach(function(p){ if(p.donne === code) r.sage = 1; });
  if(t === 'pot') r.alchimiste = 1;
  if(t === 'moment' || t === 'victoire') r.sage = 1;
  delete r[M.role()];
  return ORDRE.filter(function(k){ return r[k]; });
}
function quiDonne(e){
  var l = [];
  ((e && e.attend) || []).forEach(function(b){ if(b.code) donneurs(b.code).forEach(function(r){ if(l.indexOf(r) < 0) l.push(r); }); });
  return l;
}
function nomsDe(l){ var n = l.map(function(r){ return D.ROLES[r].le; }); return n.length > 1 ? n.slice(0, -1).join(', ') + ' ou ' + n[n.length - 1] : n[0] || ''; }
/* « ⏳ Attends le Pisteur : il va te donner un code. Tape-le dans 🔢 Code. » (si l'étape n'a pas son propre attendT) */
function attenteTexte(e){
  if(e && e.attendT) return e.attendT;
  var l = quiDonne(e);
  if(!l.length) return 'Ton équipe cherche encore… Un indice va bientôt arriver !';
  return 'Attends ' + nomsDe(l) + ' : un indice va bientôt arriver !';
}
var CE = {matin:'ce matin', apresmidi:'cet après-midi', soir:'ce soir', nuit:'cette nuit'};
/* la fin d'un moment, racontée (Romain, 5 novembre, 23 h 32 : « quelle matinée ! », un peu d'humour : le Sage est long) */
var FIN_MOMENT = {matin:'Quelle matinée !', apresmidi:'Le soleil se couche sur Brumeval…', soir:'La nuit est tombée…'};
var SAGE_LENT = {matin:'… dès qu\'il aura fini de lisser sa barbe.', apresmidi:'… s\'il retrouve ses lunettes.', soir:'.'};
M.tutoEtat = function(){
  if(!actif()) return null;
  var c = courante(), P = M.P(), E = M.E(), r;
  if(!c) r = {etat:'fini'};
  else {
    r = {i:c.i, e:c.e};
    if(plusTard(c.e)) r.etat = 'moment';
    else if(attend(c.e)) r.etat = 'attend';
    else if(coute(c.e) && !M.peutAgir()) r.etat = 'action';
    else r.etat = 'faire';
  }
  r.bonus = bonusOfferts(r.etat, r.e);
  r.dernier = momentN() >= E.moments.length - 1;
  return r;
};

/* ==========================================================
   2. La carte : un seul lieu ouvert (lu par carte-jeu.js)
   {visibles, ouverts, verrous, maisons, ici, marqueurs} ; null = toute la carte, libre (trame finie, ou pas de tutoriel)
   ========================================================== */
M.tutoCarte = function(){
  if(!actif()) return null;
  var T = M.tutoEtat(); if(T.etat === 'fini' && !T.bonus.length) return null;   /* trame finie : toute la carte (sauf une mission bonus à faire avant) */
  var P = M.P(), vu = P.carteVue || {}, ouverts = [], verrous = [], maisons = [], mq = [];
  if(T.e){
    var e = T.e, ls = lieuxDe(e);
    if(T.etat === 'faire' && !e.livre && !e.atelier) ls.forEach(function(l){ (estMaison(l) ? maisons : ouverts).push(l); });
    else if(T.etat === 'attend') ls.forEach(function(l){ if(!estMaison(l)) verrous.push(l); });
    if(e.pnj && ls[0] && !estMaison(ls[0]) && (T.etat === 'faire' || T.etat === 'attend') && D.PNJ[e.pnj])
      mq.push({lieu:ls[0], ic:D.PNJ[e.pnj].ic, label:D.PNJ[e.pnj].court, act:'lieu', id:ls[0], classe:'pnj'});
  }
  T.bonus.forEach(function(b){
    if(ouverts.indexOf(b.lieu) < 0) ouverts.push(b.lieu);
    mq.push({lieu:b.lieu, ic:M.icBonus ? M.icBonus(b) : '✨', label:'Mission bonus', act:'lieu', id:b.lieu, classe:'bonus'});
  });
  var vis = {};
  M.cle(vu).forEach(function(id){ if(id !== '*') vis[id] = 1; });
  etapes().forEach(function(x, i){ if(x.lieu && !x.pnj && faite(x, i)) [].concat(x.lieu).forEach(function(id){ if(!estMaison(id)) vis[id] = 1; }); });   /* (une vieille sauvegarde sans P.carteVue) */
  ouverts.concat(verrous, maisons).forEach(function(id){ vis[id] = 1; });
  return {visibles:M.cle(vis), ouverts:ouverts, verrous:verrous, maisons:maisons, ici:ouverts[0] || maisons[0] || verrous[0] || null, marqueurs:mq};
};

/* ==========================================================
   3. Le chemin des clics, et la cible
   ========================================================== */
var OC = {k:'onglet', o:'carte'};
function premierPoint(e, l){
  var P = M.P(), role = M.role();
  var p = (e.points || []).filter(function(id){ var k = role + ':' + l + ':' + id; return P.vus[k] !== 'ok' && !(M.ferme && M.ferme(k)); })[0];
  return p || (e.points || [])[0];
}
/* La cible dans l'atelier (les noms de Atelier.guider) : 'carton', 'cueillette', 'rangement', 'grimoire', 'chaudron', 'potion', 'paillasse' ;
   'bouton' = le bouton du moteur dans le panneau ouvert (« Analyser », « Donner ») : c'est tuto.js qui l'entoure.
   L'atelier dit quand une cible est faite (CustomEvent 'atelier:guide-fait') : UI.tutoAt garde ce qui vient d'être fait. */
function boutonAtelier(e){
  var sel = e.objet ? '[data-act=analyser][data-id="' + e.objet + '"]' : '[data-act=donner-potion][data-id=revelatrice]';
  return premier(['#atelier-ici ' + sel, sel]);
}
function cibleAtelier(e){
  var S = M.S, at = S.atelier || {}, fait = UI.tutoAt || {};
  if(e.atelier === 'analyse') return boutonAtelier(e) ? 'bouton' : 'paillasse';
  /* (Romain, 10 novembre : d'abord le grimoire, où le Sage dicte la recette ; ensuite la cueillette, puis le chaudron) */
  if(e.atelier === 'grimoire') return 'grimoire';
  if(e.atelier === 'encre'){
    if((S.potions.revelatrice || 0) > 0) return boutonAtelier(e) ? 'bouton' : 'potion';
    /* les ingrédients voyagent jusqu'à leurs rangements, puis « Tout est rangé ! » : rien ne brille pendant ce temps (Romain, 15 h 58) */
    if(window.Atelier && Atelier.rangeEnCours && Atelier.rangeEnCours()) return 'regarde';   /* (ou « La recette est complète ! » : Atelier.attenteDit) */
    var pan = at.panier || {};
    if(M.cle(pan).some(function(k){ return pan[k] > 0 && /^(baies|eau|miel)$/.test(k); })) return fait.cueillette ? 'rangement' : 'cueillette';   /* toucher un ingrédient devant la porte, puis le ranger */
    if(q('#atelier-ici .at-grim:not([hidden]) .at-livre-ch')) return 'brasser';   /* le chaudron est ouvert : on prépare l'encre dedans (pas de rond : c'est le mini-jeu) */
    if(!UI.tutoGrimoire && !(M.condMission && M.condMission({dictee:'revelatrice'}))) return 'grimoire';   /* (la recette est déjà dictée : on va droit au chaudron) */
    return 'chaudron';
  }
  return 'carton';
}
document.addEventListener('atelier:guide-fait', function(ev){
  var c = ev && ev.detail && ev.detail.cible; if(!c) return;
  UI.tutoAt = UI.tutoAt || {}; UI.tutoAt[c] = 1;
  if(c === 'grimoire') UI.tutoGrimoire = 1;
  if(c === 'rangement') delete UI.tutoAt.cueillette;   /* rangé : s'il reste quelque chose devant la porte, on recommence */
  atelierCible = undefined;   /* l'atelier a arrêté son guidage : la cible suivante sera redonnée */
  setTimeout(function(){ try{ maj(false); }catch(e){} }, 60);
});
/* Le chemin d'une étape : la liste des choses à toucher, de l'onglet jusqu'au geste final */
function pasEtape(e){
  var l = lieuxDe(e)[0];
  if(e.livre){ var p = [{k:'onglet', o:'role'}, {k:'page', id:e.livre}]; if(e.livre === 'mystere') p.push({k:'blanche'}); else if(e.manuel) p.push({k:'fait'}); return p; }
  if(e.pnj){
    if(!l) return [];
    /* chez lui : toucher sa maison (son visage est dessus) frappe tout de suite à la porte (A.maison) */
    if(estMaison(l)) return [OC, {k:'maison', id:l, p:e.pnj}, {k:'frapper', id:l, p:e.pnj}, {k:'question', p:e.pnj}];
    return [OC, {k:'lieu', id:l}, {k:'parler', id:e.pnj}, {k:'question', p:e.pnj}];
  }
  if(e.cueillir) return [OC, {k:'lieu', id:l}, {k:'cueillir', id:l}];
  if(e.points) return [OC, {k:'lieu', id:l}, {k:'explorer', id:l}, {k:'point', l:l, id:premierPoint(e, l)}];
  if(e.atelier) return [{k:'onglet', o:'role'}, {k:'atelier', c:cibleAtelier(e), objet:e.objet || null, encre:e.atelier === 'encre'}];
  if(e.manuel) return [{k:'fait'}];
  return [];
}
/* Ce qu'il faut faire maintenant : {etat, ic, but, but2, pas, fait (i d'une étape à cocher), passer, force} */
function plan(){
  if(talentForce()) return {etat:'talent', ic:'⭐', but:'Ton héros grandit ! Choisis ton nouveau talent.', pas:[{k:'portrait'}, {k:'arbre'}, {k:'talent'}], force:true};
  var Pv = M.S && M.S.e, Ev = Pv ? M.E() : null;
  if(Ev && Ev.tuto && !window.BRUMEVAL_SANS_TUTO && Pv.etape === 'jeu' && Pv.resolu && !Pv.defaite && UI.modal && (UI.modal.type === 'victoire' || UI.modal.type === 'corbeau'))   /* la bonne accusation : jusqu'à la fin de l'histoire */
    return {etat:'bravo', ic:'🏆', but:'Bravo, c\'est la bonne réponse ! Dis le code de la fin à toute l\'équipe.', pas:[]};
  if(!actif()) return null;
  var T = M.tutoEtat(), E = M.E(), sage = M.role() === 'sage';
  var mid = M.momentId(), suiv = E.moments[momentN() + 1], R = {etat:T.etat, i:T.i, e:T.e};
  var codes = [{k:'onglet', o:'code'}], moment = [{k:'onglet', o:'role'}, {k:'page', id:'codes'}, {k:'moment'}, {k:'passer'}];
  var trous = (E.bonus || []).filter(function(b){ return b.trous && b.role === M.role() && M.P().bonus[b.id] === 'encours'; })[0];
  if(trous && !(T.etat === 'faire' && T.e && !T.e.manuel)){   /* la chanson du Barde commencée (barde.js) : on la complète dans le Carnet, puis on la chante à Margot */
    R.ic = '🎶'; R.etat = 'bonus'; R.but = 'Complète la chanson du Carnet, puis chante-la à Margot !';
    R.pas = [{k:'onglet', o:'carnet'}, {k:'chanter'}];
    return R;
  }
  if(T.etat === 'faire'){
    R.ic = T.e.ic || '🎯'; R.but = T.e.histoire || T.e.court || T.e.t; R.pas = pasEtape(T.e);
    /* (Romain, 5 novembre, 23 h 32) le bandeau ne raconte que l'histoire ; une étape sans histoire (la forêt du Pisteur…) : plus de bandeau, le bouton animé suffit */
    if(!T.e.histoire && !T.e.manuel) R.sansBandeau = true;
    if(T.e.manuel) R.fait = T.i;
    return R;
  }
  if(T.etat === 'fini'){
    if(sage){ R.ic = '⚖️'; R.but = 'L\'heure de vérité ! Tous d\'accord ? Qui a pris la Lanterne d\'Or, et où est-elle ?'; R.pas = [{k:'onglet', o:'role'}, {k:'page', id:'accusation'}, {k:'accuser'}]; }
    else {
      R.ic = '🔍'; R.but = 'Bravo ! Aide le Sage : qui a pris la Lanterne d\'Or, et où est-elle ?'; R.pas = codes;
      var bf = T.bonus[0];   /* une action en trop, le soir (sans points d'action : en attendant le code de la fin) : la mission bonus */
      if(bf){ R.but2 = '✨ ' + (bf.histoire || 'Bonus : « ' + bf.titre + ' » !'); R.pas = [OC, {k:'lieu', id:bf.lieu}, {k:'bonus', id:bf.id}]; R.bonus = bf; }
    }
    return R;
  }
  if(T.etat === 'attend'){
    R.ic = '⏳'; R.but = attenteTexte(T.e);   /* tout est bloqué ; le message nomme toujours qui va donner le code */
    if(T.e.passer && momentN() > (T.e.m || 0)) R.passer = T.i;   /* l'équipier n'a pas pu (mini-jeu raté) : on peut passer */
  } else if(sage){
    R.ic = '✅'; R.but = suiv ? (FIN_MOMENT[mid] || 'Tu as tout fait pour ' + CE[mid] + ' !') + ' Tous prêts ? Passe ' + ({matin:'au matin', apresmidi:'à l\'après-midi', soir:'au soir', nuit:'à la nuit'}[suiv] || 'à la suite') + '.' : 'Tu as tout fait pour ' + CE[mid] + '.';
  } else if(T.etat === 'action'){   /* (jamais sans points d'action) */
    R.ic = '⏳'; R.but = suiv ? 'Plus d\'action pour ' + AU[mid] + '. Attends le code ' + DU[suiv] + ' (le Sage).' : 'Plus d\'action ! Demande au Sage une action de sa réserve (page 💡).';
  } else {   /* tout fait pour ce moment */
    R.ic = '✅'; R.but = (FIN_MOMENT[mid] || 'Tu as tout fait pour ' + CE[mid] + ' !') + ' Le Sage a le code ' + DU[suiv] + (T.bonus[0] ? '.' : (SAGE_LENT[mid] || '.'));
  }
  var b = T.bonus[0];
  if(b){ R.but2 = '✨ ' + (b.histoire || 'Bonus : « ' + b.titre + ' » !'); R.pas = [OC, {k:'lieu', id:b.lieu}, {k:'bonus', id:b.id}]; R.bonus = b; return R; }
  if(R.passer !== undefined){ R.pas = [{k:'passe'}]; return R; }   /* le code n'est pas venu au moment prévu : l'équipier n'a pas pu, on passe */
  R.pas = sage && suiv && (T.etat !== 'attend' || sagePeutPasser()) ? moment : codes;
  return R;
}

/* Jusqu'où le joueur est déjà allé sur le chemin */
function satisfait(d){
  var P = M.P(), m = UI.modal, enq = UI.ecran === 'enquete';
  switch(d.k){
    case 'onglet': return enq && P.onglet === d.o;
    case 'lieu': return !!m && m.type === 'lieu' && m.id === d.id;
    case 'maison': return !!m && m.type === 'maison' && m.id === d.id;
    case 'explorer': return !!m && m.type === 'lieu' && m.id === d.id && P.vus['explore:' + d.id] === P.moment;
    case 'frapper': return !!m && m.type === 'conv' && m.id === d.p;
    case 'parler': return !!m && m.type === 'conv' && m.id === d.id;
    case 'page': return enq && P.onglet === 'role' && !!document.getElementById('livre-ici') && !!M.livrePage && M.livrePage() === d.id;
    case 'moment': return !!m && m.type === 'moment';
    case 'portrait': return UI.ecran === 'heros';
    case 'arbre': return UI.ecran === 'heros' && !!UI.arbre;
  }
  return false;
}
function cibleDe(pas){
  for(var k = pas.length - 1; k >= 0; k--) if(satisfait(pas[k])) return pas[k + 1] || null;
  return pas[0] || null;
}

/* ---------- Trouver la cible à l'écran ---------- */
function q(s){ try{ return document.querySelector(s); }catch(e){ return null; } }
function qa(s){ try{ return [].slice.call(document.querySelectorAll(s)); }catch(e){ return []; } }
function vu(el){
  if(!el || !el.getBoundingClientRect || !el.isConnected) return false;
  var r = el.getBoundingClientRect(); if(r.width < 2 && r.height < 2) return false;
  var vue = el.closest && el.closest('.ca-vue, .lv-feuille, .b-feuille, #atelier-ici'), b = vue ? vue.getBoundingClientRect() : null;
  var x = (r.left + r.right) / 2, y = (r.top + r.bottom) / 2;
  if(b && (x < b.left || x > b.right || y < b.top || y > b.bottom)) return false;
  return x > 0 && y > 0 && x < innerWidth && y < innerHeight + (el.closest('#voile') ? 70 : 0);   /* (une fenêtre qui monte encore, b-monte : 60 px plus bas) */
}
/* Vu, et pas caché sous la barre des onglets ni sous le bandeau du haut (sinon on fait d'abord défiler jusqu'à lui) */
function vuVraiment(el){
  if(!vu(el)) return false;
  if(el.closest('.b-onglets, .b-entete, #voile, #mj-plein')) return true;
  var r = el.getBoundingClientRect(), y = (r.top + r.bottom) / 2;
  var nav = q('.b-onglets'), ent = q('.b-entete'), rn = nav && nav.getBoundingClientRect(), re = ent && ent.getBoundingClientRect();
  if(rn && rn.height && rn.top > innerHeight / 2 && y > rn.top - 6) return false;
  if(re && re.height && y < re.bottom + 6) return false;
  return true;
}
function premier(sels){ for(var k = 0; k < sels.length; k++){ var l = qa(sels[k]).filter(vu); if(l.length) return l[0]; } return null; }
/* Le premier qui se voit, sinon le premier affiché (même plus bas : amener() fait défiler jusqu'à lui) */
function present(sels){ return premier(sels) || sels.map(function(s){ return qa(s).filter(function(x){ return x.getClientRects().length > 0; })[0]; }).filter(Boolean)[0] || null; }
/* Ranger dans l'atelier quand un panneau est ouvert par-dessus la pièce : le gros plan d'un meuble (une case qui convient, sinon un ingrédient
   du plateau à prendre), ou « Ta cueillette » (un meuble de la liste pour l'ingrédient choisi, sinon un ingrédient à choisir) */
function rangerPanneau(){
  var ouv = q('#atelier-ici .at-ouvert:not([hidden])');
  if(ouv){   /* le gros plan d'un meuble : une case qui convient ; sinon un ingrédient du plateau qui va dans CE meuble (💧 ou 🍃) ; sinon son ✕ */
    var cs = [].filter.call(ouv.querySelectorAll('.at-case.at-ok'), vu)[0]; if(cs) return cs;
    var verre = !!ouv.querySelector('.at-zoom-regle.v');
    var j = [].filter.call(ouv.querySelectorAll('.at-jeton-g[data-de=panier]:not(.on)'), function(x){ return vu(x) && x.classList.contains('liquide') === verre; })[0];
    return j || ouv.querySelector('.at-fermer');
  }
  return premier(['#atelier-ici .at-grim:not([hidden]) .at-ou-b[data-vers]:not(.plein)', '#atelier-ici .at-grim:not([hidden]) .at-gj[data-prendre]']);
}
/* Un panneau de l'atelier resté ouvert (le gros plan d'un meuble, la cueillette…) cache la prochaine chose à toucher : son ✕ */
function panneauGenant(c){
  if(c === 'bouton' || c === 'brasser' || c === 'rangement' || c === 'regarde') return null;
  if(c === 'grimoire' && q('#atelier-ici .at-grim:not([hidden]) .at-grimoire')) return null;   /* le grimoire ouvert : l'atelier entoure ses « ? » */
  if(c === 'carton' && q('#atelier-ici .at-grim:not([hidden]) .at-f-reserve')) return null;    /* le 📦 ouvert : l'atelier fait briller le meuble à installer */
  return premier(['#atelier-ici .at-ouvert:not([hidden]) .at-fermer', '#atelier-ici .at-grim:not([hidden]) .at-fermer']);
}
function coinLivre(id){
  var ici = document.getElementById('livre-ici'); if(!ici) return null;
  var pages = [].slice.call(ici.querySelectorAll('.lv-page')), cur = -1, cible = -1;
  pages.forEach(function(pg, k){ if(pg.classList.contains('on')) cur = k; if(pg.dataset.id === id) cible = k; });
  if(cible < 0 || cur < 0 || cible === cur) return null;
  var som = ici.querySelector('.lv-sommaire');
  if(som && !som.hidden) return som.querySelector('[data-lv=aller][data-i="' + cible + '"]');
  /* les deux façons de changer de page (Romain, 5 novembre, 15 h) : une page proche, le coin corné ‹ › ; une page loin (3 pages ou plus),
     le numéro en bas (« 2 / 9 ») qui montre toutes les pages d'un coup, puis la page dans la liste. Dans l'enquête 1, le Sage tourne
     d'abord les coins (les habitants, les recettes), puis passe par la liste pour aller aux codes des moments. */
  if(Math.abs(cible - cur) >= 3) return ici.querySelector('.lv-num');
  return ici.querySelector(cible > cur ? '.lv-coin.d' : '.lv-coin.g');
}
var ATELIER_SEL = {
  carton:['#atelier-ici .at-carton:not(.at-ouvert-c)', '#atelier-ici .at-carton', '#atelier-ici [data-at=reserve]'],
  cueillette:['#atelier-ici .at-tas'],
  grimoire:['#atelier-ici [data-at=grimoire]'],
  chaudron:['#atelier-ici [data-at=chaudron]'],
  potion:['#atelier-ici .at-flacon'],
  paillasse:['#atelier-ici [data-at=analyses]'],
  rangement:[]
};
function trouver(d){
  if(!d) return [];
  var el = null;
  switch(d.k){
    case 'onglet': el = q('.b-onglets [data-act=onglet][data-o="' + d.o + '"]'); break;
    case 'lieu': el = premier(['#carte-ici g.ca-lieu[data-lieu="' + d.id + '"] .ca-etiq-lieu', '#carte-ici [data-act=lieu][data-id="' + d.id + '"]']); break;
    case 'maison': el = premier(['#carte-ici g.ca-maison[data-act=maison][data-id="' + d.id + '"] .ca-habitant', '#carte-ici g.ca-maison[data-act=maison][data-id="' + d.id + '"]']); break;   /* le rond sur le visage de l'habitant */
    case 'explorer': el = q('#voile [data-act=explorer][data-id="' + d.id + '"]'); break;
    case 'point': el = q('#voile [data-act=point][data-l="' + d.l + '"][data-id="' + d.id + '"]'); break;
    case 'frapper': el = q('#voile [data-act=frapper][data-id="' + d.id + '"]'); break;
    case 'parler': el = q('#voile [data-act=parler][data-id="' + d.id + '"]'); break;
    case 'question': el = q('#voile [data-act=question][data-p="' + d.p + '"]:not([disabled])'); break;
    case 'cueillir': el = q('#voile [data-act=cueillir][data-id="' + d.id + '"]'); break;
    case 'bonus': el = q('#voile [data-act=bonus][data-id="' + d.id + '"]'); break;
    case 'page': el = coinLivre(d.id); break;
    case 'blanche':   /* (13 novembre) l'encre renversée sur la page : le rond sur la flaque, tant qu'on ne la tient pas (livre.js, verser) */
      var vs = q('#livre-ici .lv-page.on .lv-vs');
      el = vs ? vs.querySelector('.lv-vs-goutte.prete:not(.tenue)') : q('#livre-ici .lv-page.on [data-lv=blanche]'); break;
    case 'fait': el = q('.tu-bandeau [data-act=tuto-fait]') || q('#tu-astuce [data-act=tuto-fait]'); break;
    case 'passe': el = q('.tu-bandeau [data-act=tuto-passer]'); break;
    case 'chanter': el = present(['[data-act=bd-chanter]']) || (q('.bd-trou.choisi') ? null : present(['.bd-trous.ouvert .bd-trou:not(.plein)', '.bd-trous:not(.ouvert) [data-act=bd-trous-ouvre]'])); break;   /* (plus bas dans le Carnet : on y fait défiler) */   /* un trou, jamais un mot : on ne montre pas la réponse */
    case 'moment': el = q('#livre-ici .lv-page.on [data-act=moment-suivant]'); break;
    case 'passer': el = q('#voile [data-act=passer-moment]'); break;
    case 'accuser': el = q('#livre-ici .lv-page.on [data-act=accuser]'); break;
    case 'portrait': el = q('.b-entete .b-et-heros'); break;
    case 'arbre': el = q('[data-act=hr-arbre]'); break;
    case 'talent': return qa('[data-act=hr-talent][data-etat=dispo]');
    case 'atelier':
      if(d.c === 'bouton'){ el = boutonAtelier(d); break; }
      if(d.c === 'brasser'){ el = premier(['#atelier-ici .at-ch-go[data-r=revelatrice]', '#atelier-ici .at-ch-go']); break; }   /* le chaudron ouvert : le rond sur « Préparer » */
      el = (d.c === 'rangement' || d.c === 'cueillette') && rangerPanneau();   /* « Ta cueillette » ou un meuble ouvert par-dessus la pièce : le rond va dans le panneau (celui de l'atelier est dessous) */
      if(!el) el = panneauGenant(d.c);   /* un panneau d'avant cache la chose à toucher : d'abord le fermer */
      if(el) break;
      if(window.Atelier && Atelier.guider) return [];   /* l'atelier dessine son propre rond */
      el = premier(ATELIER_SEL[d.c] || []);   /* sans Atelier.guider : on entoure ce qu'on reconnaît dans la pièce */
      break;
  }
  return el ? [el] : [];
}
/* Le clic correspond-il à la cible ? (on compare l'action et ses données, pas l'élément : une étiquette et sa zone à toucher sont deux éléments) */
function correspond(d, el){
  if(!d || !el) return false;
  var a = el.dataset.act, x = el.dataset;
  switch(d.k){
    case 'onglet': return a === 'onglet' && x.o === d.o;
    case 'lieu': return a === 'lieu' && x.id === d.id;
    case 'maison': return a === 'maison' && x.id === d.id;
    case 'explorer': return a === 'explorer' && x.id === d.id;
    case 'point': return a === 'point' && x.l === d.l && x.id === d.id;
    case 'frapper': return a === 'frapper' && x.id === d.id;
    case 'parler': return a === 'parler' && x.id === d.id;
    case 'question': return a === 'question';
    case 'cueillir': return a === 'cueillir' && x.id === d.id;
    case 'bonus': return a === 'bonus' && x.id === d.id;
    case 'fait': return a === 'tuto-fait';
    case 'passe': return a === 'tuto-passer';
    case 'chanter': return /^bd-/.test(a);
    case 'moment': return a === 'moment-suivant';
    case 'passer': return a === 'passer-moment';
    case 'accuser': return a === 'accuser';
    case 'portrait': return a === 'ecran' && x.e === 'heros';
    case 'arbre': return a === 'hr-arbre';
    case 'talent': return a === 'hr-talent' || a === 'talent';
    case 'atelier': return (a === 'analyser' && !!d.objet && x.id === d.objet) || (a === 'donner-potion' && d.encre && x.id === 'revelatrice') || a === 'sous-atelier';
  }
  return false;
}
/* La phrase « 👆 … » : ce qu'il faut toucher */
var PAGES = {lettre:'La lettre du maire', archives:'Les archives', habitants:'Les habitants', recettes:'Les recettes', mystere:'La page blanche', tableau:'Mon tableau d\'enquête', codes:'Les codes des moments', accusation:'L\'accusation'};
function nomLieu(id){ var L = window.Carte && Carte.LIEUX && Carte.LIEUX[id]; return L ? L.ic + ' ' + L.court : M.nomLieu(id); }
/* La petite phrase « 👆 » du bandeau : plus aucune explication de ce qu'il faut toucher (Romain, 5 novembre, 23 h 09 et 23 h 35 :
   « c'est du visuel, il n'y a pas besoin d'explication ; tout ce qu'il me faut, c'est du narratif et les boutons animés ») :
   le bouton à toucher bouge, avec le rond jaune autour. Seul reste le « ⏭️ Passer » (un bouton du bandeau, qu'il faut expliquer). */
function dire(d){
  if(!d) return '';
  if(d.k === 'passe'){ var qp = quiDonne((T0() || {}).e), nq = qp.length ? nomsDe(qp) : 'ton équipier'; return nq.charAt(0).toUpperCase() + nq.slice(1) + ' n\'a pas pu ? ⏭️ Passer.'; }
  return '';
}

/* Le villageois parle encore : sa bulle (#bd-texte, barde.js) s'écrit ; on attend qu'elle ne bouge plus depuis 1,2 s (la fin de ses mimiques) */
var parole = {txt:null, t:0};
function parleEncore(){
  var b = document.getElementById('bd-texte'); if(!b) return false;
  var t = b.textContent || '';
  if(t !== parole.txt){ parole = {txt:t, t:Date.now()}; return true; }
  return Date.now() - parole.t < 1200;
}
/* ---------- Le guide complet de ce moment : plan + cible + ce qui est permis ---------- */
var LIBRES = {decouverte:1, info:1, code:1, besoin:1, moment:1, victoire:1, corbeau:1, talent:1, perso:1, conv:1, reserve:1, confirmer:1, 'boire-mj':1, 'auto-mj':1, 'avant-mj':1, revision:1, calepin:1, 'barde-sac':1, 'pisteur-sac':1, aide:1, chaudron:1, accusation:1};
var SANS_ROND = {accusation:1, talent:1, perso:1, corbeau:1};   /* des choix : jamais de rond (on ne montre pas la réponse) */
function guide(){
  var Pl = plan(); if(!Pl) return null;
  var G = {plan:Pl, force:!!Pl.force, d:null, els:[], dire:'', libre:false, verrous:[]};
  G.bloque = Pl.force ? (UI.ecran === 'enquete' || UI.ecran === 'heros') : UI.ecran === 'enquete';
  var T = !Pl.force ? M.tutoCarte() : null; G.verrous = T ? T.verrous : [];
  /* un mini-jeu en pause (moteur-actions.js) : le guide montre « ▶️ Reprendre » ; on peut regarder partout en attendant */
  if(M.mjPause){
    var rp = q('#mj-rappel .mj-rp-go');
    G.pause = true; G.d = {k:'pause'}; G.els = rp ? [rp] : [];
    G.dire = 'Ton mini-jeu t\'attend : reprends-le !'; G.bandeau = true;
    return G;
  }
  var mj = document.getElementById('mj-plein');
  if(mj && !mj.hidden){ G.mj = true; return G; }
  var d = cibleDe(Pl.pas || []);
  G.d = d; G.els = trouver(d); G.dire = dire(d);
  if(UI.modal && UI.modal.type === 'conv' && parleEncore()){ G.els = []; G.dire = 'Écoute bien la réponse…'; G.parle = true; return G; }   /* le villageois parle (barde.js) : on attend la fin */
  var m = UI.modal;
  if(m && !G.els.some(function(el){ return el.closest && el.closest('#voile'); })){
    /* une fenêtre ouverte qui n'est pas sur le chemin */
    if(LIBRES[m.type]){
      G.libre = true; G.d = {k:'modal'};
      /* le talent forcé de l'enquête 2 : la fiche du talent choisi, le rond sur « ⭐ Je prends ce talent » (ce n'est pas une réponse à deviner :
         le joueur a déjà choisi lequel regarder ; Romain, 5 novembre, 21 h 46 : le même cadre jaune jusqu'au bout) */
      var bt = m.type === 'perso' && m.quoi === 'talent' && G.force ? q('#voile [data-act=talent]') : null;
      var b = bt || (SANS_ROND[m.type] ? null : (q('#voile .b-feuille .b-reessai') || premier(['#voile .b-feuille [data-act=question]:not([disabled])', '#voile .b-feuille .btn.grand:not(.second)', '#voile .b-feuille .btn:not(.second):not([disabled])', '#voile .b-feuille .btn']) || (m.type === 'conv' ? q('#voile .b-fermer') : null)));
      /* une conversation finie (plus de question à poser) : le rond sur ✕, pas sur « 📌 Mon tableau » (qui emmenait au tableau de liège sans rien dire) */
      if(m.type === 'conv' && b && b.classList.contains('bd-tableau')){ var fx = q('#voile .b-fermer'); if(fx){ b = fx; G.d = {k:'fermer'}; } }
      G.els = b ? [b] : [];
      G.dire = '';
    } else {
      G.d = {k:'fermer'}; var f = q('#voile .b-fermer'); G.els = f ? [f] : []; G.dire = '';
    }
  }
  return G;
}
M.tutoGuide = function(){ var G = guide(); return G ? {etat:G.plan.etat, but:G.plan.but, but2:G.plan.but2 || '', dire:G.dire, cible:G.d, i:G.plan.i} : null; };

/* ==========================================================
   4. La barrière : seul ce qui est sur le chemin se touche
   ========================================================== */
var TOUJOURS = {lire:1, 'tuto-lire':1, fermer:1, 'menu-enquete':1, menu:1, sym:1, 'sym-efface':1, 'carnet-pnj':1, revoir:1, 'relire-lettre':1, journal:1, calepin:1,
  'tab-case':1, 'tab-tete':1, 'tab-effacer':1, 'mj-potion':1, 'mj-auto':1, 'tuto-fait':1, 'tuto-passer':1, 'noter-ingr':1, 'basculer-ingr':1, 'sous-sol':1, chemin:1, opt:1, 'test-voix':1, 'confirmer-oui':1,
  'bd-carnet':1, 'bd-trous-ouvre':1, 'bd-trou':1, 'bd-mot':1, 'bd-chanter':1, 'mj-reprendre':1, 'missions-plier':1, 'fil-plier':1, 'codes-plier':1, 'arch-plier':1, 'bib-plier':1, 'gens-plier':1};   /* la phrase à trous du Barde, dans le Carnet (barde.js) */
function permis(el, G){
  var a = el.dataset.act, x = el.dataset;
  if(G.force){
    if(a === 'lire' || a === 'tuto-lire' || a === 'fermer' || a === 'menu-enquete' || a === 'menu') return true;
    if(el.closest('#voile') && G.libre) return true;
    return correspond(G.d, el);
  }
  if(TOUJOURS[a]) return true;
  if(a === 'onglet' && (x.o === 'carnet' || x.o === 'code' || (M.P() && M.P().onglet === x.o))) return true;   /* lire son Carnet, taper un code d'un équipier : toujours ; l'onglet ouvert : rien ne change */
  if(a === 'mission-coche'){ var e = etapes()[+x.i]; return !!e && (e.piste || e.libre); }
  if(el.closest('#voile') && G.libre) return true;
  if(a === 'lieu' && G.verrous.indexOf(x.id) >= 0) return true;   /* un lieu au cadenas : il explique ce qu'on attend */
  if(G.d && correspond(G.d, el)) return true;
  if(a === 'onglet' && (!G.d || G.mj || (G.plan.etat === 'fini' && !G.plan.bonus))) return true;   /* rien à toucher (on attend), ou toute la trame faite : on peut regarder ses onglets */
  return false;
}
var secousse = 0;
document.addEventListener('click', function(ev){
  var t = ev.target;
  if(!t || !t.closest) return;
  /* l'Alchimiste a ouvert son grimoire : la suite est le chaudron (avec le vrai atelier, on attend son « guide-fait » :
     il vient quand la recette secrète a été remplie sous la dictée du Sage) */
  if(t.closest('[data-at=grimoire]') && !(window.Atelier && Atelier.guider)) UI.tutoGrimoire = 1;
  var G; try{ G = guide(); }catch(e){ console.error(e); return; }
  if(!G || !G.bloque || G.mj || G.pause) return;   /* en pause : le moteur dit lui-même ce qui attend (LIBRE_EN_PAUSE) */
  if(t.closest('#mj-plein, #stop-voix, #mj-rappel, .at-mj, .mjc')) return;   /* (un mini-jeu ouvert dans l'atelier, le chaudron : il gère ses touches ; ex. le tas de bois, data-act=bois) */
  var el = t.closest('[data-act]');
  if(!el || !el.dataset.act || el.tagName === 'INPUT') return;
  if(permis(el, G)) return;
  ev.stopPropagation(); if(ev.stopImmediatePropagation) ev.stopImmediatePropagation(); ev.preventDefault();
  M.son('ko');
  M.toast('Pas maintenant ! ' + (G.dire || G.plan.but || ''));
  secousse = Date.now();
}, true);

/* Les actions refusent aussi ce qui sort de la trame (un clic au clavier, un ancien bouton, un essai à la main) */
function refuser(t){ M.son('ko'); var g = M.tutoGuide(); M.toast(t || ('Pas maintenant ! ' + ((g && (g.dire || g.but)) || ''))); }
/* (le labo d'analyses, labo.js, demande avant d'ouvrir : cette analyse est-elle dans la trame maintenant ? M.tutoPermet('analyser', {id:'fil'})) */
var GARDES = {};
M.tutoPermet = function(nom, x){
  if(!actif() || !GARDES[nom]) return true;
  try{ return GARDES[nom](x || {}) === true; }catch(e){ return true; }
};
function garder(nom, ok){
  GARDES[nom] = ok;
  var f = A[nom]; if(typeof f !== 'function') return;
  A[nom] = function(el){
    if(actif()){
      var r = true;
      try{ r = ok((el && el.dataset) || {}); }catch(e){ console.error(e); r = true; }
      if(r === 0) return;
      if(r !== true){ refuser(typeof r === 'string' ? r : null); return; }
    }
    return f.apply(this, arguments);
  };
}
function T0(){ return M.tutoEtat(); }
function carteT(){ return M.tutoCarte() || {ouverts:[], verrous:[], maisons:[], visibles:[]}; }
function etapeDuPoint(l, id){
  var role = M.role(), L = etapes();
  for(var j = 0; j < L.length; j++){ var e = L[j]; if(e.points && e.points.indexOf(id) >= 0 && lieuxDe(e).indexOf(l) >= 0) return j; }
  return -1;
}
function etatPoint(l, id){
  var P = M.P(), k = M.role() + ':' + l + ':' + id, j = etapeDuPoint(l, id), T = T0();
  if(P.vus[k] === 'ok' || P.vus[k] === 'rate') return 'libre';   /* déjà vu (ou raté) : on peut le relire, ou retenter */
  if(j < 0) return 'hors';
  if(faite(etapes()[j], j)) return 'libre';
  if(T.etat === 'faire' && T.i === j) return premierPoint(T.e, l) === id ? 'ici' : 'apres';
  return 'apres';
}
garder('lieu', function(x){
  var id = x.id, P = M.P(), C = carteT();
  if(estMaison(id)) return true;
  if(C.ouverts.indexOf(id) >= 0 || P.vus['lieu:' + id + ':' + P.moment] || P.vus['explore:' + id] === P.moment) return true;
  if(C.verrous.indexOf(id) >= 0){
    if(M.verrouLieu(id)) return true;   /* un vrai cadenas (la forêt) : sa fiche dit ce qui l'ouvre */
    var T = T0(); M.son('tic'); M.ouvrir({type:'info', ic:'⏳', titre:'Pas encore…', t:attenteTexte(T.e)}); return 0;
  }
  return false;
});
garder('maison', function(x){ return carteT().maisons.indexOf(x.id) >= 0; });
garder('explorer', function(x){ return carteT().ouverts.indexOf(x.id) >= 0; });
garder('point', function(x){ var s = etatPoint(x.l, x.id); return s === 'ici' || s === 'libre'; });
garder('cueillir', function(x){ var T = T0(); return T.etat === 'faire' && !!T.e.cueillir && lieuxDe(T.e).indexOf(x.id) >= 0; });
garder('parler', function(x){ var P = M.P(), T = T0(); return P.conv[x.id] === P.moment || (T.etat === 'faire' && T.e.pnj === x.id); });
garder('frapper', function(x){ var T = T0(); return carteT().maisons.indexOf(x.id) >= 0 && T.etat === 'faire' && !!T.e.pnj; });
garder('bonus', function(x){ return T0().bonus.some(function(b){ return b.id === x.id; }); });
garder('analyser', function(x){
  var L = etapes(), T = T0();
  for(var j = 0; j < L.length; j++) if(L[j].objet === x.id){ if(faite(L[j], j)) return true; return T.etat === 'faire' && T.i === j; }
  return true;
});
garder('ouvrir-page', function(x){   /* la page blanche se touche sans passer par un bouton : elle attend aussi son étape */
  var L = etapes(), T = T0();
  for(var j = 0; j < L.length; j++) if(L[j].livre === x.id){ if(faite(L[j], j) || (T.etat === 'faire' && T.i === j)) return true; return 'Pas encore ! D\'abord : ' + ((T.e || {}).court || (T.etat === 'moment' ? 'attends le moment suivant.' : 'finis tes étapes.')); }
  return true;
});
garder('moment-suivant', function(){ return M.role() !== 'sage' || sagePeutPasser() || 'Pas encore ! D\'abord : ' + ((T0().e || {}).court || 'finis tes étapes.'); });
garder('accuser', function(){ var E = M.E(); return momentN() >= E.moments.length - 1 || 'Pas encore : on accuse le soir, quand toute l\'équipe a tout raconté.'; });

/* Ses propres boutons : « ✔ C'est fait », « Passer », 🔊 */
function cocher(i){
  var P = M.P(); if(!P) return;
  if(M.majMission) M.majMission();
  var Mi = P.mission = P.mission || {faits:{}, manuels:{}, coches:{}, nonLus:0};
  Mi.coches = Mi.coches || {}; Mi.manuels = Mi.manuels || {};
  Mi.coches[i] = 1; Mi.manuels[i] = 1;
  M.son('ok'); M.sauver(); UI.garderDefilement = true; M.render();
}
A['tuto-fait'] = function(el){ var T = T0(); if(!T || !T.e || !T.e.manuel) return; cocher(T.i); };
A['tuto-passer'] = function(){
  var T = T0(); if(!T || !T.e || !T.e.passer) return;
  var i = T.i;
  UI.confirmer = function(){ cocher(i); };
  var qp = quiDonne(T.e), qn = qp.length ? nomsDe(qp) : 'ton équipier';
  M.ouvrir({type:'confirmer', titre:'Passer cette étape ?', t:qn.charAt(0).toUpperCase() + qn.slice(1) + ' n\'a pas pu te donner ce code ? Tu passes à la suite : tant pis pour cet indice.', oui:'⏭️ Passer'});
};
A['tuto-lire'] = function(){ var g = M.tutoGuide(); if(g) M.lire([g.but, g.but2, g.dire].filter(Boolean).join(' ')); };

/* ==========================================================
   5. Les fiches des lieux : seulement ce qui est sur le chemin
   ========================================================== */
var pnjAvant = M.pnjIci;
M.pnjIci = function(lieu){
  var l = pnjAvant.apply(this, arguments);
  if(!actif() || M.role() !== 'barde') return l;
  var T = T0();
  return T.etat === 'faire' && T.e && T.e.pnj ? l.filter(function(id){ return id === T.e.pnj; }) : [];
};
var bonusAvant = M.bonusIci;
M.bonusIci = function(lieu){
  var l = bonusAvant.apply(this, arguments);
  if(!actif()) return l;
  var ok = T0().bonus.map(function(b){ return b.id; });
  return l.filter(function(b){ return ok.indexOf(b.id) >= 0; });
};
var feuilleAvant = M.feuilleLieu;
M.feuilleLieu = function(lieu){
  var s = feuilleAvant.apply(this, arguments);
  if(!actif()) return s;
  var role = M.role(), T = T0();
  if(role === 'alchimiste' && !(T.etat === 'faire' && T.e && T.e.cueillir && lieuxDe(T.e).indexOf(lieu) >= 0))   /* chercher ailleurs qu'à l'étape gâcherait une action */
    s = s.replace(/<button class="btn grand" data-act="cueillir"[^>]*>[^<]*<\/button>/, '').replace(/<p class="doux petit">On trouve parfois[^<]*<\/p>/, '');
  if(role === 'pisteur' || role === 'sage')
    s = s.replace(/<button class="b-point([^"]*)" data-act="point" data-l="([^"]+)" data-id="([^"]+)"/g, function(tout, cls, l, id){
      var st = etatPoint(l, id);
      if(st === 'apres' || st === 'hors') return '<button class="b-point' + cls + ' tu-apres" disabled data-act="point" data-l="' + l + '" data-id="' + id + '"';
      if(st === 'ici') return '<button class="b-point' + cls + ' tu-ici" data-act="point" data-l="' + l + '" data-id="' + id + '"';
      return tout;
    });
  return s;
};

/* ==========================================================
   6. Le bandeau (sous le bandeau du haut), les lignes du Carnet
   ========================================================== */
function contenuBandeau(G){
  var Pl = G.plan, s = '<span class="tu-ic" aria-hidden="true">' + (Pl.ic || '🎯') + '</span><div class="tu-txt"><p class="tu-but">' + esc(Pl.but || '') + '</p>' +
    (Pl.but2 ? '<p class="tu-but2">' + esc(Pl.but2) + '</p>' : '') + (G.dire ? '<p class="tu-dire">👆 ' + esc(G.dire) + '</p>' : '') + '</div>' +
    '<button type="button" class="b-lire tu-lire" data-act="tuto-lire" aria-label="Écouter">🔊</button>';
  if(Pl.fait !== undefined && Pl.fait !== null && G.d && G.d.k === 'fait') s += '<button type="button" class="btn petit tu-fait" data-act="tuto-fait">✔ C\'est fait</button>';
  if(Pl.passer !== undefined && Pl.passer !== null) s += '<button type="button" class="btn second petit tu-passer" data-act="tuto-passer">⏭️ Passer</button>';
  return s;
}
function signature(G){ return G ? [G.plan.etat, G.plan.i, G.plan.but, G.plan.but2 || '', G.dire, G.plan.fait, G.plan.passer, G.d && G.d.k === 'fait' ? 'F' : ''].join('|') : ''; }   /* (le ✔ apparaît quand la cible devient « fait » : sans phrase « 👆 », seule la cible change) */
function sansBandeau(G){ return !!(G && G.plan && G.plan.sansBandeau && !G.bandeau); }   /* une étape sans histoire : pas de bandeau (plan) */
M.bandeauTuto = function(){
  var G; try{ G = guide(); }catch(e){ console.error(e); return ''; }
  if(!G || sansBandeau(G)) return '';
  return '<div class="tu-bandeau tu-' + esc(G.plan.etat) + '" role="status" data-sig="' + esc(signature(G)) + '">' + contenuBandeau(G) + '</div>';
};
M.tutoClasse = function(e, i){
  if(!actif() || e.libre || e.piste) return '';
  var T = T0();
  if(T.i === i) return ' tu-courante';
  return !faite(e, i) && T.i !== undefined && i > T.i ? ' tu-avenir' : '';
};
M.tutoLigne = function(e, i){
  if(!actif() || e.libre || e.piste) return '';
  var E = M.E(), mid = E.moments[e.m || 0], T = T0(), s = '';
  if(e.m !== undefined && D.MOMENTS[mid]) s += '<span class="tu-mi-m">' + (MOM_IC[mid] || '') + ' ' + esc(D.MOMENTS[mid].nom) + '</span>';
  if(T.i === i){
    var t = T.etat === 'attend' ? '⏳ ' + (e.attendT || '') : T.etat === 'moment' ? '⏳ C\'est pour ' + AU[mid] + '.' : T.etat === 'action' ? '⏳ Plus d\'action pour ce moment.' : '👉 C\'est maintenant !';
    s += '<span class="tu-mi-etat">' + esc(t) + '</span>';
  }
  return s;
};

/* ==========================================================
   7. Le rond lumineux, le gris, l'atelier : mis à jour après chaque rendu et quatre fois par seconde
   ========================================================== */
var ronds = [], derniereSig = null, derniereGuide = null, derniereOff = null, astuce = null, majHauteur = 0;
function rond(k){
  while(ronds.length <= k){
    var d = document.createElement('div');
    d.className = 'tu-rond'; d.hidden = true; d.setAttribute('aria-hidden', 'true');
    d.innerHTML = '<i class="tu-onde"></i><i class="tu-anneau"></i>';   /* (plus de « 👆 Ici ! », Romain, 5 novembre, 19 h 39 : le rond seul, bien animé) */
    document.body.appendChild(d); ronds.push(d);
  }
  return ronds[k];
}
/* Un message (le bandeau de l'atelier, « Mission validée ! ») passe toujours AU-DESSUS de la surbrillance (Romain, 5 novembre, 16 h 29) :
   tant qu'il est là, le rond qui le toucherait attend */
function messagesVisibles(){
  return qa('#atelier-ici .at-toast:not([hidden]), #toast.on').map(function(t){ return t.getBoundingClientRect(); }).filter(function(r){ return r.width > 2 && r.height > 2; });
}
/* Sur la carte, le nom d'un lieu et son « ✨ Nouveau ! » : le rond les entoure tous les deux (il ne passe plus sur l'écriture).
   La pancarte se balance (carte.css, ca-nouveau) : on prend sa place AU REPOS et toute la hauteur où elle se balance,
   pour que le rond garde la même taille (Romain, 5 novembre, 18 h 15 : « la zone jaune autour, c'est bizarre ») */
function rectRepos(n){
  try{
    var b = n.getBBox(), m = n.parentNode && n.parentNode.getScreenCTM && n.parentNode.getScreenCTM();
    if(!m || !b.width) return n.getBoundingClientRect();
    var xs = [b.x, b.x + b.width], ys = [b.y - 8, b.y + b.height], X = [], Y = [];
    xs.forEach(function(x){ ys.forEach(function(y){ X.push(m.a * x + m.c * y + m.e); Y.push(m.b * x + m.d * y + m.f); }); });
    var L = Math.min.apply(null, X), T = Math.min.apply(null, Y), R = Math.max.apply(null, X), B = Math.max.apply(null, Y);
    return {left:L, top:T, right:R, bottom:B, width:R - L, height:B - T};
  }catch(e){ return n.getBoundingClientRect(); }
}
function rectCible(el){
  var r = el.getBoundingClientRect(), g = el.closest && el.closest('g.ca-lieu'), n = g && g.querySelector('.ca-nouveau');
  if(el.classList && el.classList.contains('tu-respire')){   /* le bouton qui respire : le rond garde la taille du bouton au repos */
    var k = parseFloat(getComputedStyle(el).scale) || 1;
    if(k > 0 && Math.abs(k - 1) > .001){ var cx = (r.left + r.right) / 2, cy = (r.top + r.bottom) / 2, w = r.width / k, h = r.height / k; r = {left:cx - w / 2, top:cy - h / 2, right:cx + w / 2, bottom:cy + h / 2, width:w, height:h}; }
  }
  if(!n || !el.classList.contains('ca-etiq-lieu')) return r;
  var q = rectRepos(n); if(!q.width) return r;
  var L = Math.min(r.left, q.left), T = Math.min(r.top, q.top), R = Math.max(r.right, q.right), B = Math.max(r.bottom, q.bottom);
  return {left:L, top:T, right:R, bottom:B, width:R - L, height:B - T};
}
/* Le rond (Romain, 5 novembre, 18 h 15 : « le Ici, il saute, il n'est pas fluide ; il devrait être en bas ») :
   - il suit sa cible À CHAQUE IMAGE (plus par à-coups quatre fois par seconde) ;
   - il n'arrive qu'une fois la cible posée (une pastille qui rebondit en entrant, une fenêtre qui monte) : il apparaît alors en douceur ;
   - plus de « 👆 Ici ! » (19 h 39) : le rond seul, avec la même animation partout (il pulse, une onde part de lui). */
var derniersMsg = [], boucleRonds = 0;
var vises = [];
function poserRonds(els){
  var l = (els || []).filter(vuVraiment).slice(0, 4);
  derniersMsg = messagesVisibles();
  /* .tu-vise : ce que le rond entoure ; s'il brillait déjà de son propre cadre jaune (.b-guide, un talent à choisir), il n'en garde qu'un */
  vises.forEach(function(e){ if(l.indexOf(e) < 0) e.classList.remove('tu-vise', 'tu-respire'); });
  /* .tu-respire : le bouton lui-même bouge doucement, en plus du rond (Romain, 5 novembre, 23 h 32 : « il faut que le bouton soit animé ») ;
     pas les dessins de la carte (SVG : leur place est dans leur transform) */
  l.forEach(function(e){ e.classList.add('tu-vise'); if(!(e instanceof SVGElement)) e.classList.add('tu-respire'); });
  vises = l.slice();
  calerDefilement(l);
  for(var k = 0; k < Math.max(l.length, ronds.length); k++){
    var d = rond(k), el = l[k];
    if(!el){ d.hidden = true; d.__el = null; continue; }
    if(d.__el !== el){
      /* la même chose redessinée (même place) : le rond reste ; une autre cible : il attend qu'elle soit posée */
      var r0 = el.getBoundingClientRect(), a = d.__r;
      var pareil = d.__vu && a && Math.abs(r0.left - a.left) < 3 && Math.abs(r0.top - a.top) < 3 && Math.abs(r0.width - a.width) < 3 && Math.abs(r0.height - a.height) < 3;
      d.__el = el; d.__t0 = performance.now(); d.__depuis = d.__t0; d.__der = null;
      if(!pareil){ d.__vu = false; d.hidden = true; }
    }
    placer(d);
  }
  if(!boucleRonds && ronds.some(function(x){ return x.__el; })) boucleRonds = requestAnimationFrame(suivreRonds);
}
/* (Romain, 13 novembre : « la barre de scroll du bas arrive et s'en va de façon régulière » — dans le Grand Livre, sur « Les codes des moments »,
   et dans l'atelier) Le bouton qui respire grossit de 7 % : il déborde un instant de la boîte qui le contient, et cette boîte, qui peut défiler,
   montre sa barre de côté puis la cache. Tant qu'un bouton respire, les boîtes autour de lui qui n'ont rien à montrer de côté ne défilent
   plus de côté (classe tu-sans-x, tuto.css) ; elles défilent toujours de haut en bas. Aussi pour le rond de l'atelier (M.calerDefilement). */
var cales = [];
function boitesACaler(l){
  var garder = [];
  l.forEach(function(e){
    if(!e || !e.parentElement) return;
    var marge = Math.ceil(Math.max(e.offsetWidth || 0, 40) * .5) + 4;   /* (le bouton grossit de 7 % ; son onde, jusqu'à 45 %) */
    for(var a = e.parentElement; a; a = a.parentElement){
      if(garder.indexOf(a) >= 0) continue;
      var deja = a.classList.contains('tu-sans-x'), ox = deja ? 'auto' : getComputedStyle(a).overflowX;
      if(!deja && !/auto|scroll/.test(ox) && a !== document.documentElement && a !== document.body) continue;
      if(deja || a.scrollWidth <= a.clientWidth + marge) garder.push(a);
    }
  });
  return garder;
}
function calerDefilement(l){
  var garder = boitesACaler((l || []).filter(function(e){ return !(e instanceof SVGElement); }).concat(autresCales));
  cales.forEach(function(a){ if(garder.indexOf(a) < 0) a.classList.remove('tu-sans-x'); });
  garder.forEach(function(a){ a.classList.add('tu-sans-x'); });
  cales = garder;
}
var autresCales = [];
M.calerDefilement = function(els){ autresCales = (els || []).filter(Boolean); calerDefilement(vises); };
function suivreRonds(){
  boucleRonds = 0;
  var encore = false;
  ronds.forEach(function(d){ if(d.__el){ encore = true; try{ placer(d); }catch(e){} } });
  if(encore) boucleRonds = requestAnimationFrame(suivreRonds);
}
function placer(d){
  var el = d.__el;
  if(!el || !el.isConnected){ d.hidden = true; d.__el = null; return; }
  var r = rectCible(el), now = performance.now(), der = d.__der;
  /* (un bouton qui « respire » bouge d'un ou deux pixels sans arrêt : ce n'est pas arriver) */
  if(!der || Math.abs(r.left - der.left) > 2.5 || Math.abs(r.top - der.top) > 2.5 || Math.abs(r.width - der.width) > 2.5 || Math.abs(r.height - der.height) > 2.5) d.__depuis = now;
  d.__der = {left:r.left, top:r.top, width:r.width, height:r.height};
  if(!r.width && !r.height){ d.hidden = true; return; }
  if(!d.__vu){
    if(now - d.__depuis < 140 && now - d.__t0 < 650) return;   /* la cible bouge encore (elle arrive) : on attend qu'elle soit posée */
    d.__vu = true; d.__arrive = true;
  }
  var w = Math.max(r.width + 14, 46), h = Math.max(r.height + 14, 46);
  var x = r.left + r.width / 2 - w / 2, y = r.top + r.height / 2 - h / 2;
  var x0 = x - 6, x1 = x + w + 6, y0 = y - 6, y1 = y + h + 6;
  if(messagesVisibles().some(function(m){ return m.left < x1 && m.right > x0 && m.top < y1 && m.bottom > y0; })){ d.hidden = true; d.__vu = false; return; }   /* (à chaque image : le rond revient dès que le message s'en va) */
  var st = Math.round(w) + 'x' + Math.round(h) + '@' + Math.round(x) + ',' + Math.round(y);
  if(d.__st !== st){
    d.__st = st;
    d.style.width = Math.round(w) + 'px'; d.style.height = Math.round(h) + 'px';
    d.style.transform = 'translate(' + Math.round(x) + 'px,' + Math.round(y) + 'px)';
  }
  if(d.hidden){ d.hidden = false; if(d.__arrive){ d.classList.remove('tu-arrive'); void d.offsetWidth; d.classList.add('tu-arrive'); } }
  d.__arrive = false;
  d.__r = d.__der;
  d.classList.toggle('tu-secoue', Date.now() - secousse < 600);
}
/* La cible est cachée plus bas dans une fenêtre, une page du livre ou la carte : on la fait venir sous les yeux (pas plus d'une fois toutes les 2,5 s) */
var dernierDefil = {el:null, t:0};
function amener(els){
  if(!els || !els.length || els.some(vuVraiment)) return;
  var el = els[0];
  if(!el || !el.isConnected || !el.closest('.b-feuille, .lv-feuille, .ca-vue, .b-contenu, #atelier-ici')) return;
  if(dernierDefil.el === el && Date.now() - dernierDefil.t < 2500) return;
  dernierDefil = {el:el, t:Date.now()};
  try{ el.scrollIntoView({block:'center', inline:'center', behavior:'smooth'}); }catch(e){ try{ el.scrollIntoView(); }catch(e2){} }
}
function cacherTout(){
  ronds.forEach(function(d){ d.hidden = true; d.__el = null; d.__vu = false; });
  vises.forEach(function(e){ e.classList.remove('tu-vise', 'tu-respire'); }); vises = [];
  document.body.classList.remove('tu-guide');
  if(astuce) astuce.hidden = true;
  griser(null);
  guiderAtelier(null);
}
var atelierCible = undefined;
function guiderAtelier(c){
  if(c === 'bouton' || c === 'brasser' || c === 'regarde') c = null;   /* le bouton du panneau : c'est notre rond ; le chaudron ouvert : rien à entourer */
  if(c === atelierCible && (!c || !window.Atelier || !Atelier.guidage || Atelier.guidage() === c)) return;
  atelierCible = c;
  try{ if(window.Atelier && Atelier.guider) Atelier.guider(c || null);   /* quand c'est fait, l'atelier envoie 'atelier:guide-fait' (écouté plus haut) */ }catch(e){ console.error(e); }
}
/* Tout ce qui ne se touche pas maintenant est grisé */
function griser(G){
  var cle = G && G.bloque ? signature(G) + '|' + (G.d ? JSON.stringify(G.d) : '') + '|' + (UI.modal ? UI.modal.type + UI.modal.id : '') + '|' + (document.getElementById('app').childElementCount) : null;
  if(cle && cle === derniereOff) return;
  derniereOff = cle;
  qa('.tu-off').forEach(function(el){ el.classList.remove('tu-off'); });
  if(!G || !G.bloque || G.mj || G.pause) return;
  qa('#app [data-act], #voile [data-act]').forEach(function(el){
    if(el.closest('#carte-ici') || el.closest('.tu-bandeau') || el.classList.contains('on')) return;   /* la carte grise déjà elle-même ce qui est fermé ; l'onglet ouvert reste net */
    if(!permis(el, G)) el.classList.add('tu-off');
  });
}
function maj(rendu){
  var G = null;
  try{ G = guide(); }catch(e){ console.error(e); }
  if(!G){ cacherTout(); document.body.classList.remove('tu-hors'); return; }
  document.body.classList.toggle('tu-guide', !!G.bloque);
  /* la prochaine chose à toucher est un onglet : tout l'écran est grisé, il ne reste que le rond (Romain : « qu'un rond jaune ») */
  var P = M.P(), hors = !!(G.bloque && G.d && G.d.k === 'onglet' && !(G.plan.etat === 'fini' && !G.plan.bonus) && !UI.modal && UI.ecran === 'enquete' && P && (P.onglet === 'role' || P.onglet === 'carte'));
  document.body.classList.toggle('tu-hors', hors);
  /* le bandeau : il change sans redessiner l'écran (une page tournée, une fenêtre ouverte…) */
  var b = q('.b-entete .tu-bandeau'), sig = signature(G), sansB = sansBandeau(G), ent = q('.b-entete');
  if(sansB){ if(b){ b.remove(); b = null; hauteurEntete(); } }   /* une étape sans histoire : le bandeau s'en va (Romain, 23 h 32) */
  else if(!b && ent){ ent.insertAdjacentHTML('beforeend', M.bandeauTuto()); b = q('.b-entete .tu-bandeau'); hauteurEntete(); }   /* … et revient avec l'histoire */
  else if(b && b.getAttribute('data-sig') !== sig){
    b.className = 'tu-bandeau tu-' + G.plan.etat; b.setAttribute('data-sig', sig); b.innerHTML = contenuBandeau(G);
    hauteurEntete();
  }
  /* pas de bandeau à l'écran (l'écran du héros) : une petite astuce flottante */
  if(!b && !ent && G.bloque && !sansB){
    if(!astuce){ astuce = document.createElement('div'); astuce.id = 'tu-astuce'; document.body.appendChild(astuce); }
    if(astuce.getAttribute('data-sig') !== sig){ astuce.setAttribute('data-sig', sig); astuce.innerHTML = '<div class="tu-bandeau tu-' + esc(G.plan.etat) + '">' + contenuBandeau(G) + '</div>'; }
    astuce.hidden = false;
  } else if(astuce) astuce.hidden = true;
  hauteurEntete();
  griser(G);
  guiderAtelier(G.d && G.d.k === 'atelier' && M.P() && M.P().onglet === 'role' && !UI.modal ? G.d.c : null);
  if(!G.mj) amener(G.els);
  poserRonds(G.mj ? [] : G.els);
  derniereGuide = G;
}
/* La phrase du tutoriel change de longueur d'une étape à l'autre (une ligne, puis deux…) : le bandeau ne rapetisse plus,
   il garde la plus grande hauteur qu'il a eue à cette largeur d'écran ; sinon tout l'écran (et la carte) bougeait à chaque toucher
   (Romain, 5 novembre, 19 h 39 : « à chaque fois que j'appuie, il y a la carte qui saute ») */
var bandeauMax = {};
function bandeauStable(){
  /* (Romain, 5 novembre, 23 h 06 et 23 h 08) le bandeau ne garde plus la hauteur de son plus long message (il restait grand tout le
     temps) : il a toujours deux lignes (tuto.css, .tu-txt) ; un message plus long s'écrit un peu plus petit (--k, jusqu'à 86 %).
     La carte passe sous sa rangée (--h-bandeau, moteur.css) : elle ne bouge pas de toute façon. */
  [q('.b-entete .tu-bandeau'), q('#tu-astuce .tu-bandeau')].forEach(function(b){
    if(!b) return;
    if(b.style.minHeight) b.style.minHeight = '';
    var t = b.querySelector('.tu-txt'); if(!t) return;
    var k = 1; t.style.setProperty('--k', '1');
    while(k > .87 && t.scrollHeight > 33){ k = Math.round((k - .035) * 1000) / 1000; t.style.setProperty('--k', String(k)); }
  });
}
function hauteurEntete(){
  try{ bandeauStable(); }catch(e){}
  var h = q('.b-entete'); if(!h) return;
  try{ if(M.majBandeau) M.majBandeau(); }catch(e){}
  var v = Math.round(h.getBoundingClientRect().height);
  if(String(v) + 'px' === document.documentElement.style.getPropertyValue('--h-entete')) return;
  document.documentElement.style.setProperty('--h-entete', v + 'px');
  clearTimeout(majHauteur);
  majHauteur = setTimeout(function(){ try{ window.dispatchEvent(new Event('resize')); }catch(e){} }, 60);   /* les écrans plein écran se remesurent */
}
var rendreAvant = M.render;
if(typeof rendreAvant === 'function'){
  M.render = function(){
    var r = rendreAvant.apply(this, arguments);
    try{ derniereOff = null; maj(true); suivreUnMoment(); }catch(e){ console.error(e); }
    return r;
  };
}
/* La bulle de la carte s'ouvre ou se ferme sans redessiner la page (moteur-actions.js, M.rendreLeger) : le rond suit quand même tout de suite */
M.tutoMaj = function(){ try{ derniereOff = null; maj(true); suivreUnMoment(); }catch(e){ console.error(e); } };
setInterval(function(){ try{ if(M.S) maj(false); }catch(e){} }, 250);
/* Juste après un rendu : on recalcule tout de suite (la boucle de poserRonds suit ensuite la cible à chaque image) */
function suivreUnMoment(){ try{ if(derniereGuide && !derniereGuide.mj) poserRonds(derniereGuide.els); }catch(e){} }
window.addEventListener('scroll', function(){ try{ if(derniereGuide) poserRonds(derniereGuide.mj ? [] : derniereGuide.els); }catch(e){} }, true);

/* ==========================================================
   8. Enquête 2 : le talent du niveau 2 d'abord
   ========================================================== */
function talentForce(){
  if(window.BRUMEVAL_SANS_TUTO) return false;
  var E = enJeu();
  return !!(E && E.id === 2 && M.talentsEnAttente && M.talentsEnAttente().indexOf(2) >= 0);
}
M.tutoTalentForce = talentForce;
})();
