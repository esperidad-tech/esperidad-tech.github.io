// alleger.mjs <entrée.glb> <sortie.glb> [taille des textures, 512] : modèle léger pour le téléphone
// (textures WebP réduites, sommets quantifiés KHR_mesh_quantization : three.js le lit sans décodeur)
import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { dedup, prune, quantize, textureCompress, weld } from '@gltf-transform/functions';
import sharp from 'sharp';
const [ent, sor, taille] = process.argv.slice(2); const T = +(taille || 512);
const io = new NodeIO().registerExtensions(ALL_EXTENSIONS);
const doc = await io.read(ent);
await doc.transform(dedup(), weld(), quantize({ quantizePosition: 14, quantizeNormal: 10, quantizeTexcoord: 12 }), prune(),
  textureCompress({ encoder: sharp, targetFormat: 'webp', resize: [T, T], quality: 85 }));
await io.write(sor, doc); console.log('allégé', sor);
