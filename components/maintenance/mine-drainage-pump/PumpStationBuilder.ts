
import * as THREE from 'three';
import { PumpAnimatables, PumpSimState } from './three-types';

export const initPumpStationScene = (
  group: THREE.Group, 
  animatables: PumpAnimatables,
  disposables: { dispose: () => void }[]
) => {
  // --- Materials ---
  const ironMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.7, metalness: 0.5 });
  const motorMat = new THREE.MeshStandardMaterial({ color: 0x1e40af, roughness: 0.4, metalness: 0.3 }); // Navy Blue Motor
  const chromeMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.1, metalness: 1.0 });
  const copperMat = new THREE.MeshStandardMaterial({ color: 0xb45309, metalness: 0.8, roughness: 0.3 });
  const waterMat = new THREE.MeshPhysicalMaterial({ color: 0x0ea5e9, transparent: true, opacity: 0.4, transmission: 0.5 });
  const alarmMat = new THREE.MeshBasicMaterial({ color: 0xef4444, transparent: true, opacity: 0.5 });

  disposables.push(ironMat, motorMat, chromeMat, copperMat, waterMat, alarmMat);

  // 1. Base Plate
  const baseGeo = new THREE.BoxGeometry(10, 0.5, 4);
  disposables.push(baseGeo);
  const base = new THREE.Mesh(baseGeo, ironMat);
  base.position.y = -0.25;
  group.add(base);

  // 2. Electric Motor (Drive Unit)
  const motorGroup = new THREE.Group();
  motorGroup.position.set(-2.5, 0.8, 0);
  group.add(motorGroup);
  
  const motorBodyGeo = new THREE.CylinderGeometry(1.2, 1.2, 3, 32);
  motorBodyGeo.rotateZ(Math.PI / 2);
  const motorBody = new THREE.Mesh(motorBodyGeo, motorMat);
  motorGroup.add(motorBody);

  const coolingFinsGeo = new THREE.CylinderGeometry(1.3, 1.3, 2.5, 8, 1, true);
  coolingFinsGeo.rotateZ(Math.PI/2);
  const coolingFins = new THREE.Mesh(coolingFinsGeo, new THREE.MeshBasicMaterial({color: 0x1e3a8a, wireframe: true}));
  motorGroup.add(coolingFins);

  const rotorGeo = new THREE.CylinderGeometry(0.3, 0.3, 4, 16);
  rotorGeo.rotateZ(Math.PI/2);
  const rotor = new THREE.Mesh(rotorGeo, chromeMat);
  motorGroup.add(rotor);
  animatables.motorRotor = rotor;

  // 3. Multi-stage Centrifugal Pump
  const pumpGroup = new THREE.Group();
  pumpGroup.position.set(2.5, 0.8, 0);
  group.add(pumpGroup);
  
  // Pump Casing (Multi-stage sections)
  for(let i=0; i<5; i++) {
      const stageGeo = new THREE.CylinderGeometry(1.0, 1.0, 0.6, 32);
      stageGeo.rotateZ(Math.PI / 2);
      const stage = new THREE.Mesh(stageGeo, ironMat);
      stage.position.x = -1.2 + i * 0.6;
      pumpGroup.add(stage);
  }

  // Impeller Shaft Assembly
  const impGroup = new THREE.Group();
  pumpGroup.add(impGroup);
  animatables.pumpImpellers = impGroup;
  
  const impShaftGeo = new THREE.CylinderGeometry(0.2, 0.2, 4, 16);
  impShaftGeo.rotateZ(Math.PI / 2);
  const impShaft = new THREE.Mesh(impShaftGeo, chromeMat);
  impGroup.add(impShaft);

  // 4. Valves and Piping
  // Inlet (Bottom/Side)
  const pipeMat = new THREE.MeshStandardMaterial({ color: 0x475569 });
  const inletPipe = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 2), pipeMat);
  inletPipe.position.set(1, -0.5, 0);
  pumpGroup.add(inletPipe);

  const inletValve = new THREE.Group();
  inletValve.position.set(1, -1.2, 0);
  const vBody = new THREE.Mesh(new THREE.SphereGeometry(0.6), ironMat);
  inletValve.add(vBody);
  const wheel = new THREE.Mesh(new THREE.TorusGeometry(0.4, 0.05), ironMat);
  wheel.rotation.x = Math.PI/2;
  inletValve.add(wheel);
  pumpGroup.add(inletValve);
  animatables.inletValve = inletValve;

  // Outlet (Top)
  const outletPipe = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.4, 3), pipeMat);
  outletPipe.position.set(4, 1.5, 0);
  pumpGroup.add(outletPipe);

  // 5. Flow Particles
  const pCount = 300;
  const pGeo = new THREE.BufferGeometry();
  const pPos = new Float32Array(pCount * 3);
  for(let i=0; i<pCount; i++) {
      pPos[i*3] = (Math.random()-0.5) * 8;
      pPos[i*3+1] = 0.8;
      pPos[i*3+2] = (Math.random()-0.5) * 0.5;
  }
  pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
  const pMat = new THREE.PointsMaterial({ color: 0x38bdf8, size: 0.1, transparent: true, opacity: 0 });
  const flow = new THREE.Points(pGeo, pMat);
  group.add(flow);
  animatables.flowParticles = flow;

  // 6. Cavitation Effect (Bubbles)
  const bGeo = new THREE.BufferGeometry();
  const bPos = new Float32Array(100 * 3);
  bGeo.setAttribute('position', new THREE.BufferAttribute(bPos, 3));
  const bMat = new THREE.PointsMaterial({ color: 0xffffff, size: 0.15, transparent: true, opacity: 0 });
  const bubbles = new THREE.Points(bGeo, bMat);
  bubbles.position.set(2.5, 0.8, 0);
  group.add(bubbles);
  animatables.cavitationBubbles = bubbles;

  // 7. Heat Glow (PointLight)
  const heatLight = new THREE.PointLight(0xef4444, 0, 5);
  heatLight.position.set(0.5, 1, 0); // At the coupling/bearing
  group.add(heatLight);
  animatables.heatGlow = heatLight;
  
  const vibRing = new THREE.Mesh(new THREE.TorusGeometry(1.5, 0.02), alarmMat);
  vibRing.rotation.y = Math.PI/2;
  vibRing.position.set(0.5, 0.8, 0);
  vibRing.visible = false;
  group.add(vibRing);
  animatables.vibrationRing = vibRing;
};

export const animatePumpStation = (
  animatables: PumpAnimatables, 
  state: PumpSimState,
  time: number
) => {
  const isRunning = state === 'STANDBY' || state === 'CAVITATION' || state === 'BEARING_FAULT' || state === 'RECOVERY';
  const rotationSpeed = isRunning ? (state === 'CAVITATION' ? 0.3 : 0.5) : 0;

  if (animatables.motorRotor) animatables.motorRotor.rotation.x -= rotationSpeed;
  if (animatables.pumpImpellers) animatables.pumpImpellers.rotation.x -= rotationSpeed;

  // Flow Animation
  if (animatables.flowParticles) {
      const mat = animatables.flowParticles.material as THREE.PointsMaterial;
      if (isRunning && state !== 'RECOVERY') {
          mat.opacity = 0.6;
          const pos = animatables.flowParticles.geometry.attributes.position.array as Float32Array;
          for(let i=0; i<pos.length/3; i++) {
              pos[i*3] += 0.2;
              if (pos[i*3] > 6) {
                  pos[i*3] = -2;
                  pos[i*3+1] = 0.8 + (Math.random()-0.5)*0.4;
                  pos[i*3+2] = (Math.random()-0.5)*0.4;
              }
          }
          animatables.flowParticles.geometry.attributes.position.needsUpdate = true;
      } else {
          mat.opacity = THREE.MathUtils.lerp(mat.opacity, 0, 0.1);
      }
  }

  // Fault Effects
  if (state === 'CAVITATION' && animatables.cavitationBubbles) {
      const mat = animatables.cavitationBubbles.material as THREE.PointsMaterial;
      mat.opacity = 0.8;
      const pos = animatables.cavitationBubbles.geometry.attributes.position.array as Float32Array;
      for(let i=0; i<pos.length; i+=3) {
          pos[i] += (Math.random()-0.5)*0.1;
          pos[i+1] += (Math.random()-0.5)*0.1;
          pos[i+2] += (Math.random()-0.5)*0.1;
          if (Math.abs(pos[i]) > 1) pos[i]=0;
      }
      animatables.cavitationBubbles.geometry.attributes.position.needsUpdate = true;
  } else if (animatables.cavitationBubbles) {
      (animatables.cavitationBubbles.material as THREE.PointsMaterial).opacity = 0;
  }

  if (state === 'BEARING_FAULT') {
      if (animatables.heatGlow) animatables.heatGlow.intensity = 2 + Math.sin(time*10);
      if (animatables.vibrationRing) {
          animatables.vibrationRing.visible = true;
          animatables.vibrationRing.scale.setScalar(1 + Math.sin(time*20)*0.1);
      }
  } else {
      if (animatables.heatGlow) animatables.heatGlow.intensity = 0;
      if (animatables.vibrationRing) animatables.vibrationRing.visible = false;
  }

  // Disassembly Animation
  if (state === 'DISASSEMBLY') {
      if (animatables.pumpImpellers) {
          animatables.pumpImpellers.position.y = THREE.MathUtils.lerp(animatables.pumpImpellers.position.y, 2.5, 0.05);
          animatables.pumpImpellers.rotation.y += 0.01;
      }
  } else if (state === 'REPLACEMENT') {
      if (animatables.pumpImpellers) {
        animatables.pumpImpellers.position.y = 2.5;
        // Fade in/out effect for "swapping"
        (animatables.pumpImpellers.children[0] as THREE.Mesh).material.opacity = 0.5 + Math.sin(time*5)*0.5;
        (animatables.pumpImpellers.children[0] as THREE.Mesh).material.transparent = true;
      }
  } else {
      if (animatables.pumpImpellers) {
          animatables.pumpImpellers.position.y = THREE.MathUtils.lerp(animatables.pumpImpellers.position.y, 0, 0.1);
          animatables.pumpImpellers.rotation.y = 0;
      }
  }
};
