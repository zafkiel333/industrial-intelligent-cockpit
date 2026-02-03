
import * as THREE from 'three';
import { DockAnimatables, DockingPhase } from './three-types';

export const initDockScene = (
  group: THREE.Group, 
  animatables: DockAnimatables,
  disposables: { dispose: () => void }[]
) => {
  // --- 工业级材质 ---
  const concreteMat = new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.9, metalness: 0.1 });
  const hullMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.4, metalness: 0.5 });
  const waterMat = new THREE.MeshPhysicalMaterial({ 
    color: 0x0ea5e9, transparent: true, opacity: 0.6, transmission: 0.5, roughness: 0.1 
  });
  const blockMat = new THREE.MeshStandardMaterial({ color: 0x78350f }); // Wood blocks
  const laserMat = new THREE.MeshBasicMaterial({ color: 0x22d3ee, transparent: true, opacity: 0.3, side: THREE.DoubleSide });
  const safetyMat = new THREE.MeshStandardMaterial({ color: 0xfacc15 });

  disposables.push(concreteMat, hullMat, waterMat, blockMat, laserMat, safetyMat);

  // 1. 船坞结构 (Dry Dock Basin)
  const dockGroup = new THREE.Group();
  const basinFloor = new THREE.Mesh(new THREE.BoxGeometry(20, 1, 40), concreteMat);
  basinFloor.position.y = -5;
  dockGroup.add(basinFloor);

  const sideWallGeo = new THREE.BoxGeometry(2, 10, 40);
  const wallL = new THREE.Mesh(sideWallGeo, concreteMat);
  wallL.position.set(-11, 0, 0);
  const wallR = new THREE.Mesh(sideWallGeo, concreteMat);
  wallR.position.set(11, 0, 0);
  dockGroup.add(wallL, wallR);

  const headWall = new THREE.Mesh(new THREE.BoxGeometry(20, 10, 2), concreteMat);
  headWall.position.set(0, 0, -21);
  dockGroup.add(headWall);

  group.add(dockGroup);

  // 2. 坞门 (Dock Gates)
  const gateGroup = new THREE.Group();
  gateGroup.position.set(0, 0, 20);
  const gateGeo = new THREE.BoxGeometry(20, 10, 1);
  const gate = new THREE.Mesh(gateGeo, new THREE.MeshStandardMaterial({color: 0x334155, metalness: 0.8}));
  gateGroup.add(gate);
  group.add(gateGroup);
  animatables.dockGates = gateGroup;

  // 3. 支撑系统 (Blocks & Shores)
  const blocksGroup = new THREE.Group();
  const blockGeo = new THREE.BoxGeometry(2, 1.2, 1);
  for(let i=-15; i<=15; i+=3) {
      const b = new THREE.Mesh(blockGeo, blockMat);
      b.position.set(0, -4.1, i);
      blocksGroup.add(b);
  }
  group.add(blocksGroup);
  animatables.keelBlocks = blocksGroup;

  // 4. 船舶 (Ship Model)
  const shipGroup = new THREE.Group();
  const hullGeo = new THREE.BoxGeometry(8, 6, 30);
  // Simple hull shaping
  const hull = new THREE.Mesh(hullGeo, hullMat);
  shipGroup.add(hull);

  // Bridge
  const bridge = new THREE.Mesh(new THREE.BoxGeometry(6, 4, 4), new THREE.MeshStandardMaterial({color: 0xffffff}));
  bridge.position.set(0, 5, -8);
  shipGroup.add(bridge);

  // Propeller (Simplified)
  const propGroup = new THREE.Group();
  propGroup.position.set(0, -2, 15);
  const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 1), safetyMat);
  hub.rotation.x = Math.PI / 2;
  propGroup.add(hub);
  for(let i=0; i<4; i++) {
      const blade = new THREE.Mesh(new THREE.BoxGeometry(0.2, 3, 1), safetyMat);
      blade.rotation.z = (i * Math.PI) / 2;
      blade.position.y = 1.5;
      const bParent = new THREE.Group();
      bParent.rotation.z = (i * Math.PI) / 2;
      bParent.add(blade);
      propGroup.add(bParent);
  }
  shipGroup.add(propGroup);
  animatables.propellerGroup = propGroup;

  shipGroup.position.set(0, 0, 40); // Start outside
  group.add(shipGroup);
  animatables.shipGroup = shipGroup;

  // 5. 水面 (Water Surface)
  const waterGeo = new THREE.BoxGeometry(20, 1, 40);
  const water = new THREE.Mesh(waterGeo, waterMat);
  water.position.y = 3;
  group.add(water);
  animatables.waterSurface = water;

  // 6. 辅助工具：扫描线
  const scanGeo = new THREE.PlaneGeometry(24, 0.5);
  const scanner = new THREE.Mesh(scanGeo, laserMat);
  scanner.rotation.x = -Math.PI / 2;
  scanner.visible = false;
  group.add(scanner);
  animatables.scanBeam = scanner;

  // 辅助地面环境
  const grid = new THREE.GridHelper(100, 20, 0x1e293b, 0x0f172a);
  grid.position.y = -5.1;
  group.add(grid);
};

export const animateDockScene = (
  animatables: DockAnimatables, 
  phase: DockingPhase,
  time: number
) => {
  if (!animatables.shipGroup || !animatables.waterSurface) return;

  switch(phase) {
    case 'ENTRY':
      // 船舶驶入，坞门开启
      animatables.shipGroup.position.z = THREE.MathUtils.lerp(animatables.shipGroup.position.z, 0, 0.01);
      if (animatables.dockGates) animatables.dockGates.position.y = -10; 
      break;
    case 'BLOCK_POSITION':
      // 坞门关闭，开始扫描对位
      if (animatables.dockGates) animatables.dockGates.position.y = 0;
      if (animatables.scanBeam) {
          animatables.scanBeam.visible = true;
          animatables.scanBeam.position.z = Math.sin(time * 2) * 15;
          animatables.scanBeam.position.y = -3.5;
      }
      break;
    case 'DEWATERING':
      // 抽水，水位下降，船舶下沉
      if (animatables.waterSurface.scale.y > 0.1) {
          animatables.waterSurface.position.y -= 0.02;
          animatables.shipGroup.position.y = Math.max(-1.5, animatables.shipGroup.position.y - 0.02);
      }
      if (animatables.scanBeam) animatables.scanBeam.visible = false;
      break;
    case 'CLEANING':
      // 自动机器人清洗 (Visual pulse)
      animatables.shipGroup.position.y = -1.5;
      if (animatables.waterSurface) animatables.waterSurface.position.y = -4.5;
      break;
    case 'MAINTENANCE':
      // 螺旋桨旋转检修
      if (animatables.propellerGroup) animatables.propellerGroup.rotation.z += 0.05;
      break;
    case 'FLOODING':
      // 注水上升
      if (animatables.waterSurface.position.y < 3) {
          animatables.waterSurface.position.y += 0.05;
          animatables.shipGroup.position.y = Math.min(0, animatables.shipGroup.position.y + 0.05);
      }
      break;
    case 'COMPLETED':
      if (animatables.dockGates) animatables.dockGates.position.y = -10;
      animatables.shipGroup.position.z += 0.05; // 驶离
      break;
  }
};
