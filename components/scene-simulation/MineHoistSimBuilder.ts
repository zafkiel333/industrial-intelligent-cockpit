
import * as THREE from 'three';
import { SimAnimatables } from './three-types';

export const initMineHoistSimScene = (
  group: THREE.Group,
  animatables: SimAnimatables,
  disposables: { dispose: () => void }[]
) => {
  // 1. Environment (Deep Shaft)
  const shaftGeo = new THREE.CylinderGeometry(8, 8, 80, 32, 10, true);
  const shaftMat = new THREE.MeshBasicMaterial({ 
      color: 0x1c1917, 
      wireframe: true, 
      transparent: true, 
      opacity: 0.1 
  });
  disposables.push(shaftGeo, shaftMat);
  const shaft = new THREE.Mesh(shaftGeo, shaftMat);
  shaft.position.y = -30; // Extend deep down
  group.add(shaft);

  // Surface Platform
  const platformGeo = new THREE.BoxGeometry(20, 1, 20);
  const platformMat = new THREE.MeshStandardMaterial({ color: 0x334155 });
  disposables.push(platformGeo, platformMat);
  const platform = new THREE.Mesh(platformGeo, platformMat);
  platform.position.y = 0;
  group.add(platform);

  // 2. Headframe (Tower)
  const towerGroup = new THREE.Group();
  const legGeo = new THREE.BoxGeometry(1, 25, 1);
  const legMat = new THREE.MeshStandardMaterial({ color: 0x475569 });
  disposables.push(legGeo, legMat);

  const l1 = new THREE.Mesh(legGeo, legMat); l1.position.set(-4, 12.5, 4);
  const l2 = new THREE.Mesh(legGeo, legMat); l2.position.set(4, 12.5, 4);
  const l3 = new THREE.Mesh(legGeo, legMat); l3.position.set(-4, 12.5, -4);
  const l4 = new THREE.Mesh(legGeo, legMat); l4.position.set(4, 12.5, -4);
  
  // Cross bracing
  const braceGeo = new THREE.BoxGeometry(9, 1, 9);
  const brace = new THREE.Mesh(braceGeo, legMat);
  brace.position.y = 25;

  towerGroup.add(l1, l2, l3, l4, brace);
  group.add(towerGroup);

  // 3. Hoist Drum (Koepe Friction Wheel) - Top of tower
  const drumGroup = new THREE.Group();
  drumGroup.position.set(0, 28, 0);
  
  const drumGeo = new THREE.CylinderGeometry(3, 3, 2, 32);
  drumGeo.rotateZ(Math.PI / 2);
  const drumMat = new THREE.MeshStandardMaterial({ color: 0xf97316, metalness: 0.6, roughness: 0.4 });
  disposables.push(drumGeo, drumMat);
  const drum = new THREE.Mesh(drumGeo, drumMat);
  drumGroup.add(drum);

  // Drum details (Spokes/Brakes)
  const brakeGeo = new THREE.CylinderGeometry(3.2, 3.2, 0.5, 32);
  brakeGeo.rotateZ(Math.PI / 2);
  const brakeMat = new THREE.MeshStandardMaterial({ color: 0x111111 });
  disposables.push(brakeGeo, brakeMat);
  const brakeL = new THREE.Mesh(brakeGeo, brakeMat); brakeL.position.x = -1;
  const brakeR = new THREE.Mesh(brakeGeo, brakeMat); brakeR.position.x = 1;
  drumGroup.add(brakeL, brakeR);

  group.add(drumGroup);
  animatables.hoistDrum = drumGroup;

  // 4. Sheaves (Guide Wheels)
  // Usually lower than the drum or aligned. Let's put them slightly offset.
  // For a tower mounted hoist, the drum is often at the top.
  // Let's assume ground mounted hoist for visual complexity? No, tower mounted is cooler.
  // We'll stick with the drum at top.
  
  // 5. Cage & Counterweight
  const cageGroup = new THREE.Group();
  const cageGeo = new THREE.BoxGeometry(2.5, 4, 2.5);
  const cageMat = new THREE.MeshStandardMaterial({ color: 0xeab308, wireframe: false });
  const cageFrameMat = new THREE.MeshBasicMaterial({ color: 0xffffff, wireframe: true });
  disposables.push(cageGeo, cageMat, cageFrameMat);
  
  const cageMesh = new THREE.Mesh(cageGeo, cageMat);
  const cageFrame = new THREE.Mesh(cageGeo, cageFrameMat);
  cageGroup.add(cageMesh, cageFrame);
  group.add(cageGroup);
  animatables.hoistCage = cageGroup;

  const cwGroup = new THREE.Group();
  const cwGeo = new THREE.BoxGeometry(1.5, 6, 1);
  const cwMat = new THREE.MeshStandardMaterial({ color: 0x64748b });
  disposables.push(cwGeo, cwMat);
  const cwMesh = new THREE.Mesh(cwGeo, cwMat);
  cwGroup.add(cwMesh);
  group.add(cwGroup);
  animatables.hoistCounterWeight = cwGroup;

  // 6. Wire Ropes (LineSegments for multi-rope)
  // 4 ropes typically
  const ropeCount = 4;
  const ropePoints = [];
  const ropeIndices = [];
  
  // We need dynamic updating geometry
  const ropeGeo = new THREE.BufferGeometry();
  // 4 ropes * 2 segments (Drum->Cage, Drum->CW) * 2 points per segment = 16 points?
  // Let's do simple lines: Drum tangent -> Top of Cage. Drum tangent -> Top of CW.
  // 8 vertices total for 4 lines?
  // Actually, let's make it simpler: 2 main line sets.
  // Vertices will be updated in animate frame.
  const maxRopeVerts = ropeCount * 2 * 2; // 16 vertices
  const ropePos = new Float32Array(maxRopeVerts * 3);
  ropeGeo.setAttribute('position', new THREE.BufferAttribute(ropePos, 3));
  
  const ropeMat = new THREE.LineBasicMaterial({ color: 0x94a3b8, linewidth: 2 });
  disposables.push(ropeGeo, ropeMat);
  
  const ropes = new THREE.LineSegments(ropeGeo, ropeMat);
  // Prevent frustum culling issues with dynamic geo
  ropes.frustumCulled = false; 
  group.add(ropes);
  animatables.hoistRopes = ropes;

  // Lighting
  const spot = new THREE.SpotLight(0xffaa00, 5, 40, 0.5, 0.5, 1);
  spot.position.set(5, 25, 5);
  spot.target = cageGroup;
  group.add(spot);
};

export const animateMineHoistSimScene = (animatables: SimAnimatables, time: number, simData: any) => {
    // simData: { depth: number (0-800), velocity: number, tension: number[] }
    // depth is meters. In 3D scene, scale is approx 1 unit = 10m?
    // Let's scale: Scene Y 0 is surface. Shaft goes to -80.
    // So 800m depth maps to -80 Y. Scale factor 0.1.
    
    const targetDepth = (simData?.depth || 0) * 0.1; 
    const velocity = simData?.velocity || 0;
    
    // Cage Position
    if (animatables.hoistCage) {
        // Smooth lerp is handled by the simData driving the loop, 
        // but here we just set position directly assuming high refresh rate from React
        animatables.hoistCage.position.y = -targetDepth; 
        animatables.hoistCage.position.x = -2; // Left side
    }

    // Counterweight Position
    // Moves opposite. If cage is at 0, CW is at bottom (-80). If cage is at -80, CW is at 0.
    // Assuming max depth 800m (80 units).
    if (animatables.hoistCounterWeight) {
        const cwY = -80 + targetDepth; 
        animatables.hoistCounterWeight.position.y = cwY;
        animatables.hoistCounterWeight.position.x = 2; // Right side
    }

    // Drum Rotation
    if (animatables.hoistDrum) {
        // Rotate based on velocity
        // v = r * omega -> omega = v / r.
        // Drum radius 3 units.
        // Visual rotation accumulation
        animatables.hoistDrum.rotation.x += velocity * 0.05; // Arbitrary visual scale
    }

    // Update Ropes
    if (animatables.hoistRopes) {
        const pos = animatables.hoistRopes.geometry.attributes.position.array as Float32Array;
        const cageY = animatables.hoistCage?.position.y || 0;
        const cwY = animatables.hoistCounterWeight?.position.y || -80;
        const drumY = 28;
        const drumR = 3;

        // 4 Ropes
        // Cage Ropes (Left side)
        for(let i=0; i<4; i++) {
            const zOffset = (i - 1.5) * 0.5; // Spread across drum width
            
            // Start (Drum Tangent approx)
            const idx = i * 6; // 6 floats per line segment (2 verts * 3 coords)
            
            // Drum Point (Left Tangent)
            pos[idx] = -2; // Align X with cage
            pos[idx+1] = drumY;
            pos[idx+2] = zOffset;

            // Cage Point
            pos[idx+3] = -2;
            pos[idx+4] = cageY + 2; // Top of cage
            pos[idx+5] = zOffset;
        }

        // Counterweight Ropes (Right side)
        for(let i=0; i<4; i++) {
            const zOffset = (i - 1.5) * 0.5;
            const idx = 24 + i * 6; // Offset after first 4 lines

            // Drum Point (Right Tangent)
            pos[idx] = 2; // Align X with CW
            pos[idx+1] = drumY;
            pos[idx+2] = zOffset;

            // CW Point
            pos[idx+3] = 2;
            pos[idx+4] = cwY + 3; // Top of CW
            pos[idx+5] = zOffset;
        }

        animatables.hoistRopes.geometry.attributes.position.needsUpdate = true;
    }
};
