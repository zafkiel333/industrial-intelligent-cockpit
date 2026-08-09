
import * as THREE from 'three';

export interface TimelineEvent {
  id: string;
  type: 'start' | 'stop' | 'fault' | 'maintenance';
  label: string;
  timeOffset: number; // 0 to 1 along the spiral
  color: string;
}

export interface HydroLongTermProps {
  timeProgress: number; // 0 (start) to 1 (current/end)
  healthIndex: number; // 0-100
  onEventSelect?: (id: string) => void;
}
