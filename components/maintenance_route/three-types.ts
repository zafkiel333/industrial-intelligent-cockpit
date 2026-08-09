export interface CheckpointNode {
  id: string;
  name: string;
  position: [number, number, number];
  type: 'critical' | 'routine' | 'start' | 'end';
  status: 'pending' | 'checked' | 'skip';
}

export interface RouteThreeProps {
  checkpoints: CheckpointNode[];
  activeRouteId: string;
  isSimulating: boolean;
  onNodeClick: (id: string) => void;
}