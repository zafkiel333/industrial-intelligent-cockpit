
export interface NavNode {
  id: string;
  name: string;
  type: 'radar' | 'ais' | 'ecdis' | 'gps' | 'gyro';
  status: 'online' | 'warning' | 'fault';
  position: [number, number, number];
  signalStrength: number; // 0-100
}

export interface NavThreeProps {
  nodes: NavNode[];
  activeNodeId: string | null;
  onNodeSelect: (id: string) => void;
  isRadarScanning: boolean;
}
