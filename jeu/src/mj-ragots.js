/* ==========================================================
   Brumeval — mini-jeu du Barde : « Les ragots de la taverne »
   Cinq ragots tirés au hasard parmi une centaine (ragots.js),
   racontés par des habitants différents. Le Barde dit s'il y croit.
   On ne lui dit JAMAIS lesquels étaient vrais : seulement combien
   de fois il s'est trompé. Ce qu'il a entendu va dans son carnet.
   params : enquete (numéro), ragots (liste imposée, facultatif)
   mods : erreurs (+N permises), aide (N ragots dont le carnet de ragots connaît la réponse),
          pistes (+N ragots liés à l'enquête)
   Résultat : ragots [{texte, qui, reponse}], erreurs
   ========================================================== */
(function(){
'use strict';
if(!window.MJ) return;
var U = MJ.util;
var NB = 5;
var IC = {grosbec:'🎩', gaspard:'👨‍🍳', melusine:'👩‍🦰', basile:'👨‍🌾', odette:'👵', tim:'🧒', victor:'🧔', anselme:'👴', iris:'👩‍🌾', fortune:'🤠', silas:'💂', farinel:'🧑‍🌾', margot:'👩‍🍳'};
function esc(s){ return String(s).replace(/[&<>"']/g, function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]; }); }
function nomDe(id){ var D = window.DONNEES; return (D && D.PNJ && D.PNJ[id] && D.PNJ[id].court) || id; }
function portrait(id){
  if(window.Persos && Persos.pnj){ try{ var s = Persos.pnj(id, {anime:true}); if(s) return s; }catch(e){} }
  return '<span class="mr-emoji">' + (IC[id] || '🙂') + '</span>';
}

/* Tire cinq ragots : deux pistes de l'enquête au plus, le reste sur la vie du village,
   avec toujours au moins deux vrais et deux faux, et un conteur différent pour chacun. */
function tirer(enq, imposes, pistesEnPlus){
  var B = window.RAGOTS || {liste:[], conteurs:[{id:'margot'}]};
  var choisis;
  if(imposes && imposes.length){
    choisis = imposes.map(function(r){ return {t:r.texte || r.t, v:(r.vrai !== undefined ? r.vrai : r.v) ? 1 : 0, sur:r.sur || []}; }).slice(0, NB);
  } else {
    var pistes = (B.enquete && B.enquete[enq]) || B.liste.filter(function(r){ return r.enq === enq; });
    var village = (B.village || B.liste.filter(function(r){ return !r.enq; })).filter(function(r){ return (r.des || 1) <= enq; });
    for(var essai = 0; essai < 60; essai++){
      var nbP = Math.min(pistes.length, NB - 1, U.randInt(1, 2) + (pistesEnPlus || 0));
      choisis = U.melanger(pistes).slice(0, nbP).concat(U.melanger(village).slice(0, NB - nbP));
      var vrais = choisis.filter(function(r){ return r.v; }).length;
      if(vrais >= 2 && vrais <= NB - 2) break;
    }
    choisis = U.melanger(choisis);
  }
  var dispo = B.conteurs.filter(function(c){ return (c.des || 1) <= enq && (c.jusqua || 99) >= enq; }).map(function(c){ return c.id; });   /* jusqua : plus là après cette enquête (Odette, disparue) */
  var pris = {};
  choisis.forEach(function(r){
    var ok = U.melanger(dispo).filter(function(id){ return !pris[id] && (r.sur || []).indexOf(id) < 0; });
    var qui = ok[0] || U.melanger(dispo).filter(function(id){ return (r.sur || []).indexOf(id) < 0; })[0] || 'margot';
    pris[qui] = true; r.qui = qui;
  });
  return choisis;
}
function bilan(erreurs){
  if(!erreurs) return 'Tu as eu le nez fin : tu as trouvé tous les ragots !';
  if(erreurs === 1) return 'Tu t\'es trompé sur un ragot.';
  return 'Tu t\'es trompé ' + erreurs + ' fois.';
}

MJ.enregistrer('ragots', {
  nom:'Les ragots de la taverne', role:'barde', ic:'🍺',
  consigne:'À la taverne, chacun raconte son ragot. Tu y crois, ou pas ? Personne ne te dira lesquels étaient vrais : à la fin, tu sauras seulement combien de fois tu t\'es trompé.',
  reglages:function(n, mods){
    mods = mods || {};
    var erreurs = (n <= 4 ? 1 : 0) + (mods.erreurs || 0);
    return {erreurs:erreurs, aide:mods.aide || 0, pistes:Math.round(mods.pistes || 0), lignes:[
      {nom:'Ragots', val:String(NB)},
      {nom:'Erreurs permises', val:erreurs ? String(erreurs) : 'aucune'},
      {nom:'La bonne réponse', val:'jamais dite'}
    ].concat(mods.aide ? [{nom:'Ragots que ton carnet connaît', val:String(mods.aide)}] : [])
     .concat(mods.pistes ? [{nom:'Ragots en plus sur l\'enquête', val:'+' + Math.round(mods.pistes)}] : [])};
  },
  demo:function(el){
    el.innerHTML = '<div class="mr-demo"><div class="mr-demo-bulle">« Le pont grince la veille d\'un jour de pluie… »</div>' +
      '<div class="mr-demo-boutons"><span class="oui">👍 J\'y crois</span><span class="non">👎 C\'est faux</span></div><span class="mr-demo-main">👆</span><span class="mr-demo-note">📒 noté !</span></div>';
    return {arreter:function(){}};
  },
  jouer:function(el, p, fin){
    var enq = p.enquete || U.randInt(1, 3);
    var rag = tirer(enq, p.ragots, p.pistes);
    var connus = {}; U.melanger(rag.map(function(r, i){ return i; })).slice(0, p.aide || 0).forEach(function(i){ connus[i] = true; });
    var k = 0, reponses = [], attente = false, termine = false, minuteurs = [];
    function plus_tard(f, ms){ minuteurs.push(setTimeout(function(){ if(!termine || f.fin) f(); }, ms)); }
    var racine = U.html('<div class="mr">' +
      '<div class="mr-scene"><div class="mr-lampes"><i></i><i></i><i></i></div>' +
        '<div class="mr-conteur"><div class="mr-portrait"></div><span class="mr-nom"></span></div>' +
        '<div class="mr-bulle"><p class="mr-texte"></p><button type="button" class="mr-lire" aria-label="Écouter le ragot">🔊</button><p class="mr-carnet"></p></div>' +
        '<div class="mr-comptoir"></div></div>' +
      /* la règle des cœurs : les erreurs permises (on ne dit qu'à la fin lesquelles étaient fausses, donc ils ne bougent pas) */
      '<div class="mr-pastilles">' + rag.map(function(){ return '<i></i>'; }).join('') + '<span class="mr-coeurs">' + U.coeurs(p.erreurs || 0, p.erreurs || 0) + '</span></div>' +
      '<div class="mr-choix"><button type="button" class="mr-gros mr-oui" data-v="1">👍 J\'y crois</button><button type="button" class="mr-gros mr-non" data-v="0">👎 C\'est faux</button></div>' +
      '<div class="mr-recap" hidden></div></div>');
    el.appendChild(racine);
    var portraitEl = racine.querySelector('.mr-portrait'), nomEl = racine.querySelector('.mr-nom');
    var bulle = racine.querySelector('.mr-bulle'), texte = racine.querySelector('.mr-texte'), carnet = racine.querySelector('.mr-carnet');
    var pastilles = racine.querySelectorAll('.mr-pastilles i'), choix = racine.querySelector('.mr-choix');
    var conteur = racine.querySelector('.mr-conteur');
    racine.querySelector('.mr-lire').onclick = function(){ var r = rag[k]; if(r) U.lire(r.t, {qui:r.qui}); };
    function montrer(){
      var r = rag[k];
      pastilles[k].className = 'cur';
      conteur.classList.remove('entre'); bulle.classList.remove('montre');
      void conteur.offsetWidth;
      portraitEl.innerHTML = portrait(r.qui);
      nomEl.textContent = nomDe(r.qui) + ' raconte…';
      texte.textContent = '« ' + r.t + ' »';
      carnet.textContent = connus[k] ? '📒 Ton carnet de ragots dit que c\'est ' + (r.v ? 'VRAI' : 'FAUX') + '.' : '';
      carnet.hidden = !connus[k];
      conteur.classList.add('entre');
      plus_tard(function(){ bulle.classList.add('montre'); attente = true; choix.classList.add('pret'); }, 450);
    }
    function recap(){
      termine = true;
      var erreurs = rag.filter(function(r, i){ return !!r.v !== reponses[i]; }).length;
      var reussi = erreurs <= (p.erreurs || 0);
      var titre = bilan(erreurs);
      racine.querySelector('.mr-scene').hidden = true; choix.hidden = true;
      var box = racine.querySelector('.mr-recap');
      box.hidden = false;
      box.innerHTML = '<div class="mr-bilan ' + (erreurs ? 'rate' : 'parfait') + '"><span>' + (erreurs ? '🤔' : '👃') + '</span><h3>' + esc(titre) + '</h3>' +
        (erreurs ? '<p>Lesquels ? Ça, personne ne te le dira…</p>' : '') + '</div>' +
        '<ul>' + rag.map(function(r, i){
          return '<li style="animation-delay:' + (i * 0.1) + 's"><span class="mr-qui">' + (IC[r.qui] || '🗣️') + '</span><p><b>' + esc(nomDe(r.qui)) + ' :</b> « ' + esc(r.t) + ' »</p><span class="mr-avis ' + (reponses[i] ? 'oui' : 'non') + '">' + (reponses[i] ? 'Tu y crois' : 'Tu n\'y crois pas') + '</span></li>';
        }).join('') + '</ul><p class="mr-note">📒 Ces ragots sont notés dans ton carnet : tu pourras les relire et changer d\'avis.</p><button type="button" class="btn grand mr-fin">Continuer</button>';
      U.son(erreurs ? 'page' : 'ok');
      var b = box.querySelector('.mr-fin');
      b.onclick = function(){
        if(b.disabled) return; b.disabled = true; U.stop();
        fin({reussi:reussi, erreurs:erreurs, message:titre,
          detail:reussi ? (erreurs ? 'Ça reste assez bien jugé. Mais lequel était faux ?' : 'Pas un seul ragot ne t\'a trompé.') : 'Trop de ragots t\'ont trompé… Lesquels ? Mystère.',
          ragots:rag.map(function(r, i){ return {texte:r.t, qui:r.qui, reponse:reponses[i]}; }),
          revision:{type:'ragots', titre:'Les ragots de la taverne', bilan:titre,
            ragots:rag.map(function(r, i){ return {texte:r.t, qui:r.qui, reponse:reponses[i], avis:reponses[i]}; })}});
      };
    }
    choix.addEventListener('click', function(ev){
      var b = ev.target.closest('[data-v]'); if(!b || !attente || termine) return;
      attente = false; choix.classList.remove('pret');
      reponses[k] = b.dataset.v === '1';
      pastilles[k].className = 'note';
      b.classList.add('appuye'); setTimeout(function(){ b.classList.remove('appuye'); }, 300);
      U.son('page');
      k++;
      var suite = function(){ if(k >= rag.length) recap(); else montrer(); };
      plus_tard(suite, 650);
    });
    plus_tard(montrer, 300);
    return {arreter:function(){ termine = true; minuteurs.forEach(clearTimeout); }};
  }
});
})();
