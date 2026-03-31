export interface SecurityStatus {
  intrusionCount: number;
  unauthorizedMovements: number;
  securityLevel: 'low' | 'medium' | 'high' | 'critical';
  activeSensors: number;
  lastEventTime: string;
  detectedObjects: { type: 'person' | 'vehicle' | 'object'; x: number; y: number; z: number }[];
}
