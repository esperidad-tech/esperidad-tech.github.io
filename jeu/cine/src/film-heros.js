/* film-heros.js — LES QUATRE FILMS DES HÉROS (Romain, 17 novembre). ÉCRIT PAR jeu/pub/sons-heros.py À PARTIR DU MONTAGE (jeu/pub/heros.js) : NE PAS LE MODIFIER À LA MAIN.
   Ces films ne sont PAS filmés ici : leur image vient de jeu/pub/ (heros.html, filmer-heros.py). Ils sont inscrits ici pour leur bande-son
   (bande-son.py herosPisteur…) et pour la fiche du jeu (cine-infos.js). Les bruits tombent sur les coupes du montage. */
CINE.films.herosPisteur = {
  nom:"Le film du Pisteur", duree:29.8, ailleurs:'jeu/pub',
  sons:[[0.5, "pubPop"], [1.0, "pubPop"], [6.45, "pubWhoosh"], [8.95, "pubWhoosh"], [11.95, "pubWhoosh"], [15.95, "pubWhoosh"], [20.45, "pubWhoosh"], [22, "pubPop"], [22.5, "pubPop"], [23, "pubPop"], [23.5, "pubPop"], [23.95, "pubWhoosh"], [24.55, "cineClameur"], [26.25, "pubTada"]],
  sousTitres:[],
  etat:function(){ return {cam:{x:0, y:-300, z:1500, focus:1500}, acteurs:[]}; }
};
CINE.films.herosAlchimiste = {
  nom:"Le film de l'Alchimiste", duree:29.8, ailleurs:'jeu/pub',
  sons:[[0.5, "pubPop"], [1.0, "pubPop"], [5.95, "pubWhoosh"], [7.95, "pubWhoosh"], [9.95, "pubWhoosh"], [10.95, "pubWhoosh"], [11.95, "pubWhoosh"], [15.95, "pubWhoosh"], [20.45, "pubWhoosh"], [22, "pubPop"], [22.5, "pubPop"], [23, "pubPop"], [23.5, "pubPop"], [23.95, "pubWhoosh"], [24.55, "cineClameur"], [26.25, "pubTada"]],
  sousTitres:[],
  etat:function(){ return {cam:{x:0, y:-300, z:1500, focus:1500}, acteurs:[]}; }
};
CINE.films.herosBarde = {
  nom:"Le film du Barde", duree:29.8, ailleurs:'jeu/pub',
  sons:[[0.5, "pubPop"], [1.0, "pubPop"], [5.95, "pubWhoosh"], [8.45, "pubWhoosh"], [11.95, "pubWhoosh"], [15.95, "pubWhoosh"], [19.45, "pubWhoosh"], [22, "pubPop"], [22.5, "pubPop"], [23, "pubPop"], [23.5, "pubPop"], [23.95, "pubWhoosh"], [24.55, "cineClameur"], [26.25, "pubTada"]],
  sousTitres:[],
  etat:function(){ return {cam:{x:0, y:-300, z:1500, focus:1500}, acteurs:[]}; }
};
CINE.films.herosSage = {
  nom:"Le film du Sage", duree:29.8, ailleurs:'jeu/pub',
  sons:[[0.5, "pubPop"], [1.0, "pubPop"], [5.95, "pubWhoosh"], [8.45, "pubWhoosh"], [10.45, "pubWhoosh"], [11.95, "pubWhoosh"], [15.95, "pubWhoosh"], [20.45, "pubWhoosh"], [22, "pubPop"], [22.5, "pubPop"], [23, "pubPop"], [23.5, "pubPop"], [23.95, "pubWhoosh"], [24.55, "cineClameur"], [26.25, "pubTada"]],
  sousTitres:[],
  etat:function(){ return {cam:{x:0, y:-300, z:1500, focus:1500}, acteurs:[]}; }
};
