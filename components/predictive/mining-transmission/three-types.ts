
export interface ClutchStatus {
  id: string;
  name: string;
  pressure: number; // bar
  isEngaged: boolean;
  wear: number; // 0-100%
  temp: number; // Celsius
}

export interface TransmissionSceneProps {
  inputRpm: number;
  outputRpm: number;
  currentGear: number; // 1-6
  clutches: ClutchStatus[];
  oilTemp: number;
  vibrationLevel: number; // 0-1
  viewMode: 'solid' | 'transparent' | 'thermal';
}
