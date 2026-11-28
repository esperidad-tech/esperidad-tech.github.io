# Assemble la salle large : l'image large de Romain recalee sur l'image debout (la base),
# l'image debout recollee telle quelle au milieu, coutures corrigees par flot optique.
import cv2, numpy as np, sys
S=sys.argv[1]; s=0.56; x0=1540
W=cv2.imread(f'{S}/salle3/large-romain.png'); D=cv2.imread(f'{S}/salle2/debout.png'); H=np.load(f'{S}/salle3/H.npy')
A=np.array([[s,0,x0],[0,s,0],[0,0,1.]]); G=A@np.linalg.inv(H)
h=int(round(3840*s)); dw=int(round(2160*s)); w=4384
Ds=cv2.resize(D,(dw,h),interpolation=cv2.INTER_AREA)
# carte : pixel du canevas -> pixel de l'image large
Gi=np.linalg.inv(G)
yy,xx=np.mgrid[0:h,0:w].astype(np.float32)
den=Gi[2,0]*xx+Gi[2,1]*yy+Gi[2,2]
mx=((Gi[0,0]*xx+Gi[0,1]*yy+Gi[0,2])/den).astype(np.float32); my=((Gi[1,0]*xx+Gi[1,1]*yy+Gi[1,2])/den).astype(np.float32)
Wc=cv2.remap(W,mx,my,cv2.INTER_LANCZOS4,borderMode=cv2.BORDER_CONSTANT)
ok=((mx>=0)&(mx<=W.shape[1]-1)&(my>=0)&(my<=W.shape[0]-1))
# flot optique debout -> large, sur la bande du milieu
mid=Wc[:,x0:x0+dw]
dis=cv2.DISOpticalFlow_create(cv2.DISOPTICAL_FLOW_PRESET_MEDIUM)
F=dis.calc(cv2.cvtColor(Ds,cv2.COLOR_BGR2GRAY),cv2.cvtColor(mid,cv2.COLOR_BGR2GRAY),None)
okm=ok[:,x0:x0+dw]; F[~okm]=0
F=cv2.GaussianBlur(F,(0,0),12)
B=60   # largeur du fondu, dans le milieu
L=400  # distance sur laquelle la correction s'eteint, sur les cotes
Fx=np.zeros((h,w),np.float32); Fy=np.zeros((h,w),np.float32)
# dans le milieu : le flot complet
Fx[:,x0:x0+dw]=F[...,0]; Fy[:,x0:x0+dw]=F[...,1]
# cotes : le flot de la colonne de couture, qui s'eteint
fl=F[:,0:8].mean(1); fr=F[:,dw-8:dw].mean(1)
for side,fc,xs in (('g',fl,np.arange(0,x0)),('d',fr,np.arange(x0+dw,w))):
    d=(x0-xs) if side=='g' else (xs-(x0+dw-1))
    k=np.clip(1-d/L,0,1); k=k*k*(3-2*k)
    Fx[:,xs]=fc[:,0:1]*k[None]; Fy[:,xs]=fc[:,1:2]*k[None]
mx2=mx+0; my2=my+0
# le flot est en pixels du canevas : on corrige la carte en recomposant
Wc2=cv2.remap(Wc,(xx+Fx).astype(np.float32),(yy+Fy).astype(np.float32),cv2.INTER_LINEAR,borderMode=cv2.BORDER_REPLICATE)
ok2=cv2.remap(ok.astype(np.uint8),(xx+Fx).astype(np.float32),(yy+Fy).astype(np.float32),cv2.INTER_NEAREST,borderMode=cv2.BORDER_CONSTANT)>0
# fondu
a=np.zeros(w,np.float32); a[x0+B:x0+dw-B]=1
r=np.linspace(0,1,B); a[x0:x0+B]=r; a[x0+dw-B:x0+dw]=r[::-1]
a=np.repeat(a[None],h,0)
out=Wc2.astype(np.float32)
Dfull=np.zeros_like(out); Dfull[:,x0:x0+dw]=Ds
# la ou le large manque dans le milieu (haut), on prend le debout
a[:,x0:x0+dw][~ok2[:,x0:x0+dw]]=1
out=out*(1-a[...,None])+Dfull*a[...,None]
out=out.astype(np.uint8)
hole=(~ok2)&(a<1)
cv2.imwrite(f'{S}/salle3/large-assemblee.png',out); cv2.imwrite(f'{S}/salle3/trou.png',(hole*255).astype(np.uint8))
# controle : le milieu (hors fondu) est-il exactement l'image debout ?
print('milieu exact :', np.abs(out[:,x0+B:x0+dw-B].astype(int)-Ds[:,B:dw-B].astype(int)).max())
print('flot couture g : med',np.median(np.abs(fl),0),'max',np.abs(fl).max(0)); print('flot couture d : med',np.median(np.abs(fr),0),'max',np.abs(fr).max(0))
ys=np.where(hole.any(1))[0]; print('trou lignes',ys.min() if len(ys) else None, ys.max() if len(ys) else None, 'pixels',hole.sum())
for c in (0,1000,x0-1,x0+dw,3500,w-1):
  col=np.where(~hole[:,c])[0]; print('col',c,'premiere ligne pleine',col.min() if len(col) else None,'derniere',col.max() if len(col) else None)
