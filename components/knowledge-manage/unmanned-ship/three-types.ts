
import * as THREE from 'three';

export interface USVAnimatables {
  shipGroup?: THREE.Group;        // 无人船主体
  lidarPoints?: THREE.Points;     // 激光雷达点云
  sonarCone?: THREE.Mesh;         // 声呐探测锥
  pathLines?: THREE.Group;        // 路径规划线集合
  obstacles?: THREE.Group;        // 障碍物集合
  waterGrid?: THREE.GridHelper;   // 数字水面
  targetMarker?: THREE.Mesh;      // 目标点标记
  propellers?: THREE.Group[];     // 推进器
}

export type TrainingPhase = 
  | 'DATA_COLLECTION' // 数据采集回放
  | 'MODEL_TRAINING'  // 模型训练中 (加速模拟)
  | 'VALIDATION'      // 验证测试
  | 'DEPLOYMENT';     // 实船部署
