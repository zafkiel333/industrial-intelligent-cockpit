export interface ChainState {
  tension: number; // 0 to 100
  step: number; // 0: Broken, 1: Tensioning, 2: Connected
}
