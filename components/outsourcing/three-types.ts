export interface VendorNode {
  id: string;
  name: string;
  position: [number, number, number];
  status: 'active' | 'idle' | 'warning';
  load: number; // 0-100
}

export interface OutsourcingThreeProps {
  vendors?: VendorNode[];
  activeOrderId?: string;
  onVendorSelect?: (id: string) => void;
}