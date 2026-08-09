
import * as THREE from 'three';

export interface RemoteFleetNode {
  id: string;
  name: string;
  location: string;
  uplinkSpeed: number; // Mbps
  latency: number; // ms
  status: 'active' | 'warning' | 'standby';
  position: [number, number, number];
}

export interface DataPacket {
  id: string;
  targetNodeId: string;
  progress: number;
}

export interface RemoteOMProps {
  activeNodeId?: string;
  onNodeSelect?: (id: string) => void;
}
