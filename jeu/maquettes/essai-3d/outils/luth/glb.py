# lire / écrire un .glb à la main (on garde tout, on ajoute des données à la fin)
import json, struct, numpy as np
CT = {5120: np.int8, 5121: np.uint8, 5122: np.int16, 5123: np.uint16, 5125: np.uint32, 5126: np.float32}
NC = {'SCALAR': 1, 'VEC2': 2, 'VEC3': 3, 'VEC4': 4, 'MAT4': 16}
class GLB:
    def __init__(s, f):
        b = open(f, 'rb').read(); n = struct.unpack('<I', b[12:16])[0]
        s.j = json.loads(b[20:20 + n]); o = 20 + n; m = struct.unpack('<I', b[o:o + 4])[0]; s.bin = bytearray(b[o + 8:o + 8 + m])
    def lire(s, ia):
        a = s.j['accessors'][ia]; bv = s.j['bufferViews'][a['bufferView']]; dt = np.dtype(CT[a['componentType']]); nc = NC[a['type']]
        off = bv.get('byteOffset', 0) + a.get('byteOffset', 0); st = bv.get('byteStride', dt.itemsize * nc)
        raw = np.frombuffer(bytes(s.bin), np.uint8, count=st * (a['count'] - 1) + dt.itemsize * nc, offset=off)
        out = np.zeros((a['count'], nc), dt)
        for k in range(nc): out[:, k] = np.ndarray((a['count'],), dt, raw.data, k * dt.itemsize, (st,))
        return out if nc > 1 else out[:, 0]
    def ajouter(s, arr, typ, ct, cible=None, minmax=False):
        arr = np.ascontiguousarray(arr.astype(CT[ct]))
        while len(s.bin) % 4: s.bin.append(0)
        off = len(s.bin); s.bin += arr.tobytes()
        bv = {'buffer': 0, 'byteOffset': off, 'byteLength': arr.nbytes}
        if cible: bv['target'] = cible
        s.j['bufferViews'].append(bv)
        a = {'bufferView': len(s.j['bufferViews']) - 1, 'componentType': ct, 'count': len(arr), 'type': typ}
        if minmax: a['min'] = arr.reshape(len(arr), -1).min(0).tolist(); a['max'] = arr.reshape(len(arr), -1).max(0).tolist()
        s.j['accessors'].append(a); return len(s.j['accessors']) - 1
    def ecrire(s, f):
        while len(s.bin) % 4: s.bin.append(0)
        s.j['buffers'][0]['byteLength'] = len(s.bin)
        js = json.dumps(s.j, separators=(',', ':')).encode()
        while len(js) % 4: js += b' '
        tot = 12 + 8 + len(js) + 8 + len(s.bin)
        open(f, 'wb').write(struct.pack('<4sII', b'glTF', 2, tot) + struct.pack('<I4s', len(js), b'JSON') + js + struct.pack('<I4s', len(s.bin), b'BIN\0') + bytes(s.bin))
