
import * as THREE from 'three';
import { Animatables, SceneType } from '../three-types';

export const isPortAssetDeliveryScene = (type: SceneType): boolean => {
  return type === 'dd-port-asset';
};

export const setupPortAssetDeliveryCamera = (camera: THREE.PerspectiveCamera) => {
  camera.position.set(15, 10, 15);
  camera.lookAt(0, 2, 0);
};

export const initPortAssetDeliveryScene = (
  type: SceneType, 
  group: THREE.Group, 
  animatables: Animatables, 
  disposables: { dispose: () => void }[]
) => {
  if (type !== 'dd-port-asset') return;

  // Materials
  const metalMat = new THREE.MeshStandardMaterial({ 
      color: 0x64748b, roughness: 0.3, metalness: 0.8 
  });
  const orangeMat = new THREE.MeshStandardMaterial({ 
      color: 0xf97316, roughness: 0.4, metalness: 0.5 
  });
  const glassMat = new THREE.MeshPhysicalMaterial({
      color: 0x22d3ee, transparent: true, opacity: 0.3, roughness: 0.1, metalness: 0.9
  });
  const wireMat = new THREE.MeshBasicMaterial({ 
      color: 0x06b6d4, wireframe: true, transparent: true, opacity: 0.1 
  });

  disposables.push(metalMat, orangeMat, glassMat, wireMat);

  // 1. Inspection Platform (Turntable)
  const platformGroup = new THREE.Group();
  group.add(platformGroup);
  animatables.padPlatform = platformGroup;

  const baseGeo = new THREE.CylinderGeometry(12, 13, 1, 64);
  disposables.push(baseGeo);
  const base = new THREE.Mesh(baseGeo, new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.5 }));
  platformGroup.add(base);

  const gridHelper = new THREE.GridHelper(20, 20, 0x38bdf8, 0x0f172a);
  gridHelper.position.y = 0.51;
  platformGroup.add(gridHelper);

  // 2. The Asset: Reach Stacker
  const assetGroup = new THREE.Group();
  assetGroup.position.y = 0.5;
  platformGroup.add(assetGroup);
  animatables.padAsset = assetGroup;

  // Chassis
  const chassisGeo = new THREE.BoxGeometry(6, 1.5, 3.5);
  disposables.push(chassisGeo);
  const chassis = new THREE.Mesh(chassisGeo, orangeMat);
  chassis.position.y = 1.5; // Wheel height
  assetGroup.add(chassis);

  // Cab (Offset)
  const cabGeo = new THREE.BoxGeometry(1.5, 1.5, 1.5);
  disposables.push(cabGeo);
  const cab = new THREE.Mesh(cabGeo, glassMat);
  cab.position.set(0, 3, 1);
  assetGroup.add(cab);

  // Boom (Arm)
  const boomGroup = new THREE.Group();
  boomGroup.position.set(-2, 2.5, 0); // Pivot at back
  assetGroup.add(boomGroup);
  
  const boomGeo = new THREE.BoxGeometry(8, 0.8, 1);
  disposables.push(boomGeo);
  const boom = new THREE.Mesh(boomGeo, metalMat);
  boom.position.set(4, 0, 0); // Extend forward
  boom.rotation.z = Math.PI / 8; // Angled up
  boomGroup.add(boom);

  // Spreader (At end of boom)
  const spreaderGeo = new THREE.BoxGeometry(1, 0.5, 6);
  disposables.push(spreaderGeo);
  const spreader = new THREE.Mesh(spreaderGeo, metalMat);
  // Calculate tip pos roughly
  const tipX = 4 + Math.cos(Math.PI/8) * 4;
  const tipY = Math.sin(Math.PI/8) * 4;
  spreader.position.set(tipX, tipY, 0);
  boomGroup.add(spreader);

  // Wheels
  const wheelGeo = new THREE.CylinderGeometry(1, 1, 0.8, 32);
  wheelGeo.rotateX(Math.PI / 2);
  disposables.push(wheelGeo);
  const wheelMat = new THREE.MeshStandardMaterial({ color: 0x111111 });
  disposables.push(wheelMat);

  [ 
      {x: -2, z: 2}, {x: -2, z: -2}, 
      {x: 2, z: 2}, {x: 2, z: -2} 
  ].forEach(pos => {
      const w = new THREE.Mesh(wheelGeo, wheelMat);
      w.position.set(pos.x, 1, pos.z);
      assetGroup.add(w);
  });

  // Wireframe Ghost (for scanning effect)
  const chassisWire = new THREE.Mesh(chassisGeo, wireMat);
  chassisWire.position.copy(chassis.position);
  chassisWire.scale.multiplyScalar(1.02);
  assetGroup.add(chassisWire);

  // 3. Scanning Ring (Arch)
  const ringGroup = new THREE.Group();
  group.add(ringGroup);
  animatables.padScannerRing = ringGroup;

  const archShape = new THREE.Shape();
  archShape.absarc(0, 0, 8, 0, Math.PI, false);
  const archGeo = new THREE.ExtrudeGeometry(archShape, { depth: 1, bevelEnabled: false });
  disposables.push(archGeo);
  const archMat = new THREE.MeshBasicMaterial({ color: 0x22d3ee, transparent: true, opacity: 0.2 });
  disposables.push(archMat);
  
  const arch = new THREE.Mesh(archGeo, archMat);
  arch.scale.y = 1.2; // Taller
  arch.position.y = 0;
  // Rotate to stand upright across X axis scanning Z
  // Actually let's make it scan along X (length of vehicle)
  // Arch plane is XY, extrude Z.
  // We want it perpendicular to X axis. So rotate Y 90.
  arch.rotation.y = Math.PI / 2;
  ringGroup.add(arch);

  // Scan Laser Plane
  const laserGeo = new THREE.PlaneGeometry(16, 16);
  const laserMat = new THREE.MeshBasicMaterial({ 
      color: 0x06b6d4, 
      transparent: true, 
      opacity: 0.1, 
      side: THREE.DoubleSide 
  });
  disposables.push(laserGeo, laserMat);
  const laser = new THREE.Mesh(laserGeo, laserMat);
  laser.rotation.y = Math.PI / 2;
  laser.position.y = 8;
  ringGroup.add(laser);

  // 4. Hotspots (Floating Tags)
  animatables.padHotspots = [];
  const spots = [
      { x: 0, y: 3.5, z: 1, label: 'Cab' },
      { x: -2, y: 2, z: 0, label: 'Engine' },
      { x: 6, y: 4, z: 0, label: 'Spreader' }
  ];
  
  const spotGeo = new THREE.SphereGeometry(0.2);
  const spotMat = new THREE.MeshBasicMaterial({ color: 0xfacc15 });
  disposables.push(spotGeo, spotMat);

  spots.forEach(p => {
      const sGroup = new THREE.Group();
      sGroup.position.set(p.x, p.y, p.z);
      const mesh = new THREE.Mesh(spotGeo, spotMat);
      sGroup.add(mesh);
      
      // Ring
      const ringG = new THREE.RingGeometry(0.3, 0.35, 32);
      const ringM = new THREE.MeshBasicMaterial({ color: 0xfacc15, side: THREE.DoubleSide });
      disposables.push(ringG, ringM);
      const ring = new THREE.Mesh(ringG, ringM);
      // Fixed lookAt towards typical camera position
      ring.lookAt(new THREE.Vector3(15, 10, 15)); 
      sGroup.add(ring);
      
      assetGroup.add(sGroup); // Attach to asset so it rotates with it
      animatables.padHotspots?.push(sGroup);
  });

  // 5. Data Stream (Particles)
  const pCount = 200;
  const pGeo = new THREE.BufferGeometry();
  const pPos = new Float32Array(pCount * 3);
  for(let i=0; i<pCount; i++) {
      pPos[i*3] = (Math.random()-0.5) * 10;
      pPos[i*3+1] = Math.random() * 10;
      pPos[i*3+2] = (Math.random()-0.5) * 4;
  }
  pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
  const pMat = new THREE.PointsMaterial({ color: 0x22d3ee, size: 0.1, transparent: true, opacity: 0.5 });
  disposables.push(pGeo, pMat);
  const particles = new THREE.Points(pGeo, pMat);
  group.add(particles);
  animatables.padDataStream = particles;
};

export const animatePortAssetDeliveryScene = (type: SceneType, animatables: Animatables, time: number) => {
  if (type !== 'dd-port-asset') return;

  // 1. Rotate Platform
  if (animatables.padPlatform) {
      animatables.padPlatform.rotation.y = time * 0.1;
  }

  // 2. Move Scanner
  if (animatables.padScannerRing) {
      animatables.padScannerRing.position.x = Math.sin(time * 0.5) * 8;
  }

  // 3. Data Stream Lift
  if (animatables.padDataStream) {
      const positions = animatables.padDataStream.geometry.attributes.position.array as Float32Array;
      for(let i=0; i<positions.length; i+=3) {
          positions[i+1] += 0.05;
          if (positions[i+1] > 10) positions[i+1] = 0;
      }
      animatables.padDataStream.geometry.attributes.position.needsUpdate = true;
  }

  // 4. Hotspot Pulse
  if (animatables.padHotspots) {
      animatables.padHotspots.forEach((h, i) => {
          const ring = h.children[1];
          const s = 1 + Math.sin(time * 3 + i) * 0.3;
          ring.scale.set(s, s, s);
          // Keep ring facing roughly towards camera position to maintain billboard effect
          // Since asset rotates, we might want to update lookAt dynamically if we had camera ref
          // For now just pulse scale
      });
  }
};
