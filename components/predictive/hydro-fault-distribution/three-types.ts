
export interface UnitPredictionNode {
  id: string;
  type: 'TP' | 'TN' | 'FP' | 'FN'; // True Positive (命中), True Negative (正常), False Positive (误报), False Negative (漏报)
  x: number; // 代表载荷 Load
  y: number; // 代表振动 Vibration
  z: number; // 代表运行时间 Runtime
  value: number; // 异常强度
}

export interface FaultDistSceneProps {
  nodes: UnitPredictionNode[];
  activeFilter: 'all' | 'FP' | 'FN';
  scanProgress: number;
  showGrid: boolean;
}
