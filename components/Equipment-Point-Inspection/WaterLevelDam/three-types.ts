export interface WaterLevelDamProps {
  waterLevel: number; // Current water level in meters
  damStress: number; // Stress level 0-100
  seepageRate: number; // L/s
  isAlert: boolean;
}
