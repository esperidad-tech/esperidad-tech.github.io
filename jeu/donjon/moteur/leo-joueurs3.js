/* leo-joueurs3.js — deux joueurs de la phase 3, pour vérifier les règles du 15 novembre (13 h 54) sans navigateur :
     node leo-joueurs3.js            (dix combats chacun ; test-leo.js s'en sert aussi)
   « bon »  : il a compris Léo — l'œil, trois coups de faux, puis la bonne parade à chaque attaque (le bouclier jaune puis la gourde
              pour la rafale, l'huile pour la charge, le marteau pour le cri, de la vie avant qu'il frappe, les herbes sur le feu) ;
   « spam » : ce que Romain a fait à son essai — la faux, puis seulement la gourde et le bouclier jaune, sans arrêt. Il doit perdre. */
var R = require('./src/regles.js'), LR = require('./src/leo-regles.js'), D = R.D, L = LR.L;
function partie(g){
  var p = R.nouvellePartie(g || 7);
  p.recettes = D.ORDRE_RECETTES.slice();
  p.heros.sage.objets.push('cristal-lune', 'baton-chene');
  return p;
}
/* retard : son temps de réaction (secondes) — il voit ce que fait Léo avec ce retard-là */
function jouer(sorte, graine, max, retard){
  var c = LR.combat(partie(graine), {phase:3}), f = {}, journal = [], vus = [];
  function agir(h, g, cible){ if(!c.libre(h)) return false; var ev = c.agir(h, g, cible); return ev[0].t !== 'refus'; }
  function part(h){ var S = c.h[h]; return S.sol ? 1 : S.pv / S.pvMax; }
  while(!c.fini() && c.t < (max || 400)){
    var Zv = c.leo;
    vus.push({att:Zv.att, etape:Zv.etape, cibles:Zv.cibles.slice(), flaque:Zv.flaque, t:c.t});
    while(vus.length > 1 && vus[1].t <= c.t - (retard || 0)) vus.shift();
    var Z = retard ? vus[0] : Zv;
    if(Z.etape === 'repos') f = {};
    if(sorte === 'spam'){
      if(c.armes.faux > 0) agir('pisteur', 'l:faux'); else agir('pisteur', 'l:gourde');
      agir('sage', 'bouclier');
    } else {
      var bas = Math.min.apply(null, D.ORDRE.map(part)), feu = D.ORDRE.some(function(h){ return !c.h[h].sol && (c.h[h].brule > 0 || c.h[h].saigne); });
      var sol = D.ORDRE.filter(function(h){ return c.h[h].sol; });
      if(!c.vu) agir('sage', 'oeil');
      /* la rafale : le bouclier jaune dès l'annonce, la gourde quand les coups commencent */
      if(Z.att === 'rafale' && (Z.etape === 'prise' || Z.etape === 'elan') && !f.b) f.b = agir('sage', 'bouclier');
      if(Z.att === 'rafale' && Z.etape === 'coups' && !f.g) f.g = agir('pisteur', 'l:gourde', Z.cibles[0]);
      /* la charge : l'huile */
      if(Z.att === 'charge' && (Z.etape === 'prise' || Z.etape === 'elan') && !f.h && !(Z.flaque > c.t)) f.h = agir('alchimiste', 'p:huile') || agir('pisteur', 'p:huile');
      /* le cri : le marteau */
      if(Z.att === 'hurlement' && (Z.etape === 'prise' || Z.etape === 'elan') && !f.m) f.m = agir('pisteur', 'l:marteau');
      /* la faux, dès que le Pisteur a le temps (jamais juste avant le cri ou la rafale) */
      var bientot = c._suite()[0], garde = (Z.att === 'rafale' || Z.att === 'hurlement') || (Z.etape === 'repos' && bientot && (bientot.att === 'rafale' || bientot.att === 'hurlement')) || (Z.etape === 'retour' && bientot && (bientot.att === 'rafale' || bientot.att === 'hurlement'));
      if(c.armes.faux > 0 && !garde) agir('pisteur', 'l:faux');
      /* les soins : un ami à terre, le feu, puis la vie (il en faut plus de la moitié quand Léo attrape) */
      if(sol.length) agir('alchimiste', 'p:coeur');
      if(feu || bas < .75) agir('alchimiste', 'herbes');
      if(bas < .5 && !garde && c.armes.faux <= 0) agir('pisteur', 'l:gourde');
      if(Z.att !== 'rafale' && (Z.att === 'souffle' || Z.att === 'poing3') && (Z.etape === 'prise' || Z.etape === 'elan')) agir('sage', 'bouclier');
    }
    var ev = c.avancer(.05);
    ev.forEach(function(e){ if(e.t === 'tombe') journal.push(Math.round(c.t) + ' s : ' + e.heros + ' tombe (' + (Zv.att || Zv.etape) + ')'); });
  }
  return {fin:c.fini() || 'trop long', t:Math.round(c.t), leo:c.leo.pv, journal:journal};
}
module.exports = {jouer:jouer};
if(require.main === module){
  [['bon', 0], ['bon', .5], ['bon', 1], ['bon', 1.5], ['spam', 0]].forEach(function(x){
    var s = x[0], l = []; for(var g = 1; g <= 10; g++) l.push(jouer(s, g, 400, x[1]));
    console.log(s + (x[1] ? ' (réagit en ' + x[1] + ' s)' : '') + ' : ' + l.filter(function(x){ return x.fin === 'victoire'; }).length + ' victoires sur ' + l.length + ' ; durées ' + l.map(function(x){ return x.t; }).join(', '));
    l.slice(0, 3).forEach(function(x){ console.log('   ' + x.fin + ' en ' + x.t + ' s, Léo ' + x.leo + ' — ' + x.journal.slice(0, 5).join(' ; ')); });
  });
}
