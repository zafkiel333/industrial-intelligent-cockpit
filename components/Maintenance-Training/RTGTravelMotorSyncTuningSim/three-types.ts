export interface RTGTravelState {
  speedLeft: number; // 0 to 100
  speedRight: number; // 0 to 100
  syncError: number; // Difference in distance
  isTuning: boolean;
}
