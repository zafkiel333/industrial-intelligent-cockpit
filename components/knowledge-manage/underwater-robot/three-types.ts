
import * as THREE from 'three';

export interface RobotAnimatables {
  rovGroup?: THREE.Group;        // The robot itself
  propellers?: THREE.Mesh[];     // Rotating props
  spotlights?: THREE.SpotLight[];// Main lights
  tether?: THREE.Line;           // Umbilical cable
  scanCone?: THREE.Mesh;         // Visual sonar cone
  particles?: THREE.Points;      // Floating debris/plankton
  bubbles?: THREE.Points;        // Exhaust/cavitation bubbles
}

export type RobotSimState = 
  | 'IDLE'          // Hovering
  | 'DIVING'        // Descending
  | 'SCANNING'      // Active scanning (lights/laser on)
  | 'INSPECTING'    // Close-up look
  | 'ASCENDING';    // Returning to surface
