/* noyau.js — les outils communs du donjon (Les Enquêteurs de Brumeval, enquête 3).
   Cahier des charges : jeu/donjon/MOTEUR-DONJON.md. Les règles : regles.js (aucun affichage) ; ici, l'affichage.

   window.DJ :
     DJ.el(tag, cls, html), DJ.q(sel, racine), DJ.qa(sel, racine), DJ.esc(texte), DJ.relancer(el, classe)
     DJ.attendre(ms)                 une pause (Promise), raccourcie par SALLE.vitesse (les tests accélèrent)
     DJ.lire(texte), DJ.taire()      la voix : SEULEMENT sur un bouton 🔊 (jamais de lecture automatique)
     DJ.lireBtn(texte)               le bouton 🔊 d'un texte (tout texte de plus de 3 mots a le sien)
     DJ.fenetre(html), DJ.fermer()   le parchemin par-dessus le jeu
     DJ.son(nom, …), DJ.bruit(id, o, ancien)   les petits bruits du jeu / un son de l'Atelier (version tirée au hasard)
     DJ.img(nom)                     l'adresse d'une image (i/…)
     DJ.charger.script(nom), DJ.charger.image(url), DJ.charger.bete(module), DJ.charger.decor(salle)
     DJ.potion(id)                   la fiole d'une recette (SVG)
     DJ.tete(h, taille, cadre, dy)   le style qui cadre la tête d'un héros dans sa photo
     DJ.versEcran(p), DJ.versScene(p)   scène 960 × 372  <->  pixels de l'écran (les modules des bêtes parlent en pixels d'écran)
     DJ.garder(partie), DJ.relire(), DJ.oublier()   la partie dans le localStorage
     DJ.toucher(fn)                  ajoute un écouteur des boutons [data-act] : fn(acte, id, bouton, ev) -> true si traité
   Les chemins des fichiers viennent de window.DJ_CHEMINS (posé par la page : en ligne, tout est dans le dossier du jeu). */
(function(){
'use strict';
var SALLE = window.SALLE = window.SALLE || {};
SALLE.hasard = SALLE.hasard || function(){ return Math.random(); };
SALLE.vitesse = SALLE.vitesse || 1;
var DJ = window.DJ = window.DJ || {};
var D = window.DonjonDonnees;

function el(tag, cls, html){ var e = document.createElement(tag); if(cls) e.className = cls; if(html != null) e.innerHTML = html; return e; }
function q(s, r){ return (r || document).querySelector(s); }
function qa(s, r){ return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
function esc(t){ return String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;'); }
function relancer(e, cls){ e.classList.remove(cls); void e.offsetWidth; e.classList.add(cls); }
function attendre(ms){ return new Promise(function(ok){ setTimeout(ok, ms / (SALLE.vitesse || 1)); }); }
DJ.el = el; DJ.q = q; DJ.qa = qa; DJ.esc = esc; DJ.relancer = relancer; DJ.attendre = attendre;
DJ.hasard = function(){ return SALLE.hasard(); };

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
DJ.lire = function(t){
  t = String(t || '').replace(/<[^>]*>/g, ' ').replace(/[«»]/g, '').replace(/[←-⯿\uD83C-􏰀-\uDFFF️]/g, '').replace(/\s+/g, ' ').trim();
  if(!t) return;
  try{
    speechSynthesis.cancel();
    var u = new SpeechSynthesisUtterance(t);
    u.lang = 'fr-FR'; if(voix) u.voice = voix; u.rate = .95;
    speechSynthesis.speak(u);
  }catch(e){}
};
DJ.taire = function(){ try{ speechSynthesis.cancel(); }catch(e){} };
DJ.lireBtn = function(t){ return '<button class="lire" data-act="lire" data-t="' + esc(t) + '" aria-label="Écouter">🔊</button>'; };
/* un texte et son 🔊 (seulement s'il a plus de 3 mots) */
DJ.texte = function(t, cls){ var mots = String(t).replace(/<[^>]*>/g, ' ').trim().split(/\s+/).length; return '<span class="' + (cls || 'txt') + '">' + t + '</span>' + (mots > 3 ? DJ.lireBtn(t) : ''); };

/* ================= le son ================= */
DJ.son = function(){ var S = SALLE.Son; if(S && S.jouer) S.jouer.apply(null, arguments); };
DJ.bruit = function(id, o, ancien){
  var S = SALLE.Son, r = S && S.bruitage ? S.bruitage(id, o || {}) : null;
  if(!r && ancien) DJ.son.apply(null, ancien);
  return r;
};
DJ.musique = function(nom){ var S = SALLE.Son; if(S && S.musique) S.musique(nom); };
/* Les sons que Romain n'a pas encore validés dans l'Atelier jouent leur version A, provisoire (MOTEUR-DONJON.md §5).
   SALLE.CHOIX_SONS est la table des versions validées (son.js) : on ne touche pas à ce qui y est déjà. */
DJ.PROVISOIRE = {};
var REFAITS = {pasCouloir:'C'};
DJ.sonsProvisoires = function(){
  var C = SALLE.CHOIX_SONS, B = window.BRUITAGES;
  if(!C || !B) return;
  Object.keys(B).forEach(function(cle){
    var m = /^([A-Za-z_0-9]+?)A$/.exec(cle);
    if(!m || typeof B[cle] !== 'function') return;
    var id = m[1];
    if(C[id] && C[id].length) return;
    /* (les pas sur la carte : Romain a refusé les versions A et B le 10 novembre — on joue la C, feutrée, en attendant son choix) */
    var l = REFAITS[id] && typeof B[id + REFAITS[id]] === 'function' ? REFAITS[id] : 'A';
    C[id] = [l]; DJ.PROVISOIRE[id] = 1;
  });
};

/* ================= le filet de sécurité du critique =================
   Sur un iPhone à court de mémoire, Safari ferme la page (et la recharge) au plus gros effet : le critique.
   On pose un témoin au début du critique et on l'enlève à la fin. S'il est encore là au démarrage, c'est que la page
   s'est fermée en plein critique : on le compte, et sur cet appareil les critiques suivants sont allégés
   (moins de fumée et de morceaux), pour qu'on ne reste jamais coincé. Le compteur se lit en bas de « 🎒 Objets ». */
var CLE_TEMOIN = 'brumeval-donjon-critique', CLE_PLANTAGES = 'brumeval-donjon-plantages', CLE_OU = 'brumeval-donjon-plantage-ou';
/* on : false (le critique est fini), ou le moment où l'on en est ('debut', 'impact', 'explosion', 'fumee', 'bete') */
DJ.temoinCritique = function(on){ try{ if(on) localStorage.setItem(CLE_TEMOIN, (on === true ? 'debut' : on) + '|' + Date.now()); else localStorage.removeItem(CLE_TEMOIN); }catch(e){} };
DJ.plantages = function(){ try{ return +localStorage.getItem(CLE_PLANTAGES) || 0; }catch(e){ return 0; } };
DJ.plantageOu = function(){ try{ return localStorage.getItem(CLE_OU) || ''; }catch(e){ return ''; } };
DJ.verifierTemoin = function(){
  try{
    var v = (localStorage.getItem(CLE_TEMOIN) || '').split('|'), t = +v[1] || 0;
    if(t && Date.now() - t < 600000){ localStorage.setItem(CLE_PLANTAGES, String(DJ.plantages() + 1)); localStorage.setItem(CLE_OU, v[0]); }
    localStorage.removeItem(CLE_TEMOIN);
  }catch(e){}
  if(DJ.plantages() > 0) SALLE.critLeger = true;
  return DJ.plantages();
};
DJ.VERSION = '/*VERSION*/';

/* ================= les fichiers (images, scripts chargés à la demande) ================= */
var CH = window.DJ_CHEMINS || {};
DJ.img = function(nom){ return (CH.img ? CH.img(nom) : 'i/' + nom); };
SALLE.img = function(nom){ return DJ.img(({'fumee-a':'fumee-a.png', 'fumee-b':'fumee-b.png', 'fumee-c':'fumee-c.png', 'brume-a':'brume-a.png', 'brume-b':'brume-b.png', flamme:'flamme.png'})[nom] || nom); };
var charges = {};
DJ.charger = {
  script:function(url){
    if(charges[url]) return charges[url];
    return (charges[url] = new Promise(function(ok, ko){
      var s = document.createElement('script'); s.src = url; s.async = true;
      s.onload = function(){ ok(); }; s.onerror = function(){ delete charges[url]; ko(new Error('script introuvable : ' + url)); };
      document.head.appendChild(s);
    }));
  },
  image:function(url){
    return new Promise(function(ok){
      var i = new Image(); i.onload = function(){ if(i.decode) i.decode().then(function(){ ok(i); }, function(){ ok(i); }); else ok(i); };
      i.onerror = function(){ ok(null); }; i.src = url;
    });
  },
  /* le module animé d'une bête (BETES[module], ou RatAnime pour le rat) */
  bete:function(module){
    if(module === 'rat') return window.RatAnime ? Promise.resolve() : DJ.charger.script(CH.bete ? CH.bete('rat') : 'a/rat-anime.js');
    if(window.BETES && window.BETES[module]) return Promise.resolve();
    return DJ.charger.script(CH.bete ? CH.bete(module) : 'a/' + module + '-anime.js');
  },
  decor:function(salle){ return CH.decor ? CH.decor(salle) : 'i/decor-' + salle + '.webp'; },
  scene:function(lieu){ return CH.scene ? CH.scene(lieu) : 'i/scene-' + lieu + '.webp'; }
};

/* ================= la mise à l'échelle (960 × 540, bandes noires autour) ================= */
DJ.echelle = 1;
DJ.ajuster = function(){
  var jeu = q('#jeu'); if(!jeu) return;
  var w = window.innerWidth, h = window.innerHeight, t = q('#tourne');
  if(t) t.hidden = !(h > w * 1.05);
  var s = DJ.echelle = Math.min(w / 960, h / 540);
  DJ.decalage = {x:Math.round((w - 960 * s) / 2), y:Math.round((h - 540 * s) / 2)};
  jeu.style.transform = 'translate(' + DJ.decalage.x + 'px,' + DJ.decalage.y + 'px) scale(' + s + ')';
};
/* la scène (960 × 372, en haut à gauche du jeu) <-> l'écran */
DJ.versEcran = function(p){ var d = DJ.decalage || {x:0, y:0}; return {x:d.x + p.x * DJ.echelle, y:d.y + p.y * DJ.echelle}; };
DJ.versScene = function(p){ var d = DJ.decalage || {x:0, y:0}; return {x:(p.x - d.x) / DJ.echelle, y:(p.y - d.y) / DJ.echelle}; };

/* ================= les fenêtres ================= */
var fenetre = null;
DJ.fenetre = function(html, cls){
  DJ.fermer();
  fenetre = el('div'); fenetre.id = 'fenetre';
  fenetre.innerHTML = '<div class="parchemin' + (cls ? ' ' + cls : '') + '">' + html + '<button class="fermer" data-act="fermer" aria-label="Fermer">✕</button></div>';
  q('#jeu').appendChild(fenetre);
  return fenetre;
};
DJ.fermer = function(){ if(fenetre){ fenetre.remove(); fenetre = null; DJ.taire(); } };
DJ.fenetreOuverte = function(){ return !!fenetre; };

/* ================= les doigts et la souris : un seul écouteur, des actes [data-act] ================= */
var ecouteurs = [];
DJ.toucher = function(fn){ ecouteurs.push(fn); return function(){ var k = ecouteurs.indexOf(fn); if(k >= 0) ecouteurs.splice(k, 1); }; };
function clic(ev){
  if(SALLE.Son && SALLE.Son.demarrer) SALLE.Son.demarrer();     /* le premier toucher : le son démarre (le navigateur l'exige) */
  var b = ev.target.closest ? ev.target.closest('[data-act]') : null;
  if(!b) return;
  var a = b.getAttribute('data-act'), id = b.getAttribute('data-id');
  if(a === 'lire'){ ev.stopPropagation(); DJ.lire(b.getAttribute('data-t')); return; }
  if(a === 'fermer'){ DJ.fermer(); return; }
  for(var k = ecouteurs.length - 1; k >= 0; k--){ try{ if(ecouteurs[k](a, id, b, ev)) return; }catch(e){ if(window.console) console.error(e); } }
}
DJ.brancher = function(){
  if(DJ._branche) return; DJ._branche = true;
  document.addEventListener('click', clic);
  window.addEventListener('resize', DJ.ajuster);
  window.addEventListener('orientationchange', function(){ setTimeout(DJ.ajuster, 200); });
  ['#cadre', '#jeu'].forEach(function(s){ var e = q(s); if(e) e.addEventListener('scroll', function(){ e.scrollTop = 0; e.scrollLeft = 0; }); });
  window.addEventListener('scroll', function(){ window.scrollTo(0, 0); });
  DJ.ajuster();
};

/* ================= les deux curseurs de volume (Romain, 9 novembre) : musique 🎵 et bruitages 💥 ================= */
var VOLUMES = [{id:'musique', ic:'🎵', nom:'Musique'}, {id:'bruitages', ic:'💥', nom:'Bruitages'}];
function volumeDe(type){ try{ var S = SALLE.Son, v = S && S.volume ? S.volume(type) : 1; return v == null ? 1 : +v; }catch(e){ return 1; } }
DJ.curseursVolume = function(){
  return '<div id="volumes">' + VOLUMES.map(function(V){
    return '<div class="vol" data-vol="' + V.id + '"><span class="vol-ic" aria-hidden="true">' + V.ic + '</span>' +
      '<div class="vol-piste" role="slider" tabindex="0" aria-label="' + V.nom + '" aria-valuemin="0" aria-valuemax="100">' +
      '<span class="vol-rail"><i class="vol-barre"></i><i class="vol-plein"></i><i class="vol-rond"></i></span></div></div>';
  }).join('') + '</div>';
};
function majCurseur(v, val){
  var p = Math.round(val * 100);
  q('.vol-plein', v).style.width = p + '%';
  q('.vol-rond', v).style.left = p + '%';
  var pi = q('.vol-piste', v); pi.setAttribute('aria-valuenow', p); pi.setAttribute('aria-valuetext', p ? p + ' %' : 'muet');
  v.classList.toggle('muet', !p);
}
function reglerVolume(type, val){
  val = Math.max(0, Math.min(1, val));
  if(val < .04) val = 0;
  try{ if(SALLE.Son && SALLE.Son.volume) SALLE.Son.volume(type, val); }catch(e){}
  qa('.vol[data-vol="' + type + '"]').forEach(function(v){ majCurseur(v, val); });
}
DJ.brancherCurseurs = function(racine){
  qa('.vol', racine).forEach(function(v){
    var type = v.getAttribute('data-vol'), piste = q('.vol-piste', v), rail = q('.vol-rail', v), tient = false;
    majCurseur(v, volumeDe(type));
    function lire(ev){ var r = rail.getBoundingClientRect(); reglerVolume(type, (ev.clientX - r.left) / Math.max(1, r.width)); }
    piste.addEventListener('pointerdown', function(ev){ if(SALLE.Son) SALLE.Son.demarrer(); tient = true; v.classList.add('tient'); try{ piste.setPointerCapture(ev.pointerId); }catch(e){} lire(ev); ev.preventDefault(); });
    piste.addEventListener('pointermove', function(ev){ if(tient) lire(ev); });
    function lacher(){ tient = false; v.classList.remove('tient'); }
    piste.addEventListener('pointerup', lacher); piste.addEventListener('pointercancel', lacher);
    piste.addEventListener('keydown', function(ev){
      var d = ev.key === 'ArrowRight' || ev.key === 'ArrowUp' ? .1 : ev.key === 'ArrowLeft' || ev.key === 'ArrowDown' ? -.1 : 0;
      if(d){ ev.preventDefault(); reglerVolume(type, volumeDe(type) + d); }
    });
  });
};

/* ================= les héros : ce que l'affichage doit savoir d'eux ================= */
var PE = {p1:['#fff1e6', '#f7caa6', '#e8ad89', '#ff8f8f'], p4:['#eec899', '#c7935c', '#a77441', '#e4685a'], p5:['#d29d6f', '#a06840', '#80502d', '#d65a50']};
var CHV = {noir:['#6b7096', '#272840', '#0e0e1a'], roux:['#ffb886', '#dc622a', '#7a2a0e']};
var YX = {vert:['#0a3a22', '#1f9150', '#86ffbd'], ambre:['#3a1a02', '#c47a10', '#ffd98a']};
DJ.LOOK = {pisteur:{fille:true, pe:PE.p1, ch:CHV.roux, ir:YX.vert}, alchimiste:{fille:false, pe:PE.p4, ch:CHV.noir, ir:YX.ambre}, sage:{fille:true, pe:PE.p5, ch:CHV.noir, ir:YX.ambre, lunettes:true}};
/* x : la gauche de sa boîte de 200 × 240 dans la scène ; tete : où est sa tête dans sa photo (280 × 320) */
DJ.HER = {
  sage:{x:0, coul:'#6cb6ff', tete:[137.6, 84.8]},
  alchimiste:{x:138, coul:'#b48cff', tete:[139.2, 88]},
  pisteur:{x:276, coul:'#5fcf86', tete:[139.2, 86.4]}
};
DJ.hCx = function(h){ return DJ.HER[h].x + 99; };
DJ.hPt = function(h){ return {x:DJ.hCx(h), y:206}; };
DJ.tete = function(h, t, f, dy){
  var k = t / f, c = DJ.HER[h].tete;
  return 'background-size:' + (280 * k).toFixed(1) + 'px ' + (320 * k).toFixed(1) + 'px;background-position:' + (-(c[0] - f / 2) * k).toFixed(1) + 'px ' + (-(c[1] - f / 2 + (dy || 0)) * k).toFixed(1) + 'px';
};
DJ.cssHeros = function(){
  if(q('#dj-css-heros')) return;
  var st = el('style'); st.id = 'dj-css-heros';
  st.textContent = ['sage', 'alchimiste', 'pisteur'].map(function(h){ return '.img-' + h + '{background-image:url(' + DJ.img('heros-' + h + '.png') + ')}'; }).join('');
  document.head.appendChild(st);
};

/* ================= les fioles des recettes (le dessin de la salle d'essai, avec les trois nouvelles) ================= */
var O = '#24182e';
function P(d, f, x){ return '<path d="' + d + '" fill="' + f + '" stroke="' + O + '" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"' + (x || '') + '/>'; }
function L(d, c, w, x){ return '<path d="' + d + '" fill="none" stroke="' + c + '" stroke-width="' + w + '" stroke-linejoin="round" stroke-linecap="round"' + (x || '') + '/>'; }
function F(d, f, x){ return '<path d="' + d + '" fill="' + f + '"' + (x || '') + '/>'; }
function C(x, y, r, f, x2){ return '<circle cx="' + x + '" cy="' + y + '" r="' + r + '" fill="' + f + '"' + (x2 || '') + '/>'; }
var FIOLE = {feu:'#ff6a2a', fumigene:'#9aa3c8', huile:'#f2b630', colle:'#ece4d0', acide:'#9be04a', baume:'#5fd08a', coeur:'#ff5a7a', givre:'#bff4ff', baumelum:'#7affc0'};
DJ.potion = function(t){
  var c = FIOLE[t] || '#cccccc', s = '';
  s += '<circle cx="20" cy="30" r="19" fill="' + c + '" opacity=".22"/>';
  /* ce qui sort du bouchon */
  if(t === 'feu') s += P('M20 1 C 15 -5 21 -9 19 -15 C 27 -10 28 -3 24 1 Z', '#ffc040', ' stroke-width="2"') + F('M20.5 0 C 18.5 -3 21.5 -5 21 -8 C 24.5 -5 24.5 -2 22.5 0 Z', '#fff2a0');
  if(t === 'fumigene') s += '<circle cx="14" cy="-2" r="5" fill="#dfe2f2" stroke="' + O + '" stroke-width="2"/><circle cx="22" cy="-7" r="6.5" fill="#eceef8" stroke="' + O + '" stroke-width="2"/><circle cx="29" cy="-1" r="4.5" fill="#d2d6ec" stroke="' + O + '" stroke-width="2"/>';
  if(t === 'acide') s += C(15, -3, 3.2, '#d8ff9a', ' stroke="' + O + '" stroke-width="1.6"') + C(24, -8, 4.2, '#c8f77a', ' stroke="' + O + '" stroke-width="1.6"') + C(27, 0, 2.4, '#e8ffc0', ' stroke="' + O + '" stroke-width="1.4"');
  if(t === 'givre') s += L('M20 -14 V -2 M14.5 -11 L 25.5 -5 M25.5 -11 L 14.5 -5', '#ffffff', 2.4) + L('M20 -14 V -2 M14.5 -11 L 25.5 -5 M25.5 -11 L 14.5 -5', '#8fd8ff', 1);
  if(t === 'baumelum') s += P('M20 -15 L 22 -9 L 28 -8 L 23 -4.5 L 24.5 1.5 L 20 -2 L 15.5 1.5 L 17 -4.5 L 12 -8 L 18 -9 Z', '#fff7b0', ' stroke-width="1.6"');
  s += P('M15 6 L 25 6 L 25 14 C 34 18 36 34 28 42 C 24 46 16 46 12 42 C 4 34 6 18 15 14 Z', c);
  s += F('M10 28 C 14 26 26 26 30 28 C 31 36 26 42 20 42 C 14 42 9 36 10 28 Z', 'rgba(0,0,0,.18)');
  s += P('M13 2 L 27 2 L 27 8 L 13 8 Z', '#8a5a32');
  /* le signe, sur le ventre de la fiole : on reconnaît la recette sans la couleur */
  if(t === 'feu') s += P('M20 24 C 14 30 15 38 20 40 C 25 38 26 30 20 24 Z', '#ffd84a', ' stroke-width="1.8"');
  if(t === 'fumigene') s += L('M13 33 Q 17 29 21 33 T 29 33 M13 38 Q 17 34 21 38 T 29 38', '#4a4e6a', 2.2);
  if(t === 'huile') s += P('M20 24 C 15 31 14 35 20 39 C 26 35 25 31 20 24 Z', '#fff4c0', ' stroke-width="1.8"') + P('M25 8 C 26 12 27 14 27 17 C 27 20 24 20 24 17 C 24 14 25 12 25 8 Z', '#f2b630', ' stroke-width="1.5"');
  if(t === 'colle') s += P('M12 14 L 28 14 C 28 18 27 21 25 21 C 23 21 23 18 22 18 C 21 18 21 24 18 24 C 15 24 16 18 14 18 C 13 18 13 20 12 20 Z', '#fffaf0', ' stroke-width="1.6"') + L('M14 32 C 17 29 23 29 26 32 M15 37 C 18 34 22 34 25 37', '#8a7a5a', 2);
  if(t === 'acide') s += P('M20 23 C 15 30 14 34 20 38 C 26 34 25 30 20 23 Z', '#efffc8', ' stroke-width="1.8"') + C(14, 39, 1.8, '#3a5a10') + C(26, 28, 1.5, '#3a5a10') + C(27, 38, 1.2, '#3a5a10');
  if(t === 'baume') s += P('M13 38 C 13 30 21 25 28 27 C 28 35 21 40 13 38 Z', '#c8ffd8', ' stroke-width="1.8"') + L('M14 37 L 25 29', '#2f8050', 1.4);
  if(t === 'coeur') s += P('M20 40 C 11 34 11 27 15.5 25.5 C 17.5 25 19.3 26.5 20 28.5 C 20.7 26.5 22.5 25 24.5 25.5 C 29 27 29 34 20 40 Z', '#fff0f4', ' stroke-width="1.8"');
  if(t === 'givre') s += L('M20 24 V 40 M13 28 L 27 36 M27 28 L 13 36', '#2a6a9a', 2.4) + L('M20 24 l -2.5 2.5 M20 24 l 2.5 2.5 M20 40 l -2.5 -2.5 M20 40 l 2.5 -2.5', '#2a6a9a', 1.6);
  if(t === 'baumelum') s += P('M13 38 C 13 30 21 25 28 27 C 28 35 21 40 13 38 Z', '#eafff2', ' stroke-width="1.8"') + L('M14 37 L 25 29', '#2f8050', 1.4) + C(27, 38, 1.8, '#fff7b0') + C(13, 28, 1.4, '#fff7b0');
  s += L('M14 22 Q 15 18 19 17', '#fff', 2.4, ' opacity=".8"') + C(27, 33, 1.6, '#fff', ' opacity=".6"');
  return '<svg class="fiole" viewBox="-4 -18 48 66" aria-hidden="true">' + s + '</svg>';
};

/* ================= la partie dans le localStorage (recharger la page n'est pas une fuite) ================= */
var CLE = 'brumeval-donjon-partie';
DJ.garder = function(partie){ try{ localStorage.setItem(CLE, window.Regles.exporter(partie)); }catch(e){} };
DJ.relire = function(){ try{ var t = localStorage.getItem(CLE); return t ? window.Regles.importer(t) : null; }catch(e){ return null; } };
DJ.oublier = function(){ try{ localStorage.removeItem(CLE); }catch(e){} };

/* un petit mot du conteur, pour les tests et les curieux (plus de bandeau en combat : Romain, 9 novembre) */
DJ.journal = [];
DJ.conte = function(t){ DJ.journal.push(t); if(DJ.journal.length > 60) DJ.journal.shift(); };
})();
