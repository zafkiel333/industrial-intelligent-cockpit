
import * as THREE from 'three';
import { ToothAnimatables, ToothState } from './three-types';

export const initToothScene = (
  group: THREE.Group, 
  animatables: ToothAnimatables,
  disposables: { dispose: () => void }[]
) => {
  // --- Materials ---
  const bucketMat = new THREE.MeshStandardMaterial({ 
    color: 0x332010, // Rusty dark brown
    roughness: 0.9, 
    metalness: 0.2,
    flatShading: true
  });
  const steelMat = new THREE.MeshStandardMaterial({ 
    color: 0x555555, roughness: 0.5, metalness: 0.8 
  });
  const toothMat = new THREE.MeshStandardMaterial({ 
    color: 0xc0c0c0, roughness: 0.7, metalness: 0.6 
  }); // Shiny tips
  const laserMat = new THREE.MeshBasicMaterial({ 
    color: 0x0ea5e9, transparent: true, opacity: 0.3, side: THREE.DoubleSide 
  });
  const dustMat = new THREE.PointsMaterial({ 
    color: 0x8b7e66, size: 0.15, transparent: true, opacity: 0.5 
  });
  
  const missingMat = new THREE.MeshBasicMaterial({ color: 0xff0000, wireframe: true, transparent: true, opacity: 0.5 });

  disposables.push(bucketMat, steelMat, toothMat, laserMat, dustMat, missingMat);

  // 1. The Bucket (Dipper)
  const bucketGroup = new THREE.Group();
  group.add(bucketGroup);
  animatables.bucketGroup = bucketGroup;

  // Main Body
  const shellGeo = new THREE.BoxGeometry(6, 4, 4);
  // Deform to look like a scoop
  const pos = shellGeo.attributes.position;
  for(let i=0; i<pos.count; i++) {
      const y = pos.getY(i);
      const z = pos.getZ(i);
      if (z > 0 && y > 0) pos.setZ(i, z + 1); // Extend top lip
      if (z > 0 && y < 0) pos.setZ(i, z + 2); // Extend bottom lip
  }
  shellGeo.computeVertexNormals();
  disposables.push(shellGeo);
  
  const shell = new THREE.Mesh(shellGeo, bucketMat);
  bucketGroup.add(shell);

  // Hinge / Connector
  const hingeGeo = new THREE.CylinderGeometry(1, 1, 5, 16);
  hingeGeo.rotateZ(Math.PI/2);
  disposables.push(hingeGeo);
  const hinge = new THREE.Mesh(hingeGeo, steelMat);
  hinge.position.set(0, 2, -2);
  bucketGroup.add(hinge);

  // 2. The Teeth (Key Elements)
  animatables.teeth = [];
  const toothGeo = new THREE.ConeGeometry(0.4, 1.5, 4);
  toothGeo.rotateX(Math.PI/2); // Point forward
  toothGeo.rotateZ(Math.PI/4); // Diamond shape
  disposables.push(toothGeo);

  const toothCount = 6;
  const startX = -2.5;
  const gap = 1.0;

  for(let i=0; i<toothCount; i++) {
      const tooth = new THREE.Mesh(toothGeo, toothMat.clone());
      tooth.position.set(startX + i * gap, -1.8, 3); // Bottom lip edge
      // Slight randomness to look used
      tooth.rotation.x += (Math.random()-0.5)*0.1;
      
      // Store original material for reset
      tooth.userData = { originalMat: toothMat, missingMat: missingMat, index: i };
      
      bucketGroup.add(tooth);
      animatables.teeth.push(tooth);
  }

  // 3. Laser Scanner Plane
  const scanGeo = new THREE.PlaneGeometry(8, 6);
  disposables.push(scanGeo);
  const scanner = new THREE.Mesh(scanGeo, laserMat);
  scanner.visible = false;
  group.add(scanner);
  animatables.scanLaser = scanner;

  // 4. Dust Particles
  const pCount = 200;
  const pGeo = new THREE.BufferGeometry();
  const pPos = new Float32Array(pCount * 3);
  for(let i=0; i<pCount; i++) {
      pPos[i*3] = (Math.random()-0.5) * 8;
      pPos[i*3+1] = (Math.random()-0.5) * 6;
      pPos[i*3+2] = (Math.random()-0.5) * 6;
  }
  pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
  const particles = new THREE.Points(pGeo, dustMat);
  group.add(particles);
  animatables.particles = particles;

  // Floor Grid
  const grid = new THREE.GridHelper(20, 20, 0x334155, 0x0f172a);
  grid.position.y = -4;
  group.add(grid);
};

export const animateToothScene = (
  animatables: ToothAnimatables, 
  state: ToothState,
  time: number
) => {
  // 1. Bucket Idle Movement
  if (animatables.bucketGroup) {
      animatables.bucketGroup.rotation.y = Math.sin(time * 0.2) * 0.1;
      animatables.bucketGroup.rotation.x = Math.cos(time * 0.15) * 0.05;
  }

  // 2. Scanning Effect
  if (animatables.scanLaser) {
      if (state === 'SCANNING' || state === 'ANALYZING') {
          animatables.scanLaser.visible = true;
          animatables.scanLaser.position.z = Math.sin(time * 3) * 3 + 2; // Sweep back and forth
          (animatables.scanLaser.material as THREE.MeshBasicMaterial).opacity = 0.2 + Math.abs(Math.sin(time*5))*0.2;
      } else {
          animatables.scanLaser.visible = false;
      }
  }

  // 3. Tooth Status Logic
  if (animatables.teeth) {
      // Assuming tooth #2 (index 1) is the faulty one for simulation
      const targetIndex = 1; 
      
      animatables.teeth.forEach((t, i) => {
          if (state === 'MISSING_ALARM' && i === targetIndex) {
              // Blink or wireframe
              if (Math.floor(time * 4) % 2 === 0) {
                  t.material = t.userData.missingMat;
              } else {
                  t.visible = false;
              }
          } else if (state === 'WEAR_WARNING' && i === 4) {
              // Show yellow/worn
              (t.material as THREE.MeshStandardMaterial).color.setHex(0xfacc15);
          } else {
              // Reset
              t.visible = true;
              t.material = t.userData.originalMat;
              (t.material as THREE.MeshStandardMaterial).color.setHex(0xc0c0c0);
          }
      });
  }

  // 4. Particles
  if (animatables.particles) {
      animatables.particles.rotation.y = time * 0.05;
      const pos = animatables.particles.geometry.attributes.position.array as Float32Array;
      for(let i=0; i<pos.length; i+=3) {
         pos[i+1] -= 0.02; // Fall
         if (pos[i+1] < -3) pos[i+1] = 3;
      }
      animatables.particles.geometry.attributes.position.needsUpdate = true;
  }
};
