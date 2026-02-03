
import * as THREE from 'three';
import { FloodAnimatables, FloodSimState } from './three-types';

export const initFloodScene = (
  group: THREE.Group, 
  animatables: FloodAnimatables,
  disposables: { dispose: () => void }[]
) => {
  // --- Materials ---
  const concreteMat = new THREE.MeshStandardMaterial({ 
    color: 0x64748b, roughness: 0.8, flatShading: true 
  });
  const bedMat = new THREE.MeshStandardMaterial({ 
    color: 0x334155, roughness: 0.9, vertexColors: true 
  });
  const waterPoolMat = new THREE.MeshPhysicalMaterial({ 
    color: 0x06b6d4, transmission: 0.8, opacity: 0.7, transparent: true, roughness: 0.2, metalness: 0.1 
  });
  const waterParticleMat = new THREE.PointsMaterial({ 
    color: 0xcffafe, size: 0.3, transparent: true, opacity: 0.6, blending: THREE.AdditiveBlending 
  });
  const mistMat = new THREE.PointsMaterial({ 
    color: 0xffffff, size: 0.8, transparent: true, opacity: 0.2, blending: THREE.AdditiveBlending 
  });

  disposables.push(concreteMat, bedMat, waterPoolMat, waterParticleMat, mistMat);

  // 1. Dam & Spillway Geometry (Ski-jump shape)
  const damShape = new THREE.Shape();
  damShape.moveTo(0, 0);
  damShape.lineTo(0, 20); // Height
  damShape.lineTo(5, 20); // Top width
  // Curve down
  const curvePts = [];
  for(let i=0; i<=10; i++) {
      const t = i/10;
      // Parabolic spillway profile: x = 5 + t*10, y = 20 - t^2 * 10
      // Ski jump bucket at end: curve up slightly
      let x = 5 + t * 10;
      let y = 18 - t * t * 12;
      if (t > 0.8) y += (t-0.8) * 4; // Bucket lip
      damShape.lineTo(x, y);
  }
  damShape.lineTo(15, 0); // Base front
  damShape.lineTo(0, 0); // Close

  const extrudeSettings = { depth: 8, bevelEnabled: false };
  const damGeo = new THREE.ExtrudeGeometry(damShape, extrudeSettings);
  damGeo.translate(0, 0, -4); // Center Z
  disposables.push(damGeo);
  const dam = new THREE.Mesh(damGeo, concreteMat);
  dam.position.x = -10;
  group.add(dam);
  animatables.damStructure = dam;

  // 2. River Bed (Scour Zone)
  const bedGeo = new THREE.PlaneGeometry(40, 20, 64, 32);
  bedGeo.rotateX(-Math.PI / 2);
  
  // Init vertex colors for heatmap
  const count = bedGeo.attributes.position.count;
  const colors = new Float32Array(count * 3);
  for(let i=0; i<count; i++) {
      colors[i*3] = 0.2; // R
      colors[i*3+1] = 0.25; // G
      colors[i*3+2] = 0.35; // B
  }
  bedGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  disposables.push(bedGeo);
  
  const bed = new THREE.Mesh(bedGeo, bedMat);
  bed.position.y = 0;
  group.add(bed);
  animatables.riverBed = bed;

  // 3. Plunge Pool Water Surface
  const poolGeo = new THREE.BoxGeometry(40, 2, 20);
  poolGeo.translate(0, 1, 0); // Water level at y=2
  disposables.push(poolGeo);
  const pool = new THREE.Mesh(poolGeo, waterPoolMat);
  pool.position.x = 10;
  group.add(pool);
  animatables.plungePoolWater = pool;

  // 4. Flow Particles (The Jet)
  const pCount = 1000;
  const pGeo = new THREE.BufferGeometry();
  const pPos = new Float32Array(pCount * 3);
  const pLife = new Float32Array(pCount); // 0 to 1 life cycle
  const pSpeed = new Float32Array(pCount); 
  
  for(let i=0; i<pCount; i++) {
      pLife[i] = Math.random();
      pSpeed[i] = 1 + Math.random() * 0.5;
      // Initial positions hidden or at start
      pPos[i*3] = -5; 
      pPos[i*3+1] = 18;
      pPos[i*3+2] = (Math.random() - 0.5) * 7;
  }
  pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
  pGeo.setAttribute('life', new THREE.BufferAttribute(pLife, 1));
  pGeo.setAttribute('speed', new THREE.BufferAttribute(pSpeed, 1));
  
  const flow = new THREE.Points(pGeo, waterParticleMat);
  group.add(flow);
  animatables.waterFlowParticles = flow;

  // 5. Mist Particles (Impact)
  const mCount = 500;
  const mGeo = new THREE.BufferGeometry();
  const mPos = new Float32Array(mCount * 3);
  for(let i=0; i<mCount; i++) {
      mPos[i*3] = 10 + (Math.random()-0.5)*10;
      mPos[i*3+1] = 2 + Math.random()*5;
      mPos[i*3+2] = (Math.random()-0.5)*10;
  }
  mGeo.setAttribute('position', new THREE.BufferAttribute(mPos, 3));
  const mist = new THREE.Points(mGeo, mistMat);
  mist.visible = false; // Only visible on impact
  group.add(mist);
  animatables.mistParticles = mist;
};

export const animateFloodScene = (
  animatables: FloodAnimatables, 
  state: FloodSimState,
  time: number
) => {
  // Flow Physics
  if (animatables.waterFlowParticles) {
      const positions = animatables.waterFlowParticles.geometry.attributes.position.array as Float32Array;
      const lifes = animatables.waterFlowParticles.geometry.attributes.life.array as Float32Array;
      const speeds = animatables.waterFlowParticles.geometry.attributes.speed.array as Float32Array;
      
      const gravity = 0.05;
      // Trajectory params
      const v0 = state === 'EXTREME' ? 1.2 : 0.8; // Initial velocity horizontal
      const angle = 0.5; // Ski jump angle (rad)
      
      for(let i=0; i<lifes.length; i++) {
          lifes[i] += 0.01 * speeds[i];
          if (lifes[i] > 1) {
              lifes[i] = 0;
              // Reset to top of spillway
              positions[i*3] = -5; // Start X
              positions[i*3+1] = 18; // Start Y
              positions[i*3+2] = (Math.random() - 0.5) * 7; // Spread Z
          }

          // Simple physics simulation based on life phase
          // Phase 1: Down the chute (0 to 0.3 life)
          // Phase 2: Air trajectory (0.3 to 0.8 life)
          // Phase 3: Impact/Dissipate (0.8 to 1.0 life)
          
          if (lifes[i] < 0.3) {
              // Sliding down ramp
              const t = lifes[i] / 0.3;
              positions[i*3] = -5 + t * 10; // -5 to 5
              positions[i*3+1] = 18 - t * t * 10; // Parabolic drop
              if (t > 0.8) positions[i*3+1] += (t-0.8)*2; // Bucket lip rise
          } else {
              // Air launch
              const airT = (lifes[i] - 0.3) * 30; // Scale time
              // x = v0 * cos(theta) * t
              // y = v0 * sin(theta) * t - 0.5 * g * t^2
              const launchX = 5;
              const launchY = 8; // Approx bucket lip height
              
              const dx = v0 * Math.cos(angle) * airT;
              const dy = v0 * Math.sin(angle) * airT - 0.5 * gravity * airT * airT;
              
              positions[i*3] = launchX + dx;
              positions[i*3+1] = launchY + dy;
              
              // Floor collision
              if (positions[i*3+1] < 2) {
                  positions[i*3+1] = 2 + Math.random(); // Surface
                  // Spread out on impact
                  positions[i*3] += (Math.random()-0.5)*0.5;
                  positions[i*3+2] += (Math.random()-0.5)*0.5;
              }
          }
      }
      animatables.waterFlowParticles.geometry.attributes.position.needsUpdate = true;
      animatables.waterFlowParticles.geometry.attributes.life.needsUpdate = true;
  }

  // Mist/Spray Animation
  if (animatables.mistParticles) {
      animatables.mistParticles.visible = true;
      const mPos = animatables.mistParticles.geometry.attributes.position.array as Float32Array;
      const impactZoneX = state === 'EXTREME' ? 25 : 15; // Further out for extreme
      
      for(let i=0; i<mPos.length; i+=3) {
          // Reset if too high or far
          if (mPos[i*3+1] > 8 || Math.random() > 0.95) {
              mPos[i*3] = impactZoneX + (Math.random()-0.5)*8;
              mPos[i*3+1] = 2; // Surface
              mPos[i*3+2] = (Math.random()-0.5)*10;
          }
          // Rise and drift
          mPos[i*3+1] += 0.05 + Math.random()*0.05;
          mPos[i*3] += 0.02; // Drift downstream
      }
      animatables.mistParticles.geometry.attributes.position.needsUpdate = true;
      (animatables.mistParticles.material as THREE.Material).opacity = state === 'EXTREME' ? 0.4 : 0.2;
  }

  // Scour Heatmap (Riverbed Color)
  if (animatables.riverBed) {
      if (state === 'SCOUR_VIEW') {
          const colors = animatables.riverBed.geometry.attributes.color.array as Float32Array;
          const positions = animatables.riverBed.geometry.attributes.position.array as Float32Array;
          const impactX = 25; // Default to severe impact location for visualization

          for(let i=0; i<positions.length; i+=3) {
              const x = positions[i];
              const z = positions[i+2]; // Local Y is Z in world due to rotation
              // Distance from impact center
              const dist = Math.sqrt((x - impactX)**2 + (z)**2);
              
              if (dist < 8) {
                  // Red/Orange for high scour risk
                  const intensity = 1 - dist/8;
                  colors[i] = 0.2 + intensity * 0.8; // R
                  colors[i+1] = 0.25 - intensity * 0.25; // G
                  colors[i+2] = 0.35 - intensity * 0.35; // B
                  
                  // Deform mesh slightly to show pit
                  positions[i+1] = -intensity * 3; // Depress Y (which is Z local)
              } else {
                  colors[i] = 0.2; colors[i+1] = 0.25; colors[i+2] = 0.35;
                  positions[i+1] = 0;
              }
          }
          animatables.riverBed.geometry.attributes.color.needsUpdate = true;
          animatables.riverBed.geometry.attributes.position.needsUpdate = true;
      } else {
           // Reset
           // Optim: only reset if needed, simplified here
      }
  }
};
