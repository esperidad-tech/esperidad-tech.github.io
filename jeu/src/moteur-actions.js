/* ==========================================================
   Brumeval v2 — moteur, partie 4 : actions, fenêtres,
   mini-jeux, codes, moments, accusation, fin, démarrage
   ========================================================== */
(function(){
'use strict';
var M = window.M, D = window.DONNEES, esc = M.esc, UI = M.UI;
function lire(t, qui){ return M.lireBtn(t, qui); }

/* ---------- Rendu ---------- */
var atelierMonte = null;
M.majPips = function(){ var el = document.querySelector('.b-entete .b-pips'); if(el && M.P()) el.outerHTML = M.pipsHTML(); };
function ajusterAtelier(){
  var ici = document.getElementById('atelier-ici'); if(!ici) return;
  try{
    /* plein écran : toute la place qui reste vraiment entre ce qui est au-dessus (bandeau…) et les onglets du bas */
    var nav = document.querySelector('.b-onglets'), bas = nav ? nav.offsetHeight : 0;
    var plein = ici.classList.contains('b-atelier-plein');
    ici.style.height = Math.max(plein ? 220 : 460, Math.round(window.innerHeight - (ici.getBoundingClientRect().top + window.scrollY) - bas - (plein ? 0 : 10))) + 'px';
  }catch(e){}
}
/* L'atelier mis de côté pendant qu'un chaudron est en pause (M.render) : ses éléments attendent dans #mj-parking, tels quels */
var atelierParque = false;
function parquerAtelier(){
  var ici = document.getElementById('atelier-ici'), pk = document.getElementById('mj-parking');
  if(!ici || !pk || atelierParque) return;
  while(ici.firstChild) pk.appendChild(ici.firstChild);
  atelierParque = true;
}
function monterAtelier(){
  var ici = document.getElementById('atelier-ici');
  if(atelierParque){
    if(!ici) return;   /* on est ailleurs : il attend encore */
    var pk = document.getElementById('mj-parking');
    while(pk && pk.firstChild) ici.appendChild(pk.firstChild);
    atelierParque = false;
    ajusterAtelier();
    try{ window.dispatchEvent(new Event('resize')); }catch(e){}
    return;
  }
  if(!ici || !window.Atelier) return;
  var S = M.S, P = M.P(), E = M.E();
  if(!S.atelier) S.atelier = Atelier.etatNeuf();
  /* L'atelier tient dans l'écran, au-dessus de la barre d'onglets du bas (pas de défilement pendant qu'on glisse les meubles) */
  ajusterAtelier();
  if(!ajusterAtelier.ecoute){ ajusterAtelier.ecoute = true; window.addEventListener('resize', ajusterAtelier); }
  var mm = M.modsPour('chaudron');
  atelierMonte = Atelier.vue(ici, {
    etat:S.atelier, ingr:D.INGR,
    objets:S.equip.filter(function(id){ return D.OBJETS[id] && D.OBJETS[id].role === 'alchimiste'; }),
    fioles:S.fioles, potions:S.potions,
    /* l'armoire à potions (donner, vendre) et la table d'analyse : leurs boutons sont des data-act du moteur */
    vendre:!!(P && M.acces('etal') && (P.usages.etal || 0) < 2), actions:P ? (M.sansActions() ? M.actionsMax() : P.actions) : 0,
    sansActions:M.sansActions(),   /* enquête sans points d'action : l'atelier n'écrit plus « · 1 action » */
    analyses:M.analysesAtelier ? M.analysesAtelier() : [],
    /* le labo d'analyses (labo.js) : quand l'enquête a sa fiche, la bulle « 🔬 Analyser » de la paillasse l'ouvre en plein écran */
    labo:(M.laboDispo && M.laboDispo()) ? function(){ M.ouvrirLabo(); } : null,
    recettes:M.recettesConnues().map(function(r){ var p = D.POTIONS[r]; return {id:r, nom:p.nom, ic:p.ic, c:p.c, etapes:D.ETAPES[r] || [], connue:!D.RECETTES[r].secrete}; }),
    niveau:(E ? E.niveau : 1) + M.decalage(), mods:mm.mods, aides:mm.aides,
    /* enquête 1 (le tutoriel) : au chaudron, un essai raté rend les ingrédients et on peut recommencer sans fin */
    tutoriel:!!(E && E.id === 1),
    moment:(E && E.moments && P) ? E.moments[Math.min(P.moment || 0, E.moments.length - 1)] : 'matin',
    onChange:function(){ M.sauver(); },
    peutPreparer:function(rid){
      var P2 = M.P(), E2 = M.E();
      /* une seule potion de vérité par enquête (E.veriteUnique, enquête 2 : Romain, 4 novembre, 22 h 38) */
      if(rid === 'verite' && E2 && E2.veriteUnique && P2 && P2.veriteFaite) return 'Tu as déjà préparé la potion de vérité de cette enquête : une seule par enquête !';
      if(S.fioles <= 0){ M.toast('Plus de fiole vide ! Il en faudra une pour mettre la potion.'); return false; }
      if(M.mjPause) return 'Un mini-jeu est en pause : finis-le d\'abord !';
      if(P2 && !M.peutAgir()){ M.toast('Plus d\'action pour ce moment : attends le moment suivant.'); return false; }
      if(P2){ M.depenser(); M.majPips(); }
      M.sauver(); return true;
    },
    potionFinie:function(id, reussi){
      if(reussi){
        S.fioles = Math.max(0, S.fioles - 1);
        var doses = 1 + M.fxSomme('doses');
        S.potions[id] = (S.potions[id] || 0) + doses;
        var Pv = M.P(), Ev = M.E();
        if(id === 'verite' && Ev && Ev.veriteUnique && Pv){ Pv.veriteFaite = true; }   /* la potion de vérité de cette enquête est faite */
        M.son('magie'); M.toast('Potion réussie : ' + D.POTIONS[id].nom + (doses > 1 ? ' (' + doses + ' doses)' : '') + ((window.Atelier && Atelier.OU_POTIONS) || ' ! Elle est dans l\'armoire à potions, au-dessus de la paillasse.'));
      } else {
        M.son('echec');
        /* enquête 1 (le tutoriel) : une préparation ratée ne coûte pas l'action (sinon le tutoriel pourrait se bloquer) */
        var E3 = M.E(), P3 = M.P();
        if(E3 && E3.id === 1 && P3 && !M.sansActions()){ P3.actions++; try{ M.majPips(); }catch(e){} }
      }
      M.sauver();
      try{ if(atelierMonte && atelierMonte.maj) atelierMonte.maj({fioles:S.fioles, potions:S.potions}); }catch(e){}
    },
    son:M.son, lire:M.lire,
    /* (le chaudron se met aussi en pause tout seul quand on change d'onglet : on était dans l'atelier, l'onglet du rôle) */
    surPause:function(pt, r){ M.pauseMJ({partie:pt, hote:'atelier', ic:(r && r.ic) || '🧪', titre:'Le chaudron' + (r && r.nom ? ' : ' + r.nom : ''), ecran:'enquete', onglet:'role'}); }
  });
}
/* Le bandeau du haut est fixe (moteur.css) : l'écran de jeu garde sa hauteur en haut, pour que rien ne passe dessous */
function majEntete(){
  var h = document.querySelector('.b-entete');
  if(h) document.documentElement.style.setProperty('--h-entete', Math.round(h.getBoundingClientRect().height) + 'px');
  M.majBandeau();
}
/* --h-bandeau : la hauteur de la rangée du tutoriel dans le bandeau du haut. Sur l'onglet Carte, la carte passe SOUS cette rangée
   (moteur.css, .b-contenu-carte) : quand la phrase du tutoriel change de longueur, la carte ne bouge plus du tout
   (Romain, 5 novembre, 19 h 39 : « à chaque fois que j'appuie, la carte fait un petit saut ») */
M.majBandeau = function(){
  var h = document.querySelector('.b-entete'), b = h && h.querySelector('.tu-bandeau');
  var v = b ? Math.max(0, Math.round(h.getBoundingClientRect().bottom - b.getBoundingClientRect().top + 4)) : 0;
  document.documentElement.style.setProperty('--h-bandeau', v + 'px');
};
window.addEventListener('resize', majEntete);
/* Les écrans fixes (Romain, 5 novembre, 21 h 46) : « Enquête N » (la lettre), « Enquête résolue », le village.
   Plein écran verrouillé : la page ne défile plus et ne glisse plus (html.b-fixe), sur tous les téléphones et les tablettes.
   La grande image du héros rapetisse d'abord (moteur.css) ; si ça ne tient toujours pas, on serre tout, pas à pas
   (--serre, de 1 jusqu'à .6 : textes, marges, boutons). Si même serré ça dépasse encore, on laisse défiler (b-deborde) plutôt
   que de cacher un bouton. */
function depasse(m){
  var r = m.getBoundingClientRect(), pb = parseFloat(getComputedStyle(m).paddingBottom) || 0, bas = r.top, l = m.querySelectorAll('*');
  for(var i = 0; i < l.length; i++){
    var e = l[i]; if(e.closest('svg') && e.tagName.toLowerCase() !== 'svg') continue;
    var q = e.getBoundingClientRect(); if(q.height && q.bottom > bas) bas = q.bottom;
  }
  return bas > r.bottom - pb + 2;
}
M.ecranFixe = function(){
  var m = document.querySelector('#app > main.b-ecran-fixe');
  document.documentElement.classList.toggle('b-fixe', !!m);
  if(!m) return;
  document.documentElement.style.setProperty('--h-ecran', window.innerHeight + 'px');
  m.querySelectorAll('.b-hub-portrait svg').forEach(function(g){ g.setAttribute('preserveAspectRatio', 'xMidYMax meet'); });   /* les pieds en bas, le ciel au-dessus */
  m.classList.remove('b-deborde');
  var s = 1; m.style.setProperty('--serre', '1');
  while(s > .6 && depasse(m)){ s = Math.round((s - .05) * 100) / 100; m.style.setProperty('--serre', String(s)); }
  if(depasse(m)) m.classList.add('b-deborde');
  if(window.scrollY) window.scrollTo(0, 0);
};
var fixeAttente = 0;
function fixeRedim(){ if(fixeAttente) return; fixeAttente = requestAnimationFrame(function(){ fixeAttente = 0; M.ecranFixe(); }); }
window.addEventListener('resize', fixeRedim);
window.addEventListener('orientationchange', function(){ setTimeout(M.ecranFixe, 250); });
try{ if(document.fonts && document.fonts.ready) document.fonts.ready.then(function(){ M.ecranFixe(); }); }catch(e){}
M.render = function(){
  var app = document.getElementById('app');
  var haut = window.scrollY;
  /* Qui joue ce héros (Romain, 4 novembre : le mode enfant / adulte revient) : la difficulté des mini-jeux en dépend (MJ.COURBE, mj-core.js) */
  window.MJ_JOUEUR = M.joueur();
  if(UI.pile && {accueil:1, enquete:1, creation:1}[UI.ecran]) UI.pile = [];   /* « ← Retour » repart d'ici (heros.js) */
  if(atelierMonte){
    /* le chaudron de l'atelier tourne et on change d'écran (un onglet…) : il se met en pause au lieu d'être abandonné ;
       en pause, l'atelier est mis de côté tel quel (hors de #app), et il revient quand on retourne à l'atelier (monterAtelier) */
    var pt = null; try{ pt = atelierMonte.partie ? atelierMonte.partie() : null; }catch(e){}
    if(pt && pt.pause && !pt.enPause() && !M.mjPause) try{ pt.pause(); }catch(e){ console.error(e); }
    if(pt && pt.enPause && pt.enPause()) parquerAtelier();   /* (aussi pendant le « 3, 2, 1 » de la reprise) */
    else { try{ atelierMonte.arreter(); }catch(e){} atelierMonte = null; }
  }
  try{ if(M.majMission) M.majMission(); }catch(e){ console.error(e); } /* missions de base validées (mission.js) */
  /* l'onglet Carte, et rien n'y change (carte-jeu.js, M.carteInchangee) : on garde la carte telle quelle, seuls le bandeau, les onglets
     et la fenêtre se redessinent (Romain, 5 novembre, 17 h 01 : plus d'image qui saute quand on touche ce qui brille) */
  if(garderCarte()){ majEntete(); rendreModal(); if(UI.garderDefilement) window.scrollTo(0, haut); UI.garderDefilement = false; return; }
  try{ if(M.demonterLiege) M.demonterLiege(); }catch(e){ console.error(e); } /* tableau de liège du Barde (liege.js) */
  try{ if(M.demonterCabane) M.demonterCabane(); }catch(e){ console.error(e); } /* cabane du Pisteur (cabane.js) */
  app.innerHTML = M.vue();
  majEntete();   /* avant de monter quoi que ce soit : les écrans plein écran mesurent leur place sous le bandeau */
  try{ monterAtelier(); }catch(e){ console.error(e); }
  try{ if(M.monterLiege) M.monterLiege(); }catch(e){ console.error(e); }
  try{ if(M.monterCarte) M.monterCarte(); }catch(e){ console.error(e); } /* la carte plein écran, qu'on fait glisser (moteur-ecrans.js, carte.js) */
  try{ if(M.monterCabane) M.monterCabane(); }catch(e){ console.error(e); } /* cabane du Pisteur, après la carte (elle remplit #cabane-carte) ; trouvailles de vêtements (cabane.js) */
  try{ if(M.monterHeros) M.monterHeros(); }catch(e){ console.error(e); } /* l'écran du héros : tailles et paysage à la mesure de l'écran (heros.js) */
  try{ M.ecranFixe(); }catch(e){ console.error(e); }   /* la lettre, la fin, le village : tout tient dans l'écran */
  rendreModal();
  if(UI.garderDefilement) window.scrollTo(0, haut);
  UI.garderDefilement = false;
};
function garderCarte(){
  try{
    var P = M.P(), jeu = document.querySelector('#app > .b-jeu');
    if(UI.ecran !== 'enquete' || !P || P.etape !== 'jeu' || P.defaite || P.onglet !== 'carte' || !jeu || !M.carteInchangee || !M.carteInchangee()) return false;
    if(!M.enteteEnqueteHTML || !M.ongletsEnqueteHTML) return false;
    var h = jeu.querySelector(':scope > .b-entete'), n = jeu.querySelector(':scope > .b-onglets'); if(!h || !n) return false;
    var E = M.E(), mid = M.momentId(), R = D.ROLES[M.role()];
    jeu.className = 'b-jeu moment-' + mid; jeu.style.setProperty('--c', R.c);
    /* le bandeau du haut et les onglets ne sont refaits que s'ils ont changé (sinon leurs dessins et leurs animations repartaient
       à zéro à chaque toucher : un petit saut de plus) ; la phrase du tutoriel, elle, change sur place (tuto.js) */
    var t = document.createElement('div'), norm = function(x){ return x.replace(/\b([a-z]{1,6})\d+-/g, '$1#-'); };
    var bt = M.bandeauTuto, avecTuto = !!(bt && bt()), cleH;
    M.bandeauTuto = null;
    try{ cleH = norm(M.enteteEnqueteHTML()) + (avecTuto ? '|tuto' : ''); } finally { M.bandeauTuto = bt; }
    if(h.__cle !== cleH){ t.innerHTML = M.enteteEnqueteHTML(); var nh = t.firstChild; nh.__cle = cleH; h.replaceWith(nh); }
    var o = M.ongletsEnqueteHTML();
    if(n.__cle !== o){ t.innerHTML = o; var nn = t.firstChild; nn.__cle = o; n.replaceWith(nn); }
    majEntete(); if(M.carteAjuster) M.carteAjuster();
    return true;
  }catch(e){ console.error(e); return false; }
}
function rendreModal(){
  var v = document.getElementById('voile');
  if(UI.modal && UI.modal.bulle && !carteIci()) UI.modal = null;   /* une bulle de la carte, quand la carte n'est plus là : elle s'en va */
  if(!UI.modal){ v.hidden = true; v.innerHTML = ''; v.classList.remove('b-voile-bulle'); document.body.classList.remove('b-bloque'); v.__modal = null; return; }
  var c = contenuModal(UI.modal), bulle = !!UI.modal.bulle;
  /* une fenêtre pleine est déjà ouverte (Romain, 5 novembre, 18 h 15 : « quand il y a plusieurs icônes d'affilée, il faut que la carte
     reste sombre et que ce soit juste la fenêtre qui change ») : le fond sombre reste tel quel (plus d'éclair : il ne se refait plus),
     la fenêtre ne remonte plus du bas ; une autre fenêtre se fond à la place, la même fenêtre redessinée ne bouge pas (et garde son défilement) */
  var fond = !bulle && !v.hidden && v.querySelector(':scope > .b-fond');
  var meme = !!fond && v.__modal === UI.modal, vieille = fond ? v.querySelector(':scope > .b-feuille') : null, defile = meme && vieille ? vieille.scrollTop : 0;
  /* la bulle de la carte (Romain, 5 novembre, 10 h 07) : pas de fond noir, la carte reste touchable autour ;
     toucher ailleurs sur la carte la remplace, toucher dans le vide la ferme. Elle reste dans #voile (le tutoriel y cherche ses boutons). */
  v.classList.toggle('b-voile-bulle', bulle);
  var feuille = '<div class="b-feuille ' + (bulle ? 'b-bulle ' : '') + (fond ? (meme ? 'b-feuille-meme ' : 'b-feuille-suite ') : '') + (UI.modal.classe || '') + '" role="dialog"' + (bulle ? '' : ' aria-modal="true"') + '>' +
    (UI.modal.fixe ? '' : '<button class="b-fermer" data-act="fermer" aria-label="Fermer">✕</button>') + c + '</div>';
  if(fond){
    fond.setAttribute('data-act', UI.modal.fixe ? '' : 'fermer');
    [].slice.call(v.children).forEach(function(n){ if(n !== fond) v.removeChild(n); });
    v.insertAdjacentHTML('beforeend', feuille);
    if(defile){ var nf = v.querySelector(':scope > .b-feuille'); if(nf) nf.scrollTop = defile; }
  } else v.innerHTML = (bulle ? '<i class="b-bulle-pointe" aria-hidden="true"></i>' : '<div class="b-fond" data-act="' + (UI.modal.fixe ? '' : 'fermer') + '"></div>') + feuille;
  v.__modal = UI.modal;
  v.hidden = false;
  document.body.classList.toggle('b-bloque', !bulle);
  if(bulle){
    /* les pastilles (moteur.css) : chacune son rang, pour arriver l'une après l'autre en rebondissant ; seulement quand la bulle s'ouvre */
    var f = v.querySelector('.b-feuille.b-bulle'), neuve = UI.modal.neuve !== false;
    UI.modal.neuve = false;
    f.classList.toggle('b-bulle-neuve', neuve);
    var ps = [].slice.call(f.querySelectorAll(PASTILLES)), x = f.querySelector('.b-fermer');
    ps.forEach(function(el, i){ el.classList.add('b-pastille'); el.style.setProperty('--i', el === x ? ps.length : i); });
    /* un petit pop par pastille (moteur-base.js) ; pas pour « Pas à la maison » (la porte a déjà fait toc-toc) */
    if(neuve && (UI.modal.type === 'lieu' || UI.modal.type === 'maison')) M.son('pastilles', ps.length - (x ? 1 : 0));
    placerBulle();
  }
  if(UI.modal.type === 'revision' && window.Revision){
    var P = M.P(), rv = P && P.revisions ? P.revisions[UI.modal.i] : null;
    Revision.monter(document.getElementById('rv-ici'), rv, function(){ M.sauver(); });
  }
}
M.ouvrir = function(m){
  /* fouiller, cueillir… depuis la bulle d'un lieu : on reste dans la même bulle */
  var avant = UI.modal;
  if(m && !m.bulle && avant && avant.bulle && (m.type === 'lieu' || m.type === 'maison') && avant.type === m.type && avant.id === m.id){ m.bulle = true; m.ancre = avant.ancre; m.neuve = false; }
  /* regarder la carte (Romain, 5 novembre, 11 h 09) : ouvrir ou changer une bulle en touchant la carte ne redessine pas la page,
     seulement la bulle ; la carte garde ses animations (brume, fumées, eau) sans saute d'image */
  var leger = !!(m && m.bulle && m.leger && carteIci() && (!avant || avant.bulle));
  if(m) delete m.leger;
  UI.modal = m; M.sauver();
  if(leger) rendreLeger(); else M.render();
  var f = document.querySelector('#voile .b-feuille'); if(f) f.scrollTop = 0;
};
function rendreLeger(){ rendreModal(); if(M.tutoMaj) M.tutoMaj(); }
M.rendreBulle = rendreLeger;   /* (redessiner seulement la bulle de la carte : barde.js, quand le texte entendu aux portes a fini de s'écrire) */

/* ---------- La bulle de la carte (Romain, 5 novembre, 10 h 07) ----------
   Toucher un lieu, une maison ou un visage sur la carte (l'onglet Carte) n'ouvre plus une fenêtre : une bulle s'ouvre à côté, sur la carte.
   m.bulle = true, m.ancre = où elle pointe ({x, h, b} : le milieu, le haut et le bas de ce qu'on a touché, en fractions du dessin de la carte,
   pour la suivre quand on fait glisser ou qu'on zoome). Les conversations, découvertes et mini-jeux restent en plein écran. */
function carteIci(){ var ici = document.getElementById('carte-ici'); return ici && ici.querySelector('.ca-monde') ? ici : null; }
/* ce qui fait une pastille dans la bulle (moteur.css, LA PASTILLE) */
var PASTILLES = '.b-gens-carte, :scope > .btn, .b-ce-que-je-sais > .btn, .b-bonus, .b-ecoute > .btn, :scope > p, .b-maison-hab, .b-info-modal > p, .b-verrou > *, .b-point, .b-ingr-carte, .bd-porte, .b-fermer';
M.bulleDe = function(el){ return bulleDe(el); };
function bulleDe(el){
  var ici = el && el.closest && el.closest('#carte-ici');
  if(!ici){
    /* (un bouton de la bulle elle-même : frapper, après « Pas à la maison »…) */
    return el && el.closest && el.closest('#voile .b-bulle') && UI.modal && UI.modal.bulle ? {bulle:true, ancre:UI.modal.ancre} : {};
  }
  var monde = ici.querySelector('.ca-monde'); if(!monde) return {};
  var id = el.dataset.id, cible = el.closest('.ca-marqueur, .ca-zone-mq');
  if(!cible && /^[LFB]\d$/.test(id || '')) cible = ici.querySelector('g.ca-maison[data-id="' + id + '"] .ca-habitant') || ici.querySelector('g.ca-maison[data-id="' + id + '"]');
  if(!cible && id) cible = ici.querySelector('g.ca-lieu[data-lieu="' + id + '"] .ca-etiq-lieu');
  var r = (cible || el).getBoundingClientRect(), R = monde.getBoundingClientRect();
  if(!R.width || !R.height) return {};
  return {bulle:true, ancre:{x:((r.left + r.right) / 2 - R.left) / R.width, h:(r.top - R.top) / R.height, b:(r.bottom - R.top) / R.height}};
}
M.bulleDe = bulleDe;
/* La bulle se pose sous ce qu'on a touché (ou au-dessus, s'il y a plus de place), sans sortir de la carte ; une petite pointe le montre */
function placerBulle(){
  var v = document.getElementById('voile'), f = v && v.querySelector('.b-feuille.b-bulle'), p = v && v.querySelector('.b-bulle-pointe'), m = UI.modal, ici = carteIci();
  if(!f || !m || !m.bulle || !ici) return;
  var R = ici.querySelector('.ca-monde').getBoundingClientRect(), C = ici.getBoundingClientRect(), a = m.ancre || {x:.5, h:.5, b:.5};
  var x = R.left + a.x * R.width, yh = R.top + a.h * R.height, yb = R.top + a.b * R.height;
  /* (entre le bandeau du haut — et celui du tutoriel — et la barre des onglets : rien ne doit passer dessous) */
  var bord = function(s, cote){ var e = document.querySelector(s), r = e && !e.hidden && e.getBoundingClientRect(); return r && r.height ? r[cote] : null; };
  /* MARGE : la marge invisible du cadre (moteur.css, padding 16 px) : les pastilles, elles, restent à 6 px des bords et à 2 px de ce qu'on a touché */
  var MARGE = 16, haut = Math.max(C.top, 0, bord('.b-entete', 'bottom') || 0, bord('.tu-bandeau', 'bottom') || 0) + 6 - MARGE;
  var bas = Math.min(C.bottom, window.innerHeight, bord('.b-onglets', 'top') || window.innerHeight, bord('#mj-rappel', 'top') || window.innerHeight) - 6 + MARGE, ecart = 2 - MARGE + 10;   /* (et au-dessus du rappel d'un mini-jeu en pause) */
  /* ce qu'on a touché est sorti de la carte (on l'a fait glisser) : la bulle se cache, elle revient avec lui */
  var hors = x < C.left || x > C.right || yb < C.top || yh > C.bottom;
  f.style.visibility = p.style.visibility = hors ? 'hidden' : '';
  f.style.maxHeight = '';
  var W = f.offsetWidth, H = f.offsetHeight;
  var dessous = bas - (yb + ecart), dessus = (yh - ecart) - haut, enBas = dessous >= H || dessous >= dessus;
  var dispo = Math.max(130, enBas ? dessous : dessus);
  if(H > dispo){ f.style.maxHeight = dispo + 'px'; H = f.offsetHeight; }
  var top = enBas ? yb + ecart : yh - ecart - H, left = Math.min(Math.max(x - W / 2, 8 - MARGE), window.innerWidth - W - 8 + MARGE);
  f.style.left = Math.round(left) + 'px'; f.style.top = Math.round(top) + 'px';
  p.style.left = Math.round(Math.min(Math.max(x, left + 22), left + W - 22) - 11) + 'px';
  p.style.top = Math.round(enBas ? top - 11 : top + H - 1) + 'px';
  p.classList.toggle('vers-haut', enBas);
}
M.placerBulle = placerBulle;
var bulleRaf = 0;
function suivreBulle(){ if(!UI.modal || !UI.modal.bulle || bulleRaf) return; bulleRaf = requestAnimationFrame(function(){ bulleRaf = 0; placerBulle(); }); }
document.addEventListener('scroll', suivreBulle, true);   /* la carte qu'on fait glisser (ou qui zoome) : la bulle la suit */
window.addEventListener('resize', suivreBulle);
M.fermer = function(){
  var bulle = !!(UI.modal && UI.modal.bulle && carteIci());   /* fermer une bulle de la carte : la carte ne bouge pas (Romain, 11 h 09) */
  UI.modal = null; M.stop(); M.sauver();
  if(bulle){ rendreLeger(); return; }
  UI.garderDefilement = true; M.render();
};
var toastT = null;
M.toast = function(t){
  var el = document.getElementById('toast');
  el.textContent = t; el.classList.add('on');
  clearTimeout(toastT); toastT = setTimeout(function(){ el.classList.remove('on'); }, 2600);
};

function contenuModal(m){
  switch(m.type){
    case 'lieu': return M.feuilleLieu(m.id);
    case 'maison': return M.feuilleMaison(m.id);
    case 'conv': return M.feuilleConv(m.id);
    case 'decouverte': return decouverteHTML(m);
    case 'code': return codeModal(m);
    case 'talent': return talentModal(m);
    case 'chaudron': return chaudronModal(m);
    case 'moment': return momentModal();
    case 'accusation': return accusationModal(m);
    case 'victoire': return victoireModal(m);
    case 'corbeau': return corbeauModal(m);
    case 'calepin': return calepinModal();
    case 'revision': return '<div id="rv-ici"></div><button class="btn" data-act="fermer">Fermer</button>';
    case 'aide': return M.aideHTML();
    case 'perso': return M.modalPerso ? M.modalPerso(m) : '';   /* les fenêtres de l'écran du héros et du menu (heros.js) */
    case 'barde-sac': return M.sacBarde ? M.sacBarde() : '';
    case 'pisteur-sac': return M.sacPisteurHTML ? M.sacPisteurHTML() : '';   /* le sac du Pisteur, ouvert depuis sa cabane (moteur-roles.js, cabane.js) */   /* le sac du Barde, ouvert depuis son tableau de liège (liege.js) */
    case 'reserve': return reserveModal();
    case 'confirmer': return '<h2>' + esc(m.titre) + '</h2><p>' + esc(m.t || '') + '</p>' + (m.t ? lire(m.titre + ' ' + m.t) : '') + '<div class="b-rangee"><button class="btn second" data-act="fermer">Non</button><button class="btn ' + (m.danger ? 'danger' : '') + '" data-act="confirmer-oui">' + esc(m.oui || 'Oui') + '</button></div>';
    case 'boire-mj': return boireModal(m);
    case 'auto-mj': return autoModal(m);
    case 'besoin': return '<div class="b-info-modal"><div class="b-grand-ic">🔒</div><h2>' + esc(m.titre) + '</h2><p>' + esc(m.t) + '</p>' + lire(m.t) + M.besoinHTML(m.besoin, M.role()) + '<button class="btn" data-act="lieu" data-id="' + m.retourId + '">← Retour</button></div>';
    case 'info': return '<div class="b-info-modal">' + illuOuIc(m, m.ic || 'ℹ️') + '<h2>' + esc(m.titre) + '</h2><p>' + esc(m.t) + '</p>' + lire(m.t) + '<button class="btn" data-act="fermer">D\'accord</button></div>';
    case 'avant-mj': return avantMJHTML(m);
    case 'mj-pause': return pauseModal(m);
    case 'porte': return M.porteHTML ? M.porteHTML(m) : '';   /* 👂 écouter aux portes (barde.js) */
    case 'marche': return M.marcheHTML ? M.marcheHTML(m) : '';   /* 💐 le marché aux fleurs du Barde (enquête 3, marche.js) */
  }
  return '';
}

/* ---------- Avant un mini-jeu : toujours un court texte de la situation, puis un bouton JAUNE qui le lance
   (Romain, 4 novembre, 23 h 11 : toutes les enquêtes, tous les rôles). M.lancerMJ ouvre cette fenêtre d'abord.
   Le texte : options.avant (p.avant, An.avant… dans l'enquête), sinon celui du type de jeu ci-dessous ; le bouton : options.bouton.
   Pas de « Plus tard » quand une action a déjà été dépensée (analyse, mission…) : seulement quand on vient d'un lieu (options.retour). ---------- */
var AVANT_MJ = {
  traces:'Des traces partent d\'ici. Tu les suis, sans jamais les perdre de vue !',
  poursuite:'Quelqu\'un s\'enfuit ! Cours-lui après, et saute par-dessus tout ce qui te barre la route.',
  cachette:'Il ne faut pas te faire voir ! Avance de cachette en cachette, quand personne ne regarde.',
  tir:'Vise bien, et tire !',
  differences:'Tu regardes de très près… Trouve tout ce qui n\'est pas pareil.',
  double:'Tu regardes de très près… Trouve les deux dessins tout pareils.',
  melange:'Mélange tes couleurs pour retrouver exactement la même.',
  insectes:'Attention aux petites bêtes !',
  bulles:'Attrape les bonnes bulles !',
  plans:'Pose le vieux plan bien pile sur celui d\'aujourd\'hui : qu\'est-ce qui a changé ?',
  runes:'Remets tous les morceaux à leur place.',
  alphabet:'Un message secret ! Sers-toi de la clé pour le lire.',
  grille:'Remets tout en ordre dans la grille.',
  mensonge:'Écoute bien tout ce qu\'il a dit : un mensonge se cache dedans !',
  ragots:'À la taverne, tout le monde raconte des histoires. Vrai ou pas vrai ? À toi de juger !',
  mots:'Retrouve le mot caché !'
};
var BOUTON_MJ = {traces:'👣 Suivre les traces', poursuite:'🏃 Lui courir après', cachette:'🫥 Avancer sans être vu', tir:'🎯 Viser',
  differences:'🔬 Commencer l\'analyse', double:'🔬 Commencer l\'analyse', melange:'🎨 Mélanger', plans:'🗺️ Superposer les plans', runes:'🧩 Réparer',
  alphabet:'🔣 Déchiffrer', ragots:'🍺 Écouter les ragots', mensonge:'🤥 Trouver le mensonge'};
M.AVANT_MJ = AVANT_MJ; M.BOUTON_MJ = BOUTON_MJ;
function avantMJHTML(m){
  return '<div class="b-info-modal b-avant-mj">' + illuOuIc(m, m.ic || '🎮') + '<h2>' + esc(m.titre) + '</h2><p>' + esc(m.t) + '</p>' + lire((m.titre ? m.titre + '. ' : '') + m.t) +
    '<button class="btn grand b-aller" data-act="mj-go">' + esc(m.bouton) + '</button>' +
    (m.retour ? '<button class="btn second" data-act="' + esc(m.retour) + '"' + (m.retourId ? ' data-id="' + esc(m.retourId) + '"' : '') + '>← Plus tard</button>' : '') + '</div>';
}

/* Une petite scène animée à la place de la grande icône (m.illu : regles.js, M.illustration), sinon l'icône */
function illuOuIc(m, ic){
  var h = ''; if(m.illu && M.illustration){ try{ h = M.illustration(m.illu) || ''; }catch(e){ console.error(e); } }
  return h || '<div class="b-grand-ic">' + ic + '</div>';
}
/* ---------- Découverte ---------- */
function decouverteHTML(m){
  var s = '<div class="b-decouverte' + (m.rate ? ' rate' : '') + '">' + illuOuIc(m, m.ic) + '<h2>' + esc(m.titre) + '</h2><p>' + (m.html || esc(m.t)) + '</p>' + lire(m.t);
  /* (m.codes : plusieurs codes d'un coup — la maison d'Odette, à l'enquête 3 : le carnet et les traces) */
  (m.codes || (m.code ? [m.code] : [])).forEach(function(cd){
    var n = M.nomCode(cd), td = M.texteDonne(cd), dit = M.direCode ? M.direCode(cd) : null;
    /* dit : une phrase dans l'histoire pour dire à qui donner ce code (I.dire, e2.js) ; sinon « nom : donne ce code au … » */
    s += '<div class="b-donne"><p>' + n.ic + ' ' + (dit ? esc(dit) + ' ' + lire(dit) : '<b>' + esc(n.nom) + '</b> : ' + esc(td) + ' ' + lire(n.nom + ' : ' + td)) + '</p>' + M.codeHTML(M.code(cd), true) + '<p class="doux petit">Tu le retrouveras dans ton onglet ' + D.ROLES[M.role()].onglet.ic + ' ' + D.ROLES[M.role()].onglet.nom + '.</p></div>';
  });
  /* (Romain, 5 novembre, 14 h 26 : seul le Carnet du Barde garde ce qu'on apprend, sur le visage des habitants ; les autres n'ont plus d'indices) */
  if(m.note && M.role() === 'barde') s += '<p class="b-note-ajoutee">📒 Noté dans ton carnet</p>';
  if(m.reessai && M.boutonReessai) s += M.boutonReessai(m);   /* 1er échec d'un mini-jeu : la dernière chance (essais.js) */
  if(m.choix) s += '<div class="b-choix-point">' + m.choix.map(function(c){ return '<button class="btn grand b-aller" data-act="point" data-l="' + esc(c.l) + '" data-id="' + esc(c.id) + '">' + esc(c.t) + '</button>'; }).join('') + '</div>';   /* un choix (A.point, p.choix) */
  return s + '<button class="btn grand' + (m.reessai || m.choix ? ' second' : '') + '" data-act="' + (m.retour ? m.retour : 'fermer') + '"' + (m.retourId ? ' data-id="' + m.retourId + '"' : '') + '>D\'accord</button></div>';
}
M.decouvrir = function(m){
  if(m.note) M.noter(m.note, m.ic);
  M.son(m.rate ? 'ko' : 'ok');
  M.ouvrir(Object.assign({type:'decouverte', classe:'b-feuille-decouverte'}, m));
  M.lireAuto(m.t);
};

/* ---------- Mini-jeux ---------- */
var mjEnCours = null;
M.lancerMJ = function(type, niveau, extra, options, fin){
  options = options || {};
  /* au retour dans le jeu, après l'avoir quitté pendant ce mini-jeu (M.rateQuitte) : il est raté tout de suite */
  if(rejeu){ var rj = rejeu; rejeu = null; rj.rendre(); try{ fin({reussi:false, score:0, essais:1, erreurs:0, detail:'', quitte:true}); }catch(e){ console.error(e); } return; }
  if(M.mjPause){ M.rappelPause(); return; }   /* un mini-jeu en pause : il faut le finir d'abord */
  if(!options.origine && UI.actEnCours && !/^mj-/.test(UI.actEnCours.act)) options.origine = UI.actEnCours;
  /* 0. L'explication de la situation, puis le bouton jaune (sauf la dernière chance : options.sansIntro) */
  if(!options.introVue && !options.sansIntro){
    UI.suiteMJ = {type:type, niveau:niveau, extra:extra, options:Object.assign({}, options, {introVue:true}), fin:fin};
    M.ouvrir({type:'avant-mj', fixe:!options.retour, mj:type, ic:options.ic || (window.MJ && MJ.TYPES[type] || {}).ic || '🎮', illu:options.illu || null,
      titre:options.titreAvant || options.titre || '', t:options.avant || AVANT_MJ[type] || 'À toi de jouer !', bouton:options.bouton || BOUTON_MJ[type] || '▶️ C\'est parti !',
      retour:options.retour || null, retourId:options.retourId || null});
    return;
  }
  var pots = options.sansPotion ? [] : M.potionsPour(type);
  if(pots.length && !options.potionChoisie){
    UI.suiteMJ = {type:type, niveau:niveau, extra:extra, options:options, fin:fin};
    M.ouvrir({type:'boire-mj', pots:pots, mj:type, fixe:true});
    return;
  }
  var auto = options.niveauFixe ? null : autoDispo(type);   /* un passage très risqué (niveau fixe) : pas de réussite sans jouer */
  if(auto && !options.autoVu){
    UI.suiteMJ = {type:type, niveau:niveau, extra:extra, options:Object.assign({}, options, {autoVu:true}), fin:fin, auto:auto};
    M.ouvrir({type:'auto-mj', mj:type, auto:auto, fixe:true});
    return;
  }
  lancer(type, niveau, extra, options, fin);
};
function autoDispo(type){
  var P = M.P(); if(!P) return null;
  var l = null;
  M.sources().forEach(function(x){
    if(x.fx.auto && x.fx.auto[type]){
      var k = 'auto:' + x.id;
      if((P.usages[k] || 0) < x.fx.auto[type]) l = l || {id:x.id, nom:x.nom, ic:x.ic, reste:x.fx.auto[type] - (P.usages[k] || 0), cle:k};
    }
  });
  return l;
}
function lancer(type, niveau, extra, options, fin){
  var P = M.P();
  var potion = options.potion || null;
  var mm = M.modsPour(type, potion);
  /* options.niveauFixe (ex. : forcer le passage devant Silas, enquête 2 : niveau 10 pour tout le monde) : le niveau tel quel,
     sans la courbe enfant/adulte ; l'équipement, les talents et les potions du héros aident encore (mods.facile) */
  /* options.niveauMax (ex. : la poursuite de Tim, enquête 2) : la courbe enfant/adulte, mais jamais plus haut que ce niveau */
  var params = options.niveauFixe ? MJ.reglages(type, options.niveauFixe, mm.mods, {brut:true}) : MJ.reglages(type, (niveau || 1) + M.decalage(), mm.mods, options.niveauMax ? {max:options.niveauMax} : null);
  if(extra) M.cle(extra).forEach(function(k){ params[k] = extra[k]; });
  /* une fenêtre encore ouverte (le « Raté… tu peux réessayer », la dernière chance) se ferme quand le mini-jeu part : sinon, en pause,
     on la retrouvait derrière, avec le rond du tutoriel dessus (Romain, 5 novembre, 20 h 16) */
  if(UI.modal){ UI.modal = null; rendreModal(); }
  var plein = document.getElementById('mj-plein');
  plein.innerHTML = '<div class="b-mj-cadre"></div>';
  plein.hidden = false;
  document.body.classList.add('b-bloque');
  M.stop();
  var aides = mm.aides.slice();
  if(potion) aides.push({ic:D.POTIONS[potion].ic, nom:D.POTIONS[potion].nom});
  var titrePause = options.titre || (MJ.TYPES[type] || {}).nom || 'Le mini-jeu', icPause = options.ic || (MJ.TYPES[type] || {}).ic || '🎮';
  /* quitter le jeu pendant le mini-jeu (fermer l'appli, recharger) : il comptera comme raté au retour (Romain, 5 novembre, 12 h 31 ; M.rateQuitte) */
  if(P && options.origine){ P.mjOuvert = {act:options.origine.act, ds:options.origine.ds, type:type}; M.sauver(); }
  mjEnCours = MJ.lancer(plein.firstChild, type, params, function(res){
    plein.hidden = true; plein.innerHTML = ''; mjEnCours = null;
    if(P && P.mjOuvert) delete P.mjOuvert;
    if(M.mjPause && M.mjPause.hote === 'plein') M.finPause();
    document.body.classList.toggle('b-bloque', !!UI.modal);
    if(P && res.essais > 1 && P.chances > 0) P.chances--;
    if(potion && P && P.potions[potion] > 0){
      if(M.fxVrai('potionDouble') && !P.usages['ether:' + potion]){ P.usages['ether:' + potion] = 1; }
      else { P.potions[potion]--; P.usages['ether:' + potion] = 0; }
    }
    if(P && res && res.revision){
      P.revisions = P.revisions || [];
      var rv = Object.assign({}, res.revision, {m:P.moment, ic:res.revision.ic || (MJ.TYPES[type] || {}).ic || '🔁'});
      if(options.titre && type !== 'ragots' && type !== 'mots') rv.titre = options.titre;
      P.revisions.push(rv);
    }
    if(res && res.reussi && M.role() === 'alchimiste'){ try{ if(window.Atelier && Atelier.mjGagne) Atelier.mjGagne(M.S, type); }catch(e){} }   /* un accessoire pour le chat de l'atelier (la première fois pour chaque mini-jeu) */
    M.sauver();
    fin(res);
  }, {aides:aides, titre:options.titre, essaiUnique:options.essaiUnique, reessaisInfinis:!!options.reessaisInfinis, deuxiemeChance:false, lireAuto:false,   /* (plus jamais de « ✨ Deuxième chance » : Romain, 5 novembre, 13 h 19) */
     /* ⏸️ (mj-core.js) : #mj-plein se cache, on retrouve la carte, les codes… et le rappel en bas de l'écran */
     surPause:function(pt){ M.pauseMJ({partie:pt, hote:'plein', ic:icPause, titre:titrePause}); }});
}

/* ---------- Un mini-jeu en pause (Romain, 5 novembre, 11 h 21) ----------
   M.mjPause = {partie, hote:'plein'|'atelier', ic, titre, ecran, onglet} : où on était quand on a mis en pause.
   Pendant la pause : la carte, les codes, le carnet… tout se regarde ; rien ne fait avancer l'enquête (LIBRE_EN_PAUSE),
   pas d'autre mini-jeu ; un rappel reste en bas de l'écran, avec « ▶️ Reprendre ». */
M.pauseMJ = function(info){
  var P = M.P();
  M.mjPause = Object.assign({ecran:UI.ecran, onglet:P ? P.onglet : null}, info);
  document.body.classList.toggle('b-bloque', !!(UI.modal && !UI.modal.bulle));
  M.stop();
  M.majRappel();
  if(M.tutoMaj) M.tutoMaj();
};
/* On revient dans le jeu alors qu'un mini-jeu était ouvert (l'appli fermée, la page rechargée) : il compte comme raté.
   L'action qui l'avait lancé est rejouée sans rien redépenser, et M.lancerMJ rend « raté » tout de suite : la suite est celle d'un vrai raté
   (un essai de moins, la note, « Tu as encore un essai »…). */
var rejeu = null;
M.rateQuitte = function(){
  var P = M.P(); if(!P || !P.mjOuvert || mjEnCours || M.mjPause) return;
  var o = P.mjOuvert; delete P.mjOuvert; M.sauver();
  var f = o.act && A[o.act]; if(!f) return;
  var garde = {dep:M.depenser, cb:M.consommerBesoin, pa:M.peutAgir};
  rejeu = {rendre:function(){ M.depenser = garde.dep; M.consommerBesoin = garde.cb; M.peutAgir = garde.pa; }};
  M.depenser = function(){}; M.consommerBesoin = function(){}; M.peutAgir = function(){ return true; };   /* (déjà dépensé avant de quitter) */
  var fait = false;
  UI.ecran = 'enquete'; UI.modal = null;   /* (on revient dans l'enquête : le raté s'ouvre là) */
  try{ f({dataset:o.ds || {}}); fait = !rejeu; }catch(e){ console.error(e); }
  if(!UI.modal) M.render();
  if(rejeu){ rejeu.rendre(); rejeu = null; }
  M.sauver();
  if(fait) setTimeout(function(){ M.toast('Tu avais quitté le jeu pendant un mini-jeu : il compte comme raté.'); }, 400);
};
/* L'appli passe derrière (une autre appli, l'écran qui s'éteint) : le mini-jeu se met en pause tout seul */
document.addEventListener('visibilitychange', function(){
  if(!document.hidden || M.mjPause) return;
  try{
    if(mjEnCours && mjEnCours.pause) mjEnCours.pause();
    else if(atelierMonte && atelierMonte.partie && atelierMonte.partie()) atelierMonte.partie().pause();
  }catch(e){ console.error(e); }
});
M.finPause = function(){ M.mjPause = null; M.majRappel(); if(M.tutoMaj) M.tutoMaj(); };
M.reprendreMJ = function(){
  var p = M.mjPause; if(!p) return;
  var P = M.P();
  /* on revient là où le mini-jeu tournait (son résultat s'ouvre là, comme avant) */
  var ailleurs = !!UI.modal || UI.ecran !== p.ecran || !!(P && p.onglet && P.onglet !== p.onglet) || (p.hote === 'atelier' && atelierParque);
  UI.modal = null; UI.saisie = [];
  UI.ecran = p.ecran; if(P && p.onglet) P.onglet = p.onglet;
  M.mjPause = null;
  M.majRappel();
  if(ailleurs) M.render();
  if(p.hote === 'plein'){ document.body.classList.add('b-bloque'); }
  M.son('clic');
  try{ p.partie.reprendre(); }catch(e){ console.error(e); }
  if(M.tutoMaj) M.tutoMaj();
};
/* Ce qu'on peut toucher pendant la pause : regarder, lire, taper ou donner un code, les réglages. Le reste attend la fin du mini-jeu. */
var LIBRE_EN_PAUSE = {fermer:1, lire:1, 'tuto-lire':1, 'tuto-fait':1, 'tuto-passer':1, lieu:1, maison:1, onglet:1, menu:1, 'menu-enquete':1, ecran:1, retour:1, aide:1,
  journal:1, calepin:1, revoir:1, 'relire-lettre':1, 'carnet-pnj':1, page:1, rayer:1, 'tab-case':1, 'tab-tete':1, 'tab-effacer':1, 'mission-coche':1, 'missions-plier':1, 'fil-plier':1, 'codes-plier':1, 'arch-plier':1, 'bib-plier':1, 'gens-plier':1,
  sym:1, 'sym-efface':1, 'bd-code':1, 'bd-porte-fin':1, 'donner-potion':1, 'potion-donnee':1, reserve:1, inspiration:1, 'don-action':1, 'don-donne':1,
  'bd-carnet':1, 'bd-trous-ouvre':1, 'bd-trou':1, 'bd-mot':1, 'bd-tableau':1, 'noter-ingr':1, 'basculer-ingr':1, 'sous-sol':1, 'sous-atelier':1, palier:1,
  opt:1, 'test-voix':1, 'voix-oublier':1, 'voix-plus-tard':1, 'voix-telecharger':1, 'plein-ecran':1, joueur:1, sauvegarder:1, 'hors-ligne':1, 'hors-ligne-maj':1,
  'mj-reprendre':1};
M.LIBRE_EN_PAUSE = LIBRE_EN_PAUSE;
/* « Un mini-jeu est en pause » : la petite fenêtre quand on veut faire autre chose (t : pourquoi, si besoin) */
M.rappelPause = function(t){ M.son('ko'); M.ouvrir({type:'mj-pause', t:t || null}); };
function pauseModal(m){
  var p = M.mjPause || {};
  var t = (m.t ? m.t + ' ' : '') + 'Il faut d\'abord finir ton mini-jeu' + (p.titre ? ' « ' + p.titre + ' »' : '') + '.';
  return '<div class="b-info-modal b-mj-pause"><div class="b-grand-ic"><span class="b-mj-pause-l">' + (p.ic || '🎮') + '<span class="b-mj-pause-ic">⏸️</span></span></div><h2>Un mini-jeu est en pause</h2><p>' + esc(t) + '</p>' + lire('Un mini-jeu est en pause. ' + t) +
    '<button class="btn grand b-aller" data-act="mj-reprendre">▶️ Reprendre le mini-jeu</button><button class="btn second" data-act="fermer">Plus tard</button></div>';
}
/* Le rappel, en bas de l'écran (hors de #app : il reste quand l'écran se redessine) */
M.majRappel = function(){
  var r = document.getElementById('mj-rappel');
  var p = M.mjPause;
  if(!p){ if(r) r.hidden = true; return; }
  if(!r){ r = document.createElement('div'); r.id = 'mj-rappel'; r.setAttribute('role', 'status'); document.body.appendChild(r); }
  r.innerHTML = '<span class="mj-rp-ic">' + esc(p.ic || '🎮') + '<i>⏸️</i></span><span class="mj-rp-t"><b>Mini-jeu en pause</b><small>Il faut le finir !</small></span>' +
    '<button class="btn b-aller mj-rp-go" data-act="mj-reprendre">▶️ Reprendre</button>';
  r.hidden = false;
  placerRappel();
};
function placerRappel(){
  var r = document.getElementById('mj-rappel'); if(!r || r.hidden) return;
  var o = document.querySelector('.b-onglets'), h = o && o.getBoundingClientRect();
  r.style.bottom = (h && h.height ? Math.round(window.innerHeight - h.top + 10) : 14) + 'px';
}
window.addEventListener('resize', placerRappel);
function boireModal(m){
  return '<h2>Une potion peut t\'aider !</h2><p>Tu as une potion qui rend ce mini-jeu plus facile. Tu la bois ?</p>' + lire('Une potion peut t\'aider ! Tu as une potion qui rend ce mini-jeu plus facile. Tu la bois ?') + '<div class="b-potions">' + m.pots.map(function(k){
    var p = D.POTIONS[k];
    return '<button class="b-potion" style="--p:' + p.c + '" data-act="mj-potion" data-id="' + k + '"><span class="b-potion-ic">' + p.ic + '</span><div><b>' + esc(p.nom) + '</b><p>' + esc(p.d) + '</p></div></button>';
  }).join('') + '</div><button class="btn second" data-act="mj-potion" data-id="">Non, je garde ma potion</button>';
}
function autoModal(m){
  return '<h2>' + m.auto.ic + ' ' + esc(m.auto.nom) + '</h2><p>Tu peux réussir sans jouer (encore ' + m.auto.reste + ' fois dans cette enquête). Tu t\'en sers ?</p>' + lire('Tu peux réussir sans jouer, encore ' + m.auto.reste + ' fois dans cette enquête. Tu t\'en sers ?') +
    '<div class="b-rangee"><button class="btn magie" data-act="mj-auto" data-oui="1">✨ Oui, réussir tout de suite</button><button class="btn second" data-act="mj-auto" data-oui="">Non, je joue</button></div>';
}

/* ---------- Codes ---------- */
function codeModal(m){
  var n = M.nomCode(m.code), td = M.texteDonne(m.code);
  td = td.charAt(0).toUpperCase() + td.slice(1);
  return '<div class="b-info-modal"><div class="b-grand-ic">' + n.ic + '</div><h2>' + esc(m.titre || n.nom) + '</h2><p>' + esc(td) + ' ' + lire((m.titre || n.nom) + '. ' + td) + '</p>' + M.codeHTML(M.code(m.code), true) +
    (m.suite ? '<button class="btn grand" data-act="' + m.suite + '" data-id="' + (m.suiteId || '') + '">' + esc(m.suiteTxt || 'C\'est donné !') + '</button>' : '<button class="btn" data-act="fermer">D\'accord</button>') + '</div>';
}
function validerCode(){
  var seq = UI.saisie.slice();
  UI.saisie = [];
  /* Appelé après un petit délai, hors du gestionnaire de clics : une erreur ne doit jamais passer en silence */
  try{ traiterCode(seq); }
  catch(e){ console.error(e); try{ M.render(); }catch(e2){} M.toast('Oups : ' + e.message); }
}
/* « Ce code est pour le Pisteur : dis-lui de le taper sur sa tablette ! » */
function codePourUnAutre(dest){
  if(dest === 'tous-sauf-sage') return 'Ce code est pour les autres joueurs : dis-leur de le taper sur leur tablette !';
  var l = Array.isArray(dest) ? dest : [dest];
  return 'Ce code est pour ' + l.map(function(r){ return D.ROLES[r] ? D.ROLES[r].le : r; }).join(' ou ') +
    (l.length > 1 ? ' : dis-leur de le taper sur leur tablette !' : ' : dis-lui de le taper sur sa tablette !');
}
function traiterCode(seq){
  var S = M.S, P = M.P(), E = M.E(), role = M.role();
  var id = M.idDuCode(seq);
  /* un code gelé qui ne sert plus (le registre des habitants, Romain, 5 novembre : codes-fixes.js le garde) : il ne marche pas */
  if(id && E && /^(obj|info):/.test(id) && !((id.indexOf('obj:') === 0 ? E.objets : E.infos) || {})[id.split(':')[1]]) id = null;
  if(!id){
    /* Un code de passage d'une autre enquête (tapé en retard, ou depuis le village) */
    var v = M.passageVoisin(seq, P ? P.id : S.prochaine);
    if(v){ codeVoisin(v); return; }
    var N = !P && window.ENQUETES[S.prochaine];
    if(N && M.codesEnquete(N).parCode[seq.join('-')]){
      M.son('ko'); M.ouvrir({type:'info', ic:'🔍', titre:'Commence d\'abord l\'enquête ' + N.id, t:'Ce code sert pendant l\'enquête ' + N.id + '. Touche d\'abord le bouton « Enquête ' + N.id + ' », puis tape-le dans ton onglet 🔢 Code.'}); return;
    }
    M.son('ko'); M.ouvrir({type:'info', ic:'🤔', titre:'Ce code ne marche pas', t:'Vérifie les symboles avec ton équipier, et recommence.' +
      (window.BRUMEVAL_VERSION ? ' Si ça ne marche toujours pas, vérifiez que toutes les tablettes ont la même version du jeu (en bas des Réglages). Celle-ci : ' + M.versionTxt() + '.' : '')}); return;
  }
  var dest = M.destinataire(id), t = id.split(':')[0], x = id.split(':')[1];
  var ok = dest === 'tous' || (dest === 'tous-sauf-sage' && role !== 'sage') || dest === role || (Array.isArray(dest) && dest.indexOf(role) >= 0);
  if(!ok){
    M.son('ko');
    M.ouvrir({type:'info', ic:'🤝', titre:'Ce code est pour un équipier', t:codePourUnAutre(dest)});
    return;
  }
  /* un mini-jeu en pause : le moment, la fin de l'enquête… attendent qu'il soit fini */
  if(M.mjPause && /^(moment|victoire|suite|defaite)$/.test(t)){ M.rappelPause('Ce code fait avancer toute l\'enquête : tu le taperas après.'); return; }
  /* Tapé depuis le village : on revient à l'enquête */
  UI.ecran = 'enquete';
  if(t === 'moment'){
    var n = +x;
    if(n <= P.moment){ M.ouvrir({type:'info', ic:'⏳', titre:'Tu y es déjà', t:'Tu es déjà à ce moment de la journée.'}); return; }
    passerMoment(n); return;
  }
  if(t === 'victoire'){ commencerFin(+x); return; }
  if(t === 'suite'){ enqueteSuivante(+x, E.id); return; }
  if(t === 'defaite'){ M.defaite(); return; }
  if(t === 'aide'){
    if(M.sansActions()){ M.ouvrir({type:'info', ic:'💡', titre:'Pas besoin', t:'Ce code ne sert pas dans cette enquête.'}); return; }   /* pas de points d'action, pas de réserve du Sage */
    P.aides = P.aides || {};
    if(P.aides[id] || id === 'aide:action'){ M.ouvrir({type:'info', ic:'💡', titre:'Déjà reçu', t:'Ce code a déjà servi. Demande au Sage un nouveau code.'}); return; }
    if(P.aides['m' + P.moment]){ M.ouvrir({type:'info', ic:'💡', titre:'Déjà reçu', t:'Tu as déjà reçu une action du Sage pendant ce moment. Attends le moment suivant.'}); return; }
    if(P.etape !== 'jeu'){ M.ouvrir({type:'info', ic:'💡', titre:'Pas maintenant', t:'Ce code sert pendant l\'enquête.'}); return; }
    P.aides[id] = true; P.aides['m' + P.moment] = true; P.actions++; M.son('magie'); M.sauver();
    M.ouvrir({type:'info', ic:'💡', titre:'Une action en plus !', t:'Le Sage t\'inspire : tu as une action de plus pour ce moment.'}); return;
  }
  if(t === 'pot'){
    P.potions[x] = (P.potions[x] || 0) + 1; M.son('magie');
    var p = D.POTIONS[x];
    M.noter('Reçu : ' + p.nom + '. ' + p.d, p.ic);
    M.ouvrir({type:'info', ic:p.ic, titre:'Tu as reçu : ' + p.nom, t:p.d}); return;
  }
  if(M.codeSpecial && M.codeSpecial(t, x, id)) return;   /* les codes des talents du Barde : rumeur, plaidoirie, recette (barde.js) */
  if(M.codeChemin && M.codeChemin(id)) return;   /* un chemin secret du Pisteur : tout droit à son tableau, dans sa cabane (carte-jeu.js) */
  if(P.recus[id]){ M.ouvrir({type:'info', ic:'👍', titre:'Déjà reçu', t:'Tu as déjà ce code.'}); return; }
  P.recus[id] = true; M.son('gain');
  var nn = M.nomCode(id);
  if(t === 'obj'){
    M.noter('Reçu : ' + nn.nom + '.', nn.ic);
    var quoi = role === 'alchimiste' ? 'Tu peux l\'analyser dans ton atelier.' : role === 'barde' ? 'Tu peux le montrer aux habitants.' : role === 'sage' ? 'Regarde ton Grand Livre.' : 'Regarde ton sac.';
    if(M.codePourTous(id)) quoi = ouvertPourMoi(id);
    M.ouvrir({type:'info', ic:nn.ic, titre:'Tu as reçu : ' + nn.nom, t:quoi});
  } else {
    var I = E.infos[x];
    /* Une info peut apprendre une recette à l'Alchimiste pour toute la saison */
    if(I.recette){ M.S.recettes = M.S.recettes || []; if(M.S.recettes.indexOf(I.recette) < 0) M.S.recettes.push(I.recette); M.sauver(); }
    if(I.outil){ M.S.outils = M.S.outils || []; if(M.S.outils.indexOf(I.outil) < 0) M.S.outils.push(I.outil); M.sauver(); }
    M.noter('Reçu : ' + nn.nom + '. ' + (I.t || ''), nn.ic);
    M.ouvrir({type:'info', ic:nn.ic, illu:I.illu, titre:'Tu as reçu : ' + nn.nom, t:(I.t || '') + (I.pnj && M.surQui ? ' C\'est noté sur ' + M.surQui(id) + ', dans ton Carnet 📒.' : '') + (M.codePourTous(id) ? ' ' + ouvertPourMoi(id) : '')});
  }
}
/* Un plan ou un passage : ce qu'il ouvre pour moi, ou qui va s'en servir */
function lieuUtile(l, role){
  var E = M.E(), L = E.lieux[l] || {};
  if(L[role]) return true;
  if(role === 'alchimiste' && M.lieuxAlchimiste().indexOf(l) >= 0) return true;
  if(role === 'barde' && M.cle(E.pnj || {}).some(function(id){ var o = E.pnj[id].ou || {}; return M.cle(o).some(function(k){ return o[k] === l; }); })) return true;
  return (E.ecoutes || []).some(function(x){ return x.lieu === l && x.role === role; }) || (E.bonus || []).some(function(b){ return b.lieu === l && b.role === role; });
}
function ouvertPourMoi(code){
  var lieux = M.codesLieux(M.E())[code] || [], role = M.role();
  var moi = lieux.filter(function(l){ return lieuUtile(l, role); });
  var guide = M.carteGuidee ? M.carteGuidee() : null;   /* E1, Pisteur : sa carte se dévoile pas à pas, on ne nomme que ce qu'elle montre */
  if(guide && moi.some(function(l){ return guide.indexOf(l) >= 0; })) moi = moi.filter(function(l){ return guide.indexOf(l) >= 0; });
  if(moi.length){
    /* le Pisteur : un passage trouvé sous terre est sur son tableau des chemins secrets, dans sa cabane (carte-jeu.js) */
    var cab = moi.filter(function(l){ return M.dansCabane && M.dansCabane(l); }), vil = moi.filter(function(l){ return cab.indexOf(l) < 0; });
    var noms = function(l){ return l.map(function(x){ return M.nomLieu(x); }).join(', '); };
    return (vil.length ? 'C\'est ouvert sur ta carte 🗺️ : ' + noms(vil) + '.' : '') + (vil.length && cab.length ? ' ' : '') +
      (cab.length ? 'C\'est sur ton tableau des chemins secrets, dans ta cabane 🛖 : ' + noms(cab) + '.' : '');
  }
  var qui = ['pisteur', 'alchimiste', 'barde', 'sage'].filter(function(r){ return r !== role && lieux.some(function(l){ return lieuUtile(l, r); }); });
  return 'Pour toi, il n\'y a rien à faire là-bas pour l\'instant' + (qui.length ? ' : c\'est ' + qui.map(function(r){ return D.ROLES[r].le; }).join(' et ') + (qui.length > 1 ? ' qui y vont.' : ' qui y va.') : '.');
}
/* Code de passage (fin, enquête suivante) d'une autre enquête que celle de cette tablette */
function codeVoisin(v){
  var S = M.S, P = M.P(), t = v.id.split(':')[0], x = +v.id.split(':')[1], ici = P ? P.id : null;
  if(M.mjPause){ M.rappelPause(); return; }
  if(P && v.e < ici){
    UI.modal = null; UI.ecran = 'enquete'; M.son('ok');
    M.ouvrir({type:'info', ic:'✅', titre:'Tu es déjà dans l\'enquête ' + ici, t:(t === 'suite' ? 'Ce code servait à venir dans l\'enquête ' + ici + '.' : 'Ce code était celui de la fin de l\'enquête ' + v.e + '.') + ' Ta tablette est déjà dans l\'enquête ' + ici + ' : c\'est tout bon !'});
    return;
  }
  if(P && v.e > ici){
    M.son('ko');
    M.ouvrir({type:'info', ic:'⏳', titre:'Ta tablette est en retard', t:'Ce code est celui de l\'enquête ' + v.e + ', mais ta tablette est encore à l\'enquête ' + ici + '. Finis-la d\'abord, puis touche le bouton « 🔍 Enquête ' + v.e + ' ».'});
    return;
  }
  /* Pas d'enquête sur la tablette (au village, après « Retour au village ») */
  if(t === 'suite' && v.e === S.prochaine - 1){
    if(M.role() === 'sage'){ M.son('ko'); M.ouvrir({type:'info', ic:'🔍', titre:'Pas besoin de code', t:'Pour partir à l\'enquête ' + S.prochaine + ', chacun touche le bouton « 🔍 Enquête ' + S.prochaine + ' » sur sa tablette.'}); return; }
    enqueteSuivante(x, v.e); return;
  }
  if(t === 'victoire' && v.e < S.prochaine){
    M.son('ok');
    M.ouvrir({type:'info', ic:'🏆', titre:'L\'enquête ' + v.e + ' est déjà finie', t:'Tu as déjà fini l\'enquête ' + v.e + ' ! Pour partir à l\'enquête suivante, touche le bouton « 🔍 Enquête ' + S.prochaine + ' ».'});
    return;
  }
  M.son('ko'); M.ouvrir({type:'info', ic:'🤔', titre:'Ce code ne sert plus', t:'Ce code est celui d\'une autre enquête. Pour changer d\'enquête, touche le bouton de l\'enquête sur l\'écran du village.'});
}

/* ---------- Moments ---------- */
function momentModal(){
  var E = M.E(), P = M.P(), n = P.moment + 1;
  if(n >= E.moments.length){
    return '<div class="b-info-modal"><div class="b-grand-ic">🌙</div><h2>C\'est la fin de la journée</h2><p>Il n\'y a plus de moment après celui-ci. Quand l\'équipe est prête, il faut accuser !</p>' + lire('C\'est la fin de la journée. Il n\'y a plus de moment après celui-ci. Quand l\'équipe est prête, il faut accuser !') + '<button class="btn grand" data-act="accuser">⚖️ Accuser</button></div>';
  }
  var mo = D.MOMENTS[E.moments[n]];
  var vers = {matin:'au matin', apresmidi:'à l\'après-midi', soir:'au soir', nuit:'à la nuit'}[E.moments[n]] || ('au ' + mo.nom.toLowerCase());   /* « Passer à l'après-midi », pas « au après-midi » */
  var fini = M.sansActions() ? 'Toute l\'équipe a tout fait ?' : 'Toute l\'équipe a fini ses actions ?';
  return '<div class="b-info-modal"><div class="b-grand-ic">' + mo.ic + '</div><h2>Passer ' + vers + ' ?</h2><p>' + fini + ' Dis ce code aux autres : ils le tapent dans leur onglet 🔢 Code.</p>' + lire('Passer ' + vers + ' ? ' + fini + ' Dis ce code aux autres : ils le tapent dans leur onglet Code.') +
    M.codeHTML(M.code('moment:' + n), true) + '<button class="btn grand" data-act="passer-moment">' + mo.ic + ' Passer ' + vers + '</button></div>';
}
function passerMoment(n){
  var P = M.P(), E = M.E();
  P.moment = n; P.actions = M.actionsMax();
  M.sauver();
  var mo = D.MOMENTS[E.moments[n]];
  UI.modal = null;
  M.render();
  var f = document.getElementById('transition');
  f.innerHTML = '<div class="b-trans-ic">' + mo.ic + '</div><h2>' + mo.nom + '</h2>';
  f.className = 'on moment-' + E.moments[n];
  M.son('cloche');
  M.lireAuto(mo.nom + (M.sansActions() ? ' !' : ' ! Nouvelles actions.'));
  setTimeout(function(){ f.className = ''; }, 2200);
}

/* ---------- Accusation (Sage) ---------- */
function dims(){ var E = M.E(); return ['qui', 'ou', 'quoi', 'pourquoi'].filter(function(d){ return E[d]; }); }   /* POURQUOI : l'enquête 2 */
function accusationModal(m){
  var E = M.E(), P = M.P(), d = m.etape;
  if(d === 'confirmer'){
    var s = '<h2>⚖️ Votre accusation</h2><div class="b-acc-resume">';
    dims().forEach(function(k){
      var v = m.choix[k];
      if(k === 'qui') s += '<div class="b-acc-choix"><div class="b-acc-img">' + M.pnjImg(v, 'peur') + '</div><b>' + esc(D.PNJ[v].court) + '</b></div>';
      else { var c = E[k].choix.filter(function(x){ return x.id === v; })[0]; s += '<div class="b-acc-choix"><div class="b-grand-ic">' + c.ic + '</div><b>' + esc(c.nom) + '</b></div>'; }
    });
    return s + '</div><p class="centre">Toute l\'équipe est d\'accord ? ' + lire('Toute l\'équipe est d\'accord ?') + '</p><div class="b-rangee centre"><button class="btn second" data-act="acc-retour">← Changer</button><button class="btn grand" data-act="acc-valider">⚖️ J\'accuse !</button></div>';
  }
  var D2 = E[d];
  var s2 = '<h2>' + esc(D2.titre) + '</h2>';
  if(d === 'qui'){
    var strat = M.fxSomme('stratege') > 0 && !P.usages.stratege;
    s2 += (strat ? '<button class="btn magie petit" data-act="stratege">♟️ Rayer deux innocents</button>' : '') + '<div class="b-suspects">' + D2.choix.map(function(id){
      var r = P.raye.indexOf(id) >= 0 || !!(M.tableauRaye && M.tableauRaye('qui', id));   /* rayé (Stratège) ou barré dans le tableau du Sage */
      return '<button class="b-suspect' + (r ? ' raye' : '') + (m.choix.qui === id ? ' on' : '') + '" data-act="acc-choix" data-k="qui" data-v="' + id + '"><div class="b-suspect-img">' + M.pnjImg(id) + '</div><b>' + esc(D.PNJ[id].court) + '</b></button>';
    }).join('') + '</div>';
  } else {
    s2 += '<div class="b-lieux-acc">' + D2.choix.map(function(c){
      var barre = M.tableauRaye && M.tableauRaye(d, c.id) ? ' raye' : '';   /* barré dans le tableau du Sage : grisé, mais choisissable */
      if(c.pnj && D.PNJ[c.id]) return '<button class="b-suspect' + barre + (m.choix[d] === c.id ? ' on' : '') + '" data-act="acc-choix" data-k="' + d + '" data-v="' + c.id + '"><div class="b-suspect-img">' + M.pnjImg(c.id) + '</div><b>' + esc(c.nom) + '</b></button>';
      return '<button class="b-lieu-acc' + barre + (m.choix[d] === c.id ? ' on' : '') + '" data-act="acc-choix" data-k="' + d + '" data-v="' + c.id + '"><span>' + c.ic + '</span><b>' + esc(c.nom) + '</b></button>';
    }).join('') + '</div>';
  }
  s2 += coeursHTML();
  return s2;
}
/* Enquête 3 : après les trois bonnes réponses, une quatrième question apparaît, « QUI est le Corbeau ? » (Romain, 3 novembre).
   Elle ne coûte aucun cœur : la réponse est gardée (P.corbeau), et la fin de l'histoire est la même pour toute l'équipe. */
function corbeauModal(m){
  var E = M.E(), C = E.corbeau, t = C.t || '';
  return '<div class="b-corbeau-q"><div class="b-grand-ic">🪶</div><h2>' + esc(C.titre) + '</h2><p>' + esc(t) + ' ' + lire(t) + '</p>' +
    '<div class="b-suspects">' + C.choix.map(function(id){
      return '<button class="b-suspect" data-act="corbeau-choix" data-v="' + id + '" data-n="' + m.n + '"><div class="b-suspect-img">' + M.pnjImg(id) + '</div><b>' + esc(D.PNJ[id].court) + '</b></button>';
    }).join('') + '</div></div>';
}
function victoireModal(m){
  var E = M.E(), cb = '';
  if(m.corbeau && E && E.corbeau){
    var ok = m.corbeau === E.corbeau.solution, tc = ok ? E.corbeau.bravo : E.corbeau.rate;
    cb = '<p class="b-corbeau-rep' + (ok ? ' ok' : '') + '">' + (ok ? '🪶 ' : '❔ ') + esc(tc) + ' ' + lire(tc) + '</p>';
  }
  return '<div class="b-info-modal b-victoire"><div class="b-grand-ic">🏆</div><h2>Bravo, c\'est la bonne réponse !</h2>' + cb + '<p>Donne ce code à toute l\'équipe pour qu\'ils voient la fin de l\'histoire :</p>' + lire('Bravo, c\'est la bonne réponse ! Donne ce code à toute l\'équipe pour qu\'ils voient la fin de l\'histoire.') +
    M.codeHTML(M.code('victoire:' + m.n), true) + '<button class="btn grand" data-act="fin-sage" data-n="' + m.n + '">📜 Voir la fin de l\'histoire</button></div>';
}
function validerAccusation(m){
  var E = M.E(), P = M.P(), bon = 0, total = 0;
  dims().forEach(function(k){ total++; if(m.choix[k] === E.solution[k]) bon++; });
  if(bon === total){
    P.resolu = true; M.son('victoire');
    if(E.corbeau && !P.corbeau){ M.sauver(); M.ouvrir({type:'corbeau', n:Math.min(P.erreurs, 2), fixe:true}); return; }   /* enquête 3 : la quatrième question */
    M.ouvrir({type:'victoire', n:Math.min(P.erreurs, 2), fixe:true});
    return;
  }
  if(M.plaidoirie && M.plaidoirie(m)) return;   /* le Barde plaide : l'accusé innocent le prouve, pas de cœur perdu (barde.js) */
  if(M.fxSomme('protection') > (P.usages.protection || 0)){
    P.usages.protection = (P.usages.protection || 0) + 1;
    M.son('magie');
    M.ouvrir({type:'info', ic:'🛡️', titre:'Les runes vous protègent', t:'Ce n\'est pas la bonne réponse, mais tes Runes de protection effacent cette erreur. ' + (bon ? 'Une partie de votre accusation est juste.' : 'Rien n\'est juste.')});
    return;
  }
  P.erreurs++;
  M.son('echec');
  var c = M.coeurs();
  if(c <= 0){ M.defaite(); return; }
  M.ouvrir({type:'info', ic:'💔', titre:'Ce n\'est pas ça…', t:(total > 1 ? (bon ? 'Une partie de votre accusation est juste, mais pas tout. ' : 'Rien n\'est juste. ') : '') + 'Tu perds un cœur. ' + (c > 1 ? 'Il te reste ' + (c - 1) + ' cœur' + (c > 2 ? 's' : '') + '.' : 'Plus de cœur : attention, la prochaine erreur fait perdre !') + ' Parlez-en ensemble et cherchez encore !'});   /* cœurs affichés = erreurs encore permises (Romain, 4 novembre) */
}
/* Les cœurs du Sage, et l'élixir s'il l'a reçu */
function elixirDispo(){
  var P = M.P(); if(!P || (P.usages && P.usages.elixir) || M.coeurs() >= M.COEURS) return null;
  return M.cle(P.potions || {}).filter(function(k){ return P.potions[k] > 0 && D.POTIONS[k] && D.POTIONS[k].fx && D.POTIONS[k].fx.coeur; })[0] || null;
}
/* Les cœurs affichés = les erreurs encore permises (Romain, 4 novembre) : 2 cœurs = on peut se tromper 2 fois, la 3e erreur fait perdre.
   (En interne, M.coeurs() compte toujours les essais qui restent : 3 au départ.) */
function coeursHTML(){
  var c = M.coeurs(), v = Math.max(0, c - 1), tot = M.COEURS - 1, s = '<div class="b-coeurs" aria-label="' + v + ' cœur' + (v > 1 ? 's' : '') + '">';
  for(var i = 0; i < tot; i++) s += '<span class="' + (i < v ? '' : 'vide') + '">❤️</span>';
  var t = c >= M.COEURS ? 'Tu as ' + tot + ' cœurs : tu peux te tromper ' + tot + ' fois. À la ' + (tot + 1) + 'e erreur, c\'est perdu.' :
    v > 0 ? 'Il te reste ' + v + ' cœur' + (v > 1 ? 's' : '') + ' : tu peux encore te tromper ' + v + ' fois.' : 'Plus de cœur : attention, la prochaine erreur fait perdre !';
  s += lire(t) + '</div><p class="doux petit centre">' + esc(t) + '</p>';
  var el = elixirDispo();
  if(el) s += '<div class="centre"><button class="btn magie" data-act="elixir" data-id="' + el + '">' + D.POTIONS[el].ic + ' Boire l\'élixir : +1 cœur</button></div>';
  return s;
}
M.coeursHTML = coeursHTML;

/* ---------- Défaite : le Sage n'a plus de cœur, ou on abandonne ---------- */
M.defaite = function(abandon){
  var P = M.P(); if(!P) return;
  if(P.etape === 'fin' && !P.defaite) return;
  if(!P.defaite) P.defaite = {slide:0, abandon:!!abandon};
  P.resolu = true;
  UI.modal = null; UI.saisie = []; UI.ecran = 'enquete';
  M.son('echec'); M.sauver(); M.render(); window.scrollTo(0, 0);
};
/* Le héros entre dans le Livre des Légendes, puis tout recommence à la création (on garde seulement l'apparence).
   « Si on perd, c'est la fin de tout » (Romain) : l'atelier repart à neuf (meubles, décoration, styles, carton du coin, chat). */
/* fin : 'defaite' (le Sage n'a plus de cœur) ou 'supprime' (« Supprimer le personnage » du menu ☰). La légende garde l'apparence exacte (look). */
M.recommencer = function(fin){
  var S = M.S, h = S.heros; if(!h) return;
  var P = S.e, fini = P && P.etape === 'fin' && !P.defaite, look = null;
  try{ look = M.lookActuel ? M.lookActuel() : M.copie(M.heroObj()); }catch(e){}
  var leg = (S.legendes || []).concat([{nom:h.nom, role:h.role, sexe:h.sexe, niveau:M.niveau(S.xp).n, e:P && !fini ? P.id : S.prochaine, date:new Date().toISOString().slice(0, 10),
    fin:fin === 'supprime' ? 'supprime' : 'defaite', look:look}]);
  delete h.joueur;
  var ancien = {heros:M.copie(h)};
  var opts = S.options;
  M.S = M.etatNeuf(); M.S.options = opts; M.S.legendes = leg; M.S.ancien = ancien;
  M.sauver();
  UI.crea = creaDefaut(null); UI.creaEtape = 1; UI.ecran = 'creation'; UI.modal = null;
  M.render(); window.scrollTo(0, 0);
};

/* ---------- Fin d'enquête ---------- */
function commencerFin(erreurs){
  var P = M.P(), E = M.E();
  UI.ecran = 'enquete';   /* même tapé depuis le village : on montre la fin */
  if(P.defaite){ UI.modal = null; M.render(); return; }
  if(P.etape === 'fin') { UI.modal = null; M.render(); return; }
  recompenser(erreurs);
  UI.modal = null;
  M.sauver(); M.render();
  window.scrollTo(0, 0);
  M.lireAuto(E.fin.slides[0]);
}
/* Passer directement à l'enquête suivante (code du Sage). Les récompenses sont données si ce n'est pas déjà fait.
   « depuis » : l'enquête que l'on quitte (celle du code). Sans enquête sur la tablette (village), on part à la prochaine.
   Jamais de retour en silence : il y a toujours un message qui dit quoi faire. */
function enqueteSuivante(erreurs, depuis){
  var S = M.S, P = M.P(), E = M.E();
  var de = depuis || (E ? E.id : S.prochaine - 1), id = de + 1;
  if(!window.ENQUETES[id]){ M.ouvrir({type:'info', ic:'🏁', titre:'C\'était la dernière enquête', t:'Il n\'y a pas encore d\'enquête après celle-ci. La suite arrive bientôt !'}); return; }
  if(P && P.defaite){ M.ouvrir({type:'info', ic:'🌫️', titre:'Ton enquête est perdue', t:'Sur cette tablette, l\'enquête ' + P.id + ' est perdue. Va jusqu\'au bout de l\'histoire, puis recrée ton héros avec l\'équipe.'}); return; }
  if(P && E && E.id === id){ UI.modal = null; UI.ecran = 'enquete'; M.render(); M.ouvrir({type:'info', ic:'✅', titre:'Tu es déjà dans l\'enquête ' + id, t:'Ta tablette est déjà dans l\'enquête ' + id + ' : c\'est tout bon !'}); return; }
  if(P && E && E.id === de){
    if(P.etape !== 'fin') recompenser(erreurs);
    M.archiver();
  } else if(id !== S.prochaine){
    M.ouvrir({type:'info', ic:'🤔', titre:'Ce code ne sert plus', t:'Ta tablette n\'est pas à l\'enquête ' + de + '. Retourne au village et touche le bouton de l\'enquête.'}); return;
  }
  UI.modal = null; UI.saisie = []; UI.padSuite = false;
  nouvelleEnquete(id);
  if(M.enEcriture(window.ENQUETES[id])) return;   /* pas encore jouable : nouvelleEnquete l'a dit */
  M.son('cloche');
  M.toast('En route pour l\'enquête ' + id + ' !');
}
M.enqueteSuivante = enqueteSuivante;
function recompenser(erreurs){
  var P = M.P(), E = M.E(), S = M.S;
  var avant = M.niveau(S.xp).n;
  var xp = erreurs >= 3 ? 70 : 130;  /* une enquête gagnée = 130 points = toujours un niveau (seuils D.SEUILS tous les 130) */
  var or = erreurs >= 3 ? 20 : Math.max(30, 50 - 5 * erreurs);
  S.xp += xp; S.or += or;
  E.fin.calepin.forEach(function(c){ S.calepin.push({e:E.id, ic:c.ic, t:c.t}); });
  S.finies[E.id] = {erreurs:erreurs};
  S.prochaine = Math.max(S.prochaine, E.id + 1);
  P.etape = 'fin'; P.resolu = true;
  P.fin = {etape:'histoire', slide:0, xp:xp, or:or, erreurs:erreurs, monte:M.niveau(S.xp).n > avant};
  if(P.fin.monte && window.Atelier && S.atelier && M.role() === 'alchimiste') Atelier.donnerCartons(S.atelier, 1);
}

/* ---------- Talents ---------- */
function talentModal(m){
  var role = M.role(), choix = (D.TALENTS_PAR_ROLE[role] || {})[m.palier] || [];
  return '<h2>⭐ Talent du niveau ' + m.palier + '</h2><p>Choisis bien : c\'est pour toujours ! ' + lire('Choisis bien : c\'est pour toujours !') + '</p><div class="b-talents-choix">' + choix.map(function(id){
    var t = D.TALENTS[id];
    var h = M.heroObj(); h.talents = h.talents.concat([id]);
    return '<button class="b-talent-carte" data-act="talent" data-id="' + id + '"><div class="b-talent-img">' + M.portrait('buste', true, false, h) + '</div><b>' + t.ic + ' ' + esc(t.nom) + '</b><p>' + esc(t.d) + '</p></button>';
  }).join('') + '</div>' + lire(choix.map(function(id){ return D.TALENTS[id].nom + ' : ' + D.TALENTS[id].d; }).join(' Ou bien : '));
}

/* ---------- Chaudron (Alchimiste) ---------- */
function chaudronModal(m){
  var S = M.S, r = m.recette, R = D.RECETTES[r], p = D.POTIONS[r];
  var compte = {};
  m.seq.forEach(function(i){ compte[i] = (compte[i] || 0) + 1; });
  var couleur = m.seq.length ? D.INGR[m.seq[m.seq.length - 1]].c : '#3a3f6b';
  var s = '<h2>' + p.ic + ' ' + esc(p.nom) + '</h2>' +
    (R.secrete ? '<p class="b-secret">📖 Le Sage a la recette : demande-lui combien de chaque ingrédient, et dans quel ordre ! ' + lire('Le Sage a la recette : demande-lui combien de chaque ingrédient, et dans quel ordre !') + '</p>' :
      '<p class="b-recette-ingr">' + R.ingr.map(function(x){ return x[1] + ' ' + D.INGR[x[0]].ic; }).join(' → ') + '</p>') +
    '<div class="b-chaudron-scene"><svg viewBox="0 0 200 160" class="b-chaudron"><ellipse cx="100" cy="150" rx="70" ry="8" fill="rgba(0,0,0,.35)"/>' +
    '<path d="M38 70 Q36 140 100 142 Q164 140 162 70Z" fill="#2b2a3a" stroke="#24182e" stroke-width="5"/>' +
    '<ellipse cx="100" cy="70" rx="64" ry="16" fill="' + couleur + '" stroke="#24182e" stroke-width="5" class="b-surface"/>' +
    '<ellipse cx="86" cy="66" rx="18" ry="4" fill="#fff" opacity=".3"/><circle class="b-bul b1" cx="80" cy="66" r="4" fill="#fff" opacity=".5"/><circle class="b-bul b2" cx="118" cy="70" r="3" fill="#fff" opacity=".5"/>' +
    '<path d="M60 150 l-8 10 M140 150 l8 10" stroke="#24182e" stroke-width="6"/><path class="b-feu" d="M70 152 Q80 132 90 152 Q100 128 110 152 Q120 134 130 152Z" fill="#e8693c"/></svg>' +
    '<div class="b-seq">' + (m.seq.length ? m.seq.map(function(i){ return '<span>' + D.INGR[i].ic + '</span>'; }).join('') : '<span class="doux petit">Verse les ingrédients dans l\'ordre</span>') + '</div></div>' +
    '<div class="b-bocaux">' + M.cle(S.ingr).filter(function(k){ return S.ingr[k] > 0; }).map(function(k){
      var reste = S.ingr[k] - (compte[k] || 0), I = D.INGR[k];
      return '<button class="b-bocal" style="--p:' + I.c + '" data-act="verser" data-id="' + k + '"' + (reste > 0 ? '' : ' disabled') + '><i>' + I.ic + '</i><b>' + reste + '</b><small>' + esc(I.nom) + '</small></button>';
    }).join('') + '</div>' +
    '<p class="doux petit">🧪 ' + S.fioles + ' fiole' + (S.fioles > 1 ? 's' : '') + ' vide' + (S.fioles > 1 ? 's' : '') + '</p>' +
    '<div class="b-rangee centre"><button class="btn second" data-act="vider"' + (m.seq.length ? '' : ' disabled') + '>↺ Recommencer</button><button class="btn grand" data-act="cuire"' + (m.seq.length && S.fioles > 0 ? '' : ' disabled') + '>🔥 Cuire' + M.coutTxt() + '</button></div>';
  return s;
}
function attendu(r){ var l = []; D.RECETTES[r].ingr.forEach(function(x){ for(var i = 0; i < x[1]; i++) l.push(x[0]); }); return l; }
function cuire(m){
  var S = M.S, P = M.P(), E = M.E(), r = m.recette, R = D.RECETTES[r], p = D.POTIONS[r];
  var auto = M.fxVrai('autoPotion') && P.usages.athanor !== P.moment;
  if(!auto){ if(!M.peutAgir()) return; M.depenser(); } else P.usages.athanor = P.moment;
  m.seq.forEach(function(i){ S.ingr[i]--; });
  var bon = attendu(r).join(',') === m.seq.join(',');
  UI.modal = null;
  if(!bon){
    M.sauver();
    M.decouvrir({ic:'💨', titre:'La potion est ratée', t:'La potion devient grise et se met à fumer… Ce n\'était pas le bon ordre, ou pas les bonnes quantités. Les ingrédients sont perdus, mais la fiole est sauvée.', rate:true});
    return;
  }
  function reussi(){
    S.fioles--;
    var doses = 1 + M.fxSomme('doses');
    S.potions[r] = (S.potions[r] || 0) + doses;
    M.son('magie'); M.sauver();
    M.decouvrir({ic:p.ic, titre:'Potion réussie !', t:'Tu as fabriqué : ' + p.nom + (doses > 1 ? ' (' + doses + ' doses)' : '') + '. ' + p.d + ' Donne-la à un équipier avec son code, depuis ton atelier.'});
  }
  if(auto){ reussi(); return; }
  M.lancerMJ(R.cuisson, E.niveau, R.cuisson === 'chaudron' ? {potion:r} : null, {titre:'Cuisson : ' + p.nom, sansPotion:true, sansIntro:true}, function(res){
    if(res.reussi) reussi();
    else {
      var casse = !M.fxVrai('fioleSolide');
      if(casse) S.fioles--;
      M.sauver();
      M.decouvrir({ic:'💥', titre:'La cuisson a raté', t:'Le chaudron déborde… Les ingrédients sont perdus' + (casse ? ' et la fiole s\'est brisée.' : ', mais tes fioles renforcées ont tenu bon.'), rate:true});
    }
  });
}

/* ---------- Comment jouer ---------- */
var AIDE = [
  ['👥', 'Quatre enquêteurs', 'Chacun a son écran et son rôle : le Pisteur, l\'Alchimiste, le Barde et le Sage. Chacun voit des choses que les autres ne voient pas.'],
  ['🗣️', 'On se parle !', 'Personne ne résout l\'enquête seul. Raconte à voix haute ce que tu découvres, et écoute les autres.'],
  ['☀️', 'Les moments de la journée', 'Matin, après-midi, soir, nuit. À chaque moment, tu as deux actions : explorer un lieu, parler à quelqu\'un, cueillir, fabriquer, lire…'],
  ['🔢', 'Les codes', 'Un objet trouvé, une potion, un plan : ça passe d\'un écran à l\'autre avec trois symboles. Dis-les, et l\'équipier les tape dans son onglet Code.'],
  ['⏭️', 'Le Sage est le chef', 'Quand tout le monde a fini, le Sage donne le code du moment suivant. À la fin, toute l\'équipe en parle, et le Sage accuse.'],
  ['🗺️', 'La carte', 'Au début, on ne sait pas qui habite où. Quand quelqu\'un te le dit, touche la maison sur ta carte pour l\'écrire.'],
  ['⭐', 'Devenir un héros', 'Chaque enquête rapporte de l\'expérience et de l\'or. Choisis des talents, achète de l\'équipement : ton héros change pour de vrai !']
];
/* La page « Comment jouer » du menu ☰ (heros.js) : le contenu, sans bouton en bas */
var AIDE_SANS = ['☀️', 'Les moments de la journée', 'Matin, après-midi, soir, nuit. À chaque moment, chaque lieu et chaque habitant te donne une chose : explorer, parler à quelqu\'un, cueillir, fabriquer, lire… Quand tu as tout fait, le Sage te donne le code du moment suivant.'];   /* une enquête sans points d'action */
M.aideHTML = function(){
  return '<div class="b-aide">' + AIDE.map(function(a, k){
    if(k === 2 && M.sansActions()) a = AIDE_SANS;
    return '<div class="b-aide-carte"><span class="b-ic">' + a[0] + '</span><div><b>' + esc(a[1]) + '</b><p>' + esc(a[2]) + '</p></div>' + lire(a[1] + '. ' + a[2]) + '</div>';
  }).join('') + '</div>';
};

/* ---------- Calepin ---------- */
function calepinModal(){
  var S = M.S, parE = {};
  S.calepin.forEach(function(c){ (parE[c.e] = parE[c.e] || []).push(c); });
  return '<h2>📔 Le calepin</h2><p class="doux">Les indices des enquêtes passées. Certains prendront tout leur sens plus tard… ' + lire('Les indices des enquêtes passées. Certains prendront tout leur sens plus tard…') + '</p>' +
    M.cle(parE).map(function(e){ var E = window.ENQUETES[e]; return '<h3>Enquête ' + e + ' · ' + esc(E ? E.titre : '') + '</h3><ul class="b-notes">' + parE[e].map(function(c){ return '<li><span class="b-ic">' + c.ic + '</span><p>' + esc(c.t) + '</p>' + lire(c.t) + '</li>'; }).join('') + '</ul>'; }).join('');
}
/* Le menu ☰ est une page (M.ecranMenu, heros.js). Ce qu'il montrait avant est ailleurs : la boutique par la bourse 👛
   de l'écran du héros, la lettre du maire et le calepin dans le Carnet, la réserve du Sage dans son Carnet, les sons dans les Réglages. */

/* ---------- Création ---------- */
function creaDefaut(role){
  var base = window.Persos ? Persos.defaut(role || 'pisteur', 'f') : {sexe:'f'};
  base.role = role || null; base.nom = '';
  return base;
}
function hasard(c){
  var C = Persos.CHOIX, pick = function(l){ return l[Math.floor(Math.random() * l.length)].id; };
  c.peau = pick(C.peau); c.coiffure = pick(C.coiffure[c.sexe]); c.cheveux = pick(C.cheveux); c.yeux = pick(C.yeux); c.tenue = pick(C.tenue);
  if(c.sexe === 'm' && C.barbe) c.barbe = c.age === 'enfant' ? C.barbe[0].id : pick(C.barbe);
}

/* ---------- Début d'enquête ---------- */
function nouvelleEnquete(id){
  var S = M.S, E = window.ENQUETES[id];
  /* une enquête en cours d'écriture (E.enEcriture : l'enquête 3, tant qu'elle n'est pas réécrite) ne se joue pas */
  if(M.enEcriture(E)){ UI.ecran = 'accueil'; UI.saisie = []; UI.padSuite = false; M.sauver(); M.ouvrir({type:'info', ic:'🚧', titre:'Enquête ' + id + ' : en cours d\'écriture', t:'L\'enquête ' + id + ' est en train d\'être écrite. Elle arrive bientôt ! Votre or et votre expérience sont bien gardés.'}); return; }
  if(S.e && S.e.etape === 'fin' && !S.e.defaite) M.archiver();
  var avant = S.e;
  S.e = M.enqueteNeuve(id);
  var P = S.e;
  /* le tableau de liège du Barde reste comme il était à la fin de l'enquête d'avant (liege.js) */
  if(M.role() === 'barde' && M.liegeGarde){ var lg = M.liegeGarde(S, avant); if(lg) P.liege = lg; }
  /* (enquête 3, E.signesDepart) les étiquettes des menteurs qui manquent sur le liège s'épinglent toutes seules, avec une note au Carnet */
  if(M.role() === 'barde' && E.signesDepart){
    P.mimiques = P.mimiques || {};
    (E.signesDepart.qui || []).forEach(function(k){ P.mimiques[k] = P.mimiques[k] || 'depart'; });
    try{ if(E.signesDepart.note && M.noter) M.noter(E.signesDepart.note, '📌'); }catch(e){ console.error(e); }
  }
  P.actions = M.actionsMax();
  P.chances = M.fxSomme('chance');
  if(M.role() === 'alchimiste'){
    var dep = (E.depart && E.depart.alchimiste) || {};
    if(window.Atelier){ if(!S.atelier) S.atelier = Atelier.etatNeuf(); else Atelier.donnerCartons(S.atelier, 1); }
    M.cle(dep.ingr || {}).forEach(function(k){ M.ajouterIngr(k, dep.ingr[k]); });
    S.fioles = Math.max(S.fioles, 3) + M.fxSomme('fiolesBonus');
    if(M.fxSomme('rareGratuit')){ var rares = M.cle(D.INGR).filter(function(k){ return D.INGR[k].rare; }); var rr = rares[Math.floor(Math.random() * rares.length)]; M.ajouterIngr(rr, 1); }
  }
  UI.ecran = 'enquete'; UI.modal = null; UI.saisie = []; UI.padSuite = false;
  M.sauver(); M.render(); window.scrollTo(0, 0);
  M.lireAuto(E.lettre);
}

/* ---------- Gestionnaire d'actions ---------- */
var A = {};
A['mj-reprendre'] = function(){ M.reprendreMJ(); };   /* ▶️ Reprendre un mini-jeu en pause (le rappel, la fenêtre) */
A['voix-telecharger'] = function(){
  var V = window.Voix; if(!V || !V.possible) return;
  var boite = document.getElementById('voix-prog'), barre = boite && boite.querySelector('progress'), mot = boite && boite.querySelector('small');
  if(boite) boite.hidden = false;
  document.querySelectorAll('[data-act="voix-telecharger"]').forEach(function(b){ b.disabled = true; });
  if(V.enCours) return V.enCours;
  V.avance = [0, ''];
  /* la barre suit même si l'écran est redessiné pendant le téléchargement (V.enCours, V.avance : M.voixHTML) ; jamais de lecture toute seule à la fin */
  return V.enCours = V.telecharger(function(f, t){
    V.avance = [f, t];
    var b2 = document.getElementById('voix-prog'), p2 = b2 && b2.querySelector('progress'), m2 = b2 && b2.querySelector('small');
    if(b2) b2.hidden = false; if(p2) p2.value = Math.round(f * 100); if(m2) m2.textContent = t;
  })
    .then(function(){ V.enCours = null; M.toast('Les voix sont prêtes ! Chaque personnage a maintenant sa voix.'); M.render(); return true; })
    .catch(function(e){ V.enCours = null; M.toast('Le téléchargement n\'a pas marché : ' + e.message + '. Vérifie le wifi et réessaie.'); M.render(); return false; });
};
A['voix-plus-tard'] = function(){ M.S.options.voixPlusTard = true; M.sauver(); M.render(); };
A['voix-oublier'] = function(){ if(window.Voix) Voix.oublier().then(function(){ M.render(); }); };
A.lire = function(el){ var x = UI.lectures[+el.dataset.i]; if(x && typeof x === 'object') M.lire(x.t, {qui:x.qui}); else M.lire(x); };
A.fermer = function(){ M.fermer(); };
/* Choisir un joueur (« Changer de joueur ») : s'il a une enquête en cours, on entre directement dedans, sur son premier onglet (Romain, 3 novembre) */
A.emplacement = function(el){
  M.choisirEmplacement(el.dataset.n);
  var P = M.S.e;
  if(P && !P.resolu && window.ENQUETES && ENQUETES[P.id]){ UI.ecran = 'enquete'; UI.pile = []; P.onglet = 'role'; UI.modal = null; }
  else UI.ecran = 'accueil';
  M.render(); window.scrollTo(0, 0);
};
A['emplacement-neuf'] = function(){
  var pris = M.emplacements().map(function(x){ return x.n; }), n = 1;
  while(pris.indexOf(n) >= 0) n++;
  M.choisirEmplacement(n); UI.ecran = 'accueil'; M.render();
};
A.creer = function(){ UI.crea = creaDefaut(null); UI.creaEtape = 1; UI.ecran = 'creation'; M.render(); };
A['crea-role'] = function(el){
  var r = el.dataset.r, c = UI.crea;
  if(window.Persos && !c.role){ var d = Persos.defaut(r, c.sexe || 'f'); M.cle(d).forEach(function(k){ if(k !== 'sexe') c[k] = d[k]; }); }
  c.role = r; M.son('clic');
  UI.creaEtape = 2; M.render(); window.scrollTo(0, 0);   /* toucher un rôle passe directement à l'étape suivante (Romain, 4 novembre) */
};
A['crea-opt'] = function(el){
  var c = UI.crea, k = el.dataset.k, v = el.dataset.v;
  c[k] = v;
  if(k === 'sexe' && window.Persos){
    var l = Persos.CHOIX.coiffure[v];
    if(!l.some(function(x){ return x.id === c.coiffure; })) c.coiffure = l[0].id;
    if(v === 'f' && Persos.CHOIX.barbe) c.barbe = Persos.CHOIX.barbe[0].id;
  }
  if(k === 'age' && v === 'enfant' && window.Persos && Persos.CHOIX.barbe) c.barbe = Persos.CHOIX.barbe[0].id;
  M.son('clic'); UI.garderDefilement = true; M.render();
};
A['crea-hasard'] = function(){ if(window.Persos) hasard(UI.crea); M.son('magie'); UI.garderDefilement = true; M.render(); };
A['crea-suite'] = function(){ if(UI.creaEtape === 1 && !UI.crea.role) return; UI.creaEtape++; M.render(); window.scrollTo(0, 0); };
A['crea-retour'] = function(){ if(UI.creaEtape > 1){ UI.creaEtape--; M.render(); } else { UI.ecran = 'accueil'; M.render(); } };
A['crea-nom'] = function(el){ var i = document.getElementById('nom'); if(i) i.value = el.dataset.n; UI.crea.nom = el.dataset.n; };
A['crea-fin'] = function(){
  var i = document.getElementById('nom'), nom = (i && i.value || '').trim();
  if(!nom){ M.toast('Écris ton prénom !'); if(i) i.focus(); return; }
  var c = UI.crea; c.nom = nom;
  if(c.joueur !== 'enfant') c.joueur = 'adulte';   /* qui joue ce héros : enfant ou adulte (étape 2 de la création) */
  var avant = M.S || {};
  M.S = M.etatNeuf(); M.S.heros = c;
  /* Après une défaite : on garde le Livre des Légendes et les réglages. L'atelier, lui, repart à neuf. */
  if(avant.legendes) M.S.legendes = avant.legendes;
  if(avant.options) M.S.options = avant.options;
  if(avant.ancien){ M.S.ancien = {heros:avant.ancien.heros}; }
  M.sauver(); M.son('victoire'); UI.ecran = 'accueil'; M.render();
  M.lireAuto('Bienvenue à Brumeval, ' + nom + ' !');
};
A.ecran = function(el){ if(M.aller) return M.aller(el.dataset.e); UI.modal = null; UI.saisie = []; UI.ecran = el.dataset.e; M.render(); window.scrollTo(0, 0); };   /* M.aller (heros.js) retient d'où l'on vient, pour « ← Retour » */
A.palier = function(el){ UI.boutiquePalier = +el.dataset.p; UI.garderDefilement = true; M.render(); };
A.acheter = function(el){
  var id = el.dataset.id, o = D.OBJETS[id], S = M.S;
  if(S.equip.indexOf(id) >= 0 || S.or < o.prix || M.niveau(S.xp).n < D.PALIER_NIVEAU[o.palier]) return;
  var avant = M.ensemblesComplets();
  S.or -= o.prix; S.equip.push(id); M.son('gain'); M.sauver();
  var apres = M.ensemblesComplets().filter(function(e){ return avant.indexOf(e) < 0; });
  UI.garderDefilement = true; M.render();
  if(apres.length){ var e = D.ENSEMBLES[apres[0]]; M.son('magie'); M.ouvrir({type:'info', ic:e.ic, titre:'Ensemble ' + e.nom + ' complet !', t:'Pouvoir secret débloqué : ' + e.bonus}); }
  else M.ouvrir({type:'info', ic:o.ic, titre:o.nom + ' : à toi !', t:o.d});
};
/* Revendre à tout moment, à moitié prix (arrondi en dessous) */
A.revendre = function(el){
  var id = el.dataset.id, o = D.OBJETS[id], S = M.S;
  if(!o || S.equip.indexOf(id) < 0) return;
  var prix = Math.floor(o.prix / 2);
  UI.confirmer = function(){
    var i = S.equip.indexOf(id); if(i < 0){ M.render(); return; }
    S.equip.splice(i, 1); S.or += prix; M.son('gain'); M.sauver(); UI.garderDefilement = true; M.render();
    M.toast('Vendu : +' + prix + ' pièces d\'or');
  };
  M.ouvrir({type:'confirmer', titre:'Revendre ' + o.nom + ' ?', t:'Tu gagnes ' + prix + ' pièces d\'or. ' + (o.ens ? 'Ton ensemble ne sera plus complet. ' : '') + 'Tu pourras le racheter plus tard, au prix plein.', oui:'Revendre 🪙 ' + prix});
};
A['choisir-talent'] = function(el){ M.ouvrir({type:'talent', palier:+el.dataset.p}); };
A.talent = function(el){
  var id = el.dataset.id; if(M.S.talents.indexOf(id) < 0) M.S.talents.push(id);
  M.son('magie'); UI.modal = null; M.sauver(); M.render();
  M.ouvrir({type:'info', ic:D.TALENTS[id].ic, titre:'Nouveau talent : ' + D.TALENTS[id].nom, t:D.TALENTS[id].d});
};
/* Réglages : qui joue ce héros (enfant / adulte) */
A.joueur = function(el){ if(!M.S.heros) return; M.S.heros.joueur = el.dataset.v === 'enfant' ? 'enfant' : 'adulte'; M.sauver(); M.son('clic'); UI.garderDefilement = true; M.render(); };
A.opt = function(el){ M.S.options[el.dataset.k] = el.checked; M.sauver(); if(el.dataset.k === 'lecture' && !el.checked) M.stop(); };
A['test-voix'] = function(){ M.lire('Bonjour ! Je suis la voix de Brumeval. Bonne enquête !'); };
/* (La « Sauvegarde de secours » copier / coller des Réglages est remplacée par 💾 Sauvegarder et 📂 Charger un fichier, dans le menu ☰ : heros.js) */
A['mode-test'] = function(el){
  var i = +el.dataset.i;
  UI.confirmer = function(){
    var S = M.S; S.prochaine = i; S.e = null;
    S.xp = Math.max(S.xp, D.SEUILS[i - 1] || 0); S.or = Math.max(S.or, i === 1 ? 0 : 120 * (i - 1));
    if(M.role() === 'alchimiste'){ M.ajouterIngr('miel', 2); M.ajouterIngr('eau', 2); }
    M.sauver(); UI.ecran = 'accueil'; M.render();
  };
  M.ouvrir({type:'confirmer', titre:'Mode test : enquête ' + i, t:'Ton héros passe au niveau ' + i + ' avec un peu d\'or pour la boutique, et l\'enquête ' + i + ' devient la prochaine. Pour tester, chaque joueur doit faire pareil.', oui:'D\'accord'});
};
/* (« Effacer ce héros » des Réglages : remplacé par « 🗑️ Supprimer le personnage » du menu ☰, qui passe par le Livre des Légendes) */
A['confirmer-oui'] = function(){ var f = UI.confirmer; UI.confirmer = null; UI.modal = null; if(f) f(); else M.render(); };
A['nouvelle-enquete'] = function(){ nouvelleEnquete(M.S.prochaine); };
A.reprendre = function(){ UI.ecran = 'enquete'; M.render(); window.scrollTo(0, 0); };
/* après la lettre « d'Odette » : l'écran des missions du maire (enquête 3, moteur-ecrans.js) */
A['lettre-suite'] = function(){ M.P().etape = 'missions'; M.stop(); M.son('page'); M.sauver(); M.render(); window.scrollTo(0, 0); };
A.commencer = function(){ M.P().etape = 'jeu'; M.P().onglet = 'role'; M.stop(); M.sauver(); M.render(); window.scrollTo(0, 0); };
A['relire-lettre'] = function(){ var E = M.E(); M.ouvrir({type:'info', ic:'✉️', titre:'La lettre du maire', t:E.lettre}); };
A.onglet = function(el){ M.P().onglet = el.dataset.o; UI.saisie = []; M.sauver(); M.render(); window.scrollTo(0, 0); };
A.lieu = function(el){
  var id = el.dataset.id, P = M.P(); if(!P || P.etape !== 'jeu') return;
  if(/^[LFB]\d$/.test(id)) return A.maison(el);
  P.vus['lieu:' + id + ':' + P.moment] = 1;
  if(M.compterOccupes) M.compterOccupes(id);   /* (enquête 3) un villageois occupé a deux petites phrases : la deuxième quand on revient */
  var bl = bulleDe(el);   /* touché sur la carte : une bulle sur la carte (avec ses pops à elle, plus le bruit de page), sans redessiner la page */
  if(!bl.bulle) M.son('page');
  M.ouvrir(Object.assign({type:'lieu', id:id, leger:true}, bl));
};
/* Une maison : on sait qui y habite (son visage est dessus, carte-jeu.js). Le Barde frappe tout de suite (sans points d'action,
   ou quand personne n'est là : il ne dépense rien) ; les autres rôles, et le Barde quand frapper coûte une action, ont la feuille de la maison. */
A.maison = function(el){
  var P = M.P(); if(!P || P.etape !== 'jeu') return;
  if(M.compterOccupes) M.compterOccupes(el.dataset.id);
  /* (enquête 3, E.ecouteMaisons) avec « Tendre l'oreille », quand il y a quelque chose à écouter derrière cette porte : la feuille de la
     maison, avec « Frapper » et « Écouter aux portes » (sinon l'écoute d'une maison ne se verrait jamais) */
  var ecoute = M.role() === 'barde' && (M.E() || {}).ecouteMaisons && M.porteBouton && M.porteBouton(el.dataset.id);
  if(M.role() === 'barde' && !ecoute && (M.sansActions() || !M.pnjIci(el.dataset.id).length)) return A.frapper(el);
  var bl = bulleDe(el);
  if(!bl.bulle) M.son('page');
  M.ouvrir(Object.assign({type:'maison', id:el.dataset.id, leger:true}, bl));
};
/* (« Qui habite ici ? » : plus d'habitants à noter sur la carte, Romain, 5 novembre, 00 h 14) */
A.explorer = function(el){
  var P = M.P(), gratuit = !!(M.fouilleGratuite && M.fouilleGratuite(el.dataset.id));   /* fouiller les sous-sols ne coûte rien au Pisteur (carte-jeu.js) */
  if(!M.peutAgir() && !gratuit) return;
  if(!gratuit) M.depenser();
  P.vus['explore:' + el.dataset.id] = P.moment;
  M.son('pas'); M.sauver(); M.ouvrir({type:'lieu', id:el.dataset.id});
};
A.point = function(el){
  var role = M.role(), l = el.dataset.l, id = el.dataset.id, P = M.P(), E = M.E();
  var p = M.pointsVisibles(l, role).filter(function(x){ return x.id === id; })[0];
  if(!p) return;
  var k = role + ':' + l + ':' + p.id;
  /* p.choix (enquête 2, au moulin la nuit) : la découverte finit sur un choix, les points proposés encore à voir (leur bouton : choixTxt) */
  function choix(){
    var v = M.pointsVisibles(l, role), c = (p.choix || []).map(function(id){ return v.filter(function(x){ return x.id === id && !P.vus[role + ':' + l + ':' + x.id]; })[0]; }).filter(Boolean);
    return c.length ? c.map(function(x){ return {l:l, id:x.id, t:x.choixTxt || x.nom}; }) : null;
  }
  if(P.vus[k] === 'ok'){ M.ouvrir({type:'decouverte', ic:p.ic, titre:p.nom, t:P.vus[k + ':partiel'] ? (p.rate || p.t) : p.t, retour:'lieu', retourId:l, choix:choix()}); return; }
  if(p.mj && M.ferme && M.ferme(k)){ M.ouvrir({type:'decouverte', ic:'🔒', titre:p.nom, t:M.texteEchec(p, M.MAX_ESSAIS), rate:true, retour:'lieu', retourId:l}); return; }   /* raté deux fois : fermé (essais.js) */
  if(P.vus['explore:' + l] !== P.moment) return;
  if(p.besoin && !M.besoinOk(p.besoin)){
    M.ouvrir({type:'besoin', ic:p.ic, titre:p.nom, t:p.alt || 'Tu ne peux pas encore faire ça.', besoin:p.besoin, retourId:l});
    return;
  }
  function reveler(){
    P.vus[k] = 'ok'; M.consommerBesoin(p.besoin);
    var code = null;
    if(p.obj){ P.objets[p.obj] = true; code = 'obj:' + p.obj; }
    if(p.donne){ code = p.donne; P.objets['_' + p.donne] = true; }
    if(p.or){ M.S.or += p.or; }
    M.sauver();
    M.decouvrir({ic:p.ic, titre:p.nom, t:p.t, note:p.note, code:code, retour:'lieu', retourId:l, choix:choix()});
  }
  if(p.mj){
    /* l'explication avant (p.avant, p.bouton) ; « Plus tard » ramène au lieu : rien n'est encore dépensé ; p.mjNiveauFixe : un niveau fixe (Silas, e2.js) */
    M.lancerMJ(p.mj, E.niveau + (p.mjNiveau || 0), p.params, {titre:p.nom, ic:p.ic, avant:p.avant, bouton:p.bouton, retour:'lieu', retourId:l,
      sansIntro:!!el.dataset.gratuit, niveauFixe:p.mjNiveauFixe || null, niveauMax:p.mjNiveauMax || null}, function(res){
      if(res.reussi) reveler();
      else { var n = M.echec ? M.echec(k) : 1; P.vus[k] = 'rate'; if(p.rateNote) M.noter(p.rateNote, p.ic);
        /* p.ouvrePartiel (enquête 2) : le dernier raté compte quand même (l'indice partiel), et le code est donné : on ne reste jamais bloqué */
        if(p.ouvrePartiel && n >= M.MAX_ESSAIS){ P.vus[k] = 'ok'; P.vus[k + ':partiel'] = 1; M.consommerBesoin(p.besoin); var cp = null;
          if(p.obj){ P.objets[p.obj] = true; cp = 'obj:' + p.obj; } if(p.donne){ cp = p.donne; P.objets['_' + p.donne] = true; } M.sauver();
          M.decouvrir({ic:'💨', titre:p.nom, t:p.rate || 'Raté…', rate:true, code:cp, retour:'lieu', retourId:l}); return; }
        M.sauver(); M.decouvrir({ic:'💨', titre:p.nom, t:M.texteEchec ? M.texteEchec(p, n, 'Raté…') : (p.rate || 'Raté…'), rate:true, retour:'lieu', retourId:l, reessai:n < M.MAX_ESSAIS ? {act:'point', l:l, id:p.id} : null}); }
    });
  } else reveler();
};
A.cueillir = function(el){
  var P = M.P(), S = M.S, l = el.dataset.id;
  var gratuit = !M.sansActions() && (P.usages.herboriste || 0) < M.fxSomme('cueilletteGratuite');
  if(M.sansActions() && P.vus['cueilli:' + l] === P.moment){ M.ouvrir({type:'info', ic:'🍃', titre:'Déjà cueilli', t:'Rien de plus ici pour ce moment.'}); return; }   /* un lieu ne donne qu'une chose par moment */
  if(!gratuit && !M.peutAgir()) return;
  if(gratuit) P.usages.herboriste = (P.usages.herboriste || 0) + 1; else M.depenser();
  P.vus['cueilli:' + l] = P.moment;
  var l2 = [], rates = [];
  P.notesIngr = P.notesIngr || {};
  var notes = P.notesIngr[l] = P.notesIngr[l] || [];
  M.cueilletteIci(l).forEach(function(x){
    var I = D.INGR[x.ingr];
    if(notes.indexOf(x.ingr) < 0) notes.push(x.ingr);
    if(!M.besoinOk(x.besoin)){ rates.push(I.nom.toLowerCase()); return; }
    var n = Math.max(x.min || 1, I.rare ? 1 : 1 + Math.floor(Math.random() * 3)) + M.fxSomme('cueilletteBonus');
    M.ajouterIngr(x.ingr, n); l2.push(n + ' × ' + I.ic + ' ' + I.nom.toLowerCase());
  });
  M.son(l2.length ? 'ok' : 'ko'); M.sauver();
  var t = l2.length ? 'Tu as trouvé : ' + l2.join(', ') + '. Va les ranger dans ton atelier !' : 'Tu cherches partout… mais rien d\'utile ne pousse ici en ce moment.';
  if(rates.length) t += ' Tu as aussi vu : ' + rates.join(', ') + ', mais tu n\'as pas pu les cueillir sans le bon matériel.';
  M.ouvrir({type:'info', ic:l2.length ? '🧺' : '🍂', titre:l2.length ? 'Belle cueillette !' : 'Rien trouvé…', t:t});
};
A.parler = function(el){
  var P = M.P(), id = el.dataset.id;
  if(P.conv[id] !== P.moment){ if(!M.peutAgir()) return; M.depenser(); P.conv[id] = P.moment; }
  M.son('clic'); M.sauver(); M.ouvrir({type:'conv', id:id, classe:'b-feuille-conv'});
};
A.revoir = function(el){ M.ouvrir({type:'revision', i:+el.dataset.i}); };
A.frapper = function(el){
  var P = M.P(), m = el.dataset.id, ici = M.pnjIci(m);
  /* personne à la maison : un petit message (« Odette n'est pas chez elle en ce moment. »), sans rien dépenser */
  if(!ici.length){ var hm = M.habitantMaison && M.habitantMaison(m), occ = hm && M.pnjOccupesIci && M.pnjOccupesIci(m).indexOf(hm) >= 0;
    M.son('porte'); M.ouvrir(Object.assign({type:'info', ic:'🚪', titre:occ ? 'Pas maintenant' : hm ? 'Pas à la maison' : 'Personne ne répond', t:M.texteAbsent ? M.texteAbsent(m) : 'Personne ne répond.', leger:true}, bulleDe(el))); return; }
  if(!M.peutAgir()) return;
  M.depenser(); M.son('porte');
  P.conv[ici[0]] = P.moment; M.sauver(); M.ouvrir({type:'conv', id:ici[0], classe:'b-feuille-conv'});
};
A.question = function(el){
  var P = M.P(), E = M.E(), id = el.dataset.p, i = +el.dataset.i, q = E.pnj[id].questions[i];
  P.vus['barde:' + id + ':' + i] = 'ok';
  M.noter(q.note, D.PNJ[id].ic);
  var code = null;
  if(q.obj){ P.objets[q.obj] = true; code = 'obj:' + q.obj; }
  if(q.donne){ P.objets['_' + q.donne] = true; code = q.donne; }
  M.son('clic'); M.sauver();
  if(code){ M.decouvrir({ic:D.PNJ[id].ic, titre:D.PNJ[id].court + ' te donne quelque chose', t:q.a, code:code, retour:'parler', retourId:id}); return; }
  UI.garderDefilement = true; M.render(); M.lireAuto(q.a);
};
A.demasquer = function(el){
  var P = M.P(), E = M.E(), id = el.dataset.p, Q = E.pnj[id].questions;
  var kd = 'demasque:' + id;   /* 2 essais au plus pour toute l'enquête (essais.js) */
  if(M.ferme && M.ferme(kd)){ M.toast(D.PNJ[id].court + ' ne se laissera plus piéger pendant cette enquête.'); return; }
  var rep = [];
  Q.forEach(function(q, i){ if(P.vus['barde:' + id + ':' + i] === 'ok') rep.push({texte:q.a, ment:!!q.ment && !P.vus['verite:' + id + ':' + i], i:i}); });
  /* Il en dit plus quand on le fait répéter : du vrai, et parfois de quoi embrouiller l'enquête */
  if(window.REPLIQUES) rep = REPLIQUES.completer(rep, id, E.id || 1);
  M.lancerMJ('mensonge', E.niveau, {pnj:id, ic:D.PNJ[id].ic, nom:D.PNJ[id].court, repliques:rep}, {titre:'Ce qu\'a dit ' + D.PNJ[id].court, ic:D.PNJ[id].ic}, function(res){
    if(res.reussi){
      Q.forEach(function(q, i){ if(q.ment && P.vus['barde:' + id + ':' + i] === 'ok' && !P.vus['verite:' + id + ':' + i]){ P.vus['verite:' + id + ':' + i] = 1; M.noter(q.noteVrai || (D.PNJ[id].court + ' a avoué : ' + q.vrai.replace(/[«»]/g, '').trim()), '🔍'); } });
      M.sauver(); M.ouvrir({type:'conv', id:id, classe:'b-feuille-conv'});
      M.toast('Démasqué ! ' + D.PNJ[id].court + ' dit enfin la vérité.');
    } else { var n = M.echec ? M.echec(kd) : 2; M.sauver(); M.ouvrir({type:'conv', id:id, classe:'b-feuille-conv'}); M.toast(n < M.MAX_ESSAIS ? 'Raté… Tu peux réessayer.' : D.PNJ[id].court + ' ne se laissera plus piéger pendant cette enquête.'); }
  });
};
A.forcer = function(el){
  var P = M.P(), E = M.E(), id = el.dataset.p, Q = E.pnj[id].questions, aveux = 0;
  if(M.fxSomme('verite') <= (P.usages.verite || 0)) return;
  P.usages.verite = (P.usages.verite || 0) + 1;
  Q.forEach(function(q, i){
    if(q.ment && P.vus['barde:' + id + ':' + i] === 'ok' && !P.vus['verite:' + id + ':' + i]){
      P.vus['verite:' + id + ':' + i] = 1; aveux++;
      M.noter(q.noteVrai || (D.PNJ[id].court + ' a avoué : ' + q.vrai.replace(/[«»]/g, '').trim()), '🔍');
    }
  });
  M.son('magie'); M.sauver(); UI.garderDefilement = true; M.render();
  M.toast(aveux ? D.PNJ[id].court + ' avoue tout !' : D.PNJ[id].court + ' jure qu\'il a dit la vérité… et tu le crois.');
};
A.ecouter = function(el){
  var P = M.P(), E = M.E(), x = (E.ecoutes || []).filter(function(e){ return e.id === el.dataset.id; })[0];
  var ke = (x ? x.role : 'barde') + ':ecoute:' + (x ? x.id : ''), gratuit = !!(x && x.mj && M.essaiGratuit && M.essaiGratuit(el, ke));   /* 2 essais au plus (essais.js) */
  if(!x || (!M.peutAgir() && !gratuit)) return;
  if(!gratuit){ M.depenser(); M.consommerBesoin(x.besoin); }
  P.vus['ecoute:' + x.id] = 1;
  function fini(ok){
    if(ok){ M.decouvrir({ic:'👂', titre:x.titre, t:x.t, note:x.note}); }
    else { if(x.noteRate) M.noter(x.noteRate, '👂');
      var n = M.echec ? M.echec(ke) : 2;
      if(n < M.MAX_ESSAIS) delete P.vus['ecoute:' + x.id];   /* encore un essai (l'enquête 1) : la scène reste là */
      M.sauver(); M.decouvrir({ic:'👂', titre:x.titre, t:M.texteEchec ? M.texteEchec(x, n, 'Tu as tout mélangé… Tu n\'as compris que des morceaux.') : (x.rate || 'Tu as tout mélangé…'), note:x.noteRate, rate:true, reessai:n < M.MAX_ESSAIS ? {act:'ecouter', id:x.id} : null}); }
  }
  if(x.mj) M.lancerMJ(x.mj, E.niveau, x.params, {titre:x.titre, avant:x.avant, bouton:x.bouton, sansIntro:gratuit}, function(res){ fini(res.reussi); });
  else fini(true);
};
A.bonus = function(el){
  var P = M.P(), E = M.E(), b = E.bonus.filter(function(x){ return x.id === el.dataset.id; })[0];
  if(!b || !M.peutAgir() || P.bonus[b.id]) return;
  M.depenser(); M.sauver();
  /* l'enquête 1 (le tutoriel) : une mission bonus se retente autant qu'on veut (Romain, 5 novembre, 16 h 32 : une exception, pour s'entraîner) */
  var infini = !!(M.essaisInfinis && M.essaisInfinis());
  M.lancerMJ(b.mj, E.niveau, b.params, {titre:b.titre, avant:b.avant || b.t, bouton:b.bouton, essaiUnique:!infini, reessaisInfinis:infini, sansPotion:false}, function(res){
    if(!res.reussi && infini){
      M.sauver();
      M.ouvrir({type:'info', ic:'💨', titre:'Mission ratée… pour cette fois', t:'Ici, pour t\'entraîner, tu peux la retenter quand tu veux : reviens toucher « Tenter » !'});
      return;
    }
    P.bonus[b.id] = res.reussi ? 'ok' : 'ko';
    if(res.reussi && res.note) M.noter(res.note, '🧩');
    if(res.ragots){
      M.noter('Ragots de la taverne : ' + (res.erreurs ? 'tu t\'es trompé ' + (res.erreurs === 1 ? 'sur un ragot' : res.erreurs + ' fois') + '. Lesquels ? Relis-les dans « À relire ».' : 'tu as eu le nez fin, tous bien jugés ! Ils sont dans « À relire ».'), '🍺');
    }
    var gainB = M.orBonus(b);   /* (1 à 5 pièces, Romain, 11 novembre) */
    if(res.reussi){ M.S.or += gainB; M.son('gain'); }
    M.sauver();
    M.ouvrir({type:'info', ic:res.reussi ? '🪙' : '💨', titre:res.reussi ? 'Mission réussie : +' + gainB + (gainB > 1 ? ' pièces' : ' pièce') + ' d\'or !' : 'Mission ratée', t:res.reussi ? 'Bravo ! L\'or est dans ta bourse.' : 'Dommage… Cette mission ne se rejoue pas.'});
  });
};
/* Le texte d'une analyse : An.variantes [{si:[conditions], t, note}], la première qui convient, sinon An.t
   (ex. : la poudre du pot noir, enquête 2 : avant et après le rassemblement). Relu à chaque fois : la table d'analyse suit l'enquête. */
M.texteAnalyse = function(An){
  var v = An && (An.variantes || []).filter(function(x){ return M.besoinOk(x.si); })[0];
  return v ? Object.assign({}, An, {t:v.t || An.t, note:v.note || An.note, donne:v.donne || An.donne}) : An;   /* (une variante peut donner son code : les pièces jumelles) */
};
A.analyser = function(el){
  var P = M.P(), E = M.E(), id = el.dataset.id, An = M.texteAnalyse((E.analyses || {})[id]);
  var ka = 'alchimiste:analyse:' + id, gratuit = !!(An && An.mj && M.essaiGratuit && M.essaiGratuit(el, ka));   /* 2 essais au plus (essais.js) */
  if(An && An.mj && !P.analyses[id] && M.ferme && M.ferme(ka)){ M.ouvrir({type:'info', ic:'🔒', titre:'Analyse : ' + E.objets[id].nom, t:M.texteEchec(An, M.MAX_ESSAIS)}); return; }
  if(!An || (!M.peutAgir() && !gratuit) || P.analyses[id]) return;
  /* Certaines analyses demandent un outil (ex. : teintures pour reproduire une couleur) */
  if(An.besoin && !M.besoinOk(An.besoin)){ M.ouvrir({type:'info', ic:'🔒', titre:'Il te manque quelque chose', t:An.alt || 'Tu ne peux pas encore faire cette analyse.'}); return; }
  if(!gratuit) M.depenser();
  function fini(){
    var detail = false;
    if(An.detail && M.acces('detail')){
      var max = M.fxSomme('detail');
      if((P.usages.detail || 0) < max){ P.usages.detail = (P.usages.detail || 0) + 1; detail = true; }
    }
    P.analyses[id] = detail ? 2 : 1;
    if(detail) M.noter(An.detail.note, '🔍');
    M.sauver();
    M.decouvrir({ic:E.objets[id].ic, titre:'Analyse : ' + E.objets[id].nom, t:An.t + (detail ? ' Et ce n\'est pas tout : ' + An.detail.t : ''), note:An.note, code:An.donne || null});
  }
  if(An.mj) M.lancerMJ(An.mj, E.niveau, An.params, {titre:'Analyse : ' + E.objets[id].nom, ic:E.objets[id].ic, avant:An.avant, bouton:An.bouton, sansIntro:gratuit}, function(res){
    if(res.reussi) fini();
    else { var n = M.echec ? M.echec(ka) : 1; if(An.rateNote) M.noter(An.rateNote, '💨'); M.sauver(); M.decouvrir({ic:'💨', titre:'Analyse ratée', t:M.texteEchec ? M.texteEchec(An, n, 'Tu n\'as rien trouvé cette fois.') : (An.rate || 'Tu n\'as rien trouvé cette fois.'), rate:true, reessai:n < M.MAX_ESSAIS ? {act:'analyser', id:id} : null}); }
  });
  else fini();
};
A.fabriquer = function(el){ M.ouvrir({type:'chaudron', recette:el.dataset.id, seq:[]}); };
A.verser = function(el){ var m = UI.modal; m.seq.push(el.dataset.id); M.son('plouf'); M.render(); };
A.vider = function(){ UI.modal.seq = []; M.render(); };
A.cuire = function(){ cuire(UI.modal); };
A['donner-potion'] = function(el){ var p = D.POTIONS[el.dataset.id]; M.ouvrir({type:'code', code:'pot:' + el.dataset.id, titre:p.nom, suite:'potion-donnee', suiteId:el.dataset.id, suiteTxt:'C\'est donné !'}); };
A['potion-donnee'] = function(el){ var S = M.S; if(S.potions[el.dataset.id] > 0) S.potions[el.dataset.id]--; if(M.missionDonne) M.missionDonne('pot:' + el.dataset.id); M.son('ok'); M.fermer(); };
A.vendre = function(el){
  var S = M.S, P = M.P(), id = el.dataset.id;
  if(!(S.potions[id] > 0) || (P.usages.etal || 0) >= 2) return;
  S.potions[id]--; P.usages.etal = (P.usages.etal || 0) + 1; var gain = 10; S.or += gain;
  M.son('gain'); M.sauver(); M.render(); M.toast('Vendue au marché : +' + gain + ' pièces d\'or');
};
A.boire = function(el){
  var P = M.P(), id = el.dataset.id;
  if(!(P.potions[id] > 0)) return;
  if(D.POTIONS[id] && D.POTIONS[id].fx && D.POTIONS[id].fx.coeur){ M.ouvrir({type:'info', ic:D.POTIONS[id].ic, titre:'À boire pendant l\'accusation', t:'Cet élixir se boit sur l\'écran d\'accusation ⚖️, quand le Sage a perdu un cœur. Il te le rend.'}); return; }
  P.potions[id]--; P.bues[id] = P.moment; M.son('magie'); M.sauver();
  if(UI.modal && UI.modal.type === 'besoin') UI.modal = {type:'lieu', id:UI.modal.retourId};
  M.render(); M.toast(D.POTIONS[id].nom + ' : effet pour tout ce moment !');
};
A['mj-potion'] = function(el){
  var s = UI.suiteMJ; UI.suiteMJ = null; UI.modal = null; M.render();
  var o = Object.assign({}, s.options, {potionChoisie:true, potion:el.dataset.id || null});
  M.lancerMJ(s.type, s.niveau, s.extra, o, s.fin);
};
A['mj-go'] = function(){   /* le bouton jaune de l'explication (avantMJHTML) */
  var s = UI.suiteMJ; UI.suiteMJ = null; UI.modal = null; M.render();
  if(s) M.lancerMJ(s.type, s.niveau, s.extra, s.options, s.fin);
};
A['mj-auto'] = function(el){
  var s = UI.suiteMJ; UI.suiteMJ = null; UI.modal = null; M.render();
  if(el.dataset.oui){ var P = M.P(); P.usages[s.auto.cle] = (P.usages[s.auto.cle] || 0) + 1; M.son('magie'); M.sauver(); s.fin({reussi:true, score:1, essais:1}); }
  else M.lancerMJ(s.type, s.niveau, s.extra, s.options, s.fin);
};
A.page = function(el){
  UI.page = el.dataset.id;
  var P = M.P(), p = (M.E().pages || []).filter(function(x){ return x.id === el.dataset.id; })[0];
  if(P) P.vus['page:' + el.dataset.id] = 1; /* page du Grand Livre ouverte (missions) */
  if(p && p.donne && !p.besoin && !p.action && !p.mj){ P.objets['_' + p.donne] = true; M.sauver(); }
  M.son('page'); M.render();
};
A['ouvrir-page'] = function(el){
  var P = M.P(), E = M.E(), p = E.pages.filter(function(x){ return x.id === el.dataset.id; })[0];
  if(!p || P.pages[p.id]) return;
  if(p.besoin && !M.besoinOk(p.besoin)) return;
  if(p.moments && !M.momentOk(p.moments)) return;   /* une page d'un moment seulement (le rassemblement, la nuit : e2.js) */
  var kp = 'sage:page:' + p.id, gratuit = !!(p.mj && M.essaiGratuit && M.essaiGratuit(el, kp));   /* 2 essais au plus (essais.js) */
  if(p.mj && M.ferme && M.ferme(kp)){ M.ouvrir({type:'info', ic:'🔒', titre:p.titre, t:M.texteEchec(p, M.MAX_ESSAIS)}); return; }
  if(p.action && !gratuit){ if(!M.peutAgir()) return; M.depenser(); }
  function ouvrir(){
    P.pages[p.id] = true; M.consommerBesoin(p.besoin);
    if(p.donne) P.objets['_' + p.donne] = true;
    M.sauver();
    M.decouvrir({ic:p.ic, illu:p.illu || null, titre:p.titre, t:p.t, note:p.note, code:p.donne || null});   /* illu : une petite scène animée (regles.js) */
  }
  if(p.mj) M.lancerMJ(p.mj, E.niveau, p.params, {titre:p.titre, ic:p.ic, avant:p.avant, bouton:p.bouton ? (p.boutonIc || '') + p.bouton : null, sansIntro:gratuit || !!p.avant}, function(res){   /* p.avant : la page du Grand Livre explique déjà, avec son bouton jaune (livre.js) */
    if(res.reussi) ouvrir();
    else { var n = M.echec ? M.echec(kp) : 1; if(p.rateNote) M.noter(p.rateNote, p.ic);
      /* p.ouvrePartiel (la page blanche du tutoriel, enquête 1) : le dernier raté ouvre quand même la page, à moitié effacée, avec son code (l'indice partiel suffit) */
      if(p.ouvrePartiel && n >= M.MAX_ESSAIS){ P.pages[p.id] = 'partiel'; M.consommerBesoin(p.besoin); if(p.donne) P.objets['_' + p.donne] = true; M.sauver();
        M.decouvrir({ic:'💨', titre:p.titre, t:(p.rate || 'Raté…') + ' ' + (p.tPartiel || ''), code:p.donne || null, rate:true}); return; }
      M.sauver(); M.decouvrir({ic:'💨', titre:p.titre, t:M.texteEchec ? M.texteEchec(p, n, 'Pas cette fois…') : (p.rate || 'Pas cette fois…'), rate:true, reessai:n < M.MAX_ESSAIS ? {act:'ouvrir-page', id:p.id} : null}); }
  });
  else ouvrir();
};
A.sym = function(el){ if(UI.saisie.length >= 3) return; UI.saisie.push(el.dataset.s); M.son('tic'); if(UI.saisie.length === 3){ M.render(); setTimeout(validerCode, 250); } else M.render(); };
A['sym-efface'] = function(){ UI.saisie.pop(); M.render(); };
A.rayer = function(el){ var P = M.P(), id = el.dataset.id, i = P.raye.indexOf(id); if(i >= 0) P.raye.splice(i, 1); else P.raye.push(id); M.son('clic'); M.sauver(); UI.garderDefilement = true; M.render(); };
A['moment-suivant'] = function(){ M.ouvrir({type:'moment'}); };
A['passer-moment'] = function(){ passerMoment(M.P().moment + 1); };
A.accuser = function(){ M.ouvrir({type:'accusation', etape:'qui', choix:{}}); };
/* Enquête 3 : la quatrième question, « QUI est le Corbeau ? » (corbeauModal) */
A['corbeau-choix'] = function(el){
  var P = M.P(), E = M.E(); if(!P || !E || !E.corbeau) return;
  P.corbeau = el.dataset.v; M.sauver();
  M.son(P.corbeau === E.corbeau.solution ? 'magie' : 'page');
  M.ouvrir({type:'victoire', n:+el.dataset.n || 0, fixe:true, corbeau:P.corbeau});
};
A['acc-choix'] = function(el){
  var m = UI.modal; m.choix[el.dataset.k] = el.dataset.v; M.son('clic');
  var d = dims(), i = d.indexOf(el.dataset.k);
  m.etape = i < d.length - 1 ? d[i + 1] : 'confirmer';
  M.render();
};
A['acc-retour'] = function(){ UI.modal.etape = 'qui'; M.render(); };
A['acc-valider'] = function(){ validerAccusation(UI.modal); };
A.stratege = function(){
  var P = M.P(), E = M.E();
  var innocents = E.qui.choix.filter(function(id){ return id !== E.solution.qui && P.raye.indexOf(id) < 0; });
  innocents.sort(function(){ return Math.random() - .5; }).slice(0, 2).forEach(function(id){ P.raye.push(id); });
  P.usages.stratege = 1; M.son('magie'); M.sauver(); M.render();
};
A['fin-sage'] = function(el){ commencerFin(+el.dataset.n); };
A['fin-suite'] = function(){
  var P = M.P(), E = M.E();
  if(!P || !E || !P.fin){ UI.ecran = 'accueil'; M.render(); return; }
  if(P.fin.slide < E.fin.slides.length - 1){ P.fin.slide++; M.sauver(); M.render(); M.lireAuto(E.fin.slides[P.fin.slide]); }
  else { P.fin.etape = 'recompenses'; UI.padSuite = false; M.son('gain'); M.sauver(); M.render(); window.scrollTo(0, 0); }
};
/* Pendant l'histoire de fin : le Sage a déjà donné le code de l'enquête suivante ? On peut le taper tout de suite. */
A['pad-suite'] = function(){ UI.padSuite = !UI.padSuite; UI.saisie = []; M.son('clic'); UI.garderDefilement = true; M.render(); };
A['fin-retour'] = function(){ M.archiver(); M.S.e = null; UI.ecran = 'accueil'; UI.saisie = []; UI.padSuite = false; M.sauver(); M.render(); window.scrollTo(0, 0); };
A.journal = function(el){ UI.journalE = {p:M.P().id, e:+el.dataset.e}; M.son('page'); UI.garderDefilement = true; M.render(); };
A['suite-sage'] = function(){ var F = M.P() && M.P().fin; enqueteSuivante(F ? Math.min(F.erreurs || 0, 3) : 0); };
A.calepin = function(){ M.ouvrir({type:'calepin'}); };
/* A.aide, A['menu-enquete'], A['changer-joueur'] : des pages du menu ☰ (heros.js) */
A['sous-atelier'] = function(el){ UI.sousAtelier = el.dataset.v; M.son('clic'); M.render(); };
A['noter-ingr'] = function(el){ var m = UI.modal; if(m && m.type === 'lieu'){ m.noterIngr = !m.noterIngr; M.render(); } };
A['basculer-ingr'] = function(el){
  var P = M.P(), l = el.dataset.l, i = el.dataset.id;
  P.notesIngr = P.notesIngr || {}; var n = P.notesIngr[l] = P.notesIngr[l] || [];
  var k = n.indexOf(i); if(k >= 0) n.splice(k, 1); else n.push(i);
  M.son('clic'); M.sauver(); M.render();
};
A.inspiration = function(){ A.reserve(); };
/* Réserve du Sage : un code valable pour un seul rôle et une seule fois */
function reserveModal(){
  var P = M.P(), r = M.reserve(), dons = P.dons || {};
  var t = 'Ta réserve : ' + r + ' action' + (r > 1 ? 's' : '') + ' pour toute l\'enquête. Tu peux en donner une seule par équipier à chaque moment. À qui la donner ? Parlez-en ensemble !';
  return '<div class="b-info-modal"><div class="b-grand-ic">💡</div><h2>Donner une action</h2><p>' + esc(t) + '</p>' + lire(t) +
    '<div class="b-reserve-roles">' + ['pisteur', 'alchimiste', 'barde'].map(function(role){
      var R = D.ROLES[role], deja = dons[role] === P.moment;
      return '<button class="btn' + (deja ? ' second' : '') + '" data-act="don-action" data-r="' + role + '"' + (r > 0 && !deja ? '' : ' disabled') + '>' + R.ic + ' ' + R.m + (deja ? ' ✔' : '') + '</button>';
    }).join('') + '</div>' + (r <= 0 ? '<p class="doux">La réserve est vide. ' + lire('La réserve est vide.') + '</p>' : '') + '<button class="btn second" data-act="fermer">Fermer</button></div>';
}
A.reserve = function(){ if(M.sansActions()) return; M.ouvrir({type:'reserve'}); };   /* sans points d'action : pas de réserve du Sage */
A['don-action'] = function(el){
  var P = M.P(), role = el.dataset.r; P.dons = P.dons || {n:0};
  if(M.sansActions() || M.reserve() <= 0 || P.dons[role] === P.moment || !D.ROLES[role]) return;
  P.dons.n = (P.dons.n || 0) + 1; P.dons[role] = P.moment;
  var code = 'aide:' + role + ':' + Math.min(P.dons.n, 6);
  M.son('magie'); M.sauver();
  M.ouvrir({type:'code', code:code, titre:'Une action pour ' + D.ROLES[role].le, suite:'don-donne', suiteTxt:'C\'est donné !'});
};
A['don-donne'] = function(){ M.son('ok'); M.fermer(); };
/* (« Abandonner l'enquête » : remplacé par « 🗑️ Supprimer le personnage » du menu ☰, heros.js) */
A.elixir = function(el){
  var P = M.P(), id = el.dataset.id;
  if(!P || !(P.potions[id] > 0) || P.usages.elixir || M.coeurs() >= M.COEURS) return;
  P.potions[id]--; P.usages.elixir = 1; P.coeursBonus = (P.coeursBonus || 0) + ((D.POTIONS[id].fx && D.POTIONS[id].fx.coeur) || 1);
  M.son('magie'); M.sauver(); UI.garderDefilement = true; M.render(); M.toast('❤️ Un cœur de plus !');
};
A['defaite-suite'] = function(){ var P = M.P(); if(P && P.defaite){ P.defaite.slide++; M.sauver(); M.render(); window.scrollTo(0, 0); } };
A['defaite-fin'] = function(){ M.recommencer(); };
A['crea-meme'] = function(){
  var a = M.S.ancien && M.S.ancien.heros; if(!a) return;
  UI.crea = M.copie(a); UI.creaEtape = 3; M.son('magie'); M.render(); window.scrollTo(0, 0);
};

/* ---------- Démarrage ---------- */
function demarrer(){
  var em = M.emplacement();
  if(!em && !M.emplacements().length){ M.choisirEmplacement(1); em = '1'; }
  M.S = em ? M.charger(em) : M.etatNeuf();
  document.addEventListener('click', function(ev){
    var el = ev.target.closest('[data-act]');
    /* un toucher dans le vide de la carte ferme sa bulle (après un glisser, la carte ne laisse pas passer le clic : carte.js) */
    if((!el || !el.dataset.act) && UI.modal && UI.modal.bulle && ev.target.closest && ev.target.closest('#carte-ici') && !ev.target.closest('#voile, .ca-zoom')){ M.fermer(); return; }
    if(!el || !el.dataset.act) return;
    if(el.tagName === 'INPUT') return;
    var f = A[el.dataset.act];
    /* un mini-jeu en pause : on regarde, on tape un code… mais rien ne fait avancer l'enquête avant de l'avoir fini */
    if(f && M.mjPause && !LIBRE_EN_PAUSE[el.dataset.act]){ ev.preventDefault(); M.rappelPause(); return; }
    /* UI.actEnCours : l'action qui lance peut-être un mini-jeu (M.lancerMJ la retient : quitter le jeu pendant ce mini-jeu le fait compter comme raté) */
    if(f){ ev.preventDefault(); UI.actEnCours = {act:el.dataset.act, ds:Object.assign({}, el.dataset)};
      try{ audioReveil(); f(el); }catch(e){ console.error(e); M.toast('Oups : ' + e.message); }
      UI.actEnCours = null; }
  });
  document.addEventListener('change', function(ev){
    var el = ev.target;
    if(el.id === 'import' && el.files && el.files[0]){
      var fichier = el.files[0]; el.value = '';
      if(M.chargerFichier) M.chargerFichier(fichier);   /* 📂 Charger : vérifier le fichier, puis demander avant de remplacer (heros.js) */
    } else if(el.dataset && el.dataset.act === 'opt') A.opt(el);
  });
  document.addEventListener('input', function(ev){ if(ev.target.id === 'nom' && UI.crea) UI.crea.nom = ev.target.value; });
  document.getElementById('stop-voix').addEventListener('click', function(){ M.stop(); });
  if(M.S.heros && M.S.e && !M.S.e.resolu) UI.ecran = 'accueil';
  /* des objets retirés de la boutique (M.reparerBoutique, moteur-base.js) : Fortuné rend l'or, une seule fois */
  var rb = (M.S.rembourse && M.S.heros) ? +M.S.rembourse.or || 0 : 0;
  if(M.S.rembourse){ delete M.S.rembourse; M.sauver(); }
  M.render();
  if(rb > 0) M.ouvrir({type:'info', ic:'👛', titre:'Fortuné te rend ton or',
    t:'Fortuné a repris certains objets de sa boutique : ils ne servaient à rien pour l\'instant. Il te rend ' + rb + ' pièces d\'or. À toi de choisir autre chose !'});
  try{ M.rateQuitte(); }catch(e){ console.error(e); }   /* un mini-jeu laissé ouvert quand on a quitté : raté */
  /* le service worker : la version GitHub, et un serveur local pour les essais (Jouer sans internet, heros.js) */
  if('serviceWorker' in navigator && ((location.protocol === 'https:' && /github\.io$/.test(location.hostname)) || /^(localhost|127\.0\.0\.1)$/.test(location.hostname))){
    navigator.serviceWorker.register('sw.js').catch(function(){});
  }
  /* Protéger les sauvegardes de la tablette : demander une seule fois par lancement, si ce n'est pas déjà accordé */
  try{
    var st = navigator.storage;
    if(st && st.persist){
      if(st.persisted) st.persisted().then(function(ok){ if(!ok) return st.persist(); }).catch(function(){});
      else st.persist();
    }
  }catch(e){}
}
var reveille = false;
function audioReveil(){ if(reveille) return; reveille = true; M.son('tic'); }
M.A = A;
if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', demarrer); else demarrer();
})();
