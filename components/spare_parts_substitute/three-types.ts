export interface SubstituteThreeProps {
  originalType: 'bearing' | 'valve' | 'gear' | 'shaft';
  substituteType: 'bearing' | 'valve' | 'gear' | 'shaft';
  matchScore: number; // 0-100
  isScanning: boolean;
}