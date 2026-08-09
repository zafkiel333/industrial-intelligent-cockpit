
import * as THREE from 'three';

export interface ReliabilityNode {
  id: string;
  position: [number, number, number];
  stressLevel: number; // 0-1 (应力累积)
  sensorStatus: 'stable' | 'noisy' | 'cleaning';
  label: string;
}

export interface DustVibrationProps {
  activeNodeId?: string;
  vibrationIntensity?: number; // 模拟实时振动反馈对视觉的影响
  onNodeSelect?: (id: string) => void;
}
