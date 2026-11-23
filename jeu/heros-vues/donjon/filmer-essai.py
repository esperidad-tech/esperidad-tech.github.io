#!/usr/bin/env python3
"""Les films de l'essai dans le donjon (la Pisteuse en volume) — voir LISEZ-MOI.md.

    cd jeu/heros-vues/sortie/donjon-essai && python3 -m http.server 8765 &
    python3 jeu/heros-vues/donjon/filmer-essai.py NOM rats '[[0.2, "T(\\"Elle tire\\")"], [0.3, "V.tirer(FX, C(0), \\"feu\\")"]]' 4 [x,y,l,h] [lenteur] [loupe]
    → NOM.mp4 (dans le dossier courant)

Les ordres : V = la Pisteuse (ses ordres : entrer, tirer, dague, touche, tomber, relever, entoile, avale, recrache, joie,
choisi…), A = l'Alchimiste (preparer, lancer, louche, herbes, et les mêmes ordres communs), FX = la scène des effets du combat, C(i) = le centre de la i-ème bête depuis la gauche, T("…") = un titre en haut.
La page tourne au ralenti (lenteur 8 : 8 fois plus lentement — l'heure, les minuteries, les animations) : on prend une photo
après l'autre, chacune avec son heure « de la page » ; le film est remonté à la vraie vitesse, à 25 images par seconde."""
import asyncio, sys, time, json, os, subprocess, shutil, base64
from playwright.async_api import async_playwright
NOM, COMBAT, ETAPES, DUREE = sys.argv[1], sys.argv[2], json.loads(sys.argv[3]), float(sys.argv[4])
CLIP = [int(v) for v in (sys.argv[5] if len(sys.argv) > 5 else '160,40,1120,520').split(',')]
S = float(sys.argv[6]) if len(sys.argv) > 6 else 8
# (loupe : 2 = la page dessinée deux fois plus fin, pour un gros plan net sur un héros avec un petit cadre)
Z = float(sys.argv[7]) if len(sys.argv) > 7 else 1
URL = 'http://localhost:8765/index.html?combat=' + COMBAT + '&nouveau=1'
LENT = '''(function(){
  var pn = performance.now.bind(performance), dn = Date.now.bind(Date), S = 1, br = pn(), bv = br;
  function v(){ return bv + (pn() - br) / S; }
  window.__lent = function(s){ bv = v(); br = pn(); S = s; document.getAnimations().forEach(function(a){ a.playbackRate = 1 / S; }); };
  performance.now = v;
  var dd = dn() - pn(); Date.now = function(){ return Math.round(dd + v()); };
  var raf = window.requestAnimationFrame.bind(window);
  window.requestAnimationFrame = function(f){ return raf(function(){ f(v()); }); };
  var st = window.setTimeout.bind(window); window.setTimeout = function(f, ms){ var a = [].slice.call(arguments, 2); return st.apply(window, [f, (ms || 0) * S].concat(a)); };
  var si = window.setInterval.bind(window); window.setInterval = function(f, ms){ var a = [].slice.call(arguments, 2); return si.apply(window, [f, (ms || 0) * S].concat(a)); };
  var an = Element.prototype.animate; Element.prototype.animate = function(){ var a = an.apply(this, arguments); if(S !== 1) a.playbackRate = 1 / S; return a; };
  si(function(){ if(S === 1) return; document.getAnimations().forEach(function(a){ if(Math.abs(a.playbackRate - 1 / S) > 1e-6) a.playbackRate = 1 / S; }); }, 15);
})();'''
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(**({'executable_path':'/usr/bin/google-chrome'} if os.path.exists('/usr/bin/google-chrome') else {}))
        pg = await b.new_page(viewport={'width':1280, 'height':720}, device_scale_factor=Z)
        await pg.add_init_script(LENT)
        errs = []
        pg.on('console', lambda m: errs.append(m.type + ': ' + m.text) if m.type in ('error',) else None)
        pg.on('pageerror', lambda e: errs.append('PAGEERROR: ' + str(e)))
        await pg.goto(URL)
        await pg.wait_for_function('() => window.HerosVuesDonjon && HerosVuesDonjon.toutes && [].some.call(document.querySelectorAll(".pv b"), function(b){ return b.textContent; })', timeout=30000)
        await pg.wait_for_function('''() => { var V = HerosVuesDonjon.toutes[0]; if(!V || V.course || V.boite.style.transform) return false;
          var L = [].filter.call(document.querySelectorAll('.perso.bete, .bete'), function(e){ var r = e.getBoundingClientRect(); return r.width > 20 && r.left + r.width / 2 < 1200; });
          var bd = document.querySelector('#bande'); if(!bd || bd.classList.contains('attend') || bd.textContent.indexOf('Pisteur') < 0) return false;
          return L.length > 0 && !document.getAnimations().some(function(a){ return a.effect && a.effect.target && a.effect.target.closest && a.effect.target.closest('.bete') && a.playState === 'running' && isFinite(a.effect.getComputedTiming().endTime) && a.effect.getComputedTiming().endTime > 800; }); }''', timeout=40000)
        await asyncio.sleep(1.5)
        await pg.evaluate('''() => { var R = function(r){ return HerosVuesDonjon.toutes.filter(function(v){ return v.role === r; })[0]; };
          var V = R('pisteur') || HerosVuesDonjon.toutes[HerosVuesDonjon.toutes.length - 1], FX = document.querySelector('#fx'), S = FX.getBoundingClientRect(), k = S.width / FX.offsetWidth;
          window.V = V; window.A = R('alchimiste'); window.FX = FX;
          var ti = document.createElement('div'); ti.style.cssText = 'position:fixed;left:184px;top:58px;z-index:9999;color:#fff3c0;font:600 24px Georgia,serif;text-shadow:0 2px 0 #24182e,0 0 8px #000;pointer-events:none'; document.body.appendChild(ti);
          window.T = function(s){ ti.textContent = s; return s; };
          window.C = function(i){ var L = [].map.call(document.querySelectorAll('.perso.bete, .bete'), function(e){ var r = e.getBoundingClientRect(); return {x:(r.left + r.width / 2 - S.left) / k, y:(r.top + r.height * 0.55 - S.top) / k, w:r.width / k}; }).filter(function(r){ return r.w > 20; }).sort(function(a, b){ return a.x - b.x; }); return L[Math.min(i, L.length - 1)] || {x:700, y:300}; }; }''')
        t0v = await pg.evaluate('() => { __lent(' + str(S) + '); return performance.now() / 1000; }')
        d = '/tmp/hv-essai-' + NOM; shutil.rmtree(d, ignore_errors=True); os.makedirs(d)
        et = list(ETAPES); L = []
        while True:
            tv = await pg.evaluate('() => performance.now() / 1000') - t0v
            while et and et[0][0] <= tv:
                await pg.evaluate('() => { try{ window.RES = (' + et[0][1] + '); }catch(e){ console.error("JS " + e); } }'); et.pop(0)
            if tv > DUREE: break
            r = await pg.screenshot(type='jpeg', quality=92, clip={'x':CLIP[0], 'y':CLIP[1], 'width':CLIP[2], 'height':CLIP[3]})
            tv2 = await pg.evaluate('() => performance.now() / 1000') - t0v
            f = f'{d}/{len(L):05d}.jpg'; open(f, 'wb').write(r); L.append(((tv + tv2) / 2, f))
        print('\n'.join(errs[:20])); print(len(L), 'photos pour', DUREE, 's')
        await b.close()
    # remonter à 25 images par seconde : pour chaque image du film, la photo la plus proche
    o = '/tmp/hv-essai-' + NOM + '-25'; shutil.rmtree(o, ignore_errors=True); os.makedirs(o)
    j = 0
    for i in range(int(DUREE * 25)):
        t = i / 25
        while j + 1 < len(L) and abs(L[j + 1][0] - t) <= abs(L[j][0] - t): j += 1
        shutil.copy(L[j][1], f'{o}/{i:05d}.jpg')
    subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-framerate', '25', '-i', f'{o}/%05d.jpg', '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '20', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', NOM + '.mp4'], check=True)
asyncio.run(main())
