
import * as THREE from 'three';
import { ExpertAnimatables, ExpertSimStep } from './three-types';

export const initExpertScene = (
  group: THREE.Group, 
  animatables: ExpertAnimatables,
  disposables: { dispose: () => void }[]
) => {
  // --- 材质库 ---
  const panelMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.5, metalness: 0.8 });
  const componentMat = new THREE.MeshStandardMaterial({ color: 0x64748b, roughness: 0.3, metalness: 0.5 });
  const copperMat = new THREE.MeshStandardMaterial({ color: 0xb45309, metalness: 0.8 });
  const arMat = new THREE.MeshBasicMaterial({ color: 0x22d3ee, transparent: true, opacity: 0.4, wireframe: true });
  const pointerMat = new THREE.MeshBasicMaterial({ color: 0xff0000 });
  
  disposables.push(panelMat, componentMat, copperMat, arMat, pointerMat);

  // 1. 控制柜主体 (Control Cabinet)
  const cabinet = new THREE.Group();
  const base = new THREE.Mesh(new THREE.BoxGeometry(4, 6, 1.5), panelMat);
  cabinet.add(base);
  
  // 内部导轨与模组
  const internalGroup = new THREE.Group();
  internalGroup.position.z = 0.5;
  cabinet.add(internalGroup);
  animatables.targetComponent = internalGroup;

  for(let i=0; i<3; i++) {
      const rail = new THREE.Mesh(new THREE.BoxGeometry(3.5, 0.2, 0.2), componentMat);
      rail.position.y = 1.5 - i * 1.5;
      internalGroup.add(rail);

      // PLC/模块单元
      for(let j=0; j<4; j++) {
          const mod = new THREE.Mesh(new THREE.BoxGeometry(0.6, 1, 0.4), componentMat);
          mod.position.set(-1.2 + j * 0.8, 1.5 - i * 1.5, 0.2);
          internalGroup.add(mod);
          
          // 状态指示灯
          const led = new THREE.Mesh(new THREE.SphereGeometry(0.05), new THREE.MeshBasicMaterial({color: 0x00ff00}));
          led.position.set(-1.2 + j * 0.8, 1.8 - i * 1.5, 0.41);
          internalGroup.add(led);
      }
  }
  group.add(cabinet);

  // 2. AR 叠加层 (AR Hologram)
  const arGroup = new THREE.Group();
  arGroup.visible = false;
  group.add(arGroup);
  animatables.hologramOverlay = arGroup;

  const ghostGeo = new THREE.BoxGeometry(0.65, 1.05, 0.45);
  const ghost = new THREE.Mesh(ghostGeo, arMat);
  ghost.position.set(-0.4, 1.5, 0.7); // 悬浮在故障模块上方
  arGroup.add(ghost);

  // 3. 专家指针 (Expert Pointer)
  const pointerGroup = new THREE.Group();
  const sphere = new THREE.Mesh(new THREE.SphereGeometry(0.1), pointerMat);
  const ring = new THREE.Mesh(new THREE.TorusGeometry(0.2, 0.02), pointerMat);
  pointerGroup.add(sphere, ring);
  pointerGroup.visible = false;
  group.add(pointerGroup);
  animatables.expertPointer = pointerGroup;

  // 4. 数据流粒子 (Data Flow)
  const pCount = 200;
  const pGeo = new THREE.BufferGeometry();
  const pPos = new Float32Array(pCount * 3);
  for(let i=0; i<pCount; i++) {
      pPos[i*3] = (Math.random()-0.5)*10;
      pPos[i*3+1] = (Math.random()-0.5)*10;
      pPos[i*3+2] = (Math.random()-0.5)*10;
  }
  pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
  const pMat = new THREE.PointsMaterial({ color: 0x22d3ee, size: 0.05, transparent: true, opacity: 0 });
  const flow = new THREE.Points(pGeo, pMat);
  group.add(flow);
  animatables.dataFlowLines = flow;

  // 地面
  const grid = new THREE.GridHelper(30, 20, 0x1e293b, 0x0f172a);
  grid.position.y = -3;
  group.add(grid);
};

export const animateExpertScene = (
  animatables: ExpertAnimatables, 
  step: ExpertSimStep,
  time: number
) => {
  // 指针漂浮动画
  if (animatables.expertPointer && animatables.expertPointer.visible) {
      animatables.expertPointer.position.x = -0.4 + Math.sin(time * 2) * 0.5;
      animatables.expertPointer.position.y = 1.5 + Math.cos(time * 2) * 0.5;
      animatables.expertPointer.position.z = 1.2;
  }

  // 全息层脉冲
  if (animatables.hologramOverlay && animatables.hologramOverlay.visible) {
      animatables.hologramOverlay.scale.setScalar(1 + Math.sin(time * 4) * 0.05);
  }

  // 粒子数据流
  if (animatables.dataFlowLines) {
      const mat = animatables.dataFlowLines.material as THREE.PointsMaterial;
      if (step === 'STREAMING' || step === 'DIAGNOSING') {
          mat.opacity = 0.5;
          animatables.dataFlowLines.rotation.y += 0.01;
      } else {
          mat.opacity = THREE.MathUtils.lerp(mat.opacity, 0, 0.1);
      }
  }

  // 根据阶段控制可见性
  if (animatables.expertPointer) {
      animatables.expertPointer.visible = (step === 'DIAGNOSING' || step === 'GUIDING');
  }
  if (animatables.hologramOverlay) {
      animatables.hologramOverlay.visible = (step === 'GUIDING');
  }
};
