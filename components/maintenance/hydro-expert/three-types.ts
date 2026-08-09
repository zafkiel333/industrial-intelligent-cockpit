
import * as THREE from 'three';

export interface ExpertAnimatables {
  targetComponent?: THREE.Group; // 目标检修部件（如调速器控制柜内部）
  hologramOverlay?: THREE.Group; // AR全息叠加层
  expertPointer?: THREE.Group;   // 专家远程指针（发光球/射线）
  annotationCircles?: THREE.Mesh[]; // 专家标注圈
  dataFlowLines?: THREE.Points;  // 数据传输粒子流
  statusLight?: THREE.PointLight; // 部件状态指示灯
}

export type ExpertSimStep = 
  | 'CONNECTING'    // 专家连线中
  | 'STREAMING'     // 实时画面与数据回传
  | 'DIAGNOSING'    // 专家诊断/标注中
  | 'GUIDING'       // AR辅助拆解指导
  | 'VERIFYING'     // 修复后参数校验
  | 'COMPLETED';    // 任务闭环
