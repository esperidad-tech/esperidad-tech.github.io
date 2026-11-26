#!/usr/bin/env python3
"""La vitesse d'affichage sur un téléphone ralenti 4 fois (mode seul, deuxième combat, pilote automatique).   python3 tests/vitesse.py"""
import os
from playwright.sync_api import sync_playwright
ICI = os.path.dirname(os.path.abspath(__file__))
PAGE = 'file://' + os.path.join(os.path.dirname(ICI), 'phase3.html')
with sync_playwright() as p:
    b = p.chromium.launch(); ctx = b.new_context(viewport={'width': 844, 'height': 390}, device_scale_factor=2, has_touch=True, is_mobile=True)
    pg = ctx.new_page(); cdp = ctx.new_cdp_session(pg)
    pg.goto(PAGE); pg.evaluate("localStorage.clear()"); pg.reload(); pg.wait_for_timeout(200)
    pg.evaluate("Object.assign(__p3.reglages,{mode:'seul',role:'barde',debut:3}); __p3.demarrer(); window.__pil = new Pilote({}); window.__pilote = function(S){ return __pil.manette(S); }; 0")
    cdp.send('Emulation.setCPUThrottlingRate', {'rate': 4})
    pg.wait_for_timeout(2500); mesures = []
    for i in range(6): pg.wait_for_timeout(1100); mesures.append(pg.evaluate("__p3.ips"))
    print('images par seconde (ralenti 4 fois) :', mesures)
    b.close()
