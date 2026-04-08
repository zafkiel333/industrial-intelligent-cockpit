export interface ReversePowerState {
  activePower: number; // kW, positive is generating, negative is motoring
  breakerClosed: boolean;
  fuelInput: number; // 0 to 100 %
  tripTime: number; // seconds
}
