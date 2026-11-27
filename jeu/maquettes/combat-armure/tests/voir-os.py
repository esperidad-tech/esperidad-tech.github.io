# Une planche pour regarder les modèles : l'armure de Grosbec (quelques poses) et le héros choisi sous ses huit angles.
# python3 tests/voir-modeles.py [barde|sage|alchimiste] → /tmp/modeles-<role>.png
import os, sys, asyncio
from playwright.async_api import async_playwright
ICI = os.path.dirname(os.path.abspath(__file__)); RAC = os.path.join(ICI, '..')
role = sys.argv[1] if len(sys.argv) > 1 else 'barde'
HV = os.path.join(RAC, '..', '..', 'heros-vues', 'src')
sc = ''
for f in ['hv-base', 'hv-tete', 'hv-cheveux', 'hv-corps', 'hv-pantin', 'hv-poses', 'hv-positions', 'hv-donjon', 'hv-alchimiste', 'hv-sage']:
    sc += '<script>' + open(os.path.join(HV, f + '.js'), encoding='utf8').read() + '</script>\n'
for f in ['modeles/outils.js', 'modeles/grosbec.js', 'heros.js']:
    sc += '<script>' + open(os.path.join(RAC, 'src', f), encoding='utf8').read() + '</script>\n'
html = '''<!DOCTYPE html><html><body style="margin:0;background:#3a3f4c"><canvas id="c" width="1400" height="760"></canvas>
<script>const clamp=(v,a,b)=>v<a?a:v>b?b:v;</script>''' + sc + '''<script>
const c=document.getElementById('c'),x=c.getContext('2d');
Gros.construire(2,0.9);
const poses=[{},{gx:-64,gy:-152,gz:12,dx:64,dy:-152,dz:12,penche:-0.18},{penche:-0.3,gx:-110,gy:-40,dx:110,dy:-40,lumC:2.4},{gx:-36,gy:4,gz:62,dx:36,dy:4,dz:62,penche:0.44,bas:19}];
if(0)poses.forEach((p,i)=>{x.save();x.translate(170+i*330,330);const cv=document.createElement('canvas');cv.width=430;cv.height=350;const g=cv.getContext('2d');g.translate(215,315);Gros.image(g,p,{pul:0.3,fissures:i==3?5:0},1);x.drawImage(cv,-215,-315);
  const pt=['coeur','tete','mainG','mainD'];x.restore();});
HS.lancer('''+repr(role)+''',2,()=>{
  for(let d=0;d<8;d++){['garde','c2','i0','lance','soin','porte'].forEach((n,j)=>{HS.dessiner(x,n,d,60+d*170+(j%3)*52,470+Math.floor(j/3)*140+40);});}
  const h={role:'barde',sexe:'m',peau:'p2',cheveux:'chatain',yeux:'bleu',coiffure:'courts',combat:true};
  [0,45,90,180].forEach((cap,i)=>{const P=Object.assign({},HerosVues.pose('combat'),{cap});const o=HerosVues.os(h,P);
    const svg=HerosVues.svg(h,P,{cadre:'-80 -60 460 520',id:'t'+i});const im=new Image();const X=40+i*330,Y=20;
    im.onload=()=>{x.drawImage(im,X,Y,230,260);const k=230/460;
      for(const n of ['tete','poignetG','poignetD','bassin','cou','epauleD']){const v=o[n];x.fillStyle=n==='tete'?'#f00':n==='poignetG'?'#0f0':n==='poignetD'?'#00f':'#ff0';
        x.fillRect(X+(v[0]+80)*k-3,Y+(v[1]+60)*k-3,6,6);x.fillStyle='#fff';x.fillRect(X+(v[0]+150+80)*k-2,Y+(v[1]+60)*k-2,4,4);}
      x.fillStyle='#fff';x.font='14px sans-serif';x.fillText('cap '+cap+' tete '+o.tete.map(a=>a.toFixed(0)).join(','),X,Y+280);if(i==3)window.fini=1;};
    im.src=URL.createObjectURL(new Blob([svg],{type:'image/svg+xml'}));});
  });
</script></body></html>'''
open('/tmp/voir-modeles.html', 'w', encoding='utf8').write(html)
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path='/usr/bin/google-chrome', args=['--no-sandbox'])
        pg = await b.new_page(viewport={'width': 1400, 'height': 760})
        pg.on('console', lambda m: print('console:', m.text) if m.type == 'error' else None)
        pg.on('pageerror', lambda e: print('erreur:', e))
        await pg.goto('file:///tmp/voir-modeles.html')
        await pg.wait_for_function('window.fini===1', timeout=120000)
        await pg.screenshot(path='/tmp/os-%s.png' % role)
        await b.close()
asyncio.run(main())
