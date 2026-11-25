# --- version 17 (25 novembre) : le Sage n'a plus que deux amis à protéger, le Barde et l'Alchimiste ; le Pisteur est enlevé ---
# (lancé par exec après build16_part.py : « html » et « rep » existent déjà)
i0 = html.index("<p>Maquette n° 16 :"); i1 = html.index("</p>", i0)
html = html[:i0] + "<p>Maquette n° 17 : le Sage n’a plus que deux amis à protéger, le Barde et l’Alchimiste (le Pisteur n’est plus dans ce combat). Deux codes font gagner. Le reste ne change pas : la grande salle de Grosbec vue de haut, Grosbec dans son armure, ses golems, les runes, les 10 combos, les sons. Le bouton 🎚️ règle le volume ; au clavier, Entrée ou Espace pour graver, 1, 2, 3 pour choisir une carte." + html[i1:]
rep("<b>Les amis venus t’aider :</b> le Pisteur tire des salves de flèches et saute à la dague sur le golem qui s’approche trop. L’Alchimiste lance", "<b>L’ami venu t’aider</b> (le premier des deux qui gagne son combat) : l’Alchimiste lance")
rep("Tes trois amis attaquent Grosbec, chacun sur sa tablette.", "Tes deux amis, le Barde et l’Alchimiste, attaquent Grosbec, chacun sur sa tablette.")
# l'image de l'explication « 4. Les codes » : c'était le Pisteur et son code ; c'est le Barde et le sien
rep("""<circle cx="54" cy="56" r="22" fill="#43a85a" stroke="#ffd23f" stroke-width="4"/><text x="54" y="64" text-anchor="middle" font-size="22" font-family="Fredoka,sans-serif" fill="#fff">P</text>""",
    """<circle cx="54" cy="56" r="22" fill="#e8833a" stroke="#ffd23f" stroke-width="4"/><text x="54" y="64" text-anchor="middle" font-size="22" font-family="Fredoka,sans-serif" fill="#fff">B</text>""")
rep("""<text x="160" y="64" text-anchor="middle" font-size="22">🔥🌙⭐</text>""", """<text x="160" y="64" text-anchor="middle" font-size="22">🔑💧🍃</text>""")
rep("tape-le, il vient t’aider avec son pouvoir. Les trois codes : c’est gagné.", "tape-le, il vient t’aider avec son pouvoir. Les deux codes : c’est gagné.")
# la jauge des amis vainqueurs : autant de traits que d'amis
rep("`Amis vainqueurs : ${s.entered.length} sur 3`", "`Amis vainqueurs : ${s.entered.length} sur ${G.ORDER.length}`")
rep("  const sw = (pw - 28) / 3;", "  const sw = (pw - 20 - 4 * (G.ORDER.length - 1)) / G.ORDER.length;")
rep("{ codeTimes: [10, 18, 26] }", "{ codeTimes: [10, 20] }")
rep("(win ? `Tes trois amis ont gagné, et tu les as protégés pendant", "(win ? `Tes deux amis ont gagné, et tu les as protégés pendant")
rep("`Mesures (version 16) :", "`Mesures (version 17) :")
