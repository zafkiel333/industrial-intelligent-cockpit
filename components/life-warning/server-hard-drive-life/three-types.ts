export interface HardDriveState {
  temperature: number; // Celsius
  tbw: number; // Terabytes Written
  badSectors: number; // count
  vibration: number; // G (acceleration)
  powerOnHours: number; // hours
}
