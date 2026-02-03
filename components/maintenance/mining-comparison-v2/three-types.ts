
import * as THREE from 'three';

export interface ComparisonSimAnimatables {
  mainShaft?: THREE.Group;
  bearingHousing?: THREE.Mesh;
  internalGears?: THREE.Group;
  faultGlow?: THREE.PointLight;
  laserScanPlane?: THREE.Mesh;
  hologramTemplate?: THREE.Group;
  particles?: THREE.Points;
}

export type MaintenanceScenario = 
  | 'PATCH_REPAIR'     // 局部补焊
  | 'COMPONENT_SWAP'   // 模块化置换
  | 'SYSTEM_UPGRADE'   // 系统性升级
  | 'DEGRADED_RUN';    // 降额运行监控

export interface ScenarioMetrics {
  reliability: number;
  cost: number;
  downtime: number;
  mtbf: number;
}
