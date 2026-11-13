/* Enquête 3, étape 6 (le branchement du donjon) — vérification sans navigateur :
   1. les codes que l'enquête partage avec le donjon ont les mêmes symboles des deux côtés (src/codes-fixes.js, enquête 3,
      et donjon/donjon-codes.js) ; tous les autres codes du donjon sont réservés dans l'enquête (donjon:*) ; aucun doublon ;
   2. les règles du donjon : la Grosse Marie rend toute leur vie aux trois héros (une fois, hors combat) ; la dernière salle donne
      « L'homme en cape est là ! » au Barde en entrant, puis, Léo battu, « Léo a parlé » au Sage (13 novembre, Bible §13.33).
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
var PONT = {'leo:salle':'info:leo_la', 'leo:battu':'info:leo_battu', 'porte:odette':'info:odette_porte', 'grosse:marie':'info:grosse_marie'};
var faux = Object.keys(C).filter(function(id){ return F[PONT[id] || 'donjon:' + id] !== C[id].code.join('-'); });
ok(!faux.length, 'les ' + Object.keys(C).length + ' codes du donjon sont dans l\'enquête 3, avec les mêmes symboles' + (faux.length ? ' — PAS : ' + faux.join(', ') : ''));
var enTrop = Object.keys(F).filter(function(k){ var id = k.indexOf('donjon:') === 0 ? k.slice(7) : Object.keys(PONT).filter(function(x){ return PONT[x] === k; })[0]; return !id || !C[id]; });
ok(!enTrop.length, 'rien de gelé dans l\'enquête 3 qui ne soit pas un code du donjon' + (enTrop.length ? ' — EN TROP : ' + enTrop.join(', ') : ''));
var vus = {}, doubles = []; Object.keys(F).forEach(function(k){ if(vus[F[k]]) doubles.push(k); vus[F[k]] = 1; });
ok(!doubles.length, 'aucun doublon');
ok(C['grosse:marie'].a === 'pisteur' && C['leo:salle'].a === 'barde' && C['leo:battu'].a === 'sage' && !C['maire:retenu'] && !C['leo:enfui'] && !C['leo:attrape'], 'la Grosse Marie se tape chez le Pisteur ; « L\'homme en cape est là ! » est pour le Barde, « Léo a parlé » pour le Sage ; plus de maire retenu ni de Léo enfui');
/* 2. les règles du donjon */
var Regles = require(path.join(ICI, 'donjon', 'moteur', 'src', 'regles.js'));
function partie(enquete){ var p = Regles.nouvellePartie(7); if(enquete){ p.enquete = 3; p.jeton = 'x'; } return p; }
var p = partie(true);
p.heros.pisteur.pv = 3; p.heros.sage.pv = 0; p.heros.sage.sol = true;
var ev = Regles.code(p, 'grosse:marie');
ok(ev[0].t === 'marie' && ['pisteur', 'alchimiste', 'sage'].every(function(h){ return p.heros[h].pv === p.heros[h].pvMax && !p.heros[h].sol; }), 'la Grosse Marie : toute la vie des trois héros revient');
ok(Regles.code(p, 'grosse:marie')[0].t === 'refus', 'elle ne sonne qu\'une fois');
/* (13 novembre, Bible §13.33) la dernière salle : un code pour le Barde en entrant, Léo à battre, puis un code pour le Sage */
var ev2 = Regles.entrer(p, 'leo');
ok(ev2.some(function(e){ return e.t === 'code-objet' && e.code === 'leo:salle' && e.pour === 'barde'; }) && ev2.some(function(e){ return e.t === 'boss'; }) && !p.faits.fin, 'en entrant chez Léo : le code pour le Barde, et le combat — le donjon n\'est pas fini');
var ev3 = Regles.bossBattu(p, 'leo');
ok(ev3.some(function(e){ return e.t === 'code-objet' && e.code === 'leo:battu' && e.pour === 'sage'; }) && p.faits.fin === 1, 'Léo battu : le code pour le Sage, et le donjon est fini');
ok(Regles.code(p, 'maire:retenu')[0].t === 'refus', '« Le maire est retenu » n\'est plus un code du donjon');
console.log(echecs ? echecs + ' ÉCHEC(S)' : 'Tout est bon.');
process.exit(echecs ? 1 : 0);
