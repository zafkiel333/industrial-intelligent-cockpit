
export interface WaterSurgeProps {
  waterLevel: number;      // 实时水位 (0-100)
  surgeRate: number;       // 水位变率 (ΔH/Δt)
  pressureWavePos: number; // 压力波传递位置 (0-1)
  vortexIntensity: number; // 旋涡强度 (0-1)
  isWarning: boolean;      // 风险状态触发
  viewMode: 'topography' | 'schematic' | 'physics';
}
