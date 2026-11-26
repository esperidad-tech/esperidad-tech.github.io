# Version 25 : la page (les textes : neuf builds, une carte = un build, plus rien n'attaque tout seul). Travaille sur « html », après build24_part.py.
def rep(a, b, n=1):
    global html
    assert html.count(a) == n, (a[:80], html.count(a)); html = html.replace(a, b)
rep("Maquette n° 24 : un jeu de runes. Le temps ralentit de nouveau quand tu graves.", "Maquette n° 25 : un jeu de runes. Plus rien n’attaque tout seul, sauf le bâton : la chouette, le sceau et l’orage partent quand tu graves. Chaque carte n’ouvre qu’un seul build : choisis ! Le temps ralentit quand tu graves.")
rep("Mesures (version 24)", "Mesures (version 25)")
rep("Chaque build monte jusqu’au niveau 3, et ils se cumulent.", "Chaque build monte jusqu’au niveau 3, et ils se cumulent. Chaque carte n’ouvre qu’un seul build. Plus rien n’attaque tout seul, sauf le bâton : les pouvoirs partent quand tu graves.")
i = html.index('    <ul class="combos">'); j = html.index('</ul>', i) + len('</ul>')
html = html[:i] + """    <ul class="combos">
      <li>🌋 <b>Volcan</b> (le trait) : trait brûlant + trait large</li>
      <li>⛈️ <b>Orage</b> (les golems qui éclatent) : lumière en chaîne + lumière aveuglante</li>
      <li>🌗 <b>Rune miroir</b> (toutes les runes) : long trait + grand V</li>
      <li>🎳 <b>Golems-boulets</b> (le V) : V tonnerre + mur solide</li>
      <li>🌀 <b>Tornade</b> (l’escargot) : rune de l’escargot + aimant</li>
      <li>🏰 <b>Rempart</b> (le mur) : rune du mur + mur d’épines</li>
      <li>🏛️ <b>Sanctuaire</b> (le bouclier) : rune du bouclier + sceau de garde</li>
      <li>🐙 <b>Le scribe fou</b> (l’encre) : grand encrier + moisson d’encre</li>
      <li>🦉 <b>Parlement des chouettes</b> : la chouette + pas léger</li>
    </ul>""" + html[j:]
