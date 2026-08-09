
import * as THREE from 'three';
import { HydraulicAnimatables, SupportSimState } from './three-types';

export const initHydraulicSupportScene = (
  group: THREE.Group, 
  animatables: HydraulicAnimatables,
  disposables: { dispose: () => void }[]
) => {
  // --- Materials ---
  const steelMat = new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.3, metalness: 0.7 });
  const yellowMat = new THREE.MeshStandardMaterial({ color: 0xfacc15, roughness: 0.5 });
  const chromeMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.1, metalness: 1.0 });
  const waterMat = new THREE.MeshPhysicalMaterial({ color: 0x0ea5e9, transparent: true, opacity: 0.4 });
  const laserMat = new THREE.MeshBasicMaterial({ color: 0x22d3ee, transparent: true, opacity: 0.4, side: THREE.DoubleSide });
  const oilMat = new THREE.PointsMaterial({ color: 0xeab308, size: 0.1, transparent: true, opacity: 0.8 });

  disposables.push(steelMat, yellowMat, chromeMat, waterMat, laserMat, oilMat);

  // 1. Base Plate
  const baseGeo = new THREE.BoxGeometry(6, 0.8, 10);
  disposables.push(baseGeo);
  const base = new THREE.Mesh(baseGeo, steelMat);
  base.position.y = 0.4;
  group.add(base);
  animatables.basePlate = base;

  // 2. Main Pillars (Telescopic Cylinders)
  animatables.pillars = [];
  const pillarPos = [
      { x: -1.5, z: 2 }, { x: 1.5, z: 2 },
      { x: -1.5, z: -2 }, { x: 1.5, z: -2 }
  ];

  const outerCylGeo = new THREE.CylinderGeometry(0.5, 0.6, 4, 16);
  const innerCylGeo = new THREE.CylinderGeometry(0.35, 0.35, 4, 16);
  disposables.push(outerCylGeo, innerCylGeo);

  pillarPos.forEach((pos, i) => {
      const pGroup = new THREE.Group();
      pGroup.position.set(pos.x, 0.8, pos.z);
      
      const outer = new THREE.Mesh(outerCylGeo, steelMat);
      outer.position.y = 2;
      pGroup.add(outer);

      const inner = new THREE.Mesh(innerCylGeo, chromeMat);
      inner.position.y = 4; // Start extended
      pGroup.add(inner);

      group.add(pGroup);
      animatables.pillars?.push(pGroup);
  });

  // 3. Canopy (Roof Beam)
  const canopyGeo = new THREE.BoxGeometry(6.5, 0.6, 12);
  disposables.push(canopyGeo);
  const canopy = new THREE.Mesh(canopyGeo, yellowMat);
  canopy.position.y = 7;
  group.add(canopy);
  animatables.canopy = canopy;

  // 4. Side Shields (Wings)
  const wingGeo = new THREE.BoxGeometry(0.2, 5, 10);
  disposables.push(wingGeo);
  const wings = new THREE.Group();
  const wingL = new THREE.Mesh(wingGeo, steelMat);
  wingL.position.set(-3.2, 4, 0);
  const wingR = new THREE.Mesh(wingGeo, steelMat);
  wingR.position.set(3.2, 4, 0);
  wings.add(wingL, wingR);
  group.add(wings);
  animatables.shieldWings = wings;

  // 5. Control Valve Block (Maintenance focus)
  const valveGroup = new THREE.Group();
  valveGroup.position.set(0, 1.2, 3);
  const blockGeo = new THREE.BoxGeometry(1.2, 0.8, 1.5);
  disposables.push(blockGeo);
  const block = new THREE.Mesh(blockGeo, steelMat);
  valveGroup.add(block);
  
  // Handles
  const handleGeo = new THREE.CylinderGeometry(0.05, 0.05, 0.4);
  for(let i=0; i<4; i++) {
      const h = new THREE.Mesh(handleGeo, new THREE.MeshStandardMaterial({color: 0x333333}));
      h.position.set(-0.3 + i*0.2, 0.6, 0);
      valveGroup.add(h);
  }
  group.add(valveGroup);
  animatables.valveBlock = valveGroup;

  // 6. Leak Effect (Oil Spray)
  const pCount = 100;
  const pGeo = new THREE.BufferGeometry();
  const pPos = new Float32Array(pCount * 3);
  pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
  const oilParticles = new THREE.Points(pGeo, oilMat);
  oilParticles.position.set(1.5, 3, 2); // Near a pillar
  oilParticles.visible = false;
  group.add(oilParticles);
  animatables.leakEffect = oilParticles;

  // 7. Scanner Beam
  const beamGeo = new THREE.BoxGeometry(6, 0.05, 1);
  disposables.push(beamGeo);
  const beam = new THREE.Mesh(beamGeo, laserMat);
  beam.position.y = 4;
  beam.visible = false;
  group.add(beam);
  animatables.scanBeam = beam;
};

export const animateHydraulicScene = (
  animatables: HydraulicAnimatables, 
  state: SupportSimState,
  time: number
) => {
  // Canopy follow pillars
  if (animatables.pillars && animatables.canopy) {
      const firstInner = animatables.pillars[0].children[1];
      const h = 0.8 + 2 + firstInner.position.y + 0.3; // Base + Outer + Inner_offset + Canopy_half
      animatables.canopy.position.y = h;
  }

  // State specific animations
  if (state === 'STANDBY') {
      // Normal idle pulse
      if (animatables.pillars) {
          animatables.pillars.forEach(p => {
              const inner = p.children[1];
              inner.position.y = 4 + Math.sin(time) * 0.05;
          });
      }
  } 
  else if (state === 'LEAK_ALARM') {
      if (animatables.leakEffect) {
          animatables.leakEffect.visible = true;
          const pos = animatables.leakEffect.geometry.attributes.position.array as Float32Array;
          for(let i=0; i<pos.length/3; i++) {
              pos[i*3] += (Math.random()-0.5)*0.2;
              pos[i*3+1] -= 0.1;
              pos[i*3+2] += (Math.random()-0.5)*0.2;
              if (pos[i*3+1] < -2) { pos[i*3]=0; pos[i*3+1]=0; pos[i*3+2]=0; }
          }
          animatables.leakEffect.geometry.attributes.position.needsUpdate = true;
      }
      // Sinking effect
      if (animatables.pillars) {
          const inner = animatables.pillars[1].children[1];
          inner.position.y = Math.max(2, inner.position.y - 0.01);
      }
  }
  else if (state === 'PRESSURE_RELIEF') {
      if (animatables.leakEffect) animatables.leakEffect.visible = false;
      if (animatables.pillars) {
          animatables.pillars.forEach(p => {
              const inner = p.children[1];
              inner.position.y = THREE.MathUtils.lerp(inner.position.y, 1.5, 0.05);
          });
      }
  }
  else if (state === 'VALVE_REPLACE') {
      if (animatables.valveBlock) {
          animatables.valveBlock.position.y = 1.2 + Math.abs(Math.sin(time))*1;
          animatables.valveBlock.rotation.y += 0.05;
      }
  }
  else if (state === 'FUNCTION_TEST') {
      if (animatables.valveBlock) {
          animatables.valveBlock.position.set(0, 1.2, 3);
          animatables.valveBlock.rotation.set(0,0,0);
      }
      if (animatables.pillars) {
          animatables.pillars.forEach(p => {
              const inner = p.children[1];
              inner.position.y = 4 + Math.sin(time*2) * 1.5;
          });
      }
  }
};
