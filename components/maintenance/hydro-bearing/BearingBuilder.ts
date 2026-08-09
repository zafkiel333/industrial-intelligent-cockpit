
import * as THREE from 'three';
import { BearingAnimatables, SimPhase } from './three-types';

export const initBearingScene = (
  group: THREE.Group, 
  animatables: BearingAnimatables,
  disposables: { dispose: () => void }[]
) => {
  // --- Materials ---
  const steelMat = new THREE.MeshStandardMaterial({ 
    color: 0x94a3b8, roughness: 0.3, metalness: 0.8 
  });
  const runnerMat = new THREE.MeshStandardMaterial({ 
    color: 0xc0c0c0, roughness: 0.2, metalness: 1.0 
  }); // Mirror-like finish
  const padMat = new THREE.MeshStandardMaterial({ 
    color: 0xd97706, roughness: 0.8, metalness: 0.2 
  }); // Babbitt metal / bronze look
  const oilMat = new THREE.MeshPhysicalMaterial({ 
    color: 0xeab308, transmission: 0.8, opacity: 0.6, transparent: true, roughness: 0.1, ior: 1.4
  });
  const housingMat = new THREE.MeshStandardMaterial({ 
    color: 0x334155, roughness: 0.9, side: THREE.DoubleSide
  });

  disposables.push(steelMat, runnerMat, padMat, oilMat, housingMat);

  // 1. Oil Tank / Housing (Cutaway)
  const housingGeo = new THREE.CylinderGeometry(5, 5, 3, 32, 1, true, 0, Math.PI * 1.5); // 3/4 cylinder to see inside
  disposables.push(housingGeo);
  const housing = new THREE.Mesh(housingGeo, housingMat);
  housing.position.y = 1.5;
  group.add(housing);

  const floorGeo = new THREE.CircleGeometry(5, 32);
  floorGeo.rotateX(-Math.PI / 2);
  disposables.push(floorGeo);
  const floor = new THREE.Mesh(floorGeo, housingMat);
  group.add(floor);

  // 2. Thrust Pads (Stationary, arranged in circle)
  const padsGroup = new THREE.Group();
  const padCount = 12;
  const padRadius = 3.5;
  
  // Create a sector shape for pads
  const padShape = new THREE.Shape();
  padShape.moveTo(2, 0);
  padShape.lineTo(4.5, 0); // Inner to Outer radius
  padShape.absarc(0, 0, 4.5, 0, Math.PI / 8, false);
  padShape.lineTo(
    Math.cos(Math.PI / 8) * 2,
    Math.sin(Math.PI / 8) * 2
  );
  padShape.absarc(0, 0, 2, Math.PI / 8, 0, true);

  const padExtrudeSettings = { depth: 0.5, bevelEnabled: false };
  const padGeo = new THREE.ExtrudeGeometry(padShape, padExtrudeSettings);
  padGeo.rotateX(-Math.PI / 2);
  disposables.push(padGeo);

  for(let i=0; i<padCount; i++) {
      const pad = new THREE.Mesh(padGeo, padMat.clone()); // Clone material for individual color control (wear)
      pad.rotation.y = i * (Math.PI * 2 / padCount);
      pad.position.y = 0.5; // Sitting on support
      // Add custom data for animation
      pad.userData = { 
          originalColor: new THREE.Color(0xd97706),
          wearColor: new THREE.Color(0x7f1d1d), // Red for worn
          angle: i * (Math.PI * 2 / padCount),
          radius: padRadius
      };
      padsGroup.add(pad);
  }
  group.add(padsGroup);
  animatables.padsGroup = padsGroup;

  // 3. Main Shaft & Runner (Rotating)
  const shaftGroup = new THREE.Group();
  
  // Runner Plate (The disc that slides on pads)
  const runnerGeo = new THREE.CylinderGeometry(4.6, 4.6, 0.5, 32);
  disposables.push(runnerGeo);
  const runner = new THREE.Mesh(runnerGeo, runnerMat);
  runner.position.y = 1.25; // Just above pads (0.5 pad height + 0.5/2 thickness + gap)
  shaftGroup.add(runner);
  animatables.runnerPlate = runner;

  // Shaft
  const shaftGeo = new THREE.CylinderGeometry(1.5, 1.5, 6, 32);
  shaftGeo.translate(0, 3, 0); // Pivot at bottom
  disposables.push(shaftGeo);
  const shaft = new THREE.Mesh(shaftGeo, steelMat);
  shaft.position.y = 1.25; // Mounted on runner
  shaftGroup.add(shaft);
  animatables.shaft = shaft;

  group.add(shaftGroup);

  // 4. Oil (Fluid)
  const oilGeo = new THREE.CylinderGeometry(4.8, 4.8, 1.5, 32);
  oilGeo.translate(0, 0.75, 0);
  disposables.push(oilGeo);
  const oil = new THREE.Mesh(oilGeo, oilMat);
  group.add(oil);
  animatables.oilSurface = oil;

  // 5. Heat/Wear Indicators (Sprites)
  animatables.heatTips = [];
  const spriteMap = new THREE.TextureLoader().load('https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/sprites/glow.png');
  const spriteMat = new THREE.SpriteMaterial({ map: spriteMap, color: 0xff0000, transparent: true, opacity: 0 });
  disposables.push(spriteMat); // Note: Texture disposal handled separately usually, simplified here

  for(let i=0; i<5; i++) {
      const sprite = new THREE.Sprite(spriteMat);
      sprite.scale.set(1.5, 1.5, 1.5);
      group.add(sprite);
      animatables.heatTips.push(sprite);
  }
};

export const animateBearingScene = (
  animatables: BearingAnimatables, 
  phase: SimPhase,
  wearLevel: number,
  time: number
) => {
  // 1. Rotation Logic
  if (animatables.shaft && animatables.runnerPlate) {
      if (phase === 'OPERATION' || phase === 'DEGRADED') {
          const speed = phase === 'DEGRADED' ? 0.15 : 0.2; // Slower if degraded maybe? or vibrating
          animatables.shaft.rotation.y -= speed;
          animatables.runnerPlate.rotation.y -= speed;
          
          // Vibration effect
          if (phase === 'DEGRADED') {
              const vib = Math.sin(time * 50) * 0.02;
              animatables.shaft.position.x = vib;
              animatables.runnerPlate.position.x = vib;
          } else {
              animatables.shaft.position.x = 0;
              animatables.runnerPlate.position.x = 0;
          }
      }
  }

  // 2. Wear Visualization (Heatspots & Pad Color)
  if (animatables.padsGroup) {
      animatables.padsGroup.children.forEach((pad, i) => {
          const mesh = pad as THREE.Mesh;
          const mat = mesh.material as THREE.MeshStandardMaterial;
          const data = mesh.userData;
          
          if (phase === 'DEGRADED' || phase === 'OPERATION') {
              // Interpolate color based on wearLevel (0-100)
              // Only affect some pads to simulate uneven wear
              const localWear = i % 3 === 0 ? wearLevel : wearLevel * 0.5;
              mat.color.lerpColors(data.originalColor, data.wearColor, localWear / 100);
          } else if (phase === 'RESET') {
              mat.color.copy(data.originalColor);
          }
      });
  }

  // 3. Heat Sprites
  if (animatables.heatTips) {
      animatables.heatTips.forEach((sprite, i) => {
          if (phase === 'DEGRADED' || (phase === 'OPERATION' && wearLevel > 60)) {
              // Position them randomly around the bearing interface
              const angle = time * 2 + i * (Math.PI * 2 / 5);
              const r = 3.5;
              sprite.position.set(Math.cos(angle) * r, 1.25, Math.sin(angle) * r);
              sprite.material.opacity = (Math.sin(time * 10 + i) + 1) * 0.5 * (wearLevel/100);
          } else {
              sprite.material.opacity = 0;
          }
      });
  }

  // 4. Maintenance Animation
  const jackHeight = 1.5;
  if (phase === 'JACKING' || phase === 'SWAP_PADS') {
      // Lift shaft
      if (animatables.shaft && animatables.runnerPlate) {
          const currentY = animatables.shaft.position.y;
          const targetY = 1.25 + jackHeight; // Base pos + lift
          animatables.shaft.position.y = THREE.MathUtils.lerp(currentY, targetY, 0.05);
          animatables.runnerPlate.position.y = animatables.shaft.position.y;
      }
      
      // Move Pads Out
      if (phase === 'SWAP_PADS' && animatables.padsGroup) {
          animatables.padsGroup.children.forEach((pad, i) => {
              const data = pad.userData;
              // Slide out radially
              const targetR = data.radius + 3; 
              const currentX = pad.position.x;
              const currentZ = pad.position.z;
              
              // Calculate target pos
              const tx = Math.cos(pad.rotation.y + Math.PI/16) * 3; // Simplified radial push
              // Actually easier to just translate object local Z if setup right, but here we iterate
              
              // Let's just use a simple expansion for demo
              // Pads group items were placed via rotation.y. 
              // We need to move them along their local Z axis (which points out?) or world vector.
              // Easier hack: increase scale of group or move individual meshes
              // Let's reset opacity to simulate swap
              const mat = (pad as THREE.Mesh).material as THREE.MeshStandardMaterial;
              mat.opacity = Math.abs(Math.sin(time * 2)); 
              mat.transparent = true;
              if (mat.opacity < 0.1) {
                  // "Swapped" - visually reset color
                  mat.color.copy(data.originalColor);
              }
          });
      }
  } else if (phase === 'RESET' || phase === 'OPERATION') {
      // Lower shaft
      if (animatables.shaft && animatables.runnerPlate) {
          animatables.shaft.position.y = THREE.MathUtils.lerp(animatables.shaft.position.y, 1.25, 0.1);
          animatables.runnerPlate.position.y = animatables.shaft.position.y;
      }
      // Reset pads visibility
      if (animatables.padsGroup) {
           animatables.padsGroup.children.forEach(pad => {
               const mat = (pad as THREE.Mesh).material as THREE.MeshStandardMaterial;
               mat.opacity = 1;
           });
      }
  }
};
