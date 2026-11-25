/* ======================= le dessin : outils ======================= */
const lueurs={};
function lueur(c){
  if(lueurs[c])return lueurs[c];
  const k=document.createElement('canvas');k.width=k.height=64;const g=k.getContext('2d');
  const r=g.createRadialGradient(32,32,0,32,32,32);r.addColorStop(0,c);r.addColorStop(1,'rgba(0,0,0,0)');
  g.fillStyle=r;g.fillRect(0,0,64,64);return lueurs[c]=k;
}
function glow(c,x,y,r,a){cx.globalAlpha=a;cx.drawImage(lueur(c),x-r,y-r,r*2,r*2);cx.globalAlpha=1;}
function ell(x,y,rx,ry){cx.beginPath();cx.ellipse(x,y,Math.max(0.1,rx),Math.max(0.1,ry),0,0,Math.PI*2);cx.fill();}
function ellS(x,y,rx,ry){cx.beginPath();cx.ellipse(x,y,Math.max(0.1,rx),Math.max(0.1,ry),0,0,Math.PI*2);cx.stroke();}
function circ(x,y,r){cx.beginPath();cx.arc(x,y,r,0,Math.PI*2);cx.fill();}
function ligne(a,b,c,d){cx.beginPath();cx.moveTo(a,b);cx.lineTo(c,d);cx.stroke();}
function poly(pts,fill,stroke){cx.beginPath();cx.moveTo(pts[0][0],pts[0][1]);for(let i=1;i<pts.length;i++)cx.lineTo(pts[i][0],pts[i][1]);cx.closePath();cx.fillStyle=fill;cx.fill();if(stroke){cx.strokeStyle=stroke;cx.lineWidth=1.2;cx.stroke();}}
function losange(x,y,w,h){cx.beginPath();cx.moveTo(x,y-h);cx.lineTo(x+w,y);cx.lineTo(x,y+h);cx.lineTo(x-w,y);cx.closePath();cx.fill();}
let FL=0;
function col(a){const k=FL*0.7;return `rgb(${a[0]+(255-a[0])*k|0},${a[1]+(255-a[1])*k|0},${a[2]+(255-a[2])*k|0})`;}
const ROC=[54,57,66],ROCH=[82,86,98],BRZ=[150,104,46],BRZ2=[96,64,26],ORr=[214,170,80],FER=[64,68,78],FER2=[40,43,50];
function graine(n){let s=n;return()=>{s=(s*16807)%2147483647;return s/2147483647;};}

