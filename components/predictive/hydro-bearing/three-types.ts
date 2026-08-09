
export interface BearingSceneProps {
  rpm: number;
  padTemperatures: number[]; // Temperature for each thrust pad (e.g., 12 pads)
  oilFilmThickness: number; // Global average thickness scale
  selectedPadIndex?: number | null;
  onPadSelect?: (index: number) => void;
  showOilFlow?: boolean;
}
