
export interface SupplyNode {
  id: string;
  name: string;
  lat: number;
  lon: number;
  riskLevel: 'safe' | 'warning' | 'critical';
  type: 'supplier' | 'port' | 'warehouse';
}

export interface LogisticsRoute {
  id: string;
  from: string; // Node ID
  to: string;   // Node ID
  status: 'active' | 'delayed' | 'blocked';
  load: number; // 0-1 货运量
}

export interface RiskThreeProps {
  nodes: SupplyNode[];
  routes: LogisticsRoute[];
  selectedRegion: string | null;
  onNodeSelect: (id: string) => void;
  globeRotation: boolean;
}
