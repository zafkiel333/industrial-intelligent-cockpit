
export interface GovernorPart {
  id: string;
  name: string;
  type: 'valve' | 'pump' | 'accumulator' | 'sensor' | 'servomotor' | 'tank';
  status: 'normal' | 'warning' | 'critical';
  pressure?: number; // MPa
  position?: number; // % (for valves/servos)
  temperature?: number; // °C
}

export interface GovernorThreeProps {
  parts: GovernorPart[];
  activeId: string | null;
  onPartSelect: (id: string) => void;
  systemPressure: number; // MPa
  servoPosition: number; // 0-100%
  isAutoMode: boolean;
}
