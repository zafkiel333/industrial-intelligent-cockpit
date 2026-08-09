export interface OilMistState {
  concentration: number; // mg/L
  temperature: number; // Celsius
  status: 'normal' | 'warning' | 'danger';
  hotspots: { x: number; y: number; z: number; temp: number }[];
}
