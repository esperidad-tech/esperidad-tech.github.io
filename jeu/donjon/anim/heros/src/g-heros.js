
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
  var k0, base = DEFAUT[role]; this.lk = {};
  if(lk){ for(k0 in lk) this.lk[k0] = lk[k0]; ['pe', 'ch', 'ir'].forEach(function(c){ if(!this.lk[c]) this.lk[c] = base[c]; }, this); }
  else for(k0 in base) this.lk[k0] = base[k0];
  if(getComputedStyle(cont).position === 'static') cont.style.position = 'relative';
  var spec = this.R0.fab(this.lk, HerosAnime.grain);
  this.racine = document.createElement('div'); this.racine.className = 'ha ha-' + role;
  this.boite = document.createElement('div'); this.boite.className = 'ha-boite';
  this.boite.innerHTML = spec.svg;
  this.fx = document.createElement('div'); this.fx.className = 'ha-fx';
  this.racine.appendChild(this.boite); this.racine.appendChild(this.fx);
  cont.appendChild(this.racine);
  this.svg = this.boite.querySelector('svg');
  var me = this;
  this.els = {}; this.elsI = {}; this.etat = {};
  [].forEach.call(this.svg.querySelectorAll('[data-j]'), function(e){ var n = e.getAttribute('data-j'); (me.els[n] = me.els[n] || []).push(e); me.etat[n] = J0(); });
  [].forEach.call(this.svg.querySelectorAll('[data-i]'), function(e){ var n = e.getAttribute('data-i'); (me.elsI[n] = me.elsI[n] || []).push(e); });
  this.reps = {};
  [].forEach.call(this.svg.querySelectorAll('[data-r]'), function(e){ me.reps[e.getAttribute('data-r')] = e; });
  this.souples = spec.souples.map(function(s){ return new Souple(me, s); });
  this.grainG = this.svg.querySelector('.ha-grain');
  this.file = Promise.resolve(); this._nf = 0; this._gTok = 0; this._timers = [];
  this.bouche0 = this.R0.bouche || 'neutre';
  this.expr('garde');
  if(this.R0.init) this.R0.init.call(this, spec);
  this.poser(this.garde());
  vivre(this);
}
var H = Heros.prototype;
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
    me.els[n].forEach(function(el){ var old = el._a; el._a = el.animate(kfs, {duration:Math.max(T, 1), fill:'forwards'}); if(old) old.cancel(); });
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
  this._occupe = true; this._idleOff(); this.avant('A', false);
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
    var tok = ++me._gTok; me._geste = true;
    Promise.resolve(me.R0.geste.call(me, function(){ return tok === me._gTok; })).then(function(){ if(tok === me._gTok) me._geste = false; if(me._idle) me._gestes(); });
  }, alea(me._gestesVite ? 1500 : 3200, me._gestesVite ? 2600 : 6200));
};
H._pas = function(dt, t){
  var bm = getComputedStyle(this.boite).transform, o = [0, 0];
  if(bm && bm !== 'none'){ var v = bm.replace(/^matrix\(|\)$/g, '').split(','); o = [+v[4], +v[5]]; }
  var g = mat(this.grainG), sol = ap(g, 0, 294)[1];
  this.souples.forEach(function(s){ s.pas(dt, o, sol); });
  if(this.R0.pas) this.R0.pas.call(this, dt, t);
};
