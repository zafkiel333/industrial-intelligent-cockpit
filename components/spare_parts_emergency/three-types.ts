
export interface GeoNode {
  id: string;
  type: 'warehouse' | 'incident' | 'transport';
  position: [number, number, number];
  status: 'idle' | 'active' | 'critical';
  label?: string;
}

export interface SupplyRoute {
  id: string;
  from: string; // Node ID
  to: string;   // Node ID
  progress: number; // 0-1
  mode: 'drone' | 'truck';
}

export interface EmergencyThreeProps {
  nodes: GeoNode[];
  routes: SupplyRoute[];
  activeIncidentId: string | null;
  onNodeSelect: (id: string) => void;
  radarScanning: boolean;
}
