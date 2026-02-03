export interface AuxUnitState {
  id: string;
  name: string;
  status: 'running' | 'standby' | 'fault';
  health: number; // 0-100
  vibration: number; // 0-1 缩放比例
  temperature: number; // 摄氏度
  rpm: number;
}

export interface AuxComparisonSceneProps {
  units: AuxUnitState[];
  selectedUnitId: string | null;
  onSelectUnit: (id: string) => void;
}