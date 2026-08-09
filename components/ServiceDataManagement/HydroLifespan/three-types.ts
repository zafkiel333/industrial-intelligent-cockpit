
import * as THREE from 'three';

export interface AgingPart {
  id: string;
  name: string;
  type: 'stator' | 'rotor' | 'runner' | 'bearing' | 'shaft';
  initialHealth: number; // 0-100
  degradationRate: number; // Health loss per year
  position: [number, number, number];
  currentHealth?: number; // Calculated based on year
}

export interface LifespanSceneProps {
  currentYearOffset: number; // 0 to 20 (years into future)
  activePartId?: string;
  onPartSelect?: (id: string) => void;
}
