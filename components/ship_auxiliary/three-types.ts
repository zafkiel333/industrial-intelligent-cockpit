
export interface AuxComponent {
  id: string;
  name: string;
  type: 'separator' | 'heat_exchanger' | 'compressor' | 'pump';
  status: 'online' | 'standby' | 'maintenance';
  vibration: number;
  temperature: number;
  pressure: number;
  healthIndex: number;
}

export interface AuxThreeProps {
  activeUnitId: string | null;
  units: AuxComponent[];
  flowIntensity: number; // 0-1
  onUnitSelect: (id: string) => void;
  viewMode: 'standard' | 'xray' | 'flow';
}
