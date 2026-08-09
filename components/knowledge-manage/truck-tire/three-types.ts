
import * as THREE from 'three';

export interface TireAnimatables {
  tireGroup?: THREE.Group;        // 整个轮胎组件
  treadMesh?: THREE.Mesh;         // 胎面（用于变色）
  rimMesh?: THREE.Mesh;           // 轮毂
  roadBed?: THREE.Mesh;           // 路面
  particles?: THREE.Points;       // 扬尘
  heatAura?: THREE.Sprite;        // 热辐射光晕
  wearIndicators?: THREE.Group;   // 磨损指示标记
}

export type RoadSurfaceType = 
  | 'GRAVEL'      // 碎石路 (高磨损)
  | 'HARD_ROCK'   // 硬岩路 (高切割风险)
  | 'MUDDY'       // 泥泞路 (高滚动阻力)
  | 'HAUL_ROAD';  // 标准运输道

export type ViewMode = 
  | 'VISUAL'      // 真实外观
  | 'THERMAL'     // 热力分布
  | 'WEAR_MAP';   // 磨损深度
