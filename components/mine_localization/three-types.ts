
export interface LocalizationNode {
  id: string;
  name: string;
  type: 'rotor' | 'bracket' | 'impeller' | 'gears';
  importedHealth: number; // 0-1
  domesticHealth: number; // 0-1
  isSynthesizing: boolean;
  position: [number, number, number];
}

export interface LocalizationForgeProps {
  activeNode: LocalizationNode;
  reconstructionProgress: number; // 0-1
  showXRay: boolean;
  onPartClick: (id: string) => void;
}
