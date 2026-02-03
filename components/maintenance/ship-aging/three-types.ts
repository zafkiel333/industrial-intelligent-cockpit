
import * as THREE from 'three';

export interface AgingAnimatables {
  mainEngine?: THREE.Group;     // 老旧发动机组
  rustOverlay?: THREE.Group;    // 锈蚀/污垢层
  scanRing?: THREE.Mesh;        // 扫描环
  hotspots?: THREE.Group;       // 故障/疲劳热点
  internalCore?: THREE.Group;   // 内部透视结构
}

export type AssessmentPhase = 
  | 'BASELINE'      // 基准评估
  | 'NDT_SCAN'      // 无损探伤扫描
  | 'STRESS_TEST'   // 应力负荷测试
  | 'REPAIR_SIM'    // 修复方案模拟
  | 'UPGRADE_SIM';  // 升级改造模拟
