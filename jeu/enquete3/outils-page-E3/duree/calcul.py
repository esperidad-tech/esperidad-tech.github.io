"""Estimation du temps de l'enquête 3 : lecture (12 ans), mini-jeux, réflexion. Hypothèses en tête de fichier."""
import json, re, sys
D = json.load(open(sys.argv[1], encoding='utf-8'))
B, ROLES = D['barde'], D['roles']

VITESSE = 150          # mots par minute, lecture silencieuse d'un enfant de 12 ans (texte simple)
CHOIX_Q = 10 / 60      # choisir une question : 10 s
CHOIX_GD = 30 / 60     # choisir à une étape de grand dialogue : 30 s
REGLES = 30            # mots de consigne par mini-jeu (le reste est en images)
SURCOUT_MJ = 1.0       # consigne, démo, résultat : 1 min par mini-jeu
PARLER = 3.0           # par moment : se raconter, se dicter les codes, passer au moment suivant
MJ = {'tir': 1.0, 'poursuite': 1.5, 'cachette': 1.2, 'traces': 1.5, 'chaudron': 2.5, 'bulles': 1.0, 'ressemblances': 1.5,
      'commande': 3.0, 'runes10': 5.0, 'alphabet': 2.0, 'mensonge': 1.2}   # minutes de jeu (tools/proba-minijeux.json ; les nouveaux : supposés)

def mots(t): return len(re.findall(r"[\wÀ-ÿ'’-]+", t or ''))
def lettres(t): return len(re.findall(r'[^\W\d_]', t or ''))
class Compte:
    def __init__(s): s.m = 0; s.l = 0; s.min_mj = 0.0; s.min_choix = 0.0
    def lit(s, t, part=1.0): s.m += mots(t) * part; s.l += lettres(t) * part
    def jeu(s, nom, n=1): s.min_mj += n * (MJ[nom] + SURCOUT_MJ); s.lit(' '.join(['mot'] * REGLES), n) if n else None
    def temps(s): return s.m / VITESSE + s.min_mj + s.min_choix

def moy(l): return sum(l) / len(l) if l else 0
def visite(c, v):
    """Un passage chez un villageois : il lit les 4 questions, en choisit 2, lit les 2 réponses (et la vérité s'il démasque)."""
    for q in v['qs']: c.lit(q['q'])
    c.m += 2 * moy([mots(q['r']) for q in v['qs']]); c.l += 2 * moy([lettres(q['r']) for q in v['qs']])
    menteurs = [q for q in v['qs'] if q['v']]
    if menteurs: c.lit(menteurs[0]['v'], 0.5)   # une fois sur deux, il démasque et lit la vérité
    c.min_choix += 2 * CHOIX_Q
def etapes(c, liste, intro=None):
    """Un dialogue à étapes : il lit les 4 choix, puis une réplique."""
    for e in liste:
        choix = e['choix'] if isinstance(e, dict) else e
        if isinstance(e, dict) and e.get('intro'): c.lit(e['intro'])
        for x in choix: c.lit(x['t'])
        c.m += moy([mots(x['rp']) for x in choix]); c.l += moy([lettres(x['rp']) for x in choix])
        c.min_choix += CHOIX_GD

lettre = re.search(r'Mon cher Monsieur le maire.*?Odette\.', B['decor'], re.S).group(0)
COMMUN_OUVERTURE = lettre + ' Le maire annonce une grande fête cette nuit sur la place pour fêter la bonne nouvelle. Voici vos missions pour la fête.'
FIN = "DONG… DONG… La Grosse Marie sonne minuit. Des pas dans l'escalier de la crypte. Des lanternes. Le maire apparaît, avec Silas et deux gardes. Le maire retire lentement ses gants. À son doigt, une bague brille à la lumière des lanternes : une tête de corbeau. « Vous êtes allés trop loin. Beaucoup trop loin. » Silas, bouche bée : « Monsieur le maire… ? » « Gardes ! Enfermez-les ! » Le cachot de la mairie. Une plume noire se pose doucement devant la grille."

res = {}
# ---------- Le Barde ----------
for moment in ['matin', 'aprem', 'nuit']:
    c = Compte(); e = Compte()   # e : les écoutes (seulement avec Tendre l'oreille)
    if moment == 'matin':
        c.lit("Barde ! Voici 10 pièces. Rapporte-moi au moins 10 bouquets pour la fête de ce soir !")
        etapes(c, B['fortune'])
        etapes(c, B['marche'])
        for v in B['matin']: visite(c, v)
        for o in B['occupes'][:3]: c.lit(o)
        c.jeu('mensonge', 2)
        for t in B['ecoutesMatin']: e.lit(t)
    if moment == 'aprem':
        c.lit("Ah, Barde ! Alors, mes fleurs ? Bravo ! Voici 10 pièces d'or pour ta peine. Et ce soir, tout le monde sur la place jusqu'à minuit, hein ! Je compte sur vous !")
        for q in B['maire']['qs']: c.lit(q['q'])
        c.m += 2 * moy([mots(q['r']) for q in B['maire']['qs']]); c.l += 2 * moy([lettres(q['r']) for q in B['maire']['qs']])
        etapes(c, B['maire']['etapes'])
        c.lit("Tu poses la canne contre la porte. Dedans, sur la table, un carnet avec un chat dessiné à chaque page : l'écriture d'Odette ! Par terre, un bol de lait renversé… et des petites traces de pattes qui filent vers la porte.")
        for v in B['aprem']:
            visite(c, v)
            for q in v['qs']:
                if q['alt']: c.lit(q['alt'])
        c.jeu('mensonge', 3)
        for t in B['ecoutesAprem']: e.lit(t)
    if moment == 'nuit':
        N = {x['titre'].split(' (')[0]: x for x in B['nuit']}
        for nom in ["Le grand dialogue d'Anselme", 'Le grand dialogue de Léo']:
            x = N[nom]
            qs = re.findall(r'«[^»]*»\s*—[^→]*→\s*[^\n]*', x['reste'])
            for q in qs: c.lit(q, 0.5)   # il lit les 4 questions et en pose 2
            etapes(c, x['choix'])
        fin_leo = re.search(r'Trois étapes.*', N['Le grand dialogue de Léo']['reste'])
        c.lit(fin_leo.group(0) if fin_leo else '', 0.7)
        fete = re.findall(r'«[^»]*»', N['La fête']['reste'])
        for t in fete[:6]: c.lit(t)
        ec = N['Les écoutes de la nuit']['reste']
        e.lit(' '.join(re.findall(r'«[^»]*»', ec)))
        c.lit(FIN)
    res[('barde', moment)] = (c, e)

# ---------- Les trois autres rôles ----------
JEUX = {'Tir à l\'arc': 'tir', 'Course-poursuite': 'poursuite', 'Se cacher': 'cachette', 'Suivre la piste': 'traces', 'Le chaudron': 'chaudron',
        'Les bulles magiques': 'bulles', 'Les ressemblances': 'ressemblances', 'Assembler selon une commande': 'commande',
        'Assembler les runes': 'runes10', 'L\'alphabet secret': 'alphabet'}
for r in ['pisteur', 'alchimiste', 'sage']:
    for moment in ['matin', 'aprem', 'nuit']:
        c = Compte()
        for a in [a for a in ROLES if a['role'] == r and a['moment'] == moment]:
            c.lit(a['ecran'])
            for code in a['besoin'] + a['donne']: c.lit(code, 2)   # lire le code, puis l'écran qui l'explique
            jeu = next((v for k, v in JEUX.items() if a['mj'].startswith(k)), None)
            if a['titre'] == 'La lettre, en se cachant': continue       # seulement si le Barde rate le maire
            if a['titre'] == 'Les potions du donjon': c.jeu('chaudron', 3); continue  # trois potions de plus
            if jeu: c.jeu(jeu)
            elif a['mj'].startswith('Le donjon'): pass
            else: c.min_choix += 0.7    # une action simple (explorer, une page du Grand Livre, rendre la mission)
        if moment == 'nuit':
            c.min_mj += 15 if r != 'pisteur' else 15   # le donjon, joué ensemble
            c.lit(FIN)
        if r == 'sage' and moment == 'nuit': c.min_choix += 3   # l'accusation, réfléchie avec toute l'équipe
        res[(r, moment)] = (c, None)

# ---------- Les totaux ----------
noms = {'barde': 'Barde', 'pisteur': 'Pisteur', 'alchimiste': 'Alchimiste', 'sage': 'Sage'}
print('LECTURE PAR RÔLE (parcours normal)')
for r in ['barde', 'pisteur', 'alchimiste', 'sage']:
    m = sum(res[(r, x)][0].m for x in ['matin', 'aprem', 'nuit']); l = sum(res[(r, x)][0].l for x in ['matin', 'aprem', 'nuit'])
    m += mots(COMMUN_OUVERTURE); l += lettres(COMMUN_OUVERTURE)
    extra = ''
    if r == 'barde':
        em = sum(res[('barde', x)][1].m for x in ['matin', 'aprem', 'nuit']); el = sum(res[('barde', x)][1].l for x in ['matin', 'aprem', 'nuit'])
        extra = f' | + écoutes (Tendre l\'oreille) : {em:.0f} mots, {el:.0f} lettres'
    print(f'{noms[r]:11s} {m:6.0f} mots {l:7.0f} lettres  → {m / VITESSE:5.1f} min de lecture{extra}')
print()
print('TEMPS PAR MOMENT (minutes)')
total = 4.0   # l'ouverture : la lettre, l'écran des missions
for moment in ['matin', 'aprem', 'nuit']:
    t = {r: res[(r, moment)][0].temps() for r in ['barde', 'pisteur', 'alchimiste', 'sage']}
    if moment == 'nuit':
        # la nuit, l'ordre est imposé : Anselme, puis le donjon, puis Léo et l'accusation
        b = res[('barde', 'nuit')][0]
        # le sac se compose et se tape pendant Anselme : 0 ; Léo est la dernière salle du donjon : pas de poursuite, pas de questions
        court = 4 + 2.2 + 9 + 0.5 + 4 + 3 + 1.5     # Anselme, la clé (Se cacher), le donjon court, la porte, Léo, l'accusation, la fin
        long_ = 4 + 1.0 + 15 + 0.5 + 4 + 3 + 1.5    # Anselme raté, la grille, le donjon long, la porte, Léo, l'accusation, la fin
        dur = (court + long_) / 2 + PARLER
        print(f'nuit    : par le clocher ≈ {court + PARLER:.0f} min, par le puits ≈ {long_ + PARLER:.0f} min (Anselme 4, la clé 2 ou la grille 1, le donjon 9 ou 15, la porte 0,5, Léo 4, l\'accusation 3, la fin 1,5, parler {PARLER:.0f}) → moyenne {dur:.0f}')
    else:
        dur = max(t.values()) + PARLER
        print(f'{moment:7s} : ' + ', '.join(f'{noms[r]} {v:4.1f}' for r, v in t.items()) + f'  → le plus chargé + parler {PARLER:.0f} = {dur:.0f}')
    total += dur
print(f'TOTAL ≈ {total:.0f} min (ouverture 4 comprise), sans les mini-jeux ratés ni les écoutes')
detail = {f'{r}-{m}': {'mots': round(res[(r, m)][0].m), 'lettres': round(res[(r, m)][0].l), 'lecture': round(res[(r, m)][0].m / VITESSE, 1), 'minijeux': round(res[(r, m)][0].min_mj, 1), 'choix': round(res[(r, m)][0].min_choix, 1), 'temps': round(res[(r, m)][0].temps(), 1)} for r in noms for m in ['matin', 'aprem', 'nuit']}
print(json.dumps(detail, ensure_ascii=False))
