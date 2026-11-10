"""Assemble les pages autonomes du donjon (un seul fichier HTML chacune, rien à charger à part les polices) :

    python3 pages/assembler.py      (depuis jeu/donjon/)  ->  donjon-sage.html, donjon-alchimiste.html, carte-demo.html

Chaque page = modele.html + son corps (pages/<nom>-corps.html) + commun.css + <nom>.css
            + donjon-codes.js + carte.js + commun.js + ses scripts (dans cet ordre)."""
import os, re
PAGES = os.path.dirname(os.path.abspath(__file__))
DONJON = os.path.dirname(PAGES)


def lire(*p):
    with open(os.path.join(*p), encoding='utf-8') as f:
        return f.read()


SORTIES = {
    'donjon-sage.html': {'titre': 'Le plan du Sage', 'corps': 'sage-corps.html', 'css': ['commun.css', 'sage.css'],
                         'js': [('donjon-codes.js', DONJON), ('carte.js', DONJON), ('commun.js', PAGES), ('sage-plan.js', PAGES), ('sage.js', PAGES)]},
    'donjon-alchimiste.html': {'titre': 'Le chaudron de l’Alchimiste', 'corps': 'alchimiste-corps.html', 'css': ['commun.css', 'alchimiste.css'],
                               'js': [('donjon-codes.js', DONJON), ('carte.js', DONJON), ('commun.js', PAGES), ('alchimiste.js', PAGES)]},
    'carte-demo.html': {'titre': 'La carte du donjon', 'corps': 'demo-corps.html', 'css': ['commun.css', 'demo.css'],
                        'js': [('donjon-codes.js', DONJON), ('carte.js', DONJON), ('commun.js', PAGES), ('demo.js', PAGES)]},
}


def assembler(nom, o):
    m = lire(PAGES, 'modele.html')
    css = '\n'.join(lire(PAGES, c) for c in o['css'])
    js = '\n'.join('/* ===== ' + f + ' ===== */\n' + lire(d, f) for f, d in o['js'])
    # un </script> dans une chaîne fermerait la balise
    js = js.replace('</script', '<\\/script')
    m = m.replace('{TITRE}', o['titre']).replace('{CORPS}', lire(PAGES, o['corps'])).replace('/*CSS*/', css).replace('/*JS*/', js)
    with open(os.path.join(DONJON, nom), 'w', encoding='utf-8') as f:
        f.write(m)
    return len(m.encode('utf-8'))


if __name__ == '__main__':
    import sys
    quoi = [a for a in sys.argv[1:] if a.endswith('.html')] or list(SORTIES)
    for nom in quoi:
        if not all(os.path.exists(os.path.join(PAGES, c)) for c in SORTIES[nom]['css']) or not os.path.exists(os.path.join(PAGES, SORTIES[nom]['corps'])):
            print('(pas encore)', nom); continue
        print(nom, round(assembler(nom, SORTIES[nom]) / 1024), 'Ko')
