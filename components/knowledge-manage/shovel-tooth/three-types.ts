
import * as THREE from 'three';

export interface ToothAnimatables {
  bucketGroup?: THREE.Group;    // 铲斗整体
  teeth?: THREE.Mesh[];         // 斗齿数组 (用于单独控制颜色/显隐)
  scanLaser?: THREE.Mesh;       // 扫描激光面
  particles?: THREE.Points;     // 挖掘粉尘
  statusMarkers?: THREE.Sprite[]; // 状态标记
}

export type ToothState = 
  | 'SCANNING'       // 正常扫描中
  | 'ANALYZING'      // AI 分析计算中
  | 'MISSING_ALARM'  // 发现脱落 (报警)
  | 'WEAR_WARNING';  // 磨损预警
