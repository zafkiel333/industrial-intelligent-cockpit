
import * as THREE from 'three';
import { ResistanceAnimatables, MiningState } from './three-types';

export const initResistanceScene = (
  group: THREE.Group, 
  animatables: ResistanceAnimatables,
  disposables: { dispose: () => void }[]
) => {
  // --- Materials ---
  const steelMat = new THREE.MeshStandardMaterial({ 
    color: 0x334155, roughness: 0.5, metalness: 0.7 
  });
  const orangeMat = new THREE.MeshStandardMaterial({ 
    color: 0xf97316, roughness: 0.6, metalness: 0.4 
  });
  const cylinderMat = new THREE.MeshStandardMaterial({ 
    color: 0xe2e8f0, roughness: 0.2, metalness: 0.9 
  }); // Chrome for piston
  const coalMat = new THREE.MeshStandardMaterial({ 
    color: 0x0f0f0f, roughness: 1.0, flatShading: true 
  });
  const floorMat = new THREE.MeshStandardMaterial({ 
    color: 0x1c1917, roughness: 0.9 
  });

  disposables.push(steelMat, orangeMat, cylinderMat, coalMat, floorMat);

  // 1. Floor & Coal Wall
  const floorGeo = new THREE.PlaneGeometry(60, 40);
  floorGeo.rotateX(-Math.PI / 2);
  const floor = new THREE.Mesh(floorGeo, floorMat);
  floor.position.y = -0.1;
  group.add(floor);

  const coalWallGeo = new THREE.BoxGeometry(60, 8, 5);
  const coalWall = new THREE.Mesh(coalWallGeo, coalMat);
  coalWall.position.set(0, 4, -8);
  group.add(coalWall);
  animatables.coalWall = coalWall;

  // 2. Hydraulic Supports (Create a row of 6 detailed supports)
  animatables.individualSupports = [];
  animatables.cylinders = [];
  animatables.canopies = [];
  
  const supportCount = 6;
  const spacing = 3.5;
  const startX = -((supportCount - 1) * spacing) / 2;

  // Geometries reused
  const baseGeo = new THREE.BoxGeometry(2.2, 0.5, 6);
  const canopyGeo = new THREE.BoxGeometry(2.2, 0.4, 7);
  const shieldGeo = new THREE.BoxGeometry(2.0, 3, 0.2); // Rear shield
  const legOuterGeo = new THREE.CylinderGeometry(0.4, 0.4, 2.5, 16);
  const legInnerGeo = new THREE.CylinderGeometry(0.3, 0.3, 2.5, 16);
  
  disposables.push(baseGeo, canopyGeo, shieldGeo, legOuterGeo, legInnerGeo);

  for (let i = 0; i < supportCount; i++) {
    const sGroup = new THREE.Group();
    sGroup.position.set(startX + i * spacing, 0, 0);
    
    // Base
    const base = new THREE.Mesh(baseGeo, steelMat);
    base.position.y = 0.25;
    sGroup.add(base);

    // Legs (Hydraulic Cylinders) - 2 per support
    const legLGroup = new THREE.Group();
    legLGroup.position.set(-0.6, 0.5, 0);
    const legLOuter = new THREE.Mesh(legOuterGeo, orangeMat);
    legLOuter.position.y = 1.25;
    const legLInner = new THREE.Mesh(legInnerGeo, cylinderMat);
    legLInner.position.y = 2.5; // Telescopic part
    legLGroup.add(legLOuter, legLInner);
    sGroup.add(legLGroup);
    animatables.cylinders.push(legLOuter); // Store for color changing
    
    // Add reference to inner leg for animation (dirty hack: store in userData of outer)
    legLOuter.userData = { inner: legLInner };

    const legRGroup = new THREE.Group();
    legRGroup.position.set(0.6, 0.5, 0);
    const legROuter = new THREE.Mesh(legOuterGeo, orangeMat);
    legROuter.position.y = 1.25;
    const legRInner = new THREE.Mesh(legInnerGeo, cylinderMat);
    legRInner.position.y = 2.5;
    legRGroup.add(legROuter, legRInner);
    sGroup.add(legRGroup);
    animatables.cylinders.push(legROuter);
    legROuter.userData = { inner: legRInner };

    // Canopy
    const canopy = new THREE.Mesh(canopyGeo, steelMat);
    canopy.position.set(0, 4.5, 0.5); // Initial height
    sGroup.add(canopy);
    animatables.canopies.push(canopy);

    // Rear Shield (Linkage visual)
    const shield = new THREE.Mesh(shieldGeo, steelMat);
    shield.position.set(0, 2, 3.2);
    shield.rotation.x = -0.5;
    sGroup.add(shield);

    group.add(sGroup);
    animatables.individualSupports.push(sGroup);
  }

  // 3. Grid Helper
  const grid = new THREE.GridHelper(60, 20, 0x334155, 0x0f172a);
  group.add(grid);
};

export const animateResistanceScene = (
  animatables: ResistanceAnimatables, 
  state: MiningState,
  dataSnapshot: number[], // Pressure data for the 6 visible supports
  time: number
) => {
  if (!animatables.individualSupports) return;

  // Animate each support based on its specific pressure data
  animatables.individualSupports.forEach((support, i) => {
    // Get corresponding pressure (normalized 0-1 range approx)
    // Assume dataSnapshot has values around 30-50 MPa. Normalize to 0-1 for visual
    const pressure = dataSnapshot[i] || 30;
    const normalizedPressure = (pressure - 20) / 30; // 20MPa to 50MPa range
    
    // 1. Color Indication (Heatmap on Cylinders)
    // Low pressure = Green/Blue, High = Red/Orange
    const targetColor = new THREE.Color();
    if (pressure > 45) targetColor.setHex(0xef4444); // Red Alarm
    else if (pressure > 35) targetColor.setHex(0xf59e0b); // Orange High
    else targetColor.setHex(0x22c55e); // Green Normal

    // Apply color to legs
    const legL = animatables.cylinders![i * 2];
    const legR = animatables.cylinders![i * 2 + 1];
    
    // Smooth color transition
    (legL.material as THREE.MeshStandardMaterial).color.lerp(targetColor, 0.1);
    (legR.material as THREE.MeshStandardMaterial).color.lerp(targetColor, 0.1);

    // 2. Height Animation (Breathing effect based on load)
    // Higher pressure often means roof weighting (compression), but visually we might want to show resistance.
    // Let's make them compress slightly under high load
    const compression = normalizedPressure * 0.2; 
    const baseHeight = 4.5;
    const currentHeight = baseHeight - compression + Math.sin(time * 2 + i) * 0.02; // Small breathe
    
    // Move Canopy
    const canopy = animatables.canopies![i];
    canopy.position.y = THREE.MathUtils.lerp(canopy.position.y, currentHeight, 0.1);

    // Move Inner Legs
    const innerL = legL.userData.inner as THREE.Mesh;
    const innerR = legR.userData.inner as THREE.Mesh;
    
    // Inner leg Y position relative to Outer Leg Group.
    // Canopy is at world Y ~4.5. Leg Group starts at Y=0.5. 
    // Leg Outer is 2.5 high. 
    // We need inner leg to reach canopy.
    // Simplified visual: Just scale or move inner leg up/down
    const legExtension = currentHeight - 2.5; // Rough calc
    innerL.position.y = THREE.MathUtils.lerp(innerL.position.y, legExtension, 0.1);
    innerR.position.y = THREE.MathUtils.lerp(innerR.position.y, legExtension, 0.1);
  });
};
