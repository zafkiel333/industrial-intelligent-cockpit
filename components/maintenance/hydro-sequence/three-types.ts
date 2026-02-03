
import * as THREE from 'three';

export interface SequenceAnimatables {
  mainAssembly?: THREE.Group;    // 发电机组主结构
  overheadCrane?: THREE.Group;  // 厂房行车
  sparePart?: THREE.Group;      // 当前移动的备件
  targetSlot?: THREE.Mesh;      // 目标安装位点
  pathGuide?: THREE.Line;       // 吊运引导线
  statusAura?: THREE.Mesh;      // 状态光圈
  toolOverlay?: THREE.Group;    // 辅助测量工具全息投影
}

export type SequencePhase = 
  | 'LOGISTICS'      // 物料出库与转运
  | 'CRANE_PICKUP'   // 行车起吊
  | 'AIR_TRANSPORT'  // 空间避障吊运
  | 'ALIGNMENT'      // 毫米级对位
  | 'FASTENING'      // 标准化紧固
  | 'COMMISSIONING'; // 试运行校验

export interface PartIntel {
  id: string;
  name: string;
  weight: string;
  material: string;
  tolerance: string;
  stock: number;
}
