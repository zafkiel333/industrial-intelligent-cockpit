
import * as THREE from 'three';

export interface UnmannedAnimatables {
  truckBody?: THREE.Group;
  lidarRing?: THREE.Group;
  sensorArrays?: THREE.Group[];
  scanningBeam?: THREE.Mesh;
  dataFlowParticles?: THREE.Points;
  statusAura?: THREE.Mesh;
}

export type UnmannedMaintPhase = 
  | 'AUTONOMOUS_OPS'  // 自动运行状态
  | 'REMOTE_TAKEOVER' // 远程接管
  | 'SENSOR_CALIBRATE'// 传感器标定
  | 'LOGIC_RESET'     // 控制逻辑重置
  | 'DIAGNOSTIC_TEST'; // 综合自检
