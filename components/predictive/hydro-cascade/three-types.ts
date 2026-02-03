
export interface CascadeNode {
  id: string;
  name: string;
  type: 'component' | 'subsystem' | 'system';
  risk: number;        // 0-1 风险值
  status: 'healthy' | 'warning' | 'failed';
  pos: [number, number, number];
}

export interface CascadeLink {
  source: string;
  target: string;
  load: number;        // 0-1 当前载荷占比
  transferRisk: number; // 0-1 传播风险系数
}

export interface CascadeSceneProps {
  nodes: CascadeNode[];
  links: CascadeLink[];
  activePropagationId: string | null; // 当前正在扩散的起始点
  showFlow: boolean;   // 是否显示能流
}
