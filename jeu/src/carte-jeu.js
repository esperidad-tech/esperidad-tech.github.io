/* ==========================================================
   Brumeval — la carte dans le jeu
   - L'onglet Carte : seulement la carte, en grand, entre le bandeau et les onglets, sans cadre ni liste.
     À l'ouverture, tout le village tient dans l'écran ; ＋ / − pour zoomer, puis on la fait glisser au doigt (carte.js, Carte.monter).
   - Enquête 1, Pisteur : la carte se dévoile pas à pas, en suivant ses missions (mission.js : M.missionsLieux).
   - Le Pisteur, et lui seul, a aussi son tableau « Les chemins secrets » (Romain, 5 novembre, 01 h 30 ; c'était « Sous le village ») :
     les passages des sous-sols (souterrains.js) ET les chemins secrets en surface, que chaque enquête déclare (E.chemins : le chemin
     des bûcherons de l'enquête 2). Pas de doublon (Romain, 3 novembre) : l'onglet Carte ne montre que le village, le tableau du chevalet
     de sa cabane ne montre que ses chemins secrets. Un passage ouvert sous terre quitte la carte du village pour celle de la cabane.
     Ce qu'il y découvre est gardé toute la saison (M.S.sousSols) ; fouiller sous terre ne lui coûte aucune action (M.fouilleGratuite).
   - La cabane du Pisteur laisse un <div id="cabane-carte"> : on y accroche le tableau des chemins secrets (M.carteMurale).
   - Un chemin secret en surface (plus bas, « Les chemins secrets en surface ») : son code, tapé par le Pisteur, l'emmène tout droit à son
     tableau ; le chemin s'y trace, un rond jaune palpite à son départ (la première fois, une bulle explique) ; le toucher le fait
     marcher le long du chemin jusqu'au lieu où il mène, qui s'ouvre. Le chemin reste sur le tableau : le retoucher y ramène.
   - Les visages (Romain, 5 novembre, 00 h 14) : dès l'enquête 1, le visage de l'habitant sur chaque maison ; dès l'enquête 2, plus de
     ronds jaunes d'aide, seulement la position de chaque villageois en ce moment (plus bas, « Les visages des villageois »).
   Chargé APRÈS moteur-actions.js : ajoute ses actions à M.A ; M.render appelle M.monterCarte après chaque rendu.
   ========================================================== */
(function(){
'use strict';
var M = window.M, D = window.DONNEES;
if(!M || !M.UI) return;
var UI = M.UI;
var SS = window.SOUTERRAINS || {lieux:[], elements:[]};
var DESSOUS = ['salle_coeur', 'tunnel_chene', 'tunnel_moulin', 'crypte', 'tunnel_puits'];
function vuesMem(){ UI.carteVues = UI.carteVues || {}; return UI.carteVues; }

/* ---------- Enquête 1, Pisteur : la carte qui se dévoile ----------
   On voit les lieux des missions faites, celui de la mission en cours, et tout ce qui a déjà été dévoilé
   (P.carteVue : un lieu dévoilé ne se recache jamais). Toutes ses missions à lieu faites : toute la carte (P.carteVue['*']).
   Renvoie la liste des lieux visibles, ou null quand toute la carte est visible (autres rôles, enquêtes 2 et 3). */
function carteGuidee(){
  var E = M.E(), P = M.P();
  if(E && P && E.tuto){ var T = M.tutoCarte ? M.tutoCarte() : null; return T ? T.visibles : null; }   /* le tutoriel de l'enquête 1, pour les quatre rôles (tuto.js) */
  if(!E || !P || E.id !== 1 || M.role() !== 'pisteur' || !M.missionsLieux) return null;
  var vu = P.carteVue || {};
  if(vu['*']) return null;
  var l = M.missionsLieux() || [];
  var reste = l.filter(function(x){ return !x.faite; });
  if(!l.length || !reste.length) return null;
  var ids = {};
  M.cle(vu).forEach(function(id){ ids[id] = 1; });
  l.forEach(function(x){ if(x.faite || x === reste[0]) [].concat(x.lieu || []).forEach(function(id){ if(window.Carte && Carte.LIEUX[id]) ids[id] = 1; }); });
  return M.cle(ids);
}
M.carteGuidee = carteGuidee;
/* Les lieux pas encore montrés sur cette tablette (seulement pour la carte qui se dévoile) */
function suiviCarte(){
  var E = M.E(), P = M.P();
  var vu = (P && P.carteVue) || {};
  if(!window.Carte || !E || !P || E.id !== 1 || !(E.tuto || M.role() === 'pisteur') || vu['*'] || !M.missionsLieux || !(E.tuto || M.missionsLieux().length)) return {suivi:false, guide:null, nouveaux:[]};
  var guide = carteGuidee();
  var visibles = guide || M.cle(Carte.LIEUX).filter(function(id){ return Carte.LIEUX[id].zone !== 'dessous'; });
  return {suivi:true, guide:guide, tout:!guide, nouveaux:visibles.filter(function(id){ return !vu[id]; })};
}

/* ---------- Les sous-sols et les chemins secrets (Pisteur seulement) ---------- */
/* M.S.sousSols = {vus:{élément des sous-sols: enquête}, montres:{déjà regardé sur le tableau}, joue:{enquête: 1},
   chemins:{chemin secret en surface: enquête}, pris:{chemin déjà pris au moins une fois}} ; dans montres, un chemin est 'ch:' + id */
function etatSS(){
  var S = M.S;
  if(!S.sousSols || typeof S.sousSols !== 'object') S.sousSols = {};
  var st = S.sousSols; st.vus = st.vus || {}; st.montres = st.montres || {}; st.joue = st.joue || {}; st.chemins = st.chemins || {}; st.pris = st.pris || {};
  return st;
}
/* Les chemins secrets en surface de toutes les enquêtes (E.chemins) : [{c:chemin, e:numéro de l'enquête}] */
function tousChemins(){
  var l = [];
  M.cle(window.ENQUETES || {}).forEach(function(n){
    var V = window.ENQUETES[n];
    ((V && V.chemins) || []).forEach(function(c){ if(c && c.id && c.pts && c.pts.length > 1) l.push({c:c, e:+n}); });
  });
  return l;
}
function cheminDef(id){ var x = tousChemins().filter(function(y){ return y.c.id === id; })[0]; return x ? x.c : null; }
/* ce qui fait apparaître un chemin : ses conditions (c.revele), sinon son code reçu */
function reveleChemin(c){ return c.revele || (c.code ? [{code:c.code}] : []); }
/* Note les découvertes de l'enquête en cours (appelé après chaque rendu) : elles restent pour toute la saison */
M.majSousSols = function(){
  var E = M.E(), P = M.P();
  if(!E || !P || M.role() !== 'pisteur' || P.defaite) return false;
  var st = etatSS(), chg = false;
  if(!st.joue[E.id]){ st.joue[E.id] = 1; chg = true; }
  (SS.elements || []).forEach(function(x){
    if(x.enquete === E.id && !st.vus[x.id] && x.revele && x.revele.length && M.besoinOk(x.revele)){ st.vus[x.id] = E.id; chg = true; }
  });
  (E.chemins || []).forEach(function(c){
    var r = reveleChemin(c);
    if(c && c.id && !st.chemins[c.id] && r.length && M.besoinOk(r)){ st.chemins[c.id] = E.id; chg = true; }
  });
  if(chg) M.sauver();
  return chg;
};
/* Les chemins secrets en surface qu'il connaît (même règle que les sous-sols pour une enquête d'avant jouée sans eux) */
function cheminsConnus(){
  var E = M.E(), st = etatSS();
  if(M.role() !== 'pisteur') return [];
  try{ M.majSousSols(); }catch(e){}
  return tousChemins().filter(function(x){ return st.chemins[x.c.id] || (E && x.e < E.id && !st.joue[x.e]); }).map(function(x){ return x.c; });
}
/* Tout ce qu'il a découvert sous le village : {id:1}.
   Une enquête d'avant jouée sans les sous-sols (vieille sauvegarde, mode test) compte comme toute découverte. */
function decouverts(){
  var E = M.E(), st = etatSS(), l = {};
  if(M.role() !== 'pisteur') return l;
  try{ M.majSousSols(); }catch(e){}
  (SS.elements || []).forEach(function(x){
    if(st.vus[x.id] || (E && x.enquete < E.id && !st.joue[x.enquete])) l[x.id] = 1;
  });
  return l;
}
function nouveauxSS(){
  var st = etatSS();
  return M.cle(decouverts()).filter(function(id){ return !st.montres[id]; })
    .concat(cheminsConnus().filter(function(c){ return !st.montres['ch:' + c.id]; }).map(function(c){ return 'ch:' + c.id; }));
}
M.sousSolsDecouverts = function(){ return M.cle(decouverts()); };
M.cheminsSecrets = function(){ return cheminsConnus().map(function(c){ return c.id; }); };
/* ✨ sur l'onglet Cabane : des chemins secrets (sous terre ou en surface) pas encore regardés sur le chevalet (cabane.js) */
M.nouveauxSousSols = function(){ return M.role() === 'pisteur' ? nouveauxSS().length : 0; };
/* Un lieu souterrain que le Pisteur a trouvé sous terre : il est sur la carte de sa cabane, plus sur celle du village */
function dansCabane(lieu, ss){
  if(M.role() !== 'pisteur') return false;
  ss = ss || decouverts();
  return (SS.elements || []).some(function(x){ return x.type === 'salle' && x.lieu === lieu && ss[x.id]; });
}
M.dansCabane = function(lieu){ return dansCabane(lieu); };
/* Fouiller un lieu souterrain ne coûte aucune action au Pisteur : chaque passage trouvé lui donne de quoi chercher plus */
M.fouilleGratuite = function(lieu){
  var E = M.E();
  if(M.role() !== 'pisteur' || !lieu) return false;
  return (SS.lieux || []).indexOf(lieu) >= 0 || !!(E && E.lieux && E.lieux[lieu] && E.lieux[lieu].souterrain);
};

/* ---------- Pastille ✨ sur l'onglet Carte : un lieu (ou un passage) vient de s'ouvrir et n'a pas encore été vu ---------- */
M.badgeCarte = function(){
  var P = M.P();
  if(!P || P.onglet === 'carte' || !window.Carte) return '';
  var n = suiviCarte().nouveaux.length;   /* les sous-sols ont leur ✨ sur l'onglet Cabane */
  return n ? '<em class="ca-badge" aria-label="Nouveau sur la carte">✨</em>' : '';
};

/* ---------- Les visages des villageois sur la carte (Romain, 5 novembre, 00 h 14 ; DESIGN 12.19) ----------
   · Dès l'enquête 1, pour tous les rôles : sur chaque maison, un petit rond avec le visage de son habitant (E.registre[id].maison).
     On ne cherche plus les adresses : on voit tout de suite qui habite où.
   · Dès l'enquête 2 : plus de ronds jaunes d'aide sur la carte ; à la place, là où est chaque villageois en ce moment,
     une petite icône avec son visage (E.pnj[id].ou). Chez lui : son rond sur la maison ET l'icône de présence.
   Chaque visage est le portrait du villageois (Persos.pnj), recadré sur la tête, dans une image ronde (data:URI), faite une seule fois. */
var VISAGES = {}, CADRE_VISAGE = '42 26 116 116';
function visage(id){
  if(VISAGES[id] !== undefined) return VISAGES[id];
  var s = '';
  try{ if(window.Persos && Persos.pnj && Persos.PNJ && Persos.PNJ[id]) s = Persos.pnj(id, {anime:false, id:'v'}) || ''; }catch(e){ s = ''; }
  if(!s) return (VISAGES[id] = null);
  var t = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><clipPath id="rond"><circle cx="50" cy="50" r="50"/></clipPath></defs><g clip-path="url(#rond)">' +
    s.replace(/^\s*<svg[^>]*>/, '<svg x="0" y="0" width="100" height="100" viewBox="' + CADRE_VISAGE + '">') + '</g></svg>';
  VISAGES[id] = 'data:image/svg+xml,' + t.replace(/\s+/g, ' ').replace(/"/g, '\'').replace(/%/g, '%25').replace(/#/g, '%23').replace(/&/g, '%26').replace(/</g, '%3C').replace(/>/g, '%3E');
  return VISAGES[id];
}
M.visageCarte = visage;
/* Ceux qu'on connaît : le registre de l'enquête (le Sage le lit à toute l'équipe). Les autres (Romain, 5 novembre, 01 h 20) :
   un petit « ? » à la place de leur visage, sur leur maison comme sur la carte. */
/* (le maire signe la lettre de chaque enquête : tout le monde le connaît, même s'il n'est pas dans le registre, comme à l'enquête 1) */
/* (et ceux qui jouent un rôle dans l'histoire : ceux à qui on peut parler dans cette enquête, comme Silas le garde ou Fortuné à l'E2 ;
   Romain, 5 novembre, 12 h 31 ; jamais « voisin », qui n'est personne en particulier) */
function connu(E, id){ return id === 'grosbec' || !!(E && E.registre && E.registre[id]) || !!(E && E.pnj && E.pnj[id] && id !== 'voisin'); }
/* Qui habite où : {maison: {id, nom} | {inconnu:true}} — le registre de l'enquête d'abord, puis où chacun habite d'habitude
   (donnees.js, D.PNJ[id].domicile) ; une maison sans habitant n'a rien */
var ELLES = {melusine:1, odette:1, iris:1, margot:1};
function habitants(E){
  var h = {};
  M.cle((E && E.registre) || {}).forEach(function(id){
    var m = E.registre[id].maison;
    if(m && Carte.MAISONS[m] && !h[m] && visage(id)) h[m] = {id:id, nom:(D.PNJ[id] || {}).nom || id, elle:!!ELLES[id]};
  });
  M.cle(D.PNJ).forEach(function(id){
    var m = D.PNJ[id].domicile;
    if(!m || !Carte.MAISONS[m] || h[m]) return;
    if(!connu(E, id)) h[m] = {inconnu:true, pid:id};   /* (pid : pour savoir s'il est chez lui, jamais montré) */
    else if(visage(id)) h[m] = {id:id, nom:(D.PNJ[id] || {}).nom || id, elle:!!ELLES[id]};   /* connu sans être au registre (Silas, E2) : son visage chez lui */
  });
  return h;
}
M.habitantsCarte = function(){ var E = M.E(); return window.Carte && E ? habitants(E) : {}; };
/* ---------- Où est chacun, à chaque moment de chaque enquête (Romain, 5 novembre, 8 h 59 ; DESIGN 12.20) ----------
   Pour tous les rôles, dès l'enquête 1. Tous ceux qui comptent dans l'enquête (E.pnj, et ceux du registre) :
   · chez lui : le rond de sa maison, et le petit triangle jaune qui flotte au-dessus (pas d'autre icône) ;
   · ailleurs : le rond de sa maison est grisé, et son visage (cerclé de jaune, le triangle au-dessus) est là où il est ;
   · on ne sait pas où il est (Tim au fond du trou à l'enquête 1, Odette enfermée à l'enquête 2) : seulement le rond grisé.
   Là où il est : E.pnj[id].ou (on peut lui parler), sinon E.pnj[id].carte (il est là, mais occupé : E.pnj[id].occupe, moteur-roles.js).
   Quelqu'un qu'on ne connaît pas : un « ? » (ni son visage, ni son nom). */
function ouEst(E, id, mid){ var N = (E.pnj || {})[id] || {}; return (N.ou && N.ou[mid]) || (N.carte && N.carte[mid]) || null; }
M.ouEst = function(id){ var E = M.E(); return E ? ouEst(E, id, M.momentId()) : null; };
function concernes(E){
  var l = M.cle(E.pnj || {}).filter(function(id){ return id !== 'voisin' && D.PNJ[id]; });   /* (le voisin n'est pas un villageois : une porte) */
  M.cle(E.registre || {}).forEach(function(id){ if(l.indexOf(id) < 0 && D.PNJ[id]) l.push(id); });
  return l;
}
function presences(E, hab){
  var mid = M.momentId(), lieux = [], maisons = [], chez = {}, absents = {}, maisonDe = {};
  M.cle(hab).forEach(function(m){ var i = hab[m].id || hab[m].pid; if(i) maisonDe[i] = m; });
  concernes(E).forEach(function(id){
    /* E.carteSecret : ceux dont la carte ne doit rien dire, même pas qu'ils ne sont pas chez eux (Tim à l'enquête 1 : ce serait la solution ;
       Romain, 5 novembre, 9 h 23) : le rond de leur maison reste normal, sans triangle ni gris */
    if((E.carteSecret || []).indexOf(id) >= 0) return;
    var ou = ouEst(E, id, mid), m = maisonDe[id];
    var ouM = ou && (/^[LFB]\d$/.test(ou) ? ou : (Carte.LIEUX[ou] && Carte.LIEUX[ou].maison) || null);   /* (sa boutique est sa maison : Gaspard à la boulangerie) */
    /* le Barde : un villageois fâché (ou « Encore toi ? ») a son rond et son triangle en rouge (Romain, 5 novembre, 12 h 31 ; barde.js) */
    var fache = !!(M.pnjFache && M.pnjFache(id));
    if(m && ouM === m){ chez[m] = fache ? 'fache' : 1; return; }
    if(m) absents[m] = 1;
    if(!ou || !visage(id)) return;
    var c = connu(E, id), nom = c ? (D.PNJ[id] || {}).court || id : 'Quelqu\'un', estMaison = /^[LFB]\d$/.test(ou);
    if(estMaison ? !Carte.MAISONS[ou] : !Carte.LIEUX[ou]) return;
    var mq = {visage:c ? id : null, inconnu:!c, titre:nom, act:estMaison ? 'maison' : 'lieu', id:ou, classe:'presence', echelle:.8, fache:fache};
    if(estMaison){ mq.maison = ou; maisons.push(mq); } else { mq.lieu = ou; lieux.push(mq); }
  });
  return {marqueurs:lieux.concat(maisons), chez:chez, absents:absents};
}
/* Dès l'enquête 2, la carte n'aide plus (plus de ronds jaunes) : seulement la position des villageois */
function sansAides(E){ return !!E && (E.id || 1) >= 2; }
M.carteSansAides = function(){ return sansAides(M.E()); };

/* le milieu du rectangle qui contient ces points (sans privilégier aucun d'eux) */
function milieu(pts){
  var b = null;
  pts.forEach(function(p){ if(p) b = b ? [Math.min(b[0], p.x), Math.min(b[1], p.y), Math.max(b[2], p.x), Math.max(b[3], p.y)] : [p.x, p.y, p.x, p.y]; });
  return b ? {x:(b[0] + b[2]) / 2, y:(b[1] + b[3]) / 2} : null;
}
function centreDe(ids){ return milieu((ids || []).map(function(id){ return Carte.position(id); })); }
function posSS(x){ return x.pts ? {x:x.pts[0][0], y:x.pts[0][1]} : {x:x.x, y:x.y}; }

/* ---------- Le contenu d'une carte : ou = 'onglet' (l'onglet Carte) ou 'cabane' (la carte murale) ---------- */
function contenu(ou, w, h){
  var E = M.E(), P = M.P(), role = M.role(), mid = M.momentId();
  var ss = decouverts();
  var couche = ou === 'cabane' && role === 'pisteur' ? 'dessous' : 'surface';   /* le village dans l'onglet, les sous-sols dans la cabane */
  var r = Carte.reglagesEcran(w, h, ou === 'cabane');
  /* ce qui est nouveau surgit (et compte comme vu) quand la carte est vraiment regardée : l'onglet Carte sans fenêtre ouverte,
     ou la carte murale juste après qu'il a touché son bouton (sinon elle peut être hors de l'écran, dans la cabane) */
  var montrer = !UI.modal && (ou === 'onglet' || UI.cabaneRegardee === true);
  var info = M.infosCarte();
  var res = {ou:ou, couche:couche, etiquette:r.etiquette, commit:null, depart:null};
  var svg = '';
  try{
    if(couche === 'dessous'){
      var st = etatSS();
      var elems = (SS.elements || []).filter(function(x){ return ss[x.id]; });
      var neufs = montrer ? elems.filter(function(x){ return !st.montres[x.id]; }).map(function(x){ return x.id; }) : [];
      /* les chemins secrets en surface : un chemin pas encore regardé n'est dessiné que sous ses yeux (montrer) : il s'y trace alors */
      var chs = cheminsConnus().filter(function(c){ return montrer || st.montres['ch:' + c.id]; });
      var neufsCh = montrer ? chs.filter(function(c){ return !st.montres['ch:' + c.id]; }).map(function(c){ return c.id; }) : [];
      var premier = !M.cle(st.pris).length;   /* il n'a encore jamais pris de chemin secret : la bulle qui explique */
      var lch = chs.map(function(c){ return {id:c.id, nom:c.nom || 'Un chemin secret', ic:c.ic || '👣', pts:c.pts, etiquette:c.etiquette || null, neuf:neufsCh.indexOf(c.id) >= 0, pris:!!st.pris[c.id], guide:false}; });
      var g0 = premier ? lch.filter(function(c){ return !c.pris; })[0] : null;
      if(g0) g0.guide = true;
      var ptsCh = function(l){ var t = []; l.forEach(function(c){ c.pts.forEach(function(q){ t.push({x:q[0], y:q[1]}); }); }); return t; };
      /* le tableau s'ouvre entre le milieu du chemin neuf et son départ (le rond jaune et son « Touche ici ! » restent dans un cadre bas) */
      var chNeuf = chs.filter(function(c){ return neufsCh.indexOf(c.id) >= 0; }), focus = chNeuf.length ? milieu(ptsCh(chNeuf)) : null;
      if(focus){ var a0 = chNeuf[0].pts[0]; focus = {x:focus.x, y:(focus.y + a0[1]) / 2}; }   /* (en largeur, le milieu : un cadre étroit voit tout le chemin) */
      res.commit = {ss:neufs, ch:neufsCh, pan:!focus && neufs.length ? milieu(elems.filter(function(x){ return neufs.indexOf(x.id) >= 0; }).map(posSS)) : null};
      res.focus = focus;   /* un chemin qui apparaît : le tableau s'ouvre dessus, zoomé (monterVue) */
      res.depart = milieu(elems.map(posSS).concat(ptsCh(chs))) || {x:500, y:700};
      res.guide = g0 || null;
      res.vide = !elems.length && !chs.length;
      svg = Carte.svg({id:'ss' + ou, moment:mid, niveau:'dessous', actifs:info.actifs, verrous:info.verrous, caches:DESSOUS,
        sousSols:{elements:elems, apparus:neufs}, chemins:{liste:lch}, etiquette:r.etiquette, toucheMin:r.toucheMin});
    } else {
      var suivi = suiviCarte(), guide = suivi.guide;
      var actifs = info.actifs, verrous = info.verrous, marqueurs = info.marqueurs;
      /* les souterrains : leur entrée n'apparaît que pour le rôle qui doit y aller (ouverte ou fermée à clé).
         Pour le Pisteur, une fois le passage trouvé, elle part sur le tableau des chemins secrets de sa cabane. */
      var caches = DESSOUS.filter(function(id){ return (actifs.indexOf(id) < 0 && verrous.indexOf(id) < 0) || dansCabane(id, ss); });
      actifs = actifs.filter(function(id){ return caches.indexOf(id) < 0; });
      verrous = verrous.filter(function(id){ return caches.indexOf(id) < 0; });
      if(guide){
        caches = M.cle(Carte.LIEUX).filter(function(id){ return guide.indexOf(id) < 0; });
        actifs = actifs.filter(function(id){ return guide.indexOf(id) >= 0; });
        verrous = verrous.filter(function(id){ return guide.indexOf(id) >= 0; });
        marqueurs = marqueurs.filter(function(mq){ return !mq.lieu || guide.indexOf(mq.lieu) >= 0; });
      }
      /* le tutoriel (tuto.js) : seulement le lieu (ou la maison) de l'étape en cours se touche ; ce qui est déjà vu reste là, grisé */
      var T = guide && M.tutoCarte ? M.tutoCarte() : null;
      if(T){ actifs = T.ouverts.slice(); verrous = T.verrous.slice(); marqueurs = T.marqueurs.slice(); }
      var apparus = montrer ? suivi.nouveaux.filter(function(id){ return caches.indexOf(id) < 0; }) : [];
      if(montrer && suivi.suivi && (apparus.length || suivi.tout)) res.commit = {ids:apparus, tout:!!suivi.tout, pan:apparus.length ? centreDe(apparus) : null};
      if(T && montrer && T.ici && UI.tutoIci !== T.ici){ UI.tutoIci = T.ici; res.commit = res.commit || {ids:[], tout:false}; res.commit.pan = centreDe([T.ici]); res.commit.force = true; }   /* l'étape change de lieu : la carte y glisse */
      res.depart = centreDe(T && T.ici ? [T.ici] : guide || actifs) || {x:500, y:745};
      var ouverts = actifs.filter(function(id){ return P.vus['lieu:' + id + ':' + P.moment]; });
      /* dès l'enquête 2 : plus de ronds jaunes ni de marqueurs d'aide (les habitants du Barde, ✨ les missions bonus) ; tous les lieux se touchent,
         et seulement la position de chaque villageois. Les ingrédients notés par l'Alchimiste (ses propres notes) restent. */
      var aides = !sansAides(E) || !!T;
      var hab = habitants(E), vis = {};
      /* où est chacun, dans toutes les enquêtes (dès l'enquête 1 : la position de chacun remplace le marqueur « à qui parler » du tutoriel) */
      var PR = presences(E, hab);
      /* (un villageois sur un lieu qu'on ne peut pas encore toucher : on le voit, mais son visage ne se touche pas) */
      PR.marqueurs.forEach(function(mq){
        if(mq.lieu && (caches.indexOf(mq.lieu) >= 0 || (T && T.ouverts.indexOf(mq.lieu) < 0) || (guide && actifs.indexOf(mq.lieu) < 0 && verrous.indexOf(mq.lieu) < 0))) mq.act = null;
        if(mq.maison && T && (T.maisons || []).indexOf(mq.maison) < 0) mq.act = null;
      });
      /* les missions bonus gardent leur icône dans toutes les enquêtes (Romain, 10 novembre, 16 h 56 : sinon on touche les lieux au hasard pour les trouver) */
      marqueurs = (aides ? marqueurs.filter(function(mq){ return mq.classe !== 'pnj'; }) : marqueurs.filter(function(mq){ return mq.classe === 'ingr' || mq.classe === 'bonus'; })).concat(PR.marqueurs);
      M.cle(hab).forEach(function(k){ if(hab[k].id) vis[hab[k].id] = visage(hab[k].id); });
      marqueurs.forEach(function(mq){ if(mq.visage) vis[mq.visage] = visage(mq.visage); });
      svg = Carte.svg({id:ou, moment:mid, niveau:'surface', actifs:actifs, verrous:verrous, caches:caches, marqueurs:marqueurs, riviere:E && E.riviereRouge ? 'rouge' : null, lavoir:E && (E.lavoirRose || E.riviereRouge) ? 'rose' : null,   /* enquête 2 : l'eau du lavoir rose (Romain, 22 h 49) */
        calque:null, surbrillance:T ? T.ici : null, maisons:T ? T.maisons : null, etiquette:r.etiquette, toucheMin:r.toucheMin, apparus:apparus, ouverts:ouverts,
        habitants:hab, visages:vis, aides:aides, presents:PR.chez, absents:PR.absents});
    }
  }catch(e){ console.error(e); svg = '<p>Erreur de carte</p>'; }
  res.html = '<div class="ca-vue"><div class="ca-monde">' + svg + '</div></div>' +
    '<i class="ca-bord g"></i><i class="ca-bord d"></i><i class="ca-bord h"></i><i class="ca-bord b"></i>' +
    (couche === 'dessous' ? '<div class="ca-titre-ss">🗺️ Les chemins secrets</div>' +
      (res.vide ? '<p class="ca-vide-ss">Rien pour l\'instant… Explore bien : chaque chemin secret que tu découvres, dans le village ou sous la terre, apparaîtra ici.</p>' : '') +
      (res.guide ? bulleChemin(res.guide) : '') : '');
  return res;
}
/* La première fois qu'il utilise son tableau (Romain, 5 novembre, 01 h 30 : un vrai guidage) : une bulle courte, avec 🔊 (jamais lue toute seule) */
function bulleChemin(c){
  var nom = String(c.nom || 'ce chemin'), t = 'Voici ton tableau des chemins secrets ! Touche le rond jaune pour prendre ' + nom.charAt(0).toLowerCase() + nom.slice(1) + '.';
  return '<div class="ca-chemin-bulle' + (c.neuf ? ' ca-chemin-bulle-neuve' : '') + '" role="status"><span aria-hidden="true">👆</span><p>' + M.esc(t) + '</p>' + M.lireBtn(t) + '</div>';
}

/* ---------- L'onglet Carte ---------- */
M.ongletCarteHTML = function(){
  if(!window.Carte || !Carte.svg) return '<p class="doux">La carte n\'est pas disponible.</p>';
  var c = contenu('onglet', window.innerWidth || 800, Math.max(200, (window.innerHeight || 800) - 140));
  UI.carteAttente = c;
  return '<div id="carte-ici" class="ca-plein ca-r-' + M.role() + ' ca-couche-' + c.couche + '" data-ou="onglet">' + c.html + '</div>';
};

/* ---------- Monter une carte (après le rendu) : elle garde l'endroit où on regardait, fait surgir ce qui est nouveau ---------- */
var vues = {onglet:null, cabane:null};
/* Une carte qui s'ouvre (l'onglet Carte, ou la cabane du Pisteur, qui n'étaient pas à l'écran au rendu d'avant) montre tout le village
   en entier (Romain, 4 novembre, 21 h 12) ; ＋ / − pour zoomer. Tant qu'elle reste ouverte, elle garde son zoom et sa place d'un rendu à l'autre. */
var ouverture = {onglet:true, cabane:true};
function arreterVue(ou){ var v = vues[ou]; vues[ou] = null; if(v){ try{ v.arreter(); }catch(e){} } if(ou === 'cabane') UI.carteMurale = null; }
function monterVue(el, c){
  var P = M.P();
  var cle = P.id + ':' + M.role() + ':' + c.ou + ':' + c.couche;
  var neuve = ouverture[c.ou]; ouverture[c.ou] = false;
  var mem = neuve ? null : (vuesMem()[cle] || null);
  var foc = c.focus || null;   /* un chemin secret qui apparaît sur le tableau : on zoome dessus (le plus gros zoom du cadre) */
  var v = Carte.monter(el, {murale:c.ou === 'cabane', centre:foc || mem || c.depart, zoom:foc ? 1 : mem && typeof mem.z === 'number' ? mem.z : 0,   /* 0 : toute la carte ; sinon le zoom gardé d'un rendu à l'autre */
    surVue:function(p){ vuesMem()[cle] = p; },
    surTaille:function(w, h){
      /* le cadre a beaucoup changé (tablette tournée) : si les étiquettes doivent changer de taille, on redessine cette carte */
      var r = Carte.reglagesEcran(w, h, c.ou === 'cabane');
      if(r.etiquette !== c.etiquette) setTimeout(function(){ if(vues[c.ou] && vues[c.ou].vue === v) remonter(c.ou); }, 0);
    }});
  if(!v) return null;
  var A = c.commit;
  if(A){
    if(A.ids){ P.carteVue = P.carteVue || {}; A.ids.forEach(function(id){ P.carteVue[id] = 1; }); if(A.tout) P.carteVue['*'] = 1; }
    if(A.ss){ var st = etatSS(); A.ss.forEach(function(id){ st.montres[id] = 1; }); }
    if(A.ch){ var st2 = etatSS(); A.ch.forEach(function(id){ st2.montres['ch:' + id] = 1; }); }
    M.sauver();
    var nv = (A.ids && A.ids.length) || (A.ss && A.ss.length) || (A.ch && A.ch.length);
    if(nv || A.force){
      setTimeout(function(){ if(A.pan && vues[c.ou] && vues[c.ou].vue === v) v.allerVers(A.pan); }, 250);
      if(nv) setTimeout(function(){ if(vues[c.ou] && vues[c.ou].vue === v) M.son('magie'); }, 420);
    }
  }
  return v;
}
function ajusterOnglet(){
  var ici = document.getElementById('carte-ici'); if(!ici) return;
  var nav = document.querySelector('.b-onglets'), bas = nav ? nav.offsetHeight : 0;
  ici.style.height = Math.max(220, Math.round(window.innerHeight - (ici.getBoundingClientRect().top + window.scrollY) - bas)) + 'px';
}
function remonter(ou){
  if(ou === 'cabane'){ var cab = document.getElementById('cabane-carte'); if(cab) M.carteMurale(cab); return; }
  var ici = document.getElementById('carte-ici'); if(!ici) return;
  arreterVue('onglet');
  var c = contenu('onglet', window.innerWidth || 800, Math.max(200, (window.innerHeight || 800) - 140));
  ici.className = 'ca-plein ca-r-' + M.role() + ' ca-couche-' + c.couche;
  ici.innerHTML = c.html;
  var v = monterVue(ici, c);
  vues.onglet = v ? {vue:v, arreter:v.arreter, ajuster:v.ajuster, html:c.html, couche:c.couche, el:ici} : null;
}
M.monterCarte = function(){
  try{ M.majSousSols(); }catch(e){ console.error(e); }
  ouverture.onglet = !vues.onglet; ouverture.cabane = !vues.cabane;   /* pas à l'écran au rendu d'avant : elle s'ouvre */
  arreterVue('onglet'); arreterVue('cabane');
  if(!window.Carte || !Carte.monter || !M.P()) return;
  var ici = document.getElementById('carte-ici');
  if(ici){
    ajusterOnglet();
    var c = UI.carteAttente || contenu('onglet', window.innerWidth || 800, Math.max(200, (window.innerHeight || 800) - 140));
    UI.carteAttente = null;
    var v = monterVue(ici, c);
    vues.onglet = v ? {vue:v, arreter:v.arreter, ajuster:v.ajuster, html:c.html, couche:c.couche, el:ici} : null;
  }
  var cab = document.getElementById('cabane-carte');
  if(cab && !cab.children.length) M.carteMurale(cab);
};
/* (Romain, 5 novembre, 17 h 01 : « ça fait sauter l'image ») M.render garde la carte telle quelle — sans la redessiner — quand
   rien n'y change : même dessin (mêmes lieux ouverts, mêmes visages, même surbrillance du tutoriel), rien de neuf à faire surgir.
   Alors seuls le bandeau du haut, les onglets et la fenêtre (ou la bulle) sont redessinés : la carte garde sa place, ses animations,
   et la bulle ne disparaît plus un instant. (contenu() est appelé « pour voir » : ce qu'il note dans UI est remis comme avant.) */
/* (chaque dessin a ses propres ids, « caonglet4-herbe » : on donne au nouveau ceux du dessin affiché) */
function memesIds(neuf, ancien){
  var a = /\bca(?:ss)?(?:onglet|cabane)\d+-/.exec(ancien || ''), b = /\bca(?:ss)?(?:onglet|cabane)\d+-/.exec(neuf || '');
  return a && b && a[0] !== b[0] ? String(neuf).split(b[0]).join(a[0]) : String(neuf || '');
}
/* De petites différences (un rond qui ne pulse plus, une étiquette, un visage qui change de place…) : on les recopie sur la carte
   affichée, sans la redessiner. ancien et neuf sont les deux dessins (texte) ; vivant, la carte à l'écran (faite d'ancien, plus ce
   que la carte y a ajouté en marchant, à la fin). Même forme partout, sinon on renonce (false : on redessine). */
function recopier(vivant, a, b, prof){
  if(!vivant || vivant.nodeName !== a.nodeName) return false;
  /* (un morceau qui change de forme — une étiquette « Nouveau ! » qui s'en va… — : on remplace ce morceau-là seulement) */
  if(a.nodeType !== b.nodeType || a.nodeName !== b.nodeName){ if(prof < 2) return false; vivant.parentNode.replaceChild(document.importNode(b, true), vivant); return true; }
  if(a.nodeType === 3){ if(a.nodeValue !== b.nodeValue) vivant.nodeValue = b.nodeValue; return true; }
  if(a.nodeType !== 1) return true;
  var k, at;
  for(k = 0; k < b.attributes.length; k++){ at = b.attributes[k]; if(a.getAttribute(at.name) !== at.value) vivant.setAttribute(at.name, at.value); }
  for(k = 0; k < a.attributes.length; k++){ at = a.attributes[k]; if(!b.hasAttribute(at.name)) vivant.removeAttribute(at.name); }
  var ca = a.childNodes, cb = b.childNodes, cv = vivant.childNodes;
  if(cv.length < ca.length) return false;
  if(ca.length !== cb.length){
    if(prof < 2) return false;
    var nv = document.importNode(b, true); vivant.parentNode.replaceChild(nv, vivant); return true;
  }
  for(k = ca.length - 1; k >= 0; k--) if(!recopier(cv[k], ca[k], cb[k], (prof || 0) + 1)) return false;
  return true;
}
function patcherCarte(ici, ancien, neuf){
  try{
    var ta = document.createElement('template'), tb = document.createElement('template');
    ta.innerHTML = ancien; tb.innerHTML = neuf;
    var A = ta.content.childNodes, B = tb.content.childNodes, V = ici.childNodes;
    if(A.length !== B.length || V.length < A.length) return false;
    for(var k = 0; k < A.length; k++) if(!recopier(V[k], A[k], B[k], 0)) return false;
    return true;
  }catch(e){ console.error(e); return false; }
}
M.carteInchangee = function(){
  var v = vues.onglet, ici = document.getElementById('carte-ici');
  if(!v || !v.html || !ici || ici !== v.el || !ici.isConnected || !window.Carte || !M.P()) return false;
  try{ M.majSousSols(); }catch(e){ console.error(e); }
  var ti = UI.tutoIci, c;
  try{ c = contenu('onglet', window.innerWidth || 800, Math.max(200, (window.innerHeight || 800) - 140)); } finally { UI.tutoIci = ti; }
  if(!c || c.couche !== v.couche) return false;
  var A = c.commit;
  if(A && ((A.ids && A.ids.length) || (A.ss && A.ss.length) || (A.ch && A.ch.length) || A.force || A.tout)) return false;
  var h = memesIds(c.html, v.html);
  if(h === v.html) return true;
  if(!patcherCarte(ici, v.html, h)) return false;
  v.html = h;
  return true;
};
/* (la carte gardée : le bandeau du haut a pu changer de hauteur) */
M.carteAjuster = function(){ ajusterOnglet(); var v = vues.onglet; if(v && v.ajuster) try{ v.ajuster(); }catch(e){} };
/* La carte murale de la cabane du Pisteur : la même carte, accrochée dans le cadre que la cabane a préparé.
   Renvoie {ajuster, allerVers, couche, arreter} (aussi dans M.UI.carteMurale). */
M.carteMurale = function(el){
  if(!el || !window.Carte || !Carte.monter || !M.P()) return null;
  arreterVue('cabane');
  el.classList.add('ca-plein', 'ca-murale');
  el.classList.toggle('ca-etroit', (el.clientWidth || 300) < 300);   /* petit cadre (téléphone couché) : bouton Village / Sous-sols plus serré */
  el.classList.toggle('ca-serre', (el.clientWidth || 300) < 480);    /* cadre étroit (téléphone) : la bulle des chemins secrets prend toute la largeur */
  el.classList.toggle('ca-bas', (el.clientHeight || 300) < 320);     /* cadre très bas (téléphone couché) : pas de place pour la bulle, le « 👆 Touche ici ! » suffit */
  var c = contenu('cabane', el.clientWidth || 300, el.clientHeight || 250);
  el.classList.toggle('ca-couche-dessous', c.couche === 'dessous');
  el.innerHTML = c.html;
  var v = monterVue(el, c);
  if(!v) return null;
  var h = {vue:v, ajuster:function(){ v.ajuster(); }, allerVers:function(id, doux){ v.allerVers(id, doux); },
    arreter:function(){ v.arreter(); }};
  vues.cabane = h; UI.carteMurale = h;
  return h;
};
/* La cabane a fait glisser la carte du chevalet sous les yeux du Pisteur (cabane.js) :
   ce qui est nouveau sous terre surgit maintenant, avec son petit son, et compte comme vu */
M.regarderCarteMurale = function(){
  var cab = document.getElementById('cabane-carte');
  if(!cab || UI.modal || !nouveauxSS().length) return false;
  UI.cabaneRegardee = true;
  try{ M.carteMurale(cab); } finally { UI.cabaneRegardee = false; }
  return true;
};
window.addEventListener('resize', function(){
  if(!vues.onglet || !document.getElementById('carte-ici')) return;
  ajusterOnglet();   /* la hauteur suit l'écran ; la vue s'ajuste toute seule (ResizeObserver) */
});

/* ---------- Les chemins secrets en surface : le code, et prendre le chemin ---------- */
/* Le code d'un chemin secret de cette enquête, tapé par le Pisteur (moteur-actions.js, traiterCode) : noté dans son Carnet comme
   tout code reçu, puis tout droit à son tableau, dans sa cabane (cabane.js, UI.cbVersCarte) ; le chemin s'y trace sous ses yeux.
   Déjà reçu : on l'y ramène simplement. Pour un autre rôle, ce n'est pas un code à lui (« Ce code est pour le Pisteur »). */
M.codeChemin = function(id){
  var E = M.E(), P = M.P();
  if(!E || !P || M.role() !== 'pisteur' || !M.cabanePlein || !M.cabanePlein()) return false;
  var c = (E.chemins || []).filter(function(x){ return x && x.code === id && x.pts; })[0];
  if(!c) return false;
  if(!P.recus[id]){
    P.recus[id] = true;
    var n = M.nomCode(id), p = id.split(':'), I = ((p[0] === 'info' ? E.infos : E.objets) || {})[p[1]] || {};
    M.noter('Reçu : ' + n.nom + '. ' + (I.t || ''), n.ic);
    M.son('gain');
  } else M.son('page');
  try{ M.majSousSols(); }catch(e){ console.error(e); }
  P.onglet = 'role'; UI.modal = null; UI.saisie = []; UI.ecran = 'enquete'; UI.cbVersCarte = true;
  M.sauver(); M.render(); window.scrollTo(0, 0);
  return true;
};
function calme(){ try{ return window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches; }catch(e){ return false; } }
/* Le petit pion du Pisteur qui marche le long du chemin : sa tête (Persos), sinon son icône */
function pionChemin(){
  var t = '';
  try{ if(window.Persos && Persos.heros && M.heroObj) t = Persos.heros(M.heroObj(), {cadre:'tete', anime:false, fond:false, id:'chp' + Date.now()}) || ''; }catch(e){ t = ''; }
  var dedans = t ? t.replace(/^\s*<svg/i, '<svg x="-21" y="-21" width="42" height="42"') : '<text font-size="26" text-anchor="middle" dominant-baseline="central">' + ((D.ROLES.pisteur || {}).ic || '👣') + '</text>';
  return '<circle r="27" fill="#ffd23f" stroke="#24182e" stroke-width="4"/><circle r="22" fill="#fff4cf"/>' + dedans;
}
if(M.A){
  /* un mystère des sous-sols : relire ce qu'il a senti ou vu */
  M.A['sous-sol'] = function(el){
    var x = (SS.elements || []).filter(function(y){ return y.id === el.dataset.id; })[0];
    if(!x || !decouverts()[x.id]) return;
    M.son('page');
    M.ouvrir({type:'info', ic:x.ic || '❔', titre:x.nom, t:x.t || ''});
  };
  /* Toucher un chemin secret (son rond jaune, ou le chemin lui-même) : le Pisteur le suit jusqu'au bout, puis le lieu s'ouvre
     (comme s'il avait passé le garde). Un chemin qui ne mène à aucun lieu : on relit ce qu'on en sait. */
  var enRoute = 0;
  M.A.chemin = function(el){
    var id = el.dataset.id, c = cheminDef(id), P = M.P();
    if(!c || !P || P.etape !== 'jeu' || M.role() !== 'pisteur' || cheminsConnus().indexOf(c) < 0) return;
    if(enRoute && Date.now() - enRoute < 4000) return;   /* il marche déjà */
    var st = etatSS(); st.pris[id] = 1; M.sauver();
    var fin = function(){
      enRoute = 0;
      if(c.vers) M.A.lieu({dataset:{id:c.vers}});
      else { M.son('page'); M.ouvrir({type:'info', ic:c.ic || '👣', titre:c.nom || 'Un chemin secret', t:c.t || ''}); }
    };
    var svg = el.closest ? el.closest('svg') : null, ligne = svg && svg.querySelector('[data-act="chemin"][data-id="' + id + '"] .ca-chemin-ligne');
    M.son('pas');
    /* la bulle et le « Touche ici ! » s'en vont tout de suite */
    var mur = svg && svg.closest('.ca-plein'); if(mur){ [].forEach.call(mur.querySelectorAll('.ca-chemin-bulle, .ca-chemin-signe, .ca-chemin-onde'), function(x){ x.style.display = 'none'; }); }
    if(!ligne || !ligne.getTotalLength || calme()){ fin(); return; }
    var lg = 0; try{ lg = ligne.getTotalLength(); }catch(e){ lg = 0; }
    if(!lg){ fin(); return; }
    enRoute = Date.now();
    var g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    g.setAttribute('class', 'ca-chemin-pion'); g.setAttribute('pointer-events', 'none');
    try{ g.innerHTML = pionChemin(); }catch(e){}
    svg.appendChild(g);
    var t0 = 0, DUREE = 1700, fini = false;
    function poser(k){ var q = ligne.getPointAtLength(lg * k); g.setAttribute('transform', 'translate(' + q.x.toFixed(1) + ' ' + q.y.toFixed(1) + ')'); }
    function pas(t){
      if(fini) return;
      if(!t0) t0 = t;
      var k = Math.min(1, (t - t0) / DUREE), e = k < .5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2;
      try{ poser(e); }catch(er){ k = 1; }
      if(k < 1) requestAnimationFrame(pas); else { fini = true; setTimeout(fin, 260); }
    }
    poser(0);
    requestAnimationFrame(pas);
    setTimeout(function(){ if(!fini){ fini = true; fin(); } }, DUREE + 1500);   /* filet : l'onglet caché, rien ne bouge (requestAnimationFrame en pause) */
  };
}
})();
