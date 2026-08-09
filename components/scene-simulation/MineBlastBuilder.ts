
import * as THREE from 'three';
import { SimAnimatables } from './three-types';

export const initMineBlastScene = (
  group: THREE.Group,
  animatables: SimAnimatables,
  disposables: { dispose: () => void }[]
) => {
  // 1. Lighting (Dynamic/Explosive look)
  const ambient = new THREE.AmbientLight(0xffffff, 0.4);
  group.add(ambient);

  const sunLight = new THREE.DirectionalLight(0xffffff, 1);
  sunLight.position.set(-10, 20, -10);
  group.add(sunLight);

  const blastLight = new THREE.PointLight(0xffaa00, 0, 50); // Intially off
  blastLight.position.set(0, 5, 0);
  group.add(blastLight);
  // Store light in userData of group for access in animation if needed, 
  // or better, just add to animatables if we typed it. For now, we'll access via children logic or simple assumption.
  (group as any).userData.blastLight = blastLight;

  // 2. Terrain (Open Pit Bench)
  const benchShape = new THREE.Shape();
  benchShape.moveTo(-30, -30);
  benchShape.lineTo(30, -30);
  benchShape.lineTo(30, 30);
  benchShape.lineTo(-30, 30);
  
  const benchGeo = new THREE.PlaneGeometry(60, 60, 64, 64);
  const pos = benchGeo.attributes.position;
  
  // Create a step/bench shape
  for(let i=0; i<pos.count; i++){
      const x = pos.getX(i);
      const y = pos.getY(i); // Z in world
      let z = 0;
      
      // Upper Bench (x < -5)
      if (x < -5) z = 10;
      // Slope (-5 to 5)
      else if (x <= 5) z = 10 - (x + 5);
      // Lower Bench (x > 5)
      else z = 0;

      // Add noise
      z += Math.random() * 0.2;
      pos.setZ(i, z);
  }
  benchGeo.computeVertexNormals();
  benchGeo.rotateX(-Math.PI / 2);

  const benchMat = new THREE.MeshStandardMaterial({ 
      color: 0x475569, 
      roughness: 0.9,
      flatShading: true,
      wireframe: false
  });
  const wireMat = new THREE.MeshBasicMaterial({ color: 0x94a3b8, wireframe: true, transparent: true, opacity: 0.05 });
  
  disposables.push(benchGeo, benchMat, wireMat);
  const bench = new THREE.Mesh(benchGeo, benchMat);
  const benchWire = new THREE.Mesh(benchGeo, wireMat);
  group.add(bench);
  group.add(benchWire);
  animatables.blastBench = bench;

  // 3. Blast Holes (Drill Pattern on Upper Bench)
  animatables.blastHoles = [];
  const holeGeo = new THREE.CylinderGeometry(0.2, 0.2, 2, 8);
  const holeMat = new THREE.MeshBasicMaterial({ color: 0xef4444 }); // Red markers
  disposables.push(holeGeo, holeMat);

  // 3 Rows of 4 holes
  for(let r=0; r<3; r++) {
      for(let c=0; c<4; c++) {
          const holeGroup = new THREE.Group();
          const x = -20 + r * 4;
          const z = -10 + c * 5;
          const y = 10; // On upper bench

          const mesh = new THREE.Mesh(holeGeo, holeMat);
          mesh.position.y = 1; // Stick up
          holeGroup.add(mesh);
          
          holeGroup.position.set(x, y, z);
          group.add(holeGroup);
          
          // Store delay info
          holeGroup.userData = { 
              delay: r * 50 + c * 25, // ms simulation
              detonated: false 
          };
          animatables.blastHoles.push(holeGroup);
      }
  }

  // 4. Shockwaves (Pool of expanding spheres)
  animatables.shockwaves = [];
  const shockGeo = new THREE.SphereGeometry(1, 32, 32);
  const shockMat = new THREE.MeshBasicMaterial({ 
      color: 0xffaa00, 
      transparent: true, 
      opacity: 0,
      wireframe: true 
  });
  disposables.push(shockGeo, shockMat);

  // Create one shockwave per hole
  animatables.blastHoles.forEach(hole => {
      const wave = new THREE.Mesh(shockGeo, shockMat.clone());
      wave.position.copy(hole.position);
      wave.visible = false;
      group.add(wave);
      animatables.shockwaves?.push(wave);
  });

  // 5. Flyrock / Debris Particles
  const pCount = 1000;
  const pGeo = new THREE.BufferGeometry();
  const pPos = new Float32Array(pCount * 3);
  const pVel = new Float32Array(pCount * 3);
  const pLife = new Float32Array(pCount); // 0=dead, >0=alive
  
  pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
  pGeo.setAttribute('velocity', new THREE.BufferAttribute(pVel, 3));
  pGeo.setAttribute('life', new THREE.BufferAttribute(pLife, 1));
  
  const pMat = new THREE.PointsMaterial({ color: 0xa8a29e, size: 0.3 });
  disposables.push(pGeo, pMat);
  const particles = new THREE.Points(pGeo, pMat);
  group.add(particles);
  animatables.flyrock = particles;

  // 6. Ground Ripple (Visual ring on floor)
  const ringGeo = new THREE.RingGeometry(0.5, 2, 64);
  ringGeo.rotateX(-Math.PI / 2);
  const ringMat = new THREE.MeshBasicMaterial({ 
      color: 0xff4444, 
      transparent: true, 
      opacity: 0, 
      side: THREE.DoubleSide 
  });
  disposables.push(ringGeo, ringMat);
  const ripple = new THREE.Mesh(ringGeo, ringMat);
  ripple.position.y = 0.1; // Just above lower bench
  ripple.position.x = 10; // Center of impact area approx
  group.add(ripple);
  animatables.groundRipple = ripple;
};

export const animateMineBlastScene = (animatables: SimAnimatables, time: number, simData: any) => {
    // simData: { trigger: boolean, startTime: number }
    if (!simData || !simData.trigger) return;

    const elapsed = (time - simData.startTime) * 1000; // ms
    const speedScale = 2.0; // Visual speedup
    
    // 1. Detonate Holes
    if (animatables.blastHoles && animatables.shockwaves) {
        animatables.blastHoles.forEach((hole, i) => {
            const delay = hole.userData.delay;
            const wave = animatables.shockwaves![i];
            
            // Check if time to detonate
            if (elapsed >= delay && elapsed < delay + 2000) {
                if (!hole.userData.detonated) {
                    hole.userData.detonated = true;
                    // Flash hole color
                    (hole.children[0] as THREE.Mesh).material = new THREE.MeshBasicMaterial({color: 0xffffff});
                    
                    // Trigger particles
                    triggerDebris(animatables.flyrock!, hole.position);
                }
                
                // Expand Shockwave
                wave.visible = true;
                const age = (elapsed - delay) / 1000; // seconds alive
                const scale = 1 + age * 15; // Expansion rate
                wave.scale.setScalar(scale);
                
                // Fade out
                (wave.material as THREE.Material).opacity = Math.max(0, 0.8 - age);
            } else if (elapsed > delay + 2000) {
                 wave.visible = false;
            }
        });
    }

    // 2. Animate Debris (Physics)
    if (animatables.flyrock) {
        const pos = animatables.flyrock.geometry.attributes.position.array as Float32Array;
        const vel = animatables.flyrock.geometry.attributes.velocity.array as Float32Array;
        const life = animatables.flyrock.geometry.attributes.life.array as Float32Array;
        
        for(let i=0; i<life.length; i++) {
            if (life[i] > 0) {
                // Gravity
                vel[i*3+1] -= 0.02; // Y gravity
                
                // Move
                pos[i*3] += vel[i*3];
                pos[i*3+1] += vel[i*3+1];
                pos[i*3+2] += vel[i*3+2];
                
                // Floor collision (Simple y < 0 check for lower bench)
                if (pos[i*3+1] < 0) {
                    pos[i*3+1] = 0;
                    vel[i*3+1] *= -0.3; // Bounce damping
                    vel[i*3] *= 0.8; // Friction
                    vel[i*3+2] *= 0.8;
                    life[i] -= 0.05; // Decay on ground
                }
                
                life[i] -= 0.01; // Decay in air
                
                if (life[i] <= 0) {
                    // Hide
                    pos[i*3+1] = -100;
                }
            }
        }
        animatables.flyrock.geometry.attributes.position.needsUpdate = true;
    }

    // 3. Ground Ripple (Seismic Wave visual)
    if (animatables.groundRipple) {
        // Continuous waves emitting from center of blast zone
        const waveT = (elapsed % 2000) / 2000;
        animatables.groundRipple.scale.setScalar(1 + waveT * 30);
        (animatables.groundRipple.material as THREE.Material).opacity = (1 - waveT) * 0.5;
        
        // Position roughly at center of blast pattern
        animatables.groundRipple.position.set(-10, 10.1, 0); // Upper bench surface
    }
};

function triggerDebris(system: THREE.Points, origin: THREE.Vector3) {
    const pos = system.geometry.attributes.position.array as Float32Array;
    const vel = system.geometry.attributes.velocity.array as Float32Array;
    const life = system.geometry.attributes.life.array as Float32Array;
    
    // Activate a batch of particles
    let count = 0;
    for(let i=0; i<life.length && count < 50; i++) {
        if (life[i] <= 0) {
            life[i] = 1.0;
            pos[i*3] = origin.x + (Math.random()-0.5);
            pos[i*3+1] = origin.y;
            pos[i*3+2] = origin.z + (Math.random()-0.5);
            
            // Explosion velocity (Outward + Up)
            vel[i*3] = 2 + Math.random() * 2; // Forward throw (x+)
            vel[i*3+1] = 1 + Math.random() * 3; // Up
            vel[i*3+2] = (Math.random()-0.5) * 2; // Spread
            
            count++;
        }
    }
    system.geometry.attributes.position.needsUpdate = true;
    system.geometry.attributes.life.needsUpdate = true;
}
