
import * as THREE from 'three';
import { GateAnimatables, GateSimState } from './three-types';

export const initGateHoistScene = (
  group: THREE.Group, 
  animatables: GateAnimatables,
  disposables: { dispose: () => void }[]
) => {
  // --- Materials ---
  const concreteMat = new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.9 });
  const steelMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.4, metalness: 0.6 });
  const paintMat = new THREE.MeshStandardMaterial({ color: 0x3b82f6, roughness: 0.6, metalness: 0.2 }); // Blue gate
  const hydraulicMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.8, roughness: 0.2 }); // Shiny rod
  const waterMat = new THREE.MeshPhysicalMaterial({ 
    color: 0x0ea5e9, transmission: 0.8, opacity: 0.8, transparent: true, roughness: 0.1 
  });
  const damageMat = new THREE.MeshBasicMaterial({ color: 0xff0000, transparent: true, opacity: 0, blending: THREE.AdditiveBlending });

  disposables.push(concreteMat, steelMat, paintMat, hydraulicMat, waterMat, damageMat);

  // 1. Dam Structure (Piers)
  const pierGeo = new THREE.BoxGeometry(4, 12, 15);
  disposables.push(pierGeo);
  const leftPier = new THREE.Mesh(pierGeo, concreteMat);
  leftPier.position.set(-6, 0, 0);
  group.add(leftPier);
  
  const rightPier = new THREE.Mesh(pierGeo, concreteMat);
  rightPier.position.set(6, 0, 0);
  group.add(rightPier);

  // Floor
  const floorGeo = new THREE.BoxGeometry(20, 1, 20);
  floorGeo.translate(0, -6.5, 0);
  disposables.push(floorGeo);
  const floor = new THREE.Mesh(floorGeo, concreteMat);
  group.add(floor);

  // 2. Radial Gate Group (Pivots at the trunnion)
  const gateGroup = new THREE.Group();
  // Pivot point is defined by where we place the group. Let's say trunnion is at (0, 0, 0) for local space simplicity
  // But globally, trunnion is usually downstream.
  gateGroup.position.set(0, 0, 2); 
  group.add(gateGroup);
  animatables.gateGroup = gateGroup;

  // The Skin Plate (Curved surface) - Modeled relative to pivot
  // Radius approx 8m.
  const radius = 8;
  const skinGeo = new THREE.CylinderGeometry(radius, radius, 10, 32, 1, true, Math.PI, Math.PI * 0.3); // Arc
  skinGeo.rotateZ(Math.PI / 2); // Rotate to horizontal cylinder
  skinGeo.translate(0, 0, 0); // Center at pivot? No, skin is far from pivot.
  // Actually simpler: Pivot is center. Skin is at -Radius distance?
  // Let's manually position vertices or just rotate/translate a segment.
  
  // Let's create the skin visually relative to group
  const arcGroup = new THREE.Group();
  // If pivot is (0,0,0), skin is to the left (upstream)
  const skinMesh = new THREE.Mesh(skinGeo, paintMat);
  skinMesh.position.set(0, 0, 0);
  skinMesh.rotation.y = -Math.PI / 2; // Face upstream
  // We need to offset it so the pivot is correct. 
  // Cylinder center is pivot. Surface is at radius.
  // We want the skin to be a section of the cylinder.
  arcGroup.add(skinMesh);
  gateGroup.add(arcGroup);

  // Arms (Struts)
  const armGeo = new THREE.BoxGeometry(radius - 0.5, 0.5, 0.5);
  armGeo.translate(-(radius - 0.5)/2, 0, 0); // Pivot at one end
  disposables.push(armGeo);
  
  const armTopL = new THREE.Mesh(armGeo, steelMat);
  armTopL.position.set(0, 1.5, -4);
  armTopL.rotation.z = 0.2;
  gateGroup.add(armTopL);

  const armBotL = new THREE.Mesh(armGeo, steelMat);
  armBotL.position.set(0, -1.5, -4);
  armBotL.rotation.z = -0.2;
  gateGroup.add(armBotL);

  const armTopR = new THREE.Mesh(armGeo, steelMat);
  armTopR.position.set(0, 1.5, 4);
  armTopR.rotation.z = 0.2;
  gateGroup.add(armTopR);

  const armBotR = new THREE.Mesh(armGeo, steelMat);
  armBotR.position.set(0, -1.5, 4);
  armBotR.rotation.z = -0.2;
  gateGroup.add(armBotR);

  // 3. Damage Indicator (On one of the arms)
  const damageGeo = new THREE.SphereGeometry(0.6, 16, 16);
  disposables.push(damageGeo);
  const damage = new THREE.Mesh(damageGeo, damageMat);
  damage.position.set(-4, 0, 0); // On the arm roughly
  armTopR.add(damage); // Add to specific arm
  animatables.damageDecal = damage;

  // 4. Hydraulic System
  const cylGeo = new THREE.CylinderGeometry(0.4, 0.4, 4, 16);
  cylGeo.rotateZ(Math.PI / 2); // Horizontal
  disposables.push(cylGeo);
  const cylinder = new THREE.Mesh(cylGeo, paintMat);
  cylinder.position.set(-4, 2, 6); // Mounted on pier
  cylinder.lookAt(-8, -2, 4); // Aim at gate
  group.add(cylinder);
  animatables.cylinderBody = cylinder;

  const rodGeo = new THREE.CylinderGeometry(0.2, 0.2, 4, 16);
  rodGeo.rotateZ(Math.PI / 2);
  rodGeo.translate(-2, 0, 0); // Pivot at end
  disposables.push(rodGeo);
  const rod = new THREE.Mesh(rodGeo, hydraulicMat);
  cylinder.add(rod); // Child of cylinder for easier aiming
  animatables.cylinderRod = rod;

  // 5. Water
  const waterGeo = new THREE.BoxGeometry(10, 8, 12);
  waterGeo.translate(-5, -2, 0); // Behind gate
  disposables.push(waterGeo);
  const water = new THREE.Mesh(waterGeo, waterMat);
  group.add(water);
  animatables.waterSurface = water;

  // 6. Welding Sparks (Particles)
  const pGeo = new THREE.BufferGeometry();
  const pCount = 50;
  const pPos = new Float32Array(pCount * 3);
  for(let i=0; i<pCount; i++) {
      pPos[i*3] = 0; pPos[i*3+1] = 0; pPos[i*3+2] = 0;
  }
  pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
  const pMat = new THREE.PointsMaterial({ color: 0xffaa00, size: 0.2, transparent: true, opacity: 0 });
  disposables.push(pGeo, pMat);
  const sparks = new THREE.Points(pGeo, pMat);
  // Attach sparks to damage location
  damage.add(sparks);
  animatables.sparks = sparks;
};

export const animateGateScene = (
  animatables: GateAnimatables, 
  state: GateSimState,
  time: number
) => {
  // Gate Movement Logic
  let targetRotation = 0;
  let waterLevel = 1; // Scale Y

  if (state === 'MONITORING') {
      targetRotation = Math.sin(time * 0.5) * 0.1; // Gentle sway
      waterLevel = 1.0;
  } else if (state === 'ALARM') {
      targetRotation = 0; // Stop
      // Pulse damage
      if (animatables.damageDecal) {
          (animatables.damageDecal.material as THREE.MeshBasicMaterial).opacity = 0.5 + Math.sin(time * 10) * 0.5;
      }
  } else if (state === 'DRAIN') {
      targetRotation = 0;
      waterLevel = 0.2; // Drained
      if (animatables.damageDecal) (animatables.damageDecal.material as THREE.MeshBasicMaterial).opacity = 0.8;
  } else if (state === 'WELDING') {
      // Sparks animation
      if (animatables.sparks) {
          if (animatables.sparks.geometry.attributes.position) {
            const positions = animatables.sparks.geometry.attributes.position.array as Float32Array;
            const material = animatables.sparks.material as THREE.PointsMaterial;
            material.opacity = 1.0;
            
            for(let i=0; i<50; i++) {
                // Reset some particles
                if (Math.random() > 0.8) {
                    positions[i*3] = 0;
                    positions[i*3+1] = 0;
                    positions[i*3+2] = 0;
                } else {
                    positions[i*3] += (Math.random()-0.5) * 0.2; // Explode out
                    positions[i*3+1] += (Math.random()-0.5) * 0.2;
                    positions[i*3+2] += (Math.random()-0.5) * 0.2;
                }
            }
            animatables.sparks.geometry.attributes.position.needsUpdate = true;
          }
      }
  } else if (state === 'TESTING') {
      targetRotation = Math.sin(time * 2) * 0.3; // Fast test cycle
      waterLevel = 0.5;
      if (animatables.sparks) (animatables.sparks.material as THREE.PointsMaterial).opacity = 0;
      if (animatables.damageDecal) (animatables.damageDecal.material as THREE.MeshBasicMaterial).opacity = 0; // Repaired
  }

  // Apply Gate Rotation
  if (animatables.gateGroup) {
      animatables.gateGroup.rotation.z = THREE.MathUtils.lerp(animatables.gateGroup.rotation.z, targetRotation, 0.05);
  }

  // Hydraulic Linkage (Visual approximation)
  if (animatables.cylinderRod && animatables.gateGroup) {
      // As gate rotates up (positive Z), rod extends (negative X locally)
      const extension = animatables.gateGroup.rotation.z * 2; 
      animatables.cylinderRod.position.x = THREE.MathUtils.lerp(animatables.cylinderRod.position.x, extension, 0.1);
  }

  // Water Level Animation
  if (animatables.waterSurface) {
      animatables.waterSurface.scale.y = THREE.MathUtils.lerp(animatables.waterSurface.scale.y, waterLevel, 0.02);
  }
};
