export interface TunnelStatus {
  waterLevel: number; // cm
  humidity: number; // %
  temperature: number; // °C
  intrusionDetected: boolean;
  structuralIntegrity: number; // 0 to 100
  lastInspectionTime: string;
}
