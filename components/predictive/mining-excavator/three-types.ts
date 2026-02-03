
export interface ExcavatorComponent {
  id: string;
  name: string;
  health: number;      // 0-100
  riskLevel: 'normal' | 'warning' | 'critical';
  temperature: number;
}

export interface ExcavatorSceneProps {
  components: ExcavatorComponent[];
  boomAngle: number;    // 动臂角度
  armAngle: number;     // 斗杆角度
  bucketAngle: number;  // 铲斗角度
  swingAngle: number;   // 回转角度
  oilFlowIntensity: number; // 液压油流速感 (0-1)
  viewMode: 'structural' | 'hydraulic' | 'xray';
  selectedId: string | null;
  onSelect: (id: string) => void;
}
