
import * as THREE from 'three';

export interface ShovelAnimatables {
  mainChassis?: THREE.Group;    // 底盘与履带
  swingPlatform?: THREE.Group; // 回转平台
  boomGroup?: THREE.Group;     // 动臂
  crowdArm?: THREE.Group;      // 推压臂
  dipperGroup?: THREE.Group;   // 铲斗
  hoistCables?: THREE.Line;    // 起升钢丝绳
  driveMotor?: THREE.Mesh;     // 推压电机
  gearboxInternal?: THREE.Group; // 减速箱内部齿轮
  faultHighlight?: THREE.Mesh;  // 故障区域高亮
  sparkEffect?: THREE.Points;   // 修复火花
}

export type ShovelSimState = 
  | 'STANDBY'         // 待机监测
  | 'CROWD_STALL'     // 推压机构卡涩故障
  | 'LOTO_PROCEDURE'  // 挂牌锁闭程序
  | 'HOOD_REMOVAL'    // 机房盖板拆卸
  | 'GEAR_INSPECT'    // 齿轮啮合检查
  | 'LASER_REPAIR'    // 激光熔覆修复
  | 'RELOAD_TEST';    // 负荷试运行验收
