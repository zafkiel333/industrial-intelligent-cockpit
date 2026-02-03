
import * as THREE from 'three';
import { Animatables, SceneType } from '../three-types';

export const isMineSafetyDeliveryScene = (type: SceneType): boolean => {
  return type === 'dd-mine-safety-delivery';
};

export const setupMineSafetyDeliveryCamera = (camera: THREE.PerspectiveCamera) => {
  camera.position.set(0, 5, 20);
  camera.lookAt(0, 0, 0);
};

export const initMineSafetyDeliveryScene = (
  type: SceneType, 
  group: THREE.Group, 
  animatables: Animatables, 
  disposables: { dispose: () => void }[]
) => {
  if (type !== 'dd-mine-safety-delivery') return;

  // 1. Holographic Tunnel Structure
  const tunnelGroup = new THREE.Group();
  group.add(tunnelGroup);

  // Tunnel Sections
  const shape = new THREE.Shape();
  shape.moveTo(-4, 0);
  shape.lineTo(-4, 3);
  shape.absarc(0, 3, 4, Math.PI, 0, true);
  shape.lineTo(4, 0);
  
  const tunnelGeo = new THREE.ExtrudeGeometry(shape, {
      steps: 5,
      depth: 30,
      bevelEnabled: false
  });
  tunnelGeo.translate(0, 0, -15); // Center

  const wireMat = new THREE.MeshBasicMaterial({ 
      color: 0x334155, 
      wireframe: true, 
      transparent: true, 
      opacity: 0.15 
  });
  const edgeGeo = new THREE.EdgesGeometry(tunnelGeo);
  const edgeMat = new THREE.LineBasicMaterial({ color: 0x00ff9d, transparent: true, opacity: 0.1 });
  
  disposables.push(tunnelGeo, wireMat, edgeGeo, edgeMat);
  
  const tunnelMesh = new THREE.Mesh(tunnelGeo, wireMat);
  const tunnelEdges = new THREE.LineSegments(edgeGeo, edgeMat);
  
  tunnelGroup.add(tunnelMesh);
  tunnelGroup.add(tunnelEdges);

  // 2. Sensor Nodes (Placed along the walls)
  animatables.msdSensors = [];
  const sensorGeo = new THREE.BoxGeometry(0.5, 0.5, 0.2);
  const sensorMat = new THREE.MeshBasicMaterial({ color: 0x00ff9d });
  disposables.push(sensorGeo, sensorMat);

  const sensorPositions = [
      { x: -3.8, y: 2, z: -10, type: 'Gas' },
      { x: 3.8, y: 2.5, z: -5, type: 'Wind' },
      { x: -3.8, y: 2, z: 0, type: 'Gas' },
      { x: 3.8, y: 2.5, z: 5, type: 'Temp' },
      { x: 0, y: 6.8, z: -2, type: 'Smoke' } // Ceiling
  ];

  sensorPositions.forEach(pos => {
      const sGroup = new THREE.Group();
      sGroup.position.set(pos.x, pos.y, pos.z);
      
      // Face inward
      sGroup.lookAt(0, pos.y, pos.z);

      const mesh = new THREE.Mesh(sensorGeo, sensorMat);
      sGroup.add(mesh);
      
      // Ping ring
      const ringGeo = new THREE.RingGeometry(0.3, 0.4, 32);
      const ringMat = new THREE.MeshBasicMaterial({ color: 0x00ff9d, transparent: true, opacity: 0.5, side: THREE.DoubleSide });
      disposables.push(ringGeo, ringMat);
      const ring = new THREE.Mesh(ringGeo, ringMat);
      sGroup.add(ring);

      tunnelGroup.add(sGroup);
      animatables.msdSensors?.push({ mesh: sGroup, type: pos.type });
  });

  // 3. Simulated Gas Cloud (Particles)
  const pCount = 300;
  const pGeo = new THREE.BufferGeometry();
  const pPos = new Float32Array(pCount * 3);
  
  for(let i=0; i<pCount; i++) {
      pPos[i*3] = (Math.random()-0.5) * 4;
      pPos[i*3+1] = Math.random() * 4;
      pPos[i*3+2] = -12 + Math.random() * 8; // Localized cloud
  }
  pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
  
  const pMat = new THREE.PointsMaterial({ 
      color: 0xff0055, 
      size: 0.15, 
      transparent: true, 
      opacity: 0.0, // Start invisible
      blending: THREE.AdditiveBlending 
  });
  disposables.push(pGeo, pMat);
  
  const cloud = new THREE.Points(pGeo, pMat);
  group.add(cloud);
  animatables.msdGasCloud = cloud;

  // 4. Scanning Beam (Validation)
  const scanGeo = new THREE.PlaneGeometry(10, 10);
  const scanMat = new THREE.MeshBasicMaterial({ 
      color: 0x00ff9d, 
      transparent: true, 
      opacity: 0.05, 
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending
  });
  disposables.push(scanGeo, scanMat);
  
  const scanner = new THREE.Mesh(scanGeo, scanMat);
  group.add(scanner);
  animatables.msdScanBeam = scanner;

  // Scan line
  const lineGeo = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(-5, 5, 0), new THREE.Vector3(5, 5, 0),
      new THREE.Vector3(5, -5, 0), new THREE.Vector3(-5, -5, 0),
      new THREE.Vector3(-5, 5, 0)
  ]);
  const lineMat = new THREE.LineBasicMaterial({ color: 0x00ff9d });
  disposables.push(lineGeo, lineMat);
  const line = new THREE.Line(lineGeo, lineMat);
  scanner.add(line);
};

export const animateMineSafetyDeliveryScene = (type: SceneType, animatables: Animatables, time: number) => {
  if (type !== 'dd-mine-safety-delivery') return;

  // Retrieve Simulation Mode from UserData
  const simMode = (animatables.msdGasCloud?.parent as any)?.userData?.simMode || 'SCAN';

  // 1. Scanner Animation
  if (animatables.msdScanBeam) {
      if (simMode === 'SCAN') {
          animatables.msdScanBeam.visible = true;
          animatables.msdScanBeam.position.z = Math.sin(time * 0.5) * 12;
      } else {
          animatables.msdScanBeam.visible = false;
      }
  }

  // 2. Sensor Pulse
  if (animatables.msdSensors) {
      animatables.msdSensors.forEach((s, i) => {
          const ring = s.mesh.children[1] as THREE.Mesh;
          const scale = 1 + Math.sin(time * 3 + i) * 0.5;
          ring.scale.setScalar(scale);
          (ring.material as THREE.Material).opacity = 1 - (scale - 0.5);
          
          // If Alert Mode
          if (simMode === 'ALERT' && s.type === 'Gas') {
              (s.mesh.children[0] as THREE.Mesh).material = new THREE.MeshBasicMaterial({ color: 0xff0055 });
              (ring.material as THREE.MeshBasicMaterial).color.setHex(0xff0055);
          } else {
              (s.mesh.children[0] as THREE.Mesh).material = new THREE.MeshBasicMaterial({ color: 0x00ff9d });
              (ring.material as THREE.MeshBasicMaterial).color.setHex(0x00ff9d);
          }
      });
  }

  // 3. Gas Cloud Animation
  if (animatables.msdGasCloud) {
      const mat = animatables.msdGasCloud.material as THREE.PointsMaterial;
      if (simMode === 'ALERT') {
          mat.opacity = THREE.MathUtils.lerp(mat.opacity, 0.8, 0.05);
          const positions = animatables.msdGasCloud.geometry.attributes.position.array as Float32Array;
          for(let i=0; i<positions.length; i+=3) {
              positions[i] += (Math.random()-0.5)*0.02;
              positions[i+1] += 0.01;
              if (positions[i+1] > 4) positions[i+1] = 0;
          }
          animatables.msdGasCloud.geometry.attributes.position.needsUpdate = true;
      } else {
          mat.opacity = THREE.MathUtils.lerp(mat.opacity, 0, 0.1);
      }
  }
};
