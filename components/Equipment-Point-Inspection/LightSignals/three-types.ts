export interface LightBeaconStatus {
  intensity: number; // 坎德拉 (cd)
  flashPattern: string; // 闪光频率描述
  visibility: number; // 能见距离 (海里 NM)
  colorTemp: number; // 色温 (K)
  isSynchronized: boolean;
  powerSource: 'solar' | 'grid' | 'battery';
}

export interface InspectionNode {
  id: string;
  component: 'lens' | 'lamp' | 'ais_transponder' | 'structure';
  health: number; // 0-100
  lastFault?: string;
  position: [number, number, number];
}
