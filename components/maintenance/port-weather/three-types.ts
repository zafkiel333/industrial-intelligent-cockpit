
import * as THREE from 'three';

export type WeatherType = 'CLEAR' | 'RAIN' | 'FOG' | 'STORM' | 'NIGHT';

export interface WeatherAnimatables {
  craneGroup?: THREE.Group;
  rainParticles?: THREE.Points;
  fogMaterial?: THREE.FogExp2;
  statusLight?: THREE.PointLight;
  windVanes?: THREE.Group[];
  droneGroup?: THREE.Group;
}

export interface WeatherMetrics {
  windSpeed: number;    // m/s
  visibility: number;   // m
  precipitation: number;// mm/h
  lux: number;          // lx
}
