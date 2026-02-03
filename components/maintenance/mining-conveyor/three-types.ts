
import * as THREE from 'three';

export interface ConveyorAnimatables {
  beltGroup?: THREE.Group;      // The moving belt segments
  rollers?: THREE.Group[];      // Rotating idlers
  drivePulley?: THREE.Mesh;     // Main drive drum
  tailPulley?: THREE.Mesh;      // Tension drum
  material?: THREE.Points;      // Coal/Ore particles
  vulcanizer?: THREE.Group;     // Repair machine (Vulcanizing press)
  tearMarker?: THREE.Mesh;      // Visual indicator of the tear
  scannerBeam?: THREE.Mesh;     // X-ray/Infrared scanner beam
  lockoutTag?: THREE.Sprite;    // LOTO tag visualization
}

export type ConveyorSimState = 
  | 'RUNNING'        // Normal operation
  | 'FAULT_TEAR'     // Longitudinal tear detected
  | 'EMERGENCY_STOP' // System halted
  | 'LOCKOUT'        // Power isolation (LOTO)
  | 'PREP_SURFACE'   // Cleaning/Stripping damage
  | 'VULCANIZING'    // Heating/Curing repair
  | 'TENSIONING'     // Adjusting belt tension
  | 'TEST_RUN';      // Verification
