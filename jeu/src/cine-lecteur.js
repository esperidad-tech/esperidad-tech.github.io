/* cine-lecteur.js — LE LECTEUR DES CINÉMATIQUES (Bible §13.42), le même dans le donjon (construire.py) et dans le jeu (build.py).
   Romain, 15 novembre : « des cinématiques de film », en 21:9 avec les bandes noires. Ce sont de vrais petits films, fabriqués
   d'avance image par image (jeu/cine/ : filmer.py) : ils ne peuvent pas ramer, même sur une vieille tablette.
   - La vidéo est MUETTE (elle part toute seule partout, même sur iPhone) : les bruitages sont ceux de l'Atelier des sons, joués à
     l'instant dit (o.infos.sons) par le moteur de son du jeu — le volume des réglages compte.
   - Les sous-titres sont dans la bande noire du bas (ou sur l'image, en bas, si l'écran est trop allongé) ; chacun a son 🔊 :
     le toucher arrête le film le temps de la lecture (jamais de lecture toute seule).
   - « Passer ➜ » en haut à droite.
   - Si le film n'arrive pas (pas d'internet, un vieux navigateur), CineLecteur.jouer répond 'echec' : on joue l'ancienne scène.

   CineLecteur.precharger(url) -> Promise (le film téléchargé en entier, gardé en mémoire)
   CineLecteur.jouer({url, infos:{duree, sons:[[t, id]], sousTitres:[[t0, t1, texte, qui]]}, son:function(id), lire:function(texte, qui),
                      parle:function() -> bool, taire:function(), attente:ms, passer:true}) -> Promise('fini' | 'passe' | 'echec') */
(function(){
'use strict';
var CL = window.CineLecteur = {};
var CACHE = {};
var CSS = '.cine-ecran{position:fixed;inset:0;z-index:99990;background:#000;opacity:0;transition:opacity .35s;touch-action:none;-webkit-user-select:none;user-select:none}' +
  '.cine-ecran.on{opacity:1}.cine-cadre{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);background:#000;overflow:hidden}' +
  '.cine-cadre video{display:block;width:100%;height:100%;object-fit:cover;background:#000}' +
  '.cine-st{position:absolute;left:50%;transform:translateX(-50%);width:min(92vw,980px);text-align:center;color:#f4ecd8;font:600 clamp(16px,2.6vw,26px)/1.35 Georgia,serif;' +
  'text-shadow:0 2px 6px #000,0 0 2px #000;opacity:0;transition:opacity .25s;pointer-events:none;display:flex;align-items:center;justify-content:center;gap:12px;flex-wrap:wrap}' +
  '.cine-st.on{opacity:1}.cine-st.sur{padding:28px 18px 14px;background:linear-gradient(transparent,rgba(0,0,0,.72))}' +
  '.cine-qui{display:block;width:100%;font:700 clamp(12px,1.6vw,15px)/1 system-ui,sans-serif;letter-spacing:.08em;text-transform:uppercase;color:#e8b84a;margin-bottom:4px}' +
  '.cine-lire{pointer-events:auto;flex:none;border:0;border-radius:50%;width:44px;height:44px;font-size:21px;background:rgba(255,255,255,.14);color:#fff;cursor:pointer}' +
  '.cine-lire:active{transform:scale(.92)}' +
  '.cine-passer{position:absolute;right:max(14px,env(safe-area-inset-right));top:max(12px,env(safe-area-inset-top));border:1px solid rgba(255,255,255,.35);border-radius:999px;background:rgba(0,0,0,.4);' +
  'color:#ddd;font:600 15px/1 system-ui,sans-serif;padding:10px 16px;cursor:pointer;z-index:2}' +
  '.cine-attente{position:absolute;left:50%;top:50%;width:14px;height:14px;margin:-7px;border-radius:50%;background:#e8b84a;animation:cineAtt 1s ease-in-out infinite}' +
  '@keyframes cineAtt{0%,100%{opacity:.2;transform:scale(.7)}50%{opacity:1;transform:scale(1)}}' +
  '.cine-go{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);border:0;border-radius:16px;background:#ffd23f;color:#111;font:800 22px/1 system-ui,sans-serif;padding:18px 28px;cursor:pointer}';
function style(){ if(document.getElementById('cine-css')) return; var s = document.createElement('style'); s.id = 'cine-css'; s.textContent = CSS; document.head.appendChild(s); }
function el(tag, cls, html){ var e = document.createElement(tag); if(cls) e.className = cls; if(html != null) e.innerHTML = html; return e; }
function esc(t){ return String(t).replace(/[&<>"]/g, function(c){ return {'&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;'}[c]; }); }

/* télécharger tout le film d'avance (une coupure de réseau au milieu ne le casse plus) */
CL.precharger = function(url){
  if(CACHE[url]) return CACHE[url];
  CACHE[url] = new Promise(function(ok){
    if(!window.fetch || !window.URL || !URL.createObjectURL || location.protocol === 'file:'){ ok(url); return; }
    fetch(url).then(function(r){ if(!r.ok) throw new Error(r.status); return r.blob(); })
      .then(function(b){ ok(URL.createObjectURL(b)); })
      .catch(function(){ CACHE[url] = null; ok(url); });
  });
  return CACHE[url];
};
/* LE SON DANS LE JEU (le donjon a le sien : DJ.bruit) : le moteur de l'Atelier des sons et les bruitages des cinématiques
   (build.py : SON_DONJON et essai/sons/cine.js), version A, sur un contexte audio à lui. Rien si le son est coupé (Réglages). */
var ctxJ = null, engJ = null;
CL.sonJeu = function(id){
  try{
    if(window.M && M.S && M.S.options && M.S.options.son === false) return;
    if(!window.Moteur || !window.BRUITAGES) return;
    var fn = window.BRUITAGES[id + 'A']; if(typeof fn !== 'function') return;
    if(!ctxJ){ var AC = window.AudioContext || window.webkitAudioContext; if(!AC) return; ctxJ = new AC(); engJ = window.Moteur(ctxJ, {}); }
    if(ctxJ.state === 'suspended') ctxJ.resume();
    var t = ctxJ.currentTime + .02, P = engJ.prise(t, (window.NIVEAUX || {})[id + 'A'] || 1), r = fn(engJ, P) || {duree:1};
    setTimeout(function(){ try{ P.lacher(); }catch(e){} }, ((r.duree || 1) + 5) * 1000);
  }catch(e){ if(window.console) console.warn('son de cinématique', id, e); }
};
/* (pour les robots : une adresse forcée — ou rien, et le film « n'arrive pas ») */
CL.essai = null;

CL.jouer = function(o){
  style();
  return new Promise(function(fin){
    var fini = false, raf = 0, video = null, cues = (o.infos && o.infos.sons || []).map(function(c){ return {t:c[0], id:c[1], fait:false}; });
    var st = (o.infos && o.infos.sousTitres) || [], courant = -1, lecture = null;
    var ecran = el('div', 'cine-ecran'), cadre = el('div', 'cine-cadre'), sous = el('div', 'cine-st'), att = el('div', 'cine-attente');
    ecran.appendChild(cadre); ecran.appendChild(sous); ecran.appendChild(att);
    if(o.passer !== false){ var bp = el('button', 'cine-passer', 'Passer ➜'); bp.setAttribute('data-cine', 'passer'); ecran.appendChild(bp); }
    (o.parent || document.body).appendChild(ecran);
    requestAnimationFrame(function(){ ecran.classList.add('on'); });
    function place(){
      var W = window.innerWidth, H = window.innerHeight, w = Math.min(W, H * 21 / 9), h = w * 616 / 1440, bande = (H - h) / 2;
      cadre.style.width = w + 'px'; cadre.style.height = h + 'px';
      var dedans = bande < 66;
      sous.classList.toggle('sur', dedans);
      if(dedans){ sous.style.top = ''; sous.style.bottom = (bande + 6) + 'px'; sous.style.width = Math.min(w, 980) + 'px'; }
      else { sous.style.bottom = ''; sous.style.top = (bande + h + Math.min(18, bande * .12)) + 'px'; sous.style.width = ''; }
    }
    place(); window.addEventListener('resize', place);
    function terminer(r){
      if(fini) return; fini = true;
      cancelAnimationFrame(raf); window.removeEventListener('resize', place);
      if(lecture) clearInterval(lecture);
      try{ if(video){ video.pause(); video.removeAttribute('src'); video.load(); } }catch(e){}
      if(r === 'passe' && o.taire) try{ o.taire(); }catch(e){}
      ecran.classList.remove('on');
      setTimeout(function(){ ecran.remove(); }, r === 'echec' ? 0 : 380);
      fin(r);
    }
    ecran.addEventListener('click', function(ev){
      var b = ev.target.closest && ev.target.closest('[data-cine]'); if(!b) return;
      ev.stopPropagation();
      var a = b.getAttribute('data-cine');
      if(a === 'passer') terminer('passe');
      if(a === 'lire') ecouter(+b.getAttribute('data-i'));
      if(a === 'go' && video){ b.remove(); video.play().catch(function(){}); }
    });
    /* 🔊 : le film s'arrête le temps de la lecture, puis repart */
    function ecouter(i){
      var s = st[i]; if(!s || !video || !o.lire) return;
      video.pause();
      try{ o.lire(s[2], s[3]); }catch(e){}
      var t0 = Date.now(), mini = 600, maxi = 1500 + s[2].length * 95;
      if(lecture) clearInterval(lecture);
      lecture = setInterval(function(){
        var d = Date.now() - t0, parle = o.parle ? o.parle() : false;
        if((d > mini && !parle) || d > maxi){ clearInterval(lecture); lecture = null; if(!fini) video.play().catch(function(){}); }
      }, 120);
    }
    function image(){
      if(fini) return;
      raf = requestAnimationFrame(image);
      if(!video || video.paused) return;
      var t = video.currentTime;
      /* les sons : chacun une fois, à son instant (pas ceux qu'on a sautés) */
      cues.forEach(function(c){ if(!c.fait && t >= c.t){ c.fait = true; if(t - c.t < .5 && o.son) try{ o.son(c.id); }catch(e){} } });
      var k = -1;
      for(var i = 0; i < st.length; i++) if(t >= st[i][0] && t <= st[i][1]){ k = i; break; }
      if(k !== courant){
        courant = k;
        if(k < 0){ sous.classList.remove('on'); }
        else {
          var s = st[k], mots = String(s[2]).split(/\s+/).length;
          sous.innerHTML = (s[3] ? '<span class="cine-qui">' + esc(s[3]) + '</span>' : '') + '<span class="cine-txt">« ' + esc(s[2]) + ' »</span>' +
            (o.lire ? '<button class="cine-lire" data-cine="lire" data-i="' + k + '" aria-label="Écouter">🔊</button>' : '');
          sous.classList.add('on');
        }
      }
    }
    var url = CL.essai != null ? CL.essai : o.url;
    var delai = setTimeout(function(){ terminer('echec'); }, o.attente || 8000);
    (url ? CL.precharger(url) : Promise.resolve(null)).then(function(src){
      if(fini) return;
      if(!src){ clearTimeout(delai); terminer('echec'); return; }
      video = document.createElement('video');
      video.muted = true; video.defaultMuted = true; video.playsInline = true;
      video.setAttribute('muted', ''); video.setAttribute('playsinline', ''); video.setAttribute('webkit-playsinline', ''); video.setAttribute('preload', 'auto');
      video.addEventListener('ended', function(){ terminer('fini'); });
      video.addEventListener('error', function(){ clearTimeout(delai); terminer('echec'); });
      video.addEventListener('playing', function(){ clearTimeout(delai); att.remove(); });
      video.src = src;
      cadre.appendChild(video);
      var p = video.play();
      if(p && p.catch) p.catch(function(){
        /* le navigateur refuse de partir tout seul : un grand bouton jaune */
        clearTimeout(delai); att.remove();
        if(!fini && !ecran.querySelector('.cine-go')){ var g = el('button', 'cine-go', '▶ Regarder'); g.setAttribute('data-cine', 'go'); ecran.appendChild(g); }
      });
      raf = requestAnimationFrame(image);
    });
  });
};
})();
