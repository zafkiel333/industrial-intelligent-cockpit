
import * as THREE from 'three';

export interface TailingsAnimatables {
  damSection?: THREE.Mesh;      // 坝体剖面
  waterBody?: THREE.Mesh;       // 库区水体
  saturationZone?: THREE.Mesh;  // 浸润线以下的饱和土体
  phreaticLineCurve?: THREE.Line; // 浸润线曲线
  dryBeachMarker?: THREE.Group; // 干滩长度标注
  sensorPipes?: THREE.Group;    // 测压管群
  rainSystem?: THREE.Points;    // 降雨模拟
  warningPlane?: THREE.Mesh;    // 报警平面
}

export type DamSafetyState = 
  | 'NORMAL'        // 正常运行
  | 'RISING'        // 水位上涨中
  | 'WARNING'       // 干滩不足预警
  | 'CRITICAL'      // 浸润线溢出(管涌风险)
  | 'DRAINING';     // 排渗降准中
