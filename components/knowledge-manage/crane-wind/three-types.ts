
import * as THREE from 'three';

export interface CraneWindAnimatables {
  craneGroup?: THREE.Group;       // 岸桥整体
  windParticles?: THREE.Points;   // 风场粒子
  railClamps?: THREE.Group;       // 夹轮器
  ironShoes?: THREE.Group;        // 防风铁鞋
  tieDowns?: THREE.Group;         // 防风拉杆
  forceArrows?: THREE.Group;      // 受力矢量箭头
  ground?: THREE.Mesh;            // 地面/轨道
}

export type WindLevelState = 
  | 'LEVEL_0'  // 正常作业 (<15m/s)
  | 'LEVEL_1'  // 阵风防御 (15-20m/s)
  | 'LEVEL_2'  // 大风防御 (20-25m/s)
  | 'LEVEL_3'  // 台风防御 (>25m/s)
  | 'FAILURE'; // 锚定失效模拟
