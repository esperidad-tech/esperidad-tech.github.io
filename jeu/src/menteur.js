/* ==========================================================
   Brumeval — le petit tutoriel du menteur (enquête 2, le Barde ; Romain, 13 novembre)
   « Comme il a une nouvelle fonctionnalité, trouver un menteur, il faut lui faire un mini tutoriel » :
     1. sur la carte, la taverne brille ; puis « 💬 Parler » à Margot ;
     2. la première question brille (« On dit que c'est votre vin qui a rougi la rivière ! ») ; pendant qu'elle répond, une goutte de
        sueur coule sur son front tout le long de la phrase, et une flèche rouge « Elle ment ! » la montre, le temps de la goutte ;
     3. le bouton « 🤥 Mensonge ? » brille : elle dit la vérité ;
     4. « Comment sais-tu quand quelqu'un ment ? » brille ; elle épingle ses secrets de tavernière ; « 📌 Mon tableau » brille ;
     5. sur le tableau de liège : l'étiquette « Oreilles rouges » (dossier 🤥 Mensonges), puis le dossier 👥 Habitants, puis Bastien,
        puis la bobine « Fil rouge », puis l'étiquette, puis Bastien : les voilà reliés par un fil rouge. C'est fini.
   Ensuite (et seulement ensuite), le bouton « Mensonge ? » a son minuteur dans toutes les conversations (barde.js, lancerMinute).
   Comme le tutoriel de l'enquête 1 : le rond jaune animé sur ce qu'il faut toucher, le bouton qui respire (tuto.css). Rien n'est bloqué :
   l'étape en cours se lit dans la partie (les questions posées, le tableau), on peut s'en écarter et y revenir.
   P.tutoMenteur : undefined (en cours), 'liege' (arrivé au tableau), 'fini'. Une enquête qui le veut : E.tutoMenteur:true (e2.js).
   Chargé EN DERNIER (après tuto.js) : il enveloppe M.render.
   ========================================================== */
(function(){
'use strict';
var M = window.M;
if(!M || !M.A) return;
var UI = M.UI;
function q(s){ return document.querySelector(s); }
function E0(){ return M.S && M.S.e ? M.E() : null; }
function concerne(){ var E = E0(), P = M.P && M.P(); return !!(E && P && E.tutoMenteur && M.role() === 'barde'); }
/* le tutoriel n'est pas fini : pas encore de minuteur sur le bouton « Mensonge ? » */
M.menteurTutoEnCours = function(){ var P = M.P && M.P(); return concerne() && P.tutoMenteur !== 'fini'; };
function enJeu(){ var P = M.P(); return M.menteurTutoEnCours() && P.etape === 'jeu' && !P.resolu && UI.ecran === 'enquete' && !(M.tutoTalentForce && M.tutoTalentForce()); }   /* (le talent du niveau 2 d'abord, s'il n'est pas choisi : tuto.js) */
/* la première réponse de Margot pendant le tutoriel : la goutte de sueur (barde.js, scenario) */
M.menteurTutoSigne = function(id, i){
  var P = M.P();
  if(!M.menteurTutoEnCours() || id !== 'margot' || i !== 0 || P.vus['verite:margot:0']) return null;
  UI.tmAttend = Date.now(); UI.tmFlecheVue = false;
  return 'sueur';
};
/* la flèche rouge « Elle ment ! », le temps du signe */
M.menteurTutoFleche = function(box, on){
  if(!box) return;
  var f = box.querySelector('.tm-fleche');
  if(on){
    if(!f){
      f = document.createElement('div'); f.className = 'tm-fleche'; f.setAttribute('aria-hidden', 'true');
      f.innerHTML = '<b>Elle ment !</b><svg viewBox="0 0 70 44" focusable="false"><path d="M4 30 C 20 30 34 24 50 14" fill="none" stroke="#24182e" stroke-width="11" stroke-linecap="round"/>' +
        '<path d="M4 30 C 20 30 34 24 50 14" fill="none" stroke="#ff2e2e" stroke-width="6" stroke-linecap="round"/>' +
        '<path d="M38 6 L64 6 L56 30 Z" fill="#ff2e2e" stroke="#24182e" stroke-width="3.5" stroke-linejoin="round"/></svg>';
      box.appendChild(f);
    }
    UI.tmFlecheVue = true;
  } else if(f) f.parentNode.removeChild(f);
};

/* ---------- L'étape en cours : ce qu'il faut toucher maintenant ---------- */
function convOuverte(id){ var m = UI.modal; return !!m && m.type === 'conv' && m.id === id; }
var redonne = 0;
function versMargot(){
  if(UI.modal && !convOuverte('margot')){
    var parler = q('[data-act=parler][data-id=margot]');
    return parler || null;   /* une autre fenêtre est ouverte (pas la taverne) : on attend qu'elle se ferme */
  }
  var P = M.P();
  if(P.onglet !== 'carte') return q('.b-onglets [data-act=onglet][data-o=carte]');
  return q('#carte-ici g.ca-lieu[data-lieu="taverne"] .ca-etiq-lieu') || q('#carte-ici [data-act=lieu][data-id="taverne"]');
}
function cible(){
  var P = M.P();
  if(!P.vus['barde:margot:0']){
    if(convOuverte('margot')) return q('#voile [data-act=question][data-p=margot][data-i="0"]');
    return versMargot();
  }
  if(!P.vus['verite:margot:0']){
    if(!convOuverte('margot')) return versMargot();
    var b = q('#voile .bd-ment-p[data-p=margot][data-i="0"]:not(.bd-part)');
    if(b) return UI.tmFlecheVue || Date.now() - (UI.tmAttend || 0) > 1500 ? b : null;
    /* une autre question posée entre-temps : le bouton revient sous la première réponse */
    if(Date.now() - redonne > 1500 && M.barde && M.barde.redonnerMent){ redonne = Date.now(); M.barde.redonnerMent('margot', 0); }
    return null;
  }
  if(!P.vus['barde:margot:2']){
    if(!convOuverte('margot')) return versMargot();
    UI.tmQ2 = 0;
    return q('#voile [data-act=question][data-p=margot][data-i="2"]');
  }
  if(P.tutoMenteur !== 'liege'){
    if(q('#liege-ici') && !UI.modal){ P.tutoMenteur = 'liege'; M.sauver(); return cibleLiege(); }
    if(convOuverte('margot')){
      if(!UI.tmQ2) UI.tmQ2 = Date.now();
      return Date.now() - UI.tmQ2 > 2800 ? q('#voile [data-act=bd-tableau]') : null;   /* le temps qu'elle finisse sa phrase */
    }
    if(UI.modal) return null;
    return q('.b-onglets [data-act=onglet][data-o=role]');
  }
  return cibleLiege();
}
function cibleLiege(){
  var P = M.P();
  if(!q('#liege-ici')) return UI.modal ? null : q('.b-onglets [data-act=onglet][data-o=role]');
  var L = P.liege || {}, C = L.cartes || {}, F = L.fils || [];
  if(!C['signe:oreilles']) return UI.lgCat === 'signe' ? q('.lg-bac-carte[data-k="signe:oreilles"]') : q('.lg-cat[data-cat=signe]');
  if(!C['pnj:bastien']) return UI.lgCat === 'pnj' ? q('.lg-bac-carte[data-k="pnj:bastien"]') : q('.lg-cat[data-cat=pnj]');
  var relie = F.some(function(f){ return (f[0] === 'signe:oreilles' && f[1] === 'pnj:bastien') || (f[1] === 'signe:oreilles' && f[0] === 'pnj:bastien'); });
  if(relie){ finir(); return null; }
  var g = M.liegeGeste ? M.liegeGeste() : null;
  if(!g || g.mode !== 'fil') return q('.lg-bobine');
  if(!g.sel || g.sel === 'pnj:bastien') return q('.lg-carte[data-k="signe:oreilles"]');   /* (l'étiquette d'abord ; Bastien déjà choisi : l'étiquette aussi) */
  if(g.sel === 'signe:oreilles') return q('.lg-carte[data-k="pnj:bastien"]');
  return q('.lg-carte[data-k="' + g.sel + '"]');   /* une autre photo choisie : la retoucher la relâche */
}
function finir(){
  var P = M.P(); if(P.tutoMenteur === 'fini') return;
  P.tutoMenteur = 'fini'; M.sauver();
  poser(null);
  setTimeout(function(){
    var t = 'Bravo, tu sais repérer un menteur et l\'épingler ! Mais attention : maintenant, le bouton « Mensonge ? » ne reste pas longtemps. Guette le signe pendant qu\'on te répond !';
    M.son('magie');
    M.ouvrir({type:'info', ic:'🕵️', titre:'Bien joué !', t:t});
  }, 900);
}

/* ---------- Le rond jaune (le même que celui du tutoriel de l'enquête 1 : tuto.css) ---------- */
var rond = null, vise = null, boucle = 0, amene = null;
function lerond(){
  if(rond && rond.isConnected) return rond;
  rond = document.createElement('div');
  rond.className = 'tu-rond tm-rond'; rond.hidden = true; rond.setAttribute('aria-hidden', 'true');
  rond.innerHTML = '<i class="tu-onde"></i><i class="tu-anneau"></i>';
  document.body.appendChild(rond);
  return rond;
}
function poser(el){
  if(vise && vise !== el){ vise.classList.remove('tu-respire', 'tm-vise'); }
  vise = el && el.isConnected ? el : null;
  if(!vise){ if(rond) rond.hidden = true; if(M.calerDefilement) M.calerDefilement([]); return; }
  if(!(vise instanceof SVGElement)) vise.classList.add('tu-respire', 'tm-vise');
  if(M.calerDefilement) M.calerDefilement([vise]);
  amener(vise);
  if(!boucle) boucle = requestAnimationFrame(suivre);
}
/* la cible est cachée plus bas dans une fenêtre, ou au bout du bac : on la fait venir sous les yeux (pas plus d'une fois toutes les 2,5 s) */
function amener(el){
  try{
    if(el instanceof SVGElement) return;
    var r = el.getBoundingClientRect(), dedans = r.top >= 0 && r.bottom <= innerHeight && r.left >= 0 && r.right <= innerWidth;
    if(dedans || (amene && amene.el === el && Date.now() - amene.t < 2500)) return;
    amene = {el:el, t:Date.now()};
    el.scrollIntoView({block:'center', inline:'center', behavior:'smooth'});
  }catch(e){}
}
function placer(){
  var d = lerond();
  if(!vise || !vise.isConnected){ d.hidden = true; return false; }
  var r = vise.getBoundingClientRect();
  if(vise.classList.contains('tu-respire')){   /* le bouton qui respire : le rond garde la taille du bouton au repos (comme tuto.js) */
    var k = parseFloat(getComputedStyle(vise).scale) || 1;
    if(k > 0 && Math.abs(k - 1) > .001){ var cx = (r.left + r.right) / 2, cy = (r.top + r.bottom) / 2, w0 = r.width / k, h0 = r.height / k; r = {left:cx - w0 / 2, top:cy - h0 / 2, width:w0, height:h0}; }
  }
  if(!r.width && !r.height){ d.hidden = true; return true; }
  var w = Math.max(r.width + 14, 46), h = Math.max(r.height + 14, 46);
  d.style.width = Math.round(w) + 'px'; d.style.height = Math.round(h) + 'px';
  d.style.transform = 'translate(' + Math.round(r.left + r.width / 2 - w / 2) + 'px,' + Math.round(r.top + r.height / 2 - h / 2) + 'px)';
  d.hidden = false;
  return true;
}
function suivre(){
  boucle = 0;
  if(placer()) boucle = requestAnimationFrame(suivre);
}
function maj(){
  var el = null;
  try{ if(enJeu()) el = cible(); }catch(e){ console.error(e); }
  if(el !== vise) poser(el);
  else if(el){ amener(el); if(!boucle) boucle = requestAnimationFrame(suivre); }
}
M.menteurTutoCible = function(){ return enJeu() && vise ? vise : null; };   /* (robots) */
var r0 = M.render;
M.render = function(){
  var r = r0.apply(this, arguments);
  try{ maj(); }catch(e){ console.error(e); }
  return r;
};
setInterval(function(){ try{ if(concerne() || vise) maj(); }catch(e){} }, 250);
document.addEventListener('click', function(){ setTimeout(function(){ try{ maj(); }catch(e){} }, 30); }, true);
})();
