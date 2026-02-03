
import * as THREE from 'three';

export interface LifecycleNode {
  id: string;
  name: string;
  type: 'structure' | 'machinery' | 'outfitting';
  installYear: number;
  lifespan: number;
  position: [number, number, number];
  wearRate: number; // 0-1 per year
}

export interface CrossCycleSceneProps {
  currentYear: number; // 0 to 30+
  showRetrofit: boolean; // Toggle to show potential upgrades
  onNodeSelect?: (id: string) => void;
}
