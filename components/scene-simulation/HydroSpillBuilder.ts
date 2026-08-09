
import * as THREE from 'three';
import { SimAnimatables } from './three-types';

export const initHydroSpillScene = (
  group: THREE.Group,
  animatables: SimAnimatables,
  disposables: { dispose: () => void }[]
) => {
  // 1. Lighting
  const ambient = new THREE.AmbientLight(0xffffff, 0.4);
  group.add(ambient);
  const dirLight = new THREE.DirectionalLight(0xffffff, 1.2);
  dirLight.position.set(10, 20, 15);
  group.add(dirLight);

  // 2. Spillway Structure (Ogee Profile + Chute + Flip Bucket)
  const damShape = new THREE.Shape();
  damShape.moveTo(-5, 0); // Heel
  damShape.lineTo(0, 15); // Crest Top
  // Ogee Curve
  damShape.bezierCurveTo(2, 15, 3, 14, 4, 12);
  // Chute Slope
  damShape.lineTo(15, 2); 
  // Flip Bucket
  damShape.bezierCurveTo(16, 1.5, 17, 2, 17.5, 3);
  // Base
  damShape.lineTo(17.5, 0);
  damShape.lineTo(-5, 0);

  const damGeo = new THREE.ExtrudeGeometry(damShape, {
      depth: 6,
      bevelEnabled: false,
      curveSegments: 20
  });
  damGeo.translate(0, 0, -3); // Center width

  const damMat = new THREE.MeshStandardMaterial({ 
      color: 0x64748b, 
      roughness: 0.7,
      flatShading: true
  });
  const wireMat = new THREE.MeshBasicMaterial({ color: 0x94a3b8, wireframe: true, transparent: true, opacity: 0.1 });
  
  disposables.push(damGeo, damMat, wireMat);
  const dam = new THREE.Mesh(damGeo, damMat);
  const damWire = new THREE.Mesh(damGeo, wireMat);
  
  group.add(dam);
  group.add(damWire);
  animatables.spillwayDam = dam;

  // 3. Radial Gate
  const gateGeo = new THREE.CylinderGeometry(4, 4, 6, 32, 1, true, Math.PI, Math.PI * 0.3);
  gateGeo.rotateZ(Math.PI / 2);
  gateGeo.translate(0, 0, 0); // Pivot at center of cylinder arc
  
  const gateMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, side: THREE.DoubleSide });
  disposables.push(gateGeo, gateMat);
  const gate = new THREE.Mesh(gateGeo, gateMat);
  gate.position.set(0, 16, 0); // Pivot point above crest
  group.add(gate);
  animatables.spillwayGate = gate;

  // 4. Reservoir Water (Upstream)
  const upWaterGeo = new THREE.BoxGeometry(15, 12, 6);
  const waterMat = new THREE.MeshPhysicalMaterial({ 
      color: 0x0ea5e9, 
      transparent: true, 
      opacity: 0.6,
      transmission: 0.4,
      roughness: 0.1,
      metalness: 0.2
  });
  disposables.push(upWaterGeo, waterMat);
  const upWater = new THREE.Mesh(upWaterGeo, waterMat);
  upWater.position.set(-12.5, 6, 0);
  group.add(upWater);

  // 5. Downstream Basin (Stilling Pool)
  const basinGeo = new THREE.BoxGeometry(20, 2, 10);
  disposables.push(basinGeo);
  const basinWater = new THREE.Mesh(basinGeo, waterMat);
  basinWater.position.set(30, 1, 0);
  group.add(basinWater);
  animatables.spillwayBasinWater = basinWater;

  // 6. High Velocity Flow Particles
  const pCount = 2000;
  const pGeo = new THREE.BufferGeometry();
  const pPos = new Float32Array(pCount * 3);
  const pVel = new Float32Array(pCount * 3); // Velocity Vector
  const pLife = new Float32Array(pCount);
  
  for(let i=0; i<pCount; i++) {
      pPos[i*3] = 0; pPos[i*3+1] = -100; pPos[i*3+2] = 0; // Hide
      pLife[i] = 0;
  }
  
  pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
  pGeo.setAttribute('velocity', new THREE.BufferAttribute(pVel, 3));
  pGeo.setAttribute('life', new THREE.BufferAttribute(pLife, 1));
  
  const pMat = new THREE.PointsMaterial({ 
      color: 0xe0f2fe, 
      size: 0.15, 
      transparent: true, 
      opacity: 0.8,
      blending: THREE.AdditiveBlending 
  });
  disposables.push(pGeo, pMat);
  const flow = new THREE.Points(pGeo, pMat);
  group.add(flow);
  animatables.spillwayFlowParticles = flow;

  // 7. Pressure/Cavitation Map (Dots on chute)
  const cavCount = 200;
  const cavGeo = new THREE.BufferGeometry();
  const cavPos = new Float32Array(cavCount * 3);
  // Distribute along the chute surface approx
  for(let i=0; i<cavCount; i++) {
      // Linear interp from (0, 15, z) to (15, 2, z)
      const t = Math.random();
      cavPos[i*3] = t * 15;
      cavPos[i*3+1] = 15 - t * 13 + 0.1; // Slightly above surface
      cavPos[i*3+2] = (Math.random() - 0.5) * 5;
  }
  cavGeo.setAttribute('position', new THREE.BufferAttribute(cavPos, 3));
  
  const cavMat = new THREE.PointsMaterial({ 
      color: 0x8b5cf6, // Purple for cavitation risk
      size: 0.2, 
      transparent: true, 
      opacity: 0 // Hidden by default
  });
  disposables.push(cavGeo, cavMat);
  const cavMap = new THREE.Points(cavGeo, cavMat);
  group.add(cavMap);
  animatables.spillwayPressureMap = cavMap;

  // 8. Grid Floor
  const grid = new THREE.GridHelper(60, 30, 0x1e293b, 0x0f172a);
  grid.position.y = 0;
  group.add(grid);
};

export const animateHydroSpillScene = (animatables: SimAnimatables, time: number, simData: any) => {
    // simData: { gateOpen: 0-100, head: number, cavitationRisk: boolean }
    const gateOpenPct = simData?.gateOpen || 0;
    const head = simData?.head || 10;
    const cavRisk = simData?.cavitationRisk || false;

    // 1. Gate Animation
    if (animatables.spillwayGate) {
        // Rotate to open. 0% = Closed (Rot 0), 100% = Open (Rot -0.5)
        const targetRot = (gateOpenPct / 100) * -0.6;
        animatables.spillwayGate.rotation.z = THREE.MathUtils.lerp(animatables.spillwayGate.rotation.z, targetRot, 0.1);
    }

    // 2. Flow Particles
    if (animatables.spillwayFlowParticles) {
        const positions = animatables.spillwayFlowParticles.geometry.attributes.position.array as Float32Array;
        const velocities = animatables.spillwayFlowParticles.geometry.attributes.velocity.array as Float32Array;
        const lifes = animatables.spillwayFlowParticles.geometry.attributes.life.array as Float32Array;
        
        // Emission Rate proportional to gate opening * head
        const emitRate = (gateOpenPct / 100) * (head / 20) * 0.5;

        for (let i = 0; i < lifes.length; i++) {
            if (lifes[i] <= 0) {
                // Respawn check
                if (Math.random() < emitRate) {
                    lifes[i] = 1.0;
                    // Start at gate gap (approx x=0, y=14)
                    positions[i*3] = 0 + Math.random();
                    positions[i*3+1] = 14 + (Math.random()-0.5) * (gateOpenPct/100 * 2); 
                    positions[i*3+2] = (Math.random() - 0.5) * 5;
                    
                    // Initial velocity
                    velocities[i*3] = 0.5 + Math.random(); // X
                    velocities[i*3+1] = -0.5; // Y
                    velocities[i*3+2] = 0; // Z
                } else {
                    positions[i*3+1] = -100;
                }
            } else {
                // Physics update
                // Gravity
                velocities[i*3+1] -= 0.05; 
                
                // Move
                positions[i*3] += velocities[i*3];
                positions[i*3+1] += velocities[i*3+1];
                
                // Interaction with Chute
                // Chute profile approx: y = 15 - (x * 13/15)
                const chuteY = 15 - (positions[i*3] * 13/15);
                
                // If on chute (x < 15)
                if (positions[i*3] < 15) {
                    if (positions[i*3+1] < chuteY) {
                        positions[i*3+1] = chuteY + 0.1;
                        // Slide down chute
                        velocities[i*3] += 0.05; // Accelerate X
                        velocities[i*3+1] *= 0.5; // Dampen Y
                    }
                } 
                // Flip Bucket (x > 15)
                else if (positions[i*3] < 17.5) {
                    // Bucket curves up
                    const t = (positions[i*3] - 15) / 2.5; // 0 to 1
                    const bucketY = 2 + t * t * 1.5; // Parabolic up
                    
                    if (positions[i*3+1] < bucketY) {
                         positions[i*3+1] = bucketY + 0.1;
                         // Redirect Velocity UP
                         velocities[i*3+1] += 0.2;
                         velocities[i*3] *= 0.98;
                    }
                }
                
                // Kill if too low or far
                if (positions[i*3+1] < 0 || positions[i*3] > 40) {
                    lifes[i] = 0;
                }
            }
        }
        animatables.spillwayFlowParticles.geometry.attributes.position.needsUpdate = true;
    }

    // 3. Cavitation Map (Risk Visualization)
    if (animatables.spillwayPressureMap) {
        const mat = animatables.spillwayPressureMap.material as THREE.PointsMaterial;
        // Show if high velocity/risk
        if (cavRisk && gateOpenPct > 50) {
             mat.opacity = 0.6 + Math.sin(time * 10) * 0.2; // Flash
        } else {
             mat.opacity = 0;
        }
    }

    // 4. Basin Turbulence
    if (animatables.spillwayBasinWater) {
        // Scale/Roughness based on flow
        const turbulence = (gateOpenPct / 100) * 0.2;
        animatables.spillwayBasinWater.position.y = 1 + Math.sin(time * 2) * turbulence;
    }
};
