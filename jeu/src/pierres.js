/* ==========================================================
   Brumeval — LES PIERRES DU SAGE, et les plans où on les pose (pierres.js + pierres.css) — 16 novembre
   Romain, 16 novembre : « il n'y a rien qui arrive par magie dans le Grand Livre » ; « il faut qu'il y ait des pierres accessibles depuis
   le Grand Livre, pour pouvoir les prendre et les utiliser. Donc une interface claire […] pas une interface où on doit tourner l'iPhone ».

   · LA POCHE : sous chaque plan, « Dans ta poche », les pierres que le Sage possède (E.pierres : la pierre de Tim à l'enquête 3, puis
     la pierre de rune, la nuit). Elles sont aussi rangées dans « Les objets magiques » (M.pierresHTML, livre.js).
   · POSER UNE PIERRE : on la prend (un toucher : elle est « dans ta main »), puis on touche le plan ; ou on la fait glisser dessus.
     Une fois sortie, toucher le plan ailleurs la déplace. Elle reste froide, tiédit, ou devient brûlante : là, le plan parle.
     Tout tient dans la page du livre, l'écran droit. Les gestes sont pris AVANT le livre (écoute en capture) : glisser une pierre ne
     tourne pas la page.
   · LES PLANS (E.plansPierre[id]) : {pierre (celle qu'il attend), zone {x, y, r} (dans le dessin, 300 de large), dessin(revele),
     avant, tiede, froid, autre (une pierre qui n'est pas la sienne), t (ce que dit le plan quand il parle), note}.
     Ce qui est gardé : P.vus['pierre:<plan>'] = 'ok'.
   · Les pages de l'enquête 3 : M.papierOdetteHTML (le papier d'Odette : au dos, le plan de sa maison), M.vieuxPlanHTML (le vieux plan
     sorti de la cachette), M.tableauOdetteHTML (le tableau, qu'on peut revoir).
   Crochets : data-act="pp-poser" (data-pp, data-pierre, data-x, data-y), window.__pp.
   Chargé après livre.js.
   ========================================================== */
(function(){
'use strict';
var M = window.M;
if(!M || !M.UI) return;
var UI = M.UI, A = M.A;
function esc(s){ return M.esc(s); }
function lire(t){ return M.lireBtn(t); }
function n(v){ return Math.round(v * 10) / 10; }
function IN(){ return (window.MJ && MJ.Interieur) || null; }
var uid = 0;

/* ---------- Les pierres ---------- */
/* une pierre grise, ses runes gravées ; chaude : les runes rougeoient (classes pp-tiede, pp-chaud sur un parent) */
function pierreSVG(id, taille){
  var k = 'pp' + (++uid), runes = id === 'rune'
    ? '<path d="M22 14v22M22 14l8 6-8 6M38 14l-6 11 6 11M32 25h9"/>'
    : '<path d="M20 15l5 10-5 10M30 14v22M30 20l7-4M30 27l7-4M41 30a4 4 0 1 0 .1 0"/>';
  return '<svg class="pp-svg" viewBox="0 0 60 50" width="' + (taille || 60) + '" height="' + n((taille || 60) * 5 / 6) + '" aria-hidden="true">' +
    '<defs><radialGradient id="' + k + '" cx=".38" cy=".3" r=".8"><stop offset="0" stop-color="' + (id === 'rune' ? '#b9c4d6' : '#c9c4b8') + '"/><stop offset="1" stop-color="' + (id === 'rune' ? '#5d6880' : '#77726a') + '"/></radialGradient></defs>' +
    '<ellipse cx="32" cy="44" rx="22" ry="4.5" fill="rgba(30,18,6,.3)"/>' +
    '<path d="M9 28C7 15 18 5 32 6C46 6 56 14 54 28C53 40 43 45 30 45C17 45 10 39 9 28Z" fill="url(#' + k + ')" stroke="#24182e" stroke-width="3" stroke-linejoin="round"/>' +
    '<path d="M16 17C20 11 28 9 34 10" fill="none" stroke="rgba(255,255,255,.6)" stroke-width="3" stroke-linecap="round"/>' +
    '<g class="pp-runes" fill="none" stroke-linecap="round" stroke-linejoin="round" stroke-width="2.6">' + runes + '</g></svg>';
}
function pierresDe(E){ return ((E && E.pierres) || []).filter(function(p){ return !p.si || M.besoinOk(p.si); }); }
function pierre(E, id){ return ((E && E.pierres) || []).filter(function(p){ return p.id === id; })[0] || null; }
function planDe(E, id){ return (E && E.plansPierre && E.plansPierre[id]) || null; }
function parle(id){ var P = M.P(); return !!(P && P.vus['pierre:' + id]); }

/* « Les objets magiques » : les pierres du Sage, avec leur histoire */
M.pierresHTML = function(){
  var E = M.E();
  return pierresDe(E).map(function(p){
    return '<figure class="lv-objet pp-objet">' + pierreSVG(p.id, 96) + '<figcaption><b>' + esc(p.nom) + '</b><span>' + esc(p.t) + ' ' + lire(p.t) + '</span></figcaption></figure>';
  }).join('');
};

/* ---------- Un plan et sa poche ---------- */
function etat(id){ var e = UI.pp = UI.pp || {}; return e[id] = e[id] || {}; }
function bloc(id){
  var E = M.E(), Pl = planDe(E, id); if(!Pl) return '';
  var S = etat(id), fait = parle(id), l = pierresDe(E), s = '';
  var classe = fait ? ' pp-parle' : S.chaleur ? ' pp-' + S.chaleur : '';
  s += '<div class="pp' + classe + '" data-pp="' + esc(id) + '">';
  s += '<div class="pp-plan' + (Pl.large ? ' pp-large' : '') + '" data-pp-plan="' + esc(id) + '">' + Pl.dessin(fait);
  if(S.pierre && !fait) s += '<button type="button" class="pp-pose" data-pp-pose="' + esc(S.pierre) + '" style="left:' + n(S.x * 100) + '%;top:' + n(S.y * 100) + '%" aria-label="' + esc((pierre(E, S.pierre) || {}).nom || 'La pierre') + ', posée sur le plan">' + pierreSVG(S.pierre, 54) + '</button>';
  /* le plan a parlé : la pierre reste posée à côté (Pl.repos), sans cacher ce qu'elle a allumé */
  if(fait && Pl.zone){ var rp = Pl.repos || Pl.zone; s += '<span class="pp-pose pp-fixe" style="left:' + n(rp.x / 300 * 100) + '%;top:' + n(rp.y / Pl.h * 100) + '%" aria-hidden="true">' + pierreSVG(Pl.pierre, 44) + '</span>'; }
  s += '</div>';
  var dit = fait ? Pl.t : (S.dit || Pl.avant);
  s += '<div class="pp-dit" aria-live="polite">' + (fait && Pl.signes ? Pl.signes() : '') + '<p class="lv-texte">' + esc(dit) + ' ' + lire(dit) + '</p></div>';
  if(!fait){
    s += '<div class="pp-poche"><b>Dans ta poche</b><div class="pp-poche-l">' + (l.length ? l.map(function(p){
      var sortie = S.pierre === p.id;
      return '<button type="button" class="pp-pierre' + (S.main === p.id ? ' pp-main' : '') + (sortie ? ' pp-sortie' : '') + '" data-pp-pierre="' + esc(p.id) + '">' + pierreSVG(p.id, 46) + '<span>' + esc(p.nom) + '</span></button>';
    }).join('') : '<span class="pp-vide">Rien pour l\'instant.</span>') + '</div></div>';
  }
  return s + '</div>';
}
function redessiner(id){
  var el = document.querySelector('.pp[data-pp="' + id + '"]');
  if(!el){ M.render(); return; }
  var t = document.createElement('div'); t.innerHTML = bloc(id);
  if(t.firstChild) el.parentNode.replaceChild(t.firstChild, el);
}
/* poser la pierre « pid » sur le plan « id », à l'endroit (x, y) — des fractions du dessin, de 0 à 1 */
function poser(id, pid, x, y){
  var E = M.E(), P = M.P(), Pl = planDe(E, id), Pi = pierre(E, pid);
  if(!Pl || !Pi || !P || parle(id)) return;
  if(pierresDe(E).indexOf(Pi) < 0) return;
  var S = etat(id);
  x = Math.max(.04, Math.min(.96, x)); y = Math.max(.04, Math.min(.96, y));
  S.pierre = pid; S.main = pid; S.x = x; S.y = y;
  if(Pl.pierre !== pid){
    S.chaleur = 'froid'; S.dit = (Pl.autre || 'Elle reste froide. Ce n\'est pas cette pierre que le plan attend.').replace('{pierre}', Pi.nom);
    M.son('tic'); redessiner(id); return;
  }
  var dx = x * 300 - Pl.zone.x, dy = y * Pl.h - Pl.zone.y, d = Math.sqrt(dx * dx + dy * dy);
  if(d <= Pl.zone.r){
    P.vus['pierre:' + id] = 'ok';
    delete UI.pp[id];
    if(Pl.note) M.noter(Pl.note, Pl.ic || '🪨');
    M.son('magie'); try{ if(navigator.vibrate) navigator.vibrate([30, 50, 90]); }catch(e){}
    M.sauver(); UI.garderDefilement = true; M.render();
    return;
  }
  S.chaleur = d <= Pl.zone.r * 2.6 ? 'tiede' : 'froid';
  S.dit = S.chaleur === 'tiede' ? (Pl.tiede || 'La pierre tiédit dans ta main… Tu n\'es pas loin !') : (Pl.froid || 'Ici, la pierre reste froide.');
  M.son(S.chaleur === 'tiede' ? 'ok' : 'tic'); redessiner(id);
}
A['pp-poser'] = function(el){ poser(el.dataset.pp, el.dataset.pierre, +el.dataset.x, +el.dataset.y); };
window.__pp = {poser:poser, etat:function(id){ return {parle:parle(id), ui:(UI.pp || {})[id] || null}; }};

/* ---------- Les gestes (pris avant le livre) ---------- */
var G = null;   /* {id (plan), pid, x0, y0, glisse, fantome} */
function planSous(x, y){ var el = document.elementFromPoint(x, y); return el && el.closest ? el.closest('.pp-plan') : null; }
function fraction(plan, x, y){ var r = plan.getBoundingClientRect(); return {x:(x - r.left) / r.width, y:(y - r.top) / r.height}; }
function prendre(id, pid){
  var S = etat(id), Pi = pierre(M.E(), pid);
  S.main = pid; if(!S.pierre){ S.chaleur = ''; S.dit = (Pi ? Pi.nom : 'La pierre') + ' est dans ta main. Où vas-tu la poser ?'; }
  M.son('clic'); redessiner(id);
}
document.addEventListener('pointerdown', function(e){
  if(!e.target.closest) return;
  var b = e.target.closest('.pp-pierre, button.pp-pose'); if(!b) return;
  var pp = b.closest('.pp'); if(!pp) return;
  if(e.pointerType === 'mouse' && e.button !== 0) return;
  e.stopPropagation();   /* le livre ne commence pas à tourner sa page */
  G = {id:pp.dataset.pp, pid:b.dataset.ppPierre || b.dataset.ppPose, x0:e.clientX, y0:e.clientY, pt:e.pointerId, glisse:false, fantome:null, depuisPlan:b.classList.contains('pp-pose')};
}, true);
document.addEventListener('pointermove', function(e){
  if(!G || e.pointerId !== G.pt) return;
  var dx = e.clientX - G.x0, dy = e.clientY - G.y0;
  if(!G.glisse){
    if(dx * dx + dy * dy < 64) return;
    G.glisse = true;
    var f = G.fantome = document.createElement('div');
    f.className = 'pp-fantome'; f.innerHTML = pierreSVG(G.pid, 64);
    document.body.appendChild(f);
    document.documentElement.classList.add('pp-glisse');
  }
  e.stopPropagation(); if(e.cancelable) e.preventDefault();
  G.fantome.style.transform = 'translate(' + (e.clientX - 32) + 'px,' + (e.clientY - 42) + 'px)';
}, true);
function finGeste(e, annule){
  if(!G || e.pointerId !== G.pt) return;
  var g = G; G = null;
  if(g.fantome && g.fantome.parentNode) g.fantome.parentNode.removeChild(g.fantome);
  document.documentElement.classList.remove('pp-glisse');
  if(!g.glisse){ if(!annule && !g.depuisPlan) prendre(g.id, g.pid); return; }
  e.stopPropagation();
  UI.ppBloque = Date.now();   /* le « clic » qui suit le glisser ne repose pas la pierre ailleurs */
  if(annule) return;
  var plan = planSous(e.clientX, e.clientY - 10);
  if(plan && plan.dataset.ppPlan === g.id){ var q = fraction(plan, e.clientX, e.clientY - 10); poser(g.id, g.pid, q.x, q.y); }
}
document.addEventListener('pointerup', function(e){ finGeste(e, false); }, true);
document.addEventListener('pointercancel', function(e){ finGeste(e, true); }, true);
/* toucher le plan : la pierre qu'on a en main (ou celle qui est déjà sortie) vient se poser là */
document.addEventListener('click', function(e){
  if(!e.target.closest) return;
  var plan = e.target.closest('.pp-plan'); if(!plan) return;
  if(UI.ppBloque && Date.now() - UI.ppBloque < 350){ UI.ppBloque = 0; return; }
  if(e.target.closest('button.pp-pose')) return;
  var id = plan.dataset.ppPlan, S = etat(id), E = M.E(), Pl = planDe(E, id);
  if(!Pl || parle(id)) return;
  var pid = S.main || S.pierre;
  if(!pid){
    S.dit = Pl.sansPierre || 'Le plan ne dit rien de plus… Il lui manque quelque chose.'; M.son('tic'); redessiner(id); return;
  }
  var q = fraction(plan, e.clientX, e.clientY); poser(id, pid, q.x, q.y);
}, true);

/* ==========================================================
   Les dessins de l'enquête 3
   ========================================================== */
var ENCRE = '#4a3320', PAPIER = '#efdcae';
function parchemin(w, h, k){
  return '<defs><radialGradient id="' + k + 'p" cx=".5" cy=".45" r=".75"><stop offset="0" stop-color="#f6e7bd"/><stop offset=".7" stop-color="' + PAPIER + '"/><stop offset="1" stop-color="#cfae6e"/></radialGradient></defs>' +
    '<path d="M6 8Q' + n(w * .3) + ' 2 ' + n(w * .6) + ' 7T' + (w - 5) + ' 6Q' + (w - 1) + ' ' + n(h * .4) + ' ' + (w - 6) + ' ' + n(h * .7) + 'T' + (w - 4) + ' ' + (h - 7) + 'Q' + n(w * .6) + ' ' + (h - 2) + ' ' + n(w * .35) + ' ' + (h - 6) + 'T5 ' + (h - 5) + 'Q1 ' + n(h * .6) + ' 6 ' + n(h * .3) + 'T6 8Z" fill="url(#' + k + 'p)" stroke="#8a6a3a" stroke-width="2"/>' +
    '<circle cx="' + n(w * .82) + '" cy="' + n(h * .12) + '" r="13" fill="rgba(150,105,50,.14)"/><circle cx="' + n(w * .14) + '" cy="' + n(h * .86) + '" r="18" fill="rgba(150,105,50,.12)"/><circle cx="' + n(w * .2) + '" cy="' + n(h * .83) + '" r="7" fill="rgba(150,105,50,.14)"/>';
}
/* LE PLAN DE LA MAISON D'ODETTE, au dos de son papier : la même pièce que chez le Pisteur (interieur.js), à la plume.
   300 × 400 ; la maison : 240 × 320, posée en (40, 34) — l'échelle 0,4 du dessin du Pisteur */
var MX = 40, MY = 34, MK = .4;
function planMaison(revele){
  var I = IN(), k = 'pm' + (++uid), s = '<svg class="pp-dessin" viewBox="0 0 300 400" role="img" aria-label="Le plan de la maison d\'Odette, dessiné à la plume">' + parchemin(300, 400, k);
  function X(v){ return n(MX + v * MK); } function Y(v){ return n(MY + v * MK); }
  /* les plis du papier (plié en quatre) */
  s += '<path d="M150 6V394M6 200H294" stroke="rgba(120,85,40,.28)" stroke-width="1.4" stroke-dasharray="1 0"/><path d="M152 6V394M6 202H294" stroke="rgba(255,250,230,.5)" stroke-width="1"/>';
  s += '<g fill="none" stroke="' + ENCRE + '" stroke-linecap="round" stroke-linejoin="round">';
  /* les murs (deux traits), la fenêtre à gauche, la porte en bas */
  s += '<path stroke-width="2.4" d="M' + X(0) + ' ' + Y(322) + 'V' + Y(0) + 'H' + X(600) + 'V' + Y(800) + 'H' + X(338) + 'M' + X(262) + ' ' + Y(800) + 'H' + X(0) + 'V' + Y(478) + '"/>';
  s += '<path stroke-width="1.3" d="M' + X(28) + ' ' + Y(322) + 'V' + Y(28) + 'H' + X(572) + 'V' + Y(772) + 'H' + X(338) + 'M' + X(262) + ' ' + Y(772) + 'H' + X(28) + 'V' + Y(478) + '"/>';
  s += '<path stroke-width="1.2" d="M' + X(0) + ' ' + Y(322) + 'H' + X(28) + 'M' + X(0) + ' ' + Y(478) + 'H' + X(28) + 'M' + X(10) + ' ' + Y(322) + 'V' + Y(478) + 'M' + X(18) + ' ' + Y(322) + 'V' + Y(478) + '"/>';
  s += '<path stroke-width="1.2" d="M' + X(262) + ' ' + Y(772) + 'L' + X(213) + ' ' + Y(714) + 'M' + X(262) + ' ' + Y(700) + 'A' + n(76 * MK) + ' ' + n(76 * MK) + ' 0 0 0 ' + X(213) + ' ' + Y(714) + '" stroke-dasharray="3 3"/>';
  /* la cheminée, le lit, la table, le fauteuil, les paniers, le coffre */
  s += '<path stroke-width="1.5" d="M' + X(210) + ' ' + Y(28) + 'V' + Y(98) + 'H' + X(390) + 'V' + Y(28) + 'M' + X(234) + ' ' + Y(34) + 'V' + Y(90) + 'H' + X(366) + 'V' + Y(34) + '"/>';
  s += '<path stroke-width="1.5" d="M' + X(440) + ' ' + Y(120) + 'h' + n(120 * MK) + 'v' + n(192 * MK) + 'h-' + n(120 * MK) + 'zM' + X(456) + ' ' + Y(142) + 'h' + n(88 * MK) + 'v' + n(34 * MK) + 'h-' + n(88 * MK) + 'z"/>';
  s += '<circle stroke-width="1.5" cx="' + X(470) + '" cy="' + Y(640) + '" r="' + n(64 * MK) + '"/><rect stroke-width="1.2" x="' + X(365) + '" y="' + Y(619) + '" width="' + n(42 * MK) + '" height="' + n(42 * MK) + '"/>';
  s += '<path stroke-width="1.3" d="M' + X(108) + ' ' + Y(196) + 'l' + n(52 * MK) + ' -' + n(22 * MK) + 'l' + n(22 * MK) + ' ' + n(52 * MK) + 'l-' + n(52 * MK) + ' ' + n(22 * MK) + 'z"/>';
  s += '<ellipse stroke-width="1.3" cx="' + X(84) + '" cy="' + Y(596) + '" rx="' + n(34 * MK) + '" ry="' + n(28 * MK) + '"/><ellipse stroke-width="1.3" cx="' + X(168) + '" cy="' + Y(606) + '" rx="' + n(30 * MK) + '" ry="' + n(25 * MK) + '"/><ellipse stroke-width="1.3" cx="' + X(106) + '" cy="' + Y(668) + '" rx="' + n(38 * MK) + '" ry="' + n(31 * MK) + '"/>';
  s += '<rect stroke-width="1.3" x="' + X(510) + '" y="' + Y(358) + '" width="' + n(54 * MK) + '" height="' + n(120 * MK) + '"/>';
  /* le chat qui dort, sur le rebord de la fenêtre */
  s += '<g transform="translate(' + X(46) + ' ' + Y(400) + ')" stroke-width="1.4"><path d="M-6 3C-8 -4 -2 -8 4 -7C10 -6 11 0 9 5C6 9 -1 9 -4 7Z"/><path d="M-5 -4l-2 -5 4 2M0 -7l1 -5 3 4"/><path d="M8 5c3 3 -2 6 -7 5"/></g>';
  /* les neuf dalles, au milieu */
  var c0 = 232, T = 56, e = 6, q, kk;
  for(kk = 0; kk < 9; kk++){
    q = {x:c0 + (kk % 3) * (T + e), y:310 + Math.floor(kk / 3) * (T + e)};
    s += '<rect stroke-width="1.3" x="' + X(q.x) + '" y="' + Y(q.y) + '" width="' + n(T * MK) + '" height="' + n(T * MK) + '"/>';
    if(!revele) s += '<path stroke-width="1" opacity=".5" d="M' + X(q.x + 14 + (kk * 7) % 11) + ' ' + Y(q.y + 16 + (kk * 5) % 9) + 'q' + n(6 + kk % 3 * 2) + ' -' + (3 + kk % 2 * 2) + ' ' + n(9 + kk % 4) + ' ' + (2 + kk % 3) + 'M' + X(q.x + 20) + ' ' + Y(q.y + 36 + (kk * 3) % 7) + 'l' + (4 + kk % 3) + ' ' + (1 + kk % 2) + '"/>';
  }
  s += '</g>';
  /* ce qu'Odette a écrit : le titre, et le soleil de l'après-midi, du côté de la fenêtre */
  s += '<text x="150" y="386" text-anchor="middle" class="pp-plume">Ma maison</text>';
  s += '<g transform="translate(19 ' + Y(400) + ')" fill="none" stroke="' + ENCRE + '" stroke-width="1.5" stroke-linecap="round"><circle r="6"/><path d="M0 -10v-4M0 10v4M-10 0h-4M-7 -7l-3 -3M-7 7l-3 3M7 -7l3 -3M7 7l3 3"/></g><path d="M29 ' + Y(400) + 'h9m-3 -3l3 3-3 3" fill="none" stroke="' + ENCRE + '" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>';
  if(revele && I){
    /* la pierre a parlé : le rayon d'or, de la fenêtre aux dalles ; les neuf signes ; les trois qui comptent, et leur rang */
    var Dl = I.MAISONS.odette.dalles, cx = X(322), cy = Y(400);
    s += '<path class="pp-or-rayon" d="M' + X(60) + ' ' + Y(388) + 'L' + cx + ' ' + n(cy - 26) + 'L' + cx + ' ' + n(cy + 26) + 'L' + X(60) + ' ' + Y(412) + 'Z" fill="rgba(255,196,74,.38)"/>';
    for(kk = 0; kk < 9; kk++){
      q = {x:c0 + (kk % 3) * (T + e) + T / 2, y:310 + Math.floor(kk / 3) * (T + e) + T / 2};
      var rang = Dl.ordre.indexOf(Dl.signes[kk]), d = I.SIGNES[Dl.signes[kk]].d;
      s += '<g transform="translate(' + X(q.x) + ' ' + Y(q.y) + ') scale(.48)">' + (rang >= 0 ? '<rect x="-27" y="-27" width="54" height="54" rx="4" fill="#ffd36b" stroke="#b9770e" stroke-width="3" class="pp-or-case" style="animation-delay:' + (rang * .5) + 's"/>' : '') +
        '<path d="' + d + '" fill="none" stroke="' + (rang >= 0 ? '#3a2208' : 'rgba(120,85,40,.55)') + '" stroke-width="' + (rang >= 0 ? 3.6 : 2.6) + '" stroke-linecap="round" stroke-linejoin="round"/></g>';
      if(rang >= 0) s += '<g transform="translate(' + n(X(q.x) + 11) + ' ' + n(Y(q.y) - 11) + ')"><circle r="7.5" fill="#24182e"/><text y="3.8" text-anchor="middle" class="pp-rang">' + (rang + 1) + '</text></g>';
    }
  }
  return s + '</svg>';
}
/* les trois signes, en grand, sous le plan : 1, 2, 3 */
function troisSignes(){
  var I = IN(); if(!I) return '';
  var Dl = I.MAISONS.odette.dalles;
  return '<div class="pp-trois" role="img" aria-label="' + esc(Dl.ordre.map(function(sg, i){ return (i + 1) + ' : ' + I.SIGNES[sg].nom; }).join(', ')) + '">' + Dl.ordre.map(function(sg, i){
    return '<span class="pp-trois-c"><i>' + (i + 1) + '</i>' + I.signeSVG(sg, 46, '#3a2208', 2.8) + '<small>' + esc(I.SIGNES[sg].nom) + '</small></span>';
  }).join('<b aria-hidden="true">›</b>') + '</div>';
}

/* LE VIEUX PLAN D'ODETTE : les couloirs du dessous, sans un nom (la carte du donjon, donjon/carte.js : CARTE_DONJON). Une petite cloche
   au départ ; les signes gravés ; là où il y a quelque chose d'écrit, de l'encre passée qu'on ne sait pas lire ; un coin déchiré.
   Rien n'y dit « souterrains » (Romain, 16 novembre). 300 × 180. */
/* (17 novembre) revele : la pierre de rune est posée — l'encre passée se rallume, bleue */
function vieuxPlan(revele){
  var C = window.CARTE_DONJON, k = 'vp' + (++uid), w = 300, h = 180;
  var s = '<svg class="pp-dessin pp-vieux" viewBox="0 0 ' + w + ' ' + h + '" role="img" aria-label="Un très vieux plan : des couloirs, des salles, pas un seul nom">' + parchemin(w, h, k);
  if(!C) return s + '</svg>';
  var V = C.PLAN.cadre, kx = (w - 16) / V.w, ky = (h - 16) / V.h, K = Math.min(kx, ky), ox = (w - V.w * K) / 2 - V.x * K, oy = (h - V.h * K) / 2 - V.y * K;
  s += '<g transform="translate(' + n(ox) + ' ' + n(oy) + ') scale(' + K.toFixed(4) + ')">';
  /* les couloirs : un trait épais d'encre, puis le papier dedans (deux murs) ; pas les passages secrets */
  var cou = C.LIENS.filter(function(l){ return !l.secret && !l.bouche && l.pts && l.pts.length > 1; }).map(function(l){ return 'M' + l.pts.map(function(p){ return n(p[0]) + ' ' + n(p[1]); }).join('L'); }).join('');
  s += '<path d="' + cou + '" fill="none" stroke="' + ENCRE + '" stroke-width="34" stroke-linecap="round" stroke-linejoin="round"/>';
  Object.keys(C.LIEUX).forEach(function(id){ var L = C.LIEUX[id]; if(L.d && !L.couloir) s += '<path d="' + L.d + '" fill="' + PAPIER + '" stroke="' + ENCRE + '" stroke-width="9" stroke-linejoin="round"/>'; });
  s += '<path d="' + cou + '" fill="none" stroke="' + PAPIER + '" stroke-width="18" stroke-linecap="round" stroke-linejoin="round"/>';
  /* les signes gravés */
  (C.PLAN.signes || []).forEach(function(g){ if(g.porte || !C.SIGNES[g.s]) return; s += '<g transform="translate(' + g.x + ' ' + g.y + ') scale(' + n(g.t / 17) + ')"><path d="' + C.SIGNES[g.s] + '" fill="none" stroke="' + ENCRE + '" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></g>'; });
  /* de l'encre passée : des lignes qu'on ne sait pas lire */
  (C.PLAN.notes || []).forEach(function(nt, i){
    for(var j = 0; j < Math.min(2, (nt.lignes || []).length); j++){ var y = nt.y + j * 30, d = 'M' + (nt.x - 70) + ' ' + y; for(var q = 0; q < 7; q++) d += 'q10 ' + ((q + i + j) % 2 ? -14 : 14) + ' 20 0'; if(revele) s += '<path d="' + d + '" fill="none" stroke="rgba(143,243,255,.5)" stroke-width="13" stroke-linecap="round"/>';
      s += '<path d="' + d + '" fill="none" stroke="' + (revele ? '#05607c' : 'rgba(74,51,32,.34)') + '" stroke-width="5" stroke-linecap="round"/>'; }
  });
  /* la petite cloche, au départ */
  var D0 = C.LIEUX.puits;
  if(D0) s += '<g transform="translate(' + D0.x + ' ' + D0.y + ') scale(2.5)" fill="none" stroke="#7b2d26" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M-9 6C-9 -4 -6 -11 0 -11C6 -11 9 -4 9 6ZM-12 6H12M-2 9.5A2 2 0 1 0 2 9.5M0 -11v-4"/></g>';
  /* le coin déchiré */
  if(C.PLAN.dechire) s += '<path d="M' + C.PLAN.dechire.map(function(p){ return n(p[0]) + ' ' + n(p[1]); }).join('L') + 'Z" fill="#fbf3dc" stroke="#8a6a3a" stroke-width="5" stroke-linejoin="round"/>';
  return s + '</g></svg>';
}

/* ---------- Les pages du Grand Livre ---------- */
var T_PAPIER = '« Quand le soleil de l\'après-midi entrera chez moi, le chat qui dort te montrera le chemin. »';
M.papierOdetteHTML = function(){
  var P = M.P(), partiel = P && P.pages.papier === 'partiel';
  var t = partiel ? 'Les signes sont à moitié effacés. Tu as quand même reconnu des mots : « soleil de l\'après-midi », « le chat qui dort », « le chemin ».' : T_PAPIER;
  return '<p class="lv-texte' + (partiel ? '' : ' pp-citation') + '">' + esc(t) + ' ' + lire(t) + '</p>' + bloc('maison');
};
/* (17 novembre, étape 4 du nouveau fil) LA NUIT, c'est sur cette page que le plan se regarde de tout près (M.donjonPlanBloc, descente.js :
   le plan qui glisse et se zoome, par-dessus le jeu) : plus de page « Le plan des souterrains » arrivée toute seule. Et la pierre de rune que
   le Pisteur trouve là-dessous (E.pierres) se pose ici, comme la pierre de Tim le matin : l'encre cachée se réveille.
   Le filet : la cachette d'Odette jamais ouverte — la page arrive quand même avec le code du départ (« On va dans la crypte ») : en haut de
   l'escalier, un plan gravé dans la pierre, que le Sage recopie. */
M.vieuxPlanHTML = function(){
  var P = M.P(), a = !!(P && P.recus && P.recus['obj:vieux_plan']);
  var t = a ? 'Un très vieux plan, roulé dans un étui de cuir, sous une dalle de la maison d\'Odette. Des couloirs, des salles… L\'encre a tant pâli qu\'on n\'y lit plus un seul nom. Au départ, quelqu\'un a dessiné une petite cloche. Un coin a été déchiré.'
    : 'En haut de l\'escalier, un plan est gravé dans la pierre. Tu l\'as recopié dans ton Grand Livre : des couloirs, des salles, des signes à demi effacés. Un coin manque.';
  var t2 = 'Dans la marge, de l\'écriture penchée d\'Odette : « Les signes ne parlent qu\'à la pierre qui les garde. »';
  return '<p class="lv-texte">' + esc(t) + ' ' + lire(t) + '</p>' + bloc('vieuxplan') + (a ? '<p class="lv-texte pp-citation">' + esc(t2) + ' ' + lire(t2) + '</p>' : '') +
    (M.donjonPlanBloc ? M.donjonPlanBloc() : '');
};
M.tableauOdetteHTML = function(){
  var t = 'Le tableau que tu as peint pour la fête : Odette dans sa maison, avec ses sept chats. Le maire l\'accrochera au-dessus du gâteau. Regarde-le bien…';
  var img = window.MJ && MJ.tableauOdetteSVG ? MJ.tableauOdetteSVG() : '';
  return '<div class="pp-tableau">' + img + '</div><p class="lv-texte">' + esc(t) + ' ' + lire(t) + '</p>';
};

/* ---------- Les plans de l'enquête 3 (les pierres, elles, sont dans e3.js : E.pierres) ---------- */
var E3 = window.ENQUETES && window.ENQUETES[3];
if(E3){
  var PLANS = {
    /* le plan de la maison d'Odette, au dos de son papier : la pierre de Tim, posée sur les neuf dalles, donne l'ordre des trois signes
       (le Sage le dit au Pisteur, à voix haute : pas de code) */
    maison:{pierre:'tim', h:400, zone:{x:168.8, y:194, r:42}, repos:{x:168.8, y:262}, ic:'📜', dessin:planMaison, signes:troisSignes,
      avant:'Au dos, Odette a dessiné sa maison. Au milieu, neuf signes minuscules, presque effacés…',
      sansPierre:'Ces signes… tu les as déjà vus quelque part. Sur une pierre ?',
      froid:'Ici, la pierre de Tim reste froide.',
      tiede:'La pierre de Tim tiédit dans ta main… Tu n\'es pas loin !',
      get t(){
        var I = IN(), o = I ? I.MAISONS.odette.dalles.ordre.map(function(g){ return I.SIGNES[g].nom; }) : ['?', '?', '?'];
        return 'La pierre de Tim devient brûlante ! Trois signes s\'allument, l\'un après l\'autre : ' + o[0] + ', puis ' + o[1] + ', puis ' + o[2] + '. Le Pisteur en aura besoin chez Odette, quand le soleil de l\'après-midi entrera par la fenêtre.';
      },
      get note(){
        var I = IN(), o = I ? I.MAISONS.odette.dalles.ordre.map(function(g){ return I.SIGNES[g].nom; }) : [];
        return 'Sur le plan de la maison d\'Odette, la pierre de Tim a allumé trois signes, dans l\'ordre : ' + o.join(', ') + '. À dire au Pisteur, pour cet après-midi.';
      }},
    /* le vieux plan d'Odette : il attend une autre pierre (la nuit) */
    vieuxplan:{pierre:'rune', h:180, large:true, zone:{x:150, y:90, r:400}, repos:{x:268, y:152}, ic:'🗺️', dessin:vieuxPlan,
      t:'La pierre de rune chauffe dans ta main… Les vieux signes se rallument, un à un ! Regarde le plan de tout près, et promène-la partout : elle réveille l\'encre cachée.',
      note:'La pierre de rune réveille l\'encre cachée du vieux plan : à promener partout, en le regardant de tout près.',
      avant:'Ici et là, de l\'encre passée : des signes qu\'on ne sait plus lire.',
      sansPierre:'Les signes restent muets… « Ils ne parlent qu\'à la pierre qui les garde. »',
      autre:'{pierre} reste froide. Ce n\'est pas elle qui garde ces signes-là…'}
  };
  /* (e3.js garde, pour chaque plan, sa pierre et sa page : le vérificateur les lit sans navigateur) */
  E3.plansPierre = E3.plansPierre || {};
  Object.keys(PLANS).forEach(function(k){ E3.plansPierre[k] = Object.assign(PLANS[k], E3.plansPierre[k] || {}); });
}

M.Pierres = {planMaison:planMaison, vieuxPlan:vieuxPlan, troisSignes:troisSignes, pierreSVG:pierreSVG, bloc:bloc};
})();
