export interface HazardousZoneConfig {
  isAlertActive: boolean;
  intruderDetected: boolean;
  zoneRadius: number;
  thermalIntensity: number; // 0-1
}

export type IntrusionMarker = {
  id: string;
  position: [number, number, number];
  type: 'human' | 'vehicle' | 'object';
  timestamp: number;
};
