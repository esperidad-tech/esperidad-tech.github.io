/* ======================= les mesures, l'écran, la caméra =======================
   La salle vue d'en haut, en biais, comme le combat du Pisteur (combat-pisteur/src/base.js) : 1 pas = T points de large ;
   la profondeur est tassée (K) ; les hauteurs restent entières (ZH). Ces nombres sont aussi ceux de decor3d/base.py
   (la caméra de Blender) : ne pas les changer sans refaire le décor. */
const $=id=>document.getElementById(id);
const TAU=Math.PI*2;
const clamp=(v,a,b)=>v<a?a:v>b?b:v,lerp=(a,b,t)=>a+(b-a)*t,rnd=(a,b)=>a+Math.random()*(b-a),hyp=Math.hypot;
const T=40,K=0.62,ZH=40,OX=70,OY=250,SW=860,SH=556;
const px=x=>OX+x*T,py=(y,z)=>OY+y*T*K-(z||0)*ZH;
const P2=window.P2,REG=P2.REG;
let tReel=0;

/* l'écran : la toile fait la taille de l'écran (moins fine sur un appareil lent) ; on dessine en « points du jeu » (Ws × Hs) */
const can=$('jeu'),cx=can.getContext('2d',{alpha:false});
let Sc=1,Ws=860,Hs=410,camX=0,camY=0,secousse=0;
const FIN=[1.6e6,1.0e6,0.66e6,0.45e6];let finesse=-1,vitesseApp=0;
try{const v=localStorage.getItem('armure_finesse');if(v!=null)finesse=Math.min(3,+v||0);}catch(e){}
if(/[?&]finesse=(\d)/.test(location.search))finesse=Math.min(3,+RegExp.$1);
/* un appareil lent commence tout de suite avec une image moins fine (on compte ce qu'il calcule en 40 ms) */
function mesurerAppareil(){const t0=performance.now();let n=0,s=0;while(performance.now()-t0<40){for(let i=0;i<2000;i++)s+=Math.sqrt(i*n+1);n++;}vitesseApp=n;if(finesse<0)finesse=n<60?2:n<120?1:0;return s;}
let tourne=false;
function taille(){
  const vw=innerWidth,vh=innerHeight;
  Hs=Math.max(410,800*vh/vw);                       // un téléphone couché : 410 de haut ; une tablette : toute la salle tient
  const dpr=Math.min(devicePixelRatio||1,2.5);let w=vw*dpr,h=vh*dpr;const k=Math.min(1,Math.sqrt(FIN[Math.max(0,finesse)]/(w*h)));
  can.width=Math.max(1,Math.round(w*k));can.height=Math.max(1,Math.round(h*k));Sc=can.height/Hs;Ws=can.width/Sc;
  tourne=vh>vw*1.05;
}
/* la caméra : elle suit le héros ; elle garde le plus possible de l'armure au-dessus de lui (son buste, ses mains, ses gestes) */
function cibleCamera(h){
  const hx=px(h.x),hy=py(h.y,0);
  const cxT=SW<=Ws?(SW-Ws)/2:clamp(hx-Ws/2,0,SW-Ws);
  const haut=py(REG.armure.y,4.9)-10;                // le haut de l'armure
  let cyT=Math.max(haut-30,hy+50-Hs);
  cyT=SH<=Hs?(SH-Hs)/2:clamp(cyT,0,SH-Hs);
  return [cxT,cyT];
}
function majCamera(dt,h){const [a,b]=cibleCamera(h),k=Math.min(1,dt*5);camX+=(a-camX)*k;camY+=(b-camY)*k;}
function placerCamera(h){[camX,camY]=cibleCamera(h);}
/* l'écran → la salle (le sol) */
function versSalle(sx,sy){const X=sx/innerWidth*Ws+camX,Y=sy/innerHeight*Hs+camY;return [(X-OX)/T,(Y-OY)/(T*K)];}
function versEcran(x,y,z){return [(px(x)-camX)*innerWidth/Ws,(py(y,z)-camY)*innerHeight/Hs];}
