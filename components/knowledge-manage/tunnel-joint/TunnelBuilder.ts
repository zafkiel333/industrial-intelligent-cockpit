
import * as THREE from 'three';
import { TunnelAnimatables, JointHealthState } from './three-types';

export const initTunnelScene = (
  group: THREE.Group, 
  animatables: TunnelAnimatables,
  disposables: { dispose: () => void }[]
) => {
  // --- 材质 ---
  const concreteMat = new THREE.MeshStandardMaterial({ 
    color: 0x64748b, roughness: 0.9, metalness: 0.1 
  });
  const sealMat = new THREE.MeshStandardMaterial({ 
    color: 0x111111, roughness: 0.4, metalness: 0.5 
  }); // 黑色橡胶
  const steelMat = new THREE.MeshStandardMaterial({ 
    color: 0x94a3b8, roughness: 0.3, metalness: 0.8 
  });
  const wireMat = new THREE.MeshBasicMaterial({ 
    color: 0x22d3ee, wireframe: true, transparent: true, opacity: 0.1 
  });
  const waterPartMat = new THREE.PointsMaterial({
    color: 0xa5f3fc, size: 0.05, transparent: true, opacity: 0.6
  });

  disposables.push(concreteMat, sealMat, steelMat, wireMat, waterPartMat);

  // Helper to create a hollow tunnel segment
  const createSegment = (length: number) => {
      const segGroup = new THREE.Group();
      
      // Outer shell dimensions
      const w = 10, h = 6;
      const thickness = 0.8;
      
      // Floor
      const floor = new THREE.Mesh(new THREE.BoxGeometry(w, thickness, length), concreteMat);
      floor.position.y = -h/2 + thickness/2;
      segGroup.add(floor);
      
      // Ceiling
      const ceil = new THREE.Mesh(new THREE.BoxGeometry(w, thickness, length), concreteMat);
      ceil.position.y = h/2 - thickness/2;
      segGroup.add(ceil);
      
      // Walls
      const wallGeo = new THREE.BoxGeometry(thickness, h - 2*thickness, length);
      const wallL = new THREE.Mesh(wallGeo, concreteMat);
      wallL.position.set(-w/2 + thickness/2, 0, 0);
      const wallR = new THREE.Mesh(wallGeo, concreteMat);
      wallR.position.set(w/2 - thickness/2, 0, 0);
      segGroup.add(wallL, wallR);

      // Wireframe overlay for "X-Ray" feel
      const wireBox = new THREE.Mesh(new THREE.BoxGeometry(w+0.1, h+0.1, length), wireMat);
      segGroup.add(wireBox);

      return segGroup;
  };

  // 1. Tunnel Segments
  const seg1 = createSegment(10);
  seg1.position.z = -5.2; // Move back
  group.add(seg1);
  animatables.segment1 = seg1;

  const seg2 = createSegment(10);
  seg2.position.z = 5.2; // Move forward
  group.add(seg2);
  animatables.segment2 = seg2;

  // 2. GINA Seal (Between segments)
  // Approximate GINA shape with a torus/tube squashed rect
  // Path for tube
  const width = 8.5; // Slightly smaller than tunnel w
  const height = 4.5;
  const curve = new THREE.CurvePath<THREE.Vector3>();
  
  // Create a rounded rectangle path
  const shapePts = [];
  shapePts.push(new THREE.Vector2(-width/2, -height/2));
  shapePts.push(new THREE.Vector2(width/2, -height/2));
  shapePts.push(new THREE.Vector2(width/2, height/2));
  shapePts.push(new THREE.Vector2(-width/2, height/2));
  shapePts.push(new THREE.Vector2(-width/2, -height/2));
  
  const shape = new THREE.Shape(shapePts);
  const sealGeo = new THREE.ExtrudeGeometry(shape, { depth: 0.4, bevelEnabled: true, bevelSize: 0.1, bevelThickness: 0.1 });
  disposables.push(sealGeo);
  
  const seal = new THREE.Mesh(sealGeo, sealMat);
  seal.position.z = -0.2; // Center it
  group.add(seal);
  animatables.ginaSeal = seal;

  // 3. Shear Keys (Vertical & Horizontal)
  const shearGroup = new THREE.Group();
  const vKeyGeo = new THREE.BoxGeometry(1, 2, 1.5);
  const hKeyGeo = new THREE.BoxGeometry(2, 1, 1.5);
  disposables.push(vKeyGeo, hKeyGeo);
  
  // Center Vertical Key
  const vKey = new THREE.Mesh(vKeyGeo, steelMat);
  shearGroup.add(vKey);
  
  // Side Horizontal Keys
  const hKeyL = new THREE.Mesh(hKeyGeo, steelMat);
  hKeyL.position.set(-3, 0, 0);
  shearGroup.add(hKeyL);
  const hKeyR = new THREE.Mesh(hKeyGeo, steelMat);
  hKeyR.position.set(3, 0, 0);
  shearGroup.add(hKeyR);
  
  // Attach to Segment 1 (or make floating between)
  shearGroup.position.z = -0.5;
  group.add(shearGroup);
  animatables.shearKeys = shearGroup;

  // 4. Underwater Particles (Marine Snow)
  const pCount = 500;
  const pGeo = new THREE.BufferGeometry();
  const pPos = new Float32Array(pCount * 3);
  for(let i=0; i<pCount; i++) {
      pPos[i*3] = (Math.random() - 0.5) * 20;
      pPos[i*3+1] = (Math.random() - 0.5) * 15;
      pPos[i*3+2] = (Math.random() - 0.5) * 30;
  }
  pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
  disposables.push(pGeo);
  const particles = new THREE.Points(pGeo, waterPartMat);
  group.add(particles);
  animatables.particles = particles;

  // 5. Scanning Light
  const spot = new THREE.SpotLight(0x00ffff, 5, 20, 0.5, 0.5, 1);
  spot.position.set(0, 5, 5);
  spot.target.position.set(0, 0, 0);
  group.add(spot);
  group.add(spot.target);
  animatables.scannerLight = spot;

  // Grid floor (Seabed)
  const grid = new THREE.GridHelper(40, 40, 0x1e293b, 0x0f172a);
  grid.position.y = -5;
  group.add(grid);
};

export const animateTunnelScene = (
  animatables: TunnelAnimatables, 
  state: JointHealthState,
  time: number
) => {
  // 1. Joint Breathing (Gap change)
  let targetGap = 0.4; // Normal gap
  let sealScale = 1.0;
  let sealColor = 0x111111;

  if (state === 'COMPRESSION') {
      targetGap = 0.2;
      sealScale = 0.8; // Squashed
      sealColor = 0xf59e0b; // Yellow warning (pressure)
  } else if (state === 'EXPANSION') {
      targetGap = 0.8;
      sealScale = 1.2; // Stretched
      sealColor = 0x3b82f6; // Cold
  } else if (state === 'LEAK_WARN') {
      targetGap = 0.45;
      sealColor = 0xef4444; // Red Alert
  } else if (state === 'SHEAR_STRESS') {
      // Differential settlement animation
      if (animatables.segment2) {
          animatables.segment2.position.y = Math.sin(time) * 0.2;
      }
      sealColor = 0xff00ff; // Stress purple
  }

  // Apply Gap
  if (animatables.segment1) animatables.segment1.position.z = THREE.MathUtils.lerp(animatables.segment1.position.z, -5 - targetGap/2, 0.1);
  if (animatables.segment2) animatables.segment2.position.z = THREE.MathUtils.lerp(animatables.segment2.position.z, 5 + targetGap/2, 0.1);

  // Apply Seal deformation
  if (animatables.ginaSeal) {
      animatables.ginaSeal.scale.z = THREE.MathUtils.lerp(animatables.ginaSeal.scale.z, sealScale, 0.1);
      (animatables.ginaSeal.material as THREE.MeshStandardMaterial).color.setHex(sealColor);
      
      // Pulse emission if warning
      if (state === 'LEAK_WARN' || state === 'SHEAR_STRESS') {
          (animatables.ginaSeal.material as THREE.MeshStandardMaterial).emissive.setHex(sealColor);
          (animatables.ginaSeal.material as THREE.MeshStandardMaterial).emissiveIntensity = 0.5 + Math.sin(time * 5) * 0.3;
      } else {
          (animatables.ginaSeal.material as THREE.MeshStandardMaterial).emissiveIntensity = 0;
      }
  }

  // 2. Scanner Light
  if (animatables.scannerLight) {
      animatables.scannerLight.position.x = Math.sin(time * 0.5) * 5;
      animatables.scannerLight.position.z = Math.cos(time * 0.5) * 5;
      animatables.scannerLight.lookAt(0, 0, 0);
  }

  // 3. Particles
  if (animatables.particles) {
      animatables.particles.rotation.y = time * 0.05;
      // In leak mode, accelerate particles near joint? 
      // Simplified: just drift
  }
};
