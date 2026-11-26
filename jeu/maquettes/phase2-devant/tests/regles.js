/* Les règles de la version 2, scène par scène (sans page) : node tests/regles.js */
'use strict';
require('../src/regles.js');
const P2 = globalThis.P2, R = P2.REG;
let ok = 0, ko = 0;
function verif(nom, c, info) { if (c) ok++; else ko++; console.log((c ? 'OK   ' : 'RATÉ ') + nom + (info !== undefined ? '  (' + info + ')' : '')); }
function partie(r, tiers) { const S = P2.nouvelle(Object.assign({pisteur: 0}, r || {}), 7); if (tiers) P2.aller(S, tiers); S.prochaine = 999; S.t3 = {rayon: 999, coque: 999, danse: 999, crev: 999}; return S; }
function avance(S, s, e) { for (let i = 0; i < Math.round(s * 60); i++) P2.pas(S, 1 / 60, e); }
function place(S, x, y) { S.h.x = x; S.h.y = y; }
const BOUGE = {mx: 1, my: 0};

// les sorts
let S = partie(); place(S, 7, 7);
verif('on ne commence pas un sort en bougeant', (P2.pas(S, 1 / 60, BOUGE), !P2.lancer(S, 'feu')));
S = partie(); place(S, 7, 7); P2.lancer(S, 'glace'); avance(S, 1.4); verif('le javelot met 1,5 s à partir', S.tirs.length === 0);
avance(S, 1.2); verif('le javelot fait 10 à l\'armure', S.vie === 990, S.vie);
S = partie(); place(S, 7, 7); P2.lancer(S, 'feu'); avance(S, 3.8); verif('la boule de feu fait 50 en 3 s', S.vie === 950, S.vie);
S = partie(); place(S, 7, 7); P2.lancer(S, 'feu'); avance(S, 1); P2.pas(S, 1 / 60, BOUGE); verif('bouger coupe le sort', !S.h.lance && S.stats.coupes === 1);
S = partie(); place(S, 7, 7); S.h.pv = 30; P2.lancer(S, 'soin'); avance(S, 2.05); verif('le soin rend 50 en 2 s', S.h.pv === 80, S.h.pv);
// un gros coup coupe, les dégâts continus non
S = partie(); place(S, 3, 7); P2.lancer(S, 'feu'); S.crepite = {cote: 'g', t: 2.9}; avance(S, 0.2);
verif('les crépitements : 60 et le sort coupé', S.h.pv === 40 && !S.h.lance, S.h.pv);
S = partie(); place(S, 10, 7); S.crepite = {cote: 'g', t: 2.5}; avance(S, 1); verif('l\'autre moitié ne prend rien', S.h.pv === 100);
// les colonnes
S = partie(); place(S, 7, 7); S.ombres = [{x: 7, y: 7, t: 1.5}]; avance(S, 0.6);
verif('une colonne sur la tête : 60, puis elle reste debout', S.h.pv === 40 && S.colonnes.length === 1, S.h.pv);
verif('le héros est poussé hors de la colonne', P2.d2(S.h.x, S.h.y, 7, 7) >= R.colonnes.r + R.heros.r - 0.01);
S = partie(); place(S, 7, 8); S.colonnes = [{x: 7, y: 5}]; P2.lancer(S, 'feu'); avance(S, 4);
verif('une colonne bloque le sort (rien sur l\'armure)', S.vie === 1000 && S.taches.length === 1);
// le tirage
S = partie(); let suite = [], trois = false;
for (let i = 0; i < 400; i++) { S.prochaine = 0; P2.pas(S, 1 / 60); const d = S.derniers; if (d.length >= 3 && d[d.length - 1] === d[d.length - 2] && d[d.length - 2] === d[d.length - 3]) trois = true; S.crepite = null; S.ombres = []; S.vague = null; S.reps = []; if (S.colonnes.length > 10) S.colonnes = S.colonnes.slice(0, 3); }
verif('jamais trois fois de suite la même attaque', !trois);
S = partie(); S.colonnes = []; for (let i = 0; i < 50; i++) { S.prochaine = 0; P2.pas(S, 1 / 60); if (S.vague) break; S.crepite = null; S.ombres = []; S.colonnes = []; S.reps = []; }
verif('pas de vague sans colonne au sol', !S.vague);
// la vague
S = partie(); place(S, 7, 7.1); S.colonnes = [{x: 7, y: 5.8}, {x: 3, y: 6}]; P2.pas(S, 0.001); S.vague = null;
(function () { S.derniers = []; const L = S.colonnes; S.prochaine = 999; })();
S.forcer = 'vague'; S.prochaine = 0; P2.pas(S, 1 / 60);
verif('la vague part', !!S.vague);
const abri = S.vague.abris[0]; place(S, abri.x, abri.y); avance(S, 6.6);
verif('caché juste derrière une colonne : aucune brûlure', S.h.pv === 100, S.h.pv);
verif('la vague détruit toutes les colonnes, puis les ombres reviennent', S.colonnes.length === 0 && S.forcer === 'colonnes');
S = partie(); place(S, 10, 8); S.colonnes = [{x: 3, y: 6}]; S.forcer = 'vague'; S.prochaine = 0; avance(S, 7);
verif('prise en plein : 90 (trois tics de 30)', S.h.pv === 10, S.h.pv);
S = partie(); place(S, 10, 8); S.colonnes = [{x: 3, y: 6}]; S.forcer = 'vague'; S.prochaine = 0; avance(S, 2.5); P2.lancer(S, 'glace'); avance(S, 0.9);
verif('les flammes ne coupent pas le sort', !!S.h.lance && S.h.pv < 100);
// les réparateurs
S = partie(); S.reps = [{x: 0.45, y: 6.2}]; let t = 0; while (S.reps.length && t < 15) { P2.pas(S, 1 / 60); t += 1 / 60; }
S.vie = 900; S.reps = [{x: 0.45, y: 6.2}]; t = 0; while (S.reps.length && t < 15) { P2.pas(S, 1 / 60); t += 1 / 60; }
verif('un réparateur arrive en ~5 s et rend 50', S.vie === 950 && t > 4 && t < 7, t.toFixed(1) + ' s');
S = partie(); place(S, 7, 8); S.reps = [{x: 0.45, y: 6.2}]; P2.viser(S, 0.5, 6.2); P2.lancer(S, 'glace'); avance(S, 2.5);
verif('toucher un réparateur le vise ; un javelot le casse', S.reps.length === 0 && S.vie === 1000);
S = partie(); S.reps = [{x: 3, y: 6}]; S.ombres = [{x: 3, y: 6, t: 1.9}]; avance(S, 0.2); verif('une colonne écrase un réparateur', S.reps.length === 0);
S = partie(); P2.symboleTout(S); S.reps = [{x: 7, y: 2.6}]; avance(S, 2);
verif('sous la bulle, il met ses 50 de côté', S.reserve === 50);
P2.pisteurCrie(S); P2.ouvrirCode(S); S.cri.forEach(s => P2.taper(S, s)); avance(S, 3);
verif('… et le tiers suivant a 1050', S.tiers === 2 && S.vieMax === 1050, S.vieMax);
// les mains
S = partie({}, 2); place(S, 7, 7); S.main = {type: 'givre', t: 0, cx: null, cy: null}; avance(S, 3);
const x0 = S.h.x; avance(S, 1, BOUGE); verif('le givre ralentit de 60 %', Math.abs((S.h.x - x0) - 3.6 * 0.4) < 0.25, (S.h.x - x0).toFixed(2));
place(S, 7, 7); P2.pas(S, 1 / 60); P2.lancer(S, 'feu'); avance(S, 4); verif('la boule de feu fait fondre le givre (et 50 à l\'armure)', !S.main && S.vie === 950, S.vie);
S = partie({}, 2); place(S, 7, 7); S.main = {type: 'givre', t: 0, cx: null, cy: null}; avance(S, 11.2); verif('le givre pas arrêté éclate : 60', S.h.pv === 40, S.h.pv);
S = partie({}, 2); place(S, 7, 7); S.main = {type: 'braise', t: 0, cx: null, cy: null}; avance(S, 3); const pvB = S.h.pv;
P2.lancer(S, 'glace'); avance(S, 2.2); verif('la pierre brûlante : 5 par seconde, arrêtée par le javelot', !S.main && pvB <= 92 && pvB >= 88, pvB);
// les orbes
S = partie({}, 2); place(S, 7, 4); S.orbe = {x: 7, y: 4, couleur: 'or', t: 0, porte: false}; avance(S, 0.8);
verif('on ramasse l\'orbe', S.orbe && S.orbe.porte);
place(S, 1.2, 5.6); avance(S, 0.1); verif('à la bonne lanterne : bonus 15 s', !S.orbe && S.h.bonus > 14);
place(S, 7, 7); P2.lancer(S, 'feu'); avance(S, 3.8); verif('avec le bonus, la boule de feu fait 100', S.vie === 900, S.vie);
S = partie({}, 2); S.orbe = {x: 7, y: 4, couleur: 'or', t: 0, porte: false}; place(S, 7, 4); avance(S, 0.8); place(S, 12.8, 5.6); avance(S, 0.1);
verif('à la mauvaise lanterne : 20, pas de bonus', S.h.pv === 80 && S.h.bonus === 0);
S = partie({}, 2); place(S, 7, 8); S.orbe = {x: 3, y: 3, couleur: 'rouge', t: 0, porte: false}; avance(S, 10.8);
verif('pas rapportée en 10 s : elle explose, 20, à travers tout', S.h.pv === 80 && !S.orbe);
S = partie({}, 2); S.orbe = {x: 5, y: 4, couleur: 'or', t: 1, porte: false}; S.ombres = [{x: 5, y: 4, t: 1.95}]; avance(S, 0.1);
verif('une colonne projette l\'orbe sur le côté', S.orbe && P2.d2(S.orbe.x, S.orbe.y, 5, 4) > 1);
// le troisième tiers
S = partie({}, 3); place(S, 7, 7); S.doigts = [{lignes: [Math.PI / 2], t: 1.9}]; avance(S, 0.2); verif('sur une ligne des doigts : 60', S.h.pv === 40);
S = partie({}, 3); place(S, 9, 7); S.doigts = [{lignes: [Math.PI / 2], t: 1.9}]; avance(S, 0.2); verif('entre les lignes : rien', S.h.pv === 100);
S = partie({}, 3); S.vie = 500; S.rayon = {couleur: 'or', t: 0}; place(S, 7, 8); avance(S, 2.9); const v0 = S.vie; avance(S, 2);
verif('le rayon : 3 s de répit, puis Grosbec reprend 10 par seconde', v0 === 500 && Math.abs(S.vie - 520) < 1.5, S.vie.toFixed(1));
S = partie({}, 3); S.vie = 500; S.rayon = {couleur: 'or', t: 3}; const Lt = R.lanternes.or; place(S, (Lt[0] + 7) / 2, (Lt[1] + 0.9) / 2); avance(S, 2);
verif('dans le rayon : 15 par seconde pour nous, rien pour lui', S.vie === 500 && S.h.pv >= 69 && S.h.pv <= 71, S.h.pv);
S = partie({}, 3); place(S, 7, 7); S.coque = {pv: 50, t: 0}; P2.lancer(S, 'glace'); avance(S, 2.5);
verif('la coque prend les coups à la place de Grosbec', S.vie === 1000 && S.coque.pv === 40);
avance(S, 6); verif('pas cassée en 8 s : 60 dans toute la salle', S.h.pv === 40 && !S.coque, S.h.pv);
S = partie({}, 3); place(S, 7, 9.5); S.danse = {t: 0, k: 0, st: 0, motif: [0, 1, 2, 3, 4], explose: false}; avance(S, 2.6);
verif('la danse : hors de l\'anneau sûr, 30', S.h.pv === 70, S.h.pv);
// les crevasses
S = partie({}, 3); place(S, 5, 6); S.crevasses = [{ax: 6, ay: 4, bx: 6, by: 9}]; avance(S, 2, BOUGE);
verif('une crevasse bloque comme un mur', S.h.x < 6 - 0.7 + 0.05, S.h.x.toFixed(2));
P2.sauter(S, 1, 0); avance(S, 0.5); verif('le saut la franchit', S.h.x > 6.7, S.h.x.toFixed(2));
S = partie({}, 3); place(S, 3.5, 6); S.crevasses = [{ax: 6, ay: 4, bx: 6, by: 9}]; P2.sauter(S, 1, 0); avance(S, 0.5);
verif('un saut trop court s\'arrête au bord', S.h.x < 6 - 0.7 + 0.05 && S.h.x > 4.5, S.h.x.toFixed(2));
S = partie({}, 3); for (let i = 0; i < 20; i++) { S.t3.crev = 0; P2.pas(S, 1 / 60); S.fentes.forEach(f => f.t = 9); P2.pas(S, 1 / 60); S.t3.crev = 999; }
const entre = S.crevasses.filter(k => { function c(ax, ay, bx, by, px, py) { return (bx - ax) * (py - ay) - (by - ay) * (px - ax); } const a = R.lanternes.or, b = R.lanternes.rouge; return c(a[0], a[1], b[0], b[1], k.ax, k.ay) * c(a[0], a[1], b[0], b[1], k.bx, k.by) < 0 && c(k.ax, k.ay, k.bx, k.by, a[0], a[1]) * c(k.ax, k.ay, k.bx, k.by, b[0], b[1]) < 0; }).length;
verif('trois crevasses au plus, deux au plus entre les lanternes', S.crevasses.length <= 3 && entre <= 2, S.crevasses.length + ' / ' + entre);
// la mort
S = partie(); S.vie = 700; place(S, 3, 7); S.h.pv = 30; S.crepite = {cote: 'g', t: 2.95}; avance(S, 0.1);
verif('mort : l\'armure garde sa vie', S.h.mort > 9 && S.vie === 700);
S.prochaine = 0; S.derniers = []; for (let i = 0; i < 30; i++) { S.prochaine = 0; P2.pas(S, 1 / 60); S.crepite = null; S.ombres = []; }
verif('pendant la mort, aucun nouveau réparateur', S.reps.length === 0);
avance(S, 10); verif('réapparu après 10 s, intouchable 4 s', S.h.mort === 0 && S.h.pv === 100 && S.h.intouchable > 3);
// rien ne tue d'un coup
verif('rien ne tue d\'un coup (gros coup 60, anneau 30, orbe 20)', R.gros < 100 && R.danse.degat < 100 && R.orbe.degat < 100);
// la bulle, le code
S = partie({accel: 4}); P2.symboleTout(S); verif('sous la bulle : 4 s au départ', P2.intervalle(S) === 4);
S.bulleT = 120; verif('3 s au bout de 2 minutes', Math.abs(P2.intervalle(S) - 3) < 1e-9); S.bulleT = 300; verif('2 s au bout de 4 minutes', P2.intervalle(S) === 2);
S = partie({pisteur: 20}); P2.symboleTout(S); avance(S, 19.5); verif('le faux Pisteur crie à 20 s', !S.cri); avance(S, 1); verif('… le voilà', !!S.cri);
P2.ouvrirCode(S); P2.pas(S, 1 / 60); verif('la fenêtre du code : ralenti', S.lent < 1);
S = partie({}, 3); P2.symboleTout(S); P2.pisteurCrie(S); P2.ouvrirCode(S); S.cri.forEach(s => P2.taper(S, s)); avance(S, 4);
verif('le code du troisième tiers : l\'armure détruite, la fin', S.phase === 'fini');
console.log(`\n${ok} sur ${ok + ko}`);
process.exit(ko ? 1 : 0);
