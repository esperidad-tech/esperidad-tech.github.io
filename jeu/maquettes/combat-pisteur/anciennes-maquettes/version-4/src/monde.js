/* ======================= la salle : ses obstacles, ses chemins ======================= */
const OBS0=[
  {k:'pilier',c:1,x:5,y:4.9,r:0.75,h:4.3,haut:1},{k:'pilier',c:1,x:21,y:4.9,r:0.75,h:4.3,haut:1},
  {k:'pilier',c:1,x:5.2,y:13.7,r:0.75,h:4.3,haut:1},{k:'pilier',c:1,x:20.8,y:13.7,r:0.75,h:4.3,haut:1},
  {k:'pan',x:8.9,y:8.0,w:3.4,d:0.8,h:2.3,haut:1},{k:'pan',x:17.6,y:11.2,w:3.4,d:0.8,h:2.3,haut:1},
  {k:'statue',x:16.6,y:6.2,w:3.2,d:1.2,h:0.9},
  {k:'muret',x:9.4,y:12.4,w:0.8,d:2.8,h:1.0},
  {k:'muret',x:14.9,y:14.7,w:2.8,d:0.8,h:1.0},
  {k:'gravats',c:1,x:10.3,y:4.3,r:1.0,h:0.7},
  {k:'gravats',c:1,x:3.3,y:9.3,r:0.85,h:0.6},
  {k:'chariot',x:21.4,y:8.3,w:2.4,d:1.3,h:1.1},
  {k:'caisse',x:7.1,y:15.8,w:1.5,d:1.5,h:1.1},
  {k:'caisse',x:18.6,y:16.1,w:1.4,d:1.4,h:1.1},
  {k:'estrade',x:13,y:2.25,w:4.8,d:1.9,h:0.9,haut:1,fond:1}
];
const GBX=13,GBY=2.2,GBZ=0.9;              /* où se tient Grosbec */
let OBS=[],nuages=[];
function dansObs(x,y,o,m){return o.c?hyp(x-o.x,y-o.y)<o.r+m:(Math.abs(x-o.x)<o.w/2+m&&Math.abs(y-o.y)<o.d/2+m);}
function horsSalle(x,y,r){return x<0.2+r||x>RW-0.2-r||y<Y0+r*0.5||y>RD-0.2-r;}
function pousserHors(e,r,seulHauts){
  let heurt=null;
  for(const o of OBS){
    if(seulHauts&&!o.haut)continue;
    if(o.c){const dx=e.x-o.x,dy=e.y-o.y,d=hyp(dx,dy),m=o.r+r;if(d<m){heurt=o;if(d<1e-4){e.x+=m;continue;}e.x=o.x+dx/d*m;e.y=o.y+dy/d*m;}}
    else{
      const qx=clamp(e.x,o.x-o.w/2,o.x+o.w/2),qy=clamp(e.y,o.y-o.d/2,o.y+o.d/2),dx=e.x-qx,dy=e.y-qy,d=hyp(dx,dy);
      if(d<r){heurt=o;
        if(d>1e-4){e.x=qx+dx/d*r;e.y=qy+dy/d*r;}
        else{const l=e.x-(o.x-o.w/2),ri=(o.x+o.w/2)-e.x,t=e.y-(o.y-o.d/2),b=(o.y+o.d/2)-e.y,mn=Math.min(l,ri,t,b);
          if(mn===l)e.x=o.x-o.w/2-r;else if(mn===ri)e.x=o.x+o.w/2+r;else if(mn===t)e.y=o.y-o.d/2-r;else e.y=o.y+o.d/2+r;}
      }
    }
  }
  const x0=e.x,y0=e.y;
  e.x=clamp(e.x,0.2+r,RW-0.2-r);e.y=clamp(e.y,Y0+r*0.5,RD-0.2-r);
  if(e.x!==x0||e.y!==y0)heurt=heurt||'mur';
  return heurt;
}
function obsEn(x,y,m,seulHauts){for(const o of OBS){if(seulHauts&&!o.haut)continue;if(dansObs(x,y,o,m))return o;}return null;}
/* voit-on de a à b ? (seulHauts : seuls les piliers et les pans de mur arrêtent le regard — celui de Grosbec, perché sur son estrade) */
function vue(ax,ay,bx,by,seulHauts){
  const d=hyp(bx-ax,by-ay),n=Math.ceil(d/0.22);
  for(let k=1;k<n;k++){const t=k/n,x=lerp(ax,bx,t),y=lerp(ay,by,t);for(const o of OBS){if(o.fond||(seulHauts&&!o.haut))continue;if(dansObs(x,y,o,0.04))return false;}}
  return true;
}
function rayon(x,y,a,max,m,seulHauts){const c=Math.cos(a),s=Math.sin(a);for(let L=0.3;L<max;L+=0.2){const qx=x+c*L,qy=y+s*L;if(horsSalle(qx,qy,m))return L;for(const o of OBS){if(o.fond||(seulHauts&&!o.haut))continue;if(dansObs(qx,qy,o,m))return L;}}return max;}
function dansNuage(x,y){for(const n of nuages)if(hyp(x-n.x,y-n.y)<n.r)return true;return false;}

/* ---- la grille pour trouver son chemin ---- */
const CEL=0.5,GW=Math.round(RW/CEL),GH=Math.round(RD/CEL);
const bloque=new Uint8Array(GW*GH);
const DIRS=[[1,0,1],[-1,0,1],[0,1,1],[0,-1,1],[1,1,1.414],[1,-1,1.414],[-1,1,1.414],[-1,-1,1.414]];
let cachettes=[],RONDES=[];
function majGrille(){
  for(let j=0;j<GH;j++)for(let i=0;i<GW;i++){
    const x=(i+0.5)*CEL,y=(j+0.5)*CEL;let b=(y<Y0+0.2||x<0.5||x>RW-0.5||y>RD-0.4)?1:0;
    if(!b&&obsEn(x,y,0.42,false))b=1;bloque[j*GW+i]=b;
  }
  /* les cachettes : les coins libres collés aux obstacles */
  cachettes=[];
  for(const o of OBS){
    if(o.fond)continue;
    const pts=o.c?[[o.r+0.75,0],[-o.r-0.75,0],[0,o.r+0.75],[0,-o.r-0.75]]:[[o.w/2+0.75,0],[-o.w/2-0.75,0],[0,o.d/2+0.75],[0,-o.d/2-0.75]];
    for(const [dx,dy] of pts){const x=o.x+dx,y=o.y+dy;if(!horsSalle(x,y,0.5)&&!bloque[cel(x,y)])cachettes.push({x,y,o});}
  }
  RONDES=[[3,3.4],[23,3.4],[2.6,16.2],[23.4,16.2],[13,7.6],[13,16.6],[7,10.6],[19,7.6],[12.2,12.4],[17.4,13.4],[8,4.6],[18.4,4.2],[24,11],[2.4,12.4]].filter(q=>!bloque[cel(q[0],q[1])]).map(q=>({x:q[0],y:q[1]}));
}
function cel(x,y){return clamp(Math.floor(y/CEL),0,GH-1)*GW+clamp(Math.floor(x/CEL),0,GW-1);}
const tas={v:new Float32Array(GW*GH*8),n:new Int32Array(GW*GH*8),k:0};
function tasPush(c,n){let i=tas.k++;tas.v[i]=c;tas.n[i]=n;while(i>0){const p=(i-1)>>1;if(tas.v[p]<=tas.v[i])break;const tv=tas.v[p],tn=tas.n[p];tas.v[p]=tas.v[i];tas.n[p]=tas.n[i];tas.v[i]=tv;tas.n[i]=tn;i=p;}}
function tasPop(){const rv=tas.v[0],rn=tas.n[0];tas.k--;if(tas.k>0){tas.v[0]=tas.v[tas.k];tas.n[0]=tas.n[tas.k];let i=0;for(;;){const l=2*i+1,r=l+1;let m=i;if(l<tas.k&&tas.v[l]<tas.v[m])m=l;if(r<tas.k&&tas.v[r]<tas.v[m])m=r;if(m===i)break;const tv=tas.v[m],tn=tas.n[m];tas.v[m]=tas.v[i];tas.n[m]=tas.n[i];tas.v[i]=tv;tas.n[i]=tn;i=m;}}return [rv,rn];}
function champ(tx,ty,penal){
  const D=new Float32Array(GW*GH).fill(1e9);let s=cel(tx,ty);
  if(bloque[s]){let bd=1e9,bs=s;for(let j=0;j<GH;j++)for(let i=0;i<GW;i++){const n=j*GW+i;if(bloque[n])continue;const d=hyp((i+0.5)*CEL-tx,(j+0.5)*CEL-ty);if(d<bd){bd=d;bs=n;}}s=bs;}
  D[s]=0;tas.k=0;tasPush(0,s);
  while(tas.k>0){
    const [c,n]=tasPop();if(c>D[n])continue;const i=n%GW,j=(n/GW)|0;
    for(const [di,dj,w] of DIRS){
      const ni=i+di,nj=j+dj;if(ni<0||nj<0||ni>=GW||nj>=GH)continue;const m=nj*GW+ni;if(bloque[m])continue;
      if(di&&dj&&(bloque[j*GW+ni]||bloque[nj*GW+i]))continue;
      const nc=c+w+(penal?penal(m):0);if(nc<D[m]){D[m]=nc;tasPush(nc,m);}
    }
  }
  return D;
}
function pasVers(g,D,fuir){
  const c=cel(g.x,g.y),i=c%GW,j=(c/GW)|0;let best=c,bd=fuir?(D[c]>=1e8?-1:D[c]):D[c];
  for(const [di,dj] of DIRS){
    const ni=i+di,nj=j+dj;if(ni<0||nj<0||ni>=GW||nj>=GH)continue;const n=nj*GW+ni;if(bloque[n]||D[n]>=1e8)continue;
    if(di&&dj&&(bloque[j*GW+ni]||bloque[nj*GW+i]))continue;
    if(fuir?D[n]>bd:D[n]<bd){bd=D[n];best=n;}
  }
  return [((best%GW)+0.5)*CEL,(((best/GW)|0)+0.5)*CEL];
}
function allerVers(g,tx,ty,v,dt){const dx=tx-g.x,dy=ty-g.y,d=hyp(dx,dy);if(d<1e-3)return 0;const s=Math.min(v*dt,d);g.x+=dx/d*s;g.y+=dy/d*s;g.marche=(g.marche||0)+s;g.dirM=Math.atan2(dy,dx);return s;}
