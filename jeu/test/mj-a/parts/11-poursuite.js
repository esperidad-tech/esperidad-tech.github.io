
/* ==========================================================
   POURSUITE (Pisteur) — course sur 3 couloirs vue de derrière.
   Glisser ⬅️ ➡️ pour changer de couloir, ⬆️ pour sauter, ⬇️ pour
   glisser (ou toucher à gauche / à droite, ou les boutons).
   Beaucoup d'obstacles, variés et serrés : caisses, charrettes, étals
   du marché, barrières, chien endormi, flaques de boue, linge et
   branches basses, poules qui traversent, tonneaux qui roulent, et
   des enchaînements (changer vite de couloir puis sauter).
   Un choc ne finit pas la partie : on trébuche, on ralentit, et la
   silhouette s'éloigne d'un pas (plus petite, plus haut sur la route).
   10 obstacles sans faute d'affilée : elle se rapproche d'un pas.
   Départ : 2 pas de « attrapée », 3 pas de « perdue ». Pas d'autre
   fin : les obstacles arrivent jusqu'à ce qu'on l'attrape ou la perde.
   Mods : erreurs (+1 pas avant de la perdre), lent et temps (tout
   arrive moins vite), zone (sauts et glissades plus longs, chocs plus
   tolérants), aide (obstacles visibles et surlignés plus tôt, et une
   flèche dit quoi faire pour les N×6 premiers), revele (toujours la
   flèche), obstacles (− = moins serrés, + = plus serrés), vitesse
   (bottes : elle se rapproche après 8 obstacles sans faute au lieu de 10).
   ========================================================== */
var OBSTACLES_P = {
  tronc: '<g><rect x="-46" y="-22" width="92" height="30" rx="14" fill="#8a5a33" stroke="' + CONTOUR + '" stroke-width="5"/><ellipse cx="-46" cy="-7" rx="9" ry="15" fill="#d9a066" stroke="' + CONTOUR + '" stroke-width="4"/><path d="M-30,-14 L20,-14 M-20,-2 L30,-2" stroke="#5e3a1e" stroke-width="3" stroke-linecap="round"/></g>',
  caisse: '<g><rect x="-30" y="-56" width="60" height="58" rx="5" fill="#c08a4a" stroke="' + CONTOUR + '" stroke-width="5"/><path d="M-30,-56 L30,2 M30,-56 L-30,2" stroke="#7d5428" stroke-width="5"/><rect x="-30" y="-56" width="60" height="58" rx="5" fill="none" stroke="' + CONTOUR + '" stroke-width="5"/></g>',
  tonneau: '<g><path d="M-26,-60 C-36,-30 -36,-28 -26,2 L26,2 C36,-28 36,-30 26,-60 Z" fill="#9a6235" stroke="' + CONTOUR + '" stroke-width="5"/><path d="M-31,-42 L31,-42 M-31,-16 L31,-16" stroke="#3b3346" stroke-width="6"/><ellipse cx="0" cy="-60" rx="26" ry="7" fill="#b87a44" stroke="' + CONTOUR + '" stroke-width="4"/></g>',
  foin: '<g><path d="M-44,2 L-40,-40 C-20,-54 20,-54 40,-40 L44,2 Z" fill="#e6c25a" stroke="' + CONTOUR + '" stroke-width="5"/><path d="M-30,-30 L-26,-6 M-8,-40 L-6,-8 M14,-38 L12,-6 M32,-28 L30,-4" stroke="#b08a2a" stroke-width="3" stroke-linecap="round"/><path d="M-42,-22 L42,-22" stroke="#8a5a33" stroke-width="5"/></g>',
  rocher: '<g><path d="M-40,2 C-46,-18 -30,-44 -6,-46 C20,-48 42,-30 40,-8 C40,-2 38,2 34,2 Z" fill="#7d7a92" stroke="' + CONTOUR + '" stroke-width="5"/><path d="M-20,-30 C-10,-38 6,-38 14,-32" stroke="#b5b2cc" stroke-width="4" fill="none" stroke-linecap="round"/></g>',
  poule: '<g><ellipse cx="0" cy="-20" rx="22" ry="18" fill="#fff" stroke="' + CONTOUR + '" stroke-width="5"/><circle cx="16" cy="-36" r="10" fill="#fff" stroke="' + CONTOUR + '" stroke-width="5"/><path d="M14,-48 l4,-6 l3,6 l4,-5 l2,7" fill="#e5484d" stroke="' + CONTOUR + '" stroke-width="3"/><path d="M25,-36 l9,3 l-9,3 Z" fill="#f6b23a" stroke="' + CONTOUR + '" stroke-width="2.5"/><circle cx="18" cy="-38" r="2.2" fill="' + CONTOUR + '"/><path d="M-6,-2 L-8,8 M6,-2 L8,8" stroke="#f6b23a" stroke-width="4" stroke-linecap="round"/></g>',
  roule: '<g class="mja-roule"><ellipse cx="0" cy="-28" rx="30" ry="30" fill="#9a6235" stroke="' + CONTOUR + '" stroke-width="5"/><ellipse cx="0" cy="-28" rx="13" ry="30" fill="#b87a44" stroke="' + CONTOUR + '" stroke-width="4"/><path d="M-28,-40 L28,-40 M-28,-16 L28,-16" stroke="#3b3346" stroke-width="5"/></g>',
  barriere: '<g><path d="M-52,4 L-52,-34 M52,4 L52,-34 M0,4 L0,-34" stroke="' + CONTOUR + '" stroke-width="12" stroke-linecap="round"/><path d="M-52,4 L-52,-34 M52,4 L52,-34 M0,4 L0,-34" stroke="#a8743f" stroke-width="7" stroke-linecap="round"/><rect x="-60" y="-30" width="120" height="11" rx="4" fill="#c08a4a" stroke="' + CONTOUR + '" stroke-width="4"/><rect x="-60" y="-12" width="120" height="11" rx="4" fill="#c08a4a" stroke="' + CONTOUR + '" stroke-width="4"/></g>',
  linge: '<g><path d="M-60,4 L-60,-120 M60,4 L60,-120" stroke="' + CONTOUR + '" stroke-width="10" stroke-linecap="round"/><path d="M-60,4 L-60,-120 M60,4 L60,-120" stroke="#8a5a33" stroke-width="5" stroke-linecap="round"/><path d="M-60,-112 Q0,-96 60,-112" stroke="#e8d7ae" stroke-width="3" fill="none"/>' +
    '<path d="M-46,-110 L-24,-104 L-26,-70 L-48,-74 Z" fill="#e5484d" stroke="' + CONTOUR + '" stroke-width="3.5"/><path d="M-14,-102 L14,-102 L16,-64 L4,-64 L0,-80 L-4,-64 L-16,-64 Z" fill="#6cb6ff" stroke="' + CONTOUR + '" stroke-width="3.5"/><path d="M24,-104 L46,-110 L48,-76 L26,-72 Z" fill="#f6d23a" stroke="' + CONTOUR + '" stroke-width="3.5"/></g>',
  branche: '<g><path d="M-62,-96 C-30,-110 20,-90 62,-104" stroke="' + CONTOUR + '" stroke-width="15" fill="none" stroke-linecap="round"/><path d="M-62,-96 C-30,-110 20,-90 62,-104" stroke="#7a4e2c" stroke-width="9" fill="none" stroke-linecap="round"/>' +
    '<circle cx="-34" cy="-90" r="15" fill="#2a7050" stroke="' + CONTOUR + '" stroke-width="4"/><circle cx="6" cy="-84" r="17" fill="#2f7a4c" stroke="' + CONTOUR + '" stroke-width="4"/><circle cx="40" cy="-92" r="14" fill="#2a7050" stroke="' + CONTOUR + '" stroke-width="4"/><circle cx="10" cy="-90" r="7" fill="#3c9a62"/></g>',
  boost: '<g class="mja-boost"><path d="M-30,-2 L0,-22 L30,-2 L30,-12 L0,-32 L-30,-12 Z M-30,18 L0,-2 L30,18 L30,8 L0,-12 L-30,8 Z" fill="#8ff3ff" stroke="' + CONTOUR + '" stroke-width="3" stroke-linejoin="round"/></g>',
  flaque: '<g><ellipse cx="0" cy="-2" rx="50" ry="13" fill="#4a3220" stroke="' + CONTOUR + '" stroke-width="3"/><ellipse cx="-12" cy="-5" rx="16" ry="4" fill="#7a5a3e" opacity=".7"/><circle cx="18" cy="-2" r="3" fill="#6d5238"/></g>',
  haie: '<g><path d="M-50,4 C-56,-30 -40,-64 -20,-60 C-10,-80 14,-80 22,-62 C44,-66 58,-30 50,4 Z" fill="#245e3c" stroke="' + CONTOUR + '" stroke-width="5"/><circle cx="-18" cy="-36" r="4" fill="#e5484d"/><circle cx="16" cy="-24" r="4" fill="#e5484d"/><circle cx="4" cy="-52" r="4" fill="#e5484d"/></g>',
  charrette: '<g><rect x="-40" y="-62" width="80" height="50" rx="5" fill="#a8743f" stroke="' + CONTOUR + '" stroke-width="5"/><path d="M-40,-46 L40,-46 M-40,-30 L40,-30" stroke="#7d5428" stroke-width="4"/><path d="M-34,-62 C-30,-80 -6,-84 0,-72 C8,-86 32,-80 34,-62 Z" fill="#e6c25a" stroke="' + CONTOUR + '" stroke-width="4"/><circle cx="-30" cy="-6" r="13" fill="#5e3a1e" stroke="' + CONTOUR + '" stroke-width="5"/><circle cx="30" cy="-6" r="13" fill="#5e3a1e" stroke="' + CONTOUR + '" stroke-width="5"/><circle cx="-30" cy="-6" r="4" fill="' + CONTOUR + '"/><circle cx="30" cy="-6" r="4" fill="' + CONTOUR + '"/></g>',
  etal: '<g><path d="M-44,2 L-44,-70 M44,2 L44,-70" stroke="' + CONTOUR + '" stroke-width="8" stroke-linecap="round"/><path d="M-44,2 L-44,-70 M44,2 L44,-70" stroke="#8a5a33" stroke-width="4" stroke-linecap="round"/><rect x="-46" y="-34" width="92" height="30" rx="4" fill="#c08a4a" stroke="' + CONTOUR + '" stroke-width="5"/><circle cx="-24" cy="-40" r="8" fill="#e5484d" stroke="' + CONTOUR + '" stroke-width="3"/><circle cx="-6" cy="-41" r="8" fill="#f6d23a" stroke="' + CONTOUR + '" stroke-width="3"/><circle cx="14" cy="-40" r="8" fill="#5fcf86" stroke="' + CONTOUR + '" stroke-width="3"/><circle cx="30" cy="-41" r="7" fill="#e8693c" stroke="' + CONTOUR + '" stroke-width="3"/><path d="M-54,-70 L54,-70 L48,-90 L-48,-90 Z" fill="#fff" stroke="' + CONTOUR + '" stroke-width="5" stroke-linejoin="round"/><path d="M-36,-90 L-40,-70 M-12,-90 L-13,-70 M12,-90 L13,-70 M36,-90 L40,-70" stroke="#e5484d" stroke-width="9"/><path d="M-54,-70 L54,-70 L48,-90 L-48,-90 Z" fill="none" stroke="' + CONTOUR + '" stroke-width="5" stroke-linejoin="round"/></g>',
  chien: '<g><ellipse cx="0" cy="-10" rx="34" ry="14" fill="#e8d7ae" stroke="' + CONTOUR + '" stroke-width="5"/><ellipse cx="-12" cy="-12" rx="10" ry="8" fill="#3b2a1e"/><circle cx="24" cy="-14" r="11" fill="#e8d7ae" stroke="' + CONTOUR + '" stroke-width="5"/><path d="M18,-24 C14,-30 22,-32 24,-25 Z" fill="#3b2a1e" stroke="' + CONTOUR + '" stroke-width="3"/><path d="M20,-14 l4,1 M26,-15 l4,1" stroke="' + CONTOUR + '" stroke-width="2.5" stroke-linecap="round"/><path d="M-34,-8 C-44,-14 -42,-24 -36,-22" stroke="' + CONTOUR + '" stroke-width="5" fill="none" stroke-linecap="round"/><text x="34" y="-34" font-size="16" fill="#eef0ff" font-family="sans-serif">z</text></g>',
  arche: '<g><path d="M-58,4 L-58,-90 C-58,-150 58,-150 58,-90 L58,4 L36,4 L36,-86 C36,-120 -36,-120 -36,-86 L-36,4 Z" fill="#8f8aa6" stroke="' + CONTOUR + '" stroke-width="5" stroke-linejoin="round"/><path d="M-36,4 L-36,-86 C-36,-120 36,-120 36,-86 L36,4 Z" fill="#14112a" opacity=".85"/><path d="M-50,-40 L-44,-40 M-50,-70 L-44,-70 M44,-56 L50,-56" stroke="' + CONTOUR + '" stroke-width="3"/></g>'
};
var GENRE_P = {caisse:'bloc', tonneau:'bloc', foin:'bloc', rocher:'bloc', poule:'bloc', roule:'bloc', haie:'bloc', charrette:'bloc', etal:'bloc', tronc:'bas', barriere:'bas', chien:'bas', flaque:'bas', linge:'haut', branche:'haut', boost:'boost', arche:'arche'};
/* --- Variante « forêt » (params.decor = 'foret') : mêmes obstacles, mêmes genres (donc mêmes gestes),
   autres dessins. Ex. E1 : poursuivre le petit chien noir et blanc entre les arbres (params.fuyard = 'chien'). --- */
var FORET_P = {
  /* à sauter (bas) : racines, tronc couché, flaque de boue */
  barriere: '<g><path d="M-60,4 C-52,-32 -22,-36 0,-18 C22,-36 52,-32 60,4" stroke="' + CONTOUR + '" stroke-width="17" fill="none" stroke-linecap="round"/><path d="M-60,4 C-52,-32 -22,-36 0,-18 C22,-36 52,-32 60,4" stroke="#7a4e2c" stroke-width="10" fill="none" stroke-linecap="round"/><path d="M-40,-24 C-34,-28 -26,-28 -20,-24 M22,-26 C28,-29 36,-28 40,-22" stroke="#b07a4a" stroke-width="3" fill="none" stroke-linecap="round"/><path d="M-6,-14 C-2,-20 6,-20 8,-14" stroke="#3c9a62" stroke-width="5" fill="none" stroke-linecap="round"/></g>',
  chien: '<g><path d="M-54,4 C-44,-28 -10,-28 4,4 M-4,4 C12,-24 42,-24 54,4" stroke="' + CONTOUR + '" stroke-width="15" fill="none" stroke-linecap="round"/><path d="M-54,4 C-44,-28 -10,-28 4,4 M-4,4 C12,-24 42,-24 54,4" stroke="#8a5a33" stroke-width="8" fill="none" stroke-linecap="round"/><circle cx="-26" cy="-20" r="5" fill="#3c9a62"/><circle cx="28" cy="-18" r="4" fill="#3c9a62"/></g>',
  /* à se baisser (haut) : liane qui pend (la branche basse reste la même) */
  linge: '<g><path d="M-64,-116 C-24,-126 20,-106 64,-118" stroke="' + CONTOUR + '" stroke-width="14" fill="none" stroke-linecap="round"/><path d="M-64,-116 C-24,-126 20,-106 64,-118" stroke="#6b4426" stroke-width="8" fill="none" stroke-linecap="round"/>' +
    '<path d="M-40,-118 C-46,-96 -34,-84 -40,-64 M-8,-114 C-14,-92 -2,-80 -8,-58 M26,-116 C20,-96 32,-84 26,-66 M48,-118 C44,-102 52,-92 48,-80" stroke="' + CONTOUR + '" stroke-width="8" fill="none" stroke-linecap="round"/>' +
    '<path d="M-40,-118 C-46,-96 -34,-84 -40,-64 M-8,-114 C-14,-92 -2,-80 -8,-58 M26,-116 C20,-96 32,-84 26,-66 M48,-118 C44,-102 52,-92 48,-80" stroke="#3c9a62" stroke-width="4.5" fill="none" stroke-linecap="round"/>' +
    '<ellipse cx="-40" cy="-64" rx="7" ry="5" fill="#5fcf86" stroke="' + CONTOUR + '" stroke-width="2.5"/><ellipse cx="-8" cy="-58" rx="7" ry="5" fill="#5fcf86" stroke="' + CONTOUR + '" stroke-width="2.5"/><ellipse cx="26" cy="-66" rx="7" ry="5" fill="#5fcf86" stroke="' + CONTOUR + '" stroke-width="2.5"/><ellipse cx="-36" cy="-92" rx="6" ry="4" fill="#5fcf86"/><ellipse cx="-12" cy="-88" rx="6" ry="4" fill="#5fcf86"/><ellipse cx="30" cy="-94" rx="6" ry="4" fill="#5fcf86"/></g>',
  /* à éviter (bloc) : rocher moussu, souche, buisson, gros rochers, cercle de champignons, hérisson, rondin qui roule */
  caisse: '<g><path d="M-38,2 C-44,-20 -28,-46 -4,-48 C22,-50 40,-30 38,-8 C38,-2 36,2 32,2 Z" fill="#6f7a6a" stroke="' + CONTOUR + '" stroke-width="5"/><path d="M-30,-30 C-18,-46 10,-50 26,-36 C16,-30 -12,-26 -30,-30 Z" fill="#3c9a62" stroke="' + CONTOUR + '" stroke-width="3"/></g>',
  tonneau: '<g><path d="M-36,2 C-30,-2 -28,-6 -26,-10 L-24,-44 C-10,-50 10,-50 24,-44 L26,-10 C28,-6 30,-2 36,2 Z" fill="#8a5a33" stroke="' + CONTOUR + '" stroke-width="5" stroke-linejoin="round"/><ellipse cx="0" cy="-44" rx="24" ry="8" fill="#d9a066" stroke="' + CONTOUR + '" stroke-width="4"/><ellipse cx="0" cy="-44" rx="13" ry="4" fill="none" stroke="#a8743f" stroke-width="2.5"/><path d="M-12,-36 L-12,-6 M8,-34 L8,-4" stroke="#6b4426" stroke-width="3"/></g>',
  foin: '<g><path d="M-46,2 C-52,-22 -36,-46 -16,-42 C-8,-58 18,-58 26,-42 C44,-46 54,-22 46,2 Z" fill="#2f7a4c" stroke="' + CONTOUR + '" stroke-width="5"/><path d="M-26,-22 C-20,-30 -10,-30 -6,-22 M8,-32 C14,-40 24,-38 28,-30" stroke="#5fcf86" stroke-width="4" fill="none" stroke-linecap="round"/><circle cx="-30" cy="-8" r="4" fill="#e5484d"/><circle cx="20" cy="-14" r="4" fill="#e5484d"/></g>',
  charrette: '<g><path d="M-46,2 C-52,-24 -36,-58 -6,-60 C24,-62 46,-40 44,-10 C44,-4 42,2 38,2 Z" fill="#7d7a92" stroke="' + CONTOUR + '" stroke-width="5"/><path d="M14,2 C10,-14 22,-30 38,-28 C52,-26 58,-12 54,2 Z" fill="#6f7a6a" stroke="' + CONTOUR + '" stroke-width="5"/><path d="M-36,-40 C-22,-56 4,-60 22,-50 C10,-44 -18,-38 -36,-40 Z" fill="#3c9a62" stroke="' + CONTOUR + '" stroke-width="3"/></g>',
  etal: '<g><ellipse cx="0" cy="0" rx="50" ry="11" fill="#2f5a3a" opacity=".8"/>' +
    '<path d="M-38,0 L-38,-16 M-12,-2 L-12,-28 M14,-2 L14,-20 M36,0 L36,-14" stroke="' + CONTOUR + '" stroke-width="10" stroke-linecap="round"/><path d="M-38,0 L-38,-16 M-12,-2 L-12,-28 M14,-2 L14,-20 M36,0 L36,-14" stroke="#f3e7cb" stroke-width="5" stroke-linecap="round"/>' +
    '<path d="M-52,-14 C-50,-30 -26,-30 -24,-14 Z M-30,-26 C-28,-48 4,-48 6,-26 Z M0,-18 C2,-36 26,-36 28,-18 Z M24,-12 C26,-28 46,-28 48,-12 Z" fill="#e5484d" stroke="' + CONTOUR + '" stroke-width="4" stroke-linejoin="round"/>' +
    '<circle cx="-16" cy="-38" r="3" fill="#fff"/><circle cx="-4" cy="-34" r="2.6" fill="#fff"/><circle cx="12" cy="-28" r="2.6" fill="#fff"/><circle cx="-40" cy="-22" r="2.4" fill="#fff"/><circle cx="36" cy="-20" r="2.4" fill="#fff"/></g>',
  poule: '<g><path d="M-26,-2 C-30,-26 -10,-42 10,-38 C26,-34 32,-20 28,-2 Z" fill="#8a6a4a" stroke="' + CONTOUR + '" stroke-width="5"/>' +
    '<path d="M-24,-14 l-8,-6 M-20,-26 l-6,-9 M-10,-34 l-2,-11 M2,-38 l3,-11 M14,-36 l7,-9 M-14,-20 l-6,-7 M-2,-28 l0,-9 M10,-26 l5,-8" stroke="' + CONTOUR + '" stroke-width="3" stroke-linecap="round"/>' +
    '<path d="M22,-20 C30,-24 40,-18 40,-10 C36,-4 26,-4 22,-8 Z" fill="#e8d7ae" stroke="' + CONTOUR + '" stroke-width="3.5"/><circle cx="40" cy="-11" r="2.6" fill="' + CONTOUR + '"/><circle cx="31" cy="-15" r="2" fill="' + CONTOUR + '"/><path d="M-8,-2 L-10,6 M10,-2 L12,6" stroke="' + CONTOUR + '" stroke-width="4" stroke-linecap="round"/></g>',
  roule: '<g class="mja-roule"><circle cx="0" cy="-28" r="30" fill="#8a5a33" stroke="' + CONTOUR + '" stroke-width="5"/><circle cx="0" cy="-28" r="22" fill="#d9a066" stroke="' + CONTOUR + '" stroke-width="3"/><circle cx="0" cy="-28" r="14" fill="none" stroke="#a8743f" stroke-width="3"/><circle cx="0" cy="-28" r="6" fill="none" stroke="#a8743f" stroke-width="3"/><path d="M0,-50 L0,-40" stroke="#6b4426" stroke-width="3"/></g>',
  /* le raccourci : des arches de bois couvertes de feuilles (et le buisson du milieu reste la haie) */
  arche: '<g><path d="M-58,4 L-58,-90 C-58,-150 58,-150 58,-90 L58,4 L36,4 L36,-86 C36,-120 -36,-120 -36,-86 L-36,4 Z" fill="#6b4a2e" stroke="' + CONTOUR + '" stroke-width="5" stroke-linejoin="round"/><path d="M-36,4 L-36,-86 C-36,-120 36,-120 36,-86 L36,4 Z" fill="#0c1a12" opacity=".85"/>' +
    '<circle cx="-46" cy="-112" r="18" fill="#2f7a4c" stroke="' + CONTOUR + '" stroke-width="4"/><circle cx="-14" cy="-140" r="20" fill="#3c9a62" stroke="' + CONTOUR + '" stroke-width="4"/><circle cx="20" cy="-138" r="18" fill="#2f7a4c" stroke="' + CONTOUR + '" stroke-width="4"/><circle cx="48" cy="-110" r="17" fill="#3c9a62" stroke="' + CONTOUR + '" stroke-width="4"/><path d="M-50,-40 L-44,-40 M-50,-70 L-44,-70 M44,-56 L50,-56" stroke="#4a3220" stroke-width="3"/></g>'
};
/* le petit chien noir et blanc qui s'enfuit, de profil (pattes et queue animées dans la boucle de jeu) */
function chienSVG(){
  var patte = function(cls, x, y, c){ return '<g transform="translate(' + x + ',' + y + ')"><g class="' + cls + '"><path d="M0,0 L-2,15" stroke="' + CONTOUR + '" stroke-width="8" stroke-linecap="round"/><path d="M0,0 L-2,15" stroke="' + c + '" stroke-width="4" stroke-linecap="round"/></g></g>'; };
  return '<g class="mja-fuyard-corps mja-chien"><g transform="scale(1.15)">' +
    '<g transform="translate(-22,-27)"><g class="ch-queue"><path d="M0,0 C-8,-4 -14,-14 -10,-24" stroke="' + CONTOUR + '" stroke-width="8" fill="none" stroke-linecap="round"/><path d="M0,0 C-8,-4 -14,-14 -10,-24" stroke="#f4f1ea" stroke-width="4" fill="none" stroke-linecap="round"/><path d="M-11,-18 C-13,-21 -12,-24 -10,-24" stroke="#1d1a22" stroke-width="4" fill="none" stroke-linecap="round"/></g></g>' +
    patte('ch-ar2', -14, -16, '#1d1a22') + patte('ch-av2', 14, -16, '#f4f1ea') +
    '<ellipse cx="0" cy="-23" rx="24" ry="12" fill="#f4f1ea" stroke="' + CONTOUR + '" stroke-width="4"/>' +
    '<path d="M-18,-30 C-10,-37 6,-36 10,-28 C4,-20 -8,-19 -16,-24 Z" fill="#1d1a22"/>' +
    patte('ch-ar1', -16, -15, '#1d1a22') + patte('ch-av1', 16, -15, '#f4f1ea') +
    '<g transform="translate(22,-34)"><g class="ch-tete">' +
      '<ellipse cx="3" cy="1" rx="13" ry="11" fill="#f4f1ea" stroke="' + CONTOUR + '" stroke-width="4"/>' +
      '<path d="M-7,-5 C-3,-12 7,-12 11,-6 C9,1 1,3 -5,0 Z" fill="#1d1a22"/>' +
      '<ellipse cx="15" cy="5" rx="7" ry="5" fill="#f4f1ea" stroke="' + CONTOUR + '" stroke-width="3"/><circle cx="21" cy="3.5" r="3" fill="#1d1a22"/>' +
      '<circle cx="6" cy="-2" r="2.4" fill="#fff"/><circle cx="6.5" cy="-2" r="1.4" fill="#1d1a22"/>' +
      '<path d="M-6,-8 C-15,-10 -15,6 -8,7 C-5,3 -4,-3 -6,-8 Z" fill="#1d1a22" stroke="' + CONTOUR + '" stroke-width="2.5"/>' +
      '<path d="M12,11 C13,16 18,16 19,12" fill="#ff8fb3" stroke="' + CONTOUR + '" stroke-width="2"/>' +
    '</g></g></g></g>';
}
/* pattes qui galopent, queue qui frétille : appelé à chaque image avec le temps t (s) */
function animerChien(g, t, vite){
  if(!g) return;
  var ph = t * (vite || 1) * 15;
  var q = g.__q || (g.__q = {a1:g.querySelector('.ch-av1'), a2:g.querySelector('.ch-av2'), r1:g.querySelector('.ch-ar1'), r2:g.querySelector('.ch-ar2'), qu:g.querySelector('.ch-queue'), te:g.querySelector('.ch-tete')});
  if(q.a1) q.a1.setAttribute('transform', 'rotate(' + (38 * Math.sin(ph)).toFixed(1) + ')');
  if(q.a2) q.a2.setAttribute('transform', 'rotate(' + (38 * Math.sin(ph + 1.2)).toFixed(1) + ')');
  if(q.r1) q.r1.setAttribute('transform', 'rotate(' + (-38 * Math.sin(ph + .4)).toFixed(1) + ')');
  if(q.r2) q.r2.setAttribute('transform', 'rotate(' + (-38 * Math.sin(ph + 1.6)).toFixed(1) + ')');
  if(q.qu) q.qu.setAttribute('transform', 'rotate(' + (24 * Math.sin(t * 22)).toFixed(1) + ')');
  if(q.te) q.te.setAttribute('transform', 'translate(0,' + (1.5 * Math.sin(ph * 2)).toFixed(1) + ')');
}
var HZ = 168, BAS = 470;
function projette(p){ var e = Math.pow(fixe(p, 0, 1.3), 1.7); return {e:e, y:HZ + (BAS - HZ) * e, s:0.07 + 0.93 * e}; }
var LANE_H = [168, 180, 192], LANE_B = [62, 180, 298];
function laneX(l, e){ var a = Math.floor(fixe(l, 0, 2)), b = Math.min(2, a + 1), f = l - a; var xa = LANE_H[a] + (LANE_B[a] - LANE_H[a]) * e, xb = LANE_H[b] + (LANE_B[b] - LANE_H[b]) * e; return xa + (xb - xa) * f; }
function routeSVG(id, decor){
  if(decor === 'foret') return foretSVG(id);
  var s = '<defs><linearGradient id="' + id + 'ciel" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#141038"/><stop offset=".55" stop-color="#3b2a6a"/><stop offset=".85" stop-color="#7a4a86"/><stop offset="1" stop-color="#e08a6a"/></linearGradient>' +
    '<linearGradient id="' + id + 'sol" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2c4a3a"/><stop offset="1" stop-color="#12261f"/></linearGradient>' +
    '<linearGradient id="' + id + 'rt" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7a5e4a"/><stop offset="1" stop-color="#b48a62"/></linearGradient></defs>' +
    '<rect x="' + DEC.x + '" y="' + DEC.y + '" width="' + DEC.w + '" height="' + (HZ - DEC.y) + '" fill="url(#' + id + 'ciel)"/>';
  for(var i = 0; i < 30; i++) s += '<circle class="mja-etoile" cx="' + U.rand(-230, 590).toFixed(0) + '" cy="' + U.rand(-210, 110).toFixed(0) + '" r="' + U.rand(.8, 1.8).toFixed(1) + '" fill="#eef0ff" style="animation-delay:-' + U.rand(0, 3).toFixed(1) + 's"/>';
  s += '<circle cx="290" cy="58" r="26" fill="#fff4d0" opacity=".92"/><circle cx="290" cy="58" r="44" fill="#fff4d0" opacity=".12"/>' +
    '<path d="M-240,' + HZ + ' L-240,120 L-200,100 L-150,130 L-100,96 L-50,126 L0,104 L30,96 L58,128 L92,84 L130,130 L160,108 L200,132 L240,92 L280,128 L320,100 L360,126 L400,96 L450,124 L500,102 L560,128 L600,110 L600,' + HZ + ' Z" fill="#241d44"/>' +
    '<path d="M-240,' + HZ + ' L-240,146 C-120,136 -40,150 60,142 C140,136 220,150 300,142 C400,134 500,148 600,140 L600,' + HZ + ' Z" fill="#1a2a2e"/>' +
    '<rect x="' + DEC.x + '" y="' + HZ + '" width="' + DEC.w + '" height="' + (DEC.y + DEC.h - HZ) + '" fill="url(#' + id + 'sol)"/>' +
    '<path d="M' + (LANE_H[0] - 14) + ',' + HZ + ' L' + (LANE_H[2] + 14) + ',' + HZ + ' L560,720 L-200,720 Z" fill="url(#' + id + 'rt)" stroke="' + CONTOUR + '" stroke-width="3"/>' +
    '<path d="M' + (LANE_H[0] - 14) + ',' + HZ + ' L-200,720 M' + (LANE_H[2] + 14) + ',' + HZ + ' L560,720" stroke="#5e4634" stroke-width="5"/>';
  return s;
}
/* la forêt au crépuscule : lumière verte et dorée, rangées de sapins à l'horizon, sol de mousse, sentier de terre, lucioles */
function foretSVG(id){
  var s = '<defs><linearGradient id="' + id + 'ciel" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0d2219"/><stop offset=".5" stop-color="#244a33"/><stop offset=".82" stop-color="#5f7a3e"/><stop offset="1" stop-color="#d9a65a"/></linearGradient>' +
    '<linearGradient id="' + id + 'sol" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2a4a2c"/><stop offset="1" stop-color="#0f1f15"/></linearGradient>' +
    '<linearGradient id="' + id + 'rt" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#5a4430"/><stop offset="1" stop-color="#8f6e48"/></linearGradient></defs>' +
    '<rect x="' + DEC.x + '" y="' + DEC.y + '" width="' + DEC.w + '" height="' + (HZ - DEC.y) + '" fill="url(#' + id + 'ciel)"/>' +
    '<circle cx="250" cy="132" r="34" fill="#ffe3a3" opacity=".55"/><circle cx="250" cy="132" r="64" fill="#ffe3a3" opacity=".12"/>';
  for(var i = 0; i < 26; i++) s += '<circle class="mja-etoile" cx="' + U.rand(-230, 590).toFixed(0) + '" cy="' + U.rand(-120, HZ + 140).toFixed(0) + '" r="' + U.rand(1.2, 2.4).toFixed(1) + '" fill="#d8ff8a" style="animation-delay:-' + U.rand(0, 3).toFixed(1) + 's"/>';
  var rang = function(y0, h, pas, coul){ var d = 'M-240,' + HZ; for(var x = -240; x <= 600; x += pas){ d += ' L' + x + ',' + (y0 - U.rand(h * .5, h)).toFixed(0) + ' L' + (x + pas / 2) + ',' + y0; } return '<path d="' + d + ' L600,' + HZ + ' Z" fill="' + coul + '"/>'; };
  s += rang(HZ - 14, 70, 34, '#15301f') + rang(HZ, 46, 26, '#0e2417') +
    '<rect x="' + DEC.x + '" y="' + HZ + '" width="' + DEC.w + '" height="' + (DEC.y + DEC.h - HZ) + '" fill="url(#' + id + 'sol)"/>' +
    '<path d="M' + (LANE_H[0] - 14) + ',' + HZ + ' L' + (LANE_H[2] + 14) + ',' + HZ + ' L560,720 L-200,720 Z" fill="url(#' + id + 'rt)" stroke="' + CONTOUR + '" stroke-width="3"/>' +
    '<path d="M' + (LANE_H[0] - 14) + ',' + HZ + ' L-200,720 M' + (LANE_H[2] + 14) + ',' + HZ + ' L560,720" stroke="#2f4a2a" stroke-width="7"/>';
  return s;
}
function silhouetteSVG(){
  return '<g class="mja-fuyard-corps"><path d="M-15,0 C-17,-20 -13,-40 0,-48 C13,-40 17,-20 15,0 Z" fill="#1d1730" stroke="' + CONTOUR + '" stroke-width="3"/><path d="M-14,-4 l-9,7 M14,-4 l9,7 M-11,-22 l-11,3 M11,-22 l11,3" stroke="#1d1730" stroke-width="5" stroke-linecap="round"/><path d="M-10,-40 C-6,-50 6,-50 10,-40" stroke="#3b2a6a" stroke-width="3" fill="none"/><circle cx="-4" cy="-38" r="2" fill="#ffd36a"/><circle cx="4" cy="-38" r="2" fill="#ffd36a"/></g>';
}
MJ.enregistrer('poursuite', {
  nom:'Course-poursuite', role:'pisteur', ic:'🏃',
  consigne:function(p){ return 'Rattrape ' + (p && p.fuyard === 'chien' ? 'le petit chien' : 'la silhouette') + ' en glissant ton doigt : à gauche ou à droite pour changer de couloir, vers le haut pour sauter, vers le bas pour glisser !'; },
  /* dessins réutilisés par l'écran d'accueil (mj-regles.js) : le chien et les obstacles de la forêt */
  art:{chien:chienSVG, animerChien:animerChien, foret:FORET_P},
  minuteur:false,
  reglages: function(n, mods){
    var p = {niveau:n};
    var lent = (mods.lent || 1) / (1 + 0.05 * Math.min(4, mods.temps || 0));
    p.approche = courbe(n, {1:2.2, 3:1.82, 5:1.78, 9:1.62, 12:1.52}) / lent;
    p.intervalle = courbe(n, {1:1.3, 3:0.96, 5:0.88, 9:0.74, 12:0.66}) / lent * (1 - 0.1 * fixe(mods.obstacles || 0, -4, 3));
    p.saut = 0.66 * (mods.zone || 1);
    p.grace = 0.035 * ((mods.zone || 1) - 1) * 3;
    p.aDistance = 2;
    p.perdu = 3 + (mods.erreurs || 0);
    p.rattrape = (mods.vitesse || 0) > 0 ? 8 : 10;
    p.aide = (mods.aide || 0) > 0;
    p.conseils = (mods.aide || 0) * 6;
    p.revele = !!mods.revele;
    p.raccourci = n >= 4 ? courbe(n, {4:0.04, 9:0.07}) : 0;
    p.poids = {un:3, deux:courbe(n, {1:2, 6:3}), saut:1.6, bas1:1.6, glisse:n >= 2 ? 1.6 : 0, poule:n >= 3 ? 1.2 : 0, mixteS:n >= 3 ? courbe(n, {3:1, 8:2}) : 0,
      enchaine:n >= 3 ? courbe(n, {3:0.8, 6:1.6, 9:2.4}) : 0, roule:n >= 4 ? 1 : 0, mixteG:n >= 5 ? 1.4 : 0, triple:n >= 7 ? courbe(n, {7:0.8, 10:1.6}) : 0};
    var noms = {un:'📦', deux:'🚧', saut:'⤒', bas1:'🐕', glisse:'⤓', poule:'🐔', mixteS:'🔀', enchaine:'⚡', roule:'🛢️', mixteG:'🧺', triple:'🏪'};
    p.lignes = [
      {nom:'Vitesse de course', val:n <= 5 ? 'normale' : (n <= 8 ? 'un peu plus rapide' : 'rapide')},
      {nom:'Obstacles', val:Object.keys(p.poids).filter(function(k){ return p.poids[k] > 0; }).map(function(k){ return noms[k]; }).join(' ')},
      {nom:'Obstacles serrés', val:p.intervalle > 1.1 ? 'un peu' : (p.intervalle > 0.85 ? 'beaucoup' : 'énormément')},
      {nom:'Pour la rattraper', val:'2 fois ' + p.rattrape + ' obstacles sans faute'},
      {nom:'Elle s\'échappe si', val:'tu prends ' + p.perdu + ' pas de retard'}
    ];
    return p;
  },
  demo: function(el){
    var d = demoScene(el, '<rect x="-60" width="420" height="170" fill="#2c4a3a"/><path d="M140,10 L160,10 L270,170 L30,170 Z" fill="#a37c5a" stroke="' + CONTOUR + '" stroke-width="3"/><path d="M147,10 L105,170 M153,10 L195,170" stroke="#e8d7ae" stroke-width="2" stroke-dasharray="8 8"/>');
    d.contenu.innerHTML = '<g class="mja-obs-demo">' + OBSTACLES_P.barriere + '</g><g class="mja-obs-demo2">' + OBSTACLES_P.charrette + '</g><g class="mja-coureur-demo"><circle cx="0" cy="-26" r="11" fill="#5fcf86" stroke="' + CONTOUR + '" stroke-width="4"/><path d="M-14,-12 C-14,-22 14,-22 14,-12 L12,8 L-12,8 Z" fill="#3a8a5a" stroke="' + CONTOUR + '" stroke-width="4"/></g>';
    var obs = d.contenu.querySelector('.mja-obs-demo'), obs2 = d.contenu.querySelector('.mja-obs-demo2'), cour = d.contenu.querySelector('.mja-coureur-demo');
    function placer(o, x, y, s, ms){ o.style.transition = 'transform ' + (ms || 0) + 'ms linear, opacity .2s'; o.style.transform = 'translate(' + x + 'px,' + y + 'px) scale(' + s + ')'; }
    return scenario([
      [10, function(){ obs.style.opacity = '0'; obs2.style.opacity = '1'; placer(obs2, 150, 20, 0.12); placer(cour, 150, 160, 1); d.vers(150, 160, 0); placer(obs, 225, 20, 0.12); }],
      [150, function(){ placer(obs2, 150, 160, 1.1, 1200); obs.style.opacity = '1'; placer(obs, 225, 160, 1.1, 1700); }],
      [550, function(){ d.vers(150, 140, 0); d.appuie(true); d.vers(230, 140, 300); }],
      [280, function(){ d.appuie(false); placer(cour, 225, 160, 1, 160); U.son('pas'); }],
      [650, function(){ d.vers(225, 150, 0); d.appuie(true); d.vers(225, 90, 300); }],
      [280, function(){ d.appuie(false); placer(cour, 225, 112, 1, 200); U.son('pas'); }],
      [380, function(){ placer(cour, 225, 160, 1, 220); obs2.style.opacity = '0'; }],
      [500, function(){ obs.style.opacity = '0'; }]
    ], 400);
  },
  jouer: function(el, p, fin){
    var P = Partie(fin);
    var hud = creerHud(el);
    hud.el.classList.add('mja-hud-course');
    /* variante : params.fuyard = 'chien' (le petit chien noir et blanc), params.decor = 'foret' ; sinon, comme avant */
    var CHIEN = p.fuyard === 'chien', FORET = p.decor === 'foret';
    var TX = CHIEN ? {raccourci:'👀 Il prend un raccourci !', aie:'Aïe ! Il s\'éloigne…', perdue:'💨 Il s\'échappe…', attrapee:'🙌 Attrapé !', tAttrapee:'attrapé', tPerdue:'perdu',
        rate:'Le petit chien a disparu entre les arbres…', gagne:'Tu as rattrapé le petit chien !'}
      : {raccourci:'👀 Elle prend un raccourci !', aie:'Aïe ! Elle s\'éloigne…', perdue:'💨 Elle s\'échappe…', attrapee:'🙌 Attrapée !', tAttrapee:'attrapée', tPerdue:'perdue',
        rate:'La silhouette a disparu à l\'horizon…', gagne:'Tu as rattrapé la silhouette !'};
    var terrain = U.html('<div class="mja-terrain mja-poursuite' + (FORET ? ' foret' : '') + '"></div>');
    el.appendChild(terrain);
    var id = nid('po');
    terrain.innerHTML = '<svg viewBox="0 0 360 480" preserveAspectRatio="xMidYMid meet">' + routeSVG(id, FORET ? 'foret' : '') +
      '<g class="mja-bords"></g><g class="mja-tirets"></g><g class="mja-sol-obs"></g>' +
      '<g class="mja-fuyard">' + (CHIEN ? chienSVG() : silhouetteSVG()) + '<text class="mja-fuyard-ex" x="0" y="-58" text-anchor="middle">!</text></g>' +
      '<g class="mja-obstacles"></g>' +
      '<g class="mja-coureur"><ellipse class="mja-ombre-c" cx="0" cy="6" rx="30" ry="8" fill="#000" opacity=".3"/><g class="mja-coureur-corps">' +
        '<path class="mja-jambe g" d="M-10,-6 L-14,10" stroke="' + CONTOUR + '" stroke-width="9" stroke-linecap="round"/><path class="mja-jambe d" d="M10,-6 L14,10" stroke="' + CONTOUR + '" stroke-width="9" stroke-linecap="round"/>' +
        '<path d="M-26,-12 C-28,-44 -18,-62 0,-64 C18,-62 28,-44 26,-12 C14,-6 -14,-6 -26,-12 Z" fill="#2f7a4c" stroke="' + CONTOUR + '" stroke-width="5"/>' +
        '<path d="M-18,-58 C-18,-80 18,-80 18,-58 C12,-52 -12,-52 -18,-58 Z" fill="#3c9a62" stroke="' + CONTOUR + '" stroke-width="5"/>' +
        '<path d="M-6,-40 L6,-40 L4,-18 L-4,-18 Z" fill="#8a5a33" stroke="' + CONTOUR + '" stroke-width="3"/>' +
        '<path d="M14,-56 L22,-66 M18,-54 L28,-60" stroke="#8ff3ff" stroke-width="3" stroke-linecap="round"/>' +
        '<g class="mja-etoiles-choc"><path d="M-30,-80 l3,-8 l3,8 l8,3 l-8,3 l-3,8 l-3,-8 l-8,-3 Z M24,-86 l2,-6 l2,6 l6,2 l-6,2 l-2,6 l-2,-6 l-6,-2 Z" fill="#ffe3a3" stroke="' + CONTOUR + '" stroke-width="1.5"/></g>' +
      '</g></g>' +
      '<g class="mja-conseil" opacity="0"><circle r="20" fill="#14112a" stroke="#8ff3ff" stroke-width="3"/><text class="mja-conseil-t" y="8" text-anchor="middle"></text></g>' +
    '</svg>' +
    '<div class="mja-pad"><button class="mja-pb" data-k="g" type="button" aria-label="À gauche">◀</button><button class="mja-pb" data-k="h" type="button" aria-label="Sauter">⤒</button><button class="mja-pb" data-k="b" type="button" aria-label="Glisser">⤓</button><button class="mja-pb" data-k="d" type="button" aria-label="À droite">▶</button></div>';
    var svg = terrain.querySelector('svg');
    cadrer(P, svg);
    var gObs = svg.querySelector('.mja-obstacles'), gSol = svg.querySelector('.mja-sol-obs'), gBords = svg.querySelector('.mja-bords'), gTirets = svg.querySelector('.mja-tirets');
    var coureur = svg.querySelector('.mja-coureur'), corps = svg.querySelector('.mja-coureur-corps'), ombre = svg.querySelector('.mja-ombre-c'), fuyard = svg.querySelector('.mja-fuyard'), conseil = svg.querySelector('.mja-conseil'), conseilT = svg.querySelector('.mja-conseil-t');

    /* HUD discret : la rangée des pas (attrapée … perdue) et le compteur sans faute */
    var rangee = hud.badge(''); rangee.className = 'mja-pas-rangee';
    var compteur = document.createElement('div'); compteur.className = 'mja-sans-faute'; hud.el.appendChild(compteur);
    var pas = 0, sansFaute = 0;
    function majHud(anim){
      var s = '<span class="mja-pas-bout" title="' + TX.tAttrapee + '">🙌</span>';
      for(var k = -1; k < p.perdu; k++) s += '<span class="mja-pas-pt' + (k === pas ? ' ici' : '') + (k === 0 ? ' depart' : '') + '"></span>';
      s += '<span class="mja-pas-bout" title="' + TX.tPerdue + '">💨</span>';
      rangee.innerHTML = s;
      compteur.innerHTML = 'Sans faute : <b>' + sansFaute + '</b>/' + p.rattrape;
      if(anim){ compteur.classList.remove('pop'); void compteur.offsetWidth; compteur.classList.add('pop'); }
    }
    majHud();

    /* Décor qui défile */
    var arbres = [];
    for(var i = 0; i < 12; i++){
      var g = svgNoeud('g', {}, gBords);
      if(FORET && i % 2 === 1) g.innerHTML = '<path d="M0,0 L0,-56" stroke="' + CONTOUR + '" stroke-width="16"/><path d="M0,0 L0,-56" stroke="#5e3f26" stroke-width="10"/><circle cx="0" cy="-92" r="42" fill="#245e3c" stroke="' + CONTOUR + '" stroke-width="5"/><circle cx="-20" cy="-104" r="20" fill="#2f7a4c"/><circle cx="16" cy="-84" r="16" fill="#2f7a4c"/><path d="M-22,0 C-30,-14 -16,-18 -10,-8 M22,0 C30,-14 16,-18 10,-8" stroke="#3c9a62" stroke-width="5" fill="none" stroke-linecap="round"/>';
      else if(i % 4 === 3 && !FORET) g.innerHTML = '<path d="M0,0 L0,-120" stroke="' + CONTOUR + '" stroke-width="8"/><path d="M0,0 L0,-120" stroke="#3b3346" stroke-width="4"/><rect x="-11" y="-146" width="22" height="28" rx="4" fill="#ffd36a" stroke="' + CONTOUR + '" stroke-width="4"/><circle cy="-132" r="30" fill="#ffd36a" opacity=".18"/>';
      else g.innerHTML = '<path d="M0,0 L0,-30" stroke="#4a3220" stroke-width="10"/><path d="M-34,-24 L0,-120 L34,-24 Z" fill="#1f5a40" stroke="' + CONTOUR + '" stroke-width="5" stroke-linejoin="round"/><path d="M-26,-60 L0,-140 L26,-60 Z" fill="#2a7050" stroke="' + CONTOUR + '" stroke-width="5" stroke-linejoin="round"/>';
      arbres.push({g:g, p:(i % 6) / 6, cote:i < 6 ? -1 : 1, loin:(i % 2) ? 1.6 : 1});
    }
    var tirets = [];
    for(var k = 0; k < 12; k++) tirets.push({l:svgNoeud('line', {'class':'mja-tiret'}, gTirets), p:(k % 6) / 6, voie:k < 6 ? 0.5 : 1.5});
    if(FORET) tirets.forEach(function(tr){ tr.l.style.stroke = '#c9b48a'; tr.l.style.opacity = '.4'; });

    /* État */
    var voie = 1, xJ = LANE_B[1], saut = 0, glisse = 0, fini = false, t = 0, vagues = [], prochain = 1.1, nVagues = 0, etat = 'course';
    var choc = 0, invuln = 0, vitesseC = 1, fuyX = 1, fuyCible = 1, fuyChange = 2, pF = 0.38, raccourci = null, finT = 0;
    function pFcible(){ var f = fixe((pas + p.aDistance) / (p.perdu + p.aDistance), 0, 1); return 0.86 * Math.pow(1 - f, 1.6); }
    pF = pFcible();
    /* Commandes */
    function action(k){
      if(fini || etat !== 'course') return;
      if(k === 'g' || k === 'd'){
        var v = fixe(voie + (k === 'g' ? -1 : 1), 0, 2);
        if(v !== voie){ voie = v; U.son('pas'); }
        else { corps.classList.remove('bute'); void corps.getBoundingClientRect(); corps.classList.add('bute'); }
      } else if(k === 'h'){ if(saut <= 0 && glisse <= 0){ saut = p.saut; U.son('pas'); } }
      else if(k === 'b'){ if(saut <= 0.12 && glisse <= 0){ saut = 0; glisse = p.saut; U.son('pas'); } }
    }
    terrain.querySelectorAll('.mja-pb').forEach(function(b){ P.ecoute(b, 'pointerdown', function(e){ e.preventDefault(); e.stopPropagation(); action(b.getAttribute('data-k')); }); });
    var geste = null;
    P.ecoute(svg, 'pointerdown', function(e){ e.preventDefault(); geste = {x:e.clientX, y:e.clientY, fait:false, id:e.pointerId}; try{ svg.setPointerCapture(e.pointerId); }catch(er){} });
    P.ecoute(svg, 'pointermove', function(e){
      if(!geste || geste.fait || e.pointerId !== geste.id) return;
      var dx = e.clientX - geste.x, dy = e.clientY - geste.y;
      if(Math.max(Math.abs(dx), Math.abs(dy)) > 24){ geste.fait = true; action(Math.abs(dx) > Math.abs(dy) ? (dx < 0 ? 'g' : 'd') : (dy < 0 ? 'h' : 'b')); }
    });
    P.ecoute(svg, 'pointerup', function(e){
      if(geste && !geste.fait){ var r = svg.getBoundingClientRect(); action(e.clientX - r.left < r.width / 2 ? 'g' : 'd'); }
      geste = null;
    });
    P.ecoute(svg, 'pointercancel', function(){ geste = null; });
    P.ecoute(document, 'keydown', function(e){
      var kk = {ArrowLeft:'g', ArrowRight:'d', ArrowUp:'h', ArrowDown:'b'}[e.key];
      if(kk){ action(kk); e.preventDefault(); }
    });

    /* Fabrication des vagues */
    var BLOCS = ['caisse', 'tonneau', 'foin', 'rocher', 'charrette', 'etal'], BAS1 = ['flaque', 'chien', 'tronc', 'barriere'];
    function objet(type, voieO, en){
      var o = {type:type, genre:GENRE_P[type], voie:voieO, de:voieO, vers:voieO};
      o.g = svgNoeud('g', {'class':'mja-obstacle g-' + o.genre + (p.aide ? ' tot' : '')}, (type === 'flaque' || o.genre === 'boost') ? gSol : gObs);
      o.g.innerHTML = (FORET && FORET_P[type]) || OBSTACLES_P[type];
      if(en) Object.assign(o, en);
      return o;
    }
    function choisirGenre(){
      var cles = Object.keys(p.poids).filter(function(k){ return p.poids[k] > 0; });
      var tot = cles.reduce(function(a, k){ return a + p.poids[k]; }, 0), r = Math.random() * tot;
      for(var i = 0; i < cles.length; i++){ r -= p.poids[cles[i]]; if(r <= 0) return cles[i]; }
      return 'un';
    }
    function pousser(objs, decale){ nVagues++; vagues.push({p:-(decale || 0), objs:objs, conseil:nVagues <= p.conseils || p.revele, compte:false, vit:objs.some(function(o){ return o.rapide; }) ? 1.7 : 1}); }
    function lancerVague(){
      var genre = choisirGenre(), libre = U.randInt(0, 2), autres = [0, 1, 2].filter(function(v){ return v !== libre; }), objs = [];
      if(genre === 'un') objs.push(objet(U.choix(BLOCS), U.randInt(0, 2)));
      else if(genre === 'deux') autres.forEach(function(v){ objs.push(objet(U.choix(BLOCS), v)); });
      else if(genre === 'saut'){ var tb = U.choix(['barriere', 'tronc', 'barriere']); [0, 1, 2].forEach(function(v){ objs.push(objet(tb, v)); }); }
      else if(genre === 'bas1'){ objs.push(objet(U.choix(BAS1), autres[0])); if(Math.random() < 0.5) objs.push(objet(U.choix(BAS1), autres[1])); }
      else if(genre === 'glisse'){ var tg = Math.random() < .5 ? 'linge' : 'branche'; [0, 1, 2].forEach(function(v){ objs.push(objet(tg, v)); }); }
      else if(genre === 'poule'){ var de = U.choix([0, 2]); objs.push(objet('poule', de, {de:de, vers:2 - de, mobile:true})); if(Math.random() < 0.4) objs.push(objet(U.choix(BAS1), 1)); }
      else if(genre === 'mixteS'){ objs.push(objet(U.choix(BLOCS), libre)); autres.forEach(function(v){ objs.push(objet(U.choix(['barriere', 'chien', 'flaque']), v)); }); }
      else if(genre === 'mixteG'){ objs.push(objet(U.choix(BLOCS), libre)); autres.forEach(function(v){ objs.push(objet('branche', v)); }); }
      else if(genre === 'roule') objs.push(objet('roule', U.randInt(0, 2), {rapide:1.7}));
      else if(genre === 'triple'){ autres.forEach(function(v){ objs.push(objet(U.choix(BLOCS), v)); }); pousser(objs); objs = [objet(U.choix(['linge', 'branche']), libre), objet(U.choix(BLOCS), autres[0]), objet(U.choix(BLOCS), autres[1])]; pousser(objs, 0.3); return; }
      else if(genre === 'enchaine'){
        /* changer vite de couloir… puis sauter */
        var ici = voie, cible = U.choix([0, 1, 2].filter(function(v){ return v !== ici; }));
        [0, 1, 2].filter(function(v){ return v !== cible; }).forEach(function(v){ objs.push(objet(U.choix(BLOCS), v)); });
        pousser(objs);
        pousser([0, 1, 2].map(function(v){ return objet(v === cible ? U.choix(['barriere', 'chien', 'flaque']) : U.choix(BLOCS), v); }), 0.27);
        return;
      }
      pousser(objs);
    }
    function lancerRaccourci(){
      var cote = raccourci.cote;
      pousser([objet('arche', 0, {arche:cote === 0}), objet('haie', 1), objet('arche', 2, {arche:cote === 2})]);
      vagues[vagues.length - 1].raccourci = true;
    }
    function texte(s, cls){ var q = pctDans(svg, terrain, xJ, 360); flotter(terrain, q.x, q.y, s, cls); }
    function heurte(o){
      if(invuln > 0) return;
      if(o) o.g.classList.add('casse');
      erreurSensorielle(terrain);
      corps.classList.remove('trebuche'); void corps.getBoundingClientRect(); corps.classList.add('trebuche');
      choc = 0.9; invuln = 0.9; vitesseC = 0.5;
      sansFaute = 0; pas++;
      texte(TX.aie, 'ko');
      majHud(true);
      if(pas >= p.perdu){ etat = 'perdue'; finT = 0; annonce(terrain, TX.perdue, 1300); }
    }
    function propre(){
      sansFaute++;
      U.son('tic');
      if(sansFaute >= p.rattrape){
        sansFaute = 0; pas--;
        U.son('gain'); U.vibrer(20);
        coureur.classList.remove('sprint'); void coureur.getBoundingClientRect(); coureur.classList.add('sprint');
        texte('Je me rapproche !', 'ok');
        if(pas <= -p.aDistance){ etat = 'attrape'; finT = 0; fuyard.classList.add('attrape'); U.son('victoire'); annonce(terrain, TX.attrapee, 1300); }
      }
      majHud(true);
    }
    function conseilPour(ev){
      var dans = ev.objs.filter(function(o){ return Math.round(o.voie) === voie && o.genre !== 'boost'; });
      if(ev.raccourci){ var c = raccourci ? raccourci.cote : -1; return voie === c ? '' : (c < voie ? '◀' : '▶'); }
      if(!dans.length) return '';
      if(dans.every(function(o){ return o.genre === 'bas'; })) return '⤒';
      if(dans.every(function(o){ return o.genre === 'haut'; })) return '⤓';
      var sur = [0, 1, 2].filter(function(v){ return !ev.objs.some(function(o){ return Math.round(o.voie) === v && o.genre === 'bloc'; }); });
      sur.sort(function(a, b){ return Math.abs(a - voie) - Math.abs(b - voie); });
      return sur.length ? (sur[0] < voie ? '◀' : '▶') : '';
    }
    terrain.mjaEtat = function(){ return {voie:voie, saut:saut, glisse:glisse, pas:pas, sansFaute:sansFaute, etat:etat, nVagues:nVagues, faites:faites, chocs:chocs, invuln:invuln, vagues:vagues.map(function(v){ return {p:v.p, raccourci:!!v.raccourci, objs:v.objs.map(function(o){ return {genre:o.genre, voie:Math.round(o.voie), arche:o.arche}; })}; }), cote:raccourci ? raccourci.cote : -1}; };
    var faites = 0, chocs = 0;

    var PC = 0.93;
    P.boucle(function(dt){
      if(fini) return false;
      t += dt;
      if(choc > 0) choc -= dt;
      if(invuln > 0) invuln -= dt;
      vitesseC += ((choc > 0 ? 0.5 : 1) - vitesseC) * Math.min(1, dt * 3);
      var V = vitesseC;
      /* fins : on la voit s'éloigner ou on l'attrape */
      pF += (pFcible() - pF) * Math.min(1, dt * 2.2);
      if(etat === 'perdue'){
        finT += dt; pF = Math.max(-0.05, pF - dt * 0.15);
        fuyard.style.opacity = Math.max(0, 1 - finT / 1.1).toFixed(2);
        if(finT > 1.2 && !fini){ fini = true; P.finir({reussi:false, score:0, erreurs:chocs, detail:TX.rate}, 400); }
      } else if(etat === 'attrape'){
        finT += dt; pF = Math.min(0.9, pF + dt * 1.2);
        if(finT > 1.1 && !fini){ fini = true; P.finir({reussi:true, score:1, erreurs:chocs, detail:TX.gagne}, 500); }
      }
      if(saut > 0) saut = Math.max(0, saut - dt);
      if(glisse > 0) glisse = Math.max(0, glisse - dt);
      /* raccourcis de la silhouette */
      if(etat === 'course' && !raccourci && p.raccourci && nVagues > 4 && Math.random() < p.raccourci * dt){
        var cote = U.choix([0, 2]);
        raccourci = {cote:cote, t:0};
        fuyCible = cote; fuyard.classList.add('alerte');
        annonce(terrain, TX.raccourci, 1100);
      }
      if(raccourci){ raccourci.t += dt; if(raccourci.t > 1.1 && !raccourci.lance){ raccourci.lance = true; lancerRaccourci(); } }
      else if(t > fuyChange){ fuyChange = t + U.rand(1.2, 2.6); fuyCible = U.randInt(0, 2); }
      fuyX += (fuyCible - fuyX) * Math.min(1, dt * 5);
      /* vagues : sans fin, jusqu'à l'attraper ou la perdre */
      if(etat === 'course' && !raccourci){
        prochain -= dt * V;
        if(prochain <= 0){ lancerVague(); prochain = p.intervalle * U.rand(0.85, 1.2); }
      }
      /* décor */
      arbres.forEach(function(a){
        a.p += dt * V / p.approche * 0.9; if(a.p > 1.25) a.p -= 1.25;
        var pr = projette(a.p), x = 180 + a.cote * (36 + 250 * pr.e * a.loin);
        a.g.setAttribute('transform', 'translate(' + x.toFixed(1) + ',' + pr.y.toFixed(1) + ') scale(' + (pr.s * 1.1).toFixed(3) + ')');
        a.g.style.opacity = a.p < 0.05 ? a.p / 0.05 : 1;
      });
      tirets.forEach(function(tr){
        tr.p += dt * V / p.approche; if(tr.p > 1.2) tr.p -= 1.2;
        var a = projette(tr.p), b = projette(tr.p + 0.06);
        tr.l.setAttribute('x1', laneX(tr.voie, a.e).toFixed(1)); tr.l.setAttribute('y1', a.y.toFixed(1)); tr.l.setAttribute('x2', laneX(tr.voie, b.e).toFixed(1)); tr.l.setAttribute('y2', b.y.toFixed(1));
        tr.l.setAttribute('stroke-width', (1 + 5 * a.e).toFixed(1));
      });
      /* coureur */
      xJ += (LANE_B[voie] - xJ) * Math.min(1, dt * 16);
      var haut = saut > 0 ? Math.sin(Math.PI * (1 - saut / p.saut)) * 64 : 0;
      var rebond = saut > 0 || glisse > 0 ? 0 : Math.abs(Math.sin(t * 11 * V)) * 5;
      var avance = etat === 'attrape' ? Math.min(1, finT / 0.9) * 150 : 0;
      coureur.setAttribute('transform', 'translate(' + xJ.toFixed(1) + ',' + (452 - avance).toFixed(1) + ') scale(' + (1 - avance / 400).toFixed(3) + ')');
      corps.setAttribute('transform', 'translate(0,' + (-haut - rebond).toFixed(1) + ')' + (glisse > 0 ? ' translate(0,8) scale(1.12,.52) rotate(-8)' : '') + (choc > 0 ? ' rotate(' + (Math.sin(t * 30) * 8).toFixed(1) + ')' : ''));
      ombre.setAttribute('rx', (30 - haut * 0.2).toFixed(1));
      coureur.classList.toggle('pas2', Math.sin(t * 11 * V) > 0 && !saut && !glisse);
      /* silhouette : plus loin = plus petite et plus haut sur la route */
      var prF = projette(Math.max(0, pF));
      var cache = raccourci && raccourci.disparu;
      if(etat !== 'perdue') fuyard.style.opacity = cache ? '0' : '1';
      var xF = etat === 'attrape' ? xJ : laneX(fuyX, prF.e);
      fuyard.setAttribute('transform', 'translate(' + xF.toFixed(1) + ',' + (prF.y + 4 - Math.abs(Math.sin(t * 9)) * 2).toFixed(1) + ') scale(' + (0.55 + prF.s * 1.6).toFixed(3) + ')');
      if(CHIEN && etat !== 'attrape') animerChien(fuyard, t, V);
      /* vagues */
      var conseilTxt = '';
      vagues.forEach(function(ev){
        ev.p += dt * V * ev.vit / p.approche;
        if(raccourci && ev.raccourci && !raccourci.disparu && ev.p > pF){ raccourci.disparu = true; fuyard.classList.remove('alerte'); }
        var pr = projette(Math.max(0, ev.p));
        ev.objs.forEach(function(o){
          if(o.mobile){ var f = lisse(fixe((ev.p - 0.25) / 0.55, 0, 1)); o.voie = o.de + (o.vers - o.de) * f; }
          var sc = pr.s * (o.genre === 'arche' || o.genre === 'haut' ? 1.05 : 1);
          o.g.setAttribute('transform', 'translate(' + laneX(o.voie, pr.e).toFixed(1) + ',' + pr.y.toFixed(1) + ') scale(' + (o.type === 'poule' && o.vers < o.de ? -sc : sc).toFixed(3) + ',' + sc.toFixed(3) + ')');
          o.g.style.opacity = ev.p < 0 ? '0' : (p.aide ? '' : (ev.p < 0.1 ? (ev.p / 0.1 * 0.6).toFixed(2) : ''));
        });
        if(!ev.compte && ev.conseil && ev.p > (p.aide ? 0.15 : 0.28) && ev.p < PC) conseilTxt = conseilPour(ev) || conseilTxt;
        if(!ev.compte && ev.p >= PC + p.grace && etat === 'course'){
          ev.compte = true;
          if(ev.raccourci){
            if(voie === raccourci.cote){ faites++; propre(); texte('Bien vu !', 'ok'); }
            else { chocs++; heurte(voie === 1 ? ev.objs[1] : null); if(voie !== 1) texte('Pas par là !', 'ko'); }
            raccourci = null; prochain = p.intervalle * 0.8;
          } else {
            var touche = null, avecObs = false;
            ev.objs.forEach(function(o){
              if(o.genre === 'boost') return;
              avecObs = true;
              if(Math.round(o.voie) !== voie) return;
              if(o.genre === 'bloc') touche = touche || o;
              else if(o.genre === 'bas' && haut < 18) touche = touche || o;
              else if(o.genre === 'haut' && glisse <= 0) touche = touche || o;
            });
            if(touche){ if(invuln <= 0){ chocs++; heurte(touche); } }
            else if(avecObs){ faites++; propre(); }
          }
        }
      });
      vagues = vagues.filter(function(ev){
        if(ev.p > 1.3){ ev.objs.forEach(function(o){ if(o.g.parentNode) o.g.parentNode.removeChild(o.g); }); return false; }
        return true;
      });
      if(conseilTxt && etat === 'course'){ conseil.setAttribute('opacity', '1'); conseilT.textContent = conseilTxt; conseil.setAttribute('transform', 'translate(' + xJ.toFixed(1) + ',' + (360 - haut).toFixed(1) + ')'); }
      else conseil.setAttribute('opacity', '0');
    });
    return {arreter: P.arreter};
  }
});
