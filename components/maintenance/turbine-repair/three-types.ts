
import * as THREE from 'three';

export interface RepairAnimatables {
  bladeSegment?: THREE.Mesh;
  robotArmGroup?: THREE.Group;
  robotJoint1?: THREE.Group;
  robotJoint2?: THREE.Group;
  robotHead?: THREE.Mesh;
  damagePoints?: THREE.Group; // The pits
  laserBeam?: THREE.Mesh;
  weldSparks?: THREE.Points;
  scanGrid?: THREE.GridHelper;
}

export type RepairStep = 
  | 'SCANNING'   // 3D Laser Scanning
  | 'CLEANING'   // Surface Preparation
  | 'WELDING'    // Laser Cladding / Welding
  | 'GRINDING'   // Profile Restoration
  | 'INSPECT';   // NDT Inspection
