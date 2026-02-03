
import * as THREE from 'three';
import { Animatables, SceneType } from '../three-types';

export const isCraneEfficiencyScene = (type: SceneType): boolean => {
  return type === 'crane-efficiency-analysis';
};

export const setupCraneEfficiencyCamera = (camera: THREE.PerspectiveCamera) => {
  camera.position.set(20, 15, 20); // Orthographic-like perspective
  camera.lookAt(0, 5, 0);
};

export const initCraneEfficiencyScene = (
  type: SceneType, 
  group: THREE.Group, 
  animatables: Animatables, 
  disposables: { dispose: () => void }[]
) => {
  if (type !== 'crane-efficiency-analysis') return;

  // 1. Grid Floor (Blueprint Style)
  const grid = new THREE.GridHelper(40, 40, 0x1e3a8a, 0x0f172a);
  group.add(grid);

  // 2. Crane Structure (Simplified Holographic Wireframe look)
  const craneGroup = new THREE.Group();
  
  // Material: Tech Blue/Cyan with transparency
  const structureMat = new THREE.MeshBasicMaterial({ 
    color: 0x0ea5e9, 
    wireframe: true, 
    transparent: true, 
    opacity: 0.3 
  });
  disposables.push(structureMat);

  // Legs
  const legGeo = new THREE.BoxGeometry(2, 20, 2);
  disposables.push(legGeo);
  const l1 = new THREE.Mesh(legGeo, structureMat); l1.position.set(-6, 10, 6);
  const l2 = new THREE.Mesh(legGeo, structureMat); l2.position.set(-6, 10, -6);
  const l3 = new THREE.Mesh(legGeo, structureMat); l3.position.set(6, 10, 6);
  const l4 = new THREE.Mesh(legGeo, structureMat); l4.position.set(6, 10, -6);
  craneGroup.add(l1, l2, l3, l4);

  // Boom (Girder)
  const boomGeo = new THREE.BoxGeometry(30, 2, 4);
  disposables.push(boomGeo);
  const boom = new THREE.Mesh(boomGeo, structureMat);
  boom.position.set(0, 21, 0);
  craneGroup.add(boom);

  group.add(craneGroup);

  // 3. Dynamic Parts (Trolley & Spreader)
  const dynamicMat = new THREE.MeshBasicMaterial({ color: 0xfacc15, wireframe: true }); // Yellow active parts
  disposables.push(dynamicMat);

  // Trolley
  const trolleyGeo = new THREE.BoxGeometry(3, 1, 3);
  disposables.push(trolleyGeo);
  const trolley = new THREE.Mesh(trolleyGeo, dynamicMat);
  trolley.position.set(0, 22, 0); // Above boom
  group.add(trolley);

  // Cables (Line)
  // We'll update geometry dynamically or scale a cylinder
  const cableGeo = new THREE.CylinderGeometry(0.05, 0.05, 1);
  const cableMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
  disposables.push(cableGeo, cableMat);
  const cables = new THREE.Mesh(cableGeo, cableMat);
  // Pivot at top to stretch down
  cables.geometry.translate(0, -0.5, 0); 
  cables.position.set(0, 21.5, 0); // Attach to trolley bottom
  group.add(cables);

  // Spreader
  const spreaderGeo = new THREE.BoxGeometry(4, 0.5, 2);
  const spreaderMat = new THREE.MeshBasicMaterial({ color: 0xfacc15 });
  disposables.push(spreaderGeo, spreaderMat);
  const spreader = new THREE.Mesh(spreaderGeo, spreaderMat);
  group.add(spreader);

  // Container (Target)
  const contGeo = new THREE.BoxGeometry(4, 2, 2);
  const contMat = new THREE.MeshBasicMaterial({ color: 0xef4444, transparent: true, opacity: 0.8 }); // Red container
  disposables.push(contGeo, contMat);
  const container = new THREE.Mesh(contGeo, contMat);
  group.add(container);

  animatables.effCraneParts = { trolley, spreader, cables, container };

  // 4. Trajectory Path (Trail)
  // Pre-allocate buffer for trail points
  const maxPoints = 200;
  const trailGeo = new THREE.BufferGeometry();
  const positions = new Float32Array(maxPoints * 3);
  trailGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  trailGeo.setDrawRange(0, 0); // Start empty
  
  const trailMat = new THREE.LineBasicMaterial({ color: 0x22c55e, opacity: 0.6, transparent: true });
  disposables.push(trailGeo, trailMat);
  
  const trail = new THREE.Line(trailGeo, trailMat);
  // trail.frustumCulled = false; // Ensure it renders
  group.add(trail);
  
  animatables.effTrajectory = trail;

  // Store simulation state in userData
  (group as any).userData = {
    cyclePhase: 0, // 0-1 progress
    state: 'LOWER_PICK', // LOWER_PICK, HOIST_PICK, TROLLEY_MOVE, LOWER_DROP, HOIST_DROP, TROLLEY_RETURN
    trailIdx: 0
  };
};

export const animateCraneEfficiencyScene = (type: SceneType, animatables: Animatables, time: number) => {
  if (type !== 'crane-efficiency-analysis') return;

  const parts = animatables.effCraneParts;
  if (!parts) return;

  // Simulation Parameters
  // Ship side: x = -10, y = 2 (container stack)
  // Shore side: x = 8, y = 1 (AGV)
  // Hoist Height: y = 15 (Safe height)
  
  // Cycle Logic: 
  // 1. Start at Shore (AGV), X=8, Y=15 (High), Empty
  // 2. Move Trolley to Ship (-10), Y=15
  // 3. Lower to Pick (Y=2)
  // 4. Hoist to Safe (Y=15)
  // 5. Move Trolley to Shore (8)
  // 6. Lower to Drop (Y=4 - AGV height)
  // 7. Hoist to Safe (Y=15)
  
  const cycleDuration = 400; // frames per cycle
  const t = (time * 60) % cycleDuration; // normalize roughly to frame count
  
  let tx = 0, ty = 0, hasContainer = false;

  // Define Keyframes
  if (t < 50) {
    // 1. Move to Ship: 8 -> -10
    const p = t / 50;
    tx = 8 - p * 18;
    ty = 15;
    hasContainer = false;
  } else if (t < 100) {
    // 2. Lower to Pick: 15 -> 3
    const p = (t - 50) / 50;
    tx = -10;
    ty = 15 - p * 12;
    hasContainer = false;
  } else if (t < 150) {
    // 3. Hoist (Loaded): 3 -> 15
    const p = (t - 100) / 50;
    tx = -10;
    ty = 3 + p * 12;
    hasContainer = true;
  } else if (t < 250) {
    // 4. Move to Shore (Loaded): -10 -> 8
    // Slower with load
    const p = (t - 150) / 100;
    tx = -10 + p * 18;
    ty = 15;
    hasContainer = true;
  } else if (t < 300) {
    // 5. Lower to Drop: 15 -> 4
    const p = (t - 250) / 50;
    tx = 8;
    ty = 15 - p * 11;
    hasContainer = true;
  } else if (t < 350) {
    // 6. Hoist (Empty): 4 -> 15
    const p = (t - 300) / 50;
    tx = 8;
    ty = 4 + p * 11;
    hasContainer = false; // Dropped
  } else {
    // 7. Wait/Reset
    tx = 8;
    ty = 15;
    hasContainer = false;
  }

  // Update Meshes
  parts.trolley.position.x = tx;
  parts.spreader.position.x = tx;
  parts.spreader.position.y = ty;
  
  // Cable stretch
  // Trolley Y is 22. Spreader Y is 'ty'.
  // Cable goes from 21.5 down to ty
  const cableLen = 21.5 - ty;
  parts.cables.position.x = tx;
  parts.cables.scale.y = cableLen;

  // Container
  if (hasContainer) {
    parts.container.position.copy(parts.spreader.position);
    parts.container.position.y -= 1.25; // Hang below
    parts.container.visible = true;
  } else {
    // Ideally hide or place at pick/drop zones
    // For visual simplicity, just hide when not carrying
    parts.container.visible = false;
  }

  // Update Trail
  if (animatables.effTrajectory) {
    const geo = animatables.effTrajectory.geometry;
    const positions = geo.attributes.position.array as Float32Array;
    let idx = (animatables.effTrajectory as any).userData.idx || 0;
    
    // Add current point
    positions[idx * 3] = tx;
    positions[idx * 3 + 1] = ty;
    positions[idx * 3 + 2] = 0;
    
    idx++;
    if (idx >= 200) {
      idx = 0; // wrap (circular buffer visual style) or could shift
    }
    
    (animatables.effTrajectory as any).userData.idx = idx;
    geo.setDrawRange(0, 200); // Draw all (some will be old/jumping lines, acceptable for glitchy effect)
    geo.attributes.position.needsUpdate = true;
  }
};
