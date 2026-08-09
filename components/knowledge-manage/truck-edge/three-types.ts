
import * as THREE from 'three';

export interface TruckEdgeAnimatables {
  truckGroup?: THREE.Group;       // 矿卡主体
  wheels?: THREE.Mesh[];          // 车轮组
  lidarPoints?: THREE.Points;     // 激光雷达点云可视
  radarCone?: THREE.Mesh;         // 毫米波雷达视锥
  obstacle?: THREE.Group;         // 障碍物 (落石/车辆)
  pathLine?: THREE.Line;          // 规划路径
  replanningLine?: THREE.Line;    // 重规划路径 (虚线)
  communicationLink?: THREE.Mesh; // 通讯链路光束
  dustParticles?: THREE.Points;   // 环境扬尘/雾气
  sensorBox?: THREE.Group;        // 传感器集合
}

export type EdgeScenarioState = 
  | 'CRUISING'        // 正常巡航
  | 'OBSTACLE_DETECT' // 障碍物识别
  | 'DECISION_MAKING' // 边缘决策计算 (刹车/绕行)
  | 'REROUTING'       // 路径重规划执行
  | 'COMMS_LOSS'      // 通讯丢失 (盲跑模式)
  | 'EMERGENCY_STOP'; // 紧急制动
