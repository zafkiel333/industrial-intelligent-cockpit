
import * as THREE from 'three';
import { Animatables, SceneType } from '../three-types';

export const isMiningEnergyScene = (type: SceneType): boolean => {
  return type === 'mining-energy-analysis';
};

export const setupMiningEnergyCamera = (camera: THREE.PerspectiveCamera) => {
  camera.position.set(0, 15, 20);
  camera.lookAt(0, 0, 0);
};

export const initMiningEnergyScene = (
  type: SceneType, 
  group: THREE.Group, 
  animatables: Animatables, 
  disposables: { dispose: () => void }[]
) => {
  if (type !== 'mining-energy-analysis') return;

  // 1. Terrain Grid (Dark)
  const gridHelper = new THREE.GridHelper(40, 40, 0x1e3a8a, 0x0f172a);
  gridHelper.position.y = -2;
  group.add(gridHelper);

  // 2. Energy Nodes (Locations)
  // Center: Substation
  // Satellites: Excavation, Transport, Processing, Ventilation
  const nodes = [
    { id: 'SUB', x: 0, z: 0, color: 0x22d3ee, label: 'Substation', size: 1.5 },
    { id: 'EXC', x: -10, z: -8, color: 0xf59e0b, label: 'Excavation', size: 1 },
    { id: 'TRP', x: -8, z: 8, color: 0xf59e0b, label: 'Transport', size: 1 },
    { id: 'PRO', x: 10, z: -5, color: 0x22d3ee, label: 'Processing', size: 1.2 },
    { id: 'VEN', x: 8, z: 8, color: 0x22d3ee, label: 'Ventilation', size: 0.8 },
  ];

  animatables.energyNodes = [];
  
  const sphereGeo = new THREE.SphereGeometry(1, 16, 16);
  disposables.push(sphereGeo);

  nodes.forEach(node => {
    const nGroup = new THREE.Group();
    nGroup.position.set(node.x, 0, node.z);
    
    // Core
    const mat = new THREE.MeshStandardMaterial({ 
      color: node.color, 
      emissive: node.color, 
      emissiveIntensity: 0.5,
      roughness: 0.2
    });
    disposables.push(mat);
    const mesh = new THREE.Mesh(sphereGeo, mat);
    mesh.scale.setScalar(node.size);
    nGroup.add(mesh);

    // Rings
    const ringGeo = new THREE.TorusGeometry(node.size * 1.5, 0.05, 8, 32);
    const ringMat = new THREE.MeshBasicMaterial({ color: node.color, transparent: true, opacity: 0.3 });
    disposables.push(ringGeo, ringMat);
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = Math.PI / 2;
    nGroup.add(ring);

    group.add(nGroup);
    animatables.energyNodes?.push(nGroup);
    
    // Store data for lines
    (nGroup as any).userData = node;
  });

  // 3. Connection Lines (Power Lines)
  const lineMat = new THREE.LineBasicMaterial({ color: 0x1e40af, transparent: true, opacity: 0.3 });
  disposables.push(lineMat);
  
  // Connect Substation to others
  const subNode = nodes[0];
  const otherNodes = nodes.slice(1);
  
  const linkPoints: THREE.Vector3[] = [];
  
  otherNodes.forEach(node => {
    linkPoints.push(new THREE.Vector3(subNode.x, 0, subNode.z));
    linkPoints.push(new THREE.Vector3(node.x, 0, node.z));
  });
  
  const linkGeo = new THREE.BufferGeometry().setFromPoints(linkPoints);
  disposables.push(linkGeo);
  const links = new THREE.LineSegments(linkGeo, lineMat);
  group.add(links);

  // 4. Energy Pulses (Particles)
  const pCount = 100;
  const pGeo = new THREE.BufferGeometry();
  const pPos = new Float32Array(pCount * 3);
  const pData = new Float32Array(pCount * 4); // [startX, startZ, endX, endZ]
  const pProgress = new Float32Array(pCount); // 0 to 1
  
  for(let i=0; i<pCount; i++) {
    // Pick a random target node
    const target = otherNodes[Math.floor(Math.random() * otherNodes.length)];
    
    pData[i*4] = subNode.x;
    pData[i*4+1] = subNode.z;
    pData[i*4+2] = target.x;
    pData[i*4+3] = target.z;
    
    pProgress[i] = Math.random();
    
    // Initial pos
    pPos[i*3] = 0;
    pPos[i*3+1] = 0;
    pPos[i*3+2] = 0;
  }
  
  pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
  pGeo.setAttribute('data', new THREE.BufferAttribute(pData, 4));
  pGeo.setAttribute('progress', new THREE.BufferAttribute(pProgress, 1));
  
  const pMat = new THREE.PointsMaterial({ color: 0xffffff, size: 0.2 });
  disposables.push(pGeo, pMat);
  const pulses = new THREE.Points(pGeo, pMat);
  group.add(pulses);
  animatables.energyPulses = pulses;
};

export const animateMiningEnergyScene = (type: SceneType, animatables: Animatables, time: number) => {
  if (type !== 'mining-energy-analysis') return;

  // Animate Nodes (Bobbing/Rotating)
  if (animatables.energyNodes) {
    animatables.energyNodes.forEach((node, i) => {
      node.position.y = Math.sin(time * 2 + i) * 0.2;
      // Rotate rings if accessible, or just the group
      if (node.children[1]) {
        node.children[1].rotation.z = time * 0.5;
        node.children[1].scale.setScalar(1 + Math.sin(time * 3 + i) * 0.1);
      }
    });
  }

  // Animate Pulses
  if (animatables.energyPulses) {
    const positions = animatables.energyPulses.geometry.attributes.position.array as Float32Array;
    const data = animatables.energyPulses.geometry.attributes.data.array as Float32Array;
    const progress = animatables.energyPulses.geometry.attributes.progress.array as Float32Array;
    
    for(let i=0; i<progress.length; i++) {
      progress[i] += 0.02; // Speed
      if (progress[i] > 1) progress[i] = 0;
      
      const t = progress[i];
      const sx = data[i*4];
      const sz = data[i*4+1];
      const ex = data[i*4+2];
      const ez = data[i*4+3];
      
      positions[i*3] = sx + (ex - sx) * t;
      positions[i*3+1] = Math.sin(t * Math.PI) * 1; // Arc height
      positions[i*3+2] = sz + (ez - sz) * t;
    }
    
    animatables.energyPulses.geometry.attributes.position.needsUpdate = true;
    animatables.energyPulses.geometry.attributes.progress.needsUpdate = true;
  }
};
