
import * as THREE from 'three';
import { SedimentAnimatables, SedimentSimState } from './three-types';

export const initSedimentScene = (
  group: THREE.Group, 
  animatables: SedimentAnimatables,
  disposables: { dispose: () => void }[]
) => {
  // --- Materials ---
  const bedMat = new THREE.MeshStandardMaterial({ 
    color: 0x292524, roughness: 0.9, flatShading: true // Dark rock
  });
  const sedimentMat = new THREE.MeshStandardMaterial({ 
    color: 0xd97706, roughness: 1.0, metalness: 0.1 // Muddy/silt color
  });
  const waterMat = new THREE.MeshPhysicalMaterial({ 
    color: 0x06b6d4, transmission: 0.8, opacity: 0.5, transparent: true, roughness: 0.2 
  });
  const sliceMat = new THREE.MeshBasicMaterial({ 
    color: 0x22d3ee, transparent: true, opacity: 0.2, side: THREE.DoubleSide, wireframe: false
  });
  const particleMat = new THREE.PointsMaterial({
    color: 0x92400e, size: 0.15, transparent: true, opacity: 0.6
  });

  disposables.push(bedMat, sedimentMat, waterMat, sliceMat, particleMat);

  // 1. Original River Bed (Terrain)
  // Create a canyon shape: High on x sides, low in center
  const width = 40;
  const length = 60;
  const segW = 64;
  const segH = 64;
  
  const bedGeo = new THREE.PlaneGeometry(width, length, segW, segH);
  const pos = bedGeo.attributes.position;
  
  // Create height map function
  const getHeight = (x: number, z: number) => {
      // Normalized coords -1 to 1
      const nx = x / (width/2);
      // Canyon shape: x^2
      let h = Math.pow(nx, 2) * 8; 
      // Add noise
      h += Math.sin(x * 0.5) * Math.cos(z * 0.5) * 0.5;
      // Slope downstream (z)
      h += (z / length) * 5; 
      return h;
  };

  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const z = pos.getY(i); // Plane is Z-up in creation, rotated later
    pos.setZ(i, getHeight(x, z));
  }
  bedGeo.computeVertexNormals();
  disposables.push(bedGeo);

  const bed = new THREE.Mesh(bedGeo, bedMat);
  bed.rotation.x = -Math.PI / 2;
  group.add(bed);
  animatables.riverBed = bed;

  // 2. Sediment Layer (Dynamic Mesh)
  // Initially flat or matching bed. We will morph this in animation.
  const sedGeo = bedGeo.clone(); // Start with same topology
  disposables.push(sedGeo);
  const sediment = new THREE.Mesh(sedGeo, sedimentMat);
  sediment.rotation.x = -Math.PI / 2;
  sediment.position.y = 0.05; // Slightly above to avoid z-fight initially
  group.add(sediment);
  animatables.sedimentMesh = sediment;

  // 3. Water Surface
  const waterGeo = new THREE.BoxGeometry(width, 10, length);
  waterGeo.translate(0, 5, 0); // Water level up to 10 approx
  disposables.push(waterGeo);
  const water = new THREE.Mesh(waterGeo, waterMat);
  water.position.y = 0;
  group.add(water);
  animatables.waterSurface = water;

  // 4. Suspended Particles
  const pCount = 1000;
  const pGeo = new THREE.BufferGeometry();
  const pPos = new Float32Array(pCount * 3);
  for(let i=0; i<pCount; i++) {
      pPos[i*3] = (Math.random() - 0.5) * 20;
      pPos[i*3+1] = Math.random() * 8;
      pPos[i*3+2] = (Math.random() - 0.5) * 60;
  }
  pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
  disposables.push(pGeo);
  const particles = new THREE.Points(pGeo, particleMat);
  group.add(particles);
  animatables.suspendedParticles = particles;

  // 5. Cross Section Slicer
  const sliceGroup = new THREE.Group();
  const plane = new THREE.Mesh(new THREE.PlaneGeometry(40, 15), sliceMat);
  plane.position.y = 5;
  sliceGroup.add(plane);
  
  // Frame
  const frameGeo = new THREE.BoxGeometry(40.2, 15.2, 0.2);
  const frame = new THREE.Mesh(frameGeo, new THREE.MeshBasicMaterial({color: 0x22d3ee, wireframe: true}));
  frame.position.y = 5;
  sliceGroup.add(frame);

  sliceGroup.visible = false;
  group.add(sliceGroup);
  animatables.sectionSlicer = sliceGroup;

  // Grid
  const grid = new THREE.GridHelper(60, 20, 0x44403c, 0x1c1917);
  grid.position.y = -2;
  group.add(grid);
};

export const animateSedimentScene = (
  animatables: SedimentAnimatables, 
  state: SedimentSimState,
  time: number
) => {
  // 1. Update Sediment Geometry based on accumulationFactor
  if (animatables.sedimentMesh && animatables.riverBed) {
      const bedPos = animatables.riverBed.geometry.attributes.position;
      const sedPos = animatables.sedimentMesh.geometry.attributes.position;
      
      const width = 40;
      const length = 60;
      
      for(let i=0; i<bedPos.count; i++) {
          const x = bedPos.getX(i);
          const z = bedPos.getY(i); // Local Y is world Z due to rotation
          const baseH = bedPos.getZ(i); // Local Z is world Y

          // Sediment accumulation logic:
          // More accumulation upstream (negative Z in local, positive Z in world after rotation?)
          // Let's assume z goes -30 to 30.
          // Deposition decreases towards dam (z=30).
          // Deepest in the channel center (x=0).
          
          const zFactor = (z + 30) / 60; // 0 to 1
          const xFactor = 1 - Math.abs(x / (width/2)); // 1 at center, 0 at walls
          
          // Max sediment depth
          const maxDepth = 8 * state.accumulationFactor; 
          
          // Accumulation shape: Thick at start (z=-30), thinning at dam (z=30)
          let depth = maxDepth * (1 - zFactor * 0.8) * xFactor;
          
          // Don't go below bed
          if (depth < 0) depth = 0;
          
          // Also don't exceed water level too much (simplified)
          
          sedPos.setZ(i, baseH + depth);
      }
      animatables.sedimentMesh.geometry.attributes.position.needsUpdate = true;
      animatables.sedimentMesh.geometry.computeVertexNormals();
  }

  // 2. Particles Flow
  if (animatables.suspendedParticles) {
      const positions = animatables.suspendedParticles.geometry.attributes.position.array as Float32Array;
      for(let i=0; i<positions.length; i+=3) {
          positions[i+2] += 0.2; // Flow downstream
          if (positions[i+2] > 30) {
              positions[i+2] = -30;
              positions[i] = (Math.random() - 0.5) * 20;
              positions[i+1] = Math.random() * 8;
          }
      }
      animatables.suspendedParticles.geometry.attributes.position.needsUpdate = true;
      // Opacity based on year (more silt in later years?)
      (animatables.suspendedParticles.material as THREE.PointsMaterial).opacity = 0.3 + state.accumulationFactor * 0.5;
  }

  // 3. Slicer Animation
  if (animatables.sectionSlicer) {
      if (state.isSlicing) {
          animatables.sectionSlicer.visible = true;
          // Smooth move to target Z
          animatables.sectionSlicer.position.z = THREE.MathUtils.lerp(animatables.sectionSlicer.position.z, state.slicePosition, 0.1);
      } else {
          animatables.sectionSlicer.visible = false;
      }
  }
};
