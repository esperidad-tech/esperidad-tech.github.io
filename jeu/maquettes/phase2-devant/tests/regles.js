/* Les règles, scène par scène (sans page) : node tests/regles.js */
'use strict';
require('../src/regles.js');
const P2 = globalThis.P2, REG = P2.REG;
const L = {W: 420, H: 860, solHaut: 300, solBas: 740, solG: 12, solD: 408, bossY: 170, bossTouche: 215};
let ok = 0, ko = 0;
function verif(nom, c, info) { if (c) ok++; else ko++; console.log((c ? 'OK   ' : 'RATÉ ') + nom + (info !== undefined ? ' ' + info : '')); }
function partie(r) { const S = P2.nouvelle(L, Object.assign({pisteur: 0}, r || {}), 7); S.attente = 999; return S; }
function avance(S, s, e) { for (let i = 0; i < s * 60; i++) P2.pas(S, 1 / 60, e); }
function place(S, x, y) { S.h.x = S.cible.x = x; S.h.y = S.cible.y = y; }

// le poing : la moitié de la salle
let S = partie(); place(S, 100, 600); S.att = {type: 'poing', t: 0, cote: 'g', prep: 1.7, fin: 2.25}; avance(S, 2);
verif('le poing à gauche touche à gauche', S.h.pv === 100 - REG.degats.poing, S.h.pv);
S = partie(); place(S, 300, 600); S.att = {type: 'poing', t: 0, cote: 'g', prep: 1.7, fin: 2.25}; avance(S, 2);
verif('le poing à gauche ne touche pas à droite', S.h.pv === 100);
// le souffle : reculer au fond
S = partie(); place(S, 200, 400); S.att = {type: 'souffle', t: 0, prep: 1.8, fin: 3.1}; avance(S, 3.2);
verif('le souffle brûle devant', S.h.pv === 100 - REG.degats.souffle);
S = partie(); place(S, 200, 720); S.att = {type: 'souffle', t: 0, prep: 1.8, fin: 3.1}; avance(S, 3.2);
verif('au fond de la salle, le souffle ne touche pas', S.h.pv === 100);
// le gros coup
S = partie(); place(S, 200, 700); S.att = {type: 'grosCoup', t: 0, prep: 3.5, fin: 4.1}; avance(S, 4);
verif('le gros coup pas coupé : presque mort', S.h.pv === 100 - REG.degats.grosCoup);
S = partie(); place(S, 200, 700); S.att = {type: 'grosCoup', t: 0, prep: 3.5, fin: 4.1}; avance(S, 1); P2.couper(S); avance(S, 3);
verif('coupé : aucun dégât, le bouton revient en 12 s', S.h.pv === 100 && S.couperT > 8);
verif('coupé, il ne recoupe pas tout de suite', (S.att = {type: 'grosCoup', t: 0, prep: 3.5, fin: 4.1}, !P2.couper(S)));
// les réparateurs
S = partie({facon: 'bouton'}); S.vie = 2600; place(S, 200, 700); S.reps = [{x: 300, y: 310, tx: 300, ty: 310, ok: true}]; avance(S, 2);
verif('un réparateur arrivé répare l\'armure', S.vie > 2650, Math.round(S.vie));
S.reps = [{x: 200, y: 700, tx: 300, ty: 310, ok: false}]; avance(S, 0.1);
verif('le héros casse un réparateur en le touchant', S.reps.length === 0);
// le symbole et la bulle
S = partie({facon: 'bouton', symbole: 0.25}); place(S, 200, 700); S.vie = 2260; avance(S, 3, {tirer: true});
verif('le symbole à 25 % : la bulle', S.phase === 'bulle' && S.symbole && S.vie === 2250, S.phase + ' ' + S.vie);
const v = S.vie; avance(S, 2, {tirer: true});
verif('sous la bulle, l\'armure ne perd plus rien', S.vie === v);
// la danse
while (S.danse.attente > 0) P2.pas(S, 1 / 60); const sur = P2.surDanse(S);
verif('la danse a commencé, la première bande sûre est celle du héros', sur === P2.bandeDe(S, S.h.x), sur);
S.h.invul = 0; place(S, L.solG + 5 + (L.solD - L.solG) / 4 * ((sur + 2) % 4), 700); const pv = S.h.pv; avance(S, 2.6);
verif('hors de la bande sûre, l\'explosion fait très mal', S.h.pv <= pv - REG.degats.bande || S.h.mort > 0, S.h.pv);
// le code
S = partie(); P2.symboleTout(S); verif('pas de code au début (Pisteur « au bouton »)', S.cri === null);
P2.pisteurCrie(S); P2.ouvrirCode(S); verif('la fenêtre : ralenti', S.lent === 1 && (P2.pas(S, 0.016), S.lent === REG.ralentiForce));
avance(S, 6); verif('le ralenti s\'arrête après sa durée, même fenêtre ouverte', S.lent === 1 && S.code.ouvert);
S.cri.forEach(s => P2.taper(S, s)); verif('le bon code : la pièce tombe, l\'armure au tiers suivant', S.phase === 'transfo' && S.vie === 2000);
avance(S, 4); verif('forme 2', S.forme === 2 && S.phase === 'combat');
// le Pisteur au minuteur
S = partie({pisteur: 10}); P2.symboleTout(S); avance(S, 9.5); verif('le Pisteur ne crie pas avant 10 s', !S.cri); avance(S, 1); verif('il crie à 10 s', !!S.cri);
// les remèdes
S = partie(); P2.aller(S, 2); S.attente = 999; S.att = {type: 'chaud', t: 1.5, prep: 1.2, fin: 5.7}; const vie2 = S.vie;
verif('chaud + glace : sonnée, gros dégâts', P2.remede(S, 'glace') && S.sonnee > 0 && S.vie === vie2 - REG.remedeBon);
S.att = {type: 'froid', t: 1.5, prep: 1.2, fin: 5.7}; P2.remede(S, 'glace');
verif('froid + glace : ça explose sur nous', S.h.pv === 100 - REG.degats.mauvaisRemede);
S = partie(); P2.aller(S, 2); S.attente = 999; S.att = {type: 'froid', t: 0, prep: 1.2, fin: 5.7}; avance(S, 6);
verif('froid sans remède : gelé', S.h.gel > 0 && S.h.pv === 100 - REG.degats.froid);
// les charges
S = partie(); P2.aller(S, 2); S.attente = 999; place(S, 100, 600); S.att = {type: 'charge', t: 0, prep: 0.8, fin: 4, orGauche: true, couleur: 'or'}; avance(S, 4.2);
verif('charge dorée, côté doré : bonus', S.h.pv === 100 && S.h.bonus > 0);
S = partie(); P2.aller(S, 2); S.attente = 999; place(S, 300, 600); S.att = {type: 'charge', t: 0, prep: 0.8, fin: 4, orGauche: true, couleur: 'or'}; avance(S, 4.2);
verif('charge dorée, côté rouge : touché', S.h.pv === 100 - REG.degats.charge);
// le bouclier qui renvoie
S = partie({facon: 'bouton'}); P2.aller(S, 3); S.attente = 999; place(S, 200, 700); S.bouc = {avant: 99, monte: 0, actif: 4}; const vie3 = S.vie; avance(S, 2, {tirer: true});
verif('le bouclier renvoie : l\'armure ne perd rien, le héros si', S.vie === vie3 && S.h.pv < 100, S.h.pv);
// la mort
S = partie({facon: 'bouton'}); S.vie = 2500; place(S, 200, 700); S.h.pv = 10; S.att = {type: 'grosCoup', t: 3.4, prep: 3.5, fin: 4.1}; avance(S, 3);
verif('mort avant son symbole : la forme recommence, armure à neuf', S.vie === 3000 && S.h.pv === 100 && S.stats.morts === 1);
S = partie(); P2.symboleTout(S); S.h.pv = 5; P2.pisteurCrie(S); S.danse.attente = 0; S.danse.pos = 0; S.danse.T = 1; S.danse.t = 0; place(S, 380, 700); avance(S, 3);
verif('mort sous la bulle : le code bloqué ~10 s', S.phase === 'bulle' && S.code.bloque > 8 && !P2.ouvrirCode(S));
// la potion
S = partie(); place(S, 100, 600); S.h.pv = 60; P2.potion(S); S.att = {type: 'poing', t: 1.5, cote: 'g', prep: 1.7, fin: 2.25}; avance(S, 3);
verif('un coup coupe la potion', S.h.pv === 15 && S.h.potion === 0, S.h.pv);
// la fin
S = partie(); P2.aller(S, 3); P2.symboleTout(S); P2.pisteurCrie(S); P2.ouvrirCode(S); S.cri.forEach(s => P2.taper(S, s)); avance(S, 5);
verif('le code de la forme 3 : l\'armure détruite, la fin', S.phase === 'fini' && S.vie === 0);
console.log(`\n${ok} sur ${ok + ko}`);
process.exit(ko ? 1 : 0);
