
import * as THREE from 'three';
import { FishPassageAnimatables, FishPassageState } from './three-types';

export const initFishPassageScene = (
  group: THREE.Group, 
  animatables: FishPassageAnimatables,
  disposables: { dispose: () => void }[]
) => {
  // --- Materials ---
  const concreteMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.9 });
  const waterMat = new THREE.MeshPhysicalMaterial({ 
    color: 0x0ea5e9, transmission: 0.9, opacity: 0.4, transparent: true, roughness: 0.1 
  });
  const bioMat = new THREE.MeshBasicMaterial({ color: 0x4ade80, transparent: true, opacity: 0.8 }); // Fluorescent green
  const streamMat = new THREE.PointsMaterial({ color: 0xa5f3fc, size: 0.1, transparent: true, opacity: 0.5 });

  disposables.push(concreteMat, waterMat, bioMat, streamMat);

  // 1. Fish Ladder Structure (Baffled Channel)
  const ladderGroup = new THREE.Group();
  const baseGeo = new THREE.BoxGeometry(20, 2, 8);
  const base = new THREE.Mesh(baseGeo, concreteMat);
  base.position.y = -1;
  ladderGroup.add(base);

  // Baffles (挡板)
  const baffleGeo = new THREE.BoxGeometry(0.5, 4, 3);
  for(let i=0; i<6; i++) {
      const b1 = new THREE.Mesh(baffleGeo, concreteMat);
      b1.position.set(-10 + i * 4, 1.5, -2.5);
      ladderGroup.add(b1);
      
      const b2 = new THREE.Mesh(baffleGeo, concreteMat);
      b2.position.set(-8 + i * 4, 1.5, 2.5);
      ladderGroup.add(b2);
  }
  group.add(ladderGroup);
  animatables.fishLadderMesh = base;

  // 2. Water Surface
  const waterGeo = new THREE.BoxGeometry(20, 3.5, 8);
  const water = new THREE.Mesh(waterGeo, waterMat);
  water.position.y = 0.75;
  group.add(water);

  // 3. Flow Particles
  const pCount = 800;
  const pGeo = new THREE.BufferGeometry();
  const pPos = new Float32Array(pCount * 3);
  for(let i=0; i<pCount; i++) {
      pPos[i*3] = (Math.random()-0.5)*20;
      pPos[i*3+1] = Math.random()*3;
      pPos[i*3+2] = (Math.random()-0.5)*8;
  }
  pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
  const flow = new THREE.Points(pGeo, streamMat);
  group.add(flow);
  animatables.waterFlow = flow;

  // 4. Fish Entities (Moving glowing shapes)
  const fishGroup = new THREE.Group();
  const fishGeo = new THREE.CapsuleGeometry(0.1, 0.4, 4, 8);
  fishGeo.rotateZ(Math.PI/2);
  disposables.push(fishGeo);
  
  for(let i=0; i<15; i++) {
      const fish = new THREE.Mesh(fishGeo, bioMat);
      fish.position.set((Math.random()-0.5)*18, Math.random()*2.5, (Math.random()-0.5)*6);
      fish.userData = { 
          speed: 0.05 + Math.random()*0.1,
          phase: Math.random() * Math.PI * 2
      };
      fishGroup.add(fish);
  }
  group.add(fishGroup);
  animatables.fishEntities = fishGroup;

  // Floor Grid
  const grid = new THREE.GridHelper(40, 20, 0x1e293b, 0x020617);
  grid.position.y = -2;
  group.add(grid);
};

export const animateFishPassage = (
  animatables: FishPassageAnimatables, 
  state: FishPassageState,
  time: number
) => {
  // 1. Water Flow Animation
  if (animatables.waterFlow && animatables.waterFlow.geometry.attributes.position) {
      const pos = animatables.waterFlow.geometry.attributes.position.array as Float32Array;
      const speed = state === 'PEAK_SEASON' ? 0.3 : 0.15;
      for(let i=0; i<pos.length; i+=3) {
          pos[i] += speed; // Flow to the right
          if (pos[i] > 10) pos[i] = -10;
          pos[i+1] += Math.sin(time*2 + pos[i])*0.01;
      }
      animatables.waterFlow.geometry.attributes.position.needsUpdate = true;
  }

  // 2. Fish Movement
  if (animatables.fishEntities) {
      animatables.fishEntities.children.forEach((fish: any) => {
          const data = fish.userData;
          // Fish swim against the current (-X)
          fish.position.x -= data.speed;
          if (fish.position.x < -10) {
              fish.position.x = 10;
              fish.position.y = Math.random()*2.5;
          }
          // Swaying
          fish.position.y += Math.sin(time * 5 + data.phase) * 0.01;
          fish.rotation.z = Math.sin(time * 5 + data.phase) * 0.2;
      });
  }
};
