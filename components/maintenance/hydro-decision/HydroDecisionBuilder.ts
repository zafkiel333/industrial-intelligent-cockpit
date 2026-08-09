
import * as THREE from 'three';
import { DecisionAnimatables, DecisionStep } from './three-types';

export const initDecisionScene = (
  group: THREE.Group, 
  animatables: DecisionAnimatables,
  disposables: { dispose: () => void }[]
) => {
  // --- 材质库 ---
  const glassMat = new THREE.MeshPhysicalMaterial({ 
    color: 0x0ea5e9, 
    transparent: true, 
    opacity: 0.15, 
    roughness: 0.1, 
    metalness: 0.1,
    transmission: 0.9,
    side: THREE.DoubleSide
  });
  const metalMat = new THREE.MeshStandardMaterial({ color: 0x64748b, roughness: 0.3, metalness: 0.8 });
  const copperMat = new THREE.MeshStandardMaterial({ color: 0xb45309, metalness: 0.9 });
  const faultMat = new THREE.MeshBasicMaterial({ color: 0xef4444, transparent: true, opacity: 0.8 });
  
  disposables.push(glassMat, metalMat, copperMat, faultMat);

  // 1. 定子外壳（X射线透视效果）
  const statorGeo = new THREE.CylinderGeometry(4, 4, 6, 32, 1, true);
  const stator = new THREE.Mesh(statorGeo, glassMat);
  group.add(stator);
  animatables.statorShell = stator;

  // 2. 主轴
  const shaftGeo = new THREE.CylinderGeometry(0.6, 0.6, 10, 32);
  const shaft = new THREE.Mesh(shaftGeo, metalMat);
  group.add(shaft);
  animatables.mainShaft = shaft;

  // 3. 转轮组
  const runnerGroup = new THREE.Group();
  runnerGroup.position.y = -3;
  const runnerHub = new THREE.Mesh(new THREE.SphereGeometry(1.2), metalMat);
  runnerGroup.add(runnerHub);
  
  // 叶片
  const bladeGeo = new THREE.BoxGeometry(2.5, 0.1, 1.2);
  bladeGeo.translate(1.5, 0, 0);
  for(let i=0; i<6; i++) {
      const blade = new THREE.Mesh(bladeGeo, metalMat);
      blade.rotation.y = (i / 6) * Math.PI * 2;
      blade.rotation.z = 0.3; // 倾角
      runnerGroup.add(blade);
  }
  group.add(runnerGroup);
  animatables.runnerGroup = runnerGroup;

  // 4. 故障热点（初始隐藏）
  const faultGroup = new THREE.Group();
  const ringGeo = new THREE.TorusGeometry(1.5, 0.05, 16, 32);
  const ring = new THREE.Mesh(ringGeo, faultMat);
  ring.rotation.x = Math.PI / 2;
  faultGroup.add(ring);
  
  const light = new THREE.PointLight(0xef4444, 5, 10);
  faultGroup.add(light);
  
  faultGroup.position.y = 1.5; // 假设故障在导轴承处
  faultGroup.visible = false;
  group.add(faultGroup);
  animatables.faultHotspot = faultGroup;

  // 5. 传感器节点
  const sensorGroup = new THREE.Group();
  const sensorGeo = new THREE.BoxGeometry(0.2, 0.2, 0.2);
  const sensorMat = new THREE.MeshBasicMaterial({ color: 0x22d3ee });
  const points = [[0,2,4], [0,-2,4], [4,0,0], [-4,0,0]];
  points.forEach(p => {
      const s = new THREE.Mesh(sensorGeo, sensorMat);
      s.position.set(p[0], p[1], p[2]);
      sensorGroup.add(s);
  });
  group.add(sensorGroup);
  animatables.sensorNodes = sensorGroup;

  // 辅助地面
  const grid = new THREE.GridHelper(30, 20, 0x1e293b, 0x0f172a);
  grid.position.y = -5;
  group.add(grid);
};

export const animateDecisionScene = (
  animatables: DecisionAnimatables, 
  step: DecisionStep,
  time: number
) => {
  const isRunning = step === 'NORMAL' || step === 'ABNORMAL' || step === 'SIMULATING';
  const rotationSpeed = isRunning ? (step === 'ABNORMAL' ? 0.3 : 0.6) : 0;

  if (animatables.mainShaft) animatables.mainShaft.rotation.y += rotationSpeed * 0.1;
  if (animatables.runnerGroup) animatables.runnerGroup.rotation.y += rotationSpeed * 0.1;

  // 故障表现
  if (step === 'ABNORMAL' || step === 'DIAGNOSING') {
      if (animatables.faultHotspot) {
          animatables.faultHotspot.visible = true;
          animatables.faultHotspot.scale.setScalar(1 + Math.sin(time * 8) * 0.1);
      }
      // 异常抖动
      if (animatables.mainShaft) {
          animatables.mainShaft.position.x = Math.sin(time * 50) * 0.05;
      }
  } else {
      if (animatables.faultHotspot) animatables.faultHotspot.visible = false;
      if (animatables.mainShaft) animatables.mainShaft.position.x = 0;
  }

  // 诊断扫描动画
  if (step === 'DIAGNOSING' && animatables.sensorNodes) {
      animatables.sensorNodes.children.forEach((s, i) => {
          s.scale.setScalar(1 + Math.sin(time * 10 + i) * 0.5);
      });
  }
};
