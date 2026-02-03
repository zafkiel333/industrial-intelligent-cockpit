
import * as THREE from 'three';
import { MillAnimatables, MillState } from './three-types';

export const initMillScene = (
  group: THREE.Group, 
  animatables: MillAnimatables,
  disposables: { dispose: () => void }[]
) => {
  // --- 材质库 ---
  const steelMat = new THREE.MeshStandardMaterial({ 
    color: 0x94a3b8, roughness: 0.3, metalness: 0.8 
  });
  const glassMat = new THREE.MeshPhysicalMaterial({ 
    color: 0xffffff, transmission: 0.9, opacity: 0.3, transparent: true, 
    roughness: 0.1, metalness: 0.1, side: THREE.DoubleSide
  });
  const oreMat = new THREE.MeshStandardMaterial({ 
    color: 0x854d0e, roughness: 0.9, flatShading: true 
  }); // Brownish rock
  const ballMat = new THREE.MeshStandardMaterial({ 
    color: 0x475569, roughness: 0.4, metalness: 0.9 
  }); // Dark steel ball
  const frameMat = new THREE.MeshStandardMaterial({ 
    color: 0x1e293b, roughness: 0.7 
  });
  const dustMat = new THREE.PointsMaterial({
    color: 0xdca54c, size: 0.1, transparent: true, opacity: 0.4
  });
  const sparkMat = new THREE.PointsMaterial({
    color: 0xffaa00, size: 0.15, transparent: true, opacity: 0.8, blending: THREE.AdditiveBlending
  });

  disposables.push(steelMat, glassMat, oreMat, ballMat, frameMat, dustMat, sparkMat);

  // 1. Mill Base Frame
  const baseGeo = new THREE.BoxGeometry(8, 0.5, 5);
  disposables.push(baseGeo);
  const base = new THREE.Mesh(baseGeo, frameMat);
  base.position.y = -2;
  group.add(base);

  // Supports
  const supportGeo = new THREE.BoxGeometry(1, 3, 4);
  disposables.push(supportGeo);
  const supportL = new THREE.Mesh(supportGeo, frameMat); supportL.position.set(-3, -0.5, 0);
  const supportR = new THREE.Mesh(supportGeo, frameMat); supportR.position.set(3, -0.5, 0);
  group.add(supportL, supportR);

  // 2. Mill Drum (Rotating Part)
  const drumGroup = new THREE.Group();
  group.add(drumGroup);
  animatables.millDrum = drumGroup;

  // Cylinder Shell (Transparent center)
  const shellGeo = new THREE.CylinderGeometry(2.5, 2.5, 5, 32, 1, true);
  shellGeo.rotateZ(Math.PI / 2);
  disposables.push(shellGeo);
  const shell = new THREE.Mesh(shellGeo, glassMat);
  drumGroup.add(shell);

  // End Caps (Steel)
  const capGeo = new THREE.CylinderGeometry(2.5, 2.5, 0.2, 32);
  capGeo.rotateZ(Math.PI / 2);
  disposables.push(capGeo);
  const capL = new THREE.Mesh(capGeo, steelMat); capL.position.x = -2.5;
  const capR = new THREE.Mesh(capGeo, steelMat); capR.position.x = 2.5;
  drumGroup.add(capL, capR);

  // Lifter Bars (Inside) - Helps lift the charge
  const lifterGeo = new THREE.BoxGeometry(4.8, 0.2, 0.1);
  lifterGeo.rotateZ(Math.PI/2); // Along length
  disposables.push(lifterGeo);
  for(let i=0; i<8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const lifter = new THREE.Mesh(lifterGeo, steelMat);
      // Position on inner radius
      lifter.position.y = Math.cos(angle) * 2.4;
      lifter.position.z = Math.sin(angle) * 2.4;
      lifter.rotation.x = -angle; // Face center? No, rotate around X to match cylinder tangent
      drumGroup.add(lifter);
  }

  // 3. The Charge (Balls + Ore)
  // Instead of full physics, we create a group that stays at the "toe" of the charge
  // and animate individual particles orbiting/tumbling based on mill speed state.
  const chargeGroup = new THREE.Group();
  drumGroup.add(chargeGroup);
  animatables.chargeGroup = chargeGroup;
  
  animatables.balls = [];
  animatables.ores = [];

  const ballGeo = new THREE.SphereGeometry(0.2, 8, 8);
  const oreGeo = new THREE.DodecahedronGeometry(0.15, 0); // Jagged look
  disposables.push(ballGeo, oreGeo);

  // Create a "Kidney" shape of particles
  const count = 150;
  for(let i=0; i<count; i++) {
      const isBall = Math.random() > 0.4;
      const mesh = new THREE.Mesh(isBall ? ballGeo : oreGeo, isBall ? ballMat : oreMat);
      
      // Random position in the bottom half initially
      const r = Math.random() * 2.0;
      const theta = Math.random() * Math.PI + Math.PI; // Bottom semi-circle
      
      mesh.position.y = Math.cos(theta) * r;
      mesh.position.z = Math.sin(theta) * r;
      mesh.position.x = (Math.random() - 0.5) * 4.5;
      
      // Store initial phase for animation
      mesh.userData = { 
          r: r, 
          theta: theta, 
          speedOffset: Math.random() * 0.5 + 0.5,
          isBall: isBall
      };
      
      chargeGroup.add(mesh);
      if(isBall) animatables.balls.push(mesh);
      else animatables.ores.push(mesh);
  }

  // 4. Dust & Sparks
  const pGeo = new THREE.BufferGeometry();
  const pPos = new Float32Array(300 * 3);
  pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
  disposables.push(pGeo);
  const dust = new THREE.Points(pGeo, dustMat);
  group.add(dust);
  animatables.dustSystem = dust;

  const sGeo = new THREE.BufferGeometry();
  const sPos = new Float32Array(50 * 3);
  sGeo.setAttribute('position', new THREE.BufferAttribute(sPos, 3));
  disposables.push(sGeo);
  const sparks = new THREE.Points(sGeo, sparkMat);
  group.add(sparks);
  animatables.impactSparks = sparks;

  // Grid
  const grid = new THREE.GridHelper(30, 30, 0x334155, 0x0f172a);
  grid.position.y = -2.5;
  group.add(grid);
};

export const animateMillScene = (
  animatables: MillAnimatables, 
  state: MillState,
  time: number
) => {
  // Speed Factors
  let rpm = 0;
  let chargeAngle = 0; // Where the charge sits (radians from bottom)
  let tumbleIntensity = 0;

  if (state === 'IDLE') {
      rpm = 0;
      chargeAngle = 0;
      tumbleIntensity = 0.01; // Just settling
  } else if (state === 'CASCADING') {
      rpm = 1.0;
      chargeAngle = 0.5; // Shifted up slightly
      tumbleIntensity = 0.5;
  } else if (state === 'CATARACTING') {
      rpm = 2.5; // Ideal
      chargeAngle = 1.2; // High up the side
      tumbleIntensity = 1.5;
  } else if (state === 'CENTRIFUGAL') {
      rpm = 5.0; // Too fast
      chargeAngle = 0; // Pinned to walls, handled differently
      tumbleIntensity = 0; // No relative motion
  }

  // 1. Rotate Drum
  if (animatables.millDrum) {
      animatables.millDrum.rotation.x -= rpm * 0.02;
  }

  // 2. Animate Charge Particles
  if (animatables.chargeGroup) {
      // Rotate the whole group opposite to drum slightly to simulate gravity hold-back?
      // No, let's animate individual particles.
      
      animatables.chargeGroup.children.forEach(child => {
          const data = child.userData;
          
          if (state === 'CENTRIFUGAL') {
              // Pin to wall
              const r = 2.2 + Math.random() * 0.2;
              // Rotate with drum
              data.theta -= rpm * 0.02; // Same as drum
              child.position.y = Math.cos(data.theta) * r;
              child.position.z = Math.sin(data.theta) * r;
              return;
          }

          // Normal Tumbling Logic
          // Particles move up the side (with drum) then fall
          
          // Simulate circular path with gravity cut-off
          // Angle increases (moves up wall in -X rot direction means angle decreases in standard circle?)
          // Drum rotates -X. So things at bottom (3PI/2) move to right (0) then top (PI/2).
          // Let's use simple logic:
          // Theta moves with drum speed. If height > threshold, fall down.
          
          data.theta -= rpm * 0.02; 
          
          // Determine "Fall" zone based on state
          let dropPoint = -Math.PI / 2; // Bottom
          if (state === 'CASCADING') dropPoint = -Math.PI / 4;
          if (state === 'CATARACTING') dropPoint = 0; // 3 o'clock position (high)
          
          // Normalize angle 0 to -2PI
          const normTheta = data.theta % (Math.PI * 2);
          
          // If particle is "above" the drop point, it falls
          // "Above" in -X rotation means angle is greater (less negative) than drop point?
          // Let's simplify: Visualize a kidney shape rotated by chargeAngle
          
          // Mode 2: Procedural Noise Position
          // Base position: Cluster at bottom.
          // Rotate cluster by chargeAngle.
          // Add noise based on tumbleIntensity.
          
          // Center of charge mass
          const cx = 0; 
          const cy = Math.sin(-Math.PI/2 + chargeAngle) * 1.5;
          const cz = Math.cos(-Math.PI/2 + chargeAngle) * 1.5;
          
          // Orbit around center of charge
          // We use time to churn them
          const churnSpeed = tumbleIntensity * 2;
          const localTheta = time * churnSpeed * data.speedOffset + data.r; // Random start
          
          // kidney shape deformation
          const spread = 1.2;
          
          child.position.y = cy + Math.cos(localTheta) * spread;
          child.position.z = cz + Math.sin(localTheta) * spread;
          
          // Add "Toe" splash effect
          if (state === 'CATARACTING') {
              // Some particles fly out
              if (Math.sin(localTheta) > 0.8) {
                  child.position.z += Math.random() * 1.0; // Fling
                  child.position.y -= Math.random() * 1.0; // Fall
              }
          }
          
          child.rotation.x += 0.1;
          child.rotation.z += 0.1;
      });
  }

  // 3. Dust & Sparks
  if (animatables.dustSystem && animatables.impactSparks) {
      if (state === 'CATARACTING') {
          (animatables.dustSystem.material as THREE.Material).opacity = 0.4;
          (animatables.impactSparks.material as THREE.Material).opacity = 0.8;
          
          const sPos = animatables.impactSparks.geometry.attributes.position.array as Float32Array;
          for(let i=0; i<sPos.length; i+=3) {
              // Sparks at impact zone (Bottom right approx)
              if (Math.random() > 0.8) {
                  sPos[i] = (Math.random()-0.5)*4;
                  sPos[i+1] = -2 + Math.random();
                  sPos[i+2] = 1 + Math.random();
              } else {
                  sPos[i+1] = -100; // Hide
              }
          }
          animatables.impactSparks.geometry.attributes.position.needsUpdate = true;
          
          const dPos = animatables.dustSystem.geometry.attributes.position.array as Float32Array;
          for(let i=0; i<dPos.length; i+=3) {
             dPos[i+1] += 0.02; // Rise
             dPos[i+2] += 0.01; // Drift
             if (dPos[i+1] > 2) {
                 dPos[i+1] = -2;
                 dPos[i] = (Math.random()-0.5)*4;
                 dPos[i+2] = (Math.random()-0.5)*4;
             }
          }
          animatables.dustSystem.geometry.attributes.position.needsUpdate = true;
          
      } else {
          (animatables.dustSystem.material as THREE.Material).opacity = 0.1;
          (animatables.impactSparks.material as THREE.Material).opacity = 0;
      }
  }
};
