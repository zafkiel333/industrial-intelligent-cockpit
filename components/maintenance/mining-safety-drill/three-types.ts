
import * as THREE from 'three';

export interface SafetyAnimatables {
  shovelGroup?: THREE.Group;    // 电铲主体
  swingPlatform?: THREE.Group; // 回转平台
  hazardZones?: THREE.Group;   // 危险区域集合
  safeBoundary?: THREE.Mesh;   // 安全边界线
  lotoLocks?: THREE.Group;     // 挂牌锁定点
  // Renamed from scanningPlane to scanningBeam to fix property existence error in SafetyDrillBuilder.ts
  scanningBeam?: THREE.Mesh;   // 空间扫描面
  workerPresence?: THREE.Group; // 模拟人员位置
}

export type DrillPhase = 
  | 'PRE_CHECK'      // 环境预检
  | 'ISOLATION'      // 能量隔离 (LOTO)
  | 'ZONE_SETUP'     // 警戒区布置
  | 'REPAIR_EXEC'    // 维修执行
  | 'EMERGENCY';     // 突发状况模拟

export interface SafetyMetrics {
  gasLevel: number;    // 瓦斯浓度
  stability: number;   // 结构稳定性
  compliance: number;  // 规程合规度
  fatigue: number;     // 疲劳指数
}
