/* alchimiste.js — la tablette de l'ALCHIMISTE pendant le donjon (Les Enquêteurs de Brumeval, enquête 3).
   - Ses recettes : celles du départ (essai/src/jeu.js, RECETTES : feu, fumigène, huile, colle, baume, cœur vaillant)
     et celles gagnées au chaudron (Givre, Baume lumineux), avec leur code pour le Pisteur.
   - Le chaudron : « 📥 Un code » pour une plante rare (plante:givre, plante:lumiere) ; elle se pose près du chaudron ;
     avant le mini-jeu, une explication en images et le bouton jaune « On cuisine ! » ; le mini-jeu, SANS minuteur :
     1. verser les ingrédients dans l'ordre de la recette, 2. touiller en rond, 3. souffler sur le feu ;
     à la fin, la nouvelle recette et son code (recette:givre, recette:baumelum), qui reste lisible dans le livre.
   Mémoire : localStorage 'brumeval-donjon-alchimiste'. Tout ce qui bouge bouge en transform / opacity. */
(function(){
'use strict';
var DC = window.DONJON_CODES, PG = window.PAGE;
var q = PG.q, qa = PG.qa, esc = PG.esc, el = PG.el, dit = PG.dit;
var mem = PG.memoire('brumeval-donjon-alchimiste');
var S;
function neuf(){ return {v:1, codes:{}, plantes:{}, recettes:[], vues:{}}; }
function garder(){ mem.ecrire(S); }

/* les recettes du départ : les mêmes que la salle d'essai (essai/src/jeu.js) */
var RECETTES = {
  feu:{nom:'Fiole de feu', long:'Elle brûle un monstre.', coul:'#ff7a2a'},
  fumigene:{nom:'Fumigène', long:'Un gros nuage, dans toute la salle.', coul:'#aab4d2'},
  huile:{nom:'Huile', long:'Ça glisse, ça glisse…', coul:'#f2b630'},
  colle:{nom:'Colle', long:'Les pattes restent collées au sol.', coul:'#ece4d0'},
  baume:{nom:'Baume', long:'Il soigne beaucoup un ami.', coul:'#5fd08a'},
  coeur:{nom:'Cœur vaillant', long:'Il relève un ami tombé au sol.', coul:'#ff5a7a'},
  /* gagnées au chaudron */
  givre:{nom:'Givre', long:'Un froid magique : il gèle tout, même l’eau.', coul:'#9fe6ff', code:'recette:givre', plante:'givre'},
  baumelum:{nom:'Baume lumineux', long:'Il soigne toute l’équipe d’un coup.', coul:'#8fffc8', code:'recette:baumelum', plante:'lumiere'}
};
var DEPART = ['feu', 'fumigene', 'huile', 'colle', 'baume', 'coeur'];
var PLANTES = {
  givre:{code:'plante:givre', nom:'La fleur de givre', court:'la fleur de givre', recette:'givre',
    arrivee:'Le Pisteur t’envoie la fleur de givre. Elle ne fond jamais… Elle sera parfaite dans ton chaudron.',
    ingr:[{id:'eau', e:'💧', n:'Eau de source', c:'#5aa9ff'}, {id:'givre', e:'❄️', n:'Fleur de givre', c:'#bff4ff'}, {id:'lune', e:'✨', n:'Poussière de lune', c:'#eef0ff'}],
    leurres:[{id:'miel', e:'🍯', n:'Miel', c:'#f3c13e'}, {id:'menthe', e:'🌿', n:'Menthe', c:'#3fcf9a'}]},
  lumiere:{code:'plante:lumiere', nom:'Les herbes lumineuses', court:'les herbes lumineuses', recette:'baumelum',
    arrivee:'Le Pisteur t’envoie des herbes lumineuses, cueillies sous la lune. Elles brillent encore !',
    ingr:[{id:'miel', e:'🍯', n:'Miel des ruches', c:'#f3c13e'}, {id:'herbes', e:'🌱', n:'Herbes lumineuses', c:'#7affc0'}, {id:'lavande', e:'🪻', n:'Lavande', c:'#a77bf0'}],
    leurres:[{id:'eau', e:'💧', n:'Eau', c:'#5aa9ff'}, {id:'champi', e:'🍄', n:'Champignon', c:'#ff7a5a'}]}
};
var PLANTE_DE_CODE = {'plante:givre':'givre', 'plante:lumiere':'lumiere'};

/* ======================================================================
   Les dessins (SVG légers, sans filtre)
   ====================================================================== */
var O = '#24182e';
function fiole(c, cls){
  return '<svg class="fiole ' + (cls || '') + '" viewBox="0 0 40 48" aria-hidden="true"><circle cx="20" cy="30" r="19" fill="' + c + '" opacity=".25"/>' +
    '<path d="M15 6 L 25 6 L 25 14 C 34 18 36 34 28 42 C 24 46 16 46 12 42 C 4 34 6 18 15 14 Z" fill="' + c + '" stroke="' + O + '" stroke-width="3" stroke-linejoin="round"/>' +
    '<path d="M13 2 L 27 2 L 27 8 L 13 8 Z" fill="#8a5a32" stroke="' + O + '" stroke-width="3" stroke-linejoin="round"/>' +
    '<path d="M10 28 C 14 26 26 26 30 28 C 31 36 26 42 20 42 C 14 42 9 36 10 28 Z" fill="rgba(0,0,0,.2)"/>' +
    '<path d="M14 22 Q 15 18 19 17" stroke="#fff" stroke-width="2.6" fill="none" stroke-linecap="round" opacity=".8"/></svg>';
}
function dessinPlante(id){
  if(id === 'givre'){
    var p = ''; for(var k = 0; k < 6; k++) p += '<path d="M0 0 C 6 -9 6 -24 0 -30 C -6 -24 -6 -9 0 0 Z" fill="#eaf8ff" stroke="#3a6a90" stroke-width="2" transform="rotate(' + (k * 60) + ')"/>';
    return '<svg viewBox="-50 -50 100 110" class="plante-svg" aria-hidden="true"><circle r="46" fill="#bff4ff" opacity=".18"/><path d="M0 22 C -4 34 -2 44 0 56 M0 36 q -10 -4 -14 -12 M0 44 q 9 -3 13 -10" fill="none" stroke="#5aa08a" stroke-width="3.5" stroke-linecap="round"/>' +
      '<g transform="translate(0 0)">' + p + '<circle r="7" fill="#9fe8ff" stroke="#3a6a90" stroke-width="2"/></g></svg>';
  }
  var t = ''; for(var i = 0; i < 7; i++){ var a = -90 + (i - 3) * 18, x = Math.cos(a * Math.PI / 180) * 34, y = Math.sin(a * Math.PI / 180) * 34 + 40;
    t += '<path d="M0 40 Q ' + (x * .4) + ' ' + (y * .6 + 10) + ' ' + x + ' ' + y + '" fill="none" stroke="#2e8a5e" stroke-width="4" stroke-linecap="round"/><circle cx="' + x + '" cy="' + y + '" r="5" fill="#b8ffe0" stroke="#2e8a5e" stroke-width="1.5"/>'; }
  return '<svg viewBox="-50 -30 100 90" class="plante-svg" aria-hidden="true"><circle cy="20" r="44" fill="#7affc0" opacity=".16"/>' + t + '<ellipse cx="0" cy="44" rx="18" ry="6" fill="#5a3a20"/></svg>';
}
/* le chaudron (repère 400 × 380, comme le mini-jeu du jeu) */
function chaudronSVG(){
  return '<svg viewBox="0 0 400 380" class="chaudron-svg" aria-hidden="true"><defs>' +
    '<radialGradient id="ac-fer" cx=".35" cy=".3" r=".8"><stop offset="0" stop-color="#5a5468"/><stop offset=".55" stop-color="#2a2434"/><stop offset="1" stop-color="#120e18"/></radialGradient>' +
    '<linearGradient id="ac-bord" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7a7088"/><stop offset="1" stop-color="#2a2434"/></linearGradient></defs>' +
    /* les pierres du foyer */
    '<g stroke="' + O + '" stroke-width="3">' + [[96, 338, 34], [150, 350, 30], [204, 354, 32], [258, 350, 30], [310, 338, 34]].map(function(p){ return '<ellipse cx="' + p[0] + '" cy="' + p[1] + '" rx="' + p[2] + '" ry="18" fill="#4a4258"/>'; }).join('') + '</g>' +
    /* les pieds et le ventre */
    '<path d="M110 280 L 96 326 M290 280 L 304 326 M200 300 L 200 336" stroke="#1a1422" stroke-width="14" stroke-linecap="round"/>' +
    '<path d="M56 158 C 50 250 110 312 200 312 C 290 312 350 250 344 158 Z" fill="url(#ac-fer)" stroke="' + O + '" stroke-width="5"/>' +
    '<path d="M86 200 C 96 250 130 280 170 290" fill="none" stroke="#8a8098" stroke-width="5" opacity=".35" stroke-linecap="round"/>' +
    /* le bord */
    '<ellipse cx="200" cy="157" rx="146" ry="54" fill="url(#ac-bord)" stroke="' + O + '" stroke-width="5"/>' +
    '<ellipse cx="200" cy="160" rx="128" ry="44" fill="#120c18"/></svg>';
}
function chaudronHTML(id){
  return '<div class="chaudron" id="' + id + '">' +
    '<div class="feu" aria-hidden="true"><i class="f1"></i><i class="f2"></i><i class="f3"></i></div>' +
    chaudronSVG() +
    '<div class="potion" aria-hidden="true"><i class="liq a"></i><i class="liq b"></i><i class="tourbillon"></i>' +
      '<b class="bul b1"></b><b class="bul b2"></b><b class="bul b3"></b><b class="bul b4"></b></div>' +
    '<div class="vapeur" aria-hidden="true"><i></i><i></i><i></i></div>' +
    '</div>';
}
function louche(){
  return '<svg viewBox="0 0 60 200" aria-hidden="true"><path d="M30 8 L 30 150" stroke="' + O + '" stroke-width="13" stroke-linecap="round"/><path d="M30 8 L 30 150" stroke="#8a5a32" stroke-width="7" stroke-linecap="round"/>' +
    '<path d="M10 150 Q 10 186 30 186 Q 50 186 50 150 Z" fill="#7a7088" stroke="' + O + '" stroke-width="4"/></svg>';
}
function soufflet(){
  return '<svg viewBox="0 0 120 90" aria-hidden="true"><g stroke="' + O + '" stroke-width="4" stroke-linejoin="round">' +
    '<path d="M8 20 Q 40 4 70 30 L 70 60 Q 40 86 8 70 Z" fill="#8a5a32"/><path d="M70 36 L 108 42 L 108 48 L 70 54 Z" fill="#7a7088"/>' +
    '<path d="M18 30 Q 40 22 60 38 M18 60 Q 40 68 60 52" fill="none" stroke="#5a3a1e" stroke-width="3"/><circle cx="34" cy="45" r="7" fill="#e0b85a"/></g></svg>';
}
function bocal(ing){
  return '<span class="bocal-verre" aria-hidden="true"><i style="background:' + ing.c + '"></i></span><span class="bocal-ic" aria-hidden="true">' + ing.e + '</span><small>' + esc(ing.n) + '</small>';
}

/* ======================================================================
   L'atelier : le livre de recettes et le chaudron
   ====================================================================== */
function carteRecette(id){
  var r = RECETTES[id], nouv = !!r.code;
  return '<div class="recette' + (nouv ? ' gagnee' : '') + '" data-recette="' + id + '">' + fiole(r.coul) +
    '<div class="r-txt"><b>' + esc(r.nom) + '</b>' + dit(r.long, 'r-dit') + '</div>' +
    (nouv ? '<div class="r-code"><small>Pour le Pisteur</small>' + PG.codeGrand(r.code) + '</div>' : '') + '</div>';
}
function majLivre(){
  var ids = DEPART.concat(S.recettes);
  q('#recettes').innerHTML = ids.map(carteRecette).join('');
}
function attendent(){ return Object.keys(S.plantes).filter(function(k){ return S.plantes[k] === 'attend'; }); }
function majFoyer(){
  var att = attendent(), zone = q('#plantes'), act = q('#actions-cuisine');
  zone.innerHTML = att.map(function(k){ return '<div class="plante-posee" data-plante="' + k + '">' + dessinPlante(k) + '</div>'; }).join('');
  act.innerHTML = att.map(function(k){ return '<button type="button" class="aller" data-cuisiner="' + k + '">🍲 Cuisiner ' + esc(PLANTES[k].court) + '</button>'; }).join('');
  var b = act.querySelector('[data-cuisiner]');
  PG.guider(b || null);
  if(!att.length){
    if(!S.recettes.length) conte('Ton chaudron est prêt. Si le Pisteur trouve une plante rare, il te donnera son code.');
    else conte('Tes nouvelles recettes sont dans ton livre. Montre leur code au Pisteur, au feu de camp !');
  } else conte(att.length > 1 ? 'Deux plantes rares attendent près du chaudron… On les cuisine ?' : PLANTES[att[0]].nom + ' attend près du chaudron. On la cuisine ?');
}
function conte(t){ var b = q('#bulle'); b.innerHTML = '<span>' + esc(t) + '</span>' + PG.lireBtn(t); b.classList.remove('pop'); void b.offsetWidth; b.classList.add('pop'); }

/* ======================================================================
   Les codes
   ====================================================================== */
function unCode(){
  PG.pave({tablette:'alchimiste', titre:'📥 Un code', texte:'Le Pisteur a trouvé une plante rare ? Tape les trois symboles qu’il te montre.',
    deja:function(id){ return !!S.codes[id]; },
    recevoir:function(id){
      S.codes[id] = true; var k = PLANTE_DE_CODE[id]; if(k && !S.plantes[k]) S.plantes[k] = 'attend'; garder();
      var p = PLANTES[k];
      var w = PG.fenetre('<div class="titre"><h2>🌿 Une plante rare !</h2></div><div class="arrivee">' + dessinPlante(k) + dit(p.nom, 'plante-nom', 'h3') + '</div>' + dit(p.arrivee, 'arrivee-txt') +
        '<div class="rangee"><button type="button" class="aller" data-fen-fermer>La poser près du chaudron</button></div>', {classe:'parch plante-fen', surFermer:majFoyer});
      PG.guider(w.el.querySelector('.aller'));
      PG.son('magie');
    }});
}

/* ======================================================================
   Le mini-jeu : la cuisine (pas de minuteur)
   ====================================================================== */
var C = null;     /* la partie en cours */
function cuisiner(k){
  var p = PLANTES[k], r = RECETTES[p.recette];
  var lay = el('div', 'cuisine'); lay.id = 'cuisine';
  /* 0. l'explication en images, puis le bouton jaune */
  lay.innerHTML = '<div class="explication"><h2>🍲 ' + esc(r.nom) + '</h2>' +
    '<div class="trois">' +
      '<figure><div class="ex-img ex-verser" aria-hidden="true"><span class="ex-bocal">🫙</span><span class="ex-fleche">➜</span>' + petitChaudron() + '</div><figcaption>1. Verser</figcaption></figure>' +
      '<figure><div class="ex-img ex-touiller" aria-hidden="true">' + petitChaudron() + '<span class="ex-rond">↻</span></div><figcaption>2. Touiller</figcaption></figure>' +
      '<figure><div class="ex-img ex-souffler" aria-hidden="true"><span class="ex-souf">' + soufflet() + '</span><span class="ex-flamme">🔥</span></div><figcaption>3. Souffler</figcaption></figure>' +
    '</div>' + dit('D’abord, les ingrédients dans l’ordre de la recette. Ensuite, on touille en rond. Et pour finir, on souffle sur le feu !', 'sur-nuit ex-dit') +
    '<div class="rangee"><button type="button" class="aller" data-go>On cuisine !</button><button type="button" class="sombre" data-quitter>Plus tard</button></div></div>';
  document.body.appendChild(lay);
  PG.guider(lay.querySelector('[data-go]'));
  lay.querySelector('[data-quitter]').addEventListener('click', function(){ PG.son('tic'); quitter(); });
  lay.querySelector('[data-go]').addEventListener('click', function(){ PG.son('ok'); jouer(k); });
}
function petitChaudron(){ return '<svg viewBox="0 0 60 50" class="ex-ch"><path d="M6 16 C 6 40 20 48 30 48 C 40 48 54 40 54 16 Z" fill="#2a2434" stroke="#24182e" stroke-width="3"/><ellipse cx="30" cy="16" rx="25" ry="8" fill="#7a7088" stroke="#24182e" stroke-width="3"/><ellipse cx="30" cy="17" rx="20" ry="5" fill="#7affc0"/></svg>'; }
function quitter(){ var l = q('#cuisine'); if(l) l.remove(); C = null; PG.taire(); majLivre(); majFoyer(); }

function jouer(k){
  var p = PLANTES[k], r = RECETTES[p.recette], lay = q('#cuisine');
  var bocaux = p.ingr.concat(p.leurres).slice();
  /* un ordre mélangé, mais jamais celui de la recette */
  var ordre = [3, 0, 4, 2, 1];
  bocaux = ordre.map(function(i){ return bocaux[i]; });
  C = {k:k, etape:1, verse:0, tours:0, souffle:0};
  lay.innerHTML = '<div class="jeu">' +
    '<header class="jeu-haut"><div class="etapes"><i class="on">1</i><i>2</i><i>3</i></div><div class="bulle" id="bulle-jeu"></div><button type="button" class="sombre" data-quitter aria-label="Arrêter">✕</button></header>' +
    '<div class="jeu-corps">' +
      '<aside class="carte-recette"><h3>' + esc(r.nom) + '</h3><ol>' + p.ingr.map(function(g, i){ return '<li data-ligne="' + i + '"><span class="ic">' + g.e + '</span><span>' + esc(g.n) + '</span><b class="ok" aria-hidden="true">✔</b></li>'; }).join('') + '</ol></aside>' +
      '<div class="centre">' + chaudronHTML('ch-jeu') + '<div class="louche" id="louche" hidden><div class="louche-bras">' + louche() + '</div></div>' +
        '<div class="tours" id="tours" hidden><i></i><i></i><i></i></div>' +
        '<div class="chaleur" id="chaleur" hidden><i></i><i></i><i></i><i></i><i></i></div>' +
        '<div class="fiole-finale" id="fiole-finale" hidden><div class="ff-verre">' + fiole(r.coul, 'ff') + '</div></div>' +
      '</div>' +
      '<aside class="droite"><div class="etagere" id="etagere">' + bocaux.map(function(g){ return '<button type="button" class="bocal" data-ing="' + g.id + '">' + bocal(g) + '</button>'; }).join('') + '</div>' +
        '<button type="button" class="soufflet" id="soufflet" hidden aria-label="Le soufflet">' + soufflet() + '<small>Le soufflet</small></button></aside>' +
    '</div></div>';
  lay.querySelector('[data-quitter]').addEventListener('click', function(){ PG.son('tic'); quitter(); });
  /* la louche, les repères et la fiole vivent dans le chaudron (ils suivent sa taille) */
  ['#louche', '#tours', '#chaleur', '#fiole-finale'].forEach(function(s2){ q('#ch-jeu').appendChild(q(s2)); });
  var ch = q('#ch-jeu'), liqA = ch.querySelector('.liq.a'), liqB = ch.querySelector('.liq.b');
  liqA.style.background = 'radial-gradient(ellipse at 50% 40%, #5a6a8a, #2a3048)'; liqB.style.opacity = 0;
  dire('Étape 1 : les ingrédients ! Verse-les un par un, dans l’ordre de la recette.');
  PG.guider(q('#etagere'));
  /* --- 1. verser --- */
  q('#etagere').addEventListener('click', function(e){
    var b = e.target.closest('.bocal'); if(!b || C.etape !== 1 || b.disabled) return;
    var attendu = p.ingr[C.verse];
    if(b.getAttribute('data-ing') !== attendu.id){
      PG.son('ko'); if(b.animate) b.animate([{transform:'translateX(0)'}, {transform:'translateX(-7px) rotate(-4deg)'}, {transform:'translateX(6px) rotate(3deg)'}, {transform:'translateX(-3px)'}, {transform:'none'}], {duration:420});
      dire(C.verse ? 'Pas celui-là ! Qu’est-ce qui vient après, sur la recette ?' : 'Pas celui-là ! Regarde bien la recette : qu’est-ce qui vient en premier ?');
      return;
    }
    b.disabled = true; PG.son('tic');
    verser(b, attendu).then(function(){
      PG.son('plouf');
      q('[data-ligne="' + C.verse + '"]').classList.add('fait');
      teinter(attendu.c, (C.verse + 1) / 4);
      C.verse++;
      if(C.verse < p.ingr.length){ dire(['Plouf ! Et ensuite ?', 'Ça mousse ! Encore un…'][C.verse - 1] || 'Encore un !'); return; }
      etape2(p, r);
    });
  });
}
function dire(t){ var b = q('#bulle-jeu'); if(!b) return; b.innerHTML = '<span>' + esc(t) + '</span>' + PG.lireBtn(t); b.classList.remove('pop'); void b.offsetWidth; b.classList.add('pop'); }
/* le bocal vole jusqu'au chaudron (trajectoire calculée une fois : la carte graphique la joue) */
function verser(b, ing){
  var r1 = b.getBoundingClientRect(), ch = q('#ch-jeu'), r2 = ch.getBoundingClientRect();
  var v = el('div', 'vol'); v.innerHTML = '<span>' + ing.e + '</span>'; v.style.left = r1.left + r1.width / 2 + 'px'; v.style.top = r1.top + r1.height / 2 + 'px';
  document.body.appendChild(v);
  var dx = r2.left + r2.width * .5 - (r1.left + r1.width / 2), dy = r2.top + r2.height * .38 - (r1.top + r1.height / 2);
  b.classList.add('vide');
  if(!v.animate){ v.remove(); return Promise.resolve(); }
  var a = v.animate([{transform:'translate(0,0) scale(1) rotate(0)'}, {transform:'translate(' + dx * .5 + 'px,' + (dy * .5 - 90) + 'px) scale(1.15) rotate(-60deg)', offset:.5}, {transform:'translate(' + dx + 'px,' + dy + 'px) scale(.5) rotate(-140deg)', opacity:.2}],
    {duration:720, easing:'cubic-bezier(.4,.1,.5,1)', fill:'forwards'});
  return new Promise(function(ok){ a.onfinish = function(){ v.remove(); var r3 = q('#ch-jeu').getBoundingClientRect(), lay = q('#cuisine');
    PG.etincelles(lay, r3.left + r3.width * .5, r3.top + r3.height * .4, 12, {cls:'or', dist:50}); ok(); }; });
}
/* la couleur de la potion : un fondu entre deux couches (opacity) */
function teinter(c, k){
  var ch = q('#ch-jeu'); if(!ch) return;
  var A = ch.querySelector('.liq.a'), B = ch.querySelector('.liq.b');
  B.style.background = 'radial-gradient(ellipse at 50% 40%, ' + c + ', ' + mixer(c, '#1a1428', .55) + ')';
  B.style.transition = 'none'; B.style.opacity = 0; void B.offsetWidth;
  B.style.transition = 'opacity .8s'; B.style.opacity = Math.max(.35, Math.min(1, k));
  setTimeout(function(){ if(!B.isConnected) return; A.style.background = B.style.background; A.style.opacity = 1; B.style.transition = 'none'; B.style.opacity = 0; }, 850);
}
function mixer(a, b, t){ function hx(c){ c = c.replace('#', ''); return [0, 2, 4].map(function(i){ return parseInt(c.substr(i, 2), 16); }); }
  var A = hx(a), B = hx(b); return '#' + A.map(function(v, i){ var r = Math.round(v + (B[i] - v) * t); return (r < 16 ? '0' : '') + r.toString(16); }).join(''); }

/* --- 2. touiller : faire tourner la louche autour du chaudron (3 tours, dans un sens ou dans l'autre) --- */
function etape2(p, r){
  C.etape = 2; etapeVisible(2);
  q('#etagere').classList.add('range');
  var lo = q('#louche'), bras = lo.querySelector('.louche-bras'), tours = q('#tours'), ch = q('#ch-jeu'), tb = ch.querySelector('.tourbillon');
  lo.hidden = false; tours.hidden = false; poser();
  dire('Étape 2 : on touille ! Fais tourner la louche en rond, trois grands tours.');
  PG.guider(lo);
  var total = 0, prec = null, rafT = 0, angle = 0, doigt = null;
  function centre(){ var b = ch.getBoundingClientRect(); return {x:b.left + b.width / 2, y:b.top + b.height * .42}; }
  /* la louche fait le tour du chaudron (une ellipse : on le voit de biais) ; le tourbillon tourne avec elle */
  function poser(){ rafT = 0; bras.style.transform = 'translate(' + (Math.cos(angle) * 30).toFixed(1) + '%,' + (Math.sin(angle) * 28).toFixed(1) + '%) rotate(' + (Math.cos(angle) * 9).toFixed(1) + 'deg)'; tb.style.transform = 'rotate(' + (angle * .8).toFixed(3) + 'rad)'; }
  function surDoigt(e){
    if(doigt !== e.pointerId || C.etape !== 2) return;
    var c = centre(), a = Math.atan2(e.clientY - c.y, e.clientX - c.x);
    if(prec != null){ var d = a - prec; if(d > Math.PI) d -= 2 * Math.PI; if(d < -Math.PI) d += 2 * Math.PI; if(Math.abs(d) < 1.2){ total += Math.abs(d); angle += d; } }
    prec = a;
    if(!rafT) rafT = requestAnimationFrame(poser);
    var n = Math.min(3, Math.floor(total / (2 * Math.PI)));
    if(n > C.tours){
      C.tours = n; PG.son('tic');
      qa('i', tours).forEach(function(x, i){ x.classList.toggle('on', i < n); });
      teinter(mixer(p.ingr[1].c, r.coul, n / 3), .4 + n * .2);
      if(n === 1) dire('Un tour ! Ça commence à briller…');
      if(n === 2) dire('Deux tours ! Encore un, le dernier…');
      if(n === 3 && !window.ALCHI.sansFin){ doigt = null; setTimeout(function(){ etape3(p, r); }, 500); }
    }
  }
  var zone = q('.centre');
  zone.addEventListener('pointerdown', function(e){ if(C.etape !== 2) return; doigt = e.pointerId; prec = null; PG.guider(null); try{ zone.setPointerCapture(e.pointerId); }catch(er){} surDoigt(e); });
  zone.addEventListener('pointermove', surDoigt);
  zone.addEventListener('pointerup', function(e){ if(e.pointerId === doigt){ doigt = null; prec = null; } });
  zone.addEventListener('pointercancel', function(e){ if(e.pointerId === doigt){ doigt = null; prec = null; } });
  /* pour les tests : touiller d'un coup */
  window.ALCHI.touiller = function(rad){ doigt = 'test'; var c = centre(), n = Math.ceil(rad / .3);
    for(var i = 0; i <= n; i++){ var a = i * .3; surDoigt({pointerId:'test', clientX:c.x + Math.cos(a) * 80, clientY:c.y + Math.sin(a) * 80}); } };
}
/* --- 3. souffler sur le feu (cinq coups de soufflet) --- */
function etape3(p, r){
  C.etape = 3; etapeVisible(3);
  q('#louche').hidden = true; q('#tours').hidden = true; q('#etagere').hidden = true;
  var sf = q('#soufflet'), chal = q('#chaleur'), ch = q('#ch-jeu');
  sf.hidden = false; chal.hidden = false;
  dire('Étape 3 : le feu ! Souffle dessus avec le soufflet, jusqu’à ce que ça bouille.');
  PG.guider(sf);
  sf.addEventListener('click', function(){
    if(C.etape !== 3) return;
    C.souffle++; PG.son('feu');
    if(sf.animate) sf.querySelector('svg').animate([{transform:'scaleX(1)'}, {transform:'scaleX(.82)'}, {transform:'scaleX(1)'}], {duration:260});
    var rf = ch.querySelector('.feu').getBoundingClientRect(); PG.etincelles(q('#cuisine'), rf.left + rf.width / 2, rf.top + rf.height * .6, 10, {cls:'or', dist:40, monte:40});
    ch.style.setProperty('--feu', 1 + C.souffle * .14);
    ch.classList.add('chauffe');
    qa('i', chal).forEach(function(x, i){ x.classList.toggle('on', i < C.souffle); });
    if(C.souffle === 2) dire('Le feu ronfle ! Encore !');
    if(C.souffle === 4) dire('Ça frémit… Un dernier coup !');
    if(C.souffle >= 5){ C.etape = 4; PG.guider(null); bouillir(p, r); }
  });
}
function bouillir(p, r){
  var ch = q('#ch-jeu');
  ch.classList.add('bout'); teinter(r.coul, 1);
  dire('Ça bout ! La potion est prête…');
  PG.son('magie');
  setTimeout(function(){
    var ff = q('#fiole-finale'); if(!ff) return;
    ff.hidden = false; ff.classList.add('remplit');
    setTimeout(function(){ finir(p, r); }, 1500);
  }, 1300);
}
function finir(p, r){
  if(!C) return;
  var id = p.recette;
  S.plantes[C.k] = 'cuite'; if(S.recettes.indexOf(id) < 0) S.recettes.push(id); garder();
  var lay = q('#cuisine');
  var res = el('div', 'resultat');
  res.innerHTML = '<div class="res-carte"><p class="sur">Nouvelle recette !</p><div class="res-fiole">' + fiole(r.coul) + '</div><h2>' + esc(r.nom) + '</h2>' + dit(r.long, 'res-dit') +
    PG.codeGrand(r.code) + dit('Montre ce code au Pisteur. Il le tapera au feu de camp, pour la mettre dans le sac.', 'res-dit') +
    '<div class="rangee"><button type="button" class="aller" data-ranger>Ranger dans mon livre</button></div></div>';
  lay.appendChild(res);
  var rr = res.querySelector('.res-carte').getBoundingClientRect();
  PG.etincelles(lay, rr.left + rr.width / 2, rr.top + 60, 28, {cls:'or', dist:160, duree:1300});
  PG.guider(res.querySelector('[data-ranger]'));
  res.querySelector('[data-ranger]').addEventListener('click', function(){
    PG.son('page'); quitter();
    var c = q('[data-recette="' + id + '"]'); if(c){ c.classList.add('neuve'); c.scrollIntoView({block:'nearest'}); }
  });
}
function etapeVisible(n){ qa('.etapes i').forEach(function(x, i){ x.classList.toggle('on', i < n); x.classList.toggle('fait', i < n - 1); }); }

/* ======================================================================
   Le départ
   ====================================================================== */
function recommencer(){
  PG.confirmer({titre:'Recommencer une partie ?', texte:'Tout ce qui est sur cette tablette sera effacé : les plantes reçues et les recettes gagnées.', oui:'Oui, on recommence', non:'Non'}).then(function(oui){
    if(!oui) return; mem.effacer(); S = neuf(); location.reload();
  });
}
function demarrer(){
  S = mem.lire(null); if(!S || S.v !== 1) S = neuf();
  PG.orientation();
  window.ALCHI = {etat:function(){ return S; }, partie:function(){ return C; }};
  q('#foyer-chaudron').innerHTML = chaudronHTML('ch-atelier');
  majLivre(); majFoyer();
  q('#b-code').addEventListener('click', function(){ PG.son('tic'); unCode(); });
  q('#b-nouveau').addEventListener('click', recommencer);
  q('#actions-cuisine').addEventListener('click', function(e){ var b = e.target.closest('[data-cuisiner]'); if(b){ PG.son('tic'); cuisiner(b.getAttribute('data-cuisiner')); } });
}
if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', demarrer); else demarrer();
})();
