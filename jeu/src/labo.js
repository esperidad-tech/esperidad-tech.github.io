/* ==========================================================
   Brumeval — le labo d'analyses de l'Alchimiste, dans le jeu (Romain, 10 novembre, 17 h 18 : « il faut brancher ce nouveau labo
   dans les enquêtes » ; Bible §12.51, « Le labo dans le jeu »).

   Le labo lui-même est une page à part : src/labo/ (les morceaux de la maquette), assemblée par build.py dans window.LABO_HTML.
   On l'ouvre dans un cadre, en plein écran, par-dessus l'atelier : ses dessins, ses styles et ses sons restent chez lui,
   rien ne se mélange avec le jeu. Le jeu et le labo se parlent par de petits messages (postMessage).

   · Une enquête passe par le labo quand elle a une fiche : E.labo = ['fil', 'poils', 'plume'] (les objets que le labo sait analyser ;
     leurs fiches d'analyse sont dans src/labo/30-donnees.js). Sans fiche (enquêtes 2 et 3, pour l'instant) : l'ancien panneau d'analyse.
   · M.laboDispo() : cette enquête passe-t-elle par le labo ?   · M.ouvrirLabo() : l'atelier l'appelle (bulle « 🔬 Analyser »).
   · Le jeu envoie au labo (window.LABO_CFG, écrit dans la page du cadre) : les objets reçus, dans l'ordre (recus), ceux déjà analysés (faits),
     ce qu'on y avait déjà trouvé (etat = P.labo), les vrais codes (codes), la paillasse et le mur de l'atelier (style), les sons, le chat.
   · Le labo répond : « etat » (on le garde dans P.labo), « fini » (un dossier est bouclé : l'analyse est faite, comme après un mini-jeu réussi),
     « trouve » (une trouvaille en plus : une petite note au Carnet), « lire » (un bouton 🔊 : jamais de lecture toute seule), « quitter ».
   · Pas de cœurs et pas d'échec au labo (Romain, version 5) : une analyse n'est jamais « ratée », on peut revenir la finir.
   · En quittant le labo : la fiche « découverte » habituelle (le texte, son 🔊, le code à donner s'il y en a un).
   Chargé APRÈS moteur-actions.js.
   ========================================================== */
(function(){
'use strict';
var M = window.M, D = window.DONNEES;
if(!M) return;
var CADRE = 'labo-cadre', aMontrer = [];
var ROLES = {pisteur:'le Pisteur', alchimiste:'l\'Alchimiste', barde:'le Barde', sage:'le Sage'};
function enquete(){ try{ return M.S && M.S.e ? M.E() : null; }catch(e){ return null; } }
M.laboDispo = function(){ var E = enquete(); return !!(window.LABO_HTML && E && Array.isArray(E.labo) && E.labo.length && M.P && M.P()); };
/* Les objets reçus que le labo sait analyser, dans l'ordre où ils sont arrivés (quatre places sur le carré de cuir).
   Plus de quatre (l'enquête 2 en a six) : ceux qui restent à analyser d'abord, puis les derniers analysés. */
function recus(){
  var E = M.E(), P = M.P();
  var l = M.cle(P.recus).filter(function(k){ return k.indexOf('obj:') === 0 && E.labo.indexOf(k.slice(4)) >= 0 && E.objets && E.objets[k.slice(4)]; }).map(function(k){ return k.slice(4); });
  if(l.length <= 4) return l;
  var aFaire = l.filter(function(id){ return !P.analyses[id]; }), faits = l.filter(function(id){ return !!P.analyses[id]; });
  var garde = aFaire.slice(0, 4).concat(faits.slice(-Math.max(0, 4 - aFaire.length)));
  return l.filter(function(id){ return garde.indexOf(id) >= 0; });   /* (toujours dans l'ordre d'arrivée : chacun garde sa place) */
}
/* Pour qui est un code (« pour le Barde ») */
function pourQui(code){
  var E = M.E(), q = String(code).split(':'), n = q[0] === 'info' ? (E.infos || {})[q[1]] : (q[0] === 'obj' ? (E.objets || {})[q[1]] : null), p = n && n.pour;
  return p && ROLES[p] ? 'pour ' + ROLES[p] : 'pour l\'équipe';
}
/* La paillasse et le mur choisis dans l'atelier : le labo les reprend (5 formes × 8 couleurs chacun) */
function style(){
  var a = M.S.atelier || {}, pa = (a.objets || []).filter(function(o){ return o.id === 'pa'; })[0], st = pa ? (pa.st || 0) : 0, fond = (a.deco || {}).fond || 0;
  return {paF:st % 5, paT:st % 8, murF:fond % 5, murT:fond % 8};
}
function aUnChat(){ var a = M.S.atelier || {}; return (a.objets || []).some(function(o){ return o.t === 'chat'; }); }
function fiche(){
  var E = M.E(), P = M.P(), S = M.S, l = recus(), codes = {};
  l.forEach(function(id){ var An = M.texteAnalyse((E.analyses || {})[id]); if(An && An.donne){ try{ codes[id] = {pour:pourQui(An.donne), formes:M.code(An.donne).map(function(s){ return D.SYM[s].e; })}; }catch(e){} } });
  /* le tutoriel (enquête 1) suit sa trame : un échantillon dont ce n'est pas encore le tour attend sur le cuir (« Plus tard ! ») */
  var plusTard = l.filter(function(id){ return !P.analyses[id] && M.tutoPermet && !M.tutoPermet('analyser', {id:id}); });
  /* (Romain, 11 novembre, 13 h 42) intro : l'explication en images, la toute première fois (une fois par héros) ;
     guide : au tutoriel, tant qu'aucune analyse n'est faite, le labo guide la première (le premier échantillon dont c'est le tour) */
  var aucune = !Object.keys(P.analyses || {}).some(function(k){ return P.analyses[k]; });
  var guide = (M.tutoActif && M.tutoActif() && aucune) ? (l.filter(function(id){ return !P.analyses[id] && plusTard.indexOf(id) < 0; })[0] || null) : null;
  return {jeu:true, niveau:(E.niveau || 1) >= 6 ? 'difficile' : 'facile', recus:l, faits:l.filter(function(id){ return !!P.analyses[id]; }), plusTard:plusTard, etat:P.labo || null,
    codes:codes, style:style(), son:!(S.options && S.options.son === false), mimi:aUnChat(), intro:!S.laboIntro, guide:guide,
    /* (enquête 3) le Livre d'or de la fête est posé sur la paillasse : le Sage a donné le code « Les écritures du village » */
    livredor:!!P.recus['info:ecritures']};
}
/* Un dossier est bouclé : l'analyse est faite (les mêmes effets qu'une analyse réussie, moteur-actions.js A.analyser) */
function fini(id){
  var P = M.P(), E = M.E(), An = M.texteAnalyse((E.analyses || {})[id]);
  if(!P || !An || P.analyses[id] || !E.objets[id]) return;
  var detail = false;
  if(An.detail && M.acces('detail')){
    var max = M.fxSomme('detail');
    if((P.usages.detail || 0) < max){ P.usages.detail = (P.usages.detail || 0) + 1; detail = true; }
  }
  P.analyses[id] = detail ? 2 : 1;
  if(An.note) M.noter(An.note, E.objets[id].ic);
  if(detail) M.noter(An.detail.note, '🔍');
  M.sauver();
  aMontrer.push({ic:E.objets[id].ic, titre:'Analyse : ' + E.objets[id].nom, t:An.t + (detail ? ' Et ce n\'est pas tout : ' + An.detail.t : ''), code:An.donne || null});
}
/* Une trouvaille en plus (pas obligatoire) : une petite note au Carnet, une seule fois (E.laboNotes = {noir:'…', or:'…'}) */
function trouve(id){
  var E = M.E(), P = M.P(), n = (E.laboNotes || {})[id];
  if(!n || !P) return;
  P.laboVus = P.laboVus || {};
  if(P.laboVus[id]) return;
  P.laboVus[id] = 1; M.noter(n, '🔬'); M.sauver();
}
function cadre(){ return document.getElementById(CADRE); }
M.laboOuvert = function(){ return !!cadre(); };
M.ouvrirLabo = function(){
  if(!M.laboDispo() || cadre()) return false;
  M.stop && M.stop();
  var f = document.createElement('iframe');
  f.id = CADRE; f.className = 'labo-cadre'; f.setAttribute('title', 'La paillasse d\'analyse'); f.setAttribute('allow', 'autoplay; fullscreen');
  /* la fiche est écrite dans la page du cadre, avant ses programmes (« < » échappé : rien ne peut fermer la balise) */
  var cfg = JSON.stringify(fiche()).replace(/</g, '\\u003c');
  f.srcdoc = '<!doctype html><html lang="fr"><head><meta charset="utf-8"><script>window.LABO_CFG = ' + cfg + ';<\/script></head><body>' + window.LABO_HTML + '</body></html>';
  document.body.appendChild(f);
  document.documentElement.classList.add('labo-ouvert');
  try{ f.focus(); }catch(e){}
  return true;
};
/* On referme le labo : l'atelier se remet à jour, puis la fiche de ce qu'on vient de découvrir (une par analyse bouclée, l'une après l'autre) */
function suivante(){
  var m = aMontrer.shift();
  if(!m) return;
  M.decouvrir(m);
}
M.fermerLabo = function(){
  var f = cadre();
  if(!f) return;
  f.remove();
  document.documentElement.classList.remove('labo-ouvert');
  M.sauver();
  if(aMontrer.length) suivante(); else M.render();
};
/* (la fiche suivante, quand on a bouclé plusieurs analyses d'un coup : elle arrive quand on ferme la précédente) */
var fermer0 = M.fermer;
M.fermer = function(){
  var r = fermer0.apply(this, arguments);
  if(aMontrer.length && !cadre()) setTimeout(function(){ if(!cadre() && !(M.UI && M.UI.modal)) suivante(); }, 350);
  return r;
};
/* Le vieux bouton « 🔬 Analyser » (une liste hors de l'atelier, un robot d'essai) : dans une enquête qui passe par le labo,
   il ouvre le labo. Une analyse ne peut donc jamais se faire sans passer par la paillasse. */
if(M.A && M.A.analyser){
  var analyser0 = M.A.analyser;
  M.A.analyser = function(el){
    var E = enquete(), id = el && el.dataset ? el.dataset.id : null;
    if(M.laboDispo() && id && E.labo.indexOf(id) >= 0){ M.ouvrirLabo(); return; }
    return analyser0.apply(this, arguments);
  };
}
window.addEventListener('message', function(e){
  var m = e.data, f = cadre();
  if(!m || m.labo !== 1 || !f || e.source !== f.contentWindow) return;
  var P = M.P && M.P();
  if(!P) return;
  if(m.type === 'etat'){ if(m.etat && typeof m.etat === 'object'){ P.labo = m.etat; M.sauver(); } }
  else if(m.type === 'fini'){ fini(String(m.id)); }
  else if(m.type === 'trouve'){ trouve(String(m.id)); }
  else if(m.type === 'lire'){ if(m.t) M.lire(String(m.t)); }
  else if(m.type === 'introVue'){ M.S.laboIntro = 1; M.sauver(); }   /* (l'explication en images ne revient plus pour ce héros) */
  else if(m.type === 'quitter'){ if(m.etat && typeof m.etat === 'object') P.labo = m.etat; M.fermerLabo(); }
});
})();
