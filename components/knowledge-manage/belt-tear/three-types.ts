
import * as THREE from 'three';

export interface BeltAnimatables {
  beltMesh?: THREE.Mesh;       // 传送带主体
  rollers?: THREE.Group[];     // 托辊组
  tearObject?: THREE.Group;    // 撕裂损伤模型 (随皮带移动)
  laserFan?: THREE.Mesh;       // 线性激光扇面
  cameraCone?: THREE.Mesh;     // 相机视锥
  scannerBar?: THREE.Group;    // 扫描架
  particles?: THREE.Points;    // 煤尘粒子
}

export type DetectionState = 
  | 'SCANNING'       // 正常扫描中
  | 'DETECTED'       // 检测到撕裂
  | 'CAPTURING'      // 抓拍样本入库
  | 'STOPPED';       // 停机检修
