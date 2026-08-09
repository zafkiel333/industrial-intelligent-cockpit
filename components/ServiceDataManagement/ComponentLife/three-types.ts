
import * as THREE from 'three';

export interface ComponentLifeNode {
  id: string;
  name: string;
  lifePercent: number; // 0-100
  lastReplacement: string;
  position: [number, number, number];
  status: 'optimal' | 'wearing' | 'critical';
  partNumber: string;
}

export interface ComponentLifeProps {
  activePartId?: string;
  onPartSelect?: (id: string) => void;
}
