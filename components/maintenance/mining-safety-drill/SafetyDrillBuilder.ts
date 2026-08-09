
import * as THREE from 'three';
import { SafetyAnimatables, DrillPhase } from './three-types';

export const initSafetyDrillScene = (
  group: THREE.Group, 
  animatables: SafetyAnimatables,
  disposables: { dispose: () => void }[]
) => {
  // --- Materials ---
  const bodyMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.6, metalness: 0.4 });
  const yellowMat = new THREE.MeshStandardMaterial({ color: 0xfacc15, roughness: 0.4 });
  const darkSteel = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.8 });
  const hazardMat = new THREE.MeshBasicMaterial({ 
    color: 0xef4444, transparent: true, opacity: 0.2, side: THREE.DoubleSide 
  });
  const safeMat = new THREE.MeshBasicMaterial({ 
    color: 0x10b981, transparent: true, opacity: 0.1, wireframe: true 
  });
  const pulseMat = new THREE.MeshBasicMaterial({ color: 0x22d3ee, transparent: true, opacity: 0.4 });

  disposables.push(bodyMat, yellowMat, darkSteel, hazardMat, safeMat, pulseMat);

  // 1. Mining Shovel Model (Representative)
  const shovel = new THREE.Group();
  group.add(shovel);
  animatables.shovelGroup = shovel;

  // Tracks
  const trackGeo = new THREE.BoxGeometry(6, 1.5, 8);
  const tracks = new THREE.Mesh(trackGeo, darkSteel);
  tracks.position.y = 0.75;
  shovel.add(tracks);

  // Swing Platform
  const swingGroup = new THREE.Group();
  swingGroup.position.y = 1.5;
  shovel.add(swingGroup);
  animatables.swingPlatform = swingGroup;

  const deck = new THREE.Mesh(new THREE.BoxGeometry(6.5, 1, 7), bodyMat);
  deck.position.y = 0.5;
  swingGroup.add(deck);

  const cab = new THREE.Mesh(new THREE.BoxGeometry(5, 4, 6), yellowMat);
  cab.position.set(0, 3, 0);
  swingGroup.add(cab);

  // Boom (Representative)
  const boomGeo = new THREE.BoxGeometry(1.2, 10, 1.2);
  boomGeo.translate(0, 5, 0);
  const boom = new THREE.Mesh(boomGeo, yellowMat);
  boom.position.set(0, 1, 3);
  boom.rotation.x = -0.5;
  swingGroup.add(boom);

  // 2. Safety Zones (Dynamic)
  const zones = new THREE.Group();
  group.add(zones);
  animatables.hazardZones = zones;

  // No-Go Zone (Around the swing radius)
  const nogoGeo = new THREE.CylinderGeometry(8, 8, 0.2, 32);
  const nogo = new THREE.Mesh(nogoGeo, hazardMat);
  nogo.position.y = 0.1;
  zones.add(nogo);

  // Safe Working Pocket
  const safeGeo = new THREE.BoxGeometry(4, 5, 4);
  const safeZone = new THREE.Mesh(safeGeo, safeMat);
  safeZone.position.set(-8, 2.5, 0);
  zones.add(safeZone);

  // 3. LOTO Points (Interactive tags)
  const lotoGroup = new THREE.Group();
  const tagGeo = new THREE.BoxGeometry(0.2, 0.4, 0.05);
  const tagMat = new THREE.MeshBasicMaterial({ color: 0xef4444 });
  
  const lockPos = [[-2, 2, -3.1], [2, 4, 0]]; // Electrical & Hydraulic points
  lockPos.forEach(p => {
      const tag = new THREE.Mesh(tagGeo, tagMat);
      tag.position.set(p[0], p[1], p[2]);
      lotoGroup.add(tag);
      const light = new THREE.PointLight(0xff0000, 1, 2);
      light.position.copy(tag.position);
      lotoGroup.add(light);
  });
  shovel.add(lotoGroup);
  animatables.lotoLocks = lotoGroup;

  // 4. Scanning Grid
  const scanPlane = new THREE.Mesh(new THREE.PlaneGeometry(20, 20), pulseMat);
  scanPlane.rotation.x = -Math.PI / 2;
  scanPlane.position.y = 0.5;
  scanPlane.visible = false;
  group.add(scanPlane);
  animatables.scanningBeam = scanPlane;

  // Environment Grid
  const grid = new THREE.GridHelper(50, 20, 0x334155, 0x1e293b);
  grid.position.y = 0.01;
  group.add(grid);
};

export const animateSafetyDrill = (
  animatables: SafetyAnimatables, 
  phase: DrillPhase,
  time: number
) => {
  if (!animatables.shovelGroup) return;

  // Subtle breathing of the entire model
  animatables.shovelGroup.position.y = Math.sin(time * 0.5) * 0.05;

  // Phase Specific Animations
  if (phase === 'PRE_CHECK') {
      if (animatables.scanningBeam) {
          animatables.scanningBeam.visible = true;
          animatables.scanningBeam.position.y = 0.5 + Math.sin(time * 2) * 2;
      }
  } else {
      if (animatables.scanningBeam) animatables.scanningBeam.visible = false;
  }

  if (phase === 'ISOLATION') {
      if (animatables.lotoLocks) {
          animatables.lotoLocks.children.forEach((child, i) => {
              if (child instanceof THREE.PointLight) {
                  child.intensity = 2 + Math.sin(time * 10) * 2;
              }
          });
      }
  }

  if (phase === 'EMERGENCY') {
      if (animatables.hazardZones) {
          animatables.hazardZones.children[0].scale.setScalar(1 + Math.sin(time * 15) * 0.05);
          (animatables.hazardZones.children[0] as THREE.Mesh).material.opacity = 0.4 + Math.sin(time * 20) * 0.2;
      }
      // Simulate erratic swing
      if (animatables.swingPlatform) {
          animatables.swingPlatform.rotation.y += Math.sin(time * 30) * 0.01;
      }
  } else if (phase === 'REPAIR_EXEC') {
      // Steady swing for operation simulation
      if (animatables.swingPlatform) {
          animatables.swingPlatform.rotation.y = Math.sin(time * 0.2) * 0.1;
      }
  }
};
