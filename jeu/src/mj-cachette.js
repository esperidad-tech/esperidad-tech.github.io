/* ==========================================================
   SE CACHER (Pisteur) — refait le 6 novembre 2026 (Romain, 2 h 34) :
   « retrouver la charte graphique de l'atelier de l'Alchimiste et de la
   course-poursuite ; améliorer le décor et les mouvements ; des personnages
   plus jolis, même vus du ciel, avec des mouvements plus fluides ; le
   pimenter : plusieurs pièces, pas une seule ; une version forêt et une
   version moulin ; des pièges. »

   Mêmes règles qu'avant : on touche une cachette entourée de bleu (à portée)
   pour y courir quand aucune lumière ne regarde ; il faut aller jusqu'à la
   porte de la dernière pièce. Nouveautés :
   - 2 pièces (3 au-delà du niveau 6) ; chacune a sa porte. On entre dans la
     suivante par le bas, le nom de la pièce s'affiche.
   - Trois décors : params.decor = 'ville' (par défaut : ruelle, place du
     marché, cour, la nuit), 'foret' (clairière, ruisseau, sous-bois, en fin
     de journée : Silas et les gardes champêtres regardent, sans lanterne),
     'moulin' (la cour, la salle des meules, le grenier, la nuit).
   - Des personnages vus du dessus, qui marchent vraiment : pieds, bras,
     cape qui flotte ; le Pisteur caché se tasse et ses yeux dépassent.
   - Les pièges : ce qui fait du bruit quand on passe dessus (flaque, feuilles,
     seau, brindilles, boue, planche qui grince, farine : « Atchoum ! ») ; un
     animal qui se réveille si on passe tout près (le chat, le lapin, l'oie) ;
     un fil à clochettes (niveau 5 et plus) : le franchir alerte tous les
     gardes de la pièce. On peut toujours passer sans franchir le fil.
   - Ce qui avance : la charrette (ville, cour du moulin), la nappe de brume
     qui dérive (forêt) : cachée dedans, on avance avec elle.
   Mods : erreurs, lent, zone, gardes, invisible, temps, aide / revele.
   ========================================================== */
(function(){
'use strict';
var MJ = window.MJ;
if(!MJ || !MJ.PA){ if(window.console) console.error('mj-cachette : mj-pisteur-alchi.js doit être chargé avant.'); return; }
var U = MJ.util, A = MJ.PA, K = A.CONTOUR, DEC = A.DEC;
var dist = A.dist, svgNoeud = A.svgNoeud, fixe = A.fixe, courbe = A.courbe, entier = A.entier, angleNorm = A.angleNorm;
function f1(v){ return (Math.round(v * 10) / 10).toString(); }
function f0(v){ return Math.round(v).toString(); }
function R(a, b){ return a + Math.random() * (b - a); }
function st(n){ return ' stroke="' + K + '" stroke-width="' + n + '"'; }

/* ==========================================================
   LES PERSONNAGES VUS DU DESSUS (ils regardent vers le haut ; on les tourne)
   ========================================================== */
var TP = {cape:'#2f7a4c', tun:'#3c8a58', tunC:'#6cbf88', capuche:'#3c9a62', capucheC:'#8ad8a6', peau:'#f1c7a0', botte:'#6b4426', botteC:'#9a6a3e', carquois:'#7a4e2c'};
function piedSVG(c, coul, coulC){ return '<g class="' + c + '"><ellipse rx="3.6" ry="5.2" fill="' + coul + '"' + st(1.9) + '/><path d="M-2,-2.6 H2" stroke="' + coulC + '" stroke-width="1.6" stroke-linecap="round"/></g>'; }
/* ce qu'un garde tient à la main : une petite lanterne tendue devant (true), une grosse lanterne portée sur le côté
   ('grande' : elle éclaire devant ET derrière), une torche levée ('torche' : un grand cercle de lumière autour de lui) */
function objetMain(o){
  /* la lanterne-boule du rôdeur : une boule de papier bleutée au bout d'un petit bâton */
  if(o === 'boule') return '<g class="cd-lant cd-boule"><path d="M0,3 L0,-6"' + st(4.4) + ' stroke-linecap="round"/><path d="M0,3 L0,-6" stroke="#6a4a8a" stroke-width="2.4" stroke-linecap="round"/><g transform="translate(0,-11)"><circle r="6.4" fill="#cfe0ff"' + st(1.6) + '/><path d="M-6,0 H6 M-4.6,-3.4 H4.6 M-4.6,3.4 H4.6" stroke="#8aa6e8" stroke-width="1" opacity=".8"/><circle cx="-1.6" cy="-1.6" r="1.8" fill="#fff"/></g></g>';
  if(o === 'torche') return '<g class="cd-lant cd-torche-m"><path d="M0,4 L0,-5"' + st(4.8) + ' stroke-linecap="round"/><path d="M0,4 L0,-5" stroke="#8a5a33" stroke-width="2.6" stroke-linecap="round"/><g transform="translate(0,-8)"><g class="cd-flamme"><circle r="5.8" fill="#ff8a3a"' + st(1.4) + '/><circle cy=".4" r="3.6" fill="#ffd36a"/><circle cy="-.4" r="1.7" fill="#fff4c8"/></g></g></g>';
  if(o === 'grande') return '<g class="cd-lant cd-cote"><path d="M0,-6 V-9"' + st(1.4) + '/><rect x="-5.2" y="-5.2" width="10.4" height="10.4" rx="2.2" fill="#b8862e"' + st(1.8) + '/><circle r="3.6" fill="#fff4c8"/><path d="M-5.2,0 H5.2 M0,-5.2 V5.2" stroke="' + K + '" stroke-width="1" opacity=".55"/></g>';
  if(o) return '<g class="cd-lant"><rect x="-3.6" y="-3.6" width="7.2" height="7.2" rx="1.4" fill="#b8862e"' + st(1.6) + '/><circle r="2.4" fill="#fff4c8"/></g>';
  return '';
}
function brasSVG(c, coul, peau, lanterne){ return '<g class="' + c + '"><path class="bc" d=""' + st(6.6) + ' stroke-linecap="round" fill="none"/><path class="bf" d="" stroke="' + coul + '" stroke-width="3.6" stroke-linecap="round" fill="none"/><circle class="bm" r="2.6" fill="' + peau + '"' + st(1.6) + '/>' + objetMain(lanterne) + '</g>'; }
/* un visage vu d'en haut et un peu de face : il dépasse à l'avant de la tête (yeux, joues) */
function visage(peau, extra){
  return '<ellipse cx="0" cy="-6.4" rx="5.6" ry="3.7" fill="' + peau + '"' + st(1.6) + '/>' +
    '<circle cx="-2.3" cy="-6.9" r="1.05" fill="' + K + '"/><circle cx="2.3" cy="-6.9" r="1.05" fill="' + K + '"/><circle cx="-2" cy="-7.2" r=".35" fill="#fff"/><circle cx="2.6" cy="-7.2" r=".35" fill="#fff"/>' +
    '<circle cx="-3.7" cy="-5.6" r="1" fill="#ef8f8f" opacity=".55"/><circle cx="3.7" cy="-5.6" r="1" fill="#ef8f8f" opacity=".55"/>' + (extra || '');
}
function pisteurDessus(){
  var C = TP;
  return '<g class="cd-perso cd-pisteur"><ellipse cx="2" cy="4.5" rx="13" ry="10" fill="#000" opacity=".3"/>' +
    '<g class="cd-corps">' + piedSVG('cd-pg', C.botte, C.botteC) + piedSVG('cd-pd', C.botte, C.botteC) +
    '<path class="cd-cape" d="" fill="' + C.cape + '"' + st(2.2) + ' stroke-linejoin="round"/>' +
    brasSVG('cd-bg', C.tun, C.peau) + brasSVG('cd-bd', C.tun, C.peau) +
    '<ellipse cx="0" cy="1" rx="11" ry="7.6" fill="' + C.tun + '"' + st(2.2) + '/>' +
    '<path d="M-7.6,-2.4 C-4.5,-5.6 3.5,-6 7.2,-2.8" stroke="' + C.tunC + '" stroke-width="1.8" fill="none" stroke-linecap="round" opacity=".8"/>' +
    '<g transform="translate(5,4) rotate(-38)"><path d="M-1.8,-8 l-1.4,-4.8 M.4,-8 l0,-5.6 M2.4,-8 l1.4,-4.8"' + st(3) + ' stroke-linecap="round"/><path d="M-1.8,-8 l-1.4,-4.8 M.4,-8 l0,-5.6 M2.4,-8 l1.4,-4.8" stroke="#e5484d" stroke-width="1.7" stroke-linecap="round"/>' +
      '<rect x="-3.3" y="-8.5" width="6.6" height="14" rx="2.8" fill="' + C.carquois + '"' + st(1.7) + '/><path d="M-3.3,-4.4 H3.3" stroke="#ffd36a" stroke-width="1.4"/></g>' +
    '<g class="cd-tete"><path d="M-4,3 L0,9 L4,3 Z" fill="' + C.capuche + '"' + st(1.9) + ' stroke-linejoin="round"/>' +
      '<circle cy="-1.5" r="8.4" fill="' + C.capuche + '"' + st(2.2) + '/>' +
      visage(C.peau, '<path d="M-4.3,-8.4 Q0,-10.6 4.3,-8.4" stroke="#7a4a28" stroke-width="1.7" fill="none" stroke-linecap="round"/>') +
      '<path d="M-6.4,-4.2 C-6.6,-8.8 -3.6,-10.8 0,-10.9 C3.6,-10.8 6.6,-8.8 6.4,-4.2" stroke="#2a6a42" stroke-width="1.8" fill="none" stroke-linecap="round"/>' +
      '<path d="M-5,0 C-4,2.6 -1.5,3.6 1.5,3.4" stroke="' + C.capucheC + '" stroke-width="1.6" fill="none" stroke-linecap="round" opacity=".8"/>' +
      '<g class="cd-yeux" opacity="0"><circle cx="-2.4" cy="-7.2" r="2" fill="#fff"' + st(.9) + '/><circle cx="2.4" cy="-7.2" r="2" fill="#fff"' + st(.9) + '/><circle cx="-2.2" cy="-7.8" r="1.05" fill="' + K + '"/><circle cx="2.6" cy="-7.8" r="1.05" fill="' + K + '"/></g>' +
    '</g></g></g>';
}
/* les gardes : celui de la ville (manteau bleu, tricorne), Silas et les gardes champêtres (képi vert),
   les ouvriers du moulin (casquette) ; une lanterne tendue devant eux, la nuit */
var GC = {
  ville:{manteau:'#3a5a9a', manteauC:'#6f92d6', chap:'tricorne', chapC:'#2a2440', chapB:'#463c66', peau:'#f1c7a0', lanterne:true, botte:'#2a2030', botteC:'#4a3e58', or:true},
  foret:{manteau:'#4f7a3a', manteauC:'#86b866', chap:'kepi', chapC:'#3e6b2e', chapB:'#2a4c1e', peau:'#f1c7a0', lanterne:false, botte:'#3b2a1e', botteC:'#5e4430'},
  moulin:{manteau:'#7a5236', manteauC:'#b48a62', chap:'casquette', chapC:'#4a3a2e', chapB:'#6a5444', peau:'#e8b98f', lanterne:true, botte:'#2e221a', botteC:'#4e3e30'}
};
/* Romain, 6 nov., 9 h 02 : « plusieurs styles d'ennemis » → le veilleur à la grosse lanterne (elle éclaire devant et
   derrière lui), le porteur de torche (un grand cercle de lumière autour de lui) ; et le chien (chienDessus) */
var ROLES = {
  veilleur:{manteau:'#5d4f7a', manteauC:'#9488b8', chap:'rond', chapC:'#3a3046', chapB:'#5a4a6a', peau:'#f1c7a0', lanterne:'grande', botte:'#2a2030', botteC:'#4a3e58'},
  torche:{manteau:'#a8452e', manteauC:'#e0805e', chap:'cheveux', chapC:'#5a3a24', chapB:'#e8b04a', peau:'#e8b98f', lanterne:'torche', botte:'#3b2a1e', botteC:'#5e4430'},
  /* les villageois, sans vision (6 nov., 10 h 50) : la cueilleuse de baies (forêt, chapeau de paille, panier) et le
     porteur (ville, moulin : il déplace caisses, tonneaux et sacs) */
  cueilleur:{manteau:'#c8574a', manteauC:'#f08a7a', chap:'rond', chapC:'#e6c25a', chapB:'#c9a03a', peau:'#f1c7a0', lanterne:false, panier:true, botte:'#5e3e26', botteC:'#8a5a3a'},
  porteur:{manteau:'#7a6a4a', manteauC:'#b4a07a', chap:'casquette', chapC:'#4a5a6e', chapB:'#6a7a8e', peau:'#e8b98f', lanterne:false, botte:'#3b2a1e', botteC:'#5e4430'},
  /* le rôdeur (niveau 10) : grande cape violette, chapeau rond, une lanterne-boule levée (sa zone ronde, bleutée) */
  rodeur:{manteau:'#5a3f8a', manteauC:'#9a7ad0', chap:'rond', chapC:'#2e2240', chapB:'#4a3a62', peau:'#f1c7a0', lanterne:'boule', botte:'#2a2030', botteC:'#4a3e58'}
};
function gardeDessus(sorte, role){
  var C = (role && ROLES[role]) ? Object.assign({}, ROLES[role], sorte === 'foret' && role === 'veilleur' ? {manteau:'#6b5a3a', manteauC:'#a8926a', chapC:'#3e3424', chapB:'#5e4e34'} : {}) : (GC[sorte] || GC.ville), chap;
  var moust = role === 'veilleur' ? '<path d="M-3.4,-4.2 C-2,-3 -.8,-3.4 0,-4.2 C.8,-3.4 2,-3 3.4,-4.2" stroke="#e8e2d6" stroke-width="1.6" fill="none" stroke-linecap="round"/>' : (role ? '' : (sorte === 'foret' ? '<path d="M-3.4,-4.4 C-2,-3.4 -.8,-3.6 0,-4.4 C.8,-3.6 2,-3.4 3.4,-4.4" stroke="#5a3a24" stroke-width="1.5" fill="none" stroke-linecap="round"/>' : (sorte === 'moulin' ? '<path d="M-3,-4.3 Q0,-3 3,-4.3" stroke="#6a4a30" stroke-width="1.8" fill="none" stroke-linecap="round"/>' : '')));
  /* le chapeau (vu d'en haut) : sa calotte derrière, le visage devant, puis la visière par-dessus le front */
  if(C.chap === 'tricorne') chap = '<path d="M0,-6 C7,-4.4 11.5,1 11.5,6.5 C5,4.6 -5,4.6 -11.5,6.5 C-11.5,1 -7,-4.4 0,-6 Z" fill="' + C.chapC + '"' + st(2.1) + ' stroke-linejoin="round"/><path d="M-9,4 C-6,-1.4 6,-1.4 9,4" stroke="#ffd36a" stroke-width="1.2" fill="none" opacity=".85"/><circle cy="1" r="5" fill="' + C.chapB + '"' + st(1.7) + '/>' + visage(C.peau, moust) + '<path d="M-6.6,-5.6 Q0,-10.4 6.6,-5.6 Q0,-8.2 -6.6,-5.6 Z" fill="' + C.chapC + '"' + st(1.6) + '/><circle cx="0" cy="-8.4" r="1.7" fill="#e5484d"' + st(.9) + '/>';
  else if(C.chap === 'rond') chap = '<ellipse cy="-.6" rx="11" ry="10" fill="' + C.chapC + '"' + st(2.1) + '/><ellipse cy="-.6" rx="8" ry="7.2" fill="none" stroke="' + C.chapB + '" stroke-width="1.4" opacity=".8"/>' + visage(C.peau, moust) + '<circle cy="2.6" r="5" fill="' + C.chapB + '"' + st(1.7) + '/><path d="M-3,1 Q0,-.6 3,1" stroke="#e8b04a" stroke-width="1.3" fill="none"/>';
  else if(C.chap === 'cheveux') chap = '<circle cy="-.2" r="7.6" fill="' + C.chapC + '"' + st(2.1) + '/><path d="M-4,3.5 C-2,6 2,6 4,3.5 M-5.6,1 C-3,4 3,4 5.6,1" stroke="#7a5236" stroke-width="1.4" fill="none" stroke-linecap="round"/>' + visage(C.peau, '') + '<path d="M-7,-4.6 Q0,-9.4 7,-4.6" stroke="' + C.chapB + '" stroke-width="2.6" fill="none" stroke-linecap="round"/><path d="M6.6,-4.4 l3.4,2.6 M6.6,-4.4 l3.8,-.6" stroke="' + C.chapB + '" stroke-width="2" stroke-linecap="round"/>';
  else if(C.chap === 'kepi') chap = '<circle cy="-.5" r="7.6" fill="' + C.chapC + '"' + st(2.1) + '/><circle cy="-.5" r="4.2" fill="none" stroke="' + C.chapB + '" stroke-width="1.4"/>' + visage(C.peau, moust) + '<path d="M-6.2,-5.4 Q0,-10.2 6.2,-5.4 Q0,-7.6 -6.2,-5.4 Z" fill="' + C.chapB + '"' + st(1.6) + '/><circle cx="0" cy="-7.4" r="1.4" fill="#ffd36a"' + st(.8) + '/>';
  else chap = '<circle cy="-.5" r="7.8" fill="' + C.chapC + '"' + st(2.1) + '/><path d="M-4.6,1.6 C-2,-2.4 2.6,-2.4 4.6,1.2" stroke="' + C.chapB + '" stroke-width="1.6" fill="none"/>' + visage(C.peau, moust) + '<path d="M-6.2,-5.4 Q0,-10.6 6.2,-5.4 Q0,-7.8 -6.2,-5.4 Z" fill="' + C.chapB + '"' + st(1.6) + '/>';
  return '<g class="cd-perso cd-garde-c"><ellipse cx="2" cy="4.5" rx="14.5" ry="11" fill="#000" opacity=".32"/>' +
    '<g class="cd-corps">' + piedSVG('cd-pg', C.botte, C.botteC) + piedSVG('cd-pd', C.botte, C.botteC) +
    brasSVG('cd-bg', C.manteau, C.peau) + brasSVG('cd-bd', C.manteau, C.peau, C.lanterne) +
    '<ellipse cx="0" cy="1" rx="12.6" ry="8.6" fill="' + C.manteau + '"' + st(2.2) + '/>' +
    '<path d="M-8.6,-2.6 C-5,-6.2 4.6,-6.6 8.2,-3.2" stroke="' + C.manteauC + '" stroke-width="1.8" fill="none" stroke-linecap="round" opacity=".75"/>' +
    (C.or ? '<path d="M-12,-.5 l3.6,-2 M12,-.5 l-3.6,-2" stroke="#ffd36a" stroke-width="2.6" stroke-linecap="round"/>' : '') +
    (role === 'cueilleur' ? '<path d="M-6,4 C-2,8 4,8 7,4" stroke="#f4ecdc" stroke-width="3" fill="none" stroke-linecap="round"/>' : '') +
    (C.panier ? '<g class="cd-panier" transform="translate(-13,5)"><ellipse rx="7" ry="6" fill="#b8864a"' + st(2) + '/><ellipse rx="4.6" ry="3.8" fill="#7a5232"/><circle cx="-1.6" cy="-.6" r="1.7" fill="#e5484d"/><circle cx="1.6" cy=".4" r="1.7" fill="#e5484d"/><circle cx="0" cy="-2" r="1.5" fill="#c4303a"/><path d="M-6,-2 C-4,-9 4,-9 6,-2" stroke="#8a5a33" stroke-width="1.8" fill="none"/></g>' : '') +
    '<g class="cd-tete">' + chap + '</g></g></g>';
}
/* Fait bouger un personnage : pieds qui avancent l'un après l'autre, bras qui balancent, cape qui flotte.
   st = {ph : phase de la foulée, amp : 0 (immobile) → 1 (court), t : temps, cache : 0 → 1 (tassé dans sa cachette)} */
function Bonhomme(g){
  var q = function(s){ return g.querySelector(s); };
  var pg = q('.cd-pg'), pd = q('.cd-pd'), cape = q('.cd-cape'), tete = q('.cd-tete'), yeux = q('.cd-yeux'), corps = q('.cd-corps');
  var B = ['.cd-bg', '.cd-bd'].map(function(s){ var n = q(s); if(!n) return null; var l = n.querySelector('.cd-lant'); return {c:n.querySelector('.bc'), f:n.querySelector('.bf'), m:n.querySelector('.bm'), l:l, lc:l ? (l.classList.contains('cd-cote') ? 'cote' : (l.classList.contains('cd-torche-m') ? 'torche' : '')) : ''}; });
  var yeuxV = -1;
  return {poser:function(e){
    var ph = e.ph || 0, a = fixe(e.amp || 0, 0, 1), t = e.t || 0, c = fixe(e.cache || 0, 0, 1), s = Math.sin(ph) * a;
    var pas = 7 * (1 - c);
    if(pg) pg.setAttribute('transform', 'translate(' + f1(-4.6 + c * 1.4) + ',' + f1(-0.5 - s * pas + c * 2) + ')');
    if(pd) pd.setAttribute('transform', 'translate(' + f1(4.6 - c * 1.4) + ',' + f1(-0.5 + s * pas + c * 2) + ')');
    for(var k = 0; k < 2; k++){
      var b = B[k]; if(!b) continue;
      var sg = k ? 1 : -1, hx, hy, d;
      if(b.l && b.lc === 'cote'){
        /* la grosse lanterne, portée à bout de bras sur le côté : elle se balance au rythme des pas */
        hx = 13.6 + Math.sin(t * 2.1) * 0.5; hy = 1 + s * 2.4;
        d = 'M9.2,-2 Q13.6,-1.2 ' + f1(hx) + ',' + f1(hy);
        b.l.setAttribute('transform', 'translate(' + f1(hx) + ',' + f1(hy + 3.6) + ') rotate(' + f1(Math.sin(t * 2.1) * 8 + s * 12) + ')');
      } else if(b.l && b.lc === 'torche'){
        /* la torche, levée devant lui */
        hx = 9.4 + Math.sin(t * 1.7) * 0.6; hy = -12.4 + s * 1.2;
        d = 'M8.8,-2 Q12.8,-6.6 ' + f1(hx) + ',' + f1(hy);
        b.l.setAttribute('transform', 'translate(' + f1(hx) + ',' + f1(hy - 1) + ')');
      } else if(b.l){
        /* le bras qui tient la lanterne, tendu devant : elle se balance un peu */
        hx = 8.4 + Math.sin(t * 2.1) * 0.8; hy = -14 + Math.cos(t * 2.6) * 1 + s * 1.3;
        d = 'M8.8,-2 Q12.6,-7.4 ' + f1(hx) + ',' + f1(hy);
        b.l.setAttribute('transform', 'translate(' + f1(hx) + ',' + f1(hy - 3.2) + ') rotate(' + f1(Math.sin(t * 2.1) * 12) + ')');
      } else if(e.pose === 'porte'){
        /* les deux mains devant, qui tiennent ce qu'il porte */
        hx = sg * 8; hy = -13 + s * 0.8;
        d = 'M' + f1(sg * 9.2) + ',-2 Q' + f1(sg * 12) + ',-8 ' + f1(hx) + ',' + f1(hy);
      } else if(e.pose === 'cueille'){
        /* une main puis l'autre vont chercher les baies devant, et reviennent au panier */
        var ph2 = t * 5.2 + k * Math.PI, ve = Math.max(0, Math.sin(ph2));
        hx = sg * (7 - ve * 2); hy = -4 - ve * 13;
        d = 'M' + f1(sg * 9.2) + ',-2 Q' + f1(sg * 12) + ',' + f1(hy / 2 - 2) + ' ' + f1(hx) + ',' + f1(hy);
      } else {
        var w = (k ? -s : s) * 6;
        hx = sg * (11.4 - c * 5 + Math.abs(w) * 0.1); hy = 1.5 + w - c * 9;
        d = 'M' + f1(sg * 9.2) + ',-2 Q' + f1(sg * (13.6 - c * 3)) + ',' + f1((hy - 2) / 2) + ' ' + f1(hx) + ',' + f1(hy);
      }
      b.c.setAttribute('d', d); b.f.setAttribute('d', d);
      b.m.setAttribute('transform', 'translate(' + f1(hx) + ',' + f1(hy) + ')');
    }
    if(cape){
      var bas = 12.5 + a * 4.5 - c * 2, ond = 0.9 + a * 2.4, larg = 1 + c * 0.16, pts = [];
      for(var i = 0; i < 5; i++) pts.push([(-10 + i * 5) * larg, bas + ond * Math.sin(t * (6 + 5 * a) + i * 1.4) - (i === 0 || i === 4 ? 2.2 : 0)]);
      var dc = 'M-9.4,-2.6 C-13,2.6 ' + f1(-12.4 * larg) + ',' + f1(bas - 5) + ' ' + f1(pts[0][0]) + ',' + f1(pts[0][1]);
      for(var p2 = 1; p2 < 5; p2++) dc += ' Q' + f1((pts[p2 - 1][0] + pts[p2][0]) / 2) + ',' + f1((pts[p2 - 1][1] + pts[p2][1]) / 2 + 2.4) + ' ' + f1(pts[p2][0]) + ',' + f1(pts[p2][1]);
      cape.setAttribute('d', dc + ' C' + f1(12.4 * larg) + ',' + f1(bas - 5) + ' 13,2.6 9.4,-2.6 Z');
    }
    if(tete) tete.setAttribute('transform', 'translate(0,' + f1(-Math.abs(s) * 0.8 + c * 2.5) + ') rotate(' + f1(e.regard || 0) + ')');
    if(corps) corps.setAttribute('transform', 'scale(' + (1 + 0.035 * Math.abs(s) - 0.13 * c).toFixed(3) + ')');
    var yv = c > 0.5 ? 1 : 0;
    if(yeux && yv !== yeuxV){ yeuxV = yv; yeux.setAttribute('opacity', yv); }
  }};
}
/* Le chien vu du dessus (il regarde vers le haut) : un brave chien de garde roux à oreilles tombantes, collier rouge.
   Il trotte (pattes en diagonale), remue la queue, baisse le museau pour renifler, dresse les oreilles quand il flaire. */
function chienDessus(){
  var c = '#c98a4b', cS = '#8a5530', cC = '#f4e6cf';
  function patte(cl, x, y){ return '<g class="' + cl + '" transform="translate(' + x + ',' + y + ')"><ellipse rx="2.7" ry="3.5" fill="' + c + '"' + st(1.6) + '/><path d="M-1.1,-2.5 v1.3 M1.1,-2.5 v1.3" stroke="' + cS + '" stroke-width=".9"/></g>'; }
  return '<g class="cd-perso cd-chien"><ellipse cx="2" cy="4" rx="11" ry="16" fill="#000" opacity=".3"/>' +
    '<g class="ch-corps">' + patte('ch-p1', -6, -8) + patte('ch-p2', 6, -8) + patte('ch-p3', -6, 9) + patte('ch-p4', 6, 9) +
    '<g class="ch-queue" transform="translate(0,12)"><path d="M0,0 C1.6,4 -1.6,8 0,12"' + st(5.6) + ' fill="none" stroke-linecap="round"/><path d="M0,0 C1.6,4 -1.6,8 0,12" stroke="' + c + '" stroke-width="3.2" fill="none" stroke-linecap="round"/><circle cy="12" r="1.7" fill="' + cC + '"/></g>' +
    '<ellipse cy="1" rx="8.4" ry="12.6" fill="' + c + '"' + st(2.2) + '/>' +
    '<ellipse cx="1.8" cy="3.4" rx="3.6" ry="5.4" fill="' + cS + '" opacity=".5"/><path d="M-5,-3 C-2,-5.4 2,-5.4 5,-3" stroke="#e6aa6a" stroke-width="1.6" fill="none" stroke-linecap="round" opacity=".8"/>' +
    '<path d="M-6.2,-8.4 Q0,-5.8 6.2,-8.4" stroke="#e5484d" stroke-width="2.6" fill="none" stroke-linecap="round"/><circle cx="0" cy="-6.6" r="1.6" fill="#ffd36a"' + st(.8) + '/>' +
    '<g class="ch-tete" transform="translate(0,-12)">' +
      '<path class="ch-o1" d="M-4.2,-3 C-10,-2 -10.5,5 -7,7 C-5.6,4 -4.6,1 -3.4,-.4 Z" fill="' + cS + '"' + st(1.6) + ' stroke-linejoin="round"/>' +
      '<path class="ch-o2" d="M4.2,-3 C10,-2 10.5,5 7,7 C5.6,4 4.6,1 3.4,-.4 Z" fill="' + cS + '"' + st(1.6) + ' stroke-linejoin="round"/>' +
      '<ellipse rx="6.2" ry="6.4" fill="' + c + '"' + st(2) + '/>' +
      '<ellipse cy="-6" rx="3.6" ry="4.4" fill="' + cC + '"' + st(1.6) + '/><ellipse cy="-9.6" rx="2.1" ry="1.6" fill="' + K + '"/><circle cx="-.6" cy="-10" r=".5" fill="#fff"/>' +
      '<circle cx="-2.6" cy="-2.2" r="1.15" fill="' + K + '"/><circle cx="2.6" cy="-2.2" r="1.15" fill="' + K + '"/><circle cx="-2.3" cy="-2.6" r=".4" fill="#fff"/><circle cx="2.9" cy="-2.6" r=".4" fill="#fff"/>' +
    '</g></g></g>';
}
/* e = {ph, amp, t, renifle (museau au sol), dresse (oreilles levées : il a flairé), content (la queue frétille fort)} */
function Chien(g){
  var q = function(s){ return g.querySelector(s); };
  var P = [q('.ch-p1'), q('.ch-p2'), q('.ch-p3'), q('.ch-p4')], queue = q('.ch-queue'), tete = q('.ch-tete'), o1 = q('.ch-o1'), o2 = q('.ch-o2'), corps = q('.ch-corps');
  var BASE = [[-6, -8], [6, -8], [-6, 9], [6, 9]];
  return {poser:function(e){
    var ph = e.ph || 0, a = fixe(e.amp || 0, 0, 1), t = e.t || 0, s = Math.sin(ph) * a, dec = [s, -s, -s, s];
    for(var i = 0; i < 4; i++) P[i].setAttribute('transform', 'translate(' + BASE[i][0] + ',' + f1(BASE[i][1] + dec[i] * 3.6) + ')');
    var wag = e.content ? 28 * Math.sin(t * 15) : (e.dresse ? 6 * Math.sin(t * 9) : 14 * Math.sin(t * 6));
    queue.setAttribute('transform', 'translate(0,12) rotate(' + f1(wag) + ')');
    var nez = e.renifle ? -1.6 + Math.sin(t * 24) * 1.3 : -Math.abs(s) * 0.8;
    tete.setAttribute('transform', 'translate(' + f1(e.renifle ? Math.sin(t * 4.6) * 1.8 : 0) + ',' + f1(-12 + nez) + ')');
    var flop = Math.sin(ph) * a * 9 + (e.dresse ? -20 : 0);
    o1.setAttribute('transform', 'rotate(' + f1(flop) + ' -4 -2)'); o2.setAttribute('transform', 'rotate(' + f1(-flop) + ' 4 -2)');
    if(corps) corps.setAttribute('transform', 'scale(' + (1 + 0.03 * Math.abs(s)).toFixed(3) + ')');
  }};
}
MJ.DESSUS = {pisteur:pisteurDessus, garde:gardeDessus, Bonhomme:Bonhomme, chien:chienDessus, Chien:Chien};

/* ==========================================================
   LE DÉCOR : motifs, pièces, cachettes, pièges
   ========================================================== */
function defsC(id){
  var s = '<defs>';
  /* pavés (ville, la nuit) */
  s += '<pattern id="' + id + 'pv" width="44" height="30" patternUnits="userSpaceOnUse"><rect width="44" height="30" fill="#4c4b5e"/>';
  [[1, 1, 20, 13, '#66657c'], [23, 1, 20, 13, '#605f76'], [-10, 16, 20, 13, '#5d5c72'], [12, 16, 20, 13, '#6a6982'], [34, 16, 20, 13, '#62617a']].forEach(function(r){ s += '<rect x="' + r[0] + '" y="' + r[1] + '" width="' + r[2] + '" height="' + r[3] + '" rx="5" fill="' + r[4] + '"/><path d="M' + (r[0] + 4) + ',' + (r[1] + 3.5) + ' h' + (r[2] - 9) + '" stroke="#8b8aa4" stroke-width="1.8" stroke-linecap="round" opacity=".5"/>'; });
  s += '</pattern>';
  /* grandes dalles (la place) */
  s += '<pattern id="' + id + 'dl" width="64" height="64" patternUnits="userSpaceOnUse"><rect width="64" height="64" fill="#48475a"/>' + [[2, 2, '#6a6880'], [34, 2, '#636179'], [2, 34, '#5f5d75'], [34, 34, '#6e6c85']].map(function(r){ return '<rect x="' + r[0] + '" y="' + r[1] + '" width="28" height="28" rx="3" fill="' + r[2] + '"/><path d="M' + (r[0] + 4) + ',' + (r[1] + 4) + ' h15" stroke="#8d8ba6" stroke-width="2" stroke-linecap="round" opacity=".45"/>'; }).join('') + '</pattern>';
  /* terre battue */
  s += '<pattern id="' + id + 'te" width="44" height="44" patternUnits="userSpaceOnUse"><rect width="44" height="44" fill="#5e5048"/><circle cx="6" cy="8" r="2.4" fill="#76665a"/><circle cx="30" cy="5" r="1.8" fill="#4a3e38"/><circle cx="20" cy="26" r="2.8" fill="#6e5e52"/><circle cx="38" cy="34" r="1.6" fill="#7e6e60"/><circle cx="9" cy="37" r="1.4" fill="#4a3e38"/><path d="M24,14 l6,2 M3,22 l5,-1" stroke="#4a3e38" stroke-width="1.5"/></pattern>';
  /* herbe (forêt, fin de journée) */
  s += '<pattern id="' + id + 'he" width="40" height="40" patternUnits="userSpaceOnUse"><rect width="40" height="40" fill="#5c8f45"/><path d="M6,12 l-2,-6 M6,12 l1,-7 M6,12 l4,-5 M26,30 l-2,-6 M26,30 l1,-7 M26,30 l4,-5" stroke="#78ad58" stroke-width="2" stroke-linecap="round"/><path d="M30,8 l-1,-5 M30,8 l3,-4 M12,34 l-1,-5 M12,34 l3,-4" stroke="#4b7a38" stroke-width="2" stroke-linecap="round"/><circle cx="20" cy="16" r="1.6" fill="#8ec06a"/></pattern>';
  /* mousse du sous-bois */
  s += '<pattern id="' + id + 'mo" width="48" height="48" patternUnits="userSpaceOnUse"><rect width="48" height="48" fill="#3f6638"/><ellipse cx="12" cy="10" rx="8" ry="5" fill="#4a7642"/><ellipse cx="34" cy="30" rx="10" ry="6" fill="#36592f"/><ellipse cx="10" cy="38" rx="6" ry="4" fill="#4f7d45"/><path d="M28,8 c3,-4 8,-4 9,0 c-3,3 -6,3 -9,0 Z" fill="#a87a3c" opacity=".8"/></pattern>';
  /* planches (moulin) */
  s += '<pattern id="' + id + 'pl" width="96" height="22" patternUnits="userSpaceOnUse"><rect width="96" height="22" fill="#6e5038"/><rect y="1" width="58" height="9.5" fill="#7d5c40"/><rect x="60" y="1" width="36" height="9.5" fill="#76573c"/><rect x="-20" y="12" width="40" height="9.5" fill="#7a593e"/><rect x="22" y="12" width="74" height="9.5" fill="#80603f"/><path d="M4,5 h40 M28,16 h50" stroke="#5e432e" stroke-width="1.2" opacity=".6"/><circle cx="55" cy="5.5" r="1.1" fill="#3b2a1e"/><circle cx="18" cy="16.5" r="1.1" fill="#3b2a1e"/></pattern>';
  /* murs de pierre */
  s += '<pattern id="' + id + 'mu" width="32" height="22" patternUnits="userSpaceOnUse"><rect width="32" height="22" fill="#3a384a"/><rect x="1" y="1" width="18" height="9" rx="2" fill="#5a5870"/><rect x="21" y="1" width="10" height="9" rx="2" fill="#535169"/><rect x="-6" y="12" width="12" height="9" rx="2" fill="#56546c"/><rect x="8" y="12" width="22" height="9" rx="2" fill="#5e5c75"/></pattern>';
  /* tuiles (toits vus du dessus, la nuit) */
  s += '<pattern id="' + id + 'tu" width="16" height="12" patternUnits="userSpaceOnUse"><rect width="16" height="12" fill="#8a4a3a"/><path d="M0,12 C0,5 8,5 8,12 C8,5 16,5 16,12 M-8,6 C-8,-1 0,-1 0,6 C0,-1 8,-1 8,6 C8,-1 16,-1 16,6" fill="none" stroke="#5e2e24" stroke-width="1.6"/></pattern>';
  /* l'eau */
  s += '<linearGradient id="' + id + 'eau" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2c5f86"/><stop offset=".5" stop-color="#3c80ad"/><stop offset="1" stop-color="#2a5878"/></linearGradient>';
  /* la lumière chaude (lanternes, fenêtres) et la lumière de lune */
  s += '<radialGradient id="' + id + 'lu" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#ffe7a8" stop-opacity=".75"/><stop offset=".55" stop-color="#ffd27a" stop-opacity=".25"/><stop offset="1" stop-color="#ffd27a" stop-opacity="0"/></radialGradient>';
  s += '<linearGradient id="' + id + 'lune" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#cfe2ff" stop-opacity=".42"/><stop offset="1" stop-color="#cfe2ff" stop-opacity="0"/></linearGradient>';
  /* les feuillages : un vert qui s'éclaire en haut à gauche */
  s += '<radialGradient id="' + id + 'fe" cx=".36" cy=".32" r=".72"><stop offset="0" stop-color="#7fbf5e"/><stop offset=".6" stop-color="#3f7f3e"/><stop offset="1" stop-color="#24552c"/></radialGradient>';
  s += '<radialGradient id="' + id + 'fn" cx=".36" cy=".32" r=".72"><stop offset="0" stop-color="#5e9a52"/><stop offset=".6" stop-color="#2e5e34"/><stop offset="1" stop-color="#173a22"/></radialGradient>';
  /* la brume */
  s += '<radialGradient id="' + id + 'br" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#f4f6ff" stop-opacity=".92"/><stop offset=".6" stop-color="#e8ecff" stop-opacity=".7"/><stop offset="1" stop-color="#e8ecff" stop-opacity="0"/></radialGradient>';
  /* le grand cercle de la torche : orangé au milieu, plus pâle au bord */
  /* (plus fort au bord qu'avant : Romain, 6 nov., 12 h 49 : « on ne voit pas assez celui qui a le rond autour de lui ») */
  s += '<radialGradient id="' + id + 'to" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#ffe08a" stop-opacity=".62"/><stop offset=".72" stop-color="#ffb35a" stop-opacity=".42"/><stop offset="1" stop-color="#ff8a2a" stop-opacity=".5"/></radialGradient>';
  /* la zone ronde du rôdeur : bleu-violet, pour ne pas la confondre avec la torche */
  s += '<radialGradient id="' + id + 'ro" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#d6c8ff" stop-opacity=".5"/><stop offset=".72" stop-color="#9f86ff" stop-opacity=".42"/><stop offset="1" stop-color="#6f4cff" stop-opacity=".55"/></radialGradient>';
  return s + '</defs>';
}
var DX0 = DEC.x, DY0 = DEC.y, DW = DEC.w, DH = DEC.h, DX1 = DEC.x + DEC.w, DY1 = DEC.y + DEC.h;
function rect(x, y, w, h, fill, extra){ return '<rect x="' + f0(x) + '" y="' + f0(y) + '" width="' + f0(w) + '" height="' + f0(h) + '" fill="' + fill + '"' + (extra || '') + '/>'; }
function lueur(id, x, y, r, op){ return '<circle cx="' + f0(x) + '" cy="' + f0(y) + '" r="' + f0(r) + '" fill="url(#' + id + 'lu)"' + (op ? ' opacity="' + op + '"' : '') + '/>'; }
/* un toit vu du ciel (la nuit) */
function toit(id, x, y, w, h, vert){
  var s = rect(x + 6, y + 8, w, h, '#000', ' opacity=".3" rx="3"') + rect(x, y, w, h, 'url(#' + id + 'tu)', ' rx="3"' + st(3.5));
  if(vert) s += rect(x + w / 2, y + 2, w / 2 - 2, h - 4, '#120a18', ' opacity=".3"') + '<path d="M' + f0(x + w / 2) + ',' + f0(y + 2) + ' V' + f0(y + h - 2) + '"' + st(3) + '/>';
  else s += rect(x + 2, y + h / 2, w - 4, h / 2 - 2, '#120a18', ' opacity=".3"') + '<path d="M' + f0(x + 2) + ',' + f0(y + h / 2) + ' H' + f0(x + w - 2) + '"' + st(3) + '/>';
  return s;
}
/* une couronne d'arbre vue du ciel */
function couronne(id, x, y, r, nuit){
  var s = '<ellipse cx="' + f0(x + r * 0.3) + '" cy="' + f0(y + r * 0.4) + '" rx="' + f0(r) + '" ry="' + f0(r * 0.9) + '" fill="#0c140c" opacity=".35"/>', g = nuit ? 'fn' : 'fe';
  var pts = [[0, 0, 0.62]]; for(var i = 0; i < 6; i++){ var a = i / 6 * 6.283 + R(-0.3, 0.3); pts.push([Math.cos(a) * r * 0.55, Math.sin(a) * r * 0.55, R(0.42, 0.55)]); }
  s += pts.map(function(q){ return '<circle cx="' + f0(x + q[0]) + '" cy="' + f0(y + q[1]) + '" r="' + f0(r * q[2]) + '" fill="url(#' + id + g + ')"' + st(3) + '/>'; }).join('');
  s += pts.slice(1).map(function(q){ return '<circle cx="' + f0(x + q[0] - r * 0.12) + '" cy="' + f0(y + q[1] - r * 0.14) + '" r="' + f0(r * q[2] * 0.4) + '" fill="' + (nuit ? '#6fa060' : '#a8e080') + '" opacity=".38"/>'; }).join('');
  return s;
}
/* Les pièces : le sol, les murs (avec la porte en haut et l'entrée en bas), les lumières, ce qui passe au-dessus */
var PIECES = {
  ville:{nuit:true, types:['rue', 'place', 'cour'], noms:{rue:'La ruelle', place:'La place du marché', cour:'La cour'}},
  foret:{nuit:false, types:['clairiere', 'ruisseau', 'sousbois'], noms:{clairiere:'La clairière', ruisseau:'Le ruisseau', sousbois:'Le sous-bois'}},
  moulin:{nuit:true, types:['cour', 'meules', 'grenier'], noms:{cour:'La cour du moulin', meules:'La salle des meules', grenier:'Le grenier'}}
};
function porteHaut(id, decor, type){
  /* le mur du haut et la porte (au centre, en y = 40) */
  var s = '';
  if(decor === 'foret'){
    s += '<path d="M' + DX0 + ',' + DY0 + ' H' + DX1 + ' V8 C300,22 250,14 214,6 L214,-6 L146,-6 L146,6 C110,14 60,22 ' + DX0 + ',8 Z" fill="#1c3a22"/>';
    [[-60, -20, 60], [40, -14, 56], [110, -30, 44], [250, -30, 46], [320, -16, 58], [420, -22, 62], [-170, -10, 64], [520, -12, 60]].forEach(function(c){ s += couronne(id, c[0], c[1], c[2], false); });
    s += '<path d="M156,46 C160,26 170,6 168,-30 L192,-30 C190,6 200,26 204,46 Z" fill="#9a7a52" opacity=".85"/>';
    s += '<g transform="translate(222,30)"><path d="M0,10 V-12"' + st(6) + '/><path d="M0,10 V-12" stroke="#8a5a33" stroke-width="3.5"/><path d="M-4,-16 H16 L22,-10 L16,-4 H-4 Z" fill="#c99a5e"' + st(2.6) + ' stroke-linejoin="round"/><path d="M2,-10 H13 M9,-13 L13,-10 L9,-7" stroke="' + K + '" stroke-width="2" fill="none" stroke-linecap="round"/></g>';
    return s;
  }
  var mur = decor === 'moulin' && type !== 'cour' ? 'url(#' + id + 'mu)' : (decor === 'moulin' ? '#4a4050' : 'url(#' + id + 'mu)');
  s += rect(DX0, DY0, DW, 12 - DY0, mur) + '<path d="M' + DX0 + ',12 H' + DX1 + '"' + st(4) + '/>';
  if(decor === 'ville' && type !== 'cour') s += toit(id, -60, DY0, 200, 4 - DY0, false) + toit(id, 220, DY0, 220, 4 - DY0, false) + toit(id, -240, DY0, 170, 4 - DY0, true) + toit(id, 450, DY0, 170, 4 - DY0, true);
  if(decor === 'moulin' && type === 'meules') s += '<g transform="translate(180,12)">' + [-1, 1].map(function(k){ return '<path d="M' + (k * 34) + ',0 V-40"' + st(6) + '/>'; }).join('') + '</g>';
  /* l'encadrement de pierre et la porte de bois (un escalier pour monter au grenier) */
  var esc = decor === 'moulin' && type === 'meules';
  s += '<g transform="translate(180,24)"><rect x="-32" y="-22" width="64" height="30" rx="4" fill="#8d879c"' + st(3.5) + '/>' +
    (esc ? '<rect x="-24" y="-18" width="48" height="24" fill="#3b2a1e"' + st(2.5) + '/>' + [0, 1, 2, 3].map(function(i){ return '<rect x="-24" y="' + (-18 + i * 6) + '" width="48" height="5" fill="' + ['#9a7350', '#8a6545', '#7a583a', '#6a4c32'][i] + '"' + st(1.4) + '/>'; }).join('') :
      '<path d="M-24,8 L-24,-6 C-24,-24 24,-24 24,-6 L24,8 Z" fill="#6e4424"' + st(3) + '/><path d="M0,-20 V8 M-24,-2 H24" stroke="' + K + '" stroke-width="2.2"/><circle cx="8" cy="0" r="2.6" fill="#ffd36a"' + st(1) + '/>') +
    '<path d="M-30,10 H30"' + st(5) + ' stroke-linecap="round"/></g>';
  return s;
}
function entreeBas(id, decor){
  /* le bas de la pièce : l'entrée (on arrive par là), en y = 452 */
  if(decor === 'foret') return [[-40, 520, 64], [70, 534, 52], [300, 534, 56], [410, 520, 66], [-170, 530, 62], [530, 528, 64]].map(function(c){ return couronne(id, c[0], c[1], c[2], false); }).join('');
  var s = rect(DX0, 470, DW, DY1 - 470, decor === 'moulin' ? 'url(#' + id + 'mu)' : 'url(#' + id + 'mu)') + '<path d="M' + DX0 + ',470 H' + DX1 + '"' + st(4) + '/>';
  s += rect(146, 462, 68, DY1 - 462, '#2b2a38', st(3)) + rect(150, 466, 60, DY1 - 466, decor === 'moulin' ? '#5a4436' : '#4c4b5e');
  return s;
}
function bords(id, decor, type){
  /* les côtés de la pièce (x < 16 et x > 344, et tout ce qui déborde en paysage) */
  var s = '', x;
  if(decor === 'foret'){
    for(var y = -40; y < 520; y += R(54, 76)){ s += couronne(id, R(-30, -6), y, R(40, 58), false) + couronne(id, R(366, 390), y + R(-20, 20), R(40, 58), false); }
    for(y = -60; y < 560; y += 90){ s += couronne(id, R(-150, -90), y, R(50, 64), false) + couronne(id, R(450, 510), y + 30, R(50, 64), false); }
    return s;
  }
  if(decor === 'ville'){
    if(type === 'rue'){
      for(var y2 = 12; y2 < 470; y2 += 92){ s += toit(id, -110, y2, 124, 88, true) + toit(id, 346, y2 + 30, 124, 88, true) + toit(id, -240, y2 + 20, 124, 88, false) + toit(id, 476, y2 + 6, 124, 88, false); }
      /* la lumière des fenêtres sur les pavés */
      [[18, 96], [18, 280], [342, 170], [342, 380]].forEach(function(f){ s += '<path class="cc-lueur" d="M' + f[0] + ',' + (f[1] - 12) + ' L' + (f[0] + (f[0] < 100 ? 34 : -34)) + ',' + (f[1] - 22) + ' L' + (f[0] + (f[0] < 100 ? 34 : -34)) + ',' + (f[1] + 22) + ' L' + f[0] + ',' + (f[1] + 12) + ' Z" fill="#ffd27a" opacity=".16"/>' + rect(f[0] - (f[0] < 100 ? 4 : 0), f[1] - 10, 4, 20, '#ffd36a', ' opacity=".9"'); });
      return s;
    }
    if(type === 'place'){
      s += toit(id, -130, 20, 146, 120, true) + toit(id, -130, 150, 146, 110, true) + toit(id, -130, 270, 146, 190, true) + toit(id, 344, 20, 150, 160, true) + toit(id, 344, 190, 150, 130, true) + toit(id, 344, 330, 150, 130, true);
      s += toit(id, -250, 40, 116, 200, false) + toit(id, -250, 260, 116, 200, false) + toit(id, 498, 30, 110, 210, false) + toit(id, 498, 250, 110, 210, false);
      return s;
    }
    /* la cour : des palissades de bois */
    s += rect(DX0, 12, 26 - DX0, 458, '#3b2f2a') + rect(334, 12, DX1 - 334, 458, '#3b2f2a');
    for(x = 12; x < 470; x += 14){ s += rect(8, x, 18, 12, '#7a5a3e', st(1.6)) + rect(334, x, 18, 12, '#7a5a3e', st(1.6)); }
    s += toit(id, -210, 30, 196, 200, false) + toit(id, -210, 250, 196, 210, false) + toit(id, 360, 20, 200, 220, false) + toit(id, 360, 252, 200, 210, false);
    return s;
  }
  /* le moulin */
  if(type === 'cour'){
    s += rect(DX0, 12, 20 - DX0, 458, 'url(#' + id + 'mu)') + '<path d="M20,12 V470"' + st(4) + '/>';
    /* la rivière et la grande roue, à droite */
    s += rect(336, 12, DX1 - 336, 458, 'url(#' + id + 'eau)') + '<path d="M336,12 V470" stroke="#1d3a55" stroke-width="5"/>';
    for(x = 360; x < DX1; x += 46) s += '<path class="cc-vague" d="M' + x + ',40 q8,-6 16,0 M' + (x + 20) + ',160 q8,-6 16,0 M' + x + ',300 q8,-6 16,0 M' + (x + 14) + ',420 q8,-6 16,0" stroke="#bfe6ff" stroke-width="2.5" fill="none" opacity=".5"/>';
    /* (vue du dessus, la roue est une rangée de pales qui défilent dans l'eau, le long du mur du moulin) */
    s += '<g transform="translate(398,230)"><rect x="-22" y="-80" width="44" height="160" rx="4" fill="#3b2a1e"' + st(3) + '/><g class="cc-roue-pales">';
    for(var i = -4; i <= 3; i++) s += '<rect x="-20" y="' + (i * 18 - 3) + '" width="40" height="7" rx="2" fill="#8a6545"' + st(2) + '/>';
    s += '</g><rect x="-26" y="-6" width="52" height="12" rx="4" fill="#5e4430"' + st(2.6) + '/><circle r="8" fill="#3b2a1e"' + st(2.4) + '/></g>';
    s += '<path d="M340,150 H376 M340,310 H376" stroke="#d8eeff" stroke-width="3" stroke-dasharray="4 6" opacity=".5"/>';
    return s;
  }
  s += rect(DX0, 12, 22 - DX0, 458, 'url(#' + id + 'mu)') + rect(338, 12, DX1 - 338, 458, 'url(#' + id + 'mu)') + '<path d="M22,12 V470 M338,12 V470"' + st(4) + '/>';
  /* des fenêtres : la lune entre */
  [[22, 140, 1], [338, 300, -1]].forEach(function(f){ s += rect(f[0] - (f[2] > 0 ? 8 : 0), f[1] - 18, 8, 36, '#9fb8e0', st(2)); });
  return s;
}
function sol(id, decor, type){
  var s = '';
  if(decor === 'ville'){
    s += rect(DX0, DY0, DW, DH, type === 'place' ? 'url(#' + id + 'dl)' : (type === 'cour' ? 'url(#' + id + 'te)' : 'url(#' + id + 'pv)'));
    if(type === 'place') s += '<circle cx="180" cy="240" r="92" fill="none" stroke="#7c7a94" stroke-width="10" opacity=".6"/><circle cx="180" cy="240" r="40" fill="none" stroke="#7c7a94" stroke-width="6" opacity=".5"/><path d="M180,150 V330 M90,240 H270" stroke="#7c7a94" stroke-width="5" opacity=".35"/>';
    if(type === 'rue') s += '<path d="M180,12 V470" stroke="#3a394a" stroke-width="10" opacity=".5"/><path d="M180,12 V470" stroke="#7c7a94" stroke-width="2" stroke-dasharray="14 10" opacity=".35"/>';
    if(type === 'cour') for(var i = 0; i < 9; i++) s += '<ellipse cx="' + f0(R(40, 320)) + '" cy="' + f0(R(40, 440)) + '" rx="' + f0(R(14, 30)) + '" ry="' + f0(R(8, 14)) + '" fill="#6b5c52" opacity=".5"/>';
    return s;
  }
  if(decor === 'foret'){
    s += rect(DX0, DY0, DW, DH, type === 'sousbois' ? 'url(#' + id + 'mo)' : 'url(#' + id + 'he)');
    if(type === 'clairiere'){ for(var j = 0; j < 26; j++) s += '<circle cx="' + f0(R(30, 330)) + '" cy="' + f0(R(30, 450)) + '" r="2.6" fill="' + U.choix(['#f6d23a', '#fff4f0', '#ef7fa8', '#b48cff']) + '"' + st(.8) + '/>'; s += [[70, 330], [290, 140]].map(function(c){ return [0, 1, 2, 3, 4, 5].map(function(k){ var a = k / 6 * 6.28; return '<g transform="translate(' + f0(c[0] + Math.cos(a) * 16) + ',' + f0(c[1] + Math.sin(a) * 12) + ')"><circle r="4.6" fill="#e5484d"' + st(1.4) + '/><circle cx="-1.4" cy="-1.4" r="1.2" fill="#fff"/></g>'; }).join(''); }).join(''); }
    if(type === 'ruisseau'){
      s += '<path d="M' + DX0 + ',222 C40,206 120,240 200,226 C280,212 330,236 ' + DX1 + ',222 L' + DX1 + ',262 C330,276 280,252 200,266 C120,280 40,246 ' + DX0 + ',262 Z" fill="url(#' + id + 'eau)"' + st(3) + '/>';
      s += '<path class="cc-vague" d="M20,236 q10,-6 20,0 t20,0 M150,250 q10,-6 20,0 t20,0 M260,238 q10,-6 20,0 t20,0" stroke="#bfe6ff" stroke-width="2.4" fill="none" opacity=".6"/>';
      s += [[90, 240], [116, 250], [240, 246], [268, 236]].map(function(c){ return '<ellipse cx="' + c[0] + '" cy="' + c[1] + '" rx="10" ry="7" fill="#8d8aa0"' + st(2.4) + '/>'; }).join('');
    }
    if(type === 'sousbois') for(var k2 = 0; k2 < 6; k2++) s += '<ellipse cx="' + f0(R(40, 320)) + '" cy="' + f0(R(40, 440)) + '" rx="' + f0(R(26, 44)) + '" ry="' + f0(R(14, 22)) + '" fill="#f6e7a0" opacity=".1"/>';
    return s;
  }
  s += rect(DX0, DY0, DW, DH, type === 'cour' ? 'url(#' + id + 'te)' : 'url(#' + id + 'pl)');
  if(type !== 'cour') for(var m = 0; m < 7; m++) s += '<ellipse cx="' + f0(R(40, 320)) + '" cy="' + f0(R(40, 440)) + '" rx="' + f0(R(18, 40)) + '" ry="' + f0(R(10, 20)) + '" fill="#f4efe4" opacity=".14"/>';
  return s;
}
function lumieres(id, decor, type){
  /* les lumières de la nuit (par-dessus le voile) : réverbères, lanternes accrochées, lune par les fenêtres */
  if(decor === 'ville'){
    if(type === 'rue') return lueur(id, 30, 190, 90) + lueur(id, 330, 330, 90) + [[30, 190], [330, 330]].map(function(c){ return '<circle cx="' + c[0] + '" cy="' + c[1] + '" r="6" fill="#fff4c8"' + st(2) + '/>'; }).join('');
    if(type === 'place') return lueur(id, 30, 40, 120) + lueur(id, 330, 450, 110) + '<circle cx="30" cy="40" r="7" fill="#fff4c8"' + st(2) + '/><circle cx="330" cy="450" r="7" fill="#fff4c8"' + st(2) + '/>';
    return lueur(id, 26, 300, 80) + '<rect x="22" y="294" width="9" height="11" rx="2" fill="#fff4c8"' + st(2) + '/>';
  }
  if(decor === 'moulin'){
    if(type === 'cour') return lueur(id, 30, 120, 90) + '<rect x="24" y="114" width="10" height="12" rx="2" fill="#fff4c8"' + st(2) + '/>';
    if(type === 'meules') return '<path d="M30,122 L130,180 L120,236 L30,158 Z" fill="url(#' + id + 'lune)"/><path d="M330,282 L230,340 L240,396 L330,318 Z" fill="url(#' + id + 'lune)"/>';
    return '<path d="M150,60 L210,60 L250,200 L110,200 Z" fill="url(#' + id + 'lune)" opacity=".8"/>';
  }
  return '';
}
function dessus(id, decor, type){
  /* ce qui passe au-dessus de tout : le linge de la cour, les poutres du moulin, les branches du sous-bois */
  var s = '';
  if(decor === 'ville' && type === 'cour'){
    [[14, 150, 346, 130], [14, 340, 346, 360]].forEach(function(l){
      s += '<path d="M' + l[0] + ',' + l[1] + ' Q180,' + ((l[1] + l[3]) / 2 + 16) + ' ' + l[2] + ',' + l[3] + '" stroke="#d8d2c4" stroke-width="2" fill="none" opacity=".8"/>';
      for(var x = 50; x < 330; x += R(34, 52)){ var u = (x - l[0]) / (l[2] - l[0]), y = l[1] + (l[3] - l[1]) * u + 16 * 4 * u * (1 - u); s += '<g class="cc-linge" style="animation-delay:-' + R(0, 2).toFixed(1) + 's" transform="translate(' + f0(x) + ',' + f0(y) + ')"><rect x="-9" y="0" width="18" height="' + f0(R(14, 22)) + '" rx="2" fill="' + U.choix(['#e5484d', '#f4ecdc', '#6cb6ff', '#f6d23a', '#8fd06a']) + '"' + st(2) + ' opacity=".92"/></g>'; }
    });
  }
  if(decor === 'moulin' && type !== 'cour') [120, 300].forEach(function(y){ s += '<rect x="' + DX0 + '" y="' + y + '" width="' + DW + '" height="16" fill="#2a1e16" opacity=".55"/><path d="M' + DX0 + ',' + y + ' H' + DX1 + '" stroke="#1a120c" stroke-width="2" opacity=".6"/>'; });
  if(decor === 'foret' && type === 'sousbois') [[10, 120, 40], [350, 330, 46], [8, 420, 36]].forEach(function(c){ s += '<circle cx="' + c[0] + '" cy="' + c[1] + '" r="' + c[2] + '" fill="#163a1e" opacity=".55"/>'; });
  return s;
}

/* ----- Les cachettes (vues du dessus, ~ 46 de large) ----- */
var COUV = {
  tonneau:function(){ return '<ellipse cx="4" cy="5" rx="22" ry="19" fill="#000" opacity=".3"/><circle r="20" fill="#9a6235"' + st(4) + '/><circle r="16" fill="none" stroke="#3b3346" stroke-width="3"/><circle r="9" fill="#7a4a28"' + st(2) + '/><path d="M-12,-9 C-6,-15 6,-15 12,-9" stroke="#d29a62" stroke-width="2.4" fill="none" stroke-linecap="round"/>'; },
  caisses:function(){ return '<rect x="-18" y="-14" width="44" height="38" rx="3" fill="#000" opacity=".3"/><rect x="-22" y="-20" width="26" height="26" rx="3" fill="#c08a4a"' + st(4) + '/><path d="M-22,-20 L4,6 M4,-20 L-22,6" stroke="#7d5428" stroke-width="2.6"/><rect x="-2" y="-6" width="24" height="24" rx="3" fill="#b07a3c"' + st(4) + '/><path d="M2,-2 H18" stroke="#e0b070" stroke-width="2.4" stroke-linecap="round"/>'; },
  paille:function(){ return '<rect x="-20" y="-12" width="46" height="34" rx="8" fill="#000" opacity=".3"/><rect x="-24" y="-17" width="48" height="34" rx="8" fill="#e6c25a"' + st(4) + '/><path d="M-18,-8 H18 M-18,0 H18 M-18,8 H18" stroke="#b08a2a" stroke-width="2.4"/><path d="M-8,-17 V17 M8,-17 V17" stroke="#8a5a33" stroke-width="2.6"/>'; },
  puits:function(){ return '<ellipse cx="4" cy="5" rx="23" ry="21" fill="#000" opacity=".3"/><circle r="21" fill="#7d7a92"' + st(4) + '/><circle r="13" fill="#14112a"' + st(3) + '/><path d="M-25,0 H25"' + st(8) + ' stroke-linecap="round"/><path d="M-25,0 H25" stroke="#8a5a33" stroke-width="4.5" stroke-linecap="round"/>'; },
  etal:function(){ return '<rect x="-22" y="-14" width="50" height="36" rx="3" fill="#000" opacity=".3"/><rect x="-26" y="-19" width="52" height="34" rx="3" fill="#f4ecdc"' + st(4) + '/>' + [-18, -6, 6, 18].map(function(x){ return '<rect x="' + (x - 3) + '" y="-17" width="6" height="30" fill="#d9474a"/>'; }).join('') + '<rect x="-24" y="-17" width="48" height="30" rx="2" fill="#000" opacity=".12"/><path d="M-26,15 q4.3,6 8.7,0 q4.3,6 8.7,0 q4.3,6 8.7,0 q4.3,6 8.7,0 q4.3,6 8.7,0 q4.3,6 8.7,0" fill="#d9474a"' + st(2) + '/>'; },
  buisson:function(){ return '<ellipse cx="4" cy="6" rx="26" ry="20" fill="#000" opacity=".28"/><path d="M-24,6 C-31,-8 -18,-24 -5,-20 C1,-31 22,-26 22,-11 C33,-5 28,16 13,17 C5,25 -14,23 -18,15 C-29,15 -31,9 -24,6 Z" fill="#2f7a4c"' + st(4) + '/><path d="M-14,-6 C-10,-14 -2,-15 4,-12 M6,4 C10,-2 16,-2 18,2" stroke="#5fae6e" stroke-width="3" fill="none" stroke-linecap="round"/><circle cx="-9" cy="-6" r="3.2" fill="#e5484d"' + st(1.2) + '/><circle cx="9" cy="5" r="3.2" fill="#e5484d"' + st(1.2) + '/><circle cx="-3" cy="9" r="2.6" fill="#e5484d"' + st(1.2) + '/>'; },
  rocher:function(){ return '<ellipse cx="5" cy="6" rx="25" ry="19" fill="#000" opacity=".3"/><path d="M-22,8 L-18,-10 L-6,-20 L10,-18 L22,-6 L22,10 L8,18 L-12,18 Z" fill="#8d8aa0"' + st(4) + ' stroke-linejoin="round"/><path d="M-12,-10 L0,-14 L8,-10" stroke="#c0bdd2" stroke-width="3" fill="none" stroke-linecap="round"/><path d="M-6,4 C2,0 10,2 14,8" stroke="#6d6a82" stroke-width="2.4" fill="none"/><path d="M-20,8 C-14,2 -8,6 -6,12 L-14,16 Z" fill="#5f9a4a" opacity=".85"/>'; },
  souche:function(){ return '<ellipse cx="4" cy="6" rx="22" ry="19" fill="#000" opacity=".3"/><path d="M-22,4 C-24,-12 -10,-21 2,-20 C16,-19 24,-8 21,6 C26,10 22,16 16,14 C8,20 -10,20 -16,14 C-24,16 -27,8 -22,4 Z" fill="#7a5232"' + st(4) + '/><ellipse cx="0" cy="-2" rx="14" ry="12" fill="#c99a5e"' + st(2.6) + '/><ellipse cx="0" cy="-2" rx="9" ry="7.5" fill="none" stroke="#9a6a3e" stroke-width="1.8"/><ellipse cx="0" cy="-2" rx="4" ry="3" fill="none" stroke="#9a6a3e" stroke-width="1.6"/>'; },
  fougere:function(){ var s = '<ellipse cx="4" cy="6" rx="24" ry="19" fill="#000" opacity=".26"/>'; for(var i = 0; i < 7; i++){ var a = i / 7 * 360; s += '<g transform="rotate(' + a + ')"><path d="M0,0 C6,-8 6,-18 0,-26 C-6,-18 -6,-8 0,0 Z" fill="' + (i % 2 ? '#3f8f4a' : '#4fa058') + '"' + st(2.6) + '/><path d="M0,-3 V-22" stroke="#2a6a36" stroke-width="1.6"/></g>'; } return s + '<circle r="4" fill="#2a6a36"/>'; },
  sacs:function(){ return '<ellipse cx="4" cy="6" rx="26" ry="19" fill="#000" opacity=".3"/>' + [[-11, 4], [11, 3], [0, -9]].map(function(q){ return '<g transform="translate(' + q[0] + ',' + q[1] + ')"><path d="M-12,4 C-14,-8 -8,-12 0,-12 C8,-12 14,-8 12,4 C10,12 -10,12 -12,4 Z" fill="#e8dcc0"' + st(3.4) + '/><path d="M-4,-12 C-2,-15 2,-15 4,-12" stroke="#b8a888" stroke-width="2.4" fill="none"/><path d="M-6,0 H6" stroke="#c9b48a" stroke-width="2"/></g>'; }).join(''); },
  meule:function(){ return '<ellipse cx="5" cy="6" rx="26" ry="24" fill="#000" opacity=".3"/><circle r="24" fill="#9d98ac"' + st(4) + '/>' + [0, 1, 2, 3, 4, 5].map(function(i){ return '<path d="M0,0 L' + f1(Math.cos(i * 1.047) * 22) + ',' + f1(Math.sin(i * 1.047) * 22) + '" stroke="#7a768c" stroke-width="2.4"/>'; }).join('') + '<circle r="7" fill="#3b3346"' + st(2.4) + '/><path d="M-16,-10 C-10,-18 2,-20 10,-16" stroke="#c9c4d8" stroke-width="2.6" fill="none" stroke-linecap="round"/>'; },
  grain:function(){ return '<ellipse cx="4" cy="6" rx="26" ry="18" fill="#000" opacity=".26"/><path d="M-26,8 C-24,-6 -12,-18 0,-18 C12,-18 24,-6 26,8 C14,16 -14,16 -26,8 Z" fill="#e0b84a"' + st(4) + '/><path d="M-12,-6 C-6,-12 4,-12 10,-8" stroke="#f6dc84" stroke-width="3" fill="none" stroke-linecap="round"/><path d="M-16,6 l3,-2 M-4,8 l3,-3 M10,5 l3,-2 M2,-2 l3,-2" stroke="#b08a2a" stroke-width="2" stroke-linecap="round"/>'; },
  brouette:function(){ return '<ellipse cx="4" cy="6" rx="24" ry="16" fill="#000" opacity=".28"/><path d="M-16,-14 L16,-14 L20,10 L-20,10 Z" fill="#7a8a9a"' + st(3.6) + ' stroke-linejoin="round"/><path d="M-12,-10 H12" stroke="#a8b6c4" stroke-width="2.4"/><rect x="-5" y="10" width="10" height="12" rx="3" fill="#3b3346"' + st(2.4) + '/><path d="M-14,10 L-18,26 M14,10 L18,26"' + st(4) + ' stroke-linecap="round"/><ellipse cx="0" cy="-2" rx="12" ry="7" fill="#e0b84a"' + st(2) + '/>'; }
};
var COUV_DECOR = {ville:['tonneau', 'caisses', 'paille', 'puits', 'etal'], foret:['buisson', 'rocher', 'souche', 'fougere', 'buisson'], moulin:['sacs', 'caisses', 'tonneau', 'grain', 'brouette']};
var COUV_PIECE = {meules:['sacs', 'meule', 'caisses', 'tonneau', 'sacs'], grenier:['grain', 'sacs', 'caisses', 'grain', 'tonneau']};
/* la charrette qui roule (avec son âne) et la nappe de brume qui dérive */
var CHARRETTE = '<rect x="-26" y="-14" width="58" height="36" rx="4" fill="#000" opacity=".3"/><rect x="-38" y="-24" width="11" height="46" rx="4" fill="#3b3346"' + st(3) + '/><rect x="27" y="-24" width="11" height="46" rx="4" fill="#3b3346"' + st(3) + '/>' +
  '<rect x="-30" y="-19" width="60" height="36" rx="4" fill="#a8743f"' + st(4) + '/><path d="M-30,-1 H30 M-10,-19 V17 M10,-19 V17" stroke="#7d5428" stroke-width="2.8"/><ellipse cx="-16" cy="-8" rx="10" ry="7" fill="#e6c25a"' + st(2.2) + '/><ellipse cx="13" cy="7" rx="11" ry="7" fill="#e8dcc0"' + st(2.2) + '/>' +
  '<path d="M-5,-19 L-5,-34 M5,-19 L5,-34" stroke="#7d5428" stroke-width="3.4"/>' +
  '<g class="cc-ane" transform="translate(0,-46)"><ellipse cx="2" cy="4" rx="11" ry="15" fill="#000" opacity=".25"/><ellipse rx="10" ry="15" fill="#8d8478"' + st(3) + '/><ellipse cy="-15" rx="6.5" ry="8" fill="#8d8478"' + st(2.6) + '/><path d="M-4,-21 L-7,-31 L-1,-23 M4,-21 L7,-31 L1,-23" fill="#8d8478"' + st(2) + ' stroke-linejoin="round"/><ellipse cy="-21" rx="4" ry="2.6" fill="#5e564c"/><path d="M0,8 V20" stroke="#5e564c" stroke-width="3" stroke-linecap="round"/></g>';
var BRUME = function(id){ return '<g class="cc-brume-g"><ellipse rx="56" ry="38" fill="url(#' + id + 'br)"/><ellipse cx="-30" cy="-8" rx="34" ry="24" fill="url(#' + id + 'br)"/><ellipse cx="28" cy="10" rx="36" ry="24" fill="url(#' + id + 'br)"/></g>'; };

/* ----- Les pièges ----- */
var BRUITS = {
  flaque:{txt:'Splash !', son:'plouf', art:function(){ return '<ellipse rx="28" ry="14" fill="#3a5f96"' + st(2.5) + '/><ellipse cx="-8" cy="-4" rx="10" ry="3" fill="#a8d4ff" opacity=".6"/><ellipse cx="10" cy="4" rx="5" ry="2" fill="#a8d4ff" opacity=".4"/>'; }},
  feuilles:{txt:'Crac !', son:'pas', art:function(){ return '<ellipse rx="26" ry="15" fill="#6b3f1e" opacity=".55"/>' + [[-12, -4, '#d79a3c'], [2, -8, '#c07a34'], [12, 2, '#e8b04a'], [-4, 6, '#a5672e'], [16, -6, '#d79a3c'], [-18, 4, '#c07a34']].map(function(f){ return '<path d="M' + f[0] + ',' + f[1] + ' c4,-6 11,-6 13,0 c-4,4 -9,4 -13,0 Z" fill="' + f[2] + '"' + st(1) + '/>'; }).join(''); }},
  seau:{txt:'Bing !', son:'tic', art:function(){ return '<ellipse cx="3" cy="4" rx="12" ry="10" fill="#000" opacity=".3"/><circle r="11" fill="#9aa4b4"' + st(3) + '/><circle r="7.5" fill="#5a6474"' + st(2) + '/><path d="M-11,0 C-11,-14 11,-14 11,0" stroke="#3b3346" stroke-width="2" fill="none"/>'; }},
  brindilles:{txt:'Crac !', son:'pas', art:function(){ return '<ellipse rx="24" ry="12" fill="#3f2a18" opacity=".35"/><path d="M-20,-4 L14,2 M-14,6 L18,-6 M-6,-8 L4,10 M8,-2 l6,-6 M-10,2 l-4,6"' + st(4.6) + ' stroke-linecap="round"/><path d="M-20,-4 L14,2 M-14,6 L18,-6 M-6,-8 L4,10 M8,-2 l6,-6 M-10,2 l-4,6" stroke="#b08a5a" stroke-width="2.4" stroke-linecap="round"/>'; }},
  boue:{txt:'Splotch !', son:'plouf', art:function(){ return '<path d="M-26,0 C-24,-12 -6,-14 4,-10 C18,-14 28,-4 24,6 C20,14 0,14 -10,10 C-22,12 -28,8 -26,0 Z" fill="#5a3e26"' + st(2.4) + '/><ellipse cx="-6" cy="-3" rx="8" ry="3" fill="#8a6a4a" opacity=".6"/>'; }},
  planche:{txt:'Criiic !', son:'porte', art:function(){ return '<rect x="-30" y="-6" width="60" height="11" rx="1.5" fill="#a07a52"' + st(2.4) + '/><path d="M-22,-1 l6,2 l5,-3 l6,3 M8,0 l7,-2 l6,2" stroke="#5e432e" stroke-width="1.8" fill="none"/><circle cx="-26" cy="0" r="1.4" fill="#3b2a1e"/><circle cx="26" cy="0" r="1.4" fill="#3b2a1e"/>'; }},
  farine:{txt:'Atchoum !', son:'ko', art:function(){ return '<path d="M-24,4 C-24,-8 -8,-14 4,-10 C18,-12 26,-2 22,8 C14,14 -14,14 -24,4 Z" fill="#f4efe4" opacity=".95"' + st(1.8) + '/><circle cx="-8" cy="-2" r="3" fill="#fff"/><circle cx="8" cy="4" r="2.4" fill="#e8dcc0"/>'; }}
};
var BRUITS_DECOR = {ville:['flaque', 'feuilles', 'seau'], foret:['brindilles', 'feuilles', 'boue'], moulin:['planche', 'farine', 'planche']};
var ANIMAUX = {
  chat:{txt:'Miaou !', art:'<ellipse cx="3" cy="4" rx="14" ry="11" fill="#000" opacity=".3"/><path d="M-12,6 C-14,-6 -4,-12 4,-11 C12,-10 15,-2 13,6 C10,12 -8,13 -12,6 Z" fill="#e8913a"' + st(2.6) + '/><path d="M-6,-6 C-2,-8 4,-8 7,-5 M-8,2 C-4,0 4,0 8,2" stroke="#b8621e" stroke-width="2" fill="none"/><path d="M12,4 C18,4 20,10 14,12 C8,13 2,11 -2,9" stroke="#e8913a" stroke-width="5" fill="none" stroke-linecap="round"/><path d="M12,4 C18,4 20,10 14,12 C8,13 2,11 -2,9" fill="none"' + st(1.4) + '/><path d="M-7,-9 L-9,-15 L-3,-11 M2,-11 L5,-16 L7,-10" fill="#e8913a"' + st(1.8) + ' stroke-linejoin="round"/><path d="M-5,-4 q2,1.5 4,0 M2,-4 q2,1.5 4,0" stroke="' + K + '" stroke-width="1.4" fill="none"/>'},
  lapin:{txt:'Frrrt !', art:'<ellipse cx="3" cy="4" rx="13" ry="10" fill="#000" opacity=".3"/><ellipse rx="11" ry="9" fill="#a8988a"' + st(2.6) + '/><circle cx="0" cy="-9" r="6" fill="#a8988a"' + st(2.4) + '/><path d="M-3,-13 C-6,-24 -2,-26 -1,-15 M3,-13 C6,-24 2,-26 1,-15" fill="#a8988a"' + st(2) + '/><circle cx="0" cy="9" r="3.4" fill="#fff"' + st(1.4) + '/><circle cx="-2.4" cy="-10" r="1" fill="' + K + '"/><circle cx="2.4" cy="-10" r="1" fill="' + K + '"/>'},
  oie:{txt:'Kaï ! Kaï !', art:'<ellipse cx="3" cy="5" rx="14" ry="11" fill="#000" opacity=".3"/><ellipse rx="12" ry="15" fill="#f4f1ea"' + st(2.8) + '/><path d="M-6,-2 C-8,6 -4,12 0,12 C4,12 8,6 6,-2" stroke="#d8d4ca" stroke-width="2" fill="none"/><path d="M0,-12 C0,-20 2,-24 0,-28"' + st(7) + ' stroke-linecap="round" fill="none"/><path d="M0,-12 C0,-20 2,-24 0,-28" stroke="#f4f1ea" stroke-width="4" stroke-linecap="round" fill="none"/><circle cx="0" cy="-29" r="4.4" fill="#f4f1ea"' + st(2) + '/><path d="M-2,-33 L0,-38 L2,-33 Z" fill="#f6a23a"' + st(1.4) + '/>'}
};
function animalDe(decor, type){ return decor === 'foret' ? 'lapin' : (decor === 'moulin' && type === 'cour' ? 'oie' : 'chat'); }
var FLAIR = 30;   /* le chien ne voit presque rien : il sent le Pisteur qui court tout près de son museau */
/* les villageois : ce qu'ils viennent chercher dans chaque décor */
var METIERS = {foret:{metier:'cueille', types:['buisson']}, ville:{metier:'porte', types:['caisses', 'tonneau', 'paille']}, moulin:{metier:'porte', types:['sacs', 'caisses', 'tonneau', 'brouette']}};
var PIE = {L:96, h:0.42};
/* la pie vue du dessus (elle regarde vers le haut) : noire et blanche, reflets bleus, longue queue */
function pieDessus(){
  return '<g class="cd-pie"><ellipse cx="2" cy="4" rx="8" ry="13" fill="#000" opacity=".28"/>' +
    '<path d="M0,6 L-3.4,25 L0,28 L3.4,25 Z" fill="#1d2440"' + st(1.6) + ' stroke-linejoin="round"/><path d="M0,10 V24" stroke="#3f6ad8" stroke-width="1.4" opacity=".8"/>' +
    '<ellipse cy="1" rx="7.4" ry="10" fill="#1d2440"' + st(2) + '/>' +
    '<path d="M-7,1 C-8.4,-6 -5.4,-9 -3.2,-8 L-3,6 Z M7,1 C8.4,-6 5.4,-9 3.2,-8 L3,6 Z" fill="#f4f1ea"' + st(1.2) + '/>' +
    '<path d="M-6.4,4 C-6,8 -3,10 0,10 M6.4,4 C6,8 3,10 0,10" stroke="#3f6ad8" stroke-width="1.6" fill="none" opacity=".85"/>' +
    '<circle cy="-10" r="5.2" fill="#1d2440"' + st(1.8) + '/><path d="M-1.7,-14.6 L0,-19.6 L1.7,-14.6 Z" fill="#4a4458"' + st(1.2) + ' stroke-linejoin="round"/><circle cx="-2.1" cy="-11.4" r="1.1" fill="#fff"/><circle cx="2.1" cy="-11.4" r="1.1" fill="#fff"/></g>';
}

/* ==========================================================
   LE JEU
   ========================================================== */
MJ.enregistrer('cachette', {
  nom:'Se cacher', role:'pisteur', ic:'🫥',
  consigne:'Touche une cachette entourée de bleu pour y courir quand aucune lumière ne te regarde. Attention aux pièges qui font du bruit ! Traverse chaque pièce jusqu\'à sa porte.',
  minuteur:true,
  reglages: function(n, mods){
    var p = {niveau:n};
    /* 2 pièces ; 3 aux niveaux 9 et plus (Romain, 6 nov., 9 h 02 : « au niveau 10 : plus de monde, courir un petit peu
       moins vite, plus de pièces ») */
    p.pieces = n >= 9 ? 3 : 2;
    p.rangees = n >= 3 ? 3 : 2;
    p.gardes = fixe(entier(n, {1:1, 3:2, 6:3, 9:4}) + (mods.gardes || 0), 1, 5);
    p.vitesse = courbe(n, {1:30, 3:44, 6:60, 9:78, 12:90}) * (mods.lent || 1);
    /* (lumières un peu moins longues et gardes un peu moins imprévisibles aux niveaux 9 et plus : il y a maintenant plus de
       monde, un chien qui oblige à bouger et des villageois ; robot, 6 nov.) */
    p.faisceau = courbe(n, {1:92, 3:110, 6:132, 9:140, 12:150}) / (mods.zone || 1);
    p.pause = courbe(n, {1:1.6, 3:1.2, 6:0.85, 9:0.6});
    p.imprevu = courbe(n, {1:0, 3:0.05, 6:0.16, 9:0.22, 12:0.3});
    p.guet = n >= 5;
    p.boucle = n >= 4;
    p.charrette = n >= 3;
    p.bruits = entier(n, {1:1, 3:1, 6:2, 9:2});   /* (par pièce : 2 pièces, donc à peine plus qu'avant au total) */
    p.animaux = n >= 2;
    p.fil = n >= 5;
    p.portee = courbe(n, {1:200, 3:182, 6:170, 9:160});
    /* (les pièces sont plus grandes : on court un peu plus vite qu'avant ; un peu moins vite aux niveaux 9 et plus) */
    p.course = courbe(n, {1:205, 3:190, 6:178, 9:165}) * courbe(n, {1:1.15, 8:1.15, 10:1.04});
    /* une erreur permise même aux grands niveaux : l'aboiement du chien en coûte une (avant : aucune à partir du niveau 9) */
    /* (6 nov., 10 h 50 : deux erreurs permises aux niveaux 9 et plus : il y a maintenant trois façons de se faire prendre,
       les gardes, le chien et les villageois) */
    p.erreurs = A.erreursPermises(n, mods, {1:3, 3:2, 6:1, 8:1, 9:2, 12:2});
    var rOrig = entier(n, {1:3, 3:4, 7:4, 8:5});
    /* les gens par pièce (sans le chien) : 1, puis 2, puis 3 aux niveaux 9 et plus */
    /* (Romain, 6 nov., 10 h 50 : « un peu plus de surveillants au niveau 10 » : 3 par pièce, la première en a un de moins) */
    p.gardesPiece = fixe(entier(n, {1:1, 3:2, 12:2}) + (mods.gardes || 0), 1, 4);
    p.gardeEnPlus = n >= 10;   /* (un garde de plus dans la dernière pièce : avec 3 gardes dans chaque pièce, le robot ne gagnait plus jamais) */
    /* plusieurs styles d'ennemis (Romain, 6 nov., 9 h 02) : le veilleur à la grosse lanterne (niveau 3 et plus : elle éclaire
       devant et derrière lui), le porteur de torche (niveau 5 et plus : un grand cercle de lumière autour de lui), et le
       chien (niveau 4 : dans la dernière pièce ; niveau 6 et plus : dans chaque pièce). Le chien ne voit presque rien, mais
       il a du flair : si l'on reste trop longtemps dans la même cachette, il sent l'odeur, vient renifler, et aboie si l'on
       y est encore (une erreur, et la cachette est dévoilée un moment). On ne peut plus rester caché trop longtemps. */
    p.lanterne = n >= 3; p.torche = n >= 5;
    p.rTorche = courbe(n, {5:56, 9:64, 12:70});
    p.chiens = n >= 6 ? 'toutes' : (n >= 4 ? 'une' : '');
    /* le chien (Romain, 6 nov., 10 h 50) : au bout de 3 s dans la même cachette (2 s au niveau 10), il renifle (on le voit
       bien), fait « Waf ! Waf ! » et court jusqu'à la cachette, puis la fouille ; il ne sent que s'il est assez près, sauf au
       niveau 10 (de n'importe où) */
    p.odeur = n >= 10 ? 2 : 3;
    p.flairPortee = n >= 10 ? 230 : 190;   /* (Romain, 12 h 49 : « loin du chien, il ne renifle pas, même au niveau 10 : c'est bien ») */
    p.renifle = 3;   /* (le temps de la fouille : le même partout, pour qu'on apprenne le rythme ; 2,4 s au niveau 10 : trop dur) */
    /* les villageois sans vision : cueillette (forêt) ou déménagement de caisses (ville, moulin) ; ils fouillent aussi
       longtemps que le chien. La pie bavarde (nouveau piège) : elle crie si l'on court dans son regard. */
    p.villageois = n >= 4 ? 1 : 0;   /* (2 par pièce au niveau 10, avec 3 gardes et le chien : le robot ne gagnait plus jamais) */
    p.fouille = p.renifle;
    p.pie = '';   /* (la pie bavarde est retirée : Romain, 6 nov., 12 h 49 : « enlève-la » ; son code reste, éteint) */
    /* le rôdeur (niveau 10) : il se promène partout dans la pièce, au hasard, avec une zone ronde autour de lui */
    p.rodeur = n >= 10;
    p.rRodeur = 56;
    p.vMobile = courbe(n, {3:24, 9:38});
    /* le sablier : le temps par rangée de l'ancienne pièce unique, pour toutes les rangées de toutes les pièces, + 8 s par pièce */
    p.duree = Math.round((courbe(n, {1:95, 3:80, 6:68, 9:58}) / rOrig * p.pieces * p.rangees + 8 * p.pieces) * courbe(n, {3:1, 4:1.1, 9:1.25}) + (mods.temps || 0));   /* (+10 à 25 % : le chien et les villageois font bouger) */
    p.invisible = mods.invisible || 0;
    p.aide = !!(mods.aide || mods.revele);
    p.lignes = [
      {nom:'Pièces', val:String(p.pieces)},
      {nom:'Gardes par pièce', val:String(p.gardesPiece) + (p.guet && p.gardesPiece >= 2 ? ' (dont un guetteur)' : '') + (p.chiens === 'toutes' ? ' + un chien' : '')},
      {nom:'Lumières', val:'devant' + (p.lanterne ? ', devant et derrière' : '') + (p.torche ? ', tout autour' : '')},
      {nom:'Chien', val:p.chiens === 'toutes' ? 'dans chaque pièce' : (p.chiens ? 'dans la dernière pièce' : 'aucun')},
      {nom:'Villageois', val:p.villageois ? p.villageois + ' par pièce' : 'aucun'},
      {nom:'Rôdeur', val:p.rodeur ? 'dans chaque pièce' : 'aucun'},
      {nom:'Portée des lumières', val:Math.round(p.faisceau / 10) + ' pas'},
      {nom:'Ils changent d\'avis', val:p.imprevu > 0.2 ? 'souvent' : (p.imprevu > 0 ? 'parfois' : 'jamais')},
      {nom:'Pièges', val:p.bruits + ' qui font du bruit' + (p.animaux ? ', un animal qui dort' : '') + (p.fil ? ', un fil à clochettes' : '')},
      {nom:'Sablier', val:p.duree + ' s'},
      {nom:'Erreurs permises', val:String(p.erreurs)}
    ];
    return p;
  },
  jouer: function(el, p, fin){
    var P = A.Partie(fin);
    var decor = PIECES[p.decor] ? p.decor : 'ville', D = PIECES[decor], NUIT = D.nuit, n0 = p.niveau || 1;
    var vies = p.erreurs + 1, maxVies = vies;
    var hud = A.creerHud(el);
    hud.vies(vies, maxVies);
    hud.prog(0, p.pieces, '🚪');
    var terrain = U.html('<div class="mja-terrain mja-cachette cc-' + decor + '"></div>');
    el.appendChild(terrain);
    var id = A.nid('cc');
    terrain.innerHTML = '<svg viewBox="0 0 360 480" preserveAspectRatio="xMidYMid meet">' + defsC(id) + '<g class="cc-salles"></g></svg>' +
      (p.invisible ? '<div class="mja-actions"><button class="btn magie mja-invis" type="button">👻 ' + p.invisible + ' s</button></div>' : '');
    var svg = terrain.querySelector('svg'), gSalles = svg.querySelector('.cc-salles');
    A.cadrer(P, svg);
    var btnI = terrain.querySelector('.mja-invis');

    /* le Pisteur (un seul nœud, qu'on déplace d'une pièce à l'autre et de « caché » à « court ») */
    var joueur = svgNoeud('g', {'class':'cc-joueur'});
    joueur.innerHTML = '<g class="cc-j-rot">' + pisteurDessus() + '</g>';
    var jRot = joueur.querySelector('.cc-j-rot'), jAnim = Bonhomme(joueur);
    var jAng = -Math.PI / 2, jPh = 0, jAmp = 0, jCache = 1;

    /* ----- les pièces ----- */
    var types = D.types.slice();
    if(p.pieces === 2) types = [types[0], types[2]];
    var iMobile = p.charrette ? (decor === 'foret' ? U.randInt(0, p.pieces - 1) : 0) : -1;
    var salles = types.map(function(t, k){ return construire(t, k); });
    /* le rôdeur : un point au hasard n'importe où dans la pièce (pas dans l'eau, pas sur une cachette, assez loin du précédent) */
    function pointRodeur(prev, Sx){
      var q = null;
      for(var e = 0; e < 60; e++){
        q = {x:R(44, 316), y:R(74, 420)};
        if(Sx.type === 'ruisseau' && q.y > 198 && q.y < 288) continue;
        if(prev && dist(prev, q) < 120) continue;
        if(Sx.couv && Sx.couv.some(function(c){ return !c.porte && !c.entree && dist(c, q) < 30; })) continue;
        return q;
      }
      return q;
    }
    /* son chemin : on ajoute des points au bout, sans jamais changer les premiers (au ruisseau, il passe par le gué) */
    function etendreRodeur(gd, Sx){
      while(gd.chemin.length < gd.iw + 3){
        var der = gd.chemin.length ? gd.chemin[gd.chemin.length - 1] : {x:gd.x, y:gd.y}, q = pointRodeur(der, Sx);
        if(Sx.type === 'ruisseau' && (der.y < 243) !== (q.y < 243)){
          var gx = Math.abs(der.x - 103) + Math.abs(q.x - 103) < Math.abs(der.x - 254) + Math.abs(q.x - 254) ? 103 : 254;
          gd.chemin.push({x:gx, y:der.y < 243 ? 198 : 288, pause:0}, {x:gx, y:der.y < 243 ? 288 : 198, pause:0});
        }
        gd.chemin.push({x:q.x, y:q.y, pause:R(0.5, 1.3)});
      }
    }

    function construire(type, k){
      var S = {type:type, k:k, nom:D.noms[type]};
      var Rg = p.rangees, Y0 = 452, Y1 = 40;
      function ry(i){ return Y0 - i * (Y0 - Y1) / (Rg + 1); }
      S.ry = ry; S.R = Rg;
      S.g = svgNoeud('g', {'class':'cc-salle', display:k ? 'none' : 'inline'}, gSalles);
      /* l'ordre des couches : la nuit, le voile assombrit le décor et le Pisteur caché ; le Pisteur qui court et les gardes
         restent bien visibles par-dessus, dans la lumière des lanternes */
      var couches = ['sol', 'murs', 'pieges', 'cones-sol', 'cache', 'couverts', 'dessus', 'voile', 'lumieres', 'cones-air', 'court', 'gardes', 'lant', 'anneaux', 'bulles'];
      S.c = {};
      couches.forEach(function(c){ S.c[c] = svgNoeud('g', {'class':'cc-' + c}, S.g); });
      S.c.sol.innerHTML = sol(id, decor, type);
      S.c.murs.innerHTML = bords(id, decor, type) + porteHaut(id, decor, type) + entreeBas(id, decor);
      S.c.dessus.innerHTML = dessus(id, decor, type);
      if(NUIT){ S.c.voile.innerHTML = rect(DX0, DY0, DW, DH, '#0a1030', ' opacity="' + (decor === 'moulin' && type !== 'cour' ? '.5' : '.42') + '"'); S.c.lumieres.innerHTML = lumieres(id, decor, type); }
      S.roue = S.c.murs.querySelector('.cc-roue-pales');
      /* « tu es ici » : un petit cercle sous le Pisteur caché (il est dans l'ombre) */
      S.ici = svgNoeud('circle', {'class':'cc-ici', r:15}, S.c.lumieres);
      /* cachettes en rangées, un chemin jusqu'à la porte (sans passer par la cachette qui bouge, ni franchir le fil) */
      var liste = COUV_PIECE[type] || COUV_DECOR[decor];
      var mobile = k === iMobile ? (decor === 'foret' ? 'brume' : (type === 'cour' || type === 'rue' || type === 'place' ? 'charrette' : null)) : null;
      var rangM = mobile ? U.randInt(1, Rg) : -1, couv = [];
      function coupe(a, b, f){ /* le segment ab coupe-t-il le fil f ? */
        if(!f) return false;
        function c(p1, p2, p3){ return (p3.y - p1.y) * (p2.x - p1.x) > (p2.y - p1.y) * (p3.x - p1.x); }
        return c(a, f.a, f.b) !== c(b, f.a, f.b) && c(a, b, f.a) !== c(a, b, f.b);
      }
      function relie(l, fil){
        var vu = [l[0]], file = [l[0]], porteP = {x:180, y:Y1};
        while(file.length){
          var c = file.shift();
          if(dist(c, porteP) <= p.portee * 0.95 && !coupe(c, porteP, fil)) return true;
          l.forEach(function(d){ if(vu.indexOf(d) < 0 && !d.mobile && dist(c, d) <= p.portee * 0.95 && d.k >= c.k - 1 && !coupe(c, d, fil)){ vu.push(d); file.push(d); } });
        }
        return false;
      }
      for(var essai = 0; essai < 80; essai++){
        couv = [{x:180, y:Y0, k:0, entree:true}];
        for(var i = 1; i <= Rg; i++){
          var segs = U.melanger([[50, 122], [142, 218], [238, 310]]).slice(0, Rg >= 3 && Math.random() < 0.5 ? 3 : 2);
          if(i === rangM) segs = segs.slice(0, 1);
          segs.forEach(function(sg){ couv.push({x:R(sg[0], sg[1]), y:ry(i) + R(-10, 10), k:i, type:U.choix(liste)}); });
          if(i === rangM) couv.push({x:180, y:ry(i), k:i, mobile:mobile, dir:Math.random() < .5 ? 1 : -1, v:(p.vMobile || 30) * (mobile === 'brume' ? 0.8 : 1)});
        }
        if(relie(couv)) break;
      }
      var porte = {x:180, y:Y1, k:Rg + 1, porte:true};
      couv.push(porte);
      couv.forEach(function(c){
        if(c.entree){ c.an = svgNoeud('circle', {'class':'mja-anneau', r:30, cx:c.x, cy:c.y}, S.c.anneaux); return; }
        if(c.porte){ c.halo = svgNoeud('circle', {'class':'cc-porte-halo', r:30, cx:c.x, cy:c.y - 10}, S.c.lumieres); c.an = svgNoeud('circle', {'class':'mja-anneau cc-an-porte', r:38, cx:c.x, cy:c.y - 4}, S.c.anneaux); return; }
        c.g = svgNoeud('g', {'class':'mja-couvert' + (c.mobile ? ' cc-mobile' : '')}, c.mobile === 'brume' ? S.c.dessus : S.c.couverts);
        c.g.innerHTML = c.mobile === 'brume' ? BRUME(id) : (c.mobile ? CHARRETTE : '<g transform="rotate(' + f0(R(-14, 14)) + ')">' + COUV[c.type]() + '</g>');
        c.an = svgNoeud('circle', {'class':'mja-anneau', r:c.mobile ? 44 : 33}, S.c.anneaux);
        placer(c);
      });
      S.couv = couv; S.porte = porte;
      /* les pièges qui font du bruit, entre les rangées */
      S.bruyants = [];
      var sortes = BRUITS_DECOR[decor].filter(function(b){ return !(b === 'flaque' && decor === 'moulin' && type !== 'cour'); });
      for(var b = 0; b < p.bruits; b++){
        for(var e = 0; e < 40; e++){
          var kk = U.randInt(0, Rg), q = {x:R(54, 306), y:(ry(kk) + ry(kk + 1)) / 2 + R(-12, 12), type:U.choix(sortes)};
          if(decor === 'moulin' && type === 'cour' && Math.random() < 0.5) q.type = 'flaque';
          if(type === 'ruisseau' && q.y > 205 && q.y < 280) continue;   /* (pas de piège dans l'eau du ruisseau) */
          if(couv.every(function(c){ return dist(c, q) > 48; }) && S.bruyants.every(function(o){ return dist(o, q) > 72; })){
            q.g = svgNoeud('g', {'class':'mja-bruyant', transform:'translate(' + f0(q.x) + ',' + f0(q.y) + ') rotate(' + f0(R(-20, 20)) + ')'}, S.c.pieges); q.g.innerHTML = BRUITS[q.type].art(); S.bruyants.push(q); break;
          }
        }
      }
      /* l'animal qui dort (un sur deux pièces environ, toujours au moins un) */
      S.animal = null;
      if(p.animaux && (k === p.pieces - 1 || Math.random() < 0.5)){
        for(var ea = 0; ea < 40; ea++){
          var c0 = U.choix(couv.filter(function(c){ return !c.entree && !c.porte && !c.mobile; })); if(!c0) break;
          var aa = R(0, 6.28), qa = {x:c0.x + Math.cos(aa) * R(46, 64), y:c0.y + Math.sin(aa) * R(40, 56), sorte:animalDe(decor, type)};
          if(qa.x < 40 || qa.x > 320 || qa.y < 80 || qa.y > 410 || (type === 'ruisseau' && qa.y > 205 && qa.y < 280)) continue;
          if(couv.some(function(c){ return dist(c, qa) < 40; }) || S.bruyants.some(function(o){ return dist(o, qa) < 50; })) continue;
          qa.g = svgNoeud('g', {'class':'cc-animal', transform:'translate(' + f0(qa.x) + ',' + f0(qa.y) + ') rotate(' + f0(R(-30, 30)) + ')'}, S.c.pieges);
          qa.g.innerHTML = '<g class="cc-dort">' + ANIMAUX[qa.sorte].art + '</g><text class="cc-zzz" x="10" y="-14">z</text>';
          S.animal = qa; break;
        }
      }
      /* le fil à clochettes (niveau 5 et plus) : on peut toujours passer sans le franchir */
      S.fil = null;
      if(p.fil){
        for(var ef = 0; ef < 40; ef++){
          var kf = U.randInt(0, Rg), yf = (ry(kf) + ry(kf + 1)) / 2 + R(-8, 8), x0 = R(36, 190), L = R(110, 170);
          var fil = {a:{x:x0, y:yf}, b:{x:Math.min(326, x0 + L), y:yf + R(-14, 14)}};
          var proche = couv.some(function(c){ var t = fixe(((c.x - fil.a.x) * (fil.b.x - fil.a.x) + (c.y - fil.a.y) * (fil.b.y - fil.a.y)) / Math.pow(dist(fil.a, fil.b), 2), 0, 1); return dist(c, {x:fil.a.x + (fil.b.x - fil.a.x) * t, y:fil.a.y + (fil.b.y - fil.a.y) * t}) < 30; });
          if(proche || !relie(couv, fil)) continue;
          fil.g = svgNoeud('g', {'class':'cc-fil'}, S.c.pieges);
          var mx = (fil.a.x + fil.b.x) / 2, my = (fil.a.y + fil.b.y) / 2 + 5;
          fil.g.innerHTML = '<path class="cc-fil-l" d="M' + f1(fil.a.x) + ',' + f1(fil.a.y) + ' Q' + f1(mx) + ',' + f1(my) + ' ' + f1(fil.b.x) + ',' + f1(fil.b.y) + '" stroke="#f4ecd0" stroke-width="2" fill="none"/>' +
            [fil.a, fil.b].map(function(q){ return '<circle cx="' + f1(q.x) + '" cy="' + f1(q.y) + '" r="5" fill="#8a5a33"' + st(2.4) + '/>'; }).join('') +
            [0.3, 0.5, 0.7].map(function(t){ var x = (1 - t) * (1 - t) * fil.a.x + 2 * t * (1 - t) * mx + t * t * fil.b.x, y = (1 - t) * (1 - t) * fil.a.y + 2 * t * (1 - t) * my + t * t * fil.b.y; return '<g class="cc-clochette" transform="translate(' + f1(x) + ',' + f1(y + 4) + ')"><path d="M-4,2 C-4,-4 4,-4 4,2 Z" fill="#ffd36a"' + st(1.6) + '/><circle cy="3" r="1.4" fill="#b8862e"/></g>'; }).join('');
          S.fil = fil; break;
        }
      }
      /* les gardes : la première pièce un peu plus calme */
      S.gardes = [];
      var G0 = p.gardesPiece || Math.min(p.gardes, Rg + 1), G = Math.max(1, Math.min(G0 - (k === 0 && G0 > 1 && p.gardes > 2 ? 1 : 0) + (p.gardeEnPlus && k === p.pieces - 1 ? 1 : 0), Rg + 1));
      /* qui est qui : le guetteur est toujours un garde ; les autres prennent d'abord la lanterne et la torche (au hasard) */
      var sortes = n0 < 3 ? ['garde'] : (n0 < 5 ? ['garde', 'lanterne'] : U.melanger([p.lanterne ? 'lanterne' : null, p.torche ? 'torche' : null].filter(Boolean)).concat(['garde', 'garde']));
      var iS = 0;
      function ligneGap(gap){ var y = (ry(gap) + ry(gap + 1)) / 2; if(type === 'ruisseau' && y > 205 && y < 280) y = y < 242 ? 200 : 284; return y; }   /* (personne ne marche dans l'eau du ruisseau) */
      function bulle(gd){
        gd.bulle = svgNoeud('g', {'class':'cc-bulle'}, S.c.bulles);
        gd.bulle.innerHTML = '<g class="cc-b-alerte"><path d="M-11,-12 H11 Q15,-12 15,-8 V6 Q15,10 11,10 H4 L0,16 L-4,10 H-11 Q-15,10 -15,6 V-8 Q-15,-12 -11,-12 Z" fill="#ff5b6e"' + st(2.4) + '/><text y="5" text-anchor="middle">!</text></g><g class="cc-b-doute"><path d="M-11,-12 H11 Q15,-12 15,-8 V6 Q15,10 11,10 H4 L0,16 L-4,10 H-11 Q-15,10 -15,6 V-8 Q-15,-12 -11,-12 Z" fill="#ffd36a"' + st(2.4) + '/><text y="5" text-anchor="middle">?</text></g>';
      }
      var gapsPris = [];
      for(var j = 0; j < G; j++){
        var gap = fixe(Math.round((j + 0.5) * Rg / G + 0.3), 0, Rg);
        var y = ligneGap(gap), gd;
        gapsPris.push(gap);
        var typ = (p.guet && j === G - 1 && G >= 2) ? 'guet' : (p.boucle && j === 0 && Rg >= 3 ? 'boucle' : 'ronde');
        if(typ === 'guet'){ var cote = Math.random() < .5 ? 1 : -1; gd = {type:'guet', x:cote > 0 ? 34 : 326, y:y, base:cote > 0 ? 0 : Math.PI, amp:1.0, w:R(0.7, 1.1), tg:R(0, 6), pts:null}; gd.ang = gd.base; }
        else if(typ === 'boucle'){ var g2 = Math.min(Rg, gap + 1), ya = y, yb = ligneGap(g2); if(Math.abs(yb - ya) < 20) yb = ya - 60; gd = {type:'boucle', pts:[{x:46, y:ya}, {x:314, y:ya}, {x:314, y:yb}, {x:46, y:yb}], i:1, x:46, y:ya}; gd.ang = 0; }
        else { gd = {type:'ronde', pts:[{x:42, y:y}, {x:318, y:y}], i:Math.random() < .5 ? 0 : 1, x:R(80, 280), y:y}; gd.ang = gd.i ? 0 : Math.PI; }
        gd.sorte = typ === 'guet' ? 'garde' : (sortes[iS++] || 'garde');
        gd.vf = gd.sorte === 'lanterne' ? 0.85 : (gd.sorte === 'torche' ? 0.9 : 1);
        gd.etat = gd.type === 'guet' ? 'guet' : 'marche'; gd.t = 0; gd.phase = R(0, 6); gd.alerte = 0; gd.ph = R(0, 6); gd.ampM = 0; gd.px = gd.x; gd.py = gd.y;   /* (ampM : l'amplitude de la marche ; amp reste celle du guetteur qui pivote) */
        var cLum = NUIT ? S.c['cones-air'] : S.c['cones-sol'];
        /* (le cercle de la torche a maintenant un bord sombre sous son bord lumineux : on le voit sur tous les sols) */
        if(gd.sorte === 'torche'){ gd.rz = p.rTorche; gd.cercleB = svgNoeud('circle', {'class':'cc-zone-b', r:f0(gd.rz)}, cLum); gd.cercle = svgNoeud('circle', {'class':'cc-torche-c', r:f0(gd.rz), fill:'url(#' + id + 'to)'}, cLum); }
        else { gd.cone = svgNoeud('path', {'class':'mja-cone cc-cone'}, cLum); if(gd.sorte === 'lanterne') gd.cone2 = svgNoeud('path', {'class':'mja-cone cc-cone cc-cone-dos'}, cLum); }
        gd.g = svgNoeud('g', {'class':'mja-garde cc-garde cc-' + gd.sorte}, S.c.gardes);
        gd.g.innerHTML = '<g class="cc-g-rot">' + gardeDessus(decor, gd.sorte === 'lanterne' ? 'veilleur' : (gd.sorte === 'torche' ? 'torche' : null)) + '</g>';
        gd.rot = gd.g.querySelector('.cc-g-rot'); gd.anim = Bonhomme(gd.g);
        gd.lant = (NUIT || gd.sorte === 'torche') ? svgNoeud('circle', {'class':'cc-lant-lueur' + (gd.sorte === 'torche' ? ' cc-lueur-torche' : ''), r:gd.sorte === 'torche' ? 30 : (gd.sorte === 'lanterne' ? 24 : 16), fill:'url(#' + id + 'lu)'}, S.c.lant) : null;
        bulle(gd);
        S.gardes.push(gd);
      }
      /* le chien : il trotte le long d'un passage libre, le museau au sol */
      if(p.chiens === 'toutes' || (p.chiens === 'une' && k === p.pieces - 1)){
        var libres = []; for(var gg = 0; gg <= Rg; gg++) if(gapsPris.indexOf(gg) < 0) libres.push(gg);
        var gapC = libres.length ? U.choix(libres) : U.randInt(0, Rg), yc = ligneGap(gapC);
        var ch = {type:'ronde', sorte:'chien', vf:0.62, pts:[{x:46, y:yc}, {x:314, y:yc}], i:Math.random() < .5 ? 0 : 1, x:R(80, 280), y:yc, etat:'marche', t:0, phase:R(0, 6), alerte:0, ph:R(0, 6), ampM:0};
        ch.ang = ch.i ? 0 : Math.PI;
        ch.flair = svgNoeud('circle', {'class':'cc-flair', r:FLAIR}, S.c['cones-sol']);
        ch.g = svgNoeud('g', {'class':'mja-garde cc-garde cc-chien'}, S.c.gardes);
        ch.g.innerHTML = '<g class="cc-g-rot">' + chienDessus() + '</g>';
        ch.rot = ch.g.querySelector('.cc-g-rot'); ch.anim = Chien(ch.g);
        ch.jauge = svgNoeud('circle', {'class':'cc-jauge', r:27, opacity:0}, S.c.bulles);
        bulle(ch);
        S.gardes.push(ch);
      }
      /* le chemin jusqu'à la porte existe-t-il encore ? (quand un villageois déplace une caisse) */
      S.relie = function(){ return relie(S.couv.filter(function(c){ return !c.emporte && !c.porte; }), S.fil); };
      /* les villageois sans vision (Romain, 6 nov., 10 h 50) : la cueilleuse va de buisson à baies en buisson à baies ;
         le porteur soulève une caisse, un tonneau, un sac… et va le reposer ailleurs dans la pièce. Il faut assez de
         cachettes pour eux : au besoin, on en change quelques-unes. */
      S.villageois = [];
      var MT = METIERS[decor];
      if(p.villageois && MT){
        var elig = couv.filter(function(c){ return !c.entree && !c.porte && !c.mobile && MT.types.indexOf(c.type) >= 0; });
        var autres = couv.filter(function(c){ return !c.entree && !c.porte && !c.mobile && MT.types.indexOf(c.type) < 0; });
        while(elig.length < p.villageois + 1 && autres.length){ var c2 = autres.splice(U.randInt(0, autres.length - 1), 1)[0]; c2.type = U.choix(MT.types); c2.g.innerHTML = '<g transform="rotate(' + f0(R(-14, 14)) + ')">' + COUV[c2.type]() + '</g>'; elig.push(c2); }
        for(var iv = 0; iv < p.villageois; iv++){
          var vg = {sorte:'villageois', metier:MT.metier, x:iv % 2 ? 330 : 30, y:ligneGap(U.randInt(1, Rg)), ang:iv % 2 ? Math.PI : 0, etat:'pause', t:R(1, 2.5) + iv * 2.5, phase:0, alerte:0, ph:R(0, 6), ampM:0, vf:0.7};
          vg.g = svgNoeud('g', {'class':'mja-garde cc-garde cc-villageois'}, S.c.gardes);
          vg.g.innerHTML = '<g class="cc-g-rot">' + gardeDessus(decor, MT.metier === 'cueille' ? 'cueilleur' : 'porteur') + '</g>';
          vg.rot = vg.g.querySelector('.cc-g-rot'); vg.anim = Bonhomme(vg.g);
          vg.jauge = svgNoeud('circle', {'class':'cc-jauge cc-jauge-v', r:29, opacity:0}, S.c.bulles);
          bulle(vg);
          S.gardes.push(vg); S.villageois.push(vg);
        }
      }
      /* le rôdeur (niveau 10 ; Romain, 6 nov., 12 h 49 : « quelqu'un qui fait la ronde, avec des trajets un peu plus
         aléatoires, qui se déplace partout dans la pièce, vraiment partout, avec une zone ronde autour de lui ») : il va
         d'un point à un autre, tirés au hasard dans toute la pièce, s'arrête un instant, repart. Son chemin est tiré
         d'avance (et partagé avec les prévisions de l'aide et du robot) : ce qu'on prévoit, c'est ce qu'il fera. */
      if(p.rodeur){
        var rd = {type:'rodeur', sorte:'rodeur', vf:0.68, etat:'marche', t:0, phase:R(0, 6), alerte:0, ph:R(0, 6), ampM:0, chemin:[], iw:0, rz:p.rRodeur};
        var q0 = pointRodeur(null, S);
        for(var er = 0; er < 30 && q0.y > 330; er++) q0 = pointRodeur(null, S);
        rd.x = q0.x; rd.y = q0.y; rd.ang = R(-3.1, 3.1);
        etendreRodeur(rd, S);
        rd.cercleB = svgNoeud('circle', {'class':'cc-zone-b cc-zone-b-r', r:f0(rd.rz)}, NUIT ? S.c['cones-air'] : S.c['cones-sol']);
        rd.cercle = svgNoeud('circle', {'class':'cc-rodeur-c', r:f0(rd.rz), fill:'url(#' + id + 'ro)'}, NUIT ? S.c['cones-air'] : S.c['cones-sol']);
        rd.g = svgNoeud('g', {'class':'mja-garde cc-garde cc-rodeur'}, S.c.gardes);
        rd.g.innerHTML = '<g class="cc-g-rot">' + gardeDessus(decor, 'rodeur') + '</g>';
        rd.rot = rd.g.querySelector('.cc-g-rot'); rd.anim = Bonhomme(rd.g);
        rd.lant = NUIT ? svgNoeud('circle', {'class':'cc-lant-lueur cc-lueur-rodeur', r:24, fill:'url(#' + id + 'lu)'}, S.c.lant) : null;
        bulle(rd);
        S.gardes.push(rd);
      }
      /* la pie bavarde : retirée (Romain, 6 nov., 12 h 49) ; p.pie est toujours vide */
      S.pie = null;
      if(p.pie === 'toutes' || (p.pie === 'une' && (k === p.pieces - 1 || Math.random() < 0.5))){
        var gapsL = []; for(var gp = 1; gp <= Rg; gp++) if(gapsPris.indexOf(gp) < 0) gapsL.push(gp);
        var gPie = gapsL.length ? U.choix(gapsL) : U.randInt(1, Rg), gauche = Math.random() < 0.5;
        var guetIci = S.gardes.filter(function(gd){ return gd.type === 'guet' && Math.abs(gd.y - ligneGap(gPie)) < 30; })[0];
        if(guetIci) gauche = guetIci.x > 180;
        var pie = {x:gauche ? 28 : 332, y:ligneGap(gPie) + R(-8, 8), base:gauche ? 0 : Math.PI, amp:0.8, w:R(0.75, 1.05), tg:R(0, 6), cd:0};
        pie.ang = pie.base + Math.sin(pie.tg) * pie.amp;
        pie.cone = svgNoeud('path', {'class':'cc-cone-pie'}, NUIT ? S.c['cones-air'] : S.c['cones-sol']);
        pie.g = svgNoeud('g', {'class':'cc-pie', transform:'translate(' + f0(pie.x) + ',' + f0(pie.y) + ')'}, S.c.gardes);
        pie.g.innerHTML = '<circle r="11" fill="#7a5232"' + st(2.4) + '/><circle r="6" fill="none" stroke="#5e3e26" stroke-width="1.6"/><g class="cc-pie-rot">' + pieDessus() + '</g>';
        pie.rot = pie.g.querySelector('.cc-pie-rot');
        S.pie = pie;
      }
      return S;
    }
    function placer(c){ if(c.g) c.g.setAttribute('transform', 'translate(' + f1(c.x) + ',' + f1(c.y) + ')'); if(c.an){ c.an.setAttribute('cx', f1(c.x)); c.an.setAttribute('cy', f1(c.y)); } }
    /* où se blottir : derrière la cachette (la tête dépasse en haut), au fond de l'entrée, dans la charrette ou la brume */
    function cachetteDe(c){ return c.porte ? {x:c.x, y:c.y + 10} : (c.entree ? {x:c.x, y:c.y - 2} : (c.mobile ? {x:c.x, y:c.y + 2} : {x:c.x + 6, y:c.y - 17})); }

    /* ----- état ----- */
    var ki = 0, S = salles[0], ici = S.couv[0], dep = cachetteDe(ici), jx = dep.x, jy = dep.y, course = null, fini = false, restant = p.duree, invisT = 0, invisUtilise = false, passage = null, majAnT = 0;
    var tJeu = 0, odeurT = 0;   /* odeurT : depuis combien de temps le Pisteur est dans la même cachette (le chien le sent) */
    S.c.cache.appendChild(joueur);
    /* l'odeur du Pisteur caché : des petites ondes qui montent, de plus en plus fort (seulement s'il y a un chien) */
    var odeurG = svgNoeud('g', {'class':'cc-odeur', opacity:0}, svg);
    odeurG.innerHTML = [-7, 0, 7].map(function(x, i){ return '<path class="cc-onde" style="animation-delay:-' + (i * 0.45).toFixed(2) + 's" d="M' + x + ',0 c-3,-4 3,-7 0,-11 c-3,-4 3,-7 0,-11" fill="none" stroke="#d9f7c4" stroke-width="2.4" stroke-linecap="round"/>'; }).join('');
    function annoncePiece(){ A.annonce(terrain, (D.noms[S.type] || ''), 1300); }
    P.apres(250, annoncePiece);

    /* ----- les gardes ----- */
    function tourner(gd, cible, dt, vit){ var d = angleNorm(cible - gd.ang); gd.ang += fixe(d, -vit * dt, vit * dt); }
    function coneD(el, gd, ang, L, h){
      var ox = gd.x + Math.cos(ang) * 14, oy = gd.y + Math.sin(ang) * 14;
      var x1 = gd.x + Math.cos(ang - h) * L, y1 = gd.y + Math.sin(ang - h) * L, x2 = gd.x + Math.cos(ang + h) * L, y2 = gd.y + Math.sin(ang + h) * L;
      el.setAttribute('d', 'M' + f1(ox) + ',' + f1(oy) + ' L' + f1(x1) + ',' + f1(y1) + ' A' + f0(L) + ',' + f0(L) + ' 0 0 1 ' + f1(x2) + ',' + f1(y2) + ' Z');
    }
    function majGarde(gd, dt, alea){
      var v = p.vitesse * (gd.vf || 1);
      if(gd.alerte > 0){ gd.alerte -= dt; return; }
      gd.phase += dt;
      if(gd.sorte === 'villageois'){
        /* le villageois marche jusqu'à sa cachette (ou porte sa caisse) ; sinon il attend ou il travaille */
        if(gd.etat === 'va' || gd.etat === 'porte'){
          var vv = p.vitesse * (gd.etat === 'porte' ? 0.55 : 0.75) + 12, wx = gd.cible.x - gd.x, wy = gd.cible.y - gd.y, wd = Math.sqrt(wx * wx + wy * wy);
          tourner(gd, Math.atan2(wy, wx), dt, 6);
          if(wd < vv * dt + 0.5){ gd.x = gd.cible.x; gd.y = gd.cible.y; gd.arrive = true; }
          else { gd.x += wx / wd * vv * dt; gd.y += wy / wd * vv * dt; }
        } else gd.t -= dt;
        return;
      }
      if(gd.sorte === 'chien'){
        /* le chien qui a senti l'odeur : il renifle sur place (museau levé), aboie, court jusqu'à la cachette, la fouille,
           aboie si le Pisteur y est encore… ou reste perplexe */
        if(gd.etat === 'flaire'){ gd.t -= dt; tourner(gd, Math.atan2(gd.cibleP.y - gd.y, gd.cibleP.x - gd.x), dt, 2.2); return; }
        if(gd.etat === 'aboie1'){ gd.t -= dt; tourner(gd, Math.atan2(gd.cibleP.y - gd.y, gd.cibleP.x - gd.x), dt, 8); return; }
        if(gd.etat === 'piste'){
          var vc = p.vitesse * 1.7 + 30, tx = gd.cible.x - gd.x, ty = gd.cible.y - gd.y, td = Math.sqrt(tx * tx + ty * ty);
          tourner(gd, Math.atan2(ty, tx), dt, 7);
          if(td < vc * dt + 0.5){ gd.x = gd.cible.x; gd.y = gd.cible.y; gd.etat = 'renifle'; gd.t = p.renifle; gd.ang = Math.atan2(gd.cibleP.y - gd.y, gd.cibleP.x - gd.x); }
          else { gd.x += tx / td * vc * dt; gd.y += ty / td * vc * dt; }
          return;
        }
        if(gd.etat === 'renifle' || gd.etat === 'surveille'){ gd.t -= dt; return; }
        if(gd.etat === 'perplexe'){ gd.t -= dt; gd.ang = gd.base + Math.sin(gd.phase * 4) * 0.7; return; }
      }
      if(gd.sorte === 'rodeur' && (gd.etat === 'marche' || gd.etat === 'pause')){
        /* le rôdeur : il tourne doucement vers son prochain point et avance (des trajets en courbes, partout dans la pièce) */
        if(gd.chemin.length < gd.iw + 2) etendreRodeur(gd, S);
        if(gd.etat === 'pause'){ gd.t -= dt; tourner(gd, gd.base + Math.sin(gd.phase * 2.2) * 0.9, dt, 4); if(gd.t <= 0) gd.etat = 'marche'; return; }
        var rw = gd.chemin[gd.iw], rx = rw.x - gd.x, ryy = rw.y - gd.y, rdd = Math.sqrt(rx * rx + ryy * ryy), rerr = angleNorm(Math.atan2(ryy, rx) - gd.ang);
        tourner(gd, Math.atan2(ryy, rx), dt, 3.2);
        var vr = v * Math.max(0.3, Math.cos(rerr));
        if(rdd < Math.max(7, vr * dt + 0.5)){ gd.iw++; if(rw.pause){ gd.etat = 'pause'; gd.t = rw.pause; gd.base = gd.ang; gd.phase = 0; } return; }
        gd.x = fixe(gd.x + Math.cos(gd.ang) * vr * dt, 30, 330); gd.y = fixe(gd.y + Math.sin(gd.ang) * vr * dt, 50, 440);
        return;
      }
      if(gd.etat === 'guet'){ gd.tg += dt * gd.w; if(alea && p.imprevu && Math.random() < p.imprevu * dt * 0.6) gd.w = R(0.5, 1.4); gd.ang = gd.base + Math.sin(gd.tg) * gd.amp; return; }
      if(gd.etat === 'marche'){
        var c = gd.pts[gd.i], dx = c.x - gd.x, dy = c.y - gd.y, dd = Math.sqrt(dx * dx + dy * dy);
        tourner(gd, Math.atan2(dy, dx), dt, 5);
        if(dd < v * dt + 0.5){ gd.x = c.x; gd.y = c.y; gd.etat = 'pause'; gd.t = p.pause * (alea ? R(0.6, 1.4) : 1); gd.base = gd.ang; gd.phase = 0; gd.i = (gd.i + 1) % gd.pts.length; }
        else { gd.x += dx / dd * v * dt; gd.y += dy / dd * v * dt; }
        /* (le veilleur et le porteur de torche marchent sans changer d'avis : leur lumière est grande, on doit pouvoir la prévoir) */
        if(alea && p.imprevu && gd.sorte !== 'torche' && gd.sorte !== 'lanterne' && Math.random() < p.imprevu * dt){ gd.etat = 'pause'; gd.t = R(0.5, 0.9); gd.base = gd.ang + Math.PI; gd.phase = 0; if(Math.random() < 0.5 && gd.type === 'ronde') gd.i = 1 - gd.i; }
      } else if(gd.etat === 'pause'){
        gd.t -= dt; tourner(gd, gd.base + Math.sin(gd.phase * 2.6) * 0.9, dt, 6);
        if(gd.t <= 0) gd.etat = 'marche';
      } else if(gd.etat === 'enquete'){
        var ex = gd.bruit.x - gd.x, ey = gd.bruit.y - gd.y, ed = Math.sqrt(ex * ex + ey * ey);
        tourner(gd, Math.atan2(ey, ex), dt, 6);
        if(ed < 30){ gd.etat = 'regarde'; gd.t = 2; gd.base = gd.ang; gd.phase = 0; }
        else { gd.x += ex / ed * v * 1.3 * dt; gd.y += ey / ed * v * 1.3 * dt; }
      } else if(gd.etat === 'regarde'){
        gd.t -= dt; gd.ang = gd.base + Math.sin(gd.phase * 3) * 1.4;
        if(gd.t <= 0 && gd.sorte === 'rodeur'){ gd.etat = 'marche'; return; }   /* (il reprend son chemin) */
        if(gd.t <= 0){ gd.etat = 'marche'; var best = 0; gd.pts.forEach(function(q, i){ if(dist(q, gd) < dist(gd.pts[best], gd)) best = i; }); gd.i = best; }
      }
    }
    /* qui voit quoi : le garde, un cône devant lui ; le veilleur, un cône devant et un plus court derrière (sa grosse
       lanterne) ; la torche, un cercle tout autour ; le chien, seulement tout près de son museau (et pas pendant qu'il
       renifle une cachette : il a le nez dedans) */
    /* (quand il court vers la cachette, il ne pense qu'à elle : on peut s'enfuir à côté de lui) */
    function flaireActif(gd){ return gd.etat === 'marche' || gd.etat === 'pause'; }
    function voitPie(pi, ang, pt){ var dx = pt.x - pi.x, dy = pt.y - pi.y, d = Math.sqrt(dx * dx + dy * dy); if(d < 16) return true; if(d > PIE.L) return false; return Math.abs(angleNorm(Math.atan2(dy, dx) - ang)) < PIE.h; }
    function voit(gd, pt, marge){
      marge = marge || 1;
      var dx = pt.x - gd.x, dy = pt.y - gd.y, d = Math.sqrt(dx * dx + dy * dy);
      if(gd.sorte === 'villageois') return false;   /* (sans vision) */
      if(gd.sorte === 'chien') return flaireActif(gd) && d < FLAIR * marge;
      if(d < 24) return true;
      if(gd.sorte === 'torche' || gd.sorte === 'rodeur') return d < gd.rz * marge;
      var ea = Math.abs(angleNorm(Math.atan2(dy, dx) - gd.ang)), plus = marge > 1 ? 0.1 : 0;
      if(gd.sorte === 'lanterne') return (d < p.faisceau * 0.8 * marge && ea < 0.5 * marge + plus) || (d < p.faisceau * 0.55 * marge && Math.PI - ea < 0.5 * marge + plus);
      if(d > p.faisceau * marge) return false;
      return ea < 0.55 * marge + plus;
    }
    function texte(x, y, quoi, cls){ var q = A.pctDans(svg, terrain, x, y); A.flotter(terrain, q.x, q.y, quoi, cls || 'ko'); }
    /* un bruit : les gardes proches viennent voir ; tous = toute la pièce (le fil à clochettes) */
    function bruit(x, y, rayon, quoi, tous){
      texte(x, y, quoi);
      S.gardes.forEach(function(gd){
        var proche = tous || dist(gd, {x:x, y:y}) < rayon;
        if(!proche || gd.sorte === 'chien' || gd.sorte === 'villageois') return;
        if(gd.type !== 'guet' && gd.alerte <= 0){ gd.etat = 'enquete'; gd.bruit = {x:x, y:y}; gd.g.classList.add('doute'); gd.bulle.classList.add('doute'); P.apres(1600, function(){ gd.g.classList.remove('doute'); gd.bulle.classList.remove('doute'); }); }
        else if(gd.type === 'guet'){ gd.base = Math.atan2(y - gd.y, x - gd.x); gd.tg = 0; }
      });
    }

    /* ----- le Pisteur ----- */
    function accessibles(){ return S.couv.filter(function(c){ return c !== ici && !c.entree && !c.emporte && !(c.devoile > tJeu) && dist(c, ici) <= p.portee && c.k >= ici.k - 1; }); }
    function majAnneaux(){
      var acc = (course || passage) ? [] : accessibles();
      S.couv.forEach(function(c){ var a = acc.indexOf(c) >= 0; if(c.an) c.an.classList.toggle('on', a); c.acc = a; if(!a && c.an) c.an.classList.remove('sur', 'danger'); });
    }
    majAnneaux();
    function dureeCourse(a, b){ return dist(a, b) / p.course; }
    function mobileDans(c, tt){
      var x = c.x + c.dir * c.v * tt;
      for(var r = 0; r < 6 && (x < 60 || x > 300); r++) x = x > 300 ? 600 - x : 120 - x;
      return {x:x, y:c.y, mobile:c.mobile};
    }
    function coupeFil(a, b){
      var f = S.fil; if(!f || f.tombe) return false;
      function c(p1, p2, p3){ return (p3.y - p1.y) * (p2.x - p1.x) > (p2.y - p1.y) * (p3.x - p1.x); }
      return c(a, f.a, f.b) !== c(b, f.a, f.b) && c(a, b, f.a) !== c(a, b, f.b);
    }
    function surPredit(c){
      var a = {x:jx, y:jy}, b = cachetteDe(c), T = dureeCourse(a, b);
      if(coupeFil(a, b)) return false;
      var copies = S.gardes.map(function(gd){ return Object.assign({}, gd); }), an = S.animal;
      for(var tt = 0; tt <= T + 0.1; tt += 0.05){
        var k = Math.min(1, tt / T), e = k < .5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2, bb = c.mobile ? cachetteDe(mobileDans(c, tt)) : b;
        var pt = {x:a.x + (bb.x - a.x) * e, y:a.y + (bb.y - a.y) * e};
        for(var j = 0; j < S.bruyants.length; j++){ if(dist(S.bruyants[j], pt) < 26 && copies.some(function(gd){ return dist(gd, S.bruyants[j]) < 200; })) return false; }
        if(an && !an.reveille && dist(an, pt) < 38 && copies.some(function(gd){ return dist(gd, an) < 170; })) return false;
        if(S.pie && S.pie.cd <= tt && voitPie(S.pie, S.pie.base + Math.sin(S.pie.tg + S.pie.w * tt) * S.pie.amp, pt)) return false;
        for(var i = 0; i < copies.length; i++){ if(copies[i].alerte <= 0 && voit(copies[i], pt, 1.15)) return false; majGarde(copies[i], 0.05, false); }
      }
      return true;
    }
    function poussiere(x, y){
      for(var i = 0; i < 4; i++){
        var c = svgNoeud('circle', {'class':'cc-poussiere', cx:f1(x + R(-8, 8)), cy:f1(y + R(-2, 8)), r:f1(R(3, 6))}, S.c.court);
        c.style.animationDelay = (i * 0.05) + 's';
        (function(n){ P.apres(700, function(){ if(n.parentNode) n.parentNode.removeChild(n); }); })(c);
      }
    }
    function courir(c){
      if(fini || course || passage) return;
      var a = {x:jx, y:jy};
      course = {a:a, c:c, t:0, T:dureeCourse(a, cachetteDe(c)), retour:false, bruit:{}};
      S.c.court.appendChild(joueur);
      poussiere(jx, jy + 6);
      U.son('pas');
      majAnneaux();
    }
    if(btnI) P.ecoute(btnI, 'click', function(){ if(invisUtilise || fini) return; invisUtilise = true; invisT = p.invisible; btnI.disabled = true; U.son('magie'); });
    P.ecoute(svg, 'pointerdown', function(e){
      if(fini || passage) return;
      e.preventDefault();
      var pt = A.ptSVG(svg, e);
      var best = null, bd = 50;
      S.couv.forEach(function(c){ var d = dist(pt, c); if(d < bd){ bd = d; best = c; } });
      if(!best || best === ici || best.entree) return;
      if(best.acc) courir(best);
      else { A.secouer(best.g || svg); texte(best.x, best.y - 30, 'Trop loin !'); }
    });
    terrain.mjaEtat = function(){ return {salle:ki, pieces:p.pieces, passage:!!passage, ici:S.couv.indexOf(ici), course:!!course, j:{x:jx, y:jy}, restant:restant,
      odeur:S.gardes.some(function(gd){ return gd.sorte === 'chien'; }) ? odeurT / p.odeur : null, chasse:S.gardes.some(function(gd){ return gd.cibleC === ici && ((gd.sorte === 'chien' && (gd.etat === 'flaire' || gd.etat === 'aboie1' || gd.etat === 'piste' || gd.etat === 'renifle' || gd.etat === 'surveille')) || (gd.sorte === 'villageois' && (gd.etat === 'va' || gd.etat === 'travaille'))); }),
      gardes:S.gardes.map(function(gd){ return {x:Math.round(gd.x), y:Math.round(gd.y), a:Math.round(gd.ang * 57.3), type:gd.type, sorte:gd.sorte, etat:gd.etat}; }), couv:S.couv.map(function(c, i){ return {i:i, acc:!!c.acc, sur:c.acc ? surPredit(c) : false, k:c.k, porte:!!c.porte, x:c.x, y:c.y}; })}; };
    terrain.mjaCourir = function(i){ if(S.couv[i] && S.couv[i].acc) courir(S.couv[i]); };

    function repere(gd){
      vies--; hud.perdVie(vies, maxVies);
      A.erreurSensorielle(terrain);
      gd.alerte = 1.2; gd.g.classList.add('alerte'); gd.bulle.classList.add('alerte'); P.apres(1200, function(){ gd.g.classList.remove('alerte'); gd.bulle.classList.remove('alerte'); });
      texte(jx, jy - 26, gd.sorte === 'chien' ? 'Ouaf ! Ouaf !' : 'Repéré !');
      if(vies <= 0){ fini = true; P.finir({reussi:false, score:(ki + ici.k / (S.R + 1)) / p.pieces, erreurs:maxVies, detail:gd.sorte === 'chien' ? 'Le chien t\'a senti !' : (decor === 'foret' ? 'On t\'a vu… Demi-tour !' : 'Le garde t\'a vu…')}, 900); return; }
      course = {a:{x:jx, y:jy}, c:ici, t:0, T:0.35, retour:true, bruit:{}};
    }
    /* le chien a fini de renifler et le Pisteur est encore là : il aboie (une erreur) et la cachette est dévoilée un moment */
    function aboie(gd){
      vies--; hud.perdVie(vies, maxVies);
      A.erreurSensorielle(terrain); U.son('ko');
      gd.g.classList.add('alerte'); gd.bulle.classList.remove('doute'); gd.bulle.classList.add('alerte'); P.apres(1100, function(){ gd.g.classList.remove('alerte'); gd.bulle.classList.remove('alerte'); });
      texte(gd.x, gd.y - 30, 'Ouaf ! Ouaf !');
      devoiler(gd.cibleC, true);
      if(vies <= 0){ fini = true; P.finir({reussi:false, score:(ki + ici.k / (S.R + 1)) / p.pieces, erreurs:maxVies, detail:'Le chien t\'a trouvé !'}, 900); }
    }
    /* une cachette dévoilée : pendant 7 s on ne peut plus y aller (traces de pattes si c'est le chien) */
    function devoiler(c, pattes){
      if(!c || c.entree) return;
      c.devoile = tJeu + 7;
      if(c.g) c.g.classList.add('cc-devoile');
      if(c.pattes) c.pattes.parentNode.removeChild(c.pattes);
      c.pattes = svgNoeud('g', {'class':'cc-pattes'}, S.c.anneaux);
      c.pattes.innerHTML = '<g transform="translate(' + f1(c.x) + ',' + f1(c.y) + ')"><circle r="30" class="cc-devoile-r"/>' + (pattes ? [[-9, 14, -20], [3, 21, 10]].map(function(q){ return '<g transform="translate(' + q[0] + ',' + q[1] + ') rotate(' + q[2] + ')"><ellipse cy="2" rx="3.6" ry="3" fill="#ff8a6a"/><circle cx="-3.2" cy="-2.6" r="1.4" fill="#ff8a6a"/><circle cx="0" cy="-3.8" r="1.4" fill="#ff8a6a"/><circle cx="3.2" cy="-2.6" r="1.4" fill="#ff8a6a"/></g>'; }).join('') : '<text y="-34" text-anchor="middle" class="cc-devoile-t">!</text>') + '</g>';
      majAnneaux();
    }
    /* un villageois a fini sa cueillette (ou soulève la caisse) et le Pisteur est dedans : il le trouve (une erreur) */
    function trouve(v, c){
      vies--; hud.perdVie(vies, maxVies);
      A.erreurSensorielle(terrain); U.son('ko');
      v.bulle.classList.add('alerte'); P.apres(1100, function(){ v.bulle.classList.remove('alerte'); });
      texte(v.x, v.y - 30, v.metier === 'cueille' ? 'Oh ! Coucou, toi !' : 'Oh ! Qu\'est-ce que tu fais là ?');
      devoiler(c, false);
      if(vies <= 0){ fini = true; P.finir({reussi:false, score:(ki + ici.k / (S.R + 1)) / p.pieces, erreurs:maxVies, detail:'Un villageois t\'a trouvé !'}, 900); }
    }
    /* le villageois choisit où aller : un buisson à baies, une caisse, un sac… (souvent celui du Pisteur) */
    function choisirTravail(v){
      var MT = METIERS[decor], prises = S.villageois.map(function(o){ return o !== v ? o.cibleC : null; });
      var cand = S.couv.filter(function(c){ return !c.entree && !c.porte && !c.mobile && !c.emporte && !(c.devoile > tJeu) && prises.indexOf(c) < 0 && c !== v.dernier && MT.types.indexOf(c.type) >= 0; });
      if(!cand.length){ v.etat = 'pause'; v.t = 1.5; return; }
      var c = cand.indexOf(ici) >= 0 && Math.random() < 0.35 ? ici : U.choix(cand);
      var a = Math.atan2(v.y - c.y, v.x - c.x), r = 28;
      v.cibleC = c; v.cible = {x:fixe(c.x + Math.cos(a) * r, 26, 334), y:fixe(c.y + Math.sin(a) * r, 50, 440)}; v.etat = 'va'; v.arrive = false;
    }
    /* où reposer la caisse : dans une rangée, loin des autres cachettes et des pièges, sans couper le chemin de la porte */
    function nouvellePlace(c){
      var x0 = c.x, y0 = c.y, k0 = c.k, ok = null;
      for(var e = 0; e < 40 && !ok; e++){
        var kk = U.randInt(1, S.R), q = {x:R(54, 306), y:S.ry(kk) + R(-10, 10), k:kk};
        if(dist(q, {x:x0, y:y0}) < 70) continue;
        if(S.type === 'ruisseau' && q.y > 205 && q.y < 280) continue;
        if(S.couv.some(function(o){ return o !== c && !o.porte && dist(o, q) < 66; }) || S.bruyants.some(function(o){ return dist(o, q) < 46; }) || (S.animal && dist(S.animal, q) < 50)) continue;
        c.x = q.x; c.y = q.y; c.k = q.k;
        if(S.relie()) ok = q;
        c.x = x0; c.y = y0; c.k = k0;
      }
      return ok;
    }
    /* la porte d'une pièce : on la passe, la pièce suivante glisse à sa place */
    function pieceSuivante(){
      var vieille = S, neuve = salles[ki + 1];
      passage = {t:0, vieille:vieille, neuve:neuve, de:{x:jx, y:jy}};
      U.son('porte');
      vieille.porte.halo && vieille.porte.halo.classList.add('ouverte');
      majAnneaux();
    }
    function finPassage(){
      var neuve = passage.neuve;
      passage.vieille.g.setAttribute('display', 'none'); passage.vieille.g.removeAttribute('transform'); passage.vieille.g.removeAttribute('opacity');
      neuve.g.removeAttribute('transform'); neuve.g.removeAttribute('opacity');
      ki++; S = neuve; ici = S.couv[0]; var c = cachetteDe(ici); jx = c.x; jy = c.y; jAng = -Math.PI / 2; odeurT = 0;
      S.c.cache.appendChild(joueur);
      passage = null;
      hud.prog(ki, p.pieces, '🚪');
      majAnneaux(); annoncePiece();
    }

    P.boucle(function(dt){
      if(fini) return false;
      restant -= dt; tJeu += dt;
      hud.temps(restant / p.duree);
      if(restant <= 0){ fini = true; P.finir({reussi:false, score:(ki + ici.k / (S.R + 1)) / p.pieces, detail:NUIT ? 'Le jour se lève… trop tard !' : 'La nuit tombe… trop tard !'}, 600); return false; }
      if(invisT > 0){ invisT -= dt; if(invisT <= 0 && btnI) btnI.textContent = '👻'; }
      joueur.classList.toggle('invisible', invisT > 0);
      if(S.roue) S.roue.setAttribute('transform', 'translate(0,' + f1((restant * 22) % 18) + ')');
      /* le passage d'une pièce à l'autre */
      if(passage){
        passage.t += dt;
        var u = fixe(passage.t / 0.9, 0, 1), e1 = u * u * (3 - 2 * u);
        /* le Pisteur sort par la porte (il monte), puis la nouvelle pièce descend à sa place */
        jx = passage.de.x; jy = passage.de.y - 40 * Math.min(1, u * 2.2); jPh += dt * 14; jAmp = 1; jCache = 0; jAng = -Math.PI / 2;
        passage.vieille.g.setAttribute('transform', 'translate(0,' + f1(e1 * 300) + ')'); passage.vieille.g.setAttribute('opacity', f1(1 - e1));
        passage.neuve.g.setAttribute('display', 'inline'); passage.neuve.g.setAttribute('transform', 'translate(0,' + f1(-260 * (1 - e1)) + ')'); passage.neuve.g.setAttribute('opacity', f1(e1));
        joueur.setAttribute('opacity', f1(1 - Math.min(1, u * 1.6)));
        if(u >= 1){ joueur.removeAttribute('opacity'); finPassage(); }
        dessinerJoueur(dt);
        return;
      }
      /* ce qui avance tout seul */
      S.couv.forEach(function(c){
        if(!c.mobile) return;
        c.x += c.dir * c.v * dt;
        if(c.x < 60 || c.x > 300){ c.dir = -c.dir; c.x = fixe(c.x, 60, 300); }
        placer(c);
        if(c.mobile === 'charrette'){ var ane = c.g.querySelector('.cc-ane'); if(ane) ane.setAttribute('transform', 'translate(0,-46) rotate(' + f1(Math.sin(restant * 6) * 3) + ')'); c.g.setAttribute('transform', 'translate(' + f1(c.x) + ',' + f1(c.y) + ') rotate(' + (c.dir > 0 ? 90 : -90) + ')'); }
      });
      /* les gardes */
      S.gardes.forEach(function(gd){
        var ax = gd.x, ay = gd.y;
        majGarde(gd, dt, true);
        var vit = Math.hypot(gd.x - ax, gd.y - ay) / Math.max(dt, 1e-4);
        gd.ph += vit * dt * (gd.sorte === 'chien' ? 0.7 : 0.42); gd.ampM += ((vit > 4 ? 1 : 0) - gd.ampM) * Math.min(1, dt * 8);
        if(gd.cone){
          coneD(gd.cone, gd, gd.ang, p.faisceau * (gd.sorte === 'lanterne' ? 0.8 : 1), gd.sorte === 'lanterne' ? 0.5 : 0.55);
          gd.cone.classList.toggle('alerte', gd.alerte > 0);
          if(gd.cone2){ coneD(gd.cone2, gd, gd.ang + Math.PI, p.faisceau * 0.55, 0.5); gd.cone2.classList.toggle('alerte', gd.alerte > 0); }
        }
        if(gd.cercle){
          var rzz = f1(gd.rz + Math.sin(tJeu * (gd.sorte === 'torche' ? 9 : 3) + gd.ph) * 1.6);
          gd.cercle.setAttribute('cx', f1(gd.x)); gd.cercle.setAttribute('cy', f1(gd.y)); gd.cercle.setAttribute('r', rzz); gd.cercle.classList.toggle('alerte', gd.alerte > 0);
          if(gd.cercleB){ gd.cercleB.setAttribute('cx', f1(gd.x)); gd.cercleB.setAttribute('cy', f1(gd.y)); gd.cercleB.setAttribute('r', rzz); }
        }
        if(gd.flair){ var fa = flaireActif(gd); gd.flair.setAttribute('cx', f1(gd.x + Math.cos(gd.ang) * 8)); gd.flair.setAttribute('cy', f1(gd.y + Math.sin(gd.ang) * 8)); if(gd.flair._v !== fa){ gd.flair._v = fa; gd.flair.setAttribute('opacity', fa ? 1 : 0); } }
        gd.g.setAttribute('transform', 'translate(' + f1(gd.x) + ',' + f1(gd.y) + ')');
        gd.rot.setAttribute('transform', 'rotate(' + f1(gd.ang * 57.2958 + 90) + ')');
        if(gd.sorte === 'chien') gd.anim.poser({ph:gd.ph, amp:gd.ampM, t:tJeu, renifle:gd.etat === 'renifle' || gd.etat === 'perplexe' || gd.etat === 'flaire' || (gd.etat === 'pause' && gd.ampM < 0.3), dresse:gd.etat === 'piste' || gd.etat === 'surveille' || gd.etat === 'aboie1' || gd.etat === 'flaire', content:gd.etat === 'perplexe'});
        else if(gd.sorte === 'villageois') gd.anim.poser({ph:gd.ph, amp:gd.ampM, t:tJeu, pose:gd.etat === 'travaille' ? (gd.metier === 'cueille' ? 'cueille' : 'porte') : (gd.etat === 'porte' ? 'porte' : '')});
        else gd.anim.poser({ph:gd.ph, amp:gd.ampM, t:restant * -1});
        if(gd.lant){ var la = gd.sorte === 'lanterne' ? gd.ang + 1.5 : (gd.sorte === 'torche' ? gd.ang + 0.8 : gd.ang + 0.62), lr = gd.sorte === 'lanterne' ? 16 : 18; gd.lant.setAttribute('cx', f1(gd.x + Math.cos(la) * lr)); gd.lant.setAttribute('cy', f1(gd.y + Math.sin(la) * lr)); }
        gd.bulle.setAttribute('transform', 'translate(' + f1(gd.x) + ',' + f1(gd.y - 30) + ')');
      });
      /* le chien : l'odeur monte quand on reste caché au même endroit ; trop longtemps, et il vient renifler */
      var chiens = S.gardes.filter(function(gd){ return gd.sorte === 'chien'; });
      if(chiens.length){
        /* (pas à l'entrée de la pièce : on doit pouvoir y attendre le bon moment pour partir) */
        if(!course && !ici.porte && !ici.entree) odeurT += dt;
        var chasse = chiens.some(function(gd){ return gd.etat === 'flaire' || gd.etat === 'aboie1' || gd.etat === 'piste' || gd.etat === 'renifle' || gd.etat === 'surveille'; });
        if(!chasse && !course && odeurT >= p.odeur){
          var moi = cachetteDe(ici);
          var libres = chiens.filter(function(gd){ return (gd.etat === 'marche' || gd.etat === 'pause') && gd.alerte <= 0 && dist(gd, moi) <= p.flairPortee; });
          if(libres.length){
            var chn = libres.sort(function(a, b){ return dist(a, moi) - dist(b, moi); })[0], aa0 = Math.atan2(chn.y - moi.y, chn.x - moi.x);
            chn.cibleC = ici; chn.cibleP = moi; chn.cible = {x:fixe(moi.x + Math.cos(aa0) * 22, 30, 330), y:fixe(moi.y + Math.sin(aa0) * 22, 50, 450)};
            /* 1. il s'arrête et renifle, museau levé (on le voit bien) */
            chn.etat = 'flaire'; chn.t = 1.3; chn.snifT = 0; chn.bulle.classList.add('doute');
            texte(chn.x, chn.y - 30, 'Snif ? Snif ?', 'ok');
          }
        }
        chiens.forEach(function(gd){
          if(gd.etat === 'flaire'){
            /* des petites bouffées devant sa truffe */
            gd.snifT -= dt;
            if(gd.snifT <= 0){ gd.snifT = 0.22; var nx = gd.x + Math.cos(gd.ang) * 16, ny = gd.y + Math.sin(gd.ang) * 16, sn = svgNoeud('path', {'class':'cc-snif', d:'M0,0 c2,-3 5,-3 6,0 c1,2 4,2 5,0', transform:'translate(' + f1(nx + R(-4, 4)) + ',' + f1(ny + R(-4, 4)) + ') rotate(' + f0(gd.ang * 57.3 + R(-40, 40)) + ')'}, S.c.bulles); (function(n){ P.apres(650, function(){ if(n.parentNode) n.parentNode.removeChild(n); }); })(sn); }
            /* 2. il aboie */
            if(gd.t <= 0){ gd.etat = 'aboie1'; gd.t = 0.55; gd.bulle.classList.remove('doute'); gd.bulle.classList.add('alerte'); P.apres(700, function(){ gd.bulle.classList.remove('alerte'); }); texte(gd.x, gd.y - 32, 'Waf ! Waf !'); U.son('ko'); }
          } else if(gd.etat === 'aboie1' && gd.t <= 0){
            /* 3. il court jusqu'à la cachette */
            gd.etat = 'piste';
          } else if(gd.etat === 'renifle'){
            var pr = fixe(1 - gd.t / p.renifle, 0, 1), cj = gd.cibleC, cpp = cachetteDe(cj);
            gd.jauge.setAttribute('cx', f1(cj.x)); gd.jauge.setAttribute('cy', f1(cj.y)); gd.jauge.setAttribute('opacity', 1);
            gd.jauge.setAttribute('stroke-dasharray', f1(pr * 170) + ' 170');
            if(gd.t <= 0){
              gd.jauge.setAttribute('opacity', 0);
              if(!course && ici === cj){ aboie(gd); gd.etat = 'surveille'; gd.t = 4; }   /* (4 s pour s'en aller avant qu'il ré-aboie) */
              else { gd.etat = 'perplexe'; gd.t = 1.2; gd.phase = 0; gd.base = gd.ang; gd.bulle.classList.add('doute'); texte(cpp.x, cpp.y - 30, 'Personne ?', 'ok'); }
            }
          } else if(gd.etat === 'surveille'){
            if(course || ici !== gd.cibleC){ gd.etat = 'perplexe'; gd.t = 0.8; gd.phase = 0; gd.base = gd.ang; }
            else if(gd.t <= 0){ aboie(gd); gd.t = 4; }
          } else if(gd.etat === 'perplexe' && gd.t <= 0){
            gd.etat = 'marche'; gd.bulle.classList.remove('doute');
            var best = 0; gd.pts.forEach(function(q, i){ if(dist(q, gd) < dist(gd.pts[best], gd)) best = i; }); gd.i = best;
          }
        });
        if(fini) return false;
      }
      /* les villageois : ils vont à un buisson à baies (ou une caisse), y travaillent aussi longtemps que le chien fouille ;
         si le Pisteur est dedans à la fin, ils le trouvent ; sinon le porteur emporte la caisse et la repose ailleurs */
      S.villageois.forEach(function(v){
        if(v.etat === 'pause' && v.t <= 0) choisirTravail(v);
        else if(v.etat === 'va' && v.arrive){
          v.arrive = false;
          if(v.cibleC.emporte || v.cibleC.devoile > tJeu){ v.etat = 'pause'; v.t = 0.6; return; }
          v.etat = 'travaille'; v.t = p.fouille; v.ang = Math.atan2(v.cibleC.y - v.y, v.cibleC.x - v.x); v.baieT = 0;
          if(v.metier === 'cueille') texte(v.x, v.y - 30, U.choix(['Des baies !', 'Miam, des baies !']), 'ok');
        } else if(v.etat === 'travaille'){
          var c = v.cibleC, pr = fixe(1 - v.t / p.fouille, 0, 1);
          v.jauge.setAttribute('cx', f1(c.x)); v.jauge.setAttribute('cy', f1(c.y)); v.jauge.setAttribute('opacity', 1); v.jauge.setAttribute('stroke-dasharray', f1(pr * 182) + ' 182');
          if(v.metier === 'cueille'){
            /* les petites baies rouges volent du buisson au panier */
            v.baieT -= dt;
            if(v.baieT <= 0){ v.baieT = 0.32; var bx = c.x + R(-12, 12), by = c.y + R(-12, 8), pa = v.ang + Math.PI / 2, tx = v.x - Math.cos(v.ang + 0.3) * 4 + Math.cos(pa) * 13, ty = v.y - Math.sin(v.ang + 0.3) * 4 + Math.sin(pa) * 13; var bb = svgNoeud('circle', {'class':'cc-baie', r:2.6, cx:f1(bx), cy:f1(by)}, S.c.bulles); bb.style.setProperty('--dx', f1(tx - bx) + 'px'); bb.style.setProperty('--dy', f1(ty - by) + 'px'); (function(n){ P.apres(600, function(){ if(n.parentNode) n.parentNode.removeChild(n); }); })(bb); }
          } else if(c.g){ c.g.setAttribute('transform', 'translate(' + f1(c.x) + ',' + f1(c.y + Math.sin(tJeu * 20) * 1.2 * pr) + ')'); }
          if(v.t <= 0){
            v.jauge.setAttribute('opacity', 0); v.dernier = c;
            if(!course && ici === c){ trouve(v, c); v.etat = 'pause'; v.t = 2; placer(c); }
            else if(v.metier === 'porte'){
              var np = nouvellePlace(c);
              if(np){ c.emporte = true; v.porteC = c; v.np = np; v.cible = {x:np.x, y:np.y}; v.etat = 'porte'; v.arrive = false; S.c.lant.appendChild(c.g); if(c.an) c.an.setAttribute('display', 'none'); majAnneaux(); texte(v.x, v.y - 30, 'Hop !', 'ok'); }
              else { v.etat = 'pause'; v.t = 1.5; placer(c); }
            } else { v.etat = 'pause'; v.t = R(0.8, 1.8); }
            v.cibleC = null;
          }
        } else if(v.etat === 'porte'){
          var cp2 = v.porteC; cp2.x = v.x + Math.cos(v.ang) * 15; cp2.y = v.y + Math.sin(v.ang) * 15; placer(cp2);
          if(v.arrive){
            v.arrive = false; cp2.x = v.np.x; cp2.y = v.np.y; cp2.k = v.np.k; cp2.emporte = false; placer(cp2); S.c.couverts.appendChild(cp2.g); if(cp2.an) cp2.an.removeAttribute('display');
            poussiere(cp2.x, cp2.y + 10); v.porteC = null; v.etat = 'pause'; v.t = R(1.5, 3); majAnneaux();
            /* (il recule d'un pas pour la poser) */
            v.x -= Math.cos(v.ang) * 6; v.y -= Math.sin(v.ang) * 6;
          }
        }
      });
      if(fini) return false;
      /* la pie bavarde tourne la tête ; elle se repose un peu après avoir crié */
      if(S.pie){
        var pi = S.pie; pi.tg += dt * pi.w; pi.ang = pi.base + Math.sin(pi.tg) * pi.amp; pi.cd = Math.max(0, pi.cd - dt);
        coneD(pi.cone, pi, pi.ang, PIE.L, PIE.h); pi.cone.classList.toggle('alerte', pi.cd > 0);
        pi.rot.setAttribute('transform', 'rotate(' + f1(pi.ang * 57.2958 + 90) + ') scale(.9)');
      }
      /* l'odeur qui monte de la cachette (on comprend que le chien va venir) */
      var od = chiens.length && !course ? fixe((odeurT / p.odeur - 0.25) / 0.75, 0, 1) : 0;
      if(od !== odeurG._o){ odeurG._o = od; odeurG.setAttribute('opacity', f1(od)); }
      if(od > 0) odeurG.setAttribute('transform', 'translate(' + f1(jx) + ',' + f1(jy - 16) + ') scale(' + f1(0.7 + od * 0.5) + ')');
      /* une cachette dévoilée redevient une cachette au bout d'un moment */
      S.couv.forEach(function(c){ if(c.devoile && c.devoile <= tJeu){ c.devoile = 0; if(c.g) c.g.classList.remove('cc-devoile'); if(c.pattes) c.pattes.setAttribute('display', 'none'); majAnneaux(); } });
      /* l'animal qui s'enfuit */
      var an = S.animal;
      if(an && an.fuite){ an.fuite.t += dt; an.x += an.fuite.vx * dt; an.y += an.fuite.vy * dt; an.g.setAttribute('transform', 'translate(' + f1(an.x) + ',' + f1(an.y) + ') rotate(' + f1(an.fuite.a) + ')'); if(an.fuite.t > 1.4){ an.g.setAttribute('display', 'none'); an.fuite = null; } }
      /* le Pisteur */
      if(course){
        course.b = cachetteDe(course.c);
        course.t += dt / course.T;
        var k = Math.min(1, course.t), e = course.retour ? k : (k < .5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2);
        var nx = course.a.x + (course.b.x - course.a.x) * e, ny = course.a.y + (course.b.y - course.a.y) * e;
        var vx = nx - jx, vy = ny - jy, vv = Math.hypot(vx, vy);
        if(vv > 0.05 && !course.retour) jAng += angleNorm(Math.atan2(vy, vx) - jAng) * Math.min(1, dt * 14);
        jPh += vv * 0.42; jAmp += (1 - jAmp) * Math.min(1, dt * 10); jCache += (0 - jCache) * Math.min(1, dt * 12);
        var avant = {x:jx, y:jy};
        jx = nx; jy = ny;
        if(!course.retour){
          S.bruyants.forEach(function(q, i){ if(!course.bruit[i] && dist(q, {x:jx, y:jy}) < 26){ course.bruit[i] = true; U.son(BRUITS[q.type].son); A.secouer(q.g); bruit(q.x, q.y, 200, BRUITS[q.type].txt); } });
          if(an && !an.reveille && dist(an, {x:jx, y:jy}) < 38){
            an.reveille = true; U.son('ko');
            var fa = Math.atan2(an.y - jy, an.x - jx); an.fuite = {t:0, vx:Math.cos(fa) * 150, vy:Math.sin(fa) * 150, a:fa * 57.3 + 90};
            an.g.classList.add('reveille'); bruit(an.x, an.y, 240, ANIMAUX[an.sorte].txt);
          }
          if(coupeFil(avant, {x:jx, y:jy})){ S.fil.tombe = true; S.fil.g.classList.add('tombe'); U.son('cloche'); bruit((S.fil.a.x + S.fil.b.x) / 2, (S.fil.a.y + S.fil.b.y) / 2, 999, 'Ding ! Ding !', true); }
          if(invisT <= 0){ for(var i = 0; i < S.gardes.length; i++){ if(S.gardes[i].alerte <= 0 && voit(S.gardes[i], {x:jx, y:jy})){ repere(S.gardes[i]); break; } } }
          /* la pie bavarde : si on court dans son regard, elle crie, et tous les gardes de la pièce accourent */
          if(invisT <= 0 && course && S.pie && S.pie.cd <= 0 && voitPie(S.pie, S.pie.ang, {x:jx, y:jy})){ S.pie.cd = 3.2; U.son('ko'); A.secouer(S.pie.g); bruit(jx, jy, 999, 'Kra ! Kra !', true); }
        }
        if(!fini && course && course.t >= 1){
          if(!course.retour){
            ici = course.c; odeurT = 0;
            U.son('ok');
            if(ici.porte){
              course = null;
              if(ki >= p.pieces - 1){ fini = true; if(ici.halo) ici.halo.classList.add('ouverte'); U.son('porte'); hud.prog(p.pieces, p.pieces, '🚪'); P.finir({reussi:true, score:1, erreurs:maxVies - vies, detail:'Personne ne t\'a vu !'}, 900); }
              else pieceSuivante();
              dessinerJoueur(dt);
              return;
            }
          }
          course = null;
          S.c.cache.appendChild(joueur);
          majAnneaux();
        }
      } else {
        jAmp += (0 - jAmp) * Math.min(1, dt * 10); jCache += (1 - jCache) * Math.min(1, dt * 8);
        if(ici.mobile){ var cc = cachetteDe(ici); jx = cc.x; jy = cc.y; majAnT += dt; if(majAnT > 0.2){ majAnT = 0; majAnneaux(); } }
      }
      dessinerJoueur(dt);
      /* l'aide : vert si on peut y aller maintenant */
      if(p.aide && !course){ S.couv.forEach(function(c){ if(c.acc && c.an){ var s = surPredit(c); c.an.classList.toggle('sur', s); c.an.classList.toggle('danger', !s); } }); }
    });
    var tAnim = 0;
    function dessinerJoueur(dt){
      tAnim += dt;
      /* caché : la tête se tourne vers le garde le plus proche */
      var regard = 0;
      if(!course && !passage && S.gardes.length){ var g0 = S.gardes.reduce(function(a, b){ return dist(a, {x:jx, y:jy}) < dist(b, {x:jx, y:jy}) ? a : b; }); regard = fixe(angleNorm(Math.atan2(g0.y - jy, g0.x - jx) - jAng) * 57.3, -50, 50); }
      joueur.setAttribute('transform', 'translate(' + f1(jx) + ',' + f1(jy) + ')');
      jRot.setAttribute('transform', 'rotate(' + f1(jAng * 57.2958 + 90) + ') scale(.95)');
      jAnim.poser({ph:jPh, amp:jAmp, t:tAnim, cache:jCache, regard:regard});
      joueur.classList.toggle('cache', !course && !passage);
      if(S.ici){ var vis = !course && !passage; S.ici.setAttribute('cx', f1(jx)); S.ici.setAttribute('cy', f1(jy + 2)); if(S.ici._v !== vis){ S.ici._v = vis; S.ici.setAttribute('opacity', vis ? 1 : 0); } }
    }
    dessinerJoueur(0);
    return {arreter: P.arreter};
  }
});

/* ==========================================================
   L'ÉCRAN D'ACCUEIL (mj-core : MJ.DEMOS) : la main touche une cachette
   entourée de bleu quand la lumière regarde ailleurs ; le Pisteur y court
   (pieds, bras, cape), puis jusqu'à la porte. Le décor suit params.decor.
   ========================================================== */
if(MJ.DEMOS){
  MJ.DEMOS.cachette = {w:300, h:420, f:function(el, prm){
    var decor = prm && PIECES[prm.decor] ? prm.decor : 'ville', NUIT = PIECES[decor].nuit, id = A.nid('ccd'), type = PIECES[decor].types[0];
    var G = [222, 170], DEP = [150, 392], C1 = [206, 296], C2 = [84, 190], PO = [150, 50];
    var liste = COUV_DECOR[decor];
    var anneau = function(c, x, y, r){ return '<circle class="' + c + '" cx="' + x + '" cy="' + y + '" r="' + r + '" fill="#6cb6ff" fill-opacity=".12" stroke="#8ff3ff" stroke-width="3.5" stroke-dasharray="7 6"/>'; };
    el.innerHTML = '<svg class="rg-demo-svg" viewBox="0 0 300 420" preserveAspectRatio="xMidYMid meet">' + defsC(id) +
      '<g transform="translate(-30,0) scale(1,.875)">' + sol(id, decor, type) + bords(id, decor, type) + porteHaut(id, decor, type) + '</g>' +
      '<g class="cdm-bruit" transform="translate(110,250)">' + BRUITS[BRUITS_DECOR[decor][0]].art() + '</g>' +
      '<g transform="translate(' + C1[0] + ',' + C1[1] + ') scale(1.15)">' + COUV[liste[0]]() + '</g>' +
      '<g transform="translate(' + C2[0] + ',' + C2[1] + ') scale(1.15)">' + COUV[liste[1]]() + '</g>' +
      /* le rôdeur (niveau 10) : il se promène, avec sa zone ronde bleu-violet ; le Pisteur court quand il est loin */
      (prm && prm.rodeur ? '<circle class="cc-zone-b cc-zone-b-r cdm-rzb" r="44"/><circle class="cc-rodeur-c cdm-rz" r="44" fill="url(#' + id + 'ro)"/><g class="cdm-r"><g class="cdm-rr">' + gardeDessus(decor, 'rodeur') + '</g></g>' : '') +
      '<g class="cdm-j"><g class="cdm-jr">' + pisteurDessus() + '</g></g>' +
      '<g class="cdm-g" transform="translate(' + G[0] + ',' + G[1] + ')"><g class="cdm-gr">' + gardeDessus(decor) + '</g></g>' +
      (NUIT ? rect(-60, -60, 420, 540, '#0a1030', ' opacity=".38"') : '') +
      '<path class="cdm-cone" fill="' + (NUIT ? '#ffe39a' : '#fffbe8') + '" opacity="' + (NUIT ? '.42' : '.3') + '"/>' +
      anneau('an an0', C1[0], C1[1], 34) + anneau('an an1', C2[0], C2[1], 36) + anneau('an an2', PO[0], PO[1] - 4, 40) +
      '<g class="cdm-ouf" opacity="0"><text x="' + PO[0] + '" y="' + (PO[1] - 44) + '" font-size="30" text-anchor="middle" dominant-baseline="central">✨</text></g>' +
      /* s'il y a un chien à ce niveau : il sent l'odeur du Pisteur caché, vient renifler… trop tard, il est déjà parti */
      (prm && prm.chiens ? '<g class="cc-odeur cdm-od" opacity="0">' + [-7, 0, 7].map(function(x, i){ return '<path class="cc-onde" style="animation-delay:-' + (i * 0.45).toFixed(2) + 's" d="M' + x + ',0 c-3,-4 3,-7 0,-11 c-3,-4 3,-7 0,-11" fill="none" stroke="#d9f7c4" stroke-width="2.4" stroke-linecap="round"/>'; }).join('') + '</g>' +
        '<circle class="cc-jauge cdm-jg" cx="' + C1[0] + '" cy="' + C1[1] + '" r="27" opacity="0"/>' +
        '<g class="cdm-c"><g class="cdm-cr">' + chienDessus() + '</g></g><g class="cdm-cq" opacity="0"><path d="M-11,-12 H11 Q15,-12 15,-8 V6 Q15,10 11,10 H4 L0,16 L-4,10 H-11 Q-15,10 -15,6 V-8 Q-15,-12 -11,-12 Z" fill="#ffd36a"' + st(2.4) + '/><text y="5" text-anchor="middle" font-size="19" font-weight="700" fill="#24182e">?</text></g>' : '') +
      A.MAIN + '</svg>';
    var svg = el.firstChild, q = function(s){ return svg.querySelector(s); };
    var cone = q('.cdm-cone'), jg = q('.cdm-j'), jr = q('.cdm-jr'), gr = q('.cdm-gr'), an = [q('.an0'), q('.an1'), q('.an2')], ouf = q('.cdm-ouf'), main = q('.mja-main');
    var J = Bonhomme(jg), Gb = Bonhomme(q('.cdm-g'));
    var cg = q('.cdm-c'), cr = q('.cdm-cr'), Cb = cg ? Chien(cg) : null, od = q('.cdm-od'), jgC = q('.cdm-jg'), cq = q('.cdm-cq');
    var rg = q('.cdm-r'), rr = q('.cdm-rr'), rz = q('.cdm-rz'), rzb = q('.cdm-rzb'), Rb = rg ? Bonhomme(rg) : null;
    var waf = null; if(Cb){ waf = svgNoeud('text', {'class':'cc-waf', 'text-anchor':'middle', opacity:0}, svg); waf.textContent = 'Waf ! Waf !'; }
    /* le chien : il trotte en bas à gauche, flaire (2,6 s), file vers la cachette, renifle (3,9 → 4,9), reste perplexe, repart */
    /* (6 nov., 10 h 50 : il s'arrête et renifle museau levé (2,5 → 3,1), aboie (« Waf ! »), court (3,3 → 3,8), fouille) */
    var CD = [[0, [24, 350]], [2.5, [66, 350]], [3.3, [66, 350]], [3.8, [C1[0] - 26, C1[1] + 8]], [5.6, [C1[0] - 26, C1[1] + 8]], [8, [24, 350]]];
    function chienEn(t){ for(var i = 0; i < CD.length - 1; i++){ if(t >= CD[i][0] && t < CD[i + 1][0]){ var u = (t - CD[i][0]) / (CD[i + 1][0] - CD[i][0]), a = CD[i][1], b = CD[i + 1][1]; return {x:a[0] + (b[0] - a[0]) * u, y:a[1] + (b[1] - a[1]) * u, m:a[0] !== b[0] || a[1] !== b[1], a:Math.atan2(b[1] - a[1], b[0] - a[0])}; } } return {x:CD[0][1][0], y:CD[0][1][1], m:false, a:0}; }
    var cAng = 0, cPh = 0;
    main.style.transition = 'none';
    function lis(u){ u = fixe(u, 0, 1); return u * u * (3 - 2 * u); }
    function entre(t, a, b){ return lis((t - a) / (b - a)); }
    var A_C1 = Math.atan2(C1[1] - G[1], C1[0] - G[0]), A_LOIN = .1;
    function angle(t){
      if(t < 1.0) return A_C1;
      if(t < 1.5) return A_C1 + (A_LOIN - A_C1) * entre(t, 1, 1.5);
      if(t < 2.5) return A_LOIN;
      if(t < 3.0) return A_LOIN + (A_C1 - A_LOIN) * entre(t, 2.5, 3);
      if(t < 3.2) return A_C1;
      if(t < 3.7) return A_C1 + (A_LOIN - A_C1) * entre(t, 3.2, 3.7);
      if(t < 6.8) return A_LOIN + .25 * Math.sin((t - 3.7) * 1.2);
      return A_LOIN + (A_C1 - A_LOIN) * entre(t, 6.8, 7.6);
    }
    var etapes = [[0, DEP, 0], [1.8, DEP, 1], [2.4, [C1[0] + 5, C1[1] - 17], 0], [4.0, [C1[0] + 5, C1[1] - 17], 1], [4.6, [C2[0] + 5, C2[1] - 17], 0], [5.1, [C2[0] + 5, C2[1] - 17], 1], [5.8, [PO[0], PO[1] + 10], 0]];
    function pos(t){
      for(var i = etapes.length - 1; i >= 0; i--){ if(t >= etapes[i][0]){ var a = etapes[i], b = etapes[i + 1]; if(!b || !a[2]) return {p:a[1], c:!b ? 1 : 1, m:false}; var u = lis((t - a[0]) / (b[0] - a[0])); return {p:[a[1][0] + (b[1][0] - a[1][0]) * u, a[1][1] + (b[1][1] - a[1][1]) * u], c:0, m:true, a:Math.atan2(b[1][1] - a[1][1], b[1][0] - a[1][0])}; } }
      return {p:DEP, c:1, m:false};
    }
    var tapes = [1.65, 3.85, 4.9], mains = [[0, 262, 400], [1.25, 262, 400], [1.65, C1[0], C1[1] + 6], [2.3, 262, 400], [3.5, 262, 400], [3.85, C2[0], C2[1] + 8], [4.4, PO[0] + 30, PO[1] + 40], [4.9, PO[0], PO[1] + 6], [5.6, 262, 400], [8, 262, 400]];
    var jAng = -Math.PI / 2, ph = 0, last = 0;
    var stop = U.boucle(function(dt, T){
      if(!svg.isConnected) return false;
      var t = T % 8;
      var a = angle(t), L = 175, h = .42;
      cone.setAttribute('d', 'M' + f1(G[0]) + ',' + f1(G[1]) + ' L' + f1(G[0] + L * Math.cos(a - h)) + ',' + f1(G[1] + L * Math.sin(a - h)) + ' A' + L + ',' + L + ' 0 0 1 ' + f1(G[0] + L * Math.cos(a + h)) + ',' + f1(G[1] + L * Math.sin(a + h)) + ' Z');
      gr.setAttribute('transform', 'rotate(' + f1(a * 57.3 + 90) + ') scale(1.4)');
      Gb.poser({ph:T * 2, amp:0, t:T});
      var ps = pos(t);
      if(ps.m){ jAng += angleNorm(ps.a - jAng) * Math.min(1, dt * 12); ph += dt * 14; }
      if(t < last){ jAng = -Math.PI / 2; } last = t;
      jg.setAttribute('transform', 'translate(' + f1(ps.p[0]) + ',' + f1(ps.p[1]) + ')');
      jr.setAttribute('transform', 'rotate(' + f1(jAng * 57.3 + 90) + ') scale(1.5)');
      J.poser({ph:ph, amp:ps.m ? 1 : 0, t:T, cache:ps.m ? 0 : 1});
      an.forEach(function(n){ n.setAttribute('stroke-dashoffset', f1(-T * 14)); });
      an[0].setAttribute('opacity', t < 1.9 ? 1 : 0); an[1].setAttribute('opacity', t > 2.4 && t < 4.1 ? 1 : 0); an[2].setAttribute('opacity', t > 4.6 && t < 5.2 ? 1 : 0);
      ouf.setAttribute('opacity', f1(entre(t, 5.8, 6.1) * (1 - entre(t, 6.9, 7.2))));
      /* la main */
      var m = mains[0];
      for(var i = 0; i < mains.length - 1; i++){ if(t >= mains[i][0] && t <= mains[i + 1][0]){ var u = lis((t - mains[i][0]) / (mains[i + 1][0] - mains[i][0])); m = [0, mains[i][1] + (mains[i + 1][1] - mains[i][1]) * u, mains[i][2] + (mains[i + 1][2] - mains[i][2]) * u]; break; } }
      main.style.transform = 'translate(' + f1(m[1]) + 'px,' + f1(m[2]) + 'px)';
      var tape = tapes.some(function(x){ return t >= x && t < x + .3; });
      main.classList.toggle('appuie', tape);
      if(Rb){
        /* (il fait une boucle en bas à droite ; quand le Pisteur court, il est de l'autre côté) */
        var th = 2 * Math.PI * (t - 2.1) / 8, rx = 236 + 22 * Math.cos(th), ryy = 354 + 38 * Math.sin(th), ra = Math.atan2(38 * Math.cos(th), -22 * Math.sin(th));
        rg.setAttribute('transform', 'translate(' + f1(rx) + ',' + f1(ryy) + ')'); rr.setAttribute('transform', 'rotate(' + f1(ra * 57.3 + 90) + ') scale(1.4)');
        [rz, rzb].forEach(function(c){ c.setAttribute('cx', f1(rx)); c.setAttribute('cy', f1(ryy)); });
        Rb.poser({ph:T * 6, amp:1, t:T});
      }
      if(Cb){
        var cp = chienEn(t), renif = (t >= 3.8 && t < 5.6) || (t >= 2.5 && t < 3.1), versC = Math.atan2(C1[1] - cp.y, C1[0] - cp.x);
        if(cp.m){ cAng += angleNorm(cp.a - cAng) * Math.min(1, dt * 8); cPh += dt * (t > 3.3 && t < 3.8 ? 22 : 9); }
        else if(t >= 2.5) cAng += angleNorm(versC - cAng) * Math.min(1, dt * 5);
        cg.setAttribute('transform', 'translate(' + f1(cp.x) + ',' + f1(cp.y + (t > 3.1 && t < 3.3 ? -4 * Math.sin((t - 3.1) / 0.2 * Math.PI) : 0)) + ')');
        cr.setAttribute('transform', 'rotate(' + f1(cAng * 57.3 + 90) + ') scale(1.4)');
        Cb.poser({ph:cPh, amp:cp.m ? 1 : 0, t:T, renifle:renif, dresse:t >= 2.5 && t < 3.8, content:t >= 4.9 && t < 5.6});
        od.setAttribute('opacity', f1(t > 1.6 && t < 4.0 ? Math.min(1, (t - 1.6) / 0.8) : 0)); od.setAttribute('transform', 'translate(' + (C1[0] + 5) + ',' + (C1[1] - 34) + ')');
        jgC.setAttribute('opacity', t >= 3.8 && t < 4.9 ? 1 : 0); jgC.setAttribute('stroke-dasharray', f1(fixe((t - 3.8) / 1.1, 0, 1) * 170) + ' 170');
        cq.setAttribute('opacity', (t >= 2.5 && t < 3.1) || (t >= 4.9 && t < 5.6) ? 1 : 0); cq.setAttribute('transform', 'translate(' + f1(cp.x) + ',' + f1(cp.y - 36) + ')');
        waf.setAttribute('opacity', t >= 3.1 && t < 3.7 ? 1 : 0); waf.setAttribute('transform', 'translate(' + f1(cp.x) + ',' + f1(cp.y - 34) + ')');
      }
    });
    return {arreter:function(){ stop(); }};
  }};
}
})();
