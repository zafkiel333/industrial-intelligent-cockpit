
import * as THREE from 'three';
import { Animatables, SceneType } from '../three-types';

export const isMineProcessDeliveryScene = (type: SceneType): boolean => {
  return type === 'dd-mine-process-delivery';
};

export const setupMineProcessDeliveryCamera = (camera: THREE.PerspectiveCamera) => {
  camera.position.set(20, 15, 20);
  camera.lookAt(0, 0, 0);
};

export const initMineProcessDeliveryScene = (
  type: SceneType, 
  group: THREE.Group, 
  animatables: Animatables, 
  disposables: { dispose: () => void }[]
) => {
  if (type !== 'dd-mine-process-delivery') return;

  // 1. Floor / Seam Floor
  const floorGeo = new THREE.PlaneGeometry(50, 20);
  floorGeo.rotateX(-Math.PI / 2);
  const floorMat = new THREE.MeshStandardMaterial({ color: 0x1c1917, roughness: 0.9 });
  disposables.push(floorGeo, floorMat);
  const floor = new THREE.Mesh(floorGeo, floorMat);
  floor.position.y = -1;
  group.add(floor);

  // 2. Coal Face (The Wall)
  const faceGeo = new THREE.BoxGeometry(40, 4, 2);
  const faceMat = new THREE.MeshStandardMaterial({ 
      color: 0x0f0f0f, 
      roughness: 0.8,
      bumpScale: 0.2
  });
  disposables.push(faceGeo, faceMat);
  const face = new THREE.Mesh(faceGeo, faceMat);
  face.position.set(0, 1, -4);
  group.add(face);

  // 3. Armored Face Conveyor (AFC)
  const afcGeo = new THREE.BoxGeometry(40, 0.5, 2);
  const afcMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.7 });
  disposables.push(afcGeo, afcMat);
  const afc = new THREE.Mesh(afcGeo, afcMat);
  afc.position.set(0, -0.5, -1.5);
  group.add(afc);
  animatables.mpdConveyor = afc;

  // 4. Shearer (The Cutter)
  const shearerGroup = new THREE.Group();
  group.add(shearerGroup);
  animatables.mpdShearer = shearerGroup;

  const bodyGeo = new THREE.BoxGeometry(4, 1.5, 1.5);
  const bodyMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b }); // Amber
  disposables.push(bodyGeo, bodyMat);
  const body = new THREE.Mesh(bodyGeo, bodyMat);
  body.position.set(0, 0.5, -1.5); // On AFC
  shearerGroup.add(body);

  // Cutting Drums
  const drumGeo = new THREE.CylinderGeometry(1, 1, 1.5, 16);
  drumGeo.rotateX(Math.PI / 2);
  const drumMat = new THREE.MeshStandardMaterial({ color: 0x78716c, wireframe: true });
  disposables.push(drumGeo, drumMat);

  const drumL = new THREE.Mesh(drumGeo, drumMat);
  drumL.position.set(-2.5, 0.5, -2); // Into face
  shearerGroup.add(drumL);

  const drumR = new THREE.Mesh(drumGeo, drumMat);
  drumR.position.set(2.5, 0.5, -2);
  shearerGroup.add(drumR);

  // 5. Hydraulic Supports (The Shields)
  animatables.mpdSupports = [];
  const supportGeo = new THREE.BoxGeometry(1.5, 0.2, 5); // Canopy
  const legGeo = new THREE.CylinderGeometry(0.3, 0.3, 2.5); // Leg
  const baseGeo = new THREE.BoxGeometry(1.5, 0.2, 4); // Base
  
  const supportMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8 });
  const activeMat = new THREE.MeshStandardMaterial({ color: 0x22c55e, emissive: 0x14532d, emissiveIntensity: 0.5 });
  
  disposables.push(supportGeo, legGeo, baseGeo, supportMat, activeMat);

  for(let i=0; i<20; i++) {
     const sGroup = new THREE.Group();
     const x = -19 + i * 2;
     sGroup.position.set(x, -1, 3); // Behind AFC
     
     const base = new THREE.Mesh(baseGeo, supportMat);
     base.position.y = 0.1;
     sGroup.add(base);
     
     const leg = new THREE.Mesh(legGeo, supportMat);
     leg.position.y = 1.35;
     sGroup.add(leg);
     
     const canopy = new THREE.Mesh(supportGeo, supportMat);
     canopy.position.set(0, 2.6, -1); // Overhang
     canopy.rotation.x = 0.05;
     sGroup.add(canopy);
     
     group.add(sGroup);
     animatables.mpdSupports.push(sGroup);
     
     // Store references for animation logic
     (sGroup as any).userData = { 
         normalMat: supportMat, 
         activeMat: activeMat, 
         meshes: [base, leg, canopy],
         baseZ: 3 
     };
  }

  // 6. Logic Flow Particles (Signals)
  const pCount = 200;
  const pGeo = new THREE.BufferGeometry();
  const pPos = new Float32Array(pCount * 3);
  for(let i=0; i<pCount; i++) {
      pPos[i*3] = (Math.random() - 0.5) * 40;
      pPos[i*3+1] = 3 + Math.random();
      pPos[i*3+2] = 2 + (Math.random() - 0.5) * 2;
  }
  pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
  const pMat = new THREE.PointsMaterial({ color: 0x0ea5e9, size: 0.15, transparent: true, opacity: 0.6 });
  disposables.push(pGeo, pMat);
  const flow = new THREE.Points(pGeo, pMat);
  group.add(flow);
  animatables.mpdLogicFlow = flow;
};

export const animateMineProcessDeliveryScene = (type: SceneType, animatables: Animatables, time: number) => {
  if (type !== 'dd-mine-process-delivery') return;

  // Shearer Movement (Oscillate)
  const shearerPos = Math.sin(time * 0.2) * 15;
  if (animatables.mpdShearer) {
    animatables.mpdShearer.position.x = shearerPos;
    // Rotate drums
    animatables.mpdShearer.children[1].rotation.x = time * 5;
    animatables.mpdShearer.children[2].rotation.x = time * 5;
  }

  // Support Logic: Sequential Advance
  // When shearer passes a support, it triggers "Advance" logic
  if (animatables.mpdSupports) {
      animatables.mpdSupports.forEach((sup) => {
          const supX = sup.position.x;
          // Check proximity to shearer
          const dist = shearerPos - supX;
          // Direction of shearer movement
          const dir = Math.cos(time * 0.2); // Derivative of sin
          
          // Logic: If shearer is moving right (dir>0) and just passed (dist positive and small)
          // Or moving left (dir<0) and just passed (dist negative and small)
          let active = false;
          
          if (dir > 0 && dist > 2 && dist < 6) active = true;
          if (dir < 0 && dist < -2 && dist > -6) active = true;

          const data = (sup as any).userData;
          
          // Visual: Change color and move forward
          data.meshes.forEach((m: THREE.Mesh) => {
              m.material = active ? data.activeMat : data.normalMat;
          });

          if (active) {
              // Advance animation
              sup.position.z = THREE.MathUtils.lerp(sup.position.z, data.baseZ - 1.5, 0.1);
          } else {
              // Retreat/Reset
              sup.position.z = THREE.MathUtils.lerp(sup.position.z, data.baseZ, 0.05);
          }
      });
  }

  // Signal Flow
  if (animatables.mpdLogicFlow) {
      const positions = animatables.mpdLogicFlow.geometry.attributes.position.array as Float32Array;
      for(let i=0; i<positions.length; i+=3) {
          positions[i] += 0.2; // Data moves along face
          if(positions[i] > 20) positions[i] = -20;
      }
      animatables.mpdLogicFlow.geometry.attributes.position.needsUpdate = true;
  }
};
