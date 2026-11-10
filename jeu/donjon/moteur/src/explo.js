/* explo.js — l'exploration du donjon (MOTEUR-DONJON.md §3.3 et §3.4) : la carte et sa brume, l'écran de passage,
   les salles sans combat, les objets, les codes, le sac, les sauvegardes. Les règles (regles.js) décident de tout ;
   ici on montre, et on joue les évènements qu'elles rendent.

     DJ.Explo.demarrer(parametres)    reprend la partie gardée (localStorage) ou en commence une
     DJ.Explo.etat()                  pour les tests : {ecran, lieu, ici, occupe, sorties}

   Règles de Romain tenues ici : aucune lecture vocale sans bouton 🔊 (tout texte de plus de 3 mots a le sien) ; boutons
   jaunes à texte noir pour « aller » ; les aides sont racontées par un conteur (jamais « Touche… ») et ce qu'il faut
   toucher porte le rond jaune ; pas de minuteur ; une explication en images et un bouton jaune avant le couloir aux dalles. */
(function(){
'use strict';
var SALLE = window.SALLE, DJ = window.DJ, D = window.DonjonDonnees, Regles = window.Regles, C = window.CARTE_DONJON, CODES = window.DONJON_CODES;
var el = DJ.el, q = DJ.q, qa = DJ.qa, esc = DJ.esc, attendre = DJ.attendre, HER = DJ.HER, hCx = DJ.hCx, hPt = DJ.hPt, ORDRE = D.ORDRE;
function son(){ DJ.son.apply(null, arguments); }
function bruit(id, o, ancien){ return DJ.bruit(id, o, ancien); }
var X = {partie:null, V:null, ecran:'', occupe:false, ici:'puits', scene:null, texte:''};
var jeu;

/* ce que dit le conteur en arrivant quelque part (phrases courtes, un peu d'humour) */
var PHRASES = {
  puits:'Le fond du puits. Trois passages s\'enfoncent dans la brume… Par où aller ?',
  galerie:'Des éboulis, rien que des éboulis… Et quelque chose qui brille !',
  aeration:'Un rayon de lune tombe par une grille. Des herbes y poussent, et quelqu\'un a oublié sa sacoche.',
  reserve:'Une vieille réserve. Un coffre attend là, depuis bien longtemps.',
  givre:'Brrr ! Il fait froid ici. Une fleur de givre brille au fond.',
  bibliotheque:'Des livres qui flottent sur l\'eau qui luit. Les Fondateurs lisaient beaucoup.',
  eboulis:'Un cul-de-sac. Un tas d\'os… et un mur qui a l\'air de garder un secret.',
  dalles:'Des dalles claires, des dalles sombres… Attention où l\'on met les pieds !',
  portes:'Trois portes : un œil, une gueule, une lune. Laquelle pousser ?',
  crypte:'La crypte est calme, maintenant. Reste ce gros sarcophage…',
  camp:'Un feu de camp ! On souffle un peu.',
  porte4:'Une grande porte ronde, avec quatre signes. Et un chat qui gratte tout en bas…',
  leo:'Une lanterne tremble, tout au fond…'
};
var SUR_CARTE = {
  rats:'La salle des rats est vide. Ça sent encore le fromage moisi.', canaux:'Les canaux sont tranquilles. L\'eau coule sous le petit pont.',
  toiles:'La cave aux toiles. Plus rien ne bouge là-haut.', atelier:'L\'atelier des Fondateurs. Les engrenages se sont tus.',
  ossuaire:'L\'ossuaire. Les crânes vous regardent passer.', bassin:'Le grand bassin. L\'eau noire ne bouge plus.', J:'Le couloir se sépare en deux… Par où aller ?'
};
function nomLieu(id){ return id === 'J' ? 'L\'embranchement' : (D.LIEUX[id] ? D.LIEUX[id].nom : id); }
function garder(){ var p = X.partie; if(X.V){ try{ p.vus['@brume'] = X.V.etat().brume; }catch(e){} } DJ.garder(p); }

/* ====================================================================== 1. LE CONTEUR (une bulle, avec son 🔊) */
function conte(t){
  X.texte = t; DJ.conte(t);
  var b = q('#conteur'); if(!b) return;
  if(S && S.sansTexte){ b.style.visibility = 'hidden'; return; }      /* la réserve : pas de petit texte en bas, les objets parlent d'eux-mêmes */
  b.innerHTML = '<span class="txt">' + t + '</span>' + DJ.lireBtn(t);
  DJ.relancer(b, 'pop');
}

/* ====================================================================== 2. LE SAC DE L'ALCHIMISTE */
function ecranSac(o){
  o = o || {};
  var p = X.partie, places = Regles.placesSac(p), connues = D.ORDRE_RECETTES.filter(function(r){ return p.recettes.indexOf(r) >= 0; });
  var choix = ((p.sac && p.sac.length ? p.sac : DJ.dernierSac) || []).filter(function(r){ return connues.indexOf(r) >= 0; }).slice(0, places);
  quitterCarte();
  X.ecran = 'sac'; DJ.taire(); DJ.fermer();
  jeu.classList.remove('sur-carte'); jeu.innerHTML = '';
  var s = el('div', 'ecran'); s.id = 'sac'; s.className = 'ecran n' + connues.length;
  var phrase = o.premier ? 'Avant de descendre, l\'Alchimiste remplit son sac : ' + nb(places) + ' recettes, pas une de plus.'
    : 'L\'Alchimiste vide son sac. Les mêmes recettes, ou d\'autres ? ' + nb(places, true) + ', pas une de plus.';
  s.innerHTML = '<img class="fond" src="' + DJ.charger.decor('rats') + '" alt=""><div class="voile"></div>' +
    '<h1>Le sac d\'alchimiste</h1>' + DJ.curseursVolume() +
    '<div class="bulle" id="conteur"></div>' +
    '<div class="alchi"><img src="' + DJ.img('heros-alchimiste.png') + '" alt=""></div>' +
    '<div class="sac-poche"><b>Dans le sac</b><div class="sac-cases"></div></div>' +
    '<div class="recettes">' + connues.map(function(id){
      var r = D.RECETTES[id];
      return '<div class="recette" role="button" data-act="recette-sac" data-id="' + id + '"><span class="coche">✓</span>' + DJ.potion(id) +
        '<b>' + r.nom + '</b><small>' + r.long + '</small>' + DJ.lireBtn(r.nom + '. ' + r.long) + '</div>';
    }).join('') + '</div>' +
    '<div class="compte"></div>' +
    '<button class="aller" data-act="sac-pret" disabled>' + (o.premier ? 'Descendre ⬇' : 'C\'est prêt ➜') + '</button>';
  jeu.appendChild(s);
  DJ.brancherCurseurs(s);
  DJ.musiqueLieu((X.partie && X.partie.lieu) || 'puits');
  conte(phrase);
  function maj(neuve){
    qa('#sac .recette').forEach(function(b){ var c = choix.indexOf(b.getAttribute('data-id')) >= 0; b.classList.toggle('choisie', c); b.classList.toggle('guide', !c && choix.length < places); });
    var cases = ''; for(var k = 0; k < places; k++){ var id = choix[k]; cases += id ? '<div class="sac-case pleine"' + (id === neuve ? '' : ' style="animation:none"') + '>' + DJ.potion(id) + '</div>' : '<div class="sac-case"></div>'; }
    q('#sac .sac-cases').innerHTML = cases;
    q('#sac .sac-cases').classList.toggle('quatre', places > 3);
    var b = q('#sac .aller'); b.disabled = choix.length < places; b.classList.toggle('guide', choix.length === places);
    q('#sac .compte').innerHTML = '🎒 <b>' + choix.length + '</b> / <b>' + places + '</b>';
  }
  maj();
  return new Promise(function(fin){
    X.sac = {
      toucher:function(id, bouton){
        var k = choix.indexOf(id);
        son('clic');
        if(k >= 0){ choix.splice(k, 1); maj(); conte(D.RECETTES[id].nom + ' retourne sur l\'étagère.'); return; }
        if(choix.length >= places){ DJ.relancer(bouton, 'non'); conte('Le sac est plein à craquer ! Pour celle-ci, il faudrait en reposer une.'); return; }
        choix.push(id); maj(id);
        conte(D.RECETTES[id].nom + ' : ' + D.RECETTES[id].long + (choix.length === places ? ' Le sac est prêt !' : ''));
      },
      pret:function(){
        if(choix.length < places) return;
        var ev = Regles.refaireSac(p, choix.slice());
        if(ev[0] && ev[0].t === 'refus'){ conte(ev[0].mot); return; }
        X.sac = null; DJ.taire(); garder(); fin();
      }
    };
  });
}
function nb(n, maj){ var t = ['zéro', 'une', 'deux', 'trois', 'quatre'][n] || n; return maj ? t.charAt(0).toUpperCase() + t.slice(1) : t; }

/* ====================================================================== 3. LA CARTE */
function elCarte(){
  var c = q('#carte-donjon');
  if(!c){ c = el('div'); c.id = 'carte-donjon'; var cadre = q('#cadre'); cadre.insertBefore(c, cadre.firstChild); }
  return c;
}
function quitterCarte(){
  if(X.V){ try{ X.partie.vus['@brume'] = X.V.etat().brume; X.V.detruire(); }catch(e){} X.V = null; }
  var c = q('#carte-donjon'); if(c) c.remove();
  if(jeu) jeu.classList.remove('sur-carte');
}
function carte(o){
  o = o || {};
  var p = X.partie;
  quitterCarte();
  X.ecran = 'carte'; X.occupe = false; X.ici = o.ici || p.lieu; X.scene = null;
  DJ.fermer(); DJ.taire();
  jeu.innerHTML = ''; jeu.classList.add('sur-carte');
  var h = el('div', 'ecran hud-c'); h.id = 'explo';
  h.innerHTML = '<div class="titre-carte"><b>Sous le puits</b><span id="lieu-nom"></span></div>' +
    '<img id="rose" alt="La rose des vents : le nord est en haut" src="' + C.svgURL(C.roseSVG()) + '">' + DJ.curseursVolume() +
    '<div class="bulle" id="conteur"></div>' +
    '<div class="boutons-carte">' +
      '<button class="aller" id="b-entrer" data-act="entrer" hidden>Entrer ➜</button>' +
      '<button class="sombre" data-act="pave">📜 Un code</button><button class="sombre" data-act="objets">🎒 Objets</button><button class="sombre" data-act="livre-carte">📖 Grand Livre</button></div>';
  jeu.appendChild(h);
  DJ.brancherCurseurs(h);
  DJ.musiqueLieu(X.ici);
  var etats = {}; Object.keys(p.faits).forEach(function(k){ if(k.indexOf('combat:') === 0){ var s = k.slice(7); Object.keys(D.LIEUX).forEach(function(l){ if(D.LIEUX[l].combat === s) etats[l] = 'vu'; }); } });
  var pt = X.ici === 'J' ? C.J : C.LIEUX[X.ici];
  var dpr = window.devicePixelRatio || 1, large = elCarte().clientWidth || window.innerWidth, z = Math.max(.7, Math.min(1.4, large / 960));
  /* la carte est peinte une fois, à une finesse qui ne dépasse jamais 4 096 px de côté (RAPIDITE.md R9, mémoire de l'iPhone) */
  var ech = Math.max(1, Math.min(2, Math.round(z * dpr * 4) / 4, 4096 / C.EMPREINTE.w));
  X.V = C.vue(elCarte(), {brume:p.vus['@brume'] || null, etats:etats, centre:{x:pt.x, y:pt.y}, echelle:ech, surToucher:function(x, y, id){
    if(X.occupe) return;
    if(id && X.V.brume.estVu(id)) conte(nomLieu(id) + '.');
    else conte('La brume cache tout, par ici… Le plan du Sage sait peut-être ce qu\'il y a dessous.');
  }});
  /* la brume levée : celle qu'on avait gardée, sinon tous les lieux déjà vus */
  if(!p.vus['@brume']) Object.keys(p.vus).forEach(function(l){ if(l.charAt(0) !== '@' && C.LIEUX[l]) X.V.decouvrir(l, {anim:false}); });
  if(C.LIEUX[X.ici]) X.V.decouvrir(X.ici, {anim:false});
  if(p.faits.secret) try{ X.V.decouvrirLien('secret', 0, 1); }catch(e){}
  if(X.ici === 'J') X.V.pion(C.J.x, C.J.y); else X.V.pion(X.ici);
  X.V.centrer(pt);
  majCarte(o.texte);
}
function majCarte(texte){
  var p = X.partie, n = q('#lieu-nom'); if(n) n.textContent = nomLieu(X.ici);
  var b = q('#b-entrer'); if(b){ var e = aScene(X.ici); b.hidden = !e; b.classList.toggle('guide', !!e && aFaire(X.ici)); }
  conte(texte || SUR_CARTE[X.ici] || (PHRASES[X.ici] && (aFaire(X.ici) || X.ici === 'puits') ? PHRASES[X.ici] : nomLieu(X.ici) + '. Plus rien à trouver ici.'));
  montrerSorties();
  DJ.musiqueLieu(X.ici);                                    /* l'ambiance de la zone où l'on est */
  /* un grand combat est au bout d'un de ces couloirs : sa longue musique se fabrique d'avance (quelques secondes) */
  (X.sorties || []).forEach(function(s){ if(D.LIEUX[s.vers] && D.LIEUX[s.vers].combat && !p.faits['combat:' + D.LIEUX[s.vers].combat]) DJ.preparerGrand(D.LIEUX[s.vers].combat); });
}
/* où mènent les couloirs d'ici : [{lien, vers}] (vers : un lieu, ou 'J' l'embranchement) */
function sortiesDe(ici){
  var p = X.partie, out = [], L = C.LIEUX[ici];
  if(L && L.couloir){
    var c0 = C.LIEN[ici];
    if(c0.boucle) return [{lien:c0.id, vers:c0.de}];
    return [{lien:c0.id, vers:c0.de}, {lien:c0.id, vers:c0.a}];
  }
  C.liens(ici).forEach(function(c){
    if(c.bouche) return;
    if(c.secret && !p.faits.secret) return;
    if(c.boucle){ out.push({lien:c.id, vers:c.salle, boucle:true}); return; }
    if(c.sensUnique && c.a === ici) return;                 /* la porte de la lune ne s'ouvre que d'un côté */
    var vers = (c.salle && c.salle !== ici) ? c.salle : (c.de === ici ? c.a : c.de);
    out.push({lien:c.id, vers:vers, porte:c.porte || null});
  });
  return out;
}
function vu(l){ return l === 'J' ? !!X.partie.vus['@J'] : !!X.partie.vus[l]; }
function montrerSorties(){
  var p = X.partie, ici = X.ici, bloque = C.LIEUX[ici] ? Regles.bloque(p, ici) : null, de = p.vus['@de'];
  var l = sortiesDe(ici).filter(function(s){
    if(s.porte && !vu(s.vers)) return false;          /* une porte se pousse dans la salle (sauf si on est déjà passé par là) */
    if(bloque) return s.vers === de || (!de && vu(s.vers));   /* un lieu qui retient (un piège pas passé) : seulement le chemin du retour */
    return true;
  });
  X.sorties = l;
  X.V.sorties(l.map(function(s){
    var L = C.LIEN[s.lien], couloir = C.LIEUX[ici] && C.LIEUX[ici].couloir;
    return {lien:s.lien, depuis:couloir ? (s.vers === L.de ? L.a : L.de) : ici, t:couloir ? .72 : L.boucle ? .1 : .42, vers:s.vers, nom:'Aller vers ' + (vu(s.vers) ? nomLieu(s.vers) : 'la brume')};
  }), function(s){ if(!X.occupe){ son('clic'); aller(s.vers, s.lien); } });
}
/* le pion avance dans un couloir, la brume se lève, et on arrive */
function aller(vers, lien){
  var p = X.partie, ici = X.ici, L = C.LIEN[lien], V = X.V, dep;
  X.occupe = true; V.sorties([]);
  bruit('pasCouloir', {}, ['pasHeros', 1, 2]);
  var couloirIci = C.LIEUX[ici] && C.LIEUX[ici].couloir, couloirVers = C.LIEUX[vers] && C.LIEUX[vers].couloir;
  if(L.boucle && !couloirIci){
    /* les égouts tournants : on s'y engage (la moitié de la boucle), le reste après ce qu'on y trouve */
    V.decouvrir(L.salle);
    dep = V.deplacer(lien, ici, {t0:0, t1:.5});
  } else if(couloirIci){
    /* on sort d'un lieu-couloir (le couloir aux dalles, les égouts) par un de ses bouts */
    var depuis = L.boucle ? L.de : (vers === L.a ? L.de : L.a);
    dep = V.deplacer(lien, depuis, {t0:.5, t1:1, vers:vers === 'J' ? C.J : vers});
    setTimeout(function(){ if(C.LIEUX[vers]) V.decouvrir(vers); else V.decouvrirLien(lien, 0, 1, depuis); }, 250);
  } else if(couloirVers){
    /* on entre dans un lieu-couloir : on s'arrête au milieu */
    V.decouvrir(vers);
    dep = V.deplacer(lien, ici, {t0:0, t1:.5});
  } else {
    dep = V.deplacer(lien, ici, {vers:vers === 'J' ? C.J : vers});
    setTimeout(function(){ if(C.LIEUX[vers]){ V.decouvrir(vers); bruit('brumeCarte'); } else { V.decouvrirLien(lien, 0, 1, ici); C.liens('J').forEach(function(c2){ if(c2.id !== lien) try{ V.decouvrirLien(c2.id, 0, .4, 'J'); }catch(e){} }); } }, 250);
  }
  return Promise.resolve(dep).then(function(){
    p.vus['@de'] = ici;
    if(vers === 'J'){ p.vus['@J'] = 1; X.ici = 'J'; X.occupe = false; garder(); majCarte(); return; }
    return arriver(vers, {de:ici});
  });
}

/* ====================================================================== 4. ARRIVER QUELQUE PART */
function aScene(lieu){
  if(!D.LIEUX[lieu]) return false;
  if(lieu === 'crypte') return !!X.partie.faits['combat:crypte'];
  return !!PHRASES[lieu] && !D.LIEUX[lieu].combat;
}
/* y a-t-il encore quelque chose à faire ici ? (le crâne secret ne compte pas : c'est un secret) */
function aPlace(id){
  var O = D.OBJETS[id], p = X.partie; if(!O) return false;
  if(O.code || O.or) return true;
  return (O.pour === 'tous' ? ORDRE : [O.pour]).some(function(h){ return p.heros[h] && p.heros[h].objets.length < D.CHIFFRES.places; });
}
function aFaire(lieu){
  var c = Regles.contenu(X.partie, lieu);
  return !!((c.objets && c.objets.some(aPlace)) || (c.coffre && !c.coffre.pris) || (c.tas && c.tas.reste) || (c.dalles && !c.dalles.passe) || c.portes || (c.repos && c.repos.permis) || (c.code && !X.partie.faits['code:' + c.code.id]) || c.fin);
}
function arriver(lieu, o){
  o = o || {};
  var p = X.partie, premier = o.premier || !p.vus[lieu];
  var ev = Regles.entrer(p, lieu);
  X.ici = lieu; garder();
  var combat = ev.filter(function(e){ return e.t === 'combat'; })[0], boucle = ev.filter(function(e){ return e.t === 'boucle'; })[0];
  if(combat) return lancerCombat(combat.salle);
  if(boucle) return finBoucle(boucle.vers);
  if(aScene(lieu) && (premier || aFaire(lieu) || o.entrer)) return ouvrirScene(lieu, ev, premier);
  if(X.ecran !== 'carte' || !X.V) carte(); else { X.occupe = false; majCarte(); }
  return Promise.resolve();
}
function lancerCombat(salle){
  var p = X.partie;
  /* pour les essais (index.html?sanscombat=1) : le combat est tenu pour gagné, on visite le reste du donjon */
  if(X.sansCombat){ p.faits['combat:' + salle] = 1; p.repos = false; garder(); return arriver(p.lieu, {apresCombat:true}); }
  quitterCarte(); X.ecran = 'combat';
  jeu.classList.remove('sur-carte'); jeu.innerHTML = '';
  return DJ.passage(D.COMBATS[salle].nom, function(){ return DJ.Combat.preparer(salle); }).then(function(){ return DJ.Combat.lancer(p, salle); }).then(function(res){
    garder();
    if(res === 'victoire') return arriver(p.lieu, {apresCombat:true});
    /* fuite ou défaite : on repart de l'endroit de la dernière sauvegarde ; les monstres battus depuis sont revenus, tout
       le reste est gardé (objets, brume, pièges passés, passages ouverts, codes) ; on refait le sac et on repart de là */
    return ecranSac({}).then(function(){ carte({texte:'Retour ' + articleLieu(p.lieu) + '. Les monstres sont revenus… mais vos poches, elles, sont toujours pleines.'}); });
  });
}
function articleLieu(l){ var n = nomLieu(l); return /^L[ae'’]/.test(n) ? 'à ' + n.charAt(0).toLowerCase() + n.slice(1) : n; }
/* les égouts tournants : on finit la boucle, et on ressort aux canaux */
function finBoucle(vers){
  var p = X.partie;
  if(X.ecran !== 'carte' || !X.V) carte({ici:'egouts'});
  X.occupe = true; X.V.sorties([]);
  conte('Ce couloir tourne… tourne… et revient au même endroit !');
  return Promise.resolve(X.V.deplacer('egouts', vers, {t0:.5, t1:1, vers:vers})).then(function(){
    Regles.entrer(p, vers); X.ici = vers; p.vus['@de'] = 'egouts'; garder();
    X.occupe = false; majCarte('Ce couloir tournait en rond. Retour aux canaux !');
  });
}

/* ====================================================================== 5. LES SALLES SANS COMBAT */
var S = null;          /* la salle ouverte : {lieu, objets:{id: élément}, heros:{}, …} */
function fondDe(lieu){ return lieu === 'crypte' ? DJ.charger.decor('crypte') : DJ.charger.scene(lieu); }
function ouvrirScene(lieu, ev, premier){
  var p = X.partie;
  quitterCarte(); X.ecran = 'passage';
  jeu.classList.remove('sur-carte'); jeu.innerHTML = '';
  return DJ.passage(nomLieu(lieu), function(){ return Promise.all([DJ.charger.image(fondDe(lieu)), DJ.Combat.cuireHeros()]); }).then(function(){ construireScene(lieu, ev || [], premier); });
}
function construireScene(lieu, ev, premier){
  var p = X.partie, def = lieu === 'crypte' ? {elements:[window.SCENES.sarcophageSurCrypte()]} : window.SCENES.salle(lieu), cont = Regles.contenu(p, lieu);
  X.ecran = 'scene'; X.occupe = false;
  jeu.innerHTML = '';
  var c = el('div', 'ecran'); c.id = 'scene'; c.className = 'ecran lieu-' + lieu;
  c.innerHTML = '<div id="monde"><div id="secousse"><img class="decor" src="' + fondDe(lieu) + '" alt=""><div id="sol-fx"></div><div id="objets"></div><div id="persos"></div><div id="fx"></div><div id="fumee"></div><div id="hud"></div></div></div>' +
    '<div id="haut"><div id="salle-nom"><b>' + esc(nomLieu(lieu)) + '</b></div>' + DJ.curseursVolume() + '</div>' +
    '<div id="bas-scene"><div class="bulle" id="conteur"></div><div class="b-outils">' +
      '<button class="sombre" data-act="pave">📜 Un code</button><button class="sombre" data-act="objets">🎒 Objets</button><button class="sombre" data-act="livre-carte">📖 Grand Livre</button>' +
      (cont.repos ? '<button class="sombre" data-act="refaire-sac">🧪 Refaire le sac</button>' : '') +
      '<button class="aller" id="b-repartir" data-act="repartir">Continuer ➜</button></div></div><div id="ecran-fx"></div>';
  jeu.appendChild(c);
  DJ.brancherCurseurs(c);
  SALLE.Fx.init({fx:q('#fx'), sol:q('#sol-fx'), fumee:q('#fumee'), ecran:q('#ecran-fx'), monde:q('#monde'), secousse:q('#secousse')});
  S = {lieu:lieu, o:{}, heros:{}, defs:{}, pas:(cont.dalles && cont.dalles.pas) || 0, pret:false, sansTexte:lieu === 'reserve', plaques:{}};
  /* les trois héros, à gauche, comme en combat */
  var persos = q('#persos'), hud = q('#hud');
  ORDRE.forEach(function(h){
    var d = el('div', 'perso heros module h-' + h);
    d.style.left = (HER[h].x - 40) + 'px'; d.style.zIndex = 10 + ORDRE.indexOf(h);
    d.innerHTML = '<div class="ombre"></div><div class="acteur" style="left:40px;top:40px;width:200px;height:240px"></div>';
    persos.appendChild(d);
    var a = S.heros[h] = window.HerosAnime.creer(q('.acteur', d), h, DJ.LOOK[h]);
    (p.heros[h].objets || []).forEach(function(ob){ var n = D.OBJETS[ob] && D.OBJETS[ob].equipe; try{ if(n && a.equiper) a.equiper(n, true, {discret:true}); }catch(e){} });
    try{ a.attendre(); }catch(e){}
    var pv = el('div', 'pv'); pv.id = 'pv-' + h; pv.style.left = hCx(h) + 'px'; pv.innerHTML = '<div class="barre"><i></i></div><b></b>'; hud.appendChild(pv);
  });
  majPV();
  /* ce qu'il y a à toucher */
  var cont2 = q('#objets'), fond = fondDe(lieu);
  def.elements.forEach(function(d){
    if(d.id === 'page-blanche') return;                         /* la seule page blanche à trouver est dans le tas d'os */
    if(d.type === 'objet' && cont.objets.indexOf(d.id) < 0) return;      /* déjà pris */
    if(d.fond) d.fond = fond;
    var e;
    try{ e = window.OBJETS.creer(cont2, d, {fond:fond}); }catch(x){ if(window.console) console.warn('objet', d.id, x); return; }
    S.o[d.id] = e; S.defs[d.id] = d;
    brancher(e, d, cont);
  });
  /* les objets qu'on a reposés ici (ils ne font pas partie du décor de cette salle) : au sol, à droite des héros */
  cont.objets.forEach(function(id){ if(!S.o[id] && p.faits['pose:' + id] === lieu && !dansUnCoffre(def, id)) poserAuSol(id, false); });
  /* l'équipement des héros concernés par les objets d'ici : deux cases au-dessus de leur tête */
  plaquesDuLieu(cont).forEach(function(h){ majPlaque(h); });
  DJ.musiqueLieu(lieu);
  preparerLieu(lieu, cont, ev, premier);
}
function dansUnCoffre(def, id){ return (def.elements || []).some(function(d){ return d.type === 'choix' && (d.options || []).some(function(o){ return o.id === id; }); }); }

/* ---------- l'équipement d'un héros : ses deux places, au-dessus de sa tête (Romain, 10 novembre) ----------
   On y voit ce qu'il porte ; « Complet » quand les deux places sont prises. Pour prendre un objet de plus, on touche
   d'abord cet objet (les cases se mettent à bouger, avec le rond jaune), puis la case de l'objet qu'on repose. */
function urlSvg(svg){ return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg); }
function iconeObjet(id){ var d = window.SCENES.portable ? window.SCENES.portable(id) : null; return d ? '<img alt="" draggable="false" src="' + urlSvg(d.svg) + '">' : '<span>' + esc((D.OBJETS[id] || {}).nom || id) + '</span>'; }
function plaquesDuLieu(cont){
  var hs = {};
  (cont.objets || []).concat(cont.coffre ? cont.coffre.options : []).forEach(function(id){ var O = D.OBJETS[id]; if(!O || O.code || O.or) return; (O.pour === 'tous' ? ORDRE : [O.pour]).forEach(function(h){ hs[h] = 1; }); });
  return ORDRE.filter(function(h){ return hs[h]; });
}
function majPlaque(h){
  if(!S) return;
  var p = X.partie, l = p.heros[h].objets, n = D.CHIFFRES.places, e = q('#plaque-' + h), ech = X.echange && X.echange.heros === h;
  if(!e){ e = el('div', 'plaque'); e.id = 'plaque-' + h; e.style.left = hCx(h) + 'px'; q('#hud').appendChild(e); S.plaques[h] = e; DJ.relancer(e, 'pop'); }
  var cases = '';
  for(var k = 0; k < n; k++){
    var id = l[k];
    cases += id ? '<button class="pl-case pleine" data-act="plaque-objet" data-id="' + id + '" data-heros="' + h + '" aria-label="' + esc(D.OBJETS[id].nom) + '">' + iconeObjet(id) + '</button>' : '<div class="pl-case"></div>';
  }
  e.className = 'plaque' + (l.length >= n ? ' complet' : '') + (ech ? ' choisir' : '');
  e.innerHTML = '<div class="pl-cases">' + cases + '</div>' + (l.length >= n ? '<div class="pl-etat">Complet</div>' : '');
  /* le nom de la salle est juste là, en haut à gauche : on le cache quand la plaque du Sage est sortie */
  var t = q('#scene #salle-nom'); if(t && h === 'sage') t.style.visibility = 'hidden';
}
/* le nom d'un objet, juste au-dessus de lui (Romain : « quand on appuie sur les carquois, qu'il y ait marqué flèches de lune ») */
function etiquette(texte, x, y){
  var a = q('#hud .nom-objet'); if(a) a.remove();
  var e = el('div', 'nom-objet', esc(texte)); e.style.left = Math.max(70, Math.min(890, x)) + 'px'; e.style.top = Math.max(14, y) + 'px';
  q('#hud').appendChild(e);
  setTimeout(function(){ if(e.parentNode){ e.classList.add('part'); setTimeout(function(){ e.remove(); }, 260); } }, 1900);
}
function etiquetteObjet(id){
  var O = D.OBJETS[id], d = S && S.defs[id]; if(!O || !d || O.code || O.or) return;
  var z = d.zone || d; etiquette(O.nom, z.x + z.w / 2, z.y - 30);
}
/* un objet reposé dans la salle : à sa place d'origine s'il vient d'ici, sinon au sol, là où il y a de la place */
function poserAuSol(id, anime){
  var prises = Object.keys(S.defs).map(function(k){ var z = S.defs[k].zone || S.defs[k]; return [z.x, z.x + z.w]; });
  var x = null, places = [540, 610, 680, 750, 820, 890, 500];
  for(var k = 0; k < places.length && x === null; k++){ var a = places[k] - 32, b = places[k] + 32; if(!prises.some(function(r){ return r[0] < b && r[1] > a; })) x = places[k]; }
  if(x === null) x = 540;
  var d = window.SCENES.portable && window.SCENES.portable(id, x); if(!d) return null;
  if(anime) d.cache = true;
  var e;
  try{ e = window.OBJETS.creer(q('#objets'), d, {fond:fondDe(S.lieu)}); }catch(er){ if(window.console) console.warn('objet posé', id, er); return null; }
  S.o[id] = e; S.defs[id] = d;
  e.surToucher(function(){ prendre(id); });
  if(anime){ e.el.style.visibility = ''; e.montrer(); }
  e.briller(true); e.guider(aPlace(id));
  return e;
}
function reposer(id, heros){
  var A = S.heros[heros], n = D.OBJETS[id] && D.OBJETS[id].equipe;
  try{ if(n && A && A.equiper) A.equiper(n, false); }catch(er){}
  bruit('pose', {}, ['clic']);
  var e = S.o[id];
  if(e && e.remettre){ e.remettre(); e.guider(false); return e; }
  return poserAuSol(id, true);
}
/* les ronds jaunes : seulement sur ce qu'on peut prendre tout de suite (quelqu'un a une place) */
function majGuides(){
  if(!S) return;
  Object.keys(S.o).forEach(function(id){ var e = S.o[id], d = S.defs[id]; if(!e || !d || d.type !== 'objet' || e.pris) return; var O = D.OBJETS[id]; if(O && !O.code && !O.or) try{ e.guider(aPlace(id)); }catch(er){} });
}
/* les mains pleines : on a touché un objet de plus. Les cases du héros bougent (rond jaune) : on touche celle qu'on repose. */
function echange(x){
  X.echange = x; X.occupe = false;
  majPlaque(x.heros);
  bruit('complet', {}, ['clic']);
  var e = S.o[x.objet]; try{ if(e && e.el) e.el.animate([{transform:'translateX(0)'}, {transform:'translateX(-5px)'}, {transform:'translateX(5px)'}, {transform:'translateX(-3px)'}, {transform:'none'}], {duration:320}); }catch(er){}
  var pl = S.plaques[x.heros]; if(pl) DJ.relancer(pl, 'secoue');
}
function finEchange(){ if(!X.echange) return; var h = X.echange.heros; X.echange = null; if(S) majPlaque(h); }
function toucherPlaque(id, heros){
  if(!S || X.occupe) return;
  var x = X.echange;
  if(x && x.heros === heros){
    X.echange = null;
    var O = D.OBJETS[x.objet], ev = Regles.prendre(X.partie, x.objet, O.pour === 'tous' ? heros : null, id);
    majPlaque(heros);
    return jouerHors(ev, S.o[x.objet], x.objet);
  }
  finEchange();
  son('clic'); etiquette(D.OBJETS[id].nom, hCx(heros) + 150, 62);          /* son nom, à droite de la plaque */
}
function majPV(){
  var p = X.partie;
  ORDRE.forEach(function(h){
    var e = q('#pv-' + h); if(!e) return;
    var s = p.heros[h], k = Math.max(0, s.pv / s.pvMax), i = q('i', e);
    i.style.transform = 'scaleX(' + k + ')'; i.className = k <= .25 ? 'bas' : k <= .5 ? 'moyen' : '';
    q('b', e).textContent = s.pv;
  });
}
function guider(id, on){ var e = S && S.o[id]; try{ if(e && e.guider) e.guider(on !== false); }catch(x){} }
function pointDe(d){ var z = d.zone || d; return {x:z.x + z.w / 2, y:z.y + z.h / 2}; }
/* brancher ce qu'on touche, selon son type */
function brancher(e, d, cont){
  if(!e.surToucher) return;
  /* (le feu, le chat et Léo n'ont pas fait leur zone à toucher eux-mêmes) */
  if(d.zone && !e.zone && e.faireZone && /^(feu|chat|leo)$/.test(d.type)){ try{ e.faireZone(); }catch(x){} }
  if(d.type === 'objet'){ e.briller && e.briller(true); guider(d.id); e.surToucher(function(){ prendre(d.id); }); }
  else if(d.type === 'choix' && !cont.coffre){ coffreLibre(e, d); }
  else if(d.type === 'choix'){
    var pris = cont.coffre && cont.coffre.pris;
    if(pris){ try{ e.ouvrir && e.ouvrir(); (e.options || []).forEach(function(o){ if(o.def && o.def.id === pris) o.cacher && o.cacher(); else o.eteindre && o.eteindre(); }); }catch(x){} return; }
    var ouvert = !d.ferme;
    if(!ouvert){ e.guider && e.guider(true); e.surToucher(function(){ if(ouvert || X.occupe) return; ouvert = true; e.guider(false); bruit('coffre', {}, ['clic']); Promise.resolve(e.ouvrir()).then(function(){ conte('Deux trouvailles… mais on ne peut en emporter qu\'une. Laquelle ?'); armerChoix(e, d); }); }); }
    else armerChoix(e, d);
  }
  else if(d.type === 'tas'){ if(cont.tas && cont.tas.reste) e.guider(true); e.surToucher(function(){ fouiller(e); }); }
  else if(d.type === 'crane'){ if(cont.crane && cont.crane.ouvert){ try{ e.etat && e.etat(true); e.ouvrir && e.ouvrir(); }catch(x){} } else e.surToucher(function(){ crane(e); }); }
  else if(d.type === 'dalle'){ e.surToucher(function(){ dalle(e, d); }); }
  else if(d.type === 'porte'){ e.guider(true); e.surToucher(function(){ porte(e, d); }); }
  else if(d.type === 'sarcophage'){ if(cont.objets.indexOf('amulette') >= 0){ e.guider(true); e.surToucher(function(){ sarcophage(e); }); } else { try{ e.ouvrir().then(function(a){ a && a.cacher && a.cacher(); }); }catch(x){} } }
  else if(d.type === 'feu'){ e.surToucher(function(){ repos(e); }); if(cont.repos && cont.repos.permis) e.guider(true); }
  else if(d.type === 'chat'){ e.surToucher(function(){ if(!X.occupe) sceneChat(e, true); }); }
  else if(d.type === 'leo'){ e.surToucher(function(){ if(!X.occupe) codeDuLieu(); }); }
}
/* la réserve : le coffre s'ouvre, les deux carquois se prennent comme des objets ordinaires (2 places par héros) */
function coffreLibre(e, d){
  var p = X.partie, cle = '@ouvert:' + S.lieu;
  function ici(id){ return Regles.contenu(p, S.lieu).objets.indexOf(id) >= 0; }
  function armer(){
    (e.options || []).forEach(function(o){
      var id = o.def.id; S.o[id] = o; S.defs[id] = o.def;
      if(!o._arme){ o._arme = true; o.surToucher(function(){ prendre(id); }); }
      if(ici(id)){ o.briller(true); o.guider(aPlace(id)); } else { o.pris = true; o.cacher(true); }
    });
  }
  if(p.vus[cle]){
    /* déjà ouvert : il reste ouvert, avec ce qu'il y a encore dedans */
    var toutes = e.options;
    e.options = toutes.filter(function(o){ return ici(o.def.id); });
    toutes.forEach(function(o){ if(e.options.indexOf(o) < 0){ o.pris = true; o.cacher(true); } });
    Promise.resolve(e.ouvrir()).then(function(){ e.options = toutes; if(S && S.o) armer(); });
    return;
  }
  e.guider(true);
  e.surToucher(function(){
    if(p.vus[cle] || X.occupe) return;
    p.vus[cle] = 1; garder(); e.guider(false); bruit('coffre', {}, ['clic']);
    Promise.resolve(e.ouvrir()).then(function(){ if(S) armer(); });
  });
}
function armerChoix(e, d){
  (e.options || []).forEach(function(o, i){
    o.briller && o.briller(true); o.guider && o.guider(true);
    o.surToucher && o.surToucher(function(){ choisir(e, d, i); });
  });
}
/* ce qui se passe en entrant : la phrase du conteur, et les petites scènes */
function preparerLieu(lieu, cont, ev, premier){
  var p = X.partie;
  var t = PHRASES[lieu] || nomLieu(lieu) + '.';
  if(lieu === 'camp') t = cont.repos && cont.repos.permis ? 'Un feu de camp ! On souffle un peu : le feu remet tout le monde d\'aplomb.' : 'Le feu de camp crépite. Vous êtes déjà reposés.';
  if(lieu === 'dalles'){
    if(cont.dalles.passe){ t = 'Le couloir aux dalles. Vous connaissez le chemin, maintenant.'; }
    else { conte(t); explicationDalles(); return; }
  }
  if(lieu === 'eboulis' && cont.tas && !cont.tas.reste) t = 'Le cul-de-sac. Le tas d\'os a tout donné.';
  if(lieu === 'crypte') t = cont.objets.length ? PHRASES.crypte : 'La crypte est vide. Le sarcophage aussi.';
  conte(t);
  if(lieu === 'porte4'){ sceneChat(S.o.moustache, false); return; }
  if(lieu === 'leo'){ sceneLeo(); return; }
  majRepartir();
}
function majRepartir(){ var b = q('#b-repartir'); if(b) b.classList.toggle('guide', !aFaire(S.lieu)); }
function repartir(){
  if(X.occupe) return;
  var lieu = S ? S.lieu : X.ici;
  fermerScene();
  carte({ici:lieu});
}
function fermerScene(){
  if(!S) return;
  Object.keys(S.o).forEach(function(k){ try{ S.o[k].arreter && S.o[k].arreter(); }catch(e){} });
  ORDRE.forEach(function(h){ try{ S.heros[h].arreter && S.heros[h].arreter(); }catch(e){} });
  S = null; DJ.taire(); DJ.fermer();
}

/* ---------- prendre un objet ---------- */
function versHeros(h){ return {x:hCx(h), y:200}; }
function prendre(id, heros, laisser){
  if(X.occupe) return;
  var p = X.partie, O = D.OBJETS[id] || {}, e = S.o[id];
  finEchange();
  if(!heros) etiquetteObjet(id);
  if(id === 'amulette' && !heros){ return fenetreQui(id); }
  var ev = Regles.prendre(p, id, heros, laisser);
  if(ev[0] && ev[0].t === 'plein' && !laisser) return echange(ev[0]);       /* les mains pleines : on choisit sur la plaque ce qu'on repose */
  return jouerHors(ev, e, id);
}
/* jouer les évènements d'une action hors combat */
function jouerHors(ev, e, id){
  var p = X.partie, k = 0;
  X.occupe = true;
  function suite(){
    if(k >= ev.length){ X.occupe = false; garder(); if(S){ majPV(); majRepartir(); majGuides(); } return Promise.resolve(); }
    var x = ev[k++], pr = Promise.resolve();
    if(x.t === 'refus'){ SALLE.Fx.mot(e && S.defs[id] ? pointDe(S.defs[id]).x : 480, 120, x.mot, 'refus'); son('clic'); }
    else if(x.t === 'plein'){ X.occupe = false; echange(x); return Promise.resolve(); }
    else if(x.t === 'laisse'){ reposer(x.objet, x.heros); majPlaque(x.heros); conte(D.OBJETS[x.objet].nom + ' reste ici. On pourra revenir le chercher.'); pr = DJ.attendre(380); }
    else if(x.t === 'objet'){
      var O = D.OBJETS[x.objet] || {nom:x.objet};
      bruit('ramasse', {}, ['clic']);
      pr = Promise.resolve(e && e.prendre ? e.prendre(versHeros(x.heros)) : null).then(function(){
        try{ if(x.equipe && S.heros[x.heros].equiper) S.heros[x.heros].equiper(x.equipe, true); }catch(er){}
        try{ S.heros[x.heros].joie && S.heros[x.heros].joie(); }catch(er){}
        majPlaque(x.heros);
        conte(O.nom + ' ! ' + (O.d || '') + ' C\'est ' + D.HEROS[x.heros].le + ' qui s\'en charge.');
      });
    }
    else if(x.t === 'or'){
      bruit('ramasse', {}, ['clic']);
      pr = Promise.resolve(e && e.prendre ? e.prendre(versHeros('alchimiste')) : null).then(function(){ SALLE.Fx.chiffre(hCx('alchimiste'), 150, '+' + x.n + ' 🪙', 'soin'); conte('Une bourse ! ' + x.n + ' pièces d\'or. Ça servira bien un jour.'); });
    }
    else if(x.t === 'code-objet'){
      bruit('ramasse', {}, ['clic']);
      pr = Promise.resolve(e && e.prendre ? e.prendre(versHeros('pisteur')) : null).then(function(){ fenetreCode(x); });
    }
    else if(x.t === 'degats'){ var a = S && S.heros[x.heros]; SALLE.Fx.chiffre(hCx(x.heros), 140, '−' + x.n, ''); son('morsure'); majPV(); pr = Promise.resolve(a && a.touche ? a.touche() : null).catch(function(){}); }
    else if(x.t === 'soin'){ SALLE.Fx.chiffre(hCx(x.heros), 150, '+' + x.n, 'soin'); majPV(); }
    return pr.then(suite);
  }
  return suite();
}
function choisir(e, d, i, laisser){
  if(X.occupe) return;
  var opt = (e.options || [])[i], id = opt && opt.def ? opt.def.id : (d.options[i] && d.options[i].id);
  var ev = Regles.choisir(X.partie, id, laisser);
  if(ev[0] && ev[0].t === 'plein'){ X.pleinChoix = {e:e, d:d, i:i}; return fenetrePlein(ev[0]); }
  if(ev[0] && ev[0].t === 'refus'){ SALLE.Fx.mot(pointDe(d).x, 120, ev[0].mot, 'refus'); return; }
  X.occupe = true;
  var ob = ev.filter(function(x){ return x.t === 'objet'; })[0], O = D.OBJETS[id] || {nom:id};
  bruit('ramasse', {}, ['clic']);
  (e.options || []).forEach(function(o){ o.guider && o.guider(false); });
  Promise.resolve(e.choisir(i, versHeros(ob ? ob.heros : 'pisteur'))).then(function(){
    if(ob){ try{ if(ob.equipe && S.heros[ob.heros].equiper) S.heros[ob.heros].equiper(ob.equipe, true); S.heros[ob.heros].joie && S.heros[ob.heros].joie(); }catch(er){} }
    conte(O.nom + ' ! ' + (O.d || '') + ' L\'autre reste là, pour toujours.');
    X.occupe = false; garder(); majRepartir();
  });
}
/* ---------- le tas d'os ---------- */
function fouiller(e){
  if(X.occupe) return;
  var p = X.partie, ev = Regles.fouiller(p), f = ev.filter(function(x){ return x.t === 'fouille'; })[0];
  if(!f){ conte('Plus rien là-dedans. Que des os, et encore des os.'); return; }
  X.occupe = true; e.guider(false);
  var code = ev.filter(function(x){ return x.t === 'code-objet'; })[0], deg = ev.filter(function(x){ return x.t === 'degats'; });
  conte('On fouille… Ça remue là-dessous !');
  Promise.resolve(e.fouiller({trouve:f.trouve === 'morsure' ? 'morsure' : 'page', onMorsure:function(){ son('couine', 0, 1.2); son('morsure'); }})).then(function(objet){
    if(f.trouve === 'morsure'){
      deg.forEach(function(x){ SALLE.Fx.chiffre(hCx(x.heros), 140, '−' + x.n, ''); try{ S.heros[x.heros].touche(); }catch(er){} });
      majPV(); conte('Aïe ! Un rat dormait là-dedans. Il mord le Pisteur et file. Il reste peut-être autre chose, dessous…');
      e.guider(true);
    } else if(f.trouve === 'page'){
      var fin = function(){ if(code) fenetreCode(code); };
      if(objet && objet.prendre) Promise.resolve(objet.prendre(versHeros('pisteur'))).then(fin); else fin();
    } else conte('Plus rien là-dedans. Que des os, et encore des os.');
    X.occupe = false; garder(); majRepartir();
  });
}
/* ---------- le crâne secret : rien ne le montre ; c'est le plan du Sage (son encre invisible) qui dit où toucher ---------- */
function crane(e){
  if(X.occupe) return;
  var ev = Regles.crane(X.partie), pa = ev.filter(function(x){ return x.t === 'passage'; })[0];
  if(!pa) return;
  X.occupe = true;
  bruit('portePierre', {}, ['dome']);
  Promise.resolve(e.reveler ? e.reveler() : null).then(function(){ return e.ouvrir ? e.ouvrir() : null; }).then(function(){
    SALLE.Fx.tremble(5, 300);
    conte('Clac ! Le crâne s\'allume, et tout un pan de mur glisse. Un passage secret ! Il descend vers une lueur de feu…');
    X.occupe = false; garder(); majRepartir();
  });
}
/* ---------- le couloir aux dalles ---------- */
function explicationDalles(){
  var t1 = 'À chaque pas, deux dalles : une claire, une sombre. Une seule est sûre.', t2 = 'Une mauvaise dalle, et le piège part : tout le monde prend un coup, et on recule d\'un pas.', t3 = 'Laquelle est sûre ? Le plan du Sage le sait peut-être…';
  DJ.fenetre('<h2>Le couloir aux dalles</h2>' +
    '<div class="expli"><div><span class="ex-img">◻️ ◼️</span><p>' + t1 + '</p>' + DJ.lireBtn(t1) + '</div>' +
    '<div><span class="ex-img">💥 ↩️</span><p>' + t2 + '</p>' + DJ.lireBtn(t2) + '</div>' +
    '<div><span class="ex-img">🗺️ 🧐</span><p>' + t3 + '</p>' + DJ.lireBtn(t3) + '</div></div>' +
    '<div class="boutons"><button class="aller guide" data-act="dalles-go">On y va !</button></div>', 'large');
}
function colonneDalles(){
  if(!S || S.lieu !== 'dalles') return;
  var cont = Regles.contenu(X.partie, 'dalles'), pas = cont.dalles.pas, fini = cont.dalles.passe;
  Object.keys(S.o).forEach(function(id){
    var m = /^dalle-(\d+)-(\d)$/.exec(id); if(!m) return;
    var on = !fini && (+m[1] - 6) === pas;
    try{ S.o[id].guider(on); }catch(e){}
  });
  S.pas = pas;
}
function dalle(e, d){
  if(X.occupe || !S.pret) return;
  var m = /^dalle-(\d+)-(\d)$/.exec(d.id), cont = Regles.contenu(X.partie, 'dalles');
  if(cont.dalles.passe){ conte('Le chemin est connu. On passe sans y penser.'); return; }
  if(!m || (+m[1] - 6) !== cont.dalles.pas){ SALLE.Fx.mot(pointDe(d).x, pointDe(d).y - 30, 'Pas celle-là', 'refus'); son('clic'); return; }
  var ev = Regles.dalle(X.partie, m[2] === '0' ? 'fond' : 'devant'), da = ev.filter(function(x){ return x.t === 'dalle'; })[0];
  if(!da){ if(ev[0] && ev[0].t === 'refus') SALLE.Fx.mot(pointDe(d).x, pointDe(d).y - 30, ev[0].mot, 'refus'); return; }
  X.occupe = true;
  var deg = ev.filter(function(x){ return x.t === 'degats'; }), traverse = ev.filter(function(x){ return x.t === 'traverse'; })[0];
  var pr = da.sure ? Promise.resolve(e.marcher ? e.marcher() : null) : Promise.resolve(e.pieger ? e.pieger({onPiege:function(){ bruit('dalles', {}, ['tombe']); SALLE.Fx.tremble(8, 320); }}) : null);
  if(da.sure) bruit('pasCouloir', {}, ['clic']);
  pr.then(function(){
    if(!da.sure){
      deg.forEach(function(x){ SALLE.Fx.chiffre(hCx(x.heros), 140, '−' + x.n, ''); try{ S.heros[x.heros].touche(); }catch(er){} });
      majPV(); conte('CLAC ! Des pointes jaillissent. Aïe, aïe, aïe… et on recule d\'un pas.');
    } else if(traverse){ bruit('codeOk', {}, ['soin']); conte('Dernière dalle… et on est passés ! Ce couloir ne vous fera plus jamais peur.'); }
    else conte(['Ouf. Rien ne bouge.', 'La dalle tient bon.', 'Un pas de plus.', 'Jusqu\'ici, tout va bien.'][da.pas % 4]);
    X.occupe = false; garder(); colonneDalles(); majRepartir();
  });
}
/* ---------- les trois portes ---------- */
function porte(e, d){
  if(X.occupe) return;
  var signe = d.symbole, ev = Regles.porte(X.partie, signe), po = ev.filter(function(x){ return x.t === 'porte'; })[0];
  if(!po) return;
  X.occupe = true;
  bruit('portePierre', {}, ['dome']);
  conte(signe === 'oeil' ? 'L\'œil s\'allume… La porte s\'enfonce dans le sol.' : signe === 'gueule' ? 'La gueule s\'allume… La porte s\'enfonce dans le sol.' : 'La lune s\'allume… La porte s\'enfonce dans le sol.');
  Promise.resolve(e.toucher ? e.toucher() : null).then(function(){ return e.ouvrir ? e.ouvrir() : null; }).then(function(){ return attendre(400); }).then(function(){
    var lien = signe === 'oeil' ? 'pOeil' : signe === 'gueule' ? 'pGueule' : 'pLune';
    fermerScene();
    carte({ici:'portes'});
    aller(po.vers, lien);
  });
}
/* ---------- le sarcophage de la fausse crypte ---------- */
function sarcophage(e){
  if(X.occupe || S.sarcoOuvert) return;
  X.occupe = true; S.sarcoOuvert = true; e.guider(false);
  bruit('portePierre', {}, ['dome']);
  Promise.resolve(e.ouvrir()).then(function(am){
    S.o.amulette = am || e.amulette; S.defs.amulette = {zone:{x:430, y:196, w:52, h:66}};
    conte('Le couvercle glisse… Une amulette brille tout au fond !');
    X.occupe = false;
    var a = S.o.amulette;
    if(a){ a.briller && a.briller(true); a.guider && a.guider(true); a.surToucher && a.surToucher(function(){ prendre('amulette'); }); }
  });
}
/* ---------- le feu de camp ---------- */
function repos(e){
  if(X.occupe) return;
  var ev = Regles.repos(X.partie);
  if(ev[0] && ev[0].t === 'refus'){ SALLE.Fx.mot(660, 190, ev[0].mot, 'refus'); son('clic'); conte('Vous êtes déjà reposés. Le feu ne peut rien de plus… jusqu\'au prochain combat.'); return; }
  X.occupe = true; e.guider(false);
  bruit('feuCamp', {}, ['soin']);
  Promise.resolve(e.attiser ? e.attiser() : null).then(function(){
    ev.forEach(function(x){ if(x.t === 'soin'){ SALLE.Fx.chiffre(hCx(x.heros), 150, '+' + x.n, 'soin'); try{ S.heros[x.heros].joie(); }catch(er){} } });
    majPV(); son('soin');
    conte('Le feu réchauffe les cœurs et les orteils. Tout le monde reprend des forces !');
    X.occupe = false; garder(); majRepartir();
  });
}
/* ---------- Moustache devant la porte aux quatre signes ---------- */
function sceneChat(e, encore){
  X.occupe = true;
  conte('Moustache gratte au bas de la grande porte. Miaou ! Derrière, quelqu\'un répond tout bas…');
  Promise.resolve(e && e.scene ? e.scene() : null).catch(function(){}).then(function(){ X.occupe = false; codeDuLieu(); majRepartir(); });
}
function sceneLeo(){
  var e = S.o.leo;
  X.occupe = true;
  conte('Léo ! Coincé là, avec sa lanterne. Il lève la tête… et il n\'a plus du tout l\'air de vouloir s\'enfuir.');
  Promise.resolve(e && e.lever ? e.lever() : null).catch(function(){}).then(function(){ X.occupe = false; codeDuLieu(true); });
}
/* le code que donne ce lieu (la porte : pour le Sage ; Léo : pour le Barde) */
function codeDuLieu(fin){
  var c = Regles.contenu(X.partie, S.lieu).code; if(!c) return;
  fenetreCode({objet:null, code:c.id, pour:c.pour}, fin || S.lieu === 'leo');
}

/* ====================================================================== 6. LES FENÊTRES */
var POUR = {alchimiste:'l\'Alchimiste', sage:'le Sage', pisteur:'le Pisteur', barde:'le Barde'};
/* un code à donner à un autre joueur : il reste dans « 🎒 Objets » tant qu'on veut */
function fenetreCode(x, fin){
  var info = CODES.CODES[x.code] || {}, seq = CODES.code(x.code) || [], noms = seq.map(function(k){ return CODES.SYM[k].n; }).join(', ');
  var O = x.objet ? D.OBJETS[x.objet] : null, titre = O ? O.nom : (info.nom || 'Un code');
  var t = (O ? titre + ' ! ' : '') + 'Voici un code pour ' + POUR[x.pour] + ' : il le tape sur sa tablette.';
  DJ.fenetre('<h2>' + esc(titre) + '</h2><div class="ligne">' + t + DJ.lireBtn(t) + '</div>' +
    '<div class="code-gros">' + seq.map(function(k){ return '<span>' + CODES.SYM[k].e + '<small>' + CODES.SYM[k].n + '</small></span>'; }).join('') + DJ.lireBtn(noms) + '</div>' +
    '<div class="ligne petit">Ce code reste dans « 🎒 Objets ».</div>' +
    '<div class="boutons"><button class="aller guide" data-act="' + (fin ? 'fin-donjon' : 'fermer') + '">' + (fin ? 'Continuer ➜' : 'C\'est noté ➜') + '</button></div>', 'code');
  bruit('codeOk', {}, ['magie']);
}
function fenetreQui(id){
  var O = D.OBJETS[id], t = O.nom + ' ! ' + O.d + ' Qui la porte ?';
  DJ.fenetre('<h2>' + esc(O.nom) + '</h2><div class="ligne">' + t + DJ.lireBtn(t) + '</div><div class="qui">' + ORDRE.map(function(h){
    return '<button class="b-heros guide" data-act="qui-porte" data-id="' + h + '" data-objet="' + id + '"><span class="portrait img-' + h + '" style="' + DJ.tete(h, 76, 116, 10) + '"></span><b>' + D.HEROS[h].nom + '</b><em>' + (X.partie.heros[h].objets.length) + ' / 2 objets</em></button>'; }).join('') + '</div>', 'large');
}
function fenetrePlein(x){
  var O = D.OBJETS[x.objet], t = 'Les mains ' + D.HEROS[x.heros].du + ' sont pleines ! Pour prendre ' + O.nom + ', il faut laisser un objet ici.';
  X.plein = x;
  DJ.fenetre('<h2>Les mains pleines</h2><div class="ligne">' + t + DJ.lireBtn(t) + '</div><div class="qui">' + x.objets.map(function(o){
    var Oo = D.OBJETS[o]; return '<button class="sombre gros" data-act="laisser" data-id="' + o + '">Laisser : ' + esc(Oo.nom) + '</button>'; }).join('') +
    '<button class="sombre gros" data-act="fermer">Ne rien prendre</button></div>', 'large');
}
function fenetreObjets(){
  var p = X.partie, o = Regles.objets(p), s = '<h2>Les objets</h2>';
  ORDRE.forEach(function(h){
    var l = o.heros[h] || [];
    s += '<div class="sous">' + D.HEROS[h].nom + ' · ' + l.length + ' / 2</div>';
    if(!l.length) s += '<div class="ligne vide">Rien pour l\'instant.</div>';
    l.forEach(function(id){ var O = D.OBJETS[id], t = O.nom + '. ' + (O.d || ''); s += '<div class="ligne">' + t + DJ.lireBtn(t) + '</div>'; });
  });
  if(o.codes && o.codes.length){
    s += '<div class="sous">Les codes à donner</div>';
    o.codes.forEach(function(c){ var O = D.OBJETS[c.objet] || {nom:(CODES.CODES[c.code] || {}).nom || 'Un code'}, t = O.nom + ', pour ' + POUR[c.pour] + ' : ' + (CODES.code(c.code) || []).map(function(k){ return CODES.SYM[k].n; }).join(', ') + '.';
      s += '<div class="ligne">' + esc(O.nom) + ' → ' + POUR[c.pour] + ' : <span class="code-ligne">' + CODES.emojis(c.code) + '</span>' + DJ.lireBtn(t) + '</div>'; });
  }
  var sac = 'Le sac : ' + ((o.sac || []).map(function(r){ return D.RECETTES[r].nom; }).join(', ') || 'vide') + '.';
  s += '<div class="sous">Le sac de l\'Alchimiste · ' + (o.sac || []).length + ' / ' + o.places + '</div><div class="ligne">' + (o.sac || []).map(function(r){ return DJ.potion(r); }).join('') + '<span class="sr">' + sac + '</span>' + DJ.lireBtn(sac) + '</div>';
  if(o.or){ var tor = o.or + ' pièces d\'or dans la bourse.'; s += '<div class="sous">La bourse</div><div class="ligne">' + o.or + ' pièces d\'or 🪙' + DJ.lireBtn(tor) + '</div>'; }
  s += '<div class="boutons"><button class="sombre discret" data-act="recommencer">↺ Recommencer la descente</button></div>';
  s += '<div class="ligne petit version">Version du ' + esc(DJ.VERSION) + (DJ.plantages() ? ' · critiques allégés (' + DJ.plantages() + (DJ.plantageOu() ? ', ' + esc(DJ.plantageOu()) : '') + ')' : '') +
    (DJ.critMesure() ? ' · dernier critique : image la plus lente ' + esc(DJ.critMesure()) : '') + '</div>';
  DJ.fenetre(s, 'livre');
}
/* le pavé des 12 symboles : les codes des pages blanches (le Sage) et des recettes (l'Alchimiste) */
function fenetrePave(){
  var t = 'Le Sage ou l\'Alchimiste vous dictent trois symboles.';
  X.pave = [];
  DJ.fenetre('<h2>Un code</h2><div class="ligne">' + t + DJ.lireBtn(t) + '</div><div class="pave-cases"><i></i><i></i><i></i></div>' +
    '<div class="pave">' + CODES.ORDRE.map(function(k){ return '<button data-act="symbole" data-id="' + k + '" aria-label="' + CODES.SYM[k].n + '">' + CODES.SYM[k].e + '</button>'; }).join('') + '</div>' +
    '<div class="boutons"><button class="sombre" data-act="pave-efface">⌫ Effacer</button></div>', 'code');
}
function majPave(){ qa('.pave-cases i').forEach(function(c, k){ c.textContent = X.pave[k] ? CODES.SYM[X.pave[k]].e : ''; c.classList.toggle('plein', !!X.pave[k]); }); }
function symbole(k){
  if(!X.pave || X.pave.length >= 3) return;
  X.pave.push(k); son('clic'); majPave();
  if(X.pave.length < 3) return;
  var id = CODES.lire(X.pave, 'pisteur'), p = X.partie;
  var ev = id ? Regles.code(p, id) : [{t:'refus', mot:D.MOTS.inconnu}], x = ev[0] || {};
  setTimeout(function(){
    if(x.t === 'refus'){
      bruit('codeNon', {}, ['clic']); var c = q('.pave-cases'); if(c) DJ.relancer(c, 'non');
      var m = x.mot === D.MOTS.use ? 'Ce code a déjà servi. Chaque code ne marche qu\'une fois.' : 'Ce code ne dit rien au donjon. On vérifie les trois symboles ?';
      var l = q('#fenetre .ligne'); if(l) l.innerHTML = m + DJ.lireBtn(m);
      X.pave = []; setTimeout(majPave, 500); return;
    }
    garder();
    if(x.t === 'sauvegarde'){
      bruit('pageSauve', {}, ['page']);
      var t = 'C\'est écrit dans le Grand Livre ! Si ça tourne mal, vous repartirez d\'ici : ' + nomLieu(p.lieu) + '.';
      DJ.fenetre('<h2>Page de sauvegarde</h2><div class="ligne">' + t + DJ.lireBtn(t) + '</div><div class="code-gros"><span>📖<small>sauvegardé</small></span></div><div class="boutons"><button class="aller guide" data-act="fermer">Parfait ➜</button></div>', 'code');
    } else if(x.t === 'recette'){
      bruit('codeOk', {}, ['magie']);
      var R = D.RECETTES[x.id], t2 = 'Nouvelle recette : ' + R.nom + ' ! ' + R.long + ' Pour la mettre dans le sac, il faut un feu de camp.';
      DJ.fenetre('<h2>Nouvelle recette</h2><div class="ligne">' + t2 + DJ.lireBtn(t2) + '</div><div class="code-gros">' + DJ.potion(x.id) + '</div><div class="boutons"><button class="aller guide" data-act="fermer">Parfait ➜</button></div>', 'code');
    } else DJ.fermer();
  }, 350);
}
function finDonjon(){
  var p = X.partie, n = 0; Object.keys(p.livre || {}).forEach(function(k){ n += p.livre[k] || 0; });
  fermerScene(); quitterCarte(); X.ecran = 'fin';
  jeu.classList.remove('sur-carte'); jeu.innerHTML = '';
  var t = 'Léo est retrouvé, tout au fond du donjon ! Les trois héros ont battu les rats, le Gardien, le Roi des rats et Bourbe. Quelle descente !';
  var e = el('div', 'ecran'); e.id = 'fin-donjon';
  e.innerHTML = '<div class="pa-nom">Vous avez retrouvé Léo !</div><div class="bulle"><span class="txt">' + t + '</span>' + DJ.lireBtn(t) + '</div>' +
    '<div class="bilan"><div><b>' + n + '</b>📖 pages</div><div><b>' + (p.or || 0) + '</b>🪙 pièces</div></div>' +
    '<button class="aller guide" data-act="recommencer-oui">Recommencer la descente ↻</button>';
  jeu.appendChild(e);
  var fan = bruit('victoire', {}, ['fanfare']);
  setTimeout(function(){ DJ.musique('fin'); }, ((fan && fan.duree) || 3) * 1000);
}

/* ====================================================================== 7. LES DOIGTS */
DJ.toucher(function(a, id, b){
  if(!X.partie) return false;
  if(a === 'recette-sac'){ if(X.sac) X.sac.toucher(id, b); return true; }
  if(a === 'sac-pret'){ if(X.sac) X.sac.pret(); return true; }
  if(a === 'livre-carte'){ son('page'); DJ.grandLivre(X.partie); return true; }
  if(a === 'objets'){ son('clic'); fenetreObjets(); return true; }
  if(a === 'pave'){ son('clic'); fenetrePave(); return true; }
  if(a === 'symbole'){ symbole(id); return true; }
  if(a === 'pave-efface'){ X.pave = []; majPave(); return true; }
  if(a === 'entrer'){ if(!X.occupe && aScene(X.ici)){ son('clic'); arriver(X.ici, {entrer:true}); } return true; }
  if(a === 'repartir'){ son('clic'); X.echange = null; repartir(); return true; }
  if(a === 'plaque-objet'){ toucherPlaque(id, b.getAttribute('data-heros')); return true; }
  if(a === 'dalles-go'){ DJ.fermer(); if(S){ S.pret = true; colonneDalles(); conte('Première rangée. Laquelle des deux ?'); } return true; }
  if(a === 'qui-porte'){ DJ.fermer(); prendre(b.getAttribute('data-objet'), id); return true; }
  if(a === 'laisser'){
    var x = X.plein; DJ.fermer(); X.plein = null;
    if(!x) return true;
    if(X.pleinChoix){ var pc = X.pleinChoix; X.pleinChoix = null; choisir(pc.e, pc.d, pc.i, id); return true; }
    prendre(x.objet, x.heros, id); return true;
  }
  if(a === 'refaire-sac'){
    if(X.occupe) return true;
    if(!Regles.sacPermis(X.partie)){ conte('Le sac est bien fermé. On le refait au feu de camp, ou après une fuite.'); return true; }
    var lieu = S ? S.lieu : X.ici; fermerScene();
    ecranSac({}).then(function(){ arriver(lieu, {entrer:true}); });
    return true;
  }
  if(a === 'recommencer'){
    var t = 'Tout recommencer depuis le haut du puits ? La partie en cours sera effacée, le Grand Livre aussi.';
    DJ.fenetre('<h2>Recommencer ?</h2><div class="ligne">' + t + DJ.lireBtn(t) + '</div><div class="boutons"><button class="sombre" data-act="fermer">Non, on continue</button><button class="aller" data-act="recommencer-oui">Oui, on recommence</button></div>');
    return true;
  }
  if(a === 'recommencer-oui'){ DJ.oublier(); fermerScene(); quitterCarte(); location.href = location.pathname; return true; }
  if(a === 'fin-donjon'){ DJ.fermer(); finDonjon(); return true; }
  return false;
});

/* ====================================================================== 8. LE DÉPART */
function demarrer(P){
  P = P || {};
  jeu = q('#jeu');
  X.sansCombat = !!P.sanscombat;
  var p = P.nouveau ? null : DJ.relire();
  if(!p){
    p = X.partie = Regles.nouvellePartie(P.graine ? +P.graine : Math.floor(Math.random() * 2147483646) + 1);
    DJ.garder(p);
    return DJ.Combat.cuireHeros(), ecranSac({premier:true}).then(function(){ return ouvrirScene('puits', [], true); });
  }
  X.partie = p;
  DJ.Combat.cuireHeros();
  var c = Regles.contenu(p, p.lieu);
  if(c.combat && !c.gagne) return lancerCombat(c.combat);      /* la page s'est rechargée en plein combat : on revient à l'entrée de la salle */
  carte();
}
DJ.Explo = {
  demarrer:demarrer,
  etat:function(){ return {ecran:X.ecran, lieu:X.partie ? X.partie.lieu : null, ici:X.ici, occupe:X.occupe, sorties:(X.sorties || []).map(function(s){ return s.vers; }), scene:S ? S.lieu : null, texte:X.texte}; },
  _X:function(){ return X; }, _S:function(){ return S; }, aller:aller, arriver:arriver
};
})();
