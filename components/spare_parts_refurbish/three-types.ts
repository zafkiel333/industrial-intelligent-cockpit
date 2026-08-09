
export interface RefurbishProps {
  stage: 'scanning' | 'cladding' | 'machining' | 'finished';
  progress: number; // 0-100
  laserPower: number; // 0-100
  temperature: number; // Celsius
  partType: 'shaft' | 'gear';
}
