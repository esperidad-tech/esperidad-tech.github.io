/* ==========================================================
   Brumeval — la cueillette des sept plantes, et la brume repoussée (Romain, 12 novembre, 12 h 52 et 13 h 09 ; Bible §13.26)

   CE QUE ROMAIN A DEMANDÉ
   · Chaque plante pousse à UN endroit précis de la carte, qu'on ne voit pas (« on ne peut pas deviner où sont les plantes »). Quand l'Alchimiste
     touche exactement là, « une petite icône apparaît, comme d'habitude, la petite bulle, avec marqué cueillir cette plante-là ».
   · Quatre plantes sont dans le village et ses alentours (on les trouve avec toute la brume ; une curieuse peut déjà les découvrir à l'enquête 2).
     Trois sont au-delà de la brume : il faut qu'Anselme sonne pour la repousser un peu.
   · C'est l'herbier du Sage qui dit où et quand : rien que des plantes, là où elles vivent pour de vrai, l'endroit, le moment de la journée.

   COMMENT C'EST FAIT
   · Les endroits, les moments et toutes les phrases : D.PLANTES (donnees.js). Rien d'autre à changer pour déplacer une plante.
   · Sur la carte (carte.js, « cachettes ») : un rond invisible par endroit, seulement pour l'Alchimiste ; trouvé une fois, il garde une petite
     pastille pour toute la saison (S.plantesVues). Les trois lointaines n'existent sur la carte que si leur zone de brume est levée.
   · La brume : E.brume = {zones:[…], si:[conditions]} dans l'enquête (enquête 3 : Bertille, la petite cloche, sonnée par Anselme à la demande de
     l'Alchimiste). M.brumeLevee() donne les zones levées pour ce joueur ; carte-jeu.js fait partir la brume sous ses yeux, une seule fois.
   · Les moments : pl.pasAvant ('apresmidi') = pas avant ce moment-là. Jamais « trop tard » : plus tard dans la journée, et la nuit, la plante se
     cueille toujours (une potion ne doit jamais devenir impossible : Bible §13.14).
   · DÈS L'ENQUÊTE 2 (Romain, 12 h 45 : « elles ne servent pas à l'enquête, mais on peut déjà faire leurs potions ») : les quatre plantes du village
     se trouvent et se cueillent comme à l'enquête 3 — à l'aveugle, car l'herbier du Sage n'arrive qu'à l'enquête 3. L'établi apparaît dans
     l'atelier dès la première plante, et plantes et potions suivent le héros d'une enquête à l'autre (plantes.js : M.etabliDispo, M.S.herbier).
   Chargé APRÈS moteur-actions.js (M.A, M.bulleDe, M.ouvrir) ; livre.js lui demande la page de l'herbier (M.herbierHTML).
   ========================================================== */
(function(){
'use strict';
var M = window.M, D = window.DONNEES;
if(!M || !M.A || !D || !D.PLANTES) return;
var A = M.A, UI = M.UI, esc = M.esc;
/* l'ordre de l'herbier : les quatre du village, puis les trois d'au-delà de la brume */
var ORDRE = ['oseille', 'melisse', 'souci', 'lin', 'lycopode', 'vesse', 'gui'];
M.PLANTES_ORDRE = ORDRE;

function enquete(){ try{ return M.S && M.S.e ? M.E() : null; }catch(e){ return null; } }
function lire(t){ return M.lireBtn ? M.lireBtn(t) : ''; }

/* ---------- La brume repoussée ---------- */
M.brumeLevee = function(){
  var E = enquete(), B = E && E.brume;
  try{ return (B && B.zones && M.P() && M.besoinOk(B.si)) ? B.zones.slice() : []; }catch(e){ return []; }
};

/* ---------- Où sont les plantes, et ce qu'on peut y faire ---------- */
function existe(E, id){ var pl = D.PLANTES[id]; return !!(pl && typeof pl.x === 'number' && (E.id || 1) >= (pl.des || 99)); }
/* une plante d'au-delà de la brume : seulement quand la brume de sa zone est repoussée */
function atteinte(E, id){ var pl = D.PLANTES[id]; return existe(E, id) && (!pl.zone || M.brumeLevee().indexOf(pl.zone) >= 0); }
function tropTot(E, P, pl){
  if(!pl.pasAvant) return false;
  var r = (E.moments || []).indexOf(pl.pasAvant);
  return r > 0 && Math.min(P.moment || 0, E.moments.length - 1) < r;
}
/* 'tot' : pas encore le moment · 'cueillie' : cueillie à ce moment-ci · 'deja' : il y en a sur l'établi (cueillie plus tôt, ou à une enquête
   d'avant) · 'faite' : sa potion est prête · 'pret' : à cueillir */
function etat(E, P, id){
  var pl = D.PLANTES[id];
  if(tropTot(E, P, pl)) return 'tot';
  if(P.vus['cueilli:plante:' + id] === P.moment) return 'cueillie';
  if(P.plantes && P.plantes[id] > 0) return 'deja';
  var DN = window.PLANTES_DONNEES, pot = DN && DN.PL && DN.PL[id] && DN.PL[id].potion;
  if(pot && P.vus['fiole:' + pot]) return 'faite';
  return 'pret';
}
M.etatCachette = function(id){ var E = enquete(), P = M.P(); return E && P && D.PLANTES[id] ? etat(E, P, id) : null; };
/* Les endroits à poser sur la carte de l'Alchimiste (carte-jeu.js). brume : les zones sans brume, telles que la carte les dessine. */
M.cachettesCarte = function(brume){
  var E = enquete(), P = M.P(), S = M.S;
  if(!E || !P || M.role() !== 'alchimiste') return [];
  var vues = S.plantesVues || {};
  return ORDRE.filter(function(id){ var pl = D.PLANTES[id]; return existe(E, id) && (!pl.zone || (brume || []).indexOf(pl.zone) >= 0); }).map(function(id){
    var pl = D.PLANTES[id], e = etat(E, P, id);
    return {id:id, x:pl.x, y:pl.y, ic:pl.ic, connu:!!vues[id], grise:!!vues[id] && (e === 'cueillie' || e === 'deja' || e === 'faite')};
  });
};

/* ---------- La bulle d'un endroit (sur la carte : de petites pastilles, sans 🔊, comme toutes les bulles de la carte — moteur.css) ---------- */
function phrase(t, cls){ return '<p' + (cls ? ' class="' + cls + '"' : '') + '>' + esc(t) + ' ' + lire(t) + '</p>'; }
/* La tringle de l'établi n'a que trois places (Romain, 12 novembre, 13 h 52 ; plantes.js, Bible §13.25) : une plante en trop attend devant la
   porte de l'atelier. La bulle dit où la plante est allée. */
function dehors(id){
  try{ if(M.plantesEnAttente) M.plantesEnAttente(); return !!(M.plantesPorte && M.plantesPorte().indexOf(id) >= 0); }catch(e){ return false; }
}
M.cachetteHTML = function(m){
  var E = enquete(), P = M.P(), pl = D.PLANTES[m.id];
  if(!E || !P || !pl) return '';
  var e = etat(E, P, m.id);
  var s = '<div class="b-feuille-tete"><span class="b-feuille-ic">' + pl.ic + '</span><div><h2>' + esc(pl.nom) + '</h2></div></div>';
  if(e === 'tot') return s + phrase(pl.tot || 'Ce n\'est pas encore le moment.');
  if(e === 'cueillie') return s + phrase(dehors(m.id) ? '✅ Cueilli ! Ça t\'attend devant la porte de ton atelier. La tringle de l\'établi est pleine !' : '✅ Cueilli ! Ça t\'attend sur l\'établi de ton atelier.', 'b-recolte');
  if(e === 'deja') return s + phrase(dehors(m.id) ? '✅ Tu en as déjà : ça attend devant la porte de ton atelier.' : '✅ Tu en as déjà sur ton établi.', 'b-recolte');
  if(e === 'faite') return s + phrase('✅ Ta potion est prête : plus besoin d\'en cueillir.', 'b-recolte');
  return s + phrase(pl.ici) +
    '<button class="btn grand" data-act="cueillir-plante" data-id="' + esc(m.id) + '"><span class="b-ic-contour">🧺</span> Cueillir ' + esc(pl.un) + '</button>';
};

/* Toucher l'endroit : la première fois, la plante se montre (sa pastille surgit sur la carte, et y reste pour toute la saison) */
A.cachette = function(el){
  var id = el.dataset.id, P = M.P(), S = M.S, E = enquete();
  if(!P || P.etape !== 'jeu' || !E || M.role() !== 'alchimiste' || !D.PLANTES[id] || !atteinte(E, id)) return;
  var neuve = !(S.plantesVues && S.plantesVues[id]);
  if(neuve){ S.plantesVues = S.plantesVues || {}; S.plantesVues[id] = 1; }
  P.vus['cachette:' + id] = 1;
  var bl = M.bulleDe ? M.bulleDe(el) : {};
  M.son(neuve ? 'magie' : 'bulle');
  M.ouvrir(Object.assign({type:'cachette', id:id, leger:!neuve}, bl));   /* (neuve : la carte est remise à jour, pour la pastille) */
};
A['cueillir-plante'] = function(el){
  var id = el.dataset.id, P = M.P(), E = enquete(), m = UI.modal;
  if(!P || !E || M.role() !== 'alchimiste' || !D.PLANTES[id] || !atteinte(E, id) || etat(E, P, id) !== 'pret') return;
  M.ajouterPlante(id);
  P.vus['cueilli:plante:' + id] = P.moment;
  if(M.etabliDispo) M.etabliDispo();   /* (plantes.js : la plante est notée pour toute la saison ; hors de l'enquête 3, c'est elle qui fait apparaître l'établi) */
  M.son('ok'); M.sauver();
  M.ouvrir({type:'cachette', id:id, bulle:!!(m && m.bulle), ancre:m ? m.ancre : null, neuve:false});
};

/* ---------- L'herbier du Sage (livre.js, une page de type 'herbier') ----------
   Romain : « dans l'herbier, je veux pas qu'il parle de donjon. Uniquement de plantes, là où elles sont, et à quel moment de la journée on peut
   les cueillir. » Une planche par plante : son dessin (le même qu'à l'établi), où elle vit pour de vrai et l'endroit précis, puis le moment. */
M.herbierHTML = function(){
  var E = enquete(); if(!E) return '';
  var PLD = window.PLD;
  return '<ul class="lv-herbier">' + ORDRE.filter(function(id){ return existe(E, id); }).map(function(id){
    var pl = D.PLANTES[id], ou = (pl.vit ? pl.vit + ' ' : '') + pl.ou;
    return '<li data-plante="' + id + '"><div class="lv-herb-planche" aria-hidden="true">' + (PLD && PLD.plante ? PLD.plante(id) : '<span>' + pl.ic + '</span>') + '</div>' +
      '<div class="lv-herb-texte"><h3>' + esc(pl.nom) + '</h3>' +
      '<p class="lv-herb-ou"><b>Où ?</b> ' + esc(ou) + ' ' + lire(pl.nom + '. Où ? ' + ou) + '</p>' +
      '<p class="lv-herb-quand"><b>Quand ?</b> ' + esc(pl.quand) + ' ' + lire('Quand ? ' + pl.quand) + '</p></div></li>';
  }).join('') + '</ul>';
};
})();
