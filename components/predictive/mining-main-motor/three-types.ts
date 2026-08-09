
export interface WindingHealth {
  id: number;
  temp: number;
  discharge: number; // 局部放电强度
  status: 'healthy' | 'warning' | 'critical';
}

export interface MainMotorSceneProps {
  rotationSpeed: number;
  insulationHealth: number; // 0-100
  activePhase: 'A' | 'B' | 'C' | 'all';
  showElectricField: boolean;
  isStressed: boolean;
}
