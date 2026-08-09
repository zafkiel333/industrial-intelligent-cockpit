
export interface BinStatus {
  id: string;
  x: number; // 0-10 列
  y: number; // 0-8 层
  z: number; // 0-1 深度
  type: 'spare-part' | 'empty' | 'critical';
  occupancy: number; // 0-1
}

export interface WarehouseThreeProps {
  bins: BinStatus[];
  stackerPos: { y: number; x: number };
  isMoving: boolean;
  activeId: string | null;
  onBinSelect: (id: string) => void;
}
