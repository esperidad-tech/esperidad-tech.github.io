/* La salle des rats — version 2 : animée et sonore.
   Règles du 9 novembre : les rats ont les yeux jaunes ; le coup de louche les rend ENRAGÉS jusqu'à la fin (yeux rouges, deux morsures) ;
   le feu les fait BRÛLER jusqu'à la fin (−4 PV à chaque tour des rats). Le reste ne change pas.
   Chaque animation est attendue (await) avant de passer à la suite. Les acteurs viennent des modules d'animation s'ils sont
   branchés (window.HerosAnime, window.RatAnime), sinon des images fixes (acteurs.js), qui ont les mêmes méthodes. */
(function(){
'use strict';
var SALLE = window.SALLE = window.SALLE || {};
SALLE.hasard = SALLE.hasard || function(){ return Math.random(); };
SALLE.vitesse = SALLE.vitesse || 1;
function R(){ return SALLE.hasard(); }
function attendre(ms){ return new Promise(function(ok){ setTimeout(ok, ms / SALLE.vitesse); }); }
function choix(t){ return t[Math.floor(R() * t.length) % t.length]; }
var Son = SALLE.Son, Fx = SALLE.Fx;
function son(){ Son.jouer.apply(null, arguments); }
/* un son de l'atelier (une version tirée au hasard parmi celles que Romain a gardées) ; sinon, l'ancien petit bruit */
function bruit(id, o, ancien){ var r = Son.bruitage ? Son.bruitage(id, o) : null; if(!r && ancien) son.apply(null, ancien); return r; }
/* le Pisteur (module) lâche la corde 1,32 s après le début du tir ; sa lame touche 0,70 s après le début du coup ;
   le rat qui glisse sur l'huile retombe sur le dos 1,54 s après le début */
var LACHER = 1.32, LAME = .70, CULBUTE = 1.54;

/* les apparences par défaut des héros (Persos.defaut du jeu), pour les modules d'animation */
var PE = {p1:['#fff1e6', '#f7caa6', '#e8ad89', '#ff8f8f'], p4:['#eec899', '#c7935c', '#a77441', '#e4685a'], p5:['#d29d6f', '#a06840', '#80502d', '#d65a50']};
var CH = {noir:['#6b7096', '#272840', '#0e0e1a'], roux:['#ffb886', '#dc622a', '#7a2a0e']};
var YX = {vert:['#0a3a22', '#1f9150', '#86ffbd'], ambre:['#3a1a02', '#c47a10', '#ffd98a']};
var LOOK = {pisteur:{fille:true, pe:PE.p1, ch:CH.roux, ir:YX.vert}, alchimiste:{fille:false, pe:PE.p4, ch:CH.noir, ir:YX.ambre}, sage:{fille:true, pe:PE.p5, ch:CH.noir, ir:YX.ambre, lunettes:true}};

var HER = {
  sage:{nom:'Sage', le:'le Sage', Le:'Le Sage', du:'du Sage', pv:90, x:0, coul:'#6cb6ff', tete:[137.6, 84.8], gestes:['etudier', 'rune', 'bouclier'], sac:null},
  alchimiste:{nom:'Alchimiste', le:'l\'Alchimiste', Le:'L\'Alchimiste', du:'de l\'Alchimiste', pv:100, x:138, coul:'#b48cff', tete:[139.2, 88], gestes:['louche', 'herbes'], sac:'Lancer une potion'},
  pisteur:{nom:'Pisteur', le:'le Pisteur', Le:'Le Pisteur', du:'du Pisteur', pv:120, x:276, coul:'#5fcf86', tete:[139.2, 86.4], gestes:['fleche', 'dague'], sac:'Flèche trempée'}
};
var ORDRE = ['sage', 'alchimiste', 'pisteur'];            /* de gauche à droite */
var EXPOSES = ['pisteur', 'alchimiste', 'sage'];          /* du plus exposé au moins exposé */
var VISEE = {pisteur:6, alchimiste:2.5, sage:1.5};        /* les rats visent plutôt celui de devant */
var MORSURE = 8, BRULURE = 4, RAT_PV = 40;

var GESTES = {
  etudier:{ic:'🔍', nom:'Étudier', d:'observe un monstre', cible:'rat'},
  rune:{ic:'✨', nom:'Rune de lumière', d:'une vive lumière', cible:'rat'},
  bouclier:{ic:'🛡️', nom:'Bouclier de runes', d:'protège un ami', cible:'heros'},
  louche:{ic:'🥄', nom:'Coup de louche', d:'un grand BONG', cible:'devant'},
  herbes:{ic:'🌿', nom:'Herbes', d:'soigne un peu', cible:'heros'},
  fleche:{ic:'🏹', nom:'Flèche', d:'n\'importe quel rat', cible:'rat'},
  dague:{ic:'🗡️', nom:'Coup de dague', d:'celui de devant', cible:'devant'}
};
var RECETTES = {
  feu:{nom:'Fiole de feu', d:'brûle un monstre', long:'Elle brûle un monstre.', cible:'rat', fleche:true, coul:'#ff7a2a'},
  fumigene:{nom:'Fumigène', d:'un gros nuage', long:'Un gros nuage, dans toute la salle.', cible:'salle', fleche:false, coul:'#aab4d2'},
  huile:{nom:'Huile', d:'ça glisse !', long:'Ça glisse, ça glisse…', cible:'rat', fleche:true, coul:'#f2b630'},
  colle:{nom:'Colle', d:'pattes collées', long:'Les pattes restent collées au sol.', cible:'rat', fleche:true, coul:'#ece4d0'},
  baume:{nom:'Baume', d:'soigne beaucoup', long:'Il soigne beaucoup un ami.', cible:'heros', fleche:false, coul:'#5fd08a'},
  coeur:{nom:'Cœur vaillant', d:'relève un ami', long:'Il relève un ami tombé au sol.', cible:'sol', fleche:false, coul:'#ff5a7a'}
};
var ORDRE_REC = ['feu', 'fumigene', 'huile', 'colle', 'baume', 'coeur'];
var LIVRE = [
  'Les rats vivent dans le noir. Ce qui brille leur fait peur : ils se dressent, le ventre à l\'air.',
  'Un grand bruit les rend enragés jusqu\'au bout : ils mordent deux fois.'
];
/* les rats : 1 devant, 2 au milieu, 3 derrière (x = gauche du dessin, pied = ligne des pattes, w = largeur) */
var POS_R = [{x:494, pied:338, w:206, z:4}, {x:620, pied:342, w:210, z:5}, {x:746, pied:346, w:214, z:6}];
function rH(i){ return POS_R[i].w * 148 / 300; }
function rTop(i){ return POS_R[i].pied - rH(i) * 0.946; }
function rCx(i){ return POS_R[i].x + POS_R[i].w * 0.58; }
function rCy(i){ return rTop(i) + rH(i) * 0.55; }
/* le module du rat (pièces articulées) a sa propre géométrie : un cadre 180 × 112, le sol à 85,7 % de la hauteur */
var RAT_MODULE = !!window.RatAnime, HEROS_MODULE = !!window.HerosAnime;
function cadreModule(i){
  var P = POS_R[i], W = P.w * .96, H = W * 112 / 180, x = P.x + P.w * .02, y = P.pied - H * .857;
  return {x:x, y:y, w:W, h:H};
}
function ventre(i){
  if(RAT_MODULE){ var c = cadreModule(i); return {x:c.x + c.w * 288 / 540, y:c.y + c.h * 196 / 336}; }
  return {x:POS_R[i].x + POS_R[i].w * .606, y:rTop(i) + rH(i) * .679};
}
function hCx(h){ return HER[h].x + 99; }
function hPt(h){ return {x:hCx(h), y:206}; }

/* ================= l'état ================= */
var E = SALLE.etat = {
  ecran:'sac', sac:[], essai:1, tour:0, toursTotal:0, livre:0, ratsVaincus:[false, false, false],
  h:{}, r:[], mode:'', sel:null, geste:null, occupe:false, texte:''
};
var A = {h:{}, r:[]};      /* les acteurs (modules ou images) */
SALLE.acteurs = A;

/* ================= outils ================= */
var jeu, monde, secousse, fx, fxHaut, bandeEl, bulleTxt, fenetre, hud;
function el(tag, cls, html){ var e = document.createElement(tag); if(cls) e.className = cls; if(html != null) e.innerHTML = html; return e; }
function q(s, r){ return (r || document).querySelector(s); }
function qa(s, r){ return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
function esc(t){ return String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;'); }
function lireBtn(t){ return '<button class="lire" data-act="lire" data-t="' + esc(t) + '" aria-label="Écouter">🔊</button>'; }
function relancer(e, cls){ e.classList.remove(cls); void e.offsetWidth; e.classList.add(cls); }

/* les images : de longues chaînes base64 transformées une fois en petites adresses (blob:) */
var URL_IMG = {};
function versBlob(d){
  try{
    var b = atob(d.split(',')[1]), n = b.length, u = new Uint8Array(n);
    for(var i = 0; i < n; i++) u[i] = b.charCodeAt(i);
    return URL.createObjectURL(new Blob([u], {type:'image/png'}));
  }catch(e){ return d; }
}
SALLE.img = function(nom){ return URL_IMG[nom] || ''; };
function chargerImages(){
  var I = window.IMAGES || {};
  Object.keys(I).forEach(function(k){ URL_IMG[k] = versBlob(I[k]); });
  var css = '';
  ORDRE.forEach(function(h){ css += '.img-' + h + '{background-image:url(' + URL_IMG['heros-' + h] + ')}'; });
  css += '.img-rat{background-image:url(' + URL_IMG['rat-jaune'] + ')}';
  var st = el('style'); st.textContent = css; document.head.appendChild(st);
  /* les textures des effets sont décodées tout de suite (sinon, le premier critique ou le premier nuage hoquette) */
  var garde = el('div'); garde.style.cssText = 'position:fixed;left:-9999px;top:0;width:1px;height:1px;overflow:hidden';
  ['fumee-a', 'fumee-b', 'fumee-c', 'brume-a', 'brume-b', 'flamme', 'rat-rouge', 'rat-jaune', 'choc-a', 'choc-b'].forEach(function(k){
    var im = new Image(); im.src = URL_IMG[k]; if(im.decode) im.decode().catch(function(){}); im.style.cssText = 'width:200px;height:200px'; garde.appendChild(im);
  });
  document.body.appendChild(garde);
}
function tete(h, t, f, dy){
  var k = t / f, c = HER[h].tete;
  return 'background-size:' + (280 * k).toFixed(1) + 'px ' + (320 * k).toFixed(1) + 'px;background-position:' + (-(c[0] - f / 2) * k).toFixed(1) + 'px ' + (-(c[1] - f / 2 + (dy || 0)) * k).toFixed(1) + 'px';
}

/* ================= la voix (seulement sur un bouton 🔊) ================= */
var voix = null;
function noteVoix(x){
  var n = (x.name || '') + ' ' + (x.voiceURI || ''), s = 0;
  if(/natural|neural|premium|enhanced|améliorée|wavenet|studio/i.test(n)) s += 50;
  if(/google/i.test(n)) s += 15;
  if(/(Amélie|Thomas|Audrey|Marie|Denise|Hortense|Julie|Henri|Vivienne|Rémi|Eloise|Celeste)/i.test(n)) s += 10;
  if(/fr[-_]FR/i.test(x.lang)) s += 5;
  if(/compact|espeak|robot/i.test(n)) s -= 40;
  return s;
}
function choisirVoix(){
  try{ var v = speechSynthesis.getVoices().filter(function(x){ return /^fr/i.test(x.lang); }); v.sort(function(a, b){ return noteVoix(b) - noteVoix(a); }); voix = v[0] || null; }catch(e){}
}
try{ choisirVoix(); speechSynthesis.onvoiceschanged = choisirVoix; }catch(e){}
function lire(t){
  t = String(t || '').replace(/[«»]/g, '').replace(/[←-⯿\uD83C-􏰀-\uDFFF️]/g, '').replace(/\s+/g, ' ').trim();
  if(!t) return;
  try{
    speechSynthesis.cancel();
    var u = new SpeechSynthesisUtterance(t);
    u.lang = 'fr-FR'; if(voix) u.voice = voix; u.rate = .95;
    speechSynthesis.speak(u);
  }catch(e){}
}
function taire(){ try{ speechSynthesis.cancel(); }catch(e){} }

/* ================= le conteur ================= */
function conte(t){
  E.texte = t;
  if(!bulleTxt) return;
  bulleTxt.textContent = t;
  relancer(bulleTxt.parentNode, 'pop');
}

/* ================= la mise à l'échelle ================= */
function ajuster(){
  var w = window.innerWidth, h = window.innerHeight;
  q('#tourne').hidden = !(h > w * 1.05);
  var s = Math.min(w / 960, h / 540);
  jeu.style.transform = 'translate(' + Math.round((w - 960 * s) / 2) + 'px,' + Math.round((h - 540 * s) / 2) + 'px) scale(' + s + ')';
}

/* =====================================================================
   1) LE SAC
   ===================================================================== */
function ecranSac(){
  E.ecran = 'sac'; taire();
  jeu.innerHTML = '';
  var s = el('div', 'ecran'); s.id = 'sac';
  var phrase = !E.sacAvant ? 'Avant de descendre, l\'Alchimiste remplit son sac : trois recettes, pas une de plus.'
    : 'L\'Alchimiste vide son sac sur la table. Les mêmes recettes, ou d\'autres ? Trois, pas une de plus.';
  s.innerHTML = '<img class="fond" src="' + URL_IMG.decor + '" alt=""><div class="voile"></div>' +
    '<h1>Le sac d\'alchimiste</h1>' +
    '<button id="bruitages" class="sombre rond" data-act="bruitages" aria-label="Couper ou remettre les sons et la musique"></button>' +
    '<div class="bulle"><span class="txt"></span><button class="lire" data-act="lire-bulle" aria-label="Écouter">🔊</button></div>' +
    '<div class="alchi"><img src="' + URL_IMG['heros-alchimiste'] + '" alt=""></div>' +
    '<div class="sac-poche"><b>Dans le sac</b><div class="sac-cases"></div></div>' +
    '<div class="recettes">' + ORDRE_REC.map(function(id){
      var r = RECETTES[id];
      return '<div class="recette" role="button" data-act="recette-sac" data-id="' + id + '"><span class="coche">✓</span><img src="' + URL_IMG['potion-' + id] + '" alt="">' +
        '<b>' + r.nom + '</b><small>' + r.long + '</small>' + lireBtn(r.nom + '. ' + r.long) + '</div>';
    }).join('') + '</div>' +
    '<div class="compte"></div>' +
    '<button class="aller" data-act="descendre" disabled>Descendre ⬇</button>';
  jeu.appendChild(s);
  bulleTxt = q('#sac .bulle .txt');
  majBoutonSon();
  Son.musique('explo');        /* elle démarre au premier toucher (le navigateur l'exige) */
  conte(phrase);
  if(E.sacAvant) E.sac = E.sacAvant.slice();
  majSac();
}
function majSac(neuve){
  qa('#sac .recette').forEach(function(b){ var c = E.sac.indexOf(b.getAttribute('data-id')) >= 0; b.classList.toggle('choisie', c); b.classList.toggle('guide', !c && E.sac.length < 3); });
  q('#sac .sac-cases').innerHTML = [0, 1, 2].map(function(k){
    var id = E.sac[k];
    return id ? '<div class="sac-case pleine"' + (id === neuve ? '' : ' style="animation:none"') + '><img src="' + URL_IMG['potion-' + id] + '" alt=""></div>' : '<div class="sac-case"></div>';
  }).join('');
  var n = E.sac.length, b = q('#sac .aller');
  b.disabled = n < 3;
  b.classList.toggle('guide', n === 3);
  q('#sac .compte').innerHTML = '🎒 <b>' + n + '</b> / <b>3</b>';
}
function toucherRecette(id, bouton){
  var k = E.sac.indexOf(id);
  son('clic');
  if(k >= 0){ E.sac.splice(k, 1); majSac(); conte(RECETTES[id].nom + ' retourne sur l\'étagère.'); return; }
  if(E.sac.length >= 3){
    relancer(bouton, 'non');
    conte('Le sac est plein à craquer ! Pour celle-ci, il faudrait en reposer une.');
    return;
  }
  E.sac.push(id); majSac(id);
  var phrases = {feu:'Une Fiole de feu, qui crépite dans sa bouteille.', fumigene:'Un Fumigène. Ça sent la vieille chaussette.', huile:'Une bouteille d\'Huile, bien glissante.',
    colle:'Un pot de Colle. Attention aux doigts !', baume:'Un Baume tout doux, pour les bobos.', coeur:'Un Cœur vaillant, qui bat tout seul dans sa fiole.'};
  conte(phrases[id] + (E.sac.length === 3 ? ' Le sac est prêt !' : ''));
}

/* =====================================================================
   2) LE COMBAT
   ===================================================================== */
function vivants(){ return E.r.filter(function(r){ return !r.mort; }); }
function devant(){ return vivants()[0] || null; }
function debout(){ return ORDRE.filter(function(h){ return !E.h[h].sol; }); }
function dispo(){ return ORDRE.filter(function(h){ return !E.h[h].sol && !E.h[h].joue; }); }

async function debutCombat(){
  E.sacAvant = E.sac.slice();
  E.ratsVaincus = [false, false, false];     /* la sauvegarde, c'est l'entrée : les trois rats sont là, en pleine forme */
  E.tour = 0; E.mode = 'entree'; E.sel = null; E.geste = null; E.occupe = true;
  Son.musique('combat');
  E.h = {};
  ORDRE.forEach(function(h){ E.h[h] = {pv:HER[h].pv, sol:false, joue:false, bouclier:false, dome:null}; });
  E.r = [0, 1, 2].map(function(i){ return {i:i, pv:RAT_PV, mort:E.ratsVaincus[i], ouvert:false, comment:'', enrage:false, brule:false, colle:false, vise:null, flaque:null}; });
  construireCombat();
  /* la salle est vide ; les héros entrent en courant par la gauche (celui de devant d'abord) */
  await attendre(450);
  son('pasHeros', 1.7, 3);
  await Promise.all(EXPOSES.map(function(h, k){
    return attendre(k * 230).then(function(){ q('.h-' + h).style.visibility = 'visible'; return A.h[h].entrer(HER[h].x + 260); }).then(function(){ return A.h[h].attendre(); });
  }));
  await attendre(250);
  /* puis les rats, par la droite (celui de devant d'abord) */
  var v = vivants();
  son('pasRats', 1.5); son('couine', .3, 1); son('couine', .7, 1.15);
  await Promise.all(v.map(function(r, k){
    return attendre(k * 210).then(function(){ q('.r-' + r.i).style.visibility = 'visible'; return A.r[r.i].entrer(); })
      .then(function(){ return A.r[r.i].yeux('jaune'); }).then(function(){ return A.r[r.i].attendre(); });
  }));
  await attendre(250);
  v.forEach(function(r){ r.repos = pointTete(r.i); });     /* la tête au repos : les badges suivront ses mouvements à partir de là */
  son('couine', 0, .9, 1.4);
  await attendre(350);
  /* ensuite seulement : le conteur parle et la bande s'ouvre */
  q('#combat').classList.add('ouvert');
  var n = v.length;
  var intro = n === 3 ? 'Trois rats d\'égout sortent du noir ! Au-dessus de chacun, on voit qui il veut mordre.'
    : n === 2 ? 'Les deux rats qui restent vous attendaient. Au-dessus de chacun, on voit qui il veut mordre.'
    : 'Le dernier rat vous attendait, tout seul et très en colère.';
  await attendre(300);
  nouveauTour(intro);
}

function construireCombat(){
  E.ecran = 'combat';
  jeu.innerHTML = '';
  A.h = {}; A.r = [];
  var c = el('div', 'ecran'); c.id = 'combat';
  c.innerHTML = '<div id="monde"><div id="secousse"><img class="decor" src="' + URL_IMG.decor + '" alt=""><div id="sol-fx"></div><div id="persos"></div><div id="fx"></div><div id="fumee"></div><div id="hud"></div></div></div>' +
    '<div id="haut"><div id="salle-nom"><b>Salle des rats</b><span id="tour-nom"></span></div>' +
    '<div class="bulle"><span class="txt"></span><button class="lire" data-act="lire-bulle" aria-label="Écouter">🔊</button></div>' +
    '<button id="bruitages" class="sombre rond" data-act="bruitages" aria-label="Couper ou remettre les sons et la musique"></button>' +
    '<button id="fuite" class="sombre" data-act="fuite">🏃 Fuite !</button></div>' +
    '<div id="bande"></div><div id="ecran-fx"></div><div id="fx-haut"></div>';
  jeu.appendChild(c);
  monde = q('#monde'); secousse = q('#secousse'); fx = q('#fx'); fxHaut = q('#fx-haut'); bandeEl = q('#bande'); bulleTxt = q('#haut .bulle .txt'); hud = q('#hud');
  Fx.init({fx:fx, sol:q('#sol-fx'), fumee:q('#fumee'), ecran:q('#ecran-fx'), monde:monde, secousse:secousse});
  majBoutonSon();
  var FH = window.HerosAnime || SALLE.HerosImage, FR = window.RatAnime || SALLE.RatImage;
  var p = q('#persos');
  ORDRE.forEach(function(h){
    var d = el('div', 'perso heros h-' + h);
    d.style.left = (HER[h].x - 40) + 'px'; d.style.zIndex = 10 + ORDRE.indexOf(h); d.style.visibility = 'hidden';
    d.innerHTML = '<div class="ombre"></div><div class="anneau"><i></i></div><div class="acteur"></div>' +
      '<div class="check">✓</div><div class="etoiles">💫</div><div class="cri">Fuite !</div>' +
      '<div class="badge-bouclier">🛡️ −50 % · 1 tour</div>';
    p.appendChild(d);
    var ach = q('.acteur', d);
    if(HEROS_MODULE){   /* le module dessine dans une boîte 200 × 240 (repère 250 × 300, pieds en bas) : celle du dessin d'avant */
      ach.style.cssText = 'left:40px;top:40px;width:200px;height:240px';
      d.classList.add('module');
    }
    A.h[h] = FH.creer(ach, h, LOOK[h]);
    var z = el('div', 'zone'); z.setAttribute('data-act', 'perso'); z.setAttribute('data-type', 'heros'); z.setAttribute('data-id', h);
    z.style.cssText = 'left:' + (hCx(h) - 58) + 'px;top:96px;width:116px;height:276px';
    hud.appendChild(z);
    var pv = el('div', 'pv'); pv.id = 'pv-' + h; pv.style.left = hCx(h) + 'px';
    pv.innerHTML = '<div class="barre"><i></i></div><b></b>';
    hud.appendChild(pv);
  });
  E.r.forEach(function(r){
    var i = r.i, P = POS_R[i], h = rH(i);
    var d = el('div', 'perso rat r-' + i);
    d.style.cssText = 'left:' + P.x + 'px;top:' + rTop(i).toFixed(1) + 'px;width:' + P.w + 'px;height:' + h.toFixed(1) + 'px;z-index:' + P.z + ';visibility:hidden';
    d.innerHTML = '<div class="ombre" style="left:14%;width:76%;top:86%;height:16%"></div>' +
      '<div class="anneau" style="left:' + (P.w * 0.58 - 65).toFixed(1) + 'px;top:' + (h * 0.946 - 14).toFixed(1) + 'px"><i></i></div><div class="acteur"></div>';
    p.appendChild(d);
    var ac = q('.acteur', d);
    if(RAT_MODULE){   /* le module remplit un cadre à ses mesures, posé pour que ses pattes tombent sur la ligne du sol */
      var c = cadreModule(i);
      ac.style.cssText = 'left:' + (c.x - P.x).toFixed(1) + 'px;top:' + (c.y - rTop(i)).toFixed(1) + 'px;width:' + c.w.toFixed(1) + 'px;height:' + c.h.toFixed(1) + 'px';
      d.classList.add('module');
    }
    A.r[i] = FR.creer(ac);
    if(r.mort){ d.classList.add('parti'); return; }
    var b = el('div', 'badges'); b.id = 'badges-' + i;
    b.style.left = rCx(i) + 'px'; b.style.top = (rTop(i) - 40) + 'px';
    hud.appendChild(b);
    var z = el('div', 'zone'); z.setAttribute('data-act', 'perso'); z.setAttribute('data-type', 'rat'); z.setAttribute('data-id', String(i));
    z.style.cssText = 'left:' + (rCx(i) - 56) + 'px;top:' + (rTop(i) - 44) + 'px;width:112px;height:' + (372 - rTop(i) + 44) + 'px';
    hud.appendChild(z);
    var pv = el('div', 'pv monstre'); pv.id = 'pv-r' + i; pv.style.left = rCx(i) + 'px';
    pv.innerHTML = '<div class="barre"><i></i></div><b></b>';
    hud.appendChild(pv);
  });
  majBarres();
  suivreBadges();
}
function slotH(h){ return q('.h-' + h); }

/* ---------- les badges suivent le rat (la cible, la flamme, la rage, la colle) ----------
   Le module dessine le rat en pièces articulées : à chaque image, on lit où sont son dos et le haut de sa tête
   (quand il se dresse, bondit pour mordre ou tombe sur le dos), et on déplace ses badges d'autant :
   de côté comme le dos (sur le dos, la tête part de l'autre côté, vers le voisin), en hauteur comme la tête. */
function pointSvg(rr, nom, x, y){   /* un point du dessin, en pixels de la boîte du rat (tous les mouvements compris, même le bond) */
  var p = rr.svg.createSVGPoint(); p.x = x; p.y = y;
  return p.matrixTransform(rr.A[nom].getCTM());
}
function pointTete(i){
  var rr = A.r[i] && A.r[i]._rat;
  if(!rr || !rr.svg || !rr.A || !rr.A.tete || !rr.A.dos) return null;
  try{
    var pd = pointSvg(rr, 'dos', 330, 300), pt = pointSvg(rr, 'tete', 150, 226), c = cadreModule(i);
    return {x:c.x + pd.x, y:c.y + pt.y};
  }catch(e){ return null; }
}
var suiviId = 0;
function suivreBadges(){
  var mon = ++suiviId, lisse = {};
  function pas(){
    if(mon !== suiviId || E.ecran !== 'combat') return;
    E.r.forEach(function(r){
      var b = q('#badges-' + r.i);
      if(!b || r.mort || !r.repos) return;
      var p = pointTete(r.i); if(!p) return;
      var l = lisse[r.i] || (lisse[r.i] = {x:0, y:0});
      l.x += (p.x - r.repos.x - l.x) * .5; l.y += (p.y - r.repos.y - l.y) * .5;
      var dy = Math.max(l.y, 92 - (rTop(r.i) - 40));                   /* jamais sous la bande du haut */
      b.style.transform = 'translate(' + l.x.toFixed(1) + 'px,' + dy.toFixed(1) + 'px) translateX(-50%)';
    });
    requestAnimationFrame(pas);
  }
  requestAnimationFrame(pas);
}
function slotR(r){ return q('.r-' + r.i); }
function majBoutonSon(){ var b = q('#bruitages'); if(b) b.textContent = Son.actif() ? '🎵' : '🔇'; }   /* coupe tout : bruitages et musique */

function majBarres(){
  ORDRE.forEach(function(h){
    var e = q('#pv-' + h); if(!e) return;
    var s = E.h[h], k = s.pv / HER[h].pv, i = q('i', e);
    i.style.transform = 'scaleX(' + k + ')';
    i.className = k <= .25 ? 'bas' : k <= .5 ? 'moyen' : '';
    q('b', e).textContent = s.pv;
  });
  E.r.forEach(function(r){
    var e = q('#pv-r' + r.i); if(!e) return;
    q('i', e).style.transform = 'scaleX(' + (r.pv / RAT_PV) + ')';
    q('b', e).textContent = r.pv;
    e.style.opacity = r.mort ? 0 : 1;
  });
}
function majBadges(){
  E.r.forEach(function(r){
    var b = q('#badges-' + r.i); if(!b) return;
    if(r.mort){ b.innerHTML = ''; return; }
    var s = '';
    if(r.vise && E.mode !== 'fin'){
      var h = r.vise, c = HER[h].coul;
      s += '<div class="vise-bloc"><span class="vise-fleche" style="border-right-color:' + c + '"></span><span class="vise" style="border-color:' + c + '"><i class="img-' + h + '" style="' + tete(h, 32, 74, 4) + '"></i></span></div>';
    }
    var e = '';
    if(r.enrage) e += '<span class="etat">💢×2</span>';
    if(r.brule) e += '<span class="etat e-feu">🔥−4</span>';
    if(r.colle) e += '<span class="etat e-colle"><img src="' + URL_IMG['potion-colle'] + '" alt="">collé</span>';
    if(e) s += '<div class="etats">' + e + '</div>';   /* les états s'empilent en colonne : la rangée ne déborde pas sur le voisin */
    b.innerHTML = s;
  });
}
function majScene(){
  var m = E.mode, cibles = ciblesValides();
  ORDRE.forEach(function(h){
    var e = slotH(h), s = E.h[h]; if(!e) return;
    var tourHeros = m === 'qui' || m === 'gestes' || m === 'cible' || m === 'action';
    e.classList.toggle('joue', tourHeros && s.joue && !s.sol);
    e.classList.toggle('sol', s.sol);
    e.classList.toggle('protege', !!s.bouclier);
    var d = (m === 'qui' && !s.sol && !s.joue) || (m === 'cible' && cibles.heros.indexOf(h) >= 0);
    e.classList.toggle('dispo', d);
    var actif = (m === 'gestes' || (m === 'cible' && !d) || m === 'action') && E.sel === h;
    if(e.classList.contains('actif') !== actif){ e.classList.toggle('actif', actif); if(A.h[h]) A.h[h].choisi(actif); }
  });
  E.r.forEach(function(r){
    var e = slotR(r); if(!e || r.mort) return;
    e.classList.toggle('dispo', m === 'cible' && cibles.rats.indexOf(r.i) >= 0);
    e.classList.toggle('ouvert', r.ouvert);
  });
  majBadges();
  var t = q('#tour-nom'); if(t) t.innerHTML = E.tour ? 'Tour ' + E.tour + (E.essai > 1 ? ' <i>·</i> Essai ' + E.essai : '') : '';
  var f = q('#fuite'); if(f) f.disabled = E.occupe;
}
function ciblesValides(){
  var o = {rats:[], heros:[]};
  if(E.mode !== 'cible' || !E.geste) return o;
  var t = typeCible(E.geste);
  if(t === 'rat' || t === 'salle') o.rats = vivants().map(function(r){ return r.i; });
  if(t === 'devant'){ var d = devant(); if(d) o.rats = [d.i]; }
  if(t === 'heros') o.heros = debout();
  if(t === 'sol') o.heros = ORDRE.filter(function(h){ return E.h[h].sol; });
  return o;
}
function typeCible(g){ return g.indexOf('p:') === 0 ? RECETTES[g.slice(2)].cible : GESTES[g].cible; }

/* ---------------- la bande du bas ---------------- */
function pvB(h){
  var s = E.h[h], k = s.pv / HER[h].pv;
  return '<span class="pv-b"><span class="barre"><i class="' + (k <= .25 ? 'bas' : k <= .5 ? 'moyen' : '') + '" style="width:' + (k * 100) + '%"></i></span><b>' + s.pv + '</b></span>';
}
function boutonLivre(){
  return '<button class="b-livre" data-act="livre"><span>📖</span><small>Grand<br>Livre</small>' + (E.livre ? '<i class="nb">' + E.livre + '</i>' : '') + '</button>';
}
function bande(){
  if(!bandeEl) return;
  var m = E.mode, s = '';
  bandeEl.classList.toggle('attend', m === 'action' || m === 'rats');
  if(m === 'qui' || m === 'rats' || m === 'fin' || !E.sel){
    if(m === 'rats') s += '<div class="b-titre"><small>Tour ' + E.tour + '</small><b>Les rats !</b><em>Ils attaquent…</em></div>';
    else if(m === 'fin') s += '<div class="b-titre"><small>Tour ' + E.tour + '</small><b>' + (vivants().length ? 'Fuite !' : 'Victoire !') + '</b></div>';
    else s += '<div class="b-titre"><small>Tour ' + E.tour + '</small><b>Qui joue ?</b>' + (dispo().length < debout().length ? '<em>' + dispo().length + ' à jouer</em>' : '') + '</div>';
    s += '<div class="b-qui">' + ORDRE.map(function(h){
      var st = E.h[h], j = st.joue && m === 'qui', cls = st.sol ? ' sol' : (j ? ' joue' : (m === 'qui' ? ' guide' : ''));
      var etat = st.sol ? 'au sol 💫' : j ? 'a joué' : (m === 'qui' ? 'prêt !' : '');
      return '<button class="b-heros' + cls + '" data-act="heros" data-id="' + h + '"><span class="portrait img-' + h + '" style="' + tete(h, 76, 116, 10) + '"></span>' +
        '<b>' + HER[h].nom + '</b>' + pvB(h) + '<em>' + etat + '</em>' + (j && !st.sol ? '<span class="ok">✓</span>' : '') + (st.bouclier ? '<span class="bouc-b">🛡️</span>' : '') + '</button>';
    }).join('') + '</div>';
    s += boutonLivre();
    bandeEl.innerHTML = s;
    return;
  }
  var h = E.sel, H = HER[h];
  s += '<div class="b-moi"><span class="portrait img-' + h + '" style="' + tete(h, 86, 116, 10) + '"></span>' +
    '<button class="b-retour" data-act="retour" aria-label="Changer de héros">↩</button>' +
    '<b class="b-nom">' + H.nom + '</b>' + pvB(h) + '</div>';
  s += '<div class="b-sep"></div><div class="b-sec"><div class="b-lbl">Ses gestes</div><div class="b-cartes">' +
    H.gestes.map(function(g){ return carteGeste(g); }).join('') +
    '<div class="bientot"><div><b>?</b><small>bientôt</small></div><div><b>?</b><small>bientôt</small></div></div></div></div>';
  if(H.sac){
    s += '<div class="b-sep"></div><div class="b-sec"><div class="b-lbl">' + H.sac + '</div><div class="b-cartes">' +
      E.sac.map(function(id){ return carteRecette(h, id); }).join('') + '</div></div>';
  }
  s += boutonLivre();
  bandeEl.innerHTML = s;
}
function carteGeste(g){
  var G = GESTES[g], cls = E.geste === g ? ' choisie' : (E.mode === 'gestes' ? ' guide' : '');
  return '<button class="carte' + cls + '" data-act="geste" data-id="' + g + '"><span class="c-ic">' + G.ic + '</span><b>' + G.nom + '</b><small>' + G.d + '</small></button>';
}
function recetteOk(h, id){
  var r = RECETTES[id];
  if(h === 'pisteur') return r.fleche;
  if(id === 'coeur') return ORDRE.some(function(x){ return E.h[x].sol; });
  return true;
}
function carteRecette(h, id){
  var r = RECETTES[id], ok = recetteOk(h, id), g = 'p:' + id;
  var cls = !ok ? ' off' : E.geste === g ? ' choisie' : (E.mode === 'gestes' ? ' guide' : '');
  var d = ok ? r.d : (h === 'pisteur' ? 'pas en flèche' : 'personne au sol');
  return '<button class="carte' + cls + '" data-act="geste" data-id="' + g + '">' + (h === 'pisteur' && ok ? '<span class="fl">🏹</span>' : '') + '<span class="inf">∞</span>' +
    '<span class="c-ic"><img src="' + URL_IMG['potion-' + id] + '" alt=""></span><b>' + r.nom + '</b><small>' + d + '</small></button>';
}

/* ---------------- les tours ---------------- */
function nouveauTour(phrase){
  E.tour++; E.toursTotal++;
  ORDRE.forEach(function(h){ E.h[h].joue = false; });
  vivants().forEach(function(r){ r.vise = viser(); });
  E.mode = 'qui'; E.sel = null; E.geste = null; E.occupe = false;
  var debuts = ['Les rats grincent des dents… Chacun a choisi sa proie.', 'Ça sent le fromage moisi et la bagarre.', 'Les moustaches frémissent. Les yeux vous fixent.', 'Un rat se lèche les babines. Ce n\'est pas bon signe.'];
  conte(phrase || 'Tour ' + E.tour + '. ' + debuts[(E.tour - 2 + debuts.length) % debuts.length]);
  bande(); majScene(); majBarres();
}
function viser(){
  var d = debout(), tot = 0;
  d.forEach(function(h){ tot += VISEE[h]; });
  var x = R() * tot;
  for(var k = 0; k < d.length; k++){ x -= VISEE[d[k]]; if(x < 0) return d[k]; }
  return d[0];
}
function choisirHeros(h){
  var s = E.h[h];
  if(s.sol){ conte(HER[h].Le + ' est au sol, la tête qui tourne.'); return; }
  if(s.joue){ conte(HER[h].Le + ' a déjà joué ce tour-ci. Chacun son tour !'); return; }
  son('clic');
  E.sel = h; E.geste = null; E.mode = 'gestes';
  var p = {sage:'Le Sage remonte ses lunettes et réfléchit. Que faire ?', alchimiste:'L\'Alchimiste fouille dans son sac qui cliquette. Que faire ?', pisteur:'Le Pisteur tend l\'oreille, une flèche entre les doigts. Que faire ?'};
  conte(p[h]);
  bande(); majScene();
}
function choisirGeste(g){
  var h = E.sel;
  if(g.indexOf('p:') === 0 && !recetteOk(h, g.slice(2))){
    var id = g.slice(2);
    conte(h === 'pisteur' ? 'Une flèche trempée dans ' + (id === 'baume' ? 'le Baume' : id === 'coeur' ? 'le Cœur vaillant' : 'le Fumigène') + ' ? Ça ne tiendrait pas sur la pointe.' : 'Personne n\'est au sol. Le Cœur vaillant attendra son heure.');
    return;
  }
  son('clic');
  E.geste = g; E.mode = 'cible';
  var t = typeCible(g), qn = {rat:'Sur quel rat ?', devant:'Seul le rat de devant est à portée. On y va ?', heros:'Pour qui ?', sol:'Qui relever ?', salle:'Le nuage remplira toute la salle. On le lance sur la bande ?'};
  var txt = qn[t];
  if(g === 'louche') txt = 'Le rat de devant est à portée de louche. On y va ?';
  if(g === 'bouclier') txt = 'Qui protéger ?';
  if(g === 'herbes' || g === 'p:baume') txt = 'Qui a besoin de soins ?';
  if(g === 'etudier') txt = 'Quel rat observer ?';
  conte(txt);
  bande(); majScene();
}
function retour(){
  if(E.occupe) return;
  E.sel = null; E.geste = null; E.mode = 'qui';
  conte('Alors, qui joue ?');
  bande(); majScene();
}
function toucherPerso(type, id){
  if(E.occupe) return;
  var cb = ciblesValides();
  if(type === 'heros'){
    if(E.mode === 'cible' && cb.heros.indexOf(id) >= 0) return agir(E.sel, E.geste, {heros:id});
    if(E.mode === 'cible' && typeCible(E.geste) === 'sol'){ conte(HER[id].Le + ' tient encore debout. Le Cœur vaillant, c\'est pour quelqu\'un qui est au sol.'); return; }
    if(E.mode === 'qui' || E.mode === 'gestes' || E.mode === 'cible'){ if(id !== E.sel || E.mode === 'qui') choisirHeros(id); }
    return;
  }
  var r = E.r[+id]; if(!r || r.mort) return;
  if(E.mode === 'cible' && cb.rats.indexOf(r.i) >= 0) return agir(E.sel, E.geste, {rat:r});
  if(E.mode === 'cible' && typeCible(E.geste) === 'devant'){ conte('Trop loin ! Seul le rat de devant est à portée.'); return; }
  if(E.mode === 'qui' || E.mode === 'gestes' || E.mode === 'cible'){
    var t = 'Ce rat a l\'œil sur ' + HER[r.vise].le + '.';
    if(r.ouvert) t = 'Ce rat est ventre à l\'air ! Il ne fait plus le malin.';
    else if(r.colle) t = 'Ce rat a les pattes collées. Il enrage.';
    if(r.enrage) t += ' Il est enragé : il mordra deux fois !';
    if(r.brule) t += ' Et il brûle encore.';
    conte(t);
  }
}

/* ---------------- les gestes ---------------- */
async function agir(h, g, c){
  E.occupe = true; E.mode = 'action';
  bande(); majScene();
  try{ await faire(h, g, c); }catch(e){ if(window.console) console.error(e); }
  E.h[h].joue = true;
  await attendre(220);
  return apres();
}
function apres(){
  if(!vivants().length) return victoire();
  E.sel = null; E.geste = null;
  if(!dispo().length) return tourDesRats();
  E.mode = 'qui'; E.occupe = false;
  bande(); majScene(); majBarres();
}
async function faire(h, g, c){
  var r = c.rat, cible = c.heros;
  if(g === 'etudier') return etudier(r);
  if(g === 'rune') return rune(r);
  if(g === 'bouclier') return bouclier(cible);
  if(g === 'louche') return louche();
  if(g === 'herbes') return herbes(cible);
  if(g === 'fleche') return fleche(r, null);
  if(g === 'dague') return dague(devant());
  var id = g.slice(2);
  if(h === 'pisteur') return fleche(r, id);
  return lancer(id, c);
}
function pointRat(r){ return {x:rCx(r.i) - 20, y:rCy(r.i)}; }

/* Le Sage étudie : le Grand Livre se remplit */
async function etudier(r){
  conte('Le Sage observe le rat de près… de très près.');
  son('page');
  var loupe = el('div', 'page-vol', '🔍'); fx.appendChild(loupe);
  var x0 = HER.sage.x + 122, y0 = 214, x1 = rCx(r.i), y1 = rCy(r.i);
  await Promise.all([A.h.sage.etudier(), Fx.vol(loupe, x0, y0, x1, y1 - 20, 40, 480, 0)]);
  Fx.mot(x1, y1 - 50, '?', 'croc');
  await attendre(380);
  loupe.remove();
  if(E.livre >= LIVRE.length){ conte('Le Sage relit tout. Le Grand Livre n\'en dit pas plus sur les rats.'); return attendre(500); }
  var ligne = LIVRE[E.livre];
  E.livre++;
  conte('Le Grand Livre dit : « ' + ligne + ' »');
  son('page'); son('magie', .2);
  var b = q('.b-livre'), bx = 905, by = 462;
  if(b){ var rb = b.getBoundingClientRect(), rj = jeu.getBoundingClientRect(), k = rj.width / 960; bx = (rb.left + rb.width / 2 - rj.left) / k; by = (rb.top + rb.height / 2 - rj.top) / k; }
  var page = el('div', 'page-vol', '📜'); fxHaut.appendChild(page);
  await Fx.vol(page, x1, y1 - 30, bx, by, 120, 650, 360);
  page.remove(); bande();
  var nb = q('.b-livre'); if(nb) relancer(nb, 'neuf');
  return attendre(650);
}
/* Le Sage : la rune de lumière ouvre le point faible */
async function rune(r){
  conte('Le Sage trace une rune dans l\'air…');
  son('magie');
  var to = pointRat(r);
  await A.h.sage.sort(fx, to);
  Fx.eclat(to.x, to.y, 260, 'radial-gradient(closest-side,#fff,rgba(191,248,255,.9) 30%,rgba(63,208,255,.4) 60%,rgba(63,208,255,0))', 600);
  Fx.etincelles(to.x, to.y, 14, ['#ffffff', '#bff8ff', '#8ff3ff']);
  son('magie', .05);
  if(r.ouvert){ son('couine', 0, 1.1, 1.4, r.enrage); conte('Ce rat est déjà dressé, ébloui comme une chouette en plein midi.'); return attendre(600); }
  await ouvrir(r, 'rune');
  conte('La rune éclate de lumière : le rat se dresse, le ventre à l\'air !');
  return attendre(550);
}
async function ouvrir(r, comment){
  r.ouvert = true; r.comment = comment;
  majScene();
  if(comment === 'huile') bruit('ratHuile', {cale:CULBUTE, enrage:r.enrage}, ['couine', 0, 1.3]);
  else bruit('ratLumiere', {enrage:r.enrage}, ['couine', 0, 1.3]);
  Fx.mot(rCx(r.i) - 40, rTop(r.i) - 6, '!');
  if(comment === 'huile') await A.r[r.i].retourner(true); else await A.r[r.i].ebloui(true);
  await A.r[r.i].cible(true);
}
async function fermer(r){
  var dos = r.comment === 'huile';
  r.ouvert = false; r.comment = '';
  await A.r[r.i].cible(false);
  if(dos) await A.r[r.i].retourner(false); else await A.r[r.i].ebloui(false);
}
/* Le Sage : le bouclier de runes (on voit combien il absorbe et combien de temps il dure) */
async function bouclier(h){
  son('dome');
  var s = slotH(h);
  var dome = await A.h.sage.bouclier(fx, q('.acteur', s));   /* le conteneur du héros protégé : le dôme se pose dessus */
  E.h[h].bouclier = true; E.h[h].dome = dome;
  majScene(); bande();
  conte('Un dôme de runes bleues protège ' + HER[h].le + ' : la moitié des morsures glissera dessus, pendant un tour.');
  return attendre(650);
}
/* L'Alchimiste : le coup de louche (BONG !) — les rats deviennent ENRAGÉS jusqu'à la fin */
async function louche(){
  var r = devant(), to = pointRat(r);
  conte('L\'Alchimiste lève sa grosse louche…');
  /* le module frappe sa marmite (son « BONG ! » à lui, vers 600 ms) et se résout à la fin du geste ;
     l'acteur « images » court frapper le rat et se résout au coup */
  var geste = A.h.alchimiste.louche(fx, to);
  await (HEROS_MODULE ? attendre(600) : geste);
  bruit('ratLouche', {}, ['bong']);
  if(!HEROS_MODULE){
    Fx.mot(to.x, to.y - 30, 'BONG !');
    for(var k = 0; k < 3; k++) setTimeout(function(){ Fx.onde(to.x, to.y, '#fff1b8', 300, 900); }, k * 140);
  } else for(var k2 = 0; k2 < 2; k2++) setTimeout(function(){ Fx.onde(to.x, to.y, '#fff1b8', 260, 800); }, 150 + k2 * 160);   /* le bruit arrive jusqu'aux rats */
  Fx.tremble(9, 380);
  var n = r.ouvert ? 10 : 2;
  await blesser(r, n, n > 5 ? '' : 'petit', true, 'aucun');
  var v = vivants();
  await attendre(250);
  if(!Son.bruitage) son('rage');
  v.forEach(function(x){ x.enrage = true; });
  majScene();
  await Promise.all(v.map(function(x){ return A.r[x.i].enrager(); }).concat([attendre(800)]));
  await geste;
  conte(v.length >= 3 ? 'BONG ! Les trois rats deviennent ENRAGÉS… et ils le resteront jusqu\'au bout !' : v.length === 2 ? 'BONG ! Les deux rats deviennent ENRAGÉS… et ils le resteront jusqu\'au bout !' : v.length === 1 ? 'BONG ! Le rat devient ENRAGÉ… et il le restera jusqu\'au bout !' : 'BONG ! Et voilà le travail.');
  return attendre(600);
}
/* les soins */
async function herbes(h){
  conte('L\'Alchimiste attrape une poignée d\'herbes…');
  await A.h.alchimiste.herbes(fx, hPt(h));
  return soin(h, 20, 'herbes');
}
async function soin(h, n, quoi){
  var s = E.h[h], avant = s.pv, relever = quoi === 'coeur';
  if(relever){ s.sol = false; s.pv = 40; son('coeur'); }
  else { s.pv = Math.min(HER[h].pv, s.pv + n); son('soin'); }
  var gagne = s.pv - (relever ? 0 : avant);
  var x = hCx(h), y = 200;
  for(var k = 0; k < 7; k++) (function(k){
    var e = el('div', 'etincelle', quoi === 'herbes' ? '🌿' : quoi === 'coeur' ? '💖' : '✨');
    e.style.left = (x - 60 + k * 20) + 'px'; e.style.top = (y + 40 - (k % 3) * 24) + 'px'; e.style.animationDelay = (k * 60) + 'ms';
    fx.appendChild(e); setTimeout(function(){ e.remove(); }, 1200);
  })(k);
  Fx.chiffre(x, y - 30, '+' + gagne, 'soin');
  majScene(); majBarres();
  if(relever){ await A.h[h].relever(); await A.h[h].attendre(); }
  if(relever) conte('Le Cœur vaillant bat fort : ' + HER[h].le + ' se relève avec 40 PV !');
  else if(gagne === 0) conte(HER[h].Le + ' est déjà en pleine forme. Au moins, ça sent bon.');
  else if(quoi === 'herbes') conte('Une poignée d\'herbes qui sentent bon : +' + gagne + ' pour ' + HER[h].le + '.');
  else conte('Le Baume fait son effet : +' + gagne + ' pour ' + HER[h].le + '.');
  return attendre(700);
}
/* Le Pisteur : la flèche (et la flèche trempée dans une potion) */
async function fleche(r, potion){
  conte(potion ? 'Le Pisteur trempe sa flèche dans la potion…' : 'Le Pisteur bande son arc…');
  var surprise = !potion && !r.ouvert && R() < 1 / 8;
  var to = r.ouvert ? ventre(r.i) : pointRat(r);
  bruit('arc', {cale:LACHER}, ['arc']);                 /* la corde lâche au bon moment du geste */
  bruit('vol', {dt:LACHER});                            /* et la flèche siffle dès qu'elle part */
  await A.h.pisteur.tirer(fx, to, potion || 'normale');
  bruit('chairF');                                      /* elle se plante */
  if(r.ouvert) return critique(r, 'Pile dans le ventre !');
  if(surprise) return critique(r, 'La flèche trouve la faille ! Coup de chance… ou de génie ?');
  if(potion){ son('verre'); Fx.eclabousse(to.x, to.y, RECETTES[potion].coul, true); return effetPotion(potion, r); }
  await blesser(r, 3, '', false, 'ratFleche');
  if(!r.mort) conte(choix(['La flèche rebondit sur le poil dur. Il ne sent presque rien.', 'Toc ! Le rat secoue la tête. Il ne sent presque rien.']));
  return attendre(300);
}
/* Le Pisteur : le coup de dague (le rat de devant) */
async function dague(r){
  conte('Le Pisteur bondit, la dague en avant !');
  bruit('swish', {cale:LAME}, ['dague']);
  var to = r.ouvert ? ventre(r.i) : pointRat(r);
  /* le module s'arrête 56 px avant le point visé : on vise l'avant du rat, la lame tombe sur lui */
  var vers = HEROS_MODULE ? {x:POS_R[r.i].x + POS_R[r.i].w * .3, y:to.y} : to;
  await A.h.pisteur.dague(fx, vers);
  bruit('chairD');
  if(r.ouvert) return critique(r, 'En plein dans le mille !');
  await blesser(r, 4, '', false, 'ratDague');
  if(!r.mort) conte('Tchac ! Le rat grogne, mais il tient bon. Il ne sent presque rien.');
  return attendre(300);
}
/* L'Alchimiste : préparer la potion (une fiole, des bulles), puis la lancer en arc */
async function lancer(id, c){
  conte('L\'Alchimiste prépare sa potion… blub, blub !');
  var coul = RECETTES[id].coul;
  var to = c.rat ? pointRat(c.rat) : hPt(c.heros);
  if(RECETTES[id].cible === 'salle') to = {x:rCx(1) - 10, y:rCy(1) - 6};
  son('bulles', .5);
  await A.h.alchimiste.preparer(coul);
  son('vole', .5);
  await A.h.alchimiste.lancer(fx, to, coul);
  son('verre');
  Fx.eclabousse(to.x, to.y, coul);
  if(id === 'baume') return soin(c.heros, 40, 'baume');
  if(id === 'coeur') return soin(c.heros, 40, 'coeur');
  if(id === 'fumigene') return fumigene(to);
  return effetPotion(id, c.rat);
}
async function effetPotion(id, r){
  if(id === 'feu'){
    bruit('ratFeu', {enrage:r.enrage}, ['feu', 1.4]);
    var dejaBrule = r.brule;
    r.brule = true; majScene();
    if(!dejaBrule) A.r[r.i].bruler(true);
    if(r.ouvert){ await blesser(r, 30, 'gros', false, 'aucun'); if(!r.mort) conte('WOUF ! Le feu en plein ventre ! Et le poil continue de brûler.'); return attendre(300); }
    await blesser(r, 5, '', false, 'aucun');
    if(!r.mort) conte(dejaBrule ? 'Encore du feu ! Il ne sent presque rien… mais il brûle toujours.' : 'Pfff… le poil prend feu ! Il ne sent presque rien… pour l\'instant. Ça va brûler jusqu\'au bout.');
    return attendre(300);
  }
  if(id === 'huile'){
    if(!r.flaque && !RAT_MODULE) r.flaque = Fx.flaque('huile', rCx(r.i) - 10, POS_R[r.i].pied - 10, POS_R[r.i].w * .8);
    if(r.ouvert){ conte('Ce rat est déjà ventre à l\'air : l\'huile coule pour rien.'); return attendre(600); }
    conte('Le rat glisse sur l\'huile…');
    await ouvrir(r, 'huile');
    conte('Le rat glisse sur l\'huile… et tombe sur le dos, le ventre à l\'air !');
    return attendre(550);
  }
  if(id === 'colle'){
    bruit('ratColle', {enrage:r.enrage}, ['splotch']);
    if(!r.flaque && !RAT_MODULE) r.flaque = Fx.flaque('colle', rCx(r.i) - 10, POS_R[r.i].pied - 8, POS_R[r.i].w * .78);
    r.colle = true; majScene();
    await A.r[r.i].coller(true);
    conte('Splotch ! Pattes collées : ce rat ne mordra pas cette fois-ci.');
    return attendre(650);
  }
  return attendre(200);
}
async function fumigene(to){
  var n = Fx.nuage(to.x, to.y);
  son('vole', .9);
  await n.plein;
  conte('Pfouuu ! Un nuage épais envahit la salle…');
  await attendre(250);
  /* les rats toussent : une quinte de quatre toux chacun (tousser() dure 2,6 s), dans le nuage puis en en sortant */
  await Promise.all(vivants().map(function(r, j){
    return attendre(j * 160).then(function(){
      var tousse = !!bruit('ratNuage', {enrage:r.enrage});
      [.14, .4, .62, .84].forEach(function(t){ setTimeout(function(){ if(!tousse) son('toux', 0, 1.8 + j * .15); Fx.mot(rCx(r.i) - 34, rTop(r.i) + 6, 'kof', 'croc'); }, 2600 * t / SALLE.vitesse); });
      return A.r[r.i].tousser();
    });
  }));
  conte('Kof, kof ! Les rats toussent… mais le nuage ne leur fait ni chaud ni froid.');
  return attendre(400);     /* le nuage finit de se dissiper pendant la suite */
}

/* ---------------- les coups, les dégâts, le critique, la fuite des rats ---------------- */
async function blesser(r, n, cls, sansFuite, cri){
  r.pv = Math.max(0, r.pv - n);
  Fx.chiffre(rCx(r.i), rTop(r.i) + 6, '−' + n, cls);
  if(cri !== 'aucun') bruit(cri || 'ratFleche', {dt:.02, enrage:r.enrage}, ['impact', n >= 20 ? 1.4 : .8]);
  majBarres();
  await A.r[r.i].touche();
  if(r.pv <= 0) return ratFuit(r);
}
/* un rat battu SANS critique s'enfuit de peur */
async function ratFuit(r, phrase){
  r.mort = true; r.ouvert = false; r.colle = false;
  E.ratsVaincus[r.i] = true;
  majBadges(); majBarres();
  conte(phrase || 'Le rat détale en couinant, la queue entre les pattes !');
  bruit('ratFuite', {dt:.45}, ['fuiteRat']);
  await A.r[r.i].fuir();
  finRat(r);
}
function finRat(r, explose){
  var s = slotR(r);
  if(s) s.classList.add(explose && RAT_MODULE ? 'cendre' : 'parti');   /* le module laisse un tas de cendre à sa place */
  var z = q('.zone[data-type="rat"][data-id="' + r.i + '"]'); if(z) z.remove();
  if(r.flaque){ r.flaque(); r.flaque = null; }
}
async function critique(r, phrase){
  var n = r.pv, c = ventre(r.i);
  r.pv = 0; r.mort = true; r.ouvert = false;
  E.ratsVaincus[r.i] = true;
  majBadges();
  /* le moment où le rat éclate : le module ajoute son calque d'explosion (.ra-scene-fx) ; l'acteur « images » donne .boom */
  var boomOk, boomP = new Promise(function(ok){ boomOk = ok; });
  var mo = new MutationObserver(function(){ if(fx.querySelector('.ra-scene-fx')){ mo.disconnect(); boomOk(); } });
  mo.observe(fx, {childList:true});
  /* le son du critique en trois morceaux : ça aspire pendant le ralenti, l'impact sur l'image de choc, l'explosion quand le rat éclate */
  var explose = false;
  function sonExplosion(){ if(explose) return; explose = true; bruit('ratCritique', {partie:'explosion'}); }
  function sonCritique(nom){
    if(nom === 'aspire'){ if(!bruit('ratCritique', {partie:'avant'})) son('aspire'); return; }
    if(nom === 'boum'){ if(!bruit('ratCritique', {partie:'impact'})) son('boum'); else setTimeout(sonExplosion, 1200); return; }
    son.apply(null, arguments);
  }
  boomP.then(sonExplosion);
  await Fx.critique(c.x, c.y, n, function(){ majBarres(); var p = A.r[r.i].exploser(fx); if(p && p.boom) p.boom.then(boomOk); return p; }, sonCritique,
    {exclure:slotR(r), brume:RAT_MODULE ? 12 : 24, boom:boomP});
  mo.disconnect();
  finRat(r, true);
  conte(phrase || 'En plein dans le mille !');
  return attendre(350);
}

/* ---------------- le tour des rats ---------------- */
async function tourDesRats(){
  E.mode = 'rats'; E.occupe = true;
  bande(); majScene();
  conte('Au tour des rats !');
  await attendre(400);
  var liste = vivants();
  for(var k = 0; k < liste.length; k++){
    var r = liste[k];
    if(!debout().length) break;
    if(r.mort) continue;
    if(r.brule){ await brulure(r); if(r.mort) continue; }
    if(r.colle){
      Fx.mot(rCx(r.i), rTop(r.i), 'rhââ !', 'croc'); son('couine', 0, .9, 1.4, r.enrage);
      conte('Le rat tire sur ses pattes collées… Raté !');
      await attendre(850);
      continue;
    }
    await attaque(r);
  }
  if(!debout().length) return fuite(true);
  if(!vivants().length) return victoire();
  /* la fin du tour des rats : le point faible se referme, la colle sèche, le bouclier s'éteint (la rage et le feu restent) */
  var fermes = vivants().filter(function(r){ return r.ouvert; });
  await Promise.all(fermes.map(function(r){ return fermer(r); }));
  vivants().forEach(function(r){
    if(r.colle){ r.colle = false; A.r[r.i].coller(false); if(r.flaque){ r.flaque(); r.flaque = null; } }
    if(r.flaque && !r.ouvert){ r.flaque(); r.flaque = null; }
  });
  await Promise.all(ORDRE.map(function(h){
    var s = E.h[h]; if(!s.bouclier) return null;
    s.bouclier = false; var d = s.dome; s.dome = null;
    return d && d.retirer ? d.retirer() : null;
  }));
  majScene(); majBarres();
  if(fermes.length){ conte(fermes.length > 1 ? 'Les rats se remettent sur leurs pattes. Le ventre est caché.' : 'Le rat se remet sur ses pattes. Son ventre est caché.'); await attendre(900); }
  else await attendre(300);
  nouveauTour();
}
/* la brûlure : −4 au tour des rats, jusqu'à la fin */
async function brulure(r){
  son('brule'); son('couine', .05, 1.1, 1, r.enrage);
  A.r[r.i].bruler(true);
  Fx.eclat(rCx(r.i), rCy(r.i) - 10, 150, 'radial-gradient(closest-side,rgba(255,170,60,.85),rgba(255,90,20,0))', 600);
  r.pv = Math.max(0, r.pv - BRULURE);
  Fx.chiffre(rCx(r.i), rTop(r.i) + 6, '−' + BRULURE + ' 🔥', 'feu');
  majBarres();
  await A.r[r.i].touche();
  if(r.pv <= 0) return ratFuit(r, 'Le rat brûle, brûle… et détale en couinant !');
  conte('Le rat brûle encore : −' + BRULURE + ' !');
  return attendre(450);
}
async function attaque(r){
  var bloc = q('#badges-' + r.i + ' .vise-bloc');
  if(bloc) bloc.classList.add('mord');
  var victime = E.h[r.vise] && !E.h[r.vise].sol ? r.vise : EXPOSES.filter(function(x){ return !E.h[x].sol; })[0];
  var n = r.enrage ? 2 : 1, total = 0, brut = 0;
  for(var k = 0; k < n; k++){
    if(E.h[victime].sol){ var autre = EXPOSES.filter(function(x){ return !E.h[x].sol; })[0]; if(!autre) break; victime = autre; }
    son('couine', 0, r.enrage ? 1 : 1.1, r.enrage ? 1.3 : 1, r.enrage);
    /* mordre() se termine quand le rat est revenu ; onImpact arrive quand les mâchoires claquent */
    var fin = null;
    await new Promise(function(ok){ fin = A.r[r.i].mordre({onImpact:ok}); Promise.resolve(fin).then(ok); });
    son('machoire');
    var s = E.h[victime], d = s.bouclier ? MORSURE / 2 : MORSURE;
    s.pv = Math.max(0, s.pv - d); total += d; brut += MORSURE;
    son('morsure');
    Fx.mot(hCx(victime) + 30, 170, 'CROC !', 'croc');
    Fx.chiffre(hCx(victime), 140 - k * 26, '−' + d, s.bouclier ? 'bleu' : '');
    if(s.bouclier && s.dome){ son('absorbe'); s.dome.absorber(MORSURE - d); }
    majBarres(); bande();
    if(s.pv <= 0){ s.sol = true; majScene(); son('tombe'); await Promise.all([A.h[victime].tomber(), fin]); }
    else await Promise.all([A.h[victime].touche(), fin]);
    await attendre(n > 1 ? 60 : 120);
  }
  if(bloc) bloc.classList.remove('mord');
  var s2 = E.h[victime], t;
  if(s2.bouclier && brut > total){
    Fx.bulleTexte(hCx(victime), HEROS_MODULE ? 296 : 118, '🛡️ ' + brut + ' → ' + total + ' <small>(' + (brut - total) + ' absorbés)</small>', 'bleu');   /* (le dôme du module écrit déjà en haut) */
    t = 'Le rat mord ' + HER[victime].le + (n > 1 ? ' deux fois' : '') + ' : ' + brut + ' → ' + total + '. Le bouclier en absorbe ' + (brut - total) + ' !';
  }
  else if(n > 1) t = 'Enragé, le rat mord deux fois ' + HER[victime].le + ' : −' + total + ' !';
  else t = 'Le rat mord ' + HER[victime].le + ' : −' + total + ' !';
  if(s2.sol) t += ' ' + HER[victime].Le + ' tombe au sol, la tête qui tourne.';
  conte(t);
  r.vise = null; majBadges(); majScene();
  return attendre(s2.sol ? 900 : 400);
}

/* =====================================================================
   3) LA FIN : victoire, fuite
   ===================================================================== */
async function victoire(){
  E.mode = 'fin'; E.occupe = true;
  bande(); majScene();
  var n = E.toursTotal, ess = E.essai, tours = n + ' tour' + (n > 1 ? 's' : '');
  var t = ess > 1 ? 'Trois rats en ' + tours + ' et ' + ess + ' essais : on ne lâche rien, et ça paie !'
    : n <= 3 ? 'Trois rats en ' + tours + ' seulement ! Les égouts vont parler de vous.'
    : n <= 5 ? 'Trois rats en ' + tours + ' : du beau travail d\'équipe !'
    : 'Trois rats en ' + tours + '… C\'était long, mais la salle est propre !';
  conte('La salle est à vous !');
  var fan = bruit('victoire', {}, ['fanfare']);
  Son.baisser((fan && fan.duree || 3) + .2);
  setTimeout(function(){ Son.musique('explo'); }, 2200);
  await Promise.all(debout().map(function(h, k){ return attendre(k * 120).then(function(){ return A.h[h].joie(); }); }));
  await attendre(300);
  var f = el('div'); f.id = 'fin';
  f.innerHTML = '<div class="voile"></div><div class="victoire"><div class="rayons"></div>' +
    '<h1>La salle est à vous !' + lireBtn('La salle est à vous !') + '</h1>' +
    '<div class="bulle"><span class="txt">' + t + '</span>' + lireBtn(t) + '</div>' +
    '<div class="bilan"><div><b>' + n + '</b>tour' + (n > 1 ? 's' : '') + '</div><div><b>' + ess + '</b>essai' + (ess > 1 ? 's' : '') + '</div><div><b>' + E.livre + '</b>📖 page' + (E.livre > 1 ? 's' : '') + '</div></div>' +
    '<button class="aller guide" data-act="rejouer">Rejouer ↻</button></div>';
  q('#combat').appendChild(f);
}
function demanderFuite(){
  if(E.occupe || E.ecran !== 'combat') return;
  var t = 'On remonte l\'escalier… et tout est à refaire : les rats battus reviendront, en pleine forme. Seul le Grand Livre garde ce qu\'on a appris.';
  ouvrirFenetre('<h2>Fuir la salle ?</h2><div class="ligne">' + t + lireBtn(t) + '</div>' +
    '<div class="boutons"><button class="sombre" data-act="fermer">Non, on reste</button><button class="aller" data-act="fuir">Oui, on fuit !</button></div>');
}
async function fuite(auto){
  E.mode = 'fin'; E.occupe = true;
  fermerFenetre();
  bande(); majScene();
  if(auto){
    conte('Les trois héros sont au sol… Ils se relèvent tant bien que mal et crient : « Fuite ! »');
    await attendre(500);
    await Promise.all(ORDRE.map(function(h){ E.h[h].sol = false; slotH(h).classList.remove('sol'); return A.h[h].relever(); }));
  } else conte('« Fuite ! » Les héros remontent l\'escalier quatre à quatre.');
  ORDRE.forEach(function(h, k){ setTimeout(function(){ slotH(h).classList.add('crie'); }, k * 120); });
  await attendre(800);
  var fu = bruit('fuite', {}, ['pasHeros', 1, 3]);
  Son.baisser((fu && fu.duree || 3) + .2);
  ORDRE.forEach(function(h, k){
    var s = slotH(h);
    setTimeout(function(){ s.classList.add('detale'); }, k * 90);
  });
  await attendre(1200);
  /* la fuite recharge la dernière sauvegarde : l'entrée de la salle. Les rats et les héros reviennent en pleine forme ;
     seul le Grand Livre garde ce qui a été appris. */
  E.ratsVaincus = [false, false, false];
  Son.musique('explo');
  pointFuite();
}
function pointFuite(){
  var garde = 'Lui, il n\'oublie rien.';
  var l = E.livre ? '<div class="livre-l garde">' + garde + lireBtn(garde) + '</div>' + LIVRE.slice(0, E.livre).map(function(t){ return '<div class="livre-l">« ' + t + ' »' + lireBtn(t) + '</div>'; }).join('')
    : '<div class="livre-l">' + VIDE + lireBtn(VIDE) + '</div>';
  var rv = 'Les trois rats sont revenus, en pleine forme. Les héros aussi : tout est à refaire.';
  var f = el('div'); f.id = 'fin';
  f.innerHTML = '<div class="voile" style="background:rgba(5,3,10,.9)"></div><div class="point"><h1>On fait le point' + lireBtn('On fait le point.') + '</h1>' +
    '<div class="case"><h3>📖 Le Grand Livre</h3>' + l + '</div>' +
    '<div class="case"><h3>🎒 Le sac</h3><div class="sac-l">' + E.sac.map(function(id){ return '<div><img src="' + URL_IMG['potion-' + id] + '" alt="">' + RECETTES[id].nom + '</div>'; }).join('') + '</div>' +
    '</div>' +
    '<div class="case retour"><h3>🚪 Retour à l\'entrée</h3><div class="rats-l">' + [0, 1, 2].map(function(){ return '<span class="rat-mini img-rat"></span>'; }).join('') + '<span>' + rv + '</span>' + lireBtn(rv) + '</div></div>' +
    '<div class="bulle"><span class="txt">' + CONTE_FUITE + '</span>' + lireBtn(CONTE_FUITE) + '</div>' +
    '<div class="bas"><button class="aller guide" data-act="reessayer">Réessayer ↻</button></div></div>';
  q('#combat').appendChild(f);
  conte(CONTE_FUITE);
}
var VIDE = 'Le Grand Livre est encore vide. Ce qu\'il apprendra, il ne l\'oubliera jamais.';
var CONTE_FUITE = 'Les rats ont retrouvé toutes leurs forces… mais vous, vous en savez plus. Et si on essayait autrement ?';

/* ---------------- les fenêtres ---------------- */
function ouvrirFenetre(html){
  fermerFenetre();
  fenetre = el('div'); fenetre.id = 'fenetre';
  fenetre.innerHTML = '<div class="parchemin">' + html + '<button class="fermer" data-act="fermer" aria-label="Fermer">✕</button></div>';
  jeu.appendChild(fenetre);
}
function fermerFenetre(){ if(fenetre){ fenetre.remove(); fenetre = null; } }
function grandLivre(){
  var l = E.livre ? LIVRE.slice(0, E.livre).map(function(t){ return '<div class="ligne">« ' + t + ' »' + lireBtn(t) + '</div>'; }).join('')
    : '<div class="ligne vide">Les pages sur les rats sont encore blanches. Le Sage n\'a encore rien noté.' + lireBtn('Les pages sur les rats sont encore blanches. Le Sage n\'a encore rien noté.') + '</div>';
  ouvrirFenetre('<h2>Le Grand Livre</h2><div class="sous">Rat d\'égout · ' + E.livre + ' / ' + LIVRE.length + '</div>' + l);
}

/* ================= les doigts et la souris ================= */
function toucher(ev){
  Son.demarrer();            /* le premier toucher, n'importe où : le son et la musique démarrent (le navigateur l'exige) */
  var b = ev.target.closest ? ev.target.closest('[data-act]') : null;
  if(!b) return;
  var a = b.getAttribute('data-act'), id = b.getAttribute('data-id');
  if(a === 'lire'){ ev.stopPropagation(); lire(b.getAttribute('data-t')); return; }
  if(a === 'lire-bulle'){ lire(E.texte); return; }
  if(a === 'bruitages'){ Son.demarrer(); Son.basculer(); majBoutonSon(); return; }
  if(a === 'recette-sac') return toucherRecette(id, b);
  if(a === 'descendre'){ if(E.sac.length === 3){ taire(); debutCombat(); } return; }
  if(a === 'livre'){ son('page'); return grandLivre(); }
  if(a === 'fermer') return fermerFenetre();
  if(a === 'fuite') return demanderFuite();
  if(a === 'fuir') return fuite(false);
  if(a === 'reessayer'){ E.essai++; taire(); return ecranSac(); }
  if(a === 'rejouer'){ E.essai = 1; E.toursTotal = 0; E.livre = 0; E.ratsVaincus = [false, false, false]; E.sacAvant = null; E.sac = []; taire(); return ecranSac(); }
  if(E.occupe || fenetre) return;
  if(a === 'heros') return choisirHeros(id);
  if(a === 'geste') return choisirGeste(id);
  if(a === 'retour') return retour();
  if(a === 'perso') return toucherPerso(b.getAttribute('data-type'), id);
}

function demarrer(){
  jeu = q('#jeu');
  chargerImages();
  ajuster();
  window.addEventListener('resize', ajuster);
  window.addEventListener('orientationchange', function(){ setTimeout(ajuster, 200); });
  document.addEventListener('click', toucher);
  ['#cadre', '#jeu'].forEach(function(s){ var e = q(s); e.addEventListener('scroll', function(){ e.scrollTop = 0; e.scrollLeft = 0; }); });
  window.addEventListener('scroll', function(){ window.scrollTo(0, 0); });
  ecranSac();
}
SALLE.demarrer = demarrer;
SALLE.maj = function(){ bande(); majScene(); majBarres(); };   /* pour les tests */
if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', demarrer); else demarrer();
})();
