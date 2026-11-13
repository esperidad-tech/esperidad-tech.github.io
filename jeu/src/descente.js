/* ==========================================================
   Brumeval — la descente dans le donjon (enquête 3, étape 6 : le branchement ; Bible §13.14, E3-actions-des-roles.md §1).

   Le donjon est un jeu à part (jeu/donjon/, en ligne dans brumeval/donjon/) : trois pages, une par tablette —
   index.html (le Pisteur : tout s'y joue, les trois héros en file), sage.html (le plan des souterrains, le carnet de l'aventurier,
   les pages de sauvegarde), alchimiste.html (le chaudron du donjon). Ici, on y va et on en revient :
   · E.donjon = {pages:{pisteur, sage, alchimiste}} (e3.js) : l'enquête a un donjon.
   · Le Pisteur : un point « descente » (la crypte, ou le puits une fois la grille rongée à l'acide) ouvre la fenêtre de la descente.
     Il lui faut le sac de l'Alchimiste (P.sac : plantes.js, le code du sac). Le bouton jaune l'emmène dans le donjon, avec ses potions.
   · Le Sage : la page « Le plan des souterrains » de son Grand Livre, la nuit ; l'Alchimiste : « Le chaudron du donjon », dans son sac.
   · Chaque descente a son jeton (P.donjonJeton) : la page du donjon recommence une partie neuve quand le jeton est nouveau, et
     l'enquête ne croit que ce qui porte son jeton (une vieille partie d'essai du donjon, restée dans la tablette, ne compte pas).
   · Au retour (les pages du donjon gardent leur partie dans la tablette, on la relit) :
       le Pisteur — la porte aux quatre signes est trouvée : il garde le code « Odette est derrière la porte » pour le Sage ;
                    le donjon est fini : « Léo attrapé », ou « Léo s'est enfui » (le maire n'a pas été retenu), pour le Barde ;
       le Sage — il a tapé le code de la porte sur son plan : l'enquête le reçoit toute seule (pas besoin de le taper deux fois).
   · Les codes qui passent de l'enquête au donjon (« La Grosse Marie », « Le maire est retenu » : le Barde les donne, le Pisteur les
     tape DANS le donjon) et du donjon à l'enquête (la porte, Léo) ont les mêmes symboles des deux côtés : codes-fixes.js (enquête 3)
     et jeu/donjon/donjon-codes.js. Tapé dans l'enquête, un code qui sert dans le donjon dit où le taper.
   Chargé APRÈS plantes.js.
   ========================================================== */
(function(){
'use strict';
var M = window.M, D = window.DONNEES;
if(!M) return;
var esc = M.esc, A = M.A;
var CLE_PISTEUR = 'brumeval-donjon-partie', CLE_SAGE = 'brumeval-donjon-sage', CLE_JETON = 'brumeval-donjon-jeton:', CLE_RETOUR = 'brumeval-donjon-retour';
var CLE_DEPART = 'brumeval-donjon-depart';   /* par jeton : d'où on est parti (l'adresse du jeu portait-elle « #test » ?) */
function enquete(){ try{ return M.S && M.S.e ? M.E() : null; }catch(e){ return null; } }
function cfg(){ var E = enquete(); return (E && E.donjon) || null; }
function lu(cle){ try{ return localStorage.getItem(cle); }catch(e){ return null; } }
function json(cle){ try{ var t = lu(cle); return t ? JSON.parse(t) : null; }catch(e){ return null; } }
function lire(t){ return M.lireBtn(t); }
function nuit(){ var E = enquete(), P = M.P(); return !!(E && P && E.moments[Math.min(P.moment, E.moments.length - 1)] === 'nuit'); }
M.donjonDispo = function(){ return !!(cfg() && M.P && M.P()); };
function jeton(){
  var P = M.P();
  if(!P.donjonJeton) P.donjonJeton = 'e' + P.id + '-' + Date.now().toString(36) + '-' + Math.floor(Math.random() * 1e6).toString(36);
  return P.donjonJeton;
}
/* l'adresse de la page du donjon de ce rôle, avec le jeton de cette descente (et, pour le Pisteur, le sac et l'entrée) */
M.donjonAdresse = function(){
  var C = cfg(), P = M.P(), role = M.role(), base = C && C.pages && C.pages[role];
  if(!base || !P) return null;
  var q = ['enquete=' + P.id, 'jeton=' + encodeURIComponent(jeton())];
  if(role === 'pisteur'){
    if(P.sac && P.sac.length) q.push('potions=' + P.sac.join(','));
    if(P.vus['donjon:entree']) q.push('entree=' + P.vus['donjon:entree']);
  }
  return base + '?' + q.join('&');
};
/* on y va (le bouton jaune) */
A['ds-aller'] = function(){
  var P = M.P(), role = M.role(), u = M.donjonAdresse();
  if(!u) return;
  if(role === 'pisteur'){ if(!(P.sac && P.sac.length)) return; P.vus['donjon:parti'] = 1; }
  P.vus['donjon:ouvert:' + role] = 1;
  M.sauver(); if(M.stop) M.stop(); M.son('pas');
  /* (les robots d'essai n'ont pas le donjon à côté d'eux : ils notent seulement où on allait) */
  if(window.BRUMEVAL_SANS_DONJON){ window.__donjonVers = u; M.UI.modal = null; M.render(); return; }
  /* on retient qu'on est parti de l'enquête : en remontant, on revient DANS l'enquête, pas sur la place du village (revenir, plus bas) */
  try{ sessionStorage.setItem(CLE_RETOUR, P.donjonJeton); }catch(e){}
  noterDepart(P.donjonJeton);
  M.UI.modal = null;
  window.location.href = u;
};
A['ds-code'] = function(){ var P = M.P(); M.UI.modal = null; P.onglet = 'code'; M.UI.saisie = []; M.sauver(); M.render(); window.scrollTo(0, 0); };

/* ---------- Le Pisteur : la fenêtre de la descente ---------- */
function fioles(l){ return M.sacFiolesHTML ? M.sacFiolesHTML(l) : ''; }
function codeDonne(id){
  var n = M.nomCode(id), dit = M.direCode ? M.direCode(id) : null, t = dit || n.nom;
  return '<div class="b-donne"><p>' + n.ic + ' ' + esc(t) + ' ' + lire(t) + '</p>' + M.codeHTML(M.code(id), true) + '</div>';
}
M.descenteHTML = function(m){
  var P = M.P(), sac = P.sac || [], t, s = '<div class="b-info-modal ds-fenetre">';
  if(m.vue === 'fin' || P.vus['donjon:fini']){
    var enfui = P.vus['donjon:leo'] === 'enfui';
    t = enfui ? 'Vous voilà remontés du donjon ! Tout au fond, Léo était là, avec sa lanterne… Mais des pas ont descendu l\'escalier, et il a filé dans le noir.'
      : 'Vous voilà remontés du donjon ! Tout au fond, vous avez coincé Léo, le garçon du moulin, avec sa lanterne et son panier.';
    s += '<div class="b-grand-ic">🕯️</div><h2>Le donjon est fini</h2><p>' + esc(t) + '</p>' + lire(t);
    if(P.vus['donjon:porte']) s += codeDonne('info:odette_porte');
    s += codeDonne(enfui ? 'info:leo_enfui' : 'info:leo_attrape');
    return s + '<button class="btn" data-act="fermer">D\'accord</button></div>';
  }
  if(!sac.length){
    t = 'Un escalier de pierre s\'enfonce dans le noir… Pas si vite ! Là-dessous, il te faut les potions de l\'Alchimiste. Demande-lui le code de son sac : il est sur son établi. Puis tape-le ici, dans ton onglet Code.';
    return s + '<div class="b-grand-ic">🎒</div><h2>Il te manque le sac</h2><p>' + esc(t) + '</p>' + lire(t) +
      '<button class="btn grand b-aller" data-act="ds-code">🔢 Taper le code du sac</button><button class="btn second" data-act="fermer">Plus tard</button></div>';
  }
  var n = sac.length, deja = !!P.vus['donjon:parti'];
  t = deja ? 'Le donjon t\'attend, là où tu l\'as laissé. Les trois héros descendent ensemble, sur ta tablette.'
    : 'Le sac de l\'Alchimiste sur le dos : ' + n + ' potion' + (n > 1 ? 's' : '') + '. Les trois héros descendent ensemble, sur ta tablette. Le Sage ouvre son plan : il voit le chemin, toi tu ne vois que la brume. L\'Alchimiste garde son chaudron.';
  return s + '<div class="b-grand-ic">🕯️</div><h2>' + (deja ? 'Retourner dans le donjon' : 'Descendre dans le donjon') + '</h2>' + fioles(sac) + '<p>' + esc(t) + '</p>' + lire(t) +
    '<button class="btn grand b-aller" data-act="ds-aller">🕯️ ' + (deja ? 'Y retourner' : 'Descendre') + '</button><button class="btn second" data-act="fermer">Pas tout de suite</button></div>';
};
/* un point « descente » (p.descente : 'crypte' ou 'puits') n'est pas une découverte : il ouvre la fenêtre de la descente */
if(A.point){
  var point0 = A.point;
  A.point = function(el){
    var P = M.P(), E = enquete(), role = M.role(), l = el && el.dataset ? el.dataset.l : null, id = el && el.dataset ? el.dataset.id : null;
    var R = E && E.donjon && E.lieux && E.lieux[l] && E.lieux[l][role], p = R && (R.points || []).filter(function(x){ return x.id === id; })[0];
    if(p && p.descente && M.pointsVisibles(l, role).some(function(x){ return x.id === id; })){
      P.vus['explore:' + l] = P.moment; P.vus[role + ':' + l + ':' + id] = 'ok'; P.vus['donjon:entree'] = p.descente;
      M.son('page'); M.sauver();
      M.ouvrir({type:'descente', retourId:l});
      return;
    }
    return point0.apply(this, arguments);
  };
}

/* ---------- Le Sage et l'Alchimiste : leur page du donjon ---------- */
/* la page « Le plan des souterrains » du Grand Livre (e3.js : un getter html qui appelle ceci) */
M.donjonPageSage = function(){
  var P = M.P(), aPlan = !!(P && P.pages && P.pages.plan);
  var t = (aPlan ? 'Le plan des Fondateurs te sert enfin : il montre les souterrains, salle par salle.' : 'Entre deux pages de ton Grand Livre, un vieux plan que tu n\'avais jamais vu : des souterrains, sous le village.') +
    ' Le Pisteur, lui, n\'y verra que de la brume. C\'est toi qui dis le chemin, à voix haute !';
  return '<p class="lv-texte">' + esc(t) + ' ' + lire(t) + '</p><button class="btn grand b-aller lv-ouvrir" data-act="ds-aller">🗺️ Ouvrir le plan</button>';
};
/* dans le sac de l'Alchimiste, la nuit (plantes.js) */
M.donjonBoutonAlchimiste = function(){
  if(!cfg() || M.role() !== 'alchimiste' || !nuit()) return '';
  var t = 'Dans le donjon, ton chaudron te suit : le Pisteur y trouvera des plantes rares, à cuisiner pour lui.';
  return '<p class="ds-suite">' + esc(t) + ' <button type="button" class="b-lire" data-pl="lire" data-t="' + esc(t) + '" aria-label="Écouter">🔊</button></p>' +
    '<button type="button" class="btn b-aller" data-pl="donjon">🫕 Le chaudron du donjon</button>';
};

/* ---------- Au retour : on relit ce que les pages du donjon ont gardé dans la tablette ---------- */
var aMontrer = false;
function relire(){
  var P = M.P(), C = cfg();
  if(!P || !C || P.etape !== 'jeu' || !P.donjonJeton || M.UI.ecran !== 'enquete') return;   /* (dans l'enquête seulement : pas sur la place du village) */
  var role = M.role(), change = false;
  if(role === 'pisteur' && P.vus['donjon:parti'] && !P.vus['donjon:fini']){
    var d = json(CLE_PISTEUR);
    if(d && d.jeton === P.donjonJeton && d.faits){
      if(d.faits['code:porte:odette'] && !P.vus['donjon:porte']){
        P.vus['donjon:porte'] = 1; P.objets['_info:odette_porte'] = true; change = true;
        M.noter('Dans le donjon : un gros chat gris gratte au bas d\'une grande porte ronde, marquée de quatre signes.', '🐈');
      }
      if(d.faits.fin){
        var enfui = !!d.faits['code:leo:enfui'];   /* (le donjon l'a décidé : le maire était-il retenu quand on est entré ?) */
        P.vus['donjon:fini'] = 1; P.vus['donjon:leo'] = enfui ? 'enfui' : 'attrape'; P.objets['_info:' + (enfui ? 'leo_enfui' : 'leo_attrape')] = true; change = true; aMontrer = true;
        M.noter(enfui ? 'Au fond du donjon : Léo, le garçon du moulin. Des pas dans l\'escalier… et il a filé dans le noir.' : 'Au fond du donjon : Léo, le garçon du moulin, coincé avec sa lanterne et son panier.', '🕯️');
      }
    }
  }
  if(role === 'sage' && P.vus['donjon:ouvert:sage'] && !P.recus['info:odette_porte']){
    var s = json(CLE_SAGE);
    if(s && s.codes && s.codes['porte:odette'] && lu(CLE_JETON + 'sage') === P.donjonJeton){
      P.recus['info:odette_porte'] = true; change = true; aMontrer = true;
      var I = (enquete().infos || {}).odette_porte || {};
      M.noter('Reçu : ' + (I.nom || 'Odette est derrière la porte') + '. ' + (I.t || ''), I.ic || '🚪');
    }
  }
  if(change) M.sauver();
}
function montrer(){
  if(!aMontrer || (M.UI && M.UI.modal)) return;
  var P = M.P(), role = M.role(); aMontrer = false;
  if(role === 'pisteur') M.ouvrir({type:'descente', vue:'fin'});
  else if(role === 'sage'){ var I = enquete().infos.odette_porte; M.son('gain'); M.ouvrir({type:'info', ic:I.ic, titre:'Tu as reçu : ' + I.nom, t:I.t}); }
}
var render0 = M.render;
M.render = function(){
  try{ relire(); }catch(e){ console.error(e); }
  var r = render0.apply(this, arguments);
  if(aMontrer) setTimeout(function(){ try{ montrer(); }catch(e){ console.error(e); } }, 350);
  return r;
};
M.donjonRelire = relire;
/* On remonte du donjon (la page du donjon ramène ici) : le jeu s'ouvre d'habitude sur la place du village ; là, on revient tout droit
   dans l'enquête, à la carte. (sessionStorage : seulement dans cet onglet, seulement si on est parti d'ici avec ce jeton.)
   (13 novembre, le bug du Pisteur qui remontait en Alchimiste : moteur-base.js, « Un héros ne prend jamais la place d'un autre ».)
   La page du donjon revient maintenant avec « ?retour=<le jeton de la descente> » : on retrouve le héros de CETTE descente dans les
   emplacements de l'appareil (M.emplacementDuJeton), quel que soit ce que l'onglet a retenu ; et l'adresse retrouve son « #test »
   (sans lui, l'enquête 3, encore fermée aux joueurs, se croyait « en cours d'écriture » au retour). */
function noterDepart(j){
  try{
    var d = json(CLE_DEPART) || {}, l;
    d[j] = {hash:location.hash || '', t:Date.now()};
    l = Object.keys(d).sort(function(a, b){ return (d[b].t || 0) - (d[a].t || 0); });
    l.slice(8).forEach(function(k){ delete d[k]; });
    localStorage.setItem(CLE_DEPART, JSON.stringify(d));
  }catch(e){}
}
function remettreAdresse(j){
  try{
    var d = (json(CLE_DEPART) || {})[j] || {}, u = new URL(location.href), avant = u.search + u.hash;
    u.searchParams.delete('retour');
    var q = u.searchParams.toString(), h = u.hash || d.hash || '';
    if((q ? '?' + q : '') + h !== avant) history.replaceState(null, '', u.pathname + (q ? '?' + q : '') + h);
  }catch(e){}
}
var retourJeton = null;
(function(){
  var j = null;
  try{ (location.search || '').replace(/^\?/, '').split('&').forEach(function(x){ var k = x.split('='); if(k[0] === 'retour') j = decodeURIComponent(k[1] || ''); }); }catch(e){}
  if(!j) return;
  remettreAdresse(j);
  var n = M.emplacementDuJeton ? M.emplacementDuJeton(j) : 0;
  if(!n) return;
  retourJeton = j;
  M.choisirEmplacement(n);   /* (avant le démarrage du jeu, qui relit cet emplacement ; ou après : le héros est remplacé tout de suite) */
})();
function revenir(){
  var j = retourJeton;
  try{ j = j || sessionStorage.getItem(CLE_RETOUR); sessionStorage.removeItem(CLE_RETOUR); }catch(e){}
  retourJeton = null;
  if(j) remettreAdresse(j);
  var Sx = M.S, P = Sx && Sx.e;
  if(!j || !Sx || !Sx.heros || !P || P.etape !== 'jeu' || P.defaite || P.donjonJeton !== j || !cfg()) return;
  M.UI.ecran = 'enquete'; M.UI.modal = null; M.UI.pile = [];
  if(M.role() !== 'sage') P.onglet = 'carte';
  M.render();
}
if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function(){ try{ revenir(); }catch(e){ console.error(e); } });
else { try{ revenir(); }catch(e){ console.error(e); } }
/* (le bouton « retour » du navigateur peut rendre la page telle qu'on l'a quittée, sans la recharger : on relit quand même) */
window.addEventListener('pageshow', function(ev){
  if(!ev.persisted) return;
  try{ sessionStorage.removeItem(CLE_RETOUR); }catch(e){}
  try{ if(M.S && M.S.e){ M.UI.modal = null; M.render(); } }catch(e){ console.error(e); }
});

/* ---------- Les codes ---------- */
/* un code qui sert DANS le donjon (I.donjon : la Grosse Marie, le maire retenu), tapé ici par le Pisteur : on lui dit où le taper */
var special0 = M.codeSpecial;
M.codeSpecial = function(t, x, id){
  var E = enquete(), I = t === 'info' && E && E.infos ? E.infos[x] : null;
  if(I && I.donjon && cfg()){
    M.son('clic');
    M.ouvrir({type:'info', ic:I.ic, titre:I.nom, t:'Ce code-là se tape dans le donjon, pas ici : sur l\'écran du donjon, avec le bouton « 📜 Un code ».'});
    return true;
  }
  return special0 ? special0.apply(this, arguments) : false;
};
})();
