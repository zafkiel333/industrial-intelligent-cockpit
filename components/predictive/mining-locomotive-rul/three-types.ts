
export interface RulComponent {
  id: string;
  name: string;
  category: 'bogie' | 'motor' | 'wheel' | 'body' | 'pantograph';
  currentHealth: number; // 0-100
  predictedRul: number; // days
  degradationRate: number; // health loss per month
  position: [number, number, number]; // Offset for exploded view
  scale: [number, number, number];
}

export interface LocoRulSceneProps {
  components: RulComponent[];
  activeComponentId: string | null;
  onSelect: (id: string) => void;
  explodeFactor: number; // 0 to 1
  previewTimeMonth: number; // 0 to 12+ (Future prediction)
}
