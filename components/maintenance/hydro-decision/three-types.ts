
import * as THREE from 'three';

export interface DecisionAnimatables {
  mainShaft?: THREE.Mesh;       // 主轴
  runnerGroup?: THREE.Group;    // 转轮组
  statorShell?: THREE.Mesh;     // 定子外壳（透明化）
  faultHotspot?: THREE.Group;   // 故障热点标记
  vibrationWaves?: THREE.Line[]; // 振动波纹视觉化
  sensorNodes?: THREE.Group;    // 传感器节点
  waterFlow?: THREE.Points;     // 内部水流粒子
}

export type DecisionStep = 
  | 'NORMAL'        // 正常运行
  | 'ABNORMAL'      // 异常触发（报警）
  | 'DIAGNOSING'    // AI诊断中（扫描动画）
  | 'DECIDING'      // 决策路径选择
  | 'SIMULATING';   // 方案仿真执行
