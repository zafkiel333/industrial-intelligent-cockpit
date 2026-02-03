
import * as THREE from 'three';

export interface InsulationAnimatables {
  copperStrands?: THREE.Group;    // The conductor core
  insulationLayer?: THREE.Mesh;   // The mica tape layer
  semiConductive?: THREE.Mesh;    // Inner shield
  outerShield?: THREE.Mesh;       // Outer anti-corona
  pdSparks?: THREE.Points;        // Partial discharge events
  electricalTree?: THREE.Group;   // Treeing degradation lines
  thermalHeat?: THREE.PointLight; // Thermal aging glow
}

export type InsulationAgingState = 
  | 'HEALTHY'             // New condition
  | 'INTERNAL_VOID'       // Void discharge (Internal PD)
  | 'SLOT_DISCHARGE'      // Surface discharge
  | 'ELECTRICAL_TREE'     // Advanced breakdown path
  | 'THERMAL_DELAM'       // Overheating delamination
  | 'END_WINDING_VIB';    // Mechanical vibration rubbing
