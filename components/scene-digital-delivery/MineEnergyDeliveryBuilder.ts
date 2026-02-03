
import * as THREE from 'three';
import { GeoAnimatables, SceneType } from './three-types';

export const isMineEnergyDeliveryScene = (type: SceneType): boolean => {
  return type === 'dd-mine-energy-delivery';
};

export const setupMineEnergyDeliveryCamera = (camera: THREE.PerspectiveCamera) => {
  camera.position.set(20, 25, 20);
  camera.lookAt(0, 0, 0);
};

export const initMineEnergyDeliveryScene = (
  scene: THREE.Scene, 
  animatables: GeoAnimatables, 
  disposables: { dispose: () => void }[]
) => {
  if (!animatables) return;

  const group = new THREE.Group();
  scene.add(group);
  animatables.medGrid = group;

  // 1. Hexagonal Grid Base
  const hexRadius = 15;
  const hexGeo = new THREE.CircleGeometry(hexRadius, 6);
  hexGeo.rotateX(-Math.PI / 2);
  const hexMat = new THREE.MeshBasicMaterial({ 
      color: 0x10b981, 
      wireframe: true, 
      transparent: true, 
      opacity: 0.1 
  });
  disposables.push(hexGeo, hexMat);
  const hexGrid = new THREE.Mesh(hexGeo, hexMat);
  group.add(hexGrid);

  // 2. Nodes (Source & Consumers)
  animatables.medNodes = [];
  const nodeGeo = new THREE.CylinderGeometry(0.5, 0.5, 2, 8);
  const sourceMat = new THREE.MeshStandardMaterial({ color: 0x22d3ee, emissive: 0x0ea5e9, emissiveIntensity: 0.5 });
  const consumerMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, emissive: 0xd97706, emissiveIntensity: 0.5 });
  disposables.push(nodeGeo, sourceMat, consumerMat);

  // Source (Substation)
  const sourceNode = new THREE.Group();
  sourceNode.position.set(0, 1, 0);
  const sMesh = new THREE.Mesh(new THREE.BoxGeometry(2, 4, 2), sourceMat);
  sourceNode.add(sMesh);
  group.add(sourceNode);
  animatables.medNodes.push({ mesh: sourceNode, type: 'source' });
  disposables.push(sMesh.geometry);

  // Consumers (Random placement)
  const consumers = [
      { x: -8, z: -8 }, { x: 8, z: -8 }, 
      { x: -10, z: 5 }, { x: 10, z: 5 },
      { x: 0, z: 12 }
  ];

  consumers.forEach(pos => {
      const cNode = new THREE.Group();
      cNode.position.set(pos.x, 1, pos.z);
      const cMesh = new THREE.Mesh(nodeGeo, consumerMat);
      cNode.add(cMesh);
      
      // Status Ring
      const ringGeo = new THREE.RingGeometry(0.8, 1, 16);
      ringGeo.rotateX(-Math.PI / 2);
      const ringMat = new THREE.MeshBasicMaterial({ color: 0xf59e0b, side: THREE.DoubleSide });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.position.y = -1;
      cNode.add(ring);
      disposables.push(ringGeo, ringMat);

      group.add(cNode);
      animatables.medNodes?.push({ mesh: cNode, type: 'consumer' });
  });

  // 3. Energy Flow Particles (Source -> Consumers)
  const pCount = 400;
  const pGeo = new THREE.BufferGeometry();
  const pPos = new Float32Array(pCount * 3);
  const pData = new Float32Array(pCount * 4); // startX, startZ, endX, endZ

  for(let i=0; i<pCount; i++) {
      const target = consumers[Math.floor(Math.random() * consumers.length)];
      pData[i*4] = 0; // Source X
      pData[i*4+1] = 0; // Source Z
      pData[i*4+2] = target.x;
      pData[i*4+3] = target.z;
      
      pPos[i*3] = 0; pPos[i*3+1] = 2; pPos[i*3+2] = 0;
  }
  pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
  pGeo.setAttribute('route', new THREE.BufferAttribute(pData, 4));
  
  const pMat = new THREE.PointsMaterial({ color: 0x22d3ee, size: 0.2 });
  disposables.push(pGeo, pMat);
  const flow = new THREE.Points(pGeo, pMat);
  group.add(flow);
  animatables.medEnergyFlow = flow;

  // 4. Carbon Clouds (Rising from Consumers)
  const cCount = 500;
  const cGeo = new THREE.BufferGeometry();
  const cPos = new Float32Array(cCount * 3);
  const cData = new Float32Array(cCount * 3); // originX, originZ, speed
  
  for(let i=0; i<cCount; i++) {
      const target = consumers[Math.floor(Math.random() * consumers.length)];
      // Initial pos relative to consumer
      cData[i*3] = target.x;
      cData[i*3+1] = target.z;
      cData[i*3+2] = 0.02 + Math.random() * 0.05; // speed

      cPos[i*3] = target.x + (Math.random()-0.5) * 2;
      cPos[i*3+1] = 2 + Math.random() * 3;
      cPos[i*3+2] = target.z + (Math.random()-0.5) * 2;
  }
  cGeo.setAttribute('position', new THREE.BufferAttribute(cPos, 3));
  cGeo.setAttribute('info', new THREE.BufferAttribute(cData, 3));

  const cMat = new THREE.PointsMaterial({ 
      color: 0x9ca3af, 
      size: 0.3, 
      transparent: true, 
      opacity: 0.3,
      blending: THREE.NormalBlending
  });
  disposables.push(cGeo, cMat);
  const clouds = new THREE.Points(cGeo, cMat);
  group.add(clouds);
  animatables.medCarbonClouds = clouds;

  // 5. Verification Scanner
  const scanGeo = new THREE.RingGeometry(14, 15, 64);
  scanGeo.rotateX(-Math.PI / 2);
  const scanMat = new THREE.MeshBasicMaterial({ color: 0x10b981, transparent: true, opacity: 0.5, side: THREE.DoubleSide });
  disposables.push(scanGeo, scanMat);
  const scanner = new THREE.Mesh(scanGeo, scanMat);
  scanner.position.y = 0.5;
  group.add(scanner);
  animatables.medScanner = scanner;
};

export const animateMineEnergyDeliveryScene = (animatables: GeoAnimatables, time: number) => {
  // 1. Energy Flow
  if (animatables.medEnergyFlow) {
      const positions = animatables.medEnergyFlow.geometry.attributes.position.array as Float32Array;
      const routes = animatables.medEnergyFlow.geometry.attributes.route.array as Float32Array;
      
      for(let i=0; i<positions.length/3; i++) {
          const sx = routes[i*4];
          const sz = routes[i*4+1];
          const ex = routes[i*4+2];
          const ez = routes[i*4+3];
          
          // Progress cycling
          let t = (time * 0.5 + i * 0.01) % 1;
          
          positions[i*3] = sx + (ex - sx) * t;
          positions[i*3+1] = 2 + Math.sin(t * Math.PI) * 2; // Arc
          positions[i*3+2] = sz + (ez - sz) * t;
      }
      animatables.medEnergyFlow.geometry.attributes.position.needsUpdate = true;
  }

  // 2. Carbon Clouds
  if (animatables.medCarbonClouds) {
      const positions = animatables.medCarbonClouds.geometry.attributes.position.array as Float32Array;
      const info = animatables.medCarbonClouds.geometry.attributes.info.array as Float32Array;

      for(let i=0; i<positions.length/3; i++) {
          const originX = info[i*3];
          const originZ = info[i*3+1];
          const speed = info[i*3+2];

          positions[i*3+1] += speed; // Rise
          // Drift slightly
          positions[i*3] += Math.sin(time + i) * 0.01;

          // Reset
          if (positions[i*3+1] > 8) {
              positions[i*3+1] = 2;
              positions[i*3] = originX + (Math.random()-0.5) * 2;
              positions[i*3+2] = originZ + (Math.random()-0.5) * 2;
          }
      }
      animatables.medCarbonClouds.geometry.attributes.position.needsUpdate = true;
  }

  // 3. Scanner Ring
  if (animatables.medScanner) {
      const s = 1 + Math.sin(time * 0.5) * 0.2;
      animatables.medScanner.scale.set(s, 1, s);
      animatables.medScanner.rotation.y = -time * 0.2;
  }
};
