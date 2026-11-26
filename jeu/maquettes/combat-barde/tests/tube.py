import pathlib, math, sys, base64
from playwright.sync_api import sync_playwright
src = pathlib.Path(__file__).resolve().parent.parent / 'src'
code = (src / 'son.js').read_text() + '\n' + (src / 'musique.js').read_text()
html = "<!DOCTYPE html><html><body><script>" + code + r"""
async function rendre(ch, dur, relance) {
  const sr = 44100, off = new OfflineAudioContext(2, Math.ceil(sr * dur), sr);
  Son.construire(off); const sec = [];
  const cb = { section: x => sec.push(x.sec + '@' + x.t0.toFixed(1)) };
  if (relance) { Musique.relancer(0.05, ch, relance === 2); if (relance === 2) { Object.assign(Musique.M, { sec: 'TI', file: ['TB', 'TD', 'TM', 'TR', 'TN', 'TF'], bpm: Musique.TUBE.bpm }); } Musique.M.cb = cb; Musique.M.niveau = 1; }
  else Musique.demarrer(0.05, cb, ch, 0);
  const bar = relance === 2 ? 240 / Musique.TUBE.bpm : 240 / Musique.CHANSONS[ch].bpm;
  let t = 0, megaFait = false;
  while (t < dur - 0.3) {
    t += 0.05;
    if (!relance) { Musique.M.niveau = t < bar * 2 ? 0 : t < bar * 4 ? 1 : t < bar * 6 ? 2 : 3; if (!megaFait && t > bar * 7.5) { Musique.demanderMega(); megaFait = true; } }
    Musique.planifier({ currentTime: t });
  }
  const b = await off.startRendering(), L = b.getChannelData(0), R = b.getChannelData(1);
  const fen = Math.floor(sr * bar), parts = [];
  for (let i = 0; i + fen <= L.length; i += fen) { let s = 0; for (let j = i; j < i + fen; j++) s += L[j] * L[j]; parts.push(Math.round(10 * 10 * Math.log10(s / fen + 1e-12)) / 10); }
  let pk = 0; for (let i = 0; i < L.length; i++) pk = Math.max(pk, Math.abs(L[i]), Math.abs(R[i]));
  const n = L.length, dv = new DataView(new ArrayBuffer(44 + n * 4));
  const w = (o, s) => { for (let i = 0; i < s.length; i++) dv.setUint8(o + i, s.charCodeAt(i)); };
  w(0, 'RIFF'); dv.setUint32(4, 36 + n * 4, true); w(8, 'WAVE'); w(12, 'fmt '); dv.setUint32(16, 16, true); dv.setUint16(20, 1, true); dv.setUint16(22, 2, true);
  dv.setUint32(24, sr, true); dv.setUint32(28, sr * 4, true); dv.setUint16(32, 4, true); dv.setUint16(34, 16, true); w(36, 'data'); dv.setUint32(40, n * 4, true);
  for (let i = 0; i < n; i++) { dv.setInt16(44 + i * 4, Math.max(-1, Math.min(1, L[i])) * 32767, true); dv.setInt16(46 + i * 4, Math.max(-1, Math.min(1, R[i])) * 32767, true); }
  let bin = ''; const u8 = new Uint8Array(dv.buffer); for (let i = 0; i < u8.length; i += 0x8000) bin += String.fromCharCode.apply(null, u8.subarray(i, i + 0x8000));
  return { parts, pk, sec: sec.join(' '), wav: btoa(bin) };
}
</script></body></html>"""
with sync_playwright() as p:
    nav = p.chromium.launch(executable_path='/usr/bin/google-chrome')
    pg = nav.new_page(); err = []; pg.on('pageerror', lambda e: err.append(str(e)))
    pg.set_content(html)
    r = pg.evaluate(f'rendre(3, 56, 2)')
    print(f"relance finale + tube : crête {r['pk']:.2f}\n dB par mesure (tube) : {r['parts']}\n {r['sec']}")
    pathlib.Path('tube.wav').write_bytes(base64.b64decode(r['wav']))
    print('erreurs :', err or 'aucune')
    nav.close()

