
import * as THREE from 'three';
import { Animatables, SceneType } from '../three-types';

export const isChannelSafetyScene = (type: SceneType): boolean => {
  return type === 'channel-safety-analysis';
};

export const setupChannelSafetyCamera = (camera: THREE.PerspectiveCamera) => {
  camera.position.set(0, 40, 40);
  camera.lookAt(0, 0, 0);
};

export const initChannelSafetyScene = (
  type: SceneType, 
  group: THREE.Group, 
  animatables: Animatables, 
  disposables: { dispose: () => void }[]
) => {
  if (type !== 'channel-safety-analysis') return;

  // 1. Fog / Environment (Dynamic based on data)
  // We'll attach fog to the scene in the animate loop if possible, 
  // or simulate it with a large semi-transparent box for volumetric feel.
  // Here we add a subtle grid.
  const grid = new THREE.PolarGridHelper(30, 16, 8, 64, 0x1e3a8a, 0x0f172a);
  grid.position.y = -0.5;
  group.add(grid);

  const waterGeo = new THREE.PlaneGeometry(80, 80);
  waterGeo.rotateX(-Math.PI / 2);
  const waterMat = new THREE.MeshBasicMaterial({ 
      color: 0x0f172a, 
      transparent: true, 
      opacity: 0.8 
  });
  disposables.push(waterGeo, waterMat);
  const water = new THREE.Mesh(waterGeo, waterMat);
  water.position.y = -1;
  group.add(water);

  // 2. Channel Buoys (Lane Markers)
  animatables.csBuoys = [];
  const buoyGeo = new THREE.CylinderGeometry(0.3, 0.3, 1, 8);
  const redMat = new THREE.MeshBasicMaterial({ color: 0xef4444 }); // Port
  const greenMat = new THREE.MeshBasicMaterial({ color: 0x22c55e }); // Starboard
  disposables.push(buoyGeo, redMat, greenMat);

  // Curved Channel Path
  for (let i = 0; i < 10; i++) {
      const t = i / 9;
      const z = (t - 0.5) * 60;
      const xCurve = Math.sin(t * Math.PI) * 10; 
      
      // Port Buoy
      const b1 = new THREE.Mesh(buoyGeo, redMat);
      b1.position.set(xCurve - 8, 0, z);
      group.add(b1);
      animatables.csBuoys.push(b1 as unknown as THREE.Group);

      // Starboard Buoy
      const b2 = new THREE.Mesh(buoyGeo, greenMat);
      b2.position.set(xCurve + 8, 0, z);
      group.add(b2);
      animatables.csBuoys.push(b2 as unknown as THREE.Group);
  }

  // 3. Ships with "Safety Domains"
  animatables.csShips = [];
  const shipGeo = new THREE.ConeGeometry(1, 4, 4);
  shipGeo.rotateX(Math.PI / 2); // Point Z
  const shipMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.4 });
  disposables.push(shipGeo, shipMat);
  
  const domainGeo = new THREE.SphereGeometry(6, 32, 16);
  // Flatten sphere to ellipse
  domainGeo.scale(1, 0.2, 1.5); 
  const domainMat = new THREE.MeshBasicMaterial({ 
      color: 0x22c55e, 
      transparent: true, 
      opacity: 0.15,
      wireframe: true
  });
  disposables.push(domainGeo, domainMat);

  // Ship 1 (Southbound)
  const ship1 = new THREE.Group();
  const s1Mesh = new THREE.Mesh(shipGeo, shipMat);
  const s1Domain = new THREE.Mesh(domainGeo, domainMat.clone()); // Clone for independent color
  ship1.add(s1Mesh);
  ship1.add(s1Domain);
  group.add(ship1);
  
  animatables.csShips.push({
      mesh: ship1,
      domain: s1Domain,
      vector: new THREE.Line(), // Placeholder
      velocity: new THREE.Vector3(0, 0, 0.2) // Moving Z+
  });

  // Ship 2 (Northbound - Crossing)
  const ship2 = new THREE.Group();
  const s2Mesh = new THREE.Mesh(shipGeo, shipMat);
  const s2Domain = new THREE.Mesh(domainGeo, domainMat.clone());
  ship2.add(s2Mesh);
  ship2.add(s2Domain);
  group.add(ship2);
  
  animatables.csShips.push({
      mesh: ship2,
      domain: s2Domain,
      vector: new THREE.Line(),
      velocity: new THREE.Vector3(0.05, 0, -0.2) // Moving Z- and X+
  });

  // 4. Central Risk Zone Indicator (Visualizes calculation)
  const zoneGroup = new THREE.Group();
  const ringGeo = new THREE.RingGeometry(8, 8.5, 32);
  ringGeo.rotateX(-Math.PI / 2);
  const ringMat = new THREE.MeshBasicMaterial({ color: 0xef4444, transparent: true, opacity: 0 });
  disposables.push(ringGeo, ringMat);
  const ring = new THREE.Mesh(ringGeo, ringMat);
  zoneGroup.add(ring);
  group.add(zoneGroup);
  animatables.csRiskZone = zoneGroup;
};

export const animateChannelSafetyScene = (type: SceneType, animatables: Animatables, time: number) => {
  if (type !== 'channel-safety-analysis') return;

  const ships = animatables.csShips;
  if (!ships) return;

  // External Simulation Factors (via userData usually, here mocked by time cycle)
  // Cycle: Ships approach (Risk rises), Near miss (Risk peak), Pass (Risk falls), Reset.
  const cycleLength = 400;
  const t = (time * 60) % cycleLength;
  
  // 1. Move Ships
  // Ship 1: Straight down channel
  // Start: (0,0,-30) -> End: (0,0,30)
  const s1Progress = t / cycleLength;
  ships[0].mesh.position.set(-2, 0, -30 + s1Progress * 60);
  
  // Ship 2: Crossing path
  // Start: (-10,0,30) -> End: (5,0,-30)
  ships[1].mesh.position.set(-10 + s1Progress * 15, 0, 30 - s1Progress * 60);
  ships[1].mesh.rotation.y = Math.atan2(15, -60) + Math.PI; // Look direction

  // 2. Calculate Distance & Risk
  const dist = ships[0].mesh.position.distanceTo(ships[1].mesh.position);
  const riskThreshold = 10;
  const criticalThreshold = 5;
  
  // 3. Update Domains
  ships.forEach(shipObj => {
      const mat = shipObj.domain.material as THREE.MeshBasicMaterial;
      if (dist < criticalThreshold) {
          mat.color.setHex(0xef4444); // Red
          mat.opacity = 0.4 + Math.sin(time * 20) * 0.1; // Fast Pulse
      } else if (dist < riskThreshold) {
          mat.color.setHex(0xfacc15); // Yellow
          mat.opacity = 0.2;
      } else {
          mat.color.setHex(0x22c55e); // Green
          mat.opacity = 0.1;
      }
      
      // Bobbing
      shipObj.mesh.position.y = Math.sin(time * 2 + shipObj.mesh.id) * 0.2;
  });

  // 4. Update Risk Zone Indicator
  if (animatables.csRiskZone) {
      const ring = animatables.csRiskZone.children[0] as THREE.Mesh;
      const ringMat = ring.material as THREE.MeshBasicMaterial;
      
      // Position between ships
      const midPos = ships[0].mesh.position.clone().add(ships[1].mesh.position).multiplyScalar(0.5);
      animatables.csRiskZone.position.copy(midPos);
      
      if (dist < riskThreshold) {
          const intensity = 1 - (dist / riskThreshold);
          ringMat.opacity = intensity * 0.5;
          ring.scale.setScalar(1 - intensity * 0.5); // Shrink as risk grows
      } else {
          ringMat.opacity = 0;
      }
  }

  // 5. Buoys (Bobbing)
  if (animatables.csBuoys) {
      animatables.csBuoys.forEach((b, i) => {
          b.position.y = Math.sin(time * 3 + i) * 0.1;
          b.rotation.z = Math.sin(time * 2 + i) * 0.1;
      });
  }
};
