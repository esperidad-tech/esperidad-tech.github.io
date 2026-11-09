
/* ============ le CSS (injecté une fois) ============ */
function css(){
  if(document.getElementById('ha-css')) return;
  var st = document.createElement('style'); st.id = 'ha-css';
  st.textContent = '.ha{position:absolute;inset:0;pointer-events:none;overflow:visible}' +
    '.ha-boite{position:absolute;inset:0}.ha-boite>svg{position:absolute;inset:0;width:100%;height:100%;overflow:visible;display:block}' +
    '.ha .haJ{transform-box:view-box}.ha-fx{position:absolute;inset:0;pointer-events:none;overflow:visible;z-index:2}' +
    '.ha-p{position:absolute;left:0;top:0;pointer-events:none;will-change:transform,opacity}' +
    '.ha .haAv{display:none}.ha.ha-avA .haAv{display:inline}' +
    '.ha.ha-choisi .ha-boite>svg{animation:haChoisi 1.6s ease-in-out infinite}' +
    /* cuit (RAPIDITE.md) : la lueur du héros choisi est une silhouette dorée cuite, derrière lui ; elle pulse en opacité (carte graphique) */
    '.ha.ha-choisi .cu-lueur{display:block;animation:haLueur 1.6s ease-in-out infinite}@keyframes haLueur{0%,100%{opacity:.78}50%{opacity:1}}' +
    /* les tissus simulés (îlots SVG redessinés à chaque image) : chacun dans son calque ; quand le héros est choisi, un halo doré
       (il est de toute façon repeint à chaque image, le halo ne coûte qu'un petit flou sur sa surface) */
    '.ha .cu-ilot.ha-anime{will-change:transform}' +
    '.ha.ha-choisi .cu-ilot.ha-souple>svg{filter:drop-shadow(0 0 2px rgba(255,226,160,.85)) drop-shadow(0 0 6px rgba(255,190,90,.4))}' +
    /* le repos (ha-calme) : balancement des tissus, corde fixe sur l'arc, bulles et étincelles en boucle (tout en CSS) */
    '.ha.ha-calme .cu-ilot.ha-tissu{animation:haVent 2.8s ease-in-out infinite}' +
    '.ha.ha-calme .cu-ilot.ha-meche,.ha.ha-calme .cu-ilot.ha-tresse{animation:haVent2 2.4s ease-in-out infinite}' +
    '@keyframes haVent{0%,100%{transform:none}25%{transform:rotate(-1.3deg) skewX(1deg)}75%{transform:rotate(1.1deg) skewX(-1deg)}}' +
    '@keyframes haVent2{0%,100%{transform:none}25%{transform:rotate(-3deg)}75%{transform:rotate(3deg)}}' +
    '.ha .ha-calme-seul{display:none}.ha.ha-calme .ha-calme-seul{display:block}.ha.ha-calme .cu-ilot.ha-trait{visibility:hidden}' +
    '.ha .ha-bulle-boucle{animation:haBulle 1.3s ease-out infinite}' +
    '@keyframes haBulle{0%{transform:translate(0,0) scale(1);opacity:0}20%{transform:translate(1px,-6px) scale(1);opacity:1}80%{transform:translate(-2px,-18px) scale(1.1);opacity:.9}100%{transform:translate(0,-28px) scale(1.4);opacity:0}}' +
    '.ha .ha-etinc-boucle{animation:haEtinc .9s ease-out infinite}' +
    '@keyframes haEtinc{0%{transform:translate(0,0) scale(.6);opacity:0}15%{opacity:1}100%{transform:translate(2px,-22px) scale(1);opacity:0}}' +
    '@keyframes haChoisi{0%,100%{filter:drop-shadow(0 0 3px rgba(255,220,130,.7)) drop-shadow(0 0 10px rgba(255,190,90,.25))}50%{filter:drop-shadow(0 0 5px rgba(255,225,140,.95)) drop-shadow(0 0 18px rgba(255,190,90,.5))}}' +
    '@keyframes haTourne{to{transform:rotate(360deg)}}@keyframes haTourneR{to{transform:rotate(-360deg)}}' +
    '@keyframes haPulse{0%,100%{opacity:.55;transform:scale(.9)}50%{opacity:1;transform:scale(1.15)}}' +
    '@keyframes haFlotte{0%,100%{transform:translateY(0)}50%{transform:translateY(-4px)}}' +
    '.ha-dome{position:absolute;pointer-events:none;z-index:3}' +
    '.ha-badge{position:absolute;left:50%;top:-6px;transform:translate(-50%,-100%);white-space:nowrap;font:800 13px/1 system-ui,"Segoe UI",sans-serif;color:#e8fdff;' +
    'background:linear-gradient(#1d3a5a,#10203a);border:2px solid #8ff3ff;border-radius:999px;padding:4px 9px;box-shadow:0 0 10px rgba(143,243,255,.6),0 2px 0 #24182e}';
  document.head.appendChild(st);
}
var ROLES = {};
var FX = {etoiles:function(){}};

/* ============ un héros ============ */
function Heros(cont, role, lk){
  css();
  if(!ROLES[role]) throw new Error('HerosAnime : rôle inconnu « ' + role + ' »');
  this.cont = cont; this.role = role; this.R0 = ROLES[role];
  /* l'apparence : celle donnée ; ce qui manque (peau, cheveux, yeux) vient de l'apparence par défaut */
  this.lk = fusionLk(role, lk);
  if(getComputedStyle(cont).position === 'static') cont.style.position = 'relative';
  this.racine = document.createElement('div'); this.racine.className = 'ha ha-' + role;
  this.boite = document.createElement('div'); this.boite.className = 'ha-boite';
  this.fx = document.createElement('div'); this.fx.className = 'ha-fx';
  this.racine.appendChild(this.boite); this.racine.appendChild(this.fx);
  cont.appendChild(this.racine);
  /* cuit (HerosAnime.preparer) : une copie de la version en images, dont les pièces sont des <div> que la carte graphique
     anime sans rien repeindre ; sinon, le grand SVG d'origine */
  var M = MODELES[cleModele(role, this.lk)], spec;
  if(M && M.modele){
    var cl = M.modele.cloner(this.boite, {lueur:false});     /* (la silhouette lumineuse n'est ajoutée que quand il est choisi) */
    this.cuit = true; this.svg = cl.racine; this.vue = cl.vue;
    spec = {souples:M.souples};
  } else {
    spec = this.R0.fab(this.lk, HerosAnime.grain);
    this.boite.innerHTML = spec.svg;
    this.svg = this.vue = this.boite.querySelector('svg');
  }
  var me = this;
  this.els = {}; this.elsI = {}; this.etat = {};
  /* (cuit : la silhouette lumineuse est une seconde copie des pièces ; elle reçoit les mêmes animations) */
  [].forEach.call(this.svg.querySelectorAll('[data-j]'), function(e){ var n = e.getAttribute('data-j'); (me.els[n] = me.els[n] || []).push(e); me.etat[n] = J0(); });
  [].forEach.call(this.svg.querySelectorAll('[data-i]'), function(e){ var n = e.getAttribute('data-i'); (me.elsI[n] = me.elsI[n] || []).push(e); });
  this.reps = {};
  [].forEach.call(this.vue.querySelectorAll('[data-r]'), function(e){ var n = e.getAttribute('data-r'); if(!me.reps[n]) me.reps[n] = e; });
  this.souples = spec.souples.map(function(s){ return new Souple(me, s); });
  /* cuit : les îlots redessinés à chaque image (tissus, corde, filet) ont chacun leur calque : on ne repeint qu'eux */
  if(this.cuit){
    [].forEach.call(this.vue.querySelectorAll('[data-souple],[data-corde],[data-filet]'), function(g){
      var il = g.ownerSVGElement && g.ownerSVGElement.parentNode;
      if(il && il.classList.contains('cu-ilot')) il.classList.add('ha-anime', g.hasAttribute('data-souple') ? 'ha-souple' : 'ha-trait');
    });
    /* au repos (le héros « dort », plus aucun calcul), chaque tissu suit son membre et se balance doucement (CSS, carte graphique),
       pivot au point où il est attaché */
    this.souples.forEach(function(so, k){
      var il = so.g.ownerSVGElement && so.g.ownerSVGElement.parentNode, s = so.s;
      if(!il) return;
      var p = s.dos ? s.dos[0] : s.haut ? s.haut[0] : s.pts[0];
      il.style.transformOrigin = p[0] + 'px ' + p[1] + 'px';
      il.style.animationDuration = (2.6 + k * .37) + 's';
      il.classList.add('ha-' + s.type);
    });
  }
  this.grainG = this.svg.querySelector('.ha-grain');
  this.file = Promise.resolve(); this._nf = 0; this._gTok = 0; this._timers = [];
  this.bouche0 = this.R0.bouche || 'neutre';
  this.expr('garde');
  if(this.R0.init) this.R0.init.call(this, spec);
  if(this.cuit && this.R0.cuit) this.R0.cuit.call(this);
  this.poser(this.garde());
  vivre(this);
}
var H = Heros.prototype;

/* ============ la cuisson (voir jeu/donjon/RAPIDITE.md et anim/cuire.js) ============
   HerosAnime.preparer([{role, lk}], {res}) cuit une fois chaque héros (avec son apparence) en images ; ensuite, creer() en
   fait une copie. Le dessin fixe (grain de papier et flous compris) devient des images ; ce qui change à chaque image
   (tissus simulés, corde de l'arc, filet de potion, fioles qui changent de couleur, bulles) reste en petits îlots SVG. */
var MODELES = {};
/* l'apparence : celle donnée ; ce qui manque (peau, cheveux, yeux) vient de l'apparence par défaut */
function fusionLk(role, lk){
  var base = DEFAUT[role], r = {}, k;
  if(lk){ for(k in lk) r[k] = lk[k]; ['pe', 'ch', 'ir'].forEach(function(c){ if(!r[c]) r[c] = base[c]; }); }
  else for(k in base) r[k] = base[k];
  return r;
}
function cleModele(role, lk){ return role + '|' + JSON.stringify(lk) + '|' + (HerosAnime.grain ? 1 : 0); }
var ILOTS = '[data-souple],[data-corde],[data-filet],[data-coul],[data-halo],[data-bulles]';
function preparerUn(role, lk, o){
  var l = fusionLk(role, lk), cle = cleModele(role, l);
  if(MODELES[cle]) return MODELES[cle].promesse;
  var Cu = window.Cuire;
  var spec = ROLES[role].fab(l, HerosAnime.grain), h = Cu.hote(250, 300);
  h.innerHTML = spec.svg;
  var svg = h.firstElementChild; svg.style.cssText = 'display:block;width:250px;height:300px';
  var M = MODELES[cle] = {souples:spec.souples};
  M.promesse = Cu.cuire(svg, {ilot:ILOTS, anime:'.haJ', res:o.res || 2, lueur:{couleur:'#ffe2a0', couleur2:'#ffbe5a', epais:1.4, flou:2.6, large:7}})
    .then(function(m){ M.modele = m; h.remove(); return m; }, function(e){ h.remove(); delete MODELES[cle]; if(window.console) console.warn('HerosAnime.preparer', e); return null; });
  return M.promesse;
}
function preparer(liste, o){
  css();
  o = o || {};
  if(!window.Cuire || !window.Cuire.cuire) return Promise.resolve([]);
  if(!liste) liste = Object.keys(ROLES).map(function(r){ return {role:r}; });
  var res = o.res || Math.max(1, Math.min(3, (window.devicePixelRatio || 1) * 200 / 250 * 1.3));
  /* un héros après l'autre (le téléphone garde la main entre deux) */
  return liste.reduce(function(p, x){ return p.then(function(r){ return preparerUn(x.role, x.lk, {res:res}).then(function(m){ r.push(m); return r; }); }); }, Promise.resolve([]));
}
H.$ = function(sel){ return this.svg.querySelector(sel); };
H.garde = function(){ return this._choisi && this.R0.gardeChoisi ? this.R0.gardeChoisi : this.R0.garde; };
H.plus = function(ms, fn){ var me = this, id = setTimeout(function(){ me._timers.splice(me._timers.indexOf(id), 1); fn(); }, ms); this._timers.push(id); return id; };
H.att = function(ms){ var me = this; return new Promise(function(r){ me.plus(ms, r); }); };
/* le moteur : une suite de poses [{d: durée, p: pose, e: accélération, f: fonction à la fin du pas}] */
H.jouer = function(seq){
  var me = this, etats = [], base = this.etat, tps = [0], T = 0;
  seq.forEach(function(st){ var e = st.p ? resoudre(st.p, base) : base; etats.push(e); base = e; T += st.d; tps.push(T); });
  var noms = Object.keys(this.els).filter(function(n){ return etats.some(function(e){ return !egal(e[n], me.etat[n]); }); });
  noms.forEach(function(n){
    var kfs = [{offset:0, transform:tf(me.etat[n]), easing:EZ[seq[0].e || 'io'] || seq[0].e}];
    etats.forEach(function(e, i){ var nx = seq[i + 1]; kfs.push({offset:T ? tps[i + 1] / T : 1, transform:tf(e[n]), easing:nx ? (EZ[nx.e || 'io'] || nx.e) : 'linear'}); });
    me.els[n].forEach(function(el){
      var old = el._a, a = el._a = el.animate(kfs, {duration:Math.max(T, 1), fill:'forwards'});
      if(old) old.cancel();
      /* une fois finie, la pose est écrite dans le style et l'animation enlevée (moins d'animations à tenir à jour) */
      a.finished.then(function(){ if(el._a === a){ el.style.transform = kfs[kfs.length - 1].transform; a.cancel(); el._a = null; } }, function(){});
    });
  });
  seq.forEach(function(st, i){ if(st.f) me.plus(tps[i + 1], st.f); if(st.f0) me.plus(tps[i], st.f0); });
  this.etat = etats[etats.length - 1];
  return this.att(T);
};
H.poser = function(pose){
  var me = this; this.etat = resoudre(pose, this.etat);
  Object.keys(this.els).forEach(function(n){ me.els[n].forEach(function(el){ el.style.transform = tf(me.etat[n]); if(el._a){ el._a.cancel(); el._a = null; } }); });
};
/* fige la pose là où elle en est (pour interrompre un geste d'attente) */
H.capturer = function(){
  var me = this;
  Object.keys(this.els).forEach(function(n){
    var el = me.els[n][0], m = getComputedStyle(el).transform, s = J0();
    if(m && m !== 'none'){
      var v = m.replace(/^matrix\(|\)$/g, '').split(',').map(Number), a = v[0], b = v[1], c = v[2], d = v[3];
      var r = Math.atan2(b, a), sx = Math.hypot(a, b), sy = -c * Math.sin(r) + d * Math.cos(r), tk = (c * Math.cos(r) + d * Math.sin(r)) / (sy || 1);
      s = {x:v[4], y:v[5], r:r * DEG, k:Math.atan(tk) * DEG, sx:sx, sy:sy};
      while(s.r - me.etat[n].r > 180) s.r -= 360; while(s.r - me.etat[n].r < -180) s.r += 360;
    }
    me.etat[n] = s;
    me.els[n].forEach(function(el){ el.style.transform = tf(s); if(el._a){ el._a.cancel(); el._a = null; } });
  });
};
/* les visages */
var EXPR = {garde:['ouverts', 'garde', null], effort:['ouverts', 'colere', 'effort'], aie:['serres', 'souci', 'grimace'], ko:['ko', 'souci', 'o'],
  joie:['joie', 'content', 'joie'], cri:['ouverts', 'colere', 'joie'], savoir:['lueur', 'content', 'o'], vise:['ouverts', 'colere', 'neutre'], content:['ouverts', 'content', 'sourire'], surpris:['ouverts', 'souci', 'o']};
H.expr = function(nom){
  var e = EXPR[nom] || EXPR.garde, b = e[2] || this.bouche0, sv = this.svg;
  [['data-y', e[0]], ['data-s', e[1]], ['data-b', b]].forEach(function(p){
    [].forEach.call(sv.querySelectorAll('[' + p[0] + ']'), function(g){ g.style.display = g.getAttribute(p[0]) === p[1] ? '' : 'none'; });
  });
  this._expr = nom;
};
H.cligner = function(){
  var c = this.$('.ha-cligne'); if(!c || this._expr === 'ko') return;
  c.animate([{transform:'scaleY(1)'}, {transform:'scaleY(.08)', offset:.45}, {transform:'scaleY(.08)', offset:.55}, {transform:'scaleY(1)'}], {duration:170, easing:'ease-in-out'});
};
H.avant = function(c, on){ this.racine.classList.toggle('ha-av' + c, !!on); };
H.rep = function(nom, ref){ return ou(this.reps[nom], ref || this.fx); };

/* ============ la file des actions : une à la fois ; l'attente reprend après ============ */
H._file = function(fn){
  var me = this; this._nf++;
  return new Promise(function(res){
    me.file = me.file.then(function(){
      var fini = false, sig = function(v){ if(!fini){ fini = true; res(v); } };
      me._debut();
      return Promise.resolve().then(function(){ return fn.call(me, sig); }).catch(function(e){ console.error(e); }).then(function(v){ sig(v); me._nf--; me._fin(); });
    });
  });
};
H._debut = function(){
  this._occupe = true; vivre(this); this._idleOff(); this.avant('A', false);
  if(this._geste){ this._gTok++; this._geste = false; this.capturer(); }
};
H._fin = function(){
  var me = this;
  if(this._nf > 0) return;
  this._occupe = false;
  if(this._veut) this.plus(40, function(){ if(!me._occupe && me._veut) me._idleOn(); });
};
H.attendre = function(){ this._veut = true; vivre(this); if(!this._occupe) this._idleOn(); return this; };
H._idleOn = function(){
  if(this._idle) return;
  this._idle = true; this._calme = true;
  var me = this, A = this._ia = [];
  function boucle(nom, k1, dur, delay){ (me.elsI[nom] || []).forEach(function(el){ A.push(el.animate([{transform:'none'}, {transform:k1}], {duration:dur, delay:delay || 0, iterations:Infinity, direction:'alternate', easing:EZ.io})); }); }
  if(this.ko){
    boucle('torse', 'scale(1.025,1.035)', 1100);
    boucle('tete', 'rotate(4deg)', 1300, 200);
  } else {
    boucle('torse', 'translate(0px,-1.6px) scale(1.014,1.025)', 1400);
    boucle('tete', 'translate(0px,-1.4px) rotate(-2.4deg)', 1400, 180);
    boucle('brasA', 'rotate(-2.8deg)', 1400, 260); boucle('brasB', 'rotate(3deg)', 1400, 330);
    boucle('avantBrasA', 'rotate(-3.5deg)', 1400, 430); boucle('avantBrasB', 'rotate(-3.5deg)', 1400, 500);
    if(this.R0.idle) this.R0.idle.call(this, A, boucle);
  }
  this._clignements(); this._gestes();
};
H._idleOff = function(){
  if(!this._idle) return;
  this._idle = false; this._calme = false;
  (this._ia || []).forEach(function(a){
    var el = a.effect && a.effect.target; if(!el){ a.cancel(); return; }
    var m = getComputedStyle(el).transform; a.cancel();
    if(m && m !== 'none') el.animate([{transform:m}, {transform:'none'}], {duration:160, easing:EZ.o});
  });
  this._ia = [];
  clearTimeout(this._tCl); clearTimeout(this._tGe);
};
H._clignements = function(){
  var me = this;
  this._tCl = setTimeout(function(){ if(!me._idle) return; me.cligner(); if(Math.random() < 0.25) setTimeout(function(){ me.cligner(); }, 240); me._clignements(); }, alea(1800, 4600));
};
H._gestes = function(){
  var me = this;
  if(!this.R0.geste || this.ko) return;
  this._tGe = setTimeout(function(){
    if(!me._idle || me._occupe) return;
    var tok = ++me._gTok; me._geste = true; vivre(me);
    Promise.resolve(me.R0.geste.call(me, function(){ return tok === me._gTok; })).then(function(){ if(tok === me._gTok) me._geste = false; if(me._idle) me._gestes(); });
  }, alea(me._gestesVite ? 1500 : 3200, me._gestesVite ? 2600 : 6200));
};
/* Fluidité (RAPIDITE.md) : un héros cuit qui ne fait rien « s'endort » : plus aucune boucle à chaque image (le fil principal
   du téléphone se repose, la carte graphique joue seule la respiration, le clignement, le balancement des tissus). Il se
   réveille dès qu'il agit (action, petit geste, corde tirée, potion versée) et se rendort 1,2 s après (le tissu s'est posé). */
H._actif = function(t){
  if(!this.cuit) return true;
  var c = this.corde;
  if(this._occupe || this._geste || this._verse || this._bouillon || (c && (c.mode !== 'libre' || c.fl || c.vib > .25))){ this._calmeDepuis = 0; if(this._dort) this._reveil(); return true; }
  if(!this._calmeDepuis) this._calmeDepuis = t;
  if(t - this._calmeDepuis < 1200) return true;
  if(!this._dort) this._endormir();
  return false;
};
H._endormir = function(){ this._dort = true; this.racine.classList.add('ha-calme'); };
H._reveil = function(){ this._dort = false; this.racine.classList.remove('ha-calme'); };
/* cuit : la silhouette lumineuse du héros choisi, ajoutée seulement quand il l'est (ses pièces reçoivent les mêmes animations) */
H._lueurs = function(on){
  var me = this, M = MODELES[cleModele(this.role, this.lk)];
  if(on && !this._lv && M && M.modele && M.modele.clonerLueur){
    var lv = M.modele.clonerLueur(); if(!lv) return;
    var w = document.createElement('div'); w.className = 'cu-lueur'; w.appendChild(lv);
    this.svg.appendChild(w); window.Cuire.ajuster(this.svg);
    [].forEach.call(lv.querySelectorAll('[data-j]'), function(e){ var n = e.getAttribute('data-j'); if(me.els[n]){ me.els[n].push(e); e.style.transform = tf(me.etat[n]); } });
    [].forEach.call(lv.querySelectorAll('[data-i]'), function(e){ var n = e.getAttribute('data-i'); if(me.elsI[n]) me.elsI[n].push(e); });
    this._lv = w;
  } else if(!on && this._lv){
    var w2 = this._lv, n;
    this._lv = null;
    var garder = function(e){ return !w2.contains(e); };
    for(n in this.els) this.els[n] = this.els[n].filter(garder);
    for(n in this.elsI) this.elsI[n] = this.elsI[n].filter(garder);
    [].forEach.call(w2.querySelectorAll('*'), function(e){ if(e.getAnimations) e.getAnimations().forEach(function(a){ a.cancel(); }); });
    w2.remove();
  }
};
/* 1re phase de l'image : lire tout ce dont _pas aura besoin (les matrices sont gardées jusqu'à la fin de l'image) */
H._lire = function(){
  this._bm = getComputedStyle(this.boite).transform;
  mat(this.grainG);
  this.souples.forEach(function(s){ s.lire(); });
  if(this.R0.lire) this.R0.lire.call(this);
};
H._pas = function(dt, t){
  var bm = this._bm || getComputedStyle(this.boite).transform, o = [0, 0];
  this._bm = null;
  if(bm && bm !== 'none'){ var v = bm.replace(/^matrix\(|\)$/g, '').split(','); o = [+v[4], +v[5]]; }
  var g = mat(this.grainG), sol = ap(g, 0, 294)[1];
  this.souples.forEach(function(s){ s.pas(dt, o, sol); });
  if(this.R0.pas) this.R0.pas.call(this, dt, t);
};
