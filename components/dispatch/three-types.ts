export interface DispatchThreeProps {
  activeMachineId?: string;
  onMachineClick?: (id: string) => void;
  workloadHeat?: number; // 0-1
}