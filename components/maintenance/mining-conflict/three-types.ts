
import * as THREE from 'three';

export interface ConflictAnimatables {
  mainMachine?: THREE.Group;    // 矿山设备主体
  workZones?: THREE.Group[];   // 不同班组的作业区域
  interferenceRings?: THREE.Group; // 冲突环特效
  logicPathLines?: THREE.Line[]; // 工序逻辑连线
  dataFlowPoints?: THREE.Points; // 数据传输粒子
  conflictLabels?: THREE.Sprite[]; // 空间标注
}

/* Expanded ConflictState to include values used across different maintenance views */
export type ConflictState = 
  | 'ANALYZING'      // 冲突扫描分析
  | 'CONFLICT_FOUND' // 冲突发现 (High Alert)
  | 'RESOLVING'      // AI 算法消解中
  | 'OPTIMIZED'      // 路径优化完成
  | 'SIMULATING'     // 模拟执行
  | 'SCANNING'       // 对应 ANALYZING
  | 'DETECTED'       // 对应 CONFLICT_FOUND
  | 'RECALCULATING'  // 对应 RESOLVING
  | 'RESOLVED';      // 对应 OPTIMIZED

/* Added for MiningProcessConflictView compatibility */
export type ConflictStep = ConflictState;

/* Added for MiningProcessConflictView compatibility */
export interface TaskNode {
  id: string;
  name: string;
  team: string;
  start: number;
  duration: number;
  conflicts: string[];
}

export interface ProcessNode {
  id: string;
  name: string;
  team: 'MECH' | 'ELEC' | 'AUTO' | 'SAFETY';
  duration: number;
  startTime: number;
  dependencies: string[];
  spatialRadius: number;
}
