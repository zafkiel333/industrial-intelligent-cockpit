
import * as THREE from 'three';
import { SimAnimatables } from './three-types';

export const initHydroSedimentScene = (
  group: THREE.Group,
  animatables: SimAnimatables,
  disposables: { dispose: () => void }[]
) => {
  // 1. Lighting
  const ambient = new THREE.AmbientLight(0xffffff, 0.4);
  group.add(ambient);
  const dirLight = new THREE.DirectionalLight(0xffffff, 1.2);
  dirLight.position.set(-10, 20, 10);
  group.add(dirLight);

  // 2. Valley Terrain (Static container)
  // U-Shape valley, Dam at Z=15
  const width = 40;
  const length = 60; // Z axis
  const terrainGeo = new THREE.PlaneGeometry(width, length, 32, 64);
  const pos = terrainGeo.attributes.position;
  
  for(let i=0; i<pos.count; i++) {
      const x = pos.getX(i);
      const y = pos.getY(i); // Z
      
      // Valley Shape
      let h = Math.pow(x/10, 2) * 2; // Parabola
      // Slope down towards dam (y=30 is dam, y=-30 is upstream)
      h += (y - 30) * -0.1; 
      
      // River bed flattening
      if (Math.abs(x) < 5) h = Math.min(h, -5 + (y-30)*-0.05);

      pos.setZ(i, h);
  }
  terrainGeo.computeVertexNormals();
  terrainGeo.rotateX(-Math.PI / 2);

  const terrainMat = new THREE.MeshStandardMaterial({ 
      color: 0x334155, 
      roughness: 0.9, 
      metalness: 0.1,
      side: THREE.DoubleSide
  });
  disposables.push(terrainGeo, terrainMat);
  const terrain = new THREE.Mesh(terrainGeo, terrainMat);
  group.add(terrain);
  animatables.sedTerrain = terrain;

  // 3. Sediment Layer (Dynamic Mesh)
  // Initially follows river bed but slightly raised
  const sedGeo = new THREE.PlaneGeometry(width, length, 32, 64);
  const sedPos = sedGeo.attributes.position;
  
  // Custom attribute to store "potential" height for animation
  const baseHeight = new Float32Array(sedPos.count);

  for(let i=0; i<sedPos.count; i++) {
      const x = sedPos.getX(i);
      const y = sedPos.getY(i); // Z
      
      // Only exist in river channel
      if (Math.abs(x) < 8) {
         let h = -5 + (y-30)*-0.05; // Base Bed
         baseHeight[i] = h;
         // Add initial sediment wedge at tail (Upstream)
         // Tail is at y=-30
         if (y < 0) {
             h += Math.max(0, (y + 30) * 0.1); 
         }
         sedPos.setZ(i, h);
      } else {
         sedPos.setZ(i, -20); // Hide under terrain
         baseHeight[i] = -20;
      }
  }
  sedGeo.computeVertexNormals();
  sedGeo.rotateX(-Math.PI / 2);
  sedGeo.userData = { baseHeight }; // Store for animation

  const sedMat = new THREE.MeshStandardMaterial({ 
      color: 0x92400e, // Mud/Sand color
      roughness: 1.0, 
      flatShading: false
  });
  disposables.push(sedGeo, sedMat);
  const sediment = new THREE.Mesh(sedGeo, sedMat);
  group.add(sediment);
  animatables.sedSedimentMesh = sediment;

  // 4. Dam Structure
  const damGroup = new THREE.Group();
  damGroup.position.set(0, 0, 30);
  group.add(damGroup);
  animatables.sedDam = damGroup;

  const damGeo = new THREE.BoxGeometry(20, 10, 4);
  const damMat = new THREE.MeshStandardMaterial({ color: 0x64748b });
  disposables.push(damGeo, damMat);
  const dam = new THREE.Mesh(damGeo, damMat);
  dam.position.y = 0; // Center is 0, height 10 (-5 to 5). Bed is at -5. Perfect.
  damGroup.add(dam);

  // Sluice Gates (Bottom outlets)
  animatables.sedSluiceGates = [];
  const gateGeo = new THREE.BoxGeometry(2, 2, 1);
  const gateMat = new THREE.MeshBasicMaterial({ color: 0x111111 });
  disposables.push(gateGeo, gateMat);
  
  [-4, 4].forEach(x => {
      const gate = new THREE.Mesh(gateGeo, gateMat);
      gate.position.set(x, -3, 2); // Bottom of dam face
      damGroup.add(gate);
      animatables.sedSluiceGates?.push(gate);
  });

  // 5. Water Volume
  const waterGeo = new THREE.PlaneGeometry(width, length);
  waterGeo.rotateX(-Math.PI / 2);
  const waterMat = new THREE.MeshPhysicalMaterial({ 
      color: 0x0ea5e9, 
      transparent: true, 
      opacity: 0.6,
      roughness: 0.1,
      metalness: 0.1,
      transmission: 0.4
  });
  disposables.push(waterGeo, waterMat);
  const water = new THREE.Mesh(waterGeo, waterMat);
  water.position.y = 2; // High water level
  group.add(water);
  animatables.sedWater = water;

  // 6. Particles (Incoming Sediment & Density Current)
  const pCount = 1000;
  const pGeo = new THREE.BufferGeometry();
  const pPos = new Float32Array(pCount * 3);
  for(let i=0; i<pCount; i++) {
      pPos[i*3] = (Math.random()-0.5) * 10;
      pPos[i*3+1] = -100; // Hide
      pPos[i*3+2] = -30;
  }
  pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
  
  const pMat = new THREE.PointsMaterial({ 
      color: 0xb45309, // Silt color
      size: 0.2, 
      transparent: true, 
      opacity: 0.6 
  });
  disposables.push(pGeo, pMat);
  const inflow = new THREE.Points(pGeo, pMat);
  group.add(inflow);
  animatables.sedInflowParticles = inflow;

  // Outflow Plume
  const outCount = 500;
  const outGeo = new THREE.BufferGeometry();
  const outPos = new Float32Array(outCount * 3);
  for(let i=0; i<outCount; i++) {
      outPos[i*3] = 0; outPos[i*3+1] = -100; outPos[i*3+2] = 30;
  }
  outGeo.setAttribute('position', new THREE.BufferAttribute(outPos, 3));
  const outMat = new THREE.PointsMaterial({ color: 0x78350f, size: 0.4 });
  disposables.push(outGeo, outMat);
  const outflow = new THREE.Points(outGeo, outMat);
  group.add(outflow);
  animatables.sedOutflowParticles = outflow;
};

export const animateHydroSedimentScene = (animatables: SimAnimatables, time: number, simData: any) => {
    // simData: { waterLevel: number, flushing: boolean, sedimentLoad: number }
    const waterLvl = simData?.waterLevel ?? 0; // -5 to 5 range visually
    const isFlushing = simData?.flushing || false;
    const sedLoad = simData?.sedimentLoad || 0.5;

    // 1. Water Level
    if (animatables.sedWater) {
        // Map abstract level to Y pos
        // Bed is -5. Max dam is 5.
        const targetY = -4 + (waterLvl / 100) * 8; // range -4 to 4
        animatables.sedWater.position.y = THREE.MathUtils.lerp(animatables.sedWater.position.y, targetY, 0.05);
        
        // Color change: Turbid if flushing or high sediment
        const mat = animatables.sedWater.material as THREE.MeshPhysicalMaterial;
        const targetColor = (isFlushing || sedLoad > 0.8) ? new THREE.Color(0x78350f) : new THREE.Color(0x0ea5e9);
        mat.color.lerp(targetColor, 0.05);
    }

    // 2. Sediment Morphology (The core simulation)
    if (animatables.sedSedimentMesh) {
        const geo = animatables.sedSedimentMesh.geometry;
        const pos = geo.attributes.position;
        const baseZ = geo.userData.baseHeight as Float32Array; // Original bed elevation

        for(let i=0; i<pos.count; i++) {
            const x = pos.getX(i);
            const z = pos.getY(i); // World Z
            
            // Only affect river channel
            if (baseZ[i] > -10) {
                let currentH = pos.getZ(i);
                
                // Deposition Logic:
                // Happens mostly at tail (upstream, z < -10) where velocity drops
                // Or forming delta moving forward
                if (sedLoad > 0) {
                    const deltaFront = -20 + Math.sin(time * 0.1) * 10; // Moves forward
                    // If behind delta front, deposit
                    if (z < deltaFront) {
                        currentH += sedLoad * 0.005;
                    }
                }

                // Flushing Logic:
                // Scouring happens near dam (z > 10) forming a funnel
                if (isFlushing) {
                    const distToDam = 30 - z;
                    if (distToDam < 30 && Math.abs(x) < 4) {
                         // Erosion channel
                         currentH -= 0.05 * (1 - distToDam/30);
                    }
                }

                // Limit: Can't go below bedrock (baseZ) or above water
                currentH = Math.max(baseZ[i], currentH);
                if (animatables.sedWater) {
                    currentH = Math.min(animatables.sedWater.position.y, currentH);
                }

                pos.setZ(i, currentH);
            }
        }
        pos.needsUpdate = true;
        geo.computeVertexNormals();
    }

    // 3. Particles
    // Inflow
    if (animatables.sedInflowParticles) {
        const pPos = animatables.sedInflowParticles.geometry.attributes.position.array as Float32Array;
        const count = pPos.length/3;
        for(let i=0; i<count; i++) {
            if (pPos[i*3+1] < -10) {
                // Respawn
                if (animatables.sedWater) {
                    pPos[i*3] = (Math.random()-0.5) * 8;
                    pPos[i*3+1] = animatables.sedWater.position.y - Math.random();
                    pPos[i*3+2] = -30;
                }
            } else {
                // Move downstream
                pPos[i*3+2] += 0.2;
                // Sink (Density current)
                pPos[i*3+1] -= 0.02;
                // Kill if hits dam
                if (pPos[i*3+2] > 29) pPos[i*3+1] = -100;
            }
        }
        animatables.sedInflowParticles.geometry.attributes.position.needsUpdate = true;
        (animatables.sedInflowParticles.material as THREE.PointsMaterial).opacity = sedLoad;
    }

    // Outflow (Flushing Plume)
    if (animatables.sedOutflowParticles) {
        const oPos = animatables.sedOutflowParticles.geometry.attributes.position.array as Float32Array;
        const count = oPos.length/3;
        const isActive = isFlushing;

        for(let i=0; i<count; i++) {
            if (isActive && oPos[i*3+1] < -10) {
                // Respawn at sluice gates
                const gateX = Math.random() > 0.5 ? 4 : -4;
                oPos[i*3] = gateX + (Math.random()-0.5);
                oPos[i*3+1] = -3;
                oPos[i*3+2] = 31;
            } else if (oPos[i*3+1] > -10) {
                // Jet out
                oPos[i*3+2] += 0.5;
                oPos[i*3+1] -= 0.1; // Gravity
                oPos[i*3] += (Math.random()-0.5) * 0.1; // Spread
                
                if (oPos[i*3+2] > 60) oPos[i*3+1] = -100;
            }
        }
        animatables.sedOutflowParticles.geometry.attributes.position.needsUpdate = true;
    }

    // 4. Gates Open/Close
    if (animatables.sedSluiceGates) {
        animatables.sedSluiceGates.forEach(g => {
            (g.material as THREE.MeshBasicMaterial).color.setHex(isFlushing ? 0x22c55e : 0x111111);
        });
    }
};
