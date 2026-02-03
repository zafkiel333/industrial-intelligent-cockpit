
import * as THREE from 'three';

export interface DredgingAnimatables {
  cutterHead?: THREE.Mesh;
  ladderGroup?: THREE.Group;
  hydraulicCylinderBody?: THREE.Mesh;
  hydraulicCylinderRod?: THREE.Mesh;
  hpuUnit?: THREE.Group; // Hydraulic Power Unit
  hpuFan?: THREE.Mesh;
  proportionalValve?: THREE.Mesh; // The component to fix
  fluidParticles?: THREE.Points; // Debris in oil
  mudSpray?: THREE.Points; // Visual effect at cutter
}

export type DredgingSimState = 
  | 'DREDGING'      // Normal operation
  | 'STALL'         // Cutter stalled due to hydraulic failure
  | 'DIAGNOSE'      // Inspecting HPU
  | 'FLUSHING'      // Cleaning oil
  | 'REPLACE_VALVE' // Changing component
  | 'TEST';         // System verification
