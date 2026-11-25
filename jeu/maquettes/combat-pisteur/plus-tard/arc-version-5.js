/* L'arc de la version 5 (le quatrième bouton dans l'ombre), RETIRÉ le 25 novembre au soir à la demande de Romain :
   avec une ombre sans limite de temps, on pouvait tout tuer de loin sans risque. Gardé ici au cas où. Ne sert plus.
   Réglages : arc:{charge:1.2,dmg:[8,20],L:[6,14],cd:2,v:24} */
/* ======================= le bouton 4 : l'ombre (à découvert), l'arc (dans l'ombre) ======================= */
function debutVise(){
  if(P.arcCD>0){son('refus');return false;}
  P.etat='vise';P.t=0;P.charge=0;P.viseA=P.fa;son('bande');
  dire('arc1',"Dans l'ombre, le Pisteur prend son temps : garde le doigt sur l'arc, vise avec le pouce gauche, puis lâche. Plus tu attends, plus la flèche va loin.");
  return true;
}
function porteeArc(){return lerp(REG.arc.L[0],REG.arc.L[1],P.charge);}
function majVise(){
  /* une petite aide : la ligne accroche le golem le plus près de l'axe */
  const L=porteeArc();let a=P.fa,best=null,bs=0.22;
  for(const g of G){if(!vivant(g))continue;const dx=g.x-P.x,dy=g.y-P.y,d=hyp(dx,dy);if(d>L+0.5)continue;const e=Math.abs(ang(Math.atan2(dy,dx)-P.fa));if(e<bs&&vue(P.x,P.y,g.x,g.y)){bs=e;best=g;}}
  if(best)a=Math.atan2(best.y-P.y,best.x-P.x);
  P.viseA=a;P.viseC=best;P.viseL=Math.min(L,rayon(P.x,P.y,a,L,0.05));
}
function lacherVise(){
  /* un appui trop bref ne tire pas (le doigt qui a glissé sur le bouton) */
  if(P.t<0.22){P.etat='libre';P.t=0;P.charge=0;return;}
  const a=P.viseA;P.fa=a;
  fleches.push({x:P.x,y:P.y,ox:P.x,oy:P.y,a,v:REG.arc.v,L:0,max:porteeArc(),dmg:Math.round(lerp(REG.arc.dmg[0],REG.arc.dmg[1],P.charge))});
  P.arcCD=REG.arc.cd;P.etat='tir';P.t=0;P.tirT=tReel;P.charge=0;son('tirVise');stats.fleches++;
}

