"""LA VRAIE MIMI AU LABO (Romain, 19 novembre, 9 h 24 et 12 h 36 : « c'est le vieux chat, mais le nouveau chat […] des petites mimiques,
où il est content, il ronronne »). Le chat de l'atelier (son pelage, ses yeux) saute sur la paillasse : c'est le pantin de Mimi, qui bouge ;
il fait ses mimiques ; il ne miaule pas.   BRUMEVAL_DIST=<dossier construit> python3 tools/labo-mimi.py"""
import os
from playwright.sync_api import sync_playwright
D = os.environ.get('BRUMEVAL_DIST', os.path.join(os.path.dirname(__file__), '..', 'dist'))
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'test', 'labo-mimi'); os.makedirs(OUT, exist_ok=True)
echecs = []
def verifier(c, q):
    print('  ✓' if c else '  ✗', q)
    if not c: echecs.append(q)
with sync_playwright() as p:
    b = p.chromium.launch()
    pg = b.new_context(viewport={'width': 1180, 'height': 820}, has_touch=True).new_page(); errs = []
    pg.on('pageerror', lambda e: errs.append(str(e)))
    pg.goto('file://' + os.path.abspath(os.path.join(D, 'index.html'))); pg.wait_for_timeout(600)
    pg.click('[data-act=creer]'); pg.click('[data-act=crea-role][data-r=alchimiste]'); pg.click('[data-act=crea-suite]'); pg.fill('#nom', 'Alicia'); pg.click('[data-act=crea-fin]')
    pg.click('[data-act=nouvelle-enquete]'); pg.click('[data-act=commencer]'); pg.wait_for_timeout(400)
    pg.evaluate("() => { M.tutoPermet = function(){ return true; }; M.tutoActif = function(){ return false; }; M.S.laboIntro = 1; M.P().recus['obj:fil'] = 1; M.S.atelier = M.S.atelier || {}; M.S.atelier.objets = (M.S.atelier.objets || []).filter(function(o){ return o.t !== 'chat'; }).concat([{id:'chat1', t:'chat', v:3}]); M.sauver(); }")
    info = pg.evaluate("() => JSON.stringify(window.MimiLabo ? window.MimiLabo() : null)")
    verifier(info and info != 'null', f'le jeu sait dessiner sa Mimi pour le labo ({info[:60]})')
    pg.evaluate("() => M.ouvrirLabo()"); pg.wait_for_timeout(1500)
    f = next((x for x in pg.frames if x.parent_frame is not None), None)
    f.wait_for_function('() => !!window.__labo', timeout=8000)
    f.evaluate("() => { if(window.GUIDE) GUIDE.fini = true; var i = document.querySelector('.intro'); if(i) i.remove(); }")
    pg.wait_for_timeout(500); print('   appel :', f.evaluate("() => { try{ window.__labo.mimiVient(); return JSON.stringify({en:window.__labo.mimi.enRoute, calme:window.__labo.mimi.calme, h:window.__labo.mimi.el.hidden}); }catch(e){ return String(e); } }")); pg.wait_for_timeout(2200)
    print('   ', f.evaluate("() => JSON.stringify({calme:window.__labo.mimi.calme, intro:!!document.querySelector('.intro'), guide:(typeof GUIDE==='object'&&GUIDE)?{id:GUIDE.id,fini:GUIDE.fini}:null, mode:window.__labo.etat().mode, occ:window.__labo.etat().occupe, en:window.__labo.mimi.enRoute, hid:document.hidden})"))
    e = f.evaluate("() => { var m = window.__labo.mimi; return {rig:!!(m.rig && !m.rig.mort), pantin:!!document.querySelector('.mimi.mimi-pantin svg [data-m]'), pose:m.pose, sur:m.sur, cache:m.el.hidden}; }")
    verifier(e['rig'] and e['pantin'], f'(19 novembre) le chat du labo est le pantin de Mimi ({e})')
    verifier(e['pose'] and not e['cache'], 'il a sauté sur la paillasse')
    t1 = f.evaluate("() => document.querySelector('.mimi svg').innerHTML.length + ':' + (document.querySelector('.mimi svg [data-m]').getAttribute('transform') || '')")
    pg.wait_for_timeout(1200)
    t2 = f.evaluate("() => document.querySelector('.mimi svg').innerHTML.length + ':' + (document.querySelector('.mimi svg [data-m]').getAttribute('transform') || '')")
    a = f.evaluate("() => { var s = document.querySelector('.mimi svg').innerHTML; return s; }")
    pg.wait_for_timeout(700)
    bouge = f.evaluate("(a) => document.querySelector('.mimi svg').innerHTML !== a", a)
    verifier(bouge, '(19 novembre) il bouge (il respire, sa queue se balance)')
    f.evaluate("() => { window.__labo.mimi.rig.geste('content', {d:1500}); }"); pg.wait_for_timeout(600)
    pg.screenshot(path=os.path.join(OUT, 'mimi-paillasse.png'))
    verifier(not errs, f'pas d\'erreur ({errs[:2]})')
    b.close()
print('ÉCHECS :', echecs)
