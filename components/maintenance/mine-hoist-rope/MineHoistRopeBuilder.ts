
import * as THREE from 'three';
import { RopeAnimatables, RopeSimState } from './three-types';

export const initMineHoistRopeScene = (
  group: THREE.Group, 
  animatables: RopeAnimatables,
  disposables: { dispose: () => void }[]
) => {
  // --- Materials ---
  const drumMat = new THREE.MeshStandardMaterial({ 
    color: 0x334155, roughness: 0.6, metalness: 0.6 
  });
  const frameMat = new THREE.MeshStandardMaterial({ 
    color: 0xf59e0b, roughness: 0.7 
  }); // Yellow Steel
  const ropeMat = new THREE.MeshStandardMaterial({ 
    color: 0x94a3b8, roughness: 0.4, metalness: 0.5 
  }); // Steel Rope
  const damageMat = new THREE.MeshStandardMaterial({ 
    color: 0xef4444, emissive: 0x7f1d1d, emissiveIntensity: 0.5 
  }); // Damaged Rope Segment
  const newRopeMat = new THREE.MeshStandardMaterial({ 
    color: 0x10b981, roughness: 0.4, metalness: 0.5 
  }); // New Rope (Greenish tint for diff)
  const cageMat = new THREE.MeshStandardMaterial({ 
    color: 0x475569, wireframe: false 
  });
  const laserMat = new THREE.MeshBasicMaterial({ 
    color: 0x22d3ee, transparent: true, opacity: 0.4, side: THREE.DoubleSide 
  });

  disposables.push(drumMat, frameMat, ropeMat, damageMat, newRopeMat, cageMat, laserMat);

  // 1. Headframe Structure (Abstract)
  const towerGeo = new THREE.BoxGeometry(2, 12, 2);
  towerGeo.translate(-4, 6, 0);
  disposables.push(towerGeo);
  const tower = new THREE.Mesh(towerGeo, frameMat);
  group.add(tower);

  // 2. Sheave Wheel (Top)
  const sheaveGroup = new THREE.Group();
  sheaveGroup.position.set(-4, 11, 0);
  group.add(sheaveGroup);
  animatables.sheave = sheaveGroup;

  const wheelGeo = new THREE.TorusGeometry(1.5, 0.2, 8, 32);
  const wheel = new THREE.Mesh(wheelGeo, new THREE.MeshStandardMaterial({color: 0x000000}));
  disposables.push(wheelGeo);
  sheaveGroup.add(wheel);
  
  // Spokes
  const spokeGeo = new THREE.BoxGeometry(2.8, 0.1, 0.1);
  disposables.push(spokeGeo);
  for(let i=0; i<4; i++) {
      const spoke = new THREE.Mesh(spokeGeo, new THREE.MeshStandardMaterial({color: 0x333333}));
      spoke.rotation.z = i * Math.PI / 4;
      sheaveGroup.add(spoke);
  }

  // 3. Main Drum (Ground/Engine Room)
  const drumGeo = new THREE.CylinderGeometry(2, 2, 4, 32);
  drumGeo.rotateX(Math.PI / 2);
  disposables.push(drumGeo);
  const drum = new THREE.Mesh(drumGeo, drumMat);
  drum.position.set(6, 2, 0);
  group.add(drum);
  animatables.drum = drum;

  // 4. The Rope System
  // Rope goes from Drum (6, 2, 0) -> Sheave (-4, 11, 0) -> Cage (-4, -5, 0)
  
  // Segment 1: Drum to Sheave
  const rope1Geo = new THREE.CylinderGeometry(0.05, 0.05, 14);
  rope1Geo.translate(0, 7, 0);
  rope1Geo.rotateZ(Math.PI/2 + 0.6); // Angle approx
  disposables.push(rope1Geo);
  const rope1 = new THREE.Mesh(rope1Geo, ropeMat);
  rope1.position.set(6, 2, 0);
  // Manual alignment lookAt is easier in init if positions known
  rope1.position.set(6, 2, 0);
  rope1.lookAt(-4, 11, 0);
  rope1.rotateX(Math.PI/2); // Cylinder orientation fix
  group.add(rope1);

  // Segment 2: Sheave to Cage (Vertical) - THIS IS THE ACTIVE ROPE
  const ropeLen = 16;
  const rope2Geo = new THREE.CylinderGeometry(0.05, 0.05, ropeLen);
  rope2Geo.translate(0, -ropeLen/2, 0);
  disposables.push(rope2Geo);
  const oldRope = new THREE.Mesh(rope2Geo, ropeMat);
  oldRope.position.set(-4, 11, 0);
  group.add(oldRope);
  animatables.oldRope = oldRope;

  // New Rope (Hidden initially)
  const newRope = new THREE.Mesh(rope2Geo, newRopeMat);
  newRope.position.set(-4, 11, 0);
  newRope.visible = false;
  group.add(newRope);
  animatables.newRope = newRope;

  // 5. Cage / Skip
  const cageGroup = new THREE.Group();
  cageGroup.position.set(-4, -5, 0); // Bottom of rope
  group.add(cageGroup);
  animatables.cage = cageGroup;

  const cageBodyGeo = new THREE.BoxGeometry(2, 3, 2);
  disposables.push(cageBodyGeo);
  const cageBody = new THREE.Mesh(cageBodyGeo, cageMat);
  cageGroup.add(cageBody);

  // Clamps (Locking Device)
  const clampGroup = new THREE.Group();
  clampGroup.position.set(-4, -4, 0);
  group.add(clampGroup);
  animatables.clamps = clampGroup;
  
  const clampLeft = new THREE.Mesh(new THREE.BoxGeometry(1, 0.5, 2.2), new THREE.MeshStandardMaterial({color: 0xef4444}));
  clampLeft.position.x = -1.5;
  const clampRight = new THREE.Mesh(new THREE.BoxGeometry(1, 0.5, 2.2), new THREE.MeshStandardMaterial({color: 0xef4444}));
  clampRight.position.x = 1.5;
  clampGroup.add(clampLeft);
  clampGroup.add(clampRight);
  clampGroup.visible = false;

  // 6. MRT Scanner (Ring)
  const scannerGroup = new THREE.Group();
  scannerGroup.position.set(-4, 10, 0); // Start at top
  group.add(scannerGroup);
  animatables.scannerRing = scannerGroup;

  const ringGeo = new THREE.TorusGeometry(0.3, 0.05, 8, 16);
  ringGeo.rotateX(Math.PI/2);
  disposables.push(ringGeo);
  const ring = new THREE.Mesh(ringGeo, new THREE.MeshBasicMaterial({color: 0x22d3ee}));
  scannerGroup.add(ring);
  
  // Laser Plane
  const laserGeo = new THREE.PlaneGeometry(1, 1);
  laserGeo.rotateX(-Math.PI/2);
  disposables.push(laserGeo);
  const laser = new THREE.Mesh(laserGeo, laserMat);
  scannerGroup.add(laser);
  
  scannerGroup.visible = false;

  // 7. Damage Indicator (Sprite)
  const map = new THREE.TextureLoader().load('https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/sprites/spark1.png');
  const spriteMat = new THREE.SpriteMaterial({ map: map, color: 0xff0000, transparent: true, opacity: 0 });
  const sprite = new THREE.Sprite(spriteMat);
  sprite.scale.set(2, 2, 1);
  sprite.position.set(-4, 2, 0); // Location of fault
  group.add(sprite);
  animatables.damageSprite = sprite;

  // 8. Aux Winch (For replacement)
  const auxWinchGroup = new THREE.Group();
  auxWinchGroup.position.set(2, 11, 0);
  const auxDrum = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 1), new THREE.MeshStandardMaterial({color: 0x10b981}));
  auxDrum.rotation.x = Math.PI/2;
  auxWinchGroup.add(auxDrum);
  group.add(auxWinchGroup);
  animatables.auxWinch = auxWinchGroup;
  auxWinchGroup.visible = false;
};

export const animateRopeScene = (
  animatables: RopeAnimatables, 
  state: RopeSimState,
  time: number
) => {
  // Base Idle Animation
  if (state === 'SCANNING') {
      if (animatables.scannerRing) {
          animatables.scannerRing.visible = true;
          // Move scanner down
          const scanY = 10 - (time % 10) * 1.5;
          if (scanY > -4) {
              animatables.scannerRing.position.y = scanY;
          } else {
             // Loop for effect
             animatables.scannerRing.position.y = 10;
          }
      }
      if (animatables.drum) animatables.drum.rotation.z -= 0.01;
      if (animatables.sheave) animatables.sheave.rotation.z -= 0.01;
  } 
  else if (state === 'FAULT_LOCATED') {
      if (animatables.damageSprite) {
          animatables.damageSprite.material.opacity = Math.sin(time * 10) * 0.5 + 0.5;
      }
      if (animatables.scannerRing) {
          animatables.scannerRing.visible = true;
          animatables.scannerRing.position.y = 2; // Locked at fault
          // Pulse the laser
          const laser = animatables.scannerRing.children[1] as THREE.Mesh;
          if (laser) (laser.material as THREE.MeshBasicMaterial).opacity = Math.sin(time * 20) * 0.5 + 0.5;
      }
  }
  else if (state === 'LOCKING') {
      if (animatables.damageSprite) animatables.damageSprite.material.opacity = 0;
      if (animatables.scannerRing) animatables.scannerRing.visible = false;
      
      if (animatables.clamps) {
          animatables.clamps.visible = true;
          // Animate closing
          const left = animatables.clamps.children[0];
          const right = animatables.clamps.children[1];
          left.position.x = THREE.MathUtils.lerp(left.position.x, -1.2, 0.05);
          right.position.x = THREE.MathUtils.lerp(right.position.x, 1.2, 0.05);
      }
  }
  else if (state === 'DETACH_OLD') {
      if (animatables.oldRope) {
          // Coil up / disappear
          animatables.oldRope.scale.y = Math.max(0.01, animatables.oldRope.scale.y - 0.005);
          animatables.oldRope.position.y = 11 - (16 * animatables.oldRope.scale.y)/2;
      }
      if (animatables.auxWinch) animatables.auxWinch.visible = true;
  }
  else if (state === 'INSTALL_NEW') {
      if (animatables.oldRope) animatables.oldRope.visible = false;
      if (animatables.newRope) {
          animatables.newRope.visible = true;
          // Extend down
          const targetScale = 1;
          const currentScale = animatables.newRope.scale.y;
          if (currentScale < targetScale) {
              animatables.newRope.scale.y += 0.005;
              animatables.newRope.position.y = 11 - (16 * animatables.newRope.scale.y)/2;
          }
      }
      if (animatables.auxWinch) {
          animatables.auxWinch.visible = true;
          animatables.auxWinch.rotation.x -= 0.1;
      }
  }
  else if (state === 'TENSIONING') {
      if (animatables.newRope) {
          // Vibrate slightly to show tensioning
          animatables.newRope.position.x = -4 + Math.sin(time * 50) * 0.01;
      }
      if (animatables.clamps) {
          // Release
          const left = animatables.clamps.children[0];
          const right = animatables.clamps.children[1];
          left.position.x = THREE.MathUtils.lerp(left.position.x, -2.5, 0.05);
          right.position.x = THREE.MathUtils.lerp(right.position.x, 2.5, 0.05);
      }
  }
  else if (state === 'COMPLETE') {
     if (animatables.clamps) animatables.clamps.visible = false;
     if (animatables.auxWinch) animatables.auxWinch.visible = false;
     // Normal operation
     if (animatables.drum) animatables.drum.rotation.z -= 0.02;
     if (animatables.sheave) animatables.sheave.rotation.z -= 0.02;
     if (animatables.cage && animatables.newRope) {
         // Bob up and down
         const y = -5 + Math.sin(time) * 2;
         animatables.cage.position.y = y;
         // Adjust rope length visual
         const len = 11 - y; // Top is 11
         animatables.newRope.scale.y = len / 16; // Base len 16
         animatables.newRope.position.y = 11 - len/2;
     }
  }
};
