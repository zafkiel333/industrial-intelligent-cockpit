
export interface SystemNode {
  id: string;
  name: string;
  type: 'source' | 'machine' | 'elec' | 'output';
  risk: number;        // 风险系数 (0-1)
  health: number;      // 健康度 (0-100)
  pos: [number, number, number];
}

export interface PropagationSceneProps {
  nodes: SystemNode[];
  activePropagationPath: string[]; // 正在扩散的路径节点ID
  flowIntensity: number;           // 能量流强度
  isEmergency: boolean;            // 紧急状态触发
  propagationSpeed: number;        // 扩散速度
}
