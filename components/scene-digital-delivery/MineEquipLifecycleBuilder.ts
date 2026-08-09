
import * as THREE from 'three';
import { Animatables, SceneType } from '../three-types';

export const isMineEquipLifecycleScene = (type: SceneType): boolean => {
  return type === 'dd-mine-equip-lifecycle';
};

export const setupMineEquipLifecycleCamera = (camera: THREE.PerspectiveCamera) => {
  camera.position.set(12, 8, 15);
  camera.lookAt(0, 2, 0);
};

export const initMineEquipLifecycleScene = (
  type: SceneType, 
  group: THREE.Group, 
  animatables: Animatables, 
  disposables: { dispose: () => void }[]
) => {
  if (type !== 'dd-mine-equip-lifecycle') return;

  const truckGroup = new THREE.Group();
  group.add(truckGroup);

  // Materials
  const yellowMat = new THREE.MeshStandardMaterial({ 
    color: 0xf59e0b, 
    roughness: 0.2, 
    metalness: 0.6 
  });
  const chassisMat = new THREE.MeshStandardMaterial({ 
    color: 0x1c1917, 
    roughness: 0.8, 
    metalness: 0.2 
  });
  const tireMat = new THREE.MeshStandardMaterial({ 
    color: 0x000000, 
    roughness: 0.9 
  });
  const engineMat = new THREE.MeshStandardMaterial({ 
    color: 0x3b82f6, 
    roughness: 0.4, 
    metalness: 0.9,
    emissive: 0x1e3a8a,
    emissiveIntensity: 0.5
  });
  const glassMat = new THREE.MeshPhysicalMaterial({ 
    color: 0x22d3ee, 
    transparent: true, 
    opacity: 0.4,
    roughness: 0.0,
    metalness: 0.9
  });
  const wireMat = new THREE.MeshBasicMaterial({ 
    color: 0xf59e0b, 
    wireframe: true, 
    transparent: true, 
    opacity: 0.1 
  });

  disposables.push(yellowMat, chassisMat, tireMat, engineMat, glassMat, wireMat);

  // 1. Chassis
  const chassisGeo = new THREE.BoxGeometry(4, 1, 8);
  disposables.push(chassisGeo);
  const chassis = new THREE.Group();
  const chassisMesh = new THREE.Mesh(chassisGeo, chassisMat);
  chassis.add(chassisMesh);
  chassis.position.y = 1.5;
  truckGroup.add(chassis);

  // 2. Dump Bed
  const bedGeo = new THREE.BoxGeometry(4.5, 2, 7);
  // Shape like a dump bed
  const bedShape = new THREE.Shape();
  bedShape.moveTo(0, 0);
  bedShape.lineTo(4.5, 0);
  bedShape.lineTo(4.5, 2);
  bedShape.lineTo(0, 2);
  // Simple block for now
  disposables.push(bedGeo);
  const bed = new THREE.Group();
  const bedMesh = new THREE.Mesh(bedGeo, yellowMat);
  const bedWire = new THREE.Mesh(bedGeo, wireMat);
  bed.add(bedMesh);
  bed.add(bedWire);
  bed.position.set(0, 3.5, 0.5);
  truckGroup.add(bed);

  // 3. Engine (Detailed Block)
  const engineGeo = new THREE.BoxGeometry(1.5, 1.5, 2);
  disposables.push(engineGeo);
  const engine = new THREE.Group();
  const engineMesh = new THREE.Mesh(engineGeo, engineMat);
  engine.add(engineMesh);
  // Add some pipes
  const pipeGeo = new THREE.TorusGeometry(0.8, 0.1, 8, 16);
  disposables.push(pipeGeo);
  const pipe = new THREE.Mesh(pipeGeo, new THREE.MeshStandardMaterial({color: 0xcccccc}));
  engine.add(pipe);
  engine.position.set(0, 2, -2.5); // Front of chassis
  truckGroup.add(engine);

  // 4. Cab
  const cabGeo = new THREE.BoxGeometry(1.5, 1.5, 1.5);
  disposables.push(cabGeo);
  const cab = new THREE.Group();
  const cabMesh = new THREE.Mesh(cabGeo, yellowMat);
  const cabWindow = new THREE.Mesh(new THREE.BoxGeometry(1.55, 0.8, 1.55), glassMat);
  cabWindow.position.y = 0.2;
  cab.add(cabMesh);
  cab.add(cabWindow);
  cab.position.set(-1.5, 3.5, -3); // Offset left
  truckGroup.add(cab);

  // 5. Wheels
  const wheels: THREE.Group[] = [];
  const wheelGeo = new THREE.CylinderGeometry(1, 1, 1, 32);
  wheelGeo.rotateZ(Math.PI / 2);
  disposables.push(wheelGeo);
  
  const wheelPos = [
    {x: -2.5, z: -3}, {x: 2.5, z: -3}, // Front
    {x: -2.5, z: 2}, {x: 2.5, z: 2},   // Rear 1
    {x: -2.5, z: 3.5}, {x: 2.5, z: 3.5} // Rear 2
  ];

  wheelPos.forEach(pos => {
    const wGroup = new THREE.Group();
    const wMesh = new THREE.Mesh(wheelGeo, tireMat);
    const rimGeo = new THREE.CylinderGeometry(0.5, 0.5, 1.05, 16);
    rimGeo.rotateZ(Math.PI / 2);
    const rim = new THREE.Mesh(rimGeo, new THREE.MeshStandardMaterial({color: 0xdddddd}));
    disposables.push(rimGeo);
    wGroup.add(wMesh);
    wGroup.add(rim);
    wGroup.position.set(pos.x, 1, pos.z);
    truckGroup.add(wGroup);
    wheels.push(wGroup);
  });

  // 6. Holographic Floor
  const grid = new THREE.GridHelper(30, 30, 0xf59e0b, 0x1c1917);
  grid.position.y = 0;
  group.add(grid);
  animatables.meldHologramGrid = grid;

  // 7. Data Stream Particles
  const pCount = 200;
  const pGeo = new THREE.BufferGeometry();
  const pPos = new Float32Array(pCount * 3);
  for(let i=0; i<pCount; i++) {
    pPos[i*3] = (Math.random()-0.5) * 10;
    pPos[i*3+1] = Math.random() * 10;
    pPos[i*3+2] = (Math.random()-0.5) * 10;
  }
  pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
  const pMat = new THREE.PointsMaterial({ color: 0x22d3ee, size: 0.1, transparent: true, opacity: 0.5 });
  disposables.push(pGeo, pMat);
  const stream = new THREE.Points(pGeo, pMat);
  group.add(stream);
  animatables.meldDataStream = stream;

  // Store parts for animation
  animatables.meldTruckParts = {
    chassis,
    bed,
    engine,
    cab,
    wheels
  };
};

export const animateMineEquipLifecycleScene = (type: SceneType, animatables: Animatables, time: number) => {
  if (type !== 'dd-mine-equip-lifecycle') return;

  // Retrieve Lifecycle Stage from userData (set by View)
  const stage = (animatables.meldHologramGrid?.parent as any)?.userData?.stage || 'OPERATION';
  
  const parts = animatables.meldTruckParts;
  if (!parts) return;

  // Animation States based on Stage
  let explodeFactor = 0;
  let rotateSpeed = 0.05;
  let wireframeMode = false;

  switch (stage) {
    case 'DESIGN':
      explodeFactor = 0.5; // Slightly exploded to show structure
      wireframeMode = true;
      rotateSpeed = 0.1;
      break;
    case 'MANUFACTURE':
      explodeFactor = 1.0; // Fully exploded
      break;
    case 'TRANSPORT':
      explodeFactor = 0; // Packed
      break;
    case 'INSTALL':
      // Assembly animation (simulate via time)
      explodeFactor = 0.5 + Math.sin(time) * 0.5; 
      break;
    case 'OPERATION':
      explodeFactor = 0; // Solid
      rotateSpeed = 0.02;
      break;
    case 'RECYCLE':
      explodeFactor = 1.5; // Disassembled
      wireframeMode = true;
      break;
  }

  // Apply Transforms
  // Chassis stays put
  
  // Bed moves Up and Back
  parts.bed.position.y = THREE.MathUtils.lerp(parts.bed.position.y, 3.5 + explodeFactor * 3, 0.1);
  parts.bed.position.z = THREE.MathUtils.lerp(parts.bed.position.z, 0.5 - explodeFactor * 2, 0.1);
  parts.bed.rotation.x = THREE.MathUtils.lerp(parts.bed.rotation.x, explodeFactor * -0.2, 0.1); // Tilt

  // Cab moves Left and Up
  parts.cab.position.x = THREE.MathUtils.lerp(parts.cab.position.x, -1.5 - explodeFactor * 2, 0.1);
  parts.cab.position.y = THREE.MathUtils.lerp(parts.cab.position.y, 3.5 + explodeFactor * 1, 0.1);

  // Engine moves Up
  parts.engine.position.y = THREE.MathUtils.lerp(parts.engine.position.y, 2 + explodeFactor * 4, 0.1);

  // Wheels move Out
  parts.wheels.forEach(w => {
     const dirX = w.position.x > 0 ? 1 : -1;
     const targetX = (Math.abs(w.position.x) > 2 ? 2.5 : -2.5) + dirX * explodeFactor * 3; // Initial x +/- 2.5
     // Correcting initial pos logic: predefined pos in init are +/- 2.5
     const initialX = w.userData.initialX || w.position.x;
     w.userData.initialX = initialX; // store if not present
     w.position.x = THREE.MathUtils.lerp(w.position.x, initialX + dirX * explodeFactor * 2, 0.1);
  });

  // Rotate entire truck group
  if (parts.chassis.parent) {
      parts.chassis.parent.rotation.y += rotateSpeed;
  }

  // Data Stream
  if (animatables.meldDataStream) {
      const positions = animatables.meldDataStream.geometry.attributes.position.array as Float32Array;
      for(let i=0; i<positions.length; i+=3) {
          positions[i+1] -= 0.1;
          if (positions[i+1] < 0) positions[i+1] = 10;
      }
      animatables.meldDataStream.geometry.attributes.position.needsUpdate = true;
  }
};
