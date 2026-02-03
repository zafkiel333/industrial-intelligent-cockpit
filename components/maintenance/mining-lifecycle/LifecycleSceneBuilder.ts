
import * as THREE from 'three';
import { LifecycleAnimatables } from './three-types';

export const initLifecycleScene = (
  group: THREE.Group, 
  animatables: LifecycleAnimatables,
  disposables: { dispose: () => void }[]
) => {
  // --- Materials ---
  const bodyMat = new THREE.MeshStandardMaterial({ color: 0x3f3f46, roughness: 0.5, metalness: 0.6 });
  const yellowPaint = new THREE.MeshStandardMaterial({ color: 0xfacc15, roughness: 0.4, metalness: 0.2 });
  const rustMat = new THREE.MeshStandardMaterial({ color: 0x451a03, roughness: 1.0, transparent: true, opacity: 0 });
  const tireMat = new THREE.MeshStandardMaterial({ color: 0x0a0a0a, roughness: 0.9 });
  const scannerMat = new THREE.MeshBasicMaterial({ color: 0x0ea5e9, wireframe: true, transparent: true, opacity: 0.1 });

  disposables.push(bodyMat, yellowPaint, rustMat, tireMat, scannerMat);

  // 1. Truck Group
  const truck = new THREE.Group();
  group.add(truck);
  animatables.truckGroup = truck;

  // Chassis
  const chassisGeo = new THREE.BoxGeometry(4, 1.5, 9);
  disposables.push(chassisGeo);
  const chassis = new THREE.Mesh(chassisGeo, bodyMat);
  truck.add(chassis);
  animatables.chassis = chassis;

  // Dump Body
  const bodyGeo = new THREE.BoxGeometry(5.5, 3, 8);
  bodyGeo.translate(0, 1.5, -0.5);
  disposables.push(bodyGeo);
  const dumpBody = new THREE.Mesh(bodyGeo, yellowPaint);
  truck.add(dumpBody);
  animatables.dumpBody = dumpBody;

  // Wheels
  animatables.wheels = [];
  const wheelGeo = new THREE.CylinderGeometry(1.4, 1.4, 1.2, 32);
  wheelGeo.rotateZ(Math.PI / 2);
  const wheelPos = [
      {x:-3, z:3}, {x:3, z:3},
      {x:-3.2, z:-3}, {x:3.2, z:-3}
  ];
  wheelPos.forEach(p => {
      const w = new THREE.Mesh(wheelGeo, tireMat);
      const wGroup = new THREE.Group();
      wGroup.position.set(p.x, -0.5, p.z);
      wGroup.add(w);
      truck.add(wGroup);
      animatables.wheels?.push(wGroup);
  });

  // 2. Rust Layer (Physical Degradation)
  const rustGroup = new THREE.Group();
  for(let i=0; i<30; i++) {
      const patch = new THREE.Mesh(new THREE.SphereGeometry(0.4, 8, 8), rustMat);
      patch.scale.set(Math.random()*2, 0.1, Math.random()*2);
      patch.position.set(
          (Math.random()-0.5)*5.6,
          0.5 + Math.random()*3,
          (Math.random()-0.5)*8.5
      );
      rustGroup.add(patch);
  }
  truck.add(rustGroup);
  animatables.rustOverlays = rustGroup;

  // 3. Scanning Effect
  const sphere = new THREE.Mesh(new THREE.SphereGeometry(8, 32, 32), scannerMat);
  group.add(sphere);
  animatables.scanningSphere = sphere;

  // 4. Ground
  const grid = new THREE.GridHelper(50, 20, 0x1e293b, 0x0c0a09);
  grid.position.y = -1.9;
  group.add(grid);
};

export const animateLifecycle = (
  animatables: LifecycleAnimatables, 
  year: number, // 0-15
  time: number
) => {
  if (!animatables.truckGroup) return;

  const ageFactor = year / 15;

  // 1. Rust physical manifestation
  if (animatables.rustOverlays) {
      animatables.rustOverlays.children.forEach((p, i) => {
          const mat = (p as THREE.Mesh).material as THREE.MeshStandardMaterial;
          // Slowly fade in rust patches as age increases
          mat.opacity = Math.max(0, (ageFactor * 1.5) - (i * 0.02));
      });
  }

  // 2. Chassis "Fatigue" vibration (increases with age)
  const vibration = Math.sin(time * 20) * 0.02 * ageFactor;
  animatables.truckGroup.position.y = vibration;

  // 3. Wheels rotation (Simulating running)
  if (animatables.wheels) {
      animatables.wheels.forEach(w => {
          w.children[0].rotation.x += 0.05 * (1 - ageFactor * 0.3); // Speed degrades with age
      });
  }

  // 4. Paint Color Fading
  if (animatables.dumpBody) {
      const mat = animatables.dumpBody.material as THREE.MeshStandardMaterial;
      const baseColor = new THREE.Color(0xfacc15);
      const fadedColor = new THREE.Color(0x71717a); // Greyish fade
      mat.color.lerpColors(baseColor, fadedColor, ageFactor * 0.5);
  }

  // 5. Scanner Pulse
  if (animatables.scanningSphere) {
      animatables.scanningSphere.scale.setScalar(0.8 + Math.sin(time * 2) * 0.05);
      animatables.scanningSphere.rotation.y += 0.005;
  }
};
