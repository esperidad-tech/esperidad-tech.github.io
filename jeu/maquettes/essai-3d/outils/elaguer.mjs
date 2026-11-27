// node elaguer.mjs <in.glb> <out.glb> : enlève les données qui ne servent plus (après la chirurgie du luth)
import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { prune, dedup } from '@gltf-transform/functions';
const [, , ent, sor] = process.argv;
const io = new NodeIO().registerExtensions(ALL_EXTENSIONS);
const doc = await io.read(ent); await doc.transform(dedup(), prune());
await io.write(sor, doc); console.log('ok', sor);
