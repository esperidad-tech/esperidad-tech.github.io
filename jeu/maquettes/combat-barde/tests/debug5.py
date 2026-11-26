import pathlib
from playwright.sync_api import sync_playwright
src = pathlib.Path(__file__).resolve().parent.parent / 'src'
code = (src / 'son.js').read_text() + '\n' + (src / 'musique.js').read_text()
html = "<!DOCTYPE html><html><body><script>" + code + r"""
async function essai(salle, quoi) {
  const sr = 44100, off = new OfflineAudioContext(2, sr * 3, sr);
  Son.construire(off); Son.salle(salle);
  if (quoi === 'tic') Son.I.tic(0.1, true);
  if (quoi === 'kick') Son.I.kickDur(0.1, 1, 0.44);
  const b = await off.startRendering(), L = b.getChannelData(0);
  const r = []; for (let k = 0; k < 3; k++) { let s = 0; for (let i = k * sr; i < (k + 1) * sr; i++) s += L[i] * L[i]; r.push(Math.round(100 * Math.log10(s / sr + 1e-12)) / 10); }
  return r;
}
</script></body></html>"""
with sync_playwright() as p:
    nav = p.chromium.launch(executable_path='/usr/bin/google-chrome')
    pg = nav.new_page(); err = []; pg.on('pageerror', lambda e: err.append(str(e)))
    pg.set_content(html)
    for salle in ['pierre', 'taverne', 'forge', 'cathedrale', 'club']:
        for quoi in ['rien', 'tic', 'kick']:
            print(salle, quoi, pg.evaluate(f"essai('{salle}', '{quoi}')"))
    print(err)
    nav.close()
