
export interface DowntimeNode {
  id: string;
  code: string;
  category: 'mechanical' | 'electrical' | 'operational' | 'external';
  duration: number; // 分钟
  frequency: number;
  position: [number, number, number];
}

export interface DowntimeThreeProps {
  nodes: DowntimeNode[];
  activeCategoryId: string | null;
  onNodeSelect: (id: string) => void;
  isCalculating: boolean;
}
