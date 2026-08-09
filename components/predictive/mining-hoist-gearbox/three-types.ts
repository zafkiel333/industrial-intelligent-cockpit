
export interface GearState {
  id: string;
  name: string;
  vibrationX: number;
  vibrationY: number;
  temperature: number;
  status: 'normal' | 'pitting' | 'chipped' | 'worn';
}

export interface HoistGearboxSceneProps {
  inputRpm: number;
  gears: GearState[];
  isVibrating: boolean;
  viewMode: 'xray' | 'mechanical' | 'vibration-field';
  activeComponentId: string | null;
}
