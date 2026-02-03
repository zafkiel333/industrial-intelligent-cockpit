
export interface LifecycleStage {
  id: string;
  label: string;
  status: 'active' | 'completed' | 'pending';
  health: number; // 0-100 at this stage
  timestamp: string;
}

export interface LifecycleThreeProps {
  stages: LifecycleStage[];
  activeStageId: string | null;
  onStageSelect: (id: string) => void;
  speed: number;
}
