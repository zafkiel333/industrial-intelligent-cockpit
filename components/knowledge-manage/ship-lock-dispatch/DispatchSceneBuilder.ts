
import * as THREE from 'three';
import { DispatchAnimatables, DispatchAlgorithmMode } from './three-types';

export const initDispatchScene = (
  group: THREE.Group, 
  animatables: DispatchAnimatables,
  disposables: { dispose: () => void }[]
) => {
  // --- 材质库 ---
  const structureMat = new THREE.MeshStandardMaterial({ 
    color: 0x0f172a, roughness: 0.3, metalness: 0.8 
  });
  const waterMat = new THREE.MeshPhysicalMaterial({ 
    color: 0x0ea5e9, transmission: 0.9, opacity: 0.3, transparent: true, roughness: 0.1 
  });
  const vesselMat = new THREE.MeshStandardMaterial({ color: 0x3b82f6 });
  const nodeMat = new THREE.PointsMaterial({ color: 0x22d3ee, size: 0.1, transparent: true, opacity: 0.6 });

  disposables.push(structureMat, waterMat, vesselMat, nodeMat);

  // 1. 梯级船闸结构 (Multi-level Locks)
  animatables.locks = [];
  const lockGeo = new THREE.BoxGeometry(10, 2, 16);
  disposables.push(lockGeo);

  for(let i=0; i<3; i++) {
      const lGroup = new THREE.Group();
      lGroup.position.set(0, -i * 3, i * 18);
      
      const base = new THREE.Mesh(lockGeo, structureMat);
      lGroup.add(base);

      // 侧墙
      const wallGeo = new THREE.BoxGeometry(1, 4, 16);
      const wallL = new THREE.Mesh(wallGeo, structureMat);
      wallL.position.set(-5.5, 1, 0);
      const wallR = new THREE.Mesh(wallGeo, structureMat);
      wallR.position.set(5.5, 1, 0);
      lGroup.add(wallL, wallR);

      // 水体
      const water = new THREE.Mesh(new THREE.BoxGeometry(10, 1.5, 16), waterMat);
      water.position.y = 0.5;
      lGroup.add(water);

      group.add(lGroup);
      animatables.locks.push(lGroup);
  }

  // 2. 船舶队列 (Vessels)
  animatables.vessels = [];
  const shipGeo = new THREE.BoxGeometry(3, 1, 6);
  disposables.push(shipGeo);
  
  for(let i=0; i<5; i++) {
      const ship = new THREE.Mesh(shipGeo, vesselMat.clone());
      ship.position.set((Math.random()-0.5)*6, 1.5, 50 - i * 15);
      group.add(ship);
      animatables.vessels.push(ship as unknown as THREE.Group);
  }

  // 3. 计算节点粒子 (Neural Matrix)
  const pCount = 1000;
  const pGeo = new THREE.BufferGeometry();
  const pPos = new Float32Array(pCount * 3);
  for(let i=0; i<pCount; i++) {
      pPos[i*3] = (Math.random()-0.5)*40;
      pPos[i*3+1] = (Math.random()-0.5)*20;
      pPos[i*3+2] = (Math.random()-0.5)*60;
  }
  pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
  disposables.push(pGeo);
  const nodes = new THREE.Points(pGeo, nodeMat);
  group.add(nodes);
  animatables.dataNodes = nodes;

  // 4. 指令光束 (Command Beams)
  const beamGroup = new THREE.Group();
  group.add(beamGroup);
  animatables.commandBeams = beamGroup;

  // 辅助网格
  const grid = new THREE.GridHelper(100, 50, 0x1e293b, 0x020617);
  grid.position.y = -10;
  group.add(grid);
};

export const animateDispatchScene = (
  animatables: DispatchAnimatables, 
  mode: DispatchAlgorithmMode,
  time: number
) => {
  // 1. 粒子节点旋转
  if (animatables.dataNodes) {
      animatables.dataNodes.rotation.y += 0.002;
      animatables.dataNodes.rotation.x += 0.001;
  }

  // 2. 船舶移动模拟 (基于调度模式)
  if (animatables.vessels) {
      const speed = mode === 'EFFICIENCY_FIRST' ? 0.08 : 0.04;
      animatables.vessels.forEach((ship, i) => {
          ship.position.z -= speed;
          if (ship.position.z < -40) ship.position.z = 60;
          
          // 进闸时的逻辑震荡（模拟计算匹配）
          if (Math.abs(ship.position.z % 18) < 1) {
              ship.position.y = 1.5 + Math.sin(time * 5) * 0.1;
          }
      });
  }

  // 3. 闸室水位联动
  if (animatables.locks) {
      animatables.locks.forEach((lock, i) => {
          const water = lock.children[3]; // 水体Mesh
          if (water) {
              const cycle = (time + i * 2) % 10;
              water.scale.y = 1 + Math.sin(cycle) * 0.2;
              water.position.y = (water.scale.y * 1.5) / 2 - 0.5;
          }
      });
  }
};
