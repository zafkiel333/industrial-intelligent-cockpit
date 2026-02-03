
import * as THREE from 'three';

export interface BasinAnimatables {
  basinFloor?: THREE.Mesh;       // 消力池底板
  scourPits?: THREE.Group;       // 冲刷坑
  waterVolume?: THREE.Mesh;      // 水体
  rovModel?: THREE.Group;        // 水下机器人
  sonarBeams?: THREE.Group;      // 声呐扫描线
  flowParticles?: THREE.Points;  // 水流粒子
}

export type BasinState = 
  | 'SURVEY'      // 声呐测量模式
  | 'CLEANING'    // 表面清理模式
  | 'REPAIRING'   // 浇筑修复模式
  | 'INSPECT';    // 完工验收模式
