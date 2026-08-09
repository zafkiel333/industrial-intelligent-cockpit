import * as THREE from 'three';
import { Animatables, SceneType } from '../three-types';

export const isInlandWaterwayScene = (type: SceneType): boolean => {
  return type === 'inland-waterway';
};

export const setupInlandWaterwayCamera = (camera: THREE.PerspectiveCamera) => {
  camera.position.set(15, 20, 25);
  camera.lookAt(0, 0, 0);
};

export const initInlandWaterwayScene = (
  type: SceneType,
  group: THREE.Group,
  animatables: Animatables,
  disposables: { dispose: () => void }[]
) => {
  if (type !== 'inland-waterway') return;

  // 1. Terrain & Riverbed
  const terrainGeo = new THREE.PlaneGeometry(60, 60, 64, 64);
  terrainGeo.rotateX(-Math.PI / 2);
  
  const pos = terrainGeo.attributes.position;
  for(let i=0; i<pos.count; i++){
      const x = pos.getX(i);
      // const z = pos.getY(i); 
      let y = 0;
      // River channel in center (x: -8 to 8)
      if (Math.abs(x) > 8) {
          y = 3 + Math.random() * 0.5; // Banks
      } else {
          y = -5; // River bed
      }
      pos.setZ(i, y);
  }
  terrainGeo.computeVertexNormals();
  const terrainMat = new THREE.MeshStandardMaterial({ color: 0x3f6212, roughness: 0.9, flatShading: true });
  disposables.push(terrainGeo, terrainMat);
  const terrain = new THREE.Mesh(terrainGeo, terrainMat);
  group.add(terrain);

  // 2. Lock Structure (Concrete)
  const concreteMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.6 });
  disposables.push(concreteMat);

  // Walls
  const wallL = new THREE.Mesh(new THREE.BoxGeometry(3, 8, 25), concreteMat);
  wallL.position.set(-6.5, -1, 0);
  group.add(wallL);
  
  const wallR = new THREE.Mesh(new THREE.BoxGeometry(3, 8, 25), concreteMat);
  wallR.position.set(6.5, -1, 0);
  group.add(wallR);

  disposables.push(wallL.geometry, wallR.geometry);

  // 3. Water Surfaces
  const waterMat = new THREE.MeshStandardMaterial({ 
      color: 0x0ea5e9, transparent: true, opacity: 0.7, roughness: 0.1 
  });
  disposables.push(waterMat);

  // Upstream Water (High)
  const upWater = new THREE.Mesh(new THREE.PlaneGeometry(16, 20), waterMat);
  upWater.rotation.x = -Math.PI / 2;
  upWater.position.set(0, 1, -22.5);
  group.add(upWater);
  disposables.push(upWater.geometry);

  // Downstream Water (Low)
  const downWater = new THREE.Mesh(new THREE.PlaneGeometry(16, 20), waterMat);
  downWater.rotation.x = -Math.PI / 2;
  downWater.position.set(0, -3, 22.5);
  group.add(downWater);
  disposables.push(downWater.geometry);

  // Chamber Water (Dynamic)
  const chamberWaterGeo = new THREE.BoxGeometry(10, 1, 25);
  // Shift pivot to bottom for scaling
  chamberWaterGeo.translate(0, 0.5, 0); 
  disposables.push(chamberWaterGeo);
  const chamberWater = new THREE.Mesh(chamberWaterGeo, waterMat);
  chamberWater.position.set(0, -5, 0); // Start at bottom floor
  group.add(chamberWater);
  animatables.lockChamberWater = chamberWater;

  // 4. Miter Gates
  const gateMat = new THREE.MeshStandardMaterial({ color: 0xc2410c, metalness: 0.3 }); // Rust/Orange
  disposables.push(gateMat);
  const gateGeo = new THREE.BoxGeometry(1, 6, 6); // Half width approx 5-6
  disposables.push(gateGeo);

  // Upper Gate Group
  const ugGroup = new THREE.Group();
  ugGroup.position.set(0, 0, -12.5);
  group.add(ugGroup);
  
  // Pivots for animation
  const ugL_Pivot = new THREE.Group();
  ugL_Pivot.position.set(-5, 0, 0);
  const ugL = new THREE.Mesh(gateGeo, gateMat);
  ugL.position.set(2.5, 0, 0); // Offset from pivot
  ugL_Pivot.add(ugL);
  ugGroup.add(ugL_Pivot);

  const ugR_Pivot = new THREE.Group();
  ugR_Pivot.position.set(5, 0, 0);
  const ugR = new THREE.Mesh(gateGeo, gateMat);
  ugR.position.set(-2.5, 0, 0); // Offset
  ugR_Pivot.add(ugR);
  ugGroup.add(ugR_Pivot);
  
  animatables.lockGatesUpper = ugGroup; 
  // Store pivots in userData for animation access if needed, or structured better in types
  // For now simple access via children indices
  
  // Lower Gate Group
  const lgGroup = new THREE.Group();
  lgGroup.position.set(0, -2, 12.5); // Lower elevation
  group.add(lgGroup);

  const lgL_Pivot = new THREE.Group();
  lgL_Pivot.position.set(-5, 0, 0);
  const lgL = new THREE.Mesh(gateGeo, gateMat);
  lgL.position.set(2.5, 0, 0);
  lgL_Pivot.add(lgL);
  lgGroup.add(lgL_Pivot);

  const lgR_Pivot = new THREE.Group();
  lgR_Pivot.position.set(5, 0, 0);
  const lgR = new THREE.Mesh(gateGeo, gateMat);
  lgR.position.set(-2.5, 0, 0);
  lgR_Pivot.add(lgR);
  lgGroup.add(lgR_Pivot);

  animatables.lockGatesLower = lgGroup;

  // 5. Ships
  animatables.riverShips = [];
  const shipGeo = new THREE.BoxGeometry(3, 1.5, 8);
  const shipMat = new THREE.MeshStandardMaterial({ color: 0xfacc15 }); // Yellow cargo
  disposables.push(shipGeo, shipMat);

  // Ship 1 (Approaching Upstream)
  const ship1Group = new THREE.Group();
  const ship1 = new THREE.Mesh(shipGeo, shipMat);
  ship1Group.add(ship1);
  ship1Group.position.set(0, 1.2, -30);
  group.add(ship1Group);
  animatables.riverShips.push({ mesh: ship1Group, speed: 0.05, offset: -30, direction: 1 });

  // Ship 2 (Leaving Downstream)
  const ship2Mat = new THREE.MeshStandardMaterial({ color: 0xffffff });
  disposables.push(ship2Mat);
  const ship2Group = new THREE.Group();
  const ship2 = new THREE.Mesh(shipGeo, ship2Mat);
  ship2Group.add(ship2);
  ship2Group.position.set(0, -2.8, 30);
  group.add(ship2Group);
  animatables.riverShips.push({ mesh: ship2Group, speed: 0.08, offset: 30, direction: 1 });
};

export const animateInlandWaterwayScene = (type: SceneType, animatables: Animatables, time: number) => {
  if (type !== 'inland-waterway') return;

  // Lock Cycle Simulation: 20s cycle
  // 0-5: Fill
  // 5-8: Open Upper
  // 8-12: Wait
  // 12-15: Close Upper
  // 15-20: Empty
  const cycle = time % 20;

  if (animatables.lockChamberWater) {
      if (cycle < 5) {
          // Filling: -5 to 1 (Scale 1 to 7) height diff 6
          const progress = cycle / 5;
          animatables.lockChamberWater.scale.y = 1 + progress * 6; 
      } else if (cycle > 15) {
          // Emptying
          const progress = (cycle - 15) / 5;
          animatables.lockChamberWater.scale.y = 7 - progress * 6;
      }
  }

  // Gates Animation (Upper)
  if (animatables.lockGatesUpper) {
      const leftPivot = animatables.lockGatesUpper.children[0];
      const rightPivot = animatables.lockGatesUpper.children[1];
      
      let angle = 0;
      if (cycle > 5 && cycle < 12) {
          angle = Math.PI / 4; 
      }
      
      // Smooth transition
      const currentAngle = leftPivot.rotation.y;
      leftPivot.rotation.y = currentAngle + (angle - currentAngle) * 0.1;
      rightPivot.rotation.y = -(currentAngle + (angle - currentAngle) * 0.1);
  }

  // Gates Animation (Lower) - Inverse logic for demo visual balance
  if (animatables.lockGatesLower) {
      const leftPivot = animatables.lockGatesLower.children[0];
      const rightPivot = animatables.lockGatesLower.children[1];
      
      let angle = 0;
      if (cycle > 16 || cycle < 2) {
           angle = Math.PI / 4; 
      }
      const currentAngle = leftPivot.rotation.y;
      leftPivot.rotation.y = currentAngle + (angle - currentAngle) * 0.1;
      rightPivot.rotation.y = -(currentAngle + (angle - currentAngle) * 0.1);
  }

  // Ships Movement
  if (animatables.riverShips) {
      animatables.riverShips.forEach((ship, i) => {
          // Simple pass through animation
          if (i === 0) { // Upstream ship
             ship.mesh.position.z += 0.05;
             if (ship.mesh.position.z > 40) ship.mesh.position.z = -40;
          } else {
             ship.mesh.position.z += 0.05;
             if (ship.mesh.position.z > 40) ship.mesh.position.z = -40;
          }
      });
  }
};