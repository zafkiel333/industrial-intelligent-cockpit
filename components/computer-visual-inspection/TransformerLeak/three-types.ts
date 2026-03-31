export interface LeakPoint {
  id: string;
  position: [number, number, number];
  severity: 'low' | 'medium' | 'high';
  temperature: number;
}

export interface TransformerState {
  load: number;
  oilTemp: number;
  ambientTemp: number;
}
