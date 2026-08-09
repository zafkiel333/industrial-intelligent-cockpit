
import * as THREE from 'three';

export interface PumpAnimatables {
  motorRotor?: THREE.Mesh;
  pumpImpellers?: THREE.Group;
  inletValve?: THREE.Group;
  outletValve?: THREE.Group;
  flowParticles?: THREE.Points;
  vibrationRing?: THREE.Mesh;
  heatGlow?: THREE.PointLight;
  cavitationBubbles?: THREE.Points;
  repairMarker?: THREE.Group;
}

export type PumpSimState = 
  | 'STANDBY'        // 待机监测
  | 'CAVITATION'     // 气蚀发生
  | 'BEARING_FAULT'  // 轴承过热
  | 'ISOLATION'      // 系统隔离
  | 'DISASSEMBLY'    // 泵体拆解
  | 'REPLACEMENT'    // 零件更换
  | 'RECOVERY';      // 恢复试运行
