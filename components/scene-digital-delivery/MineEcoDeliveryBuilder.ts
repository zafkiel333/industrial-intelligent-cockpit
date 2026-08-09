
import * as THREE from 'three';
import { GeoAnimatables, SceneType } from '../three-types';

export const isMineEcoDeliveryScene = (type: SceneType): boolean => {
  return type === 'dd-mine-eco-delivery';
};

export const setupMineEcoDeliveryCamera = (camera: THREE.PerspectiveCamera) => {
  camera.position.set(0, 25, 30);
  camera.lookAt(0, 0, 0);
};

export const initMineEcoDeliveryScene = (
  type: SceneType, 
  group: THREE.Group, 
  animatables: GeoAnimatables, 
  disposables: { dispose: () => void }[]
) => {
  if (type !== 'dd-mine-eco-delivery') return;

  // 1. Terrain - The Restored Pit (Terraced)
  const size = 50;
  const segments = 64;
  const terrainGeo = new THREE.PlaneGeometry(size, size, segments, segments);
  const pos = terrainGeo.attributes.position;
  
  for(let i=0; i<pos.count; i++) {
    const x = pos.getX(i);
    const y = pos.getY(i);
    const dist = Math.sqrt(x*x + y*y);
    
    // Create terraced pit shape
    let z = 0;
    if (dist < 20) {
        // Terraces
        z = -12 + Math.floor(dist / 4) * 2; 
        // Smooth out bottom for lake
        if (dist < 8) z = -14;
    } else {
        // Surrounding hills
        z = Math.sin(x*0.2) * Math.cos(y*0.2) * 2 + Math.random()*0.5;
    }
    pos.setZ(i, z);
  }
  terrainGeo.computeVertexNormals();
  terrainGeo.rotateX(-Math.PI / 2);

  const terrainMat = new THREE.MeshStandardMaterial({ 
    color: 0x3f6212, // Deep Green
    roughness: 1.0,
    metalness: 0.0,
    flatShading: true
  });
  
  // Wireframe Overlay to show "Digital" nature
  const wireMat = new THREE.MeshBasicMaterial({
      color: 0x4ade80, // Bright Green
      wireframe: true,
      transparent: true,
      opacity: 0.1
  });

  disposables.push(terrainGeo, terrainMat, wireMat);
  const terrain = new THREE.Mesh(terrainGeo, terrainMat);
  const terrainWire = new THREE.Mesh(terrainGeo, wireMat);
  terrainWire.position.y = 0.05; // Prevent z-fighting
  
  group.add(terrain);
  group.add(terrainWire);
  animatables.medEcoTerrain = terrain;

  // 2. Pit Lake (Water Body)
  const waterGeo = new THREE.CircleGeometry(8, 32);
  waterGeo.rotateX(-Math.PI / 2);
  const waterMat = new THREE.MeshStandardMaterial({ 
    color: 0x06b6d4, 
    transparent: true, 
    opacity: 0.8,
    roughness: 0.1,
    metalness: 0.8
  });
  disposables.push(waterGeo, waterMat);
  const water = new THREE.Mesh(waterGeo, waterMat);
  water.position.y = -10;
  group.add(water);
  animatables.medWater = water;

  // 3. Vegetation (Instanced Mesh - Trees)
  const treeCount = 400;
  // Use simple cones for performance
  const treeGeo = new THREE.ConeGeometry(0.6, 2, 6);
  treeGeo.translate(0, 1, 0); // Pivot at base
  const treeMat = new THREE.MeshStandardMaterial({ color: 0x22c55e, roughness: 0.8 });
  disposables.push(treeGeo, treeMat);

  const trees = new THREE.InstancedMesh(treeGeo, treeMat, treeCount);
  const dummy = new THREE.Object3D();
  
  let instanceIdx = 0;
  for(let i=0; i<treeCount; i++) {
    // Distribute on terraces
    const angle = Math.random() * Math.PI * 2;
    const r = 9 + Math.random() * 14; // Between lake and edge
    const x = Math.cos(angle) * r;
    const z = Math.sin(angle) * r;
    
    // Determine height based on simple math matching terrain
    const h = -12 + Math.floor(r / 4) * 2;
    
    dummy.position.set(x, h, z);
    const s = 0.5 + Math.random() * 1.0;
    dummy.scale.set(s, s, s);
    dummy.rotation.y = Math.random() * Math.PI;
    dummy.updateMatrix();
    trees.setMatrixAt(instanceIdx++, dummy.matrix);
  }
  
  trees.instanceMatrix.needsUpdate = true;
  group.add(trees);
  animatables.medVegetation = trees;

  // 4. Scanning Grid (Verification)
  const gridGroup = new THREE.Group();
  const scanGeo = new THREE.PlaneGeometry(50, 50);
  scanGeo.rotateX(-Math.PI / 2);
  const scanMat = new THREE.MeshBasicMaterial({ 
      color: 0x34d399, 
      transparent: true, 
      opacity: 0.05, 
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending 
  });
  disposables.push(scanGeo, scanMat);
  const scanPlane = new THREE.Mesh(scanGeo, scanMat);
  gridGroup.add(scanPlane);
  
  // Grid Lines
  const gridHelper = new THREE.GridHelper(50, 20, 0x34d399, 0x34d399);
  (gridHelper.material as THREE.LineBasicMaterial).transparent = true;
  (gridHelper.material as THREE.LineBasicMaterial).opacity = 0.2;
  gridGroup.add(gridHelper);

  group.add(gridGroup);
  animatables.medScanGrid = gridGroup;

  // 5. Environmental Sensors
  const sensorGeo = new THREE.BoxGeometry(0.5, 2, 0.5);
  const sensorMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, emissive: 0xd97706, emissiveIntensity: 0.5 });
  disposables.push(sensorGeo, sensorMat);
  
  [
      {x: 10, z: 10, y: 0},
      {x: -12, z: 5, y: 0},
      {x: 0, z: -15, y: 0},
      {x: 8, z: -8, y: -6}, // Lower terrace
  ].forEach(pos => {
      const s = new THREE.Mesh(sensorGeo, sensorMat);
      s.position.set(pos.x, pos.y + 1, pos.z);
      group.add(s);
  });
};

export const animateMineEcoDeliveryScene = (type: SceneType, animatables: GeoAnimatables, time: number) => {
  if (type !== 'dd-mine-eco-delivery') return;

  // 1. Rotate whole model slowly
  if (animatables.medEcoTerrain) {
     const parent = animatables.medEcoTerrain.parent;
     if(parent) parent.rotation.y = Math.sin(time * 0.05) * 0.05;
  }

  // 2. Scan Grid movement (Up and Down)
  if (animatables.medScanGrid) {
      animatables.medScanGrid.position.y = Math.sin(time * 0.3) * 8;
  }
  
  // 3. Water Ripple
  if (animatables.medWater) {
      const s = 1 + Math.sin(time * 1.5) * 0.02;
      animatables.medWater.scale.set(s, 1, s);
  }
};
