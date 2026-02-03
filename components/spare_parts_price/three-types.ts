
export interface SupplierNode {
  id: string;
  name: string;
  price: number;
  score: number; // 0-100 综合评分
  isBest: boolean; // 是否为推荐
  deviation: number; // 价格偏差百分比 -100 to +100
}

export interface PriceThreeProps {
  targetPrice: number;
  suppliers: SupplierNode[];
  onSelect: (id: string) => void;
  isEvaluating: boolean;
}
