
import * as THREE from 'three';
import { UnmannedAnimatables, UnmannedMaintPhase } from './three-types';

export const initUnmannedScene = (
  group: THREE.Group, 
  animatables: UnmannedAnimatables,
  disposables: { dispose: () => void }[]
) => {
  // --- Materials ---
  const bodyMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.5, metalness: 0.5 });
  const sensorMat = new THREE.MeshStandardMaterial({ color: 0x0ea5e9, emissive: 0x0ea5e9, emissiveIntensity: 0.5 });
  const glassMat = new THREE.MeshPhysicalMaterial({ color: 0x22d3ee, transparent: true, opacity: 0.3, transmission: 0.9 });
  const tireMat = new THREE.MeshStandardMaterial({ color: 0x0a0a0a, roughness: 0.9 });
  const laserMat = new THREE.MeshBasicMaterial({ color: 0x22d3ee, transparent: true, opacity: 0.4, side: THREE.DoubleSide });

  disposables.push(bodyMat, sensorMat, glassMat, tireMat, laserMat);

  // 1. Autonomous Truck Model
  const truckGroup = new THREE.Group();
  group.add(truckGroup);
  animatables.truckBody = truckGroup;

  // Chassis
  const chassis = new THREE.Mesh(new THREE.BoxGeometry(4, 1.2, 8), bodyMat);
  truckGroup.add(chassis);

  // Payload Body
  const box = new THREE.Mesh(new THREE.BoxGeometry(5, 2.5, 7), bodyMat);
  box.position.set(0, 1.8, -0.5);
  truckGroup.add(box);

  // "Unmanned" Sensor Cluster (Replaces Cab)
  const sensorBox = new THREE.Mesh(new THREE.BoxGeometry(1.5, 1, 1.5), bodyMat);
  sensorBox.position.set(0, 1.2, 3.2);
  truckGroup.add(sensorBox);

  const lidarGeo = new THREE.CylinderGeometry(0.4, 0.4, 0.4, 16);
  const lidar = new THREE.Mesh(lidarGeo, sensorMat);
  lidar.position.y = 0.7;
  sensorBox.add(lidar);
  animatables.lidarRing = lidar as any;

  // 2. Wheels
  const wheelGeo = new THREE.CylinderGeometry(1.2, 1.2, 1, 32);
  wheelGeo.rotateZ(Math.PI / 2);
  const wheelPositions = [
    {x: -2.8, z: 2.5}, {x: 2.8, z: 2.5},
    {x: -2.8, z: -2.5}, {x: 2.8, z: -2.5}
  ];
  wheelPositions.forEach(p => {
    const wheel = new THREE.Mesh(wheelGeo, tireMat);
    wheel.position.set(p.x, 0.2, p.z);
    truckGroup.add(wheel);
  });

  // 3. Environment Scanning Beam
  const beamGeo = new THREE.CylinderGeometry(8, 0.1, 0.05, 32, 1, true);
  beamGeo.rotateX(Math.PI / 2);
  const beam = new THREE.Mesh(beamGeo, laserMat);
  beam.position.set(0, 1.9, 3.2);
  beam.visible = false;
  truckGroup.add(beam);
  animatables.scanningBeam = beam;

  // 4. Data Flow Particles
  const pCount = 200;
  const pGeo = new THREE.BufferGeometry();
  const pPos = new Float32Array(pCount * 3);
  for(let i=0; i<pCount; i++) {
    pPos[i*3] = (Math.random()-0.5) * 10;
    pPos[i*3+1] = Math.random() * 5;
    pPos[i*3+2] = (Math.random()-0.5) * 10;
  }
  pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
  const pMat = new THREE.PointsMaterial({ color: 0x22d3ee, size: 0.1, transparent: true, opacity: 0.4 });
  const flow = new THREE.Points(pGeo, pMat);
  group.add(flow);
  animatables.dataFlowParticles = flow;

  // 5. Ground Grid
  const grid = new THREE.GridHelper(50, 20, 0x1e293b, 0x0f172a);
  grid.position.y = -1;
  group.add(grid);
};

export const animateUnmannedScene = (
  animatables: UnmannedAnimatables, 
  phase: UnmannedMaintPhase,
  time: number
) => {
  if (animatables.lidarRing) {
    animatables.lidarRing.rotation.y += 0.1;
  }

  if (animatables.dataFlowParticles) {
    animatables.dataFlowParticles.rotation.y += 0.005;
    const mat = animatables.dataFlowParticles.material as THREE.PointsMaterial;
    mat.opacity = 0.3 + Math.sin(time * 2) * 0.2;
  }

  if (animatables.scanningBeam) {
    if (phase === 'SENSOR_CALIBRATE' || phase === 'DIAGNOSTIC_TEST') {
      animatables.scanningBeam.visible = true;
      animatables.scanningBeam.rotation.y = time * 3;
      animatables.scanningBeam.scale.setScalar(1 + Math.sin(time * 5) * 0.2);
    } else {
      animatables.scanningBeam.visible = false;
    }
  }

  if (animatables.truckBody) {
    if (phase === 'AUTONOMOUS_OPS') {
      animatables.truckBody.position.y = Math.sin(time * 10) * 0.02;
    } else if (phase === 'REMOTE_TAKEOVER') {
      animatables.truckBody.rotation.y = Math.sin(time * 0.5) * 0.1;
    }
  }
};
