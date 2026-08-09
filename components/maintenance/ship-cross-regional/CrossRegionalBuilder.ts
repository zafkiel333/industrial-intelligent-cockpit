import * as THREE from 'three';
import { CrossRegionalAnimatables, CollabStep } from './three-types';

export const initCollabScene = (
  group: THREE.Group, 
  animatables: CrossRegionalAnimatables,
  disposables: { dispose: () => void }[]
) => {
  // --- 材质库 ---
  const shipMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.8, roughness: 0.2 });
  const beamMat = new THREE.MeshBasicMaterial({ color: 0x0ea5e9, transparent: true, opacity: 0.4, side: THREE.DoubleSide });
  const pulseMat = new THREE.MeshBasicMaterial({ color: 0x22d3ee, transparent: true, opacity: 0.2 });
  const globeMat = new THREE.MeshBasicMaterial({ color: 0x1e3a8a, wireframe: true, transparent: true, opacity: 0.1 });

  disposables.push(shipMat, beamMat, pulseMat, globeMat);

  // 1. 船舶模型
  const shipGroup = new THREE.Group();
  group.add(shipGroup);
  animatables.shipModel = shipGroup;

  const hullGeo = new THREE.BoxGeometry(3, 2, 10);
  const hull = new THREE.Mesh(hullGeo, shipMat);
  shipGroup.add(hull);

  const bridgeGeo = new THREE.BoxGeometry(2.5, 2, 2);
  const bridge = new THREE.Mesh(bridgeGeo, new THREE.MeshStandardMaterial({color: 0xffffff}));
  bridge.position.set(0, 1.5, -2);
  shipGroup.add(bridge);

  const mastGeo = new THREE.CylinderGeometry(0.1, 0.1, 4);
  const mast = new THREE.Mesh(mastGeo, shipMat);
  mast.position.set(0, 2.5, -2);
  shipGroup.add(mast);

  // 2. 地球背景线框
  const globeGeo = new THREE.SphereGeometry(25, 32, 32);
  const globe = new THREE.Mesh(globeGeo, globeMat);
  group.add(globe);
  animatables.globeWireframe = globe;

  // 3. 卫星链路光束
  const beamGroup = new THREE.Group();
  group.add(beamGroup);
  animatables.expertBeams = beamGroup;

  const beamGeo = new THREE.CylinderGeometry(0.05, 0.5, 30, 8, 1, true);
  beamGeo.translate(0, 15, 0);
  
  const centers = [
      { pos: new THREE.Vector3(15, 10, -10), color: 0x0ea5e9 },
      { pos: new THREE.Vector3(-15, 12, -5), color: 0xf59e0b },
      { pos: new THREE.Vector3(5, 8, 15), color: 0x10b981 }
  ];

  centers.forEach(c => {
      const b = new THREE.Mesh(beamGeo, new THREE.MeshBasicMaterial({color: c.color, transparent: true, opacity: 0}));
      b.lookAt(c.pos);
      b.rotateX(Math.PI/2);
      beamGroup.add(b);
  });

  // 4. 数据环
  const rings = new THREE.Group();
  for(let i=0; i<3; i++) {
      const ringGeo = new THREE.TorusGeometry(5 + i*1.5, 0.02, 16, 100);
      ringGeo.rotateX(Math.PI/2);
      const ring = new THREE.Mesh(ringGeo, pulseMat);
      rings.add(ring);
  }
  group.add(rings);
  animatables.dataRings = rings;

  // 5. 信号脉冲
  const pulseGeo = new THREE.SphereGeometry(1, 32, 32);
  const pulse = new THREE.Mesh(pulseGeo, pulseMat);
  group.add(pulse);
  animatables.signalPulse = pulse;

  const grid = new THREE.GridHelper(60, 30, 0x1e293b, 0x0f172a);
  grid.position.y = -2;
  group.add(grid);
};

export const animateCollabScene = (
  animatables: CrossRegionalAnimatables, 
  step: CollabStep,
  time: number
) => {
  if (animatables.shipModel) {
      animatables.shipModel.position.y = Math.sin(time) * 0.2;
      animatables.shipModel.rotation.z = Math.sin(time * 0.5) * 0.02;
  }

  if (animatables.globeWireframe) {
      animatables.globeWireframe.rotation.y += 0.001;
  }

  if (animatables.expertBeams) {
      animatables.expertBeams.children.forEach((beam, i) => {
          const mat = (beam as THREE.Mesh).material as THREE.MeshBasicMaterial;
          if (step === 'SAT_LINK') {
              mat.opacity = THREE.MathUtils.lerp(mat.opacity, 0.4, 0.05);
          } else if (['DATA_SYNC', 'MULTI_EXPERT', 'REMOTE_OPS'].includes(step)) {
              mat.opacity = 0.3 + Math.sin(time * 5 + i) * 0.1;
          } else {
              mat.opacity = THREE.MathUtils.lerp(mat.opacity, 0, 0.05);
          }
      });
  }

  if (animatables.dataRings) {
      animatables.dataRings.children.forEach((ring, i) => {
          ring.rotation.y += (i + 1) * 0.01;
          ring.rotation.z += (i + 1) * 0.005;
          ring.scale.setScalar(1 + Math.sin(time * 2 + i) * 0.05);
      });
      animatables.dataRings.visible = step !== 'SAT_LINK';
  }

  if (animatables.signalPulse) {
      const pScale = (time * 5) % 20;
      animatables.signalPulse.scale.setScalar(pScale);
      (animatables.signalPulse.material as THREE.MeshBasicMaterial).opacity = Math.max(0, 0.5 - pScale/20);
      animatables.signalPulse.visible = step === 'SAT_LINK' || step === 'DATA_SYNC';
  }
};
