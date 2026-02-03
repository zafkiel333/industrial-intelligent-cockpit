
import * as THREE from 'three';
import { ShipLockAnimatables, LockMaintenanceState } from './three-types';

export const initShipLockScene = (
  group: THREE.Group, 
  animatables: ShipLockAnimatables,
  disposables: { dispose: () => void }[]
) => {
  // --- Materials ---
  const concreteMat = new THREE.MeshStandardMaterial({ 
    color: 0x64748b, roughness: 0.9, flatShading: true 
  });
  const gateMat = new THREE.MeshStandardMaterial({ 
    color: 0x334155, roughness: 0.4, metalness: 0.6 
  }); // Dark steel
  const paintMat = new THREE.MeshStandardMaterial({ 
    color: 0xea580c, roughness: 0.6 
  }); // Warning Orange for structures
  const waterMat = new THREE.MeshPhysicalMaterial({ 
    color: 0x06b6d4, transmission: 0.8, opacity: 0.7, transparent: true, roughness: 0.1 
  });
  const hydraulicMat = new THREE.MeshStandardMaterial({ 
    color: 0xffffff, metalness: 0.9, roughness: 0.1 
  }); // Chrome

  disposables.push(concreteMat, gateMat, paintMat, waterMat, hydraulicMat);

  // 1. Lock Chamber Structure
  const wallWidth = 4;
  const wallHeight = 12;
  const chamberLen = 40;
  
  const wallLGeo = new THREE.BoxGeometry(wallWidth, wallHeight, chamberLen);
  wallLGeo.translate(-10, wallHeight/2, 0);
  disposables.push(wallLGeo);
  const wallL = new THREE.Mesh(wallLGeo, concreteMat);
  group.add(wallL);

  const wallRGeo = new THREE.BoxGeometry(wallWidth, wallHeight, chamberLen);
  wallRGeo.translate(10, wallHeight/2, 0);
  disposables.push(wallRGeo);
  const wallR = new THREE.Mesh(wallRGeo, concreteMat);
  group.add(wallR);

  const floorGeo = new THREE.BoxGeometry(24, 1, chamberLen);
  floorGeo.translate(0, 0.5, 0);
  disposables.push(floorGeo);
  const floor = new THREE.Mesh(floorGeo, concreteMat);
  group.add(floor);

  // 2. Miter Gates (Upstream - we focus on one head)
  // Gates hinge at x = +/- 8, z = -15
  const gateW = 9;
  const gateH = 10;
  const gateThick = 1;
  const gateGeo = new THREE.BoxGeometry(gateW, gateH, gateThick);
  // Shift pivot to edge
  gateGeo.translate(gateW/2, gateH/2, 0);
  disposables.push(gateGeo);

  // Left Gate
  const leftGateGroup = new THREE.Group();
  leftGateGroup.position.set(-8, 1, -10);
  const leftGateMesh = new THREE.Mesh(gateGeo, gateMat);
  leftGateGroup.add(leftGateMesh);
  
  // Walkway on gate
  const walkGeo = new THREE.BoxGeometry(gateW, 0.2, 1.5);
  walkGeo.translate(gateW/2, 0.1, 0);
  const walkMesh = new THREE.Mesh(walkGeo, paintMat);
  walkMesh.position.y = gateH;
  leftGateGroup.add(walkMesh);

  group.add(leftGateGroup);
  animatables.leftGate = leftGateGroup;

  // Right Gate
  const rightGateGroup = new THREE.Group();
  rightGateGroup.position.set(8, 1, -10);
  // Mirror logic: Rotate Y 180 to face correctly, then pivot logic applies
  rightGateGroup.rotation.y = Math.PI; 
  const rightGateMesh = new THREE.Mesh(gateGeo, gateMat);
  rightGateGroup.add(rightGateMesh);
  
  const walkMeshR = new THREE.Mesh(walkGeo, paintMat);
  walkMeshR.position.y = gateH;
  rightGateGroup.add(walkMeshR);

  group.add(rightGateGroup);
  animatables.rightGate = rightGateGroup;

  // 3. Hydraulic Cylinders
  const cylBodyGeo = new THREE.CylinderGeometry(0.4, 0.4, 4);
  cylBodyGeo.rotateZ(Math.PI/2);
  const cylRodGeo = new THREE.CylinderGeometry(0.2, 0.2, 4);
  cylRodGeo.rotateZ(Math.PI/2);
  cylRodGeo.translate(2, 0, 0); // Pivot at end
  disposables.push(cylBodyGeo, cylRodGeo);

  // Left Cylinder
  const lCylGroup = new THREE.Group();
  lCylGroup.position.set(-10, 8, -6); // Mounted on wall
  lCylGroup.rotation.y = -Math.PI/4;
  const lBody = new THREE.Mesh(cylBodyGeo, paintMat);
  const lRod = new THREE.Mesh(cylRodGeo, hydraulicMat);
  lCylGroup.add(lBody);
  lCylGroup.add(lRod);
  group.add(lCylGroup);
  animatables.leftCylinder = lRod;

  // Right Cylinder
  const rCylGroup = new THREE.Group();
  rCylGroup.position.set(10, 8, -6); // Mounted on wall
  rCylGroup.rotation.y = -Math.PI * 0.75;
  const rBody = new THREE.Mesh(cylBodyGeo, paintMat);
  const rRod = new THREE.Mesh(cylRodGeo, hydraulicMat);
  rCylGroup.add(rBody);
  rCylGroup.add(rRod);
  group.add(rCylGroup);
  animatables.rightCylinder = rRod;

  // 4. Water
  const waterGeo = new THREE.BoxGeometry(16, 1, 38);
  waterGeo.translate(0, 0.5, 0);
  disposables.push(waterGeo);
  const water = new THREE.Mesh(waterGeo, waterMat);
  water.position.y = 1; // Initial level
  group.add(water);
  animatables.waterChamber = water;

  // 5. Leak Effect (Particle System)
  const leakGeo = new THREE.BufferGeometry();
  const leakPos = new Float32Array(300);
  leakGeo.setAttribute('position', new THREE.BufferAttribute(leakPos, 3));
  const leakMat = new THREE.PointsMaterial({ color: 0xeeeeee, size: 0.2, transparent: true, opacity: 0 });
  const leak = new THREE.Points(leakGeo, leakMat);
  // Position near left cylinder
  leak.position.set(-9, 8, -7); 
  group.add(leak);
  animatables.leakSpray = leak;

  // 6. Alarm Light
  const light = new THREE.PointLight(0xff0000, 0, 20);
  light.position.set(-10, 14, -10);
  group.add(light);
  animatables.statusLight = light;
};

export const animateShipLockScene = (
  animatables: ShipLockAnimatables, 
  state: LockMaintenanceState,
  time: number
) => {
  // Gate Animation Logic
  // Miter gate angle: Closed ~ -0.2 rad (V shape), Open ~ -1.5 rad
  
  let targetAngleL = -0.35; // Closed (forming V)
  let targetAngleR = -0.35; // Closed (local coord is mirrored)
  let waterLevel = 1;
  let leakIntensity = 0;

  if (state === 'MONITORING') {
      // Periodic opening/closing simulation
      const cycle = (time * 0.2) % 10;
      if (cycle < 5) { // Open
          targetAngleL = -1.2;
          targetAngleR = -1.2;
          waterLevel = 1 + cycle/5 * 6; // Fill
      } else { // Close
          targetAngleL = -0.35;
          targetAngleR = -0.35;
          waterLevel = 7 - (cycle-5)/5 * 6; // Empty
      }
  } else if (state === 'FAULT_SYNC') {
      // Async failure: Left opens, Right stuck
      targetAngleL = -1.0; 
      targetAngleR = -0.35; // Stuck
      if (animatables.statusLight) animatables.statusLight.intensity = Math.sin(time*10) > 0 ? 5 : 0;
      leakIntensity = 0.5; // Minor leak visual
  } else if (state === 'ISOLATION' || state === 'DIAGNOSIS') {
      // Gates frozen in fault position
      targetAngleL = -0.8;
      targetAngleR = -0.4;
      waterLevel = 1; // Drained for maintenance
      if (animatables.statusLight) animatables.statusLight.intensity = 2; // Steady warning
      leakIntensity = state === 'DIAGNOSIS' ? 0.2 : 0;
  } else if (state === 'REPAIR_VALVE') {
      targetAngleL = -0.8;
      targetAngleR = -0.4;
      waterLevel = 0.5; // Fully drained
  } else if (state === 'DEBUGGING') {
      // Test movement: Wiggle
      targetAngleL = -0.35 + Math.sin(time) * 0.2;
      targetAngleR = -0.35 + Math.sin(time) * 0.2;
      waterLevel = 1;
  } else if (state === 'RESTORED') {
      targetAngleL = -0.35;
      targetAngleR = -0.35;
      if (animatables.statusLight) animatables.statusLight.intensity = 0;
  }

  // Apply Gate Rotations (Smooth Lerp)
  if (animatables.leftGate) {
      animatables.leftGate.rotation.y = THREE.MathUtils.lerp(animatables.leftGate.rotation.y, targetAngleL, 0.05);
  }
  if (animatables.rightGate) {
      // Right gate is mirrored group, local rotation logic same relative to parent
      // But parent was rotated PI. 
      // If we want it to mirror left gate's angle relative to channel center:
      // Left: -0.35 rad (CW from x-axis?). 
      // Let's simplified visual matching:
      // If group rot Y = PI, positive rot Y goes inwards.
      animatables.rightGate.rotation.y = THREE.MathUtils.lerp(animatables.rightGate.rotation.y, -targetAngleR, 0.05);
  }

  // Cylinder Animation (Visual approximation linked to gate angle)
  if (animatables.leftCylinder && animatables.leftGate) {
      const ext = Math.abs(animatables.leftGate.rotation.y) * 2;
      animatables.leftCylinder.position.x = 2 + ext;
  }
  if (animatables.rightCylinder && animatables.rightGate) {
      const ext = Math.abs(animatables.rightGate.rotation.y) * 2;
      animatables.rightCylinder.position.x = 2 + ext;
  }

  // Water Level
  if (animatables.waterChamber) {
      animatables.waterChamber.scale.y = THREE.MathUtils.lerp(animatables.waterChamber.scale.y, Math.max(0.1, waterLevel), 0.05);
      animatables.waterChamber.position.y = animatables.waterChamber.scale.y / 2;
  }

  // Leak Particles
  if (animatables.leakSpray) {
      const mat = animatables.leakSpray.material as THREE.PointsMaterial;
      mat.opacity = leakIntensity;
      if (leakIntensity > 0) {
          const positions = animatables.leakSpray.geometry.attributes.position.array as Float32Array;
          for(let i=0; i<positions.length; i+=3) {
              positions[i] += (Math.random()-0.5)*0.2; // Spray X
              positions[i+1] -= 0.2; // Fall Y
              positions[i+2] += (Math.random()-0.5)*0.2; // Spray Z
              
              if (positions[i+1] < -8) {
                  positions[i] = 0;
                  positions[i+1] = 0;
                  positions[i+2] = 0;
              }
          }
          animatables.leakSpray.geometry.attributes.position.needsUpdate = true;
      }
  }
};
