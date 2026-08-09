
export interface PumpBearingSceneProps {
  rpm: number;
  bearingTempUpper: number; // Celsius
  bearingTempLower: number; // Celsius
  impellerWear: number; // 0-100% (affects surface appearance)
  vibrationAmp: number; // mm/s
  showHousing?: boolean;
}
