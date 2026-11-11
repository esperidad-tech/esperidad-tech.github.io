/* ==========================================================
   Brumeval — le marché aux fleurs du Barde (enquête 3 : E.marche, e3.js ; Bible § 13.6 bis ; E3-dialogues-et-trame.md §2.1 et §3.1)

   Le matin, 2 ou 3 secondes après « Commencer l'enquête 3 », le maire arrive en plein écran sur la tablette du Barde : 10 pièces,
   au moins 10 bouquets. Deux compteurs sur sa carte (💰 l'argent, 💐 les bouquets). Fortuné d'abord (une bulle 🌸 sur son visage) :
   un marchandage en 3 étapes, qui coûte toujours au moins 2 pièces ; ses 4 bouquets en papier se déchirent chez le premier vrai
   fleuriste (ils comptent pour 0) ; la vieille lanterne, selon le chemin. Iris et Basile n'apparaissent sur la carte qu'une fois
   ce marchandage commencé : 4 façons de demander, puis le Barde choisit combien il achète ; un vendeur fâché ne vend plus rien
   de la journée. L'après-midi, s'il reste de l'argent, ils vendent encore, au prix obtenu. Quand le Barde va voir le maire,
   l'après-midi, il compte les bouquets : de l'or selon le nombre, 5 de plus pour la lanterne ; les compteurs disparaissent.

   État : P.marche = {or, b (vrais bouquets), papier, lanterne, dechire, plainte, rendu,
                      f:{e (étape), sait, vus:{}, r (sa dernière réplique), ouvert, fini, res},
                      v:{iris|basile:{prix, fache, fait (vendu ce matin), n}}}
   La fenêtre : UI.modal = {type:'marche', qui:'maire'|'fortune'|'iris'|'basile'|'retour', vue, …} (moteur-actions.js, contenuModal).
   Chargé après barde.js et carte-jeu.js.
   ========================================================== */
(function(){
'use strict';
var M = window.M, D = window.DONNEES;
if(!M || !M.A) return;
var A = M.A, UI = M.UI;
function esc(s){ return M.esc(s); }
function lire(t, qui){ return M.lireBtn(t, qui); }
function X(){ try{ var E = M.S && M.S.e ? M.E() : null; return (E && E.marche) || null; }catch(e){ return null; } }
function barde(){ var P = M.P(); return !!(X() && P && M.role() === 'barde' && P.etape === 'jeu' && !P.defaite && !P.resolu); }
function S(){ var P = M.P(); return (P && P.marche) || null; }
function matin(){ return M.momentId() === 'matin'; }
function nom(id){ return (D.PNJ[id] && D.PNJ[id].court) || id; }
function pieces(n){ return n + (n > 1 ? ' pièces' : ' pièce'); }
function bouquets(n){ return n + (n > 1 ? ' bouquets' : ' bouquet'); }
function V(id){ var s = S(); s.v = s.v || {}; s.v[id] = s.v[id] || {prix:null, fache:false, fait:false, n:0}; return s.v[id]; }
function total(){ var s = S(); return s ? s.b + s.papier : 0; }
function visage(id){
  if(window.Persos && Persos.pnj && Persos.PNJ && Persos.PNJ[id]){ try{ var h = Persos.pnj(id, {anime:true, expressif:true, cadre:'visage', id:'ma' + Date.now() % 100000}); if(h) return h; }catch(e){} }
  return '<span class="bd-emoji">' + ((D.PNJ[id] && D.PNJ[id].ic) || '🙂') + '</span>';
}
var MA = M.marche = {};

/* ---------- Ce que la carte montre ---------- */
/* Iris et Basile : cachés au Barde tant que le marchandage de Fortuné n'a pas commencé */
M.pnjCacheCarte = function(id){
  var x = X(); if(!x || !barde() || !matin() || !x.vendeurs[id]) return false;
  var s = S(); return !(s && s.f && (s.f.ouvert || s.f.fini));
};
/* le vendeur peut-il vendre maintenant ? (Fortuné passe d'abord ; le matin, une seule vente chacun ; fâché : plus rien de la journée) */
function dispo(id){
  var x = X(), s = S(); if(!x || !s || !barde() || s.rendu || !x.vendeurs[id] || !s.f.fini || M.momentId() === 'nuit') return false;
  var v = V(id); if(v.fache) return false;
  if(matin()) return !v.fait;
  /* l'après-midi : s'il reste de quoi payer un bouquet ; ou s'il n'est pas passé le matin (il marchande alors, même sans un sou : le cadeau de Basile) */
  return v.prix === null || s.or >= v.prix;
}
MA.dispo = dispo;
M.vendeurDispo = function(id){ try{ return dispo(id); }catch(e){ return false; } };
M.pnjBulleCarte = function(id){
  var x = X(), s = S(); if(!x || !s || !barde() || s.rendu) return '';
  if(id === 'fortune' && !s.f.fini) return '🌸';
  if(x.vendeurs[id] && dispo(id)) return '🌸';
  if(id === 'grosbec' && M.momentId() === 'apresmidi') return '💐';
  return '';
};
/* les deux compteurs, posés sur la carte du Barde (ils disparaissent quand le maire a compté) */
function compteursDedans(){
  var x = X(), s = S(); if(!x || !s || !barde() || s.rendu) return '';
  return '<span class="ma-c ma-c-or" title="L\'argent du maire">💰 <b>' + s.or + '</b></span><span class="ma-c ma-c-b" title="Les bouquets">💐 <b>' + total() + '</b> sur ' + x.but + '</span>' +
    (s.lanterne ? '<span class="ma-c ma-c-l" title="La vieille lanterne">🏮</span>' : '');
}
function majCompteurs(){ var el = document.getElementById('ma-compteurs'); if(el){ var h = compteursDedans(); el.innerHTML = h ? '<div class="ma-cc">' + h + '</div>' : ''; el.hidden = !h; } }
var oc0 = M.ongletCarteHTML;
if(oc0) M.ongletCarteHTML = function(){
  var h = oc0.apply(this, arguments), c = '';
  try{ c = compteursDedans(); }catch(e){ console.error(e); }
  return (X() && M.role() === 'barde' ? '<div id="ma-compteurs" class="ma-compteurs"' + (c ? '' : ' hidden') + '>' + (c ? '<div class="ma-cc">' + c + '</div>' : '') + '</div>' : '') + h;
};

/* ---------- Le maire arrive (le matin, tant qu'il n'a pas donné l'argent) ---------- */
var tMaire = null;
function guetter(){
  if(tMaire || !barde() || S() || !matin() || UI.ecran !== 'enquete') return;
  tMaire = setTimeout(function(){
    tMaire = null;
    if(!barde() || S() || !matin() || UI.ecran !== 'enquete') return;
    if(UI.modal || M.mjPause){ guetter(); return; }   /* une fenêtre est ouverte : il attend qu'elle se ferme */
    M.son('porte'); M.ouvrir({type:'marche', qui:'maire'});
  }, 2500);
}
function maireHTML(){
  var x = X();
  return '<div class="ma-feuille"><div class="ma-tete"><div class="ma-visage">' + visage('grosbec') + '</div><h2>' + esc(D.PNJ.grosbec.nom) + '</h2></div>' +
    '<p class="ma-dit">« ' + esc(x.maire.t) + ' » ' + lire(x.maire.t, 'grosbec') + '</p>' +
    '<div class="ma-gain"><span>💰 ' + pieces(x.or) + '</span><span>💐 0 sur ' + x.but + '</span></div>' +
    '<button class="btn grand b-aller" data-act="ma-debut">' + esc(x.maire.bouton) + '</button></div>';
}
A['ma-debut'] = function(){
  var P = M.P(), x = X(); if(!P || !x || P.marche) return;
  P.marche = {or:x.or, b:0, papier:0, lanterne:false, rendu:false, f:{e:0, sait:false, vus:{}, r:'', ouvert:false, fini:false}, v:{}};
  M.noter('Le maire t\'a donné ' + pieces(x.or) + ' : il veut au moins ' + x.but + ' bouquets pour la fête de ce soir.', '💐');
  M.son('ok'); UI.modal = null; M.sauver(); M.render();
};

/* ---------- Fortuné : le marchandage en 3 étapes ---------- */
function fortuneHTML(m){
  var x = X().fortune, s = S(), f = s.f;
  /* (une étape avec une image : pas de grand visage au-dessus, l'image le montre déjà, et les réponses restent à l'écran) */
  var avecIllu = !f.fini && !!x.etapes[f.e].illu;
  var s2 = '<div class="ma-feuille"><div class="ma-tete">' + (avecIllu ? '' : '<div class="ma-visage ma-petit">' + visage('fortune') + '</div>') + '<h2>' + esc(D.PNJ.fortune.nom) + '</h2></div>';
  if(f.fini){
    var r = f.res || {};
    return s2 + '<p class="ma-dit">« ' + esc(f.r) + ' » ' + lire(f.r, 'fortune') + '</p>' +
      '<div class="ma-gain"><span>💰 −' + (r.or || 0) + '</span><span>💐 +' + x.papier + '</span>' + (r.lanterne ? '<span>🏮 la lanterne</span>' : '') + '</div>' +
      '<button class="btn grand" data-act="fermer">D\'accord</button></div>';
  }
  var et = x.etapes[f.e], t = f.r || et.t || '';
  if(t) s2 += '<p class="ma-dit">« ' + esc(t) + ' » ' + lire(t, 'fortune') + '</p>';
  if(et.illu && M.illustration){ try{ s2 += '<div class="ma-illu">' + (M.illustration(et.illu) || '') + '</div>'; }catch(e){ console.error(e); } }
  s2 += '<p class="bd-choix-sous">Qu\'est-ce que tu réponds ?</p><div class="ma-choix">';
  et.choix.forEach(function(c, k){
    if(f.vus[f.e + ':' + k]) return;   /* une réponse qui fait rester à la même étape disparaît une fois choisie */
    s2 += '<div class="ma-ligne"><button class="b-question bd-facon" data-act="ma-fortune" data-k="' + k + '"><span>🗨️</span><b>« ' + esc(c.q) + ' »</b></button>' + lire(c.q) + '</div>';
  });
  return s2 + '</div></div>';
}
A['ma-fortune'] = function(el){
  var x = X(), s = S(); if(!x || !s || s.f.fini) return;
  var F = x.fortune, f = s.f, et = F.etapes[f.e], c = et && et.choix[+el.dataset.k]; if(!c || f.vus[f.e + ':' + el.dataset.k]) return;
  var c2 = f.sait && c.siSait ? c.siSait : c;
  if(c.sait) f.sait = true;
  if(c2.fin){
    f.fini = true; f.res = c2.fin; f.r = c2.r;
    s.or = Math.max(0, s.or - (c2.fin.or || 0)); s.papier = F.papier; if(c2.fin.lanterne) s.lanterne = true;
    M.noter('Fortuné t\'a vendu ' + bouquets(F.papier) + ' en papier pour ' + pieces(c2.fin.or || 0) + (c2.fin.lanterne ? ', avec une vieille lanterne cabossée' : '') + '.', '🌸');
    M.son('ok');
  } else if(c.reste){
    f.vus[f.e + ':' + el.dataset.k] = 1; f.r = c.r; M.son('clic');
  } else {
    f.e = c.vers; f.r = c.r + (c.relance ? ' ' + F.relance : ''); M.son('clic');
  }
  M.sauver(); M.render(); majCompteurs();
};

/* ---------- Iris et Basile : 4 façons de demander, puis combien de bouquets ---------- */
function vendeurHTML(m){
  var id = m.qui, x = X(), W = x.vendeurs[id], s = S(), v = V(id);
  var h = '<div class="ma-feuille"><div class="ma-tete"><div class="ma-visage ma-petit">' + visage(id) + '</div><h2>' + esc(D.PNJ[id].nom) + '</h2></div>';
  function dit(t){ return '<p class="ma-dit">« ' + esc(t) + ' » ' + lire(t, id) + '</p>'; }
  if(m.vue === 'dechire')   /* les bouquets en papier de Fortuné se déchirent chez le premier vrai fleuriste */
    return h + dit(x.dechire) + '<div class="ma-gain ma-perte"><span>💐 −' + (m.perdus || 0) + '</span></div><button class="btn grand b-aller" data-act="ma-suite">😮 Oh non…</button></div>';
  if(m.vue === 'choix'){
    h += dit(W.t) + '<p class="bd-choix-sous">Comment tu le demandes ?</p><div class="ma-choix">';
    W.choix.forEach(function(c, k){ h += '<div class="ma-ligne"><button class="b-question bd-facon" data-act="ma-choix" data-k="' + k + '"><span>🗨️</span><b>« ' + esc(c.q) + ' »</b></button>' + lire(c.q) + '</div>'; });
    return h + '</div></div>';
  }
  if(m.vue === 'rep'){
    var c = W.choix[m.k] || {};
    h += dit(c.r || '');
    if(c.fache) return h + '<button class="btn grand" data-act="fermer">D\'accord</button></div>';
    if(c.cadeau) h += '<div class="ma-gain"><span>💐 +' + c.cadeau + ', en cadeau</span></div>';
    return h + '<button class="btn grand b-aller" data-act="ma-suite">💐 Choisir mes bouquets</button></div>';
  }
  if(m.vue === 'quantite'){
    var prix = v.prix || W.prix, max = Math.floor(s.or / prix), n = Math.max(0, Math.min(max, m.n || 0));
    var tq = 'Combien de bouquets ? C\'est ' + pieces(prix) + ' le bouquet.';
    h += '<p class="ma-dit ma-conteur">' + esc(tq) + ' ' + lire(tq) + '</p>' +
      '<div class="ma-qte"><button class="btn ma-pm" data-act="ma-moins"' + (n <= 0 ? ' disabled' : '') + ' aria-label="Un bouquet de moins">−</button>' +
      '<div class="ma-n"><b>' + n + '</b><span>' + (n > 1 ? 'bouquets' : 'bouquet') + '</span></div>' +
      '<button class="btn ma-pm" data-act="ma-plus"' + (n >= max ? ' disabled' : '') + ' aria-label="Un bouquet de plus">+</button></div>' +
      '<p class="ma-cout">💰 ' + pieces(n * prix) + ' sur ' + s.or + '</p>';
    return h + '<button class="btn grand b-aller" data-act="ma-acheter">' + (n ? '💐 Acheter ' + bouquets(n) : '👋 Ne rien acheter') + '</button></div>';
  }
  /* 'merci' */
  return h + dit(m.t || W.merci) + (m.n ? '<div class="ma-gain"><span>💰 −' + m.cout + '</span><span>💐 +' + m.n + '</span></div>' : '') + '<button class="btn grand" data-act="fermer">D\'accord</button></div>';
}
function ouvrirVendeur(id){
  var x = X(), s = S(), v = V(id), m = {type:'marche', qui:id, classe:'b-feuille-conv'};
  if(s.papier > 0){ m.vue = 'dechire'; m.perdus = s.papier; s.papier = 0; s.dechire = 1; M.noter('Les bouquets en papier de Fortuné se sont déchirés chez ' + nom(id) + ' : ils ne comptent pas.', '💐'); M.son('ko'); }
  else m.vue = v.prix === null ? 'choix' : 'quantite';
  if(m.vue === 'quantite') m.n = Math.floor(s.or / (v.prix || x.vendeurs[id].prix));
  M.sauver(); M.ouvrir(m); majCompteurs();
}
A['ma-vendeur'] = function(el){ var id = el.dataset.id; if(!dispo(id)) return; M.son('clic'); ouvrirVendeur(id); };
A['ma-choix'] = function(el){
  var m = UI.modal, x = X(), s = S(); if(!m || m.type !== 'marche' || !x || !s || !x.vendeurs[m.qui] || m.vue !== 'choix') return;
  var W = x.vendeurs[m.qui], v = V(m.qui), c = W.choix[+el.dataset.k]; if(!c) return;
  m.vue = 'rep'; m.k = +el.dataset.k;
  if(c.fache){ v.fache = true; v.fait = true; M.noter(nom(m.qui) + ' s\'est fâché' + (m.qui === 'iris' ? 'e' : '') + ' : « ' + c.q + ' », ce n\'était pas la bonne façon de demander. Plus de fleurs chez ' + (m.qui === 'iris' ? 'elle' : 'lui') + ' aujourd\'hui.', '😤'); M.son('ko'); }
  else {
    v.prix = c.prix || W.prix;
    if(c.cadeau){ s.b += c.cadeau; v.n += c.cadeau; }
    M.noter(nom(m.qui) + (c.cadeau ? ' t\'a offert ' + bouquets(c.cadeau) + '. Ensuite, c\'est ' : ' te vend ses fleurs ') + pieces(v.prix) + ' le bouquet.', '💐');
    M.son(c.prix || c.cadeau ? 'ok' : 'clic');
  }
  M.sauver(); M.render(); majCompteurs();
};
A['ma-suite'] = function(){
  var m = UI.modal, x = X(), s = S(); if(!m || m.type !== 'marche' || !x || !s || !x.vendeurs[m.qui]) return;
  var v = V(m.qui);
  if(m.vue === 'dechire') m.vue = v.prix === null ? 'choix' : 'quantite';
  else if(m.vue === 'rep') m.vue = 'quantite';
  if(m.vue === 'quantite') m.n = Math.floor(s.or / (v.prix || x.vendeurs[m.qui].prix));   /* d'abord tout ce qu'il peut payer : il enlève s'il veut garder des pièces */
  M.son('clic'); M.sauver(); M.render();
};
function pm(d){
  var m = UI.modal, x = X(), s = S(); if(!m || m.type !== 'marche' || m.vue !== 'quantite' || !s) return;
  var prix = V(m.qui).prix || x.vendeurs[m.qui].prix, max = Math.floor(s.or / prix);
  m.n = Math.max(0, Math.min(max, (m.n || 0) + d)); M.son('clic'); M.sauver(); M.render();
}
A['ma-plus'] = function(){ pm(1); };
A['ma-moins'] = function(){ pm(-1); };
A['ma-acheter'] = function(){
  var m = UI.modal, x = X(), s = S(); if(!m || m.type !== 'marche' || m.vue !== 'quantite' || !s) return;
  var W = x.vendeurs[m.qui], v = V(m.qui), prix = v.prix || W.prix, n = Math.max(0, Math.min(Math.floor(s.or / prix), m.n || 0));
  s.or -= n * prix; s.b += n; v.n += n; v.fait = true;
  if(n) M.noter('Tu as acheté ' + bouquets(n) + ' à ' + nom(m.qui) + ' pour ' + pieces(n * prix) + '.', '💐');
  m.vue = 'merci'; m.cout = n * prix; m.n = n; m.t = n ? W.merci : null;
  M.son(n ? 'ok' : 'clic'); M.sauver();
  if(!n){ UI.modal = null; M.render(); majCompteurs(); return; }
  M.render(); majCompteurs();
};
/* le bouton « acheter des fleurs » : sur la pastille d'un vendeur occupé (la feuille du lieu, barde.js), et en bas de sa conversation */
M.occupeBouton = function(id){
  if(!dispo(id)) return '';
  var v = V(id), t = v.prix === null ? '🌸 Acheter des fleurs' : '🌸 Encore des fleurs';
  return '<button class="btn petit b-aller ma-btn-vendeur" data-act="ma-vendeur" data-id="' + id + '">' + t + '</button>';
};
/* ce que dit la pastille d'un vendeur tant qu'il vend (à la place de sa petite phrase d'occupé) */
M.occupeTexte = function(id){ return dispo(id) ? (id === 'iris' ? 'Elle' : 'Il') + ' vend des fleurs pour la fête.' : ''; };
M.convPlus = function(id){
  var x = X(), s = S(), h = ''; if(!x || !s || !barde()) return '';
  if(x.vendeurs[id] && dispo(id)) h += '<button class="btn b-aller ma-btn-conv" data-act="ma-vendeur" data-id="' + id + '">🌸 « ' + esc(x.vendeurs[id].encore) + ' »</button>';
  /* revenir se plaindre chez Fortuné, une fois les bouquets en papier déchirés */
  if(id === 'fortune' && s.f.fini && s.dechire && !s.plainte) h += '<button class="b-question bd-boite bd-a-poser" data-act="ma-plainte"><b>Vos fleurs en papier se sont déchirées !</b></button>';
  return h;
};
A['ma-plainte'] = function(){
  var x = X(), s = S(), P = M.P(); if(!x || !s || s.plainte) return;
  s.plainte = 1;
  M.noter('Fortuné : « ' + x.fortune.plainte + ' »', (D.PNJ.fortune || {}).ic);
  UI.bd = {p:'fortune', mode:'plainte', t:x.fortune.plainte, m:P.moment};
  M.son('clic'); M.sauver(); M.render();
};

/* ---------- L'après-midi : le maire compte les bouquets ---------- */
function palier(n){ var l = X().retour.paliers; for(var i = 0; i < l.length; i++) if(n >= l[i].min) return l[i]; return l[l.length - 1]; }
function retourHTML(m){
  var x = X().retour, s = S(), n = m.n, p = palier(n), or = p.or + (m.lanterne ? x.lanterne.or : 0);
  var h = '<div class="ma-feuille"><div class="ma-tete"><div class="ma-visage ma-petit">' + visage('grosbec') + '</div><h2>' + esc(D.PNJ.grosbec.nom) + '</h2></div>' +
    '<p class="ma-dit">« ' + esc(x.accueil) + ' » ' + lire(x.accueil, 'grosbec') + '</p>' +
    '<div class="ma-gain"><span>💐 ' + bouquets(n) + '</span>' + (m.lanterne ? '<span>🏮 la lanterne</span>' : '') + '</div>' +
    '<p class="ma-dit">« ' + esc(p.t) + ' » ' + lire(p.t, 'grosbec') + '</p>';
  if(m.lanterne) h += '<p class="ma-dit">« ' + esc(x.lanterne.t) + ' » ' + lire(x.lanterne.t, 'grosbec') + '</p>';
  if(or) h += '<div class="ma-gain ma-or"><span>🪙 +' + or + ' pièces d\'or</span></div>';
  return h + '<button class="btn grand" data-act="ma-rendu">D\'accord</button></div>';
}
function rendre(){
  var x = X(), s = S(), P = M.P(), n = s.b, p = palier(n), or = p.or + (s.lanterne ? x.retour.lanterne.or : 0);
  s.rendu = true; P.vus['marche:rendu'] = 1;
  if(n >= x.but) P.vus['marche:dix'] = 1;   /* la mission du Carnet n'est validée qu'avec les 10 bouquets demandés */
  if(or) M.S.or = (M.S.or || 0) + or;
  M.noter('Tu as rendu ' + bouquets(n) + ' au maire' + (s.lanterne ? ', et la vieille lanterne' : '') + '. ' + (or ? 'Il t\'a donné ' + or + ' pièces d\'or.' : 'Pas d\'or cette fois.'), '💐');
  if(s.lanterne) M.noter('Le maire, devant la lanterne : « ' + x.retour.lanterne.t + ' »', (D.PNJ.grosbec || {}).ic);
  M.son(or ? 'ok' : 'clic'); M.sauver();
  M.ouvrir({type:'marche', qui:'retour', n:n, lanterne:!!s.lanterne, classe:'b-feuille-conv'});
  majCompteurs();
}
/* « D'accord » : ensuite, on lui parle comme à n'importe quel villageois */
A['ma-rendu'] = function(){ UI.modal = null; M.sauver(); parler0({dataset:{id:'grosbec'}}); };

/* ---------- La fenêtre ---------- */
M.marcheHTML = function(m){
  try{
    if(!X()) return '';
    if(m.qui === 'maire') return maireHTML();
    if(!S()) return '';
    if(m.qui === 'fortune') return fortuneHTML(m);
    if(m.qui === 'retour') return retourHTML(m);
    return vendeurHTML(m);
  }catch(e){ console.error(e); return ''; }
};

/* ---------- Ce qui passe avant une conversation ---------- */
var parler0 = A.parler, frapper0 = A.frapper;
function avant(id, el){
  var x = X(); if(!x || !barde()) return false;
  var s = S();
  /* le maire n'est pas encore passé : c'est lui d'abord */
  if(!s){ if(matin()){ clearTimeout(tMaire); tMaire = null; M.son('porte'); M.ouvrir({type:'marche', qui:'maire'}); return true; } return false; }
  if(s.rendu) return false;
  if(id === 'fortune' && !s.f.fini){
    /* avec « Tendre l'oreille » : la scène de Silas et Fortuné d'abord, toute seule (x.avant, une écoute de E.bribes), puis le marchandage */
    var P = M.P();
    if(x.avant && !s.f.ouvert && !P.vus['barde:oreille:' + x.avant] && A['bd-porte'] && M.barde && M.barde.porteIci && M.barde.porteIci('place')){
      /* (Iris et Basile n'apparaissent qu'après : la scène reste à deux, sans la petite phrase de Basile) */
      UI.marcheSuite = 'fortune';
      A['bd-porte']({dataset:{l:'place'}, closest:function(){ return null; }});
      s.f.ouvert = true; M.sauver();
      return true;
    }
    s.f.ouvert = true; M.son('clic'); M.sauver();
    M.ouvrir({type:'marche', qui:'fortune', classe:'b-feuille-conv'});
    return true;
  }
  if(id === 'grosbec' && M.momentId() === 'apresmidi'){ rendre(); return true; }
  return false;
}
A.parler = function(el){ if(avant(el.dataset.id, el)) return; return parler0.apply(this, arguments); };
A.frapper = function(el){
  if(X() && barde() && !S() && matin()){ avant('', el); return; }
  return frapper0.apply(this, arguments);
};
/* après l'écoute de Silas et Fortuné : le marchandage s'ouvre tout seul */
var fermer0 = M.fermer;
M.fermer = function(){
  var suite = UI.marcheSuite; UI.marcheSuite = null;
  var r = fermer0.apply(this, arguments);
  if(suite === 'fortune' && barde() && S() && !S().f.fini){ M.ouvrir({type:'marche', qui:'fortune', classe:'b-feuille-conv'}); }
  return r;
};

/* ---------- Chaque rendu ---------- */
var r0 = M.render;
M.render = function(){
  var r = r0.apply(this, arguments);
  try{ guetter(); majCompteurs(); }catch(e){ console.error(e); }
  return r;
};
})();
