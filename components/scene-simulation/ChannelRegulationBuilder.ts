
import * as THREE from 'three';
import { SimAnimatables } from './three-types';

export const initChannelRegulationScene = (
  group: THREE.Group,
  animatables: SimAnimatables,
  disposables: { dispose: () => void }[]
) => {
  // 1. Lighting
  const ambient = new THREE.AmbientLight(0xffffff, 0.4);
  group.add(ambient);
  const dirLight = new THREE.DirectionalLight(0xffffff, 1.2);
  dirLight.position.set(0, 50, 20);
  group.add(dirLight);

  // 2. Riverbed Terrain (Dynamic)
  // Create a winding riverbed
  const width = 80;
  const length = 120;
  const segW = 64;
  const segL = 128;
  const bedGeo = new THREE.PlaneGeometry(width, length, segW, segL);
  const pos = bedGeo.attributes.position;
  
  // Custom attribute to store initial "flat" positions for morphing
  const initialZ = new Float32Array(pos.count);
  const colors = new Float32Array(pos.count * 3);

  // Define river path function (S-Curve)
  const getPathX = (z: number) => Math.sin(z * 0.05) * 15;

  for(let i=0; i<pos.count; i++) {
      const x = pos.getX(i);
      const y = pos.getY(i); // World Z
      
      const pathX = getPathX(y);
      const dist = x - pathX;
      
      // Channel profile: Shallow banks, deeper center
      // Max depth 8m
      let z = 0;
      if (Math.abs(dist) < 20) {
          // Channel
          const normDist = Math.abs(dist) / 20;
          z = -8 * (1 - Math.pow(normDist, 3)); // Flat bottomish
      } else {
          // Banks
          z = 2 + Math.random() * 0.5;
      }
      
      // Roughness
      z += Math.random() * 0.2;
      
      pos.setZ(i, z);
      initialZ[i] = z;

      // Color (Sand/Silt)
      colors[i*3] = 0.6; colors[i*3+1] = 0.5; colors[i*3+2] = 0.3; 
  }
  
  bedGeo.computeVertexNormals();
  bedGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  bedGeo.rotateX(-Math.PI / 2);
  
  // Store data for animation
  bedGeo.userData = { initialZ, getPathX };

  const bedMat = new THREE.MeshStandardMaterial({ 
      vertexColors: true, 
      roughness: 0.9, 
      flatShading: false
  });
  
  disposables.push(bedGeo, bedMat);
  const bed = new THREE.Mesh(bedGeo, bedMat);
  group.add(bed);
  animatables.crRegRiverbed = bed;

  // Grid Helper (Water surface level)
  const grid = new THREE.GridHelper(width, 20, 0x1e3a8a, 0x0f172a);
  grid.position.y = 0.5;
  group.add(grid);

  // 3. Water Surface
  const waterGeo = new THREE.PlaneGeometry(width, length, 32, 64);
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
  water.position.y = 0; // Water level 0
  group.add(water);
  animatables.crRegWater = water;

  // 4. Spur Dikes (Groynes) - Regulating Structures
  animatables.crRegDikes = [];
  const dikeGeo = new THREE.BoxGeometry(10, 3, 2); // Length varies
  const dikeMat = new THREE.MeshStandardMaterial({ color: 0x64748b });
  disposables.push(dikeGeo, dikeMat);

  // Create pool of dikes (hidden initially)
  for(let i=0; i<12; i++) {
      const dike = new THREE.Mesh(dikeGeo, dikeMat);
      dike.position.set(0, -100, 0);
      group.add(dike);
      animatables.crRegDikes.push(dike as unknown as THREE.Group);
  }

  // 5. Flow Particles
  const pCount = 2000;
  const pGeo = new THREE.BufferGeometry();
  const pPos = new Float32Array(pCount * 3);
  const pSpeed = new Float32Array(pCount); // scalar speed
  
  for(let i=0; i<pCount; i++) {
      pPos[i*3] = (Math.random()-0.5) * 60;
      pPos[i*3+1] = -2 + Math.random() * 2;
      pPos[i*3+2] = (Math.random()-0.5) * 120;
      pSpeed[i] = 0;
  }
  
  pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
  pGeo.setAttribute('speed', new THREE.BufferAttribute(pSpeed, 1));
  
  const pMat = new THREE.PointsMaterial({ color: 0xa5f3fc, size: 0.15, transparent: true, opacity: 0.6 });
  disposables.push(pGeo, pMat);
  const particles = new THREE.Points(pGeo, pMat);
  group.add(particles);
  animatables.crRegFlowParticles = particles;

  // 6. Ship (Simple Hull)
  const shipGroup = new THREE.Group();
  animatables.crRegShip = shipGroup;
  
  const hullGeo = new THREE.BoxGeometry(3, 1.5, 10);
  const hullMat = new THREE.MeshStandardMaterial({ color: 0xef4444 });
  disposables.push(hullGeo, hullMat);
  const hull = new THREE.Mesh(hullGeo, hullMat);
  hull.position.y = 0.5;
  shipGroup.add(hull);
  
  // Cabin
  const cabGeo = new THREE.BoxGeometry(2.5, 1.5, 2);
  const cabMat = new THREE.MeshStandardMaterial({ color: 0xffffff });
  disposables.push(cabGeo, cabMat);
  const cab = new THREE.Mesh(cabGeo, cabMat);
  cab.position.set(0, 2, -3);
  shipGroup.add(cab);

  group.add(shipGroup);
};

export const animateChannelRegulationScene = (animatables: SimAnimatables, time: number, simData: any) => {
    // simData: { dikeLength: number, flowRate: number, timeStep: number }
    const dikeLen = simData?.dikeLength || 0; // 0 to 15m extension
    const flow = simData?.flowRate || 1000;
    const year = simData?.timeStep || 0;

    // 1. Position Dikes
    // Arrange dikes along outer bends to narrow channel
    // Path function (same as init)
    const getPathX = (z: number) => Math.sin(z * 0.05) * 15;
    
    if (animatables.crRegDikes) {
        const dikeSpacing = 20;
        animatables.crRegDikes.forEach((dike, i) => {
            const z = -50 + i * dikeSpacing;
            if (z > 50) {
                 dike.position.y = -100; // Hide unused
                 return;
            }
            
            const pathX = getPathX(z);
            const curvature = Math.cos(z * 0.05); // Derivative sign indicates bend
            
            // Place on convex side (inner bank) to narrow? Or concave side to protect bank?
            // Usually dikes are used to narrow channel and deepen thalweg.
            // Let's place pairs to narrow width to constant.
            
            // Channel center is pathX. Banks are at +/- 20 from center approx.
            // Place dike on Left bank
            const mesh = dike as unknown as THREE.Mesh;
            
            // If dikeLen > 0, show dikes
            if (dikeLen > 1) {
                // Scale length
                mesh.scale.x = dikeLen / 10; // Base geo width 10
                
                // Left Bank Dike
                if (i % 2 === 0) {
                   mesh.position.set(pathX - 20 + dikeLen/2, 1, z);
                } 
                // Right Bank Dike
                else {
                   mesh.position.set(pathX + 20 - dikeLen/2, 1, z);
                }
            } else {
                mesh.position.y = -100;
            }
        });
    }

    // 2. Morph Riverbed (Scour & Deposition)
    if (animatables.crRegRiverbed) {
        const geo = animatables.crRegRiverbed.geometry;
        const pos = geo.attributes.position;
        const col = geo.attributes.color;
        const initialZ = geo.userData.initialZ;
        
        // Scour logic:
        // Velocity increases where channel is narrow (due to dikes).
        // Original width ~40. Constricted width = 40 - 2*dikeLen.
        // Scour depth proportional to (Flow / Width)^2
        
        const constriction = Math.max(10, 40 - 2 * dikeLen); // Min width 10
        const scourDepth = (flow / 1000) * (40 / constriction) * year * 0.5; // Evolution over years

        for(let i=0; i<pos.count; i++) {
            const x = pos.getX(i);
            const y = pos.getY(i); // World Z
            const pathX = getPathX(y);
            const dist = x - pathX;
            
            let newZ = initialZ[i];
            
            // If in main channel (center), scour
            if (Math.abs(dist) < constriction / 2) {
                 newZ -= scourDepth * Math.cos((dist / (constriction/2)) * Math.PI / 2);
            } 
            // If behind dikes (banks), silt up (deposition)
            else if (Math.abs(dist) < 20 && dikeLen > 1) {
                 newZ += year * 0.2; // Silt accumulation
            }
            
            // Clamp
            newZ = Math.max(-15, Math.min(3, newZ));
            pos.setZ(i, newZ);

            // Color update based on change
            const diff = newZ - initialZ[i];
            if (diff < -0.5) col.setXYZ(i, 0.4, 0.4, 0.4); // Scoured rock (Dark grey)
            else if (diff > 0.5) col.setXYZ(i, 0.8, 0.7, 0.4); // Deposited sand (Yellowish)
            else col.setXYZ(i, 0.6, 0.5, 0.3); // Original
        }
        pos.needsUpdate = true;
        col.needsUpdate = true;
        geo.computeVertexNormals();
    }

    // 3. Flow Particles
    if (animatables.crRegFlowParticles) {
        const positions = animatables.crRegFlowParticles.geometry.attributes.position.array as Float32Array;
        const speedBase = flow / 1000 * 0.2;
        
        for(let i=0; i<positions.length; i+=3) {
            // Move Z
            let z = positions[i*3+2];
            let x = positions[i*3];
            
            // Calculate local width at Z
            // If dikes present, width constricts
            const pathX = getPathX(z);
            const dist = Math.abs(x - pathX);
            
            // Velocity profile
            let v = speedBase;
            if (dikeLen > 1) {
                // Accelerate in center, slow at edges
                if (dist < 20 - dikeLen) v *= 1.5; // Fast in channel
                else v *= 0.2; // Dead zone
            }
            
            z += v;
            
            // Follow channel curve
            // Calculate target X based on new Z
            const targetX = getPathX(z);
            // Drifting towards path
            x += (targetX - x) * 0.01;
            
            // Loop
            if (z > 60) {
                z = -60;
                x = getPathX(z) + (Math.random()-0.5) * 30;
            }
            
            positions[i*3] = x;
            positions[i*3+2] = z;
        }
        animatables.crRegFlowParticles.geometry.attributes.position.needsUpdate = true;
    }

    // 4. Ship Movement
    if (animatables.crRegShip) {
        // Move along pathX
        const t = (time * 0.05) % 1; // 0 to 1 loop
        const z = -60 + t * 120;
        const x = getPathX(z);
        
        animatables.crRegShip.position.set(x, 0, z);
        
        // Orientation (Derivative)
        const nextX = getPathX(z + 1);
        animatables.crRegShip.lookAt(nextX, 0, z + 1);
        
        // Bobbing
        animatables.crRegShip.position.y = Math.sin(time * 2) * 0.1;
    }
};
