
export interface GearComponent {
  id: string;
  name: string;
  type: 'pinion' | 'wheel' | 'bearing';
  wearLevel: number; // 0-100%
  temperature: number; // Celsius
  vibration: number; // mm/s
}

export interface LocoGearboxSceneProps {
  rpm: number;             // Input speed
  torqueLoad: number;      // 0-100%
  oilDebrisDensity: number; // 0-1 (visual particle count)
  viewMode: 'mechanical' | 'stress' | 'particles';
  components: GearComponent[];
  activeComponentId: string | null;
  onComponentSelect: (id: string) => void;
}
