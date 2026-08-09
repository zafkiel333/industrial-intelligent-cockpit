
import * as THREE from 'three';

export interface ShearerAnimatables {
  drumGroup?: THREE.Group;        // 螺旋滚筒整体
  picks?: THREE.Mesh[];           // 单个截齿数组
  coalWall?: THREE.Mesh;          // 煤壁
  particles?: THREE.Points;       // 煤尘/碎屑粒子
  forceVectors?: THREE.ArrowHelper[]; // 受力矢量箭头
  impactGlow?: THREE.PointLight;  // 冲击点光效
  scanLaser?: THREE.Mesh;         // 煤岩硬度扫描激光
}

export type CutState = 
  | 'IDLE'          // 空转
  | 'CUTTING'       // 正常截割
  | 'HARD_INCLUSION'// 遇夹矸 (高阻力)
  | 'WEAR_WARN';    // 磨损预警
