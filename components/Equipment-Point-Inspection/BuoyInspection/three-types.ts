export interface BuoySceneConfig {
  pitch: number; // 倾斜角度
  roll: number;
  lightActive: boolean;
  isScanning: boolean;
  alertMarker?: string;
}

export type BuoySensorPoint = {
  id: string;
  name: string;
  status: 'normal' | 'warning' | 'error';
  value: string;
  position: [number, number, number];
};
