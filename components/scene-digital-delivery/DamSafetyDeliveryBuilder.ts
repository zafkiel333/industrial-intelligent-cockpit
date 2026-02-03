
import * as THREE from 'three';
import { Animatables, SceneType } from '../three-types';

export const isDamSafetyDeliveryScene = (type: SceneType): boolean => {
  return type === 'dd-dam-safety-delivery';
};

export const setupDamSafetyDeliveryCamera = (camera: THREE.PerspectiveCamera) => {
  camera.position.set(15, 12, 18);
  camera.lookAt(0, 0, 0);
};

export const initDamSafetyDeliveryScene = (
  type: SceneType, 
  group: THREE.Group, 
  animatables: Animatables, 
  disposables: { dispose: () => void }[]
) => {
  if (type !== 'dd-dam-safety-delivery') return;

  // 1. Transparent Dam Structure (The "Patient")
  // Using an Arch Dam shape approximation
  const curvePath = new THREE.CurvePath();
  const curve = new THREE.QuadraticBezierCurve3(
    new THREE.Vector3(-10, 0, 5),
    new THREE.Vector3(0, 0, -5),
    new THREE.Vector3(10, 0, 5)
  );
  
  // Custom geometry for an arch dam (Extruding along Y is tricky with curvature, so we use a simpler approach)
  // Let's use a Tube geometry vertically or a deformed cylinder.
  // Deformed Cylinder:
  const damGeo = new THREE.CylinderGeometry(12, 10, 8, 32, 4, true, Math.PI, Math.PI);
  // Flatten it a bit
  damGeo.scale(1.5, 1, 0.4);
  damGeo.translate(0, 0, -4);
  disposables.push(damGeo);

  const damMat = new THREE.MeshPhysicalMaterial({ 
    color: 0x3b82f6, 
    transparent: true, 
    opacity: 0.15, 
    roughness: 0.2, 
    metalness: 0.8,
    side: THREE.DoubleSide
  });
  disposables.push(damMat);
  const damMesh = new THREE.Mesh(damGeo, damMat);
  group.add(damMesh);

  // Add structural grid overlay (Wireframe)
  const wireGeo = new THREE.WireframeGeometry(damGeo);
  const wireMat = new THREE.LineBasicMaterial({ color: 0x60a5fa, transparent: true, opacity: 0.1 });
  disposables.push(wireGeo, wireMat);
  const wireMesh = new THREE.LineSegments(wireGeo, wireMat);
  group.add(wireMesh);

  // 2. Sensor Nodes (The "Nerves")
  animatables.dsdSensorNodes = [];
  const sensorGeo = new THREE.BoxGeometry(0.3, 0.3, 0.3);
  const sensorMat = new THREE.MeshBasicMaterial({ color: 0x22c55e }); // Green = Verified
  disposables.push(sensorGeo, sensorMat);

  // Distribute sensors on the dam surface
  // We approximate positions based on the cylinder shape
  const rows = 4;
  const cols = 6;
  const cablePoints: THREE.Vector3[] = [];

  // Central DAU (Data Acquisition Unit) at base
  const dauGeo = new THREE.BoxGeometry(1, 2, 1);
  const dauMat = new THREE.MeshStandardMaterial({ color: 0x6366f1, emissive: 0x312e81 });
  disposables.push(dauGeo, dauMat);
  const dau = new THREE.Mesh(dauGeo, dauMat);
  dau.position.set(12, -3, 5); // Side station
  group.add(dau);

  for (let r = 0; r < rows; r++) {
    const y = -3 + r * 2; // Height levels
    for (let c = 0; c < cols; c++) {
      const theta = Math.PI + (c / (cols - 1)) * Math.PI; // Semicircle
      const radius = 12 - (r * 0.5); // Tapering
      
      const x = Math.cos(theta) * radius * 1.5;
      const z = Math.sin(theta) * radius * 0.4 - 4;
      
      const sensorGroup = new THREE.Group();
      sensorGroup.position.set(x, y, z);
      
      const mesh = new THREE.Mesh(sensorGeo, sensorMat);
      sensorGroup.add(mesh);
      
      // Halo
      const haloGeo = new THREE.RingGeometry(0.2, 0.25, 16);
      const haloMat = new THREE.MeshBasicMaterial({ color: 0x22c55e, side: THREE.DoubleSide, transparent: true, opacity: 0.5 });
      disposables.push(haloGeo, haloMat);
      const halo = new THREE.Mesh(haloGeo, haloMat);
      halo.lookAt(new THREE.Vector3(0, y, -20)); // Face outwards roughly
      sensorGroup.add(halo);

      group.add(sensorGroup);
      animatables.dsdSensorNodes.push(sensorGroup);

      // Store point for cabling
      cablePoints.push(new THREE.Vector3(x, y, z));
    }
  }

  // 3. Cabling (Connecting sensors to DAU)
  const cableMat = new THREE.LineBasicMaterial({ color: 0x475569, transparent: true, opacity: 0.4 });
  disposables.push(cableMat);
  animatables.dsdCableLines = [];

  cablePoints.forEach(pt => {
    const points = [pt, dau.position];
    const geo = new THREE.BufferGeometry().setFromPoints(points);
    disposables.push(geo);
    const line = new THREE.Line(geo, cableMat);
    group.add(line);
    animatables.dsdCableLines?.push(line);
  });

  // 4. Data Packets (Particles flowing along cables)
  const pCount = 200;
  const pGeo = new THREE.BufferGeometry();
  const pPos = new Float32Array(pCount * 3);
  // Store start and end points index
  const pData = new Float32Array(pCount * 2); // [cableIndex, progress]
  
  for(let i=0; i<pCount; i++) {
    const cableIdx = Math.floor(Math.random() * cablePoints.length);
    pData[i*2] = cableIdx;
    pData[i*2+1] = Math.random(); // Random progress
    pPos[i*3] = 0; pPos[i*3+1] = 0; pPos[i*3+2] = 0; 
  }
  
  pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
  pGeo.setAttribute('meta', new THREE.BufferAttribute(pData, 2));

  const pMat = new THREE.PointsMaterial({ color: 0xffff00, size: 0.15 });
  disposables.push(pGeo, pMat);
  const packets = new THREE.Points(pGeo, pMat);
  group.add(packets);
  animatables.dsdDataPackets = packets;

  // Store cable points ref for animation
  (packets as any).userData = { starts: cablePoints, end: dau.position };

  // 5. Verification Scanner (Vertical Plane)
  const scanGeo = new THREE.PlaneGeometry(30, 15);
  const scanMat = new THREE.MeshBasicMaterial({ 
    color: 0x0ea5e9, 
    transparent: true, 
    opacity: 0.05, 
    side: THREE.DoubleSide,
    blending: THREE.AdditiveBlending
  });
  disposables.push(scanGeo, scanMat);
  const scanner = new THREE.Mesh(scanGeo, scanMat);
  group.add(scanner);
  animatables.dsdScanner = scanner;
  
  // Scan Line
  const sLineGeo = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(-15, 0, 0), new THREE.Vector3(15, 0, 0)]);
  const sLineMat = new THREE.LineBasicMaterial({ color: 0x0ea5e9, linewidth: 2 });
  disposables.push(sLineGeo, sLineMat);
  const sLine = new THREE.Line(sLineGeo, sLineMat);
  scanner.add(sLine);
};

export const animateDamSafetyDeliveryScene = (type: SceneType, animatables: Animatables, time: number) => {
  if (type !== 'dd-dam-safety-delivery') return;

  // 1. Pulse Sensors
  if (animatables.dsdSensorNodes) {
    animatables.dsdSensorNodes.forEach((node, i) => {
      const halo = node.children[1] as THREE.Mesh;
      const scale = 1 + Math.sin(time * 5 + i) * 0.3;
      halo.scale.setScalar(scale);
      (halo.material as THREE.MeshBasicMaterial).opacity = 0.5 - (scale - 1);
    });
  }

  // 2. Animate Data Packets (Sensor -> DAU)
  if (animatables.dsdDataPackets) {
    const packets = animatables.dsdDataPackets;
    const positions = packets.geometry.attributes.position.array as Float32Array;
    const meta = packets.geometry.attributes.meta.array as Float32Array;
    const { starts, end } = (packets as any).userData;

    for(let i=0; i<meta.length/2; i++) {
      let t = meta[i*2+1];
      const cableIdx = meta[i*2];
      const start = starts[cableIdx];

      t += 0.02; // Speed
      if(t > 1) t = 0;
      meta[i*2+1] = t;

      // Lerp
      positions[i*3] = start.x + (end.x - start.x) * t;
      positions[i*3+1] = start.y + (end.y - start.y) * t;
      positions[i*3+2] = start.z + (end.z - start.z) * t;
    }
    packets.geometry.attributes.position.needsUpdate = true;
    packets.geometry.attributes.meta.needsUpdate = true;
  }

  // 3. Move Scanner
  if (animatables.dsdScanner) {
    // Sweep back and forth along Z
    animatables.dsdScanner.position.z = Math.sin(time * 0.3) * 6;
  }
};
