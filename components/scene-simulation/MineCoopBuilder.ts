
import * as THREE from 'three';
import { SimAnimatables } from './three-types';

export const initMineCoopScene = (
  group: THREE.Group,
  animatables: SimAnimatables,
  disposables: { dispose: () => void }[]
) => {
  // 1. Environment (Loading Pad)
  const groundGeo = new THREE.CircleGeometry(30, 64);
  groundGeo.rotateX(-Math.PI / 2);
  const groundMat = new THREE.MeshStandardMaterial({ 
      color: 0x27272a, 
      roughness: 0.9,
      metalness: 0.1 
  });
  disposables.push(groundGeo, groundMat);
  const ground = new THREE.Mesh(groundGeo, groundMat);
  ground.position.y = -0.1;
  group.add(ground);

  // Muck Pile (Stockpile to dig from)
  const hillGeo = new THREE.SphereGeometry(8, 32, 16, 0, Math.PI * 2, 0, Math.PI * 0.5);
  hillGeo.scale(1.5, 0.6, 1);
  
  const pileMat = new THREE.MeshStandardMaterial({ color: 0x44403c, roughness: 1.0 });
  disposables.push(hillGeo, pileMat);
  const pile = new THREE.Mesh(hillGeo, pileMat);
  pile.position.set(0, -0.1, -8); // Behind excavator
  group.add(pile);

  // Lighting
  const ambient = new THREE.AmbientLight(0xffffff, 0.5);
  group.add(ambient);
  const spot = new THREE.SpotLight(0xffaa00, 2, 50, 0.5, 0.5, 1);
  spot.position.set(10, 20, 10);
  spot.lookAt(0, 0, 0);
  group.add(spot);

  // 2. Excavator (The Loader)
  const exGroup = new THREE.Group();
  group.add(exGroup);
  
  // Materials
  const yellowMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b });
  const darkMat = new THREE.MeshStandardMaterial({ color: 0x1c1917 });
  disposables.push(yellowMat, darkMat);

  // Chassis (Static Base)
  const tracksGeo = new THREE.BoxGeometry(4, 1, 5);
  disposables.push(tracksGeo);
  const tracks = new THREE.Mesh(tracksGeo, darkMat);
  tracks.position.y = 0.5;
  exGroup.add(tracks);

  // Body (Rotates)
  const bodyGroup = new THREE.Group();
  bodyGroup.position.y = 1.0;
  exGroup.add(bodyGroup);
  
  const cabGeo = new THREE.BoxGeometry(3, 2, 4);
  disposables.push(cabGeo);
  const cab = new THREE.Mesh(cabGeo, yellowMat);
  cab.position.y = 1;
  bodyGroup.add(cab);

  // Boom (Rotates X)
  const boomGroup = new THREE.Group();
  boomGroup.position.set(0, 1, 1); // Pivot point
  bodyGroup.add(boomGroup);
  
  const boomGeo = new THREE.BoxGeometry(1, 1, 8);
  boomGeo.translate(0, 0, 3.5); // Offset so pivot is at end
  disposables.push(boomGeo);
  const boom = new THREE.Mesh(boomGeo, yellowMat);
  // Initial angle up
  boom.rotation.x = -Math.PI / 4; 
  boomGroup.add(boom);

  // Stick (Forearm)
  const stickGroup = new THREE.Group();
  // Attach to end of boom. Boom length ~8 (scaled/translated).
  stickGroup.position.set(0, 0, 7); 
  boom.add(stickGroup);

  const stickGeo = new THREE.BoxGeometry(0.8, 0.8, 5);
  stickGeo.translate(0, 0, 2); // Pivot at top
  disposables.push(stickGeo);
  const stick = new THREE.Mesh(stickGeo, yellowMat);
  stick.rotation.x = Math.PI / 2; // Hanging down
  stickGroup.add(stick);

  // Bucket
  const bucketGroup = new THREE.Group();
  bucketGroup.position.set(0, 0, 4.5);
  stick.add(bucketGroup);
  
  const bucketGeo = new THREE.CylinderGeometry(1, 0.8, 2, 4, 1, false, 0, Math.PI);
  bucketGeo.rotateZ(Math.PI / 2);
  disposables.push(bucketGeo);
  const bucket = new THREE.Mesh(bucketGeo, darkMat);
  bucketGroup.add(bucket);

  animatables.coopExcavator = {
      body: bodyGroup,
      boom: boomGroup,
      stick: stickGroup,
      bucket: bucketGroup
  };

  // 3. Dump Trucks (Pool of trucks)
  animatables.coopTrucks = [];
  const truckCount = 4; // Max active in scene
  
  const tChassisGeo = new THREE.BoxGeometry(3, 1, 6);
  const tCabGeo = new THREE.BoxGeometry(2.5, 2, 1.5);
  const tBedGeo = new THREE.BoxGeometry(2.8, 1.5, 4.5);
  // Load visualization (Box that scales Y)
  const loadGeo = new THREE.BoxGeometry(2.6, 1, 4.3);
  
  disposables.push(tChassisGeo, tCabGeo, tBedGeo, loadGeo);

  for(let i=0; i<truckCount; i++) {
      const tGroup = new THREE.Group();
      
      const chassis = new THREE.Mesh(tChassisGeo, darkMat);
      chassis.position.y = 1; // Wheel height
      tGroup.add(chassis);
      
      const tCab = new THREE.Mesh(tCabGeo, yellowMat);
      tCab.position.set(0, 2.5, 2.2); // Front
      tGroup.add(tCab);

      const bed = new THREE.Mesh(tBedGeo, yellowMat);
      bed.position.set(0, 2.5, -0.8);
      tGroup.add(bed);

      const load = new THREE.Mesh(loadGeo, pileMat);
      load.position.set(0, 2.8, -0.8);
      load.scale.y = 0; // Empty
      load.visible = false;
      tGroup.add(load);
      
      // Wheels
      const wheelGeo = new THREE.CylinderGeometry(0.8, 0.8, 0.8, 16);
      wheelGeo.rotateZ(Math.PI/2);
      disposables.push(wheelGeo);
      const w1 = new THREE.Mesh(wheelGeo, darkMat); w1.position.set(1.5, 0.8, 2); tGroup.add(w1);
      const w2 = new THREE.Mesh(wheelGeo, darkMat); w2.position.set(-1.5, 0.8, 2); tGroup.add(w2);
      const w3 = new THREE.Mesh(wheelGeo, darkMat); w3.position.set(1.5, 0.8, -2); tGroup.add(w3);
      const w4 = new THREE.Mesh(wheelGeo, darkMat); w4.position.set(-1.5, 0.8, -2); tGroup.add(w4);

      // Initial State: Hidden/Far away
      tGroup.position.set(20 + i*10, 0, 0); 
      group.add(tGroup);
      
      animatables.coopTrucks.push({
          mesh: tGroup,
          bed: bed,
          load: load,
          state: 'QUEUE',
          loadPct: 0,
          targetPos: new THREE.Vector3(0,0,0)
      });
  }

  // 4. Loading Zone Marker
  const zoneRingGeo = new THREE.RingGeometry(4, 4.5, 32);
  zoneRingGeo.rotateX(-Math.PI / 2);
  const zoneMat = new THREE.MeshBasicMaterial({ color: 0x22c55e, transparent: true, opacity: 0.3, side: THREE.DoubleSide });
  disposables.push(zoneRingGeo, zoneMat);
  const zone = new THREE.Mesh(zoneRingGeo, zoneMat);
  zone.position.set(8, 0.1, 0); // Where truck parks
  group.add(zone);
  
  animatables.coopTargets = [zone as unknown as THREE.Group];

  // 5. Dirt Particles (Falling)
  const pCount = 200;
  const pGeo = new THREE.BufferGeometry();
  const pPos = new Float32Array(pCount * 3);
  for(let i=0; i<pCount; i++) pPos[i*3+1] = -100; // Hide
  pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
  const pMat = new THREE.PointsMaterial({ color: 0x57534e, size: 0.15 });
  disposables.push(pGeo, pMat);
  const dirt = new THREE.Points(pGeo, pMat);
  group.add(dirt);
  animatables.coopDirt = dirt;
};

export const animateMineCoopScene = (animatables: SimAnimatables, time: number, simData: any) => {
    // simData: { truckCount: number, loaderSpeed: number }
    const speed = simData?.loaderSpeed || 1.0;
    const activeTrucks = Math.min(animatables.coopTrucks?.length || 0, simData?.truckCount || 3);
    
    // Excavator Cycle: 10s per pass
    // 0-3s: Dig (Rot back to pile, dip bucket)
    // 3-6s: Swing (Rot to truck, lift)
    // 6-7s: Dump (Open bucket)
    // 7-10s: Return
    const cycleT = (time * speed) % 10;
    const ex = animatables.coopExcavator;
    
    let dumping = false;

    if (ex) {
        let bodyRot = 0;
        let boomRot = 0;
        let stickRot = 0;
        let bucketRot = 0;

        if (cycleT < 3) {
            // Digging
            const t = cycleT / 3;
            bodyRot = -Math.PI / 2;
            boomRot = THREE.MathUtils.lerp(-0.5, 0.2, Math.sin(t * Math.PI)); // Dip down then up
            stickRot = THREE.MathUtils.lerp(0.5, 1.5, Math.sin(t * Math.PI)); // Scoop
            bucketRot = THREE.MathUtils.lerp(-0.5, 1.0, t);
        } else if (cycleT < 6) {
            // Swing to Truck
            const t = (cycleT - 3) / 3;
            bodyRot = THREE.MathUtils.lerp(-Math.PI / 2, 0, t); // Turn to 0
            boomRot = THREE.MathUtils.lerp(0.2, 0.5, t); // Lift high
            stickRot = 1.0;
            bucketRot = 1.0; // Keep closed
        } else if (cycleT < 7) {
            // Dump
            const t = (cycleT - 6) / 1;
            bodyRot = 0;
            boomRot = 0.5;
            stickRot = THREE.MathUtils.lerp(1.0, 0.5, t); // Extend stick
            bucketRot = THREE.MathUtils.lerp(1.0, -1.0, t); // Open bucket
            dumping = true;
        } else {
            // Return
            const t = (cycleT - 7) / 3;
            bodyRot = THREE.MathUtils.lerp(0, -Math.PI / 2, t);
            boomRot = THREE.MathUtils.lerp(0.5, -0.5, t);
            stickRot = 0.5;
            bucketRot = -0.5;
        }

        ex.body.rotation.y = bodyRot;
        ex.boom.rotation.x = boomRot;
        ex.stick.rotation.x = stickRot;
        ex.bucket.rotation.x = bucketRot;

        // Particle FX
        if (animatables.coopDirt) {
            const pos = animatables.coopDirt.geometry.attributes.position.array as Float32Array;
            // Bucket world pos approx:
            // This is hard to calc perfectly without world matrix update, assume approximate dump location
            // Truck bed is at (8, 3, 0)
            const dumpX = 8;
            const dumpY = 5; // Drop height
            const dumpZ = 0;

            for(let i=0; i<pos.length; i+=3) {
                if (dumping && Math.random() > 0.5) {
                    // Respawn
                    pos[i] = dumpX + (Math.random()-0.5);
                    pos[i+1] = dumpY;
                    pos[i+2] = dumpZ + (Math.random()-0.5);
                }
                
                // Fall
                if (pos[i+1] > 2.5) { // Truck bed height approx 2.5
                    pos[i+1] -= 0.2; // Gravity
                } else {
                    pos[i+1] = -100; // Hide
                }
            }
            animatables.coopDirt.geometry.attributes.position.needsUpdate = true;
        }
    }

    // Trucks Logic
    if (animatables.coopTrucks) {
        // Truck 0: Loading (Stationary at spot)
        // Truck 1: Queued (Stationary behind)
        // Truck 2: Queued behind 1
        
        // Loader dumping adds to Truck 0 load
        const activeTruck = animatables.coopTrucks[0];
        if (cycleT > 6 && cycleT < 7) {
            activeTruck.loadPct += 0.5; // Fill up over passes
        }
        
        // Update load visual
        activeTruck.load.visible = true;
        activeTruck.load.scale.y = Math.min(1, activeTruck.loadPct / 100 * 1); // Max scale 1
        activeTruck.load.position.y = 2.8 + (activeTruck.load.scale.y * 0.75); // Grow up

        // If full (simulated reset), swap visual roles immediately for infinite loop effect
        // or actually animate drive off
        if (activeTruck.loadPct > 100) {
             activeTruck.loadPct = 0; 
             // Visual "jolt" or reset could happen here
             activeTruck.mesh.position.y = Math.sin(time * 20) * 0.05; // Engine rumble
        }

        // Other trucks queue
        for(let i=1; i<activeTrucks; i++) {
            const t = animatables.coopTrucks[i];
            t.mesh.position.x = 8 + i * 12; // Queue line
            t.mesh.position.z = 0;
            t.load.visible = false;
        }
        
        // Hide unused trucks
        for(let i=activeTrucks; i<animatables.coopTrucks.length; i++) {
            animatables.coopTrucks[i].mesh.position.y = -100;
        }
    }
};
