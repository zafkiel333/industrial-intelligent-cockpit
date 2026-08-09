
export interface KnowledgeNode {
  id: string;
  type: 'core' | 'new' | 'reference';
  position: [number, number, number];
  label: string;
}

export interface KnowledgeThreeProps {
  nodes: KnowledgeNode[];
  isDistilling: boolean;
  onNodeSelect: (id: string) => void;
}
