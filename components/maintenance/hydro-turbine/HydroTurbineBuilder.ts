
import * as THREE from 'three';
import { HydroAnimatables, HydroSimulationStep } from './three-types';

export const initHydroTurbineScene = (
  group: THREE.Group, 
  animatables: HydroAnimatables,
  disposables: { dispose: () => void }[]
) => {
  // --- Materials ---
  const steelMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.4, metalness: 0.6 });
  const rotorMat = new THREE.MeshStandardMaterial({ color: 0xb91c1c, roughness: 0.5, metalness: 0.3 }); // Red Rotor
  const copperMat = new THREE.MeshStandardMaterial({ color: 0xb45309, roughness: 0.3, metalness: 0.8 }); // Copper windings
  const yellowMat = new THREE.MeshStandardMaterial({ color: 0xfacc15, roughness: 0.5 }); // Safety/Crane
  const concreteMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.9 });
  const boltMat = new THREE.MeshStandardMaterial({ color: 0xffffff, metalness: 0.8 });

  disposables.push(steelMat, rotorMat, copperMat, yellowMat, concreteMat, boltMat);

  // 1. Pit / Foundation
  const pitGeo = new THREE.CylinderGeometry(6, 6, 2, 32, 1, true);
  pitGeo.translate(0, 1, 0);
  disposables.push(pitGeo);
  const pit = new THREE.Mesh(pitGeo, concreteMat);
  // Create a floor
  const floorGeo = new THREE.PlaneGeometry(20, 20);
  floorGeo.rotateX(-Math.PI/2);
  disposables.push(floorGeo);
  const floor = new THREE.Mesh(floorGeo, concreteMat);
  group.add(pit);
  group.add(floor);

  // 2. Stator (Fixed)
  const statorGroup = new THREE.Group();
  const statorGeo = new THREE.CylinderGeometry(5, 5, 3, 32, 1, true);
  statorGeo.translate(0, 1.5, 0);
  disposables.push(statorGeo);
  const statorFrame = new THREE.Mesh(statorGeo, steelMat);
  // Coils
  const coilGeo = new THREE.TorusGeometry(4.8, 0.2, 16, 64);
  coilGeo.rotateX(Math.PI/2);
  coilGeo.translate(0, 3, 0); // Top of stator
  disposables.push(coilGeo);
  const coilTop = new THREE.Mesh(coilGeo, copperMat);
  const coilBot = new THREE.Mesh(coilGeo, copperMat);
  coilBot.position.y = -3;
  
  statorGroup.add(statorFrame);
  statorGroup.add(coilTop);
  statorGroup.add(coilBot);
  group.add(statorGroup);
  animatables.statorGroup = statorGroup;

  // 3. Rotor (Movable)
  const rotorGroup = new THREE.Group();
  const rotorBodyGeo = new THREE.CylinderGeometry(4, 4, 2.8, 32);
  rotorBodyGeo.translate(0, 1.5, 0);
  disposables.push(rotorBodyGeo);
  const rotorBody = new THREE.Mesh(rotorBodyGeo, rotorMat);
  
  // Rotor Poles
  const poleGeo = new THREE.BoxGeometry(0.5, 2.8, 0.8);
  disposables.push(poleGeo);
  for(let i=0; i<12; i++) {
      const pole = new THREE.Mesh(poleGeo, steelMat);
      const angle = (i / 12) * Math.PI * 2;
      pole.position.set(Math.cos(angle)*4.2, 1.5, Math.sin(angle)*4.2);
      pole.rotation.y = -angle;
      rotorGroup.add(pole);
  }
  
  // Main Shaft
  const shaftGeo = new THREE.CylinderGeometry(0.8, 0.8, 6, 32);
  shaftGeo.translate(0, 1, 0); // Center somewhat
  disposables.push(shaftGeo);
  const shaft = new THREE.Mesh(shaftGeo, steelMat);
  
  rotorGroup.add(rotorBody);
  rotorGroup.add(shaft);
  group.add(rotorGroup);
  animatables.rotorGroup = rotorGroup;

  // 4. Upper Bracket (Movable)
  const bracketGroup = new THREE.Group();
  // Central Hub
  const hubGeo = new THREE.CylinderGeometry(1.5, 1.5, 1, 16);
  hubGeo.translate(0, 4.5, 0); // Sit on top of stator level roughly
  disposables.push(hubGeo);
  const hub = new THREE.Mesh(hubGeo, steelMat);
  bracketGroup.add(hub);
  // Arms
  const armGeo = new THREE.BoxGeometry(10, 0.8, 0.8);
  armGeo.translate(0, 4.5, 0);
  disposables.push(armGeo);
  const arm1 = new THREE.Mesh(armGeo, steelMat);
  const arm2 = new THREE.Mesh(armGeo, steelMat);
  arm2.rotation.y = Math.PI / 2;
  bracketGroup.add(arm1);
  bracketGroup.add(arm2);
  
  // Bolts (Detail)
  const boltGroup = new THREE.Group();
  const boltGeo = new THREE.CylinderGeometry(0.1, 0.1, 0.5);
  boltGeo.translate(0, 5, 0);
  disposables.push(boltGeo);
  
  // Using explicit array and loop to be safe from ASI
  const boltPositions = [4.5, -4.5];
  for (const x of boltPositions) {
      const b1 = new THREE.Mesh(boltGeo, boltMat); 
      b1.position.x = x; 
      boltGroup.add(b1);
      
      const b2 = new THREE.Mesh(boltGeo, boltMat); 
      b2.position.z = x; 
      boltGroup.add(b2);
  }
  bracketGroup.add(boltGroup);
  animatables.bolts = boltGroup;

  group.add(bracketGroup);
  animatables.upperBracket = bracketGroup;

  // 5. Overhead Crane Hook (Movable)
  const craneGroup = new THREE.Group();
  craneGroup.position.set(0, 10, 0); // High up
  const hookGeo = new THREE.BoxGeometry(1, 1, 1);
  disposables.push(hookGeo);
  const hookBlock = new THREE.Mesh(hookGeo, yellowMat);
  const cableGeo = new THREE.CylinderGeometry(0.05, 0.05, 10);
  cableGeo.translate(0, 5, 0);
  disposables.push(cableGeo);
  const cable = new THREE.Mesh(cableGeo, new THREE.MeshBasicMaterial({color: 0x333333}));
  
  craneGroup.add(hookBlock);
  craneGroup.add(cable);
  group.add(craneGroup);
  animatables.craneHook = craneGroup;
};

export const animateHydroScene = (
  animatables: HydroAnimatables, 
  step: HydroSimulationStep,
  time: number
) => {
  // Base positions
  const baseRotorY = 0;
  const baseBracketY = 0;
  const craneIdleY = 12;

  // Animation Logic based on Step
  if (step === 'IDLE') {
      if(animatables.craneHook) animatables.craneHook.position.y = craneIdleY;
      if(animatables.upperBracket) animatables.upperBracket.position.y = baseBracketY;
      if(animatables.rotorGroup) animatables.rotorGroup.position.y = baseRotorY;
      if(animatables.bolts) animatables.bolts.visible = true;
  }
  else if (step === 'LOOSEN_BOLTS') {
      // Simulate bolts unscrewing
      if(animatables.bolts) {
          animatables.bolts.visible = true;
          animatables.bolts.position.y = Math.sin(time * 10) * 0.2 + 0.2; // Wiggle
      }
  }
  else if (step === 'LIFT_BRACKET') {
      if(animatables.bolts) animatables.bolts.visible = false;
      
      // Crane comes down, grabs bracket, lifts
      // Mock animation progress: 0 -> grab -> lift
      const liftHeight = 6;
      // Simple loop for demo: up and down smoothly
      const t = (Math.sin(time) + 1) / 2; // 0 to 1
      
      if(animatables.craneHook) animatables.craneHook.position.y = 5 + (1-t) * 2; // Hover above bracket
      if(animatables.upperBracket) animatables.upperBracket.position.y = baseBracketY + t * liftHeight;
  }
  else if (step === 'LIFT_ROTOR') {
      if(animatables.upperBracket) animatables.upperBracket.position.y = 100; // Move out of view or high up
      
      const liftHeight = 8;
      const t = (Math.sin(time * 0.5) + 1) / 2;
      
      if(animatables.craneHook) animatables.craneHook.position.y = 5 + t * liftHeight; // Attached to shaft top
      if(animatables.rotorGroup) {
          animatables.rotorGroup.position.y = baseRotorY + t * liftHeight;
          animatables.rotorGroup.rotation.y += 0.005; // Slow spin while lifting
      }
  }
  else if (step === 'INSPECT') {
      // Rotor removed
      if(animatables.rotorGroup) animatables.rotorGroup.position.y = 100;
      if(animatables.upperBracket) animatables.upperBracket.position.y = 100;
      
      // Camera or light focus on Stator (Handled by camera in main file, here maybe pulse stator)
      if(animatables.statorGroup) {
          // animatables.statorGroup.rotation.y = time * 0.1; // Inspect mode
      }
  }
};
