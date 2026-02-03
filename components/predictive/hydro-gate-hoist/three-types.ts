
export interface HoistSceneProps {
  extension: number; // 0-100% (Stroke)
  pressureHead: number; // MPa (affects cylinder expansion/color)
  pressureRod: number; // MPa
  sealWear: number; // 0-100% (affects leak particles)
  rodScore: number; // 0-100% (affects rod texture/roughness)
  temperature: number; // Celsius (affects heat map color)
  isMoving: boolean;
}
