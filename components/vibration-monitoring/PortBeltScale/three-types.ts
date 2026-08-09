export interface BeltScaleState {
  flowRate: number;
  vibrationIntensity: number;
  beltSpeed: number;
  totalWeight: number;
  loadCellStatus: 'normal' | 'warning' | 'error';
}
