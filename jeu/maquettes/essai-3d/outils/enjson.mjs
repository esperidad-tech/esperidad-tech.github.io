// node enjson.mjs <in.glb> <out.json> : le même modèle en glTF « texte » (tout dedans, en base64), pour une page qui ne sert pas les .glb
import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import fs from 'fs';
const [, , ent, sor] = process.argv;
const io = new NodeIO().registerExtensions(ALL_EXTENSIONS);
const doc = await io.read(ent);
doc.getRoot().listBuffers().forEach((b, i) => b.setURI('b' + i + '.bin'));
doc.getRoot().listTextures().forEach((t, i) => t.setURI('t' + i + (t.getMimeType() === 'image/webp' ? '.webp' : t.getMimeType() === 'image/jpeg' ? '.jpg' : '.png')));
const { json, resources } = await io.writeJSON(doc);
const enData = (uri, mime) => 'data:' + mime + ';base64,' + Buffer.from(resources[uri]).toString('base64');
(json.buffers || []).forEach(b => { b.uri = enData(b.uri, 'application/octet-stream'); });
(json.images || []).forEach(im => { if (im.uri) im.uri = enData(im.uri, im.mimeType || 'image/png'); });
fs.writeFileSync(sor, JSON.stringify(json));
console.log(sor, (fs.statSync(sor).size / 1e6).toFixed(2), 'Mo');
