/* Le banc d'essai : rend un son hors ligne (OfflineAudioContext) et le renvoie en 16 bits, pour le vérifier. */
(function(G){
'use strict';
function b64(u8){
  var s = '', pas = 0x8000;
  for(var i = 0; i < u8.length; i += pas) s += String.fromCharCode.apply(null, u8.subarray(i, i + pas));
  return btoa(s);
}
G.ATELIER_RENDRE = function(nom, duree, opt){
  opt = opt || {};
  var sr = opt.sr || 44100, ctx = new OfflineAudioContext(2, Math.ceil(sr * duree), sr);
  var A = Moteur(ctx, {horsLigne:true, brut:opt.brut !== false, volume:opt.volume || 1});
  var sources = [];
  ['createOscillator', 'createBufferSource'].forEach(function(nm){
    var orig = ctx[nm].bind(ctx);
    ctx[nm] = function(){ var x = orig(), d = {a:null, b:1e9}; sources.push(d); var st = x.start.bind(x), sp = x.stop.bind(x);
      x.start = function(t){ d.a = t || 0; return st.apply(null, arguments); }; x.stop = function(t){ d.b = t || 0; return sp.apply(null, arguments); }; return x; };
  });
  var musique = nom.indexOf('M:') === 0;
  var P = A.prise(.05, opt.niveau || 1, musique ? 'mus' : 'sfx');
  var r, t0 = performance.now();
  if(musique){ var I = MUSIQUES[nom.slice(2)](A, P); I.pas(duree); r = {duree:duree}; }
  else if(opt.code){ r = (new Function('A', 'P', opt.code))(A, P) || {duree:duree}; }
  else r = BRUITAGES[nom](A, P);
  var tPrep = performance.now() - t0;
  return ctx.startRendering().then(function(buf){
    var L = buf.getChannelData(0), R = buf.getChannelData(1), n = L.length, pic = 0, nan = 0, i;
    for(i = 0; i < n; i++){
      var a = L[i], b = R[i];
      if(!isFinite(a) || !isFinite(b)){ nan++; L[i] = 0; R[i] = 0; continue; }
      if(a < 0) a = -a; if(b < 0) b = -b;
      if(a > pic) pic = a; if(b > pic) pic = b;
    }
    var k = 32767 / Math.max(1, pic), out = new Int16Array(n * 2);
    for(i = 0; i < n; i++){ out[2 * i] = Math.round(L[i] * k); out[2 * i + 1] = Math.round(R[i] * k); }
    var ev = []; sources.forEach(function(s){ if(s.a != null){ ev.push([s.a, 1]); ev.push([Math.min(s.b, duree), -1]); } });
    ev.sort(function(x, y){ return x[0] - y[0] || x[1] - y[1]; }); var c = 0, cmax = 0; ev.forEach(function(e){ c += e[1]; if(c > cmax) cmax = c; });
    return {simult:cmax, nsources:sources.length, b64:b64(new Uint8Array(out.buffer)), pic:pic, echelle:Math.max(1, pic), nan:nan, sr:sr, duree:r && r.duree, moment:r && r.moment, prep:Math.round(tPrep), rendu:Math.round(performance.now() - t0)};
  });
};
})(window);
