export interface TransitionData {
  phase: 'pumping' | 'generating' | 'transitioning' | 'standby';
  vibrationX: number;
  vibrationY: number;
  vibrationZ: number;
  guideBearingVib: number;
  thrustBearingVib: number;
  waterPressure: number;
  speed: number;
}
