export interface HoseStatus {
  pressure: number;
  agingLevel: number; // 0-1
  leakDetected: boolean;
  leakPosition: { x: number; y: number; z: number };
  flowRate: number;
  temperature: number;
}
