
import * as THREE from 'three';

export interface DockAnimatables {
  shipGroup?: THREE.Group;      // 船舶整体
  dockGates?: THREE.Group;      // 坞门
  waterSurface?: THREE.Mesh;    // 坞内水面
  keelBlocks?: THREE.Group;     // 底部支撑墩木
  sideShores?: THREE.Group;     // 两侧支撑
  cleanerBot?: THREE.Group;     // 自动清洗机器人
  propellerGroup?: THREE.Group; // 螺旋桨组件
  scanBeam?: THREE.Mesh;        // 测量光束
}

export type DockingPhase = 
  | 'ENTRY'            // 船舶进坞
  | 'BLOCK_POSITION'   // 墩木对位
  | 'DEWATERING'       // 抽水下落
  | 'CLEANING'         // 船体清洗
  | 'MAINTENANCE'      // 附件检修 (螺旋桨/阀箱)
  | 'FLOODING'         // 注水出坞
  | 'COMPLETED';       // 演练完成
