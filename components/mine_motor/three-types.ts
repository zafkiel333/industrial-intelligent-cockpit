
export interface PowerComponentNode {
  id: string;
  name: string;
  type: 'motor' | 'inverter_rack' | 'power_module' | 'cooling_fan';
  health: number; // 0-100
  load: number; // 0-1
  temp: number; // Celsius
  position: [number, number, number];
}

export interface MinePowerThreeProps {
  components: PowerComponentNode[];
  activeId: string | null;
  onSelect: (id: string) => void;
  frequency: number; // Hz
  viewMode: 'standard' | 'magnetic' | 'thermal';
}
