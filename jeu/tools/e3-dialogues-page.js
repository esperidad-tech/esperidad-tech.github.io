/* La page à onglets des dialogues du Barde, enquête 3 (pour Romain : https://claude.ai/artifact/KpEtFyE3zCWVN4mmEMfyCv).
   Comme E3-dialogues-et-trame.md (tools/e3-dialogues.js), elle est ÉCRITE à partir de jeu/src/e3.js : elle montre ce que dit le jeu,
   rien d'autre. On ne la retouche pas à la main.
     node jeu/tools/e3-dialogues-page.js <sortie.html> ["sous-titre"]
   L'habillage (couleurs, fiches repliables) est dans jeu/enquete3/outils-page-E3/dialogues-gabarit.html. */
const fs = require('fs'), path = require('path');
const {charger} = require('./e3-dialogues.js');
const GABARIT = path.join(__dirname, '..', 'enquete3', 'outils-page-E3', 'dialogues-gabarit.html');

function page(E, D, sous){
  const MOM = {matin:'le matin', apresmidi:'l\'après-midi', nuit:'la nuit'};
  const LIEU = {L1:'1, rue des Lanternes', L2:'2, rue des Lanternes', boulangerie:'la boulangerie', taverne:'la taverne', poste:'la poste', place:'la place', clocher:'le clocher', mairie:'la mairie',
    atelier:'son atelier', herboristerie:'l\'herboristerie', moulin:'le moulin', ruelle:'la ruelle des Brumes'};
  const e = s => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const P = id => D.PNJ[id] || {};
  const nom = id => P(id).court || P(id).nom || id;
  const liste = x => x == null ? [] : Array.isArray(x) ? x : [x];
  const lieu = l => LIEU[l] || l;
  const dit = t => /«/.test(t) ? e(t) : '« ' + e(t) + ' »';
  const nomCode = c => { const p = c.split(':'), I = p[0] === 'obj' ? (E.objets || {})[p[1]] : (E.infos || {})[p[1]]; return '« ' + ((I && I.nom) || c) + ' »' + (I && I.pour ? ' pour ' + liste(I.pour).map(r => r === 'sage' ? 'le Sage' : r === 'pisteur' ? 'le Pisteur' : r === 'alchimiste' ? 'l\'Alchimiste' : 'le Barde').join(' et ') : ''); };
  function cond(c){
    if(c.et) return c.et.map(cond).join(', ET ');
    if(c.ou) return c.ou.map(cond).join(' (ou ') + (c.ou.length > 1 ? ')' : '');
    if(c.toutDit) return 'tout demandé à ' + c.toutDit.map(nom).join(', ');
    if(c.code) return 'le code ' + nomCode(c.code).replace(/ pour .*/, '');
    let m;
    if(c.vu && (m = /^barde:(\w+):(\d+)$/.exec(c.vu))) return 'sa réponse à la question ' + (+m[2] + 1);
    if(c.vu && (m = /^verite:(\w+):(\d+)$/.exec(c.vu))) return 'l\'aveu de ' + nom(m[1]);
    if(c.vu && (m = /^fete:filet:(\w+)$/.exec(c.vu))) return nom(m[1]) + ' a craqué à la fête';
    if(c.vu && (m = /^grand:(\w+):fini$/.exec(c.vu))) return 'le grand dialogue d\'Anselme fini (réussi ou raté)';
    return JSON.stringify(c);
  }
  const besoin = b => liste(b).map(cond).join(' OU ');
  const tag = (cl, t) => '<span class="t ' + cl + '">' + e(t) + '</span>';

  function bloc(id, q, i){
    const ic = ['📜', '👵', '🌙', '🛠️'][i] || '➕';
    let h = '<div class="qa"><div class="q"><span>' + ic + '</span><span>« ' + e(q.q) + ' »</span></div>';
    if(q.grand) return h + '<div class="tags">' + tag('t-ruban', '🎭 Grande conversation') + '</div><div class="r metier">↳ Elle n\'apparaît que quand : ' + e(besoin(q.besoin)) + '. Le détail est plus bas dans cet onglet.</div></div>';
    if(q.besoin) h += '<div class="r metier">Apparaît avec : ' + e(besoin(q.besoin)) + '.</div>';
    if(q.ment) h += '<div class="mens">🤥 Mensonge d\'abord : <span class="dit">« ' + e(q.a) + ' »</span></div><div class="verite">✅ Démasqué : <span class="dit">« ' + e(q.vrai) + ' »</span></div>';
    else h += '<div class="r"><span class="dit">« ' + e(q.a) + ' »</span></div>';
    const codes = liste(q.donne).concat(liste(q.donneVrai));
    const tags = (q.besoin ? tag('t-neuf', '✨ Question qui apparaît') : '') + codes.map(c => tag('t-code', '🔐 Code ' + nomCode(c))).join('');
    if(tags) h += '<div class="tags">' + tags + '</div>';
    return h + '</div>';
  }
  function carte(id, m){
    const N = E.pnj[id], Q = (N.questions || []).filter(q => !q.moments || q.moments.indexOf(m) >= 0);
    const nb = (N.questions || []).filter(q => q.ment).length;
    const ailleurs = Object.keys(N.ou || {}).filter(x => x !== m).map(x => MOM[x]);
    let h = '<details class="v"><summary><span class="ico">' + (id === 'voisin' ? '🏡' : P(id).ic || '🙂') + '</span><span class="nom">' + e(id === 'voisin' ? 'La maison d\'Odette' : nom(id)) + '</span><span class="metier">' + e(id === 'voisin' ? 'une visite, en rapportant la canne' : (P(id).metier || '') + ' · ' + lieu(N.ou[m])) + '</span>' +
      (id === 'voisin' ? '' : '<span class="pastille ' + (nb ? 'p-ment' : 'p-vrai') + '">' + (nb === 0 ? 'Ne ment jamais' : nb === 1 ? 'Ment une fois' : 'Ment ' + nb + ' fois') + '</span>') + '</summary>';
    if(N.salut) h += '<div class="qa"><div class="q"><span>👋</span><span>' + (id === 'voisin' ? e(N.salut) : '« ' + e(N.salut) + ' »') + '</span></div></div>';
    (N.questions || []).forEach((q, i) => { if(Q.indexOf(q) >= 0) h += bloc(id, q, i); });
    if(E.impatience && E.impatience[id]) h += '<div class="qa"><div class="q"><span>⏳</span><span>Quand on lui a tout demandé :</span></div><div class="r"><span class="dit">« ' + e(E.impatience[id]) + ' »</span></div></div>';
    if(ailleurs.length) h += '<div class="qa"><div class="r metier">↳ Répond aussi ' + e(ailleurs.join(' et ')) + (id === 'voisin' ? '' : ', avec les mêmes réponses') + '.</div></div>';
    return h + '</details>';
  }
  function occupes(m){
    const ids = Object.keys(E.pnj).filter(id => id !== 'voisin' && !(E.pnj[id].ou || {})[m] && (E.pnj[id].occupe || {})[m] && !(m === 'nuit' && E.fete.gens[id]));
    return '<div class="occupes">' + ids.map(id => '<div class="occ"><b>' + (P(id).ic || '') + ' ' + e(nom(id)) + '</b> ' + liste(E.pnj[id].occupe[m]).map(e).join(' <span class="metier">puis, si on revient :</span> ') + '</div>').join('') + '</div>';
  }
  function ecoutes(m){
    let h = '<div class="tbl"><table><tr><th>Où</th><th>Ce qu\'on entend</th></tr>';
    (E.bribes || []).filter(b => (b.moments || []).indexOf(m) >= 0).forEach(b => { h += '<tr><td>' + e(b.titre) + '</td><td>' + b.phrases.map(x => e(nom(x.qui)) + ' : « ' + e(x.texte) + ' »').join('<br>') + '</td></tr>'; });
    Object.keys(E.portes || {}).forEach(id => { if(E.portes[id][m]) h += '<tr><td>' + e(nom(id)) + ', tout seul derrière sa porte</td><td>' + e(E.portes[id][m]) + '</td></tr>'; });
    return h + '</table></div>';
  }
  const choix = (l, bons) => '<ul class="choix">' + l.map(c => '<li class="' + (c.bon ? 'bon' : '') + '">' + (c.bon ? '✅ ' : c.piege ? '🪤 ' : '') + '« ' + e(c.q) + ' »' + (c.r ? '<span class="rep">→ ' + dit(c.r) + (c.n ? ' ' + e(c.n) : '') + '</span>' : '') + '</li>').join('') + '</ul>';
  function grand(g){
    const X = E.grands[g];
    let h = X.etapes.map((et, k) => '<div class="etape"><h4>Étape ' + (k + 1) + '</h4><p class="dit"><i>« ' + e(et.t) + ' »</i></p>' + choix(et.choix) + '</div>').join('');
    h += '<div class="intro">';
    if(X.rate) h += '<b>Un mauvais choix</b> : sa réplique, puis « ' + e(X.rate) + ' » Et c\'est fini : un seul essai.<br>';
    if(X.reussi) h += '<b>Réussi</b> : ' + e(X.reussi.t) + ' → code ' + e(nomCode(X.reussi.code)) + '.<br>';
    if(X.piege) h += '<b>🪤 Le piège</b> : ' + e(X.piege.t) + ' → code ' + e(nomCode(X.piege.code)) + ' (une copie de sa propre écriture : elle ne sert à rien).<br>';
    if(X.echec) h += '<b>Raté</b> : ' + e(X.echec.titre) + ' : ' + e(X.echec.t) + ' → code ' + e(nomCode(X.echec.code)) + '.';
    return h + '</div>';
  }
  const ceux = m => Object.keys(E.pnj).filter(id => (E.pnj[id].ou || {})[m]);
  const outils = '<div class="outils"><button type="button" onclick="this.closest(\'section\').querySelectorAll(\'details\').forEach(d=>d.open=true)">Tout ouvrir</button><button type="button" onclick="this.closest(\'section\').querySelectorAll(\'details\').forEach(d=>d.open=false)">Tout fermer</button></div>';
  const Ma = E.marche, Rt = E.retenir, Le = E.grands.leo;
  const qG = g => { for(const id of Object.keys(E.pnj)) for(const q of E.pnj[id].questions || []) if(q.grand === g) return q; };

  const S = {};
  S.lire = ['📖 Lire d\'abord', '#6d6558',
    '<h2>🔒 Dialogues verrouillés</h2>' +
    '<div class="intro"><b>Verrouillé par Romain le 12 novembre à 21 h 44.</b> Cette page est écrite par un outil, à partir du jeu : elle montre <b>exactement ce que dit le jeu</b>. Aucun ancien dialogue ne peut s\'y recoller. Pour changer une réplique, il faut le dire à Claude : il change le jeu, et la page suit.</div>' +
    '<h2>Comment ça marche</h2>' +
    '<ol><li>📜 « ' + e(E.pnj.gaspard.questions[0].q) + ' »</li><li>👵 « ' + e(E.pnj.gaspard.questions[1].q) + ' »</li><li>🌙 « ' + e(E.pnj.gaspard.questions[2].q) + ' »</li><li>🛠️ une question sur son métier, différente pour chacun</li></ol>' +
    '<ul><li><b>Les mêmes trois questions pour tout le monde</b>, plus une sur le métier. Chez quelques-uns, une question de plus apparaît plus tard.</li>' +
    '<li><b>Plus de limite à deux questions.</b> La limite : la moitié du village est occupée à chaque moment.</li>' +
    '<li><b>Le nom de Léo n\'est dit nulle part avant la nuit.</b> Plus de lavande, plus de minuit, plus de grosses bottes.</li>' +
    '<li><b>🎭 Les grandes conversations</b> (le maire, Anselme) n\'apparaissent qu\'une fois <b>tout demandé</b>. Elles sont violettes, avec une étiquette et un reflet qui passe ; « 🎭 » se pose sur le visage du villageois, sur la carte. Un seul essai.</li>' +
    '<li><b>Chez Anselme, les quatre choix sont en majuscules.</b></li>' +
    '<li><b>🤥</b> : on démasque un menteur avec « Mensonge ? », sous sa dernière réponse.</li></ul>' +
    '<h3>Ce que veulent dire les couleurs</h3><div class="legende">' + tag('t-code', '🔐 Code à donner') + tag('t-neuf', '✨ Question qui apparaît') + tag('t-ruban', '🎭 Grande conversation') + '<span class="pastille p-vrai">Ne ment jamais</span><span class="pastille p-ment">Ment une fois</span></div>' +
    '<h2>Les missions du Barde, dans son Carnet</h2><ul>' + E.etapes.barde.map(x => '<li>' + (x.ic || '💡') + ' ' + e(x.t) + (x.des !== undefined ? ' <span class="metier">(arrive ' + MOM[E.moments[x.des]] + ')</span>' : '') + '</li>').join('') + '</ul>'];

  S.matin = ['🌅 Matin', 'var(--matin)',
    '<h2>Le matin</h2><div class="intro"><b>' + e(E.lettreLue.titre) + '</b><br><i>« ' + e(E.lettre) + ' »</i><br>Puis : « ' + e(E.lettreLue.apres) + ' »</div>' + outils +
    '<h3>Le marché aux fleurs (inchangé)</h3>' +
    '<details class="v"><summary><span class="ico">💐</span><span class="nom">Le maire, Fortuné, Iris, Basile</span><span class="metier">10 pièces, 10 bouquets</span></summary>' +
    '<div class="qa"><div class="q"><span>🎩</span><span>Le maire : « ' + e(Ma.maire.t) + ' »</span></div></div>' +
    Ma.fortune.etapes.map((et, k) => '<div class="qa"><div class="q"><span>🛒</span><span>Fortuné, étape ' + (k + 1) + (et.t ? ' : « ' + e(et.t) + ' »' : et.illu ? ' : une image, la carriole (aucun texte)' : '') + '</span></div>' + choix(et.choix.map(c => ({q:c.q, r:c.r}))) + '</div>').join('') +
    Object.keys(Ma.vendeurs).map(id => '<div class="qa"><div class="q"><span>' + (P(id).ic || '') + '</span><span>' + e(nom(id)) + ' : « ' + e(Ma.vendeurs[id].t) + ' »</span></div>' + choix(Ma.vendeurs[id].choix.map(c => ({q:c.q, r:c.r}))) + '</div>').join('') + '</details>' +
    '<h3>Ils répondent</h3>' + ceux('matin').map(id => carte(id, 'matin')).join('') +
    '<h3>Occupés</h3>' + occupes('matin') +
    '<h2>👂 Aux portes, le matin (Tendre l\'oreille)</h2>' + ecoutes('matin')];

  S.aprem = ['☀️ Après-midi', 'var(--aprem)',
    '<h2>L\'après-midi</h2><div class="intro">Le maire compte d\'abord les bouquets : « ' + e(Ma.retour.accueil) + ' » ' + Ma.retour.paliers.map(x => x.min + ' ou plus : « ' + e(x.t) + ' »').join(' · ') + ' Avec la lanterne : « ' + e(Ma.retour.lanterne.t) + ' »</div>' + outils +
    '<h3>Ils répondent</h3>' + ceux('apresmidi').map(id => carte(id, 'apresmidi')).join('') +
    '<h3>Occupés</h3>' + occupes('apresmidi') +
    '<h2>🎭 Grande conversation : la lettre du maire</h2><div class="intro"><b>Elle n\'apparaît que quand</b> : ' + e(besoin(qG('lettre').besoin)) + '. Celui qui est occupé l\'après-midi ne bloque pas.</div>' + grand('lettre') +
    '<h2>👂 Aux portes, l\'après-midi (Tendre l\'oreille)</h2>' + ecoutes('apresmidi')];

  S.nuit = ['🌙 Nuit', 'var(--nuit)',
    '<h2>La nuit</h2><div class="intro">Tout le village est à la fête, sur la place. Anselme est au clocher. Le Barde reste à la fête pendant que les trois autres descendent.</div>' + outils +
    '<h3>Il répond</h3>' + ceux('nuit').filter(id => id !== 'voisin').map(id => carte(id, 'nuit')).join('') +
    '<h2>🎭 Grande conversation : Anselme et la Grosse Marie</h2><div class="intro"><b>Elle n\'apparaît que quand</b> : ' + e(besoin(qG('cle').besoin)) + '.<br>Le but n\'est pas qu\'il prête sa clé : c\'est de l\'aider à sonner. Pendant qu\'il compte les coups, les yeux fermés, le Pisteur lui prend la clé à la ceinture.</div>' + grand('cle') +
    '<h2>🎉 À la fête</h2><div class="tbl"><table><tr><th>Qui</th><th>Ce qu\'il dit</th></tr>' +
    Object.keys(E.fete.gens).map(id => '<tr><td>' + (P(id).ic || '') + ' ' + e(nom(id)) + '</td><td>« ' + e(E.fete.gens[id].t) + ' »' + (E.fete.gens[id].note ? ' <span class="metier">(un indice pour retenir le maire)</span>' : '') + (E.fete.gens[id].filet ? '<br><span class="metier">Si son aveu n\'a pas été obtenu l\'après-midi :</span> « ' + e(E.fete.gens[id].filet.t) + ' » → code ' + e(nomCode(E.fete.gens[id].filet.code)) : '') + '</td></tr>').join('') + '</table></div>' +
    '<h2>🎩 Retenir le maire</h2><div class="intro">Trois petits dialogues, sans minuteur. Le premier dès que la grande conversation d\'Anselme est finie ; chacun des suivants après une autre visite à la fête. ' + Rt.n + ' réussis : code ' + e(nomCode(Rt.reussi.code)) + '. Deux ratés : ' + e(Rt.rate.t) + '</div>' +
    Rt.dialogues.map((d, k) => '<div class="etape"><h4>' + (k + 1) + '</h4><p class="dit"><i>« ' + e(d.t) + ' »</i></p>' + choix(d.choix) + '</div>').join('') +
    '<h2>👂 À la fête (Tendre l\'oreille)</h2>' + ecoutes('nuit') +
    '<h2>🧑 Léo (une scène, sans choix)</h2><div class="etape"><p><i>' + e(Le.intro) + '</i></p><p>' + e(Le.fins[0].t) + '</p><div class="metier">↳ Code ' + e(nomCode(Le.fins[0].code)) + '. Si le maire n\'a pas été retenu : ' + e(Le.enfui) + '</div></div>'];

  S.reste = ['🚧 Pas encore fait', 'var(--veille)',
    '<h2>Ce qui n\'est pas construit</h2><div class="intro">Seuls <b>les dialogues du Barde</b> suivent le nouveau scénario. Les trois autres rôles et le donjon suivent encore l\'ancien fil. L\'enquête se joue quand même du début à la fin, mais la chaîne est plus courte que celle du scénario.</div>' +
    '<ul class="alerte">' +
    '<li><b>La grille du clocher</b> : tirer, pousser ou soulever. Tirer et pousser sont des erreurs (elle grince, le maire arrive plus tôt). Silas donne l\'indice. Le geste est à construire chez le Pisteur.</li>' +
    '<li><b>Le Pisteur</b> : les empreintes de pieds d\'enfant chez Iris et derrière l\'atelier de Mélusine. La clé prise à la ceinture d\'Anselme : le dessin du mini-jeu la montre encore au clou.</li>' +
    '<li><b>Le Sage</b> : les pointures dans le registre ; le Livre d\'or qui laisse deux suspectes, Mélusine ou Margot.</li>' +
    '<li><b>L\'Alchimiste</b> : comparer l\'encre de la lettre avec celle d\'Iris. Aujourd\'hui, son labo dit tout de suite « c\'est l\'écriture de Mélusine », et montre encore du pollen de lavande.</li>' +
    '<li><b>Le donjon</b> : Léo en chef des monstres. Le code de la Grosse Marie (qui redonnait toute la vie) n\'est plus donné par personne : le donjon est un peu plus dur.</li>' +
    '<li><b>La quatrième écoute de la fête</b> (« au pied du mât ») : elle dépend de la grille.</li></ul>' +
    '<h2>À décider avec Romain</h2><ul class="alerte">' +
    '<li><b>Odette à la fin</b> : délivrée avant l\'arrivée du maire, ou seulement entendue derrière la porte ?</li>' +
    '<li><b>Léo</b> : chef du donjon, d\'accord ? Sa scène avec le Barde est provisoire.</li>' +
    '<li><b>La Grosse Marie et la brume</b> : l\'Alchimiste qui cueille quand la brume recule, ça double la tisane d\'Anselme et sa petite cloche Bertille. L\'une ou l\'autre ?</li>' +
    '<li><b>La lecture</b> : le matin, 29 réponses à lire avant que le maire s\'ouvre. À essayer avec les enfants : si c\'est trop long, on enlève la question sur le métier chez ceux qui n\'aident pas.</li></ul>'];

  const tete = fs.readFileSync(GABARIT, 'utf8').replace(/<title>[^<]*<\/title>/, '<title>Dialogues du Barde — Enquête 3</title>');
  const ids = Object.keys(S);
  return tete + '\n</head>\n<body>\n<div class="page">\n<h1>Dialogues du Barde — Enquête 3</h1>\n<p class="sous">' + e(sous) + '</p>\n<nav id="onglets">' +
    ids.map(id => '<button type="button" role="tab" data-id="' + id + '" style="--c:' + S[id][1] + '">' + S[id][0] + '</button>').join('') + '</nav>\n' +
    ids.map(id => '<section id="' + id + '" style="--c:' + S[id][1] + '">' + S[id][2] + '</section>').join('\n') + '\n</div>\n<script>\n' +
    'var nav=document.getElementById("onglets"),ids=' + JSON.stringify(ids) + ';\n' +
    'function montre(id){document.querySelectorAll("section").forEach(function(s){s.classList.toggle("actif",s.id===id)});nav.querySelectorAll("button").forEach(function(b){b.setAttribute("aria-selected",b.dataset.id===id)});if(location.hash!=="#"+id)history.replaceState(null,"","#"+id)}\n' +
    'nav.addEventListener("click",function(ev){var b=ev.target.closest("button");if(b)montre(b.dataset.id)});\n' +
    'window.addEventListener("hashchange",function(){var h=location.hash.slice(1);if(ids.indexOf(h)>=0)montre(h)});\n' +
    'montre(ids.indexOf(location.hash.slice(1))>=0?location.hash.slice(1):"matin");\n</script>\n</body>\n</html>\n';
}

if(require.main === module){
  const sortie = process.argv[2]; if(!sortie){ console.log('usage : node e3-dialogues-page.js <sortie.html> ["sous-titre"]'); process.exit(1); }
  const {E, D} = charger();
  fs.writeFileSync(sortie, page(E, D, process.argv[3] || 'Ce que dit le jeu. Dialogues verrouillés le 12 novembre 2026 à 21 h 44.'));
  console.log('Écrit : ' + sortie);
}
module.exports = {page};
