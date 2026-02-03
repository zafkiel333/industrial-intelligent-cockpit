
export interface BearingRoller {
  id: number;
  angle: number;
  stress: number; // 0-1, affects color (stress concentration)
}

export interface SwingBearingSceneProps {
  rotationAngle: number;    // 当前回转角度 (degrees)
  tiltAngleX: number;       // 倾覆力矩导致的X轴倾斜
  tiltAngleZ: number;       // 倾覆力矩导致的Z轴倾斜
  wearLevel: number;        // 0-100% 磨损程度 (影响表面粗糙度/颜色)
  stressHotspots: number[]; // 角度列表 (0-360)，表示应力集中区域
  lubricationStatus: number;// 0-1, 1为良好，0为干摩擦
  viewMode: 'solid' | 'stress' | 'transparent';
}
