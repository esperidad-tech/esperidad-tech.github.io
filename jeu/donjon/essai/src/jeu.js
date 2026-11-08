/* La salle des rats — prototype jouable d'une salle de combat du donjon (Brumeval).
   Les dessins sont des PNG faits d'avance (construire.py) ; ici, seulement du DOM, des transform et des opacity. */
(function(){
'use strict';

/* ================= les réglages ================= */
var SALLE = window.SALLE = {hasard:function(){ return Math.random(); }, vitesse:1};
function R(){ return SALLE.hasard(); }
function attendre(ms){ return new Promise(function(ok){ setTimeout(ok, ms / SALLE.vitesse); }); }
function choix(t){ return t[Math.floor(R() * t.length) % t.length]; }

var HER = {
  sage:{nom:'Sage', le:'le Sage', Le:'Le Sage', au:'au Sage', du:'du Sage', pv:90, x:0, coul:'#6cb6ff', tete:[137.6, 84.8], gestes:['etudier', 'rune', 'bouclier'], sac:null},
  alchimiste:{nom:'Alchimiste', le:'l\'Alchimiste', Le:'L\'Alchimiste', au:'à l\'Alchimiste', du:'de l\'Alchimiste', pv:100, x:138, coul:'#b48cff', tete:[139.2, 88], gestes:['louche', 'herbes'], sac:'Lancer une potion'},
  pisteur:{nom:'Pisteur', le:'le Pisteur', Le:'Le Pisteur', au:'au Pisteur', du:'du Pisteur', pv:120, x:276, coul:'#5fcf86', tete:[139.2, 86.4], gestes:['fleche', 'dague'], sac:'Flèche trempée'}
};
var ORDRE = ['sage', 'alchimiste', 'pisteur'];            /* de gauche à droite */
var EXPOSES = ['pisteur', 'alchimiste', 'sage'];          /* du plus exposé au moins exposé */
var VISEE = {pisteur:6, alchimiste:2.5, sage:1.5};        /* les rats visent plutôt celui de devant */
var PIED = 338;

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
  fumigene:{nom:'Fumigène', d:'un gros nuage', long:'Un gros nuage, dans toute la salle.', cible:'salle', fleche:false, coul:'#b8bedc'},
  huile:{nom:'Huile', d:'ça glisse !', long:'Ça glisse, ça glisse…', cible:'rat', fleche:true, coul:'#f2b630'},
  colle:{nom:'Colle', d:'pattes collées', long:'Les pattes restent collées au sol.', cible:'rat', fleche:true, coul:'#ece4d0'},
  baume:{nom:'Baume', d:'soigne beaucoup', long:'Il soigne beaucoup un ami.', cible:'heros', fleche:false, coul:'#5fd08a'},
  coeur:{nom:'Cœur vaillant', d:'relève un ami', long:'Il relève un ami tombé au sol.', cible:'sol', fleche:false, coul:'#ff5a7a'}
};
var ORDRE_REC = ['feu', 'fumigene', 'huile', 'colle', 'baume', 'coeur'];
var LIVRE = [
  'Les rats vivent dans le noir. Ce qui brille leur fait peur : ils se dressent, le ventre à l\'air.',
  'Un grand bruit les affole : ils mordent deux fois.'
];
/* les rats : 1 devant, 2 au milieu, 3 derrière (x = gauche du dessin, pied = ligne des pattes, w = largeur) */
var POS_R = [{x:494, pied:338, w:206, z:4}, {x:620, pied:342, w:210, z:5}, {x:746, pied:346, w:214, z:6}];
var NOM_R = ['le rat de devant', 'le rat du milieu', 'le rat du fond'];
var RAT_PV = 40;
function rH(i){ return POS_R[i].w * 148 / 300; }
function rTop(i){ return POS_R[i].pied - rH(i) * 0.946; }
function rCx(i){ return POS_R[i].x + POS_R[i].w * 0.58; }
function rCy(i){ return rTop(i) + rH(i) * 0.55; }
function hCx(h){ return HER[h].x + 99; }

/* ================= l'état ================= */
var E = SALLE.etat = {
  ecran:'sac', sac:[], essai:1, tour:0, toursTotal:0, livre:0, ratsVaincus:[false, false, false],
  h:{}, r:[], mode:'', sel:null, geste:null, occupe:false, texte:''
};

/* ================= outils ================= */
var jeu, monde, secousse, fx, fxHaut, bandeEl, bulleTxt, fenetre;
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
function griser(src){
  return new Promise(function(ok){
    var im = new Image();
    im.onload = function(){
      try{
        var c = document.createElement('canvas'); c.width = im.width; c.height = im.height;
        var g = c.getContext('2d'); g.drawImage(im, 0, 0);
        var d = g.getImageData(0, 0, c.width, c.height), p = d.data;
        for(var i = 0; i < p.length; i += 4){ var y = (p[i] * .3 + p[i + 1] * .59 + p[i + 2] * .11) * .66; p[i] = y + 6; p[i + 1] = y + 4; p[i + 2] = y + 16; }
        g.putImageData(d, 0, 0);
        if(c.toBlob) c.toBlob(function(b){ ok(b ? URL.createObjectURL(b) : c.toDataURL()); });
        else ok(c.toDataURL());
      }catch(e){ ok(src); }
    };
    im.onerror = function(){ ok(src); };
    im.src = src;
  });
}
var pret = Promise.resolve();
function chargerImages(){
  var I = window.IMAGES || {};
  Object.keys(I).forEach(function(k){ URL_IMG[k] = versBlob(I[k]); });
  var css = '';
  ORDRE.forEach(function(h){ css += '.img-' + h + '{background-image:url(' + URL_IMG['heros-' + h] + ')}'; });
  css += '.img-rat{background-image:url(' + URL_IMG.rat + ')}';
  var st = el('style'); st.textContent = css; document.head.appendChild(st);
  pret = Promise.all(ORDRE.map(function(h){ return griser(URL_IMG['heros-' + h]).then(function(u){ URL_IMG['gris-' + h] = u; }); }));
}
/* une tête de héros découpée dans son grand dessin (280 x 320) : taille t, fenêtre f autour de la tête */
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
  var debout = h > w * 1.05;
  q('#tourne').hidden = !debout;
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
  var premier = E.essai === 1 && !E.sacAvant;
  var phrase = premier ? 'Avant de descendre, l\'Alchimiste remplit son sac : trois recettes, pas une de plus.'
    : 'L\'Alchimiste vide son sac sur la table. Les mêmes recettes, ou d\'autres ? Trois, pas une de plus.';
  s.innerHTML = '<img class="fond" src="' + URL_IMG.decor + '" alt=""><div class="voile"></div>' +
    '<h1>Le sac d\'alchimiste</h1>' +
    '<div class="bulle"><span class="txt"></span>' + '<button class="lire" data-act="lire-bulle" aria-label="Écouter">🔊</button></div>' +
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
  conte(phrase);
  if(E.sacAvant) E.sac = E.sacAvant.slice();
  majSac();
}
function majSac(neuve){
  qa('#sac .recette').forEach(function(b){ var c = E.sac.indexOf(b.getAttribute('data-id')) >= 0; b.classList.toggle('choisie', c); b.classList.toggle('guide', !c && E.sac.length < 3); });
  q('#sac .sac-cases').innerHTML = [0, 1, 2].map(function(k){
    var id = E.sac[k];
    return id ? '<div class="sac-case pleine' + (id === neuve ? '' : '" style="animation:none') + '"><img src="' + URL_IMG['potion-' + id] + '" alt=""></div>' : '<div class="sac-case"></div>';
  }).join('');
  var n = E.sac.length, b = q('#sac .aller');
  b.disabled = n < 3;
  b.classList.toggle('guide', n === 3);
  q('#sac .compte').innerHTML = '🎒 <b>' + n + '</b> / <b>3</b>';
}
function toucherRecette(id, bouton){
  var k = E.sac.indexOf(id);
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
function debutCombat(){
  E.sacAvant = E.sac.slice();
  E.tour = 0; E.mode = ''; E.sel = null; E.geste = null; E.occupe = true;
  E.h = {};
  ORDRE.forEach(function(h){ E.h[h] = {pv:HER[h].pv, sol:false, joue:false, bouclier:false}; });
  E.r = [0, 1, 2].map(function(i){ return {i:i, pv:RAT_PV, mort:E.ratsVaincus[i], ouvert:false, comment:'', affole:false, colle:false, vise:null}; });
  pret.then(function(){
    construireCombat();
    var n = vivants().length;
    var intro = n === 3 ? 'Trois rats d\'égout sortent du noir ! Au-dessus de chacun, on voit qui il veut mordre.'
      : n === 2 ? 'Les deux rats qui restent vous attendaient. Au-dessus de chacun, on voit qui il veut mordre.'
      : 'Le dernier rat vous attendait, tout seul et très en colère.';
    nouveauTour(intro);
  });
}
function vivants(){ return E.r.filter(function(r){ return !r.mort; }); }
function devant(){ return vivants()[0] || null; }
function debout(){ return ORDRE.filter(function(h){ return !E.h[h].sol; }); }
function dispo(){ return ORDRE.filter(function(h){ return !E.h[h].sol && !E.h[h].joue; }); }

function construireCombat(){
  E.ecran = 'combat';
  jeu.innerHTML = '';
  var c = el('div', 'ecran'); c.id = 'combat';
  c.innerHTML = '<div id="monde"><div id="secousse"><img class="decor" src="' + URL_IMG.decor + '" alt=""><div id="persos"></div><div id="fx"></div></div></div>' +
    '<div id="flash"></div><div id="critique"><b>CRITIQUE !</b></div>' +
    '<div id="haut"><div id="salle-nom"><b>Salle des rats</b><span id="tour-nom"></span></div>' +
    '<div class="bulle"><span class="txt"></span><button class="lire" data-act="lire-bulle" aria-label="Écouter">🔊</button></div>' +
    '<button id="fuite" class="sombre" data-act="fuite">🏃 Fuite !</button></div>' +
    '<div id="bande"></div><div id="fx-haut"></div>';
  jeu.appendChild(c);
  monde = q('#monde'); secousse = q('#secousse'); fx = q('#fx'); fxHaut = q('#fx-haut'); bandeEl = q('#bande'); bulleTxt = q('#haut .bulle .txt');
  var p = q('#persos');
  ORDRE.forEach(function(h){
    var d = el('div', 'perso heros h-' + h);
    d.setAttribute('data-h', h);
    d.style.left = (HER[h].x - 40) + 'px'; d.style.zIndex = 10 + ORDRE.indexOf(h);
    d.innerHTML = '<div class="ombre"></div><div class="anneau"><i></i></div><div class="bouclier"><i></i></div>' +
      '<div class="flotte"><div class="bouge"><div class="pose"><div class="tourne"><img class="clair" src="' + URL_IMG['heros-' + h] + '" alt=""><img class="gris" src="' + URL_IMG['gris-' + h] + '" alt=""></div></div><div class="cri">Fuite !</div></div></div>' +
      '<div class="check">✓</div><div class="etoiles">💫</div>';
    p.appendChild(d);
    var z = el('div', 'zone'); z.setAttribute('data-act', 'perso'); z.setAttribute('data-type', 'heros'); z.setAttribute('data-id', h);
    z.style.cssText = 'left:' + (hCx(h) - 58) + 'px;top:96px;width:116px;height:276px';
    p.appendChild(z);
    var pv = el('div', 'pv'); pv.id = 'pv-' + h; pv.style.left = hCx(h) + 'px';
    pv.innerHTML = '<span class="bouc">🛡️</span><div class="barre"><i></i></div><b></b>';
    p.appendChild(pv);
  });
  E.r.forEach(function(r){
    if(r.mort) return;
    var i = r.i, P = POS_R[i], h = rH(i);
    var d = el('div', 'perso rat r-' + i);
    d.style.cssText = 'left:' + P.x + 'px;top:' + rTop(i).toFixed(1) + 'px;width:' + P.w + 'px;height:' + h.toFixed(1) + 'px;z-index:' + P.z;
    d.innerHTML = '<div class="ombre" style="left:14%;width:76%;top:86%;height:16%"></div><div class="colle" style="top:84%"></div>' +
      '<div class="anneau" style="left:' + (P.w * 0.58 - 65).toFixed(1) + 'px;top:' + (h * 0.946 - 14).toFixed(1) + 'px"><i></i></div>' +
      '<div class="flotte"><div class="bouge"><div class="tremble"><div class="pose"><div class="rage"></div><img src="' + URL_IMG.rat + '" alt=""><div class="ventre"></div></div></div></div></div>';
    p.appendChild(d);
    var b = el('div', 'badges'); b.id = 'badges-' + i;
    b.style.left = rCx(i) + 'px'; b.style.top = (rTop(i) - 40) + 'px'; b.style.zIndex = 25;
    p.appendChild(b);
    var z = el('div', 'zone'); z.setAttribute('data-act', 'perso'); z.setAttribute('data-type', 'rat'); z.setAttribute('data-id', String(i));
    z.style.cssText = 'left:' + (rCx(i) - 56) + 'px;top:' + (rTop(i) - 44) + 'px;width:112px;height:' + (372 - rTop(i) + 44) + 'px';
    p.appendChild(z);
    var pv = el('div', 'pv monstre'); pv.id = 'pv-r' + i; pv.style.left = rCx(i) + 'px';
    pv.innerHTML = '<div class="barre"><i></i></div><b></b>';
    p.appendChild(pv);
  });
  majBarres();
}
function heroEl(h){ return q('.h-' + h); }
function ratEl(r){ return q('.r-' + r.i); }

function majBarres(){
  ORDRE.forEach(function(h){
    var e = q('#pv-' + h); if(!e) return;
    var s = E.h[h], k = s.pv / HER[h].pv, i = q('i', e);
    i.style.transform = 'scaleX(' + k + ')';
    i.className = k <= .25 ? 'bas' : k <= .5 ? 'moyen' : '';
    q('b', e).textContent = s.pv;
    e.classList.toggle('protege', !!s.bouclier);
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
    if(r.affole) s += '<span class="etat">💢×2</span>';
    if(r.colle) s += '<span class="etat e-colle"><img src="' + URL_IMG['potion-colle'] + '" alt=""></span>';
    b.innerHTML = s;
  });
}
function majScene(){
  var m = E.mode, g = E.geste;
  var cibles = ciblesValides();
  ORDRE.forEach(function(h){
    var e = heroEl(h), s = E.h[h]; if(!e) return;
    var tourHeros = m === 'qui' || m === 'gestes' || m === 'cible' || m === 'action';
    e.classList.toggle('joue', tourHeros && s.joue && !s.sol);
    e.classList.toggle('sol', s.sol);
    e.classList.toggle('protege', !!s.bouclier);
    var d = (m === 'qui' && !s.sol && !s.joue) || (m === 'cible' && cibles.heros.indexOf(h) >= 0);
    e.classList.toggle('dispo', d);
    e.classList.toggle('actif', (m === 'gestes' || (m === 'cible' && !d) || m === 'action') && E.sel === h);
  });
  E.r.forEach(function(r){
    var e = ratEl(r); if(!e) return;
    e.classList.toggle('dispo', m === 'cible' && cibles.rats.indexOf(r.i) >= 0);
    e.classList.toggle('affole', r.affole);
    e.classList.toggle('colle', r.colle);
  });
  majBadges();
  var t = q('#tour-nom'); if(t) t.innerHTML = 'Tour ' + E.tour + (E.essai > 1 ? ' <i>·</i> Essai ' + E.essai : '');
  var f = q('#fuite'); if(f) f.disabled = E.occupe;
}
/* qui peut-on viser avec le geste choisi ? */
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
        '<b>' + HER[h].nom + '</b>' + pvB(h) + '<em>' + etat + '</em>' + (j && !st.sol ? '<span class="ok">✓</span>' : '') + '</button>';
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
  var debuts = ['Les rats grincent des dents… Chacun a choisi sa proie.', 'Ça sent le fromage moisi et la bagarre.', 'Les moustaches frémissent. Les yeux rouges vous fixent.', 'Un rat se lèche les babines. Ce n\'est pas bon signe.'];
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
    if(E.mode === 'qui' || E.mode === 'gestes' || E.mode === 'cible'){ if(id !== E.sel || E.mode === 'qui') choisirHeros(id); return; }
    return;
  }
  var r = E.r[+id]; if(!r || r.mort) return;
  if(E.mode === 'cible' && cb.rats.indexOf(r.i) >= 0) return agir(E.sel, E.geste, {rat:r});
  if(E.mode === 'cible' && typeCible(E.geste) === 'devant'){ conte('Trop loin ! Seul le rat de devant est à portée.'); return; }
  if(E.mode === 'qui' || E.mode === 'gestes' || E.mode === 'cible'){
    var t = 'Ce rat a l\'œil sur ' + HER[r.vise].le + '.';
    if(r.ouvert) t = 'Ce rat est ventre à l\'air ! Il ne fait plus le malin.';
    else if(r.colle) t = 'Ce rat a les pattes collées. Il enrage.';
    else if(r.affole) t = 'Ce rat est fou furieux : il mordra deux fois !';
    conte(t);
  }
}

/* ---------------- les gestes ---------------- */
function agir(h, g, c){
  E.occupe = true; E.mode = 'action';
  bande(); majScene();
  var p;
  try{ p = faire(h, g, c); }catch(e){ console.error(e); p = Promise.resolve(); }
  return p.then(function(){
    E.h[h].joue = true;
    return attendre(380);
  }).then(apres).catch(function(e){ console.error(e); E.h[h].joue = true; apres(); });
}
function apres(){
  if(!vivants().length) return victoire();
  E.sel = null; E.geste = null;
  if(!dispo().length) return tourDesRats();
  E.mode = 'qui'; E.occupe = false;
  bande(); majScene(); majBarres();
}
function faire(h, g, c){
  var r = c.rat, cible = c.heros;
  var debut = {etudier:'Le Sage observe le rat de près… de très près.', rune:'Le Sage trace une rune dans l\'air…', louche:'L\'Alchimiste lève sa grosse louche…',
    fleche:'Le Pisteur bande son arc…', dague:'Le Pisteur bondit, la dague en avant !'};
  if(debut[g]) conte(debut[g]);
  if(g.indexOf('p:') === 0) conte(h === 'pisteur' ? 'Le Pisteur trempe sa flèche dans la potion…' : 'L\'Alchimiste prépare sa potion… blub, blub !');
  if(g === 'etudier') return etudier(r);
  if(g === 'rune') return rune(r);
  if(g === 'bouclier') return bouclier(cible);
  if(g === 'louche') return louche();
  if(g === 'herbes') return soin('alchimiste', cible, 20, 'herbes');
  if(g === 'fleche') return fleche(r, null);
  if(g === 'dague') return dague(devant());
  var id = g.slice(2);
  if(h === 'pisteur') return fleche(r, id);
  return lancer(id, c);
}

/* Le Sage étudie : le Grand Livre se remplit */
function etudier(r){
  var h = 'sage';
  lueur(HER[h].x + 122, 214, 'rgba(143,243,255,.9)', 90);
  var x0 = HER[h].x + 122, y0 = 214, x1 = rCx(r.i), y1 = rCy(r.i);
  var loupe = el('div', 'fx page-vol', '🔍'); fx.appendChild(loupe);
  return vol(loupe, x0, y0, x1, y1 - 20, 40, 420, 0).then(function(){
    mot(x1, y1 - 50, '?', 'croc');
    return attendre(350);
  }).then(function(){
    loupe.remove();
    if(E.livre >= LIVRE.length){ conte('Le Sage relit tout. Le Grand Livre n\'en dit pas plus sur les rats.'); return attendre(400); }
    var ligne = LIVRE[E.livre];
    E.livre++;
    conte('Le Grand Livre dit : « ' + ligne + ' »');
    var b = q('.b-livre'), bx = 905, by = 462;
    if(b){ var rb = b.getBoundingClientRect(), rj = jeu.getBoundingClientRect(), k = rj.width / 960; bx = (rb.left + rb.width / 2 - rj.left) / k; by = (rb.top + rb.height / 2 - rj.top) / k; }
    var page = el('div', 'fx page-vol', '📜'); fxHaut.appendChild(page);
    return vol(page, x1, y1 - 30, bx, by, 120, 650, 360).then(function(){
      page.remove(); bande();
      var nb = q('.b-livre'); if(nb) relancer(nb, 'neuf');
      return attendre(900);
    });
  });
}
/* Le Sage : la rune de lumière ouvre le point faible */
function rune(r){
  var h = 'sage', x0 = HER[h].x + 181, y0 = 173, x1 = rCx(r.i), y1 = rCy(r.i);
  avance(h, 14);
  var o = el('div', 'fx orbe'); fx.appendChild(o);
  return vol(o, x0, y0, x1, y1, 30, 360, 0).then(function(){
    o.remove();
    eclat(x1, y1, 220, 'radial-gradient(closest-side,#fff,rgba(191,248,255,.9) 30%,rgba(63,208,255,.4) 60%,rgba(63,208,255,0))');
    if(r.ouvert){ conte('Ce rat est déjà dressé, ébloui comme une chouette en plein midi.'); return attendre(500); }
    ouvrir(r, 'rune');
    conte('La rune éclate de lumière : le rat se dresse, le ventre à l\'air !');
    return attendre(800);
  });
}
function ouvrir(r, comment){
  r.ouvert = true; r.comment = comment;
  var e = ratEl(r); if(!e) return;
  e.classList.remove('dresse', 'dos');
  e.classList.add(comment === 'huile' ? 'dos' : 'dresse');
  mot(rCx(r.i) - 40, rTop(r.i) - 6, '!');
}
function fermer(r){
  var dos = r.comment === 'huile';
  r.ouvert = false; r.comment = '';
  var e = ratEl(r); if(!e) return;
  e.classList.remove('dresse', 'dos');
  if(dos){ relancer(e, 'releve'); setTimeout(function(){ e.classList.remove('releve'); }, 600); }
}
/* Le Sage : le bouclier de runes */
function bouclier(h){
  avance('sage', 10);
  eclat(hCx(h), 210, 200, 'radial-gradient(closest-side,rgba(191,248,255,.9),rgba(63,208,255,.35) 60%,rgba(63,208,255,0))');
  E.h[h].bouclier = true;
  majScene(); majBarres();
  conte('Des runes bleues tournent autour ' + HER[h].du + '. Les dents vont glisser dessus !');
  return attendre(900);
}
/* L'Alchimiste : le coup de louche (BONG !) */
function louche(){
  var r = devant(), h = 'alchimiste', dx = Math.min(200, rCx(r.i) - hCx(h) - 120);
  var b = q('.bouge', heroEl(h));
  b.style.transition = 'transform .18s ease-in'; b.style.transform = 'translateX(' + dx + 'px)';
  return attendre(190).then(function(){
    var x = rCx(r.i) - 20, y = rCy(r.i) - 10;
    mot(x, y - 40, 'BONG !');
    for(var k = 0; k < 3; k++) (function(k){ setTimeout(function(){ var o = el('div', 'onde-son'); o.style.left = x + 'px'; o.style.top = y + 'px'; fx.appendChild(o); setTimeout(function(){ o.remove(); }, 950); }, k * 140 / SALLE.vitesse); })(k);
    relancer(secousse, 'secoue');
    b.style.transition = 'transform .3s ease-out'; b.style.transform = '';
    var v = vivants();
    v.forEach(function(x){ x.affole = true; });
    majScene();
    var n = r.ouvert ? 10 : 2;
    return blesser(r, n, n > 5 ? '' : 'petit').then(function(){
      var reste = vivants().length;
      conte(reste >= 3 ? 'BONG ! Les trois rats deviennent fous furieux…' : reste === 2 ? 'BONG ! Les deux rats deviennent fous furieux…' : reste === 1 ? 'BONG ! Le rat devient fou furieux…' : 'BONG ! Et voilà le travail.');
      return attendre(700);
    });
  }).then(function(){ b.style.transition = ''; });
}
/* les soins (Herbes, Baume, Cœur vaillant) */
function soin(de, h, n, quoi){
  var s = E.h[h], avant = s.pv;
  var relever = quoi === 'coeur';
  if(relever){ s.sol = false; s.pv = 40; }
  else s.pv = Math.min(HER[h].pv, s.pv + n);
  var gagne = s.pv - (relever ? 0 : avant);
  var x = hCx(h), y = 200;
  for(var k = 0; k < 6; k++) (function(k){
    var e = el('div', 'etincelle', quoi === 'herbes' ? '🌿' : quoi === 'coeur' ? '💖' : '✨');
    e.style.left = (x - 50 + k * 20) + 'px'; e.style.top = (y + 40 - (k % 3) * 24) + 'px'; e.style.animationDelay = (k * 60) + 'ms';
    fx.appendChild(e); setTimeout(function(){ e.remove(); }, 1200);
  })(k);
  chiffre(x, y - 30, '+' + gagne, 'soin');
  majScene(); majBarres();
  if(relever) conte('Le Cœur vaillant bat fort : ' + HER[h].le + ' se relève avec 40 PV !');
  else if(gagne === 0) conte(HER[h].Le + ' est déjà en pleine forme. Au moins, ça sent bon.');
  else if(quoi === 'herbes') conte('Une poignée d\'herbes qui sentent bon : +' + gagne + ' pour ' + HER[h].le + '.');
  else conte('Le Baume fait son effet : +' + gagne + ' pour ' + HER[h].le + '.');
  return attendre(900);
}
/* Le Pisteur : la flèche (et la flèche trempée dans une potion) */
function fleche(r, potion){
  var h = 'pisteur', x0 = HER[h].x + 197, y0 = 185, x1 = rCx(r.i) - 24, y1 = rCy(r.i);
  var coul = potion ? RECETTES[potion].coul : '#f3e7cb';
  var f = el('div', 'fx fleche', '<svg viewBox="0 0 62 14"><path d="M2 7 L 50 7" stroke="#24182e" stroke-width="6" stroke-linecap="round"/><path d="M2 7 L 50 7" stroke="#d9b46a" stroke-width="2.6" stroke-linecap="round"/>' +
    (potion ? '<circle cx="54" cy="7" r="8" fill="' + coul + '" opacity=".55"/>' : '') + '<path d="M60 7 L 47 1 L 48 13 Z" fill="' + (potion ? coul : '#c8d2e4') + '" stroke="#24182e" stroke-width="2" stroke-linejoin="round"/><path d="M4 7 L -6 1 L -2 7 L -6 13 Z" fill="#e04a3a" stroke="#24182e" stroke-width="1.6"/></svg>');
  fx.appendChild(f);
  avance(h, -10);
  var surprise = !potion && !r.ouvert && R() < 1 / 8;
  return vol(f, x0, y0, x1, y1, 16, 230, 0, true).then(function(){
    f.remove();
    if(r.ouvert) return critique(r, 'Pile dans le ventre !');
    if(surprise) return critique(r, 'La flèche trouve la faille ! Coup de chance… ou de génie ?');
    if(potion) return effetPotion(potion, r);
    return blesser(r, 3).then(function(){ conte(choix(['La flèche rebondit sur le poil dur. Il ne sent presque rien.', 'Toc ! Le rat secoue la tête. Il ne sent presque rien.'])); return attendre(300); });
  });
}
/* Le Pisteur : le coup de dague (le rat de devant) */
function dague(r){
  var h = 'pisteur', b = q('.bouge', heroEl(h)), dx = Math.max(0, rCx(r.i) - hCx(h) - 150);
  b.style.transition = 'transform .16s ease-in'; b.style.transform = 'translateX(' + dx + 'px)';
  return attendre(170).then(function(){
    var e = el('div', 'entaille'); e.style.left = (rCx(r.i) - 20) + 'px'; e.style.top = rCy(r.i) + 'px'; fx.appendChild(e); setTimeout(function(){ e.remove(); }, 400);
    b.style.transition = 'transform .28s ease-out'; b.style.transform = '';
    if(r.ouvert) return critique(r, 'En plein dans le mille !');
    return blesser(r, 4).then(function(){ conte('Tchac ! Le rat grogne, mais il tient bon. Il ne sent presque rien.'); return attendre(300); });
  }).then(function(){ b.style.transition = ''; });
}
/* L'Alchimiste : préparer la potion (une fiole, des bulles), puis la lancer en arc */
function lancer(id, c){
  var h = 'alchimiste', x0 = hCx(h) - 4, y0 = 76;
  var f = el('div', 'fx fiole-vol prepare', '<div class="lueur-prep" style="background:radial-gradient(closest-side,' + RECETTES[id].coul + ',rgba(0,0,0,0))"></div><img src="' + URL_IMG['potion-' + id] + '" alt="">');
  f.style.transform = 'translate(' + x0 + 'px,' + y0 + 'px)';
  fx.appendChild(f);
  for(var k = 0; k < 7; k++) (function(k){
    setTimeout(function(){
      var b = el('div', 'bulle-air'); b.style.left = (x0 - 10 + (k % 3) * 6) + 'px'; b.style.top = (y0 - 36) + 'px'; b.style.setProperty('--bx', ((k % 2 ? 1 : -1) * (4 + k * 2)) + 'px');
      fx.appendChild(b); setTimeout(function(){ b.remove(); }, 500);
    }, k * 70 / SALLE.vitesse);
  })(k);
  var cible = c.rat ? [rCx(c.rat.i), rCy(c.rat.i)] : [hCx(c.heros), 200];
  if(RECETTES[id].cible === 'salle') cible = [rCx(1), rCy(1) - 10];
  return attendre(420).then(function(){
    f.classList.remove('prepare'); q('.lueur-prep', f).remove();
    return vol(f, x0, y0, cible[0], cible[1], 110, 480, 540);
  }).then(function(){
    f.remove();
    eclat(cible[0], cible[1], 130, 'radial-gradient(closest-side,' + RECETTES[id].coul + ',rgba(0,0,0,0))');
    if(id === 'baume') return soin(h, c.heros, 40, 'baume');
    if(id === 'coeur') return soin(h, c.heros, 40, 'coeur');
    if(id === 'fumigene') return fumigene();
    return effetPotion(id, c.rat);
  });
}
function effetPotion(id, r){
  if(id === 'feu'){
    flammes(r);
    if(r.ouvert) return blesser(r, 30, 'gros').then(function(){ if(!r.mort) conte('WOUF ! Le feu en plein ventre ! Le rat file en fumant.'); return attendre(300); });
    return blesser(r, 5).then(function(){ conte('Pfff… ça lui roussit les poils. Il ne sent presque rien.'); return attendre(300); });
  }
  if(id === 'huile'){
    if(r.ouvert){ conte('Ce rat est déjà ventre à l\'air : l\'huile coule pour rien.'); return attendre(600); }
    ouvrir(r, 'huile');
    conte('Le rat glisse sur l\'huile… et tombe sur le dos, le ventre à l\'air !');
    return attendre(1000);
  }
  if(id === 'colle'){
    r.colle = true; majScene();
    conte('Splotch ! Pattes collées : ce rat ne mordra pas cette fois-ci.');
    return attendre(900);
  }
  return attendre(200);
}
function fumigene(){
  vivants().forEach(function(r, k){
    for(var j = 0; j < 3; j++){
      var n = el('div', 'nuage'); var s = 120 + j * 26;
      n.style.width = s + 'px'; n.style.height = (s * .78) + 'px'; n.style.left = (rCx(r.i) - 40 + j * 34) + 'px'; n.style.top = (rCy(r.i) + 6 - j * 18) + 'px'; n.style.animationDelay = (k * 90 + j * 80) + 'ms';
      fx.appendChild(n); (function(n){ setTimeout(function(){ n.remove(); }, 1800); })(n);
    }
  });
  return attendre(600).then(function(){
    vivants().forEach(function(r){ mot(rCx(r.i) - 30, rTop(r.i) + 10, 'kof', 'croc'); secouer(r); });
    conte('Kof, kof ! Les rats toussent… mais le nuage ne leur fait ni chaud ni froid.');
    return attendre(1100);
  });
}

/* ---------------- les coups, les dégâts, le critique ---------------- */
function blesser(r, n, cls){
  r.pv = Math.max(0, r.pv - n);
  chiffre(rCx(r.i), rTop(r.i) + 6, '−' + n, cls);
  secouer(r);
  majBarres();
  if(r.pv <= 0) return attendre(200).then(function(){ conte('Le rat éclate en brume noire !'); return brume(r); });
  return attendre(420);
}
function secouer(r){ var e = ratEl(r); if(e) relancer(q('.bouge', e), 'secoue'); }
function critique(r, phrase){
  var n = r.pv, x = rCx(r.i), y = rCy(r.i);
  r.pv = 0;
  /* arrêt sur image (plus rien ne bouge 150 ms), éclair blanc, zoom vers le rat */
  monde.style.transformOrigin = x + 'px ' + y + 'px';
  monde.classList.add('zoom'); monde.style.transform = 'scale(1.14)';
  var fl = q('#flash'); fl.className = 'on';
  return attendre(150).then(function(){
    fl.className = 'off';
    var cr = q('#critique'); cr.style.left = Math.max(0, Math.min(300, x - 330)) + 'px'; cr.style.top = Math.max(64, rTop(r.i) - 150) + 'px';
    relancer(cr, 'on');
    chiffre(x, rTop(r.i) - 4, '−' + n, 'crit');
    majBarres();
    return brume(r);
  }).then(function(){
    monde.classList.remove('zoom'); monde.style.transform = '';
    conte(phrase || 'En plein dans le mille !');
    return attendre(350);
  }).then(function(){ q('#critique').classList.remove('on'); });
}
/* le rat vaincu éclate en brume noire : l'image grossit et s'efface, une douzaine de taches partent en étoile */
function brume(r){
  r.mort = true; r.ouvert = false; r.affole = false; r.colle = false;
  E.ratsVaincus[r.i] = true;
  var e = ratEl(r), x = rCx(r.i), y = rCy(r.i);
  e.classList.add('brume');
  majBadges(); majBarres();
  var taches = [];
  for(var k = 0; k < 12; k++){
    var t = el('div', 'fx tache'), s = .7 + R() * .8;
    t.style.transform = 'translate(' + x + 'px,' + y + 'px) scale(.3)';
    fx.appendChild(t); taches.push([t, k, s]);
  }
  void fx.offsetWidth;
  taches.forEach(function(a){
    var ang = a[1] / 12 * Math.PI * 2 + R() * .3, d = 70 + R() * 50;
    a[0].style.transform = 'translate(' + (x + Math.cos(ang) * d) + 'px,' + (y + Math.sin(ang) * d * .7) + 'px) scale(' + (a[2] * 1.8) + ')';
    a[0].style.opacity = '0';
  });
  return attendre(650).then(function(){
    taches.forEach(function(a){ a[0].remove(); });
    e.classList.add('mort');
    var z = q('.zone[data-type="rat"][data-id="' + r.i + '"]'); if(z) z.remove();
  });
}

/* ---------------- les petits effets ---------------- */
function chiffre(x, y, t, cls){
  var c = el('div', 'chiffre' + (cls ? ' ' + cls : ''), t);
  c.style.left = x + 'px'; c.style.top = y + 'px';
  fx.appendChild(c); setTimeout(function(){ c.remove(); }, 1000);
}
function mot(x, y, t, cls){
  var c = el('div', 'mot' + (cls ? ' ' + cls : ''), t);
  c.style.left = x + 'px'; c.style.top = y + 'px';
  fx.appendChild(c); setTimeout(function(){ c.remove(); }, 850);
}
function eclat(x, y, taille, fond){
  var c = el('div', 'eclat'); c.style.cssText = 'left:' + x + 'px;top:' + y + 'px;width:' + taille + 'px;height:' + taille + 'px;background:' + fond;
  fx.appendChild(c); setTimeout(function(){ c.remove(); }, 550);
}
function lueur(x, y, coul, taille){ eclat(x, y, taille, 'radial-gradient(closest-side,' + coul + ',rgba(0,0,0,0))'); }
function flammes(r){
  for(var k = 0; k < 5; k++){
    var e = el('div', 'etincelle', '🔥'); e.style.left = (rCx(r.i) - 50 + k * 22) + 'px'; e.style.top = (rCy(r.i) - 10 + (k % 2) * 12) + 'px'; e.style.animationDelay = (k * 50) + 'ms';
    fx.appendChild(e); (function(e){ setTimeout(function(){ e.remove(); }, 1100); })(e);
  }
}
function avance(h, dx){
  var b = q('.bouge', heroEl(h)); if(!b) return;
  b.style.transition = 'transform .14s ease-out'; b.style.transform = 'translateX(' + dx + 'px)';
  setTimeout(function(){ b.style.transition = 'transform .3s ease-out'; b.style.transform = ''; }, 170 / SALLE.vitesse);
}
/* un vol : en ligne droite (ou en arc, h = hauteur), avec un peu de rotation */
function vol(e, x0, y0, x1, y1, h, ms, tour, oriente){
  ms = ms / SALLE.vitesse;
  return new Promise(function(ok){
    var t0 = null;
    function pas(t){
      if(t0 === null) t0 = t;
      var k = Math.min(1, (t - t0) / ms);
      var x = x0 + (x1 - x0) * k, y = y0 + (y1 - y0) * k - h * 4 * k * (1 - k);
      var a = oriente ? Math.atan2((y1 - y0) - h * 4 * (1 - 2 * k), x1 - x0) * 180 / Math.PI : tour * k;
      e.style.transform = 'translate(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px) rotate(' + a.toFixed(1) + 'deg)';
      if(k < 1) requestAnimationFrame(pas); else ok();
    }
    requestAnimationFrame(pas);
  });
}

/* ---------------- le tour des rats ---------------- */
function tourDesRats(){
  E.mode = 'rats'; E.occupe = true;
  bande(); majScene();
  conte('Au tour des rats !');
  var liste = vivants(), p = attendre(700);
  liste.forEach(function(r){ p = p.then(function(){ if(debout().length && !r.mort) return attaque(r); }); });
  return p.then(function(){
    if(!debout().length) return fuite(true);
    var fermes = 0;
    vivants().forEach(function(r){ if(r.ouvert){ fermer(r); fermes++; } r.affole = false; r.colle = false; });
    ORDRE.forEach(function(h){ E.h[h].bouclier = false; });
    majScene(); majBarres();
    if(fermes){ conte(fermes > 1 ? 'Les rats se remettent sur leurs pattes. Le ventre est caché.' : 'Le rat se remet sur ses pattes. Son ventre est caché.'); return attendre(1100).then(function(){ nouveauTour(); }); }
    return attendre(300).then(function(){ nouveauTour(); });
  });
}
function attaque(r){
  var e = ratEl(r), bloc = q('#badges-' + r.i + ' .vise-bloc');
  if(bloc) bloc.classList.add('mord');
  if(r.colle){
    mot(rCx(r.i), rTop(r.i), 'rhââ !', 'croc');
    conte('Le rat tire sur ses pattes collées… Raté !');
    return attendre(1000);
  }
  var h = E.h[r.vise] && !E.h[r.vise].sol ? r.vise : EXPOSES.filter(function(x){ return !E.h[x].sol; })[0];
  var n = r.affole ? 2 : 1, total = 0, victime = h;
  var b = q('.bouge', e), dx = -Math.max(40, Math.min(110, rCx(r.i) - hCx(h) - 170));
  var p = Promise.resolve();
  for(var k = 0; k < n; k++){
    p = p.then(function(){
      if(E.h[victime].sol){ var autre = EXPOSES.filter(function(x){ return !E.h[x].sol; })[0]; if(!autre) return; victime = autre; }
      b.style.transition = 'transform .13s ease-in'; b.style.transform = 'translateX(' + dx + 'px) rotate(-6deg)';
      return attendre(140).then(function(){
        var s = E.h[victime], d = s.bouclier ? 4 : 8;
        s.pv = Math.max(0, s.pv - d); total += d;
        var hb = q('.bouge', heroEl(victime));
        relancer(hb, 'secoue');
        mot(hCx(victime) + 30, 170, 'CROC !', 'croc');
        chiffre(hCx(victime), 140, '−' + d, s.bouclier ? 'bleu' : '');
        if(s.bouclier) eclat(hCx(victime), 200, 160, 'radial-gradient(closest-side,rgba(191,248,255,.8),rgba(63,208,255,0))');
        if(s.pv <= 0){ s.sol = true; s.bouclier = false; }
        majBarres(); majScene(); bande();
        b.style.transition = 'transform .25s ease-out'; b.style.transform = '';
        return attendre(n > 1 ? 330 : 260);
      });
    });
  }
  return p.then(function(){
    if(bloc) bloc.classList.remove('mord');
    var s = E.h[victime], t;
    if(n > 1) t = 'Fou furieux, le rat mord deux fois ' + HER[victime].le + ' : −' + total + ' !';
    else if(total === 4) t = 'Le rat mord ' + HER[victime].le + '… les runes amortissent : −4 seulement !';
    else t = 'Le rat mord ' + HER[victime].le + ' : −' + total + ' !';
    if(s.sol) t += ' ' + HER[victime].Le + ' tombe au sol, la tête qui tourne.';
    conte(t);
    r.vise = null; majBadges();
    return attendre(s.sol ? 1300 : 950);
  });
}

/* =====================================================================
   3) LA FIN : victoire, fuite
   ===================================================================== */
function victoire(){
  E.mode = 'fin'; E.occupe = true;
  bande(); majScene();
  var n = E.tour, ess = E.essai;
  var t = n <= 3 ? 'Trois rats en ' + n + ' tours seulement ! Les égouts vont parler de vous.'
    : n <= 5 ? 'Trois rats en ' + n + ' tours : du beau travail d\'équipe !'
    : 'Trois rats en ' + n + ' tours… C\'était long, mais la salle est propre !';
  if(ess > 1) t += ' Et il a fallu ' + ess + ' essais : on ne lâche rien.';
  conte('La salle est à vous !');
  return attendre(900).then(function(){
    var f = el('div'); f.id = 'fin';
    f.innerHTML = '<div class="voile"></div><div class="victoire"><div class="rayons"></div>' +
      '<h1>La salle est à vous !' + lireBtn('La salle est à vous !') + '</h1>' +
      '<div class="bulle"><span class="txt">' + t + '</span>' + lireBtn(t) + '</div>' +
      '<div class="bilan"><div><b>' + n + '</b>tour' + (n > 1 ? 's' : '') + '</div><div><b>' + ess + '</b>essai' + (ess > 1 ? 's' : '') + '</div><div><b>' + E.livre + '</b>📖 page' + (E.livre > 1 ? 's' : '') + '</div></div>' +
      '<button class="aller guide" data-act="rejouer">Rejouer ↻</button></div>';
    q('#combat').appendChild(f);
  });
}
function demanderFuite(){
  if(E.occupe || E.ecran !== 'combat') return;
  ouvrirFenetre('<h2>Fuir la salle ?</h2><div class="ligne">On laisse les rats ici et on remonte l\'escalier ?' + lireBtn('On laisse les rats ici et on remonte l\'escalier ?') + '</div>' +
    '<div class="boutons"><button class="sombre" data-act="fermer">Non, on reste</button><button class="aller" data-act="fuir">Oui, on fuit !</button></div>');
}
function fuite(auto){
  E.mode = 'fin'; E.occupe = true;
  fermerFenetre();
  bande(); majScene();
  var p = attendre(auto ? 500 : 50);
  if(auto){
    conte('Les trois héros sont au sol… Ils se relèvent tant bien que mal et crient : « Fuite ! »');
    p = p.then(function(){ ORDRE.forEach(function(h){ heroEl(h).classList.remove('sol'); }); return attendre(500); });
  } else conte('« Fuite ! » Les héros remontent l\'escalier quatre à quatre.');
  return p.then(function(){
    ORDRE.forEach(function(h, k){ var e = heroEl(h); setTimeout(function(){ e.classList.add('crie'); }, k * 120); });
    return attendre(800);
  }).then(function(){
    ORDRE.forEach(function(h, k){
      var e = heroEl(h), b = q('.bouge', e);
      setTimeout(function(){ q('.tourne', e).style.transform = 'scaleX(-1)'; b.style.transition = 'transform .8s ease-in'; b.style.transform = 'translateX(-520px)'; }, k * 90);
    });
    return attendre(1100);
  }).then(pointFuite);
}
function pointFuite(){
  var vaincus = E.ratsVaincus.filter(Boolean).length;
  var l = E.livre ? LIVRE.slice(0, E.livre).map(function(t){ return '<div class="livre-l">« ' + t + ' »' + lireBtn(t) + '</div>'; }).join('')
    : '<div class="livre-l">Le Grand Livre n\'a encore rien appris sur les rats.' + lireBtn('Le Grand Livre n\'a encore rien appris sur les rats.') + '</div>';
  var rv = vaincus === 0 ? 'Aucun rat vaincu pour l\'instant.' : vaincus === 1 ? 'Un rat vaincu. Il ne reviendra pas !' : vaincus + ' rats vaincus. Ils ne reviendront pas !';
  var f = el('div'); f.id = 'fin';
  f.innerHTML = '<div class="voile" style="background:rgba(5,3,10,.9)"></div><div class="point"><h1>On fait le point' + lireBtn('On fait le point.') + '</h1>' +
    '<div class="case"><h3>📖 Le Grand Livre</h3>' + l + '</div>' +
    '<div class="case"><h3>🎒 Le sac</h3><div class="sac-l">' + E.sac.map(function(id){ return '<div><img src="' + URL_IMG['potion-' + id] + '" alt="">' + RECETTES[id].nom + '</div>'; }).join('') + '</div>' +
    '<div class="rats-l">' + [0, 1, 2].map(function(i){ return '<span class="rat-mini img-rat' + (E.ratsVaincus[i] ? ' vaincu' : '') + '"></span>'; }).join('') + '<span>' + rv + '</span>' + lireBtn(rv) + '</div></div>' +
    '<div class="bulle"><span class="txt">Et si on essayait autrement ?</span>' + lireBtn('Et si on essayait autrement ?') + '</div>' +
    '<div class="bas"><button class="aller guide" data-act="reessayer">Réessayer ↻</button></div></div>';
  q('#combat').appendChild(f);
  conte('Et si on essayait autrement ?');
}

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
  var b = ev.target.closest ? ev.target.closest('[data-act]') : null;
  if(!b) return;
  var a = b.getAttribute('data-act'), id = b.getAttribute('data-id');
  if(a === 'lire'){ ev.stopPropagation(); lire(b.getAttribute('data-t')); return; }
  if(a === 'lire-bulle'){ lire(E.texte); return; }
  if(a === 'recette-sac') return toucherRecette(id, b);
  if(a === 'descendre'){ if(E.sac.length === 3){ taire(); debutCombat(); } return; }
  if(a === 'livre') return grandLivre();
  if(a === 'fermer') return fermerFenetre();
  if(a === 'fuite') return demanderFuite();
  if(a === 'fuir') return fuite(false);
  if(a === 'reessayer'){ E.essai++; taire(); return ecranSac(); }
  if(a === 'rejouer'){ E.essai = 1; E.livre = 0; E.ratsVaincus = [false, false, false]; E.toursTotal = 0; E.sacAvant = null; E.sac = []; taire(); return ecranSac(); }
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
  /* rien ne doit faire défiler la scène (un élément qu'on rend visible, une loupe…) */
  ['#cadre', '#jeu'].forEach(function(s){ var e = q(s); e.addEventListener('scroll', function(){ e.scrollTop = 0; e.scrollLeft = 0; }); });
  window.addEventListener('scroll', function(){ window.scrollTo(0, 0); });
  ecranSac();
}
SALLE.demarrer = demarrer;
SALLE.maj = function(){ bande(); majScene(); majBarres(); };   /* pour les tests */
if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', demarrer); else demarrer();
})();
