
import * as THREE from 'three';

export interface CascadeStation {
  id: string;
  name: string;
  type: 'reservoir' | 'run-of-river'; // 水库式 或 径流式
  position: [number, number, number];
  waterLevel: number; // visual height
  maxLevel: number;
  output: number; // MW
  status: 'generating' | 'spilling' | 'stopped';
}

export interface RiverSegment {
  start: [number, number, number];
  end: [number, number, number];
  flowRate: number; // m3/s, controls particle speed
}

export interface CascadeSceneProps {
  activeStationId?: string;
  onStationSelect?: (id: string) => void;
  stations: CascadeStation[];
  globalFlowScale: number; // 0-2, global speed multiplier
}
