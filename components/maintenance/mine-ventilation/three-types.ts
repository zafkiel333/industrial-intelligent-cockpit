
import * as THREE from 'three';

export interface VentilationAnimatables {
  fanRotor?: THREE.Group;        // Rotating blades assembly
  motorShaft?: THREE.Mesh;       // Shaft connection
  airParticles?: THREE.Points;   // Airflow visualization
  dampers?: THREE.Group;         // Guide vanes / Dampers
  casingTop?: THREE.Group;       // Removable top casing
  vibrationIcon?: THREE.Sprite;  // Alert indicator
  diffuser?: THREE.Mesh;         // The output cone
  worker?: THREE.Group;          // Simulated maintenance worker (simplified)
}

export type VentilationSimState = 
  | 'RUNNING'        // Normal ventilation (Positive pressure)
  | 'SURGE_ALARM'    // Aerodynamic instability (Stall/Surge)
  | 'STOP_BRAKE'     // Coasting down to stop
  | 'OPEN_CASING'    // Disassembly for access
  | 'BLADE_REPAIR'   // Blade maintenance
  | 'CLOSE_TEST'     // Reassembly and testing
  | 'REVERSE_WIND';  // Reverse flow mode (Emergency)
