/* ==========================================================
   Brumeval — relire un mini-jeu du Barde après coup.
   Mensonge (les paroles, sans le visage), ragots, mots perdus.
   On peut changer ses propres avis autant qu'on veut, mais on
   n'a JAMAIS la réponse : seulement le bilan (« tu t'es trompé 1 fois »).
   Revision.monter(el, rev, onChange)  — rev est modifié sur place.
   Formats :
     {type:'mensonge', titre, bilan, nom, ic, phrases:[{texte, avis}]}       avis : true = « mensonge ? »
     {type:'ragots', titre, bilan, ragots:[{texte, qui, reponse, avis}]}      avis : true = « j'y crois »
     {type:'mots', titre, bilan, phrases:[{qui, morceaux:[{t}|{trou:1, pose}]}], mots:[…]}
     {type:'depositions', titre, bilan, scene, depositions:[{qui, nom, phrases:[{t, m}]}]}
                                     m : surlignage du joueur ('v' pareil, 'r' bizarre, 'j' hmm ?, null)
   ========================================================== */
(function(){
'use strict';
function esc(s){ return String(s == null ? '' : s).replace(/[&<>"']/g, function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]; }); }
function nomDe(id){ var D = window.DONNEES; return (D && D.PNJ && D.PNJ[id] && D.PNJ[id].court) || id || ''; }
var IC = {grosbec:'🎩', gaspard:'👨‍🍳', melusine:'👩‍🦰', basile:'👨‍🌾', odette:'👵', tim:'🧒', victor:'🧔', anselme:'👴', iris:'👩‍🌾', fortune:'🤠', silas:'💂', farinel:'🧑‍🌾', margot:'👩‍🍳'};

function entete(rev, sous){
  return '<div class="rv-tete"><h3>' + esc(rev.titre || 'À revoir') + '</h3>' +
    (rev.bilan ? '<p class="rv-bilan">' + esc(rev.bilan) + '</p>' : '') +
    '<p class="rv-sous">' + sous + '</p></div>';
}
function rendre(el, rev, etat){
  var s = '';
  if(rev.type === 'mensonge'){
    s += entete(rev, (rev.nom ? esc(rev.nom) + ' est parti' : 'Le villageois est parti') + ' : il ne reste que ses paroles. Touche une phrase pour changer d\'avis. Personne ne te dira qui avait raison.');
    s += '<ul class="rv-liste">' + rev.phrases.map(function(p, i){
      var a = p.avis === true ? 'faux' : p.avis === false ? 'vrai' : 'doute';
      return '<li><button type="button" class="rv-item ' + a + '" data-rv-avis="' + i + '"><span class="rv-num">' + (i + 1) + '</span><p>« ' + esc(p.texte) + ' »</p><span class="rv-etiq">' +
        (a === 'faux' ? '🤥 Mensonge ?' : a === 'vrai' ? '🙂 Vrai ?' : '🤔 Je ne sais pas') + '</span></button></li>';
    }).join('') + '</ul>';
  } else if(rev.type === 'ragots'){
    s += entete(rev, 'Voici les ragots que tu as entendus. Touche-les pour changer d\'avis : lesquels t\'ont trompé ? Personne ne te le dira.');
    s += '<ul class="rv-liste">' + rev.ragots.map(function(r, i){
      var a = r.avis === true ? 'vrai' : r.avis === false ? 'faux' : 'doute';
      return '<li><button type="button" class="rv-item ' + a + '" data-rv-avis="' + i + '"><span class="rv-num">' + (IC[r.qui] || '🗣️') + '</span><p><b>' + esc(nomDe(r.qui)) + ' :</b> « ' + esc(r.texte) + ' »' +
        (r.reponse !== undefined && r.reponse !== r.avis ? '<small class="rv-avant">Pendant le jeu, tu ' + (r.reponse ? 'y as cru' : 'n\'y as pas cru') + '.</small>' : '') + '</p><span class="rv-etiq">' +
        (a === 'vrai' ? '👍 J\'y crois' : a === 'faux' ? '👎 Faux ?' : '🤔 Je ne sais pas') + '</span></button></li>';
    }).join('') + '</ul>';
  } else if(rev.type === 'mots'){
    s += entete(rev, 'Voici ce que tu as cru entendre. Touche un mot pour le changer et cherche l\'erreur… Personne ne te dira si c\'est juste.');
    var n = 0;
    s += '<div class="rv-parchemin">' + rev.phrases.map(function(l){
      return '<p class="rv-ligne"><span class="rv-qui">' + esc(l.qui || '💬') + '</span><span>' + l.morceaux.map(function(m){
        if(!m.trou) return esc(m.t);
        var k = n++;
        return '<button type="button" class="rv-trou' + (etat.choisi === k ? ' choisi' : '') + (m.pose ? ' plein' : '') + (m.change ? ' change' : '') + '" data-rv-trou="' + k + '">' + (m.pose ? esc(m.pose) : '&nbsp;?&nbsp;') + '</button>';
      }).join('') + '</span></p>';
    }).join('') + '</div>';
    s += '<p class="rv-sous">' + (etat.choisi === null ? 'Touche d\'abord un mot de la phrase.' : 'Choisis le mot que tu veux essayer à la place :') + '</p>';
    s += '<div class="rv-mots">' + (rev.mots || []).map(function(m, i){ return '<button type="button" class="rv-mot" data-rv-mot="' + i + '"' + (etat.choisi === null ? ' disabled' : '') + '>' + esc(m) + '</button>'; }).join('') + '</div>';
  } else if(rev.type === 'depositions'){
    s += entete(rev, (rev.oral ? 'Tu les avais seulement écoutées : voici enfin ce que chacun a dit, avec tes coups de feutre. ' : 'Relis les dépositions avec tes coups de feutre. ') +
      'Touche une phrase pour changer sa couleur. Personne ne te dira qui mentait.');
    if(rev.scene) s += '<p class="rv-scene">📜 ' + esc(rev.scene) + '</p>';
    s += '<p class="rv-legende"><span class="rv-m-v">Pareil</span><span class="rv-m-r">Bizarre</span><span class="rv-m-j">Hmm ?</span></p>';
    s += '<div class="rv-depos">' + (rev.depositions || []).map(function(d, i){
      return '<div class="rv-depo"><p class="rv-depo-tete"><span>' + (IC[d.qui] || '🗣️') + '</span>' + esc(d.nom || nomDe(d.qui)) + '</p><p class="rv-depo-txt">' +
        (d.phrases || []).map(function(p, j){
          return '<span class="rv-ph' + (p.m ? ' rv-m-' + esc(p.m) : '') + '" role="button" tabindex="0" data-rv-ph="' + i + ':' + j + '">' + esc(p.t) + '</span>';
        }).join(' ') + '</p></div>';
    }).join('') + '</div>';
  }
  el.innerHTML = '<div class="rv">' + s + '</div>';
}
function trous(rev){
  var l = [];
  rev.phrases.forEach(function(p){ p.morceaux.forEach(function(m){ if(m.trou) l.push(m); }); });
  return l;
}
window.Revision = {
  monter:function(el, rev, onChange){
    if(!el || !rev) return;
    var etat = {choisi:null};
    rendre(el, rev, etat);
    el.onclick = function(ev){
      var a = ev.target.closest('[data-rv-avis]'), t = ev.target.closest('[data-rv-trou]'), m = ev.target.closest('[data-rv-mot]'), ph = ev.target.closest('[data-rv-ph]');
      if(ph){
        var ij = ph.dataset.rvPh.split(':'), dp = (rev.depositions || [])[+ij[0]], pp = dp && dp.phrases[+ij[1]];
        if(!pp) return;
        pp.m = pp.m === 'v' ? 'r' : pp.m === 'r' ? 'j' : pp.m === 'j' ? null : 'v';
      } else if(a){
        var i = +a.dataset.rvAvis, it = (rev.type === 'ragots' ? rev.ragots : rev.phrases)[i];
        it.avis = it.avis === true ? false : it.avis === false ? null : true;
      } else if(t){
        var k = +t.dataset.rvTrou; etat.choisi = etat.choisi === k ? null : k;
      } else if(m && etat.choisi !== null){
        var tr = trous(rev)[etat.choisi]; if(tr){ if(tr.avant === undefined) tr.avant = tr.pose; tr.pose = rev.mots[+m.dataset.rvMot]; tr.change = tr.pose !== tr.avant; }
        etat.choisi = null;
      } else return;
      try{ if(window.Brume) Brume.son('clic'); }catch(e){}
      rendre(el, rev, etat);
      if(onChange) try{ onChange(rev); }catch(e){}
    };
  }
};
})();
