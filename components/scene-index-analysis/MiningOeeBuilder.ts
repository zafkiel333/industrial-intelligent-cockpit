
import * as THREE from 'three';
import { Animatables, SceneType } from '../three-types';

export const isMiningOeeScene = (type: SceneType): boolean => {
  return type === 'mining-oee-analysis';
};

export const setupMiningOeeCamera = (camera: THREE.PerspectiveCamera) => {
  camera.position.set(12, 8, 12);
  camera.lookAt(0, 0, 0);
};

export const initMiningOeeScene = (
  type: SceneType, 
  group: THREE.Group, 
  animatables: Animatables, 
  disposables: { dispose: () => void }[]
) => {
  if (type !== 'mining-oee-analysis') return;

  // 1. Coal Seam Wall (Background)
  const wallGeo = new THREE.BoxGeometry(20, 4, 1);
  const wallMat = new THREE.MeshStandardMaterial({ color: 0x1c1917, roughness: 0.9 });
  disposables.push(wallGeo, wallMat);
  const wall = new THREE.Mesh(wallGeo, wallMat);
  wall.position.set(0, 2, -3);
  group.add(wall);

  // 2. Armored Face Conveyor (AFC) - The Track
  const afcGeo = new THREE.BoxGeometry(20, 0.5, 2);
  const afcMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.6 });
  disposables.push(afcGeo, afcMat);
  const afc = new THREE.Mesh(afcGeo, afcMat);
  afc.position.set(0, 0.25, 0);
  group.add(afc);

  // 3. Shearer (Moving Machine)
  const shearerGroup = new THREE.Group();
  group.add(shearerGroup);
  animatables.shearerGroup = shearerGroup;

  // Body
  const bodyGeo = new THREE.BoxGeometry(4, 1.5, 1.5);
  const bodyMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b }); // Safety Orange
  disposables.push(bodyGeo, bodyMat);
  const body = new THREE.Mesh(bodyGeo, bodyMat);
  body.position.y = 1.5;
  shearerGroup.add(body);

  // Cutting Drums (Arms + Drums)
  animatables.shearerDrums = [];
  const drumGeo = new THREE.CylinderGeometry(0.8, 0.8, 1.5, 16);
  drumGeo.rotateX(Math.PI / 2);
  const drumMat = new THREE.MeshStandardMaterial({ color: 0x78716c, roughness: 0.5, metalness: 0.8 });
  disposables.push(drumGeo, drumMat);
  const armGeo = new THREE.BoxGeometry(2, 0.5, 0.5);
  disposables.push(armGeo);

  // Left Drum
  const leftArmGroup = new THREE.Group();
  leftArmGroup.position.set(-2, 1.5, -0.5);
  shearerGroup.add(leftArmGroup);
  const lArm = new THREE.Mesh(armGeo, bodyMat);
  lArm.position.x = -1;
  lArm.rotation.z = 0.5;
  leftArmGroup.add(lArm);
  const lDrum = new THREE.Mesh(drumGeo, drumMat);
  lDrum.position.set(-2, 1, 0); // End of arm
  leftArmGroup.add(lDrum);
  animatables.shearerDrums.push(lDrum);

  // Right Drum
  const rightArmGroup = new THREE.Group();
  rightArmGroup.position.set(2, 1.5, -0.5);
  shearerGroup.add(rightArmGroup);
  const rArm = new THREE.Mesh(armGeo, bodyMat);
  rArm.position.x = 1;
  rArm.rotation.z = -0.5;
  rightArmGroup.add(rArm);
  const rDrum = new THREE.Mesh(drumGeo, drumMat);
  rDrum.position.set(2, 1, 0);
  rightArmGroup.add(rDrum);
  animatables.shearerDrums.push(rDrum);

  // 4. Hydraulic Supports (Roof Shields)
  animatables.hydraulicSupports = [];
  const supportGeo = new THREE.BoxGeometry(1.5, 0.2, 4); // Canopy
  const legGeo = new THREE.CylinderGeometry(0.3, 0.3, 3); // Leg
  const baseGeo = new THREE.BoxGeometry(1.5, 0.2, 3); // Base
  const supportMat = new THREE.MeshStandardMaterial({ color: 0xe5e7eb });
  disposables.push(supportGeo, legGeo, baseGeo, supportMat);

  for(let i=0; i<10; i++) {
      const x = -9 + i * 2;
      const sGroup = new THREE.Group();
      sGroup.position.set(x, 0, 2);
      
      const base = new THREE.Mesh(baseGeo, supportMat);
      base.position.y = 0.1;
      sGroup.add(base);

      const leg = new THREE.Mesh(legGeo, supportMat);
      leg.position.y = 1.5;
      sGroup.add(leg);

      const canopy = new THREE.Mesh(supportGeo, supportMat);
      canopy.position.set(0, 3, -1); // Overhang towards face
      canopy.rotation.x = 0.1;
      sGroup.add(canopy);

      group.add(sGroup);
      animatables.hydraulicSupports.push(sGroup);
  }

  // 5. Coal Particles (Production)
  const pCount = 500;
  const pGeo = new THREE.BufferGeometry();
  const pPos = new Float32Array(pCount * 3);
  for(let i=0; i<pCount; i++) {
      pPos[i*3] = (Math.random() - 0.5) * 18; // Along conveyor
      pPos[i*3+1] = 0.6 + Math.random() * 0.5; // On belt
      pPos[i*3+2] = 0 + (Math.random() - 0.5) * 1;
  }
  pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
  const pMat = new THREE.PointsMaterial({ color: 0x000000, size: 0.15 });
  disposables.push(pGeo, pMat);
  const particles = new THREE.Points(pGeo, pMat);
  group.add(particles);
  animatables.coalParticles = particles;
};

export const animateMiningOeeScene = (type: SceneType, animatables: Animatables, time: number) => {
  if (type !== 'mining-oee-analysis') return;

  // Shearer Movement (Performance)
  // Retrieve speed from userData or derived from time? For simplicity, we use time directly here but simulate variable speed.
  const speed = 2.0; // Base speed
  const range = 8;
  if (animatables.shearerGroup) {
      animatables.shearerGroup.position.x = Math.sin(time * 0.5) * range;
  }

  // Drum Rotation
  if (animatables.shearerDrums) {
      animatables.shearerDrums.forEach(drum => {
          drum.rotation.x -= 0.5; // Spin fast
      });
  }

  // Hydraulic Supports "Breathing" (Advance sequence simulation)
  if (animatables.hydraulicSupports) {
      animatables.hydraulicSupports.forEach((sup, i) => {
          // Wave effect based on shearer position (simulated by time)
          const wave = Math.sin(time * 2 + i * 0.5);
          if (wave > 0.8) {
              sup.position.z = 2 - (wave - 0.8); // Slight move forward
          } else {
              sup.position.z = 2;
          }
      });
  }

  // Coal Flow
  if (animatables.coalParticles) {
      const positions = animatables.coalParticles.geometry.attributes.position.array as Float32Array;
      for(let i=0; i<positions.length/3; i++) {
          positions[i*3] += 0.1; // Move right
          if (positions[i*3] > 10) {
              positions[i*3] = -10; // Loop
          }
      }
      animatables.coalParticles.geometry.attributes.position.needsUpdate = true;
  }
};
