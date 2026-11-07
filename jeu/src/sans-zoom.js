/* ==========================================================
   Brumeval — la page ne zoome jamais (Romain : « pour éviter les accidents »)
   Le bandeau du haut et les onglets du bas restent fixes et plein écran, pour tous les rôles.
   - build.py : <meta viewport … maximum-scale=1, user-scalable=no> ;
   - CSS : touch-action pan-x pan-y partout où un module ne dit rien d'autre (ni pincer, ni toucher deux fois pour zoomer) ;
   - iOS Safari ignore le meta : on bloque gesturestart / gesturechange, et tout geste à deux doigts (touchmove) ;
   - ordinateur : Ctrl + molette (ou pincer sur le pavé tactile) ne zoome pas la page.
   La carte se zoome avec ses boutons ＋ / − (carte.js, Carte.monter), plus à deux doigts (3 novembre).
   Le tableau de liège du Barde garde son zoom à deux doigts : il passe par les événements « pointer »,
   pas par le zoom du navigateur, donc il marche quand même. Un autre module qui voudrait zoomer fera pareil.
   ========================================================== */
(function(){
'use strict';
if(window.__brumeSansZoom) return;
window.__brumeSansZoom = true;
try{
  /* :where() = aucune priorité : la moindre règle d'un module (touch-action:none de l'atelier, pan-y d'une liste…) passe devant */
  var st = document.createElement('style');
  st.textContent = ':where(html, body, body *:not(input):not(textarea):not(select)){touch-action:pan-x pan-y}';
  (document.head || document.documentElement).appendChild(st);
}catch(e){}
function bloquer(e){ if(e.cancelable) e.preventDefault(); }
/* iOS seulement (là où existent les « gesture ») : sur Android, le meta et le CSS suffisent, et un écouteur touchmove
   non passif sur toute la page ralentirait tous les défilements des tablettes modestes */
if('ongesturestart' in window || 'GestureEvent' in window){
  ['gesturestart', 'gesturechange', 'gestureend'].forEach(function(t){ document.addEventListener(t, bloquer, {passive:false}); });
  document.addEventListener('touchmove', function(e){ if(e.touches && e.touches.length > 1) bloquer(e); }, {passive:false});
}
document.addEventListener('wheel', function(e){ if(e.ctrlKey) bloquer(e); }, {passive:false});
})();
