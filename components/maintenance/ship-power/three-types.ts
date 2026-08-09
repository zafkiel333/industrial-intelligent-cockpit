
import * as THREE from 'three';

export interface ShipPowerAnimatables {
  gen1Rotor?: THREE.Mesh;
  gen2Rotor?: THREE.Mesh;
  msbCabinet?: THREE.Group;
  avrModule?: THREE.Group; // The component to be replaced
  powerFlowLines?: THREE.Points; // Visualizing current flow
  sparks?: THREE.Points; // Fault effect
  warningLight?: THREE.PointLight;
}

export type PowerSimState = 
  | 'NORMAL'        // 正常运行 (Load Sharing)
  | 'FAULT_AVR'     // 励磁异常 (Excitation Loss)
  | 'TRIP'          // 跳闸停机 (Blackout/Partial)
  | 'DIAGNOSIS'     // 故障诊断 (Inspect AVR)
  | 'REPAIR'        // 更换模块 (Replacing AVR)
  | 'SYNC'          // 同步并车 (Synchronizing)
  | 'RECOVERED';    // 恢复正常
