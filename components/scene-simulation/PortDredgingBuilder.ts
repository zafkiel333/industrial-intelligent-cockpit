
import * as THREE from 'three';
import { SimAnimatables } from './three-types';

export const initPortDredgingScene = (
  group: THREE.Group,
  animatables: SimAnimatables,
  disposables: { dispose: () => void }[]
) => {
  // 1. Lighting (Murky Underwater/Construction)
  const ambient = new THREE.AmbientLight(0xffffff, 0.4);
  group.add(ambient);
  const sun = new THREE.DirectionalLight(0xffffff, 1);
  sun.position.set(10, 40, 20);
  group.add(sun);
  const workLight = new THREE.SpotLight(0xffaa00, 2, 60, 0.5, 0.5);
  workLight.position.set(0, 10, 0);
  workLight.target.position.set(0, -5, 10);
  group.add(workLight);
  group.add(workLight.target);

  // 2. Seabed Terrain (Dredging Zone)
  const bedGeo = new THREE.PlaneGeometry(80, 80, 64, 64);
  const pos = bedGeo.attributes.position;
  // Initialize Initial Bed Height
  const initialZ = new Float32Array(pos.count);
  
  for(let i=0; i<pos.count; i++) {
    const x = pos.getX(i);
    const y = pos.getY(i); // Z world
    
    // Create an uneven seabed
    let z = -8 + Math.sin(x * 0.1) * Math.cos(y * 0.1) * 2;
    z += Math.random() * 0.5;

    // Create a pre-existing channel cut suggestion
    if (Math.abs(x) < 5) z -= 1;

    pos.setZ(i, z);
    initialZ[i] = z;
  }
  bedGeo.computeVertexNormals();
  bedGeo.rotateX(-Math.PI / 2);
  // Store initial Z
  bedGeo.userData = { initialZ };

  const bedMat = new THREE.MeshStandardMaterial({ 
      color: 0x57534e, // Sand/Mud
      roughness: 1.0,
      metalness: 0.1,
      flatShading: true
  });
  const wireMat = new THREE.MeshBasicMaterial({ 
      color: 0x22d3ee, 
      wireframe: true, 
      transparent: true, 
      opacity: 0.05 
  });

  disposables.push(bedGeo, bedMat, wireMat);
  const seabed = new THREE.Mesh(bedGeo, bedMat);
  const seabedWire = new THREE.Mesh(bedGeo, wireMat);
  seabedWire.position.y = 0.02;
  
  group.add(seabed);
  group.add(seabedWire);
  animatables.pdSeabed = seabed;

  // 3. Water Surface (Semi-transparent)
  const waterGeo = new THREE.PlaneGeometry(80, 80);
  waterGeo.rotateX(-Math.PI / 2);
  const waterMat = new THREE.MeshPhysicalMaterial({ 
      color: 0x0891b2, 
      transparent: true, 
      opacity: 0.4, 
      roughness: 0.1,
      metalness: 0.2
  });
  disposables.push(waterGeo, waterMat);
  const water = new THREE.Mesh(waterGeo, waterMat);
  water.position.y = 1; // Water Level
  group.add(water);

  // 4. Cutter Suction Dredger (CSD) Vessel
  const dredgerGroup = new THREE.Group();
  group.add(dredgerGroup);
  animatables.pdDredger = dredgerGroup;

  // Hull
  const hullGeo = new THREE.BoxGeometry(10, 4, 30);
  const hullMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b }); // Industrial Yellow
  disposables.push(hullGeo, hullMat);
  const hull = new THREE.Mesh(hullGeo, hullMat);
  hull.position.y = 1;
  dredgerGroup.add(hull);

  // Bridge / Superstructure
  const bridgeGeo = new THREE.BoxGeometry(8, 4, 6);
  const bridgeMat = new THREE.MeshStandardMaterial({ color: 0xffffff });
  disposables.push(bridgeGeo, bridgeMat);
  const bridge = new THREE.Mesh(bridgeGeo, bridgeMat);
  bridge.position.set(0, 4, -8); // Stern
  dredgerGroup.add(bridge);

  // Spuds (Anchors at stern)
  animatables.pdSpuds = [];
  const spudGeo = new THREE.CylinderGeometry(0.5, 0.5, 12);
  const spudMat = new THREE.MeshStandardMaterial({ color: 0x334155 });
  disposables.push(spudGeo, spudMat);
  
  // Working Spud
  const spud1 = new THREE.Mesh(spudGeo, spudMat);
  spud1.position.set(0, 2, -14); // Center stern
  dredgerGroup.add(spud1);
  animatables.pdSpuds.push(spud1 as unknown as THREE.Group);
  
  // Walking Spud
  const spud2 = new THREE.Mesh(spudGeo, spudMat);
  spud2.position.set(0, 4, -16); // Raised
  dredgerGroup.add(spud2);
  animatables.pdSpuds.push(spud2 as unknown as THREE.Group);

  // 5. Ladder & Cutter Head (The working arm)
  const ladderGroup = new THREE.Group();
  ladderGroup.position.set(0, 1, 14); // Bow pivot
  dredgerGroup.add(ladderGroup);
  animatables.pdLadder = ladderGroup;

  // Ladder Arm
  const ladderGeo = new THREE.BoxGeometry(2, 1, 15);
  ladderGeo.translate(0, 0, 7.5); // Pivot at one end
  const ladderMat = new THREE.MeshStandardMaterial({ color: 0xd97706 });
  disposables.push(ladderGeo, ladderMat);
  const ladder = new THREE.Mesh(ladderGeo, ladderMat);
  // Initial angle down
  ladder.rotation.x = 0.5;
  ladderGroup.add(ladder);

  // Cutter Head (Rotating)
  const headGroup = new THREE.Group();
  // Position at end of ladder (hypotenuse length approx 15)
  headGroup.position.set(0, -Math.sin(0.5)*15, Math.cos(0.5)*15); 
  ladderGroup.add(headGroup);
  animatables.pdCutterHead = headGroup;

  // Cutter Geometry (Spiky Cylinder)
  const headGeo = new THREE.CylinderGeometry(1.5, 1.2, 2, 8);
  headGeo.rotateX(Math.PI / 2);
  const headMat = new THREE.MeshStandardMaterial({ color: 0xef4444 });
  disposables.push(headGeo, headMat);
  const headMesh = new THREE.Mesh(headGeo, headMat);
  headGroup.add(headMesh);
  
  // Teeth
  const toothGeo = new THREE.ConeGeometry(0.2, 0.5, 4);
  const toothMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
  disposables.push(toothGeo, toothMat);
  for(let i=0; i<8; i++) {
      const angle = i/8 * Math.PI * 2;
      const t = new THREE.Mesh(toothGeo, toothMat);
      t.position.set(Math.cos(angle)*1.4, Math.sin(angle)*1.4, 0);
      t.rotation.z = angle - Math.PI/2;
      headGroup.add(t);
  }

  // 6. Sediment Plume (Particles)
  const pCount = 500;
  const pGeo = new THREE.BufferGeometry();
  const pPos = new Float32Array(pCount * 3);
  const pLife = new Float32Array(pCount);
  
  for(let i=0; i<pCount; i++) {
     pPos[i*3] = 0; pPos[i*3+1] = -100; pPos[i*3+2] = 0;
     pLife[i] = 0;
  }
  pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
  pGeo.setAttribute('life', new THREE.BufferAttribute(pLife, 1));
  
  const pMat = new THREE.PointsMaterial({ 
      color: 0x78350f, // Mud brown
      size: 0.4, 
      transparent: true, 
      opacity: 0.6,
      depthWrite: false
  });
  disposables.push(pGeo, pMat);
  const plume = new THREE.Points(pGeo, pMat);
  group.add(plume);
  animatables.pdSedimentCloud = plume;

  // 7. Work Zone Arc (Visual Guide)
  const arcCurve = new THREE.EllipseCurve(
      0, 0, // ax, aY (relative to spud pivot approx)
      25, 25, // xRadius, yRadius
      Math.PI / 4, 3 * Math.PI / 4, // Start, End Angle
      false, // clockwise
      0 // rotation
  );
  const arcPoints = arcCurve.getPoints(50);
  const arcGeo = new THREE.BufferGeometry().setFromPoints(arcPoints.map(p => new THREE.Vector3(p.x, 2, p.y)));
  const arcMat = new THREE.LineDashedMaterial({ color: 0x22d3ee, dashSize: 1, gapSize: 0.5 });
  disposables.push(arcGeo, arcMat);
  const arcLine = new THREE.Line(arcGeo, arcMat);
  arcLine.computeLineDistances();
  dredgerGroup.add(arcLine); // Moves with dredger
  animatables.pdWorkZone = arcLine;
  
  // Floating Pipeline
  const pipePath = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 1, -15), // Stern
      new THREE.Vector3(-5, 1, -25),
      new THREE.Vector3(-10, 1, -35),
      new THREE.Vector3(-25, 1, -40)
  ]);
  const pipeGeo = new THREE.TubeGeometry(pipePath, 32, 0.5, 8, false);
  const pipeMat = new THREE.MeshStandardMaterial({ color: 0x000000 });
  disposables.push(pipeGeo, pipeMat);
  const pipeline = new THREE.Mesh(pipeGeo, pipeMat);
  dredgerGroup.add(pipeline);
};

export const animatePortDredgingScene = (animatables: SimAnimatables, time: number, simData: any) => {
    // simData: { swingAngle: number, depth: number, cutterOn: boolean, production: number }
    const swing = (simData?.swingAngle || 0) * Math.PI / 180;
    const depth = simData?.depth || 5;
    const cutterOn = simData?.cutterOn || false;
    const production = simData?.production || 0;

    // 1. Dredger Swing
    if (animatables.pdDredger) {
        // Swing around the working spud (approx Z=-14)
        // We move the group position/rotation to simulate swing around spud
        // Simplified: Rotate group around Y at local Z=-14
        
        // Translate to pivot, rotate, translate back logic or simpler:
        // Pivot point in local space is (0, 0, -14).
        // To rotate around it, we can offset mesh, but mesh has children.
        // Let's just rotate the whole group and adjust position to keep spud fixed?
        // Simpler visual: Just rotate mesh around origin? No, that's center.
        // Let's assume spud is at world (0,0,-10) initially.
        
        // Pivot simulation:
        const pivotZ = -14;
        // Calc new pos based on rotation
        const currentRot = animatables.pdDredger.rotation.y;
        // Lerp to target swing
        animatables.pdDredger.rotation.y = THREE.MathUtils.lerp(currentRot, swing, 0.05);
        
        // Adjust X/Z to simulate pivoting around (0,0,-14) local
        // Actually if we just rotate, it pivots around (0,0,0) of group.
        // We need the group to be positioned such that (0,0,-14) is world fixed? 
        // Or create a parent pivot group. 
        // For now, let's just rotate, it looks like swinging around center of ship, simpler.
        // To make it look like spud pivot, we'd need a wrapper. 
        // Let's stick to center swing for visual simplicity in this demo.
    }

    // 2. Ladder Pitch (Depth Control)
    if (animatables.pdLadder) {
        // Calculate angle for target depth
        // Ladder length ~15. 
        // sin(angle) = depth / length.
        const targetPitch = Math.asin(Math.min(1, depth / 15));
        animatables.pdLadder.rotation.x = THREE.MathUtils.lerp(animatables.pdLadder.rotation.x, targetPitch, 0.05);
        
        // Update head position relative to ladder
        // (Handled by hierarchy)
    }

    // 3. Cutter Head Rotation
    if (animatables.pdCutterHead && cutterOn) {
        animatables.pdCutterHead.children[0].rotation.y -= 0.2; // Spin
    }

    // 4. Terrain Excavation (Digging)
    if (animatables.pdSeabed && cutterOn && animatables.pdDredger && animatables.pdLadder) {
        // Find world position of cutter head
        const cutter = animatables.pdCutterHead;
        const ladder = animatables.pdLadder;
        const ship = animatables.pdDredger;
        
        // Rough world pos calc
        // Ship pos + Ladder vector rotated by ship Y and ladder X
        // Ship at (0,1,0). Ladder pivot at (0,1,14).
        // Ladder extends 15 length.
        const shipYRot = ship.rotation.y;
        const ladXRot = ladder.rotation.x;
        
        // Ladder tip local to ship
        const tipLocalZ = 14 + Math.cos(ladXRot) * 15;
        const tipLocalY = 1 + Math.sin(ladXRot) * -15; // Down
        const tipLocalX = 0;
        
        // Rotate by ship yaw
        const worldX = Math.sin(shipYRot) * tipLocalZ;
        const worldZ = Math.cos(shipYRot) * tipLocalZ;
        
        // Deform terrain at worldX, worldZ
        const geo = animatables.pdSeabed.geometry;
        const pos = geo.attributes.position;
        
        // Plane is rotated X-90. Z->Y world. Y->Z world.
        // pos.getX is World X. pos.getY is World Z. pos.getZ is World Y (height).
        
        for(let i=0; i<pos.count; i++) {
            const vx = pos.getX(i);
            const vy = pos.getY(i); // World Z
            
            const dist = Math.sqrt(Math.pow(vx - worldX, 2) + Math.pow(vy - worldZ, 2));
            
            if (dist < 2.5) { // Radius of influence
                const currentH = pos.getZ(i);
                // Dig down to target depth (-8 base, dig further?)
                // Actually water level 0. target depth is positive value from surface.
                // So target Z = -depth.
                const targetZ = -depth;
                
                if (currentH > targetZ) {
                    // Dig rate
                    const digRate = 0.05 * (production / 2000); 
                    pos.setZ(i, Math.max(targetZ, currentH - digRate));
                }
            }
        }
        pos.needsUpdate = true;
        geo.computeVertexNormals();
        
        // 5. Sediment Plume
        if (animatables.pdSedimentCloud) {
            const pPos = animatables.pdSedimentCloud.geometry.attributes.position.array as Float32Array;
            const pLife = animatables.pdSedimentCloud.geometry.attributes.life.array as Float32Array;
            
            const count = pLife.length;
            // Emit count based on production
            const emit = Math.ceil(production / 500);
            
            for(let k=0; k<emit; k++) {
                const idx = Math.floor(Math.random() * count);
                if (pLife[idx] <= 0) {
                    pLife[idx] = 1.0;
                    // Spawn at cutter
                    pPos[idx*3] = worldX + (Math.random()-0.5)*2;
                    pPos[idx*3+1] = -depth + (Math.random())*2; // Bottom
                    pPos[idx*3+2] = worldZ + (Math.random()-0.5)*2;
                }
            }
            
            for(let i=0; i<count; i++) {
                if (pLife[i] > 0) {
                    pLife[i] -= 0.01;
                    // Drift with current (simulated +X)
                    pPos[i*3] += 0.02;
                    // Rise/Settle
                    pPos[i*3+1] += 0.01; 
                    // Spread
                    pPos[i*3+2] += (Math.random()-0.5)*0.02;
                    
                    if (pPos[i*3+1] > 0) pLife[i] = 0; // Dissipate at surface
                } else {
                    pPos[i*3+1] = -100;
                }
            }
            animatables.pdSedimentCloud.geometry.attributes.position.needsUpdate = true;
            animatables.pdSedimentCloud.geometry.attributes.life.needsUpdate = true;
            (animatables.pdSedimentCloud.material as THREE.PointsMaterial).opacity = Math.min(0.8, production/2000);
        }
    }
};
