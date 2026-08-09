
import * as THREE from 'three';
import { OverhaulAnimatables, OverhaulStep } from './three-types';

export const initOverhaulScene = (
  group: THREE.Group, 
  animatables: OverhaulAnimatables,
  disposables: { dispose: () => void }[]
) => {
  // --- 材质库 ---
  const metalMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.3, metalness: 0.8 });
  const yellowMat = new THREE.MeshStandardMaterial({ color: 0xfacc15, roughness: 0.5, metalness: 0.2 });
  const newPartMat = new THREE.MeshStandardMaterial({ color: 0x0ea5e9, emissive: 0x0ea5e9, emissiveIntensity: 0.5 });
  const scanMat = new THREE.MeshBasicMaterial({ color: 0x22d3ee, transparent: true, opacity: 0.1, side: THREE.DoubleSide });

  disposables.push(metalMat, yellowMat, newPartMat, scanMat);

  // 1. 矿车主体组
  const truckGroup = new THREE.Group();
  group.add(truckGroup);

  // 底盘 (Chassis)
  const chassis = new THREE.Mesh(new THREE.BoxGeometry(4, 1.5, 10), metalMat);
  truckGroup.add(chassis);
  animatables.mainChassis = truckGroup;

  // 发动机 (Engine)
  const engineGroup = new THREE.Group();
  engineGroup.position.set(0, 1.5, 3.5);
  const engine = new THREE.Mesh(new THREE.BoxGeometry(2, 2, 2.5), metalMat);
  engineGroup.add(engine);
  truckGroup.add(engineGroup);
  animatables.engineUnit = engineGroup;

  // 货箱 (Dump Body)
  const bodyGroup = new THREE.Group();
  bodyGroup.position.set(0, 2, -2);
  const body = new THREE.Mesh(new THREE.BoxGeometry(5.5, 3, 9), yellowMat);
  bodyGroup.add(body);
  truckGroup.add(bodyGroup);
  animatables.dumpBody = bodyGroup;

  // 轮组 (Wheels)
  animatables.wheelAssemblies = [];
  const wheelGeo = new THREE.CylinderGeometry(1.5, 1.5, 1.2, 32);
  wheelGeo.rotateZ(Math.PI / 2);
  const wheelMat = new THREE.MeshStandardMaterial({ color: 0x0a0a0a, roughness: 0.9 });
  disposables.push(wheelGeo, wheelMat);

  const wheelPos = [
      {x: -3, z: 3.5}, {x: 3, z: 3.5},
      {x: -3.2, z: -3.5}, {x: 3.2, z: -3.5}
  ];
  wheelPos.forEach(p => {
      const w = new THREE.Mesh(wheelGeo, wheelMat);
      const wGroup = new THREE.Group();
      wGroup.position.set(p.x, 0.5, p.z);
      wGroup.add(w);
      truckGroup.add(wGroup);
      animatables.wheelAssemblies?.push(wGroup);
  });

  // 2. 扫描场
  const scanPlane = new THREE.Mesh(new THREE.CylinderGeometry(8, 8, 0.1, 32), scanMat);
  scanPlane.position.y = 0.1;
  scanPlane.visible = false;
  group.add(scanPlane);
  animatables.scanField = scanPlane;

  // 3. 高亮灯
  const light = new THREE.PointLight(0x0ea5e9, 0, 10);
  light.position.set(0, 3, 3.5);
  group.add(light);
  animatables.partHighlight = light;

  // 环境网格
  const grid = new THREE.GridHelper(50, 20, 0x1e293b, 0x0f172a);
  group.add(grid);
};

export const animateOverhaul = (
  animatables: OverhaulAnimatables, 
  step: OverhaulStep,
  time: number
) => {
  if (!animatables.mainChassis) return;

  const t = Math.sin(time * 0.5) * 0.5 + 0.5; // 平滑过渡因子

  switch (step) {
    case 'SCAN':
      if (animatables.scanField) {
        animatables.scanField.visible = true;
        animatables.scanField.scale.setScalar(1 + Math.sin(time * 3) * 0.1);
      }
      break;

    case 'EXPLODE':
      // 爆炸分解动画
      if (animatables.scanField) animatables.scanField.visible = false;
      if (animatables.dumpBody) animatables.dumpBody.position.y = 2 + t * 6;
      if (animatables.engineUnit) animatables.engineUnit.position.z = 3.5 + t * 4;
      if (animatables.wheelAssemblies) {
          animatables.wheelAssemblies.forEach((w, i) => {
              const factor = i % 2 === 0 ? -1 : 1;
              w.position.x = (i < 2 ? 3 : 3.2) * factor * (1 + t * 1.5);
          });
      }
      break;

    case 'REPLACE':
      // 核心件变色/呼吸灯
      if (animatables.engineUnit) {
          const mesh = animatables.engineUnit.children[0] as THREE.Mesh;
          (mesh.material as THREE.MeshStandardMaterial).emissive.setHex(0x0ea5e9);
          (mesh.material as THREE.MeshStandardMaterial).emissiveIntensity = 0.5 + Math.sin(time * 5) * 0.5;
      }
      break;

    case 'VALIDATION':
      // 综合验证：整体微振动
      animatables.mainChassis.position.y = Math.sin(time * 15) * 0.05;
      break;

    default:
      if (animatables.scanField) animatables.scanField.visible = false;
      if (animatables.engineUnit) (animatables.engineUnit.children[0] as THREE.Mesh).material.emissiveIntensity = 0;
  }
};
