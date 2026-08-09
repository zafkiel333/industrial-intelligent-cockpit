
import * as THREE from 'three';

export interface NetworkNode {
  id: string;
  type: 'ship' | 'shore' | 'satellite';
  name: string;
  position: [number, number, number];
  status: 'online' | 'syncing' | 'offline';
  connectionType?: 'VSAT' | '5G' | 'L-Band';
}

export interface DataLink {
  id: string;
  sourceId: string;
  targetId: string; // Usually satellite or shore
  quality: number; // 0-1
  activity: number; // 0-1 (Packet volume)
}

export interface CollaborationSceneProps {
  activeLinkId?: string;
  onLinkSelect?: (id: string) => void;
  globalTraffic?: number; // Visual intensity multiplier
}
