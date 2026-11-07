import json, base64, html
S = '/tmp/claude-0/-home-claude/3372a2cf-1f77-5598-a3f4-e1f632bdb837/scratchpad'
d = json.load(open(S + '/mj-donnees.json'))
SALLE = 'https://esperidad-tech.github.io/brumeval/salle.html'
ROLES = [('pisteur', 'Pisteur', '🏹', 'var(--pisteur)'), ('alchimiste', 'Alchimiste', '⚗️', 'var(--alchimiste)'), ('sage', 'Sage', '📜', 'var(--sage)')]
LIEUX = {'mairie':'la Mairie', 'clairiere':'la Clairière', 'moulin':'le Moulin', 'foret':'la Forêt', 'chene':'le Vieux Chêne', 'pont':'le Pont'}
ANA = {'fil':'le fil', 'poils':'les poils', 'eau_riviere':"l'eau de la rivière", 'poudre':'la poudre', 'poussiere':'la poussière', 'colorant':'le colorant', 'eau_lavoir':"l'eau du lavoir"}
def e(x): return html.escape(str(x), quote=True)
def usage(u):
    ou = u['ou']; nom = u['nom']
    if ou and ou[0] == 'lieux': return 'À ' + LIEUX.get(ou[1], ou[1]) + (' : « ' + nom + ' »' if nom else '')
    if ou and ou[0] == 'bonus': return 'Mission bonus : « ' + nom + ' »'
    if ou and ou[0] == 'pages': return 'Page du Grand Livre : « ' + nom + ' »'
    if ou and ou[0] == 'analyses': return "Analyse à l'atelier : " + ANA.get(ou[1] if len(ou) > 1 else '', ou[1] if len(ou) > 1 else '')
    return ' / '.join(ou) + (' : ' + nom if nom else '')
SPECIAL = {'chaudron':["Dans l'atelier : chaque potion à préparer, dans toutes les enquêtes."], 'insectes':["Pas encore utilisé dans une enquête."]}
cartes = {}
for k, v in d.items():
    img = base64.b64encode(open(f'{S}/point-mj/{k}.jpg', 'rb').read()).decode()
    # où il sert
    par = {}
    for u in v['usages']: par.setdefault(u['e'], []).append(usage(u))
    lignes_ou = ''
    if k in SPECIAL: lignes_ou = ''.join('<li>' + e(x) + '</li>' for x in SPECIAL[k])
    for n in sorted(par):
        uniq = []
        for x in par[n]:
            if x not in uniq: uniq.append(x)
        lignes_ou += '<li><span class="enq">Enquête ' + str(n) + (' <i>(en écriture)</i>' if n == 3 else '') + '</span> ' + '<br>'.join(e(x) for x in uniq) + '</li>'
    q = v['enq']
    niv_txt = ('<span class="pastille">Enquête 1 : niveau ' + str(q['1']['adulte']) + ' pour tous</span>' +
               '<span class="pastille">Enquête 2 : enfant ' + str(q['2']['enfant']) + ' · adulte ' + str(q['2']['adulte']) + '</span>' +
               '<span class="pastille doux">Enquête 3 : enfant ' + str(q['3']['enfant']) + ' · adulte ' + str(q['3']['adulte']) + '</span>')
    # tableau des difficultés : toutes les lignes, dans l'ordre où elles apparaissent
    noms = []
    for n in range(1, 11):
        for nom, val in v['niv'][str(n)]:
            if nom not in noms: noms.append(nom)
    joues = {q['1']['adulte']:'E1', q['2']['enfant']:None, q['2']['adulte']:None}
    marque = {}
    marque.setdefault(q['1']['adulte'], []).append('E1')
    marque.setdefault(q['2']['enfant'], []).append('E2 enfant')
    marque.setdefault(q['2']['adulte'], []).append('E2 adulte')
    var = '&v=chien' if k == 'poursuite' else ''
    t = '<div class="tab"><table><thead><tr><th class="coin">Difficulté</th>'
    for n in range(1, 11):
        t += '<th class="' + ('joue' if n in marque else '') + '"><a href="' + SALLE + '#jeu=' + k + '&amp;n=' + str(n) + var + '" target="_blank" rel="noopener" title="Jouer au niveau ' + str(n) + '">' + str(n) + '</a>' + (''.join('<small>' + m + '</small>' for m in marque.get(n, []))) + '</th>'
    t += '</tr></thead><tbody>'
    for nom in noms:
        t += '<tr><th>' + e(nom) + '</th>'
        avant = None
        for n in range(1, 11):
            val = dict(v['niv'][str(n)]).get(nom, '—')
            chg = avant is not None and val != avant
            t += '<td class="' + ('chg ' if chg else '') + ('joue' if n in marque else '') + '">' + e(val) + '</td>'
            avant = val
        t += '</tr>'
    t += '</tbody></table></div>'
    jouer = ''.join('<a class="jouer" href="' + SALLE + '#jeu=' + k + '&amp;n=' + str(n) + var + '" target="_blank" rel="noopener">Niveau ' + str(n) + '</a>' for n in (1, 3, 5, 7, 10))
    cartes.setdefault(v['role'], []).append(
        '<article class="jeu" id="' + k + '"><div class="haut">' +
        '<figure><img src="data:image/jpeg;base64,' + img + '" alt="Le mini-jeu ' + e(v['nom']) + ', au niveau 3" width="410" height="590" loading="lazy"></figure>' +
        '<div class="infos"><h3><span aria-hidden="true">' + e(v['ic']) + '</span> ' + e(v['nom']) + '</h3>' +
        '<p class="phrase">« ' + e(v['phrase']) + ' »</p><p class="consigne">' + e(v['consigne']) + '</p>' +
        '<h4>Où il sert</h4><ul class="ou">' + lignes_ou + '</ul>' +
        '<h4>Le niveau joué</h4><p class="niveaux">' + niv_txt + '</p>' +
        '<h4>Le lancer dans la salle</h4><p class="boutons">' + jouer + '</p></div></div>' +
        '<h4 class="h-tab">Ce qui change d\'un niveau à l\'autre <span>(touche un numéro pour jouer à ce niveau ; en jaune, ce qui change par rapport au niveau d\'avant)</span></h4>' + t + '</article>')
sections = ''
for rid, nom, ic, c in ROLES:
    l = cartes.get(rid, [])
    sections += '<section class="role" style="--c:' + c + '" id="role-' + rid + '"><h2><span aria-hidden="true">' + ic + '</span> ' + nom + ' <small>' + str(len(l)) + ' mini-jeux</small></h2>' + ''.join(l) + '</section>'
nb = sum(len(x) for x in cartes.values())
sommaire = ''.join('<a href="#' + k + '" style="--c:' + dict((r[0], r[3]) for r in ROLES)[v['role']] + '"><span aria-hidden="true">' + e(v['ic']) + '</span>' + e(v['nom']) + '</a>' for rid, _, _, _ in ROLES for k, v in d.items() if v['role'] == rid)
page = open(S + '/page-mj/modele.html').read().replace('%%SECTIONS%%', sections).replace('%%NB%%', str(nb)).replace('%%SOMMAIRE%%', sommaire).replace('%%SALLE%%', SALLE)
open(S + '/page-mj/mini-jeux-brumeval.html', 'w').write(page)
print(len(page) // 1024, 'Ko')
