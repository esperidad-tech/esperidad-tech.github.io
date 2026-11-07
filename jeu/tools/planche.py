import sys, glob
from PIL import Image
def planche(fichiers, sortie, larg=330, cols=4, haut_max=720):
    ims=[]
    for f in fichiers:
        im=Image.open(f).convert('RGB'); r=larg/im.width; im=im.resize((larg,int(im.height*r)))
        if im.height>haut_max: im=im.crop((0,0,larg,haut_max))
        ims.append(im)
    rows=(len(ims)+cols-1)//cols
    hs=[max(im.height for im in ims[i*cols:(i+1)*cols]) for i in range(rows)]
    P=Image.new('RGB',(cols*larg+(cols-1)*8,sum(hs)+(rows-1)*8),(10,10,20))
    y=0
    for r in range(rows):
        for c,im in enumerate(ims[r*cols:(r+1)*cols]): P.paste(im,(c*(larg+8),y))
        y+=hs[r]+8
    P.save(sortie)
if __name__=='__main__':
    planche(sys.argv[2:], sys.argv[1])
