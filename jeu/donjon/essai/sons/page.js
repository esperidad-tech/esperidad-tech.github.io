/* Atelier des sons de Brumeval — la page : le catalogue, les boutons, les choix, le récapitulatif. */
(function(){
'use strict';

/* =================== le catalogue =================== */
var CAT = [
  {titre:'L’arc et la flèche', intro:'Le Pisteur tire : la corde se tend, la flèche siffle, puis elle se plante.', cartes:[
    {id:'arc', titre:'L’arc', quoi:'La corde se tend, puis elle claque au lâcher.', v:[
      ['A', 'Le bois grince doucement, puis la corde grave vibre et bourdonne.'],
      ['B', 'On tire vite, sans grincement : un claquement sec et nerveux.'],
      ['C', 'Un grand arc : long grincement, puis une corde profonde qui résonne.']]},
    {id:'vol', titre:'La flèche en vol', quoi:'Le bruit de la flèche qui file vers les rats.', v:[
      ['A', 'Un sifflement fin, qui baisse un peu en s’éloignant.'],
      ['B', 'Un souffle d’air, sans note : plus réaliste, plus discret.'],
      ['C', 'Une flèche qui chante : un sifflement fort, qui vibre.']]},
    {id:'chairF', titre:'Plantée dans la chair', quoi:'La flèche qui se plante dans un monstre.', v:[
      ['A', 'Un « tchouk » sourd et court.'],
      ['B', 'Un « tchouk » plus mou, un peu mouillé.'],
      ['C', 'Le « tchouk », puis la flèche qui tremble un instant.']]},
    {id:'bois', titre:'Plantée dans le bois', quoi:'Quand la flèche rate et se plante dans une porte.', v:[
      ['A', 'Un « toc » sec, et la flèche frémit à peine.'],
      ['B', 'Un « toc », puis la flèche vibre longtemps : « dwoïng ».'],
      ['C', 'Une grosse porte épaisse : un « tooc » grave.']]}
  ], chaines:[
    {titre:'Le tir complet', quoi:'L’arc, la flèche en vol, l’impact et le rat qui couine, à la suite, avec tes versions cochées (A si rien n’est coché).',
      etapes:[{id:'arc', apres:'moment'}, {id:'vol', apres:'duree'}, {id:'chairF'}, {id:'ratFleche', decal:.02}]},
    {titre:'Le tir raté', quoi:'L’arc, la flèche en vol, et la flèche qui se plante dans la porte.',
      etapes:[{id:'arc', apres:'moment'}, {id:'vol', apres:'duree'}, {id:'bois'}]}
  ]},
  {titre:'La dague', intro:'Le Voleur frappe : le swish de la lame, puis l’impact, dans la chair ou sur une armure.', cartes:[
    {id:'swish', titre:'Le swish', quoi:'Le bruit de la lame qui fend l’air.', v:[
      ['A', 'Un swish d’air, simple et rapide.'],
      ['B', 'Un double swish : un aller, un retour.'],
      ['C', 'La lame glisse et chante : « shiiing ».']]},
    {id:'chairD', titre:'Dans la chair', quoi:'Quand la dague touche un monstre sans armure.', v:[
      ['A', '« Tchac » : une claque, un choc, un peu mouillé.'],
      ['B', 'Un coup sourd et mat, sans rien de mouillé.'],
      ['C', 'La lame tranche (« shk »), puis le « tchac ».']]},
    {id:'metal', titre:'Sur le métal', quoi:'Quand la dague tape sur un monstre en armure.', v:[
      ['A', '« Tinc » : une armure légère, un son clair.'],
      ['B', '« Clang » : une grosse plaque, un son grave qui sonne.'],
      ['C', 'La lame ripe sur l’armure et glisse.']]}
  ], chaines:[
    {titre:'Le coup complet', quoi:'Le swish, l’impact dans la chair et le rat qui réagit, avec tes versions cochées.',
      etapes:[{id:'swish', apres:'moment'}, {id:'chairD'}, {id:'ratDague', decal:.01}]},
    {titre:'Sur une armure', quoi:'Le swish, puis la lame sur le métal.',
      etapes:[{id:'swish', apres:'moment'}, {id:'metal'}]}
  ]},
  {titre:'Les rats touchés', intro:'Dès qu’un rat est touché, il réagit, et pas pareil selon ce qui le frappe.', cartes:[
    {id:'ratFleche', titre:'Par une flèche', quoi:'Un couinement bref.', v:[
      ['A', 'Un seul « iik ! », bref.'],
      ['B', 'Deux petits cris : « i‑iik ! ».'],
      ['C', 'Un « aïe » plus éraillé, puis une petite plainte.']]},
    {id:'ratDague', titre:'Par la dague', quoi:'Un couinement et un choc sourd.', v:[
      ['A', 'Le choc, puis un « aïe » aigu.'],
      ['B', 'Plus fort et plus long, puis il souffle vite.'],
      ['C', 'Le choc, puis il siffle de colère et couine.']]},
    {id:'ratFeu', titre:'Par le feu', quoi:'Un cri, et le grésillement qui continue.', v:[
      ['A', 'Le feu prend, un long cri, puis ça grésille.'],
      ['B', 'Pareil, et il sautille en couinant pendant que ça brûle.'],
      ['C', 'Plus dessin animé : un cri qui chevrote, ça grésille fort.']]},
    {id:'ratLumiere', titre:'Par la lumière', quoi:'Un gémissement d’ébloui.', v:[
      ['A', 'Une longue plainte, puis une petite.'],
      ['B', 'Surpris (« hi ! »), il gémit, puis se frotte les yeux.'],
      ['C', 'Tout étourdi : « hm ? hm ? hm ? », puis une plainte qui tangue.']]},
    {id:'ratLouche', titre:'Par la louche', quoi:'Le BONG, puis un grognement furieux.', v:[
      ['A', 'BONG, puis il siffle, claque des dents et crie.'],
      ['B', 'BONG, puis un « grrrr » de dessin animé et deux cris.'],
      ['C', 'Un BONG plus grave et plus long, puis un cri qui monte.']]},
    {id:'ratColle', titre:'Dans la colle', quoi:'Il se débat, il couine, et la colle fait « sploutch ».', v:[
      ['A', 'Sploutch, quatre efforts qui collent, sploutch.'],
      ['B', 'Un gros sploutch, deux longs efforts, des bulles.'],
      ['C', 'Il se débat très vite, avec plein de petits bruits collants.']]},
    {id:'ratHuile', titre:'Sur l’huile', quoi:'Il glisse (« fwiiit »), il crie de surprise, puis il tombe.', v:[
      ['A', 'La glissade, « hii ?! », la chute, et il se relève en grattant.'],
      ['B', 'Un sifflet de dessin animé, « hii ?! », « plonk ».'],
      ['C', 'La glissade, le cri, une chute qui siffle, un gros boum.']]},
    {id:'ratNuage', titre:'Dans le nuage', quoi:'Trois quintes de toux.', v:[
      ['A', 'Une petite toux sèche, trois fois, avec un sifflement.'],
      ['B', 'Trois quintes, et ça finit par un éternuement.'],
      ['C', 'Une toux plus grasse et plus lente.']]},
    {id:'ratCritique', titre:'Coup critique', quoi:'Un gros cri, et l’explosion.', v:[
      ['A', 'Un gros cri, puis BOUM, et la brume noire qui s’échappe.'],
      ['B', 'Le cri est coupé net par le BOUM, avec un long écho.'],
      ['C', 'Le cri, un boum plus doux, et des étincelles magiques.']]},
    {id:'ratFuite', titre:'La fuite', quoi:'Des couinements de peur qui s’éloignent.', v:[
      ['A', 'Il file vite en couinant, avec ses griffes sur la pierre.'],
      ['B', 'Plus lent, avec l’écho du couloir.'],
      ['C', 'Dessin animé : « zip ! », et il a disparu.']]}
  ]},
  {titre:'Les musiques', intro:'Des musiques sombres et douces, qui tournent en boucle sans fin. Une seule joue à la fois : touche ■ pour l’arrêter.', cartes:[
    {id:'explo', musique:true, titre:'Exploration', quoi:'Pendant qu’on explore le donjon.', v:[
      ['A', 'La grotte qui respire : un souffle grave, des gouttes, des cloches au loin.'],
      ['B', 'La boîte à musique perdue : une petite berceuse qui revient de loin.'],
      ['C', 'Lanterne dans la brume : des voix lointaines et une harpe, un peu d’espoir.']]},
    {id:'combat', musique:true, titre:'Combat', quoi:'Plus tendu, avec une pulsation lente.', v:[
      ['A', 'Le cœur qui bat : un battement sourd et des cordes graves qui insistent.'],
      ['B', 'Tambours lointains : de gros tambours dans la grotte, et un violoncelle.']]},
    {id:'salles', salles:true, titre:'Une musique par salle', quoi:'Un même fond pour tout le donjon, et une couleur pour chaque salle. On passe de l’une à l’autre en fondu, comme quand l’équipe change de salle.', v:[
      ['puits', 'Le puits : de l’eau qui coule, des gouttes en écho, une flûte creuse.', '💧 Le puits'],
      ['toiles', 'La cave aux toiles : des cordes qui grincent, des notes qui glissent, de petits pas.', '🕸️ La cave'],
      ['atelier', 'L’atelier : une horloge, une machine qui souffle, du métal au loin.', '⚙️ L’atelier']]}
  ]},
  {titre:'Victoire et fuite', intro:'La fin du combat : quand l’équipe gagne, ou quand elle s’enfuit.', cartes:[
    {id:'victoire', titre:'Victoire', quoi:'Une petite fanfare quand le dernier rat tombe.', v:[
      ['A', 'Des cuivres et des timbales, avec des étoiles.'],
      ['B', 'Une harpe qui monte, des cloches et des voix.']]},
    {id:'fuite', titre:'Fuite de l’équipe', quoi:'Quand les héros décident de s’enfuir.', v:[
      ['A', 'On court, et la porte claque derrière nous.'],
      ['B', 'On court, puis une petite mélodie triste : on reviendra.']]}
  ]}
];
var NIVEAUX = window.NIVEAUX || {};
var CLE_MEMOIRE = 'brumeval-atelier-sons-1';

/* =================== la mémoire des choix (dans ce navigateur seulement) =================== */
var etat = {coches:{}, notes:{}, volume:80};
try{ var lu = JSON.parse(localStorage.getItem(CLE_MEMOIRE) || 'null'); if(lu && typeof lu === 'object'){ etat.coches = lu.coches || {}; etat.notes = lu.notes || {}; if(typeof lu.volume === 'number') etat.volume = lu.volume; } }catch(e){}
function sauver(){ try{ localStorage.setItem(CLE_MEMOIRE, JSON.stringify(etat)); }catch(e){} }

/* =================== le son =================== */
var ctx = null, A = null, prises = [], instances = [], musique = null, demo = null, programmateur = null;
function demarrer(){
  var AC = window.AudioContext || window.webkitAudioContext;
  if(!AC) return false;
  if(!ctx){
    try{ if(navigator.audioSession) navigator.audioSession.type = 'playback'; }catch(e){}   /* sur iPad : jouer même en mode silencieux */
    try{ ctx = new AC({latencyHint:'interactive'}); }catch(e){ try{ ctx = new AC(); }catch(e2){ return false; } }
    A = Moteur(ctx, {volume:volumeReel()});
    try{ var b = ctx.createBuffer(1, 1, ctx.sampleRate), s = ctx.createBufferSource(); s.buffer = b; s.connect(ctx.destination); s.start(0); }catch(e){}
    programmateur = setInterval(programme, 120);
    document.addEventListener('visibilitychange', function(){ if(!document.hidden && ctx.state === 'suspended') ctx.resume(); });
  }
  if(ctx.state === 'suspended' || ctx.state === 'interrupted'){ try{ ctx.resume(); }catch(e){} }
  return true;
}
document.addEventListener('pointerdown', demarrer, true);
document.addEventListener('touchend', demarrer, true);
function volumeReel(){ var v = etat.volume / 100; return v * v * 1.1; }
function programme(){
  if(!ctx) return;
  var jusqua = ctx.currentTime + 1.2;
  instances = instances.filter(function(I){ return !I.fini; });
  instances.forEach(function(I){ I.pas(jusqua); });
}
function niveau(cle){ return NIVEAUX[cle] || 1; }

/* jouer un bruitage (cle : « arcA », « ratFeuB »...) à l'instant t */
function jouerCle(cle, t){
  var fn = window.BRUITAGES[cle];
  if(!fn) return {duree:0};
  var P = A.prise(t, niveau(cle)), r = {duree:1};
  try{ r = fn(A, P) || r; }catch(e){ if(window.console) console.warn('son', cle, e); }
  prises.push(P);
  A.plusTard(t - ctx.currentTime + (r.duree || 1) + 4, function(){ P.lacher(); var i = prises.indexOf(P); if(i >= 0) prises.splice(i, 1); });
  return r;
}
function versionChoisie(id){
  var c = trouveCarte(id);
  for(var i = 0; i < c.v.length; i++) if(etat.coches[id + c.v[i][0]]) return c.v[i][0];
  return 'A';
}
function trouveCarte(id){
  for(var s = 0; s < CAT.length; s++) for(var k = 0; k < CAT[s].cartes.length; k++) if(CAT[s].cartes[k].id === id) return CAT[s].cartes[k];
  return null;
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
function arreterBruitages(){
  if(!ctx) return;
  prises.forEach(function(P){ P.couper(ctx.currentTime, .03); });
}
function lancerMusique(cle){
  var t = ctx.currentTime + .05, P = A.prise(t, niveau(cle), 'mus');
  [P.sec, P.cave, P.grotte].forEach(function(g){ g.gain.setValueAtTime(0, t); g.gain.setTargetAtTime(P.niveau, t, .7); });
  var I = window.MUSIQUES[cle](A, P);
  instances.push(I); I.pas(ctx.currentTime + 1.2);
  return I;
}
function arreterMusique(){
  if(musique){ musique.I.arreter(ctx.currentTime, 1.5); musique = null; }
}
function arreterDemo(){
  if(demo){ demo.base.arreter(ctx.currentTime, 1.5); if(demo.couleur) demo.couleur.arreter(ctx.currentTime, 1.5); demo = null; }
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
/* la typographie française : des espaces insécables avant ! ? : » et après « */
function fr(t){ return String(t).replace(/« /g, '«\u00a0').replace(/ ([»!?:;])/g, '\u00a0$1'); }
function el(tag, cls, txt){ var e = document.createElement(tag); if(cls) e.className = cls; if(txt != null) e.textContent = fr(txt); return e; }
function boutonVoix(texte){
  var b = el('button', 'voix', '🔊'); b.type = 'button';
  b.setAttribute('aria-label', 'Lire à voix haute');
  b.addEventListener('click', function(ev){ ev.stopPropagation(); lire(typeof texte === 'function' ? texte() : texte); });
  return b;
}
function texteAvecVoix(cls, texte, lu){
  var p = el('p', cls); p.appendChild(el('span', '', texte)); p.appendChild(boutonVoix(lu || texte));
  return p;
}
function marqueJoue(btn, duree){
  btn.classList.add('joue');
  clearTimeout(btn._fin);
  btn._fin = setTimeout(function(){ btn.classList.remove('joue'); }, Math.max(.4, duree) * 1000);
}
var boutonsMusique = {};
function majMusique(){
  Object.keys(boutonsMusique).forEach(function(cle){
    var b = boutonsMusique[cle], on = (musique && musique.cle === cle) || (demo && cle === 'demo') || (demo && demo.salle === cle);
    b.classList.toggle('en-cours', !!on);
    if(b._lettre) b.textContent = on ? '■ ' + b._lettre : '▶ ' + b._lettre;
    if(cle === 'demo') b.textContent = demo ? '■ Arrêter' : '▶ Lancer la démo';
  });
  document.querySelectorAll('.salle').forEach(function(r){ r.classList.toggle('ici', !!demo && demo.salle === r.dataset.salle); });
}

function ligneVersion(carte, v, sec){
  var cle = carte.id + v[0], ligne = el('div', 'version');
  ligne.dataset.cle = cle;
  var b = el('button', 'jouer', (carte.musique ? '▶ ' : '▶ ') + v[0]); b.type = 'button';
  b.setAttribute('aria-label', 'Écouter la version ' + v[0]);
  if(carte.musique){
    b._lettre = v[0]; boutonsMusique[cle] = b;
    b.addEventListener('click', function(){
      if(!demarrer()) return;
      var deja = musique && musique.cle === cle;
      arreterMusique(); arreterDemo();
      if(!deja) musique = {cle:cle, I:lancerMusique(cle)};
      majMusique();
    });
  } else {
    b.addEventListener('click', function(){
      if(!demarrer()) return;
      var r = jouerCle(cle, ctx.currentTime + .04);
      marqueJoue(b, r.duree || 1);
    });
  }
  ligne.appendChild(b);
  var d = el('div', 'dit'); d.appendChild(el('span', '', v[1])); d.appendChild(boutonVoix('Version ' + v[0] + '. ' + v[1]));
  ligne.appendChild(d);
  ligne.appendChild(caseGarde(cle, ligne));
  return ligne;
}
function caseGarde(cle, ligne){
  var lab = el('label', 'garde'), c = el('input'); c.type = 'checkbox'; c.checked = !!etat.coches[cle];
  ligne.classList.toggle('gardee', c.checked);
  c.addEventListener('change', function(){ etat.coches[cle] = c.checked; if(!c.checked) delete etat.coches[cle]; ligne.classList.toggle('gardee', c.checked); sauver(); recap(); });
  lab.appendChild(c); lab.appendChild(el('span', '', 'je garde'));
  return lab;
}
function ligneSalle(carte, v){
  var cle = carte.id + ':' + v[0], ligne = el('div', 'version salle'); ligne.dataset.salle = v[0]; ligne.dataset.cle = cle;
  var b = el('button', 'jouer large', v[2]); b.type = 'button';
  b.setAttribute('aria-label', 'Aller dans la salle : ' + v[2]);
  boutonsMusique[v[0]] = b;
  b.addEventListener('click', function(){ if(!demarrer()) return; allerSalle(v[0]); });
  ligne.appendChild(b);
  var d = el('div', 'dit'); d.appendChild(el('span', '', v[1])); d.appendChild(boutonVoix(v[1]));
  ligne.appendChild(d);
  ligne.appendChild(caseGarde(cle, ligne));
  return ligne;
}
function allerSalle(salle){
  arreterMusique();
  if(!demo) demo = {base:lancerMusique('donjon'), couleur:null, salle:null};
  if(demo.salle === salle){ majMusique(); return; }
  if(demo.couleur) demo.couleur.arreter(ctx.currentTime, 4.5);
  var t = ctx.currentTime + .05, P = A.prise(t, niveau(salle), 'mus');
  [P.sec, P.cave, P.grotte].forEach(function(g){ g.gain.setValueAtTime(0, t); g.gain.setTargetAtTime(P.niveau, t + .6, 1.3); });
  demo.couleur = window.MUSIQUES[salle](A, P); instances.push(demo.couleur); demo.couleur.pas(ctx.currentTime + 1.2);
  demo.salle = salle;
  majMusique();
}

function construire(){
  var racine = document.getElementById('atelier');
  CAT.forEach(function(sec, si){
    var s = el('section', 'partie');
    s.appendChild(el('h2', '', (si + 1) + '. ' + sec.titre));
    s.appendChild(texteAvecVoix('intro', sec.intro, sec.titre + '. ' + sec.intro));
    var grille = el('div', 'cartes');
    sec.cartes.forEach(function(carte){
      var c = el('article', 'carte' + (carte.salles ? ' large' : ''));
      c.appendChild(el('h3', '', carte.titre));
      c.appendChild(texteAvecVoix('quoi', carte.quoi, carte.titre + '. ' + carte.quoi));
      if(carte.salles){
        var lanceur = el('button', 'jouer demo', '▶ Lancer la démo'); lanceur.type = 'button';
        boutonsMusique.demo = lanceur;
        lanceur.addEventListener('click', function(){ if(!demarrer()) return; if(demo){ arreterDemo(); majMusique(); } else allerSalle('puits'); });
        var bloc = el('div', 'lanceur'); bloc.appendChild(lanceur);
        bloc.appendChild(texteAvecVoix('aide', 'Puis touche une salle pour y aller.'));
        c.appendChild(bloc);
        carte.v.forEach(function(v){ c.appendChild(ligneSalle(carte, v)); });
      } else carte.v.forEach(function(v){ c.appendChild(ligneVersion(carte, v, sec)); });
      var note = el('input', 'remarque'); note.type = 'text'; note.placeholder = 'Une remarque ? (facultatif)'; note.value = etat.notes[carte.id] || '';
      note.setAttribute('aria-label', 'Remarque sur : ' + carte.titre);
      note.addEventListener('input', function(){ if(note.value.trim()) etat.notes[carte.id] = note.value; else delete etat.notes[carte.id]; sauver(); recap(); });
      c.appendChild(note);
      grille.appendChild(c);
    });
    s.appendChild(grille);
    if(sec.chaines){
      var ch = el('div', 'chaines');
      sec.chaines.forEach(function(chn){
        var l = el('div', 'chaine'), b = el('button', 'jouer large', '▶ ' + chn.titre); b.type = 'button';
        b.addEventListener('click', function(){ var d = jouerChaine(chn); marqueJoue(b, d); });
        l.appendChild(b); l.appendChild(texteAvecVoix('dit', chn.quoi));
        ch.appendChild(l);
      });
      s.appendChild(ch);
    }
    racine.appendChild(s);
  });
  majMusique();
}

/* =================== le récapitulatif =================== */
function texteRecap(){
  var l = ['Atelier des sons de Brumeval — mes choix', ''], notes = [];
  CAT.forEach(function(sec, si){
    l.push((si + 1) + '. ' + sec.titre);
    sec.cartes.forEach(function(carte){
      var pris = carte.v.filter(function(v){ return etat.coches[carte.salles ? carte.id + ':' + v[0] : carte.id + v[0]]; }).map(function(v){ return carte.salles ? v[2].replace(/^\S+\s/, '') : v[0]; });
      l.push('- ' + carte.titre + ' : ' + (pris.length ? pris.join(' + ') : 'pas choisi'));
      if(etat.notes[carte.id]) notes.push('- ' + carte.titre + ' : ' + etat.notes[carte.id].trim());
    });
    l.push('');
  });
  if(notes.length){ l.push('Remarques'); l = l.concat(notes); }
  return l.join('\n').trim();
}
function recap(){ var z = document.getElementById('recap'); if(z) z.value = texteRecap(); }
function copier(){
  var txt = texteRecap(), dit = document.getElementById('copie-ok');
  function ok(){ dit.textContent = 'Copié !'; }
  function secours(){
    var z = document.getElementById('recap'); z.focus(); z.select(); z.setSelectionRange(0, z.value.length);
    try{ if(document.execCommand('copy')) ok(); else dit.textContent = 'Texte sélectionné'; }catch(e){ dit.textContent = 'Texte sélectionné'; }
  }
  try{ if(navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(txt).then(ok, secours); else secours(); }catch(e){ secours(); }
}

/* =================== le haut de page : volume, tout arrêter =================== */
function haut(){
  var r = document.getElementById('volume');
  r.value = etat.volume;
  r.addEventListener('input', function(){
    etat.volume = +r.value; sauver();
    if(A) A.volume.gain.setTargetAtTime(volumeReel(), ctx.currentTime, .05);
  });
  document.getElementById('stop').addEventListener('click', function(){
    if(!ctx) return;
    arreterBruitages(); arreterMusique(); arreterDemo(); majMusique();
    try{ speechSynthesis.cancel(); }catch(e){}
    document.querySelectorAll('.jouer.joue').forEach(function(b){ b.classList.remove('joue'); });
  });
  document.getElementById('copier').addEventListener('click', copier);
  if(navigator.share){
    var p = document.getElementById('partager'); p.hidden = false;
    p.addEventListener('click', function(){ try{ navigator.share({title:'Mes choix de sons', text:texteRecap()}); }catch(e){} });
  }
  document.querySelectorAll('[data-dire]').forEach(function(x){ x.appendChild(boutonVoix(x.getAttribute('data-dire') || x.textContent)); });
  var rv = document.getElementById('recap-voix'); if(rv) rv.appendChild(boutonVoix(function(){ return rv.textContent + ' ' + texteRecap(); }));
}

/* pour vérifier les sons hors ligne (le banc d'essai) */
window.ATELIER = {catalogue:CAT, texteRecap:texteRecap, etat:etat, contexte:function(){ return ctx; }, instances:function(){ return instances.length; }};

construire(); haut(); recap();
})();
