
import * as THREE from 'three';

export interface EngineAnimatables {
  engineBlock?: THREE.Group;    // 发动机主缸体
  crankshaft?: THREE.Group;    // 曲轴组件
  pistons?: THREE.Group[];     // 活塞组
  turbocharger?: THREE.Group;  // 涡轮增压器
  radiatorFans?: THREE.Group[]; // 冷却风扇
  fuelLines?: THREE.Points;    // 燃油喷射粒子
  heatGlow?: THREE.PointLight; // 热点光效
  laserScan?: THREE.Mesh;      // 测量激光
  explodedParts?: THREE.Group; // 拆解零件组
}

export type EngineRepairPhase = 
  | 'STANDBY'         // 正常运行监测
  | 'THERMAL_FAILURE' // 散热系统故障报警
  | 'TURBO_STALL'     // 增压器喘振模拟
  | 'OIL_ANALYSIS'    // 滑油光谱分析诊断
  | 'DISASSEMBLY'     // 缸盖与附件拆解
  | 'CORE_REPAIR'     // 活塞连杆组检修
  | 'COLD_START';     // 维修后冷启验证
