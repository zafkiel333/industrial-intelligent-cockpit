
import * as THREE from 'three';
import { Animatables, SceneType } from '../three-types';

export const isSmartPortDeliveryScene = (type: SceneType): boolean => {
  return type === 'dd-smart-port';
};

export const setupSmartPortDeliveryCamera = (camera: THREE.PerspectiveCamera) => {
  camera.position.set(0, 30, 40);
  camera.lookAt(0, 0, 0);
};

export const initSmartPortDeliveryScene = (
  type: SceneType, 
  group: THREE.Group, 
  animatables: Animatables, 
  disposables: { dispose: () => void }[]
) => {
  if (type !== 'dd-smart-port') return;

  // Materials
  const hubMat = new THREE.MeshStandardMaterial({ 
      color: 0x6366f1, 
      emissive: 0x4338ca, 
      emissiveIntensity: 0.8,
      roughness: 0.2,
      metalness: 0.8
  });
  const nodeMat = new THREE.MeshStandardMaterial({ 
      color: 0x06b6d4, 
      emissive: 0x0891b2,
      emissiveIntensity: 0.5,
      roughness: 0.3
  });
  const lineMat = new THREE.LineBasicMaterial({ 
      color: 0x3b82f6, 
      transparent: true, 
      opacity: 0.3 
  });
  const gridMat = new THREE.LineBasicMaterial({ color: 0x1e1b4b, transparent: true, opacity: 0.2 });

  disposables.push(hubMat, nodeMat, lineMat, gridMat);

  // 1. Digital Base Grid (Circuit Board Style)
  const gridHelper = new THREE.GridHelper(60, 60, 0x312e81, 0x0f172a);
  gridHelper.position.y = -5;
  group.add(gridHelper);

  // 2. Central Hub (TOS Core)
  const hubGroup = new THREE.Group();
  group.add(hubGroup);
  animatables.spdHub = hubGroup;

  const hubGeo = new THREE.CylinderGeometry(4, 4, 12, 6); // Hexagonal tower
  disposables.push(hubGeo);
  const hubMesh = new THREE.Mesh(hubGeo, hubMat);
  hubGroup.add(hubMesh);

  // Floating Status Rings around Hub
  animatables.spdRings = [];
  const ringGeo = new THREE.TorusGeometry(6, 0.2, 8, 64);
  disposables.push(ringGeo);
  const ringMat = new THREE.MeshBasicMaterial({ color: 0x6366f1, transparent: true, opacity: 0.6 });
  disposables.push(ringMat);

  [0, 1, 2].forEach(i => {
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.rotation.x = Math.PI / 2;
      ring.position.y = -2 + i * 3;
      ring.scale.setScalar(1 + i * 0.2);
      hubGroup.add(ring);
      animatables.spdRings?.push(ring);
  });

  // 3. Satellite Nodes (Subsystems)
  animatables.spdNodes = [];
  animatables.spdLinks = [];
  
  const nodes = [
      { id: 'GATE', label: 'Gate', x: -15, z: -15 },
      { id: 'YARD', label: 'Yard', x: 15, z: -15 },
      { id: 'QUAY', label: 'Quay', x: 15, z: 15 },
      { id: 'RAIL', label: 'Rail', x: -15, z: 15 },
      { id: 'BILL', label: 'Billing', x: 0, z: -20 },
      { id: 'EDI', label: 'EDI', x: 0, z: 20 },
  ];

  const nodeGeo = new THREE.BoxGeometry(3, 1, 3);
  disposables.push(nodeGeo);

  nodes.forEach(n => {
      const nGroup = new THREE.Group();
      nGroup.position.set(n.x, -2, n.z);
      
      const mesh = new THREE.Mesh(nodeGeo, nodeMat);
      nGroup.add(mesh);
      
      // Vertical beam
      const beamGeo = new THREE.CylinderGeometry(0.1, 0.1, 5);
      disposables.push(beamGeo);
      const beam = new THREE.Mesh(beamGeo, new THREE.MeshBasicMaterial({ color: 0x22d3ee, transparent: true, opacity: 0.5 }));
      beam.position.y = 2.5;
      nGroup.add(beam);

      group.add(nGroup);
      animatables.spdNodes?.push({ mesh: nGroup, type: n.id });

      // Link to Hub
      const points = [
          new THREE.Vector3(0, 0, 0), // Hub center (approx)
          new THREE.Vector3(n.x, -2, n.z)
      ];
      const linkGeo = new THREE.BufferGeometry().setFromPoints(points);
      disposables.push(linkGeo);
      const link = new THREE.Line(linkGeo, lineMat);
      group.add(link);
      animatables.spdLinks?.push(link);
  });

  // 4. Data Traffic (Particles)
  const pCount = 600;
  const pGeo = new THREE.BufferGeometry();
  const pPos = new Float32Array(pCount * 3);
  // Store route: start node index -> end node (0 = hub) or hub -> node
  const pRoute = new Float32Array(pCount * 2); // [nodeIndex, direction] (dir: 1=in, -1=out)
  const pProgress = new Float32Array(pCount); 

  for(let i=0; i<pCount; i++) {
      pRoute[i*2] = Math.floor(Math.random() * nodes.length);
      pRoute[i*2+1] = Math.random() > 0.5 ? 1 : -1;
      pProgress[i] = Math.random();
      
      pPos[i*3] = 0; pPos[i*3+1] = 0; pPos[i*3+2] = 0;
  }

  pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
  pGeo.setAttribute('route', new THREE.BufferAttribute(pRoute, 2));
  pGeo.setAttribute('progress', new THREE.BufferAttribute(pProgress, 1));
  
  const pMat = new THREE.PointsMaterial({ 
      color: 0xffffff, 
      size: 0.3, 
      transparent: true, 
      opacity: 0.8,
      map: createGlowTexture()
  });
  disposables.push(pGeo, pMat);
  const traffic = new THREE.Points(pGeo, pMat);
  group.add(traffic);
  animatables.spdDataTraffic = traffic;

  // Store nodes ref
  (traffic as any).userData = { nodes };
};

// Helper for texture
function createGlowTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 32; canvas.height = 32;
    const ctx = canvas.getContext('2d');
    if (ctx) {
        const grad = ctx.createRadialGradient(16,16,0, 16,16,16);
        grad.addColorStop(0, 'rgba(255,255,255,1)');
        grad.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.fillStyle = grad;
        ctx.fillRect(0,0,32,32);
    }
    const tex = new THREE.CanvasTexture(canvas);
    return tex;
}

export const animateSmartPortDeliveryScene = (type: SceneType, animatables: Animatables, time: number) => {
  if (type !== 'dd-smart-port') return;

  // 1. Hub Pulse & Ring Rotation
  if (animatables.spdHub) {
      // Scale pulse
      const s = 1 + Math.sin(time * 2) * 0.02;
      animatables.spdHub.scale.set(s, s, s);
  }
  if (animatables.spdRings) {
      animatables.spdRings.forEach((r, i) => {
          r.rotation.z = time * (0.2 + i * 0.1);
          r.rotation.x = Math.PI / 2 + Math.sin(time + i) * 0.1;
      });
  }

  // 2. Data Traffic Flow
  if (animatables.spdDataTraffic) {
      const particles = animatables.spdDataTraffic;
      const positions = particles.geometry.attributes.position.array as Float32Array;
      const routes = particles.geometry.attributes.route.array as Float32Array;
      const progress = particles.geometry.attributes.progress.array as Float32Array;
      
      const nodesData = (particles as any).userData.nodes; // [{x,z}, ...]
      
      for(let i=0; i<progress.length; i++) {
          let t = progress[i];
          t += 0.015; // Speed
          if (t > 1) {
              t = 0;
              // Randomly flip direction occasionally
              if (Math.random() > 0.8) routes[i*2+1] *= -1; 
          }
          progress[i] = t;

          const nodeIdx = routes[i*2];
          const dir = routes[i*2+1]; // 1 = Node to Hub, -1 = Hub to Node
          
          const nodePos = nodesData[nodeIdx];
          const hubPos = { x: 0, y: 0, z: 0 }; // Hub center height offset handled below
          
          let start, end;
          if (dir === 1) {
              start = { x: nodePos.x, y: -2, z: nodePos.z };
              end = { x: 0, y: 4, z: 0 }; // Top of hub
          } else {
              start = { x: 0, y: 4, z: 0 };
              end = { x: nodePos.x, y: -2, z: nodePos.z };
          }

          // Parabolic arc
          const x = start.x + (end.x - start.x) * t;
          const z = start.z + (end.z - start.z) * t;
          const y = start.y + (end.y - start.y) * t + Math.sin(t * Math.PI) * 5; // Arc height

          positions[i*3] = x;
          positions[i*3+1] = y;
          positions[i*3+2] = z;
      }
      particles.geometry.attributes.position.needsUpdate = true;
      particles.geometry.attributes.progress.needsUpdate = true;
  }
};
