
import * as THREE from 'three';
import { Animatables, SceneType } from '../three-types';

export const isLockEfficiencyScene = (type: SceneType): boolean => {
  return type === 'lock-efficiency-analysis';
};

export const setupLockEfficiencyCamera = (camera: THREE.PerspectiveCamera) => {
  camera.position.set(20, 20, 20);
  camera.lookAt(0, 0, 0);
};

export const initLockEfficiencyScene = (
  type: SceneType, 
  group: THREE.Group, 
  animatables: Animatables, 
  disposables: { dispose: () => void }[]
) => {
  if (type !== 'lock-efficiency-analysis') return;

  // 1. Terrain & Structure Base
  // Create a stepped terrain for a 2-stage lock
  const terrainGeo = new THREE.BufferGeometry();
  // Simplified mesh construction for "steps"
  // Upstream (High) -> Chamber 1 -> Chamber 2 -> Downstream (Low)
  // X axis length. Z axis width.
  const wallMat = new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.8 });
  disposables.push(wallMat);

  // Helper to create a chamber box
  const createChamber = (x: number, y: number, w: number, l: number, h: number) => {
      const geo = new THREE.BoxGeometry(l, h, 1);
      disposables.push(geo);
      // Left Wall
      const wallL = new THREE.Mesh(geo, wallMat);
      wallL.position.set(x, y + h/2, -w/2 - 0.5);
      group.add(wallL);
      // Right Wall
      const wallR = new THREE.Mesh(geo, wallMat);
      wallR.position.set(x, y + h/2, w/2 + 0.5);
      group.add(wallR);
      // Floor
      const floorGeo = new THREE.BoxGeometry(l, 1, w + 2);
      disposables.push(floorGeo);
      const floor = new THREE.Mesh(floorGeo, wallMat);
      floor.position.set(x, y - 0.5, 0);
      group.add(floor);
  };

  // Upstream: X = -15, Y = 6
  createChamber(-18, 6, 6, 10, 8);
  // Chamber 1: X = -5, Y = 3 (Floor)
  createChamber(-6, 3, 6, 12, 11); // Deeper walls
  // Chamber 2: X = 7, Y = 0 (Floor)
  createChamber(6, 0, 6, 12, 14);
  // Downstream: X = 19, Y = -3
  createChamber(18, -3, 6, 10, 17);

  // 2. Miter Gates
  // Locations: -12 (Head), 0 (Middle), 12 (Tail)
  animatables.leGates = [];
  const gateGeo = new THREE.BoxGeometry(0.5, 8, 3.5); // Half gate
  const gateMat = new THREE.MeshStandardMaterial({ color: 0xd97706 }); // Orange/Rust
  disposables.push(gateGeo, gateMat);

  [ -12, 0, 12 ].forEach(x => {
      // Pivot Groups
      const leftPivot = new THREE.Group();
      leftPivot.position.set(x, 4, -3); // Hinge point
      const leftGate = new THREE.Mesh(gateGeo, gateMat);
      leftGate.position.set(0, 0, 1.75); // Offset geometry
      leftPivot.add(leftGate);
      group.add(leftPivot);

      const rightPivot = new THREE.Group();
      rightPivot.position.set(x, 4, 3);
      const rightGate = new THREE.Mesh(gateGeo, gateMat);
      rightGate.position.set(0, 0, -1.75);
      rightPivot.add(rightGate);
      group.add(rightPivot);

      // We store the pair as a single logical gate entry
      // The mesh group acts as a container for both pivots, but here we just store pivots in an object
      // Actually let's make a wrapper group for easier referencing in animatables
      const gateWrapper = new THREE.Group();
      gateWrapper.add(leftPivot);
      gateWrapper.add(rightPivot);
      // We need to keep them in scene graph properly, so add wrapper to group? 
      // No, let's just store the pivots in userData of the wrapper
      
      // Better: Store the wrapper in animatables, but add pivots to scene directly?
      // Or add wrapper to scene.
      // Let's re-structure:
      // Group (x) -> LeftPivot -> Mesh
      //           -> RightPivot -> Mesh
      // group.add(gateWrapper); gateWrapper.position.x = x;
      // But Pivots need specific Z.
      
      // Simplifying: just push a custom object to animatables array
      // But interface requires Group. So we push a dummy Group that holds references.
      const dummy = new THREE.Group();
      dummy.userData = { left: leftPivot, right: rightPivot };
      animatables.leGates?.push({ mesh: dummy, state: 'closed', angle: 0 });
  });

  // 3. Water Levels
  animatables.leWaterLevels = [];
  const waterGeo = new THREE.PlaneGeometry(12, 6);
  waterGeo.rotateX(-Math.PI / 2);
  const waterMat = new THREE.MeshStandardMaterial({ 
      color: 0x0ea5e9, 
      transparent: true, 
      opacity: 0.6,
      side: THREE.DoubleSide
  });
  disposables.push(waterGeo, waterMat);

  // Upstream Water (Static High)
  const w1 = new THREE.Mesh(new THREE.PlaneGeometry(10, 6), waterMat);
  w1.rotation.x = -Math.PI / 2;
  w1.position.set(-18, 7, 0); // Y=7
  group.add(w1);

  // Chamber 1 Water (Dynamic)
  const w2 = new THREE.Mesh(waterGeo, waterMat);
  w2.position.set(-6, 7, 0); // Starts High
  group.add(w2);
  animatables.leWaterLevels.push(w2);

  // Chamber 2 Water (Dynamic)
  const w3 = new THREE.Mesh(waterGeo, waterMat);
  w3.position.set(6, 4, 0); // Starts Mid
  group.add(w3);
  animatables.leWaterLevels.push(w3);

  // Downstream Water (Static Low)
  const w4 = new THREE.Mesh(new THREE.PlaneGeometry(10, 6), waterMat);
  w4.rotation.x = -Math.PI / 2;
  w4.position.set(18, 1, 0); // Y=1
  group.add(w4);


  // 4. Ships
  animatables.leShips = [];
  const shipGeo = new THREE.BoxGeometry(4, 1.5, 2);
  const shipMat = new THREE.MeshStandardMaterial({ color: 0xffffff });
  disposables.push(shipGeo, shipMat);
  const deckMat = new THREE.MeshStandardMaterial({ color: 0xef4444 });
  disposables.push(deckMat);
  
  // Create one ship that cycles through
  const shipGroup = new THREE.Group();
  const hull = new THREE.Mesh(shipGeo, shipMat);
  shipGroup.add(hull);
  const deck = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1.5), deckMat);
  deck.position.set(-1, 1.25, 0);
  shipGroup.add(deck);
  
  group.add(shipGroup);
  animatables.leShips.push({ mesh: shipGroup, progress: 0 });
};

export const animateLockEfficiencyScene = (type: SceneType, animatables: Animatables, time: number) => {
  if (type !== 'lock-efficiency-analysis') return;

  // Cycle Logic: 24s full cycle (simulated)
  // 0-4: Ship Enter C1 (Water High, Gate 1 Open)
  // 4-6: Close Gate 1.
  // 6-10: C1 Lower to Mid. (Equalize with C2)
  // 10-12: Open Gate 2.
  // 12-16: Ship Move C1 -> C2.
  // 16-18: Close Gate 2.
  // 18-22: C2 Lower to Low.
  // 22-24: Open Gate 3, Ship Exit.
  // Reset.

  const cycleTime = 24;
  const t = time % cycleTime;
  
  const gates = animatables.leGates; // [Head, Middle, Tail]
  const water = animatables.leWaterLevels; // [Chamber1, Chamber2]
  const ships = animatables.leShips;

  if (!gates || !water || !ships) return;

  // --- Gate Logic ---
  // Gate 1 (Head)
  let g1Angle = 0;
  if (t < 4 || t > 23.5) g1Angle = Math.PI / 3; // Open for entry
  else if (t >= 4 && t < 6) g1Angle = Math.PI / 3 * (1 - (t-4)/2); // Closing
  
  // Gate 2 (Middle)
  let g2Angle = 0;
  if (t > 10 && t < 16) g2Angle = Math.PI / 3; // Open for transfer
  else if (t >= 10 && t < 12) g2Angle = Math.PI / 3 * ((t-10)/2); // Opening
  else if (t >= 16 && t < 18) g2Angle = Math.PI / 3 * (1 - (t-16)/2); // Closing
  
  // Gate 3 (Tail)
  let g3Angle = 0;
  if (t > 22) g3Angle = Math.PI / 3 * ((t-22)/2); // Opening
  
  // Apply Angles
  const applyGate = (idx: number, angle: number) => {
     const wrapper = gates[idx].mesh;
     const left = wrapper.userData.left as THREE.Group;
     const right = wrapper.userData.right as THREE.Group;
     if (left && right) {
         left.rotation.y = -angle;
         right.rotation.y = angle;
     }
  };
  applyGate(0, g1Angle);
  applyGate(1, g2Angle);
  applyGate(2, g3Angle);

  // --- Water Level Logic ---
  // High=7, Mid=4, Low=1
  let w1Level = 7;
  let w2Level = 4; // C2 starts at Mid or Low? Let's say Mid for multi-stage waterfall effect.
                   // Actually standard lock: C2 empties to Low, then fills from C1? 
                   // Simplified: 
                   // C1 drops 7->4 during t=6-10. C2 stays 4? No, C2 should be 4 to receive.
                   // C2 drops 4->1 during t=18-22.
                   
  if (t >= 6 && t < 10) {
      w1Level = 7 - (t-6)/4 * 3; // Drop to 4
  } else if (t >= 10) {
      w1Level = 4;
  }
  
  if (t < 18) {
      w2Level = 4;
  } else if (t >= 18 && t < 22) {
      w2Level = 4 - (t-18)/4 * 3; // Drop to 1
  } else {
      w2Level = 1;
  }
  
  // Reset logic for visual loop smoothness:
  // After ship exits (t=24), we need to reset levels for next ship quickly invisible or assume pumps works
  // For visual loop, we snap back at t=0
  
  water[0].position.y = w1Level;
  water[1].position.y = w2Level;

  // --- Ship Movement Logic ---
  // Path X: -25 (Start) -> -6 (C1) -> 6 (C2) -> 25 (End)
  // t=0-4: Move -25 to -6
  // t=4-12: Wait at -6 (lowering)
  // t=12-16: Move -6 to 6
  // t=16-22: Wait at 6 (lowering)
  // t=22-24: Move 6 to 18...
  
  const ship = ships[0].mesh;
  let sx = -25;
  let sy = 7;
  
  if (t < 4) {
      sx = -25 + (t/4) * 19; // To -6
      sy = 7;
  } else if (t < 12) {
      sx = -6;
      sy = w1Level; // Follow water
  } else if (t < 16) {
      sx = -6 + ((t-12)/4) * 12; // To 6
      sy = 4;
  } else if (t < 22) {
      sx = 6;
      sy = w2Level; // Follow water
  } else {
      sx = 6 + ((t-22)/2) * 12; // To 18
      sy = 1;
  }
  
  ship.position.set(sx, sy + 0.5, 0); // +0.5 for half height
};
