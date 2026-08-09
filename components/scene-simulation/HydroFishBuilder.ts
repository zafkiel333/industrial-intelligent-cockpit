
import * as THREE from 'three';
import { SimAnimatables } from './three-types';

export const initHydroFishScene = (
  group: THREE.Group,
  animatables: SimAnimatables,
  disposables: { dispose: () => void }[]
) => {
  // 1. Lighting (Natural River)
  const ambient = new THREE.AmbientLight(0xffffff, 0.5);
  group.add(ambient);
  const sun = new THREE.DirectionalLight(0xfff7e6, 1.2);
  sun.position.set(-20, 50, -20);
  group.add(sun);

  // 2. Terrain: River Channel + Fishway Structure
  const terrainGeo = new THREE.PlaneGeometry(60, 60, 64, 64);
  const pos = terrainGeo.attributes.position;
  
  // Construct terrain: High on right (Bank), Channel on left, Dam in middle
  // Fishway winds along the right bank
  for(let i=0; i<pos.count; i++) {
      const x = pos.getX(i);
      const y = pos.getY(i); // Local Y is Z world
      
      let z = 0;
      
      // Main River Channel (Left side x < 5)
      if (x < 5) {
          if (y > 0) z = 8; // Upstream bed high? No, Upstream water surface is high. Bed is flat or sloped.
          // Let's say Dam is at y=0.
          // Upstream Bed: z=5. Downstream Bed: z=0.
          // Vertical drop at y=0.
          if (y > 0) z = 5; else z = -5;
          
          // River depth
          z -= 2;
      } else {
          // Right Bank (Hill)
          z = 8 + Math.random() * 0.5;
          // Fishway Cut: A zig-zag or sloped channel carved into the bank
          // Path: Start downstream (y < -20), end upstream (y > 20)
          if (Math.abs(x - 15) < 4) { // Fishway channel width
             // Slope from -5 to 5 over length -25 to 25
             const slope = (y + 25) / 50; // 0 to 1
             const channelZ = -5 + slope * 10;
             z = Math.min(z, channelZ - 1); // Carve out
          }
      }
      
      // Smooth banks
      if (x > 5 && x < 10) {
          // Transition
          // z = lerp... simplified noise
          z += Math.random()*0.2;
      }

      pos.setZ(i, z);
  }
  terrainGeo.computeVertexNormals();
  terrainGeo.rotateX(-Math.PI / 2);
  
  const terrainMat = new THREE.MeshStandardMaterial({ 
      color: 0x3f6212, // Mossy Green
      roughness: 0.9,
      flatShading: true
  });
  disposables.push(terrainGeo, terrainMat);
  const terrain = new THREE.Mesh(terrainGeo, terrainMat);
  group.add(terrain);
  animatables.fishTerrain = terrain;

  // 3. Dam Structure
  const damGeo = new THREE.BoxGeometry(20, 15, 4);
  const damMat = new THREE.MeshStandardMaterial({ color: 0x64748b });
  disposables.push(damGeo, damMat);
  const dam = new THREE.Mesh(damGeo, damMat);
  dam.position.set(-5, 0, 0); // Center at X=-5, Z=0. Height covers drop.
  group.add(dam);

  // 4. Fishway Pools (Visual Steps)
  // Just visual planes for water steps
  const stepCount = 10;
  const stepGroup = new THREE.Group();
  const stepGeo = new THREE.BoxGeometry(6, 0.5, 4);
  const stepMat = new THREE.MeshStandardMaterial({ color: 0x475569 }); // Concrete dividers
  disposables.push(stepGeo, stepMat);

  for(let i=0; i<stepCount; i++) {
      const t = i / stepCount;
      const yPos = -20 + t * 40;
      const h = -4 + t * 9;
      
      const step = new THREE.Mesh(stepGeo, stepMat);
      step.position.set(15, h, yPos);
      stepGroup.add(step);
  }
  group.add(stepGroup);

  // 5. Water
  // Main River
  const waterGeo = new THREE.PlaneGeometry(60, 60, 32, 64);
  waterGeo.rotateX(-Math.PI / 2);
  const waterMat = new THREE.MeshPhysicalMaterial({ 
      color: 0x0ea5e9, 
      transparent: true, 
      opacity: 0.6,
      roughness: 0.1,
      metalness: 0.1
  });
  disposables.push(waterGeo, waterMat);
  
  const water = new THREE.Mesh(waterGeo, waterMat);
  // We need to shape the water mesh to match the dam drop and fishway slope
  const wPos = waterGeo.attributes.position;
  for(let i=0; i<wPos.count; i++) {
      const x = wPos.getX(i);
      const y = wPos.getY(i); // Local Y is world Z
      
      let z = 0;
      if (x < 5) {
          if (y > 0) z = 6; // Upstream level
          else z = -4; // Downstream level
      } else {
          // Fishway water surface
          if (Math.abs(x - 15) < 3.5) {
             const slope = (y + 25) / 50;
             z = -4 + slope * 10; 
          } else {
             z = -100; // Hide
          }
      }
      // Add slight wave
      wPos.setZ(i, z);
  }
  waterGeo.computeVertexNormals();
  group.add(water);
  animatables.fishWayWater = water;

  // 6. Discharge Gate (Eco Flow Outlet)
  const gateGroup = new THREE.Group();
  gateGroup.position.set(2, 0, 0); // Near right bank of dam
  const gGeo = new THREE.BoxGeometry(2, 2, 1);
  const gMat = new THREE.MeshStandardMaterial({ color: 0xef4444 });
  disposables.push(gGeo, gMat);
  const gate = new THREE.Mesh(gGeo, gMat);
  gate.position.y = 2; // Mid dam
  gateGroup.add(gate);
  
  // Jet
  const jetGeo = new THREE.CylinderGeometry(0.5, 2, 10, 16, 1, true);
  jetGeo.rotateX(Math.PI / 2);
  jetGeo.translate(0, 0, 5);
  const jetMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.4 });
  disposables.push(jetGeo, jetMat);
  const jet = new THREE.Mesh(jetGeo, jetMat);
  jet.position.y = 2;
  gateGroup.add(jet);
  animatables.fishGate = gateGroup;
  
  group.add(gateGroup);

  // 7. Fish Particles
  const fishCount = 200;
  const fGeo = new THREE.BufferGeometry();
  const fPos = new Float32Array(fishCount * 3);
  const fVel = new Float32Array(fishCount * 3);
  const fState = new Float32Array(fishCount); // 0=swimming, 1=struggling
  
  for(let i=0; i<fishCount; i++) {
      fPos[i*3] = 15 + (Math.random()-0.5) * 3; // Fishway X
      fPos[i*3+1] = -5; // Start low Z
      fPos[i*3+2] = -25 + Math.random() * 10; // Start downstream
      
      fVel[i*3] = 0;
      fVel[i*3+1] = 0;
      fVel[i*3+2] = 0.05 + Math.random() * 0.05; // Upstream speed
  }
  
  fGeo.setAttribute('position', new THREE.BufferAttribute(fPos, 3));
  fGeo.setAttribute('velocity', new THREE.BufferAttribute(fVel, 3));
  fGeo.setAttribute('state', new THREE.BufferAttribute(fState, 1));
  
  const fMat = new THREE.PointsMaterial({ color: 0xfacc15, size: 0.2 }); // Gold fish
  disposables.push(fGeo, fMat);
  const fish = new THREE.Points(fGeo, fMat);
  group.add(fish);
  animatables.fishSchool = fish;

  // 8. Sensors
  animatables.fishSensors = [];
  const sGeo = new THREE.SphereGeometry(0.3);
  const sMat = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
  disposables.push(sGeo, sMat);
  
  [15, -15, 0].forEach(z => {
      const s = new THREE.Mesh(sGeo, sMat);
      // Calc height based on slope
      const slope = (z + 25) / 50;
      const h = -4 + slope * 10 + 1;
      s.position.set(15, h, z);
      group.add(s);
      animatables.fishSensors?.push(s as unknown as THREE.Group);
  });
};

export const animateHydroFishScene = (animatables: SimAnimatables, time: number, simData: any) => {
    // simData: { dischargeFlow: number, velocity: number, waterLevel: number }
    const discharge = simData?.dischargeFlow || 10;
    const velocity = simData?.velocity || 1.0; // Fishway inlet velocity (m/s)

    // 1. Discharge Gate
    if (animatables.fishGate) {
        const jet = animatables.fishGate.children[1] as THREE.Mesh;
        // Jet scale based on discharge
        const s = discharge / 20; 
        jet.scale.set(s, s, Math.max(0.1, s));
        (jet.material as THREE.Material).opacity = Math.min(0.8, s * 0.5);
    }

    // 2. Fish Migration Logic
    if (animatables.fishSchool) {
        const pos = animatables.fishSchool.geometry.attributes.position.array as Float32Array;
        const vel = animatables.fishSchool.geometry.attributes.velocity.array as Float32Array;
        const state = animatables.fishSchool.geometry.attributes.state.array as Float32Array;
        const mat = animatables.fishSchool.material as THREE.PointsMaterial;

        // Color shift if velocity too high (Fish struggle)
        if (velocity > 2.0) mat.color.setHex(0xff0000); // Red
        else mat.color.setHex(0xfacc15); // Gold

        for(let i=0; i<pos.length/3; i++) {
            // Fish swim upstream (+Z in world, which is along channel)
            // But channel Y goes from -25 to 25.
            // Wait, geometry coords: Z is Y in builder logic (pos.setZ)
            // But Points use standard XYZ.
            // In init: pos.set(15, height, z_along_river)
            // Height is Y. River length is Z.
            
            let x = pos[i*3];
            let y = pos[i*3+1];
            let z = pos[i*3+2];
            
            let vz = vel[i*3+2];

            // If velocity is high, subtract from fish speed
            // Fish swim speed approx 0.1 units/frame
            // Current flow opposes fish
            const flowResistance = velocity * 0.04;
            let netSpeed = Math.max(-0.1, 0.08 - flowResistance);
            
            // Random burst
            if (Math.random() > 0.95) netSpeed += 0.05;

            z += netSpeed;
            
            // Update Height (Y) based on Z (Slope)
            // Slope: -4 at -25, 6 at 25.
            // h = -4 + ((z + 25) / 50) * 10
            const t = (z + 25) / 50;
            const targetY = -4 + t * 10;
            
            // Jump logic (between pools)
            y = targetY + Math.abs(Math.sin(z * 2)) * 0.5; // Hopping
            
            // Reset if reach top or pushed back too far
            if (z > 25) {
                // Success! Respawn bottom
                z = -25 - Math.random() * 5;
            }
            if (z < -30) {
                // Washed out
                z = -25;
            }

            pos[i*3] = x;
            pos[i*3+1] = y;
            pos[i*3+2] = z;
        }
        animatables.fishSchool.geometry.attributes.position.needsUpdate = true;
    }

    // 3. Sensors Pulse
    if (animatables.fishSensors) {
        animatables.fishSensors.forEach((s, i) => {
            const scale = 1 + Math.sin(time * 5 + i) * 0.3;
            s.scale.setScalar(scale);
        });
    }
};
