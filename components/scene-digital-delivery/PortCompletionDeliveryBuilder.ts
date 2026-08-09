
import * as THREE from 'three';
import { Animatables, SceneType } from '../three-types';

export const isPortCompletionDeliveryScene = (type: SceneType): boolean => {
  return type === 'dd-port-completion';
};

export const setupPortCompletionDeliveryCamera = (camera: THREE.PerspectiveCamera) => {
  camera.position.set(25, 20, 25);
  camera.lookAt(0, 0, 0);
};

export const initPortCompletionDeliveryScene = (
  type: SceneType, 
  group: THREE.Group, 
  animatables: Animatables, 
  disposables: { dispose: () => void }[]
) => {
  if (type !== 'dd-port-completion') return;

  // 1. Environment: Water & Quay
  const waterGeo = new THREE.PlaneGeometry(60, 40);
  waterGeo.rotateX(-Math.PI / 2);
  const waterMat = new THREE.MeshStandardMaterial({ 
    color: 0x0ea5e9, 
    transparent: true, 
    opacity: 0.6,
    roughness: 0.1 
  });
  disposables.push(waterGeo, waterMat);
  const water = new THREE.Mesh(waterGeo, waterMat);
  water.position.set(-10, -1, 0);
  group.add(water);

  const quayGeo = new THREE.BoxGeometry(20, 2, 40);
  const quayMat = new THREE.MeshStandardMaterial({ 
      color: 0x334155, 
      roughness: 0.8,
      metalness: 0.2
  });
  disposables.push(quayGeo, quayMat);
  const quay = new THREE.Mesh(quayGeo, quayMat);
  quay.position.set(10, -1, 0);
  group.add(quay);
  animatables.pcdQuay = quay;

  // 2. STS Cranes (Digital Wireframe/Solid Hybrid)
  animatables.pcdCranes = [];
  const cranePositions = [-10, 0, 10];
  const craneMat = new THREE.MeshStandardMaterial({ color: 0xf97316, emissive: 0xc2410c, emissiveIntensity: 0.2 });
  const craneWireMat = new THREE.MeshBasicMaterial({ color: 0xf97316, wireframe: true, transparent: true, opacity: 0.3 });
  disposables.push(craneMat, craneWireMat);

  const legGeo = new THREE.BoxGeometry(1, 15, 1);
  const boomGeo = new THREE.BoxGeometry(15, 1, 1);
  disposables.push(legGeo, boomGeo);

  cranePositions.forEach(z => {
      const cGroup = new THREE.Group();
      cGroup.position.set(6, 0, z);

      // Legs
      const l1 = new THREE.Mesh(legGeo, craneMat); l1.position.set(0, 7.5, 3);
      const l2 = new THREE.Mesh(legGeo, craneMat); l2.position.set(0, 7.5, -3);
      // Wireframe overlay
      const l1w = new THREE.Mesh(legGeo, craneWireMat); l1w.position.set(0, 7.5, 3); l1w.scale.set(1.05, 1.05, 1.05);
      const l2w = new THREE.Mesh(legGeo, craneWireMat); l2w.position.set(0, 7.5, -3); l2w.scale.set(1.05, 1.05, 1.05);

      // Boom
      const boom = new THREE.Mesh(boomGeo, craneMat); boom.position.set(-5, 14, 0);
      const boomW = new THREE.Mesh(boomGeo, craneWireMat); boomW.position.set(-5, 14, 0); boomW.scale.set(1.05, 1.05, 1.05);

      cGroup.add(l1, l2, l1w, l2w, boom, boomW);
      group.add(cGroup);
      animatables.pcdCranes?.push(cGroup);
  });

  // 3. Ship (Simplified)
  const shipGroup = new THREE.Group();
  const hullGeo = new THREE.BoxGeometry(6, 4, 30);
  const hullMat = new THREE.MeshStandardMaterial({ color: 0x1e3a8a });
  disposables.push(hullGeo, hullMat);
  const hull = new THREE.Mesh(hullGeo, hullMat);
  shipGroup.add(hull);
  
  // Containers on ship
  const contGeo = new THREE.BoxGeometry(1, 1, 2);
  const contMat = new THREE.MeshStandardMaterial({ color: 0x3b82f6 });
  disposables.push(contGeo, contMat);
  for(let x=-2; x<=2; x+=1.2) {
      for(let z=-12; z<=12; z+=2.2) {
           const c = new THREE.Mesh(contGeo, contMat);
           c.position.set(x, 2.5, z);
           shipGroup.add(c);
      }
  }
  shipGroup.position.set(-8, 1, 0);
  group.add(shipGroup);
  animatables.pcdShip = shipGroup;

  // 4. Scanning Plane (Verification)
  const scanGeo = new THREE.PlaneGeometry(60, 40);
  scanGeo.rotateY(Math.PI / 2); // Vertical plane scanning along Z
  const scanMat = new THREE.MeshBasicMaterial({ 
      color: 0x22d3ee, 
      transparent: true, 
      opacity: 0.1, 
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending 
  });
  disposables.push(scanGeo, scanMat);
  const scanPlane = new THREE.Mesh(scanGeo, scanMat);
  group.add(scanPlane);
  animatables.pcdScanner = scanPlane;

  // Scan Line
  const lineGeo = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(0, -20, 0), new THREE.Vector3(0, 20, 0)
  ]);
  const lineMat = new THREE.LineBasicMaterial({ color: 0xffffff, linewidth: 2 });
  disposables.push(lineGeo, lineMat);
  const scanLine = new THREE.Line(lineGeo, lineMat);
  scanPlane.add(scanLine);

  // 5. Data Flow (Particles rising from assets)
  const pCount = 300;
  const pGeo = new THREE.BufferGeometry();
  const pPos = new Float32Array(pCount * 3);
  for(let i=0; i<pCount; i++) {
      pPos[i*3] = (Math.random()-0.5) * 30; // X spread
      pPos[i*3+1] = Math.random() * 10; // Y
      pPos[i*3+2] = (Math.random()-0.5) * 30; // Z spread
  }
  pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
  const pMat = new THREE.PointsMaterial({ color: 0x22d3ee, size: 0.15, transparent: true, opacity: 0.6 });
  disposables.push(pGeo, pMat);
  const particles = new THREE.Points(pGeo, pMat);
  group.add(particles);
  animatables.pcdDataFlow = particles;
};

export const animatePortCompletionDeliveryScene = (type: SceneType, animatables: Animatables, time: number) => {
  if (type !== 'dd-port-completion') return;

  // 1. Scanner Movement (Sweep along Z)
  if (animatables.pcdScanner) {
      animatables.pcdScanner.position.z = Math.sin(time * 0.2) * 20;
  }

  // 2. Data Flow (Rising)
  if (animatables.pcdDataFlow) {
      const positions = animatables.pcdDataFlow.geometry.attributes.position.array as Float32Array;
      for(let i=0; i<positions.length; i+=3) {
          positions[i+1] += 0.1;
          if (positions[i+1] > 15) {
              positions[i+1] = 0;
              positions[i] = (Math.random()-0.5) * 30;
              positions[i+2] = (Math.random()-0.5) * 30;
          }
      }
      animatables.pcdDataFlow.geometry.attributes.position.needsUpdate = true;
  }

  // 3. Crane Pulse
  if (animatables.pcdCranes) {
      animatables.pcdCranes.forEach((crane, i) => {
          // Subtle sway or highlight
          // Let's pulse emissive if possible, or just bobbing
          // crane.position.y = Math.sin(time * 2 + i) * 0.05;
      });
  }
};
