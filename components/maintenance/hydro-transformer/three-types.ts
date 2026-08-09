
import * as THREE from 'three';

export interface TransformerAnimatables {
  mainTank?: THREE.Mesh;
  hvBushings?: THREE.Group; // High Voltage Bushings
  lvBushings?: THREE.Group; // Low Voltage Bushings
  coolingFans?: THREE.Group[];
  conservator?: THREE.Mesh; // Oil tank
  coreAssembly?: THREE.Group; // Internal core (visible in repair mode)
  arcs?: THREE.Group; // Fault simulation sparks
}

export type MaintenancePhase = 
  | 'MONITORING'   // 正常/故障监测
  | 'DIAGNOSIS'    // 故障诊断(油样分析)
  | 'ISOLATION'    // 停电隔离
  | 'DRAIN_OIL'    // 排油
  | 'DISMANTLE'    // 拆卸附件
  | 'LIFT_CORE'    // 吊芯检查
  | 'REPAIR'       // 故障修复
  | 'RESTORE';     // 回装注油
