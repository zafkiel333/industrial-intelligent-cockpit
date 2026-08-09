
import * as THREE from 'three';
import { SimAnimatables } from './three-types';

export const initHydroGateScene = (
  group: THREE.Group,
  animatables: SimAnimatables,
  disposables: { dispose: () => void }[]
) => {
  // 1. Environment & Lighting
  const ambient = new THREE.AmbientLight(0xffffff, 0.4);
  group.add(ambient);
  const dirLight = new THREE.DirectionalLight(0xffffff, 1.2);
  dirLight.position.set(-10, 20, 10);
  group.add(dirLight);
  const underwaterLight = new THREE.PointLight(0x0ea5e9, 1, 30);
  underwaterLight.position.set(0, 5, 5);
  group.add(underwaterLight);

  // 2. Concrete Spillway Structure
  const concreteMat = new THREE.MeshStandardMaterial({ color: 0x64748b, roughness: 0.8 });
  disposables.push(concreteMat);
  
  // Floor
  const floorGeo = new THREE.BoxGeometry(20, 2, 40);
  disposables.push(floorGeo);
  const floor = new THREE.Mesh(floorGeo, concreteMat);
  floor.position.y = -1;
  group.add(floor);
  
  // Piers (Left & Right)
  const pierGeo = new THREE.BoxGeometry(2, 15, 20);
  disposables.push(pierGeo);
  const pierL = new THREE.Mesh(pierGeo, concreteMat);
  pierL.position.set(-8, 7.5, -5);
  group.add(pierL);
  const pierR = new THREE.Mesh(pierGeo, concreteMat);
  pierR.position.set(8, 7.5, -5);
  group.add(pierR);

  // 3. Radial Gate Assembly
  const gateGroup = new THREE.Group();
  // Pivot Point (Trunnion) is typically downstream and higher
  // Let's place pivot at (0, 8, 5)
  gateGroup.position.set(0, 8, 5); 
  group.add(gateGroup);
  animatables.gateRadial = gateGroup;

  // Skin Plate (Curved surface facing upstream)
  // Arc radius ~10m.
  const radius = 10;
  const width = 14;
  const arcLength = Math.PI / 3; // 60 degrees
  const skinGeo = new THREE.CylinderGeometry(radius, radius, width, 32, 8, true, Math.PI - arcLength/2, arcLength);
  skinGeo.rotateZ(Math.PI / 2); // Cylinder along X axis
  skinGeo.rotateY(Math.PI); // Face upstream
  // Offset so pivot is at origin of group
  // Cylinder origin is center. We need skin at radius distance.
  // Actually Cylinder geometry is centered on axis.
  // If we rotate it, the surface is at 'radius'.
  // We need to position geometry relative to pivot.
  // Pivot is center of cylinder.
  
  // To allow vertex coloring for stress, we need vertex colors attribute
  const count = skinGeo.attributes.position.count;
  skinGeo.setAttribute('color', new THREE.BufferAttribute(new Float32Array(count * 3), 3));
  
  const skinMat = new THREE.MeshStandardMaterial({ 
      color: 0x94a3b8, 
      vertexColors: true,
      roughness: 0.4,
      metalness: 0.6,
      side: THREE.DoubleSide
  });
  disposables.push(skinGeo, skinMat);
  
  const skin = new THREE.Mesh(skinGeo, skinMat);
  // Default orientation: Cylinder along Y. rotated Z90 -> Along X.
  // We want the arc to be in front of pivot. 
  // Pivot is (0,0,0). Skin is at Z = -radius?
  // No, Cylinder is the surface. So (0,0,0) is the axis.
  // We just need to rotate it so the arc segment faces -Z (upstream).
  skin.rotation.x = Math.PI / 2 + arcLength/2; 
  // With this rotation, the "opening" is up/down?
  // Let's reset and think: Cylinder along X.
  // Arc starts at angle.
  // We want arc to be roughly from Z = -radius, Y = -5 to Y=5?
  // Let's just adjust rotation trial/error logic or standard math:
  // ThetaStart = PI, Length = PI/3. This puts arc at back (-Z).
  // This looks correct relative to pivot.
  gateGroup.add(skin);
  animatables.gateSkinPlate = skin;

  // Arms (Struts)
  const armMat = new THREE.MeshStandardMaterial({ color: 0x475569 });
  disposables.push(armMat);
  const armGeo = new THREE.BoxGeometry(0.5, 0.5, radius - 0.5);
  disposables.push(armGeo);
  
  // Create 4 arms
  [-6, -2, 2, 6].forEach(x => {
      const armTop = new THREE.Mesh(armGeo, armMat);
      armTop.position.set(x, 0, 0);
      // Point towards top of skin
      armTop.lookAt(x, -radius * Math.sin(arcLength/2), -radius * Math.cos(arcLength/2)); // Rough approx
      // Actually simpler:
      // Skin center is at radius.
      // Top of skin: Y relative to pivot is negative?
      // Let's use simple rotation for arms
      armTop.rotation.x = 0.4;
      armTop.position.set(x, -1, -radius/2);
      gateGroup.add(armTop);

      const armBot = new THREE.Mesh(armGeo, armMat);
      armBot.position.set(x, -1, -radius/2);
      armBot.rotation.x = -0.4;
      gateGroup.add(armBot);
  });

  // Trunnion (Pivot)
  const trunnionGeo = new THREE.CylinderGeometry(0.8, 0.8, 16, 16);
  trunnionGeo.rotateZ(Math.PI / 2);
  const trunnionMat = new THREE.MeshStandardMaterial({ color: 0x334155 });
  disposables.push(trunnionGeo, trunnionMat);
  const trunnion = new THREE.Mesh(trunnionGeo, trunnionMat);
  gateGroup.add(trunnion);
  animatables.gateTrunnion = trunnion;

  // 4. Hydraulic Cylinders (Lifting Mechanism)
  const cylGroup = new THREE.Group();
  group.add(cylGroup);
  
  const cylBodyGeo = new THREE.CylinderGeometry(0.4, 0.4, 6);
  const pistonGeo = new THREE.CylinderGeometry(0.2, 0.2, 6);
  const cylMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b }); // Orange
  disposables.push(cylBodyGeo, pistonGeo, cylMat);

  // Left Cylinder
  const cylL = new THREE.Mesh(cylBodyGeo, cylMat);
  cylL.position.set(-7.5, 12, 0); // Mounted on pier
  cylGroup.add(cylL);
  const pistL = new THREE.Mesh(pistonGeo, new THREE.MeshStandardMaterial({color: 0xcccccc}));
  pistL.position.set(0, -3, 0);
  cylL.add(pistL);

  // Right Cylinder
  const cylR = new THREE.Mesh(cylBodyGeo, cylMat);
  cylR.position.set(7.5, 12, 0);
  cylGroup.add(cylR);
  const pistR = new THREE.Mesh(pistonGeo, new THREE.MeshStandardMaterial({color: 0xcccccc}));
  pistR.position.set(0, -3, 0);
  cylR.add(pistR);

  animatables.gateHydraulicCylinders = [cylL, cylR];

  // 5. Water Bodies
  const waterMat = new THREE.MeshPhysicalMaterial({ 
      color: 0x0ea5e9, 
      transparent: true, 
      opacity: 0.7, 
      roughness: 0.1,
      metalness: 0.1,
      transmission: 0.4
  });
  disposables.push(waterMat);

  // Upstream
  const upWater = new THREE.Mesh(new THREE.BoxGeometry(14, 10, 20), waterMat);
  upWater.position.set(0, 5, -15);
  group.add(upWater);
  animatables.gateUpstreamSurface = upWater;

  // Downstream
  const downWater = new THREE.Mesh(new THREE.BoxGeometry(14, 2, 20), waterMat);
  downWater.position.set(0, 1, 15);
  group.add(downWater);
  animatables.gateDownstreamSurface = downWater;

  // 6. Flow Particles
  const pCount = 2000;
  const pGeo = new THREE.BufferGeometry();
  const pPos = new Float32Array(pCount * 3);
  const pVel = new Float32Array(pCount * 3);
  const pLife = new Float32Array(pCount);
  
  for(let i=0; i<pCount; i++) {
      pPos[i*3] = (Math.random() - 0.5) * 14;
      pPos[i*3+1] = Math.random() * 10;
      pPos[i*3+2] = -20 + Math.random() * 10; // Start upstream
      pLife[i] = Math.random();
  }
  pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
  pGeo.setAttribute('velocity', new THREE.BufferAttribute(pVel, 3));
  pGeo.setAttribute('life', new THREE.BufferAttribute(pLife, 1));

  const pMat = new THREE.PointsMaterial({ color: 0xcffafe, size: 0.15, transparent: true, opacity: 0.6 });
  disposables.push(pGeo, pMat);
  const flow = new THREE.Points(pGeo, pMat);
  group.add(flow);
  animatables.gateFlowParticles = flow;

  // 7. Vortices (Turbulence indicators downstream)
  const vortexGroup = new THREE.Group();
  group.add(vortexGroup);
  animatables.gateVortices = vortexGroup;
  
  const ringGeo = new THREE.RingGeometry(0.5, 0.6, 16);
  ringGeo.rotateX(-Math.PI/2);
  const ringMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.0 });
  disposables.push(ringGeo, ringMat);

  for(let i=0; i<10; i++) {
      const ring = new THREE.Mesh(ringGeo, ringMat.clone());
      ring.position.set((Math.random()-0.5)*12, 1, 8 + Math.random()*10);
      vortexGroup.add(ring);
  }
};

export const animateHydroGateScene = (animatables: SimAnimatables, time: number, simData: any) => {
    // simData: { opening: 0-100, headLevel: number }
    const openingPct = simData?.opening || 0;
    const headLevel = simData?.headLevel || 10; // Water depth upstream

    // 1. Gate Rotation
    if (animatables.gateRadial) {
        // Closed angle approx 0 (skin bottom at floor)
        // Max open angle approx 45 deg (0.8 rad)
        const targetRot = (openingPct / 100) * 0.8;
        animatables.gateRadial.rotation.x = THREE.MathUtils.lerp(animatables.gateRadial.rotation.x, -targetRot, 0.05);
    }

    // 2. Hydraulic Cylinder Movement
    if (animatables.gateHydraulicCylinders) {
        // Piston extension follows gate rotation
        const ext = (openingPct / 100) * 2;
        animatables.gateHydraulicCylinders.forEach(cyl => {
            const piston = cyl.children[0];
            piston.position.y = -3 + ext;
            // Angle cylinder to follow connection point (simplified lookAt logic could be added)
            cyl.rotation.x = - (openingPct/100) * 0.2;
        });
    }

    // 3. Water Levels
    if (animatables.gateUpstreamSurface) {
        const h = Math.max(0.1, headLevel);
        animatables.gateUpstreamSurface.scale.y = h / 10; // Base height 10
        animatables.gateUpstreamSurface.position.y = h / 2;
    }
    
    if (animatables.gateDownstreamSurface) {
        // Tailwater rises with opening
        const tailH = 2 + (openingPct / 100) * 3;
        animatables.gateDownstreamSurface.scale.y = tailH / 2;
        animatables.gateDownstreamSurface.position.y = tailH / 2;
        
        // Turbulence wave effect
        animatables.gateDownstreamSurface.scale.y += Math.sin(time * 5) * 0.05 * (openingPct/100);
    }

    // 4. Flow Particles & FSI
    if (animatables.gateFlowParticles) {
        const positions = animatables.gateFlowParticles.geometry.attributes.position.array as Float32Array;
        const velocities = animatables.gateFlowParticles.geometry.attributes.velocity.array as Float32Array;
        const lifes = animatables.gateFlowParticles.geometry.attributes.life.array as Float32Array;
        
        const gateBottomY = (openingPct / 100) * 5; // Approx clearance
        
        for(let i=0; i<lifes.length; i++) {
            if (lifes[i] <= 0) {
                // Respawn Upstream
                lifes[i] = 1.0;
                positions[i*3] = (Math.random() - 0.5) * 14;
                positions[i*3+1] = Math.random() * headLevel;
                positions[i*3+2] = -15 + Math.random() * 5;
                
                velocities[i*3] = 0;
                velocities[i*3+1] = 0;
                velocities[i*3+2] = 0.1 + Math.random() * 0.1;
            } else {
                lifes[i] -= 0.01;
                const x = positions[i*3];
                const y = positions[i*3+1];
                const z = positions[i*3+2];

                // Physics Field
                if (z < -2) {
                    // Upstream approach
                    velocities[i*3+2] += 0.01; // Accelerate towards gate
                    // Converge to opening
                    if (y > gateBottomY) {
                         velocities[i*3+1] -= 0.05; // Dive down
                    }
                } else if (z < 2) {
                    // Under Gate (Throat)
                    if (y > gateBottomY) {
                        // Collision with gate
                        positions[i*3+1] = gateBottomY - Math.random(); // Force down
                        velocities[i*3+2] += 0.5; // Jet acceleration
                    } else {
                        velocities[i*3+2] += 0.2; // Jet
                    }
                } else {
                    // Downstream (Turbulence)
                    velocities[i*3+2] *= 0.95; // Drag
                    // Hydraulic Jump
                    if (z > 5 && z < 15 && velocities[i*3+2] > 0.5) {
                         velocities[i*3+1] += 0.2; // Jump up
                         velocities[i*3+2] *= 0.8;
                         lifes[i] -= 0.02; // Spray dies faster
                    }
                }

                positions[i*3] += velocities[i*3];
                positions[i*3+1] += velocities[i*3+1];
                positions[i*3+2] += velocities[i*3+2];

                // Floor constraint
                if (positions[i*3+1] < 0) {
                    positions[i*3+1] = 0;
                    velocities[i*3+1] = 0;
                }
            }
        }
        animatables.gateFlowParticles.geometry.attributes.position.needsUpdate = true;
    }

    // 5. Stress Visualization on Gate
    if (animatables.gateSkinPlate) {
        const geo = animatables.gateSkinPlate.geometry;
        const colors = geo.attributes.color;
        const pos = geo.attributes.position;
        
        // High pressure at bottom of gate (High Y in local cylinder space before rotation? No, check world Y)
        // We need to map vertex position to height.
        // Since geometry rotates, we rely on local coords relative to pivot logic
        
        const cBlue = new THREE.Color(0x3b82f6); // Low stress
        const cRed = new THREE.Color(0xef4444);   // High stress
        
        // Stress is prop to (Head - Y)
        // Gate bottom is under most stress when closed and head is high
        
        // Simple visual hack: static gradient that intensifies with headLevel
        const stressIntensity = headLevel / 15;
        
        for(let i=0; i<pos.count; i++) {
            // In cylinder geometry, vertices with lower angular position (bottom of arc) have high stress
            // This is complex to map perfectly dynamically without more context.
            // Let's just make the whole gate turn redder as Head increases.
            const t = stressIntensity * (0.5 + Math.sin(i * 0.1 + time) * 0.1); // Add shimmy
            const c = cBlue.clone().lerp(cRed, t);
            colors.setXYZ(i, c.r, c.g, c.b);
        }
        colors.needsUpdate = true;
    }

    // 6. Vortex Animation
    if (animatables.gateVortices) {
        animatables.gateVortices.children.forEach((v: any, i) => {
             // Only visible if flow is high
             const flowRate = openingPct * Math.sqrt(headLevel);
             const targetOpacity = flowRate > 100 ? 0.4 : 0;
             
             v.material.opacity = THREE.MathUtils.lerp(v.material.opacity, targetOpacity, 0.1);
             v.rotation.z += 0.1 * (i % 2 === 0 ? 1 : -1);
             v.scale.setScalar(1 + Math.sin(time * 5 + i) * 0.5);
             v.position.z -= 0.1;
             if (v.position.z < 5) v.position.z = 20; // Loop
        });
    }
};
