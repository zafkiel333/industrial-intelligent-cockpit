
import * as THREE from 'three';

export interface PilotAnimatables {
  ownShip?: THREE.Group;         // 本船模型
  ghostShip?: THREE.Group;       // 专家/标准轨迹船 (半透明)
  propeller?: THREE.Mesh;        // 螺旋桨
  rudder?: THREE.Mesh;           // 舵叶
  wakeParticles?: THREE.Points;  // 尾迹流
  currentVectors?: THREE.Group;  // 水流矢量箭头
  optimalPathLine?: THREE.Line;  // 最优路径线
  channelBuoys?: THREE.Group;    // 航道浮标组
  bridgeViewCam?: THREE.PerspectiveCamera; // 驾驶台视角摄像机 (Optional ref)
}

export type NavigationScenario = 
  | 'NARROW_BEND'   // 狭窄急弯
  | 'CROSS_CURRENT' // 横流区靠泊
  | 'BRIDGE_ZONE'   // 桥区航行
  | 'FOG_NAVIGATION'; // 雾航
