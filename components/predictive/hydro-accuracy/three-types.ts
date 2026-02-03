
export interface AccuracySceneProps {
  globalAccuracy: number; // 0-100%
  errorIntensity: number; // 0-1 误差强度
  isAnalyzing: boolean;   // 是否处于扫描模式
  dataDensity: number;    // 0-1 采样点密度
  uncertaintyZones: { x: number, z: number, r: number }[]; // 潜在不稳定区坐标
}
