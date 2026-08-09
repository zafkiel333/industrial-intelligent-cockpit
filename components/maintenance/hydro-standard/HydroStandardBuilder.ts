import * as THREE from 'three';
import { StandardAnimatables, StandardStep } from './three-types';

export const initStandardScene = (
  group: THREE.Group, 
  animatables: StandardAnimatables,
  disposables: { dispose: () => void }[]
) => {
  // --- Materials ---
  const ironMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.6, metalness: 0.5 });
  const highlightMat = new THREE.MeshStandardMaterial({ color: 0x0ea5e9, emissive: 0x0ea5e9, emissiveIntensity: 0.2 });
  const copperMat = new THREE.MeshStandardMaterial({ color: 0xb45309, metalness: 0.8 });
  const ghostMat = new THREE.MeshBasicMaterial({ color: 0x22d3ee, transparent: true, opacity: 0.2, wireframe: true });
  const beamMat = new THREE.MeshBasicMaterial({ color: 0x10b981, transparent: true, opacity: 0.5 });

  disposables.push(ironMat, highlightMat, copperMat, ghostMat, beamMat);

  // 1. Base Structure (Head Cover Section)
  const baseGeo = new THREE.TorusGeometry(8, 0.5, 16, 64);
  baseGeo.rotateX(Math.PI / 2);
  const base = new THREE.Mesh(baseGeo, ironMat);
  group.add(base);

  // 2. Guide Vane Assembly (Target of Simulation)
  const mechanismGroup = new THREE.Group();
  group.add(mechanismGroup);
  animatables.mechanismGroup = mechanismGroup;

  animatables.guideVanes = [];
  const vaneGeo = new THREE.BoxGeometry(0.4, 4, 1.2);
  vaneGeo.translate(0, 2, 0.6); // Pivot at one edge
  disposables.push(vaneGeo);

  const vaneCount = 12;
  const radius = 6.5;

  for(let i=0; i<vaneCount; i++) {
    const angle = (i / vaneCount) * Math.PI * 2;
    const vGroup = new THREE.Group();
    vGroup.position.set(Math.cos(angle)*radius, 0, Math.sin(angle)*radius);
    vGroup.rotation.y = -angle + Math.PI/4;
    
    // Main Vane Body
    const vane = new THREE.Mesh(vaneGeo, ironMat);
    vGroup.add(vane);

    // Pivot Shaft
    const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 5), copperMat);
    shaft.position.y = 2;
    vGroup.add(shaft);

    mechanismGroup.add(vGroup);
    animatables.guideVanes.push(vGroup);
  }

  // 3. Ghost Guides (Visual Standard)
  const ghostGroup = new THREE.Group();
  group.add(ghostGroup);
  animatables.ghostGuides = ghostGroup;
  ghostGroup.visible = false;

  for(let i=0; i<vaneCount; i++) {
    const angle = (i / vaneCount) * Math.PI * 2;
    const ghost = new THREE.Mesh(vaneGeo, ghostMat);
    ghost.position.set(Math.cos(angle)*radius, 0, Math.sin(angle)*radius);
    ghost.rotation.y = -angle + 0.2; // Perfectly aligned angle
    ghostGroup.add(ghost);
  }

  // 4. Measuring Tool (Laser Line)
  const beamGeo = new THREE.CylinderGeometry(0.02, 0.02, 10);
  const beam = new THREE.Mesh(beamGeo, beamMat);
  beam.rotation.z = Math.PI/2;
  beam.position.y = 2;
  beam.visible = false;
  group.add(beam);
  // Fixed the error: scanBeam property now exists on StandardAnimatables
  animatables.scanBeam = beam;

  // Ground Grid
  const grid = new THREE.GridHelper(40, 20, 0x1e293b, 0x0f172a);
  grid.position.y = -0.1;
  group.add(grid);
};

export const animateStandardScene = (
  animatables: StandardAnimatables, 
  step: StandardStep,
  time: number
) => {
  if (!animatables.mechanismGroup) return;

  // 1. Normal State: Subtle Rotation
  if (step === 'INIT_CHECK') {
      animatables.mechanismGroup.rotation.y += 0.002;
  }

  // 2. Alignment State
  if (step === 'SHAFT_ALIGN') {
      if (animatables.ghostGuides) animatables.ghostGuides.visible = true;
      // Vanes wiggle towards ghost positions
      animatables.guideVanes?.forEach((v, i) => {
          v.rotation.y += Math.sin(time * 2 + i) * 0.002;
      });
  }

  // 3. Clearance Adjustment
  if (step === 'CLEARANCE_ADJ') {
      if (animatables.ghostGuides) animatables.ghostGuides.visible = false;
      // Pulse effect on critical gap
      animatables.guideVanes?.forEach((v, i) => {
          if (i === 0) {
              v.scale.x = 1 + Math.sin(time * 5) * 0.05;
          }
      });
  }

  // 4. Test Sync
  if (step === 'SYNC_TEST') {
      const angle = Math.sin(time * 0.5) * 0.5;
      animatables.guideVanes?.forEach((v) => {
          v.rotation.y = -Math.atan2(v.position.z, v.position.x) + angle;
      });
  }
};
