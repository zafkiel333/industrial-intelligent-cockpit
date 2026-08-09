export interface GanttTaskNode {
  id: string;
  name: string;
  startTime: number; // 0-100 scale relative to project start
  duration: number; // scale unit
  lane: number; // 0-4 (Vertical position based on category)
  status: 'completed' | 'in-progress' | 'pending' | 'delayed';
  critical: boolean;
  dependencies: string[]; // IDs of parent tasks
}

export interface GanttThreeProps {
  tasks: GanttTaskNode[];
  progress: number; // 0-100 current time cursor
  onTaskSelect: (id: string) => void;
}