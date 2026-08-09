
import * as THREE from 'three';

export interface HandoverAsset {
  id: string;
  name: string;
  type: 'dam' | 'powerhouse' | 'penstock' | 'gate';
  kksCode: string; // KKS identification system code
  lodLevel: number; // LOD 100 - 500
  handoverStatus: 'pending' | 'processing' | 'completed' | 'error';
  position: [number, number, number];
  rotation?: [number, number, number];
  scale?: [number, number, number];
}

export interface HandoverSceneProps {
  scanProgress: number; // 0 to 1, controls the clipping plane
  assets: HandoverAsset[];
  activeAssetId?: string | null;
  onAssetSelect?: (id: string) => void;
}
