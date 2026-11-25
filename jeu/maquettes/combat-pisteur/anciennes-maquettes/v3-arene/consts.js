/* ======================= les mesures ======================= */
const $=id=>document.getElementById(id);
const clamp=(v,a,b)=>v<a?a:v>b?b:v,lerp=(a,b,t)=>a+(b-a)*t,rnd=(a,b)=>a+Math.random()*(b-a);
const ang=a=>{a=(a+Math.PI)%(2*Math.PI);if(a<0)a+=2*Math.PI;return a-Math.PI;};
/* la salle vue de haut, en biais : 1 pas = T pixels de large, la profondeur est tassée (K), la hauteur monte (ZH) */
const T=46,K=0.78,ZH=39,OX=46,OY=210;
const SW=OX*2+26*T,SH=Math.round(OY+18*T*K+50);
const FT=178;
const px=x=>OX+x*T,py=(y,z)=>OY+y*T*K-(z||0)*ZH;
let cx=null;
