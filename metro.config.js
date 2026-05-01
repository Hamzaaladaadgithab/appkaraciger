// metro.config.js
// Metro bundler'a .glb ve diğer 3D model formatlarını asset olarak tanıtır.
// Bu olmadan require('...glb') çağrısı "Cannot find module" hatası verir.

const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Mevcut asset uzantılarına 3D model formatlarını ekle
config.resolver.assetExts.push(
  'glb',   // GLB — Binary GL Transmission Format (kullandığımız format)
  'gltf',  // GLTF — JSON GL Transmission Format
  'mtl',   // MTL — Material Template Library (.obj ile kullanılır)
  'obj',   // OBJ — Wavefront 3D model
  'fbx',   // FBX — Autodesk format
);

module.exports = config;
