/* ==========================================================
   Brumeval — les grands dialogues du Barde, la fête et « Retenir le maire » (enquête 3 : E.grands, E.retenir, E.fete, e3.js ;
   Bible § 13.8 et § 13.14 ; E3-dialogues-et-trame.md §3.1, §4.1 à §4.4, §4.7)

   · Un grand dialogue : 3 étapes de 4 choix, tous polis ; un seul essai. On y entre par une question (q.grand, barde.js), sauf Léo
     (le code « Léo attrapé » du Pisteur). Il ne compte pas dans les 2 questions par visite. Un mauvais choix : sa réplique (un
     malentendu d'Anselme…), puis la phrase d'échec ; G.fermeVisite : la porte se ferme jusqu'au moment suivant ; G.chances = 2 :
     une deuxième chance (la Grosse Marie), les mauvaises réponses déjà essayées ont disparu.
   · La fête (la nuit, sur la place) : chacun dit une réplique, gratuitement ; quelques-unes sont des indices, notés dans le Carnet.
   · Retenir le maire : trois petits dialogues d'une étape, à la fête, au rythme du Barde (sans minuteur).
   État : P.grands[g] = {e (étape), vus:{'e:k'}, r (la dernière réplique), fini:''|'ok'|'rate'|'piege'|'encore'|'leo', essais, ok, ment}
          P.grands.retenir = {k, res:[], apres:[], fini, montre} ; P.fete = {vus:{}, n (visites à la fête, sauf le maire)}
          P.vus['grand:' + g] = 'ok' | 'rate' | 'piege' (pour les conditions : la question de la Grosse Marie, le maire à retenir…)
   La fenêtre : UI.modal = {type:'grand', g, vue:'fete', qui, r} (moteur-actions.js, contenuModal). Chargé après barde.js et marche.js.
   ========================================================== */
(function(){
'use strict';
var M = window.M, D = window.DONNEES;
if(!M || !M.A) return;
var A = M.A, UI = M.UI;
function B(){ return M.barde || {}; }
function esc(s){ return M.esc(s); }
function lire(t, qui){ return M.lireBtn(t, qui); }
function EN(){ try{ return M.S && M.S.e ? M.E() : null; }catch(e){ return null; } }
function Gd(g){ var x = EN(); return (x && x.grands && x.grands[g]) || null; }
function R(){ var x = EN(); return (x && x.retenir) || null; }
function F(){ var x = EN(); return (x && x.fete) || null; }
function barde(){ var P = M.P(); return !!(P && M.role() === 'barde' && P.etape === 'jeu' && !P.defaite && !P.resolu); }
function nom(id){ return (D.PNJ[id] && D.PNJ[id].court) || id; }
function etat(g){ var P = M.P(); P.grands = P.grands || {}; return P.grands[g] || (P.grands[g] = {e:0, vus:{}, r:'', fini:'', essais:0, ok:0}); }
function cite(t){ return !t ? '' : /«/.test(t) ? t : '« ' + t + ' »'; }
/* la réplique d'un choix : ses paroles (entre « », sauf si elles sont déjà mêlées au récit), puis le petit récit */
function dire(c){ return [cite(c.r || ''), c.n || ''].filter(Boolean).join(' '); }
/* (un objet — obj:lettre — se range sous son nom, une info sous « _info:… » : le Carnet et l'onglet des codes les retrouvent ainsi) */
function donner(code, note, ic){ var P = M.P(); if(code) P.objets[code.indexOf('obj:') === 0 ? code.slice(4) : '_' + code] = true; if(note) M.noter(note, ic); }
function visage(id){
  if(B().visage){ try{ return B().visage(id); }catch(e){} }
  return '<span class="bd-emoji">' + ((D.PNJ[id] && D.PNJ[id].ic) || '🙂') + '</span>';
}
function tete(id){ return '<div class="ma-tete"><div class="ma-visage gd-visage" id="gd-visage">' + visage(id) + '</div><h2>' + esc((D.PNJ[id] || {}).nom || id) + '</h2></div>'; }
/* la réplique qui se joue (le visage parle, le texte s'écrit : apresRendu) ; une seule par fenêtre */
function ligne(t, qui, ment){
  var k = (UI.modal ? (UI.modal.g || UI.modal.vue || '') + ':' + (UI.modal.qui || '') : '') + '|' + t;
  var joue = UI.gdJoue === k || !B().jouerLigne;
  return '<p class="ma-dit"><span id="gd-texte" data-k="' + esc(k) + '" data-p="' + esc(qui) + '" data-t="' + esc(t) + '"' + (ment ? ' data-ment="1"' : '') + '>' + (joue ? esc(t) : '') + '</span> ' + lire(t, qui) + '</p>';
}
function recit(t){ return t ? '<p class="ma-dit ma-conteur gd-recit">' + esc(t) + ' ' + lire(t) + '</p>' : ''; }
/* (12 novembre au soir ; Romain, 21 h 44 : « les grands dialogues, tu les fais apparaître différemment ») le bandeau d'un grand dialogue,
   en haut de sa fenêtre : son nom, et un petit rond par étape (les étapes réussies sont pleines). La fenêtre a aussi son cadre doré à
   elle (gd-fenetre, grands.css). */
function bandeau(X, st){
  var n = (X.etapes || []).length, fait = st.fini === 'ok' ? n : (st.ok || 0), h = '';
  for(var i = 0; i < n; i++) h += '<i class="' + (i < fait ? 'fait' : i === st.e && !st.fini ? 'ici' : '') + '"></i>';
  return '<div class="gd-bandeau"><b>🎭 Grande conversation</b>' + (n ? '<span class="gd-pas" aria-hidden="true">' + h + '</span>' : '') + (st.fini ? '' : '<small>un seul essai</small>') + '</div>';
}
function choixHTML(l, act, cacher){
  var h = '<p class="bd-choix-sous">Qu\'est-ce que tu réponds ?</p><div class="ma-choix">';
  l.forEach(function(c, k){
    if(cacher && cacher(k)) return;
    h += '<div class="ma-ligne"><button class="b-question bd-facon" data-act="' + act + '" data-k="' + k + '"><span>🗨️</span><b>« ' + esc(c.q) + ' »</b></button>' + lire(c.q) + '</div>';
  });
  return h + '</div>';
}

/* ==========================================================
   Les grands dialogues
   ========================================================== */
M.grandOuvrir = function(g){
  var X = Gd(g); if(!X || !barde()) return;
  var st = etat(g); if(st.fini === 'encore'){ st.fini = ''; st.r = ''; }
  M.sauver();
  M.ouvrir({type:'grand', g:g, classe:'b-feuille-conv' + (X.scene ? '' : ' gd-fenetre'), fixe:g === 'leo' && !st.fini});
};
A['gd-ouvrir'] = function(el){ M.son('clic'); M.grandOuvrir(el.dataset.g); };
A['gd-reprendre'] = function(el){ var g = el.dataset.g, st = etat(g); if(st.fini !== 'encore') return; M.son('clic'); M.grandOuvrir(g); };

function grandHTML(m){
  var g = m.g, X = Gd(g), st = etat(g); if(!X) return '';
  var id = X.pnj, h = '<div class="ma-feuille gd-feuille">' + (X.scene ? '' : bandeau(X, st)) + tete(id);
  /* Léo ment d'entrée : « 🤥 Mensonge ? » (son signe, épinglé par Farinel), ou on continue
     (12 novembre au soir : plus à l'enquête 3, où Léo est une scène sans choix — X.scene, sceneLeo plus bas) */
  if(g === 'leo' && !X.scene && !st.ment){
    return h + recit(X.intro) + ligne(cite(X.ment.a), id, true) +
      '<div class="gd-ment-btns"><button class="btn petit bd-ment-p" data-act="gd-leo-ment">🤥 Mensonge ?</button><button class="btn grand" data-act="gd-leo-suite">▶ Continuer</button></div></div>';
  }
  if(g === 'leo' && !X.scene && st.ment === 'vrai')
    return h + ligne(cite(X.ment.vrai), id) + '<p class="bd-tag-ment">🤥 Mensonge démasqué</p><button class="btn grand" data-act="gd-leo-suite">▶ Continuer</button></div>';
  if(X.scene && !st.fini) return h + recit(X.intro) + '<button class="btn grand" data-act="fermer">D\'accord</button></div>';
  if(st.fini){
    h += (X.scene ? recit(X.intro) : '') + ligne(st.r, id);
    if(g === 'leo'){
      /* (étape 7) ce que Léo a dit part chez le Sage : « ✨ La suite » montre le code (fins[n].code) */
      var fL = st.n >= 0 ? X.fins[st.n] : null, orL = st.or ? '<div class="ma-gain ma-or"><span>🪙 +' + st.or + ' pièces d\'or</span></div>' : '';
      if(fL && fL.code) return h + orL + '<button class="btn grand b-aller" data-act="gd-leo-code">✨ La suite</button></div>';
      return h + recit(st.n > 0 ? X.apres : (X.apresRien || X.apres)) + orL + '<button class="btn grand" data-act="fermer">D\'accord</button></div>';
    }
    var S = st.fini === 'ok' ? X.reussi : st.fini === 'piege' ? X.piege : st.fini === 'rate' ? X.echec : null;
    if(S && S.code) return h + '<button class="btn grand b-aller" data-act="gd-suite" data-g="' + g + '">' + esc(S.bouton || '✨ La suite') + '</button></div>';
    return h + '<button class="btn grand" data-act="gd-retour" data-id="' + id + '">D\'accord</button></div>';
  }
  var et = X.etapes[st.e];
  h += ligne(st.r || cite(et.t), id);
  return h + choixHTML(et.choix, 'gd-choix', function(k){ return !!st.vus[st.e + ':' + k]; }) + '</div>';
}
/* un mauvais choix ferme la porte jusqu'au moment suivant (G.fermeVisite) : ses questions de la visite sont épuisées (barde.js) */
function fermerVisite(id){
  var P = M.P(), n = (EN() || {}).parVisite || 0; if(!n) return;
  P.visites = P.visites || {};
  var v = P.visites[id]; if(!v || v.m !== P.moment) v = P.visites[id] = {m:P.moment, sait:[], q:1};
  v.q = 1; v.n = Math.max(v.n || 0, n);
}
function finir(g, res){
  var X = Gd(g), st = etat(g), P = M.P();
  /* 'grand:g:fini' : fini, quel que soit le résultat (une condition {vu} ne compte pas 'rate' : moteur-base.js) */
  st.fini = res; P.vus['grand:' + g] = res; P.vus['grand:' + g + ':fini'] = 1;
  var S = res === 'ok' ? X.reussi : res === 'piege' ? X.piege : res === 'rate' ? X.echec : null;
  var resume = (X.resume || {})[res];
  if(resume) M.noter(resume, (D.PNJ[X.pnj] || {}).ic);
  if(S && S.code) donner(S.code);
}
A['gd-choix'] = function(el){
  var m = UI.modal; if(!m || m.type !== 'grand' || !m.g) return;
  var g = m.g, X = Gd(g), st = etat(g), P = M.P(); if(!X || st.fini || !barde()) return;
  var k = +el.dataset.k, et = X.etapes[st.e], c = et && et.choix[k]; if(!c || st.vus[st.e + ':' + k]) return;
  var toujours = X.toujours ? ' ' + cite(X.toujours) : '';
  if(c.bon){
    st.ok++;
    if(st.e + 1 < X.etapes.length){ st.e++; st.r = dire(c); M.son('clic'); }
    else if(g === 'leo') finLeo(c);
    else { st.r = dire(c) + toujours; finir(g, 'ok'); M.son('ok'); }
  } else if(c.piege){
    st.r = dire(c) + toujours; finir(g, 'piege'); M.son('clic');
  } else if(g === 'leo'){
    finLeo(c);
  } else {
    st.vus[st.e + ':' + k] = 1; st.essais++;
    st.r = [dire(c), cite(X.rate)].filter(Boolean).join(' ') + toujours;
    if(X.chances && st.essais < X.chances){ st.fini = 'encore'; if(X.resume && X.resume.encore) M.noter(X.resume.encore, (D.PNJ[X.pnj] || {}).ic); }
    else { finir(g, 'rate'); if(X.fermeVisite) fermerVisite(X.pnj); }
    M.son('ko');
  }
  M.sauver(); M.render();
};
/* après une réussite (ou le piège, ou Tim qui montre le puits) : le code, dans une découverte ; puis retour à la conversation */
A['gd-suite'] = function(el){
  var g = el.dataset.g, X = Gd(g), st = etat(g); if(!X) return;
  var S = st.fini === 'ok' ? X.reussi : st.fini === 'piege' ? X.piege : st.fini === 'rate' ? X.echec : null; if(!S) return;
  M.decouvrir({ic:S.qui ? (D.PNJ[S.qui] || {}).ic : X.ic, titre:S.titre, t:S.t, code:S.code, retour:'gd-retour', retourId:X.pnj});
};
A['gd-retour'] = function(el){
  var P = M.P(), id = el.dataset.id;
  if(P && id && M.retourConv){ UI.bdRetour = {id:id, m:P.moment}; if(M.retourConv()) return; }
  M.fermer();
};

/* ---------- Léo ---------- */
A['gd-leo-ment'] = function(){
  var X = Gd('leo'), st = etat('leo'), P = M.P(); if(!X || st.ment) return;
  st.ment = 'vrai'; P.vus['verite:leo'] = 1;
  M.noter(X.ment.noteVrai, '🤥'); M.son('ok'); M.sauver(); M.render();
};
A['gd-leo-suite'] = function(){ var st = etat('leo'); if(st.ment === 'fait') return; st.ment = 'fait'; M.son('clic'); M.sauver(); M.render(); };
function finLeo(c){
  var X = Gd('leo'), st = etat('leo'), P = M.P(), n = Math.min(st.ok, X.fins.length - 1), f = X.fins[n];
  st.fini = 'leo'; st.n = n; st.r = [dire(c), f.t].filter(Boolean).join(' ');
  P.vus['grand:leo'] = n >= X.fins.length - 1 ? 'ok' : 'rate'; P.vus['grand:leo:fini'] = 1; P.vus['leo:etapes'] = n + 1;   /* (+1 : 0 serait « pas vu ») */
  if(f.or){ st.or = f.or; M.S.or = (M.S.or || 0) + f.or; }
  if(f.code) donner(f.code);   /* (étape 7) « Ce que Léo a dit », pour le Sage */
  M.noter('Léo, dans la crypte : ' + f.t, '🧑');
  M.son(n ? 'ok' : 'ko');
  if(UI.modal && UI.modal.type === 'grand') UI.modal.fixe = false;
}
/* (12 novembre au soir) Léo, une scène sans choix (X.scene) : le code « Léo attrapé » la joue tout de suite. Le Barde apprend qui est
   l'homme en cape ; « Ce que Léo a dit » (fins[0].code) part chez le Sage. */
function sceneLeo(){
  var X = Gd('leo'), st = etat('leo'), P = M.P(), f = X.fins[0];
  st.fini = 'leo'; st.n = 0; st.ment = 'fait'; st.r = f.t;
  P.vus['grand:leo'] = 'ok'; P.vus['grand:leo:fini'] = 1; P.vus['leo:etapes'] = 1;
  if(f.code) donner(f.code);
  M.noter('Léo, dans la crypte : ' + f.t, '🧑');
}
A['gd-leo-code'] = function(){
  var X = Gd('leo'), st = etat('leo'), f = X && st.n >= 0 ? X.fins[st.n] : null; if(!f || !f.code) return;
  M.decouvrir({ic:'🧑', titre:X.titreCode || 'Ce que Léo a dit', t:X.apresCode || X.apres, code:f.code});
};
/* le code du Pisteur : « Léo attrapé » ouvre le dialogue tout de suite ; « Léo s'est enfui » : la scène, sans dialogue */
var cs0 = M.codeSpecial;
M.codeSpecial = function(t, x, id){
  try{
    var X = Gd('leo');
    if(X && t === 'info' && (x === 'leo_attrape' || x === 'leo_enfui') && M.role() === 'barde'){
      var P = M.P(), st = etat('leo');
      if(P.recus[id]){
        if(x === 'leo_attrape' && (!st.fini || (X.scene && st.n >= 0))){ M.grandOuvrir('leo'); return true; }   /* (la scène se revoit en retapant le code) */
        M.ouvrir({type:'info', ic:'👍', titre:'Déjà reçu', t:'Tu as déjà ce code.'}); return true;
      }
      P.recus[id] = true; M.son('gain');
      if(x === 'leo_enfui' || st.fini){
        if(!st.fini){ st.fini = 'leo'; st.n = -1; P.vus['grand:leo'] = 'enfui'; P.vus['grand:leo:fini'] = 1; }
        M.noter('Léo s\'est enfui : ' + X.enfui, '🏃'); M.sauver();
        M.ouvrir({type:'info', ic:'🏃', titre:'Léo s\'est enfui', t:X.enfui + ' ' + (X.apresRien || X.apres)}); return true;
      }
      M.noter(X.scene ? 'Tes amis ont coincé l\'homme en cape, au fond des souterrains.' : 'Le Pisteur a attrapé Léo dans la crypte.', '🧑');
      if(X.scene) sceneLeo();
      M.sauver();
      M.grandOuvrir('leo'); return true;
    }
  }catch(e){ console.error(e); }
  return cs0 ? cs0.apply(this, arguments) : false;
};

/* ---------- La boîte de la question, dans la conversation (barde.js, M.feuilleConv) ----------
   pas encore posée : comme une question ; commencée : « Reprendre » ; finie : la dernière réplique, et ce qui s'est passé */
M.grandBoite = function(id, i, q, posee){
  var X = Gd(q.grand); if(!X) return null;
  var P = M.P(), st = (P.grands || {})[q.grand];
  /* (12 novembre au soir) elle ne ressemble pas aux autres questions : son étiquette « 🎭 Grande conversation », son cadre doré et son
     petit reflet qui passe (gd-q, grands.css). Elle n'arrive que quand tout a été demandé (q.besoin : {toutDit}, barde.js). */
  var tag = '<small class="gd-tag">🎭 Grande conversation</small>';
  if(!posee || !st) return '<button class="b-question bd-boite bd-a-poser gd-q gd-neuve" data-act="question" data-p="' + id + '" data-i="' + i + '">' + tag + '<b>' + esc(q.q) + '</b></button>';
  if(!st.fini) return '<button class="b-question bd-boite bd-a-poser gd-q gd-neuve" data-act="gd-ouvrir" data-g="' + q.grand + '">' + tag + '<b>' + esc(q.q) + '</b><small class="gd-reprendre">💬 Reprendre la conversation</small></button>';
  var res = (X.resume || {})[st.fini] || '';
  var h = '<details class="b-question repondue bd-boite gd-q" name="bdq-' + id + '"' + (st.fini === 'encore' ? ' open' : '') + '><summary><b>' + esc(q.q) + '</b></summary><div class="bd-boite-in"><div class="bd-cadre">' +
    '<p class="b-reponse">' + esc(st.r) + '</p>' + (res ? '<p class="gd-resume">' + esc(res) + '</p>' : '') + '<div class="bd-rep-outils">' + lire(st.r, id) + '</div></div>';
  if(st.fini === 'encore') h += '<button class="btn b-aller gd-encore" data-act="gd-reprendre" data-g="' + q.grand + '">🔁 Revenir à la charge</button>';
  return h + '</div></details>';
};

/* ==========================================================
   La fête (la nuit, sur la place)
   ========================================================== */
function feteIci(lieu){ var f = F(); return !!(f && barde() && lieu === f.lieu && M.momentOk(f.moments)); }
function feteN(){ var P = M.P(); return (P && P.fete && P.fete.n) || 0; }
function filetActif(id){
  var f = F(), x = f && f.gens[id], P = M.P(); if(!x || !x.filet) return false;
  if(P.vus['fete:filet:' + id]) return true;
  return !(P.objets['_' + x.filet.sauf] || (P.recus && P.recus[x.filet.sauf]));
}
var FETE_TXT = 'Tout le village danse sous les lampions. Chacun a un mot à te glisser à l\'oreille !';
function feteHTML(lieu){
  if(!feteIci(lieu)) return '';
  var f = F(), P = M.P(), Rt = R(), vus = (P.fete && P.fete.vus) || {};
  var h = '<p class="sur-titre">🎉 La fête</p><p class="doux gd-fete-intro">' + esc(FETE_TXT) + ' ' + lire(FETE_TXT) + '</p><div class="b-gens">';
  /* le maire qui cherche le Barde passe en premier (sinon, tout en bas, on ne le voyait pas sans faire défiler) */
  var ids = M.cle(f.gens), cherche = Rt && retenirDispo();
  if(cherche) ids = [Rt.pnj].concat(ids.filter(function(id){ return id !== Rt.pnj; }));
  ids.forEach(function(id){
    if(!D.PNJ[id]) return;
    var appel = cherche && id === Rt.pnj;
    h += '<div class="b-gens-carte' + (appel ? ' gd-appel' : '') + '"><div class="b-gens-img">' + M.pnjImg(id) + '</div><b>' + esc(nom(id)) + '</b>' +
      (appel ? '<small class="gd-appel-t">❗ Il te cherche</small>' : '') +
      '<button class="btn petit' + (vus[id] && !appel ? ' second' : appel ? ' b-aller' : '') + '" data-act="gd-fete" data-id="' + id + '">' + (appel ? '❗ Y aller' : vus[id] ? '🎉 Encore' : '🎉 Lui parler') + '</button></div>';
  });
  return h + '</div>';
}
A['gd-fete'] = function(el){
  var id = el.dataset.id, f = F(), x = f && f.gens[id], P = M.P(), Rt = R(); if(!x || !barde() || !M.momentOk(f.moments)) return;
  if(Rt && id === Rt.pnj && retenirDispo()){ M.son('porte'); M.ouvrir({type:'grand', g:'retenir', classe:'b-feuille-conv gd-fenetre'}); return; }
  P.fete = P.fete || {vus:{}, n:0};
  if(!Rt || id !== Rt.pnj) P.fete.n++;
  var premiere = !P.fete.vus[id]; P.fete.vus[id] = 1;
  if(filetActif(id) && !P.vus['fete:filet:' + id]){ P.vus['fete:filet:' + id] = 1; donner(x.filet.code, x.filet.note, (D.PNJ[id] || {}).ic); }
  else if(premiere && x.note) M.noter(x.note, (D.PNJ[id] || {}).ic);
  M.son('clic'); M.sauver();
  M.ouvrir({type:'grand', vue:'fete', qui:id, classe:'b-feuille-conv'});
};
function feteVueHTML(m){
  var f = F(), id = m.qui, x = f.gens[id], fil = P_vus('fete:filet:' + id) && x.filet;
  var h = '<div class="ma-feuille gd-feuille">' + tete(id) + ligne(cite(fil ? x.filet.t : x.t), id);
  if(fil) return h + '<button class="btn grand b-aller" data-act="gd-fete-code" data-id="' + id + '">✨ La suite</button></div>';
  return h + '<button class="btn grand" data-act="fermer">D\'accord</button></div>';
}
function P_vus(k){ var P = M.P(); return !!(P && P.vus && P.vus[k]); }
A['gd-fete-code'] = function(el){
  var id = el.dataset.id, x = (F() || {gens:{}}).gens[id]; if(!x || !x.filet) return;
  M.decouvrir({ic:(D.PNJ[id] || {}).ic, titre:nom(id) + ' craque', t:cite(x.filet.t), code:x.filet.code});
};
/* à la fête, le Barde ne voit pas les fêtards parmi les « occupés » : ils sont dans la fête (feteHTML) */
var poi0 = M.pnjOccupesIci;
if(poi0) M.pnjOccupesIci = function(lieu){
  var l = poi0.apply(this, arguments);
  try{ if(feteIci(lieu)){ var g = F().gens; l = l.filter(function(id){ return !g[id]; }); } }catch(e){ console.error(e); }
  return l;
};
var lb0 = M.lieuBarde;
if(lb0) M.lieuBarde = function(lieu){
  var s = lb0.apply(this, arguments);
  try{ var f = feteHTML(lieu); if(f) s = f + s.replace(/<p class="doux">Il n'y a personne ici en ce moment\.[\s\S]*?<\/p>/, ''); }catch(e){ console.error(e); }
  return s;
};

/* ==========================================================
   Retenir le maire (à la fête, pendant le donjon)
   ========================================================== */
function retenirEtat(){ var P = M.P(); P.grands = P.grands || {}; return P.grands.retenir || (P.grands.retenir = {k:0, res:[], apres:[], fini:''}); }
function retenirDispo(){
  var Rt = R(), f = F(); if(!Rt || !f || !barde() || !M.momentOk(f.moments) || !M.besoinOk(Rt.besoin)) return false;
  var st = retenirEtat(); if(st.fini || st.k >= Rt.dialogues.length) return false;
  return st.k === 0 || feteN() > (st.apres[st.k - 1] || 0);
}
M.retenirDispo = function(){ try{ return retenirDispo(); }catch(e){ return false; } };
function dialogueRet(k){ var d = R().dialogues[k]; return d && d.A ? (M.P().vus['grand:gm'] === 'ok' ? d.A : d.B) : d; }
function retenirHTML(m){
  var Rt = R(), st = retenirEtat(), nR = Rt.dialogues.length, pas = '';
  for(var iR = 0; iR < nR; iR++) pas += '<i class="' + (iR < st.k ? (st.res[iR] ? 'fait' : 'rate') : iR === st.k && !st.fini ? 'ici' : '') + '"></i>';
  var h = '<div class="ma-feuille gd-feuille"><div class="gd-bandeau"><b>🎭 Retenir le maire</b><span class="gd-pas" aria-hidden="true">' + pas + '</span></div>' + tete(Rt.pnj);
  if(m.r) return h + ligne(m.r, Rt.pnj) + '<button class="btn grand" data-act="gd-ret-ok">D\'accord</button></div>';
  var d = dialogueRet(st.k); if(!d) return h + '</div>';
  return h + ligne(cite(d.t), Rt.pnj) + choixHTML(d.choix, 'gd-ret') + '</div>';
}
A['gd-ret'] = function(el){
  var m = UI.modal, Rt = R(), st = retenirEtat(), P = M.P(); if(!m || m.type !== 'grand' || m.g !== 'retenir' || m.r || !retenirDispo()) return;
  var d = dialogueRet(st.k), c = d && d.choix[+el.dataset.k]; if(!c) return;
  st.res[st.k] = !!c.bon; st.apres[st.k] = feteN(); st.k++;
  var oks = st.res.filter(Boolean).length, kos = st.res.length - oks;
  M.noter(c.bon ? 'Le maire, à la fête : tu l\'as retenu sur la place.' : 'Le maire, à la fête : il a regardé vers le clocher…', '🎩');
  if(oks >= Rt.n){ st.fini = 'ok'; P.vus['grand:retenir'] = 'ok'; P.vus['grand:retenir:fini'] = 1; donner(Rt.reussi.code, Rt.reussi.t, '🎩'); }
  else if(kos > Rt.dialogues.length - Rt.n){ st.fini = 'rate'; P.vus['grand:retenir'] = 'rate'; P.vus['grand:retenir:fini'] = 1; M.noter(Rt.rate.t, '🎩'); }
  m.r = dire(c); M.son(c.bon ? 'ok' : 'ko'); M.sauver(); M.render();
};
A['gd-ret-ok'] = function(){
  var Rt = R(), st = retenirEtat();
  if(st.fini && !st.montre){
    st.montre = 1; M.sauver();
    if(st.fini === 'ok') M.decouvrir({ic:'🎩', titre:Rt.reussi.titre, t:Rt.reussi.t, code:Rt.reussi.code});
    else M.decouvrir({ic:'🎩', titre:Rt.rate.titre, t:Rt.rate.t, rate:true});
    return;
  }
  M.fermer();
};
/* sur la carte, le maire porte un « ! » quand il cherche le Barde */
var bu0 = M.pnjBulleCarte;
M.pnjBulleCarte = function(id){
  try{ var Rt = R(); if(Rt && id === Rt.pnj && retenirDispo()) return '❗'; if(grandPret(id)) return '🎭'; }catch(e){ console.error(e); }
  return bu0 ? bu0.apply(this, arguments) : '';
};
/* (12 novembre au soir) un grand dialogue vient de s'ouvrir chez ce villageois (tout a été demandé) et il n'est pas fini : « 🎭 » sur son
   visage, sur la carte — on sait où aller, sans qu'aucun texte ne le dise */
function grandPret(id){
  var E = EN(), N = E && E.pnj && E.pnj[id], P = M.P(); if(!N || !P || !barde() || !(N.ou && N.ou[M.momentId()])) return false;
  return (N.questions || []).some(function(q){
    if(!q.grand || !M.momentOk(q.moments) || (q.besoin && !M.besoinOk(q.besoin))) return false;
    var st = (P.grands || {})[q.grand]; return !(st && st.fini && st.fini !== 'encore');
  });
}
M.grandPret = function(id){ try{ return grandPret(id); }catch(e){ return false; } };

/* ---------- La fenêtre ---------- */
M.grandHTML = function(m){
  try{
    if(!EN()) return '';
    if(m.vue === 'fete') return feteVueHTML(m);
    if(m.g === 'retenir') return retenirHTML(m);
    return grandHTML(m);
  }catch(e){ console.error(e); return ''; }
};
/* après chaque rendu : la réplique se joue (le visage parle, le texte s'écrit) une seule fois */
function apresRendu(){
  var m = UI.modal; if(!m || m.type !== 'grand') return;
  var box = document.getElementById('gd-visage'), bulle = document.getElementById('gd-texte');
  if(!box || !bulle || !B().jouerLigne) return;
  var k = bulle.getAttribute('data-k'); if(!k || UI.gdJoue === k) return;
  UI.gdJoue = k;
  try{ B().jouerLigne(box, bulle, bulle.getAttribute('data-p'), bulle.getAttribute('data-t') || '', bulle.getAttribute('data-ment') === '1'); }
  catch(e){ console.error(e); bulle.textContent = bulle.getAttribute('data-t') || ''; }
}
/* (12 novembre au soir) la question d'un grand dialogue arrive en bas de la liste, souvent sous le bord de la fenêtre : la première fois
   qu'elle apparaît dans une conversation, la fenêtre glisse juste assez pour la montrer (la réponse qui s'écrit au-dessus reste visible) */
function montrerNeuve(){
  var m = UI.modal, conv = m && m.type === 'conv' ? m.id : '';
  if(!conv){ UI.gdNeuve = ''; return; }
  var el = document.querySelector('#voile .gd-q.gd-neuve');
  if(!el){ if(UI.gdNeuve === conv) UI.gdNeuve = ''; return; }
  if(UI.gdNeuve === conv) return;
  UI.gdNeuve = conv;
  var doux = !(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  try{ el.scrollIntoView({block:'nearest', behavior:doux ? 'smooth' : 'auto'}); }catch(e){ try{ el.scrollIntoView(false); }catch(e2){} }
}
var r0 = M.render;
M.render = function(){
  var r = r0.apply(this, arguments);
  try{ apresRendu(); }catch(e){ console.error(e); }
  try{ montrerNeuve(); }catch(e){ console.error(e); }
  return r;
};
})();
