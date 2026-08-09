
import * as THREE from 'three';

export interface FishPassageAnimatables {
  fishLadderMesh?: THREE.Mesh;    // 鱼道主体
  waterFlow?: THREE.Points;       // 流场粒子
  fishPaths?: THREE.Group;        // 鱼类游径线
  gateActuators?: THREE.Group[];  // 闸门驱动器
  sensorGlows?: THREE.Group;      // 传感器工作指示
  fishEntities?: THREE.Group;     // 鱼类个体模拟
}

export type FishPassageState = 
  | 'MONITORING'  // 实时监测
  | 'PEAK_SEASON' // 洄游高峰期
  | 'MAINTENANCE' // 设施维护
  | 'ALARM';       // 效能预警
