import cv2, numpy as np, sys
S=sys.argv[1]
W=cv2.imread(f'{S}/salle3/large-romain.png'); D=cv2.imread(f'{S}/salle2/debout.png')
# 1) homographie debout(plein) -> large, sur SIFT
sift=cv2.SIFT_create(20000)
gw=cv2.cvtColor(W,cv2.COLOR_BGR2GRAY); gd=cv2.cvtColor(cv2.resize(D,None,fx=0.5,fy=0.5,interpolation=cv2.INTER_AREA),cv2.COLOR_BGR2GRAY)
kw,dw=sift.detectAndCompute(gw,None); kd,dd=sift.detectAndCompute(gd,None)
m=cv2.FlannBasedMatcher({'algorithm':1,'trees':5},{'checks':64}).knnMatch(dd,dw,k=2)
good=[a for a,b in m if a.distance<0.7*b.distance]
P=np.float32([kd[g.queryIdx].pt for g in good])*2; Q=np.float32([kw[g.trainIdx].pt for g in good])
H,inl=cv2.findHomography(P,Q,cv2.RANSAC,4.0)
inl=inl.ravel().astype(bool)
r=cv2.perspectiveTransform(P[inl][None],H)[0]-Q[inl]
print('matches',len(good),'inliers',inl.sum(),'resid med',np.median(np.linalg.norm(r,axis=1)))
print(H)
np.save(f'{S}/salle3/H.npy',H)
# repartition des points (en coordonnees debout)
pts=P[inl]; print('x range',pts[:,0].min(),pts[:,0].max(),'y range',pts[:,1].min(),pts[:,1].max())
