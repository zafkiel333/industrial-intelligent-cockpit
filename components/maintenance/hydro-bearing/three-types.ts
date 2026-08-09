
import * as THREE from 'three';

export interface BearingAnimatables {
  shaft?: THREE.Mesh;
  runnerPlate?: THREE.Mesh;
  padsGroup?: THREE.Group; // The stationary pads
  oilSurface?: THREE.Mesh;
  craneHook?: THREE.Group; // For replacement animation
  heatTips?: THREE.Sprite[]; // Hotspot indicators
}

export type SimPhase = 
  | 'OPERATION'    // Normal running, accumulating wear
  | 'DEGRADED'     // High vibration/temp warning
  | 'JACKING'      // Jacking up the rotor (maintenance start)
  | 'SWAP_PADS'    // Removing old pads, inserting new
  | 'RESET';       // Back to normal
