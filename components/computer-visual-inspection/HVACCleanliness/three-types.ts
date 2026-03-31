export interface HVACStatus {
  dustLevel: number; // 0-1
  moldDetected: boolean;
  blockageRatio: number;
  airFlow: number;
  humidity: number;
  robotPosition: number; // 0-1 along the pipe
}
