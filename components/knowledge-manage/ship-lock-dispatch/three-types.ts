
import * as THREE from 'three';

export interface DispatchAnimatables {
  locks?: THREE.Group[];        // 梯级船闸组
  vessels?: THREE.Group[];      // 船舶组
  commandBeams?: THREE.Group;   // 指令光束
  dataNodes?: THREE.Points;     // 算法计算节点粒子
  flowArrows?: THREE.Group;     // 水流/通航方向指示
}

export type DispatchAlgorithmMode = 
  | 'EFFICIENCY_FIRST'  // 效率优先 (最短等待)
  | 'WATER_SAVING'      // 节水优先 (同步换水)
  | 'PRIORITY_EXEC'     // 特种/紧急优先
  | 'STOCHASTIC_SIM';   // 随机扰动模拟
