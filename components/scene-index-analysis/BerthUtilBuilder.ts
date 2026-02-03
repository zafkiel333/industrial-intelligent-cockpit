
import * as THREE from 'three';
import { Animatables, SceneType } from '../three-types';

export const isBerthUtilScene = (type: SceneType): boolean => {
  return type === 'berth-utilization-analysis';
};

export const setupBerthUtilCamera = (camera: THREE.PerspectiveCamera) => {
  camera.position.set(10, 15, 25);
  camera.lookAt(0, 0, 0);
};

export const initBerthUtilScene = (
  type: SceneType, 
  group: THREE.Group, 
  animatables: Animatables, 
  disposables: { dispose: () => void }[]
) => {
  if (type !== 'berth-utilization-analysis') return;

  // 1. Water Base
  const waterGeo = new THREE.PlaneGeometry(60, 40);
  waterGeo.rotateX(-Math.PI / 2);
  const waterMat = new THREE.MeshStandardMaterial({ 
    color: 0x0ea5e9, 
    transparent: true, 
    opacity: 0.6,
    roughness: 0.1 
  });
  disposables.push(waterGeo, waterMat);
  const water = new THREE.Mesh(waterGeo, waterMat);
  water.position.y = -0.5;
  group.add(water);

  // 2. Quay (Long Dock)
  const quayGeo = new THREE.BoxGeometry(40, 2, 8);
  const quayMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.8 });
  disposables.push(quayGeo, quayMat);
  const quay = new THREE.Mesh(quayGeo, quayMat);
  quay.position.set(0, 0.5, -10);
  group.add(quay);

  // Berth Markings (1, 2, 3, 4)
  const berths = [-15, -5, 5, 15]; // X positions
  
  // 3. Ships (Dynamic)
  animatables.berthShips = [];
  const shipGeo = new THREE.BoxGeometry(6, 2, 2.5);
  const cabinGeo = new THREE.BoxGeometry(1.5, 1.5, 2);
  const containerGeo = new THREE.BoxGeometry(4, 1, 2);
  
  disposables.push(shipGeo, cabinGeo, containerGeo);

  // Create 4 potential ships (one for each berth slot)
  berths.forEach((xPos, i) => {
    const shipGroup = new THREE.Group();
    
    // Hull
    const hullMat = new THREE.MeshStandardMaterial({ color: i % 2 === 0 ? 0xef4444 : 0x3b82f6 });
    disposables.push(hullMat);
    const hull = new THREE.Mesh(shipGeo, hullMat);
    hull.position.y = 0.5;
    shipGroup.add(hull);

    // Cabin
    const cabin = new THREE.Mesh(cabinGeo, new THREE.MeshStandardMaterial({ color: 0xffffff }));
    cabin.position.set(-2, 2, 0);
    shipGroup.add(cabin);

    // Containers
    const cont = new THREE.Mesh(containerGeo, new THREE.MeshStandardMaterial({ color: 0xf59e0b }));
    cont.position.set(1, 2, 0);
    shipGroup.add(cont);

    group.add(shipGroup);
    
    // Initialize ship state
    // i=0: Docked
    // i=1: Leaving
    // i=2: Arriving
    // i=3: Empty (Hidden)
    
    let state: 'arriving'|'docked'|'leaving' = 'docked';
    let progress = 0;
    
    if (i === 1) { state = 'leaving'; progress = 0; }
    if (i === 2) { state = 'arriving'; progress = 0.5; }
    if (i === 3) { state = 'arriving'; progress = 0; shipGroup.visible = false; } // effectively empty

    shipGroup.position.set(xPos, 0, -4); // Docked position
    
    animatables.berthShips?.push({
      mesh: shipGroup,
      state: state,
      progress: progress,
      berthId: i
    });
  });

  // 4. STS Cranes (Static visual, maybe sliding later)
  animatables.berthCranes = [];
  const craneGeo = new THREE.BoxGeometry(1, 6, 1);
  const boomGeo = new THREE.BoxGeometry(1, 1, 8);
  const craneMat = new THREE.MeshStandardMaterial({ color: 0xf97316 });
  disposables.push(craneGeo, boomGeo, craneMat);

  berths.forEach((xPos, i) => {
    const craneGroup = new THREE.Group();
    craneGroup.position.set(xPos, 3, -10);
    
    const tower = new THREE.Mesh(craneGeo, craneMat);
    craneGroup.add(tower);
    
    const boom = new THREE.Mesh(boomGeo, craneMat);
    boom.position.set(0, 3, 2); // Extend over water
    craneGroup.add(boom);

    group.add(craneGroup);
    animatables.berthCranes?.push(craneGroup);
  });
};

export const animateBerthUtilScene = (type: SceneType, animatables: Animatables, time: number) => {
  if (type !== 'berth-utilization-analysis') return;

  // Animate Ships
  if (animatables.berthShips) {
    animatables.berthShips.forEach((ship, i) => {
      const zDocked = -4;
      const zOuter = 15;
      
      // State Machine Logic
      if (ship.state === 'docked') {
        ship.mesh.position.z = zDocked;
        ship.mesh.visible = true;
        // Bobbing
        ship.mesh.position.y = Math.sin(time * 2 + i) * 0.1;

        // Change state randomly
        if (Math.random() > 0.995) {
           ship.state = 'leaving';
           ship.progress = 0;
        }

      } else if (ship.state === 'leaving') {
        ship.progress += 0.005;
        if (ship.progress >= 1) {
           ship.state = 'arriving';
           ship.progress = 0;
           ship.mesh.visible = false; // Hide briefly before arriving
           // Change color maybe?
        }
        // Move Z out
        ship.mesh.position.z = zDocked + (zOuter - zDocked) * ship.progress;

      } else if (ship.state === 'arriving') {
        ship.mesh.visible = true;
        ship.progress += 0.005;
        if (ship.progress >= 1) {
           ship.state = 'docked';
           ship.progress = 0;
        }
        // Move Z in
        ship.mesh.position.z = zOuter - (zOuter - zDocked) * ship.progress;
      }
    });
  }

  // Animate Cranes (Sliding / Working)
  if (animatables.berthCranes) {
     animatables.berthCranes.forEach((crane, i) => {
        // Subtle operation movement if ship is docked
        if (animatables.berthShips && animatables.berthShips[i].state === 'docked') {
            // Slide slightly on X
            crane.position.x += Math.sin(time * 3 + i) * 0.02;
        }
     });
  }
};
