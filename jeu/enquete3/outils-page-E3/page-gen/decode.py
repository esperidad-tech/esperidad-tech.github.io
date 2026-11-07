import json,sys,base64
raw=open(sys.argv[1]).read()
d,_=json.JSONDecoder().raw_decode(raw[raw.index('{'):])
def f(o):
    if isinstance(o,dict):
        for v in o.values():
            r=f(v)
            if r: return r
    elif isinstance(o,list):
        for v in o:
            r=f(v)
            if r: return r
    elif isinstance(o,str) and len(o)>5000: return o
open(sys.argv[2],'w').write(base64.b64decode(f(d)).decode('utf-8'))
