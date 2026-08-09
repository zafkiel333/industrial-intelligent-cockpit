
export interface CoolingPumpProps {
  activePumpId: 1 | 2; // Which pump is running
  flowRate: number; // 0-100%
  vibration: number; // 0-1 intensity
  temperature: number; // Celsius, affects color
  isCavitating: boolean; // Triggers bubbles
  cloggingLevel: number; // 0-1, affects pipe opacity/color
}
