
import * as THREE from 'three';

export interface StationAnimatables {
  units?: THREE.Group[];      // G1-G4 机组组
  damWater?: THREE.Mesh;      // 大坝上游水位
  powerHouse?: THREE.Group;   // 厂房结构
  overheadCrane?: THREE.Group; // 桥机
  scaffolds?: THREE.Group[];  // 检修脚手架/围挡
  flowParticles?: THREE.Points; // 发电机组水流粒子
}

export interface UnitStatus {
  id: number;
  mode: 'RUNNING' | 'MAINTENANCE' | 'STANDBY';
  progress: number; // 0-100 检修进度
}

export interface AnnualSimState {
  month: number;
  units: UnitStatus[];
  waterLevel: number; // 模拟水位高度
}
