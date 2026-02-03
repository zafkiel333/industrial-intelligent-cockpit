
import * as THREE from 'three';

export interface MillAnimatables {
  millDrum?: THREE.Group;       // 磨机筒体
  chargeGroup?: THREE.Group;    // 介质群（钢球+矿石）
  balls?: THREE.Mesh[];         // 钢球数组
  ores?: THREE.Mesh[];          // 矿石数组
  dustSystem?: THREE.Points;    // 粉尘粒子
  impactSparks?: THREE.Points;  // 冲击火花
  motorShaft?: THREE.Mesh;      // 电机轴
}

export type MillState = 
  | 'IDLE'        // 静止/装料
  | 'CASCADING'   // 泻落状态 (低速)
  | 'CATARACTING' // 抛落状态 (最佳工作转速)
  | 'CENTRIFUGAL';// 离心状态 (超速)
