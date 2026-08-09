
import * as THREE from 'three';

export interface MaintenanceStageNode {
  id: string;
  name: string;
  status: 'planning' | 'executing' | 'auditing' | 'closed';
  position: [number, number, number];
  progress: number; // 0-100
  taskCount: number;
}

export interface DataPulse {
  id: string;
  fromNodeId: string;
  toNodeId: string;
  progress: number;
}

export interface MaintenancePlanProps {
  activeStageId?: string;
  onStageSelect?: (id: string) => void;
}
