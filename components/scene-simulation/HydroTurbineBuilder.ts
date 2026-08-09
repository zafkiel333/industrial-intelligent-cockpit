
import * as THREE from 'three';
import { SimAnimatables } from './three-types';

export const initHydroTurbineScene = (
  group: THREE.Group,
  animatables: SimAnimatables,
  disposables: { dispose: () => void }[]
) => {
  // 1. Lighting (Studio Setup)
  const ambient = new THREE.AmbientLight(0xffffff, 0.4);
  group.add(ambient);
  const spot1 = new THREE.SpotLight(0x22d3ee, 2, 50);
  spot1.position.set(10, 10, 10);
  spot1.lookAt(0, 0, 0);
  group.add(spot1);
  const spot2 = new THREE.SpotLight(0x0ea5e9, 1, 50);
  spot2.position.set(-10, -5, 10);
  group.add(spot2);

  // 2. Spiral Case (Volute) - Transparent
  // Creating a decreasing radius tube path
  const spiralPoints = [];
  for (let i = 0; i <= 60; i++) {
      const t = i / 60;
      const angle = t * Math.PI * 2 * 0.9; // Not full circle
      const radius = 8 - t * 4; // Decreasing radius
      // Spiral downwards slightly? No, usually flat then enters stay ring.
      spiralPoints.push(new THREE.Vector3(Math.cos(angle)*radius, 0, Math.sin(angle)*radius));
  }
  const spiralCurve = new THREE.CatmullRomCurve3(spiralPoints);
  
  // Custom tube geometry with varying radius would be ideal, but standard tube is constant radius.
  // We will scale the mesh along the path. Or use many segments.
  // For simplicity: Constant radius tube for now, but use opacity to show flow.
  const voluteGeo = new THREE.TubeGeometry(spiralCurve, 64, 2, 16, false);
  const voluteMat = new THREE.MeshPhysicalMaterial({ 
      color: 0x9ca3af, 
      roughness: 0.1, 
      metalness: 0.8,
      transparent: true,
      opacity: 0.15,
      side: THREE.DoubleSide
  });
  disposables.push(voluteGeo, voluteMat);
  const volute = new THREE.Mesh(voluteGeo, voluteMat);
  group.add(volute);
  animatables.htSpiralCase = volute;

  // 3. Stay Vanes (Fixed)
  const stayRingGroup = new THREE.Group();
  group.add(stayRingGroup);
  animatables.htStayVanes = stayRingGroup;
  
  const vaneGeo = new THREE.BoxGeometry(0.5, 2, 0.1);
  const vaneMat = new THREE.MeshStandardMaterial({ color: 0x475569 });
  disposables.push(vaneGeo, vaneMat);

  for(let i=0; i<20; i++) {
      const angle = (i / 20) * Math.PI * 2;
      const r = 4.5;
      const vane = new THREE.Mesh(vaneGeo, vaneMat);
      vane.position.set(Math.cos(angle)*r, 0, Math.sin(angle)*r);
      vane.rotation.y = -angle + 0.5; // Angled flow
      stayRingGroup.add(vane);
  }

  // 4. Guide Vanes (Movable)
  const guideRingGroup = new THREE.Group();
  group.add(guideRingGroup);
  animatables.htGuideVanes = guideRingGroup;
  
  const gVaneGeo = new THREE.BoxGeometry(0.8, 1.8, 0.1); // Teardrop shape ideal, box for now
  const gVaneMat = new THREE.MeshStandardMaterial({ color: 0xfacc15 }); // Gold
  disposables.push(gVaneGeo, gVaneMat);

  for(let i=0; i<24; i++) {
      const angle = (i / 24) * Math.PI * 2;
      const r = 3.5;
      const vane = new THREE.Mesh(gVaneGeo, gVaneMat);
      vane.position.set(Math.cos(angle)*r, 0, Math.sin(angle)*r);
      // Initial rotation radial
      vane.rotation.y = -angle; 
      // Store initial angle for animation
      vane.userData = { baseAngle: -angle };
      guideRingGroup.add(vane);
  }

  // 5. Runner (Francis)
  const runnerGroup = new THREE.Group();
  group.add(runnerGroup);
  animatables.htRunner = runnerGroup;
  
  // Hub
  const hubGeo = new THREE.CylinderGeometry(1, 1.5, 2, 32);
  const hubMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.8, roughness: 0.3 });
  disposables.push(hubGeo, hubMat);
  const hub = new THREE.Mesh(hubGeo, hubMat);
  runnerGroup.add(hub);
  
  // Blades (Curved)
  const bladeGeo = new THREE.BoxGeometry(1.5, 2, 0.1);
  const bladeMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.5 });
  disposables.push(bladeGeo, bladeMat);
  
  for(let i=0; i<13; i++) {
      const angle = (i / 13) * Math.PI * 2;
      const blade = new THREE.Mesh(bladeGeo, bladeMat);
      blade.position.set(Math.cos(angle)*2, 0, Math.sin(angle)*2);
      blade.rotation.y = -angle + 0.5;
      blade.rotation.x = 0.2; // Twist
      runnerGroup.add(blade);
  }

  // Shaft
  const shaftGeo = new THREE.CylinderGeometry(0.5, 0.5, 5, 16);
  disposables.push(shaftGeo);
  const shaft = new THREE.Mesh(shaftGeo, hubMat);
  shaft.position.y = 3.5;
  runnerGroup.add(shaft);

  // 6. Draft Tube (Elbow)
  const draftGeo = new THREE.CylinderGeometry(2, 4, 6, 32, 4, true);
  draftGeo.translate(0, -3, 0); // Start below runner
  const draftMat = new THREE.MeshBasicMaterial({ 
      color: 0x06b6d4, 
      transparent: true, 
      opacity: 0.1, 
      wireframe: true 
  });
  disposables.push(draftGeo, draftMat);
  const draft = new THREE.Mesh(draftGeo, draftMat);
  group.add(draft);
  animatables.htDraftTube = draft;

  // 7. Flow Particles (Complex Path)
  const pCount = 2000;
  const pGeo = new THREE.BufferGeometry();
  const pPos = new Float32Array(pCount * 3);
  const pLife = new Float32Array(pCount); // 0-1
  const pPhase = new Float32Array(pCount); // 0=Spiral, 1=Runner, 2=Draft
  
  for(let i=0; i<pCount; i++) {
      pPos[i*3] = 0; pPos[i*3+1] = 0; pPos[i*3+2] = 0;
      pLife[i] = Math.random();
      pPhase[i] = 0; // All start in spiral
  }
  pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
  pGeo.setAttribute('life', new THREE.BufferAttribute(pLife, 1));
  pGeo.setAttribute('phase', new THREE.BufferAttribute(pPhase, 1));
  
  const pMat = new THREE.PointsMaterial({ 
      color: 0x00ffff, 
      size: 0.15, 
      transparent: true, 
      opacity: 0.8,
      blending: THREE.AdditiveBlending 
  });
  disposables.push(pGeo, pMat);
  const flow = new THREE.Points(pGeo, pMat);
  group.add(flow);
  animatables.htFlowParticles = flow;

  // 8. Cavitation Bubbles (Indicator)
  const cGeo = new THREE.BufferGeometry();
  const cPos = new Float32Array(500 * 3);
  cGeo.setAttribute('position', new THREE.BufferAttribute(cPos, 3));
  const cMat = new THREE.PointsMaterial({ color: 0xffffff, size: 0.2, transparent: true, opacity: 0 });
  disposables.push(cGeo, cMat);
  const cav = new THREE.Points(cGeo, cMat);
  group.add(cav);
  animatables.htCavitationBubbles = cav;
};

export const animateHydroTurbineScene = (animatables: SimAnimatables, time: number, simData: any) => {
    // simData: { rpm: number, guideVaneOpen: 0-100, cavitation: number (0-1) }
    const rpm = simData?.rpm || 100;
    const gvOpen = simData?.guideVaneOpen || 50;
    const cavitation = simData?.cavitation || 0;

    // 1. Runner Rotation
    if (animatables.htRunner) {
        // RPM to rad/s roughly for visual
        const speed = rpm * 0.002; 
        animatables.htRunner.rotation.y -= speed;
    }

    // 2. Guide Vane Opening
    if (animatables.htGuideVanes) {
        const vanes = animatables.htGuideVanes.children;
        // 0% open = tangent (closed), 100% open = radial
        // Base angle is radial.
        // Closed angle offset approx 70 deg (1.2 rad)
        const angleOffset = (1 - gvOpen/100) * 1.2;
        
        vanes.forEach((v: any) => {
            v.rotation.y = v.userData.baseAngle + angleOffset;
        });
    }

    // 3. Flow Particles
    if (animatables.htFlowParticles) {
        const positions = animatables.htFlowParticles.geometry.attributes.position.array as Float32Array;
        const lifes = animatables.htFlowParticles.geometry.attributes.life.array as Float32Array;
        const phases = animatables.htFlowParticles.geometry.attributes.phase.array as Float32Array;
        const count = lifes.length;
        
        // Speed scaling
        const flowSpeed = (rpm / 200) * 0.05 + 0.01;

        for(let i=0; i<count; i++) {
            lifes[i] += flowSpeed;
            if (lifes[i] > 1) {
                lifes[i] = 0;
                phases[i] = 0; // Reset to start
            }

            let t = lifes[i];
            let x = positions[i*3];
            let y = positions[i*3+1];
            let z = positions[i*3+2];

            // Simulation of path: Spiral -> Runner -> Draft Tube
            if (t < 0.4) {
                // Spiral Phase (0 to 0.4)
                // Radius decreases, Angle increases
                const st = t / 0.4;
                const r = 8 - st * 4; // 8 to 4
                const ang = st * Math.PI * 1.5;
                x = Math.cos(ang) * r;
                z = Math.sin(ang) * r;
                y = (Math.random() - 0.5) * 1.5;
            } else if (t < 0.6) {
                // Runner Entry Phase (0.4 to 0.6)
                // Rapid swirl down
                const st = (t - 0.4) / 0.2;
                const r = 4 - st * 2; // 4 to 2
                const ang = 1.5 * Math.PI + st * Math.PI * 4; // Fast spin
                x = Math.cos(ang) * r;
                z = Math.sin(ang) * r;
                y = -st * 2; // Drop 0 to -2
            } else {
                // Draft Tube Phase (0.6 to 1.0)
                // Expand and drop
                const st = (t - 0.6) / 0.4;
                const r = 2 + st * 2; // 2 to 4
                // Less spin
                const ang = (1.5 + 4) * Math.PI + st * Math.PI; 
                x = Math.cos(ang) * r;
                z = Math.sin(ang) * r;
                y = -2 - st * 6; // -2 to -8
            }

            positions[i*3] = x;
            positions[i*3+1] = y;
            positions[i*3+2] = z;
        }
        animatables.htFlowParticles.geometry.attributes.position.needsUpdate = true;
    }

    // 4. Cavitation Bubbles (Visualizing Low Pressure zones)
    if (animatables.htCavitationBubbles) {
        const mat = animatables.htCavitationBubbles.material as THREE.PointsMaterial;
        if (cavitation > 0.1) {
            mat.opacity = cavitation * 0.8;
            const positions = animatables.htCavitationBubbles.geometry.attributes.position.array as Float32Array;
            
            // Concentrate bubbles on blade trailing edges (approx)
            // Just random cloud near runner bottom
            for(let i=0; i<positions.length/3; i++) {
                const angle = Math.random() * Math.PI * 2 + time * rpm * 0.01;
                const r = 1.5 + Math.random();
                positions[i*3] = Math.cos(angle) * r;
                positions[i*3+1] = -1.5 + (Math.random()-0.5); // Bottom of runner
                positions[i*3+2] = Math.sin(angle) * r;
            }
            animatables.htCavitationBubbles.geometry.attributes.position.needsUpdate = true;
        } else {
            mat.opacity = 0;
        }
    }
};
