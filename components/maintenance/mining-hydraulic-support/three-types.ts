
import * as THREE from 'three';

export interface HydraulicAnimatables {
  basePlate?: THREE.Mesh;
  canopy?: THREE.Mesh;
  pillars?: THREE.Group[]; // The hydraulic legs
  valveBlock?: THREE.Group;
  hoses?: THREE.Line[];
  leakEffect?: THREE.Points;
  scanBeam?: THREE.Mesh;
  shieldWings?: THREE.Group;
}

export type SupportSimState = 
  | 'STANDBY'         // 待机自检
  | 'LEAK_ALARM'      // 泄压报警
  | 'PRESSURE_RELIEF' // 系统卸压
  | 'VALVE_REPLACE'   // 换向阀更换
  | 'SEAL_REPAIR'     // 柱塞密封修复
  | 'FUNCTION_TEST'   // 功能验证
  | 'COMPLETE';       // 维护完成
