
/* ============ Le chaudron : devant la cheminée, on cherche quel ingrédient a donné sa couleur à l'eau ============ */
function svgIngr(k){
  var s = '<svg viewBox="0 0 60 60" aria-hidden="true">';
  if(k === 'garance'){ var r = 'M30,20 C25,32 19,40 12,53 M30,20 C30,34 28,44 29,57 M30,20 C36,32 42,40 49,51 M22,36 l-7,1 M37,34 l8,2 M29,44 l6,3';
    s += T(r, K, 8) + T(r, '#c8503c', 4.6) + T('M24,30 l2,2 M34,29 l-2,2 M28,50 l2,1', '#8a2a1c', 1.5) + T('M22,21 Q30,16 38,21', K, 6) + T('M22,21 Q30,16 38,21', '#e8d8a8', 2.8) +
      P('M30,20 C22,15 18,8 22,2 C28,6 30,12 30,20 Z', '#6fae5a', ' stroke-width="2.5"') + P('M30,20 C38,15 42,8 38,2 C32,6 30,12 30,20 Z', '#5e9a4a', ' stroke-width="2.5"'); }
  else if(k === 'coquelicot') s += T('M30,34 C30,44 27,50 30,58', K, 6) + T('M30,34 C30,44 27,50 30,58', '#4b7a34', 3) + [0,90,180,270].map(function(a){ return '<ellipse cx="30" cy="15" rx="12" ry="10" fill="#e8343c" stroke="' + K + '" stroke-width="2.5" transform="rotate(' + a + ' 30 26)"/>'; }).join('') +
      T('M30,8 v6 M12,26 h6 M48,26 h-6', '#b0101a', 1.4) + Cir(30, 26, 6.5, '#1a1010', ' stroke-width="2"') + [[-3,-2],[3,-1],[0,3]].map(function(q){ return '<circle cx="' + (30+q[0]) + '" cy="' + (26+q[1]) + '" r="1.1" fill="#e8d860"/>'; }).join('');
  else if(k === 'betterave') s += P('M30,22 C13,22 11,45 30,51 C49,45 47,22 30,22 Z', '#9c2257', ' stroke-width="3"') + T('M30,51 C30,55 32,57 35,59', '#9c2257', 3) + T('M21,32 C26,37 34,37 39,32', '#c8447a', 2) + reflet('M19,30 q1,-4 5,-5', 2.5, .5) +
      P('M30,22 C24,14 20,6 24,2 C30,6 31,14 30,22 Z', '#5e9a4a', ' stroke-width="2.5"') + P('M30,22 C36,12 42,6 45,10 C41,16 36,20 30,22 Z', '#6fae5a', ' stroke-width="2.5"') + T('M30,22 L25,6 M30,22 L41,11', '#9c2257', 1.5);
  else if(k === 'cochenille') s += Ell(30, 46, 24, 9, '#e9dcc0', ' stroke-width="2.5"') + [[18,40,-.3],[31,36,.2],[42,41,.5],[24,46,.1],[37,47,-.4]].map(function(q){ return '<g transform="translate(' + q[0] + ',' + q[1] + ') rotate(' + (q[2]*57) + ')"><ellipse cx="0" cy="0" rx="7" ry="5" fill="#c9306a" stroke="' + K + '" stroke-width="2"/><path d="M-3,-4.5 v9 M0,-5 v10 M3,-4.5 v9" stroke="#7a1238" stroke-width="1.1"/><circle cx="-2" cy="-2" r="1.1" fill="#fff" opacity=".7"/></g>'; }).join('') +
      T('M10,22 l4,4 M50,20 l-4,5 M30,16 v6', '#c9306a', 2, ' opacity=".5"');
  else if(k === 'mure') s += P('M34,12 C40,4 50,6 52,14 C46,18 40,18 34,12 Z', '#5e9a4a', ' stroke-width="2.5"') + T('M30,14 C30,8 32,5 35,3', K, 5) + T('M30,14 C30,8 32,5 35,3', '#4b7a34', 2.4) +
      [[30,20],[22,24],[38,24],[18,32],[30,30],[42,32],[22,40],[34,40],[28,48]].map(function(q){ return '<circle cx="' + q[0] + '" cy="' + q[1] + '" r="6.4" fill="#4a2a5c" stroke="' + K + '" stroke-width="2.2"/><circle cx="' + (q[0]-2) + '" cy="' + (q[1]-2) + '" r="1.5" fill="#b9a0d0"/>'; }).join('');
  else if(k === 'oignon') s += P('M30,16 C12,20 10,46 30,52 C50,46 48,20 30,16 Z', '#d98a2c', ' stroke-width="3"') + T('M30,16 C22,26 21,40 30,52 M30,16 C38,26 39,40 30,52', '#a86414', 1.8) + T('M30,16 C30,10 28,6 26,3 M30,16 C31,10 34,7 36,5', K, 4.5) + T('M30,16 C30,10 28,6 26,3 M30,16 C31,10 34,7 36,5', '#c9a877', 2) +
      P('M44,34 C54,32 58,40 54,48 C50,44 46,42 44,34 Z', '#e8a850', ' stroke-width="2.5"') + reflet('M18,30 q1,-6 6,-9', 2.5, .5) + T('M26,52 l-3,5 M30,52 v6 M34,52 l3,5', '#c9a877', 1.5);
  else if(k === 'safran') s += T('M30,40 C30,48 29,53 30,58', K, 6) + T('M30,40 C30,48 29,53 30,58', '#4b7a34', 3) + P('M30,42 C16,36 14,18 22,8 C26,18 28,30 30,42 Z', '#8a5ad0', ' stroke-width="2.5"') + P('M30,42 C44,36 46,18 38,8 C34,18 32,30 30,42 Z', '#7a4ac0', ' stroke-width="2.5"') + P('M30,42 C22,30 24,14 30,4 C36,14 38,30 30,42 Z', '#9a6ae0', ' stroke-width="2.5"') +
      T('M30,36 C27,28 24,24 20,22 M30,36 C30,28 30,22 30,18 M30,36 C33,28 36,24 40,22', K, 4.2) + T('M30,36 C27,28 24,24 20,22 M30,36 C30,28 30,22 30,18 M30,36 C33,28 36,24 40,22', '#e8500e', 2.2);
  else s += P('M14,30 C14,14 46,14 46,30 C46,48 14,48 14,30 Z', '#6a9a3a', ' stroke-width="3"') + P('M20,30 C20,20 40,20 40,30 C40,42 20,42 20,30 Z', '#b98a52', ' stroke-width="2.5"') + T('M30,21 V40 M24,26 C27,29 27,33 24,36 M36,26 C33,29 33,33 36,36', '#6a4a2c', 1.8) +
      '<ellipse cx="22" cy="50" rx="12" ry="4" fill="#3a2414" opacity=".8"/><circle cx="40" cy="52" r="2.4" fill="#3a2414"/><circle cx="46" cy="48" r="1.6" fill="#3a2414"/>' + reflet('M17,26 q1,-6 6,-8', 2.5, .4);
  return s + '</svg>';
}
function sceneChaudron(){
  var s = '', i, x, Rn = rng(9);
  /* le mur, la hotte, le sol de dalles */
  s += '<rect x="-1700" y="-1500" width="4400" height="3700" fill="#2a2140"/><rect x="-1700" y="-34" width="4400" height="600" fill="' + G('briques') + '"/><rect x="-1700" y="-1500" width="4400" height="2066" fill="rgba(10,6,20,.3)"/>';
  s += '<rect x="-1700" y="566" width="4400" height="1900" fill="#17111f"/>';
  for(i = 0; i < 12; i++) for(x = -1700 + (i % 2)*80; x < 2700; x += 160) s += '<rect x="' + (x + 3) + '" y="' + (569 + i*74) + '" width="154" height="68" rx="8" fill="' + ['#3a304f','#41365a','#352b49','#463b60'][Math.floor(Rn()*4)] + '"/><path d="M' + (x + 12) + ',' + (574 + i*74) + ' h136" stroke="rgba(255,255,255,.07)" stroke-width="3" stroke-linecap="round"/>';
  s += '<rect x="-1700" y="566" width="4400" height="30" fill="' + G('piedMur') + '"/>';
  s += P('M-10,44 L690,44 L640,-1500 L40,-1500 Z', G('pierre')) + T('M2,-30 H678 M14,-104 H666', '#3f3760', 3, ' opacity=".8"') + T('M120,44 V-30 M300,44 V-30 M480,44 V-30 M210,-30 V-104 M390,-30 V-104 M570,-30 V-104', '#3f3760', 3, ' opacity=".8"');
  /* l'arche en pierre de taille et l'intérieur plein de suie */
  var arche = 'M64,566 L64,236 Q340,52 616,236 L616,566 Z', tour = 'M39,566 L39,232 Q340,20 641,232 L641,566';
  s += '<path d="' + tour + '" fill="none" stroke="' + K + '" stroke-width="58"/><path d="' + tour + '" fill="none" stroke="#7d74a0" stroke-width="50"/>' +
    T('M14,500 h50 M14,430 h50 M14,360 h50 M14,290 h50 M616,500 h50 M616,430 h50 M616,360 h50 M616,290 h50 M70,214 l-38,-26 M130,170 l-28,-36 M200,136 l-18,-42 M270,116 l-8,-46 M340,110 v-48 M410,116 l8,-46 M480,136 l18,-42 M550,170 l28,-36 M610,214 l38,-26', K, 3) +
    '<path d="M20,560 L20,236 Q340,6 660,236" fill="none" stroke="#fff" stroke-width="3" opacity=".14"/>';
  s += '<clipPath id="clipAtre2"><path d="' + arche + '"/></clipPath><g clip-path="url(#clipAtre2)"><rect x="60" y="100" width="560" height="470" fill="#150d18"/>' +
    T('M60,200 H620 M60,264 H620 M60,328 H620 M60,392 H620 M60,456 H620 M60,520 H620 M150,200 V264 M330,200 V264 M510,200 V264 M240,264 V328 M420,264 V328 M150,328 V392 M330,328 V392 M510,328 V392 M240,392 V456 M420,392 V456 M150,456 V520 M330,456 V520 M510,456 V520', '#221724', 5) +
    '<ellipse class="braise" cx="340" cy="520" rx="300" ry="250" fill="' + G('atre') + '"/></g><path d="' + arche + '" fill="none" stroke="' + K + '" stroke-width="6"/>';
  /* le manteau de bois et ce qui est posé dessus */
  s += R(-30, 44, 740, 50, 5, G('boisS')) + grainBois(-26, 48, 732, 42, 4, 12, '#2a160a', .4) + noeud(520, 70, 10, .5) + reflet('M-24,49 H704', 2.5, .22);
  s += '<g transform="translate(90,42) scale(1.25)">' + artBougie() + '</g><circle cx="90" cy="-36" r="70" fill="' + G('halo') + '" opacity=".5"/>' +
    P('M190,42 C182,16 194,-4 212,-4 C230,-4 242,16 234,42 Z', '#b0683e') + Ell(212, -4, 14, 4, '#7a4424', ' stroke-width="3"') + reflet('M196,34 C192,22 196,8 204,2', 4, .35) +
    R(500, -6, 18, 50, 3, '#8a3a4a') + R(518, -14, 16, 58, 3, '#3a5a8a') + '<g transform="rotate(12 548 44)">' + R(540, -4, 17, 48, 3, '#5a7a3a') + '</g>';
  /* le feu : les bûches, les flammes, les braises */
  s += '<g transform="rotate(-8 340 540)">' + R(214, 526, 252, 30, 15, G('bois')) + Ell(466, 541, 9, 14, '#e8b47e', ' stroke-width="3"') + '</g><g transform="rotate(7 340 544)">' + R(222, 532, 236, 28, 14, G('boisV')) + Ell(222, 546, 9, 13, '#e8b47e', ' stroke-width="3"') + '</g>';
  s += '<g class="flamme"><path d="M274,540 C246,500 268,470 284,444 C300,474 314,500 296,540 Z" fill="' + G('flamme') + '" stroke="#e8693c" stroke-width="3"/></g><g class="flamme f2"><path d="M336,544 C300,492 328,452 346,418 C364,456 384,496 360,544 Z" fill="' + G('flamme') + '" stroke="#e8693c" stroke-width="3"/></g>' +
    '<g class="flamme f3"><path d="M396,540 C374,506 388,480 402,458 C416,484 428,508 414,540 Z" fill="' + G('flamme') + '" stroke="#e8693c" stroke-width="3"/></g>' + [[250,556],[300,562],[352,560],[404,558],[440,552]].map(function(q){ return '<circle class="braise" cx="' + q[0] + '" cy="' + q[1] + '" r="5" fill="#ffb050"/>'; }).join('');
  /* le tabouret et la fiole du modèle : l'eau rougie à retrouver */
  s += ombre(132, 566, 70, 10, .5) + T('M96,480 L84,562 M168,480 L180,562 M132,486 L132,566', K, 13) + T('M96,480 L84,562 M168,480 L180,562 M132,486 L132,566', '#a5653a', 7) + Ell(132, 476, 56, 15, G('boisH')) + '<ellipse cx="132" cy="473" rx="44" ry="10" fill="none" stroke="#a5653a" stroke-width="2" opacity=".6"/>';
  s += Ell(132, 470, 26, 7, '#c98450', ' stroke-width="3"') + '<clipPath id="clipFiole"><circle cx="132" cy="424" r="43"/></clipPath><circle cx="132" cy="424" r="46" fill="rgba(220,245,255,.28)" stroke="' + K + '" stroke-width="5"/>' +
    '<g clip-path="url(#clipFiole)"><rect id="fioleLiq" x="80" y="414" width="104" height="60" fill="#c8503c"/><ellipse cx="132" cy="414" rx="44" ry="7" fill="#fff" opacity=".25"/></g>' +
    R(118, 338, 28, 46, 5, 'rgba(220,245,255,.4)') + R(114, 326, 36, 14, 4, '#c98450') + reflet('M104,400 C98,414 98,432 106,446', 6, .5) + reflet('M124,344 V376', 3, .5) +
    T('M132,486 v10', '#c9a877', 2.5) + '<g transform="rotate(-3 132 512)">' + R(82, 495, 100, 28, 4, '#fff6d8', ' stroke-width="3"') + txt(132, 509, 16, 'l\'eau rougie') + '</g>';
  /* la crémaillère, l'anse, le chaudron, le liquide, la cuillère à touiller */
  s += T('M340,150 L340,214', K, 11) + T('M340,150 L340,214', '#5f5872', 5, ' stroke-dasharray="9 6"') + T('M196,302 C196,176 484,176 484,302', K, 15) + T('M196,302 C196,176 484,176 484,302', '#5f5872', 7);
  s += P('M190,302 C148,392 188,484 340,498 C492,484 532,392 490,302 Z', G('fonte'), ' stroke-width="6"') + '<path d="M212,410 C250,484 430,484 468,410 C452,462 404,492 340,494 C276,492 228,462 212,410 Z" fill="#ff8a3a" opacity=".32"/>' + reflet('M214,344 C204,386 218,430 244,460', 11, .2) + reflet('M240,336 C236,352 238,368 244,380', 5, .3) +
    P('M188,312 C166,312 166,348 188,352', 'none', ' stroke-width="13"') + T('M188,312 C166,312 166,348 188,352', '#5f5872', 6) + P('M492,312 C514,312 514,348 492,352', 'none', ' stroke-width="13"') + T('M492,312 C514,312 514,348 492,352', '#5f5872', 6);
  s += Ell(340, 300, 152, 40, 'none', ' stroke-width="24"') + '<ellipse cx="340" cy="300" rx="152" ry="40" fill="none" stroke="#5f5872" stroke-width="13"/><ellipse id="mixLiq" cx="340" cy="305" rx="136" ry="31" fill="' + EAU_CHAUDRON + '"/><ellipse cx="300" cy="296" rx="60" ry="10" fill="#fff" opacity=".22"/>' +
    '<circle class="bul" cx="290" cy="310" r="8" fill="#fff" opacity=".5" style="animation-delay:-.4s"/><circle class="bul" cx="386" cy="300" r="6" fill="#fff" opacity=".5" style="animation-delay:-1.3s"/><circle class="bul" cx="340" cy="318" r="5" fill="#fff" opacity=".5" style="animation-delay:-.9s"/>' + reflet('M214,282 C250,266 296,260 340,259', 5, .3);
  s += '<g id="cuillere">' + T('M462,132 L394,300', K, 20) + T('M462,132 L394,300', '#c98450', 12) + T('M456,146 L402,280', '#e9bb80', 3, ' opacity=".7"') + Cir(463, 130, 9, '#a5653a') + '<ellipse cx="392" cy="304" rx="22" ry="6" fill="none" stroke="#fff" stroke-width="3" opacity=".5"/></g>';
  s += '<g class="vapeur">' + T('M290,250 q-14,-20 0,-40 q14,-20 0,-40', '#e6f0ff', 7, ' opacity=".45"') + '</g><g class="vapeur v2">' + T('M366,244 q-14,-20 0,-40 q14,-20 0,-40', '#e6f0ff', 7, ' opacity=".45"') + '</g><g id="pouf"></g>';
  /* le petit meuble à ingrédients : ses tiroirs sont posés par-dessus (ce sont de vrais boutons) */
  s += ombre(826, 612, 170, 14, .5) + R(688, 596, 26, 22, 4, G('boisS')) + R(934, 596, 26, 22, 4, G('boisS')) + R(676, 112, 296, 490, 10, G('boisV')) + grainBois(680, 116, 288, 482, 9, 14, '#6b3d1f', .3) + R(686, 132, 276, 460, 6, '#4f2a14', ' stroke-width="3"') + R(662, 96, 324, 24, 7, G('boisS')) + reflet('M668,101 H980', 2.5, .25);
  s += Ell(742, 96, 30, 8, '#8a84a0', ' stroke-width="3"') + P('M712,96 C712,70 772,70 772,96 Z', '#9a94b0') + T('M750,78 L776,44', K, 11) + T('M750,78 L776,44', '#c9c4de', 5) +
    P('M840,96 L840,62 C840,52 850,52 850,42 L850,30 L866,30 L866,42 C866,52 876,52 876,62 L876,96 Z', 'rgba(110,190,150,.75)') + R(848, 20, 20, 12, 3, '#c98450', ' stroke-width="3"') + reflet('M846,90 V66', 3.5, .5) +
    P('M900,96 C894,78 900,62 914,62 C928,62 934,78 928,96 Z', '#d9a23a') + R(906, 52, 16, 12, 3, '#c98450', ' stroke-width="3"');
  return s;
}
function ouvrirChaudron(){ if(S.occupe) return; afficherChaudron({x:131, y:340}); }
function afficherChaudron(origine){
  ouvrirMode('chaudron', '<div class="vue" id="vue"><svg class="fond" viewBox="0 0 1000 640" aria-hidden="true">' + sceneChaudron() + '</svg>' +
    '<div class="tampon pose" id="tampon" style="' + pos(270, 232, 140, 140) + '" aria-hidden="true"></div><div class="ruban pose" id="ruban" style="left:calc(340*var(--u));top:calc(118*var(--u))" hidden></div>' +
    '<div class="meuble-i pose" id="meubleI" role="group" aria-label="Le meuble à ingrédients" style="' + pos(694, 140, 260, 444) + '"></div></div>' + modeHaut(true, 'Quitter le chaudron'), origine);
  majChaudronMode(); majCoeurs();
}
function majChaudronMode(){
  var m = $('#meubleI'); if(!m) return; var fait = !!S.trouves.rouge, faux = S.barres.rouge || {}, flair = S.flair.rouge || {};
  $('#mixLiq').setAttribute('fill', couleurDe(S.mix)); $('#fioleLiq').setAttribute('fill', couleurRouge()); $('#vue').classList.toggle('bon', fait);
  var rb = $('#ruban'); rb.hidden = !fait; if(fait) rb.textContent = '✅ ' + nomTrouve('rouge');
  m.innerHTML = INGR.map(function(i){ var ok = S.mix.indexOf(i.k) >= 0;
    return '<button type="button" class="ingr' + (ok ? ' ok' : '') + (faux[i.k] ? ' non' : '') + (flair[i.k] ? ' flair' : '') + '" data-ingr="' + i.k + '"' + (fait || ok || faux[i.k] || flair[i.k] ? ' disabled' : '') + '><span class="dessin">' + svgIngr(i.k) + '</span><span class="plaque">' + i.nom + '</span>' +
      '<span class="teinte" style="background:' + i.c + '" aria-hidden="true"></span>' + (ok ? '<span class="marque">✅</span>' : (faux[i.k] ? '<span class="marque">❌</span>' : (flair[i.k] ? '<span class="marque">🐾</span>' : ''))) + '</button>'; }).join('');
}
/* On touche un tiroir du meuble : l'ingrédient saute dans le chaudron, on touille, l'ordinateur compare avec la fiole et le dit */
function jeter(k, bouton){
  if(S.occupe || S.trouves.rouge || S.mode !== 'chaudron') return; S.occupe = true; bouton.classList.add('ouvre');
  volVers(bouton.querySelector('.dessin'), $('#mixLiq'), function(){
    var avant = couleurDe(S.mix), essai = couleurDe(S.mix.concat([k])), liq = $('#mixLiq'), cu = $('#cuillere'), bon = CIBLES[S.niveau].indexOf(k) >= 0, co = coeursDe('rouge');
    cu.classList.add('touille');
    tween(reduit ? 1 : 1000, function(p){ liq.setAttribute('fill', melange(avant, essai, p)); }, function(){
      cu.classList.remove('touille');
      if(bon){ S.mix.push(k); if(S.mix.length === CIBLES[S.niveau].length){ S.trouves.rouge = true; S.vientDeTrouver = 'rouge'; } tampon('✅'); S.occupe = false; majChaudronMode(); return; }
      $('#vue').classList.add('faux'); tampon('❌');
      $('#pouf').innerHTML = [[300,270,26],[340,254,32],[384,272,24]].map(function(q){ return '<circle class="pouf" cx="' + q[0] + '" cy="' + q[1] + '" r="' + q[2] + '" fill="#8a8694"/>'; }).join('');
      attendre(950, function(){
        $('#vue').classList.remove('faux'); $('#pouf').innerHTML = '';
        if(co === 0){ S.coeurs.rouge = 3; S.barres.rouge = {}; S.mix = []; } else { S.coeurs.rouge = co - 1; S.barres.rouge = S.barres.rouge || {}; S.barres.rouge[k] = true; }
        tween(reduit ? 1 : 500, function(p){ liq.setAttribute('fill', melange(essai, couleurDe(S.mix), p)); }, function(){ S.occupe = false; majChaudronMode(); majCoeurs(co === 0); });
      });
    });
  }, .5);
}
