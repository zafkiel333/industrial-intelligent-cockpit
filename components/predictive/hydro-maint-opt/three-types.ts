
export interface MaintTaskNode {
  id: string;
  name: string;
  part: 'stator' | 'rotor' | 'runner' | 'bearing' | 'aux';
  urgency: number; // 0-1
  duration: number; // hours
  status: 'optimized' | 'skipped' | 'standard';
  position: [number, number, number];
}

export interface MaintOptSceneProps {
  tasks: MaintTaskNode[];
  optimizationFactor: number; // 0-1, 1 为完全优化
  selectedTaskId: string | null;
  onTaskClick: (id: string) => void;
  showLogicFlow: boolean;
}
