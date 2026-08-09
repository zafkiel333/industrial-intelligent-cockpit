export type WeatherType = 'clear' | 'rain' | 'storm';

export interface SwitchStationSceneProps {
  weather: WeatherType;
  activeFaultId: string | null; // e.g., 'insulation-flashover', 'mechanical-stuck'
  loadPercentage: number; // 0-100
  gridVoltage: number; // kV
  onComponentClick?: (id: string) => void;
}