import pathlib
from playwright.sync_api import sync_playwright
src = pathlib.Path(__file__).resolve().parent.parent / 'src'
code = (src / 'son.js').read_text() + '\n' + (src / 'musique.js').read_text()
html = "<!DOCTYPE html><html><body><script>" + code + r"""
async function rel(ch, dur, avant) {
  const sr = 44100, off = new OfflineAudioContext(2, Math.ceil(sr * dur), sr);
  Son.construire(off);
  if (avant) avant();
  Musique.relancer(0.05, ch, false); Musique.M.cb = {}; Musique.M.niveau = 1;
  let t = 0; while (t < dur - 0.3) { t += 0.05; Musique.planifier({ currentTime: t }); }
  const b = await off.startRendering(), L = b.getChannelData(0);
  const r = [], w = sr / 2; for (let k = 0; k + w <= L.length; k += w) { let s = 0; for (let i = k; i < k + w; i++) s += L[i] * L[i]; r.push(Math.round(100 * Math.log10(s / w + 1e-12)) / 10); }
  let dc = 0; for (let i = 0; i < sr; i++) dc += L[i]; 
  return [r.join(' '), dc / sr];
}
</script></body></html>"""
with sync_playwright() as p:
    nav = p.chromium.launch(executable_path='/usr/bin/google-chrome')
    pg = nav.new_page(); err = []; pg.on('pageerror', lambda e: err.append(str(e)))
    pg.set_content(html)
    for ch in [3, 2, 3]:
        print(ch, pg.evaluate(f"rel({ch}, 4)"))
    print(err)
    nav.close()
