
import * as THREE from 'three';

export interface GateAnimatables {
  gateGroup?: THREE.Group; // The rotating part of the gate
  cylinderRod?: THREE.Mesh; // The moving piston
  cylinderBody?: THREE.Mesh; // The fixed cylinder
  damageDecal?: THREE.Mesh; // Visual representation of the crack/damage
  waterSurface?: THREE.Mesh;
  sparks?: THREE.Points; // Welding sparks
}

export type GateSimState = 
  | 'MONITORING' // Normal operation, sensing stress
  | 'ALARM'      // Crack detected
  | 'DRAIN'      // Lowering water for access
  | 'NDT'        // Non-destructive testing (Scanning)
  | 'WELDING'    // Repairing
  | 'TESTING';   // Function test
