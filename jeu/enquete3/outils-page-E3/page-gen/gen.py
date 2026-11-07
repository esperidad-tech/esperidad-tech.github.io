"""Construit les données de la page « Dialogues du Barde » à partir de l'export markdown du document.
Sortie : page-gen/gen-data.js (constantes APREM, ECOUTES_A, APREM_HTML, NUIT_HTML, TRAME_HTML)."""
import json, re, sys, html
import markdown

SRC = sys.argv[1]
OUT = sys.argv[2]
md = open(SRC, encoding='utf-8').read()

def section(titre):
    """Le texte d'une section « ## titre » jusqu'à la suivante."""
    i = md.index('\n## ' + titre)
    j = md.find('\n## ', i + 5)
    return md[i + 1: j if j > 0 else len(md)]

def sous_sections(txt):
    """[(titre, corps)] pour chaque « ### » ; le texte avant le premier ### a le titre ''."""
    parts = re.split(r'^### (.*)$', txt, flags=re.M)
    out = [('', parts[0])]
    for k in range(1, len(parts), 2):
        out.append((parts[k].strip(), parts[k + 1]))
    return out

def rendre(m):
    h = markdown.markdown(m, extensions=['tables', 'sane_lists'])
    h = h.replace('<table>', '<div class="tab-wrap"><table>').replace('</table>', '</table></div>')
    return h

def choix(h):
    """Les listes de choix (« … → … ») deviennent ul.choix, comme le marchandage de Fortuné."""
    def ul(m):
        items = re.findall(r'<li>(.*?)</li>', m.group(1), flags=re.S)
        if not items or not all('→' in it for it in items):
            return m.group(0)
        lis = []
        for it in items:
            bon = it.strip().startswith('✅')
            it = it.strip().lstrip('✅').strip()
            t, rp = it.split('→', 1)
            lis.append(f'<li class="{"bon" if bon else ""}"><span class="t">{t.strip()}</span><span class="rp">→ {rp.strip()}</span></li>')
        return '<ul class="choix">' + ''.join(lis) + '</ul>'
    return re.sub(r'<ul>(.*?)</ul>', ul, h, flags=re.S)

# ---------- Étiquettes ----------
def tags(s):
    s = s.strip()
    out = []
    for m in re.finditer(r'Ruban \(([^)]*)\)|le leurre \(([^)]*)\)|le leurre|Ment|Enquête|Histoire', s):
        g = m.group(0)
        if g.startswith('Ruban'): out.append({'k': 'ruban', 'd': m.group(1)})
        elif g.startswith('le leurre'): out.append({'k': 'ruban', 'd': 'le leurre' + (' (' + m.group(2) + ')' if m.group(2) else '')})
        elif g == 'Ment': out.append({'k': 'ment'})
        elif g == 'Enquête': out.append({'k': 'enquete'})
        elif g == 'Histoire': out.append({'k': 'suite'})
    return out

def nettoie(t):
    return re.sub(r'\*\*', '', t).strip()

# ---------- L'après-midi : les villageois ----------
aprem = section("L'après-midi du Barde")
APREM, EXTRA = [], {}
for titre, corps in sous_sections(aprem):
    m = re.match(r'(.+?) — (.+?) \((.+)\)$', titre)
    if not m or not re.search(r'^1\. ', corps, re.M):
        continue
    nom, lieu, signe = m.group(1), m.group(2), m.group(3)
    signe = signe[0].upper() + signe[1:]
    if not signe.endswith('.'): signe += '.'
    qs = []
    cur = None
    for ligne in corps.splitlines():
        if not ligne.strip(): continue
        q = re.match(r'^\d+\. \*\*« (.+?) »\*\*(?: — (.*))?$', ligne)
        if q:
            qtxt, tg = q.group(1), q.group(2) or ''
            t = tags(tg)
            if tg and not t:  # « seulement s'il reste de l'argent au Barde »
                qtxt += ' (' + tg.strip() + ')'
            cur = {'q': qtxt, 't': t, 'r': ''}
            qs.append(cur); continue
        r3 = re.match(r'^ {5}- (.*)$', ligne)   # réponses de la question de remplacement (Mélusine)
        if r3 and cur and 'alt' in cur:
            txt = r3.group(1)
            if re.match(r'Démasqu', txt): cur['alt']['v'] = re.sub(r'^Démasqu[ée]+ : ', '', txt)
            else: cur['alt']['r'] = txt
            continue
        r = re.match(r'^ {3}- (.*)$', ligne)
        if r and cur:
            txt = r.group(1)
            alt = re.match(r'\*\*Avec (.+?)\*\* (.*?)\*\*« (.+?) »\*\* — (.*)$', txt)
            if alt:
                cur['alt'] = {'cond': nettoie('Avec ' + alt.group(1) + ' ' + alt.group(2)).rstrip(' :'), 'q': alt.group(3), 't': tags(alt.group(4)), 'r': ''}
                continue
            if re.match(r'Démasqu', txt): cur['v'] = re.sub(r'^Démasqu[ée]+ : ', '', txt)
            elif not cur['r']: cur['r'] = txt
            else: cur['r'] += ' ' + txt
    APREM.append({'nom': nom, 'lieu': lieu[0].upper() + lieu[1:], 'signe': signe, 'qs': qs})

def tableau(corps):
    lignes = [l for l in corps.splitlines() if l.startswith('|')]
    rows = [[c.strip() for c in l.strip().strip('|').split('|')] for l in lignes]
    return [r for r in rows[2:]]

sous = dict(sous_sections(aprem))
# Les écoutes de l'après-midi
ECOUTES_A = []
NOMS = {'le voisin': "Le voisin d'Odette", 'Le voisin': "Le voisin d'Odette", 'le maire': 'Le maire'}
for qui, ce, apporte in tableau(sous["Les écoutes de l'après-midi (Tendre l'oreille)"]):
    noms, lieu = qui.split(', ', 1)
    noms = [NOMS.get(n.strip(), n.strip()) for n in noms.split(' et ')]
    l = []
    for bout in ce.split(' / '):
        mm = re.match(r'(.+?) : (.*)$', bout.strip())
        l.append([mm.group(1), mm.group(2)] if mm else ['', bout])
    t = [{'k': 'ruban', 'd': 'nuit, Anselme'}] if 'coup de pouce' in apporte.lower() else ([{'k': 'rire'}] if apporte.startswith("L'ambiance") else [{'k': 'enquete'}])
    ECOUTES_A.append({'qui': noms, 'lieu': lieu, 't': t, 'l': l, 'a': apporte})

# Le reste de l'après-midi en HTML : le maire, la maison d'Odette, les codes, les rubans
intro_aprem = rendre(sous[''].split('\n', 1)[1])
maire_aprem = rendre(sous["Le maire — la mairie (il ne ment jamais)"])
maison_aprem = rendre(sous["La maison d'Odette (2, rue des Lanternes)"])
codes_aprem = rendre(sous["Les codes du Barde, l'après-midi"])
rubans_aprem = rendre(sous["Les rubans posés pour la nuit"])
occupes_aprem = rendre(re.sub(r"^  - ", "    - ", next(c for t, c in sous_sections(aprem) if t.startswith("Occupés l'après-midi")), flags=re.M))   # listes imbriquées : 4 espaces pour python-markdown

# ---------- La nuit ----------
nuit = section('La nuit du Barde')
NUIT = []
for titre, corps in sous_sections(nuit):
    if titre == '':
        NUIT.append(('', rendre(corps.split('\n', 1)[1])))
    else:
        NUIT.append((titre, choix(rendre(corps))))

# ---------- La trame ----------
trame = section("La trame de l'enquête 3 : qui fait quoi")
TRAME = rendre(trame.split('\n', 1)[1])

def js(nom, val):
    return f'const {nom} = {json.dumps(val, ensure_ascii=False)};\n'

with open(OUT, 'w', encoding='utf-8') as f:
    f.write('/* Généré par page-gen/gen.py à partir du document (export markdown). */\n')
    f.write(js('APREM', APREM))
    f.write(js('ECOUTES_A', ECOUTES_A))
    f.write(js('APREM_HTML', {'intro': intro_aprem, 'maire': maire_aprem, 'maison': maison_aprem, 'codes': codes_aprem, 'rubans': rubans_aprem, 'occupes': occupes_aprem}))
    f.write(js('NUIT_HTML', NUIT))
    f.write(js('TRAME_HTML', TRAME))
print(len(APREM), 'villageois l\'après-midi :', ', '.join(p['nom'] + ' (' + str(len(p['qs'])) + ')' for p in APREM))
print(len(ECOUTES_A), 'écoutes ;', len(NUIT), 'parties de nuit :', [t for t, _ in NUIT])
mel = [p for p in APREM if p['nom'] == 'Mélusine'][0]
print('Mélusine alt :', json.dumps(mel['qs'][0].get('alt', {}), ensure_ascii=False)[:300])
print('sans réponse :', [(p['nom'], q['q']) for p in APREM for q in p['qs'] if not q['r']])
