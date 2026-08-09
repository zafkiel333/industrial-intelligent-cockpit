
import * as THREE from 'three';

export interface VendorNode {
  id: string;
  name: string;
  protocol: string;
  dataIntegrity: number; // 0-100
  color: string;
  position: [number, number, number];
  status: 'connected' | 'syncing' | 'error';
}

export interface MultiVendorProps {
  activeVendorId?: string;
  onVendorSelect?: (id: string) => void;
}
