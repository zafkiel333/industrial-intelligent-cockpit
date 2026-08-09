export interface LubricationThreeProps {
  level: number; // 0 to 1 (Tank Fill Level)
  color: string; // Hex color of the fluid
  isFlowing: boolean; // Toggle flow animation
  viscosity: number; // Affects bubble speed
}