
import * as THREE from 'three';

export interface CollaborativeAnimatables {
  craneGroup?: THREE.Group;
  trolley?: THREE.Group;
  spreader?: THREE.Group;
  teamMarkers?: {
    mech: THREE.Group;  // 机械组标记
    elec: THREE.Group;  // 电气组标记
    auto: THREE.Group;  // 自动化组标记
  };
  powerPath?: THREE.Line; // 电气回路路径
  logicFlow?: THREE.Points; // 逻辑信号粒子
  internalGears?: THREE.Group; // 内部传动件
}

export type CollaborativePhase = 
  | 'SAFETY_LOCK'    // 安全闭锁 (全组配合)
  | 'MECH_DISMANTLE' // 机械拆解 (机械组主导)
  | 'ELEC_TEST'      // 电气测试 (电气组主导)
  | 'AUTO_CALIBRATE' // 自动化校准 (自动化组主导)
  | 'JOINT_VERIFY'   // 联合验收 (协同测试)
  | 'COMPLETED';     // 任务完成
