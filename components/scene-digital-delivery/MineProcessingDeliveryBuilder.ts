
import * as THREE from 'three';
import { Animatables, SceneType } from '../three-types';

export const isMineProcessingDeliveryScene = (type: SceneType): boolean => {
  return type === 'dd-mine-processing';
};

export const setupMineProcessingDeliveryCamera = (camera: THREE.PerspectiveCamera) => {
  camera.position.set(15, 12, 18);
  camera.lookAt(0, 0, 0);
};

export const initMineProcessingDeliveryScene = (
  type: SceneType, 
  group: THREE.Group, 
  animatables: Animatables, 
  disposables: { dispose: () => void }[]
) => {
  if (type !== 'dd-mine-processing') return;

  // --- Materials ---
  const pipeMat = new THREE.MeshPhysicalMaterial({ 
    color: 0x94a3b8, // Grey pipes
    metalness: 0.6, 
    roughness: 0.3,
    transparent: true,
    opacity: 0.3,
    side: THREE.DoubleSide
  });
  
  const equipmentMat = new THREE.MeshStandardMaterial({ 
    color: 0x7c3aed, // Processing Violet
    roughness: 0.4,
    metalness: 0.8
  });

  const wireMat = new THREE.MeshBasicMaterial({ 
    color: 0x22d3ee, // Cyan data wireframe
    wireframe: true,
    transparent: true,
    opacity: 0.2
  });

  disposables.push(pipeMat, equipmentMat, wireMat);

  // 1. Heavy Medium Cyclone Cluster (Main Asset)
  animatables.mppdCyclones = [];
  const cycloneGroup = new THREE.Group();
  group.add(cycloneGroup);
  
  const cycBodyGeo = new THREE.CylinderGeometry(1.5, 0.5, 4, 32);
  const cycTopGeo = new THREE.CylinderGeometry(1.5, 1.5, 1.5, 32);
  disposables.push(cycBodyGeo, cycTopGeo);

  // Create a bank of 2 cyclones
  [-3, 3].forEach(x => {
      const singleCyc = new THREE.Group();
      singleCyc.position.set(x, 2, 0);
      // Tilt like a cyclone (typically installed at angle)
      singleCyc.rotation.z = x > 0 ? -0.2 : 0.2; 
      singleCyc.rotation.x = 0.2;

      // Body (Conical part)
      const body = new THREE.Mesh(cycBodyGeo, equipmentMat);
      body.position.y = -2;
      singleCyc.add(body);
      
      // Top (Feed chamber)
      const top = new THREE.Mesh(cycTopGeo, equipmentMat);
      top.position.y = 0.75;
      singleCyc.add(top);

      // Wireframe overlay (Digital Twin effect)
      const wireBody = new THREE.Mesh(cycBodyGeo, wireMat);
      wireBody.position.y = -2;
      wireBody.scale.multiplyScalar(1.02);
      singleCyc.add(wireBody);

      const wireTop = new THREE.Mesh(cycTopGeo, wireMat);
      wireTop.position.y = 0.75;
      wireTop.scale.multiplyScalar(1.02);
      singleCyc.add(wireTop);

      cycloneGroup.add(singleCyc);
      animatables.mppdCyclones?.push(singleCyc);
  });

  // 2. Vibrating Screen (Below Cyclones)
  animatables.mppdScreens = [];
  const screenGroup = new THREE.Group();
  screenGroup.position.set(0, -4, 2);
  group.add(screenGroup);

  const deckGeo = new THREE.BoxGeometry(10, 0.5, 6);
  disposables.push(deckGeo);
  const screenDeck = new THREE.Mesh(deckGeo, equipmentMat);
  screenDeck.rotation.x = 0.1; // Sloped
  screenGroup.add(screenDeck);
  
  // Screen Wireframe
  const screenWire = new THREE.Mesh(deckGeo, wireMat);
  screenWire.rotation.x = 0.1;
  screenWire.scale.multiplyScalar(1.01);
  screenGroup.add(screenWire);
  animatables.mppdScreens.push(screenGroup);

  // 3. Piping Network (Connecting Flow)
  const pipePoints = [
      new THREE.Vector3(0, 8, -5), // Feed inlet
      new THREE.Vector3(0, 6, 0),  // Splitter
  ];
  const pipeCurve = new THREE.CatmullRomCurve3(pipePoints);
  const pipeGeo = new THREE.TubeGeometry(pipeCurve, 8, 0.8, 8, false);
  disposables.push(pipeGeo);
  const mainPipe = new THREE.Mesh(pipeGeo, pipeMat);
  group.add(mainPipe);

  // Branch pipes
  [-3, 3].forEach(x => {
      const branchPath = new THREE.LineCurve3(new THREE.Vector3(0, 6, 0), new THREE.Vector3(x, 4, 0));
      const branchGeo = new THREE.TubeGeometry(branchPath, 2, 0.6, 8, false);
      disposables.push(branchGeo);
      const branch = new THREE.Mesh(branchGeo, pipeMat);
      group.add(branch);
  });

  // 4. Material Flow Particles (Process Simulation)
  const pCount = 600;
  const pGeo = new THREE.BufferGeometry();
  const pPos = new Float32Array(pCount * 3);
  const pColor = new Float32Array(pCount * 3);
  const pLife = new Float32Array(pCount); // 0-1 for lifecycle
  const pType = new Float32Array(pCount); // 0=Coal, 1=Refuse
  
  const colCoal = new THREE.Color(0x111111);
  const colRefuse = new THREE.Color(0x888888);
  const colClean = new THREE.Color(0xfacc15); // Gold/Clean coal

  for(let i=0; i<pCount; i++) {
     // Start at feed pipe
     pPos[i*3] = (Math.random()-0.5) * 1.5;
     pPos[i*3+1] = 8 + Math.random() * 2;
     pPos[i*3+2] = -5 + (Math.random()-0.5) * 1.5;
     pLife[i] = Math.random();
     pType[i] = Math.random() > 0.4 ? 0 : 1; // 60% Coal, 40% Refuse
     
     // Init Color
     const c = pType[i] === 0 ? colCoal : colRefuse;
     pColor[i*3] = c.r; pColor[i*3+1] = c.g; pColor[i*3+2] = c.b;
  }
  
  pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
  pGeo.setAttribute('color', new THREE.BufferAttribute(pColor, 3));
  pGeo.setAttribute('life', new THREE.BufferAttribute(pLife, 1));
  pGeo.setAttribute('type', new THREE.BufferAttribute(pType, 1));

  const pMat = new THREE.PointsMaterial({ vertexColors: true, size: 0.15 });
  disposables.push(pGeo, pMat);
  const particles = new THREE.Points(pGeo, pMat);
  group.add(particles);
  animatables.mppdFlowParticles = particles;

  // 5. Verification Scanner (Holographic Plane)
  const scanPlaneGeo = new THREE.PlaneGeometry(20, 20);
  scanPlaneGeo.rotateX(-Math.PI / 2);
  const scanPlaneMat = new THREE.MeshBasicMaterial({ 
      color: 0x22d3ee, 
      transparent: true, 
      opacity: 0.1, 
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending
  });
  disposables.push(scanPlaneGeo, scanPlaneMat);
  const scanner = new THREE.Mesh(scanPlaneGeo, scanPlaneMat);
  group.add(scanner);
  animatables.mppdScanBeam = scanner;

  // Scan Laser Line
  const lineGeo = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(-10, 0, 0), new THREE.Vector3(10, 0, 0)
  ]);
  const lineMat = new THREE.LineBasicMaterial({ color: 0x06b6d4, linewidth: 2 });
  disposables.push(lineGeo, lineMat);
  const scanLine = new THREE.Line(lineGeo, lineMat);
  scanner.add(scanLine);
  
  // Floor Grid
  const grid = new THREE.GridHelper(30, 30, 0x4c1d95, 0x1e1b4b);
  grid.position.y = -6;
  group.add(grid);
};

export const animateMineProcessingDeliveryScene = (type: SceneType, animatables: Animatables, time: number) => {
  if (type !== 'dd-mine-processing') return;

  // 1. Scanner Movement
  if (animatables.mppdScanBeam) {
      animatables.mppdScanBeam.position.y = Math.sin(time * 0.5) * 6;
  }

  // 2. Screen Vibration
  if (animatables.mppdScreens) {
      animatables.mppdScreens.forEach(screen => {
          screen.position.x = Math.sin(time * 50) * 0.05; // Fast jitter
          screen.position.z = 2 + Math.cos(time * 50) * 0.05;
      });
  }

  // 3. Complex Particle Flow Logic
  if (animatables.mppdFlowParticles) {
      const positions = animatables.mppdFlowParticles.geometry.attributes.position.array as Float32Array;
      const lifes = animatables.mppdFlowParticles.geometry.attributes.life.array as Float32Array;
      const types = animatables.mppdFlowParticles.geometry.attributes.type.array as Float32Array;
      const colors = animatables.mppdFlowParticles.geometry.attributes.color.array as Float32Array;

      // Flow path logic:
      // A: Feed pipe (-5 Z) -> Splitter (0 Z)
      // B: Split to Cyclones (Left/Right)
      // C: Swirl in Cyclone
      // D: Drop to Screen or Underflow
      
      const colClean = new THREE.Color(0xfacc15); // Clean coal turns gold
      const colRefuse = new THREE.Color(0x57534e); // Refuse turns grey

      for(let i=0; i<lifes.length; i++) {
          lifes[i] += 0.005;
          if (lifes[i] > 1) {
              // Reset
              lifes[i] = 0;
              positions[i*3] = (Math.random()-0.5) * 1.0;
              positions[i*3+1] = 8;
              positions[i*3+2] = -5;
              // Reset color
              const isCoal = types[i] === 0;
              const baseC = isCoal ? new THREE.Color(0x111111) : new THREE.Color(0x888888);
              colors[i*3] = baseC.r; colors[i*3+1] = baseC.g; colors[i*3+2] = baseC.b;
              continue;
          }

          let t = lifes[i];
          let x = positions[i*3];
          let y = positions[i*3+1];
          let z = positions[i*3+2];
          const isCoal = types[i] === 0;

          // Phase 1: Feed Pipe (0 - 0.2)
          if (t < 0.2) {
             const subT = t / 0.2;
             // Move to splitter (0, 6, 0)
             x = (Math.random()-0.5) * 0.5; // Constrained
             y = 8 - subT * 2;
             z = -5 + subT * 5;
          } 
          // Phase 2: Split to Cyclones (0.2 - 0.3)
          else if (t < 0.3) {
             const subT = (t - 0.2) / 0.1;
             // Determine side based on particle index even/odd
             const side = i % 2 === 0 ? -1 : 1; 
             x = side * 3 * subT; // Move to +/- 3
             y = 6 - subT * 2; // Drop to 4
             z = 0;
          }
          // Phase 3: Swirl in Cyclone (0.3 - 0.6)
          else if (t < 0.6) {
             const subT = (t - 0.3) / 0.3;
             const side = i % 2 === 0 ? -1 : 1; 
             const centerX = side * 3;
             
             // Swirl radius decreases
             const r = 1.5 * (1 - subT);
             const angle = subT * 20; // Fast spin
             
             x = centerX + Math.cos(angle) * r;
             z = Math.sin(angle) * r;
             y = 4 - subT * 6; // Drop from 4 to -2

             // Color Change: Clean coal separation
             if (isCoal) {
                 // Clean coal floats/spirals center -> gets "Clean"
                 // Actually in HMC clean coal goes up? Simplified: just change color here
                 colors[i*3] = colClean.r; colors[i*3+1] = colClean.g; colors[i*3+2] = colClean.b;
             }
          }
          // Phase 4: Screen / Discharge (0.6 - 1.0)
          else {
             const subT = (t - 0.6) / 0.4;
             // Coal goes to screen, Refuse goes down
             if (isCoal) {
                 // Drop to screen
                 y = -2 - subT * 2;
                 // Move forward on screen
                 z = subT * 6; 
                 // Jitter X on screen
                 x = (i % 2 === 0 ? -3 : 3) + (Math.random()-0.5);
             } else {
                 // Refuse drops straight down
                 y = -2 - subT * 6;
                 x = (i % 2 === 0 ? -3 : 3) * 0.5; // Narrow underflow
                 z = 0;
                 colors[i*3] = colRefuse.r; colors[i*3+1] = colRefuse.g; colors[i*3+2] = colRefuse.b;
             }
          }

          positions[i*3] = x;
          positions[i*3+1] = y;
          positions[i*3+2] = z;
      }
      
      animatables.mppdFlowParticles.geometry.attributes.position.needsUpdate = true;
      animatables.mppdFlowParticles.geometry.attributes.color.needsUpdate = true;
  }
};
