
import * as THREE from 'three';
import { SimAnimatables } from './three-types';

export const initHydroGroupDispatchScene = (
  group: THREE.Group,
  animatables: SimAnimatables,
  disposables: { dispose: () => void }[]
) => {
  // 1. Lighting
  const ambient = new THREE.AmbientLight(0xffffff, 0.4);
  group.add(ambient);
  const dirLight = new THREE.DirectionalLight(0xffffff, 1);
  dirLight.position.set(0, 30, 20);
  group.add(dirLight);
  const backLight = new THREE.PointLight(0x06b6d4, 0.5, 40);
  backLight.position.set(0, 5, -20);
  group.add(backLight);

  // 2. Terrain (Wide Channel)
  const bedGeo = new THREE.PlaneGeometry(80, 50, 32, 32);
  const pos = bedGeo.attributes.position;
  for(let i=0; i<pos.count; i++) {
    const x = pos.getX(i);
    const y = pos.getY(i); // Z
    // Channel profile
    let z = 0;
    if (Math.abs(x) > 35) z = 4; // Banks
    else z = -6; // Bed
    
    // Slight slope downstream
    z -= (y / 50) * 1; 
    pos.setZ(i, z);
  }
  bedGeo.computeVertexNormals();
  bedGeo.rotateX(-Math.PI / 2);

  const bedMat = new THREE.MeshStandardMaterial({ 
    color: 0x334155, 
    roughness: 0.9,
    metalness: 0.2
  });
  disposables.push(bedGeo, bedMat);
  const bed = new THREE.Mesh(bedGeo, bedMat);
  group.add(bed);
  animatables.groupTerrain = bed;

  // 3. Barrage Structure (Piers & Bridge)
  const pierGeo = new THREE.BoxGeometry(2, 12, 10);
  const pierMat = new THREE.MeshStandardMaterial({ color: 0x64748b });
  disposables.push(pierGeo, pierMat);

  const bridgeGeo = new THREE.BoxGeometry(80, 1, 4);
  const bridgeMat = new THREE.MeshStandardMaterial({ color: 0x475569 });
  disposables.push(bridgeGeo, bridgeMat);

  const bridge = new THREE.Mesh(bridgeGeo, bridgeMat);
  bridge.position.y = 8;
  group.add(bridge);

  // 5 Gates -> 6 Piers
  const gateWidth = 10;
  const gap = 12; // Center to center
  const startX = -24; // Center of first gate?
  // Gates at: -24, -12, 0, 12, 24
  
  animatables.groupGates = [];
  const gateGeo = new THREE.BoxGeometry(10, 8, 0.5);
  const gateMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b }); // Orange
  disposables.push(gateGeo, gateMat);

  for (let i = 0; i < 5; i++) {
    const x = (i - 2) * 14;
    
    // Gate
    const gateMesh = new THREE.Mesh(gateGeo, gateMat);
    // Pivot at top? Or slide up. Slide up is easier for vertical lift gate.
    // Initial pos closed.
    gateMesh.position.set(x, 0, 0); // Center Y=0. Height 8 means -4 to 4. 
    // If bed is -6, gate bottom should be at -6.
    // So center Y should be -2.
    gateMesh.position.y = -2;
    group.add(gateMesh);
    
    // Store in animatables
    animatables.groupGates.push(gateMesh as unknown as THREE.Group);

    // Piers (Between gates)
    if (i < 6) { // Draw 6 piers for 5 gates? 
       // Logic: Pier at x - 7 and x + 7? No shared piers.
       // Let's place piers at x - 7. And one final at end.
       const pier = new THREE.Mesh(pierGeo, pierMat);
       pier.position.set(x - 7, 0, 0);
       group.add(pier);
       if (i === 4) {
           const finalPier = new THREE.Mesh(pierGeo, pierMat);
           finalPier.position.set(x + 7, 0, 0);
           group.add(finalPier);
       }
    }
  }

  // 4. Water Surfaces
  const waterMat = new THREE.MeshPhysicalMaterial({ 
      color: 0x0ea5e9, 
      transparent: true, 
      opacity: 0.7, 
      roughness: 0.1,
      metalness: 0.1,
      transmission: 0.5
  });
  disposables.push(waterMat);

  // Upstream
  const upGeo = new THREE.PlaneGeometry(70, 24); // Width 70, Length 24
  upGeo.rotateX(-Math.PI / 2);
  disposables.push(upGeo);
  const upWater = new THREE.Mesh(upGeo, waterMat);
  upWater.position.set(0, 0, -12.5); // Behind gates
  group.add(upWater);
  animatables.groupUpWater = upWater;

  // Downstream
  const downGeo = new THREE.PlaneGeometry(70, 24);
  downGeo.rotateX(-Math.PI / 2);
  disposables.push(downGeo);
  const downWater = new THREE.Mesh(downGeo, waterMat);
  downWater.position.set(0, -4, 12.5); // Lower level
  group.add(downWater);
  animatables.groupDownWater = downWater;

  // 5. Flow Particles
  const pCount = 2000;
  const pGeo = new THREE.BufferGeometry();
  const pPos = new Float32Array(pCount * 3);
  const pLife = new Float32Array(pCount); // 0-1
  // Store which gate it belongs to
  const pGate = new Float32Array(pCount); 

  for(let i=0; i<pCount; i++) {
    pPos[i*3] = 0; pPos[i*3+1] = -100; pPos[i*3+2] = 0;
    pLife[i] = 0;
    pGate[i] = Math.floor(Math.random() * 5); // 0-4
  }
  
  pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
  pGeo.setAttribute('life', new THREE.BufferAttribute(pLife, 1));
  pGeo.setAttribute('gateIndex', new THREE.BufferAttribute(pGate, 1));

  const pMat = new THREE.PointsMaterial({ 
      color: 0xcffafe, 
      size: 0.2, 
      transparent: true, 
      opacity: 0.6,
      blending: THREE.AdditiveBlending 
  });
  disposables.push(pGeo, pMat);
  const particles = new THREE.Points(pGeo, pMat);
  group.add(particles);
  animatables.groupFlowParticles = particles;
};

export const animateHydroGroupDispatchScene = (animatables: SimAnimatables, time: number, simData: any) => {
    // simData: { gateOpenings: number[] (5 values), upLevel: number, downLevel: number }
    const openings = simData?.gateOpenings || [0,0,0,0,0];
    const upLvl = simData?.upLevel || 4; // Relative to -6 base. e.g. 4 means y=-2
    const downLvl = simData?.downLevel || 1; 

    // 1. Water Levels
    if (animatables.groupUpWater) {
        // Base y = -6. Level adds to that.
        animatables.groupUpWater.position.y = -6 + upLvl;
    }
    if (animatables.groupDownWater) {
        // Add turbulence if flow high
        const totalFlow = openings.reduce((a:number,b:number)=>a+b, 0);
        const wave = Math.sin(time * 5) * (totalFlow / 500) * 0.1;
        animatables.groupDownWater.position.y = -6 + downLvl + wave;
    }

    // 2. Gates
    if (animatables.groupGates) {
        animatables.groupGates.forEach((gate, i) => {
            const pct = openings[i] || 0;
            // Max lift e.g. 6m. 
            // Closed Y = -2. Open Y = -2 + 6 = 4.
            const targetY = -2 + (pct / 100) * 6;
            gate.position.y = THREE.MathUtils.lerp(gate.position.y, targetY, 0.1);
            // Store actual opening for particles
            gate.userData.actualOpen = pct;
        });
    }

    // 3. Particles
    if (animatables.groupFlowParticles) {
        const positions = animatables.groupFlowParticles.geometry.attributes.position.array as Float32Array;
        const lifes = animatables.groupFlowParticles.geometry.attributes.life.array as Float32Array;
        const gateIndices = animatables.groupFlowParticles.geometry.attributes.gateIndex.array as Float32Array;
        const gates = animatables.groupGates;

        if (!gates) return;

        for(let i=0; i<lifes.length; i++) {
            const gIdx = gateIndices[i];
            const opening = gates[gIdx].userData.actualOpen || 0;

            if (lifes[i] <= 0) {
                // Respawn if gate is open
                if (opening > 1 && Math.random() < (opening/100)) {
                    lifes[i] = 1.0;
                    const gx = (gIdx - 2) * 14;
                    positions[i*3] = gx + (Math.random()-0.5) * 8; // Gate width 10
                    // Start height based on opening? No, under gate lip.
                    // Gate bottom y = gate.pos.y - 4.
                    const gateBottom = gates[gIdx].position.y - 4;
                    // Ensure particles start below water level but below gate
                    // Actually particles represent the jet.
                    positions[i*3+1] = Math.min(-6 + upLvl, gateBottom); 
                    positions[i*3+2] = 0; // Gate line
                } else {
                    positions[i*3+1] = -100;
                }
            } else {
                lifes[i] -= 0.02;
                // Move downstream (+Z)
                positions[i*3+2] += 0.5 + (opening/100)*0.5;
                // Gravity / Hydraulic Jump
                // If Z > 5 and Z < 15, turbulent jump
                if (positions[i*3+2] > 5 && positions[i*3+2] < 15) {
                    positions[i*3+1] += (Math.random()-0.5) * 0.5;
                } else {
                    // Fall to downstream level
                    if (positions[i*3+1] > -6 + downLvl) {
                        positions[i*3+1] -= 0.2;
                    }
                }
            }
        }
        animatables.groupFlowParticles.geometry.attributes.position.needsUpdate = true;
        animatables.groupFlowParticles.geometry.attributes.life.needsUpdate = true;
    }
};
