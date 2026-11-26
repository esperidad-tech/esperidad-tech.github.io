import pathlib, re
from playwright.sync_api import sync_playwright
s = open('chansons.py').read()
html = s[s.index('html = '):s.index('with sync_playwright')]
exec(html.replace('html = ', 'HTML = ', 1), globals()) if False else None
src = pathlib.Path(__file__).resolve().parent.parent / 'src'
code = (src / 'son.js').read_text() + '\n' + (src / 'musique.js').read_text()
body = s[s.index('<script>" + code + r"""') + len('<script>" + code + r"""'):s.index('</script></body></html>"""')]
HTML = "<!DOCTYPE html><html><body><script>" + code + body + "</script></body></html>"
with sync_playwright() as p:
    nav = p.chromium.launch(executable_path='/usr/bin/google-chrome')
    pg = nav.new_page(); err = []; pg.on('pageerror', lambda e: err.append(str(e)))
    pg.set_content(HTML)
    for args in ['3, 8, false', '3, 16, false', '3, 31, false', '3, 8, false']:
        r = pg.evaluate(f'rendre({args})'); print(args, r['parts'], r['pk'])
    print(err)
    nav.close()
