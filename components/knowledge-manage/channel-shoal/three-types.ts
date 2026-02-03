
import * as THREE from 'three';

export interface ShoalAnimatables {
  riverBed?: THREE.Mesh;         // 动态河床
  channelPath?: THREE.Line;      // 航道中心线
  dredgerShip?: THREE.Group;     // 疏浚船模型
  sedimentCloud?: THREE.Points;  // 悬浮泥沙粒子
  currentArrows?: THREE.Group;   // 水流矢量
  depthMarkers?: THREE.Group;    // 水深标尺
}

export type ShoalSimMode = 
  | 'EVOLUTION'   // 演变模式 (展示冲淤)
  | 'DREDGING'    // 疏浚模式 (展示施工)
  | 'ANALYSIS';   // 分析模式 (展示剖面)
