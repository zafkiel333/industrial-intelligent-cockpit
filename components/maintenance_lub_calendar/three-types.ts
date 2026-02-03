export interface LubPoint {
  id: string;
  machineId: string;
  status: 'pending' | 'injecting' | 'completed' | 'blocked';
  position: [number, number, number]; // Position of the nozzle end
  pipePath: [number, number, number][]; // Control points for the pipe tube
}

export interface LubThreeProps {
  points: LubPoint[];
  activeTaskId: string | null;
  flowSpeed: number; // 0-1 multiplier
}