
export interface LocalizationPart {
  id: string;
  name: string;
  type: 'runner' | 'bearing' | 'governor' | 'valve';
  originalOrigin: string; // 原产国
  domesticProvider: string; // 国产供应商
  matchConfidence: number; // 匹配信心 0-1
  isAnalyzing: boolean;
}

export interface LocalizationThreeProps {
  activePart: LocalizationPart;
  scanProgress: number; // 0-1
  viewMode: 'ghost' | 'standard' | 'xray';
}
