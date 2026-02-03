
import * as THREE from 'three';

export interface ComparisonAnimatables {
  mainShaft?: THREE.Group;      // 主轴/核心部件
  bearingUnits?: THREE.Group[]; // 轴承单元组
  oilFlow?: THREE.Points;       // 润滑油流粒子
  scannerGrid?: THREE.Mesh;     // 诊断扫描网格
  ghostComponent?: THREE.Group; // 方案预览全息影
  stressMarkers?: THREE.Group;  // 应力分布标记
  sparkEffect?: THREE.Points;   // 修复/摩擦火花
}

export type MaintenanceStrategy = 
  | 'PATCH'         // 应急贴片修复 (临时方案)
  | 'REPLACE'       // 标准组件置换 (标准方案)
  | 'REUPGRADE'     // 材料/工艺升级 (优化方案)
  | 'DEFERRED';     // 延期监测运行 (保守方案)

export interface SimMetrics {
  cost: number;        // 万元
  downtime: number;    // 小时
  risk: number;        // 0-100
  expectedLife: number;// 月
}
