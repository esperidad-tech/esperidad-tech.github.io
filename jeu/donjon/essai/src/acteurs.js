/* Les acteurs de la salle des rats, en attendant les modules d'animation en pièces articulées.
   Ils ont EXACTEMENT les méthodes des modules (tout renvoie une Promise) :
     SALLE.RatImage.creer(conteneur)              -> entrer, attendre, mordre, touche, yeux('jaune'|'rouge'), enrager, ebloui(on),
                                                     retourner(on), bruler(on), tousser, coller(on), cible(on), fuir, exploser(scene), arreter
     SALLE.HerosImage.creer(conteneur, role, lk)  -> entrer, attendre, touche, tomber, relever, joie, choisi(on), arreter
        + Pisteur : tirer(scene, to, type), dague(scene, to)
        + Alchimiste : preparer(couleur), lancer(scene, to, couleur), louche(scene, to), herbes(scene, to)
        + Sage : sort(scene, to), bouclier(scene, cible) -> {absorber(n), retirer()}, etudier()
   Conventions : « scene » = le calque des effets (coordonnées de scène 960 x 372) ; « to » = {x, y} dans ces coordonnées ;
   « cible » du bouclier = {x, y, el, role} (el : la place du héros protégé) ; « type » du tir = 'fleche', 'feu', 'huile' ou 'colle'.
   Les méthodes d'attaque se résolvent AU MOMENT DE L'IMPACT (le jeu y place les dégâts) ; l'acteur revient à sa place tout seul.
   Le jeu choisit l'un ou l'autre : window.RatAnime / window.HerosAnime s'ils sont branchés, sinon ces versions-ci. */
(function(){
'use strict';
var S = window.SALLE = window.SALLE || {};
function attendre(ms){ return new Promise(function(ok){ setTimeout(ok, ms / (S.vitesse || 1)); }); }
function el(tag, cls, html){ var e = document.createElement(tag); if(cls) e.className = cls; if(html != null) e.innerHTML = html; return e; }
function q(s, r){ return r.querySelector(s); }
function relancer(e, cls){ e.classList.remove(cls); void e.offsetWidth; e.classList.add(cls); }
function img(nom){ return (S.img && S.img(nom)) || ''; }
function Fx(){ return S.Fx; }
/* la position de la place d'un acteur dans la scène (le conteneur est dans une place .perso posée dans la scène) */
function origine(c){ var p = c.offsetParent === c.parentNode ? c.parentNode : c.parentNode; return {x:p.offsetLeft + c.offsetLeft, y:p.offsetTop + c.offsetTop}; }

/* =================== le rat (une image : yeux jaunes ou rouges) =================== */
var RatImage = {creer:function(c){
  c.innerHTML = '<div class="a-corps"><div class="a-bouge"><div class="a-tremble"><div class="a-pose">' +
    '<div class="a-rage"></div><img class="a-img" src="' + img('rat-jaune') + '" alt=""><div class="a-flammes"></div><div class="a-ventre"></div>' +
    '</div></div></div></div>';
  var corps = q('.a-corps', c), bouge = q('.a-bouge', c), tremble = q('.a-tremble', c), pose = q('.a-pose', c), image = q('.a-img', c), flammes = q('.a-flammes', c);
  var A = {};
  A.entrer = function(){
    corps.style.transition = 'none'; corps.style.transform = 'translateX(640px)'; void corps.offsetWidth;
    c.classList.add('trotte');
    corps.style.transition = 'transform 1.05s cubic-bezier(.25,.75,.35,1)'; corps.style.transform = 'translateX(0)';
    return attendre(1050).then(function(){ c.classList.remove('trotte'); corps.style.transition = ''; return attendre(60); });
  };
  A.attendre = function(){ c.classList.add('respire'); return Promise.resolve(); };
  A.mordre = function(o){
    if(typeof o === 'function') o = {onImpact:o};
    o = o || {};
    var impact, impactP = new Promise(function(r){ impact = r; });
    bouge.style.transition = 'transform .12s ease-in'; bouge.style.transform = 'translateX(-74px) rotate(-7deg) scaleX(1.06)';
    var p = attendre(125).then(function(){
      if(o.onImpact) try{ o.onImpact(); }catch(e){}
      impact();
      return attendre(60);
    }).then(function(){ bouge.style.transition = 'transform .26s ease-out'; bouge.style.transform = ''; return attendre(270); });
    p.impact = impactP;
    return p;
  };
  A.touche = function(){ relancer(bouge, 'secoue'); relancer(image, 'blanchit'); return attendre(380); };
  A.yeux = function(couleur){ image.src = img(couleur === 'rouge' ? 'rat-rouge' : 'rat-jaune'); return Promise.resolve(); };
  A.enrager = function(){
    A.yeux('rouge');
    relancer(pose, 'cabre-rage');
    var o = origine(c), x = o.x + c.offsetWidth * .3, y = o.y + c.offsetHeight * .2;
    for(var k = 0; k < 6; k++){
      var v = el('img', 'vapeur'); v.src = img('fumee-' + 'abc'[k % 3]); Fx().particule(v, {x:x + (k % 3) * 12, y:y, vx:(Math.random() - .5) * 60, vy:-80 - Math.random() * 60, g:-20, vie:.9, s0:.08, s1:.32, delai:k * .06});
    }
    return attendre(700).then(function(){ pose.classList.remove('cabre-rage'); c.classList.add('enrage'); });
  };
  A.ebloui = function(on){ c.classList.toggle('dresse', !!on); return attendre(on ? 380 : 300); };
  A.retourner = function(on){
    if(on){ c.classList.add('dos'); return attendre(720); }
    c.classList.remove('dos'); relancer(pose, 'releve'); return attendre(460).then(function(){ pose.classList.remove('releve'); });
  };
  A.bruler = function(on){
    flammes.innerHTML = '';
    c.classList.toggle('brule', !!on);
    if(on) [[30, 18, 1], [46, 6, 1.25], [62, 14, 1.05], [76, 28, .85], [40, 34, .7]].forEach(function(p, k){
      var f = el('img', 'flamme'); f.src = img('flamme'); f.alt = '';
      f.style.cssText = 'left:' + p[0] + '%;top:' + p[1] + '%;--t:' + p[2] + ';animation-delay:' + (-k * .17) + 's,' + (-k * .23) + 's';
      flammes.appendChild(f);
    });
    return attendre(on ? 300 : 0);
  };
  A.tousser = function(){   /* une quinte : quatre toux en 2,6 s, comme le module */
    [.14, .4, .62, .84].forEach(function(t){ setTimeout(function(){ relancer(tremble, 'tousse'); }, 2600 * t / (S.vitesse || 1)); });
    return attendre(2600);
  };
  A.coller = function(on){ c.classList.toggle('colle', !!on); return attendre(on ? 300 : 0); };
  A.cible = function(on){ c.classList.toggle('vise-ventre', !!on); return attendre(on ? 250 : 0); };
  A.fuir = function(){
    c.classList.add('peur');
    return attendre(260).then(function(){
      c.classList.add('trotte');
      corps.style.transition = 'transform .85s cubic-bezier(.5,0,.8,.6)'; corps.style.transform = 'translateX(720px)';
      return attendre(860);
    }).then(function(){ c.style.visibility = 'hidden'; });
  };
  A.exploser = function(scene){
    /* il gonfle et tremble, puis éclate : des touffes partent en étoile (la brume noire est l'effet d'écran du jeu) ; .boom : l'instant où il éclate */
    var boomOk, boomP = new Promise(function(ok){ boomOk = ok; });
    pose.classList.add('gonfle');
    var p = attendre(430).then(function(){
      boomOk();
      pose.classList.add('eclate');
      var o = origine(c), x = o.x + c.offsetWidth * .55, y = o.y + c.offsetHeight * .5;
      for(var k = 0; k < 14; k++){
        var a = k / 14 * Math.PI * 2, v = 280 + Math.random() * 260, t = el('div', 'touffe-fx'), s = 12 + Math.random() * 16;
        t.style.width = s + 'px'; t.style.height = (s * .55) + 'px';
        Fx().particule(t, {calque:scene, x:x, y:y, vx:Math.cos(a) * v, vy:Math.sin(a) * v - 260, g:1100, vie:.9 + Math.random() * .4, vr:(Math.random() - .5) * 1400, sol:358});
      }
      return attendre(420);
    }).then(function(){ c.style.visibility = 'hidden'; });
    p.boom = boomP;
    return p;
  };
  A.arreter = function(){ c.classList.remove('respire', 'trotte', 'enrage', 'colle'); return Promise.resolve(); };
  return A;
}};

/* =================== les héros (une image fixe chacun) =================== */
/* des points du dessin (280 x 320, le héros posé à (40, 40), à l'échelle 0,8) */
var POINTS = {
  pisteur:{arc:[237, 121], milieu:[139, 170]},
  alchimiste:{fiole:[135, 10], main:[205, 132], milieu:[139, 170]},
  sage:{main:[221, 109], livre:[162, 152], milieu:[139, 170]}
};
var HerosImage = {creer:function(c, role){
  c.innerHTML = '<div class="a-corps"><div class="a-bouge"><div class="a-pose"><div class="a-tourne"><img class="a-img" src="' + img('heros-' + role) + '" alt=""></div></div></div></div>';
  var corps = q('.a-corps', c), bouge = q('.a-bouge', c), pose = q('.a-pose', c), image = q('.a-img', c);
  function pt(nom){ var o = origine(c), p = POINTS[role][nom]; return {x:o.x + p[0], y:o.y + p[1]}; }
  function avance(dx, ms, retour){
    bouge.style.transition = 'transform ' + (ms || 140) + 'ms ease-out'; bouge.style.transform = 'translateX(' + dx + 'px)';
    setTimeout(function(){ bouge.style.transition = 'transform ' + (retour || 300) + 'ms ease-out'; bouge.style.transform = ''; }, (ms || 140) + 30);
  }
  var A = {};
  A.entrer = function(){
    corps.style.transition = 'none'; corps.style.transform = 'translateX(-600px)'; void corps.offsetWidth;
    c.classList.add('court');
    corps.style.transition = 'transform 1.2s cubic-bezier(.2,.7,.3,1)'; corps.style.transform = 'translateX(0)';
    return attendre(1200).then(function(){ c.classList.remove('court'); corps.style.transition = ''; relancer(bouge, 'arrive'); return attendre(200); });
  };
  A.attendre = function(){ c.classList.add('respire'); return Promise.resolve(); };
  A.touche = function(){ relancer(bouge, 'secoue'); relancer(image, 'blanchit'); return attendre(380); };
  A.tomber = function(){ c.classList.add('au-sol'); return attendre(520); };
  A.relever = function(){ c.classList.remove('au-sol'); relancer(bouge, 'arrive'); return attendre(520); };
  A.joie = function(){ relancer(bouge, 'saute'); return attendre(1000); };
  A.choisi = function(on){ c.classList.toggle('choisi', !!on); if(on) relancer(bouge, 'pret'); return Promise.resolve(); };
  A.arreter = function(){ c.classList.remove('respire', 'court'); return Promise.resolve(); };
  if(role === 'pisteur'){
    A.tirer = function(scene, to, type){
      var p = pt('arc'), coul = {feu:'#ff7a2a', huile:'#f2b630', colle:'#ece4d0'}[type];   /* type : 'normale' (ou 'fleche'), 'feu', 'huile', 'colle' */
      var f = el('div', 'fleche-vol' + (coul ? ' trempee' : ''), '<svg viewBox="0 0 62 14"><path d="M2 7 L 50 7" stroke="#24182e" stroke-width="6" stroke-linecap="round"/><path d="M2 7 L 50 7" stroke="#d9b46a" stroke-width="2.6" stroke-linecap="round"/>' +
        (coul ? '<circle cx="54" cy="7" r="9" fill="' + coul + '" opacity=".6"/>' : '') + '<path d="M60 7 L 47 1 L 48 13 Z" fill="' + (coul || '#c8d2e4') + '" stroke="#24182e" stroke-width="2" stroke-linejoin="round"/><path d="M4 7 L -6 1 L -2 7 L -6 13 Z" fill="#e04a3a" stroke="#24182e" stroke-width="1.6"/></svg>');
      scene.appendChild(f);
      avance(-12, 90, 260);
      return Fx().vol(f, p.x, p.y, to.x, to.y, 18, 240, 0, true).then(function(){ f.remove(); });
    };
    A.dague = function(scene, to){
      var dx = Math.max(0, to.x - pt('milieu').x - 120);
      bouge.style.transition = 'transform .16s ease-in'; bouge.style.transform = 'translateX(' + dx + 'px)';
      return attendre(165).then(function(){
        var e = el('div', 'entaille'); e.style.left = to.x + 'px'; e.style.top = to.y + 'px'; scene.appendChild(e); setTimeout(function(){ e.remove(); }, 380);
        setTimeout(function(){ bouge.style.transition = 'transform .3s ease-out'; bouge.style.transform = ''; }, 90);
      });
    };
  }
  var fiole = null;
  function fioleSvg(c){
    return '<svg viewBox="-4 -8 48 58" class="fiole-forme"><circle cx="20" cy="30" r="19" fill="' + c + '" opacity=".28"/>' +
      '<path d="M15 6 L 25 6 L 25 14 C 34 18 36 34 28 42 C 24 46 16 46 12 42 C 4 34 6 18 15 14 Z" fill="' + c + '" stroke="#24182e" stroke-width="3" stroke-linejoin="round"/>' +
      '<path d="M10 28 C 14 26 26 26 30 28 C 31 36 26 42 20 42 C 14 42 9 36 10 28 Z" fill="rgba(0,0,0,.18)"/>' +
      '<path d="M13 2 L 27 2 L 27 8 L 13 8 Z" fill="#8a5a32" stroke="#24182e" stroke-width="3" stroke-linejoin="round"/>' +
      '<path d="M14 22 Q 15 18 19 17" stroke="#fff" stroke-width="2.4" fill="none" stroke-linecap="round" opacity=".8"/></svg>';
  }
  if(role === 'alchimiste'){
    A.preparer = function(couleur){
      var p = pt('fiole');
      fiole = el('div', 'fiole-vol prepare', '<div class="lueur-prep" style="background:radial-gradient(closest-side,' + couleur + ',rgba(0,0,0,0))"></div>' + fioleSvg(couleur));
      fiole.style.transform = 'translate(' + p.x + 'px,' + p.y + 'px)';
      (S.Fx.calques().fx).appendChild(fiole);
      for(var k = 0; k < 8; k++) (function(k){
        setTimeout(function(){
          var b = el('div', 'bulle-air'); b.style.left = (p.x - 10 + (k % 3) * 7) + 'px'; b.style.top = (p.y - 34) + 'px'; b.style.setProperty('--bx', ((k % 2 ? 1 : -1) * (4 + k * 2)) + 'px');
          S.Fx.calques().fx.appendChild(b); setTimeout(function(){ b.remove(); }, 520);
        }, k * 60);
      })(k);
      return attendre(520);
    };
    A.lancer = function(scene, to, couleur){
      if(!fiole) A.preparer(couleur);
      var f = fiole, p = pt('fiole'); fiole = null;
      f.classList.remove('prepare'); var l = q('.lueur-prep', f); if(l) l.remove();
      avance(10, 120, 280);
      return Fx().vol(f, p.x, p.y, to.x, to.y, 120, 500, 560).then(function(){ f.remove(); });
    };
    A.louche = function(scene, to){
      var dx = Math.min(220, (to ? to.x : 600) - pt('milieu').x - 110);
      bouge.style.transition = 'transform .2s ease-in'; bouge.style.transform = 'translateX(' + dx + 'px)';
      return attendre(200).then(function(){ relancer(pose, 'frappe'); setTimeout(function(){ bouge.style.transition = 'transform .32s ease-out'; bouge.style.transform = ''; }, 140); });
    };
    A.herbes = function(scene, to){
      var p = pt('main');
      avance(8, 120, 260);
      var feuilles = [];
      for(var k = 0; k < 5; k++){ var f = el('div', 'feuille-vol', '🌿'); scene.appendChild(f); feuilles.push(Fx().vol(f, p.x, p.y, to.x + (k - 2) * 10, to.y + (k % 2) * 14, 70 + k * 10, 520 + k * 50, 300).then((function(f){ return function(){ f.remove(); }; })(f))); }
      return Promise.all(feuilles);
    };
  }
  if(role === 'sage'){
    A.sort = function(scene, to){
      var p = pt('main');
      avance(14, 140, 300);
      Fx().eclat(p.x, p.y, 120, 'radial-gradient(closest-side,rgba(191,248,255,.95),rgba(63,208,255,0))', 380);
      var o = el('div', 'orbe'); scene.appendChild(o);
      return attendre(160).then(function(){ return Fx().vol(o, p.x, p.y, to.x, to.y, 30, 380, 0); }).then(function(){ o.remove(); });
    };
    A.etudier = function(){
      var p = pt('livre');
      Fx().eclat(p.x, p.y, 110, 'radial-gradient(closest-side,rgba(143,243,255,.9),rgba(63,208,255,0))', 600);
      relancer(bouge, 'lit');
      return attendre(650);
    };
    A.bouclier = function(scene, cible){
      /* cible : le conteneur du héros protégé (comme le module), ou un point {x, y} */
      if(cible && cible.nodeType === 1){ var o2 = origine(cible); cible = {x:o2.x + 139, y:o2.y + 142}; }
      var d = el('div', 'dome', '<i class="dome-anneau"></i><i class="dome-runes"></i>');
      d.style.left = cible.x + 'px'; d.style.top = cible.y + 'px';
      scene.appendChild(d);
      avance(10, 140, 300);
      relancer(d, 'nait');
      return attendre(620).then(function(){
        return {
          absorber:function(n){ relancer(d, 'encaisse'); return attendre(300); },
          retirer:function(){ d.classList.add('part'); return attendre(500).then(function(){ d.remove(); }); }
        };
      });
    };
  }
  return A;
}};

S.RatImage = RatImage;
S.HerosImage = HerosImage;
})();
