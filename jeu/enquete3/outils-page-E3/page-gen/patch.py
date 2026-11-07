"""Applique la journée complète (trame, après-midi, nuit) à la page des dialogues du Barde."""
import sys
P, DATA = sys.argv[1], sys.argv[2]
s = open(P, encoding='utf-8').read()
data = open(DATA, encoding='utf-8').read()

def rep(old, new, n=1):
    global s
    c = s.count(old)
    if c != n:
        raise SystemExit(f'ATTENDU {n}, TROUVÉ {c} : {old[:80]!r}')
    s = s.replace(old, new)

# Titre
rep('<title>Dialogues du matin de Brumeval</title>', '<title>Dialogues du Barde</title>')

# CSS
rep('#p-aprem .ecoute{display:none}\n', '')
rep('.chip.exige{display:none}', '''.md{display:flex; flex-direction:column; gap:8px}
.md p, .md li{margin:0; font-size:.95rem; line-height:1.5}
.md ul, .md ol{margin:0; padding-left:20px; display:flex; flex-direction:column; gap:4px}
.md ul.choix{padding-left:0}
.md h3{font-family:var(--display); font-size:1.15rem; margin:10px 0 0}
.ecoute .apporte{color:var(--muted); font-size:.9rem}
.alt{margin-top:8px; padding:8px 10px; border-left:3px solid var(--gold); background:var(--surface-2); border-radius:0 8px 8px 0; display:flex; flex-direction:column; gap:4px}
.alt p{margin:0}
.chip.exige{display:none}''')

# Onglets
rep('''    <button type="button" role="tab" id="o-matin" data-p="matin" aria-selected="true">Matin</button>
    <button type="button" role="tab" id="o-aprem" data-p="aprem" aria-selected="false">Après-midi</button>''',
'''    <button type="button" role="tab" id="o-trame" data-p="trame" aria-selected="false">La trame</button>
    <button type="button" role="tab" id="o-matin" data-p="matin" aria-selected="true">Matin</button>
    <button type="button" role="tab" id="o-aprem" data-p="aprem" aria-selected="false">Après-midi</button>
    <button type="button" role="tab" id="o-nuit" data-p="nuit" aria-selected="false">Nuit</button>''')
rep('''  <div id="p-matin" class="page" role="tabpanel"></div>
  <div id="p-aprem" class="page" role="tabpanel" hidden></div>''',
'''  <div id="p-trame" class="page" role="tabpanel" hidden></div>
  <div id="p-matin" class="page" role="tabpanel"></div>
  <div id="p-aprem" class="page" role="tabpanel" hidden></div>
  <div id="p-nuit" class="page" role="tabpanel" hidden></div>''')
rep("const ONGLETS = ['matin', 'aprem', 'suite', 'barde'];", "const ONGLETS = ['trame', 'matin', 'aprem', 'nuit', 'suite', 'barde'];")

# Rubans : Mélusine passe l'après-midi, Anselme la nuit
rep('R(`nuit, Mélusine`)', 'R(`après-midi, Mélusine`)', 5)
rep('R(`après-midi, Anselme`)', 'R(`nuit, Anselme`)', 3)
rep('[`Anselme (après-midi)`', '[`Anselme (nuit)`', 3)
rep('[`Mélusine (nuit)`', '[`Mélusine (après-midi)`', 3)

# Textes du matin devenus faux
rep('annonce une grande fête ce soir sur la place', 'annonce une grande fête cette nuit sur la place, jusqu\'à minuit')
rep("Les missions restent ouvertes jusqu'au soir : on les fait quand on veut.", "Les missions restent ouvertes jusqu'à la fin de l'après-midi, où on les rend au maire : on les fait quand on veut.")
rep('<li>Le soir, au début de la fête, le maire compte les bouquets devant tout le monde (« Voici', "<li>L'après-midi, quand le Barde rend sa mission, le maire compte les bouquets (« Voici")
rep('Le soir, au début de la fête : le maire compte les bouquets</h2>', "L'après-midi, le Barde rend sa mission : le maire compte les bouquets</h2>")
rep("Le matin, le Barde a deux mini-jeux et donne cinq codes à l'équipe.",
    "Depuis le 6 novembre, le grand dialogue du maire, la maison d'Odette et les codes de la lettre, du carnet et des traces de Moustache passent l'après-midi (onglet Après-midi). Le matin, il reste Repérer le mensonge et les codes de Victor et de Tim.")
rep("'Deux mini-jeux, la maison d\\'Odette, cinq codes à donner'", "'Repérer le mensonge, et ce qui passe l\\'après-midi'")
rep("[`Mélusine ment deux fois dès le matin :`, `c'est voulu. Je propose que le grand dialogue de la nuit, pendant la fête, soit avec elle : lui faire dire qui lui a dicté la lettre. Ses deux mensonges du matin préparent ce moment. Si le Barde la démasque dès le matin, elle avoue l'or reçu, mais pas le nom : la nuit garde ce secret.`]",
    "[`✓ Mélusine :`, `elle avoue l'après-midi, quand le Barde lui présente le code de l'écriture trouvé par l'Alchimiste. La nuit, les grands dialogues sont ceux d'Anselme et de Léo.`]")
rep("la nuit, à décider avec les dialogues de la nuit.</li>", "la nuit, <b>Anselme</b> (le grand dialogue de la clé de la crypte).</li>")
rep("La nuit, une fois par enquête : un gros indice, à écrire avec la nuit.</li>", "La nuit, une fois par enquête : chez le voisin d'Odette, qui a vu Léo reprendre la canne, puis l'homme en cape entrer dans la mairie « comme chez lui » (onglet Nuit).</li>")

# Écoutes : une liste par moment ; la question de remplacement (Mélusine)
rep('''function ecoute(nom){
  const e = ECOUTES.find(x => x.qui.includes(nom)); if(!e) return '';''',
'''function ecoute(nom){ return ecouteDe(ECOUTES, nom); }
function ecouteA(nom){ return ecouteDe(ECOUTES_A, nom); }
function ecouteDe(liste, nom){
  const e = liste.find(x => x.qui.includes(nom)); if(!e) return '';''')
rep('''<span class="tags">${e.t.map(chip).join('')}</span></div>`;
}''', '''${e.a ? `<p class="apporte">→ ${esc(e.a)}</p>` : ''}<span class="tags">${e.t.map(chip).join('')}</span></div>`;
}''')
rep('''    : `<p>${esc(x.r)}</p>`;''', '''    : `<p>${esc(x.r)}</p>`;
  const alt = x.alt ? `<div class="alt"><span class="etiq">${esc(x.alt.cond)} :</span><p><b>« ${esc(x.alt.q)} »</b></p><span class="tags">${x.alt.t.map(chip).join('')}</span>${x.alt.v ? `<span class="etiq ment">Il ment</span><p>${esc(x.alt.r)}</p><span class="etiq vrai">Démasqué</span><p>${esc(x.alt.v)}</p>` : `<p>${esc(x.alt.r)}</p>`}</div>` : '';''')
rep('''</summary><div class="rep">${rep}</div></details>`;''', '''</summary><div class="rep">${rep}${alt}</div></details>`;''')
rep('''function perso(p){''', '''function perso(p, src){''')
rep('''<p class="signe">${esc(p.signe)}</p>${ecoute(p.nom)}''', '''<p class="signe">${esc(p.signe)}</p>${(typeof src === 'function' ? src : ecoute)(p.nom)}''')

# 6 novembre, 1 h 15 : Iris occupée l'après-midi aussi ; ses racines du Chêne disparaissent des fils
rep("elles fanent ! Reviens cet après-midi. »`", "elles fanent ! »`")
rep("pour le maire. Cet après-midi, d'accord ? »", "pour le maire. Et après, les couronnes de ce soir ! »")
rep("Iris, Margot, Basile, Victor", "Margot, Basile, Victor")
rep("Les racines du chêne, la porte au fond du puits", "La porte au fond du puits")
# Une écoute d'une seule personne, dehors (Victor devant le puits)
rep("`👂 Derrière la porte, ${e.lieu}`;", "(e.lieu.startsWith('tout seul') ? `👂 Tu entends ${e.qui[0]}, ${e.lieu}` : `👂 Derrière la porte, ${e.lieu}`);")

# Données générées, juste avant les fonctions
rep("const esc = (s) =>", data + "\nconst esc = (s) =>")

# Le matin : le grand dialogue du maire part l'après-midi
rep('''  <h2 class="groupe">Le grand dialogue du matin</h2>
  <div class="liste">${tiroir('Le maire', 'La mairie · la lettre d\\'Odette, en 3 étapes', maire)}</div>
''', '')

# L'après-midi
i = s.index("document.getElementById('p-aprem').innerHTML = `")
j = s.index('`;', i) + 2
s = s[:i] + '''document.getElementById('p-aprem').innerHTML = `
  <div class="md">${APREM_HTML.intro}</div>
  <h2 class="groupe">Le grand dialogue de l'après-midi</h2>
  <div class="liste">${tiroir('Le maire', 'La mairie · il compte les fleurs, puis la lettre d\\'Odette en 3 étapes', `<div class="md">${APREM_HTML.maire}</div>` + maire.replace(ecoute('Le maire'), ecouteA('Le maire')))}${tiroir('La maison d\\'Odette', '2, rue des Lanternes · la canne, le carnet, Moustache', `<div class="md">${APREM_HTML.maison}</div>`)}</div>
  <h2 class="groupe">Les villageois de l'après-midi</h2>
  <p class="groupe-intro">Presque partout, on sent que tout va se jouer cette nuit, à minuit, quand la Grosse Marie sonnera.</p>
  <div class="liste">${APREM.map(p => perso(p, ecouteA)).join('')}</div>
  <h2 class="groupe">Occupés l'après-midi</h2>
  <div class="liste">${tiroir('Gaspard, Victor, Iris, le voisin', 'Une petite phrase, pas de questions · et deux écoutes', `<div class="md">${APREM_HTML.occupes}</div>` + ECOUTES_A.filter(e => e.qui.includes('Victor') || (e.qui.includes('Gaspard') && e.qui.includes('Le maire'))).map(e => ecouteDe([e], e.qui[0])).join(''))}</div>
  <h2 class="groupe">Les codes et les rubans</h2>
  <div class="liste">${tiroir('Les codes du Barde, l\\'après-midi', 'La lettre, le carnet, les traces, l\\'écriture, l\\'aveu', `<div class="md">${APREM_HTML.codes}</div>`)}${tiroir('Les rubans posés pour la nuit', 'Les indices des grands dialogues d\\'Anselme et de Léo', `<div class="md">${APREM_HTML.rubans}</div>`)}</div>`;

const SOUS_NUIT = {'La fête': 'Une ou deux répliques par villageois, pour l\\'ambiance'};
document.getElementById('p-nuit').innerHTML = `
  <div class="md">${NUIT_HTML[0][1]}</div>
  <div class="liste">${NUIT_HTML.slice(1).map(([t, h]) => { const m = t.match(/^(.*?)(?: \\((.*)\\))?$/); return tiroir(esc(m[1]), esc(m[2] || SOUS_NUIT[m[1]] || ''), `<div class="md">${h}</div>`); }).join('')}</div>`;

document.getElementById('p-trame').innerHTML = `<div class="md">${TRAME_HTML}</div>`;''' + s[j:]

open(P, 'w', encoding='utf-8').write(s)
print('ok', len(s))
