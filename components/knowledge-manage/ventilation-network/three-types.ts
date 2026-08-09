
import * as THREE from 'three';

export interface VentAnimatables {
  networkGroup?: THREE.Group;    // 整个网络结构
  tubes?: THREE.Mesh[];          // 通风管道
  nodes?: THREE.Mesh[];          // 节点球体
  flowParticles?: THREE.Points;  // 风流粒子
  fans?: THREE.Group[];          // 风机模型
  sensors?: THREE.Sprite[];      // 传感器图标
}

export type SolverState = 
  | 'IDLE'        // 静态拓扑
  | 'SOLVING'     // 解算中 (脉冲特效)
  | 'FLOWING'     // 稳态流动
  | 'REVERSE'     // 反风模拟
  | 'SMOKE_SIM';  // 烟流模拟 (火灾)
