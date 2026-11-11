/* ==========================================================
   Brumeval — salle d'entraînement : tous les mini-jeux en accès
   direct, avec le choix de la difficulté, pour les régler.
   ========================================================== */
(function(){
'use strict';
var ROLES = [
  {id:'pisteur', nom:'Pisteur', ic:'🏹', c:'var(--c-pisteur)'},
  {id:'alchimiste', nom:'Alchimiste', ic:'⚗️', c:'var(--c-alchimiste)'},
  /* (plus de jeux du Barde : Romain, 5 novembre, 19 h 31 et 21 h 46) */
  {id:'sage', nom:'Sage', ic:'📜', c:'var(--c-sage)'}
];
/* (plus de case « Avec des aides » : Romain, 5 novembre, 21 h 46 ; on joue toujours sans) */
var etat = {niveau:3, aides:false, journal:[]};
try{ var t = JSON.parse(localStorage.getItem('brumeval-salle') || 'null'); if(t){ etat.niveau = t.niveau || 3; etat.journal = t.journal || []; } }catch(e){}
function sauver(){ try{ localStorage.setItem('brumeval-salle', JSON.stringify(etat)); }catch(e){} }
function esc(s){ return String(s).replace(/[&<>"']/g, function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]; }); }
/* Recalibrage (Romain, 4 novembre) : le niveau choisi est le niveau brut du jeu, sans le calibrage décidé (1 = le plus facile, 10 = le plus dur) */
var LEGENDE = {1:'Le plus facile', 10:'Le plus dur'};
/* Jeux retirés du jeu (remplacés) : on ne les montre plus */
var RETIRES = {ordre:1, temperature:1, rythme:1, loupe:1, ragots:1};   /* ragots : abandonné (Romain, 5 novembre, 9 h 03) */
/* Variantes à essayer : mêmes règles et même difficulté, seulement le décor et le fuyard changent */
var VARIANTES = {
  poursuite:[{id:'chien', ic:'🐕', nom:'Course-poursuite : le petit chien', d:'Variante forêt (enquête 1)', params:{fuyard:'chien', decor:'foret'}},
    {id:'oie', ic:'🦢', nom:'Course-poursuite : l\'oie de Gaspard', d:'Variante ville (enquête 3)', params:{fuyard:'oie', decor:'ville'}}],
  /* Romain, 6 novembre, 2 h 34 : des variantes de décor */
  /* (10 novembre, 20 h 44 : la même partie que dans l'enquête 1 — les bottes du jardinier au départ, les petites traces jusqu'à la forêt) */
  traces:[{id:'ville', ic:'🏘️', nom:'Suivre la piste : le massif de la mairie', d:'Les petites traces vont jusqu\'à la forêt (enquête 1)',
    params:{decor:'ville', suspect:'enfant', compagnon:'botte', arrivee:'foret', arriveeTxt:'Dans la forêt !', compagnonTxt:'Les bottes du jardinier…',
      departTitre:'Retiens bien ces petites traces', departNom:'Petites traces toutes fraîches', departTxt:'Au départ, de grosses bottes marchent avec elles. Ne suis que les petites !'}},
    /* (enquête 3) les traces de Moustache jusqu'à la crypte : avec le code « Moustache a six doigts », puis sans (le lait cache ses doigts) */
    {id:'chat6', ic:'🐾', nom:'Suivre la piste : Moustache (six doigts)', d:'Avec le code du Sage (enquête 3)', params:{decor:'ville', suspect:'chat', chercher:10, arrivee:'crypte', arriveeTxt:'La porte de la crypte !',
      departTitre:'Retiens bien cette trace', departNom:'Moustache : six doigts !', departTxt:'Compte bien ses doigts : aucun autre chat n\'en a autant.'}},
    {id:'chat', ic:'🥛', nom:'Suivre la piste : Moustache (sans le code)', d:'Le lait cache ses doigts (enquête 3)', params:{decor:'ville', suspect:'chat', chercher:10, arrivee:'crypte', arriveeTxt:'La porte de la crypte !', carteFloue:true,
      departTitre:'Retiens bien cette trace', departNom:'Une patte de chat, dans le lait', departTxt:'Le lait cache ses doigts… Et au village, il y a plein de chats !'}},
    /* (enquête 3) « Suivre la poussière » : la piste de l'Alchimiste jusqu'au rond des vesses-de-loup */
    {id:'poussiere', ic:'🍄', nom:'Suivre la poussière : les vesses-de-loup', d:'La piste de l\'Alchimiste (enquête 3)', params:{decor:'foret', suspect:'poussiere', arrivee:'vesses', arriveeTxt:'Le rond des vesses-de-loup !',
      departTitre:'Retiens bien cette trace', departNom:'La poussière des vesses-de-loup', departTxt:'Une fine poussière brune, que le champignon crache quand un lièvre l\'écrase.'}}],
  cachette:[{id:'foret', ic:'🌲', nom:'Se cacher : la forêt', d:'Passer derrière Silas (enquête 2)', params:{decor:'foret'}},
    {id:'moulin', ic:'🌾', nom:'Se cacher : le moulin', d:'La nuit au moulin (enquête 2)', params:{decor:'moulin'}},
    {id:'clocher', ic:'🔔', nom:'Se cacher : le clocher', d:'Jusqu\'à la Grosse Marie et la clé (enquête 3)', params:{decor:'clocher'}},
    {id:'mairie', ic:'🏛️', nom:'Se cacher : la mairie', d:'Jusqu\'au bureau du maire et la lettre (enquête 3)', params:{decor:'mairie'}}],
  tir:[{id:'cerfvolant', ic:'🪁', nom:'Tir à l\'arc : le cerf-volant', d:'Coincé en haut du clocher (enquête 2)', params:{decor:'cerfvolant'}},
    {id:'banderoles', ic:'🎏', nom:'Tir à l\'arc : les banderoles', d:'Décorer la place pour la fête (enquête 3)', params:{decor:'banderoles'}}]
};
var MODS_AIDES = {erreurs:1, zone:1.25, lent:0.85, aide:1, temps:3, pouce:1};
/* Jeux en cours de refonte : visibles mais pas encore jouables */
var EN_TRAVAUX = {};
/* Où en est chaque jeu : ✅ validé · 🎯 réglage décidé, à retester · 🟡 modifié, pas encore testé · 🔨 en fabrication
   Les jeux ✅ et 🎯 se lancent toujours avec le réglage décidé ensemble (celui de l'enquête 1), sans les réglages de test. */
/* 🔁 À recalibrer (4 novembre) : tous les jeux se relancent au niveau choisi, sans le calibrage, pour tout régler à nouveau */
var STATUT = {
  traces:'🔁', poursuite:'🔁', cachette:'🔁', tir:'🔁',
  bulles:'🔁', melange:'🔁', chaudron:'🔁', differences:'🔁', double:'🔁', insectes:'🔁',
  gateau:'🟡',   /* le gâteau de la fête (11 novembre) : tout neuf, à essayer par Romain ; la difficulté choisie n'y change rien */
  mensonge:'🔁', mots:'🔁', depositions:'🔁',
  alphabet:'🔁', plans:'🔁', grille:'🔁', runes:'🔁'
};
var NOM_STATUT = {'🔁':'À recalibrer : la difficulté choisie compte', '✅':'Validé', '🎯':'À retester avec le réglage décidé', '🟡':'Modifié, pas encore testé', '🔨':'En fabrication'};
/* le niveau de ce jeu à l'enquête 1, pour un enfant et pour un adulte (mj-core.js : MJ.COURBE) */
function niveauActuel(k){
  if(!MJ.niveauPour) return '';
  return 'niveau ' + MJ.niveauPour(k, 1, 'adulte') + ' pour tous · enquête 2 : enfant ' + MJ.niveauPour(k, 2, 'enfant') + ', adulte ' + MJ.niveauPour(k, 2, 'adulte');
}
function regleDecide(k){ return !!(MJ.CALIBRAGE && MJ.CALIBRAGE[k]) && (STATUT[k] === '🎯' || STATUT[k] === '✅'); }

function rendre(){
  var app = document.getElementById('salle');
  var s = '<nav class="sl-liens"><a href="https://esperidad-tech.github.io/">← Les projets de Romain</a><a href="mini-jeux.html">📋 Le point sur les mini-jeux</a><a href="./">🏮 Jouer à Brumeval</a></nav>' +
    '<header class="sl-tete"><h1>Salle d\'entraînement</h1><p class="sl-sous">Tous les mini-jeux de Brumeval, sans passer par l\'enquête. Le choix de la difficulté sert seulement à régler les jeux : dans le jeu, elle suit le numéro de l\'enquête et l\'équipement du héros.</p></header>';
  s += '<p class="sl-statuts">' + Object.keys(NOM_STATUT).map(function(k){ return '<span>' + k + ' ' + NOM_STATUT[k] + '</span>'; }).join('') + '</p>';
  s += '<section class="sl-reglages"><div class="sl-niveaux"><span class="sl-etiq">Difficulté</span><div class="sl-boutons">';
  for(var n = 1; n <= 10; n++) s += '<button class="sl-niv' + (etat.niveau === n ? ' on' : '') + '" data-niv="' + n + '">' + n + '</button>';
  s += '</div><p class="sl-legende">' + esc('Niveau ' + etat.niveau + (LEGENDE[etat.niveau] ? ' : ' + LEGENDE[etat.niveau].toLowerCase() : '') + '. C\'est le niveau brut du jeu, sans le réglage actuel.') + '</p></div>' +
    '</section>';
  ROLES.forEach(function(r){
    var jeux = Object.keys(MJ.TYPES).filter(function(k){ return MJ.TYPES[k].role === r.id && !RETIRES[k]; });
    if(!jeux.length) return;
    s += '<section class="sl-role" style="--c:' + r.c + '"><h2>' + r.ic + ' ' + r.nom + '</h2><div class="sl-jeux">';
    jeux.forEach(function(k){
      var d = MJ.TYPES[k], dernier = etat.journal.filter(function(j){ return j.type === k; }).slice(-1)[0];
      if(EN_TRAVAUX[k]){ s += '<div class="sl-jeu sl-travaux"><span class="sl-jeu-ic">🚧</span><b>' + esc(d.nom || k) + '</b><small>' + esc(EN_TRAVAUX[k]) + '</small></div>'; return; }
      var st = STATUT[k] || '🟡';
      s += '<button class="sl-jeu" data-jeu="' + k + '"><span class="sl-statut" title="' + esc(NOM_STATUT[st]) + '">' + st + '</span><span class="sl-jeu-ic">' + (d.ic || '🎲') + '</span><b>' + esc(d.nom || k) + '</b>' +
        (regleDecide(k) ? '<small class="sl-cal">Réglage décidé (enquête 1) : le choix de difficulté et les aides ne comptent pas</small>' :
          '<small class="sl-cal">Enquête 1 : ' + esc(niveauActuel(k)) + '</small>' +
          (dernier ? '<small>' + (dernier.ok ? '✔ réussi' : '✖ raté') + ' au niveau ' + dernier.n + '</small>' : '<small>pas encore joué</small>')) + '</button>';
      /* variantes du même jeu (mêmes réglages, autre décor), ex. le petit chien dans la forêt (E1) */
      (VARIANTES[k] || []).forEach(function(v){
        s += '<button class="sl-jeu sl-variante" data-jeu="' + k + '" data-var="' + v.id + '"><span class="sl-statut">' + st + '</span><span class="sl-jeu-ic">' + v.ic + '</span><b>' + esc(v.nom) + '</b><small>' + esc(v.d) + '</small></button>';
      });
    });
    s += '</div></section>';
  });
  if(etat.journal.length){
    s += '<section class="sl-journal"><h2>Mes parties</h2><ol>' + etat.journal.slice(-12).reverse().map(function(j){
      var d = MJ.TYPES[j.type] || {};
      var k = etat.journal.indexOf(j);
      return '<li>' + (j.ok ? '✔' : '✖') + ' ' + esc(d.nom || j.type) + ' · niveau ' + j.n + (j.aides ? ' · avec aides' : '') + (j.essais > 1 ? ' · ' + j.essais + ' essais' : '') +
        (j.revision ? ' <button class="btn second petit" data-relire="' + k + '">🔁 Relire</button>' : '') + '</li>';
    }).join('') + '</ol><button class="btn second petit" data-effacer="1">Effacer la liste</button></section>';
  }
  app.innerHTML = s;
}
function relire(k){
  var j = etat.journal[k]; if(!j || !j.revision || !window.Revision) return;
  var plein = document.getElementById('sl-plein');
  plein.innerHTML = '<button class="sl-quitter">← Retour à la salle</button><div class="sl-cadre sl-relire"><div class="sl-rv"></div></div>';
  plein.hidden = false; plein.classList.add('sl-defile'); document.body.classList.add('sl-bloque');
  Revision.monter(plein.querySelector('.sl-rv'), j.revision, sauver);
  plein.querySelector('.sl-quitter').onclick = function(){ plein.hidden = true; plein.innerHTML = ''; plein.classList.remove('sl-defile'); document.body.classList.remove('sl-bloque'); rendre(); };
}
function jouer(type, varId){
  var plein = document.getElementById('sl-plein');
  plein.innerHTML = '<button class="sl-quitter">← Retour à la salle</button><div class="sl-cadre"></div>';
  plein.hidden = false; document.body.classList.add('sl-bloque');
  /* Réglage décidé : on joue exactement comme dans l'enquête 1, sans aides de test */
  var decide = regleDecide(type), niveau = decide ? 3 : etat.niveau, avecAides = decide ? false : etat.aides;
  var mods = avecAides ? MODS_AIDES : {};
  var params = MJ.reglages(type, niveau, Object.assign({}, mods), {brut:!decide});   /* à recalibrer : le niveau choisi, sans le calibrage */
  var vr = (VARIANTES[type] || []).filter(function(v){ return v.id === varId; })[0];
  if(vr) Object.keys(vr.params).forEach(function(k){ params[k] = vr.params[k]; });
  var aides = avecAides ? [{ic:'🎒', nom:'Équipement et talents de héros', effet:'une erreur de plus, zones plus larges, un peu plus lent'}] : [];
  var partie = MJ.lancer(plein.querySelector('.sl-cadre'), type, params, function(res){
    etat.journal.push({type:type, n:decide ? 'décidé' : niveau, ok:!!res.reussi, aides:avecAides, essais:res.essais || 1, revision:res.revision || null});
    if(etat.journal.length > 30) etat.journal = etat.journal.slice(-30);
    sauver(); fermer();
  }, {aides:aides, lireAuto:false, details:true, titre:vr ? vr.nom : undefined});
  plein.querySelector('.sl-quitter').onclick = function(){ try{ partie.arreter(); }catch(e){} fermer(); };
  function fermer(){ plein.hidden = true; plein.innerHTML = ''; document.body.classList.remove('sl-bloque'); rendre(); }
}
document.addEventListener('click', function(ev){
  var b = ev.target.closest('[data-niv],[data-jeu],[data-effacer],[data-relire]');
  if(!b) return;
  if(b.dataset.niv){ etat.niveau = +b.dataset.niv; sauver(); rendre(); }
  else if(b.dataset.jeu) jouer(b.dataset.jeu, b.dataset.var);
  else if(b.dataset.relire !== undefined){ relire(+b.dataset.relire); }
  else if(b.dataset.effacer){ etat.journal = []; sauver(); rendre(); }
  try{ if(window.Brume) Brume.son('clic'); }catch(e){}
});
/* Un lien direct vers un jeu et sa difficulté (la page « Le point sur les mini-jeux », 5 novembre) : salle.html#jeu=poursuite&n=5&v=chien */
function lienDirect(){
  var h = String(location.hash || '').replace(/^#/, ''); if(!h) return;
  var q = {}; h.split('&').forEach(function(x){ var p = x.split('='); if(p[0]) q[decodeURIComponent(p[0])] = decodeURIComponent(p[1] || ''); });
  if(!q.jeu || !MJ.TYPES[q.jeu] || RETIRES[q.jeu]) return;
  etat.niveau = Math.max(1, Math.min(10, Math.round(+q.n) || etat.niveau)); sauver(); rendre();
  try{ history.replaceState(null, '', location.pathname + location.search); }catch(e){}   /* (revenir à la salle ne relance pas le jeu) */
  jouer(q.jeu, q.v || null);
}
function demarrer(){ rendre(); lienDirect(); }
window.addEventListener('hashchange', lienDirect);
if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', demarrer); else demarrer();
})();
