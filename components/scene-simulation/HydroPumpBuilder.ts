
import * as THREE from 'three';
import { SimAnimatables } from './three-types';

export const initHydroPumpScene = (
  group: THREE.Group,
  animatables: SimAnimatables,
  disposables: { dispose: () => void }[]
) => {
  // 1. Lighting (Clean Tech Lab style)
  const ambient = new THREE.AmbientLight(0xffffff, 0.4);
  group.add(ambient);
  const dirLight = new THREE.DirectionalLight(0xffffff, 1);
  dirLight.position.set(-10, 20, 10);
  group.add(dirLight);
  const bluePoint = new THREE.PointLight(0x0ea5e9, 0.8, 40);
  bluePoint.position.set(0, 5, 0);
  group.add(bluePoint);

  // 2. Floor Grid
  const grid = new THREE.GridHelper(60, 60, 0x1e293b, 0x0f172a);
  grid.position.y = -4;
  group.add(grid);

  const floorGeo = new THREE.PlaneGeometry(60, 40);
  floorGeo.rotateX(-Math.PI/2);
  const floorMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.8, metalness: 0.2 });
  disposables.push(floorGeo, floorMat);
  const floor = new THREE.Mesh(floorGeo, floorMat);
  floor.position.y = -4.05;
  group.add(floor);

  // 3. Pump Units (4 Parallel Units)
  animatables.hpPumps = [];
  animatables.hpShafts = [];
  animatables.hpValves = [];
  
  const pumpSpacing = 8;
  const motorGeo = new THREE.CylinderGeometry(1.2, 1.2, 2.5, 32);
  const shaftGeo = new THREE.CylinderGeometry(0.3, 0.3, 1.5, 16);
  const voluteGeo = new THREE.CylinderGeometry(2, 2, 1.5, 32); // Simplified volute
  // Add a spout to volute
  
  const motorMat = new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.6, roughness: 0.4 });
  const activeMat = new THREE.MeshStandardMaterial({ 
      color: 0x22c55e, 
      emissive: 0x15803d, 
      emissiveIntensity: 0.5 
  }); // Will switch to this when running
  const shaftMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.9, roughness: 0.2 });
  const voluteMat = new THREE.MeshPhysicalMaterial({ color: 0x3b82f6, metalness: 0.5, roughness: 0.2 });
  
  disposables.push(motorGeo, shaftGeo, voluteGeo, motorMat, activeMat, shaftMat, voluteMat);

  for(let i=0; i<4; i++) {
      const x = (i - 1.5) * pumpSpacing;
      const pumpGroup = new THREE.Group();
      pumpGroup.position.set(x, 0, 0);

      // Motor
      const motor = new THREE.Mesh(motorGeo, motorMat.clone()); // Clone to allow individual color change
      motor.position.y = 2.5;
      pumpGroup.add(motor);

      // Shaft
      const shaft = new THREE.Mesh(shaftGeo, shaftMat);
      shaft.position.y = 0.5;
      pumpGroup.add(shaft);
      animatables.hpShafts.push(shaft);

      // Volute (Pump Body)
      const volute = new THREE.Mesh(voluteGeo, voluteMat);
      volute.position.y = -1;
      volute.rotation.x = Math.PI / 2; // Flat disc style
      pumpGroup.add(volute);

      // Discharge Pipe Segment
      const dPipeGeo = new THREE.CylinderGeometry(0.6, 0.6, 6, 16);
      dPipeGeo.rotateX(Math.PI / 2);
      dPipeGeo.translate(0, 0, -3); // Extends back
      const dPipe = new THREE.Mesh(dPipeGeo, new THREE.MeshPhysicalMaterial({ color: 0x64748b, transparent: true, opacity: 0.3 }));
      pumpGroup.add(dPipe);
      disposables.push(dPipeGeo);

      // Valve (On discharge)
      const valveGroup = new THREE.Group();
      valveGroup.position.set(0, -1, -4);
      const valveBody = new THREE.Mesh(new THREE.BoxGeometry(1.5, 1.5, 1.5), new THREE.MeshStandardMaterial({color: 0xf59e0b}));
      const valveWheel = new THREE.Mesh(new THREE.TorusGeometry(0.8, 0.1, 8, 16), new THREE.MeshStandardMaterial({color: 0xffffff}));
      valveWheel.position.y = 1;
      valveWheel.rotation.x = Math.PI / 2;
      valveGroup.add(valveBody);
      valveGroup.add(valveWheel);
      pumpGroup.add(valveGroup);
      animatables.hpValves.push(valveGroup);

      // Suction Pipe (Going down)
      const sPipeGeo = new THREE.CylinderGeometry(0.8, 0.8, 4, 16);
      const sPipe = new THREE.Mesh(sPipeGeo, new THREE.MeshStandardMaterial({color:0x334155}));
      sPipe.position.y = -3;
      pumpGroup.add(sPipe);
      disposables.push(sPipeGeo);

      group.add(pumpGroup);
      animatables.hpPumps.push(pumpGroup);
  }

  // 4. Common Headers
  // Discharge Header (Back)
  const headerGeo = new THREE.CylinderGeometry(1.5, 1.5, 40, 32);
  headerGeo.rotateZ(Math.PI / 2);
  const headerMat = new THREE.MeshPhysicalMaterial({ 
      color: 0x64748b, 
      transparent: true, 
      opacity: 0.3, 
      metalness: 0.5, 
      roughness: 0.2,
      side: THREE.DoubleSide
  });
  disposables.push(headerGeo, headerMat);
  const dischargeHeader = new THREE.Mesh(headerGeo, headerMat);
  dischargeHeader.position.set(0, -1, -8);
  group.add(dischargeHeader);

  // 5. Flow Particles
  const pCount = 1000;
  const pGeo = new THREE.BufferGeometry();
  const pPos = new Float32Array(pCount * 3);
  const pLife = new Float32Array(pCount); // 0-1
  // Assign each particle to a pump lane (0-3) or header (4)
  const pLane = new Float32Array(pCount); 

  for(let i=0; i<pCount; i++) {
      pPos[i*3] = 0; pPos[i*3+1] = -100; pPos[i*3+2] = 0;
      pLife[i] = 0;
      pLane[i] = Math.floor(Math.random() * 5); // 0-3 pumps, 4 header
  }
  
  pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
  pGeo.setAttribute('life', new THREE.BufferAttribute(pLife, 1));
  pGeo.setAttribute('lane', new THREE.BufferAttribute(pLane, 1));

  const pMat = new THREE.PointsMaterial({ 
      color: 0x00ffff, 
      size: 0.15, 
      transparent: true, 
      opacity: 0.8,
      blending: THREE.AdditiveBlending 
  });
  disposables.push(pGeo, pMat);
  const particles = new THREE.Points(pGeo, pMat);
  group.add(particles);
  animatables.hpFlowParticles = particles;
};

export const animateHydroPumpScene = (animatables: SimAnimatables, time: number, simData: any) => {
    // simData: { pumps: boolean[] (status), flows: number[] (m3/h), efficiency: number[] }
    const pumpStatus = simData?.pumps || [false, false, false, false];
    const pumpFlows = simData?.flows || [0, 0, 0, 0];
    const pumpEffs = simData?.efficiency || [0, 0, 0, 0];

    // 1. Animate Pumps
    if (animatables.hpPumps && animatables.hpShafts) {
        animatables.hpPumps.forEach((grp, i) => {
            const isRunning = pumpStatus[i];
            const eff = pumpEffs[i];
            const motorMesh = grp.children[0] as THREE.Mesh;
            const shaftMesh = animatables.hpShafts![i];
            const valve = animatables.hpValves![i];

            if (isRunning) {
                // Spin shaft
                shaftMesh.rotation.y -= 0.5; // Fast spin

                // Color based on efficiency
                // >80 Green, 60-80 Yellow, <60 Red
                const mat = motorMesh.material as THREE.MeshStandardMaterial;
                if (eff > 80) mat.emissive.setHex(0x15803d); // Green
                else if (eff > 60) mat.emissive.setHex(0xeab308); // Yellow
                else mat.emissive.setHex(0xef4444); // Red
                mat.emissiveIntensity = 0.8;

                // Valve Open
                valve.children[1].rotation.z += 0.05; // Spin wheel illusion
            } else {
                // Stop
                const mat = motorMesh.material as THREE.MeshStandardMaterial;
                mat.emissive.setHex(0x000000);
            }
        });
    }

    // 2. Flow Particles
    if (animatables.hpFlowParticles) {
        const positions = animatables.hpFlowParticles.geometry.attributes.position.array as Float32Array;
        const lifes = animatables.hpFlowParticles.geometry.attributes.life.array as Float32Array;
        const lanes = animatables.hpFlowParticles.geometry.attributes.lane.array as Float32Array;
        
        const pumpSpacing = 8;

        for(let i=0; i<lifes.length; i++) {
            const lane = lanes[i];
            
            // Logic:
            // If lane 0-3: Check if that pump is running.
            // If running, spawn at pump, move to header.
            // If lane 4: Move along header if ANY pump is running.
            
            let isActive = false;
            let flowRate = 0;
            if (lane < 4) {
                isActive = pumpStatus[lane];
                flowRate = pumpFlows[lane] / 2000; // Normalize
            } else {
                // Header particles active if any pump active
                isActive = pumpStatus.some(s => s);
                flowRate = 0.5; // Avg speed in header
            }

            if (lifes[i] <= 0) {
                if (isActive && Math.random() < 0.1) {
                    lifes[i] = 1.0;
                    if (lane < 4) {
                        // Spawn at Pump Volute
                        const x = (lane - 1.5) * pumpSpacing;
                        positions[i*3] = x + (Math.random()-0.5);
                        positions[i*3+1] = -1; // Y
                        positions[i*3+2] = 0; // Z
                    } else {
                        // Spawn at start of header (far left)? Or from pump connections?
                        // Let's spawn them at pump-header junctions
                        const sourcePump = Math.floor(Math.random()*4);
                        if (pumpStatus[sourcePump]) {
                            const x = (sourcePump - 1.5) * pumpSpacing;
                            positions[i*3] = x;
                            positions[i*3+1] = -1;
                            positions[i*3+2] = -8; // Header Z
                        } else {
                            // If random source pump off, keep hidden
                             positions[i*3+1] = -100;
                             lifes[i] = 0;
                        }
                    }
                } else {
                    positions[i*3+1] = -100;
                }
            } else {
                // Move
                lifes[i] -= 0.01;
                
                if (lane < 4) {
                    // Move from Pump (Z=0) to Header (Z=-8)
                    positions[i*3+2] -= 0.2; 
                    // If hit header, maybe transfer to lane 4 behavior? 
                    // Visual simplification: just die at header
                    if (positions[i*3+2] < -8) lifes[i] = 0;
                } else {
                    // Move along header (X axis)
                    positions[i*3] += 0.3;
                    if (positions[i*3] > 25) lifes[i] = 0;
                }
            }
        }
        animatables.hpFlowParticles.geometry.attributes.position.needsUpdate = true;
    }
};
