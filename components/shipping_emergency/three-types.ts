
export interface ShippingNode {
  id: string;
  name: string;
  type: 'ship' | 'hub' | 'drone';
  position: [number, number, number];
  status: 'active' | 'warning' | 'completed';
}

export interface ShippingRoute {
  id: string;
  from: string;
  to: string;
  progress: number; // 0-1
  type: 'air' | 'sea';
}

export interface ShippingEmergencyThreeProps {
  nodes: ShippingNode[];
  routes: ShippingRoute[];
  activeShipId: string | null;
  onNodeSelect: (id: string) => void;
  seaState: number; // 0-1 影响波浪抖动
}
