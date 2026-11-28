# Colle le remplissage (Higgsfield) dans les trous seulement, apres l'avoir recale sur l'image assemblee.
import cv2, numpy as np, sys
S=sys.argv[1]; src=sys.argv[2]
O=cv2.imread(f'{S}/salle3/large-169-trous.png'); T=cv2.imread(f'{S}/salle3/trou-169.png',0)>0
h,w=O.shape[:2]
R=cv2.imread(src); R=cv2.resize(R,(w,h),interpolation=cv2.INTER_AREA)
sift=cv2.SIFT_create(15000)
mo=(~cv2.dilate(T.astype(np.uint8),np.ones((41,41),np.uint8)).astype(bool)).astype(np.uint8)*255
ko,do=sift.detectAndCompute(cv2.cvtColor(O,cv2.COLOR_BGR2GRAY),mo); kr,dr=sift.detectAndCompute(cv2.cvtColor(R,cv2.COLOR_BGR2GRAY),None)
m=cv2.FlannBasedMatcher({'algorithm':1,'trees':5},{'checks':64}).knnMatch(dr,do,k=2)
good=[a for a,b in m if a.distance<0.7*b.distance]
P=np.float32([kr[g.queryIdx].pt for g in good]); Q=np.float32([ko[g.trainIdx].pt for g in good])
Hm,inl=cv2.findHomography(P,Q,cv2.RANSAC,3.0); print('matches',len(good),'inliers',int(inl.sum()))
Rw=cv2.warpPerspective(R,Hm,(w,h),flags=cv2.INTER_LANCZOS4,borderMode=cv2.BORDER_REPLICATE)
# petit flot pour coller les bords des trous
dis=cv2.DISOpticalFlow_create(cv2.DISOPTICAL_FLOW_PRESET_MEDIUM)
F=dis.calc(cv2.cvtColor(O,cv2.COLOR_BGR2GRAY),cv2.cvtColor(Rw,cv2.COLOR_BGR2GRAY),None)
F[T]=0; F=cv2.GaussianBlur(F,(0,0),15)
# dans les trous, on prolonge le flot du bord (diffusion simple)
Fs=F.copy(); wgt=(~T).astype(np.float32)
for sig in (40,120):
    num=cv2.GaussianBlur(F*wgt[...,None],(0,0),sig); den=cv2.GaussianBlur(wgt,(0,0),sig)[...,None]+1e-6
    Fs=np.where(T[...,None],num/den,Fs)
yy,xx=np.mgrid[0:h,0:w].astype(np.float32)
Rf=cv2.remap(Rw,xx+Fs[...,0],yy+Fs[...,1],cv2.INTER_LINEAR,borderMode=cv2.BORDER_REPLICATE)
# fondu : 1 dans le trou, descend a 0 sur 30 px hors du trou
d=cv2.distanceTransform((~T).astype(np.uint8),cv2.DIST_L2,5)
a=np.clip(1-d/30,0,1)[...,None]
out=(O*(1-a)+Rf*a).astype(np.uint8)
cv2.imwrite(f'{S}/salle3/salle-barde-large-16x9.png',out)
band=(a[...,0]>0)&(a[...,0]<1)
print('ecart sur le bord du fondu (0-255):',np.abs(O.astype(int)-Rf.astype(int))[band].mean())
print('hors trou et fondu, identique :',np.abs(out.astype(int)-O.astype(int))[a[...,0]==0].max())
