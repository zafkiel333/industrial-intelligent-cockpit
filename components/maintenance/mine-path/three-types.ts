
import * as THREE from 'three';

export interface PathAnimatables {
  movingComponent?: THREE.Group; // 待移出的核心部件（如电机）
  pathLine?: THREE.Line;        // 规划的维修轨迹
  obstacles?: THREE.Group;      // 现场障碍物/支架
  collisionHeatmap?: THREE.Group; // 碰撞风险热点
  sweptVolume?: THREE.Group;    // 扫掠体积可视化
  waypointMarkers?: THREE.Group; // 路径关键点
  scannerBeam?: THREE.Mesh;     // 实时间隙扫描激光
}

export type SimPathState = 
  | 'ANALYZING'     // 环境空间扫描
  | 'PLANNING'      // 路径生成中
  | 'EXECUTING'     // 仿真执行
  | 'INTERFERENCE'  // 发生干涉警告
  | 'OPTIMIZING'    // 路径调优中
  | 'FINISH';       // 方案验证通过
