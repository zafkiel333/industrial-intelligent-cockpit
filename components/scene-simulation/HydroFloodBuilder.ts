
import * as THREE from 'three';
import { SimAnimatables } from './three-types';

export const initHydroFloodScene = (
  group: THREE.Group,
  animatables: SimAnimatables,
  disposables: { dispose: () => void }[]
) => {
  // 1. Terrain: Valley with River Channel
  const width = 80;
  const depth = 80;
  const segs = 64;
  const terrainGeo = new THREE.PlaneGeometry(width, depth, segs, segs);
  const pos = terrainGeo.attributes.position;
  
  for(let i=0; i<pos.count; i++) {
      const x = pos.getX(i);
      const y = pos.getY(i); // Z world
      
      // Valley Shape (U-Shape along X-axis, River flows Z+ to Z-)
      // Dam is at Z=0
      
      // Base valley curve
      let h = Math.pow(Math.abs(x) / 10, 2) * 2;
      
      // Add mountains
      h += Math.sin(x * 0.2) * Math.cos(y * 0.1) * 3;
      
      // River bed deepening
      if (Math.abs(x) < 8) {
          h -= 5;
      }
      
      // Flatten near dam site (Z=0)
      if (Math.abs(y) < 5 && Math.abs(x) < 15) {
          h = Math.max(-5, h); // Bed level
      }

      pos.setZ(i, h);
  }
  terrainGeo.computeVertexNormals();
  terrainGeo.rotateX(-Math.PI / 2);

  const terrainMat = new THREE.MeshStandardMaterial({ 
      color: 0x1e293b, 
      roughness: 0.8,
      metalness: 0.1,
      flatShading: true
  });
  
  // Grid overlay for "Digital Twin" feel
  const wireMat = new THREE.MeshBasicMaterial({ color: 0x334155, wireframe: true, transparent: true, opacity: 0.1 });
  
  disposables.push(terrainGeo, terrainMat, wireMat);
  const terrain = new THREE.Mesh(terrainGeo, terrainMat);
  const terrainWire = new THREE.Mesh(terrainGeo, wireMat);
  terrainWire.position.y = 0.05;
  
  group.add(terrain);
  group.add(terrainWire);
  animatables.hydroTerrain = terrain;

  // 2. Dam Structure
  const damGroup = new THREE.Group();
  group.add(damGroup);
  animatables.hydroDam = damGroup;

  // Dam Body (Gravity Dam)
  const damGeo = new THREE.BoxGeometry(40, 15, 5);
  const damMat = new THREE.MeshStandardMaterial({ color: 0x64748b });
  disposables.push(damGeo, damMat);
  const damMesh = new THREE.Mesh(damGeo, damMat);
  damMesh.position.set(0, 2.5, 0); // Center at origin
  damGroup.add(damMesh);

  // Spillway Gates
  const gateGeo = new THREE.BoxGeometry(4, 4, 1);
  const gateMat = new THREE.MeshStandardMaterial({ color: 0xf97316 }); // Orange gates
  disposables.push(gateGeo, gateMat);
  
  [-6, 0, 6].forEach(x => {
      const gate = new THREE.Mesh(gateGeo, gateMat);
      gate.position.set(x, 8, 2.6); // Top of dam, front face
      damGroup.add(gate);
  });

  // 3. Water Bodies
  const waterMat = new THREE.MeshPhysicalMaterial({
      color: 0x0ea5e9,
      transparent: true,
      opacity: 0.7,
      roughness: 0.1,
      metalness: 0.1,
      transmission: 0.5
  });
  disposables.push(waterMat);

  // Upstream Reservoir
  const upWaterGeo = new THREE.PlaneGeometry(30, 38);
  upWaterGeo.rotateX(-Math.PI / 2);
  disposables.push(upWaterGeo);
  const upWater = new THREE.Mesh(upWaterGeo, waterMat);
  upWater.position.set(0, 5, -20); // Behind dam
  group.add(upWater);
  animatables.hydroUpstreamWater = upWater;

  // Downstream River
  const downWaterGeo = new THREE.PlaneGeometry(20, 38, 32, 32); // More segs for flood wave
  downWaterGeo.rotateX(-Math.PI / 2);
  disposables.push(downWaterGeo);
  const downWater = new THREE.Mesh(downWaterGeo, waterMat);
  downWater.position.set(0, -4, 20); // Front of dam, low
  group.add(downWater);
  animatables.hydroDownstreamWater = downWater;

  // 4. Rain System
  const rainCount = 2000;
  const rainGeo = new THREE.BufferGeometry();
  const rainPos = new Float32Array(rainCount * 3);
  const rainVel = new Float32Array(rainCount);
  
  for(let i=0; i<rainCount; i++) {
      rainPos[i*3] = (Math.random() - 0.5) * 80;
      rainPos[i*3+1] = Math.random() * 20 + 10;
      rainPos[i*3+2] = (Math.random() - 0.5) * 80;
      rainVel[i] = 0.5 + Math.random() * 0.5;
  }
  rainGeo.setAttribute('position', new THREE.BufferAttribute(rainPos, 3));
  rainGeo.setAttribute('velocity', new THREE.BufferAttribute(rainVel, 1));
  
  const rainMat = new THREE.PointsMaterial({ color: 0xbae6fd, size: 0.15, transparent: true, opacity: 0.6 });
  disposables.push(rainGeo, rainMat);
  const rain = new THREE.Points(rainGeo, rainMat);
  group.add(rain);
  animatables.hydroRain = rain;

  // 5. Spillway Flow Particles (Water jets)
  const spillCount = 500;
  const spillGeo = new THREE.BufferGeometry();
  const spillPos = new Float32Array(spillCount * 3);
  const spillLife = new Float32Array(spillCount);
  
  for(let i=0; i<spillCount; i++) {
      spillPos[i*3] = 0; spillPos[i*3+1] = -100; spillPos[i*3+2] = 0; // Hide
      spillLife[i] = 0;
  }
  spillGeo.setAttribute('position', new THREE.BufferAttribute(spillPos, 3));
  spillGeo.setAttribute('life', new THREE.BufferAttribute(spillLife, 1));
  
  const spillMat = new THREE.PointsMaterial({ color: 0xffffff, size: 0.4, transparent: true, opacity: 0.8 });
  disposables.push(spillGeo, spillMat);
  const spillParticles = new THREE.Points(spillGeo, spillMat);
  group.add(spillParticles);
  animatables.hydroSpillFlow = spillParticles;

  // 6. Risk Markers (Towns)
  animatables.hydroFloodMarkers = [];
  const markerGeo = new THREE.ConeGeometry(1, 3, 4);
  markerGeo.rotateX(Math.PI); // Point down
  const markerMat = new THREE.MeshBasicMaterial({ color: 0xff0000 });
  disposables.push(markerGeo, markerMat);
  
  // Downstream locations
  const locs = [{x: -8, z: 25}, {x: 8, z: 35}];
  locs.forEach(l => {
      const m = new THREE.Mesh(markerGeo, markerMat);
      m.position.set(l.x, 5, l.z);
      group.add(m);
      animatables.hydroFloodMarkers?.push(m as unknown as THREE.Group);
      
      // Label placeholder (Ring)
      const ring = new THREE.Mesh(new THREE.RingGeometry(1, 1.2, 16), markerMat);
      ring.rotation.x = -Math.PI / 2;
      ring.position.y = -3; // Ground level approx
      m.add(ring);
  });

  // Lights
  const dirLight = new THREE.DirectionalLight(0xffffff, 1);
  dirLight.position.set(-10, 20, -10);
  group.add(dirLight);
};

export const animateHydroFloodScene = (animatables: SimAnimatables, time: number, simData: any) => {
    // simData: { inflow: number, outflow: number, rain: boolean, upstreamLevel: number, downstreamLevel: number }
    const inflow = simData?.inflow || 0;
    const outflow = simData?.outflow || 0;
    const isRaining = simData?.rain || false;
    const upLevel = simData?.upstreamLevel || 5; // Y pos
    const downLevel = simData?.downstreamLevel || -4; // Y pos

    // 1. Water Levels
    if (animatables.hydroUpstreamWater) {
        // Map data level (e.g., 100-150m) to scene Y (-5 to 10)
        // Let's assume passed level is scaled scene units for simplicity
        animatables.hydroUpstreamWater.position.y = THREE.MathUtils.lerp(animatables.hydroUpstreamWater.position.y, upLevel, 0.05);
    }
    
    if (animatables.hydroDownstreamWater) {
        animatables.hydroDownstreamWater.position.y = THREE.MathUtils.lerp(animatables.hydroDownstreamWater.position.y, downLevel, 0.05);
        
        // Scale width based on flood level to simulate spreading
        // Base width 20. Flood width 40.
        const targetScaleX = 1 + (downLevel + 4) * 0.2; // -4 is base
        animatables.hydroDownstreamWater.scale.x = THREE.MathUtils.lerp(animatables.hydroDownstreamWater.scale.x, targetScaleX, 0.05);
        
        // Wave animation
        // Simple scale jitter
        // (Real wave shader would be better)
    }

    // 2. Rain Animation
    if (animatables.hydroRain) {
        const positions = animatables.hydroRain.geometry.attributes.position.array as Float32Array;
        const vels = animatables.hydroRain.geometry.attributes.velocity.array as Float32Array;
        const mat = animatables.hydroRain.material as THREE.PointsMaterial;
        
        mat.opacity = isRaining ? 0.6 : 0.1;
        
        for(let i=0; i<positions.length/3; i++) {
            if (isRaining) {
                positions[i*3+1] -= vels[i];
                if (positions[i*3+1] < -5) {
                    positions[i*3+1] = 20;
                }
            } else {
                 positions[i*3+1] = -100; // Hide
            }
        }
        animatables.hydroRain.geometry.attributes.position.needsUpdate = true;
    }

    // 3. Spillway Particles
    if (animatables.hydroSpillFlow) {
        const positions = animatables.hydroSpillFlow.geometry.attributes.position.array as Float32Array;
        const lifes = animatables.hydroSpillFlow.geometry.attributes.life.array as Float32Array;
        
        // Intensity based on outflow
        const emissionRate = outflow / 100; // rough scale
        
        for(let i=0; i<lifes.length; i++) {
            lifes[i] -= 0.02;
            
            if (lifes[i] <= 0) {
                // Respawn
                if (Math.random() < emissionRate * 0.1) {
                    lifes[i] = 1.0;
                    // Pick a random gate (-6, 0, 6)
                    const gateX = [-6, 0, 6][Math.floor(Math.random()*3)];
                    positions[i*3] = gateX + (Math.random()-0.5)*2;
                    positions[i*3+1] = 7; // Gate height
                    positions[i*3+2] = 2.6; // Gate Z
                } else {
                    positions[i*3+1] = -100;
                }
            } else {
                // Physics: Projectile motion
                positions[i*3+2] += 0.3; // Forward
                positions[i*3+1] -= 0.2; // Gravity
                
                // Splash
                if (positions[i*3+1] < downLevel) {
                     lifes[i] = 0; // Kill on contact
                }
            }
        }
        animatables.hydroSpillFlow.geometry.attributes.position.needsUpdate = true;
        animatables.hydroSpillFlow.geometry.attributes.life.needsUpdate = true;
    }
    
    // 4. Markers Bobbing
    if (animatables.hydroFloodMarkers) {
        animatables.hydroFloodMarkers.forEach((m, i) => {
            m.position.y = 5 + Math.sin(time * 2 + i) * 0.5;
            // Check if flooded
            const markerFloor = -4; // Approx ground height at marker
            if (downLevel > markerFloor + 2) {
                (m.children[0] as THREE.Mesh).material = new THREE.MeshBasicMaterial({color: 0xff0000}); // Danger
            } else {
                 (m.children[0] as THREE.Mesh).material = new THREE.MeshBasicMaterial({color: 0x22c55e}); // Safe
            }
        });
    }
};
