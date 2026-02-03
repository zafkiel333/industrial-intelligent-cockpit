
import * as THREE from 'three';
import { SimAnimatables } from './three-types';

export const initPortBridgeScene = (
  group: THREE.Group,
  animatables: SimAnimatables,
  disposables: { dispose: () => void }[]
) => {
  // 1. Environment & Lighting
  const ambient = new THREE.AmbientLight(0xffffff, 0.4);
  group.add(ambient);
  
  const moonLight = new THREE.DirectionalLight(0xa5f3fc, 0.8);
  moonLight.position.set(-20, 50, -20);
  group.add(moonLight);

  const fogColor = 0x050b1a;
  // Scene fog will be set in main component, here we create atmosphere
  
  // Water
  const waterGeo = new THREE.PlaneGeometry(120, 120, 64, 64);
  waterGeo.rotateX(-Math.PI / 2);
  const waterMat = new THREE.MeshStandardMaterial({ 
      color: 0x0c4a6e,
      roughness: 0.1,
      metalness: 0.8,
      transparent: true,
      opacity: 0.8
  });
  disposables.push(waterGeo, waterMat);
  const water = new THREE.Mesh(waterGeo, waterMat);
  water.position.y = -2;
  group.add(water);
  animatables.bridgeWater = water;

  // Grid
  const grid = new THREE.GridHelper(120, 40, 0x1e3a8a, 0x020617);
  grid.position.y = -1.9;
  group.add(grid);

  // 2. Bridge Structure (Cable Stayed)
  const bridgeGroup = new THREE.Group();
  group.add(bridgeGroup);
  animatables.bridgeStructure = bridgeGroup;

  // Pylons
  const pylonGeo = new THREE.BoxGeometry(4, 30, 4);
  const pylonMat = new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.9 });
  disposables.push(pylonGeo, pylonMat);

  const pylonL = new THREE.Mesh(pylonGeo, pylonMat);
  pylonL.position.set(-20, 13, 0);
  bridgeGroup.add(pylonL);

  const pylonR = new THREE.Mesh(pylonGeo, pylonMat);
  pylonR.position.set(20, 13, 0);
  bridgeGroup.add(pylonR);

  // Deck
  const deckGeo = new THREE.BoxGeometry(80, 2, 8);
  const deckMat = new THREE.MeshStandardMaterial({ color: 0x334155 });
  disposables.push(deckGeo, deckMat);
  const deck = new THREE.Mesh(deckGeo, deckMat);
  deck.position.set(0, 15, 0); // Bridge Height = 15m (underside) + 1m
  bridgeGroup.add(deck);

  // Cables
  const cableMat = new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.3 });
  disposables.push(cableMat);
  
  const createCables = (pylonX: number) => {
      for(let i=0; i<4; i++) {
          const pts = [
              new THREE.Vector3(pylonX, 28, 0), // Top of pylon
              new THREE.Vector3(pylonX > 0 ? pylonX - 5 - i*4 : pylonX + 5 + i*4, 15, 0) // Deck
          ];
          const geo = new THREE.BufferGeometry().setFromPoints(pts);
          disposables.push(geo);
          const line = new THREE.Line(geo, cableMat);
          bridgeGroup.add(line);
      }
  };
  createCables(-20);
  createCables(20);

  // Pier Protection / Warning Zones
  animatables.bridgePierZones = [];
  const zoneGeo = new THREE.CylinderGeometry(5, 5, 2, 16);
  const zoneMat = new THREE.MeshBasicMaterial({ color: 0xef4444, transparent: true, opacity: 0.2, wireframe: true });
  disposables.push(zoneGeo, zoneMat);
  
  [-20, 20].forEach(x => {
      const zone = new THREE.Mesh(zoneGeo, zoneMat.clone());
      zone.position.set(x, -1, 0);
      group.add(zone);
      animatables.bridgePierZones?.push(zone as unknown as THREE.Group);
  });

  // 3. Container Ship
  const shipGroup = new THREE.Group();
  animatables.bridgeShip = shipGroup;
  
  const hullGeo = new THREE.BoxGeometry(5, 3, 20);
  const hullMat = new THREE.MeshStandardMaterial({ color: 0x1e3a8a });
  disposables.push(hullGeo, hullMat);
  const hull = new THREE.Mesh(hullGeo, hullMat);
  hull.position.y = 0; // Waterline
  shipGroup.add(hull);

  // Cargo
  const cargoGeo = new THREE.BoxGeometry(4, 3, 15);
  const cargoMat = new THREE.MeshStandardMaterial({ color: 0xf97316 });
  disposables.push(cargoGeo, cargoMat);
  const cargo = new THREE.Mesh(cargoGeo, cargoMat);
  cargo.position.set(0, 3, 1);
  shipGroup.add(cargo);

  // Mast (Highest Point)
  const mastGeo = new THREE.CylinderGeometry(0.1, 0.1, 6);
  const mastMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
  disposables.push(mastGeo, mastMat);
  const mast = new THREE.Mesh(mastGeo, mastMat);
  mast.position.set(0, 6, -8); // Stern mast
  shipGroup.add(mast);

  shipGroup.position.set(0, 0, 40); // Approaching
  group.add(shipGroup);

  // 4. Scanner / Clearance Visuals
  const scannerGroup = new THREE.Group();
  group.add(scannerGroup);
  animatables.bridgeScanner = scannerGroup;

  // Vertical Laser Line (Clearance)
  const vLineGeo = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0,0,0), new THREE.Vector3(0,10,0)]);
  const vLineMat = new THREE.LineBasicMaterial({ color: 0x00ff00, linewidth: 2 });
  disposables.push(vLineGeo, vLineMat);
  const vLine = new THREE.Line(vLineGeo, vLineMat);
  scannerGroup.add(vLine);
  animatables.bridgeClearanceLine = vLine;

  // Laser Plane (Bridge Underside)
  const laserPlaneGeo = new THREE.PlaneGeometry(40, 2);
  laserPlaneGeo.rotateX(Math.PI / 2);
  const laserPlaneMat = new THREE.MeshBasicMaterial({ color: 0x22d3ee, transparent: true, opacity: 0.1, side: THREE.DoubleSide });
  disposables.push(laserPlaneGeo, laserPlaneMat);
  const laserPlane = new THREE.Mesh(laserPlaneGeo, laserPlaneMat);
  laserPlane.position.set(0, 14, 0); // Bridge clearance height
  group.add(laserPlane);

  // Wind Vector
  const dir = new THREE.Vector3(1, 0, 0);
  const origin = new THREE.Vector3(0, 10, 20);
  const arrowHelper = new THREE.ArrowHelper(dir, origin, 5, 0x3b82f6, 1, 1);
  group.add(arrowHelper);
  animatables.bridgeWindVector = arrowHelper;
};

export const animatePortBridgeScene = (animatables: SimAnimatables, time: number, simData: any) => {
    // simData: { tide: number, windSpeed: number, shipSpeed: number, airDraft: number }
    const tide = simData?.tide || 0; // -2 to 5m
    const wind = simData?.windSpeed || 0;
    const speed = simData?.shipSpeed || 5;
    const airDraft = simData?.airDraft || 10; // Max height from keel

    // 1. Water Level
    if (animatables.bridgeWater) {
        // Base -2. Tide adds to it.
        animatables.bridgeWater.position.y = -2 + tide;
    }

    // 2. Ship Movement
    if (animatables.bridgeShip) {
        // Reset if passed
        if (animatables.bridgeShip.position.z < -40) {
            animatables.bridgeShip.position.z = 40;
            animatables.bridgeShip.position.x = (Math.random()-0.5) * 10; // New approach lane
        }
        
        // Move Forward
        animatables.bridgeShip.position.z -= speed * 0.05;
        
        // Drift (Wind)
        // Wind pushes sideways.
        animatables.bridgeShip.position.x += wind * 0.005;
        // Yaw into wind slightly
        animatables.bridgeShip.rotation.y = wind * 0.01;

        // Bobbing (Tide affects draft visual relative to water)
        // Ship Y pos = Water Y + 0.5 (Draft)
        animatables.bridgeShip.position.y = -2 + tide + 0.5 + Math.sin(time)*0.1;

        // Update Mast Height visually
        // Mast is child. Default Y=6. Top is Y=9 (relative to ship origin).
        // Total Height from Keel (0 local) is 9.
        // We can scale cargo to simulate air draft change.
        // Let's assume airDraft input changes ship scale or mast pos.
        // For simplicity, just use input airDraft to drive logic, visuals stay roughly constant container ship.
    }

    // 3. Scanner / Clearance Line
    if (animatables.bridgeClearanceLine && animatables.bridgeShip) {
        // Line connects highest point of ship to bridge deck
        const shipPos = animatables.bridgeShip.position.clone();
        // Top of mast in world space:
        // Ship origin Y is water level + 0.5. Mast top is +9.
        // World Y = ShipY + 9.
        // Bridge Deck Underside Y = 14.
        
        const shipTopY = shipPos.y + 9;
        const bridgeY = 14;
        
        const line = animatables.bridgeClearanceLine;
        const posAttr = line.geometry.attributes.position;
        
        // Start at ship top
        posAttr.setXYZ(0, shipPos.x, shipTopY, shipPos.z);
        // End at bridge height (same X,Z)
        posAttr.setXYZ(1, shipPos.x, bridgeY, shipPos.z);
        posAttr.needsUpdate = true;
        
        // Color based on clearance
        const clearance = bridgeY - shipTopY;
        const mat = line.material as THREE.LineBasicMaterial;
        if (clearance < 0) mat.color.setHex(0xff0000); // Collision
        else if (clearance < 2) mat.color.setHex(0xfacc15); // Warning
        else mat.color.setHex(0x00ff00); // Safe

        // Show line only when near bridge
        line.visible = Math.abs(shipPos.z) < 10;
    }

    // 4. Pier Warning Zones
    if (animatables.bridgePierZones && animatables.bridgeShip) {
        const shipX = animatables.bridgeShip.position.x;
        const shipZ = animatables.bridgeShip.position.z;
        
        animatables.bridgePierZones.forEach(zone => {
            const pierX = zone.position.x;
            const dist = Math.sqrt(Math.pow(shipX - pierX, 2) + Math.pow(shipZ - zone.position.z, 2));
            
            const mat = (zone as unknown as THREE.Mesh).material as THREE.MeshBasicMaterial;
            if (dist < 8) { // Near pier
                mat.opacity = 0.6 + Math.sin(time*10)*0.2; // Flash
                mat.color.setHex(0xff0000);
            } else {
                mat.opacity = 0.2;
                mat.color.setHex(0xef4444);
            }
        });
    }

    // 5. Wind Vector
    if (animatables.bridgeWindVector) {
        animatables.bridgeWindVector.setLength(wind * 2, 1, 0.5);
    }
};