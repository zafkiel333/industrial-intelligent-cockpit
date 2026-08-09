
import * as THREE from 'three';

export interface IncidentNode {
  id: string;
  name: string;
  status: 'critical' | 'repairing' | 'resolved';
  position: [number, number, number];
  ticketCount: number;
}

export interface EmergencyRepairProps {
  activeIncidentId?: string;
  onIncidentSelect?: (id: string) => void;
}
