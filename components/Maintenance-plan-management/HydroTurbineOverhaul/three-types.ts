import * as THREE from 'three';

export interface HydroTurbineOverhaulProps {
  speed?: number;
  status?: string; // e.g., '运行中', '待机', '检修中', '故障'
  // Add other relevant props for 3D visualization
  // For example, if you want to control rotation or specific parts
  rotationY?: number;
}

export interface SceneState {
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  renderer: THREE.WebGLRenderer;
  controls: any; // OrbitControls or similar
  turbineMesh?: THREE.Mesh;
  rotorMesh?: THREE.Mesh;
  // Add other relevant THREE objects
}
