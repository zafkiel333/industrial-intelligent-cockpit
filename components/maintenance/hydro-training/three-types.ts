
import * as THREE from 'three';

export interface TrainingAnimatables {
  mainUnit?: THREE.Group;        // 发电机组主体
  innerShaft?: THREE.Mesh;       // 内部轴系
  disassembledParts?: THREE.Group; // 拆解出的零件组
  hologramOverlay?: THREE.Mesh;  // 标准位置全息指引
  toolModel?: THREE.Group;       // 当前握持工具（如百分表/扳手）
  cursorPoint?: THREE.Mesh;      // 瞄准/交互点
  indicatorLight?: THREE.PointLight; // 状态反馈灯
}

export type TrainingModule = 
  | 'COMPONENT_ID'    // 结构识图
  | 'GAP_MEASURE'     // 间隙测量
  | 'BOLT_TORQUE'     // 螺栓紧固
  | 'ROTOR_LIFT'      // 转子起吊
  | 'FAULT_FINDING';  // 故障排查
