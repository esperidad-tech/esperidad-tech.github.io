"""Équilibre de la salle des rats : simule 2000 combats par style de jeu avec les règles du prototype. python3 equilibre.py"""
import random
PVH = {'sage':90,'alchimiste':100,'pisteur':120}
VISEE = {'pisteur':6,'alchimiste':2.5,'sage':1.5}
EXPO = ['pisteur','alchimiste','sage']
def partie(politique, sac, rnd, max_tours=30):
    h = {k:{'pv':v,'sol':False,'bouc':False} for k,v in PVH.items()}
    r = [{'pv':40,'mort':False,'ouv':False,'aff':False,'colle':False} for _ in range(3)]
    for tour in range(1, max_tours+1):
        debout = [k for k in h if not h[k]['sol']]
        if not debout: return ('fuite', tour)
        for x in r:
            if not x['mort']:
                tot = sum(VISEE[k] for k in debout); y = rnd.random()*tot
                for k in debout:
                    y -= VISEE[k]
                    if y < 0: x['vise'] = k; break
        ordre = politique(h, r, sac, rnd, tour)
        for (heros, geste, cible) in ordre:
            if h[heros]['sol']: continue
            viv = [x for x in r if not x['mort']]
            if not viv: break
            if cible == 'devant' or (isinstance(cible,int) and r[cible]['mort']): cible = r.index(viv[0])
            R = r[cible] if isinstance(cible,int) else None
            def crit(R): R['pv']=0; R['mort']=True
            def dmg(R,n):
                R['pv']-=n
                if R['pv']<=0: R['mort']=True
            if geste=='rune': R['ouv']=True
            elif geste=='bouclier': h[cible]['bouc']=True
            elif geste=='louche':
                for x in viv: x['aff']=True
                dmg(viv[0], 10 if viv[0]['ouv'] else 2)
            elif geste=='herbes': h[cible]['pv']=min(PVH[cible],h[cible]['pv']+20)
            elif geste=='fleche':
                if R['ouv'] or rnd.random()<1/8: crit(R)
                else: dmg(R,3)
            elif geste=='dague':
                R=viv[0]
                if R['ouv']: crit(R)
                else: dmg(R,4)
            elif geste in ('feu','huile','colle') and heros=='pisteur' and R['ouv']: crit(R)
            elif geste=='feu': dmg(R, 30 if R['ouv'] else 5)
            elif geste=='huile': R['ouv']=True
            elif geste=='colle': R['colle']=True
            elif geste=='baume': h[cible]['pv']=min(PVH[cible],h[cible]['pv']+40)
            elif geste=='coeur':
                if h[cible]['sol']: h[cible]['sol']=False; h[cible]['pv']=40
        if all(x['mort'] for x in r): return ('victoire', tour)
        for x in r:
            if x['mort'] or not [k for k in h if not h[k]['sol']]: continue
            if x['colle']: continue
            v = x['vise'] if not h[x['vise']]['sol'] else [k for k in EXPO if not h[k]['sol']][0]
            for _ in range(2 if x['aff'] else 1):
                vv = [k for k in EXPO if not h[k]['sol']]
                if not vv: break
                if h[v]['sol']: v = vv[0]
                d = 4 if h[v]['bouc'] else 8
                h[v]['pv'] -= d
                if h[v]['pv'] <= 0: h[v]['pv']=0; h[v]['sol']=True; h[v]['bouc']=False
        for x in r: x['ouv']=False; x['aff']=False; x['colle']=False
        for k in h: h[k]['bouc']=False
    return ('long', max_tours)

def malin(h, r, sac, rnd, tour):
    viv = [i for i,x in enumerate(r) if not x['mort']]
    o = []
    if tour == 1: o.append(('sage','etudier',viv[0]))
    else: o.append(('sage','rune',viv[0]))
    if tour == 1 and 'huile' in sac: o.insert(0,('alchimiste','huile',viv[0]))
    else:
        bl = min(h, key=lambda k: h[k]['pv']/PVH[k])
        o.append(('alchimiste','baume' if 'baume' in sac else 'herbes', bl))
    o.append(('pisteur','fleche',viv[0]))
    return o

GESTES = {'sage':['etudier','rune','bouclier'],'alchimiste':['louche','herbes'],'pisteur':['fleche','dague']}
def hasard(h, r, sac, rnd, tour):
    heros = ['sage','alchimiste','pisteur']; rnd.shuffle(heros)
    o = []
    for k in heros:
        g = list(GESTES[k])
        if k=='alchimiste': g += sac
        if k=='pisteur': g += [s for s in sac if s in ('feu','huile','colle')]
        g = rnd.choice(g)
        if g in ('bouclier','herbes','baume','coeur'):
            c = rnd.choice(['sage','alchimiste','pisteur'])
            if g=='coeur': c = next((x for x in h if h[x]['sol']), c)
        elif g=='fumigene': continue
        else: c = rnd.choice([i for i,x in enumerate(r) if not x['mort']] or [0])
        o.append((k,g,c))
    return o
def tape(h, r, sac, rnd, tour):
    # « on tape sans réfléchir » : flèche, feu (ou louche), le Sage met des boucliers
    d = [i for i,x in enumerate(r) if not x['mort']][0]
    return [('pisteur','fleche',d), ('alchimiste','feu' if 'feu' in sac else 'louche', d), ('sage','bouclier','pisteur')]
def louche(h, r, sac, rnd, tour):
    d = [i for i,x in enumerate(r) if not x['mort']][0]
    return [('alchimiste','louche',d), ('pisteur','dague',d), ('sage','bouclier','pisteur')]

for nom, pol, sac in [('malin (étudie, lumière, critique) + Baume', malin, ['feu','huile','baume']),
                      ('malin sans huile', malin, ['feu','fumigene','baume']),
                      ('au hasard', hasard, ['feu','huile','baume']),
                      ('tape sans réfléchir (flèche, feu, bouclier)', tape, ['feu','fumigene','baume']),
                      ('abuse de la louche', louche, ['feu','fumigene','colle'])]:
    res = [partie(pol, sac, random.Random(s)) for s in range(2000)]
    v = [t for e,t in res if e=='victoire']; f = [t for e,t in res if e=='fuite']
    print(f'{nom:48s} victoires {len(v)/20:5.1f} %  (tours moy. {sum(v)/max(1,len(v)):4.1f})   fuites auto {len(f)/20:5.1f} %  (au tour {sum(f)/max(1,len(f)):4.1f})')

