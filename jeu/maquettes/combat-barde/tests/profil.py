import pathlib
from playwright.sync_api import sync_playwright
src = pathlib.Path(__file__).resolve().parent.parent / 'src'
code = (src / 'son.js').read_text() + '\n' + (src / 'musique.js').read_text()
html = "<!DOCTYPE html><html><body><script>" + code + r"""
const ORIG = Object.assign({}, Son.I);
async function mesure(sec, sans, dur) {
  Object.assign(Son.I, ORIG); for (const k of sans) Son.I[k] = () => {};
  const sr = 48000, off = new OfflineAudioContext(2, sr * dur, sr);
  Son.construire(off); Musique.demarrer(0.05, {}, 3, 3);
  Object.assign(Musique.M, { sec, file: [sec], bpm: 140 });
  let t = 0; while (t < dur - 0.3) { t += 0.05; Musique.planifier({ currentTime: t }); }
  const t0 = performance.now(); await off.startRendering(); return Math.round(10 * dur / ((performance.now() - t0) / 1000)) / 10;
}
</script></body></html>"""
with sync_playwright() as p:
    nav = p.chromium.launch(executable_path='/usr/bin/google-chrome')
    pg = nav.new_page(); pg.set_content(html)
    for sec, sans in [('TM', []), ('TN', []), ('TN', ['reese']), ('TN', ['b808']), ('TN', ['voix', 'choeur']), ('TN', ['synthlead']), ('TN', ['acid']), ('TN', ['supersaw']), ('TN', ['tamb', 'hatMetal', 'clap', 'caisse']), ('TN', ['kickDur'])]:
        print(sec, 'sans', sans, pg.evaluate(f"mesure('{sec}', {sans}, 8)"))
    nav.close()
