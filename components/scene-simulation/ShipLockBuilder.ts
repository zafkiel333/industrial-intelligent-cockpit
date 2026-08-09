
import * as THREE from 'three';
import { SimAnimatables } from './three-types';

export const initShipLockScene = (
  group: THREE.Group,
  animatables: SimAnimatables,
  disposables: { dispose: () => void }[]
) => {
  // 1. Lighting
  const ambient = new THREE.AmbientLight(0xffffff, 0.4);
  group.add(ambient);
  const dirLight = new THREE.DirectionalLight(0xffffff, 1);
  dirLight.position.set(-10, 20, 10);
  group.add(dirLight);

  // 2. Lock Structure (Concrete Chamber)
  const wallMat = new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.8 });
  disposables.push(wallMat);

  // Chamber dimensions: Length 60, Width 12, Depth 10
  const wallLength = 60;
  const wallHeight = 10;
  const wallThick = 2;
  const chamberWidth = 12;

  const wallGeo = new THREE.BoxGeometry(wallThick, wallHeight, wallLength);
  disposables.push(wallGeo);
  
  // Left Wall
  const wallL = new THREE.Mesh(wallGeo, wallMat);
  wallL.position.set(-chamberWidth/2 - wallThick/2, 0, 0);
  group.add(wallL);

  // Right Wall
  const wallR = new THREE.Mesh(wallGeo, wallMat);
  wallR.position.set(chamberWidth/2 + wallThick/2, 0, 0);
  group.add(wallR);

  // Floor
  const floorGeo = new THREE.BoxGeometry(chamberWidth + wallThick*2, 1, wallLength + 40); // Extended
  disposables.push(floorGeo);
  const floor = new THREE.Mesh(floorGeo, wallMat);
  floor.position.set(0, -5, 0); // Bottom
  group.add(floor);

  // 3. Gates (Miter Gates)
  const gateW = chamberWidth / 2 + 0.5;
  const gateH = 8;
  const gateGeo = new THREE.BoxGeometry(gateW, gateH, 1);
  const gateMat = new THREE.MeshStandardMaterial({ color: 0xf97316 }); // Safety Orange
  disposables.push(gateGeo, gateMat);

  // Helper to create gate pair
  const createGatePair = (zPos: number) => {
      const gGroup = new THREE.Group();
      gGroup.position.set(0, 0, zPos);
      
      // Left Leaf
      const leftPivot = new THREE.Group();
      leftPivot.position.set(-chamberWidth/2, -1, 0); // Pivot at wall
      const leftMesh = new THREE.Mesh(gateGeo, gateMat);
      leftMesh.position.set(gateW/2, 0, 0); // Offset geometry
      leftPivot.add(leftMesh);
      gGroup.add(leftPivot);

      // Right Leaf
      const rightPivot = new THREE.Group();
      rightPivot.position.set(chamberWidth/2, -1, 0);
      const rightMesh = new THREE.Mesh(gateGeo, gateMat);
      rightMesh.position.set(-gateW/2, 0, 0);
      rightPivot.add(rightMesh);
      gGroup.add(rightPivot);

      group.add(gGroup);
      return gGroup;
  };

  animatables.slGatesUpper = createGatePair(-30); // Upstream
  animatables.slGatesLower = createGatePair(30);  // Downstream

  // 4. Water Levels
  const waterGeo = new THREE.PlaneGeometry(chamberWidth, wallLength);
  waterGeo.rotateX(-Math.PI / 2);
  const waterMat = new THREE.MeshPhysicalMaterial({ 
      color: 0x06b6d4, 
      transparent: true, 
      opacity: 0.8,
      metalness: 0.1,
      roughness: 0.1,
      transmission: 0.5
  });
  disposables.push(waterGeo, waterMat);

  // Chamber Water (Dynamic)
  const chamberWater = new THREE.Mesh(waterGeo, waterMat);
  chamberWater.position.y = -2; // Mid level
  group.add(chamberWater);
  animatables.slChamberWater = chamberWater;

  // Upstream Water (Static High)
  const extWaterGeo = new THREE.PlaneGeometry(chamberWidth + 20, 40);
  extWaterGeo.rotateX(-Math.PI / 2);
  disposables.push(extWaterGeo);
  
  const upWater = new THREE.Mesh(extWaterGeo, waterMat);
  upWater.position.set(0, 3, -50); // High level (y=3)
  group.add(upWater);

  // Downstream Water (Static Low)
  const downWater = new THREE.Mesh(extWaterGeo, waterMat);
  downWater.position.set(0, -3, 50); // Low level (y=-3)
  group.add(downWater);

  // 5. Traffic Lights
  animatables.slLights = [];
  const lightGeo = new THREE.SphereGeometry(0.5);
  const lightMat = new THREE.MeshBasicMaterial({ color: 0xff0000 }); // Red default
  disposables.push(lightGeo, lightMat);

  // Entry Signal (Upstream)
  const l1 = new THREE.Mesh(lightGeo, lightMat.clone());
  l1.position.set(-8, 6, -32);
  group.add(l1);
  const pl1 = new THREE.PointLight(0xff0000, 1, 10);
  l1.add(pl1);
  animatables.slLights.push(pl1);

  // Exit Signal (Downstream)
  const l2 = new THREE.Mesh(lightGeo, lightMat.clone());
  l2.position.set(-8, 6, 28);
  group.add(l2);
  const pl2 = new THREE.PointLight(0xff0000, 1, 10);
  l2.add(pl2);
  animatables.slLights.push(pl2);

  // 6. Ships Group (Pool)
  animatables.slShips = [];
  const shipGeo = new THREE.BoxGeometry(4, 3, 12);
  const shipMat = new THREE.MeshStandardMaterial({ color: 0xffffff });
  disposables.push(shipGeo, shipMat);

  // Create a few reusable ship meshes (hidden initially)
  for(let i=0; i<3; i++) {
      const sGroup = new THREE.Group();
      const hull = new THREE.Mesh(shipGeo, shipMat);
      hull.position.y = 1.5;
      sGroup.add(hull);
      
      // Deck
      const deck = new THREE.Mesh(new THREE.BoxGeometry(3, 1, 2), new THREE.MeshStandardMaterial({color: 0x3b82f6}));
      deck.position.set(0, 3.5, 3);
      sGroup.add(deck);

      sGroup.position.set(0, -100, 0); // Hide
      group.add(sGroup);
      animatables.slShips.push(sGroup);
  }

  // 7. Culvert Valves (Visual indicators on wall)
  const valveGeo = new THREE.CylinderGeometry(0.5, 0.5, 1, 16);
  valveGeo.rotateZ(Math.PI/2);
  const valveMat = new THREE.MeshBasicMaterial({ color: 0xffff00 });
  disposables.push(valveGeo, valveMat);
  
  const valveL = new THREE.Mesh(valveGeo, valveMat);
  valveL.position.set(-7, -4, 0);
  group.add(valveL);
  
  const valveR = new THREE.Mesh(valveGeo, valveMat);
  valveR.position.set(7, -4, 0);
  group.add(valveR);
  
  animatables.slValves = [valveL as unknown as THREE.Group, valveR as unknown as THREE.Group];
};

export const animateShipLockScene = (animatables: SimAnimatables, time: number, simData: any) => {
    // simData: { 
    //   phase: 'IDLE'|'FILLING'|'EMPTYING'|'ENTRY'|'EXIT', 
    //   waterLevel: 0-1 (normalized),
    //   shipPos: 0-100 (z position approx),
    //   gateAngle: 0-1 (normalized open)
    // }
    
    const phase = simData?.phase || 'IDLE';
    const levelNorm = simData?.waterLevel || 0; // 0 = Low (-3), 1 = High (+3)
    const shipZ = simData?.shipPos || -50;
    const gateOpen = simData?.gateAngle || 0;

    // 1. Water Level
    if (animatables.slChamberWater) {
        const y = -3 + levelNorm * 6;
        animatables.slChamberWater.position.y = y;
    }

    // 2. Gates Animation
    const openAngle = Math.PI / 4;
    // Upstream Gate
    if (animatables.slGatesUpper) {
        // Open if Entry phase
        const angle = (phase === 'ENTRY' || (phase === 'IDLE' && levelNorm > 0.9)) ? openAngle * gateOpen : 0;
        animatables.slGatesUpper.children[0].rotation.y = -angle;
        animatables.slGatesUpper.children[1].rotation.y = angle;
    }
    // Downstream Gate
    if (animatables.slGatesLower) {
        const angle = (phase === 'EXIT' || (phase === 'IDLE' && levelNorm < 0.1)) ? openAngle * gateOpen : 0;
        animatables.slGatesLower.children[0].rotation.y = angle; // Inverse for downstream direction visual?
        // Actually miter gates point upstream. Downstream gate points into chamber.
        // Rotation logic: Open outwards or inwards? Usually recess into wall.
        animatables.slGatesLower.children[0].rotation.y = -angle;
        animatables.slGatesLower.children[1].rotation.y = angle;
    }

    // 3. Traffic Lights
    if (animatables.slLights) {
        // Upstream Light (Idx 0)
        const l1 = animatables.slLights[0];
        const m1 = l1.parent as THREE.Mesh;
        if (phase === 'ENTRY' && gateOpen > 0.8) {
             l1.color.setHex(0x00ff00);
             (m1.material as THREE.MeshBasicMaterial).color.setHex(0x00ff00);
        } else {
             l1.color.setHex(0xff0000);
             (m1.material as THREE.MeshBasicMaterial).color.setHex(0xff0000);
        }

        // Downstream Light (Idx 1) - Logic for exit
        // Actually exit light is inside chamber usually? 
        // For simplicity: Downstream light allows entry from downstream?
        // Let's assume this is one-way sim: Up -> Down.
        // So Exit light green when EXIT phase
        const l2 = animatables.slLights[1];
        const m2 = l2.parent as THREE.Mesh;
        if (phase === 'EXIT' && gateOpen > 0.8) {
             l2.color.setHex(0x00ff00); // Green
             (m2.material as THREE.MeshBasicMaterial).color.setHex(0x00ff00);
        } else {
             l2.color.setHex(0xff0000);
             (m2.material as THREE.MeshBasicMaterial).color.setHex(0xff0000);
        }
    }

    // 4. Ship Movement
    if (animatables.slShips && animatables.slShips.length > 0) {
        const ship = animatables.slShips[0];
        
        // Visibility based on range
        if (shipZ > -80 && shipZ < 80) {
             ship.visible = true;
             ship.position.z = shipZ;
             
             // Y position depends on location
             // If in chamber (-30 to 30), follow chamber level
             // If upstream (< -30), high level (+3)
             // If downstream (> 30), low level (-3)
             
             let shipY = 0;
             if (shipZ < -30) shipY = 3;
             else if (shipZ > 30) shipY = -3;
             else {
                 shipY = -3 + levelNorm * 6;
             }
             
             // Smooth transition at thresholds is handled by physics engine but here visuals snap is ok or lerp
             ship.position.y = shipY + 1; // +1 draft
        } else {
             ship.visible = false;
        }
    }
    
    // 5. Valves
    if (animatables.slValves) {
        const active = phase === 'FILLING' || phase === 'EMPTYING';
        animatables.slValves.forEach(v => {
            if (active) {
                v.rotation.x += 0.2; // Spin indicator
                (v as unknown as THREE.Mesh).material = new THREE.MeshBasicMaterial({color: 0x00ff00});
            } else {
                (v as unknown as THREE.Mesh).material = new THREE.MeshBasicMaterial({color: 0xffff00});
            }
        });
    }
};
