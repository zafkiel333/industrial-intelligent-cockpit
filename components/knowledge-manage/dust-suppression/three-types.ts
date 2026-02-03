
import * as THREE from 'three';

export interface DustAnimatables {
  stockpiles?: THREE.Group;     // 料堆群
  sprinklers?: THREE.Group[];   // 喷淋枪/炮集合
  dustParticles?: THREE.Points; // 扬尘粒子系统
  mistParticles?: THREE.Points; // 水雾粒子系统
  windIndicator?: THREE.Group;  // 风向标示
  moistureMap?: THREE.Mesh;     // 湿度热力图覆盖层
  boundary?: THREE.Mesh;        // 堆场边界
}

export type SprayStrategy = 
  | 'IDLE'          // 待机监测
  | 'GALE_MODE'     // 大风强力抑尘 (高压直射)
  | 'HUMIDIFY'      // 常规增湿 (细水雾)
  | 'CLEANING'      // 通道清洗 (地面冲洗)
  | 'SMART_TRACK';  // 智能寻源喷洒 (追踪尘源)
