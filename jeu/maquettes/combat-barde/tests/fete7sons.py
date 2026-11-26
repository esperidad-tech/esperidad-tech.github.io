import pathlib, re
from playwright.sync_api import sync_playwright
src = pathlib.Path(__file__).resolve().parent.parent / 'src'
jeu = (src / 'jeu.js').read_text()
fete = jeu[jeu.index('const FETE = ['):jeu.index('(() => { // les six boutons')]
code = (src / 'son.js').read_text() + '\n' + (src / 'musique.js').read_text()
html = "<!DOCTYPE html><html><body><script>" + code + "\nconst I = Son.I, G = { jamK: 0 };\n" + fete + r"""
async function un(i) {
  const sr = 44100, off = new OfflineAudioContext(2, sr * 2, sr);
  Son.construire(off); Son.salle('club'); FETE[i].son(0.05, [66, 69, 74, 78]);
  const b = await off.startRendering(), L = b.getChannelData(0), R = b.getChannelData(1);
  let pk = 0, s = 0; for (let k = 0; k < L.length; k++) pk = Math.max(pk, Math.abs(L[k]), Math.abs(R[k]));
  const w = Math.floor(sr * 0.3); for (let k = 2205; k < 2205 + w; k++) s += L[k] * L[k] + R[k] * R[k];
  return [FETE[i].nom, Math.round(pk * 100) / 100, Math.round(100 * Math.log10(s / w / 2 + 1e-12)) / 10];
}
</script></body></html>"""
with sync_playwright() as p:
    nav = p.chromium.launch(executable_path='/usr/bin/google-chrome'); pg = nav.new_page(); err = []
    pg.on('pageerror', lambda e: err.append(str(e))); pg.set_content(html)
    for i in range(6): print(pg.evaluate(f'un({i})'))
    print('erreurs :', err or 'aucune'); nav.close()
