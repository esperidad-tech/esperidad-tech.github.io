/* leo.js — LE COMBAT DE LÉO À L'ÉCRAN (Bible §13.33, conçu avec Romain le 13 novembre). Les règles sont dans leo-regles.js :
   ici, on ne décide de rien — on fait avancer le temps, on joue ce que les règles annoncent, et on leur passe les doigts.

   CE COMBAT EST EN TEMPS RÉEL. Un seul joueur tient la tablette. Pas d'explication avant le combat (Romain : on apprend en jouant).
   · (14 novembre, Romain, après son premier essai — Bible §13.37) EN BAS, UNE SEULE RANGÉE D'ICÔNES : plus d'onglets de héros,
     plus de cible à toucher. Les icônes sont rangées par héros (un cadre de sa couleur), seulement celles qui servent dans la
     phase (LeoRegles.L.BARRE) ; un toucher lance le geste, et les règles choisissent la cible (c.barre(), c.agir(h, geste)) ;
   · la rune de l'œil ouverte : aux pieds de Léo, tout en bas, l'icône de l'attaque qui vient et des deux suivantes ;
   · chaque phase gagnée est gardée toute seule (partie.faits['leo:phase']) : après une défaite, on reprend à cette phase-là ;
   · une cinématique entre les phases (on peut la passer d'un toucher) ; ⏸ : la pause ;
   · à la fin : Léo, battu, dit ses cinq phrases (chacune avec son 🔊).

     DJ.Leo.preparer()                     -> Promise (pendant l'écran de passage)
     DJ.Leo.lancer(partie[, {phase}])      -> Promise('victoire' | 'quitte')
     DJ.Leo.etat(), DJ.Leo.agir(h, geste[, cible]), DJ.Leo._E()    pour les tests */
(function(){
'use strict';
var SALLE = window.SALLE, DJ = window.DJ, D = window.DonjonDonnees, LR = window.LeoRegles, L = LR.L;
var el = DJ.el, q = DJ.q, qa = DJ.qa, esc = DJ.esc, attendre = DJ.attendre, HER = DJ.HER, hCx = DJ.hCx, hPt = DJ.hPt;
var ORDRE = D.ORDRE, Fx, E = null, jeu, fx, hud, bandeEl;
function son(){ DJ.son.apply(null, arguments); }
function bruit(id, o, ancien){ return DJ.bruit(id, o, ancien); }
var LX = 815, SOL = 340, PLACES_RAT = [452, 562];
var NOMS = {1:'L\'homme en cape', 2:'Léo', 3:'Léo'};

/* ce que dit Léo, battu (Romain, 13 novembre, 18 h 06 : les textes sont validés ; chacun a son 🔊) */
var AVEUX = [
  'Assez… Vous avez gagné.',
  'Meunier… Je n\'ai jamais voulu être meunier. Le maire, lui, m\'a promis autre chose. Une vraie place.',
  'C\'est lui qui a tout préparé, depuis le début : la rivière rouge, les fumigènes, la lettre. Odette, ce n\'était pas prévu. Elle a été trop curieuse.',
  'Il descend souvent, tout seul, encore plus bas. Là-dessous, il y a une ville. Une ville entière, sous Brumeval.',
  'Moi, il ne m\'a jamais laissé y aller. Personne n\'y va. Jamais.'
];

/* ====================================================================== 1. PRÉPARER, CONSTRUIRE */
function preparer(){
  return Promise.all([DJ.charger.bete('rat'), DJ.charger.bete('ratcuir')]).then(function(){
    return Promise.all([DJ.Combat.cuireHeros(), DJ.Combat.cuireRat(), DJ.charger.image(DJ.charger.scene('leo')), DJ.charger.image(SALLE.img('fumee-a')), DJ.charger.image(SALLE.img('brume-a'))]);
  }).catch(function(e){ if(window.console) console.warn('Léo', e); });
}
function phaseGardee(p){ var n = +(p.faits && p.faits['leo:phase']) || 1; return Math.max(1, Math.min(3, n)); }
function lancer(partie, o){
  o = o || {};
  Fx = SALLE.Fx;
  return new Promise(function(fin){
    E = {partie:partie, c:null, ph:null, A:{h:{}}, leo:null, rats:{}, sel:'pisteur', geste:null, choix:[], pause:false, cine:true, fini:false, finir:fin,
      sig:'', etatsH:{}, occ:{}, jet:{}, temps:0, elan:null, vite:+o.vite || 1, saute:false, essais:0};
    construire();
    demarrerPhase(o.phase || phaseGardee(partie), true);
    E.raf = requestAnimationFrame(boucle);
  });
}
function torche(x){
  return '<div class="leo-torche" style="left:' + x + 'px"><svg viewBox="0 0 40 90" width="40" height="90"><path d="M14 40 L26 40 L23 84 L17 84 Z" fill="#5a3a1e" stroke="#1a0e08" stroke-width="2.4"/><path d="M10 36 L30 36 L28 44 L12 44 Z" fill="#8a8f9c" stroke="#1a0e08" stroke-width="2.4"/></svg>' +
    '<i class="leo-flamme"></i><i class="leo-halo"></i></div>';
}
function construire(){
  jeu = q('#jeu'); DJ.fermer(); DJ.taire();
  jeu.innerHTML = '';
  DJ.cssHeros();
  var c = el('div', 'ecran salle-leo leo ouvert'); c.id = 'combat';
  c.innerHTML = '<div id="monde"><div id="secousse"><img class="decor" src="' + DJ.charger.scene('leo') + '" alt=""><div id="leo-lueur"></div>' + torche(300) + torche(610) +
    '<div id="sol-fx"></div><div id="persos"></div><div id="fx"></div><div id="fumee"></div><div id="leo-noir"></div><div id="hud"></div></div></div>' +
    '<div id="haut"><div id="leo-barre"><em></em><div class="barre"><i></i><u style="left:60%"></u><u style="left:30%"></u></div><b></b><span id="leo-etats"></span></div>' + DJ.curseursVolume() +
    '<button id="fuite" class="sombre" data-act="l-pause" aria-label="Pause">⏸ Pause</button></div>' +
    '<div id="bande" class="leo-bande"></div><div id="ecran-fx"></div><div id="fx-haut"></div><div id="leo-cine"></div>';
  jeu.appendChild(c);
  fx = q('#fx'); hud = q('#hud'); bandeEl = q('#bande');
  Fx.init({fx:fx, sol:q('#sol-fx'), fumee:q('#fumee'), ecran:q('#ecran-fx'), monde:q('#monde'), secousse:q('#secousse')});
  DJ.brancherCurseurs(c);
  var p = q('#persos');
  ORDRE.forEach(function(h){
    var d = el('div', 'perso heros module h-' + h);
    d.style.left = (HER[h].x - 40) + 'px'; d.style.zIndex = 10 + ORDRE.indexOf(h);
    d.innerHTML = '<div class="ombre"></div><div class="anneau"><i></i></div><div class="acteur" style="left:40px;top:40px;width:200px;height:240px"></div>' +
      '<div class="l-bulle"></div><div class="l-gouttes"><i></i><i></i><i></i></div><div class="l-feu">🔥</div><div class="l-proie">🎯<b></b></div>';
    p.appendChild(d);
    E.A.h[h] = window.HerosAnime.creer(q('.acteur', d), h, DJ.LOOK[h]);
    try{ E.A.h[h].attendre(); }catch(e){}
    var z = el('div', 'zone'); z.setAttribute('data-act', 'l-perso'); z.setAttribute('data-type', 'heros'); z.setAttribute('data-id', h);
    z.style.cssText = 'left:' + (hCx(h) - 58) + 'px;top:96px;width:116px;height:276px';
    hud.appendChild(z);
    var pv = el('div', 'pv'); pv.id = 'pv-' + h; pv.style.left = hCx(h) + 'px';
    pv.innerHTML = '<div class="barre"><i></i></div><b></b>';
    hud.appendChild(pv);
  });
  /* le bâton de lune dans la main du Sage, s'il l'a (c'est lui qui rallume la salle) */
  try{ var OL = D.OBJETS['cristal-lune']; if(OL && OL.equipe && (E.partie.heros.sage.objets || []).indexOf('cristal-lune') >= 0) E.A.h.sage.equiper(OL.equipe, true, {discret:true}); }catch(e){}
  /* Léo, et l'endroit où on le touche */
  E.leo = window.LeoAnime.creer(p, {x:LX, sol:SOL, tenue:1});
  E.leo.el.style.zIndex = 3;
  var zl = el('div', 'zone'); zl.id = 'zone-leo'; zl.setAttribute('data-act', 'l-perso'); zl.setAttribute('data-type', 'ennemi'); zl.setAttribute('data-id', 'leo');
  zl.style.cssText = 'left:' + (LX - 100) + 'px;top:70px;width:200px;height:290px';
  hud.appendChild(zl);
  /* ce que montre la rune de l'œil : ses trois prochaines attaques, à ses pieds, le plus bas possible (Romain, 14 novembre) */
  var su = el('div'); su.id = 'leo-suite'; su.style.left = LX + 'px'; hud.appendChild(su);
  var nu = el('div', 'leo-nuage'); nu.id = 'leo-nuage'; nu.innerHTML = '<i></i><i></i><i></i><i></i><i></i>'; p.appendChild(nu);
  var fl = el('div'); fl.id = 'leo-flaque'; q('#sol-fx').appendChild(fl);
  c.addEventListener('pointerdown', doigt);
  DJ.musiqueCombat('bassin');
}
function slotH(h){ return q('.h-' + h); }

/* ====================================================================== 2. LES PHASES */
function demarrerPhase(n, premiere){
  E.c = LR.combat(E.partie, {phase:n});
  E.ph = E.c.etat();
  E.elan = null; E.sig = ''; E.suiteSig = null;
  Object.keys(E.rats).forEach(function(id){ retirerRat(id); });
  ORDRE.forEach(function(h){ remettreHeros(h); });
  nuage(false); flaque(false); noir(false, true);
  E.leo.tenue(n); E.leo.arme(null); E.leo.teinte(null); E.leo.voile(0); E.leo.visage('colere'); E.leo.p.x = 0; E.leo.vers('garde', 1);
  q('#leo-barre em').textContent = NOMS[n];
  q('#combat').setAttribute('data-phase', n);
  maj(true);
  /* la première fois qu'on arrive devant lui : il sort de l'ombre. Sinon (un nouvel essai) : on y retourne tout de suite. */
  E.cine = true;
  (premiere && n === 1 && !E.partie.faits['leo:vu'] ? cineEntree() : cinePret(n)).then(function(){ if(!E) return; E.cine = false; E.saute = false; E.ts = 0; });
}
function remettreHeros(h){
  var A = E.A.h[h], s = slotH(h);
  s.classList.remove('sol', 'saigne', 'brule', 'attrape', 'bj', 'bc', 'proie');
  s.style.transform = ''; s.style.opacity = '';
  try{ A._etoiles(false); if(A.ko){ Promise.resolve(A.relever()).catch(function(){}).then(function(){ try{ A.attendre(); }catch(e){} }); } }catch(e){}
  E.etatsH[h] = {};
}
/* une pause qu'un toucher raccourcit (les cinématiques se passent d'un toucher) */
function pause(ms){ return new Promise(function(ok){ var t0 = Date.now(); (function voir(){ if(!E || E.saute || Date.now() - t0 >= ms) return ok(); setTimeout(voir, 40); })(); }); }
function pose(p, ms, c){ return E.saute ? E.leo.vers(p, 1) : E.leo.vers(p, ms, c); }
function titre(grand, petit, ms){
  var t = el('div', 'leo-titre', '<b>' + esc(grand) + '</b>' + (petit ? '<small>' + esc(petit) + '</small>' : ''));
  q('#leo-cine').appendChild(t);
  setTimeout(function(){ t.remove(); }, ms || 2600);
}
function passer(on){
  var c = q('#leo-cine'); if(!c) return;
  c.classList.toggle('on', !!on);
  if(on && !q('.leo-passer', c)){ var b = el('button', 'leo-passer sombre', 'Passer ➜'); b.setAttribute('data-act', 'l-passer'); c.appendChild(b); }
  if(!on){ var x = q('.leo-passer', c); if(x) x.remove(); }
}
async function cineEntree(){
  passer(true);
  E.partie.faits['leo:vu'] = 1; DJ.garder(E.partie);
  E.leo.voile(1); E.leo.p.x = 90;
  await pause(500);
  bruit('leoCape', {}, ['magie']);
  for(var k = 0; k <= 10 && !E.saute; k++){ E.leo.voile(1 - k / 10); await pause(70); }
  E.leo.voile(0);
  await pose({x:0, torse:5, brasG:22, avantG:62, brasD:-18}, 900, 'o');
  titre(NOMS[1], null, 2200);
  await pose('rugit', 500, 'o'); Fx.tremble(7, 400);
  await pause(900);
  await pose('garde', 400);
  passer(false);
}
async function cinePret(n){
  titre(NOMS[n], n === 1 ? null : 'Phase ' + n, 1400);
  await pause(900);
}
/* phase 1 → 2 : il se relève, arrache sa cape — c'est Léo ! Le Pisteur ramasse ses outils. */
async function cine12(){
  passer(true);
  E.leo.arme(null); nuage(false); noir(false, true);
  bruit('leoChute', {}, ['tombe']);
  await pose('genou', 700, 'o');
  await pause(900);
  await pose('garde', 600);
  await pose('capeA', 350, 'o');
  bruit('leoDechire', {}, ['magie']);
  var cape = el('div', 'leo-cape-vole'); cape.style.left = (LX - 80) + 'px'; cape.style.top = '110px'; fx.appendChild(cape); setTimeout(function(){ cape.remove(); }, 1500);
  E.leo.tenue(2); E.leo.eclair();
  q('#leo-barre em').textContent = NOMS[2];
  await pose('capeB', 260, 'o');
  E.leo.visage('cri');
  await pose('rugit', 450, 'o'); Fx.tremble(12, 600);
  titre('Léo !', 'l\'apprenti du meunier', 2400);
  await pause(1300);
  E.leo.visage('colere');
  ramasser(['crochet', 'fleau', 'marteau']);
  await pose('garde', 500);
  await pause(900);
  passer(false);
}
/* phase 2 → 3 : il boit la potion volée à Iris, et devient une grosse bête. Le Pisteur ramasse la faux et la gourde. */
async function cine23(){
  passer(true);
  E.leo.arme(null);
  bruit('leoChute', {}, ['tombe']);
  await pose('genou', 700, 'o');
  await pause(700);
  E.leo.arme('gourde');
  bruit('leoPotion', {}, ['bulles']);
  await pose('boit', 600, 'o'); E.leo.visage('boit');
  await pause(1000);
  E.leo.arme(null);
  for(var k = 0; k < 3 && !E.saute; k++){ E.leo.teinte('feu'); await pause(140); E.leo.teinte(null); await pause(120); }
  E.leo.tenue(3); E.leo.eclair(); E.leo.visage('cri');
  var a = E.leo.ancre('centre'); Fx.onde(a.x, a.y, '#b6ff8a', 420, 800);
  await pose('rugit', 500, 'o'); Fx.tremble(14, 800);
  await pause(1100);
  E.leo.visage('colere');
  ramasser(['faux', 'gourde']);
  await pose('garde', 500);
  await pause(800);
  passer(false);
}
/* les outils de Léo glissent jusqu'au Pisteur */
function ramasser(l){
  bruit('leoRamasse', {dt:.35}, ['clic']);
  l.forEach(function(a, k){
    var e = el('div', 'leo-outil', icArme(a)); e.style.left = (LX - 60 + k * 40) + 'px'; e.style.top = '300px'; fx.appendChild(e);
    try{ e.animate([{transform:'translate(0,0) scale(1.4)', opacity:0}, {transform:'translate(0,-20px) scale(1.5)', opacity:1, offset:.2}, {transform:'translate(' + (hCx('pisteur') - LX + 40 - k * 40) + 'px,-60px) scale(.9)', opacity:1, offset:.85}, {transform:'translate(' + (hCx('pisteur') - LX + 40 - k * 40) + 'px,-40px) scale(.4)', opacity:0}], {duration:1100, delay:k * 140, easing:'ease-in-out', fill:'both'}); }catch(x){}
    setTimeout(function(){ e.remove(); }, 1500 + k * 140);
  });
}
async function finPhase(res){
  E.cine = true;
  maj(true);
  if(res === 'defaite') return defaite();
  if(res === 'victoire') return victoire();
  /* une phase est gagnée : on la garde tout de suite (Romain : « une sauvegarde automatique à chaque cinématique ») */
  var n = E.c.phase + 1;
  E.partie.faits['leo:phase'] = n; DJ.garder(E.partie);
  son('victoire');
  await (n === 2 ? cine12() : cine23());
  if(!E) return;
  E.saute = false;
  E.c.phaseSuivante();
  E.ph = E.c.etat(); E.sig = '';
  ORDRE.forEach(function(h){ remettreHeros(h); });
  E.leo.tenue(n); E.leo.teinte(null); E.leo.voile(0); E.leo.p.x = 0; E.leo.vers('garde', 1);
  q('#combat').setAttribute('data-phase', n);
  maj(true);
  titre(NOMS[n], 'Phase ' + n, 1400);
  await pause(700);
  E.cine = false; E.saute = false; E.ts = 0;
}
function defaite(){
  E.essais++;
  var t = 'Les trois héros sont au sol… Léo croise les bras. On se relève, et on essaie autrement ?';
  setTimeout(function(){
    if(!E) return;
    DJ.fenetre('<h2>' + esc(NOMS[E.c.phase]) + ' est trop fort… pour l\'instant</h2><div class="ligne">' + t + DJ.lireBtn(t) + '</div>' +
      '<div class="boutons"><button class="sombre" data-act="l-quitter">Retour à la carte</button><button class="aller guide" data-act="l-encore">Réessayer ➜</button></div>', 'leo-def');
  }, 1300);
}
async function victoire(){
  E.partie.faits['leo:phase'] = 4; DJ.garder(E.partie);
  passer(false);
  Object.keys(E.rats).forEach(function(id){ retirerRat(id); });
  nuage(false); flaque(false); noir(false, true);
  E.leo.arme(null); E.leo.teinte(null);
  bruit('leoChute', {}, ['tombe']);
  await E.leo.vers('genou', 800, 'o');
  /* la potion ne fait plus effet : il redevient Léo */
  E.leo.eclair(); E.leo.tenue(2); E.leo.visage('colere'); E.leo.vers('genou', 1);
  await attendre(500);
  await E.leo.vers('aTerre', 900, 'io'); Fx.tremble(8, 300);
  var fan = bruit('victoire', {}, ['fanfare']);
  /* ceux qui étaient au sol se relèvent : tout le monde est là pour l'écouter */
  await Promise.all(ORDRE.map(function(h, k){
    var A = E.A.h[h], s = slotH(h);
    s.classList.remove('sol', 'saigne', 'brule', 'bj', 'bc', 'proie'); try{ A._etoiles(false); }catch(e){}
    return attendre(k * 120).then(function(){ return A.ko ? A.relever() : A.joie(); }).then(function(){ try{ A.attendre(); }catch(e){} });
  })).catch(function(){});
  await attendre(400);
  E.aveu = 0; aveu();
}
/* les cinq phrases de Léo, une par une (une bulle, son 🔊, un bouton jaune) */
function aveu(){
  var c = q('#leo-cine'), k = E.aveu, t = AVEUX[k], dernier = k >= AVEUX.length - 1;
  c.classList.add('on', 'aveu');
  c.innerHTML = '<div class="leo-aveu"><div class="leo-qui">Léo</div><div class="bulle"><span class="txt">« ' + t + ' »</span>' + DJ.lireBtn(t) + '</div>' +
    '<div class="leo-points">' + AVEUX.map(function(x, j){ return '<i class="' + (j <= k ? 'on' : '') + '"></i>'; }).join('') + '</div>' +
    '<button class="aller guide" data-act="l-aveu">' + (dernier ? 'Continuer ➜' : 'Suite ➜') + '</button></div>';
}
function terminer(res){
  if(!E) return;
  var fin = E.finir;
  E.fini = true; cancelAnimationFrame(E.raf);
  try{ q('#combat').removeEventListener('pointerdown', doigt); }catch(e){}
  Object.keys(E.rats).forEach(function(id){ try{ E.rats[id].arreter(); }catch(e){} });
  ORDRE.forEach(function(h){ try{ E.A.h[h].arreter(); }catch(e){} });
  DJ.taire(); DJ.fermer();
  E = null;
  fin(res);
}

/* ====================================================================== 3. LE TEMPS QUI PASSE */
function boucle(ts){
  if(!E || E.fini) return;
  E.raf = requestAnimationFrame(boucle);
  var dt = E.ts ? Math.min(.1, (ts - E.ts) / 1000) : 0; E.ts = ts;
  if(document.hidden) return;
  E.leo.avancer(dt);
  if(E.pause || E.cine || DJ.fenetreOuverte()) return;
  var ev = E.c.avancer(dt * E.vite);
  E.temps += dt;
  if(ev.length) jouer(ev);
  maj();
  var f = E.c.fini(); if(f) finPhase(f);
}
/* tout ce qui se lit dans la photo des règles : les barres, les états, la bande */
function maj(force){
  var ph = E.ph = E.c.etat(), Z = ph.leo;
  ORDRE.forEach(function(h){
    var s = ph.heros[h], e = q('#pv-' + h), k = Math.max(0, s.pv / s.pvMax), i = q('i', e), st = E.etatsH[h] || (E.etatsH[h] = {}), slot = slotH(h);
    if(st.pv !== s.pv){ st.pv = s.pv; i.style.transform = 'scaleX(' + k + ')'; i.className = k <= .25 ? 'bas' : k <= .5 ? 'moyen' : ''; q('b', e).textContent = s.pv; }
    basc(slot, st, 'saigne', s.saigne); basc(slot, st, 'brule', s.brule); basc(slot, st, 'bj', s.bouclier === 'jaune'); basc(slot, st, 'bc', s.bouclier === 'chene');
    var et = s.etourdi > 0; if(st.etourdi !== et){ st.etourdi = et; try{ if(!s.sol) E.A.h[h]._etoiles(et); }catch(x){} }
    var pr = Z.vise ? Z.vise.cibles.indexOf(h) >= 0 : false;
    if(st.proie !== pr){ st.proie = pr; slot.classList.toggle('proie', pr); if(pr) q('.l-proie b', slot).textContent = Z.vise.part ? '−' + Math.round(Z.vise.part * 100) + ' %' : Z.vise.degats ? '−' + Z.vise.degats + (Z.vise.fois > 1 ? ' ×' + Z.vise.fois : '') : ''; }
  });
  var b = q('#leo-barre'), kz = Math.max(0, Z.pv / Z.pvMax);
  if(E.pvLeo !== Z.pv){ E.pvLeo = Z.pv; q('.barre i', b).style.transform = 'scaleX(' + kz + ')'; q('b', b).textContent = Z.pv; }
  var ch = (Z.saigne ? '<i>🩸' + (Z.saigne > 1 ? '×' + Z.saigne : '') + '</i>' : '') + (Z.brule ? '<i>🔥</i>' : '') + (Z.ralenti ? '<i>❄️</i>' : '');
  if(E.chLeo !== ch){ E.chLeo = ch; q('#leo-etats').innerHTML = ch; }
  if(E.gel !== Z.ralenti){ E.gel = Z.ralenti; if(!E.noirci) E.leo.teinte(Z.ralenti ? 'gel' : null); }
  /* l'élan d'une attaque qui fonce : il part juste avant l'impact (l'horloge de Léo fait foi, même ralentie par le givre) */
  if(E.elan && Z.etape === 'elan' && Z.reste <= E.elan.avant && !E.elan.parti){ E.elan.parti = true; E.elan.fn(); }
  Object.keys(E.rats).forEach(function(id){ var a = E.rats[id], r = null; ph.rats.forEach(function(x){ if(x.id === id) r = x; }); if(r && a.ouvertVu !== r.ouvert){ a.ouvertVu = r.ouvert; a.el.classList.toggle('ouvert', r.ouvert); } });
  accorder();
  suite(Z);
  bande(force);
}
/* les icônes de la rune de l'œil, aux pieds de Léo : celle qui vient (en grand), puis les deux suivantes (en petit) */
function icAttaque(x){
  if(x.ic === 'meule') return '<svg viewBox="-50 -56 100 100" width="100%" height="100%" aria-hidden="true">' + window.LeoAnime.ARMES.meule() + '</svg>';
  return x.ic;
}
function suite(Z){
  var e = q('#leo-suite'); if(!e) return;
  var l = Z.suite || [], sig = l.map(function(x){ return x.att + (x.enCours ? '!' : ''); }).join(',');
  if(sig === E.suiteSig) return;
  E.suiteSig = sig;
  e.className = l.length ? 'on' : '';
  e.innerHTML = l.map(function(x, k){ return '<i class="' + (k === 0 ? 'grand' : 'petit') + (x.enCours ? ' cours' : '') + '" data-att="' + x.att + '" aria-label="' + esc(x.nom) + '">' + icAttaque(x) + '</i>'; }).join('');
}
function basc(slot, st, cls, on){ on = !!on; if(st[cls] !== on){ st[cls] = on; slot.classList.toggle(cls, on); } }
/* les règles font foi : un héros au sol dans les règles est au sol à l'écran (et l'inverse) — sans couper un geste en cours */
function accorder(){
  ORDRE.forEach(function(h){
    var s = E.c.h[h], A = E.A.h[h], slot = slotH(h), st = E.etatsH[h];
    if(A._occupe) return;
    if(s.sol && !A.ko){ slot.classList.add('sol'); Promise.resolve(A.tomber()).catch(function(){}); }
    else if(!s.sol && A.ko){ slot.classList.remove('sol'); Promise.resolve(A.relever()).catch(function(){}).then(function(){ try{ A.attendre(); if(E && E.c.h[h].etourdi > E.c.t) A._etoiles(true); }catch(e){} }); }
  });
}

/* ====================================================================== 4. LA BANDE DU BAS */
function icArme(a){ return '<svg viewBox="-50 -50 100 100" width="38" height="38" aria-hidden="true"><g transform="' + ({crochet:'translate(-17,-36) scale(1.08)', fleau:'translate(-4,-39) scale(.63)', marteau:'translate(0,-35) scale(.76)', faux:'translate(26,-26) scale(.5)', gourde:'translate(0,-24) scale(1.4)'})[a] + '">' + window.LeoAnime.ARMES[a]() + '</g></svg>'; }
function infoCarte(g){
  var id = g.geste, k = id.slice(0, 2), R;
  if(k === 'l:'){ var Aa = L.ARMES[g.arme]; return {ic:icArme(g.arme), nom:Aa.nom, cls:' leo-arme', reste:g.reste}; }
  if(k === 'p:'){ R = D.RECETTES[id.slice(2)]; return {ic:DJ.potion(id.slice(2)) + (g.heros === 'pisteur' ? '<i class="fl">🏹</i>' : ''), nom:R.petit || R.nom}; }
  if(k === 'f:'){ var O = D.OBJETS[id.slice(2)]; return {ic:O.ic || '🏹', nom:O.petit || (O.carte && O.carte.nom) || O.nom}; }
  if(id === 'a:cristal-lune') return {ic:'🌙', nom:'Lumière'};
  if(id === 'a:baton-chene') return {ic:'🛡️🛡️🛡️', nom:'Chêne −50 %', cls:' chene'};
  if(id === 'bouclier') return {ic:'🛡️', nom:'Bouclier −75 %', cls:' jaune'};
  R = D.GESTES[id];
  return {ic:R.ic, nom:id === 'fleche' ? 'Flèche' : (R.arme || R.nom)};
}
function carte(g){
  var R = infoCarte(g), cls = (!g.permis ? ' off' : '') + (R.cls || '') + (R.nom.length > 10 ? ' long' : '');
  var usure = R.reste != null ? '<i class="l-usure u' + R.reste + '">' + R.reste + '</i>' + (R.reste < 3 ? '<svg class="l-fissure" viewBox="0 0 84 59" preserveAspectRatio="none"><path d="M20 0 L30 16 L24 26 L36 40' + (R.reste < 2 ? ' L30 59 M30 16 L46 22 L58 12 M36 40 L52 46 L62 59' : '') + '" fill="none" stroke="#0c0810" stroke-width="2.2" stroke-linejoin="round"/></svg>' : '') : '';
  return '<button class="carte mini' + cls + '" data-act="l-geste" data-h="' + g.heros + '" data-id="' + g.geste + '" aria-label="' + esc(R.nom) + '"><span class="c-ic">' + R.ic + '</span><b>' + esc(R.nom) + '</b>' + usure + '</button>';
}
/* UNE SEULE RANGÉE D'ICÔNES (Romain, 14 novembre) : un cadre par héros, à sa couleur, dans l'ordre où ils sont à l'écran ; dedans,
   ses icônes de la phase, sur deux lignes. Plus d'onglets, plus de cible : on pianote. */
function bande(force){
  var ph = E.ph, B = E.c.barre();
  var sig = B.map(function(g){ return g.heros[0] + g.geste + (g.permis ? 1 : 0) + (g.reste || ''); }).join(',') + '|' +
    ORDRE.map(function(x){ var s = ph.heros[x]; return (s.sol ? 's' : '') + (s.etourdi > 0 ? 'e' : '') + (s.attrape ? 'a' : ''); }).join(',') + '|' + (E.cine ? 'c' : '');
  if(force || sig !== E.sig){
    E.sig = sig; E.barre = B;
    bandeEl.innerHTML = ORDRE.map(function(h){
      var l = B.filter(function(g){ return g.heros === h; }), st = ph.heros[h], cols = Math.max(2, Math.ceil(l.length / 2));
      var et = st.sol ? '💫 au sol' : st.attrape ? '🪝 attrapé' : st.etourdi > 0 ? '💫 étourdi' : '';
      return '<div class="lb-g g-' + h + (st.sol ? ' sol' : '') + (et ? ' pris' : '') + '" data-h="' + h + '" style="flex:' + cols + ' 1 0"><div class="lb-nom"><b>' + D.HEROS[h].nom + '</b><em>' + et + '</em></div>' +
        '<div class="lb-cartes" style="grid-template-columns:repeat(' + cols + ',1fr)">' + l.map(carte).join('') + '</div><u id="lbo-' + h + '"></u></div>';
    }).join('');
    bandeEl.classList.toggle('attend', !!E.cine);
  }
  ORDRE.forEach(function(x){
    var st = ph.heros[x], u = q('#lbo-' + x), tot = E.occ[x] || 1;
    if(u) u.style.transform = 'scaleX(' + Math.max(0, Math.min(1, st.occupe / tot)).toFixed(3) + ')';
  });
}

/* ====================================================================== 5. LES DOIGTS */
function mot(x, y, t, cls){ Fx.mot(x, y == null ? 96 : y, t, cls || 'refus'); }
function refuser(h, m){ son('clic'); mot(hCx(h), 96, m); }
/* une icône touchée : le geste part tout de suite, sur la cible que les règles choisissent */
function toucherIcone(h, id){
  var g = (E.c.barre().filter(function(x){ return x.heros === h && x.geste === id; })[0]);
  if(!g) return;
  bruit('icone', {}, ['clic']);
  if(!g.permis){ refuser(h, g.mot || L.MOTS.impossible); return; }
  agir(h, id);
}
function agir(h, geste, cible){
  if(!E || E.cine || E.pause) return false;
  var ev = E.c.agir(h, geste, cible);
  if(ev.length && ev[0].t === 'refus'){ refuser(h, ev[0].mot); maj(true); return false; }
  jouer(ev);
  maj(true);
  return true;
}
/* (les icônes répondent dès que le doigt se pose : c'est un combat de vitesse) */
var dernierDoigt = {a:null, id:null, t:0};
function doigt(ev){
  if(!E || E.fini) return;
  var b = ev.target.closest ? ev.target.closest('[data-act]') : null; if(!b) return;
  var a = b.getAttribute('data-act');
  if(a !== 'l-geste') return;
  dernierDoigt = {a:a, id:b.getAttribute('data-h') + '/' + b.getAttribute('data-id'), t:Date.now()};
  acte(a, b.getAttribute('data-id'), b);
}
function acte(a, id, b){
  if(SALLE.Son && SALLE.Son.demarrer) SALLE.Son.demarrer();
  if(E.cine || E.pause || DJ.fenetreOuverte()) return;
  if(a === 'l-geste') toucherIcone(b.getAttribute('data-h'), id);
}
DJ.toucher(function(a, id, b){
  if(!E) return false;
  if(a === 'l-perso') return true;                                   /* (toucher un héros ou Léo ne fait plus rien : les icônes choisissent) */
  if(a === 'l-geste'){
    /* (le doigt a déjà été entendu au moment où il s'est posé) */
    if(!(dernierDoigt.a === a && dernierDoigt.id === b.getAttribute('data-h') + '/' + id && Date.now() - dernierDoigt.t < 700)) acte(a, id, b);
    return true;
  }
  if(a === 'l-passer'){ E.saute = true; return true; }
  if(a === 'l-pause'){
    if(E.cine || E.fini) return true;
    var t = 'Le combat attend. Léo aussi… mais il n\'aime pas ça.';
    DJ.fenetre('<h2>Pause</h2><div class="ligne">' + t + DJ.lireBtn(t) + '</div><div class="boutons"><button class="sombre" data-act="l-quitter">Retour à la carte</button><button class="aller guide" data-act="fermer">Reprendre ➜</button></div>');
    return true;
  }
  if(a === 'l-encore'){ DJ.fermer(); demarrerPhase(E.c.phase); return true; }
  if(a === 'l-quitter'){ terminer('quitte'); return true; }
  if(a === 'l-aveu'){
    DJ.taire();
    if(E.aveu >= AVEUX.length - 1){ terminer('victoire'); return true; }
    E.aveu++; aveu();
    return true;
  }
  return false;
});

/* ====================================================================== 6. JOUER CE QUE LES RÈGLES ANNONCENT */
function ancreDe(id, nom){ if(id === 'leo') return E.leo.ancre(nom); var a = E.rats[id]; return a ? a.ancre(nom) : E.leo.ancre(nom); }
function viser(id){ if(id === 'leo'){ var p = E.leo.ancre('centre'); return {x:p.x - 14, y:p.y + 10}; } var a = E.rats[id]; return a ? a.cible(!!a.ouvertVu) : E.leo.ancre('centre'); }
function milieu(){ return {x:hCx('alchimiste') + 6, y:150}; }
var NOMS_POTION = {givre:1, acide:1, huile:1, colle:1}, SON_POTION = {givre:'potGivre', acide:'potAcide', huile:'potHuile', colle:'potColle'};
function tard(s, fn){ var e = E; setTimeout(function(){ if(E === e && !E.fini) try{ fn(); }catch(x){ if(window.console) console.error(x); } }, s * 1000 / E.vite); }

function jouer(evs){
  for(var k = 0; k < evs.length; k++){ try{ un(evs[k]); }catch(e){ if(window.console) console.error('Léo, évènement ' + evs[k].t, e); } }
}
function un(ev){
  var h = ev.heros, p, a;
  switch(ev.t){
    case 'geste': return geste(ev);
    case 'refus': return refuser(h, ev.mot);
    case 'annule': E.jet[h] = (E.jet[h] || 0) + 1; return;
    case 'arme':
      if(ev.reste <= 0) tard(L.DUREES.arme.impact + .1, function(){ bruit('leoCasse', {}, ['clic']); mot(hCx('pisteur'), 120, L.MOTS.casse); });
      return;
    case 'oeil': p = {x:(hCx('pisteur') + LX) / 2, y:150}; Fx.onde(p.x, p.y, '#bff8ff', 320, 700); son('magie', .05); return;
    case 'mot': p = ev.sur === 'leo' || E.rats[ev.sur] ? ancreDe(ev.sur, 'haut') : {x:hCx(ev.sur), y:110}; mot(p.x, Math.max(100, p.y - 4), ev.texte); return;
    case 'degats': return h ? degatsHeros(ev) : degatsEnnemi(ev);
    case 'soin': return soin(ev);
    case 'tombe': slotH(h).classList.add('sol'); son('tombe'); try{ E.A.h[h]._etoiles(false); }catch(e){} Promise.resolve(E.A.h[h].tomber()).catch(function(){}); return;
    case 'releve':
      slotH(h).classList.remove('sol'); son('coeur'); Fx.chiffre(hCx(h), 170, '+' + ev.pv, 'soin');
      Promise.resolve(E.A.h[h].relever()).catch(function(){}).then(function(){ try{ E.A.h[h].attendre(); }catch(e){} });
      return;
    case 'bouclier':
      if(ev.on) son('dome');
      else if(ev.casse){ son('absorbe'); Fx.onde(hCx(h), 220, '#ffe9a0', 200, 400); }
      return;
    case 'etat':
      if(ev.nom === 'etourdi' && ev.on){ mot(hCx(h), 110, L.MOTS.etourdi); }
      if(ev.nom === 'saigne' && ev.on){ mot(hCx(h), 126, 'Il saigne !'); }
      if(ev.nom === 'attrape') attrape(h, ev.on);
      return;
    case 'leo': return leo(ev);
    case 'leo-etat': return leoEtat(ev);
    case 'boum': return boum(ev);
    case 'noir': return noir(ev.on, false, ev.par);
    case 'soin-leo': p = E.leo.ancre('haut'); Fx.chiffre(p.x, Math.max(96, p.y + 20), '+' + ev.n, 'soin'); return;
    case 'rat': return rat(ev);
    case 'phase-fin': case 'phase': case 'fin': return;
  }
}

/* ---------- les gestes des héros : l'animation part ; son effet tombera tout seul, à l'heure dite par les règles ---------- */
function geste(ev){
  var h = ev.heros, g = ev.geste, c = ev.cible, H = E.A.h, to, R, coul;
  E.occ[h] = ev.fin;
  /* (un geste coupé par un étourdissement ne fait plus ni bruit ni éclaboussure : son jeton n'est plus le bon) */
  var jet = E.jet[h] = (E.jet[h] || 0) + 1, apres = function(s, fn){ tard(s, function(){ if(E.jet[h] === jet) fn(); }); };
  if(g === 'fleche' || g.indexOf('f:') === 0 || (h === 'pisteur' && g.indexOf('p:') === 0)){
    var type = g === 'fleche' ? 'normale' : g === 'f:fleches-lourdes' ? 'lourde' : g.indexOf('f:') === 0 ? 'normale' : g.slice(2);
    to = viser(c);
    bruit('arc', {cale:1.32}, ['arc']); bruit('vol', {dt:1.32}); if(type === 'lourde') bruit('flecheLourde', {dt:1.32});
    Promise.resolve(H.pisteur.tirer(fx, to, type, {sol:SOL + 6})).catch(function(){});
    R = D.RECETTES[type];
    apres(ev.impact, function(){ bruit('chairF'); if(R){ son('verre'); Fx.eclabousse(to.x, to.y, R.coul, true); if(SON_POTION[type]) bruit(SON_POTION[type]); } });
    return;
  }
  if(g === 'dague' || (g.indexOf('l:') === 0 && g !== 'l:gourde')){
    to = viser(c); var arme = g === 'dague' ? null : g.slice(2);
    bruit('swish', {cale:.7}, ['dague']);
    Promise.resolve(H.pisteur.dague(fx, {x:Math.max(hCx('pisteur') + 90, to.x - 70), y:to.y})).catch(function(){});
    if(arme){
      /* l'outil de Léo, dans la main du Pisteur : on le voit s'abattre */
      var e = el('div', 'leo-outil frappe', icArme(arme)); e.style.left = (to.x - 60) + 'px'; e.style.top = (to.y - 70) + 'px'; fx.appendChild(e);
      try{ e.animate([{transform:'translate(-140px,10px) rotate(-70deg) scale(1.2)', opacity:0}, {transform:'translate(-40px,-30px) rotate(-40deg) scale(1.9)', opacity:1, offset:.55}, {transform:'translate(0,10px) rotate(30deg) scale(1.9)', opacity:1, offset:.75}, {transform:'translate(0,10px) rotate(30deg) scale(1.9)', opacity:0}], {duration:ev.impact * 1000 / E.vite + 260, easing:'ease-in', fill:'both'}); }catch(x){}
      setTimeout(function(){ e.remove(); }, ev.impact * 1000 + 400);
    }
    apres(ev.impact, function(){ bruit(arme === 'marteau' ? 'leoSonne' : arme === 'faux' ? 'leoFaux' : 'chairD'); });
    return;
  }
  if(g === 'l:gourde'){
    to = hPt(c);
    var go = el('div', 'leo-outil', icArme('gourde')); go.style.left = (hCx('pisteur') - 20) + 'px'; go.style.top = '170px'; fx.appendChild(go);
    try{ go.animate([{transform:'translate(0,0) scale(1.2)'}, {transform:'translate(' + ((to.x - hCx('pisteur')) / 2) + 'px,-90px) scale(1.5) rotate(180deg)', offset:.5}, {transform:'translate(' + (to.x - hCx('pisteur')) + 'px,-10px) scale(1.2) rotate(360deg)'}], {duration:ev.impact * 1000 / E.vite, easing:'ease-in-out', fill:'both'}); }catch(x){}
    setTimeout(function(){ go.remove(); }, ev.impact * 1000 + 60);
    apres(ev.impact, function(){ son('bulles', .5); });
    return;
  }
  if(g === 'herbes'){ Promise.resolve(H.alchimiste.herbes(fx, milieu())).catch(function(){}); return; }
  if(g === 'louche'){
    to = ancreDe(c, 'centre');
    Promise.resolve(H.alchimiste.louche(fx, to)).catch(function(){});
    apres(ev.impact, function(){ son('bong'); Fx.onde(to.x, to.y, '#fff1b8', 260, 800); Fx.tremble(7, 300); });
    return;
  }
  if(g.indexOf('p:') === 0){
    var rid = g.slice(2); R = D.RECETTES[rid]; coul = NOMS_POTION[rid] ? rid : R.coul;
    to = R.vise === 'bete' ? viser(c) : R.vise === 'salle' ? E.leo.ancre('centre') : (R.vise === 'heros' || R.vise === 'sol') && c ? hPt(c) : milieu();
    son('bulles', .5);
    Promise.resolve(H.alchimiste.preparer(coul)).then(function(){ if(!E) return; son('vole', .5); return H.alchimiste.lancer(fx, to, coul); }).catch(function(){});
    apres(ev.impact, function(){ son('verre'); if(SON_POTION[rid]) bruit(SON_POTION[rid]); Fx.eclabousse(to.x, to.y, R.coul); if(R.vise === 'salle'){ try{ Fx.nuage(to.x, to.y); }catch(x){} } });
    return;
  }
  if(g === 'oeil'){
    son('magie');
    var oe = el('div', 'oeil-rune', '👁️'); oe.style.left = ((hCx('pisteur') + LX) / 2) + 'px'; oe.style.top = '150px'; fx.appendChild(oe); setTimeout(function(){ oe.remove(); }, 1150);
    Promise.resolve(H.sage.etudier()).catch(function(){});
    return;
  }
  if(g === 'rune'){ son('magie'); to = ancreDe(c, 'centre'); Promise.resolve(H.sage.sort(fx, to, {cristal:false})).catch(function(){}); apres(ev.impact, function(){ Fx.eclat(to.x, to.y, 240, 'radial-gradient(closest-side,#fff,rgba(191,248,255,.9) 30%,rgba(63,208,255,0))', 500); }); return; }
  if(g === 'a:cristal-lune'){
    son('magie'); bruit('cristal');
    var pts = Object.keys(E.rats).map(function(id){ return E.rats[id].ancre('centre'); }); if(!pts.length) pts = [E.leo.ancre('centre')];
    Promise.resolve(H.sage.eclairSalle ? H.sage.eclairSalle(fx, {cibles:pts}) : H.sage.sort(fx, pts[0])).catch(function(){});
    return;
  }
  if(g === 'bouclier' || g === 'a:baton-chene'){
    var l = [].concat(c || []), conts = l.map(function(x){ return q('.acteur', slotH(x)); }), chene = g !== 'bouclier';
    if(chene) bruit('baton');
    /* (le dôme de l'animation n'est que le geste : le bouclier qui reste, c'est la bulle posée d'après les règles — maj) */
    Promise.resolve(H.sage.bouclier(fx, conts.length > 1 ? conts : conts[0], {pct:chene ? 50 : 75, sorte:chene ? 'chene' : 'jaune', sansTour:true}))
      .then(function(d){ setTimeout(function(){ [].concat(d || []).forEach(function(x){ try{ if(x && x.retirer) x.retirer(); }catch(e){} }); }, 420); }).catch(function(){});
    return;
  }
}

/* ---------- les coups ---------- */
function degatsHeros(ev){
  var h = ev.heros, x = hCx(h), slot = slotH(h);
  if(ev.coule){
    /* le saignement, la brûlure : de petits chiffres, sans secousse */
    Fx.chiffre(x + (ev.cause === 'brule' ? 22 : -22), 150, '−' + ev.n, ev.cause === 'brule' ? 'feu petit' : 'petit');
    if(ev.cause === 'saigne') bruit('leoSaigne', {}, null);
    if(ev.cause === 'boum') frappe(slot, h);
    return;
  }
  Fx.chiffre(x, 138, '−' + ev.n, ev.n >= 25 ? 'gros' : '');
  if(ev.bouclier) Fx.bulleTexte(x, 296, '🛡️ −' + (ev.brut - ev.n), 'bleu');
  frappe(slot, h);
}
function frappe(slot, h){
  try{ E.A.h[h]._flash(); slot.animate([{transform:'translateX(0)'}, {transform:'translateX(-16px)', offset:.25}, {transform:'translateX(0)'}], {duration:260, easing:'ease-out'}); }catch(e){}
}
function degatsEnnemi(ev){
  var id = ev.cible, p = ancreDe(id, 'haut'), c = ancreDe(id, 'centre');
  if(id === 'leo'){
    if(ev.n <= 0){ if(ev.mot) mot(p.x, Math.max(100, p.y + 6), ev.mot); return; }
    if(ev.coule){ Fx.chiffre(p.x + (ev.cause === 'saigne' ? -34 : 34) + (Math.random() * 16 - 8), Math.max(96, p.y + 30), '−' + ev.n, ev.cause === 'saigne' ? 'petit' : 'feu petit'); if(ev.cause === 'saigne' && Math.random() < .5) bruit('leoSaigne', {}, null); return; }
    Fx.chiffre(p.x, Math.max(96, p.y + 14), '−' + ev.n, ev.n >= 150 ? 'gros' : '');
    E.leo.eclair();
    if(ev.n >= 150) Fx.tremble(8, 300);
    return;
  }
  var a = E.rats[id]; if(!a) return;
  Fx.chiffre(c.x, Math.max(96, p.y + 6), '−' + ev.n, ev.n >= 25 ? 'gros' : ev.n <= 5 ? 'petit' : '');
  barreRat(id, ev.pv);
  if(ev.cause === 'feu') son('brule');
  son('couine', 0, 1.2);
  try{ a.touche(ev.cause === 'crochet' || ev.cause === 'fleau' ? 'dague' : ev.cause === 'lourde' ? 'fleche' : ev.cause); }catch(e){}
}
function soin(ev){
  var h = ev.heros, x = hCx(h);
  son('soin');
  for(var k = 0; k < 5; k++) (function(k){ var e = el('div', 'etincelle', ev.par === 'herbes' ? '🌿' : '✨'); e.style.left = (x - 40 + k * 20) + 'px'; e.style.top = (240 - (k % 3) * 24) + 'px'; e.style.animationDelay = (k * 60) + 'ms'; fx.appendChild(e); setTimeout(function(){ e.remove(); }, 1200); })(k);
  if(ev.n > 0) Fx.chiffre(x, 170, '+' + ev.n, 'soin');
}

/* ---------- Léo ---------- */
/* ce qu'il fait, attaque par attaque : [la pose de la prise, la pose de l'élan, la pose du coup, le son, fonce-t-il ?] */
var JEU = {
  fleau:['montre', 'leve', 'frappe', 'leoFleau', 290], charge:['pret', 'pret', 'court', 'leoCharge', 330], marteau:['montre', 'leve', 'frappe', 'leoMarteau', 300],
  meule:['montre', 'leve', 'frappe', 'leoMeule', 0], crochet:['montre', 'poingA', 'tient', 'leoCrochet', 0], cape:['capeA', 'capeA', 'capeB', 'leoCape', 0],
  sifflet:['siffle', 'siffle', 'siffle', 'leoSifflet', 0], poing:['poingA', 'poingA', 'poingB', 'leoPoing', 300], faux:['montre', 'fauxA', 'fauxB', 'leoFaux', 240],
  saut:['accroupi', 'accroupi', 'accroupi', 'leoSaut', 300], gourde:['montre', 'boit', 'boit', 'leoGourde', 0], lancer:['poingA', 'poingA', 'poingB', 'leoLancer', 0],
  poing3:['poingA', 'poingA', 'poingB', 'leoPoing', 320], rafale:['poingA', 'poingA', 'poingB', 'leoRafale', 320], hurlement:['accroupi', 'rugit', 'rugit', 'leoHurlement', 0],
  attrape:['gratte', 'court', 'frappe', 'leoAttrape', 340], souffle:['rugit', 'rugit', 'souffle', 'leoSouffle', 120]
};
var ARME_VUE = {fleau:'fleau', marteau:'marteau', meule:'meule', crochet:'crochet', faux:'faux', gourde:'gourde', sifflet:'sifflet', lancer:'rat'};
/* il racle le sol, prêt à charger : deux poses qui alternent, jusqu'à ce qu'il parte (ou qu'on l'arrête) */
function racler(){
  var jeton = E.racle = (E.racle || 0) + 1, Z = E.leo;
  (function tour(k){
    if(!E || E.racle !== jeton || E.fini) return;
    if(E.elan && E.elan.parti) return;
    Promise.resolve(Z.vers(k % 2 ? 'pret' : 'pretB', (k % 2 ? 300 : 240) / E.vite, 'io')).then(function(){ setTimeout(function(){ tour(k + 1); }, 60); });
  })(0);
}
function leo(ev){
  var Z = E.leo, J = JEU[ev.att] || ['garde', 'garde', 'garde', null, 0], A = ev.att ? L.ATTAQUES[ev.att] : null, k = 1000 / E.vite;
  if(ev.quoi !== 'elan') E.racle = (E.racle || 0) + 1;                 /* (tout autre évènement arrête de racler) */
  switch(ev.quoi){
    case 'prise':
      E.elan = null;
      /* (Romain : « il montre l'arme qu'il va prendre » — sauf dans le noir : on ne voit rien) */
      Z.arme(ARME_VUE[ev.att] || null); Z.visage('colere');
      Z.vers(J[0], Math.max(120, Math.min(420, ev.duree * k * .8)), 'o');
      if(ev.att === 'crochet') bruit('leoFarine', {}, ['vole']);
      return;
    case 'elan':
      Z.vers(J[1], Math.max(120, Math.min(520, ev.duree * k * .7)), 'io');
      if(J[3]) bruit(J[3], {cale:ev.duree / E.vite}, null);
      if(ev.att === 'hurlement' || ev.att === 'souffle') tard(Math.max(0, ev.duree - .3), function(){ Z.visage('cri'); });
      if(ev.att === 'gourde') Z.visage('boit');
      /* la charge (14 novembre) : tout le temps qu'il se prépare, sa jambe de derrière racle le sol — on VOIT qu'il va partir */
      if(ev.att === 'charge') racler();
      /* une attaque qui fonce : il part un peu avant l'impact */
      if(J[4]) E.elan = {avant:.24, parti:false, fn:function(){ E.racle = (E.racle || 0) + 1; Z.vers({x:-J[4], torse:36, tete:8, brasG:-50, avantG:80, brasD:60, jG:-30, jD:28, y:ev.att === 'saut' ? -150 : 10}, 200 / E.vite, 'i'); }};
      return;
    case 'impact': return leoImpact(ev, J, A);
    case 'retour':
      E.elan = null; Z.visage('colere');
      Z.vers({x:0, torse:5, tete:0, brasG:22, avantG:62, brasD:-18, y:0, r:0}, Math.max(200, ((A && A.retour) || .6) * k * .9), 'io');
      return;
    case 'repos': Z.arme(null); return;
    case 'coupe':
      /* le marteau le sonne ; la lumière du bâton de lune l'éblouit (Romain, 14 novembre) */
      var lune = ev.par === 'lune';
      E.elan = null; if(!lune) bruit('leoSonne', {}, ['bong']); Z.visage('ko');
      var p = Z.ancre('haut'); mot(p.x, Math.max(100, p.y), lune ? L.MOTS.ebloui : 'Coupé !'); Fx.onde(p.x, p.y + 40, lune ? '#eef4ff' : '#fff1b8', lune ? 300 : 220, 500);
      Z.vers('sonne', 200, 'o'); tard((lune ? L.ECLAIR : L.SONNE) - .2, function(){ Z.visage('colere'); Z.arme(null); });
      return;
    case 'ebloui':
      Z.visage('ko'); var pe = Z.ancre('haut'); mot(pe.x, Math.max(100, pe.y), L.MOTS.ebloui);
      tard(ev.duree - .2, function(){ Z.visage('colere'); });
      return;
    case 'glisse':
      E.elan = null; bruit('leoGlisse', {cale:.3}, ['tombe']); Z.visage('ko'); Z.arme(null);
      Z.suite([[{x:-110, torse:-30, tete:-20, brasG:150, avantG:20, brasD:-150, jG:60, jD:40, y:-40, r:46}, 260 / E.vite, 'o'], [{x:-110, torse:-6, tete:-12, brasG:120, avantG:30, brasD:-120, jG:26, jD:8, y:0, r:86}, 240 / E.vite, 'i']]).then(function(){ if(E) Fx.tremble(10, 350); });
      var pg = Z.ancre('haut'); mot(pg.x - 60, 150, 'Il glisse !');
      return;
    case 'debout': Z.visage('colere'); Z.vers({x:0, torse:5, brasG:22, avantG:62, brasD:-18, y:0, r:0}, 500 / E.vite, 'b'); return;
    case 'tient': return;
    case 'lache': return;
  }
}
function leoImpact(ev, J, A){
  var Z = E.leo, att = ev.att, l = ev.cibles || [], c;
  E.elan = null;
  Z.vers(J[2] === 'court' || J[4] ? {x:Z.p.x, torse:32, tete:12, brasG:64, avantG:6, brasD:36, jG:-16, jD:14, y:12} : J[2], 110 / E.vite, 'o');
  if(att === 'fleau' || att === 'marteau' || att === 'charge' || att === 'saut' || att === 'attrape' || att === 'rafale') Fx.tremble(att === 'saut' ? 16 : 10, att === 'saut' ? 600 : 320);
  if(att === 'meule'){
    /* la meule de paille roule sur tout le monde */
    Z.arme(null);
    var m = el('div', 'leo-meule'); m.innerHTML = '<svg viewBox="-50 -56 100 100" width="96" height="96">' + window.LeoAnime.ARMES.meule() + '</svg>'; m.style.left = (LX - 120) + 'px'; m.style.top = '236px'; fx.appendChild(m);
    try{ m.animate([{transform:'translateX(0) rotate(0deg)'}, {transform:'translateX(-860px) rotate(-900deg)'}], {duration:700, easing:'linear', fill:'both'}); }catch(x){}
    setTimeout(function(){ m.remove(); }, 760);
  }
  if(att === 'faux'){ var s = el('div', 'leo-fauche'); fx.appendChild(s); setTimeout(function(){ s.remove(); }, 420); }
  if(att === 'souffle'){ var f = el('div', 'leo-souffle'); f.style.left = (hCx('sage') - 60) + 'px'; f.style.width = (E.leo.ancre('tete').x - hCx('sage') + 40) + 'px'; f.style.top = (E.leo.ancre('tete').y - 30) + 'px'; fx.appendChild(f); setTimeout(function(){ f.remove(); }, 900); son('brule'); }
  if(att === 'hurlement' || att === 'saut'){ c = Z.ancre(att === 'saut' ? 'pieds' : 'tete'); [0, 140, 280].forEach(function(d){ setTimeout(function(){ if(E) Fx.onde(c.x, c.y, att === 'saut' ? '#d8c8a8' : '#ffb0a0', 520, 700); }, d); }); }
  if(att === 'sifflet'){ c = Z.ancre('tete'); ['♪', '♫', '♪'].forEach(function(n, k){ setTimeout(function(){ if(E) Fx.mot(c.x - 40 - k * 26, c.y - 10 - k * 16, n, 'croc'); }, k * 120); }); }
  if(att === 'gourde'){ c = Z.ancre('centre'); Fx.onde(c.x, c.y, '#8cf08a', 300, 700); }
  if(att === 'lancer' && l[0]){
    Z.arme(null);
    var r = el('div', 'leo-outil', '<svg viewBox="-34 -22 60 44" width="60" height="44">' + window.LeoAnime.ARMES.rat() + '</svg>'), d = Z.ancre('main'), to = hPt(l[0]); r.style.left = d.x + 'px'; r.style.top = d.y + 'px'; fx.appendChild(r);
    try{ r.animate([{transform:'translate(0,0) rotate(0deg)'}, {transform:'translate(' + (to.x - d.x) + 'px,' + (to.y - d.y) + 'px) rotate(-720deg)'}], {duration:180, fill:'both'}); }catch(x){}
    setTimeout(function(){ r.remove(); son('morsure'); }, 200);
  }
  if(att === 'crochet' && l[0]){
    /* la chaîne file hors du nuage */
    var ch = el('div', 'leo-chaine'), x1 = hCx(l[0]) + 20, x2 = Z.ancre('centre').x - 40; ch.style.left = x1 + 'px'; ch.style.width = (x2 - x1) + 'px'; ch.style.top = '214px'; fx.appendChild(ch); setTimeout(function(){ ch.remove(); }, 380);
  }
  if(att === 'attrape' && l.length > 1){
    /* il attrape le premier, et frappe le second avec */
    var s1 = slotH(l[0]), dx = hCx(l[1]) - hCx(l[0]);
    try{ s1.animate([{transform:'translate(0,0) rotate(0)'}, {transform:'translate(' + (dx * .3) + 'px,-90px) rotate(-30deg)', offset:.35}, {transform:'translate(' + (dx * .85) + 'px,-10px) rotate(40deg)', offset:.6}, {transform:'translate(0,0) rotate(0)'}], {duration:520, easing:'ease-in-out'}); }catch(x){}
  }
  if(att === 'poing' || att === 'poing3' || att === 'rafale'){ l.forEach(function(h, k){ setTimeout(function(){ if(E) Fx.eclat(hCx(h) + 20, 200, 120, 'radial-gradient(closest-side,#fff,rgba(255,220,150,.8) 40%,rgba(255,150,60,0))', 240); }, k * 50); }); }
}
function attrape(h, on){
  var s = slotH(h);
  s.classList.toggle('attrape', !!on);
  s.style.transition = 'transform .28s cubic-bezier(.5,0,.6,1), opacity .28s';
  if(on){ s.style.transform = 'translateX(' + (E.leo.ancre('centre').x - 70 - hCx(h)) + 'px)'; s.style.opacity = '.3'; mot(hCx(h), 110, L.MOTS.attrape); }
  else { s.style.transform = ''; s.style.opacity = ''; }
}
function nuage(on){ var n = q('#leo-nuage'); if(!n) return; n.style.left = (LX - 150) + 'px'; n.classList.toggle('on', !!on); E.leo.voile(on ? 1 : 0); }
function flaque(on, par){ var f = q('#leo-flaque'); if(!f) return; f.className = on ? 'on ' + (par || 'huile') : ''; f.style.left = (LX - 90) + 'px'; }
function leoEtat(ev){
  var Z = E.leo;
  if(ev.nom === 'nuage') return nuage(ev.on);
  if(ev.nom === 'flaque') return flaque(ev.on, ev.par);
  if(ev.nom === 'ralenti'){ if(ev.on){ var p = Z.ancre('centre'); Fx.onde(p.x, p.y, '#bff4ff', 300, 500); mot(p.x, Z.ancre('haut').y + 10, 'Ralenti !'); } return; }
  if(ev.nom === 'noirci'){ E.noirci = !!ev.on; Z.teinte(ev.on ? 'noirci' : (E.gel ? 'gel' : null)); Z.visage(ev.on ? 'ko' : 'colere'); if(ev.on) Z.vers('sonne', 200, 'o'); return; }
  if(ev.nom === 'saigne' && ev.on){ var ph = Z.ancre('haut'); mot(ph.x, Math.max(100, ph.y + 6), ev.n > 1 ? 'Il saigne ×' + ev.n + ' !' : 'Il saigne !'); bruit('leoTouche', {}, null); }
}
function boum(ev){
  var p = E.leo.ancre('centre');
  bruit('leoBoum', {}, ['explosion']);
  Fx.tremble(20, 800);
  Fx.eclat(p.x, p.y, 520, 'radial-gradient(closest-side,#fff,rgba(255,230,150,.95) 25%,rgba(255,140,40,.7) 55%,rgba(255,90,20,0))', 700);
  Fx.etincelles(p.x, p.y, 26, ['#ffffff', '#ffe08a', '#ff9a30'], 1.6);
  mot(p.x, Math.max(100, p.y - 120), 'BOUM !', 'croc');
  var v = q('#ecran-fx'); try{ v.animate([{background:'rgba(255,255,255,.85)'}, {background:'rgba(255,255,255,0)'}], {duration:420}); }catch(e){}
}
/* les torches s'éteignent (la cape) ; le bâton de lune les rallume */
function noir(on, vite, par){
  var c = q('#combat'); if(!c) return;
  c.classList.toggle('noir', !!on);
  if(vite) return;
  if(on){ Fx.mot(480, 120, 'Les torches !', 'refus'); }
  else { bruit('leoTorches', {}, ['magie']); if(par === 'lune') Fx.onde(hCx('sage'), 180, '#eef4ff', 900, 700); }
}

/* ---------- les rats de la phase 2 ---------- */
function barreRat(id, pv){ var e = q('#pv-' + id), a = E.rats[id]; if(!e || !a) return; q('i', e).style.transform = 'scaleX(' + Math.max(0, Math.min(1, pv / a.pvMax)) + ')'; q('b', e).textContent = pv; }
function retirerRat(id){ var a = E.rats[id]; if(!a) return; try{ a.arreter(); a.el.remove(); }catch(e){} ['zone-', 'pv-'].forEach(function(p){ var e = q('#' + p + id); if(e) e.remove(); }); delete E.rats[id]; }
function rat(ev){
  var a = E.rats[ev.id], p;
  if(ev.quoi === 'arrive'){
    var b = {id:ev.id, type:ev.type, module:ev.type === 'rat' ? 'rat' : 'ratcuir', rang:'normal', nom:L.RATS[ev.type].nom, pv:ev.pv, pvMax:ev.pv};
    a = DJ.Betes.creer(b, PLACES_RAT[ev.place] || PLACES_RAT[0], q('#persos'), fx);
    a.el.style.zIndex = 5 + ev.place; a.pvMax = ev.pv;
    E.rats[ev.id] = a;
    var z = el('div', 'zone'); z.id = 'zone-' + ev.id; z.setAttribute('data-act', 'l-perso'); z.setAttribute('data-type', 'ennemi'); z.setAttribute('data-id', ev.id);
    z.style.cssText = 'left:' + (a.cadre.x + 20) + 'px;top:' + (a.cadre.y - 10) + 'px;width:' + (a.cadre.w - 40) + 'px;height:' + (a.cadre.h + 20) + 'px';
    hud.appendChild(z);
    var pv = el('div', 'pv monstre'); pv.id = 'pv-' + ev.id; pv.innerHTML = '<div class="barre"><i></i></div><b>' + ev.pv + '</b>'; pv.style.left = (a.cadre.x + a.cadre.w * (a.rat ? .56 : .5)) + 'px';
    hud.appendChild(pv);
    son('couine', 0, 1.1);
    Promise.resolve(a.entrer('debut')).catch(function(){}).then(function(){ try{ a.attendre(); }catch(e){} });
    return;
  }
  if(!a) return;
  switch(ev.quoi){
    case 'mord':
      Promise.resolve(a.attaquer('morsure', {vers:[hPt(ev.heros)], fois:ev.fois || 1, onImpact:function(){ son('morsure'); }})).catch(function(){}).then(function(){ try{ a.attendre(); }catch(e){} });
      return;
    case 'ebloui': bruit(ev.par === 'huile' ? 'ratHuile' : 'ratLumiere', {}, ['couine', 0, 1.3]); try{ a.etat(ev.par === 'huile' ? 'dos' : 'ebloui', true); }catch(e){} a.eb = ev.par === 'huile' ? 'dos' : 'ebloui'; return;
    case 'voit': try{ a.etat('ebloui', false); }catch(e){} return;
    case 'libre': try{ a.etat(ev.de === 'dos' ? 'dos' : 'colle', false); }catch(e){} return;
    case 'colle': bruit('ratColle', {}, ['splotch']); try{ a.etat('colle', true); }catch(e){} return;
    case 'enrage': try{ a.etat('enrage', true); }catch(e){} return;
    case 'nu':
      bruit('cuirCasque', {}, ['metal']); p = a.ancre('haut'); mot(p.x, Math.max(100, p.y - 4), 'Sans armure !');
      /* (l'acide ronge l'armure du rat cuirassé : son module le joue tout seul ; le crochet la fait sauter pareil) */
      try{ a.touche('acide'); }catch(e){}
      return;
    case 'meurt':
      son('couine', 0, .8, 1.3);
      ['zone-', 'pv-'].forEach(function(pp){ var e = q('#' + pp + ev.id); if(e) e.remove(); });
      delete E.rats[ev.id];
      Promise.resolve(ev.par === 'chef' ? a.fuir() : a.mourir()).catch(function(){}).then(function(){ setTimeout(function(){ try{ a.arreter(); a.el.remove(); }catch(e){} }, 900); });
      return;
  }
}

DJ.Leo = {
  preparer:preparer, lancer:lancer, AVEUX:AVEUX,
  etat:function(){ return E ? {phase:E.c.phase, cine:E.cine, pause:E.pause, barre:E.c.barre(), photo:E.c.etat(), aveu:E.aveu == null ? null : E.aveu, essais:E.essais} : null; },
  agir:function(h, g, c){ return agir(h, g, c); },
  _E:function(){ return E; }
};
})();
