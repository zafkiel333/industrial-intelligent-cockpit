export interface MenuItem {
  id: string;
  label: string;
  icon?: string;
  children?: MenuItem[];
}

export interface ChartDataPoint {
  name: string;
  value: number;
  value2?: number;
  fullMark?: number;
}

export interface EquipmentStatus {
  id: string;
  name: string;
  status: 'normal' | 'warning' | 'critical' | 'offline';
  temperature: number;
  vibration: number;
  efficiency: number;
}