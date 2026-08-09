
import * as THREE from 'three';
import { SimAnimatables } from './three-types';

export const initHydroIceFloodScene = (
  group: THREE.Group,
  animatables: SimAnimatables,
  disposables: { dispose: () => void }[]
) => {
  // 1. Lighting (Cold, Wintery)
  const ambient = new THREE.AmbientLight(0xffffff, 0.6);
  group.add(ambient);
  const sun = new THREE.DirectionalLight(0xe0f2fe, 1.0);
  sun.position.set(-20, 30, -10);
  group.add(sun);
  const blueBack = new THREE.PointLight(0x0ea5e9, 0.5, 50);
  blueBack.position.set(0, 5, 20);
  group.add(blueBack);

  // 2. Terrain: Frozen River Channel
  const width = 40;
  const length = 100;
  const terrainGeo = new THREE.PlaneGeometry(width, length, 32, 64);
  const pos = terrainGeo.attributes.position;
  
  for(let i=0; i<pos.count; i++) {
      const x = pos.getX(i);
      const y = pos.getY(i); // Z in world
      
      // Channel: Deep in middle
      let z = 0;
      if (Math.abs(x) < 12) {
          // River bed
          z = -5 + Math.pow(Math.abs(x)/12, 4) * 5; 
      } else {
          // Banks with snow mounds
          z = 2 + Math.random() * 0.5;
      }
      pos.setZ(i, z);
  }
  terrainGeo.computeVertexNormals();
  terrainGeo.rotateX(-Math.PI / 2);
  
  const terrainMat = new THREE.MeshStandardMaterial({ 
      color: 0xf8fafc, // Snow White
      roughness: 0.9,
      metalness: 0.1
  });
  disposables.push(terrainGeo, terrainMat);
  const terrain = new THREE.Mesh(terrainGeo, terrainMat);
  group.add(terrain);

  // 3. Water Surface (Under Ice)
  const waterGeo = new THREE.PlaneGeometry(24, length);
  waterGeo.rotateX(-Math.PI / 2);
  const waterMat = new THREE.MeshPhysicalMaterial({ 
      color: 0x082f49, // Deep dark blue
      roughness: 0.1,
      metalness: 0.8,
      transmission: 0.2
  });
  disposables.push(waterGeo, waterMat);
  const water = new THREE.Mesh(waterGeo, waterMat);
  water.position.y = -0.5;
  group.add(water);
  animatables.hifRiverWater = water;

  // 4. Bridge Pier (The Obstacle)
  const bridgeGroup = new THREE.Group();
  bridgeGroup.position.set(0, 0, 0); // Center of jam
  group.add(bridgeGroup);
  animatables.hifBridgePier = bridgeGroup;

  const pierGeo = new THREE.BoxGeometry(4, 10, 2);
  const pierMat = new THREE.MeshStandardMaterial({ color: 0x64748b });
  disposables.push(pierGeo, pierMat);
  const pier = new THREE.Mesh(pierGeo, pierMat);
  pier.position.y = 2;
  bridgeGroup.add(pier);

  // Deck
  const deckGeo = new THREE.BoxGeometry(40, 1, 4);
  disposables.push(deckGeo);
  const deck = new THREE.Mesh(deckGeo, pierMat);
  deck.position.y = 7;
  bridgeGroup.add(deck);

  // 5. Ice Floes (Instanced Mesh)
  // Irregular chunks
  const iceCount = 800;
  const iceGeo = new THREE.DodecahedronGeometry(1.5, 0); // Low poly chunk
  // Flatten slightly
  iceGeo.scale(1.2, 0.4, 1.2); 
  
  const iceMat = new THREE.MeshPhysicalMaterial({ 
      color: 0xcffafe, // Icy blue white
      roughness: 0.2,
      metalness: 0.1,
      transmission: 0.4,
      transparent: true,
      opacity: 0.9
  });
  disposables.push(iceGeo, iceMat);

  const floes = new THREE.InstancedMesh(iceGeo, iceMat, iceCount);
  const dummy = new THREE.Object3D();
  const userDataFloes: {velocity: THREE.Vector3, angularVel: THREE.Vector3, jammed: boolean}[] = [];

  for(let i=0; i<iceCount; i++) {
      // Init positions upstream (-Z)
      const x = (Math.random() - 0.5) * 20;
      const z = -40 - Math.random() * 40;
      dummy.position.set(x, 0, z);
      dummy.rotation.set(Math.random(), Math.random(), Math.random());
      const s = 0.5 + Math.random() * 1.0;
      dummy.scale.set(s, s, s);
      dummy.updateMatrix();
      floes.setMatrixAt(i, dummy.matrix);
      
      userDataFloes.push({
          velocity: new THREE.Vector3(0, 0, 0),
          angularVel: new THREE.Vector3((Math.random()-0.5)*0.1, (Math.random()-0.5)*0.1, (Math.random()-0.5)*0.1),
          jammed: false
      });
  }
  group.add(floes);
  animatables.hifIceFloes = floes;
  (floes as any).userData = { items: userDataFloes };

  // 6. Snow System
  const sCount = 2000;
  const sGeo = new THREE.BufferGeometry();
  const sPos = new Float32Array(sCount * 3);
  for(let i=0; i<sCount; i++) {
      sPos[i*3] = (Math.random()-0.5) * 60;
      sPos[i*3+1] = Math.random() * 20 + 5;
      sPos[i*3+2] = (Math.random()-0.5) * 80;
  }
  sGeo.setAttribute('position', new THREE.BufferAttribute(sPos, 3));
  const sMat = new THREE.PointsMaterial({ color: 0xffffff, size: 0.15, transparent: true, opacity: 0.6 });
  disposables.push(sGeo, sMat);
  const snow = new THREE.Points(sGeo, sMat);
  group.add(snow);
  animatables.hifSnowSystem = snow;
  
  // 7. Jam Indicator (Red Glow under bridge)
  const jamGeo = new THREE.RingGeometry(8, 12, 32);
  jamGeo.rotateX(-Math.PI/2);
  const jamMat = new THREE.MeshBasicMaterial({ color: 0xef4444, transparent: true, opacity: 0 });
  disposables.push(jamGeo, jamMat);
  const jamRing = new THREE.Mesh(jamGeo, jamMat);
  jamRing.position.y = 0.5;
  group.add(jamRing);
  animatables.hifJamIndicator = jamRing;
};

export const animateHydroIceFloodScene = (animatables: SimAnimatables, time: number, simData: any) => {
    // simData: { flowRate: number, temp: number, isJammed: boolean, iceThickness: number }
    const flow = simData?.flowRate || 500;
    const isJammed = simData?.isJammed || false;
    const temp = simData?.temp || -5;
    
    // 1. Ice Floe Physics
    if (animatables.hifIceFloes) {
        const mesh = animatables.hifIceFloes;
        const data = (mesh as any).userData.items;
        const dummy = new THREE.Object3D();
        const baseSpeed = flow / 2000; // Speed factor

        for(let i=0; i<mesh.count; i++) {
            mesh.getMatrixAt(i, dummy.matrix);
            dummy.matrix.decompose(dummy.position, dummy.quaternion, dummy.scale);
            
            const item = data[i];
            
            // Movement Logic
            if (!item.jammed) {
                // Flow downstream (+Z)
                dummy.position.z += baseSpeed + (Math.random() * 0.05);
                // Meander
                dummy.position.x += Math.sin(time + i) * 0.01;
                // Bob
                dummy.position.y = Math.sin(time * 3 + i) * 0.1;
                
                // Rotation
                dummy.rotation.x += item.angularVel.x;
                dummy.rotation.y += item.angularVel.y;
                dummy.rotation.z += item.angularVel.z;
                
                // Jamming Logic: If near bridge (Z=0) and |X| < 4 (Pier width is 4, channel is wider)
                // Actually bridge pier is at 0. Channel width ~24.
                // Jam occurs if many ice chunks crowd Z=0.
                if (isJammed && dummy.position.z > -5 && dummy.position.z < 5) {
                    // Random chance to stick based on proximity to pier or other ice
                    if (Math.abs(dummy.position.x) < 10) {
                        item.jammed = true;
                        // Pile up: Increase Y
                        dummy.position.y += Math.random() * 2; 
                        // Tilt up
                        dummy.rotation.x = Math.PI / 4;
                    }
                }
            } else {
                // Stuck: Jitter slightly
                dummy.position.x += (Math.random()-0.5) * 0.01;
                dummy.position.y = Math.max(0, dummy.position.y + Math.sin(time*10)*0.005);
                
                // If cleared (isJammed false), release
                if (!isJammed) {
                    item.jammed = false;
                    // Push out
                    dummy.position.z += 0.5;
                }
            }
            
            // Loop reset
            if (dummy.position.z > 50) {
                dummy.position.z = -50 - Math.random() * 10;
                dummy.position.x = (Math.random() - 0.5) * 20;
                item.jammed = false;
                dummy.position.y = 0;
            }

            dummy.updateMatrix();
            mesh.setMatrixAt(i, dummy.matrix);
        }
        mesh.instanceMatrix.needsUpdate = true;
    }

    // 2. Water Level Rise (Backwater Effect)
    if (animatables.hifRiverWater) {
        // If jammed, upstream water rises
        const baseLevel = -0.5;
        const floodLevel = isJammed ? 2.5 : baseLevel;
        animatables.hifRiverWater.position.y = THREE.MathUtils.lerp(animatables.hifRiverWater.position.y, floodLevel, 0.02);
    }

    // 3. Snow
    if (animatables.hifSnowSystem) {
        const positions = animatables.hifSnowSystem.geometry.attributes.position.array as Float32Array;
        for(let i=0; i<positions.length; i+=3) {
            positions[i+1] -= 0.1; // Fall
            positions[i] += 0.02; // Wind
            if (positions[i+1] < 0) positions[i+1] = 20;
            if (positions[i] > 30) positions[i] = -30;
        }
        animatables.hifSnowSystem.geometry.attributes.position.needsUpdate = true;
    }

    // 4. Jam Warning Indicator
    if (animatables.hifJamIndicator) {
        const mat = animatables.hifJamIndicator.material as THREE.MeshBasicMaterial;
        if (isJammed) {
            mat.opacity = 0.5 + Math.sin(time * 5) * 0.3; // Pulse Red
        } else {
            mat.opacity = 0;
        }
    }
};
