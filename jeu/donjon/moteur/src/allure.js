/* allure.js — l'allure des trois héros du donjon, quand elle vient de l'enquête (Romain, 13 novembre : « les codes d'apparence »).

   Dans l'enquête 3, chaque joueur a fait son héros (fille ou garçon, la peau, les cheveux, les yeux : jeu/src/persos.js). Avant de
   descendre, le Sage et l'Alchimiste montrent chacun un code au Pisteur (jeu/src/descente.js) ; le jeu ouvre alors le donjon avec
       ?look=p:f.p1.roux.vert,s:m.p5.noir,a:f.p2.blond
   une lettre par héros (p : le Pisteur, s : le Sage, a : l'Alchimiste), puis « f » ou « m », la peau, les cheveux, et les yeux quand on
   les connaît (le code du Sage et celui de l'Alchimiste ne les portent pas : trois symboles ne suffisent pas). Ce qui manque garde
   l'allure d'avant. Les couleurs sont celles du jeu (persos.js : PEAUX, CHEVEUX, YEUX), recopiées ici.

     DonjonAllure.lire(texte, base) -> {pisteur:{fille, pe, ch, ir}, sage:{…, lunettes}, alchimiste:{…}}   (base : l'allure d'avant)
   Chargé avant noyau.js ; sert aussi à la petite page de la tenue de combat (tenue.html). */
(function(global){
'use strict';
var PE = {p1:['#fff1e6', '#f7caa6', '#e8ad89', '#ff8f8f'], p2:['#ffe7d2', '#efb88e', '#d9976d', '#ff877a'], p3:['#f8d8b0', '#dea575', '#c48652', '#f2786a'],
  p4:['#eec899', '#c7935c', '#a77441', '#e4685a'], p5:['#d29d6f', '#a06840', '#80502d', '#d65a50'], p6:['#ad774e', '#6f4428', '#55331c', '#c84c4a']};
var CH = {brun:['#d39654', '#7c4624', '#3a1e0e'], chatain:['#e6bb85', '#a06f40', '#4c2d14'], noir:['#6b7096', '#272840', '#0e0e1a'], blond:['#fff4c2', '#f0c95a', '#a8781c'],
  roux:['#ffb886', '#dc622a', '#7a2a0e'], gris:['#f2f2f6', '#a9aab8', '#5c5d6e'], blanc:['#ffffff', '#e4e7f0', '#a3a7bf'], nuit:['#9fbaff', '#3c50b4', '#141c50'], rose:['#ffd6ea', '#f07aab', '#932659']};
var YX = {vert:['#0a3a22', '#1f9150', '#86ffbd'], bleu:['#0a1f4a', '#2f6fd0', '#a6dcff'], marron:['#2a1206', '#7a4420', '#e0a876'], noisette:['#2e2208', '#8a6a1c', '#ecd07a'],
  gris:['#1e2430', '#5f6f86', '#d6e2f0'], violet:['#2a0a4a', '#7a3fd0', '#dcb6ff'], ambre:['#3a1a02', '#c47a10', '#ffd98a']};
var QUI = {p:'pisteur', s:'sage', a:'alchimiste'};
function copie(o){ var r = {}, k; for(k in (o || {})) r[k] = o[k]; return r; }
function lire(texte, base){
  var r = {pisteur:copie(base && base.pisteur), sage:copie(base && base.sage), alchimiste:copie(base && base.alchimiste)};
  String(texte || '').split(',').forEach(function(x){
    var k = x.split(':'), h = QUI[k[0]], v = (k[1] || '').split('.');
    if(!h || v.length < 3) return;
    if(v[0] === 'f' || v[0] === 'm') r[h].fille = v[0] === 'f';
    if(PE[v[1]]) r[h].pe = PE[v[1]];
    if(CH[v[2]]) r[h].ch = CH[v[2]];
    if(v[3] && YX[v[3]]) r[h].ir = YX[v[3]];
  });
  return r;
}
global.DonjonAllure = {PE:PE, CH:CH, YX:YX, lire:lire};
})(typeof window !== 'undefined' ? window : this);
