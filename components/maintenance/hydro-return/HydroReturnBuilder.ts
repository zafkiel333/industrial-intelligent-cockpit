
import * as THREE from 'three';
import { ReturnAnimatables, ReturnPhase } from './three-types';

export const initReturnScene = (
  group: THREE.Group, 
  animatables: ReturnAnimatables,
  disposables: { dispose: () => void }[]
) => {
  // --- Materials ---
  const metalMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.2, metalness: 0.8 });
  const copperMat = new THREE.MeshStandardMaterial({ color: 0xb45309, metalness: 0.9 });
  const glowMat = new THREE.MeshBasicMaterial({ color: 0x8b5cf6, transparent: true, opacity: 0.2, wireframe: true });
  const streamMat = new THREE.MeshPhongMaterial({ 
    color: 0x0ea5e9, transparent: true, opacity: 0.4, shininess: 100 
  });
  const ringMat = new THREE.MeshBasicMaterial({ color: 0x22d3ee, transparent: true, opacity: 0.5 });

  disposables.push(metalMat, copperMat, glowMat, streamMat, ringMat);

  // 1. Turbine Main Structure
  const unitGroup = new THREE.Group();
  group.add(unitGroup);
  animatables.turbineUnit = unitGroup;

  // Stator Shell (Transparent)
  const stator = new THREE.Mesh(
    new THREE.CylinderGeometry(4.5, 4.5, 6, 32, 1, true),
    new THREE.MeshPhysicalMaterial({ color: 0x1e293b, transparent: true, opacity: 0.15, transmission: 0.8 })
  );
  stator.position.y = 3;
  unitGroup.add(stator);

  // Rotor & Shaft
  const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 0.8, 10, 32), metalMat);
  shaft.position.y = 3;
  unitGroup.add(shaft);
  animatables.rotorCore = shaft;

  const rotorDisk = new THREE.Mesh(new THREE.CylinderGeometry(3.8, 3.8, 2, 32), copperMat);
  rotorDisk.position.y = 4;
  shaft.add(rotorDisk);

  // 2. Water Flow Helix (Visualizing startup)
  const helixGeo = new THREE.TorusKnotGeometry(4.2, 0.4, 100, 16, 2, 3);
  const waterHelix = new THREE.Mesh(helixGeo, streamMat);
  waterHelix.position.y = -1;
  waterHelix.rotation.x = Math.PI / 2;
  waterHelix.visible = false;
  group.add(waterHelix);
  animatables.waterHelix = waterHelix;

  // 3. Grid Sync Aura
  const ringGeo = new THREE.TorusGeometry(5, 0.05, 16, 100);
  const syncAura = new THREE.Mesh(ringGeo, ringMat);
  syncAura.position.y = 4;
  syncAura.rotation.x = Math.PI / 2;
  syncAura.visible = false;
  group.add(syncAura);
  animatables.syncAura = syncAura;

  // 4. Excitation Light
  const exLight = new THREE.PointLight(0x8b5cf6, 0, 10);
  exLight.position.set(0, 4, 0);
  group.add(exLight);
  animatables.excitationGlow = exLight;

  // 5. Data Sampling Particles
  const pCount = 200;
  const pGeo = new THREE.BufferGeometry();
  const pPos = new Float32Array(pCount * 3);
  for(let i=0; i<pCount; i++) {
      pPos[i*3] = (Math.random()-0.5)*12;
      pPos[i*3+1] = Math.random()*8;
      pPos[i*3+2] = (Math.random()-0.5)*12;
  }
  pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
  const pMat = new THREE.PointsMaterial({ color: 0x22d3ee, size: 0.1, transparent: true, opacity: 0.3 });
  const points = new THREE.Points(pGeo, pMat);
  group.add(points);
  animatables.dataBeams = points;

  // Environment
  const grid = new THREE.GridHelper(40, 20, 0x1e293b, 0x0f172a);
  grid.position.y = -2;
  group.add(grid);
};

export const animateReturnScene = (
  animatables: ReturnAnimatables, 
  phase: ReturnPhase,
  time: number
) => {
  if (!animatables.turbineUnit || !animatables.rotorCore) return;

  // Rotation Logic
  let speed = 0;
  switch (phase) {
    case 'SPEED_RAMP': speed = Math.min(0.5, time * 0.02); break;
    case 'EXCITATION': 
    case 'GRID_SYNC': speed = 0.5; break;
    case 'LOAD_RAMP': speed = 0.6; break;
    default: speed = 0.005; // Idle creep
  }
  
  animatables.rotorCore.rotation.y += speed;

  // Layer Visibility & FX
  if (animatables.waterHelix) {
      animatables.waterHelix.visible = (phase !== 'COLD_CHECK' && phase !== 'PRESSURE_BUILD');
      animatables.waterHelix.rotation.z -= speed * 0.5;
      animatables.waterHelix.scale.setScalar(1 + Math.sin(time*2)*0.02);
  }

  if (animatables.excitationGlow) {
      animatables.excitationGlow.intensity = (phase === 'EXCITATION' || phase === 'GRID_SYNC') ? 5 + Math.sin(time*10)*2 : 0;
  }

  if (animatables.syncAura) {
      animatables.syncAura.visible = (phase === 'GRID_SYNC');
      animatables.syncAura.scale.setScalar(1 + Math.sin(time * 5) * 0.1);
      (animatables.syncAura.material as THREE.Material).opacity = 0.4 + Math.sin(time * 8) * 0.2;
  }

  if (animatables.dataBeams) {
      animatables.dataBeams.rotation.y += 0.002;
  }
};
