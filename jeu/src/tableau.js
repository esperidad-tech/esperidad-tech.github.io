/* ==========================================================
   Brumeval — « 📋 Mon tableau d'enquête » : le bloc-notes du Sage
   Une page du Grand Livre (la première) : les suspects (QUI) en lignes,
   les lieux (OÙ) en colonnes, comme la grille de déduction. Chaque case
   passe de vide → ✗ → ✓ → vide. Un visage ou un lieu touché se barre en
   entier (✗), puis devient « sûr » (✓), puis s'efface.
   Les autres questions (QUI l'aide ?, et plus tard POURQUOI…) ont leur
   petite rangée sous la grille. Rien n'est vérifié par le jeu.
   Le tableau garde ses propres marques ; l'écran d'accusation grise ce
   qu'il a barré. Il est gardé avec l'enquête, puis dans le journal.
   Chargé APRÈS moteur-actions.js (ajoute ses actions à M.A).
   P.tableau = {cases:{'qui|ou':'x'|'v'}, dims:{qui:{id:'x'|'v'}, ou:{…}, quoi:{…}}}  (surs : ancien format, repris une fois)
   ========================================================== */
(function(){
'use strict';
var M = window.M, D = window.DONNEES;
if(!M) return;
function esc(s){ return M.esc(s); }
var EN_PLUS = ['quoi', 'pourquoi', 'quand', 'comment'];   /* questions en plus du QUI et du OÙ */
var n = 0;

function tab(src){
  if(!src.tableau || typeof src.tableau !== 'object') src.tableau = {};
  var t = src.tableau; t.cases = t.cases || {}; t.dims = t.dims || {}; t.surs = t.surs || {};
  /* Le tableau garde ses propres marques (le Carnet ne raye plus). Ancienne sauvegarde : on reprend une fois les suspects barrés. */
  if(!t.dims.qui){
    t.dims.qui = {};
    (src.raye || []).forEach(function(id){ t.dims.qui[id] = 'x'; });
    M.cle(t.surs).forEach(function(id){ if(!t.dims.qui[id]) t.dims.qui[id] = 'v'; });
  }
  return t;
}
function etatQui(src, id){ return tab(src).dims.qui[id] || ''; }
function etatDim(src, d, id){ return (tab(src).dims[d] || {})[id] || ''; }
function suivant(v){ return v === '' ? 'x' : v === 'x' ? 'v' : ''; }
function marque(v){ return v === 'x' ? '✗' : v === 'v' ? '✓' : ''; }
function portrait(id){
  if(window.Persos && Persos.pnj && Persos.PNJ && Persos.PNJ[id]){
    try{ return Persos.pnj(id, {anime:false, humeur:'normal', id:'tb' + (++n)}); }catch(e){}
  }
  return '<span class="tb-emoji">' + ((D.PNJ[id] && D.PNJ[id].ic) || '🙂') + '</span>';
}
function nomQui(id){ return (D.PNJ[id] && D.PNJ[id].court) || id; }
function choixDim(E, d){ return (E[d] && E[d].choix) || []; }
/* « Le Vieux Chêne » → « Vieux Chêne » (moins large dans l'en-tête de colonne) */
function court(nom){ var s = String(nom || '').replace(/^(Le |La |Les |L')/, ''); return s.charAt(0).toUpperCase() + s.slice(1); }

/* La page, pour l'onglet du Grand Livre */
M.pageTableau = function(){ return {id:'tableau', titre:'Mon tableau d\'enquête', ic:'📋', tableau:true}; };

/* Le tableau : src = l'enquête en cours (P) ou une enquête passée du journal ; lecture = sans boutons */
function tableauHTML(E, src, lecture){
  var qui = (E.qui && E.qui.choix) || [], ou = choixDim(E, 'ou'), t = tab(src);
  var bt = lecture ? 'span' : 'button';
  function attr(act, data){ if(lecture) return ''; return ' type="button" data-act="' + act + '"' + Object.keys(data).map(function(k){ return ' data-' + k + '="' + esc(data[k]) + '"'; }).join(''); }
  var s = '';
  if(qui.length && ou.length){
    s += '<div class="tb-boite"><div class="tb-grille" style="--n:' + ou.length + '">' +
      '<div class="tb-coin" aria-hidden="true"><span>📍</span><span>👤</span></div>';
    ou.forEach(function(c){
      var v = etatDim(src, 'ou', c.id);
      s += '<' + bt + ' class="tb-col tb-' + (v || 'vide') + '"' + attr('tab-tete', {d:'ou', id:c.id}) + ' aria-label="' + esc(c.nom) + '"><span class="tb-ic">' + c.ic + '</span><small>' + esc(court(c.nom)) + '</small>' + (v ? '<i class="tb-m">' + marque(v) + '</i>' : '') + '</' + bt + '>';
    });
    qui.forEach(function(id){
      var vq = etatQui(src, id);
      s += '<' + bt + ' class="tb-ligne tb-' + (vq || 'vide') + '"' + attr('tab-tete', {d:'qui', id:id}) + ' aria-label="' + esc(nomQui(id)) + '"><span class="tb-por">' + portrait(id) + '</span><small>' + esc(nomQui(id)) + '</small>' + (vq ? '<i class="tb-m">' + marque(vq) + '</i>' : '') + '</' + bt + '>';
      ou.forEach(function(c){
        var k = id + '|' + c.id, v = t.cases[k] || '';
        var grise = vq === 'x' || etatDim(src, 'ou', c.id) === 'x';
        s += '<' + bt + ' class="tb-case tb-' + (v || 'vide') + (grise ? ' tb-grise' : '') + '"' + attr('tab-case', {k:k}) + ' aria-label="' + esc(nomQui(id) + ', ' + c.nom) + '">' + marque(v) + '</' + bt + '>';
      });
    });
    s += '</div></div>';
  }
  /* Les autres questions : une petite rangée chacune */
  EN_PLUS.forEach(function(d){
    var l = choixDim(E, d); if(!l.length) return;
    s += '<div class="tb-plus"><h4>' + esc(E[d].titre || '') + '</h4><div class="tb-rang">';
    l.forEach(function(c){
      var v = etatDim(src, d, c.id), pnj = c.pnj && D.PNJ[c.id];
      s += '<' + bt + ' class="tb-puce tb-' + (v || 'vide') + '"' + attr('tab-tete', {d:d, id:c.id}) + '><span class="' + (pnj ? 'tb-por' : 'tb-ic') + '">' + (pnj ? portrait(c.id) : c.ic) + '</span><small>' + esc(c.nom) + '</small>' + (v ? '<i class="tb-m">' + marque(v) + '</i>' : '') + '</' + bt + '>';
    });
    s += '</div></div>';
  });
  return s;
}
/* Sans mode d'emploi ni légende (Romain : « c'est intuitif, il suffit d'appuyer dessus ») ; le titre est celui de la page du Grand Livre (livre.js) */
M.tableauHTML = function(){
  var E = M.E(), P = M.P();
  return '<div class="tb-zone">' + tableauHTML(E, P, false) +
    '<button class="btn second petit tb-effacer" data-act="tab-effacer">🧽 Tout effacer</button></div>';
};
/* Pour l'écran d'accusation : ce que le Sage a barré (ça reste choisissable) */
M.tableauRaye = function(d, id){
  var P = M.P(); if(!P) return false;
  return etatDim(P, d, id) === 'x';
};
/* Dans le journal : le tableau d'une enquête passée, en lecture seule (Sage seulement) */
M.tableauJournal = function(J){
  if(M.role() !== 'sage' || !J) return '';
  var E = window.ENQUETES && J.e && window.ENQUETES[J.e]; if(!E) return '';
  var src = {tableau:J.tableau ? M.copie(J.tableau) : {}, raye:(J.raye || []).slice()};
  var t = tab(src);
  if(!src.raye.length && !M.cle(t.cases).length && !M.cle(t.surs).length && !M.cle(t.dims).some(function(d){ return M.cle(t.dims[d]).length; })) return '';
  return '<h3>📋 Mon tableau d\'enquête</h3><div class="parchemin b-tb-journal">' + tableauHTML(E, src, true) + '</div>';
};

/* ---------- Actions ---------- */
/* Une case touchée : on sauve, et on met le tableau à jour SUR PLACE (pas de M.render : rien ne clignote, le Grand Livre reste à sa page) */
function apres(el){
  M.son('clic'); M.sauver();
  var zone = el && el.closest ? el.closest('.tb-zone') : null;
  if(!zone){ M.UI.garderDefilement = true; M.render(); return; }
  rafraichir(zone, M.P());
  try{ if(el.animate) el.animate([{transform:'scale(.88)'}, {transform:'scale(1.06)'}, {transform:'none'}], {duration:180, easing:'ease-out'}); }catch(e){}
}
function poserEtat(b, v){ b.classList.remove('tb-vide', 'tb-x', 'tb-v'); b.classList.add('tb-' + (v || 'vide')); }
function rafraichir(zone, src){
  var t = tab(src);
  [].forEach.call(zone.querySelectorAll('[data-act="tab-tete"]'), function(b){
    var v = etatDim(src, b.dataset.d, b.dataset.id), m = b.querySelector('.tb-m');
    poserEtat(b, v);
    if(v){ if(!m){ m = document.createElement('i'); m.className = 'tb-m'; b.appendChild(m); } m.textContent = marque(v); }
    else if(m) m.parentNode.removeChild(m);
  });
  [].forEach.call(zone.querySelectorAll('[data-act="tab-case"]'), function(b){
    var k = b.dataset.k, v = t.cases[k] || '', p = String(k).split('|');
    poserEtat(b, v);
    b.classList.toggle('tb-grise', etatQui(src, p[0]) === 'x' || etatDim(src, 'ou', p[1]) === 'x');
    b.textContent = marque(v);
  });
}
if(M.A){
  M.A['tab-case'] = function(el){
    var P = M.P(); if(!P) return;
    var t = tab(P), k = el.dataset.k, v = suivant(t.cases[k] || '');
    if(v) t.cases[k] = v; else delete t.cases[k];
    apres(el);
  };
  M.A['tab-tete'] = function(el){
    var P = M.P(); if(!P) return;
    var t = tab(P), d = el.dataset.d, id = el.dataset.id;   /* qui, ou, quoi… : chacun garde ses marques dans le tableau */
    t.dims[d] = t.dims[d] || {};
    var v = suivant(t.dims[d][id] || '');
    if(v) t.dims[d][id] = v; else delete t.dims[d][id];
    apres(el);
  };
  M.A['tab-effacer'] = function(){
    M.UI.confirmer = function(){ var P = M.P(); if(!P) return; P.tableau = {dims:{qui:{}}}; M.sauver(); M.UI.garderDefilement = true; M.render(); };
    M.ouvrir({type:'confirmer', titre:'Tout effacer ?', t:'Toutes les croix et les ✓ de ton tableau vont disparaître.', oui:'Oui, tout effacer', danger:true});
  };
}
})();
