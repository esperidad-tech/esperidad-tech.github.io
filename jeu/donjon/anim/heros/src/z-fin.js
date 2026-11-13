
/* ============ les apparences (Persos.defaut du jeu) ============ */
var PE = {p1:['#fff1e6', '#f7caa6', '#e8ad89', '#ff8f8f'], p2:['#ffe7d2', '#efb88e', '#d9976d', '#ff877a'], p3:['#f8d8b0', '#dea575', '#c48652', '#f2786a'],
  p4:['#eec899', '#c7935c', '#a77441', '#e4685a'], p5:['#d29d6f', '#a06840', '#80502d', '#d65a50'], p6:['#ad774e', '#6f4428', '#55331c', '#c84c4a']};
var CH = {brun:['#d39654', '#7c4624', '#3a1e0e'], noir:['#6b7096', '#272840', '#0e0e1a'], blond:['#fff4c2', '#f0c95a', '#a8781c'], roux:['#ffb886', '#dc622a', '#7a2a0e'], rose:['#ffd6ea', '#f07aab', '#932659'], chatain:['#e6bb85', '#a06f40', '#4c2d14']};
var YX = {vert:['#0a3a22', '#1f9150', '#86ffbd'], bleu:['#0a1f4a', '#2f6fd0', '#a6dcff'], marron:['#2a1206', '#7a4420', '#e0a876'], ambre:['#3a1a02', '#c47a10', '#ffd98a'], gris:['#1e2430', '#5f6f86', '#d6e2f0']};
var DEFAUT = {pisteur:{fille:true, pe:PE.p1, ch:CH.roux, ir:YX.vert}, alchimiste:{fille:false, pe:PE.p4, ch:CH.noir, ir:YX.ambre}, sage:{fille:true, pe:PE.p5, ch:CH.noir, ir:YX.ambre, lunettes:true}};
var AUTRES = {pisteur:{fille:false, pe:PE.p6, ch:CH.noir, ir:YX.marron}, alchimiste:{fille:true, pe:PE.p2, ch:CH.blond, ir:YX.bleu}, sage:{fille:false, pe:PE.p3, ch:CH.chatain, ir:YX.gris}};

/* la photo d'un héros au repos, à son apparence (Promise -> l'adresse « data: » d'une image, ou null) : pour les petites têtes de
   l'écran quand l'allure vient de l'enquête (moteur/src/noyau.js, DJ.poserLook). La photo fait 280 × 320, le héros y est posé comme
   dans la scène : sa boîte de 200 × 240 à (40, 40). k : la finesse (2 par défaut). */
function photo(role, lk, k){
  k = k || 2;
  return new Promise(function(ok){
    try{
      var spec = ROLES[role].fab(fusionLk(role, lk), false);
      /* (le dessin est écrit pour une page : on le fait relire par le navigateur, qui le rend en vrai SVG, bien formé) */
      var h = document.createElement('div'); h.innerHTML = spec.svg;
      var el = h.firstElementChild; el.setAttribute('width', 250); el.setAttribute('height', 300);
      /* (au repos, le Sage tient son bâton droit devant lui : le cristal lui cache le visage — on l'enlève de la photo) */
      if(role === 'sage'){ var mb = el.querySelector('[data-j="mainB"]'); if(mb) mb.parentNode.removeChild(mb); }
      var svg = new XMLSerializer().serializeToString(el);
      var im = new Image();
      im.onload = function(){
        try{
          var c = document.createElement('canvas'); c.width = 280 * k; c.height = 320 * k;
          c.getContext('2d').drawImage(im, 40 * k, 40 * k, 200 * k, 240 * k);
          ok(c.toDataURL('image/png'));
        }catch(e){ ok(null); }
      };
      im.onerror = function(){ ok(null); };
      im.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
    }catch(e){ ok(null); }
  });
}

var HerosAnime = {
  creer:function(conteneur, role, lk){ return new Heros(conteneur, role, lk); },
  photo:photo,
  /* cuire les héros une fois (Promise), pendant un écran calme : ensuite, creer() en fait des copies fluides (RAPIDITE.md) */
  preparer:preparer,
  DEFAUT:DEFAUT, AUTRES:AUTRES, PEAUX:PE, CHEVEUX:CH, YEUX:YX,
  /* les objets (equiper), les sortes de flèches (tirer), les potions par leur nom (lancer, preparer), les réactions (touche) */
  OBJETS:Object.keys(OBJETS), FLECHES:['normale', 'rebond'].concat(TYPES_FL), POTIONS:POTIONS, REACTIONS:['froid', 'grouillement', 'poing'],
  grain:true
};
window.HerosAnime = HerosAnime;
})();
