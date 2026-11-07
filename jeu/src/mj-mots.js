/* ==========================================================
   Brumeval — mini-jeu du Barde : « Les mots perdus »
   Le Barde n'a pas tout entendu. Il remet les mots manquants
   dans la conversation, puis valide une seule fois : un seul
   mot faux, et il n'a pas compris ce qui s'est dit.
   params : {phrases:[{qui, texte:'… [mot] …'}], pieges:[mots plausibles mais faux]}
   mods compris : aide (indices : la liste est réduite de moitié pour le mot choisi),
                  revele (un mot trouvé tout seul), erreurs (vérifications avant de valider),
                  zone (moins de mots dans la liste)
   Résultat : revision (ce que le joueur a posé, sans la solution) pour la relire après.
   ========================================================== */
(function(){
'use strict';
if(!window.MJ) return;
var U = MJ.util;
var EXEMPLE = {
  phrases:[
    {qui:'🦹', texte:'Ce [soir], tu iras chercher la [carte] toute seule.'},
    {qui:'👩', texte:'Et mes [dettes] ? Vous avez [promis] de tout payer !'},
    {qui:'🦹', texte:'Quand j\'aurai la carte, tu seras [riche]. Mais plus de rendez-vous au [lavoir].'},
    {qui:'🦹', texte:'Et mets ta [cape], que personne ne te [reconnaisse].'}
  ],
  pieges:['matin', 'lettre', 'clé', 'soupe', 'chaussures', 'oublié', 'jolie', 'moulin', 'clocher', 'robe', 'trouve', 'pauvre', 'poules', 'marché']
};
var INTRUS = ['nuage', 'chaussette', 'dragon', 'fromage', 'tambour', 'girafe', 'parapluie', 'crocodile', 'biscuit', 'trompette', 'citrouille', 'escargot', 'toboggan', 'banane'];

function decouper(texte){
  /* « Ce [soir], tu… » -> morceaux texte / trou */
  var l = [], re = /\[([^\]]+)\]/g, m, i = 0;
  while((m = re.exec(texte))){ if(m.index > i) l.push({t:texte.slice(i, m.index)}); l.push({trou:m[1]}); i = m.index + m[0].length; }
  if(i < texte.length) l.push({t:texte.slice(i)});
  return l;
}
function esc(s){ return String(s).replace(/[&<>"']/g, function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]; }); }

MJ.enregistrer('mots', {
  nom:'Les mots perdus', role:'barde', ic:'👂',
  consigne:'Tu n\'as pas tout entendu ! Remets les mots qui manquent, relis bien, puis valide : un seul mot faux, et c\'est raté.',
  reglages:function(n, mods){
    var trous = Math.round(U.parNiveau(n, 5, 10, 4, 10));
    var leurres = Math.round(U.parNiveau(n, 13, 20, 10, 22) / (mods.zone || 1));
    var pieges = U.borne(Math.round(U.parNiveau(n, 0.55, 1, 0.4, 1) * 100) / 100, 0, 1);
    var verifs = (mods.erreurs || 0);
    var indices = Math.round(mods.aide || 0), trouves = Math.round((mods.revele ? 1 : 0) + (mods.mots || 0));
    return {trous:trous, leurres:leurres, partPieges:pieges, verifs:verifs, indices:indices, aide:trouves,
      lignes:[
        {nom:'Mots qui manquent', val:String(trous)},
        {nom:'Mots en trop dans la liste', val:String(leurres)},
        {nom:'Mots pièges (qui pourraient presque aller)', val:Math.round(pieges * 100) + ' %'},
        {nom:'Vérifications avant de valider', val:verifs ? String(verifs) : 'aucune'}
      ].concat(indices ? [{nom:'Indices (la liste diminue de moitié pour un mot)', val:String(indices)}] : [])
       .concat(trouves ? [{nom:'Mots trouvés tout seuls', val:String(trouves)}] : [])};
  },
  demo:function(el){
    el.innerHTML = '<div class="mm-demo"><p>Et mes <span class="mm-trou-demo">______</span> ?</p><div class="mm-demo-mots"><span>girafe</span><span class="mm-bon">dettes</span><span>clé</span></div><span class="mm-main">👆</span></div>';
    return {arreter:function(){}};
  },
  jouer:function(el, params, fin){
    var c = (params.phrases && params.phrases.length) ? params : EXEMPLE;
    var lignes = c.phrases.map(function(l){ return {qui:l.qui || '💬', morceaux:decouper(l.texte)}; });
    /* tous les trous possibles, puis on en garde le nombre voulu */
    var tous = [];
    lignes.forEach(function(l, i){ l.morceaux.forEach(function(m, j){ if(m.trou) tous.push({l:i, m:j, mot:m.trou}); }); });
    var garder = U.melanger(tous).slice(0, Math.min(params.trous, tous.length));
    var cles = {}; garder.forEach(function(g){ cles[g.l + ':' + g.m] = true; });
    /* les trous non gardés redeviennent du texte */
    lignes.forEach(function(l, i){ l.morceaux.forEach(function(m, j){ if(m.trou && !cles[i + ':' + j]){ m.t = m.trou; delete m.trou; } }); });
    var trous = [];
    lignes.forEach(function(l, i){ l.morceaux.forEach(function(m, j){ if(m.trou){ m.id = trous.length; trous.push({id:m.id, mot:m.trou, pose:null, fixe:false}); } }); });
    /* mots déjà placés (aide) */
    U.melanger(trous).slice(0, Math.min(params.aide || 0, trous.length - 1)).forEach(function(t){ t.pose = t.mot; t.fixe = true; });
    /* la liste de mots : les bons + des pièges + des intrus */
    var bons = trous.filter(function(t){ return !t.fixe; }).map(function(t){ return t.mot; });
    var nbPieges = Math.round(params.leurres * params.partPieges);
    var pieges = U.melanger((c.pieges || []).filter(function(p){ return bons.indexOf(p) < 0; })).slice(0, nbPieges);
    var intrus = U.melanger(INTRUS).slice(0, Math.max(0, params.leurres - pieges.length));
    var banque = U.melanger(bons.concat(pieges, intrus)).map(function(m, i){ return {id:i, mot:m, utilise:null}; });
    var choisi = null, verifs = params.verifs || 0, indices = params.indices || 0, fini = false;
    var bonsMots = {}; trous.forEach(function(t){ bonsMots[t.mot] = true; });
    /* la règle des cœurs : aucune erreur permise ici (un mot faux à la validation fait perdre) → 0 cœur */
    var racine = U.html('<div class="mm"><div class="mm-coeurs">' + U.coeurs(0, 0) + '</div><div class="mm-parchemin"></div><div class="mm-info"></div><div class="mm-banque"></div>' +
      '<div class="mm-actions"><button class="btn second petit mm-relire" type="button">🔊 Relire ma phrase</button>' +
      '<button class="btn second petit mm-indice" type="button"></button>' +
      '<button class="btn second petit mm-verif" type="button"></button><button class="btn mm-valider" type="button">✔ Valider</button></div></div>');
    el.appendChild(racine);
    var parch = racine.querySelector('.mm-parchemin'), banqueEl = racine.querySelector('.mm-banque'), info = racine.querySelector('.mm-info');
    var bValider = racine.querySelector('.mm-valider'), bVerif = racine.querySelector('.mm-verif'), bIndice = racine.querySelector('.mm-indice');
    function texteActuel(){
      return lignes.map(function(l){ return l.morceaux.map(function(m){ return m.trou ? (trous[m.id].pose || '…') : m.t; }).join(''); }).join(' ');
    }
    function premierVide(){ var t = trous.filter(function(x){ return !x.pose; })[0]; return t ? t.id : null; }
    function dessiner(){
      parch.innerHTML = lignes.map(function(l){
        return '<p class="mm-ligne"><span class="mm-qui">' + l.qui + '</span><span>' + l.morceaux.map(function(m){
          if(!m.trou) return esc(m.t);
          var t = trous[m.id];
          return '<button type="button" class="mm-trou' + (t.pose ? ' plein' : '') + (t.fixe ? ' fixe' : '') + (choisi === t.id ? ' choisi' : '') + (t.faux ? ' faux' : '') + '" data-trou="' + t.id + '">' + (t.pose ? esc(t.pose) : '&nbsp;' + (t.id + 1) + '&nbsp;') + '</button>';
        }).join('') + '</span></p>';
      }).join('');
      var elim = choisi !== null && trous[choisi] && trous[choisi].elimines ? trous[choisi].elimines : {};
      banqueEl.innerHTML = banque.map(function(b){
        var off = b.utilise !== null || elim[b.id];
        return '<button type="button" class="mm-mot' + (b.utilise !== null ? ' pris' : '') + (elim[b.id] ? ' elimine' : '') + '" data-mot="' + b.id + '"' + (off ? ' disabled' : '') + '>' + esc(b.mot) + '</button>';
      }).join('');
      bIndice.hidden = !indices; bIndice.textContent = '💡 Indice (' + indices + ')';
      bIndice.disabled = choisi === null || !trous[choisi] || trous[choisi].fixe || !!trous[choisi].elimines;
      var vides = trous.filter(function(t){ return !t.pose; }).length;
      bValider.disabled = vides > 0 || fini;
      bVerif.hidden = !verifs; bVerif.textContent = '🔎 Vérifier (' + verifs + ')';
      bVerif.disabled = vides > 0;
      if(!info.dataset.fixe) info.textContent = vides ? 'Encore ' + vides + ' mot' + (vides > 1 ? 's' : '') + ' à trouver.' : 'Relis bien ta phrase. Tu es sûr ? Alors valide !';
    }
    function poser(bid){
      var b = banque[bid]; if(!b || b.utilise !== null) return;
      var cible = choisi !== null && !trous[choisi].fixe ? choisi : premierVide();
      if(cible === null) return;
      var t = trous[cible];
      if(t.pose){ banque.forEach(function(x){ if(x.utilise === cible) x.utilise = null; }); }
      t.pose = b.mot; t.faux = false; b.utilise = cible;
      choisi = premierVide();
      delete info.dataset.fixe;
      U.son('clic'); dessiner();
    }
    function retirer(tid){
      var t = trous[tid]; if(t.fixe) return;
      if(t.pose){ banque.forEach(function(x){ if(x.utilise === tid) x.utilise = null; }); t.pose = null; t.faux = false; U.son('tic'); }
      choisi = tid; delete info.dataset.fixe; dessiner();
    }
    racine.addEventListener('click', function(ev){
      if(fini) return;
      var tr = ev.target.closest('[data-trou]'), mo = ev.target.closest('[data-mot]');
      if(tr) retirer(+tr.dataset.trou);
      else if(mo) poser(+mo.dataset.mot);
    });
    racine.querySelector('.mm-relire').onclick = function(){ U.lire(texteActuel()); };
    bVerif.onclick = function(){
      if(!verifs) return;
      verifs--;
      var faux = trous.filter(function(t){ return t.pose !== t.mot; });
      if(params.revele) faux.forEach(function(t){ t.faux = true; });
      info.dataset.fixe = '1';
      info.textContent = faux.length ? (faux.length + ' mot' + (faux.length > 1 ? 's ne vont' : ' ne va') + ' pas' + (params.revele ? ' (en rouge).' : '.')) : 'Tout a l\'air juste !';
      U.son(faux.length ? 'ko' : 'ok'); dessiner();
    };
    /* Indice : pour le mot choisi, la moitié des mots qui ne vont nulle part disparaît de la liste */
    bIndice.onclick = function(){
      if(!indices || choisi === null) return;
      var t = trous[choisi]; if(!t || t.fixe || t.elimines) return;
      var leurresLibres = banque.filter(function(b){ return !bonsMots[b.mot] && b.utilise === null; });
      t.elimines = {};
      U.melanger(leurresLibres).slice(0, Math.ceil(leurresLibres.length / 2)).forEach(function(b){ t.elimines[b.id] = true; });
      indices--;
      info.dataset.fixe = '1'; info.textContent = '💡 Pour le mot ' + (t.id + 1) + ', la liste a diminué de moitié.';
      U.son('magie'); dessiner();
    };
    function revision(bilan){
      return {type:'mots', titre:'Les mots perdus', bilan:bilan,
        phrases:lignes.map(function(l){ return {qui:l.qui, morceaux:l.morceaux.map(function(m){ return m.trou ? {trou:1, pose:trous[m.id].pose} : {t:m.t}; })}; }),
        mots:banque.map(function(b){ return b.mot; })};
    }
    bValider.onclick = function(){
      if(fini) return;
      fini = true;
      var faux = trous.filter(function(t){ return t.pose !== t.mot; }).length;
      if(!faux) fin({reussi:true, score:1, erreurs:0, message:'Tu as tout compris !', detail:texteActuel(), revision:revision('Tu as tout compris.')});
      else { U.vibrer(80); fin({reussi:false, score:0, erreurs:faux, message:'Désolé…', detail:'Tu n\'as pas bien compris ce qui s\'est dit. Tant pis ! Tu pourras relire la conversation plus tard.', revision:revision('Tu n\'as pas bien compris ce qui s\'est dit : au moins un mot n\'allait pas.')}); }
    };
    try{ window.__mmAttendu = trous.map(function(t){ return t.mot; }); }catch(e){}
    choisi = premierVide();
    dessiner();
    return {arreter:function(){ fini = true; }};
  }
});
})();
