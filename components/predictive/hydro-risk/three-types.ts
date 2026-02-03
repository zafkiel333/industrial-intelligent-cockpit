
export interface RiskComponent {
  id: string;
  name: string;
  riskLevel: number; // 0-100, 100 is high risk
  explodeOffset: number; // For exploded view animation
}

export interface RiskSceneProps {
  explodeFactor: number; // 0 to 1, controls how much the model is exploded
  components: RiskComponent[];
  onComponentSelect: (id: string) => void;
  activeComponentId: string | null;
}
