
import * as THREE from 'three';

export interface GateNode {
  id: string;
  index: number;
  name: string; // e.g., "1号表孔"
  position: [number, number, number];
  opening: number; // 0-100% (Real-time opening)
  targetOpening: number; // Target from instruction
  status: 'static' | 'moving' | 'error';
  flowRate: number; // m3/s
}

export interface ReservoirProps {
  waterLevel: number; // Current water level (relative visual height)
  gates: GateNode[];
  onGateSelect?: (id: string) => void;
  activeGateId?: string | null;
  dischargeIntensity: number; // 0-1 multiplier for particle effects
}
