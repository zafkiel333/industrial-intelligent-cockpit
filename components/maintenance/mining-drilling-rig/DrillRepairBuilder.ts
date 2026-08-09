
import * as THREE from 'three';
import { DrillRepairAnimatables, DrillRepairPhase } from './three-types';

export const initDrillRepairScene = (
  group: THREE.Group, 
  animatables: DrillRepairAnimatables,
  disposables: { dispose: () => void }[]
) => {
  // --- 工业级材质库 ---
  const metalMat = new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.2, metalness: 0.8 });
  const yellowMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.4, metalness: 0.4 }); // 工程黄
  const chromeMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.1, metalness: 1.0 });
  const laserMat = new THREE.MeshBasicMaterial({ color: 0x22d3ee, transparent: true, opacity: 0.4, side: THREE.DoubleSide });
  const hoseMat = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.8 });

  disposables.push(metalMat, yellowMat, chromeMat, laserMat, hoseMat);

  // 1. 动力站基座 (Power Pack Base)
  const baseGeo = new THREE.BoxGeometry(8, 0.6, 6);
  disposables.push(baseGeo);
  const base = new THREE.Mesh(baseGeo, metalMat);
  base.position.y = -0.3;
  group.add(base);

  // 2. 主液压泵组 (Main Pump Unit)
  const pumpGroup = new THREE.Group();
  pumpGroup.position.set(-1.5, 0.8, 0);
  const pumpGeo = new THREE.CylinderGeometry(0.8, 0.8, 2.5, 32);
  pumpGeo.rotateZ(Math.PI / 2);
  disposables.push(pumpGeo);
  const pump = new THREE.Mesh(pumpGeo, metalMat);
  pumpGroup.add(pump);
  
  // 电机部分
  const motorGeo = new THREE.BoxGeometry(2, 2, 2.2);
  const motor = new THREE.Mesh(motorGeo, yellowMat);
  motor.position.x = -2.2;
  pumpGroup.add(motor);
  
  group.add(pumpGroup);
  animatables.mainPump = pump;

  // 3. 比例阀控制组 (Valve Block)
  const valveGroup = new THREE.Group();
  valveGroup.position.set(1.5, 0.5, 1.5);
  const blockGeo = new THREE.BoxGeometry(1.5, 1.2, 2);
  disposables.push(blockGeo);
  const block = new THREE.Mesh(blockGeo, metalMat);
  valveGroup.add(block);
  
  // 电磁阀芯
  const solenoidGeo = new THREE.CylinderGeometry(0.15, 0.15, 0.6);
  for(let i=0; i<4; i++) {
    const sol = new THREE.Mesh(solenoidGeo, chromeMat);
    sol.position.set(-0.4 + i*0.25, 0.8, -0.4 + i*0.2);
    valveGroup.add(sol);
  }
  group.add(valveGroup);
  animatables.controlValves = valveGroup;

  // 4. 回转动力头 (Rotation Head Context) - 远景背景
  const rhGroup = new THREE.Group();
  rhGroup.position.set(5, 2, -3);
  const rhBodyGeo = new THREE.BoxGeometry(2, 3, 2);
  const rhBody = new THREE.Mesh(rhBodyGeo, yellowMat);
  rhGroup.add(rhBody);
  
  const bitGeo = new THREE.CylinderGeometry(0.4, 0.5, 4, 16);
  disposables.push(bitGeo);
  const bit = new THREE.Mesh(bitGeo, chromeMat);
  bit.position.y = -3;
  rhGroup.add(bit);
  group.add(rhGroup);
  animatables.rotationHead = rhGroup;

  // 5. 液压软管 (Hydraulic Hoses)
  animatables.hydraulicHoses = [];
  const points = [
    new THREE.Vector3(-1, 1, 0.5),
    new THREE.Vector3(1, 1, 1.5)
  ];
  const curve = new THREE.QuadraticBezierCurve3(points[0], new THREE.Vector3(0, 3, 1), points[1]);
  const tubeGeo = new THREE.TubeGeometry(curve, 20, 0.1, 8, false);
  disposables.push(tubeGeo);
  const hose = new THREE.Line(tubeGeo, hoseMat as any);
  group.add(hose);

  // 6. 故障诊断扫描平面
  const scanGeo = new THREE.PlaneGeometry(6, 4);
  disposables.push(scanGeo);
  const scanPlane = new THREE.Mesh(scanGeo, laserMat);
  scanPlane.rotation.x = -Math.PI / 2;
  scanPlane.position.y = 2;
  scanPlane.visible = false;
  group.add(scanPlane);
  animatables.scanningPlane = scanPlane;

  // 7. 漏油粒子效果
  const leakPCount = 200;
  const leakGeo = new THREE.BufferGeometry();
  const leakPos = new Float32Array(leakPCount * 3);
  leakGeo.setAttribute('position', new THREE.BufferAttribute(leakPos, 3));
  const leakMat = new THREE.PointsMaterial({ color: 0x422006, size: 0.1, transparent: true });
  disposables.push(leakMat);
  const leakPoints = new THREE.Points(leakGeo, leakMat);
  leakPoints.position.set(1.5, 1.2, 1.5); // 阀组上方
  leakPoints.visible = false;
  group.add(leakPoints);
  animatables.leakEffect = leakPoints;
};

export const animateDrillRepair = (
  animatables: DrillRepairAnimatables, 
  phase: DrillRepairPhase,
  time: number
) => {
  // 1. 常规旋转动画
  if (phase === 'INITIAL_SCAN' || phase === 'SYSTEM_TEST') {
      if (animatables.mainPump) animatables.mainPump.rotation.x += 0.2;
      if (animatables.rotationHead) animatables.rotationHead.rotation.y += 0.05;
  }

  // 2. 扫描阶段动画
  if (phase === 'INITIAL_SCAN') {
      if (animatables.scanningPlane) {
          animatables.scanningPlane.visible = true;
          animatables.scanningPlane.position.z = Math.sin(time * 2) * 3;
      }
  } else {
      if (animatables.scanningPlane) animatables.scanningPlane.visible = false;
  }

  // 3. 故障阶段 - 漏油模拟
  if (phase === 'PRESSURE_RELEASE') {
      if (animatables.leakEffect) {
          animatables.leakEffect.visible = true;
          const pos = animatables.leakEffect.geometry.attributes.position.array as Float32Array;
          for(let i=0; i<pos.length/3; i++) {
              pos[i*3] += (Math.random()-0.5)*0.1;
              pos[i*3+1] -= 0.05;
              pos[i*3+2] += (Math.random()-0.5)*0.1;
              if (pos[i*3+1] < -1.5) { pos[i*3]=0; pos[i*3+1]=0; pos[i*3+2]=0; }
          }
          animatables.leakEffect.geometry.attributes.position.needsUpdate = true;
      }
  } else if (animatables.leakEffect) {
      animatables.leakEffect.visible = false;
  }

  // 4. 拆卸阶段 - 阀组升起
  if (phase === 'VALVE_REMOVAL') {
      if (animatables.controlValves) {
          animatables.controlValves.position.y = 0.5 + Math.abs(Math.sin(time)) * 1.5;
          animatables.controlValves.rotation.y += 0.02;
      }
  } else if (phase === 'CORE_REPAIR') {
      if (animatables.controlValves) animatables.controlValves.position.y = 0.5;
  }
};
