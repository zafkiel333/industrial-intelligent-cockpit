
import * as THREE from 'three';

export interface ShipLockAnimatables {
  leftGate?: THREE.Group;
  rightGate?: THREE.Group;
  leftCylinder?: THREE.Mesh; // Piston rod
  rightCylinder?: THREE.Mesh;
  waterChamber?: THREE.Mesh;
  waterUpstream?: THREE.Mesh;
  waterDownstream?: THREE.Mesh;
  statusLight?: THREE.PointLight;
  repairDrone?: THREE.Group; // Maintenance drone visualization
  leakSpray?: THREE.Points;   // Visual effect for hydraulic leak
}

export type LockMaintenanceState = 
  | 'MONITORING'    // 正常通航监控
  | 'FAULT_SYNC'    // 故障：人字门不同步
  | 'ISOLATION'     // 停航/隔离液压站
  | 'DIAGNOSIS'     // 诊断/油液分析
  | 'REPAIR_VALVE'  // 更换比例阀
  | 'DEBUGGING'     // 调试/PID参数整定
  | 'RESTORED';     // 恢复运行
