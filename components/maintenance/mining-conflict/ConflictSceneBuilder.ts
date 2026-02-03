
import * as THREE from 'three';
import { ConflictAnimatables, ConflictState } from './three-types';

export const initConflictScene = (
  group: THREE.Group, 
  animatables: ConflictAnimatables,
  disposables: { dispose: () => void }[]
) => {
  // --- 材质定义 ---
  const metalMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.2, metalness: 0.8 });
  const mechMat = new THREE.MeshBasicMaterial({ color: 0xf59e0b, transparent: true, opacity: 0.2, wireframe: true });
  const elecMat = new THREE.MeshBasicMaterial({ color: 0x3b82f6, transparent: true, opacity: 0.2, wireframe: true });
  const conflictMat = new THREE.MeshBasicMaterial({ color: 0xef4444, transparent: true, opacity: 0.5 });
  const beamMat = new THREE.MeshBasicMaterial({ color: 0x22d3ee, transparent: true, opacity: 0.3 });

  disposables.push(metalMat, mechMat, elecMat, conflictMat, beamMat);

  // 1. 大型设备主体 (Primary Crusher/Conveyor Hub)
  const machine = new THREE.Group();
  const body = new THREE.Mesh(new THREE.BoxGeometry(10, 4, 6), metalMat);
  body.position.y = 2;
  machine.add(body);
  
  const cylinder = new THREE.Mesh(new THREE.CylinderGeometry(2, 2, 8, 32), metalMat);
  cylinder.rotateZ(Math.PI/2);
  cylinder.position.y = 4.5;
  machine.add(cylinder);

  group.add(machine);
  animatables.mainMachine = machine;

  // 2. 作业空间包络 (Spatial Envelopes)
  animatables.workZones = [];
  
  const zoneGeo = new THREE.SphereGeometry(3, 16, 16);
  disposables.push(zoneGeo);

  // Team A - Mechanical
  const zoneA = new THREE.Group();
  zoneA.position.set(-3, 4.5, 0);
  const meshA = new THREE.Mesh(zoneGeo, mechMat);
  zoneA.add(meshA);
  group.add(zoneA);
  animatables.workZones.push(zoneA);

  // Team B - Electrical
  const zoneB = new THREE.Group();
  zoneB.position.set(3, 4.5, 0);
  const meshB = new THREE.Mesh(zoneGeo, elecMat);
  zoneB.add(meshB);
  group.add(zoneB);
  animatables.workZones.push(zoneB);

  // 3. 冲突环特效
  const ringGroup = new THREE.Group();
  const ringGeo = new THREE.TorusGeometry(1.5, 0.05, 16, 100);
  const ring = new THREE.Mesh(ringGeo, conflictMat);
  ring.rotation.x = Math.PI/2;
  ringGroup.add(ring);
  ringGroup.position.set(0, 4.5, 0);
  ringGroup.visible = false;
  group.add(ringGroup);
  animatables.interferenceRings = ringGroup;

  // 4. 扫描平面
  const scanPlane = new THREE.Mesh(new THREE.PlaneGeometry(20, 10), beamMat);
  scanPlane.rotation.x = -Math.PI / 2;
  scanPlane.position.y = 1;
  scanPlane.visible = false;
  group.add(scanPlane);
  (animatables as any).scanPlane = scanPlane;

  // 5. 地板网格
  const grid = new THREE.GridHelper(40, 20, 0x1e293b, 0x0f172a);
  grid.position.y = 0;
  group.add(grid);
};

export const animateConflictScene = (
  animatables: ConflictAnimatables, 
  state: ConflictState,
  time: number
) => {
  // 1. 扫描动画 - 支持 ANALYZING 和 SCANNING 两种状态名
  const scanPlane = (animatables as any).scanPlane as THREE.Mesh;
  if (state === 'ANALYZING' || state === 'SCANNING') {
      scanPlane.visible = true;
      scanPlane.position.z = Math.sin(time * 2) * 10;
  } else {
      scanPlane.visible = false;
  }

  // 2. 冲突表现 - 支持 CONFLICT_FOUND 和 DETECTED 两种状态名
  if (state === 'CONFLICT_FOUND' || state === 'DETECTED') {
      // 两个区域向中间靠拢产生干涉
      if (animatables.workZones) {
          animatables.workZones[0].position.x = -1.5 + Math.sin(time * 5) * 0.1;
          animatables.workZones[1].position.x = 1.5 + Math.cos(time * 5) * 0.1;
      }
      if (animatables.interferenceRings) {
          animatables.interferenceRings.visible = true;
          animatables.interferenceRings.scale.setScalar(1 + Math.sin(time * 10) * 0.2);
          (animatables.interferenceRings.children[0] as THREE.Mesh).material.opacity = 0.5 + Math.sin(time * 15) * 0.3;
      }
  } 
  
  // 3. 消解动画 (平滑分开) - 支持 RESOLVING/OPTIMIZED 以及 RECALCULATING/RESOLVED
  if (state === 'RESOLVING' || state === 'OPTIMIZED' || state === 'RECALCULATING' || state === 'RESOLVED') {
      if (animatables.workZones) {
          animatables.workZones[0].position.x = THREE.MathUtils.lerp(animatables.workZones[0].position.x, -5, 0.05);
          animatables.workZones[1].position.x = THREE.MathUtils.lerp(animatables.workZones[1].position.x, 5, 0.05);
      }
      if (animatables.interferenceRings) {
          animatables.interferenceRings.visible = false;
      }
  }

  // 4. 执行模拟
  if (state === 'SIMULATING') {
      if (animatables.mainMachine) {
          animatables.mainMachine.rotation.y += 0.01;
      }
  }
};
