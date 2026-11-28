# La forme au sol de chaque objet de la peinture redressée (ce qui bloque le héros, ce qui reçoit son ombre).
# L'emprise d'un objet part de sa découpe (SAM) : pour chaque colonne de pixels, le bas de la découpe est l'avant
# de l'objet posé au sol ; on en tire une ligne au sol (en pas), qu'on épaissit vers le fond de « ep » pas
# (ou de côté, « dx », pour un muret qui file vers le fond). « rond » : un cercle (piliers, fontaines, vase).
#   muret : on saute par-dessus ; mur : un morceau du mur du bas (sa profondeur est celle du mur, sans emprise propre) ;
#   libre : rien ne bloque (on le voit seulement passer devant / derrière).
FORMES = {
 'pilier_av_g': dict(rond=True), 'pilier_av_d': dict(rond=True), 'pilier_fd_g': dict(rond=True), 'pilier_fd_d': dict(rond=True),
 'pan_g': dict(ep=0.6), 'pan_d': dict(ep=0.6),
 'muret_g': dict(dx=0.45, muret=True, h=1.15), 'muret_d': dict(ep=0.5, muret=True),
 'tonneaux': dict(ep=1.0), 'chariot': dict(ep=1.0),
 'caisse_fd': dict(ep=1.1), 'caisse_av_g': dict(ep=1.2), 'caisse_av_d': dict(ep=1.2), 'caisse_coin_d': dict(ep=0.9),
 'gravats': dict(ep=0.8), 'gravats_d': dict(ep=0.7), 'vase_d': dict(rond=True),
 'fontaine_g': dict(rond=True), 'fontaine_d': dict(rond=True), 'cage_g': dict(ep=1.1), 'cage_d': dict(ep=1.1),
 'bric_roue': dict(ep=0.5), 'bric_caisse_h': dict(ep=0.9), 'bric_tonneaux': dict(ep=0.8), 'bric_caisses': dict(ep=1.0),
 'fontaine_fd_g': dict(rond=True), 'fontaine_fd_d': dict(rond=True),
 'comptoir_g': dict(ep=1.0), 'comptoir_c': dict(ep=1.0), 'comptoir_d': dict(ep=1.0), 'tonneaux_fd_d': dict(ep=0.9),
 'jardiniere_g': dict(ep=0.6), 'jardiniere_d': dict(ep=0.9),
 'baignoire_g': dict(ep=1.0), 'baignoire_d': dict(ep=1.0),
}
for n in ['devant_brasero_g', 'devant_bloc_1', 'devant_jard_1', 'devant_bloc_2', 'devant_bloc_3', 'devant_brasero_c_g',
          'devant_brasero_c_d', 'devant_bloc_4', 'devant_bloc_5', 'devant_jard_2', 'devant_bloc_6', 'devant_brasero_d']:
    FORMES[n] = dict(mur=True)
# le mur du bas (des poteaux, des jardinières, deux passages vers le rebord) : son dos et son devant, en « y » du jeu ;
# ses deux bouts (x du jeu) sont les poteaux à torche. Le sol de la salle va jusque-là (« coins » : les deux coins des
# baignoires). L'escalier du milieu descend vers nous : on s'arrête à sa première marche (ligne 1695 de la peinture,
# entre les colonnes 1958 et 2378).
MUR_BAS = dict(dos=20.35, devant=20.7, coins=20.6)
ESCALIER = dict(u0=1958, u1=2378, v=1695)
