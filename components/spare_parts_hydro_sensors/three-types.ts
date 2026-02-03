
export interface SensorPart {
  id: string;
  name: string;
  type: 'air-gap' | 'vibration' | 'magnetic' | 'temp' | 'pressure';
  status: 'normal' | 'drift' | 'offline';
  position: [number, number, number];
  signalQuality: number; // 0-100%
  lastCalibrated: string;
}

export interface HydroSensorsThreeProps {
  sensors: SensorPart[];
  activeSensorId: string | null;
  onSelect: (id: string) => void;
  isCalibrating: boolean;
}
