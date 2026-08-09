
import * as THREE from 'three';
import { Animatables, SceneType } from '../three-types';

export const isPumpedStorageEfficiencyScene = (type: SceneType): boolean => {
  return type === 'pumped-storage-efficiency-analysis';
};

export const setupPumpedStorageEfficiencyCamera = (camera: THREE.PerspectiveCamera) => {
  camera.position.set(20, 15, 20);
  camera.lookAt(0, 0, 0);
};

export const initPumpedStorageEfficiencyScene = (
  type: SceneType, 
  group: THREE.Group, 
  animatables: Animatables, 
  disposables: { dispose: () => void }[]
) => {
  if (type !== 'pumped-storage-efficiency-analysis') return;

  // 1. Structure: Upper & Lower Reservoirs
  const resGeo = new THREE.CylinderGeometry(5, 5, 1, 32);
  const resMat = new THREE.MeshStandardMaterial({ 
    color: 0x334155, 
    roughness: 0.8 
  });
  disposables.push(resGeo, resMat);

  // Upper
  const upperRes = new THREE.Mesh(resGeo, resMat);
  upperRes.position.set(0, 6, 0);
  group.add(upperRes);
  
  // Water Upper
  const waterGeo = new THREE.CylinderGeometry(4.8, 4.8, 0.8, 32);
  const waterMat = new THREE.MeshStandardMaterial({ 
    color: 0x0ea5e9, 
    transparent: true, 
    opacity: 0.8 
  });
  disposables.push(waterGeo, waterMat);
  const waterUpper = new THREE.Mesh(waterGeo, waterMat);
  waterUpper.position.y = 0.2;
  upperRes.add(waterUpper);

  // Lower
  const lowerRes = new THREE.Mesh(resGeo, resMat);
  lowerRes.position.set(0, -6, 0);
  group.add(lowerRes);

  // Water Lower
  const waterLower = new THREE.Mesh(waterGeo, waterMat);
  waterLower.position.y = 0.2;
  lowerRes.add(waterLower);

  // 2. Penstocks (Pipes)
  const pipeGeo = new THREE.CylinderGeometry(0.5, 0.5, 12, 16);
  const pipeMat = new THREE.MeshStandardMaterial({ 
    color: 0x475569, 
    transparent: true, 
    opacity: 0.3,
    wireframe: true 
  });
  disposables.push(pipeGeo, pipeMat);
  const pipe = new THREE.Mesh(pipeGeo, pipeMat);
  group.add(pipe);

  // 3. Central Unit (Pump-Turbine)
  const unitGroup = new THREE.Group();
  group.add(unitGroup);
  animatables.psUnitRotor = unitGroup;

  const casingGeo = new THREE.SphereGeometry(1.5, 32, 16);
  casingGeo.scale(1, 0.6, 1);
  const casingMat = new THREE.MeshStandardMaterial({ color: 0x10b981, roughness: 0.3, metalness: 0.8 });
  disposables.push(casingGeo, casingMat);
  const casing = new THREE.Mesh(casingGeo, casingMat);
  unitGroup.add(casing);

  // Rotor Blades (Visual)
  const bladeGeo = new THREE.BoxGeometry(0.2, 3, 0.8);
  const bladeMat = new THREE.MeshStandardMaterial({ color: 0xffffff });
  disposables.push(bladeGeo, bladeMat);
  for(let i=0; i<6; i++) {
    const b = new THREE.Mesh(bladeGeo, bladeMat);
    b.rotation.y = i * Math.PI / 3;
    unitGroup.add(b);
  }

  // 4. Loss Nodes (Red Spheres)
  // Transformer (Top), Generator (Mid-Top), Turbine (Mid), Penstock (Bot)
  const lossNodePositions = [
    { y: 3, label: 'Generator/Motor' },
    { y: 0, label: 'Turbine/Pump' },
    { y: -3, label: 'Penstock Friction' }
  ];
  
  animatables.psLossNodes = [];
  const nodeGeo = new THREE.SphereGeometry(0.6, 16, 16);
  const nodeMat = new THREE.MeshBasicMaterial({ color: 0xef4444, transparent: true, opacity: 0.0 }); // Start hidden
  disposables.push(nodeGeo, nodeMat);

  lossNodePositions.forEach(pos => {
    const node = new THREE.Mesh(nodeGeo, nodeMat.clone());
    node.position.set(1.5, pos.y, 1.5);
    group.add(node);
    animatables.psLossNodes?.push(node as unknown as THREE.Group);
    
    // Add pulsing rings
    const ringGeo = new THREE.RingGeometry(0.6, 1.0, 32);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0xef4444, transparent: true, opacity: 0, side: THREE.DoubleSide });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.lookAt(20, 15, 20); // Billboard to initial camera pos
    node.add(ring);
  });

  // 5. Flow Particles
  const pCount = 600;
  const pGeo = new THREE.BufferGeometry();
  const pPos = new Float32Array(pCount * 3);
  const pPhase = new Float32Array(pCount); // For animation offset

  for(let i=0; i<pCount; i++) {
    pPos[i*3] = (Math.random() - 0.5) * 0.8; // Inside pipe
    pPos[i*3+1] = (Math.random() - 0.5) * 12; // Along height
    pPos[i*3+2] = (Math.random() - 0.5) * 0.8;
    pPhase[i] = Math.random();
  }

  pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
  pGeo.setAttribute('phase', new THREE.BufferAttribute(pPhase, 1));
  
  const pMat = new THREE.PointsMaterial({ color: 0xfacc15, size: 0.15 });
  disposables.push(pGeo, pMat);
  const particles = new THREE.Points(pGeo, pMat);
  group.add(particles);
  animatables.psLoopFlow = particles;
};

export const animatePumpedStorageEfficiencyScene = (type: SceneType, animatables: Animatables, time: number) => {
  if (type !== 'pumped-storage-efficiency-analysis') return;

  // External Mode Control via userData (set by View)
  // Default: Generating (Down)
  const mode = (animatables.psUnitRotor as any)?.userData?.mode || 'GEN'; 
  const efficiency = (animatables.psUnitRotor as any)?.userData?.efficiency || 0.85;

  // 1. Animate Unit Rotor
  if (animatables.psUnitRotor) {
    // Spin direction based on mode
    const speed = mode === 'GEN' ? -0.1 : (mode === 'PUMP' ? 0.1 : 0);
    animatables.psUnitRotor.rotation.y += speed;
    
    // Color change
    const casing = animatables.psUnitRotor.children[0] as THREE.Mesh;
    const mat = casing.material as THREE.MeshStandardMaterial;
    if (mode === 'GEN') mat.color.setHex(0xfacc15); // Gold
    else if (mode === 'PUMP') mat.color.setHex(0x3b82f6); // Blue
    else mat.color.setHex(0x64748b); // Grey
  }

  // 2. Animate Flow
  if (animatables.psLoopFlow) {
    const particles = animatables.psLoopFlow;
    const positions = particles.geometry.attributes.position.array as Float32Array;
    const mat = particles.material as THREE.PointsMaterial;
    
    // Flow speed and direction
    const flowSpeed = mode === 'GEN' ? -0.1 : (mode === 'PUMP' ? 0.1 : 0);
    
    // Color
    if (mode === 'GEN') mat.color.setHex(0xfacc15);
    else if (mode === 'PUMP') mat.color.setHex(0x3b82f6);
    else mat.color.setHex(0x334155);

    for (let i = 0; i < positions.length/3; i++) {
      positions[i*3+1] += flowSpeed;
      
      // Loop
      if (positions[i*3+1] > 6) positions[i*3+1] = -6;
      if (positions[i*3+1] < -6) positions[i*3+1] = 6;
    }
    particles.geometry.attributes.position.needsUpdate = true;
  }

  // 3. Animate Loss Nodes
  // Intensity inversely proportional to efficiency
  if (animatables.psLossNodes) {
    const lossIntensity = Math.max(0, (1 - efficiency) * 2); // 0 to 1 approx
    
    animatables.psLossNodes.forEach((node, i) => {
      const mat = (node as any).material as THREE.MeshBasicMaterial;
      const ring = node.children[0] as THREE.Mesh;
      const ringMat = ring.material as THREE.MeshBasicMaterial;

      if (mode === 'IDLE') {
          mat.opacity = 0;
          ringMat.opacity = 0;
      } else {
          // Pulse
          const pulse = (Math.sin(time * 5 + i) + 1) * 0.5;
          mat.opacity = lossIntensity * 0.8;
          ringMat.opacity = lossIntensity * pulse;
          ring.scale.setScalar(1 + pulse * 0.5);
      }
    });
  }
};
