
import * as THREE from 'three';
import { SimAnimatables } from './three-types';

export const initMineSlurryScene = (
  group: THREE.Group,
  animatables: SimAnimatables,
  disposables: { dispose: () => void }[]
) => {
  // 1. Environment (Dark Lab)
  const grid = new THREE.GridHelper(40, 40, 0x4f46e5, 0x0f172a);
  grid.position.y = -10;
  group.add(grid);
  
  const ambient = new THREE.AmbientLight(0xffffff, 0.4);
  group.add(ambient);
  const spot = new THREE.SpotLight(0x8b5cf6, 2, 50);
  spot.position.set(10, 10, 10);
  group.add(spot);

  // 2. Hydrocyclone Body (Transparent)
  // Structure: Cylinder Top + Cone Bottom
  const cycloneGroup = new THREE.Group();
  group.add(cycloneGroup);

  const glassMat = new THREE.MeshPhysicalMaterial({
      color: 0xa5b4fc,
      metalness: 0.9,
      roughness: 0.1,
      transmission: 0.6, // Glass-like
      transparent: true,
      opacity: 0.4,
      side: THREE.DoubleSide
  });
  disposables.push(glassMat);

  // Cylindrical Section
  const cylGeo = new THREE.CylinderGeometry(4, 4, 6, 32, 1, true);
  const cyl = new THREE.Mesh(cylGeo, glassMat);
  cyl.position.y = 3;
  cycloneGroup.add(cyl);
  disposables.push(cylGeo);

  // Conical Section
  const coneGeo = new THREE.CylinderGeometry(4, 1, 12, 32, 1, true);
  const cone = new THREE.Mesh(coneGeo, glassMat);
  cone.position.y = -6; // 3 - 3(half cyl) - 6(half cone)
  cycloneGroup.add(cone);
  disposables.push(coneGeo);

  // Wireframe Overlay for Tech Look
  const wireMat = new THREE.MeshBasicMaterial({ color: 0x6366f1, wireframe: true, transparent: true, opacity: 0.1 });
  disposables.push(wireMat);
  const cylWire = new THREE.Mesh(cylGeo, wireMat);
  cyl.add(cylWire);
  const coneWire = new THREE.Mesh(coneGeo, wireMat);
  cone.add(coneWire);

  animatables.slurryCyclone = cyl; // Reference to main body

  // 3. Inlet Pipe (Tangential)
  const inletGeo = new THREE.BoxGeometry(3, 2, 8);
  const inletMat = new THREE.MeshStandardMaterial({ color: 0x312e81 });
  disposables.push(inletGeo, inletMat);
  const inlet = new THREE.Mesh(inletGeo, inletMat);
  inlet.position.set(-4, 4, 0);
  inlet.rotation.y = -Math.PI / 4; // Tangential entry
  cycloneGroup.add(inlet);
  animatables.slurryInlet = inlet;

  // Vortex Finder (Top Outlet)
  const finderGeo = new THREE.CylinderGeometry(1.5, 1.5, 4, 32);
  const finderMat = new THREE.MeshStandardMaterial({ color: 0x4f46e5 });
  disposables.push(finderGeo, finderMat);
  const finder = new THREE.Mesh(finderGeo, finderMat);
  finder.position.y = 6;
  cycloneGroup.add(finder);

  // 4. Air Core (Central Vortex)
  const airCoreGeo = new THREE.CylinderGeometry(0.5, 0.2, 20, 16, 1, true);
  const airCoreMat = new THREE.MeshBasicMaterial({ 
      color: 0xffffff, 
      transparent: true, 
      opacity: 0.3,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending
  });
  disposables.push(airCoreGeo, airCoreMat);
  const airCore = new THREE.Mesh(airCoreGeo, airCoreMat);
  airCore.position.y = -2;
  cycloneGroup.add(airCore);
  animatables.slurryAirCore = airCore;

  // 5. Particles (Slurry)
  const pCount = 3000;
  const pGeo = new THREE.BufferGeometry();
  const pPos = new Float32Array(pCount * 3);
  const pSize = new Float32Array(pCount); // Size determines mass/path
  const pLife = new Float32Array(pCount); // 0-1 lifecycle
  const pType = new Float32Array(pCount); // 0 = Fine (Overflow), 1 = Coarse (Underflow)

  for(let i=0; i<pCount; i++) {
      pPos[i*3] = -6; // Start at inlet
      pPos[i*3+1] = 4;
      pPos[i*3+2] = 2;
      
      const isCoarse = Math.random() > 0.6; // 40% coarse
      pType[i] = isCoarse ? 1 : 0;
      pSize[i] = isCoarse ? 0.3 : 0.15;
      pLife[i] = Math.random(); // Random start
  }

  pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
  pGeo.setAttribute('pSize', new THREE.BufferAttribute(pSize, 1));
  pGeo.setAttribute('life', new THREE.BufferAttribute(pLife, 1));
  pGeo.setAttribute('type', new THREE.BufferAttribute(pType, 1));

  // Custom shader or vertex colors needed for size? We'll use PointsMaterial and simple logic for now.
  // We'll separate Coarse and Fine into two systems for different colors easily without custom shader
  // Or use VertexColors.
  const pColors = new Float32Array(pCount * 3);
  const cFine = new THREE.Color(0x22d3ee); // Cyan
  const cCoarse = new THREE.Color(0xfbbf24); // Gold

  for(let i=0; i<pCount; i++) {
      const c = pType[i] === 1 ? cCoarse : cFine;
      pColors[i*3] = c.r;
      pColors[i*3+1] = c.g;
      pColors[i*3+2] = c.b;
  }
  pGeo.setAttribute('color', new THREE.BufferAttribute(pColors, 3));

  const pMat = new THREE.PointsMaterial({ 
      vertexColors: true, 
      size: 0.2, 
      transparent: true, 
      opacity: 0.8,
      blending: THREE.NormalBlending
  });
  disposables.push(pGeo, pMat);
  const particleSys = new THREE.Points(pGeo, pMat);
  group.add(particleSys);
  animatables.slurryParticles = particleSys;
};

export const animateMineSlurryScene = (animatables: SimAnimatables, time: number, simData: any) => {
    // simData: { pressure: number, density: number, d50: number }
    const pressure = simData?.pressure || 150; // kPa
    const d50 = simData?.d50 || 20; // microns (simulated cut point influence)
    
    // Speed factor based on pressure
    const speed = 0.01 + (pressure / 500) * 0.02;

    // Air Core Twirl
    if (animatables.slurryAirCore) {
        animatables.slurryAirCore.rotation.y -= 0.5;
        animatables.slurryAirCore.scale.x = 0.8 + Math.sin(time * 10) * 0.1;
        animatables.slurryAirCore.scale.z = 0.8 + Math.cos(time * 10) * 0.1;
    }

    // Particle Dynamics
    if (animatables.slurryParticles) {
        const positions = animatables.slurryParticles.geometry.attributes.position.array as Float32Array;
        const lifes = animatables.slurryParticles.geometry.attributes.life.array as Float32Array;
        const types = animatables.slurryParticles.geometry.attributes.type.array as Float32Array; // 0: Fine, 1: Coarse

        for(let i=0; i<lifes.length; i++) {
            lifes[i] += speed;
            let t = lifes[i];
            
            if (t > 1) {
                // Reset to inlet
                lifes[i] = 0;
                t = 0;
                positions[i*3] = -5 - Math.random(); // Inlet X
                positions[i*3+1] = 4 + (Math.random()-0.5); // Inlet Y
                positions[i*3+2] = (Math.random()-0.5) * 2; // Inlet Z
                continue;
            }

            // Flow Logic:
            // 1. Tangential Entry (t < 0.1)
            // 2. Swirl Down (0.1 < t < 0.6)
            // 3. Separation (t > 0.6) -> Coarse continues down, Fine goes up
            
            let x = positions[i*3];
            let y = positions[i*3+1];
            let z = positions[i*3+2];
            
            // Polar conversion helper
            let r = Math.sqrt(x*x + z*z);
            let angle = Math.atan2(z, x);

            if (t < 0.1) {
                // Moving into cyclone
                x += 0.5; 
                // Start curving
                z += 0.2;
            } else {
                // Spiral Physics
                // Angular velocity
                angle -= 0.3; // Spin
                
                if (types[i] === 1) {
                    // Coarse: Moves to wall (Large R), Drops down
                    const targetR = 3.5 - (y < 0 ? (y/-12)*2.5 : 0); // Cone taper
                    r = THREE.MathUtils.lerp(r, targetR, 0.1);
                    y -= 0.15; // Fall fast
                } else {
                    // Fine: Moves to center (Small R), eventually moves UP
                    // d50 influence: if pressure is high, more particles act as fine?
                    // Simplified visual logic:
                    if (t < 0.5) {
                        // Swirl down with coarse initially
                        const targetR = 2.5;
                        r = THREE.MathUtils.lerp(r, targetR, 0.05);
                        y -= 0.1;
                    } else {
                        // Reversal (Short Circuit) -> Up through vortex finder
                        const targetR = 0.5;
                        r = THREE.MathUtils.lerp(r, targetR, 0.1);
                        y += 0.3; // Rise fast
                    }
                }
                
                x = Math.cos(angle) * r;
                z = Math.sin(angle) * r;
            }

            positions[i*3] = x;
            positions[i*3+1] = y;
            positions[i*3+2] = z;
        }
        
        animatables.slurryParticles.geometry.attributes.position.needsUpdate = true;
        animatables.slurryParticles.geometry.attributes.life.needsUpdate = true;
    }
};
