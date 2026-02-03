
import * as THREE from 'three';
import { ComparisonSimAnimatables, MaintenanceScenario } from './three-types';

export const initSimScene = (
  group: THREE.Group, 
  animatables: ComparisonSimAnimatables,
  disposables: { dispose: () => void }[]
) => {
  // --- Materials ---
  const metalMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.2, metalness: 0.8 });
  const copperMat = new THREE.MeshStandardMaterial({ color: 0xb45309, metalness: 0.8, roughness: 0.3 });
  const ghostMat = new THREE.MeshBasicMaterial({ color: 0x0ea5e9, transparent: true, opacity: 0.2, wireframe: true });
  const scanLineMat = new THREE.MeshBasicMaterial({ color: 0x22d3ee, transparent: true, opacity: 0.4, side: THREE.DoubleSide });
  
  disposables.push(metalMat, copperMat, ghostMat, scanLineMat);

  // 1. Core Machine Component (Large Industrial Gearbox/Shaft)
  const mainGroup = new THREE.Group();
  group.add(mainGroup);
  animatables.mainShaft = mainGroup;

  const casingGeo = new THREE.BoxGeometry(6, 4, 4);
  const casing = new THREE.Mesh(casingGeo, metalMat);
  mainGroup.add(casing);
  disposables.push(casingGeo);

  // Bearing Housing (Fault target)
  const housingGeo = new THREE.CylinderGeometry(1.2, 1.2, 1.5, 32);
  housingGeo.rotateZ(Math.PI / 2);
  const housing = new THREE.Mesh(housingGeo, metalMat);
  housing.position.x = 3.5;
  mainGroup.add(housing);
  animatables.bearingHousing = housing;
  disposables.push(housingGeo);

  // Shaft
  const shaftGeo = new THREE.CylinderGeometry(0.5, 0.5, 10, 32);
  shaftGeo.rotateZ(Math.PI / 2);
  const shaft = new THREE.Mesh(shaftGeo, metalMat);
  mainGroup.add(shaft);
  disposables.push(shaftGeo);

  // 2. Fault Visuals
  const light = new THREE.PointLight(0xef4444, 0, 10);
  light.position.set(3.5, 1, 0);
  group.add(light);
  animatables.faultGlow = light;

  // 3. Scanning Plane
  const scanGeo = new THREE.PlaneGeometry(8, 4);
  const scanPlane = new THREE.Mesh(scanGeo, scanLineMat);
  scanPlane.rotation.x = -Math.PI / 2;
  scanPlane.position.y = 2;
  scanPlane.visible = false;
  group.add(scanPlane);
  animatables.laserScanPlane = scanPlane;
  disposables.push(scanGeo);

  // 4. Hologram Ghost (For replacement scenario)
  const ghostGroup = new THREE.Group();
  const ghostPart = new THREE.Mesh(new THREE.BoxGeometry(2, 2, 2), ghostMat);
  ghostGroup.add(ghostPart);
  ghostGroup.position.set(3.5, 3, 0);
  ghostGroup.visible = false;
  group.add(ghostGroup);
  animatables.hologramTemplate = ghostGroup;

  // 5. Environment
  const grid = new THREE.GridHelper(40, 20, 0x1e293b, 0x0f172a);
  grid.position.y = -2.5;
  group.add(grid);
};

export const animateSimScene = (
  animatables: ComparisonSimAnimatables, 
  scenario: MaintenanceScenario,
  time: number
) => {
  if (!animatables.mainShaft) return;

  // Base behavior: Rotation
  // Fixed error: 'RUNNING' is not a member of MaintenanceScenario type. Removed invalid comparison.
  const isRunning = scenario === 'DEGRADED_RUN' || scenario === 'PATCH_REPAIR';
  if (isRunning) {
      animatables.mainShaft.rotation.x += 0.05;
      // Vibration for fault
      if (scenario === 'DEGRADED_RUN') {
          animatables.mainShaft.position.y = Math.sin(time * 50) * 0.02;
      } else {
          animatables.mainShaft.position.y = 0;
      }
  }

  // Fault Glow
  if (animatables.faultGlow) {
      animatables.faultGlow.intensity = (scenario === 'DEGRADED_RUN' || scenario === 'PATCH_REPAIR') ? 2 + Math.sin(time * 10) * 2 : 0;
  }

  // Scanning effect
  if (animatables.laserScanPlane) {
      animatables.laserScanPlane.visible = (scenario === 'COMPONENT_SWAP' || scenario === 'SYSTEM_UPGRADE');
      animatables.laserScanPlane.position.x = Math.sin(time * 2) * 5;
  }

  // Hologram
  if (animatables.hologramTemplate) {
      animatables.hologramTemplate.visible = (scenario === 'COMPONENT_SWAP' || scenario === 'SYSTEM_UPGRADE');
      animatables.hologramTemplate.rotation.y += 0.01;
      animatables.hologramTemplate.position.y = 3 + Math.sin(time * 2) * 0.5;
  }
};
