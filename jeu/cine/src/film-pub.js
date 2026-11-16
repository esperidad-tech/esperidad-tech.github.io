/* film-pub.js — LA PUB DE 30 SECONDES (Romain, 16 novembre). Ce film-là n'est PAS filmé ici : son image vient de jeu/pub/ (pub.html, filmer-pub.py),
   de vraies images du jeu montées sur la musique. Il est inscrit ici pour sa bande-son (bande-son.py pub) et pour la fiche du jeu (cine-infos.js).
   Les bruits tombent sur les coupes du montage (jeu/pub/pub.js). */
CINE.films.pub = {
  nom:'La présentation du jeu', duree:29.8, ailleurs:'jeu/pub',
  sons:[[.5, 'pubPop'], [1.5, 'pubPop'], [2.5, 'pubPop'], [2.85, 'pubPlongee'], [4.0, 'pubTada'], [5.95, 'pubWhoosh'], [7.95, 'pubWhoosh'], [8.95, 'pubWhoosh'], [9.95, 'pubWhoosh'], [11.95, 'pubWhoosh'], [12.95, 'pubWhoosh'],
    [14.05, 'cineClameur'], [15.25, 'cineAllumette'], [16.0, 'cinePffft'], [17.0, 'cineCape'], [20.45, 'pubWhoosh'], [22.0, 'pubPop'], [22.5, 'pubPop'], [23.0, 'pubPop'], [23.5, 'pubPop'], [23.95, 'pubWhoosh'], [25.0, 'cineClameur'], [26.0, 'pubTada']],
  sousTitres:[],
  etat:function(){ return {cam:{x:0, y:-300, z:1500, focus:1500}, acteurs:[]}; }
};
