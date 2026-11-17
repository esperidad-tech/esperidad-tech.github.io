/* heros.js — LES QUATRE FILMS DES HÉROS (Romain, 17 novembre : « 4 cinématiques, une pour chaque personnage […] un peu le même style avec
   le même rythme [que la pub] […] tu montres tout ce qu'on peut faire avec les personnages […] en maximum 30 secondes […] tu donnes
   vraiment envie de jouer le personnage »).
   Le même moteur que la pub (pub.js) : HEROS.image(t) met l'image du temps t dans la page, filmer-heros.py la photographie 30 fois par seconde.
   Le film se choisit par l'adresse : heros.html?film=pisteur (alchimiste, barde, sage).
   Tout est calé sur la musique, 120 à la minute, UN TEMPS = 0,5 s ; les quatre films ont LE MÊME DÉCOUPAGE :
     0 → 2 s     le héros arrive : son nom, sa devise (celle de l'écran « Choisis ton rôle »)
     2 → 4       chez lui (sa cabane, son atelier, son tableau, son Grand Livre) : à quoi il sert dans l'équipe
     4 → 14      ce qu'il fait (le refrain de la musique)
     14 → 18     la suite, plus posée (le pont)
     18 → 22     la nuit : le donjon (ou la fête, pour le Barde)
     22 → 24     huit images en rafale, quatre mots
     24 → 26     les quatre héros : « L'équipe compte sur toi ! »
     26 → fin    « Joue le Pisteur ! », le titre du jeu
   Les extraits sont de vraies images du jeu (capturer-heros.py, capturer.py), rangées dans plans/<nom>/0000.jpg…
   Pour changer un mot, un ordre, une durée : la table FILMS, plus bas, et nulle part ailleurs. Garder les coupes sur les temps. */
(function(){
'use strict';
var W = 1440, H = 616, T = 29.8;
var Q = new URLSearchParams(location.search), DOSSIER = (Q.get('plans') || 'plans') + '/', ID = Q.get('film') || 'pisteur';
function cl(x, a, b){ return Math.max(a, Math.min(b, x)); }
function lerp(a, b, k){ return a + (b - a) * k; }
function k01(t, a, b){ return cl((t - a) / (b - a), 0, 1); }
function r(x){ return Math.round(x * 100) / 100; }
var E = {
  io:function(k){ return k < .5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2; },
  o:function(k){ return 1 - Math.pow(1 - k, 3); }, i:function(k){ return k * k * k; },
  rebond:function(k){ var c = 2.4; return 1 + (c + 1) * Math.pow(k - 1, 3) + c * Math.pow(k - 1, 2); }
};
function hasard(g){ var x = Math.sin(g * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); }
var NUIT = '#0b1030';
var ROLES = [['Pisteur', '#7bd88a'], ['Alchimiste', '#b99af7'], ['Barde', '#f49ab8'], ['Sage', '#7cbcff']];

/* ------------------------------------------------------------------ LES QUATRE FILMS
   plans : [début, fin, nom, {n : nombre d'images (un extrait filmé), d : la première image, v : la vitesse (1 = celle du jeu), pas : secondes par
     image (image par image ; saut : une image sur deux, sur trois…), img : une image fixe, kb : [zoom, x, y au début, zoom, x, y à la fin], o : le point autour duquel on zoome,
     pos : le cadrage, py : la tranche qu'on montre d'un écran plus haut que l'image (0 = le haut, 100 = le bas, plus de 100 : on dépasse, pour remonter un texte au-dessus du ruban ; ou des étapes
     [[moment de 0 à 1, valeur], …] : la tranche descend avec l'action), sombre, flou, entree : flash | pousse | balai | coupe | zoom,
     tab : [largeur, hauteur, angle] — l'écran du jeu montré en entier, dans une tablette posée sur la même image, floue}]
   rubans : [début, fin, texte] (le ruban jaune à lettres noires) ; mots : [début, fin, texte] (les quatre mots de la rafale) */
var FILMS = {
  pisteur:{
    i:0, nom:'LE PISTEUR', joue:'LE PISTEUR !', devise:'ACTION ET RÉFLEXES', dit:'Explore, suis les traces, cours, tire à l\'arc', quoi:'LES YEUX ET LES JAMBES DE L\'ÉQUIPE',
    plans:[
      [2.0, 4.0, 'p-cabane', {kb:[1.02, 0, 0, 1.12, -30, -6], entree:'flash'}],
      [4.0, 6.5, 'p-pistage', {n:102, d:6, kb:[1.12, 0, 0, 1.3, 0, 20], entree:'flash'}],
      [6.5, 9.0, 'p-oie', {n:210, d:44, v:1.25, kb:[1.0, 0, 0, 1.08, 0, -10], o:'50% 80%', entree:'pousse'}],
      [9.0, 12.0, 'p-visee', {n:225, d:96, kb:[1.0, 0, 0, 1.06, 0, 0], entree:'balai'}],
      [12.0, 14.0, 'p-cachette', {n:180, d:20, v:1.4, kb:[1.5, 0, 30, 1.7, 0, -30], entree:'pousse'}],
      [14.0, 16.0, 'p-interieur', {n:108, d:8, tab:[396, 528, -3], kb:[1.0, 0, 0, 1.06, 0, 0], entree:'flash'}],
      [16.0, 18.0, 'p-code', {py:[[0, 50], [1, 66]], kb:[1.0, 0, 0, 1.05, 0, 0], entree:'zoom'}],
      [18.0, 19.0, 'dj-entree', {n:66, kb:[1.25, -120, 10, 1.1, -60, 0], entree:'flash'}],
      [19.0, 20.5, 'dj-arc', {n:150, d:26, v:1.5, kb:[1.0, 0, 0, 1.12, -60, 10], entree:'coupe'}],
      [20.5, 22.0, 'dj-crit', {n:150, d:30, v:1.5, kb:[1.08, -30, 0, 1.2, -90, 0], entree:'pousse'}],
      [22.0, 22.25, 'p-pistage', {img:40, entree:'flash', kb:[1.5, 0, 0, 1.6, 0, 0]}],
      [22.25, 22.5, 'p-cachette', {img:60, entree:'coupe', kb:[1.7, 0, 0, 1.8, 0, 0]}],
      [22.5, 22.75, 'p-oie', {img:100, entree:'coupe', kb:[1.2, 0, 0, 1.28, 0, 0], o:'50% 80%'}],
      [22.75, 23.0, 'p-oie', {img:150, entree:'coupe', kb:[1.3, 0, 0, 1.38, 0, 0], o:'50% 80%'}],
      [23.0, 23.25, 'p-visee', {img:150, entree:'coupe', kb:[1.1, 0, 0, 1.2, 0, 0]}],
      [23.25, 23.5, 'dj-arc', {img:70, entree:'coupe', kb:[1.3, -160, 0, 1.38, -160, 0]}],
      [23.5, 24.0, 'dj-crit', {img:86, entree:'coupe', kb:[1.3, -120, 0, 1.2, -100, 0]}]
    ],
    rubans:[[2.1, 4.0, 'LES YEUX ET LES JAMBES DE L\'ÉQUIPE'], [4.1, 6.5, 'SUIS LES TRACES'], [6.6, 9.0, 'COURS, SAUTE, ESQUIVE !'], [9.1, 12.0, 'VISE… ET TIRE !'], [12.1, 14.0, 'FAUFILE-TOI SANS ÊTRE VU'],
      [14.1, 16.0, 'FOUILLE CHAQUE RECOIN'], [16.1, 18.0, 'PASSE TES TROUVAILLES À L\'ÉQUIPE'], [18.1, 22.0, 'LA NUIT : DANS LE DONJON, FRAPPE FORT !']],
    mots:[[22.0, 22.5, 'DES PISTES'], [22.5, 23.0, 'DES COURSES'], [23.0, 23.5, 'DES FLÈCHES'], [23.5, 24.0, 'DE L\'ACTION !']]
  },
  alchimiste:{
    i:1, nom:'L\'ALCHIMISTE', joue:'L\'ALCHIMISTE !', devise:'MÉMOIRE ET PRÉCISION', dit:'Cueille, analyse, fabrique des potions', quoi:'LE SAVANT DE L\'ÉQUIPE',
    plans:[
      [2.0, 4.0, 'a-atelier', {kb:[1.0, 0, 0, 1.1, 20, -8], entree:'flash'}],
      [4.0, 6.0, 'a-cueillette', {n:96, d:4, kb:[1.4, 0, 0, 1.8, 0, 0], o:'50% 42%', entree:'flash'}],
      [6.0, 8.0, 'a-code', {n:108, d:6, v:1.3, py:[[0, 0], [.55, 0], [.72, 100], [1, 100]], kb:[1.0, 0, 0, 1.04, 0, 0], entree:'zoom'}],
      [8.0, 9.0, 'a-loupe', {n:258, d:24, v:2, kb:[1.0, 0, 0, 1.06, 0, 0], entree:'pousse'}],
      [9.0, 10.0, 'a-loupe', {n:258, d:192, kb:[1.05, 0, 0, 1.12, 0, 10], entree:'coupe'}],
      [10.0, 11.0, 'a-micro', {n:162, d:58, v:1.4, kb:[1.0, 0, 0, 1.08, 30, 0], entree:'pousse'}],
      [11.0, 12.0, 'a-chaudron', {n:102, d:8, v:1.5, kb:[1.6, 0, 0, 1.8, 0, 0], o:'50% 62%', entree:'balai'}],
      [12.0, 14.0, 'a-etabli', {n:51, pas:.0775, saut:2, kb:[1.12, 0, 0, 1.24, 0, 0], o:'50% 60%', entree:'pousse'}],
      [14.0, 16.0, 'gateau', {n:16, pas:.125, kb:[1.45, 0, 0, 1.8, 0, 0], o:'50% 80%', entree:'flash'}],
      [16.0, 18.0, 'a-mimi', {n:420, d:150, v:1.7, kb:[1.0, 0, 0, 1.08, 0, 0], entree:'balai'}],
      [18.0, 19.5, 'dj-bong', {n:150, d:30, v:1.5, kb:[1.0, 0, 0, 1.1, -40, 0], entree:'flash'}],
      [19.5, 20.5, 'dj-givre', {n:150, d:64, v:1.5, kb:[1.1, -60, 0, 1.18, -90, 0], entree:'coupe'}],
      [20.5, 22.0, 'dj-feu', {n:165, d:62, v:1.6, kb:[1.08, -30, 0, 1.2, -90, 0], entree:'pousse'}],
      [22.0, 22.25, 'a-cueillette', {img:60, entree:'flash', kb:[1.7, 0, 0, 1.8, 0, 0], o:'50% 42%'}],
      [22.25, 22.5, 'a-etabli', {img:4, entree:'coupe', kb:[1.0, 0, 0, 1.08, 0, 0]}],
      [22.5, 22.75, 'a-loupe', {img:212, entree:'coupe', kb:[1.1, 0, 0, 1.18, 0, 0]}],
      [22.75, 23.0, 'a-micro', {img:100, entree:'coupe', kb:[1.1, 0, 0, 1.18, 0, 0]}],
      [23.0, 23.25, 'a-chaudron', {img:40, entree:'coupe', kb:[1.7, 0, 0, 1.8, 0, 0], o:'50% 62%'}],
      [23.25, 23.5, 'a-etabli', {img:50, entree:'coupe', kb:[1.1, 0, 0, 1.18, 0, 0]}],
      [23.5, 24.0, 'dj-feu', {img:98, entree:'coupe', kb:[1.3, -150, 0, 1.2, -120, 0]}]
    ],
    rubans:[[2.1, 4.0, 'LE SAVANT DE L\'ÉQUIPE'], [4.1, 6.0, 'CUEILLE LES PLANTES CACHÉES'], [6.1, 8.0, 'REÇOIS LES TROUVAILLES DE TES AMIS'], [8.1, 11.0, 'ANALYSE-LES DANS TON LABO'], [11.1, 14.0, 'PRÉPARE DES POTIONS'],
      [14.1, 16.0, 'INVENTE LE GÂTEAU DE LA FÊTE'], [16.1, 18.0, 'CHOUCHOUTE MIMI, TON CHAT'], [18.1, 22.0, 'LA NUIT : DANS LE DONJON, LANCE TES POTIONS !']],
    mots:[[22.0, 22.5, 'DES PLANTES'], [22.5, 23.0, 'DES ANALYSES'], [23.0, 23.5, 'DES POTIONS'], [23.5, 24.0, 'DE LA SCIENCE !']]
  },
  barde:{
    i:2, nom:'LE BARDE', joue:'LE BARDE !', devise:'ÉCOUTE ET STRATÉGIE', dit:'Parle aux habitants, démasque les menteurs', quoi:'LA VOIX ET LES OREILLES DE L\'ÉQUIPE',
    plans:[
      [2.0, 4.0, 'b-liege', {kb:[1.3, 0, 96, 1.42, 0, 104], o:'50% 30%', entree:'flash'}],
      [4.0, 6.0, 'b-carte', {n:90, d:6, v:1.3, kb:[1.25, 0, 0, 1.6, 0, 0], entree:'flash'}],
      [6.0, 8.5, 'b-parler', {n:150, d:8, v:1.9, py:[[0, 70], [.1, 41], [.34, 41], [.5, 112], [1, 112]], kb:[1.0, 0, 0, 1.03, 0, 0], entree:'zoom'}],
      [8.5, 12.0, 'b-ment', {n:225, d:6, v:2.05, py:[[0, 30], [.06, 13], [.18, 13], [.26, 108], [.34, 108], [.42, 19], [.54, 19], [.66, 95], [1, 95]], kb:[1.0, 0, 0, 1.03, 0, 0], entree:'pousse'}],
      [12.0, 14.0, 'b-liege-anim', {n:12, pas:.16, kb:[1.3, 0, 96, 1.42, 0, 104], o:'50% 30%', entree:'balai'}],
      [14.0, 16.0, 'b-marche', {n:165, d:10, v:2.4, py:[[0, 15], [.14, 15], [.26, 75], [.47, 75], [.6, 16], [1, 16]], kb:[1.0, 0, 0, 1.03, 0, 0], entree:'flash'}],
      [16.0, 18.0, 'b-code', {n:108, d:6, v:1.3, py:[[0, 0], [.55, 0], [.72, 100], [1, 100]], kb:[1.0, 0, 0, 1.04, 0, 0], entree:'zoom'}],
      [18.0, 19.5, 'b-nuit', {kb:[1.5, 0, 0, 1.95, -60, 10], o:'60% 50%', entree:'flash'}],
      [19.5, 22.0, 'b-fete', {n:138, d:6, v:1.75, py:45, kb:[1.0, 0, 0, 1.04, 0, 0], entree:'zoom'}],
      [22.0, 22.25, 'b-parler', {img:120, py:112, entree:'flash', kb:[1.0, 0, 0, 1.06, 0, 0]}],
      [22.25, 22.5, 'b-carte', {img:70, entree:'coupe', kb:[1.6, 0, 0, 1.7, 0, 0]}],
      [22.5, 22.75, 'b-fete', {img:50, py:45, entree:'coupe', kb:[1.0, 0, 0, 1.06, 0, 0]}],
      [22.75, 23.0, 'b-liege', {entree:'coupe', kb:[1.42, 0, 104, 1.5, 0, 108], o:'50% 30%'}],
      [23.0, 23.25, 'b-ment', {img:110, py:19, entree:'coupe', kb:[1.0, 0, 0, 1.06, 0, 0]}],
      [23.25, 23.5, 'b-ment', {img:220, py:95, entree:'coupe', kb:[1.0, 0, 0, 1.06, 0, 0]}],
      [23.5, 24.0, 'b-marche', {img:140, py:16, entree:'coupe', kb:[1.06, 0, 0, 1.0, 0, 0]}]
    ],
    rubans:[[2.1, 4.0, 'LA VOIX ET LES OREILLES DE L\'ÉQUIPE'], [4.1, 6.0, 'VA VOIR LES HABITANTS'], [6.1, 8.5, 'POSE LES BONNES QUESTIONS'], [8.6, 12.0, 'DÉMASQUE LES MENTEURS'], [12.1, 14.0, 'ÉPINGLE TES PISTES'],
      [14.1, 16.0, 'MARCHANDE COMME UN CHEF'], [16.1, 18.0, 'PARTAGE LES INDICES AVEC L\'ÉQUIPE'], [18.1, 22.0, 'LA NUIT : FAIS PARLER TOUT LE VILLAGE']],
    mots:[[22.0, 22.5, 'DES SECRETS'], [22.5, 23.0, 'DES RAGOTS'], [23.0, 23.5, 'DES MENSONGES'], [23.5, 24.0, 'DU BAGOU !']]
  },
  sage:{
    i:3, nom:'LE SAGE', joue:'LE SAGE !', devise:'LOGIQUE · CHEF D\'ENQUÊTE', dit:'Garde le Grand Livre, déchiffre, accuse', quoi:'LA MÉMOIRE ET LE CHEF DE L\'ÉQUIPE',
    plans:[
      [2.0, 4.0, 's-grandlivre', {kb:[1.02, 0, 0, 1.12, 0, 10], o:'50% 30%', entree:'flash'}],
      [4.0, 6.0, 's-livre', {n:126, d:10, v:1.9, kb:[1.02, 0, 0, 1.1, 0, 8], o:'50% 30%', entree:'flash'}],
      [6.0, 8.5, 's-alphabet', {n:192, d:6, v:2.4, py:[[0, 0], [.74, 8], [.86, 42], [1, 42]], kb:[1.0, 0, 0, 1.03, 0, 0], entree:'zoom'}],
      [8.5, 10.5, 's-runes', {n:225, d:8, v:1.75, kb:[1.1, 60, 0, 1.2, 80, 0], entree:'pousse'}],
      [10.5, 12.0, 's-plans', {n:120, d:4, v:2, kb:[1.1, 100, 0, 1.2, 130, 0], entree:'balai'}],
      [12.0, 14.0, 's-code', {n:108, d:6, v:1.3, py:[[0, 0], [.55, 0], [.72, 100], [1, 100]], kb:[1.0, 0, 0, 1.04, 0, 0], entree:'zoom'}],
      [14.0, 16.0, 's-moment', {n:150, d:10, v:2.3, py:[[0, 30], [.12, 60], [1, 60]], kb:[1.0, 0, 0, 1.03, 0, 0], entree:'flash'}],
      [16.0, 18.0, 's-accuse', {n:108, d:10, v:1.6, py:48, kb:[1.0, 0, 0, 1.04, 0, 0], entree:'pousse'}],
      [18.0, 19.0, 'dj-entree', {n:66, kb:[1.25, 120, 10, 1.1, 60, 0], entree:'flash'}],
      [19.0, 20.5, 'dj-lumiere', {n:150, d:24, v:1.5, kb:[1.0, 0, 0, 1.12, 40, 0], entree:'coupe'}],
      [20.5, 22.0, 'dj-bouclier', {n:150, d:36, v:1.5, kb:[1.12, 90, 0, 1.25, 120, 0], entree:'pousse'}],
      [22.0, 22.25, 's-alphabet', {img:120, py:6, entree:'flash', kb:[1.0, 0, 0, 1.06, 0, 0]}],
      [22.25, 22.5, 's-code', {img:30, py:0, entree:'coupe', kb:[1.0, 0, 0, 1.06, 0, 0]}],
      [22.5, 22.75, 's-runes', {img:60, entree:'coupe', kb:[1.2, 80, 0, 1.28, 80, 0]}],
      [22.75, 23.0, 's-plans', {img:60, entree:'coupe', kb:[1.2, 130, 0, 1.28, 130, 0]}],
      [23.0, 23.25, 's-livre', {img:70, entree:'coupe', kb:[1.1, 0, 8, 1.18, 0, 8], o:'50% 30%'}],
      [23.25, 23.5, 's-accuse', {img:100, py:48, entree:'coupe', kb:[1.0, 0, 0, 1.06, 0, 0]}],
      [23.5, 24.0, 'dj-bouclier', {img:96, entree:'coupe', kb:[1.3, 150, 0, 1.2, 130, 0]}]
    ],
    rubans:[[2.1, 4.0, 'LA MÉMOIRE ET LE CHEF DE L\'ÉQUIPE'], [4.1, 6.0, 'GARDE LE GRAND LIVRE'], [6.1, 8.5, 'DÉCHIFFRE LES MESSAGES SECRETS'], [8.6, 10.5, 'RECONSTITUE LES CARTES'], [10.6, 12.0, 'SUPERPOSE LES VIEUX PLANS'],
      [12.1, 14.0, 'RASSEMBLE LES INDICES DE TOUS'], [14.1, 16.0, 'C\'EST TOI QUI DONNES L\'HEURE'], [16.1, 18.0, 'À LA FIN, C\'EST TOI QUI ACCUSES'], [18.1, 22.0, 'LA NUIT : DANS LE DONJON, PROTÈGE TES AMIS']],
    mots:[[22.0, 22.5, 'DES CODES'], [22.5, 23.0, 'DES PLANS'], [23.0, 23.5, 'DES PREUVES'], [23.5, 24.0, 'DE LA LOGIQUE !']]
  }
};
if(window.HEROS_FILMS) Object.keys(window.HEROS_FILMS).forEach(function(k){ Object.keys(window.HEROS_FILMS[k]).forEach(function(c){ FILMS[k][c] = window.HEROS_FILMS[k][c]; }); });
var F = FILMS[ID], COUL = ROLES[F.i][1], PLANS = F.plans;

/* ------------------------------------------------------------------ les images (on attend qu'elles soient là avant la photo) */
var attente = [];
function src(nom, i){ return DOSSIER + nom + '/' + ('000' + (i || 0)).slice(-4) + '.jpg'; }
function poser(img, url){
  if(img.getAttribute('data-u') === url) return;
  img.setAttribute('data-u', url);
  attente.push(new Promise(function(ok){ img.onload = function(){ (img.decode ? img.decode() : Promise.resolve()).then(ok, ok); }; img.onerror = function(){ console.error('image absente', url); ok(); }; img.src = url; }));
}
function cle(tab, k){
  /* une valeur qui change au fil du plan : un nombre, ou des étapes [[moment de 0 à 1, valeur], …] reliées en douceur */
  if(typeof tab === 'number') return tab;
  for(var i = 1; i < tab.length; i++) if(k <= tab[i][0]){ var a = tab[i - 1], b = tab[i]; return lerp(a[1], b[1], E.io(k01(k, a[0], b[0]))); }
  return tab[tab.length - 1][1];
}
function etatPlan(p, t){
  var o = p[3], kk = k01(t, p[0], p[1]), kb = o.kb || [1, 0, 0, 1, 0, 0], i = 0;
  if(o.img != null) i = o.img;
  else if(o.pas) i = Math.min(o.n - 1, (o.d || 0) + Math.floor((t - p[0]) / o.pas) * (o.saut || 1));
  else if(o.n) i = Math.min(o.n - 1, (o.d || 0) + Math.floor((t - p[0]) * 30 * (o.v || 1)));
  var coup = 1 + .07 * (1 - E.o(k01(t, p[0], p[0] + .22)));                     /* chaque plan arrive avec un petit coup de zoom */
  var pos = o.pos || '50% 50%';
  if(o.py != null) pos = '50% ' + r(cle(o.py, kk)) + '%';                        /* un écran du jeu plus haut que l'image : on en montre une tranche, qui descend avec l'action */
  return {flou:o.flou || 0, url:src(p[2], i), s:lerp(kb[0], kb[3], kk) * coup, x:lerp(kb[1], kb[4], kk), y:lerp(kb[2], kb[5], kk), o:o.o || '50% 50%', pos:pos, sombre:o.sombre || 0, tab:o.tab || null, coup:coup};
}
function mettrePlan(el, e, tx, clip, op, ech){
  var img = el.querySelector('img.fond'), tab = el.querySelector('.tab'), ti = tab.firstChild;
  el.style.display = ''; el.style.transform = (tx ? 'translateX(' + r(tx) + 'px) ' : '') + (ech && ech !== 1 ? 'scale(' + r(ech) + ')' : ''); el.style.clipPath = clip || ''; el.style.opacity = op == null ? 1 : r(op);
  poser(img, e.url);
  if(e.tab){
    /* l'écran entier du jeu, dans une tablette ; derrière, la même image, floue et sombre */
    img.style.transformOrigin = '50% 50%'; img.style.objectPosition = '50% 50%'; img.style.transform = 'scale(1.35)'; img.style.filter = 'blur(14px) brightness(.5) saturate(1.15)';
    el.querySelector('i').style.opacity = 0;
    tab.style.display = ''; tab.style.width = e.tab[0] + 'px'; tab.style.height = e.tab[1] + 'px'; tab.style.left = r((W - e.tab[0]) / 2 + e.x) + 'px'; tab.style.top = r((H - e.tab[1]) / 2 - 22 + e.y) + 'px';
    tab.style.transform = 'rotate(' + e.tab[2] + 'deg) scale(' + r(e.s) + ')';
    poser(ti, e.url);
    return;
  }
  tab.style.display = 'none';
  img.style.transformOrigin = e.o; img.style.objectPosition = e.pos;
  img.style.transform = 'translate(' + r(e.x) + 'px,' + r(e.y) + 'px) scale(' + r(e.s) + ')';
  el.querySelector('i').style.opacity = e.sombre; img.style.filter = e.flou ? 'blur(' + e.flou + 'px)' : '';
}

/* ------------------------------------------------------------------ LES TITRES (les mêmes que la pub) */
function texte(x, y, txt, o){
  o = o || {}; var t = o.taille || 96, f = o.police || "'Lilita One'";
  return '<g transform="translate(' + r(x) + ' ' + r(y) + ') rotate(' + r(o.a || 0) + ') scale(' + r(o.s == null ? 1 : o.s) + ')" opacity="' + r(o.op == null ? 1 : o.op) + '">' +
    '<text text-anchor="' + (o.ancre || 'middle') + '" font-family="' + f + '" font-size="' + t + '" y="' + r(t * .09) + '" fill="#05071a" opacity=".55" stroke="#05071a" stroke-width="' + (t * .2) + '" stroke-linejoin="round">' + txt + '</text>' +
    '<text text-anchor="' + (o.ancre || 'middle') + '" font-family="' + f + '" font-size="' + t + '" fill="' + (o.coul || 'url(#orTitre)') + '" stroke="' + (o.bord || NUIT) + '" stroke-width="' + (t * .16) + '" stroke-linejoin="round" paint-order="stroke" letter-spacing="' + (o.esp || 1) + '">' + txt + '</text></g>';
}
var mesure = null, largeurs = {};
function largeur(txt){
  /* la vraie largeur du texte du ruban (Lilita One, 56 points, 1,5 d'espace entre les lettres) : on la mesure, on ne la devine pas */
  if(largeurs[txt]) return largeurs[txt];
  if(!mesure){ mesure = document.createElement('canvas').getContext('2d'); mesure.font = "56px 'Lilita One'"; }
  return largeurs[txt] = mesure.measureText(txt).width + txt.length * 1.5;
}
function ruban(t, t0, t1, txt, y){
  var e = E.rebond(k01(t, t0, t0 + .3)), f = E.i(k01(t, t1 - .16, t1)), w = 84 + largeur(txt), x = lerp(-w - 60, 0, e) - f * (w + 80);
  var bat = 1 + .025 * Math.max(0, 1 - ((t * 2) % 1) * 3.5);                                                      /* il bat avec la musique */
  return '<g transform="translate(' + r(x) + ' ' + (y || 508) + ') rotate(-2.2) scale(' + r(bat) + ')"><path d="M-40 6 h' + (w + 44) + ' l-30 76 h' + (-w - 14) + ' Z" fill="#05071a" opacity=".5"/>' +
    '<path d="M-40 -4 h' + (w + 40) + ' l-30 76 h' + (-w - 10) + ' Z" fill="url(#orRuban)" stroke="#141a3a" stroke-width="5" stroke-linejoin="round"/>' +
    '<path d="M-40 4 h' + (w + 28) + '" stroke="#fff6c9" stroke-width="5" opacity=".8"/>' +
    '<text x="34" y="54" font-family="\'Lilita One\'" font-size="56" fill="#141a3a" letter-spacing="1.5">' + txt + '</text></g>';
}
function lanterne(x, y, s, t){
  var l = .85 + .15 * Math.sin(t * 5.3);
  return '<g transform="translate(' + r(x) + ' ' + r(y) + ') scale(' + r(s) + ')"><circle r="92" fill="url(#halo)" opacity="' + r(l) + '"/>' +
    '<path d="M-10 -66 a10 10 0 1 1 20 0" fill="none" stroke="#f2b63a" stroke-width="7"/><rect x="-24" y="-60" width="48" height="14" rx="5" fill="#f2b63a" stroke="#141a3a" stroke-width="4"/>' +
    '<path d="M-30 -46 h60 l8 78 h-76 Z" fill="#fff3b8" stroke="#141a3a" stroke-width="4.5" stroke-linejoin="round"/><path d="M-10 -46 l-3 78 M10 -46 l3 78" stroke="#141a3a" stroke-width="3.5"/>' +
    '<path d="M0 -24 q 14 18 0 36 q -14 -18 0 -36 Z" fill="#ff9d2e" stroke="#e2503f" stroke-width="2.5"/><rect x="-42" y="30" width="84" height="16" rx="6" fill="#f2b63a" stroke="#141a3a" stroke-width="4.5"/></g>';
}
var DEFS = '<defs><linearGradient id="orTitre" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff3b0"/><stop offset=".55" stop-color="#ffd84a"/><stop offset="1" stop-color="#f2a52a"/></linearGradient>' +
  '<linearGradient id="orRuban" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffe680"/><stop offset="1" stop-color="#f2b63a"/></linearGradient>' +
  '<radialGradient id="halo"><stop offset="0" stop-color="#ffe9a0" stop-opacity=".9"/><stop offset=".5" stop-color="#ffb84a" stop-opacity=".3"/><stop offset="1" stop-color="#ffb84a" stop-opacity="0"/></radialGradient></defs>';
function mot(t, t0, t1, txt, x, y, taille, angle, o){
  if(t < t0 || t >= t1) return '';
  var e = E.rebond(k01(t, t0, t0 + .26)), f = 1 - E.i(k01(t, t1 - .1, t1)); o = o || {};
  return texte(x, y, txt, {taille:taille, s:e * (.9 + .1 * f), a:angle + (1 - e) * -8, op:f, coul:o.coul, police:o.police, esp:o.esp});
}
function confettis(t, t0, cx, cy){
  var s = '', a = t - t0; if(a < 0) return s;
  var C = ['#ffd84a', '#f49ab8', '#7cbcff', '#7bd88a', '#b99af7', '#ff8a4a', '#fff'];
  for(var i = 0; i < 90; i++){
    var x0 = (cx || 720) + (hasard(i) - .5) * 300, vx = (hasard(i + 100) - .5) * 1500, vy = -520 - hasard(i + 200) * 620, g = 1250;
    var x = x0 + vx * a * (1 - .25 * a), y = (cy || 420) + vy * a + g * a * a * .5, rot = (hasard(i + 300) * 720 - 360) * a * 2.4, w = 10 + hasard(i + 400) * 12;
    if(y > 660) continue;
    s += '<rect x="' + r(-w / 2) + '" y="-4" width="' + r(w) + '" height="8" rx="2" fill="' + C[i % C.length] + '" transform="translate(' + r(x) + ' ' + r(y) + ') rotate(' + r(rot) + ') scale(1 ' + r(Math.cos(a * 9 + i)) + ')"/>';
  }
  return s;
}
function ciel(t, rayons){
  /* le ciel de nuit des héros : des étoiles, et, derrière le héros, des rayons de sa couleur qui tournent lentement */
  var s = '';
  if(rayons){
    s += '<g transform="translate(' + rayons[0] + ' ' + rayons[1] + ') rotate(' + r(t * 9) + ')" opacity="' + r(rayons[2] == null ? .16 : rayons[2]) + '">';
    for(var k = 0; k < 14; k++) s += '<path d="M0 0 L ' + r(1700 * Math.cos(k * .4488 - .1)) + ' ' + r(1700 * Math.sin(k * .4488 - .1)) + ' L ' + r(1700 * Math.cos(k * .4488 + .1)) + ' ' + r(1700 * Math.sin(k * .4488 + .1)) + ' Z" fill="' + COUL + '"/>';
    s += '</g>';
  }
  for(var i = 0; i < 70; i++){ var x = hasard(i + 500) * W, y = hasard(i + 600) * H, c = .35 + .65 * Math.abs(Math.sin(t * (1 + hasard(i) * 2) + i)); s += '<circle cx="' + r(x) + '" cy="' + r(y) + '" r="' + r(1 + hasard(i + 700) * 2.2) + '" fill="#fff6d0" opacity="' + r(c * .8) + '"/>'; }
  return s;
}
function pastille(t){
  /* en haut à droite, pendant tout le film : de qui on parle */
  var e = E.rebond(k01(t, 2.0, 2.4)), f = 1 - E.o(k01(t, 23.8, 24.0)), w = 60 + F.nom.length * 19;
  if(t < 2 || t >= 24) return '';
  return '<g transform="translate(' + r(W - 36 - w + (1 - e) * (w + 80)) + ' 30)" opacity="' + r(f) + '"><rect x="0" y="4" width="' + w + '" height="52" rx="26" fill="#05071a" opacity=".45"/><rect x="0" y="0" width="' + w + '" height="52" rx="26" fill="#141a3a" stroke="' + COUL + '" stroke-width="4"/>' +
    '<circle cx="28" cy="26" r="9" fill="' + COUL + '"/><text x="48" y="36" font-family="\'Lilita One\'" font-size="29" fill="' + COUL + '" letter-spacing="1.5">' + F.nom + '</text></g>';
}

/* ------------------------------------------------------------------ L'IMAGE DU TEMPS t */
var pA, pB, elCartes, elTitres, elFx, elHeros, elCiel;
function init(){
  pA = document.getElementById('pA'); pB = document.getElementById('pB'); elCartes = document.getElementById('cartes'); elTitres = document.getElementById('titres'); elFx = document.getElementById('fx');
  var h = '';
  ROLES.forEach(function(ro, i){ h += '<div class="carte" id="carte' + i + '" style="border-color:' + ro[1] + '"><img><b style="color:' + ro[1] + '">' + ro[0] + '</b></div>'; });
  elCartes.innerHTML = '<div id="fondHeros"><svg viewBox="0 0 1440 616" id="ciel"></svg></div>' + h + '<div class="carte grande" id="moi" style="border-color:' + COUL + '"><img></div>';
  ROLES.forEach(function(ro, i){ poser(document.querySelector('#carte' + i + ' img'), src('heros', i)); });
  elHeros = document.getElementById('moi'); poser(elHeros.querySelector('img'), src('heros', F.i)); elCiel = document.getElementById('ciel');
  document.getElementById('film').style.setProperty('--role', COUL);
}
function image(t){
  attente = [];
  if(!pA) init();
  var fx = '', titres = DEFS, i;
  /* --- les plans plein cadre --- */
  var cur = null, prec = null;
  for(i = 0; i < PLANS.length; i++) if(t >= PLANS[i][0] && t < PLANS[i][1]){ cur = PLANS[i]; prec = i > 0 && Math.abs(PLANS[i - 1][1] - cur[0]) < .01 ? PLANS[i - 1] : null; }
  pA.style.display = 'none'; pB.style.display = 'none';
  if(cur){
    var a = t - cur[0], en = cur[3].entree;
    if(en === 'pousse' && prec && a < .22){ var e = E.o(a / .22); mettrePlan(pA, etatPlan(prec, cur[0] - .001), -e * W * .35); mettrePlan(pB, etatPlan(cur, t), (1 - e) * W); }
    else if(en === 'balai' && a < .3){
      var X = E.io(a / .3) * (W + 560) - 140;
      if(prec) mettrePlan(pA, etatPlan(prec, cur[0] - .001));
      mettrePlan(pB, etatPlan(cur, t), 0, 'polygon(0 0, ' + r(X) + 'px 0, ' + r(X - 200) + 'px 100%, 0 100%)');
      fx += '<div class="balai" style="transform:translateX(' + r(X - 250) + 'px) skewX(-18deg)"></div>';
    }
    else if(en === 'zoom' && a < .2){ var z = E.o(a / .2); if(prec) mettrePlan(pA, etatPlan(prec, cur[0] - .001)); mettrePlan(pB, etatPlan(cur, t), 0, '', z, lerp(1.5, 1, z)); }
    else mettrePlan(pB, etatPlan(cur, t));
    if(en === 'flash' && a < .2) fx += '<div class="flash" style="opacity:' + r(1 - a / .2) + '"></div>';
  }
  /* --- le héros : le début (0 → 2), l'équipe (24 → 26), la fin (26 → T) --- */
  var debut = t < 2.0, equipe = t >= 24.0 && t < 26.0, fin = t >= 26.0;
  elCartes.style.display = debut || equipe || fin ? '' : 'none';
  if(debut || equipe || fin){
    elCiel.innerHTML = ciel(t, equipe ? null : [330, 330, fin ? .2 : .16]);
    ROLES.forEach(function(ro, n){ document.getElementById('carte' + n).style.opacity = 0; });
    elHeros.style.opacity = 0;
    if(debut || fin){
      var t0 = fin ? 26.0 : 0, e1 = E.rebond(k01(t, t0, t0 + .42)), bat = 1 + .03 * Math.max(0, 1 - ((t * 2) % 1) * 3.5);
      elHeros.style.opacity = 1;
      elHeros.style.transform = 'translate(' + r(lerp(-420, 150, e1)) + 'px, 34px) rotate(' + r(-4 * e1) + 'deg) scale(' + r(bat) + ')';
    }
    if(equipe){
      ROLES.forEach(function(ro, n){
        var c = document.getElementById('carte' + n), t1 = 24.0 + n * .1, e2 = E.rebond(k01(t, t1, t1 + .34)), moi = n === F.i, gros = moi ? 1 + .2 * E.rebond(k01(t, 24.5, 24.85)) : 1 - .06 * E.o(k01(t, 24.5, 24.8));
        var bat2 = moi ? 1 + .04 * Math.max(0, 1 - ((t * 2) % 1) * 3.5) : 1;
        c.style.opacity = t >= t1 ? 1 : 0; c.style.zIndex = moi ? 3 : 1;
        c.style.filter = moi ? 'drop-shadow(0 0 ' + r(26 * E.o(k01(t, 24.5, 24.9))) + 'px ' + ro[1] + ')' : 'brightness(' + r(1 - .45 * E.o(k01(t, 24.5, 24.8))) + ')';
        c.style.transform = 'translate(' + (174 + n * 282) + 'px,' + r(lerp(700, 26, e2)) + 'px) rotate(' + r([-3.5, 2.5, -2, 3.5][n] * e2) + 'deg) scale(' + r(gros * bat2) + ')';
      });
      if(t < 24.2) fx += '<div class="flash" style="opacity:' + r(1 - (t - 24) / .2) + '"></div>';
    }
  }
  /* --- les titres --- */
  if(debut){
    titres += mot(t, .5, 2.0, F.nom, 940, 236, F.nom.length > 11 ? 124 : 150, -2, {police:'Macondo', esp:2});
    titres += mot(t, 1.0, 2.0, F.devise, 940, 356, F.devise.length > 20 ? 54 : 62, 1.5, {coul:COUL, esp:2});
    var d1 = E.o(k01(t, 1.4, 1.65)); if(d1 > 0) titres += texte(940, 448, F.dit, {taille:38, coul:'#fff', op:d1, s:.94 + .06 * d1, esp:1});
  }
  titres += pastille(t);
  F.rubans.forEach(function(rb){ if(t >= rb[0] - .1 && t < rb[1]) titres += ruban(t, rb[0], rb[1], rb[2]); });
  F.mots.forEach(function(m, n){ titres += mot(t, m[0], m[1], m[2], 720, 330, m[2].length > 13 ? 116 : m[2].length > 10 ? 132 : 150, [-4, 3, -3, 4][n % 4]); });
  if(equipe) titres += ruban(t, 24.55, 26.0, 'L\'ÉQUIPE COMPTE SUR TOI !', 500);
  if(fin){
    titres += mot(t, 26.0, T + 1, 'JOUE', 940, 150, 104, -3, {coul:'#fff', esp:4});
    titres += mot(t, 26.25, T + 1, F.joue, 940, 286, F.joue.length > 12 ? 118 : 148, -2, {police:'Macondo', esp:2});
    titres += confettis(t, 26.25, 940, 330);
    var l1 = E.rebond(k01(t, 27.0, 27.35));
    if(l1 > 0) titres += '<g transform="translate(940 412) scale(' + r(l1) + ')">' + lanterne(-352, -14, .5, t) + texte(26, 0, 'Les Enquêteurs de Brumeval', {taille:58, police:'Macondo', coul:'#fff', esp:1}) + '</g>';
    var s2 = E.o(k01(t, 27.8, 28.1));
    if(s2 > 0) titres += '<g opacity="' + r(s2) + '" transform="translate(940 ' + r(516 + (1 - s2) * 16) + ')"><rect x="-300" y="-38" width="600" height="70" rx="35" fill="url(#orRuban)" stroke="#141a3a" stroke-width="5"/><text text-anchor="middle" y="13" font-family="\'Lilita One\'" font-size="40" fill="#141a3a" letter-spacing="1.5">ET TOI, QUEL HÉROS ES-TU ?</text></g>';
  }
  elTitres.innerHTML = titres;
  /* --- par-dessus : le bord sombre, le fondu du début et de la fin --- */
  fx += '<div class="vignette"></div>';
  if(t < .35) fx += '<div class="noir" style="opacity:' + r(1 - t / .35) + '"></div>';
  if(t >= 26 && t < 26.2) fx += '<div class="flash" style="opacity:' + r(1 - (t - 26) / .2) + '"></div>';
  if(t > T - .45) fx += '<div class="noir" style="opacity:' + r(k01(t, T - .45, T - .05)) + '"></div>';
  elFx.innerHTML = fx;
  return Promise.all(attente).then(function(){ return true; });
}
window.HEROS = window.PUB = {image:image, duree:T, film:ID, plans:PLANS, FILMS:FILMS, COUPES:PLANS.map(function(p){ return p[0]; })};
})();
