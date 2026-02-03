
import * as THREE from 'three';
import { Animatables, SceneType } from '../three-types';

export const isIrrigationScene = (type: SceneType): boolean => {
  return type === 'irrigation-network';
};

export const setupIrrigationCamera = (camera: THREE.PerspectiveCamera) => {
  camera.position.set(0, 15, 15);
  camera.lookAt(0, 0, 0);
};

export const initIrrigationScene = (
  type: SceneType, 
  group: THREE.Group, 
  animatables: Animatables, 
  disposables: { dispose: () => void }[]
) => {
  if (type !== 'irrigation-network') return;

  // 1. Terrain Base (Agricultural Grid)
  const groundGeo = new THREE.PlaneGeometry(40, 40, 32, 32);
  groundGeo.rotateX(-Math.PI / 2);
  
  // Create a grid texture procedurally or use wireframe
  const groundMat = new THREE.MeshStandardMaterial({ 
      color: 0x064e3b, // Dark Green
      wireframe: false,
      roughness: 0.9
  });
  disposables.push(groundGeo, groundMat);
  const ground = new THREE.Mesh(groundGeo, groundMat);
  ground.position.y = -0.5;
  group.add(ground);

  const gridHelper = new THREE.GridHelper(40, 20, 0x065f46, 0x065f46);
  gridHelper.position.y = -0.49;
  group.add(gridHelper);

  // 2. Canal System (Blue Channels)
  const canalGroup = new THREE.Group();
  const waterMat = new THREE.MeshBasicMaterial({ color: 0x0ea5e9, transparent: true, opacity: 0.8 });
  disposables.push(waterMat);

  // Main Canal
  const mainCanalGeo = new THREE.BoxGeometry(40, 0.2, 3);
  disposables.push(mainCanalGeo);
  const mainCanal = new THREE.Mesh(mainCanalGeo, waterMat);
  mainCanal.position.set(0, -0.4, 0);
  canalGroup.add(mainCanal);

  // Branch Canals
  const branchGeo = new THREE.BoxGeometry(1.5, 0.2, 15);
  disposables.push(branchGeo);
  
  [-12, -6, 0, 6, 12].forEach(x => {
      const branch1 = new THREE.Mesh(branchGeo, waterMat);
      branch1.position.set(x * 1.5, -0.4, 9);
      canalGroup.add(branch1);
      
      const branch2 = new THREE.Mesh(branchGeo, waterMat);
      branch2.position.set(x * 1.5, -0.4, -9);
      canalGroup.add(branch2);
  });
  group.add(canalGroup);

  // 3. Flow Particles
  const pCount = 400;
  const pGeo = new THREE.BufferGeometry();
  const pPos = new Float32Array(pCount * 3);
  const pVel = new Float32Array(pCount * 3); // Store direction
  
  for(let i=0; i<pCount; i++) {
      // Initialize in main canal
      pPos[i*3] = (Math.random() - 0.5) * 40; // x
      pPos[i*3+1] = -0.3; // y
      pPos[i*3+2] = (Math.random() - 0.5) * 2.5; // z
      
      // Some particles divert to branches
      if (Math.random() > 0.7) {
          // Snap to branch x lines (simplified logic)
          const branchX = Math.floor((Math.random() - 0.5) * 5) * 9; // Roughly aligned
          pPos[i*3] = branchX; 
          pPos[i*3+2] = (Math.random() > 0.5 ? 1 : -1) * (1.5 + Math.random() * 6);
          // Set vel z
          pVel[i*3] = 0;
          pVel[i*3+1] = 0;
          pVel[i*3+2] = (pPos[i*3+2] > 0 ? 1 : -1) * 0.15;
      } else {
          // Main flow
          pVel[i*3] = 0.2;
          pVel[i*3+1] = 0;
          pVel[i*3+2] = 0;
      }
  }
  pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
  // Hack: Store velocity in normal attribute for convenience in animation loop or just re-calc
  pGeo.setAttribute('velocity', new THREE.BufferAttribute(pVel, 3));

  const pMat = new THREE.PointsMaterial({ color: 0xa5f3fc, size: 0.2 });
  disposables.push(pGeo, pMat);
  const flow = new THREE.Points(pGeo, pMat);
  group.add(flow);
  animatables.canalFlow = flow;

  // 4. Crop Fields & Sprinklers
  animatables.cropFields = [];
  animatables.sprinklers = [];
  
  const fieldColors = [0x10b981, 0xf59e0b, 0x84cc16]; // Green, Wheat, Lime
  
  for(let x = -2; x <= 2; x++) {
      for(let z = -1; z <= 1; z++) {
          if (z === 0) continue; // Skip main canal
          
          // Field
          const fieldSize = 5;
          const fieldGeo = new THREE.BoxGeometry(fieldSize, 0.1, fieldSize);
          const color = fieldColors[Math.floor(Math.random() * fieldColors.length)];
          const fieldMat = new THREE.MeshStandardMaterial({ color: color });
          const field = new THREE.Mesh(fieldGeo, fieldMat);
          field.position.set(x * 7, -0.45, z * 9);
          group.add(field);
          animatables.cropFields.push(field);
          disposables.push(fieldGeo, fieldMat);

          // Center Pivot Sprinkler
          const sprinklerGroup = new THREE.Group();
          sprinklerGroup.position.set(x * 7, -0.3, z * 9);
          
          const pivotGeo = new THREE.CylinderGeometry(0.2, 0.2, 0.8);
          const pivotMat = new THREE.MeshBasicMaterial({ color: 0x94a3b8 });
          const pivot = new THREE.Mesh(pivotGeo, pivotMat);
          sprinklerGroup.add(pivot);
          disposables.push(pivotGeo, pivotMat);

          const armGeo = new THREE.BoxGeometry(fieldSize - 0.5, 0.1, 0.1);
          armGeo.translate((fieldSize - 0.5)/2, 0.4, 0);
          const armMat = new THREE.MeshBasicMaterial({ color: 0xcbd5e1 });
          const arm = new THREE.Mesh(armGeo, armMat);
          sprinklerGroup.add(arm);
          disposables.push(armGeo, armMat);

          // Water Spray Particles (Static visual for now)
          const sprayGeo = new THREE.BufferGeometry();
          const sprayPos = new Float32Array(60);
          for(let k=0; k<20; k++) {
              sprayPos[k*3] = (k/20) * (fieldSize - 1) + 0.5;
              sprayPos[k*3+1] = 0.2;
              sprayPos[k*3+2] = 0;
          }
          sprayGeo.setAttribute('position', new THREE.BufferAttribute(sprayPos, 3));
          const sprayMat = new THREE.PointsMaterial({ color: 0xbfdbfe, size: 0.15, transparent: true, opacity: 0.6 });
          const spray = new THREE.Points(sprayGeo, sprayMat);
          arm.add(spray);
          disposables.push(sprayGeo, sprayMat);

          group.add(sprinklerGroup);
          animatables.sprinklers.push(sprinklerGroup);
      }
  }
};

export const animateIrrigationScene = (type: SceneType, animatables: Animatables, time: number) => {
  if (type !== 'irrigation-network') return;

  // Animate Sprinklers
  if (animatables.sprinklers) {
      animatables.sprinklers.forEach((sp, i) => {
          // Different speeds
          sp.rotation.y = -time * (0.2 + (i % 3) * 0.1);
      });
  }

  // Animate Flow
  if (animatables.canalFlow) {
      const positions = animatables.canalFlow.geometry.attributes.position.array as Float32Array;
      const velocities = animatables.canalFlow.geometry.attributes.velocity.array as Float32Array;
      
      for(let i=0; i<positions.length; i+=3) {
          positions[i] += velocities[i];
          positions[i+2] += velocities[i+2];

          // Reset Logic
          if (Math.abs(positions[i]) > 20 || Math.abs(positions[i+2]) > 18) {
              // Reset to center or start
              if (velocities[i] !== 0) { // Main flow
                  positions[i] = -20;
                  positions[i+2] = (Math.random() - 0.5) * 2.5;
              } else { // Branch flow
                  // Reset to junction
                  positions[i+2] = 0; 
              }
          }
      }
      animatables.canalFlow.geometry.attributes.position.needsUpdate = true;
  }
};
