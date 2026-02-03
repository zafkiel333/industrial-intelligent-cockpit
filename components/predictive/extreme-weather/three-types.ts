
import * as THREE from 'three';

export type WeatherType = 'typhoon' | 'blizzard' | 'sandstorm' | 'heatwave';

export interface WeatherAnimatables {
  equipmentCore?: THREE.Group;
  shieldMesh?: THREE.Mesh;
  particleSystem?: THREE.Points;
  windVectors?: THREE.Group;
  lightningLight?: THREE.PointLight;
  groundPlane?: THREE.Mesh;
}
