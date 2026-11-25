# petit outil : remplacements exacts dans un fichier (chaque « avant » doit exister une seule fois)
import sys
def rustine(chemin, paires):
    s = open(chemin, encoding='utf8').read()
    for i, (a, b) in enumerate(paires):
        n = s.count(a)
        if n != 1:
            raise SystemExit(f"{chemin} : rustine {i} trouvée {n} fois : {a[:90]!r}")
        s = s.replace(a, b)
    open(chemin, 'w', encoding='utf8').write(s)
    print(chemin, ':', len(paires), 'rustines')
