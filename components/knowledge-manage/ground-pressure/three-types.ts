
import * as THREE from 'three';

export interface GroundPressureAnimatables {
  tunnelMesh?: THREE.Mesh;       // 巷道围岩模型
  boltGroup?: THREE.Group;       // 锚杆支护群
  stressMap?: THREE.Mesh;        // 应力云图覆盖层
  microSeismicPoints?: THREE.Points; // 微震事件点云
  sensorNodes?: THREE.Group;     // 传感器节点
  fractureLines?: THREE.Group;   // 裂隙扩展线
  warningLight?: THREE.PointLight; // 报警光效
}

export type PressureSimState = 
  | 'MONITORING'    // 常态监测 (平静)
  | 'STRESS_CONC'   // 应力集中 (颜色变红，微震增加)
  | 'PRECURSOR'     // 前兆显现 (频次剧增，能量聚集)
  | 'BURST_EVENT'   // 冲击发生 (震动，破碎，红光闪烁)
  | 'ANALYSIS';     // 静态分析模式
