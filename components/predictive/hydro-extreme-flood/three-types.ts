
export interface ExtremeFloodProps {
  waterLevelUp: number;     // 上游水位 (m)
  waterLevelDown: number;   // 下游水位 (m)
  waveIntensity: number;    // 波浪强度 (0-1)
  isRaining: boolean;       // 是否降雨
  isStorming: boolean;      // 是否暴雨（雷电效果）
  structuralStress: number; // 结构应力指数 (0-1)
  submergedZones: string[]; // 已淹没区域标识
}
