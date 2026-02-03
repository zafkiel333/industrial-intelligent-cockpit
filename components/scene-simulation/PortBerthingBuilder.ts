
import * as THREE from 'three';
import { SimAnimatables } from './three-types';

export const initPortBerthingScene = (
  group: THREE.Group,
  animatables: SimAnimatables,
  disposables: { dispose: () => void }[]
) => {
  // 1. Lighting (Night/Dusk for contrast)
  const ambient = new THREE.AmbientLight(0xffffff, 0.4);
  group.add(ambient);
  const moon = new THREE.DirectionalLight(0xa5f3fc, 0.8);
  moon.position.set(-10, 30, -20);
  group.add(moon);
  
  // Terminal Lighting
  const spot = new THREE.SpotLight(0xffaa00, 2, 60, 0.5, 0.5);
  spot.position.set(20, 20, 0); // On quay
  spot.lookAt(0, 0, 0);
  group.add(spot);

  // 2. Water Surface
  const waterGeo = new THREE.PlaneGeometry(80, 80, 64, 64);
  waterGeo.rotateX(-Math.PI / 2);
  const waterMat = new THREE.MeshStandardMaterial({ 
      color: 0x0f172a, 
      roughness: 0.1, 
      metalness: 0.8,
      transparent: true,
      opacity: 0.9
  });
  disposables.push(waterGeo, waterMat);
  const water = new THREE.Mesh(waterGeo, waterMat);
  water.position.y = -1;
  group.add(water);
  animatables.pbWater = water;

  // 3. Quay Wall (Dock)
  const quayGroup = new THREE.Group();
  quayGroup.position.set(25, 0, 0); // Right side
  group.add(quayGroup);
  animatables.pbQuay = quayGroup;

  const wallGeo = new THREE.BoxGeometry(10, 5, 80);
  const wallMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.9 });
  disposables.push(wallGeo, wallMat);
  const wall = new THREE.Mesh(wallGeo, wallMat);
  wall.position.y = 1.5;
  quayGroup.add(wall);

  // Fenders (Cylindrical bumpers)
  animatables.pbFenders = [];
  const fenGeo = new THREE.CylinderGeometry(0.8, 0.8, 2, 16);
  fenGeo.rotateZ(Math.PI / 2);
  const fenMat = new THREE.MeshStandardMaterial({ color: 0x111111 });
  disposables.push(fenGeo, fenMat);

  for(let z=-30; z<=30; z+=10) {
      const fenderGroup = new THREE.Group();
      fenderGroup.position.set(-5, 1, z); // Protrude from wall
      const mesh = new THREE.Mesh(fenGeo, fenMat);
      fenderGroup.add(mesh);
      
      // Impact plate
      const plate = new THREE.Mesh(new THREE.BoxGeometry(0.2, 2.5, 2.5), new THREE.MeshStandardMaterial({color: 0x333}));
      plate.position.x = -1;
      fenderGroup.add(plate);

      quayGroup.add(fenderGroup);
      animatables.pbFenders.push(fenderGroup);
  }

  // 4. Large Ship
  const shipGroup = new THREE.Group();
  shipGroup.position.set(-10, 0, 0); // Approaching
  group.add(shipGroup);
  animatables.pbShip = shipGroup;

  const hullGeo = new THREE.BoxGeometry(8, 5, 40);
  const hullMat = new THREE.MeshStandardMaterial({ color: 0xef4444 }); // Red Hull
  disposables.push(hullGeo, hullMat);
  const hull = new THREE.Mesh(hullGeo, hullMat);
  hull.position.y = 1.5;
  shipGroup.add(hull);

  const deckGeo = new THREE.BoxGeometry(8.2, 1, 40.2);
  const deckMat = new THREE.MeshStandardMaterial({ color: 0x334155 });
  disposables.push(deckGeo, deckMat);
  const deck = new THREE.Mesh(deckGeo, deckMat);
  deck.position.y = 4.0;
  shipGroup.add(deck);

  const bridgeGeo = new THREE.BoxGeometry(8, 4, 5);
  const bridgeMat = new THREE.MeshStandardMaterial({ color: 0xffffff });
  disposables.push(bridgeGeo, bridgeMat);
  const bridge = new THREE.Mesh(bridgeGeo, bridgeMat);
  bridge.position.set(0, 6, -15); // Stern
  shipGroup.add(bridge);

  // 5. Tugboats
  animatables.pbTugs = [];
  animatables.pbForceVectors = [];

  const tugGeo = new THREE.BoxGeometry(3, 2, 6);
  const tugMat = new THREE.MeshStandardMaterial({ color: 0xfacc15 }); // Yellow
  disposables.push(tugGeo, tugMat);

  // Tug 1 (Bow Pushing)
  const tug1 = new THREE.Group();
  const t1Mesh = new THREE.Mesh(tugGeo, tugMat);
  t1Mesh.position.y = 0.5;
  tug1.add(t1Mesh);
  tug1.position.set(5, 0, 15); // Near bow (ship length 40, so bow at +20)
  // Initially separate, will attach visually in logic
  shipGroup.add(tug1); // Parent to ship for easier relative pos
  animatables.pbTugs.push(tug1);

  // Vector Arrow 1
  const dir1 = new THREE.Vector3(1, 0, 0); // Pushing right
  const arrow1 = new THREE.ArrowHelper(dir1, new THREE.Vector3(0,0,0), 5, 0x22c55e, 1.5, 1);
  tug1.add(arrow1);
  animatables.pbForceVectors.push(arrow1);

  // Tug 2 (Stern Pushing)
  const tug2 = new THREE.Group();
  const t2Mesh = new THREE.Mesh(tugGeo, tugMat);
  t2Mesh.position.y = 0.5;
  tug2.add(t2Mesh);
  tug2.position.set(5, 0, -12); // Near stern
  shipGroup.add(tug2);
  animatables.pbTugs.push(tug2);

  // Vector Arrow 2
  const arrow2 = new THREE.ArrowHelper(dir1, new THREE.Vector3(0,0,0), 5, 0x22c55e, 1.5, 1);
  tug2.add(arrow2);
  animatables.pbForceVectors.push(arrow2);

  // 6. Laser Distance Lines
  animatables.pbDistLines = [];
  const lineMat = new THREE.LineDashedMaterial({ 
      color: 0xef4444, 
      dashSize: 1, 
      gapSize: 0.5, 
      transparent: true 
  });
  disposables.push(lineMat);

  // Bow Laser
  const bPoints = [new THREE.Vector3(0,0,0), new THREE.Vector3(10,0,0)];
  const bGeo = new THREE.BufferGeometry().setFromPoints(bPoints);
  const bLine = new THREE.Line(bGeo, lineMat);
  bLine.computeLineDistances();
  group.add(bLine); // World space line
  animatables.pbDistLines.push(bLine);
  
  // Stern Laser
  const sPoints = [new THREE.Vector3(0,0,0), new THREE.Vector3(10,0,0)];
  const sGeo = new THREE.BufferGeometry().setFromPoints(sPoints);
  const sLine = new THREE.Line(sGeo, lineMat.clone());
  sLine.computeLineDistances();
  group.add(sLine);
  animatables.pbDistLines.push(sLine);
};

export const animatePortBerthingScene = (animatables: SimAnimatables, time: number, simData: any) => {
    // simData: { 
    //   shipDist: number, shipAngle: number, 
    //   tug1Force: number (0-100), tug2Force: number,
    //   speedBow: number, speedStern: number 
    // }
    
    const dist = simData?.shipDist ?? 10; // Meters from quay
    const angle = (simData?.shipAngle || 0) * Math.PI / 180; // Radians
    const t1Force = simData?.tug1Force || 0;
    const t2Force = simData?.tug2Force || 0;
    
    // 1. Ship Position
    // Quay face is at X = 20. Fenders protrude ~1m. Docking face ~19.
    // Ship Right Side is at shipX + 4.
    // So if shipX = 10, Right side = 14. Dist to 19 is 5.
    // Dist = 19 - (shipX + 4) = 15 - shipX.
    // shipX = 15 - Dist.
    const shipX = 15 - dist;
    
    if (animatables.pbShip) {
        animatables.pbShip.position.x = shipX;
        animatables.pbShip.rotation.y = angle; // Yaw
        
        // Bobbing
        animatables.pbShip.position.y = Math.sin(time) * 0.1;
    }

    // 2. Tug Vectors
    if (animatables.pbForceVectors && animatables.pbForceVectors.length >= 2) {
        // Tug 1 (Bow)
        const v1 = animatables.pbForceVectors[0];
        const s1 = t1Force / 20; // Scale
        v1.setLength(Math.max(0.1, s1), 1, 0.5);
        // Color based on force
        if (t1Force > 80) v1.setColor(0xff0000);
        else v1.setColor(0x22c55e);

        // Tug 2 (Stern)
        const v2 = animatables.pbForceVectors[1];
        const s2 = t2Force / 20;
        v2.setLength(Math.max(0.1, s2), 1, 0.5);
        if (t2Force > 80) v2.setColor(0xff0000);
        else v2.setColor(0x22c55e);
    }

    // 3. Laser Lines Update
    if (animatables.pbDistLines && animatables.pbShip) {
        // Quay sensors at roughly z=15 (Bow) and z=-12 (Stern)
        // Or matched to ship sensor positions. Let's assume sensors on Quay looking at ship.
        const quayX = 19; // Face of fenders
        
        // Bow Laser
        const bowZ = 15;
        // Ship side at Z=15 (local). 
        // Need world position of ship's starboard side at local Z=15.
        // Ship Group matrix needed.
        const shipObj = animatables.pbShip;
        
        // Simple calc assuming small angle
        // Ship Side X at Z_local = (15 - Dist) + 4 (half width).
        // Rotated: X_world = X_pos + 4*cos(ang) + Z_local*sin(ang) ... approx
        
        const bowLine = animatables.pbDistLines[0];
        const posAttrB = bowLine.geometry.attributes.position;
        posAttrB.setXYZ(0, quayX, 2, bowZ); // Quay point
        // Raycast to ship ideally, or simple math:
        // Ship center X = 15 - dist.
        // Starboard X = (15 - dist) + 4.
        const shipSideX = (15 - dist) + 4; // Simplified
        posAttrB.setXYZ(1, shipSideX, 2, bowZ); // Ship point
        posAttrB.needsUpdate = true;

        // Stern Laser
        const sternZ = -12;
        const sternLine = animatables.pbDistLines[1];
        const posAttrS = sternLine.geometry.attributes.position;
        posAttrS.setXYZ(0, quayX, 2, sternZ);
        // Angled ship:
        // Center X is same. Z offset effects X if rotated.
        // dx = z_local * sin(angle)
        const rotOffset = sternZ * Math.sin(angle);
        const sternSideX = shipSideX + rotOffset; 
        
        posAttrS.setXYZ(1, sternSideX, 2, sternZ);
        posAttrS.needsUpdate = true;
    }

    // 4. Fenders Compression
    if (animatables.pbFenders) {
        animatables.pbFenders.forEach(f => {
            // Check if ship touching
            // Ship starboard X approx 14 (if dist=1). Fender face ~19.
            // If dist < 0.5, compress.
            if (dist < 0.5) {
                // Squeeze
                f.scale.x = 0.5 + dist; // 0.5 min scale
                // Red if high impact
                (f.children[0] as THREE.Mesh).material = new THREE.MeshStandardMaterial({color: 0xef4444});
            } else {
                f.scale.x = 1;
                (f.children[0] as THREE.Mesh).material = new THREE.MeshStandardMaterial({color: 0x111111});
            }
        });
    }
};
