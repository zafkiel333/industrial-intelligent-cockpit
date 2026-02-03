
import * as THREE from 'three';

export interface EmergencyAsset {
  id: string;
  name: string;
  type: 'gate' | 'generator' | 'access-road' | 'sensor';
  position: [number, number, number];
  status: 'operational' | 'compromised' | 'active-response';
  load: number; // 0-100%
}

export interface EmergencySceneProps {
  waterLevel: number; // visual height
  rainIntensity: number; // 0-1
  lightningActive: boolean;
  activeAssetId?: string;
  onAssetSelect?: (id: string) => void;
}
