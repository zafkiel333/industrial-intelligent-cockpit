
import * as THREE from 'three';

export interface JointAnimatables {
  mainAssembly?: THREE.Group;    // 主设备集合
  systemA_Node?: THREE.Group;   // 动力系统节点
  systemB_Node?: THREE.Group;   // 调控系统节点
  systemC_Node?: THREE.Group;   // 执行机构节点
  dataFlowLines?: THREE.Line[];  // 跨系统数据流
  logicLinkParticles?: THREE.Points; // 逻辑耦合粒子
  hologramRings?: THREE.Group;   // 状态光环
  scanningField?: THREE.Mesh;    // 全域扫描面
}

export type JointScenario = 
  | 'POWER_SYNC'      // 动力系统相位同步
  | 'HYDRAULIC_BAL'   // 液压系统跨区平衡
  | 'LOGIC_OVERRIDE'  // 控制逻辑紧急接管
  | 'MAINT_COLLAB';   // 跨工种联合检修

export interface JointMetrics {
  syncRate: number;      // 协同一致率
  latency: number;       // 数据延迟
  conflictIndex: number; // 冲突指数
  stability: number;     // 物理稳定性
}
