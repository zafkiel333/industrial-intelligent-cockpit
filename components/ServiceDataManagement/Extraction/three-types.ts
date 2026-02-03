
import * as THREE from 'three';

export interface ExtractionSceneProps {
  activeAssetId?: string;
  onAssetSelect?: (id: string) => void;
}

export interface ServiceAnchor {
  id: string;
  position: [number, number, number];
  label: string;
  type: 'maintenance' | 'inspection' | 'replacement';
}
