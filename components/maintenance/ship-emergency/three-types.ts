
import * as THREE from 'three';

export interface EmergencyAnimatables {
  shipHull?: THREE.Group;        // 船体整体
  engineSection?: THREE.Group;   // 暴露的机舱截面
  propeller?: THREE.Mesh;        // 螺旋桨
  leakParticles?: THREE.Points;  // 蒸汽/燃油泄漏粒子
  fireLight?: THREE.PointLight;  // 闪烁的故障火光
  scannerRim?: THREE.Mesh;       // 诊断扫描环
  internalPipes?: THREE.Group;   // 内部管路系统
}

export type EmergencyStep = 
  | 'STANDBY'         // 正常航行监测
  | 'ALERT'           // 警报触发（如：主机失稳）
  | 'DIAGNOSIS'       // 远程AI故障定位
  | 'ISOLATION'       // 应急隔离（切断油/气源）
  | 'REPAIR_PROCESS'  // 应急修复执行
  | 'SYNC_TEST'       // 负荷同步测试
  | 'RECOVERED';      // 动力恢复
