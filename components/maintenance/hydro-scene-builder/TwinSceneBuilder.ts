
import * as THREE from 'three';
import { TwinAnimatables, TwinLayerType } from './three-types';

export const initTwinBuilderScene = (
  group: THREE.Group, 
  animatables: TwinAnimatables,
  disposables: { dispose: () => void }[]
) => {
  // --- Materials ---
  const metalMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.3, metalness: 0.7 });
  const glassMat = new THREE.MeshPhysicalMaterial({ color: 0x22d3ee, transparent: true, opacity: 0.2, transmission: 0.8 });
  const pointMat = new THREE.PointsMaterial({ color: 0x0ea5e9, size: 0.05, transparent: true, opacity: 0.6 });
  const sensorMat = new THREE.MeshBasicMaterial({ color: 0xf59e0b });
  const laserMat = new THREE.MeshBasicMaterial({ color: 0xf59e0b, transparent: true, opacity: 0.2, side: THREE.DoubleSide });

  disposables.push(metalMat, glassMat, pointMat, sensorMat, laserMat);

  // 1. Point Cloud Layer (Abstract points)
  const pCount = 5000;
  const pGeo = new THREE.BufferGeometry();
  const pPos = new Float32Array(pCount * 3);
  for(let i=0; i<pCount; i++) {
      pPos[i*3] = (Math.random() - 0.5) * 10;
      pPos[i*3+1] = Math.random() * 8;
      pPos[i*3+2] = (Math.random() - 0.5) * 10;
  }
  pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
  const pointCloud = new THREE.Points(pGeo, pointMat);
  group.add(pointCloud);
  animatables.pointCloud = pointCloud;

  // 2. High-Fi Mesh Layer (Generator/Turbine Shell)
  const solidGroup = new THREE.Group();
  const cylinderGeo = new THREE.CylinderGeometry(4, 4.5, 6, 32);
  const shell = new THREE.Mesh(cylinderGeo, metalMat);
  shell.position.y = 3;
  solidGroup.add(shell);
  
  // Internal wireframe
  const wire = new THREE.Mesh(cylinderGeo, new THREE.MeshBasicMaterial({ color: 0x22d3ee, wireframe: true, transparent: true, opacity: 0.1 }));
  wire.scale.setScalar(1.01);
  wire.position.y = 3;
  solidGroup.add(wire);
  
  group.add(solidGroup);
  animatables.solidMesh = solidGroup;

  // 3. IoT Sensor Nodes
  const sensorGroup = new THREE.Group();
  const nodeGeo = new THREE.BoxGeometry(0.2, 0.2, 0.2);
  const positions = [
      [0, 6.1, 0], [4.1, 3, 0], [-4.1, 3, 0], [0, 1, 4.1], [0, 1, -4.1]
  ];
  positions.forEach(p => {
      const node = new THREE.Mesh(nodeGeo, sensorMat);
      node.position.set(p[0], p[1], p[2]);
      sensorGroup.add(node);
      
      const glow = new THREE.PointLight(0xf59e0b, 1, 3);
      glow.position.copy(node.position);
      sensorGroup.add(glow);
  });
  group.add(sensorGroup);
  animatables.sensorNodes = sensorGroup;

  // 4. Scanning Laser Beam
  const beamGeo = new THREE.CylinderGeometry(0.1, 8, 0.1, 32);
  beamGeo.rotateX(Math.PI / 2);
  const beam = new THREE.Mesh(beamGeo, laserMat);
  beam.position.y = 4;
  group.add(beam);
  animatables.scanningRay = beam;

  // Floor Grid
  const grid = new THREE.GridHelper(30, 20, 0x1e293b, 0x0f172a);
  grid.position.y = 0;
  group.add(grid);
  animatables.gridFloor = grid;
};

export const animateTwinScene = (
  animatables: TwinAnimatables, 
  activeLayers: TwinLayerType[],
  time: number
) => {
  // Layer visibility
  if (animatables.pointCloud) animatables.pointCloud.visible = activeLayers.includes('POINT_CLOUD');
  if (animatables.solidMesh) animatables.solidMesh.visible = activeLayers.includes('MESH');
  if (animatables.sensorNodes) animatables.sensorNodes.visible = activeLayers.includes('SENSOR');

  // Scanning animation
  if (animatables.scanningRay) {
      animatables.scanningRay.position.y = 4 + Math.sin(time * 2) * 4;
      animatables.scanningRay.rotation.y += 0.01;
      animatables.scanningRay.visible = activeLayers.includes('POINT_CLOUD');
  }

  // Points pulsing
  if (animatables.pointCloud) {
      animatables.pointCloud.rotation.y += 0.002;
  }

  // Sensor node blinking
  if (animatables.sensorNodes) {
      animatables.sensorNodes.children.forEach((child, i) => {
          if (child instanceof THREE.PointLight) {
              child.intensity = 1 + Math.sin(time * 10 + i) * 1;
          }
      });
  }

  // Subtle group rotation for better overview
  if (animatables.solidMesh && activeLayers.includes('MESH')) {
      animatables.solidMesh.rotation.y += 0.001;
  }
};
