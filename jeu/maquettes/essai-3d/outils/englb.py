# englb.py <in.glb> <out.json> : le .glb rangé tel quel en base64 dans un .json (la page Claude ne sert pas les .glb)
import sys, json, base64
json.dump({'glb': base64.b64encode(open(sys.argv[1], 'rb').read()).decode()}, open(sys.argv[2], 'w'))
