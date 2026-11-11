/* Enquête 3, étape 6 (le branchement du donjon) — vérification sans navigateur :
   1. les codes que l'enquête partage avec le donjon ont les mêmes symboles des deux côtés (src/codes-fixes.js, enquête 3,
      et donjon/donjon-codes.js) ; tous les autres codes du donjon sont réservés dans l'enquête (donjon:*) ; aucun doublon ;
   2. les règles du donjon : la Grosse Marie rend toute leur vie aux trois héros (une fois, hors combat) ; dans l'enquête, la dernière
      salle donne « Léo attrapé » si « Le maire est retenu » a été tapé avant, « Léo s'est enfui » sinon ; hors de l'enquête
      (le donjon tout seul), Léo est toujours attrapé.
      node tools/e3-donjon-codes.js */
var fs = require('fs'), path = require('path'), ICI = path.join(__dirname, '..');
var echecs = 0;
function ok(c, quoi){ console.log((c ? '  ✓ ' : '  ✗ ') + quoi); if(!c) echecs++; }
/* 1. les deux tables */
global.window = {ENQUETES:{1:{}, 2:{}, 3:{}}};
require(path.join(ICI, 'src', 'codes-fixes.js'));
var F = window.ENQUETES[3].codesFixes || {};
var g = {}; (new Function('window', fs.readFileSync(path.join(ICI, 'donjon', 'donjon-codes.js'), 'utf8')))(g);
var C = g.DONJON_CODES.CODES;
var PONT = {'leo:attrape':'info:leo_attrape', 'leo:enfui':'info:leo_enfui', 'porte:odette':'info:odette_porte', 'grosse:marie':'info:grosse_marie', 'maire:retenu':'info:maire_retenu'};
var faux = Object.keys(C).filter(function(id){ return F[PONT[id] || 'donjon:' + id] !== C[id].code.join('-'); });
ok(!faux.length, 'les ' + Object.keys(C).length + ' codes du donjon sont dans l\'enquête 3, avec les mêmes symboles' + (faux.length ? ' — PAS : ' + faux.join(', ') : ''));
var enTrop = Object.keys(F).filter(function(k){ var id = k.indexOf('donjon:') === 0 ? k.slice(7) : Object.keys(PONT).filter(function(x){ return PONT[x] === k; })[0]; return !id || !C[id]; });
ok(!enTrop.length, 'rien de gelé dans l\'enquête 3 qui ne soit pas un code du donjon' + (enTrop.length ? ' — EN TROP : ' + enTrop.join(', ') : ''));
var vus = {}, doubles = []; Object.keys(F).forEach(function(k){ if(vus[F[k]]) doubles.push(k); vus[F[k]] = 1; });
ok(!doubles.length, 'aucun doublon');
ok(C['grosse:marie'].a === 'pisteur' && C['maire:retenu'].a === 'pisteur' && C['leo:enfui'].a === 'barde', 'la Grosse Marie et le maire retenu se tapent chez le Pisteur ; « Léo s\'est enfui » est pour le Barde');
/* 2. les règles du donjon */
var Regles = require(path.join(ICI, 'donjon', 'moteur', 'src', 'regles.js'));
function partie(enquete){ var p = Regles.nouvellePartie(7); if(enquete){ p.enquete = 3; p.jeton = 'x'; } return p; }
var p = partie(true);
p.heros.pisteur.pv = 3; p.heros.sage.pv = 0; p.heros.sage.sol = true;
var ev = Regles.code(p, 'grosse:marie');
ok(ev[0].t === 'marie' && ['pisteur', 'alchimiste', 'sage'].every(function(h){ return p.heros[h].pv === p.heros[h].pvMax && !p.heros[h].sol; }), 'la Grosse Marie : toute la vie des trois héros revient');
ok(Regles.code(p, 'grosse:marie')[0].t === 'refus', 'elle ne sonne qu\'une fois');
ok(Regles.leoEnfui(p) && Regles.contenu(p, 'leo').code.id === 'leo:enfui', 'dans l\'enquête, sans le code du maire : Léo s\'enfuira');
ok(Regles.code(p, 'maire:retenu')[0].t === 'maire' && !Regles.leoEnfui(p) && Regles.contenu(p, 'leo').code.id === 'leo:attrape', '« Le maire est retenu » tapé avant : Léo sera attrapé');
var p2 = partie(true); p2.faits['code:leo:enfui'] = 1; Regles.code(p2, 'maire:retenu');
ok(Regles.contenu(p2, 'leo').code.id === 'leo:enfui', 'le code du maire tapé trop tard ne change plus rien');
var p3 = partie(false);
ok(!Regles.leoEnfui(p3) && Regles.contenu(p3, 'leo').code.id === 'leo:attrape', 'hors de l\'enquête (le donjon tout seul) : Léo est attrapé, comme avant');
console.log(echecs ? echecs + ' ÉCHEC(S)' : 'Tout est bon.');
process.exit(echecs ? 1 : 0);
