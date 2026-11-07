
/* ==========================================================
   Export
   ========================================================== */
window.Atelier = {
  etatNeuf:etatNeuf,
  ajouter:ajouter,
  compter:compter,
  retirer:retirer,
  donnerCartons:donnerCartons,
  normaliser:normaliser,
  reglages:reglages,
  vue:vue,
  OBJETS:CAT,
  ETIQUETTES:ETQ_EXTRA,
  LIQUIDES:LIQUIDES,
  THEMES:THEMES,
  aRangementSec:aRangementSec,
  /* le chat (étape 3) : Mimi vit chez Odette après la naissance du chaton (à partir de l'enquête 4) ; la réplique d'Odette, pour le village */
  chezOdette:chezOdette,
  /* le guidage du tutoriel (voir en tête du fichier) */
  guider:guider,
  guidage:guideEnCours,
  /* étape 4 : le moteur l'appelle quand l'Alchimiste réussit un de ses mini-jeux (la première fois pour chacun : un accessoire pour le chat) */
  mjGagne:mjGagne,
  ACCESSOIRES:ACC,
  repliqueOdette:repliqueOdette,
  PORTEE:PORTEE,
  BESOINS_CHAT:BESOINS.map(function(b){ return b.k; }),
  /* la fin du message « Potion réussie : … » du moteur : où est la potion (son flacon, devant la porte) */
  OU_POTIONS:' ! Son flacon est posé par terre, devant la porte.'
};
})();
