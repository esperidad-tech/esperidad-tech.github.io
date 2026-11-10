/* demo.js — carte-demo.html : la carte du Pisteur (carte.js), la brume qui se lève lieu par lieu, et qu'on fait glisser.
   Ce n'est pas le moteur (un autre chantier) : seulement de quoi voir et essayer CARTE_DONJON.vue.
   - « Lieu suivant » : l'équipe va au lieu suivant du chemin long (culs-de-sac compris) et la brume s'y lève ;
   - les chevrons dorés : aller par là (comme le fera le moteur) ;
   - toucher un lieu découvert : le conteur dit son nom (avec 🔊). */
(function(){
'use strict';
var C = window.CARTE_DONJON, PG = window.PAGE, q = PG.q, esc = PG.esc;
var TOUR = ['galerie', 'aeration', 'rats', 'reserve', 'canaux', 'egouts', 'givre', 'toiles', 'eboulis', 'atelier', 'bibliotheque', 'portes', 'crypte', 'ossuaire', 'camp', 'bassin', 'porte4', 'leo'];
var PHRASES = {
  puits:'Trois passages s’enfoncent dans la brume… Par où aller ?',
  galerie:'Des éboulis, rien que des éboulis… Et une bourse qui brille !',
  aeration:'Un rayon de lune tombe par une grille. Des herbes y poussent.',
  rats:'Des yeux jaunes dans le noir… La salle des rats !',
  reserve:'Un vieux coffre, et deux carquois.',
  canaux:'L’eau de la ville d’avant coule sous un petit pont.',
  egouts:'Ce couloir tourne… et tourne… et revient au même endroit !',
  givre:'Il fait froid ici. Une fleur de givre brille au fond.',
  toiles:'Des toiles partout. Quelque chose bouge là-haut…',
  eboulis:'Un tas d’os, et un crâne gravé dans la paroi.',
  dalles:'Des dalles claires, des dalles sombres… Attention où on marche !',
  atelier:'Des engrenages, des établis… et un grand gardien de rouille.',
  bibliotheque:'Des livres qui flottent sur l’eau qui luit.',
  portes:'Trois portes : un œil, une gueule, une lune.',
  crypte:'Une fausse crypte… et un sarcophage.',
  ossuaire:'Des crânes dans des niches. Un roi y règne.',
  camp:'Un feu de camp ! On souffle un peu.',
  bassin:'Une eau sombre et immobile. Quelque chose respire dessous…',
  porte4:'Une grande porte ronde, avec quatre signes. Un chat gratte au bas de la porte.',
  leo:'Une lanterne qui bouge, tout au fond…'
};
var V, ici = 'puits', occupe = false, etape = 0;
function conte(t){ var b = q('#bulle'); b.innerHTML = '<span>' + esc(t) + '</span>' + PG.lireBtn(t); b.classList.remove('pop'); void b.offsetWidth; b.classList.add('pop'); }
/* les déplacements d'un lieu à un lieu voisin (en passant par l'embranchement si besoin) */
function pas(de, vers){
  var v = C.voisins(de, {sansFermees:true}).filter(function(x){ return x.lieu === vers; })[0];
  if(!v) return null;
  var out = [];
  if(v.via) out.push({lien:v.via, depuis:de, vers:'J'});
  out.push({lien:v.lien, depuis:v.via ? 'J' : de, vers:vers});
  return out;
}
function bouger(moves){
  var p = Promise.resolve();
  moves.forEach(function(m){
    p = p.then(function(){
      var L = C.LIEN[m.lien], dest = m.vers;
      /* la boucle des égouts : on en fait le tour et on revient */
      if(L.boucle) return V.decouvrir(L.salle).then(function(){ return V.deplacer(m.lien, m.depuis, {duree:2600}); }).then(function(){ return V.deplacer(m.lien, m.depuis, {t0:1, t1:1, vers:m.depuis, duree:300}); });
      if(L.salle && L.salle !== dest) V.decouvrir(L.salle);
      var d = V.deplacer(m.lien, m.depuis, {vers:dest});
      setTimeout(function(){ V.decouvrir(dest); }, 250);
      return d;
    });
  });
  return p;
}
function aller(vers){
  if(occupe) return Promise.resolve();
  var ch = C.chemin(ici, vers, {}); if(!ch) return Promise.resolve();
  var moves = [];
  for(var i = 0; i + 1 < ch.length; i++){ var m = pas(ch[i], ch[i + 1]); if(m) moves = moves.concat(m); }
  occupe = true; V.sorties([]);
  return bouger(moves).then(function(){
    var fin = C.LIEUX[vers] && C.LIEUX[vers].boucle ? ch[ch.length - 2] : vers;
    ici = fin; occupe = false;
    conte(PHRASES[vers] || C.LIEUX[vers].nom);
    montrerSorties();
  });
}
function montrerSorties(){
  var l = C.voisins(ici).filter(function(v){ return !v.fermee; }).map(function(v){ return {lien:v.via || v.lien, depuis:ici, t:C.LIEN[v.via || v.lien].boucle ? .1 : .42, vers:v.lieu, nom:'Vers ' + (C.LIEUX[v.lieu] ? C.LIEUX[v.lieu].nom : 'la suite')}; });
  /* un seul chevron par couloir */
  var vu = {}; l = l.filter(function(s){ if(vu[s.lien]) return false; vu[s.lien] = 1; return true; });
  V.sorties(l, function(s){
    PG.son('tic');
    var cible = s.vers;
    /* par l'embranchement : on choisit la suite là-bas, alors on va au lieu le plus proche de ce côté */
    aller(cible);
  });
}
function suivant(){
  if(occupe) return;
  while(etape < TOUR.length && V.brume.estVu(TOUR[etape])) etape++;
  if(etape >= TOUR.length){ conte('Tout le chemin long est découvert. Le Sage avait raison !'); return; }
  PG.son('tic');
  aller(TOUR[etape]);
}
function toutMontrer(){
  if(occupe) return;
  PG.son('tic');
  C.ORDRE.forEach(function(k){ V.decouvrir(k, {anim:false}); });
  ['vieux'].forEach(function(k){ V.decouvrirLien(k, 0, 1); });
  conte('Tout le donjon, sans la brume (pour vérifier).');
}
function recommencer(){
  if(occupe) return;
  PG.son('tic');
  V.brume.oublier(); ici = 'puits'; etape = 0;
  V.pion('puits'); V.decouvrir('puits', {anim:false}); V.centrer('puits', {anim:true});
  conte(PHRASES.puits); montrerSorties();
}
function demarrer(){
  PG.orientation();
  q('#rose').src = C.svgURL(C.roseSVG());
  var t0 = performance.now();
  V = C.vue(q('#carte'), {
    surToucher:function(x, y, id){
      if(id && V.brume.estVu(id)) conte(C.LIEUX[id].nom + '. ' + (PHRASES[id] || ''));
      else conte('La brume cache tout, par ici… Le plan du Sage sait peut-être ce qu’il y a dessous.');
    },
    pret:function(){ window.DEMO.pret = performance.now() - t0; }
  });
  V.decouvrir('puits', {anim:false});
  conte(PHRASES.puits);
  montrerSorties();
  q('#b-suivant').addEventListener('click', suivant);
  q('#b-tout').addEventListener('click', toutMontrer);
  q('#b-nouveau').addEventListener('click', recommencer);
  var main = q('#main');
  q('#carte').addEventListener('pointerdown', function(){ if(main) { main.classList.add('partie'); setTimeout(function(){ if(main){ main.remove(); main = null; } }, 600); } }, {once:true});
  window.DEMO = {vue:V, aller:aller, suivant:suivant, ici:function(){ return ici; }, occupe:function(){ return occupe; }, pret:0};
}
if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', demarrer); else demarrer();
})();
