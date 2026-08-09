
export interface ProcurementNode {
  id: string;
  name: string;
  type: 'supplier' | 'port' | 'warehouse';
  risk: 'low' | 'med' | 'high';
  position: [number, number, number];
}

export interface SupplyRoute {
  id: string;
  from: string;
  to: string;
  status: 'active' | 'delayed' | 'completed';
  progress: number;
}

export interface ProcurementThreeProps {
  nodes: ProcurementNode[];
  routes: SupplyRoute[];
  activeOrderId: string | null;
  onNodeClick: (id: string) => void;
  isSimulating: boolean;
}
