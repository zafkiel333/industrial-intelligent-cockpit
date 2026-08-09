
import * as THREE from 'three';

export interface CavitationAnimatables {
  runnerGroup?: THREE.Group;      // The entire turbine runner
  blades?: THREE.Mesh[];          // Individual blades (for highlighting)
  cavitationBubbles?: THREE.Points; // Particle system for bubbles
  damageMarkers?: THREE.Group;    // Group of markers showing damage locations
  flowStreamlines?: THREE.LineSegments; // Visualizing water flow path
  erosionHeatmap?: THREE.Mesh;    // Overlay for damage depth visualization
}

export type CavitationSimState = 
  | 'IDLE'          // Rotating slowly
  | 'FLOW_SIM'      // Show water flow and bubble formation
  | 'DAMAGE_MAP'    // Show heat map of erosion
  | 'CASE_FOCUS';   // Focus on a specific case marker
