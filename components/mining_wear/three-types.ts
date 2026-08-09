
export interface WearHotspot {
  id: string;
  position: [number, number, number];
  intensity: number; // 0-1 磨损深度
  temperature: number;
}

export interface MiningWearThreeProps {
  activePartId: string | null;
  scanProgress: number; // 0-1
  isAnalyzing: boolean;
  onNodeClick: (id: string) => void;
  thicknessData: number[]; // 模拟各测点厚度
}
