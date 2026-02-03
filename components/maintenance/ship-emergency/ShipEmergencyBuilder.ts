
import * as THREE from 'three';
import { EmergencyAnimatables, EmergencyStep } from './three-types';

export const initEmergencyScene = (
  group: THREE.Group, 
  animatables: EmergencyAnimatables,
  disposables: { dispose: () => void }[]
) => {
  // --- 核心材质库 ---
  const hullMat = new THREE.MeshStandardMaterial({ 
    color: 0x1e293b, metalness: 0.6, roughness: 0.4 
  });
  const engineMat = new THREE.MeshStandardMaterial({ 
    color: 0x475569, roughness: 0.7, metalness: 0.5 
  });
  const pipeMat = new THREE.MeshStandardMaterial({ 
    color: 0x94a3b8, metalness: 0.8 
  });
  const glowMat = new THREE.MeshBasicMaterial({ 
    color: 0xef4444, transparent: true, opacity: 0.8 
  });
  const scanMat = new THREE.MeshBasicMaterial({ 
    color: 0x22d3ee, wireframe: true, transparent: true, opacity: 0.1 
  });

  disposables.push(hullMat, engineMat, pipeMat, glowMat, scanMat);

  // 1. 船体 (Ship Hull) - 采用半透明/线框风格增强科技感
  const shipGroup = new THREE.Group();
  group.add(shipGroup);
  animatables.shipHull = shipGroup;

  const hullGeo = new THREE.BoxGeometry(4, 3, 20);
  const hull = new THREE.Mesh(hullGeo, hullMat);
  hull.position.y = 1.5;
  shipGroup.add(hull);

  // 2. 机舱透视区域 (Engine Room Cutaway)
  const engineGroup = new THREE.Group();
  engineGroup.position.set(0, 1.5, 5); // 位于船艉区域
  shipGroup.add(engineGroup);
  animatables.engineSection = engineGroup;

  // 主机块 (Main Engine Block)
  const blockGeo = new THREE.BoxGeometry(2, 2.5, 4);
  const block = new THREE.Mesh(blockGeo, engineMat);
  engineGroup.add(block);

  // 涡轮增压器
  const turboGeo = new THREE.CylinderGeometry(0.6, 0.6, 1.5);
  turboGeo.rotateZ(Math.PI/2);
  const turbo = new THREE.Mesh(turboGeo, pipeMat);
  turbo.position.y = 1.8;
  engineGroup.add(turbo);

  // 3. 螺旋桨 (Propeller)
  const propGeo = new THREE.CylinderGeometry(1.2, 1.2, 0.2, 4);
  propGeo.rotateX(Math.PI/2);
  const prop = new THREE.Mesh(propGeo, new THREE.MeshStandardMaterial({color: 0xb45309, metalness: 0.9}));
  prop.position.set(0, 0.5, 10.2);
  shipGroup.add(prop);
  animatables.propeller = prop;

  // 4. 故障点：燃油管路破损
  const leakPoint = new THREE.Group();
  leakPoint.position.set(0.8, 1, 0.5); // 在引擎块侧面
  engineGroup.add(leakPoint);

  // 泄漏粒子
  const pCount = 50;
  const pGeo = new THREE.BufferGeometry();
  const pPos = new Float32Array(pCount * 3);
  pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
  const pMat = new THREE.PointsMaterial({ color: 0xff4400, size: 0.08, transparent: true, opacity: 0 });
  const particles = new THREE.Points(pGeo, pMat);
  leakPoint.add(particles);
  animatables.leakParticles = particles;

  // 火光效果
  const fireLight = new THREE.PointLight(0xff0000, 0, 10);
  leakPoint.add(fireLight);
  animatables.fireLight = fireLight;

  // 5. 诊断扫描环 (Scanner)
  const ringGeo = new THREE.TorusGeometry(3.5, 0.05, 8, 50);
  ringGeo.rotateX(Math.PI/2);
  const scanner = new THREE.Mesh(ringGeo, new THREE.MeshBasicMaterial({color: 0x0ea5e9, transparent: true, opacity: 0}));
  scanner.position.y = 1.5;
  group.add(scanner);
  animatables.scannerRim = scanner;

  // 水平面辅助
  const waterGrid = new THREE.GridHelper(60, 30, 0x1e293b, 0x0f172a);
  waterGrid.position.y = 0.01;
  group.add(waterGrid);
};

export const animateEmergency = (
  animatables: EmergencyAnimatables, 
  step: EmergencyStep,
  time: number
) => {
  // 1. 船舶航行动态
  if (animatables.shipHull) {
      animatables.shipHull.rotation.x = Math.sin(time * 0.5) * 0.02; // 纵摇
      animatables.shipHull.rotation.z = Math.cos(time * 0.4) * 0.03; // 横摇
      
      // 动力状态
      if (step === 'STANDBY' || step === 'RECOVERED') {
          if (animatables.propeller) animatables.propeller.rotation.z += 0.2;
      } else if (step === 'ALERT' || step === 'DIAGNOSIS') {
          if (animatables.propeller) animatables.propeller.rotation.z += 0.05; // 减速挂车
      }
  }

  // 2. 故障表现
  const isFaulty = step === 'ALERT' || step === 'DIAGNOSIS' || step === 'ISOLATION';
  if (animatables.leakParticles && animatables.fireLight) {
      const pMat = animatables.leakParticles.material as THREE.PointsMaterial;
      if (isFaulty) {
          pMat.opacity = 0.8;
          animatables.fireLight.intensity = 2 + Math.sin(time * 20) * 1.5;
          
          // 粒子飞溅
          const pos = animatables.leakParticles.geometry.attributes.position.array as Float32Array;
          for(let i=0; i<pos.length; i+=3) {
              pos[i] += (Math.random()-0.5) * 0.1;
              pos[i+1] += Math.random() * 0.1;
              pos[i+2] += (Math.random()-0.5) * 0.1;
              if (pos[i+1] > 1.5) { pos[i]=0; pos[i+1]=0; pos[i+2]=0; }
          }
          animatables.leakParticles.geometry.attributes.position.needsUpdate = true;
      } else {
          pMat.opacity = THREE.MathUtils.lerp(pMat.opacity, 0, 0.05);
          animatables.fireLight.intensity = 0;
      }
  }

  // 3. 诊断扫描动画
  if (animatables.scannerRim) {
      if (step === 'DIAGNOSIS') {
          const sMat = animatables.scannerRim.material as THREE.MeshBasicMaterial;
          sMat.opacity = 0.5 + Math.sin(time * 5) * 0.2;
          animatables.scannerRim.position.z = Math.sin(time * 2) * 8;
      } else {
          (animatables.scannerRim.material as THREE.MeshBasicMaterial).opacity = 0;
      }
  }
};
