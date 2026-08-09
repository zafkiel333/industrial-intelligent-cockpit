
import * as THREE from 'three';
import { SimAnimatables } from './three-types';

export const initMineBeltConveyorScene = (
  group: THREE.Group,
  animatables: SimAnimatables,
  disposables: { dispose: () => void }[]
) => {
  // 1. Lighting
  const ambient = new THREE.AmbientLight(0xffffff, 0.5);
  group.add(ambient);
  const dirLight = new THREE.DirectionalLight(0xffffff, 1.2);
  dirLight.position.set(10, 20, 10);
  group.add(dirLight);

  // 2. Conveyor Structure (Incline)
  // Length: 40m, Width: 4m, Height Rise: 10m
  const startPos = new THREE.Vector3(-20, 0, 0);
  const endPos = new THREE.Vector3(20, 10, 0);
  
  const pathLine = new THREE.LineCurve3(startPos, endPos);
  
  // Truss Frame
  const frameGeo = new THREE.BoxGeometry(1, 1, 1);
  const frameMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.7 });
  disposables.push(frameGeo, frameMat);
  
  const length = startPos.distanceTo(endPos);
  const angle = Math.atan2(endPos.y - startPos.y, endPos.x - startPos.x);
  
  const truss = new THREE.Mesh(frameGeo, frameMat);
  truss.scale.set(length, 1.5, 4);
  truss.position.copy(startPos).lerp(endPos, 0.5);
  truss.rotation.z = angle;
  truss.position.y -= 1; // Below belt
  group.add(truss);

  // Legs
  const legGeo = new THREE.CylinderGeometry(0.3, 0.3, 15);
  const legMat = new THREE.MeshStandardMaterial({ color: 0x475569 });
  disposables.push(legGeo, legMat);
  
  // Place legs at intervals
  for(let i=0; i<5; i++) {
      const t = i / 4;
      const pos = pathLine.getPoint(t);
      const h = pos.y + 5; // Height to ground (approx ground at -5)
      
      const legL = new THREE.Mesh(legGeo, legMat);
      legL.scale.y = h / 15; // Normalize scale based on geo height
      legL.position.set(pos.x, pos.y - h/2 - 1, 2);
      group.add(legL);

      const legR = new THREE.Mesh(legGeo, legMat);
      legR.scale.y = h / 15;
      legR.position.set(pos.x, pos.y - h/2 - 1, -2);
      group.add(legR);
  }

  // 3. Pulleys
  const pulleyGeo = new THREE.CylinderGeometry(0.8, 0.8, 4.2, 32);
  pulleyGeo.rotateX(Math.PI / 2);
  const pulleyMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b }); // Orange Drive
  const tailMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8 }); // Grey Tail
  disposables.push(pulleyGeo, pulleyMat, tailMat);

  // Head Pulley (Drive) - End
  const headPulley = new THREE.Mesh(pulleyGeo, pulleyMat);
  headPulley.position.copy(endPos);
  group.add(headPulley);
  animatables.drivePulley = headPulley;

  // Tail Pulley - Start
  const tailPulley = new THREE.Mesh(pulleyGeo, tailMat);
  tailPulley.position.copy(startPos);
  group.add(tailPulley);
  animatables.tailPulley = tailPulley;

  // 4. Belt (Loop)
  // Top run and bottom run
  // We simulate top run with a plane for material carrying
  const beltWidth = 3.5;
  const beltGeo = new THREE.PlaneGeometry(length, beltWidth, 100, 1);
  const beltMat = new THREE.MeshStandardMaterial({ 
      color: 0x111111, 
      roughness: 0.9,
      side: THREE.DoubleSide
  });
  disposables.push(beltGeo, beltMat);
  
  const belt = new THREE.Mesh(beltGeo, beltMat);
  belt.position.copy(startPos).lerp(endPos, 0.5);
  belt.rotation.z = angle;
  belt.rotation.x = -Math.PI / 2; // Flat width
  // Adjust rotation order or manually rotate to match incline slope
  // The plane needs to tilt up. 
  // Reset rot, use lookAt
  belt.rotation.set(0,0,0);
  belt.position.copy(startPos).lerp(endPos, 0.5);
  belt.position.y += 0.8; // Radius of pulley
  
  // Look at end pos from start pos but keep width horizontal
  // Manual rotation construction:
  belt.rotation.z = angle;
  belt.rotation.x = -Math.PI / 2; // Face up relative to path
  // Fix axis alignment... easiest is to rotate Z by incline angle
  
  // Let's rely on the group transform for simplicity in animation if needed, but here static mesh is fine
  // Texture scrolling will handle motion.
  // Create a canvas texture for belt pattern
  const cvs = document.createElement('canvas');
  cvs.width = 64; cvs.height = 64;
  const ctx = cvs.getContext('2d');
  if(ctx) {
      ctx.fillStyle = '#222'; ctx.fillRect(0,0,64,64);
      ctx.fillStyle = '#333'; ctx.fillRect(0,0,64,4); // Stripe
  }
  const tex = new THREE.CanvasTexture(cvs);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(20, 1);
  beltMat.map = tex;
  
  group.add(belt);
  animatables.conveyorBelt = belt;

  // 5. Idlers (Instanced)
  const idlerCount = 40; // Top and bottom
  const idlerGeo = new THREE.CylinderGeometry(0.15, 0.15, 3.8, 16);
  idlerGeo.rotateX(Math.PI / 2);
  const idlerMat = new THREE.MeshStandardMaterial({ color: 0xef4444 }); // Red rollers
  disposables.push(idlerGeo, idlerMat);
  
  const idlers = new THREE.InstancedMesh(idlerGeo, idlerMat, idlerCount);
  const dummy = new THREE.Object3D();
  
  for(let i=0; i<idlerCount; i++) {
      const t = i / idlerCount;
      const pos = pathLine.getPoint(t);
      
      // Top run idlers
      dummy.position.copy(pos);
      dummy.position.y += 0.6; // Below top belt
      dummy.rotation.z = angle;
      dummy.updateMatrix();
      idlers.setMatrixAt(i, dummy.matrix);
  }
  group.add(idlers);
  animatables.idlers = idlers;

  // 6. Material Flow (Particles)
  const pCount = 1500;
  const pGeo = new THREE.BufferGeometry();
  const pPos = new Float32Array(pCount * 3);
  const pOffset = new Float32Array(pCount); // 0-1 position along belt
  const pLane = new Float32Array(pCount); // -1 to 1 width offset
  
  for(let i=0; i<pCount; i++) {
      pOffset[i] = Math.random();
      pLane[i] = (Math.random() - 0.5) * 3; // Belt width spread
      
      // Set initial pos (will be updated in animate)
      pPos[i*3] = 0; pPos[i*3+1] = 0; pPos[i*3+2] = 0;
  }
  pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
  pGeo.setAttribute('offset', new THREE.BufferAttribute(pOffset, 1));
  pGeo.setAttribute('lane', new THREE.BufferAttribute(pLane, 1));
  
  const pMat = new THREE.PointsMaterial({ color: 0xcd7f32, size: 0.15 }); // Ore color
  disposables.push(pGeo, pMat);
  const particles = new THREE.Points(pGeo, pMat);
  group.add(particles);
  animatables.materialFlow = particles;
  (particles as any).userData = { start: startPos, end: endPos };

  // 7. Dust at Transfer Point (End)
  const dCount = 200;
  const dGeo = new THREE.BufferGeometry();
  const dPos = new Float32Array(dCount * 3);
  const dLife = new Float32Array(dCount);
  for(let i=0; i<dCount; i++) {
     dPos[i*3] = endPos.x; dPos[i*3+1] = endPos.y; dPos[i*3+2] = endPos.z;
     dLife[i] = Math.random();
  }
  dGeo.setAttribute('position', new THREE.BufferAttribute(dPos, 3));
  dGeo.setAttribute('life', new THREE.BufferAttribute(dLife, 1));
  
  const dMat = new THREE.PointsMaterial({ 
      color: 0xaaaaaa, 
      size: 0.5, 
      transparent: true, 
      opacity: 0.3,
      depthWrite: false
  });
  disposables.push(dGeo, dMat);
  const dust = new THREE.Points(dGeo, dMat);
  group.add(dust);
  animatables.dustClouds = dust;

  // 8. Take-up Unit (Gravity weight)
  const weightGeo = new THREE.BoxGeometry(2, 3, 2);
  const weightMat = new THREE.MeshStandardMaterial({ color: 0x555555 });
  disposables.push(weightGeo, weightMat);
  const weight = new THREE.Mesh(weightGeo, weightMat);
  weight.position.copy(startPos);
  weight.position.y -= 3;
  group.add(weight);
  animatables.takeUpWeight = weight;
  
  // Wire/Rope for take-up
  const ropeGeo = new THREE.CylinderGeometry(0.05, 0.05, 3);
  const rope = new THREE.Mesh(ropeGeo, new THREE.MeshBasicMaterial({color: 0x000000}));
  rope.position.copy(startPos);
  rope.position.y -= 1.5;
  group.add(rope);
};

export const animateMineBeltConveyorScene = (animatables: SimAnimatables, time: number, simData: any) => {
    const speed = simData?.speed || 0; // m/s, mapped to 0-1 factor
    const load = simData?.load || 0; // 0-100 %

    // 1. Pulleys & Idlers Rotation
    const rotSpeed = speed * 0.2;
    if (animatables.drivePulley) animatables.drivePulley.rotation.x -= rotSpeed;
    if (animatables.tailPulley) animatables.tailPulley.rotation.x -= rotSpeed;
    if (animatables.idlers) {
        // Simple visual rotation if we could access instances individually, but InstancedMesh rotation is static
        // To animate rotation of instances, we need to update matrix every frame which is expensive
        // Instead we can rotate texture or just assume motion blur
    }
    
    // 2. Belt Texture Scroll
    if (animatables.conveyorBelt) {
        const tex = (animatables.conveyorBelt.material as THREE.MeshStandardMaterial).map;
        if (tex) tex.offset.x -= speed * 0.01;
    }

    // 3. Material Flow
    if (animatables.materialFlow) {
        const offsets = animatables.materialFlow.geometry.attributes.offset.array as Float32Array;
        const lanes = animatables.materialFlow.geometry.attributes.lane.array as Float32Array;
        const positions = animatables.materialFlow.geometry.attributes.position.array as Float32Array;
        
        const start = (animatables.materialFlow as any).userData.start as THREE.Vector3;
        const end = (animatables.materialFlow as any).userData.end as THREE.Vector3;
        
        // Sag calculation based on load
        const sagAmount = (load / 100) * 0.5; // Max 0.5m sag
        
        // Only show particles based on load % (simple visibility hack by moving out of view)
        const activeCount = Math.floor((load / 100) * offsets.length);

        for(let i=0; i<offsets.length; i++) {
            if (i > activeCount) {
                positions[i*3+1] = -1000; // Hide
                continue;
            }

            offsets[i] += speed * 0.005;
            if (offsets[i] > 1) offsets[i] = 0;
            
            const t = offsets[i];
            
            // Linear interp
            const x = THREE.MathUtils.lerp(start.x, end.x, t);
            const yBase = THREE.MathUtils.lerp(start.y, end.y, t);
            const z = THREE.MathUtils.lerp(start.z, end.z, t);
            
            // Sag between idlers (approx every 0.25 t)
            // Idlers are at t = 0, 0.25, 0.5, 0.75, 1.0
            const idlerFreq = 4; 
            const localT = (t * idlerFreq) % 1; 
            // Parabolic sag: 4 * sag * x * (1-x)
            const sag = 4 * sagAmount * localT * (1 - localT);

            positions[i*3] = x;
            positions[i*3+1] = yBase + 1.0 - sag + (Math.random()*0.1); // +1.0 belt surface offset
            positions[i*3+2] = z + lanes[i];
        }
        animatables.materialFlow.geometry.attributes.position.needsUpdate = true;
        animatables.materialFlow.geometry.attributes.offset.needsUpdate = true;
    }

    // 4. Dust at Discharge
    if (animatables.dustClouds && load > 10 && speed > 0) {
        const positions = animatables.dustClouds.geometry.attributes.position.array as Float32Array;
        const lifes = animatables.dustClouds.geometry.attributes.life.array as Float32Array;
        
        // Discharge point is roughly 'end'
        const dischargeX = 20; 
        const dischargeY = 10;
        
        for(let i=0; i<lifes.length; i++) {
            lifes[i] -= 0.02;
            if (lifes[i] < 0) {
                lifes[i] = 1;
                positions[i*3] = dischargeX + (Math.random()-0.5)*2;
                positions[i*3+1] = dischargeY;
                positions[i*3+2] = (Math.random()-0.5)*2;
            }
            
            // Fall down
            positions[i*3+1] -= 0.1;
            // Spread
            positions[i*3] += (Math.random()-0.5)*0.1;
            positions[i*3+2] += (Math.random()-0.5)*0.1;
        }
        animatables.dustClouds.geometry.attributes.position.needsUpdate = true;
        animatables.dustClouds.geometry.attributes.life.needsUpdate = true;
        animatables.dustClouds.visible = true;
    } else if (animatables.dustClouds) {
        animatables.dustClouds.visible = false;
    }

    // 5. Take-up Weight Bobbing
    // Moves based on tension (load)
    if (animatables.takeUpWeight) {
        const targetY = -3 - (load / 100); // Lowers as load increases (more stretch)
        animatables.takeUpWeight.position.y = THREE.MathUtils.lerp(animatables.takeUpWeight.position.y, targetY, 0.05);
    }
};
