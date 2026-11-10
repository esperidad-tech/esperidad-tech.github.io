/* betes.js — un adaptateur par bête : il cache les différences entre les modules animés (MOTEUR-DONJON.md §3.2).
   Le combat ne parle qu'à l'adaptateur ; l'adaptateur parle au module (BETES[module], ou RatAnime pour le rat d'égout,
   qui date d'avant le contrat). Le détail, bête par bête, est dans moteur/REGLES.md §5.

     var a = DJ.Betes.creer(bete, salle, rang, persos, scene)   bete : {id, type, module, rang…} (l'évènement « arrive »)
     a.cadre                      {x, y, w, h} dans la scène (960 × 372) ; a.el : son <div class="perso bete">
     a.entrer(par, o)             'debut' | 'eclosion' | 'plongeon'   (o.onPas pour le Gardien)
     a.touche(coup, o)            sa réaction à un coup ; a.rebond(coup) : il est immunisé
     a.special(nom, o)            un moment à lui (rien si le module l'a déjà lancé tout seul dans touche)
     a.etat(nom, on), a.ouvert(on)
     a.attaquer(nom, {vers:[points de scène], fois, onImpact(i), onAvale})   -> Promise (il est revenu)
     a.fuir(), a.mourir(), a.exploser(scene, o)
     a.ancre(nom)                 un point de la bête, dans la scène : tete, pointfaible, centre, bouche, pieds, haut
     a.accorder(etats, ouvert)    remet le module d'accord avec les règles (elles font foi)
     a.arreter()
   Les modules ne jouent aucun son : c'est le combat qui s'en charge (DJ.Betes.SONS). */
(function(){
'use strict';
var DJ = window.DJ, el = DJ.el, q = DJ.q;
var SOL = 340;

/* où se tiennent les bêtes, salle par salle : la gauche de leur cadre (dans l'ordre de la file ; 0 = devant) */
var PLACES = {
  rats:[498, 624, 750], canaux:[498, 588, 728], egouts:[560], toiles:[478, 612, 742], atelier:[478, 640],
  crypte:[520, 700], ossuaire:[486, 694, 792], bassin:[446, 538, 470]
};
/* les petites qui arrivent en plein combat se glissent devant, sans pousser les grosses */
var AVANT = {petitearaignee:[452, 522, 592, 662], tetard:[446, 538, 630, 722]};
/* le rat d'égout (RatAnime) : un cadre de 180 × 112, le sol à 85,7 % de la hauteur (les mesures de la salle d'essai) */
var INFO_RAT = {id:'rat', nom:'Rat d\'égout', rang:'normal', cadre:{w:200, h:124.4}, sol:.857, vole:false, places:1};
/* ce que touche() lance déjà tout seul dans chaque module : le « special » des règles ne doit pas le relancer */
var AUTO = {
  ratcuir:['tournis', 'casque-tombe', 'armure-tombe', 'armure-eclate'], feufollet:['accroche', 'grandit'],
  roirats:['tirent', 'roi-colle', 'panique', 'charge', 'noeud', 'boule'], gardien:['plaque-tombe', 'plaque-eclate', 'entrouvert'],
  chauvesouris:['tomber', 'envol', 'folle']
};
/* les sons de l'Atelier, par bête (en attente de validation : ils jouent leur version A) */
var SONS = {
  rat:{},
  ratcuir:{cri:'cuirCri', touche:'cuirTouche', mort:'cuirFin', tinte:'cuirCasque'},
  araignee:{cri:'araiCri', touche:'araiTouche', mort:'araiMort', att:{toile:'araiToile'}},
  petitearaignee:{cri:'petiteCri', touche:'petiteTouche', mort:'petiteMort'},
  chauvesouris:{cri:'chauveCri', touche:'chauveTouche', mort:'chauveMort', att:{pique:'chauvePique'}, entree:'chauveAiles'},
  feufollet:{cri:'folletCri', touche:'folletTouche', mort:'folletMort', att:{brulure:'folletFlamme'}},
  tetard:{cri:'tetardCri', touche:'tetardTouche', mort:'tetardMort'},
  roirats:{cri:'roiCri', touche:'roiTouche', mort:'roiFin', att:{grouillement:'roiAttaque', charge:'roiAttaque'}},
  gardien:{cri:'gardienRunes', touche:'gardienTouche', mort:'gardienFin', att:{poing:'gardienPoing'}, pas:'gardienPas'},
  bourbe:{cri:'bourbeCri', touche:'bourbeTouche', mort:'bourbeFin', att:{langue:'bourbeLangue', saut:'bourbeSaut'}, gobe:'bourbeGobe', rot:'bourbeRot', plonge:'bourbePlonge', rire:'bourbeRire'}
};

function infoDe(module){ return module === 'rat' ? INFO_RAT : (window.BETES[module] && window.BETES[module].info) || {cadre:{w:200, h:150}, sol:.9}; }
/* le cadre d'une bête : sa gauche vient de la salle, sa hauteur de son dessin (ses pieds sur le sol de la scène) */
function cadre(module, x){
  var I = infoDe(module), w = I.cadre.w, h = I.cadre.h;
  if(module === 'bourbe') return {x:470, y:36, w:490, h:340};          /* posé sur la margelle du décor (decors.js : MARGELLE) */
  return {x:x, y:SOL - h * I.sol + (module === 'rat' ? 2 : 0), w:w, h:h};
}
function pr(p){ return Promise.resolve(p).catch(function(e){ if(window.console) console.warn('bête', e); }); }

function Adapt(b, x, persos, scene){
  var self = this, I = infoDe(b.module);
  this.b = b; this.id = b.id; this.type = b.type; this.module = b.module; this.info = I; this.rat = b.module === 'rat';
  this.scene = scene; this.mort = false; this.gele = false;
  var c = this.cadre = cadre(b.module, x);
  var d = this.el = el('div', 'perso bete b-' + b.id + ' t-' + b.module + (I.vole ? ' vole' : ''));
  d.style.cssText = 'left:' + c.x.toFixed(1) + 'px;top:' + c.y.toFixed(1) + 'px;width:' + c.w.toFixed(1) + 'px;height:' + c.h.toFixed(1) + 'px;visibility:hidden';
  var la = Math.min(190, Math.max(96, c.w * .6)), cx = this.rat ? .56 : .5;
  d.innerHTML = (this.rat ? '<div class="ombre" style="left:12%;width:76%;top:80%;height:18%"></div>' : '') +
    '<div class="anneau" style="left:' + (c.w * cx - la / 2).toFixed(1) + 'px;top:' + (c.h * I.sol - 14).toFixed(1) + 'px;width:' + la.toFixed(1) + 'px"><i></i></div><div class="acteur"></div>';
  persos.appendChild(d);
  var ac = q('.acteur', d); ac.style.cssText = 'left:0;top:0;width:100%;height:100%';
  this.acteur = this.rat ? window.RatAnime.creer(ac) : window.BETES[b.module].creer(ac);
  if(this.rat) d.classList.add('module');
}
var A = Adapt.prototype;
A.montrer = function(){ this.el.style.visibility = 'visible'; };

/* ---------- l'entrée ---------- */
A.entrer = function(par, o){
  var a = this.acteur, self = this;
  this.montrer();
  if(this.rat) return pr(a.entrer()).then(function(){ return a.yeux('jaune'); }).then(function(){ return a.attendre(); });
  var p = this.module === 'petitearaignee' ? a.entrer(par === 'eclosion' ? {} : {oeuf:false}) : this.module === 'gardien' ? a.entrer(o || {}) : a.entrer();
  return pr(p).then(function(){ if(!self.mort && a.attendre) a.attendre(); });
};

/* ---------- les ancres : un point de la bête, dans la scène ---------- */
A.ancre = function(nom){
  var c = this.cadre;
  if(this.rat){
    var a = this.acteur;
    try{
      if(nom === 'pointfaible') return {x:c.x + c.w * 288 / 540, y:c.y + c.h * 196 / 336};
      if(nom === 'haut'){ var pd = a.point('dos', 330, 300), pt = a.point('tete', 150, 226); return {x:c.x + pd.x, y:c.y + pt.y - 6}; }
      if(nom === 'tete' || nom === 'bouche'){ var t = a.point('tete', 150, 226); return {x:c.x + t.x, y:c.y + t.y + 24}; }
    }catch(e){}
    if(nom === 'pieds') return {x:c.x + c.w * .56, y:c.y + c.h * .857};
    if(nom === 'haut') return {x:c.x + c.w * .56, y:c.y};
    return {x:c.x + c.w * .5, y:c.y + c.h * .56};
  }
  try{ var p = this.acteur.ancre(nom); if(p && isFinite(p.x) && isFinite(p.y)) return DJ.versScene(p); }catch(e){}
  return {x:c.x + c.w * .5, y:c.y + c.h * (nom === 'haut' ? .1 : nom === 'pieds' ? this.info.sol : .55)};
};
/* où viser : le point faible s'il est ouvert, sinon le milieu de la bête */
A.cible = function(ouvert){ return this.ancre(ouvert ? 'pointfaible' : 'centre'); };

/* ---------- les coups ---------- */
A.touche = function(coup, o){
  var a = this.acteur;
  if(this.mort) return Promise.resolve();
  if(this.rat){
    if(coup === 'nuage') return pr(a.tousser());
    if(coup === 'lumiere' || coup === 'huile' || coup === 'bruit' || coup === 'colle') return Promise.resolve();   /* l'état qui suit fait tout */
    return pr(a.touche());
  }
  this._auto = AUTO[this.module] || null;
  /* l'araignée déjà sur le dos ne remonte pas dans le nuage : elle tousse seulement, les pattes en l'air */
  if(this.module === 'araignee' && coup === 'nuage'){ var ec = {}; try{ ec = a.etatCourant() || {}; }catch(e){} if(ec.dos) return pr(a.tousser()); }
  var oo = o || {};
  if(oo.vers) oo = {vers:DJ.versEcran(oo.vers), onImpact:oo.onImpact, scene:this.scene};
  return pr(a.touche(coup, oo));
};
A.rebond = function(coup){
  if(this.mort) return Promise.resolve();
  if(this.rat) return pr(this.acteur.touche());
  var arme = /^fleche/.test(coup) ? 'fleche' : coup === 'dague' ? 'dague' : coup === 'louche' ? 'louche' : coup;
  return pr(this.acteur.touche('rebond', {arme:arme}));
};
/* un moment propre à la bête. dejaTouche : un touche() vient d'être joué pour le même geste (il a pu le lancer lui-même) */
A.special = function(nom, o, dejaTouche){
  var a = this.acteur, self = this;
  if(this.mort || this.rat || !a.special) return Promise.resolve();
  if(dejaTouche && this._auto && this._auto.indexOf(nom) >= 0) return Promise.resolve();
  var oo = o || {};
  if(nom === 'eclosion'){
    return pr(a.special('eclosion', {scene:this.scene})).then(function(pts){ return (pts || []).map(function(p){ return DJ.versScene(p); }); });
  }
  if(oo.vers) oo = Object.assign({}, oo, {vers:DJ.versEcran(oo.vers), scene:this.scene});
  return pr(a.special(nom, oo));
};
A.etat = function(nom, on){
  var a = this.acteur;
  if(this.mort) return Promise.resolve();
  if(this.rat){
    if(nom === 'ebloui') return pr(a.ebloui(on));
    if(nom === 'dos') return pr(a.retourner(on));
    if(nom === 'enrage'){ if(on) return pr(a.enrager()); return Promise.resolve(); }
    if(nom === 'brule'){ a.bruler(on); return Promise.resolve(); }
    if(nom === 'colle'){ a.coller(on); return Promise.resolve(); }
    if(nom === 'gele'){ this.gele = on; this.el.classList.toggle('gele', !!on); return Promise.resolve(); }
    return Promise.resolve();
  }
  try{ var cur = a.etatCourant ? a.etatCourant() : {}; if(!!cur[nom] === !!on) return Promise.resolve(); }catch(e){}
  try{ return pr(a.etat(nom, on)); }catch(e){ return Promise.resolve(); }
};
A.ouvert = function(on){
  if(this.mort) return Promise.resolve();
  if(this.rat) return pr(this.acteur.cible(on));
  return this.etat('ouvert', on);
};
/* les règles font foi : un état que le module a posé tout seul sans qu'elles l'annoncent s'enlève ; un état annoncé se pose */
var LIBRES = {cible:1, ouvert:1, avale:1};
A.accorder = function(etats, ouvert){
  var a = this.acteur, self = this, l = [];
  if(this.mort || this.rat || !a.etatCourant) return Promise.resolve();
  var cur = {}; try{ cur = a.etatCourant() || {}; }catch(e){}
  Object.keys(cur).forEach(function(n){ if(cur[n] && !LIBRES[n] && !(n in etats)) l.push(self.etat(n, false)); });
  Object.keys(etats).forEach(function(n){ if(!cur[n] && !LIBRES[n]) l.push(self.etat(n, true)); });
  if(!!cur.ouvert !== !!ouvert) l.push(this.etat('ouvert', !!ouvert));
  return Promise.all(l);
};

/* ---------- l'attaque ----------
   o.vers : les points visés (scène), un par héros ; o.fois : le nombre de coups ; o.onImpact(i) : le i-ème coup tombe */
A.attaquer = function(nom, o){
  var a = this.acteur, self = this;
  o = o || {};
  if(this.mort) return Promise.resolve();
  if(this.rat){
    var n = o.fois || 1, k = 0;
    var une = function(){
      if(k >= n || self.mort) return Promise.resolve();
      var i = k++, fait = false;
      function coup(){ if(fait) return; fait = true; if(o.onImpact) o.onImpact(i); }
      return pr(a.mordre({onImpact:coup})).then(function(){ coup(); return DJ.attendre(n > 1 ? 60 : 0); }).then(une);
    };
    return une();
  }
  var vers = (o.vers || []).map(function(p){ return DJ.versEcran(p); }), vu = {};
  function impact(i){ i = i || 0; while(vu[i]) i++; vu[i] = 1; if(o.onImpact) o.onImpact(i); }
  var oo = {scene:this.scene, onImpact:impact, onAvale:o.onAvale};
  /* un seul point pour les attaques sur un héros, un tableau pour celles qui en touchent plusieurs */
  oo.vers = vers.length > 1 && (nom === 'brulure' || nom === 'grouillement' || nom === 'pique') ? vers : vers[0];
  if(nom === 'saut') oo.vers = vers[0];
  var p;
  try{ p = a.attaquer(nom, oo); }catch(e){ if(window.console) console.warn('attaque', e); p = null; }
  return pr(p).then(function(r){ if(!vu[0]) impact(0); return r; });
};

/* ---------- la fin ---------- */
A.fuir = function(){ var self = this; this.mort = true; return pr(this.acteur.fuir()).then(function(){ self.el.classList.add('parti'); }); };
A.mourir = function(){
  var self = this, a = this.acteur; this.mort = true;
  return pr(a.mourir ? a.mourir() : a.fuir()).then(function(){ if(self.rat) self.el.classList.add('parti'); else self.el.classList.add('restes'); });
};
A.exploser = function(scene, o){
  var self = this; this.mort = true;
  return pr(this.acteur.exploser(scene || this.scene, o)).then(function(){ self.el.classList.add(self.rat ? 'cendre' : 'restes'); });
};
A.attendre = function(){ try{ if(this.acteur.attendre) this.acteur.attendre(); }catch(e){} };
A.arreter = function(){ try{ if(this.acteur.arreter) this.acteur.arreter(); }catch(e){} };

DJ.Betes = {
  PLACES:PLACES, AVANT:AVANT, SONS:SONS, SOL:SOL, info:infoDe, cadre:cadre,
  /* la gauche du cadre d'une bête : sa place dans la salle, ou une place libre devant pour celles qui naissent en combat */
  place:function(salle, b, rang, prises){
    var libres = AVANT[b.module];
    if(libres && (rang == null || salle === 'bassin')){
      for(var k = 0; k < libres.length; k++) if(prises.indexOf(libres[k]) < 0) return libres[k];
      return libres[libres.length - 1];
    }
    var P = PLACES[salle] || [500, 640, 780];
    return P[Math.min(rang || 0, P.length - 1)];
  },
  creer:function(b, x, persos, scene){ return new Adapt(b, x, persos, scene); }
};
})();
