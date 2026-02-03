
export interface ShaftSceneProps {
  rpm?: number; // Rotation speed
  runoutX?: number; // Vibration displacement X
  runoutY?: number; // Vibration displacement Y
  oilFilmThickness?: number; // Visual scale for gap
  padTemperatures?: number[]; // Array of temp for each thrust pad
  showOilFlow?: boolean;
}
