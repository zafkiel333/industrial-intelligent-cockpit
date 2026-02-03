
export interface UnitGlobalState {
  id: string;
  name: string;
  health: number;      // 0-100
  load: number;        // 0-100%
  efficiency: number;  // 0-100%
  status: 'normal' | 'warning' | 'critical' | 'offline';
  position: [number, number, number];
}

export interface CompEvalSceneProps {
  units: UnitGlobalState[];
  selectedUnitId: string | null;
  onUnitSelect: (id: string) => void;
  globalFlowIntensity: number; // 全局能量流强度
  showRiskZones: boolean;      // 是否显示风险辐射区
}
