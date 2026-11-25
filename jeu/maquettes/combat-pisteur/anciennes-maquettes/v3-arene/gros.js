function dessinerGrosbecCorps(){
  const x=225,y=FT+6,br=Math.sin(tReel*1.6)*1.5;
  const g=GB.geste,t=GB.t,k=g==='repos'?0:Math.min(1,t/0.25)*(t>1.3?Math.max(0,1-(t-1.3)/0.4):1);
  if(g!=='repos'&&t>1.7)GB.geste='repos';
  cx.save();cx.translate(x,y);
  glow('rgba(255,200,90,.5)',0,-95,70,0.35+0.08*Math.sin(tReel*5));
  poly([[-40,-120+br],[40,-120+br],[62,-4],[-62,-4]],'#521010');
  poly([[-36,-118+br],[-20,-118+br],[-30,-6],[-56,-6]],'#6e1616');
  for(const s of [-1,1]){
    poly([[s*10,-58],[s*32,-58],[s*30,-6],[s*12,-6]],'#4a3416','#1d1407');
    cx.fillStyle='#c9993f';circ(s*21,-32,5);
    poly([[s*8,-6],[s*36,-6],[s*38,0],[s*6,0]],'#3a2810');
  }
  poly([[-38,-118+br],[38,-118+br],[31,-58],[-31,-58]],'#4b3517','#1d1407');
  cx.strokeStyle='#d6aa50';cx.lineWidth=1.5;ligne(-30,-75,30,-75);ligne(-28,-66,28,-66);
  cx.fillStyle='#a01818';cx.fillRect(-33,-62,66,8);
  lanterne(0,-58,8,9);lanterne(0,-96+br,14,17);
  const bras=(s)=>{
    let ex=s*52,ey=-80,fx=s*50,fy=-56;
    if(g==='envoie'&&s===GB.cote){ex=s*lerp(52,66,k);ey=lerp(-80,-108,k);fx=s*lerp(50,86,k);fy=lerp(-56,-118,k);}
    if(g==='colere'){ex=s*lerp(52,56,k);ey=lerp(-80,-130,k);fx=s*lerp(50,40,k);fy=lerp(-56,-162,k);}
    cx.lineCap='round';cx.strokeStyle='#5a3f16';cx.lineWidth=14;ligne(s*44,-106+br,ex,ey);
    cx.strokeStyle='#3e2b10';cx.lineWidth=12;ligne(ex,ey,fx,fy);
    cx.fillStyle='#2a1c0a';circ(fx,fy,8);cx.fillStyle='#c9993f';circ(ex,ey,4);
  };
  bras(-1);bras(1);
  lanterne(-46,-112+br,10,12,true);lanterne(46,-112+br,10,12,true);
  cx.translate(0,br);
  for(let i=-2;i<=2;i++){poly([[i*6-3,-150],[i*9,-172+Math.abs(i)*4],[i*6+3,-150]],'#8a6224','#3a2810');}
  poly([[-15,-150],[15,-150],[17,-128],[-17,-128]],'#1b1410');
  cx.strokeStyle='#e0b85a';cx.lineWidth=2.4;cx.beginPath();cx.moveTo(-13,-145);cx.lineTo(0,-139);cx.lineTo(13,-145);cx.stroke();
  const ry=g==='colere'?1:0.75;
  glow('rgba(255,70,30,.9)',-7,-138,8,0.8);glow('rgba(255,70,30,.9)',7,-138,8,0.8);
  poly([[-11,-140],[-3,-138],[-3,-136],[-11,-137]],`rgba(255,${g==='colere'?60:110},40,${ry+0.2})`);
  poly([[11,-140],[3,-138],[3,-136],[11,-137]],`rgba(255,${g==='colere'?60:110},40,${ry+0.2})`);
  poly([[-7,-133],[7,-133],[2,-112],[0,-106],[-2,-112]],'#5a3f16','#d6aa50');
  cx.restore();
}
function lanterne(x,y,w,h,toit){
  glow('rgba(255,210,110,.9)',x,y,w*1.8,0.55+0.1*Math.sin(tReel*7+x));
  cx.fillStyle='#8a6224';cx.fillRect(x-w/2-2,y-h/2-2,w+4,h+4);
  cx.fillStyle='#ffdf8a';cx.fillRect(x-w/2,y-h/2,w,h);
  cx.strokeStyle='#5a3f16';cx.lineWidth=1.4;ligne(x,y-h/2,x,y+h/2);
  if(toit)poly([[x-w/2-4,y-h/2-2],[x,y-h/2-9],[x+w/2+4,y-h/2-2]],'#6b4a1a');
}
