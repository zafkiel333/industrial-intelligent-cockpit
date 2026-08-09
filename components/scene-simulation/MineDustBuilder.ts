
import * as THREE from 'three';
import { SimAnimatables } from './three-types';

export const initMineDustScene = (
  group: THREE.Group,
  animatables: SimAnimatables,
  disposables: { dispose: () => void }[]
) => {
  // 1. Environment (Enclosed Transfer Station)
  const floorGeo = new THREE.PlaneGeometry(30, 30);
  floorGeo.rotateX(-Math.PI / 2);
  const floorMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.8 });
  disposables.push(floorGeo, floorMat);
  const floor = new THREE.Mesh(floorGeo, floorMat);
  floor.position.y = -5;
  group.add(floor);

  // Walls (Partial)
  const wallGeo = new THREE.BoxGeometry(1, 15, 30);
  const wallMat = new THREE.MeshStandardMaterial({ color: 0x334155, transparent: true, opacity: 0.3 });
  disposables.push(wallGeo, wallMat);
  const backWall = new THREE.Mesh(wallGeo, wallMat);
  backWall.position.set(-10, 2.5, 0);
  group.add(backWall);

  // 2. Conveyor Belt (Source)
  const beltGroup = new THREE.Group();
  group.add(beltGroup);
  animatables.dustSource = beltGroup;

  const beltGeo = new THREE.BoxGeometry(15, 0.5, 3);
  const beltMat = new THREE.MeshStandardMaterial({ color: 0x111111 });
  disposables.push(beltGeo, beltMat);
  const belt = new THREE.Mesh(beltGeo, beltMat);
  belt.position.set(0, 5, 0);
  belt.rotation.z = -0.1; // Slope down
  beltGroup.add(belt);

  // Chute (Drop Point)
  const chuteGeo = new THREE.ConeGeometry(2, 4, 4, 1, true);
  chuteGeo.rotateX(Math.PI); // Inverted
  const chuteMat = new THREE.MeshStandardMaterial({ color: 0x475569, side: THREE.DoubleSide });
  disposables.push(chuteGeo, chuteMat);
  const chute = new THREE.Mesh(chuteGeo, chuteMat);
  chute.position.set(8, 2.5, 0);
  beltGroup.add(chute);

  // 3. Suction Hood (Dust Collection)
  const hoodGroup = new THREE.Group();
  hoodGroup.position.set(8, 5, 0);
  group.add(hoodGroup);
  animatables.suctionHood = hoodGroup;

  const hoodGeo = new THREE.BoxGeometry(4, 1, 4);
  const hoodMat = new THREE.MeshStandardMaterial({ color: 0x4ade80, wireframe: true });
  disposables.push(hoodGeo, hoodMat);
  const hood = new THREE.Mesh(hoodGeo, hoodMat);
  hoodGroup.add(hood);

  // Duct
  const ductGeo = new THREE.CylinderGeometry(0.8, 0.8, 5);
  const ductMat = new THREE.MeshStandardMaterial({ color: 0x64748b });
  disposables.push(ductGeo, ductMat);
  const duct = new THREE.Mesh(ductGeo, ductMat);
  duct.position.y = 3;
  hoodGroup.add(duct);

  // Fan (Inside Duct - Visual)
  const fanGeo = new THREE.CylinderGeometry(0.7, 0.7, 0.2, 8);
  const fanMat = new THREE.MeshBasicMaterial({ color: 0x22d3ee });
  disposables.push(fanGeo, fanMat);
  const fan = new THREE.Mesh(fanGeo, fanMat);
  fan.rotation.x = Math.PI / 2;
  fan.position.y = 4;
  hoodGroup.add(fan);
  animatables.suctionFan = fan;

  // 4. Sprayers (Water Mist)
  animatables.mistSprayers = [];
  const nozzleGeo = new THREE.ConeGeometry(0.2, 0.5, 8);
  const nozzleMat = new THREE.MeshStandardMaterial({ color: 0x3b82f6 });
  disposables.push(nozzleGeo, nozzleMat);
  
  // 4 nozzles around the chute
  const nozzlePositions = [
      {x: 6, y: 1, z: 2}, {x: 6, y: 1, z: -2},
      {x: 10, y: 1, z: 2}, {x: 10, y: 1, z: -2}
  ];

  nozzlePositions.forEach(pos => {
      const nGroup = new THREE.Group();
      nGroup.position.set(pos.x, pos.y, pos.z);
      const mesh = new THREE.Mesh(nozzleGeo, nozzleMat);
      // Point towards center of chute drop (8, -2, 0) approx
      mesh.lookAt(8, -2, 0);
      mesh.rotateX(-Math.PI/2); 
      nGroup.add(mesh);
      group.add(nGroup);
      animatables.mistSprayers?.push(nGroup);
  });

  // 5. Dust Particles
  const dCount = 2000;
  const dGeo = new THREE.BufferGeometry();
  const dPos = new Float32Array(dCount * 3);
  const dLife = new Float32Array(dCount);
  const dVel = new Float32Array(dCount * 3);

  for(let i=0; i<dCount; i++) {
      dPos[i*3] = 0; dPos[i*3+1] = -100; dPos[i*3+2] = 0; // Hidden initially
      dLife[i] = 0;
  }
  dGeo.setAttribute('position', new THREE.BufferAttribute(dPos, 3));
  dGeo.setAttribute('velocity', new THREE.BufferAttribute(dVel, 3));
  dGeo.setAttribute('life', new THREE.BufferAttribute(dLife, 1));
  
  const dMat = new THREE.PointsMaterial({ 
      color: 0xeab308, 
      size: 0.3, 
      transparent: true, 
      opacity: 0.6,
      blending: THREE.AdditiveBlending,
      depthWrite: false
  });
  disposables.push(dGeo, dMat);
  const dust = new THREE.Points(dGeo, dMat);
  group.add(dust);
  animatables.dustParticles = dust;

  // 6. Mist Particles
  const mCount = 1000;
  const mGeo = new THREE.BufferGeometry();
  const mPos = new Float32Array(mCount * 3);
  const mLife = new Float32Array(mCount);
  // Also store which sprayer emitted it to randomize
  const mSource = new Float32Array(mCount);

  for(let i=0; i<mCount; i++) {
      mPos[i*3] = 0; mPos[i*3+1] = -100; mPos[i*3+2] = 0;
      mLife[i] = 0;
      mSource[i] = Math.floor(Math.random() * 4);
  }
  mGeo.setAttribute('position', new THREE.BufferAttribute(mPos, 3));
  mGeo.setAttribute('life', new THREE.BufferAttribute(mLife, 1));
  mGeo.setAttribute('source', new THREE.BufferAttribute(mSource, 1));

  const mMat = new THREE.PointsMaterial({ color: 0xbae6fd, size: 0.15, transparent: true, opacity: 0.5 });
  disposables.push(mGeo, mMat);
  const mist = new THREE.Points(mGeo, mMat);
  group.add(mist);
  animatables.mistParticles = mist;

  // Lights
  const spot = new THREE.SpotLight(0xffffff, 2);
  spot.position.set(0, 20, 0);
  spot.target = chute;
  group.add(spot);
};

export const animateMineDustScene = (animatables: SimAnimatables, time: number, simData: any) => {
    // simData: { fanPower: 0-100, mistEnabled: boolean, productionRate: 0-100 }
    const fanPower = simData?.fanPower || 0; // 0 to 100
    const mistOn = simData?.mistEnabled || false;
    const prodRate = simData?.productionRate || 50;

    // 1. Fan Rotation
    if (animatables.suctionFan) {
        animatables.suctionFan.rotation.y += (fanPower / 100) * 0.5;
    }

    // 2. Dust Dynamics
    if (animatables.dustParticles) {
        const pos = animatables.dustParticles.geometry.attributes.position.array as Float32Array;
        const vel = animatables.dustParticles.geometry.attributes.velocity.array as Float32Array;
        const life = animatables.dustParticles.geometry.attributes.life.array as Float32Array;
        const count = life.length;

        // Source Point (Bottom of chute)
        const srcX = 8, srcY = 0.5, srcZ = 0;
        const hoodX = 8, hoodY = 5, hoodZ = 0;

        // Fan Suction Strength
        const suctionStrength = (fanPower / 100) * 0.2; 

        // Emission Rate based on Production
        const emitCount = Math.ceil(prodRate / 10);

        // Spawn new particles
        for(let k=0; k<emitCount; k++) {
            const idx = Math.floor(Math.random() * count);
            if (life[idx] <= 0) {
                life[idx] = 1.0;
                // Randomize slightly around chute outlet
                pos[idx*3] = srcX + (Math.random()-0.5) * 2;
                pos[idx*3+1] = srcY + (Math.random()-0.5) * 1;
                pos[idx*3+2] = srcZ + (Math.random()-0.5) * 2;
                
                // Initial burst velocity (explosive dust)
                vel[idx*3] = (Math.random()-0.5) * 0.2;
                vel[idx*3+1] = Math.random() * 0.2; // Rises
                vel[idx*3+2] = (Math.random()-0.5) * 0.2;
            }
        }

        for(let i=0; i<count; i++) {
            if (life[i] > 0) {
                life[i] -= 0.005; // Decay

                // Physics
                const px = pos[i*3];
                const py = pos[i*3+1];
                const pz = pos[i*3+2];

                // 1. Diffusion (Random Walk)
                vel[i*3] += (Math.random()-0.5) * 0.01;
                vel[i*3+1] += (Math.random()-0.5) * 0.01;
                vel[i*3+2] += (Math.random()-0.5) * 0.01;

                // 2. Buoyancy (Dust rises)
                vel[i*3+1] += 0.002;

                // 3. Suction Force (Towards Hood)
                if (fanPower > 0) {
                    const dx = hoodX - px;
                    const dy = hoodY - py;
                    const dz = hoodZ - pz;
                    const distSq = dx*dx + dy*dy + dz*dz;
                    const force = suctionStrength / (1 + distSq * 0.1);
                    
                    vel[i*3] += dx * force;
                    vel[i*3+1] += dy * force;
                    vel[i*3+2] += dz * force;

                    // Capture condition
                    if (distSq < 2.0) {
                        life[i] = 0; // Captured
                        pos[i*3+1] = -100;
                        continue;
                    }
                }

                // 4. Mist Suppression (Simplified)
                // If mist is on, apply downward drag and kill chance
                if (mistOn) {
                    // Check if near spray zone (approx box around 8,1,0)
                    if (Math.abs(px - 8) < 3 && Math.abs(pz) < 3 && py < 4) {
                        vel[i*3+1] -= 0.02; // Drag down
                        if (Math.random() < 0.05) {
                            life[i] = 0; // Suppressed
                            pos[i*3+1] = -100;
                            continue;
                        }
                    }
                }

                // Apply Velocity
                pos[i*3] += vel[i*3];
                pos[i*3+1] += vel[i*3+1];
                pos[i*3+2] += vel[i*3+2];

                // Damping
                vel[i*3] *= 0.95;
                vel[i*3+1] *= 0.95;
                vel[i*3+2] *= 0.95;

                // Ground Collision
                if (pos[i*3+1] < -5) {
                    life[i] = 0;
                }
            }
        }
        animatables.dustParticles.geometry.attributes.position.needsUpdate = true;
        animatables.dustParticles.geometry.attributes.life.needsUpdate = true;
    }

    // 3. Mist Dynamics
    if (animatables.mistParticles && animatables.mistSprayers) {
        const pos = animatables.mistParticles.geometry.attributes.position.array as Float32Array;
        const life = animatables.mistParticles.geometry.attributes.life.array as Float32Array;
        const src = animatables.mistParticles.geometry.attributes.source.array as Float32Array;
        const count = life.length;
        
        // Spawn
        if (mistOn) {
            for(let k=0; k<20; k++) {
                const idx = Math.floor(Math.random() * count);
                if (life[idx] <= 0) {
                    life[idx] = 1.0;
                    const sIdx = Math.floor(src[idx]) % 4; // 4 sprayers
                    const sprayer = animatables.mistSprayers[sIdx];
                    
                    pos[idx*3] = sprayer.position.x;
                    pos[idx*3+1] = sprayer.position.y;
                    pos[idx*3+2] = sprayer.position.z;
                }
            }
        }

        for(let i=0; i<count; i++) {
            if (life[i] > 0) {
                life[i] -= 0.02; // Fast decay
                
                // Move towards center bottom (8, -2, 0)
                const tx = 8, ty = -2, tz = 0;
                const dx = tx - pos[i*3];
                const dy = ty - pos[i*3+1];
                const dz = tz - pos[i*3+2];
                
                pos[i*3] += dx * 0.05 + (Math.random()-0.5)*0.1;
                pos[i*3+1] += dy * 0.05;
                pos[i*3+2] += dz * 0.05 + (Math.random()-0.5)*0.1;

                if (life[i] <= 0) pos[i*3+1] = -100;
            } else {
                pos[i*3+1] = -100;
            }
        }
        animatables.mistParticles.geometry.attributes.position.needsUpdate = true;
        animatables.mistParticles.geometry.attributes.life.needsUpdate = true;
    }
};
