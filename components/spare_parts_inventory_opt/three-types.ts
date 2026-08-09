export interface InventoryNode {
  id: string;
  name: string;
  turnoverRate: number; // 周转率 0-1
  stockHealth: number; // 库存健康度 0-1 (偏离理想值的程度)
  value: number; // 资产价值
  category: 'A' | 'B' | 'C';
  position: [number, number, number];
}

export interface InventoryOptThreeProps {
  items: InventoryNode[];
  activeItemId: string | null;
  onItemSelect: (id: string) => void;
  optimizationMode: boolean;
}