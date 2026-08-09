export interface EnergyGridConfig {
  loadIntensity: number; // 0-1
  isEmergency: boolean;
  activeLines: string[];
}

export type PowerNode = {
  id: string;
  type: 'transformer' | 'capacitor' | 'switchgear';
  temp: number;
  load: number;
  position: [number, number, number];
};
