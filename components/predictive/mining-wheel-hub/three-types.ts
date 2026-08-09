
export interface GearComponent {
  id: string;
  name: string;
  type: 'sun' | 'planet' | 'ring' | 'bearing';
  health: number; // 0-100
  stress: number; // 0-1
  temperature: number;
}

export interface WheelHubSceneProps {
  rpm: number;             // Input speed
  torque: number;          // Load intensity 0-100
  vibration: number;       // Visual shake amount
  oilLevel: number;        // 0-1
  debrisLevel: number;     // 0-1 (visual particles)
  viewMode: 'solid' | 'stress' | 'exploded';
  components: GearComponent[];
  activeFaultId: string | null;
}
