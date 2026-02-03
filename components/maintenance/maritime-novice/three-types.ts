
import * as THREE from 'three';

export interface NoviceAnimatables {
  mainModel?: THREE.Group;        // 核心设备（泵/阀）
  disassembledParts?: THREE.Group; // 已拆下的零件
  activeHighlight?: THREE.Mesh;   // 步骤引导高亮
  toolModel?: THREE.Group;        // 虚拟工具投影
  instructionMarker?: THREE.Sprite; // 空间标注点
  hudScanLine?: THREE.Mesh;       // HUD扫描线
}

export type TrainingPhase = 
  | 'SAFETY_CHECK'   // 安全确认（LOTO）
  | 'TOOL_SELECT'    // 工具选型练习
  | 'DISASSEMBLY'    // 标准化拆解动作
  | 'PART_IDENTIFY'  // 零件识图
  | 'REASSEMBLY'     // 逆向组装训练
  | 'VERIFICATION';  // 完工测试
