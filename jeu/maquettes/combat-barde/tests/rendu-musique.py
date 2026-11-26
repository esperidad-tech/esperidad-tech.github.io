#!/usr/bin/env python3
"""Rend la musique hors ligne dans Chrome (OfflineAudioContext) et mesure les niveaux.
Usage : python3 rendu-musique.py [secondes] [fichier.wav]"""
import sys, json, base64, pathlib
from playwright.sync_api import sync_playwright

ici = pathlib.Path(__file__).resolve().parent
src = ici.parent / 'src'
duree = float(sys.argv[1]) if len(sys.argv) > 1 else 70
sortie = sys.argv[2] if len(sys.argv) > 2 else None
code = (src / 'son.js').read_text() + '\n' + (src / 'musique.js').read_text()

page_html = "<!DOCTYPE html><html><body><script>" + code + r"""
window.rendre = async (duree, soloA, phase2A) => {
  const sr = 44100;
  const off = new OfflineAudioContext(2, Math.ceil(sr * duree), sr);
  Son.construire(off);
  const evts = [];
  Musique.demarrer(0.05, { temps: b => evts.push(['t', b.t, b.sec, b.bar, b.b]), solo: (t) => evts.push(['solo', t]) });
  let t = 0, soloFait = false, p2 = false;
  while (t < duree - 0.5 && Musique.M.on) {
    t += 0.05;
    if (!soloFait && t > soloA) { Musique.demanderSolo(); soloFait = true; }
    if (!p2 && t > phase2A) { Musique.changer(128, 0); p2 = true; }
    Musique.M.mult = t > 40 ? 4 : t > 25 ? 3 : t > 12 ? 2 : 1;
    Musique.planifier({ currentTime: t });
  }
  const buf = await off.startRendering();
  const L = buf.getChannelData(0), R = buf.getChannelData(1);
  let peak = 0, sum = 0; const win = sr, rms = [];
  let ws = 0;
  for (let i = 0; i < L.length; i++) {
    const v = Math.max(Math.abs(L[i]), Math.abs(R[i])); if (v > peak) peak = v;
    sum += L[i] * L[i]; ws += L[i] * L[i];
    if ((i + 1) % win === 0) { rms.push(Math.sqrt(ws / win)); ws = 0; }
  }
  // WAV 16 bits stéréo
  const n = L.length, data = new DataView(new ArrayBuffer(44 + n * 4));
  const w = (o, s) => { for (let i = 0; i < s.length; i++) data.setUint8(o + i, s.charCodeAt(i)); };
  w(0, 'RIFF'); data.setUint32(4, 36 + n * 4, true); w(8, 'WAVE'); w(12, 'fmt ');
  data.setUint32(16, 16, true); data.setUint16(20, 1, true); data.setUint16(22, 2, true);
  data.setUint32(24, sr, true); data.setUint32(28, sr * 4, true); data.setUint16(32, 4, true); data.setUint16(34, 16, true);
  w(36, 'data'); data.setUint32(40, n * 4, true);
  for (let i = 0; i < n; i++) {
    data.setInt16(44 + i * 4, Math.max(-1, Math.min(1, L[i])) * 32767, true);
    data.setInt16(46 + i * 4, Math.max(-1, Math.min(1, R[i])) * 32767, true);
  }
  let bin = ''; const u8 = new Uint8Array(data.buffer);
  for (let i = 0; i < u8.length; i += 0x8000) bin += String.fromCharCode.apply(null, u8.subarray(i, i + 0x8000));
  return { peak, rmsTotal: Math.sqrt(sum / L.length), rms: rms.map(x => +x.toFixed(3)), evts: evts.filter(e => e[0] === 'solo' || (e[4] === 0 && e[3] === 0)), wav: btoa(bin) };
};
</script></body></html>"""

with sync_playwright() as p:
    nav = p.chromium.launch(executable_path='/usr/bin/google-chrome', args=['--autoplay-policy=no-user-gesture-required'])
    pg = nav.new_page()
    erreurs = []
    pg.on('pageerror', lambda e: erreurs.append(str(e)))
    pg.on('console', lambda m: erreurs.append('console: ' + m.text) if m.type == 'error' else None)
    pg.set_content(page_html)
    r = pg.evaluate(f'rendre({duree}, 52, 50)')
    nav.close()
print('erreurs :', erreurs or 'aucune')
print('crête :', round(r['peak'], 3), ' rms total :', round(r['rmsTotal'], 3))
print('rms par seconde :', r['rms'])
print('sections :', [(round(e[1], 2), e[2]) if e[0] == 't' else ('SOLO', round(e[1], 2)) for e in r['evts']])
if sortie:
    pathlib.Path(sortie).write_bytes(base64.b64decode(r['wav']))
    print('écrit', sortie)
