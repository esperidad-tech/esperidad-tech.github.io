/* ==========================================================
   Brumeval v2 — moteur, partie 3 : ce que voit chaque rôle
   (carte, lieux, onglets, feuilles)
   ========================================================== */
(function(){
'use strict';
var M = window.M, D = window.DONNEES, esc = M.esc, UI = M.UI;
function lire(t){ return M.lireBtn(t); }

/* Écriture à la main, avec un style de point sur les i (point, rond, trait, étoile, cœur) */
M.ecriture = function(txt, pt){
  return esc(txt).replace(/[iî]/g, '<span class="i-sans">ı<span class="pt pt-' + (pt || 'point') + '"></span></span>');
};

/* ---------- Ce qui se passe dans un lieu, pour mon rôle, maintenant ---------- */
M.momentOk = function(liste){ return !liste || liste.indexOf(M.momentId()) >= 0; };
M.pnjIci = function(lieu){
  var E = M.E(), mid = M.momentId();
  return M.cle(E.pnj || {}).filter(function(id){ return E.pnj[id].ou && E.pnj[id].ou[mid] === lieu; });
};
/* Là, mais occupé (Romain, 5 novembre, 8 h 59 : la carte montre toujours où est chacun) : E.pnj[id].carte[moment] = où il est
   quand on ne peut pas lui parler (Victor en tournée, Mélusine qui dort…) ; E.pnj[id].occupe[moment] = ce qu'on voit en arrivant. */
M.pnjOccupesIci = function(lieu){
  var E = M.E(), mid = M.momentId();
  /* (M.pnjCacheCarte : enquête 3, le Barde ne voit Iris et Basile qu'une fois le marchandage de Fortuné commencé — marche.js) */
  return M.cle(E.pnj || {}).filter(function(id){ var N = E.pnj[id]; return id !== 'voisin' && !(N.ou && N.ou[mid]) && N.carte && N.carte[mid] === lieu && !(M.pnjCacheCarte && M.pnjCacheCarte(id)); });
};
/* E.pnj[id].occupe[moment] : une phrase, ou deux (enquête 3, Bible § 13.6 : « une petite phrase drôle, une deuxième s'il revient ») :
   la première à la première visite du lieu, la deuxième ensuite (P.occ, compté par M.compterOccupes quand on touche le lieu). */
M.phraseOccupe = function(id){
  var E = M.E(), P = M.P(), N = (E && E.pnj && E.pnj[id]) || {}, o = N.occupe && N.occupe[M.momentId()];
  if(!o) return null;
  if(typeof o === 'string') return o;
  var n = (P && P.occ && P.occ[id + ':' + P.moment]) || 0;
  return o[Math.max(0, Math.min(o.length, n) - 1)] || null;
};
M.compterOccupes = function(lieu){
  var P = M.P(), E = M.E(); if(!P || !E) return;
  M.pnjOccupesIci(lieu).forEach(function(id){
    var o = E.pnj[id].occupe && E.pnj[id].occupe[M.momentId()]; if(!o || typeof o === 'string') return;
    if(M.vendeurDispo && M.vendeurDispo(id)) return;   /* (un vendeur de fleurs qui vend encore : ses petites phrases d'occupé viendront après) */
    P.occ = P.occ || {}; var k = id + ':' + P.moment; P.occ[k] = (P.occ[k] || 0) + 1;
  });
};
M.texteOccupe = function(id){
  var x = D.PNJ[id] || {};
  return M.phraseOccupe(id) || (x.court || 'Quelqu\'un') + ' est très occupé' + (FEM[id] ? 'e' : '') + ' en ce moment. Repasse plus tard !';
};
M.bonusIci = function(lieu){
  var E = M.E(), P = M.P(), role = M.role();
  return (E.bonus || []).filter(function(b){ return b.role === role && b.lieu === lieu && M.momentOk(b.moments) && !P.bonus[b.id]; });
};
/* L'icône d'une mission bonus sur la carte (Romain, 10 novembre, 16 h 56 : « dès qu'il y a des petits mini-jeux, il faut qu'on le voie
   avec un petit icône », pour tous les rôles et toutes les enquêtes) : celle de son mini-jeu (🎯, 🫧, 🧩…), 🎵 pour une chanson */
/* Ce que rapporte une mission bonus (Romain, 11 novembre, 8 h 11 : « toutes les missions bonus font gagner entre 1 et 5 pièces d'or, pas plus ») :
   la valeur de l'enquête (b.or), ramenée entre 1 et 5 ; 3 si elle n'en dit rien */
M.orBonus = function(b){
  var n = Math.round(+((b && b.or) || 3));
  return Math.max(1, Math.min(5, n || 3));
};
var IC_BONUS = {runes:'🧩'};   /* (le losange bleu des runes ne dit rien sur une carte) */
M.icBonus = function(b){
  if(b.ic) return b.ic;
  if(b.trous) return '🎵';
  if(IC_BONUS[b.mj]) return IC_BONUS[b.mj];
  var T = window.MJ && MJ.TYPES && MJ.TYPES[b.mj];
  return (T && T.ic) || '✨';
};
M.ecoutesIci = function(lieu){
  var E = M.E(), P = M.P();
  return (E.ecoutes || []).filter(function(x){ return x.lieu === lieu && M.momentOk(x.moments) && x.role === M.role() && !P.vus['ecoute:' + x.id]; });
};
/* Le Pisteur repère ce qui pousse dans chaque lieu, pour le dire à l'Alchimiste */
var cachePlantes = {};
function pointPlantes(lieu){
  var E = M.E(), L = E.lieux[lieu], c = L && L.alchimiste && L.alchimiste.cueillir;
  if(!c || !c.length) return null;
  var k = E.id + ':' + lieu;
  if(cachePlantes[k]) return cachePlantes[k];
  var MO = {matin:'le matin', apresmidi:'l\'après-midi', soir:'le soir', nuit:'la nuit'};
  var noms = c.map(function(x){
    var n = D.INGR[x.ingr].nom.toLowerCase();
    if(x.moments) n += ' (seulement ' + x.moments.map(function(m){ return MO[m]; }).join(' et ') + ')';
    if(x.besoin) n += ' (difficile à cueillir)';
    return n;
  });
  var t = 'Tu repères ce qui pousse par ici : ' + noms.join(', ') + '. L\'Alchimiste ne le sait pas : dis-le-lui !';
  return cachePlantes[k] = {id:'plantes', ic:'🌿', nom:'Ce qui pousse ici', t:t, auto:true,
    note:M.nomLieu(lieu) + ' : ' + c.map(function(x){ return D.INGR[x.ingr].ic + ' ' + D.INGR[x.ingr].nom.toLowerCase(); }).join(', ') + ' (pour l\'Alchimiste).'};
}
M.pointsVisibles = function(lieu, role){
  var E = M.E(), L = E.lieux[lieu], R = L && L[role];
  var l = (R && R.points) ? R.points.filter(function(p){ return M.momentOk(p.moments); }) : [];
  /* (plus de « Ce qui pousse ici » pour le Pisteur : il ne renseigne plus l'Alchimiste, Romain, 5 novembre, 13 h 19 ; pointPlantes reste, inutilisé) */
  return l;
};
/* Lieux où l'Alchimiste peut chercher (elle ne sait pas ce qui y pousse) */
M.lieuxAlchimiste = function(){
  var E = M.E(), l = {};
  if(window.Carte && Carte.LIEUX) M.cle(Carte.LIEUX).forEach(function(id){ if(Carte.LIEUX[id].zone !== 'dessous' && id !== 'pont') l[id] = 1; });
  M.cle(E.lieux).forEach(function(id){ if(E.lieux[id].alchimiste) l[id] = 1; });
  return M.cle(l);
};
M.cueilletteIci = function(lieu){
  var E = M.E(), L = E.lieux[lieu], R = L && L.alchimiste;
  if(!R || !R.cueillir) return [];
  /* (enquête 3) c.secret : une plante rare qu'on ne voit pas tant qu'on n'a pas ce qu'il faut (l'herbier du Sage) : « rien à trouver » */
  return R.cueillir.filter(function(c){ return M.momentOk(c.moments) && !(c.secret && !M.besoinOk(c.besoin)); });
};
M.verrouLieu = function(lieu){
  var E = M.E(), L = E.lieux[lieu];
  if(!L || !L.verrou) return null;
  if(L.verrou.roles && L.verrou.roles.indexOf(M.role()) < 0) return null;
  return M.besoinOk(L.verrou.besoin) ? null : L.verrou;
};
M.aQuelqueChose = function(lieu){
  var role = M.role();
  if(M.bonusIci(lieu).length) return true;
  if(role === 'pisteur' || role === 'sage') return M.pointsVisibles(lieu, role).length > 0;
  if(role === 'alchimiste') return M.lieuxAlchimiste().indexOf(lieu) >= 0;
  if(role === 'barde') return M.pnjIci(lieu).length > 0 || M.ecoutesIci(lieu).length > 0;
  return false;
};
M.infosCarte = function(){
  var E = M.E(), P = M.P(), role = M.role(), mid = M.momentId();
  var lieux = {};
  M.cle(E.lieux).forEach(function(id){ lieux[id] = 1; });
  if(role === 'alchimiste') M.lieuxAlchimiste().forEach(function(id){ lieux[id] = 1; });
  M.cle(E.pnj || {}).forEach(function(id){ var o = E.pnj[id].ou; if(o && o[mid] && !/^[LFB]\d$/.test(o[mid])) lieux[o[mid]] = 1; });
  (E.bonus || []).forEach(function(b){ lieux[b.lieu] = 1; });
  var actifs = [], verrous = [], liste = [], marqueurs = [];
  M.cle(lieux).forEach(function(id){
    var a = M.aQuelqueChose(id);
    var v = M.verrouLieu(id);
    if(!a && !(v && ((E.lieux[id] || {})[role] || role === 'alchimiste'))) return;
    if(v) verrous.push(id); else actifs.push(id);
    var connu = role !== 'alchimiste' || (P.notesIngr && P.notesIngr[id] && P.notesIngr[id].length);
    liste.push({id:id, nom:M.nomLieu(id), ic:connu ? M.icLieu(id) : '❔', verrou:!!v, bonus:M.bonusIci(id).length > 0, nouveau:a && !P.vus['lieu:' + id + ':' + P.moment]});
  });
  /* (plus de marqueurs « qui est là » pour le Barde : depuis le 5 novembre, 8 h 59, la carte montre à tout le monde où est chacun, carte-jeu.js) */
  (E.bonus || []).forEach(function(b){
    if(b.role === role && M.momentOk(b.moments) && !P.bonus[b.id]) marqueurs.push({lieu:b.lieu, ic:M.icBonus(b), label:'Mission bonus', act:'lieu', id:b.lieu, classe:'bonus'});
  });
  if(role === 'alchimiste'){
    M.cle(P.notesIngr || {}).forEach(function(id){
      var l = P.notesIngr[id] || [];
      /* (grisé quand elle a déjà cherché ici à ce moment : Romain, 5 novembre, 12 h 31) */
      if(l.length) marqueurs.push({lieu:id, ic:l.map(function(i){ return (D.INGR[i] || (D.PLANTES || {})[i] || {}).ic || ''; }).join(''), act:'lieu', id:id, classe:'ingr', grise:P.vus['cueilli:' + id] === P.moment});
    });
  }
  /* (plus de notes « qui habite ici » sur la carte : chaque maison montre le visage de son habitant, carte-jeu.js) */
  liste.sort(function(a, b){ return (b.bonus - a.bonus) || a.nom.localeCompare(b.nom); });
  return {actifs:actifs, verrous:verrous, liste:liste, marqueurs:marqueurs, notes:{}};
};

/* ---------- Feuille d'un lieu ---------- */
M.feuilleLieu = function(lieu){
  var E = M.E(), P = M.P(), role = M.role(), mid = M.momentId(), L = E.lieux[lieu] || {};
  var s = '<div class="b-feuille-tete"><span class="b-feuille-ic">' + M.icLieu(lieu) + '</span><div><h2>' + esc(M.nomLieu(lieu)) + '</h2><span class="doux">' + D.MOMENTS[mid].ic + ' ' + D.MOMENTS[mid].nom + '</span></div></div>';
  var v = M.verrouLieu(lieu);
  if(v){
    /* v.tPour[role] : le texte pour ce rôle ; v.besoinPour : ceux à qui « ce qui marcherait » s'adresse (le Vieux Chêne de l'E2 : le Pisteur) */
    var vt = (v.tPour && v.tPour[role]) || v.t, vb = !v.besoinPour || v.besoinPour.indexOf(role) >= 0;
    s += '<div class="b-verrou"><p>🔒 ' + esc(vt) + '</p>' + lire(vt) + (vb ? M.besoinHTML(v.besoin, role) : '') + '</div>';
    return s + bonusHTML(lieu);
  }
  if(role === 'pisteur' || role === 'sage'){
    var pts = M.pointsVisibles(lieu, role), R = L[role] || {};
    var cle = 'explore:' + lieu;
    if(pts.length){
      if(P.vus[cle] !== P.moment && !toutVu(lieu, role)){
        s += '<p class="b-teaser">' + esc(role === 'pisteur' ? 'Il y a peut-être des choses à découvrir ici…' : 'Ce lieu a sûrement une histoire…') + ' ' + lire(role === 'pisteur' ? 'Il y a peut-être des choses à découvrir ici…' : 'Ce lieu a sûrement une histoire…') + '</p>' +
          (M.fouilleGratuite && M.fouilleGratuite(lieu) ? '<button class="btn grand" data-act="explorer" data-id="' + lieu + '">🔦 Fouiller · gratuit</button><p class="doux petit">Sous terre, fouiller ne coûte aucune action.</p>' :   /* sous-sols du Pisteur (carte-jeu.js) */
          '<button class="btn grand" data-act="explorer" data-id="' + lieu + '"' + (M.peutAgir() ? '' : ' disabled') + '>' + (role === 'pisteur' ? '🔍 Explorer' : '👁️ Observer') + M.coutTxt() + '</button>' + plusDAction());
      } else {
        if(R.intro) s += '<p class="b-intro-lieu">' + esc(R.intro) + ' ' + lire(R.intro) + '</p>';
        s += '<div class="b-points">' + pts.map(function(p){
          var k = role + ':' + lieu + ':' + p.id, st = P.vus[k];
          var ouvert = P.vus[cle] === P.moment;
          return '<button class="b-point' + (st === 'ok' ? ' vu' : st === 'rate' ? ' rate' : '') + '" data-act="point" data-l="' + lieu + '" data-id="' + p.id + '"' + (!st && !ouvert ? ' disabled' : '') + '>' +
            '<span class="b-point-ic">' + p.ic + '</span><b>' + esc(p.nom) + '</b>' + (p.mj && st !== 'ok' ? '<small>🎮 mini-jeu</small>' : '') + (p.besoin && !st && !M.besoinOk(p.besoin) ? '<small>🔒</small>' : '') + (st === 'ok' ? '<small>✔</small>' : st === 'rate' ? (M.ferme && M.ferme(k) ? '<small>🔒 fini</small>' : '<small>🔁 ' + (M.essaisInfinis && M.essaisInfinis() ? 'réessayer' : 'dernière chance') + '</small>') : '') + '</button>';
        }).join('') + '</div>';
        if(M.sansActions()){ if(toutVu(lieu, role)) s += rienDePlus(); }   /* sans actions : un lieu ne donne qu'une chose par moment ; tout vu, on ne le redonne pas */
        else if(P.vus[cle] !== P.moment) s += M.fouilleGratuite && M.fouilleGratuite(lieu) ? '<button class="btn second" data-act="explorer" data-id="' + lieu + '">🔦 Fouiller à nouveau · gratuit</button>' :
          '<p class="doux petit">Pour revenir chercher ici, il faudra une nouvelle action.</p><button class="btn second" data-act="explorer" data-id="' + lieu + '"' + (M.peutAgir() ? '' : ' disabled') + '>' + (role === 'pisteur' ? '🔍 Explorer' : '👁️ Observer') + ' à nouveau · 1 action</button>';
      }
    } else if(!M.bonusIci(lieu).length) s += '<p class="doux">Rien de spécial ici pour l\'instant. ' + lire('Rien de spécial ici pour l\'instant.') + '</p>';   /* (dès l'enquête 2, tous les lieux se touchent : carte-jeu.js) */
  }
  /* (enquête 3) l'Alchimiste a aussi des choses à faire dans certains lieux (le gâteau de la fête, le vieux pommier, la poussière des
     vesses-de-loup) : ses points, comme ceux du Pisteur, mais sans « Explorer » avant (elle sait pourquoi elle vient) */
  var ptsA = role === 'alchimiste' ? M.pointsVisibles(lieu, role) : [];
  if(ptsA.length){
    if(L.alchimiste.intro) s += '<p class="b-intro-lieu">' + esc(L.alchimiste.intro) + ' ' + lire(L.alchimiste.intro) + '</p>';
    s += '<div class="b-points">' + ptsA.map(function(p){
      var k = role + ':' + lieu + ':' + p.id, st = P.vus[k];
      return '<button class="b-point' + (st === 'ok' ? ' vu' : st === 'rate' ? ' rate' : '') + '" data-act="point" data-l="' + lieu + '" data-id="' + p.id + '">' +
        '<span class="b-point-ic">' + p.ic + '</span><b>' + esc(p.nom) + '</b>' + (p.mj && st !== 'ok' ? '<small>🎮 mini-jeu</small>' : '') + (p.besoin && !st && !M.besoinOk(p.besoin) ? '<small>🔒</small>' : '') + (st === 'ok' ? '<small>✔</small>' : st === 'rate' ? (M.ferme && M.ferme(k) ? '<small>🔒 fini</small>' : '<small>🔁 ' + (M.essaisInfinis && M.essaisInfinis() ? 'réessayer' : 'dernière chance') + '</small>') : '') + '</button>';
    }).join('') + '</div>';
  }
  if(role === 'alchimiste'){
    /* (Romain, 5 novembre, 12 h 31) plus de « Ce que tu sais de ce lieu » ni de « 📝 Noter » : le petit rond qui flotte sur la carte
       montre déjà ce qui pousse ici (il se grise quand elle a cherché). Déjà cherché à ce moment : « ✅ Déjà récolté » ;
       rien à cueillir ici à ce moment : « 🍂 Rien à trouver » tout de suite, sans « Chercher » (ni action dépensée pour rien). */
    var deja = P.vus['cueilli:' + lieu] === P.moment;
    var gratuit = !M.sansActions() && (P.usages.herboriste || 0) < M.fxSomme('cueilletteGratuite');
    var pousse = M.cueilletteIci(lieu), cueillable = pousse.filter(function(x){ return M.besoinOk(x.besoin); });
    if(deja) s += '<p class="b-recolte">✅ Déjà récolté</p>';
    else if(!pousse.length){ if(!ptsA.length) s += '<p class="b-recolte">🍂 Rien à trouver</p>'; }   /* (un lieu où elle a autre chose à faire : pas de « rien à trouver ») */
    else if(!cueillable.length){
      var il = []; pousse.forEach(function(x){ M.texteBesoin(x.besoin, role).forEach(function(b){ if(il.indexOf(b.ic + ' ' + b.nom) < 0) il.push(b.ic + ' ' + b.nom); }); });
      s += '<p class="b-recolte">🔒 Il te faut : ' + esc(il.join(', ') || 'le bon matériel') + '</p>';
    }
    else if(cueillable.every(function(x){ return !!x.plante; })) s += '<button class="btn grand" data-act="cueillir" data-id="' + lieu + '"' + (M.peutAgir() || gratuit ? '' : ' disabled') + '><span class="b-ic-contour">🧺</span> Chercher<span class="b-long"> des plantes</span>' + M.coutTxt(' · 1 action') + '</button>' + plusDAction();   /* (enquête 3) une vraie plante pour l'établi */
    else s += '<button class="btn grand" data-act="cueillir" data-id="' + lieu + '"' + (M.peutAgir() || gratuit ? '' : ' disabled') + '><span class="b-ic-contour">🧺</span> Chercher<span class="b-long"> des ingrédients</span>' + M.coutTxt(   /* (le panier, jaune sur le bouton jaune : un contour foncé, Romain 10 h 45) */' · ' + (gratuit ? 'gratuit (Herboriste)' : '1 action')) + '</button>' +
      '<p class="doux petit">On trouve parfois 1, parfois 2 ou 3 ingrédients d\'un coup : c\'est la chance !</p>' + plusDAction();
    if(UI.modal && UI.modal.noterIngr){
      s += '<div class="b-noter-ingr"><p>Touche ce qui pousse ici : ' + lire('Touche ce qui pousse ici.') + '</p><div class="b-cueillette">' + M.cle(D.INGR).map(function(i){
        var I = D.INGR[i], on = notes.indexOf(i) >= 0;
        return '<button class="b-ingr-carte' + (on ? ' on' : '') + '" data-act="basculer-ingr" data-l="' + lieu + '" data-id="' + i + '"><span>' + I.ic + '</span><b>' + esc(I.nom) + '</b></button>';
      }).join('') + '</div></div>';
    }
  }
  if(role === 'pisteur' && M.rumeurLieu) s += M.rumeurLieu(lieu);   /* la rumeur du Barde : guetter ici (barde.js) */
  if(role === 'barde' && M.lieuBarde) s += M.lieuBarde(lieu);   /* le nouveau Barde : habitants, écoutes, scènes, talents (barde.js) */
  else if(role === 'barde'){
    var gens = M.pnjIci(lieu);
    if(gens.length){
      s += '<p class="sur-titre">Ici en ce moment</p><div class="b-gens">' + gens.map(function(id){ return carteGens(id); }).join('') + '</div>';
    } else if(!M.ecoutesIci(lieu).length && !M.bonusIci(lieu).length) s += '<p class="doux">Il n\'y a personne ici en ce moment. ' + lire('Il n\'y a personne ici en ce moment.') + '</p>';
    M.ecoutesIci(lieu).forEach(function(x){
      var ok = M.besoinOk(x.besoin);
      s += '<div class="b-ecoute"><h3>👂 ' + esc(x.titre) + '</h3><p>' + esc(x.intro) + '</p>' + lire(x.intro) +
        (ok ? '<button class="btn grand" data-act="ecouter" data-id="' + x.id + '"' + (M.peutAgir() ? '' : ' disabled') + '>👂 Écouter en cachette' + M.coutTxt() + '</button>' : M.besoinHTML(x.besoin, 'barde') + (x.alt ? '<p class="doux petit">' + esc(x.alt) + '</p>' : '')) + '</div>';
    });
  }
  return s + bonusHTML(lieu);
};
/* « Rien de plus ici pour ce moment » : sans points d'action, un lieu ou un villageois ne donne qu'une chose par moment ;
   une fois faite, on le dit gentiment au lieu de la redonner (lieux, cueillettes, conversations du Barde) */
function rienDePlus(){ var t = 'Rien de plus ici pour ce moment.'; return '<p class="doux b-rien-de-plus">✅ ' + esc(t) + ' ' + lire(t) + '</p>'; }
M.rienDePlus = rienDePlus;
function toutVu(lieu, role){
  var P = M.P();
  var pts = M.pointsVisibles(lieu, role);
  return pts.length && pts.every(function(p){ var k = role + ':' + lieu + ':' + p.id; return P.vus[k] === 'ok' || (p.mj && M.ferme && M.ferme(k)); });   /* un mini-jeu raté deux fois compte comme vu */
}
function plusDAction(){ if(M.peutAgir()) return ''; var t = 'Plus d\'action pour ce moment. Attends le code du ' + (M.role() === 'sage' ? 'moment suivant (c\'est toi qui le donnes !)' : 'Sage pour le moment suivant.'); return '<p class="b-plus-action">⏳ ' + esc(t) + ' ' + lire(t) + '</p>'; }
M.plusDAction = plusDAction;
function bonusHTML(lieu){
  var P = M.P();
  return M.bonusIci(lieu).map(function(b){
    /* (dans la bulle de la carte : seulement « ✨ Mission bonus » et « Tenter » ; le nom et l'histoire sont dans la fenêtre du mini-jeu) */
    return '<div class="b-bonus"><h3>✨ Mission bonus<span class="b-long"> : ' + esc(b.titre) + '</span></h3><p>' + esc(b.t) + '</p>' + lire(b.t) +
      '<p class="b-bonus-gain">🪙 ' + M.orBonus(b) + (M.orBonus(b) > 1 ? ' pièces' : ' pièce') + ' d\'or · ⚠️ un seul essai</p><button class="btn magie" data-act="bonus" data-id="' + b.id + '"' + (M.peutAgir() ? '' : ' disabled') + '>Tenter' + M.coutTxt() + '</button></div>';
  }).join('');
}
function carteGens(id){
  var P = M.P(), x = D.PNJ[id], ouvert = P.conv[id] === P.moment;
  return '<div class="b-gens-carte"><div class="b-gens-img">' + M.pnjImg(id) + '</div><b>' + esc(x.court) + '</b><small>' + esc(x.metier) + '</small>' +
    '<button class="btn petit' + (ouvert ? ' second' : '') + '" data-act="parler" data-id="' + id + '"' + (ouvert || M.peutAgir() ? '' : ' disabled') + '>' + (ouvert ? '💬 Continuer' : '💬 Parler' + M.coutTxt()) + '</button></div>';
}

/* ---------- Une maison (Romain, 5 novembre, 00 h 14 ; DESIGN 12.19) ----------
   On sait qui habite où : son visage est sur sa maison, dès l'enquête 1 (carte-jeu.js). Plus d'adresse à apprendre ni à noter.
   Le Barde qui touche une maison frappe tout de suite (A.maison, moteur-actions.js) : on lui ouvre s'il y a quelqu'un ;
   sinon, un petit message (« Odette n'est pas chez elle en ce moment. »), sans rien dépenser. Les autres rôles voient qui habite là. */
var FEM = {melusine:1, odette:1, iris:1, margot:1};
M.habitantMaison = function(maison){
  var E = M.E(), R = (E && E.registre) || {};
  return M.cle(R).filter(function(id){ return R[id].maison === maison; })[0] || null;
};
M.chezLui = function(id){ return 'chez ' + (FEM[id] ? 'elle' : 'lui'); };
M.texteAbsent = function(maison){
  var id = M.habitantMaison(maison), x = id && D.PNJ[id], E0 = M.E();
  /* une absence qui compte dans l'enquête (E.absentTexte : Odette, à l'E2), pour les autres que le Barde (Romain, 5 novembre, 13 h 19) */
  /* (E.absentPourTous : enquête 3, le Barde aussi — chez Odette, il n'entre que l'après-midi, pour poser la canne) */
  if(id && E0 && E0.absentTexte && E0.absentTexte[id] && (M.role() !== 'barde' || E0.absentPourTous)) return E0.absentTexte[id];
  if(id && M.pnjOccupesIci(maison).indexOf(id) >= 0) return M.texteOccupe(id);   /* chez lui, mais il n'ouvre pas (il dort…) */
  return x ? x.court + ' n\'est pas ' + M.chezLui(id) + ' en ce moment.' : 'Tu frappes, tu attends… Personne ne répond.';
};
M.feuilleMaison = function(maison){
  var E = M.E(), role = M.role(), id = M.habitantMaison(maison), x = id && D.PNJ[id], mid = M.momentId();
  var s = '<div class="b-feuille-tete"><span class="b-feuille-ic">🏠</span><div><h2>' + esc(M.adresse(maison)) + '</h2></div></div>';
  if(x){
    var la = !!(E.pnj && E.pnj[id] && E.pnj[id].ou && E.pnj[id].ou[mid] === maison);
    var t = la ? x.court + ' est ' + M.chezLui(id) + ' en ce moment.' : M.texteAbsent(maison);
    /* dans la bulle de la carte (Romain, 10 h 32) : une seule pastille, son visage et la phrase */
    if(UI.modal && UI.modal.bulle) s += '<div class="b-maison-hab b-maison-mini"><div class="b-gens-img">' + M.pnjImg(id) + '</div><span>' + esc(t) + '</span></div>';
    else s += '<div class="b-maison-hab"><div class="b-gens-img">' + M.pnjImg(id) + '</div><div><b>' + esc(x.nom) + '</b><small>' + esc(x.metier) + '</small></div></div>' +
      '<p class="doux">' + esc(t) + ' ' + lire(t) + '</p>';
  } else {
    /* quelqu'un habite là, mais il n'est pas dans le registre de cette enquête : sur la carte, un « ? » (carte-jeu.js) */
    var inconnu = M.cle(D.PNJ).some(function(k){ return D.PNJ[k].domicile === maison && !(E.registre || {})[k]; });
    var t0 = inconnu ? 'Quelqu\'un habite ici… mais tu ne sais pas encore qui.' : 'Rien de spécial ici pour l\'instant.';
    s += '<p class="doux">' + esc(t0) + ' ' + lire(t0) + '</p>';
  }
  /* (une enquête avec des points d'action : frapper coûte une action, alors le Barde a d'abord cette feuille, avec le bouton) */
  if(role === 'barde' && M.pnjIci(maison).length){
    var ic0 = M.pnjIci(maison)[0];
    /* fâché, ou « Encore toi ? » (barde.js : M.pnjFache) : son visage et « Reviens plus tard », cerclés de rouge */
    var rouge0 = M.pastilleRouge ? M.pastilleRouge(ic0) : '';
    if(rouge0) s += rouge0;
    else s += '<button class="btn grand" data-act="frapper" data-id="' + maison + '"' + (M.peutAgir() ? '' : ' disabled') + '>🚪 Frapper à la porte' + M.coutTxt() + '</button>' + plusDAction();
  }
  if(role === 'barde' && M.porteBouton) s += M.porteBouton(maison);   /* 👂 écouter aux portes (talent, barde.js) */
  return s;
};

/* ---------- Conversation (Barde) ---------- */
M.feuilleConv = function(id){
  var E = M.E(), P = M.P(), x = D.PNJ[id], Q = (E.pnj[id] && E.pnj[id].questions) || [];
  /* Rien ne trahit un menteur ici : ni sa tête, ni la couleur de la réponse. C'est au Barde de le démasquer. */
  var s = '<div class="b-conv"><div class="b-conv-img">' + M.pnjImg(id, 'normal') + '</div><div><h2>' + esc(x.nom) + '</h2><span class="doux">' + esc(x.metier) + '</span></div></div>';
  s += '<div class="b-questions">';
  Q.forEach(function(q, i){
    var k = 'barde:' + id + ':' + i, st = P.vus[k];
    if(q.besoin && !M.besoinOk(q.besoin) && !st){
      s += '<div class="b-question ferme"><span>🔒</span><div><b>' + esc(q.q) + '</b>' + M.besoinHTML(q.besoin, 'barde') + '</div></div>';
      return;
    }
    if(!st){ s += '<button class="b-question" data-act="question" data-p="' + id + '" data-i="' + i + '"><span>💬</span><b>' + esc(q.q) + '</b></button>'; return; }
    var verite = P.vus['verite:' + id + ':' + i];
    s += '<div class="b-question repondue"><b>' + esc(q.q) + '</b><p class="b-reponse">« ' + esc(q.a) + ' »</p>' +
      (verite ? '<p class="b-reponse verite">🔍 La vérité : « ' + esc(q.vrai) + ' »</p>' : '') + M.lireBtn(verite ? q.vrai : q.a, id);
    s += '</div>';
  });
  s += '</div>';
  /* Démasquer : proposé dès l'enquête 2 pour tout habitant à qui on a parlé, qu'il mente ou non */
  var parle = Q.some(function(q, i){ return P.vus['barde:' + id + ':' + i] === 'ok'; });
  if(parle && (E.id || 1) >= 2){
    var deja = M.ferme ? M.ferme('demasque:' + id) : P.vus['demasque:' + id + ':' + P.moment], une = M.nbEchecs && M.nbEchecs('demasque:' + id) === 1;   /* 2 essais au plus (essais.js) */
    s += '<div class="b-demasquer"><p class="doux petit">Tu as un doute ? Fais-le répéter en regardant bien son visage.</p><div class="b-rangee">' +
      '<button class="btn petit magie" data-act="demasquer" data-p="' + id + '"' + (deja ? ' disabled' : '') + '>' + (une ? '🔁 ' : '🔍 ') + 'Démasquer ' + esc(x.court) + (deja ? ' (plus possible dans cette enquête)' : une ? ' (dernière chance)' : '') + '</button>' +
      (M.fxSomme('verite') > (P.usages.verite || 0) ? '<button class="btn petit second" data-act="forcer" data-p="' + id + '">🗣️ Forcer la vérité (' + (M.fxSomme('verite') - (P.usages.verite || 0)) + ')</button>' : '') + '</div></div>';
  }
  return s;
};

/* ---------- Onglet Pisteur : sa cabane (cabane.js), avec le sac dedans ----------
   Le sac garde tout ce que montrait l'ancien onglet « Sac » : objets trouvés et leurs codes, potions reçues,
   ce que l'équipe a donné, talents et équipement. Sans cabane.js, l'onglet redevient cette liste. */
function sacPisteur(){
  var E = M.E(), P = M.P();
  var s = objetsTrouves();
  s += potionsRecues();
  var infos = M.cle(P.recus).filter(function(k){ return k.indexOf('info:') === 0; });
  if(infos.length) s += '<h3>Ce que l\'équipe m\'a donné</h3><ul class="b-liste">' + infos.map(function(k){ var n = M.nomCode(k), I = E.infos[k.slice(5)] || {}; return '<li><span class="b-ic">' + n.ic + '</span><div><b>' + esc(n.nom) + '</b><p>' + esc(I.t || '') + '</p></div>' + (I.t ? lire(I.t) : '') + '</li>'; }).join('') + '</ul>';
  s += equipementUtile();
  return s;
}
M.sacPisteurHTML = function(){ return '<section class="b-sac b-sac-cabane"><h2>🎒 Mon sac</h2>' + sacPisteur() + '</section>'; };   /* on le ferme avec ✕ (en haut de la feuille) */
M.ongletPisteur = function(){
  if(M.cabanePlein && M.cabanePlein() && M.cabaneHTML) return M.cabaneHTML();
  return '<section class="b-sac"><h2>🎒 Mon sac</h2>' + sacPisteur() + '</section>';
};
function objetsTrouves(){
  var E = M.E(), P = M.P();
  var ids = M.cle(P.objets);
  if(!ids.length) return '<p class="doux">Les objets que tu trouves apparaîtront ici, avec leur code. ' + lire('Les objets que tu trouves apparaîtront ici, avec leur code.') + '</p>';
  return '<h3>Codes à donner à l\'équipe</h3><div class="b-objets-trouves">' + ids.map(function(id){
    var code = id.charAt(0) === '_' ? id.slice(1) : 'obj:' + id;
    var n = M.nomCode(code), dest = M.destinataire(code);
    var pour = Array.isArray(dest) ? dest.map(function(r){ return D.ROLES[r].ic + ' ' + D.ROLES[r].le; }).join(' ou ') : (D.ROLES[dest] ? D.ROLES[dest].ic + ' ' + D.ROLES[dest].le : dest === 'tous' ? '👥 toute l\'équipe : chacun peut le taper' : 'toute l\'équipe');
    return '<div class="b-objet-code"><div class="b-oc-tete"><span>' + n.ic + '</span><b>' + esc(n.nom) + '</b></div>' + M.codeHTML(M.code(code)) + '<p class="b-pour">Pour ' + pour + '</p></div>';
  }).join('') + '</div>';
}
M.objetsTrouves = objetsTrouves;
function potionsRecues(){
  var P = M.P();
  var ids = M.cle(P.potions).filter(function(k){ return P.potions[k] > 0; });
  if(!ids.length) return '';
  return '<h3>Mes potions</h3><ul class="b-liste">' + ids.map(function(k){ var p = D.POTIONS[k]; return '<li><span class="b-ic">' + p.ic + '</span><div><b>' + esc(p.nom) + ' × ' + P.potions[k] + '</b><p>' + esc(p.d) + '</p></div>' + lire(p.nom + '. ' + p.d) + '</li>'; }).join('') + '</ul>';
}
M.potionsRecues = potionsRecues;
function equipementUtile(){
  var S = M.S;
  if(!S.talents.length && !S.equip.length) return '';
  return '<h3>Mes talents et mon équipement</h3><div class="b-recus">' +
    S.talents.map(function(id){ var t = D.TALENTS[id]; return '<span class="b-puce-ingr" title="' + esc(t.d) + '">' + t.ic + ' ' + esc(t.nom) + '</span>'; }).join('') +
    S.equip.map(function(id){ var o = D.OBJETS[id]; return '<span class="b-puce-ingr" title="' + esc(o.d) + '">' + o.ic + ' ' + esc(o.nom) + '</span>'; }).join('') + '</div>';
}
M.equipementUtile = equipementUtile;

/* ---------- Onglet Alchimiste : l'atelier ---------- */
M.recettesConnues = function(){
  var E = M.E(), l = D.RECETTES_DE_BASE.slice();
  (E.recettes || []).forEach(function(r){ if(l.indexOf(r) < 0) l.push(r); });
  (M.S.recettes || []).forEach(function(r){ if(l.indexOf(r) < 0 && D.RECETTES[r]) l.push(r); }); /* recettes apprises pendant la saison (code d'un équipier) */
  M.sources().forEach(function(x){ (x.fx.recettes || []).forEach(function(r){ if(l.indexOf(r) < 0) l.push(r); }); });
  return l;
};
function atelierClassique(){
  var E = M.E(), P = M.P(), S = M.S;
  var s = '<section class="b-atelier"><h2>⚗️ Mon atelier</h2>';
  s += '<div class="b-etagere"><div class="b-fioles">🧪 <b>' + S.fioles + '</b> fiole' + (S.fioles > 1 ? 's' : '') + ' vide' + (S.fioles > 1 ? 's' : '') + '</div>' +
    '<div class="b-ingr">' + (M.cle(S.ingr).filter(function(k){ return S.ingr[k] > 0; }).map(function(k){ var I = D.INGR[k]; return '<span class="b-bocal" style="--p:' + I.c + '"><i>' + I.ic + '</i><b>' + S.ingr[k] + '</b><small>' + esc(I.nom) + '</small></span>'; }).join('') || '<p class="doux">Aucun ingrédient. Va cueillir sur la carte !</p>') + '</div></div>';
  var pots = M.cle(S.potions).filter(function(k){ return S.potions[k] > 0; });
  s += '<h3>Mes potions prêtes</h3>' + (pots.length ? '<div class="b-potions">' + pots.map(function(k){
    var p = D.POTIONS[k];
    return '<div class="b-potion" style="--p:' + p.c + '"><span class="b-potion-ic">' + p.ic + '</span><div><b>' + esc(p.nom) + ' × ' + S.potions[k] + '</b><p>' + esc(p.d) + ' ' + lire(p.nom + '. ' + p.d) + '</p><small>Pour : ' + p.pour.map(function(r){ return D.ROLES[r].ic + ' ' + D.ROLES[r].m; }).join(', ') + '</small></div>' +
      '<button class="btn petit" data-act="donner-potion" data-id="' + k + '">🎁 Donner</button>' +
      ((M.acces('etal') && (P.usages.etal || 0) < 2) ? '<button class="btn petit second" data-act="vendre" data-id="' + k + '">🛒 Vendre</button>' : '') + '</div>';
  }).join('') + '</div>' : '<p class="doux">Aucune potion pour l\'instant.</p>');
  var recus = M.cle(P.recus).filter(function(k){ return k.indexOf('obj:') === 0; });
  s += '<h3>Objets à analyser</h3>' + (recus.length ? '<div class="b-analyses">' + recus.map(function(k){
    var id = k.slice(4), o = E.objets[id], A = M.texteAnalyse((E.analyses || {})[id]), fait = P.analyses[id];
    return '<div class="b-analyse' + (fait ? ' faite' : '') + '"><span class="b-ic">' + o.ic + '</span><div><b>' + esc(o.nom) + '</b>' +
      (fait ? '<p>' + esc(A.t) + '</p>' + (fait === 2 && A.detail ? '<p class="b-detail">🔍 ' + esc(A.detail.t) + '</p>' : '') + lire(A.t) : '<p class="doux petit">Pas encore analysé.</p>') + '</div>' +
      (fait ? '' : '<button class="btn petit" data-act="analyser" data-id="' + id + '"' + (M.peutAgir() ? '' : ' disabled') + '>🔬 Analyser' + M.coutTxt() + '</button>') + '</div>';
  }).join('') + '</div>' : '<p class="doux">Quand un équipier te donne le code d\'un objet, tape-le dans l\'onglet 🔢 Code : il apparaîtra ici. ' + lire('Quand un équipier te donne le code d\'un objet, tape-le dans l\'onglet Code : il apparaîtra ici.') + '</p>');
  s += '<h3>Mon grimoire de recettes</h3><div class="b-recettes">' + M.recettesConnues().map(function(r){
    var R = D.RECETTES[r], p = D.POTIONS[r], secrete = R.secrete;
    return '<div class="b-recette" style="--p:' + p.c + '"><div class="b-recette-tete"><span>' + p.ic + '</span><b>' + esc(p.nom) + '</b></div><p class="petit">' + esc(p.d) + '</p>' +
      '<div class="b-recette-ingr">' + R.ingr.map(function(x){ var I = D.INGR[x[0]]; return '<span>' + (secrete ? '?' : x[1]) + ' ' + I.ic + '</span>'; }).join(secrete ? ' ' : ' → ') + '</div>' +
      (secrete ? '<p class="b-secret">📖 Combien et dans quel ordre ? C\'est écrit dans le Grand Livre du Sage.</p>' : '') +
      '<p class="petit doux">Cuisson : ' + esc((MJ.TYPES[R.cuisson] || {nom:R.cuisson}).nom) + '</p>' +
      '<button class="btn petit" data-act="fabriquer" data-id="' + r + '"' + (M.peutAgir() || M.fxVrai('autoPotion') ? '' : ' disabled') + '>🔥 Fabriquer' + M.coutTxt() + '</button></div>';
  }).join('') + '</div>' + M.plusDAction();
  return s + '</section>';
}

function potionsEtAnalyses(){
  var E = M.E(), P = M.P(), S = M.S;
  var s = '<div class="b-etagere"><div class="b-fioles">🧪 <b>' + S.fioles + '</b> fiole' + (S.fioles > 1 ? 's' : '') + ' vide' + (S.fioles > 1 ? 's' : '') + '</div></div>';
  var pots = M.cle(S.potions).filter(function(k){ return S.potions[k] > 0; });
  s += '<h3>Mes potions prêtes</h3>' + (pots.length ? '<div class="b-potions">' + pots.map(function(k){
    var p = D.POTIONS[k];
    return '<div class="b-potion" style="--p:' + p.c + '"><span class="b-potion-ic">' + p.ic + '</span><div><b>' + esc(p.nom) + ' × ' + S.potions[k] + '</b><p>' + esc(p.d) + ' ' + lire(p.nom + '. ' + p.d) + '</p><small>Pour : ' + p.pour.map(function(r){ return D.ROLES[r].ic + ' ' + D.ROLES[r].m; }).join(', ') + '</small></div>' +
      '<button class="btn petit" data-act="donner-potion" data-id="' + k + '">🎁 Donner</button>' +
      ((M.acces('etal') && (P.usages.etal || 0) < 2) ? '<button class="btn petit second" data-act="vendre" data-id="' + k + '">🛒 Vendre</button>' : '') + '</div>';
  }).join('') + '</div>' : '<p class="doux">Aucune potion pour l\'instant. Prépare-les au grand chaudron, dans ton atelier. ' + lire('Aucune potion pour l\'instant. Prépare-les au grand chaudron, dans ton atelier.') + '</p>');
  var recus = M.cle(P.recus).filter(function(k){ return k.indexOf('obj:') === 0; });
  s += '<h3>Objets à analyser</h3>' + (recus.length ? '<div class="b-analyses">' + recus.map(function(k){
    var id = k.slice(4), o = E.objets[id], A = M.texteAnalyse((E.analyses || {})[id]), fait = P.analyses[id];
    return '<div class="b-analyse' + (fait ? ' faite' : '') + '"><span class="b-ic">' + o.ic + '</span><div><b>' + esc(o.nom) + '</b>' +
      (fait ? '<p>' + esc(A.t) + '</p>' + (fait === 2 && A.detail ? '<p class="b-detail">🔍 ' + esc(A.detail.t) + '</p>' : '') + M.lireBtn(A.t) : '<p class="doux petit">Pas encore analysé.</p>') + '</div>' +
      (fait ? '' : '<button class="btn petit" data-act="analyser" data-id="' + id + '"' + (M.peutAgir() ? '' : ' disabled') + '>🔬 Analyser' + M.coutTxt() + '</button>') + '</div>';
  }).join('') + '</div>' : '<p class="doux">Quand un équipier te donne le code d\'un objet, tape-le dans l\'onglet 🔢 Code : il apparaîtra ici. ' + lire('Quand un équipier te donne le code d\'un objet, tape-le dans l\'onglet Code : il apparaîtra ici.') + '</p>');
  return s + M.plusDAction();
}
/* L'onglet de l'Alchimiste : seulement l'atelier, en plein écran (entre le bandeau du haut et les onglets du bas).
   Tout se fait en touchant l'image : potions (armoire), analyses (table d'analyse), recettes (grimoire), chaudron. */
M.atelierPlein = function(){ return !!window.Atelier && M.role() === 'alchimiste'; };
M.ongletAlchimiste = function(){
  if(!window.Atelier) return atelierClassique();
  return '<div id="atelier-ici" class="b-atelier-montage b-atelier-plein"></div>';
};
/* Les objets reçus, pour la table d'analyse de l'atelier */
M.analysesAtelier = function(){
  var E = M.E(), P = M.P();
  if(!E || !P) return [];
  return M.cle(P.recus).filter(function(k){ return k.indexOf('obj:') === 0 && E.objets && E.objets[k.slice(4)]; }).map(function(k){
    var id = k.slice(4), o = E.objets[id], A = M.texteAnalyse((E.analyses || {})[id] || {}), fait = P.analyses[id] || 0;
    /* attend : rien à analyser pour cet objet, ou pas encore son tour au tutoriel (il patiente sur le cuir) — pas de signe « À analyser ! » pour lui */
    var attend = !fait && (!(E.analyses || {})[id] || !!(M.tutoPermet && !M.tutoPermet('analyser', {id:id})));
    return {id:id, ic:o.ic, nom:o.nom, fait:fait, attend:attend, t:fait ? A.t || '' : '', detail:fait === 2 && A.detail ? A.detail.t : ''};
  });
};

/* ---------- Onglet Barde : les habitants ---------- */
M.ongletBarde = function(){
  if(M.liegeHTML) return M.liegeHTML();   /* le tableau de liège (liege.js) remplace la liste des habitants */
  var E = M.E(), P = M.P(), mid = M.momentId();
  var s = '<section class="b-habitants"><h2>🎭 Les habitants</h2><p class="doux petit">Où est chacun en ce moment ? Quand quelqu\'un est chez lui, touche sa maison sur la carte : son visage est dessus.</p><div class="b-gens">';
  M.cle(E.pnj || {}).filter(function(id){ return id !== 'voisin'; }).forEach(function(id){
    var o = E.pnj[id].ou || {}, l = o[mid], x = D.PNJ[id], chez = !!l && /^[LFB]\d$/.test(l);
    var ou = !l ? 'On ne sait pas' : chez ? '🏠 ' + M.chezLui(id).charAt(0).toUpperCase() + M.chezLui(id).slice(1) + ' (' + M.adresse(l) + ')' : M.icLieu(l) + ' ' + M.nomLieu(l);
    var dits = (E.pnj[id].questions || []).filter(function(q, i){ return P.vus['barde:' + id + ':' + i]; }).length;
    s += '<div class="b-gens-carte"><div class="b-gens-img">' + M.pnjImg(id) + '</div><b>' + esc(x.court) + '</b><small>' + esc(x.metier) + '</small><span class="b-ou">' + esc(ou) + '</span>' +
      (dits ? '<small class="doux">💬 ' + dits + ' réponse' + (dits > 1 ? 's' : '') + '</small>' : '') +
      (P.conv[id] === P.moment ? '<button class="btn petit second" data-act="parler" data-id="' + id + '">💬 Continuer</button>' : (l && !chez ? '<button class="btn petit second" data-act="lieu" data-id="' + l + '">📍 Y aller</button>' : chez ? '<button class="btn petit second" data-act="maison" data-id="' + l + '">🚪 Frapper</button>' : '')) + '</div>';
  });
  s += '</div>';
  var objs = M.cle(P.recus).filter(function(k){ return k.indexOf('obj:') === 0; });
  if(objs.length) s += '<h3>Objets à montrer</h3><div class="b-recus">' + objs.map(function(k){ var n = M.nomCode(k); return '<span class="b-puce-ingr">' + n.ic + ' ' + esc(n.nom) + '</span>'; }).join('') + '</div>';
  s += M.objetsTrouves().indexOf('b-objet-code') >= 0 ? M.objetsTrouves() : '';
  s += M.potionsRecues() + M.equipementUtile();
  return s + '</section>';
};

/* ---------- Onglet Sage : le Grand Livre ---------- */
M.ongletSage = function(){
  if(M.livreHTML) return M.livreHTML();   /* le vrai livre dont on tourne les pages (livre.js) ; ce qui suit ne sert plus que de secours */
  var E = M.E(), P = M.P();
  var pages = (M.pageTableau ? [M.pageTableau()] : []).concat(E.pages || []);   /* 📋 Mon tableau d'enquête en premier (tableau.js) */
  var cur = UI.page && pages.filter(function(p){ return p.id === UI.page; })[0] || pages[0];
  var s = '<section class="b-livre"><h2>📖 Le Grand Livre</h2><nav class="b-livre-onglets">' + pages.map(function(p){
    var ferme = p.besoin && !P.pages[p.id] && !M.besoinOk(p.besoin);
    return '<button class="' + (cur && cur.id === p.id ? 'on' : '') + (ferme ? ' ferme' : '') + '" data-act="page" data-id="' + p.id + '">' + p.ic + ' ' + esc(p.titre) + (ferme ? ' 🔒' : '') + '</button>';
  }).join('') + '</nav>';
  if(cur) s += '<article class="parchemin b-page-livre">' + (cur.tableau && M.tableauHTML ? M.tableauHTML() : pageHTML(cur)) + '</article>';
  s += M.objetsTrouves().indexOf('b-objet-code') >= 0 ? M.objetsTrouves() : '';
  s += M.potionsRecues();
  return s + '</section>';
};
function pageHTML(p){
  var E = M.E(), P = M.P();
  var s = '<h3>' + p.ic + ' ' + esc(p.titre) + '</h3>';
  if(p.type === 'registre'){
    s += '<p class="petit">Le registre des habitants de Brumeval.</p><div class="b-registre">' + M.cle(E.registre).map(function(id){
      var x = D.PNJ[id], r = E.registre[id], a = r.maison ? M.adresse(r.maison) : (r.adresse || '');
      return '<div class="b-reg-ligne"><div class="b-reg-img">' + M.pnjImg(id) + '</div><div><b>' + esc(x.nom) + '</b> · <i>' + esc(x.metier) + '</i>' +
        '<p class="petit">' + (a ? '🏠 ' + esc(a) + ' · ' : '') + (x.pied ? '👣 pieds de ' + x.pied + ' carreaux' : '') + '</p>' +
        (r.note ? '<p class="petit">' + esc(r.note) + '</p>' + lire(r.note) : '') + '</div></div>';
    }).join('') + '</div>';
    s += M.lireBtn(M.cle(E.registre).map(function(id){ var x = D.PNJ[id], r = E.registre[id]; return x.nom + ', ' + x.metier + '. ' + (r.maison ? 'Habite au ' + M.adresse(r.maison) + '. ' : '') + (x.pied ? 'Pieds de ' + x.pied + ' carreaux. ' : '') + (r.note || ''); }).join(' '));
    return s;
  }
  var ouvert = P.pages[p.id];
  if(p.type === 'lettres' && (ouvert || !(p.besoin || p.action || p.mj))){
    if(p.t) s += '<p class="petit">' + esc(p.t) + '</p>' + lire(p.t);
    s += '<div class="b-lettres">' + (p.lettres || []).map(function(l){
      return '<div class="b-lettre-corbeau' + (l.signe ? ' signee' : '') + '"><span class="ecriture">' + M.ecriture(l.texte, l.pt) + '</span>' +
        (l.signe ? '<span class="b-signe ecriture">' + M.ecriture(l.signe, l.pt) + '</span>' : '<span class="b-plume">🪶</span>') + '</div>';
    }).join('') + '</div>' + M.lireBtn(p.t || '');
    if(p.donne){
      var n0 = M.nomCode(p.donne), td0 = M.texteDonne(p.donne);
      s += '<div class="b-donne"><p>' + n0.ic + ' <b>' + esc(n0.nom) + '</b> : ' + esc(td0) + ' ' + lire(n0.nom + ' : ' + td0) + '</p>' + M.codeHTML(M.code(p.donne)) + '</div>';
    }
    return s;
  }
  if(!ouvert){
    if(p.besoin && !M.besoinOk(p.besoin)){
      return s + '<p>' + esc(p.avant || 'Cette page est fermée.') + '</p>' + M.lireBtn(p.avant || '') + M.besoinHTML(p.besoin, 'sage');
    }
    if(p.besoin || p.action || p.mj){
      return s + (p.avant ? '<p>' + esc(p.avant) + '</p>' + lire(p.avant) : '') + '<button class="btn" data-act="ouvrir-page" data-id="' + p.id + '"' + (p.action && !M.peutAgir() ? ' disabled' : '') + '>' +
        (p.mj ? '🎮 ' : '📖 ') + (p.bouton || 'Ouvrir la page') + (p.action ? M.coutTxt() : '') + '</button>';
    }
  }
  s += '<div class="b-texte-page">' + (p.html || '<p>' + esc(p.t) + '</p>') + '</div>' + M.lireBtn(p.t || '');
  if(p.donne && (P.pages[p.id] || !p.besoin)){
    var n = M.nomCode(p.donne), td = M.texteDonne(p.donne);
    s += '<div class="b-donne"><p>' + n.ic + ' <b>' + esc(n.nom) + '</b> : ' + esc(td) + ' ' + lire(n.nom + ' : ' + td) + '</p>' + M.codeHTML(M.code(p.donne)) + '</div>';
  }
  return s;
}
})();
