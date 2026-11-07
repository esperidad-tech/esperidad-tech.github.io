
/* ==========================================================
   Gestes : tout se fait en touchant l'image de l'atelier.
   - toucher une chose : son action (un rangement s'ouvre en gros plan, le chaudron, le grimoire, la paillasse…) ;
     la décoration (tapis, plante, tableau, murs, plancher…) change de style ou de couleur ;
   - appuyer et garder le doigt (un quart de seconde), puis glisser : on déplace le meuble, il reste exactement là où on le lâche
     (au bord de l'écran, la pièce défile ; sur le carton 📦 en bas à droite de l'écran, la décoration se range) ;
   - glisser tout de suite : la pièce défile (téléphone) ; sur un grand écran, le meuble se déplace ;
   - la cueillette posée devant la porte : on la glisse directement dans un rangement.
   ========================================================== */
var SEUIL_GESTE = 9;     /* en pixels : en dessous, c'est un toucher ; au-dessus, un glisser */
var TENIR = 260;         /* en millisecondes : appuyer et garder le doigt, le meuble se soulève */
function suivre(V, e, cb, seuil){
  var id = e.pointerId, x0 = e.clientX, y0 = e.clientY, bouge = false, s = seuil === undefined ? SEUIL_GESTE : seuil, s2 = s * s;
  function mv(ev){
    if(ev.pointerId !== id) return;
    var dx = ev.clientX - x0, dy = ev.clientY - y0;
    if(!bouge && dx * dx + dy * dy >= s2){ bouge = true; if(cb.debut) cb.debut(ev); }
    if(bouge && cb.move) cb.move(ev, dx, dy);
  }
  function up(ev){
    if(ev.pointerId !== id) return;
    fin();
    if(cb.up) cb.up(ev, bouge, ev.type === 'pointercancel', ev.clientX - x0, ev.clientY - y0);
  }
  function fin(){
    window.removeEventListener('pointermove', mv);
    window.removeEventListener('pointerup', up);
    window.removeEventListener('pointercancel', up);
    V.suivis = V.suivis.filter(function(f){ return f !== fin; });
  }
  window.addEventListener('pointermove', mv);
  window.addEventListener('pointerup', up);
  window.addEventListener('pointercancel', up);
  V.suivis.push(fin);
}
/* Un geste qui ne déplace rien : un toucher fait l'action, un glisser fait défiler la pièce */
function gesteOuDefile(V, e, surToucher, chasse){
  var p0 = {x:V.pan.x, y:V.pan.y};
  suivre(V, e, {
    debut:function(){ V.root.classList.add('at-defile'); },
    move:function(ev, dx, dy){ panA(V, p0.x - dx, p0.y - dy); if(chasse) chasseDoigt(V, ev); },     /* (le chat suit le doigt sur le plancher) */
    up:function(ev, bouge, annule){
      V.root.classList.remove('at-defile');
      if(chasse && bouge) chasseFin(V);
      if(!bouge && !annule && surToucher) surToucher(ev);
    }
  });
}

function brancher(V){
  /* --- la pièce --- */
  ecoute(V, V.piece, 'pointerdown', function(e){
    if(V.arrete || e.button > 0) return;
    V.dernierPointeur = Date.now(); V.enGeste = true;
    var t = e.target;
    if(t.closest('.at-repere') || t.closest('.at-tient')) return;
    var obj = t.closest('.at-o'), carton = t.closest('.at-carton'), tas = t.closest('.at-tas'), fixe = t.closest('[data-at]'), surf = t.closest('[data-surf]');
    e.preventDefault();
    /* le guidage du tutoriel : seulement ce qui brille (ailleurs : « Pas maintenant », la pièce peut glisser) */
    if(GUIDE && V.mode === 'ranger' && !guideAutorise(V, t)){ gesteOuDefile(V, e, function(){ pasMaintenant(V); }); return; }
    if(V.mode !== 'ranger'){ gesteOuDefile(V, e, null); return; }
    if(tas){ glisserTas(V, e, tas.getAttribute('data-tas'), tas); return; }
    if(carton){ gesteOuDefile(V, e, function(){ ouvrirCarton(V, carton.getAttribute('data-carton')); }); return; }
    /* la bulle du chat (ce qu'il demande) : un toucher dit quoi faire */
    if(obj && t.closest('.at-bulle')){ var oc = V.parId[obj.getAttribute('data-obj')]; gesteOuDefile(V, e, function(){ if(oc) bulleChat(V, oc); }); return; }
    if(obj && t.closest('.at-bonheur-hab')){ var oh = obj.getAttribute('data-obj'); gesteOuDefile(V, e, function(){ ouvrirGarde(V, oh); }); return; }
    if(obj){
      var o = V.parId[obj.getAttribute('data-obj')];
      if(o) prendreObjet(V, e, o);
      return;
    }
    if(fixe){
      var pot = t.closest('[data-pot]');
      gesteOuDefile(V, e, function(){ action(V, fixe.getAttribute('data-at'), pot ? pot.getAttribute('data-pot') : fixe.getAttribute('data-b')); });
      return;
    }
    gesteOuDefile(V, e, surf ? function(){ restylerSurface(V, surf.getAttribute('data-surf')); } : null, true);
  });
  /* (la souris envoie aussi un « click » après un long glisser : on le reconnaît à l'heure du lâcher) */
  ecoute(V, window, 'pointerup', function(){ if(V.enGeste){ V.enGeste = false; V.dernierPointeur = Date.now(); } }, true);
  /* un clic sans doigt ni souris (clavier, robot d'essai) : même action */
  ecoute(V, V.piece, 'click', function(e){
    var t = e.target, b = t.closest('button');
    if(b && b.hasAttribute('data-voir')){ voir(V, b.getAttribute('data-voir')); return; }
    if(b && b.classList.contains('at-tient-x')){ lacher(V); return; }
    if(Date.now() - (V.dernierPointeur || 0) < 700 || V.mode !== 'ranger') return;
    if(GUIDE && !guideAutorise(V, t)){ pasMaintenant(V); return; }
    var fixe = t.closest('[data-at]'), obj = t.closest('.at-o'), carton = t.closest('.at-carton'), tas = t.closest('.at-tas'), surf = t.closest('[data-surf]');
    if(tas){ ouvrirArrivage(V, tas.getAttribute('data-tas')); return; }
    if(carton){ ouvrirCarton(V, carton.getAttribute('data-carton')); return; }
    if(obj && t.closest('.at-bulle')){ var oc = V.parId[obj.getAttribute('data-obj')]; if(oc) bulleChat(V, oc); return; }
    if(obj && t.closest('.at-bonheur-hab')){ ouvrirGarde(V, obj.getAttribute('data-obj')); return; }
    if(obj){ var o = V.parId[obj.getAttribute('data-obj')]; if(o) toucherObjet(V, o, e); return; }
    if(fixe){ var pot = t.closest('[data-pot]'); action(V, fixe.getAttribute('data-at'), pot ? pot.getAttribute('data-pot') : fixe.getAttribute('data-b')); return; }
    if(surf) restylerSurface(V, surf.getAttribute('data-surf'));
  });
  /* la molette ou le pavé tactile font défiler la pièce */
  ecoute(V, V.piece, 'wheel', function(e){
    if(!V.root.classList.contains('at-glissable')) return;
    var dx = e.deltaX, dy = e.deltaY;
    if(V.mondeH <= V.vh + 1){ dx += dy; dy = 0; }
    if(V.mondeW <= V.vw + 1){ dy += dx; dx = 0; }
    e.preventDefault();
    panPar(V, dx, dy);
  }, {passive:false});

  /* --- le gros plan d'un rangement --- */
  ecoute(V, V.ouvertEl, 'pointerdown', function(e){
    var j = e.target.closest('[data-de]');
    if(!j || !V.ouvert || V.mode !== 'ranger' || V.ouvert.etq) return;     /* en mode étiquettes, toucher une case colle l'étiquette */
    e.preventDefault();
    var de = j.getAttribute('data-de'), k = j.getAttribute('data-ingr');
    /* elle tient quelque chose pris dans un tiroir : tout le plateau (qui brille) veut dire « remets-le devant la porte » */
    if(de === 'panier' && V.selCase){ V.dernierPointeur = Date.now(); remettreAuCarton(V); return; }
    if(de === 'panier') glisserIngr(V, e, {de:'panier', ingr:k, el:j}, function(){ choisirIngr(V, k); });
    else glisserIngr(V, e, {de:'case', o:V.ouvert.o, ci:+j.getAttribute('data-ci'), ingr:k, el:j}, function(){ choisirDansCase(V, V.ouvert.o, +j.getAttribute('data-ci'), k); });
  });
  ecoute(V, V.ouvertEl, 'click', function(e){
    if(!V.ouvert) return;
    var o = V.parId[V.ouvert.o];
    if(!o) return;
    var b = e.target.closest('button');
    if(b && b.classList.contains('at-fermer')){ fermerOuvert(V); son(V, 'clic'); return; }
    if(b && b.classList.contains('at-peindre')){ restyler(V, o); dessinerOuvert(V); return; }
    if(b && b.classList.contains('at-zoom-etq')){ V.ouvert.etq = !V.ouvert.etq; V.etqSel = null; son(V, 'clic'); dessinerOuvert(V); return; }
    if(b && b.hasAttribute('data-etq')){ V.etqSel = V.etqSel === b.getAttribute('data-etq') ? null : b.getAttribute('data-etq'); son(V, 'clic'); dessinerOuvert(V); return; }
    if(b && b.hasAttribute('data-retire')){ retirerEtiquette(V, o, +b.getAttribute('data-ci'), +b.getAttribute('data-retire'), b); return; }
    if(b && b.classList.contains('at-lire')){ lire(V, b.getAttribute('data-lu') || ''); return; }
    if(e.target.closest('[data-de]') && !V.ouvert.etq) return;          /* déjà traité au toucher */
    var c = e.target.closest('.at-case');
    if(c){ toucherCase(V, o, +c.getAttribute('data-case')); return; }
    if(e.target.closest('.at-plateau') && V.selCase){ remettreAuCarton(V); return; }
    if(e.target === V.ouvertEl){ fermerOuvert(V); }
  });

  /* --- les grands panneaux : la cueillette, le grimoire, le chaudron, les potions, les analyses, le carton du coin --- */
  ecoute(V, V.grim, 'click', function(e){
    var b = e.target.closest('button');
    if(e.target === V.grim){ fermerGrimoire(V); return; }
    if(!b) return;
    if(b.classList.contains('at-fermer')){ fermerGrimoire(V); son(V, 'clic'); return; }
    if(b.hasAttribute('data-peindre')){ peindrePanneau(V, b.getAttribute('data-peindre')); return; }
    if(b.hasAttribute('data-lire')){ lire(V, texteRecette(V, b.getAttribute('data-lire'))); return; }
    if(b.classList.contains('at-lire')){ lire(V, b.getAttribute('data-lu') || ''); return; }
    if(b.classList.contains('at-rpreparer')){ preparerDepuisLivre(V, b.getAttribute('data-r'), b); return; }
    if(b.classList.contains('at-ch-go')){ demarrer(V, b.getAttribute('data-r'), b); return; }
    if(b.hasAttribute('data-prendre')){
      choisirIngr(V, b.getAttribute('data-prendre')); dessinerArrivage(V);
      /* « où le ranger ? » arrive sous les jetons : sur un petit écran, on le fait monter en vue */
      var ou = V.grim.querySelector('.at-ou');
      if(ou && ou.scrollIntoView) try{ ou.scrollIntoView({block:'nearest', behavior:'smooth'}); }catch(er){ ou.scrollIntoView(false); }
      return;
    }
    if(b.hasAttribute('data-vers')){ var o = V.parId[b.getAttribute('data-vers')]; fermerGrimoire(V); if(o) ouvrir(V, o); return; }
    if(b.classList.contains('at-dans-piece')){ fermerGrimoire(V); majTient(V); montrerRangements(V); return; }
    if(b.hasAttribute('data-pot-voir')){ V.potSel = b.getAttribute('data-pot-voir'); son(V, 'clic'); dessinerPotions(V); return; }
    if(b.hasAttribute('data-res')){ sortirReserve(V, +b.getAttribute('data-res')); return; }
    if(b.hasAttribute('data-acc')){ habiller(V, b.getAttribute('data-acc'), b.getAttribute('data-slot')); return; }
    /* data-act (donner-potion, vendre, analyser) : c'est le moteur qui s'en occupe (clic global) */
  });
  /* --- la bulle : son 🔊 lit l'explication (jamais toute seule) ; 🎨 repeint le chaudron --- */
  ecoute(V, V.toastEl, 'click', function(e){
    if(e.target.closest('.at-toast-lire') && V.toastLu){ lire(V, V.toastLu); prolongerToast(V, 6000); }
    if(e.target.closest('.at-toast-peindre') && V.parId.ch){ restyler(V, V.parId.ch); prolongerToast(V, 4000); }
  });
}

/* Toucher une chose fixe de la pièce */
function action(V, at, pot){
  if(V.mode !== 'ranger' || V.arrete) return;
  if(at === 'grimoire') ouvrirLivre(V);
  else if(at === 'chaudron') ouvrirChaudron(V);
  else if(at === 'potions') ouvrirPotions(V, pot);
  else if(at === 'arrivage') ouvrirArrivage(V);
  else if(at === 'analyses') ouvrirAnalyses(V);
  else if(at === 'reserve') ouvrirReserve(V);
  else if(at === 'salle') changerSalle(V, 1 - V.salle);
  else if(at === 'flaque') nettoyerFlaque(V);
  else if(at === 'betise') reparerBetise(V, pot);
}
/* Un repère au bord de l'écran a été touché : la pièce glisse jusqu'à la chose */
function voir(V, cle){
  var F = cle === 'arrivage' ? cadreTas(V) : cle === 'analyses' ? cadreObjet(V, 'pa') : cle === 'grimoire' ? cadreObjet(V, 'lu') : cadreFlacons(V);
  if(F) allerVers(V, F.x, F.y - F.h / 2);
  son(V, 'clic');
}

/* ---------- Toucher un objet : son action ; la décoration change de style ---------- */
function toucherObjet(V, o, ev){
  var c = catDe(o), d = V.elO[o.id];
  if(V.mode !== 'ranger') return;
  if(o.t === 'chat'){ chatToucher(V, o); return; }
  if(c.special === 'chaudron'){ ouvrirChaudron(V); return; }
  if(c.special === 'grimoire'){ ouvrirLivre(V); return; }
  if(c.special === 'analyses'){ ouvrirAnalyses(V); return; }
  if(c.cases){ ouvrir(V, o); return; }
  if(o.t === 'lampe'){ o.on = o.on === 0 ? 1 : 0; redessiner(V, o); son(V, 'clic'); changer(V); majLumiere(V); rebond(d); return; }
  /* les affaires du chat : d'abord leur action (remplir la gamelle) ; le tabouret renversé se relève */
  if(o.renverse){ relever(V, o); return; }
  if((o.t === 'gamelle' || o.t === 'eau') && !o.plein){ remplir(V, o); return; }
  if(o.t === 'distributeur' && parDistributeur(V, o)) return;
  if(c.deco){ restyler(V, o); return; }
  son(V, 'clic');
  rebond(d);
}
function rebond(d){ if(d) anim(d, [{transform:'scale(' + d._s + ')'}, {transform:'scale(' + d._s * 1.08 + ',' + d._s * 0.92 + ')', offset:0.35}, {transform:'scale(' + d._s + ')'}], {duration:320, easing:'ease-out'}); }
/* Le style suivant (forme et couleur) d'un objet ; un petit « pouf » d'étoiles */
function restyler(V, o){
  var c = catDe(o), d = V.elO[o.id];
  o.st = ((o.st || 0) + 1) % nStyles(c);
  o.neuf = 0;
  redessiner(V, o);
  if(d) anim(d, [{transform:'scale(' + d._s + ')', filter:'brightness(1.6)'}, {transform:'scale(' + d._s * 1.12 + ',' + d._s * 0.9 + ')', filter:'brightness(1.25)', offset:0.35}, {transform:'scale(' + d._s + ')', filter:'none'}], {duration:360, easing:'ease-out'});
  etincelles(V, o);
  son(V, 'clic');
  if(c.lumiere || o.t === 'bougies') majLumiere(V);
  if(c.special === 'analyses' || c.special === 'chaudron') majFixes(V);
  changer(V);
}
function etincelles(V, o){
  var F = cadreObjet(V, o.id) || {x:600, y:600, w:0, h:0}, e = document.createElement('div');
  e.className = 'at-etinc';
  e.style.left = pX(V, F.x); e.style.top = pY(V, F.y - F.h * 0.55);
  e.innerHTML = '<i>✦</i><i>✧</i><i>✦</i><i>✧</i>';
  V.calque.appendChild(e);
  apres(V, 700, function(){ e.remove(); });
}
/* Toucher un mur ou le plancher : un autre motif, une autre couleur */
function restylerSurface(V, cle){
  if(!DECO_NF[cle] || V.mode !== 'ranger') return;
  V.etat.deco[cle] = ((V.etat.deco[cle] || 0) + 1) % (DECO_NF[cle] * NT);
  majFond(V);
  son(V, 'clic');
  changer(V);
}
function majFond(V){ V.fondEl.innerHTML = svgFond(V) + fondAnime(V); }
/* 🎨 dans un panneau : le lutrin, la paillasse ou le chaudron change de style (et la petite image du panneau aussi) */
function peindrePanneau(V, cle){
  if(V.parId[cle]) restyler(V, V.parId[cle]);
  var im = V.grim.querySelector('.at-f-apercu');
  if(im) im.innerHTML = apercuPanneau(V, cle);
}
function apercuPanneau(V, cle){
  var o = V.parId[cle];
  return o ? svgObjet({t:o.t, st:o.st, v:o.v}) : '';
}
function boutonPeindre(V, cle){
  return '<span class="at-f-apercu" aria-hidden="true">' + apercuPanneau(V, cle) + '</span><button type="button" class="at-rond at-peindre" data-peindre="' + cle + '" aria-label="Changer la couleur">🎨</button>';
}

/* ---------- Déplacer un meuble : appuyer, garder le doigt, puis glisser ----------
   Un glisser tout de suite fait défiler la pièce (téléphone) ; sur un grand écran (rien à faire défiler), il déplace aussi le meuble. */
function prendreObjet(V, e, o){
  var d = V.elO[o.id];
  if(!d) return;
  var id = e.pointerId, x0 = e.clientX, y0 = e.clientY, pan0 = {x:V.pan.x, y:V.pan.y}, etat = 'attente', g = null, glissable = V.root.classList.contains('at-glissable');
  /* le chat : le doigt qui glisse sur lui le caresse (il ronronne) ; s'il sort du chat, la pièce défile (ou, sur un grand écran, on le déplace) */
  var chat = o.t === 'chat', car = {l:0, n:0, x:x0, y:y0};
  function surChat(ev){ var r = d.getBoundingClientRect(), mx = r.width * 0.25 + 12, my = r.height * 0.25 + 12; return ev.clientX > r.left - mx && ev.clientX < r.right + mx && ev.clientY > r.top - my && ev.clientY < r.bottom + my; }
  d.classList.add('at-appui');
  function lever(ev){
    etat = 'glisse';
    d.classList.remove('at-appui');
    g = debutGlisseObjet(V, e, o);
    if(ev) g.move(ev);
  }
  var tm = apres(V, TENIR, function(){ if(etat === 'attente'){ vibrer(12); lever(null); } });
  function mv(ev){
    if(ev.pointerId !== id) return;
    var dx = ev.clientX - x0, dy = ev.clientY - y0;
    if(etat === 'attente' && dx * dx + dy * dy >= SEUIL_GESTE * SEUIL_GESTE){
      clearTimeout(tm);
      if(chat && surChat(ev)){ etat = 'caresse'; d.classList.remove('at-appui'); car.x = ev.clientX; car.y = ev.clientY; }
      else if(glissable){ etat = 'defile'; d.classList.remove('at-appui'); V.root.classList.add('at-defile'); }
      else lever(ev);
    }
    if(etat === 'caresse'){
      if(surChat(ev)){
        car.l += Math.hypot(ev.clientX - car.x, ev.clientY - car.y); car.x = ev.clientX; car.y = ev.clientY;
        while(car.l >= 44){ car.l -= 44; car.n++; caresser(V, o, 1); }
        return;
      }
      /* le doigt sort du chat */
      if(glissable){ etat = 'defile'; pan0 = {x:V.pan.x + dx, y:V.pan.y + dy}; V.root.classList.add('at-defile'); }
      else lever(ev);
    }
    if(etat === 'defile'){ panA(V, pan0.x - dx, pan0.y - dy); chasseDoigt(V, ev); }      /* (le chat suit le doigt qui glisse) */
    else if(etat === 'glisse' && g) g.move(ev);
  }
  function up(ev){
    if(ev.pointerId !== id) return;
    fin();
    clearTimeout(tm);
    d.classList.remove('at-appui');
    var annule = ev.type === 'pointercancel', dx = ev.clientX - x0, dy = ev.clientY - y0;
    /* tablette lente : le minuteur a soulevé le meuble alors que le doigt était déjà levé (avant le quart de seconde) → c'était un toucher */
    if(etat === 'glisse' && g && !annule && dx * dx + dy * dy < SEUIL_GESTE * SEUIL_GESTE && ev.timeStamp - e.timeStamp < TENIR
       && Math.abs(V.pan.x - pan0.x) + Math.abs(V.pan.y - pan0.y) < 1){ g.up(ev, true); etat = 'attente'; }
    if(etat === 'attente'){ if(!annule) toucherObjet(V, o, ev); }
    else if(etat === 'caresse'){ if(!car.n && !annule) caresser(V, o, 1); }
    else if(etat === 'defile'){ V.root.classList.remove('at-defile'); chasseFin(V); }
    else if(g) g.up(ev, annule);
  }
  function fin(){
    window.removeEventListener('pointermove', mv);
    window.removeEventListener('pointerup', up);
    window.removeEventListener('pointercancel', up);
    V.suivis = V.suivis.filter(function(f){ return f !== fin; });
  }
  window.addEventListener('pointermove', mv);
  window.addEventListener('pointerup', up);
  window.addEventListener('pointercancel', up);
  V.suivis.push(fin);
}
/* Peut-on le ranger dans le carton du coin ? (la décoration ; un rangement vide aussi) */
function rangeable(o){
  var c = catDe(o);
  if(o.t === 'chat' || c.special) return false;
  if(c.cases) return (o.cases || []).every(function(cs){ return !somme(cs.i); });
  return true;
}
function surReserve(V, ev){
  if(!V.elReserve) return false;
  var r = V.elReserve.getBoundingClientRect();
  return ev.clientX > r.left - 10 && ev.clientX < r.right + 10 && ev.clientY > r.top - 10 && ev.clientY < r.bottom + 10;
}
/* Au-dessus du bouton de l'autre pièce (en bas à gauche) ou de l'arche : l'objet lâché passe dans l'autre pièce */
function surSalle(V, ev){
  var l = [V.elSalle, q(V, '.at-arche')];
  return l.some(function(el){
    if(!el) return false;
    var r = el.getBoundingClientRect(), m = el === V.elSalle ? 10 : 0;
    return r.width > 0 && ev.clientX > r.left - m && ev.clientX < r.right + m && ev.clientY > r.top - m && ev.clientY < r.bottom + m;
  });
}
function debutGlisseObjet(V, e, o){
  var d = V.elO[o.id], chat = o.t === 'chat', range = rangeable(o);
  var enf = enfantsDe(V, o), els = [d].concat(enf.map(function(c){ return V.elO[c.id]; }).filter(Boolean));
  var p0 = chat ? chatPos(V, o) : posObj(V, o), pan0 = {x:V.pan.x, y:V.pan.y}, dernier = null, auBord = 0;
  function decal(ev){ return {dx:ev.clientX - e.clientX + (V.pan.x - pan0.x), dy:ev.clientY - e.clientY + (V.pan.y - pan0.y)}; }
  function poser(ev){ var m = decal(ev); els.forEach(function(x){ x.style.setProperty('--dx', m.dx + 'px'); x.style.setProperty('--dy', m.dy + 'px'); }); }
  function bords(){
    if(!dernier) return;
    var r = V.piece.getBoundingClientRect(), m = 44, vx = 0, vy = 0;
    if(dernier.clientX < r.left + m) vx = -12; else if(dernier.clientX > r.right - m) vx = 12;
    if(dernier.clientY < r.top + m) vy = -12; else if(dernier.clientY > r.bottom - m) vy = 12;
    /* on reste un peu au bord avant que la pièce défile : on peut lâcher sur une chose près du bord sans qu'elle s'en aille */
    /* (au-dessus du carton 📦 : la pièce ne bouge pas, on peut y lâcher l'objet tranquillement) */
    if((range && surReserve(V, dernier)) || surSalle(V, dernier)){ vx = 0; vy = 0; }
    if(vx || vy){ if(!auBord) auBord = Date.now(); if(Date.now() - auBord > 280){ panPar(V, vx, vy); poser(dernier); } }
    else auBord = 0;
  }
  if(chat) chatSaisi(V, o);
  els.forEach(function(x){ x.classList.add('at-leve'); });
  d.style.zIndex = 99000;
  enf.forEach(function(c, i){ var x = V.elO[c.id]; if(x) x.style.zIndex = 99001 + i; });
  son(V, 'clic');
  V.glisse = true;
  if(range && V.elReserve) V.elReserve.classList.add('at-cible-ok');
  if(V.elSalle) V.elSalle.classList.add('at-cible-ok');
  if(V.root.classList.contains('at-glissable')) V.defile = setInterval(bords, 40);
  return {
    move:function(ev){
      dernier = ev; poser(ev);
      if(range && V.elReserve) V.elReserve.classList.toggle('at-survol', surReserve(V, ev));
      var ss = surSalle(V, ev);
      if(V.elSalle) V.elSalle.classList.toggle('at-survol', ss);
      V.root.classList.toggle('at-arche-survol', ss);
    },
    up:function(ev, annule){
      if(V.defile){ clearInterval(V.defile); V.defile = null; }
      V.glisse = false;
      if(V.elReserve){ V.elReserve.classList.remove('at-cible-ok'); V.elReserve.classList.remove('at-survol'); }
      if(V.elSalle){ V.elSalle.classList.remove('at-cible-ok'); V.elSalle.classList.remove('at-survol'); }
      V.root.classList.remove('at-arche-survol');
      els.forEach(function(x){ x.classList.remove('at-leve'); });
      if(!annule && range && surReserve(V, ev)){ rangerDansReserve(V, o); if(chat) chatLache(V, o); return; }
      if(!annule && surSalle(V, ev)){
        els.forEach(function(x){ x.style.removeProperty('--dx'); x.style.removeProperty('--dy'); });
        if(chat){ var stc = chatEtat(V, o); stc.pos = null; stc.tenu = false; }
        envoyerSalle(V, o);
        return;
      }
      var m = decal(ev), nx = p0.x + m.dx / V.k, ny = p0.y + m.dy / V.k;
      var avant = {};
      [o].concat(enf).forEach(function(c){ var pc = posObj(V, c); avant[c.id] = {x:pc.x + m.dx / V.k, y:pc.y + m.dy / V.k, s:pc.s}; });
      var coteAvant = o.cote || 0;
      if(!annule) resoudre(V, o, nx, ny);
      o.neuf = 0;
      els.forEach(function(x){ x.style.removeProperty('--dx'); x.style.removeProperty('--dy'); });
      d.classList.remove('at-neuf');
      if((o.cote || 0) !== coteAvant){
        /* contre un mur de côté (ou décollé du mur) : il se dessine de profil (ou de face) ; ce qui était posé dessus descend par terre */
        redessiner(V, o);
        enf.forEach(function(c){ var pc = avant[c.id]; c.sur = null; resoudre(V, c, pc.x, Math.max(pc.y + 60, SOL_MIN + 40)); });
        if(o.cote){ var tc = 'Contre le mur, de profil : il prend moins de place.'; toast(V, '<b>↔️ 🧱</b> ' + esc(tc), 2600, tc); }
      }
      [o].concat(enf).forEach(function(c){
        placerEl(V, c);
        var x = V.elO[c.id], a = avant[c.id], pn = posObj(V, c);
        if(!x || !a) return;
        var tx = (a.x - pn.x) * V.k, ty = (a.y - pn.y) * V.k, chute = ty < -50 * V.k;
        anim(x, chute ?
          [{transform:'translate(' + tx + 'px,' + ty + 'px) scale(' + a.s + ')'}, {transform:'translate(0,0) scale(' + pn.s * 1.05 + ',' + pn.s * 0.9 + ')', offset:0.8}, {transform:'translate(0,0) scale(' + pn.s + ')'}] :
          [{transform:'translate(' + tx + 'px,' + ty + 'px) scale(' + a.s + ')'}, {transform:'translate(0,0) scale(' + pn.s + ')'}],
          {duration:chute ? 420 : 260, easing:chute ? 'ease-in' : 'cubic-bezier(.3,1.5,.5,1)'});
      });
      son(V, 'pas');
      poussiere(V, o);
      if(chat) chatLache(V, o);
      chatsDe(V).forEach(function(c){ if(c !== o) placerEl(V, c); });   /* un chat assis sur ce meuble suit le meuble */
      if(catDe(o).special === 'chaudron' && V.etat.flaque) majFlaque(V);
      majLumiere(V);
      majReperes(V);
      changer(V);
    }
  };
}
/* Un petit « +3 🫐 » qui s'envole au-dessus d'un objet */
function flotter(V, o, txt){
  var F = cadreObjet(V, o.id) || {x:600, y:600, w:0, h:0}, d = document.createElement('div');
  d.className = 'at-flotte';
  d.textContent = txt;
  d.style.left = pX(V, F.x);
  d.style.top = pY(V, F.y - F.h * 0.8);
  V.calque.appendChild(d);
  apres(V, 1000, function(){ d.remove(); });
}
/* Petit nuage de poussière quand un meuble se pose */
function poussiere(V, o){
  var F = cadreObjet(V, o.id) || {x:600, y:600, w:100, h:0}, d = document.createElement('div');
  d.className = 'at-pouf';
  d.style.left = pX(V, F.x);
  d.style.top = pY(V, F.y);
  d.style.width = pW(V, F.w * 1.05);
  d.innerHTML = '<i></i><i></i><i></i><i></i>';
  V.calque.appendChild(d);
  apres(V, 700, function(){ d.remove(); });
}
function secouer(d){
  if(d) anim(d, [{transform:'translateX(0) scale(' + d._s + ')'}, {transform:'translateX(-6px) scale(' + d._s + ')'}, {transform:'translateX(6px) scale(' + d._s + ')'}, {transform:'translateX(0) scale(' + d._s + ')'}], {duration:300});
}
function nettoyerFlaque(V){
  V.etat.flaque = 0;
  var f = q(V, '.at-flaque');
  son(V, 'magie');
  if(f){ anim(f, [{opacity:1, transform:'scale(1)'}, {opacity:0, transform:'scale(.3)'}], {duration:500, fill:'forwards'}); apres(V, 520, function(){ f.remove(); }); }
  changer(V);
}

/* ---------- Le carton de rangement (l'icône 📦, en bas à droite de l'écran) ---------- */
function rangerDansReserve(V, o){
  var d = V.elO[o.id], enf = enfantsDe(V, o);
  enf.forEach(function(c){ var pc = posObj(V, c); c.sur = null; resoudre(V, c, pc.x, Math.max(pc.y + 60, SOL_MIN + 40)); placerEl(V, c); });
  V.etat.objets = V.etat.objets.filter(function(x){ return x !== o; });
  delete V.parId[o.id]; delete V.elO[o.id];
  var item = {id:o.id, t:o.t, st:o.st || 0, v:o.v || 0};
  if(o.on !== undefined) item.on = o.on;
  if(o.cases) item.cases = o.cases;
  V.etat.reserve.push(item);
  if(d){
    var r = V.elReserve.getBoundingClientRect(), rd = d.getBoundingClientRect();
    anim(d, [{transform:'scale(' + d._s + ')', opacity:1}, {transform:'translate(' + (r.left + r.width / 2 - rd.left - rd.width / 2) + 'px,' + (r.top + r.height * 0.3 - rd.top - rd.height / 2) + 'px) scale(' + d._s * 0.15 + ')', opacity:0.2}], {duration:380, easing:'ease-in', fill:'forwards'});
    apres(V, 400, function(){ d.remove(); });
  }
  if(o.t === 'lampe') majLumiere(V);
  apres(V, 380, function(){ majFixes(V); anim(V.elReserve, [{transform:'scale(1)'}, {transform:'scale(1.08,.92)', offset:0.4}, {transform:'scale(1)'}], {duration:300}); });
  son(V, 'porte');
  toast(V, '<b>🧸 ➡️ 📦</b> Rangé dans le carton', 2600, 'Rangé dans le carton.');
  majLumiere(V);
  changer(V);
}
function ouvrirReserve(V){
  ouvrirCalque(V, 'at-cal-reserve', '<div></div>');
  dessinerReserve(V);
  son(V, 'porte');
}
function dessinerReserve(V){
  var l = V.etat.reserve, corps;
  if(!l.length){
    var tv = 'Le carton est vide. Pour y ranger une décoration, garde le doigt dessus, puis glisse-la jusqu\'au carton.';
    corps = '<p class="at-feuille-txt">' + esc(tv) + ' ' + lireBtn(tv) + '</p>';
  } else {
    var tr = 'Touche une décoration pour la remettre dans la pièce.';
    corps = '<p class="at-feuille-txt">' + esc(tr) + ' ' + lireBtn(tr) + '</p><div class="at-res-liste">' + l.map(function(x, i){
      return '<button type="button" class="at-res-o" data-res="' + i + '"><span class="at-res-ic">' + svgObjet({t:x.t, st:x.st, v:x.v, on:x.on, cases:x.cases}) + '</span><b>' + esc(catDe(x).nom) + '</b></button>';
    }).join('') + '</div>';
  }
  V.grim.innerHTML = feuille('at-f-reserve', '<span class="at-f-ic">🧸</span><h3>Le carton de rangement</h3>', corps);
}
function sortirReserve(V, i){
  var x = V.etat.reserve[i];
  if(!x) return;
  V.etat.reserve.splice(i, 1);
  var o = {id:x.id || ('o' + (++V.etat.n)), t:x.t, x:600, y:700, f:0, v:x.v || 0, st:x.st || 0, sur:null, neuf:1};
  if(V.parId[o.id]) o.id = 'o' + (++V.etat.n);
  if(x.on !== undefined) o.on = x.on;
  if(x.cases) o.cases = x.cases;
  if(V.salle) o.pc = 1;
  trouverPlace(V, o);
  V.etat.objets.push(o);
  V.parId[o.id] = o;
  var d = elObjet(V, o);
  V.scene.appendChild(d);
  placerEl(V, o);
  fermerGrimoire(V);
  var p = posObj(V, o), F = cadreObjet(V, o.id);
  allerVers(V, F ? F.x : p.x, F ? F.y - F.h / 2 : p.y);
  anim(d, [{transform:'scale(' + p.s * 0.2 + ')', opacity:0}, {transform:'scale(' + p.s * 1.12 + ')', opacity:1, offset:0.6}, {transform:'scale(' + p.s + ')'}], {duration:520, easing:'ease-out'});
  majFixes(V);
  majLumiere(V);
  son(V, 'gain');
  changer(V);
}

/* ---------- Ouvrir un carton de meubles : un objet sort à chaque toucher ----------
   S'il n'y a plus de place pour une décoration, elle va dans le carton du coin (la pièce reste rangée). */
function ouvrirCarton(V, kid){
  var k = V.etat.cartons.filter(function(x){ return x.id === kid; })[0], ke = V.elK[kid];
  if(!k || !ke || !k.reste.length) return;
  if(!k.ouvert){ k.ouvert = 1; ke.classList.add('at-ouvert-c'); }
  anim(ke, [{transform:'scale(' + ke._s + ')'}, {transform:'scale(' + ke._s * 1.1 + ',' + ke._s * 0.86 + ')', offset:0.3}, {transform:'scale(' + ke._s * 0.96 + ',' + ke._s * 1.06 + ')', offset:0.6}, {transform:'scale(' + ke._s + ')'}], {duration:380});
  var t = k.reste.shift();
  if(k.t === 'colis' && V.etat.boutique.indexOf(t) < 0) V.etat.boutique.push(t);
  var o = creerObjet(V, t);
  if(k.ch) o.pc = 1;
  var place = trouverPlace(V, o);
  if(!place && rangeable(o)){
    var item = {id:o.id, t:o.t, st:o.st || 0, v:o.v || 0};
    if(o.on !== undefined) item.on = o.on;
    V.etat.reserve.push(item);
    majFixes(V);
    anim(V.elReserve, [{transform:'scale(1)'}, {transform:'scale(1.12,.9)', offset:0.4}, {transform:'scale(1)'}], {duration:360});
    var tp = 'Il n\'y a plus de place : je l\'ai mis dans le carton 📦.';
    toast(V, '<b>' + (catDe(o).ic || '✨') + ' ➡️ 📦</b> ' + esc(tp), 3600, tp);
    son(V, 'gain');
  } else {
    V.etat.objets.push(o);
    V.parId[o.id] = o;
    var d = elObjet(V, o);
    V.scene.appendChild(d);
    placerEl(V, o);
    var p = posObj(V, o), dx = (ke._p[0] - p.x) * V.k, dy = (ke._p[1] - ke._t[1] * ke._s * 0.6 - p.y) * V.k;
    anim(d, [
      {transform:'translate(' + dx + 'px,' + dy + 'px) scale(' + p.s * 0.15 + ')', opacity:0},
      {transform:'translate(' + dx * 0.5 + 'px,' + (dy * 0.5 - 150 * V.k) + 'px) scale(' + p.s * 1.12 + ')', opacity:1, offset:0.5},
      {transform:'translate(0,0) scale(' + p.s * 1.08 + ',' + p.s * 0.9 + ')', offset:0.85},
      {transform:'translate(0,0) scale(' + p.s + ')'}
    ], {duration:720, easing:'ease-out'});
    son(V, 'gain');
    if(o.t === 'chat') chatsDemarrer(V);
  }
  var reste = ke.querySelector('.at-reste');
  if(reste) reste.innerHTML = new Array(Math.min(6, k.reste.length) + 1).join('<i></i>');
  if(!k.reste.length){
    V.etat.cartons = V.etat.cartons.filter(function(x){ return x !== k; });
    delete V.elK[kid];
    anim(ke, [{transform:'scale(' + ke._s + ')', opacity:1}, {transform:'scale(' + ke._s * 1.2 + ',' + ke._s * 0.2 + ')', opacity:0}], {duration:450, delay:250, fill:'forwards', easing:'ease-in'});
    apres(V, 720, function(){
      ke.remove();
      V.etat.cartons.forEach(function(x, i){
        var e2 = V.elK[x.id];
        if(!e2) return;
        var n2 = elCarton(V, x, i);
        e2.replaceWith(n2);
      });
    });
  }
  majIndiceCarton(V);
  majLumiere(V);
  changer(V);
}

/* ==========================================================
   Ranger : la cueillette (par terre devant la porte) → les rangements
   - on glisse un tas jusqu'à un rangement de la pièce (dans un tiroir, un bocal…) ;
   - ou on le touche : « où le ranger ? », puis le gros plan.
   ========================================================== */
var TXT_RANGER = 'Glisse un ingrédient jusqu\'à un rangement, ou touche-le puis touche un tiroir, un placard ou un bocal : il va dedans. ' +
  'Les liquides, comme l\'eau, vont dans les bocaux et les fioles. Les choses sèches vont dans les tiroirs et les placards.';
/* Un rangement de la pièce sous le doigt (et sa case, si on vise un tiroir ou un bocal précis) */
function cibleRangement(V, x, y){
  var el = document.elementFromPoint(x, y);
  if(!el || !V.root.contains(el)) return null;
  var od = el.closest('.at-o');
  if(!od) return null;
  var o = V.parId[od.getAttribute('data-obj')];
  if(!o || !catDe(o).cases) return null;
  var gc = el.closest('[data-case]');
  return {o:o, ci:gc ? +gc.getAttribute('data-case') : 0, el:od};
}
function glisserTas(V, e, k, el){
  var n = V.etat.panier[k] || 0;
  if(!n) return;
  var g = null, rr = V.root.getBoundingClientRect(), survol = null, dernier = null, auBord = 0;
  function pose(ev){ if(g) g.style.transform = 'translate(' + (ev.clientX - rr.left) + 'px,' + (ev.clientY - rr.top) + 'px)'; }
  function bords(){
    if(!dernier) return;
    var r = V.piece.getBoundingClientRect(), m = 44, vx = 0, vy = 0;
    if(dernier.clientX < r.left + m) vx = -12; else if(dernier.clientX > r.right - m) vx = 12;
    if(dernier.clientY < r.top + m) vy = -12; else if(dernier.clientY > r.bottom - m) vy = 12;
    if(vx || vy){ if(!auBord) auBord = Date.now(); if(Date.now() - auBord > 280) panPar(V, vx, vy); }
    else auBord = 0;
  }
  suivre(V, e, {
    debut:function(ev){
      g = fantome(V, k, n);
      pose(ev);
      el.classList.add('at-pris');
      V.glisse = true;
      V.avaitCarton = true;
      majCiblesSel(V, k);
      son(V, 'clic');
      if(V.root.classList.contains('at-glissable')) V.defile = setInterval(bords, 40);
    },
    move:function(ev){
      dernier = ev;
      pose(ev);
      var c = cibleRangement(V, ev.clientX, ev.clientY), cel = c ? c.el : null;
      if(cel !== survol){ if(survol) survol.classList.remove('at-survol'); survol = cel; if(survol) survol.classList.add('at-survol'); }
    },
    up:function(ev, bouge, annule){
      V.glisse = false;
      if(V.defile){ clearInterval(V.defile); V.defile = null; }
      if(survol) survol.classList.remove('at-survol');
      el.classList.remove('at-pris');
      majCiblesSel(V);
      if(!bouge){ if(!annule) ouvrirArrivage(V, k); return; }
      var c = annule ? null : cibleRangement(V, ev.clientX, ev.clientY);
      if(g) g.remove();
      if(!c) return;
      var mis = rangerDans(V, {de:'panier', ingr:k}, V.etat.panier[k] || 0, c.o, c.ci);
      apresRangement(V);
      if(mis) flotter(V, c.o, '+' + mis + ' ' + icIngr(k));
    }
  });
}
function fantome(V, ingr, n){
  var g = document.createElement('div');
  g.className = 'at-fantome';
  g.style.setProperty('--c', coulIngr(ingr));
  g.innerHTML = '<span>' + icIngr(ingr) + '</span>' + (n > 1 ? '<b>×' + n + '</b>' : '');
  V.fantomes.appendChild(g);
  return g;
}
function cibleSous(V, x, y){
  var el = document.elementFromPoint(x, y);
  if(!el || !V.root.contains(el)) return null;
  var t = el.closest('[data-cible]');
  if(!t) return null;
  var ty = t.getAttribute('data-cible');
  if(ty === 'case') return {t:'case', o:t.getAttribute('data-obj'), ci:+t.getAttribute('data-case'), el:t};
  return {t:ty, el:t};
}
function dispo(V, src){
  if(src.de === 'panier') return V.etat.panier[src.ingr] || 0;
  var o = V.parId[src.o];
  return o ? ((o.cases[src.ci] || {i:{}}).i[src.ingr] || 0) : 0;
}
function prendre(V, src, n){
  if(src.de === 'panier'){ V.etat.panier[src.ingr] -= n; if(V.etat.panier[src.ingr] <= 0) delete V.etat.panier[src.ingr]; return; }
  var cs = V.parId[src.o].cases[src.ci];
  cs.i[src.ingr] -= n;
  if(cs.i[src.ingr] <= 0) delete cs.i[src.ingr];
}
/* Un jeton du gros plan : on le touche (choisir) ou on le fait glisser vers une case (ranger) */
function glisserIngr(V, e, src, surToucher){
  var n = dispo(V, src);
  if(n <= 0) return;
  var g = null, rr = V.root.getBoundingClientRect(), survol = null;
  function pose(ev){ if(g) g.style.transform = 'translate(' + (ev.clientX - rr.left) + 'px,' + (ev.clientY - rr.top) + 'px)'; }
  suivre(V, e, {
    debut:function(ev){
      g = fantome(V, src.ingr, n);
      pose(ev);
      if(src.el) src.el.classList.add('at-pris');
      V.glisse = true;
      majCasesOk(V, src.ingr);
      son(V, 'clic');
    },
    move:function(ev){
      pose(ev);
      var c = cibleSous(V, ev.clientX, ev.clientY), el = c ? c.el : null;
      if(el !== survol){ if(survol) survol.classList.remove('at-survol'); survol = el; if(survol) survol.classList.add('at-survol'); }
    },
    up:function(ev, bouge, annule){
      V.glisse = false;
      if(survol) survol.classList.remove('at-survol');
      if(src.el) src.el.classList.remove('at-pris');
      if(!bouge){ if(!annule && surToucher) surToucher(); return; }
      var c = annule ? null : cibleSous(V, ev.clientX, ev.clientY);
      if(g) g.remove();
      if(!c){ dessinerOuvert(V); return; }
      if(c.t === 'panier' && src.de === 'case'){ V.selCase = {o:src.o, ci:src.ci, ingr:src.ingr}; remettreAuCarton(V); return; }
      if(c.t === 'case'){
        var o = V.parId[c.o];
        if(o && !(src.de === 'case' && src.o === c.o && src.ci === c.ci)) rangerDans(V, src, n, o, c.ci);
      }
      apresRangement(V);
    }
  });
}
/* Choisir un ingrédient du carton (dans le carton, ou dans le plateau du gros plan) */
function choisirIngr(V, k){
  V.selCase = null;
  V.sel = V.sel === k ? null : k;
  son(V, 'clic');
  if(V.ouvert) dessinerOuvert(V);
  majTient(V);
}
function lacher(V){ V.sel = null; V.selCase = null; majTient(V); if(V.ouvert) dessinerOuvert(V); son(V, 'clic'); }
/* Choisir un ingrédient déjà rangé (pour le déplacer ou le remettre dans le carton) */
function choisirDansCase(V, oid, ci, k){
  if(V.sel){ toucherCase(V, V.parId[oid], ci); return; }
  var s = V.selCase;
  V.selCase = (s && s.o === oid && s.ci === ci && s.ingr === k) ? null : {o:oid, ci:ci, ingr:k};
  son(V, 'clic');
  dessinerOuvert(V);
}
/* Toucher une case du gros plan : y ranger ce qu'on tient, ou y déplacer ce qu'on a pris ailleurs */
function toucherCase(V, o, ci){
  if(!o) return;
  if(V.ouvert && V.ouvert.etq){ if(V.etqSel) collerEtiquette(V, o, ci, V.etqSel); return; }
  if(V.sel){ rangerDans(V, {de:'panier', ingr:V.sel}, V.etat.panier[V.sel] || 0, o, ci); apresRangement(V); return; }
  if(V.selCase){
    var s = V.selCase;
    if(s.o === o.id && s.ci === ci){ V.selCase = null; dessinerOuvert(V); return; }
    var src = {de:'case', o:s.o, ci:s.ci, ingr:s.ingr}, n = dispo(V, src);
    var mis = rangerDans(V, src, n, o, ci);
    if(mis) V.selCase = null;
    apresRangement(V);
    return;
  }
  var cs = o.cases[ci];
  if(!somme(cs.i)){
    var t = somme(V.etat.panier) ? 'Touche un ingrédient en bas, puis touche ce ' + motCase(o) + ' : il va dedans.' : 'Ce ' + motCase(o) + ' est vide. Ce que tu cueilles est posé par terre, devant la porte.';
    toast(V, '<b>👆</b> ' + esc(t), 3600, t);
  }
}
function motCase(o){ return {commode:'tiroir', casier:'tiroir', apothicaire:'tiroir', placard:'placard', bocaux:'bocal', suspendus:'bocal', epices:'pot', vitrine:'rayon', fioles_ingr:'flacon'}[o.t] || 'rangement'; }
function remettreAuCarton(V){
  var s = V.selCase;
  if(!s) return;
  var src = {de:'case', o:s.o, ci:s.ci, ingr:s.ingr}, n = dispo(V, src);
  if(n > 0){
    prendre(V, src, n);
    V.etat.panier[s.ingr] = (V.etat.panier[s.ingr] || 0) + n;
    son(V, 'clic');
    toast(V, '<b>' + icIngr(s.ingr) + ' ↩️ 🚪</b> Remis devant la porte', 2400, 'Remis devant la porte.');
  }
  V.selCase = null;
  apresRangement(V);
}
/* Range n ingrédients dans un rangement. Les liquides (eau, brume, miel) vont dans le verre, le reste dans le bois et la toile.
   On commence par la case touchée, puis une case qui a déjà cet ingrédient, puis une case vide. Renvoie combien sont rangés. */
function rangerDans(V, src, n, o, ci){
  var c = catDe(o), d = V.elO[o.id];
  if(!c.cases || !(n > 0)) return 0;
  if(!!c.verre !== estLiquide(src.ingr)){
    var txt = texteMauvaisRangement(src.ingr, o);
    son(V, 'ko'); secouer(d);
    var el = V.ouvertEl.querySelector('.at-case[data-case="' + ci + '"]');
    if(el) anim(el, [{transform:'translateX(0)'}, {transform:'translateX(-8px)'}, {transform:'translateX(8px)'}, {transform:'translateX(0)'}], {duration:320});
    toast(V, '<b>' + icIngr(src.ingr) + (estLiquide(src.ingr) ? ' ➡️ 🫙' : ' ➡️ 📦') + '</b> ' + esc(txt), 5200, txt);
    montrerRegles(V);
    return 0;
  }
  var idx = o.cases.map(function(x, j){ return j; });
  var ordre = [borne(ci || 0, 0, o.cases.length - 1)]
    .concat(idx.filter(function(j){ return (o.cases[j].i[src.ingr] || 0) > 0; }))
    .concat(idx.filter(function(j){ return !somme(o.cases[j].i); }))
    .concat(idx);
  var reste = n, mis = 0, vu = {};
  ordre.forEach(function(j){
    if(vu[j] || reste <= 0) return;
    vu[j] = 1;
    if(src.de === 'case' && src.o === o.id && src.ci === j) return;
    var place = c.cases[j].cap - somme(o.cases[j].i), q2 = Math.min(reste, place);
    if(q2 > 0){ prendre(V, src, q2); o.cases[j].i[src.ingr] = (o.cases[j].i[src.ingr] || 0) + q2; reste -= q2; mis += q2; }
  });
  if(!mis){ son(V, 'ko'); secouer(d); toast(V, '<b>🚫</b> C\'est plein ! Essaie un autre rangement.', 3200, 'C\'est plein ! Essaie un autre rangement.'); return 0; }
  son(V, 'plouf');
  if(src.de === 'panier'){ var ap = V.etat.appris || (V.etat.appris = {}), sorte = c.verre ? 'verre' : 'sec'; ap[sorte] = Math.min(APPRIS, (ap[sorte] || 0) + 1); }
  if(d) anim(d, [{transform:'scale(' + d._s + ')'}, {transform:'scale(' + d._s * 1.06 + ',' + d._s * 0.94 + ')', offset:0.4}, {transform:'scale(' + d._s + ')'}], {duration:260});
  V.dernierRange = {o:o.id, ci:ci, ingr:src.ingr, n:mis};
  if(reste > 0){ var tpl = 'C\'est plein ! Il en reste ' + reste + '.'; toast(V, '<b>🚫 ' + icIngr(src.ingr) + '</b> ' + esc(tpl), 3200, tpl); }
  changer(V);
  return mis;
}
/* Après un rangement : le meuble de la pièce, la cueillette par terre, le gros plan, ce qu'elle tient */
function apresRangement(V){
  V.etat.objets.forEach(function(o){ if(catDe(o).cases) redessiner(V, o); });
  majFixes(V);
  dessinerTas(V);
  if(V.sel && !(V.etat.panier[V.sel] > 0)) V.sel = null;
  if(V.ouvert) dessinerOuvert(V);
  majTient(V);
  majReperes(V);
  if(!somme(V.etat.panier) && V.avaitCarton){ V.avaitCarton = false; toast(V, '<b>🌿 ✔</b> Plus rien par terre : tout est rangé !', 3200, 'Plus rien par terre : tout est rangé !'); }
  V.avaitCarton = somme(V.etat.panier) > 0;
}
/* Les rangements de la pièce qui acceptent l'ingrédient tenu brillent ; on glisse jusqu'au premier si aucun n'est visible */
function montrerRangements(V){
  var k = V.sel;
  if(!k) return;
  var bons = V.etat.objets.filter(function(o){ var c = catDe(o); return c.cases && !!c.verre === estLiquide(k); });
  if(!bons.length){ var tb = estLiquide(k) ? 'Il te faut un bocal ou une fiole : ouvre un carton !' : 'Il te faut un tiroir ou un placard : ouvre un carton !'; toast(V, '<b>' + (estLiquide(k) ? '🫙' : '📦') + ' ?</b> ' + esc(tb), 3600, tb); return; }
  if(!bons.some(function(o){ return salleDe(o) === V.salle; })){ changerSalle(V, salleDe(bons[0])); }
  var vus = bons.filter(function(o){ var e = V.elO[o.id]; if(!e) return false; var r = e.getBoundingClientRect(), p = V.piece.getBoundingClientRect(); return r.right > p.left + 20 && r.left < p.right - 20 && r.bottom > p.top + 20 && r.top < p.bottom - 20; });
  var la = bons.filter(function(o){ return salleDe(o) === V.salle; })[0];
  if(!vus.length && la){ var p0 = posObj(V, la), c0 = catDe(la); allerVers(V, p0.x, p0.y - c0.h * p0.s / 2); }
}

/* ---------- Le gros plan d'un rangement ---------- */
function ouvrir(V, o){
  V.toastEl.hidden = true;
  V.ouvert = {o:o.id, etq:false};
  V.selCase = null; V.etqSel = null;
  V.avaitCarton = somme(V.etat.panier) > 0;
  dessinerOuvert(V, true);
  majTient(V);
  son(V, 'porte');
}
function fermerOuvert(V){
  V.ouvert = null; V.selCase = null; V.etqSel = null;
  V.ouvertEl.hidden = true;
  V.ouvertEl.innerHTML = '';
  majTient(V);
}
var DISPO_ZOOM = {commode:'tiroirs', casier:'grille', apothicaire:'grille', placard:'grille', vitrine:'tiroirs', bocaux:'bocaux', suspendus:'bocaux', epices:'fioles', fioles_ingr:'fioles'};
function listeEtq(){ return cles(INGR).concat(cles(ETQ_EXTRA)); }
function majCasesOk(V, k){
  if(!V.ouvert) return;
  var o = V.parId[V.ouvert.o];
  if(!o) return;
  var ok = !!catDe(o).verre === estLiquide(k);
  V.ouvertEl.querySelectorAll('.at-case').forEach(function(e){ e.classList.toggle('at-ok', ok); e.classList.toggle('at-non', !ok); });
}
function dessinerOuvert(V, neuf){
  var st = V.ouvert, ov = V.ouvertEl;
  var o = st && V.parId[st.o];
  if(!o){ fermerOuvert(V); return; }
  var c = catDe(o), verre = !!c.verre, prep = V.mode === 'prep', tenu = V.sel, sc = V.selCase;
  var cases = c.cases.map(function(k, i){
    var cs = o.cases[i], l = trier(cs), tot = somme(cs.i);
    var ok = tenu ? (verre === estLiquide(tenu)) : sc ? (verre === estLiquide(sc.ingr) && !(sc.o === o.id && sc.ci === i)) : false;
    var non = (tenu && !ok) || (sc && verre !== estLiquide(sc.ingr));
    var dedans = l.length ? l.map(function(x){
      var choisi = sc && sc.o === o.id && sc.ci === i && sc.ingr === x;
      return '<button type="button" class="at-chipi' + (choisi ? ' on' : '') + '" data-de="case" data-ci="' + i + '" data-ingr="' + x + '" style="--c:' + coulIngr(x) + '">' +
        '<span>' + icIngr(x) + '</span><b>×' + cs.i[x] + '</b><small>' + esc(nomIngr(x)) + '</small></button>';
    }).join('') : '<span class="at-case-vide">vide</span>';
    var etq = cs.e.map(function(id, j){ return '<button type="button" class="at-etq-g" data-ci="' + i + '" data-retire="' + j + '" aria-label="Décoller"><span>' + icEtq(id) + '</span></button>'; }).join('');
    var places = '';
    for(var j = 0; j < k.cap; j++) places += '<i class="' + (j < tot ? 'p' : '') + '"></i>';
    return '<div class="at-case' + (ok ? ' at-ok' : '') + (non ? ' at-non' : '') + (V.dernierRange && V.dernierRange.o === o.id && V.dernierRange.ci === i ? ' at-vient' : '') + '" data-cible="case" data-obj="' + o.id + '" data-case="' + i + '">' +
      (etq ? '<div class="at-case-etq">' + etq + '</div>' : '') +
      '<div class="at-case-contenu">' + dedans + '</div><div class="at-case-places" aria-label="' + tot + ' sur ' + k.cap + '">' + places + '</div></div>';
  }).join('');
  V.dernierRange = null;
  /* en bas : ce qui attend par terre devant la porte (ou la planche d'étiquettes) */
  var bas;
  if(st.etq){
    bas = '<div class="at-plateau at-planche-etq"><p class="at-plateau-tit">🏷️ Choisis une étiquette, puis touche une case</p><div class="at-planche">' +
      listeEtq().map(function(id){ return '<button type="button" class="at-autoc' + (V.etqSel === id ? ' on' : '') + '" data-etq="' + id + '"><span>' + icEtq(id) + '</span></button>'; }).join('') + '</div></div>';
  } else {
    var p = V.etat.panier, ks = cles(p).filter(function(k){ return p[k] > 0; });
    var tit = sc ? '↩️ Touche ici pour remettre ' + icIngr(sc.ingr) + ' devant la porte' : ks.length ? '🌿 Devant la porte : touche, puis range' : '🌿 Plus rien devant la porte';
    bas = '<div class="at-plateau' + (sc ? ' at-retour' : '') + '" data-cible="panier"><p class="at-plateau-tit">' + tit +
      ' <button type="button" class="at-rond at-lire" data-lu="' + esc(sc ? 'Touche ici pour le remettre devant la porte.' : ks.length ? TXT_RANGER : 'Plus rien devant la porte.') + '" aria-label="Écouter">🔊</button></p>' +
      (ks.length ? '<div class="at-plateau-j">' + ks.map(function(k){
        return '<div class="at-jeton-g' + (tenu === k ? ' on' : '') + (estLiquide(k) ? ' liquide' : '') + '" data-de="panier" data-ingr="' + k + '" style="--c:' + coulIngr(k) + '"><span>' + icIngr(k) + '</span><b>' + esc(nomIngr(k)) + (p[k] > 1 ? ' ×' + p[k] : '') + '</b></div>';
      }).join('') + '</div>' : '') + '</div>';
  }
  var regle = verre ? '<span class="at-zoom-regle v">💧 pour les liquides</span>' : '<span class="at-zoom-regle s">🍃 pour les choses sèches</span>';
  ov.className = 'at-ouvert at-ouv-' + c.t + (prep ? ' at-ouv-prep' : '') + (tenu || sc ? ' at-tient-qqch' : '');
  ov.innerHTML = '<div class="at-zoom">' +
    '<div class="at-zoom-tete"><span class="at-zoom-ic">' + svgObjet({t:o.t, v:o.v, st:o.st, cases:o.cases, on:o.on}) + '</span><div class="at-zoom-nom"><b>' + esc(c.nom) + '</b>' + regle + '</div>' +
      (prep ? '' : '<button type="button" class="at-rond at-peindre" aria-label="Changer la couleur">🎨</button><button type="button" class="at-rond at-zoom-etq' + (st.etq ? ' on' : '') + '" aria-label="Étiquettes">🏷️</button>') +
      '<button type="button" class="at-rond at-fermer" aria-label="Fermer">✖</button></div>' +
    '<div class="at-zoom-corps at-disp-' + (DISPO_ZOOM[c.t] || 'grille') + '" style="--n:' + c.cases.length + '">' + cases + '</div>' +
    (prep ? '' : bas) + '</div>';
  ov.hidden = false;
  if(neuf) anim(ov.firstChild, [{transform:'scale(.6)', opacity:0}, {transform:'none', opacity:1}], {duration:260, easing:'cubic-bezier(.3,1.3,.5,1)'});
  var v = ov.querySelector('.at-vient');
  if(v) anim(v, [{transform:'scale(1)'}, {transform:'scale(1.05)', offset:0.4}, {transform:'scale(1)'}], {duration:360});
}
function collerEtiquette(V, o, ci, id){
  var cs = o.cases[ci];
  if(cs.e.indexOf(id) >= 0){ son(V, 'ko'); return; }
  if(cs.e.length >= 3) cs.e.shift();
  cs.e.push(id);
  son(V, 'clic');
  redessiner(V, o);
  dessinerOuvert(V);
  changer(V);
}
function retirerEtiquette(V, o, ci, j, b){
  var cs = o.cases[ci];
  if(V.mode !== 'ranger' || !cs) return;
  anim(b, [{transform:'none', opacity:1}, {transform:'translate(14px,-24px) rotate(40deg) scale(.6)', opacity:0}], {duration:260, fill:'forwards'});
  son(V, 'clic');
  apres(V, 240, function(){
    cs.e.splice(j, 1);
    redessiner(V, o);
    dessinerOuvert(V);
    changer(V);
  });
}

/* ==========================================================
   Les grands panneaux (par-dessus la pièce)
   ========================================================== */
function ouvrirCalque(V, cls, html){
  fermerOuvert(V);
  V.toastEl.hidden = true;
  V.grim.className = 'at-grim ' + cls;
  V.grim.innerHTML = html;
  V.grim.hidden = false;
  majTient(V);
  anim(V.grim.firstChild, [{transform:'translateY(30px) scale(.94)', opacity:0}, {transform:'none', opacity:1}], {duration:300, easing:'cubic-bezier(.3,1.3,.5,1)'});
}
function fermerGrimoire(V){ V.grim.hidden = true; V.grim.innerHTML = ''; majTient(V); }
function ouvrirGrimoire(V){ ouvrirLivre(V); }      /* (ancien nom) */
function lireBtn(t){ return '<button type="button" class="at-rond at-lire" data-lu="' + esc(t) + '" aria-label="Écouter">🔊</button>'; }
function feuille(cls, titre, corps){
  return '<div class="at-feuille ' + cls + '"><button type="button" class="at-rond at-fermer" aria-label="Fermer">✖</button>' +
    '<div class="at-feuille-tete">' + titre + '</div><div class="at-feuille-corps">' + corps + '</div></div>';
}

/* ---------- La cueillette (posée devant la porte) : « où la ranger ? » ---------- */
function ouvrirArrivage(V, k){
  V.etat.nouveaux = 0;
  changer(V);
  dessinerTas(V); majReperes(V);
  V.avaitCarton = somme(V.etat.panier) > 0;
  if(k && V.etat.panier[k] > 0){ V.sel = k; V.selCase = null; }
  ouvrirCalque(V, 'at-cal-arrivage', '<div></div>');
  dessinerArrivage(V);
  son(V, 'porte');
}
function dessinerArrivage(V){
  var p = V.etat.panier, ks = cles(p).filter(function(k){ return p[k] > 0; }), k = V.sel && p[V.sel] > 0 ? V.sel : null, corps;
  if(!ks.length){
    var tv = 'Plus rien par terre. Ce que tu cueilles est posé ici, devant la porte.';
    corps = '<p class="at-feuille-txt">' + esc(tv) + ' ' + lireBtn(tv) + '</p>';
  } else {
    corps = '<p class="at-feuille-txt">Touche un ingrédient, puis choisis où le ranger. ' + lireBtn(TXT_RANGER) + '</p>' +
      '<div class="at-gros-jetons">' + ks.map(function(x){
        return '<button type="button" class="at-gj' + (x === k ? ' on' : '') + (estLiquide(x) ? ' liquide' : '') + '" data-prendre="' + x + '" style="--c:' + coulIngr(x) + '"><span>' + icIngr(x) + '<i>×' + p[x] + '</i></span><b>' + esc(nomIngr(x)) + '</b></button>';
      }).join('') + '</div>';
    if(k){
      var bons = V.etat.objets.filter(function(o){ var c = catDe(o); return c.cases && !!c.verre === estLiquide(k); });
      var libre = function(o){ var c = catDe(o), n = 0; o.cases.forEach(function(cs, j){ n += Math.max(0, c.cases[j].cap - somme(cs.i)); }); return n; };
      corps += '<div class="at-ou"><p class="at-ou-tit">' + icIngr(k) + ' <b>' + esc(nomIngr(k)) + '</b> va dans ' + (estLiquide(k) ? '💧 un bocal ou une fiole' : '🍃 un tiroir ou un placard') + ' :</p>' +
        (bons.length ? '<div class="at-ou-liste">' + bons.map(function(o){
          var c = catDe(o), n = libre(o);
          return '<button type="button" class="at-ou-b' + (n ? '' : ' plein') + '" data-vers="' + o.id + '"><span class="at-ou-ic">' + svgObjet({t:o.t, v:o.v, st:o.st, cases:o.cases, on:o.on}) + '</span><b>' + esc(c.nom) + '</b><small>' + (n ? n + ' place' + (n > 1 ? 's' : '') : 'plein') + '</small></button>';
        }).join('') + '</div>' : '<p class="at-feuille-txt">Il te faut d\'abord ' + (estLiquide(k) ? 'des bocaux' : 'un tiroir ou un placard') + ' : ouvre un carton de meubles !</p>') +
        (bons.length ? '<button type="button" class="at-gros at-dans-piece">👀 Le chercher dans la pièce</button>' : '') + '</div>';
    }
  }
  V.grim.innerHTML = feuille('at-f-arrivage', '<span class="at-f-ic">🌿</span><h3>Ta cueillette</h3>', corps);
}

/* ---------- Les potions (les flacons devant la porte) : à quoi elles servent, les donner (code), les vendre ---------- */
function ouvrirPotions(V, focus){
  V.potSel = focus || V.potSel;
  ouvrirCalque(V, 'at-cal-potions', '<div></div>');
  dessinerPotions(V);
  son(V, 'clic');
}
function dessinerPotions(V){
  var D = DD(), P = V.o.potions || {}, pots = cles(P).filter(function(k){ return P[k] > 0; }), nf = V.o.fioles || 0, corps = '';
  var fio = '';
  for(var i = 0; i < Math.min(nf, 12); i++) fio += '<i class="at-fv"></i>';
  var tf = nf ? 'Tu as ' + nf + ' fiole' + (nf > 1 ? 's' : '') + ' vide' + (nf > 1 ? 's' : '') + ' : il en faut une pour chaque potion.' : 'Tu n\'as plus de fiole vide : il en faut une pour chaque potion.';
  corps += '<div class="at-fioles-l">' + (fio || '<span class="at-fv-aucune">—</span>') + (nf > 12 ? '<b>+' + (nf - 12) + '</b>' : '') + '<p>' + esc(tf) + '</p>' + lireBtn(tf) + '</div>';
  if(!pots.length){
    var tv = 'Aucune potion pour l\'instant. Prépare-les au grand chaudron : leurs flacons arriveront par terre, devant la porte.';
    corps += '<p class="at-feuille-txt">' + esc(tv) + ' ' + lireBtn(tv) + '</p>';
  } else {
    if(!V.potSel || !(P[V.potSel] > 0)) V.potSel = pots[0];
    if(pots.length > 1) corps += '<div class="at-pot-onglets">' + pots.map(function(k){
      var p = (D.POTIONS || {})[k] || {};
      return '<button type="button" class="at-pot-o' + (k === V.potSel ? ' on' : '') + '" data-pot-voir="' + k + '" style="--c:' + (p.c || '#8ff3ff') + '"><span>' + (p.ic || '🧪') + '</span><b>×' + P[k] + '</b></button>';
    }).join('') + '</div>';
    var k = V.potSel, p = (D.POTIONS || {})[k] || {}, ut = utilePotion(k);
    var t = (p.nom || k) + '. ' + ut;
    corps += '<div class="at-pot-carte" style="--c:' + (p.c || '#8ff3ff') + '"><div class="at-pot-gros">' + (p.ic || '🧪') + '</div>' +
      '<div class="at-pot-txt"><h4>' + esc(p.nom || k) + ' <span>×' + P[k] + '</span></h4><p>' + esc(ut) + '</p>' + lireBtn(t) + '</div>' +
      '<div class="at-pot-actions"><button type="button" class="at-gros" data-act="donner-potion" data-id="' + k + '">🎁 Donner à un équipier</button>' +
      (V.o.vendre ? '<button type="button" class="at-gros second" data-act="vendre" data-id="' + k + '">🛒 Vendre au marché</button>' : '') + '</div></div>';
  }
  V.grim.innerHTML = feuille('at-f-potions', '<span class="at-f-ic">🧪</span><h3>Mes potions</h3>', corps);
}

/* ---------- La table d'analyse : les objets reçus ---------- */
function ouvrirAnalyses(V){
  ouvrirCalque(V, 'at-cal-analyses', feuille('at-f-analyses', '<span class="at-f-ic">🔍</span><h3>La paillasse d\'analyse</h3>' + boutonPeindre(V, 'pa'), corpsAnalyses(V)));
  son(V, 'clic');
}
function corpsAnalyses(V){
  var l = V.o.analyses || [], act = V.o.actions;
  if(!l.length){
    var tv = 'Quand un équipier te donne le code d\'un objet, tape-le dans l\'onglet Code : l\'objet arrivera sur cette paillasse.';
    return '<p class="at-feuille-txt">🔢 ' + esc(tv) + ' ' + lireBtn(tv) + '</p>';
  }
  return '<div class="at-an-liste">' + l.map(function(a){
    var res = a.fait ? (a.t || '') + (a.fait === 2 && a.detail ? ' ' + a.detail : '') : '';
    return '<div class="at-an' + (a.fait ? ' faite' : ' attend') + '"><div class="at-an-ic">' + (a.ic || '❔') + '</div><div class="at-an-txt"><h4>' + esc(a.nom || a.id) + '</h4>' +
      (a.fait ? '<p>' + esc(a.t || '') + '</p>' + (a.fait === 2 && a.detail ? '<p class="at-an-detail">🔍 ' + esc(a.detail) + '</p>' : '') + lireBtn(res) :
        '<p class="at-an-pas">Pas encore analysé.</p>' +
        (act === 0 ? '<p class="at-an-pas">⏳ Plus d\'action pour ce moment.</p>' : '') +
        '<button type="button" class="at-gros" data-act="analyser" data-id="' + a.id + '"' + (act === 0 ? ' disabled' : '') + '>🔬 Analyser · 1 action</button>') +
      '</div></div>';
  }).join('') + '</div>';
}

/* ---------- Le livre des recettes (lecture seule) et le chaudron (préparer) : deux écrans ---------- */
function rec(V, id){ return recettesDe(V).filter(function(r){ return r.id === id; })[0]; }
function stockRange(V){
  var t = {};
  V.etat.objets.forEach(function(o){ (o.cases || []).forEach(function(c){ cles(c.i).forEach(function(k){ t[k] = (t[k] || 0) + c.i[k]; }); }); });
  return t;
}
function zoneDeRecette(id){
  var D = DD(), C = (D.CHAUDRON || {})[id], Zc = D.ZONES_CHAUDRON || {};
  return C ? {id:C.zone, z:Zc[C.zone] || {nom:C.zone, grand:C.zone, c:'#3fcf6a'}} : null;
}
function texteRecette(V, id){
  var D = DD();
  if(id === 'sage') return 'Demande au Sage de te lire la recette !';
  var r = rec(V, id);
  if(!r) return '';
  if(r.connue === false) return r.nom + '. C\'est une recette secrète : demande au Sage de te la lire !';
  return r.nom + '. ' + (D.texteEtapes ? D.texteEtapes(id) : '') + '.';
}
function puceZone(Zr){
  return Zr ? '<span class="at-chip at-chip-zone' + (Zr.id === 'arc-en-ciel' ? ' ae' : '') + '" style="--z:' + Zr.z.c + '"><em>🎯</em><i class="at-zone-pastille"></i><b>' + esc(Zr.z.grand) + '</b></span>' : '';
}
function pucesRecette(r){
  var R = (DD().RECETTES || {})[r.id], i = 0;
  if(r.connue === false) return '<div class="at-chips">' + (R ? R.ingr : []).map(function(x){ i++; return '<span class="at-chip"><em>' + i + '</em><span class="at-ic-e">❓</span></span>'; }).join('') + '<span class="at-chip at-chip-secret"><span class="at-ic-e">🔒</span></span></div>';
  return '<div class="at-chips">' + (R ? R.ingr : []).map(function(x){
    i++; return '<span class="at-chip"><em>' + i + '</em><span class="at-ic-e">' + icIngr(x[0]) + '</span><b>×' + x[1] + '</b></span>';
  }).join('') + puceZone(zoneDeRecette(r.id)) + '</div>';
}

/* Le grimoire : une fiche par recette. Le nom, les ingrédients (ce qu'on a / ce qu'il faut, en rouge s'il en manque),
   à quoi sert la potion et pour qui (🔊), et « Préparer » (un raccourci vers le chaudron). Les secrètes : ❓ et le Sage. */
function utilePotion(id){ var p = (DD().POTIONS || {})[id] || {}; return p.utile || p.d || ''; }
function ouvrirLivre(V){
  if(V.mode !== 'ranger') return;
  if(!recettesDe(V).length) return;
  ouvrirCalque(V, 'at-cal-livre', '<div class="at-livre"></div>');
  dessinerLivre(V);
  son(V, 'page');
}
function ficheRecette(V, r){
  var R = (DD().RECETTES || {})[r.id] || {ingr:[]}, e = etatRecette(V, r.id), s = stockRange(V), pan = V.etat.panier, secrete = r.connue === false;
  var vus = {}, ingr = [];
  R.ingr.forEach(function(x){ if(vus[x[0]] === undefined){ vus[x[0]] = ingr.length; ingr.push([x[0], x[1]]); } else ingr[vus[x[0]]][1] += x[1]; });
  var ligne = ingr.map(function(x){
    var k = x[0], a = s[k] || 0, ok = a >= x[1];
    if(secrete) return '<div class="at-ri"><span class="at-ri-ic">❓</span><small>?</small></div>';
    return '<div class="at-ri ' + (ok ? 'ok' : 'ko') + '" data-ingr="' + k + '"><span class="at-ri-ic" style="--c:' + coulIngr(k) + '">' + icIngr(k) +
      '<b>' + (ok ? '✓ ' : '') + Math.min(a, 99) + '/' + x[1] + '</b>' + (!ok && (pan[k] || 0) > 0 ? '<i class="at-ri-carton" title="par terre, devant la porte">🌿</i>' : '') + '</span><small>' + esc(nomIngr(k)) + '</small></div>';
  }).join('');
  var ut = utilePotion(r.id);
  return '<div class="at-rcarte' + (e.pret ? ' pret' : ' manque') + (secrete ? ' secrete' : '') + '" style="--c:' + (r.c || '#8ff3ff') + '" data-fiche="' + r.id + '">' +
    '<h4><span class="at-rec-ic">' + (r.ic || '🧪') + '</span><span>' + esc(r.nom) + '</span>' + lireBtn(r.nom + '. ' + ut) + '</h4>' +
    '<div class="at-ringr">' + ligne + '</div>' +
    (secrete ? '<p class="at-rsage">📜 ' + esc('Recette secrète : demande au Sage de te la lire !') + ' <button type="button" class="at-rond" data-lire="sage" aria-label="Écouter">🔊</button></p>' : '') +
    '<p class="at-rutile">' + esc(ut) + '</p>' +
    '<button type="button" class="at-rpreparer' + (e.pret ? '' : ' ko') + '" data-r="' + r.id + '">🍲 Préparer</button></div>';
}
function dessinerLivre(V){
  var rs = recettesDe(V);
  V.grim.innerHTML = '<div class="at-livre at-grimoire"><button type="button" class="at-rond at-fermer" aria-label="Fermer">✖</button>' +
    '<div class="at-livre-titre">📖 <span>Le grimoire</span>' + boutonPeindre(V, 'lu') + '</div>' +
    '<div class="at-rcartes">' + rs.map(function(r){ return ficheRecette(V, r); }).join('') + '</div></div>';
}
/* « Préparer » sur une fiche : si tout est rangé, on va au chaudron ; sinon le bouton tremble et ce qui manque clignote */
function preparerDepuisLivre(V, rid, b){
  var e = etatRecette(V, rid);
  if(e.pret){ demarrer(V, rid, b); return; }
  son(V, 'ko'); vibrer(40);
  anim(b, [{transform:'translateX(0)'}, {transform:'translateX(-9px)'}, {transform:'translateX(9px)'}, {transform:'translateX(-5px)'}, {transform:'translateX(0)'}], {duration:360});
  var f = V.grim.querySelector('[data-fiche="' + rid + '"]');
  if(f) f.querySelectorAll('.at-ri.ko').forEach(function(x){ x.classList.remove('at-flash'); void x.offsetWidth; x.classList.add('at-flash'); });
}

/* Le chaudron : ce qu'elle peut préparer TOUT DE SUITE (tous les ingrédients rangés), en gros boutons.
   Rien de possible : le chaudron bouillonne, une petite phrase (🔊) et le grimoire brille. */
function etatRecette(V, id){
  var b = besoinDe(id), s = stockRange(V), pan = V.etat.panier, manquent = [], auPanier = false;
  cles(b).forEach(function(k){
    var m = b[k] - (s[k] || 0);
    if(m > 0){ manquent.push([k, m]); if((pan[k] || 0) > 0) auPanier = true; }
  });
  return {pret:!manquent.length, manquent:manquent, auPanier:auPanier};
}
function ouvrirChaudron(V){
  if(V.mode !== 'ranger') return;
  var prets = recettesDe(V).filter(function(r){ return etatRecette(V, r.id).pret; });
  if(!prets.length){
    son(V, 'bulle');
    var ch = V.elO.ch;
    if(ch){ ch.classList.remove('at-bouillonne'); void ch.offsetWidth; ch.classList.add('at-bouillonne'); apres(V, 1700, function(){ ch.classList.remove('at-bouillonne'); }); }
    var t = 'Il te manque des ingrédients : regarde le grimoire 📖';
    toast(V, esc(t), 5200, 'Il te manque des ingrédients : regarde le grimoire.', '<button type="button" class="at-rond at-toast-peindre" aria-label="Changer la couleur du chaudron">🎨</button>');
    var lu = V.elO.lu;
    if(lu){ lu.classList.add('at-livre-appel'); apres(V, 5200, function(){ if(V.elO.lu) V.elO.lu.classList.remove('at-livre-appel'); majReperes(V); }); majReperes(V); }
    return;
  }
  if(!((V.o.fioles || 0) > 0)){
    son(V, 'ko');
    var tf = 'Il te faut une fiole vide pour mettre la potion.';
    toast(V, '<b>🧪</b> ' + esc(tf), 4600, tf);
    brillerVides(V);
    return;
  }
  ouvrirCalque(V, 'at-cal-chaudron', '<div class="at-livre"></div>');
  dessinerChaudron(V, prets);
  son(V, 'bulle');
}
function dessinerChaudron(V, prets){
  prets = prets || recettesDe(V).filter(function(r){ return etatRecette(V, r.id).pret; });
  var boutons = prets.map(function(r){
    return '<button type="button" class="at-ch-go" data-r="' + r.id + '" style="--c:' + (r.c || '#8ff3ff') + '"><span class="at-ch-go-ic">' + (r.ic || '🧪') + '</span><b>' + esc(r.nom) + '</b><span class="at-ch-go-p">🍲 Préparer</span></button>';
  }).join('');
  var t = prets.length > 1 ? 'Tu peux préparer ' + prets.length + ' potions. Laquelle ?' : 'Tu peux préparer cette potion !';
  V.grim.innerHTML = '<div class="at-livre at-livre-ch"><button type="button" class="at-rond at-fermer" aria-label="Fermer">✖</button>' +
    '<div class="at-ch-titre"><span>🍲</span><h3>Le chaudron</h3>' + boutonPeindre(V, 'ch') + '</div>' +
    '<p class="at-feuille-txt">' + esc(t) + ' ' + lireBtn(t) + '</p>' +
    '<div class="at-ch-boutons">' + boutons + '</div></div>';
}
