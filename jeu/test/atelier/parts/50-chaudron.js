
/* ==========================================================
   Préparer une potion : le mini-jeu « Le chaudron » (mj-chaudron.js)
   s'ouvre par-dessus l'atelier. Les ingrédients viennent des
   rangements (pas du panier) et sont retirés au moment où on les verse.
   ========================================================== */
/* Retire un ingrédient des rangements seulement (le panier n'est pas utilisable au chaudron) */
function retirerRange(V, ingr){
  for(var i = 0; i < V.etat.objets.length; i++){
    var o = V.etat.objets[i];
    for(var j = 0; j < (o.cases || []).length; j++){
      var c = o.cases[j];
      if((c.i[ingr] || 0) > 0){ c.i[ingr]--; if(!c.i[ingr]) delete c.i[ingr]; return o; }
    }
  }
  return null;
}
function besoinDe(id){
  var R = (DD().RECETTES || {})[id], b = {};
  if(R) R.ingr.forEach(function(x){ b[x[0]] = (b[x[0]] || 0) + x[1]; });
  return b;
}
function manque(V, id){
  var b = besoinDe(id), s = stockRange(V);
  return cles(b).filter(function(k){ return (s[k] || 0) < b[k]; });
}

function demarrer(V, rid, bouton){
  if(V.mjPartie || V.mode !== 'ranger') return;
  var r = rec(V, rid), MJ = window.MJ;
  if(!r || !MJ || !MJ.TYPES || !MJ.TYPES.chaudron){ toast(V, '<b>🚫</b> Le chaudron n\'est pas prêt.'); return; }
  var er = etatRecette(V, rid);
  if(!er.pret){
    son(V, 'ko');
    if(er.auPanier){
      /* encore par terre devant la porte : il faut d'abord les ranger */
      fermerGrimoire(V);
      var t = 'Ces ingrédients sont encore par terre, devant la porte : range-les d\'abord dans les tiroirs et les bocaux !';
      toast(V, '<b>🌿 ➡️ 🗄️</b> ' + esc(t), 4600, t);
      var ct = cadreTas(V);
      allerVers(V, ct.x, ct.y - ct.h / 2);
      (V.elTas || []).forEach(function(e){ briller(V, e, 5000); });
      return;
    }
    if(bouton) anim(bouton, [{transform:'translateX(0)'}, {transform:'translateX(-8px)'}, {transform:'translateX(8px)'}, {transform:'translateX(0)'}], {duration:320});
    toast(V, '<b>🗺️ 🌿</b> Il te manque des ingrédients : va cueillir !', 2800);
    return;
  }
  var ok = true;
  try{ if(V.o.peutPreparer) ok = V.o.peutPreparer() !== false; }catch(e){ ok = false; }
  if(!ok){
    son(V, 'ko'); vibrer(60);
    if(bouton) anim(bouton, [{transform:'translateX(0)'}, {transform:'translateX(-8px)'}, {transform:'translateX(8px)'}, {transform:'translateX(0)'}], {duration:320});
    toast(V, '<b>🚫 ⏳ 🧪</b> Plus d\'action ou plus de fiole vide !', 2800);
    return;
  }
  fermerGrimoire(V); fermerOuvert(V);
  V.sel = null; majTient(V);
  V.mode = 'prep';
  V.root.classList.add('at-mode-prep');
  majIndiceCarton(V);
  var mods = {}, aides = (V.o.aides || []).slice();
  cles(V.o.mods).forEach(function(k){ mods[k] = V.o.mods[k]; });
  if(aObjet(V, 'thermometre') && !mods.revele){ mods.revele = true; aides.push({ic:'🌡️', nom:'Thermomètre de cuivre'}); }
  var p = MJ.reglages('chaudron', V.o.niveau || 1, mods);
  p.potion = rid;
  p.connue = r.connue !== false;
  p.stock = function(){ return stockRange(V); };
  var ov = document.createElement('div');
  ov.className = 'at-mj';
  ov.innerHTML = '<div class="at-mj-cadre"></div>';
  V.root.appendChild(ov);
  /* (étape 4) le chat, dans un coin : il dresse les oreilles quand on verse le bon ingrédient (le mini-jeu n'appelle onVerse que pour le bon) */
  var oreilles = chatPotion(V, ov);
  p.onVerse = function(ingr){ var o = retirerRange(V, ingr); if(o) redessiner(V, o); changer(V); if(oreilles) oreilles(); };
  V.mjEl = ov;
  V.attente = {id:rid, reussi:false, detail:'Préparation abandonnée.'};
  var partie = MJ.lancer(ov.firstChild, 'chaudron', p, function(res){ finPreparation(V, rid, res); },
    {aides:aides, titre:(r.ic || '🧪') + ' ' + r.nom, lireAuto:false, deuxiemeChance:!!mods.deuxiemeChance});
  V.mjPartie = partie;
  /* un drapeau pour abandonner (deux touchers), dans l'en-tête du mini-jeu */
  var tete = ov.querySelector('.mj-tete'), lireBtn = ov.querySelector('.mj-btn-lire');
  if(tete){
    var ab = document.createElement('button');
    ab.type = 'button'; ab.className = 'at-mj-abandon'; ab.setAttribute('aria-label', 'Abandonner'); ab.textContent = '🏳️';
    ab.onclick = function(){
      if(ab.classList.contains('arme')){ partie.arreter(); finPreparation(V, rid, {reussi:false, detail:'Préparation abandonnée.', raison:'abandon'}); return; }
      ab.classList.add('arme'); ab.textContent = '🏳️?';
      toast(V, '<b>🏳️ ?</b> Touche encore pour abandonner', 2400);
      apres(V, 2600, function(){ ab.classList.remove('arme'); ab.textContent = '🏳️'; });
    };
    tete.insertBefore(ab, lireBtn);
  }
  anim(ov, [{opacity:0, transform:'scale(.96)'}, {opacity:1, transform:'none'}], {duration:260, easing:'ease-out'});
  son(V, 'magie');
}

function finPreparation(V, rid, res){
  if(!V.mjPartie) return;
  res = res || {};
  V.mjPartie = null;
  V.attente = null;
  if(V.mjEl){ V.mjEl.remove(); V.mjEl = null; }
  if(res.raison === 'boum' || res.raison === 'trop' || res.raison === 'tard'){ V.etat.flaque = 1; changer(V); }
  try{ if(V.o.potionFinie) V.o.potionFinie(rid, !!res.reussi, res.detail || res.message || ''); }catch(e){ console.error(e); }
  if(V.arrete) return;
  V.mode = 'ranger';
  V.root.classList.remove('at-mode-prep');
  fermerOuvert(V);
  mise(V);
  dessinerPiece(V);
  var nv = potionsNeuves(V);
  if(nv.length) brillerFlacons(V, nv);
  /* (étape 4) le chaudron est un mini-jeu de l'Alchimiste : la première réussite donne un accessoire au chat */
  if(res.reussi && gagnerAcc(V.etat, 'chaudron')){ changer(V); annoncerAcc(V); }
  /* un petit effet sur le chaudron de la pièce */
  if(V.elO.ch){
    V.elO.ch.classList.add(res.reussi ? 'at-chp-ok' : 'at-chp-rate');
    var p = (DD().POTIONS || {})[rid] || {};
    if(res.reussi) V.elO.ch.style.setProperty('--liq', p.c || '#8ff3ff');
    apres(V, 2600, function(){ if(V.elO.ch){ V.elO.ch.classList.remove('at-chp-ok', 'at-chp-rate'); V.elO.ch.style.removeProperty('--liq'); } });
  }
}
