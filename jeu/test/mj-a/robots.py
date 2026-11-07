"""Robots partagés : ROBOTS[jeu]['gagne'|'perd'] = code JS (fonction async) exécuté dans la page."""
ATT = "const att = ms => new Promise(r => setTimeout(r, ms)); const fini = () => !!document.querySelector('.mj-resultat');"
ECRAN = """const ecran = (svg, x, y) => { const m = svg.getScreenCTM(); const pt = svg.createSVGPoint(); pt.x = x; pt.y = y; const r = pt.matrixTransform(m); return {x:r.x, y:r.y}; };
const pd = (el, t, x, y, extra) => el.dispatchEvent(new PointerEvent(t, Object.assign({clientX:x, clientY:y, bubbles:true, pointerId:1, isPrimary:true, pointerType:'touch'}, extra||{})));"""
ROBOTS = {}
ROBOTS['traces'] = {
 'gagne': """async (mode) => { %s
   const T = document.querySelector('.mja-traces');
   mode = mode || 'parfait'; const delai = mode.startsWith('corrige') ? +mode.slice(7) : 0;
   let suit = -1, tSuit = null, fini2 = false; window.robotJournal = [];
   while(!fini()){
     const e = T.mjaEtat();
     if(e.phase !== 'marche'){ await att(80); continue; }
     const dVise = e.cam + e.YB - (e.vue.y + e.vue.h * 0.76);
     if(delai && suit < 0 && tSuit === null && e.fourches.length && e.pd > e.fourches[0].d - 4){ suit = e.fourches[0].leurres[0]; tSuit = e.t; window.robotJournal.push('prend la mauvaise branche'); }
     if(delai && suit >= 0 && e.t - tSuit > delai){ suit = -2; window.robotJournal.push('revient vers la bonne piste après ' + delai + ' s (perdu depuis ' + e.perduT.toFixed(1) + ' s)'); }
     if(mode === 'derive' && suit < 0 && suit !== -2){ const z = e.zones.find(z => z.court >= 0); if(z && e.pd > z.d1 - 6){ suit = z.court; window.robotJournal.push('suit le cul-de-sac après ' + z.type); } }
     let x, d;
     if(suit >= 0){ const fl = e.finLeurre(suit); d = Math.min(dVise, fl.d); x = e.leurre(suit, d); if(dVise >= fl.d - 6){ x = fl.x; d = fl.d; } }
     else { d = Math.min(dVise, e.L); x = e.cible(d); if(dVise >= e.L - 6){ x = e.arrivee.x; d = e.arrivee.d; } }
     T.mjaViserMonde(x, d);
     await att(40);
   }
   const r = document.querySelector('.mj-resultat p'); window.robotJournal.push('fin : ' + (r ? r.textContent : '?'));
 }""" % ATT,
 'perd': """async () => { %s const T = document.querySelector('.mja-traces'); while(!fini()){ const e = T.mjaEtat(); if(e.phase === 'marche') T.mjaViserMonde(e.px < e.W / 2 ? 30 : e.W - 30, e.pd); await att(200); } }""" % ATT,
}
ROBOTS['tir'] = {
 'gagne': """async (bruit) => { %s
   const T = document.querySelector('.mja-tir');
   while(!fini()){
     const e = T.mjaEtat();
     if(e.enVol || e.fleches <= 0){ await att(60); continue; }
     let best = null;
     const viv = e.cibles.map((c, i) => c ? i : -1).filter(i => i >= 0);
     for(const i of viv){
       const type = e.cibles[i].type;
       for(let ang = -1.4; ang < -0.05 && !best; ang += 0.02){
         for(let pu = 0.4; pu <= 1 && !best; pu += 0.02){
           let x = e.ARC.x + Math.cos(ang) * 14, y = e.ARC.y - 22 + Math.sin(ang) * 14, vx = Math.cos(ang) * pu * e.ARC.v, vy = Math.sin(ang) * pu * e.ARC.v, tt = e.t; const h = 1 / 90;
           for(let k = 0; k < 220; k++){
             vx += e.ventA(tt) * h; vy += e.ARC.g * h; x += vx * h; y += vy * h; tt += h;
             if(e.obstacle && e.obstacle(x, y, tt)) break;   /* une branche ou un oiseau sur la route : autre tir */
             const q = e.posCible(i, tt); let hit = false;
             if(type === 'sac'){ if((q.x-x)*(q.x-x) + (q.y-y)*(q.y-y) < 484) break;   /* dans le sac : raté */
               const ax = e.cibles[i].c.s.ax, ay = e.cibles[i].c.s.ay, dx = q.nx - ax, dy = q.ny - ay, l2 = dx*dx + dy*dy, u = Math.max(0.2, Math.min(0.8, ((x-ax)*dx + (y-ay)*dy) / l2)); const ex = ax + dx*u - x, ey = ay + dy*u - y; hit = ex*ex + ey*ey < 4 && ((x-ax)*dx + (y-ay)*dy) / l2 > 0.2 && ((x-ax)*dx + (y-ay)*dy) / l2 < 0.8; }
             else { const ex = q.x - x, ey = q.y - y; hit = ex*ex + ey*ey < 25; }
             if(hit){ best = {ang, pu}; break; }
             if(y > 430 || x > 600) break;
           }
         }
       }
       if(best) break;
     }
     if(best) T.mjaTirer(best.ang + (bruit || 0) * (Math.random() - 0.5), best.pu);
     await att(120);
   } }""" % ATT,
 'perd': """async () => { %s const T = document.querySelector('.mja-tir'); while(!fini()){ T.mjaTirer(-0.1, 0.5); await att(300); } }""" % ATT,
 # tire à fond (puissance 1) seulement quand la flèche peut transpercer au moins `mini` cibles d'un coup (défaut 2) ;
 # attend que les cibles s'alignent, puis, s'il n'en reste qu'une, la vise à fond. window.robotJournal note chaque tir.
 'transperce': """async (mini) => { %s
   const T = document.querySelector('.mja-tir'); mini = mini || 2; window.robotJournal = [];
   const vol = (e, ang, pu) => {
     let x = e.ARC.x + Math.cos(ang) * 14, y = e.ARC.y - 22 + Math.sin(ang) * 14, vx = Math.cos(ang) * pu * e.ARC.v, vy = Math.sin(ang) * pu * e.ARC.v, tt = e.t; const h = 1 / 90, vues = [];
     for(let k = 0; k < 220; k++){
       vx += e.ventA(tt) * h; vy += e.ARC.g * h; x += vx * h; y += vy * h; tt += h;
       if(e.obstacle && e.obstacle(x, y, tt)) return vues;
       for(let i = 0; i < e.cibles.length; i++){
         const c = e.cibles[i]; if(!c || vues.includes(i)) continue;
         const q = e.posCible(i, tt);
         if(c.type === 'sac'){ const ax = c.c.s.ax, ay = c.c.s.ay, dx = q.nx - ax, dy = q.ny - ay, l2 = dx*dx + dy*dy, u = ((x-ax)*dx + (y-ay)*dy) / l2; if(u > 0.2 && u < 0.8){ const ex = ax + dx*u - x, ey = ay + dy*u - y; if(ex*ex + ey*ey < 4) vues.push(i); } else if((q.x-x)*(q.x-x) + (q.y-y)*(q.y-y) < 400) return vues; }
         else if((q.x-x)*(q.x-x) + (q.y-y)*(q.y-y) < 25) vues.push(i);
       }
       if(y > 430 || x > 600 || y < -250) break;
     }
     return vues;
   };
   let attente = 0;
   while(!fini()){
     const e = T.mjaEtat();
     if(e.enVol || e.fleches <= 0){ await att(60); continue; }
     const reste = e.cibles.filter(c => c).length;
     const but = Math.min(mini, reste);
     let best = null;
     for(let ang = -1.45; ang < -0.02; ang += 0.004){ const v = vol(e, ang, 1); if(v.length >= 1 && (!best || v.length > best.n)) best = {ang, n:v.length}; }
     if(best && (best.n >= but || attente > 40)){ T.mjaTirer(best.ang, 1); window.robotJournal.push('tir à fond, vise ' + best.n + ' cible(s)'); attente = 0; }
     else attente++;
     await att(50);
   }
   const e = T.mjaEtat(); window.robotJournal.push('fin : ' + e.touches + ' cibles, ' + e.tirs + ' flèches, record ' + e.maxPerce);
 }""" % ATT,
}

ROBOTS['poursuite'] = {
 'gagne': """async (mode) => { %s
   const T = document.querySelector('.mja-poursuite');
   const key = k => document.dispatchEvent(new KeyboardEvent('keydown', {key:k}));
   let percutes = 0, vues = new Set(); window.robotJournal = [];
   let dernier = -1;
   while(!fini()){
     const e = T.mjaEtat();
     const proches = e.vagues.filter(v => v.p > 0.3 && v.p < 0.95).sort((a, b) => b.p - a.p);
     const v = proches[0];
     const veutPercuter = (mode === 'percute') || (mode === 'unPuisDix' && e.chocs < 1);
     if(v){
       let cible = e.voie;
       if(veutPercuter){
         const bloc = v.objs.find(o => o.genre === 'bloc' || o.genre === 'bas' || o.genre === 'haut');
         if(bloc) cible = bloc.voie;
       } else if(v.raccourci){ cible = e.cote; }
       else {
         const danger = l => v.objs.some(o => o.voie === l && o.genre === 'bloc');
         if(danger(e.voie)){ const s = [0,1,2].filter(l => !danger(l)).sort((a,b) => Math.abs(a-e.voie) - Math.abs(b-e.voie)); if(s.length) cible = s[0]; }
         const ici = v.objs.filter(o => o.voie === cible);
         if(v.p > 0.78 && ici.some(o => o.genre === 'bas') && e.saut <= 0) key('ArrowUp');
         if(v.p > 0.78 && ici.some(o => o.genre === 'haut') && e.glisse <= 0) key('ArrowDown');
       }
       if(cible >= 0 && cible !== e.voie) key(cible < e.voie ? 'ArrowLeft' : 'ArrowRight');
     }
     const n = e.faites + e.chocs;
     if(n !== dernier){ const avant = window.dernierChocs || 0; window.dernierChocs = e.chocs; dernier = n; window.robotJournal.push((e.chocs ? 'chocs ' + e.chocs + ' ' : '') + 'faits ' + e.faites + ' → pas ' + e.pas + ' (sans faute ' + e.sansFaute + ')' + (e.chocs > avant && mode === 'parfait' ? ' CHOC voie ' + e.voie + ' saut ' + e.saut.toFixed(2) + ' ' + JSON.stringify(window.derniereVague) : '')); }
     if(v) window.derniereVague = v;
     await att(30);
   }
   const e = T.mjaEtat(); window.robotJournal.push('FIN : ' + e.etat + ', obstacles franchis ' + e.faites + ', chocs ' + e.chocs);
 }""" % ATT,
 'perd': """async () => { %s
   const T = document.querySelector('.mja-poursuite');
   const key = k => document.dispatchEvent(new KeyboardEvent('keydown', {key:k}));
   while(!fini()){ const e = T.mjaEtat(); const v = e.vagues.filter(v => v.p > 0.3 && v.p < 0.95).sort((a, b) => b.p - a.p)[0];
     if(v){ const b = v.objs.find(o => o.genre === 'bloc' || o.genre === 'bas' || o.genre === 'haut'); if(b && b.voie !== e.voie) key(b.voie < e.voie ? 'ArrowLeft' : 'ArrowRight'); }
     await att(30); } }""" % ATT,
}
ROBOTS['cachette'] = {
 'gagne': """async () => { %s
   const T = document.querySelector('.mja-cachette');
   let bloque = 0, dernier = -1;
   while(!fini()){
     const e = T.mjaEtat();
     if(!e.course){
       const ici = e.couv[e.ici];
       if(e.ici !== dernier){ dernier = e.ici; bloque = 0; }
       const ok = e.couv.filter(c => c.acc && c.sur).sort((a, b) => (b.k - a.k) || (a.porte ? -1 : 0));
       if(ok.length && (ok[0].k > ici.k || ok[0].porte)) T.mjaCourir(ok[0].i);
       /* coincé depuis 3 s : un pas de côté (même rangée), comme un joueur qui change d'angle */
       else if(++bloque > 50){ const cote = ok.filter(c => c.k === ici.k && c.i !== e.ici); if(cote.length){ T.mjaCourir(cote[Math.floor(Math.random() * cote.length)].i); bloque = 0; } }
     }
     await att(60);
   } }""" % ATT,
 'perd': """async () => { %s const T = document.querySelector('.mja-cachette'); while(!fini()){ const e = T.mjaEtat(); if(!e.course){ const c = e.couv.filter(c => c.acc).sort((a,b) => b.k - a.k)[0]; if(c) T.mjaCourir(c.i); } await att(150); } }""" % ATT,
}

ROBOTS['rythme'] = {
 'gagne': """async () => { %s
   const T = document.querySelector('.mja-rythme');
   const nrm = a => { while(a > Math.PI) a -= 2*Math.PI; while(a < -Math.PI) a += 2*Math.PI; return a; };
   while(!fini()){
     const e = T.mjaEtat();
     if(e.depart <= 0 && e.gouttes.some(g => !g.poison && Math.abs(nrm(e.a - g.ang)) < e.hw * 0.6)){ document.dispatchEvent(new KeyboardEvent('keydown', {key:' '})); await att(60); }
     await att(4);
   } }""" % ATT,
 'perd': """async () => { %s while(!fini()){ document.dispatchEvent(new KeyboardEvent('keydown', {key:' '})); await att(500); } }""" % ATT,
}

ROBOTS['bulles'] = {
 'gagne': """async () => { %s %s
   const T = document.querySelector('.mja-bulles');
   while(!fini()){
     const e = T.mjaEtat();
     if(e.phase === 'joue' && e.attendu >= 0){ const b = T.querySelector('.mja-bulle[data-i="' + e.attendu + '"] circle:nth-of-type(2)'); const r = b.getBoundingClientRect(); pd(b, 'pointerdown', r.x + r.width/2, r.y + r.height/2); await att(320); }
     await att(40);
   } }""" % (ATT, ECRAN),
 'perd': """async () => { %s %s
   const T = document.querySelector('.mja-bulles');
   while(!fini()){ const e = T.mjaEtat(); if(e.phase === 'joue'){ const n = T.querySelectorAll('.mja-bulle').length; const i = (e.attendu + 1) %% n; const b = T.querySelector('.mja-bulle[data-i="' + i + '"] circle:nth-of-type(2)'); const r = b.getBoundingClientRect(); pd(b, 'pointerdown', r.x + r.width/2, r.y + r.height/2); await att(300); } await att(50); } }""" % (ATT, ECRAN),
}
ROBOTS['melange'] = {
 'gagne': """async () => { %s
   const T = document.querySelector('.mja-melange');
   let derniere = null;
   while(!fini()){
     const e = T.mjaEtat();
     if(e.recette && e.recette !== derniere){
       derniere = e.recette; await att(300);
       for(const c of Object.keys(e.recette)){ for(let k = 0; k < e.recette[c]; k++){ T.querySelector('.mja-pig[data-c="' + c + '"]').click(); await att(430); } }
       await att(500); T.querySelector('.mja-gouter').click(); await att(1400);
     }
     await att(100);
   } }""" % ATT,
 'perd': """async () => { %s
   const T = document.querySelector('.mja-melange');
   while(!fini()){ T.querySelector('.mja-vider').click(); await att(100); const e = T.mjaEtat(); const faux = Object.keys(e.recette)[0] === 'rouge' ? 'bleu' : 'rouge'; for(let k = 0; k < 2; k++){ T.querySelector('.mja-pig[data-c="' + faux + '"]').click(); await att(420); } await att(300); T.querySelector('.mja-gouter').click(); await att(400); } }""" % ATT,
}
ROBOTS['temperature'] = {
 'gagne': """async () => { %s
   const T = document.querySelector('.mja-temperature'); let ch = false;
   while(!fini()){
     const e = T.mjaEtat(); const pred = e.v + e.vit * 0.35; const faut = pred < e.z + e.l * 0.5;
     if(faut && !ch){ document.dispatchEvent(new KeyboardEvent('keydown', {key:' '})); ch = true; }
     if(!faut && ch){ document.dispatchEvent(new KeyboardEvent('keyup', {key:' '})); ch = false; }
     await att(16);
   } }""" % ATT,
 'perd': """async () => { %s document.dispatchEvent(new KeyboardEvent('keydown', {key:' '})); while(!fini()) await att(100); }""" % ATT,
}
ROBOTS['loupe'] = {
 'gagne': """async () => { %s %s
   const T = document.querySelector('.mja-loupe'); const svg = T.querySelector('.mja-image svg'); await att(400);
   const e = T.mjaEtat();
   for(const d of e.diffs){ if(fini()) break; const q = ecran(svg, d.x, d.y); pd(svg, 'pointermove', q.x, q.y); await att(250); pd(svg, 'pointerdown', q.x, q.y); pd(svg, 'pointerup', q.x, q.y); await att(500); } }""" % (ATT, ECRAN),
 'perd': """async () => { %s %s
   const T = document.querySelector('.mja-loupe'); const svg = T.querySelector('.mja-image svg'); await att(300);
   for(let i = 0; i < 20 && !fini(); i++){ const q = ecran(svg, 4, 4 + i); pd(svg, 'pointerdown', q.x, q.y); pd(svg, 'pointerup', q.x, q.y); await att(150); } }""" % (ATT, ECRAN),
}

ROBOTS['rythme']['humain'] = """async (sigma) => { %s
   const T = document.querySelector('.mja-rythme');
   const nrm = a => { while(a > Math.PI) a -= 2*Math.PI; while(a < -Math.PI) a += 2*Math.PI; return a; };
   const gauss = () => { let u = 0, v = 0; while(!u) u = Math.random(); while(!v) v = Math.random(); return Math.sqrt(-2*Math.log(u)) * Math.cos(2*Math.PI*v); };
   while(!fini()){
     const e = T.mjaEtat();
     if(e.depart > 0){ await att(50); continue; }
     let best = null;
     for(const g of e.gouttes){ if(g.poison) continue; const rel = nrm(g.ang - e.a) * e.dir; if(rel > 0.05 && (best === null || rel < best)) best = rel; }
     if(best !== null && best / e.w < 0.6){
       const ms = best / e.w * 1000 + gauss() * sigma;
       await att(Math.max(0, ms));
       document.dispatchEvent(new KeyboardEvent('keydown', {key:' '}));
       await att(120);
     } else await att(20);
   } }""" % ATT
