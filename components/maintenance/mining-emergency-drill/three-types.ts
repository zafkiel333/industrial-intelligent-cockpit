
import * as THREE from 'three';

export interface EmergencyDrillAnimatables {
  mainMachine?: THREE.Group;    // 主设备（如大型提升机/破碎机）
  rotatingPart?: THREE.Mesh;    // 旋转部件
  faultSparks?: THREE.Points;   // 故障火花
  emergencyLight?: THREE.PointLight; // 应急红光
  securityZone?: THREE.Mesh;    // 警戒区边界
  toolDrone?: THREE.Group;      // 应急运载无人机
}

export type DrillStep = 
  | 'STANDBY'         // 待命状态
  | 'INCIDENT_TRIGGER'// 突发故障（瞬间停机）
  | 'SITE_CONTAINMENT'// 现场警戒与隔离
  | 'RAPID_DIAGNOSIS' // 快速故障扫描
  | 'EMERGENCY_REPAIR'// 应急抢修执行
  | 'RESTORE_TEST';   // 恢复与负载测试
