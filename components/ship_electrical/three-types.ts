
export interface ElectricalPart {
  id: string;
  name: string;
  type: 'breaker' | 'busbar' | 'inverter' | 'transformer' | 'module';
  status: 'normal' | 'warning' | 'fault';
  load: number; // 0-1 负荷率
  temp: number; // 摄氏度
  insulation: number; // 绝缘电阻 (MΩ)
}

export interface ElectricalThreeProps {
  parts: ElectricalPart[];
  activePartId: string | null;
  onPartSelect: (id: string) => void;
  isPowerOn: boolean;
  viewMode: 'logical' | 'physical' | 'thermal';
}
