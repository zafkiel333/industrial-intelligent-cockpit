
export interface FaultNode {
  id: string;
  position: [number, number, number];
  clusterId: number;
  similarity: number; // 0-1
  label: string;
}

export interface RepeatThreeProps {
  nodes: FaultNode[];
  activeClusterId?: number | null;
  onNodeSelect: (id: string) => void;
  isAnalyzing: boolean;
}
