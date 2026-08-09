
import * as THREE from 'three';

export interface RiskVectorNode {
  id: string;
  name: string;
  stressType: 'thermal' | 'pressure' | 'vibration' | 'chemical';
  intensity: number; // 0-100
  position: [number, number, number];
  status: 'monitoring' | 'breached' | 'suppressed';
}

export interface SafetyAegisProps {
  activeNodeId?: string;
  onNodeSelect?: (id: string) => void;
  globalStressIndex: number;
}
