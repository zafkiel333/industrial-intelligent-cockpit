
import * as THREE from 'three';
import { StationAnimatables, AnnualSimState } from './three-types';

export const initStationScene = (
  group: THREE.Group, 
  animatables: StationAnimatables,
  disposables: { dispose: () => void }[]
) => {
  // --- 材质库 ---
  const concreteMat = new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.8 });
  const waterMat = new THREE.MeshPhysicalMaterial({ color: 0x0ea5e9, transparent: true, opacity: 0.6, transmission: 0.5 });
  const unitMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.3, metalness: 0.8 });
  const maintMat = new THREE.MeshBasicMaterial({ color: 0xfacc15, wireframe: true, transparent: true, opacity: 0.3 });
  
  disposables.push(concreteMat, waterMat, unitMat, maintMat);

  // 1. 厂房基座
  const floorGeo = new THREE.BoxGeometry(30, 2, 10);
  disposables.push(floorGeo);
  const floor = new THREE.Mesh(floorGeo, concreteMat);
  floor.position.y = -1;
  group.add(floor);

  // 2. 四台机组 (G1-G4)
  animatables.units = [];
  animatables.scaffolds = [];
  const unitGeo = new THREE.CylinderGeometry(2, 2, 3, 32);
  disposables.push(unitGeo);

  for(let i=0; i<4; i++) {
      const uGroup = new THREE.Group();
      uGroup.position.set(-10.5 + i * 7, 1.5, 0);
      
      const mesh = new THREE.Mesh(unitGeo, unitMat);
      uGroup.add(mesh);
      
      // 装饰环
      const ring = new THREE.Mesh(new THREE.TorusGeometry(2.1, 0.05), new THREE.MeshBasicMaterial({color: 0x06b6d4}));
      ring.rotation.x = Math.PI/2;
      ring.position.y = 1.4;
      uGroup.add(ring);

      // 检修脚手架标识 (平时隐藏)
      const scaffoldGeo = new THREE.BoxGeometry(4.5, 5, 4.5);
      const scaffold = new THREE.Mesh(scaffoldGeo, maintMat);
      scaffold.position.y = 1;
      scaffold.visible = false;
      uGroup.add(scaffold);
      animatables.scaffolds.push(scaffold as unknown as THREE.Group);

      group.add(uGroup);
      animatables.units.push(uGroup);
  }

  // 3. 桥机 (Overhead Crane)
  const craneGroup = new THREE.Group();
  const beamGeo = new THREE.BoxGeometry(30, 0.5, 1);
  const beam = new THREE.Mesh(beamGeo, new THREE.MeshStandardMaterial({color: 0xf59e0b}));
  beam.position.y = 8;
  craneGroup.add(beam);
  group.add(craneGroup);
  animatables.overheadCrane = craneGroup;

  // 4. 水位模拟 (远景)
  const lakeGeo = new THREE.BoxGeometry(30, 5, 10);
  lakeGeo.translate(0, 0, -10);
  const lake = new THREE.Mesh(lakeGeo, waterMat);
  group.add(lake);
  animatables.damWater = lake;

  // 辅助地坪
  const grid = new THREE.GridHelper(50, 20, 0x1e293b, 0x0f172a);
  grid.position.y = 0.01;
  group.add(grid);
};

export const animateStationScene = (
  animatables: StationAnimatables, 
  state: AnnualSimState,
  time: number
) => {
  // 1. 水位动态
  if (animatables.damWater) {
      animatables.damWater.scale.y = 0.8 + Math.sin(time * 0.2) * 0.1 + (state.waterLevel / 100);
      animatables.damWater.position.y = (animatables.damWater.scale.y * 5) / 2 - 2;
  }

  // 2. 机组状态更新
  if (animatables.units && animatables.scaffolds) {
      state.units.forEach((unit, idx) => {
          const uGroup = animatables.units![idx];
          const scaffold = animatables.scaffolds![idx];
          
          if (unit.mode === 'RUNNING') {
              uGroup.rotation.y += 0.05; // 模拟旋转
              scaffold.visible = false;
          } else if (unit.mode === 'MAINTENANCE') {
              uGroup.rotation.y = 0;
              scaffold.visible = true;
              // 检修进度闪烁
              (scaffold as any).material.opacity = 0.1 + Math.sin(time * 3) * 0.1;
          } else {
              uGroup.rotation.y = 0;
              scaffold.visible = false;
          }
      });
  }

  // 3. 桥机移动
  if (animatables.overheadCrane) {
      const activeMaint = state.units.find(u => u.mode === 'MAINTENANCE');
      if (activeMaint) {
          const targetX = -10.5 + (activeMaint.id - 1) * 7;
          animatables.overheadCrane.position.x = THREE.MathUtils.lerp(animatables.overheadCrane.position.x, targetX, 0.02);
      }
  }
};
