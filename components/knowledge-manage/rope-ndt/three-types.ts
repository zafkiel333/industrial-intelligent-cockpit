
import * as THREE from 'three';

export interface RopeNDTAnimatables {
  ropeGroup?: THREE.Group;       // 钢丝绳整体
  strands?: THREE.Mesh[];        // 股绳列表
  scannerRing?: THREE.Group;     // 探伤仪探头环
  sensorLights?: THREE.PointLight[]; // 传感器指示灯
  defectMarker?: THREE.Group;    // 缺陷标记（高亮显示损伤部位）
  magneticField?: THREE.Points;  // 磁力线粒子效果
}

export type DefectType = 
  | 'BROKEN_WIRE'  // 断丝
  | 'ABRASION'     // 磨损
  | 'CORROSION'    // 锈蚀
  | 'FATIGUE'      // 疲劳
  | 'NORMAL';      // 正常

export interface RopeSimState {
  defectType: DefectType;
  scanning: boolean;     // 是否正在扫描
  scanProgress: number;  // 0-1 扫描进度
}
