
import * as THREE from 'three';
import { TrainingAnimatables, TrainingModule } from './three-types';

export const initTrainingScene = (
  group: THREE.Group, 
  animatables: TrainingAnimatables,
  disposables: { dispose: () => void }[]
) => {
  // --- Materials ---
  const steelMat = new THREE.MeshStandardMaterial({ color: 0x64748b, roughness: 0.3, metalness: 0.8 });
  const copperMat = new THREE.MeshStandardMaterial({ color: 0xb45309, metalness: 0.9, roughness: 0.2 });
  const ghostMat = new THREE.MeshBasicMaterial({ color: 0x0ea5e9, transparent: true, opacity: 0.2, wireframe: true });
  const targetMat = new THREE.MeshBasicMaterial({ color: 0xf59e0b, transparent: true, opacity: 0.6 });
  const floorMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.9 });

  disposables.push(steelMat, copperMat, ghostMat, targetMat, floorMat);

  // 1. Base Environment
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(40, 40), floorMat);
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = -4;
  group.add(floor);

  // 2. Turbine Main Body (Section View)
  const unitGroup = new THREE.Group();
  group.add(unitGroup);
  animatables.mainUnit = unitGroup;

  // Stator
  const stator = new THREE.Mesh(new THREE.CylinderGeometry(4, 4, 6, 32, 1, true), steelMat);
  unitGroup.add(stator);

  // Core/Shaft
  const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 0.8, 8, 32), steelMat);
  unitGroup.add(shaft);
  animatables.innerShaft = shaft;

  // 3. Interactive Component (The "Task Target")
  const topCoverGroup = new THREE.Group();
  topCoverGroup.position.y = 3;
  unitGroup.add(topCoverGroup);
  
  const cover = new THREE.Mesh(new THREE.CylinderGeometry(4.2, 4.2, 0.5, 32), steelMat);
  topCoverGroup.add(cover);

  // 4. Ghost Guide (Correct Position Template)
  const ghost = new THREE.Mesh(new THREE.CylinderGeometry(4.2, 4.2, 0.5, 32), ghostMat);
  ghost.position.y = 8; // Floating guide
  ghost.visible = false;
  group.add(ghost);
  animatables.hologramOverlay = ghost;

  // 5. Training Feedback Elements
  const light = new THREE.PointLight(0x22d3ee, 0, 10);
  light.position.set(0, 5, 0);
  group.add(light);
  animatables.indicatorLight = light;

  // Helper Grid
  const grid = new THREE.GridHelper(40, 20, 0x1e293b, 0x0f172a);
  grid.position.y = -3.99;
  group.add(grid);
};

export const animateTrainingScene = (
  animatables: TrainingAnimatables, 
  module: TrainingModule,
  time: number
) => {
  if (!animatables.mainUnit) return;

  // Base behavior: Slow inspection rotation
  if (module === 'COMPONENT_ID') {
      animatables.mainUnit.rotation.y += 0.005;
  }

  // Hologram Pulse
  if (animatables.hologramOverlay) {
      if (module === 'ROTOR_LIFT') {
          animatables.hologramOverlay.visible = true;
          animatables.hologramOverlay.scale.setScalar(1 + Math.sin(time * 3) * 0.05);
      } else {
          animatables.hologramOverlay.visible = false;
      }
  }

  // Feedback Light
  if (animatables.indicatorLight) {
      animatables.indicatorLight.intensity = (module === 'FAULT_FINDING') ? 2 + Math.sin(time * 10) * 1 : 0;
  }

  // Task simulation: Manual move
  if (module === 'GAP_MEASURE' && animatables.innerShaft) {
      animatables.innerShaft.position.x = Math.sin(time * 5) * 0.02; // Vibration to measure
  }
};
