/* Atelier des sons de Brumeval — les sons DÉJÀ dans le jeu, joués à l'identique.
   Leur code vient tel quel du jeu (window.EXTRAITS, assemblé par construire-sons.py depuis jeu/src/ et essai/src/son.js) ;
   ici, on dit seulement comment le jeu les déclenche (quels sons, quels réglages, dans quel ordre).
   EXISTANTS[id] = {chemin:'jeu' | 'salle', duree, joue:function(J, S){ ... ; rend éventuellement une fonction pour couper }}
   J : {ctx, A} (le contexte et le moteur de l'atelier) ; S : la sortie (là où le jeu branchait a.destination). */
(function(G){
'use strict';
var X = G.EXISTANTS = {}, E = G.EXTRAITS || {};
function rand(a, b){ return a + Math.random() * (b - a); }
var U = {rand:rand};
function apres(ms, fn, l){ var id = setTimeout(fn, ms); l.push(id); }

/* ---------- le jeu principal (moteur-base.js : M.son) ---------- */
function jeu(nom, arg, duree){
  return {chemin:'jeu', duree:duree, joue:function(J, S){ E.jeu(function(){ return J.ctx; }, S)[nom](arg); }};
}
[['clic', .15], ['tic', .1], ['ok', .3], ['ko', .4], ['gain', .5], ['magie', .6], ['pas', .3], ['page', .3], ['feuille', .7], ['porte', .3],
 ['cloche', 1.2], ['fumee', .5], ['plouf', .3], ['bulle', .2], ['victoire', 1], ['echec', .6], ['fleche', .3]].forEach(function(e){ X['j_' + e[0]] = jeu(e[0], null, e[1]); });
X.j_pastilles = jeu('pastilles', 4, .6);                                    /* quatre pastilles qui arrivent sur la carte */

/* ---------- le chaudron (mj-chaudron.js) ---------- */
function chaudron(fn, duree){
  return {chemin:'jeu', duree:duree, joue:function(J, S){ var api = E.chaudron(function(){ return J.ctx; }, J.ctx, S), l = []; fn(api, l); return function(){ l.forEach(clearTimeout); l.forEach(clearInterval); api.couper(); }; }};
}
['tic', 'plouf', 'etoile', 'erreur', 'alerte', 'feuBas', 'succes', 'boum', 'gel', 'pschitt', 'rate'].forEach(function(n){
  X['c_' + n] = chaudron(function(api){ api[n](); }, {tic:.1, plouf:.4, etoile:.5, erreur:.4, alerte:.4, feuBas:.4, succes:1.3, boum:1.4, gel:.7, pschitt:1.2, rate:.6}[n]);
});
X.c_buche = chaudron(function(api, l){ api.tock(); apres(280, api.crepite, l); }, .9);   /* une bûche : le toc, puis le feu qui crépite (comme dans le jeu) */
/* on touille : la louche qui clapote, et le chaudron qui chauffe peu à peu jusqu'à bouillir (5 secondes du vrai jeu, simulées) */
X.c_touille = chaudron(function(api, l){
  var t = 0, id = setInterval(function(){
    t += .03;
    var omega = Math.min(8, t * 6) * (1 + .25 * Math.sin(t * 5)), chaleur = 30 + Math.min(65, t * 16);
    api.maj(.03, omega, chaleur, t < 4.6);
    if(t > 4.6){ clearInterval(id); api.calme(); }
  }, 30);
  l.push(id);
}, 5.4);

/* ---------- l'observation (mj-observation.js) ---------- */
function observation(n, duree){
  return {chemin:'jeu', duree:duree, joue:function(J, S){ E.observation(function(){ return J.ctx; }, J.ctx, S, U, function(){ return true; })({fini:false, stops:[]})[n](); }};
}
['ecrase', 'ohNon', 'pop', 'ding', 'bocal'].forEach(function(n){ X['o_' + n] = observation(n, {ecrase:.4, ohNon:.8, pop:.15, ding:.4, bocal:.5}[n]); });

/* ---------- le Pisteur et l'Alchimiste (mj-pisteur-alchi.js) ---------- */
function notes(fn, duree){
  return {chemin:'jeu', duree:duree, joue:function(J, S){ var note = E.pisteurNote(J.ctx, {notesCoupees:false}, S), l = []; fn(note, l, J, S); return function(){ l.forEach(clearTimeout); }; }};
}
/* remuer en rythme : chaque goutte prise de suite fait une note un peu plus haute */
X.p_rythme = notes(function(note, l){ (E.GAMME || []).slice(0, 6).forEach(function(f, i){ apres(i * 450, function(){ note(f, .25); }, l); }); }, 2.8);
/* les bulles magiques : chaque bulle qui s'allume a sa note (ici, cinq bulles au hasard, comme une suite à retenir) */
X.p_bulles = notes(function(note, l){ for(var i = 0; i < 5; i++) (function(i){ var f = (E.BULLES || [523])[Math.floor(Math.random() * 8)]; apres(i * 550, function(){ note(f, .35); }, l); })(i); }, 3);
/* tir à l'arc : « Transpercé ! » (la flèche traverse deux cibles) — la magie du jeu, puis les notes qui montent */
X.p_transperce = notes(function(note, l, J, S){ E.jeu(function(){ return J.ctx; }, S).magie(); (E.TRANSPERCE || []).slice(0, 3).forEach(function(f, i){ apres(i * 75, function(){ note(f, .3); }, l); }); }, .9);

/* ---------- assembler les runes (mj-sage-codes.js) ---------- */
X.r_clac = {chemin:'jeu', duree:.2, joue:function(J, S){ E.sageClac(J.ctx, function(){ return true; }, S)(false); }};
X.r_fin = {chemin:'jeu', duree:.7, joue:function(J, S){ E.sageClac(J.ctx, function(){ return true; }, S)(true); E.jeu(function(){ return J.ctx; }, S).magie(); }};

/* ---------- les petits bruits de la salle des rats (essai/src/son.js) ---------- */
var tampons = null;
function salle(fn, duree){
  return {chemin:'salle', duree:duree, joue:function(J, S){
    tampons = tampons || E.bruitsSalle(J.ctx, J.A);
    var rev = J.ctx.createGain(); rev.connect(J.A.caveIn);
    var B = E.salle(J.ctx, J.A, S, rev, tampons.blanc, tampons.brun), l = [];
    fn(B, l);
    return function(){ l.forEach(clearTimeout); try{ rev.gain.setTargetAtTime(0, J.ctx.currentTime, .03); }catch(e){} };
  }};
}
X.s_clic = salle(function(B){ B.clic(); }, .15);
X.s_pasHeros = salle(function(B){ B.pasHeros(1.7, 3); }, 1.9);                                  /* les trois héros entrent en courant */
X.s_pasCarte = salle(function(B){ B.pasHeros(1.1, 2, 1.5); }, 1.3);                              /* les mêmes pas, plus aigus : le pion avance sur la carte du donjon */
X.s_miaou = salle(function(B){ B.miaou(); }, .6);                                                /* le chat de la porte aux quatre signes (le miaou du labo) */
X.s_rats = salle(function(B){ B.pasRats(1.5); B.couine(.3, 1); B.couine(.7, 1.15); }, 1.7);       /* les rats arrivent */
X.s_couine = salle(function(B){ B.couine(0, .9, 1.4); }, .4);
X.s_page = salle(function(B){ B.page(); }, .3);                                                  /* le Sage étudie */
X.s_magie = salle(function(B){ B.magie(); }, 1.1);                                               /* la rune de lumière */
X.s_dome = salle(function(B){ B.dome(); }, 1.6);
X.s_absorbe = salle(function(B){ B.absorbe(); }, .7);
X.s_soin = salle(function(B){ B.soin(); }, .9);
X.s_coeur = salle(function(B){ B.coeur(); }, 1.8);
X.s_potion = salle(function(B, l){ B.bulles(.5); apres(520, function(){ B.vole(.5); }, l); B.verre(1.08); }, 1.6);   /* préparer, lancer, la fiole se brise */
X.s_brule = salle(function(B){ B.brule(); }, 1);
X.s_morsure = salle(function(B){ B.couine(0, 1.1, 1); B.machoire(.35); B.morsure(.35); }, .8);
X.s_tombe = salle(function(B){ B.tombe(); }, .5);
})(window);
