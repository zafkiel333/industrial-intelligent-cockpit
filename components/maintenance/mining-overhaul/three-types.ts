
import * as THREE from 'three';

export interface OverhaulAnimatables {
  mainChassis?: THREE.Group;    // 底盘主体
  engineUnit?: THREE.Group;     // 发动机单元
  dumpBody?: THREE.Group;       // 货箱单元
  wheelAssemblies?: THREE.Group[]; // 轮组单元
  scanField?: THREE.Mesh;       // 扫描场
  partHighlight?: THREE.PointLight; // 故障部件高亮
}

export type OverhaulStep = 
  | 'INITIAL'       // 初始档案载入
  | 'SCAN'          // 数字化测绘扫描
  | 'EXPLODE'       // 部件解体推演
  | 'REPLACE'       // 核心件换新模拟
  | 'ASSEMBLY'      // 逆向精密重组
  | 'VALIDATION';   // 综合可行性验证
