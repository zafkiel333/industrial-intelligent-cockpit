
import * as THREE from 'three';
import { CollaborativeAnimatables, CollaborativePhase } from './three-types';

export const initCollaborativeScene = (
  group: THREE.Group, 
  animatables: CollaborativeAnimatables,
  disposables: { dispose: () => void }[]
) => {
  // --- 工业级材质 ---
  const craneMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.5, metalness: 0.8 });
  const highlightMat = new THREE.MeshStandardMaterial({ color: 0xf97316, emissive: 0x7c2d12, emissiveIntensity: 0.5 });
  const platformMat = new THREE.MeshStandardMaterial({ color: 0x334155, transparent: true, opacity: 0.4 });
  const mechColor = new THREE.Color(0xf59e0b); // 橙黄: 机械
  const elecColor = new THREE.Color(0x3b82f6); // 蓝色: 电气
  const autoColor = new THREE.Color(0x10b981); // 绿色: 自动化

  disposables.push(craneMat, highlightMat, platformMat);

  // 1. 岸桥主框架 (STS Gantry)
  const frameGeo = new THREE.BoxGeometry(2, 20, 2);
  disposables.push(frameGeo);
  
  const legs = [
      {x: -6, z: -4}, {x: 6, z: -4},
      {x: -6, z: 4}, {x: 6, z: 4}
  ];
  legs.forEach(p => {
      const leg = new THREE.Mesh(frameGeo, craneMat);
      leg.position.set(p.x, 8, p.z);
      group.add(leg);
  });

  const beamGeo = new THREE.BoxGeometry(20, 2, 2);
  const beam = new THREE.Mesh(beamGeo, craneMat);
  beam.position.y = 18;
  group.add(beam);

  // 2. 作业小车与检修平台
  const trolleyGroup = new THREE.Group();
  trolleyGroup.position.set(0, 18, 0);
  const trolleyGeo = new THREE.BoxGeometry(4, 2, 5);
  const trolley = new THREE.Mesh(trolleyGeo, highlightMat);
  trolleyGroup.add(trolley);
  group.add(trolleyGroup);
  animatables.trolley = trolleyGroup;

  // 内部齿轮件 (用于机械组维修演示)
  const gears = new THREE.Group();
  gears.position.y = 2;
  const gearGeo = new THREE.TorusGeometry(0.8, 0.2, 16, 32);
  const gear = new THREE.Mesh(gearGeo, new THREE.MeshStandardMaterial({color: 0x94a3b8}));
  gears.add(gear);
  trolleyGroup.add(gears);
  animatables.internalGears = gears;

  // 3. 工种作业标记 (Team Markers)
  animatables.teamMarkers = {
    mech: createMarker(mechColor, 'MECH'),
    elec: createMarker(elecColor, 'ELEC'),
    auto: createMarker(autoColor, 'AUTO')
  };

  function createMarker(color: THREE.Color, label: string) {
      const mGroup = new THREE.Group();
      const ringGeo = new THREE.TorusGeometry(0.5, 0.05, 16, 32);
      const ring = new THREE.Mesh(ringGeo, new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.8 }));
      ring.rotation.x = Math.PI / 2;
      mGroup.add(ring);
      
      const core = new THREE.Mesh(new THREE.SphereGeometry(0.15), new THREE.MeshBasicMaterial({ color }));
      mGroup.add(core);
      
      const light = new THREE.PointLight(color, 2, 5);
      mGroup.add(light);
      
      mGroup.visible = false;
      group.add(mGroup);
      return mGroup;
  }

  // 4. 地面参考
  const grid = new THREE.GridHelper(50, 20, 0x1e293b, 0x0f172a);
  grid.position.y = -0.5;
  group.add(grid);
};

export const animateCollaborativeScene = (
  animatables: CollaborativeAnimatables, 
  phase: CollaborativePhase,
  time: number
) => {
  if (!animatables.teamMarkers) return;

  const { mech, elec, auto } = animatables.teamMarkers;

  // 根据阶段重置标记位置和可见性
  switch (phase) {
    case 'SAFETY_LOCK':
      mech.visible = elec.visible = auto.visible = true;
      mech.position.set(-6, 2, 4);  // 基座安全锁
      elec.position.set(0, 5, -8);  // 低压配电房
      auto.position.set(6, 2, 4);   // 网络机柜
      break;
      
    case 'MECH_DISMANTLE':
      mech.visible = true;
      elec.visible = false;
      auto.visible = false;
      // 机械组在小车位置
      if (animatables.trolley) {
          mech.position.copy(animatables.trolley.position).add(new THREE.Vector3(0, 2, 0));
          if (animatables.internalGears) animatables.internalGears.rotation.z += 0.05;
      }
      break;

    case 'ELEC_TEST':
      mech.visible = false;
      elec.visible = true;
      auto.visible = false;
      elec.position.set(0, 18, -4); // 动力电缆拖链处
      break;

    case 'AUTO_CALIBRATE':
      mech.visible = false;
      elec.visible = false;
      auto.visible = true;
      auto.position.set(0, 18, 2); // 控制系统单元
      break;

    case 'JOINT_VERIFY':
      mech.visible = elec.visible = auto.visible = true;
      // 协同点：小车运行路径
      const orbit = Math.sin(time) * 5;
      if (animatables.trolley) animatables.trolley.position.x = orbit;
      mech.position.set(orbit, 20, 0);
      elec.position.set(orbit - 1, 20, 0);
      auto.position.set(orbit + 1, 20, 0);
      break;
      
    default:
      mech.visible = elec.visible = auto.visible = false;
  }

  // 标记悬浮效果
  [mech, elec, auto].forEach(m => {
      if (m.visible) {
          m.position.y += Math.sin(time * 3) * 0.02;
          m.scale.setScalar(1 + Math.sin(time * 5) * 0.1);
      }
  });
};
