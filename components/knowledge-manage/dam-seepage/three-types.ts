
import * as THREE from 'three';

export interface SeepageAnimatables {
  damBody?: THREE.Mesh;           // The main dam structure
  waterUpstream?: THREE.Mesh;     // Upstream water body
  thermalPlane?: THREE.Mesh;      // The heatmap visualization slice
  seepageFlow?: THREE.Points;     // Particles representing water flow through dam
  fiberOpticLine?: THREE.Line;    // DTS sensor cable visualization
  leakPoint?: THREE.Mesh;         // Detected anomaly point
  scanGrid?: THREE.GridHelper;    // Calculation grid
}

export type SeepageSimState = 
  | 'IDLE'          // Initial state
  | 'THERMAL_SCAN'  // Visualizing temperature field
  | 'INVERSION'     // Running calculation (visual noise/processing)
  | 'LEAK_DETECT'   // Showing detected anomaly
  | 'RESULT';       // Final stable state with results
