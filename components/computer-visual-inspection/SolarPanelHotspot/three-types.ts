export interface HotSpot {
  id: string;
  panelId: string;
  position: [number, number, number]; // Relative to panel
  temperature: number;
  severity: 'low' | 'medium' | 'high';
}

export interface SolarFarmState {
  totalPower: number; // kW
  efficiency: number; // %
  irradiance: number; // W/m2
}
