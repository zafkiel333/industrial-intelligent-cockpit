export interface CodingStep {
  id: string;
  label: string;
  active: boolean;
}

export interface StandardCodingThreeProps {
  codingFactor: number; // 0-1 编码完成度
  partType: 'bolt' | 'valve' | 'sensor';
  isProcessing: boolean;
}