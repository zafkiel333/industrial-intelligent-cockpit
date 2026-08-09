
export interface CouplingSceneProps {
  fluidVelocity: number;    // 流体流速 (m/s)
  vibrationAmp: number;     // 机械振动幅值 (um)
  electromagneticStress: number; // 电磁应力指数 (0-1)
  couplingIntensity: number; // 耦合强度 (0-1)
  isResonating: boolean;    // 是否处于共振临界区
  viewMode: 'total' | 'fluid' | 'mechanical' | 'electrical';
}
