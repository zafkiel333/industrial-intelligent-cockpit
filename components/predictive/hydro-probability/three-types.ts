
export interface ProbComponent {
  id: string;
  name: string;
  // Weibull parameters for simulation
  beta: number; // Shape parameter (slope)
  eta: number;  // Characteristic life
  baseColor: string;
}

export interface ProbabilitySceneProps {
  timeHorizon: number; // Days into the future (0 to 365+)
  components: ProbComponent[];
  showParticles?: boolean;
}
