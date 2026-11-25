/* ======================= les mesures ======================= */
const $=id=>document.getElementById(id);
const TAU=Math.PI*2;
const clamp=(v,a,b)=>v<a?a:v>b?b:v,lerp=(a,b,t)=>a+(b-a)*t,rnd=(a,b)=>a+Math.random()*(b-a);
const ang=a=>{a=(a+Math.PI)%TAU;if(a<0)a+=TAU;return a-Math.PI;};
const hyp=Math.hypot;
function graine(s){s=(s%2147483646)+1;return()=>(s=(s*16807)%2147483647)/2147483647;}
/* La salle vue de haut, en biais : 1 pas = T points de large ; la profondeur est tassée (K) ; les hauteurs restent entières (ZH),
   parce que les personnages sont dessinés debout. */
const T=46,K=0.66,ZH=46,RW=26,RD=18,Y0=1.3,OX=64,OY=262;
const SW=OX*2+RW*T,SH=Math.round(OY+RD*T*K+44);
const px=x=>OX+x*T,py=(y,z)=>OY+y*T*K-(z||0)*ZH;
let tReel=0;
