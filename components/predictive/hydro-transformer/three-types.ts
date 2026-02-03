
export interface TransformerComponent {
  id: string;
  name: string;
  temp: number; // Celsius
  load: number; // %
  status: 'normal' | 'warning' | 'critical';
}

export interface TransformerSceneProps {
  oilTemp: number;
  windingTempHV: number; // High Voltage Winding
  windingTempLV: number; // Low Voltage Winding
  oilLevel: number; // %
  isFansRunning: boolean;
  coreVibration: number; // mm/s
  viewMode: 'standard' | 'thermal' | 'internal';
}
