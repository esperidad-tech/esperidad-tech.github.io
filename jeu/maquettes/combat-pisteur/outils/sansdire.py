# Enlève les appels au conteur « dire(…) » d'un fichier du jeu (25 novembre, 23 h : plus aucun texte d'aide).
import re
def fin_appel(s,i):
    k=s.index('(',i); n=0
    while True:
        c=s[k]
        if c in '"\'`':
            q=c;k+=1
            while s[k]!=q:
                if s[k]=='\\':k+=1
                k+=1
        elif c=='(':n+=1
        elif c==')':
            n-=1
            if n==0:return k+1
        k+=1
def sans_dire(s):
    n=0
    while True:
        m=None
        for x in re.finditer(r'\bdire\(',s):
            if s[max(0,x.start()-9):x.start()]=='function ':continue
            m=x;break
        if not m:break
        e=fin_appel(s,m.start())
        av=s[:m.start()].rstrip()[-1:]
        assert av in ';{}', ('à traiter à la main', s[max(0,m.start()-80):e+30])
        assert s[e]==';', s[m.start():e+5]
        e+=1
        # une ligne qui ne portait que cet appel disparaît en entier
        ls=s.rfind('\n',0,m.start())+1; le=s.find('\n',e)
        if s[ls:m.start()].strip()=='' and s[e:le].strip()=='': s=s[:ls]+s[le+1:]
        else: s=s[:m.start()]+s[e:]
        n+=1
    return s,n
