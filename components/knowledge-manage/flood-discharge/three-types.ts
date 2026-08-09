
import * as THREE from 'three';

export interface FloodAnimatables {
  damStructure?: THREE.Mesh;
  spillwaySurface?: THREE.Mesh;
  waterFlowParticles?: THREE.Points;  // The main jet
  mistParticles?: THREE.Points;       // Impact spray
  plungePoolWater?: THREE.Mesh;       // Pool surface
  riverBed?: THREE.Mesh;              // The ground/scour zone
  energyVectors?: THREE.Group;        // Arrows showing force vectors
}

export type FloodSimState = 
  | 'NORMAL'        // Standard discharge
  | 'EXTREME'       // Max flood discharge (High trajectory)
  | 'SCOUR_VIEW'    // Heatmap of riverbed erosion
  | 'ENERGY_VIEW';  // Visualization of energy dissipation
