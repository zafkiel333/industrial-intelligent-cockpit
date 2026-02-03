
export interface HydraulicPart {
  id: string;
  name: string;
  type: 'pump' | 'valve' | 'accumulator' | 'filter' | 'cylinder' | 'tank';
  pressure: number; // MPa
  temperature?: number; // C
  status: 'normal' | 'warning' | 'critical';
}

export interface HydroHydraulicThreeProps {
  parts: HydraulicPart[];
  activeId: string | null;
  onPartSelect: (id: string) => void;
  systemPressure: number; // MPa
  isRunning: boolean;
}
