
import * as THREE from 'three';
import { Animatables, SceneType } from '../three-types';

export const isHydroDispatchScene = (type: SceneType): boolean => {
  return type === 'dd-hydro-dispatch';
};

export const setupHydroDispatchCamera = (camera: THREE.PerspectiveCamera) => {
  camera.position.set(0, 15, 25);
  camera.lookAt(0, 0, 0);
};

export const initHydroDispatchScene = (
  type: SceneType, 
  group: THREE.Group, 
  animatables: Animatables, 
  disposables: { dispose: () => void }[]
) => {
  if (type !== 'dd-hydro-dispatch') return;

  // 1. Digital Terrain Grid (Basin) - Cybernetic Style
  const gridHelper = new THREE.GridHelper(50, 50, 0x6366f1, 0x1e1b4b);
  gridHelper.position.y = -5;
  group.add(gridHelper);
  
  // Deform grid to look like a valley
  // We can't deform GridHelper directly easily, so let's make a custom grid mesh
  const terrainGeo = new THREE.PlaneGeometry(50, 50, 32, 32);
  const pos = terrainGeo.attributes.position;
  for(let i=0; i<pos.count; i++) {
    const x = pos.getX(i);
    const y = pos.getY(i); // Local Y is plane vertical
    // Valley curve
    let z = Math.pow(x * 0.15, 2) * 2 - 5; 
    pos.setZ(i, z);
  }
  terrainGeo.computeVertexNormals();
  terrainGeo.rotateX(-Math.PI / 2);

  const terrainMat = new THREE.MeshBasicMaterial({ 
    color: 0x312e81, 
    wireframe: true, 
    transparent: true, 
    opacity: 0.3 
  });
  disposables.push(terrainGeo, terrainMat);
  const terrain = new THREE.Mesh(terrainGeo, terrainMat);
  group.add(terrain);

  // 2. Logic Nodes (Floating "Neurons" of the Model)
  animatables.hdLogicNodes = [];
  const nodeGeo = new THREE.IcosahedronGeometry(0.8, 0);
  const nodeMat = new THREE.MeshBasicMaterial({ color: 0xa855f7, wireframe: true });
  disposables.push(nodeGeo, nodeMat);

  const nodes = [
    { x: 0, y: 5, z: 0, type: 'Core', color: 0xf472b6 },    // Main Optimization
    { x: -8, y: 2, z: 5, type: 'Input', color: 0x22d3ee },  // Rainfall Input
    { x: 8, y: 2, z: 5, type: 'Input', color: 0x22d3ee },   // Inflow Input
    { x: -6, y: 0, z: -5, type: 'Constraint', color: 0xfacc15 }, // Flood Limit
    { x: 6, y: 0, z: -5, type: 'Constraint', color: 0xfacc15 },  // Eco Flow
  ];

  nodes.forEach(n => {
    const nodeGroup = new THREE.Group();
    nodeGroup.position.set(n.x, n.y, n.z);
    
    const mesh = new THREE.Mesh(nodeGeo, nodeMat.clone());
    (mesh.material as THREE.MeshBasicMaterial).color.setHex(n.color);
    nodeGroup.add(mesh);

    // Inner Glow
    const glowGeo = new THREE.SphereGeometry(0.4);
    const glowMat = new THREE.MeshBasicMaterial({ color: n.color, transparent: true, opacity: 0.5 });
    disposables.push(glowGeo, glowMat);
    const glow = new THREE.Mesh(glowGeo, glowMat);
    nodeGroup.add(glow);

    group.add(nodeGroup);
    animatables.hdLogicNodes?.push({ mesh: nodeGroup, type: n.type });
  });

  // 3. Network Connections (Lines)
  const lineMat = new THREE.LineBasicMaterial({ color: 0x6366f1, transparent: true, opacity: 0.4 });
  disposables.push(lineMat);
  
  const coreNode = nodes[0];
  nodes.slice(1).forEach(n => {
    const points = [
      new THREE.Vector3(coreNode.x, coreNode.y, coreNode.z),
      new THREE.Vector3(n.x, n.y, n.z)
    ];
    const geo = new THREE.BufferGeometry().setFromPoints(points);
    disposables.push(geo);
    const line = new THREE.Line(geo, lineMat);
    group.add(line);
  });

  // 4. Data Stream (Particles flowing through the logic)
  const pCount = 400;
  const pGeo = new THREE.BufferGeometry();
  const pPos = new Float32Array(pCount * 3);
  // Store target node index
  const pTarget = new Float32Array(pCount); 
  const pProgress = new Float32Array(pCount);

  for(let i=0; i<pCount; i++) {
    pTarget[i] = Math.floor(Math.random() * (nodes.length - 1)) + 1; // 1 to 4
    pProgress[i] = Math.random();
    pPos[i*3] = 0; pPos[i*3+1] = 0; pPos[i*3+2] = 0;
  }
  
  pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
  pGeo.setAttribute('targetIdx', new THREE.BufferAttribute(pTarget, 1));
  pGeo.setAttribute('progress', new THREE.BufferAttribute(pProgress, 1));

  const pMat = new THREE.PointsMaterial({ color: 0xffffff, size: 0.15, transparent: true, opacity: 0.8 });
  disposables.push(pGeo, pMat);
  const flow = new THREE.Points(pGeo, pMat);
  group.add(flow);
  animatables.hdDataStream = flow;

  // Store nodes positions for animation access
  (flow as any).userData = { nodes };
};

export const animateHydroDispatchScene = (type: SceneType, animatables: Animatables, time: number) => {
  if (type !== 'dd-hydro-dispatch') return;

  // 1. Animate Logic Nodes (Pulse & Rotate)
  if (animatables.hdLogicNodes) {
    animatables.hdLogicNodes.forEach((n, i) => {
      n.mesh.rotation.y = time * 0.5 + i;
      n.mesh.rotation.z = time * 0.2;
      const scale = 1 + Math.sin(time * 2 + i) * 0.1;
      n.mesh.scale.setScalar(scale);
    });
  }

  // 2. Animate Data Flow (Center <-> Nodes)
  if (animatables.hdDataStream) {
    const particles = animatables.hdDataStream;
    const positions = particles.geometry.attributes.position.array as Float32Array;
    const targets = particles.geometry.attributes.targetIdx.array as Float32Array;
    const progress = particles.geometry.attributes.progress.array as Float32Array;
    const nodes = (particles as any).userData.nodes;
    
    const center = nodes[0]; // Core

    for(let i=0; i<progress.length; i++) {
      let t = progress[i];
      // Flow direction: Inputs(1,2) -> Core(0) -> Constraints(3,4)
      // We simulate a pulse: 0->1 (Out to Node) or 1->0 (In to Core)?
      // Let's do: Input Nodes -> Core -> Constraint Nodes
      
      const targetIdx = targets[i];
      const targetNode = nodes[targetIdx];
      
      t += 0.02;
      if (t > 1) {
        t = 0;
        // Switch direction or target?
        // Just loop for visual effect
      }
      progress[i] = t;

      // Determine Start/End
      let start, end;
      if (targetNode.type === 'Input') {
        start = targetNode;
        end = center;
      } else {
        start = center;
        end = targetNode;
      }

      positions[i*3] = start.x + (end.x - start.x) * t;
      positions[i*3+1] = start.y + (end.y - start.y) * t;
      positions[i*3+2] = start.z + (end.z - start.z) * t;
      
      // Add some "noise" to the beam
      positions[i*3] += (Math.random()-0.5)*0.2;
      positions[i*3+1] += (Math.random()-0.5)*0.2;
      positions[i*3+2] += (Math.random()-0.5)*0.2;
    }
    
    particles.geometry.attributes.position.needsUpdate = true;
    particles.geometry.attributes.progress.needsUpdate = true;
  }
};
