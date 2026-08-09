
import * as THREE from 'three';
import { SimAnimatables } from './three-types';

export const initHydroTransitionScene = (
  group: THREE.Group,
  animatables: SimAnimatables,
  disposables: { dispose: () => void }[]
) => {
  // 1. Lighting (Cyber-Industrial)
  const ambient = new THREE.AmbientLight(0xffffff, 0.4);
  group.add(ambient);
  
  const mainSpot = new THREE.SpotLight(0x22d3ee, 2, 40, 0.5, 0.5);
  mainSpot.position.set(10, 15, 10);
  mainSpot.lookAt(0, 0, 0);
  group.add(mainSpot);
  
  const accentLight = new THREE.PointLight(0x8b5cf6, 1, 20);
  accentLight.position.set(-5, 0, -5);
  group.add(accentLight);

  // 2. Base Platform
  const baseGeo = new THREE.CylinderGeometry(8, 9, 2, 64);
  const baseMat = new THREE.MeshStandardMaterial({ 
      color: 0x0f172a, 
      roughness: 0.2, 
      metalness: 0.8 
  });
  disposables.push(baseGeo, baseMat);
  const base = new THREE.Mesh(baseGeo, baseMat);
  base.position.y = -6;
  group.add(base);

  // Grid
  const grid = new THREE.GridHelper(30, 30, 0x22d3ee, 0x1e293b);
  grid.position.y = -6;
  group.add(grid);

  // 3. Main Unit (Rotating Part)
  const shaftGroup = new THREE.Group();
  group.add(shaftGroup);
  animatables.transUnit = shaftGroup;

  // Shaft
  const shaftGeo = new THREE.CylinderGeometry(0.8, 0.8, 14, 32);
  const shaftMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.9, roughness: 0.2 });
  disposables.push(shaftGeo, shaftMat);
  const shaft = new THREE.Mesh(shaftGeo, shaftMat);
  shaftGroup.add(shaft);

  // Generator Rotor (Top)
  const rotorGroup = new THREE.Group();
  rotorGroup.position.y = 4;
  shaftGroup.add(rotorGroup);
  animatables.transRotor = rotorGroup; // Specifically for electrical effects

  const rotorGeo = new THREE.CylinderGeometry(4.5, 4.5, 2, 32);
  const rotorMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.6, roughness: 0.4 });
  disposables.push(rotorGeo, rotorMat);
  const rotorMain = new THREE.Mesh(rotorGeo, rotorMat);
  rotorGroup.add(rotorMain);
  
  // Rotor Poles (Details)
  const poleGeo = new THREE.BoxGeometry(0.8, 2.1, 0.5);
  const poleMat = new THREE.MeshStandardMaterial({ color: 0xb91c1c });
  disposables.push(poleGeo, poleMat);
  for(let i=0; i<16; i++) {
      const angle = (i / 16) * Math.PI * 2;
      const pole = new THREE.Mesh(poleGeo, poleMat);
      pole.position.set(Math.cos(angle)*4.2, 0, Math.sin(angle)*4.2);
      pole.rotation.y = -angle;
      rotorGroup.add(pole);
  }

  // Turbine Runner (Bottom)
  const runnerGroup = new THREE.Group();
  runnerGroup.position.y = -4;
  shaftGroup.add(runnerGroup);
  animatables.transTurbine = runnerGroup;

  const runnerGeo = new THREE.CylinderGeometry(3.5, 2, 2, 16);
  const runnerMat = new THREE.MeshStandardMaterial({ color: 0x0ea5e9, metalness: 0.5 });
  disposables.push(runnerGeo, runnerMat);
  const runnerMain = new THREE.Mesh(runnerGeo, runnerMat);
  runnerGroup.add(runnerMain);
  
  // Blades
  const bladeGeo = new THREE.BoxGeometry(0.2, 2, 1.5);
  const bladeMat = new THREE.MeshStandardMaterial({ color: 0x0284c7 });
  disposables.push(bladeGeo, bladeMat);
  for(let i=0; i<8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const blade = new THREE.Mesh(bladeGeo, bladeMat);
      blade.position.set(Math.cos(angle)*2.5, 0, Math.sin(angle)*2.5);
      blade.rotation.y = -angle + 0.5; // Curved
      runnerGroup.add(blade);
  }

  // 4. Stator (Stationary) - Wireframe
  const statorGeo = new THREE.CylinderGeometry(5, 5, 3, 32, 1, true);
  const statorMat = new THREE.MeshBasicMaterial({ color: 0x22d3ee, wireframe: true, transparent: true, opacity: 0.3 });
  disposables.push(statorGeo, statorMat);
  const stator = new THREE.Mesh(statorGeo, statorMat);
  stator.position.y = 4;
  group.add(stator);

  // 5. Wicket Gates (Guide Vanes) - Movable Ring
  const gatesGroup = new THREE.Group();
  gatesGroup.position.y = -4;
  group.add(gatesGroup);
  animatables.transGates = gatesGroup;

  const gateGeo = new THREE.BoxGeometry(0.1, 2, 1.2); // Vane
  const gateMat = new THREE.MeshStandardMaterial({ color: 0xfacc15 });
  disposables.push(gateGeo, gateMat);

  for(let i=0; i<24; i++) {
      const angle = (i / 24) * Math.PI * 2;
      const gate = new THREE.Mesh(gateGeo, gateMat);
      gate.position.set(Math.cos(angle)*4.5, 0, Math.sin(angle)*4.5);
      // Store initial rotation for animation
      gate.rotation.y = -angle; 
      gate.userData = { baseRot: -angle };
      gatesGroup.add(gate);
  }

  // 6. Spiral Case (Visual Flow Path)
  const spiralGeo = new THREE.TorusGeometry(6, 1.5, 16, 50, Math.PI * 1.8);
  spiralGeo.rotateX(Math.PI / 2);
  const spiralMat = new THREE.MeshBasicMaterial({ color: 0x1e3a8a, transparent: true, opacity: 0.2, wireframe: true });
  disposables.push(spiralGeo, spiralMat);
  const spiral = new THREE.Mesh(spiralGeo, spiralMat);
  spiral.position.y = -4;
  group.add(spiral);

  // 7. Flow Particles (Water)
  const pCount = 1000;
  const pGeo = new THREE.BufferGeometry();
  const pPos = new Float32Array(pCount * 3);
  const pLife = new Float32Array(pCount);
  
  for(let i=0; i<pCount; i++) {
      pPos[i*3] = 0; pPos[i*3+1] = -100; pPos[i*3+2] = 0; // Hidden
      pLife[i] = 0;
  }
  pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
  pGeo.setAttribute('life', new THREE.BufferAttribute(pLife, 1));
  
  const pMat = new THREE.PointsMaterial({ 
      color: 0x0ea5e9, 
      size: 0.15, 
      transparent: true, 
      opacity: 0.8,
      blending: THREE.AdditiveBlending 
  });
  disposables.push(pGeo, pMat);
  const particles = new THREE.Points(pGeo, pMat);
  group.add(particles);
  animatables.transFlow = particles;

  // 8. Electrical Sparks (Sync)
  const sCount = 100;
  const sGeo = new THREE.BufferGeometry();
  const sPos = new Float32Array(sCount * 3);
  
  // Need to set attribute or it will crash
  for(let i=0; i<sCount; i++) {
      sPos[i*3] = (Math.random()-0.5) * 5;
      sPos[i*3+1] = (Math.random()-0.5) * 1;
      sPos[i*3+2] = (Math.random()-0.5) * 5;
  }
  sGeo.setAttribute('position', new THREE.BufferAttribute(sPos, 3));

  const sMat = new THREE.PointsMaterial({ color: 0xffffff, size: 0.3, transparent: true, opacity: 0 });
  disposables.push(sGeo, sMat);
  const sparks = new THREE.Points(sGeo, sMat);
  sparks.position.y = 5.5; // Top of generator
  group.add(sparks);
  animatables.transSparks = sparks;

  // 9. Surge Tank Indicator (Bar)
  const surgeGeo = new THREE.BoxGeometry(2, 0.1, 2);
  const surgeMat = new THREE.MeshBasicMaterial({ color: 0x3b82f6, transparent: true, opacity: 0.5 });
  disposables.push(surgeGeo, surgeMat);
  const surgeLevel = new THREE.Mesh(surgeGeo, surgeMat);
  surgeLevel.position.set(-8, 0, -8);
  group.add(surgeLevel);
  animatables.transSurge = surgeLevel;
  
  // Surge Pipe container
  const surgePipe = new THREE.Mesh(
      new THREE.CylinderGeometry(1.5, 1.5, 15, 16, 1, true),
      new THREE.MeshBasicMaterial({ color: 0x64748b, wireframe: true, opacity: 0.2, transparent: true })
  );
  surgePipe.position.set(-8, 5, -8);
  group.add(surgePipe);
};

export const animateHydroTransitionScene = (animatables: SimAnimatables, time: number, simData: any) => {
    // simData: { rpm: 0-150, gate: 0-100, phase: 'STOP'|'START'|'SYNC'|'LOAD'|'REJECT', waterHammer: number }
    const rpm = simData?.rpm || 0;
    const gateOpen = simData?.gate || 0;
    const hammer = simData?.waterHammer || 0; // Pressure deviation
    const phase = simData?.phase || 'STOP';

    // 1. Rotation (RPM)
    if (animatables.transUnit) {
        // Visual speed scaling
        const rotSpeed = (rpm / 100) * 0.5;
        animatables.transUnit.rotation.y -= rotSpeed;
    }

    // 2. Gate Opening
    if (animatables.transGates) {
        animatables.transGates.children.forEach((g: any) => {
            // Open = rotate around own Y axis relative to radial
            // Base rot is radial. +20deg is open.
            const target = g.userData.baseRot + (gateOpen / 100) * 0.5;
            g.rotation.y = THREE.MathUtils.lerp(g.rotation.y, target, 0.1);
        });
    }

    // 3. Flow Particles
    if (animatables.transFlow) {
        const pos = animatables.transFlow.geometry.attributes.position.array as Float32Array;
        const life = animatables.transFlow.geometry.attributes.life.array as Float32Array;
        const mat = animatables.transFlow.material as THREE.PointsMaterial;
        
        // Intensity based on gate
        const flowRate = gateOpen / 100;
        mat.opacity = flowRate * 0.8;

        for(let i=0; i<life.length; i++) {
            life[i] -= 0.02 * (1 + flowRate); // Faster if more flow
            
            if (life[i] <= 0) {
                if (flowRate > 0.01) {
                    life[i] = 1.0;
                    // Spawn in spiral case
                    const angle = Math.random() * Math.PI * 2;
                    const r = 6 + Math.random();
                    pos[i*3] = Math.cos(angle) * r;
                    pos[i*3+1] = -4 + (Math.random()-0.5);
                    pos[i*3+2] = Math.sin(angle) * r;
                } else {
                    pos[i*3+1] = -100;
                }
            } else {
                // Spiral inward then drop
                const x = pos[i*3];
                const y = pos[i*3+1];
                const z = pos[i*3+2];
                
                const r = Math.sqrt(x*x + z*z);
                const angle = Math.atan2(z, x);
                
                // Tangential velocity
                const newAngle = angle - 0.1 * (1 + flowRate * 2);
                let newR = r;
                let newY = y;
                
                if (r > 3) {
                    newR -= 0.1 * flowRate; // Converge to runner
                } else {
                    newY -= 0.2 * flowRate; // Drop through draft tube
                }
                
                pos[i*3] = Math.cos(newAngle) * newR;
                pos[i*3+1] = newY;
                pos[i*3+2] = Math.sin(newAngle) * newR;
                
                if (newY < -10) life[i] = 0;
            }
        }
        animatables.transFlow.geometry.attributes.position.needsUpdate = true;
    }

    // 4. Surge Tank (Water Hammer Visual)
    if (animatables.transSurge) {
        // Base level 5. Add hammer effect.
        const surgeH = 5 + hammer * 2; // exaggerated
        animatables.transSurge.position.y = THREE.MathUtils.lerp(animatables.transSurge.position.y, surgeH, 0.1);
        
        // Color warning
        const mat = animatables.transSurge.material as THREE.MeshBasicMaterial;
        if (Math.abs(hammer) > 1) mat.color.setHex(0xff0000);
        else mat.color.setHex(0x3b82f6);
    }

    // 5. Sync Sparks
    if (animatables.transSparks) {
        const mat = animatables.transSparks.material as THREE.PointsMaterial;
        if (phase === 'SYNC') {
            mat.opacity = Math.random(); // Flicker
            const pos = animatables.transSparks.geometry.attributes.position.array as Float32Array;
            // Jitter
            for(let i=0; i<pos.length; i+=3) {
                pos[i] = (Math.random()-0.5) * 5;
                pos[i+1] = (Math.random()-0.5) * 1;
                pos[i+2] = (Math.random()-0.5) * 5;
            }
            animatables.transSparks.geometry.attributes.position.needsUpdate = true;
        } else {
            mat.opacity = 0;
        }
    }
};
