
import * as THREE from 'three';
import { ComparisonAnimatables, MaintenanceStrategy } from './three-types';

export const initComparisonScene = (
  group: THREE.Group, 
  animatables: ComparisonAnimatables,
  disposables: { dispose: () => void }[]
) => {
  // --- Materials ---
  const ironMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.6, metalness: 0.4 });
  const chromeMat = new THREE.MeshStandardMaterial({ color: 0xcbd5e1, roughness: 0.1, metalness: 1.0 });
  const copperMat = new THREE.MeshStandardMaterial({ color: 0xb45309, metalness: 0.8 });
  const hologramMat = new THREE.MeshBasicMaterial({ color: 0x0ea5e9, transparent: true, opacity: 0.2, wireframe: true });
  const dangerMat = new THREE.MeshBasicMaterial({ color: 0xef4444, transparent: true, opacity: 0.5 });
  const oilMat = new THREE.PointsMaterial({ color: 0xeab308, size: 0.05, transparent: true, opacity: 0.8 });

  disposables.push(ironMat, chromeMat, copperMat, hologramMat, dangerMat, oilMat);

  // 1. Base Support Structure
  const baseGeo = new THREE.BoxGeometry(12, 1, 6);
  disposables.push(baseGeo);
  const base = new THREE.Mesh(baseGeo, ironMat);
  base.position.y = -0.5;
  group.add(base);

  // 2. Large Mining Component (e.g., Heavy Shaft System)
  const shaftGroup = new THREE.Group();
  group.add(shaftGroup);
  animatables.mainShaft = shaftGroup;

  const mainShaftGeo = new THREE.CylinderGeometry(0.8, 0.8, 10, 32);
  mainShaftGeo.rotateZ(Math.PI / 2);
  disposables.push(mainShaftGeo);
  const shaft = new THREE.Mesh(mainShaftGeo, chromeMat);
  shaftGroup.add(shaft);

  // Bearing Units (Targets for fault)
  animatables.bearingUnits = [];
  const bearingGeo = new THREE.CylinderGeometry(1.2, 1.2, 1.5, 32);
  bearingGeo.rotateZ(Math.PI / 2);
  disposables.push(bearingGeo);

  [-3, 3].forEach((x, i) => {
      const bGroup = new THREE.Group();
      const bMesh = new THREE.Mesh(bearingGeo, ironMat.clone());
      bGroup.add(bMesh);
      bGroup.position.x = x;
      shaftGroup.add(bGroup);
      animatables.bearingUnits?.push(bGroup);
  });

  // 3. Oil System (Dynamic Flow)
  const pCount = 200;
  const pGeo = new THREE.BufferGeometry();
  const pPos = new Float32Array(pCount * 3);
  for(let i=0; i<pCount; i++) {
      pPos[i*3] = (Math.random()-0.5) * 8;
      pPos[i*3+1] = 0.9;
      pPos[i*3+2] = (Math.random()-0.5) * 0.5;
  }
  pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
  const oilFlow = new THREE.Points(pGeo, oilMat);
  group.add(oilFlow);
  animatables.oilFlow = oilFlow;

  // 4. Ghost Overlay (Strategy Visualization)
  const ghostGroup = new THREE.Group();
  const ghostPart = new THREE.Mesh(bearingGeo, hologramMat);
  ghostGroup.add(ghostPart);
  ghostGroup.visible = false;
  group.add(ghostGroup);
  animatables.ghostComponent = ghostGroup;

  // 5. Stress Markers (Heatspots)
  const stressGroup = new THREE.Group();
  const spotGeo = new THREE.SphereGeometry(0.3, 16, 16);
  const spot = new THREE.Mesh(spotGeo, dangerMat);
  stressGroup.add(spot);
  stressGroup.position.set(3, 1, 0); // At the faulty bearing
  stressGroup.visible = false;
  group.add(stressGroup);
  animatables.stressMarkers = stressGroup;

  // Floor Grid
  const grid = new THREE.GridHelper(30, 20, 0x1e293b, 0x0f172a);
  grid.position.y = -1;
  group.add(grid);
};

export const animateComparisonScene = (
  animatables: ComparisonAnimatables, 
  strategy: MaintenanceStrategy,
  time: number
) => {
  // 1. Rotation logic based on strategy state
  if (animatables.mainShaft) {
    let speed = 0.05;
    if (strategy === 'DEFERRED') speed = 0.02; // Reduced speed for degraded run
    if (strategy === 'REPLACE' || strategy === 'REUPGRADE') speed = 0; // Stopped for work
    animatables.mainShaft.rotation.x += speed;
    
    // Animate vibration for degraded/faulty state
    if (strategy === 'DEFERRED' || strategy === 'PATCH') {
        animatables.mainShaft.position.y = Math.sin(time * 50) * 0.02;
    } else {
        animatables.mainShaft.position.y = THREE.MathUtils.lerp(animatables.mainShaft.position.y, 0, 0.1);
    }
  }

  // 2. Oil Flow Animation
  if (animatables.oilFlow && animatables.oilFlow.geometry.attributes.position) {
      const pos = animatables.oilFlow.geometry.attributes.position.array as Float32Array;
      const speed = (strategy === 'DEFERRED') ? 0.05 : 0.15;
      for(let i=0; i<pos.length/3; i++) {
          pos[i*3] += speed;
          if (pos[i*3] > 4) pos[i*3] = -4;
      }
      animatables.oilFlow.geometry.attributes.position.needsUpdate = true;
  }

  // 3. Strategy Visual Overlays
  if (animatables.ghostComponent) {
      if (strategy === 'REPLACE' || strategy === 'REUPGRADE') {
          animatables.ghostComponent.visible = true;
          animatables.ghostComponent.position.set(3, 2.5 + Math.sin(time * 3) * 0.5, 0); // Levitating new part
          animatables.ghostComponent.rotation.y += 0.02;
      } else {
          animatables.ghostComponent.visible = false;
      }
  }

  // 4. Stress/Fault Indicators
  if (animatables.stressMarkers) {
      animatables.stressMarkers.visible = (strategy === 'PATCH' || strategy === 'DEFERRED');
      const scale = 1 + Math.sin(time * 10) * 0.2;
      animatables.stressMarkers.scale.set(scale, scale, scale);
  }

  // 5. Material change for upgrade
  if (animatables.bearingUnits && animatables.bearingUnits.length > 1) {
      const targetBearing = animatables.bearingUnits[1].children[0] as THREE.Mesh;
      const mat = targetBearing.material as THREE.MeshStandardMaterial;
      if (strategy === 'REUPGRADE') {
          mat.color.setHex(0x0ea5e9); // Blue ceramic upgrade
          mat.emissive.setHex(0x0ea5e9);
          mat.emissiveIntensity = 0.5;
      } else if (strategy === 'DEFERRED') {
          mat.color.setHex(0xef4444); // Glowing red fault
          mat.emissive.setHex(0xef4444);
          mat.emissiveIntensity = 0.8;
      } else {
          mat.color.setHex(0x334155);
          mat.emissiveIntensity = 0;
      }
  }
};
