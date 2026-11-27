// outils.mjs base <entrée.glb> <sortie.glb>  : textures ramenées à 1024 px en JPEG/WebP (le modèle principal)
// outils.mjs anim <entrée.glb> <sortie.glb>  : ne garde que le squelette et le mouvement (pas de maillage, pas d'image)
import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { prune, textureCompress, dedup } from '@gltf-transform/functions';
import sharp from 'sharp';
const [quoi, ent, sor] = process.argv.slice(2);
const io = new NodeIO().registerExtensions(ALL_EXTENSIONS);
const doc = await io.read(ent);
const root = doc.getRoot();
if (quoi === 'base') {
  await doc.transform(dedup(), textureCompress({ encoder: sharp, targetFormat: 'webp', resize: [1024, 1024], quality: 88 }));
} else {
  for (const n of root.listNodes()) { n.setMesh(null); n.setSkin(null); }
  for (const m of root.listMeshes()) m.dispose();
  for (const s of root.listSkins()) s.dispose();
  for (const t of root.listTextures()) t.dispose();
  for (const m of root.listMaterials()) m.dispose();
  await doc.transform(prune());
}
await io.write(sor, doc);
console.log(quoi, sor, root.listAnimations().map(a => a.getName() + ' ' + a.listChannels().length + ' pistes').join(', '));
