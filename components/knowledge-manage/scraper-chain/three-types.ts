
import * as THREE from 'three';

export interface ScraperAnimatables {
  sprocketGroup?: THREE.Group;    // 链轮组 (旋转)
  chainLeft?: THREE.Mesh;         // 左链条 (材质颜色变化体现张力)
  chainRight?: THREE.Mesh;        // 右链条
  scrapers?: THREE.Group;         // 刮板 (随链条移动)
  tensionCylLeft?: THREE.Group;   // 左张紧油缸 (伸缩)
  tensionCylRight?: THREE.Group;  // 右张紧油缸 (伸缩)
  tailFrame?: THREE.Group;        // 机尾伸缩框架
  coalParticles?: THREE.Points;   // 煤流粒子
  warningIcon?: THREE.Sprite;     // 报警图标
}

export type ScraperSimState = 
  | 'BALANCED'      // 平衡运行
  | 'UNBALANCED'    // 偏载/张力不均
  | 'ADJUSTING'     // 动态调整中
  | 'SLACK_CHAIN'   // 松链故障
  | 'BROKEN_CHAIN'; // 断链报警
