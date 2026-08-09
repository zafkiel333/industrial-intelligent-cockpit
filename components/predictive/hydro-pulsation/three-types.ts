
export interface PulsationSceneProps {
  vortexIntensity: number; // 涡带强度 (0-1)
  swirlSpeed: number;      // 旋流速度 (Rad/s)
  pressurePulse: number;   // 压力脉动幅值 (0-1)
  isUnstableZone: boolean; // 是否处于不稳定运行区
  viewMode: 'fluid' | 'structure' | 'thermal';
}
