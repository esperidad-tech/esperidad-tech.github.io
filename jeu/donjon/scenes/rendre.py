"""Les salles sans combat du donjon : photographie les fonds et fait la planche de contrôle.

    flock /tmp/brumeval-pw.lock python3 rendre.py                 -> tous les fonds (png/<id>.png) + la planche (planche.png)
    flock /tmp/brumeval-pw.lock python3 rendre.py puits galerie   -> seulement ces fonds (et la planche)
    flock /tmp/brumeval-pw.lock python3 rendre.py --planche       -> seulement la planche (avec les PNG déjà faits)
    flock /tmp/brumeval-pw.lock python3 rendre.py --fluidite [6]  -> mesure demo.html, processeur ralenti x6 (CDP), page mobile
                                                                     1024 x 768 à l'échelle 2 : >= 50 ips au repos, >= 40 pendant les actions
                                                                     (résultats : fluidite.json)

Les fonds : SCENES.fond(id) (scenes.js), 960 x 372, photographiés à 2x (1920 x 744), en PNG opaque.
Pour un poids raisonnable, l'image est réduite à une palette de 256 couleurs avec tramage (on ne voit pas la différence
sur ces fonds sombres) ; --exact garde toutes les couleurs.
La planche : chaque salle à 1x, avec trois silhouettes de héros à gauche et ses éléments posés (objets.js, au repos),
deux salles par ligne, légendées."""
import sys, os, json, base64
ICI = os.path.dirname(os.path.abspath(__file__))
PNG = os.path.join(ICI, 'png')
W, H, SOL = 960, 372, 340


def lire(p):
    with open(p, encoding='utf-8') as f:
        return f.read()


def compresser(f, exact=False):
    from PIL import Image
    im = Image.open(f).convert('RGB')
    if not exact:
        im = im.quantize(colors=256, method=Image.Quantize.MEDIANCUT, dither=Image.Dither.FLOYDSTEINBERG)
    im.save(f, 'PNG', optimize=True)


def fonds(pg, ids, exact):
    os.makedirs(PNG, exist_ok=True)
    for i in ids:
        svg = pg.evaluate('(id) => SCENES.fond(id)', i)
        if not svg:
            print('  (pas de fond pour', i, ')')
            continue
        pg.evaluate("(s) => { var c = document.getElementById('c'); c.innerHTML = s; }", svg)
        pg.wait_for_timeout(200)
        f = os.path.join(PNG, i + '.png')
        pg.screenshot(path=f, clip={'x': 0, 'y': 0, 'width': W, 'height': H})
        compresser(f, exact)
        print('  %-14s %4d Ko' % (i, os.path.getsize(f) // 1024), flush=True)


def silhouettes():
    """Trois silhouettes de héros (sombres, bordées de leur couleur), tirées des images du prototype si elles existent."""
    from PIL import Image, ImageFilter, ImageChops
    src = os.path.join(os.path.dirname(ICI), 'essai', 'img')
    out = {}
    for r, coul in [('sage', (108, 182, 255)), ('alchimiste', (180, 140, 255)), ('pisteur', (95, 207, 134))]:
        p = os.path.join(src, 'heros-' + r + '.png')
        if not os.path.exists(p):
            continue
        a = Image.open(p).convert('RGBA').split()[3]
        bord = ImageChops.subtract(a.filter(ImageFilter.MaxFilter(5)), a)
        im = Image.new('RGBA', a.size, (12, 8, 20, 0))
        im.putalpha(a.point(lambda v: int(v * 0.92)))
        b = Image.new('RGBA', a.size, coul + (0,))
        b.putalpha(bord.point(lambda v: int(v * 0.7)))
        im = Image.alpha_composite(im, b)
        f = os.path.join(ICI, '.sil-' + r + '.png')
        im.save(f)
        out[r] = 'data:image/png;base64,' + base64.b64encode(open(f, 'rb').read()).decode()
        os.remove(f)
    return out


def planche(pg, ids):
    sil = silhouettes()
    pg.set_viewport_size({'width': 1960, 'height': 1000})
    js = lire(os.path.join(ICI, 'objets.js')) if os.path.exists(os.path.join(ICI, 'objets.js')) else ''
    html = ['<style>body{margin:0;background:#0b0810;font-family:sans-serif}#p{display:grid;grid-template-columns:960px 960px;gap:28px 24px;padding:20px 8px}'
            '.s{position:relative;width:960px;height:372px;overflow:hidden;background:#000}.s>img.f{position:absolute;left:0;top:0;width:960px;height:372px}'
            '.t{color:#ffe3a3;font:20px Georgia,serif;margin:0 0 6px 4px}.h{position:absolute;top:64px;width:280px;height:320px}</style><div id="p">']
    for i in ids:
        f = os.path.join(PNG, i + '.png')
        u = 'data:image/png;base64,' + base64.b64encode(open(f, 'rb').read()).decode() if os.path.exists(f) else ''
        html.append('<div><div class="t">' + i + '</div><div class="s" id="s-' + i + '"><img class="f" src="' + u + '">' +
                    ''.join('<img class="h" style="left:%dpx" src="%s">' % (x - 40, sil[r]) for r, x in [('sage', 0), ('alchimiste', 138), ('pisteur', 276)] if r in sil) +
                    '</div></div>')
    html.append('</div>')
    pg.set_content('<!doctype html><meta charset="utf-8">' + ''.join(html))
    pg.add_script_tag(content=lire(os.path.join(ICI, 'scenes.js')))
    if js:
        pg.add_script_tag(content=js)
        pg.evaluate("""(ids) => ids.forEach(id => { var s = SCENES.salle(id); if(!s) return; var c = document.getElementById('s-' + id);
            (s.elements || []).forEach(e => { e.fond = c.querySelector('img.f').src; try { var o = OBJETS.creer(c, e, {planche: true});
              /* la planche montre les états à vérifier : coffre ouvert, crâne révélé, sarcophage ouvert, un rond jaune par salle */
              if(e.type === 'choix' && e.ferme) o.ouvrir(); if(e.type === 'crane') o.etat(true); if(e.type === 'sarcophage') o.ouvrir();
              if(!window['g' + id] && ['objet', 'tas', 'porte', 'dalle', 'chat', 'leo'].indexOf(e.type) >= 0){ o.guider(true); window['g' + id] = 1; }
            } catch(err) { console.error(id, e.id, err); } }); })""", ids)
    pg.wait_for_timeout(3500)
    h = pg.evaluate("document.getElementById('p').scrollHeight")
    pg.set_viewport_size({'width': 1960, 'height': h + 40})
    pg.wait_for_timeout(400)
    f = os.path.join(ICI, 'planche.png')
    pg.screenshot(path=f, full_page=True)
    from PIL import Image
    Image.open(f).convert('RGB').quantize(colors=256, dither=Image.Dither.FLOYDSTEINBERG).save(f, optimize=True)
    print('planche.png :', os.path.getsize(f) // 1024, 'Ko')


MESURE = """(ms) => new Promise(ok => { var t = [], d = performance.now(); function f(x){ t.push(x); if(x - d < ms) requestAnimationFrame(f); else {
  var dt = []; for(var i = 1; i < t.length; i++) dt.push(t[i] - t[i-1]); dt.sort((a,b)=>a-b);
  ok({ips: Math.round((t.length - 1) / ((t[t.length-1] - t[0]) / 1000)), pire: Math.round(dt[dt.length-1]), lentes: dt.filter(x => x > 34).length}); } } requestAnimationFrame(f); })"""
# chaque salle : (action à mesurer (index dans demo.html), durée mesurée en ms) ; None = seulement le repos
PLAN = [('puits', None, 0), ('galerie', 0, 1600), ('aeration', 0, 2600), ('reserve', 0, 2600), ('givre', 0, 1600), ('bibliotheque', 1, 1600),
        ('eboulis', 0, 3000), ('dalles', 1, 2000), ('portes', 0, 2200), ('crypte-sarco', 0, 3000), ('camp', 0, 1400), ('porte4', 0, 3000), ('leo', 0, 2200), ('leo', 1, 2400)]


def fluidite(p, ralenti):
    b = p.chromium.launch()
    pg = b.new_page(viewport={'width': 1024, 'height': 768}, has_touch=True, is_mobile=True, device_scale_factor=2)
    errs = []
    pg.on('pageerror', lambda e: errs.append(str(e)))
    pg.on('console', lambda m: errs.append(m.text) if m.type == 'error' else None)
    pg.goto('file://' + os.path.join(ICI, 'demo.html'))
    pg.wait_for_timeout(2500)
    cdp = pg.context.new_cdp_session(pg)
    cdp.send('Emulation.setCPUThrottlingRate', {'rate': ralenti})
    res, vu = [], set()
    for sid, act, ms in PLAN:
        pg.evaluate('(id) => DEMO.montrer(id)', sid)
        pg.wait_for_timeout(1500)
        if sid not in vu:
            vu.add(sid)
            r = pg.evaluate(MESURE, 3000)
            r.update(nom=sid + ' : au repos', objectif=50)
            res.append(r)
            print('CPU x%d  %-34s %3d ips   pire image %4d ms   images > 34 ms : %3d   %s' % (ralenti, r['nom'], r['ips'], r['pire'], r['lentes'], 'ok' if r['ips'] >= 50 else 'TROP LENT'), flush=True)
        if act is None:
            continue
        pg.evaluate("([id, n]) => { window.__ok = false; DEMO.action(id, n).then(() => { window.__ok = true; }, (e) => { console.error(e && e.stack || e); window.__ok = true; }); }", [sid, act])
        r = pg.evaluate(MESURE, ms)
        pg.wait_for_function('window.__ok', timeout=90000)
        nom = pg.evaluate('([id, n]) => document.querySelectorAll("#s-" + id + " .boutons button")[n].textContent', [sid, act])
        r.update(nom=sid + ' : ' + nom, objectif=40)
        res.append(r)
        print('CPU x%d  %-34s %3d ips   pire image %4d ms   images > 34 ms : %3d   %s' % (ralenti, r['nom'][:34], r['ips'], r['pire'], r['lentes'], 'ok' if r['ips'] >= 40 else 'TROP LENT'), flush=True)
        pg.evaluate('(id) => DEMO.refaire(id)', sid)
    b.close()
    print('erreurs :', errs or 'aucune')
    json.dump({'ralenti': ralenti, 'page': '1024 x 768, mobile, echelle 2', 'mesures': res, 'erreurs': errs}, open(os.path.join(ICI, 'fluidite.json'), 'w'), ensure_ascii=False, indent=1)


# des instants d'animation à photographier (vérification) : (salle, action, [moments en ms])
INSTANTS = [('galerie', 0, [300, 700]), ('reserve', 0, [700, 1500, 2400]), ('eboulis', 0, [500, 1300, 2200]), ('eboulis', 1, [800]), ('eboulis', 3, [900, 2200]), ('dalles', 1, [550, 900]),
            ('portes', 1, [700, 1400]), ('crypte-sarco', 0, [1500, 2600]), ('porte4', 0, [400, 1800, 2600]), ('leo', 0, [800]), ('leo', 1, [1000]), ('camp', 0, [300])]


def instants(p, dossier):
    os.makedirs(dossier, exist_ok=True)
    b = p.chromium.launch()
    pg = b.new_page(viewport={'width': 1024, 'height': 768}, device_scale_factor=1)
    errs = []
    pg.on('pageerror', lambda e: errs.append(str(e)))
    pg.on('console', lambda m: errs.append(m.text) if m.type == 'error' else None)
    pg.goto('file://' + os.path.join(ICI, 'demo.html'))
    pg.wait_for_timeout(1500)
    for sid, act, moments in INSTANTS:
        pg.evaluate('(id) => { DEMO.montrer(id); DEMO.refaire(id); }', sid)
        pg.wait_for_timeout(800)
        t = 0
        pg.evaluate('([id, n]) => { DEMO.action(id, n); }', [sid, act])
        for m in moments:
            pg.wait_for_timeout(m - t)
            t = m
            box = pg.evaluate('(id) => { var r = DEMO.salles[id].cadre.getBoundingClientRect(); return [r.left, r.top, r.width, r.height]; }', sid)
            pg.screenshot(path=os.path.join(dossier, '%s-%d-%04d.png' % (sid, act, m)), clip={'x': box[0], 'y': box[1], 'width': box[2], 'height': box[3]})
        pg.wait_for_timeout(1500)
    b.close()
    print('instants :', dossier, 'erreurs :', errs or 'aucune')


def main():
    from playwright.sync_api import sync_playwright
    args = [a for a in sys.argv[1:] if not a.startswith('--')]
    exact = '--exact' in sys.argv
    with sync_playwright() as p:
        if '--instants' in sys.argv:
            instants(p, args[0])
            return
        if '--fluidite' in sys.argv:
            fluidite(p, int(args[0]) if args else 6)
            return
        b = p.chromium.launch()
        pg = b.new_page(viewport={'width': W, 'height': H}, device_scale_factor=2)
        errs = []
        pg.on('pageerror', lambda e: errs.append(str(e)))
        pg.on('console', lambda m: errs.append(m.text) if m.type == 'error' else None)
        pg.set_content('<!doctype html><meta charset="utf-8"><style>html,body{margin:0;background:#000}#c{position:absolute;left:0;top:0;width:960px;height:372px;overflow:hidden}#c svg{display:block}</style><div id="c"></div>')
        pg.add_script_tag(content=lire(os.path.join(ICI, 'scenes.js')))
        ids = pg.evaluate('SCENES.ordre')
        if '--planche' not in sys.argv:
            print('Fonds :')
            fonds(pg, args or ids, exact)
        if '--sans-planche' not in sys.argv:
            pg2 = b.new_page(viewport={'width': 1960, 'height': 1000}, device_scale_factor=1)
            pg2.on('pageerror', lambda e: errs.append(str(e)))
            pg2.on('console', lambda m: errs.append(m.text) if m.type == 'error' else None)
            planche(pg2, ids)
        b.close()
    print('erreurs :', errs or 'aucune')


if __name__ == '__main__':
    main()
