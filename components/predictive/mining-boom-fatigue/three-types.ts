
export interface StrainGauge {
  id: string;
  position: [number, number, number]; // Relative position on the boom
  value: number; // Micro-strain
  label: string;
}

export interface BoomFatigueSceneProps {
  boomAngle: number;    // 动臂角度
  armAngle: number;     // 斗杆角度
  bucketAngle: number;  // 铲斗角度
  stressFactor: number; // 0-1, affects heatmap color intensity
  weldHealth: number;   // 0-100% (Visual crack indication)
  strainGauges: StrainGauge[];
  showStrainSensors: boolean;
  viewMode: 'stress' | 'fatigue' | 'wireframe';
}
