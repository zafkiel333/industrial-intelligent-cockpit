
import * as THREE from 'three';

export interface MarineAnimatables {
  engineBlock?: THREE.Group;
  cylinderHead?: THREE.Group;
  pistonGroup?: THREE.Group;
  craneHook?: THREE.Group;
  bolts?: THREE.Group;
  hydraulicJacks?: THREE.Group;
  tools?: THREE.Group;
}

export type MaintenanceStep = 
  | 'PREP'            // 盘车锁定 & 准备
  | 'MOUNT_JACKS'     // 安装液压拉伸器
  | 'LOOSEN_BOLTS'    // 松开缸盖螺栓
  | 'LIFT_HEAD'       // 吊离缸盖
  | 'LIFT_PISTON'     // 吊出活塞连杆
  | 'MEASURE'         // 缸套测量
  | 'FINISH';         // 结束/回装
