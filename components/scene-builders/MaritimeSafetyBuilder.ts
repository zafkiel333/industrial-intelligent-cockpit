import * as THREE from 'three';
import { Animatables, SceneType } from '../three-types';

export const isMaritimeSafetyScene = (type: SceneType): boolean => {
  return type === 'maritime-safety-cockpit';
};

export const setupMaritimeSafetyCamera = (camera: THREE.PerspectiveCamera) => {
  camera.position.set(0, 18, 12);
  camera.lookAt(0, 0, 0);
};

export const initMaritimeSafetyScene = (
  type: SceneType, 
  group: THREE.Group, 
  animatables: Animatables, 
  disposables: { dispose: () => void }[]
) => {
  if (type !== 'maritime-safety-cockpit') return;

  // 1. Radar Base & Ocean
  const seaGeo = new THREE.PlaneGeometry(60, 60, 32, 32);
  seaGeo.rotateX(-Math.PI / 2);
  const seaMat = new THREE.MeshBasicMaterial({ 
      color: 0x020617, 
      transparent: true, 
      opacity: 0.8 
  });
  disposables.push(seaGeo, seaMat);
  const sea = new THREE.Mesh(seaGeo, seaMat);
  group.add(sea);

  // Radar Grid
  const gridHelper = new THREE.PolarGridHelper(20, 16, 8, 64, 0x1e3a8a, 0x1e3a8a);
  gridHelper.position.y = 0.1;
  group.add(gridHelper);

  // 2. Radar Sweep
  const sweepGroup = new THREE.Group();
  const sweepGeo = new THREE.CircleGeometry(20, 64, 0, 0.5);
  sweepGeo.rotateX(-Math.PI / 2);
  const sweepMat = new THREE.MeshBasicMaterial({ 
      color: 0x0ea5e9, 
      transparent: true, 
      opacity: 0.2, 
      side: THREE.DoubleSide 
  });
  disposables.push(sweepGeo, sweepMat);
  const sweep = new THREE.Mesh(sweepGeo, sweepMat);
  sweep.position.y = 0.2;
  sweepGroup.add(sweep);
  group.add(sweepGroup);
  animatables.radarSweep = sweepGroup;

  // 3. Coastline (Low Poly)
  const landGeo = new THREE.BufferGeometry();
  const landPoints = [];
  // Simple curved coastline shape
  for(let i=0; i<=20; i++) {
      const x = -20 + i*2;
      const z = -10 + Math.sin(i*0.5)*3;
      landPoints.push(x, 0.5, z);
      landPoints.push(x, 0.5, -30); // Extend back
  }
  // Create a mesh from points (simplified box blocks for coast)
  const coastGroup = new THREE.Group();
  const blockGeo = new THREE.BoxGeometry(2, 1, 4);
  const blockMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.8 });
  disposables.push(blockGeo, blockMat);
  
  for(let i=0; i<15; i++) {
      const x = -15 + i*2.5;
      const z = -12 + Math.sin(i*0.8)*4;
      const block = new THREE.Mesh(blockGeo, blockMat);
      block.position.set(x, 0.5, z);
      block.scale.z = 5;
      coastGroup.add(block);
  }
  group.add(coastGroup);

  // 4. Target Ships
  animatables.targetShips = [];
  const shipGeo = new THREE.ConeGeometry(0.5, 1.5, 4);
  shipGeo.rotateX(Math.PI / 2);
  const shipMat = new THREE.MeshBasicMaterial({ color: 0xfacc15 }); // Yellow Targets
  const trailMat = new THREE.MeshBasicMaterial({ color: 0xfacc15, transparent: true, opacity: 0.3 });
  disposables.push(shipGeo, shipMat, trailMat);

  for(let i=0; i<8; i++) {
      const shipGroup = new THREE.Group();
      
      const mesh = new THREE.Mesh(shipGeo, shipMat);
      shipGroup.add(mesh);
      
      // Directional Trail
      const trailGeo = new THREE.PlaneGeometry(0.2, 4);
      trailGeo.rotateX(-Math.PI / 2);
      trailGeo.translate(0, 0, 2);
      const trail = new THREE.Mesh(trailGeo, trailMat);
      shipGroup.add(trail);

      // Label (Simple sprite or box)
      const labelGeo = new THREE.PlaneGeometry(1, 0.5);
      const labelMat = new THREE.MeshBasicMaterial({ color: 0x000000, side: THREE.DoubleSide });
      // In a real app, use Sprite with canvas texture for text
      
      const angle = Math.random() * Math.PI * 2;
      const radius = 5 + Math.random() * 12;
      shipGroup.position.set(Math.cos(angle)*radius, 0.5, Math.sin(angle)*radius);
      shipGroup.lookAt(0, 0.5, 0); // Temporary look at center
      shipGroup.rotation.y = Math.random() * Math.PI * 2; // Random heading

      group.add(shipGroup);
      
      animatables.targetShips.push({
          mesh: shipGroup,
          speed: 0.02 + Math.random() * 0.03,
          angle: angle,
          radius: radius
      });
  }

  // 5. Patrol Boat (Distinct)
  const patrolGroup = new THREE.Group();
  const pbGeo = new THREE.BoxGeometry(1, 0.5, 2.5);
  const pbMat = new THREE.MeshStandardMaterial({ color: 0x3b82f6 }); // Blue
  disposables.push(pbGeo, pbMat);
  const pb = new THREE.Mesh(pbGeo, pbMat);
  patrolGroup.add(pb);
  
  // Spotlight
  const light = new THREE.SpotLight(0xffffff, 10, 15, 0.5, 0.5, 1);
  light.position.set(0, 2, 0);
  light.target.position.set(0, 0, 5);
  patrolGroup.add(light);
  patrolGroup.add(light.target);
  
  patrolGroup.position.set(5, 0.5, 5);
  group.add(patrolGroup);
  animatables.patrolBoat = patrolGroup;

  // 6. Exclusion Zone (Restricted Area)
  const zoneGeo = new THREE.RingGeometry(12, 12.5, 64);
  zoneGeo.rotateX(-Math.PI / 2);
  const zoneMat = new THREE.MeshBasicMaterial({ color: 0xef4444, side: THREE.DoubleSide, transparent: true, opacity: 0.6 });
  disposables.push(zoneGeo, zoneMat);
  const zone = new THREE.Mesh(zoneGeo, zoneMat);
  zone.position.y = 0.2;
  group.add(zone);
};

export const animateMaritimeSafetyScene = (type: SceneType, animatables: Animatables, time: number) => {
  if (type !== 'maritime-safety-cockpit') return;

  // Radar Sweep
  if (animatables.radarSweep) {
      animatables.radarSweep.rotation.y -= 0.05;
  }

  // Target Ships Movement
  if (animatables.targetShips) {
      animatables.targetShips.forEach(ship => {
          ship.mesh.translateZ(ship.speed);
          
          // Simple wrap around logic
          if (ship.mesh.position.length() > 22) {
              ship.mesh.position.set(0, 0.5, 0);
              ship.mesh.rotation.y = Math.random() * Math.PI * 2;
          }
      });
  }

  // Patrol Boat Patrol Pattern
  if (animatables.patrolBoat) {
      const r = 8;
      const x = Math.cos(time * 0.2) * r;
      const z = Math.sin(time * 0.2) * r;
      animatables.patrolBoat.position.set(x, 0.5, z);
      animatables.patrolBoat.lookAt(
          Math.cos(time * 0.2 + 0.1) * r, 
          0.5, 
          Math.sin(time * 0.2 + 0.1) * r
      );
  }
};