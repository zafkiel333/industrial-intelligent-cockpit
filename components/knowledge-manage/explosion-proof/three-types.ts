
import * as THREE from 'three';

export interface ExProofAnimatables {
  cabinetGroup?: THREE.Group;   // 防爆壳体
  doorGroup?: THREE.Group;      // 前门
  breakerInternal?: THREE.Group;// 内部真空断路器
  flamePath?: THREE.Mesh;       // 隔爆面高亮环
  cableIn?: THREE.Mesh;         // 进线电缆
  cableOut?: THREE.Mesh;        // 出线电缆
  currentFlow?: THREE.Points;   // 电流粒子
  arcEffect?: THREE.PointLight; // 故障电弧光效
  statusScreen?: THREE.Mesh;    // 屏幕面板
}

export type ElectricState = 
  | 'NORMAL'        // 正常运行
  | 'OVERLOAD'      // 过载预警 (Heating)
  | 'SHORT_CIRCUIT' // 短路跳闸 (Arcing)
  | 'CALCULATING'   // 参数整定计算中 (Scanning)
  | 'OPEN_INSPECT'; // 开盖检修
