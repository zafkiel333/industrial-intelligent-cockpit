
import * as THREE from 'three';
import { NoviceAnimatables, TrainingPhase } from './three-types';

export const initNoviceScene = (
  group: THREE.Group, 
  animatables: NoviceAnimatables,
  disposables: { dispose: () => void }[]
) => {
  // --- Materials ---
  const metalMat = new THREE.MeshStandardMaterial({ color: 0x64748b, roughness: 0.3, metalness: 0.8 });
  const highlightMat = new THREE.MeshBasicMaterial({ color: 0x10b981, transparent: true, opacity: 0.3, wireframe: true });
  const alertMat = new THREE.MeshBasicMaterial({ color: 0xef4444, transparent: true, opacity: 0.3 });
  const toolMat = new THREE.MeshStandardMaterial({ color: 0x3b82f6, metalness: 0.9 });
  const ghostMat = new THREE.MeshBasicMaterial({ color: 0x22d3ee, transparent: true, opacity: 0.1 });

  disposables.push(metalMat, highlightMat, alertMat, toolMat, ghostMat);

  // 1. 核心设备：离心泵 (Centrifugal Pump)
  const pumpGroup = new THREE.Group();
  group.add(pumpGroup);
  animatables.mainModel = pumpGroup;

  // 泵体外壳
  const casingGeo = new THREE.CylinderGeometry(2, 2.5, 3, 32);
  const casing = new THREE.Mesh(casingGeo, metalMat);
  pumpGroup.add(casing);

  // 进出口法兰
  const flangeGeo = new THREE.TorusGeometry(0.8, 0.2, 16, 32);
  const flangeIn = new THREE.Mesh(flangeGeo, metalMat);
  flangeIn.position.set(-2, 0, 0);
  flangeIn.rotation.y = Math.PI / 2;
  pumpGroup.add(flangeIn);

  const flangeOut = new THREE.Mesh(flangeGeo, metalMat);
  flangeOut.position.set(0, 1.5, 0);
  flangeOut.rotation.x = Math.PI / 2;
  pumpGroup.add(flangeOut);

  // 2. 引导高亮层 (Ghost/Hint)
  const hintGeo = new THREE.CylinderGeometry(2.1, 2.6, 3.1, 32);
  const hintMesh = new THREE.Mesh(hintGeo, highlightMat);
  hintMesh.visible = false;
  pumpGroup.add(hintMesh);
  animatables.activeHighlight = hintMesh;

  // 3. 虚拟工具投影 (Spanner/Wrench)
  const toolGroup = new THREE.Group();
  const spannerGeo = new THREE.BoxGeometry(0.3, 2, 0.1);
  const headGeo = new THREE.CircleGeometry(0.5, 6);
  const spanner = new THREE.Mesh(spannerGeo, toolMat);
  const spannerHead = new THREE.Mesh(headGeo, toolMat);
  spannerHead.position.y = 1;
  toolGroup.add(spanner, spannerHead);
  toolGroup.position.set(3, 2, 0);
  toolGroup.visible = false;
  group.add(toolGroup);
  animatables.toolModel = toolGroup;

  // 4. 环境地板
  const grid = new THREE.GridHelper(30, 20, 0x1e293b, 0x0f172a);
  grid.position.y = -2;
  group.add(grid);

  // 5. HUD 扫描平面
  const scanGeo = new THREE.PlaneGeometry(10, 10);
  const scanLine = new THREE.Mesh(scanGeo, ghostMat);
  scanLine.rotation.x = -Math.PI / 2;
  group.add(scanLine);
  animatables.hudScanLine = scanLine;
};

export const animateNoviceScene = (
  animatables: NoviceAnimatables, 
  phase: TrainingPhase,
  time: number
) => {
  if (!animatables.mainModel) return;

  // 基础浮动动画
  animatables.mainModel.position.y = Math.sin(time) * 0.1;

  // 阶段特定的动画行为
  if (phase === 'SAFETY_CHECK') {
    // 锁定状态下的红光闪烁
    if (animatables.activeHighlight) {
      animatables.activeHighlight.visible = true;
      (animatables.activeHighlight.material as THREE.MeshBasicMaterial).color.setHex(0xef4444);
      animatables.activeHighlight.material.opacity = 0.2 + Math.sin(time * 5) * 0.2;
    }
  } 
  else if (phase === 'TOOL_SELECT') {
    if (animatables.toolModel) {
      animatables.toolModel.visible = true;
      animatables.toolModel.position.y = 2 + Math.sin(time * 3) * 0.2;
      animatables.toolModel.rotation.y += 0.02;
    }
  }
  else if (phase === 'DISASSEMBLY') {
    if (animatables.activeHighlight) {
      animatables.activeHighlight.visible = true;
      (animatables.activeHighlight.material as THREE.MeshBasicMaterial).color.setHex(0x10b981);
      animatables.activeHighlight.material.opacity = 0.4;
    }
    // 模拟零件缓慢移出
    const topCap = animatables.mainModel.children[0];
    if (topCap) {
        topCap.position.y = Math.max(0, Math.sin(time * 0.5) * 2);
    }
  }

  // HUD 扫描动画
  if (animatables.hudScanLine) {
    animatables.hudScanLine.position.y = -1.9 + Math.sin(time * 2) * 4;
  }
};
