import pathlib, json
from playwright.sync_api import sync_playwright
src = pathlib.Path(__file__).resolve().parent.parent / 'src'
code = (src / 'son.js').read_text() + '\n' + (src / 'musique.js').read_text()
html = "<!DOCTYPE html><html><body><script>" + code + r"""
async function rendre(quoi) {
  const sr = 44100, off = new OfflineAudioContext(2, sr * 10, sr);
  Son.construire(off); const I = Son.I;
  if (quoi === 'refrain' || quoi === 'solo') {
    Musique.demarrer(0.05, {}); Musique.M.sec = quoi === 'solo' ? 'S' : 'B'; Musique.M.boucle = 1; Musique.M.mult = 2;
    let t = 0; while (t < 9.5) { t += 0.05; Musique.planifier({ currentTime: t }); }
  }
  if (quoi === 'guitare') { const m = [69,72,76,74,72,71,69,76,74,72,71,72,74,79,77,76]; m.forEach((x, i) => I.guitare(0.1 + i * 0.5, x, 0.45, 0.2)); }
  if (quoi === 'voix') { const m = [69,72,76,81,76,72]; for (let i = 0; i < 18; i++) { const x = m[i % 6]; I.voix(0.1 + i * 0.5, x, 0.3, 0.22, i % 3); I.pince(0.1 + i * 0.5, x - 12, 0.22); } }
  if (quoi === 'kill') { for (let i = 0; i < 18; i++) I.ding(0.1 + i * 0.5, 81, 0.12); }
  const b = await off.startRendering(), L = b.getChannelData(0);
  let s = 0, pk = 0; for (let i = 0; i < L.length; i++) { s += L[i] * L[i]; pk = Math.max(pk, Math.abs(L[i])); }
  return { rms: Math.sqrt(s / L.length), pk };
}
</script></body></html>"""
with sync_playwright() as p:
    nav = p.chromium.launch(executable_path='/usr/bin/google-chrome')
    pg = nav.new_page(); pg.set_content(html)
    for q in ['refrain', 'solo', 'guitare', 'voix', 'kill']:
        r = pg.evaluate(f"rendre('{q}')"); import math
        print(f"{q:8s} rms {r['rms']:.3f} ({20*math.log10(r['rms']+1e-9):5.1f} dB)  crête {r['pk']:.2f}")
    nav.close()
