
import * as THREE from 'three';
import { SimAnimatables } from './three-types';

export const initPortSurgeScene = (
  group: THREE.Group,
  animatables: SimAnimatables,
  disposables: { dispose: () => void }[]
) => {
  // 1. Atmospheric Environment (Stormy)
  const ambient = new THREE.AmbientLight(0x444444, 0.4);
  group.add(ambient);
  
  const lightning = new THREE.PointLight(0x60a5fa, 0, 100);
  lightning.position.set(0, 50, 0);
  group.add(lightning);
  (group as any).userData.lightning = lightning;

  const dirLight = new THREE.DirectionalLight(0xffffff, 0.5);
  dirLight.position.set(-20, 20, -20);
  group.add(dirLight);

  // Storm Clouds
  const cloudGroup = new THREE.Group();
  const cloudGeo = new THREE.DodecahedronGeometry(5, 0);
  const cloudMat = new THREE.MeshStandardMaterial({ 
      color: 0x1e293b, 
      transparent: true, 
      opacity: 0.8,
      flatShading: true
  });
  disposables.push(cloudGeo, cloudMat);
  
  for(let i=0; i<15; i++) {
      const cloud = new THREE.Mesh(cloudGeo, cloudMat);
      cloud.position.set(
          (Math.random()-0.5) * 100,
          20 + Math.random() * 5,
          (Math.random()-0.5) * 80
      );
      cloud.scale.set(3, 1, 2);
      cloudGroup.add(cloud);
  }
  group.add(cloudGroup);
  animatables.surgeClouds = cloudGroup;

  // 2. Port Terrain (Quay and Yard)
  const terrainGroup = new THREE.Group();
  group.add(terrainGroup);
  
  // Quay Wall & Apron
  // Top surface at Y=4 (Dock height)
  const quayGeo = new THREE.BoxGeometry(40, 8, 80);
  const quayMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.9 });
  disposables.push(quayGeo, quayMat);
  const quay = new THREE.Mesh(quayGeo, quayMat);
  quay.position.set(20, 0, 0); // Center at X=20, Top at 4
  terrainGroup.add(quay);
  
  // Hinterland Slope
  const landGeo = new THREE.BoxGeometry(40, 8, 80);
  const land = new THREE.Mesh(landGeo, quayMat);
  land.position.set(60, 1, 0); // Slightly higher Y=1+4=5
  terrainGroup.add(land);

  animatables.surgeTerrain = quay; // Ref for collision logic

  // 3. Water Surface (Dynamic Ocean)
  // High segment count for waves
  const waterGeo = new THREE.PlaneGeometry(120, 120, 128, 128);
  waterGeo.rotateX(-Math.PI / 2);
  const waterMat = new THREE.MeshPhysicalMaterial({ 
      color: 0x0f172a, 
      roughness: 0.2,
      metalness: 0.6,
      transparent: true,
      opacity: 0.9,
      transmission: 0.1
  });
  disposables.push(waterGeo, waterMat);
  const water = new THREE.Mesh(waterGeo, waterMat);
  water.position.y = 0; // Mean Sea Level
  group.add(water);
  animatables.surgeWater = water;

  // 4. STS Cranes
  animatables.surgeCranes = [];
  const craneMat = new THREE.MeshStandardMaterial({ color: 0xf97316 }); // Orange
  const legGeo = new THREE.BoxGeometry(1, 25, 1);
  const boomGeo = new THREE.BoxGeometry(30, 1, 1);
  disposables.push(craneMat, legGeo, boomGeo);

  [-20, 0, 20].forEach(z => {
      const cGroup = new THREE.Group();
      cGroup.position.set(10, 4, z); // On quay edge
      
      const leg1 = new THREE.Mesh(legGeo, craneMat); leg1.position.set(0, 12.5, 3);
      const leg2 = new THREE.Mesh(legGeo, craneMat); leg2.position.set(0, 12.5, -3);
      const boom = new THREE.Mesh(boomGeo, craneMat); boom.position.set(-10, 24, 0);
      
      cGroup.add(leg1, leg2, boom);
      group.add(cGroup);
      animatables.surgeCranes?.push(cGroup);
  });

  // 5. Container Stacks (Instanced)
  const contGeo = new THREE.BoxGeometry(2.4, 2.5, 6);
  const contMat = new THREE.MeshStandardMaterial({ color: 0x3b82f6 });
  disposables.push(contGeo, contMat);
  
  const iMesh = new THREE.InstancedMesh(contGeo, contMat, 400);
  // Custom color attribute for dynamic updates
  const colors = new Float32Array(400 * 3);
  const baseColor = new THREE.Color(0x3b82f6);
  for(let i=0; i<400; i++) {
      colors[i*3] = baseColor.r;
      colors[i*3+1] = baseColor.g;
      colors[i*3+2] = baseColor.b;
  }
  iMesh.instanceColor = new THREE.InstancedBufferAttribute(colors, 3);
  
  const dummy = new THREE.Object3D();
  let idx = 0;
  // Stack Yard Area: X > 20
  for (let x = 30; x < 70; x += 3) {
      for (let z = -30; z < 30; z += 7) {
          const stackH = Math.floor(Math.random() * 4) + 1;
          for (let h = 0; h < stackH; h++) {
              if (idx < 400) {
                  // Yard ground level is Y=4
                  dummy.position.set(x, 4 + 1.25 + h * 2.5, z);
                  dummy.updateMatrix();
                  iMesh.setMatrixAt(idx++, dummy.matrix);
              }
          }
      }
  }
  iMesh.instanceMatrix.needsUpdate = true;
  group.add(iMesh);
  animatables.surgeContainers = iMesh;

  // 6. Rain System (Heavy)
  const rCount = 5000;
  const rGeo = new THREE.BufferGeometry();
  const rPos = new Float32Array(rCount * 3);
  for(let i=0; i<rCount; i++) {
      rPos[i*3] = (Math.random()-0.5) * 100;
      rPos[i*3+1] = Math.random() * 40;
      rPos[i*3+2] = (Math.random()-0.5) * 100;
  }
  rGeo.setAttribute('position', new THREE.BufferAttribute(rPos, 3));
  const rMat = new THREE.PointsMaterial({ 
      color: 0xaaaaaa, 
      size: 0.1, 
      transparent: true, 
      opacity: 0.4,
      blending: THREE.AdditiveBlending 
  });
  disposables.push(rGeo, rMat);
  const rain = new THREE.Points(rGeo, rMat);
  group.add(rain);
  animatables.surgeRain = rain;

  // 7. Splash/Overtopping Particles
  const sCount = 1000;
  const sGeo = new THREE.BufferGeometry();
  const sPos = new Float32Array(sCount * 3);
  for(let i=0; i<sCount; i++) sPos[i*3+1] = -100; // Hide
  sGeo.setAttribute('position', new THREE.BufferAttribute(sPos, 3));
  const sMat = new THREE.PointsMaterial({ color: 0xffffff, size: 0.2, transparent: true, opacity: 0.6 });
  disposables.push(sGeo, sMat);
  const splashes = new THREE.Points(sGeo, sMat);
  group.add(splashes);
  animatables.surgeWaves = splashes;
};

export const animatePortSurgeScene = (animatables: SimAnimatables, time: number, simData: any) => {
    // simData: { waterLevel: number, windSpeed: number, waveHeight: number }
    const waterLevel = simData?.waterLevel || 0; // Relative to MSL (0). Quay is at +4.
    const wind = simData?.windSpeed || 0;
    const waveH = simData?.waveHeight || 1;

    // 1. Water Surface
    if (animatables.surgeWater) {
        const geo = animatables.surgeWater.geometry;
        const pos = geo.attributes.position;
        // Assume plane resolution 64x64
        
        for(let i=0; i<pos.count; i++) {
            const x = pos.getX(i); // Local coords
            const y = pos.getY(i); 
            
            // Base surge level
            let z = waterLevel;
            
            // Add waves
            // Wave height increases with wind
            // Direction assumed from -X to +X (Sea to Land)
            const k = 0.2;
            const omega = 2.0;
            const wave = (waveH/2) * Math.sin(k * x - omega * time);
            
            // Secondary chop
            const chop = (waveH/4) * Math.sin(0.5 * y - 3 * time);
            
            pos.setZ(i, z + wave + chop);
        }
        pos.needsUpdate = true;
        geo.computeVertexNormals();
        
        // Color shift: Stormy -> darker/greyer
        const mat = animatables.surgeWater.material as THREE.MeshPhysicalMaterial;
        if (wind > 20) mat.color.setHex(0x1e293b); // Storm grey
        else mat.color.setHex(0x0c4a6e); // Ocean blue
    }

    // 2. Rain
    if (animatables.surgeRain) {
        const pos = animatables.surgeRain.geometry.attributes.position.array as Float32Array;
        // Wind slant
        const slant = wind * 0.1;
        
        for(let i=0; i<pos.length; i+=3) {
            pos[i] += slant; // Move with wind
            pos[i+1] -= 0.8; // Fall
            
            if (pos[i+1] < 0) {
                pos[i+1] = 40;
                pos[i] = (Math.random()-0.5) * 100 - slant * 20; // Offset spawn to cover area
            }
        }
        animatables.surgeRain.geometry.attributes.position.needsUpdate = true;
        // Opacity based on wind/storm intensity
        (animatables.surgeRain.material as THREE.PointsMaterial).opacity = Math.min(0.8, wind / 30);
    }

    // 3. Lightning
    if (wind > 25) {
        const light = (animatables.surgeClouds?.parent as any)?.userData.lightning;
        if (light) {
            // Random flash
            if (Math.random() > 0.98) {
                light.intensity = 5;
                setTimeout(() => light.intensity = 0, 100);
            }
        }
    }

    // 4. Overtopping Splashes (Quay edge is X=0)
    if (animatables.surgeWaves) {
        const pos = animatables.surgeWaves.geometry.attributes.position.array as Float32Array;
        const count = pos.length/3;
        
        // Only if water level + wave > 4 (Quay height)
        const crest = waterLevel + waveH/2;
        
        for(let i=0; i<count; i++) {
            // Respawn logic
            if (pos[i*3+1] < -10 || Math.random() > 0.95) {
                 if (crest > 3.5) { // Near overtopping
                     pos[i*3] = 0 + (Math.random()-0.5); // Edge
                     pos[i*3+1] = 4 + Math.random(); // Height
                     pos[i*3+2] = (Math.random()-0.5) * 80;
                 } else {
                     pos[i*3+1] = -100;
                 }
            } else {
                // Splash physics
                pos[i*3] += 0.2; // Move onto land
                pos[i*3+1] -= 0.1; // Gravity
            }
        }
        animatables.surgeWaves.geometry.attributes.position.needsUpdate = true;
    }

    // 5. Container Flooding Check
    if (animatables.surgeContainers) {
        const mesh = animatables.surgeContainers;
        const colors = mesh.instanceColor!.array as Float32Array;
        const dummy = new THREE.Object3D();
        
        // Quay height is 4.
        const floodedLevel = waterLevel > 4 ? waterLevel : 4; 
        
        // Check bottom tier containers. Usually Y pos ~5.25 (4 + 1.25).
        // If waterLevel > 4, flood spreads on land.
        
        for(let i=0; i<mesh.count; i++) {
            mesh.getMatrixAt(i, dummy.matrix);
            dummy.matrix.decompose(dummy.position, dummy.quaternion, dummy.scale);
            
            // Container bottom Y = pos.y - 1.25.
            const containerBottom = dummy.position.y - 1.25;
            
            if (containerBottom < waterLevel) {
                // Flooded! Turn Red
                colors[i*3] = 1.0;
                colors[i*3+1] = 0.2;
                colors[i*3+2] = 0.2;
            } else {
                // Reset to blue (simplified, ideally restore original color)
                colors[i*3] = 0.23;
                colors[i*3+1] = 0.51;
                colors[i*3+2] = 0.96;
            }
        }
        mesh.instanceColor!.needsUpdate = true;
    }
    
    // 6. Crane Stoppage (Wind Lock)
    if (animatables.surgeCranes) {
        animatables.surgeCranes.forEach((c, i) => {
             // If wind > 20m/s, cranes stow boom? Or just shake.
             if (wind > 20) {
                 // Stow boom (rotate up)
                 const boom = c.children[2]; // Index depends on build order
                 // Assuming boom is child 2
                 if (boom) {
                     // Target rot Z
                     const target = Math.PI / 3;
                     boom.rotation.z = THREE.MathUtils.lerp(boom.rotation.z, target, 0.02);
                 }
             } else {
                 // Operational
                 const boom = c.children[2];
                 if (boom) boom.rotation.z = THREE.MathUtils.lerp(boom.rotation.z, 0, 0.02);
             }
        });
    }
};
