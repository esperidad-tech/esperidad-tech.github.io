// Le labo tout seul (la page dist/labo.html, sans le jeu), joué au doigt d'un bout à l'autre sur trois écrans :
// les trois dossiers de l'enquête 1 (le fil, les poils, la plume), la loupe et ses tiroirs, le microscope, l'eau chaude,
// le test des couleurs, les coupelles qui changent avec le dossier, ce qu'on garde, Mimi.
//   BRUMEVAL_DIST=<dossier de build> node tools/labo-seul.js [iphone,tablette,android] [fichier.html]     (captures dans jeu/test/labo/)
// (Le labo DANS le jeu : tools/labo-jeu.py.)
const { chromium } = require('playwright');
const path = require('path'), fs = require('fs');
const out = path.join(__dirname, '..', 'test', 'labo') + '/'; fs.mkdirSync(out, {recursive:true});
const FICHIER = process.argv[3] || path.join(process.env.BRUMEVAL_DIST || path.join(__dirname, '..', 'dist'), 'labo.html');
const APP = [
  {n:'iphone', vp:{width:844,height:390}},
  {n:'tablette', vp:{width:1080,height:810}},
  {n:'android', vp:{width:915,height:412}}
].filter(a => !process.argv[2] || process.argv[2] === '-' || process.argv[2].split(',').includes(a.n));
const echecs = [];
(async () => {
  const b = await chromium.launch();
  for (const A of APP) {
    const ctx = await b.newContext({viewport:A.vp, deviceScaleFactor:2, hasTouch:true, isMobile:A.n !== 'tablette'});
    const p = await ctx.newPage();
    const err = []; p.on('pageerror', e => err.push(e.message)); p.on('console', m => { if (m.type()==='error' && !/ERR_TUNNEL|Failed to load resource/.test(m.text())) err.push(m.text()); });
    await p.goto('file://' + FICHIER); await p.waitForTimeout(700);
    await p.evaluate(() => { window.__labo.mimi.calme = true; });
    const shot = (n) => p.screenshot({path: out + 'seul-' + A.n + '-' + n + '.png'});
    const etat = () => p.evaluate(() => { const S = window.__labo.etat(), d = S.dos[S.dc] || {coupes:[]}; return {mode:S.mode, sel:S.sel, dc:S.dc, trouves:S.trouves, finis:S.finis, coupes:d.coupes.map(c => c && c.t), occupe:S.occupe, tiroir:S.tiroir, zoom:S.zoom, bande:d.bande, mix:d.mix}; });
    const clic = (sel) => p.click(sel, {force:true});
    const classes = (sel) => p.evaluate(s => document.querySelector(s).getAttribute('class') || '', sel);
    const hud = async (x, y) => { const r = await p.evaluate(() => { const b = document.querySelector('#hudBoite').getBoundingClientRect(); return {l:b.left, t:b.top, u:b.width/1200}; }); return [r.l + x*r.u, r.t + y*r.u]; };
    const toucheHud = async (x, y) => { const q = await hud(x, y); await p.touchscreen.tap(q[0], q[1]); };
    const trouver = async (tir, casier, faux, bon) => {
      await clic('#tir-' + tir + ' .facade'); await p.waitForTimeout(1300); await clic('#tir-' + tir + ' [data-casier="' + casier + '"]'); await p.waitForTimeout(700);
      if (faux) { await clic('[data-ech="' + casier + ':' + faux + '"]'); await p.waitForTimeout(3200); }
      await clic('[data-ech="' + casier + ':' + bon + '"]'); await p.waitForTimeout(2100); };
    const viser = async (g) => { await p.evaluate(g => { const S = window.__labo.etat(); S.cx = g.x; S.cy = g.y; window.__labo.rendre(); }, g);
      const bx = await p.locator('#lentille').boundingBox(); const S = await p.evaluate(() => ({cx:window.__labo.etat().cx, cy:window.__labo.etat().cy})); const k = Math.max(1, bx.width/560);
      await p.mouse.click(bx.x + bx.width/2 + (g.x - S.cx)*k, bx.y + bx.height/2 + (g.y - S.cy)*k); };
    const prendre = async (z) => { const items = await p.evaluate(z => { const S = window.__labo.etat(); return S.dos[S.dc].items[z].filter(i => !i.pris && !(i.min > z)).map(i => ({x:i.x,y:i.y})); }, z); for (const g of items) { await viser(g); await p.waitForTimeout(950); } };
    const toutPrendre = async () => { await prendre(10); await clic('.num[data-zoom="40"]'); await p.waitForTimeout(900); await prendre(40); await clic('#zoomTxt'); await p.waitForTimeout(900); await prendre(100); };
    const coupe = async (t) => { const c = (await etat()).coupes; if (c.indexOf(t) < 0) { console.log(A.n, "PAS DE COUPELLE", t, JSON.stringify(c), JSON.stringify(R)); throw new Error("coupelle " + t); } await clic("#coupe" + c.indexOf(t)); await p.waitForTimeout(400); };
    const R = {};
    await shot('01-paillasse');
    // ---------- n° 1 : le fil ----------
    await clic('#ech-fil'); await p.waitForTimeout(400); R.sel = (await etat()).sel;
    await clic('#tir-g .facade'); await p.waitForTimeout(900); R.tiroirSansLoupe = (await etat()).mode;
    await clic('#gLoupe'); await p.waitForTimeout(1900);
    await trouver('g', 'fils', 'soie', 'tricot'); R.fil = (await etat()).trouves.fil; R.savoirFil = await p.locator('.savoir').count(); await p.waitForTimeout(1300); await shot('02-fil-trouve');
    R.sonSavoir = await p.locator('.savoir .b-son').count();
    await clic('#bFermer'); await p.waitForTimeout(900);
    await clic('#ech-fil'); await p.waitForTimeout(300); await clic('#gMicro'); await p.waitForTimeout(1200); R.cone = await p.locator('.cone-hud').count();
    await toutPrendre(); await toucheHud(1080, 40); await p.waitForTimeout(900); R.coupesFil = (await etat()).coupes;
    await clic('#bocal-chaude'); await p.waitForTimeout(3600); R.coupesFil2 = (await etat()).coupes;
    await coupe('noir'); await clic('#gLoupe'); await p.waitForTimeout(2000);
    await trouver('d', 'grains', null, 'suie'); R.suie = (await etat()).trouves.noir; R.finiFil = (await etat()).finis.fil; await p.waitForTimeout(2300);
    await clic('#bFermer'); await p.waitForTimeout(1000); R.ardoise = await p.evaluate(() => document.querySelector('#ardoise').textContent); await shot('03-fil-boucle');
    await coupe('rouge'); await clic('#gTest'); await p.waitForTimeout(5200);
    await clic('[data-temoin="garance"]'); await p.waitForTimeout(2600); await clic('[data-temoin="coquelicot"]'); await p.waitForTimeout(3000); await clic('[data-temoin="oignon"]'); await p.waitForTimeout(2600); R.rouge = (await etat()).trouves.rouge; await shot('04-teinture');
    await toucheHud(1190, 630); await p.waitForTimeout(900);
    // ---------- n° 2 : les poils (les coupelles changent de dossier) ----------
    await clic('#ech-poils'); await p.waitForTimeout(500); R.coupesPoils0 = (await etat()).coupes; R.dcPoils = (await etat()).dc; await shot('05-poils-choisis');
    await clic('#gLoupe'); await p.waitForTimeout(1900); await trouver('g', 'poils', 'chatgris', 'chien'); R.chien = (await etat()).trouves.poils; await p.waitForTimeout(2400);
    await clic('#bFermer'); await p.waitForTimeout(900);
    await clic('#ech-poils'); await p.waitForTimeout(300); await clic('#gMicro'); await p.waitForTimeout(1200); await shot('06-poils-micro');
    await toutPrendre(); await shot('07-poils-100'); await toucheHud(1080, 40); await p.waitForTimeout(900); R.coupesPoils = (await etat()).coupes;
    await coupe('feuil'); await clic('#gLoupe'); await p.waitForTimeout(2000); await shot('08-bout-de-feuille');
    await trouver('d', 'feuilles', 'hetre', 'chene'); R.chene = (await etat()).trouves.feuil; R.finiPoils = (await etat()).finis.poils; await p.waitForTimeout(2300);
    await clic('#bPrec'); await p.waitForTimeout(1300); R.avantFeuil = (await etat()).sel;
    await trouver('d', 'grains', null, 'bardane'); R.bardane = (await etat()).trouves.bardane; await p.waitForTimeout(1500); await shot('09-bardane');
    await clic('#bFermer'); await p.waitForTimeout(900);
    // ---------- n° 3 : la plume ----------
    await clic('#ech-plume'); await p.waitForTimeout(500); R.coupesPlume0 = (await etat()).coupes;
    await clic('#bocal-chaude'); await p.waitForTimeout(3800); R.coupesPlume1 = (await etat()).coupes; R.delave = await p.evaluate(() => window.__labo.etat().dos.plume.delave);
    await clic('#ech-plume'); await p.waitForTimeout(300); await clic('#gLoupe'); await p.waitForTimeout(1900); await shot('10-plume-delavee');
    await trouver('g', 'plumes', 'corbeau', 'oie'); R.oie = (await etat()).trouves.plume; await p.waitForTimeout(2400); await shot('11-oie');
    await clic('#bFermer'); await p.waitForTimeout(900);
    await clic('#ech-plume'); await p.waitForTimeout(300); await clic('#gMicro'); await p.waitForTimeout(1200);
    await toutPrendre(); await shot('12-plume-100'); await toucheHud(1080, 40); await p.waitForTimeout(900); R.coupesPlume = (await etat()).coupes;
    await coupe('pollen'); await clic('#gLoupe'); await p.waitForTimeout(2000);
    await trouver('d', 'grains', 'pollenpin', 'pollenlav'); R.lavande = (await etat()).trouves.pollen; R.finiPlume = (await etat()).finis.plume; await p.waitForTimeout(2300);
    await clic('#bFermer'); await p.waitForTimeout(900);
    await coupe('encre'); await clic('#gTest'); await p.waitForTimeout(5200);
    await clic('[data-temoin="mure"]'); await p.waitForTimeout(2600); await clic('[data-temoin="noix"]'); await p.waitForTimeout(2600); R.encre = (await etat()).trouves.encre; await shot('13-encre');
    await toucheHud(1190, 630); await p.waitForTimeout(900); await shot('14-fin');
    // on revient au fil : ses coupelles et son code reviennent
    await clic('#ech-fil'); await p.waitForTimeout(500); R.retourFil = (await etat()).coupes;
    R.outilsFil = {loupe: await classes('#gLoupe'), micro: await classes('#gMicro'), bocal: await classes('#bocal-chaude')};
    // ce qu'on garde, puis on recharge avec : tout est retrouvé
    const sauve = await p.evaluate(() => window.__labo.exporter());
    R.finis = Object.keys(sauve.finis).sort().join(' '); R.trouves = Object.keys(sauve.trouves).sort().join(' ');
    // Mimi : il vient, on le chasse, il sort de l'écran
    await p.evaluate(() => { window.__labo.mimi.calme = false; window.__labo.mimiVient(); }); await p.waitForTimeout(1400); R.mimiLa = await p.evaluate(() => ({pose:window.__labo.mimi.pose, cache:window.__labo.mimi.el.hidden}));
    await p.click('.mimi', {force:true}); await p.waitForTimeout(1600); R.mimiParti = await p.evaluate(() => ({pose:window.__labo.mimi.pose, cache:window.__labo.mimi.el.hidden}));
    R.taille = await p.evaluate(() => [document.documentElement.scrollWidth, document.documentElement.scrollHeight]); R.err = err;
    const bon = R.fil && R.suie && R.finiFil && R.rouge && R.chien && R.chene && R.finiPoils && R.bardane && R.delave && R.oie && R.lavande && R.finiPlume && R.encre
      && R.coupesPoils0.length === 0 && R.retourFil.includes('noir') && R.finis === 'fil plume poils' && R.mimiParti.cache && !err.length;
    if (!bon) echecs.push(A.n);
    console.log(A.n, JSON.stringify(R));
    await ctx.close();
  }
  console.log(echecs.length ? 'ÉCHECS ' + echecs.join(', ') : 'tout est bon');
  await b.close();
})();
