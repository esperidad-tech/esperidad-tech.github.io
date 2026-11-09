/* Atelier des sons de Brumeval — la page : des sections qu'on ouvre et qu'on ferme, les boutons A B C, les cases « validé par moi »,
   la petite barre du bas qui copie les choix. Le catalogue est dans catalogue.js. */
(function(){
'use strict';
var ARBRE = window.CATALOGUE || [], NIVEAUX = window.NIVEAUX || {}, CHOIX = window.CHOIX_ROMAIN || {};
var EX = window.EXISTANTS || {}, BR = window.BRUITAGES || {}, MU = window.MUSIQUES || {};
var CLE = 'brumeval-atelier-sons-2', CLE_V1 = 'brumeval-atelier-sons-1', CLE_OUVERT = 'brumeval-atelier-ouvert';

/* =================== les sons : leurs versions, leur statut =================== */
var SONS = [];          /* tous les sons, à plat : {s, chemin (les titres des sections)} */
function versions(s){
  if(s.x) return [['', '▶']];
  if(s.salles) return s.v;
  return String(s.v).split('').map(function(l){ return [l, l]; });
}
function cleDe(s, v){ return s.salles ? s.id + ':' + v[0] : s.id + v[0]; }
function statut(s){
  if(s.x) return 'jeu';
  if(s.salles) return 'valide';                       /* les trois couleurs de salle : toutes gardées par Romain (10 novembre) */
  return CHOIX[s.id] && CHOIX[s.id].length ? 'valide' : 'nouveau';
}
var STATUT = {valide:['✅', 'validé par Romain'], nouveau:['🆕', 'nouveau, à écouter'], jeu:['🎮', 'déjà dans le jeu']};
(function aplatir(l, chemin){ l.forEach(function(sec){ var c = chemin.concat([sec.titre]); (sec.sons || []).forEach(function(s){ SONS.push({s:s, chemin:c}); }); aplatir(sec.sous || [], c); }); })(ARBRE, []);

/* =================== la mémoire (dans ce navigateur seulement) =================== */
var etat = {coches:{}, refaire:{}, pourquoi:{}, note:'', volume:80};   /* refaire[id] : aucune version ne va, son à refaire (Romain, 9 novembre, 12 h 03) */
var lu = null;
try{ lu = JSON.parse(localStorage.getItem(CLE) || 'null'); }catch(e){}
if(lu && typeof lu === 'object'){
  etat.coches = lu.coches || {}; etat.refaire = lu.refaire || {}; etat.pourquoi = lu.pourquoi || {};
  etat.note = lu.note || ''; if(typeof lu.volume === 'number') etat.volume = lu.volume;
} else {
  /* la première fois : les choix déjà faits par Romain (table CHOIX du jeu) sont précochés ; il peut changer d'avis */
  SONS.forEach(function(e){
    var s = e.s; if(statut(s) !== 'valide') return;
    versions(s).forEach(function(v){ if(s.salles || (CHOIX[s.id] || []).indexOf(v[0]) >= 0) etat.coches[cleDe(s, v)] = true; });
  });
  /* et ce qu'il avait coché sur l'ancienne page, son par son (sauf le critique, refait depuis : la table du jeu fait foi) */
  var v1 = null;
  try{ v1 = JSON.parse(localStorage.getItem(CLE_V1) || 'null'); }catch(e){}
  if(v1 && v1.coches){
    SONS.forEach(function(e){
      var s = e.s; if(s.x || s.id === 'ratCritique') return;
      var cles = versions(s).map(function(v){ return cleDe(s, v); });
      if(cles.some(function(k){ return v1.coches[k]; })) cles.forEach(function(k){ if(v1.coches[k]) etat.coches[k] = true; else delete etat.coches[k]; });
    });
    if(typeof v1.volume === 'number') etat.volume = v1.volume;
  }
}
function sauver(){ try{ localStorage.setItem(CLE, JSON.stringify(etat)); }catch(e){} }
var ouvert = {};
try{ ouvert = JSON.parse(localStorage.getItem(CLE_OUVERT) || '{}') || {}; }catch(e){ ouvert = {}; }
function sauverOuvert(){ try{ localStorage.setItem(CLE_OUVERT, JSON.stringify(ouvert)); }catch(e){} }

/* =================== le son =================== */
var ctx = null, A = null, prises = [], instances = [], musique = null, demo = null, enCours = [], cheminJeu = null, cheminSalle = null;
function demarrer(){
  var AC = window.AudioContext || window.webkitAudioContext;
  if(!AC) return false;
  if(!ctx){
    try{ if(navigator.audioSession) navigator.audioSession.type = 'playback'; }catch(e){}   /* sur iPad : jouer même en mode silencieux */
    try{ ctx = new AC({latencyHint:'interactive'}); }catch(e){ try{ ctx = new AC(); }catch(e2){ return false; } }
    A = Moteur(ctx, {volume:volumeReel()});
    /* les sons du jeu : branchés comme dans le jeu (directement sur la sortie), au même volume quand le curseur est au milieu */
    cheminJeu = ctx.createGain(); cheminJeu.gain.value = niveauJeu(); cheminJeu.connect(ctx.destination);
    /* les petits bruits de la salle des rats : avec le même équilibre que dans la salle (ses bruits à 0,85, l'atelier à 0,9) */
    cheminSalle = ctx.createGain(); cheminSalle.gain.value = 1 / .9; cheminSalle.connect(A.sfx);
    try{ var b = ctx.createBuffer(1, 1, ctx.sampleRate), s = ctx.createBufferSource(); s.buffer = b; s.connect(ctx.destination); s.start(0); }catch(e){}
    setInterval(programme, 120);
    document.addEventListener('visibilitychange', function(){ if(!document.hidden && ctx.state === 'suspended') ctx.resume(); });
  }
  if(ctx.state === 'suspended' || ctx.state === 'interrupted'){ try{ ctx.resume(); }catch(e){} }
  return true;
}
document.addEventListener('pointerdown', demarrer, true);
document.addEventListener('touchend', demarrer, true);
function volumeReel(){ var v = etat.volume / 100; return v * v * 1.1; }
function niveauJeu(){ var v = etat.volume / 80; return v * v; }
function programme(){
  if(!ctx) return;
  var jusqua = ctx.currentTime + 1.2;
  instances = instances.filter(function(I){ return !I.fini; });
  instances.forEach(function(I){ I.pas(jusqua); });
}
function niveau(cle){ return NIVEAUX[cle] || 1; }
/* un bruitage (cle : « arcA », « bourbeCriB »...) à l'instant t */
function jouerCle(cle, t){
  var fn = BR[cle];
  if(typeof fn !== 'function') return {duree:0};
  var P = A.prise(t, niveau(cle)), r = {duree:1};
  try{ r = fn(A, P) || r; }catch(e){ if(window.console) console.warn('son', cle, e); }
  prises.push(P);
  A.plusTard(t - ctx.currentTime + (r.duree || 1) + 5, function(){ P.lacher(); var i = prises.indexOf(P); if(i >= 0) prises.splice(i, 1); });
  return r;
}
/* un son déjà dans le jeu, joué avec son propre code */
function jouerExistant(id){
  var X = EX[id];
  if(!X) return {duree:0};
  var s = ctx.createGain(); s.connect(X.chemin === 'salle' ? cheminSalle : cheminJeu);
  var e = {s:s, coupe:null};
  try{ e.coupe = X.joue({ctx:ctx, A:A}, s); }catch(err){ if(window.console) console.warn('son du jeu', id, err); }
  enCours.push(e);
  setTimeout(function(){ var i = enCours.indexOf(e); if(i >= 0) enCours.splice(i, 1); try{ s.disconnect(); }catch(x){} }, (X.duree + 6) * 1000);
  return {duree:X.duree};
}
function versionChoisie(id){
  var e = SONS.filter(function(x){ return x.s.id === id; })[0];
  if(!e) return 'A';
  var l = versions(e.s).filter(function(v){ return etat.coches[cleDe(e.s, v)]; });
  return l.length ? l[Math.floor(Math.random() * l.length)][0] : 'A';
}
function jouerChaine(ch){
  if(!demarrer()) return 0;
  var t = ctx.currentTime + .06, debut = t, fin = t;
  ch.etapes.forEach(function(e){
    var tt = t + (e.decal || 0), r = jouerCle(e.id + versionChoisie(e.id), tt);
    fin = Math.max(fin, tt + (r.duree || 0));
    if(e.apres) t += r[e.apres] || r.duree || 0;
  });
  return fin - debut;
}
function lancerMusique(cle){
  var t = ctx.currentTime + .05, P = A.prise(t, niveau(cle), 'mus');
  [P.sec, P.cave, P.grotte].forEach(function(g){ g.gain.setValueAtTime(0, t); g.gain.setTargetAtTime(P.niveau, t, .7); });
  var I = MU[cle](A, P);
  instances.push(I); I.pas(ctx.currentTime + 1.2);
  return I;
}
function arreterMusique(){ if(musique){ musique.I.arreter(ctx.currentTime, 1.5); musique = null; } }
function arreterDemo(){ if(demo){ demo.base.arreter(ctx.currentTime, 1.5); if(demo.couleur) demo.couleur.arreter(ctx.currentTime, 1.5); demo = null; } }
/* une couleur de salle, par-dessus le fond commun du donjon (on passe de l'une à l'autre en fondu) */
function allerSalle(cle){
  arreterMusique();
  if(demo && demo.salle === cle){ arreterDemo(); majMusique(); return; }
  if(!demo) demo = {base:lancerMusique('donjon'), couleur:null, salle:null};
  if(demo.couleur) demo.couleur.arreter(ctx.currentTime, 4.5);
  var t = ctx.currentTime + .05, P = A.prise(t, niveau(cle), 'mus');
  [P.sec, P.cave, P.grotte].forEach(function(g){ g.gain.setValueAtTime(0, t); g.gain.setTargetAtTime(P.niveau, t + .6, 1.3); });
  demo.couleur = MU[cle](A, P); instances.push(demo.couleur); demo.couleur.pas(ctx.currentTime + 1.2);
  demo.salle = cle;
  majMusique();
}
function toutArreter(){
  if(!ctx) return;
  prises.forEach(function(P){ P.couper(ctx.currentTime, .03); });
  enCours.forEach(function(e){ try{ e.s.gain.setTargetAtTime(0, ctx.currentTime, .03); }catch(x){} if(typeof e.coupe === 'function') try{ e.coupe(); }catch(x){} });
  arreterMusique(); arreterDemo(); majMusique();
  try{ speechSynthesis.cancel(); }catch(e){}
  document.querySelectorAll('.jouer.joue').forEach(function(b){ b.classList.remove('joue'); });
}

/* =================== la voix (seulement sur un bouton 🔊, jamais toute seule) =================== */
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
function choisirVoix(){ try{ var v = speechSynthesis.getVoices().filter(function(x){ return /^fr/i.test(x.lang); }); v.sort(function(a, b){ return noteVoix(b) - noteVoix(a); }); voix = v[0] || null; }catch(e){} }
try{ choisirVoix(); speechSynthesis.onvoiceschanged = choisirVoix; }catch(e){}
function lire(t){
  t = String(t || '').replace(/[«»▶■]/g, '').replace(/[←-⯿\uD83C-􏰀-\uDFFF️]/g, '').replace(/\s+/g, ' ').trim();
  if(!t) return;
  try{ speechSynthesis.cancel(); var u = new SpeechSynthesisUtterance(t); u.lang = 'fr-FR'; if(voix) u.voice = voix; u.rate = .95; speechSynthesis.speak(u); }catch(e){}
}

/* =================== la page =================== */
function fr(t){ return String(t).replace(/« /g, '« ').replace(/ ([»!?:;])/g, ' $1'); }
function el(tag, cls, txt){ var e = document.createElement(tag); if(cls) e.className = cls; if(txt != null) e.textContent = fr(txt); return e; }
function boutonVoix(texte){
  var b = el('button', 'voix', '🔊'); b.type = 'button';
  b.setAttribute('aria-label', 'Lire à voix haute');
  b.addEventListener('click', function(ev){ ev.stopPropagation(); lire(typeof texte === 'function' ? texte() : texte); });
  return b;
}
function marqueJoue(btn, duree){
  btn.classList.add('joue');
  clearTimeout(btn._fin);
  btn._fin = setTimeout(function(){ btn.classList.remove('joue'); }, Math.max(.4, duree) * 1000);
}
var boutonsMusique = {};
function majMusique(){
  Object.keys(boutonsMusique).forEach(function(cle){
    var b = boutonsMusique[cle], on = (musique && musique.cle === cle) || (demo && demo.salle === cle);
    b.classList.toggle('en-cours', !!on);
    if(b._lettre) b.textContent = on ? '■' : b._lettre;
  });
}
function caseGarde(cle, s, v){
  var lab = el('label', 'garde'), c = el('input'); c.type = 'checkbox'; c.checked = !!etat.coches[cle];
  c.setAttribute('aria-label', (v[0] ? 'Version ' + v[0] + ' de « ' + s.t + ' »' : '« ' + s.t + ' »') + ' : validé par moi');
  c.addEventListener('change', function(){ if(c.checked) etat.coches[cle] = true; else delete etat.coches[cle]; sauver(); recap(); compteurs(); });
  lab.appendChild(c);
  return lab;
}
function carteSon(s){
  var st = statut(s), c = el('div', 'son st-' + st + (s.salles ? ' large' : ''));
  c.dataset.id = s.id; c.dataset.statut = st;
  var nom = el('div', 'nom'), ic = el('span', 'st', STATUT[st][0]);
  ic.title = STATUT[st][1]; ic.setAttribute('aria-label', STATUT[st][1]);
  nom.appendChild(ic); nom.appendChild(el('span', 't', s.t)); c.appendChild(nom);
  var vs = el('div', 'vs');
  vs.appendChild(caseRefaire(s, c));
  versions(s).forEach(function(v){
    var cle = cleDe(s, v), boite = el('div', 'v'), b = el('button', 'jouer' + (v[1].length > 2 ? ' mot' : ''), v[1]); b.type = 'button';
    boite.dataset.cle = cle;
    b.setAttribute('aria-label', 'Écouter « ' + s.t + ' »' + (v[0] ? ', version ' + (s.salles ? v[1] : v[0]) : ''));
    if(s.m){
      var mcle = s.id + v[0]; b._lettre = v[1]; boutonsMusique[mcle] = b;
      b.addEventListener('click', function(){ if(!demarrer()) return; var deja = musique && musique.cle === mcle; arreterMusique(); arreterDemo(); if(!deja) musique = {cle:mcle, I:lancerMusique(mcle)}; majMusique(); });
    } else if(s.c || s.salles){
      var scle = s.salles ? v[0] : s.id + v[0]; if(!s.salles) b._lettre = v[1]; boutonsMusique[scle] = b;
      b.addEventListener('click', function(){ if(!demarrer()) return; allerSalle(scle); });
    } else if(s.x){
      b.addEventListener('click', function(){ if(!demarrer()) return; marqueJoue(b, jouerExistant(s.id).duree || .5); });
    } else {
      b.addEventListener('click', function(){ if(!demarrer()) return; marqueJoue(b, jouerCle(cle, ctx.currentTime + .04).duree || 1); });
    }
    boite.appendChild(b); boite.appendChild(caseGarde(cle, s, v));
    vs.appendChild(boite);
  });
  c.appendChild(vs);
  /* « à refaire » : une petite ligne pour dire pourquoi (facultatif) */
  var pq = el('input', 'pourquoi'); pq.type = 'text'; pq.placeholder = 'Pourquoi ? (facultatif)'; pq.value = etat.pourquoi[s.id] || '';
  pq.setAttribute('aria-label', 'Pourquoi refaire « ' + s.t + ' »');
  pq.addEventListener('input', function(){ if(pq.value.trim()) etat.pourquoi[s.id] = pq.value; else delete etat.pourquoi[s.id]; sauver(); recap(); });
  c.appendChild(pq);
  c.classList.toggle('a-refaire', !!etat.refaire[s.id]);
  return c;
}
function caseRefaire(s, carte){
  var boite = el('div', 'v refaire'), b = el('button', 'refaire-b', '🔁'); b.type = 'button';
  b.setAttribute('aria-label', '« ' + s.t + ' » : à refaire');
  b.setAttribute('aria-pressed', etat.refaire[s.id] ? 'true' : 'false');
  b.addEventListener('click', function(){
    var on = !etat.refaire[s.id];
    if(on) etat.refaire[s.id] = true; else delete etat.refaire[s.id];
    b.setAttribute('aria-pressed', on ? 'true' : 'false');
    carte.classList.toggle('a-refaire', on);
    if(on){ var q = carte.querySelector('.pourquoi'); if(q) setTimeout(function(){ try{ q.focus({preventScroll:true}); }catch(e){} }, 30); }
    sauver(); recap(); compteurs();
  });
  boite.appendChild(b); boite.appendChild(el('span', 'refaire-t', 'à refaire'));
  return boite;
}
function carteChaine(ch){
  var c = el('div', 'son chaine'), nom = el('div', 'nom'); nom.appendChild(el('span', 'st', '🔗')); nom.appendChild(el('span', 't', ch.t)); c.appendChild(nom);
  var b = el('button', 'jouer', '▶'); b.type = 'button'; b.setAttribute('aria-label', 'Écouter l’enchaînement : ' + ch.t);
  b.addEventListener('click', function(){ marqueJoue(b, jouerChaine(ch)); });
  var vs = el('div', 'vs'); vs.appendChild(b); c.appendChild(vs);
  return c;
}
var SECTIONS = [];
function section(sec, profondeur, chemin){
  var d = el('details', 'sec'); d.dataset.id = sec.id; d.open = !!ouvert[sec.id];
  var sum = el('summary'); sum.appendChild(el('span', 'fl', '▸')); sum.appendChild(el('span', 'sec-titre', sec.titre));
  var nb = el('span', 'nb'), neuf = el('span', 'neuf'); sum.appendChild(nb); sum.appendChild(neuf);
  d.appendChild(sum);
  var corps = el('div', 'sec-corps');
  if((sec.sons && sec.sons.length) || sec.chaines){
    var g = el('div', 'grille');
    (sec.sons || []).forEach(function(s){ g.appendChild(carteSon(s)); });
    (sec.chaines || []).forEach(function(ch){ g.appendChild(carteChaine(ch)); });
    corps.appendChild(g);
  }
  if(sec.sous && sec.sous.length){ var so = el('div', 'sous'); sec.sous.forEach(function(x){ so.appendChild(section(x, profondeur + 1)); }); corps.appendChild(so); }
  d.appendChild(corps);
  d.addEventListener('toggle', function(){ if(d.open) ouvert[sec.id] = true; else delete ouvert[sec.id]; sauverOuvert(); });
  SECTIONS.push({d:d, nb:nb, neuf:neuf});
  return d;
}
/* les compteurs sur chaque titre : le nombre de sons, et les 🆕 que personne n'a encore validés */
function compteurs(){
  SECTIONS.forEach(function(x){
    var cartes = x.d.querySelectorAll('.son:not(.chaine)'), n = 0, neufs = 0;
    cartes.forEach(function(c){ n++; if(c.dataset.statut === 'nouveau' && !c.querySelector('input:checked') && !c.classList.contains('a-refaire')) neufs++; });
    x.nb.textContent = n + (n > 1 ? ' sons' : ' son');
    x.neuf.textContent = neufs ? neufs + ' 🆕' : '';
    x.neuf.hidden = !neufs;
  });
  var total = Object.keys(etat.coches).length;
  document.getElementById('compte').textContent = total + ' coché' + (total > 1 ? 's' : '');
}
function construire(){
  var racine = document.getElementById('atelier');
  ARBRE.forEach(function(sec){ racine.appendChild(section(sec, 0)); });
  compteurs(); majMusique();
}

/* =================== le récapitulatif : tous les choix, section par section =================== */
function texteRecap(){
  var l = ['Atelier des sons de Brumeval — mes choix'];
  (function parcours(liste, chemin){
    liste.forEach(function(sec){
      var c = chemin.concat([sec.titre]);
      if(sec.sons && sec.sons.length){
        var pris = [], rien = [];
        sec.sons.forEach(function(s){
          var vs = versions(s).filter(function(v){ return etat.coches[cleDe(s, v)]; });
          if(etat.refaire[s.id]){
            var pq = (etat.pourquoi[s.id] || '').trim();
            pris.push('- ' + s.t + ' : 🔁 À REFAIRE' + (pq ? ' (' + pq + ')' : '') + (vs.length ? ' — en attendant : ' + vs.map(function(v){ return v[1]; }).join(' + ') : ''));
            return;
          }
          if(!vs.length){ rien.push(s.t); return; }
          pris.push('- ' + s.t + ' : ' + (s.x ? 'validé' : vs.map(function(v){ return v[1]; }).join(' + ')) + (statut(s) === 'nouveau' ? ' (nouveau)' : ''));
        });
        l.push(''); l.push('[' + c.join(' › ') + ']');
        l = l.concat(pris);
        if(rien.length) l.push('- pas encore choisi : ' + rien.join(', '));
      }
      parcours(sec.sous || [], c);
    });
  })(ARBRE, []);
  if(etat.note && etat.note.trim()){ l.push(''); l.push('Remarque : ' + etat.note.trim()); }
  return l.join('\n');
}
function recap(){ var z = document.getElementById('recap'); if(z) z.value = texteRecap(); }
function montrerPanneau(oui){
  var p = document.getElementById('panneau'), b = document.getElementById('voir');
  p.hidden = !oui; b.setAttribute('aria-expanded', oui ? 'true' : 'false'); b.textContent = oui ? 'Cacher' : 'Voir';
}
function copier(){
  var txt = texteRecap(), dit = document.getElementById('copie-ok');
  function ok(){ dit.textContent = 'Copié !'; setTimeout(function(){ dit.textContent = ''; }, 2500); }
  function secours(){
    montrerPanneau(true); recap();
    var z = document.getElementById('recap'); z.focus(); z.select(); z.setSelectionRange(0, z.value.length);
    try{ if(document.execCommand('copy')) ok(); else dit.textContent = 'Texte sélectionné'; }catch(e){ dit.textContent = 'Texte sélectionné'; }
  }
  try{ if(navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(txt).then(ok, secours); else secours(); }catch(e){ secours(); }
}

/* =================== le haut et le bas de la page =================== */
function haut(){
  var r = document.getElementById('volume');
  r.value = etat.volume;
  r.addEventListener('input', function(){
    etat.volume = +r.value; sauver();
    if(A){ A.volume.gain.setTargetAtTime(volumeReel(), ctx.currentTime, .05); cheminJeu.gain.setTargetAtTime(niveauJeu(), ctx.currentTime, .05); }
  });
  document.getElementById('stop').addEventListener('click', toutArreter);
  document.getElementById('ouvrir-tout').addEventListener('click', function(){ SECTIONS.forEach(function(x){ x.d.open = true; }); });
  document.getElementById('fermer-tout').addEventListener('click', function(){ SECTIONS.forEach(function(x){ x.d.open = false; }); });
  document.getElementById('copier').addEventListener('click', copier);
  document.getElementById('voir').addEventListener('click', function(){ var p = document.getElementById('panneau'); montrerPanneau(p.hidden); recap(); });
  var note = document.getElementById('note'); note.value = etat.note || '';
  note.addEventListener('input', function(){ etat.note = note.value; sauver(); recap(); });
  if(navigator.share){
    var p = document.getElementById('partager'); p.hidden = false;
    p.addEventListener('click', function(){ try{ navigator.share({title:'Mes choix de sons', text:texteRecap()}); }catch(e){} });
  }
  var acc = document.getElementById('accueil');
  acc.appendChild(boutonVoix('Touche A, B ou C pour écouter, puis coche le petit carré sous ce que tu valides. Si aucune version ne va, touche le bouton à refaire, devant, et dis pourquoi si tu veux. Coche verte : déjà choisi. Nouveau : à écouter. Manette : le son est déjà dans le jeu. Tout en bas, copie tes choix et envoie-les.'));
}

/* pour les tests et le banc d'essai */
window.ATELIER = {catalogue:ARBRE, sons:SONS, statut:statut, versions:versions, cleDe:cleDe, texteRecap:texteRecap, etat:etat,
  contexte:function(){ return ctx; }, instances:function(){ return instances.length; }, musique:function(){ return musique && musique.cle; }, salle:function(){ return demo && demo.salle; }};

construire(); haut(); recap(); sauver();
})();
