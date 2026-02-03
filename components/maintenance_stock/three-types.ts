export interface StockLocation {
  id: string;
  rack: number; // 0-2
  level: number; // 0-4
  column: number; // 0-4
  status: 'normal' | 'low' | 'critical' | 'empty';
  partName: string;
}

export interface StockThreeProps {
  locations?: StockLocation[];
  selectedId?: string | null;
  onSelect?: (id: string) => void;
}