"""Réunit la page du Barde et la page des trois autres rôles en une seule page, avec un onglet Barde."""
import re, sys
BARDE, ROLES, OUT = sys.argv[1], sys.argv[2], sys.argv[3]
b = open(BARDE, encoding='utf-8').read()
r = open(ROLES, encoding='utf-8').read()

def entre(s, a, z, depuis=0):
    i = s.index(a, depuis) + len(a); j = s.index(z, i); return s[i:j]

# ---------- La page du Barde : son style, son corps, son script ----------
b_css = entre(b, '<style>', '</style>')
b_corps = entre(b, '<div class="page">', '\n</div>\n\n<script>')
b_js = entre(b, '<script>', '</script>')

# Le corps : on enlève l'en-tête et les boutons (la page commune les a), on renomme les identifiants
b_corps = re.sub(r'\s*<header>.*?</header>', '', b_corps, flags=re.S)
b_corps = re.sub(r'\s*<div class="outils">.*?</div>', '', b_corps, count=1, flags=re.S)
b_corps = b_corps.replace('id="p-', 'id="bp-').replace('id="o-', 'id="bo-')
b_corps = b_corps.replace('<div class="onglets" role="tablist">', '<div class="onglets sous" id="barde-onglets" role="tablist">')

# Le script : identifiants renommés, onglets limités au Barde, boutons « Tout ouvrir » retirés, tout dans sa propre portée
b_js = b_js.replace("getElementById('p-", "getElementById('bp-").replace("getElementById('o-", "getElementById('bo-")
b_js = b_js.replace("'p-' + k", "'bp-' + k").replace("'o-' + k", "'bo-' + k")
assert b_js.count("document.querySelectorAll('.onglets button')") == 1
b_js = b_js.replace("document.querySelectorAll('.onglets button')", "document.querySelectorAll('#barde-onglets button')")
b_js = re.sub(r"\nconst tous = \(\) => .*?\n", "\n", b_js)
b_js = re.sub(r"\ndocument\.getElementById\('tout-ouvrir'\).*?\n", "\n", b_js)
b_js = re.sub(r"\ndocument\.getElementById\('tout-fermer'\).*?\n", "\n", b_js)
assert 'tout-ouvrir' not in b_js and "'p-" not in b_js
b_js = '(function(){\n' + b_js + '\n})();\n'

# ---------- La page des rôles : on ajoute l'onglet Barde ----------
r_css = entre(r, '<style>', '</style>')
# Les règles propres à la page des rôles (tout ce qui n'existe pas déjà dans le style du Barde)
extra = entre(r_css, '.r-pisteur{', '@media (prefers-reduced-motion')
extra = '.r-pisteur{' + extra
css = b_css.rstrip() + '\n/* ---- Les trois autres rôles ---- */\n:root{--violet:#6a4c9c; --violet-bg:#efeaf7}\n' \
  '@media (prefers-color-scheme: dark){ :root:not([data-theme="light"]){ --violet:#c3a8ee; --violet-bg:#2c2340 }}\n' \
  ':root[data-theme="dark"]{ --violet:#c3a8ee; --violet-bg:#2c2340 }\n' + extra + \
  '[hidden]{display:none!important}\n.onglets button{flex:none}\n.onglets.sous button{font-size:1rem; padding:8px 12px}\n.bloc-barde{display:flex; flex-direction:column; gap:20px}\n' \
  'button:focus-visible{outline:2px solid var(--gold); outline-offset:2px}\n@media (prefers-reduced-motion: reduce){ .fleche{transition:none} }\n'

page = r
page = page.replace(entre(r, '<style>', '</style>'), '\n' + css)
page = page.replace('<title>Pisteur, Alchimiste, Sage</title>', '<title>La lettre d\'Odette</title>')
page = page.replace('<h1>Enquête 3 · le Pisteur, l\'Alchimiste et le Sage</h1>', '<h1>Enquête 3 · La lettre d\'Odette</h1>')
page = page.replace('<p>La journée des trois autres rôles, du matin à la nuit. Touche une action pour l\'ouvrir. Les schémas montrent qui donne quel code à qui.</p>',
                    '<p>Toute l\'enquête, pour les quatre rôles, du matin à la nuit. Touche un tiroir pour l\'ouvrir. Les schémas montrent qui donne quel code à qui.</p>')
page = page.replace('<div class="onglets" role="tablist">', '<div class="onglets" id="onglets-roles" role="tablist">', 1)
page = page.replace('''    <button type="button" role="tab" id="o-sage" data-p="sage" aria-selected="false">Sage</button>''',
'''    <button type="button" role="tab" id="o-sage" data-p="sage" aria-selected="false">Sage</button>
    <button type="button" role="tab" id="o-barde" data-p="barde" aria-selected="false">Barde</button>''')
page = page.replace('''  <div id="p-sage" class="page" role="tabpanel" hidden></div>''',
'''  <div id="p-sage" class="page" role="tabpanel" hidden></div>
  <div id="p-barde" class="page bloc-barde" role="tabpanel" hidden>''' + b_corps + '''
  </div>''')
page = page.replace("const ONGLETS = ['ensemble', 'pisteur', 'alchimiste', 'sage'];", "const ONGLETS = ['ensemble', 'pisteur', 'alchimiste', 'sage', 'barde'];")
assert page.count("document.querySelectorAll('.onglets button')") == 1
page = page.replace("document.querySelectorAll('.onglets button')", "document.querySelectorAll('#onglets-roles button')")
# Le script du Barde, avant celui des rôles
page = page.replace('<script>\nconst ROLES', '<script>\n' + b_js + '</script>\n<script>\nconst ROLES', 1)
open(OUT, 'w', encoding='utf-8').write(page)
print('ok', len(page))
