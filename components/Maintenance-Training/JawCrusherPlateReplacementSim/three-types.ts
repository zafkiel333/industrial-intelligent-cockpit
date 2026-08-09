export interface CrusherState {
  step: number; // 0: Normal, 1: Unbolting, 2: Flipping, 3: Re-bolting, 4: Done
  wearLevel: number; // 0 to 100
}
