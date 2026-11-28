# Les cadres des objets de la peinture REDRESSÉE (nuit2-droite.png, 4384 × 1872), relevés sur un aperçu au 1/2,74.
# Ils servent seulement à dire à SAM où chercher : la découpe exacte vient de SAM (voir decouper.py).
K = 2.74
_B = {
 'pilier_av_g': (470, 285, 527, 512), 'pilier_av_d': (1045, 285, 1105, 512),
 'pilier_fd_g': (515, 128, 572, 282), 'pilier_fd_d': (1020, 122, 1075, 282),
 'pan_g': (585, 245, 745, 365), 'pan_d': (880, 340, 1025, 450),
 'muret_g': (655, 385, 692, 500), 'muret_d': (810, 458, 915, 525),
 'tonneaux': (850, 278, 978, 345), 'chariot': (1078, 315, 1128, 385),
 'caisse_fd': (455, 250, 512, 318), 'caisse_av_g': (563, 467, 630, 552), 'caisse_av_d': (945, 462, 1010, 550),
 'gravats': (412, 360, 465, 418), 'gravats_d': (1250, 318, 1292, 352), 'vase_d': (1290, 330, 1320, 362),
 'fontaine_g': (255, 368, 318, 448), 'fontaine_d': (1255, 365, 1318, 445),
 'cage_g': (180, 415, 282, 515), 'cage_d': (1322, 413, 1395, 497),
 'fontaine_fd_g': (375, 155, 440, 232), 'fontaine_fd_d': (1145, 152, 1215, 228),
 'comptoir_g': (458, 182, 575, 232), 'comptoir_c': (733, 182, 862, 237), 'comptoir_d': (1037, 180, 1120, 228),
 'tonneaux_fd_d': (1183, 205, 1258, 255), 'jardiniere_g': (255, 262, 300, 318), 'jardiniere_d': (1218, 250, 1302, 302),
 'baignoire_g': (125, 510, 212, 598), 'baignoire_d': (1365, 508, 1448, 602),
}
BOITES = {n: tuple(round(v * K) for v in b) for n, b in _B.items()}
# relevés directement en pixels de la peinture (zooms à la grille)
BOITES.update({
 'bric_roue': (865, 565, 962, 775), 'bric_caisse_h': (932, 592, 1088, 708), 'bric_tonneaux': (948, 682, 1088, 848),
 'bric_caisses': (765, 752, 988, 952),
 'devant_brasero_g': (928, 1365, 1052, 1872), 'devant_bloc_1': (1030, 1450, 1258, 1872), 'devant_jard_1': (1240, 1485, 1432, 1872),
 'devant_bloc_2': (1412, 1450, 1595, 1872), 'devant_bloc_3': (1715, 1460, 1835, 1872), 'devant_brasero_c_g': (1822, 1420, 1952, 1872),
 'devant_brasero_c_d': (2372, 1420, 2500, 1872), 'devant_bloc_4': (2490, 1460, 2628, 1872), 'devant_bloc_5': (2776, 1450, 2932, 1872),
 'devant_jard_2': (2918, 1485, 3110, 1872), 'devant_bloc_6': (3096, 1450, 3286, 1872), 'devant_brasero_d': (3272, 1340, 3390, 1872),
 'caisse_coin_d': (3360, 1490, 3490, 1700),
})
# des points « c'est l'objet » / « ce n'est pas l'objet » quand le cadre seul ne suffit pas à SAM
POINTS = {
 'gravats': ([(1180, 1060), (1220, 1100), (1160, 1110), (1240, 1040), (1200, 1020)], []),
 'gravats_d': ([(3470, 930), (3510, 945), (3450, 900), (3490, 900)], []),
 'bric_roue': ([(905, 640), (915, 720), (930, 600)], []),
 'bric_tonneaux': ([(1000, 760), (1060, 740)], []),
 'bric_caisses': ([(920, 820), (830, 870), (800, 920)], []),
}
