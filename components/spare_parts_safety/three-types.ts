export interface SafetyStockThreeProps {
  serviceLevel: number; // 0.85 - 0.999
  variability: number; // 波动率 0-1
  isCalculating: boolean;
  baseColor: string;
}

export interface SimulationNode {
  time: string;
  stock: number;
  safety: number;
  reorder: number;
}