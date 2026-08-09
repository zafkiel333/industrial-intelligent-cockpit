
import * as THREE from 'three';

export interface ReturnAnimatables {
  turbineUnit?: THREE.Group;
  rotorCore?: THREE.Mesh;
  guideVanes?: THREE.Group;
  waterHelix?: THREE.Mesh;    // 水流螺旋特效
  syncAura?: THREE.Mesh;     // 并网同步光圈
  excitationGlow?: THREE.PointLight; // 励磁激发光
  dataBeams?: THREE.Points;  // 数据采样粒子
}

export type ReturnPhase = 
  | 'COLD_CHECK'      // 冷态静态校验
  | 'PRESSURE_BUILD'  // 油压系统建立
  | 'SPEED_RAMP'      // 转速爬升
  | 'EXCITATION'      // 励磁参数注入
  | 'GRID_SYNC'       // 并网捕获
  | 'LOAD_RAMP';      // 负荷带载

export interface SyncMetrics {
  frequency: number;   // 频率 (Hz)
  voltage: number;     // 电压 (kV)
  phaseAngle: number;  // 相位角 (deg)
  vibration: number;   // 振动 (mm/s)
}
