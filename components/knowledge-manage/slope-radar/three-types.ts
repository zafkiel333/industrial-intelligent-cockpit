
import * as THREE from 'three';

export interface RadarAnimatables {
  terrainMesh?: THREE.Mesh;       // 矿山地形 (带热力图)
  radarUnit?: THREE.Group;        // 雷达主机
  radarDish?: THREE.Mesh;         // 雷达天线 (旋转)
  scanFrustum?: THREE.Mesh;       // 扫描视锥
  scanLine?: THREE.Mesh;          // 扫描线激光
  displacementVectors?: THREE.Group; // 位移矢量箭头
  rainSystem?: THREE.Points;      // 降雨模拟
  slideMass?: THREE.Group;        // 潜在滑体 (用于模拟滑坡)
}

export type RadarState = 
  | 'SCANNING'      // 正常巡航扫描
  | 'FOCUS_TRACK'   // 重点区域跟踪
  | 'WARNING'       // 变形预警
  | 'SLIDE_EVENT';  // 滑坡发生模拟
