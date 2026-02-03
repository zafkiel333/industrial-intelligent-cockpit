import * as THREE from 'three';

export interface CrossRegionalAnimatables {
  shipModel?: THREE.Group;       // 船舶主体
  satelliteBeams?: THREE.Group;  // 卫星通讯光束
  dataRings?: THREE.Group;       // 数据传输环
  hologramPanels?: THREE.Group;  // 悬浮全息面板
  signalPulse?: THREE.Mesh;      // 信号脉冲波
  globeWireframe?: THREE.Mesh;   // 背景地球线框
  expertBeams?: THREE.Group;     // 专家坐席光束
}

export type CollabStep = 
  | 'SAT_LINK'      // 建立全球卫星链路
  | 'DATA_SYNC'     // 多端数字孪生同步
  | 'MULTI_EXPERT'  // 跨区域多专家会诊
  | 'REMOTE_OPS'    // 远程指令下达与操控
  | 'VAL_CLOSE'     // 结果验证与闭环
