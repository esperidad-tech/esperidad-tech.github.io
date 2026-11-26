import pathlib, json
from playwright.sync_api import sync_playwright
ici = pathlib.Path(__file__).resolve().parent
with sync_playwright() as p:
    nav = p.chromium.launch(executable_path='/usr/bin/google-chrome'); pg = nav.new_page()
    pg.goto((ici / 'vues' / 'barde-essai.html').as_uri()); pg.wait_for_timeout(400)
    print(pg.evaluate('''() => { const HV = window.HerosVues, H = {role:'barde', sexe:'m', peau:'p2', cheveux:'chatain', yeux:'bleu', coiffure:'courts', combat:true};
      const F = HV.melange({}, HV.pose('repos'), 1); F.cap = 180; const o = HV.os(H, F), r = {}; for (const k of ['tete','cou','poignetG','poignetD','epauleG','epauleD','bassin']) r[k] = (o[k]||[]).map(v => Math.round(v)); r.duree = HV.dureeGeste(HV.DONJON.coup); r.joie = HV.DONJON.joie ? HV.dureeGeste(HV.DONJON.joie) : 0; return JSON.stringify(r); }'''))
    nav.close()
