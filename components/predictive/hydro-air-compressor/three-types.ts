export interface CompressorPart {
  id: string;
  name: string;
  health: number;      // 0-100
  temp: number;        // 实时温度
  riskLevel: 'normal' | 'warning' | 'critical';
}

export interface CompressorSceneProps {
  parts: CompressorPart[];
  motorRpm: number;           // 电机转速
  airFlowIntensity: number;   // 空气流速感 (0-1)
  oilCirculationSpeed: number;// 油液流动感 (0-1)
  compressionRatio: number;   // 压缩比
  viewMode: 'standard' | 'xray' | 'thermal';
  selectedId: string | null;
  onSelect: (id: string) => void;
}