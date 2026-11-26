import pathlib
from playwright.sync_api import sync_playwright
src = pathlib.Path(__file__).resolve().parent.parent / 'src'
code = (src / 'son.js').read_text() + '\n' + (src / 'musique.js').read_text()
html = "<!DOCTYPE html><html><body><script>" + code + r"""
async function un(f) {
  const sr = 44100, off = new OfflineAudioContext(2, sr * 2, sr);
  Son.construire(off); Son.salle('taverne');
  f(Son.I, 0.05);
  const b = await off.startRendering(), L = b.getChannelData(0), R = b.getChannelData(1);
  let pk = 0, s = 0; for (let i = 0; i < L.length; i++) { pk = Math.max(pk, Math.abs(L[i]), Math.abs(R[i])); }
  const w = Math.floor(sr * 0.3); for (let i = Math.floor(sr * 0.05); i < Math.floor(sr * 0.05) + w; i++) s += L[i] * L[i] + R[i] * R[i];
  return [Math.round(pk * 100) / 100, Math.round(100 * Math.log10(s / w / 2 + 1e-12)) / 10];
}
const tons = [62, 65, 69, 74];
const tests = { 'v4 note (voix+luth)': I => { I.voix(0.05, 65, 0.36, 0.36, 0); I.pince(0.05, 53, 0.3); }, 'v4 repousse': I => I.repousse(0.05, [50, 53, 57]), 'v4 stop': I => I.stop(0.05, 62), 'v4 vague': I => I.vague(0.05), 'v4 guitare solo': I => I.guitare(0.05, 72, 0.3, 0.2) };
Musique.CHANSONS.forEach((c, k) => {
  const S = c.sons;
  tests[k + ' note'] = I => S.note(0.05, 65, 1); tests[k + ' note parfait'] = I => S.note(0.05, 65, 2);
  tests[k + ' repousse'] = I => S.repousse(0.05, tons); tests[k + ' stop'] = I => S.stop(0.05, tons); tests[k + ' vague'] = I => S.vague(0.05, tons);
  tests[k + ' tue'] = I => S.tue(0.05, 77); tests[k + ' solo'] = I => S.solo(0.05, 72, 0.3, 0.2);
});
async function tout() { const r = {}; for (const k in tests) r[k] = await un(tests[k]); return r; }
</script></body></html>"""
with sync_playwright() as p:
    nav = p.chromium.launch(executable_path='/usr/bin/google-chrome')
    pg = nav.new_page(); err = []; pg.on('pageerror', lambda e: err.append(str(e)))
    pg.set_content(html)
    for k, v in pg.evaluate('tout()').items(): print(f'{k:24s} crête {v[0]:.2f}  niveau {v[1]} dB')
    print('erreurs :', err or 'aucune'); nav.close()
