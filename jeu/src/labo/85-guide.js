/* ============ Le guide de la première analyse (enquête 1, le tutoriel) ============
   Romain, 11 novembre, 13 h 42 : « la première fois qu'on va sur la paillasse, est-ce que tu peux faire en sorte de guider ? »
   Le jeu le demande dans sa fiche (CFG.guide = le dossier à guider, d'habitude les poils de la fenêtre) : seulement au tutoriel,
   et seulement tant qu'aucune analyse n'est faite.
   À chaque instant, le guide regarde où on en est (rien n'est bloqué : on peut toucher ailleurs, il suit) et montre UNE chose :
   un rond jaune qui pulse autour de ce qu'il faut toucher, et une phrase racontée en haut de l'écran (avec son 🔊, jamais « Touche … »).
   Il ne souffle jamais la réponse : dans le tiroir, il montre le bon casier, mais c'est à l'Alchimiste de trouver le bon échantillon ;
   au microscope, il montre le bon grossissement, pas l'endroit où chercher.
   Le chemin (les poils de la fenêtre) : choisir l'échantillon → la loupe → le bon tiroir → le bon casier → comparer ;
   puis le microscope → le bon grossissement → attraper ce qui se cache → revenir → choisir la coupelle → la loupe → tiroir → casier → comparer ;
   le dossier est bouclé : l'ardoise (le code) → revenir → retourner à l'atelier. */
var GUIDE = {id:null, el:null, rond:null, cle:'', vuArdoise:false, fini:false, t:0};
function guideEl(sel){ var e = typeof sel === 'string' ? document.querySelector(sel) : sel; if(!e) return null; var r = e.getBoundingClientRect(); return r.width > 2 && r.height > 2 ? e : null; }
function tiroirDe(casier){ return TIROIRS.g.indexOf(casier) >= 0 ? 'g' : 'd'; }
/* Ce qu'il reste à reconnaître dans le dossier guidé, dans l'ordre (l'échantillon lui-même d'abord) */
function guideManque(d){ return (OBJETS[d].requis || [d]).filter(function(t){ return !S.trouves[t]; })[0] || null; }
/* Le plus petit grossissement où l'on peut attraper une chose (i.min : elle se devine de loin, mais ne s'attrape que de plus près) */
function guideZoom(d, t){
  var it = (S.dos[d] || {}).items || {}, z = [10, 40, 100].filter(function(z){ return (it[z] || []).some(function(i){ return i.t === t && !i.pris && !(i.min > z); }); });
  return z.length ? z[0] : null;
}
function coupeDe(t){ var i = D().coupes.findIndex(function(c){ return c && c.t === t; }); return i >= 0 ? '#coupe' + i : null; }
/* Une étape pour reconnaître t à la loupe (l'échantillon du cuir, ou ce qu'on a mis en coupelle) */
function guideLoupe(t, ou){
  var o = OBJETS[t], tir = tiroirDe(o.tiroir);
  if(!S.mode){
    if(S.sel !== t) return {c:ou, t:ou.indexOf('coupe') >= 0 ? 'Ta trouvaille t\'attend dans sa coupelle. Un coup de loupe, et elle n\'aura plus de secret !' : 'Sur ton carré de cuir, ' + nomObjet(t) + ' attend. C\'est lui qu\'on va faire parler !', k:'sel-' + t};
    var cuir = ou.indexOf('coupe') < 0;
    return {c:'#gLoupe', t:cuir ? 'D\'abord, la loupe ! Un bon Alchimiste regarde avant de toucher.' : 'La loupe, encore ! Elle adore les petits mystères.', k:'loupe-' + t};
  }
  if(S.mode !== 'loupe') return {c:'#bFermer', t:'Pas par là ! Reviens à ta paillasse.', k:'retour-' + t};
  if(S.sel !== t) return {c:'#bFermer', t:'Oups, ce n\'est pas le bon. Reviens à ta paillasse.', k:'autre-' + t};
  if(S.tiroir !== tir) return {c:'[data-act="tiroir"][data-t="' + tir + '"]', t:surCuir(t) ? 'Hmm… qu\'est-ce que c\'est ? Ton tiroir est plein d\'échantillons pour comparer. Ouvre celui-là !' : 'Ce tout petit truc… tes tiroirs le connaissent sûrement !', k:'tir-' + t};
  if(S.casier !== o.tiroir) return {c:'[data-casier="' + o.tiroir + '"]', t:'Le bon casier, c\'est celui des ' + CASIERS[o.tiroir].toLowerCase() + ' !', k:'cas-' + t};
  return {c:null, t:'Lequel ressemble à ton échantillon, sous le verre ? Regarde bien… et choisis !', k:'comp-' + t};
}
function guideEtape(){
  var d = GUIDE.id; if(!d || !S.dos[d] || ATTENTE[d]) return null;
  if(S.finis[d]){
    if(S.mode === 'ardoise'){ GUIDE.vuArdoise = true; return {c:'#bFermer', t:'Voilà ton code ! Retiens bien ses trois formes. Puis reviens à ta paillasse.', k:'ard-vu'}; }
    /* (13 novembre) le ✅ de l'échantillon n'arrive qu'une fois TOUT vu (50-scene.js) : ici, on a trouvé l'essentiel, pas forcément tout */
    if(S.mode) return {c:'#bFermer', t:'Bravo, tu as trouvé l\'essentiel ! Reviens à ta paillasse.', k:'fin-ret'};
    if(!GUIDE.vuArdoise) return {c:'#gArdoise', t:'L\'essentiel est trouvé ! Ton code s\'est écrit tout seul sur l\'ardoise. Va le voir de près !', k:'ard'};
    return {c:'#bQuitter', t:'Mission accomplie ! Retourne à ton atelier : il y a du nouveau à noter.', k:'quitter'};
  }
  var t = guideManque(d); if(!t) return null;
  if(t === d) return guideLoupe(d, '#ech-' + d);
  /* une chose cachée dans l'échantillon : d'abord l'attraper au microscope, puis la reconnaître à la loupe */
  var cp = coupeDe(t);
  if(cp && !(S.mode === 'micro')) return guideLoupe(t, cp);
  if(!S.mode){
    if(S.sel !== d) return {c:'#ech-' + d, t:'Ce n\'est pas tout ! Quelque chose se cache dedans. Reprends ' + nomObjet(d) + ' !', k:'sel2'};
    return {c:'#gMicro', t:'Au microscope, maintenant ! Il voit ce que tes yeux ne voient pas.', k:'micro'};
  }
  if(S.mode !== 'micro') return {c:'#bFermer', t:'Reviens à ta paillasse : le microscope t\'attend !', k:'ret-micro'};
  if(cp) return {c:'#bFermer', t:'Attrapé ! C\'est dans une coupelle. Reviens à ta paillasse.', k:'attrape'};
  var z = guideZoom(d, t);
  if(z && S.zoom !== z) return {c:'#zoomTxt', t:'Plus fort ! Tourne la molette du microscope.', k:'zoom-' + z};
  return {c:null, t:'Quelque chose se cache là-dedans… Vise-le : ta pince l\'attrape !', k:'cherche'};
}
function guideTick(){
  if(!GUIDE.id || GUIDE.fini) return;
  var e = null;
  try { e = guideEtape(); } catch(err){ e = null; }
  if(!e){ guideCacher(); if(S.finis[GUIDE.id]) GUIDE.fini = true; return; }
  GUIDE.c = e.c || null;
  if(e.k !== GUIDE.cle){
    GUIDE.cle = e.k;
    var b = GUIDE.el; if(!b){ b = GUIDE.el = document.createElement('div'); b.className = 'guide-bandeau'; b.setAttribute('role', 'status'); document.body.appendChild(b); }
    b.innerHTML = '<span class="gb-t"></span>'; b.querySelector('.gb-t').textContent = e.t; avecSon(b, e.t);
    b.classList.remove('arrive'); void b.offsetWidth; b.classList.add('arrive');
  }
  var cible = e.c && !S.occupe ? guideEl(e.c) : null, r = GUIDE.rond;
  $$('.guide-bouge').forEach(function(x){ if(x !== cible) x.classList.remove('guide-bouge'); });
  if(!cible){ if(r) r.hidden = true; return; }
  if(!r){ r = GUIDE.rond = document.createElement('div'); r.className = 'guide-rond'; document.body.appendChild(r); }
  var q = cible.getBoundingClientRect(), w = Math.max(44, q.width + 18), h = Math.max(44, q.height + 18);
  if(Math.max(w, h) < 140){ w = h = Math.max(w, h); }
  r.hidden = false; r.style.left = (q.left + q.width/2 - w/2) + 'px'; r.style.top = (q.top + q.height/2 - h/2) + 'px'; r.style.width = w + 'px'; r.style.height = h + 'px';
  /* (les boutons du coin bougent aussi, comme dans le jeu ; pas les dessins de la paillasse, qui ont déjà leur place) */
  if(cible.tagName === 'BUTTON' && cible.id !== 'bQuitter') cible.classList.add('guide-bouge');
}
function guideCacher(){ if(GUIDE.el){ GUIDE.el.remove(); GUIDE.el = null; } if(GUIDE.rond){ GUIDE.rond.remove(); GUIDE.rond = null; } GUIDE.cle = ''; $$('.guide-bouge').forEach(function(x){ x.classList.remove('guide-bouge'); }); }
function guideDemarrer(d){
  if(!d || !OBJETS[d] || !surCuir(d)) return;
  GUIDE.id = d;
  setInterval(guideTick, 250);
}
