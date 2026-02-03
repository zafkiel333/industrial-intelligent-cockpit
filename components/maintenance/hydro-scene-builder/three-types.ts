
import * as THREE from 'three';

export interface TwinAnimatables {
  pointCloud?: THREE.Points;    // 激光点云层
  solidMesh?: THREE.Group;      // 高保真模型层
  sensorNodes?: THREE.Group;    // IoT 节点层
  scanningRay?: THREE.Mesh;     // 扫描激光
  flowLines?: THREE.Line[];     // 水流/电能流向
  gridFloor?: THREE.GridHelper; // 施工网格
}

export type TwinLayerType = 'POINT_CLOUD' | 'MESH' | 'SENSOR' | 'FLUID';

export interface BuildProgress {
  capture: number;   // 采集进度
  modeling: number;  // 建模进度
  mapping: number;   // 数据映射进度
  fidelity: number;  // 孪生保真度
}
