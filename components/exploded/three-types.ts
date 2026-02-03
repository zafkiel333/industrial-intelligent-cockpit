export interface ExplodedThreeProps {
  explodeFactor: number; // 0 (合拢) 到 1 (完全展开)
  highlightedPartId?: string | null;
  displayMode: 'solid' | 'wireframe' | 'xray';
  onPartSelect?: (id: string, name: string) => void;
}
