
import * as THREE from 'three';

export interface ResistanceAnimatables {
  supportGroup?: THREE.Group;     // 整个支架组
  individualSupports?: THREE.Group[]; // 单个支架数组
  cylinders?: THREE.Mesh[];       // 立柱（用于变色和伸缩）
  canopies?: THREE.Mesh[];        // 顶梁
  bases?: THREE.Mesh[];           // 底座
  coalWall?: THREE.Mesh;          // 煤壁
  pressureIndicators?: THREE.Sprite[]; // 压力数值浮标
}

export type MiningState = 
  | 'MONITORING'    // 实时监测
  | 'WEIGHTING'     // 周期来压 (压力剧增)
  | 'ADVANCING'     // 移架过程
  | 'ANALYSIS';     // 历史回溯
