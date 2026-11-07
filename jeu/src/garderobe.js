/* ==========================================================
   Brumeval — la garde-robe du Pisteur : catalogue, couleurs,
   dessin des vêtements (couches SVG sur le héros de persos.js),
   et la table des trouvailles des enquêtes.
   Tout est décoratif : rien ne change la difficulté du jeu.

   Chargé juste après persos.js. Expose window.Garde :
     Garde.SLOTS, Garde.ITEMS, Garde.PALETTE, Garde.DEPART, Garde.TROUVAILLES
     Garde.teinte(id), Garde.suivante(id)          couleurs
     Garde.nomComplet(it)                           « des bottes de rôdeur »
     Garde.icone(slot)                              petite image SVG d'un emplacement
   Le moteur de dessin est branché dans Persos (Persos.garde) :
     h.garde = {tete:{id:'chapeau_rodeur', c:'rouge'}, …}  → dessiné sur le héros
     Persos.heros(h, {pose:'guet'})                       → accroupi, aux aguets (la cabane)
     Persos.heros(h, {cadre:'tete'})                      → vignette recadrée
   ========================================================== */
(function(){
'use strict';
var Persos = window.Persos;
if(!Persos || !Persos.garde || !Persos.outils) return;
var T = Persos.outils, O = T.O, c = T.c, A = T.A, mix = T.mix, clair = T.clair, sombre = T.sombre, et4 = T.etoile4, f1 = T.f1;

/* ---------- Couleurs : chaque vêtement existe dans toutes ---------- */
var PALETTE = [
  {id:'rouge', nom:'Rouge', c:'#d33a3a'}, {id:'orange', nom:'Orange', c:'#ec8526'}, {id:'jaune', nom:'Jaune', c:'#f1c232'},
  {id:'vert', nom:'Vert', c:'#4aa64e'}, {id:'foret', nom:'Vert forêt', c:'#2e6a3c'}, {id:'turquoise', nom:'Turquoise', c:'#1fa39b'},
  {id:'bleu', nom:'Bleu', c:'#2f6ed0'}, {id:'nuit', nom:'Bleu nuit', c:'#2c3572'}, {id:'violet', nom:'Violet', c:'#7b4ac9'},
  {id:'rose', nom:'Rose', c:'#e467a5'}, {id:'marron', nom:'Marron', c:'#875230'}, {id:'noir', nom:'Noir', c:'#36313f'},
  {id:'gris', nom:'Gris', c:'#8b91a2'}, {id:'blanc', nom:'Blanc', c:'#ece8df'}
];
var PAL = {};
PALETTE.forEach(function(p){ PAL[p.id] = p; });
function lum(h){ var x = parseInt(String(h).slice(1), 16); return ((x >> 16 & 255) * .299 + (x >> 8 & 255) * .587 + (x & 255) * .114) / 255; }
var TEINTES = {};
function teinte(id){
  if(!PAL[id]) id = 'vert';
  if(TEINTES[id]) return TEINTES[id];
  var c0 = PAL[id].c, t;
  if(id === 'noir') t = {c:c0, l:'#635d70', d:'#1c1922', dd:'#121016'};
  else if(id === 'blanc') t = {c:c0, l:'#ffffff', d:'#bdb6a8', dd:'#8f8879'};
  else t = {c:c0, l:clair(c0, .36), d:sombre(c0, .4), dd:sombre(c0, .62)};
  t.x = lum(c0) > .6 ? sombre(c0, .52) : clair(c0, .62);   /* coutures, rayures : contraste lisible */
  t.id = id;
  return TEINTES[id] = t;
}
function suivante(id){ var i = 0; PALETTE.forEach(function(p, j){ if(p.id === id) i = j; }); return PALETTE[(i + 1) % PALETTE.length].id; }
var CHEMISE = {c:'#e6dcc4', l:'#fbf5e6', d:'#b3a585', dd:'#8a7d60', x:'#9a8a68'};
var CUIR = {c:'#8a5a30', l:'#b77b45', d:'#5a3518', dd:'#3b2211', x:'#d7ad74'};

/* ---------- Les emplacements ---------- */
var SLOTS = [
  {id:'tete', nom:'Tête'}, {id:'yeux', nom:'Yeux'}, {id:'bouche', nom:'Foulard'}, {id:'cou', nom:'Collier'},
  {id:'corps', nom:'Habit'}, {id:'cape', nom:'Cape'}, {id:'jambes', nom:'Pantalon'}, {id:'pieds', nom:'Bottes'},
  {id:'mains', nom:'Gants'}, {id:'bras', nom:'Brassards'}, {id:'arme', nom:'Arc'}, {id:'fleches', nom:'Flèches'}, {id:'carquois', nom:'Carquois'}
];
var SLOT = {};
SLOTS.forEach(function(s){ SLOT[s.id] = s; });

/* ---------- Le catalogue ----------
   [id, article, nom, couleur de départ, paramètres de dessin]
   Un vêtement est RARE (et animé) quand il a un effet p.fx. Tous conviennent aux filles comme aux garçons. */
var ITEMS = {}, ORDRE = [];
function I(slot, liste){
  liste.forEach(function(a){
    var p = a[4] || {};
    ITEMS[a[0]] = {id:a[0], slot:slot, art:a[1], nom:a[2], c:a[3], p:p, rare:!!p.fx, theme:p.theme || ''};
    ORDRE.push(a[0]);
  });
}
I('tete', [
  ['capuche_foret', 'une', 'Capuche de forêt', 'foret', {k:'capuche', cache:'capuche', theme:'rodeur'}],
  ['bandeau_simple', 'un', 'Bandeau noué', 'rouge', {k:'bandeau'}],
  ['bandeau_ninja', 'un', 'Bandeau de ninja', 'nuit', {k:'bandeau', plaque:true, theme:'ninja'}],
  ['bandeau_plume', 'un', 'Bandeau à plume', 'marron', {k:'bandeau', plume:true, theme:'eclaireur'}],
  ['capuche_pointue', 'une', 'Capuche pointue', 'vert', {k:'capuche', pointe:true, cache:'capuche', haut:24}],
  ['capuche_renard', 'une', 'Capuche de renard', 'orange', {k:'capuche', oreilles:true, cache:'capuche', haut:22}],
  ['capuche_feuilles', 'une', 'Capuche de feuilles', 'vert', {k:'capuche', feuilles:true, cache:'capuche', theme:'eclaireur'}],
  ['cagoule_ninja', 'une', 'Cagoule de ninja', 'noir', {k:'cagoule', cache:'tout', theme:'ninja'}],
  ['chapeau_aventurier', 'un', 'Chapeau d\'aventurier', 'marron', {k:'chapeau', forme:'fedora', bord:46, h:30, ruban:true, cache:'haut', theme:'explorateur'}],
  ['chapeau_rodeur', 'un', 'Chapeau de rôdeur', 'gris', {k:'chapeau', forme:'rond', bord:60, h:26, mou:true, ruban:true, cache:'haut', theme:'rodeur'}],
  ['chapeau_plume', 'un', 'Chapeau à plume', 'vert', {k:'chapeau', forme:'robin', bord:40, h:34, plume:true, cache:'haut', haut:18}],
  ['chapeau_pointu', 'un', 'Chapeau pointu', 'violet', {k:'chapeau', forme:'pointu', bord:50, h:70, cache:'haut', haut:46}],
  ['bonnet_trappeur', 'un', 'Bonnet de trappeur', 'marron', {k:'trappeur', cache:'haut', theme:'explorateur'}],
  ['casque_eclaireur', 'un', 'Casque d\'éclaireur', 'marron', {k:'casque', cuir:true, cache:'haut'}],
  ['casque_cornes', 'un', 'Casque à cornes', 'gris', {k:'casque', cornes:true, cache:'haut', haut:20}],
  ['couronne_lucioles', 'une', 'Couronne de lucioles', 'vert', {k:'couronne', fx:'lucioles'}],
  ['capuche_etoiles', 'une', 'Capuche étoilée', 'nuit', {k:'capuche', cache:'capuche', fx:'etoiles'}],
  ['casque_lune', 'un', 'Casque de lune', 'blanc', {k:'casque', lune:true, cache:'haut', fx:'lueur', haut:10}]
]);
I('yeux', [
  ['masque_loup', 'un', 'Loup de velours', 'noir', {k:'loup'}],
  ['masque_bande', 'un', 'Bandeau à trous', 'nuit', {k:'bande', theme:'ninja'}],
  ['masque_renard', 'un', 'Masque de renard', 'orange', {k:'renard'}],
  ['masque_hibou', 'un', 'Masque de hibou', 'marron', {k:'hibou'}],
  ['masque_chat', 'un', 'Masque de chat', 'gris', {k:'chat'}],
  ['masque_feuilles', 'un', 'Masque de feuilles', 'vert', {k:'loup', feuilles:true, theme:'eclaireur'}],
  ['lunettes_explo', 'des', 'Lunettes d\'explorateur', 'marron', {k:'lunettes', theme:'explorateur'}],
  ['masque_ancien', 'un', 'Masque ancien', 'turquoise', {k:'ancien'}],
  ['masque_cristal', 'un', 'Masque de cristal', 'turquoise', {k:'loup', cristal:true, fx:'lueur'}],
  ['masque_etoile', 'un', 'Masque des étoiles', 'nuit', {k:'loup', fx:'etoiles'}],
  ['masque_papillon', 'un', 'Masque papillon', 'rose', {k:'papillon', fx:'battement'}]
]);
I('bouche', [
  ['cache_cou', 'un', 'Cache-cou', 'gris', {k:'cachecou'}],
  ['foulard_noue', 'un', 'Foulard noué', 'rouge', {k:'foulard', theme:'explorateur'}],
  ['foulard_pois', 'un', 'Foulard à pois', 'bleu', {k:'foulard', pois:true}],
  ['masque_ninja', 'un', 'Voile de ninja', 'noir', {k:'ninja', theme:'ninja'}],
  ['echarpe', 'une', 'Grande écharpe', 'jaune', {k:'echarpe'}],
  ['echarpe_rayures', 'une', 'Écharpe à rayures', 'violet', {k:'echarpe', rayures:true}],
  ['voile_feuilles', 'un', 'Voile de feuilles', 'foret', {k:'feuilles', theme:'eclaireur'}],
  ['masque_cuir', 'un', 'Masque de cuir', 'marron', {k:'cuir'}],
  ['voile_brume', 'un', 'Voile de brume', 'blanc', {k:'brume', fx:'brume'}],
  ['foulard_vent', 'un', 'Foulard du vent', 'turquoise', {k:'foulard', queues:true, fx:'vent'}]
]);
I('cou', [
  ['collier_dents', 'un', 'Collier de dents', 'marron', {k:'dents'}],
  ['collier_plume', 'un', 'Pendentif plume', 'bleu', {k:'plume'}],
  ['amulette_pierre', 'une', 'Amulette de pierre', 'gris', {k:'pierre'}],
  ['collier_perles', 'un', 'Collier de perles', 'rouge', {k:'perles'}],
  ['medaillon', 'un', 'Médaillon', 'jaune', {k:'medaillon'}],
  ['collier_gland', 'un', 'Collier gland', 'marron', {k:'gland'}],
  ['collier_coquillages', 'un', 'Collier de coquillages', 'rose', {k:'coquillages'}],
  ['pendentif_lune', 'un', 'Pendentif lune', 'blanc', {k:'lune'}],
  ['torque', 'un', 'Torque de bronze', 'orange', {k:'torque'}],
  ['plume_phenix', 'une', 'Plume de phénix', 'orange', {k:'plume', fx:'flamme'}],
  ['cristal_lune', 'un', 'Cristal de lune', 'turquoise', {k:'cristal', fx:'lueur'}],
  ['coeur_foret', 'un', 'Cœur de forêt', 'vert', {k:'coeur', fx:'lueur'}]
]);
I('corps', [
  ['tunique_lin', 'une', 'Tunique lacée', 'vert', {k:'tunique', col:'v', lacets:true}],
  ['veste_chasseur', 'une', 'Veste de chasseur', 'marron', {k:'courte', col:'revers', boutons:3, poches:true, ouverte:true, theme:'explorateur'}],
  ['manteau_rodeur', 'un', 'Manteau de rôdeur', 'foret', {k:'longue', col:'montant', boutons:4, ceinture:true, theme:'rodeur'}],
  ['gilet_cuir', 'un', 'Gilet de cuir', 'marron', {k:'gilet', manches:'chemise', lacets:true}],
  ['kimono_ninja', 'un', 'Habit de ninja', 'noir', {k:'kimono', theme:'ninja'}],
  ['tunique_eclaireur', 'une', 'Tunique d\'éclaireur', 'vert', {k:'tunique', col:'rond', motif:'feuilles', theme:'eclaireur'}],
  ['plastron', 'un', 'Plastron de cuir', 'marron', {k:'plastron', manches:'defaut'}],
  ['veste_matelassee', 'une', 'Veste matelassée', 'bleu', {k:'courte', col:'montant', motif:'matelasse', boutons:3}],
  ['poncho', 'un', 'Poncho', 'orange', {k:'poncho', manches:'chemise', theme:'explorateur'}],
  ['manteau_fourre', 'un', 'Manteau fourré', 'rouge', {k:'longue', col:'fourrure', fourrure:true, boutons:3}],
  ['tunique_lucioles', 'une', 'Tunique des lucioles', 'nuit', {k:'tunique', col:'v', motif:'lucioles', fx:'lucioles'}],
  ['manteau_etoiles', 'un', 'Manteau d\'étoiles', 'violet', {k:'longue', col:'montant', boutons:4, motif:'etoiles', fx:'etoiles'}],
  ['armure_ecorce', 'une', 'Armure d\'écorce', 'marron', {k:'plastron', ecorce:true, manches:'meme', fx:'runes'}]
]);
I('cape', [
  ['cape_courte', 'une', 'Cape courte', 'rouge', {k:'courte'}],
  ['grande_cape', 'une', 'Grande cape', 'bleu', {k:'longue'}],
  ['cape_capuche', 'une', 'Cape à capuche', 'foret', {k:'longue', capuche:true, theme:'rodeur'}],
  ['cape_lambeaux', 'une', 'Cape en lambeaux', 'gris', {k:'longue', lambeaux:true, theme:'rodeur'}],
  ['cape_feuilles', 'une', 'Cape de feuilles', 'vert', {k:'longue', feuilles:true, theme:'eclaireur'}],
  ['cape_fourrure', 'une', 'Cape à fourrure', 'marron', {k:'courte', fourrure:true, theme:'explorateur'}],
  ['echarpe_ninja', 'une', 'Écharpe de ninja', 'rouge', {k:'echarpe', theme:'ninja'}],
  ['cape_bordure', 'une', 'Cape à bordure', 'violet', {k:'longue', bordure:true}],
  ['cape_voyage', 'une', 'Cape de voyage', 'jaune', {k:'moyenne', broche:true, theme:'explorateur'}],
  ['cape_poussiere', 'une', 'Cape scintillante', 'gris', {k:'longue', fx:'poussiere'}],     /* elle laisse derrière elle une poussière d'argent qui brille */
  ['cape_aurore', 'une', 'Cape d\'aurore', 'turquoise', {k:'longue', fx:'aurore'}],
  ['cape_nuit', 'une', 'Cape étoilée', 'nuit', {k:'longue', lune:true, fx:'etoiles'}]
]);
I('jambes', [
  ['pantalon_toile', 'un', 'Pantalon de toile', 'marron', {}],
  ['pantalon_rapiece', 'un', 'Pantalon rapiécé', 'bleu', {patch:true}],
  ['pantalon_poches', 'un', 'Pantalon à poches', 'foret', {poches:true, theme:'explorateur'}],
  ['pantalon_ninja', 'un', 'Pantalon de ninja', 'noir', {ample:1.45, bandes:true, theme:'ninja'}],
  ['pantalon_bande', 'un', 'Pantalon à bande', 'rouge', {bande:true}],
  ['collant_eclaireur', 'un', 'Collant d\'éclaireur', 'vert', {serre:true, motif:'feuilles', theme:'eclaireur'}],
  ['jambieres_lacees', 'des', 'Jambières lacées', 'marron', {serre:true, lacets:true, theme:'rodeur'}],
  ['pantalon_carreaux', 'un', 'Pantalon à carreaux', 'orange', {motif:'carreaux'}],
  ['pantalon_bouffant', 'un', 'Pantalon bouffant', 'turquoise', {ample:1.35, bouffant:true}],
  ['pantalon_matelasse', 'un', 'Pantalon matelassé', 'gris', {ample:1.1, motif:'matelasse'}],
  ['pantalon_etoiles', 'un', 'Pantalon étoilé', 'nuit', {motif:'etoiles', fx:'etoiles'}],
  ['pantalon_runes', 'un', 'Pantalon des runes', 'noir', {bande:true, fx:'runes'}]
]);
I('pieds', [
  ['bottes_cuir', 'des', 'Bottes de cuir', 'marron', {haut:.5}],
  ['bottes_rodeur', 'des', 'Bottes de rôdeur', 'noir', {haut:.86, revers:true, theme:'rodeur'}],
  ['bottines_lacees', 'des', 'Bottines lacées', 'marron', {haut:.3, lacets:true}],
  ['bottes_fourrees', 'des', 'Bottes fourrées', 'gris', {haut:.62, fourrure:true, theme:'explorateur'}],
  ['tabi_ninja', 'des', 'Chaussons de ninja', 'nuit', {haut:.56, tabi:true, theme:'ninja'}],
  ['bottes_boucles', 'des', 'Bottes à boucles', 'rouge', {haut:.7, boucles:3}],
  ['mocassins', 'des', 'Mocassins', 'orange', {haut:.22, franges:true}],
  ['bottes_explorateur', 'des', 'Bottes d\'explorateur', 'vert', {haut:.48, epaisse:true, lacets:true, theme:'explorateur'}],
  ['bottes_pointues', 'des', 'Bottes pointues', 'violet', {haut:.55, pointe:true}],
  ['bottes_feuilles', 'des', 'Bottes de feuilles', 'foret', {haut:.6, feuilles:true, theme:'eclaireur'}],
  ['bottes_lumineuses', 'des', 'Bottes lumineuses', 'turquoise', {haut:.6, fx:'lueur'}],
  ['bottes_braise', 'des', 'Bottes de braise', 'rouge', {haut:.5, fx:'braise'}],
  ['bottes_givre', 'des', 'Bottes de givre', 'blanc', {haut:.7, revers:true, fx:'givre'}]
]);
I('mains', [
  ['gants_cuir', 'des', 'Gants de cuir', 'marron', {}],
  ['mitaines', 'des', 'Mitaines', 'gris', {mitaines:true}],
  ['gant_archer', 'un', 'Gant d\'archer', 'marron', {archer:true, theme:'rodeur'}],
  ['gantelets', 'des', 'Gantelets', 'gris', {gantelet:true}],
  ['gants_laine', 'des', 'Gants de laine', 'rouge', {laine:true}],
  ['tekko_ninja', 'des', 'Gants de ninja', 'noir', {tekko:true, theme:'ninja'}],
  ['gants_fourres', 'des', 'Gants fourrés', 'orange', {fourrure:true, theme:'explorateur'}],
  ['gants_rayes', 'des', 'Gants rayés', 'violet', {rayes:true}],
  ['gants_boutons', 'des', 'Gants à boutons', 'bleu', {boutons:true}],
  ['gants_lucioles', 'des', 'Gants des lucioles', 'nuit', {fx:'lucioles'}],
  ['gants_givre', 'des', 'Gants de givre', 'turquoise', {gantelet:true, fx:'givre'}]
]);
I('bras', [
  ['brassards_cuir', 'des', 'Brassards de cuir', 'marron', {}],
  ['brassards_laces', 'des', 'Brassards lacés', 'noir', {lacets:true}],
  ['brassards_metal', 'des', 'Brassards de fer', 'gris', {metal:true}],
  ['bandages_ninja', 'des', 'Bandes de ninja', 'blanc', {bandes:true, theme:'ninja'}],
  ['brassards_graves', 'des', 'Brassards gravés', 'vert', {feuille:true, theme:'eclaireur'}],
  ['brassard_archer', 'un', 'Brassard d\'archer', 'rouge', {archer:true, theme:'rodeur'}],
  ['brassards_fourrure', 'des', 'Brassards fourrés', 'jaune', {fourrure:true}],
  ['brassards_tresses', 'des', 'Brassards tressés', 'orange', {tresse:true}],
  ['brassards_rivets', 'des', 'Brassards à rivets', 'bleu', {rivets:true}],
  ['brassards_runes', 'des', 'Brassards des runes', 'nuit', {fx:'runes'}],
  ['brassards_eclair', 'des', 'Brassards d\'éclair', 'jaune', {metal:true, fx:'eclair'}]
]);
I('arme', [
  ['arc_frene', 'un', 'Arc de frêne', 'marron', {k:'arc', forme:'simple'}],
  ['arc_recourbe', 'un', 'Arc recourbé', 'rouge', {k:'arc', forme:'recourbe'}],
  ['grand_arc', 'un', 'Grand arc', 'orange', {k:'arc', forme:'long', theme:'rodeur'}],
  ['arc_cavalier', 'un', 'Arc de cavalier', 'noir', {k:'arc', forme:'cavalier'}],
  ['arc_plumes', 'un', 'Arc à plumes', 'vert', {k:'arc', forme:'simple', plumes:true, theme:'eclaireur'}],
  ['arc_bambou', 'un', 'Arc de bambou', 'jaune', {k:'arc', forme:'long', bambou:true, theme:'ninja'}],
  ['arbalete_chasse', 'une', 'Arbalète de chasse', 'marron', {k:'arbalete'}],
  ['arbalete_legere', 'une', 'Petite arbalète', 'gris', {k:'arbalete', petite:true}],
  ['arbalete_repetition', 'une', 'Arbalète à chargeur', 'rouge', {k:'arbalete', chargeur:true}],
  ['arc_joyaux', 'un', 'Arc aux joyaux', 'violet', {k:'arc', forme:'recourbe', joyaux:true, fx:'joyaux'}],
  ['arc_lune', 'un', 'Arc de lune', 'blanc', {k:'arc', forme:'lune', fx:'lueur'}],
  ['arbalete_braise', 'une', 'Arbalète de braise', 'orange', {k:'arbalete', fx:'braise'}]
]);
I('fleches', [
  ['fleches_simples', 'des', 'Flèches simples', 'gris', {k:'simple'}],
  ['fleches_cuivre', 'des', 'Flèches de cuivre', 'orange', {k:'simple', brille:true}],
  ['fleches_larges', 'des', 'Flèches larges', 'noir', {k:'large'}],
  ['fleches_feuille', 'des', 'Flèches-feuilles', 'vert', {k:'feuille', theme:'eclaireur'}],
  ['fleches_bambou', 'des', 'Flèches de bambou', 'jaune', {k:'simple', bambou:true, theme:'ninja'}],
  ['fleches_silex', 'des', 'Flèches de silex', 'gris', {k:'silex'}],
  ['fleches_sifflet', 'des', 'Flèches-sifflets', 'bleu', {k:'sifflet'}],
  ['fleches_ventouse', 'des', 'Flèches à ventouse', 'rouge', {k:'ventouse'}],
  ['fleches_triple', 'des', 'Flèches tridents', 'violet', {k:'triple'}],
  ['fleches_lumiere', 'des', 'Flèches de lumière', 'jaune', {k:'simple', fx:'lueur'}],
  ['fleches_etoile', 'des', 'Flèches étoiles', 'blanc', {k:'etoile', fx:'etoiles'}],
  ['fleches_follet', 'des', 'Flèches feux follets', 'turquoise', {k:'follet', fx:'flamme'}]
]);
I('carquois', [
  ['carquois_cuir', 'un', 'Carquois de cuir', 'marron', {}],
  ['carquois_toile', 'un', 'Carquois de toile', 'gris', {toile:true}],
  ['carquois_ecorce', 'un', 'Carquois d\'écorce', 'blanc', {ecorce:true, theme:'eclaireur'}],
  ['carquois_bambou', 'un', 'Carquois de bambou', 'jaune', {bambou:true, theme:'ninja'}],
  ['carquois_franges', 'un', 'Carquois à franges', 'orange', {franges:true, theme:'explorateur'}],
  ['carquois_hanche', 'un', 'Carquois de hanche', 'marron', {hanche:true, theme:'rodeur'}],
  ['carquois_fourrure', 'un', 'Carquois fourré', 'rouge', {fourrure:true}],
  ['carquois_tresse', 'un', 'Carquois tressé', 'vert', {tresse:true}],
  ['carquois_boucles', 'un', 'Carquois à boucles', 'noir', {boucles:true}],
  ['carquois_etoiles', 'un', 'Carquois des étoiles', 'nuit', {fx:'etoiles'}],
  ['carquois_lierre', 'un', 'Carquois de lierre', 'foret', {lierre:true, fx:'lierre'}],
  ['carquois_cristal', 'un', 'Carquois de cristal', 'turquoise', {cristal:true, fx:'lueur'}]
]);

/* Ce que le Pisteur a dans son armoire au tout début (il peut toujours changer les couleurs) */
var DEPART = ['capuche_foret', 'bandeau_simple', 'cache_cou', 'tunique_lin', 'pantalon_toile', 'bottes_cuir'];

/* ---------- Les trouvailles (Romain : moins souvent, mais bien plus belles) ----------
   1. Une découverte ordinaire (regarder un point sans effort, entrer dans un lieu) : RIEN.
   2. Gagner le mini-jeu d'un point (traces, poursuite, cachette, tir…), la première fois : UN vêtement RARE.
      mj['lieu:point'] le désigne (il va avec le lieu) ; sinon, un rare pas encore trouvé de RARES_LIEU[lieu], puis de toute la réserve.
   3. Une découverte importante (indice clé, passage secret ouvert, coffre ouvert, fin d'une poursuite ou d'un chapitre du tutoriel) :
      un PAQUET de 2 ou 3 vêtements, montrés ensemble (surtout des courants, parfois un rare). Un point de mini-jeu qui ouvre un paquet
      donne le paquet à la place du rare.
   4. Une mission bonus gagnée : un vêtement (bonus[id]).
   Conditions des paquets (quand) : {vu:'pisteur:lieu:point'} (réussi), {explore:'lieu'} (première fouille), {bonus:'id'}, {et:[…]}, {ou:[…]}.
   « tous » : valable dans n'importe quelle enquête (une seule fois). Une enquête future peut ajouter E.garderobe = {mj, paquets, bonus}.
   Total E1 → E3 si tout est gagné : 8 + 8 + 9 = 25 vêtements (12 rares) ; il en reste plus de 120 pour la suite. */
var TROUVAILLES = {
  tous:{paquets:[   /* les sous-sols des enquêtes suivantes */
    {id:'salle_coeur', quand:{explore:'salle_coeur'}, items:['capuche_etoiles', 'grande_cape', 'medaillon']},
    {id:'tunnel_chene', quand:{explore:'tunnel_chene'}, items:['cape_capuche', 'torque']},
    {id:'tunnel_puits', quand:{explore:'tunnel_puits'}, items:['gants_givre', 'collier_coquillages']}
  ]},
  1:{   /* La Lanterne d'Or (tutoriel) */
    mj:{'mairie:massif':'masque_papillon', 'foret:buisson':'carquois_lierre'},
    paquets:[
      {id:'foret', quand:{explore:'foret'}, items:['cape_feuilles', 'bottes_feuilles']},                          /* fin du premier chapitre : on entre dans la forêt */
      {id:'racines', quand:{vu:'pisteur:chene:racines'}, items:['couronne_lucioles', 'masque_hibou', 'carquois_ecorce']}   /* l'indice clé : le souffle sous le Vieux Chêne */
    ],
    bonus:{ballon:'gant_archer'}
  },
  2:{   /* La rivière rouge (§ 12.11) : les mêmes vêtements que l'ancienne enquête 2, sur les nouveaux mini-jeux du Pisteur */
    /* passer derrière le dos de Silas : très risqué (niveau 10, Romain, 23 h 13) → l'un des plus beaux rares, la cape d'aurore */
    mj:{'foret:passer':'cape_aurore', 'moulin:guet':'cape_nuit', 'chene:tim':'brassards_eclair',
      'moulin:suivre':'manteau_etoiles'},   /* suivre l'homme en cape jusqu'à la crypte (niveau 10, Romain, 23 h 58) : le plus beau, le manteau d'étoiles */
    paquets:[
      {id:'piece', quand:{vu:'pisteur:moulin:alambics'}, items:['arc_joyaux', 'masque_ancien', 'fleches_sifflet']}   /* la pièce cachée du moulin */
    ],
    bonus:{cerfvolant:'bonnet_trappeur'}
  },
  3:{   /* Le moulin */
    mj:{'moulin:farine':'foulard_vent', 'moulin:guet':'fleches_follet', 'pont:poursuite':'carquois_cristal'},
    paquets:[
      {id:'tunnel', quand:{explore:'tunnel_moulin'}, items:['lunettes_explo', 'casque_eclaireur']},                       /* le passage secret sous le pont */
      {id:'coffre', quand:{vu:'pisteur:tunnel_moulin:coffre'}, items:['brassards_runes', 'arbalete_legere', 'pantalon_poches']}   /* le coffre à runes ouvert */
    ],
    bonus:{girouette:'fleches_cuivre'}
  }
};
/* Pour un mini-jeu sans rare désigné : les rares qui vont avec le lieu (puis n'importe quel rare pas encore trouvé) */
var RARES_LIEU = {
  foret:['coeur_foret', 'carquois_lierre', 'armure_ecorce', 'gants_lucioles'], clairiere:['couronne_lucioles', 'tunique_lucioles', 'gants_lucioles'],
  lisiere:['coeur_foret', 'carquois_lierre', 'armure_ecorce'], chene:['armure_ecorce', 'coeur_foret', 'couronne_lucioles'],
  moulin:['foulard_vent', 'cape_poussiere', 'pantalon_runes'], pont:['carquois_cristal', 'masque_cristal', 'voile_brume'], lavoir:['voile_brume', 'masque_cristal', 'bottes_givre'],
  mairie:['masque_papillon', 'fleches_lumiere', 'bottes_lumineuses'], place:['fleches_lumiere', 'brassards_eclair', 'bottes_lumineuses'], boulangerie:['bottes_braise', 'arbalete_braise', 'plume_phenix'],
  clocher:['casque_lune', 'arc_lune', 'fleches_etoile'], crypte:['arc_joyaux', 'pantalon_runes', 'brassards_runes'], tunnel_moulin:['brassards_runes', 'pantalon_runes', 'masque_cristal'],
  salle_coeur:['capuche_etoiles', 'cape_aurore', 'manteau_etoiles'], tunnel_chene:['armure_ecorce', 'coeur_foret'], tunnel_puits:['gants_givre', 'bottes_givre', 'cristal_lune']
};

/* ==========================================================
   Dessin — petits outils
   ========================================================== */
function P(x, y){ return f1(x) + ' ' + f1(y); }
function add(a, b){ return [a[0] + b[0], a[1] + b[1]]; }
function sub(a, b){ return [a[0] - b[0], a[1] - b[1]]; }
function mul(a, k){ return [a[0] * k, a[1] * k]; }
function norm(a){ var l = Math.hypot(a[0], a[1]) || 1; return [a[0] / l, a[1] / l]; }
function lerp(a, b, t){ return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t]; }
function pt(a){ return P(a[0], a[1]); }
function ombreD(clip, x, y, w, h, op){ return '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" fill="#000" opacity="' + (op || .18) + '" clip-path="url(#' + clip + ')"/>'; }
/* Effets des vêtements rares : seulement des animations CSS (transform/opacity), coupées si l'appareil demande moins de mouvement */
function etoiles(pts, coul, cls){ return pts.map(function(p, i){ return '<path class="' + (cls || 'pjg-scint') + '" style="animation-delay:-' + ((i * .53) % 2.1).toFixed(2) + 's" d="' + et4(p[0], p[1], p[2] || 3) + '" fill="' + (coul || '#fff6c8') + '"/>'; }).join(''); }
function lucioles(pts){ return pts.map(function(p, i){ return '<g class="pjg-luciole" style="animation-delay:-' + ((i * .71) % 2.8).toFixed(2) + 's"><circle cx="' + p[0] + '" cy="' + p[1] + '" r="' + ((p[2] || 2.2) * 2.6) + '" fill="#e8ff8a" opacity=".35"/><circle cx="' + p[0] + '" cy="' + p[1] + '" r="' + (p[2] || 2.2) + '" fill="#fbffc8"/></g>'; }).join(''); }
function flamme(x, y, k, i){ k = k || 1; return '<g class="pjg-flamme" style="animation-delay:-' + (((i || 0) * .29) % .9).toFixed(2) + 's"><path d="M' + P(x, y) + ' C ' + P(x - 5 * k, y - 4 * k) + ' ' + P(x - 3 * k, y - 10 * k) + ' ' + P(x, y - 15 * k) + ' C ' + P(x + 3 * k, y - 10 * k) + ' ' + P(x + 5 * k, y - 4 * k) + ' ' + P(x, y) + ' Z" fill="#ffb040"/><path d="M' + P(x, y - 1 * k) + ' C ' + P(x - 2.4 * k, y - 4 * k) + ' ' + P(x - 1 * k, y - 7 * k) + ' ' + P(x, y - 9 * k) + ' C ' + P(x + 1 * k, y - 7 * k) + ' ' + P(x + 2.4 * k, y - 4 * k) + ' ' + P(x, y - 1 * k) + ' Z" fill="#fff2a8"/></g>'; }
function etincelles(pts, coul){ return pts.map(function(p, i){ return '<circle class="pjg-monte" style="animation-delay:-' + ((i * .61) % 2.2).toFixed(2) + 's" cx="' + p[0] + '" cy="' + p[1] + '" r="' + (p[2] || 1.6) + '" fill="' + (coul || '#ffd27a') + '"/>'; }).join(''); }
function poussiere(pts){ return pts.map(function(p, i){ return '<path class="pjg-poussiere" style="animation-delay:-' + ((i * .43) % 3).toFixed(2) + 's" d="' + et4(p[0], p[1], p[2] || 2.4) + '" fill="#eef4ff"/>'; }).join(''); }
function halo(cls, inner){ return '<g class="' + cls + '">' + inner + '</g>'; }

/* ==========================================================
   JAMBES (pantalon + bottes) : un squelette hanche → genou → cheville,
   debout (comme persos.js) ou accroupi aux aguets (la cabane)
   ========================================================== */
var POSE = {
  debout:{g:[[136, 244], [131, 318], [131, 394]], d:[[164, 244], [169, 318], [169, 394]]},
  guet:{g:[[139, 272], [110, 334], [118, 398]], d:[[161, 272], [190, 334], [182, 398]]}
};
var SOL = 414;
function jambe(J, w, s){
  /* s = 1 : jambe gauche (le dehors est vers la gauche) ; s = -1 : jambe droite */
  var H = J[0], Kn = J[1], C = J[2];
  var u1 = norm(sub(Kn, H)), u2 = norm(sub(C, Kn));
  var n1 = [-u1[1] * s, u1[0] * s], n2 = [-u2[1] * s, u2[0] * s];
  var nk = norm(add(n1, n2)), m = 1 / Math.max(.6, nk[0] * n1[0] + nk[1] * n1[1]);
  var Ho = add(H, mul(n1, w[0])), Hi = sub(H, mul(n1, w[0]));
  var Ko = add(Kn, mul(nk, w[1] * m)), Ki = sub(Kn, mul(nk, w[1] * m));
  var Co = add(C, mul(n2, w[2])), Ci = sub(C, mul(n2, w[2]));
  var r = 9;
  var d = 'M' + pt(Ho) + ' L ' + pt(sub(Ko, mul(u1, r))) + ' Q ' + pt(Ko) + ' ' + pt(add(Ko, mul(u2, r))) + ' L ' + pt(Co) + ' L ' + pt(Ci) + ' L ' + pt(Ki) + ' L ' + pt(Hi) + ' Z';
  return {d:d, H:H, K:Kn, C:C, Ho:Ho, Hi:Hi, Ko:Ko, Ki:Ki, Co:Co, Ci:Ci, u1:u1, u2:u2, n1:n1, n2:n2, s:s};
}
/* une ligne qui suit la jambe, décalée de f (−1 dedans … 1 dehors), entre t0 et t1 (0 hanche, 1 genou, 2 cheville) */
function lignePt(L, f, t){
  var a, b, k;
  if(t <= 1){ a = lerp(L.Hi, L.Ho, (f + 1) / 2); b = lerp(L.Ki, L.Ko, (f + 1) / 2); k = t; }
  else { a = lerp(L.Ki, L.Ko, (f + 1) / 2); b = lerp(L.Ci, L.Co, (f + 1) / 2); k = t - 1; }
  return lerp(a, b, k);
}
function ligneJambe(L, f, t0, t1, n){
  n = n || 6; var s = '';
  for(var i = 0; i <= n; i++){ var p = lignePt(L, f, t0 + (t1 - t0) * i / n); s += (i ? ' L ' : 'M') + pt(p); }
  return s;
}
function travers(L, t, f0, f1_){ return 'M' + pt(lignePt(L, f0 == null ? -1 : f0, t)) + ' L ' + pt(lignePt(L, f1_ == null ? 1 : f1_, t)); }

function coucheJambes(Z){
  var K = Z.K, h = Z.h, ctx = Z.ctx, guet = ctx.guet, pose = POSE[guet ? 'guet' : 'debout'];
  var PJ = Z.porte.jambes, PB = Z.porte.pieds;
  var p = PJ ? PJ.it.p : {}, amp = p.ample || 1;
  var w = p.serre ? [14, 8.6, 7.4] : [15, 10 * amp, 8 * (p.bouffant ? 1 : amp > 1.2 ? 1.05 : amp)];
  if(p.bouffant) w = [16, 15, 7.6];
  var Lg = jambe(pose.g, w, 1), Ld = jambe(pose.d, w, -1);
  var fill = PJ ? Z.g('jambes') : K.u('pant'), tc = PJ ? PJ.col : null;
  var hy = pose.g[0][1], s = '';
  var clip = K.n('gj');
  var bassin = 'M' + P(121, hy - 10) + ' L ' + P(179, hy - 10) + ' L ' + pt(Ld.Hi) + ' L ' + P(150, hy + 24) + ' L ' + pt(Lg.Hi) + ' Z';
  s += '<clipPath id="' + clip + '"><path d="' + bassin + '"/><path d="' + Lg.d + '"/><path d="' + Ld.d + '"/></clipPath>';
  /* pantalon bouffant : le bas (sous le genou) est une chaussette / bande claire */
  s += '<path d="' + bassin + '" fill="' + fill + '"' + c(2.2) + '/>';
  s += '<path d="' + Lg.d + '" fill="' + fill + '"' + c(2.2) + '/><path d="' + Ld.d + '" fill="' + fill + '"' + c(2.2) + '/>';
  if(PJ) s += motifJambes(Z, Lg, Ld, p, tc, clip);
  /* ombre propre de la jambe droite */
  s += '<path d="M' + pt(Ld.H) + ' L ' + pt(Ld.K) + ' L ' + pt(Ld.C) + ' L ' + pt(Ld.Co) + ' L ' + pt(Ld.Ko) + ' L ' + pt(Ld.Ho) + ' Z" fill="#000" opacity=".2"/>';
  s += '<path d="' + ligneJambe(Lg, .7, .15, 1.8, 5) + '" stroke="#fff" stroke-width="1.6" fill="none" opacity=".18" stroke-linecap="round"/>';
  var out = PJ ? A('pjg-j', s, ' data-gs="jambes"') : s;
  /* bottes */
  var b = '';
  if(PB) b = A('pjg-b', botte(Z, Lg, PB) + botte(Z, Ld, PB) + fxBottes(Z, Lg, Ld, PB), ' data-gs="pieds"');
  else if(!guet) b = T.bottes(K, h, ctx.t, ctx.eq);
  else b = botteDefaut(Z, Lg) + botteDefaut(Z, Ld);
  return out + '<g data-zone="pieds">' + b + '</g>';
}
function motifJambes(Z, Lg, Ld, p, tc, clip){
  var s = '', L2 = [Lg, Ld];
  if(p.bouffant){
    L2.forEach(function(L){
      var a = lignePt(L, -1, 1.15), b2 = lignePt(L, 1, 1.15);
      var sh = 'M' + pt(a) + ' L ' + pt(b2) + ' L ' + pt(L.Co) + ' L ' + pt(L.Ci) + ' Z';
      s += '<path d="' + sh + '" fill="' + CHEMISE.c + '"' + c(1.8) + '/>';
      for(var t = 1.3; t < 2; t += .17) s += '<path d="' + travers(L, t, -.9, .9) + '" stroke="' + CHEMISE.d + '" stroke-width="1.4"/>';
      s += '<path d="M' + pt(lignePt(L, -1.08, 1.12)) + ' Q ' + pt(lignePt(L, 0, 1.24)) + ' ' + pt(lignePt(L, 1.08, 1.12)) + '" stroke="' + O + '" stroke-width="2.2" fill="' + tc.d + '"/>';
    });
  }
  if(p.patch) L2.forEach(function(L){
    var k = L.K, a = Math.atan2(L.u1[1], L.u1[0]) * 180 / Math.PI - 90;
    s += '<g transform="translate(' + P(k[0], k[1] - 4) + ') rotate(' + f1(a) + ')"><rect x="-8" y="-7" width="16" height="13" rx="2.5" fill="' + teinte(tc.id === 'jaune' ? 'marron' : 'jaune').c + '"' + c(1.4) + '/><rect x="-6" y="-5" width="12" height="9" rx="1.5" fill="none" stroke="' + O + '" stroke-width=".9" stroke-dasharray="2 1.6" opacity=".7"/></g>';
  });
  if(p.poches) L2.forEach(function(L){
    var m0 = lignePt(L, .95, .35), m1 = lignePt(L, .2, .35), m2 = lignePt(L, .2, .7), m3 = lignePt(L, .95, .7);
    s += '<path d="M' + pt(m0) + ' L ' + pt(m1) + ' L ' + pt(m2) + ' L ' + pt(m3) + ' Z" fill="' + tc.d + '"' + c(1.3) + '/><path d="M' + pt(m0) + ' L ' + pt(m1) + ' L ' + pt(lerp(m1, m2, .3)) + ' L ' + pt(lerp(m0, m3, .3)) + ' Z" fill="' + tc.c + '"' + c(1.1) + '/>';
  });
  if(p.bande || p.fx === 'runes') L2.forEach(function(L){
    s += '<path d="' + ligneJambe(L, .72, .05, 1.95, 8) + '" stroke="' + (p.fx === 'runes' ? '#2a2a3a' : tc.x) + '" stroke-width="3.2" fill="none" stroke-linecap="round"/>';
  });
  if(p.bandes) L2.forEach(function(L){
    for(var t = 1.18; t < 1.95; t += .16) s += '<path d="M' + pt(lignePt(L, -1, t)) + ' L ' + pt(lignePt(L, 1, t + .1)) + '" stroke="' + CHEMISE.c + '" stroke-width="3.4"/><path d="M' + pt(lignePt(L, -1, t)) + ' L ' + pt(lignePt(L, 1, t + .1)) + '" stroke="' + O + '" stroke-width=".8" opacity=".5"/>';
  });
  if(p.lacets) L2.forEach(function(L){
    var z = '';
    for(var i = 0; i <= 12; i++){ var q = lignePt(L, i % 2 ? .45 : .9, .1 + i * .15); z += (i ? ' L ' : 'M') + pt(q); }
    s += '<path d="' + z + '" stroke="' + tc.x + '" stroke-width="1.3" fill="none"/>';
  });
  var g = '';
  if(p.motif === 'feuilles') L2.forEach(function(L){ [[.2, .3], [-.4, .7], [.4, 1.2], [-.3, 1.6], [.5, 1.85]].forEach(function(q, i){ var a = lignePt(L, q[0], q[1]); g += '<path d="M' + P(a[0] - 5, a[1]) + ' Q ' + P(a[0], a[1] - 6) + ' ' + P(a[0] + 5, a[1]) + ' Q ' + P(a[0], a[1] + 6) + ' ' + P(a[0] - 5, a[1]) + ' Z" fill="' + (i % 2 ? Z.porte.jambes.col.d : Z.porte.jambes.col.l) + '" transform="rotate(' + (i * 40 - 30) + ' ' + P(a[0], a[1]) + ')"/>'; }); });
  if(p.motif === 'carreaux'){ for(var y = 230; y < 410; y += 12) g += '<rect x="90" y="' + y + '" width="120" height="5" fill="' + tc.dd + '" opacity=".35"/>'; for(var x = 96; x < 210; x += 10) g += '<rect x="' + x + '" y="230" width="4" height="190" fill="' + tc.dd + '" opacity=".3"/>'; }
  if(p.motif === 'matelasse') L2.forEach(function(L){ for(var t = .15; t < 1.95; t += .19) g += '<path d="M' + pt(lignePt(L, -1, t)) + ' Q ' + pt(lignePt(L, 0, t + .06)) + ' ' + pt(lignePt(L, 1, t)) + '" stroke="' + tc.dd + '" stroke-width="1.4" fill="none" opacity=".7"/>'; });
  if(g) s += '<g clip-path="url(#' + clip + ')">' + g + '</g>';
  if(p.fx === 'etoiles'){ var pts = []; L2.forEach(function(L){ [[0, .25], [.5, .7], [-.4, 1.1], [.3, 1.5], [-.2, 1.85]].forEach(function(q, i){ var a = lignePt(L, q[0], q[1]); pts.push([a[0], a[1], 2.6 + (i % 2)]); }); }); s += etoiles(pts, '#fff6c8'); }
  if(p.fx === 'runes') L2.forEach(function(L){ var r = ''; [.3, .8, 1.3, 1.75].forEach(function(t){ var a = lignePt(L, .72, t); r += '<path d="M' + P(a[0] - 2, a[1] - 4) + ' l 2 4 l -2 4 M' + P(a[0] + 1.5, a[1] - 4) + ' v 8" stroke="#8fffcf" stroke-width="1.5" fill="none" stroke-linecap="round"/>'; }); s += halo('pj-pulse', '<path d="' + ligneJambe(L, .72, .05, 1.95, 8) + '" stroke="#7dffb0" stroke-width="5" fill="none" opacity=".35"/>' + r); });
  return s;
}
function botte(Z, L, PB){
  var p = PB.it.p, t = PB.col, g = Z.g('pieds'), s = '', side = L.s, dir = -side;
  var haut = Math.max(.12, Math.min(.95, p.haut || .5));
  var top = lerp(L.C, L.K, haut);
  var wa = (lerp(L.Ci, L.Co, 1)[0] - L.C[0]) * dir * -1;
  var wA = Math.hypot(L.Co[0] - L.C[0], L.Co[1] - L.C[1]) + 2.6;
  var wK = Math.hypot(L.Ko[0] - L.K[0], L.Ko[1] - L.K[1]);
  var wT = wA + (wK + 3 - wA) * haut;
  var nT = L.n2, To = add(top, mul(nT, wT)), Ti = sub(top, mul(nT, wT)), Co = add(L.C, mul(nT, wA)), Ci = sub(L.C, mul(nT, wA));
  var toe = L.C[0] + dir * (p.pointe ? 34 : p.epaisse ? 31 : 29), heel = L.C[0] - dir * (wA + 2.5), sole = SOL - (p.epaisse ? 1 : 0);
  var d = 'M' + pt(To) + ' L ' + pt(Co) + ' C ' + P(Co[0] + dir * 5, Co[1] + 6) + ' ' + P(toe - dir * 6, sole - 13) + ' ' + P(toe, sole - 6) + ' Q ' + P(toe + dir * .5, sole) + ' ' + P(toe - dir * 7, sole) + ' L ' + P(heel, sole) + ' Q ' + P(heel - dir * 1, sole - 5) + ' ' + pt(Ci) + ' L ' + pt(Ti) + ' Z';
  s += '<path d="' + d + '" fill="' + g + '"' + c(2.2) + '/>';
  if(p.pointe) s += '<path d="M' + P(toe - dir * 3, sole - 6) + ' Q ' + P(toe + dir * 6, sole - 9) + ' ' + P(toe + dir * 3, sole - 16) + '" stroke="' + O + '" stroke-width="4.6" fill="none" stroke-linecap="round"/><path d="M' + P(toe - dir * 3, sole - 6) + ' Q ' + P(toe + dir * 6, sole - 9) + ' ' + P(toe + dir * 3, sole - 16) + '" stroke="' + t.c + '" stroke-width="2.4" fill="none" stroke-linecap="round"/><circle cx="' + f1(toe + dir * 3) + '" cy="' + (sole - 17) + '" r="2.6" fill="' + T.mix('#ffe9a0', '#e8b84a', .4) + '"' + c(1) + '/>';
  /* semelle */
  s += '<path d="M' + P(toe - dir * .5, sole - (p.epaisse ? 6 : 4)) + ' Q ' + P(toe + dir * .5, sole) + ' ' + P(toe - dir * 7, sole) + ' L ' + P(heel, sole) + ' L ' + P(heel - dir * .4, sole - (p.epaisse ? 6 : 4)) + ' Z" fill="#2a1c26"/>';
  if(p.epaisse) s += '<path d="M' + P(toe, sole - 6) + ' C ' + P(toe - dir * 1, sole - 12) + ' ' + P(toe - dir * 10, sole - 14) + ' ' + P(toe - dir * 14, sole - 10) + ' L ' + P(toe - dir * 14, sole - 6) + ' Z" fill="' + t.d + '"' + c(1.2) + '/>';
  if(p.revers){ var Ro = add(To, mul(L.u2, 9)), Ri = add(Ti, mul(L.u2, 9)); s += '<path d="M' + pt(add(To, mul(nT, 2))) + ' L ' + pt(add(Ro, mul(nT, 2.4))) + ' L ' + pt(sub(Ri, mul(nT, 2.4))) + ' L ' + pt(sub(Ti, mul(nT, 2))) + ' Z" fill="' + (p.fx === 'givre' ? '#ffffff' : t.l) + '"' + c(1.8) + '/>'; }
  if(p.fourrure){ var f = ''; for(var i = 0; i <= 4; i++){ var q = lerp(sub(Ti, mul(nT, 2)), add(To, mul(nT, 2)), i / 4); f += '<circle cx="' + f1(q[0]) + '" cy="' + f1(q[1] + 1) + '" r="5.2" fill="#f4ead6"' + c(1.4) + '/>'; } s += f + '<path d="M' + pt(add(Ti, [0, 2])) + ' L ' + pt(add(To, [0, 2])) + '" stroke="#f4ead6" stroke-width="5"/>'; }
  if(p.lacets){ for(var j = 0; j < 4; j++){ var a = lerp(top, L.C, .18 + j * .2), o = mul(nT, wT * .4); s += '<path d="M' + pt(sub(a, o)) + ' L ' + pt(add(add(a, o), mul(L.u2, 4))) + ' M' + pt(add(a, o)) + ' L ' + pt(add(sub(a, o), mul(L.u2, 4))) + '" stroke="' + t.x + '" stroke-width="1.4"/>'; } }
  if(p.boucles){ for(var b = 0; b < p.boucles; b++){ var y0 = lerp(top, L.C, .2 + b * .28), o2 = mul(nT, wT + .5); s += '<path d="M' + pt(sub(y0, o2)) + ' L ' + pt(add(y0, o2)) + '" stroke="' + O + '" stroke-width="4.4"/><path d="M' + pt(sub(y0, o2)) + ' L ' + pt(add(y0, o2)) + '" stroke="' + t.dd + '" stroke-width="2.6"/><rect x="' + f1(y0[0] - 3) + '" y="' + f1(y0[1] - 3) + '" width="6" height="6" rx="1" fill="none" stroke="#e8c050" stroke-width="1.6"/>'; } }
  if(p.tabi){ s += '<path d="M' + P(toe - dir * 9, sole - 9) + ' L ' + P(toe - dir * 9, sole - 1) + '" stroke="' + O + '" stroke-width="1.6"/>'; for(var k2 = 0; k2 < 3; k2++){ var a2 = lerp(top, L.C, .15 + k2 * .26); s += '<path d="M' + pt(sub(a2, mul(nT, wT))) + ' L ' + pt(add(add(a2, mul(nT, wT)), mul(L.u2, 6))) + '" stroke="' + t.x + '" stroke-width="2"/>'; } }
  if(p.franges){ for(var m = 0; m < 5; m++){ var a3 = lerp(top, L.C, m / 5), q2 = add(a3, mul(nT, wT)); s += '<path d="M' + pt(q2) + ' l ' + P(nT[0] * 6, 3) + '" stroke="' + t.d + '" stroke-width="2" stroke-linecap="round"/>'; } s += '<path d="M' + pt(To) + ' L ' + pt(Ti) + '" stroke="' + t.l + '" stroke-width="3"/>'; }
  if(p.feuilles){ for(var n = 0; n < 3; n++){ var a4 = lerp(top, L.C, .1 + n * .3); s += '<path d="M' + pt(sub(a4, mul(nT, wT))) + ' Q ' + pt(add(a4, [0, -7])) + ' ' + pt(add(a4, mul(nT, wT + 3))) + ' Q ' + pt(add(a4, [0, 5])) + ' ' + pt(sub(a4, mul(nT, wT))) + ' Z" fill="' + (n % 2 ? t.l : t.d) + '"' + c(1.1) + '/>'; } }
  if(!p.revers && !p.fourrure && !p.franges) s += '<path d="M' + pt(To) + ' L ' + pt(Ti) + '" stroke="' + t.dd + '" stroke-width="2.4"/>';
  /* reflet et ombre propre */
  s += '<path d="M' + pt(lerp(To, Ti, .25)) + ' L ' + pt(lerp(Co, Ci, .3)) + '" stroke="#fff" stroke-width="1.8" opacity=".25" stroke-linecap="round"/>';
  if(side < 0) s += '<path d="M' + pt(top) + ' L ' + pt(L.C) + ' L ' + pt(Co) + ' L ' + pt(To) + ' Z" fill="#000" opacity=".18"/>';
  return s;
}
function fxBottes(Z, Lg, Ld, PB){
  var p = PB.it.p, s = '';
  if(p.fx === 'lueur'){
    s += halo('pj-pulse', '<ellipse cx="' + f1(Lg.C[0] - 8) + '" cy="' + (SOL - 1) + '" rx="24" ry="6" fill="#8ff3ff" opacity=".6"/><ellipse cx="' + f1(Ld.C[0] + 8) + '" cy="' + (SOL - 1) + '" rx="24" ry="6" fill="#8ff3ff" opacity=".6"/>');
    [Lg, Ld].forEach(function(L){ var a = lerp(L.C, L.K, .5), b = L.C; s += halo('pj-pulse', '<path d="M' + pt(a) + ' L ' + pt(b) + '" stroke="#bffcff" stroke-width="5" opacity=".5" stroke-linecap="round"/>') + '<path d="M' + pt(a) + ' L ' + pt(b) + '" stroke="#e8feff" stroke-width="1.6" stroke-linecap="round"/>'; });
  }
  if(p.fx === 'braise'){
    [Lg, Ld].forEach(function(L, i){ var a = lerp(L.C, L.K, .42); s += '<path d="M' + pt(a) + ' l 3 6 l -4 5 l 3 6" stroke="#ffb040" stroke-width="1.8" fill="none" stroke-linecap="round"/>' + flamme(L.C[0] - L.s * 14, SOL - 2, .8, i) + flamme(L.C[0] - L.s * 2, SOL - 1, .6, i + 2); });
    s += etincelles([[Lg.C[0] - 10, SOL - 12], [Ld.C[0] + 10, SOL - 14], [Lg.C[0] + 4, SOL - 20, 1.2], [Ld.C[0] - 4, SOL - 18, 1.2]], '#ffcf6a');
  }
  if(p.fx === 'givre'){
    var pts = [];
    [Lg, Ld].forEach(function(L){ [.2, .5, .8].forEach(function(t, j){ var a = lerp(L.C, L.K, t * .7); pts.push([a[0] + (j - 1) * 4, a[1], 2.8]); }); pts.push([L.C[0] - L.s * 18, SOL - 6, 2.4]); });
    s += etoiles(pts, '#ffffff');
  }
  return s;
}
function botteDefaut(Z, L){
  var ctx = Z.ctx, p = ctx.eq.pieds, t = ctx.t;
  var it = {p:{haut:t >= 2 || p ? .62 : .42}};
  var col = p === 'bottes_vent' ? {c:'#cfe6f4', l:'#ffffff', d:'#8aa8c0', dd:'#5f86a8', x:'#5f9fc8'} : p === 'bottes_fondateurs' ? {c:'#d9e2f4', l:'#ffffff', d:'#8e9cc0', dd:'#6a78a0', x:'#e8b84a'} : p === 'bottes_souples' ? {c:'#8a6a4a', l:'#a8885e', d:'#5a3d24', dd:'#3b2211', x:'#c8a878'} : CUIR;
  var g = Z.gDefaut || (Z.gDefaut = 'url(#' + Z.K.n('gbd') + ')');
  Z.defsSup = Z.defsSup || {};
  if(!Z.defsSup.gbd) Z.defsSup.gbd = T.lin(Z.K.n('gbd'), [[0, col.l], [.55, col.c], [1, col.d]]);
  var fake = {it:it, col:col}, sv = Z.g;
  Z.g = function(){ return g; };
  var s = botte(Z, L, fake);
  Z.g = sv;
  return s;
}

/* ==========================================================
   HABIT (le haut du corps) — coordonnées du héros debout
   ========================================================== */
var TUN = {
  f:'M118 146 C 126 138 138 136 150 136 C 162 136 174 138 182 146 L 177 200 C 181 222 190 246 197 272 Q 150 284 103 272 C 110 246 119 222 123 200 Z',
  m:'M116 146 C 124 138 136 136 150 136 C 164 136 176 138 184 146 L 180 204 C 184 222 188 244 192 266 Q 150 278 108 266 C 112 244 116 222 120 204 Z'
};
var COURTE = {
  f:'M118 146 C 126 138 138 136 150 136 C 162 136 174 138 182 146 L 178 200 C 181 216 184 232 187 250 Q 150 260 113 250 C 116 232 119 216 122 200 Z',
  m:'M116 146 C 124 138 136 136 150 136 C 164 136 176 138 184 146 L 180 204 C 182 218 184 234 186 250 Q 150 260 114 250 C 116 234 118 218 120 204 Z'
};
var LONGUE = {
  f:'M118 146 C 126 138 138 136 150 136 C 162 136 174 138 182 146 L 178 202 C 186 250 194 298 200 346 Q 178 352 157 348 L 150 264 L 143 348 Q 122 352 100 346 C 106 298 114 250 122 202 Z',
  m:'M116 146 C 124 138 136 136 150 136 C 164 136 176 138 184 146 L 182 204 C 188 250 194 298 198 344 Q 177 350 156 346 L 150 264 L 144 346 Q 123 350 102 344 C 106 298 112 250 118 204 Z'
};
function formeCorps(p, f){
  var k = p.k;
  if(k === 'courte') return COURTE[f ? 'f' : 'm'];
  if(k === 'longue') return LONGUE[f ? 'f' : 'm'];
  return TUN[f ? 'f' : 'm'];
}
function coucheCorps(Z){
  var K = Z.K, h = Z.h, PC = Z.porte.corps, p = PC.it.p, t = PC.col, f = h.sexe === 'f', s = '';
  var g = Z.g('corps'), clip = K.n('gc');
  var base = formeCorps(p, f), bas = f ? 272 : 266;
  if(p.k === 'courte') bas = 252; else if(p.k === 'longue') bas = 346;
  var fond = g;
  if(p.k === 'gilet' || p.k === 'poncho') fond = K.u('tun');        /* la chemise (couleur des manches) */
  if(p.k === 'plastron') fond = p.ecorce ? g : K.u('tun');
  s += '<clipPath id="' + clip + '"><path d="' + base + '"/></clipPath>';
  s += '<path d="' + base + '" fill="' + fond + '"' + c(2.4) + '/>';
  var mot = '';
  if(p.motif === 'feuilles') [[128, 170], [168, 160], [140, 214], [172, 236], [124, 246], [156, 190], [150, 258]].forEach(function(q, i){ mot += '<path d="M' + P(q[0] - 7, q[1]) + ' Q ' + P(q[0], q[1] - 8) + ' ' + P(q[0] + 7, q[1]) + ' Q ' + P(q[0], q[1] + 8) + ' ' + P(q[0] - 7, q[1]) + ' Z" fill="' + (i % 2 ? t.d : t.l) + '" opacity=".85" transform="rotate(' + (i * 47 % 180 - 60) + ' ' + q[0] + ' ' + q[1] + ')"/>'; });
  if(p.motif === 'matelasse'){ for(var x = 90; x < 230; x += 14){ mot += '<path d="M' + x + ' 130 l 70 140 M' + (x + 60) + ' 130 l -70 140" stroke="' + t.dd + '" stroke-width="1.2" opacity=".55"/>'; } }
  if(p.ecorce){ for(var y = 150; y < 270; y += 13) mot += '<path d="M100 ' + y + ' q 12 -4 24 0 t 24 0 t 24 0 t 24 0 t 24 0" stroke="' + t.dd + '" stroke-width="1.6" fill="none" opacity=".7"/>'; }
  mot += '<rect x="152" y="128" width="70" height="230" fill="#000" opacity=".17"/>';
  s += '<g clip-path="url(#' + clip + ')">' + mot + '</g>';
  s += '<path d="M184 146 L 180 204 C 184 222 188 244 192 ' + (bas - 6) + '" fill="none" stroke="#ffe6b0" stroke-width="1.6" opacity=".45"/>';
  /* coupes particulières */
  if(p.k === 'gilet'){
    s += '<path d="M120 148 C 126 140 136 138 142 138 L 146 240 Q 132 244 116 238 C 118 214 120 190 120 148 Z" fill="' + g + '"' + c(2) + '/><path d="M180 148 C 174 140 164 138 158 138 L 154 240 Q 168 244 184 238 C 182 214 180 190 180 148 Z" fill="' + g + '"' + c(2) + '/>';
    s += '<path d="M154 140 L 154 240 Q 168 244 184 238 C 182 214 180 190 180 148 C 174 140 164 138 158 138 Z" fill="#000" opacity=".15"/>';
    if(p.lacets) for(var i = 0; i < 5; i++){ var yy = 150 + i * 18; s += '<path d="M145 ' + yy + ' L 155 ' + (yy + 9) + ' M155 ' + yy + ' L 145 ' + (yy + 9) + '" stroke="' + t.x + '" stroke-width="1.4"/>'; }
  }
  if(p.k === 'kimono'){
    s += '<path d="M134 140 L 142 137 L 172 206 L 162 208 Z" fill="' + t.l + '"' + c(1.6) + '/><path d="M166 140 L 158 137 L 140 178 L 147 182 Z" fill="' + t.d + '"' + c(1.4) + '/>';
    s += '<path d="M128 266 L 136 210 M172 266 L 166 210" stroke="' + O + '" stroke-width="1.2" opacity=".4"/>';
  }
  if(p.k === 'plastron'){
    var pl = 'M122 150 C 132 142 168 142 178 150 L 176 214 Q 150 226 124 214 Z';
    s += '<path d="' + pl + '" fill="' + g + '"' + c(2.2) + '/><path d="M150 146 L 150 220" stroke="' + t.dd + '" stroke-width="1.4" opacity=".6"/>';
    s += '<path d="M152 144 C 162 144 172 146 178 150 L 176 214 Q 164 220 152 222 Z" fill="#000" opacity=".16"/>';
    s += '<path d="M128 150 L 122 142 M172 150 L 178 142" stroke="' + CUIR.d + '" stroke-width="5" stroke-linecap="round"/>';
    if(!p.ecorce) s += [[130, 160], [170, 160], [130, 204], [170, 204]].map(function(q){ return '<circle cx="' + q[0] + '" cy="' + q[1] + '" r="2.4" fill="#e8c050"' + c(.8) + '/>'; }).join('');
    else s += '<path d="M124 176 q 13 -6 26 0 t 26 0 M126 198 q 12 -6 24 0 t 24 0" stroke="' + t.dd + '" stroke-width="1.8" fill="none"/>';
  }
  if(p.k === 'poncho') s += '';   /* le poncho lui-même passe par-dessus les bras (couche capeAvant) */
  /* cols */
  if(p.col === 'v'){ s += '<path d="M140 138 L 150 162 L 160 138 Z" fill="' + t.dd + '"' + c(1.6) + '/>'; if(p.lacets) s += '<path d="M143 144 L 157 150 M157 144 L 143 150 M145 151 L 155 156 M155 151 L 145 156" stroke="' + CHEMISE.l + '" stroke-width="1.3"/>'; }
  if(p.col === 'rond') s += '<path d="M137 139 Q 150 152 163 139" fill="' + t.dd + '"' + c(1.6) + '/>';
  if(p.col === 'revers') s += '<path d="M138 138 L 150 176 L 132 160 Z M162 138 L 150 176 L 168 160 Z" fill="' + t.l + '"' + c(1.6) + '/><path d="M144 140 L 150 156 L 156 140 Z" fill="' + CHEMISE.c + '"' + c(1.2) + '/>';
  if(p.col === 'montant') s += '<path d="M137 131 L 163 131 L 166 145 Q 150 152 134 145 Z" fill="' + t.l + '"' + c(1.8) + '/>';
  if(p.col === 'fourrure') s += fourrureLigne([[134, 140], [142, 146], [150, 148], [158, 146], [166, 140]], 5.4) + fourrureLigne([[150, 152], [150, 176], [150, 200], [150, 226], [150, 252], [150, 278], [150, 304], [150, 330]], 4.6);
  /* ouverture, boutons, poches */
  if(p.ouverte || p.k === 'longue') s += '<path d="M150 ' + (p.col === 'revers' ? 176 : 150) + ' L 150 ' + (p.k === 'longue' ? 264 : bas + 6) + '" stroke="' + O + '" stroke-width="1.6"/>';
  if(p.boutons) for(var b = 0; b < p.boutons; b++){ var by = (p.col === 'revers' ? 186 : 162) + b * (p.k === 'longue' ? 26 : 22); s += '<circle cx="' + (p.ouverte ? 156 : 150) + '" cy="' + by + '" r="2.8" fill="' + (p.fx ? '#fff6c8' : '#e8c050') + '"' + c(1) + '/>'; }
  if(p.poches) s += '<path d="M124 222 h16 v14 h-16 Z M160 222 h16 v14 h-16 Z" fill="' + t.d + '"' + c(1.3) + '/><path d="M124 222 h16 v5 h-16 Z M160 222 h16 v5 h-16 Z" fill="' + t.c + '"' + c(1.1) + '/>';
  if(p.ceinture) s += '<path d="M120 206 L 180 206 L 181 216 L 119 216 Z" fill="' + t.dd + '"' + c(1.6) + '/>';
  if(p.fourrure) s += fourrureLigne([[104, 344], [114, 347], [124, 348], [136, 348], [164, 348], [176, 348], [186, 347], [196, 344]], 5.4);
  /* rares */
  if(p.fx === 'lucioles') s += lucioles([[128, 168, 2], [170, 182, 2.4], [140, 236, 2.2], [176, 250, 1.8], [122, 214, 1.8], [160, 210, 2]]);
  if(p.fx === 'etoiles') s += etoiles([[124, 176, 3.4], [174, 170, 2.8], [132, 236, 3], [168, 256, 3.6], [116, 300, 3], [184, 310, 2.8], [128, 330, 2.4], [172, 330, 3]]);
  if(p.fx === 'runes') s += halo('pj-pulse', '<path d="M132 162 l 4 8 l -4 8 M138 162 v 16 M164 162 l -4 8 l 4 8 M170 162 v 16 M142 196 l 8 -6 l 8 6" stroke="#8fffcf" stroke-width="2.2" fill="none" stroke-linecap="round"/><path d="M132 162 l 4 8 l -4 8 M164 162 l -4 8 l 4 8 M142 196 l 8 -6 l 8 6" stroke="#7dffb0" stroke-width="6" fill="none" opacity=".3" stroke-linecap="round"/>');
  return A('pjg-c', s, ' data-gs="corps"');
}
function fourrureLigne(pts, r){ return pts.map(function(q){ return '<circle cx="' + q[0] + '" cy="' + q[1] + '" r="' + r + '" fill="#f4ead6"' + c(1.3) + '/>'; }).join('') + pts.map(function(q){ return '<circle cx="' + q[0] + '" cy="' + q[1] + '" r="' + (r - 1.8) + '" fill="#f4ead6"/>'; }).join(''); }
/* le poncho, par-dessus les bras */
function poncho(Z){
  var t = Z.porte.corps.col, g = Z.g('corps');
  var d = 'M114 140 C 126 132 174 132 186 140 L 216 236 Q 150 262 84 236 Z';
  var s = '<path d="' + d + '" fill="' + g + '"' + c(2.4) + '/>';
  s += '<path d="M152 134 C 166 134 178 136 186 140 L 216 236 Q 186 250 152 256 Z" fill="#000" opacity=".16"/>';
  s += '<path d="M92 216 L 104 206 L 116 216 L 128 206 L 140 216 L 152 206 L 164 216 L 176 206 L 188 216 L 200 206 L 210 214" stroke="' + t.x + '" stroke-width="3" fill="none" stroke-linejoin="round"/>';
  s += '<path d="M138 138 Q 150 150 162 138" fill="' + t.dd + '"' + c(1.6) + '/>';
  for(var x = 88; x <= 212; x += 7){ var y = 236 + Math.sin((x - 84) / 132 * Math.PI) * 17; s += '<path d="M' + x + ' ' + f1(y - 1) + ' l 0 9" stroke="' + t.d + '" stroke-width="2.4" stroke-linecap="round"/>'; }
  return A('pjg-po', s, ' data-gs="corps"');
}

/* ==========================================================
   CAPES (dans le dos ; agrafe devant)
   ========================================================== */
/* Les capes descendent jusqu'aux genoux et s'évasent de chaque côté : on les voit bien de face */
var CAPE = {
  longue:'M116 144 C 98 178 84 240 72 330 Q 92 342 114 338 Q 150 348 186 338 Q 208 342 228 330 C 216 240 202 178 184 144 Z',
  moyenne:'M116 144 C 98 178 86 240 76 326 Q 96 336 116 332 Q 150 342 184 332 Q 204 336 224 326 C 214 240 202 178 184 144 Z',
  courte:'M116 144 C 100 174 90 224 82 292 Q 104 302 124 298 Q 150 306 176 298 Q 196 302 218 292 C 210 224 200 174 184 144 Z'
};
var LAMBEAUX = 'M116 144 C 98 178 84 240 72 330 L 84 322 L 94 340 L 108 326 L 122 344 L 136 328 L 150 346 L 164 328 L 178 344 L 192 326 L 206 340 L 216 322 L 228 330 C 216 240 202 178 184 144 Z';
function coucheCapeDos(Z){
  var K = Z.K, PC = Z.porte.cape, p = PC.it.p, t = PC.col, g = Z.g('cape'), s = '';
  if(p.k === 'echarpe'){
    s += A('pj-cape', '<path d="M180 138 C 210 146 236 166 266 160 C 258 174 236 184 212 174 C 198 166 188 156 176 150 Z" fill="' + g + '"' + c(2.2) + '/><path d="M182 148 C 206 168 226 196 252 204 C 240 214 218 210 200 192 C 192 182 186 170 178 158 Z" fill="' + t.d + '"' + c(2) + '/>' +
      '<path d="M258 160 l 8 -2 M262 166 l 8 0 M246 204 l 8 1 M250 210 l 7 3" stroke="' + t.x + '" stroke-width="1.6" stroke-linecap="round"/>');
    return A('pjg-k', s, ' data-gs="cape"');
  }
  var forme = p.lambeaux ? LAMBEAUX : CAPE[p.k] || CAPE.longue;
  var clip = K.n('gk'), bas = p.k === 'courte' ? 296 : 334;
  var dedans = '';
  if(p.capuche) dedans += '<path d="M116 150 C 110 120 128 104 150 104 C 172 104 190 120 184 150 Z" fill="' + t.d + '"' + c(2.2) + '/>';
  dedans += '<path d="' + forme + '" fill="' + g + '"' + c(2.4) + '/>';
  var mot = '';
  if(p.feuilles) [[96, 236], [86, 290], [94, 330], [206, 236], [216, 290], [208, 330], [120, 336], [150, 340], [180, 336], [110, 200]].forEach(function(q, i){ mot += '<path d="M' + P(q[0] - 9, q[1]) + ' Q ' + P(q[0], q[1] - 10) + ' ' + P(q[0] + 9, q[1]) + ' Q ' + P(q[0], q[1] + 10) + ' ' + P(q[0] - 9, q[1]) + ' Z" fill="' + (i % 2 ? t.l : t.d) + '"' + c(1.1) + ' transform="rotate(' + (i * 37 % 120 - 50) + ' ' + q[0] + ' ' + q[1] + ')"/>'; });
  if(p.bordure) mot += '<path d="' + forme + '" fill="none" stroke="' + t.x + '" stroke-width="14"/>';
  if(p.fx === 'aurore') mot += '<g class="pjg-aurore"><path d="M60 290 C 110 262 190 318 240 284 L 240 330 C 190 362 110 306 60 336 Z" fill="#7dffb0" opacity=".55"/></g><g class="pjg-aurore" style="animation-delay:-2s"><path d="M80 230 C 140 200 190 260 260 220 L 260 270 C 190 310 140 250 80 280 Z" fill="#d8a0ff" opacity=".5"/></g>';
  if(p.fx === 'poussiere') mot += '<path d="M120 170 C 110 230 108 300 110 380" stroke="#ffffff" stroke-width="5" opacity=".28" fill="none"/>';
  if(mot) dedans += '<clipPath id="' + clip + '"><path d="' + forme + '"/></clipPath><g clip-path="url(#' + clip + ')">' + mot + '</g>';
  /* doublure (bord droit) et ombre (gauche) */
  dedans += '<path d="M184 144 C 200 176 212 236 ' + (bas > 300 ? 224 : 214) + ' ' + (bas - 6) + ' L 214 ' + (bas - 4) + ' C 204 240 194 184 178 150 Z" fill="' + t.dd + '" opacity=".7"/>';
  dedans += '<path d="M116 144 C 100 178 88 238 ' + (bas > 300 ? 78 : 86) + ' ' + (bas - 10) + ' C 92 250 102 196 124 160 Z" fill="#0b0614" opacity=".35"/>';
  dedans += '<path d="M100 220 C 96 260 92 296 90 ' + (bas - 12) + ' M200 220 C 204 260 208 296 210 ' + (bas - 12) + '" stroke="' + t.dd + '" stroke-width="1.6" fill="none" opacity=".5"/>';
  if(p.fx === 'etoiles') dedans += etoiles([[92, 250, 3.4], [84, 300, 2.6], [104, 326, 3], [208, 236, 2.8], [216, 290, 3.6], [196, 326, 2.6], [150, 336, 3], [124, 330, 2.4]]) + (p.lune ? '<path d="M206 262 a 9 9 0 1 0 6 15 a 7 7 0 1 1 -6 -15 Z" fill="#fff3c0"/>' : '');
  if(p.fx === 'poussiere') dedans += poussiere([[76, 334, 2.6], [100, 342, 2], [128, 346, 2.8], [156, 348, 2], [184, 344, 2.6], [210, 340, 2.2], [228, 320, 2], [232, 290, 2.4], [70, 300, 2], [90, 352, 1.8], [196, 354, 2.2], [222, 346, 1.6]]) + etoiles([[104, 300, 2], [226, 250, 2.2], [210, 380, 1.8]], '#ffffff');
  s += A('pj-cape', dedans);
  return A('pjg-k', s, ' data-gs="cape"');
}
function coucheCapeAvant(Z){
  var s = '';
  if(Z.porte.corps && Z.porte.corps.it.p.k === 'poncho') s += poncho(Z);
  var PC = Z.porte.cape;
  if(!PC) return s;
  var p = PC.it.p, t = PC.col, g = Z.g('cape'), x = '';
  if(p.k === 'echarpe'){
    x += '<path d="M134 136 C 140 148 160 148 166 136 L 170 146 C 160 158 140 158 130 146 Z" fill="' + g + '"' + c(1.8) + '/><path d="M164 142 l 12 8 l -4 10 l -10 -8 Z" fill="' + t.d + '"' + c(1.4) + '/>';
  } else {
    var col = 'M114 148 C 118 130 134 124 150 124 C 166 124 182 130 186 148 C 176 142 164 140 150 140 C 136 140 124 142 114 148 Z';
    if(p.capuche) col = 'M110 152 C 112 126 132 118 150 118 C 168 118 188 126 190 152 C 178 144 164 141 150 141 C 136 141 122 144 110 152 Z';
    x += '<path d="' + col + '" fill="' + g + '"' + c(2.2) + '/>';
    if(p.capuche) x += '<path d="M124 136 C 134 128 166 128 176 136" stroke="' + t.dd + '" stroke-width="1.6" fill="none"/>';
    if(p.fourrure) x += fourrureLigne([[114, 146], [122, 138], [132, 133], [142, 131], [158, 131], [168, 133], [178, 138], [186, 146]], 6);
    if(p.broche) x += '<circle cx="150" cy="141" r="8" fill="#e8c050"' + c(1.6) + '/><path d="M144 141 q 6 -8 12 0 q -6 6 -12 0 Z" fill="' + t.d + '"/><circle cx="150" cy="139" r="2" fill="#fff8d8"/>';
    else x += '<circle cx="150" cy="141" r="5.5" fill="' + (p.fx ? '#e8f4ff' : '#e8c050') + '"' + c(1.4) + '/><circle cx="150" cy="141" r="2.2" fill="' + t.dd + '"/>';
    if(p.fx === 'poussiere') x += etoiles([[150, 141, 4]], '#ffffff');
  }
  return s + A('pjg-ka', x, ' data-gs="cape"');
}

/* ==========================================================
   COLLIERS
   ========================================================== */
function coucheCou(Z){
  var PC = Z.porte.cou, p = PC.it.p, t = PC.col, g = Z.g('cou'), s = '', cx = 150, cy = 164;
  var cord = '<path d="M137 139 Q 150 ' + (p.k === 'torque' ? 158 : 170) + ' 163 139" stroke="' + (p.k === 'perles' ? '#5a3d24' : '#4a3020') + '" stroke-width="1.8" fill="none"/>';
  if(p.k !== 'torque') s += cord;
  if(p.k === 'dents'){ s += [[-8, -2, -24], [0, 1, 0], [8, -2, 24]].map(function(q){ return '<path d="M' + P(cx + q[0] - 3, cy + q[1] - 4) + ' L ' + P(cx + q[0] + 3, cy + q[1] - 4) + ' Q ' + P(cx + q[0] + 2, cy + q[1] + 5) + ' ' + P(cx + q[0], cy + q[1] + 9) + ' Q ' + P(cx + q[0] - 1, cy + q[1] + 3) + ' ' + P(cx + q[0] - 3, cy + q[1] - 4) + ' Z" fill="#f6eedc"' + c(1.2) + ' transform="rotate(' + q[2] + ' ' + P(cx + q[0], cy + q[1] - 4) + ')"/>'; }).join('') + [[-4, -3], [4, -3], [-12, -7], [12, -7]].map(function(q){ return '<circle cx="' + (cx + q[0]) + '" cy="' + (cy + q[1]) + '" r="2.4" fill="' + g + '"' + c(.9) + '/>'; }).join(''); }
  if(p.k === 'plume'){ s += '<g transform="translate(' + cx + ' ' + (cy - 2) + ') rotate(12)">' + (p.fx ? '<ellipse cx="0" cy="10" rx="9" ry="14" fill="#ffb040" opacity=".35" class="pj-pulse"/>' : '') + '<path d="M0 0 C -7 6 -7 16 0 26 C 7 16 7 6 0 0 Z" fill="' + g + '"' + c(1.3) + '/><path d="M0 2 L 0 26" stroke="' + t.dd + '" stroke-width="1"/><path d="M-4 10 l 4 3 M4 9 l -4 4 M-4 16 l 4 3 M4 15 l -4 4" stroke="' + t.l + '" stroke-width=".9"/></g>' + '<circle cx="' + cx + '" cy="' + (cy - 3) + '" r="2.2" fill="#e8c050"' + c(.8) + '/>'; if(p.fx) s += flamme(cx + 1, cy + 4, .9, 0) + etincelles([[cx - 6, cy + 4], [cx + 7, cy + 8, 1.3], [cx, cy - 2, 1.2]], '#ffcf6a'); }
  if(p.k === 'pierre') s += '<path d="M' + P(cx - 7, cy) + ' Q ' + P(cx - 7, cy - 7) + ' ' + P(cx, cy - 7) + ' Q ' + P(cx + 8, cy - 6) + ' ' + P(cx + 7, cy + 2) + ' Q ' + P(cx + 6, cy + 9) + ' ' + P(cx - 1, cy + 9) + ' Q ' + P(cx - 8, cy + 7) + ' ' + P(cx - 7, cy) + ' Z" fill="' + g + '"' + c(1.4) + '/><path d="M' + P(cx - 2, cy - 4) + ' l 4 4 l -4 4 M' + P(cx + 2, cy - 4) + ' v 8" stroke="' + t.x + '" stroke-width="1.4" fill="none"/>';
  if(p.k === 'perles') for(var i = -5; i <= 5; i++){ var a = (i / 5.6) * 1.15, x = cx + Math.sin(a) * 15, y = 140 + Math.cos(a) * 26 - (Math.abs(i) > 4 ? 2 : 0); s += '<circle cx="' + f1(x) + '" cy="' + f1(y) + '" r="' + (i === 0 ? 4 : 3) + '" fill="' + (i % 2 ? T.mix('#c8945a', '#8a5a30', .4) : g) + '"' + c(1) + '/>'; }
  if(p.k === 'medaillon') s += '<circle cx="' + cx + '" cy="' + (cy + 2) + '" r="8" fill="#e8c050"' + c(1.5) + '/><circle cx="' + cx + '" cy="' + (cy + 2) + '" r="5.2" fill="' + g + '"' + c(1) + '/><path d="M' + P(cx - 2, cy) + ' l 2 -2" stroke="#fff" stroke-width="1.2" opacity=".8"/>';
  if(p.k === 'gland') s += '<path d="M' + P(cx - 6, cy) + ' Q ' + P(cx - 6, cy + 10) + ' ' + P(cx, cy + 12) + ' Q ' + P(cx + 6, cy + 10) + ' ' + P(cx + 6, cy) + ' Z" fill="' + g + '"' + c(1.3) + '/><path d="M' + P(cx - 7, cy + 1) + ' Q ' + P(cx, cy - 7) + ' ' + P(cx + 7, cy + 1) + ' Z" fill="#7a5030"' + c(1.3) + '/><path d="M' + P(cx, cy - 4) + ' l 1 -4" stroke="#4a3020" stroke-width="1.6"/>';
  if(p.k === 'coquillages') s += [[-9, -4], [0, 0], [9, -4]].map(function(q){ var x2 = cx + q[0], y2 = cy + q[1]; return '<path d="M' + P(x2, y2 - 4) + ' L ' + P(x2 - 5, y2 + 4) + ' Q ' + P(x2, y2 + 7) + ' ' + P(x2 + 5, y2 + 4) + ' Z" fill="' + g + '"' + c(1.1) + '/><path d="M' + P(x2, y2 - 3) + ' L ' + P(x2 - 2, y2 + 5) + ' M' + P(x2, y2 - 3) + ' L ' + P(x2 + 2, y2 + 5) + '" stroke="' + t.dd + '" stroke-width=".7"/>'; }).join('');
  if(p.k === 'lune') s += '<path d="M' + P(cx + 3, cy - 6) + ' a 8 8 0 1 0 2 14 a 6 6 0 1 1 -2 -14 Z" fill="' + g + '"' + c(1.3) + '/><path d="' + et4(cx + 6, cy + 2, 2.4) + '" fill="#fff6c8"/>';
  if(p.k === 'torque') s += '<path d="M134 137 Q 150 160 166 137" stroke="' + O + '" stroke-width="7.4" fill="none" stroke-linecap="round"/><path d="M134 137 Q 150 160 166 137" stroke="' + g + '" stroke-width="4.6" fill="none" stroke-linecap="round"/><circle cx="134" cy="137" r="4" fill="' + t.l + '"' + c(1.2) + '/><circle cx="166" cy="137" r="4" fill="' + t.l + '"' + c(1.2) + '/>';
  if(p.k === 'cristal') s += halo('pj-pulse', '<circle cx="' + cx + '" cy="' + (cy + 3) + '" r="13" fill="#8ff3ff" opacity=".45"/>') + '<path d="M' + P(cx, cy - 6) + ' L ' + P(cx + 6, cy + 2) + ' L ' + P(cx, cy + 13) + ' L ' + P(cx - 6, cy + 2) + ' Z" fill="' + g + '"' + c(1.4) + '/><path d="M' + P(cx, cy - 6) + ' L ' + P(cx + 2, cy + 2) + ' L ' + P(cx, cy + 13) + '" fill="#fff" opacity=".4"/>' + etoiles([[cx + 9, cy - 4, 2.4], [cx - 9, cy + 8, 2]], '#ffffff');
  if(p.k === 'coeur') s += halo('pj-pulse', '<circle cx="' + cx + '" cy="' + (cy + 3) + '" r="13" fill="#7dffb0" opacity=".45"/>') + '<path d="M' + P(cx, cy + 10) + ' C ' + P(cx - 11, cy + 2) + ' ' + P(cx - 7, cy - 8) + ' ' + P(cx, cy - 3) + ' C ' + P(cx + 7, cy - 8) + ' ' + P(cx + 11, cy + 2) + ' ' + P(cx, cy + 10) + ' Z" fill="' + g + '"' + c(1.4) + '/><path d="M' + P(cx, cy + 8) + ' L ' + P(cx, cy - 2) + ' M' + P(cx, cy + 3) + ' l -3 -3 M' + P(cx, cy + 3) + ' l 3 -3" stroke="' + t.dd + '" stroke-width="1"/>';
  /* un peu plus grands (chaîne et pendentif, +25 %), accrochés au même endroit du cou */
  return A('pjg-o', '<g transform="translate(150 139) scale(1.25) translate(-150 -139)">' + s + '</g>', ' data-gs="cou"');
}

/* ==========================================================
   ARCS ET ARBALÈTES (main gauche)
   ========================================================== */
var ARCS = {
  simple:{d:'M101 140 C 84 150 86 170 88 182 C 78 220 78 290 88 328 C 86 340 84 360 101 370', a:140, b:370, x:101},
  long:{d:'M102 120 C 82 132 82 160 86 182 C 74 222 74 290 86 330 C 82 352 82 378 102 390', a:120, b:390, x:102},
  recourbe:{d:'M112 142 C 102 138 92 146 92 160 C 78 200 78 300 92 342 C 92 356 102 364 112 360', a:150, b:352, x:106},
  cavalier:{d:'M106 170 C 92 168 86 182 90 198 C 84 222 84 290 90 314 C 86 330 92 344 106 342', a:172, b:340, x:104},
  lune:{d:'M104 126 C 66 150 58 230 64 258 C 58 286 66 366 104 388', a:126, b:388, x:104}
};
function coucheArme(Z){
  var PA = Z.porte.arme, p = PA.it.p, t = PA.col, g = Z.g('arme'), gh = Z.gh('arme'), s = '';
  if(p.k === 'arbalete') return A('pjg-a', arbalete(Z, p, t, g, gh), ' data-gs="arme"');
  var A0 = ARCS[p.forme] || ARCS.simple;
  if(p.fx === 'lueur') s += halo('pj-pulse', '<path d="' + A0.d + '" stroke="#bff8ff" stroke-width="16" fill="none" opacity=".35" stroke-linecap="round"/>');
  s += '<path d="' + A0.d + '" stroke="' + O + '" stroke-width="' + (p.forme === 'lune' ? 11 : 9.4) + '" fill="none" stroke-linecap="round"/><path d="' + A0.d + '" stroke="' + g + '" stroke-width="' + (p.forme === 'lune' ? 7 : 5.4) + '" fill="none" stroke-linecap="round"/>';
  s += '<path d="' + A0.d + '" stroke="#fff" stroke-width="1.4" fill="none" opacity=".35" stroke-dasharray="40 300" stroke-dashoffset="-20"/>';
  if(p.bambou) [170, 210, 250, 290, 330, 360].forEach(function(y){ s += '<path d="M' + (y < 200 || y > 330 ? 80 : 74) + ' ' + y + ' h 12" stroke="' + t.dd + '" stroke-width="2"/>'; });
  /* poignée */
  s += '<path d="M82 240 L 84 272" stroke="' + O + '" stroke-width="8" stroke-linecap="round"/><path d="M82 240 L 84 272" stroke="' + CUIR.c + '" stroke-width="5" stroke-linecap="round"/><path d="M79 246 h 7 M79 254 h 7 M80 262 h 7" stroke="' + CUIR.d + '" stroke-width="1.2"/>';
  /* corde */
  s += (p.fx === 'lueur' ? halo('pj-pulse', '<line x1="' + A0.x + '" y1="' + A0.a + '" x2="' + A0.x + '" y2="' + A0.b + '" stroke="#bff8ff" stroke-width="5" opacity=".6"/>') : '') + '<line x1="' + A0.x + '" y1="' + A0.a + '" x2="' + A0.x + '" y2="' + A0.b + '" stroke="' + (p.fx === 'lueur' ? '#f0feff' : '#efe6cc') + '" stroke-width="1.3"/>';
  if(p.forme === 'recourbe' || p.forme === 'cavalier') s += '<circle cx="' + A0.x + '" cy="' + A0.a + '" r="2.6" fill="' + t.l + '"' + c(1) + '/><circle cx="' + A0.x + '" cy="' + A0.b + '" r="2.6" fill="' + t.l + '"' + c(1) + '/>';
  if(p.plumes) s += '<path d="M84 196 q -14 -6 -16 -18 q 12 4 16 18 Z M84 316 q -14 6 -16 18 q 12 -4 16 -18 Z" fill="' + t.l + '"' + c(1.2) + '/><path d="M80 236 q -12 4 -14 14 q 10 -2 14 -6 Z" fill="#e8584a"' + c(1.1) + '/><path d="M82 274 q -12 -4 -14 -14 q 10 2 14 6 Z" fill="#f0c040"' + c(1.1) + '/>';
  if(p.forme === 'lune') s += etoiles([[60, 236, 3], [64, 296, 2.6], [100, 130, 2.4]], '#ffffff');
  if(p.joyaux){
    var gems = [[88, 186, '#ff5a7a'], [80, 216, '#5ad1ff'], [94, 340, '#ffd24a'], [80, 304, '#7dffb0'], [100, 150, '#c68cff'], [100, 362, '#ff5a7a']];
    s += gems.map(function(q){ return '<path d="M' + P(q[0], q[1] - 4) + ' L ' + P(q[0] + 3.4, q[1]) + ' L ' + P(q[0], q[1] + 4) + ' L ' + P(q[0] - 3.4, q[1]) + ' Z" fill="' + q[2] + '"' + c(1) + '/>'; }).join('');
    s += etoiles(gems.map(function(q){ return [q[0] + 2, q[1] - 3, 3.6]; }), '#ffffff');
  }
  return A('pjg-a', s, ' data-gs="arme"');
}
function arbalete(Z, p, t, g, gh){
  var k = p.petite ? .8 : 1, s = '';
  function X(x){ return f1(100 + (x - 100) * k); }
  function Y(y){ return f1(260 + (y - 260) * k); }
  if(p.fx === 'braise') s += halo('pj-pulse', '<ellipse cx="100" cy="' + Y(306) + '" rx="' + f1(46 * k) + '" ry="16" fill="#ff8a3a" opacity=".35"/>');
  /* crosse (du poing vers le bas) */
  s += '<path d="M' + X(93) + ' ' + Y(232) + ' L ' + X(107) + ' ' + Y(232) + ' L ' + X(106) + ' ' + Y(330) + ' L ' + X(94) + ' ' + Y(330) + ' Z" fill="' + g + '"' + c(2) + '/>';
  s += '<path d="M' + X(100) + ' ' + Y(236) + ' L ' + X(100) + ' ' + Y(326) + '" stroke="' + t.dd + '" stroke-width="1.6"/>';
  if(p.chargeur) s += '<rect x="' + X(104) + '" y="' + Y(272) + '" width="' + f1(12 * k) + '" height="' + f1(26 * k) + '" rx="2" fill="' + t.d + '"' + c(1.6) + '/><path d="M' + X(106) + ' ' + Y(278) + ' h ' + f1(8 * k) + ' M' + X(106) + ' ' + Y(285) + ' h ' + f1(8 * k) + ' M' + X(106) + ' ' + Y(292) + ' h ' + f1(8 * k) + '" stroke="' + t.x + '" stroke-width="1.2"/>';
  /* arc (en travers, en bas) */
  var arc = 'M' + X(60) + ' ' + Y(300) + ' Q ' + X(100) + ' ' + Y(326) + ' ' + X(140) + ' ' + Y(300);
  s += '<path d="' + arc + '" stroke="' + O + '" stroke-width="8" fill="none" stroke-linecap="round"/><path d="' + arc + '" stroke="' + (p.fx === 'braise' ? '#e86a2a' : '#c9a46a') + '" stroke-width="4.6" fill="none" stroke-linecap="round"/>';
  s += '<path d="M' + X(60) + ' ' + Y(300) + ' L ' + X(100) + ' ' + Y(284) + ' L ' + X(140) + ' ' + Y(300) + '" stroke="#efe6cc" stroke-width="1.3" fill="none"/>';
  /* carreau */
  s += '<path d="M' + X(100) + ' ' + Y(284) + ' L ' + X(100) + ' ' + Y(346) + '" stroke="' + O + '" stroke-width="3.4"/><path d="M' + X(100) + ' ' + Y(284) + ' L ' + X(100) + ' ' + Y(344) + '" stroke="#d9c49a" stroke-width="1.6"/><path d="M' + X(96) + ' ' + Y(342) + ' L ' + X(100) + ' ' + Y(352) + ' L ' + X(104) + ' ' + Y(342) + ' Z" fill="#b8bcc8"' + c(1) + '/>';
  s += '<rect x="' + X(95) + '" y="' + Y(304) + '" width="' + f1(10 * k) + '" height="' + f1(8 * k) + '" rx="2" fill="' + t.dd + '"' + c(1.2) + '/>';
  if(p.fx === 'braise') s += '<path d="M' + X(98) + ' ' + Y(244) + ' l 3 8 l -3 7 l 3 8" stroke="#ffb040" stroke-width="1.8" fill="none"/>' + flamme(+X(60), +Y(298), .8, 0) + flamme(+X(140), +Y(298), .8, 2) + etincelles([[+X(70), +Y(290)], [+X(130), +Y(288)], [+X(100), +Y(276), 1.2]], '#ffcf6a');
  return s;
}

/* ==========================================================
   CARQUOIS ET FLÈCHES (dans le dos, ou à la hanche)
   ========================================================== */
function tetes(Z, base){
  /* base : [[x, y, rot]] le bout des flèches ; les flèches dépassent du carquois */
  var PF = Z.porte.fleches, p = PF ? PF.it.p : {k:'defaut'}, t = PF ? PF.col : {c:'#8a8f9a', l:'#c8ccd6', d:'#5a5f6a', dd:'#3a3f4a', x:'#fff'};
  var s = '';
  base.forEach(function(q, i){
    var x = q[0], y = q[1], g = '';
    var hampe = p.bambou ? '#d8c070' : '#d9cbb0';
    g += '<path d="M' + P(x, y + 4) + ' L ' + P(x, y + 26) + '" stroke="' + O + '" stroke-width="3.6"/><path d="M' + P(x, y + 4) + ' L ' + P(x, y + 26) + '" stroke="' + hampe + '" stroke-width="2"/>';
    if(p.bambou) g += '<path d="M' + P(x - 2, y + 14) + ' h 4" stroke="#8a7030" stroke-width="1.2"/>';
    var f = PF ? t.c : '#a8acb8', fl = PF ? t.l : '#d8dce6';
    if(p.k === 'defaut' || p.k === 'simple') g += '<path d="M' + P(x - 4, y + 6) + ' L ' + P(x, y - 6) + ' L ' + P(x + 4, y + 6) + ' Z" fill="' + f + '"' + c(1.3) + '/>' + (p.brille ? '<path d="M' + P(x - 1, y + 2) + ' L ' + P(x, y - 3) + '" stroke="#fff" stroke-width="1.2"/>' : '');
    if(p.k === 'large') g += '<path d="M' + P(x - 7, y + 7) + ' L ' + P(x, y - 7) + ' L ' + P(x + 7, y + 7) + ' L ' + P(x, y + 4) + ' Z" fill="' + f + '"' + c(1.3) + '/>';
    if(p.k === 'feuille') g += '<path d="M' + P(x, y + 7) + ' Q ' + P(x - 7, y) + ' ' + P(x, y - 8) + ' Q ' + P(x + 7, y) + ' ' + P(x, y + 7) + ' Z" fill="' + f + '"' + c(1.3) + '/><path d="M' + P(x, y + 6) + ' L ' + P(x, y - 5) + '" stroke="' + t.dd + '" stroke-width=".9"/>';
    if(p.k === 'silex') g += '<path d="M' + P(x - 5, y + 6) + ' L ' + P(x - 3, y - 2) + ' L ' + P(x, y - 7) + ' L ' + P(x + 4, y - 1) + ' L ' + P(x + 5, y + 6) + ' Z" fill="' + f + '"' + c(1.3) + '/><path d="M' + P(x - 3, y) + ' L ' + P(x + 3, y + 2) + '" stroke="' + t.dd + '" stroke-width=".9"/>';
    if(p.k === 'sifflet') g += '<ellipse cx="' + x + '" cy="' + y + '" rx="5" ry="7" fill="' + f + '"' + c(1.3) + '/><circle cx="' + x + '" cy="' + (y - 1) + '" r="1.6" fill="' + O + '"/><path d="M' + P(x - 2, y + 3) + ' h 4" stroke="' + O + '" stroke-width="1.1"/>';
    if(p.k === 'ventouse') g += '<path d="M' + P(x - 7, y - 3) + ' Q ' + P(x, y - 9) + ' ' + P(x + 7, y - 3) + ' L ' + P(x + 3, y + 4) + ' L ' + P(x - 3, y + 4) + ' Z" fill="' + f + '"' + c(1.3) + '/>';
    if(p.k === 'triple') g += '<path d="M' + P(x - 6, y + 5) + ' L ' + P(x - 6, y - 4) + ' M' + P(x + 6, y + 5) + ' L ' + P(x + 6, y - 4) + ' M' + P(x - 6, y + 5) + ' L ' + P(x + 6, y + 5) + '" stroke="' + O + '" stroke-width="3.2" fill="none"/><path d="M' + P(x - 6, y + 5) + ' L ' + P(x - 6, y - 3) + ' M' + P(x + 6, y + 5) + ' L ' + P(x + 6, y - 3) + ' M' + P(x - 6, y + 5) + ' L ' + P(x + 6, y + 5) + '" stroke="' + f + '" stroke-width="1.6" fill="none"/>' + [-6, 0, 6].map(function(dx){ return '<path d="M' + P(x + dx - 2.4, y - 2) + ' L ' + P(x + dx, y - 8) + ' L ' + P(x + dx + 2.4, y - 2) + ' Z" fill="' + fl + '"' + c(1) + '/>'; }).join('');
    if(p.k === 'etoile') g += '<path d="' + et4(x, y - 1, 7) + '" fill="' + f + '"' + c(1.1) + '/>';
    if(p.k === 'follet') g += '<ellipse cx="' + x + '" cy="' + (y - 2) + '" rx="5" ry="6" fill="' + fl + '" opacity=".7"/>';
    s += '<g transform="rotate(' + (q[2] || 0) + ' ' + P(x, y + 20) + ')">' + g + '</g>';
  });
  if(p.fx === 'lueur') s = halo('pj-pulse', base.map(function(q){ return '<circle cx="' + q[0] + '" cy="' + q[1] + '" r="9" fill="#fff3a0" opacity=".55"/>'; }).join('')) + s;
  if(p.fx === 'etoiles') s += etoiles(base.map(function(q){ return [q[0] + 5, q[1] - 6, 2.6]; }), '#ffffff');
  if(p.fx === 'flamme') s += base.map(function(q, i){ return flamme(q[0], q[1] + 2, .75, i); }).join('');
  return s;
}
function coucheCarquois(Z){
  var PQ = Z.porte.carquois, p = PQ ? PQ.it.p : {}, s = '';
  if(p.hanche) return '';
  var t = PQ ? PQ.col : CUIR, g = PQ ? Z.g('carquois') : Z.K.u('cuir');
  s += '<g transform="rotate(30 198 150)">';
  s += tetes(Z, [[193, 90, -8], [201, 84, 0], [209, 92, 8]]);
  var corps = 'M186 108 L 213 108 L 215 182 Q 200 190 185 182 Z';
  if(p.fx === 'lueur') s += halo('pj-pulse', '<path d="' + corps + '" fill="#8ff3ff" opacity=".35" transform="translate(-4 -3) scale(1.04)"/>');
  s += '<path d="' + corps + '" fill="' + g + '"' + c(2.2) + (p.cristal ? ' fill-opacity=".85"' : '') + '/>';
  s += '<path d="M202 110 L 204 184 Q 210 184 215 182 L 213 108 Z" fill="#000" opacity=".18"/>';
  s += details(p, t, 186, 213, 108, 184);
  s += '<path d="M185 108 L 214 108 L 214 116 L 185 116 Z" fill="' + (p.fourrure ? '#f4ead6' : t.d) + '"' + c(1.6) + '/>';
  if(p.fourrure) s += fourrureLigne([[186, 110], [193, 108], [200, 107], [207, 108], [214, 110]], 4.6);
  s += '</g>';
  return A('pjg-q', s, ' data-gs="' + (PQ ? 'carquois' : 'fleches') + '"');
}
function details(p, t, x0, x1, y0, y1){
  var s = '', w = x1 - x0;
  if(p.toile) for(var y = y0 + 16; y < y1 - 4; y += 14) s += '<path d="M' + (x0 + 2) + ' ' + y + ' h ' + (w - 3) + '" stroke="' + t.dd + '" stroke-width="1" stroke-dasharray="3 2.4" opacity=".8"/>';
  if(p.ecorce) for(var i = 0; i < 6; i++){ var yy = y0 + 22 + i * 11; s += '<path d="M' + (x0 + 4 + (i % 3) * 5) + ' ' + yy + ' h ' + (5 + (i % 2) * 4) + '" stroke="#3a3030" stroke-width="2" stroke-linecap="round"/>'; }
  if(p.bambou) for(var j = y0 + 24; j < y1 - 6; j += 22) s += '<path d="M' + (x0 + 1) + ' ' + j + ' h ' + (w + 1) + '" stroke="' + O + '" stroke-width="2.4"/><path d="M' + (x0 + 1) + ' ' + (j + 2) + ' h ' + (w + 1) + '" stroke="' + t.l + '" stroke-width="1"/>';
  if(p.franges) for(var k = 0; k < 6; k++) s += '<path d="M' + (x0 + 3 + k * (w - 4) / 5) + ' ' + (y1 - 2) + ' l ' + (k % 2 ? 1 : -1) + ' 10" stroke="' + t.d + '" stroke-width="2.2" stroke-linecap="round"/>';
  if(p.tresse) for(var a = y0 + 14; a < y1 - 6; a += 8) for(var b = x0 + 3; b < x1 - 3; b += 8) s += '<path d="M' + b + ' ' + a + ' l 4 4 l 4 -4" stroke="' + t.dd + '" stroke-width="1.3" fill="none" opacity=".75"/>';
  if(p.boucles) [y0 + 30, y0 + 58].forEach(function(yb){ s += '<path d="M' + (x0 - 1) + ' ' + yb + ' h ' + (w + 2) + '" stroke="' + O + '" stroke-width="5"/><path d="M' + (x0 - 1) + ' ' + yb + ' h ' + (w + 2) + '" stroke="' + CUIR.d + '" stroke-width="3"/><rect x="' + (x0 + w / 2 - 4) + '" y="' + (yb - 4) + '" width="8" height="8" rx="1" fill="none" stroke="#e8c050" stroke-width="1.8"/>'; });
  if(p.lierre){ var l = '<path d="M' + (x0 + 4) + ' ' + (y0 + 12) + ' C ' + (x1) + ' ' + (y0 + 30) + ' ' + (x0) + ' ' + (y0 + 52) + ' ' + (x1 - 4) + ' ' + (y1 - 6) + '" stroke="#2e6a3c" stroke-width="1.8" fill="none"/>'; [[x0 + 8, y0 + 18], [x1 - 6, y0 + 32], [x0 + 6, y0 + 48], [x1 - 7, y0 + 62]].forEach(function(q, i){ l += '<g class="pjg-feuille" style="animation-delay:-' + (i * .6) + 's"><path d="M' + P(q[0], q[1]) + ' q -6 -6 0 -10 q 6 4 0 10 Z" fill="#6fd08a"' + c(1) + '/></g>'; }); s += l; }
  if(p.cristal) s += '<path d="M' + (x0 + 6) + ' ' + (y0 + 14) + ' L ' + (x0 + 12) + ' ' + (y1 - 10) + ' M' + (x1 - 8) + ' ' + (y0 + 20) + ' L ' + (x1 - 10) + ' ' + (y1 - 20) + '" stroke="#ffffff" stroke-width="1.6" opacity=".6"/>' + etoiles([[x0 + 8, y0 + 30, 2.6], [x1 - 6, y0 + 56, 2.2]], '#ffffff');
  if(p.fx === 'etoiles') s += etoiles([[x0 + 8, y0 + 26, 2.8], [x1 - 7, y0 + 44, 2.4], [x0 + 10, y0 + 62, 3], [x1 - 9, y0 + 70, 2]], '#fff6c8');
  return s;
}
function coucheCeinture(Z){
  var s = '';
  if(Z.porte.corps && Z.porte.corps.it.p.k === 'kimono'){
    var t = Z.porte.corps.col;
    s += A('pjg-obi', '<path d="M118 196 Q 150 202 182 196 L 184 222 Q 150 228 116 222 Z" fill="' + (t.id === 'rouge' ? '#f1c232' : '#c83a3a') + '"' + c(2) + '/><path d="M150 200 l 10 26 l -6 2 Z" fill="' + (t.id === 'rouge' ? '#c89a20' : '#9a2424') + '"' + c(1.2) + '/>', ' data-gs="corps"');
  }
  var PQ = Z.porte.carquois;
  if(PQ && PQ.it.p.hanche){
    var p = PQ.it.p, tq = PQ.col, g = Z.g('carquois'), q = '<g transform="rotate(-14 194 232)">';
    q += tetes(Z, [[190, 196, -10], [197, 190, 0], [204, 197, 10]]);
    q += '<path d="M184 214 L 206 214 L 207 274 Q 196 280 184 274 Z" fill="' + g + '"' + c(2.2) + '/><path d="M197 216 L 198 276 Q 203 276 207 274 L 206 214 Z" fill="#000" opacity=".18"/>';
    q += details(p, tq, 184, 206, 214, 276) + '<path d="M183 214 L 207 214 L 207 221 L 183 221 Z" fill="' + tq.d + '"' + c(1.4) + '/></g>';
    s += A('pjg-qh', q, ' data-gs="carquois"');
  }
  return s;
}

/* ==========================================================
   BRASSARDS ET GANTS
   ========================================================== */
var BR = {g:'M95 214 C 94 224 93 234 92 244 L 109.5 246 C 110.4 236 111.4 226 113 216 Z', d:'M205 214 C 206 224 207 234 208 244 L 190.5 246 C 189.6 236 188.6 226 187 216 Z'};
function coucheBras(Z){
  var PB = Z.porte.bras;
  if(!PB) return '';
  var p = PB.it.p, t = PB.col, g = Z.g('bras'), s = '';
  ['g', 'd'].forEach(function(cote){
    if(p.archer && cote === 'd') return;
    var d = BR[cote], sx = cote === 'g' ? 1 : -1, x0 = cote === 'g' ? 92 : 208, x1 = cote === 'g' ? 113 : 187, xm = (x0 + x1) / 2;
    if(p.archer) d = 'M96 202 C 94 218 93 232 92 246 L 110 248 C 111 234 112 220 114 204 Z';
    s += '<path d="' + d + '" fill="' + g + '"' + c(2) + '/>';
    if(cote === 'd') s += '<path d="M198 216 L 199 245 L 190.5 246 C 189.6 236 188.6 226 187 216 Z" fill="#000" opacity=".17"/>';
    if(p.lacets) for(var i = 0; i < 4; i++){ var y = 219 + i * 7; s += '<path d="M' + (xm - 4) + ' ' + y + ' l 8 5 M' + (xm + 4) + ' ' + y + ' l -8 5" stroke="' + t.x + '" stroke-width="1.2"/>'; }
    if(p.metal) s += '<path d="M' + (x0 + 1 * sx) + ' 226 L ' + (x1 - .5 * sx) + ' 227 M' + x0 + ' 236 L ' + (x1 - 1 * sx) + ' 237" stroke="' + t.dd + '" stroke-width="1.6"/>' + [[xm - 5, 220], [xm + 5, 221], [xm - 5, 241], [xm + 5, 242]].map(function(q){ return '<circle cx="' + q[0] + '" cy="' + q[1] + '" r="1.5" fill="' + t.l + '"' + c(.6) + '/>'; }).join('');
    if(p.bandes) for(var j = 0; j < 5; j++){ var yb = 216 + j * 6.4; s += '<path d="M' + (x0 + sx) + ' ' + (yb + 5) + ' L ' + x1 + ' ' + yb + '" stroke="' + t.dd + '" stroke-width="1" opacity=".7"/>'; }
    if(p.feuille) s += '<path d="M' + xm + ' 238 Q ' + (xm - 6) + ' 228 ' + xm + ' 220 Q ' + (xm + 6) + ' 228 ' + xm + ' 238 Z" fill="none" stroke="' + t.x + '" stroke-width="1.3"/><path d="M' + xm + ' 236 L ' + xm + ' 222" stroke="' + t.x + '" stroke-width="1"/>';
    if(p.fourrure) s += fourrureLigne([[x0 + 2 * sx, 215], [xm, 214], [x1 - 1 * sx, 215]], 4.2);
    if(p.tresse) for(var k = 0; k < 4; k++){ var yt = 218 + k * 7; s += '<path d="M' + (x0 + 2 * sx) + ' ' + yt + ' q ' + (4 * sx) + ' 4 ' + (8 * sx) + ' 0 q ' + (4 * sx) + ' -4 ' + (8 * sx) + ' 0" stroke="' + t.dd + '" stroke-width="1.4" fill="none"/>'; }
    if(p.rivets) [[xm - 5, 222], [xm + 4, 222], [xm - 5, 231], [xm + 4, 231], [xm - 5, 240], [xm + 4, 240]].forEach(function(q){ s += '<circle cx="' + q[0] + '" cy="' + q[1] + '" r="1.8" fill="#e8e8f0"' + c(.7) + '/>'; });
    if(p.archer) s += '<path d="M96 210 L 113 212 M94 238 L 110 240" stroke="' + t.dd + '" stroke-width="2.4"/>';
    if(p.fx === 'runes') s += halo('pj-pulse', '<path d="M' + (xm - 3) + ' 222 l 3 5 l -3 5 M' + (xm + 2) + ' 222 v 10 M' + (xm - 3) + ' 236 l 6 4" stroke="#8ff3ff" stroke-width="1.8" fill="none" stroke-linecap="round"/><circle cx="' + xm + '" cy="230" r="9" fill="#8ff3ff" opacity=".25"/>');
    if(p.fx === 'eclair') s += '<g class="pjg-eclair" style="animation-delay:-' + (cote === 'g' ? 0 : .5) + 's"><path d="M' + (x0 - 6 * sx) + ' 214 l ' + (-4 * sx) + ' 8 l ' + (5 * sx) + ' 1 l ' + (-5 * sx) + ' 9" stroke="#fff27a" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/></g>';
  });
  return A('pjg-r', s, ' data-gs="bras"');
}
var MAIN = {g:'M91 246 C 86 252 86 262 92 268 C 98 272 108 270 110 263 L 110 247 Z', d:'M191 248 C 189 258 193 268 201 269 C 209 270 212 259 209 248 Z'};
function coucheMains(Z){
  var PM = Z.porte.mains;
  if(!PM) return '';
  var p = PM.it.p, t = PM.col, g = Z.g('mains'), s = '';
  ['g', 'd'].forEach(function(cote){
    if(p.archer && cote === 'g') return;
    var sx = cote === 'g' ? 1 : -1, x0 = cote === 'g' ? 89 : 211, x1 = cote === 'g' ? 111 : 189, xm = (x0 + x1) / 2;
    var poignet = cote === 'g' ? 'M89 238 L 111 240 L 110.5 250 L 88.5 248 Z' : 'M189 240 L 211 238 L 211.5 248 L 189.5 250 Z';
    if(p.gantelet) poignet = cote === 'g' ? 'M85 226 L 115 230 L 111 250 L 88 248 Z' : 'M185 230 L 215 226 L 212 248 L 189 250 Z';
    var main = MAIN[cote];
    if(p.mitaines) main = cote === 'g' ? 'M90 247 C 87 251 86 256 87 260 L 110 261 L 110 247 Z' : 'M191 248 C 190 252 190 256 191 261 L 210.5 260 C 211 256 210.5 252 209 248 Z';
    s += '<path d="' + main + '" fill="' + g + '"' + c(2) + '/>';
    if(p.mitaines) s += '<path d="' + main + '" fill="none" stroke="' + t.x + '" stroke-width="1" stroke-dasharray="2 2" transform="translate(0 -1)"/>';
    s += '<path d="' + poignet + '" fill="' + (p.fourrure ? '#f4ead6' : t.d) + '"' + c(1.8) + '/>';
    if(p.fourrure) s += fourrureLigne([[x0 + sx * 2, 240], [xm, 241], [x1 - sx * 2, 241]], 4.4);
    if(p.laine) s += '<path d="M' + (x0 + 2 * sx) + ' 252 h ' + (18 * sx) + ' M' + (x0 + 2 * sx) + ' 257 h ' + (19 * sx) + ' M' + (x0 + 3 * sx) + ' 262 h ' + (17 * sx) + '" stroke="' + t.l + '" stroke-width="1.2" stroke-dasharray="2 1.6"/>';
    if(p.rayes) s += '<path d="M' + (x0 + 1 * sx) + ' 254 h ' + (20 * sx) + ' M' + (x0 + 2 * sx) + ' 261 h ' + (18 * sx) + '" stroke="' + t.x + '" stroke-width="2.6"/>';
    if(p.tekko) s += '<path d="M' + (xm - 7) + ' 250 L ' + (xm + 7) + ' 250 L ' + (xm + 6) + ' 262 L ' + (xm - 6) + ' 262 Z" fill="' + t.dd + '"' + c(1.3) + '/><path d="M' + (xm - 4) + ' 253 l 8 6 M' + (xm + 4) + ' 253 l -8 6" stroke="' + t.l + '" stroke-width="1.1"/>';
    if(p.boutons) s += '<circle cx="' + xm + '" cy="244" r="2.4" fill="#e8c050"' + c(.9) + '/>';
    if(p.archer) s += '<path d="M195 258 l 2 12 M201 258 l 0 12 M206 257 l -1 11" stroke="' + t.dd + '" stroke-width="2.2" stroke-linecap="round"/>';
    if(p.gantelet && !p.fx) s += '<path d="M' + (x0 - 2 * sx) + ' 232 L ' + (x1 + 2 * sx) + ' 235" stroke="' + t.l + '" stroke-width="2"/>';
    if(p.fx === 'lucioles') s += lucioles([[x0 + 3 * sx, 268, 1.8], [xm, 271, 2], [x1 - 2 * sx, 266, 1.6]]);
  });
  if(p.fx === 'givre') s += etoiles([[94, 232, 3], [110, 252, 2.4], [206, 234, 3], [192, 254, 2.4], [100, 266, 2], [204, 266, 2]], '#ffffff');
  return A('pjg-m', s, ' data-gs="mains"');
}

/* ==========================================================
   TÊTE (coordonnées du visage : centre en 0,0)
   ========================================================== */
var CAP_DOS = 'M-46 32 C -55 -24 -36 -74 0 -74 C 36 -74 55 -24 46 32 C 30 42 -30 42 -46 32 Z';
var CAP_DOS_P = 'M-46 32 C -55 -24 -36 -74 0 -74 C 22 -74 42 -72 66 -100 C 58 -62 56 -24 46 32 C 30 42 -30 42 -46 32 Z';
var CAP_AV = 'M-46 32 C -55 -24 -36 -74 0 -74 C 36 -74 55 -24 46 32 L 38 32 C 40 8 34 -12 26 -22 C 16 -33 -16 -33 -26 -22 C -34 -12 -40 8 -38 32 Z';
var CAP_AV_P = 'M-46 32 C -55 -24 -36 -74 0 -74 C 22 -74 42 -72 66 -100 C 58 -62 56 -24 46 32 L 38 32 C 40 8 34 -12 26 -22 C 16 -33 -16 -33 -26 -22 C -34 -12 -40 8 -38 32 Z';
function coucheTeteDos(Z){
  var s = '';
  var PT = Z.porte.tete;
  if(PT){
    var p = PT.it.p, t = PT.col, g = Z.g('tete');
    if(p.k === 'capuche'){
      s += '<path d="M-42 26 C -48 46 -30 56 0 56 C 30 56 48 46 42 26 Z" fill="' + t.d + '"' + c(2.2) + '/>';
      s += '<path d="' + (p.pointe ? CAP_DOS_P : CAP_DOS) + '" fill="' + t.d + '"' + c(2.4) + '/>';
    }
    if(p.k === 'cagoule') s += A('pj-meche', '<path d="M28 -30 C 46 -30 58 -18 66 -6 C 56 -8 48 -14 40 -18 Z M30 -24 C 46 -14 52 2 52 14 C 44 6 38 -4 32 -12 Z" fill="' + t.c + '"' + c(1.8) + '/>', ' style="transform-origin:30px -26px"');
    if(p.k === 'bandeau') s += A('pj-meche', '<path d="M30 -14 C 42 -8 50 4 54 18 L 46 20 C 44 8 38 0 30 -6 Z M30 -10 C 40 -2 44 12 42 26 L 35 24 C 36 12 34 4 28 -4 Z" fill="' + t.d + '"' + c(1.6) + '/>', ' style="transform-origin:30px -10px"');
    if(s) s = A('pjg-td', s, ' data-gs="tete"');
  }
  var PB = Z.porte.bouche;
  if(PB && (PB.it.p.k === 'ninja' || PB.it.p.queues)){
    s += A('pjg-fd', A(PB.it.p.queues ? 'pjg-vent' : 'pj-meche', '<path d="M24 24 C 44 26 62 36 76 30 C 70 42 50 44 34 36 Z M22 30 C 38 40 50 56 64 58 C 54 66 38 58 28 44 Z" fill="' + Z.g('bouche') + '"' + c(1.8) + '/>' + (PB.it.p.fx === 'vent' ? etoiles([[70, 34, 2.6], [58, 58, 2.2], [80, 26, 2]], '#ffffff') : ''), ' style="transform-origin:24px 28px"'), ' data-gs="bouche"');
  }
  return s;
}
function coucheTete(Z){
  var PT = Z.porte.tete;
  if(!PT) return '';
  var p = PT.it.p, t = PT.col, g = Z.g('tete'), s = '', k = p.k;
  if(k === 'capuche'){
    s += '<path d="' + (p.pointe ? CAP_AV_P : CAP_AV) + '" fill="' + g + '"' + c(2.4) + '/>';
    s += '<path d="M26 -22 C 34 -12 40 8 38 32 L 46 32 C 55 -24 36 -74 0 -74 C 24 -70 40 -40 30 -24 Z" fill="#000" opacity=".16"/>';
    s += '<path d="M-38 30 C -40 8 -34 -12 -26 -22 C -16 -33 16 -33 26 -22 C 34 -12 40 8 38 30" stroke="' + t.dd + '" stroke-width="2.4" fill="none" opacity=".55"/>';
    s += '<path d="M-30 -56 C -18 -68 4 -70 14 -66" stroke="#fff" stroke-width="2.2" fill="none" opacity=".3" stroke-linecap="round"/>';
    if(p.oreilles) s += '<path d="M-36 -54 L -36 -92 L -10 -70 Z M36 -54 L 36 -92 L 10 -70 Z" fill="' + g + '"' + c(2.2) + '/><path d="M-32 -62 L -32 -82 L -18 -70 Z M32 -62 L 32 -82 L 18 -70 Z" fill="#f6e6d6"/><path d="M-36 -92 L -33 -84 M36 -92 L 33 -84" stroke="' + O + '" stroke-width="3" stroke-linecap="round"/>';
    if(p.feuilles) s += [[-38, 20], [-38, 0], [-31, -18], [-17, -30], [0, -33], [17, -30], [31, -18], [38, 0], [38, 20]].map(function(q, i){ return '<path d="M' + P(q[0], q[1]) + ' q -5 -9 5 -11 q 3 8 -5 11 Z" fill="' + (i % 2 ? t.l : '#7fd08a') + '"' + c(1.1) + ' transform="rotate(' + (q[0] * 2.2) + ' ' + P(q[0], q[1]) + ')"/>'; }).join('');
    if(p.fx === 'etoiles') s += etoiles([[-30, -46, 3.4], [20, -60, 3], [38, -24, 2.6], [-42, 6, 2.4], [6, -68, 2.2], [44, 14, 2.4]]) + '<path d="M-18 -58 a 7 7 0 1 0 5 11 a 5.4 5.4 0 1 1 -5 -11 Z" fill="#fff3c0"/>';
    return A('pjg-t', s, ' data-gs="tete"');
  }
  if(k === 'bandeau'){
    s += '<path d="M-34 -16 C -28 -32 28 -32 34 -16 L 34 -6 C 28 -22 -28 -22 -34 -6 Z" fill="' + g + '"' + c(2) + '/>';
    s += '<path d="M-30 -13 C -20 -24 20 -24 30 -13" stroke="#fff" stroke-width="1.4" fill="none" opacity=".35"/>';
    s += '<path d="M30 -16 q 8 -4 8 4 q -4 6 -10 2 Z" fill="' + t.d + '"' + c(1.6) + '/>';
    if(p.plaque) s += '<path d="M-12 -27 L 12 -27 L 12 -13 L -12 -13 Z" fill="#c8ccd8"' + c(1.6) + '/><path d="M-6 -24 q 6 8 12 0 M0 -24 v 8" stroke="#5a5f70" stroke-width="1.4" fill="none"/><circle cx="-9" cy="-20" r="1.2" fill="#5a5f70"/><circle cx="9" cy="-20" r="1.2" fill="#5a5f70"/>';
    if(p.plume) s += A('pj-plume', '<path d="M-26 -22 C -40 -44 -42 -66 -30 -80 C -24 -62 -20 -42 -22 -22 Z" fill="#f4f0e6"' + c(1.6) + '/><path d="M-24 -24 C -30 -44 -32 -60 -30 -78" stroke="#8a7a5a" stroke-width="1" fill="none"/><path d="M-36 -64 l 6 2 M-38 -52 l 7 2" stroke="#c84a3a" stroke-width="2"/>', ' style="transform-origin:-24px -22px"');
    return A('pjg-t', s, ' data-gs="tete"');
  }
  if(k === 'cagoule'){
    var ey = Z.K.age === 'enfant' ? 8 : 6;
    var fente = 'M-27 ' + (ey - 9) + ' C -18 ' + (ey - 13) + ' 18 ' + (ey - 13) + ' 27 ' + (ey - 9) + ' L 27 ' + (ey + 9) + ' C 18 ' + (ey + 12) + ' -18 ' + (ey + 12) + ' -27 ' + (ey + 9) + ' Z';
    s += '<path d="M-38 36 C -46 -26 -28 -70 0 -70 C 28 -70 46 -26 38 36 C 26 46 -26 46 -38 36 Z ' + fente + '" fill="' + g + '" fill-rule="evenodd"' + c(2.4) + '/>';
    s += '<path d="M14 -64 C 34 -50 42 -20 38 36 C 30 42 22 44 16 45 C 30 20 30 -30 14 -64 Z" fill="#000" opacity=".2"/>';
    s += '<path d="M-24 ' + (ey + 20) + ' Q 0 ' + (ey + 26) + ' 24 ' + (ey + 20) + ' M-30 -40 C -14 -54 14 -54 30 -40" stroke="' + t.l + '" stroke-width="1.6" fill="none" opacity=".5"/>';
    s += '<path d="M30 -26 q 8 -4 9 4 q -5 6 -10 1 Z" fill="' + t.d + '"' + c(1.4) + '/>';
    return A('pjg-t', s, ' data-gs="tete"');
  }
  if(k === 'chapeau'){
    var bw = p.bord || 48, by = -38, ch = p.h || 30, cw = 31;
    var brim = 'M' + (-bw) + ' ' + (by + 2) + ' C ' + (-bw * .8) + ' ' + (by - 12) + ' ' + (bw * .8) + ' ' + (by - 12) + ' ' + bw + ' ' + (by + 2) + ' C ' + (bw * .78) + ' ' + (by + (p.mou ? 14 : 10)) + ' ' + (-bw * .78) + ' ' + (by + (p.mou ? 14 : 10)) + ' ' + (-bw) + ' ' + (by + 2) + ' Z';
    var crown;
    if(p.forme === 'fedora') crown = 'M' + (-cw) + ' ' + (by - 2) + ' L ' + (-cw * .82) + ' ' + (by - ch) + ' C ' + (-cw * .3) + ' ' + (by - ch - 5) + ' ' + (-cw * .1) + ' ' + (by - ch + 6) + ' 0 ' + (by - ch + 5) + ' C ' + (cw * .1) + ' ' + (by - ch + 6) + ' ' + (cw * .3) + ' ' + (by - ch - 5) + ' ' + (cw * .82) + ' ' + (by - ch) + ' L ' + cw + ' ' + (by - 2) + ' Z';
    else if(p.forme === 'pointu') crown = 'M' + (-cw) + ' ' + (by - 2) + ' C ' + (-cw * .5) + ' ' + (by - ch * .45) + ' -8 ' + (by - ch * .8) + ' 16 ' + (by - ch) + ' C 22 ' + (by - ch - 4) + ' 28 ' + (by - ch + 6) + ' 22 ' + (by - ch + 10) + ' C 10 ' + (by - ch * .7) + ' ' + (cw * .7) + ' ' + (by - ch * .4) + ' ' + cw + ' ' + (by - 2) + ' Z';
    else if(p.forme === 'robin') crown = 'M' + (-cw) + ' ' + (by - 2) + ' C ' + (-cw * .6) + ' ' + (by - ch * .7) + ' 10 ' + (by - ch) + ' 46 ' + (by - ch * .55) + ' C 36 ' + (by - ch * .4) + ' ' + (cw + 2) + ' ' + (by - 14) + ' ' + cw + ' ' + (by - 2) + ' Z';
    else crown = 'M' + (-cw) + ' ' + (by - 2) + ' C ' + (-cw) + ' ' + (by - ch * .95) + ' ' + (-cw * .5) + ' ' + (by - ch) + ' 0 ' + (by - ch) + ' C ' + (cw * .5) + ' ' + (by - ch) + ' ' + cw + ' ' + (by - ch * .95) + ' ' + cw + ' ' + (by - 2) + ' Z';
    if(p.forme === 'robin'){
      s += '<path d="' + crown + '" fill="' + g + '"' + c(2.2) + '/><path d="M' + (-cw - 4) + ' ' + (by + 4) + ' C ' + (-cw) + ' ' + (by - 6) + ' ' + cw + ' ' + (by - 8) + ' ' + (cw + 8) + ' ' + (by - 2) + ' C ' + (cw + 14) + ' ' + (by - 10) + ' ' + (cw + 18) + ' ' + (by - 12) + ' ' + (cw + 20) + ' ' + (by - 4) + ' C ' + (cw + 10) + ' ' + (by + 8) + ' ' + (-cw) + ' ' + (by + 10) + ' ' + (-cw - 4) + ' ' + (by + 4) + ' Z" fill="' + t.d + '"' + c(2) + '/>';
    } else {
      s += '<path d="' + brim + '" fill="' + t.d + '"' + c(2.2) + '/><path d="' + crown + '" fill="' + g + '"' + c(2.2) + '/>';
      s += '<path d="' + brim.replace(/ Z$/, '') + '" fill="none" stroke="#fff" stroke-width="1.2" opacity=".25"/>';
    }
    if(p.ruban) s += '<path d="M' + (-cw + .5) + ' ' + (by - 3) + ' C ' + (-cw * .5) + ' ' + (by - 7) + ' ' + (cw * .5) + ' ' + (by - 7) + ' ' + (cw - .5) + ' ' + (by - 3) + ' L ' + (cw - 1) + ' ' + (by - 10) + ' C ' + (cw * .5) + ' ' + (by - 14) + ' ' + (-cw * .5) + ' ' + (by - 14) + ' ' + (-cw + 1) + ' ' + (by - 10) + ' Z" fill="' + t.dd + '"' + c(1.2) + '/>';
    s += '<path d="M' + (cw * .2) + ' ' + (by - ch + 6) + ' C ' + (cw * .7) + ' ' + (by - ch * .7) + ' ' + (cw * .9) + ' ' + (by - ch * .3) + ' ' + (cw - 1) + ' ' + (by - 4) + '" stroke="#000" stroke-width="6" fill="none" opacity=".12"/>';
    if(p.plume) s += A('pj-plume', '<path d="M' + (cw - 6) + ' ' + (by - 8) + ' C ' + (cw + 18) + ' ' + (by - 40) + ' ' + (cw + 40) + ' ' + (by - 52) + ' ' + (cw + 56) + ' ' + (by - 50) + ' C ' + (cw + 40) + ' ' + (by - 40) + ' ' + (cw + 24) + ' ' + (by - 24) + ' ' + (cw + 4) + ' ' + (by - 6) + ' Z" fill="#e8584a"' + c(1.8) + '/><path d="M' + (cw - 2) + ' ' + (by - 8) + ' C ' + (cw + 20) + ' ' + (by - 34) + ' ' + (cw + 38) + ' ' + (by - 46) + ' ' + (cw + 52) + ' ' + (by - 49) + '" stroke="#9a2a20" stroke-width="1.1" fill="none"/>', ' style="transform-origin:' + (cw - 4) + 'px ' + (by - 8) + 'px"');
    return A('pjg-t', s, ' data-gs="tete"');
  }
  if(k === 'trappeur'){
    s += '<path d="M-37 -10 L -39 20 Q -33 28 -26 22 L -25 -8 Z M37 -10 L 39 20 Q 33 28 26 22 L 25 -8 Z" fill="' + g + '"' + c(2) + '/>' + fourrureLigne([[-36, 22], [-31, 25], [-26, 22]], 3.6) + fourrureLigne([[36, 22], [31, 25], [26, 22]], 3.6);
    s += '<path d="M-34 -30 C -38 -62 -16 -72 2 -72 C 22 -72 40 -62 34 -30 Z" fill="' + g + '"' + c(2.2) + '/><path d="M10 -70 C 28 -64 38 -52 34 -30 L 22 -30 C 26 -48 20 -62 10 -70 Z" fill="#000" opacity=".16"/>';
    s += fourrureLigne([[-34, -28], [-24, -31], [-12, -33], [0, -34], [12, -33], [24, -31], [34, -28]], 6.4);
    s += '<circle cx="2" cy="-76" r="6.5" fill="#f4ead6"' + c(1.6) + '/><circle cx="0" cy="-78" r="2.4" fill="#fff"/>';
    return A('pjg-t', s, ' data-gs="tete"');
  }
  if(k === 'casque'){
    var dome = 'M-36 -10 C -40 -52 -20 -70 0 -70 C 20 -70 40 -52 36 -10 Z';
    if(p.cornes) s += '<path d="M-30 -36 C -48 -40 -58 -58 -54 -80 C -46 -64 -38 -56 -26 -52 Z M30 -36 C 48 -40 58 -58 54 -80 C 46 -64 38 -56 26 -52 Z" fill="#f4ead6"' + c(2) + '/><path d="M-52 -74 l 6 4 M52 -74 l -6 4" stroke="' + O + '" stroke-width="1.2"/>';
    if(p.cuir) s += '<path d="M-36 -14 L -38 16 Q -32 22 -26 16 L -27 -12 Z M36 -14 L 38 16 Q 32 22 26 16 L 27 -12 Z" fill="' + t.d + '"' + c(1.8) + '/>';
    if(p.fx === 'lueur') s += halo('pj-pulse', '<path d="' + dome + '" fill="#bff8ff" opacity=".35" transform="scale(1.12) translate(0 -4)"/>');
    s += '<path d="' + dome + '" fill="' + g + '"' + c(2.4) + '/><path d="M12 -68 C 30 -58 38 -40 36 -12 L 26 -12 C 28 -38 22 -56 12 -68 Z" fill="#000" opacity=".16"/>';
    s += '<path d="M-24 -56 C -16 -64 -4 -66 4 -65" stroke="#fff" stroke-width="3" fill="none" opacity=".4" stroke-linecap="round"/>';
    s += '<path d="M-38 -16 C -30 -24 30 -24 38 -16 L 38 -8 C 30 -16 -30 -16 -38 -8 Z" fill="' + (p.cuir ? t.dd : t.l) + '"' + c(1.8) + '/>';
    if(p.cuir) s += '<path d="M0 -70 L 0 -18 M-20 -62 C -26 -46 -28 -32 -28 -20 M20 -62 C 26 -46 28 -32 28 -20" stroke="' + t.x + '" stroke-width="1.2" stroke-dasharray="3 2.4" fill="none"/>';
    else s += [[-28, -13], [-14, -16], [14, -16], [28, -13]].map(function(q){ return '<circle cx="' + q[0] + '" cy="' + q[1] + '" r="1.8" fill="' + t.dd + '"/>'; }).join('');
    if(p.lune) s += '<path d="M2 -62 a 10 10 0 1 0 8 17 a 8 8 0 1 1 -8 -17 Z" fill="#bff8ff"' + c(1.4) + '/>' + etoiles([[-16, -48, 3], [22, -34, 2.6], [-26, -30, 2.2]], '#ffffff');
    return A('pjg-t', s, ' data-gs="tete"');
  }
  if(k === 'couronne'){
    var lv = [[-34, -24, -60], [-28, -36, -40], [-18, -44, -20], [-6, -48, 0], [6, -48, 10], [18, -44, 25], [28, -36, 45], [34, -24, 65]];
    s += '<path d="M-34 -22 C -26 -46 26 -46 34 -22" stroke="#6a4a2a" stroke-width="3" fill="none"/>';
    s += lv.map(function(q, i){ return '<path d="M' + P(q[0], q[1]) + ' q -6 -10 4 -14 q 4 9 -4 14 Z" fill="' + (i % 2 ? t.l : t.c) + '"' + c(1.2) + ' transform="rotate(' + q[2] + ' ' + P(q[0], q[1]) + ')"/>'; }).join('');
    s += '<circle cx="-12" cy="-46" r="3" fill="#ff9ac0"' + c(.9) + '/><circle cx="14" cy="-46" r="3" fill="#fff6c8"' + c(.9) + '/>';
    s += halo('pjg-orbite', lucioles([[-40, -40, 2], [36, -52, 2.2], [0, -70, 1.8], [-30, -64, 1.6], [44, -24, 1.8]]));
    return A('pjg-t', s, ' data-gs="tete"');
  }
  return '';
}
/* ---------- Masques (yeux) ---------- */
function trous(ey){ return ' M-20.5 ' + ey + ' a 8.5 7.2 0 1 0 17 0 a 8.5 7.2 0 1 0 -17 0 Z M3.5 ' + ey + ' a 8.5 7.2 0 1 0 17 0 a 8.5 7.2 0 1 0 -17 0 Z'; }
function coucheYeux(Z){
  var PY = Z.porte.yeux;
  if(!PY) return '';
  var p = PY.it.p, t = PY.col, g = Z.g('yeux'), s = '', ey = Z.K.age === 'enfant' ? 8 : 6, e = ey + .5;
  function Y(v){ return f1(ey + v); }
  if(p.k === 'loup' || p.k === 'chat' || p.k === 'renard' || p.k === 'ancien'){
    var bord;
    if(p.k === 'renard') bord = 'M-31 ' + Y(2) + ' L -38 ' + Y(-20) + ' L -17 ' + Y(-12) + ' C -8 ' + Y(-13) + ' -3 ' + Y(-9) + ' 0 ' + Y(-6) + ' C 3 ' + Y(-9) + ' 8 ' + Y(-13) + ' 17 ' + Y(-12) + ' L 38 ' + Y(-20) + ' L 31 ' + Y(2) + ' C 28 ' + Y(12) + ' 16 ' + Y(14) + ' 6 ' + Y(9) + ' L 0 ' + Y(14) + ' L -6 ' + Y(9) + ' C -16 ' + Y(14) + ' -28 ' + Y(12) + ' -31 ' + Y(2) + ' Z';
    else if(p.k === 'chat') bord = 'M-31 ' + Y(0) + ' L -34 ' + Y(-18) + ' L -18 ' + Y(-12) + ' C -8 ' + Y(-14) + ' -3 ' + Y(-9) + ' 0 ' + Y(-7) + ' C 3 ' + Y(-9) + ' 8 ' + Y(-14) + ' 18 ' + Y(-12) + ' L 34 ' + Y(-18) + ' L 31 ' + Y(0) + ' C 31 ' + Y(10) + ' 18 ' + Y(13) + ' 7 ' + Y(8) + ' C 3 ' + Y(6) + ' -3 ' + Y(6) + ' -7 ' + Y(8) + ' C -18 ' + Y(13) + ' -31 ' + Y(10) + ' -31 ' + Y(0) + ' Z';
    else if(p.k === 'ancien') bord = 'M-32 ' + Y(-2) + ' C -32 ' + Y(-14) + ' -12 ' + Y(-16) + ' -4 ' + Y(-12) + ' L 0 ' + Y(-22) + ' L 4 ' + Y(-12) + ' C 12 ' + Y(-16) + ' 32 ' + Y(-14) + ' 32 ' + Y(-2) + ' C 32 ' + Y(10) + ' 18 ' + Y(15) + ' 7 ' + Y(10) + ' L 0 ' + Y(16) + ' L -7 ' + Y(10) + ' C -18 ' + Y(15) + ' -32 ' + Y(10) + ' -32 ' + Y(-2) + ' Z';
    else bord = 'M-31 ' + Y(-3) + ' C -30 ' + Y(-14) + ' -10 ' + Y(-15) + ' 0 ' + Y(-7) + ' C 10 ' + Y(-15) + ' 30 ' + Y(-14) + ' 31 ' + Y(-3) + ' C 31 ' + Y(9) + ' 18 ' + Y(13) + ' 7 ' + Y(8) + ' C 3 ' + Y(6) + ' -3 ' + Y(6) + ' -7 ' + Y(8) + ' C -18 ' + Y(13) + ' -31 ' + Y(9) + ' -31 ' + Y(-3) + ' Z';
    if(p.fx === 'lueur') s += halo('pj-pulse', '<path d="' + bord + '" fill="#8ff3ff" opacity=".5" transform="translate(0 ' + ey + ') scale(1.16) translate(0 ' + (-ey) + ')"/>');
    s += '<path d="M-31 ' + Y(-1) + ' L -36 ' + Y(1) + ' M31 ' + Y(-1) + ' L 36 ' + Y(1) + '" stroke="' + O + '" stroke-width="2.4" stroke-linecap="round"/>';
    s += '<path d="' + bord + trous(e) + '" fill="' + g + '" fill-rule="evenodd"' + c(2) + '/>';
    s += '<path d="M2 ' + Y(-8) + ' C 10 ' + Y(-14) + ' 28 ' + Y(-13) + ' 31 ' + Y(-3) + ' C 31 ' + Y(8) + ' 22 ' + Y(12) + ' 14 ' + Y(10) + ' C 22 ' + Y(6) + ' 24 ' + Y(-6) + ' 2 ' + Y(-8) + ' Z" fill="#000" opacity=".16"/>';
    if(p.k === 'renard') s += '<path d="M-36 ' + Y(-17) + ' L -24 ' + Y(-11) + ' L -31 ' + Y(-2) + ' Z M36 ' + Y(-17) + ' L 24 ' + Y(-11) + ' L 31 ' + Y(-2) + ' Z" fill="#fff6ea"/>';
    if(p.k === 'chat') s += '<path d="M-20 ' + Y(14) + ' l -10 2 M-20 ' + Y(17) + ' l -9 5 M20 ' + Y(14) + ' l 10 2 M20 ' + Y(17) + ' l 9 5" stroke="' + O + '" stroke-width="1.1" stroke-linecap="round"/>';
    if(p.k === 'ancien') s += '<path d="M-26 ' + Y(-6) + ' q 4 -4 8 0 q -4 4 -8 0 M18 ' + Y(-6) + ' q 4 -4 8 0 q -4 4 -8 0 M0 ' + Y(-18) + ' v 6 M-12 ' + Y(-12) + ' l 6 2 M26 ' + Y(4) + ' l -5 6 l 2 3" stroke="' + t.dd + '" stroke-width="1.3" fill="none"/>';
    if(p.feuilles) s += [[-31, -2, -60], [-22, -12, -25], [-8, -12, 10], [8, -12, -10], [22, -12, 25], [31, -2, 60]].map(function(q, i){ return '<path d="M' + P(q[0], ey + q[1]) + ' q -6 -9 3 -12 q 4 8 -3 12 Z" fill="' + (i % 2 ? t.l : t.d) + '"' + c(1) + ' transform="rotate(' + q[2] + ' ' + P(q[0], ey + q[1]) + ')"/>'; }).join('');
    if(p.cristal) s += '<path d="M-28 ' + Y(-4) + ' L -20 ' + Y(-11) + ' M-8 ' + Y(-11) + ' L -2 ' + Y(-4) + ' M20 ' + Y(-11) + ' L 28 ' + Y(-4) + ' M8 ' + Y(-11) + ' L 2 ' + Y(-4) + '" stroke="#ffffff" stroke-width="1.4" opacity=".75"/>' + etoiles([[-30, ey - 10, 3], [30, ey + 6, 2.6]], '#ffffff');
    if(p.fx === 'etoiles') s += etoiles([[-24, ey - 9, 2.6], [26, ey - 10, 2.4], [0, ey - 3, 2], [-28, ey + 6, 2], [28, ey + 7, 2.2]]);
    return A('pjg-y', s, ' data-gs="yeux"');
  }
  if(p.k === 'bande'){
    var b = 'M-35 ' + Y(-8) + ' C -12 ' + Y(-12) + ' 12 ' + Y(-12) + ' 35 ' + Y(-8) + ' L 35 ' + Y(8) + ' C 12 ' + Y(12) + ' -12 ' + Y(12) + ' -35 ' + Y(8) + ' Z';
    s += '<path d="' + b + trous(e) + '" fill="' + g + '" fill-rule="evenodd"' + c(2) + '/><path d="M2 ' + Y(-10) + ' C 14 ' + Y(-11) + ' 26 ' + Y(-10) + ' 35 ' + Y(-8) + ' L 35 ' + Y(8) + ' C 26 ' + Y(10) + ' 16 ' + Y(11) + ' 14 ' + Y(10) + ' C 22 ' + Y(4) + ' 22 ' + Y(-6) + ' 2 ' + Y(-10) + ' Z" fill="#000" opacity=".16"/>';
    s += A('pj-meche', '<path d="M34 ' + Y(-4) + ' C 44 ' + Y(-2) + ' 50 ' + Y(8) + ' 52 ' + Y(20) + ' L 45 ' + Y(20) + ' C 44 ' + Y(10) + ' 40 ' + Y(4) + ' 34 ' + Y(2) + ' Z" fill="' + t.d + '"' + c(1.5) + '/>', ' style="transform-origin:34px ' + ey + 'px"');
    return A('pjg-y', s, ' data-gs="yeux"');
  }
  if(p.k === 'hibou'){
    s += '<path d="M-34 ' + Y(-12) + ' L -26 ' + Y(-6) + ' L -30 ' + Y(-20) + ' L -20 ' + Y(-10) + ' Z M34 ' + Y(-12) + ' L 26 ' + Y(-6) + ' L 30 ' + Y(-20) + ' L 20 ' + Y(-10) + ' Z" fill="' + t.d + '"' + c(1.4) + '/>';
    s += '<path d="M-12 ' + Y(-13) + ' a 13 13 0 1 0 0.01 0 Z M12 ' + Y(-13) + ' a 13 13 0 1 0 0.01 0 Z' + trous(e) + '" fill="' + g + '" fill-rule="evenodd"' + c(2) + '/>';
    s += '<path d="M-22 ' + Y(-6) + ' l 3 3 M-24 ' + Y(2) + ' l 4 1 M-20 ' + Y(9) + ' l 3 -2 M22 ' + Y(-6) + ' l -3 3 M24 ' + Y(2) + ' l -4 1 M20 ' + Y(9) + ' l -3 -2" stroke="' + t.l + '" stroke-width="1.2"/>';
    s += '<path d="M-3 ' + Y(4) + ' L 3 ' + Y(4) + ' L 0 ' + Y(11) + ' Z" fill="#f0b030"' + c(1.2) + '/>';
    return A('pjg-y', s, ' data-gs="yeux"');
  }
  if(p.k === 'lunettes'){
    s += '<path d="M-38 ' + Y(-3) + ' L 38 ' + Y(-3) + ' L 38 ' + Y(3) + ' L -38 ' + Y(3) + ' Z" fill="' + g + '"' + c(1.6) + '/>';
    [-12, 12].forEach(function(x){ s += '<circle cx="' + x + '" cy="' + e + '" r="11" fill="#c99a3a"' + c(2) + '/><circle cx="' + x + '" cy="' + e + '" r="8" fill="#bfe6ff" fill-opacity=".38" stroke="' + O + '" stroke-width="1.2"/><path d="M' + (x - 4) + ' ' + Y(-3) + ' l 3 -2" stroke="#fff" stroke-width="1.6" stroke-linecap="round"/>'; });
    s += '<path d="M-2 ' + Y(-1) + ' q 2 -2 4 0" stroke="#c99a3a" stroke-width="3" fill="none"/>';
    return A('pjg-y', s, ' data-gs="yeux"');
  }
  if(p.k === 'papillon'){
    var ailes = '<path d="M-2 ' + Y(-2) + ' C -10 ' + Y(-24) + ' -40 ' + Y(-26) + ' -38 ' + Y(-6) + ' C -37 ' + Y(4) + ' -28 ' + Y(10) + ' -16 ' + Y(10) + ' C -26 ' + Y(14) + ' -30 ' + Y(26) + ' -18 ' + Y(24) + ' C -10 ' + Y(22) + ' -4 ' + Y(14) + ' -2 ' + Y(6) + ' Z M2 ' + Y(-2) + ' C 10 ' + Y(-24) + ' 40 ' + Y(-26) + ' 38 ' + Y(-6) + ' C 37 ' + Y(4) + ' 28 ' + Y(10) + ' 16 ' + Y(10) + ' C 26 ' + Y(14) + ' 30 ' + Y(26) + ' 18 ' + Y(24) + ' C 10 ' + Y(22) + ' 4 ' + Y(14) + ' 2 ' + Y(6) + ' Z' + trous(e) + '" fill="' + g + '" fill-rule="evenodd"' + c(2) + '/>' +
      '<circle cx="-30" cy="' + Y(-10) + '" r="3.4" fill="' + t.x + '"/><circle cx="30" cy="' + Y(-10) + '" r="3.4" fill="' + t.x + '"/><circle cx="-20" cy="' + Y(18) + '" r="2.2" fill="' + t.x + '"/><circle cx="20" cy="' + Y(18) + '" r="2.2" fill="' + t.x + '"/>';
    s += '<g class="pjg-battement">' + ailes + '</g>' + etoiles([[-36, ey - 18, 2.4], [38, ey - 14, 2.2]], '#ffffff');
    return A('pjg-y', s, ' data-gs="yeux"');
  }
  return '';
}
/* ---------- Foulards (bouche) ---------- */
function coucheBouche(Z){
  var PB = Z.porte.bouche;
  if(!PB) return '';
  var p = PB.it.p, t = PB.col, g = Z.g('bouche'), s = '', ey = Z.K.age === 'enfant' ? 8 : 6, y0 = ey + 9;
  var couvre = 'M-29 ' + (y0 + 2) + ' C -20 ' + (y0 - 3) + ' -6 ' + (y0 - 4) + ' 0 ' + (y0 - 5) + ' C 6 ' + (y0 - 4) + ' 20 ' + (y0 - 3) + ' 29 ' + (y0 + 2) + ' C 30 25 27 35 17 43 C 8 48 -8 48 -17 43 C -27 35 -30 25 -29 ' + (y0 + 2) + ' Z';
  var ombre = '<path d="M4 ' + (y0 - 4) + ' C 14 ' + (y0 - 3) + ' 24 ' + (y0 - 2) + ' 29 ' + (y0 + 2) + ' C 30 25 27 35 17 43 C 12 46 8 47 4 47 C 18 36 20 20 4 ' + (y0 - 4) + ' Z" fill="#000" opacity=".17"/>';
  if(p.k === 'cachecou'){
    s += '<path d="M-20 38 L -20 58 Q 0 64 20 58 L 20 38 Z" fill="' + t.d + '"' + c(2) + '/>';
    s += '<path d="' + couvre + '" fill="' + g + '"' + c(2.2) + '/>' + ombre;
    s += [y0 + 6, y0 + 13, 34, 41, 50].map(function(y){ return '<path d="M-24 ' + y + ' Q 0 ' + (y + 4) + ' 24 ' + y + '" stroke="' + t.dd + '" stroke-width="1" fill="none" opacity=".55"/>'; }).join('');
  }
  if(p.k === 'foulard'){
    s += '<path d="M-22 36 L 0 70 L 22 36 Z" fill="' + t.d + '"' + c(2) + '/>';
    s += '<path d="' + couvre + '" fill="' + g + '"' + c(2.2) + '/>' + ombre;
    if(p.pois) s += [[-16, y0 + 4], [-4, y0 + 10], [10, y0 + 5], [20, y0 + 12], [-14, 32], [2, 36], [14, 30], [0, 52], [-8, 44], [8, 46]].map(function(q){ return '<circle cx="' + q[0] + '" cy="' + q[1] + '" r="2.4" fill="' + t.x + '"/>'; }).join('');
    else s += '<path d="M-24 ' + (y0 + 8) + ' Q 0 ' + (y0 + 12) + ' 24 ' + (y0 + 8) + '" stroke="' + t.x + '" stroke-width="1.4" stroke-dasharray="3 2.6" fill="none"/><path d="M-6 50 l 6 8 l 6 -8" stroke="' + t.x + '" stroke-width="1.4" fill="none"/>';
    if(p.fx === 'vent') s += etoiles([[-20, y0 + 6, 2.4], [16, 34, 2.2]], '#ffffff');
  }
  if(p.k === 'ninja'){
    s += '<path d="' + couvre + '" fill="' + g + '"' + c(2.2) + '/>' + ombre;
    s += '<path d="M-28 ' + (y0 + 8) + ' L 26 ' + (y0 + 20) + ' M-26 ' + (y0 + 18) + ' L 24 32 M-18 40 L 18 34" stroke="' + t.l + '" stroke-width="1.4" opacity=".55"/>';
  }
  if(p.k === 'echarpe'){
    var queue = 'M12 44 C 20 70 24 96 20 122 L 34 122 C 38 96 32 66 26 42 Z';
    s += '<path d="M-30 36 C -26 54 26 54 30 36 L 30 52 C 26 66 -26 66 -30 52 Z" fill="' + t.d + '"' + c(2.2) + '/>';
    s += '<path d="' + couvre + '" fill="' + g + '"' + c(2.2) + '/>' + ombre;
    s += '<path d="' + queue + '" fill="' + g + '"' + c(2) + '/>';
    s += [21, 24, 27, 30, 33].map(function(x, i){ return '<path d="M' + x + ' 122 l ' + (i % 2 ? .5 : -.5) + ' 7" stroke="' + t.d + '" stroke-width="2" stroke-linecap="round"/>'; }).join('');
    if(p.rayures){ var r = ''; [y0 + 4, y0 + 14, 34].forEach(function(y){ r += '<path d="M-30 ' + y + ' Q 0 ' + (y + 5) + ' 30 ' + y + '" stroke="' + t.x + '" stroke-width="3.4" fill="none"/>'; }); [62, 82, 102].forEach(function(y){ r += '<path d="M16 ' + y + ' L 36 ' + (y - 1) + '" stroke="' + t.x + '" stroke-width="3.4"/>'; }); s += '<clipPath id="' + Z.K.n('gbr') + '"><path d="' + couvre + '"/><path d="' + queue + '"/></clipPath><g clip-path="url(#' + Z.K.n('gbr') + ')">' + r + '</g>'; }
  }
  if(p.k === 'feuilles'){
    s += '<path d="' + couvre + '" fill="' + g + '"' + c(2.2) + '/>' + ombre;
    s += [[-24, 36], [-14, 44], [-2, 48], [10, 46], [20, 40], [28, 30], [-28, 26]].map(function(q, i){ return '<path d="M' + P(q[0], q[1]) + ' q -3 12 6 14 q 2 -10 -6 -14 Z" fill="' + (i % 2 ? t.l : '#7fd08a') + '"' + c(1.1) + '/>'; }).join('');
    s += '<path d="M-20 ' + (y0 + 4) + ' q 6 6 0 12 M12 ' + (y0 + 2) + ' q 6 6 0 12" stroke="' + t.dd + '" stroke-width="1.2" fill="none"/>';
  }
  if(p.k === 'cuir'){
    s += '<path d="M-28 ' + (y0 + 4) + ' L -38 ' + (y0 - 2) + ' M28 ' + (y0 + 4) + ' L 38 ' + (y0 - 2) + '" stroke="' + CUIR.d + '" stroke-width="3.4" stroke-linecap="round"/>';
    s += '<path d="M-26 ' + (y0 + 2) + ' C -18 ' + (y0 - 3) + ' 18 ' + (y0 - 3) + ' 26 ' + (y0 + 2) + ' C 26 26 18 38 0 40 C -18 38 -26 26 -26 ' + (y0 + 2) + ' Z" fill="' + g + '"' + c(2.2) + '/>' + '<path d="M4 ' + (y0 - 2) + ' C 16 ' + (y0 - 2) + ' 26 ' + y0 + ' 26 ' + (y0 + 2) + ' C 26 26 18 38 4 40 C 14 30 16 18 4 ' + (y0 - 2) + ' Z" fill="#000" opacity=".16"/>';
    s += '<path d="M0 ' + (y0 - 2) + ' L 0 39 M-22 ' + (y0 + 4) + ' C -20 26 -14 34 -4 37 M22 ' + (y0 + 4) + ' C 20 26 14 34 4 37" stroke="' + t.x + '" stroke-width="1.1" stroke-dasharray="2.6 2" fill="none"/>';
    s += [[-12, 28], [12, 28], [-6, 33], [6, 33]].map(function(q){ return '<circle cx="' + q[0] + '" cy="' + q[1] + '" r="1.5" fill="#d8dce6"' + c(.6) + '/>'; }).join('');
  }
  if(p.k === 'brume'){
    s += '<path d="' + couvre + '" fill="' + g + '" fill-opacity=".72"' + c(1.6) + '/>';
    s += '<g class="pj-derive"><path d="M-34 30 C -20 22 -8 34 6 28 C 20 22 30 32 42 26" stroke="#ffffff" stroke-width="5" fill="none" opacity=".45" stroke-linecap="round"/></g>';
    s += '<g class="pj-derive" style="animation-delay:-4s"><path d="M-38 44 C -24 38 -10 48 4 42 C 18 36 28 46 40 40" stroke="#e8f0ff" stroke-width="4" fill="none" opacity=".4" stroke-linecap="round"/></g>';
    s += poussiere([[-30, 40, 2], [26, 44, 2.2], [0, 52, 1.8], [-14, 50, 1.6], [36, 30, 1.8]]);
  }
  return A('pjg-f', s, ' data-gs="bouche"');
}

/* ==========================================================
   Le branchement dans Persos
   ========================================================== */
var COUCHES = {
  capeDos:coucheCapeDos, carquois:coucheCarquois, teteDos:coucheTeteDos, jambes:coucheJambes, corps:coucheCorps, cou:coucheCou,
  arme:coucheArme, bras:coucheBras, mains:coucheMains, capeAvant:coucheCapeAvant, ceinture:coucheCeinture,
  bouche:coucheBouche, yeux:coucheYeux, tete:coucheTete
};
function prep(look, K, h, ctx){
  var porte = {};
  SLOTS.forEach(function(s){
    var x = look && look[s.id];
    if(!x) return;
    var id = typeof x === 'string' ? x : x.id, it = ITEMS[id];
    if(!it || it.slot !== s.id) return;
    porte[s.id] = {it:it, col:teinte((x && x.c) || it.c)};
  });
  if(!ctx.guet && !Object.keys(porte).length) return {vide:true};
  if(porte.corps){
    var m = porte.corps.it.p.manches, tc = m === 'chemise' ? CHEMISE : porte.corps.col;
    if(m !== 'defaut') K.tissuForce = [tc.l, tc.c, tc.d];
  }
  var Z = {K:K, h:h, ctx:ctx, porte:porte};
  Z.g = function(s){ return 'url(#' + K.n('g-' + s) + ')'; };
  Z.gh = function(s){ return 'url(#' + K.n('gh-' + s) + ')'; };
  return {
    vide:false,
    a:function(s){ return !!porte[s]; },
    defs:function(){
      var d = '';
      Object.keys(porte).forEach(function(s){ var t = porte[s].col; d += T.lin(K.n('g-' + s), [[0, t.l], [.55, t.c], [1, t.d]]) + T.lin(K.n('gh-' + s), [[0, t.d], [.45, t.l], [1, t.d]], 0, 0, 1, 0); });
      if(ctx.guet && !porte.pieds){
        var p = ctx.eq.pieds, col = p === 'bottes_vent' ? ['#ffffff', '#cfe6f4', '#8aa8c0'] : p === 'bottes_fondateurs' ? ['#ffffff', '#d9e2f4', '#8e9cc0'] : p === 'bottes_souples' ? ['#a8885e', '#8a6a4a', '#5a3d24'] : ['#b77b45', '#8a5a30', '#5a3518'];
        d += T.lin(K.n('gbd'), [[0, col[0]], [.55, col[1]], [1, col[2]]]);
      }
      return d ? '<defs>' + d + '</defs>' : '';
    },
    couche:function(nom){ try{ return COUCHES[nom] ? COUCHES[nom](Z) : ''; }catch(e){ if(window.console) console.error(e); return ''; } },
    cacheCheveux:function(){ return porte.tete ? (porte.tete.it.p.cache || null) : null; },
    haut:function(){ return porte.tete ? (porte.tete.it.p.haut || 0) : 0; }
  };
}
/* La vignette d'un emplacement (viewBox recadré sur le héros debout) */
var CADRES = {
  tete:{t:1, y:-24, s:122}, yeux:{t:1, y:4, s:80}, bouche:{t:1, y:24, s:96},
  cou:{y:162, s:96}, corps:{y:228, s:196}, cape:{y:252, s:236, x:150}, jambes:{y:330, s:200}, pieds:{y:388, s:120},
  mains:{y:254, s:150}, bras:{y:236, s:146}, arme:{y:256, s:256, x:108}, fleches:{y:102, s:80, x:226}, carquois:{y:138, s:124, x:214}, 'carquois-hanche':{y:238, s:110, x:196}
};
function cadre(zone, geo){
  var C = CADRES[zone];
  if(!C) return null;
  var cx, cy, s;
  if(C.t){ s = C.s * geo.hs; cx = 150; cy = geo.hy + C.y * geo.hs; }
  else { s = C.s * geo.k; cx = 150 + ((C.x || 150) - 150) * geo.k; cy = 414 - (414 - C.y) * geo.k; }
  return f1(cx - s / 2) + ' ' + f1(cy - s / 2) + ' ' + f1(s) + ' ' + f1(s);
}
Persos.garde({prep:prep, cadre:cadre});

/* ---------- Petites images des emplacements (onglets de la garde-robe) ---------- */
var ICONES = {
  tete:'<path d="M6 21 C 8 16 24 16 26 21 C 24 24 8 24 6 21 Z" fill="#8a5a30"/><path d="M10 20 C 10 8 22 8 22 20 Z" fill="#a8743e"/><path d="M10 17 h12" stroke="#5a3518" stroke-width="2.4"/>',
  yeux:'<path d="M3 14 C 4 8 13 8 16 12 C 19 8 28 8 29 14 C 29 20 21 22 16 17 C 11 22 3 20 3 14 Z" fill="#36313f"/><ellipse cx="10" cy="14" rx="3.4" ry="2.6" fill="#fff"/><ellipse cx="22" cy="14" rx="3.4" ry="2.6" fill="#fff"/>',
  bouche:'<path d="M6 10 C 12 7 20 7 26 10 C 27 20 22 26 16 27 C 10 26 5 20 6 10 Z" fill="#d33a3a"/><path d="M8 15 Q 16 18 24 15" stroke="#fff" stroke-width="1.4" fill="none" stroke-dasharray="2 2"/>',
  cou:'<path d="M8 6 Q 16 22 24 6" stroke="#875230" stroke-width="2" fill="none"/><circle cx="16" cy="20" r="5" fill="#1fa39b" stroke="#24182e" stroke-width="1.4"/>',
  corps:'<path d="M9 7 L 16 10 L 23 7 L 28 13 L 24 15 L 24 27 L 8 27 L 8 15 L 4 13 Z" fill="#4aa64e" stroke="#24182e" stroke-width="1.4" stroke-linejoin="round"/><path d="M16 10 V 27" stroke="#24182e" stroke-width="1.2"/>',
  cape:'<path d="M11 5 C 6 14 5 22 6 29 L 26 29 C 27 22 26 14 21 5 Z" fill="#2f6ed0" stroke="#24182e" stroke-width="1.4"/><circle cx="16" cy="6" r="2.6" fill="#f1c232"/>',
  jambes:'<path d="M9 4 L 23 4 L 25 29 L 18 29 L 16 13 L 14 29 L 7 29 Z" fill="#875230" stroke="#24182e" stroke-width="1.4" stroke-linejoin="round"/>',
  pieds:'<path d="M11 4 L 19 4 L 19 20 C 24 21 28 23 28 27 L 28 29 L 9 29 L 10 20 Z" fill="#875230" stroke="#24182e" stroke-width="1.4" stroke-linejoin="round"/><path d="M10 9 h 10" stroke="#5a3518" stroke-width="2"/>',
  mains:'<path d="M9 16 L 9 7 Q 11 5 12 7 L 12 13 L 13 5 Q 15 3 16 5 L 16 13 L 17 6 Q 19 4 20 6 L 20 14 L 22 10 Q 25 10 24 13 L 21 22 C 20 26 17 28 14 28 C 10 28 8 24 9 16 Z" fill="#7b4ac9" stroke="#24182e" stroke-width="1.3" stroke-linejoin="round"/>',
  bras:'<path d="M8 6 L 22 4 L 25 27 L 11 29 Z" fill="#875230" stroke="#24182e" stroke-width="1.4" stroke-linejoin="round"/><path d="M11 12 l 10 -1 M12 18 l 10 -1 M13 24 l 10 -1" stroke="#e8c050" stroke-width="1.6"/>',
  arme:'<path d="M10 3 C 26 9 26 23 10 29" stroke="#24182e" stroke-width="4" fill="none" stroke-linecap="round"/><path d="M10 3 C 26 9 26 23 10 29" stroke="#a8743e" stroke-width="2.2" fill="none" stroke-linecap="round"/><path d="M10 3 L 10 29" stroke="#efe6cc" stroke-width="1"/>',
  fleches:'<path d="M5 27 L 25 7" stroke="#24182e" stroke-width="3"/><path d="M5 27 L 25 7" stroke="#d9cbb0" stroke-width="1.6"/><path d="M27 5 L 19 8 L 24 13 Z" fill="#8b91a2" stroke="#24182e" stroke-width="1.2"/><path d="M4 22 L 8 26 L 4 30 M8 20 L 12 24" stroke="#d33a3a" stroke-width="2" fill="none"/>',
  carquois:'<path d="M11 10 L 22 8 L 25 28 L 14 30 Z" fill="#875230" stroke="#24182e" stroke-width="1.4" stroke-linejoin="round"/><path d="M13 10 L 12 3 M17 9 L 17 2 M21 8 L 22 2" stroke="#24182e" stroke-width="1.6"/><path d="M10 3 L 12 0 L 14 3 Z M15 2 L 17 -1 L 19 2 Z" fill="#8b91a2"/>'
};
function icone(slot){ return '<svg viewBox="0 0 32 32" aria-hidden="true">' + (ICONES[slot] || '') + '</svg>'; }

window.Garde = {
  SLOTS:SLOTS, SLOT:SLOT, ITEMS:ITEMS, ORDRE:ORDRE, PALETTE:PALETTE, PAL:PAL, DEPART:DEPART, TROUVAILLES:TROUVAILLES, RARES_LIEU:RARES_LIEU,
  teinte:teinte, suivante:suivante, icone:icone,
  nomComplet:function(it){ return it.art + ' ' + it.nom.charAt(0).toLowerCase() + it.nom.slice(1); },
  parSlot:function(slot){ return ORDRE.filter(function(id){ return ITEMS[id].slot === slot; }); }
};
})();
