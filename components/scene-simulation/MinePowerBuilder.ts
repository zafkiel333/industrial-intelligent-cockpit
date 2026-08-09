
import * as THREE from 'three';
import { SimAnimatables } from './three-types';

export const initMinePowerScene = (
  group: THREE.Group,
  animatables: SimAnimatables,
  disposables: { dispose: () => void }[]
) => {
  // 1. Environment (Dark Grid)
  const grid = new THREE.GridHelper(60, 60, 0x1e3a8a, 0x020617);
  grid.position.y = -5;
  group.add(grid);

  const ambient = new THREE.AmbientLight(0xffffff, 0.4);
  group.add(ambient);
  const blueLight = new THREE.PointLight(0x3b82f6, 1, 40);
  blueLight.position.set(0, 10, 0);
  group.add(blueLight);

  // 2. Nodes (Transformers / Load Centers)
  animatables.powerNodes = [];
  
  // Geometries
  const transGeo = new THREE.BoxGeometry(2, 3, 2);
  const transMat = new THREE.MeshStandardMaterial({ 
      color: 0x334155, 
      emissive: 0x1d4ed8, 
      emissiveIntensity: 0.5,
      roughness: 0.2,
      metalness: 0.8
  });
  disposables.push(transGeo, transMat);

  const loadGeo = new THREE.CylinderGeometry(1, 1, 2, 16);
  const loadMat = new THREE.MeshStandardMaterial({ color: 0x0ea5e9, wireframe: true });
  disposables.push(loadGeo, loadMat);

  // Define Nodes
  // 0: Main Substation (Surface)
  // 1,2: Distribution Points
  // 3,4,5: Machinery Loads
  const nodes = [
      { id: 0, x: 0, y: 5, z: -15, type: 'SUB', label: 'Main Substation' },
      { id: 1, x: -10, y: 0, z: 0, type: 'DIST', label: 'Dist A' },
      { id: 2, x: 10, y: 0, z: 0, type: 'DIST', label: 'Dist B' },
      { id: 3, x: -15, y: -2, z: 10, type: 'LOAD', label: 'Shearer' },
      { id: 4, x: -5, y: -2, z: 15, type: 'LOAD', label: 'Conveyor' },
      { id: 5, x: 12, y: -2, z: 12, type: 'LOAD', label: 'Pump Stn' },
  ];

  nodes.forEach(n => {
      const nodeGroup = new THREE.Group();
      nodeGroup.position.set(n.x, n.y, n.z);
      
      const mesh = new THREE.Mesh(n.type === 'LOAD' ? loadGeo : transGeo, n.type === 'LOAD' ? loadMat : transMat);
      nodeGroup.add(mesh);

      // Status Ring
      const ringGeo = new THREE.RingGeometry(1.2, 1.5, 32);
      const ringMat = new THREE.MeshBasicMaterial({ color: 0x22d3ee, side: THREE.DoubleSide, transparent: true, opacity: 0.6 });
      ringGeo.rotateX(-Math.PI / 2);
      disposables.push(ringGeo, ringMat);
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.position.y = -1;
      nodeGroup.add(ring);

      group.add(nodeGroup);
      
      // Store metadata
      (nodeGroup as any).userData = { ...n };
      animatables.powerNodes?.push(nodeGroup);
  });

  // 3. Cables (Lines) & Electron Flow
  animatables.powerLines = [];
  const lineMat = new THREE.LineBasicMaterial({ color: 0x1e40af, opacity: 0.3, transparent: true });
  disposables.push(lineMat);
  
  // Connections: 0->1, 0->2, 1->3, 1->4, 2->5
  const connections = [[0,1], [0,2], [1,3], [1,4], [2,5]];
  const cablePaths: THREE.CatmullRomCurve3[] = [];

  connections.forEach(pair => {
      const start = nodes[pair[0]];
      const end = nodes[pair[1]];
      
      const points = [
          new THREE.Vector3(start.x, start.y, start.z),
          new THREE.Vector3(start.x, end.y + 2, (start.z + end.z)/2), // Arc up slightly
          new THREE.Vector3(end.x, end.y, end.z)
      ];
      const curve = new THREE.CatmullRomCurve3(points);
      cablePaths.push(curve);

      const geo = new THREE.BufferGeometry().setFromPoints(curve.getPoints(20));
      disposables.push(geo);
      const line = new THREE.Line(geo, lineMat);
      group.add(line);
      animatables.powerLines?.push(line);
  });

  // Particles
  const pCount = 300;
  const pGeo = new THREE.BufferGeometry();
  const pPos = new Float32Array(pCount * 3);
  const pRoute = new Float32Array(pCount); // Index of connection
  const pTime = new Float32Array(pCount); // 0-1
  
  for(let i=0; i<pCount; i++) {
      pRoute[i] = Math.floor(Math.random() * connections.length);
      pTime[i] = Math.random();
      pPos[i*3] = 0; pPos[i*3+1] = 0; pPos[i*3+2] = 0;
  }
  pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
  pGeo.setAttribute('route', new THREE.BufferAttribute(pRoute, 1));
  pGeo.setAttribute('time', new THREE.BufferAttribute(pTime, 1));
  
  const pMat = new THREE.PointsMaterial({ color: 0x67e8f9, size: 0.3, transparent: true });
  disposables.push(pGeo, pMat);
  const particles = new THREE.Points(pGeo, pMat);
  group.add(particles);
  animatables.electronFlow = particles;
  
  // Store curves on object for animation
  (particles as any).userData = { curves: cablePaths };

  // 4. Fault Visual Effects (Hidden initially)
  // Spark Particles
  const sparkCount = 100;
  const sGeo = new THREE.BufferGeometry();
  const sPos = new Float32Array(sparkCount * 3);
  const sVel = new Float32Array(sparkCount * 3);
  for(let i=0; i<sparkCount; i++) {
      sPos[i*3] = 0; sPos[i*3+1] = 0; sPos[i*3+2] = 0;
      sVel[i*3] = (Math.random()-0.5); sVel[i*3+1] = (Math.random()-0.5); sVel[i*3+2] = (Math.random()-0.5);
  }
  sGeo.setAttribute('position', new THREE.BufferAttribute(sPos, 3));
  sGeo.setAttribute('velocity', new THREE.BufferAttribute(sVel, 3));
  const sMat = new THREE.PointsMaterial({ color: 0xff00ff, size: 0.4, transparent: true, opacity: 0 });
  disposables.push(sGeo, sMat);
  const sparks = new THREE.Points(sGeo, sMat);
  group.add(sparks);
  animatables.faultSparks = sparks;

  // Shockwave Sphere
  const waveGeo = new THREE.SphereGeometry(1, 32, 32);
  const waveMat = new THREE.MeshBasicMaterial({ color: 0xff0000, transparent: true, opacity: 0, wireframe: true });
  disposables.push(waveGeo, waveMat);
  const wave = new THREE.Mesh(waveGeo, waveMat);
  group.add(wave);
  animatables.faultShockwave = wave;
};

export const animateMinePowerScene = (animatables: SimAnimatables, time: number, simData: any) => {
    // simData: { loadLevel: 0-100, faultActive: boolean, faultNodeId: number }
    const loadLevel = simData?.loadLevel || 50;
    const isFault = simData?.faultActive || false;
    const faultNodeIdx = simData?.faultNodeId ?? -1;

    // 1. Electron Flow
    if (animatables.electronFlow) {
        const particles = animatables.electronFlow;
        const positions = particles.geometry.attributes.position.array as Float32Array;
        const times = particles.geometry.attributes.time.array as Float32Array;
        const routes = particles.geometry.attributes.route.array as Float32Array;
        const curves = (particles as any).userData.curves as THREE.CatmullRomCurve3[];
        
        // Speed proportional to load
        const speed = 0.002 + (loadLevel / 100) * 0.01;

        for(let i=0; i<times.length; i++) {
            times[i] += speed;
            if(times[i] > 1) times[i] = 0;
            
            const curveIdx = routes[i];
            const point = curves[curveIdx].getPoint(times[i]);
            
            positions[i*3] = point.x;
            positions[i*3+1] = point.y;
            positions[i*3+2] = point.z;
        }
        particles.geometry.attributes.position.needsUpdate = true;
        particles.geometry.attributes.time.needsUpdate = true;
        
        // Change color on overload (>90%)
        const mat = particles.material as THREE.PointsMaterial;
        if (loadLevel > 90) mat.color.setHex(0xf59e0b); // Yellow warning
        else mat.color.setHex(0x67e8f9);
    }

    // 2. Node Pulsing & Fault Effect
    if (animatables.powerNodes) {
        animatables.powerNodes.forEach((node, i) => {
            const userData = (node as any).userData;
            const ring = node.children[1] as THREE.Mesh;
            
            // Standard Pulse
            const scale = 1 + Math.sin(time * 3 + i) * 0.1;
            ring.scale.setScalar(scale);

            if (isFault && i === faultNodeIdx) {
                // Fault State
                (node.children[0] as THREE.Mesh).material = new THREE.MeshBasicMaterial({ color: 0xff0000 });
                (ring.material as THREE.Material).opacity = 1;
                ring.scale.setScalar(1 + Math.sin(time * 20) * 0.5); // Fast flash
            } else {
                // Normal State
                // (Resetting material is expensive, in real app use emissive property change)
                (ring.material as THREE.Material).opacity = 0.3 + (loadLevel/200);
            }
        });
    }

    // 3. Fault Visuals
    if (isFault && faultNodeIdx !== -1 && animatables.powerNodes) {
        const targetPos = animatables.powerNodes[faultNodeIdx].position;
        
        // Sparks
        if (animatables.faultSparks) {
            const sparks = animatables.faultSparks;
            (sparks.material as THREE.Material).opacity = 1;
            const pos = sparks.geometry.attributes.position.array as Float32Array;
            const vel = sparks.geometry.attributes.velocity.array as Float32Array;
            
            for(let i=0; i<pos.length; i+=3) {
                // Reset if too far
                if (Math.abs(pos[i] - targetPos.x) > 5) {
                    pos[i] = targetPos.x;
                    pos[i+1] = targetPos.y;
                    pos[i+2] = targetPos.z;
                }
                
                pos[i] += vel[i] * 0.5;
                pos[i+1] += vel[i+1] * 0.5;
                pos[i+2] += vel[i+2] * 0.5;
            }
            sparks.geometry.attributes.position.needsUpdate = true;
        }

        // Shockwave
        if (animatables.faultShockwave) {
            const wave = animatables.faultShockwave;
            wave.position.copy(targetPos);
            const s = (time * 5) % 10;
            wave.scale.setScalar(s);
            (wave.material as THREE.Material).opacity = 1 - (s/10);
            (wave.material as THREE.Material).visible = true;
        }
    } else {
        if (animatables.faultSparks) (animatables.faultSparks.material as THREE.Material).opacity = 0;
        if (animatables.faultShockwave) (animatables.faultShockwave.material as THREE.Material).visible = false;
    }
};
