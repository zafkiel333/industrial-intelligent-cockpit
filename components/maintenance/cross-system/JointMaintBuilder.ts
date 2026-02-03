
import * as THREE from 'three';
import { JointAnimatables, JointScenario } from './three-types';

export const initJointScene = (
  group: THREE.Group, 
  animatables: JointAnimatables,
  disposables: { dispose: () => void }[]
) => {
  // --- 材质定义 ---
  const metalMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.2, metalness: 0.8 });
  const glowBlue = new THREE.MeshBasicMaterial({ color: 0x0ea5e9, transparent: true, opacity: 0.4, wireframe: true });
  const glowAmber = new THREE.MeshBasicMaterial({ color: 0xf59e0b, transparent: true, opacity: 0.4, wireframe: true });
  const coreMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.1, metalness: 1.0 });
  const streamMat = new THREE.LineBasicMaterial({ color: 0x22d3ee, transparent: true, opacity: 0.3 });

  disposables.push(metalMat, glowBlue, glowAmber, coreMat, streamMat);

  // 1. 核心设备群组
  const mainAssembly = new THREE.Group();
  group.add(mainAssembly);
  animatables.mainAssembly = mainAssembly;

  // 模拟大型跨系统设备 (例如联合原动机组)
  // 系统 A: 动力发生单元
  const sysA = new THREE.Group();
  sysA.position.set(-6, 0, 0);
  const sysAGeo = new THREE.CylinderGeometry(2, 2.5, 4, 32);
  const sysAMesh = new THREE.Mesh(sysAGeo, metalMat);
  sysA.add(sysAMesh);
  mainAssembly.add(sysA);
  animatables.systemA_Node = sysA;

  // 系统 B: 调控中心单元
  const sysB = new THREE.Group();
  sysB.position.set(0, 2, 0);
  const sysBGeo = new THREE.BoxGeometry(3, 4, 3);
  const sysBMesh = new THREE.Mesh(sysBGeo, metalMat);
  sysB.add(sysBMesh);
  const hBox = new THREE.Mesh(sysBGeo, glowBlue);
  hBox.scale.setScalar(1.1);
  sysB.add(hBox);
  mainAssembly.add(sysB);
  animatables.systemB_Node = sysB;

  // 系统 C: 负载/执行单元
  const sysC = new THREE.Group();
  sysC.position.set(6, 0, 0);
  const sysCGeo = new THREE.BoxGeometry(4, 3, 5);
  const sysCMesh = new THREE.Mesh(sysCGeo, metalMat);
  sysC.add(sysCMesh);
  mainAssembly.add(sysC);
  animatables.systemC_Node = sysC;

  // 2. 跨系统数据连线 (Logic Flow)
  animatables.dataFlowLines = [];
  const createLink = (start: THREE.Vector3, end: THREE.Vector3) => {
      const curve = new THREE.QuadraticBezierCurve3(
          start,
          new THREE.Vector3((start.x + end.x)/2, 5, (start.z + end.z)/2),
          end
      );
      const points = curve.getPoints(50);
      const geo = new THREE.BufferGeometry().setFromPoints(points);
      const line = new THREE.Line(geo, streamMat);
      group.add(line);
      animatables.dataFlowLines?.push(line);
  };

  createLink(new THREE.Vector3(-6, 2, 0), new THREE.Vector3(0, 4, 0));
  createLink(new THREE.Vector3(0, 4, 0), new THREE.Vector3(6, 2, 0));

  // 3. 逻辑耦合粒子 (Data Particles)
  const pCount = 300;
  const pGeo = new THREE.BufferGeometry();
  const pPos = new Float32Array(pCount * 3);
  for(let i=0; i<pCount; i++) {
      pPos[i*3] = (Math.random()-0.5) * 20;
      pPos[i*3+1] = Math.random() * 5;
      pPos[i*3+2] = (Math.random()-0.5) * 10;
  }
  pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
  const pMat = new THREE.PointsMaterial({ color: 0x0ea5e9, size: 0.1, transparent: true, opacity: 0.5 });
  const points = new THREE.Points(pGeo, pMat);
  group.add(points);
  animatables.logicLinkParticles = points;

  // 4. 扫描场
  const scanGeo = new THREE.PlaneGeometry(30, 20);
  const scanMesh = new THREE.Mesh(scanGeo, new THREE.MeshBasicMaterial({ color: 0x0ea5e9, transparent: true, opacity: 0.1, side: THREE.DoubleSide }));
  scanMesh.rotation.x = -Math.PI / 2;
  scanMesh.position.y = 0.1;
  group.add(scanMesh);
  animatables.scanningField = scanMesh;

  // 环境网格
  const grid = new THREE.GridHelper(60, 30, 0x1e293b, 0x0f172a);
  grid.position.y = -2;
  group.add(grid);
};

export const animateJointScene = (
  animatables: JointAnimatables, 
  scenario: JointScenario,
  time: number
) => {
  if (animatables.mainAssembly) {
      animatables.mainAssembly.position.y = Math.sin(time) * 0.1;
  }

  // 1. 系统节点动态
  if (animatables.systemA_Node) animatables.systemA_Node.rotation.y += 0.02;
  if (animatables.systemB_Node) {
      animatables.systemB_Node.scale.setScalar(1 + Math.sin(time * 2) * 0.02);
  }
  
  // 2. 数据流粒子运动
  if (animatables.logicLinkParticles) {
      animatables.logicLinkParticles.rotation.y += 0.005;
      const pos = animatables.logicLinkParticles.geometry.attributes.position.array as Float32Array;
      for(let i=0; i<pos.length; i+=3) {
          pos[i+1] += Math.sin(time + i) * 0.01;
      }
      animatables.logicLinkParticles.geometry.attributes.position.needsUpdate = true;
  }

  // 3. 场景特定动画
  if (scenario === 'POWER_SYNC') {
      if (animatables.scanningField) {
          animatables.scanningField.visible = true;
          animatables.scanningField.position.x = Math.sin(time * 2) * 5;
      }
  } else {
      if (animatables.scanningField) animatables.scanningField.visible = false;
  }
};
