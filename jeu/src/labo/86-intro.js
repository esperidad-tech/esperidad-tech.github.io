/* ============ L'explication en images, la toute première fois ============
   Romain, 11 novembre, 13 h 42 : « une explication en images avant d'entrer au labo : oui, c'est bien de faire ça » (comme avant
   chaque mini-jeu : des images, puis un bouton jaune). Le jeu la demande dans sa fiche (CFG.intro), une seule fois par héros ;
   on la referme avec le bouton jaune, et le labo dit au jeu « introVue ». Les images sont de vraies vues du labo (INTRO_IMG, 12-intro-img.js,
   refaites par jeu/tools/labo-intro-images.py). */
var INTRO_PAS = [
  {img:'cuir', t:'Ce que l\'équipe te donne arrive sur ton carré de cuir. Choisis un échantillon !'},
  {img:'loupe', t:'Sous la loupe, compare-le aux échantillons de tes tiroirs. Lequel est pareil ?'},
  {img:'micro', t:'Le microscope voit ce qui se cache. Ta pince l\'attrape et le pose dans une coupelle.'},
  {img:'ardoise', t:'L\'essentiel trouvé, ton code s\'écrit sur l\'ardoise. Tout vu : un ✅ sur l\'échantillon !'}   /* (13 novembre : le ✅ seulement quand tout est vu, 50-scene.js) */
];
function introOuvrir(fin){
  var imgs = (typeof INTRO_IMG === 'object' && INTRO_IMG) || {};
  var o = document.createElement('div'); o.className = 'intro'; o.setAttribute('role', 'dialog'); o.setAttribute('aria-label', 'Le labo de l\'Alchimiste');
  var h = '<div class="intro-carte"><h2>🔬 Ton labo d\'Alchimiste</h2><div class="intro-pas">';
  INTRO_PAS.forEach(function(p, i){
    h += '<figure>' + (imgs[p.img] ? '<img alt="" src="' + imgs[p.img] + '">' : '') + '<figcaption><b>' + (i + 1) + '</b><span></span><button type="button" class="b-son" aria-label="Écouter" data-lire="' + i + '">🔊</button></figcaption></figure>';
  });
  h += '</div><button type="button" class="intro-go">🔬 Au travail !</button></div>';
  o.innerHTML = h;
  o.querySelectorAll('figcaption span').forEach(function(s, i){ s.textContent = INTRO_PAS[i].t; });
  o.addEventListener('click', function(e){
    e.stopPropagation();
    var b = e.target.closest('[data-lire]');
    if(b){ lire(INTRO_PAS[+b.dataset.lire].t); return; }
    if(e.target.closest('.intro-go')){ son('clic'); o.remove(); dire('introVue'); if(fin) fin(); }
  });
  document.body.appendChild(o);
}
