
import * as THREE from 'three';
import { ShipPowerAnimatables, PowerSimState } from './three-types';

export const initShipPowerScene = (
  group: THREE.Group, 
  animatables: ShipPowerAnimatables,
  disposables: { dispose: () => void }[]
) => {
  // --- Materials ---
  const cabinetMat = new THREE.MeshStandardMaterial({ 
    color: 0x1e293b, roughness: 0.2, metalness: 0.8 
  }); 
  const genMat = new THREE.MeshStandardMaterial({ 
    color: 0x334155, roughness: 0.5, metalness: 0.5 
  });
  const copperMat = new THREE.MeshStandardMaterial({ 
    color: 0xb45309, roughness: 0.3, metalness: 0.9 
  });
  const glowBlueMat = new THREE.MeshBasicMaterial({ 
    color: 0x0ea5e9, transparent: true, opacity: 0.8 
  });
  const glowRedMat = new THREE.MeshBasicMaterial({ 
    color: 0xef4444, transparent: true, opacity: 0.8 
  });
  const floorMat = new THREE.MeshStandardMaterial({ 
    color: 0x0f172a, roughness: 0.8, metalness: 0.2
  });

  disposables.push(cabinetMat, genMat, copperMat, glowBlueMat, glowRedMat, floorMat);

  // 1. Environment
  const floorGeo = new THREE.PlaneGeometry(30, 20);
  floorGeo.rotateX(-Math.PI / 2);
  floorGeo.translate(0, -2, 0);
  disposables.push(floorGeo);
  const floor = new THREE.Mesh(floorGeo, floorMat);
  group.add(floor);

  // 2. Generators (Gen 1 & Gen 2)
  const createGenerator = (xPos: number, isGen2: boolean) => {
      const genGroup = new THREE.Group();
      genGroup.position.set(xPos, 0, -2);
      
      // Stator Housing
      const statorGeo = new THREE.CylinderGeometry(1.5, 1.5, 3, 32);
      statorGeo.rotateZ(Math.PI / 2);
      disposables.push(statorGeo);
      const stator = new THREE.Mesh(statorGeo, genMat);
      genGroup.add(stator);

      // Rotor (Visible at ends)
      const rotorGeo = new THREE.CylinderGeometry(1, 1, 3.2, 16);
      rotorGeo.rotateZ(Math.PI / 2);
      disposables.push(rotorGeo);
      const rotor = new THREE.Mesh(rotorGeo, copperMat);
      genGroup.add(rotor);
      if (isGen2) animatables.gen2Rotor = rotor;
      else animatables.gen1Rotor = rotor;

      // Engine Connection (Diesel Engine block hint)
      const engineGeo = new THREE.BoxGeometry(4, 2.5, 2);
      engineGeo.translate(-3.5, 0, 0);
      disposables.push(engineGeo);
      const engine = new THREE.Mesh(engineGeo, genMat);
      genGroup.add(engine);

      // Base
      const baseGeo = new THREE.BoxGeometry(9, 0.5, 3);
      baseGeo.translate(-1.5, -1.75, 0);
      disposables.push(baseGeo);
      const base = new THREE.Mesh(baseGeo, cabinetMat);
      genGroup.add(base);

      group.add(genGroup);
  };

  createGenerator(-5, false); // Gen 1 (Left)
  createGenerator(5, true);   // Gen 2 (Right, Faulty one)

  // 3. Main Switchboard (MSB)
  const msbGroup = new THREE.Group();
  msbGroup.position.set(0, 0, -8);
  group.add(msbGroup);
  animatables.msbCabinet = msbGroup;

  const cabGeo = new THREE.BoxGeometry(10, 5, 1);
  cabGeo.translate(0, 0.5, 0);
  disposables.push(cabGeo);
  const cabinet = new THREE.Mesh(cabGeo, cabinetMat);
  msbGroup.add(cabinet);

  // AVR Module (Removable Part inside Gen 2 Panel)
  const avrGroup = new THREE.Group();
  avrGroup.position.set(3, 1, 0.6); // Located on the right side of MSB (Gen 2 section)
  msbGroup.add(avrGroup);
  animatables.avrModule = avrGroup;

  const avrBoardGeo = new THREE.BoxGeometry(0.8, 1.2, 0.2);
  disposables.push(avrBoardGeo);
  const avrBoard = new THREE.Mesh(avrBoardGeo, new THREE.MeshStandardMaterial({color: 0x10b981})); // Green PCB
  avrGroup.add(avrBoard);
  
  // Components on AVR
  const compGeo = new THREE.BoxGeometry(0.2, 0.2, 0.1);
  const compMat = new THREE.MeshStandardMaterial({color: 0x000000});
  disposables.push(compGeo, compMat);
  for(let i=0; i<4; i++) {
      const c = new THREE.Mesh(compGeo, compMat);
      c.position.set((Math.random()-0.5)*0.6, (Math.random()-0.5)*1, 0.15);
      avrGroup.add(c);
  }

  // 4. Power Flow Lines (Particles)
  const pCount = 200;
  const pGeo = new THREE.BufferGeometry();
  const pPos = new Float32Array(pCount * 3);
  for(let i=0; i<pCount; i++) {
      // Flow from Gens to MSB
      pPos[i*3] = (Math.random() - 0.5) * 12; // Width
      pPos[i*3+1] = -1.5; // Floor level
      pPos[i*3+2] = -2 - Math.random() * 6; // Depth
  }
  pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
  const pMat = new THREE.PointsMaterial({ color: 0x0ea5e9, size: 0.1, transparent: true });
  disposables.push(pGeo, pMat);
  const particles = new THREE.Points(pGeo, pMat);
  group.add(particles);
  animatables.powerFlowLines = particles;

  // 5. Fault Sparks (Hidden initially)
  const sCount = 50;
  const sGeo = new THREE.BufferGeometry();
  const sPos = new Float32Array(sCount * 3);
  sGeo.setAttribute('position', new THREE.BufferAttribute(sPos, 3));
  const sMat = new THREE.PointsMaterial({ color: 0xffaa00, size: 0.2, transparent: true, opacity: 0 });
  disposables.push(sGeo, sMat);
  const sparks = new THREE.Points(sGeo, sMat);
  sparks.position.set(5, 0, -2); // Gen 2 location
  group.add(sparks);
  animatables.sparks = sparks;

  // 6. Warning Light
  const warningLight = new THREE.PointLight(0xff0000, 0, 10);
  warningLight.position.set(5, 3, -2);
  group.add(warningLight);
  animatables.warningLight = warningLight;
};

export const animateShipPowerScene = (
  animatables: ShipPowerAnimatables, 
  state: PowerSimState,
  time: number
) => {
  // Rotor Rotation
  if (animatables.gen1Rotor) animatables.gen1Rotor.rotation.x -= 0.5;
  if (animatables.gen2Rotor) {
      // Gen 2 stops if tripped
      if (state !== 'TRIP' && state !== 'DIAGNOSIS' && state !== 'REPAIR') {
          animatables.gen2Rotor.rotation.x -= 0.5;
      }
  }

  // Power Flow Particles
  if (animatables.powerFlowLines) {
      if (animatables.powerFlowLines.geometry.attributes.position) {
        const positions = animatables.powerFlowLines.geometry.attributes.position.array as Float32Array;
        const speed = state === 'TRIP' ? 0.05 : 0.2; // Slow down flow if tripped
        
        for(let i=0; i<positions.length/3; i++) {
            positions[i*3+2] -= speed;
            if (positions[i*3+2] < -8) {
                positions[i*3+2] = -2;
                // If tripped, only spawn flow for Gen 1 (Left side)
                if (state === 'TRIP') {
                    positions[i*3] = -5 + (Math.random() - 0.5) * 2;
                } else {
                    positions[i*3] = (Math.random() - 0.5) * 12;
                }
            }
        }
        animatables.powerFlowLines.geometry.attributes.position.needsUpdate = true;
      }
      
      // Color change on fault
      const pMat = animatables.powerFlowLines.material as THREE.PointsMaterial;
      if (state === 'FAULT_AVR') pMat.color.setHex(0xf59e0b); // Orange warning
      else if (state === 'TRIP') pMat.color.setHex(0xef4444); // Red trip
      else pMat.color.setHex(0x0ea5e9); // Blue normal
  }

  // Fault Effects
  if (state === 'FAULT_AVR') {
      if (animatables.sparks) {
          (animatables.sparks.material as THREE.PointsMaterial).opacity = Math.random() * 0.8;
          if (animatables.sparks.geometry.attributes.position) {
            const pos = animatables.sparks.geometry.attributes.position.array as Float32Array;
            for(let i=0; i<pos.length; i+=3) {
                pos[i] = (Math.random()-0.5)*1;
                pos[i+1] = (Math.random()-0.5)*1;
                pos[i+2] = (Math.random()-0.5)*1;
            }
            animatables.sparks.geometry.attributes.position.needsUpdate = true;
          }
      }
      if (animatables.warningLight) {
          animatables.warningLight.intensity = Math.sin(time * 10) * 2 + 2;
      }
  } else {
      if (animatables.sparks) (animatables.sparks.material as THREE.PointsMaterial).opacity = 0;
      if (animatables.warningLight) animatables.warningLight.intensity = 0;
  }

  // Repair Animation (Pull out AVR)
  if (animatables.avrModule) {
      if (state === 'DIAGNOSIS') {
          // Slide out
          animatables.avrModule.position.z = THREE.MathUtils.lerp(animatables.avrModule.position.z, 2, 0.05);
      } else if (state === 'REPAIR') {
          // Hover and rotate
          animatables.avrModule.position.z = 2;
          animatables.avrModule.rotation.y = time; 
          animatables.avrModule.rotation.z = Math.sin(time)*0.2;
          // Change color to indicate 'new' part being fitted visually?
          (animatables.avrModule.children[0] as THREE.Mesh).material = new THREE.MeshStandardMaterial({color: 0x22c55e});
      } else {
          // Return to slot
          animatables.avrModule.position.z = THREE.MathUtils.lerp(animatables.avrModule.position.z, 0.6, 0.1);
          animatables.avrModule.rotation.set(0,0,0);
          if (state === 'NORMAL') {
              (animatables.avrModule.children[0] as THREE.Mesh).material = new THREE.MeshStandardMaterial({color: 0x10b981});
          }
      }
  }
};
