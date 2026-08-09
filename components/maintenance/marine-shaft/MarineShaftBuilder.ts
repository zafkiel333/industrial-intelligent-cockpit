
import * as THREE from 'three';
import { ShaftAnimatables, ShaftMaintenancePhase } from './three-types';

export const initMarineShaftScene = (
  group: THREE.Group, 
  animatables: ShaftAnimatables,
  disposables: { dispose: () => void }[]
) => {
  // --- Materials ---
  const steelMat = new THREE.MeshStandardMaterial({ 
    color: 0xcbd5e1, roughness: 0.2, metalness: 0.8 
  }); // Bright Steel Shaft
  const housingMat = new THREE.MeshStandardMaterial({ 
    color: 0x334155, roughness: 0.7, metalness: 0.4 
  }); // Dark Grey Housing
  const bronzeMat = new THREE.MeshStandardMaterial({ 
    color: 0xd97706, roughness: 0.4, metalness: 0.9 
  }); // Propeller Bronze
  const laserMat = new THREE.MeshBasicMaterial({ 
    color: 0xef4444, transparent: true, opacity: 0.8 
  });
  const oilMat = new THREE.MeshPhysicalMaterial({ 
    color: 0xfacc15, transmission: 0.5, opacity: 0.4, transparent: true, roughness: 0.1 
  });
  const floorMat = new THREE.MeshStandardMaterial({ 
    color: 0x0f172a, roughness: 0.8 
  });

  disposables.push(steelMat, housingMat, bronzeMat, laserMat, oilMat, floorMat);

  // 1. Hull/Floor Context
  const floorGeo = new THREE.PlaneGeometry(30, 10);
  floorGeo.rotateX(-Math.PI / 2);
  floorGeo.translate(0, -2, 0);
  disposables.push(floorGeo);
  const floor = new THREE.Mesh(floorGeo, floorMat);
  group.add(floor);

  // 2. Shaft Line (Main Axis Z)
  const shaftGroup = new THREE.Group();
  group.add(shaftGroup);

  // Propeller (At Z = -10)
  const propGroup = new THREE.Group();
  propGroup.position.z = -10;
  shaftGroup.add(propGroup);
  
  const hubGeo = new THREE.ConeGeometry(0.8, 2, 16);
  hubGeo.rotateX(-Math.PI / 2);
  disposables.push(hubGeo);
  const hub = new THREE.Mesh(hubGeo, bronzeMat);
  propGroup.add(hub);

  // Blades
  const bladeGeo = new THREE.BoxGeometry(1.5, 0.1, 4);
  // Deform geometry slightly for twist (simplified)
  const positions = bladeGeo.attributes.position;
  for(let i=0; i<positions.count; i++){
      const x = positions.getX(i);
      const z = positions.getZ(i);
      // Twist effect
      positions.setY(i, positions.getY(i) + x * z * 0.1); 
  }
  bladeGeo.computeVertexNormals();
  disposables.push(bladeGeo);

  for(let i=0; i<5; i++) {
      const blade = new THREE.Mesh(bladeGeo, bronzeMat);
      const angle = (i / 5) * Math.PI * 2;
      blade.rotation.z = angle;
      blade.rotateX(0.5); // Pitch
      blade.translateY(2);
      propGroup.add(blade);
  }
  animatables.propeller = propGroup as unknown as THREE.Mesh; // Cast for simplicity in animation loop

  // Main Shaft
  // Segments: Tail shaft, Intermediate shaft
  const shaftLen = 18;
  const shaftRadius = 0.4;
  const shaftGeo = new THREE.CylinderGeometry(shaftRadius, shaftRadius, shaftLen, 32);
  shaftGeo.rotateX(-Math.PI / 2);
  shaftGeo.translate(0, 0, -1); // Centered roughly
  disposables.push(shaftGeo);
  const shaft = new THREE.Mesh(shaftGeo, steelMat);
  shaftGroup.add(shaft);
  animatables.shaft = shaft;

  // Flywheel / Flange (Engine Connection) at Z = 8
  const flyGeo = new THREE.CylinderGeometry(1.5, 1.5, 0.5, 32);
  flyGeo.rotateX(-Math.PI / 2);
  flyGeo.translate(0, 0, 8);
  disposables.push(flyGeo);
  const flywheel = new THREE.Mesh(flyGeo, steelMat);
  shaftGroup.add(flywheel);
  animatables.flywheel = flywheel;

  // Coupling Flanges (Mid-shaft)
  const coupGeo = new THREE.CylinderGeometry(0.8, 0.8, 0.3, 32);
  coupGeo.rotateX(-Math.PI / 2);
  disposables.push(coupGeo);
  const coup1 = new THREE.Mesh(coupGeo, steelMat);
  coup1.position.z = 0;
  shaftGroup.add(coup1);
  const coup2 = new THREE.Mesh(coupGeo, steelMat);
  coup2.position.z = 0.4;
  shaftGroup.add(coup2);

  // 3. Bearings (Stationary)
  // Stern Tube (Aft)
  const stGeo = new THREE.CylinderGeometry(0.6, 0.6, 3, 16);
  stGeo.rotateX(-Math.PI / 2);
  disposables.push(stGeo);
  
  const sternTube = new THREE.Group();
  const stMesh = new THREE.Mesh(stGeo, housingMat);
  sternTube.add(stMesh);
  sternTube.position.set(0, 0, -8);
  group.add(sternTube);
  animatables.bearingAft = sternTube;

  // Intermediate Bearing
  const ibGeo = new THREE.BoxGeometry(1.5, 1.5, 1);
  disposables.push(ibGeo);
  const interBearing = new THREE.Group();
  const ibMesh = new THREE.Mesh(ibGeo, housingMat);
  ibMesh.position.y = -0.4; // Below shaft center
  interBearing.add(ibMesh);
  // Cap
  const ibCapGeo = new THREE.CylinderGeometry(0.75, 0.75, 1, 16, 1, false, 0, Math.PI);
  ibCapGeo.rotateZ(Math.PI / 2);
  ibCapGeo.rotateX(-Math.PI / 2); // Align with shaft
  disposables.push(ibCapGeo);
  const ibCap = new THREE.Mesh(ibCapGeo, housingMat);
  ibCap.position.y = 0.35;
  interBearing.add(ibCap);
  
  interBearing.position.set(0, 0, 4);
  group.add(interBearing);
  animatables.bearingInter = interBearing;

  // 4. Laser Alignment Tool (Hidden initially)
  const laserGroup = new THREE.Group();
  
  // Emitter Unit
  const unitGeo = new THREE.BoxGeometry(0.4, 0.6, 0.3);
  disposables.push(unitGeo);
  const laserMatUnit = new THREE.MeshStandardMaterial({color: 0x10b981});
  disposables.push(laserMatUnit);
  
  const emitter = new THREE.Mesh(unitGeo, laserMatUnit);
  // Mounted on flywheel
  const emitterGroup = new THREE.Group();
  emitterGroup.add(emitter);
  emitter.position.y = 1.2; // Offset from shaft center
  emitterGroup.position.z = 8;
  laserGroup.add(emitterGroup);
  animatables.laserUnitEmitter = emitterGroup;

  // Receiver Unit (Mounted on intermediate coupling)
  const receiver = new THREE.Mesh(unitGeo, laserMatUnit);
  const receiverGroup = new THREE.Group();
  receiverGroup.add(receiver);
  receiver.position.y = 1.2;
  receiverGroup.position.z = 0.4; // On coupling
  laserGroup.add(receiverGroup);
  animatables.laserUnitReceiver = receiverGroup;

  // Laser Beam
  const beamGeo = new THREE.CylinderGeometry(0.02, 0.02, 7.6);
  beamGeo.rotateX(-Math.PI / 2);
  beamGeo.translate(0, 1.2, 4.2); // Midpoint
  disposables.push(beamGeo);
  const beam = new THREE.Mesh(beamGeo, laserMat);
  laserGroup.add(beam);
  animatables.laserBeam = beam;

  laserGroup.visible = false;
  group.add(laserGroup);
};

export const animateMarineShaftScene = (
  animatables: ShaftAnimatables, 
  phase: ShaftMaintenancePhase,
  time: number
) => {
  const isRunning = phase === 'RUNNING' || phase === 'FAULT_VIB';
  const isAligning = phase === 'ALIGNMENT' || phase === 'REPAIR' || phase === 'DIAGNOSIS';

  // Rotation
  if (isRunning || phase === 'TEST_RUN') {
      const speed = phase === 'TEST_RUN' ? 0.2 : 0.5;
      if (animatables.propeller) animatables.propeller.rotation.z += speed;
      if (animatables.shaft) animatables.shaft.rotation.z += speed;
      if (animatables.flywheel) animatables.flywheel.rotation.z += speed;
      
      // Vibration Effect
      if (phase === 'FAULT_VIB' && animatables.shaft) {
          animatables.shaft.position.y = Math.sin(time * 50) * 0.05;
          animatables.shaft.position.x = Math.cos(time * 40) * 0.05;
      } else if (animatables.shaft) {
          animatables.shaft.position.set(0,0,0);
      }
  }

  // Laser Tool Visibility
  if (animatables.laserUnitEmitter) {
      animatables.laserUnitEmitter.parent!.visible = isAligning;
  }

  // Alignment Animation
  if (phase === 'ALIGNMENT') {
      // Simulate rotating shaft manually for measurements (0, 90, 180, 270)
      // Cycle every 4 seconds
      const cycle = (time % 4) / 4; 
      const angle = Math.floor(cycle * 4) * (Math.PI / 2);
      
      if (animatables.laserUnitEmitter) animatables.laserUnitEmitter.rotation.z = angle;
      if (animatables.laserUnitReceiver) animatables.laserUnitReceiver.rotation.z = angle;
      if (animatables.laserBeam) {
          // Beam moves with units
          animatables.laserBeam.position.y = Math.sin(angle) * 0.0; // Pivot is center, beam orbits
          animatables.laserBeam.rotation.z = angle;
      }
      
      // Visualize misalignment offset
      if (animatables.shaft) {
          animatables.shaft.position.y = -0.2; // Sagging
      }
  }
  
  // Repair/Jack-up
  if (phase === 'REPAIR') {
      // Shaft jacked up
      if (animatables.shaft) animatables.shaft.position.y = 0.5;
      if (animatables.propeller) animatables.propeller.position.y = 0.5;
      if (animatables.flywheel) animatables.flywheel.position.y = 0.5;
  }
};
