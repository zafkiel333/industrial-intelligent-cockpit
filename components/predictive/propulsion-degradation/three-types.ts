import * as THREE from 'three';

export interface DegradationAnimatables {
  propeller?: THREE.Group;
  shaft?: THREE.Mesh;
  bioFoulingLayer?: THREE.Points; // 模拟生物污损点云
  cavitationField?: THREE.Points; // 模拟气蚀空泡
  thermalGlow?: THREE.PointLight;
  scanningFringe?: THREE.Mesh;
}

export type DegradationPhase = 'incubation' | 'steady' | 'accelerated' | 'critical';