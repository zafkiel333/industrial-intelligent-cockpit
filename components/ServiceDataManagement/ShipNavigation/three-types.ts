
import * as THREE from 'three';

export interface NavNode {
  id: string;
  type: 'sensor' | 'vector';
  position: [number, number, number];
  label: string;
  value: string;
  unit?: string;
  vectorDir?: THREE.Vector3; // Direction for vector arrows (wind/current)
  color: string;
}

export interface ShipNavProps {
  heading: number; // 0-360
  speed: number; // knots
  roll: number; // degrees
  pitch: number; // degrees
  rudderAngle: number; // degrees
  activeNodeId?: string;
  onNodeSelect?: (id: string) => void;
}
