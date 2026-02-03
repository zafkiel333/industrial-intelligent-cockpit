
import * as THREE from 'three';
import { VentAnimatables, SolverState } from './three-types';

// 拓扑数据模拟
const NETWORK_NODES = [
  { id: 0, pos: new THREE.Vector3(-10, 5, 0), type: 'INTAKE' },
  { id: 1, pos: new THREE.Vector3(-5, 0, 0), type: 'JUNCTION' },
  { id: 2, pos: new THREE.Vector3(5, 0, 5), type: 'JUNCTION' },
  { id: 3, pos: new THREE.Vector3(5, 0, -5), type: 'JUNCTION' },
  { id: 4, pos: new THREE.Vector3(10, 5, 0), type: 'RETURN' },
  { id: 5, pos: new THREE.Vector3(0, -5, 0), type: 'DEEP' },
];

const NETWORK_EDGES = [
  { start: 0, end: 1 },
  { start: 1, end: 2 },
  { start: 1, end: 3 },
  { start: 1, end: 5 },
  { start: 5, end: 2 },
  { start: 5, end: 3 },
  { start: 2, end: 4 },
  { start: 3, end: 4 },
];

export const initVentNetworkScene = (
  group: THREE.Group, 
  animatables: VentAnimatables,
  disposables: { dispose: () => void }[]
) => {
  // --- Materials ---
  const tubeMat = new THREE.MeshPhysicalMaterial({ 
    color: 0x334155, 
    transparent: true, 
    opacity: 0.3, 
    roughness: 0.1,
    metalness: 0.5,
    side: THREE.DoubleSide
  });
  const activeTubeMat = new THREE.MeshPhysicalMaterial({
    color: 0x0ea5e9,
    transparent: true,
    opacity: 0.2,
    wireframe: true
  });
  const nodeMat = new THREE.MeshStandardMaterial({ color: 0x64748b, roughness: 0.5 });
  const fanMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.8 });
  const particleMat = new THREE.PointsMaterial({ 
    color: 0x22d3ee, size: 0.15, transparent: true, opacity: 0.8, blending: THREE.AdditiveBlending 
  });

  disposables.push(tubeMat, activeTubeMat, nodeMat, fanMat, particleMat);

  const netGroup = new THREE.Group();
  group.add(netGroup);
  animatables.networkGroup = netGroup;
  animatables.tubes = [];
  animatables.nodes = [];
  animatables.fans = [];

  // 1. Build Nodes
  const nodeGeo = new THREE.SphereGeometry(0.5, 16, 16);
  disposables.push(nodeGeo);

  NETWORK_NODES.forEach(n => {
      const mesh = new THREE.Mesh(nodeGeo, nodeMat);
      mesh.position.copy(n.pos);
      netGroup.add(mesh);
      animatables.nodes!.push(mesh);
      
      // Intake/Return markers
      if (n.type === 'INTAKE' || n.type === 'RETURN') {
          const markerGeo = new THREE.RingGeometry(0.8, 1, 32);
          const markerMat = new THREE.MeshBasicMaterial({ color: n.type === 'INTAKE' ? 0x22c55e : 0xef4444, side: THREE.DoubleSide });
          const marker = new THREE.Mesh(markerGeo, markerMat);
          marker.position.copy(n.pos);
          marker.lookAt(0,0,0);
          netGroup.add(marker);
      }
  });

  // 2. Build Tubes (Edges)
  NETWORK_EDGES.forEach((edge, idx) => {
      const start = NETWORK_NODES[edge.start].pos;
      const end = NETWORK_NODES[edge.end].pos;
      
      // Create Tube
      const path = new THREE.LineCurve3(start, end);
      const tubeGeo = new THREE.TubeGeometry(path, 10, 0.3, 8, false);
      disposables.push(tubeGeo);
      
      const tube = new THREE.Mesh(tubeGeo, tubeMat);
      // Add wireframe overlay for tech look
      const wire = new THREE.Mesh(tubeGeo, activeTubeMat);
      tube.add(wire);
      
      netGroup.add(tube);
      animatables.tubes!.push(tube);

      // Add Fan at specific edges (e.g., edge leading to return)
      if (edge.end === 4) {
          const fanGroup = new THREE.Group();
          // Position fan 80% along the path
          const fanPos = path.getPoint(0.8);
          fanGroup.position.copy(fanPos);
          fanGroup.lookAt(end);
          
          const fanGeo = new THREE.CylinderGeometry(0.6, 0.6, 0.2, 16);
          fanGeo.rotateX(Math.PI/2);
          const bladesGeo = new THREE.BoxGeometry(1.2, 0.1, 0.3);
          
          const housing = new THREE.Mesh(fanGeo, new THREE.MeshStandardMaterial({color: 0x333333}));
          const blades = new THREE.Mesh(bladesGeo, fanMat);
          const blades2 = blades.clone();
          blades2.rotation.z = Math.PI/2;
          
          fanGroup.add(housing);
          fanGroup.add(blades);
          fanGroup.add(blades2);
          
          netGroup.add(fanGroup);
          animatables.fans!.push(fanGroup);
      }
  });

  // 3. Flow Particles
  const pCount = 1000;
  const pGeo = new THREE.BufferGeometry();
  const pPos = new Float32Array(pCount * 3);
  // Store which edge each particle belongs to and its progress (0-1)
  const pData = new Float32Array(pCount * 2); // [edgeIndex, progress]
  
  for(let i=0; i<pCount; i++) {
      const edgeIdx = Math.floor(Math.random() * NETWORK_EDGES.length);
      const progress = Math.random();
      
      pData[i*2] = edgeIdx;
      pData[i*2+1] = progress;
      
      // Initial pos calculation (will be updated in animate)
      pPos[i*3] = 0; pPos[i*3+1] = 0; pPos[i*3+2] = 0;
  }
  
  pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
  // Store custom data in 'uv' attribute just for convenience storage in buffer geometry (hacky but works for simple logic)
  pGeo.setAttribute('data', new THREE.BufferAttribute(pData, 2));

  const particles = new THREE.Points(pGeo, particleMat);
  netGroup.add(particles);
  animatables.flowParticles = particles;

  // Grid
  const grid = new THREE.GridHelper(40, 40, 0x1e293b, 0x0b0f19);
  grid.position.y = -6;
  group.add(grid);
};

export const animateVentNetwork = (
  animatables: VentAnimatables, 
  state: SolverState,
  time: number
) => {
  const isReverse = state === 'REVERSE';
  const isSmoke = state === 'SMOKE_SIM';
  const isSolving = state === 'SOLVING';
  
  // 1. Fan Rotation
  if (animatables.fans) {
      const speed = isReverse ? -0.5 : 0.5;
      animatables.fans.forEach(f => {
          f.children[1].rotation.z += speed; // Blades
          f.children[2].rotation.z += speed;
      });
  }

  // 2. Particle Flow Logic
  if (animatables.flowParticles) {
      const positions = animatables.flowParticles.geometry.attributes.position.array as Float32Array;
      const data = animatables.flowParticles.geometry.attributes.data.array as Float32Array;
      const mat = animatables.flowParticles.material as THREE.PointsMaterial;
      
      // Style updates
      if (isSmoke) {
          mat.color.setHex(0xff4400); // Fire smoke
          mat.size = 0.3;
          mat.opacity = 0.8;
      } else if (isSolving) {
          mat.color.setHex(0xffff00); // Calculating
          mat.size = 0.15;
      } else {
          mat.color.setHex(0x22d3ee); // Fresh air
          mat.size = 0.15;
      }

      const speed = isSolving ? 0.05 : 0.01; // Fast calculation viz
      const direction = isReverse ? -1 : 1;

      for (let i = 0; i < data.length / 2; i++) {
          const edgeIdx = data[i*2];
          let progress = data[i*2+1];
          
          progress += speed * direction;
          
          // Loop logic
          if (progress > 1) progress = 0;
          if (progress < 0) progress = 1;
          
          data[i*2+1] = progress;

          // Map progress to 3D position along the specific edge
          const edge = NETWORK_EDGES[edgeIdx];
          const start = NETWORK_NODES[edge.start].pos;
          const end = NETWORK_NODES[edge.end].pos;
          
          // Linear interpolation
          positions[i*3] = start.x + (end.x - start.x) * progress;
          positions[i*3+1] = start.y + (end.y - start.y) * progress;
          positions[i*3+2] = start.z + (end.z - start.z) * progress;

          // Add jitter/turbulence
          const jitter = isSmoke ? 0.2 : 0.05;
          positions[i*3] += (Math.random()-0.5) * jitter;
          positions[i*3+1] += (Math.random()-0.5) * jitter;
          positions[i*3+2] += (Math.random()-0.5) * jitter;
      }
      
      animatables.flowParticles.geometry.attributes.position.needsUpdate = true;
      animatables.flowParticles.geometry.attributes.data.needsUpdate = true;
  }

  // 3. Solving Pulse Effect
  if (state === 'SOLVING' && animatables.tubes) {
      const scale = 1 + Math.sin(time * 20) * 0.05;
      animatables.tubes.forEach(t => t.scale.setScalar(scale));
  } else if (animatables.tubes) {
      animatables.tubes.forEach(t => t.scale.setScalar(1));
  }
};
