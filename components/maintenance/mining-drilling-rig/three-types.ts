
import * as THREE from 'three';

export interface DrillRepairAnimatables {
  powerPackGroup?: THREE.Group;
  mainPump?: THREE.Mesh;
  controlValves?: THREE.Group;
  hydraulicHoses?: THREE.Line[];
  rotationHead?: THREE.Group;
  drillBit?: THREE.Mesh;
  leakEffect?: THREE.Points;
  scanningPlane?: THREE.Mesh;
  disassembledPart?: THREE.Group;
}

export type DrillRepairPhase = 
  | 'INITIAL_SCAN'    // 初始诊断扫描
  | 'PRESSURE_RELEASE' // 压力释放与隔离
  | 'VALVE_REMOVAL'   // 比例阀组拆卸
  | 'INTERNAL_CLEAN'  // 内部回路清洗
  | 'CORE_REPAIR'     // 核心动力头修复
  | 'SYSTEM_TEST'     // 系统综合性能测试
  | 'COMPLETE';       // 维护验收归档
