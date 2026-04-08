export interface ConveyorState {
  deviation: number; // -100 (left) to 100 (right)
  isAutoTuning: boolean;
  speed: number; // 0 to 100
}
