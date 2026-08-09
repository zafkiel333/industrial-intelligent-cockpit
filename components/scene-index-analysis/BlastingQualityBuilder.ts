
import * as THREE from 'three';
import { Animatables, SceneType } from '../three-types';

export const isBlastingQualityScene = (type: SceneType): boolean => {
  return type === 'blasting-quality-analysis';
};

export const setupBlastingQualityCamera = (camera: THREE.PerspectiveCamera) => {
  camera.position.set(15, 12, 15);
  camera.lookAt(0, 0, 0);
};

export const initBlastingQualityScene = (
  type: SceneType, 
  group: THREE.Group, 
  animatables: Animatables, 
  disposables: { dispose: () => void }[]
) => {
  if (type !== 'blasting-quality-analysis') return;

  // 1. Bench Block (The rock mass)
  const benchGeo = new THREE.BoxGeometry(20, 4, 15);
  benchGeo.translate(0, -2, 0);
  const benchMat = new THREE.MeshStandardMaterial({ 
    color: 0x292524, 
    roughness: 0.9, 
    wireframe: true,
    transparent: true,
    opacity: 0.1
  });
  disposables.push(benchGeo, benchMat);
  const bench = new THREE.Mesh(benchGeo, benchMat);
  group.add(bench);

  // 2. Blast Holes
  animatables.blastHoles = [];
  animatables.blastShockwaves = [];
  const holeGeo = new THREE.CylinderGeometry(0.2, 0.2, 4);
  const holeMat = new THREE.MeshBasicMaterial({ color: 0xf97316 });
  disposables.push(holeGeo, holeMat);
  
  // Shockwave Sphere
  const waveGeo = new THREE.SphereGeometry(1, 32, 32);
  const waveMat = new THREE.MeshBasicMaterial({ 
    color: 0xef4444, 
    transparent: true, 
    opacity: 0.4, 
    wireframe: true
  });
  disposables.push(waveGeo, waveMat);

  // Create a grid of holes (3 rows of 5)
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 5; col++) {
      const x = (col - 2) * 3;
      const z = (row - 1) * 3;
      
      // Hole Marker
      const hole = new THREE.Mesh(holeGeo, holeMat);
      hole.position.set(x, -2, z);
      group.add(hole);
      animatables.blastHoles.push(hole);

      // Shockwave (Initially hidden/small)
      const wave = new THREE.Mesh(waveGeo, waveMat.clone()); // Clone mat for individual opacity control
      wave.position.set(x, -2, z);
      wave.scale.set(0, 0, 0);
      group.add(wave);
      animatables.blastShockwaves.push(wave);
      
      // Store timing data on userData
      // Row by row timing (e.g., 25ms delay between rows, 10ms between holes)
      (wave as any).userData = {
        delay: row * 20 + col * 10,
        active: false,
        age: 0
      };
    }
  }

  // 3. Debris / Heave Particles
  const pCount = 500;
  const pGeo = new THREE.BufferGeometry();
  const pPos = new Float32Array(pCount * 3);
  const pVel = new Float32Array(pCount * 3);
  
  for(let i=0; i<pCount; i++) {
    pPos[i*3] = (Math.random() - 0.5) * 15;
    pPos[i*3+1] = 0.1;
    pPos[i*3+2] = (Math.random() - 0.5) * 10;
    
    // Initial random velocities
    pVel[i*3] = (Math.random() - 0.5) * 0.1;
    pVel[i*3+1] = Math.random() * 0.2;
    pVel[i*3+2] = (Math.random() - 0.5) * 0.1;
  }
  
  pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
  // Store velocity in normal for convenience or custom attr
  pGeo.setAttribute('velocity', new THREE.BufferAttribute(pVel, 3));
  
  const pMat = new THREE.PointsMaterial({ color: 0x78716c, size: 0.15 });
  disposables.push(pGeo, pMat);
  const particles = new THREE.Points(pGeo, pMat);
  group.add(particles);
  animatables.blastDebris = particles;
};

export const animateBlastingQualityScene = (type: SceneType, animatables: Animatables, time: number) => {
  if (type !== 'blasting-quality-analysis') return;

  // Simulation Loop Period: 200 units (approx 3-4 seconds)
  const loopTime = (time * 50) % 300; 

  // Animate Shockwaves
  if (animatables.blastShockwaves) {
    animatables.blastShockwaves.forEach(wave => {
      const data = (wave as any).userData;
      
      // Trigger
      if (loopTime >= data.delay && loopTime < data.delay + 50) {
        // Expand
        const age = loopTime - data.delay;
        const scale = 1 + age * 0.1;
        wave.scale.set(scale, scale, scale);
        
        // Fade out
        const opacity = 1 - (age / 50);
        (wave.material as THREE.MeshBasicMaterial).opacity = Math.max(0, opacity * 0.5);
      } else {
        // Reset
        wave.scale.set(0, 0, 0);
      }
    });
  }

  // Animate Debris (Heave)
  // Debris starts flying after the main blast sequence starts (approx t=50)
  if (animatables.blastDebris) {
    const positions = animatables.blastDebris.geometry.attributes.position.array as Float32Array;
    const velocities = animatables.blastDebris.geometry.attributes.velocity.array as Float32Array;
    
    const blastStart = 50;
    const blastEnd = 200;

    for(let i=0; i<positions.length/3; i++) {
      if (loopTime > blastStart && loopTime < blastEnd) {
        // Apply velocity (Physics simulation)
        positions[i*3] += velocities[i*3]; // x
        positions[i*3+1] += velocities[i*3+1]; // y
        positions[i*3+2] += velocities[i*3+2]; // z
        
        // Gravity
        velocities[i*3+1] -= 0.005;
        
        // Floor collision
        if (positions[i*3+1] < 0) {
          positions[i*3+1] = 0;
          velocities[i*3+1] = 0;
          velocities[i*3] *= 0.5; // Friction
          velocities[i*3+2] *= 0.5;
        }
      } else if (loopTime <= blastStart) {
        // Reset positions
        // We rely on initial random logic but simplified here to reset to ground
        if (positions[i*3+1] > 0.2) { 
           // Only reset if it moved significantly, simple reset to base level
           positions[i*3+1] = 0.1;
           velocities[i*3+1] = Math.random() * 0.2 + 0.1; // Reset upward energy
        }
      }
    }
    animatables.blastDebris.geometry.attributes.position.needsUpdate = true;
  }
};
