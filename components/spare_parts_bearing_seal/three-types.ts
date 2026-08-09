
export interface BearingPart {
  id: string;
  name: string;
  type: 'outer_ring' | 'inner_ring' | 'roller' | 'cage' | 'seal_lip';
  status: 'normal' | 'wear' | 'pitting' | 'crack' | 'warning';
  temperature: number; // 摄氏度
  vibration: number; // mm/s
}

export interface BearingSealThreeProps {
  parts: BearingPart[];
  activeId: string | null;
  rpm: number;
  explodeLevel: number; // 0-1 爆炸图展开程度
  onSelect: (id: string) => void;
  showOilFilm: boolean; // 是否显示油膜
}
