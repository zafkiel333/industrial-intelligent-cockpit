
import * as THREE from 'three';

export interface HealthNode {
  id: string;
  name: string;
  type: 'stator' | 'rotor' | 'bearing' | 'runner' | 'shaft' | 'governor';
  healthScore: number; // 0-100
  status: 'healthy' | 'degraded' | 'critical';
  position: [number, number, number];
  explodedPosition: [number, number, number]; // Position when view is exploded
}

export interface HealthSceneProps {
  activeNodeId?: string;
  onNodeSelect?: (id: string) => void;
  isExploded: boolean; // Toggle for exploded view
  visualizationMode: 'health' | 'thermal' | 'stress'; // Color mapping mode
}
