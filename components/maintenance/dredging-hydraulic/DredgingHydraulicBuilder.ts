
import * as THREE from 'three';
import { DredgingAnimatables, DredgingSimState } from './three-types';

export const initDredgingScene = (
  group: THREE.Group, 
  animatables: DredgingAnimatables,
  disposables: { dispose: () => void }[]
) => {
  // --- Materials ---
  const hullMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.6 });
  const deckMat = new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.8 });
  const ladderMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.5, metalness: 0.4 }); // Yellow machinery
  const cutterMat = new THREE.MeshStandardMaterial({ color: 0x92400e, roughness: 0.9, metalness: 0.2 }); // Rusted/Muddy cutter
  const hydraulicMat = new THREE.MeshStandardMaterial({ color: 0xffffff, metalness: 0.8, roughness: 0.2 }); // Chrome rods
  const cylPaintMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b });
  const waterMat = new THREE.MeshPhysicalMaterial({ 
    color: 0x0891b2, transmission: 0.8, opacity: 0.6, transparent: true, roughness: 0.2 
  });
  const valveMat = new THREE.MeshStandardMaterial({ color: 0xef4444 }); // Red faulty valve
  const pipeMat = new THREE.MeshStandardMaterial({ color: 0x64748b });
  const steelMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.4, metalness: 0.6 });

  disposables.push(hullMat, deckMat, ladderMat, cutterMat, hydraulicMat, cylPaintMat, waterMat, valveMat, pipeMat, steelMat);

  // 1. Water
  const waterGeo = new THREE.PlaneGeometry(60, 60);
  waterGeo.rotateX(-Math.PI / 2);
  const water = new THREE.Mesh(waterGeo, waterMat);
  water.position.y = -1;
  group.add(water);

  // 2. Dredger Hull (Simple pontoon)
  const hullGeo = new THREE.BoxGeometry(8, 3, 20);
  hullGeo.translate(0, 0.5, 0);
  disposables.push(hullGeo);
  const hull = new THREE.Mesh(hullGeo, hullMat);
  group.add(hull);

  const deckGeo = new THREE.BoxGeometry(8.2, 0.2, 20.2);
  deckGeo.translate(0, 2.1, 0);
  disposables.push(deckGeo);
  const deck = new THREE.Mesh(deckGeo, deckMat);
  group.add(deck);

  // Control Cabin
  const cabinGeo = new THREE.BoxGeometry(6, 3, 5);
  cabinGeo.translate(0, 3.5, 4);
  disposables.push(cabinGeo);
  const cabin = new THREE.Mesh(cabinGeo, new THREE.MeshStandardMaterial({color: 0xffffff}));
  group.add(cabin);

  // 3. Ladder Assembly (Pivot at hull front)
  const ladderGroup = new THREE.Group();
  ladderGroup.position.set(0, 2, -10); // Pivot point at bow
  group.add(ladderGroup);
  animatables.ladderGroup = ladderGroup;

  const ladderFrameGeo = new THREE.BoxGeometry(2, 1, 15);
  ladderFrameGeo.translate(0, 0, -7.5); // Extend forward
  disposables.push(ladderFrameGeo);
  const ladderFrame = new THREE.Mesh(ladderFrameGeo, ladderMat);
  ladderGroup.add(ladderFrame);

  // 4. Cutter Head
  const cutterGeo = new THREE.SphereGeometry(1.5, 16, 8);
  // Deform slightly to look like a cutter
  const pos = cutterGeo.attributes.position;
  for(let i=0; i<pos.count; i++) {
     const y = pos.getY(i);
     if (y > 0) pos.setY(i, y * 0.2); // Flatten back
     // Add spikes visually via texture or bump map ideally, here geometry noise
     const len = Math.sqrt(pos.getX(i)**2 + pos.getZ(i)**2);
     if (len > 1.2) pos.setXYZ(i, pos.getX(i)*1.2, pos.getY(i), pos.getZ(i)*1.2);
  }
  cutterGeo.rotateX(Math.PI/2);
  disposables.push(cutterGeo);
  const cutter = new THREE.Mesh(cutterGeo, cutterMat);
  cutter.position.set(0, 0, -15);
  ladderGroup.add(cutter);
  animatables.cutterHead = cutter;

  // Mud Spray (Particles at cutter)
  const sprayCount = 200;
  const sprayGeo = new THREE.BufferGeometry();
  const sprayPos = new Float32Array(sprayCount * 3);
  const sprayMat = new THREE.PointsMaterial({ color: 0x854d0e, size: 0.2, transparent: true, opacity: 0.6 });
  disposables.push(sprayGeo, sprayMat);
  const spray = new THREE.Points(sprayGeo, sprayMat);
  spray.position.set(0, 0, -15);
  ladderGroup.add(spray);
  animatables.mudSpray = spray;

  // 5. Hydraulic Cylinders (Ladder Hoist)
  // Attached to Hull
  const cylBodyGeo = new THREE.CylinderGeometry(0.3, 0.3, 4);
  cylBodyGeo.translate(0, 2, 0); // Pivot at base
  disposables.push(cylBodyGeo);
  
  // A-Frame on hull
  const aFrameGeo = new THREE.CylinderGeometry(0.2, 0.2, 8);
  aFrameGeo.rotateZ(Math.PI/2);
  disposables.push(aFrameGeo);
  const aFrame = new THREE.Mesh(aFrameGeo, ladderMat);
  aFrame.position.set(0, 5, -8);
  group.add(aFrame);

  // Cylinder Body
  const cylMesh = new THREE.Mesh(cylBodyGeo, cylPaintMat);
  cylMesh.position.set(0, 5, -8); // Top mount
  group.add(cylMesh);
  animatables.hydraulicCylinderBody = cylMesh;

  // Cylinder Rod (Attached to Ladder)
  const rodGeo = new THREE.CylinderGeometry(0.15, 0.15, 4);
  rodGeo.translate(0, -2, 0);
  disposables.push(rodGeo);
  const rodMesh = new THREE.Mesh(rodGeo, hydraulicMat);
  // Initial position will be handled by lookAt in animation
  group.add(rodMesh);
  animatables.hydraulicCylinderRod = rodMesh;

  // 6. Hydraulic Power Unit (HPU) on Deck
  const hpuGroup = new THREE.Group();
  hpuGroup.position.set(2, 2.1, 0);
  group.add(hpuGroup);
  animatables.hpuUnit = hpuGroup;

  // Tank
  const tankGeo = new THREE.BoxGeometry(2, 1.5, 3);
  tankGeo.translate(0, 0.75, 0);
  disposables.push(tankGeo);
  const tank = new THREE.Mesh(tankGeo, ladderMat);
  hpuGroup.add(tank);

  // Valve Block
  const valveBlockGeo = new THREE.BoxGeometry(0.8, 0.8, 1.5);
  disposables.push(valveBlockGeo);
  const valveBlock = new THREE.Mesh(valveBlockGeo, steelMat);
  valveBlock.position.set(0, 1.8, 0);
  hpuGroup.add(valveBlock);

  // Proportional Valve (Target for Repair)
  const propValGeo = new THREE.CylinderGeometry(0.2, 0.2, 0.6);
  propValGeo.rotateZ(Math.PI/2);
  disposables.push(propValGeo);
  const propValve = new THREE.Mesh(propValGeo, valveMat);
  propValve.position.set(0.5, 0, 0.4);
  valveBlock.add(propValve);
  animatables.proportionalValve = propValve;

  // Piping
  const pipe1 = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 4), pipeMat);
  pipe1.rotation.x = Math.PI/2;
  pipe1.position.set(0, 0.5, -3); // Towards ladder
  hpuGroup.add(pipe1);

  // HPU Fan (Cooler)
  const fanGeo = new THREE.BoxGeometry(0.1, 0.8, 0.1);
  disposables.push(fanGeo);
  const fan = new THREE.Mesh(fanGeo, new THREE.MeshBasicMaterial({color: 0x333333}));
  const fanHousing = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 0.2, 16), steelMat);
  fanHousing.rotation.x = Math.PI/2;
  fanHousing.position.set(1.1, 1, 0);
  fanHousing.add(fan);
  fan.rotation.x = Math.PI/2;
  hpuGroup.add(fanHousing);
  animatables.hpuFan = fan;

  // 7. Fluid Contamination Particles (Visible only in DIAGNOSE)
  const pCount = 100;
  const pGeo = new THREE.BufferGeometry();
  const pPos = new Float32Array(pCount * 3);
  for(let i=0; i<pCount; i++) {
    pPos[i*3] = (Math.random()-0.5) * 1.8;
    pPos[i*3+1] = 0.5 + Math.random();
    pPos[i*3+2] = (Math.random()-0.5) * 2.8;
  }
  pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
  const pMat = new THREE.PointsMaterial({ color: 0x000000, size: 0.05, transparent: true, opacity: 0 });
  disposables.push(pGeo, pMat);
  const particles = new THREE.Points(pGeo, pMat);
  hpuGroup.add(particles);
  animatables.fluidParticles = particles;
};

export const animateDredgingScene = (
  animatables: DredgingAnimatables, 
  state: DredgingSimState,
  time: number
) => {
  // 1. Cutter Rotation
  if (animatables.cutterHead) {
    if (state === 'DREDGING' || state === 'TEST') {
      animatables.cutterHead.rotation.z += 0.1;
    } else if (state === 'STALL') {
      animatables.cutterHead.rotation.z += Math.sin(time * 10) * 0.01; // Jiggle
    }
  }

  // 2. Ladder Movement
  if (animatables.ladderGroup) {
    let targetAngle = -0.5; // DREDGING angle
    if (state === 'STALL') targetAngle = -0.4; // Lift slightly
    if (state === 'REPLACE_VALVE' || state === 'DIAGNOSE' || state === 'FLUSHING') targetAngle = 0; // Horizontal for maintenance

    animatables.ladderGroup.rotation.x = THREE.MathUtils.lerp(animatables.ladderGroup.rotation.x, targetAngle, 0.02);

    // Update Hydraulic Cylinders
    if (animatables.hydraulicCylinderBody && animatables.hydraulicCylinderRod) {
      // Body fixed at A-frame
      // Rod fixed at ladder mid-point
      // Ladder pivot is (0, 2, -10). Ladder mid is roughly (0, 2, -15) when horizontal.
      // Let's simulate lookAt constraints manually for simplicity in this pure math animation function
      
      const ladderAngle = animatables.ladderGroup.rotation.x;
      const pivot = new THREE.Vector3(0, 2, -10);
      const attachPointLocal = new THREE.Vector3(0, 0.5, -5); // On ladder
      // Rotate attach point
      const attachPointWorld = attachPointLocal.clone().applyAxisAngle(new THREE.Vector3(1,0,0), ladderAngle).add(pivot);

      const topMount = new THREE.Vector3(0, 7.1, -8); // A-frame top (approx from builder)
      
      animatables.hydraulicCylinderBody.lookAt(attachPointWorld);
      animatables.hydraulicCylinderRod.position.copy(attachPointWorld);
      animatables.hydraulicCylinderRod.lookAt(topMount);
    }
  }

  // 3. Mud Spray
  if (animatables.mudSpray) {
    const mat = animatables.mudSpray.material as THREE.PointsMaterial;
    if (state === 'DREDGING') {
      mat.opacity = 0.6;
      if (animatables.mudSpray.geometry.attributes.position) {
        const positions = animatables.mudSpray.geometry.attributes.position.array as Float32Array;
        for(let i=0; i<positions.length; i+=3) {
          positions[i] += (Math.random()-0.5)*0.1;
          positions[i+1] += (Math.random()-0.5)*0.1;
          positions[i+2] += (Math.random()-0.5)*0.1;
          if (Math.abs(positions[i]) > 2) positions[i] = 0;
        }
        animatables.mudSpray.geometry.attributes.position.needsUpdate = true;
      }
    } else {
      mat.opacity = 0;
    }
  }

  // 4. HPU Fan
  if (animatables.hpuFan) {
    if (state !== 'REPLACE_VALVE') animatables.hpuFan.rotation.y += 0.2;
  }

  // 5. Particles (Oil Contamination)
  if (animatables.fluidParticles) {
    const mat = animatables.fluidParticles.material as THREE.PointsMaterial;
    if (state === 'DIAGNOSE' || state === 'FLUSHING') {
      mat.opacity = state === 'FLUSHING' ? Math.max(0, 0.8 - (time % 10)/10) : 0.8;
      
      if (animatables.fluidParticles.geometry.attributes.position) {
        const positions = animatables.fluidParticles.geometry.attributes.position.array as Float32Array;
        for(let i=0; i<positions.length; i+=3) {
          positions[i+1] += Math.sin(time*5 + i)*0.01;
        }
        animatables.fluidParticles.geometry.attributes.position.needsUpdate = true;
      }
    } else {
      mat.opacity = 0;
    }
  }

  // 6. Valve Highlight
  if (animatables.proportionalValve) {
    const mat = animatables.proportionalValve.material as THREE.MeshStandardMaterial;
    if (state === 'REPLACE_VALVE') {
      // Pulse red/green
      const t = Math.sin(time * 5);
      mat.emissive.setHex(t > 0 ? 0xff0000 : 0x00ff00);
      mat.emissiveIntensity = 0.5;
      // Animate removal
      animatables.proportionalValve.position.y = Math.sin(time)*0.5 + 0.5;
    } else if (state === 'STALL') {
      mat.emissive.setHex(0xff0000);
      mat.emissiveIntensity = 1;
      animatables.proportionalValve.position.y = 0;
    } else {
      mat.emissiveIntensity = 0;
      animatables.proportionalValve.position.y = 0;
    }
  }
};
