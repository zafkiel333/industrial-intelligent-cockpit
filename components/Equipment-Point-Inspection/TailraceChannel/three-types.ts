export interface TailraceChannelProps {
  waterLevel: number; // meters
  flowVelocity: number; // m/s
  turbulence: number; // 0-100 scale
  isAlert: boolean;
}
