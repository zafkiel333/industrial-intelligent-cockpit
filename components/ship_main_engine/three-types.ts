
export interface EngineComponent {
  id: string;
  name: string;
  type: 'piston' | 'cylinder_head' | 'liner' | 'turbocharger' | 'fuel_injector';
  health: number; // 0-100
  temp: number;
  status: 'normal' | 'warning' | 'critical';
  position: [number, number, number];
}

export interface ShipEngineThreeProps {
  components: EngineComponent[];
  activeComponentId: string | null;
  onComponentClick: (id: string) => void;
  isRunning: boolean;
  showThermal: boolean;
  explodeLevel: number;
}
