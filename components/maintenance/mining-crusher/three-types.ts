
import * as THREE from 'three';

export interface CrusherAnimatables {
  mainFrame?: THREE.Group;    // The static outer frame
  mantleGroup?: THREE.Group;  // The rotating/gyrating inner cone
  upperFrame?: THREE.Group;   // The part that lifts off
  craneHook?: THREE.Group;    // Overhead crane
  laserScanner?: THREE.Group; // NDT Scanner arm
  laserBeam?: THREE.Mesh;     // The beam itself
  crackHighlight?: THREE.Mesh; // Visual representation of the damage
  weldSparks?: THREE.Points;  // Welding particles
  rocks?: THREE.Points;       // Falling rocks
}

export type CrusherSimState = 
  | 'OPERATION'     // 正常破碎作业
  | 'ALARM'         // 振动超标/检测到裂纹
  | 'DISASSEMBLY'   // 拆卸上机架
  | 'NDT_SCAN'      // 无损探伤扫描
  | 'WELDING'       // 自动堆焊修复
  | 'HEAT_TREAT'    // 热处理/应力消除
  | 'REASSEMBLY';   // 回装
