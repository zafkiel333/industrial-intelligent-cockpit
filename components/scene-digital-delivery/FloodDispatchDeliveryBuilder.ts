
import * as THREE from 'three';
import { Animatables, SceneType } from '../three-types';

export const isFloodDispatchDeliveryScene = (type: SceneType): boolean => {
  return type === 'dd-flood-control-delivery';
};

export const setupFloodDispatchDeliveryCamera = (camera: THREE.PerspectiveCamera) => {
  camera.position.set(0, 30, 40);
  camera.lookAt(0, 0, 0);
};

export const initFloodDispatchDeliveryScene = (
  type: SceneType, 
  group: THREE.Group, 
  animatables: Animatables, 
  disposables: { dispose: () => void }[]
) => {
  if (type !== 'dd-flood-control-delivery') return;

  // 1. Digital Sand Table (Terrain)
  const size = 60;
  const segments = 64;
  const terrainGeo = new THREE.PlaneGeometry(size, size, segments, segments);
  
  const pos = terrainGeo.attributes.position;
  for(let i=0; i<pos.count; i++) {
    const x = pos.getX(i);
    const y = pos.getY(i); // Local Y is Z after rotation
    // Create a winding river valley
    const riverPath = Math.sin(y * 0.1) * 10;
    const distToRiver = Math.abs(x - riverPath);
    
    // Height map logic
    let h = 0;
    if (distToRiver < 4) {
       h = -4 + Math.pow(distToRiver, 2) * 0.2; // River bed
    } else {
       h = (distToRiver - 4) * 0.5 + Math.random() * 0.5; // Banks/Hills
       h += Math.sin(x*0.2)*2 + Math.cos(y*0.2)*2;
    }
    
    pos.setZ(i, h);
  }
  terrainGeo.computeVertexNormals();
  terrainGeo.rotateX(-Math.PI / 2);

  const terrainMat = new THREE.MeshStandardMaterial({ 
    color: 0x1e293b, 
    roughness: 1.0,
    flatShading: true,
    wireframe: false
  });
  disposables.push(terrainGeo, terrainMat);
  const terrain = new THREE.Mesh(terrainGeo, terrainMat);
  group.add(terrain);
  animatables.fcdTerrain = terrain;

  // Grid Overlay
  const gridHelper = new THREE.GridHelper(size, size/2, 0x334155, 0x0f172a);
  gridHelper.position.y = 0.1;
  group.add(gridHelper);

  // 2. Flood Water Plane
  const waterGeo = new THREE.PlaneGeometry(size, size, 32, 32);
  waterGeo.rotateX(-Math.PI / 2);
  const waterMat = new THREE.MeshBasicMaterial({ 
    color: 0x3b82f6, 
    transparent: true, 
    opacity: 0.6,
    side: THREE.DoubleSide
  });
  disposables.push(waterGeo, waterMat);
  const water = new THREE.Mesh(waterGeo, waterMat);
  water.position.y = -5; // Start low
  group.add(water);
  animatables.fcdFloodWater = water;

  // 3. Risk Zones (Cylinders indicating towns/assets)
  animatables.fcdRiskZones = [];
  const zoneGeo = new THREE.CylinderGeometry(2, 2, 8, 16, 1, true);
  zoneGeo.translate(0, 4, 0);
  const zoneMat = new THREE.MeshBasicMaterial({ 
    color: 0xef4444, 
    transparent: true, 
    opacity: 0.0, // Start hidden
    wireframe: true,
    side: THREE.DoubleSide
  });
  disposables.push(zoneGeo, zoneMat);

  const zones = [
    { x: -5, z: 5, label: 'Town A' },
    { x: 8, z: -10, label: 'Power Stn' },
    { x: 2, z: 15, label: 'Village B' }
  ];

  zones.forEach(z => {
    const zoneMesh = new THREE.Mesh(zoneGeo, zoneMat.clone());
    zoneMesh.position.set(z.x, 0, z.z); // Y will be adjusted based on terrain height logic
    group.add(zoneMesh);
    
    // Add solid base
    const baseGeo = new THREE.CircleGeometry(2, 16);
    baseGeo.rotateX(-Math.PI / 2);
    const baseMat = new THREE.MeshBasicMaterial({ color: 0xef4444, transparent: true, opacity: 0.2 });
    disposables.push(baseGeo, baseMat);
    const base = new THREE.Mesh(baseGeo, baseMat);
    zoneMesh.add(base);

    animatables.fcdRiskZones?.push(zoneMesh as unknown as THREE.Group);
  });

  // 4. Rain System
  const rainCount = 1000;
  const rainGeo = new THREE.BufferGeometry();
  const rainPos = new Float32Array(rainCount * 3);
  for(let i=0; i<rainCount; i++) {
    rainPos[i*3] = (Math.random() - 0.5) * size;
    rainPos[i*3+1] = 10 + Math.random() * 20;
    rainPos[i*3+2] = (Math.random() - 0.5) * size;
  }
  rainGeo.setAttribute('position', new THREE.BufferAttribute(rainPos, 3));
  const rainMat = new THREE.PointsMaterial({ color: 0x93c5fd, size: 0.2, transparent: true, opacity: 0.6 });
  disposables.push(rainGeo, rainMat);
  const rain = new THREE.Points(rainGeo, rainMat);
  group.add(rain);
  animatables.fcdRainSystem = rain;

  // Store data for animation
  (group as any).userData = { waterLevel: -3 }; // Target water level
};

export const animateFloodDispatchDeliveryScene = (type: SceneType, animatables: Animatables, time: number) => {
  if (type !== 'dd-flood-control-delivery') return;

  // Retrieve simulation state from userData
  // We simulate a rising flood loop here
  const cycle = (time * 0.5) % 10; // 10s cycle
  let currentLevel = -3;
  
  if (cycle < 5) {
     // Rising phase: -3 to 2
     currentLevel = -3 + (cycle / 5) * 5; 
  } else {
     // Receding phase
     currentLevel = 2 - ((cycle - 5) / 5) * 5;
  }

  // 1. Water Level
  if (animatables.fcdFloodWater) {
    animatables.fcdFloodWater.position.y = currentLevel;
  }

  // 2. Risk Zones Activation
  if (animatables.fcdRiskZones) {
    animatables.fcdRiskZones.forEach(zone => {
      // Check if water level reaches zone base (approx height logic)
      // Assume terrain height at zone is roughly 0 for simplicity, adjust later
      const threshold = 0.5; 
      const isFlooded = currentLevel > threshold;
      
      const mesh = zone as unknown as THREE.Mesh;
      const mat = mesh.material as THREE.MeshBasicMaterial;
      const base = mesh.children[0] as THREE.Mesh;
      const baseMat = base.material as THREE.MeshBasicMaterial;

      if (isFlooded) {
         mat.opacity = 0.4 + Math.sin(time * 10) * 0.2; // Flash
         mat.color.setHex(0xef4444); // Red
         baseMat.opacity = 0.5;
      } else {
         mat.opacity = 0.1;
         mat.color.setHex(0xfacc15); // Yellow warning
         baseMat.opacity = 0.1;
      }
    });
  }

  // 3. Rain Animation
  if (animatables.fcdRainSystem) {
    const positions = animatables.fcdRainSystem.geometry.attributes.position.array as Float32Array;
    for(let i=0; i<positions.length/3; i++) {
      positions[i*3+1] -= 0.5; // Fall down
      if (positions[i*3+1] < 0) {
        positions[i*3+1] = 20 + Math.random() * 5;
      }
    }
    animatables.fcdRainSystem.geometry.attributes.position.needsUpdate = true;
  }
};
