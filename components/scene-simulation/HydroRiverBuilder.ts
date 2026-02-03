
import * as THREE from 'three';
import { SimAnimatables } from './three-types';

export const initHydroRiverScene = (
  group: THREE.Group,
  animatables: SimAnimatables,
  disposables: { dispose: () => void }[]
) => {
  // 1. Lighting
  const ambient = new THREE.AmbientLight(0xffffff, 0.4);
  group.add(ambient);
  const dirLight = new THREE.DirectionalLight(0xffffff, 1.2);
  dirLight.position.set(-10, 20, -10);
  group.add(dirLight);

  // 2. Riverbed Terrain (Deformable)
  const width = 30;
  const length = 60;
  const segW = 60;
  const segL = 120;
  const bedGeo = new THREE.PlaneGeometry(width, length, segW, segL);
  
  // Initialize shape: S-Curve Channel
  const pos = bedGeo.attributes.position;
  const initialZ = new Float32Array(pos.count); // Store initial heights for comparison
  const colors = new Float32Array(pos.count * 3);

  for(let i=0; i<pos.count; i++) {
      const x = pos.getX(i);
      const y = pos.getY(i); // Local Y is world Z (length)
      
      // S-Curve path function
      const pathX = Math.sin(y * 0.1) * 6;
      const dist = x - pathX;
      
      // Channel profile
      let z = 0;
      if (Math.abs(dist) < 8) {
          // River bed
          z = -4 + Math.pow(Math.abs(dist)/8, 2) * 2;
      } else {
          // Banks
          z = 1 + Math.random() * 0.2;
      }
      
      // Add slight random roughness
      z += Math.random() * 0.1;

      pos.setZ(i, z);
      initialZ[i] = z;

      // Init Color (Sand)
      colors[i*3] = 0.76;
      colors[i*3+1] = 0.7;
      colors[i*3+2] = 0.5;
  }
  
  bedGeo.computeVertexNormals();
  bedGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  bedGeo.rotateX(-Math.PI / 2); // Lay flat
  
  // Store initial Z in geometry for access in animation
  bedGeo.userData = { initialZ };

  const bedMat = new THREE.MeshStandardMaterial({ 
      vertexColors: true, 
      roughness: 0.9,
      flatShading: true 
  });
  
  disposables.push(bedGeo, bedMat);
  const riverBed = new THREE.Mesh(bedGeo, bedMat);
  group.add(riverBed);
  animatables.riverBed = riverBed;

  // Grid for reference
  const grid = new THREE.GridHelper(60, 20, 0x334155, 0x0f172a);
  grid.position.y = 1.1; // Above banks
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
  water.position.y = -1; // Water level
  group.add(water);
  animatables.riverWaterSurface = water;

  // 4. Spur Dikes (Groynes) - Regulating structures
  animatables.riverGroynes = [];
  const groyneGeo = new THREE.BoxGeometry(6, 2, 1);
  const groyneMat = new THREE.MeshStandardMaterial({ color: 0x475569 });
  disposables.push(groyneGeo, groyneMat);

  // Place groynes on outer bends to protect banks / narrow channel
  const groynePositions = [
      { y: 15, x: -10, rot: 0.2 }, // Left bank
      { y: 5, x: -11, rot: 0.1 },
      { y: -15, x: 10, rot: -0.2 }, // Right bank
      { y: -25, x: 11, rot: -0.1 },
  ];

  groynePositions.forEach(p => {
      const g = new THREE.Mesh(groyneGeo, groyneMat);
      g.position.set(p.x, -1, p.y); // Partially submerged
      g.rotation.y = p.rot;
      group.add(g);
      animatables.riverGroynes?.push(g as unknown as THREE.Group);
  });

  // 5. Sediment Particles
  const pCount = 2000;
  const pGeo = new THREE.BufferGeometry();
  const pPos = new Float32Array(pCount * 3);
  const pSize = new Float32Array(pCount);
  
  for(let i=0; i<pCount; i++) {
      pPos[i*3] = (Math.random() - 0.5) * 10;
      pPos[i*3+1] = -2 + Math.random() * 1.5; // Suspended
      pPos[i*3+2] = -30 + Math.random() * 60; // Spread along length
      pSize[i] = Math.random();
  }
  pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
  pGeo.setAttribute('size', new THREE.BufferAttribute(pSize, 1));
  
  const pMat = new THREE.PointsMaterial({ 
      color: 0xd97706, // Muddy brown/orange
      size: 0.15,
      transparent: true,
      opacity: 0.8
  });
  disposables.push(pGeo, pMat);
  const particles = new THREE.Points(pGeo, pMat);
  group.add(particles);
  animatables.riverSedimentParticles = particles;

  // 6. Velocity Vectors (Arrows)
  const vCount = 100;
  const arrowGeo = new THREE.ConeGeometry(0.2, 0.8, 8);
  arrowGeo.rotateX(Math.PI / 2); // Point Z
  const arrowMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
  disposables.push(arrowGeo, arrowMat);
  
  const vectors = new THREE.InstancedMesh(arrowGeo, arrowMat, vCount);
  const dummy = new THREE.Object3D();
  
  // Grid of arrows
  let idx = 0;
  for(let z=-25; z<=25; z+=5) {
      for(let x=-8; x<=8; x+=4) {
          if (idx < vCount) {
             dummy.position.set(x, 0, z);
             dummy.updateMatrix();
             vectors.setMatrixAt(idx++, dummy.matrix);
          }
      }
  }
  group.add(vectors);
  animatables.riverVelocityVectors = vectors;
};

export const animateHydroRiverScene = (animatables: SimAnimatables, time: number, simData: any) => {
    // simData: { flowRate: number, sedimentLoad: number, timeStep: number }
    const flow = simData?.flowRate || 1000;
    const load = simData?.sedimentLoad || 5;
    const years = simData?.timeStep || 0; // Simulated years elapsed
    
    // 1. Morph Riverbed (Scour & Silt)
    if (animatables.riverBed) {
        const geo = animatables.riverBed.geometry;
        const pos = geo.attributes.position;
        const col = geo.attributes.color;
        const initialZ = geo.userData.initialZ;
        
        const scourFactor = flow / 2000; // More flow = more scour potential
        const siltFactor = load / 10;    // More load = more silt potential

        for(let i=0; i<pos.count; i++) {
            const x = pos.getX(i);
            const y = pos.getY(i); // Local Y is world Z
            
            // Flow Logic:
            // High velocity at outer bends -> Scour
            // Low velocity at inner bends / behind dikes -> Silt
            
            const pathX = Math.sin(y * 0.1) * 6;
            const dist = x - pathX;
            const curvature = Math.cos(y * 0.1); // Derivative of path (roughly)
            
            // Outer bend check (if curvature > 0 and x > path, or curvature < 0 and x < path)
            // Simplified: Scour where water hits wall
            let localVel = 1.0;
            
            // Dike Influence
            // Check proximity to any dike
            let nearDike = false;
            // Dike positions hardcoded in init, approximate here:
            // Left bank dikes at y=15, 5. Right bank at y=-15, -25.
            if ((Math.abs(y-15)<2 && x < -5) || (Math.abs(y-5)<2 && x < -5)) nearDike = true; // Left
            if ((Math.abs(y+15)<2 && x > 5) || (Math.abs(y+25)<2 && x > 5)) nearDike = true; // Right
            
            if (nearDike) {
                // Silt behind dike, Scour at tip
                if (Math.abs(x) > 8) localVel = 0.1; // Behind
                else localVel = 1.5; // Tip squeeze
            } else {
                // Channel Flow
                if (Math.abs(dist) < 6) localVel = 1.0 + Math.abs(curvature) * 0.5; // Faster in bends?
            }

            // Calculate Change
            // Erosion: if velocity high
            // Deposition: if velocity low
            let deltaZ = 0;
            if (localVel > 1.2) {
                deltaZ = -0.05 * scourFactor * years * (localVel - 1); // Erode
            } else if (localVel < 0.5) {
                deltaZ = 0.05 * siltFactor * years * (1 - localVel); // Deposit
            }
            
            // Apply with limit
            const currentZ = initialZ[i] + deltaZ;
            // Don't erode below bedrock (-8) or pile up too high (-1)
            const clampedZ = Math.max(-8, Math.min(-1, currentZ));
            
            pos.setZ(i, clampedZ);
            
            // Color Mapping
            // Initial (Sand) -> Scour (Red) -> Silt (Blue/Green)
            const diff = clampedZ - initialZ[i];
            if (diff < -0.5) {
                // Scour
                col.setXYZ(i, 0.9, 0.3, 0.3); 
            } else if (diff > 0.5) {
                // Silt
                col.setXYZ(i, 0.2, 0.8, 0.4);
            } else {
                // Baseline
                col.setXYZ(i, 0.76, 0.7, 0.5);
            }
        }
        pos.needsUpdate = true;
        col.needsUpdate = true;
    }
    
    // 2. Animate Particles
    if (animatables.riverSedimentParticles) {
        const positions = animatables.riverSedimentParticles.geometry.attributes.position.array as Float32Array;
        
        for(let i=0; i<positions.length; i+=3) {
            // Move downstream (+Z in local plane? No, plane rotated. World Z is length)
            // World Z increases means downstream (based on init direction)
            
            const x = positions[i];
            const z = positions[i+2];
            
            // Follow path
            const pathX = Math.sin(z * 0.1) * 6;
            const targetX = pathX + (Math.random()-0.5) * 6;
            
            // Move Z
            positions[i+2] += 0.2 * (flow / 1000);
            // Move X towards flow path
            positions[i] += (targetX - x) * 0.02;
            
            // Reset
            if (positions[i+2] > 30) {
                positions[i+2] = -30;
                positions[i] = (Math.random()-0.5) * 10;
            }
        }
        animatables.riverSedimentParticles.geometry.attributes.position.needsUpdate = true;
    }
    
    // 3. Update Vectors
    if (animatables.riverVelocityVectors) {
        const mesh = animatables.riverVelocityVectors;
        const dummy = new THREE.Object3D();
        
        for(let i=0; i<mesh.count; i++) {
            mesh.getMatrixAt(i, dummy.matrix);
            dummy.matrix.decompose(dummy.position, dummy.quaternion, dummy.scale);
            
            const x = dummy.position.x;
            const z = dummy.position.z;
            
            // Orientation
            const pathX = Math.sin(z * 0.1) * 6;
            const tangentZ = 1;
            const tangentX = Math.cos(z * 0.1) * 0.6; // Derivative
            
            dummy.lookAt(x + tangentX, 0, z + tangentZ);
            
            // Scale based on flow speed in that area
            // Approx logic from terrain loop
            let localVel = 1.0;
            if (Math.abs(x - pathX) > 8) localVel = 0.2; // Banks
            
            const s = 0.5 * localVel * (flow/1000);
            dummy.scale.set(s, s, s*3);
            
            dummy.updateMatrix();
            mesh.setMatrixAt(i, dummy.matrix);
        }
        mesh.instanceMatrix.needsUpdate = true;
    }
};
