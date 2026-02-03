
import * as THREE from 'three';
import { EngineAnimatables, EngineRepairPhase } from './three-types';

export const initEngineScene = (
  group: THREE.Group, 
  animatables: EngineAnimatables,
  disposables: { dispose: () => void }[]
) => {
  // --- 工业级材质 ---
  const ironMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.6, metalness: 0.4 });
  const copperMat = new THREE.MeshStandardMaterial({ color: 0xb45309, metalness: 0.8, roughness: 0.3 });
  const steelMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.2, metalness: 0.8 });
  const chromeMat = new THREE.MeshStandardMaterial({ color: 0xffffff, metalness: 1.0, roughness: 0.1 });
  const laserMat = new THREE.MeshBasicMaterial({ color: 0x06b6d4, transparent: true, opacity: 0.3 });

  disposables.push(ironMat, copperMat, steelMat, chromeMat, laserMat);

  // 1. 发动机缸体 (Main Block) - V12 结构示意
  const blockGeo = new THREE.BoxGeometry(4, 3, 6);
  disposables.push(blockGeo);
  const block = new THREE.Mesh(blockGeo, ironMat);
  block.position.y = 1;
  group.add(block);
  animatables.engineBlock = group;

  // 2. 涡轮增压器 (Turbocharger) - 位于顶部
  const turboGroup = new THREE.Group();
  turboGroup.position.set(0, 2.8, 1);
  const scrollGeo = new THREE.TorusGeometry(0.8, 0.3, 16, 32);
  disposables.push(scrollGeo);
  const turbo = new THREE.Mesh(scrollGeo, steelMat);
  turbo.rotation.y = Math.PI / 2;
  turboGroup.add(turbo);
  group.add(turboGroup);
  animatables.turbocharger = turboGroup;

  // 3. 活塞与曲轴 (Internal Dynamics) - 内部透视可见
  const internalGroup = new THREE.Group();
  group.add(internalGroup);
  animatables.pistons = [];

  for(let i=0; i<6; i++) {
      const pGroup = new THREE.Group();
      pGroup.position.set((i%2===0?1:-1)*1.2, 1, -2 + i*0.8);
      const pistonGeo = new THREE.CylinderGeometry(0.4, 0.4, 0.6, 16);
      const piston = new THREE.Mesh(pistonGeo, chromeMat);
      pGroup.add(piston);
      internalGroup.add(pGroup);
      animatables.pistons.push(pGroup);
  }

  // 4. 冷却风扇 (Fans)
  animatables.radiatorFans = [];
  const fanGeo = new THREE.CylinderGeometry(1.5, 1.5, 0.1, 8);
  fanGeo.rotateX(Math.PI/2);
  disposables.push(fanGeo);
  for(let i=0; i<2; i++) {
      const fanGroup = new THREE.Group();
      fanGroup.position.set(0, 1, 3.2 + i*0.2);
      const fan = new THREE.Mesh(fanGeo, new THREE.MeshBasicMaterial({color: 0x1e293b, wireframe: true}));
      fanGroup.add(fan);
      group.add(fanGroup);
      animatables.radiatorFans.push(fanGroup);
  }

  // 5. 燃油喷射粒子 (Fuel Spray)
  const pCount = 50;
  const pGeo = new THREE.BufferGeometry();
  const pPos = new Float32Array(pCount * 3);
  pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
  const pMat = new THREE.PointsMaterial({ color: 0x38bdf8, size: 0.05, transparent: true });
  disposables.push(pGeo, pMat);
  const spray = new THREE.Points(pGeo, pMat);
  group.add(spray);
  animatables.fuelLines = spray;

  // 6. 激光扫描平面 (Diagnosis tool)
  const scanGeo = new THREE.PlaneGeometry(5, 5);
  scanGeo.rotateX(-Math.PI/2);
  disposables.push(scanGeo);
  const scanner = new THREE.Mesh(scanGeo, laserMat);
  scanner.position.y = 5;
  scanner.visible = false;
  group.add(scanner);
  animatables.laserScan = scanner;

  // 7. 故障红光 (Heat Light)
  const light = new THREE.PointLight(0xef4444, 0, 10);
  light.position.set(0, 2, 0);
  group.add(light);
  animatables.heatGlow = light;

  // 辅助地板
  const grid = new THREE.GridHelper(20, 20, 0x1e293b, 0x0f172a);
  grid.position.y = -0.5;
  group.add(grid);
};

export const animateEngineScene = (
  animatables: EngineAnimatables, 
  phase: EngineRepairPhase,
  time: number
) => {
  // 基础运行状态
  const isRunning = phase === 'STANDBY' || phase === 'TURBO_STALL' || phase === 'COLD_START';
  const engineSpeed = phase === 'COLD_START' ? 0.3 : 1.0;

  // 1. 活塞往复运动
  if (animatables.pistons) {
      animatables.pistons.forEach((p, i) => {
          if(isRunning) {
              const offset = i * 0.5;
              p.children[0].position.y = Math.sin(time * 15 * engineSpeed + offset) * 0.8;
          } else {
              p.children[0].position.y = THREE.MathUtils.lerp(p.children[0].position.y, 0, 0.1);
          }
      });
  }

  // 2. 风扇旋转
  if (animatables.radiatorFans) {
      animatables.radiatorFans.forEach(f => {
          if (isRunning) f.rotation.z += 0.2;
      });
  }

  // 3. 涡轮动画
  if (animatables.turbocharger) {
      if (phase === 'TURBO_STALL') {
          // 喘振抖动
          animatables.turbocharger.position.x = Math.sin(time * 50) * 0.05;
          animatables.turbocharger.rotation.z += 0.5;
      } else if (isRunning) {
          animatables.turbocharger.rotation.z += 0.2;
      }
  }

  // 4. 故障特效
  if (animatables.heatGlow) {
      if (phase === 'THERMAL_FAILURE' || phase === 'TURBO_STALL') {
          animatables.heatGlow.intensity = 5 + Math.sin(time * 10) * 2;
      } else {
          animatables.heatGlow.intensity = 0;
      }
  }

  // 5. 诊断扫描
  if (animatables.laserScan) {
      if (phase === 'OIL_ANALYSIS' || phase === 'CORE_REPAIR') {
          animatables.laserScan.visible = true;
          animatables.laserScan.position.z = Math.sin(time * 2) * 3;
      } else {
          animatables.laserScan.visible = false;
      }
  }

  // 6. 燃油喷射粒子
  if (animatables.fuelLines && isRunning) {
      const pos = animatables.fuelLines.geometry.attributes.position.array as Float32Array;
      for(let i=0; i<pos.length; i+=3) {
          pos[i+1] -= 0.1;
          if(pos[i+1] < 0) {
              pos[i] = (Math.random()-0.5)*2;
              pos[i+1] = 2;
              pos[i+2] = (Math.random()-0.5)*4;
          }
      }
      animatables.fuelLines.geometry.attributes.position.needsUpdate = true;
      animatables.fuelLines.visible = true;
  } else if (animatables.fuelLines) {
      animatables.fuelLines.visible = false;
  }
};
