import time
from playwright.sync_api import sync_playwright
with sync_playwright() as p:
    b=p.chromium.launch(); pg=b.new_page(viewport={'width':844,'height':390},device_scale_factor=2)
    pg.goto('file:///home/claude/pisteur4/essais/hv.html'); time.sleep(1)
    r=pg.evaluate("""async()=>{
      const HV=window.HerosVues,h={role:'pisteur',sexe:'f',peau:'p1',cheveux:'roux',yeux:'vert'};
      const out={};let t=performance.now();const svgs=[];
      for(let i=0;i<20;i++)svgs.push(HV.svg(h,Object.assign({},HV.course(i*0.05),{cap:45*(i%8)}),{cadre:'-70 -10 440 460',id:'ps'}));
      out.calcul=(performance.now()-t)/20;out.taille=svgs[0].length;
      out.filtres=(svgs[0].match(/<filter/g)||[]).length;out.motifs=(svgs[0].match(/<pattern/g)||[]).length;out.grad=(svgs[0].match(/Gradient /g)||[]).length;out.useFiltre=(svgs[0].match(/filter="/g)||[]).length;
      const cuire=async(s,w,hh)=>{const c=document.createElement('canvas');c.width=w;c.height=hh;const x=c.getContext('2d');const t0=performance.now();
        for(const v of s){const u=URL.createObjectURL(new Blob([v.replace('<svg ','<svg width="'+w+'" height="'+hh+'" ')],{type:'image/svg+xml'}));const im=new Image();await new Promise(r=>{im.onload=r;im.onerror=r;im.src=u});x.drawImage(im,0,0,w,hh);URL.revokeObjectURL(u);}
        x.getImageData(0,0,1,1);return (performance.now()-t0)/s.length;};
      out.decode132=await cuire(svgs,132,138);
      out.decode66=await cuire(svgs,66,69);
      const sans=svgs.map(v=>v.replace(/ filter="[^"]*"/g,''));
      out.sansFiltre=await cuire(sans,132,138);
      out.debutDefs=svgs[0].slice(0,900);
      return out;}""")
    for k,v in r.items(): print(k,':',v if k!='debutDefs' else v[:900])
