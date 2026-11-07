/* ==========================================================
   Brumeval — mini-jeu du Barde : « Les dépositions »  (type 'depositions', préfixe .mjd-)
   Inspiré de « Petits Meurtres et Faits Divers » et des « deux versions » :
   plusieurs villageois racontent le même moment. Les honnêtes ont tous remarqué
   les mêmes choses (la cloche, la pluie, le chien de Tim…) et les disent avec
   leurs mots, sans jamais se contredire. Le menteur raconte une version qui ne
   colle pas : il contredit un détail, ou parle de choses que personne n'a vues.
   Le Barde lit les dépositions dans son carnet, les surligne au feutre (vert
   « pareil », rouge « bizarre », jaune « hmm ? »), les compare deux par deux,
   puis accuse. Aux niveaux hauts, il doit aussi toucher LA phrase fausse.
   Le résultat dit seulement s'il a trouvé et en combien d'essais : si le menteur
   lui échappe, personne ne lui dit qui c'était. Aucune lecture automatique.

   params (réglages) : nbDep, nbFaits, parTemoin, parTemoinMax, poids {gros, fin, invente},
     leurre (probabilité d'un témoin distrait mais honnête), detail (trouver la phrase fausse),
     coeurs (accusations permises), duree (s, 0 = pas de sablier), indirect, perso, aide, revele, zone.
   params (contenu imposé par une enquête, facultatif) :
     scene : 'Hier soir, à la taverne…' ou {texte, ic, titre}
     depositions : [{qui, texte, ment}]  — ou phrases:[texte | {t, d:'cle-du-detail-commun', faux:true}]
       (d = même clé pour un détail que plusieurs témoins partagent : sert aux mods aide et revele)
     detailFaux : texte (ou numéro) de la phrase fausse du menteur, pour l'étape « quelle phrase ? »
     sceneId : force une scène du générateur (essais).
   Mode oral (params.oral, ou le bouton « 🎧 À l'oral / 📖 À lire » de l'écran d'accueil, retenu sur
     l'appareil) : le texte est caché ; chaque témoin a ▶ Écouter et ↻ Réécouter (MJ.util.lire(texte,
     {qui}) : la voix du villageois). Jamais de lecture automatique. Pendant l'écoute, ses mots-clés
     (le SUJET de chaque phrase, jamais ce qu'il en dit : « 🔔 la cloche ») apparaissent en pastilles
     qu'on surligne et compare. Réécoutes : illimitées (n ≤ 3), 3 (n ≤ 6), 2 (n ≤ 9), 1 au-delà.
     Les mods aide et revele font aussi apparaître le texte entier (c'est une aide).
   mods : aide (N indices : un détail commun surligné en vert partout), zone (texte et cibles
     plus gros), erreurs (+N accusations), temps (+N × 10 s au sablier), lent (sablier ÷ lent),
     revele (les détails communs sont soulignés en pointillé), facile (géré par le cœur).
   Résultat : {reussi, score, erreurs, message, detail, revision:{type:'depositions', titre, bilan,
     scene, depositions:[{qui, nom, phrases:[{t, m}]}]}} — m = surlignage du joueur, jamais la réponse.
   Générateur : MJ.TYPES.depositions.generer(cfg) / verifier(cas) / textesVrais(fam, val).
   ========================================================== */
(function(){
'use strict';
if(!window.MJ || !MJ.enregistrer) return;
var U = MJ.util;

/* ---------- Outils ---------- */
function esc(s){ return String(s == null ? '' : s).replace(/[&<>"']/g, function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]; }); }
function plage(n){ var a = []; for(var i = 0; i < n; i++) a.push(i); return a; }
function cap(s){ s = String(s || ''); return s.charAt(0).toUpperCase() + s.slice(1); }
var FEM = {melusine:1, odette:1, iris:1, margot:1};
var IC = {grosbec:'🎩', gaspard:'👨‍🍳', melusine:'👩‍🦰', basile:'👨‍🌾', odette:'👵', tim:'🧒', victor:'🧔', anselme:'👴', iris:'👩‍🌾', fortune:'🤠', silas:'💂', farinel:'🧑‍🌾', margot:'👩‍🍳'};
/* Comment chacun est nommé dans les phrases : on ne parle pas de soi à la troisième personne. */
var ALIAS = {grosbec:['Grosbec', 'maire'], gaspard:['Gaspard', 'boulanger'], melusine:['Mélusine', 'couturière'], basile:['Basile', 'jardinier'],
  odette:['Odette'], tim:['Tim'], victor:['Victor', 'facteur'], anselme:['Anselme', 'sonneur'], iris:['Iris', 'herboriste'],
  fortune:['Fortuné', 'colporteur'], silas:['Silas', 'garde'], farinel:['Farinel', 'meunier'], margot:['Margot', 'tavernière']};
var RE_ALIAS = {};
Object.keys(ALIAS).forEach(function(id){ RE_ALIAS[id] = ALIAS[id].map(function(a){ return new RegExp('(^|[^A-Za-zÀ-ÿ])' + a + '(?![A-Za-zÀ-ÿ])'); }); });
function peutDire(qui, t){ var l = RE_ALIAS[qui] || []; for(var i = 0; i < l.length; i++) if(l[i].test(t)) return false; return true; }
function pnjD(id){ var D = window.DONNEES; return (D && D.PNJ && D.PNJ[id]) || null; }
function nomDe(id){ var p = pnjD(id); return (p && p.court) || (window.Persos && Persos.PNJ && Persos.PNJ[id] && Persos.PNJ[id].nom) || id || ''; }
function nomLong(id){ var p = pnjD(id); return (p && p.nom) || nomDe(id); }
function metierDe(id){ var p = pnjD(id); return (p && p.metier) || ''; }
function icDe(id){ var p = pnjD(id); return (p && p.ic) || IC[id] || '🗣️'; }
function lui(id){ return FEM[id] ? 'elle' : 'lui'; }
function portrait(id, anime){
  if(window.Persos && Persos.pnj){ try{ var s = Persos.pnj(id, {anime:anime !== false}); if(s) return s; }catch(e){} }
  return '<span class="mjd-emoji">' + icDe(id) + '</span>';
}
function minuteurs(){
  var ids = [];
  return {
    t:function(fn, ms){ var id = setTimeout(fn, ms); ids.push(id); return id; },
    i:function(fn, ms){ var id = setInterval(fn, ms); ids.push(id); return id; },
    tout:function(){ ids.forEach(function(id){ clearTimeout(id); clearInterval(id); }); ids = []; }
  };
}
function fmtTemps(s){ s = Math.max(0, Math.ceil(s)); return Math.floor(s / 60) + ':' + ('0' + (s % 60)).slice(-2); }

/* ==========================================================
   CONTENU
   Chaque famille = un détail que tous les témoins présents ont pu remarquer.
   valeurs : ce qui s'est vraiment passé (une seule par partie).
     v : façons honnêtes de le dire (« ~ » = façon indirecte, plus dure à reconnaître),
     x : contradiction franche (niveaux bas), s : contradiction fine, presque pareille (niveaux hauts).
   gabarit : les phrases ont des trous ({N}, {P}…) ; la contradiction fine reprend la même
     phrase avec une valeur voisine (neuf coups → huit coups).
   pnj : la famille parle de ce villageois : elle n'est pas utilisée s'il témoigne.
   m : moments où la famille (ou la valeur) a du sens.
   {e} : « e » si une femme parle.
   ========================================================== */
var SOIR = ['soir', 'nuit'], JOUR = ['matin', 'apresmidi'];
var FAM = {
  meteo:{ic:'🌦️', nom:'le temps qu\'il faisait', valeurs:[
    {k:'pluie', v:["Il pleuvait très fort.", "Dehors, il tombait des cordes.", "~La pluie tapait sur les carreaux.", "~Je suis arrivé{e} trempé{e} comme une soupe.", "~J'ai dû secouer mon parapluie en arrivant."],
      x:["Il faisait un temps magnifique, pas une goutte de pluie !", "Le ciel était tout sec, pas un seul nuage."],
      s:["Il neigeait à gros flocons.", "~Il y avait un peu de brouillard, mais pas une goutte ne tombait."]},
    {k:'neige', v:["Il neigeait.", "Dehors, tout était blanc de neige.", "~Les flocons tombaient tout doucement.", "~Mes bottes étaient pleines de neige.", "~En chemin, j'ai fait une petite boule de neige."],
      x:["Il faisait chaud comme en plein été !", "Il faisait si chaud que j'étais en chemise."],
      s:["Il pleuvait à verse.", "~Il tombait une petite pluie fine, pas un seul flocon."]},
    {k:'brume', v:["Il y avait un brouillard très épais.", "La brume cachait tout.", "~On ne voyait pas le bout de son nez.", "~Tout était gris et flou, à cause de la brume.", "~J'ai failli me cogner dans un arbre, tellement on n'y voyait rien."],
      x:["Le ciel était tout clair : on voyait jusqu'à la forêt !"],
      s:["L'air était bien clair, on voyait très loin.", "~On voyait le moulin de loin, sans aucune brume."]},
    {k:'etoiles', m:SOIR, v:["Le ciel était plein d'étoiles.", "Il faisait beau et doux.", "~On voyait toutes les étoiles du ciel.", "~Il faisait si beau qu'on pouvait compter les étoiles."],
      x:["Il pleuvait des cordes !", "Il y avait un gros orage, avec des éclairs."],
      s:["Le ciel était tout gris, sans une seule étoile.", "~De gros nuages cachaient tout le ciel."]},
    {k:'soleil', m:JOUR, v:["Il faisait grand soleil.", "Il y avait un beau soleil.", "~Le soleil chauffait fort.", "~J'avais mis mon chapeau à cause du soleil.", "~Le ciel était tout bleu."],
      x:["Il pleuvait des cordes !", "Il y avait un gros orage, avec des éclairs."],
      s:["Le ciel était tout gris, couvert de nuages.", "~Il tombait une petite pluie fine."]}
  ]},
  cloche:{ic:'🔔', nom:'la cloche', gabarit:1, valeurs:[
    {k:'7', N:'sept', m:['matin']}, {k:'8', N:'huit', m:['matin', 'soir']}, {k:'9', N:'neuf', m:SOIR}, {k:'10', N:'dix', m:SOIR},
    {k:'2', N:'deux', m:['apresmidi']}, {k:'3', N:'trois', m:['apresmidi']}, {k:'4', N:'quatre', m:['apresmidi']}],
    v:["La cloche a sonné {N} coups.", "J'ai entendu {N} coups de cloche.", "~Au clocher, j'ai compté {N} « dong » !", "~Anselme a sonné {N} heures au clocher.", "~Le clocher a fait « dong » {N} fois."],
    x:["La cloche n'a pas sonné une seule fois.", "Le clocher est resté muet : pas un seul « dong »."]},
  lanternes:{ic:'🏮', nom:'les lanternes', gabarit:1, m:SOIR, valeurs:[
    {k:'rouge', P:'rouges', M:'rouge', F:'rouge'}, {k:'bleu', P:'bleues', M:'bleu', F:'bleue'}, {k:'vert', P:'vertes', M:'vert', F:'verte'}, {k:'violet', P:'violettes', M:'violet', F:'violette'}],
    v:["Les lanternes étaient toutes {P}.", "On avait allumé des lanternes {P}.", "~Tout brillait en {M}, c'était joli.", "~Une jolie lumière {F} éclairait tout.", "~Les petites lanternes {P} se balançaient au-dessus de nous."],
    x:["Toutes les lanternes étaient éteintes : il faisait tout noir.", "Pas une seule lanterne n'était allumée."]},
  chien:{ic:'🐕', nom:'Pirate, le chien de Tim', pnj:'tim', valeurs:[
    {k:'aboie', v:["Pirate, le chien de Tim, aboyait.", "Le chien de Tim n'arrêtait pas d'aboyer.", "~Un petit chien faisait « ouaf ! ouaf ! » sans arrêt.", "~Le petit chien noir et blanc jappait très fort."],
      x:["Il n'y avait pas un seul chien.", "Aucun chien n'était là, j'en suis sûr{e}."],
      s:["Pirate, le chien de Tim, dormait sans faire un bruit.", "~Le petit chien noir et blanc était tout calme, couché dans un coin."]},
    {k:'dort', v:["Pirate, le chien de Tim, dormait en boule.", "Le chien de Tim faisait un gros dodo.", "~Le petit chien noir et blanc ronflait tout doucement.", "~Un petit chien dormait, roulé comme un croissant."],
      x:["Il n'y avait pas un seul chien.", "Aucun chien n'était là, j'en suis sûr{e}."],
      s:["Pirate, le chien de Tim, aboyait très fort.", "~Le petit chien noir et blanc courait partout en jappant."]},
    {k:'os', v:["Pirate, le chien de Tim, rongeait un gros os.", "Le chien de Tim mâchouillait un os.", "~Le petit chien noir et blanc grignotait un os : crac, crac !"],
      x:["Il n'y avait pas un seul chien.", "Aucun chien n'était là, j'en suis sûr{e}."],
      s:["Pirate, le chien de Tim, mâchouillait une vieille chaussette.", "~Le petit chien noir et blanc rongeait un bâton."]}
  ]},
  chats:{ic:'🐈', nom:'les chats d\'Odette', pnj:'odette', gabarit:1, valeurs:[
    {k:'2', N:'deux', Nm:'Deux'}, {k:'3', N:'trois', Nm:'Trois'}, {k:'4', N:'quatre', Nm:'Quatre'}, {k:'5', N:'cinq', Nm:'Cinq'}],
    v:["{Nm} chats d'Odette étaient là.", "J'ai compté {N} chats d'Odette.", "~{Nm} chats miaulaient en chœur : miaou !", "~Il y avait {N} chats, tous à la vieille Odette.", "~{Nm} chats se promenaient, la queue en l'air."],
    x:["Il n'y avait pas un seul chat.", "Aucun chat à l'horizon !"]},
  chanson:{ic:'🎶', nom:'la chanson', valeurs:[
    {k:'lanternes', v:["Quelqu'un chantait la chanson des lanternes.", "On chantait l'air de la Fête des Lanternes.", "~J'ai entendu chanter : « les lanternes s'allument une à une… »", "~Une voix fredonnait la chanson de la fête."],
      x:["Personne ne chantait : c'était tout silencieux.", "Il n'y avait aucune chanson, pas une note."],
      s:["Quelqu'un chantait la chanson du meunier.", "~J'ai entendu chanter : « meunier, tu dors… »"]},
    {k:'meunier', v:["Quelqu'un chantait la chanson du meunier.", "~J'ai entendu chanter : « meunier, tu dors, ton moulin va trop vite… »", "~On fredonnait l'air du moulin qui va trop vite."],
      x:["Personne ne chantait : c'était tout silencieux.", "Il n'y avait aucune chanson, pas une note."],
      s:["Quelqu'un chantait la chanson des lanternes.", "~J'ai entendu chanter : « les lanternes s'allument une à une… »"]},
    {k:'berceuse', v:["Quelqu'un chantait une berceuse.", "~Une voix douce chantait « dodo, l'enfant do ».", "~On aurait dit une chanson pour endormir les bébés."],
      x:["Personne ne chantait : c'était tout silencieux.", "Il n'y avait aucune chanson, pas une note."],
      s:["Quelqu'un chantait une chanson de pirates, très fort.", "~Une grosse voix chantait « à l'abordage, moussaillons ! »"]},
    {k:'pirates', v:["Quelqu'un chantait une chanson de pirates.", "~Une grosse voix chantait « à l'abordage, moussaillons ! »", "~On chantait très fort une chanson de bateau."],
      x:["Personne ne chantait : c'était tout silencieux.", "Il n'y avait aucune chanson, pas une note."],
      s:["Quelqu'un chantait une berceuse tout doucement.", "~Une voix douce chantait « dodo, l'enfant do »."]}
  ]},
  odeur:{ic:'👃', nom:'l\'odeur', valeurs:[
    {k:'poireaux', v:["Ça sentait la soupe aux poireaux.", "Il y avait une odeur de poireau partout.", "~Une grosse marmite de soupe aux poireaux chauffait.", "~Ça sentait fort le poireau cuit."],
      x:["Ça ne sentait rien du tout.", "Il n'y avait aucune odeur, rien de rien."],
      s:["Ça sentait la soupe aux carottes.", "~Une grosse marmite de soupe au potiron chauffait."]},
    {k:'pain', v:["Ça sentait le pain chaud.", "Il y avait une bonne odeur de pain.", "~Ça sentait comme à la boulangerie.", "~L'odeur des miches toutes chaudes me chatouillait le nez."],
      x:["Ça ne sentait rien du tout.", "Il n'y avait aucune odeur, rien de rien."],
      s:["Ça sentait le gâteau au chocolat.", "~Ça sentait les frites, miam."]},
    {k:'crepes', v:["Ça sentait les crêpes.", "Il y avait une odeur de crêpes au sucre.", "~Quelqu'un faisait sauter des crêpes, ça sentait bon."],
      x:["Ça ne sentait rien du tout.", "Il n'y avait aucune odeur, rien de rien."],
      s:["Ça sentait les gaufres.", "~Ça sentait la tarte aux pommes."]},
    {k:'chou', v:["Ça sentait le chou bouilli, beurk !", "Il y avait une odeur de vieux chou.", "~Ça puait le chou : j'ai dû me boucher le nez."],
      x:["Ça sentait très bon, comme un bouquet de roses."],
      s:["Ça sentait le vieux fromage, beurk !", "~Ça puait les chaussettes sales."]},
    {k:'lavande', v:["Ça sentait la lavande.", "Il y avait une bonne odeur de lavande.", "~Ça sentait comme dans un champ de lavande."],
      x:["Ça ne sentait rien du tout.", "Il n'y avait aucune odeur, rien de rien."],
      s:["Ça sentait la rose.", "~Ça sentait le muguet."]},
    {k:'savon', v:["Ça sentait le savon.", "Il y avait une bonne odeur de savon.", "~Ça sentait le linge tout propre."],
      x:["Ça ne sentait rien du tout.", "Il n'y avait aucune odeur, rien de rien."],
      s:["Ça sentait le poisson.", "~Ça sentait la vase et les algues."]}
  ]},
  feu:{ic:'🔥', nom:'le feu de cheminée', valeurs:[
    {k:'fume', v:["Le feu fumait beaucoup.", "La cheminée crachait de la fumée grise.", "~La fumée me piquait les yeux.", "~On toussait à cause de la fumée : keuf, keuf !"],
      x:["Il n'y avait pas de feu du tout.", "La cheminée était éteinte et toute froide."],
      s:["Le feu brûlait bien clair, sans aucune fumée.", "~De belles flammes bien claires dansaient, sans fumée."]},
    {k:'grand', v:["Un grand feu crépitait dans la cheminée.", "Le feu faisait « crac, crac ».", "~Les grosses bûches flambaient très fort.", "~Il faisait bien chaud près du grand feu."],
      x:["La cheminée était éteinte et toute froide.", "Il n'y avait pas de feu du tout."],
      s:["Le feu était tout petit, presque éteint.", "~Il ne restait que quelques braises, sans flammes."]},
    {k:'eteint', v:["Le feu était éteint.", "Il n'y avait pas de feu dans la cheminée.", "~La cheminée était toute noire et froide.", "~Personne n'avait allumé la cheminée."],
      x:["Un grand feu crépitait dans la cheminée !"],
      s:["Il y avait encore de petites flammes dans la cheminée.", "~Quelques bûches brûlaient doucement."]}
  ]},
  musique:{ic:'🪗', nom:'la musique de Fortuné', pnj:'fortune', valeurs:[
    {k:'accordeon', v:["Fortuné jouait de l'accordéon.", "Le colporteur jouait de l'accordéon.", "~Il y avait de la musique d'accordéon.", "~Fortuné tirait sur son accordéon en dansant."],
      x:["Il n'y avait aucune musique.", "Personne ne jouait de musique, pas une note."],
      s:["Fortuné jouait du violon.", "~Il y avait de la musique de flûte."]},
    {k:'tambour', v:["Fortuné tapait sur un tambour.", "Le colporteur jouait du tambour.", "~Boum, boum, boum : on entendait un tambour."],
      x:["Il n'y avait aucune musique.", "Personne ne jouait de musique, pas une note."],
      s:["Fortuné jouait de la trompette.", "~On entendait une trompette : tut, tut !"]}
  ]},
  animal:{ic:'🐾', nom:'l\'animal qui s\'est échappé', valeurs:[
    {k:'cochon', v:["Le cochon de Basile est passé en courant !", "Un cochon rose a filé sous mon nez.", "~Ça faisait « groin, groin » et ça courait partout.", "~J'ai vu passer un cochon tout rose, à toute vitesse."],
      x:["Aucun animal n'est passé, rien du tout."],
      s:["Une chèvre est passée en courant !", "~J'ai vu passer un mouton tout blanc, à toute vitesse."]},
    {k:'poule', v:["Une poule s'est échappée en caquetant.", "Une poule rousse courait partout.", "~Cot, cot, codet ! Une poule voletait dans tous les sens."],
      x:["Aucun animal n'est passé, rien du tout."],
      s:["Un canard s'est échappé en cancanant.", "~Un coq courait partout en chantant cocorico."]},
    {k:'chevre', v:["Une chèvre est passée en courant.", "~Une chèvre blanche a sauté par-dessus un tonneau.", "~Bêêê ! Une chèvre courait partout."],
      x:["Aucun animal n'est passé, rien du tout."],
      s:["Un cochon rose est passé en courant.", "~Un mouton a sauté par-dessus un tonneau."]}
  ]},
  ane:{ic:'🫏', nom:'l\'âne de Fortuné', pnj:'fortune', valeurs:[
    {k:'brait', v:["L'âne de Fortuné criait « hi-han » très fort.", "~Un âne faisait « hi-han ! hi-han ! »", "~L'âne du colporteur n'arrêtait pas de braire."],
      x:["Il n'y avait pas d'âne, pas le moindre."],
      s:["Un cheval hennissait très fort.", "~Un cheval faisait « hiii-hiii » sans arrêt."]}
  ]},
  silas:{ic:'💂', nom:'le sifflet du garde', pnj:'silas', gabarit:1, valeurs:[{k:'2', N:'deux'}, {k:'3', N:'trois'}, {k:'4', N:'quatre'}],
    v:["Silas, le garde, a sifflé {N} fois.", "Le garde champêtre a donné {N} coups de sifflet.", "~J'ai entendu {N} coups de sifflet : tuuut !", "~Le garde a soufflé {N} fois dans son sifflet."],
    x:["Personne n'a sifflé, pas une seule fois."]},
  hoquet:{ic:'😮', nom:'le hoquet de Gaspard', pnj:'gaspard', valeurs:[
    {k:'hoquet', v:["Gaspard, le boulanger, avait le hoquet.", "Le boulanger faisait « hic ! » sans arrêt.", "~Gaspard n'arrivait pas à arrêter son hoquet.", "~Hic ! Hic ! Le boulanger avait le hoquet."],
      x:["Personne n'avait le hoquet."],
      s:["Gaspard, le boulanger, éternuait sans arrêt.", "~Le boulanger toussait sans arrêt."]}
  ]},
  ronfle:{ic:'😴', nom:'le meunier qui dormait', pnj:'farinel', valeurs:[
    {k:'ronfle', v:["Aimé Farinel, le meunier, ronflait.", "Le meunier dormait en ronflant.", "~Quelqu'un ronflait très fort : rrrr… pfff…", "~Farinel dormait sur sa chaise et ronflait comme un ours."],
      x:["Personne ne dormait."],
      s:["Farinel était bien réveillé, il racontait des blagues.", "~Le meunier chantait à tue-tête."]}
  ]},
  casse:{ic:'💥', nom:'ce qui est tombé', valeurs:[
    {k:'verre', v:["Quelqu'un a fait tomber un verre : crac !", "On a entendu un verre se casser.", "~Il y avait des petits morceaux de verre par terre."],
      x:["Rien n'est tombé, rien n'a été cassé."],
      s:["Quelqu'un a fait tomber une casserole : bong !", "~Une cuillère en bois est tombée par terre."]},
    {k:'assiette', v:["Une assiette est tombée et s'est cassée.", "~Crac ! Une assiette en mille morceaux.", "~Il y avait des morceaux d'assiette par terre."],
      x:["Rien n'est tombé, rien n'a été cassé."],
      s:["Un seau en fer est tombé : bong !", "~Une chope est tombée, mais elle ne s'est pas cassée."]}
  ]},
  fontaine:{ic:'⛲', nom:'la fontaine', valeurs:[
    {k:'seche', v:["La fontaine ne coulait plus.", "Il n'y avait plus d'eau dans la fontaine.", "~La fontaine était toute sèche.", "~Pas un glouglou : la fontaine était en panne."],
      x:["La fontaine coulait à gros bouillons !"],
      s:["La fontaine faisait un petit glouglou tout doux.", "~L'eau de la fontaine coulait tout doucement."]},
    {k:'deborde', v:["La fontaine débordait.", "~L'eau de la fontaine coulait partout par terre.", "~J'ai marché dans une flaque, à cause de la fontaine qui débordait."],
      x:["La fontaine était toute sèche."],
      s:["La fontaine coulait tout doucement, comme d'habitude.", "~La fontaine faisait juste un petit glouglou."]}
  ]},
  grenouilles:{ic:'🐸', nom:'les grenouilles', valeurs:[
    {k:'chantent', v:["Les grenouilles coassaient.", "~Ça faisait « croâ, croâ » près de l'eau.", "~Les grenouilles chantaient à tue-tête."],
      x:["Il n'y avait aucune grenouille."],
      s:["Les grenouilles étaient toutes silencieuses.", "~Près de l'eau, des criquets chantaient, rien d'autre."]}
  ]},
  canards:{ic:'🦆', nom:'les canards', valeurs:[
    {k:'coin', v:["Des canards nageaient en faisant coin-coin.", "Une maman cane nageait avec ses petits.", "~Coin, coin ! Des canards barbotaient dans l'eau."],
      x:["Il n'y avait aucun canard."],
      s:["Des cygnes blancs nageaient sur l'eau.", "~Des oies grises barbotaient dans l'eau."]}
  ]},
  hibou:{ic:'🦉', nom:'l\'oiseau de nuit', m:SOIR, valeurs:[
    {k:'hulule', v:["Un hibou hululait.", "On entendait un hibou : hou-hou !", "~Dans un arbre, un oiseau de nuit faisait « hou-hou »."],
      x:["Pas un oiseau ne chantait."],
      s:["On entendait un corbeau : croa, croa !", "~Dans un arbre, un corbeau croassait."]}
  ]},
  riviere:{ic:'🌊', nom:'la rivière', valeurs:[
    {k:'haute', v:["La rivière était très haute.", "L'eau de la rivière grondait fort.", "~La rivière débordait presque sur le chemin."],
      x:["La rivière était presque à sec."],
      s:["La rivière était toute calme.", "~On entendait à peine la rivière."]},
    {k:'calme', v:["La rivière était toute calme.", "L'eau de la rivière était lisse comme un miroir.", "~On entendait à peine la rivière couler."],
      x:["La rivière grondait et débordait presque !"],
      s:["La rivière faisait de grosses vagues.", "~L'eau de la rivière grondait fort."]}
  ]},
  roue:{ic:'🎡', nom:'la roue du moulin', valeurs:[
    {k:'grince', v:["La roue du moulin grinçait.", "~La grande roue faisait « crii, crii ».", "~Le moulin grinçait comme une vieille porte."],
      x:["La roue du moulin était arrêtée."],
      s:["La roue du moulin tournait sans un bruit.", "~La grande roue tournait toute douce, en silence."]}
  ]},
  farine:{ic:'🌾', nom:'la farine par terre', valeurs:[
    {k:'partout', v:["Il y avait de la farine partout par terre.", "Le sol était tout blanc de farine.", "~J'ai laissé des traces de pas toutes blanches de farine."],
      x:["Le sol était tout propre."],
      s:["Il y avait du sucre renversé partout par terre.", "~Le sol était couvert de sel."]}
  ]},
  four:{ic:'🍞', nom:'le four', valeurs:[
    {k:'chaud', v:["Le four était allumé et tout chaud.", "Le four de Gaspard ronronnait.", "~On sentait la chaleur du four jusqu'à la porte."],
      x:["Le four était éteint et tout froid."],
      s:["Le four était à peine tiède.", "~Le four venait de s'éteindre."]}
  ]},
  abeilles:{ic:'🐝', nom:'les abeilles', m:JOUR, valeurs:[
    {k:'bzz', v:["Les abeilles bourdonnaient.", "Il y avait plein d'abeilles sur les fleurs.", "~Bzzz ! Ça bourdonnait partout dans les fleurs."],
      x:["Il n'y avait aucune abeille."],
      s:["Des guêpes bourdonnaient partout.", "~Il y avait plein de mouches sur les fleurs."]}
  ]},
  papillons:{ic:'🦋', nom:'les papillons', gabarit:1, m:JOUR, valeurs:[{k:'blanc', P:'blancs'}, {k:'jaune', P:'jaunes'}, {k:'bleu', P:'bleus'}, {k:'rouge', P:'rouges'}],
    v:["Des papillons {P} volaient partout.", "Il y avait plein de papillons {P}.", "~De petits papillons {P} dansaient sur les fleurs."],
    x:["Il n'y avait aucun papillon."]},
  foule:{ic:'👥', nom:'le monde qu\'il y avait', valeurs:[
    {k:'beaucoup', v:["Il y avait beaucoup de monde.", "C'était plein à craquer.", "~On se marchait sur les pieds.", "~Il fallait jouer des coudes pour passer."],
      x:["Il n'y avait presque personne."],
      s:["Il y avait juste trois ou quatre personnes.", "~C'était presque vide."]}
  ]},
  volet:{ic:'🪟', nom:'le volet', valeurs:[
    {k:'claque', v:["Un volet claquait : clac ! clac !", "On entendait un volet taper contre le mur.", "~Clac ! Clac ! Un volet n'arrêtait pas de cogner."],
      x:["Tout était calme, pas un seul bruit."],
      s:["Les volets étaient bien fermés, sans un bruit.", "~Une porte grinçait, mais aucun volet ne bougeait."]}
  ]},
  horloge:{ic:'🕰️', nom:'l\'horloge', valeurs:[
    {k:'arretee', v:["L'horloge était arrêtée.", "~L'horloge ne faisait plus tic-tac.", "~Les aiguilles de l'horloge ne bougeaient plus."],
      x:["L'horloge faisait tic-tac, comme d'habitude."],
      s:["L'horloge faisait un tout petit tic-tac.", "~Les aiguilles de l'horloge tournaient doucement."]},
    {k:'coucou', v:["Le coucou de l'horloge a chanté.", "~Coucou ! Coucou ! L'oiseau de l'horloge est sorti.", "~Un petit oiseau en bois est sorti de l'horloge."],
      x:["L'horloge était arrêtée, pas un bruit."],
      s:["L'horloge a sonné, mais aucun oiseau n'est sorti.", "~Une petite grenouille en bois est sortie de l'horloge."]}
  ]},
  linge:{ic:'🧺', nom:'le linge sur la corde', valeurs:[
    {k:'draps', v:["Des draps blancs séchaient sur la corde.", "~De grands draps blancs pendaient sur la corde.", "~Sur la corde à linge, il y avait des draps tout blancs."],
      x:["La corde à linge était toute vide."],
      s:["Des nappes à carreaux séchaient sur la corde.", "~Des chemises rouges pendaient sur la corde."]}
  ]},
  crieur:{ic:'📣', nom:'le marchand qui criait', m:JOUR, valeurs:[
    {k:'fromage', v:["Un marchand criait : « Fromages ! Fromages ! »", "~On entendait crier : « Qui veut du bon fromage ? »", "~Le marchand de fromages criait très fort."],
      x:["Personne ne criait, c'était très calme."],
      s:["Un marchand criait : « Poissons ! Poissons ! »", "~Le marchand de poissons criait très fort."]},
    {k:'poisson', v:["Un marchand criait : « Poissons ! Poissons ! »", "~On entendait crier : « Qui veut du bon poisson ? »", "~Le marchand de poissons criait très fort."],
      x:["Personne ne criait, c'était très calme."],
      s:["Un marchand criait : « Fromages ! Fromages ! »", "~Le marchand de fromages criait très fort."]}
  ]},
  enfants:{ic:'⚽', nom:'les enfants qui jouaient', m:JOUR, valeurs:[
    {k:'ballon', v:["Des enfants jouaient au ballon.", "~Un ballon rebondissait partout : boing, boing !", "~Des petits couraient après un ballon."],
      x:["Il n'y avait aucun enfant."],
      s:["Des enfants jouaient à la marelle.", "~Des petits sautaient à la corde."]},
    {k:'marelle', v:["Des enfants jouaient à la marelle.", "~Des petits sautaient à cloche-pied sur des cases.", "~Il y avait une marelle dessinée à la craie."],
      x:["Il n'y avait aucun enfant."],
      s:["Des enfants jouaient au ballon.", "~Des petits couraient après un ballon."]}
  ]}
};

/* Scènes : « familles » = détails possibles ici (famille:valeur1|valeur2 pour en limiter les valeurs). */
var SCENES = [
  {id:'taverne', titre:'La lanterne de Margot', ic:'🏮', moment:'soir', victime:'margot', ou:'à la taverne', quand:'hier soir',
    texte:'Hier soir, à la taverne du Chaudron fêlé, la lanterne de Margot a disparu.',
    familles:['meteo', 'cloche', 'chien', 'chats', 'chanson', 'odeur:poireaux|chou|crepes', 'feu', 'musique', 'casse', 'hoquet', 'ronfle', 'foule', 'volet', 'animal', 'ane']},
  {id:'boulangerie', titre:'La brioche géante', ic:'🥐', moment:'soir', victime:'gaspard', ou:'à la boulangerie', quand:'hier soir',
    texte:'Hier soir, à la boulangerie, la brioche géante de Gaspard a disparu.',
    familles:['meteo', 'cloche', 'chien', 'chats', 'four', 'odeur:pain|crepes', 'farine', 'chanson', 'ronfle', 'foule', 'animal', 'volet', 'horloge', 'hoquet']},
  {id:'place', titre:'Le chapeau du maire', ic:'🎩', moment:'soir', victime:'grosbec', ou:'sur la place', quand:'hier soir',
    texte:'Hier soir, sur la place, pendant la répétition de la Fête des Lanternes, le chapeau du maire a disparu.',
    familles:['meteo', 'cloche', 'lanternes', 'fontaine', 'chien', 'chats', 'chanson', 'musique', 'silas', 'hoquet', 'animal', 'ane', 'hibou', 'foule', 'odeur:crepes|pain']},
  {id:'lavoir', titre:'Les chaussettes à pois', ic:'🧦', moment:'matin', victime:'melusine', ou:'au lavoir', quand:'ce matin',
    texte:'Ce matin, au lavoir, les chaussettes à pois de Mélusine ont disparu.',
    familles:['meteo:soleil|brume', 'cloche', 'grenouilles', 'canards', 'linge', 'chien', 'chats', 'chanson:berceuse|lanternes|pirates', 'odeur:savon|lavande', 'animal', 'silas', 'enfants']},
  {id:'moulin', titre:'Le sac de farine', ic:'🌾', moment:'apresmidi', victime:'farinel', ou:'au moulin', quand:'hier après-midi',
    texte:'Hier après-midi, au moulin, un gros sac de farine du meunier a disparu.',
    familles:['meteo:soleil|brume', 'cloche', 'roue', 'farine', 'riviere', 'chien', 'chats', 'chanson:meunier|lanternes|pirates', 'ane', 'animal', 'silas', 'canards', 'abeilles', 'papillons']},
  {id:'clocher', titre:'Le dentier d\'Anselme', ic:'🦷', moment:'soir', victime:'anselme', ou:'au pied du clocher', quand:'hier soir',
    texte:'Hier soir, au pied du clocher, le dentier d\'Anselme a disparu.',
    familles:['meteo', 'cloche', 'hibou', 'lanternes', 'chien', 'chats', 'chanson', 'silas', 'musique', 'animal', 'volet', 'ane', 'hoquet', 'foule']},
  {id:'jardin', titre:'Le pot de miel', ic:'🍯', moment:'apresmidi', victime:'iris', ou:'dans le jardin d\'Iris', quand:'hier après-midi',
    texte:'Hier après-midi, dans le jardin d\'Iris, son pot de miel géant a disparu.',
    familles:['meteo:soleil|brume', 'cloche', 'abeilles', 'papillons', 'odeur:lavande', 'chien', 'chats', 'animal', 'chanson', 'ane', 'silas', 'hoquet', 'enfants']},
  {id:'poste', titre:'Le colis qui fait coin-coin', ic:'📦', moment:'matin', victime:'victor', ou:'à la poste', quand:'ce matin',
    texte:'Ce matin, à la poste, le colis de Victor qui faisait « coin-coin » a disparu.',
    familles:['meteo', 'cloche', 'chien', 'chats', 'odeur:pain|crepes', 'foule', 'hoquet', 'ronfle', 'horloge', 'volet', 'animal', 'musique', 'casse']},
  {id:'marche', titre:'Le potiron géant', ic:'🎃', moment:'matin', victime:'basile', ou:'au marché', quand:'ce matin',
    texte:'Ce matin, au marché, le plus gros potiron de Basile a disparu.',
    familles:['meteo:soleil|brume|pluie', 'cloche', 'chien', 'chats', 'crieur', 'enfants', 'musique', 'ane', 'animal', 'odeur:crepes|pain', 'foule', 'silas', 'fontaine', 'hoquet']},
  {id:'pont', titre:'La canne d\'Odette', ic:'🌉', moment:'soir', victime:'odette', ou:'sur le vieux pont', quand:'hier soir',
    texte:'Hier soir, sur le vieux pont, la canne d\'Odette a disparu.',
    familles:['meteo:pluie|brume|etoiles', 'cloche', 'riviere', 'grenouilles', 'hibou', 'lanternes', 'chien', 'chats', 'chanson', 'silas', 'ane', 'musique']}
];

/* Mots-clés du mode oral : le sujet de la phrase, sans jamais dire ce qui s'est passé. */
var MOTS = {meteo:'🌦️ le temps', cloche:'🔔 la cloche', lanternes:'🏮 les lanternes', chien:'🐕 Pirate, le chien', chats:'🐈 les chats',
  chanson:'🎶 la chanson', odeur:'👃 l\'odeur', feu:'🔥 le feu', musique:'🎵 la musique', animal:'🐾 un animal', ane:'🫏 l\'âne',
  silas:'💂 le garde', hoquet:'👨‍🍳 Gaspard', ronfle:'🧑‍🌾 le meunier', casse:'💥 ce qui est tombé', fontaine:'⛲ la fontaine',
  grenouilles:'🐸 près de l\'eau', canards:'🦆 sur l\'eau', hibou:'🐦 un oiseau', riviere:'🌊 la rivière', roue:'🎡 la roue du moulin',
  farine:'👣 le sol', four:'🍞 le four', abeilles:'🌼 sur les fleurs', papillons:'🦋 les papillons', foule:'👥 le monde',
  volet:'🪟 les volets', horloge:'🕰️ l\'horloge', linge:'🧺 la corde à linge', crieur:'📣 un marchand', enfants:'🧒 les enfants'};
var CLE_ORAL = 'brumeval-depositions-oral';
function modeOral(p){
  if(p && typeof p.oral === 'boolean') return p.oral;
  try{ return localStorage.getItem(CLE_ORAL) === '1'; }catch(e){ return false; }
}
function consigneDe(p){
  var oral = modeOral(p);
  return (oral ? 'Plusieurs témoins racontent le même moment : écoute-les bien ! ' : 'Plusieurs témoins racontent le même moment. ') +
    'Ceux qui disent la vérité ont vu les mêmes choses. Un seul ment : sa version ne colle pas ! ' +
    (oral ? 'Marque ses mots-clés, compare, puis accuse-le' : 'Surligne, compare, puis accuse-le') +
    (p && p.detail ? ', et montre sa phrase fausse.' : '.');
}
var INTRO = ["J'étais {ou}, {quand}.", "{Quand}, j'étais {ou}, moi aussi.", "Oui, j'étais {ou}.", "Je suis passé{e} {ou} {quand}.", "{Quand}, je suis allé{e} {ou}."];
var FIN = ["C'est tout ce que j'ai vu.", "Voilà, c'est tout !", "Je n'en sais pas plus."];
/* Phrases sur soi : elles ne parlent jamais d'un détail commun. */
var PERSO = ["J'avais un caillou dans ma chaussure.", "J'avais très faim.", "J'ai bâillé au moins dix fois.", "J'ai bavardé avec mon voisin.",
  "Je suis resté{e} jusqu'à la fin.", "Mon ventre gargouillait.", "Je n'ai rien pris, moi ! Je le jure.", "Après, je suis rentré{e} chez moi.",
  "J'avais perdu un bouton de ma veste.", "J'ai croqué une pomme."];
var PERSO_PNJ = {
  grosbec:["J'avais mes gants, comme toujours.", "J'ai serré beaucoup de mains."],
  gaspard:["Je pensais à ma pâte à pain.", "J'avais de la farine plein la moustache."],
  melusine:["Je tricotais une écharpe.", "J'ai perdu une épingle."],
  basile:["J'avais de la boue sur mes bottes.", "Je pensais à mes potirons."],
  odette:["J'avais mis mon châle violet.", "Je pensais à mes sept chats."],
  tim:["J'avais de la suie sur le nez.", "J'ai grimpé sur un tonneau pour mieux voir."],
  victor:["J'avais ma sacoche pleine de lettres.", "J'avais mal aux pieds, j'avais tant marché !"],
  anselme:["Mes vieilles oreilles entendent encore très bien !", "J'avais mon trousseau de clés dans la poche."],
  iris:["J'avais des fleurs dans les cheveux.", "J'avais un bouquet à la main."],
  fortune:["J'ai vendu deux rubans.", "J'ai fait une très bonne affaire !"],
  silas:["Je surveillais tout, c'est mon métier.", "J'ai noté des choses dans mon petit carnet noir."],
  farinel:["J'étais couvert de farine, comme toujours.", "J'ai mangé trois parts de tarte."],
  margot:["Mon tablier était tout taché.", "J'avais les joues toutes rouges."]
};
/* Le témoin distrait (honnête) : il a oublié, il ne se contredit pas. */
var OUBLI = ["Je ne me souviens plus très bien.", "Je n'ai pas fait très attention.", "J'étais à moitié endormi{e}, désolé{e}.",
  "J'avais oublié mes lunettes.", "Je pensais à autre chose.", "Je regardais mes chaussures."];

/* ==========================================================
   GÉNÉRATEUR
   cas = {scene, faits:{famille:valeur}, communs:[familles], deps:[{qui, ment, leurre,
     phrases:[{t, k, d, v}]}], menteur, leurre, faux:[phrases fausses du menteur], type}
   k : intro | vrai | contre | invente | perso | oubli | fin ;  d = famille ; v = valeur (ou '≠').
   ========================================================== */
function remplir(t, val, femme, sc){
  return String(t).replace(/^~/, '').replace(/\{(\w+)\}/g, function(m, k){
    if(k === 'e') return femme ? 'e' : '';
    if(k === 'ou') return sc ? sc.ou : '';
    if(k === 'quand') return sc ? sc.quand : '';
    if(k === 'Quand') return sc ? cap(sc.quand) : '';
    if(val && val[k] !== undefined) return val[k];
    return m;
  });
}
function vraies(c){ return c.f.gabarit ? c.f.v : c.val.v; }
function dit(qui, c){ return vraies(c).some(function(t){ return peutDire(qui, t); }); }
/* Toutes les façons honnêtes de dire un détail (pour les vérifications) */
function textesVrais(famId, valK){
  var f = FAM[famId]; if(!f) return [];
  var val = f.valeurs.filter(function(v){ return v.k === valK; })[0]; if(!val) return [];
  var l = [];
  (f.gabarit ? f.v : val.v).forEach(function(t){ l.push(remplir(t, val, false), remplir(t, val, true)); });
  return l;
}
function contresPour(c, sorte, qui){
  var l;
  if(sorte === 'gros') l = ((c.f.gabarit ? c.f.x : c.val.x) || []).map(function(t){ return {raw:t, v:'≠'}; });
  else if(c.f.gabarit){
    var idx = c.f.valeurs.indexOf(c.val);
    var autres = c.vals.filter(function(v){ return v !== c.val; });
    if(!autres.length) return [];
    autres.sort(function(a, b){ return Math.abs(c.f.valeurs.indexOf(a) - idx) - Math.abs(c.f.valeurs.indexOf(b) - idx); });
    var proches = autres.filter(function(v){ return Math.abs(c.f.valeurs.indexOf(v) - idx) === Math.abs(c.f.valeurs.indexOf(autres[0]) - idx); });
    var vo = U.choix(proches);
    l = c.f.v.map(function(t){ return {raw:t, val:vo, v:vo.k}; });
  } else l = (c.val.s || []).map(function(t){ return {raw:t, v:'≠'}; });
  return l.filter(function(x){ return peutDire(qui, x.raw); });
}
function tirerType(poids){
  poids = poids || {gros:1};
  var tot = 0, k; for(k in poids) tot += poids[k];
  var r = Math.random() * tot;
  for(k in poids){ r -= poids[k]; if(r <= 0) return k; }
  return 'gros';
}

function tenter(o){
  var n = o.n || 3, nbDep = o.nbDep || 4, nbF = o.nbFaits || 3;
  var sc = (o.sceneId && SCENES.filter(function(s){ return s.id === o.sceneId; })[0]) || U.choix(SCENES);
  var temoins = U.melanger(Object.keys(ALIAS).filter(function(id){ return id !== sc.victime; })).slice(0, nbDep);
  var cands = [];
  sc.familles.forEach(function(spec){
    var p = spec.split(':'), id = p[0], f = FAM[id];
    if(!f || (f.pnj && temoins.indexOf(f.pnj) >= 0) || (f.m && f.m.indexOf(sc.moment) < 0)) return;
    var permis = p[1] ? p[1].split('|') : null;
    var vals = f.valeurs.filter(function(v){ return (!permis || permis.indexOf(v.k) >= 0) && (!v.m || v.m.indexOf(sc.moment) >= 0); });
    if(!vals.length) return;
    cands.push({id:id, f:f, vals:vals, val:U.choix(vals)});
  });
  var iM = U.randInt(0, nbDep - 1), qM = temoins[iM];
  var autres = plage(nbDep).filter(function(i){ return i !== iM; });
  var iL = o.leurre ? U.choix(autres) : -1;
  var NI = autres.filter(function(i){ return i !== iL; });
  var type = o.type || 'gros';
  /* les détails communs : ceux que les honnêtes peuvent dire */
  var S = U.melanger(cands.filter(function(c){ return NI.filter(function(i){ return dit(temoins[i], c); }).length >= 2; })).slice(0, nbF);
  if(S.length < Math.min(3, nbF)) return null;
  var reste = cands.filter(function(c){ return S.indexOf(c) < 0; });
  var men = {}; plage(nbDep).forEach(function(i){ men[i] = []; });
  var k = o.parTemoin || 3;
  if(o.parTemoinMax > k && Math.random() < 0.5) k = o.parTemoinMax;
  k = Math.min(k, S.length);
  var F = null, contre = null, inventions = [];
  if(type !== 'invente'){
    var besoin = n <= 3 ? NI.length : n <= 6 ? Math.max(2, NI.length - 1) : Math.max(2, Math.ceil(NI.length / 2));
    var okF = S.filter(function(c){ return NI.filter(function(i){ return dit(temoins[i], c); }).length >= besoin && contresPour(c, type, qM).length; });
    if(!okF.length) return null;
    F = U.choix(okF);
    U.melanger(NI.filter(function(i){ return dit(temoins[i], F); })).slice(0, besoin).forEach(function(i){ men[i].push(F); });
  }
  function couverture(c){ return plage(nbDep).filter(function(i){ return i !== iM && men[i].indexOf(c) >= 0; }).length; }
  NI.forEach(function(i){
    while(men[i].length < k){
      var opts = U.melanger(S.filter(function(c){ return men[i].indexOf(c) < 0 && dit(temoins[i], c); }));
      if(!opts.length) break;
      opts.sort(function(a, b){ return couverture(a) - couverture(b); });
      men[i].push(opts[0]);
    }
  });
  if(iL >= 0) men[iL] = U.melanger(S.filter(function(c){ return dit(temoins[iL], c); })).slice(0, n >= 8 ? 1 : 2);
  if(S.some(function(c){ return couverture(c) < 2; })) return null;
  if(NI.some(function(i){ return men[i].length < Math.min(k, 2); })) return null;
  /* le menteur */
  if(type === 'invente'){
    var nbV = n <= 3 ? 0 : n <= 6 ? 1 : 2, nbI = n <= 5 ? 2 : 1;
    men[iM] = U.melanger(S.filter(function(c){ return dit(qM, c); })).slice(0, nbV);
    inventions = U.melanger(reste.filter(function(c){ return dit(qM, c); })).slice(0, nbI);
    if(inventions.length < nbI || men[iM].length < nbV) return null;
  } else {
    men[iM] = U.melanger(S.filter(function(c){ return c !== F && dit(qM, c); })).slice(0, Math.max(1, k - 1));
    if(!men[iM].length) return null;
  }
  /* les mots de chacun : des façons différentes de dire la même chose */
  var usage = {};
  function prendre(c, qui){
    var toutes = vraies(c).filter(function(t){ return peutDire(qui, t); });
    var u = usage[c.id] = usage[c.id] || [];
    var libres = toutes.filter(function(t){ return u.indexOf(t) < 0; });
    var pool = libres.length ? libres : toutes;
    var indirect = Math.random() < (o.indirect || 0);
    var pref = pool.filter(function(t){ return (t.charAt(0) === '~') === indirect; });
    var t = U.choix(pref.length ? pref : pool);
    u.push(t);
    return t;
  }
  var persoPris = {}, introPris = {};
  function unique(liste, pris){
    var l = U.melanger(liste), libres = l.filter(function(t){ return !pris[t]; });
    var t = (libres.length ? libres : l)[0]; pris[t] = 1; return t;
  }
  var ordre = NI.concat(iL >= 0 ? [iL] : [], [iM]);
  var phrasesDe = {};
  ordre.forEach(function(i){
    var qui = temoins[i], fe = !!FEM[qui], ph = [];
    men[i].forEach(function(c){ ph.push({t:remplir(prendre(c, qui), c.val, fe, sc), k:'vrai', d:c.id, v:c.val.k}); });
    if(i === iM){
      if(F){
        var cs = contresPour(F, type, qM), x;
        if(type === 'fin' && F.f.gabarit && Math.random() < 0.5){
          var deja = cs.filter(function(y){ return (usage[F.id] || []).indexOf(y.raw) >= 0; });
          x = U.choix(deja.length ? deja : cs);
        } else x = U.choix(cs);
        contre = {t:remplir(x.raw, x.val || F.val, fe, sc), k:'contre', d:F.id, v:x.v};
        ph.push(contre);
      }
      inventions.forEach(function(c){ ph.push({t:remplir(prendre(c, qui), c.val, fe, sc), k:'invente', d:c.id, v:c.val.k}); });
    }
    if(i === iL) ph.push({t:remplir(U.choix(OUBLI), null, fe, sc), k:'oubli'});
    var per = o.perso || [0, 0], np = U.randInt(per[0], per[1]);
    for(var q = 0; q < np; q++){
      /* chacun ses petites phrases : on évite qu'un autre témoin ait déjà dit la même */
      var tous = (PERSO_PNJ[qui] || []).concat(PERSO).filter(function(t){ return !persoPris[qui + t]; });
      var neufs = tous.filter(function(t){ return !persoPris[t]; });
      var t = U.choix(neufs.length ? neufs : tous); if(!t) break;
      persoPris[qui + t] = 1; persoPris[t] = 1;
      ph.push({t:remplir(t, null, fe, sc), k:'perso'});
    }
    ph = U.melanger(ph);
    ph.unshift({t:remplir(unique(INTRO, introPris), null, fe, sc), k:'intro'});
    if(o.fin && Math.random() < o.fin) ph.push({t:U.choix(FIN), k:'fin'});
    phrasesDe[i] = ph;
  });
  var deps = temoins.map(function(qui, i){ return {qui:qui, ment:i === iM, leurre:i === iL, phrases:phrasesDe[i]}; });
  var faits = {}; S.forEach(function(c){ faits[c.id] = c.val.k; });
  var faux = []; deps[iM].phrases.forEach(function(ph, j){ if(ph.k === 'contre' || ph.k === 'invente') faux.push(j); });
  return {scene:{id:sc.id, titre:sc.titre, texte:sc.texte, ic:sc.ic}, faits:faits, communs:S.map(function(c){ return c.id; }),
    deps:deps, menteur:iM, leurre:iL, faux:faux, type:type};
}
function generer(o){
  o = o || {};
  for(var essai = 0; essai < 80; essai++){ var c = tenter(o); if(c) return c; }
  /* filet de sécurité : la version la plus simple */
  for(var e2 = 0; e2 < 80; e2++){ var c2 = tenter({n:1, nbDep:4, nbFaits:3, parTemoin:3, type:'gros', sceneId:'taverne'}); if(c2) return c2; }
  return null;
}
/* Vérifie un cas généré : un seul menteur, des honnêtes qui ne se contredisent jamais. */
function verifier(cas){
  var pb = [];
  if(!cas) return ['aucun cas'];
  var menteurs = cas.deps.map(function(d, i){ return d.phrases.some(function(p){ return p.k === 'contre' || p.k === 'invente'; }) ? i : -1; }).filter(function(i){ return i >= 0; });
  if(menteurs.length !== 1) pb.push(menteurs.length + ' versions qui ne collent pas');
  if(menteurs[0] !== cas.menteur) pb.push('le menteur n\'est pas le bon');
  var dits = {};
  cas.deps.forEach(function(d, i){
    if(!!d.ment !== (i === cas.menteur)) pb.push('drapeau ment faux pour ' + i);
    d.phrases.forEach(function(p){
      if(p.k === 'vrai'){
        if(cas.faits[p.d] !== p.v) pb.push(d.qui + ' dit une autre valeur pour ' + p.d);
        if(textesVrais(p.d, p.v).indexOf(p.t) < 0) pb.push('phrase inconnue : ' + p.t);
        if(i !== cas.menteur){ dits[p.d] = (dits[p.d] || 0) + 1; }
      }
    });
  });
  cas.communs.forEach(function(f){ if((dits[f] || 0) < 2) pb.push('détail ' + f + ' vu par moins de deux honnêtes'); });
  var m = cas.deps[cas.menteur];
  m.phrases.forEach(function(p){
    if(p.k === 'contre'){
      if(!(dits[p.d] >= 2)) pb.push('contradiction sur un détail que moins de deux honnêtes ont dit');
      if(textesVrais(p.d, cas.faits[p.d]).indexOf(p.t) >= 0) pb.push('la contradiction est une phrase vraie : ' + p.t);
    }
    if(p.k === 'invente' && (dits[p.d] || cas.faits[p.d] !== undefined)) pb.push('invention sur un détail commun');
  });
  if(!cas.faux.length) pb.push('pas de phrase fausse');
  return pb;
}

/* Contenu imposé par une enquête */
function decouper(t){
  var out = [], re = /[^.!?…]+(?:[.!?…]+(?:\s*»)?|$)/g, m;
  while((m = re.exec(String(t || '')))){ var s = m[0].trim(); if(s) out.push(s); if(m[0] === '') re.lastIndex++; }
  return out;
}
function norm(s){ return String(s || '').toLowerCase().replace(/[«»"'’.!?…,:;]/g, '').replace(/\s+/g, ' ').trim(); }
function depuisParams(p){
  if(!p || !Array.isArray(p.depositions) || p.depositions.length < 2) return null;
  var deps = p.depositions.map(function(d){
    var phrases;
    if(Array.isArray(d.phrases)) phrases = d.phrases.map(function(x){
      if(typeof x === 'string') return {t:x, k:'?'};
      return {t:x.t || x.texte || '', k:x.faux ? 'contre' : (x.d ? 'vrai' : '?'), d:x.d || null, mot:x.mot || null};
    });
    else phrases = decouper(d.texte).map(function(t){ return {t:t, k:'?'}; });
    return {qui:d.qui, ment:!!d.ment, phrases:phrases};
  });
  var iM = -1; deps.forEach(function(d, i){ if(d.ment && iM < 0) iM = i; });
  if(iM < 0) return null;
  deps.forEach(function(d, i){ if(i !== iM) d.ment = false; });
  var faux = [];
  deps[iM].phrases.forEach(function(ph, j){ if(ph.k === 'contre') faux.push(j); });
  if(!faux.length && p.detailFaux !== undefined && p.detailFaux !== null){
    if(typeof p.detailFaux === 'number') faux = [p.detailFaux];
    else {
      var cible = norm(p.detailFaux);
      deps[iM].phrases.forEach(function(ph, j){ var a = norm(ph.t); if(a && cible && (a.indexOf(cible) >= 0 || cible.indexOf(a) >= 0)) faux.push(j); });
    }
    faux.forEach(function(j){ if(deps[iM].phrases[j]) deps[iM].phrases[j].k = 'contre'; });
  }
  var communs = [];
  deps.forEach(function(d){ d.phrases.forEach(function(ph){ if(ph.k === 'vrai' && ph.d && communs.indexOf(ph.d) < 0) communs.push(ph.d); }); });
  var sc = typeof p.scene === 'string' ? {texte:p.scene} : (p.scene || {});
  return {scene:{id:'donne', titre:sc.titre || 'Les dépositions', texte:sc.texte || 'Voici ce que les témoins ont raconté.', ic:sc.ic || '📜'},
    faits:{}, communs:communs, deps:deps, menteur:iM, leurre:-1, faux:faux, type:'donne', donne:true};
}

/* ==========================================================
   LE JEU
   ========================================================== */
/* Petite démo de l'écran d'accueil : à lire, ou à l'oral (pastilles de mots-clés). */
function animDemo(el, oral){
  var carte = function(id, nom, cls, txt){
    return '<div class="mjd-d-page' + (cls === 'c' ? ' c' : '') + '"><b>' + icDe(id) + ' ' + nom + '</b>' +
      (oral ? '<span class="mjd-d-play ' + cls + '">▶</span><p><span class="mjd-d-ph mjd-d-pill ' + cls + '">🌦️ le temps</span></p>' : '<p><span class="mjd-d-ph ' + cls + '">' + txt + '</span></p>') +
      (cls === 'c' ? '<span class="mjd-d-tampon">🫵 Menteur !</span>' : '') + '</div>';
  };
  el.innerHTML = '<div class="mjd-demo' + (oral ? ' oral' : '') + '"><div class="mjd-d-pages">' +
    carte('victor', 'Victor', 'a', 'Il pleuvait très fort.') + carte('melusine', 'Mélusine', 'b', 'Dehors, il tombait des cordes.') + carte('fortune', 'Fortuné', 'c', 'Il faisait un temps magnifique !') +
    '</div><p class="mjd-d-leg"></p><span class="mjd-d-main" aria-hidden="true">👆</span></div>';
  var box = el.firstChild, main = box.querySelector('.mjd-d-main'), leg = box.querySelector('.mjd-d-leg');
  var T = minuteurs();
  function va(sel){
    var cible = box.querySelector(sel); if(!cible) return;
    var b = box.getBoundingClientRect(), r = cible.getBoundingClientRect();
    main.style.left = (r.left - b.left + r.width * 0.5) + 'px'; main.style.top = (r.top - b.top + r.height * 0.6) + 'px';
  }
  function tape(){ main.classList.remove('tape'); void main.offsetWidth; main.classList.add('tape'); }
  function etape(t, f){ T.t(f, t); }
  function tour(){
    box.className = 'mjd-demo' + (oral ? ' oral' : '');
    main.style.left = '50%'; main.style.top = '100%';
    if(!oral){
      leg.textContent = 'Lis ce que chacun raconte…';
      etape(500, function(){ va('.mjd-d-ph.a'); });
      etape(1200, function(){ tape(); box.classList.add('s1'); leg.textContent = '🟢 Pareil : il pleuvait.'; });
      etape(1900, function(){ va('.mjd-d-ph.b'); });
      etape(2600, function(){ tape(); box.classList.add('s2'); leg.textContent = '🟢 Pareil : la pluie, avec d\'autres mots !'; });
      etape(3600, function(){ va('.mjd-d-ph.c'); });
      etape(4300, function(){ tape(); box.classList.add('s3'); leg.textContent = '🔴 Bizarre : ça ne colle pas !'; });
      etape(5400, function(){ box.classList.add('s4'); leg.textContent = '🫵 C\'est lui qui ment !'; });
      etape(8200, tour);
      return;
    }
    leg.textContent = '🎧 Écoute chaque témoin…';
    var q = [['a', 'Victor : « Il pleuvait très fort. »', '🟢 Pareil : il pleuvait.'], ['b', 'Mélusine : « Il tombait des cordes. »', '🟢 Pareil : la pluie !'], ['c', 'Fortuné : « Il faisait un temps magnifique ! »', '🔴 Bizarre : ça ne colle pas !']];
    q.forEach(function(x, k){
      var t0 = 400 + k * 2600;
      etape(t0, function(){ va('.mjd-d-play.' + x[0]); });
      etape(t0 + 600, function(){ tape(); box.classList.add('e' + (k + 1)); leg.textContent = '🎧 ' + x[1]; });
      etape(t0 + 1500, function(){ va('.mjd-d-ph.' + x[0]); });
      etape(t0 + 2100, function(){ tape(); box.classList.add('s' + (k + 1)); leg.textContent = x[2]; });
    });
    etape(8400, function(){ box.classList.add('s4'); leg.textContent = '🫵 C\'est lui qui ment !'; });
    etape(10800, tour);
  }
  T.t(tour, 50);
  return {arreter:T.tout};
}
var STYLOS = [{id:'v', nom:'Pareil'}, {id:'r', nom:'Bizarre'}, {id:'j', nom:'Hmm ?'}, {id:'g', nom:'Gomme'}];

function config(p){
  return {n:p.n || 3, nbDep:p.nbDep || 4, nbFaits:p.nbFaits || 3, parTemoin:p.parTemoin || 3, parTemoinMax:p.parTemoinMax || 3,
    type:tirerType(p.poids), leurre:Math.random() < (p.leurre || 0), indirect:p.indirect || 0, perso:p.perso || [0, 0], fin:p.finProba || 0, sceneId:p.sceneId};
}

MJ.enregistrer('depositions', {
  nom:'Les dépositions', role:'barde', ic:'🗒️',
  consigne:consigneDe,
  reglages:function(n, mods){
    mods = mods || {};
    var nbDep = n <= 3 ? 4 : n <= 6 ? 5 : 6;
    var nbFaits = n <= 2 ? 3 : n <= 5 ? 4 : 5;
    var poids = n <= 1 ? {gros:1} : n === 2 ? {gros:0.7, invente:0.3} : n === 3 ? {gros:0.6, invente:0.4} : n === 4 ? {gros:0.4, fin:0.3, invente:0.3} :
      n === 5 ? {gros:0.2, fin:0.5, invente:0.3} : n === 6 ? {fin:0.75, invente:0.25} : {fin:0.85, invente:0.15};
    var leurre = U.borne((n - 5) * 0.25, 0, 1);
    var detail = n >= 8;
    var coeurs = (n <= 2 ? 3 : n <= 10 ? 2 : 1) + Math.max(0, Math.round(mods.erreurs || 0));
    var lent = mods.lent > 0 && mods.lent < 1 ? mods.lent : 1;
    var duree = n >= 8 ? Math.round(U.parNiveau(n, 510, 240, 150) / lent + (mods.temps || 0) * 10) : 0;
    var aide = Math.max(0, Math.round(mods.aide || 0));
    var zone = U.borne(mods.zone || 1, 1, 1.6);
    var cache = n <= 3 ? 'se trahit vite' : n <= 6 ? 'se cache un peu' : 'se cache très bien';
    var reecoutes = n <= 3 ? -1 : n <= 6 ? 3 : n <= 9 ? 2 : 1;
    return {n:n, nbDep:nbDep, nbFaits:nbFaits, parTemoin:3, parTemoinMax:n >= 9 ? 4 : 3, poids:poids, leurre:leurre, detail:detail, coeurs:coeurs,
      duree:duree, indirect:U.borne((n - 3) * 0.12, 0, 0.7), perso:n <= 2 ? [0, 0] : n <= 5 ? [0, 1] : [1, 2], finProba:n >= 4 ? 0.35 : 0,
      aide:aide, revele:!!mods.revele, zone:zone, reecoutes:reecoutes,
      lignes:[
        {nom:'Témoins à écouter', val:String(nbDep)},
        {nom:'Le menteur', val:cache},
        {nom:'Tu peux accuser', val:coeurs + ' fois'},
        {nom:'Cœurs (erreurs permises)', val:String(coeurs - 1)}
      ].concat(detail ? [{nom:'Montrer aussi sa phrase fausse', val:'oui'}] : [])
       .concat(leurre ? [{nom:'Un témoin tête en l\'air (mais honnête)', val:leurre >= 1 ? 'oui' : 'peut-être'}] : [])
       .concat([{nom:'Sablier', val:duree ? fmtTemps(duree) : 'non, prends ton temps'}])
       .concat([{nom:'À l\'oral : réécouter un témoin', val:reecoutes < 0 ? 'autant que tu veux' : reecoutes + ' fois'}])
       .concat(aide || mods.revele ? [{nom:'À l\'oral, le texte s\'affiche quand même', val:'oui (aide)'}] : [])
       .concat(aide ? [{nom:'Indices (un détail pareil surligné partout)', val:String(aide)}] : [])
       .concat(mods.revele ? [{nom:'Les détails pareils sont soulignés', val:'oui'}] : [])
       .concat(zone > 1 ? [{nom:'Texte plus gros', val:'oui'}] : [])};
  },
  generer:generer, verifier:verifier, textesVrais:textesVrais, decouper:decouper, depuisParams:depuisParams, config:config, modeOral:modeOral,
  CONTENU:{FAM:FAM, SCENES:SCENES, PERSO:PERSO, PERSO_PNJ:PERSO_PNJ, OUBLI:OUBLI, INTRO:INTRO, MOTS:MOTS},

  demo:function(el, p){
    p = p || {};
    p.oral = modeOral(p);
    var courant = animDemo(el, p.oral);
    var intro = el.parentNode, tg = null;
    if(intro){
      var vieux = intro.querySelector('.mjd-mode'); if(vieux) vieux.parentNode.removeChild(vieux);
      tg = U.html('<div class="mjd-mode" role="group" aria-label="Comment jouer">' +
        '<button type="button" data-mode="oral" aria-pressed="false">🎧 À l\'oral</button>' +
        '<button type="button" data-mode="lire" aria-pressed="false">📖 À lire</button></div>');
      intro.insertBefore(tg, el.nextSibling);
      var maj = function(){
        Array.prototype.forEach.call(tg.children, function(b){ var on = (b.dataset.mode === 'oral') === p.oral; b.classList.toggle('on', on); b.setAttribute('aria-pressed', on ? 'true' : 'false'); });
        var c = intro.querySelector('.mj-consigne'); if(c) c.textContent = consigneDe(p);
      };
      tg.addEventListener('click', function(e){
        var b = e.target.closest('[data-mode]'); if(!b) return;
        var oral = b.dataset.mode === 'oral';
        if(oral === p.oral) return;
        p.oral = oral;
        try{ localStorage.setItem(CLE_ORAL, oral ? '1' : '0'); }catch(er){}
        U.son('clic');
        courant.arreter(); courant = animDemo(el, oral); maj();
      });
      maj();
    }
    return {arreter:function(){ courant.arreter(); }};
  },

  jouer:function(el, p, fin){
    p = p || {};
    var cas = depuisParams(p) || generer(config(p));
    var deps = cas.deps, N = deps.length;
    var T = minuteurs(), finMinuteur = null, arrete = false, termine = false;
    var detailMode = !!(p.detail && cas.faux && cas.faux.length);
    var revele = !!p.revele;
    var oral = modeOral(p);
    var texteVisible = !oral || (p.aide > 0) || revele;      /* à l'oral, les aides montrent quand même le texte */
    var illimite = !(p.reecoutes >= 0);
    var E = minuteurs();                                      /* l'écoute en cours */
    var z = U.borne(p.zone || 1, 1, 1.6);
    var etat = {phase:'scene', cur:0, lu:[], vu:[], marques:deps.map(function(d){ return d.phrases.map(function(){ return null; }); }),
      stylo:'v', coeurs:Math.max(1, p.coeurs || 2), total:Math.max(1, p.coeurs || 2), erreurs:0, accuses:{}, pasca:{}, cmp:null, cote:1,
      indices:Math.max(0, p.aide || 0), indicesVus:{}, indiceSur:{}, reste:p.duree || 0, ecrit:-1, detailEssais:0,
      parle:-1, reecoutes:deps.map(function(){ return illimite ? Infinity : p.reecoutes; }), ouie:deps.map(function(d){ return d.phrases.map(function(){ return false; }); })};
    var miniCache = {};
    function mini(id){ if(!miniCache[id]) miniCache[id] = portrait(id, false); return miniCache[id]; }

    var racine = U.html('<div class="mjd' + (z > 1 ? ' mjd-gros' : '') + (oral ? ' oral' : '') + (oral && texteVisible ? ' oral-texte' : '') + '" style="--mjd-z:' + z + '">' +
      '<div class="mjd-haut">' +
        '<div class="mjd-fiche"><span class="mjd-fiche-ic">' + esc(cas.scene.ic) + '</span><p class="mjd-fiche-txt">' + esc(cas.scene.texte) + '</p>' +
          '<button type="button" class="mjd-lire" data-lire="scene" aria-label="Écouter ce qui s\'est passé">🔊</button></div>' +
        '<div class="mjd-etat"><div class="mjd-coeurs" title="Accusations qui te restent"></div>' +
          '<div class="mjd-sablier" hidden><span>⏳</span><b></b><i><s></s></i></div>' +
          '<button type="button" class="mjd-indice" hidden></button></div>' +
      '</div>' +
      '<div class="mjd-onglets" role="tablist">' + deps.map(function(d, i){
        return '<button type="button" class="mjd-onglet" data-tab="' + i + '" role="tab"><span class="mjd-mini">' + mini(d.qui) + '</span><b>' + esc(nomDe(d.qui)) + '</b><i class="mjd-badge"></i></button>';
      }).join('') + '</div>' +
      '<div class="mjd-centre"><div class="mjd-pages"></div><p class="mjd-bandeau" hidden></p></div>' +
      '<div class="mjd-stylos">' + STYLOS.map(function(s){
        return '<button type="button" class="mjd-stylo mjd-s-' + s.id + '" data-stylo="' + s.id + '" aria-pressed="false"><i></i><span>' + s.nom + '</span></button>';
      }).join('') + '</div>' +
      '<div class="mjd-actions">' +
        '<button type="button" class="mjd-fleche" data-nav="-1" aria-label="Témoin précédent">◀</button>' +
        '<button type="button" class="mjd-cmp" aria-pressed="false" aria-label="Comparer deux dépositions">⚖️<span> Comparer</span></button>' +
        '<button type="button" class="mjd-principal"></button>' +
        '<button type="button" class="mjd-fleche" data-nav="1" aria-label="Témoin suivant">▶</button>' +
      '</div>' +
      '<div class="mjd-voile" hidden></div>' +
    '</div>');
    el.appendChild(racine);
    var Q = function(s){ return racine.querySelector(s); };
    var pages = Q('.mjd-pages'), onglets = Q('.mjd-onglets'), bandeauEl = Q('.mjd-bandeau'), voile = Q('.mjd-voile');
    var principal = Q('.mjd-principal'), bCmp = Q('.mjd-cmp'), coeursEl = Q('.mjd-coeurs'), bIndice = Q('.mjd-indice');
    var sablier = Q('.mjd-sablier');

    function toutLu(){ for(var i = 0; i < N; i++) if(!etat.lu[i]) return false; return true; }
    function nbLus(){ return etat.lu.filter(Boolean).length; }
    function ouvert(i){ return i >= 0 && i < N && (etat.vu[i] || i === 0 || !!etat.lu[i - 1]); }
    function premierNonVu(){ for(var i = 0; i < N; i++) if(!etat.vu[i]) return i; return -1; }

    /* ---------- dessin ---------- */
    function motCle(ph){
      if(ph.mot) return ph.mot;
      if(ph.d && MOTS[ph.d]) return MOTS[ph.d];
      if(ph.k === 'perso') return '💬 autre chose';
      if(ph.k === 'oubli') return '🤔 ne sait plus trop';
      return '💬 « ' + ph.t.split(' ').slice(0, 2).join(' ') + '… »';
    }
    function pastille(ph){ return ph.k !== 'intro' && ph.k !== 'fin'; }
    function phraseHTML(i, j){
      var ph = deps[i].phrases[j], m = etat.marques[i][j];
      var cls = 'mjd-ph' + (m ? ' m-' + m : '') + (revele && ph.k === 'vrai' && ph.d ? ' commun' : '') + (etat.indiceSur[i + ':' + j] ? ' indice' : '') + (etat.pasca[j] && i === cas.menteur ? ' pasca' : '') +
        (oral && !etat.ouie[i][j] ? ' cache' : '');
      if(oral && !texteVisible)
        return '<span class="' + cls + ' mjd-pill" data-d="' + i + '" data-p="' + j + '" role="button" tabindex="0">' + esc(motCle(ph)) + '</span>';
      return '<span class="' + cls + '" data-d="' + i + '" data-p="' + j + '" role="button" tabindex="0">' +
        ph.t.split(' ').map(function(w){ return '<i>' + esc(w) + '</i>'; }).join(' ') + '</span>';
    }
    function boutonsEcoute(i){
      var ici = etat.parle === i, entendu = !!etat.lu[i], r = etat.reecoutes[i];
      return '<button type="button" class="mjd-ecouter' + (ici && !entendu ? ' actif' : '') + '" data-ecoute="' + i + '"' + (entendu || ici ? ' disabled' : '') + '>' +
          (ici && !entendu ? '🎧 J\'écoute…' : entendu ? '✔ Écouté' : '▶ Écouter') + '</button>' +
        '<button type="button" class="mjd-reecouter' + (ici && entendu ? ' actif' : '') + '" data-reecoute="' + i + '"' + (!entendu || ici || r <= 0 ? ' disabled' : '') + '>' +
          (ici && entendu ? '🎧 J\'écoute…' : '↻ Réécouter') + '<small>' + (r === Infinity ? 'autant que tu veux' : r > 0 ? 'encore ' + r + ' fois' : 'plus de réécoute') + '</small></button>';
    }
    function pageOralHTML(i, cote){
      var d = deps[i], duo = cote !== undefined;
      var vus = d.phrases.filter(function(ph, j){ return pastille(ph) && etat.ouie[i][j]; }).length;
      return '<article class="mjd-page oral' + (etat.lu[i] ? ' lu' : '') + (etat.parle === i ? ' parle' : '') + (etat.phase === 'detail' && i === cas.menteur ? ' cible' : '') + '" data-dep="' + i + '">' +
        '<header class="mjd-page-tete">' +
          (duo ? '<button type="button" class="mjd-pfl" data-cote="' + cote + '" data-dir="-1" aria-label="Autre témoin">◀</button>' : '') +
          '<div class="mjd-portrait">' + portrait(d.qui, !duo) + '</div>' +
          '<div class="mjd-qui"><small>Déposition de</small><b>' + esc(nomLong(d.qui)) + '</b><span>' + esc(metierDe(d.qui)) + '</span></div>' +
          '<span class="mjd-ondes" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i></span>' +
          (duo ? '<button type="button" class="mjd-pfl" data-cote="' + cote + '" data-dir="1" aria-label="Autre témoin">▶</button>' : '') +
        '</header>' +
        '<div class="mjd-oreille">' + boutonsEcoute(i) + '</div>' +
        (texteVisible ? '<p class="mjd-texte">' + d.phrases.map(function(ph, j){ return phraseHTML(i, j); }).join(' ') + '</p>' :
          '<div class="mjd-mc' + (vus ? ' plein' : '') + '"><p class="mjd-mc-titre">🔑 Ses mots-clés</p><div class="mjd-motscles">' +
            d.phrases.map(function(ph, j){ return pastille(ph) ? phraseHTML(i, j) : ''; }).join('') + '</div>' +
            '<p class="mjd-mc-vide">Écoute ' + esc(nomDe(d.qui)) + ' : ses mots-clés vont apparaître ici, au fur et à mesure.</p></div>') +
        (etat.accuses[i] ? '<p class="mjd-tampons"><span class="mjd-tampon">✔ Pas ' + lui(d.qui) + ' !</span></p>' : '') +
      '</article>';
    }
    function pageHTML(i, cote){
      if(oral) return pageOralHTML(i, cote);
      var d = deps[i], duo = cote !== undefined;
      return '<article class="mjd-page' + (etat.lu[i] ? ' lu' : '') + (etat.phase === 'detail' && i === cas.menteur ? ' cible' : '') + '" data-dep="' + i + '">' +
        '<header class="mjd-page-tete">' +
          (duo ? '<button type="button" class="mjd-pfl" data-cote="' + cote + '" data-dir="-1" aria-label="Autre témoin">◀</button>' : '') +
          '<div class="mjd-portrait">' + portrait(d.qui, !duo) + '</div>' +
          '<div class="mjd-qui"><small>Déposition de</small><b>' + esc(nomLong(d.qui)) + '</b><span>' + esc(metierDe(d.qui)) + '</span></div>' +
          '<button type="button" class="mjd-lire" data-lire="' + i + '" aria-label="Écouter la déposition">🔊</button>' +
          (duo ? '<button type="button" class="mjd-pfl" data-cote="' + cote + '" data-dir="1" aria-label="Autre témoin">▶</button>' : '') +
        '</header>' +
        '<p class="mjd-texte">' + d.phrases.map(function(ph, j){ return phraseHTML(i, j); }).join(' ') + '</p>' +
        '<span class="mjd-plume" aria-hidden="true">✍️</span>' +
        (etat.accuses[i] ? '<p class="mjd-tampons"><span class="mjd-tampon">✔ Pas ' + lui(d.qui) + ' !</span></p>' : '') +
      '</article>';
    }
    function rendrePages(dir){
      if(etat.cmp){
        pages.className = 'mjd-pages duo';
        pages.innerHTML = pageHTML(etat.cmp[0], 0) + pageHTML(etat.cmp[1], 1);
      } else {
        pages.className = 'mjd-pages';
        pages.innerHTML = pageHTML(etat.cur);
        var pg = pages.firstChild;
        if(dir) pg.classList.add(dir > 0 ? 'de-droite' : 'de-gauche');
      }
      /* à l'oral : si le témoin qui parle n'est plus à l'écran, on coupe */
      if(oral && etat.parle >= 0 && !pages.querySelector('.mjd-page[data-dep="' + etat.parle + '"]')) arreterEcoute();
    }
    /* ---------- l'écoute (mode oral) ---------- */
    function texteDe(i){ return deps[i].phrases.map(function(ph){ return ph.t; }).join(' '); }
    function majOral(){
      if(!oral) return;
      Array.prototype.forEach.call(pages.querySelectorAll('.mjd-page'), function(pg){
        var i = +pg.dataset.dep, o = pg.querySelector('.mjd-oreille');
        if(o) o.innerHTML = boutonsEcoute(i);
        pg.classList.toggle('parle', etat.parle === i); pg.classList.toggle('lu', !!etat.lu[i]);
      });
    }
    function reveler(i, j){
      if(etat.ouie[i][j]) return;
      etat.ouie[i][j] = true;
      Array.prototype.forEach.call(pages.querySelectorAll('.mjd-ph[data-d="' + i + '"][data-p="' + j + '"]'), function(sp){
        sp.classList.remove('cache'); sp.classList.add('pop');
        var mc = sp.closest('.mjd-mc'); if(mc) mc.classList.add('plein');
      });
    }
    function ecouter(i){
      if(termine || !oral || (etat.phase !== 'jeu' && etat.phase !== 'detail') || etat.parle === i) return;
      var entendu = !!etat.lu[i];
      if(entendu){ if(!(etat.reecoutes[i] > 0)) return; etat.reecoutes[i]--; }
      if(etat.parle >= 0){ E.tout(); etat.parle = -1; }
      etat.parle = i;
      U.lire(texteDe(i), {qui:deps[i].qui});
      var tempo = (MJ.TYPES.depositions && MJ.TYPES.depositions._tempo) || 1, t = 350;
      deps[i].phrases.forEach(function(ph, j){
        E.t(function(){ reveler(i, j); }, t * tempo);
        t += ph.t.length * 60 + 380;
      });
      E.t(function(){ finEcoute(i); }, (t + 150) * tempo);
      majOral(); majActions();
    }
    function finEcoute(i){
      E.tout();
      if(etat.parle === i) etat.parle = -1;
      deps[i].phrases.forEach(function(ph, j){ reveler(i, j); });
      if(!etat.lu[i]){
        etat.lu[i] = true;
        if(toutLu()) bandeau('🎧 Tu as écouté tout le monde ! Marque les mots-clés, compare… puis accuse le menteur.', 5200);
      }
      majOral(); majActions();
    }
    function arreterEcoute(){
      if(etat.parle < 0) return;
      E.tout(); etat.parle = -1; U.stop(); majOral();
    }
    function majPhrase(i, j){
      var ph = deps[i].phrases[j], m = etat.marques[i][j];
      Array.prototype.forEach.call(pages.querySelectorAll('.mjd-ph[data-d="' + i + '"][data-p="' + j + '"]'), function(sp){
        sp.classList.remove('m-v', 'm-r', 'm-j');
        if(m) sp.classList.add('m-' + m);
        sp.classList.toggle('indice', !!etat.indiceSur[i + ':' + j]);
        sp.classList.toggle('pasca', !!(etat.pasca[j] && i === cas.menteur));
        sp.classList.toggle('commun', revele && ph.k === 'vrai' && !!ph.d);
      });
    }
    function majOnglets(){
      Array.prototype.forEach.call(onglets.children, function(b, i){
        var cur = etat.cmp ? etat.cmp.indexOf(i) >= 0 : i === etat.cur;
        b.classList.toggle('cur', cur);
        b.classList.toggle('lu', !!etat.lu[i]);
        b.classList.toggle('accuse', !!etat.accuses[i]);
        b.disabled = etat.phase === 'scene' || termine || !ouvert(i) || (etat.cmp && !etat.lu[i]);
        b.setAttribute('aria-selected', cur ? 'true' : 'false');
        b.querySelector('.mjd-badge').textContent = etat.accuses[i] ? '✔' : etat.lu[i] ? '' : (etat.vu[i] ? (oral ? '🎧' : '✍️') : '…');
      });
      var c = onglets.children[etat.cmp ? etat.cmp[etat.cote] : etat.cur];
      if(c && c.scrollIntoView && onglets.scrollWidth > onglets.clientWidth + 4){
        var o = onglets.getBoundingClientRect(), r = c.getBoundingClientRect();
        if(r.left < o.left || r.right > o.right) onglets.scrollLeft += (r.left + r.width / 2) - (o.left + o.width / 2);
      }
    }
    function majCoeurs(choc){
      /* la règle des cœurs (mj-core.js) : cœurs = erreurs encore permises (accusations − 1 : la dernière ne doit pas rater) */
      coeursEl.innerHTML = U.coeurs(etat.coeurs - 1, etat.total - 1, choc ? etat.coeurs - 1 : undefined);
      coeursEl.setAttribute('aria-label', etat.coeurs + ' accusation' + (etat.coeurs > 1 ? 's' : '') + ' possible' + (etat.coeurs > 1 ? 's' : ''));
      if(choc){ coeursEl.classList.remove('choc'); void coeursEl.offsetWidth; coeursEl.classList.add('choc'); }
      if(choc && etat.coeurs === 1) U.plusDeCoeur(coeursEl);
    }
    function majActions(){
      var enJeu = etat.phase === 'jeu', det = etat.phase === 'detail', actif = enJeu || det;
      Q('[data-nav="-1"]').disabled = !actif || !!etat.cmp || etat.cur <= 0;
      Q('[data-nav="1"]').disabled = !actif || !!etat.cmp || !ouvert(etat.cur + 1);
      bCmp.disabled = !actif || nbLus() < 2;
      bCmp.setAttribute('aria-pressed', etat.cmp ? 'true' : 'false');
      racine.classList.toggle('cmp', !!etat.cmp);
      racine.classList.toggle('mode-detail', det);
      principal.className = 'mjd-principal';
      principal.disabled = false;
      if(det && !etat.cmp){
        if(etat.cur === cas.menteur){ principal.className += ' attend'; principal.textContent = '🎯 Touche sa phrase fausse'; }
        else { principal.className += ' suite'; principal.textContent = '↩ Revenir à ' + nomDe(deps[cas.menteur].qui); }
      } else if(etat.cmp){
        principal.className += ' second';
        principal.textContent = '✖ Fermer la comparaison';
      } else if(!toutLu()){
        if(!etat.lu[etat.cur]){
          if(oral && etat.parle !== etat.cur){ principal.className += ' suite'; principal.textContent = '🎧 Écouter ' + nomDe(deps[etat.cur].qui); }
          else { principal.className += ' attend'; principal.textContent = (oral ? '🎧 ' : '✍️ ') + nomDe(deps[etat.cur].qui) + ' raconte…'; }
        }
        else { principal.className += ' suite'; principal.textContent = 'Témoin suivant ▶'; }
      } else {
        var q = deps[etat.cur].qui;
        principal.textContent = '🫵 C\'est ' + lui(q) + ' qui ment !';
        principal.disabled = !!etat.accuses[etat.cur] || !enJeu;
      }
      Array.prototype.forEach.call(racine.querySelectorAll('.mjd-stylo'), function(b){
        var on = b.dataset.stylo === etat.stylo; b.classList.toggle('on', on); b.setAttribute('aria-pressed', on ? 'true' : 'false');
      });
      bIndice.hidden = !(etat.indices > 0) || !(cas.communs && cas.communs.length);
      bIndice.textContent = '💡 Indice (' + etat.indices + ')';
      bIndice.disabled = !(actif && etat.indices > 0);
      majOnglets();
    }
    var bandeauMin = null;
    function bandeau(txt, duree){
      bandeauEl.textContent = txt; bandeauEl.hidden = false;
      bandeauEl.classList.remove('montre'); void bandeauEl.offsetWidth; bandeauEl.classList.add('montre');
      if(bandeauMin) clearTimeout(bandeauMin);
      bandeauMin = duree === 0 ? null : setTimeout(function(){ bandeauEl.hidden = true; }, duree || 4200);
    }

    /* ---------- lecture progressive ---------- */
    function ecrire(i){
      var page = pages.querySelector('.mjd-page[data-dep="' + i + '"]'); if(!page) return;
      page.classList.add('ecrit');
      var t = 120;
      Array.prototype.forEach.call(page.querySelectorAll('.mjd-ph'), function(sp){
        Array.prototype.forEach.call(sp.querySelectorAll('i'), function(m){ m.style.setProperty('--t', Math.round(t) + 'ms'); t += 85; });
        t += 280;
      });
      etat.ecrit = i;
      T.t(function(){ finirEcriture(i); }, t + 250);
    }
    function finirEcriture(i){
      if(termine || etat.lu[i]) return;
      etat.lu[i] = true;
      if(etat.ecrit === i) etat.ecrit = -1;
      Array.prototype.forEach.call(pages.querySelectorAll('.mjd-page[data-dep="' + i + '"]'), function(pg){ pg.classList.remove('ecrit'); pg.classList.add('lu'); });
      if(toutLu()) bandeau('📖 Tu as tout lu ! Surligne, compare… puis accuse le menteur.', 5200);
      majActions();
    }
    function montrer(i, dir){
      if(termine) return;
      etat.cur = i;
      var premier = !etat.vu[i];
      etat.vu[i] = true;
      rendrePages(dir);
      U.son('page');
      if(premier && !etat.lu[i] && !oral) ecrire(i);
      majActions();
      if(pages.firstChild) pages.firstChild.scrollTop = 0;
    }
    function naviguer(dir){
      if((etat.phase !== 'jeu' && etat.phase !== 'detail') || etat.cmp) return;
      var i = etat.cur + dir;
      if(!ouvert(i)) return;
      montrer(i, dir);
    }

    /* ---------- surligner ---------- */
    function marquer(i, j, s){
      s = s || etat.stylo;
      var m = etat.marques[i][j];
      var nv = s === 'g' ? null : (m === s ? null : s);
      etat.marques[i][j] = nv;
      if(!nv) delete etat.indiceSur[i + ':' + j];
      majPhrase(i, j);
      U.son(nv ? 'tic' : 'clic');
    }

    /* ---------- comparer ---------- */
    function lusSauf(x){ var l = []; for(var i = 0; i < N; i++) if(etat.lu[i] && i !== x) l.push(i); return l; }
    function ouvrirCmp(){
      if((etat.phase !== 'jeu' && etat.phase !== 'detail') || nbLus() < 2) return;
      var a = etat.lu[etat.cur] ? etat.cur : lusSauf(-1)[0];
      var l = lusSauf(a), b = l.filter(function(i){ return i > a; })[0];
      if(b === undefined) b = l[l.length - 1];
      etat.cmp = [a, b]; etat.cote = 1;
      rendrePages(); U.son('page'); majActions();
    }
    function fermerCmp(){
      if(!etat.cmp) return;
      etat.cur = etat.cmp[etat.cote];
      etat.cmp = null; rendrePages(); U.son('page'); majActions();
    }
    function changerCote(cote, dir){
      if(!etat.cmp) return;
      var autre = etat.cmp[1 - cote], l = lusSauf(autre);
      if(!l.length) return;
      var pos = l.indexOf(etat.cmp[cote]);
      etat.cmp[cote] = l[(pos + dir + l.length) % l.length];
      etat.cote = cote;
      rendrePages(); U.son('page'); majActions();
    }

    /* ---------- accuser ---------- */
    function fermerVoile(){ voile.hidden = true; voile.innerHTML = ''; }
    function demander(html, oui){
      voile.innerHTML = '<div class="mjd-conf">' + html + '<div class="mjd-conf-btns"><button type="button" class="mjd-oui">' + oui + '</button><button type="button" class="mjd-non">↩ Non, attends</button></div></div>';
      voile.hidden = false;
    }
    var aConfirmer = null;
    function confirmerAccusation(i){
      if(etat.phase !== 'jeu' || !toutLu() || etat.accuses[i]) return;
      var q = deps[i].qui;
      aConfirmer = {sorte:'qui', i:i};
      demander('<div class="mjd-portrait grand">' + portrait(q) + '</div><p>Tu accuses <b>' + esc(nomLong(q)) + '</b> ?</p>' +
        '<p class="mjd-conf-sous">' + (etat.coeurs > 1 ? 'Il te reste ' + etat.coeurs + ' accusations.' : 'Attention : c\'est ta dernière accusation !') + '</p>',
        '🫵 Oui, c\'est ' + lui(q) + ' !');
      U.son('clic');
    }
    function confirmerPhrase(j){
      if(etat.phase !== 'detail' || etat.pasca[j]) return;
      aConfirmer = {sorte:'phrase', j:j};
      var ph = deps[cas.menteur].phrases[j];
      if(texteVisible) demander('<p>Cette phrase est fausse ?</p><p class="mjd-conf-cite">« ' + esc(ph.t) + ' »</p>', '🎯 Oui, c\'est celle-là !');
      else demander('<p>' + esc(nomDe(deps[cas.menteur].qui)) + ' a menti sur…</p><p class="mjd-conf-cite">' + esc(motCle(ph)) + ' ?</p>', '🎯 Oui, c\'est là !');
      U.son('clic');
    }
    function accuser(i){
      if(termine || etat.phase !== 'jeu') return;
      fermerVoile();
      if(i === cas.menteur){
        if(detailMode){
          etat.phase = 'detail'; etat.cmp = null; etat.cur = i;
          rendrePages(); U.son('ok');
          bandeau('🎯 Bien vu ! Sa version ne colle pas. Maintenant, touche SA phrase fausse (les phrases entourées).', 6500);
          majActions();
        } else gagner();
      } else {
        etat.erreurs++; etat.coeurs--; etat.accuses[i] = true;
        U.son('ko'); U.vibrer(80);
        rendrePages();
        var pg = pages.querySelector('.mjd-page'); if(pg) pg.classList.add('secoue');
        majCoeurs(true);
        if(etat.coeurs <= 0) perdre('accuse');
        else { bandeau('🙅 Ce n\'est pas ' + lui(deps[i].qui) + ' : sa version tient debout. Il te reste ' + etat.coeurs + ' accusation' + (etat.coeurs > 1 ? 's' : '') + '.', 5200); majActions(); }
      }
    }
    function choisirPhrase(j){
      if(termine || etat.phase !== 'detail') return;
      fermerVoile();
      etat.detailEssais++;
      if(cas.faux.indexOf(j) >= 0){
        etat.marques[cas.menteur][j] = 'r'; majPhrase(cas.menteur, j);
        Array.prototype.forEach.call(pages.querySelectorAll('.mjd-ph[data-d="' + cas.menteur + '"][data-p="' + j + '"]'), function(sp){ sp.classList.add('trouve'); });
        gagner();
      } else {
        etat.erreurs++; etat.coeurs--; etat.pasca[j] = true; majPhrase(cas.menteur, j);
        U.son('ko'); U.vibrer(80); majCoeurs(true);
        if(etat.coeurs <= 0) perdre('detail');
        else bandeau('Non : cette phrase-là colle avec les autres. Encore ' + etat.coeurs + ' essai' + (etat.coeurs > 1 ? 's' : '') + '.', 5200);
      }
    }

    /* ---------- fin ---------- */
    function revision(bilan){
      return {type:'depositions', titre:'Les dépositions', bilan:bilan, scene:cas.scene.texte, oral:oral || undefined,
        depositions:deps.map(function(d, i){ return {qui:d.qui, nom:nomDe(d.qui), phrases:d.phrases.map(function(ph, j){ return {t:ph.t, m:etat.marques[i][j] || null}; })}; })};
    }
    function finir(res){
      if(termine) return;
      termine = true; etat.phase = 'fin';
      T.tout(); E.tout(); if(etat.parle >= 0){ etat.parle = -1; U.stop(); }
      if(bandeauMin) clearTimeout(bandeauMin);
      racine.classList.add('fini');
      majActions();
      finMinuteur = setTimeout(function(){ finMinuteur = null; if(!arrete) fin(res); }, 1300);
    }
    function gagner(){
      var essais = etat.erreurs + 1;
      var bilan = !etat.erreurs ? 'Tu as démasqué le menteur du premier coup !' : 'Tu as démasqué le menteur en ' + essais + ' essais.';
      var pg = pages.querySelector('.mjd-page[data-dep="' + cas.menteur + '"]');
      if(pg){ var tp = document.createElement('p'); tp.className = 'mjd-tampons'; tp.innerHTML = '<span class="mjd-tampon menteur">🫵 Menteur !</span>'; pg.appendChild(tp); }
      U.son('ok');
      finir({reussi:true, erreurs:etat.erreurs, score:Math.max(0.3, 1 - etat.erreurs * 0.25), message:'Démasqué !',
        detail:(etat.erreurs ? 'Trouvé en ' + essais + ' essais.' : 'Trouvé du premier coup !') + (detailMode ? ' Et tu as montré sa phrase fausse.' : ''),
        revision:revision(bilan)});
    }
    function perdre(raison){
      var bilan = raison === 'temps' ? 'Le sablier s\'est vidé avant la fin.' : raison === 'detail' ? 'Tu as trouvé le menteur, mais pas sa phrase fausse.' : 'Le menteur t\'a échappé.';
      var detail = raison === 'temps' ? 'Le sablier est vide : le menteur s\'est éclipsé. Qui était-ce ? Mystère.' :
        raison === 'detail' ? 'Tu as trouvé le menteur, mais pas sa phrase fausse.' : 'Le menteur t\'a échappé. Qui était-ce ? Personne ne te le dira.';
      finir({reussi:false, erreurs:etat.erreurs, score:0, message:raison === 'temps' ? 'Trop tard…' : 'Raté…', detail:detail + ' Tu pourras relire les dépositions plus tard.',
        revision:revision(bilan)});
    }

    /* ---------- indice ---------- */
    function indice(){
      if(termine || (etat.phase !== 'jeu' && etat.phase !== 'detail') || etat.indices <= 0) return;
      var F = (deps[cas.menteur].phrases.filter(function(ph){ return ph.k === 'contre'; })[0] || {}).d;
      var cands = (cas.communs || []).filter(function(f){ return f !== F && !etat.indicesVus[f]; });
      var dansM = cands.filter(function(f){ return deps[cas.menteur].phrases.some(function(ph){ return ph.d === f && ph.k === 'vrai'; }); });
      var f = U.choix(dansM.length ? dansM : cands);
      if(!f){ bandeau('💡 Ton flair ne trouve plus rien de nouveau.'); return; }
      etat.indices--; etat.indicesVus[f] = true;
      deps.forEach(function(d, i){ d.phrases.forEach(function(ph, j){ if(ph.d === f && ph.k === 'vrai'){ etat.marques[i][j] = 'v'; etat.indiceSur[i + ':' + j] = true; majPhrase(i, j); } }); });
      U.son('magie');
      bandeau('💡 Plusieurs témoins parlent de ' + (FAM[f] ? FAM[f].nom : 'la même chose') + ' : c\'est surligné en vert partout ✨', 5600);
      majActions();
    }

    /* ---------- sablier ---------- */
    function demarrerSablier(){
      if(!p.duree) return;
      sablier.hidden = false;
      var t0 = Date.now(), total = p.duree;
      function tic(){
        if(termine) return;
        etat.reste = Math.max(0, total - (Date.now() - t0) / 1000);
        sablier.querySelector('b').textContent = fmtTemps(etat.reste);
        sablier.querySelector('s').style.width = (100 * etat.reste / total) + '%';
        sablier.classList.toggle('presse', etat.reste <= 30);
        if(etat.reste <= 0) perdre('temps');
      }
      tic(); T.i(tic, 250);
    }

    /* ---------- départ : la fiche de la scène ---------- */
    function commencer(){
      if(termine || etat.phase !== 'scene') return;
      fermerVoile();
      etat.phase = 'jeu';
      U.stop();
      montrer(0, 0);
      demarrerSablier();
    }
    voile.innerHTML = '<div class="mjd-carte"><span class="mjd-carte-ic">' + esc(cas.scene.ic) + '</span><h3>Ce qui s\'est passé</h3>' +
      '<p class="mjd-carte-txt">' + esc(cas.scene.texte) + '</p>' +
      '<button type="button" class="mjd-lire" data-lire="scene" aria-label="Écouter">🔊</button>' +
      '<p class="mjd-carte-sous">' + N + ' témoins vont raconter ce qu\'ils ont vu. ' + (oral ? 'Écoute bien : un' : 'Un') + ' seul ment : sa version ne colle pas avec les autres !</p>' +
      '<button type="button" class="btn grand mjd-commencer">' + (oral ? '🎧 Écouter les témoins' : '📖 Lire les dépositions') + '</button></div>';
    voile.hidden = false;

    /* ---------- événements ---------- */
    var ignorerClic = false, sx = null, sy = null;
    pages.addEventListener('pointerdown', function(e){ sx = e.clientX; sy = e.clientY; });
    pages.addEventListener('pointercancel', function(){ sx = null; });
    pages.addEventListener('pointerup', function(e){
      if(sx === null) return;
      var dx = e.clientX - sx, dy = e.clientY - sy; sx = null;
      if(!etat.cmp && (etat.phase === 'jeu' || etat.phase === 'detail') && Math.abs(dx) > 70 && Math.abs(dx) > Math.abs(dy) * 1.6){
        ignorerClic = true; setTimeout(function(){ ignorerClic = false; }, 350);
        naviguer(dx < 0 ? 1 : -1);
      }
    });
    racine.addEventListener('click', function(ev){
      if(termine) return;
      var t = ev.target;
      var lire = t.closest('[data-lire]');
      if(lire){
        var k = lire.dataset.lire;
        U.son('clic');
        if(k === 'scene') U.lire(cas.scene.texte);
        else { var d = deps[+k]; if(d) U.lire(texteDe(+k), {qui:d.qui}); }
        return;
      }
      if(t.closest('.mjd-commencer')){ commencer(); return; }
      var ec = t.closest('[data-ecoute],[data-reecoute]');
      if(ec){ if(voile.hidden && !ec.disabled) ecouter(+(ec.dataset.ecoute || ec.dataset.reecoute)); return; }
      if(t.closest('.mjd-non')){ aConfirmer = null; fermerVoile(); U.son('clic'); return; }
      if(t.closest('.mjd-oui')){
        var a = aConfirmer; aConfirmer = null;
        if(a && a.sorte === 'qui') accuser(a.i); else if(a && a.sorte === 'phrase') choisirPhrase(a.j); else fermerVoile();
        return;
      }
      if(!voile.hidden) return;
      var st = t.closest('[data-stylo]');
      if(st){ etat.stylo = st.dataset.stylo; U.son('clic'); majActions(); return; }
      var tab = t.closest('[data-tab]');
      if(tab){
        var ti = +tab.dataset.tab;
        if(etat.cmp){
          if(!etat.lu[ti]) return;
          if(ti === etat.cmp[1 - etat.cote]) etat.cote = 1 - etat.cote;
          else etat.cmp[etat.cote] = ti;
          rendrePages(); U.son('page'); majActions();
        } else if(ti !== etat.cur && ouvert(ti)) montrer(ti, ti > etat.cur ? 1 : -1);
        return;
      }
      var nav = t.closest('[data-nav]');
      if(nav){ naviguer(+nav.dataset.nav); return; }
      if(t.closest('.mjd-cmp')){ if(etat.cmp) fermerCmp(); else ouvrirCmp(); return; }
      if(t.closest('.mjd-indice')){ indice(); return; }
      if(t.closest('.mjd-principal')){
        if(etat.phase === 'detail'){ if(etat.cmp) fermerCmp(); else if(etat.cur !== cas.menteur) montrer(cas.menteur, cas.menteur > etat.cur ? 1 : -1); return; }
        if(etat.phase !== 'jeu') return;
        if(etat.cmp){ fermerCmp(); return; }
        if(!toutLu()){
          if(!etat.lu[etat.cur]){ if(!oral) finirEcriture(etat.cur); else if(etat.parle !== etat.cur) ecouter(etat.cur); return; }
          var s = premierNonVu(); if(s >= 0) montrer(s, 1);
          return;
        }
        confirmerAccusation(etat.cur);
        return;
      }
      var pfl = t.closest('.mjd-pfl');
      if(pfl){ changerCote(+pfl.dataset.cote, +pfl.dataset.dir); return; }
      if(ignorerClic){ ignorerClic = false; return; }
      var page = t.closest('.mjd-page');
      if(!page) return;
      var i = +page.dataset.dep;
      if(etat.cmp) etat.cote = etat.cmp.indexOf(i) >= 0 ? etat.cmp.indexOf(i) : etat.cote;
      if(!etat.lu[i] && !oral){ finirEcriture(i); return; }
      var sp = t.closest('.mjd-ph');
      if(!sp || sp.classList.contains('cache')) return;
      var j = +sp.dataset.p;
      if(etat.phase === 'detail'){ if(i === cas.menteur) confirmerPhrase(j); else marquer(i, j); return; }
      if(etat.phase === 'jeu') marquer(i, j);
    });
    racine.addEventListener('keydown', function(ev){
      if((ev.key === 'Enter' || ev.key === ' ') && ev.target.classList && ev.target.classList.contains('mjd-ph')){ ev.preventDefault(); ev.target.click(); }
    });

    majCoeurs(false);
    majActions();
    /* Banc d'essai : accès direct (jamais utilisé par le jeu lui-même) */
    racine.__cas = cas;
    try{
      window.__mjd = {cas:cas, etat:etat,
        accuser:function(i){ if(etat.phase === 'jeu'){ deps.forEach(function(d, k){ etat.lu[k] = true; etat.vu[k] = true; d.phrases.forEach(function(x, j){ etat.ouie[k][j] = true; }); }); accuser(i); } },
        phrase:function(j){ choisirPhrase(j); },
        marquer:function(i, j, s){ marquer(i, j, s); },
        ecouter:function(i){ ecouter(i); },
        toutLire:function(){ if(etat.phase === 'scene') commencer(); for(var k = 0; k < N; k++){ etat.vu[k] = true; if(oral){ etat.parle = -1; finEcoute(k); } else finirEcriture(k); } E.tout(); rendrePages(); majActions(); }};
    }catch(e){}
    return {arreter:function(){
      arrete = true; termine = true;
      T.tout(); E.tout();
      if(finMinuteur){ clearTimeout(finMinuteur); finMinuteur = null; }
      if(bandeauMin){ clearTimeout(bandeauMin); bandeauMin = null; }
    }};
  }
});
})();
