
export interface FaultComponent {
  id: string;
  name: string;
  probability: number; // 0-100% (Failure Probability)
  health: number; // 0-100% (Current Health)
  type: 'winding' | 'core' | 'bushing' | 'oltc' | 'tank';
}

export interface TransformerFaultSceneProps {
  components: FaultComponent[];
  activeComponentId: string | null;
  onSelect: (id: string) => void;
  simulationProgress: number; // 0-1, visualizes Monte Carlo iterations
}
