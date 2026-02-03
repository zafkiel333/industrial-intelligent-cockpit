export interface VendorNode {
  id: string;
  name: string;
  tier: 'strategic' | 'core' | 'support'; // 战略 | 核心 | 支持
  score: number; // 0-100
  category: string;
  position: [number, number, number];
}

export interface VendorThreeProps {
  vendors: VendorNode[];
  selectedVendorId: string | null;
  onVendorSelect: (id: string) => void;
}
