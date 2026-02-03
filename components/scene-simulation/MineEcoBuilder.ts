
import * as THREE from 'three';
import { SimAnimatables } from './three-types';

export const initMineEcoScene = (
  group: THREE.Group,
  animatables: SimAnimatables,
  disposables: { dispose: () => void }[]
) => {
  // 1. Lighting (Dynamic Sunlight)
  const ambient = new THREE.AmbientLight(0xffffff, 0.4);
  group.add(ambient);

  const sun = new THREE.DirectionalLight(0xffeb3b, 1.2);
  sun.position.set(20, 30, 10);
  sun.castShadow = true;
  group.add(sun);
  animatables.ecoSun = sun;

  // 2. Evolving Terrain (Mine Pit -> Park)
  // High-res plane for vertex manipulation
  const terrainGeo = new THREE.PlaneGeometry(60, 60, 64, 64);
  const pos = terrainGeo.attributes.position;
  const colors = new Float32Array(pos.count * 3);
  
  // Create Pit Shape
  for(let i=0; i<pos.count; i++) {
      const x = pos.getX(i);
      const y = pos.getY(i); // Local Y is world Z (top-down)
      const dist = Math.sqrt(x*x + y*y);
      
      let z = 0;
      // Terrace effect
      if (dist < 20) {
          z = -10 + Math.floor(dist / 3) * 1.5;
          if (dist < 8) z = -12; // Lake bottom
      } else {
          // Surrounding hills
          z = Math.sin(x*0.2) * 2 + Math.cos(y*0.2) * 2;
      }
      // Add roughness
      z += Math.random() * 0.3;
      
      pos.setZ(i, z);

      // Initial Color (Brown Rock)
      const c = new THREE.Color(0x5d4037);
      colors[i*3] = c.r; colors[i*3+1] = c.g; colors[i*3+2] = c.b;
  }
  terrainGeo.computeVertexNormals();
  terrainGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  terrainGeo.rotateX(-Math.PI / 2);

  const terrainMat = new THREE.MeshStandardMaterial({ 
      vertexColors: true, 
      roughness: 0.9, 
      metalness: 0.05,
      flatShading: true 
  });
  
  disposables.push(terrainGeo, terrainMat);
  const terrain = new THREE.Mesh(terrainGeo, terrainMat);
  group.add(terrain);
  animatables.ecoTerrain = terrain;

  // 3. Pit Lake (Rising Water)
  const waterGeo = new THREE.PlaneGeometry(60, 60);
  waterGeo.rotateX(-Math.PI / 2);
  const waterMat = new THREE.MeshPhysicalMaterial({
      color: 0x06b6d4,
      transparent: true,
      opacity: 0.6,
      roughness: 0.1,
      metalness: 0.6,
      transmission: 0.5
  });
  disposables.push(waterGeo, waterMat);
  const water = new THREE.Mesh(waterGeo, waterMat);
  water.position.y = -13; // Start low/hidden
  group.add(water);
  animatables.ecoWater = water;

  // 4. Vegetation (Instanced Trees)
  const treeCount = 1000;
  // Simple low-poly tree
  const treeGeo = new THREE.ConeGeometry(0.8, 2.5, 5);
  treeGeo.translate(0, 1.25, 0); // Pivot at base
  const treeMat = new THREE.MeshStandardMaterial({ color: 0x22c55e });
  disposables.push(treeGeo, treeMat);

  const trees = new THREE.InstancedMesh(treeGeo, treeMat, treeCount);
  const dummy = new THREE.Object3D();
  
  const userDataTrees: {x:number, z:number, h:number, scaleMax:number}[] = [];
  
  let tIdx = 0;
  for(let i=0; i<pos.count; i++) {
      // Random sampling of terrain points for trees
      if (Math.random() > 0.05) continue;
      if (tIdx >= treeCount) break;

      const x = pos.getX(i);
      const z = pos.getY(i); // Local Y became World Z before rotation? No, accessing original geometry attrs
      // We accessed original geometry before rotation. So x is x, y is y (mapped to z)
      // pos.setZ changed height.
      const h = pos.getZ(i);

      // Only plant on land (above lake level) and not on steep cliffs?
      // Simplified: > -8 height
      if (h > -8 && h < 5) {
          dummy.position.set(x, h, -z); // Plane rotation flips Y to -Z
          dummy.scale.set(0, 0, 0); // Start hidden
          dummy.updateMatrix();
          trees.setMatrixAt(tIdx, dummy.matrix);
          
          userDataTrees.push({
              x: x, z: -z, h: h,
              scaleMax: 0.5 + Math.random() * 0.8
          });
          tIdx++;
      }
  }
  trees.instanceMatrix.needsUpdate = true;
  group.add(trees);
  animatables.ecoVegetation = trees;
  (trees as any).userData = { items: userDataTrees };

  // 5. Atmosphere (Clouds/Rain)
  const pCount = 500;
  const pGeo = new THREE.BufferGeometry();
  const pPos = new Float32Array(pCount * 3);
  for(let i=0; i<pCount; i++) {
      pPos[i*3] = (Math.random()-0.5)*50;
      pPos[i*3+1] = 10 + Math.random()*5;
      pPos[i*3+2] = (Math.random()-0.5)*50;
  }
  pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
  const pMat = new THREE.PointsMaterial({ color: 0xffffff, size: 0.5, transparent: true, opacity: 0.4 });
  disposables.push(pGeo, pMat);
  const clouds = new THREE.Points(pGeo, pMat);
  group.add(clouds);
  animatables.ecoClouds = clouds;
};

export const animateMineEcoScene = (animatables: SimAnimatables, time: number, simData: any) => {
    // simData: { progress: number (0-100), year: number }
    const progress = (simData?.progress || 0) / 100;
    
    // 1. Terrain Color Morph (Brown -> Green)
    if (animatables.ecoTerrain) {
        const colors = animatables.ecoTerrain.geometry.attributes.color;
        const pos = animatables.ecoTerrain.geometry.attributes.position;
        const count = colors.count;
        
        const cBrown = new THREE.Color(0x5d4037);
        const cGreen = new THREE.Color(0x2e7d32); // Forest Green
        const cGrass = new THREE.Color(0x66bb6a);
        
        for (let i = 0; i < count; i++) {
            // Noise based growth pattern
            const x = pos.getX(i);
            const y = pos.getY(i); // Local coords
            const noise = Math.sin(x*0.1) * Math.cos(y*0.1);
            
            // Threshold lowers as progress increases
            const threshold = 1.0 - progress * 1.5; 
            
            let targetC = cBrown;
            if (noise > threshold) {
                 // Green patch
                 targetC = noise > threshold + 0.2 ? cGreen : cGrass;
            }
            
            colors.setXYZ(i, targetC.r, targetC.g, targetC.b);
        }
        colors.needsUpdate = true;
    }

    // 2. Water Rise
    if (animatables.ecoWater) {
        // Target level -8. Start level -13.
        const targetY = -13 + progress * 5; // Rises to -8
        animatables.ecoWater.position.y = THREE.MathUtils.lerp(animatables.ecoWater.position.y, targetY, 0.05);
    }

    // 3. Vegetation Growth
    if (animatables.ecoVegetation) {
        const mesh = animatables.ecoVegetation;
        const data = (mesh as any).userData.items;
        const dummy = new THREE.Object3D();
        
        data.forEach((item: any, i: number) => {
            // Trees grow as progress increases
            // Stagger growth based on position noise
            const noise = Math.sin(item.x) * Math.cos(item.z);
            const growthStart = 0.2 + noise * 0.2; // Start after 20% + noise
            
            let currentScale = 0;
            if (progress > growthStart) {
                currentScale = (progress - growthStart) * 2; // Grow rate
                if (currentScale > item.scaleMax) currentScale = item.scaleMax;
            }
            
            dummy.position.set(item.x, item.h, item.z);
            dummy.scale.set(currentScale, currentScale, currentScale);
            dummy.updateMatrix();
            mesh.setMatrixAt(i, dummy.matrix);
        });
        mesh.instanceMatrix.needsUpdate = true;
    }

    // 4. Clouds (Weather)
    if (animatables.ecoClouds) {
        animatables.ecoClouds.rotation.y = time * 0.02;
    }
};
