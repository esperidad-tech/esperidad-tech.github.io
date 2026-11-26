# combien de fois plus vite que le temps réel le navigateur fabrique la musique (les passages les plus chargés)
import pathlib, time
from playwright.sync_api import sync_playwright
src = pathlib.Path(__file__).resolve().parent.parent / 'src'
code = (src / 'son.js').read_text() + '\n' + (src / 'musique.js').read_text()
html = "<!DOCTYPE html><html><body><script>" + code + r"""
async function mesure(ch, sec, file, dur) {
  const sr = 48000, off = new OfflineAudioContext(2, sr * dur, sr);
  Son.construire(off);
  Musique.demarrer(0.05, {}, ch, 3);
  if (sec) Object.assign(Musique.M, { sec, file, bpm: sec[0] === 'T' ? Musique.TUBE.bpm : Musique.CHANSONS[ch].bpm });
  let t = 0; while (t < dur - 0.3) { t += 0.05; Musique.planifier({ currentTime: t }); }
  const t0 = performance.now(); await off.startRendering(); return dur / ((performance.now() - t0) / 1000);
}
</script></body></html>"""
with sync_playwright() as p:
    nav = p.chromium.launch(executable_path='/usr/bin/google-chrome')
    pg = nav.new_page(); pg.set_content(html)
    for ch, sec, file in [(0, 'M', ['M']), (1, 'M', ['M']), (2, 'M', ['M']), (3, 'M', ['M']), (3, 'TN', ['TN']), (3, 'TD', ['TD'])]:
        print(ch, sec, round(pg.evaluate(f"mesure({ch}, '{sec}', {file}, 12)"), 1), 'x temps réel')
    nav.close()
