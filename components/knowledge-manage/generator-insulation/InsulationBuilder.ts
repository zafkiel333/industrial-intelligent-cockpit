
import * as THREE from 'three';
import { InsulationAnimatables, InsulationAgingState } from './three-types';

export const initInsulationScene = (
  group: THREE.Group, 
  animatables: InsulationAnimatables,
  disposables: { dispose: () => void }[]
) => {
  // --- Materials ---
  const copperMat = new THREE.MeshStandardMaterial({ 
    color: 0xb45309, roughness: 0.3, metalness: 0.8 
  });
  const micaMat = new THREE.MeshPhysicalMaterial({ 
    color: 0xa5f3fc, 
    transmission: 0.6, 
    opacity: 0.4, 
    transparent: true, 
    roughness: 0.2, 
    ior: 1.5,
    thickness: 1.0
  });
  const semiConMat = new THREE.MeshStandardMaterial({ 
    color: 0x111111, roughness: 0.9 
  });
  const sparkMat = new THREE.PointsMaterial({ 
    color: 0x8b5cf6, size: 0.2, transparent: true, blending: THREE.AdditiveBlending 
  });
  const treeMat = new THREE.LineBasicMaterial({ 
    color: 0xffffff, transparent: true, opacity: 0.8 
  });

  disposables.push(copperMat, micaMat, semiConMat, sparkMat, treeMat);

  // 1. Copper Strands (Roebel Bar representation)
  // Create a block of strands
  const strandGroup = new THREE.Group();
  const strandGeo = new THREE.BoxGeometry(0.8, 0.4, 12);
  disposables.push(strandGeo);

  for(let y=0; y<4; y++) {
      for(let x=0; x<2; x++) {
          const strand = new THREE.Mesh(strandGeo, copperMat);
          strand.position.set((x-0.5)*0.9, (y-1.5)*0.5, 0);
          // Twist effect simulation (visual only)
          strand.rotation.z = (Math.random()-0.5)*0.05;
          strandGroup.add(strand);
      }
  }
  group.add(strandGroup);
  animatables.copperStrands = strandGroup;

  // 2. Inner Semi-Conductive Shield
  const innerGeo = new THREE.BoxGeometry(2.0, 2.5, 12.1);
  disposables.push(innerGeo);
  const innerShield = new THREE.Mesh(innerGeo, semiConMat);
  // Cutout using CSG is expensive, just overlay or use transparency
  // We'll scale it slightly larger than strands
  group.add(innerShield);
  animatables.semiConductive = innerShield;
  
  // Make strands visible inside (hack: scale inner shield slightly differently or rely on Z-fighting fix?)
  // Actually, let's just put the shield slightly transparent or behind for this viz
  innerShield.visible = false; // Just conceptual

  // 3. Main Insulation (Mica Tape)
  const insGeo = new THREE.BoxGeometry(3.5, 4.0, 12);
  disposables.push(insGeo);
  const insulation = new THREE.Mesh(insGeo, micaMat);
  group.add(insulation);
  animatables.insulationLayer = insulation;

  // 4. Outer Shield (Anti-Corona)
  const outerGeo = new THREE.BoxGeometry(3.55, 4.05, 8); // Shorter to show layers
  disposables.push(outerGeo);
  const outerShield = new THREE.Mesh(outerGeo, new THREE.MeshStandardMaterial({
      color: 0x333333, wireframe: true, transparent: true, opacity: 0.1
  }));
  group.add(outerShield);
  animatables.outerShield = outerShield;

  // 5. Partial Discharge Sparks (Void)
  const pCount = 50;
  const pGeo = new THREE.BufferGeometry();
  const pPos = new Float32Array(pCount * 3);
  // Randomly place inside insulation volume
  for(let i=0; i<pCount; i++) {
      pPos[i*3] = (Math.random()-0.5)*2.5;
      pPos[i*3+1] = (Math.random()-0.5)*3.0;
      pPos[i*3+2] = (Math.random()-0.5)*4.0;
  }
  pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
  const pdSystem = new THREE.Points(pGeo, sparkMat);
  pdSystem.visible = false;
  group.add(pdSystem);
  animatables.pdSparks = pdSystem;

  // 6. Electrical Treeing (Line segments)
  const treeGroup = new THREE.Group();
  // Create a fractal-like structure originating from copper
  const createBranch = (start: THREE.Vector3, dir: THREE.Vector3, depth: number) => {
      if (depth === 0) return;
      const end = start.clone().add(dir.multiplyScalar(0.5));
      // Add randomness
      end.x += (Math.random()-0.5)*0.3;
      end.y += (Math.random()-0.5)*0.3;
      end.z += (Math.random()-0.5)*0.3;

      const pts = [start, end];
      const geo = new THREE.BufferGeometry().setFromPoints(pts);
      const line = new THREE.Line(geo, treeMat);
      treeGroup.add(line);
      disposables.push(geo);

      createBranch(end, dir.clone().applyAxisAngle(new THREE.Vector3(0,1,0), 0.5), depth-1);
      createBranch(end, dir.clone().applyAxisAngle(new THREE.Vector3(0,0,1), -0.5), depth-1);
  };
  
  createBranch(new THREE.Vector3(0.5, 0.5, 0), new THREE.Vector3(0.5, 0.5, 0), 4);
  treeGroup.visible = false;
  group.add(treeGroup);
  animatables.electricalTree = treeGroup;

  // 7. Thermal Glow
  const heatLight = new THREE.PointLight(0xff4400, 0, 5);
  heatLight.position.set(0, 0, 0);
  group.add(heatLight);
  animatables.thermalHeat = heatLight;
};

export const animateInsulationScene = (
  animatables: InsulationAnimatables, 
  state: InsulationAgingState,
  time: number
) => {
  // Reset
  if (animatables.pdSparks) animatables.pdSparks.visible = false;
  if (animatables.electricalTree) animatables.electricalTree.visible = false;
  if (animatables.thermalHeat) animatables.thermalHeat.intensity = 0;
  if (animatables.insulationLayer) {
      (animatables.insulationLayer.material as THREE.MeshPhysicalMaterial).color.setHex(0xa5f3fc);
      (animatables.insulationLayer.material as THREE.MeshPhysicalMaterial).opacity = 0.4;
  }

  // Animation Logic
  if (state === 'INTERNAL_VOID') {
      if (animatables.pdSparks) {
          animatables.pdSparks.visible = true;
          const mat = animatables.pdSparks.material as THREE.PointsMaterial;
          mat.size = 0.1 + Math.random() * 0.1; // Flicker
          mat.color.setHex(0x8b5cf6); // Purple PD
          
          // Randomize positions slightly to simulate sparking
          const positions = animatables.pdSparks.geometry.attributes.position.array as Float32Array;
          for(let i=0; i<positions.length; i+=3) {
             if(Math.random() > 0.9) {
                 positions[i] += (Math.random()-0.5)*0.1;
             }
          }
          animatables.pdSparks.geometry.attributes.position.needsUpdate = true;
      }
  }
  else if (state === 'SLOT_DISCHARGE') {
      if (animatables.pdSparks) {
          animatables.pdSparks.visible = true;
          const mat = animatables.pdSparks.material as THREE.PointsMaterial;
          mat.color.setHex(0xffaa00); // Orange surface discharge
          // Confine sparks to surface
          const positions = animatables.pdSparks.geometry.attributes.position.array as Float32Array;
          for(let i=0; i<positions.length; i+=3) {
             // Push to surface X > 1.5
             if (Math.abs(positions[i]) < 1.5) positions[i] = (positions[i] > 0 ? 1 : -1) * (1.7 + Math.random()*0.1);
          }
          animatables.pdSparks.geometry.attributes.position.needsUpdate = true;
      }
  }
  else if (state === 'ELECTRICAL_TREE') {
      if (animatables.electricalTree) {
          animatables.electricalTree.visible = true;
          // Pulse the tree
          animatables.electricalTree.children.forEach((line: any) => {
              line.material.opacity = 0.5 + Math.sin(time * 10) * 0.5;
          });
      }
  }
  else if (state === 'THERMAL_DELAM') {
      if (animatables.thermalHeat) {
          animatables.thermalHeat.intensity = 2 + Math.sin(time * 2) * 1;
      }
      if (animatables.insulationLayer) {
          (animatables.insulationLayer.material as THREE.MeshPhysicalMaterial).color.setHex(0x78350f); // Darken
          (animatables.insulationLayer.material as THREE.MeshPhysicalMaterial).opacity = 0.8; // Clouding
      }
  }
};
