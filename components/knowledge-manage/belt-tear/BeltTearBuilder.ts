
import * as THREE from 'three';
import { BeltAnimatables, DetectionState } from './three-types';

export const initBeltTearScene = (
  group: THREE.Group, 
  animatables: BeltAnimatables,
  disposables: { dispose: () => void }[]
) => {
  // --- Materials ---
  const frameMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.6, metalness: 0.4 });
  const beltMat = new THREE.MeshStandardMaterial({ 
    color: 0x111111, roughness: 0.9, flatShading: false
  });
  const rollerMat = new THREE.MeshStandardMaterial({ color: 0xc2410c, roughness: 0.5 }); // Orange rollers
  const laserMat = new THREE.MeshBasicMaterial({ color: 0xff0000, transparent: true, opacity: 0.4, side: THREE.DoubleSide });
  const cameraMat = new THREE.MeshBasicMaterial({ color: 0x0ea5e9, wireframe: true, transparent: true, opacity: 0.1 });
  const tearMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 1.0, emissive: 0x330000 }); 
  const dustMat = new THREE.PointsMaterial({ color: 0x555555, size: 0.05, transparent: true, opacity: 0.4 });

  disposables.push(frameMat, beltMat, rollerMat, laserMat, cameraMat, tearMat, dustMat);

  // 1. Conveyor Structure
  const length = 20;
  const width = 3;
  
  // Legs
  for(let z=-8; z<=8; z+=4) {
      const legL = new THREE.Mesh(new THREE.BoxGeometry(0.2, 3, 0.2), frameMat);
      legL.position.set(-width/2 - 0.2, -1.5, z);
      const legR = new THREE.Mesh(new THREE.BoxGeometry(0.2, 3, 0.2), frameMat);
      legR.position.set(width/2 + 0.2, -1.5, z);
      group.add(legL, legR);
      
      // Cross beam
      const cross = new THREE.Mesh(new THREE.BoxGeometry(width + 0.6, 0.2, 0.2), frameMat);
      cross.position.set(0, -0.5, z);
      group.add(cross);
  }

  // 2. Rollers (V-shape idlers)
  animatables.rollers = [];
  for(let z=-9; z<=9; z+=1.5) {
      const rGroup = new THREE.Group();
      rGroup.position.set(0, 0, z);
      
      const rGeo = new THREE.CylinderGeometry(0.15, 0.15, 1.2);
      rGeo.rotateZ(Math.PI/2);
      
      const cRoller = new THREE.Mesh(rGeo, rollerMat); // Center flat
      rGroup.add(cRoller);

      const lRoller = new THREE.Mesh(rGeo, rollerMat);
      lRoller.position.set(-1.1, 0.2, 0);
      lRoller.rotation.z = -Math.PI/6;
      rGroup.add(lRoller);

      const rRoller2 = new THREE.Mesh(rGeo, rollerMat);
      rRoller2.position.set(1.1, 0.2, 0);
      rRoller2.rotation.z = Math.PI/6;
      rGroup.add(rRoller2);

      group.add(rGroup);
      animatables.rollers.push(rGroup);
  }

  // 3. The Belt
  const beltGeo = new THREE.BoxGeometry(2.8, 0.05, length);
  const belt = new THREE.Mesh(beltGeo, beltMat);
  belt.position.y = 0.16; // Just above center roller
  group.add(belt);
  animatables.beltMesh = belt;

  // 4. The Tear (Damage Simulation)
  const tearGroup = new THREE.Group();
  // Create a jagged shape
  const tearGeo = new THREE.PlaneGeometry(0.2, 2, 4, 8);
  const pos = tearGeo.attributes.position;
  for(let i=0; i<pos.count; i++) {
      pos.setX(i, pos.getX(i) + (Math.random()-0.5)*0.1);
  }
  tearGeo.rotateX(-Math.PI/2);
  const tearMesh = new THREE.Mesh(tearGeo, tearMat);
  tearMesh.position.y = 0.04; // Slightly above belt
  tearGroup.add(tearMesh);
  
  // Highlight box (Visual aid)
  const boxGeo = new THREE.BoxGeometry(0.5, 0.5, 2.5);
  const boxMesh = new THREE.Mesh(boxGeo, new THREE.MeshBasicMaterial({color: 0xff0000, wireframe: true}));
  boxMesh.visible = false;
  tearGroup.add(boxMesh);

  // Initial position off-screen
  tearGroup.position.z = 12; 
  group.add(tearGroup);
  animatables.tearObject = tearGroup;

  // 5. Scanner / Vision System
  const scannerGroup = new THREE.Group();
  scannerGroup.position.set(0, 3, 0);
  
  const bar = new THREE.Mesh(new THREE.BoxGeometry(4, 0.2, 0.5), frameMat);
  scannerGroup.add(bar);
  
  // Line Laser Emitter
  const laserGeo = new THREE.PlaneGeometry(3, 3);
  const laser = new THREE.Mesh(laserGeo, laserMat);
  laser.position.y = -1.5;
  scannerGroup.add(laser);
  animatables.laserFan = laser;

  // Camera Frustum
  const camGeo = new THREE.ConeGeometry(1.5, 3, 4, 1, true);
  camGeo.rotateX(Math.PI); // Point down
  camGeo.rotateY(Math.PI/4); // Square it
  const cam = new THREE.Mesh(camGeo, cameraMat);
  cam.position.y = -1.5;
  scannerGroup.add(cam);
  animatables.cameraCone = cam;

  group.add(scannerGroup);
  animatables.scannerBar = scannerGroup;

  // 6. Dust
  const pGeo = new THREE.BufferGeometry();
  const pCount = 500;
  const pArr = new Float32Array(pCount * 3);
  for(let i=0; i<pCount; i++) {
      pArr[i*3] = (Math.random()-0.5) * 4;
      pArr[i*3+1] = Math.random() * 2;
      pArr[i*3+2] = (Math.random()-0.5) * 15;
  }
  pGeo.setAttribute('position', new THREE.BufferAttribute(pArr, 3));
  const particles = new THREE.Points(pGeo, dustMat);
  group.add(particles);
  animatables.particles = particles;
};

export const animateBeltTear = (
  animatables: BeltAnimatables, 
  state: DetectionState,
  time: number
) => {
  const speed = state === 'STOPPED' ? 0 : 0.2;

  // 1. Rollers
  if (animatables.rollers) {
      animatables.rollers.forEach(grp => {
          grp.children.forEach(r => r.rotation.x += speed);
      });
  }

  // 2. Tear Movement
  if (animatables.tearObject) {
      if (state !== 'STOPPED') {
          animatables.tearObject.position.z -= speed;
          // Loop
          if (animatables.tearObject.position.z < -12) {
              animatables.tearObject.position.z = 12;
              animatables.tearObject.position.x = (Math.random()-0.5) * 1.5; // Random lane
          }
      }
  }

  // 3. Laser Animation
  if (animatables.laserFan) {
      // Pulse opacity
      (animatables.laserFan.material as THREE.MeshBasicMaterial).opacity = 0.3 + Math.sin(time * 20) * 0.1;
  }

  // 4. Detection Logic Visuals
  if (state === 'DETECTED' && animatables.tearObject && animatables.scannerBar) {
      // If tear is under scanner (z approx 0), stop or slow
      // In this sim, we just show effects
      const dist = Math.abs(animatables.tearObject.position.z);
      if (dist < 2) {
           if (animatables.cameraCone) {
               (animatables.cameraCone.material as THREE.MeshBasicMaterial).color.setHex(0xff0000);
               (animatables.cameraCone.material as THREE.MeshBasicMaterial).opacity = 0.5;
           }
           // Show bbox
           animatables.tearObject.children[1].visible = true;
      } else {
           if (animatables.cameraCone) {
               (animatables.cameraCone.material as THREE.MeshBasicMaterial).color.setHex(0x0ea5e9);
               (animatables.cameraCone.material as THREE.MeshBasicMaterial).opacity = 0.1;
           }
           animatables.tearObject.children[1].visible = false;
      }
  } else {
       if (animatables.tearObject) animatables.tearObject.children[1].visible = false;
       if (animatables.cameraCone) (animatables.cameraCone.material as THREE.MeshBasicMaterial).color.setHex(0x0ea5e9);
  }

  // 5. Dust Drift
  if (animatables.particles) {
      animatables.particles.rotation.y = time * 0.05;
  }
};
