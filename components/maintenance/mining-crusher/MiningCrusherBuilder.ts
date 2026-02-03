
import * as THREE from 'three';
import { CrusherAnimatables, CrusherSimState } from './three-types';

export const initCrusherScene = (
  group: THREE.Group, 
  animatables: CrusherAnimatables,
  disposables: { dispose: () => void }[]
) => {
    console.log("=== MiningCrusherBuilder Init ===");
  // --- Materials ---
  const frameMat = new THREE.MeshStandardMaterial({ 
    color: 0x44403c, roughness: 0.7, metalness: 0.3 
  }); // Stone Grey
  const mantleMat = new THREE.MeshStandardMaterial({ 
    color: 0x78350f, roughness: 0.6, metalness: 0.6 
  }); // Manganese Steel (Brownish)
  const paintMat = new THREE.MeshStandardMaterial({ 
    color: 0xf59e0b, roughness: 0.4, metalness: 0.4 
  }); // Industrial Yellow
  const steelMat = new THREE.MeshStandardMaterial({ 
    color: 0x94a3b8, roughness: 0.3, metalness: 0.8 
  });
  const crackMat = new THREE.MeshBasicMaterial({ 
    color: 0xff0000, transparent: true, opacity: 0, side: THREE.DoubleSide 
  });
  const laserMat = new THREE.MeshBasicMaterial({ 
    color: 0xef4444, transparent: true, opacity: 0.6 
  });

  disposables.push(frameMat, mantleMat, paintMat, steelMat, crackMat, laserMat);

  // 1. Base / Lower Frame
  const baseGeo = new THREE.CylinderGeometry(4, 4.5, 3, 8);
  baseGeo.translate(0, 1.5, 0);
  disposables.push(baseGeo);
  const base = new THREE.Mesh(baseGeo, frameMat);
  group.add(base);

  // Discharge Chute
  const chuteGeo = new THREE.BoxGeometry(3, 1, 5);
  chuteGeo.translate(0, 0.5, 0);
  disposables.push(chuteGeo);
  const chute = new THREE.Mesh(chuteGeo, steelMat);
  group.add(chute);

  // 2. Mantle (Moving Part)
  const mantleGroup = new THREE.Group();
  mantleGroup.position.set(0, 3, 0);
  group.add(mantleGroup);
  animatables.mantleGroup = mantleGroup;

  const mantleConeGeo = new THREE.ConeGeometry(2.5, 3, 16, 1, true);
  disposables.push(mantleConeGeo);
  const mantle = new THREE.Mesh(mantleConeGeo, mantleMat);
  mantleGroup.add(mantle);

  const shaftGeo = new THREE.CylinderGeometry(0.5, 0.5, 5);
  shaftGeo.translate(0, -1, 0);
  disposables.push(shaftGeo);
  const shaft = new THREE.Mesh(shaftGeo, steelMat);
  mantleGroup.add(shaft);

  // 3. Upper Frame (Removable)
  const upperGroup = new THREE.Group();
  upperGroup.position.set(0, 3, 0); // Sits on top of base (base height 3)
  group.add(upperGroup);
  animatables.upperFrame = upperGroup;

  // Bowl
  const bowlGeo = new THREE.CylinderGeometry(4, 4, 2.5, 8, 1, true);
  bowlGeo.translate(0, 1.25, 0);
  disposables.push(bowlGeo);
  const bowl = new THREE.Mesh(bowlGeo, paintMat);
  upperGroup.add(bowl);

  // Hopper
  const hopperGeo = new THREE.ConeGeometry(5, 2, 8, 1, true);
  hopperGeo.rotateX(Math.PI);
  hopperGeo.translate(0, 3.5, 0);
  disposables.push(hopperGeo);
  const hopper = new THREE.Mesh(hopperGeo, paintMat);
  upperGroup.add(hopper);

  // The Crack (Attached to Base or Lower Frame)
  // We simulate a crack on the main frame rim
  const crackGeo = new THREE.RingGeometry(3.8, 4.0, 32, 1, 0, Math.PI/4);
  crackGeo.rotateX(-Math.PI/2);
  crackGeo.translate(0, 3.01, 0); // Top of base
  disposables.push(crackGeo);
  const crack = new THREE.Mesh(crackGeo, crackMat);
  group.add(crack);
  animatables.crackHighlight = crack;

  // 4. Laser Scanner (Hidden initially)
  const scanGroup = new THREE.Group();
  scanGroup.position.set(3, 4, 3);
  group.add(scanGroup);
  animatables.laserScanner = scanGroup;

  const armGeo = new THREE.BoxGeometry(0.2, 4, 0.2);
  armGeo.translate(0, 2, 0);
  const arm = new THREE.Mesh(armGeo, steelMat);
  scanGroup.add(arm);
  
  const headGeo = new THREE.BoxGeometry(0.5, 0.5, 0.5);
  const head = new THREE.Mesh(headGeo, steelMat);
  head.position.y = 4;
  scanGroup.add(head);

  // Laser Beam
  const beamGeo = new THREE.CylinderGeometry(0.02, 0.1, 4);
  beamGeo.rotateZ(Math.PI/2);
  beamGeo.translate(-2, 4, 0);
  disposables.push(beamGeo);
  const beam = new THREE.Mesh(beamGeo, laserMat);
  scanGroup.add(beam);
  animatables.laserBeam = beam;
  
  scanGroup.visible = false;

  // 5. Overhead Crane Hook
  const craneGroup = new THREE.Group();
  craneGroup.position.set(0, 10, 0);
  group.add(craneGroup);
  animatables.craneHook = craneGroup;
  
  const hookGeo = new THREE.TorusGeometry(0.5, 0.1, 8, 16, Math.PI);
  hookGeo.rotateZ(Math.PI/2);
  const hook = new THREE.Mesh(hookGeo, new THREE.MeshStandardMaterial({color: 0xffff00}));
  craneGroup.add(hook);
  const cableGeo = new THREE.CylinderGeometry(0.05, 0.05, 10);
  cableGeo.translate(0, 5, 0);
  const cable = new THREE.Mesh(cableGeo, new THREE.MeshBasicMaterial({color: 0x111111}));
  craneGroup.add(cable);

  // 6. Particles (Rocks/Sparks)
  const pGeo = new THREE.BufferGeometry();
  const pCount = 200;
  const pPos = new Float32Array(pCount * 3);
  pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
  const pMat = new THREE.PointsMaterial({ color: 0xaaaaaa, size: 0.1 });
  disposables.push(pGeo, pMat);
  const particles = new THREE.Points(pGeo, pMat);
  group.add(particles);
  animatables.rocks = particles;
  
  const sGeo = new THREE.BufferGeometry();
  const sPos = new Float32Array(100 * 3);
  sGeo.setAttribute('position', new THREE.BufferAttribute(sPos, 3));
  const sMat = new THREE.PointsMaterial({ color: 0xffaa00, size: 0.15, transparent: true, opacity: 0 });
  const sparks = new THREE.Points(sGeo, sMat);
  group.add(sparks);
  animatables.weldSparks = sparks;
};

export const animateCrusherScene = (
  animatables: CrusherAnimatables, 
  state: CrusherSimState,
  time: number
) => {
    console.log("=== animateCrusherScene Init ===");
  // 1. Mantle Gyratory Motion (Operation)
  if (state === 'OPERATION' || state === 'ALARM') {
      if (animatables.mantleGroup) {
          // Gyratory motion: Rotate around Y, but with an offset/wobble
          const wobble = 0.2;
          animatables.mantleGroup.position.x = Math.sin(time * 10) * wobble;
          animatables.mantleGroup.position.z = Math.cos(time * 10) * wobble;
          animatables.mantleGroup.rotation.y = time * 2;
      }
      // Rock Particles
      if (animatables.rocks) {
          const pos = animatables.rocks.geometry.attributes.position.array as Float32Array;
          for(let i=0; i<pos.length; i+=3) {
              pos[i+1] -= 0.2; // Fall
              if (pos[i+1] < 0) {
                  pos[i+1] = 6; // Reset top
                  pos[i] = (Math.random()-0.5) * 2;
                  pos[i+2] = (Math.random()-0.5) * 2;
              }
          }
          animatables.rocks.geometry.attributes.position.needsUpdate = true;
          animatables.rocks.visible = true;
      }
  } else {
      if (animatables.rocks) animatables.rocks.visible = false;
  }

  // 2. Alarm State - Crack Pulse
  if (state === 'ALARM' && animatables.crackHighlight) {
      (animatables.crackHighlight.material as THREE.MeshBasicMaterial).opacity = 0.5 + Math.sin(time * 10) * 0.5;
      animatables.crackHighlight.visible = true;
  } else if (state !== 'NDT_SCAN' && state !== 'WELDING' && animatables.crackHighlight) {
      animatables.crackHighlight.visible = false;
  }

  // 3. Disassembly - Crane Lift
  if (state === 'DISASSEMBLY') {
      const liftH = 6;
      const t = (Math.sin(time) + 1) / 2; // 0 to 1 cycle
      if (animatables.craneHook) animatables.craneHook.position.y = 5 + (1-t) * 2; // Hook down
      // Actually simpler: Lift Upper Frame
      if (animatables.upperFrame) {
          animatables.upperFrame.position.y = 3 + t * liftH;
      }
  } else if (state !== 'OPERATION' && state !== 'ALARM' && state !== 'REASSEMBLY') {
      // Keep it lifted for maintenance steps
      if (animatables.upperFrame) animatables.upperFrame.position.y = 100; // Move away
  } else if (state === 'REASSEMBLY') {
      // Lower it back
       if (animatables.upperFrame) {
          const t = (Math.sin(time) + 1) / 2;
          animatables.upperFrame.position.y = 3 + (1-t) * 6;
      }
  } else {
      if (animatables.upperFrame) animatables.upperFrame.position.y = 3; // Reset
  }

  // 4. NDT Scan
  if (state === 'NDT_SCAN') {
      if (animatables.laserScanner) {
          animatables.laserScanner.visible = true;
          animatables.laserScanner.position.x = 2.5 * Math.cos(time);
          animatables.laserScanner.position.z = 2.5 * Math.sin(time);
          animatables.laserScanner.lookAt(0, 3, 0);
      }
      if (animatables.crackHighlight) {
          animatables.crackHighlight.visible = true;
          (animatables.crackHighlight.material as THREE.MeshBasicMaterial).opacity = 0.3;
      }
  } else {
      if (animatables.laserScanner) animatables.laserScanner.visible = false;
  }

  // 5. Welding
  if (state === 'WELDING') {
      if (animatables.weldSparks) {
          (animatables.weldSparks.material as THREE.PointsMaterial).opacity = 1;
          const pos = animatables.weldSparks.geometry.attributes.position.array as Float32Array;
          // Weld spot at crack location (radius ~3.9, y=3)
          const weldX = 3.9 * Math.cos(Math.PI/4);
          const weldZ = 3.9 * Math.sin(Math.PI/4);
          
          for(let i=0; i<pos.length; i+=3) {
              pos[i] = weldX + (Math.random()-0.5)*0.5;
              pos[i+1] = 3 + Math.random()*1;
              pos[i+2] = weldZ + (Math.random()-0.5)*0.5;
          }
          animatables.weldSparks.geometry.attributes.position.needsUpdate = true;
      }
  } else {
      if (animatables.weldSparks) (animatables.weldSparks.material as THREE.PointsMaterial).opacity = 0;
  }
};
