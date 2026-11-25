/* La dague circulaire des versions 5 et 6 (le deuxième bouton à découvert), RETIRÉE le 25 novembre au soir à la demande de Romain :
   « la dague circulaire, elle sert à rien » — quand la vie est précieuse, personne ne va se planter au milieu d'une meute.
   La case reste réservée à une carte. Gardé ici au cas où. Ne sert plus.
   Réglages : tourb:{dmg:15,rayon:1.9,dur:0.45,frappe:0.12,cd:4,lent:0.4,lentDur:1.5} */
/* ======================= le bouton 2 : la dague circulaire (à découvert), le coup qui assomme (dans l'ombre) ======================= */
function debutTourb(){
  if(P.tourbCD>0){son('refus');return false;}
  P.etat='tourb';P.t=0;P.coupFait=false;P.dur=REG.tourb.dur;P.tourbCD=REG.tourb.cd;P.tourbT=tReel;son('tourb');
  return true;
}
function frapperTourb(){
  let n=0;
  for(const g of G){
    if(!vivant(g)||hyp(g.x-P.x,g.y-P.y)-g.r>REG.tourb.rayon)continue;
    if(blesserG(g,REG.tourb.dmg,'tourb')===true)n++;
    if(vivant(g)){g.lentT=REG.tourb.lentDur;}
  }
  P.slash={t:tReel,a:P.fa,tour:true,der:true,n:3};stats.tourbs++;
  if(n>=2)secousse(4);
  if(n)dire('lent1',"La dague circulaire les ralentit tous : c'est le moment de filer… ou d'en finir.");
}

