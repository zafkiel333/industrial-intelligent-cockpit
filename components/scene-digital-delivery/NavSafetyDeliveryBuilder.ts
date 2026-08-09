
import * as THREE from 'three';
import { GeoAnimatables, SceneType } from './three-types';

export const isNavSafetyDeliveryScene = (type: SceneType): boolean => {
  return type === 'dd-nav-safety';
};

export const setupNavSafetyDeliveryCamera = (camera: THREE.PerspectiveCamera) => {
  camera.position.set(0, 35, 30);
  camera.lookAt(0, 0, 0);
};

export const initNavSafetyDeliveryScene = (
  type: SceneType, 
  group: THREE.Group, 
  animatables: GeoAnimatables, 
  disposables: { dispose: () => void }[]
) => {
  if (type !== 'dd-nav-safety') return;

  // 1. Turbulent Water
  const waterGeo = new THREE.PlaneGeometry(60, 60, 64, 64);
  waterGeo.rotateX(-Math.PI / 2);
  const waterMat = new THREE.MeshStandardMaterial({ 
      color: 0x0f172a, 
      roughness: 0.2, 
      metalness: 0.6,
      transparent: true,
      opacity: 0.8
  });
  disposables.push(waterGeo, waterMat);
  const water = new THREE.Mesh(waterGeo, waterMat);
  water.position.y = -1;
  group.add(water);

  // Grid
  const grid = new THREE.GridHelper(60, 30, 0xef4444, 0x1e293b);
  grid.position.y = -0.9;
  group.add(grid);

  // 2. Target Vessel (Distress)
  const targetGroup = new THREE.Group();
  const hullGeo = new THREE.ConeGeometry(1.5, 5, 4);
  hullGeo.rotateX(Math.PI / 2);
  const hullMat = new THREE.MeshStandardMaterial({ color: 0x334155, emissive: 0xef4444, emissiveIntensity: 0.2 });
  disposables.push(hullGeo, hullMat);
  const hull = new THREE.Mesh(hullGeo, hullMat);
  targetGroup.add(hull);
  
  targetGroup.position.set(10, 0, -10);
  targetGroup.rotation.y = Math.PI / 4;
  targetGroup.rotation.z = 0.2; // Listing
  group.add(targetGroup);
  animatables.nsdTarget = targetGroup;

  // Distress Signal (Ring Pulse)
  const sigGeo = new THREE.RingGeometry(0.5, 1, 32);
  sigGeo.rotateX(-Math.PI / 2);
  const sigMat = new THREE.MeshBasicMaterial({ color: 0xef4444, transparent: true, side: THREE.DoubleSide });
  disposables.push(sigGeo, sigMat);
  const signal = new THREE.Mesh(sigGeo, sigMat);
  targetGroup.add(signal); // Attach to target
  animatables.nsdSignal = signal;

  // 3. Rescue Vessel
  const rescueGroup = new THREE.Group();
  const rHullGeo = new THREE.BoxGeometry(1.2, 0.8, 4);
  const rHullMat = new THREE.MeshStandardMaterial({ color: 0xf97316 });
  disposables.push(rHullGeo, rHullMat);
  const rHull = new THREE.Mesh(rHullGeo, rHullMat);
  rescueGroup.add(rHull);
  
  rescueGroup.position.set(-15, 0, 15);
  group.add(rescueGroup);
  animatables.nsdRescue = rescueGroup;

  // 4. Drone
  const droneGroup = new THREE.Group();
  const dBodyGeo = new THREE.CylinderGeometry(0.5, 0.5, 0.2, 6);
  const dMat = new THREE.MeshBasicMaterial({ color: 0x22d3ee, wireframe: true });
  disposables.push(dBodyGeo, dMat);
  const dBody = new THREE.Mesh(dBodyGeo, dMat);
  droneGroup.add(dBody);
  
  // Spotlight
  const spotGeo = new THREE.ConeGeometry(0.1, 8, 16, 1, true);
  spotGeo.rotateX(-Math.PI / 2);
  spotGeo.translate(0, 0, 4); // Extend beam
  const spotMat = new THREE.MeshBasicMaterial({ color: 0x22d3ee, transparent: true, opacity: 0.1 });
  disposables.push(spotGeo, spotMat);
  const beam = new THREE.Mesh(spotGeo, spotMat);
  beam.rotation.x = Math.PI / 2; // Point down
  droneGroup.add(beam);

  droneGroup.position.set(0, 10, 0);
  group.add(droneGroup);
  animatables.nsdDrone = droneGroup;

  // 5. Exclusion Zone
  const zoneGroup = new THREE.Group();
  const zGeo = new THREE.RingGeometry(14.8, 15, 64);
  zGeo.rotateX(-Math.PI / 2);
  const zMat = new THREE.MeshBasicMaterial({ color: 0xef4444, transparent: true, opacity: 0.8, side: THREE.DoubleSide });
  disposables.push(zGeo, zMat);
  const zoneRing = new THREE.Mesh(zGeo, zMat);
  zoneGroup.add(zoneRing);
  
  // Wall
  const wallGeo = new THREE.CylinderGeometry(15, 15, 5, 32, 1, true);
  const wallMat = new THREE.MeshBasicMaterial({ color: 0xef4444, transparent: true, opacity: 0.05, side: THREE.DoubleSide });
  disposables.push(wallGeo, wallMat);
  const zoneWall = new THREE.Mesh(wallGeo, wallMat);
  zoneWall.position.y = 2.5;
  zoneGroup.add(zoneWall);

  zoneGroup.position.copy(targetGroup.position);
  group.add(zoneGroup);
  animatables.nsdZone = zoneGroup;
};

export const animateNavSafetyDeliveryScene = (type: SceneType, animatables: GeoAnimatables, time: number) => {
  if (type !== 'dd-nav-safety') return;

  // 1. Water Turbulence
  if (animatables.nsdWater) {
      const pos = animatables.nsdWater.geometry.attributes.position;
      for (let i = 0; i < pos.count; i++) {
           const x = pos.getX(i);
           const y = pos.getY(i); // Plane local coord
           const z = Math.sin(x * 0.5 + time) * Math.cos(y * 0.5 + time) * 0.5;
           pos.setZ(i, z);
      }
      pos.needsUpdate = true;
  }

  // 2. Rescue Boat Movement
  if (animatables.nsdRescue && animatables.nsdTarget) {
      // Lerp towards target
      const targetPos = animatables.nsdTarget.position.clone();
      // Stop at distance
      const dir = targetPos.clone().sub(animatables.nsdRescue.position).normalize();
      const dist = animatables.nsdRescue.position.distanceTo(targetPos);
      
      if (dist > 5) {
          animatables.nsdRescue.position.add(dir.multiplyScalar(0.05));
          animatables.nsdRescue.lookAt(targetPos);
      } else {
          // Circle around or stop
          animatables.nsdRescue.rotation.y += 0.01;
      }
      
      // Bobbing
      animatables.nsdRescue.position.y = Math.sin(time * 2) * 0.1;
      animatables.nsdRescue.rotation.z = Math.sin(time * 3) * 0.05;
  }

  // 3. Drone Orbit
  if (animatables.nsdDrone && animatables.nsdTarget) {
      const t = time * 0.5;
      const r = 8;
      animatables.nsdDrone.position.x = animatables.nsdTarget.position.x + Math.cos(t) * r;
      animatables.nsdDrone.position.z = animatables.nsdTarget.position.z + Math.sin(t) * r;
      
      // Look at target
      animatables.nsdDrone.lookAt(animatables.nsdTarget.position);
  }

  // 4. Signal Pulse
  if (animatables.nsdSignal) {
      const s = (time * 2) % 3;
      animatables.nsdSignal.scale.set(1 + s*2, 1 + s*2, 1);
      (animatables.nsdSignal.material as THREE.Material).opacity = 1 - (s/3);
  }

  // 5. Zone Pulse
  if (animatables.nsdZone) {
      ((animatables.nsdZone.children[0] as THREE.Mesh).material as THREE.Material).opacity = 0.5 + Math.sin(time * 5) * 0.2;
  }
};
