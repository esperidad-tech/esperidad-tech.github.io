import pathlib, math
from playwright.sync_api import sync_playwright
src = pathlib.Path(__file__).resolve().parent.parent / 'src'
code = (src / 'son.js').read_text() + '\n' + (src / 'musique.js').read_text()
html = "<!DOCTYPE html><html><body><script>" + code + r"""
async function rendre(quoi, v, bpm, tr, dur) {
  const sr = 44100, off = new OfflineAudioContext(2, sr * dur, sr);
  Son.construire(off); const sec = [];
  const cb = { section: x => sec.push(x.sec + '@' + x.t0.toFixed(2)) };
  if (quoi === 'relance') Musique.relancer(0.05, { bpm, tr, version: v }, false), Musique.M.cb = cb;
  else Musique.demarrer(0.05, cb, { bpm, tr, version: v, debut: quoi });
  let t = 0; while (t < dur - 0.3) { t += 0.05; Musique.planifier({ currentTime: t }); }
  const b = await off.startRendering(), L = b.getChannelData(0);
  let s = 0, pk = 0; for (let i = 0; i < L.length; i++) { s += L[i] * L[i]; pk = Math.max(pk, Math.abs(L[i])); }
  return { rms: Math.sqrt(s / L.length), pk, sec: sec.join(' ') };
}
</script></body></html>"""
with sync_playwright() as p:
    nav = p.chromium.launch(executable_path='/usr/bin/google-chrome')
    pg = nav.new_page(); err = []; pg.on('pageerror', lambda e: err.append(str(e)))
    pg.set_content(html)
    for args in [("'B'", 1, 112, 0, 18), ("'B'", 2, 120, 0, 17), ("'B'", 3, 128, 0, 16), ("'B'", 4, 136, 2, 15), ("'relance'", 2, 120, 0, 50)]:
        r = pg.evaluate(f"rendre({args[0]}, {args[1]}, {args[2]}, {args[3]}, {args[4]})")
        print(f"{args[0]:10s} v{args[1]} {args[2]} bpm : rms {20*math.log10(r['rms']):5.1f} dB  crête {r['pk']:.2f}  {r['sec'][:120]}")
    print('erreurs :', err or 'aucune')
    nav.close()
