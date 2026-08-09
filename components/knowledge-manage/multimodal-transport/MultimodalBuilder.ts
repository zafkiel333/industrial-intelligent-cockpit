
import * as THREE from 'three';
import { MultimodalAnimatables, TransportMode } from './three-types';

export const initMultimodalScene = (
  group: THREE.Group, 
  animatables: MultimodalAnimatables,
  disposables: { dispose: () => void }[]
) => {
  // --- Materials ---
  const steelMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.7, metalness: 0.6 });
  const shipMat = new THREE.MeshStandardMaterial({ color: 0x1e3a8a, roughness: 0.5 });
  const trainMat = new THREE.MeshStandardMaterial({ color: 0xc2410c, roughness: 0.5 }); // Orange/Rust
  const truckMat = new THREE.MeshStandardMaterial({ color: 0x047857, roughness: 0.5 }); // Green
  const craneMat = new THREE.MeshStandardMaterial({ color: 0xfacc15, roughness: 0.3 }); // Yellow
  const containerMat = new THREE.MeshStandardMaterial({ color: 0x3b82f6 }); // Blue Container
  const hubMat = new THREE.MeshBasicMaterial({ color: 0xa855f7, wireframe: true, transparent: true, opacity: 0.4 });
  const lineMat = new THREE.LineBasicMaterial({ color: 0xa855f7, transparent: true, opacity: 0.3 });
  const dataMat = new THREE.PointsMaterial({ color: 0x00ffff, size: 0.15, transparent: true, blending: THREE.AdditiveBlending });

  disposables.push(steelMat, shipMat, trainMat, truckMat, craneMat, containerMat, hubMat, lineMat, dataMat);

  // 1. Central Data Hub (Floating above)
  const hubGroup = new THREE.Group();
  hubGroup.position.set(0, 8, 0);
  const hubGeo = new THREE.IcosahedronGeometry(1.5, 1);
  disposables.push(hubGeo);
  const hub = new THREE.Mesh(hubGeo, hubMat);
  hubGroup.add(hub);
  
  // Inner Core
  const coreGeo = new THREE.OctahedronGeometry(0.8);
  disposables.push(coreGeo);
  const core = new THREE.Mesh(coreGeo, new THREE.MeshBasicMaterial({color: 0xffffff}));
  hubGroup.add(core);

  group.add(hubGroup);
  animatables.hubNode = hubGroup;

  // 2. Transport Entities
  
  // Ship (Left)
  const shipGroup = new THREE.Group();
  shipGroup.position.set(-8, 0, 4);
  const hullGeo = new THREE.BoxGeometry(4, 2, 10);
  disposables.push(hullGeo);
  const ship = new THREE.Mesh(hullGeo, shipMat);
  shipGroup.add(ship);
  const bridgeGeo = new THREE.BoxGeometry(3, 1.5, 2);
  disposables.push(bridgeGeo);
  const bridge = new THREE.Mesh(bridgeGeo, new THREE.MeshStandardMaterial({color: 0xffffff}));
  bridge.position.set(0, 1.75, -3);
  shipGroup.add(bridge);
  group.add(shipGroup);
  animatables.shipGroup = shipGroup;

  // Train (Right Back)
  const trainGroup = new THREE.Group();
  trainGroup.position.set(8, 0.5, -4);
  const wagonGeo = new THREE.BoxGeometry(3, 1, 8);
  disposables.push(wagonGeo);
  const wagon = new THREE.Mesh(wagonGeo, trainMat);
  trainGroup.add(wagon);
  // Wheels
  const wheelGeo = new THREE.CylinderGeometry(0.4, 0.4, 3.2);
  wheelGeo.rotateZ(Math.PI/2);
  disposables.push(wheelGeo);
  const w1 = new THREE.Mesh(wheelGeo, steelMat); w1.position.set(0, -0.5, 2); trainGroup.add(w1);
  const w2 = new THREE.Mesh(wheelGeo, steelMat); w2.position.set(0, -0.5, -2); trainGroup.add(w2);
  group.add(trainGroup);
  animatables.trainGroup = trainGroup;

  // Truck (Right Front)
  const truckGroup = new THREE.Group();
  truckGroup.position.set(8, 0.5, 6);
  const trailerGeo = new THREE.BoxGeometry(2.5, 0.2, 6);
  disposables.push(trailerGeo);
  const trailer = new THREE.Mesh(trailerGeo, truckMat);
  truckGroup.add(trailer);
  // Cab
  const cabGeo = new THREE.BoxGeometry(2.5, 1.5, 1.5);
  disposables.push(cabGeo);
  const cab = new THREE.Mesh(cabGeo, truckMat);
  cab.position.set(0, 0.8, 3.5);
  truckGroup.add(cab);
  group.add(truckGroup);
  animatables.truckGroup = truckGroup;

  // 3. Crane (Center)
  const craneGroup = new THREE.Group();
  const legGeo = new THREE.BoxGeometry(1, 10, 1);
  disposables.push(legGeo);
  
  const leg1 = new THREE.Mesh(legGeo, craneMat); leg1.position.set(-4, 5, 0);
  const leg2 = new THREE.Mesh(legGeo, craneMat); leg2.position.set(4, 5, 0);
  craneGroup.add(leg1, leg2);
  
  const beamGeo = new THREE.BoxGeometry(20, 1, 1);
  disposables.push(beamGeo);
  const beam = new THREE.Mesh(beamGeo, craneMat);
  beam.position.set(0, 10, 0);
  craneGroup.add(beam);

  // Trolley & Spreader
  const trolleyGroup = new THREE.Group();
  trolleyGroup.position.set(0, 10, 0);
  const trolleyMesh = new THREE.Mesh(new THREE.BoxGeometry(2, 0.5, 1), steelMat);
  trolleyGroup.add(trolleyMesh);
  
  const spreaderGroup = new THREE.Group();
  const cableGeo = new THREE.CylinderGeometry(0.05, 0.05, 1); // Dynamic scale
  disposables.push(cableGeo);
  const cables = new THREE.Mesh(cableGeo, new THREE.MeshBasicMaterial({color: 0x000000}));
  cables.position.y = -2;
  cables.scale.y = 4;
  trolleyGroup.add(cables);
  
  const spreader = new THREE.Mesh(new THREE.BoxGeometry(2.5, 0.2, 5), craneMat);
  spreader.position.y = -4;
  trolleyGroup.add(spreader);
  
  // The Container (Movable)
  const contGeo = new THREE.BoxGeometry(2.4, 2.4, 6);
  disposables.push(contGeo);
  const container = new THREE.Mesh(contGeo, containerMat);
  container.visible = false; // Initially held by crane or on vehicle
  spreader.add(container); // Attach to spreader initially
  animatables.container = container;

  craneGroup.add(trolleyGroup);
  // Store deep ref for animation
  (craneGroup as any).userData = { trolley: trolleyGroup, cables, spreader };
  
  group.add(craneGroup);
  animatables.craneGroup = craneGroup;

  // 4. Data Connections (Lines to Hub)
  const linesGroup = new THREE.Group();
  const points = [
      shipGroup.position,
      trainGroup.position,
      truckGroup.position
  ];
  
  points.forEach(p => {
      const pts = [p, new THREE.Vector3(0, 8, 0)];
      const geo = new THREE.BufferGeometry().setFromPoints(pts);
      disposables.push(geo);
      const line = new THREE.Line(geo, lineMat);
      linesGroup.add(line);
  });
  group.add(linesGroup);
  animatables.connectionLines = linesGroup;

  // 5. Data Flow Particles
  const pCount = 200;
  const pGeo = new THREE.BufferGeometry();
  const pPos = new Float32Array(pCount * 3);
  // Custom attribute to track progress along lines
  const pProgress = new Float32Array(pCount);
  const pRoute = new Float32Array(pCount); // 0, 1, or 2 (which connection)
  
  for(let i=0; i<pCount; i++) {
      pProgress[i] = Math.random();
      pRoute[i] = Math.floor(Math.random() * 3);
      // Initial positions will be set in animate
  }
  
  pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
  pGeo.setAttribute('progress', new THREE.BufferAttribute(pProgress, 1));
  pGeo.setAttribute('route', new THREE.BufferAttribute(pRoute, 1));
  
  disposables.push(pGeo);
  const particles = new THREE.Points(pGeo, dataMat);
  group.add(particles);
  animatables.dataFlow = particles;

  // Ground Grid
  const grid = new THREE.GridHelper(40, 40, 0x334155, 0x0f172a);
  grid.position.y = -0.1;
  group.add(grid);
};

export const animateMultimodalScene = (
  animatables: MultimodalAnimatables, 
  mode: TransportMode,
  time: number
) => {
  // 1. Hub Rotation
  if (animatables.hubNode) {
      animatables.hubNode.rotation.y = time * 0.5;
      animatables.hubNode.children[1].rotation.x = time; // Core
  }

  // 2. Data Flow
  if (animatables.dataFlow && animatables.shipGroup && animatables.trainGroup && animatables.truckGroup) {
      const positions = animatables.dataFlow.geometry.attributes.position.array as Float32Array;
      const progress = animatables.dataFlow.geometry.attributes.progress.array as Float32Array;
      const routes = animatables.dataFlow.geometry.attributes.route.array as Float32Array;
      
      const targets = [
          animatables.shipGroup.position,
          animatables.trainGroup.position,
          animatables.truckGroup.position
      ];
      const hubPos = new THREE.Vector3(0, 8, 0);

      for(let i=0; i<progress.length; i++) {
          progress[i] += 0.01;
          if (progress[i] > 1) progress[i] = 0;
          
          const targetIdx = routes[i];
          const start = targets[targetIdx];
          const end = hubPos;
          
          // Interpolate
          // Some go Up (Upload), some go Down (Download)
          const p = progress[i];
          const isUpload = i % 2 === 0;
          const t = isUpload ? p : 1 - p;
          
          const x = start.x + (end.x - start.x) * t;
          const y = start.y + (end.y - start.y) * t;
          const z = start.z + (end.z - start.z) * t;
          
          positions[i*3] = x;
          positions[i*3+1] = y;
          positions[i*3+2] = z;
      }
      animatables.dataFlow.geometry.attributes.position.needsUpdate = true;
      animatables.dataFlow.geometry.attributes.progress.needsUpdate = true;
  }

  // 3. Crane Cycle (Container Transfer)
  if (animatables.craneGroup && animatables.shipGroup) {
      const craneData = (animatables.craneGroup as any).userData;
      const trolley = craneData.trolley as THREE.Group;
      const cable = craneData.cables as THREE.Mesh;
      const spreader = craneData.spreader as THREE.Mesh;
      const container = animatables.container!;

      // Cycle: 0-10s
      // 0-3: Move to Source
      // 3-4: Lower & Grab
      // 4-7: Move to Dest
      // 7-8: Lower & Drop
      // 8-10: Reset
      const cycleTime = 12;
      const t = time % cycleTime;
      
      let sourceX = -8; // Ship
      let destX = 8; // Land
      
      // Determine Dest based on Mode
      let destZ = 0;
      if (mode === 'SEA_RAIL') destZ = -4; // Train
      if (mode === 'SEA_ROAD') destZ = 6;  // Truck
      if (mode === 'RAIL_ROAD') { sourceX = 8; destX = 8; /* Just shuffle on land? simplified */ }

      // Trolley Pos
      let tx = 0;
      let hoistLen = 2; // Default cable length scale (1=4m)
      
      container.visible = true; // Always visible for simplicity in loop, or toggle
      
      if (t < 3) {
          // Move to Ship
          const p = t / 3;
          tx = THREE.MathUtils.lerp(destX, sourceX, p);
          container.visible = false; // Going to fetch
      } else if (t < 4) {
          // Grab
          tx = sourceX;
          const p = t - 3;
          // Dip: 1 -> 3 -> 1
          hoistLen = 1 + Math.sin(p * Math.PI) * 1.5; 
          container.visible = p > 0.5; // Picked up
      } else if (t < 7) {
          // Carry to Land
          const p = (t - 4) / 3;
          tx = THREE.MathUtils.lerp(sourceX, destX, p);
          container.visible = true;
      } else if (t < 8) {
          // Drop
          tx = destX;
          const p = t - 7;
          hoistLen = 1 + Math.sin(p * Math.PI) * 1.5;
          container.visible = p < 0.5; // Dropped
      } else {
          // Reset
          tx = destX;
          container.visible = false;
      }

      trolley.position.x = tx;
      // Z alignment (Train vs Truck)
      // Trolley usually moves X, Gantry moves Z. Here we simulate trolley moving X and slight Z shift if needed visually
      // Or move the Gantry
      // Let's slide gantry Z? No, simplified: Trolley just moves X.
      // But Train is at Z=-4, Truck at Z=6.
      // Let's move the WHOLE crane group Z to align with target
      let craneZ = 0;
      if (mode === 'SEA_RAIL') craneZ = -2; // Towards train
      if (mode === 'SEA_ROAD') craneZ = 3;  // Towards truck
      
      animatables.craneGroup.position.z = THREE.MathUtils.lerp(animatables.craneGroup.position.z, craneZ, 0.05);

      // Cable Stretch
      cable.scale.y = hoistLen;
      cable.position.y = -hoistLen; // Center of cylinder moves down
      spreader.position.y = -hoistLen * 2; // Bottom of cable
  }
};
