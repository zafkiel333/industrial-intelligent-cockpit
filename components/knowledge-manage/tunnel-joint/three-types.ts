
import * as THREE from 'three';

export interface TunnelAnimatables {
  segment1?: THREE.Group;     // 左侧沉管
  segment2?: THREE.Group;     // 右侧沉管
  ginaSeal?: THREE.Mesh;      // GINA 橡胶止水带
  shearKeys?: THREE.Group;    // 剪力键
  particles?: THREE.Points;   // 水下悬浮物
  waterVolume?: THREE.Mesh;   // 外部水体环境
  stressOverlay?: THREE.Mesh; // 应力热力图覆盖
  scannerLight?: THREE.SpotLight; // 扫描光效
}

export type JointHealthState = 
  | 'HEALTHY'       // 正常
  | 'COMPRESSION'   // 高压缩 (温度升高)
  | 'EXPANSION'     // 张开 (温度降低/收缩)
  | 'LEAK_WARN'     // 渗漏预警
  | 'SHEAR_STRESS'; // 剪切受力 (不均匀沉降)
