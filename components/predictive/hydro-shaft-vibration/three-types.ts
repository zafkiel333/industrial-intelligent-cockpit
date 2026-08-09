
export interface ShaftVibrationProps {
  rpm: number;
  // Vibration amplitudes at key points (0-1 scale relative to visual limit)
  vibUpper: number; 
  vibLower: number;
  vibWater: number;
  // Phase angles for the vibration vectors (degrees)
  phaseUpper: number;
  phaseLower: number;
  phaseWater: number;
  // Visual options
  showModeShape?: boolean;
  showCenterline?: boolean;
}
