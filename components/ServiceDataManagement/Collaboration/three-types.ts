
import * as THREE from 'three';

export interface FaceNode {
  id: string;
  name: string;
  efficiency: number; // 0-100
  status: 'online' | 'warning' | 'idle';
  position: [number, number, number];
  activeTasks: number;
}

export interface ResourceFlow {
  from: string;
  to: string;
  type: 'data' | 'personnel' | 'spare';
  progress: number;
}

export interface MiningCollabProps {
  activeFaceId?: string;
  onFaceSelect?: (id: string) => void;
}
