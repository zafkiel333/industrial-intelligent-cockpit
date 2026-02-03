
import * as THREE from 'three';

export interface HydroAnimatables {
  rotorGroup?: THREE.Group;
  upperBracket?: THREE.Group;
  craneHook?: THREE.Group;
  statorGroup?: THREE.Group;
  shaft?: THREE.Mesh;
  bolts?: THREE.Group;
}

export type HydroSimulationStep = 
  | 'IDLE'           // 初始状态
  | 'REMOVE_COVER'   // 拆除风罩
  | 'LOOSEN_BOLTS'   // 拆卸螺栓
  | 'LIFT_BRACKET'   // 吊出上机架
  | 'LIFT_ROTOR'     // 吊出转子
  | 'INSPECT';       // 检修定子
