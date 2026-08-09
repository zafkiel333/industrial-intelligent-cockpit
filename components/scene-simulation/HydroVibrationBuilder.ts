
import * as THREE from 'three';
import { SimAnimatables } from './three-types';

export const initHydroVibrationScene = (
  group: THREE.Group,
  animatables: SimAnimatables,
  disposables: { dispose: () => void }[]
) => {
  // 1. Lighting (Analytical Studio)
  const ambient = new THREE.AmbientLight(0xffffff, 0.4);
  group.add(ambient);
  const spot = new THREE.SpotLight(0x8b5cf6, 2, 60);
  spot.position.set(10, 20, 15);
  spot.lookAt(0, 0, 0);
  group.add(spot);
  const blueBack = new THREE.PointLight(0x06b6d4, 0.8, 30);
  blueBack.position.set(-10, 5, -10);
  group.add(blueBack);

  // 2. Concrete Channel Structure
  const wallMat = new THREE.MeshStandardMaterial({ 
      color: 0x1e293b, 
      roughness: 0.8,
      metalness: 0.2
  });
  const wallGeo = new THREE.BoxGeometry(4, 15, 20);
  disposables.push(wallMat, wallGeo);

  const leftWall = new THREE.Mesh(wallGeo, wallMat);
  leftWall.position.set(-8, 2.5, 0);
  group.add(leftWall);

  const rightWall = new THREE.Mesh(wallGeo, wallMat);
  rightWall.position.set(8, 2.5, 0);
  group.add(rightWall);

  const floorGeo = new THREE.BoxGeometry(20, 2, 30);
  disposables.push(floorGeo);
  const floor = new THREE.Mesh(floorGeo, wallMat);
  floor.position.y = -6;
  group.add(floor);

  // 3. Vibrating Sluice Gate (The Subject)
  // Use a segmented plane for the skin plate to allow vertex deformation
  const gateW = 12;
  const gateH = 10;
  const segW = 16;
  const segH = 16;
  const skinGeo = new THREE.PlaneGeometry(gateW, gateH, segW, segH);
  
  // Store initial positions for vibration calc
  const pos = skinGeo.attributes.position;
  const initialPos = new Float32Array(pos.count * 3);
  const colors = new Float32Array(pos.count * 3);
  for(let i=0; i<pos.count; i++) {
      initialPos[i*3] = pos.getX(i);
      initialPos[i*3+1] = pos.getY(i);
      initialPos[i*3+2] = pos.getZ(i);
      // Init grey
      colors[i*3] = 0.5; colors[i*3+1] = 0.5; colors[i*3+2] = 0.5;
  }
  skinGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  skinGeo.userData = { initialPos };

  const skinMat = new THREE.MeshStandardMaterial({ 
      vertexColors: true,
      roughness: 0.4, 
      metalness: 0.7,
      side: THREE.DoubleSide
  });
  const wireMat = new THREE.MeshBasicMaterial({ 
      color: 0x8b5cf6, 
      wireframe: true, 
      transparent: true, 
      opacity: 0.2 
  });
  
  disposables.push(skinGeo, skinMat, wireMat);
  
  const gate = new THREE.Mesh(skinGeo, skinMat);
  const gateWire = new THREE.Mesh(skinGeo, wireMat);
  gateWire.position.z = 0.05; // Prevent z-fight
  
  gate.add(gateWire);
  group.add(gate);
  animatables.hvGate = gate;

  // Add Girder Structure (Static relative to gate plane)
  // We'll just parent them to the gate mesh so they move if gate moves (though we deform vertices)
  // Deforming vertices won't move children, so girders might look detached if deformation is large.
  // For simulation, we'll keep girders simple or just texture.

  // 4. Flow Arrows (Hydrodynamic Load)
  animatables.hvVectors = [];
  const arrowDir = new THREE.Vector3(0, 0, -1);
  const arrowLen = 2;
  for(let x=-4; x<=4; x+=2) {
      for(let y=-3; y<=3; y+=2) {
          const origin = new THREE.Vector3(x, y, 4); // Upstream
          const arrow = new THREE.ArrowHelper(arrowDir, origin, arrowLen, 0x06b6d4, 0.5, 0.3);
          group.add(arrow);
          animatables.hvVectors.push(arrow);
      }
  }

  // 5. Water Flow Particles
  const pCount = 1000;
  const pGeo = new THREE.BufferGeometry();
  const pPos = new Float32Array(pCount * 3);
  for(let i=0; i<pCount; i++) {
      pPos[i*3] = (Math.random()-0.5) * 12;
      pPos[i*3+1] = (Math.random()-0.5) * 8 - 1;
      pPos[i*3+2] = 5 + Math.random() * 10;
  }
  pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
  const pMat = new THREE.PointsMaterial({ color: 0xa5f3fc, size: 0.1, transparent: true, opacity: 0.5 });
  disposables.push(pGeo, pMat);
  const particles = new THREE.Points(pGeo, pMat);
  group.add(particles);
  animatables.hvParticles = particles;

  // 6. Virtual Sensors (Laser Vibrometers)
  animatables.hvSensorPoints = [];
  const sGeo = new THREE.SphereGeometry(0.15);
  const sMat = new THREE.MeshBasicMaterial({ color: 0xff0000 });
  disposables.push(sGeo, sMat);
  
  // 3 Points: Top-Mid, Center, Bottom-Mid
  const sPos = [{x:0, y:4}, {x:0, y:0}, {x:0, y:-4}];
  sPos.forEach(p => {
      const sGroup = new THREE.Group();
      sGroup.position.set(p.x, p.y, 0.1);
      const mesh = new THREE.Mesh(sGeo, sMat);
      sGroup.add(mesh);
      // Beam line
      const lineGeo = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0,0,0), new THREE.Vector3(0,0,5)]);
      const lineMat = new THREE.LineBasicMaterial({ color: 0xff0000, transparent: true, opacity: 0.3 });
      disposables.push(lineGeo, lineMat);
      const line = new THREE.Line(lineGeo, lineMat);
      sGroup.add(line);

      gate.add(sGroup); // Move with gate parent
      animatables.hvSensorPoints?.push(sGroup);
  });
};

export const animateHydroVibrationScene = (animatables: SimAnimatables, time: number, simData: any) => {
    // simData: { amplitude: number, frequency: number, mode: number (1,2,3), flowSpeed: number }
    const amp = simData?.amplitude || 0; // Visual scale
    const freq = simData?.frequency || 1;
    const mode = simData?.mode || 1;
    const flowSpeed = simData?.flowSpeed || 1;

    // 1. Deform Gate (Vibration)
    if (animatables.hvGate) {
        const geo = animatables.hvGate.geometry;
        const pos = geo.attributes.position;
        const initial = geo.userData.initialPos;
        const colors = geo.attributes.color;

        const cCool = new THREE.Color(0x64748b);
        const cStress = new THREE.Color(0x8b5cf6);
        const cCrit = new THREE.Color(0xff0055);

        // Current phase of vibration
        const phase = Math.sin(time * freq * 10); 

        for(let i=0; i<pos.count; i++) {
            const ix = initial[i*3];
            const iy = initial[i*3+1];
            const iz = initial[i*3+2];

            // Mode Shape Functions (Simplified)
            let displacement = 0;
            if (mode === 1) {
                // Mode 1: Simple Bending (cantilever or pinned-pinned)
                // Max at center
                displacement = Math.cos((iy / 5) * Math.PI / 2); 
            } else if (mode === 2) {
                // Mode 2: Torsional / 2nd Bending
                displacement = Math.sin((iy / 5) * Math.PI);
            } else {
                // Mode 3: Plate mode (checkered)
                displacement = Math.sin((ix / 6) * Math.PI) * Math.cos((iy / 5) * Math.PI);
            }

            const val = displacement * phase * amp;
            pos.setZ(i, iz + val);

            // Color based on local stress (proportional to curvature/displacement abs)
            const stress = Math.abs(val) / 0.5; // Norm
            let c = cCool.clone();
            if (stress > 0.3) c.lerp(cStress, (stress-0.3)/0.4);
            if (stress > 0.7) c.lerp(cCrit, (stress-0.7)/0.3);
            
            colors.setXYZ(i, c.r, c.g, c.b);
        }
        pos.needsUpdate = true;
        colors.needsUpdate = true;
    }

    // 2. Flow Particles
    if (animatables.hvParticles) {
        const pos = animatables.hvParticles.geometry.attributes.position.array as Float32Array;
        for(let i=0; i<pos.length; i+=3) {
            pos[i+2] -= 0.1 * flowSpeed; // Move -Z (towards gate)
            
            // Deflect/Reset
            if (pos[i+2] < 1) { // Hit gate plane approx
                 pos[i+2] = 15;
                 pos[i] = (Math.random()-0.5) * 12;
                 pos[i+1] = (Math.random()-0.5) * 8 - 1;
            }
        }
        animatables.hvParticles.geometry.attributes.position.needsUpdate = true;
    }

    // 3. Force Vectors Pulse
    if (animatables.hvVectors) {
        animatables.hvVectors.forEach((arr, i) => {
            // Pulse length based on flow pulsation
            const pulsate = 1 + Math.sin(time * 5 + i) * 0.2 * (flowSpeed/5);
            arr.setLength(2 * pulsate, 0.5, 0.3);
        });
    }
};
