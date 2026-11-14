/* Le verrou des dialogues du Barde, enquête 3 (Romain, 12 novembre 2026, 21 h 44 : « tu verrouilles bien tous les dialogues. Je veux pas
   qu'il y ait d'anciens dialogues qui viennent se greffer là-dessus »).

   Cet outil ÉCRIT jeu/enquete3/E3-dialogues-et-trame.md à partir de jeu/src/e3.js : le fichier est le miroir exact de ce que dit le jeu.
   On ne le modifie jamais à la main. Pour changer un dialogue : le go de Romain, puis e3.js, puis relancer cet outil.
     node jeu/tools/e3-dialogues.js              → écrit le fichier
     node jeu/tools/e3-dialogues.js --verifier   → dit s'il est à jour (sinon : sortie 1)
   « node jeu/tools/verif.js 3 » (verif-e3.js) fait la même comparaison : un dialogue changé sans relancer l'outil se voit tout de suite. */
const fs = require('fs'), path = require('path'), vm = require('vm');
const SRC = path.join(__dirname, '..', 'src'), CIBLE = path.join(__dirname, '..', 'enquete3', 'E3-dialogues-et-trame.md');

function charger(){
  const ctx = {window:{}, console};
  vm.createContext(ctx);
  ['donnees.js', 'e3.js'].forEach(f => vm.runInContext(fs.readFileSync(path.join(SRC, f), 'utf8'), ctx));
  return {D:ctx.window.DONNEES, E:ctx.window.ENQUETES[3]};
}

function texte(E, D){
  const MOM = {matin:'le matin', apresmidi:'l\'après-midi', nuit:'la nuit'};
  const LIEU = {L1:'1, rue des Lanternes', L2:'chez Odette, 2, rue des Lanternes'};
  const lieu = l => LIEU[l] || l;
  const P = id => D.PNJ[id] || {};
  const nom = id => (P(id).court || P(id).nom || id);
  const liste = x => x == null ? [] : Array.isArray(x) ? x : [x];
  const nomCode = c => { const p = c.split(':'), I = p[0] === 'obj' ? (E.objets || {})[p[1]] : (E.infos || {})[p[1]]; return '« ' + ((I && I.nom) || c) + ' »' + (I && I.pour ? ' (pour ' + liste(I.pour).join(', ') + ')' : ''); };
  const L = [];
  const p = (...a) => L.push(...a);

  function cond(c){
    if(c.et) return c.et.map(cond).join(' ET ');
    if(c.ou) return '(' + c.ou.map(cond).join(' OU ') + ')';
    if(c.toutDit) return 'tout demandé à ' + c.toutDit.map(nom).join(', ') + ' (ceux à qui on peut parler à ce moment-là)';
    if(c.code) return 'le code ' + nomCode(c.code);
    if(c.vu){
      let m;
      if((m = /^barde:(\w+):(\d+)$/.exec(c.vu))) return 'la question ' + (+m[2] + 1) + ' de ' + nom(m[1]) + ' posée';
      if((m = /^verite:(\w+):(\d+)$/.exec(c.vu))) return nom(m[1]) + ' démasqué' + (/^(melusine|margot|iris)$/.test(m[1]) ? 'e' : '') + ' (question ' + (+m[2] + 1) + ')';
      if((m = /^fete:filet:(\w+)$/.exec(c.vu))) return nom(m[1]) + ' a craqué à la fête';
      if((m = /^grand:(\w+):fini$/.exec(c.vu))) return 'le grand dialogue « ' + m[1] + ' » fini (réussi ou raté)';
      return c.vu;
    }
    return JSON.stringify(c);
  }
  const besoin = b => liste(b).map(cond).join(' OU ');
  const quand = q => q.moments ? q.moments.map(m => MOM[m]).join(' et ') : 'quand on peut lui parler';

  p('# Enquête 3 « La lettre d\'Odette » — les dialogues du Barde (version 3, 12 novembre 2026 au soir)', '');
  p('> 🔒 **VERROUILLÉ PAR ROMAIN LE 12 NOVEMBRE 2026 À 21 H 44.** Ce fichier est le **miroir exact** de ce que dit le jeu. Il est écrit par `node jeu/tools/e3-dialogues.js`, à partir de `jeu/src/e3.js`. **On ne le modifie jamais à la main**, et on n\'y recolle aucun ancien dialogue. Pour changer une réplique : le « go » de Romain, puis `e3.js`, puis relancer l\'outil. `node jeu/tools/verif.js 3` met une croix si ce fichier et le jeu ne disent plus la même chose.');
  p('>');
  p('> **Changements faits depuis, chacun avec le « go » de Romain** : 13 novembre (Farinel et Iris à la fête ; plus de « Retenir le maire » ni de scène de Léo) ; 14 novembre, 10 h 29 (le maire inquiet, à la fête : le grand dialogue « amis », Bible §13.36) ; 14 novembre, 11 h 44 (le maire vient tout seul, sur des minuteurs cachés ; avec le bruit, il ne pose pas de question : Bible §13.38).');
  p('>');
  p('> **Ne font plus foi** (anciens dialogues, à ne plus jamais reprendre) : la version 2 du 11 novembre (`jeu/archives/E3-dialogues-et-trame-11-novembre.md`), celle du 6 novembre (`jeu/archives/E3-dialogues-et-trame-6-novembre.md`), le document du 5 novembre (https://claude.ai/artifact/969HCVUYL6F1BToNqhE2Lo), les pages « La lettre d\'Odette » (https://claude.ai/artifact/8tDtVAQEffoXqrxCvPhkfC) et « Dialogues du Barde » du 11 novembre (https://claude.ai/artifact/7e9Wm974Ux8D5Ta5Xcr3Ft), et « les 3 questions communes » du 12 novembre à 17 h (https://claude.ai/artifact/D3Ss7fQdWkCZCBvJjVtw4P).');
  p('>');
  p('> **Pour relire** : la page de Romain, avec des onglets (https://claude.ai/artifact/KpEtFyE3zCWVN4mmEMfyCv), et le scénario (https://claude.ai/artifact/Ya2t6QJG6zsqQ9s96xjFtM). En cas de différence, c\'est le jeu (et donc ce fichier) qui a raison.', '');

  p('## 0. Les règles (décidées par Romain le 12 novembre)', '');
  p('- **Le scénario.** Le maire a fait écrire une fausse lettre « d\'Odette ». Un homme en cape a forcé Mélusine à l\'écrire, en imitant l\'écriture d\'Odette ; c\'est elle qui l\'a déposée à l\'aube, dans un châle à chats. L\'homme en cape, c\'est Léo, l\'apprenti du meunier : **son nom n\'est dit nulle part avant la nuit**. Plus de lavande, plus de « minuit », plus de grosses bottes.');
  p('- **Les mêmes questions pour tous** : 1 la lettre, 2 Odette, 3 la nuit, 4 une question sur son métier. Puis, chez quelques-uns, une question qui s\'ouvre plus tard. L\'ordre ne change jamais (le jeu s\'en sert).');
  p('- **Plus de limite à deux questions.** Ce qui limite : la moitié du village est occupée à chaque moment. Quand on a tout demandé à quelqu\'un, il le dit avec humour (sa phrase « tout demandé »).');
  p('- **Les grands dialogues** (le maire, Anselme) ne s\'ouvrent qu\'une fois **tout demandé** à tout le monde. Ils ne s\'affichent pas comme les autres : violets, « 🎭 Grande conversation », un reflet qui passe, une fenêtre à bandeau ; « 🎭 » se pose sur le visage du villageois, sur la carte. Un seul essai. Celui à qui on ne peut pas parler à ce moment-là (occupé, ailleurs, fâché) ne bloque pas.');
  p('- **Chez Anselme, les quatre choix sont en majuscules** : la bonne réponse ne se voit plus à l\'œil.');
  p('- **🤥** : le villageois ment. On le démasque avec « Mensonge ? », sous sa dernière réponse (règle de l\'enquête 2).');
  p('- **La grille du clocher grince.** Pour l\'ouvrir sans bruit : ni tirer, ni pousser — **soulever** (Silas le dit). Le geste est construit depuis le 13 novembre, chez le Pisteur (Bible §13.34) : tirer ou pousser, « un énorme bruit s\'est entendu dans tout le village ».');
  p('- **Le maire inquiet, à la fête** (Romain, 14 novembre, 10 h 29 puis 11 h 44 ; Bible §13.36 et §13.38). En ouvrant le passage, le Pisteur a un code pour le Barde : la grille soulevée, la grille qui a fait du bruit, ou le puits. Dès que le Barde entre ce code, **un minuteur caché démarre** (rien ne s\'affiche). Au bout du temps, la fenêtre du maire s\'ouvre **toute seule**, avec un petit son, **par-dessus tout** (§3, « amis »). Sans bruit (ou par le puits) : il demande où sont ses amis, et le Barde essaie de le retenir ; après chaque bonne réponse, un nouveau minuteur, et il revient. **Avec le bruit : aucune réponse possible**, il prévient seulement qu\'il va voir. **Il ne dit jamais « clocher » de lui-même** : seulement en partant, après une mauvaise réponse. **Ça ne change rien à la fin** : c\'est pour occuper le Barde, le maire descendra dans tous les cas.', '');

  p('## 1. Le début', '');
  p('**' + E.lettreLue.titre + '**', '', '> ' + E.lettre, '', 'Puis : « ' + E.lettreLue.apres + ' »', '');
  p('**La mission du Barde, à l\'écran des missions** : ' + E.missionsMaire.barde, '', '**Dans son Carnet** : ' + E.missions.barde, '');
  p('### Le marché aux fleurs (le matin)', '');
  const Ma = E.marche;
  p('- **Le maire** arrive tout seul : « ' + Ma.maire.t + ' » (bouton : ' + Ma.maire.bouton + ')');
  if(Ma.maire.rappel) p('- **Trois secondes après**, le maire revient dire un mot : « ' + Ma.maire.rappel + ' »');
  p('- **Fortuné**, d\'abord (Iris et Basile ne se voient qu\'une fois son marchandage commencé) :');
  Ma.fortune.etapes.forEach((e, k) => {
    p('  - Étape ' + (k + 1) + (e.t ? ' — « ' + e.t + ' »' : e.illu ? ' — une image : la carriole, la bâche soulevée (aucun texte)' : '') + (k === 1 ? ' La relance d\'avant : « ' + Ma.fortune.relance + ' »' : ''));
    e.choix.forEach(c => {
      const fin = c.fin ? ' → marché conclu : ' + c.fin.or + ' pièces' + (c.fin.lanterne ? ', avec la lanterne' : '') : c.reste ? ' → on reste là, ce choix disparaît' : ' → étape suivante' + (c.sait ? ' (il a compris que tu veux la lanterne)' : '');
      p('    - « ' + c.q + ' » → « ' + c.r + ' »' + fin + (c.siSait ? ' · s\'il a compris : « ' + c.siSait.r + ' » → ' + c.siSait.fin.or + ' pièces' + (c.siSait.fin.lanterne ? ', avec la lanterne' : '') : ''));
    });
  });
  p('  - Se plaindre des fleurs en papier, plus tard : « ' + Ma.fortune.plainte + ' »');
  p('- Chez le premier vrai fleuriste : « ' + Ma.dechire + ' »');
  Object.keys(Ma.vendeurs).forEach(id => {
    const V = Ma.vendeurs[id];
    p('- **' + nom(id) + '** : « ' + V.t + ' »');
    V.choix.forEach(c => p('  - « ' + c.q + ' » → « ' + c.r + ' »' + (c.prix ? ' → ' + c.prix + ' pièce le bouquet' : '') + (c.cadeau ? ' → ' + c.cadeau + ' bouquets en cadeau' : '') + (c.fache ? ' → fâché, plus de fleurs' : '')));
    p('  - Après la vente : « ' + V.merci + ' »');
  });
  p('- **L\'après-midi, le maire compte** : « ' + Ma.retour.accueil + ' »');
  const HUM = {fache:'pas content', satisfait:'content', ravi:'ravi', saisi:'saisi'};
  if(Ma.retour.parfait) p('  - ' + (Ma.retour.parfait.min || 11) + ' bouquets ou plus ET la lanterne (il est ' + (HUM[Ma.retour.parfait.humeur] || 'ravi') + ') : « ' + Ma.retour.parfait.t + ' »');
  Ma.retour.paliers.forEach(x => p('  - ' + x.min + ' bouquets ou plus' + (x.humeur ? ' (il est ' + (HUM[x.humeur] || x.humeur) + ')' : '') + ' : « ' + x.t + ' » (' + x.or + ' pièces d\'or)'));
  p('  - Avec la lanterne, dans une deuxième fenêtre' + (Ma.retour.lanterne.recit ? ' — un aparté : ' + Ma.retour.lanterne.recit + ' Puis' : '') + ' : « ' + Ma.retour.lanterne.t + ' » (' + Ma.retour.lanterne.or + ' pièces d\'or de plus)', '');

  function villageois(id){
    const N = E.pnj[id];
    const ou = Object.keys(N.ou || {}).map(m => MOM[m] + ' : ' + lieu(N.ou[m])).join(' · ');
    p('### ' + (P(id).ic || '') + ' ' + (id === 'voisin' ? 'La maison d\'Odette' : (P(id).nom || id)) + (P(id).metier && id !== 'voisin' ? ' — ' + P(id).metier : ''), '');
    p('- **Où et quand** : ' + ou);
    if(N.salut) p('- **Bonjour** : « ' + N.salut + ' »');
    (N.questions || []).forEach((q, i) => {
      if(q.grand){ p((i + 1) + '. 🎭 **« ' + q.q + ' »** — le grand dialogue « ' + q.grand + ' » (§3), ' + quand(q) + '. Il n\'apparaît que quand : ' + besoin(q.besoin) + '.'); return; }
      p((i + 1) + '. **' + q.q + '**' + (q.besoin ? ' — 🔒 s\'ouvre avec : ' + besoin(q.besoin) : '') + ' _(' + quand(q) + ')_');
      p('   - ' + (q.ment ? '🤥 ' : '') + '« ' + q.a + ' »' + (q.donne ? ' → donne ' + liste(q.donne).map(nomCode).join(' et ') : ''));
      if(q.ment) p('   - 🔍 démasqué : « ' + q.vrai + ' »' + (q.donneVrai ? ' → donne ' + liste(q.donneVrai).map(nomCode).join(' et ') : ''));
    });
    if(E.impatience && E.impatience[id]) p('- **Tout demandé** : « ' + E.impatience[id] + ' »');
    Object.keys(N.occupe || {}).forEach(m => { if(m === 'nuit' && E.fete && E.fete.gens[id]) return; p('- **Occupé, ' + MOM[m] + '** : ' + liste(N.occupe[m]).join(' — puis, si on revient : ')); });
    p('');
  }
  const premier = id => E.moments.find(m => (E.pnj[id].ou || {})[m]);
  p('## 2. Les villageois', '');
  E.moments.forEach(m => {
    const ids = Object.keys(E.pnj).filter(id => premier(id) === m);
    if(!ids.length) return;
    p('## 2.' + (E.moments.indexOf(m) + 1) + ' Ceux qui répondent dès ' + MOM[m], '');
    ids.forEach(villageois);
  });

  p('## 3. Les grands dialogues (un seul essai)', '');
  Object.keys(E.grands).forEach(g => {
    const X = E.grands[g];
    if(X.scene) return;
    p('### 🎭 « ' + g + ' » — ' + (P(X.pnj).nom || X.pnj), '');
    /* (14 novembre, 11 h 44) un grand dialogue à minuteurs cachés : on n'y entre pas par une question, il vient tout seul */
    const min = s => (s / 60) + ' minute' + (s >= 120 ? 's' : '');
    if(X.attente){
      p('_La nuit. Il s\'ouvre tout seul, avec un petit son, par-dessus tout : ' + min(X.attente.debut) + ' après que le Barde a entré ' + besoin(X.attente.si) + '. Le minuteur est caché : rien ne l\'annonce (ni compte à rebours, ni mission, ni rond sur ' + nom(X.pnj) + ')._', '');
      if(X.sansReponse) p('**Avec ' + besoin(X.sansReponse.si) + '** — aucune réponse possible, un seul bouton « D\'accord » : ' + X.sansReponse.t + ' (et c\'est fini)', '', '**Sinon** — il pose ses questions, et on ne peut pas fermer la fenêtre sans répondre :', '');
    }
    X.etapes.forEach((e, k) => {
      p('**Étape ' + (k + 1) + '**' + (X.attente && k ? ' (' + min(X.attente.suite) + ' après la bonne réponse d\'avant : la fenêtre se rouvre toute seule)' : '') + ' — « ' + e.t + ' »', '');
      e.choix.forEach(c => p('- ' + (c.bon ? '✅' : c.piege ? '🪤 (le piège)' : '❌') + ' « ' + c.q + ' »' + (c.r ? ' → ' + (/«/.test(c.r) ? c.r : '« ' + c.r + ' »') : '') + (c.n ? ' ' + c.n : '')));
      p('');
    });
    if(X.rate) p('- **Après un mauvais choix** : ' + (/«/.test(X.rate) ? X.rate : '« ' + X.rate + ' »') + ' (et c\'est fini)');
    if(X.fete && !X.reussi && !X.echec) p('- **Réussi ou raté : aucun code.** La fin de l\'enquête ne change pas.');
    if(X.reussi) p('- **Réussi** : bouton « ' + X.reussi.bouton + ' » → « ' + X.reussi.titre + ' » : ' + X.reussi.t + ' → code ' + nomCode(X.reussi.code));
    if(X.piege) p('- **Le piège** : bouton « ' + X.piege.bouton + ' » → « ' + X.piege.titre + ' » : ' + X.piege.t + ' → code ' + nomCode(X.piege.code));
    if(X.echec) p('- **Raté** : bouton « ' + X.echec.bouton + ' » → « ' + X.echec.titre + ' » : ' + X.echec.t + ' → code ' + nomCode(X.echec.code));
    Object.keys(X.resume || {}).forEach(k => p('- Dans le Carnet (' + k + ') : ' + X.resume[k]));
    if(X.sansReponse && X.sansReponse.resume) p('- Dans le Carnet (sans réponse possible) : ' + X.sansReponse.resume);
    p('');
  });

  p('## 4. La nuit', '');
  p('### 🎉 La fête, sur la place', '', 'Chacun dit une réplique, autant de fois qu\'on veut.', '');
  Object.keys(E.fete.gens).forEach(id => {
    const x = E.fete.gens[id];
    p('- **' + nom(id) + '** : « ' + x.t + ' »' + (x.note ? ' _(noté dans le Carnet)_' : ''));
    if(x.filet) p('  - **Le filet** (si son aveu n\'a pas été obtenu l\'après-midi) : « ' + x.filet.t + ' » → code ' + nomCode(x.filet.code));
    Object.keys(E.grands).filter(g => E.grands[g].attente && E.grands[g].pnj === id).forEach(g => p('  - 🎭 **Plus tard, il vient trouver le Barde tout seul** : le grand dialogue « ' + g + ' » (§3), sur un minuteur caché.'));
  });
  p('');
  /* (13 novembre, Bible §13.33) l'aide pour le donjon : les nouvelles questions de Farinel et d'Iris, pendant le combat contre Léo */
  const aides = Object.keys(E.fete.gens).filter(id => E.fete.gens[id].aide);
  if(aides.length){
    p('### 🧥 L\'aide pour le donjon : pendant le combat contre l\'homme en cape', '', 'Quand le Pisteur entre dans la dernière salle, il donne le code ' + nomCode(E.fete.gens[aides[0]].aide.si) + '. À la fête, ces villageois portent alors un « ❗ » : ils ont de nouvelles questions. Le Barde lit les réponses à voix haute pendant que le Pisteur se bat, et il peut les relire.', '');
    aides.forEach(id => {
      const a = E.fete.gens[id].aide;
      p('**' + nom(id) + '** — « ' + a.t + ' »', '');
      a.questions.forEach(q => p('- « ' + q.q + ' » → « ' + q.r + ' »'));
      if(a.note) p('- Dans le Carnet : ' + a.note);
      p('');
    });
  }
  p('## 5. Les écoutes aux portes (talent « Tendre l\'oreille »)', '');
  E.moments.forEach(m => {
    p('**' + MOM[m].charAt(0).toUpperCase() + MOM[m].slice(1) + '**', '');
    (E.bribes || []).filter(b => (b.moments || []).indexOf(m) >= 0).forEach(b => {
      p('- _' + b.titre + '_ (' + lieu(b.lieu) + ') :');
      b.phrases.forEach(x => p('  - ' + nom(x.qui) + ' : « ' + x.texte + ' »'));
      p('  - Dans le Carnet : ' + b.t);
    });
    Object.keys(E.portes || {}).forEach(id => { if(E.portes[id][m]) p('- ' + nom(id) + ', tout seul derrière sa porte : ' + E.portes[id][m]); });
    p('');
  });

  p('## 6. Les missions du Barde, dans son Carnet', '');
  E.etapes.barde.forEach(e => p('- ' + (e.ic || (e.piste ? '💡' : '')) + ' ' + e.t + (e.des !== undefined ? ' _(arrive ' + MOM[E.moments[e.des]] + ')_' : '')));
  p('');

  p('## 7. Ce qui n\'est PAS encore construit (le reste du nouveau scénario)', '');
  p('Les dialogues du Barde suivent le nouveau scénario. Depuis le 13 novembre (Bible §13.32 et §13.34), le Sage, l\'Alchimiste et le Pisteur aussi, en partie. Ce qui reste, tant que Romain n\'a pas donné son « go » :', '');
  p('- **Le Pisteur** : les empreintes de pieds d\'enfant chez Iris et derrière l\'atelier de Mélusine ; la clé prise à la ceinture d\'Anselme (le dessin du mini-jeu la montre encore au clou). (Fait le 14 novembre, Bible §13.36 et §13.38 : le bruit de la grille donne un code au Barde, et le maire inquiet vient le trouver tout seul, sur des minuteurs cachés.)');
  p('- **Le Sage** : les pointures dans le registre. (Fait le 13 novembre : le Livre d\'or, dans son Grand Livre, laisse deux suspectes, Mélusine ou Margot ; le Barde les accuse toutes les deux, une seule ment.)');
  p('- **L\'Alchimiste** : comparer l\'encre de la lettre avec celle d\'Iris ; le labo montre encore du pollen de lavande.');
  p('- **Le donjon** : le code de la Grosse Marie, gardé en réserve, n\'est plus donné par personne. (Fait le 13 novembre, Bible §13.33 : Léo, le boss final ; « Retenir le maire » et la scène provisoire de Léo sont retirés ; la fin est celle décidée par Romain — Odette reste derrière la porte.)');
  p('- **La Grosse Marie et la brume** (l\'Alchimiste qui cueille pendant que la brume recule) : à décider avec la tisane d\'Anselme, validée le 12 novembre à 15 h 39.');
  p('- La quatrième écoute de la fête (« au pied du mât »), qui dépend de la grille.', '');
  return L.join('\n');
}

module.exports = {texte, charger, CIBLE};
if(require.main === module){
  const {E, D} = charger(), t = texte(E, D), avant = fs.existsSync(CIBLE) ? fs.readFileSync(CIBLE, 'utf8') : '';
  if(process.argv.includes('--verifier')){
    if(avant === t){ console.log('E3-dialogues-et-trame.md est le miroir exact des dialogues du jeu.'); process.exit(0); }
    console.log('✗ E3-dialogues-et-trame.md et le jeu ne disent pas la même chose : relancer « node jeu/tools/e3-dialogues.js » (après le go de Romain pour le changement).'); process.exit(1);
  }
  fs.writeFileSync(CIBLE, t);
  console.log((avant === t ? 'Déjà à jour : ' : 'Écrit : ') + path.relative(process.cwd(), CIBLE) + ' (' + t.split('\n').length + ' lignes)');
}
