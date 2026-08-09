
import * as THREE from 'three';
import { ShovelAnimatables, ShovelSimState } from './three-types';

export const initShovelScene = (
  group: THREE.Group, 
  animatables: ShovelAnimatables,
  disposables: { dispose: () => void }[]
) => {
  // --- 工业材质库 ---
  const bodyMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.6, metalness: 0.4 });
  const safetyYellow = new THREE.MeshStandardMaterial({ color: 0xfacc15, roughness: 0.4, metalness: 0.3 });
  const steelMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.3, metalness: 0.7 });
  const darkSteel = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.8 });
  const copperMat = new THREE.MeshStandardMaterial({ color: 0xb45309, roughness: 0.3, metalness: 0.8 });
  const laserMat = new THREE.MeshBasicMaterial({ color: 0x22d3ee, transparent: true, opacity: 0.4 });

  disposables.push(bodyMat, safetyYellow, steelMat, darkSteel, copperMat, laserMat);

  // 1. 下部行走机构 (Lower Propel)
  const chassisGeo = new THREE.BoxGeometry(8, 2, 10);
  disposables.push(chassisGeo);
  const chassis = new THREE.Mesh(chassisGeo, darkSteel);
  group.add(chassis);
  
  // 履带 (Tracks)
  const trackGeo = new THREE.BoxGeometry(1.5, 2.2, 12);
  disposables.push(trackGeo);
  const trackL = new THREE.Mesh(trackGeo, darkSteel);
  trackL.position.set(-4.5, 0, 0);
  const trackR = new THREE.Mesh(trackGeo, darkSteel);
  trackR.position.set(4.5, 0, 0);
  group.add(trackL, trackR);

  // 2. 上部回转平台 (Upper Swing)
  const swingPlatform = new THREE.Group();
  swingPlatform.position.y = 2.5;
  group.add(swingPlatform);
  animatables.swingPlatform = swingPlatform;

  const deckGeo = new THREE.BoxGeometry(9, 1.5, 12);
  const deck = new THREE.Mesh(deckGeo, bodyMat);
  swingPlatform.add(deck);

  const houseGeo = new THREE.BoxGeometry(8, 5, 10);
  houseGeo.translate(0, 3, -1);
  const house = new THREE.Mesh(houseGeo, safetyYellow);
  swingPlatform.add(house);

  // 3. 动臂与推压机构 (Boom & Crowd)
  const boomGroup = new THREE.Group();
  boomGroup.position.set(0, 1, 5); // 动臂根部
  boomGroup.rotation.x = -0.5; // 倾角
  swingPlatform.add(boomGroup);
  animatables.boomGroup = boomGroup;

  const boomMainGeo = new THREE.BoxGeometry(2, 18, 2);
  boomMainGeo.translate(0, 9, 0);
  const boomMain = new THREE.Mesh(boomMainGeo, safetyYellow);
  boomGroup.add(boomMain);

  // 推压机构中心轴 (Crowd Pivot)
  const crowdGroup = new THREE.Group();
  crowdGroup.position.set(0, 9, 1);
  boomGroup.add(crowdGroup);
  animatables.crowdArm = crowdGroup;

  const stickGeo = new THREE.BoxGeometry(1.2, 1, 10);
  stickGeo.translate(0, 0, 4);
  const stick = new THREE.Mesh(stickGeo, steelMat);
  crowdGroup.add(stick);

  // 4. 铲斗 (Dipper)
  const dipperGroup = new THREE.Group();
  dipperGroup.position.set(0, 0, 9);
  crowdGroup.add(dipperGroup);
  animatables.dipperGroup = dipperGroup;

  const dipperGeo = new THREE.BoxGeometry(3, 4, 4);
  dipperGeo.translate(0, -1, 1);
  const dipper = new THREE.Mesh(dipperGeo, darkSteel);
  dipperGroup.add(dipper);
  
  // 斗齿 (Teeth)
  const teethGeo = new THREE.BoxGeometry(3, 0.5, 0.5);
  teethGeo.translate(0, -3, 3);
  const teeth = new THREE.Mesh(teethGeo, steelMat);
  dipperGroup.add(teeth);

  // 5. 减速箱故障点 (Fault Target)
  const boxGeo = new THREE.BoxGeometry(2, 2, 2);
  const faultBox = new THREE.Mesh(boxGeo, new THREE.MeshStandardMaterial({ color: 0x333333 }));
  faultBox.position.set(2, 2, -2); // 机房内部
  house.add(faultBox);
  animatables.driveMotor = faultBox;

  // 6. 钢丝绳 (Ropes)
  const ropePoints = [
    new THREE.Vector3(0, 6, -3), // 卷筒
    new THREE.Vector3(0, 18, 1), // 臂头滑轮
    new THREE.Vector3(0, -1, 10) // 铲斗挂点
  ];
  const ropeGeo = new THREE.BufferGeometry().setFromPoints(ropePoints);
  const ropeMat = new THREE.LineBasicMaterial({ color: 0xffffff });
  disposables.push(ropeGeo, ropeMat);
  const rope = new THREE.Line(ropeGeo, ropeMat);
  swingPlatform.add(rope);
  animatables.hoistCables = rope;
};

export const animateShovelScene = (
  animatables: ShovelAnimatables, 
  state: ShovelSimState,
  time: number
) => {
  if (state === 'STANDBY' || state === 'RELOAD_TEST') {
      const speed = state === 'RELOAD_TEST' ? 2 : 1;
      // 模拟循环挖掘动作
      if (animatables.crowdArm) {
          animatables.crowdArm.rotation.x = -0.4 + Math.sin(time * 0.5 * speed) * 0.5;
          animatables.crowdArm.position.z = 1 + Math.sin(time * 0.5 * speed) * 0.5;
      }
      if (animatables.swingPlatform) {
          animatables.swingPlatform.rotation.y = Math.sin(time * 0.2) * 0.3;
      }
  } 
  else if (state === 'CROWD_STALL') {
      // 故障抖动
      if (animatables.crowdArm) {
          animatables.crowdArm.position.x = Math.sin(time * 60) * 0.05;
      }
      if (animatables.driveMotor) {
          const mat = animatables.driveMotor.material as THREE.MeshStandardMaterial;
          mat.emissive.setHex(0xff0000);
          mat.emissiveIntensity = Math.sin(time * 10) * 0.5 + 0.5;
      }
  }
  else if (state === 'LASER_REPAIR') {
      if (animatables.driveMotor) {
          // 模拟激光修复光束
          animatables.driveMotor.rotation.y += 0.05;
      }
  }
};
