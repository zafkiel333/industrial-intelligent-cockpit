
import * as THREE from 'three';
import { BasinAnimatables, BasinState } from './three-types';

export const initBasinScene = (
  group: THREE.Group, 
  animatables: BasinAnimatables,
  disposables: { dispose: () => void }[]
) => {
  // --- Materials ---
  const concreteMat = new THREE.MeshStandardMaterial({ 
    color: 0x334155, roughness: 0.9, flatShading: true 
  });
  const waterMat = new THREE.MeshPhysicalMaterial({ 
    color: 0x0ea5e9, transmission: 0.9, opacity: 0.4, transparent: true, roughness: 0.1 
  });
  const rovMat = new THREE.MeshStandardMaterial({ color: 0xfacc15, metalness: 0.8 });
  const laserMat = new THREE.MeshBasicMaterial({ color: 0x22d3ee, transparent: true, opacity: 0.3 });

  disposables.push(concreteMat, waterMat, rovMat, laserMat);

  // 1. Stilling Basin Base (U-shape channel)
  const basinGeo = new THREE.BoxGeometry(20, 2, 10);
  disposables.push(basinGeo);
  const floor = new THREE.Mesh(basinGeo, concreteMat);
  floor.position.y = -1;
  group.add(floor);
  animatables.basinFloor = floor;

  // Side Walls
  const wallGeo = new THREE.BoxGeometry(20, 6, 1);
  disposables.push(wallGeo);
  const wallL = new THREE.Mesh(wallGeo, concreteMat);
  wallL.position.set(0, 2, -4.5);
  group.add(wallL);
  const wallR = new THREE.Mesh(wallGeo, concreteMat);
  wallR.position.set(0, 2, 4.5);
  group.add(wallR);

  // 2. Scour Pits (Damage areas)
  const pits = new THREE.Group();
  const pitGeo = new THREE.CylinderGeometry(1.5, 0.5, 0.5, 16);
  disposables.push(pitGeo);
  const pitMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 1.0 });
  disposables.push(pitMat);

  const pitPos = [[-5, 0, -2], [2, 0, 1], [-2, 0, 2]];
  pitPos.forEach(p => {
      const pit = new THREE.Mesh(pitGeo, pitMat);
      pit.position.set(p[0], 0, p[2]);
      pits.add(pit);
  });
  group.add(pits);
  animatables.scourPits = pits;

  // 3. Water Volume
  const waterGeo = new THREE.BoxGeometry(20, 6, 8);
  disposables.push(waterGeo);
  const water = new THREE.Mesh(waterGeo, waterMat);
  water.position.y = 2;
  group.add(water);
  animatables.waterVolume = water;

  // 4. ROV Model (Simplified)
  const rov = new THREE.Group();
  const body = new THREE.Mesh(new THREE.BoxGeometry(1, 0.6, 1.2), rovMat);
  rov.add(body);
  const light = new THREE.PointLight(0xffffff, 5, 10);
  light.position.set(0, 0, 0.8);
  rov.add(light);
  rov.position.set(0, 2, 0);
  group.add(rov);
  animatables.rovModel = rov;

  // 5. Sonar Scanning Plane
  const scanGeo = new THREE.PlaneGeometry(8, 0.5);
  disposables.push(scanGeo);
  const scan = new THREE.Mesh(scanGeo, laserMat);
  scan.rotation.x = -Math.PI / 2;
  scan.position.y = 0.1;
  group.add(scan);
  animatables.sonarBeams = new THREE.Group();
  animatables.sonarBeams.add(scan);

  // 6. Particles
  const pCount = 200;
  const pGeo = new THREE.BufferGeometry();
  const pPos = new Float32Array(pCount * 3);
  for(let i=0; i<pCount; i++){
      pPos[i*3] = (Math.random()-0.5)*20;
      pPos[i*3+1] = Math.random()*5;
      pPos[i*3+2] = (Math.random()-0.5)*8;
  }
  pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
  disposables.push(pGeo);
  const particles = new THREE.Points(pGeo, new THREE.PointsMaterial({color: 0xa5f3fc, size: 0.1}));
  group.add(particles);
  animatables.flowParticles = particles;

  // Environment Grid
  const grid = new THREE.GridHelper(40, 20, 0x1e293b, 0x020617);
  grid.position.y = -2;
  group.add(grid);
};

export const animateBasinScene = (
  animatables: BasinAnimatables, 
  state: BasinState,
  time: number
) => {
  // ROV Movement
  if (animatables.rovModel) {
      animatables.rovModel.position.x = Math.sin(time * 0.5) * 5;
      animatables.rovModel.position.z = Math.cos(time * 0.3) * 2;
      animatables.rovModel.position.y = 2 + Math.sin(time) * 0.5;
      animatables.rovModel.rotation.y = time * 0.2;
  }

  // Sonar Scan
  if (animatables.sonarBeams) {
      animatables.sonarBeams.visible = state === 'SURVEY';
      const scan = animatables.sonarBeams.children[0];
      scan.position.x = Math.sin(time * 2) * 9;
  }

  // Water Surface Ripple
  if (animatables.waterVolume) {
      animatables.waterVolume.scale.y = 1 + Math.sin(time * 2) * 0.01;
  }

  // Flow particles
  if (animatables.flowParticles) {
      const pos = animatables.flowParticles.geometry.attributes.position.array as Float32Array;
      for(let i=0; i<pos.length; i+=3) {
          pos[i] += 0.05;
          if (pos[i] > 10) pos[i] = -10;
      }
      animatables.flowParticles.geometry.attributes.position.needsUpdate = true;
  }
};
