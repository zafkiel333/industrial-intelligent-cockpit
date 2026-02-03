
import * as THREE from 'three';
import { MarineAnimatables, MaintenanceStep } from './three-types';

export const initMarineEngineScene = (
  group: THREE.Group, 
  animatables: MarineAnimatables,
  disposables: { dispose: () => void }[]
) => {
  // --- Materials ---
  const castIronMat = new THREE.MeshStandardMaterial({ 
    color: 0x334155, roughness: 0.7, metalness: 0.5 
  }); // Dark Grey Engine Body
  const steelMat = new THREE.MeshStandardMaterial({ 
    color: 0x94a3b8, roughness: 0.3, metalness: 0.8 
  }); // Bright Steel
  const paintMat = new THREE.MeshStandardMaterial({ 
    color: 0x1e3a8a, roughness: 0.5, metalness: 0.2 
  }); // Marine Blue Paint
  const safetyMat = new THREE.MeshStandardMaterial({ 
    color: 0xfacc15, roughness: 0.4, emissive: 0x854d0e, emissiveIntensity: 0.2 
  }); // Yellow Crane/Safety
  const chromeMat = new THREE.MeshStandardMaterial({ 
    color: 0xffffff, roughness: 0.1, metalness: 1.0 
  }); // Piston Rod
  const boltMat = new THREE.MeshStandardMaterial({ 
    color: 0x475569, roughness: 0.6 
  });

  disposables.push(castIronMat, steelMat, paintMat, safetyMat, chromeMat, boltMat);

  // 1. Engine Block (The Gallery Floor Level)
  const blockGeo = new THREE.BoxGeometry(12, 4, 8);
  blockGeo.translate(0, -2, 0);
  disposables.push(blockGeo);
  const engineBlock = new THREE.Mesh(blockGeo, paintMat);
  group.add(engineBlock);

  // Walkway / Gallery
  const walkwayGeo = new THREE.BoxGeometry(14, 0.2, 4);
  walkwayGeo.translate(0, 0.1, 4);
  disposables.push(walkwayGeo);
  const walkway = new THREE.Mesh(walkwayGeo, steelMat);
  group.add(walkway);

  // Railings
  const railGeo = new THREE.CylinderGeometry(0.05, 0.05, 14);
  railGeo.rotateZ(Math.PI/2);
  railGeo.translate(0, 1.2, 6);
  disposables.push(railGeo);
  const rail = new THREE.Mesh(railGeo, safetyMat);
  group.add(rail);

  // 2. Cylinder Units (Static Neighbors)
  const cylGeo = new THREE.CylinderGeometry(1.5, 1.6, 2, 32);
  cylGeo.translate(0, 1, 0);
  disposables.push(cylGeo);
  
  [-3.5, 3.5].forEach(x => {
      const cyl = new THREE.Mesh(cylGeo, castIronMat);
      cyl.position.set(x, 0, 0);
      group.add(cyl);
      // Dummy Heads
      const head = new THREE.Mesh(new THREE.CylinderGeometry(1.4, 1.4, 0.8, 16), steelMat);
      head.position.set(x, 2, 0);
      group.add(head);
  });

  // 3. The Target Cylinder Unit (Center)
  const targetCylBase = new THREE.Mesh(cylGeo, castIronMat);
  targetCylBase.position.set(0, 0, 0);
  group.add(targetCylBase);

  // 4. Cylinder Head (Removable)
  const headGroup = new THREE.Group();
  headGroup.position.set(0, 2, 0);
  group.add(headGroup);
  animatables.cylinderHead = headGroup;

  const headMainGeo = new THREE.CylinderGeometry(1.4, 1.4, 0.8, 32);
  disposables.push(headMainGeo);
  const headMain = new THREE.Mesh(headMainGeo, steelMat);
  headGroup.add(headMain);

  // Exhaust Valve Housing
  const valveGeo = new THREE.CylinderGeometry(0.6, 0.8, 1.5, 16);
  valveGeo.translate(0, 1, 0);
  disposables.push(valveGeo);
  const valve = new THREE.Mesh(valveGeo, castIronMat);
  headGroup.add(valve);

  // 5. Bolts (Studs & Nuts)
  const boltGroup = new THREE.Group();
  headGroup.add(boltGroup);
  animatables.bolts = boltGroup;

  const studGeo = new THREE.CylinderGeometry(0.1, 0.1, 1.2);
  const nutGeo = new THREE.CylinderGeometry(0.15, 0.15, 0.2, 6);
  disposables.push(studGeo, nutGeo);

  for(let i=0; i<8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const r = 1.2;
      const stud = new THREE.Mesh(studGeo, boltMat);
      stud.position.set(Math.cos(angle)*r, 0.2, Math.sin(angle)*r);
      
      const nut = new THREE.Mesh(nutGeo, steelMat);
      nut.position.y = 0.5;
      stud.add(nut);
      
      boltGroup.add(stud);
  }

  // 6. Hydraulic Jacks (Appear during maintenance)
  const jackGroup = new THREE.Group();
  headGroup.add(jackGroup);
  animatables.hydraulicJacks = jackGroup;
  jackGroup.visible = false;

  const jackGeo = new THREE.CylinderGeometry(0.2, 0.2, 0.6, 16);
  disposables.push(jackGeo);
  
  for(let i=0; i<8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const r = 1.2;
      const jack = new THREE.Mesh(jackGeo, safetyMat); // Yellow jacks
      jack.position.set(Math.cos(angle)*r, 0.8, Math.sin(angle)*r);
      jackGroup.add(jack);
  }

  // 7. Piston Assembly (Inside)
  const pistonGroup = new THREE.Group();
  group.add(pistonGroup);
  animatables.pistonGroup = pistonGroup;

  // Piston Crown
  const crownGeo = new THREE.CylinderGeometry(1.1, 1.1, 0.8, 32);
  disposables.push(crownGeo);
  const crown = new THREE.Mesh(crownGeo, chromeMat); // Shiny crown
  crown.position.y = 0.5; // Inside cylinder initially
  pistonGroup.add(crown);

  // Piston Rings (Texture/Stripes)
  const ringGeo = new THREE.TorusGeometry(1.11, 0.02, 4, 32);
  ringGeo.rotateX(Math.PI/2);
  disposables.push(ringGeo);
  for(let i=0; i<4; i++) {
      const ring = new THREE.Mesh(ringGeo, castIronMat);
      ring.position.y = 0.8 - i * 0.1;
      pistonGroup.add(ring);
  }

  // Piston Rod
  const rodGeo = new THREE.CylinderGeometry(0.4, 0.4, 6, 32);
  rodGeo.translate(0, -3, 0);
  disposables.push(rodGeo);
  const rod = new THREE.Mesh(rodGeo, chromeMat);
  pistonGroup.add(rod);

  // 8. Overhead Crane Hook
  const craneGroup = new THREE.Group();
  craneGroup.position.set(0, 8, 0);
  group.add(craneGroup);
  animatables.craneHook = craneGroup;

  const hookBlockGeo = new THREE.BoxGeometry(1, 1.5, 0.5);
  disposables.push(hookBlockGeo);
  const hookBlock = new THREE.Mesh(hookBlockGeo, safetyMat);
  craneGroup.add(hookBlock);
  
  const cableGeo = new THREE.CylinderGeometry(0.05, 0.05, 10);
  cableGeo.translate(0, 5, 0);
  disposables.push(cableGeo);
  const cable = new THREE.Mesh(cableGeo, new THREE.MeshBasicMaterial({color: 0x111111}));
  craneGroup.add(cable);
};

export const animateMarineEngineScene = (
  animatables: MarineAnimatables, 
  step: MaintenanceStep,
  time: number
) => {
  const baseHeadY = 2;
  // Reset positions based on step logic
  if (step === 'PREP') {
    if (animatables.cylinderHead) animatables.cylinderHead.position.y = baseHeadY;
    if (animatables.pistonGroup) animatables.pistonGroup.position.y = 0;
    if (animatables.craneHook) animatables.craneHook.position.y = 10;
    if (animatables.hydraulicJacks) animatables.hydraulicJacks.visible = false;
    if (animatables.bolts) animatables.bolts.visible = true;
  }
  else if (step === 'MOUNT_JACKS') {
    if (animatables.hydraulicJacks) animatables.hydraulicJacks.visible = true;
    if (animatables.craneHook) animatables.craneHook.position.y = 10;
  }
  else if (step === 'LOOSEN_BOLTS') {
    if (animatables.hydraulicJacks) animatables.hydraulicJacks.visible = true;
    // Animate nuts rising slightly
    if (animatables.bolts) {
       animatables.bolts.children.forEach(stud => {
           if(stud.children.length > 0) {
               stud.children[0].position.y = 0.5 + Math.sin(time * 5) * 0.05; // Wiggle
           }
       });
    }
  }
  else if (step === 'LIFT_HEAD') {
    if (animatables.hydraulicJacks) animatables.hydraulicJacks.visible = false;
    if (animatables.bolts) animatables.bolts.visible = false; // Bolts removed

    const t = (Math.sin(time * 0.5) + 1) / 2;
    if (animatables.craneHook) animatables.craneHook.position.y = baseHeadY + 2 + t * 4;
    if (animatables.cylinderHead) animatables.cylinderHead.position.y = baseHeadY + t * 4;
  }
  else if (step === 'LIFT_PISTON') {
    if (animatables.cylinderHead) animatables.cylinderHead.position.y = 20; // Out of view
    
    const t = (Math.sin(time * 0.5) + 1) / 2;
    if (animatables.craneHook) animatables.craneHook.position.y = 4 + t * 6;
    if (animatables.pistonGroup) {
        animatables.pistonGroup.position.y = t * 6;
        // Swing slightly
        animatables.pistonGroup.rotation.z = Math.sin(time) * 0.05;
    }
  }
  else if (step === 'MEASURE' || step === 'FINISH') {
      // Components reset or out of way depending on specific sub-step visuals
      if (animatables.pistonGroup) animatables.pistonGroup.position.y = 6; // Suspended
  }
};
