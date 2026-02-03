
import * as THREE from 'three';
import { SimAnimatables } from './three-types';

export const initHydroUrbanScene = (
  group: THREE.Group,
  animatables: SimAnimatables,
  disposables: { dispose: () => void }[]
) => {
  // 1. Lighting (Stormy City)
  const ambient = new THREE.AmbientLight(0xffffff, 0.2); // Darker ambient
  group.add(ambient);
  
  const cityLight = new THREE.PointLight(0x0ea5e9, 0.5, 50);
  cityLight.position.set(0, 20, 0);
  group.add(cityLight);

  // 2. City Grid Layout (Roads & Foundation)
  const citySize = 60;
  const blockSize = 8;
  const roadWidth = 2;
  
  const groundGeo = new THREE.PlaneGeometry(citySize, citySize);
  groundGeo.rotateX(-Math.PI / 2);
  const groundMat = new THREE.MeshStandardMaterial({ 
      color: 0x1e293b, // Dark Asphalt
      roughness: 0.8 
  });
  disposables.push(groundGeo, groundMat);
  const ground = new THREE.Mesh(groundGeo, groundMat);
  ground.position.y = -0.1;
  group.add(ground);
  animatables.huRoads = ground;

  // Grid helper for tech feel
  const grid = new THREE.GridHelper(citySize, citySize / (blockSize+roadWidth) * 2, 0x334155, 0x0f172a);
  grid.position.y = 0;
  group.add(grid);

  // 3. Buildings (Holographic / Abstract)
  const buildingGroup = new THREE.Group();
  group.add(buildingGroup);
  animatables.huBuildings = buildingGroup;

  const buildMat = new THREE.MeshPhysicalMaterial({ 
      color: 0x64748b,
      transparent: true,
      opacity: 0.3,
      roughness: 0.2,
      metalness: 0.8,
      wireframe: false
  });
  const edgeMat = new THREE.LineBasicMaterial({ color: 0x0ea5e9, transparent: true, opacity: 0.3 });
  disposables.push(buildMat, edgeMat);

  // Generate blocks
  for (let x = -citySize/2 + blockSize/2; x < citySize/2; x += blockSize + roadWidth) {
      for (let z = -citySize/2 + blockSize/2; z < citySize/2; z += blockSize + roadWidth) {
          // Random height
          const h = 2 + Math.random() * 8;
          const buildGeo = new THREE.BoxGeometry(blockSize, h, blockSize);
          buildGeo.translate(0, h/2, 0); // Pivot at base
          
          const mesh = new THREE.Mesh(buildGeo, buildMat);
          mesh.position.set(x, 0, z);
          buildingGroup.add(mesh);
          
          const edges = new THREE.EdgesGeometry(buildGeo);
          const line = new THREE.LineSegments(edges, edgeMat);
          line.position.set(x, 0, z);
          buildingGroup.add(line);
          
          disposables.push(buildGeo, edges);
      }
  }

  // 4. Underground Pipe Network
  const pipeGroup = new THREE.Group();
  pipeGroup.position.y = -4; // Below ground
  group.add(pipeGroup);
  animatables.huPipes = pipeGroup;

  const pipeMat = new THREE.MeshBasicMaterial({ color: 0x3b82f6, wireframe: true, transparent: true, opacity: 0.4 });
  disposables.push(pipeMat);

  // Create grid of pipes matching roads
  // Horizontal (X) pipes
  for (let z = -citySize/2 + blockSize + roadWidth/2; z < citySize/2; z += blockSize + roadWidth) {
      const pGeo = new THREE.CylinderGeometry(0.5, 0.5, citySize);
      pGeo.rotateZ(Math.PI / 2);
      const p = new THREE.Mesh(pGeo, pipeMat);
      p.position.z = z - (blockSize+roadWidth)/2; // Align with road center
      pipeGroup.add(p);
      disposables.push(pGeo);
  }
  // Vertical (Z) pipes
  for (let x = -citySize/2 + blockSize + roadWidth/2; x < citySize/2; x += blockSize + roadWidth) {
      const pGeo = new THREE.CylinderGeometry(0.5, 0.5, citySize);
      pGeo.rotateX(Math.PI / 2);
      const p = new THREE.Mesh(pGeo, pipeMat);
      p.position.x = x - (blockSize+roadWidth)/2;
      pipeGroup.add(p);
      disposables.push(pGeo);
  }

  // 5. Surface Water (Inundation Plane)
  // Initially hidden or very low
  const floodGeo = new THREE.PlaneGeometry(citySize, citySize, 64, 64);
  floodGeo.rotateX(-Math.PI / 2);
  const floodMat = new THREE.MeshPhysicalMaterial({ 
      color: 0x06b6d4, 
      transparent: true, 
      opacity: 0.8,
      roughness: 0.1,
      metalness: 0.1,
      transmission: 0.5
  });
  disposables.push(floodGeo, floodMat);
  const floodPlane = new THREE.Mesh(floodGeo, floodMat);
  floodPlane.position.y = -0.05; // Just below curb
  group.add(floodPlane);
  animatables.huSurfaceWater = floodPlane;

  // 6. Rain System
  const rCount = 2000;
  const rGeo = new THREE.BufferGeometry();
  const rPos = new Float32Array(rCount * 3);
  for(let i=0; i<rCount; i++) {
      rPos[i*3] = (Math.random() - 0.5) * citySize;
      rPos[i*3+1] = Math.random() * 20 + 5;
      rPos[i*3+2] = (Math.random() - 0.5) * citySize;
  }
  rGeo.setAttribute('position', new THREE.BufferAttribute(rPos, 3));
  const rMat = new THREE.PointsMaterial({ color: 0xa5f3fc, size: 0.1, transparent: true, opacity: 0.6 });
  disposables.push(rGeo, rMat);
  const rain = new THREE.Points(rGeo, rMat);
  group.add(rain);
  animatables.huRain = rain;

  // 7. Manholes (Connect Surface to Pipes)
  const mhGeo = new THREE.CylinderGeometry(0.3, 0.3, 4);
  const mhMat = new THREE.MeshBasicMaterial({ color: 0xfacc15 });
  disposables.push(mhGeo, mhMat);
  
  // Instance mesh for manholes at intersections
  // Intersections are where roads meet.
  // Roads are at: x = -citySize/2 + i*(block+road) - road/2? 
  // Let's place roughly
  const mhCount = 16; 
  const mhMesh = new THREE.InstancedMesh(mhGeo, mhMat, mhCount);
  const dummy = new THREE.Object3D();
  let mhIdx = 0;
  
  for (let x = -20; x <= 20; x += 10) {
      for (let z = -20; z <= 20; z += 10) {
          if (mhIdx < mhCount) {
             dummy.position.set(x, -2, z); // Center between road (0) and pipe (-4)
             dummy.updateMatrix();
             mhMesh.setMatrixAt(mhIdx++, dummy.matrix);
          }
      }
  }
  group.add(mhMesh);
  animatables.huManholes = mhMesh;
};

export const animateHydroUrbanScene = (animatables: SimAnimatables, time: number, simData: any) => {
    // simData: { rainIntensity: number, drainCapacity: number, waterLevel: number }
    const rainInt = simData?.rainIntensity || 0; // mm/h (mapped to visual)
    const drainCap = simData?.drainCapacity || 50;
    const streetLevel = simData?.waterLevel || 0; // meters

    // 1. Rain Animation
    if (animatables.huRain) {
        const positions = animatables.huRain.geometry.attributes.position.array as Float32Array;
        const fallSpeed = 0.5 + (rainInt / 100) * 0.5;
        const mat = animatables.huRain.material as THREE.PointsMaterial;
        
        // Opacity based on intensity
        mat.opacity = Math.min(0.8, rainInt / 50);

        for(let i=0; i<positions.length; i+=3) {
            positions[i*3+1] -= fallSpeed;
            if (positions[i*3+1] < 0) {
                positions[i*3+1] = 20 + Math.random() * 5;
            }
        }
        animatables.huRain.geometry.attributes.position.needsUpdate = true;
    }

    // 2. Surface Water Rise
    if (animatables.huSurfaceWater) {
        // Smoothly interpolate to target level
        // Target Y is based on simData waterLevel
        // Base is 0. Flooding visible if > 0.
        // Clamp visual height to reasonable bounds (e.g. max 2m visual height for extreme flood)
        const targetY = Math.min(2.5, Math.max(-0.1, streetLevel));
        animatables.huSurfaceWater.position.y = THREE.MathUtils.lerp(animatables.huSurfaceWater.position.y, targetY, 0.05);
        
        // Add wave/turbulence
        if (rainInt > 0) {
            animatables.huSurfaceWater.scale.x = 1 + Math.sin(time * 2) * 0.002;
            animatables.huSurfaceWater.scale.y = 1 + Math.cos(time * 2) * 0.002; // Z in geometry term
        }
    }

    // 3. Pipe Flow (Visual Logic)
    if (animatables.huPipes) {
        // Change color based on capacity load
        // If rain > capacity, pipes are "Full" (Red/Orange)
        // If rain < capacity, pipes are "Flowing" (Blue)
        const load = Math.min(1.0, rainInt / (drainCap + 1));
        const pipes = animatables.huPipes.children;
        
        const cEmpty = new THREE.Color(0x3b82f6);
        const cFull = new THREE.Color(0xef4444);
        const curColor = cEmpty.clone().lerp(cFull, load);

        pipes.forEach((p: any) => {
             if (p.material) {
                 p.material.color.lerp(curColor, 0.1);
                 p.material.opacity = 0.3 + load * 0.5; // More solid when full
             }
        });
    }

    // 4. Manhole Pulse (Surcharge indication)
    if (animatables.huManholes && streetLevel > 0.2) {
         // If flooded, manholes might be surcharging/pulsing
         // Simple scale pulse or color shift is hard on instanced mesh without custom shader
         // We can just rely on the water plane covering them
    }
};
