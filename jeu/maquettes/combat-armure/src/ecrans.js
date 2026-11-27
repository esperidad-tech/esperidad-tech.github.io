/* ======================= les écrans : le pouce gauche, les quatre boutons, les menus, la boucle =======================
   (D'après la maquette v2, jeu/maquettes/phase2-devant/src/ecrans.js ; l'écran et la caméra comme le combat du Pisteur.) */
const VERSION='version 1 (27 novembre)';
let S=null,pause=false,debut=true,finMontree=false,fige=false;
/* ---------- les réglages, gardés d'une partie à l'autre ---------- */
const reglages={};for(const k in P2.DEFAUT)reglages[k]=P2.DEFAUT[k];reglages.son=sonOn;
try{const mem=JSON.parse(localStorage.getItem('armure-reglages')||'{}');for(const k in mem)if(k in reglages)reglages[k]=mem[k];}catch(e){}
sonOn=reglages.son!==false;
function garder(){try{localStorage.setItem('armure-reglages',JSON.stringify(reglages));}catch(e){}}
/* la salle qu'on voit derrière l'écran du début (personne n'y joue) */
const vitrine=P2.nouvelle(reglages,5);
function nouvelle(){S=P2.nouvelle(reglages,(Date.now()&0xffff)+1);finMontree=false;$('fen').classList.remove('on');placerCamera(S.h);SON.arreter();}

/* ---------- le pouce gauche : il se pose où il veut, sur la moitié gauche (comme le Pisteur) ---------- */
const joy={id:null,bx:0,by:0,vx:0,vy:0,mx:0,my:0,R:60,vu:false};
can.addEventListener('pointerdown',e=>{
  e.preventDefault();SON.init();
  if(!S||pause||debut)return;
  /* toucher un réparateur : il devient la cible ; on le touche sur tout son corps, même à moitié caché par un rocher */
  let best=null,bd=1e9;
  for(const r of S.reps){const [fx,fy]=versEcran(r.x,r.y,0),[hx,hy]=versEcran(r.x,r.y,1.4),l=Math.abs(hx-fx)*0+innerHeight*0.06;
    const dx=Math.max(0,Math.abs(e.clientX-fx)-l*0.8),dy=e.clientY<hy?hy-e.clientY:e.clientY>fy?e.clientY-fy:0,d=hyp(dx,dy);
    if(d<innerHeight*0.05&&d<bd){bd=d;best=r;}}
  if(best){P2.viser(S,best.x,best.y);return;}
  if(e.clientX<innerWidth*0.5&&joy.id===null){
    joy.id=e.pointerId;joy.bx=e.clientX;joy.by=e.clientY;joy.vx=joy.vy=joy.mx=joy.my=0;joy.vu=true;
    joy.R=Math.max(40,Math.min(80,innerHeight*0.13));
    try{can.setPointerCapture(e.pointerId);}catch(_){}
  }
},{passive:false});
can.addEventListener('pointermove',e=>{
  if(e.pointerId!==joy.id)return;e.preventDefault();
  const R=joy.R;let dx=e.clientX-joy.bx,dy=e.clientY-joy.by,d=hyp(dx,dy);
  if(d>R*1.2){joy.bx+=dx/d*(d-R*1.2);joy.by+=dy/d*(d-R*1.2);dx=e.clientX-joy.bx;dy=e.clientY-joy.by;d=hyp(dx,dy);}
  const m=Math.min(1,d/R);joy.vx=d>0?dx/d*m:0;joy.vy=d>0?dy/d*m:0;
  const wx=dx,wy=dy/K,n=hyp(wx,wy)||1;joy.mx=wx/n*m;joy.my=wy/n*m;   // la direction dans la salle (vue en biais)
},{passive:false});
function finDoigt(e){if(e.pointerId===joy.id){joy.id=null;joy.vx=joy.vy=joy.mx=joy.my=0;}}
['pointerup','pointercancel','lostpointercapture'].forEach(n=>can.addEventListener(n,finDoigt));
can.addEventListener('contextmenu',e=>e.preventDefault());

/* ---------- le clavier (sur ordinateur) ---------- */
const touches={};
addEventListener('keydown',e=>{
  const kk=e.key.toLowerCase();touches[kk]=true;SON.init();
  if(!S||debut)return;
  if(kk==='escape'){basculerPause();return;}
  if(pause||S.code.ouvert){if(kk==='backspace'&&S.code.ouvert){P2.effacer(S);majFenetre();}return;}
  if(kk==='1')geste('bGlace');else if(kk==='2')geste('bFeu');else if(kk==='3')geste('bSoin');
  else if(kk===' '){e.preventDefault();geste('bSaut');}else if(kk==='enter')geste('bCode');else if(kk==='p')geste('bPisteur');
});
addEventListener('keyup',e=>{touches[e.key.toLowerCase()]=false;});
function entreeClavier(){
  const x=(touches.arrowright||touches.d?1:0)-(touches.arrowleft||touches.q||touches.a?1:0);
  const y=(touches.arrowdown||touches.s?1:0)-(touches.arrowup||touches.z||touches.w?1:0);
  const n=hyp(x,y);return n?{mx:x/n,my:y/n}:null;
}

/* ---------- les boutons ---------- */
function refus(el){el.classList.remove('non');void el.offsetWidth;el.classList.add('non');SON.jouer('refus');}
function geste(id){
  if(!S||pause||debut)return;
  const el=$(id);let ok=false;
  if(id==='bGlace')ok=P2.lancer(S,'glace');
  else if(id==='bFeu')ok=P2.lancer(S,'feu');
  else if(id==='bSoin')ok=P2.lancer(S,'soin');
  else if(id==='bSaut'){const kb=entreeClavier();ok=P2.sauter(S,kb?kb.mx:joy.mx,kb?kb.my:joy.my);}
  else if(id==='bCode'){ok=P2.ouvrirCode(S);if(ok){joy.id=null;joy.mx=joy.my=0;majFenetre();}}
  else if(id==='bPisteur')ok=P2.pisteurCrie(S);
  if(!ok)refus(el);else{el.classList.add('appui');setTimeout(()=>el.classList.remove('appui'),120);}
}
['bGlace','bFeu','bSoin','bSaut','bCode','bPisteur'].forEach(id=>{
  $(id).addEventListener('pointerdown',e=>{e.preventDefault();e.stopPropagation();SON.init();geste(id);});
});
/* les images des boutons, selon le héros */
const ICONES={barde:{glace:'🎵',feu:'🎶'},sage:{glace:'❄️',feu:'🔥'},alchimiste:{glace:'🧪',feu:'🍾'}};
function majIcones(){const I=ICONES[reglages.role]||ICONES.barde;$('bGlace').querySelector('b').textContent=I.glace;$('bFeu').querySelector('b').textContent=I.feu;
  $('bGlace').querySelector('b').style.filter=reglages.role==='barde'?'hue-rotate(160deg) saturate(1.6)':'';$('bFeu').querySelector('b').style.filter=reglages.role==='barde'?'hue-rotate(-20deg) saturate(2)':'';}

/* ---------- la fenêtre du code ---------- */
const clav=document.querySelector('#fen .clavier');
P2.SYMS.forEach(s=>{
  const b=document.createElement('button');b.textContent=s;b.setAttribute('aria-label',s);
  b.addEventListener('pointerdown',e=>{
    e.preventDefault();if(!S||!S.code.ouvert)return;
    const n=S.stats.mauvaisCodes,saisie=S.code.saisie.concat([s]);
    P2.taper(S,s);
    if(S.stats.mauvaisCodes>n)secouer(saisie);else majFenetre();
  });
  clav.appendChild(b);
});
$('fFerme').addEventListener('pointerdown',e=>{e.preventDefault();if(S)P2.fermerCode(S);majFenetre();});
$('fEfface').addEventListener('pointerdown',e=>{e.preventDefault();if(S)P2.effacer(S);majFenetre();});
function secouer(saisie){
  const f=$('fen'),cases=f.querySelectorAll('.case');
  f.classList.add('on','faux');for(let i=0;i<3;i++)cases[i].textContent=saisie[i]||'';
  setTimeout(()=>{f.classList.remove('faux');majFenetre();},650);
}
function majFenetre(){
  const f=$('fen'),on=S&&S.code.ouvert;f.classList.toggle('on',!!on);
  const cases=f.querySelectorAll('.case');for(let i=0;i<3;i++)cases[i].textContent=on?(S.code.saisie[i]||''):'';
}

/* chaque image : qui est montré, qui est grisé, qui clignote */
function cls(el,c,v){if(el.classList.contains(c)!==!!v)el.classList.toggle(c,!!v);}
function majBoutons(){
  const en=S&&!debut&&S.phase!=='fini',h=S&&S.h,aides=S&&S.reg.aides;
  ['bGlace','bFeu','bSoin','bSaut'].forEach(id=>cls($(id),'on',en));
  cls($('bPause'),'on',!debut&&!finMontree);
  if(!S)return;
  const bulle=en&&S.phase==='bulle';
  cls($('bCode'),'on',bulle&&!S.code.ouvert);cls($('bPisteur'),'on',bulle&&!S.cri);
  const mort=h.mort>0||S.code.ouvert;
  ['bGlace','bFeu','bSoin'].forEach(id=>{
    const el=$(id),q=id==='bGlace'?'glace':id==='bFeu'?'feu':'soin';
    cls(el,'eteint',mort);
    el.style.setProperty('--p',h.lance&&h.lance.quoi===q?(h.lance.t/h.lance.dur).toFixed(3):0);
    el.style.setProperty('--c',q==='glace'?'#9fe3ff':q==='feu'?'#ff7a2a':'#5fe07a');
  });
  $('bSaut').style.setProperty('--r',h.sautT>0?(h.sautT/S.reg.saut).toFixed(3):0);
  cls($('bSaut'),'eteint',mort);
  cls($('bSoin'),'appel',aides&&h.pv<=60&&h.mort<=0&&!h.lance);
  cls($('bCode'),'appel',aides&&bulle&&S.cri);
  const f=$('fen');
  if(!f.classList.contains('faux')&&f.classList.contains('on')!==S.code.ouvert)majFenetre();
  if(S.code.ouvert)f.querySelector('.lent i').style.width=(100*S.code.ralenti/S.reg.ralenti).toFixed(1)+'%';
}

/* ---------- la pause, les réglages ---------- */
function basculerPause(){if(debut)return;pause=!pause;$('pause').classList.toggle('on',pause);if(pause)majMenu();joy.id=null;joy.mx=joy.my=0;}
$('bPause').addEventListener('click',basculerPause);
$('bReprendre').addEventListener('click',()=>{
  if(debut){$('pause').classList.remove('on');$('debut').classList.add('on');return;}
  if(finMontree){$('pause').classList.remove('on');$('fin').classList.add('on');return;}
  basculerPause();
});
document.querySelectorAll('.choix[data-r]').forEach(g=>{
  g.addEventListener('click',e=>{
    const b=e.target.closest('button');if(!b)return;
    const r=g.dataset.r,v=b.dataset.v;
    reglages[r]=(r==='aides'||r==='son')?v==='true':+v;
    if(r==='son'){sonOn=reglages.son;SON.init();SON.couper();try{localStorage.setItem('armure_son',sonOn?'1':'0');}catch(_){}}
    if(S){S.reg[r]=reglages[r];if(r==='vie'&&S.phase==='combat'){S.vieMax=reglages.vie;S.vie=Math.min(S.vie,S.vieMax);}}
    garder();majMenu();
  });
});
$('essais').addEventListener('click',e=>{
  const b=e.target.closest('button');if(!b||!S||debut)return;
  if(b.dataset.f==='s')P2.symboleTout(S);else P2.aller(S,+b.dataset.f);
  $('fin').classList.remove('on');finMontree=false;basculerPause();
});
$('bRecommencer').addEventListener('click',()=>{nouvelle();$('fin').classList.remove('on');if(pause)basculerPause();});
function majMenu(){
  document.querySelectorAll('.choix[data-r]').forEach(g=>{
    const r=g.dataset.r;g.querySelectorAll('button').forEach(b=>b.classList.toggle('choisi',String(reglages[r])===b.dataset.v));
  });
  $('essais').style.opacity=debut?0.35:1;
  $('mesures').textContent='Phase 2, les trois de devant — '+VERSION+' · '+ips+' images par seconde · finesse '+finesse;
}
if(/depuis=salle/.test(location.search))for(const id of ['bSalle','bSalleFin']){const bs=$(id);bs.hidden=false;bs.addEventListener('click',()=>{location.href='salle.html';});}

/* ---------- avant de jouer : le héros, et le bouton jaune (rien à lire) ---------- */
const roles=$('roles');
['barde','sage','alchimiste'].forEach(r=>{
  const b=document.createElement('button'),R=Dessin.ROLES[r];
  b.style.background=R.c;b.textContent=R.ic;b.dataset.r=r;b.setAttribute('aria-label',r);
  b.addEventListener('click',()=>{if(reglages.role===r)return;reglages.role=r;garder();majRoles();majIcones();cuireHeros();});
  roles.appendChild(b);
});
function majRoles(){roles.querySelectorAll('button').forEach(b=>b.classList.toggle('choisi',b.dataset.r===reglages.role));}
majRoles();majIcones();
let herosPret=false;
function cuireHeros(){herosPret=false;HS.lancer(reglages.role,Sc,()=>{herosPret=true;});}
function pretAJouer(){return Decor.pret&&HS.essentiel;}
$('bGo').addEventListener('click',()=>{SON.init();if(!pretAJouer())return;debut=false;$('debut').classList.remove('on');nouvelle();});
$('bReglages').addEventListener('click',()=>{$('debut').classList.remove('on');$('pause').classList.add('on');majMenu();});
$('bFinReglages').addEventListener('click',()=>{$('fin').classList.remove('on');$('pause').classList.add('on');majMenu();});
$('bRejouer').addEventListener('click',()=>{$('fin').classList.remove('on');nouvelle();});

/* ---------- la fin : sans un mot ---------- */
function mmss(s){s=Math.round(s);return Math.floor(s/60)+':'+('0'+s%60).slice(-2);}
function montrerFin(){
  finMontree=true;
  const st=S.stats;let h='<span>⏱</span><b>'+mmss(S.t)+'</b>';
  st.tiers.forEach((x,i)=>{h+='<span>'+['①','②','③'][i]+'</span><b>'+mmss(x.code||x.symbole)+'</b>';});
  h+='<span>💀</span><b>'+st.morts+'</b><span>✚</span><b>'+st.soins+'</b>';
  $('stats').innerHTML=h;
  const fc=$('finImg').getContext('2d');fc.clearRect(0,0,160,110);fc.font='70px serif';fc.textAlign='center';fc.textBaseline='middle';fc.fillText('🏆',80,58);
  $('fin').classList.add('on');
}

/* ---------- la boucle ---------- */
let avant=performance.now(),ips=60,nImg=0,t0=avant,lents=0;
function boucle(maintenant){
  requestAnimationFrame(boucle);
  const dtr=(maintenant-avant)/1000,dt=Math.min(0.05,dtr);avant=maintenant;
  nImg++;if(maintenant-t0>1000){ips=Math.round(nImg*1000/(maintenant-t0));nImg=0;t0=maintenant;
    /* un appareil trop lent : une image moins fine (comme le combat du Pisteur), gardée pour la prochaine fois */
    if(!debut&&!pause&&ips<25&&finesse<3){if(++lents>=3){finesse++;lents=0;taille();try{localStorage.setItem('armure_finesse',finesse);}catch(e){}}}else lents=0;}
  if(tourne)return;
  if(!Decor.pret){cx.setTransform(1,0,0,1,0,0);cx.fillStyle='#04060b';cx.fillRect(0,0,can.width,can.height);majChargement();return;}
  GS.precuire(debut?12:3);
  const St=S&&!debut?S:vitrine;
  if(S&&!pause&&!debut&&!fige){
    const kb=entreeClavier(),e=kb||{mx:joy.mx,my:joy.my};
    if(window.__pilote)Object.assign(e,window.__pilote(S,dt)||{});   // pour les essais : un robot peut tenir la manette
    P2.pas(S,dt,e);
    if(S.phase==='fini'&&!finMontree)setTimeout(montrerFin,1200),finMontree=true;
    SON.musique(S);
  }
  if(!pause)tReel+=dt*(S&&S.code.ouvert?0.35:1);
  Dessin.image(St,pause?0:dt,joy);
  majBoutons();if(debut)majChargement();
}
function majChargement(){const b=$('bGo'),p=Math.round(100*Math.min(1,(Decor.pret?0.3:0)+0.7*HS.avance*2.2));cls(b,'attend',!pretAJouer());b.style.setProperty('--p',p+'%');}
document.addEventListener('visibilitychange',()=>{if(document.hidden&&S&&!pause&&!debut&&!finMontree)basculerPause();});
addEventListener('resize',()=>{taille();});addEventListener('orientationchange',()=>setTimeout(taille,200));
mesurerAppareil();taille();placerCamera(vitrine.h);
Decor.preparer(()=>{});Armure.construire();GS.regler(Sc);GS.prevoir([['reparateur',0.6*T/46]]);cuireHeros();
requestAnimationFrame(boucle);

window.__p2={get S(){return S;},set fige(v){fige=v;},P2,nouvelle,geste,majBoutons,VERSION,
  demarrer(){SON.init();debut=false;$('debut').classList.remove('on');nouvelle();},get ips(){return ips;},get pret(){return pretAJouer();},
  dessiner(){Dessin.image(S||vitrine,0,joy);},SON,FX,HS,versEcran};
