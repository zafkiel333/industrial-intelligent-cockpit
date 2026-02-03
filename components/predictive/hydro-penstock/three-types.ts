
export interface PenstockSceneProps {
  pressure: number; // MPa, affects pipe expansion/stress color
  flowRate: number; // m3/s, affects particle speed
  stressFactor: number; // 0-1, intensity of stress map
  vibration: number; // 0-1, shake intensity
  showInternal: boolean; // Transparency toggle
  waterHammerPulse: number; // 0-1 position of a pressure pulse traveling
  jointDisplacement: number; // mm, extension of expansion joint
}
