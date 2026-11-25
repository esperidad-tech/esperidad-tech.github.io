# --- version 18 (25 novembre) : l'encre plus rare, le bâton plus fort (plus vite, l'orbe traverse deux golems), les pages plus fréquentes ---
# (lancé par exec après build17_part.py : « html » et « rep » existent déjà)
i0 = html.index("<p>Maquette n° 17 :"); i1 = html.index("</p>", i0)
html = html[:i0] + "<p>Maquette n° 18 : l’encre est plus rare (garde tes runes pour les gros groupes), le bâton tire plus vite et son orbe traverse deux golems (place-toi bien), les pages du grimoire tombent plus souvent. Toujours deux amis à protéger, le Barde et l’Alchimiste ; deux codes font gagner. Le bouton 🎚️ règle le volume ; au clavier, Entrée ou Espace pour graver, 1, 2, 3 pour choisir une carte." + html[i1:]
rep("Garde le doigt sur l’arène : le Sage y court. Son bâton tire tout seul. Son corps arrête les braises des frondeurs. Les gros golems lâchent des pages dorées : touche-les pour choisir un pouvoir.",
    "Garde le doigt sur l’arène : le Sage y court. Son bâton tire tout seul sur le golem le plus proche, et son orbe en traverse deux : place-toi dans l’axe de la file. Son corps arrête les braises des frondeurs. Les gros golems lâchent des pages dorées : passe dessus pour choisir un pouvoir.")
rep("<p>Le bouton jaune ralentit le temps. Un trait, un V, un escargot ou un arc de cercle.</p>", "<p>Le bouton jaune ralentit le temps. Un trait, un V, un escargot ou un arc de cercle. L’encre est rare : garde-la pour les gros groupes.</p>")
rep("""    <p class="note"><b>Les chocs :</b>""", """    <p class="note"><b>L’encre est rare :</b> un petit golem sur huit lâche un éclat d’encre ; un bélier ou un colosse en lâche toujours un. Une rune qui détruit trois golems ou plus rend de l’encre : grave quand ils sont nombreux. Entre deux vagues, c’est le bâton et ta place qui comptent.</p>
    <p class="note"><b>Les chocs :</b>""")
rep("la première au premier gros détruit, puis au bout de 2, 4, 5, 7, 8… gros.", "la première au premier gros détruit, puis au bout de 2, 3, 4, 5… gros.")
rep("`Mesures (version 17) :", "`Mesures (version 18) :")
