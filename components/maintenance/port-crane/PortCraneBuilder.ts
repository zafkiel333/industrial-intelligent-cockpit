
import * as THREE from 'three';
import { CraneAnimatables, CraneMaintenanceState } from './three-types';

export const initPortCraneScene = (
  group: THREE.Group, 
  animatables: CraneAnimatables,
  disposables: { dispose: () => void }[]
) => {
  // --- Materials ---
  const paintMat = new THREE.MeshStandardMaterial({ 
    color: 0xf97316, // Safety Orange
    roughness: 0.6, 
    metalness: 0.3 
  });
  const steelMat = new THREE.MeshStandardMaterial({ 
    color: 0x334155, roughness: 0.4, metalness: 0.7 
  });
  const cableMat = new THREE.LineBasicMaterial({ color: 0x111111 });
  const containerMat = new THREE.MeshStandardMaterial({ color: 0x3b82f6 }); // Blue Container
  const concreteMat = new THREE.MeshStandardMaterial({ color: 0x64748b, roughness: 0.9 });
  const laserMat = new THREE.MeshBasicMaterial({ color: 0x22d3ee, transparent: true, opacity: 0.5, side: THREE.DoubleSide });
  
  disposables.push(paintMat, steelMat, cableMat, containerMat, concreteMat, laserMat);

  // 1. Environment (Quay)
  const quayGeo = new THREE.BoxGeometry(40, 2, 20);
  quayGeo.translate(0, -1, 0);
  disposables.push(quayGeo);
  const quay = new THREE.Mesh(quayGeo, concreteMat);
  group.add(quay);

  // 2. Gantry Structure (Simplified STS)
  const gantryGroup = new THREE.Group();
  group.add(gantryGroup);
  animatables.gantryGroup = gantryGroup;

  // Legs (Portal)
  const legGeo = new THREE.BoxGeometry(1.5, 18, 1.5);
  disposables.push(legGeo);

  // Sea-side legs
  const legFL = new THREE.Mesh(legGeo, paintMat); legFL.position.set(-8, 9, 6); gantryGroup.add(legFL);
  const legFR = new THREE.Mesh(legGeo, paintMat); legFR.position.set(8, 9, 6); gantryGroup.add(legFR);
  // Land-side legs
  const legBL = new THREE.Mesh(legGeo, paintMat); legBL.position.set(-8, 9, -6); gantryGroup.add(legBL);
  const legBR = new THREE.Mesh(legGeo, paintMat); legBR.position.set(8, 9, -6); gantryGroup.add(legBR);

  // Portal Beams
  const beamXGeo = new THREE.BoxGeometry(18, 1.5, 1.5);
  const beamZGeo = new THREE.BoxGeometry(1.5, 1.5, 14);
  disposables.push(beamXGeo, beamZGeo);
  
  const portalTopL = new THREE.Mesh(beamZGeo, paintMat); portalTopL.position.set(-8, 17, 0); gantryGroup.add(portalTopL);
  const portalTopR = new THREE.Mesh(beamZGeo, paintMat); portalTopR.position.set(8, 17, 0); gantryGroup.add(portalTopR);
  
  // Main Boom (Outreach)
  const boomGeo = new THREE.BoxGeometry(35, 1.5, 2); // Long boom
  disposables.push(boomGeo);
  const boom = new THREE.Mesh(boomGeo, paintMat);
  boom.position.set(5, 18, 0); // Extending to +X (Water side)
  gantryGroup.add(boom);

  // Backreach (Machine Room)
  const backReachGeo = new THREE.BoxGeometry(12, 1.5, 2);
  disposables.push(backReachGeo);
  const backReach = new THREE.Mesh(backReachGeo, paintMat);
  backReach.position.set(-14, 18, 0);
  gantryGroup.add(backReach);

  // Machinery House (On Backreach)
  const houseGeo = new THREE.BoxGeometry(6, 4, 5);
  disposables.push(houseGeo);
  const house = new THREE.Mesh(houseGeo, paintMat);
  house.position.set(-14, 21, 0);
  gantryGroup.add(house);

  // 3. Machinery Components (Inside/Near House) - The focus of maintenance
  const motorGeo = new THREE.CylinderGeometry(0.8, 0.8, 1.5, 16);
  motorGeo.rotateZ(Math.PI/2);
  disposables.push(motorGeo);
  const motor = new THREE.Mesh(motorGeo, new THREE.MeshStandardMaterial({color: 0x333333}));
  motor.position.set(-12, 21, 2);
  gantryGroup.add(motor);
  animatables.hoistMotor = motor;

  const gearboxGeo = new THREE.BoxGeometry(1.5, 1.5, 1.5);
  disposables.push(gearboxGeo);
  const gearbox = new THREE.Mesh(gearboxGeo, new THREE.MeshStandardMaterial({color: 0x555555}));
  gearbox.position.set(-13.5, 21, 2);
  gantryGroup.add(gearbox);
  animatables.gearbox = gearbox;

  // 4. Trolley
  const trolleyGroup = new THREE.Group();
  trolleyGroup.position.set(-5, 17, 0); // Initial pos
  gantryGroup.add(trolleyGroup);
  animatables.trolley = trolleyGroup;

  const trolleyGeo = new THREE.BoxGeometry(2, 1, 2.5);
  disposables.push(trolleyGeo);
  const trolleyMesh = new THREE.Mesh(trolleyGeo, steelMat);
  trolleyGroup.add(trolleyMesh);

  // Cab
  const cabGeo = new THREE.BoxGeometry(1.2, 1.5, 1.2);
  disposables.push(cabGeo);
  const cab = new THREE.Mesh(cabGeo, new THREE.MeshStandardMaterial({color: 0xffffff}));
  cab.position.set(0, -1.5, 1.5);
  trolleyGroup.add(cab);

  // 5. Spreader & Container
  const spreaderGroup = new THREE.Group();
  spreaderGroup.position.set(0, -10, 0); // Initial hanging depth
  trolleyGroup.add(spreaderGroup);
  animatables.spreader = spreaderGroup;

  const spreadGeo = new THREE.BoxGeometry(2, 0.5, 4);
  disposables.push(spreadGeo);
  const spreaderMesh = new THREE.Mesh(spreadGeo, new THREE.MeshStandardMaterial({color: 0xfacc15})); // Yellow spreader
  spreaderGroup.add(spreaderMesh);

  const containerGroup = new THREE.Group();
  containerGroup.position.y = -1.5;
  spreaderGroup.add(containerGroup);
  animatables.container = containerGroup;

  const contGeo = new THREE.BoxGeometry(2.4, 2.4, 6);
  disposables.push(contGeo);
  const cont = new THREE.Mesh(contGeo, containerMat);
  cont.rotation.y = Math.PI / 2;
  containerGroup.add(cont);

  // 6. Cables (Dynamic Line)
  const cableGeo = new THREE.BufferGeometry();
  const cablePos = new Float32Array(3 * 4); // 4 points (2 lines)
  cableGeo.setAttribute('position', new THREE.BufferAttribute(cablePos, 3));
  const cables = new THREE.Line(cableGeo, cableMat);
  trolleyGroup.add(cables);
  animatables.cables = cables;

  // 7. Status Light (Alarm)
  const alarmLight = new THREE.PointLight(0xff0000, 0, 20);
  alarmLight.position.set(-14, 24, 0);
  gantryGroup.add(alarmLight);
  animatables.statusLight = alarmLight;

  // 8. Scanning Effect (Laser Plane)
  const scanGroup = new THREE.Group();
  scanGroup.visible = false;
  
  const laserPlaneGeo = new THREE.PlaneGeometry(5, 5);
  laserPlaneGeo.rotateX(-Math.PI/2);
  const laserPlane = new THREE.Mesh(laserPlaneGeo, laserMat);
  scanGroup.add(laserPlane);
  
  // Position it near the motor/gearbox initially
  scanGroup.position.set(-12, 22, 2);
  gantryGroup.add(scanGroup);
  animatables.scanLaser = scanGroup;
};

export const animatePortCraneScene = (
  animatables: CraneAnimatables, 
  state: CraneMaintenanceState,
  time: number
) => {
  // 1. Operating Cycle Animation
  if (state === 'OPERATING') {
      if (animatables.trolley && animatables.spreader) {
          const cycle = time % 10; // 10s cycle
          // Trolley Movement X: -5 (Land) to 15 (Sea)
          let tX = -5;
          let sY = -10;

          if (cycle < 4) { // Move Out
              tX = -5 + (cycle/4) * 20;
              sY = -4; // High travel
          } else if (cycle < 6) { // Lower & Drop
              tX = 15;
              const subT = cycle - 4;
              // Dip down to -14 then back to -4
              sY = -4 - Math.sin(subT * Math.PI) * 10;
          } else if (cycle < 10) { // Return
              tX = 15 - ((cycle-6)/4) * 20;
              sY = -4;
          }

          animatables.trolley.position.x = tX;
          animatables.spreader.position.y = sY;
      }
      if (animatables.statusLight) animatables.statusLight.intensity = 0;
  } 
  
  // 2. Alarm State
  if (state === 'FAULT_ALARM') {
      if (animatables.statusLight) {
          animatables.statusLight.intensity = Math.sin(time * 10) > 0 ? 5 : 0;
      }
      // Stop movement
  }

  // 3. Diagnosis (Scanning Effect)
  if (state === 'DIAGNOSIS') {
      if (animatables.scanLaser) {
          animatables.scanLaser.visible = true;
          // Move scan plane up and down over the machinery
          animatables.scanLaser.position.y = 21 + Math.sin(time * 3) * 1.5;
          animatables.scanLaser.rotation.y += 0.02;
      }
      // Highlight faulty part (e.g., Gearbox pulsing red)
      if (animatables.gearbox) {
          (animatables.gearbox.material as THREE.MeshStandardMaterial).emissive.setHex(0xff0000);
          (animatables.gearbox.material as THREE.MeshStandardMaterial).emissiveIntensity = 0.5 + Math.sin(time*5)*0.3;
      }
  } else {
      if (animatables.scanLaser) animatables.scanLaser.visible = false;
      if (animatables.gearbox) (animatables.gearbox.material as THREE.MeshStandardMaterial).emissiveIntensity = 0;
  }

  // 4. Repair (Motor Removal Animation)
  if (state === 'REPAIR_MOTOR') {
      if (animatables.hoistMotor) {
          // Simulate lifting motor out
          const liftHeight = 3;
          const t = Math.sin(time) * 0.5 + 0.5; // 0 to 1
          animatables.hoistMotor.position.y = 21 + t * liftHeight;
          animatables.hoistMotor.rotation.y = time;
      }
  } else if (state !== 'OPERATING') {
      // Reset motor pos if not repairing
      if (animatables.hoistMotor) {
          animatables.hoistMotor.position.y = 21;
          animatables.hoistMotor.rotation.y = 0;
      }
  }

  // 5. Cable Updates (Always run to keep cables connected)
  if (animatables.cables && animatables.spreader) {
      if (animatables.cables.geometry.attributes.position) {
        const positions = animatables.cables.geometry.attributes.position.array as Float32Array;
        const spreaderY = animatables.spreader.position.y;
        
        // 4 points: [0,0,0], [0,Y,0], [0,0,0] (second line)
        // Line 1 (Left)
        positions[0] = -1; positions[1] = 0; positions[2] = 0; // Trolley attachment
        positions[3] = -1; positions[4] = spreaderY; positions[5] = 0; // Spreader attachment
        
        // Line 2 (Right)
        positions[6] = 1; positions[7] = 0; positions[8] = 0; 
        positions[9] = 1; positions[10] = spreaderY; positions[11] = 0;
        
        animatables.cables.geometry.attributes.position.needsUpdate = true;
      }
  }
};
