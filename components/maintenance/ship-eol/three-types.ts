
import * as THREE from 'three';

export interface EOLAnimatables {
  engineBlock?: THREE.Group;      // 主机缸体
  crankshaft?: THREE.Mesh;       // 曲轴
  pistonRods?: THREE.Group[];    // 活塞连杆组
  rustPatches?: THREE.Group;     // 动态锈蚀层
  fatigueCracks?: THREE.Group;   // 疲劳裂纹高亮
  thermalCloud?: THREE.Points;   // 热场点云
  scannerBeam?: THREE.Mesh;      // 诊断扫描束
}

export type EOLStrategy = 
  | 'PATCH'         // 临时补修 (维持运行)
  | 'OVERHAUL'      // 中期大修 (延寿)
  | 'RETROFIT'      // 现代化改造 (性能升级)
  | 'DECOMMISSION'; // 停用拆解 (资产处置)

export interface AgingMetrics {
  wearIndex: number;      // 磨损指数 0-100
  thermalStress: number;  // 热应力 MPa
  vibrationRMS: number;   // 振动值 mm/s
  efficiency: number;     // 热效率 %
}
