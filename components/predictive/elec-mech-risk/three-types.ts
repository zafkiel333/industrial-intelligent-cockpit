
export interface ElecMechSceneProps {
  magneticFluxDensity: number; // 磁密强度 (0-1)
  airGapEccentricity: number;  // 气隙偏心率 (0-1)
  vibrationIntensity: number;  // 振动强度 (0-1)
  rotationSpeed: number;       // 旋转速度
  isExcited: boolean;          // 是否励磁
  showFluxLines: boolean;      // 是否显示磁感线
  faultActive: boolean;        // 是否触发故障动画
}
