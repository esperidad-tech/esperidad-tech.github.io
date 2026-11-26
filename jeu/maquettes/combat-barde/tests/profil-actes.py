# ce qui coûte cher dans la musique, chanson par chanson (le méga refrain, le plus chargé) : la vitesse de fabrication sans tel instrument
import pathlib, sys, json
from playwright.sync_api import sync_playwright
src = pathlib.Path(__file__).resolve().parent.parent / 'src'
code = (src / 'son.js').read_text() + '\n' + (src / 'musique.js').read_text()
html = "<!DOCTYPE html><html><body><script>" + code + r"""
const ORIG = Object.assign({}, Son.I);
async function mesure(ch, sec, sans, dur, sansSalle) {
  Object.assign(Son.I, ORIG); const vus = {};
  for (const k in ORIG) if (typeof ORIG[k] === 'function') Son.I[k] = sans.includes(k) ? () => {} : function () { vus[k] = (vus[k] || 0) + 1; return ORIG[k].apply(Son.I, arguments); };
  const sr = 48000, off = new OfflineAudioContext(2, sr * dur, sr);
  Son.construire(off); Musique.demarrer(0.05, {}, ch, 3);
  if (sansSalle) { try { Son.N.revIn.disconnect(); } catch (e) {} }
  if (sec) Object.assign(Musique.M, { sec, file: [sec], bpm: sec[0] === 'T' ? Musique.TUBE.bpm : Musique.CHANSONS[ch].bpm });
  let t = 0; while (t < dur - 0.3) { t += 0.05; Musique.planifier({ currentTime: t }); }
  const t0 = performance.now(); await off.startRendering(); return [Math.round(100 * dur / ((performance.now() - t0) / 1000)) / 100, vus];
}
</script></body></html>"""
quoi = json.loads(sys.argv[1]) if len(sys.argv) > 1 else [[0, 'M'], [1, 'M'], [2, 'M'], [3, 'M'], [3, 'TN']]
with sync_playwright() as p:
    nav = p.chromium.launch(executable_path='/usr/bin/google-chrome'); pg = nav.new_page(); pg.set_content(html)
    for ch, sec in quoi:
        base, vus = pg.evaluate(f"mesure({ch}, '{sec}', [], 6, false)"); sans_salle = pg.evaluate(f"mesure({ch}, '{sec}', [], 6, true)")[0]
        gains = sorted(((pg.evaluate(f"mesure({ch}, '{sec}', ['{k}'], 6, false)")[0], k, n) for k, n in vus.items()), reverse=True)[:6]
        print(f'chanson {ch} {sec} : {base} x ; sans la salle {sans_salle} x ; sans… ' + ' | '.join(f'{k} ({n} fois) {v} x' for v, k, n in gains), flush=True)
    nav.close()
