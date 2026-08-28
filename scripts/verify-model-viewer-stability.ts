import * as THREE from 'three';
import {
  advanceViewerRotation,
  applyViewerMaterialAlertState,
  enhanceViewerMaterialVisibility,
  prepareViewerModel,
} from '../src/remoteModelShowcase/modelViewerTransform';

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(`MODEL_VIEWER_STABILITY_VERIFY_FAILED: ${message}`);
}

function centerOf(object: THREE.Object3D): THREE.Vector3 {
  object.updateMatrixWorld(true);
  return new THREE.Box3().setFromObject(object).getCenter(new THREE.Vector3());
}

// 模拟建模原点远离实际网格的 FBX；旧实现会在旋转后产生明显公转偏移。
const importedRoot = new THREE.Group();
importedRoot.position.set(24, -3, 11);
const offsetMesh = new THREE.Mesh(new THREE.BoxGeometry(8, 2, 4), new THREE.MeshBasicMaterial());
offsetMesh.position.set(92, 7, -36);
importedRoot.add(offsetMesh);

const prepared = prepareViewerModel(importedRoot);
assert(prepared.meshCount === 1, `expected one mesh, got ${prepared.meshCount}`);
assert(Math.abs(Math.max(prepared.size.x, prepared.size.y, prepared.size.z) - 4.8) < 1e-6, 'normalized size must fit 4.8 units');

for (const angle of [0, Math.PI / 7, Math.PI / 2, Math.PI, Math.PI * 1.75]) {
  prepared.root.rotation.y = angle;
  const center = centerOf(prepared.root);
  assert(center.length() < 1e-6, `center drifted at angle ${angle}: ${center.toArray().join(',')}`);
}

function rotateForOneSecond(fps: number): number {
  let angle = 0;
  for (let frame = 0; frame < fps; frame += 1) {
    angle = advanceViewerRotation(angle, 1_200, 1 / fps);
  }
  return angle;
}

const angleAt30Fps = rotateForOneSecond(30);
const angleAt120Fps = rotateForOneSecond(120);
assert(Math.abs(angleAt30Fps - angleAt120Fps) < 1e-10, 'rotation speed must not depend on refresh rate');

const failedDiffuseTexture = new THREE.Texture();
const failedEmissiveTexture = new THREE.Texture();
const textureDependentMaterial = new THREE.MeshPhongMaterial({ color: '#cccccc' });
textureDependentMaterial.map = failedDiffuseTexture;
textureDependentMaterial.emissiveMap = failedEmissiveTexture;
const visibilityRoot = new THREE.Group();
visibilityRoot.add(new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), textureDependentMaterial));
const visibility = enhanceViewerMaterialVisibility(visibilityRoot);
assert(visibility.texturedMaterialCount === 1, 'textured material must be detected');
assert(visibility.rescuedTextureMaterialCount === 1, 'texture-dependent material must receive a visibility floor');
assert(textureDependentMaterial.map.colorSpace === THREE.SRGBColorSpace, 'diffuse texture must use sRGB color space');
assert(textureDependentMaterial.emissiveMap === null, 'failed emissive texture must not multiply the visibility floor to black');
assert(textureDependentMaterial.emissive.getHex() !== 0x000000, 'normal state must retain a visible emissive floor');
const restoredEmissive = textureDependentMaterial.emissive.getHex();
applyViewerMaterialAlertState(textureDependentMaterial, true);
assert(textureDependentMaterial.emissive.getHex() === 0x5b1212, 'abnormal state must apply the alert color');
applyViewerMaterialAlertState(textureDependentMaterial, false);
assert(textureDependentMaterial.emissive.getHex() === restoredEmissive, 'normal state must restore the material visibility floor');

prepared.root.traverse((child) => {
  if (!(child instanceof THREE.Mesh)) return;
  child.geometry.dispose();
  if (Array.isArray(child.material)) child.material.forEach((material) => material.dispose());
  else child.material.dispose();
});
visibilityRoot.traverse((child) => {
  if (!(child instanceof THREE.Mesh)) return;
  child.geometry.dispose();
  if (Array.isArray(child.material)) child.material.forEach((material) => material.dispose());
  else child.material.dispose();
});
failedDiffuseTexture.dispose();
failedEmissiveTexture.dispose();

console.log(`MODEL_VIEWER_STABILITY_VERIFY_OK centerDrift<1e-6 rotation30=${angleAt30Fps.toFixed(6)} rotation120=${angleAt120Fps.toFixed(6)} texturedRescue=${visibility.rescuedTextureMaterialCount}`);
