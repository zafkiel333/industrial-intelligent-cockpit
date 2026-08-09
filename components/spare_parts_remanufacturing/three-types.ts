
export interface RemanPartState {
  id: string;
  type: 'piston' | 'turbine' | 'gearbox';
  health: number; // 0-100
  process: 'cleaning' | 'cladding' | 'machining' | 'testing';
}

export interface RemanThreeProps {
  activePart: RemanPartState;
  scanProgress: number; // 0-1 扫描/修复进度
  isRunning: boolean;
}
