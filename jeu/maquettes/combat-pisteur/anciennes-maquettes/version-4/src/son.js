/* ======================= le son ======================= */
let AC=null,sortie=null,sonOn=true,bruitBuf=null;
function initSon(){
  if(AC){if(AC.state==='suspended')AC.resume();return;}
  try{
    AC=new (window.AudioContext||window.webkitAudioContext)();
    sortie=AC.createGain();sortie.gain.value=0.5;
    const comp=AC.createDynamicsCompressor();sortie.connect(comp);comp.connect(AC.destination);
    const n=AC.sampleRate;bruitBuf=AC.createBuffer(1,n,AC.sampleRate);
    const d=bruitBuf.getChannelData(0);for(let i=0;i<n;i++)d[i]=Math.random()*2-1;
  }catch(e){AC=null;}
}
function osc(type,f0,f1,dur,vol,t0){
  const t=AC.currentTime+(t0||0),o=AC.createOscillator(),g=AC.createGain();
  o.type=type;o.frequency.setValueAtTime(f0,t);if(f1!==f0)o.frequency.exponentialRampToValueAtTime(Math.max(20,f1),t+dur);
  g.gain.setValueAtTime(0.0001,t);g.gain.exponentialRampToValueAtTime(vol,t+0.008);g.gain.exponentialRampToValueAtTime(0.0001,t+dur);
  o.connect(g);g.connect(sortie);o.start(t);o.stop(t+dur+0.05);
}
function bruit(dur,vol,ft,f0,f1,t0,q){
  const t=AC.currentTime+(t0||0),s=AC.createBufferSource();s.buffer=bruitBuf;
  const f=AC.createBiquadFilter();f.type=ft;f.Q.value=q||1;f.frequency.setValueAtTime(f0,t);if(f1&&f1!==f0)f.frequency.exponentialRampToValueAtTime(f1,t+dur);
  const g=AC.createGain();g.gain.setValueAtTime(0.0001,t);g.gain.exponentialRampToValueAtTime(vol,t+0.005);g.gain.exponentialRampToValueAtTime(0.0001,t+dur);
  s.connect(f);f.connect(g);g.connect(sortie);s.start(t,Math.random()*0.5);s.stop(t+dur+0.05);
}
const dernierSon={};
function son(n){
  if(!AC||!sonOn)return;
  const now=AC.currentTime;if(dernierSon[n]&&now-dernierSon[n]<0.045)return;dernierSon[n]=now;
  try{switch(n){
    case 'swish':bruit(0.12,0.26,'bandpass',1200,4200,0,1.4);break;
    case 'swishG':bruit(0.26,0.36,'bandpass',380,1500,0,1);osc('sine',120,60,0.2,0.25);break;
    case 'grogne':osc('sawtooth',82,58,0.42,0.1);bruit(0.42,0.16,'lowpass',320,160);break;
    case 'vise':osc('sine',900,1450,0.16,0.06);break;
    case 'gratte':for(let i=0;i<3;i++)bruit(0.16,0.3,'bandpass',420,180,i*0.3,2);break;
    case 'mortier':osc('sine',160,48,0.28,0.5);bruit(0.22,0.42,'lowpass',900,200);break;
    case 'onde':osc('sine',62,28,0.9,0.75);bruit(0.9,0.5,'lowpass',420,70);break;
    case 'ramasse':osc('triangle',660,990,0.15,0.2);osc('triangle',990,1320,0.15,0.15,0.08);break;
    case 'planter':osc('sine',320,150,0.08,0.3);bruit(0.06,0.3,'bandpass',1500);break;
    case 'jav':bruit(0.22,0.3,'bandpass',800,2600,0,1.2);osc('triangle',200,120,0.15,0.2);break;
    case 'choix':[659,880,1175].forEach((f,i)=>osc('triangle',f,f,0.35,0.14,i*0.09));break;
    case 'feu':bruit(0.15,0.16,'bandpass',900,400,0,0.8);break;
    case 'casse':bruit(0.18,0.4,'highpass',1200);osc('sine',220,110,0.1,0.2);break;
    case 'alerte':osc('square',660,990,0.12,0.16);osc('square',990,1320,0.16,0.16,0.1);break;
    case 'perdu':osc('sine',520,300,0.3,0.14);osc('sine',390,220,0.3,0.1,0.12);break;
    case 'ordre':osc('sawtooth',150,95,0.5,0.22);bruit(0.35,0.2,'bandpass',500,260,0,2);osc('sawtooth',210,120,0.4,0.14,0.12);break;
    case 'ombre':bruit(0.28,0.22,'bandpass',300,1800,0,1.2);osc('sine',220,660,0.22,0.1);break;
    case 'assassin':bruit(0.1,0.4,'highpass',2600);osc('triangle',1400,300,0.18,0.28);osc('sine',90,45,0.3,0.4,0.03);break;
    case 'bande':osc('sine',180,420,0.6,0.07);break;
    case 'tirVise':bruit(0.2,0.3,'bandpass',1200,5200,0,1.4);osc('triangle',900,1800,0.16,0.18);break;
    case 'frappe':bruit(0.09,0.45,'bandpass',2400,900,0,1.2);osc('sine',160,55,0.12,0.55);break;
    case 'bong':osc('sine',330,322,0.5,0.3);osc('sine',495,490,0.35,0.18);osc('triangle',220,214,0.4,0.22);bruit(0.03,0.3,'highpass',3000);break;
    case 'contre':[988,1480,2217].forEach((f,i)=>osc('triangle',f,f*0.98,0.55-i*0.1,0.2));bruit(0.06,0.4,'highpass',2500);osc('sine',120,60,0.15,0.5);break;
    case 'or':osc('sine',1568,1568,0.18,0.1);osc('sine',2349,2349,0.12,0.05,0.03);break;
    case 'rouge':osc('sawtooth',110,90,0.25,0.1);bruit(0.2,0.14,'lowpass',400,200);break;
    case 'acheve':bruit(0.08,0.6,'highpass',1800);for(let i=0;i<5;i++)osc('sine',2500+Math.random()*2500,2000,0.25,0.06,0.02+i*0.025);osc('sine',90,40,0.35,0.75);bruit(0.4,0.3,'lowpass',600,150,0.02);break;
    case 'roule':bruit(0.25,0.22,'bandpass',500,1600,0,0.8);break;
    case 'saut':bruit(0.3,0.22,'bandpass',400,1800,0,0.7);break;
    case 'parfait':osc('sine',600,90,0.8,0.32);osc('triangle',300,45,0.9,0.18);bruit(0.6,0.14,'lowpass',2000,200);break;
    case 'arc':osc('triangle',260,140,0.18,0.3);bruit(0.05,0.18,'bandpass',3000);break;
    case 'fleche':bruit(0.06,0.3,'bandpass',2000);osc('sine',200,80,0.1,0.28);break;
    case 'braise':bruit(0.25,0.25,'lowpass',800,200);osc('sine',180,120,0.2,0.18);break;
    case 'impact':bruit(0.35,0.45,'lowpass',500,120);osc('sine',80,40,0.3,0.45);break;
    case 'aie':osc('sawtooth',220,110,0.22,0.15);bruit(0.12,0.3,'lowpass',900);osc('sine',100,50,0.2,0.45);break;
    case 'sifflet':osc('sine',1700,2500,0.25,0.22);osc('sine',2500,1900,0.35,0.22,0.25);break;
    case 'betes':bruit(1.6,0.4,'lowpass',300,120);for(let i=0;i<4;i++)osc('sawtooth',90+Math.random()*30,60,0.5,0.1,0.1+i*0.25);break;
    case 'allez':osc('sawtooth',98,92,0.14,0.15);osc('sawtooth',110,100,0.2,0.15,0.18);break;
    case 'cor':osc('sawtooth',147,147,0.9,0.1);osc('sawtooth',220,220,0.9,0.07);break;
    case 'porte':bruit(0.5,0.22,'lowpass',300,100);osc('sine',60,45,0.5,0.25);break;
    case 'bang':bruit(0.3,0.55,'lowpass',700,150);osc('sine',70,35,0.4,0.65);break;
    case 'victoire':[523,659,784,1047].forEach((f,i)=>osc('triangle',f,f,0.5,0.18,i*0.12));break;
    case 'chute':bruit(0.2,0.3,'lowpass',400,120);osc('sine',90,45,0.2,0.35);break;
  }}catch(e){}
}
function lire(t){try{speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(t);u.lang='fr-FR';speechSynthesis.speak(u);}catch(e){}}

