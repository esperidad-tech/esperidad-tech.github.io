# Version 29 : la musique (v29/musique.py) ; dans la page, seulement le titre et la ligne de mesures. Travaille sur « html », après build28_part.py.
def rep(a, b, n=1):
    global html
    assert html.count(a) == n, (a[:80], html.count(a)); html = html.replace(a, b)
rep("Maquette n° 28 : un jeu de runes,", "Maquette n° 29 (la musique : la mélodie seulement au refrain, le reste plus discret) : un jeu de runes,")
rep("Mesures (version 28)", "Mesures (version 29)")
