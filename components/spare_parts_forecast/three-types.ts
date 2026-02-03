
export interface ForecastNode {
  id: string;
  name: string;
  probability: number; // 0-1 需求概率
  leadTime: number; // 提前期 (天)
  urgency: 'low' | 'med' | 'high' | 'critical';
  position: [number, number, number];
}

export interface ForecastThreeProps {
  nodes: ForecastNode[];
  activeNodeId: string | null;
  onNodeSelect: (id: string) => void;
  productionIntensity: number; // 生产强度，影响节点动效
}
