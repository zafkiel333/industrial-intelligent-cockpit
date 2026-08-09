
import * as THREE from 'three';
import { SequenceAnimatables, SequencePhase } from './three-types';

export const initSequenceScene = (
  group: THREE.Group, 
  animatables: SequenceAnimatables,
  disposables: { dispose: () => void }[]
) => {
  // --- Materials ---
  const metalMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.3, metalness: 0.8 });
  const copperMat = new THREE.MeshStandardMaterial({ color: 0xb45309, metalness: 0.9, roughness: 0.3 });
  const safetyYellow = new THREE.MeshStandardMaterial({ color: 0xfacc15, roughness: 0.4 });
  const hologramMat = new THREE.MeshBasicMaterial({ color: 0x22d3ee, transparent: true, opacity: 0.2, wireframe: true });
  const glassMat = new THREE.MeshPhysicalMaterial({ color: 0x0ea5e9, transparent: true, opacity: 0.1, transmission: 0.9 });

  disposables.push(metalMat, copperMat, safetyYellow, hologramMat, glassMat);

  // 1. 发电机组基座 (Simplified Stator Area)
  const baseGroup = new THREE.Group();
  const statorGeo = new THREE.CylinderGeometry(5, 5.5, 4, 32, 1, true);
  const stator = new THREE.Mesh(statorGeo, glassMat);
  baseGroup.add(stator);
  group.add(baseGroup);
  animatables.mainAssembly = baseGroup;

  // 2. 备件存放区 (Storage Area)
  const storageArea = new THREE.Mesh(new THREE.PlaneGeometry(8, 8), new THREE.MeshBasicMaterial({color: 0x1e293b, transparent: true, opacity: 0.5}));
  storageArea.rotation.x = -Math.PI/2;
  storageArea.position.set(-15, -1.9, 0);
  group.add(storageArea);

  // 3. 目标备件：推力轴承瓦 (Thrust Pad)
  const padGroup = new THREE.Group();
  const padGeo = new THREE.BoxGeometry(2, 0.5, 2.5);
  const pad = new THREE.Mesh(padGeo, copperMat);
  padGroup.add(pad);
  
  // 备件上的吊环
  const ringGeo = new THREE.TorusGeometry(0.2, 0.05);
  const ring = new THREE.Mesh(ringGeo, metalMat);
  ring.position.y = 0.3;
  padGroup.add(ring);
  
  padGroup.position.set(-15, -1.5, 0); // 初始在存放区
  group.add(padGroup);
  animatables.sparePart = padGroup;

  // 4. 厂房行车 (Overhead Crane)
  const craneGroup = new THREE.Group();
  const girderGeo = new THREE.BoxGeometry(40, 0.8, 1.5);
  const girder = new THREE.Mesh(girderGeo, safetyYellow);
  girder.position.y = 12;
  craneGroup.add(girder);

  const trolleyGroup = new THREE.Group();
  trolleyGroup.position.y = 11.5;
  const trolley = new THREE.Mesh(new THREE.BoxGeometry(3, 1, 3), safetyYellow);
  trolleyGroup.add(trolley);
  
  const cableGeo = new THREE.CylinderGeometry(0.02, 0.02, 10);
  cableGeo.translate(0, -5, 0);
  const cable = new THREE.Mesh(cableGeo, new THREE.MeshBasicMaterial({color: 0x111111}));
  trolleyGroup.add(cable);

  const hook = new THREE.Mesh(new THREE.TorusGeometry(0.3, 0.1, 8, 16, Math.PI), safetyYellow);
  hook.position.y = -10;
  hook.rotation.z = Math.PI/2;
  trolleyGroup.add(hook);

  craneGroup.add(trolleyGroup);
  group.add(craneGroup);
  animatables.overheadCrane = craneGroup;

  // 5. 目标安装位点 全息幻影
  const targetGhost = new THREE.Mesh(padGeo, hologramMat);
  targetGhost.position.set(0, 1.5, 3.5); // 假设安装在主轴旁的 3.5 偏移处
  group.add(targetGhost);
  animatables.targetSlot = targetGhost;

  // 6. 吊运引导线
  const pathPoints = [
      new THREE.Vector3(-15, 11.5, 0),
      new THREE.Vector3(0, 11.5, 0),
      new THREE.Vector3(0, 11.5, 3.5)
  ];
  const pathLineGeo = new THREE.BufferGeometry().setFromPoints(pathPoints);
  const pathLine = new THREE.Line(pathLineGeo, new THREE.LineBasicMaterial({color: 0x22d3ee, transparent: true, opacity: 0.3}));
  group.add(pathLine);
  animatables.pathGuide = pathLine;

  // 环境网格
  const grid = new THREE.GridHelper(60, 30, 0x1e293b, 0x0f172a);
  grid.position.y = -2;
  group.add(grid);
};

export const animateSequence = (
  animatables: SequenceAnimatables, 
  phase: SequencePhase,
  time: number
) => {
  if (!animatables.overheadCrane || !animatables.sparePart) return;

  const crane = animatables.overheadCrane;
  const trolley = crane.children[1] as THREE.Group;
  const hook = trolley.children[2] as THREE.Mesh;
  const cable = trolley.children[1] as THREE.Mesh;
  const part = animatables.sparePart;

  const t = Math.sin(time * 0.5) * 0.5 + 0.5; // 0-1 循环进度

  switch (phase) {
    case 'LOGISTICS':
      // 备件在地面微弱呼吸
      part.position.set(-15, -1.5, 0);
      part.scale.setScalar(1 + Math.sin(time * 2) * 0.02);
      crane.position.x = THREE.MathUtils.lerp(crane.position.x, -15, 0.05);
      break;

    case 'CRANE_PICKUP':
      // 行车对准并下降
      crane.position.x = -15;
      trolley.position.z = 0;
      const hookY = -10 + t * 6.5; // 下降
      hook.position.y = hookY;
      cable.scale.y = Math.abs(hookY) / 10;
      cable.position.y = hookY / 2;
      break;

    case 'AIR_TRANSPORT':
      // 空间移动
      const moveX = THREE.MathUtils.lerp(-15, 0, t);
      const moveZ = THREE.MathUtils.lerp(0, 3.5, t);
      crane.position.x = moveX;
      trolley.position.z = moveZ;
      part.position.set(moveX, 8, moveZ);
      hook.position.y = -3.5;
      cable.scale.y = 0.35;
      break;

    case 'ALIGNMENT':
      // 精确对位：全息闪烁
      if (animatables.targetSlot) animatables.targetSlot.visible = true;
      part.position.set(0, 2 + Math.sin(time * 10) * 0.05, 3.5);
      part.rotation.y = Math.sin(time * 2) * 0.1;
      break;

    case 'COMMISSIONING':
      // 模拟试运行旋转
      if (animatables.mainAssembly) animatables.mainAssembly.rotation.y += 0.05;
      part.position.set(0, 1.5, 3.5);
      part.rotation.y += 0.05;
      break;
  }
};
