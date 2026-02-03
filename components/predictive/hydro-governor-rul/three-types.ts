
export interface RulComponent {
  id: string;
  name: string;
  rul: number; // Remaining Useful Life in hours or %
  health: number; // 0-100%
  status: 'Good' | 'Warning' | 'Critical';
  position: [number, number, number]; // Base position
  type: 'servo' | 'pump' | 'valve' | 'accumulator' | 'filter';
}

export interface GovernorRulSceneProps {
  components: RulComponent[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  explodeLevel: number; // 0 to 1
}
