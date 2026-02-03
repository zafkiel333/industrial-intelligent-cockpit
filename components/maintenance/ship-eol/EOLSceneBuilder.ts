
import * as THREE from 'three';
import { EOLAnimatables, EOLStrategy } from './three-types';

export const initEOLScene = (
  group: THREE.Group, 
  animatables: EOLAnimatables,
  disposables: { dispose: () => void }[]
) => {
  // --- Materials ---
  const ironMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.8, metalness: 0.2 });
  const rustMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 1.0, transparent: true, opacity: 0.5 });
  const steelMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.3, metalness: 0.8 });
  const glowMat = new THREE.MeshBasicMaterial({ color: 0xef4444, transparent: true, opacity: 0.4 });
  const scannerMat = new THREE.MeshBasicMaterial({ color: 0x22d3ee, transparent: true, opacity: 0.1 });

  disposables.push(ironMat, rustMat, steelMat, glowMat, scannerMat);

  // 1. Engine Main Block
  const blockGeo = new THREE.BoxGeometry(10, 6, 6);
  disposables.push(blockGeo);
  const block = new THREE.Mesh(blockGeo, ironMat);
  block.position.y = 3;
  group.add(block);
  animatables.engineBlock = group;

  // 2. Dynamic Rust Layer (Patches)
  const rustGroup = new THREE.Group();
  for(let i = 0; i < 20; i++) {
    const patch = new THREE.Mesh(new THREE.SphereGeometry(0.5, 8, 8), rustMat);
    patch.scale.set(Math.random()*2, 0.1, Math.random()*2);
    patch.position.set(
        (Math.random()-0.5)*10.1, 
        Math.random()*6, 
        (Math.random()-0.5)*6.1
    );
    rustGroup.add(patch);
  }
  block.add(rustGroup);
  animatables.rustPatches = rustGroup;

  // 3. Fatigue Hotspots (Cracks)
  const crackGroup = new THREE.Group();
  const crackGeo = new THREE.TorusGeometry(0.3, 0.02, 16, 32);
  disposables.push(crackGeo);
  const crackPositions = [
      [5.1, 4, 1], [-5.1, 2, -2], [0, 6.1, 0]
  ];
  crackPositions.forEach(p => {
      const crack = new THREE.Mesh(crackGeo, glowMat);
      crack.position.set(p[0], p[1], p[2]);
      if(p[0] !== 0) crack.rotation.y = Math.PI/2;
      else crack.rotation.x = Math.PI/2;
      crackGroup.add(crack);
  });
  block.add(crackGroup);
  animatables.fatigueCracks = crackGroup;

  // 4. Internal Crankshaft (Visible through cutaway or wireframe)
  const shaftGeo = new THREE.CylinderGeometry(0.5, 0.5, 12, 32);
  shaftGeo.rotateZ(Math.PI / 2);
  disposables.push(shaftGeo);
  const shaft = new THREE.Mesh(shaftGeo, steelMat);
  shaft.position.y = 1.5;
  group.add(shaft);
  animatables.crankshaft = shaft;

  // 5. Thermal Point Cloud
  const pCount = 500;
  const pGeo = new THREE.BufferGeometry();
  const pPos = new Float32Array(pCount * 3);
  for(let i=0; i<pCount; i++) {
      pPos[i*3] = (Math.random()-0.5)*10;
      pPos[i*3+1] = Math.random()*6;
      pPos[i*3+2] = (Math.random()-0.5)*6;
  }
  pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
  const pMat = new THREE.PointsMaterial({ color: 0xf97316, size: 0.1, transparent: true, opacity: 0.2 });
  disposables.push(pGeo, pMat);
  const thermal = new THREE.Points(pGeo, pMat);
  group.add(thermal);
  animatables.thermalCloud = thermal;

  // Floor Grid
  const grid = new THREE.GridHelper(40, 20, 0x1e293b, 0x0f172a);
  grid.position.y = 0;
  group.add(grid);
};

export const animateEOLScene = (
  animatables: EOLAnimatables, 
  strategy: EOLStrategy,
  agingFactor: number, // 0-1, 1 is end of life
  time: number
) => {
  // 1. Vibration based on aging
  if (animatables.engineBlock) {
      const vib = Math.sin(time * 20) * 0.05 * agingFactor;
      animatables.engineBlock.position.x = vib;
      animatables.engineBlock.position.y = 3 + Math.cos(time * 15) * 0.02 * agingFactor;
  }

  // 2. Rust and Crack visibility
  if (animatables.rustPatches) {
      animatables.rustPatches.visible = strategy !== 'RETROFIT';
      animatables.rustPatches.scale.setScalar(0.5 + agingFactor);
  }
  if (animatables.fatigueCracks) {
      animatables.fatigueCracks.visible = agingFactor > 0.6;
      animatables.fatigueCracks.children.forEach(c => {
          (c as THREE.Mesh).scale.setScalar(1 + Math.sin(time * 5) * 0.2);
      });
  }

  // 3. Thermal Cloud Pulsing
  if (animatables.thermalCloud) {
      const mat = animatables.thermalCloud.material as THREE.PointsMaterial;
      mat.opacity = 0.1 + (agingFactor * 0.4) + Math.sin(time * 2) * 0.1;
      animatables.thermalCloud.rotation.y += 0.005;
  }

  // 4. Strategy Specific Visuals
  if (strategy === 'RETROFIT') {
      // Modern components look clean (blue glow)
      const mat = (animatables.crankshaft?.material as THREE.MeshStandardMaterial);
      if (mat) {
          mat.emissive.setHex(0x0ea5e9);
          mat.emissiveIntensity = 0.5 + Math.sin(time * 3) * 0.2;
      }
  } else {
      if (animatables.crankshaft) {
          (animatables.crankshaft.material as THREE.MeshStandardMaterial).emissiveIntensity = 0;
      }
  }

  // 5. Rotation speed
  if (animatables.crankshaft) {
      const speed = (strategy === 'DECOMMISSION') ? 0 : 0.2 * (1 - agingFactor * 0.5);
      animatables.crankshaft.rotation.x += speed;
  }
};
