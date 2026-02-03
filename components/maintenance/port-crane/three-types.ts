
import * as THREE from 'three';

export interface CraneAnimatables {
  gantryGroup?: THREE.Group;
  trolley?: THREE.Group;
  spreader?: THREE.Group;
  container?: THREE.Group;
  cables?: THREE.Line;
  hoistMotor?: THREE.Mesh;
  gearbox?: THREE.Mesh;
  scanLaser?: THREE.Group; // Visual effect for NDT scanning
  statusLight?: THREE.PointLight;
}

export type CraneMaintenanceState = 
  | 'OPERATING'      // 正常作业循环
  | 'FAULT_ALARM'    // 故障报警 (Red flashing)
  | 'LOCKOUT'        // 停机锁定 (Safe mode)
  | 'DIAGNOSIS'      // 扫描/诊断 (Laser scan effect)
  | 'REPAIR_MOTOR'   // 电机/减速箱维修演示
  | 'REPAIR_SPREADER'// 吊具维修演示
  | 'TEST_RUN';      // 试运行
