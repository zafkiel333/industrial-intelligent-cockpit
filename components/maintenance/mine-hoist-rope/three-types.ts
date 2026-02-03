
import * as THREE from 'three';

export interface RopeAnimatables {
  drum?: THREE.Mesh;           // Main Hoist Drum
  sheave?: THREE.Group;        // Headframe Sheave
  cage?: THREE.Group;          // The conveyance
  oldRope?: THREE.Mesh;        // The damaged rope
  newRope?: THREE.Mesh;        // The replacement rope
  scannerRing?: THREE.Group;   // MRT Scanner device
  damageSprite?: THREE.Sprite; // Visual indicator of the fault
  clamps?: THREE.Group;        // Locking clamps for the cage
  auxWinch?: THREE.Group;      // Auxiliary winch for rope changing
}

export type RopeSimState = 
  | 'SCANNING'       // NDT Inspection in progress
  | 'FAULT_LOCATED'  // Damage found, alarm active
  | 'LOCKING'        // Locking cage (Clamping)
  | 'DETACH_OLD'     // Removing old rope
  | 'INSTALL_NEW'    // Threading new rope
  | 'TENSIONING'     // Balancing tension
  | 'COMPLETE';      // Ready
