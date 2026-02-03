
import * as THREE from 'three';
import { Animatables, SceneType } from '../three-types';

export const isShipLifecycleDeliveryScene = (type: SceneType): boolean => {
  return type === 'dd-ship-lifecycle';
};

export const setupShipLifecycleDeliveryCamera = (camera: THREE.PerspectiveCamera) => {
  camera.position.set(25, 15, 25);
  camera.lookAt(0, 2, 0);
};

export const initShipLifecycleDeliveryScene = (
  type: SceneType, 
  group: THREE.Group, 
  animatables: Animatables, 
  disposables: { dispose: () => void }[]
) => {
  if (type !== 'dd-ship-lifecycle') return;

  // 1. Water / Drydock Base
  const waterGeo = new THREE.PlaneGeometry(60, 40, 64, 64);
  waterGeo.rotateX(-Math.PI / 2);
  const waterMat = new THREE.MeshStandardMaterial({ 
      color: 0x0f172a, 
      roughness: 0.1, 
      metalness: 0.8,
      transparent: true,
      opacity: 0.8
  });
  disposables.push(waterGeo, waterMat);
  const water = new THREE.Mesh(waterGeo, waterMat);
  water.position.y = -2;
  group.add(water);
  animatables.slcdWater = water;

  const gridHelper = new THREE.GridHelper(60, 60, 0x0ea5e9, 0x1e3a8a);
  gridHelper.position.y = -1.9;
  group.add(gridHelper);

  // 2. The Ship Model (Container Vessel Style)
  const shipGroup = new THREE.Group();
  group.add(shipGroup);
  animatables.slcdShip = shipGroup;

  // Materials
  const hullMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.5 });
  const deckMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.6 });
  const bottomMat = new THREE.MeshStandardMaterial({ color: 0x7f1d1d, roughness: 0.8 }); // Anti-fouling red
  const wireMat = new THREE.MeshBasicMaterial({ color: 0x22d3ee, wireframe: true, transparent: true, opacity: 0.2 });
  disposables.push(hullMat, deckMat, bottomMat, wireMat);

  // Hull
  const hullShape = new THREE.Shape();
  hullShape.moveTo(-20, 0);
  hullShape.lineTo(15, 0);
  hullShape.bezierCurveTo(18, 0, 20, 2, 22, 0); // Bow
  hullShape.lineTo(20, -6);
  hullShape.lineTo(-18, -6);
  hullShape.lineTo(-20, 0);

  const hullGeo = new THREE.ExtrudeGeometry(hullShape, { depth: 8, bevelEnabled: false });
  hullGeo.rotateX(-Math.PI / 2);
  hullGeo.translate(0, 3, -4); // Center
  disposables.push(hullGeo);
  
  const hullMesh = new THREE.Mesh(hullGeo, hullMat);
  shipGroup.add(hullMesh);

  // Bottom (Red)
  const bottomGeo = new THREE.BoxGeometry(38, 2, 8);
  bottomGeo.translate(0, 0, 0);
  disposables.push(bottomGeo);
  const bottomMesh = new THREE.Mesh(bottomGeo, bottomMat);
  bottomMesh.position.y = 1;
  shipGroup.add(bottomMesh);

  // Bridge / Superstructure
  const bridgeGeo = new THREE.BoxGeometry(5, 8, 8);
  disposables.push(bridgeGeo);
  const bridge = new THREE.Mesh(bridgeGeo, deckMat);
  bridge.position.set(-15, 7, 0);
  shipGroup.add(bridge);

  // Containers (Instanced)
  const contGeo = new THREE.BoxGeometry(2, 2, 2);
  const contMat = new THREE.MeshStandardMaterial({ color: 0x3b82f6 });
  disposables.push(contGeo, contMat);
  const containers = new THREE.InstancedMesh(contGeo, contMat, 40);
  const dummy = new THREE.Object3D();
  
  let idx = 0;
  for(let x = -10; x < 15; x += 2.5) {
      for(let y = 0; y < 3; y++) {
          for(let z = -2; z <= 2; z += 2.5) {
              if (idx < 40 && Math.random() > 0.3) {
                  dummy.position.set(x, 4 + y * 2, z);
                  dummy.updateMatrix();
                  containers.setMatrixAt(idx++, dummy.matrix);
              }
          }
      }
  }
  shipGroup.add(containers);

  // Wireframe Ghost (Digital Twin)
  const wireGroup = new THREE.Group();
  
  const wHull = new THREE.Mesh(hullGeo, wireMat);
  wireGroup.add(wHull);
  const wBridge = new THREE.Mesh(bridgeGeo, wireMat);
  wBridge.position.set(-15, 7, 0);
  wireGroup.add(wBridge);

  wireGroup.scale.multiplyScalar(1.02); // Slightly larger
  group.add(wireGroup);
  animatables.slcdWireframe = wireGroup;

  // 3. Scanning Ring (Verification)
  const ringGeo = new THREE.TorusGeometry(12, 0.2, 16, 64);
  // Scale to be oval
  ringGeo.scale(1, 1, 1.5); 
  const ringMat = new THREE.MeshBasicMaterial({ color: 0x00ff9d, transparent: true, opacity: 0.8 });
  disposables.push(ringGeo, ringMat);
  
  const scanner = new THREE.Mesh(ringGeo, ringMat);
  group.add(scanner);
  animatables.slcdScanner = scanner;

  // Scan Plane (Light sheet)
  const scanPlaneGeo = new THREE.PlaneGeometry(20, 20);
  const scanPlaneMat = new THREE.MeshBasicMaterial({ 
      color: 0x00ff9d, 
      transparent: true, 
      opacity: 0.05, 
      side: THREE.DoubleSide 
  });
  disposables.push(scanPlaneGeo, scanPlaneMat);
  const scanPlane = new THREE.Mesh(scanPlaneGeo, scanPlaneMat);
  scanner.add(scanPlane);

  // 4. Data Stream (Particles rising)
  const pCount = 300;
  const pGeo = new THREE.BufferGeometry();
  const pPos = new Float32Array(pCount * 3);
  for(let i=0; i<pCount; i++) {
      pPos[i*3] = (Math.random() - 0.5) * 40;
      pPos[i*3+1] = Math.random() * 5;
      pPos[i*3+2] = (Math.random() - 0.5) * 10;
  }
  pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
  const pMat = new THREE.PointsMaterial({ color: 0x22d3ee, size: 0.2, transparent: true, opacity: 0.6 });
  disposables.push(pGeo, pMat);
  const particles = new THREE.Points(pGeo, pMat);
  group.add(particles);
  animatables.slcdDataStream = particles;
};

export const animateShipLifecycleDeliveryScene = (type: SceneType, animatables: Animatables, time: number) => {
  if (type !== 'dd-ship-lifecycle') return;

  // 1. Scanner Movement (Back and forth)
  if (animatables.slcdScanner) {
      animatables.slcdScanner.position.x = Math.sin(time * 0.2) * 20;
      animatables.slcdScanner.rotation.z = Math.sin(time * 0.5) * 0.05; // Slight tilt
  }

  // 2. Wireframe Reveal Logic (Based on scanner pos)
  if (animatables.slcdWireframe && animatables.slcdScanner) {
      // Could adjust opacity based on scan position distance
      // Here just pulse
      (animatables.slcdWireframe.children[0] as THREE.Mesh).material = new THREE.MeshBasicMaterial({
          color: 0x22d3ee,
          wireframe: true,
          transparent: true,
          opacity: 0.1 + Math.abs(Math.sin(time)) * 0.2
      });
  }

  // 3. Data Stream Rising
  if (animatables.slcdDataStream) {
      const positions = animatables.slcdDataStream.geometry.attributes.position.array as Float32Array;
      for(let i=0; i<positions.length; i+=3) {
          positions[i+1] += 0.05; // Rise
          if (positions[i+1] > 15) {
              positions[i+1] = 0;
              positions[i] = (Math.random() - 0.5) * 35;
          }
      }
      animatables.slcdDataStream.geometry.attributes.position.needsUpdate = true;
  }

  // 4. Water Bobbing
  if (animatables.slcdShip) {
      animatables.slcdShip.position.y = Math.sin(time) * 0.1;
      animatables.slcdShip.rotation.z = Math.cos(time * 0.5) * 0.01;
      
      if (animatables.slcdWireframe) {
          animatables.slcdWireframe.position.copy(animatables.slcdShip.position);
          animatables.slcdWireframe.rotation.copy(animatables.slcdShip.rotation);
      }
  }
};
