import * as THREE from 'three';

export interface StandardAnimatables {
  mechanismGroup?: THREE.Group; // 导水机构整体
  guideVanes?: THREE.Group[];   // 导叶组
  servomotors?: THREE.Group[];  // 接力器组
  measuringTool?: THREE.Group;  // 塞尺/测量工具
  ghostGuides?: THREE.Group;    // 标准位置幻影
  precisionLines?: THREE.Group; // 精度对齐辅助线
  statusAura?: THREE.Mesh;      // 状态光环
  // Added scanBeam property to fix the error in HydroStandardBuilder.ts
  scanBeam?: THREE.Mesh;
}

export type StandardStep = 
  | 'INIT_CHECK'      // 开工准备与首检
  | 'SHAFT_ALIGN'     // 导叶销轴对中
  | 'CLEARANCE_ADJ'   // 导叶间隙调整
  | 'TORQUE_LOCK'     // 关键螺栓力矩紧固
  | 'SYNC_TEST'       // 接力器同步协调
  | 'FINAL_SIGN';     // 工艺闭环签认
