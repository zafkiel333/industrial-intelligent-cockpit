
import * as THREE from 'three';

export interface SlopeAnimatables {
  stableBase?: THREE.Mesh;      // 稳定的基岩
  slidingWedge?: THREE.Group;   // 滑动体 (潜在滑坡体)
  waterPlane?: THREE.Mesh;      // 库水位
  rainSystem?: THREE.Points;    // 降雨粒子系统
  phreaticLine?: THREE.Line;    // 浸润线 (Phreatic Line)
  sensorNodes?: THREE.Group;    // 监测点图标
  vectorArrows?: THREE.Group;   // 变形矢量箭头
  slipSurfaceHighlight?: THREE.Mesh; // 滑动面高亮
}

export type SlopeSimState = 
  | 'STABLE'        // 天然稳定状态
  | 'RAINFALL'      // 强降雨入渗
  | 'DRAWDOWN'      // 水位骤降工况
  | 'CREEP'         // 蠕变变形阶段
  | 'SLIDING'       // 剧烈滑动破坏
  | 'STABILIZED';   // 治理后稳定
