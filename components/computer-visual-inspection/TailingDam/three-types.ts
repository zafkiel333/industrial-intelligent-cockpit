export interface DamStatus {
  beachLength: number; // meters
  saturationLine: number; // meters (depth)
  waterLevel: number; // meters
  displacement: number; // mm
  rainfall: number; // mm/h
  safetyFactor: number; // 0-2
  lastSurvey: string;
}
