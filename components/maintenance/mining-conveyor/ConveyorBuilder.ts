
import * as THREE from 'three';
import { ConveyorAnimatables, ConveyorSimState } from './three-types';

export const initConveyorScene = (
  group: THREE.Group, 
  animatables: ConveyorAnimatables,
  disposables: { dispose: () => void }[]
) => {
  // --- Materials ---
  const frameMat = new THREE.MeshStandardMaterial({ 
    color: 0x334155, roughness: 0.8, metalness: 0.4 
  }); // Dark Steel Structure
  const beltMat = new THREE.MeshStandardMaterial({ 
    color: 0x171717, roughness: 0.9, flatShading: true
  }); // Rubber Belt
  const rollerMat = new THREE.MeshStandardMaterial({ 
    color: 0xf59e0b, roughness: 0.4, metalness: 0.6 
  }); // Industrial Yellow Rollers
  const pulleyMat = new THREE.MeshStandardMaterial({ 
    color: 0x94a3b8, roughness: 0.3, metalness: 0.8 
  });
  const steelMat = new THREE.MeshStandardMaterial({ 
    color: 0x94a3b8, roughness: 0.3, metalness: 0.8 
  });
  const coalMat = new THREE.PointsMaterial({ 
    color: 0x0f0f0f, size: 0.15 
  });
  const repairMat = new THREE.MeshStandardMaterial({ 
    color: 0xef4444, roughness: 0.5, emissive: 0x7f1d1d, emissiveIntensity: 0.2
  }); // Red Vulcanizer
  const tearMat = new THREE.MeshBasicMaterial({ 
    color: 0xff0000, side: THREE.DoubleSide 
  });
  const beamMat = new THREE.MeshBasicMaterial({ 
    color: 0x22d3ee, transparent: true, opacity: 0.3, side: THREE.DoubleSide
  });

  disposables.push(frameMat, beltMat, rollerMat, pulleyMat, steelMat, coalMat, repairMat, tearMat, beamMat);

  // 1. Truss Frame (Long corridor)
  const length = 20;
  const width = 3;
  
  const trussGroup = new THREE.Group();
  // Bottom chords
  const chordGeo = new THREE.BoxGeometry(length, 0.2, 0.2);
  const chordL = new THREE.Mesh(chordGeo, frameMat); chordL.position.z = width/2;
  const chordR = new THREE.Mesh(chordGeo, frameMat); chordR.position.z = -width/2;
  trussGroup.add(chordL, chordR);
  
  // Legs
  const legGeo = new THREE.BoxGeometry(0.2, 2, 0.2);
  for(let x=-length/2; x<=length/2; x+=4) {
      const legL = new THREE.Mesh(legGeo, frameMat); legL.position.set(x, -1, width/2);
      const legR = new THREE.Mesh(legGeo, frameMat); legR.position.set(x, -1, -width/2);
      trussGroup.add(legL, legR);
      
      // Cross bracing
      const crossGeo = new THREE.BoxGeometry(0.1, 0.1, width);
      const cross = new THREE.Mesh(crossGeo, frameMat);
      cross.position.set(x, -0.2, 0);
      trussGroup.add(cross);
  }
  group.add(trussGroup);

  // 2. Pulleys (Head & Tail)
  const pulleyGeo = new THREE.CylinderGeometry(0.8, 0.8, width - 0.4, 32);
  pulleyGeo.rotateX(Math.PI/2);
  
  const drivePulley = new THREE.Mesh(pulleyGeo, pulleyMat);
  drivePulley.position.set(length/2, 0.8, 0);
  group.add(drivePulley);
  animatables.drivePulley = drivePulley;

  const tailPulley = new THREE.Mesh(pulleyGeo, pulleyMat);
  tailPulley.position.set(-length/2, 0.8, 0);
  group.add(tailPulley);
  animatables.tailPulley = tailPulley;

  // 3. Idlers (Rollers) - V shape trough
  animatables.rollers = [];
  const rollerGeo = new THREE.CylinderGeometry(0.15, 0.15, width/3, 16);
  rollerGeo.rotateX(Math.PI/2);

  for(let x=-length/2 + 1; x < length/2; x+=1.5) {
      const idlerGroup = new THREE.Group();
      idlerGroup.position.set(x, 0.5, 0);
      
      // Center roller
      const cRoller = new THREE.Mesh(rollerGeo, rollerMat);
      idlerGroup.add(cRoller);
      animatables.rollers.push(idlerGroup); // Add group for simplified animation logic
      
      // Side rollers (angled)
      const lRoller = new THREE.Mesh(rollerGeo, rollerMat);
      lRoller.position.set(0, 0.2, width/3.5);
      lRoller.rotation.x = -Math.PI/6;
      idlerGroup.add(lRoller);
      
      const rRoller = new THREE.Mesh(rollerGeo, rollerMat);
      rRoller.position.set(0, 0.2, -width/3.5);
      rRoller.rotation.x = Math.PI/6;
      idlerGroup.add(rRoller);
      
      group.add(idlerGroup);
  }

  // 4. Belt (Simulated by segments to allow texture movement effect)
  const beltGroup = new THREE.Group();
  const segGeo = new THREE.BoxGeometry(0.8, 0.05, width - 0.5);
  // Top Run
  for(let x=-length/2; x<=length/2; x+=0.85) {
      const seg = new THREE.Mesh(segGeo, beltMat);
      seg.position.set(x, 1.65, 0); // Sits on rollers
      // Simple trough shape approximation visually or just flat
      beltGroup.add(seg);
  }
  // Bottom Run (Return)
  for(let x=-length/2; x<=length/2; x+=0.85) {
      const seg = new THREE.Mesh(segGeo, beltMat);
      seg.position.set(x, 0, 0); 
      beltGroup.add(seg);
  }
  group.add(beltGroup);
  animatables.beltGroup = beltGroup;

  // 5. Tear Damage Marker (Hidden initially)
  const tearGeo = new THREE.PlaneGeometry(0.5, 1.5);
  tearGeo.rotateX(-Math.PI/2);
  const tear = new THREE.Mesh(tearGeo, tearMat);
  tear.position.set(0, 1.68, 0);
  tear.visible = false;
  beltGroup.add(tear); // Attach to belt group so it moves? No, simpler to be static pos for simulation
  animatables.tearMarker = tear;

  // 6. Material (Coal)
  const pCount = 1000;
  const pGeo = new THREE.BufferGeometry();
  const pPos = new Float32Array(pCount * 3);
  for(let i=0; i<pCount; i++) {
      pPos[i*3] = (Math.random() - 0.5) * length; 
      pPos[i*3+1] = 1.8 + Math.random() * 0.3; // On belt
      pPos[i*3+2] = (Math.random() - 0.5) * (width - 1);
  }
  pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
  const particles = new THREE.Points(pGeo, coalMat);
  group.add(particles);
  animatables.material = particles;

  // 7. Vulcanizer (Repair Machine)
  const vGroup = new THREE.Group();
  vGroup.position.set(0, 5, 0); // Hovering above
  group.add(vGroup);
  animatables.vulcanizer = vGroup;

  const pressTopGeo = new THREE.BoxGeometry(2, 0.5, 3.5);
  const pressBotGeo = new THREE.BoxGeometry(2, 0.5, 3.5);
  const pressColGeo = new THREE.CylinderGeometry(0.1, 0.1, 2);
  
  const topPlate = new THREE.Mesh(pressTopGeo, repairMat);
  const botPlate = new THREE.Mesh(pressBotGeo, repairMat);
  botPlate.position.y = -2; // Gap for belt
  
  vGroup.add(topPlate, botPlate);
  
  [-0.8, 0.8].forEach(x => {
      [-1.5, 1.5].forEach(z => {
          const col = new THREE.Mesh(pressColGeo, steelMat);
          col.position.set(x, -1, z);
          vGroup.add(col);
      });
  });

  // 8. Scanner Beam
  const beamGeo = new THREE.PlaneGeometry(0.1, 3);
  beamGeo.rotateX(-Math.PI/2);
  const beam = new THREE.Mesh(beamGeo, beamMat);
  beam.position.set(-8, 2.5, 0);
  beam.visible = false;
  group.add(beam);
  animatables.scannerBeam = beam;
  
  // Scanner Device
  const scannerBox = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.5, 3.5), frameMat);
  scannerBox.position.set(-8, 3, 0);
  group.add(scannerBox);
};

export const animateConveyorScene = (
  animatables: ConveyorAnimatables, 
  state: ConveyorSimState,
  time: number
) => {
  const isRunning = state === 'RUNNING';
  const speed = isRunning ? 0.2 : 0;

  // 1. Belt & Material Movement
  if (isRunning) {
      if (animatables.material && animatables.material.geometry.attributes.position) {
          const pos = animatables.material.geometry.attributes.position.array as Float32Array;
          for(let i=0; i<pos.length; i+=3) {
              pos[i] += speed;
              if (pos[i] > 10) pos[i] = -10; // Loop
          }
          animatables.material.geometry.attributes.position.needsUpdate = true;
      }
      
      // Rotate Pulleys/Rollers
      if (animatables.drivePulley) animatables.drivePulley.rotation.z -= 0.1;
      if (animatables.tailPulley) animatables.tailPulley.rotation.z -= 0.1;
      if (animatables.rollers) {
          animatables.rollers.forEach(grp => {
              grp.children.forEach(r => r.rotation.z -= 0.2);
          });
      }
      
      // Scanner Effect
      if (animatables.scannerBeam) {
          animatables.scannerBeam.visible = true;
          animatables.scannerBeam.scale.x = 1 + Math.sin(time * 10) * 0.2;
      }
  } else {
      if (animatables.scannerBeam) animatables.scannerBeam.visible = false;
  }

  // 2. Fault Visuals
  if (state === 'FAULT_TEAR' || state === 'EMERGENCY_STOP' || state === 'LOCKOUT' || state === 'PREP_SURFACE') {
      if (animatables.tearMarker) {
          animatables.tearMarker.visible = true;
          // Position fixed at "damage site" (center of repair)
          animatables.tearMarker.position.set(0, 1.68, 0);
          (animatables.tearMarker.material as THREE.MeshBasicMaterial).opacity = Math.sin(time * 5) * 0.5 + 0.5;
      }
  } else {
      if (animatables.tearMarker) animatables.tearMarker.visible = false;
  }

  // 3. Repair Animation
  if (state === 'PREP_SURFACE' || state === 'VULCANIZING' || state === 'TENSIONING') {
      if (animatables.vulcanizer) {
          // Lower into position
          const targetY = 2.5; 
          animatables.vulcanizer.position.y = THREE.MathUtils.lerp(animatables.vulcanizer.position.y, targetY, 0.05);
          
          if (state === 'VULCANIZING') {
              // Heat glow effect
              (animatables.vulcanizer.children[0] as THREE.Mesh).material = new THREE.MeshStandardMaterial({ 
                  color: 0xff0000, emissive: 0xff4400, emissiveIntensity: Math.sin(time * 2) * 0.5 + 0.5 
              });
          } else {
               // Revert material
               (animatables.vulcanizer.children[0] as THREE.Mesh).material = new THREE.MeshStandardMaterial({ 
                  color: 0xef4444, roughness: 0.5
              });
          }
      }
  } else {
      // Retract Vulcanizer
      if (animatables.vulcanizer) {
          animatables.vulcanizer.position.y = THREE.MathUtils.lerp(animatables.vulcanizer.position.y, 8, 0.05);
      }
  }

  // 4. Tensioning Animation (Tail Pulley moves)
  if (state === 'TENSIONING') {
      if (animatables.tailPulley) {
          animatables.tailPulley.position.x = -10 + Math.sin(time * 5) * 0.1; // Wiggle to show tensioning
      }
  } else {
       if (animatables.tailPulley) animatables.tailPulley.position.x = -10;
  }
};
