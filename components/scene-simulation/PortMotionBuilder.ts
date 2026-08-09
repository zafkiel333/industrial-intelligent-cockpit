
import * as THREE from 'three';
import { SimAnimatables } from './three-types';

export const initPortMotionScene = (
  group: THREE.Group,
  animatables: SimAnimatables,
  disposables: { dispose: () => void }[]
) => {
  // 1. Lighting (Open Ocean)
  const ambient = new THREE.AmbientLight(0xffffff, 0.4);
  group.add(ambient);
  const sun = new THREE.DirectionalLight(0xffffff, 1.0);
  sun.position.set(20, 50, 10);
  group.add(sun);
  const blueBack = new THREE.PointLight(0x0ea5e9, 0.5, 60);
  blueBack.position.set(-10, 5, -20);
  group.add(blueBack);

  // 2. Dynamic Water Surface
  // High segment count for vertex displacement
  const waterGeo = new THREE.PlaneGeometry(100, 100, 64, 64);
  waterGeo.rotateX(-Math.PI / 2);
  
  // Store initial positions
  const pos = waterGeo.attributes.position;
  waterGeo.userData = { initialPos: pos.clone() };

  const waterMat = new THREE.MeshStandardMaterial({ 
      color: 0x0c4a6e, 
      roughness: 0.1, 
      metalness: 0.6,
      wireframe: true, // Grid look
      transparent: true,
      opacity: 0.6
  });
  
  // Base plane to hide grid see-through
  const deepWaterGeo = new THREE.PlaneGeometry(100, 100);
  deepWaterGeo.rotateX(-Math.PI / 2);
  const deepWaterMat = new THREE.MeshBasicMaterial({ color: 0x020617 });
  disposables.push(deepWaterGeo, deepWaterMat);
  const deepWater = new THREE.Mesh(deepWaterGeo, deepWaterMat);
  deepWater.position.y = -0.5;
  group.add(deepWater);

  disposables.push(waterGeo, waterMat);
  const water = new THREE.Mesh(waterGeo, waterMat);
  group.add(water);
  animatables.pmWater = water;

  // 3. Container Ship
  const shipGroup = new THREE.Group();
  group.add(shipGroup);
  animatables.pmShip = shipGroup;

  // Hull
  const hullGeo = new THREE.BoxGeometry(4, 3, 14);
  const hullMat = new THREE.MeshStandardMaterial({ color: 0xc2410c }); // Rust Orange
  disposables.push(hullGeo, hullMat);
  const hull = new THREE.Mesh(hullGeo, hullMat);
  hull.position.y = 0.5;
  shipGroup.add(hull);

  // Deck
  const deckGeo = new THREE.BoxGeometry(4.2, 0.5, 14.2);
  const deckMat = new THREE.MeshStandardMaterial({ color: 0x334155 });
  disposables.push(deckGeo, deckMat);
  const deck = new THREE.Mesh(deckGeo, deckMat);
  deck.position.y = 2.0;
  shipGroup.add(deck);

  // Bridge
  const bridgeGeo = new THREE.BoxGeometry(3.5, 2, 2);
  const bridgeMat = new THREE.MeshStandardMaterial({ color: 0xffffff });
  disposables.push(bridgeGeo, bridgeMat);
  const bridge = new THREE.Mesh(bridgeGeo, bridgeMat);
  bridge.position.set(0, 3.25, -5);
  shipGroup.add(bridge);

  // Containers (Instanced look via simple meshes for now)
  const contGeo = new THREE.BoxGeometry(0.8, 0.8, 2);
  const contColors = [0x1d4ed8, 0xb91c1c, 0x15803d, 0xfacc15];
  
  for(let x=-1.5; x<=1.5; x+=1) {
      for(let y=0; y<3; y++) {
          for(let z=-2; z<=5; z+=2.2) {
              const cMat = new THREE.MeshStandardMaterial({ color: contColors[Math.floor(Math.random()*contColors.length)] });
              disposables.push(cMat); // Note: ideally share mats
              const c = new THREE.Mesh(contGeo, cMat);
              c.position.set(x, 2.7 + y*0.8, z);
              shipGroup.add(c);
          }
      }
  }

  // 4. Force Vectors (Arrows)
  animatables.pmVectors = [];
  
  // Buoyancy (Green, Up)
  const bDir = new THREE.Vector3(0, 1, 0);
  const bOrigin = new THREE.Vector3(0, -2, 0); // Center of buoyancy roughly
  const bArrow = new THREE.ArrowHelper(bDir, bOrigin, 4, 0x22c55e, 1, 1);
  shipGroup.add(bArrow); // Attached to ship
  animatables.pmVectors.push(bArrow);

  // Gravity (Red, Down)
  // We want gravity to always point down world space, but visualizing relative to ship tilt is useful.
  // Let's attach to ship but counter-rotate? Or just visualize CG.
  const gDir = new THREE.Vector3(0, -1, 0);
  const gOrigin = new THREE.Vector3(0, 1, 0); // CG
  const gArrow = new THREE.ArrowHelper(gDir, gOrigin, 3, 0xef4444, 1, 1);
  shipGroup.add(gArrow);
  animatables.pmVectors.push(gArrow);

  // 5. Wake Particles
  const pCount = 500;
  const pGeo = new THREE.BufferGeometry();
  const pPos = new Float32Array(pCount * 3);
  const pLife = new Float32Array(pCount);
  
  for(let i=0; i<pCount; i++) {
      pPos[i*3] = (Math.random()-0.5) * 2; // Stern width
      pPos[i*3+1] = 0;
      pPos[i*3+2] = 7; // Stern Z
      pLife[i] = Math.random();
  }
  pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
  pGeo.setAttribute('life', new THREE.BufferAttribute(pLife, 1));
  
  const pMat = new THREE.PointsMaterial({ 
      color: 0xffffff, 
      size: 0.15, 
      transparent: true, 
      opacity: 0.6 
  });
  disposables.push(pGeo, pMat);
  const wake = new THREE.Points(pGeo, pMat);
  shipGroup.add(wake);
  animatables.pmWake = wake;
};

// Helper for wave height at x,z,t
function getWaveHeight(x: number, z: number, t: number, hs: number, tp: number, dir: number) {
    // Simple superposition of sine waves
    const angle = dir * Math.PI / 180;
    const kx = Math.cos(angle);
    const kz = Math.sin(angle);
    
    // Main Wave
    const omega = 2 * Math.PI / tp;
    const k = Math.pow(omega, 2) / 9.81; // Deep water dispersion
    const phase = k * (x*kx + z*kz) - omega * t;
    let h = (hs / 2) * Math.sin(phase);

    // Secondary Wave (Noise/Choppiness)
    const k2 = k * 1.5;
    const w2 = omega * 1.2;
    const phase2 = k2 * (x*Math.cos(angle+0.5) + z*Math.sin(angle+0.5)) - w2 * t;
    h += (hs / 6) * Math.sin(phase2);

    return h;
}

export const animatePortMotionScene = (animatables: SimAnimatables, time: number, simData: any) => {
    // simData: { waveHeight: number, wavePeriod: number, waveDir: number, shipSpeed: number }
    const Hs = simData?.waveHeight || 2.0;
    const Tp = simData?.wavePeriod || 8.0;
    const Dir = simData?.waveDir || 45; // Degrees
    const Speed = simData?.shipSpeed || 10; // Knots

    // 1. Animate Water Surface
    if (animatables.pmWater) {
        const geo = animatables.pmWater.geometry;
        const pos = geo.attributes.position;
        const initial = geo.userData.initialPos; // Assuming we stored this or reconstruct x,y

        // Plane is rotated X-90. So local (x, y, z) -> world (x, z, -y)? 
        // No, local Z is displacement (height).
        
        for(let i=0; i<pos.count; i++) {
            const x = initial.getX(i); // Local X
            const y = initial.getY(i); // Local Y (World Z)
            
            // Calculate height
            const z = getWaveHeight(x, y, time, Hs, Tp, Dir);
            
            pos.setZ(i, z);
        }
        pos.needsUpdate = true;
        geo.computeVertexNormals();
    }

    // 2. Animate Ship Motion (6-DOF Simplified)
    if (animatables.pmShip) {
        // Sample water at 3 points to determine plane
        // Center (0,0), Bow (0, -7), Stern (0, 7) relative to ship?
        // Ship length 14. 
        // World position of ship is (0,0,0) generally for this sim.
        
        // Front/Back/Left/Right sampling for Pitch/Roll
        const frontH = getWaveHeight(0, -6, time, Hs, Tp, Dir);
        const backH = getWaveHeight(0, 6, time, Hs, Tp, Dir);
        const leftH = getWaveHeight(-2, 0, time, Hs, Tp, Dir);
        const rightH = getWaveHeight(2, 0, time, Hs, Tp, Dir);
        const centerH = getWaveHeight(0, 0, time, Hs, Tp, Dir);

        // Heave (Lagged)
        // Lerp current Y to centerH
        animatables.pmShip.position.y = THREE.MathUtils.lerp(animatables.pmShip.position.y, centerH, 0.1);

        // Pitch (Atan of diff / length)
        const targetPitch = Math.atan2(backH - frontH, 12); // +Z is stern in model? Check build.
        // In build: Bridge at -5 (Back). Hull length 14 (-7 to 7).
        // Let's say -Z is Bow. So front is -6, back is 6.
        // Pitch: Nose up = +X rot?
        // 3D rotation X: + is nose down if nose is -Z? No, RHR.
        // Let's just lerp to calculated angle.
        animatables.pmShip.rotation.x = THREE.MathUtils.lerp(animatables.pmShip.rotation.x, targetPitch, 0.05);

        // Roll
        const targetRoll = Math.atan2(leftH - rightH, 4);
        animatables.pmShip.rotation.z = THREE.MathUtils.lerp(animatables.pmShip.rotation.z, targetRoll, 0.05);

        // Yaw (Drift)
        // Small oscillation
        animatables.pmShip.rotation.y = Math.sin(time * 0.2) * 0.05;

        // Force Vectors
        if (animatables.pmVectors) {
            // Gravity always points down (-Y World)
            // Ship rotates, so we must inverse rotate vector if attached to ship?
            // Actually they are children of shipGroup.
            // If we want gravity to look vertical in world, we rotate opposite to ship.
            animatables.pmVectors[1].rotation.x = -animatables.pmShip.rotation.x;
            animatables.pmVectors[1].rotation.z = -animatables.pmShip.rotation.z;
            
            // Buoyancy is perpendicular to water surface approx (or ship deck)
            // Just let it rotate with ship (normal to deck)
        }
    }

    // 3. Wake Particles
    if (animatables.pmWake) {
        const pos = animatables.pmWake.geometry.attributes.position.array as Float32Array;
        const life = animatables.pmWake.geometry.attributes.life.array as Float32Array;
        
        for(let i=0; i<life.length; i++) {
            life[i] -= 0.02;
            if (life[i] <= 0) {
                life[i] = 1.0;
                // Respawn at Stern
                pos[i*3] = (Math.random()-0.5) * 2;
                pos[i*3+1] = 0;
                pos[i*3+2] = 7;
            } else {
                // Move backward (+Z)
                pos[i*3+2] += (Speed / 10) * 0.2;
                // Spread
                pos[i*3] += (Math.random()-0.5) * 0.05;
            }
        }
        animatables.pmWake.geometry.attributes.position.needsUpdate = true;
    }
};
