
/* ============ Le grimoire, le sac, l'explication en images ============
   Le grimoire est posé sur son lutrin, au milieu de l'établi : on le touche, il s'ouvre en grand. Une double page par potion :
   à gauche la plante (sa planche, où elle pousse) ; à droite la recette (ce qu'elle fait, quelle partie prendre, les gestes dans l'ordre,
   écrits en mots : à l'Alchimiste de trouver l'outil qui va avec). Tout texte de plus de trois mots a son 🔊 ; rien ne se lit tout seul.
   « C'est vrai ! » n'apparaît qu'une fois la potion faite. */
function echap(t){ return String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
function bSon(t){ return '<button type="button" class="b-son" aria-label="Écouter" data-lire="' + echap(t) + '">🔊</button>'; }
function ligne(html, t, cls){ return '<div class="lg' + (cls ? ' ' + cls : '') + '"><div>' + html + '</div>' + bSon(t) + '</div>'; }
function pageLivre(id){
  var r = RE[id], p = PL[r.plante], fait = !!S.faites[id], L = connues(), n = L.indexOf(id);
  var g = '<div class="page g"><h3>' + echap(p.nom) + '</h3><div class="planche-b">' + PLD.plante(r.plante) + '</div>' +
    ligne('<p><b>Où ?</b> ' + echap(p.milieu) + '</p>', p.nom + '. ' + p.milieu) +
    (fait ? ligne('<p><b>C\'est vrai !</b> ' + echap(r.vrai) + '</p>', 'C\'est vrai ! ' + r.vrai, 'vrai') : '') + '</div>';
  /* (Romain, 12 novembre, 12 h 45 : rien sur ce à quoi la potion servira — seulement la partie, puis la recette) */
  var d = '<div class="page d"><h2><svg viewBox="-30 -82 60 86" aria-hidden="true">' + flacon(id, r.coul) + '</svg><span>' + echap(r.nom) + (fait ? ' <span class="fait-t">✓ prête</span>' : '') + '</span></h2>' +
    ligne('<p><b>La partie :</b> ' + echap(r.dit) + '</p>', 'La partie à prendre : ' + r.dit) +
    ligne('<p><b>La recette :</b></p><ol>' + r.recette.map(function(l){ return '<li>' + echap(l) + '</li>'; }).join('') + '</ol>', 'La recette. ' + r.recette.map(function(l, i){ return (i + 1) + ' : ' + l; }).join(' ')) +
    (r.note ? ligne('<p>' + echap(r.note) + '</p>', r.note, 'note') : '') +
    '<div class="pied"><span>Le grimoire des plantes</span><span>' + (n + 1) + ' / ' + L.length + '</span></div></div>';
  return g + d;
}
/* Le grimoire se remplit tout seul : une page (et son signet) par plante trouvée */
function livreHTML(id){
  var L = connues(), v = '<div class="voile-l" data-fond="1"></div>';
  if(!L.length || !id) return v + '<div class="livre" role="dialog" aria-label="Le grimoire des plantes"><div class="cuir"></div><div class="pages" id="pagesLivre"><div class="page g"></div><div class="page d">' + ligne('<p>' + echap(DIT.livreVide) + '</p>', DIT.livreVide) + '</div></div></div>';
  return v + '<div class="livre" role="dialog" aria-label="Le grimoire des plantes">' +
    '<div class="signets">' + L.map(function(x){ return '<button type="button" class="signet' + (S.faites[x] ? ' fait' : '') + '" data-page="' + x + '" aria-pressed="' + (x === id) + '" aria-label="' + echap(RE[x].nom) + '"><i style="background:' + RE[x].coul + '"></i>' + echap(RE[x].court) + '</button>'; }).join('') + '</div>' +
    '<div class="cuir"></div><div class="pages" id="pagesLivre">' + pageLivre(id) + '</div>' +
    (L.length > 1 ? '<button type="button" class="tourne-p prec" data-tourne="-1" aria-label="La page d\'avant">◀</button><button type="button" class="tourne-p suiv" data-tourne="1" aria-label="La page d\'après">▶</button>' : '') + '</div>';
}
function ouvrirLivre(id){
  if(S.occupe || (S.mode && S.mode !== 'livre')) return;
  poser();
  /* le livre s'ouvre à la page de ce qu'on prépare ; sinon à une page qui vient de s'écrire ; sinon à la dernière page lue ; sinon à la première potion qui reste à faire */
  var L = connues(), N = nouvellesPages(), ok = function(x){ return x && L.indexOf(x) >= 0 ? x : null; };
  id = ok(id) || ok(S.plante && S.partie ? PL[S.plante].potion : null) || N[0] || ok(S.page) || L.filter(function(x){ return !S.faites[x]; })[0] || L[0] || null;
  S.page = id; if(id) S.pagesVues[id] = 1; son('livre');
  ouvrirMode('livre', livreHTML(id)); majLivre(); garder();
}
function pageLivreVa(id){
  if(S.mode !== 'livre' || !RE[id] || connues().indexOf(id) < 0) return;
  S.page = id; S.pagesVues[id] = 1; son('page'); arreterLecture();
  $('#pagesLivre').innerHTML = pageLivre(id);
  $$('#hudBoite .signet').forEach(function(b){ b.setAttribute('aria-pressed', String(b.dataset.page === id)); });
  majLivre();
}
function tournerPage(d){ var L = connues(), i = L.indexOf(S.page); if(L.length) pageLivreVa(L[(i + d + L.length) % L.length]); }

/* ---------- Les sept potions sont prêtes : le code pour le Pisteur (Romain, 12 novembre, 12 h 45 : plus de sac ; le code n'est donné
   qu'une fois TOUT fait). On le revoit en touchant l'étagère des potions. La nuit, le bouton du chaudron du donjon est ici. ---------- */
function codeHTML(){
  var t = DIT.code, code = '', dj = '', TD = 'Dans le donjon, ton chaudron te suit : le Pisteur y trouvera des plantes rares, à cuisiner pour lui.';
  if(S.sac && S.sac.formes) code = '<div class="code" id="sacCode"><span>Le code pour le Pisteur</span><span class="formes">' + S.sac.formes.map(echap).join('') + '</span>' + bSon('Le code des sept potions, pour le Pisteur.') + '</div>';
  if(S.donjon) dj = ligne('<p>' + echap(TD) + '</p>', TD) + '<button type="button" class="b-jaune" data-donjon="1">🫕 Le chaudron du donjon</button>';
  return '<div class="voile-l" data-fond="1"></div><div class="carte" role="dialog" aria-label="Les sept potions"><h2>🧪 Les sept potions</h2>' +
    '<div class="rang">' + ORDRE.map(function(id){ return '<span class="pleine"><svg viewBox="-32 -84 64 90" aria-hidden="true">' + flacon(id, RE[id].coul) + '</svg>' + echap(RE[id].court) + ' ✓</span>'; }).join('') + '</div>' +
    ligne('<p>' + echap(t) + '</p>', t) + code + dj + '</div>';
}
function ouvrirCode(){
  if(S.occupe || S.mode || !toutesFaites() || !S.sac) return;
  poser(); son('potion');
  ouvrirMode('sac', codeHTML());
  S.sacVu = true; dire('sacVu'); majEtat();
}

/* ---------- Une potion est prête : on la voit en grand, et on apprend ce qui est vrai ---------- */
function ouvrirPrete(id, t, toutes){
  var r = RE[id];
  ouvrirMode('prete', '<div class="voile-l" data-fond="1"></div><div class="carte prete" role="dialog" aria-label="' + echap(r.nom) + ' : la potion est prête">' +
    '<div class="prete-h"><svg class="grand-f" viewBox="-36 -88 72 94" aria-hidden="true"><circle cx="0" cy="-34" r="44" fill="' + G('haloP') + '"/>' + flacon(id, r.coul) + '</svg><div class="prete-t"><h2>' + echap(r.nom) + ' !</h2>' + ligne('<p>' + echap(t) + '</p>', t) + '</div></div>' +
    ligne('<p><b>C\'est vrai !</b> ' + echap(r.vrai) + '</p>', 'C\'est vrai ! ' + r.vrai, 'vrai') +
    (toutes ? ligne('<p>' + echap(DIT.toutes) + '</p>', DIT.toutes, 'note') : '') +
    '<button type="button" class="b-jaune" ' + (toutes ? 'data-suite="code"' : 'data-fond="1"') + '>Continuer</button></div>');
}

/* ---------- L'explication en images, la toute première fois (une fois par héros) : des images, puis un bouton jaune ---------- */
var INTRO_PAS = [
  {t:'Le grimoire s\'écrit tout seul : une page pour chaque plante trouvée. Il dit quelle partie prendre, et quels gestes faire.'},
  {t:'Tes cueillettes sèchent, la tête en bas. Décroche une plante, regarde-la de près, et prends la bonne partie.'},
  {t:'Pose-la sur un outil. Puis fais travailler l\'outil : il hache, il écrase, il presse…'},
  {t:'Le feu ? C\'est toi qui décides. Une bûche : feu doux. Deux bûches : feu fort. Et si tu te trompes, rien n\'est perdu !'}
];
function vignette(i){
  if(i === 0) return '<svg viewBox="-110 -186 220 206" preserveAspectRatio="xMidYMid slice">' + ART.livre().replace('class="rond"', 'class="rond" style="display:none"') + '</svg>';
  if(i === 1) return '<svg viewBox="0 0 260 322" style="background:#f6efdc" class="plante zoom vig-plante">' + PLD.corps('souci') + '</svg>';
  if(i === 2){ var sv = S.partie, m = S.m, ou = S.ou, po = S.pos; S.partie = 'x'; S.m = {f:'feuilles', c:'#62b24c'}; S.ou = 'planche'; S.pos = 'entree'; var a = ART.planche(); S.partie = sv; S.m = m; S.ou = ou; S.pos = po;
    return '<svg viewBox="-128 -92 256 128" preserveAspectRatio="xMidYMid slice" style="background:#d9a066">' + a.replace('class="rond"', 'class="rond" style="display:none"').replace(/ id="[^"]*"/g, '') + '</svg>'; }
  var f = S.feux.marmite, l = S.liq.marmite, sp = S.partie; S.feux.marmite = {b:2, allume:true}; S.liq.marmite = 'eau'; S.partie = null; var b = ART.marmite(); S.feux.marmite = f; S.liq.marmite = l; S.partie = sp;
  return '<svg viewBox="-110 -200 220 236" preserveAspectRatio="xMidYMid slice" style="background:#4a3d68">' + b.replace('class="rond"', 'class="rond" style="display:none"').replace(/ id="[^"]*"/g, '').replace(/ data-act="[^"]*"/g, '') + '</svg>';
}
function introHTML(){
  var h = '<div class="voile-l"></div><div class="carte intro" role="dialog" aria-label="L\'établi des plantes"><h2>🌿 Ton établi des plantes</h2><div class="intro-pas">';
  INTRO_PAS.forEach(function(p, i){ h += '<figure><div class="vig">' + vignette(i) + '</div><figcaption><b>' + (i + 1) + '</b><span>' + echap(p.t) + '</span>' + bSon(p.t) + '</figcaption></figure>'; });
  return h + '</div><button type="button" class="b-jaune" data-intro="1">🌿 À l\'établi !</button></div>';
}
function ouvrirIntro(){ ouvrirMode('intro', introHTML()); $('#modeHaut').hidden = true; }
