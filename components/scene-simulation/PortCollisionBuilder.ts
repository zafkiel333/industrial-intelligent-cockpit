
import * as THREE from 'three';
import { SimAnimatables } from './three-types';

export const initPortCollisionScene = (
  group: THREE.Group,
  animatables: SimAnimatables,
  disposables: { dispose: () => void }[]
) => {
  // 1. Lighting (Moonlight/Night Ops feel)
  const ambient = new THREE.AmbientLight(0xffffff, 0.4);
  group.add(ambient);
  const moon = new THREE.DirectionalLight(0xa5f3fc, 0.8);
  moon.position.set(-20, 40, -20);
  group.add(moon);
  
  // 2. Water Surface
  const waterGeo = new THREE.PlaneGeometry(200, 200, 64, 64);
  waterGeo.rotateX(-Math.PI / 2);
  const waterMat = new THREE.MeshStandardMaterial({ 
      color: 0x0f172a, // Dark Ocean
      roughness: 0.1, 
      metalness: 0.8,
      transparent: true, 
      opacity: 0.8
  });
  disposables.push(waterGeo, waterMat);
  const water = new THREE.Mesh(waterGeo, waterMat);
  group.add(water);
  animatables.pcWater = water;

  // Grid for Reference
  const grid = new THREE.GridHelper(200, 40, 0x1e3a8a, 0x020617);
  grid.position.y = 0.5;
  group.add(grid);

  // 3. Shoal / Shallow Water Hazard
  const shoalGeo = new THREE.SphereGeometry(15, 32, 16, 0, Math.PI * 2, 0, Math.PI * 0.3);
  shoalGeo.scale(2, 0.5, 1.5);
  const shoalMat = new THREE.MeshBasicMaterial({ 
      color: 0xf97316, 
      wireframe: true,
      transparent: true,
      opacity: 0.3
  });
  disposables.push(shoalGeo, shoalMat);
  const shoal = new THREE.Mesh(shoalGeo, shoalMat);
  shoal.position.set(30, -5, -30); // Location of hazard
  group.add(shoal);
  animatables.pcShoal = shoal;
  
  // Shoal Label (Beacon)
  const beaconGeo = new THREE.CylinderGeometry(0.2, 0.2, 5);
  const beaconMat = new THREE.MeshBasicMaterial({ color: 0x000000 });
  disposables.push(beaconGeo, beaconMat);
  const beacon = new THREE.Mesh(beaconGeo, beaconMat);
  beacon.position.set(30, 2.5, -30);
  group.add(beacon);
  const light = new THREE.PointLight(0xff0000, 2, 20);
  light.position.y = 2.5;
  beacon.add(light);

  // 4. Ships
  const shipGeo = new THREE.ConeGeometry(2, 8, 4);
  shipGeo.rotateX(Math.PI / 2); // Point Z
  const ownShipMat = new THREE.MeshStandardMaterial({ color: 0x3b82f6 }); // Blue
  const targetShipMat = new THREE.MeshStandardMaterial({ color: 0xef4444 }); // Red
  disposables.push(shipGeo, ownShipMat, targetShipMat);

  // Own Ship
  const ownShipGroup = new THREE.Group();
  const osMesh = new THREE.Mesh(shipGeo, ownShipMat);
  osMesh.position.y = 1;
  ownShipGroup.add(osMesh);
  group.add(ownShipGroup);
  animatables.pcOwnShip = ownShipGroup;

  // Target Ship
  const targetShipGroup = new THREE.Group();
  const tsMesh = new THREE.Mesh(shipGeo, targetShipMat);
  tsMesh.position.y = 1;
  targetShipGroup.add(tsMesh);
  group.add(targetShipGroup);
  animatables.pcTargetShip = targetShipGroup;

  // 5. Safety Domains (Rings)
  animatables.pcSafetyDomains = [];
  const ringGeo = new THREE.RingGeometry(8, 8.5, 32);
  ringGeo.rotateX(-Math.PI / 2);
  const ringMat = new THREE.MeshBasicMaterial({ color: 0x22c55e, transparent: true, opacity: 0.5, side: THREE.DoubleSide });
  disposables.push(ringGeo, ringMat);

  const osRing = new THREE.Mesh(ringGeo, ringMat.clone());
  ownShipGroup.add(osRing);
  animatables.pcSafetyDomains.push(osRing);

  const tsRing = new THREE.Mesh(ringGeo, ringMat.clone());
  targetShipGroup.add(tsRing);
  animatables.pcSafetyDomains.push(tsRing);

  // 6. Trajectory Lines
  animatables.pcTrajectories = [];
  const lineMat = new THREE.LineDashedMaterial({ color: 0xffffff, dashSize: 2, gapSize: 1, transparent: true, opacity: 0.5 });
  disposables.push(lineMat);
  
  // Own Ship Path
  const lineGeo1 = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0,0,0), new THREE.Vector3(0,0,50)]);
  const line1 = new THREE.Line(lineGeo1, lineMat.clone());
  line1.computeLineDistances();
  ownShipGroup.add(line1);
  animatables.pcTrajectories.push(line1);

  // Target Ship Path
  const lineGeo2 = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0,0,0), new THREE.Vector3(0,0,50)]);
  const line2 = new THREE.Line(lineGeo2, lineMat.clone());
  line2.computeLineDistances();
  targetShipGroup.add(line2);
  animatables.pcTrajectories.push(line2);

  // 7. Collision Marker (Explosion/Impact Icon)
  const impactGroup = new THREE.Group();
  const starGeo = new THREE.OctahedronGeometry(2);
  const starMat = new THREE.MeshBasicMaterial({ color: 0xffaa00, wireframe: true });
  disposables.push(starGeo, starMat);
  const star = new THREE.Mesh(starGeo, starMat);
  impactGroup.add(star);
  impactGroup.visible = false;
  group.add(impactGroup);
  animatables.pcCollisionMarker = impactGroup;
};

export const animatePortCollisionScene = (animatables: SimAnimatables, time: number, simData: any) => {
    // simData: { 
    //   ownSpeed: number (kn), ownHeading: number (deg), 
    //   targetSpeed: number, targetHeading: number, 
    //   simTime: number (0-60s loop usually) 
    // }
    
    // We simulate movement over a loop to show potential collision
    // reset every 10 seconds or based on provided simTime
    const t = (time * 0.5) % 20; // 20s loop
    
    // Start Positions
    const osStart = new THREE.Vector3(-30, 0, -30);
    const tsStart = new THREE.Vector3(30, 0, 0); // Target starts right

    // Velocities (scaled for viz)
    // Heading 0 = North (-Z), 90 = East (+X).
    // Convert Deg to Rad. 0 deg -> vector(0, -1). 90 deg -> vector(1, 0).
    const degToRad = (deg: number) => (deg) * Math.PI / 180;
    
    const osHead = simData?.ownHeading || 45; 
    const osSpd = (simData?.ownSpeed || 10) * 0.1;
    const osVel = new THREE.Vector3(Math.sin(degToRad(osHead)), 0, -Math.cos(degToRad(osHead))).multiplyScalar(osSpd);

    const tsHead = simData?.targetHeading || 315;
    const tsSpd = (simData?.targetSpeed || 10) * 0.1;
    const tsVel = new THREE.Vector3(Math.sin(degToRad(tsHead)), 0, -Math.cos(degToRad(tsHead))).multiplyScalar(tsSpd);

    // Current Positions
    const osPos = osStart.clone().add(osVel.clone().multiplyScalar(t * 10)); // Speed up time
    const tsPos = tsStart.clone().add(tsVel.clone().multiplyScalar(t * 10));

    // Update Mesh Positions
    if (animatables.pcOwnShip) {
        animatables.pcOwnShip.position.copy(osPos);
        animatables.pcOwnShip.rotation.y = -degToRad(osHead) + Math.PI; // Look dir
    }
    if (animatables.pcTargetShip) {
        animatables.pcTargetShip.position.copy(tsPos);
        animatables.pcTargetShip.rotation.y = -degToRad(tsHead) + Math.PI;
    }

    // Distance Check
    const dist = osPos.distanceTo(tsPos);
    const collisionThreshold = 5;
    const nearMissThreshold = 15;

    // Update Safety Domains Color
    if (animatables.pcSafetyDomains) {
        const osRing = animatables.pcSafetyDomains[0];
        const tsRing = animatables.pcSafetyDomains[1];
        const color = dist < collisionThreshold ? 0xff0000 : dist < nearMissThreshold ? 0xfacc15 : 0x22c55e;
        
        (osRing.material as THREE.MeshBasicMaterial).color.setHex(color);
        (tsRing.material as THREE.MeshBasicMaterial).color.setHex(color);
        
        // Pulse if near
        if (dist < nearMissThreshold) {
             const s = 1 + Math.sin(time * 10) * 0.1;
             osRing.scale.set(s, s, 1);
             tsRing.scale.set(s, s, 1);
        } else {
             osRing.scale.set(1, 1, 1);
             tsRing.scale.set(1, 1, 1);
        }
    }

    // Collision Marker
    if (animatables.pcCollisionMarker) {
        if (dist < collisionThreshold) {
            animatables.pcCollisionMarker.visible = true;
            // Midpoint
            const mid = osPos.clone().add(tsPos).multiplyScalar(0.5);
            animatables.pcCollisionMarker.position.copy(mid);
            animatables.pcCollisionMarker.position.y = 2;
            animatables.pcCollisionMarker.scale.setScalar(1 + Math.sin(time * 20));
        } else {
            animatables.pcCollisionMarker.visible = false;
        }
    }

    // Grounding Check (Shoal at 30, -30)
    // Shoal radius ~15
    const shoalPos = new THREE.Vector3(30, 0, -30);
    const distToShoal = osPos.distanceTo(shoalPos);
    
    if (distToShoal < 15) {
        // Squat visual: Lower ship
        // Depth is limited here.
        if (animatables.pcOwnShip) {
            animatables.pcOwnShip.children[0].position.y = 1 - (15 - distToShoal) * 0.05; // Sink
            // Tilt if grounded
            if (distToShoal < 10) {
                 animatables.pcOwnShip.rotation.z = Math.sin(time * 5) * 0.1; // Stuck rocking
                 (animatables.pcOwnShip.children[0] as THREE.Mesh).material = new THREE.MeshStandardMaterial({color: 0xff0000}); // Visual alarm
            }
        }
    } else {
         if (animatables.pcOwnShip) {
             animatables.pcOwnShip.children[0].position.y = 1;
             (animatables.pcOwnShip.children[0] as THREE.Mesh).material = new THREE.MeshStandardMaterial({color: 0x3b82f6});
         }
    }

    // Animate Water
    if (animatables.pcWater) {
        // animatables.pcWater.material.map.offset... if textured
        // Simple bobbing handled by shader usually, or just static trans here
    }
};
